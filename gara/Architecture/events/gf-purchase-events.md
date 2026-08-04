---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: purchase
last_reviewed: "2026-05-07"
---

# Events - `purchase` boundary

> Producer = `gf-purchase`. Boundary này có 1 integration event đang active: `PurchaseOrderStatusChanged` để kích hoạt `gf-inventory-worker` start `ReceiptFulfillmentWorkflow`.
>
> DTO event v2 trong package `adapter.event` đang tồn tại nhưng chưa có call-site publish — document tại §3.2 inactive shape.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-purchase` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.purchase.*` (planned) |
| Total events | 1 active outbound (`PurchaseOrderStatusChanged`); 1 inactive DTO shape v2.0 |
| Reliability | `outbound_messages` table + `OutboundMessageCreatedEvent` `@TransactionalEventListener(AFTER_COMMIT)` + manual batch retry qua `SimpleMessageService` |
| Canonical envelope | Common `Message` (`type=BASIC_MESSAGE`) + Kafka record headers; domain payload là JSON string trong `Message.data` |

Ghi chú source-aligned:

- `PurchaseOrderEventPublisher` tạo domain payload `com.actechx.gf.domain.model.common.PurchaseOrderStatusChangedEvent`, KHÔNG dùng DTO `com.actechx.gf.adapter.event.PurchaseOrderStatusChangedEvent` (inactive v2.0).
- `OutboundMessageService.createMessage` lưu row `outbound_messages`, sau đó publish Spring `OutboundMessageCreatedEvent`.
- `MessageEventListener` xử lý outbound event sau transaction commit (`TransactionPhase.AFTER_COMMIT`) và gọi `OutboundMessageService.processSingleMessage`.
- `PurchaseOrderStatusChangedProducer` publish Kafka bằng `KafkaMessagePublisher` vào `${spring.kafka.topics.purchase-order-events}`.

---

## 2. Catalog

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `PurchaseOrderStatusChanged` | `AC-NONPROD-DEV-PURCHASE-ORDER-EVENTS` | PO chuyển `DELIVERING` + flag `INVENTORY_STOCK_KEY` bật | `gf-inventory-worker` | ≤ 30s | `topic-drift-risk` | drift: producer ≠ worker default `dev-inventory-purchase-order-events` |

---

## 3. Schemas

### 3.1 `PurchaseOrderStatusChanged`

**Trigger**: PO chuyển sang `DELIVERING` và feature flag `INVENTORY_STOCK_KEY` bật.
Source call-site:
- `PurchaseOrderApplicationServiceV2.updatePoDelivering` — RECEIPT type, các PO `OPEN→DELIVERING`.
- `DirectPurchaseOrderServiceImpl.updateStatus` — direct PO chuyển stage `DELIVERING`.

(`PurchaseOrderApplicationServiceV2.updatePurchaserOrderStatusService` set `POStatusEnum.DELIVERED` nhưng KHÔNG publish Kafka event trong source hiện tại.)

**Payload** (Kafka value common `Message` + Kafka headers `MessageGroup=PO`, `MessageStep=DELIVERED.2`, `OriginTenantId={tenantId}`, `OriginMessageCode={purchaseOrderCode}`; `data` là JSON string của domain payload):
```json
{
  "tenantId": 133,
  "purchaseOrderCode": "PO-00017",
  "previousStatus": "OPEN",
  "currentStatus": "DELIVERING",
  "deliveryDate": "ISO-8601",
  "vendorTenantId": 456,
  "items": [
    {
      "sku": "SKU-001",
      "genuineCode": "GEN-001",
      "quantity": 1,
      "costPrice": 100000,
      "currency": "VND"
    }
  ],
  "totalAmount": 100000,
  "currency": "VND",
  "eventSource": "DIRECT|ECOMMERCE|CART|CHAT|QUOTATION_ASK"
}
```

Field mapping theo source:
- `tenantId` ← `purchaseOrder.purchaserId`
- `purchaseOrderCode` ← `purchaseOrder.code`
- `previousStatus`/`currentStatus` ← stage transition (thường `currentStatus=DELIVERING`)
- `deliveryDate` ← `purchaseOrder.updatedAt`
- `vendorTenantId` ← `purchaseOrder.supplierId`
- `items` ← chỉ gồm item có `quantity > 0`; `totalAmount` = tổng `unitPrice * quantity`
- `eventSource` ← `purchaseOrder.source`

Outbox row (`OutboundMessageService.createMessage`):
```json
{
  "messageType": "PURCHASE_ORDER_STATUS_CHANGED",
  "tenantId": 133,
  "messageCode": "PO-00017",
  "payload": "{...PurchaseOrderStatusChangedEvent...}",
  "messageGroup": "PO",
  "messageStep": "DELIVERED.2",
  "originTenantId": 133,
  "status": "PENDING|RETRYING|COMPLETED|FAILED",
  "attemptCount": 0
}
```

**Idempotency**:
- Producer: `OutboundMessageService.createMessage` ghi `outbound_messages` row cùng tx; `MessageEventListener.onOutboundMessageCreated` xử lý sau commit. Publish thành công → `COMPLETED`. Lỗi tăng `attemptCount`, hết `outbox.messaging.max-retry-attempts` → `FAILED`. `SimpleMessageService.processOutboundMessages` xử lý batch row `PENDING/RETRYING`.
- Consumer: `gf-inventory-worker` `PurchaseOrderEventListener` route theo Kafka headers (`MessageGroup=PO`, `MessageStep=DELIVERED.2`); start `ReceiptFulfillmentWorkflow` với workflow id deterministic `receipt-fulfillment-{tenantId}-{purchaseOrderCode}`. `WorkflowExecutionAlreadyStarted` = idempotent success.

**Critical use case**: PO `DELIVERING.2` là gate khởi receipt fulfillment workflow ở `gf-inventory-worker`. Topic drift hiện tại — producer publish `AC-NONPROD-DEV-PURCHASE-ORDER-EVENTS`, worker subscribe `dev-inventory-purchase-order-events` → cần env override topic runtime để alignment, hoặc Phase 2 migrate sang target `gms.gf-purchase.purchase-order-status-changed`.

### 3.2 Inactive DTO shape v2.0

Các class sau tồn tại trong package `adapter.event` nhưng KHÔNG có call-site publish:
- `gf-purchase/.../adapter/event/PurchaseOrderStatusChangedEvent.java`
- `gf-purchase/.../adapter/event/PurchaseOrderPayload.java`
- `gf-purchase/.../adapter/event/PurchaseOrderItemPayload.java`

KHÔNG dùng schema v2.0 này làm active wire contract cho đến khi có producer route thật:

```json
{
  "event_id": "uuid",
  "event_type": "PurchaseOrderStatusChanged",
  "event_version": "2.0",
  "timestamp": "ISO-8601",
  "tenant_id": 133,
  "previous_status": "OPEN",
  "new_status": "DELIVERING",
  "purchase_order": {
    "code": "PO-00017",
    "source": "DIRECT",
    "status": "DELIVERING",
    "supplier_tax_code": "string",
    "supplier_address": "string",
    "payment_terms": "string",
    "items": []
  }
}
```

---

## 4. Forbidden patterns

- ❌ Publish PO event trước khi DB transaction commit; source hiện đã dùng `@TransactionalEventListener(AFTER_COMMIT)`.
- ❌ Ghi `PurchaseOrderStatusChanged` là full `KafkaMessageWrapper` cho đến khi source producer được harden hoặc có migration contract rõ.
- ❌ Dùng DTO `adapter.event.PurchaseOrderStatusChangedEvent` v2.0 làm active contract khi chưa có call-site publish.
- ❌ Bỏ qua `OriginTenantId` và `data.tenantId` mismatch trong triển khai/hardening sau này.
- ❌ Gửi purchase order item payload thiếu `sku`/`quantity` nếu event dùng để tạo receipt.
- ❌ Reset consumer group để xử lý lại PO event nếu chưa có replay/dedup plan.
- ❌ Ghi `confirmed-two-sided` nếu chỉ dựa trên default source hiện tại; phải có bằng chứng env override topic runtime.
- ❌ Đổi `MessageStep` khỏi `DELIVERED.2` nếu chưa cập nhật đồng bộ worker consumer.
- ❌ Tạo inbound section trong file này — `gf-purchase` là pure producer (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Consumer file (workflow detail):
  - [gf-inventory-events.md](gf-inventory-events.md) — `gf-inventory-worker` start `ReceiptFulfillmentWorkflow`
- Workflow files:
  - `purchase-request-order-flow.md`
  - `inventory-receipt-fulfillment-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `purchase` boundary: 1 active outbound `PurchaseOrderStatusChanged` trên `AC-NONPROD-DEV-PURCHASE-ORDER-EVENTS` (status `topic-drift-risk` vs worker default `dev-inventory-purchase-order-events`); envelope common `Message` (`type=BASIC_MESSAGE`) + headers `MessageGroup=PO`/`MessageStep=DELIVERED.2`; reliability `outbound_messages` table + `@TransactionalEventListener(AFTER_COMMIT)` + manual batch retry; consumer `gf-inventory-worker` start `ReceiptFulfillmentWorkflow` workflow id `receipt-fulfillment-{tenantId}-{purchaseOrderCode}`; §3.2 inactive DTO v2.0 shape document để tránh hiểu nhầm. Bao gồm producer summary, catalog 1 row, schemas 4-part, forbidden patterns, references. |
