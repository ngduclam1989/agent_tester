---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-AP-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-CREATE"
source_feat_sha: "fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage/kế toán tạo kỳ Năm 2027 (type=YEAR, year=2027, autoGenerateChildren=true) → hệ thống atomic tạo 1 kỳ năm + 16 kỳ con (4 quý + 12 tháng), status=OPEN → HTTP 201 trả createdPeriod + generated{created,skipped}"
consumes_contracts: []
paired_bff_feats: ["FEAT-AP-CREATE"]
paired_fe_web_feats: ["FEAT-AP-CREATE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "not-computed (no SHA tool available in authoring session — orchestrator to backfill)"
  template_sha: "not-computed (no SHA tool available in authoring session — orchestrator to backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-CREATE.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-CREATE (BE): Tạo kỳ kế toán

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` (single-boundary — AP master, không gọi ra ngoài tại CREATE) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Chủ garage/kế toán tạo kỳ Năm 2027 (type=YEAR, year=2027, autoGenerateChildren=true) → hệ thống atomic tạo 1 kỳ năm + 16 kỳ con (4 quý + 12 tháng), status=OPEN → HTTP 201 trả createdPeriod + generated{created,skipped} |
| Cross-tier pair | BFF: FEAT-AP-CREATE \| Web: FEAT-AP-CREATE \| Mobile: — (web-only per Architecture API doc §4 note) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) |
| Source version | v6 |
| Source SHA | `fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần khung kỳ kế toán phân cấp Năm→Quý→Tháng để kiểm soát đóng/mở sổ và chốt số liệu kho theo từng mốc thời gian. Feature này cho phép tạo một kỳ mới (kèm tùy chọn tự động sinh đầy đủ kỳ con) làm nền tảng cho toàn bộ nghiệp vụ khóa kỳ downstream — nhập/xuất kho, tồn đầu kỳ và tính giá xuất kho đều dựa vào kỳ đã tạo để xác định trạng thái OPEN/CLOSED. Đây là entry point bắt buộc của `EP-INVENTORY-ACCOUNTING-PERIOD`; `FEAT-AP-LIST`, `FEAT-AP-DETAIL`, `FEAT-AP-EDIT`, `FEAT-AP-DELETE` và các luồng downstream (RECEIPT-V2/DELIVERY-V2/OB/PRC) đều phụ thuộc vào sự tồn tại của kỳ đã tạo.

## 2. Trách nhiệm backend (gf-accounting)

- Deploy entity mới `accounting_period` (16 cột, adjacency-list self-FK per ADR-009) qua **Flyway `V{N+1}__accounting_v1_accounting_period.sql` additive** — per **ADR-019 v5 Decision B exception** (2026-07-08 override Gotcha #5 sau NC-W04-EP-AP-002 resolution v3). Rationale: AP entity phát sinh mới W04 với constraint validation (CHECK `year = EXTRACT(YEAR FROM start_date)`, adjacency-list self-FK) cần idempotent + audit trail. Baseline 5 settlement + 3 design insurance tables của boundary vẫn `ddl-auto=update` (Gotcha #5 unchanged — exception CHỈ áp dụng cho `accounting_period`).
- Expose REST endpoint `POST /api/v2/accounting-periods` (Architecture SSOT — `gf-accounting-api.md` §4.4): nhận payload, validate toàn bộ field, tạo 1 kỳ đơn hoặc atomic tạo cả cây con khi `autoGenerateChildren=true`.
- Enforce BR-AP primary tại domain + service layer: hierarchy 3 cấp cố định (BR-AP-003), required fields (BR-AP-005), date range/overlap check (BR-AP-006/007/008), consistency `year` ↔ `startDate` (CHECK constraint + app-layer defensive), tự động sinh kỳ con atomic + skip existing (BR-AP-009), permission dual persona ngang quyền (BR-AP-CMN-002).
- Sinh `code` deterministic `AP-{type}-{tenantId}-{slug}` làm partition key nội bộ (KHÔNG user-facing — BR-AP-002 kỳ không có mã user-facing).
- Trả 201 với payload đủ để BFF/FE render confirmation, gồm `createdPeriod` + tóm tắt kết quả tự động sinh kỳ con (`generated.created`/`generated.skipped`/`generated.skippedDetails`).
- `SELECT ... FOR UPDATE` lock trên `parent_id` row trước overlap check — chống race condition khi 2 request tạo đồng thời cùng kỳ cha.
- KHÔNG có cross-boundary call ở CREATE (feature chỉ ghi local; endpoint `lock-check` mà `gf-accounting` expose để `gf-inventory` consume thuộc scope FEAT khác — ADR-021).

## 3. Hành vi cần triển khai (BE behaviour map)

> Mỗi source AC-ID → 1 BE behaviour statement. Coverage: 12/12 AC (10 BE-relevant + 2 UI-only N/A).

### Cluster A — Phân quyền

#### AC-1 → N/A (UI-only — mở form thêm kỳ)

Source AC này thuộc tier fe-web (navigate + render form "Thêm kỳ kế toán"). BE không touch. Xem `fe-web/FEAT-AP-CREATE.md §3 AC-1`.

#### AC-12 → Kiểm tra phân quyền tạo kỳ kế toán

- **Khi**: client gửi `POST /api/v2/accounting-periods` với JWT.
- **BE phải**: resolve tenant từ security context (`SecurityUtils.getCurrentTenantIdAsLong()`) qua `TenantFilter`; xác nhận role ∈ {`garage-owner`, `accountant`} — **quyền ngang nhau, không phân biệt** (BR-AP-CMN-002). Thiếu token hoặc role sai → reject trước khi chạm business logic.
- **Output**: 401 nếu token invalid; 403 nếu role ngoài 2 persona hợp lệ.
- **Failure mode**: không leak thông tin tenant khi unauthorized.
- **Ref**: Critical Rule #4 (tenant isolation) + #6 (dual persona only); BR-AP-CMN-002; endpoint §6.1.

### Cluster B — Loại kỳ & field đặc thù theo hierarchy

#### AC-2 → Validate loại kỳ (type)

- **Khi**: nhận body field `type` (required).
- **BE phải**: validate `type` ∈ {`YEAR`, `QUARTER`, `MONTH`} (BR-AP-003 — hierarchy cố định 3 cấp); persist enum `AccountingPeriodType`.
- **Output**: 400 + `ERR-CMN-validation` nếu type absent hoặc ngoài enum.
- **Failure mode**: `ERR-CMN-validation`.
- **Ref**: BR-AP-003; entity `accounting_period.type` (§5.1).

#### AC-4 → Validate field đặc thù theo loại kỳ (year / parentId)

- **Khi**: nhận body fields `year` (required), `parentId` (required nếu `type ≠ YEAR`).
- **BE phải**:
  - `type=YEAR`: `year` bắt buộc từ request (dropdown FE `[currentYear, currentYear+49]` — BR-AP-003a, BE chỉ validate integer plausible range 2000–2100 defensive, KHÔNG re-derive); `parentId` phải NULL — nếu client gửi `parentId` cho `type=YEAR` → reject (BR-AP-004).
  - `type=QUARTER|MONTH`: `parentId` bắt buộc (BR-AP-004); `year` BE derive từ `parent.year` (recursive lookup adjacency-list) nếu client không gửi, hoặc validate consistency nếu client gửi.
  - Persist `year INTEGER NOT NULL` trên **mọi** row (YEAR/QUARTER/MONTH) — cross-check CHECK constraint `year = EXTRACT(YEAR FROM start_date)`.
- **Output**: 400 + `ERR-CMN-validation` nếu `parentId` thiếu (type≠YEAR) hoặc thừa (type=YEAR); 400 + `ERR-CMN-validation`/`ERR-AP-002` (placeholder — OQ8) nếu `year` mismatch `startDate`.
- **Failure mode**: `ERR-CMN-validation`, `ERR-AP-002` (proposed, pending BA registry).
- **Ref**: BR-AP-003a, BR-AP-004, BR-AP-005; entity `accounting_period.year` + CHECK constraint (§5.1); endpoint §6.1.

#### AC-5 → Validate `parentId` trỏ đúng kỳ cha hợp lệ

- **Khi**: nhận body field `parentId` cho `type=QUARTER|MONTH`.
- **BE phải**: query `accounting_period WHERE id = parentId AND tenant_id = currentTenant`; not found → `ERR-CMN-validation` ("không tìm thấy kỳ cha"); found nhưng `parent.type` sai cấp (QUARTER phải trỏ YEAR, MONTH phải trỏ QUARTER) → `ERR-INV-022` (reuse, BR-AP-003/004). **Lưu ý phạm vi**: việc populate dropdown "Thuộc kỳ" (danh sách kỳ cha hợp lệ để hiển thị cho user chọn) là trách nhiệm của endpoint search/tree (`FEAT-AP-LIST` — `POST /api/v2/accounting-periods/search|tree`), KHÔNG phải CREATE; CREATE chỉ validate giá trị đã submit.
- **Output**: 400 + `ERR-CMN-validation` (not found) hoặc `ERR-INV-022` (type mismatch).
- **Failure mode**: `ERR-CMN-validation`, `ERR-INV-022`.
- **Ref**: BR-AP-003, BR-AP-004; entity `accounting_period.parent_id` (§5.1); cross-ref `FEAT-AP-LIST` (dropdown population, out-of-scope CREATE).

### Cluster C — Trường bắt buộc & mặc định

#### AC-3 → Validate và lưu tên kỳ kế toán

- **Khi**: nhận body field `name` (required).
- **BE phải**: validate `name` non-null, non-blank, ≤255 chars; persist `name VARCHAR(255) NOT NULL`. **KHÔNG** enforce unique — BR-AP-002 explicit "không bắt buộc kiểm tra trùng tên".
- **Output**: 400 + `ERR-CMN-validation` nếu name rỗng/null/quá dài.
- **Failure mode**: `ERR-CMN-validation`.
- **Ref**: BR-AP-002, BR-AP-005; entity `accounting_period.name` (§5.1).

#### AC-6 → Validate và lưu ngày bắt đầu / kết thúc

- **Khi**: nhận body fields `startDate`, `endDate` (required, ISO `YYYY-MM-DD`).
- **BE phải**: validate both present + parseable DATE; validate range theo AC-9 (BR-AP-006/007/008); persist `start_date`/`end_date DATE NOT NULL`.
- **Output**: 400 + `ERR-CMN-validation` nếu thiếu/parse fail; xem AC-9 cho range validation errors.
- **Failure mode**: `ERR-CMN-validation`.
- **Ref**: BR-AP-005; entity `accounting_period.start_date/end_date` (§5.1).

#### AC-7 → Mặc định thứ tự hiển thị, trạng thái, mô tả

- **Khi**: tạo mới, body có thể omit `displayOrder`, `status`, `description`.
- **BE phải**: `displayOrder` default `0` nếu absent (BR-AP-005); `status` **luôn** default `OPEN` tại create — client gửi `status` khác `OPEN` (nếu có) vẫn bị ignore/reset về `OPEN` (BR-AP-001, không có tùy chọn tạo kỳ CLOSED sẵn); persist `description VARCHAR(500)` nullable nếu có.
- **Output**: response `status: "OPEN"` bất kể input; `displayOrder` = giá trị submit hoặc `0`.
- **Failure mode**: N/A (forced defaults, không throw lỗi).
- **Ref**: BR-AP-001, BR-AP-005; entity `accounting_period.status/display_order/description` (§5.1).

### Cluster D — Validate khoảng ngày & chồng lấn

#### AC-9 → Validate khoảng ngày (endDate/startDate, phạm vi kỳ cha, chồng lấn cùng cấp)

- **Khi**: Lưu (trước persist, trong cùng transaction với overlap-lock).
- **BE phải**:
  - (a) `endDate >= startDate` — vi phạm → `ERR-INV-021` (BR-AP-006).
  - (b) Nếu có `parentId`: `startDate ≥ parent.startDate` VÀ `endDate ≤ parent.endDate` (cho phép trùng ngày biên) — vi phạm → `ERR-INV-022` (BR-AP-007).
  - (c) Kỳ cùng cấp trong cùng kỳ cha (hoặc cùng tenant nếu `type=YEAR`, không parent) KHÔNG chồng lấn khoảng ngày — query `accounting_period WHERE tenant_id=? AND type=? AND parent_id=? AND [start_date,end_date] OVERLAPS [:startDate,:endDate]` (dùng index `idx_ap_tenant_dates`) — vi phạm → `ERR-INV-023` (BR-AP-008).
  - `SELECT ... FOR UPDATE` trên `parent_id` row trước bước (c) để chống race concurrent POST cùng kỳ cha.
- **Output**: 400 + error code tương ứng; transaction rollback toàn bộ.
- **Failure mode**: `ERR-INV-021`, `ERR-INV-022`, `ERR-INV-023`.
- **Ref**: BR-AP-006, BR-AP-007, BR-AP-008; indexes `idx_ap_tenant_dates`, `idx_ap_parent` (§5.2); endpoint §6.1.

### Cluster E — Tự động sinh kỳ con

#### AC-8 → Tự động sinh kỳ con atomic (autoGenerateChildren)

- **Khi**: body field `autoGenerateChildren=true` (chỉ hợp lệ khi `type ∈ {YEAR, QUARTER}` — BR-AP-009; `type=MONTH` + `autoGenerateChildren=true` → 400 generic validation error, không tạo).
- **BE phải**:
  - `type=YEAR` → sinh atomic 4 QUARTER (Q1 Jan1–Mar31, Q2 Apr1–Jun30, Q3 Jul1–Sep30, Q4 Oct1–Dec31) + 12 MONTH con tương ứng, cùng transaction với row cha vừa tạo.
  - `type=QUARTER` → sinh atomic 3 MONTH con khớp lịch quý.
  - Mỗi kỳ con inherit `year` từ YEAR gốc (propagate xuống, không cần user cung cấp riêng).
  - `display_order` kỳ con set theo **thứ tự thời gian tăng dần trong phạm vi kỳ cha trực tiếp**: trong kỳ năm Q1=1..Q4=4; trong mỗi kỳ quý tháng đầu=1..tháng cuối=3 (đảm bảo sort ASC khớp thứ tự thời gian tự nhiên ở `FEAT-AP-LIST`).
  - **Skip kỳ con đã tồn tại** (trùng khoảng ngày theo BR-AP-008 — pre-check trong cùng transaction, không throw lỗi cho case này); chỉ sinh kỳ còn thiếu.
  - Toàn bộ (row cha + N row con) wrap 1 `@Transactional`; partial failure → rollback all (không tạo nửa cây).
- **Output**: response `generated: {created: N, skipped: M, skippedDetails: [{type, startDate, endDate, conflictWithId}]}`.
- **Failure mode**: rollback toàn bộ nếu bất kỳ bước nào fail (vd overlap detection lỗi giữa các con tự sinh với nhau).
- **Ref**: BR-AP-009; entity relations §5.1; response schema §6.1.

### Cluster F — Lưu / huỷ

#### AC-10 → Trả 201 sau khi lưu thành công

- **Khi**: toàn bộ validation pass, transaction commit thành công.
- **BE phải**: trả HTTP 201 với `{data: {createdPeriod, generated}, code: "ACCOUNTING_PERIOD_CREATED"}`; `createdPeriod.status = "OPEN"` luôn (BR-AP-001).
- **Output**: 201 + `AccountingPeriodCreateResponse` (§6.1).
- **Failure mode**: transaction rollback toàn bộ nếu bất kỳ step nào (validate/persist/auto-generate) fail.
- **Ref**: BR-AP-001; entity `accounting_period` (§5.1).

#### AC-11 → N/A (UI-only — huỷ bỏ form)

Source AC này thuộc tier fe-web (đóng form, không gọi API, quay về danh sách). BE không touch. Xem `fe-web/FEAT-AP-CREATE.md §3 AC-11`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-AP-001** (CORNERSTONE): kỳ khởi tạo luôn `status=OPEN` — domain model forced default, ignore input override. Vi phạm khái niệm → N/A (silent enforce).
- **BR-AP-002** (NORMAL): `name` bắt buộc, KHÔNG unique constraint — @Valid tại request DTO. Vi phạm → `ERR-CMN-validation` + 400.
- **BR-AP-003** (CORNERSTONE): hierarchy cố định YEAR→QUARTER→MONTH — enum parse + parent-type validate tại service layer. Vi phạm → `ERR-CMN-validation` (enum) hoặc `ERR-INV-022` (hierarchy) + 400.
- **BR-AP-003a** (NORMAL): `year` cho `type=YEAR` bắt buộc từ request (FE dropdown 50 giá trị) — BE validate plausible range defensive, KHÔNG tự derive cho YEAR.
- **BR-AP-004** (CORNERSTONE): `parentId` bắt buộc với QUARTER/MONTH, NULL bắt buộc với YEAR — service pre-check. Vi phạm → `ERR-CMN-validation`/`ERR-INV-022` + 400.
- **BR-AP-005** (NORMAL): required fields (type, name, startDate, endDate, status default; parentId/year theo loại) — @Valid + service check. Vi phạm → `ERR-CMN-validation` + 400.
- **BR-AP-006** (CORNERSTONE): `endDate >= startDate` — app validate + DB CHECK constraint defensive. Vi phạm → `ERR-INV-021` + 400.
- **BR-AP-007** (CORNERSTONE): con ⊆ phạm vi ngày cha (cho trùng biên) — service layer query parent range. Vi phạm → `ERR-INV-022` + 400.
- **BR-AP-008** (CORNERSTONE): cùng cấp trong cùng cha không chồng lấn — `SELECT FOR UPDATE` + range overlap query trước insert. Vi phạm → `ERR-INV-023` + 400.
- **BR-AP-009** (CORNERSTONE): tự động sinh kỳ atomic, skip existing, summary tóm tắt — service transaction logic.
- **BR-AP-CMN-002** (NORMAL): 2 persona `garage-owner`/`accountant` quyền ngang nhau trên toàn bộ AP — RBAC check tại controller/security layer.
- **CHECK constraint** (defensive, DB layer): `year = EXTRACT(YEAR FROM start_date)` — app-layer enforce song song trước persist; vi phạm → `ERR-CMN-validation`/`ERR-AP-002` (placeholder, OQ8) + 400.

### 4.2 Tenant + auth

- Mọi query propagate tenant qua `TenantFilter`/`TenantContext`; tenant resolve từ `SecurityUtils.getCurrentTenantIdAsLong()` (Critical Rule #4).
- `POST /api/v2/accounting-periods` yêu cầu role `garage-owner` hoặc `accountant` (Critical Rule #6 — dual persona only, quyền ngang nhau BR-AP-CMN-002).
- Lookup `parentId` luôn filter `tenant_id = currentTenant` — không leak cross-tenant existence (not found → generic `ERR-CMN-validation`, không phân biệt "không tồn tại" vs "thuộc tenant khác").

### 4.3 Idempotency + concurrency

- **KHÔNG** yêu cầu `Idempotency-Key` — BA spec không yêu cầu; chống trùng dựa trên overlap check tự nhiên (BR-AP-008), tên không unique nên không thể dùng làm dedup key.
- `SELECT ... FOR UPDATE` lock trên `parent_id` row trước overlap check — chống race giữa 2 request tạo đồng thời cùng kỳ cha (BR-AP-008 concurrency defense).
- Transaction scope bắt buộc: row cha + toàn bộ row con auto-generate (nếu có) atomic trong 1 Spring `@Transactional` — partial failure rollback all.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-2, AC-3, AC-4, AC-5, AC-6 | INLINE (field-level message từ BE) |
| `ERR-INV-021` | 400 | AC-9 | INLINE (field: endDate — endDate < startDate) |
| `ERR-INV-022` | 400 | AC-5, AC-9 | INLINE (field: parentId / dates — hierarchy hoặc range mismatch) |
| `ERR-INV-023` | 400 | AC-9 | INLINE (field: dates — sibling overlap) |
| `ERR-AP-002` (proposed, pending BA registry — OQ8) | 400 | AC-4 | INLINE (field: year — mismatch với startDate/parent.year); dùng `ERR-CMN-validation` cho tới khi BA đăng ký chính thức |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-accounting`

> **Flyway `V{N+1}__accounting_v1_accounting_period.sql` additive** — per **ADR-019 v5 Decision B exception** (Gotcha #5 override cho `accounting_period` entity, 2026-07-08 canonical align, NC-W04-EP-AP-002 v3 resolution). Entity hoàn toàn mới, tách bạch khỏi settlement aggregate — KHÔNG modify 5 bảng baseline hoặc 3 bảng design insurance (5 baseline + 3 design insurance vẫn `ddl-auto=update` per Gotcha #5).

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `accounting_period` | `id` | BIGINT identity | N | auto-increment | Flyway V{N+1} | — | AC-10 | PK |
| `accounting_period` | `tenant_id` | BIGINT | N | — | Flyway V{N+1} | Critical Rule #4, BR-AP-015 | AC-12 | TenantFilter scope |
| `accounting_period` | `code` | VARCHAR(50) | Y | auto-derived `AP-{type}-{tenantId}-{slug}` | Flyway V{N+1} | BR-AP-002 | AC-10 | KHÔNG user-facing, partition key nội bộ |
| `accounting_period` | `name` | VARCHAR(255) | N | — | Flyway V{N+1} | BR-AP-002, BR-AP-005 | AC-3 | KHÔNG unique |
| `accounting_period` | `type` | VARCHAR(20) enum | N | — | Flyway V{N+1} | BR-AP-003 | AC-2 | `YEAR\|QUARTER\|MONTH` |
| `accounting_period` | `parent_id` | BIGINT | Y (NULL cho YEAR) | NULL | Flyway V{N+1} | BR-AP-004 | AC-4, AC-5 | Scalar self-FK (ADR-009 — no `@ManyToOne`) |
| `accounting_period` | `start_date` | DATE | N | — | Flyway V{N+1} | BR-AP-005/006/007 | AC-6, AC-9 | |
| `accounting_period` | `end_date` | DATE | N | — | Flyway V{N+1} | BR-AP-005/006/007 | AC-6, AC-9 | `>= start_date` |
| `accounting_period` | `year` | INTEGER | N | — | Flyway V{N+1} | BR-AP-003a, data-model v10 | AC-4 | CHECK `year = EXTRACT(YEAR FROM start_date)`; YEAR row = user input, QUARTER/MONTH derive `parent.year` |
| `accounting_period` | `status` | VARCHAR(20) enum | N | `OPEN` | Flyway V{N+1} | BR-AP-001 | AC-7, AC-10 | Forced `OPEN` tại create |
| `accounting_period` | `display_order` | INTEGER | N | `0` | Flyway V{N+1} | BR-AP-005, BR-AP-009 | AC-7, AC-8 | Auto-gen children set theo thứ tự thời gian |
| `accounting_period` | `description` | VARCHAR(500) | Y | NULL | Flyway V{N+1} | BR-AP-005 | AC-7 | |
| `accounting_period` | `created_at/by, updated_at/by` | TIMESTAMP / VARCHAR(100) | Y | Spring Data auditing | Flyway V{N+1} | — | AC-10 | `@CreatedDate`/`@CreatedBy` etc |

> **Boundary migration policy** (rules-backend skill): Flyway V{N+1} additive cho gf-system/gf-hrms/gf-sales/gf-purchase/gf-inventory/gf-inventory-worker/gf-customer/gf-marketing/gf-notification/gf-erp-agent. `ddl-auto=update` cho gf-erp-mdm/**gf-accounting**/gf-shipment/gf-worker — boundary này thuộc nhóm `ddl-auto=update` (Gotcha #5). **Exception W04 (ADR-019 v5 Decision B)**: entity `accounting_period` mới dùng **Flyway thay vì ddl-auto** để đảm bảo constraint enforcement + audit trail đầy đủ; exception CHỈ áp dụng cho `accounting_period`, KHÔNG mở rộng sang các bảng khác của boundary mà không có CR mới.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `accounting_period` | `idx_ap_tenant_year` | `(tenant_id, year)` | btree | Filter năm (BR-AP-015, default current year) | data-model v10 |
| `accounting_period` | `idx_ap_tenant_status` | `(tenant_id, status)` | btree | Lock-check + display list | ADR-021 |
| `accounting_period` | `idx_ap_tenant_dates` | `(tenant_id, start_date, end_date)` | btree | Overlap check AC-9 (BR-AP-008) | — |
| `accounting_period` | `idx_ap_parent` | `(parent_id)` | btree | Parent lookup AC-5 + recursive tree traversal | ADR-009 |
| `accounting_period` | `idx_ap_tenant_name` | `(tenant_id, name)` | btree | LIKE search (FEAT-AP-LIST) | — |
| `accounting_period` | CHECK `end_date >= start_date` | — | CHECK | BR-AP-006 defensive | — |
| `accounting_period` | CHECK `year = EXTRACT(YEAR FROM start_date)` | — | CHECK | data-model v10 defensive consistency | — |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

> **NEED CONFIRMATION #1**: `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` §2.2.1 liệt kê path `POST /protected/accounting/v1/accounting-periods` (label "V4-AP-2"), nhưng chính PKG cũng ghi "REST endpoints — Architecture spec = SSOT: `Architecture/api/gf-accounting-api.md` §Accounting Period" — mà Architecture doc (§4.4, v15, `last_reviewed 2026-07-08`) dùng path **`POST /api/v2/accounting-periods`**. ADR-021 (lock-check) cũng dùng `/protected/v1/accounting-periods/lock-check` (không có segment "accounting"), khớp Architecture doc, không khớp PKG table. Spec này **dùng path theo Architecture doc** (`/api/v2/accounting-periods`) vì PKG tự nhận Architecture là SSOT — coi PKG table row là drift cần Delivery Authority sửa ở lần cập nhật PKG kế tiếp.

| Method | Path | Auth | Response | Idempotency | AC ref |
|---|---|---|---|---|---|
| POST | `/api/v2/accounting-periods` | authenticated (JWT, role `garage-owner`\|`accountant`) | 201 `AccountingPeriodCreateResponse` | KHÔNG yêu cầu Idempotency-Key — chống trùng qua BR-AP-008 overlap check | AC-2..AC-10, AC-12 |

**`AccountingPeriodCreateRequest` (body)**:

```json
{
  "name": "Năm 2027",
  "type": "YEAR",
  "parentId": null,
  "year": 2027,
  "startDate": "2027-01-01",
  "endDate": "2027-12-31",
  "status": "OPEN",
  "displayOrder": 0,
  "description": "Kỳ kế toán năm 2027",
  "autoGenerateChildren": true
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | YES | BR-AP-002 — bắt buộc, KHÔNG unique. ≤255 chars. |
| `type` | enum | YES | `YEAR \| QUARTER \| MONTH` (BR-AP-003). |
| `parentId` | BIGINT | YES nếu `type ≠ YEAR` (BR-AP-004) | Phải trỏ period cùng tenant, đúng type cha (YEAR cho QUARTER, QUARTER cho MONTH). NULL bắt buộc khi `type=YEAR`. |
| `year` | integer | YES | Bắt buộc cho `type=YEAR` (FE dropdown 50 giá trị — BR-AP-003a). QUARTER/MONTH: BE derive từ `parent.year` nếu absent. CHECK constraint `year = EXTRACT(YEAR FROM startDate)`. |
| `startDate`/`endDate` | DATE ISO `YYYY-MM-DD` | YES (BR-AP-005) | `endDate >= startDate` (BR-AP-006); ⊆ parent range, cho trùng biên (BR-AP-007). |
| `status` | enum | NO (forced `OPEN` — BR-AP-001) | Client input bị ignore, luôn `OPEN` tại create. |
| `displayOrder` | integer | NO (default `0`) | Sort hint (BR-AP-005). |
| `description` | string | NO | ≤500 chars. |
| `autoGenerateChildren` | boolean | NO (default `false`) | Chỉ hợp lệ `type=YEAR\|QUARTER` (BR-AP-009). YEAR→4 quý+12 tháng atomic; QUARTER→3 tháng atomic. Skip existing siblings. |

**Response 201**:

```json
{
  "data": {
    "createdPeriod": {
      "id": 2000,
      "code": "AP-YEAR-133-2027",
      "name": "Năm 2027",
      "type": "YEAR",
      "year": 2027,
      "status": "OPEN",
      "startDate": "2027-01-01",
      "endDate": "2027-12-31"
    },
    "generated": {
      "created": 16,
      "skipped": 0,
      "skippedDetails": []
    }
  },
  "code": "ACCOUNTING_PERIOD_CREATED"
}
```

**Validation errors**:

| Trigger | HTTP | Code |
|---|---|---|
| `name` blank | 400 | `ERR-CMN-validation` |
| `endDate < startDate` | 400 | `ERR-INV-021` (BR-AP-006) |
| Child range outside parent (BR-AP-007) | 400 | `ERR-INV-022` |
| Sibling overlap (BR-AP-008) | 400 | `ERR-INV-023` |
| `type=YEAR` + `parentId != null` hoặc `type=QUARTER/MONTH` + invalid parent type (BR-AP-003/004) | 400 | `ERR-INV-022` (reuse) |
| `autoGenerateChildren=true` + `type=MONTH` | 400 | `ERR-CMN-validation` (generic) |
| `year` mismatch với `startDate` (CHECK constraint) | 400 | `ERR-CMN-validation` (hoặc `ERR-AP-002` propose — OQ8) |
| `type=QUARTER/MONTH` + `year` mismatch với `parent.year` | 400 | `ERR-CMN-validation` (hoặc `ERR-AP-002` propose — OQ8) |

**Atomicity**: entire create + auto-generate trong single `@Transactional`; partial failure → rollback all. `SELECT FOR UPDATE` lock on `parent_id` row trước overlap check để chống race với concurrent POST.

### 6.2 Modified REST endpoints (additive)

N/A — feature này chỉ tạo endpoint mới, không modify existing.

### 6.3 Kafka topics (publish/consume)

N/A — FEAT-AP-CREATE không publish/consume Kafka event. Events `AccountingPeriodClosed`/`AccountingPeriodReopened` là PROPOSED (chưa ACTIVE) và thuộc scope `FEAT-AP-EDIT` (status transition), không phải CREATE.

### 6.4 Cross-boundary REST consumers

N/A tại CREATE — endpoint `GET /protected/v1/accounting-periods/lock-check` mà `gf-accounting` expose để `gf-inventory` consume (ADR-021) thuộc phạm vi chung của boundary AP nhưng KHÔNG được build/touch trong FEAT-AP-CREATE (đã tồn tại sẵn từ `EP v16`/ADR-021 baseline, không phải deliverable của feature này).

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-AP-CREATE.md`) sẽ wrap `POST /api/v2/accounting-periods` thành GraphQL mutation `[PROPOSED] createAccountingPeriod` (Product FEAT §4 API Reference gọi tên PROPOSED — BFF tier finalize naming). KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**` (Critical Rule #1 — boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-accounting/src/main/java/.../domain/model/AccountingPeriod.java` | NEW | new entity | ~90 | AC-2,3,4,6,7,9,10 |
| `domain/enums` | `.../domain/enums/AccountingPeriodType.java` | NEW | new enum (YEAR/QUARTER/MONTH) | ~10 | AC-2 |
| `domain/enums` | `.../domain/enums/AccountingPeriodStatus.java` | NEW | new enum (OPEN/CLOSED) | ~10 | AC-7 |
| `domain/repository` | `.../domain/repository/AccountingPeriodRepository.java` | NEW | new finders (overlap query, parent lookup) | ~25 | AC-5, AC-9 |
| `app/service` | `.../app/service/AccountingPeriodService.java` | NEW | create + auto-generate children logic | ~200 | AC-2..AC-10 |
| `app/service` | `.../app/service/AccountingPeriodValidator.java` | NEW | BR-AP-005/006/007/008/009 validate | ~90 | AC-4,5,6,9 |
| `app/service` | `.../app/service/AccountingPeriodCodeGenerator.java` | NEW | deterministic code `AP-{type}-{tenantId}-{slug}` | ~25 | AC-10 |
| `app/dto` | `.../app/dto/AccountingPeriodCreateRequest.java` | NEW | request DTO + `@Valid` | ~45 | AC-2..AC-9 |
| `app/dto` | `.../app/dto/AccountingPeriodCreateResponse.java` | NEW | response DTO (createdPeriod + generated) | ~40 | AC-8, AC-10 |
| `adapter/controller` | `.../adapter/controller/AccountingPeriodController.java` | NEW | new endpoint POST | ~40 | AC-10, AC-12 |
| `adapter/persistence` | `.../adapter/persistence/AccountingPeriodJpaRepository.java` | NEW | Spring Data JPA + custom overlap query | ~30 | AC-5, AC-9 |
| `test/unit` | `.../test/java/.../app/service/AccountingPeriodServiceTest.java` | NEW | new test methods | ~200 | AC-2..AC-10 |
| `test/contract` | `.../test/java/.../adapter/controller/AccountingPeriodControllerTest.java` | NEW | contract test | ~90 | AC-10, AC-12 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Entity + enums + Flyway V{N+1}__accounting_v1_accounting_period.sql (per ADR-019 v5 Decision B)
    Entry: KG/data-model §2ter.1 v10 stable (16 cols, year NOT NULL)
    Exit: entity annotated, local DB schema reflects table + 5 indexes + 2 CHECK constraints
    └─► S2

S2  Repository + Validator + Service (BR enforcement primary + auto-generate children)
    Entry: S1
    Exit: AccountingPeriodServiceTest ≥ 10 green (hierarchy, required fields, date range,
          overlap, year consistency, auto-generate atomic + skip-existing)
    └─► S3

S3  REST adapter (AccountingPeriodController)
    Entry: S2
    Exit: AccountingPeriodControllerTest contract green; HTTP 201/400/401/403 covered
    └─► S4

S4  Integration test
    Entry: S3
    Exit: integ test green (concurrent create race — SELECT FOR UPDATE, auto-generate 16-row tree)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Entity + enums + Flyway V{N+1} migration | domain | data-model §2ter.1 v10 stable + ADR-019 v5 | Flyway migration applied + local schema green | — |
| S2 | Repository + validator + service | domain + app | S1 | Unit test ≥ 10 green | S1 |
| S3 | REST adapter + DTO | adapter | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (path hint) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-AP-001` | CORNERSTONE | domain model (forced default) | `AccountingPeriod` constructor: `status = OPEN` | AC-7, AC-10 | `TC-BR-gf-accounting-AP-001-*` |
| `BR-AP-002` | NORMAL | request validation (@Valid, no unique check) | `AccountingPeriodCreateRequest.name` | AC-3 | `TC-BR-gf-accounting-AP-002-*` |
| `BR-AP-003` | CORNERSTONE | app/service (enum + hierarchy validate) | `AccountingPeriodValidator.validateHierarchy()` | AC-2, AC-5 | `TC-BR-gf-accounting-AP-003-*` |
| `BR-AP-003a` | NORMAL | request validation (plausible range) | `AccountingPeriodCreateRequest.year` | AC-4 | `TC-BR-gf-accounting-AP-003a-*` |
| `BR-AP-004` | CORNERSTONE | app/service | `AccountingPeriodValidator.validateParent()` | AC-4, AC-5 | `TC-BR-gf-accounting-AP-004-*` |
| `BR-AP-005` | NORMAL | request validation (@Valid) | `AccountingPeriodCreateRequest` | AC-3,4,6,7 | `TC-BR-gf-accounting-AP-005-*` |
| `BR-AP-006` | CORNERSTONE | app/service + DB CHECK | `AccountingPeriodValidator.validateDateRange()` | AC-9 | `TC-BR-gf-accounting-AP-006-*` |
| `BR-AP-007` | CORNERSTONE | app/service (parent range query) | `AccountingPeriodValidator.validateWithinParent()` | AC-9 | `TC-BR-gf-accounting-AP-007-*` |
| `BR-AP-008` | CORNERSTONE | app/service (overlap query + FOR UPDATE lock) | `AccountingPeriodValidator.validateNoOverlap()` | AC-9 | `TC-BR-gf-accounting-AP-008-*` |
| `BR-AP-009` | CORNERSTONE | app/service (transaction) | `AccountingPeriodService.autoGenerateChildren()` | AC-8 | `TC-BR-gf-accounting-AP-009-*` |
| `BR-AP-CMN-002` | NORMAL | adapter/controller (RBAC) | `AccountingPeriodController` security annotation | AC-12 | `TC-BR-gf-accounting-AP-CMN-002-*` |

> **Enforcement layer priority** (rules-backend): Primary phải ở `domain/` hoặc `app/service/` (SSOT). Secondary có thể ở DB CHECK constraint (defense-in-depth). UI/client-side enforcement → FE tier secondary (xem §11).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | Unit (enum) | test-api | type invalid → ERR-CMN-validation |
| AC-3 | Unit (required field) | test-api | name blank/null → ERR-CMN-validation; không check unique |
| AC-4 | Unit + Integration | test-api | year required cho YEAR; parentId required cho QUARTER/MONTH; year mismatch startDate |
| AC-5 | Unit + Integration | test-api | parentId not found → ERR-CMN-validation; type mismatch → ERR-INV-022 |
| AC-6 | Unit (required field) | test-api | startDate/endDate missing/parse fail |
| AC-7 | Unit | test-api | displayOrder default 0; status luôn OPEN bất kể input |
| AC-8 | Unit + Integration | test-api | autoGenerateChildren YEAR→16 rows; QUARTER→3 rows; skip existing overlap; type=MONTH reject |
| AC-9 | Unit | test-api | endDate<startDate → ERR-INV-021; outside parent → ERR-INV-022; sibling overlap → ERR-INV-023 |
| AC-10 | API contract | test-api | 201 response shape createdPeriod + generated |
| AC-12 | Isolation (RBAC) | test-isolation | garage-owner ✅; accountant ✅; unauthorized → 401/403 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-CREATE.md` | DRAFT-pending | Wrap `POST /api/v2/accounting-periods` → mutation `createAccountingPeriod` |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-CREATE.md` | DRAFT-pending | Form UI (radio loại kỳ, dropdown năm/thuộc kỳ) + BFF mutation consume |
| Mobile | — | N/A | AP module web-only per `Architecture/api/gf-accounting-api.md` §4 note ("Web GMS only per UX-FLOW-INVENTORY-ACCOUNTING-PERIOD") — không có tier file mobile cho FEAT-AP-CREATE |

**Source ID consistency** (item #18): tất cả tier file phải có cùng `source_feat_sha = fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c`.

## 12. References

- **Source**: [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) v6
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.1 (BR-AP-001..016, BR-AP-003a, BR-AP-CMN-001/002)
- **ADR**: [`ADR-009`](../../../../../Architecture/decisions/ADR-009-jpa-no-relationship-mapping.md) (JPA no-relationship), [`ADR-019`](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md) (AP boundary + schema strategy), [`ADR-021`](../../../../../Architecture/decisions/ADR-021-ob-lock-check-integration.md) (lock-check advisory — reference only, không build tại FEAT này)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md) — **NEED CONFIRMATION #2**: bundle §G báo "HLD không có section match keyword `Create`" — flag arch-author follow-up khi review W04 (cross-ref data-model v10 changelog "HLD column count 15→16 nếu HLD liệt kê chi tiết").
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.4 (v15)
- **Data model**: [`Architecture/data/gf-accounting-data-model.md`](../../../../../Architecture/data/gf-accounting-data-model.md) §2ter.1 (v10)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md) §2.2.1 — **path row có drift, xem NEED CONFIRMATION #1 ở §6.1**
- **Fan-out map**: `Execution/wave-specs/W04/_routing/FEAT-FAN-OUT-MAP.yaml`

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-AP-CREATE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ 3-5 dòng, §2 trách nhiệm BE (`ddl-auto=update` entity mới — **SUPERSEDED bởi v2 Flyway per ADR-019 v5**, POST endpoint, BR-AP primary, code auto-derive, FOR UPDATE lock), §3 BE behaviour map 12 AC (10 covered + AC-1/AC-11 N/A UI-only), §4 ràng buộc + error code mapping (ERR-INV-021/022/023 + ERR-CMN-validation + placeholder ERR-AP-002 OQ8), §5 schema `accounting_period` 16 cột + 5 index + 2 CHECK constraint (ddl-auto=update, KHÔNG Flyway per Gotcha #5 — **SUPERSEDED v2**), §6 REST `POST /api/v2/accounting-periods` (path theo Architecture doc SSOT — xem NEED CONFIRMATION #1 re: PKG table drift), §7 Hexagonal file map, §8 DAG S1-S4, §9 BR SSOT table 11 rule, §10 test hand-off, §11 cross-tier (mobile N/A — web-only feature). NEED CONFIRMATION: #1 endpoint path PKG vs Architecture doc mismatch (resolved dùng Architecture doc, flagged cho Delivery Authority fix PKG); #2 HLD thiếu section Accounting Period Create chi tiết. |
| 2026-07-08 | 2 | Delivery Authority (main agent — manual cascade) | **Cascade ADR-019 v5 Decision B — Flyway migration override**. Sau khi ADR-019 v4→v5 bump 2026-07-08 09:34 UTC (Decision B: `V{N+1}__accounting_v1_accounting_period.sql` Flyway thay ddl-auto=update per NC-W04-EP-AP-002 v3 user quannn override), wave-spec FEAT-AP-CREATE v1 auto-gen bởi `/gen-execution-spec` @04:51 UTC KHÔNG catch được override (author agent áp Gotcha #5 default). Manual cascade edit (author retention, main agent) update: (a) §2 line 76 narrative — Flyway V{N+1} additive rationale (CHECK year + adjacency-list FK cần idempotent + audit trail); (b) §5.1 header narrative — bỏ "ddl-auto=update KHÔNG Flyway" → "Flyway V{N+1} per ADR-019 v5"; (c) §5.1 table 13 rows `Migration strategy` column: `ddl-auto=update` → `Flyway V{N+1}`; (d) §5.1 boundary migration policy note — add Exception W04 rider (`accounting_period` là exception theo ADR-019 v5, 5 baseline + 3 insurance vẫn ddl-auto); (e) §8 DAG S1 narrative + §8.3 S1 table row — thêm Flyway migration step; (f) v1 change log entries annotated SUPERSEDED. **KHÔNG đụng**: §3-§7 AC map + BR/AC/Hex file map (không đổi vì migration là schema-only), §9-§12 test/BR/cross-tier. Reason bypass `/gen-execution-spec --force`: (1) chain dep GAP-01 CHARTER §7 #8 Flyway ban chưa cascade (Architecture Authority action pending) → agent regen sẽ áp CHARTER default = ddl-auto, no-op; (2) manual edit deterministic + fast (~10 min) vs 2-agent pipeline uncertain (~30-60 min). Follow-up: GAP-01 CHARTER v4→v5 bump Architecture + Business Authority CR MODERATE (draft prepared main agent session 03297f5f). |
