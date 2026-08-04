---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: notification
last_reviewed: "2026-05-07"
---

# Events - `notification` boundary

> Producer = `gf-notification`. Boundary này tạo delivery payload từ `notification_deliveries` table và publish sang topic notification cho downstream provider.
>
> Source KHÔNG có event trạng thái delivery dạng `NotificationDeliveryChanged`; trạng thái delivery `PENDING/SENDING/SENT/FAILED` là trạng thái DB nội bộ.
>
> Consume từ producer khác (per [`_CONVENTIONS.md §12`](_CONVENTIONS.md) discovery semantics, KHÔNG document trong file này):
> - `NotificationRequested` ← [gf-sales-events.md](gf-sales-events.md) §2 — `NotificationCreationConsumer` parse `KafkaMessageWrapper`, dedup inbox theo `messageId`, gọi `notificationService.createNotification`.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-notification` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.notification.*` (planned) |
| Total events outbound | 1 (`NotificationCreatedForDelivery` raw payload) |
| Reliability | `notification_deliveries` claim/send status; Kafka consumer (cho inbound từ gf-sales) retry/DLT bằng Spring `DefaultErrorHandler` |
| Canonical envelope | Raw JSON `NotificationCreatedDto`, KHÔNG có `messageId`/`headers`/`eventType` |

Ghi chú source-aligned:

- `NotificationDeliveryServiceImpl` claim row từ `notification_deliveries`, publish `data` nguyên trạng bằng `KafkaTemplate<String, String>` vào `${kafka.topics.notification}`, key là `delivery.id`.
- Khi publish thành công, row delivery chuyển `SENT`; khi vượt `maxAttempts`, row chuyển `FAILED`. Source hiện không publish event riêng cho trạng thái này.

---

## 2. Catalog

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `NotificationCreatedForDelivery` | `AC-NONPROD-DEV-NOTIFICATION` | `NotificationDeliveryJob` claim delivery row và publish `NotificationCreatedDto` | External/unknown downstream | ≤ 30s | `source-aligned-producer-only` | raw DTO, không wrapper |

---

## 3. Schemas

### 3.1 `NotificationCreatedForDelivery`

**Trigger**: `NotificationServiceImpl` tạo `NotificationDelivery` row cho channel `PUSH` hoặc `BOTH`. `NotificationDeliveryJob` (theo `scheduler.notification.delivery-job.fixed-delay`) claim row `PENDING` hoặc `SENDING` quá `lock_until` → publish.

Source call-site:
- `NotificationServiceImpl.createNotification` — entry tạo delivery row khi channel = PUSH/BOTH.
- `NotificationDeliveryJob` (scheduled) → `NotificationDeliveryRepository.claimBatch` claim batch → `NotificationDeliveryServiceImpl` publish.

**Payload** (Kafka value JSON string `NotificationDelivery.data` từ `NotificationCreatedDto`):
```json
{
  "title": "Thông báo",
  "content": "Nội dung đã render",
  "userIds": ["iam-user-id"],
  "tenantId": 0,
  "tenantType": "GARAGE",
  "createdAt": "2026-05-04T15:00:00",
  "targetClient": "GARAGE|CARDOCTOR",
  "targetRoute": "/route",
  "routeParams": "{\"requestId\":123}",
  "type": "SYSTEM"
}
```

Ràng buộc contract:
- KHÔNG có `eventId`, `eventType`, `headers`, `timestamp` trong Kafka payload outbound.
- `createdAt` là `LocalDateTime`; một số nhánh set `createdAt.atOffset(ZoneOffset.ofHours(7)).toLocalDateTime()`, một số nhánh không set.
- `routeParams` là JSON string, không phải JSON object.

**Idempotency**:
- Producer: `NotificationDeliveryRepository.claimBatch` claim row `PENDING/SENDING` (lock 30 giây), set `status=SENDING`, tăng `attempt_count`. Publish thành công → `SENT`. `attemptCount > maxAttempts` sau claim → `FAILED`. Catch lỗi publish hiện chỉ log; mark-failed-on-error đang comment, retry phụ thuộc `SENDING` hết lock + `maxAttempts`.
- Consumer: chưa có confirmed downstream consumer trong source `garage`.

**Critical use case**: Outbound topic `AC-NONPROD-DEV-NOTIFICATION` là **delivery command/payload** cho downstream provider (push FCM/SMS/email lambda) — KHÔNG phải status change event. Downstream KHÔNG đọc `headers`/`eventType` vì source chưa gửi.

---

## 4. Forbidden patterns

- ❌ Publish provider credential/token trong delivery `data`.
- ❌ Log full recipient/placeholders nếu chứa PII.
- ❌ Retry provider/downstream failure vô hạn ngoài `scheduler.notification.delivery-job.max-attempts`.
- ❌ Mô tả outbound `AC-NONPROD-DEV-NOTIFICATION` là `NotificationDeliveryChanged`; source publish raw `NotificationCreatedDto`, không phải status event.
- ❌ Yêu cầu downstream đọc `headers`/`eventType` từ outbound notification topic khi source chưa gửi các field đó.
- ❌ Coi DLT runtime là replay-ready nếu chưa có runbook/audit và topic destination rõ.
- ❌ Assume notification stage `PROCESSING` trong in-app job sẽ tự retry; source claim lại chỉ lọc `BUILDING_INAPP`.
- ❌ Tạo inbound section trong file này cho `NotificationRequested` (producer = `gf-sales`) — vi phạm producer-view discipline (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)). Consumer concern (`NotificationCreationConsumer` parse wrapper, inbox dedup theo `messageId`, `DefaultErrorHandler` retry/DLT) document tại [gf-sales-events.md](gf-sales-events.md) §2.

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Producer file của event mà boundary này consume:
  - [gf-sales-events.md](gf-sales-events.md) — `NotificationRequested`
- Workflow files:
  - `notification-dispatch-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `notification` boundary: 1 outbound `NotificationCreatedForDelivery` trên `AC-NONPROD-DEV-NOTIFICATION` publish raw `NotificationCreatedDto` (KHÔNG có `eventId`/`eventType`/`headers`/`timestamp`); reliability `notification_deliveries` claim/send pattern với `NotificationDeliveryJob` scheduled, status `PENDING/SENDING/SENT/FAILED` nội bộ DB (KHÔNG publish status event); KHÔNG có `NotificationDeliveryChanged`. Bao gồm producer summary, catalog 1 row, schema 4-part, forbidden patterns, references. |
