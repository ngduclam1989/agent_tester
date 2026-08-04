---
document_id: GMS-E2E-SUITE
type: execution
artifact_kind: e2e-test-suite
status: ACTIVE
version: 2
tier: T4
owner_authority: QA Authority
last_reviewed: "2026-06-11"
supersedes: "v1 (SnapVersify copy — incorrectly imported)"
---

# E2E Test Suite — Garage

> Bộ kiểm thử end-to-end xuyên suốt hệ thống Garage, mô phỏng các luồng nghiệp vụ thực tế của 2 persona (`accountant`, `garage-owner`). Convert từ SV v1 sang Garage thực tế (18 boundary, dual persona, tenant isolation qua `TenantFilter`).

---

## 1. Mục đích

Bộ E2E Suite phục vụ 3 mục tiêu chính:

1. **Xác minh luồng nghiệp vụ thực tế (real-world business flows)** — đảm bảo 2 persona (`accountant`, `garage-owner`) hoàn thành journey xuyên qua nhiều boundary và domain (booking → SO → settlement, quotation → PR → PO, SO → delivery → inventory, customer → campaign, insurance settlement).
2. **Phát hiện lỗi tích hợp (integration gaps)** — bắt các vấn đề tại ranh giới giữa 18 boundaries: REST API contract mismatch, GraphQL schema drift, Kafka event schema drift, Temporal workflow saga rollback, cross-service auth failure, tenant isolation breach, outbox/inbox dedup violation.
3. **Hồi quy dài hạn (regression dài hạn)** — mỗi journey re-run khi boundary liên quan thay đổi, đảm bảo tính ổn định brownfield (15 wave production đã ship + post-baseline TD/feature work).

**Nguyên tắc thiết kế:**

- Mỗi journey là 1 chuỗi bước có thứ tự, **không mock** — gọi thật qua GraphQL BFF (`agg-garage-graph`/`agg-sso-graph`) hoặc REST `/api/v3/*` downstream.
- Dữ liệu test tạo trong journey, dọn dẹp sau journey (trừ audit log + Kafka outbox — append-only).
- Timeout journey: tối đa 10 phút per journey (bao gồm cả Temporal workflow async + ERP-bridge inbound).
- Fail policy: 1 step fail → journey FAIL → ghi bug `Tracking/WAVE{NN}/BUGS.md`, tag `[E2E]`.
- Tenant isolation enforced: mỗi journey chạy trong tenant context (`X-Tenant-Id`/`OriginTenantId`), KHÔNG cross-tenant DB/Kafka/REST.

---

## 2. Journey Registry

> Ground theo `CLAUDE.md §4` (18 boundary purposes) + `Execution/knowledge-graphs/*.yaml` (domain model). Mở rộng từ §4.3 của `Tracking/TEST-CASE-REGISTRY.md` (J-01..J-07).

### J-01: Booking → Service Order → Settlement (Wave Booking + SO + Settlement)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-01 |
| **Tên** | Booking → Service Order → Settlement (Customer-pay) |
| **Persona** | `accountant`, `garage-owner` |
| **Boundaries liên quan** | `agg-sso-graph`, `agg-garage-graph`, `gf-hrms`, `gf-sales`, `gf-accounting`, `gf-customer`, `garage-web`, `garage-mobile` |
| **Thời gian ước tính** | 3-5 phút |
| **TC tham chiếu** | Smoke: S-02, S-03, S-08; E2E: TC-W01-E2E-001, TC-W01-E2E-004 (insurance variant); Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Login kế toán | `agg-sso-graph`, `gf-hrms` | Mutation `login` qua `/sso/graphql` → Firebase token verify → session token + employee profile (role accountant, tenant `garage-a`) |
| 2 | Tạo Booking | `agg-garage-graph`, `gf-sales` | Mutation `createBooking` qua `/garage/graphql` → `gf-sales` tạo record (status "Lịch hẹn mới") với customer + vehicle reference (projection từ `gf-customer`) |
| 3 | Xác nhận → Tạo Service Order | `gf-sales` | Booking → "Đã xác nhận" → tạo SO gắn booking (status `ARRIVED`). Hoặc walk-in: tạo SO không gắn booking → hệ thống tự sinh booking walk-in (ARRIVED) |
| 4 | Cập nhật line items + Hoàn thành SO | `gf-sales` | Thêm dịch vụ + phụ tùng (source=INVENTORY hoặc DIRECT), update status `IN_PROGRESS` → `COMPLETED` |
| 5 | Tạo Settlement record (Customer) | `gf-accounting`, `agg-garage-graph` | Mutation `createSettlement` → `gf-accounting` `POST /api/v1/service-orders/{id}/settlements` pull snapshot → persist settlement KH. Callback `gf-sales` settle status `SETTLED` |
| 6 | Print invoice/biên nhận | `gf-accounting`, `garage-web` | Render printable view của settlement → xác nhận layout + tiếng Việt có dấu |

**Kết quả mong đợi:**

1. Booking status: "Lịch hẹn mới" → "Đã xác nhận" (hoặc walk-in tự sinh ARRIVED)
2. SO trải qua đúng chuỗi: `ARRIVED` → `IN_PROGRESS` → `COMPLETED` → `SETTLED`
3. Settlement record persist trong `gf-accounting`, status hợp lệ; số tiền khớp tổng SO
4. NO_SHOW/CANCELLED đều hiển thị "Đã hủy" trên UI (theo KG frontend)
5. Kafka events publish đúng qua outbox: `BookingCreated`, `ServiceOrderCompleted`, `SettlementCreated`
6. Print view render đầy đủ thông tin tenant + KH + dịch vụ + tổng tiền VND

---

### J-02: Quotation → Purchase Request → Purchase Order (Procurement)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-02 |
| **Tên** | Quotation → PR → PO (procurement approval flow) |
| **Persona** | `garage-owner` |
| **Boundaries liên quan** | `agg-sso-graph`, `agg-garage-graph`, `gf-purchase`, `gf-erp-mdm` (supplier MDM), `garage-web` |
| **Thời gian ước tính** | 3-4 phút |
| **TC tham chiếu** | Smoke: S-06, S-07; Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Tạo Quotation (Ask) | `gf-purchase` | Mutation `createQuotationAsk` → gửi yêu cầu báo giá tới supplier(s) từ MDM |
| 2 | Supplier nhận Bid | `gf-purchase` | Supplier nộp `quotation_bid` → match `quotation_ask_id` |
| 3 | Approve Bid → Tạo Purchase Request | `gf-purchase` | Garage-owner chọn bid → tạo PR với line items + amount + supplier |
| 4 | Approve PR → Tạo Purchase Order | `gf-purchase` | PR approved → PO created status `PENDING_DELIVERY` |
| 5 | Cart payment-reconciliation | `gf-purchase`, `gf-erp-agent` | (Optional) ghi nhận payment qua ERP-bridge nếu yêu cầu |

**Kết quả mong đợi:**

1. Quotation Ask/Bid lifecycle pass đầy đủ
2. PR approved trước khi sinh PO (BR-GF-PURCHASE-* enforced)
3. PO chứa `supplier_id` + `tenant_id` đúng, status hợp lệ
4. Hàng nhập kho từ PO → xem **J-06** (PO → Receipt → Inventory)

> **Out of scope J-02**: phần nhập kho và payment reconciliation đầy đủ (xem J-06 + ERP-integration wave).

---

### J-03: Customer → Campaign → Notification fan-out

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-03 |
| **Tên** | Customer segment → Campaign trigger → Notification fan-out |
| **Persona** | `garage-owner` |
| **Boundaries liên quan** | `gf-customer`, `gf-marketing`, `gf-notification`, `agg-garage-graph` |
| **Thời gian ước tính** | 4-6 phút (bao gồm Temporal campaign workflow) |
| **TC tham chiếu** | Smoke: S-10, S-14; Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Tạo/Update customer + vehicle | `gf-customer` | Master record customer + xe; emit projection event tới `gf-sales` (`gf-sales` giữ read-only projection) |
| 2 | Segment customer | `gf-customer`, `gf-marketing` | Định nghĩa segment (vd "Xe quá hạn bảo dưỡng") → `gf-marketing` Temporal workflow trigger campaign |
| 3 | Campaign tạo voucher + message template | `gf-marketing` | Render message từ template + sinh voucher (QR code) per recipient |
| 4 | Fan-out notification | `gf-notification` | `gf-notification` push tới user_devices (DynamoDB), in-app inbox, hoặc qua channel bên ngoài (SMS/Zalo nếu config) |
| 5 | Customer mở voucher → đặt booking | `gf-customer` → `gf-sales` | Voucher redeem → trigger booking flow (gắn J-01) |

**Kết quả mong đợi:**

1. Customer master record persist với `tenant_id` đúng; projection sync tới `gf-sales` (read-only)
2. Segment criteria evaluate đúng số recipient
3. Campaign workflow Temporal `wf-id` deterministic `marketing-{tenantId}-{campaignCode}` — no duplicate start
4. Voucher QR code unique per recipient; redeem rate trackable
5. Notification delivered (audit log), no fan-out cross-tenant
6. Kafka events: `CustomerCreated`/`Updated`, `CampaignTriggered`, `VoucherIssued`, `NotificationSent`

---

### J-04: Tenant Isolation E2E (Cross-cutting)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-04 |
| **Tên** | Multi-tenant Data Isolation (zero cross-tenant leakage) |
| **Persona** | `accountant`/`garage-owner` (tenant A) + `accountant`/`garage-owner` (tenant B) |
| **Boundaries liên quan** | Tất cả 18 boundary (full system check) |
| **Thời gian ước tính** | 5-7 phút |
| **TC tham chiếu** | Smoke: S-11; Isolation: TC-W01-API-058..060, TC-W01-E2E-020, TC-W01-UI-091; Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Setup 2 tenant | `gf-system`, `gf-hrms` | `garage-a` + `garage-b` active, mỗi tenant có employee accountant + garage-owner |
| 2 | Tenant A tạo SO + Settlement | `gf-sales`, `gf-accounting` | accountant `garage-a` tạo SO + settlement |
| 3 | Tenant B query SO/Settlement của A | `agg-garage-graph` → `gf-sales`/`gf-accounting` | accountant `garage-b` gọi `getServiceOrderByCode` / `getSettlementByCode` của tenant A → **PHẢI** 403 hoặc 404 |
| 4 | Deep-link UI cross-tenant | `garage-web`, `garage-mobile` | Tenant B mở URL trực tiếp tới SO/Settlement của A → bị chặn (redirect/403 page) |
| 5 | OriginTenantId integrity check | mọi service publish event | Kafka event header `OriginTenantId` PHẢI match `data.tenantId` — consumer reject nếu mismatch (ADR-004 envelope) |
| 6 | DB query check | mọi service | Direct DB inspection: `tenant_id` column filter qua `TenantFilter` Hibernate interceptor — KHÔNG có query bypass filter |
| 7 | Redis namespace check | services có Redis | Keys theo prefix `garage:{tenantId}:*` — KHÔNG key cross-tenant |

**Kết quả mong đợi:**

1. **Zero cross-tenant data leakage** — không có data Tenant A xuất hiện trong context Tenant B và ngược lại
2. **`TenantFilter` + `TenantContext` enforced** — mọi JPA query auto-filter `tenant_id`; vi phạm = data breach
3. **`OriginTenantId` integrity** — event header match `data.tenantId`; mismatch → consumer reject (ADR-004)
4. **REST + GraphQL authz** — request thiếu/sai `X-Tenant-Id` bị reject 403; `Authorization` JWT chứa đúng `tenant_id` claim
5. **Frontend route guard** — `garage-web`/`garage-mobile` block deep-link cross-tenant ở client + server side

---

### J-05: Service Order → Delivery → Inventory Stock (Xuất kho)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-05 |
| **Tên** | Service Order → Delivery → Inventory Stock (xuất kho phụ tùng) |
| **Persona** | `accountant`, `garage-owner` (warehouse role) |
| **Boundaries liên quan** | `gf-sales`, `gf-inventory-worker` (Temporal), `gf-inventory` |
| **Thời gian ước tính** | 5-8 phút (Temporal workflow async) |
| **TC tham chiếu** | Smoke: S-09; Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Tạo SO có part `source=INVENTORY` | `gf-sales` | SO với line item `source=INVENTORY`; assert business rule BR-GF-SALES-011 (eligible for delivery) |
| 2 | SO chuyển status đủ điều kiện xuất | `gf-sales` | SO status đạt điều kiện → publish `ServiceOrderStatusChangedEvent` (MessageGroup=SO, MessageStep=`DELIVERED`) qua outbox |
| 3 | `gf-inventory-worker` Temporal nhận event | `gf-inventory-worker` | Worker poll event → start `FulfillmentWorkflow` (wf-id deterministic) → tạo phiếu xuất kho tạm + reservation lock |
| 4 | Activity gọi `gf-inventory` REST | `gf-inventory-worker` → `gf-inventory` | Activity call `POST /api/v1/delivery-notes` (IOStock type `DELIVERY_NOTE`); `gf-inventory` ghi stock movement; `stock_quantity` GIẢM với optimistic `@Version` |
| 5 | Reservation expire → release | `gf-inventory-worker` | Nếu SO không settle trong window → `ReservationExpiryWorkflow` release lock + emit event |
| 6 | Publish completion events | `gf-inventory` | Emit `INVENTORY_DELIVERY_COMPLETED` + `INVENTORY_STOCK_CHANGED` qua outbox |

**Kết quả mong đợi:**

1. SO status flow `IN_PROGRESS` → đạt MessageStep `DELIVERED` → worker pick up
2. Temporal workflow `wf-id` = `fulfillment-{tenantId}-{serviceOrderCode}` deterministic, no duplicate start
3. Delivery note tạo trong `gf-inventory` với IOStock=`DELIVERY_NOTE`
4. `stock_quantity` giảm đúng số lượng; concurrent reservation không double-spend (optimistic lock)
5. Saga rollback nếu activity fail (RetryBatchWorkflow, max 5 attempt)
6. Events `INVENTORY_DELIVERY_COMPLETED`/`INVENTORY_STOCK_CHANGED` publish; consumer dedup qua inbox

---

### J-06: Purchase Order → Receipt → Inventory Stock (Nhập kho)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-06 |
| **Tên** | Purchase Order → Receipt → Inventory Stock (nhập kho phụ tùng) |
| **Persona** | `garage-owner` (warehouse role) |
| **Boundaries liên quan** | `gf-purchase`, `gf-inventory-worker` (Temporal), `gf-inventory` |
| **Thời gian ước tính** | 4-6 phút |
| **TC tham chiếu** | Smoke: S-07, S-09; Manual QC: TBD |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | PO status đạt `DELIVERED` + source DIRECT | `gf-purchase` | PO line items finalized → publish `PurchaseOrderStatusChanged` (MessageGroup=PO, MessageStep=`DELIVERED_2`) qua outbox |
| 2 | Worker nhận event, start workflow | `gf-inventory-worker` | `ReceiptWorkflow` (wf-id deterministic) → trigger receipt activity |
| 3 | Activity gọi `gf-inventory` REST | `gf-inventory-worker` → `gf-inventory` | Call `POST /api/v1/receipt-notes` (IOStock type `WAREHOUSE_RECEIPT`); ghi stock movement; `stock_quantity` TĂNG |
| 4 | Publish completion events | `gf-inventory` | Emit `INVENTORY_RECEIPT_COMPLETED` + `INVENTORY_STOCK_CHANGED` qua outbox |

**Kết quả mong đợi:**

1. PO status `DELIVERED_2` → worker pick up event
2. Receipt note tạo trong `gf-inventory` với IOStock=`WAREHOUSE_RECEIPT`
3. `stock_quantity` tăng đúng số lượng line items
4. WAC (Weighted Average Cost) recalc nếu PO unit cost khác current avg
5. Events publish đầy đủ; consumer dedup qua inbox

---

### J-07: Period Stock Closure → WAC/COGS (Batch cuối kỳ)

| Trường | Giá trị |
|---|---|
| **Journey ID** | J-07 |
| **Tên** | Period Stock Closure → WAC/COGS (monthly batch) |
| **Persona** | Operator (cron) hoặc `garage-owner` (manual trigger) |
| **Boundaries liên quan** | `gf-inventory-worker` (Temporal saga), `gf-inventory` |
| **Thời gian ước tính** | 10-15 phút (batch 15 warehouse) |
| **TC tham chiếu** | Manual QC: TBD; cron `0 0 1 * *` Asia/Ho_Chi_Minh |

**Các bước thực hiện:**

| Bước | Hành động | Boundary | Mô tả chi tiết |
|---|---|---|---|
| 1 | Operator hoặc cron trigger | `gf-inventory-worker` | Start `PeriodClosureCoordinatorWorkflow` (wf-id `period-stock-closure-{periodCode}-{ts}`); semaphore `PERIOD_CLOSURE_MAX_CONCURRENT=2`, batch 15 warehouse |
| 2 | Coordinator spawn child workflow | `gf-inventory-worker` | Mỗi warehouse → child `WarehouseBatchWorkflow` |
| 3 | Child gọi `gf-inventory` REST tính WAC/COGS | `gf-inventory-worker` → `gf-inventory` | Tính WAC + COGS cho từng SKU; ghi vào `period_stock` table |
| 4 | Saga rollback nếu activity fail | `gf-inventory-worker` | `rollbackClosure` activity hoàn nguyên; `RetryBatchWorkflow` max 5 attempt |
| 5 | Đóng period stock | `gf-inventory` | Set `period_stock` status `CLOSED`; KHÔNG publish Kafka (legacy raw outbox, no publisher route — assert qua DB/REST) |

**Kết quả mong đợi:**

1. Workflow `wf-id` deterministic, semaphore enforce concurrency = 2
2. Tất cả 15 warehouse closed đúng order; saga rollback đầy đủ nếu fail
3. WAC/COGS persist trong `period_stock` table; reconcilable qua REST query
4. `PeriodStockAdjusted` event KHÔNG publish Kafka (legacy) — terminus = `period_stock` đã đóng + WAC/COGS tính xong, assert qua DB/REST
5. Retry max 5 attempt; vượt → escalate to operator (alarm)

---

## 3. Lịch chạy E2E

| Thời điểm | Journey chạy | Ghi chú |
|---|---|---|
| Sau mỗi wave (regression) | J-04 (isolation) + journey liên quan wave | Bắt buộc |
| Sau wave Booking + SO + Settlement | J-01 | Brownfield baseline coverage |
| Sau wave Procurement | J-02 | Brownfield baseline coverage |
| Sau wave Customer + Marketing | J-03 | Brownfield baseline coverage |
| Sau wave Inventory (SO export/PO import) | J-05, J-06 | Brownfield baseline coverage |
| Cuối kỳ kế toán (monthly) | J-07 | Cron `0 0 1 * *` Asia/Ho_Chi_Minh, hoặc manual operator trigger |
| Trước release (post-baseline TD/feature gate) | J-01, J-02, J-04 (isolation) + journey wave liên quan | Release gate |

## 4. Tiêu chí đánh giá

| Tiêu chí | Ngưỡng | Hành động khi vi phạm |
|---|---|---|
| Journey pass rate | 100% (tất cả steps pass) | Ghi bug vào `Tracking/WAVE{NN}/BUGS.md`, tag `[E2E]`; severity tối thiểu `P2`, nâng `P1` nếu crash/leak/security/data-loss |
| Journey thời gian | ≤ timeout per journey | Ghi bug `P2` nếu vượt 150% thời gian ước tính trên release-gate flow |
| Isolation violations (J-04) | 0 | Ghi bug `P1` — cross-tenant leak là release-blocking nghiêm trọng nhất (rule #7 BUGS.md) |
| Temporal workflow duplicate start (J-03, J-05, J-06, J-07) | 0 | wf-id determinism vi phạm → P1 (data integrity) |
| `OriginTenantId` mismatch event (J-04 step 5) | 0 | Tenant isolation breach → P1 |

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-04-24 | (SV legacy) Khởi tạo E2E Suite SnapVersify với 4 journeys (Platform Admin tenant lifecycle / Content pipeline / End User engagement / Multi-tenant isolation) | QA Authority (SV) |
| 2026-05-11 / 2026-05-12 | (SV legacy) J-01 TC ref bổ sung W01 E2E automated; restored W01 core E2E product-flow | agent-test-e2e + Codex |
| 2026-06-11 | **Convert SV → Garage (v1 → v2)**: thay toàn bộ domain SnapVersify (Platform Admin/Tenant/Content/Moderation/Engagement) bằng Garage thực tế. (a) Frontmatter `document_id` SV-E2E-SUITE → GMS-E2E-SUITE; (b) 4 SV journey → 7 Garage journey J-01..J-07 ground theo `CLAUDE.md §4` + `Execution/knowledge-graphs/*.yaml`: J-01 Booking→SO→Settlement, J-02 Quotation→PR→PO, J-03 Customer→Campaign→Notification, J-04 Tenant Isolation E2E (TenantFilter), J-05 SO→Delivery→Inventory Stock (Temporal fulfillment), J-06 PO→Receipt→Inventory Stock (Temporal receipt), J-07 Period Stock Closure→WAC/COGS (Temporal saga monthly); (c) BUGS path 2-tier `Tracking/WAVE{NN}/BUGS.md`; (d) Persona dual (`accountant` + `garage-owner`), KHÔNG có Platform Admin / Tenant Admin / End User; (e) Tenant isolation qua `TenantFilter` + `TenantContext` + `OriginTenantId` (KHÔNG database-per-tenant); (f) Đồng bộ §4.3 Tracking/TEST-CASE-REGISTRY.md mental model. | agent-test-api (bypass-owned + QA Authority sign-off pending) |
