---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 10
tier: T1
owner_authority: Architecture Authority
boundary: sales
last_reviewed: "2026-08-12"  # v10 doc completeness fix: BOOKING.CREATE.REQUEST §3.8 thiếu note OriginTenantId mandatory (asymmetry vs §3.9 CANCELLED cùng consumer) — phát hiện qua self-audit cascade ADR-029 v3 gap G4, xem Change Log.  # v9 loại bỏ step DOCUMENT.SERVICE_ORDER.REVOKED (ADR-031 v6) — xem Change Log.  # v8 Driver+ document sync (ADR-031) — xem Change Log.  # v6 V2 DEDICATED CLASS + ENVELOPE FIX + CANONICAL SCHEMA — cascade từ ADR-026 v3 D5 addendum (user sonhoang Delivery Authority yêu cầu kiểm tra luồng auto-create delivery end-to-end 2026-07-24; xác nhận producer routing D1 đúng topic nhưng V2 route hiện publish CÙNG raw-DTO-với-embedded-headers shape với V1 — `app.dto.event.ServiceOrderStatusChangedEvent`, snake_case `service_order_code`/`current_status`, field `items` — 2 vấn đề: (a) field name/case không khớp `gf-inventory` canonical DTO; (b) payload KHÔNG bọc `KafkaMessageWrapper` — `gf-inventory-worker` (V1 consumer) tolerant format này từ trước nhưng `gf-inventory`'s shared `KafkaMessageHandler` (V2 consumer) strict expect `MessagePayload{messageId,source,type,data,timestamp}` → `payload.getData()`=null → NPE tại `ServiceOrderConsumer`). **Sửa 1 điểm**: insert §3.5b (NEW) canonical V2 target schema + field mapping table + envelope fix note — `gf-sales` PHẢI tạo **class V2 riêng** (đề xuất `ServiceOrderStatusChangedEventV2`), publish qua `KafkaMessageWrapper` (reuse `saveOutboxEvent()` helper — pattern 3 method chị em `publishServiceOrderSentEvent`/`publishServiceOrderUpdatedEvent`/`publishServiceOrderSyncEvent` cùng file đã dùng), KHÔNG sửa/tái sử dụng `app.dto.event.ServiceOrderStatusChangedEvent` (V1 legacy mobile + `gf-inventory-worker` phụ thuộc raw-DTO shape hiện tại — user sonhoang verbatim: "tách thành 2 class riêng không được phép để chung v1"). §2.1 row 6 note trỏ §3.5b mới. §5 Forbidden thêm 2 rule (cấm dùng chung class V1 cho V2 publish; cấm thiếu `eventOccurredAt`/envelope trên V2 payload). **KHÔNG đụng**: §1 Producer summary, §2.1 row 5 (V1 topic), §3.5 V1 schema (giữ nguyên — V1 publish path + `gf-inventory-worker` tolerance không đổi), §2.2/§3.6-§3.9 (Driver+/Notification, không liên quan). Cascade: `ADR-026 v3 §D5` + `gf-inventory-events.md v12 §3.5` + `Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml` (DEV-time sync). Execution: `/spawn-dev gf-sales` (KHÔNG `/spawn-fix` — contract change). v5 → v6.  # v5 W05 ADR-026 v2 MAJOR PIVOT cascade 2026-07-16 chiều (user sonhoang Delivery Authority verbatim "không sửa bên gf-inventory-worker, cần sửa khi bắn message ở gf-sale và gf-purchase, ở vì sau khi đẩy v2 lên, v1 vẫn dùng cho các app mobile cũ"). **Producer refactor scope W05**: `ServiceOrderEventPublisher.publishServiceOrderStatusChangedEvent()` inject `com.actechx.common.featureflag.core.FeatureFlagService` (dependency đã có sẵn build.gradle — verified). Ở publish path: extract `tenantId` → `isV2 = featureFlagService.isEnabled(tenantId, FeatureFlags.INVENTORY_V2)` → target topic exclusive per-tenant: V1 topic existing `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` khi FF OFF (worker consume, V1 pipeline preserved cho mobile V1); **V2 topic MỚI** `AC-NONPROD-DEV-INVENTORY-V2-SERVICE-EVENTS` khi FF ON (gf-inventory V2 consumer group `gf-inventory-inventory-v2-consumer-group` consume, V2 pipeline cho web/api v2). Single Kafka send per event — NEVER dual publish. Fail-CLOSED default V1 (FeatureFlagService exception/service down → V1 topic → worker + V1 pipeline continue). CẤM `@FeatureOn` annotation trên publish method — must programmatic `FeatureFlagService.isEnabled()` inline check. **Add outbound event topic entry V2**: `AC-NONPROD-DEV-INVENTORY-V2-SERVICE-EVENTS` với producer routing note "FF-gated per-tenant exclusive publish (V1 topic hoặc V2 topic, NOT both)". V1 topic naming + envelope (raw DTO exception per existing gf-sales) + downstream worker `gf-inventory-worker` consumer group — UNCHANGED. Consumers block update per event: V1 topic consumed by `gf-inventory-worker` (V1 flow, tenant FF OFF only); V2 topic consumed by `gf-inventory` V2 consumer group (V2 flow, tenant FF ON only). **0 đụng** SO business logic + REST endpoint + entity + Flyway. Config `kafka.topics.inventory-v2-service-events` add vào `application.yml`. Infra pre-provision V2 topic partition + replication match V1. Test: Testcontainers Kafka + Mockito FF mock 4 scenario (a) FF ON → V2 topic; (b) FF OFF → V1 topic; (c) FF exception → V1 topic; (d) tenant migration flip → next event routed correct. Coverage ≥80%. Canonical current spec: `Execution/work-packages/PKG-W05-inventory-receipt-delivery.md v11 §2.2.6 Backend gf-sales` + `Architecture/decisions/ADR-026-slip-v2-auto-create-direct-consume.md v2` (D1 producer routing). Impl `agent-dev-gf-sales` (~5h scope narrow) per PKG-W05 v11 §4.1. Cascade Architecture 10 files v11 batch. v4 → v5.
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
| Total events | 7 active outbound trên 6 distinct topics + **1 DESIGN outbound** (`ServiceOrderDocumentSync` trên topic mới `AC-DEV-DOCUMENT-EVENTS` — ADR-031, xem §2ter; `ServiceOrderDocumentRevoked` bị loại bỏ v6 — xem §3.11) (W05 ADR-026 v2: `ServiceOrderStatusChanged` fan-out V1+V2 topic per-tenant FF exclusive publish, single Kafka send per event) + 2 external-source inbound (Driver+); 10 inactive DTO documented §3.7 |
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
| 5 | `ServiceOrderStatusChanged` _(V1 route)_ | `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` (config `kafka.topics.service-order-events`) | SO đổi trạng thái + có active parts với `source=INVENTORY`; producer route topic V1 khi tenant FF `Inventory:InventoryV2` **OFF** (default fail-CLOSED) | `gf-inventory-worker` `ServiceOrderEventListener` start `DeliveryFulfillmentWorkflow` (V1 flow, tenant FF OFF only per ADR-026 v2 D3) | ≤ 30s | `topic-drift-risk` | drift: producer ≠ worker default `dev-inventory-service-order-events`; raw DTO embedded headers; FF-gated per-tenant exclusive publish (V1 topic hoặc V2 topic, NOT both) |
| 6 | `ServiceOrderStatusChanged` _(V2 route)_ | `AC-NONPROD-DEV-INVENTORY-V2-SERVICE-EVENTS` (config `kafka.topics.inventory-v2-service-events`) | SAME trigger as V1 (SO đổi trạng thái + active parts `source=INVENTORY`); producer route topic V2 khi tenant FF `Inventory:InventoryV2` **ON** | `gf-inventory` V2 consumer group `gf-inventory-inventory-v2-consumer-group` (V2 flow, tenant FF ON only) | ≤ 30s | `ACTIVE` (v11 batch, wave W05); **schema + envelope pin v6 — §3.5b, NOT YET IMPLEMENTED** | FF-gated per-tenant exclusive publish (V1 topic hoặc V2 topic, NOT both). Producer route topic tại `ServiceOrderEventPublisher.publishServiceOrderStatusChangedEvent()` inline theo `FeatureFlagService.isEnabled(tenantId, FeatureFlags.INVENTORY_V2)`. Fail-CLOSED default V1 topic (FF service down → V1 → worker + V1 pipeline continue). **v6 (ADR-026 D5)**: envelope raw DTO hiện tại (không `KafkaMessageWrapper`) chỉ tương thích `gf-inventory-worker`'s tolerant V1 consumer — `gf-inventory`'s strict V2 `KafkaMessageHandler` cần `KafkaMessageWrapper` envelope + field schema riêng, xem §3.5b canonical target + field mapping (payload domain + envelope đều cần class/publish-path V2 riêng). Cite: `ADR-026 v3 D1+D5`, `PKG-W05 v11 §2.2.6 Backend gf-sales`, `Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml` (DEV agent sync at DEV-time per PKG spec) |
| 7b | `ServiceOrderDocumentSync` | **`AC-DEV-DOCUMENT-EVENTS`** (MỚI) | SO chuyển "Hoàn thành" + booking nguồn Driver+ + flag `Document:DriverPlus` | Driver+ (hồ sơ số của xe, `FEAT-DP-046`) | ≤ 30s | **DESIGN** (ad-hoc 2026-08-10, ADR-031) | step `DOCUMENT.SERVICE_ORDER.SYNC`; `MessageGroup=DOCUMENT`; partition key `Document-{documentCode}` — xem §2ter + §3.10 |
| 7 | `NotificationRequest` | `AC-NONPROD-DEV-NOTIFICATION-REQUEST` | Sales cần tạo notification (booking/SO milestone) | `gf-notification` `NotificationCreationConsumer` | ≤ 10s | `confirmed-two-sided` | step `SENT.NOTIFICATION` |

> **Stripped 2026-05-07** (per source-of-truth policy): 10 rows `config-dto-only` đã được loại khỏi catalog (`ServiceOrderCreated`, `ServiceOrderStarted`, `ServiceOrderCompleted`, `ServiceOrderCancelled`, `PaymentRecorded`, `SalesCustomerVehicleProjected (CustomerCreated/VehicleCreated)`, `TimeslotUpdated`, `BookingArrivedEvent`, `BookingCancelledEvent`, `BookingConfirmedEvent`). DTO + topic config tồn tại trong `application.yml` nhưng KHÔNG có producer call-site runtime; lifecycle thật của Service Order đang đi qua `ServiceOrderSync` + `ServiceOrderStatusChanged`. Customer/Vehicle hiện sync HTTP qua `ServiceOrderV3Service.syncCustomerAndVehicleOnCompletion`. Chi tiết DTO inactive xem §3.7.

### 2.2 Inbound — external-source

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 14 | `BookingCreateRequest` | `AC-DEV-BOOKING-EVENTS` | External: Driver+ | `BookingDriverPlusConsumer` route `MessageStep=BOOKING.CREATE.REQUEST`; require `OriginTenantId` (thiếu → ack skip — doc completeness fix, parity row 15); inbox dedup `BOOKING_CREATED_FROM_DRIVER_PLUS`; gọi `BookingV3Service.handleBookingCreatedFromDriverPlus`; sau thành công publish `BookingCreateResponseEvent` | ≤ 5s | `consumer-only-confirmed` | shared topic với outbound `BookingStatusChanged`/`BookingCreateResponseEvent`. **W07**: payload tài liệu hoá đủ 14 trường + adapter gate reject — xem §3.8 |
| 15 | `BookingCancelledByDriver` | `AC-DEV-BOOKING-EVENTS` | External: Driver+ | `BookingDriverPlusConsumer` route `MessageStep=BOOKING.CANCELLED`; require `OriginTenantId` (thiếu → ack skip); inbox `BOOKING_CANCELLED_BY_DRIVER`; gọi `BookingV3Service.handleBookingCancelledByDriver` (có thể publish `BookingStatusChanged` + `NotificationRequest`) | ≤ 5s | `consumer-only-confirmed` | shared topic; `OriginTenantId` mandatory. **W07**: gate 3 nhánh (áp dụng / không đủ điều kiện / không tìm thấy booking) — xem §3.9 |

---

## 2bis. Driver+ integration rewrite — DELTA W07 (DESIGN)

> **Brownfield**: đây là **rewrite cơ chế đang chạy production**, KHÔNG phải greenfield. Baseline giữ nguyên: topic `AC-DEV-BOOKING-EVENTS`, `MessageGroup=BOOKING`, envelope `KafkaMessageWrapper`, 4 `MessageStep` `BOOKING.CREATE.REQUEST` / `BOOKING.CANCELLED` / `BOOKING.CREATE.RESPONSE` / `BOOKING.CHANGE.STATUS`, class `BookingDriverPlusConsumer` + `InboxEventType` hiện hữu.
>
> Nguồn Product: `FEAT-BOOK-DRIVERPLUS-INBOUND.md` (v5) + `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` (v3), viết lại theo `FEAT-DP-034/035/046` phía Driver+. Quyết định giao thức: **ADR-029** (giữ Kafka, không cutover 2 bên).

### 2bis.1 Bảng DELTA so với baseline

| # | Hạng mục | Baseline hiện tại | Delta W07 | Loại | Cite |
|---|---|---|---|---|---|
| D1 | Tên topic / `MessageGroup` | `AC-DEV-BOOKING-EVENTS` / `BOOKING` | **KHÔNG ĐỔI** | — | ADR-029 |
| D2 | 4 `MessageStep` đang chạy | `BOOKING.CREATE.REQUEST`, `BOOKING.CANCELLED`, `BOOKING.CREATE.RESPONSE`, `BOOKING.CHANGE.STATUS` | **KHÔNG ĐỔI tên** — resolve `FEAT-BOOK-DRIVERPLUS-INBOUND` §4 + `-OUTBOUND` §4 `NEED CONFIRMATION` | — | ADR-029 |
| D3 | Payload `BookingCreateRequest` | Tài liệu hoá dở (`{"externalBookingId": "...", "...": "..."}`) | **Tài liệu hoá đủ 14 trường** (5 bắt buộc + 9 tuỳ chọn) — §3.8 | Documentation | INBOUND AC-2 |
| D4 | Validate payload inbound | Không có gate tường minh | **Adapter gate**: thiếu 1/5 trường bắt buộc HOẶC giờ hẹn sai bước 15 phút → **KHÔNG tạo booking**, trả `BOOKING.CREATE.RESPONSE` `success=false` + `ERR-BOOK-001` | Additive (behavior) | INBOUND AC-2, EC-3 · OUTBOUND AC-10 |
| D5 | `BOOKING.CREATE.RESPONSE` | Shape `{success, booking, error}` đã có; `error` luôn `null` | **Tái dùng nhánh `success=false`** — không tạo step mới cho create-reject | Documentation | §3.3 (shape sẵn có) · OUTBOUND AC-10 |
| D6 | Yêu cầu hủy không khớp booking | Không có phản hồi | **Step MỚI `BOOKING.CANCEL.RESPONSE`** `success=false` + `ERR-BOOK-002` | **Additive (step mới)** | INBOUND AC-8 · OUTBOUND AC-11 |
| D7 | Gate hủy từ Driver+ | Dùng chung gate garage tự hủy | **Gate riêng, rộng hơn**: cho phép hủy ở `BOOKING` (Lịch hẹn mới) **và** `BOOKED` (Đã xác nhận), tự động áp dụng, KHÔNG chờ garage duyệt | Behavior clarify | `BR-BOOK-022` (≠ `BR-BOOK-013`) · INBOUND AC-6 |
| D8 | Booking không đủ điều kiện hủy | — | Giữ nguyên state + publish `BOOKING.CHANGE.STATUS` mang **trạng thái thực tế** (không phải "từ chối yêu cầu") | Additive (behavior) | INBOUND AC-7 · OUTBOUND AC-5 |
| D9 | Payload `BookingStatusChanged` | Không có `cancelSource` | **+ `cancelSource`** (bắt buộc khi `toStatus ∈ {CANCELLED, NO_SHOW}`) — additive field, consumer cũ bỏ qua | **Additive (field)** | `BR-BOOK-023` · OUTBOUND AC-4 |
| D10 | Nhãn trạng thái gửi D+ | Chỉ có enum kỹ thuật `toStatus` | **+ `driverPlusStatus`** — 1 trong 5 nhãn chuẩn hoá đã thống nhất với D+ | **Additive (field)** | OUTBOUND AC-1..AC-5 |
| D11 | Phạm vi publish outbound | Publish cho **mọi** booking đổi trạng thái | **Gate theo nguồn**: chỉ publish cho booking có nguồn Driver+ | **Behavior narrowing** — xem cảnh báo | OUTBOUND EC-2 (RESOLVED) |
| D12 | Cột DB | — | `booking.cancel_source` + `booking.driverplus_service_type` | Additive (schema) | `BR-BOOK-023` · INBOUND AC-2/AC-3 |

> **⚠ D11 là thay đổi hành vi duy nhất có rủi ro với consumer hiện hữu.** Trước khi bật gate, DEV **BẮT BUỘC** verify không có subscriber nào khác trên `AC-DEV-BOOKING-EVENTS` step `BOOKING.CHANGE.STATUS` ngoài Driver+. Bằng chứng hiện có: §2.1 row 1 ghi consumer "External/unknown"; §3.1 Idempotency ghi rõ `BookingDriverPlusConsumer` **skip** step này; KG `gf-sales` (`Các step khác … là step do chính gf-sales produce — consumer acknowledge và bỏ qua`). Gate nằm **sau** feature flag `Booking:DriverPlus` — flag `off` giữ nguyên hành vi publish-all của baseline.

### 2bis.2 Cutover

1. **Không có breaking change** → không cần deploy đồng thời 2 bên (ADR-029). Delta D3/D5 là documentation; D4/D6/D9/D10 là additive; D7/D8 là làm rõ hành vi gate.
2. Thứ tự an toàn: (a) deploy schema D12 (`ddl-auto=update` + Flyway index) → (b) deploy producer field mới D9/D10 (D+ chưa đọc vẫn OK) → (c) bật `Booking:DriverPlus` → gate D4/D11 + step mới D6 hoạt động.
3. Rollback: tắt flag `Booking:DriverPlus` → adapter gate + gate publish tắt, quay lại hành vi baseline; field additive vẫn được gửi (vô hại).
4. Booking nguồn D+ tạo **trước** cutover không bị ảnh hưởng — vẫn quản lý bình thường (`FEAT-BOOK-DRIVERPLUS-INBOUND` §8 behavior khi flag `off`).

---

## 2ter. Driver+ document sync — DELTA ad-hoc 2026-08-10 (DESIGN, ADR-031)

> Bổ sung **nửa thứ 3** của tích hợp Driver+ (sau partner link + booking relay): đồng bộ **chứng từ sau booking**. Phạm vi `gf-sales` = phiếu dịch vụ (`FEAT-SO-DETAIL` AC-17 / `BR-SO-DTL-007`). Phiếu quyết toán do `gf-accounting` tự emit — xem [`gf-accounting-events.md`](gf-accounting-events.md) §3.3.
>
> **Thuần additive**: topic mới, `MessageGroup` mới, 1 step mới (`DOCUMENT.SERVICE_ORDER.REVOKED` đã bị loại bỏ hoàn toàn — ADR-031 v6, xem §3.11). KHÔNG đụng `AC-DEV-BOOKING-EVENTS` và 4 step booking đang chạy production.

| # | Hạng mục | Delta | Loại | Cite |
|---|---|---|---|---|
| E1 | Topic | **MỚI** `AC-DEV-DOCUMENT-EVENTS` (`MessageGroup=DOCUMENT`) | Additive | ADR-031 D2 |
| E2 | Step `DOCUMENT.SERVICE_ORDER.SYNC` | **MỚI** — emit khi SO "Hoàn thành" + có booking nguồn D+ | Additive | `BR-SO-DTL-007` · AC-17 |
| E4 | Định dạng tệp | `fileUrl` + `expiresAt` (30 ngày) + `checksum` — KHÔNG nhúng binary. Resolve marker `NEED CONFIRMATION Architecture` tại `FEAT-SO-DETAIL:139` | Decision | ADR-031 D4 |
| E5 | Khoá dedupe | `event_id = UUIDv5(NS_DP_DOCUMENT, documentCode + "\|" + documentType)` — ổn định qua retry | Decision | ADR-031 D5 |
| E6 | Schema DB | **KHÔNG đổi** — tái dùng `outbox_event` sẵn có; không cần bảng "đã emit" vì `event_id` là hàm thuần của mã phiếu | — | ADR-031 D6 |
| E7 | Kill-switch | Feature flag **`Document:DriverPlus`** (độc lập `Booking:DriverPlus`) | Additive | ADR-031 D7 |

**Cutover**: (a) deploy producer + bật upload `ct-file-storage`; (b) D+ xác nhận đã có handler 2 step; (c) bật `Document:DriverPlus`. Rollback = tắt flag (không rollback state nghiệp vụ đã commit).

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
  "changedBy": "string|null",
  "driverPlusStatus": "Chờ xác nhận|Đã xác nhận|Từ chối|Xe đã đến|Đã hủy",
  "cancelSource": "DRIVERPLUS_USER|GARAGE_INTERNAL|NO_SHOW_AUTO|null"
}
```

**Delta W07 — 2 field additive** (§2bis.1 D9 + D10):

| Field | Type | Required | Semantic | Cite |
|---|---|---|---|---|
| `driverPlusStatus` | String (5 nhãn) | ✅ khi publish sang D+ | Giá trị **chuẩn hoá** đã thống nhất với Driver+, map từ `toStatus`: `BOOKING`→`Chờ xác nhận` · `BOOKED`→`Đã xác nhận` · `DECLINED`→`Từ chối` · `ARRIVED`→`Xe đã đến` · `CANCELLED`/`NO_SHOW`→`Đã hủy`. Field kỹ thuật `toStatus` **giữ nguyên**, không thay thế | OUTBOUND AC-1..AC-5 ("khớp đúng 1 trong 5 nhãn trạng thái đã thống nhất với Driver+") |
| `cancelSource` | Enum \| null | ✅ **bắt buộc** khi `toStatus ∈ {CANCELLED, NO_SHOW}`; `null` ở transition khác | `DRIVERPLUS_USER` (khách hủy qua D+) · `GARAGE_INTERNAL` (garage tự hủy) · `NO_SHOW_AUTO` (quá hạn tự động). Driver+ coi cập nhật "Đã hủy" **thiếu** field này là dữ liệu không hợp lệ và sẽ không áp dụng | `BR-BOOK-023` · OUTBOUND AC-4 · `FEAT-DP-035` AC-7 |

> **Không phải breaking change** (resolve `FEAT-BOOK-DRIVERPLUS-OUTBOUND` §4 `NEED CONFIRMATION`): cả 2 là **field mới thêm vào payload**, không rename/remove field cũ, không đổi `MessageStep`. Consumer chưa cập nhật bỏ qua field lạ (Jackson ignore-unknown). Chiều ngược lại, `FEAT-DP-035` AC-7 cho thấy Driver+ đang được xây để **yêu cầu** `cancelSource` — thêm field là điều consumer cần, không phải điều consumer gãy.
>
> **Làm rõ drift tài liệu Product**: `FEAT-BOOK-DRIVERPLUS-OUTBOUND` §4 ghi "Production hiện dùng `BOOKING.UPDATE.RESPONSE` (`BookingStatusChanged`)" — **không chính xác**. Theo source-of-truth: `BOOKING.CHANGE.STATUS` → `BookingStatusChanged` (§2.1 row 1 + §3.1); còn `BOOKING.UPDATE.RESPONSE` → `BookingCreateResponseEvent`, dùng cho luồng **sửa nội dung lịch hẹn** (`FEAT-BOOK-EDIT` AC-15) — luồng đó **ngoài phạm vi** feature này (`FEAT-BOOK-DRIVERPLUS-OUTBOUND` §7 Out of Scope). Bằng chứng: `Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml` mô tả `BOOKING.UPDATE.RESPONSE — BookingCreateResponseEvent … emitted by BookingV3Service.publishBookingCreateResponse`. Đồng bộ trạng thái vòng đời sang D+ đi qua **`BOOKING.CHANGE.STATUS`**. Cần BA sửa lại §4 của FEAT — xem Open Questions của wave.

**Phạm vi publish (delta W07 — D11)**: chỉ publish sang Driver+ cho booking có **nguồn Driver+**; booking nguồn Garage Care / Walk-in **KHÔNG** gửi (OUTBOUND EC-2 RESOLVED — "Driver+ chỉ theo dõi booking do chính khách hàng của họ tạo"). Gate nằm sau feature flag `Booking:DriverPlus`; flag `off` → giữ hành vi publish-all của baseline. Xem cảnh báo §2bis.1 D11 trước khi bật.

**Idempotency**:
- Producer: outbox; event lưu với key Kafka = outbox id; Kafka headers add từ outbox headers. `eventId` **ổn định qua các lần retry** — KHÔNG sinh mới cho cùng 1 lần đổi trạng thái (OUTBOUND AC-9; Driver+ dedupe theo `eventId` per `FEAT-DP-035` AC-19).
- Consumer: external/unknown. `BookingDriverPlusConsumer` cùng topic skip step `BOOKING.CHANGE.STATUS` (chỉ xử lý CREATE.REQUEST/CANCELLED) → KHÔNG ghi `gf-sales` là consumer business của event này.

**Critical use case**: Producer dùng config `kafka.topics.booking-events`, KHÔNG dùng `kafka.topics.booking-status-changed` (config tồn tại nhưng inactive). Gửi thất bại tạm thời → retry theo outbox (Spring Retry + Resilience4j); **KHÔNG rollback** trạng thái booking (OUTBOUND AC-7 · `BR-BOOK-024`). Hết số lần retry → dừng retry, ghi ngoại lệ cho vận hành, **KHÔNG** tự suy kết quả thành công/thất bại (OUTBOUND AC-8).

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

**Nhánh thành công** (`FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-6):
```json
{
  "success": true,
  "booking": {
    "id": 1,
    "code": "BK-00001"
  },
  "error": null,
  "correlation": {
    "requestEventId": "8f2c1a90-0000-4000-8000-000000000001",
    "originMessageCode": "DP-BK-77219"
  }
}
```

**Nhánh từ chối tại adapter gate** (delta W07 — §2bis.1 D4 + D5; `FEAT-BOOK-DRIVERPLUS-OUTBOUND` AC-10):
```json
{
  "success": false,
  "booking": null,
  "error": {
    "code": "ERR-BOOK-001",
    "message": "Yêu cầu đặt lịch không hợp lệ — thiếu trường bắt buộc hoặc giờ hẹn không đúng bước 15 phút."
  },
  "correlation": {
    "requestEventId": "8f2c1a90-0000-4000-8000-000000000002",
    "originMessageCode": "DP-BK-77220"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `success` | Boolean | ✅ | `true` = đã tạo booking; `false` = adapter gate từ chối, **không** tạo booking, **không** ghi vào Danh sách lịch hẹn | OUTBOUND AC-6, AC-10 |
| `booking.id` / `booking.code` | — | khi `success=true` | Booking vừa tạo (D+ hiển thị là "Chờ xác nhận", GMS là "Lịch hẹn mới") | OUTBOUND AC-6 |
| `error.code` | String | khi `success=false` | Chỉ 1 giá trị ở W07: `ERR-BOOK-001` | `ERROR-CODE-REGISTRY` §6 |
| `error.message` | String | khi `success=false` | Wording verbatim từ registry | `ERROR-CODE-REGISTRY` §6 |
| `correlation.requestEventId` | UUID | ✅ *(additive W07)* | = `messageId` của `BookingCreateRequest` gốc — D+ khớp response về request (ADR-029). Additive: consumer cũ bỏ qua | ADR-029 |

> Shape `{success, booking, error}` **đã có sẵn trong production** (field `error` hiện luôn `null`) — W07 chỉ **tài liệu hoá nhánh `success=false`**, không tạo `MessageStep` mới cho create-reject.

**Idempotency**:
- Producer: outbox event type `BookingCreateResponseEvent`; publish ngay sau commit qua `OutboxEventCreatedEvent`/`OutboxEventListener`, có scheduled fallback qua `OutboxProcessor`.
- Consumer: Driver+ external — dedup theo `eventId` / `correlation.requestEventId`.

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

### 3.5b `ServiceOrderStatusChanged` _(V2 topic, canonical — per ADR-026 v3 D5, NEW dedicated class + envelope fix required)_

**Status**: NOT YET IMPLEMENTED — hiện tại V2 topic route (§2.1 row 6) publish CÙNG payload + envelope với V1 (§3.5 ở trên, class `app.dto.event.ServiceOrderStatusChangedEvent`, raw DTO không `KafkaMessageWrapper`). Schema + envelope dưới đây là **target contract** cho class V2 mới (đề xuất tên `ServiceOrderStatusChangedEventV2`). V1 class + V1 publish path (§3.5, dùng cho topic V1 khi FF OFF) **giữ nguyên, KHÔNG sửa** — `gf-inventory-worker`'s tolerant multi-format consumer tiếp tục nhận đúng shape cũ.

**Canonical target = `gf-inventory` consumer DTO** (`adapter/kafka/dto/ServiceOrderStatusChangedEvent`, xem [`gf-inventory-events.md`](gf-inventory-events.md) §3.5 cho full spec field-by-field):
```json
{
  "tenantId": 133,
  "serviceOrderCode": "SO-00001",
  "status": "READY",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "warehouseId": 20,
  "warehouseCode": "WH-001",
  "customerId": "CUST-001",
  "customerName": "Nguyễn Văn A",
  "eventOccurredAt": "2026-07-24T09:32:11Z",
  "lines": [
    {
      "sku": "SKU-001",
      "partName": "Lốp xe Michelin 185/65R15",
      "quantity": 2,
      "unit": "UNIT_CAI"
    }
  ]
}
```

**Field mapping — nguồn dữ liệu `gf-sales` (tương tự §3.5, nhưng field name/case khác)**:

| Wire field (canonical) | Nguồn `gf-sales` | Ghi chú |
|---|---|---|
| `tenantId` | `serviceOrder.tenantId` | giống §3.5 |
| `serviceOrderCode` | `serviceOrder.code` | giống §3.5 |
| `status` | `currentStatus` (§3.5's field) | đổi tên field; §3.5 còn có `previousStatus` — canonical schema `gf-inventory` KHÔNG có field `previousStatus` (không đọc), có thể bỏ hoặc giữ thêm field ngoài schema (Jackson ignore-unknown mặc định OK) |
| `userId` | Cognito `sub` của user thực hiện transition | **MỚI** — §3.5 KHÔNG có field này; lấy từ security context tại call-site (`ServiceOrderV3Service`) |
| `warehouseId`, `warehouseCode` | kho xuất hàng của SO (nếu có gắn warehouse) | **MỚI** — nếu SO domain không có sẵn, để null (consumer fallback default warehouse) |
| `customerId` | `serviceOrder.customerId` | §3.5 có sẵn nhưng type `Long` — canonical field `gf-inventory` là `String`; Jackson tự coerce number→String khi serialize, không cần đổi type Java, chỉ cần đảm bảo giá trị publish đúng customer identity |
| `customerName` | tên khách hàng hiển thị (§3.5 không có — chỉ `customerId`) | **MỚI** — nếu chưa có sẵn, `gf-inventory` fallback `"N/A"` khi null, không block |
| `eventOccurredAt` | **thời điểm status-change xảy ra thực tế** (KHÔNG phải `serviceDate` như §3.5 — đó là ngày tạo SO, khác semantic) | **BẮT BUỘC non-null** — thiếu field này khiến `gf-inventory` consumer throw `IllegalStateException` fail-CLOSED (dedup key build) |
| `lines[].sku` | `part.sku` | giống §3.5 (§3.5 gọi mảng là `items`) |
| `lines[].partName` | tên phụ tùng hiển thị (§3.5 không có — chỉ `genuineCode`/`tier`/`origin`) | **MỚI** — fallback `sku` nếu thiếu (consumer tự fallback) |
| `lines[].quantity` | `part.quantity` | giống §3.5 |
| `lines[].unit` | ĐVT xuất của dòng (§3.5 không có — chỉ `sellingPrice`+`currency`) | **MỚI** — nếu thiếu, `gf-inventory` tạo dòng với `unitCode=null` |

**Envelope fix (BẮT BUỘC, khác V1)**: publish qua `KafkaMessageWrapper` (`messageId`/`source`/`type`/`data`/`timestamp`) — reuse `saveOutboxEvent()` helper private method sẵn có trong `ServiceOrderEventPublisher` (đã dùng cho `publishServiceOrderSentEvent`/`publishServiceOrderUpdatedEvent`/`publishServiceOrderSyncEvent`), KHÔNG ghi outbox payload bằng `JsonUtils.toJson(statusChangedEvent)` trực tiếp như §3.5 hiện tại. `data` field trong wrapper = JSON string của canonical event ở trên. Đây là fix bắt buộc — thiếu bước này, `gf-inventory`'s shared `KafkaMessageHandler.handleRawMessage` nhận `payload.getData()=null` → `ServiceOrderConsumer.handleMessage` NPE (xem `ADR-026 v3 §D5` bug #2 + `gf-inventory-events.md` §3.5).

**Known bug — consumer-side (không phải lỗi `gf-sales`, nhưng cùng cần fix để flow hoạt động)**: `gf-inventory`'s `ServiceOrderConsumer.handleMessage` tự nó đã parse đúng (`objectMapper.readValue`) — vấn đề hoàn toàn ở producer envelope (mục trên). Không cần thay đổi gì thêm phía consumer cho path này.

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

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CREATE.REQUEST`, `OriginTenantId` **mandatory** (doc completeness fix — parity với `BOOKING.CANCELLED` §3.9, cùng consumer `BookingDriverPlusConsumer`; xác định garage nhận booking), `OriginMessageCode={driverBookingId}`; `type=BASIC_MESSAGE`; `data` JSON string).

**W07 — 14 trường chính thức** (5 bắt buộc + 9 tuỳ chọn; `FEAT-BOOK-DRIVERPLUS-INBOUND` AC-2). Ngoài 14 trường này **không có trường nào khác** — đặc biệt **không có 3 trường consent** (Driver+ tự thu thập + lưu, `BR-BOOK-025`):

```json
{
  "externalBookingId": "DP-BK-77219",
  "customerPhone": "0901234567",
  "customerName": "Nguyễn Văn A",
  "appointmentDate": "2026-08-12",
  "appointmentTime": "09:15",
  "driverPlusServiceType": "Bảo dưỡng",
  "vehiclePlate": "51K-123.45",
  "vehicleVin": "RL4TA28Y7SX123456",
  "vehicleOdo": 45200,
  "vehicleBrand": "Toyota",
  "vehicleModel": "Vios",
  "vehicleYear": "2021",
  "vehicleVersion": "1.5G CVT",
  "vehicleImages": ["https://cdn.driverplus.vn/booking/77219/1.jpg"],
  "vehicleConditionDescription": "Xe kêu lạ khi phanh gấp."
}
```

| # | Field | Type | Required | Validation tại adapter gate | Mapping DB | Cite |
|---|---|---|---|---|---|---|
| 0 | `externalBookingId` | String | ✅ | Không rỗng; dùng làm `OriginMessageCode` | `booking.lead_id` | §3.8 baseline (field production sẵn có) |
| 1 | `customerPhone` | String | ✅ | **KHÔNG validate lại định dạng** — trường khoá cứng, lấy nguyên từ SĐT đăng ký tài khoản Driver+ (`FEAT-DP-034` AC-6), không phải input tự do | `booking_details.customer_phone` | INBOUND AC-2 (fix F4 v5) |
| 2 | `customerName` | String | ✅ | Không rỗng | `booking_details.customer_name` | INBOUND AC-2, AC-4 |
| 3 | `appointmentDate` | Date `YYYY-MM-DD` | ✅ | Parse được | `booking.booked_at` (ghép với #4) | INBOUND AC-2 |
| 4 | `appointmentTime` | String `HH:mm` | ✅ | Giờ `00-23`; **phút ∈ {00, 15, 30, 45}** — sai bước 15 phút → reject `ERR-BOOK-001` | `booking.booked_at` (ghép với #3) | INBOUND AC-2, EC-3 (RESOLVED) |
| 5 | `driverPlusServiceType` | String (3 giá trị) | ✅ | Thuộc tập `Car Spa` \| `Bảo dưỡng` \| `Sửa chữa` | `booking.driverplus_service_type` — **lưu nguyên văn**, KHÔNG map vào danh mục dịch vụ GMS | INBOUND AC-2, **AC-3** |
| 6 | `vehiclePlate` | String | ⛔ | — | `booking_details.vehicle_plate` | INBOUND AC-2, AC-5 |
| 7 | `vehicleVin` | String | ⛔ | — | `booking_details.vehicle_vin` | INBOUND AC-2, AC-5 |
| 8 | `vehicleOdo` | Integer | ⛔ | — | `booking_details.vehicle_odo` | INBOUND AC-2, AC-5 |
| 9 | `vehicleBrand` | String | ⛔ | — | `booking_details.vehicle_brand` | INBOUND AC-2, AC-5 |
| 10 | `vehicleModel` | String | ⛔ | — | `booking_details.vehicle_model` | INBOUND AC-2, AC-5 |
| 11 | `vehicleYear` | String | ⛔ | — | `booking_details.vehicle_year` | INBOUND AC-2, AC-5 |
| 12 | `vehicleVersion` | String | ⛔ | — | `booking_details.vehicle_version` | INBOUND AC-2, AC-5 |
| 13 | `vehicleImages` | String[] | ⛔ | — | `booking_details.vehicle_images` (JSONB) | INBOUND AC-2, AC-5 |
| 14 | `vehicleConditionDescription` | String | ⛔ | — | `booking_details.vehicle_condition_description` | INBOUND AC-2 (1 trường gộp "Mô tả tình trạng xe/Ghi chú") |

> **Ghi chú mapping**: 13/14 trường ánh xạ vào cột **đã tồn tại** của `booking` / `booking_details` (xem [`gf-sales-data-model.md`](../data/gf-sales-data-model.md) §2). Chỉ `driverPlusServiceType` cần cột mới — xem §2bis.1 D12 + `gf-sales-data-model.md` §2ter.
>
> **`driverPlusServiceType` KHÔNG map vào `booking.service_type`** (enum `ServiceType` nội bộ GMS): `FEAT-BOOK-DRIVERPLUS-INBOUND` AC-3 chốt "2 danh mục độc lập hoàn toàn … GMS chỉ lưu/hiển thị nguyên văn, không map" theo `FEAT-DP-034` §7.

**Consumer logic** (delta W07 in đậm):

1. Consume `AC-DEV-BOOKING-EVENTS`; `BookingDriverPlusConsumer` route theo `MessageStep` trong `KafkaMessageWrapper.headers`.
2. **Yêu cầu `OriginTenantId`** (doc completeness fix — parity với `BOOKING.CANCELLED` §3.9); thiếu → consumer ack + bỏ qua để tránh retry vô hạn.
3. Ghi inbox bằng `InboxEventType.BOOKING_CREATED_FROM_DRIVER_PLUS`; duplicate bị bỏ qua qua unique constraint/inbox repository (**INBOUND AC-9** — retry mạng phía D+ chỉ tạo 1 booking).
4. Parse `data` sang `BookingCreateRequestEventData`.
5. **Adapter validation gate (W07)** — kiểm 5 trường bắt buộc + bước 15 phút của `appointmentTime`. **Fail** → KHÔNG tạo booking, publish `BOOKING.CREATE.RESPONSE` `success=false` + `ERR-BOOK-001` (§3.3), kết thúc.
6. Gọi `BookingV3Service.handleBookingCreatedFromDriverPlus` → tạo booking `status=BOOKING` ("Lịch hẹn mới"), nguồn hiển thị "Từ ứng dụng tài xế" (`BR-BOOK-001`, `BR-BOOK-003`); khớp/tạo khách theo SĐT bằng cơ chế sẵn có `BR-BOOK-004` — **không** xử lý đặc biệt cho nguồn D+ (INBOUND AC-4).
7. Sau khi tạo booking, `gf-sales` publish `BookingCreateResponseEvent` `success=true` (§3.3).

**Idempotency**: Inbox dedup theo `messageId`/`OriginMessageCode`.

**Feature flag**: `Booking:DriverPlus` (INBOUND §8, default `on` mọi tenant). Flag `off` → adapter gate từ chối toàn bộ inbound (không tạo booking, không áp dụng hủy); booking D+ đã tồn tại **không** bị ảnh hưởng. **Cơ chế kỹ thuật đặt flag**: `FeatureFlagService.isEnabled(tenantId, ...)` **programmatic inline** tại adapter layer của consumer — KHÔNG dùng annotation `@FeatureOn` trên method consume (parity rule đã áp cho `ServiceOrderEventPublisher` publish path, §2.1 row 6 note). Resolve INBOUND §8 `NEED CONFIRMATION Architecture`.

### 3.9 `BookingCancelledByDriver` _(inbound external-source)_

**Producer source**: External Driver+.

**Trigger upstream**: Driver+ cancel booking, gửi `MessageStep=BOOKING.CANCELLED`.

**Payload** (Kafka value wrapper + headers `MessageGroup=BOOKING`, `MessageStep=BOOKING.CANCELLED`, `OriginTenantId` mandatory):
```json
{
  "bookingId": 1,
  "bookingCode": "LH-20260812-00001",
  "reason": "Khách bận đột xuất"
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `bookingId` | Long | ✅ | Định danh booking cần hủy (field production sẵn có) | §3.9 baseline |
| `bookingCode` | String | ⛔ | Bổ trợ trace/đối soát; nếu cả 2 đều không khớp booking nào → `ERR-BOOK-002` | INBOUND AC-8 |
| `reason` | String | ⛔ | Lý do khách hủy, ghi vào `booking_status_history.reason` | `BR-BOOK-014` |

**Consumer logic** (delta W07 in đậm — gate 3 nhánh):

1. Yêu cầu `OriginTenantId`; nếu thiếu → consumer ack + bỏ qua để tránh retry vô hạn.
2. Ghi inbox bằng `InboxEventType.BOOKING_CANCELLED_BY_DRIVER` (**INBOUND AC-9** — gửi trùng chỉ áp dụng 1 lần).
3. Parse `data` sang `BookingCancelledByDriverEventData`.
4. **Gate W07 — 3 nhánh** (`BR-BOOK-022`, **gate riêng, rộng hơn** `BR-BOOK-013` của luồng garage tự hủy):

   | Nhánh | Điều kiện | Hành vi | Outbound | Cite |
   |---|---|---|---|---|
   | **(a) Áp dụng hủy** | Booking đang `BOOKING` ("Lịch hẹn mới") **hoặc** `BOOKED` ("Đã xác nhận"), chưa có phiếu dịch vụ liên kết | **Tự động** chuyển `CANCELLED` — KHÔNG có bước chờ garage duyệt. Ghi `cancel_source = DRIVERPLUS_USER` vào lịch sử trạng thái | `BOOKING.CHANGE.STATUS` (§3.1) với `cancelSource=DRIVERPLUS_USER`, `driverPlusStatus="Đã hủy"` | INBOUND AC-6 · `BR-BOOK-022/023` |
   | **(b) Không đủ điều kiện** | Booking đang `ARRIVED` / `DECLINED` / `CANCELLED` / `NO_SHOW`, hoặc đã có phiếu dịch vụ liên kết | **KHÔNG** áp dụng hủy, **giữ nguyên** trạng thái. Đây là "đồng bộ lại sự thật", KHÔNG phải "garage từ chối yêu cầu" | `BOOKING.CHANGE.STATUS` mang **trạng thái thực tế hiện tại** (vd `driverPlusStatus="Xe đã đến"`) | INBOUND AC-7 · OUTBOUND AC-5 · `BR-BOOK-CAN-002` |
   | **(c) Không tìm thấy booking** | `bookingId`/`bookingCode` không khớp booking nào trong tenant | KHÔNG đổi state bất kỳ booking nào; ghi ngoại lệ nội bộ để vận hành rà soát; **KHÔNG** đoán booking gần đúng | **`BOOKING.CANCEL.RESPONSE`** `success=false` + `ERR-BOOK-002` (§3.9bis) | INBOUND AC-8 · OUTBOUND AC-11 |

5. Nhánh (a)/(b) gọi `BookingV3Service.handleBookingCancelledByDriver` — flow này publish `BookingStatusChanged` (§3.1) + có thể publish `NotificationRequest` (§3.6) cho user GMS.

**Idempotency**: Inbox dedup theo `messageId`/`OriginMessageCode`. Mandatory `OriginTenantId` để tránh cross-tenant accidents.

**Race (INBOUND EC-2)**: yêu cầu đặt lịch và yêu cầu hủy cho cùng booking tới gần như đồng thời → thứ tự xử lý do **partition ordering** của broker quyết định. Partition key theo aggregate (`Booking-{bookingCode}` per `_CONVENTIONS.md` §4.1) đảm bảo 2 message cùng booking rơi **cùng partition** → xử lý tuần tự đúng thứ tự producer gửi. `gf-sales` KHÔNG thêm rule nghiệp vụ riêng để đảo thứ tự.

### 3.9bis `BookingCancelResponse` _(outbound — MỚI W07, DESIGN)_

**Trigger**: nhánh (c) của §3.9 — yêu cầu hủy không xác định được booking tương ứng.

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=BOOKING`, **`MessageStep=BOOKING.CANCEL.RESPONSE`**, `OriginTenantId={tenantId}`, `OriginMessageCode={externalBookingId|bookingCode}`):

```json
{
  "success": false,
  "bookingId": null,
  "bookingCode": null,
  "error": {
    "code": "ERR-BOOK-002",
    "message": "Không tìm thấy lịch hẹn tương ứng với yêu cầu hủy."
  },
  "correlation": {
    "requestEventId": "8f2c1a90-0000-4000-8000-000000000009",
    "originMessageCode": "LH-20260812-00001"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `success` | Boolean | ✅ | W07 chỉ publish nhánh `false`; nhánh thành công đã được phản hồi qua `BOOKING.CHANGE.STATUS` (§3.9 nhánh a/b) nên **không** publish step này | INBOUND AC-8 · OUTBOUND AC-11 |
| `error.code` | String | ✅ | `ERR-BOOK-002` | `ERROR-CODE-REGISTRY` §6 |
| `error.message` | String | ✅ | Wording verbatim từ registry | `ERROR-CODE-REGISTRY` §6 |
| `correlation.requestEventId` | UUID | ✅ | = `messageId` của `BookingCancelledByDriver` gốc | ADR-029 |

**Idempotency**: outbox; Driver+ dedupe theo `correlation.requestEventId`.

**Critical use case**: đây là **request sai từ đầu**, KHÔNG phải lỗi gửi tạm thời → Driver+ **không** retry theo cơ chế Nhóm B (OUTBOUND AC-11). Shape `{success, error, correlation}` đối xứng với `BOOKING.CREATE.RESPONSE` (§3.3) — 1 convention envelope cho cả 2 luồng inbound (ADR-029).

### 3.10 `ServiceOrderDocumentSync` _(outbound — MỚI 2026-08-10, DESIGN, ADR-031)_

**Trigger**: `ServiceOrderV3Service` chuyển SO sang **"Hoàn thành"** thành công (`FEAT-SO-DETAIL` AC-17) **VÀ** SO liên kết booking có nguồn Driver+ (`booking.source = DRIVER_PLUS` — cùng gate nguồn với §3.1 D11) **VÀ** flag `Document:DriverPlus` bật.

Trình tự trong 1 luồng: render PDF (`V1PrintStrategy`, cùng template với `GET /api/v2/service-orders/{id}/export-pdf`) → upload `ct-file-storage` `POST /api/v1/files/upload-files` → ghi `outbox_event` **cùng transaction** với UPDATE trạng thái SO (ADR-004). Upload lỗi → **KHÔNG** rollback trạng thái SO (đã "Hoàn thành"), ghi ngoại lệ cho vận hành (đối xứng `BR-BOOK-024`).

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup=DOCUMENT`, **`MessageStep=DOCUMENT.SERVICE_ORDER.SYNC`**, `OriginTenantId={tenantId}`, `OriginMessageCode={serviceOrderCode}`; partition key `Document-{documentCode}`):

```json
{
  "eventId": "0f0d2b5c-6f1a-5a3e-9b21-3c8e7d5a1f04",
  "eventType": "ServiceOrderDocumentSync",
  "eventVersion": "1.0",
  "tenantId": 5001,
  "occurredAt": "2026-08-10T09:12:00Z",
  "source": "gf-sales",
  "documentCode": "PDV-20260810-00042",
  "documentType": "SERVICE_ORDER",
  "serviceOrderCode": "PDV-20260810-00042",
  "bookingCode": "LH-20260810-00007",
  "externalBookingId": "DP-BK-99001",
  "file": {
    "fileUrl": "https://files.garage.example/service-orders/PDV-20260810-00042/phieu-dich-vu.pdf",
    "fileName": "phieu-dich-vu.pdf",
    "mimeType": "application/pdf",
    "checksum": "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
    "expiresAt": "2026-09-09T09:12:00Z"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `eventId` | UUID | ✅ | `UUIDv5(NS_DP_DOCUMENT, documentCode + "\|" + documentType)`; **= `messageId`** của wrapper — ổn định qua retry | AC-17 ("`event_id` ổn định qua các lần retry") · ADR-031 D5 |
| `documentCode` | String | ✅ | **Mã phiếu dịch vụ** — dữ liệu chính Product yêu cầu emit | AC-17 · `BR-SO-DTL-007` |
| `documentType` | Enum `SERVICE_ORDER` | ✅ | Phân biệt với `SETTLEMENT` của `gf-accounting`; D+ giữ riêng 2 loại, không ghi đè | `BR-STL-CRE-008` ("cả 2 loại phiếu giữ riêng") |
| `serviceOrderCode` | String | ✅ | Bằng `documentCode` cho loại này; giữ tên nghiệp vụ để D+ join về SO | `KG.gf-sales.entities.ServiceOrder.code` |
| `bookingCode` | String | ✅ | Mã lịch hẹn GMS — gate emit dựa trên booking này | AC-17 ("liên kết với 1 lịch hẹn có nguồn từ Driver+") |
| `externalBookingId` | String | ➖ | Mã lịch hẹn phía D+ nếu có — giúp D+ join về hồ sơ số của xe | §3.8 (field production) · `FEAT-DP-046` |
| `file.fileUrl` | String (URL) | ✅ | Tệp phiếu dịch vụ; D+ tự fetch | AC-17 (tệp phiếu) · ADR-031 D4 |
| `file.fileName` | String | ✅ | Tên hiển thị khi D+ lưu vào hồ sơ xe | ADR-016 pattern `pdf_file_name` |
| `file.mimeType` | String | ✅ | `application/pdf` | ADR-016 §Phase B |
| `file.checksum` | String | ✅ | `sha256:{hex}` — D+ verify toàn vẹn sau fetch | ADR-031 D4 |
| `file.expiresAt` | ISO-8601 | ✅ | `occurredAt + 30 ngày`. Deadline hợp đồng (chưa cưỡng chế ở storage layer) | ADR-031 D4 |

**Idempotency**: outbox (`outbox_event`, poll 10s, retry 5×). `eventId` deterministic → phát lại kỹ thuật mang y nguyên khoá; D+ dedupe theo `eventId`. **Known limitation**: khoá không có `revision` → phiếu sửa/xuất lại sẽ bị D+ bỏ qua (ADR-031 D5).

**Critical use case**: D+ ghi lịch sử vào hồ sơ số của xe (`FEAT-DP-046`). Emit **độc lập** với phiếu quyết toán — không chờ đủ cặp, không ghi đè (`BR-SO-DTL-007`). Không thay đổi vòng đời trạng thái booking (AC-17).

### 3.11 `ServiceOrderDocumentRevoked` — REMOVED (v9, 2026-08-11)

> **KHÔNG có `DOCUMENT.SERVICE_ORDER.REVOKED`** (loại bỏ hoàn toàn, không chỉ hoãn — ADR-031 v6 D3): step này ban đầu declare vì đường "SO Hoàn thành → Đã huỷ" được cho là khả đạt qua huỷ phiếu quyết toán → reopen SO → huỷ SO. Delivery Authority xác nhận 2026-08-11 **"hủy phiếu quyết toán" không phải luồng nghiệp vụ tồn tại** (cùng root-cause đã dùng để gỡ `DOCUMENT.SETTLEMENT.REVOKED` ở round 2, 2026-08-10) — do đó đường trigger duy nhất của step này không tồn tại. Schema/payload cũ (eventType `ServiceOrderDocumentRevoked`, field `revokedReason` + `correlation.syncEventId`) đã bị xoá khỏi tài liệu này; nếu Business Authority sau này xác nhận có luồng huỷ phiếu quyết toán thật → CR bổ sung lại, thuần additive. Xem `Architecture/decisions/ADR-031-driver-plus-document-sync.md` §D3 Change Log v6.

---

## 4. Workflow correlation (Temporal)

`ServiceOrder` lifecycle chain (sales V3 → inventory worker):

1. Operator/system action trigger `ServiceOrderV3Service.start/complete/confirm/sendQuotation` → publish `ServiceOrderSync` (§3.4) với step tương ứng.
2. Khi SO có active parts với `source=INVENTORY` và status đổi → publish `ServiceOrderStatusChanged` (§3.5) outbound vào worker topic.
3. `gf-inventory-worker` `ServiceOrderEventListener` consume → start `DeliveryFulfillmentWorkflow` workflow id `delivery-fulfillment-{tenantId}-{serviceOrderCode}`.
4. Workflow chạy delivery flow (reserve stock + create delivery record + decrement inventory).
5. Khi xong, workflow có thể trigger event downstream (xem `inventory-delivery-fulfillment-flow.md`).

`Booking ↔ Driver+` chain:

1. Driver+ publish `BookingCreateRequest` (§3.8) inbound → `BookingDriverPlusConsumer` consume → **adapter gate (W07)**: payload hợp lệ → tạo booking; không hợp lệ → `BOOKING.CREATE.RESPONSE` `success=false` + `ERR-BOOK-001`.
2. `gf-sales` tạo booking → publish `BookingCreateResponseEvent` (§3.3) `success=true` outbound trở lại Driver+.
3. Driver+ cancel: publish `BookingCancelledByDriver` (§3.9) → **gate 3 nhánh (W07)**: (a) áp dụng hủy + (b) không đủ điều kiện → `BookingStatusChanged` (§3.1) mang trạng thái thực tế + `cancelSource`; (c) không tìm thấy booking → `BookingCancelResponse` (§3.9bis) + `ERR-BOOK-002`.
4. Garage xử lý booking trên GMS (confirm/decline/arrive/cancel/NO_SHOW scheduler) → `BookingStatusChanged` (§3.1) với `driverPlusStatus` + `cancelSource`, **chỉ** cho booking nguồn Driver+ (§2bis.1 D11).

```
 Driver+ (external)                    gf-sales
     │                                     │
     │ BOOKING.CREATE.REQUEST (14 fields)  │
     ├────────────────────────────────────►│ inbox dedupe → adapter gate
     │◄────────────────────────────────────┤ BOOKING.CREATE.RESPONSE
     │        success=true | false+ERR-BOOK-001
     │                                     │
     │ BOOKING.CANCELLED                   │
     ├────────────────────────────────────►│ gate 3 nhánh
     │◄────────────────────────────────────┤ (a)(b) BOOKING.CHANGE.STATUS
     │                                     │        + cancelSource + driverPlusStatus
     │◄────────────────────────────────────┤ (c)    BOOKING.CANCEL.RESPONSE + ERR-BOOK-002
     │                                     │
     │◄────────────────────────────────────┤ garage confirm/decline/arrive/cancel
     │        BOOKING.CHANGE.STATUS         │ (chỉ booking nguồn Driver+)
```

`Notification` chain:

1. Booking/SO milestone → `gf-sales` publish `NotificationRequest` (§3.6).
2. `gf-notification` `NotificationCreationConsumer` inbox dedup → tạo notification + delivery row.
3. Delivery published as `NotificationCreatedForDelivery` (xem [gf-notification-events.md](gf-notification-events.md) §3.1).

---

## 5. Forbidden patterns

- ❌ **(ADR-031)** Nhúng binary/base64 tệp phiếu vào payload `DOCUMENT.*` — chạm `max.message.bytes`, phình outbox + log. Chỉ gửi `fileUrl` + `checksum` + `expiresAt`.
- ❌ **(ADR-031)** Sinh `eventId` mới cho cùng `(documentCode, documentType)` khi phát lại — phá dedupe phía D+. `eventId` là hàm thuần UUIDv5.
- ❌ **(ADR-031)** Rollback trạng thái SO "Hoàn thành" khi render PDF / upload `ct-file-storage` / publish thất bại — ghi ngoại lệ cho vận hành, không đảo state nghiệp vụ đã commit.
- ❌ **(ADR-031)** Publish chứng từ lên `AC-DEV-BOOKING-EVENTS` hoặc dùng `MessageGroup=BOOKING` — trộn contract booking đang chạy production.
- ❌ **(ADR-031)** Emit chứng từ cho SO **không** có booking nguồn Driver+ — rò dữ liệu garage sang đối tác ngoài phạm vi consent.
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
- ❌ Coi mọi message trên `AC-DEV-BOOKING-EVENTS` là cùng một event; phải route bằng `MessageStep` (`BOOKING.CREATE.REQUEST`, `BOOKING.CREATE.RESPONSE`, `BOOKING.CANCELLED`, `BOOKING.CHANGE.STATUS`, **`BOOKING.CANCEL.RESPONSE`** — W07).
- ❌ **(W07)** Publish `BookingStatusChanged` với `toStatus ∈ {CANCELLED, NO_SHOW}` mà **thiếu** `cancelSource` — Driver+ coi là dữ liệu không hợp lệ và sẽ không áp dụng (`BR-BOOK-023`, `FEAT-DP-035` AC-7).
- ❌ **(W07)** Đổi tên / version hoá 4 `MessageStep` đang chạy production khi cutover — delta thuần additive, không cần cutover 2 bên (ADR-029 · §2bis.2).
- ❌ **(W07)** Map `driverPlusServiceType` (Car Spa / Bảo dưỡng / Sửa chữa) vào `booking.service_type` hoặc danh mục dịch vụ `gf-erp-mdm` — 2 danh mục **độc lập hoàn toàn**, GMS lưu/hiển thị nguyên văn (`FEAT-BOOK-DRIVERPLUS-INBOUND` AC-3 · `FEAT-DP-034` §7).
- ❌ **(W07)** Tạo booking từ payload D+ thiếu 1 trong 5 trường bắt buộc hoặc giờ hẹn sai bước 15 phút — phải reject tại adapter gate với `ERR-BOOK-001` (INBOUND AC-2, EC-3).
- ❌ **(W07)** Bắt garage bấm duyệt/từ chối cho yêu cầu hủy đến từ Driver+ — hủy áp dụng **tự động** khi đủ điều kiện gate (`BR-BOOK-022`, INBOUND AC-6).
- ❌ **(W07)** Dùng gate `BR-BOOK-013` (garage tự hủy, chỉ "Đã xác nhận") cho yêu cầu hủy từ Driver+ — gate riêng `BR-BOOK-022` rộng hơn, cho phép cả "Lịch hẹn mới".
- ❌ **(W07)** Sinh `eventId` mới khi retry cùng 1 lần đổi trạng thái — phá dedupe phía Driver+ (OUTBOUND AC-9 · `FEAT-DP-035` AC-19).
- ❌ **(W07)** Nhận/lưu/tra cứu thông tin consent chia sẻ của khách trong payload đặt lịch — Driver+ tự thu thập và lưu hoàn toàn phía họ (`BR-BOOK-025`).
- ❌ **(W07)** Publish event trạng thái sang Driver+ cho booking **không** có nguồn Driver+ (Garage Care / Walk-in) sau khi bật flag `Booking:DriverPlus` (OUTBOUND EC-2 RESOLVED) — nhưng **phải verify** không có consumer nội bộ nào khác trên step `BOOKING.CHANGE.STATUS` trước khi bật gate (§2bis.1 D11).
- ❌ Retry vô hạn booking cancellation từ Driver+ nếu thiếu `OriginTenantId`; source hiện acknowledge và bỏ qua.
- ❌ Tạo inbound section trong file này cho event có producer internal — chỉ `BookingCreateRequest`/`BookingCancelledByDriver` từ Driver+ external (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).
- ❌ **(v6, ADR-026 D5)** Publish V2 topic (`AC-NONPROD-DEV-INVENTORY-V2-SERVICE-EVENTS`) dùng chung class `app.dto.event.ServiceOrderStatusChangedEvent` với V1 — PHẢI dùng class V2 riêng theo canonical schema §3.5b. Sửa/thêm field vào class V1 hiện có = breaking risk cho mobile app cũ + `gf-inventory-worker`'s tolerant consumer.
- ❌ **(v6, ADR-026 D5)** Publish `ServiceOrderStatusChanged` lên V2 topic mà KHÔNG bọc `KafkaMessageWrapper`, hoặc thiếu `eventOccurredAt` — `gf-inventory`'s strict V2 `KafkaMessageHandler` sẽ NPE (thiếu envelope) hoặc fail-CLOSED throw `IllegalStateException` (thiếu `eventOccurredAt` tại dedup key). Rule này CHỈ áp dụng nhánh publish V2 — nhánh V1 (§3.5) tiếp tục raw DTO không đổi.

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
- **W07 Driver+ rewrite**:
  - ADR: [`ADR-029-driver-plus-kafka-adapter-on-gf-system.md`](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md) — giao thức + cutover strategy
  - Integration: [`INTEG-EXT-driver-plus.md`](../integrations/INTEG-EXT-driver-plus.md)
  - Data model: [`gf-sales-data-model.md`](../data/gf-sales-data-model.md) §2ter (`booking.cancel_source`, `booking.driverplus_service_type`)
  - API: [`gf-sales-api.md`](../api/gf-sales-api.md) §5 Naming Registry (block Driver+)
  - Product: `FEAT-BOOK-DRIVERPLUS-INBOUND` · `FEAT-BOOK-DRIVERPLUS-OUTBOUND` · `BR-GF-SALES.md` §2.1 (`BR-BOOK-005/022/023/024/025`) + §3.1 · `ERROR-CODE-REGISTRY.md` §6
- **Driver+ document sync (ad-hoc 2026-08-10)**:
  - ADR: [`ADR-031-driver-plus-document-sync.md`](../decisions/ADR-031-driver-plus-document-sync.md) · [`ADR-016`](../decisions/ADR-016-insurance-dossier-pdf-s3.md) (render PDF + `ct-file-storage`)
  - Integration: [`INTEG-EXT-driver-plus.md`](../integrations/INTEG-EXT-driver-plus.md) §4.3
  - Producer đối ứng: [`gf-accounting-events.md`](gf-accounting-events.md) §3.3 (phiếu quyết toán)
  - API: [`gf-sales-api.md`](../api/gf-sales-api.md) §5.2bis Naming Registry (block chứng từ D+)
  - Product: `FEAT-SO-DETAIL` AC-17/AC-22..24 + `BR-SO-DTL-007` · `FEAT-STL-CREATE` AC-3 + `BR-STL-CRE-008`
  - Quyết định nền: `Tracking/arch-design-document-sync-answers-1.md` (Q1–Q6)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-12 | v10 | **Doc completeness fix — `BOOKING.CREATE.REQUEST` §3.8 thiếu note `OriginTenantId` mandatory**, phát hiện qua self-audit cascade `ADR-029` v3 (gap G4, partner-link `gf-system`): §3.9 `BOOKING.CANCELLED` (cùng consumer `BookingDriverPlusConsumer`, cùng topic) ghi rõ "`OriginTenantId` mandatory" nhưng §3.8 không đề cập gì — asymmetry không có lý do nghiệp vụ (booking CREATE cũng cần biết tenant nhận booking). User (Delivery Authority, sonhoang) xác nhận **đây là doc gap, KHÔNG phải bug** — `BOOKING.CREATE.REQUEST` đã chạy production ổn định nên tenant chắc chắn đang được resolve đúng cách, chỉ thiếu ghi lại. Thêm `OriginTenantId` mandatory vào: payload/header line §3.8, consumer logic (bước 2 mới — ack+skip khi thiếu, renumber bước 2-6 → 3-7), §2.2 row 14 producer summary. **KHÔNG đổi hành vi/code, KHÔNG cascade sang §3.9 (đã đúng từ trước)**. Nếu source code thực tế KHÁC với ghi chú này, cần dev/QA gf-sales xác nhận lại và sửa ngược. |
| 2026-08-11 | v9 | **Loại bỏ hoàn toàn step `DOCUMENT.SERVICE_ORDER.REVOKED`** (ADR-031 v6, per user sonhoang chốt qua `/warm-up gf-sales` GAP-W07-GSL-02): premise duy nhất khiến step khả đạt ("hủy phiếu quyết toán" → reopen SO → hủy SO) không phải luồng nghiệp vụ tồn tại — cùng root-cause đã gỡ `DOCUMENT.SETTLEMENT.REVOKED` ở v8/round 2. §2.1 xóa row `7c` (`ServiceOrderDocumentRevoked`) + sửa "Total events" (2 DESIGN → 1 DESIGN). §2ter xóa row E3 + sửa header "2 step mới" → "1 step mới". §3.11 xóa toàn bộ schema (payload/field table/idempotency), thay bằng note giải thích removal + cross-ref ADR-031 D3 Change Log v6. **KHÔNG đụng**: §3.10 `ServiceOrderDocumentSync` (SYNC giữ nguyên), §2bis W07 booking relay, §3.1–§3.9bis, §4 Temporal, schema DB. v8 → v9. |
| 2026-08-10 | v8 | **Driver+ document sync — phiếu dịch vụ (DESIGN, ADR-031)**, đóng gap BA phát hiện sau W07 (arch W07 chỉ phủ partner link + booking relay). **Thêm §2ter** (bảng DELTA E1..E7 + cutover) · **§2.1 +2 row** (`7b` `ServiceOrderDocumentSync`, `7c` `ServiceOrderDocumentRevoked` trên topic MỚI `AC-DEV-DOCUMENT-EVENTS`, `MessageGroup=DOCUMENT`) · **§3.10 + §3.11 MỚI** (schema đủ 4 phần Trigger/Payload/Idempotency/Critical use case, mọi field có cite Product) · §1 producer summary · §5 Forbidden +5 rule (no binary payload, no eventId mới khi phát lại, no rollback state khi publish fail, no publish lên topic booking, no emit cho SO không thuộc nguồn D+) · §6 References. Resolve marker `NEED CONFIRMATION Architecture` tại `FEAT-SO-DETAIL:139` (tên event + định dạng tệp). **KHÔNG đụng**: §2bis W07, §3.1–§3.9bis, §4 Temporal, schema DB (tái dùng `outbox_event`, không migration). v7 → v8. |
| 2026-08-05 | v7 | **W07 Driver+ integration rewrite — DELTA (DESIGN)**, cascade từ `FEAT-BOOK-DRIVERPLUS-INBOUND` v5 + `FEAT-BOOK-DRIVERPLUS-OUTBOUND` v3 + ADR-029. **Thêm §2bis** (bảng DELTA 12 dòng D1..D12 + §2bis.2 Cutover) — nêu rõ cái gì **KHÔNG đổi** (topic, MessageGroup, 4 MessageStep, envelope, consumer class) vs cái gì additive. **§3.1** `BookingStatusChanged` +2 field additive `driverPlusStatus` (5 nhãn chuẩn hoá, map từ `toStatus`) + `cancelSource` (bắt buộc khi CANCELLED/NO_SHOW, `BR-BOOK-023`) → **resolve OUTBOUND §4 NEED CONFIRMATION "có phải breaking change không"** = KHÔNG (additive, consumer đang được xây để yêu cầu field này); thêm mục làm rõ **drift tài liệu Product** (`BOOKING.UPDATE.RESPONSE` ≠ `BookingStatusChanged` — KG + §2.1 row 1 xác nhận step đúng là `BOOKING.CHANGE.STATUS`); thêm phạm vi publish gate theo nguồn (EC-2). **§3.3** `BookingCreateResponseEvent` tài liệu hoá nhánh `success=false` + `ERR-BOOK-001` + field `correlation` (tái dùng shape production sẵn có, KHÔNG tạo step mới). **§3.8** payload inbound tài liệu hoá **đủ 14 trường** với bảng mapping DB + validation gate + feature-flag mechanism (`FeatureFlagService` programmatic, resolve INBOUND §8 NEED CONFIRMATION). **§3.9** gate hủy 3 nhánh tường minh (áp dụng / không đủ điều kiện → đồng bộ trạng thái thật / không tìm thấy → reject) + giải thích race EC-2 qua partition key. **§3.9bis MỚI** — step outbound mới **`BOOKING.CANCEL.RESPONSE`** + `ERR-BOOK-002`. §4 chain Booking↔Driver+ viết lại + ASCII diagram. §5 Forbidden +9 rule W07. **KHÔNG đụng**: §2.1 rows 1-7 (trừ note row 14/15), §3.2/§3.4/§3.5/§3.5b/§3.6/§3.7, chain ServiceOrder + Notification. v6 → v7. |
| 2026-07-24 | v6 | **V2 dedicated class + envelope fix + canonical schema pin — cascade từ ADR-026 v3 D5**. User sonhoang (Delivery Authority) yêu cầu kiểm tra end-to-end luồng auto-create delivery; xác nhận V2 route (§2.1 row 6) hiện publish CÙNG raw-DTO-với-embedded-headers shape với V1 (§3.5) — 2 vấn đề: field schema không khớp `gf-inventory` canonical DTO, VÀ payload thiếu `KafkaMessageWrapper` envelope mà `gf-inventory`'s strict V2 `KafkaMessageHandler` yêu cầu (khác `gf-inventory-worker`'s tolerant V1 consumer) → NPE tại `ServiceOrderConsumer.handleMessage`. Insert §3.5b (NEW) canonical V2 target schema + field mapping table + envelope-fix note (reuse `saveOutboxEvent()`/`KafkaMessageWrapper` helper pattern đã có trong cùng file), status "NOT YET IMPLEMENTED" (chờ DEV tạo class V2 riêng, đề xuất tên `ServiceOrderStatusChangedEventV2`). §2.1 row 6 note trỏ §3.5b. §5 Forbidden +2 rule (cấm dùng chung class V1 cho V2 publish; cấm thiếu envelope/`eventOccurredAt` trên V2 payload). **KHÔNG đụng**: §1 Producer summary, §2.1 row 5 (V1 topic), §3.5 V1 schema (giữ nguyên nguyên trạng — V1 publish path + `gf-inventory-worker` tolerance không đổi), §2.2/§3.1-§3.4/§3.6-§3.9 (Booking/Driver+/Notification/inactive shapes, không liên quan). Cascade: `ADR-026 v3` + `gf-inventory-events.md v12 §3.5`. v5 → v6. |
| 2026-05-07 | v1 | Initial events spec cho `sales` boundary: 13 outbound (6 confirmed `BookingStatusChanged`/`BookingCompleted`/`BookingCreateResponseEvent`/`ServiceOrderSync`/`ServiceOrderStatusChanged`/`NotificationRequest` + 7 `config-dto-only` gộp §3.7) + 2 external-source inbound từ Driver+ (`BookingCreateRequest`/`BookingCancelledByDriver`); topics `AC-DEV-BOOKING-EVENTS`/`AC-DEV-BOOKING-COMPLETED-TOPIC`/`AC-DEV-SERVICE-ORDER-SYNC`/`AC-NONPROD-DEV-SERVICE-ORDER-EVENTS`/`AC-NONPROD-DEV-NOTIFICATION-REQUEST`; envelope `KafkaMessageWrapper` + headers `MessageGroup=BOOKING|SERVICE_ORDER` với steps (`BOOKING.CHANGE.STATUS`/`BOOKING.CREATE.REQUEST`/`BOOKING.CREATE.RESPONSE`/`BOOKING.CANCELLED`/`COMPLETED`/`IN_PROGRESS.1`/`COMPLETED.1`/`CONFIRMED.1`/`DELIVERED.1`/`SENT.1`/`UPDATE.1`/`DELIVERED`/`SENT_NOTIFICATION`); reliability outbox + scheduled retry + inbox dedup cho Driver+; §4 Workflow correlation 3 chain (ServiceOrder lifecycle → inventory worker, Booking↔Driver+, Notification). Bao gồm producer summary, catalog split §2.1+§2.2, schemas 4-part + §3.7 inactive shapes, workflow correlation, forbidden patterns, references. |
| 2026-05-30 | v2 (frontmatter) | **Insurance Settlement cross-link (DESIGN — CR-1780147390, ADR-014)**: thêm §6 cross-link tới [gf-accounting-events.md](gf-accounting-events.md) — gf-sales consume `insurance-payment-recorded` (evict dashboard debt cache) + `insurance-settlement-cancelled` (reopen bổ trợ). gf-sales KHÔNG produce event BH (settle/reopen/snapshot qua REST). Không thêm row §2 (producer-view discipline — producer internal). |
| 2026-05-31 | v3 | **Resolve F5 (Delivery Lead)**: ghi rõ §6 consumer filter — topic `AC-DEV-ACCOUNTING-EVENTS`, `MessageGroup=INSURANCE_SETTLEMENT`, `MessageStep ∈ {PAYMENT_RECORDED.1, CANCELLED.1}`, inbox dedup theo messageId. |
| 2026-05-07 | v2 | Source-of-truth reconcile: strip 7 rows `config-dto-only` khỏi §2.1 (`ServiceOrderCreated/Started/Completed/Cancelled`, `PaymentRecorded`, `SalesCustomerVehicleProjected`, `TimeslotUpdated`); §2.1 còn 6 rows active. KG topic name fix: `AC-DEV-SALES-SERVICE-ORDER-EVENTS` → `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` (truyền qua config `kafka.topics.service-order-events`). DTO inactive vẫn document tại §3.7 cho developer reference. |
| 2026-06-03 | v4 | **Xoá consumer section gf-accounting events**: gf-accounting không publish event (v7). Cache debt widget → TTL-only. |
