---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: erp-agent
last_reviewed: "2026-05-07"
---

# Events - `erp-agent` boundary

> Producer/consumer = `gf-erp-agent`. **Adapter bridge** giữa Garage và ERP/COP/Ecom4G cho quotation, pricing, purchase, order stage, shipment và payment order flows.
>
> Boundary này split §2.1 outbound (Garage → ERP) + §2.2 inbound external-source (ERP → Garage; bridge owns schema mirror) per [`_CONVENTIONS.md §12`](_CONVENTIONS.md).
>
> Tất cả events share common bridge envelope (`com.actechx.common.messaging.Message` + Kafka headers) — per-event detail compact trong catalog row + §3 common envelope/persistence.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-erp-agent` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.erp_agent.*` (planned) |
| Total events | 6 outbound + 12 inbound family (18 inbound types grouped) |
| Reliability | DB-backed `outbound_message`/`inbound_message` + immediate processor cho priority + batch endpoint retry; Kafka producer direct qua `KafkaMessagePublisher`; consumer manual ack |
| Canonical envelope | `com.actechx.common.messaging.Message` với `type=BASIC_MESSAGE`, headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` |

Source hiện tại KHÔNG dùng outbox/inbox generic; dùng bảng message riêng:

| Direction | Cơ chế source |
|---|---|
| Outbound | `SimpleMessagingApplicationService` tạo `OutboundMessage`; `OutboundMessageService.processMessage(...)` route theo `OutboundMessageType` sang publisher tương ứng |
| Inbound | Kafka handler parse `MessagePayload`, lưu `InboundMessage` theo `InboundMessageType`; `InboundMessageService.processMessage(...)` gọi REST sang `gf-purchase`, `gf-shipment`, `gf-inventory` |
| Priority | `CONFIRM_PURCHASE_REQUEST` outbound và `VENDOR_CONFIRMED` inbound mark `PRIORITY_PROCESSING`, xử lý ngay sau DB commit qua domain event |

---

## 2. Catalog

### 2.1 Outbound _(Garage publish ra ERP/COP)_

| # | Event Type | Topic | Publisher | MessageGroup/Step | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `QUOTATION_ASK` | `AC-DEV-QUOTATION-ASK` | `QuotationAskPublisher` | `QUOTATION` / `ASK.1` | ≤ 30s | `source-aligned-producer-only` | — |
| 2 | `PRICING_REQUEST` | `AC-DEV-PRICING` | `PricingRequestPublisher` | `QUOTATION` / `PRICE.1` | ≤ 30s | `source-aligned-producer-only` | shared topic với inbound `PRICING_PROPOSAL` |
| 3 | `CREATE_PURCHASE_REQUEST` | `AC-DEV-PURCHASE-REQUEST` | `CreatePurchaseRequestPublisher` | `PO` / `WAIT_TO_CONFIRM.1` | ≤ 30s | `source-aligned-producer-only` | — |
| 4 | `CONFIRM_PURCHASE_REQUEST` | `AC-DEV-ORDER-STAGE-UPDATE` | `UpdateOrderStagePublisher` | `PO` / dynamic (created `WAIT_TO_CONFIRM.1`) | ≤ 5s | `source-aligned-producer-only` | priority processing |
| 5 | `CANCEL_PURCHASE_REQUEST` | `AC-DEV-ORDER-STAGE-UPDATE` | `CancelPurchaseRequestPublisher` | `PO` / `CANCEL.1` | ≤ 30s | `source-aligned-producer-only` | shared topic với inbound `ORDER_OPEN`/`VENDOR_CONFIRMED` |
| 6 | `DELIVERED_SHIPMENT_ORDER` | `AC-NONPROD-DEV-O-STAGE` | `DeliveredOrderRequestPublisher` | `O` / `CLOSE.1` | ≤ 30s | `source-aligned-producer-only` | shared topic với inbound `PURCHASE_ORDER_STAGE` |

### 2.2 Inbound — external-source _(ERP/COP/Ecom4G publish vào Garage)_

| # | Event Family | Topic | Producer source | Handler | Routing | Downstream REST | SLA | Status | Note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `QUOTATION_BID` | `AC-DEV-QUOTATION-BID` | External: ERP/COP | `QuotationBidMessageHandler` | `MessageStep=BID.1` | `gf-purchase.createQuotationBid` | ≤ 30s | `consumer-only-confirmed` | — |
| 2 | `PRELIMINARY_QUOTATION_*` | `AC-DEV-PRELIMINARY-QUOTATION-TOPIC` | External: COP | `PreliminaryQuotationMessageHandler` | `ASK.1.1` (Created) / `ASK.1.2` (Updated) | `gf-purchase.createPreliminaryQuotation` | ≤ 30s | `consumer-only-confirmed` | 2 sub-types same handler |
| 3 | `QUOTATION_ASK_UPDATE` | `AC-DEV-QUOTATION-ASK-UPDATE` | External: COP | `QuotationAskUpdatedMessageHandler` | handler-specific | `gf-purchase.updateQuotationAsk` | ≤ 30s | `consumer-only-confirmed` | — |
| 4 | `PRICING_PROPOSAL` | `AC-DEV-PRICING` | External: ERP/COP | `PricingProposalMessageHandler` | `PRICE.2` | `gf-purchase.createPricingProposal` | ≤ 30s | `consumer-only-confirmed` | shared topic với outbound `PRICING_REQUEST` |
| 5 | `SALE_ORDER_*` | `AC-DEV-SALE-ORDER` | External: ERP/COP | `SaleOrderMessageHandler` | `WAIT_TO_CONFIRM.3.1/3.2/3.3` (Confirmation/Change/Cancellation) | `gf-purchase.updatePurchaseOrder` | ≤ 30s | `consumer-only-confirmed` | 3 sub-types same handler |
| 6 | `ORDER_OPEN` | `AC-DEV-ORDER-STAGE-UPDATE` | External: ERP/COP | `OrderStateUpdatedMessageHandler` | `OPEN.1` | `gf-purchase.updatePurchaseOrderStatus` | ≤ 30s | `consumer-only-confirmed` | — |
| 7 | `VENDOR_CONFIRMED` | `AC-DEV-ORDER-STAGE-UPDATE` | External: ERP/COP | `OrderStateUpdatedMessageHandler` | `WAIT_TO_CONFIRM.1.1` | `gf-purchase.receiveVendorConfirmation` | ≤ 5s | `consumer-only-confirmed` | priority processing |
| 8 | `LOCATION` | `AC-DEV-TENANT-ACTIVATION` | External: tenant boundary (`ACTIVATED.1`) | `LocationMessageHandler` | `ACTIVATED.1` + `tenantType=GARAGE` | `gf-inventory.createLocation` | ≤ 30s | `consumer-only-confirmed` | shared topic với tenant-system `TenantActivated` |
| 9 | `SHIPMENT_ORDER` | `AC-NONPROD-DEV-TO-INFO` | External: ERP/COP | `ShipmentOrderMessageHandler` | any valid payload | `gf-shipment.createShipmentOrder` | ≤ 30s | `consumer-only-confirmed` | — |
| 10 | `SHIPMENT_ORDER_STAGE` | `AC-NONPROD-DEV-TO-STAGE` | External: ERP/COP | `ShipmentOrderStageMessageHandler` | any valid payload | `gf-shipment.updateStatusShipmentOrder` | ≤ 30s | `consumer-only-confirmed` | — |
| 11 | `PURCHASE_ORDER_STAGE` (DELIVERING_PO / DELIVERED_PO / DELIVERED_COD_PO) | `AC-NONPROD-DEV-O-STAGE` | External: ERP/COP | `PurchaseOrderStageMessageHandler` | `type=RECEIPT/DELIVERY` + `stage=DELIVERING/CLOSED` + payment method | `gf-purchase.updatePurchaseOrderStage` / `updateCodPaid` | ≤ 30s | `consumer-only-confirmed` | 3 sub-types: source COP + paymentMethod COD branch |
| 12 | `PAYMENT_ORDER` (PR_PREPAID / PR_POSTPAID) | `AC-DEV-PAYMENT-ORDER-GARAGE` (prepaid `PAYMENT.2`) / `AC-DEV-PAYMENT-ORDER-POST-PAID` (postpaid `PAYMENT.1`) | External: COP/Ecom4G | `PaymentOrderGaragePrepaidMessageHandler` / `PaymentOrderGaragePostpaidMessageHandler` | step-based | `gf-purchase.updatePrepaid/updatePostpaid` | ≤ 30s | `consumer-only-confirmed` | typo: `DELIVERVED_ORDER_TOPIC` env var; 2 handler thiếu `}` annotation |

---

## 3. Schemas

> Adapter bridge — events share common envelope. Per-event payload chi tiết theo handler (xem source `OutboundMessageType` / `InboundMessageType` enum + handler classes). §3 dưới document common bridge structure thay vì 4-part per event.

### 3.1 Common bridge envelope

Tất cả publisher/consumer flows dùng `com.actechx.common.messaging.Message` + Kafka headers:

```json
{
  "messageId": "uuid",
  "source": "gf-erp-agent|external",
  "type": "BASIC_MESSAGE",
  "data": {},
  "headers": {
    "MessageGroup": "QUOTATION|PO|O|PRO|PAYMENT|TENANT-ACTIVATION",
    "MessageStep": "ASK.1|BID.1|PRICE.1|PRICE.2|WAIT_TO_CONFIRM.1|WAIT_TO_CONFIRM.1.1|WAIT_TO_CONFIRM.3.1|WAIT_TO_CONFIRM.3.2|WAIT_TO_CONFIRM.3.3|OPEN.1|DELIVERING.1..4|DELIVERED.1|PAID.1|CLOSE.1|CLOSE.2|ASK.1.1|ASK.1.2|ACTIVATED.1|PAYMENT.1|PAYMENT.2",
    "OriginTenantId": 0,
    "OriginMessageCode": "string"
  }
}
```

Kafka handlers require:

| Header | Required in source |
|---|---|
| `MessageGroup` | Required |
| `MessageStep` | Required |
| `OriginTenantId` | Required |
| `OriginMessageCode` | Required |

### 3.2 Outbound — persistence + idempotency

**Trigger**: `SimpleMessagingApplicationService` tạo `OutboundMessage`; `OutboundMessageService.processMessage(...)` route theo `OutboundMessageType`.

**Payload** (`OutboundMessage` row):
```json
{
  "messageType": "QUOTATION_ASK|PRICING_REQUEST|CREATE_PURCHASE_REQUEST|CONFIRM_PURCHASE_REQUEST|CANCEL_PURCHASE_REQUEST|DELIVERED_SHIPMENT_ORDER",
  "tenantId": 0,
  "messageCode": "string",
  "payload": "{}",
  "messageGroup": "QUOTATION|PO|O",
  "messageStep": "string",
  "originTenantId": 0,
  "status": "PENDING|PRIORITY_PROCESSING|COMPLETED|FAILED",
  "attemptCount": 0,
  "isNotified": false
}
```

On processing, headers rebuilt từ DB fields trước khi gọi concrete publisher.

**Idempotency**:
- Producer: `OutboundMessage` row primary key + `messageType+messageCode`.
- Retry: `status IN ('PENDING','RETRYING')`; tăng `attemptCount`; `>= maxRetryAttempts` → `FAILED`.
- Priority: `CONFIRM_PURCHASE_REQUEST` initial `PRIORITY_PROCESSING`; `OutboundMessageEntityListener.@PostPersist` publish `OutboundMessagePersistedEvent`; `ImmediateOutboundMessageProcessor` xử lý `AFTER_COMMIT`. Fail → `revertToPending()` cho batch retry.

### 3.3 Inbound — persistence + idempotency

**Trigger**: Kafka handler nhận message, lưu `InboundMessage` theo `InboundMessageType`.

**Payload** (`InboundMessage` row):
```json
{
  "messageKey": "uuid",
  "messageType": "InboundMessageType",
  "tenantId": 0,
  "messageCode": "OriginMessageCode",
  "payload": "{}",
  "messageGroup": "MessageGroup",
  "messageStep": "MessageStep",
  "originTenantId": 0,
  "status": "PENDING|PRIORITY_PROCESSING|COMPLETED|FAILED",
  "attemptCount": 0,
  "isNotified": false
}
```

**Idempotency**:
- Consumer: `InboundMessageService.createMessage(...)` catch `DataIntegrityViolationException` trên duplicate `messageKey` và return existing row thay vì fail consumer.
- Retry: `status IN ('PENDING','RETRYING')`; tăng `attemptCount`; `>= maxRetryAttempts` → `FAILED`.
- Priority: `VENDOR_CONFIRMED` initial `PRIORITY_PROCESSING`; `InboundMessageEntityListener.@PostPersist` publish `InboundMessagePersistedEvent`; `ImmediateInboundMessageProcessor` xử lý `AFTER_COMMIT`. Fail → `revertToPending()`.
- Notification: `status='COMPLETED' AND is_notified=false AND attempt_count < maxAttempts`; thành công mark `isNotified=true`; fail terminal chỉ set `lastError`, KHÔNG đổi status khỏi `COMPLETED`.

**Critical use case**: Kafka ack sau khi persist `InboundMessage` — REST sang `gf-purchase`/`gf-shipment`/`gf-inventory` chạy ở batch/immediate processor. Ack KHÔNG nghĩa downstream đã hoàn tất.

### 3.4 Step catalog

`QuotationMessageStep` values:

| Step | Meaning |
|---|---|
| `ASK.1` | Garage gửi BGSB |
| `BID.1` | ERP/COP trả quotation bid |
| `PRICE.1` | Garage gửi pricing request |
| `PRICE.2` | ERP/COP trả pricing proposal |
| `ASK.1.1` | COP gửi BGSB cho Garage |
| `ASK.1.2` | COP cập nhật BGSB cho Garage |
| `WAIT_TO_CONFIRM.1` | Purchase request chờ confirm |
| `WAIT_TO_CONFIRM.1.1` | Vendor xác nhận lại confirm |
| `WAIT_TO_CONFIRM.3.1` | Sale order confirmation |
| `WAIT_TO_CONFIRM.3.2` | Sale order change |
| `WAIT_TO_CONFIRM.3.3` | Sale order cancellation |
| `OPEN.1` | Đơn hàng giao kết thành công |
| `DELIVERING.1..4` | Các bước giao hàng |
| `DELIVERED.1` | Garage confirm đã giao hàng |
| `PAID.1` | Đã thanh toán |
| `CLOSE.1` | Hoàn thành đơn bình thường |
| `CLOSE.2` | Hoàn thành đơn có vấn đề |

`PaymentMessageStep`:

| Step | Inbound mapping |
|---|---|
| `PAYMENT.1` | `PR_POSTPAID` |
| `PAYMENT.2` | `PR_PREPAID` |

---

## 4. Forbidden patterns

- ❌ Mô tả event ở boundary này như raw DTO thuần; source route bằng `MessagePayload` và Kafka headers.
- ❌ Bỏ headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode`; nhiều handler khai báo required.
- ❌ Ghi raw external payload thẳng vào domain tables của sales/purchase/inventory/accounting; source lưu inbound message rồi gọi REST client sang owner service.
- ❌ Dùng cùng topic request/response nếu không có `MessageStep` rõ; vd `AC-DEV-PRICING` có cả `PRICE.1` outbound và `PRICE.2` inbound.
- ❌ Tự đổi typo/config topic khi chưa sửa source và verify deployment: `DELIVERVED_ORDER_TOPIC` env var typo đang map `delivered-order`; 2 `@Value` của payment handler thiếu `}` trong source annotation.
- ❌ Log full payment payload hoặc PII; source hiện có nhiều log payload cần cẩn trọng.
- ❌ Assume priority xử lý tất cả message; source chỉ priority outbound `CONFIRM_PURCHASE_REQUEST` và inbound `VENDOR_CONFIRMED`.
- ❌ Assume `SimpleMessageScheduler` tự chạy định kỳ; source không có `@Scheduled`, cần external caller/cron/job.
- ❌ Rely vào duplicate guard inbound nếu DB hiện không còn unique constraint trên `message_key`.
- ❌ Assume trạng thái `RETRYING` đang được set khi retry; source hiện tăng `attemptCount` và giữ message ở `PENDING` cho tới khi `FAILED` hoặc `COMPLETED`.
- ❌ Coi Kafka ack là hoàn tất side effect downstream; consumer ack sau khi persist inbound message, REST sang owner service chạy ở batch/immediate processor.
- ❌ Ghi event có producer internal khác trong §2.2; chỉ dùng cho external-source ERP/COP/Ecom4G/tenant-system shared topic (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Producer file shared topic:
  - [gf-system-events.md](gf-system-events.md) — `TenantActivated` shared `AC-DEV-TENANT-ACTIVATION` với `LOCATION` inbound
- Workflow files:
  - `erp-agent-message-relay-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `erp-agent` adapter bridge: 6 outbound (Garage→ERP/COP) + 12 inbound family (ERP→Garage) trên topics `AC-DEV-QUOTATION-ASK`/`AC-DEV-PRICING`/`AC-DEV-PURCHASE-REQUEST`/`AC-DEV-ORDER-STAGE-UPDATE`/`AC-NONPROD-DEV-O-STAGE`/`AC-DEV-QUOTATION-BID`/`AC-DEV-PRELIMINARY-QUOTATION-TOPIC`/`AC-DEV-SALE-ORDER`/`AC-DEV-TENANT-ACTIVATION`/`AC-NONPROD-DEV-TO-INFO`/`AC-NONPROD-DEV-TO-STAGE`/`AC-DEV-PAYMENT-ORDER-*`. Common envelope `Message` + headers `MessageGroup` (QUOTATION/PO/O/PAYMENT/TENANT-ACTIVATION) + `MessageStep` catalog (`ASK.1`/`BID.1`/`PRICE.1..2`/`WAIT_TO_CONFIRM.*`/`OPEN.1`/`DELIVERING.1..4`/`CLOSE.*`/`PAYMENT.1..2`/`ACTIVATED.1`); persistence `outbound_message`/`inbound_message` + immediate processor cho priority `CONFIRM_PURCHASE_REQUEST`/`VENDOR_CONFIRMED`. Bao gồm producer summary, catalog split §2.1+§2.2, common envelope/persistence/step catalog, forbidden patterns, references. |
