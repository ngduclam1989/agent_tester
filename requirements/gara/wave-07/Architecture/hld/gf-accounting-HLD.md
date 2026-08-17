---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 18
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-08-10"  # v18 Driver+ document sync (ADR-031) — xem Change Log.  # v16 CR-20260801-09 (MINOR, APPROVED — sonhoang) — §12.3 sửa 2 chỗ sort key mặc định BR-PRC-018: `idx_prc_run_tenant_garage_wh` cột cuối `created_at DESC` → `executed_at DESC`, khớp SSOT gf-accounting-data-model.md:460.
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-accounting-api.md
  - ../events/accounting-events.md
  - ../events/gf-accounting-events.md
  - ../data/gf-accounting-data-model.md
  - ../decisions/ADR-014-insurance-settlement-ownership.md
  - ../decisions/ADR-015-insurance-debt-summary-strategy.md
  - ../decisions/ADR-016-insurance-dossier-pdf-s3.md
  - ../decisions/ADR-019-accounting-period-on-gf-accounting.md
  - ../decisions/ADR-027-bqgq-engine-and-convergent-iteration.md
  - ../decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md
  - ../integrations/INTEG-EXT-gf-accounting-gf-inventory.md
---

# HLD — `gf-accounting`

## 1. Overview

`gf-accounting` là service T1 phụ trách **quyết toán service order** trong Garage. Service sở hữu settlement record + document + tenant sequence sinh mã settlement, và điều phối luồng bàn giao trạng thái settlement với `gf-sales` (settle/reopen). KHÔNG phải tổng phân hệ kế toán sổ cái — boundary tập trung vào settlement cho service order, đặc biệt là **tách settlement của khách hàng (CUSTOMER) và bảo hiểm (INSURANCE)** khi service order có phần bảo hiểm. Hỗ trợ in/xuất chứng từ HTML/PDF/PNG/JPG qua common-printing.

**Trách nhiệm:**
- Settlement command: create/update notes + documents/cancel + reopen service order.
- Customer-only flow (`insuranceFinalAmount` null hoặc 0): tạo 1 settlement `CUSTOMER` + gọi `gf-sales` settle với customer code.
- Insurance flow (`insuranceFinalAmount > 0`): tạo cặp `CUSTOMER` + `INSURANCE` liên kết hai chiều qua `relatedSettlementCode` + gọi `gf-sales` settle với **insurance code**.
- Code generation: `SET-yyyyMMdd-00001` per tenant per day, pessimistic lock `tenant_sequences` row (timezone Asia/Ho_Chi_Minh).
- Settlement document sync: `documentUrl` là identity; soft delete URL không còn trong request, insert URL mới.
- Print: HTML preview + PDF + image (PNG/JPG) — build context từ settlement + service order print snapshot + tenant info.
- Event durability: outbox processor (poll 5s, batch 100, retries 3, Redis lock multi-replica) + inbox duplicate guard.

**Owned epic**: cross-cutting accounting-lite — cornerstone cho service order finalization. Không map epic Product cụ thể.

> **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, ADR-014)**: gf-accounting mở rộng làm chủ **Phiếu QT BH** (reuse `settlement_records` type=INSURANCE), **Hồ sơ BH** (4 tài liệu, versioning, PDF→S3), **đối soát thanh toán BH** nhiều đợt + **debt-summary** REST cho widget gf-sales. Workflow **synchronous REST only, KHÔNG Temporal, KHÔNG event publish cho insurance lifecycle** (ADR-014 §Workflow). Chi tiết §9.

> **Accounting Period (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**: gf-accounting mở rộng làm chủ **Kỳ kế toán** (entity mới `accounting_period`, adjacency-list 3 cấp YEAR→QUARTER→MONTH, status OPEN ⇄ CLOSED đối xứng). 7 REST endpoint `/api/v2/accounting-periods/*` (search/tree/detail/create với auto-generate children/update/delete) + 1 protected `lock-check` cho future RECEIPT-V2/DELIVERY-V2/PRC consumers (advisory only). 2 events `AccountingPeriodClosed`/`Reopened` declared **PROPOSED** (status flip ACTIVE = future wave responsibility). Topic `AC-DEV-ACCOUNTING-EVENTS` (reuse existing — D1). Web GMS only (mobile out of scope per UX-FLOW). Chi tiết §10.

> **PRC — Tính giá xuất kho PWA (DESIGN — W06, ADR-027 v3 + ADR-028 v2)**: gf-accounting mở rộng làm chủ **PWA engine cuối kỳ** (Price-Calc-Run — `price_calc_run` + `price_calc_run_item` new entities). 5 FEAT-PRC-* (LIST/CREATE/DETAIL/RECALC/DELETE) land trên gf-accounting với 8 new endpoint `/api/v2/price-calc-runs/*` + 1 protected S2S. Async pattern **sync HTTP 202 + Temporal workflow + DB-state polling** (ADR-028 v2, Q2 v3 reversal 2026-07-23): kick-off controller `WorkflowClient.start(PriceCalcRunWorkflow::execute)` fire-and-forget → workflow poll task queue `PRC_TASK_QUEUE`, worker embed trong Spring Boot main process (parity `gf-sales` pattern), workflow ID `prc-{tenantId}-{runId}` (Critical Rule #14 deterministic). Common Gotcha #7 cascade **5 → 6 services** — add `gf-accounting` vào Temporal service list (per `CLAUDE.md §7 #7` + `TECHSTACK.md` v3 + `Tracking/arch-design-W06-answers-6.md` Q2 v3). Engine algo (ADR-027 v3) tính lặp hội tụ cho phiếu trả tự tham chiếu (BR-PRC-017) — identity guard trên `round(avg, 2, HALF_UP)`; convergent iteration heartbeat mỗi 5 vòng qua `Activity.getExecutionContext().heartbeat()` (Temporal `heartbeatTimeout=60s` detect stuck + fail-over). Cross-boundary REST S2S sang `gf-inventory` cho read (sổ tồn + phiếu) + write (bulk-fill-cost + bulk-inherit-cost + bulk-recompute-ledger) — file [INTEG-EXT-gf-accounting-gf-inventory.md](../integrations/INTEG-EXT-gf-accounting-gf-inventory.md). Web GMS + Mobile (mobile chỉ scope narrow theo FEAT-STK-LIST-V2 — không có PRC UI mobile). Chi tiết §11.

**Note**: BA frontmatter trên Product files (EP v21, BR v36, 5 FEAT-PRC v11-v29, 3 FEAT-STK/IP-V2 v9-v12) hiện nay ghi `boundary: gf-accounting` cho PRC, `boundary: gf-inventory` cho STOCK-V2 — đồng bộ với Q1=A ratify.

## 2. Component Diagram (C4 Level 3)

```
┌──────── gf-accounting  (Java 21 · Spring Boot 3.5.0) ─────────┐
│  ┌──────────────┐ ┌──────────────────┐ ┌──────────┐           │
│  │ SettlementCtrl│ SettlementPrinting│ KafkaList-│            │
│  │ /api/v1 (5)  │ │ Ctrl (print/pdf/ │ │ ener +   │           │
│  │              │ │ image)           │ │ OutboxSch│           │
│  └─────┬────────┘ └────────┬─────────┘ └────┬─────┘           │
│  ┌─────▼───────────────────▼────────────────▼─────┐           │
│  │ APP / DOMAIN SERVICES                          │           │
│  │  SettlementService (snapshot·dup guard·seq·    │           │
│  │   pair link·cancel·call gf-sales settle/reopen)│           │
│  │  DocPrintService (common-printing strategy)·   │           │
│  │  InboxService · OutboxProcessor                │           │
│  └─────┬───────────────────────────┬──────────────┘           │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐              │
│  │ JPA        │ │ Kafka outbox │ │ HttpClients │              │
│  │ ddl-auto   │ │ +producer    │ │ (x-api-key) │──────────────┼─► gf-sales       (settle/reopen · 4 ep)
│  │[gf_account]│ │ ACCOUNTING-  │ │             │──────────────┼─► ct-saas-tenant (print context)
│  │ (no Flyway)│ │ EVENTS       │ └─────────────┘              │
│  └─────┬──────┘ └──────┬───────┘                              │
│  outbox (poll 5s·batch 100·retry 3·Redis lock) │              │
│  /api/v1/* │ /protected/v1/* │ Actuator+OTLP                  │
└───────┴──────────────┴────────────────────────────────────────┘
        ▼                ▼
   PostgreSQL [gf_accounting]   Kafka P: ACCOUNTING-EVENTS
   5 tables · ddl-auto          (outbox) ; C: inbox dedup
   + Redis (lock + cache)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Snapshot from `gf-sales` thay vì query trực tiếp | Settlement amount phải freeze tại thời điểm settle; service order có thể đổi sau settlement | TECHSTACK §boundary-snapshot |
| Pair settlement (CUSTOMER + INSURANCE) khi `insuranceFinalAmount > 0` | Tách payer rõ ràng; mỗi settlement có chứng từ riêng cho audit | open HLD-ACCOUNTING-005 (link consistency) |
| Insurance code dùng để settle service order | Insurance là payer chính khi có; customer bổ sung | open HLD-ACCOUNTING-003 (edge case insurance=0 nhưng hasInsurance=true) |
| Settlement code per tenant per day với pessimistic lock | Tránh duplicate code race; sequence reset hằng ngày để dễ đọc | open HLD-ACCOUNTING-004 (transaction boundary) |
| `documentUrl` là identity sync document | Đơn giản; client upload xong gửi URL — server không xử lý binary | open HLD-ACCOUNTING-006 (metadata update khi URL giữ) |
| Cancel toàn bộ cặp settlement của service order | Nếu cancel customer mà giữ insurance hoặc ngược lại → state inconsistent | source `cancelSettlement` |
| Outbox + Redis lock cho multi-replica publish | Atomic state change + event publish; tránh duplicate publish khi scale | TECHSTACK §outbox-redis |
| Java 21 + Spring Boot 3.5.0 | Align với toàn bộ 14 services trong platform (TECHSTACK §runtime) | ~~HLD-ACCOUNTING-002~~ resolved |
| Outbox stack tồn tại nhưng chưa wire vào create/cancel | Implementation hiện chỉ có infrastructure; event wiring TBD | open HLD-ACCOUNTING-008 |
| **AP: additive new entity `accounting_period`, KHÔNG reshape table hiện hữu** | Tách bạch aggregate; consistent với ADR-014 pattern (insurance dùng new tables); ddl-auto=update tự sinh schema | ADR-019 (Decision B) |
| **AP: adjacency-list hierarchy (parent_id scalar self-FK, 3-level fixed)** | Đủ cho 3 cấp YEAR→QUARTER→MONTH; recursive CTE cho tree query; phù hợp ADR-009 scalar FK | ADR-019 (Decision B) + ADR-009 |
| **AP: REST `lock-check` ACTIVE + Kafka events PROPOSED (no publish in batch)** | Future consumers RECEIPT-V2/DELIVERY-V2/PRC integrate ngay qua REST advisory; event contract khóa naming sớm, ACTIVE flip = future wave | ADR-019 (Decision C) |
| **AP: prefix `/api/v2/accounting-periods/*` coexist với baseline `/api/v1/settlements/*`** | Không break contract baseline; v2 prefix mới cho subdomain AP | ADR-019 (Decision D) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` | Sync REST `/api/v1/*` qua BFF passthrough | Settlement CRUD, search, print/export cho Garage UI / Mobile (cross-repo verified: `endpoints.ts:223-233`) |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-sales` | Sync REST + x-api-key | `GET .../for-settlement` (snapshot), `PUT .../settle`, `PUT .../reopen-from-settled`, `GET .../for-print` |
| `ct-saas-tenant` | Sync REST + x-api-key | `GET /protected/v1/saas-tenant/{tenantId}` (build print context) |
| Kafka `${ACCOUNTING-EVENTS}` | Async publish | Outbox event publish (group `gf-accounting-group`) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:gf_accounting}` — 5 tables |
| Redis | Cache + Lock | Outbox singleton lock + cache config |
| common-printing 0.0.2-SNAPSHOT | In-process library | HTML/PDF/PNG/JPG render |
| spring-feature-flag-starter 0.0.9-SNAPSHOT | Feature gate | `@FeatureOn(Sales:SalesManagementV01, fallback=THROW_EXCEPTION)` class-level trên cả `SettlementController` và `SettlementPrintingController` — toàn bộ 8 API đều bị gate |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `gf_accounting` schema)** — chi tiết physical schema xem [data/gf-accounting-data-model.md](../data/gf-accounting-data-model.md):

| Table | Vai trò | Tenant strategy |
|---|---|---|
| `settlement_records` | Settlement header: `id`, `tenant_id`, `code` (`SET-yyyyMMdd-00001`), `service_order_code`, `settlement_type` (CUSTOMER/INSURANCE), `settlement_status` (DRAFT/CANCEL), `related_settlement_code`, customer snapshot, amount snapshot, `notes`, `settled_at/by` | `tenant_id` direct + scope qua `SettlementSpecifications` |
| `settlement_documents` | Metadata document: `id`, `tenant_id`, `settlement_id`, `document_type` (HANDOVER/RECEPTION/QUOTATION/REPAIR_ORDER/IMAGE/SETTLEMENT/OTHER), `document_url` (identity), `file_name`, `file_size`, `mime_type`, `description`, `is_deleted` (soft delete) | `tenant_id` direct |
| `tenant_sequences` | Counter sinh mã: `id` (PK auto), `sequence_name`, `sequence_date` (LocalDate), `current_value` — pessimistic lock; unique constraint `uk_sequences_name_date(sequence_name, sequence_date)` | ⚠️ **không có `tenant_id` column** — sequence_name encode tenant context |
| `outbox_events` | Reliable Kafka relay: `event_id`, `aggregate_type/id`, `payload`, `status` (PENDING/PROCESSING/SENT/FAILED), `retry_count`, `error_message` | ⚠️ **không có `tenant_id` column** (open HLD-ACCOUNTING-009) |
| `inbox_events` | Duplicate guard: `event_id` (⚠️ dùng làm duplicate key nhưng entity **chưa khai báo unique constraint** — open HLD-ACCOUNTING-011), `event_type`, `processed_at` | KHÔNG `tenant_id` — event-level identity |
| `accounting_period` _(DESIGN — ADR-019)_ | Kỳ kế toán master: `id`, `tenant_id`, `code` (auto-derived `AP-{type}-…`, defensive cho event partition key — OQ6), `name`, `type` (`YEAR|QUARTER|MONTH`), `parent_id` (scalar self-FK NULL cho YEAR), `start_date`, `end_date`, `status` (`OPEN|CLOSED`, default OPEN), `display_order`, `description`, audit (`created/updated_at/by` — status transitions tracked via standard audit pair, no separate close/reopen cols) | `tenant_id` direct + scope qua `SecurityUtils.getCurrentTenantIdAsLong()` |

**State machine** (`SettlementStatus`):

```
        ┌──── PUT update notes/docs ────┐
        ▼                               │
    DRAFT (active) ──cancel──► CANCEL (terminal)
        │                          │
        │                          └─► allow re-create cùng SO/type
        │                              (code/id reuse)
        ▼
    settle service order (gf-sales)
```

**Pair invariant**:
- `CUSTOMER.related_settlement_code = INSURANCE.code`
- `INSURANCE.related_settlement_code = CUSTOMER.code`
- Cancel **toàn bộ** settlement của 1 service order (không cancel single)

**KHÔNG own**:
- Service order lifecycle / repair workflow / customer-facing work order (`gf-sales` SoT)
- Tenant master data + logo + thông tin công ty (`ct-saas-tenant` SoT)
- General ledger / chart of accounts / invoice chính thức / booking kế toán (chưa có)
- Payment collection / cash receipt / debt aging (chưa có)
- File binary của document (storage service ngoài — chỉ lưu metadata URL)
- Notification khi settlement hoàn tất (`gf-notification` consumer của outbox event — wire TBD)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Settlement create p95 (incl. for-settlement + sequence lock + persist + settle gf-sales) | ≤ 1.2s |
| Settlement update p95 (notes + document sync) | ≤ 400ms |
| Settlement cancel p95 (cancel all + reopen gf-sales) | ≤ 800ms |
| Settlement search p95 (paged) | ≤ 500ms |
| Print preview HTML p95 | ≤ 1.5s (incl. for-print + tenant + render) |
| Export PDF p95 | ≤ 3s |
| Export image p95 (PNG/JPG) | ≤ 4s |
| Settlement code format | `SET-yyyyMMdd-00001` per tenant per day; pessimistic lock `tenant_sequences` row |
| Outbox poll interval | **5s** (`outbox.poll-interval=5000`) |
| Outbox batch size | **100** (`outbox.batch-size=100`) |
| Outbox max retries | **3** (`outbox.max-retries=3`) |
| Outbox stale processing window | **300s** (`outbox.stale-processing-seconds=300`) |
| Outbox singleton lock | Redis `gf-accounting-outbox-processor` |
| JPA batch size | 1000 |
| Redis timeout | 2000ms |
| Multi-replica | Safe — Redis lock cho outbox singleton |
| Schema migration | Flyway dependency + config present (`spring.flyway.enabled=true`) nhưng **không có migration SQL file**; JPA `ddl-auto=update` đang active — dual strategy là governance gap (open HLD-ACCOUNTING-001) |
| Runtime | Java 21, Spring Boot 3.5.0 (~~HLD-ACCOUNTING-002~~ resolved — align platform) |
| **AP tree query p95** (`POST /api/v2/accounting-periods/tree` body `{year, name?}`) _(DESIGN — ADR-019)_ | ≤ 200ms (recursive CTE; index `idx_ap_parent` + `idx_ap_tenant_year` + `idx_ap_tenant_name` cho LIKE-unaccent name search). Backend cap 500 periods/tenant → HTTP 413 (defensive — PL5). |
| **AP lock-check p95** (`GET /protected/v1/accounting-periods/lock-check?date=`) _(DESIGN — ADR-019)_ | ≤ 100ms (point lookup `idx_ap_tenant_dates`). Caller-side LRU cache 30s. |
| **AP CRUD p95** (search/get/create/update/delete) _(DESIGN — ADR-019)_ | ≤ 300ms (single-tx ops + overlap check); create với `autoGenerateChildren=true` (Năm → 1+4+12 = 17 rows atomic) p95 ≤ 800ms. |

## 7. Forbidden Actions

- ❌ Skip tenant scope query (mọi public API phải lấy `tenantId` từ `SecurityUtils.getCurrentTenantIdAsLong()` + repository query có tenant filter — bypass = cross-tenant leak).
- ❌ Tạo settlement mà không gọi `gf-sales` `for-settlement` snapshot trước (amount phải freeze từ service order at settle time — không tự tính từ DB local).
- ❌ Cancel single settlement của cặp CUSTOMER+INSURANCE mà không cancel toàn bộ (state inconsistent — service order sẽ kẹt nửa settled; phải dùng cancel-by-service-order-code).
- ❌ Hard-delete `settlement_records` / `settlement_documents` (audit invariant — dùng `settlement_status=CANCEL` + `is_deleted=true` cho document).
- ❌ Update settled service order state trực tiếp từ accounting (vi phạm `gf-sales` SoT — phải gọi `PUT /settle` hoặc `PUT /reopen-from-settled` qua `GfSalesClient`).
- ❌ Tạo CUSTOMER settlement với `insuranceFinalAmount=0` khi `so.hasInsurance=true` (open HLD-ACCOUNTING-003 — current source tạo customer settlement nhưng không gọi settle service order → state diverge; phải fail-fast hoặc revisit business rule).
- ❌ Skip `InboxService.existsByEventId` check khi consume event (duplicate processing — vi phạm idempotency).
- ❌ Process outbox event mà không qua Redis lock `gf-accounting-outbox-processor` (multi-replica race → duplicate Kafka publish).
- ❌ Publish outbox event không có tenant context trong payload/aggregate key (open HLD-ACCOUNTING-009 — `outbox_events` không có `tenant_id` column → consumer mất tenant scope).
- ❌ Update document metadata mà không đổi `documentUrl` (open HLD-ACCOUNTING-006 — current sync coi cùng URL = cùng document; metadata change bị silent ignore).
- ❌ Throw `IllegalArgumentException` cho business error (open HLD-ACCOUNTING-010 — phải normalize sang business exception + HTTP status chuẩn để client phân biệt 400/404/409).
- ❌ Sequence row tăng `current_value` ngoài transaction (race với concurrent generate — phải pessimistic lock `findByTenantIdAndSequenceNameWithLock`).
- ❌ _(DESIGN — ADR-019)_ Cross-boundary direct DB query vào `accounting_period` từ gf-inventory hoặc bất kỳ service nào khác — phải qua REST `/protected/v1/accounting-periods/lock-check` (advisory) hoặc Kafka events khi flip ACTIVE (Critical Rule #1 boundary isolation).
- ❌ _(DESIGN — ADR-019)_ Implement publish event `AccountingPeriodClosed`/`Reopened` trong batch — status PROPOSED chỉ declare contract; ACTIVE flip = future wave (RECEIPT-V2/DELIVERY-V2/PRC kick-off). Vi phạm = events file v8 §5 Forbidden.
- ❌ _(DESIGN — ADR-019)_ Breaking change PROPOSED event contract (đổi payload field, rename event, đổi MessageStep semantic) — phải MAJOR version bump + deprecate window (ADR-013); chấp nhận additive optional field only.
- ❌ _(DESIGN — ADR-019)_ Update `accounting_period` field bị khóa sau create (`type`, `parent_id`, `start_date`, `end_date`) — BR-AP-016 immutability invariant. Chỉ `name`, `description`, `display_order`, `status` mutable.
- ❌ _(DESIGN — ADR-019)_ Hard-delete `accounting_period` row mà bypass 3-guard (status=OPEN + no children + no stock transactions in range) — vi phạm BR-AP-013/014, gây orphan reference.

## 8. Insurance Settlement Extension (DESIGN — EP-INSURANCE-SETTLEMENT)

> ⚠️ Thiết kế (CR-1780147390, ADR-014/015/016), chưa có trong source. Tái dùng infra settlement (pair, code-gen, printing, outbox). gf-accounting **KHÔNG Temporal** (ADR-005/015).

### 8.1 New components (C4 L3 — bổ sung vào §2)

```
gf-accounting (DESIGN add-on)
  InsuranceDossierController /api/v1/insurance-dossiers ─┐
  InsuranceDebtController /protected/v1/insurance-debt-summary (x-api-key) ─┤
                                                          ▼
  InsuranceSettlementService (reuse SettlementService pair + scalar adjustment columns snapshot)
  InsuranceDossierService (4 docs · versioning · export PDF→S3 via common-printing)
  InsuranceDebtService (Σ payable − Σ payments · period filter · cache)
  ── JPA ddl-auto [gf_accounting]: settlement_records(+scalar cols) · insurance_dossiers ·
       insurance_dossier_documents · insurance_settlement_payments
  ── S3 client (signed URL)
```

### 8.2 Aggregates · state machines

**InsuranceSettlement** (reuse `settlement_records`, type=INSURANCE) — status **DRAFT → CANCEL** (như §5). Derived payment status (KHÔNG lưu DB): `UNPAID → PARTIAL → FULLY_PAID` (+ badge `OVERPAID`) tính từ `insurance_payable_amount − Σ insurance_settlement_payments`. Invariant: pair atomic với phiếu QT KH (CB-INS-004); snapshot adjustments immutable (CB-INS-002); **huỷ chặn nếu đã có payment** (BR-EP §3.1); cancel cascade cặp + REST reopen gf-sales (CB-INS-003).

**InsuranceDossier** (+ documents):
```
   create v1 (4 docs: ①② READY auto · ③④ PENDING)
      │ fill ③ (form/upload) · ④ (template)  → docStatus READY
      ▼
   DRAFT ── export (docs isSelected, không bắt buộc 4/4) ──► EXPORTED (immutable, PDF→S3)
      ▲                                                          │
      │ create vN+1 (copyFrom option)  ◄── BH yêu cầu sửa ───────┘
   vN.dossier_status = REPLACED (replaced_by_version = N+1; vẫn xem được)
```
Invariant: chỉ tạo khi Phiếu QT BH DRAFT (VLD-INS-DOSSIER-004); version immutable sau export; ①② read-only.

**SettlementPaymentReconciliation** (`insurance_settlement_payments`): append-only đợt thanh toán; nguồn tính debt-summary (CB-INS-008) — gf-accounting tự tính, KHÔNG cross-boundary query.

### 8.3 Key decisions (bổ sung §3)

| Decision | Rationale | Reference |
|---|---|---|
| Reuse gf-accounting (no gf-insurance) | Tái dùng pair+printing+sequence; brownfield | ADR-014 |
| Synchronous REST only, no Temporal, no event publish | gf-accounting ngoài 5 service Temporal; flow ngắn; REST callback đủ; không publish insurance-* events qua outbox | ADR-014 (§Workflow) |
| Debt qua REST debt-summary (không CQRS cross-boundary) | gf-accounting chủ số liệu; cache TTL | ADR-015, CB-INS-008 |
| PDF per-document → S3 versioned + signed URL | Hồ sơ immutable, audit, compliance | ADR-016, CB-INS-009 |

### 8.3bis Error contract (canonical `INS_*` — CR-1780980611)

- Luồng Phiếu QT BH (tạo/đọc/huỷ/insurance-payments) **emit `INS_*` registry code trực tiếp** (BR-EP §5.5) + đúng HTTP status, thay mã `GMS.gf-accounting.SETTLEMENT_*` cho đường insurance; agg passthrough `extensions.code`; FE bind theo code. Mã: INS-2002/2003/2004/2005/2006 + INS-1008 (mode-invalid: **500 Jackson → 422**). "no-insurance-item" (VLD-INS-STL-001) giữ mã internal (flag #2). Chi tiết: [gf-accounting-api.md §3bis.9](../api/gf-accounting-api.md).

### 8.4 Forbidden (bổ sung §7)

- ❌ Tự tính `insurance_payable_amount` server-side — nhận từ gf-sales snapshot (BR-GF-ACCOUNTING-006).
- ❌ Dùng Temporal cho settlement workflow (ADR-014 §Workflow).
- ❌ Re-generate PDF của version đã EXPORTED (immutable — ADR-016).
- ❌ Đưa signed URL/PII đầy đủ DN BH vào Kafka payload (chỉ s3Prefix — CB-INS-009).
- ❌ Trả 500 (Jackson parse) cho enum/mode sai hoặc dùng mã `GMS.gf-accounting.SETTLEMENT_*` cho insurance error FE-facing — phải map về `INS_*` (CR-1780980611, BR-EP §5.5).

## 9. Accounting Period Extension (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019)

> ⚠️ Thiết kế (boundary correction Delivery Authority 2026-06-23, CLAUDE override 2026-06-24, ADR-019). Chưa có trong source. Additive entity hoàn toàn — tách bạch khỏi settlement aggregate. Web GMS only (mobile out of scope per UX-FLOW). 5 features `FEAT-AP-LIST/CREATE/DETAIL/EDIT/DELETE`. PRC slice (5 `FEAT-PRC-*`) deferred — boundary chưa quyết.
>
> **Note**: BA frontmatter trên `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v14, 5 `FEAT-AP-*` v1-v3, `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v23 vẫn ghi `boundary: gf-inventory` (chưa fix). Design dùng `gf-accounting` per Delivery Authority correction; BA sẽ tự fix khi reclassify chính thức.

### 9.1 New components (C4 L3 — bổ sung vào §2)

```
gf-accounting (DESIGN add-on — AP slice)
  AccountingPeriodController     /api/v2/accounting-periods/* (6: search/tree/detail/create/update/delete)
  AccountingPeriodLockController /protected/v1/accounting-periods/lock-check (x-api-key S2S — advisory)
                                                          ▼
  AccountingPeriodService (validate hierarchy / overlap CTE / status transition / delete-guard 3-check)
  AccountingPeriodGeneratorService (autoGenerateChildren atomic — Năm⇒4Q+12M, Quý⇒3M; skip existing per BR-AP-009)
  AccountingPeriodRepository (JPA — recursive CTE cho tree query)
  ── JPA ddl-auto [gf_accounting]: accounting_period (new table — adjacency-list)
  ── Outbox infra REUSE (Redis lock `gf-accounting-outbox-processor`) — KHÔNG wire trong batch (PROPOSED only)
```

### 9.2 Aggregate `AccountingPeriod` · state machine

**Invariants:**
- I1: `type=YEAR` ⇒ `parent_id IS NULL`. `type=QUARTER` ⇒ `parent.type=YEAR`. `type=MONTH` ⇒ `parent.type=QUARTER` (BR-AP-003/004).
- I2: `end_date >= start_date` (BR-AP-006).
- I3: Child range ⊆ parent range (cho phép trùng biên — BR-AP-007).
- I4: Sibling periods (cùng `parent_id` + `type` + `tenant_id`) **không chồng lấn** date range (BR-AP-008).
- I5: Status transition `OPEN ⇄ CLOSED` đối xứng (BR-AP-010/011 — cho mở lại, không ràng buộc thứ tự).
- I6: Immutability sau create — chỉ `name`, `description`, `display_order`, `status` mutable; `type`, `parent_id`, `start_date`, `end_date` frozen (BR-AP-016).
- I7: Delete-guard 3-check (BR-AP-013/014):
  - (a) `status = OPEN`
  - (b) Không còn children (recursive CTE check trong `accounting_period`)
  - (c) Không có stock transaction (phiếu nhập/xuất ngày trong khoảng kỳ; tồn đầu kỳ có "Tồn đến ngày" rơi vào kỳ — OB liên hệ gián tiếp; bản ghi tính giá trong kỳ) — **enforcement chi tiết ở downstream `EP-INVENTORY-RECEIPT-V2`/`EP-INVENTORY-DELIVERY-V2`/`EP-INVENTORY-OPENING-BALANCE`/`FEAT-PRC-*` khi build sau** (cross-boundary check qua lock-check reverse hoặc REST query về downstream backend; batch hiện tại chỉ enforce (a) + (b) trên `accounting_period` table).

**State machine:**

```
  ┌─────────────┐    create     ┌──────────────┐
  │   (init)    │──────────────►│  OPEN        │◄──────┐
  └─────────────┘               │              │       │
                                └──┬───────────┘       │
                                   │ Đóng (BR-AP-010)  │ Mở lại
                                   ▼                   │ (BR-AP-011)
                                ┌──────────────┐       │
                                │  CLOSED      │───────┘
                                └──┬───────────┘
                                   │ delete (3-guard) — BLOCKED nếu status=CLOSED
                                   ▼
                                  ❌ ERR-INV-025
```

**Auto-generate children (BR-AP-009 — atomic per transaction):**
- Create YEAR + `autoGenerateChildren=true` → 1 năm + **4 quý** (Q1: Jan 1–Mar 31, Q2: Apr 1–Jun 30, Q3: Jul 1–Sep 30, Q4: Oct 1–Dec 31) + **12 tháng** under each quarter.
- Create QUARTER + `autoGenerateChildren=true` → **3 tháng** matching quarter calendar.
- Skip existing siblings (detected via overlap-check per BR-AP-008) — response trả `{created: X, skipped: Y, skippedDetails: [...]}`.
- All-or-nothing transaction; rollback all on partial failure.

### 9.3 Key decisions (bổ sung §3)

| Decision | Rationale | Reference |
|---|---|---|
| Boundary ownership = `gf-accounting` (không phải `gf-inventory`) | Kỳ kế toán = accounting concept; gf-inventory là consumer; đồng nhất ADR-014 (insurance reuse gf-accounting) | ADR-019 (Decision A); Delivery Authority correction 2026-06-23 |
| Additive entity `accounting_period`, ddl-auto=update, KHÔNG Flyway DDL | Tách bạch aggregate; consistent ADR-006 exception + Gotcha #5 | ADR-019 (Decision B); ADR-006 |
| Adjacency-list (parent_id scalar self-FK, 3-level fixed) | Đủ cho 3 cấp; recursive CTE đủ performance; ADR-009 scalar FK | ADR-019 (Decision B); ADR-009 |
| REST lock-check ACTIVE + Kafka events PROPOSED | Future consumers integrate ngay; contract khóa naming sớm; ACTIVE flip = future wave | ADR-019 (Decision C) |
| Topic `AC-DEV-ACCOUNTING-EVENTS` (reuse existing) | Conform `AC-DEV-{DOMAIN}-EVENTS` pattern; topic đã đăng ký §11 `_CONVENTIONS.md` | ADR-019 (Decision C, D1 micro); _CONVENTIONS §2 |
| Error code `ERR-INV-021..026` verbatim (KHÔNG rename namespace) | ERR-INV-024 đã cross-boundary; rename = registry cascade; tolerate cosmetic mismatch | ADR-019 (Decision D, D2 micro); ERROR-CODE-REGISTRY §1.1 |
| Prefix `/api/v2/accounting-periods/*` coexist với baseline `/api/v1/settlements/*` | Không break contract baseline | ADR-019 (Decision D) |

### 9.4 Forbidden (bổ sung §7)

- ❌ Cross-boundary direct DB query vào `accounting_period` — phải qua REST `/protected/v1/accounting-periods/lock-check` (advisory) hoặc Kafka events khi flip ACTIVE (đã list §7).
- ❌ Implement publish event `AccountingPeriodClosed`/`Reopened` trong batch (PROPOSED only — đã list §7).
- ❌ Breaking change PROPOSED event contract (đã list §7).
- ❌ Update field immutable sau create (đã list §7).
- ❌ Hard-delete bypass 3-guard (đã list §7).
- ❌ Tạo persona mới ngoài `{chủ garage, kế toán}` (Critical Rule #6 + BR-AP-CMN-002 dual persona equal rights).
- ❌ Skip authoritative re-check ở downstream backend khi consume lock-check (advisory-only — downstream commit guard vẫn must check authoritative; lock-check chỉ pre-check fail-fast UX).

## 11. PRC Extension (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD §3.2, W06, ADR-027 v3 + ADR-028 v2)

> ⚠️ Thiết kế (W06 arch-design 2026-07-22, **amended 2026-07-23 v13 — Q2 v3 reversal chuyển sang Temporal workflow**). Additive entity + endpoint + Temporal worker embed. **KHÔNG đụng** aggregate settlement / dossier / accounting_period. Web GMS đầy đủ, App Garage KHÔNG có PRC UI (scope narrow — chỉ FEAT-STK-LIST-V2 trên mobile per WAVE-SEQUENCE.md).

### 11.1 New components (C4 L3 — bổ sung vào §2)

```
gf-accounting (DESIGN add-on — PRC slice W06, v13 Temporal)
  PriceCalcRunController         /api/v2/price-calc-runs/* (7: search/detail/create/recalc/delete + progress + cancel-nothing[N])
  PriceCalcRunLockController     /protected/v1/price-calc-runs/status (x-api-key S2S — future gf-inventory guard cross-check)
                                                          ▼
  PriceCalcRunService (guards: CLOSED period + run-in-progress + kick-off HTTP 202 accept
                        + WorkflowClient.start(PriceCalcRunWorkflow::execute) — không spawn thread nữa)
  PwaEngineService (Phase 0..5 pure-compute — invoked bởi activity classes; convergent iteration BR-PRC-017)
  PriceCalcRunWorkflow (Temporal @WorkflowInterface — orchestrate 7 activities Phase 0..5; deterministic replay)
  PriceCalcActivities × 7 (SnapshotPull / UpdateRunStatus / ComputeItem / BulkFillCost /
                          BulkInheritCost / BulkRecomputeLedger / CommitRun — retriable + idempotent;
                          retry/timeout table chi tiết per ADR-028 v2 §2)
  PriceCalcTemporalWorker (@PostConstruct init — embed trong Spring Boot main process;
                           poll task queue "PRC_TASK_QUEUE"; multi-replica load-balanced by Temporal)
  PriceCalcWorkflowFailureListener (Temporal callback → mark COMPLETED_WITH_ERRORS on
                                    WorkflowExecutionTimeout / hard fail — replace v1 SweepJob)
  GfInventoryPrcClient (Spring HTTP Interface — 5 endpoint sang gf-inventory, x-api-key + Idempotency-Key)
  ── JPA ddl-auto [gf_accounting]: price_calc_run (new + temporal_workflow_id column)
                                    · price_calc_run_item (new) · price_calc_run_error (nullable, embedded)
  ── Temporal Cloud: namespace "garage-prod", task queue "PRC_TASK_QUEUE"; workflow ID = "prc-{tenantId}-{runId}" (Rule #14)
  ── ❌ REMOVED (v13): PriceCalcExecutorService (ThreadPool) · Redis distributed lock prc:lock · PriceCalcRunSweepJob
  ── Micrometer/OTLP: prc_run_started/completed_total + prc_run_duration + prc_active_gauge
                     + temporal_workflow_completed{workflow_type} + temporal_activity_execution_latency
                     + temporal_activity_retry_count + temporal_worker_task_slots_available
```

### 11.2 Aggregate `PriceCalcRun` · state machine

**Invariants (ADR-027 + ADR-028):**
- I1: 1 run active per `(tenantId, garageId, warehouseId, periodId)` — enforced qua Layer 1 (`SELECT ... FOR UPDATE` trong tx kick-off) + Layer 2 (Temporal `WorkflowIdReusePolicy.REJECT_DUPLICATE`) + Layer 3 (partial unique index — xem `gf-accounting-data-model.md §2quater.1`).
- I2: State transition unidirectional cho terminal: `PENDING → RUNNING → {SUCCEEDED | COMPLETED_WITH_ERRORS}` — không revert; RECALC = tạo audit row mới (new runId + new workflow), không reopen run gốc.
- I3: `scope ∈ {ALL, SPECIFIC}` (CREATE) và `runScope ∈ {ALL, ERROR_ONLY}` (RECALC audit) — persist đầy đủ để reproduce.
- I4: Period CLOSED → block CREATE + RECALC (`ERR-INV-024`); mở lại period (BR-AP-011) mới tính được (BR-PRC-008).
- I5: Convergence guard = identity check trên `BigDecimal.setScale(2, HALF_UP)` — bit-level match, deterministic (ADR-027 §7).
- I6: Temporal worker capacity = task queue `PRC_TASK_QUEUE` polled bởi mọi replica; concurrent execution bounded by `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod (parity v1 thread pool N=4). Over-capacity → Temporal task queue depth increases; monitor `temporal_worker_task_slots_available`.
- I7: `WorkflowExecutionTimeout=60min` + activity `startToClose` per phase (bảng ADR-028 §2) + `ComputeItemActivity.heartbeatTimeout=60s` (heartbeat mỗi 5 iteration của vòng phụ) — replace v1 `MAX_STUCK_MINUTES=60` sweep detection.
- I8: Workflow **deterministic** — code trong `@WorkflowMethod` chỉ dùng `Workflow.currentTimeMillis()` / `Workflow.randomUUID()` / activities cho mọi side effect; `TestWorkflowRule` replay history bắt buộc pass (test-11 ADR-028).

**State machine:**

```
                          POST /price-calc-runs
                                  ▼
  ┌─────────────┐  INSERT  ┌──────────────┐  WorkflowClient  ┌───────────────┐
  │   (init)    │─────────►│  PENDING     │─────.start()────►│  RUNNING      │
  └─────────────┘          └──┬───────────┘                  └───┬──────┬────┘
                              │ REJECT_DUPLICATE                 │      │
                              │ (Layer 2 defense — rare)         │      │
                              ▼                                  │      │
                          (409 ERR-INV-029)                      │      │
                                                                 ▼      ▼
                                                       SUCCEEDED    COMPLETED_WITH_ERRORS
                                                       (∀ items DONE)  (≥1 item ERROR
                                                            │           OR WorkflowExecutionTimeout
                                                            │           OR unrecoverable ActivityFailure)
                                                            └──────┬───────┘
                                                                   │ RECALC (audit new run row + new workflow,
                                                                   ▼   NOT reopen this row)
                                                             (new PriceCalcRun + new workflowId)
```

**Workflow lifecycle mapping**:
- `INSERT` → `PENDING`: DB row committed trong controller tx TRƯỚC `WorkflowClient.start()` — nếu Temporal Cloud outage → `WorkflowClient.start()` throw, controller trả HTTP 503 + rollback DB (compensating DELETE). Client retry.
- `PENDING → RUNNING`: `UpdateRunStatusActivity` gọi ở đầu `PriceCalcRunWorkflow.execute()` (activity đầu tiên trước Phase 1).
- `RUNNING → SUCCEEDED/COMPLETED_WITH_ERRORS`: `CommitRunActivity` (activity cuối, Phase 5).
- `RUNNING → COMPLETED_WITH_ERRORS` (timeout path): `PriceCalcWorkflowFailureListener` subscribe `WorkflowExecutionListener` → khi `WorkflowFailedException` bubble (WorkflowExecutionTimeout / unrecoverable ActivityFailure) → UPDATE DB `status=COMPLETED_WITH_ERRORS` + all `RUNNING` items → `ERROR/SYSTEM_ERROR`.

**Item status matrix** (`price_calc_run_item.status`):
- `RUNNING` — waiting for Phase 2 to reach it (transient)
- `DONE` — computed successfully; committed to gf-inventory
- `ERROR` — invariant violation or system fault; `errorReason` ∈ `{NEGATIVE_STOCK, ACCOUNTING_MISMATCH, SYSTEM_ERROR}` (BR-PRC-007)

### 11.3 Key decisions (bổ sung §3)

| Decision | Rationale | Reference |
|---|---|---|
| PRC master = `gf-accounting` (không phải `gf-inventory`) | Kỳ + PWA = accounting concept; kho tracks qty; ERP pattern SAP FI-CO / Misa / Fast | ADR-027 §Decision; Q1=A ratify 2026-07-22 |
| Async pattern = sync HTTP 202 + **Temporal workflow** (Q2 v3 reversal 2026-07-23) | Durable execution + retry + heartbeat built-in; consistency với 5 services đã own Temporal; long-running convergent iteration fit hơn Spring Retry. Cascade Gotcha #7 5 → 6 services (add gf-accounting) | ADR-028 v2 §Decision; Tracking/arch-design-W06-answers-6.md Q2 v3 |
| Convergent iteration hội tụ trên round(avg,2,HALF_UP) identity | BR-PRC-013 (2-decimal round là "kết quả chạy giá") + BR-PRC-017 (no maxIterations); SAFETY_ITERATION_CAP=100 defensive | ADR-027 §3 |
| RECALC 2 scope `ALL` / `ERROR_ONLY` | Nút "Tính lại toàn bộ" + "Tính lại mã lỗi" (partial retry cho job gián đoạn) | BR-PRC-008 v29; ADR-027 §4 |
| Cross-boundary REST S2S + x-api-key + Idempotency-Key | Critical Rule #1 (no direct DB); ADR-020 recompute engine reuse | INTEG-EXT-gf-accounting-gf-inventory §Auth |
| Temporal worker embed + `maxConcurrentActivityExecutionSize=4` per pod + Layer 1/2/3 concurrency defense (DB tx / `WorkflowIdReusePolicy` / partial unique index) | Multi-replica load-balanced by Temporal task queue; concurrent bounded per pod; scale horizontal | ADR-028 v2 §2 + §5 |
| Temporal workflow history + activity retry policy + heartbeat (replace v1 DB sweep + Redis lease) | BR-PRC-016 v17 "job không treo vĩnh viễn"; rich audit trail; declarative retry per activity | ADR-028 v2 §3 |
| Không publish Kafka event cho PRC lifecycle | Sync polling contract từ FE; async event = scope creep (future consider) | ADR-028 §Alt-3 rejected |

### 11.3bis Post-commit BR-PRC-015 subsequent-period cascade detection (v12, F-05 add)

`FEAT-PRC-CREATE AC-9b` + `BR-PRC-015` yêu cầu: khi CREATE hoặc RECALC chạy trên period P, hệ thống phải phát hiện + cảnh báo các kỳ SAU (cùng warehouse) đã có PRC run thành công, vì output của P (giá vốn + sổ tồn) lan tới kỳ sau (BR-PRC-002 tồn cuối kỳ = đầu vào kỳ sau).

**Detection step** — chạy tại Phase 5/6 của thuật toán ADR-027 (sau khi commit `price_calc_run.status = SUCCEEDED / COMPLETED_WITH_ERRORS`, TRƯỚC khi return HTTP 202 response cho FE):

```sql
SELECT prc.id AS lastRunId, prc.period_id, ap.name AS periodName, prc.status AS lastRunStatus
FROM price_calc_run prc
JOIN accounting_period ap ON ap.id = prc.period_id
WHERE prc.tenant_id = :tenantId
  AND prc.warehouse_id = :warehouseId
  AND ap.start_date > (
    SELECT end_date FROM accounting_period WHERE id = :currentPeriodId
  )
  AND prc.status IN ('SUCCEEDED', 'COMPLETED_WITH_ERRORS')
  -- LATEST run per period (in case of RECALC audit chain — take newest by executed_at)
  AND prc.executed_at = (
    SELECT MAX(executed_at) FROM price_calc_run
    WHERE tenant_id = prc.tenant_id AND warehouse_id = prc.warehouse_id
      AND period_id = prc.period_id AND deleted_at IS NULL
  )
ORDER BY ap.start_date ASC;
```

**Index coverage** (§12.3 — no new index needed):
- `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)` supports the outer filter.
- `idx_ap_tenant_dates (tenant_id, start_date, end_date, status)` supports the JOIN + range predicate.

**Populate response**: `affectedSubsequentPeriods: [{periodId, periodName, lastRunId, lastRunStatus}]` (xem `gf-accounting-api.md §5.3 + §5.4` cho JSON shape).

**Non-blocking semantics**: query failure (edge case: AP boundary down transient) → log warning, return empty `affectedSubsequentPeriods: []`, KHÔNG chặn CREATE/RECALC response. Advisory only — user tự trigger RECALC cho các period liệt kê per BR-PRC-015 "hệ thống cảnh báo; người dùng tự chạy lại".

**Performance envelope**: cascade query ≤ 20ms typical (single index lookup + JOIN); adds < 5% to Phase 5 latency budget (kick-off HTTP 202 target ≤ 300ms per §12.1 — unchanged).

### 11.4 Forbidden (bổ sung §7)

- ❌ _(DESIGN — W06 PRC)_ Direct DB query từ `gf-accounting` vào `gf-inventory` tables — chỉ REST §4 INTEG-EXT-gf-accounting-gf-inventory (Critical Rule #1).
- ❌ Bypass `X-Idempotency-Key` trên write phases (bulk-fill-cost / bulk-inherit-cost / bulk-recompute) — resume-on-crash sẽ duplicate writes.
- ❌ Publish Kafka event cho PRC lifecycle (`PRICE_CALC_STARTED / COMPLETED / FAILED`) từ batch W06 — sync polling only (ADR-028 §Alt-3). Future extension out of scope.
- ❌ ~~Adopt Temporal cho PRC job~~ **REVERSED v13 (2026-07-23)** — Q2 v3 chọn Temporal workflow per ADR-028 v2; Gotcha #7 cascade 5 → 6 services (add gf-accounting). Non-forbidden intentional expand.
- ❌ Gọi `Math.random()` / `System.currentTimeMillis()` / `UUID.randomUUID()` trực tiếp trong `@WorkflowMethod` — non-deterministic replay error. Dùng `Workflow.currentTimeMillis()` / `Workflow.randomUUID()` / activity thay thế.
- ❌ Attach payload lớn (full item list ×100+) vào `PriceCalcRunInput` — Temporal history size limit ~50MB. Pass runId + fetch từ DB trong activity thay vào.
- ❌ Chạy PRC khi `accounting_period.status = CLOSED` — hard-fail HTTP 409 `ERR-INV-024` tại Phase 0 gate (BR-PRC-008 + BR-AP-012); mở lại kỳ (BR-AP-011).
- ❌ Update `PriceCalcRun` sau khi terminal — RECALC = tạo audit row mới per BR-PRC-010 log mới chồng lên; KHÔNG reopen row cũ.
- ❌ Delete `PriceCalcRun` với `status=RUNNING` — chặn qua `ERR-INV-029` (BR-PRC-011 v13 + BR-PRC-016).

## 11bis. Đồng bộ chứng từ sang Driver+ (DESIGN — ad-hoc 2026-08-10, ADR-031)

> `gf-accounting` trở thành **producer Driver+ đầu tiên** của boundary. Contract canonical: [`gf-accounting-events.md`](../events/gf-accounting-events.md) §3.3. Quyết định: [ADR-031](../decisions/ADR-031-driver-plus-document-sync.md). Integration: [INTEG-EXT-driver-plus.md §4.3](../integrations/INTEG-EXT-driver-plus.md).

### 11bis.1 Capabilities

- **Emit phiếu quyết toán** khi tạo thành công + SO gốc liên kết booking nguồn Driver+ (`FEAT-STL-CREATE` AC-3 / `BR-STL-CRE-008`) — step `DOCUMENT.SETTLEMENT.SYNC` trên topic mới `AC-DEV-DOCUMENT-EVENTS`. Cặp phiếu (AC-4) → **2 event riêng**.
- **Tệp qua URL**: render PDF (`DocPrintService.generatePdf(SETTLEMENT)`) → upload `ct-file-storage` → payload mang `fileUrl` + `checksum` + `expiresAt` (TTL 30 ngày). KHÔNG nhúng binary.
- **Feature flag** `Document:DriverPlus` (dùng chung với `gf-sales`).
- **Không** endpoint REST mới, **không** bảng/cột mới — tái dùng `outbox_events` + `OutboxProcessor` sẵn có (ADR-031 D6). Boundary dùng `ddl-auto=update`, không Flyway DDL (Gotcha #5) — đợt này không phát sinh cột.

### 11bis.2 Invariants / forbidden (bổ sung §7)

- Nguồn "booking Driver+" lấy từ **snapshot REST `for-settlement`** — 3 field additive `bookingCode` / `externalBookingId` / `isDriverPlusSource` ([`gf-sales-api.md` §3bis.2](../api/gf-sales-api.md) v13); gate emit = `isDriverPlusSource == true`. **KHÔNG** đọc DB gf-sales (Critical Rule #1).
- **Không** phát `DOCUMENT.SETTLEMENT.REVOKED` — Product không có luồng hủy phiếu quyết toán (`FEAT-STL-DETAIL` EC-7 + AC-16..18 đã bị Business Authority gỡ 2026-08-03).
- `eventId` = `UUIDv5(NS_DP_DOCUMENT, documentCode + "|" + documentType)` — không sinh mới khi phát lại.
- Render PDF / upload / publish fail → **KHÔNG** rollback phiếu quyết toán đã tạo; outbox retry 3× rồi `FAILED` cho vận hành.
- Không publish chứng từ lên `AC-DEV-ACCOUNTING-EVENTS` (topic AP) — sai `MessageGroup`, sai consumer.

### 11bis.3 Performance & Scale (bổ sung §12)

- Bước nặng: render PDF + upload `ct-file-storage` đồng bộ trong luồng tạo/huỷ phiếu — ngân sách p95 ≤ 3s (parity `gf-sales` printing), upload timeout 10s, không retry đồng bộ.
- Tần suất: 1 event / phiếu quyết toán (cặp AC-4 → 2 phiếu = 2 event) — thấp hơn nhiều so với tải dashboard §12.1; **không** cần index mới, không cache, không thay đổi `outbox_events` poll 5s / batch 100.
- Tenant fairness: dùng chung `OutboxProcessor` + Redis lock `gf-accounting-outbox-processor` (§12.6) — không thêm luồng nền mới.

## 12. Performance & Scale (SaaS multi-tenant)

> Yêu cầu Phase 7b (agent-arch-author v5+) — Garage là SaaS 17-boundary dashboard-heavy. Section này cover 6 axis cho gf-accounting (Settlement + Insurance + AP + PRC).

### 12.1 Expected load

| Metric | Target | Cite / Assumption |
|---|---|---|
| Total tenant count (production baseline) | ~500 garages | Delivery Authority est.; scale to 2000 within 12mo |
| Peak QPS (all endpoints) | 200 QPS | Dashboard views + settlement create bursts (end-of-day) |
| p95 API latency (default) | ≤ 500ms | Baseline dashboard UX |
| PRC concurrent runs (across cluster) | ≤ 8 simultaneous (2 pods × 4 Temporal worker slots per pod; capacity unchanged from v1 BG-thread model) | ADR-028 v2 §5 — `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod; Temporal task queue `PRC_TASK_QUEUE` load-balanced multi-replica; sufficient MVP (PRC monthly cadence) |
| PRC run typical duration | 30s – 5min per (warehouse × period × ~100 mã) | ADR-027 §Phase 2 parallel + §Phase 3 chunk |
| PRC iteration typical | 3–8 vòng (BR-PRC-017) | Observed pattern; SAFETY_CAP=100 defensive |

Product NFR chưa định lượng cụ thể — propose thresholds trên; flag `open_questions` OQ-perf-1 cho PO confirm.

### 12.2 Pagination strategy

| Endpoint | Pattern | Default page size | Max page size |
|---|---|---|---|
| `POST /api/v1/settlements/search` | Offset-based (`page`, `size`) — baseline, migrate cursor Q4 nếu > 10k rows/tenant | 20 | 100 |
| `POST /api/v2/accounting-periods/search` | Offset — small dataset (< 500 rows/tenant per BR-AP tree cap) | 50 | 500 |
| **`POST /api/v2/price-calc-runs/search`** (W06 new) | Offset — expected < 1k rows/tenant (monthly cadence) | 20 | 100 |
| `POST /api/v1/insurance-dossiers/search` | Offset | 10 | 50 |
| Cursor-based fallback | Auto trigger nếu tenant OB > 10k rows (defensive) | — | — |

### 12.3 Index list (all tenant-scoped tables — `(tenant_id, ...)` PREFIX REQUIRED)

| Query pattern | Index | Table |
|---|---|---|
| Search settlement by code | `idx_settlement_tenant_code (tenant_id, code)` | `settlement_records` |
| Filter by service order + type | `idx_settlement_tenant_so_type (tenant_id, service_order_code, settlement_type)` | `settlement_records` |
| AP tree lookup by year | `idx_ap_tenant_year (tenant_id, year, type)` | `accounting_period` |
| AP name search unaccent LIKE | `idx_ap_tenant_name (tenant_id, name)` | `accounting_period` |
| AP lock-check by date | `idx_ap_tenant_dates (tenant_id, start_date, end_date, status)` | `accounting_period` |
| **PRC run list by garage+wh** (W06) | `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)` | `price_calc_run` — cho BR-PRC-018 sort default |
| **PRC run active guard** (W06) | `uidx_prc_active_lock (tenant_id, garage_id, warehouse_id, period_id) WHERE status IN ('PENDING','RUNNING')` | `price_calc_run` — Layer 3 concurrency defense (ADR-028 §5) |
| **PRC run item lookup by run** (W06) | `idx_prc_item_run (tenant_id, run_id, status)` | `price_calc_run_item` — cho DETAIL polling |
| ~~**PRC run sweep orphan** (W06)~~ | ~~`idx_prc_run_status_lease (status, lease_until) WHERE status IN ('PENDING','RUNNING')`~~ | `price_calc_run` — **DEPRECATED v14 (Q2 v3 2026-07-23 Round 7 R6-F2 cascade)** — unused in Temporal model — worker discovery via Temporal task queue `PRC_TASK_QUEUE` polling, KHÔNG DB sweep. Post-migration có thể `DROP INDEX IF EXISTS`; giữ row trong doc để trace baseline. Cross-ref `gf-accounting-data-model.md §2quater.1` v12 same DEPRECATED marker. Layer 3 concurrency defense-in-depth vẫn active qua `uidx_prc_active_lock` (row trên). |

### 12.4 Cache strategy

| Cache | Key | TTL | Invalidation |
|---|---|---|---|
| AP lock-check response (caller-side LRU) | `(tenantId, date)` | 30s | LRU eviction; explicit invalidate on `AccountingPeriodClosed/Reopened` event (future ACTIVE flip) |
| Tenant print context (ct-saas-tenant) | `(tenantId)` | 5min | Explicit on tenant metadata update event (`gf-system`) |
| **PRC run polling response** (W06) | `(runId)` | 3s (short) | Explicit on state flip in PriceCalcRunService.commit() |
| **PRC scope predicate catalog resolution** (W06) | `(tenantId, garageId, "PWA+ACTIVE")` | 5min | Explicit on catalog update event `INTERNAL_PRODUCT_UPDATED` (future — currently manual refresh) |
| Settlement search result | `(tenantId, filter-hash)` | 60s | Explicit on settlement create/update/cancel |

### 12.5 N+1 avoidance

- **Settlement search** — JOIN `settlement_documents` via LEFT JOIN aggregate; NO fan-out per row.
- **AP tree query** — recursive CTE + application-side unaccent (per v10 fix); single query per tree request.
- **PRC search list** — JOIN `price_calc_run_item` COUNT aggregate `.itemCount` in single SQL; NO N+1 per row.
- **PRC DETAIL (bảng chi tiết theo mã)** — batch fetch `price_calc_run_item WHERE run_id = ?` single query (ordered by `line_no`).
- **PRC Phase 2** — parallel compute per productCode qua Temporal `Async.function(activities::computeItem, pc, snapshot)` fan-out + `Promise.allOf(promises).get()` join (per ADR-028 v2 §2 orchestration pseudocode); concurrency bounded by worker slot capacity `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod (over-capacity → activity queued trong Temporal task queue `PRC_TASK_QUEUE`, monitor `temporal_worker_task_slots_available` gauge). `ComputeItemActivity.startToClose=5min` + `heartbeatTimeout=60s` (heartbeat mỗi 5 iteration của vòng phụ convergent iteration §3 ADR-027). Snapshot fetched once at Phase 1 qua `SnapshotPullActivity` (batch REST call `gf-inventory` — chunked 200 codes/request per §4.1 INTEG doc); snapshot immutable payload pass qua workflow → mọi activity replay đọc cùng data.

### 12.6 Tenant fairness

- **Rate limit per tenant**: Spring Cloud Gateway (upstream) — 500 QPS/tenant across gf-accounting endpoints (default; overridable).
- **PRC concurrency per tenant**: max 2 concurrent PRC runs/tenant (application-level guard trong `PriceCalcRunService.checkTenantCap()` — check `SELECT COUNT(*) FROM price_calc_run WHERE tenant_id=? AND status IN ('PENDING','RUNNING')` trước `WorkflowClient.start()`) — protect worker slot pool from single-tenant hog. Vượt cap → HTTP 429 `ERR-INV-TENANT-CAP` (client retry with backoff).
- **Temporal worker slot capacity** (thay v1 `PriceCalcExecutorService` bulkhead — Round 7 R6-F4 cascade per Q2 v3 Temporal reversal): `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod bounded — 4 activity slot đồng thời. Over-capacity → activity queued trong Temporal task queue `PRC_TASK_QUEUE` (không throw HTTP 503; workflow-level Temporal `WorkflowExecutionTimeout=60min` sẽ fail-safe nếu queue depth quá lớn); monitor `temporal_worker_task_slots_available` gauge cho alerting. Multi-replica load-balanced transparently — Temporal server routes activity execution across pods cùng poll task queue (per ADR-028 v2 §5). Compensating HTTP 503 chỉ fire khi `WorkflowClient.start()` fail (Temporal Cloud outage) — controller compensating DELETE row + client retry (per ADR-028 v2 §Consequences Negative-3 + gf-accounting-api §5.3/§5.4 503 error meaning).
- **Bulk endpoints size cap** (§4 INTEG doc): chunk cap 500 lines/write, 200 codes/read — protect gf-inventory downstream.

## 10. References

- **TECHSTACK**: §boundary-snapshot, §outbox-redis, §printing, §http-client
- **API spec**: [gf-accounting-api.md](../api/gf-accounting-api.md) — Public 5 settlement endpoints (create/get/update/cancel/search) + 3 print endpoints (preview/pdf/image) = 8 total; downstream contract `GfSalesClient` (4) + `TenantClient` (1). _(DESIGN — ADR-019)_: §4 Accounting Period — 7 endpoints under `/api/v2/accounting-periods/*` + `/protected/v1/accounting-periods/lock-check`.
- **Events spec**: [accounting-events.md](../events/accounting-events.md) — outbox event catalog, topic `${ACCOUNTING-EVENTS:DEV-ACCOUNTING-EVENTS}`, group `gf-accounting-group`. _(DESIGN — ADR-019)_: [gf-accounting-events.md](../events/gf-accounting-events.md) §2 — 2 PROPOSED events `AccountingPeriodClosed`/`Reopened` trên topic `AC-DEV-ACCOUNTING-EVENTS`.
- **Workflows**:
  - [accounting-settlement-lifecycle-flow.md](../workflows/accounting-settlement-lifecycle-flow.md) — full flow: customer-only + insurance + cancel + print + sequence + outbox publish.
- **Data model**: [gf-accounting-data-model.md](../data/gf-accounting-data-model.md) — 5 tables, enum catalog (`SettlementType`, `SettlementStatus`, `SettlementDocumentType` 7 values, `OutboxStatus`). _(DESIGN — ADR-019)_: §6 — `accounting_period` entity + ERD + indexes.
- **Integrations**: [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md) §6 — lock-check consumer pattern (future RECEIPT-V2/DELIVERY-V2/PRC).
- **BFF**: [agg-garage-graph-graphql.md §3e](../api/agg-garage-graph-graphql.md) — 7 ops AP module; [agg-garage-graph-HLD.md](agg-garage-graph-HLD.md) — module callout.
- **FE integration**: [INTEG-FE-garage-web-agg-garage-graph.md §3.6b](../integrations/INTEG-FE-garage-web-agg-garage-graph.md) — UI Action → GraphQL → REST mapping (web-only).
- **Cross-link HLD**:
  - [gf-sales-HLD.md](gf-sales-HLD.md) — primary downstream (4 endpoints) + service order SoT
  - [agg-garage-graph-HLD.md](agg-garage-graph-HLD.md) — gateway aggregator
- **Insurance Settlement (DESIGN)**: [gf-accounting-events.md](../events/gf-accounting-events.md), [gf-accounting-data-model.md §2bis](../data/gf-accounting-data-model.md), [gf-accounting-api.md §3bis](../api/gf-accounting-api.md), [INTEG-EXT-gf-accounting.md](../integrations/INTEG-EXT-gf-accounting.md); ADR-014/015/016; Product EP-INSURANCE-SETTLEMENT + BR-EP-INSURANCE-SETTLEMENT.
- **Accounting Period (DESIGN)**: ADR-019; Product EP-INVENTORY-ACCOUNTING-PERIOD + BR-GF-INVENTORY-ACCOUNTING-PERIOD + UX-FLOW-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-AP-*; [Tracking/arch-design-inventory-v2-answers-1.md](../../Tracking/arch-design-inventory-v2-answers-1.md) Q4 SUPERSEDED note.


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-10 | v18 | **Round 2 fix (mandate Q7 + Q8)** — §11bis.1 gỡ bullet thu hồi (`DOCUMENT.SETTLEMENT.REVOKED` không tồn tại: `FEAT-STL-DETAIL` EC-7 đã bị BA gỡ 2026-08-03); §11bis.2 nêu đích danh 3 field snapshot `for-settlement` (`gf-sales-api.md` §3bis.2 v13) làm nguồn điều kiện emit — đóng P0 boundary isolation; §11bis.3 chỉnh số event. v17 → v18. |
| 2026-08-10 | v17 | **§11bis MỚI — đồng bộ chứng từ phiếu quyết toán sang Driver+ (ADR-031)**: emit khi tạo phiếu QT (`FEAT-STL-CREATE` AC-3 / `BR-STL-CRE-008`, cặp AC-4 → 2 event) + thu hồi khi huỷ; topic mới `AC-DEV-DOCUMENT-EVENTS`; tệp qua URL TTL 30 ngày; flag `Document:DriverPlus`; nguồn booking D+ lấy qua snapshot REST `for-settlement` (không đọc DB gf-sales). Kèm Invariants (bổ sung §7) + Performance & Scale (bổ sung §12). **KHÔNG** endpoint/bảng/cột mới — tái dùng outbox sẵn có. **KHÔNG đụng** §1–§11, §12, §10 References. v16 → v17. |
| 2026-08-02 | v16 | **CR-20260801-09 (MINOR, APPROVED) — §12.3 sort key drift `created_at DESC` → `executed_at DESC`, sửa **2 chỗ*** (`GAP-W06-GAC-09`). Cả 2 occurrence trong §12.3 (dòng mô tả "supports the outer filter" + row bảng "PRC run list by garage+wh") đều ghi sai cột cuối của `idx_prc_run_tenant_garage_wh`. Giá trị đúng đã ratified tại SSOT `Architecture/data/gf-accounting-data-model.md:460` ("FEAT-PRC-LIST default sort BR-PRC-018"); file này nằm trong reading list bắt buộc của agent DEV nên drift sẽ dẫn tới tạo index sai cột → LIST default sort seq-scan hoặc sai thứ tự nghiệp vụ. Companion cùng CR: `gf-accounting-api.md` v25→v26 (§5.1) + `Execution/wave-specs/W06/.../FEAT-PRC-DETAIL.md` §5.2. **KHÔNG đụng**: §1-§11, phần còn lại của §12, data-model (đã đúng). v15 → v16. |
| 2026-07-24 | v15 | **Mechanical rename `BQGQ` → `PWA`** (thống nhất pricing-method code với convention đã ratify tại `gf-inventory-data-model.md` v14 R13, 2026-06-24, Delivery Authority feedback). Đổi mọi technical enum/code occurrence (`pricingMethod` value, compound identifiers, prose shorthand, heading text) — KHÔNG đổi business meaning/behavior/error codes khác, KHÔNG đổi mô tả tiếng Việt "Bình quân cuối kỳ", KHÔNG rename file `ADR-027-bqgq-engine-and-convergent-iteration.md` (giữ nguyên làm historical identifier — chỉ đổi title/body bên trong). |
| 2026-07-23 | v14 | **Round 7 R6-F2 + R6-F3 + R6-F4 + R6-F8 mechanical purge — stale BG-thread/ExecutorService/sweep language leftover from Round 6 incomplete cascade**. Per `Tracking/arch-design-W06-answers-7.md`. (R6-F3 P1 — §1 Overview contradicts §11) §1 PRC callout rewrite line "background thread + DB-state polling — KHÔNG expand Temporal (giữ Gotcha #7 scope 5 services)" → describe Temporal workflow topology (task queue `PRC_TASK_QUEUE`, workflow ID `prc-{tenantId}-{runId}` Critical Rule #14, embed worker Spring Boot main, Common Gotcha #7 cascade 5 → 6 services); bump ADR reference `ADR-027 + ADR-028` → `ADR-027 v3 + ADR-028 v2`; add convergent iteration heartbeat callout (per `Activity.getExecutionContext().heartbeat()` 5-iteration cadence). (R6-F1 pair — §11.1 internal drift line 357) Fix "orchestrate 5 activities Phase 1..5" → "orchestrate **7 activities Phase 0..5**" (matches `× 7` list on next line + ADR-027 v4 §1.x expanded list + ADR-028 v3 §2 header corrected). (R6-F2 P1 — §12.3 index deprecation drift) Mark `idx_prc_run_status_lease` row DEPRECATED strike-through with note "unused in Temporal model — worker discovery via Temporal task queue polling, KHÔNG DB sweep; post-migration DROP INDEX IF EXISTS OK; cross-ref data-model §2quater.1 v12 same marker"; keep `uidx_prc_active_lock` row active (Layer 3 concurrency defense-in-depth per Round 6 mandate). (R6-F4 P1 — §12.5 ExecutorService.invokeAll() + §12.6 PriceCalcExecutorService bulkhead) §12.5 rewrite "parallel compute per productCode dùng `ExecutorService.invokeAll()`" → Temporal `Async.function(activities::computeItem, pc, snapshot)` fan-out + `Promise.allOf(promises).get()` per ADR-028 v2 §2; concurrency bounded by `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod; `ComputeItemActivity.startToClose=5min` + `heartbeatTimeout=60s`. §12.6 rewrite `PriceCalcExecutorService bulkhead (N=4, queue=10) → AbortPolicy → HTTP 503` → Temporal worker slot capacity `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod; over-capacity → activity queued trong Temporal task queue (not HTTP 503); monitor `temporal_worker_task_slots_available` gauge; HTTP 503 chỉ fire khi `WorkflowClient.start()` fail (Temporal Cloud outage — compensating DELETE + retry). PRC concurrency per tenant guard kept (max 2 concurrent + HTTP 429 `ERR-INV-TENANT-CAP`). (R6-F8 P2 — §12.1 "4 threads" wording drift) `2 pods × 4 threads` → `2 pods × 4 Temporal worker slots per pod (capacity unchanged from v1 BG-thread model)` + ADR reference bump `§Negative-1 mitigation` → `v2 §5 WorkerOptions.setMaxConcurrentActivityExecutionSize(4)`. **KHÔNG đụng**: §1 baseline settlement/AP callouts + §2-§10 + §11.1 remaining components + §11.2 aggregate + §11.3 key decisions (Round 6 v13 stable) + §11.3bis BR-PRC-015 cascade + §11.4 forbidden + §12.2 pagination + §12.3 rows non-DEPRECATED + §12.4 cache. Pair với ADR-027 v4 §1.x (activity list expand 5 → 7 with UpdateRunStatusActivity + CommitRunActivity) + ADR-027 v4 §Consequences Negative-1 rewrite + ADR-028 v3 §2 header count 5 → 7 + TECHSTACK v3 (Temporal 5 → 6 services) + gf-accounting-data-model v13 (§3 sweep reference rewrite) + gf-accounting-api v22 (§7 References label ADR-028 v2). v13 → v14. |
| 2026-07-23 | v13 | **§11 PRC subsystem — Q2 v3 reversal cascade (Temporal workflow thay background thread)**. Per ADR-027 v3 §1.x + ADR-028 v2. §11 header: title bump ADR-027 v3 + ADR-028 v2, note "amended 2026-07-23 v13". §11.1 components: replace `PriceCalcExecutorService` + `PriceCalcRunSweepJob` + `Redis distributed lock prc:lock` → `PriceCalcRunWorkflow` (`@WorkflowInterface`), `PriceCalcActivities × 7` (SnapshotPull / UpdateRunStatus / ComputeItem / BulkFillCost / BulkInheritCost / BulkRecomputeLedger / CommitRun), `PriceCalcTemporalWorker` (@PostConstruct init, embed Spring Boot, task queue `PRC_TASK_QUEUE`, workflowId `prc-{tenantId}-{runId}` Rule #14), `PriceCalcWorkflowFailureListener` (Temporal callback replace v1 SweepJob). Ghi rõ REMOVED components + updated Metrics (Temporal SDK auto-emit). §11.2 Invariants: I1 concurrency 3-layer thay Redis → `WorkflowIdReusePolicy.REJECT_DUPLICATE`; I6 replace bounded ThreadPool → Temporal `maxConcurrentActivityExecutionSize=4`; I7 replace `MAX_STUCK_MINUTES=60` sweep → `WorkflowExecutionTimeout=60min` + activity `startToClose` per phase + heartbeat 60s; I8 mới (workflow deterministic guarantee — TestWorkflowRule replay). §11.2 state machine ASCII: replace "Redis lock" → "WorkflowClient.start()" + `REJECT_DUPLICATE`; add "Workflow lifecycle mapping" paragraph (PENDING/RUNNING/terminal transitions per activity + FailureListener path). §11.3 Key decisions: async-pattern row flip Q2=A → Q2 v3 Temporal; concurrency row flip → embed worker + `WorkflowIdReusePolicy` + unique index; DB-state+sweep row flip → Temporal history + retry + heartbeat. §11.4 Forbidden: strike-through "Adopt Temporal cho PRC" (reversed); add 2 new bullets — non-deterministic APIs trong @WorkflowMethod + payload lớn trong workflow input (history size limit). **KHÔNG đụng**: §1-§10 baseline + §11.3bis BR-PRC-015 cascade + §12 Performance & Scale (all sub-sections). v12 → v13. |
| 2026-07-23 | v12 | **W06 Round 4 Product-coverage audit fix — F-05 BR-PRC-015 "kỳ sau cần tính lại" detection paragraph** (per FEAT-PRC-CREATE AC-9b + BR-PRC-015). Add §11.3bis "Post-commit BR-PRC-015 subsequent-period cascade detection" — describes detection step (runs at Phase 5/6 of ADR-027 algorithm, AFTER commit run status TERMINAL, BEFORE returning HTTP 202 response), full SQL query pattern (with LATEST-run-per-period subquery guarding RECALC audit chain), index coverage note (reuse existing `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates` — no new index needed per §12.3), populate `affectedSubsequentPeriods` response field (shape ref `gf-accounting-api.md §5.3/§5.4`), non-blocking semantics (query failure → log warning + empty array, no CREATE/RECALC failure), performance envelope ≤ 20ms typical (< 5% Phase 5 latency budget). Pair với `gf-accounting-api v19 §5.3 + §5.4` (response field + Semantics extend) + ADR-027 v2 §4 (RECALC copy-forward + cascade note). **KHÔNG đụng**: §1-§10 baseline + §11.1 components + §11.2 aggregate + §11.3 key decisions + §11.4 forbidden + §12 Performance & Scale (all sub-sections). v11 → v12. |
| 2026-07-22 | v11 | **+§11 PRC Extension (W06 arch-design — ADR-027 + ADR-028, Q1/Q2/Q3=A ratify 2026-07-22)**: gf-accounting mở rộng làm chủ PRC (PWA engine cuối kỳ) — 5 FEAT-PRC-* (LIST/CREATE/DETAIL/RECALC/DELETE) land trên gf-accounting. §1 callout PRC subsystem + Q1=A rationale note. §2 component diagram add-on PRC controllers/services (PriceCalcRunController, PwaEngineService, PriceCalcExecutorService, PriceCalcRunSweepJob, GfInventoryPrcClient). §11 mới (11.1 components, 11.2 aggregate PriceCalcRun + state machine 7 invariants, 11.3 8 key decisions, 11.4 7 forbidden bullets). §12 Performance & Scale mới (12.1 expected load, 12.2 pagination — 20 default/100 max cho PRC list, 12.3 index list — bắt buộc `(tenant_id, ...)` prefix cho mọi table tenant-scoped bao gồm 4 index PRC mới, 12.4 cache — 3s TTL polling + 5min catalog scope, 12.5 N+1 avoidance — Phase 2 parallel per-product + Phase 1 batch snapshot, 12.6 tenant fairness — 2 concurrent PRC/tenant + bulkhead thread pool N=4). `depends_on` +ADR-027 + ADR-028 + INTEG-EXT-gf-accounting-gf-inventory. Async pattern KHÔNG dùng Temporal (giữ Gotcha #7 scope 5 services); sync HTTP 202 + BG thread + DB polling per ADR-028. Cross-boundary REST S2S sang gf-inventory (read + bulk-write) qua new INTEG file. v10 → v11. |
| 2026-06-24 | v10 | **R4 tree endpoint GET→POST + name search (per Delivery Authority feedback 2026-06-24)**: §6 Quality attributes — AP tree query row updated method/signature `GET ...?year=` → `POST /tree` body `{year, name?}`; thêm reference index `idx_ap_tenant_name` cho LIKE-unaccent name search. v9 → v10. |
| 2026-06-24 | v9 | **R3 audit-col strip — `accounting_period` (per Delivery Authority feedback 2026-06-24)**: §5 Data Ownership row remove `closed_at/by`, `reopened_at/by`; replace với "audit pair tracks transitions". §9.2 state machine ASCII remove `closed_at/by` line dưới CLOSED. Rationale: close/reopen = status update tracked via standard `updated_at/by`. v8 → v9. |
| 2026-06-24 | v8 | **+§9 Accounting Period extension (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**: 5 FEAT-AP-* (LIST/CREATE/DETAIL/EDIT/DELETE) land trên gf-accounting (không phải gf-inventory như BA frontmatter hiện hữu — CLAUDE override). §1 callout AP subsystem + frontmatter note BA frontmatter mismatch. §2 component diagram add-on AP controllers/services. §3 +5 key decisions (additive entity, adjacency-list 3 cấp, REST lock-check ACTIVE + Kafka PROPOSED, `/api/v2/*` prefix, topic AC-DEV-ACCOUNTING-EVENTS reuse). §5 Data Ownership +`accounting_period` row. §6 Quality +3 attribute (tree p95, lock-check p95, CRUD p95). §7 Forbidden +6 bullet (cross-boundary DB ban, no publish PROPOSED, no breaking change PROPOSED, no edit immutable, no hard-delete bypass guard). §9 mới (9.1 components, 9.2 aggregate+state machine 7 invariants, 9.3 decisions, 9.4 forbidden). §10 References (renumber: old §9→§10) +ADR-019 + AP product/integration/BFF/FE refs + Tracking. `depends_on` +ADR-019. |
| 2026-06-09 | v7 | **+§8.3bis Error contract (`INS_*` — CR-1780980611)**: luồng Phiếu QT BH emit registry code (INS-2002/2003/2004/2005/2006 + INS-1008) thay `GMS.gf-accounting.SETTLEMENT_*`; mode-invalid 500→422; "no-insurance-item" giữ internal (flag #2); +Forbidden bullet. Trỏ gf-accounting-api §3bis.9, BR-EP §5.5. |
| 2026-06-03 | v6 | **Flatten JSONB + xoá events**: §8 — thay `insurance_adjustments`/`breakdown_by_payer` JSONB bằng scalar columns; xoá 4 DESIGN events (không publish qua outbox — REST only cho settlement lifecycle). |
| 2026-05-31 | v5 | **ADR renumber 4→3** (gộp ADR-015 workflow vào ADR-014): cập nhật depends_on (bỏ ADR-015 workflow, debt = ADR-015, PDF = ADR-016) + §8.3 decisions table + §8.4 forbidden + §9 references. Workflow no-Temporal nay = ADR-014 §Workflow. |
| 2026-05-30 | v4 | **Insurance Settlement extension (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014/015/016)**: thêm §8 — new components (InsuranceDossier/Debt controllers + services), aggregates InsuranceSettlement/InsuranceDossier/SettlementPaymentReconciliation + state machines, key decisions (reuse gf-accounting, no Temporal, REST debt-summary, PDF→S3), forbidden bổ sung. §1 overview callout. Renumber References §8→§9. depends_on + references thêm gf-accounting-events/ADR-014..017/INTEG-EXT-gf-accounting. Reuse settlement pair/printing/sequence/outbox infra. |
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (SettlementCtrl·SettlementPrintingCtrl·KafkaListener/OutboxSch → SettlementService/DocPrintService/Outbox → JPA ddl-auto/Kafka/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-sales·ct-saas-tenant; outbox params + Kafka P/C footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v6 + source audit: (F-01) tech stack Java 24/SB 4.0.3 → Java 21/SB 3.5.0, resolve HLD-ACCOUNTING-002; (F-02) API count 6 settlement → 5 (create/get/update/cancel/search); (F-03) thêm `spring-feature-flag-starter 0.0.9-SNAPSHOT` + `@FeatureOn(Sales:SalesManagementV01)` gate trên cả 2 controller; (F-04) `tenant_sequences` sửa cấu trúc — bỏ `tenant_id` PK, thêm `sequence_date`, unique constraint `uk_sequences_name_date(sequence_name, sequence_date)`; (F-05) inbound dependencies rút còn 1 caller thực tế (`agg-garage-graph`), bỏ aspirational entries; (F-06) common-printing 0.0.2 → 0.0.2-SNAPSHOT; (F-08) Flyway status làm rõ: dependency+config present nhưng không có migration file; (F-09) `inbox_events.event_id` ghi nhận thiếu unique constraint (open HLD-ACCOUNTING-011). |
| 2026-05-07 | v1 | Initial HLD cho `gf-accounting`: settlement service order Garage (Java 24 + Spring Boot 4.0.3), tables `settlement_records` (CUSTOMER/INSURANCE pair qua `related_settlement_code`) + `settlement_documents` (document_url identity, soft delete) + `tenant_sequences` (`SET-yyyyMMdd-00001` per tenant per day, pessimistic lock) + `outbox_events` + `inbox_events`, public REST `/api/v1/*` (6 settlement + 3 print) + protected (x-api-key), Kafka topic `${ACCOUNTING-EVENTS:DEV-ACCOUNTING-EVENTS}` outbox publish (poll 5s, batch 100, retries 3, Redis lock `gf-accounting-outbox-processor`), downstream `gf-sales` (4 endpoints: for-settlement/settle/reopen/for-print) + `ct-saas-tenant`, common-printing 0.0.2 cho HTML/PDF/PNG/JPG. Pair invariant cancel toàn bộ settlement của 1 service order. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
