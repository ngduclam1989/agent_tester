---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 4
tier: T1
owner_authority: Architecture Authority
boundary: sales
last_reviewed: "2026-06-03"
---

# Events - `sales` boundary

> Producer = `gf-sales`. Boundary này phát booking, service order, payment, customer/vehicle projection, timeslot và notification request events.
>
> Boundary này split §2.1 outbound (6 active events trên 5 distinct topics) + §2.2 inbound external-source (2 events từ Driver+) per [`_CONVENTIONS.md §12`](_CONVENTIONS.md). 7 events `config-dto-only` (DTO + topic config tồn tại nhưng chưa có producer path runtime) đã được strip khỏi catalog theo source-of-truth audit 2026-05-07; tham khảo các DTO inactive tại §3.7.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-sales` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.sales.*` (planned) |
| Total events | 6 active outbound trên 5 distinct topics + 2 external-source inbound (Driver+); 10 inactive DTO documented §3.7 |
| Reliability | Outbox + scheduled retry; một số producer helper ghi outbox; consumer manual ack với inbox dedup cho Driver+ inbound |
| Canonical envelope | `KafkaMessageWrapper` cho nhiều flow sales; riêng `ServiceOrderStatusChanged` sang inventory hiện là raw DTO có embedded `headers` |

---

## 2. Catalog

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `BookingStatusChanged` | `AC-DEV-BOOKING-EVENTS` (config `kafka.topics.booking-events`) | Booking đổi trạng thái trong `BookingV3Service` (confirm/cancel/markArrived/decline/handleBookingCancelledByDriver/auto-cancel scheduler) | External/unknown | ≤ 30s | `source-aligned-producer-only` | step `BOOKING.CHANGE.STATUS`; config `booking-status-changed` chưa được dùng |
| 2 | `BookingCompleted` | `AC-DEV-BOOKING-COMPLETED-TOPIC` | `BookingV3Service.publishBookingCompletedEvent` khi booking `ARRIVED` + flag `CRM_INITIAL_VERSION_FFLAG` | `gf-marketing` `BookingCompletedConsumer` | ≤ 30s | `confirmed-two-sided` | publish trong flow markArrived (không phải status COMPLETED) |
| 3 | `BookingCreateResponseEvent` | `AC-DEV-BOOKING-EVENTS` | `BookingV3Service.publishBookingCreateResponse` sau khi tạo booking từ Driver+ request | Driver+/external | ≤ 5s | `source-aligned-producer-only` | step `BOOKING.CREATE.RESPONSE` |
| 4 | `ServiceOrderSync` (incl. `ServiceOrderSent`/`ServiceOrderUpdated`) | `AC-DEV-SERVICE-ORDER-SYNC` | `ServiceOrderEventPublisher.publishServiceOrderSyncEvent/publishServiceOrderSentEvent/publishServiceOrderUpdatedEvent` | External/Driver+ unknown | ≤ 30s | `source-aligned-producer-only` | snake_case payload via `@JsonProperty`; steps `IN_PROGRESS.1`/`COMPLETED.1`/`CONFIRMED.1`/`DELIVERED.1`/`SENT.1`/`UPDATE.1` |
| 5 | `ServiceOrderStatusChanged` | `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` | SO đổi trạng thái + có active parts với `source=INVENTORY` | `gf-inventory-worker` start `DeliveryFulfillmentWorkflow` | ≤ 30s | `topic-drift-risk` | drift: producer ≠ worker default `dev-inventory-service-order-events`; raw DTO embedded headers |
| 6 | `NotificationRequest` | `AC-NONPROD-DEV-NOTIFICATION-REQUEST` | Sales cần tạo notification (booking/SO milestone) | `gf-notification` `NotificationCreationConsumer` | ≤ 10s | `confirmed-two-sided` | step `SENT.NOTIFICATION` |

> **Stripped 2026-05-07** (per source-of-truth policy): 10 rows `config-dto-only` đã được loại khỏi catalog (`ServiceOrderCreated`, `ServiceOrderStarted`, `ServiceOrderCompleted`, `ServiceOrderCancelled`, `PaymentRecorded`, `SalesCustomerVehicleProjected (CustomerCreated/VehicleCreated)`, `TimeslotUpdated`, `BookingArrivedEvent`, `BookingCancelledEvent`, `BookingConfirmedEvent`). DTO + topic config tồn tại trong `application.yml` nhưng KHÔNG có producer call-site runtime; lifecycle thật của Service Order đang đi qua `ServiceOrderSync` + `ServiceOrderStatusChanged`. Customer/Vehicle hiện sync HTTP qua `ServiceOrderV3Service.syncCustomerAndVehicleOnCompletion`. Chi tiết DTO inactive xem §3.7.

### 2.2 Inbound — external-source

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 14 | `BookingCreateRequest` | `AC-DEV-BOOKING-EVENTS` | External: Driver+ | `BookingDriverPlusConsumer` route `MessageStep=BOOKING.CREATE.REQUEST`; inbox dedup `BOOKING_CREATED_FROM_DRIVER_PLUS`; gọi `BookingV3Service.handleBookingCreatedFromDriverPlus`; sau thành công publish `BookingCreateResponseEvent` | ≤ 5s | `consumer-only-confirmed` | shared topic với outbound `BookingStatusChanged`/`BookingCreateResponseEvent` |
| 15 | `BookingCancelledByDriver` | `AC-DEV-BOOKING-EVENTS` | External: Driver+ | `BookingDriverPlusConsumer` route `MessageStep=BOOKING.CANCELLED`; require `OriginTenantId` (thiếu → ack skip); inbox `BOOKING_CANCELLED_BY_DRIVER`; gọi `BookingV3Service.handleBookingCancelledByDriver` (có thể publish `BookingStatusChanged` + `NotificationRequest`) | ≤ 5s | `consumer-only-confirmed` | shared topic; `OriginTenantId` mandatory |

---

## 3. Schemas

### 3.1 `BookingStatusChanged`

**Trigger**: Booking lifecycle transitions trong `BookingV3Service`:
- `confirm` → `BOOKING → BOOKED`
- `cancel` → `BOOKED → CANCELLED`
- `markArrived` → `BOOKED → ARRIVED`
- `decline` → `BOOKING → DECLINED`
- `handleBookingCancelledByDriver` → `current → CANCELLED`
- `BookingAutoCancelScheduler.cancelExpiredBooking` → `current → NO_SHOW`

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CHANGE.STATUS`, `OriginTenantId={tenantId}`, `OriginMessageCode={bookingCode}`; `data` JSON string):
```json
{
  "eventId": "uuid",
  "eventType": "BookingStatusChanged",
  "eventTime": "ISO-8601",
  "tenantId": 0,
  "bookingId": 0,
  "bookingCode": "string",
  "fromStatus": "BOOKING|BOOKED|ARRIVED|CANCELLED|DECLINED|NO_SHOW",
  "toStatus": "BOOKING|BOOKED|ARRIVED|CANCELLED|DECLINED|NO_SHOW",
  "reason": "string|null",
  "changedAt": "ISO-8601",
  "changedBy": "string|null"
}
```

**Idempotency**:
- Producer: outbox; event lưu với key Kafka = outbox id; Kafka headers add từ outbox headers.
- Consumer: external/unknown. `BookingDriverPlusConsumer` cùng topic skip step `BOOKING.CHANGE.STATUS` (chỉ xử lý CREATE.REQUEST/CANCELLED) → KHÔNG ghi `gf-sales` là consumer business của event này.

**Critical use case**: Producer dùng config `kafka.topics.booking-events`, KHÔNG dùng `kafka.topics.booking-status-changed` (config tồn tại nhưng inactive).

### 3.2 `BookingCompleted`

**Trigger**: `BookingV3Service.publishBookingCompletedEvent` publish khi booking `ARRIVED` + flag `Constant.CRM_INITIAL_VERSION_FFLAG` bật.

**Payload** (Kafka value wrapper + headers `MessageGroup=BOOKING`, `MessageStep=COMPLETED`, `type=BASIC_MESSAGE`):
```json
{
  "eventId": "uuid",
  "tenantId": 0,
  "bookingId": 0,
  "customerId": 0,
  "serviceType": "string|null",
  "totalAmount": null,
  "completedAt": "ISO-8601",
  "metadata": {}
}
```

Source `BookingCompletedEvent` của `gf-sales` KHÔNG có `eventType`, `eventVersion`, `bookingCode`, `vehicleId`, `branchId`.

**Idempotency**:
- Producer: outbox.
- Consumer: `gf-marketing` `BookingCompletedConsumer` group `${kafka.consumer.group-id}-booking`; `InboxService.processIfNotDuplicate(eventId, BookingCompletedEvent, gf-sales, tenantId, ...)`.

**Critical use case**: Trigger campaign `TRIGGERED` theo segment khách hàng (xem [gf-marketing-events.md](gf-marketing-events.md) §4 Triggered campaign flow). Catch lỗi `handleMessage` chỉ log, không throw — outer listener vẫn ack.

### 3.3 `BookingCreateResponseEvent`

**Trigger**: `BookingV3Service.publishBookingCreateResponse` sau khi tạo booking từ Driver+ inbound request (xem §3.8 `BookingCreateRequest`).

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CREATE.RESPONSE`):
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "code": "BK-00001"
  },
  "error": null
}
```

**Idempotency**:
- Producer: outbox event type `BookingCreateResponseEvent`; publish ngay sau commit qua `OutboxEventCreatedEvent`/`OutboxEventListener`, có scheduled fallback qua `OutboxProcessor`.
- Consumer: Driver+ external — dedup contract phụ thuộc Driver+.

### 3.4 `ServiceOrderSync` (incl. `ServiceOrderSent`/`ServiceOrderUpdated`)

**Trigger**: `ServiceOrderEventPublisher` publish 3 event variant ghi outbox vào `AC-DEV-SERVICE-ORDER-SYNC`.

Source call-site theo step:

| Step | Method | source |
|---|---|---|
| `IN_PROGRESS.1` | `ServiceOrderV3Service.start` | `START` |
| `COMPLETED.1` | `ServiceOrderV3Service.complete` (order type SERVICE) | `BOOKING` hoặc `DIRECT` |
| `DELIVERED.1` | `ServiceOrderV3Service.complete` (order type RETAIL) | `DELIVER` |
| `CONFIRMED.1` | `ServiceOrderV3Service.confirm` | `QUOTE_CONFIRMED` |
| `SENT.1` | `sendQuotation` (publish `ServiceOrderSent`) | — |
| `UPDATE.1` | quotation resend/update (publish `ServiceOrderUpdated`) | — |

**Payload** (Kafka value wrapper + headers `MessageGroup=SERVICE_ORDER`, `MessageStep={step}`, `OriginMessageCode={serviceOrderCode}`; `data` JSON string snake_case via `@JsonProperty`):
```json
{
  "tenant_id": 0,
  "service_order_code": "string",
  "order_type": "SERVICE|RETAIL|null",
  "previous_status": "string",
  "current_status": "string",
  "source": "START|BOOKING|DIRECT|DELIVER|QUOTE_CONFIRMED",
  "customer_id": 0,
  "customer_phone": "string",
  "vehicle_id": 0,
  "vehicle_plate": "string",
  "final_amount": 0,
  "currency": "VND"
}
```

**Idempotency**:
- Producer: `saveOutboxEvent` chỉ lưu outbox; KHÔNG publish application event ngay trong method. Delivery phụ thuộc scheduled `OutboxProcessor`.
- Consumer: external/Driver+ unknown.

### 3.5 `ServiceOrderStatusChanged`

**Trigger**: `ServiceOrderEventPublisher.publishServiceOrderStatusChangedEvent` ghi trực tiếp `ServiceOrderStatusChangedEvent` JSON vào outbox payload. Producer chỉ publish khi service order có active parts với `source=INVENTORY`.

**Payload** (raw DTO có embedded `headers` field — KHÔNG phải full `KafkaMessageWrapper`; routing context vừa nhúng trong payload field `headers` vừa lưu vào outbox headers):
```json
{
  "tenantId": 0,
  "serviceOrderCode": "string",
  "previousStatus": "string",
  "currentStatus": "string",
  "serviceDate": "ISO-8601",
  "customerId": 0,
  "vehicleId": 0,
  "items": [
    {
      "sku": "string",
      "genuineCode": "string",
      "tier": "string",
      "origin": "string",
      "quantity": 0,
      "sellingPrice": 0,
      "currency": "VND"
    }
  ],
  "totalAmount": 0,
  "currency": "VND",
  "source": "gf-sales",
  "headers": {
    "OriginTenantId": 0,
    "MessageGroup": "SERVICE_ORDER",
    "OriginMessageCode": "SO-00001",
    "MessageStep": "DELIVERED"
  }
}
```

**Idempotency**:
- Producer: outbox.
- Consumer: `gf-inventory-worker` `ServiceOrderEventListener` hỗ trợ nhiều format (embedded headers + legacy wrapper); workflow id deterministic `delivery-fulfillment-{tenantId}-{serviceOrderCode}`. `WorkflowExecutionAlreadyStarted` = idempotent success. Unknown format → ack skip.

**Critical use case**: SO `DELIVERED` là gate khởi `DeliveryFulfillmentWorkflow` ở `gf-inventory-worker` (xem §4). Topic drift hiện tại — producer publish `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS`, worker subscribe `dev-inventory-service-order-events`.

### 3.6 `NotificationRequest`

**Trigger**: `NotificationRequestProducer` dùng `KafkaMessageWrapper` và ghi qua outbox khi sales cần tạo notification (booking/SO milestone).

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING|SERVICE_ORDER`, `MessageStep=SENT.NOTIFICATION`, `OriginMessageCode={bookingCode|serviceOrderCode}`; `type=NOTIFICATION_REQUEST`; `data` JSON string của `NotificationRequestDto`):
```json
{
  "recipient": {
    "tenantId": 0,
    "tenantType": "GARAGE"
  },
  "notificationType": "string (vd BOOKING_CREATED)",
  "channel": "BOTH|IN_APP|PUSH|EMAIL|SMS",
  "placeholders": {}
}
```

**Idempotency**:
- Producer: outbox; `messageId` = outbox event id.
- Consumer: `gf-notification` `NotificationCreationConsumer`; nếu `messageId` không null → `InboxService.processIfNotDuplicate(messageId, NOTIFICATION_REQUEST, NOTIFICATION, tenantId)`. Exception throw lại để Spring Kafka `DefaultErrorHandler` xử lý retry/DLT.

**Critical use case**: Thiếu `messageId` → consumer KHÔNG dedup, gọi thẳng `notificationService.createNotification` → có thể tạo trùng notification. Source phải đảm bảo outbox set `messageId`.

### 3.7 Inactive event shapes _(config + DTO tồn tại, chưa có producer path runtime)_

10 events sau có DTO (và phần lớn có topic config) trong source nhưng KHÔNG có producer path đang publish runtime. Document để tránh tài liệu hóa nhầm thành active flow.

| Event | Config key / topic default | DTO source |
|---|---|---|
| `ServiceOrderCreated` | `kafka.topics.service-order-created` / `AC-DEV-SALES-SERVICE-ORDER-CREATED` | DTO tồn tại; chưa có `builder`/publish call. Lifecycle thật đang dùng `ServiceOrderSync` (§3.4) |
| `ServiceOrderStarted` | `kafka.topics.service-order-started` / `AC-DEV-SALES-SERVICE-ORDER-STARTED` | DTO tồn tại; chưa có publish call |
| `ServiceOrderCompleted` | `kafka.topics.service-order-completed` / `AC-DEV-SALES-SERVICE-ORDER-COMPLETED` | DTO tồn tại; chưa có publish call. KHÔNG nhầm với `ServiceOrderSync` step `COMPLETED.1` |
| `ServiceOrderCancelled` | `kafka.topics.service-order-cancelled` / `AC-DEV-SALES-SERVICE-ORDER-CANCELLED` | DTO tồn tại; chưa có publish call |
| `PaymentRecorded` | `kafka.topics.payment-recorded` / `AC-DEV-SALES-PAYMENT-RECORDED` | `ServiceOrderService.recordPayment` chỉ tạo `ServiceOrderPayment` + cập nhật DB; KHÔNG publish Kafka |
| `CustomerCreated` / `VehicleCreated` | `kafka.topics.customer-created` / `kafka.topics.vehicle-created` | DTO tồn tại. Runtime path: `ServiceOrderV3Service.syncCustomerAndVehicleOnCompletion` dùng HTTP `GfCustomerClient.getByPhone/createCustomer/upsertVehicleFromServiceOrder` — KHÔNG publish Kafka |
| `TimeslotUpdated` | `kafka.topics.timeslot-updated` / `AC-DEV-SALES-TIMESLOT-UPDATED` | DTO tồn tại; chưa có publish call |
| `BookingArrivedEvent` | — | DTO tồn tại; chưa có publish call |
| `BookingCancelledEvent` | — | DTO tồn tại; chưa có publish call |
| `BookingConfirmedEvent` | — | DTO tồn tại; chưa có publish call |

DTO common shape (giữ để tham khảo khi harden):
```json
{
  "eventId": "uuid",
  "eventType": "{specific}",
  "eventTime": "ISO-8601",
  "tenantId": 0,
  "{aggregateId}": 0,
  "{aggregateCode}": "string"
}
```

**Idempotency**: N/A — chưa có producer path.

### 3.8 `BookingCreateRequest` _(inbound external-source)_

**Producer source**: External Driver+.

**Trigger upstream**: Driver+ tạo booking request, gửi `MessageStep=BOOKING.CREATE.REQUEST`.

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CREATE.REQUEST`, `OriginMessageCode={driverBookingId}`; `type=BASIC_MESSAGE`; `data` JSON string):
```json
{
  "externalBookingId": "string",
  "..." : "..."
}
```
(Detail fields theo `BookingCreateRequestEventData`.)

**Consumer logic**:
1. Consume `AC-DEV-BOOKING-EVENTS`; `BookingDriverPlusConsumer` route theo `MessageStep` trong `KafkaMessageWrapper.headers`.
2. Ghi inbox bằng `InboxEventType.BOOKING_CREATED_FROM_DRIVER_PLUS`; duplicate bị bỏ qua qua unique constraint/inbox repository.
3. Parse `data` sang `BookingCreateRequestEventData`.
4. Gọi `BookingV3Service.handleBookingCreatedFromDriverPlus`.
5. Sau khi tạo booking, `gf-sales` publish `BookingCreateResponseEvent` (§3.3).

**Idempotency**: Inbox dedup theo `messageId`/`OriginMessageCode`.

### 3.9 `BookingCancelledByDriver` _(inbound external-source)_

**Producer source**: External Driver+.

**Trigger upstream**: Driver+ cancel booking, gửi `MessageStep=BOOKING.CANCELLED`.

**Payload** (Kafka value wrapper + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CANCELLED`, `OriginTenantId` mandatory):
```json
{
  "bookingId": 1,
  "reason": "string"
}
```

**Consumer logic**:
1. Yêu cầu `OriginTenantId`; nếu thiếu → consumer ack + bỏ qua để tránh retry vô hạn.
2. Ghi inbox bằng `InboxEventType.BOOKING_CANCELLED_BY_DRIVER`.
3. Parse `data` sang `BookingCancelledByDriverEventData`.
4. Gọi `BookingV3Service.handleBookingCancelledByDriver` — flow này có thể publish `BookingStatusChanged` (§3.1) + `NotificationRequest` (§3.6).

**Idempotency**: Inbox dedup theo `messageId`/`OriginMessageCode`. Mandatory `OriginTenantId` để tránh cross-tenant accidents.

---

## 4. Workflow correlation (Temporal)

`ServiceOrder` lifecycle chain (sales V3 → inventory worker):

1. Operator/system action trigger `ServiceOrderV3Service.start/complete/confirm/sendQuotation` → publish `ServiceOrderSync` (§3.4) với step tương ứng.
2. Khi SO có active parts với `source=INVENTORY` và status đổi → publish `ServiceOrderStatusChanged` (§3.5) outbound vào worker topic.
3. `gf-inventory-worker` `ServiceOrderEventListener` consume → start `DeliveryFulfillmentWorkflow` workflow id `delivery-fulfillment-{tenantId}-{serviceOrderCode}`.
4. Workflow chạy delivery flow (reserve stock + create delivery record + decrement inventory).
5. Khi xong, workflow có thể trigger event downstream (xem `inventory-delivery-fulfillment-flow.md`).

`Booking ↔ Driver+` chain:

1. Driver+ publish `BookingCreateRequest` (§3.8) inbound → `BookingDriverPlusConsumer` consume.
2. `gf-sales` tạo booking → publish `BookingCreateResponseEvent` (§3.3) outbound trở lại Driver+.
3. Driver+ cancel: publish `BookingCancelledByDriver` (§3.9) → `BookingV3Service.handleBookingCancelledByDriver` → có thể publish `BookingStatusChanged` (§3.1) + `NotificationRequest` (§3.6).

`Notification` chain:

1. Booking/SO milestone → `gf-sales` publish `NotificationRequest` (§3.6).
2. `gf-notification` `NotificationCreationConsumer` inbox dedup → tạo notification + delivery row.
3. Delivery published as `NotificationCreatedForDelivery` (xem [gf-notification-events.md](gf-notification-events.md) §3.1).

---

## 5. Forbidden patterns

- ❌ Dùng sales event để mutate database của inventory/notification/marketing trực tiếp.
- ❌ Publish service order worker event với null key.
- ❌ Nhúng full customer phone/email trong log event.
- ❌ Đổi `KafkaMessageWrapper.data` sang object trong cùng major version.
- ❌ Ghi `ServiceOrderStatusChanged` sang inventory là full `KafkaMessageWrapper` cho đến khi source producer được harden hoặc có migration contract rõ.
- ❌ Ghi `confirmed-two-sided` nếu chỉ dựa trên default source hiện tại; phải có bằng chứng env override topic runtime.
- ❌ Gửi `NotificationRequest` thiếu `messageId` nếu muốn giữ inbox dedup ở `gf-notification`.
- ❌ Log full `placeholders` nếu chứa tên khách hàng, biển số xe, số điện thoại hoặc dữ liệu nhạy cảm khác.
- ❌ Mô tả `BookingStatusChanged` là đang publish vào `AC-DEV-BOOKING-STATUS-CHANGED` nếu source vẫn inject `kafka.topics.booking-events`.
- ❌ Thêm field `bookingCode`, `vehicleId`, `branchId`, `eventType`, `eventVersion` vào `BookingCompleted` nếu source producer/consumer hiện không có.
- ❌ Coi `BookingCompleted` là trạng thái booking `COMPLETED`; source hiện publish trong flow `markArrived`.
- ❌ Ghi `ServiceOrderCreated/Started/Completed/Cancelled` là event đang publish nếu chỉ dựa vào config/DTO; lifecycle thật đang dùng `ServiceOrderSync`.
- ❌ Nhầm `ServiceOrderCompleted` config-only với `ServiceOrderSync` step `COMPLETED.1`; flow đang chạy dùng topic `AC-DEV-SERVICE-ORDER-SYNC`.
- ❌ Mô tả `ServiceOrderSync.data` theo camelCase; DTO hiện dùng snake_case qua `@JsonProperty`.
- ❌ Ghi `PaymentRecorded`/`CustomerCreated`/`VehicleCreated`/`TimeslotUpdated` là event đang publish nếu chỉ dựa vào config/DTO.
- ❌ Dùng `AC-DEV-SALES-CUSTOMER-CREATED` hoặc `AC-DEV-SALES-VEHICLE-CREATED` để mô tả flow CRM hiện tại; source đang gọi HTTP sang `gf-customer`.
- ❌ Coi mọi message trên `AC-DEV-BOOKING-EVENTS` là cùng một event; phải route bằng `MessageStep` (`BOOKING.CREATE.REQUEST`, `BOOKING.CREATE.RESPONSE`, `BOOKING.CANCELLED`, `BOOKING.CHANGE.STATUS`).
- ❌ Retry vô hạn booking cancellation từ Driver+ nếu thiếu `OriginTenantId`; source hiện acknowledge và bỏ qua.
- ❌ Tạo inbound section trong file này cho event có producer internal — chỉ `BookingCreateRequest`/`BookingCancelledByDriver` từ Driver+ external (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).

---

## 6. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Consumer file (workflow + cross-boundary chain):
  - [gf-inventory-events.md](gf-inventory-events.md) — `gf-inventory-worker` start `DeliveryFulfillmentWorkflow` cho `ServiceOrderStatusChanged`
  - [gf-marketing-events.md](gf-marketing-events.md) — `BookingCompletedConsumer` trigger campaign
  - [gf-notification-events.md](gf-notification-events.md) — `NotificationCreationConsumer` consume `NotificationRequest`
  - [gf-accounting-events.md](gf-accounting-events.md) — gf-sales không consume event nào từ gf-accounting. Cache debt widget (FEAT-INS-DASH-DEBT, W03 scope) dùng TTL 5 phút (ADR-015) — không event eviction.
- Workflow files:
  - `sales-complete-flow.md`
  - `inventory-delivery-fulfillment-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `sales` boundary: 13 outbound (6 confirmed `BookingStatusChanged`/`BookingCompleted`/`BookingCreateResponseEvent`/`ServiceOrderSync`/`ServiceOrderStatusChanged`/`NotificationRequest` + 7 `config-dto-only` gộp §3.7) + 2 external-source inbound từ Driver+ (`BookingCreateRequest`/`BookingCancelledByDriver`); topics `AC-DEV-BOOKING-EVENTS`/`AC-DEV-BOOKING-COMPLETED-TOPIC`/`AC-DEV-SERVICE-ORDER-SYNC`/`AC-NONPROD-DEV-SERVICE-ORDER-EVENTS`/`AC-NONPROD-DEV-NOTIFICATION-REQUEST`; envelope `KafkaMessageWrapper` + headers `MessageGroup=BOOKING|SERVICE_ORDER` với steps (`BOOKING.CHANGE.STATUS`/`BOOKING.CREATE.REQUEST`/`BOOKING.CREATE.RESPONSE`/`BOOKING.CANCELLED`/`COMPLETED`/`IN_PROGRESS.1`/`COMPLETED.1`/`CONFIRMED.1`/`DELIVERED.1`/`SENT.1`/`UPDATE.1`/`DELIVERED`/`SENT_NOTIFICATION`); reliability outbox + scheduled retry + inbox dedup cho Driver+; §4 Workflow correlation 3 chain (ServiceOrder lifecycle → inventory worker, Booking↔Driver+, Notification). Bao gồm producer summary, catalog split §2.1+§2.2, schemas 4-part + §3.7 inactive shapes, workflow correlation, forbidden patterns, references. |
| 2026-05-30 | v2 (frontmatter) | **Insurance Settlement cross-link (DESIGN — CR-1780147390, ADR-014)**: thêm §6 cross-link tới [gf-accounting-events.md](gf-accounting-events.md) — gf-sales consume `insurance-payment-recorded` (evict dashboard debt cache) + `insurance-settlement-cancelled` (reopen bổ trợ). gf-sales KHÔNG produce event BH (settle/reopen/snapshot qua REST). Không thêm row §2 (producer-view discipline — producer internal). |
| 2026-05-31 | v3 | **Resolve F5 (Delivery Lead)**: ghi rõ §6 consumer filter — topic `AC-DEV-ACCOUNTING-EVENTS`, `MessageGroup=INSURANCE_SETTLEMENT`, `MessageStep ∈ {PAYMENT_RECORDED.1, CANCELLED.1}`, inbox dedup theo messageId. |
| 2026-05-07 | v2 | Source-of-truth reconcile: strip 7 rows `config-dto-only` khỏi §2.1 (`ServiceOrderCreated/Started/Completed/Cancelled`, `PaymentRecorded`, `SalesCustomerVehicleProjected`, `TimeslotUpdated`); §2.1 còn 6 rows active. KG topic name fix: `AC-DEV-SALES-SERVICE-ORDER-EVENTS` → `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` (truyền qua config `kafka.topics.service-order-events`). DTO inactive vẫn document tại §3.7 cho developer reference. |
| 2026-06-03 | v4 | **Xoá consumer section gf-accounting events**: gf-accounting không publish event (v7). Cache debt widget → TTL-only. |
