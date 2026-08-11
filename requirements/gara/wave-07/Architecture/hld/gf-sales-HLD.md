---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 9
tier: T1
owner_authority: Architecture Authority
boundary: gf-sales
last_reviewed: "2026-08-10"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-sales-api.md
  - ../events/sales-events.md
  - ../data/gf-sales-data-model.md
  - ../decisions/ADR-014-insurance-settlement-ownership.md
  - ../decisions/ADR-015-insurance-debt-summary-strategy.md
  - ../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md
---

# HLD — `gf-sales`

## 1. Overview

`gf-sales` là service thương mại tuyến đầu của garage — sở hữu **booking + service order + settlement-facing state + quotation handoff + dashboard realtime + printing/export** và projection customer/vehicle phục vụ flow bán hàng/sửa chữa. **Java 21 + Spring Boot 3.5.0**; stateful BE (PostgreSQL system-of-record) + Kafka outbox/inbox cho event reliability + Temporal cho timer/reminder + multi-protected HTTP clients để đồng bộ ngang.

**Trách nhiệm:**
- Booking V2/V3 lifecycle (CRUD/search, confirm/arrive/cancel/decline, availability check, auto-cancel quá hạn).
- Service Order V2/V3 lifecycle (item/part/payment/document/note, OCR vehicle info, settle/reopen).
- Settlement aggregate hỗ trợ `gf-accounting` (actual quantity, finalize amount, customer/insurance settlement).
- Quotation Ask handoff sang `gf-purchase` (link SO ↔ quote, consume Driver Plus confirm/decline).
- Customer/vehicle projection local (sync với `gf-customer` qua protected API).
- Dashboard realtime counter (booking arrived chưa SO, SO in-progress, total debt theo tenant).
- Printing/export (preview/PDF/image) qua common-printing strategy V1/V3/settlement.
- Walk-in auto-booking: tự động tạo Booking ARRIVED (WALK_IN) khi SERVICE order tạo không có bookingId (BR-GF-SALES-016).
- Event reliability: Outbox (publish bền vững) + Inbox (idempotent consume Driver Plus).

**Owned epic**: boundary cornerstone — phục vụ commerce flow xuyên 7 service downstream, không map 1 epic Product cụ thể.

> **Driver+ integration rewrite (DESIGN — W07, FEAT-BOOK-DRIVERPLUS-INBOUND/OUTBOUND, ADR-029)**: viết lại cơ chế relay booking 2 chiều **đang chạy production** (không phải greenfield). `gf-sales` giữ nguyên ownership adapter Driver+ (`BookingDriverPlusConsumer` trên `AC-DEV-BOOKING-EVENTS`, KHÔNG qua `gf-erp-agent`), giữ nguyên topic + `MessageGroup` + 4 `MessageStep` production. Delta thuần **additive**: adapter validation gate (5 trường bắt buộc + bước 15 phút → `ERR-BOOK-001`), payload inbound 14 trường tài liệu hoá đủ, 2 field mới trên `BookingStatusChanged` (`cancelSource` bắt buộc khi hủy + `driverPlusStatus` 5 nhãn chuẩn hoá), 1 `MessageStep` mới `BOOKING.CANCEL.RESPONSE` (`ERR-BOOK-002`), gate hủy riêng rộng hơn garage tự hủy (`BR-BOOK-022` ≠ `BR-BOOK-013`), gate phạm vi publish theo nguồn booking. Bảng DELTA đầy đủ + cutover: [`gf-sales-events.md`](../events/gf-sales-events.md) §2bis. Chi tiết §9.

> **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, ADR-014)**: gf-sales làm chủ **compute** phía SO — Nguồn TT per dòng (`payer`) + **5 khoản điều chỉnh BH** nhập ở SO Edit/Detail (KHÔNG Create — BR-INS-SO-PS-006), tính "BH/KH thanh toán" theo Cộng-sau-VAT per payer (BR-EP §7.2, derived realtime), cung cấp **snapshot** cho gf-accounting khi tạo Phiếu QT BH (extend `/for-settlement` — CB-INS-002), và **widget công nợ BH** trên Dashboard (aggregation gọi REST gf-accounting debt-summary — CB-INS-008). gf-accounting làm chủ Phiếu QT BH/Hồ sơ/đối soát (ADR-014). Chi tiết §10.

## 2. Component Diagram (C4 Level 3)

```
┌────────── gf-sales  (Java 21 · Spring Boot 3.5.0) ──────────┐
│  ┌────────────┐ ┌──────────────────┐ ┌─────────────┐        │
│  │ BookingCtrl│ │ ServiceOrderCtrl │ │ Dashboard   │        │
│  │ V2/V3      │ │ V2/V3            │ │ RealTimeCtrl│        │
│  └─────┬──────┘ └────────┬─────────┘ └──────┬──────┘        │
│  ┌─────┴──────────────────┴─────┐ ┌─────────┴──────┐        │
│  │ Booking/SO Consumer          │ │ Auto-cancel    │        │
│  │  (Driver Plus → inbox dedup) │ │ scheduler (60m)│        │
│  └───────────────┬──────────────┘ └───────┬────────┘        │
│  ┌──────────────▼─────────────────────────▼───────┐         │
│  │ APP / DOMAIN SERVICES                          │         │
│  │  BookingService · ServiceOrderService          │         │
│  │  SettlementService · QuotationAskService       │         │
│  │  Customer/Vehicle projection (read-only)       │         │
│  │  Dashboard counters+cache · Printing V1/V3     │         │
│  │   - walk-in auto-booking (BR-GF-SALES-016)     │         │
│  │   - cross-boundary check → gf-customer/...     │─────────┼─► (see fan-out below)
│  ├────────────────────────────────────────────────┤         │
│  │ Temporal workers (GF-SALES-BOOKING-QUEUE):     │─────────┼─► Temporal Cloud  GF-SALES-BOOKING-QUEUE
│  │  BookingWorkflow · NoShowCheckWorkflow (30m)   │         │
│  │  · QuotationReminderWorkflow (1h×3)            │         │
│  └─────┬───────────────────────────┬──────────────┘         │
│  ┌─────▼──────┐ ┌─────────────────┐ ┌─────────────┐         │
│  │ JPA/Flyway │ │ Kafka Outbox    │ │ HttpClients │         │
│  │ persistence│ │ Processor+prod  │ │ (protected  │─────────┼─► gf-customer    (projection sync)
│  │            │ │ 14 topics       │ │  REST, R4j) │─────────┼─► gf-purchase    (quotation handoff)
│  │            │ │ Redis lock,     │ │             │─────────┼─► gf-inventory   (parts/stock)
│  │            │ │ batch10/poll10s │ │             │─────────┼─► gf-erp-mdm     (catalog)
│  │            │ │ /retry5×        │ │             │─────────┼─► gf-hrms        (employee)
│  └─────┬──────┘ └────────┬────────┘ └─────────────┘─────────┼─► ct-saas-tenant (tenant info)
│  Feature flags:                                             │
│   SALES_MANAGEMENT_FFLAG (class BookingV3/SOrderV3Ctrl)     │
│   BASIC_DASHBOARD_KEY_FFLAG (DashboardRealTimeCtrl)         │
│   CUSTOMER_VEHICLE_MANAGEMENT_FFLAG (method-level SO)       │
│  outbox │ /api/v1..v3/* │ /protected/v1/* │ Actuator+OTLP   │
└────────┴────────────────┴───────────────────────────────────┘
        ▼                ▼
   PostgreSQL [dev_gf_sales]    Kafka: 14 topics publish ;
   + Redis (cache + dist lock)  Driver Plus booking/SO subscribe
```

## 3. Key Design Decisions

| Decision | Rationale | ADR / Reference |
|---|---|---|
| V2 + V3 booking/SO API cùng tồn tại | Migration dần từ legacy; không thể big-bang vì client (Driver Plus, portal) chưa cùng phiên bản | TBD ADR (deprecation policy) — open item HLD-SALES-001 |
| Local projection customer/vehicle (booking/SO ref local snapshot) | SO/booking phải đứng vững khi `gf-customer` chậm hoặc thay đổi schema | TBD ADR (projection sync policy) — open item HLD-SALES-002 |
| Outbox pattern publish event | Atomic state change + Kafka publish; retry-safe sau transaction commit | TECHSTACK §events, `events/_CONVENTIONS.md` |
| Inbox pattern consume Driver Plus | Chống xử lý duplicate khi Kafka redeliver; unique event_id constraint | `events/_CONVENTIONS.md` §inbox |
| Temporal cho timer/reminder (no-show, quotation, booking lifecycle) | Workflow có await/signal/timer rõ ràng hơn cron job; durable retry | TECHSTACK §temporal |
| Redis distributed lock cho OutboxProcessor | Multi-replica nhưng publisher phải singleton tránh duplicate publish | TECHSTACK §redis |
| Printing strategy pattern (V1/V3/settlement) | 3 template render khác nhau — tách strategy giúp template không leak vào service | open item — kiểm soát data builder |
| Flyway migration + JPA `ddl-auto=validate` | Migration source rõ ràng; entity và migration phải đồng bộ | TECHSTACK §migration |
| Feature flag `SALES_MANAGEMENT_FFLAG` gate V3 API | Strict rollout V3 — disable flag = V3 controllers không phục vụ (THROW_EXCEPTION) | source `@FeatureOn` |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| Garage portal / API client (operator UI) | Sync REST `/api/v1..v3/*` | Booking, SO, settlement, dashboard, printing workflow |
| `gf-accounting` | Sync REST `/protected/v1/*` + `/api/v3/*` | Settlement: settle/reopen/for-print/for-settlement (protected) + find-by-codes batch lookup (public v3) |
| `gf-inventory` | Sync REST `/protected/v1/*` | SO detail for delivery validation |
| `gf-customer` | Sync REST `/protected/v1/*` | Vehicle summaries aggregation |
| `gf-worker` | Sync REST `/protected/v1/*` | Cron trigger: booking auto-cancel every ~1m |
| Driver Plus | Async consume Kafka | `BOOKING.CREATE.REQUEST`, `BOOKING.CANCELLED`, `QUOTATION.CONFIRMED/DECLINED` |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-customer` | Sync REST | Customer/vehicle CRUD, upsert, interactions, visit/spent metrics |
| `gf-purchase` | Sync REST | Quotation ask status lookup |
| `gf-inventory` | Sync REST | SO delivery summary (chặn delivery duplicate qua `delivery_event_sent`) |
| `gf-erp-mdm` | Sync REST | Catalog + car hierarchy + unit catalog (printing/SO context) |
| `ct-saas-tenant` | Sync REST | Tenant/company/user/operation-area info |
| `gf-hrms` | Sync REST | Employee context (advisor/technician cho printing) |
| OCR Vehicle Registration | Sync REST | OCR đăng kiểm xe parsing (`INTERNAL_TOKEN_OCR`) |
| Kafka | Async publish | 8 outbox event types: booking-completed/status-changed/create-response, SO status-changed/sent/updated/sync, notification-request |
| Kafka | Async consume | 4 inbox event types: Driver Plus booking + quotation |
| Redis | Cache + dist lock | Cache booking/SO/customer/vehicle/timeslot/external + outbox singleton lock |
| Temporal Cloud | gRPC | Task queue `GF-SALES-BOOKING-QUEUE`, 3 workflows |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_sales}` |

## 5. Data Ownership

**Owned (PostgreSQL `gf_sales` schema)** — chi tiết physical schema xem [data/gf-sales-data-model.md](../data/gf-sales-data-model.md):

| Aggregate | Bảng chính | Invariant |
|---|---|---|
| Booking | `booking`, `booking_details`, `booking_status_history`, `timeslots` | Status transition hợp lệ; bookedAt ↔ timeslot nhất quán |
| Service Order | `service_order` + child (`_item`, `_part`, `_payment`, `_document`, `_note`) | Totals + payment status + delivery flag + settlement state đồng bộ |
| Customer/Vehicle projection | `customer`, `contact`, `vehicle`, `vehicle_registration` | Projection-only; không diverge dài với `gf-customer` |
| Quotation Ask | `quotation_asks` | Code unique; status đồng bộ với `gf-purchase` + Driver Plus |
| OCR | `ocr_vehicle_info_history` | Lưu OCR raw response |
| Event durability | `outbox_event`, `inbox_event` | Outbox idempotent retry-safe; inbox unique `(event_id, type)` |
| Sequence | `sequences`, function `get_next_number` | Sinh mã nghiệp vụ (booking code, SO code, quotation code) |

Tenant strategy: column `tenant_id` trực tiếp trên booking/SO/customer/vehicle/quotation/inbox. **Outbox không có `tenant_id`** — phải nằm trong payload/headers (open: HLD-SALES-003).

**KHÔNG own**:
- Customer master (`gf-customer` SoT) — gf-sales chỉ giữ projection
- Inventory stock movement (`gf-inventory`) — gf-sales chỉ phát SO summary
- Purchase quotation/báo giá phụ tùng (`gf-purchase`)
- Accounting ledger sau khi settlement chốt (`gf-accounting`)
- MDM catalog/car hierarchy/unit (`gf-erp-mdm`)
- OCR engine (`ocr-car-registration`) — gf-sales chỉ gọi và lưu history

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Booking create/update p95 | ≤ 500ms (warm cache) |
| Service Order create p95 (incl. customer sync + OCR optional) | ≤ 1.5s |
| Settlement create/finalize p95 | ≤ 800ms |
| Dashboard realtime counter p95 | ≤ 200ms (Redis cache hit) |
| Printing PDF render p95 | ≤ 3s (cache MDM/tenant warm) |
| Auto-cancel booking | sau **60 min** quá hạn (`BOOKING_AUTO_CANCEL_TIMEOUT_MINUTES`) |
| No-show check trigger | **30 min** sau scheduled time (`BOOKING_NO_SHOW_DELAY`) |
| Booking confirmation timeout | **24h** sau create (`BOOKING_CONFIRMATION_TIMEOUT`) |
| Quotation reminder | mỗi **1h**, tối đa 3 lần (`QUOTATION_REMINDER_INTERVAL`) |
| Outbox throughput | batch 10 / poll 10s / retry max 5× / send timeout 30s |
| Outbox stale recovery | re-pick sau **5 min** (`OUTBOX_STALE_PROCESSING_SECONDS=300`) |
| Cache TTL | booking/SO 30 min · customer/vehicle 1h · timeslot 15 min · external 5 min · MDM/tenant 1h |
| Downstream HTTP timeout | connect 5s / read 30s / pool max 100 |
| Multi-replica deployment | min ≥ 2 (HPA); OutboxProcessor giữ singleton qua Redis lock 60s |
| Schema migration | Flyway + JPA `ddl-auto=validate` |
| Runtime | Java 21, Spring Boot 3.5.0 |

## 7. Performance & Scale (SaaS multi-tenant)

> Bổ sung §6 Quality Attributes (per-operation target) bằng góc nhìn **scale multi-tenant**. Số liệu chưa có trong PRD/NFR → **propose** (xem Open Questions của wave).

### 7.1. Expected load

| Metric | Target | Source |
|---|---|---|
| QPS peak per tenant — REST booking/SO | 30 req/s | Propose — màn list/detail là hot path vận hành hằng ngày của garage |
| QPS peak toàn service | 300 req/s | Propose — `gf-sales` là boundary tuyến đầu, tải cao nhất trong 17 boundary |
| p95 latency (read list) | ≤ 400 ms | Nhất quán §6 (booking create/update ≤ 500ms) |
| p95 latency (write) | ≤ 500 ms | §6 |
| **Kafka consume lag p95 — Driver+ inbound** | ≤ 5 s | `gf-sales-events.md` §2.2 SLA (baseline production, W07 không đổi) |
| **Throughput Driver+ inbound** | ≤ 5 msg/s/tenant | Propose — booking từ app tài xế; peak giờ cao điểm sáng/chiều |
| Tenant count assumption | 500 tenant active | Propose — cùng giả định các boundary khác |

### 7.2. Pagination strategy

- List endpoint booking/SO dùng **offset pagination** sẵn có (`POST /api/v*/bookings/search`, `PagedApiResponse<T>`) — giữ nguyên, tổng row per tenant < 10k trong kỳ vận hành thông thường.
- Default page size 20, max 100.
- W07 **không** thêm list endpoint mới (tích hợp Driver+ thuần Kafka) → không phát sinh quyết định pagination mới.

### 7.3. Index list

> **Bắt buộc**: index của bảng tenant-scoped bắt đầu bằng `(tenant_id, ...)`.

| Query pattern | Index | Table | Note |
|---|---|---|---|
| **(W07 mới)** Rà soát booking nguồn Driver+ theo trạng thái + gate publish outbound | `(tenant_id, lead_source, status)` — `idx_booking_tenant_lead_source_status` | `booking` | INBOUND AC-8 · OUTBOUND EC-2 · `gf-sales-data-model.md` §2ter.1 |
| Lookup booking theo mã | `(code)` UNIQUE — `idx_booking_code` | `booking` | Baseline (unique toàn cục, không cần tenant prefix) |
| List booking arrived chưa có SO (dashboard) | `(tenant_id, status) WHERE status='ARRIVED'` — `idx_booking_tenant_status_arrived` | `booking` | Baseline — đã tenant-prefix |
| Lookup booking theo tenant | `(tenant_id)` — `idx_booking_tenant_id` | `booking` | Baseline |

> **Nợ kỹ thuật (pre-existing, KHÔNG phát sinh từ W07)**: `idx_booking_status(status)`, `idx_booking_booked_at(booked_at)`, `idx_booking_lead_source(lead_source)`, `idx_booking_driver_id(driver_id)` **thiếu** prefix `(tenant_id, ...)` dù `booking` tenant-scoped. W07 không sửa (cần đo tác động query plan trên prod trước) — flag vào Open Questions; index **mới** của W07 tuân thủ đầy đủ.

### 7.4. Cache strategy

| Cache key | Layer | TTL | Invalidation |
|---|---|---|---|
| `booking:{tenantId}:{bookingId}` · `so:{tenantId}:{soId}` | Redis | 30 min | §6 baseline — evict sau mutation |
| `dashboard:{tenantId}:*` | Redis | theo §6 | Baseline |
| `insurance-debt:{tenantId}:{period}` | Redis | 5 min | ADR-015, TTL-only |
| **Driver+ inbound/outbound payload** | — | — | **KHÔNG cache** — event-driven, mỗi message xử lý 1 lần rồi dedupe qua `inbox_event`. Không có read-path cần cache mới ở W07 |

### 7.5. N+1 avoidance

| Endpoint / query | Pattern | Mitigation |
|---|---|---|
| `POST /api/v*/bookings/search` (list + snapshot khách/xe) | List + nested snapshot | `booking_details` là quan hệ 1-1 (unique `booking_id`) → JOIN 1 lần, không lặp per-row |
| **(W07)** Consumer inbound Driver+ | 1 message = 1 booking | Lookup theo `bookingId`/`code`; không fan-out, không loop query |
| **(W07)** Publish outbound theo nguồn | Gate per-booking | Trạng thái `lead_source` đã có sẵn trên chính entity đang xử lý — **không** query thêm để quyết định gate |

### 7.6. Tenant fairness / rate limit

- **Rate limit REST**: 50 req/s per tenant trên nhóm booking/SO (propose); vượt → `429`.
- **Kafka consumer bulkhead (W07)**: `BookingDriverPlusConsumer` giữ concurrency hiện tại; partition key theo aggregate (`Booking-{bookingCode}`, `_CONVENTIONS.md` §4.1) → 1 tenant burst không chiếm trọn partition của tenant khác, đồng thời bảo toàn thứ tự create/cancel cùng booking (INBOUND EC-2).
- **Message lỗi nghiệp vụ** (payload sai, booking không tồn tại) → publish response event + **ack**, KHÔNG retry vô hạn (OUTBOUND AC-11 — "Driver+ không retry vô hạn").
- **Outbox**: batch 10 / poll 10s / retry max 5× (§6); `OutboxProcessor` singleton qua Redis lock 60s — multi-replica safe. W07 thêm ≤ 2 event/booking transition, không đổi sizing.
- **Circuit breaker**: Resilience4j cho downstream HTTP client (`gf-customer`, `gf-accounting`) — không đổi ở W07 (luồng Driver+ không có REST đồng bộ).

## 8. Forbidden Actions

- ❌ Cross-tenant query không scope `tenant_id` (BR-GF-SALES-014; open HLD-SALES-003 — outbox missing tenant column phải chèn vào headers).
- ❌ Modify trực tiếp customer/vehicle master local rồi không sync ngược về `gf-customer` (BR-GF-SALES-014 — projection ≠ SoT).
- ❌ Bypass outbox để `kafkaTemplate.send()` trực tiếp trong transaction (BR-GF-SALES-013; TECHSTACK §outbox-inbox).
- ❌ Skip Inbox unique check trên Driver Plus consumer (BR-GF-SALES-012; `events/_CONVENTIONS.md` §inbox).
- ❌ Hard-delete booking / service order / quotation_asks (BR-GF-SALES-001/005 status machines — audit invariant; dùng status `CANCELLED` / `ABORTED` / `DECLINED`).
- ❌ Log raw payment payload có chứa PII hoặc dữ liệu thanh toán nhạy cảm (PCI scope; OCR raw cũng cần masking).
- ❌ V2 và V3 cùng ghi 1 booking/SO concurrent (BR-GF-SALES-001/005; open HLD-SALES-001 — chưa có aggregate lock, phải route qua 1 path duy nhất).
- ❌ Bật `TEMPORAL_ENABLED=true` khi worker activities chưa register đầy đủ (open HLD-SALES-006).
- ❌ Public expose protected cache delete endpoint (`/protected/v1/printing/cache/*`) — blast radius xóa cache toàn hệ thống (open HLD-SALES-009).
- ❌ Tạo RETAIL order với `bookingId = null` mà không kiểm tra `orderType` (BR-GF-SALES-016 — auto-booking chỉ áp dụng SERVICE; RETAIL phải skip).
- ❌ Accept payment vượt `debtAmount` (BR-GF-SALES-015 — BusinessException ST-01; rounding tolerance chỉ áp dụng khi clearing).
- ❌ **(W07)** Publish `BookingStatusChanged` với `toStatus ∈ {CANCELLED, NO_SHOW}` mà thiếu `cancelSource` (`BR-BOOK-023`).
- ❌ **(W07)** Map `driverPlusServiceType` vào `booking.service_type` hoặc danh mục dịch vụ `gf-erp-mdm` (INBOUND AC-3 — 2 danh mục độc lập).
- ❌ **(W07)** Bắt garage duyệt yêu cầu hủy đến từ Driver+ (`BR-BOOK-022` — áp dụng tự động khi đủ điều kiện gate).
- ❌ **(W07)** Dùng gate `BR-BOOK-013` (garage tự hủy) cho yêu cầu hủy từ Driver+ — gate riêng `BR-BOOK-022`, rộng hơn.
- ❌ **(W07)** Sinh `eventId` mới khi retry cùng 1 lần đổi trạng thái (OUTBOUND AC-9 — phá dedupe phía Driver+).
- ❌ **(W07)** Nhận/lưu/tra cứu consent chia sẻ thông tin trong payload đặt lịch (`BR-BOOK-025` — Driver+ tự lưu).
- ❌ Index bảng tenant-scoped **mới** không có prefix `(tenant_id, ...)` — cross-tenant data leak (index cũ: xem nợ kỹ thuật §7.3).

## 9. Driver+ integration — gf-sales scope (DESIGN — W07)

> Rewrite cơ chế **đang chạy production**. Bảng DELTA 12 dòng + cutover: [`gf-sales-events.md`](../events/gf-sales-events.md) §2bis. Quyết định giao thức: [ADR-029](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md).

### 9.1 Capabilities

- **Adapter validation gate (inbound)** — 5 trường bắt buộc + `appointmentTime` bước 15 phút; fail → `BOOKING.CREATE.RESPONSE` `success=false` + `ERR-BOOK-001`, **không** tạo booking (INBOUND AC-2/EC-3 · OUTBOUND AC-10).
- **Payload 14 trường** — 13 trường ánh xạ cột `booking`/`booking_details` **đã tồn tại**; 1 cột mới `driverplus_service_type` lưu nguyên văn (INBOUND AC-2/AC-3).
- **Gate hủy 3 nhánh** — áp dụng tự động (`BOOKING`/`BOOKED`, chưa có phiếu DV) · không đủ điều kiện → đồng bộ trạng thái **thực tế** · không tìm thấy booking → `BOOKING.CANCEL.RESPONSE` + `ERR-BOOK-002` (INBOUND AC-6/7/8 · OUTBOUND AC-5/AC-11).
- **Outbound state sync** — `BookingStatusChanged` + `cancelSource` + `driverPlusStatus`; chỉ cho booking nguồn Driver+ (OUTBOUND AC-1..AC-5, EC-2).
- **Feature flag** `Booking:DriverPlus` (`FeatureFlagService.isEnabled()` programmatic inline tại adapter layer, KHÔNG annotation) — flag `off`: ngừng nhận inbound + ngừng gửi outbound; booking D+ đã tồn tại không ảnh hưởng.

### 9.2 Invariants / forbidden (bổ sung §8)

- Outbound push fail **KHÔNG** rollback state cục bộ; retry qua outbox độc lập với transaction nghiệp vụ (`BR-BOOK-024` · OUTBOUND AC-7). Hết retry → ghi ngoại lệ cho vận hành, **không** tự suy kết quả (OUTBOUND AC-8).
- `cancel_source` ghi nội bộ cho **mọi** booking hủy (không phân biệt nguồn); chỉ **payload outbound** mới bắt buộc có field (`BR-BOOK-023`).
- Emit phiếu DV/QT sang Driver+ **không** thuộc scope feature này — thuộc `FEAT-SO-DETAIL` / `FEAT-STL-CREATE` theo boundary ownership (OUTBOUND §Không cover). **Đã thiết kế riêng tại §9.3** (ADR-031).
- Đồng bộ khi **sửa nội dung** lịch hẹn giữ nguyên `FEAT-BOOK-EDIT` AC-15 (`BOOKING.UPDATE.RESPONSE`) — **khác** luồng đồng bộ trạng thái vòng đời (`BOOKING.CHANGE.STATUS`) của feature này.

### 9.3 Đồng bộ chứng từ sang Driver+ (DESIGN — ad-hoc 2026-08-10, ADR-031)

> Nửa thứ 3 của tích hợp, tách khỏi booking relay. Contract canonical: [`gf-sales-events.md`](../events/gf-sales-events.md) §2ter/§3.10/§3.11. Quyết định: [ADR-031](../decisions/ADR-031-driver-plus-document-sync.md).

**Capabilities**

- **Emit phiếu dịch vụ** khi SO chuyển "Hoàn thành" + SO liên kết booking nguồn Driver+ (`FEAT-SO-DETAIL` AC-17 / `BR-SO-DTL-007`) — step `DOCUMENT.SERVICE_ORDER.SYNC` trên topic mới `AC-DEV-DOCUMENT-EVENTS`.
- **Thu hồi** khi phiếu đã emit sau đó chuyển "Đã huỷ" (AC-24) — step `DOCUMENT.SERVICE_ORDER.REVOKED`.
- **Tệp qua URL**: render PDF (`V1PrintStrategy`, cùng template `export-pdf`) → upload `ct-file-storage` → payload mang `fileUrl` + `checksum` + `expiresAt` (TTL 30 ngày). KHÔNG nhúng binary.
- **Feature flag** `Document:DriverPlus`, độc lập `Booking:DriverPlus`.
- **Không** endpoint REST mới, **không** bảng/cột mới — tái dùng `outbox_event` (ADR-031 D6).

**Invariants / forbidden (bổ sung §8)**

- `eventId` = `UUIDv5(NS_DP_DOCUMENT, documentCode + "|" + documentType)` — **không** sinh mới khi phát lại (D+ dedupe theo khoá này).
- Render PDF / upload / publish fail → **KHÔNG** rollback trạng thái SO đã "Hoàn thành"; ghi ngoại lệ cho vận hành.
- Không publish chứng từ lên `AC-DEV-BOOKING-EVENTS`; không emit cho SO ngoài nguồn Driver+.

**Performance & Scale (bổ sung §7)**

- Bước nặng là **render PDF + upload** (đồng bộ trong luồng hoàn thành SO): giữ trong ngân sách `Printing PDF render p95 ≤ 3s` của §7.1; upload `ct-file-storage` timeout 10s, không retry đồng bộ (fail → ngoại lệ vận hành, không kéo dài transaction).
- Tần suất thấp: ≤ 1 event / SO hoàn thành / tenant — không cần index mới, không cần cache; outbox poll 10s sẵn có đủ tải.
- Tenant fairness: dùng chung outbox scheduler + Redis lock hiện hữu (§7.6) — không thêm luồng nền mới.

## 10. Insurance Settlement — gf-sales scope (DESIGN — EP-INSURANCE-SETTLEMENT)

> ⚠️ Thiết kế . gf-sales làm **compute + snapshot provider + debt widget**; gf-accounting làm record/dossier. Additive — không phá flow SO hiện hữu.

### 10.1 Capabilities

- **InsuranceAdjustment compute** (FEAT-INS-SO-ADJUSTMENT): 5 khoản (CK liên kết vật tư, CK liên kết công DV, Khấu hao % phụ tùng, Giảm trừ bồi thường, Khấu trừ BH) nhập ở SO **Edit/Detail** (BR-INS-SO-PS-006). Tính breakdown per payer (Cộng-sau-VAT) + BH/KH thanh toán **derived realtime** (BR-EP §7.2) — lưu input qua **8 scalar adjustment columns** trên `service_order` + `service_order_part.depreciation_percent`; breakdown per payer lưu qua **8 scalar breakdown columns** (không JSONB). Logic tính toán **inline trong SO service** (không domain service riêng).
- **Snapshot provider** (CB-INS-002): extend `GET /protected/v1/.../for-settlement` trả adjustments (8 scalar columns) + breakdown per payer (8 scalar columns) + insurancePayableAmount cho gf-accounting freeze (amount tính inline ở gf-sales — gf-accounting không tự tính).
- **Insurance debt widget** (FEAT-INS-DASH-DEBT): `GET /api/v2/dashboard/insurance-debt-widget` — 3 KPI + 2 top-list, filter kỳ (5 giá trị). Aggregation gọi REST gf-accounting `/protected/v1/insurance-debt-summary` (CB-INS-008, ADR-015), cache Redis TTL 5 phút (ADR-015) — không event eviction.

### 10.1bis Error contract (canonical `INS_*` — CR-1780980611)

- Validation khoản điều chỉnh BH **emit `INS_*` registry code trực tiếp** (BR-EP §5.5) + đúng HTTP status, surface FE qua GraphQL `extensions.code` (FE bind theo code). Chi tiết mã: [gf-sales-api.md §3bis.4](../api/gf-sales-api.md). Đổi hành vi: `%`/amount sai 400 → **422**; BH thanh toán < 0 reject 400 → **warning 200 non-block** (`INS_ADJ_BH_PAYMENT_NEGATIVE`).

### 10.2 Invariants / forbidden (bổ sung §8)

- ❌ Hiển thị section điều chỉnh + cột Nguồn TT ở màn **Create** SO (chỉ Edit/Detail — BR-INS-SO-PS-006).
- ❌ Áp khấu hao cho dòng công DV (chỉ phụ tùng BH — BR-INS-SO-ADJ-005).
- ❌ Query DB gf-accounting trực tiếp cho widget công nợ — phải qua REST debt-summary (CB-INS-008).
- ❌ Dùng event làm nguồn số liệu công nợ chính (cache TTL 5 phút — ADR-015; số liệu = REST).
- ❌ Throw raw exception / mã ad-hoc cho lỗi điều chỉnh BH — phải map về `INS_*` (CR-1780980611, BR-EP §5.5).

## 11. References

- **TECHSTACK**: §events (outbox + Kafka), §temporal, §redis, §HTTP client
- **API spec**: [gf-sales-api.md](../api/gf-sales-api.md)
- **Events spec**: [sales-events.md](../events/sales-events.md) — 15 event families (8 producer + 4 consumer + 3 config-only)
- **Workflows**:
  - [sales-booking-lifecycle-flow.md](../workflows/sales-booking-lifecycle-flow.md) — booking V3 + lifecycle + Driver Plus inbound
  - [sales-complete-flow.md](../workflows/sales-complete-flow.md) — service order full path (create → start → quotation → settlement → printing)
- **Business rules**: BR-GF-SALES-001..019 (19 rules; cornerstone: 001-013, 016) — in KG `gf-sales.knowledge-graph.yaml`
- **Data model**: [gf-sales-data-model.md](../data/gf-sales-data-model.md) — physical schema đầy đủ
- **Cross-link HLD**:
  - [gf-customer-HLD.md](gf-customer-HLD.md) — projection sync source
  - [gf-purchase-HLD.md](gf-purchase-HLD.md) — quotation ask consumer
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — SO delivery handoff
  - [gf-accounting-HLD.md](gf-accounting-HLD.md) — settlement downstream
  - [gf-worker-HLD.md](gf-worker-HLD.md) — cron trigger auto-cancel
- **Insurance Settlement (DESIGN)**: [gf-sales-api.md §3bis](../api/gf-sales-api.md), [gf-sales-data-model.md §2bis](../data/gf-sales-data-model.md), [gf-accounting-events.md](../events/gf-accounting-events.md) (consume), ADR-014/015; Product EP-INSURANCE-SETTLEMENT + BR-EP (FEAT-INS-SO-ADJUSTMENT, FEAT-INS-DASH-DEBT).
- **Driver+ integration rewrite (DESIGN — W07)**: [gf-sales-events.md §2bis + §3.1/§3.3/§3.8/§3.9/§3.9bis](../events/gf-sales-events.md), [gf-sales-data-model.md §2ter](../data/gf-sales-data-model.md), [gf-sales-api.md §5 Naming Registry](../api/gf-sales-api.md), [INTEG-EXT-driver-plus.md](../integrations/INTEG-EXT-driver-plus.md), **ADR-029**; Product `FEAT-BOOK-DRIVERPLUS-INBOUND` + `FEAT-BOOK-DRIVERPLUS-OUTBOUND` + `BR-GF-SALES.md` §1 BR-CROSS-006 + §2.1 BR-BOOK-005/013/022/023/024/025 + §3.1 + `ERROR-CODE-REGISTRY.md` §6.


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-10 | v9 | **§9.3 MỚI — đồng bộ chứng từ sang Driver+ (ADR-031)**: emit phiếu dịch vụ khi SO "Hoàn thành" (`FEAT-SO-DETAIL` AC-17 / `BR-SO-DTL-007`) + thu hồi khi huỷ, topic mới `AC-DEV-DOCUMENT-EVENTS`, tệp qua URL TTL 30 ngày, flag `Document:DriverPlus`, không endpoint/bảng/cột mới. Kèm khối Invariants + Performance & Scale bổ sung cho §7/§8. §9.2 bullet "emit phiếu DV/QT ngoài scope" nay trỏ §9.3. **KHÔNG đụng** §1–§8, §9.1/§9.2 còn lại, §10, §11. v8 → v9. |
| 2026-08-05 | v8 | **W07 Driver+ integration rewrite (DESIGN) + §7 Performance & Scale (mới)**. §1 Overview +callout Driver+ rewrite (brownfield, delta additive, giữ nguyên topic/group/4 step production). **§7 Performance & Scale mới, 6/6 item** — expected load (bổ sung Kafka lag + throughput Driver+ inbound), pagination (không phát sinh mới ở W07), index list (+1 index mới `(tenant_id, lead_source, status)` tenant-prefix; **flag nợ kỹ thuật** 4 index `booking` hiện hữu thiếu tenant-prefix — không sửa trong wave này), cache (Driver+ không cache), N+1 avoidance, tenant fairness (bulkhead consumer + partition key theo aggregate). §7 Forbidden cũ renumber → **§8** (+7 rule W07). **§9 mới "Driver+ integration — gf-sales scope"** (capabilities + invariants). §8 Insurance renumber → **§10** (sub-section 8.1/8.1bis/8.2 → 10.1/10.1bis/10.2). §9 References → **§11** (+block W07). Frontmatter `depends_on` +ADR-029. **KHÔNG đụng**: §2 C4 diagram, §3 Key Design Decisions, §4 Dependencies, §5 Data Ownership, §6 Quality Attributes, nội dung §10 Insurance. v7 → v8. |
| 2026-06-09 | v7 | **+§8.1bis Error contract (`INS_*` — CR-1780980611)**: validation điều chỉnh BH emit registry code trực tiếp + đúng status (FE bind `extensions.code`); đổi hành vi `%`/amount 400→422, BH<0 reject→warning 200; +Forbidden bullet (no raw exception/ad-hoc code). Trỏ gf-sales-api §3bis.4, BR-EP §5.5. |
| 2026-06-03 | v6 | **Flatten JSONB + xoá event + inline calc**: §8 — thay JSONB references bằng scalar columns; bỏ `InsuranceAllocationCalculator` → inline trong SO service; bỏ event eviction → TTL-only cache. |
| 2026-05-31 | v5 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): cập nhật depends_on + §8/§9 references — debt-summary = ADR-015. |
| 2026-05-30 | v4 | **Insurance Settlement — gf-sales scope (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014/015)**: thêm §8 — compute 5 khoản điều chỉnh BH (Edit/Detail only), Cộng-sau-VAT per payer (derived realtime), snapshot provider extend `/for-settlement` (CB-INS-002), widget công nợ BH (REST debt-summary CB-INS-008). Forbidden bổ sung (Create không hiện điều chỉnh; khấu hao chỉ phụ tùng; no cross-boundary DB). §1 overview callout. Renumber References §8→§9. depends_on/references thêm ADR-014/015. |
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): một box service + sub-box xếp tầng hexagonal (inbound Ctrl/Consumer/Scheduler → APP/DOMAIN core → outbound JPA/Kafka/HttpClients) + connector `┬`/`▼` luồng gọi; **external service calls fan-out `───┼─►`**: 6 downstream REST (gf-customer/gf-purchase/gf-inventory/gf-erp-mdm/gf-hrms/ct-saas-tenant) + Temporal Cloud (GF-SALES-BOOKING-QUEUE); Kafka P/C (14 topics publish · Driver Plus subscribe) ở infra footer. Giữ đủ feature flags + retry/poll params + workflow timers. Không đổi nội dung §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 consistency audit: (GAP-1) thêm Java 21/SB 3.5.0 vào Overview + component diagram + §3 Decisions + §6 Quality; (GAP-2) thêm BR-GF-SALES-001..019 citations vào §7 Forbidden Actions; (GAP-3) xóa dead cross-link `ocr-car-registration-HLD.md` (file đã delete); (GAP-4) sửa `pino+OTel` → `Actuator+Prometheus+OTLP`; (GAP-5) thêm feature flags SALES_MANAGEMENT_FFLAG / BASIC_DASHBOARD_KEY_FFLAG / CUSTOMER_VEHICLE_MANAGEMENT_FFLAG vào diagram + §3; (GAP-6) mọi ❌ có BR-*/TECHSTACK/convention source; (GAP-7) thêm gf-accounting public v3 find-by-codes + gf-customer vehicle-summaries + gf-worker auto-cancel vào §4.1 Inbound; (GAP-8) thêm Business rules line vào §8; (GAP-9) thêm walk-in auto-booking BR-016 vào Overview + new forbidden action. |
| 2026-05-07 | v1 | Initial HLD cho `gf-sales`: commerce frontline service Garage — booking V2/V3 + service order V2/V3 + settlement-facing state + quotation handoff + dashboard realtime + printing. PostgreSQL `dev_gf_sales` aggregate `booking`/`booking_details`/`booking_status_history`/`timeslots`, `service_order` + child (`_item`/`_part`/`_payment`/`_document`/`_note`), customer/vehicle projection (`customer`/`contact`/`vehicle`/`vehicle_registration` sync với `gf-customer`), `quotation_asks`, `ocr_vehicle_info_history`, `outbox_event`/`inbox_event`, `sequences` + function `get_next_number`. Public REST `/api/v1..v3/*` + protected `/protected/v1/*` (settle/for-print). Kafka 14 topics: 8 outbox (booking-completed/status-changed/create-response, SO status-changed/sent/updated/sync, notification-request) + 4 inbox Driver Plus (`BOOKING.CREATE.REQUEST`, `BOOKING.CANCELLED`, `QUOTATION.CONFIRMED/DECLINED`). Temporal Cloud queue `GF-SALES-BOOKING-QUEUE` 3 workflow (`BookingWorkflow`, `NoShowCheckWorkflow` 30min, `QuotationReminderWorkflow` 1h × 3), auto-cancel sau 60min. Outbox singleton qua Redis lock 60s (batch 10, poll 10s, retry 5×). Downstream `gf-customer`/`gf-purchase`/`gf-inventory`/`gf-erp-mdm`/`gf-hrms`/`ct-saas-tenant`/`ocr-car-registration`. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
