---
type: architecture
artifact_kind: workflow
status: ACTIVE
version: 1
tier: T3
owner_authority: Architecture Authority
boundary: cross-boundary
last_reviewed: "2026-05-11"
---

# Workflow — Batch Outbound Notification (ERP Outbound → User Notification)

> Cron-driven HTTP job 15s tick (offset 5s, staggered vs `BATCH_INBOUND_NOTIFICATION`): `gf-worker` → `gf-erp-agent` `POST /protected/v1/batch/outbound-notification` để dispatch in-app notification cho `OutboundMessage` đã `COMPLETED` nhưng `is_notified=false`. Chỉ 3 loại message support notification: `QUOTATION_ASK`, `CREATE_PURCHASE_REQUEST`, `DELIVERED_SHIPMENT_ORDER`. Cornerstone của BR-GF-WORKER-001..008.

## 1. Trigger

- Spring `TaskScheduler` cron trong `gf-worker` (`DynamicJobProcessor`) — `5/15 * * ? * *` (mỗi 15s, offset 5s) `Asia/Ho_Chi_Minh`.
- Seed Flyway `V1.0.1` (job + endpoint) + `V1.0.4` (cron stagger): `job_name=BATCH_OUTBOUND_NOTIFICATION`, `target_service=gf-erp-agent`, `http_method=POST`, `retry_count=1`, `timeout_seconds=300`.
- Startup load + sync `JobConfig` 30s; mỗi `job_name` chạy trên 1 virtual-thread riêng qua `VirtualThreadTaskScheduler`.

## 2. Actors

- Spring `TaskScheduler` (cron firing trong `gf-worker`)
- `gf-worker` (`DynamicJobProcessor`, `GenericHttpJobExecutorServiceImpl`, `GenericHttpClientFactory`) + `gf-worker DB` (`job_config`, `schedule_history`)
- `gf-erp-agent` (`InternalBatchController`, `OutboundMessageService`, `NotificationMessageService`) + `outbound_message` table (status × `is_notified` × `attempt_count`)
- `gf-notification` — REST sync `POST /api/v1/notifications` (in-app dispatch per tenant)
- Resilience4j CB `generic-http-client` + semaphore `worker.job.max-concurrent-jobs:50`.

## 3. Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Cron as Spring TaskScheduler
    participant W as gf-worker
    participant DB_W as gf-worker DB
    participant EA as gf-erp-agent
    participant DB_EA as outbound_message DB
    participant N as gf-notification

    rect rgb(245, 248, 255)
    note over Cron,DB_W: Path 1 — Worker tick (5/15 cron, offset 5s)
    Cron->>W: fire BATCH_OUTBOUND_NOTIFICATION
    W->>DB_W: re-read JobConfig (BR-GF-WORKER-004)
    alt inactive
        W-)Cron: skip tick + log
    else active
        W->>W: semaphore.tryAcquire() (max=50)
        W->>DB_W: ScheduleHistory INSERT (OPEN → PROCESSING)
    end
    end

    rect rgb(255, 255, 245)
    note over W,EA: Path 2 — HTTP call (retry=1, timeout=300s)
    W->>W: build URL + headers + resolve ${internal-service.api-key} + mask key|token|auth
    loop attempt ≤ retry_count+1
        W->>EA: POST /protected/v1/batch/outbound-notification
        alt HTTP 503
            EA-->>W: 503 → ServiceUnavailableException → CB record
        else 2xx
            EA-->>W: 200 ApiResponse<List<BatchResponse>>
        end
    end
    end

    rect rgb(250, 245, 255)
    note over EA,N: Path 3 — gf-erp-agent processing (SKIP LOCKED batch=10)
    EA->>DB_EA: findAndLockUnnotifiedMessages (FOR UPDATE SKIP LOCKED)
    DB_EA-->>EA: rows status=COMPLETED AND is_notified=false AND attempt_count<max ORDER processed_at ASC
    loop per row
        alt type ∈ {QUOTATION_ASK, CREATE_PURCHASE_REQUEST, DELIVERED_SHIPMENT_ORDER}
            EA->>EA: handleNotification() build NotificationRequestDto{channel, recipient{tenantId, GARAGE}, placeholders}
            EA->>N: POST /api/v1/notifications (sync)
            alt 2xx
                EA->>DB_EA: UPDATE is_notified=true
            else 4xx / 5xx / timeout
                EA->>DB_EA: attempt_count++ ; if ≥ max → status=NOTIFIED_FAILED
            end
        else parse error
            EA->>DB_EA: status=NOTIFIED_FAILED (early)
        else other type
            EA->>EA: skip silent (success=true)
        end
    end
    EA-->>W: 200 ApiResponse<List<BatchResponse{key, success}>>
    end

    rect rgb(255, 248, 245)
    note over W,DB_W: Path 4 — Worker post-call
    W->>DB_W: ScheduleHistory PROCESSED (truncate 5000) ‖ ERROR (truncate 2000) khi exhausted/CB open
    W->>W: semaphore.release()
    end
```

## 4. State machine intersection

| Service | Entity | Transition |
|---|---|---|
| `gf-worker` | `ScheduleHistory` | `OPEN` → `PROCESSING` (× attempts) → `PROCESSED` / `ERROR` |
| `gf-worker` | `JobConfig` | Re-read mỗi tick (BR-GF-WORKER-004); inactive → skip |
| `gf-erp-agent` | `OutboundMessage` (notification) | `(COMPLETED, is_notified=false)` → `(COMPLETED, is_notified=true)` ‖ `(NOTIFIED_FAILED, is_notified=false)` khi `attempt_count ≥ max` hoặc parse-error |
| Resilience4j | CB `generic-http-client` | `CLOSED` → `OPEN` khi HTTP 503 vượt threshold → `HALF_OPEN` |

## 5. Idempotency

- `is_notified=true` flag = idempotent key; query subsequent tự loại trừ row đã notify. `FOR UPDATE SKIP LOCKED` đảm bảo multi-replica `gf-erp-agent` không double-notify trong cùng tick.
- `attempt_count` bounded bởi `maxRetryAttempts`; vượt → `NOTIFIED_FAILED` terminal.
- Worker semaphore + `schedule_history` tránh overlap tick (max 50 concurrent); re-read `JobConfig` trước execute → toggle inactive có hiệu lực ngay (BR-GF-WORKER-004).

## 6. Error paths

| Error | Handling |
|---|---|
| HTTP 503 từ `gf-erp-agent` | `ServiceUnavailableException` → CB `generic-http-client` (BR-GF-WORKER-008) |
| 5xx / timeout HTTP khác | Retry `1000ms × attempt`, tổng 2 attempt (BR-GF-WORKER-006) |
| Bulkhead / semaphore full | `BulkheadFullException` → `ERROR` ‖ skip tick + log warning |
| `JobConfig` inactive runtime | Skip tại re-read (BR-GF-WORKER-004) |
| `gf-notification` 4xx / 5xx / timeout | `success=false` → `attempt_count++`; `≥ max` → `NOTIFIED_FAILED` |
| Payload JSON parse error | Catch sớm → `NOTIFIED_FAILED` ngay |
| `message_type` không support | Skip lặng, `success=true` để không lặp |

## 7. References

- **UX flow**: _(N/A — system cron job, không có UX trực tiếp)_
- **HLD**: [gf-worker-HLD.md](../hld/gf-worker-HLD.md), [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-notification-HLD.md](../hld/gf-notification-HLD.md)
- **API**: [gf-worker-api.md](../api/gf-worker-api.md), [gf-erp-agent-api.md](../api/gf-erp-agent-api.md), [gf-notification-api.md](../api/gf-notification-api.md)
- **Events**: [gf-notification-events.md](../events/gf-notification-events.md)
- **Business rules**: [BR-GF-PURCHASE.md](../../Product/business-rules/BR-GF-PURCHASE.md)
- **Product features**: _(N/A — ERP notification layer, không map trực tiếp tới product feature)_

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-11 | v1 | Initial workflow spec cho `batch-outbound-notification`: cron HTTP job `gf-worker` (`BATCH_OUTBOUND_NOTIFICATION`, cron `5/15 * * ? * *` offset 5s vs `BATCH_INBOUND_NOTIFICATION`, retry=1, timeout=300s, target `gf-erp-agent` `POST /protected/v1/batch/outbound-notification`). Pipeline `DynamicJobProcessor` → `GenericHttpJobExecutorServiceImpl` (ScheduleHistory `OPEN → PROCESSING → PROCESSED/ERROR`) → `GenericHttpClientFactory` (URL build + header mask + CB `generic-http-client` trên HTTP 503). `gf-erp-agent` xử lý batch=10 qua `findAndLockUnnotifiedMessages` (`FOR UPDATE SKIP LOCKED`, filter `status=COMPLETED AND is_notified=false AND attempt_count<max`); dispatch 3 message_type `QUOTATION_ASK`, `CREATE_PURCHASE_REQUEST`, `DELIVERED_SHIPMENT_ORDER` → `gfNotificationClient.createNotification` sync. State transitions OutboundMessage notification axis: success `is_notified=true`; failure `attempt_count++` → max-retry `NOTIFIED_FAILED`. Idempotent qua `is_notified` flag + SKIP LOCKED multi-replica safe. Cornerstone BR-GF-WORKER-001, 003, 004, 005, 006, 007, 008. |
