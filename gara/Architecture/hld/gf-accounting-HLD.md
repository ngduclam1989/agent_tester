---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 10
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-06-24"
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

> **Accounting Period (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23)**: gf-accounting mở rộng làm chủ **Kỳ kế toán** (entity mới `accounting_period`, adjacency-list 3 cấp YEAR→QUARTER→MONTH, status OPEN ⇄ CLOSED đối xứng). 7 REST endpoint `/api/v2/accounting-periods/*` (search/tree/detail/create với auto-generate children/update/delete) + 1 protected `lock-check` cho future RECEIPT-V2/DELIVERY-V2/PRC consumers (advisory only). 2 events `AccountingPeriodClosed`/`Reopened` declared **PROPOSED** (status flip ACTIVE = future wave responsibility). Topic `AC-DEV-ACCOUNTING-EVENTS` (reuse existing — D1). Web GMS only (mobile out of scope per UX-FLOW). Chi tiết §10. **Note**: BA frontmatter trên Product files vẫn ghi `boundary: gf-inventory` (chưa fix) — design dùng `gf-accounting` làm authoritative per CLAUDE override + Tracking/arch-design-inventory-v2-answers-1.md Q4 SUPERSEDED note.

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
