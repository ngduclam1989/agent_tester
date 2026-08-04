---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-notification (provider)"
provider: "gf-notification"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-notification` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-notification` (in-app notification + push delivery service: INAPP / PUSH / BOTH channels).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-notification`** — In-app notification + push delivery owner (theo ADR-001). Channels: INAPP / PUSH / BOTH. Không xử lý SMS/Email/Zalo (đó là gf-marketing). |
| Provider docs | [Architecture/api/gf-notification-api.md](../api/gf-notification-api.md), [Architecture/hld/gf-notification-HLD.md](../hld/gf-notification-HLD.md) |
| Used by boundary | **REST**: `gf-erp-agent`, `gf-inventory`; **Kafka**: `gf-sales` |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | `gf-notification.url=${GF_NOTIFICATION_URL}` (or `gf-notification-service.url` per caller) |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (notification dispatch) |

### Caller config

| Caller | Path | Client class | Config property |
|---|---|---|---|
| `gf-erp-agent` | REST | `GfNotificationClient.java` | `gf-notification-service.url` |
| `gf-inventory` | REST | `NotificationClient.java` | `gf-notification.url` |
| `gf-sales` | Kafka | `NotificationRequestProducer.java` | `${NOTIFICATION_REQUEST_TOPIC}` |

> **Note**: `gf-marketing` có `GfNotificationClient.java` + `SendNotificationRequest` nhưng schema incompatible với server `NotificationRequestDto` — dead code, không active.

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-notification phục vụ:
- **gf-erp-agent** (REST): notify ERP message events (status change) → in-app + push
- **gf-inventory** (REST): notify stock alerts, delivery completion → in-app + push
- **gf-sales** (Kafka): notify booking events (created, cancelled, auto-cancelled) → in-app + push

**Why**: gf-notification là in-app notification + push delivery owner (ADR-001). Service nhận structured notification request, render Mustache template, fan-out in-app inbox per user, và publish push delivery payload lên Kafka cho downstream FCM/SNS. Không trực tiếp xử lý SMS/Email/Zalo — đó là trách nhiệm của gf-marketing qua Temporal workflows riêng.

**Ref**: ADR-001, ADR-004 (Kafka — gf-sales dùng event path song song với REST path).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | **REST**: `x-api-key` header (`INTERNAL_API_KEY`). **Kafka**: no auth (internal topic) |
| Tenant resolution | Body field `recipient.tenantId` (in `NotificationRequestDto`) |

---

## 4. Endpoints / Operations Used

### REST endpoints

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Create notification | POST | `/protected/v1/notifications` | gf-erp-agent, gf-inventory | State change events, stock alerts |
| 2 | Create template | POST | `/protected/v1/notifications/template` | (no active caller) | Template provisioning |

`NotificationRequestDto.channel` field: `INAPP` / `PUSH` / `BOTH`.

### Kafka path

| # | Operation | Topic | Used by | Trigger |
|---|---|---|---|---|
| 3 | Notification request event | `${NOTIFICATION_REQUEST_TOPIC}` | gf-sales (outbox) | Booking events (created, cancelled) |

---

## 5. Request / Response Contracts

### 5.1 Create notification (REST — Op #1)

**Request**:
```
POST /protected/v1/notifications
Headers: x-api-key
Content-Type: application/json
```
```json
{
  "notificationType": "BOOKING_CREATED",
  "channel": "BOTH",
  "placeholders": { "customerName": "Nguyen Van A", "bookingTime": "2026-05-19T10:00" },
  "campaign": null,
  "recipient": {
    "specificationsUser": {
      "userIds": ["iam-user-001"],
      "userType": "GARAGE"
    },
    "tenantId": 12345,
    "tenantType": "GARAGE",
    "isBroadcastAllTenant": false
  }
}
```

**Fields**:
- `notificationType`: enum (`BOOKING_CREATED`, `SALE_ORDER`, `ORDER_DELIVERING`, `INVENTORY_RECEIPT_COMPLETED`, etc.)
- `channel`: enum `INAPP` | `PUSH` | `BOTH` (optional, defaults vary)
- `recipient`: 3 priority levels — (1) explicit `specificationsUser.userIds`, (2) tenant-scoped, (3) broadcast all tenant
- `placeholders`: key-value map for Mustache template rendering

**Response**: `200 OK` with `ApiResponse<String>` → `"OK"`.

### 5.2 Create template (REST — Op #2)

**Request**:
```
POST /protected/v1/notifications/template
Headers: x-api-key
Content-Type: application/json
```
```json
{
  "notificationType": "BOOKING_CREATED",
  "titleTemplate": "Booking mới #{{bookingCode}}",
  "contentTemplate": "Khách {{customerName}} đặt lịch lúc {{bookingTime}}",
  "targetInfos": [
    {
      "clientType": "GARAGE",
      "targetRoute": "/bookings/detail",
      "paramKeys": ["bookingId"]
    }
  ]
}
```

**Response**: `200 OK` with `ApiResponse<String>` → `"OK"`.

### 5.3 Notification request event (Kafka — Op #3)

gf-sales publishes `KafkaMessageWrapper<NotificationRequestDto>` to `${NOTIFICATION_REQUEST_TOPIC}` (outbox pattern):
```json
{
  "notificationType": "BOOKING_CREATED",
  "channel": "BOTH",
  "placeholders": { "customerName": "Nguyen Van A" },
  "recipient": {
    "tenantId": 12345,
    "tenantType": "GARAGE"
  }
}
```

gf-notification consumes via `NotificationCreationConsumer` (group `gf-notification-group`, MANUAL_IMMEDIATE ack).

---

## 6. Failure Handling

**REST callers (gf-erp-agent, gf-inventory)**:

| Mode | Action |
|---|---|
| Network timeout / Provider 5xx | Synchronous call, no outbox/retry. Failure propagates to upstream handler |
| Provider 4xx (template not found) | Log error, skip notification |
| Provider 4xx (recipient invalid) | Log warning, skip notification |

**Kafka caller (gf-sales)**:

| Mode | Action |
|---|---|
| Kafka send failure | Outbox retry với exponential backoff |
| Consumer processing error | Kafka consumer retry theo group offset |

---

## 7. Idempotency & Ordering

| Path | Idempotency | Detail |
|---|---|---|
| **REST** (`POST /protected/v1/notifications`) | **NONE** | No messageId dedup. Duplicate REST calls create duplicate notifications |
| **Kafka** (notification-request topic) | **messageId dedup** | `InboxService.processIfNotDuplicate` — `KafkaMessageWrapper.messageId` as dedup key. Duplicate messages skipped |

Per-recipient ordering qua DB queue (NotificationDelivery).

---

## 8. Observability

| Metric | Tags |
|---|---|
| `<caller>.notification_client.requests` | `caller`, `channel` (INAPP/PUSH/BOTH), `status` |
| `<caller>.notification_client.duration` | `caller`, `channel` |
| `<caller>.notification_client.errors` | `caller`, `channel`, `error_code` |

Log per request: `correlation_id`, `tenantId`, `caller`, `notificationType`, `channel`, `recipient` (masked), `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 200ms cho enqueue (actual push delivery async qua Kafka → FCM/SNS).

---

## 10. PII / Compliance

PII transmitted: `userIds` (IAM user identifiers). Notification content (title/body rendered từ template + placeholders) có thể chứa tên, booking info. Audit log mandatory. PII masking trong log.

---

## 11. Sandbox vs Production

Env switchover via `GF_NOTIFICATION_URL` per caller. Sandbox push provider không gửi thật.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock NotificationClient / GfNotificationClient |
| Integration | Real gf-notification test instance + mock push provider |
| E2E | Booking event → gf-sales outbox → Kafka → gf-notification → assert in-app + push created |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-notification down (REST callers) | gf-erp-agent / gf-inventory REST calls fail synchronously; upstream handles error |
| gf-notification down (Kafka) | gf-sales outbox backlog grows; retry batch sau recovery |
| Push provider down | gf-notification NotificationDelivery queue retains; retry via delivery scheduler |
| Template not found | Verify template seeded in gf-notification DB via `POST /protected/v1/notifications/template` |

---

## 14. Forbidden patterns

- ❌ Callers ghi trực tiếp DB của `gf-notification` — phải qua protected API hoặc Kafka topic.
- ❌ Skip `x-api-key` header trên REST path — provider reject 401.
- ❌ Skip `recipient.tenantId` — cross-tenant notification dispatch.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full notification content raw (có thể chứa PII từ placeholders).
- ❌ Assume REST path có idempotency — REST `POST /protected/v1/notifications` KHÔNG dedup. Duplicate calls → duplicate notifications.
- ❌ Bypass Kafka `messageId` trên event path — gf-notification Inbox dedup theo messageId; skip → duplicate.
- ❌ Reuse `messageId` cross-tenant — collision trong Inbox table.
- ❌ Send `channel: "SMS"` / `"EMAIL"` / `"ZALO"` — gf-notification chỉ hỗ trợ INAPP / PUSH / BOTH. SMS/Email/Zalo là gf-marketing.

## 15. References

- HLD provider: [gf-notification-HLD.md](../hld/gf-notification-HLD.md)
- HLD callers: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-sales-HLD.md](../hld/gf-sales-HLD.md)
- API contract: [gf-notification-api.md](../api/gf-notification-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- KG: [gf-notification.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-notification.knowledge-graph.yaml) — 7 APIs (5 public + 2 internal), 13 BRs
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven — gf-sales dùng event path)
- Related INTEG: [INTEG-EXT-gf-hrms.md](INTEG-EXT-gf-hrms.md) (gf-notification gọi gf-hrms cho recipient lookup)
- Business Rules: BR-GF-NOTIFICATION-001 (template lookup), BR-GF-NOTIFICATION-003 (audience resolution), BR-GF-NOTIFICATION-008 (Kafka inbox idempotency), BR-GF-NOTIFICATION-013 (direct Kafka send, no outbox)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Cross-review sync với KG v4: sửa service identity từ "SMS/Email/Push/Zalo dispatch" sang "in-app + push delivery (INAPP/PUSH/BOTH)" đúng source code (D4); thay thế hoàn toàn §5.1 request schema — từ fabricated schema sang actual NotificationRequestDto (D3); thêm endpoint create-template §5.2 (D1); thêm Kafka path §5.3 cho gf-sales (D12); loại gf-marketing khỏi REST callers (dead code — SendNotificationRequest incompatible với server DTO) (D11); rewrite caller table: REST gf-erp-agent/gf-inventory, Kafka gf-sales (D2); sửa §6 failure handling per-caller (REST sync no outbox, Kafka outbox) (D9); sửa §7 idempotency — REST KHÔNG có dedup, Kafka có Inbox messageId dedup (D10); thêm KG link + BR references §15 (D8). |
| 2026-05-11 | v1.1 | Fix §5 Response contract: sửa từ `ApiResponse<NotificationResponse>` (notificationId + QUEUED) → `ApiResponse<String>` ("OK") theo InternalNotificationController source code. KG không cần sửa. |
| 2026-05-07 | v1 | Initial integration contract. |
