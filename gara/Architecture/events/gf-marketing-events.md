---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: marketing
last_reviewed: "2026-05-07"
---

# Events - `marketing` boundary

> Producer = `gf-marketing`. Boundary này phát event campaign, voucher, voucher-program và message qua outbox. Self-consume `VoucherProgramLifecycleChanged` để chạy Temporal voucher workflow.
>
> Consume từ producer khác (per [`_CONVENTIONS.md §12`](_CONVENTIONS.md) discovery semantics, KHÔNG document trong file này):
> - `BookingCompleted` ← [gf-sales-events.md](gf-sales-events.md) §2 — `BookingCompletedConsumer` kích hoạt campaign loại `TRIGGERED` theo segment.
>
> Có 1 external-source inbound documented ở §2.2 (`MessageDeliveryChanged` từ lambda/provider — boundary owns schema mirror).

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-marketing` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.marketing.*` (planned) |
| Total events | 4 outbound + 1 external-source inbound (lambda `MessageDeliveryChanged`) |
| Reliability | Scheduled outbox + retry + Redis lock; consumer manual ack; inbox dedup cho voucher-program, message status |
| Outbox key | `aggregateType + "-" + aggregateId` |
| Canonical envelope | Phần lớn lifecycle event là raw JSON DTO từ `OutboxPublisher`; riêng `SendMessageEvent` được bọc bằng `SendMessageMessage extends com.actechx.common.messaging.Message` trước khi lưu outbox |

Source hiện tại publish bằng `KafkaTemplate<String, String>.send(topic, key, event.payload())`; topic được resolve từ `eventType` trong `OutboxProcessor`, KHÔNG lấy topic từ chính outbox row.

---

## 2. Catalog

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `CampaignLifecycleChanged` | `AC-DEV-CAMPAIGN-TOPIC` | Campaign created/scheduled/started/paused/resumed/completed/cancelled | External/unknown | ≤ 30s | `source-aligned-producer-only` | 7 sub-types theo `eventType` |
| 2 | `VoucherLifecycleChanged` | `AC-DEV-VOUCHER-TOPIC` | Voucher created/claimed/redeemed/expired | External/unknown | ≤ 30s | `source-aligned-producer-only` | 4 sub-types; `VoucherExpired` chỉ có constant |
| 3 | `VoucherProgramLifecycleChanged` | `AC-DEV-VOUCHER-PROGRAM-TOPIC` | Voucher program created/activated/cancelled/expired | `gf-marketing` `TriggerEventConsumer` (self-consume) | ≤ 5s | `confirmed-two-sided` | self-consume kick Temporal voucher workflow |
| 4 | `SendMessageRequested` | `AC-DEV-MESSAGE-TOPIC` | Campaign/wave cần gửi message tới customer | External/lambda + `gf-customer` `InteractionConsumer` | ≤ 30s | `confirmed-two-sided` | step `MESSAGE.SEND.1` |

### 2.2 Inbound — external-source

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 5 | `MessageDeliveryChanged` | `AC-DEV-MESSAGE-TOPIC` | External: lambda/provider notification | `gf-marketing` `MessageSendConsumer` route theo `MessageStep=MESSAGE.SEND.2`; update `CampaignMessage.status` (SENT/DELIVERED/OPENED/CLICKED/FAILED/BOUNCED) | ≤ 30s | `consumer-only-confirmed` | ack-on-error: lỗi domain bị catch không throw |


| Config key | Default topic |
|---|---|
| `kafka.topics.campaign-events` | `AC-DEV-CAMPAIGN-TOPIC` |
| `kafka.topics.voucher-events` | `AC-DEV-VOUCHER-TOPIC` |
| `kafka.topics.voucher-program-events` | `AC-DEV-VOUCHER-PROGRAM-TOPIC` |
| `kafka.topics.message-events` | `AC-DEV-MESSAGE-TOPIC` |

---

## 3. Schemas

### 3.1 `CampaignLifecycleChanged`

**Trigger**: Source publish raw DTO qua `OutboxPublisher.publishCampaignEvent(...)` cho 7 sub-type lifecycle.

**Payload** (raw DTO base):
```json
{
  "campaignId": 0,
  "tenantId": 0,
  "code": "string",
  "name": "string",
  "type": "ONE_TIME|RECURRING|TRIGGERED",
  "scheduledAt": "ISO-8601|null",
  "createdBy": "string|null",
  "createdAt": "ISO-8601"
}
```

Sub-types có field bổ sung:

| `eventType` | Field bổ sung |
|---|---|
| `CampaignCreated` | `type`, `scheduledAt`, `createdBy`, `createdAt` |
| `CampaignScheduled` | `scheduledAt`, `updatedBy`, `updatedAt` |
| `CampaignStarted` | `totalRecipients`, `updatedBy`, `startedAt` |
| `CampaignPaused` | `updatedBy`, `pausedAt` |
| `CampaignResumed` | `updatedBy`, `resumedAt` |
| `CampaignCompleted` | `totalRecipients`, `sentCount`, `deliveredCount`, `updatedBy`, `completedAt` |
| `CampaignCancelled` | `previousStatus`, `updatedBy`, `cancelledAt` |

Lưu ý source: `CampaignResumed` publish bằng literal `"CampaignResumed"`, nhưng `OutboxProcessor.resolveTopicFromEventType(...)` chưa map constant này → fallback `default → campaignEvents`, topic vẫn là `campaign-events` nhưng không có mapping tường minh.

**Idempotency**:
- Producer: outbox table key `Campaign-{campaignId}`.
- Consumer: external/unknown — chưa verify dedup downstream.

### 3.2 `VoucherLifecycleChanged`

**Trigger**: Source publish raw DTO qua `OutboxPublisher.publishVoucherEvent(...)` cho 4 sub-type.

**Payload** (raw DTO base):
```json
{
  "voucherId": 0,
  "tenantId": 0,
  "voucherCode": "string",
  "customerId": 0,
  "voucherProgramId": 0,
  "expiresAt": "ISO-8601|null",
  "createdAt": "ISO-8601|null",
  "claimedAt": "ISO-8601|null",
  "redeemedAt": "ISO-8601|null"
}
```

Sub-types:

| `eventType` | Field chính |
|---|---|
| `VoucherCreated` | `voucherProgramId`, `voucherCode`, `customerId`, `expiresAt`, `createdAt` |
| `VoucherClaimed` | `voucherCode`, `customerId`, `programId`, `campaignId`, `claimedAt` |
| `VoucherRedeemed` | `voucherCode`, `customerId`, `voucherProgramId`, `redeemedAt` |
| `VoucherExpired` | constant + topic resolver, chưa có producer path trực tiếp |

**Idempotency**: outbox key `Voucher-{voucherId}`.

### 3.3 `VoucherProgramLifecycleChanged`

**Trigger**: Source publish raw DTO qua `OutboxPublisher.publishVoucherProgramEvent(...)`. `gf-marketing` self-consume cùng topic để kick voucher workflow.

**Payload** (raw DTO `VoucherProgramCreated`):
```json
{
  "programId": 0,
  "tenantId": 0,
  "name": "string",
  "voucherType": "FIXED_DISCOUNT|PERCENTAGE_DISCOUNT",
  "discountValue": 0,
  "totalQuantity": 0,
  "startDate": "ISO-8601",
  "endDate": "ISO-8601",
  "createdBy": "string|null",
  "createdAt": "ISO-8601"
}
```

Variants `VoucherProgramActivated` / `VoucherProgramCancelledOrExpired`:
```json
{
  "eventId": "string",
  "programId": 0,
  "tenantId": 0,
  "name": "string",
  "status": "ACTIVE|CANCELLED|EXPIRED",
  "updatedBy": "string|null",
  "isActivated": true,
  "isCancelledOrExpired": false
}
```

Self-consumer `TriggerEventConsumer` infer event type bằng field đặc trưng:

| Điều kiện payload | Event source |
|---|---|
| `"isActivated":true` | `VoucherProgramActivated` |
| Có `totalQuantity`, `voucherType`, `validFrom` | `VoucherProgramCreated` |
| `"isCancelledOrExpired":true` | `VoucherProgramCancelledOrExpired` |

**Risk**: DTO `VoucherProgramCreatedEvent` serialize `startDate`/`endDate`, trong khi consumer check `"validFrom"` → nhánh `VoucherProgramCreated` không nhận diện đúng, hiện chỉ log `no action needed`.

**Idempotency**:
- Producer: outbox key `VoucherProgram-{programId}`.
- Consumer: dedup theo `event.eventId`; workflow start guard tại `WorkflowStarter`.

**Critical use case**: Self-consume → kick Temporal voucher generation/cancellation workflow (xem §4). Activated path generate vouchers; Cancelled/Expired path cancel pending workflow.

### 3.4 `SendMessageRequested`

**Trigger**: `MessageTemplateServiceImpl.sendMessageViaChannelDto(...)` luồng campaign/wave.
Source flow:
1. Tạo `SendMessageEvent`.
2. Serialize thành `rawData`.
3. Bọc vào `SendMessageMessage(rawData, "gf-marketing", "SendMessageEvent", "MESSAGE", "MESSAGE.SEND.1", tenantId, null)`.
4. Lưu outbox với `eventType=SendMessageEvent`.
5. `OutboxProcessor` publish sang `AC-DEV-MESSAGE-TOPIC`.

**Payload** (Kafka value `SendMessageMessage` + headers `MessageGroup=MESSAGE`, `MessageStep=MESSAGE.SEND.1`; `data` là JSON string):
```json
{
  "eventId": "uuid",
  "tenantId": 0,
  "campaignId": 0,
  "customerId": 0,
  "campaignMessageId": 0,
  "externalId": "uuid",
  "channel": "SMS|EMAIL|PUSH|ZALO",
  "subject": "string|null",
  "content": "string",
  "scheduledAt": "ISO-8601",
  "recipient": "string",
  "attachments": [
    {
      "contentId": "qrcode",
      "filename": "qrcode.png",
      "contentType": "image/png",
      "base64Data": "string"
    }
  ]
}
```

`gf-customer` consume cùng topic trong `InteractionConsumer` để tạo interaction outbound, nhưng skip event có `MessageStep=MESSAGE.SEND.2`.

**Idempotency**:
- Producer: outbox + headers wrapper.
- Consumer: `gf-customer` `InboxService.processIfNotDuplicate(eventId, "INTERACTION_CREATED", ...)`. External lambda dedup theo `externalId`.

### 3.5 `MessageDeliveryChanged` _(inbound external-source)_

**Producer source**: External lambda/provider notification — trả trạng thái gửi message.

**Trigger upstream**: Lambda gửi callback sau khi provider (FCM/SMS/email) trả result.

**Payload** (business payload trong `data`):
```json
{
  "tenantId": 0,
  "campaignId": 0,
  "customerId": 0,
  "campaignMessageId": 0,
  "externalId": "string",
  "status": "SUCCESS|FAILED|BOUNCED|DELIVERED|OPENED|CLICKED|COMPLAINED",
  "errorMessage": "string|null",
  "eventId": "string|null"
}
```

Status mapping (`MessageSendConsumer` → `CampaignMessage.status`):

| Inbound status | `CampaignMessage.status` |
|---|---|
| `SUCCESS` | `SENT` |
| `FAILED` / Unknown | `FAILED` |
| `BOUNCED` / `COMPLAINED` | `BOUNCED` |
| `DELIVERED` | `DELIVERED` |
| `OPENED` | `OPENED` |
| `CLICKED` | `CLICKED` |

**Consumer logic**:
1. Consume `AC-DEV-MESSAGE-TOPIC`.
2. Bỏ qua nếu `MessageStep != MESSAGE.SEND.2`; ack ngay.
3. Parse `MessagePayload.data` sang `MessageSend2Event`.
4. Tìm `CampaignMessage` bằng `externalId+tenantId`; thiếu key hoặc không tìm thấy → log + return.
5. KHÔNG cho downgrade từ trạng thái terminal `FAILED`/`BOUNCED`; progression hợp lệ `SENT → DELIVERED → OPENED → CLICKED`.

**Idempotency**: Dedup key dùng `eventId` nếu có, fallback `${externalId}-${status}-${tenantId}`.

**Critical use case**: Catch lỗi `handleMessage(...)` chỉ log, KHÔNG throw; offset đã ack ở listener — lỗi parse/domain có thể cần metric/alert riêng để tránh mất tín hiệu.

---

## 4. Workflow correlation (Temporal)

`VoucherProgram` flow:

1. API/scheduler tạo voucher program → publish `VoucherProgramLifecycleChanged` (`Created`/`Activated`/`CancelledOrExpired` variant).
2. Self-consumer `TriggerEventConsumer` consume → infer event type bằng payload field (`isActivated`, `totalQuantity+voucherType+validFrom`, `isCancelledOrExpired`).
3. `Activated` → `WorkflowStarter.startVoucherProgramWorkflow(tenantId, programId)` để generate vouchers.
4. `CancelledOrExpired` → `WorkflowStarter.cancelVoucherProgramWorkflow(tenantId, programId, status)`.
5. `Created` → log `no action needed` (vì DTO field `startDate` ≠ consumer check `validFrom` — design mismatch).

`WorkflowStarter` còn có `scheduleVoucherProgramExpiryWorkflow(...)` và `scheduleVoucherExpiryWorkflow(...)` — nhưng `TriggerEventConsumer` Kafka path KHÔNG gọi trực tiếp các hàm này; expiry workflow phải được schedule từ flow khác.

`Triggered campaign` flow (consume từ gf-sales):
1. Consume `BookingCompleted` từ [gf-sales-events.md](gf-sales-events.md) §2 → `BookingCompletedConsumer`.
2. Inbox dedup theo `eventId`.
3. `BookingCompletedEventProcessor` query segment campaigns + assign voucher (nếu campaign có `voucherProgramId`) → publish `SendMessageRequested`.

---

## 5. Forbidden patterns

- ❌ Giả định mọi marketing event đều dùng `KafkaMessageWrapper`; lifecycle campaign/voucher/voucher-program hiện là raw JSON DTO từ outbox.
- ❌ Publish `SendMessageEvent` thiếu `eventId`, `tenantId`, `campaignId`, `customerId`, `campaignMessageId`, `externalId`, `channel` hoặc `recipient`.
- ❌ Log full `content`, `recipient`, `base64Data` hoặc attachment nếu có PII hoặc dữ liệu nhạy cảm.
- ❌ Dựa vào Kafka topic để phân biệt subtype message; phải kiểm tra `eventType` trong outbox hoặc `MessageStep`/payload.
- ❌ Thêm event type mới mà không cập nhật `OutboxProcessor.resolveTopicFromEventType(...)`.
- ❌ Dùng `VoucherProgramCreated` làm trigger workflow cho generate/cancel voucher; source hiện chỉ action trên `VoucherProgramActivated` và `VoucherProgramCancelledOrExpired`.
- ❌ Xử lý `MESSAGE.SEND.2` trong `gf-customer` để tạo interaction; source hiện chủ động skip step này.
- ❌ Dựa vào retry consumer Kafka cho `MessageDeliveryChanged` khi processor đã catch/log lỗi.
- ❌ Tạo inbound section trong file này cho `BookingCompleted` (producer = `gf-sales`) — vi phạm producer-view discipline (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)). Consumer concern document tại [gf-sales-events.md](gf-sales-events.md) §2.

---

## 6. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Producer file của event mà boundary này consume:
  - [gf-sales-events.md](gf-sales-events.md) — `BookingCompleted`
- Workflow files:
  - `marketing-campaign-wave-flow.md`
  - `voucher-program-lifecycle-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `marketing` boundary: 4 outbound (`CampaignLifecycleChanged`/`VoucherLifecycleChanged`/`VoucherProgramLifecycleChanged`/`SendMessageRequested` trên `AC-DEV-CAMPAIGN-TOPIC`/`AC-DEV-VOUCHER-TOPIC`/`AC-DEV-VOUCHER-PROGRAM-TOPIC`/`AC-DEV-MESSAGE-TOPIC`) + 1 external-source inbound `MessageDeliveryChanged` (lambda/provider); reliability outbox + Redis lock + scheduled retry + inbox dedup; envelope mix raw DTO + `SendMessageMessage extends Message` cho `MESSAGE.SEND.1`; §4 Workflow correlation cho VoucherProgram (self-consume kick Temporal voucher generate/cancel) + Triggered campaign (consume `BookingCompleted` từ `gf-sales`). Bao gồm producer summary, catalog split §2.1+§2.2, schemas 4-part, workflow correlation, forbidden patterns, references. |
