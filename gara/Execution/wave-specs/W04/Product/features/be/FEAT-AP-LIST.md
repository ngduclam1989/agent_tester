---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-LIST.md"
source_version: 8
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-LIST"
source_feat_sha: "a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage mở tab Kỳ kế toán → BE trả cây kỳ Năm→Quý→Tháng của năm hiện tại (sort theo Thứ tự hiển thị), lọc theo năm khác hoặc tìm theo tên → BE trả cây con khớp kèm ancestor path, tenant-scoped."
consumes_contracts: []
paired_bff_feats: ["FEAT-AP-LIST"]
paired_fe_web_feats: ["FEAT-AP-LIST"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — not supplied by orchestrator context bundle"
  template_sha: "N/A — not supplied by orchestrator context bundle"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-LIST.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-LIST (BE): Danh sách kỳ kế toán

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

> **⚠️ Migration cascade note (2026-07-08)**: Entity `accounting_period` được tạo qua **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** bởi `FEAT-AP-CREATE` v2 per **ADR-019 v5 Decision B**. Reference `ddl-auto=update` trong file này là **STALE từ v1 auto-gen** (regen `/gen-execution-spec --force` pending sau khi GAP-01 CHARTER cascade). Dùng `FEAT-AP-CREATE` §5.1 v2 làm canonical cho migration strategy. Feature này KHÔNG tạo migration schema mới.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-LIST` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Chủ garage mở tab Kỳ kế toán → BE trả cây kỳ Năm→Quý→Tháng của năm hiện tại (sort theo Thứ tự hiển thị), lọc theo năm khác hoặc tìm theo tên → BE trả cây con khớp kèm ancestor path, tenant-scoped. |
| Cross-tier pair | BFF: `FEAT-AP-LIST` \| Web: `FEAT-AP-LIST` \| Mobile: — (web-only, xem §0) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) |
| Source version | v8 |
| Source SHA | `a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf` |
| Generated at | 2026-07-08T04:51:55+00:00 |
| Note phạm vi | AP là **web-only** (UX-FLOW-INVENTORY-ACCOUNTING-PERIOD không có mobile flow) — không có `paired_mobile_feats`. |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần một danh mục **kỳ kế toán** phân cấp (Năm → Quý → Tháng) để làm mốc kiểm soát đóng/mở sổ kho, tính giá xuất kho cuối kỳ (BQGQ) và báo cáo tồn/NXT. Màn danh sách là điểm tra cứu nhanh — xem toàn bộ cây kỳ của một năm, biết kỳ nào đang mở/đã đóng, tìm theo tên và điều hướng sang xem/sửa/xóa/tạo mới. Đây là bước khởi đầu của luồng "khởi tạo kho" trong wave W04, tiền đề cho import tồn đầu kỳ và các nghiệp vụ nhập/xuất kho sau này.

## 2. Trách nhiệm backend (`gf-accounting`)

- Cung cấp entity mới `accounting_period` (adjacency-list 3 cấp, scalar self-FK `parent_id` per ADR-009) làm nguồn dữ liệu đọc cho màn danh sách — entity này được tạo bởi `FEAT-AP-CREATE`, tier LIST chỉ đọc.
- Expose 2 REST endpoint đọc: `POST /api/v2/accounting-periods/search` (paged flat, dùng cho các picker "Thuộc kỳ" tái sử dụng ở FEAT khác) và `POST /api/v2/accounting-periods/tree` (cây phân cấp — endpoint chính cho màn danh sách AP-LIST).
- Enforce tenant isolation trên mọi query (BR-AP-015) — không rò rỉ dữ liệu kỳ của tenant khác.
- Enforce sort ổn định theo `display_order ASC` trong phạm vi từng kỳ cha (BR-AP-015 + AC-6b), và name-search unaccent case-insensitive (idx_ap_tenant_name).
- Bảo vệ kích thước response cây (size cap 500 kỳ/tenant) để tránh payload phình to — trả `HTTP 413` plain (không mã lỗi registry), BFF dịch sang lỗi user-facing.
- Không publish/consume Kafka event cho luồng đọc này (read-only, N/A outbox/inbox).
- Migration: schema `accounting_period` sinh qua `ddl-auto=update` (Gotcha #5, ADR-006 exception cho `gf-accounting`) — **không** dùng Flyway; tier LIST không tạo bảng (đã có từ FEAT-AP-CREATE) nhưng cần khai báo đúng index phục vụ query đọc.

## 3. Hành vi cần triển khai (BE behaviour map)

> Coverage: 11/11 source AC-ID (AC-1, AC-2, AC-3, AC-4, AC-4b, AC-5, AC-6, AC-6b, AC-7, AC-8, AC-9).

### Cluster A — Truy vấn & hiển thị cây

#### AC-1 → Trả cây kỳ mặc định khi mở màn hình

- **Khi**: FE gọi `POST /api/v2/accounting-periods/tree` lúc mount màn hình, không truyền `name` (rỗng) và không truyền `year` (hoặc truyền năm hiện tại).
- **BE phải**: mặc định `year = currentYear` (theo timezone hệ thống), trả toàn bộ cây kỳ (root YEAR + children QUARTER/MONTH) thuộc tenant hiện tại cho năm đó — đủ dữ liệu để FE dựng header + bảng ngay lần render đầu.
- **Output**: `{ data: { periods: [...], summary: { total } } }`.
- **Failure mode**: N/A (không có input để fail ở default call).
- **Ref**: BR-AP-015 (§9), entity `accounting_period` (§5.1), endpoint `POST /api/v2/accounting-periods/tree` (§6.1).

#### AC-2 → Trả đủ field cho 6 cột hiển thị

- **Khi**: FE render bảng từ response tree.
- **BE phải**: mỗi node trả `id, code, name, type, parentId, startDate, endDate, status, displayOrder, description, createdAt/By, updatedAt/By` — đủ cho cột "Tên kỳ kế toán" (`name`), "Loại kỳ kế toán" (`type`), "Ngày bắt đầu" (`startDate`), "Ngày kết thúc" (`endDate`), "Trạng thái" (`status`). Cột "Thao tác" là client-render (icon Xem/Sửa/Xóa), BE không trả field riêng.
- **Output**: node schema §6.1 tree response.
- **Failure mode**: N/A (read-only mapping).
- **Ref**: entity `accounting_period` §5.1, endpoint `POST /api/v2/accounting-periods/tree` §6.1.

#### AC-3 → Trả cấu trúc cây nested đúng phân cấp

- **Khi**: FE cần hiển thị kỳ quý thụt dưới kỳ năm, kỳ tháng thụt dưới kỳ quý, có expand/collapse.
- **BE phải**: query recursive (CTE trên `parent_id`, tận dụng `idx_ap_parent`) dựng `children[]` nested đúng 3 cấp YEAR→QUARTER→MONTH (BR-AP-003), tenant-scoped ở **mọi level** (đề phòng rò rỉ cross-tenant khi tự-join).
- **Output**: `periods[]` nested với `children[]` mỗi node.
- **Failure mode**: `HTTP 413` (không mã lỗi registry) nếu `summary.total > 500` per tenant — tránh payload quá lớn (BFF dịch sang `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE`, xem §6.1 note).
- **Ref**: BR-AP-003 (§9), entity `accounting_period.parent_id` (§5.1), endpoint `POST /api/v2/accounting-periods/tree` (§6.1).

#### AC-4 → Trả trạng thái `status` chính xác cho badge

- **Khi**: FE render badge màu theo cột "Trạng thái".
- **BE phải**: trả field `status` đúng enum `OPEN | CLOSED` (BR-AP-010). BE **không** quyết định màu badge/text hiển thị — đó là FE tier (xem `fe-web/FEAT-AP-LIST.md §3 AC-4`).
- **Output**: `status: "OPEN" | "CLOSED"` trên mỗi node.
- **Failure mode**: N/A.
- **Ref**: BR-AP-010 (§9), entity `accounting_period.status` (§5.1).

#### AC-4b → Trả payload rỗng hợp lệ khi tenant chưa có kỳ nào

- **Khi**: tenant hiện tại chưa có record `accounting_period` nào.
- **BE phải**: trả `HTTP 200` với `{ data: { periods: [], summary: { total: 0 } } }` — **không** phải lỗi, không mã lỗi. FE tự render empty-state icon + text "Không có dữ liệu" dựa trên `periods.length === 0`.
- **Output**: `periods: []`, `summary.total: 0`.
- **Failure mode**: N/A (đây là trường hợp hợp lệ, không phải failure).
- **Ref**: entity `accounting_period` (§5.1), endpoint `POST /api/v2/accounting-periods/tree` (§6.1).

### Cluster B — Tìm kiếm & lọc

#### AC-5 → Tìm kiếm theo tên (LIKE unaccent)

- **Khi**: FE gọi tree endpoint với `name` khác rỗng.
- **BE phải**: match `WHERE LOWER(unaccent(name)) LIKE LOWER(unaccent(:name)) || '%'` (case-insensitive, bỏ dấu tiếng Việt) trên cột `accounting_period.name`, tận dụng `idx_ap_tenant_name`; kết quả giữ **matching node + full ancestor path** (để cây hợp lệ từ root YEAR xuống) **+ full descendant subtree** của node match (UX search-expand). Khi `name` + `year` cùng truyền, ancestor path phải nằm trong root YEAR khớp `year`.
- **Output**: `periods[]` đã filter theo pattern trên, giữ nguyên structure nested.
- **Failure mode**: `name` > 255 ký tự → `400 ERR-CMN-validation`. Không match dòng nào → `periods: []` (EC-1, phân biệt AC-4b bởi việc `name`/`year` khác default — FE tự phân biệt qua state filter, BE trả cùng shape rỗng).
- **Ref**: BR-AP-015 (§9), index `idx_ap_tenant_name` (§5.2), endpoint `POST /api/v2/accounting-periods/tree` (§6.1).

#### AC-6 → Lọc theo năm, mặc định năm hiện tại, dropdown năm DESC

- **Khi**: (a) mở màn hình lần đầu — không truyền `year`; (b) user chọn năm khác trong dropdown.
- **BE phải**: (a) mặc định `year = currentYear` khi field bị bỏ trống; (b) khi `year` truyền, filter root YEAR period đúng năm đó (BR-AP-015).
- **NEED CONFIRMATION (gap SSOT)**: `Architecture/api/gf-accounting-api.md` v15 §4.1/§4.2 **chưa có** cơ chế trả "danh sách các năm đã tồn tại trong garage" (dropdown liệt kê năm DESC theo AC-6 đoạn 2) — cả 2 endpoint hiện có (`search`, `tree`) chỉ nhận `year` làm filter, không trả `availableYears`. BE cần bổ sung field `availableYears: [int]` (distinct `year` của root YEAR period theo tenant, DISTINCT + ORDER BY year DESC) vào response `tree`, hoặc endpoint riêng — flag cho Architecture Authority quyết định trước khi impl AC-6 đoạn dropdown. Impl AC-6 đoạn filter chính (mặc định năm hiện tại + lọc theo năm chọn) **không** bị block bởi gap này.
- **Output**: `periods[]` scoped theo `year`.
- **Failure mode**: `year` ngoài range 2000–2100 (defensive) → `400 ERR-CMN-validation`.
- **Ref**: BR-AP-015 (§9), index `idx_ap_tenant_year` (§5.2), endpoint `POST /api/v2/accounting-periods/tree` (§6.1).

#### AC-6b → Sort mặc định `display_order ASC` trong phạm vi từng kỳ cha

- **Khi**: response tree được dựng.
- **BE phải**: `ORDER BY display_order ASC` tại **mọi cấp** — root YEAR (trong tập kết quả theo AC-6), QUARTER trong phạm vi năm, MONTH trong phạm vi quý (recursive CTE `ORDER BY parent_id, display_order`). Field `displayOrder` **không** cần ẩn khỏi response (chỉ là FE không render thành cột — display concern, không phải BE concern).
- **Output**: `children[]` đã sort theo `display_order ASC` tại từng level.
- **Failure mode**: N/A.
- **Ref**: BR-AP-005 (§9), entity `accounting_period.display_order` (§5.1).

### Cluster C — Thao tác điều hướng (client-only)

#### AC-7 → N/A (client navigation)

- Icon Xem/Sửa/Xóa là điều hướng client-side sang `FEAT-AP-DETAIL` / `FEAT-AP-EDIT` / `FEAT-AP-DELETE`. BE của LIST không expose endpoint riêng — mỗi FEAT đích có BE contract riêng (xem `Architecture/api/gf-accounting-api.md` §4.3/§4.5/§4.6). Xem `fe-web/FEAT-AP-LIST.md §3 AC-7`.

#### AC-8 → N/A (client navigation)

- Nút "Thêm kỳ kế toán" mở form `FEAT-AP-CREATE` (client-side). BE contract riêng ở `POST /api/v2/accounting-periods` (§4.4 API doc), out of scope tier LIST. Xem `fe-web/FEAT-AP-LIST.md §3 AC-8`.

### Cluster D — Phân quyền & tenant

#### AC-9 → Enforce tenant scope + phân quyền ngang nhau

- **Khi**: mọi request tới `search`/`tree` endpoint.
- **BE phải**: resolve tenant từ security context (`SecurityUtils.getCurrentTenantIdAsLong()`), scope **mọi cấp** của recursive CTE theo `tenant_id` (đề phòng rò rỉ cross-tenant khi self-join `parent_id`); **không** phân biệt role `garage-owner` vs `accountant` — cả hai đọc/thao tác quyền ngang nhau (BR-AP-CMN-002), chỉ cần `authenticated`.
- **Output**: dữ liệu chỉ scope tenant hiện tại; không có role check bổ sung ngoài `authenticated`.
- **Failure mode**: N/A (không resolve được tenant → lỗi chuẩn framework, không phải AP-specific).
- **Ref**: BR-AP-015 (§9), BR-AP-CMN-002 (§9), Critical Rule #4 (Tenant isolation).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary cho phần đọc)

- **BR-AP-015** (CORNERSTONE — Tenant Isolation / Search): danh mục kỳ kế toán luôn scope theo garage/tenant hiện tại; search LIKE trên tên; filter theo năm (mặc định năm hiện tại) — enforce tại `app/service` (query layer) + repository (index-backed). Vi phạm scope → không trả dữ liệu (không phải error code, silent filter).
- **BR-AP-003** (CORNERSTONE — Hierarchy): cấu trúc 3 cấp cố định YEAR→QUARTER→MONTH — enforce write-side tại `FEAT-AP-CREATE`; LIST tier chỉ cần đọc đúng cấu trúc (recursive CTE theo `parent_id`), không tự suy diễn cấp từ dữ liệu.
- **BR-AP-010** (NORMAL — Status): 2 giá trị `OPEN`/`CLOSED` — enforce tại entity enum mapping, LIST chỉ trả nguyên giá trị.
- **BR-AP-CMN-002** (NORMAL — Permission): `garage-owner` và `accountant` quyền ngang nhau trên toàn bộ danh mục kỳ kế toán — enforce ở endpoint auth annotation (`authenticated`, không thêm role guard).

### 4.2 Tenant + auth

- Mọi endpoint (`search`, `tree`) propagate `X-Tenant-Id`/security context qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` khi có event (N/A cho LIST — read-only, không publish event).
- Cả 2 endpoint yêu cầu `authenticated` (JWT qua BFF `agg-garage-graph`), không yêu cầu role riêng — `garage-owner` và `accountant` truy cập ngang nhau.

### 4.3 Idempotency + concurrency

- `POST /search` và `POST /tree` là **read-only, safe/idempotent** dù dùng verb POST (composite filter body, không side-effect) — không cần `Idempotency-Key`.
- Không có optimistic locking cần thiết (không write).
- Client-side cache hợp lý cho filter ổn định; FE tự invalidate khi user tạo/sửa/xóa kỳ (thuộc FE tier).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-5 (`name` > 255 ký tự), AC-6 (`year` ngoài range 2000–2100) | TOAST |
| _(no code)_ plain `HTTP 413` | 413 | AC-1, AC-3 (`summary.total > 500` per tenant) | BFF dịch `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` → TOAST/EMPTY_STATE |

---

## 5. Schema delta (BE — contract focus)

> Entity `accounting_period` là **NEW** — được tạo bởi `FEAT-AP-CREATE` (shared toàn bộ 5 FEAT-AP-*). Tier LIST chỉ đọc; liệt kê đủ cột + index cần thiết cho query đọc.

### 5.1 Entity — `gf-accounting` (`accounting_period`, đọc bởi LIST)

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `accounting_period` | `id` | `BIGINT` | N | identity | ddl-auto=update | — | AC-2 | PK. |
| `accounting_period` | `tenant_id` | `BIGINT` | N | — | ddl-auto=update | BR-AP-015 | AC-9 | Tenant scope. |
| `accounting_period` | `code` | `VARCHAR(50)` | Y | auto-derived | ddl-auto=update | BR-AP-002 | AC-2 | `AP-{type}-{tenantId}-{slug}`, không user-facing. |
| `accounting_period` | `name` | `VARCHAR(255)` | N | — | ddl-auto=update | BR-AP-002, BR-AP-015 | AC-2, AC-5 | LIKE search target. |
| `accounting_period` | `type` | `VARCHAR(20)` | N | — | ddl-auto=update | BR-AP-003 | AC-2, AC-3 | `YEAR|QUARTER|MONTH`. |
| `accounting_period` | `parent_id` | `BIGINT` | Y (NULL cho YEAR) | — | ddl-auto=update | BR-AP-003, BR-AP-004 | AC-3 | Scalar self-FK (ADR-009), không physical FK. |
| `accounting_period` | `start_date` / `end_date` | `DATE` | N | — | ddl-auto=update | BR-AP-006, BR-AP-007 | AC-2 | Inclusive range. |
| `accounting_period` | `year` | `INTEGER` | N | — | ddl-auto=update | BR-AP-015 | AC-6 | v10 (2026-07-08) — persisted mọi row, YEAR từ input, QUARTER/MONTH derive parent chain. |
| `accounting_period` | `status` | `VARCHAR(20)` | N | `OPEN` | ddl-auto=update | BR-AP-010, BR-AP-011 | AC-4 | `OPEN|CLOSED`. |
| `accounting_period` | `display_order` | `INTEGER` | N | `0` | ddl-auto=update | BR-AP-005 | AC-6b | Sort key ngầm (không hiển thị cột). |
| `accounting_period` | `description` | `VARCHAR(500)` | Y | — | ddl-auto=update | BR-AP-005 | AC-2 | — |
| `accounting_period` | `created_at/by`, `updated_at/by` | `TIMESTAMP`/`VARCHAR(100)` | Y | Spring auditing | ddl-auto=update | — | AC-2 | — |

> **Boundary migration policy**: `gf-accounting` dùng `ddl-auto=update` (không Flyway — Gotcha #5). Tier LIST **không** tạo/sửa cột — bảng đã tồn tại từ `FEAT-AP-CREATE`, LIST chỉ khai báo/tận dụng index đọc (§5.2).

### 5.2 Index / constraint changes (đã declare bởi FEAT-AP-CREATE, LIST phụ thuộc để đọc)

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `accounting_period` | `idx_ap_tenant_year` | `(tenant_id, year)` | btree | Support filter theo năm (AC-6, BR-AP-015) | ADR-019 |
| `accounting_period` | `idx_ap_tenant_status` | `(tenant_id, status)` | btree | Support display + future lock-check scan | ADR-019 |
| `accounting_period` | `idx_ap_tenant_dates` | `(tenant_id, start_date, end_date)` | btree | Support overlap check + lock-check (out of LIST scope) | ADR-019 |
| `accounting_period` | `idx_ap_parent` | `(parent_id)` | btree | Support recursive CTE tree traversal (AC-3) | ADR-019 |
| `accounting_period` | `idx_ap_tenant_name` | `(tenant_id, name)` | btree | Support LIKE search (AC-5, BR-AP-015) | ADR-019 |

## 6. API contract delta (BE — REST)

### 6.1 REST endpoints tiêu thụ bởi FEAT-AP-LIST — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/accounting-periods/search` | authenticated | `{ name?, year?, types?[], statuses?[], page?, size?, sort? }` | `{ data: { content: [...], pageable: {page,size,total} } }` | safe (read) | AC-5, AC-6 (dùng khi cần dạng flat paged, vd picker "Thuộc kỳ" tái dùng ở FEAT khác) | — |
| POST | `/api/v2/accounting-periods/tree` | authenticated | `{ year?, name? }` | `{ data: { periods: [ {..., children:[]} ], summary: {total} } }` | safe (read) | AC-1, AC-2, AC-3, AC-4, AC-4b, AC-5, AC-6, AC-6b | — |

> **Size cap**: `tree` reject với plain `HTTP 413` (không mã lỗi registry) nếu `summary.total > 500` per tenant (PL5 + ADR-019 R2 F2 fix — tránh resurrect deprecated `ERR-INV-027`). BFF dịch sang `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE`.
>
> **`year` dropdown gap**: xem NEED CONFIRMATION ở §3 AC-6 — hiện chưa có field `availableYears` trong response `tree`/`search`. Đề xuất: extend response `tree` thêm `availableYears: [int]` (DISTINCT `year` của root YEAR theo tenant, ORDER BY DESC) — cần Architecture Authority ratify trước khi impl phần dropdown.

### 6.2 Modified REST endpoints (additive)

- N/A — cả 2 endpoint `search` và `tree` là **net-new** (DESIGN — ADR-019), không modify baseline API `/api/v1/*` hiện hữu.

### 6.3 Kafka topics (publish/consume)

- N/A — LIST là read-only, không publish/consume event.

### 6.4 Cross-boundary REST consumers

- N/A — LIST tier không expose endpoint cho boundary khác tiêu thụ (endpoint `lock-check` cross-boundary thuộc phạm vi chung của AP, không riêng LIST — xem `Architecture/api/gf-accounting-api.md §4.7`).

> **Hand-off tới BFF**: `agg-garage-graph` (`features/bff/FEAT-AP-LIST.md`) wrap 2 endpoint trên thành GraphQL query (vd `accountingPeriodTree`, `accountingPeriodSearch`). KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**`. Entity/repository phần lớn đã tồn tại từ `FEAT-AP-CREATE` — LIST chỉ thêm query method + controller endpoint đọc.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/AccountingPeriod.java` | REUSE (đã tạo bởi FEAT-AP-CREATE) | reuse | 0 | AC-2 |
| `domain/repository` | `src/main/java/.../domain/repository/AccountingPeriodRepository.java` | ADDITIVE | new finder (searchByFilters, findTreeByYearAndName recursive CTE) | ~40 | AC-1, AC-3, AC-5, AC-6 |
| `app/service` | `src/main/java/.../app/service/AccountingPeriodQueryService.java` | NEW | new service (build tree, apply sort, size cap) | ~90 | AC-1, AC-3, AC-4b, AC-6b |
| `adapter/controller` | `src/main/java/.../adapter/controller/AccountingPeriodController.java` | ADDITIVE (2 method mới trên controller đã có từ CREATE) | new endpoint | ~40 | AC-1, AC-5, AC-6 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/AccountingPeriodJpaRepository.java` | ADDITIVE | native recursive CTE query + Specification LIKE | ~50 | AC-3, AC-5 |
| `db/migration` | N/A (ddl-auto=update, không Flyway — Gotcha #5) | — | — | 0 | — |
| `test/unit` | `src/test/java/.../app/service/AccountingPeriodQueryServiceTest.java` | ADDITIVE | new test methods (tree build, sort, size cap, empty state) | ~120 | AC-1–AC-6b, AC-9 |
| `test/contract` | `src/test/java/.../adapter/controller/AccountingPeriodControllerContractTest.java` | ADDITIVE | contract test (search + tree) | ~60 | AC-1, AC-5, AC-6 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Entity/schema đã tồn tại (từ FEAT-AP-CREATE)
    Entry: FEAT-AP-CREATE deployed local (entity + index)
    Exit: schema có sẵn, index 5 cái đã tồn tại
    └─► S2

S2  Repository + Service logic đọc (tree build, sort, name search, year filter)
    Entry: S1
    Exit: unit test ≥8 green (tree nesting, sort ASC per parent, LIKE unaccent, empty state, size cap 413)
    └─► S3

S3  REST adapter (controller — 2 endpoint search/tree)
    Entry: S2
    Exit: contract test green (200/400/413)
    └─► S4

S4  Integration test (tenant isolation defensive-check ở mọi level CTE)
    Entry: S3
    Exit: integ test green (cross-tenant leak test negative)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Xác nhận schema `accounting_period` + 5 index sẵn sàng | db (ddl-auto) | FEAT-AP-CREATE deployed | Schema verify local | — |
| S2 | Query service (tree build + sort + search) | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter (`search`, `tree`) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test (tenant isolation) | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR, phần đọc)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-AP-015` | CORNERSTONE | app/service (primary) + repository (index-backed) | `app/service/AccountingPeriodQueryService.java` | AC-1, AC-5, AC-6, AC-9 | `TC-BR-gf-accounting-AP-015-*` |
| `BR-AP-003` | CORNERSTONE | domain (read-consistency; write primary ở FEAT-AP-CREATE) | `domain/repository/AccountingPeriodRepository.java` (recursive CTE) | AC-3 | `TC-BR-gf-accounting-AP-003-*` |
| `BR-AP-010` | NORMAL | domain (enum mapping) | `domain/model/AccountingPeriod.java` | AC-4 | `TC-BR-gf-accounting-AP-010-*` |
| `BR-AP-005` | NORMAL | app/service (sort) | `app/service/AccountingPeriodQueryService.java::buildTree()` | AC-6b | `TC-BR-gf-accounting-AP-005-*` |
| `BR-AP-CMN-002` | NORMAL | adapter/controller (auth annotation) | `adapter/controller/AccountingPeriodController.java` | AC-9 | `TC-BR-gf-accounting-AP-CMN-002-*` |

> **Enforcement layer priority**: Primary phải ở `domain/` hoặc `app/service/` (SSOT). LIST tier là read path — enforcement chính là **tenant/scope correctness** + **sort correctness**, không có write-side BR (BR-AP-003 write-enforcement thuộc FEAT-AP-CREATE).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract | test-api | default call (không param) trả cây năm hiện tại |
| AC-3 | Unit (recursive build) + API contract | test-api | verify nesting đúng 3 cấp, size cap 413 khi >500 |
| AC-4b | API contract | test-api | tenant rỗng → `periods: []`, `total: 0`, HTTP 200 |
| AC-5 | Unit (LIKE unaccent) + API contract | test-api | tìm có dấu / không dấu, ancestor path + subtree giữ nguyên |
| AC-6 | API contract | test-api | default year = current; chọn năm khác → filter đúng |
| AC-6b | Unit (sort) | test-api | display_order ASC per parent scope, mọi level |
| AC-9 | Isolation (RBAC) | test-isolation | dual persona ngang quyền + cross-tenant negative test |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-LIST.md` | PENDING (chưa gen tại thời điểm authoring BE tier) | Resolver wrap `search`/`tree` (§6.1) thành GraphQL query |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-LIST.md` | PENDING (chưa gen tại thời điểm authoring BE tier) | UI consume BFF ops, render tree + badge + search/filter |
| Mobile | — | N/A (AP web-only, xem `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`) | Không có mobile touchpoint cho AP |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf`.

## 12. References

- **Source**: [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) v8
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.1 (BR-AP-001..016, BR-AP-CMN-001/002)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md) §10 (Accounting Period)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.1–§4.2 (v15)
- **Data model**: [`Architecture/data/gf-accounting-data-model.md`](../../../../../Architecture/data/gf-accounting-data-model.md) §2ter.1 (v10)
- **ADR**: [`ADR-019-accounting-period-on-gf-accounting.md`](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md), [`ADR-009`](../../../../../Architecture/decisions/ADR-009-no-jpa-relationship-mapping.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 (chưa có entity `accounting_period` — sync post-code)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-AP-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map cover 11/11 AC (AC-1..AC-9 + AC-4b + AC-6b), §4 ràng buộc + error code, §5-§11 BE-specific (schema `accounting_period` v10 read-path/2 REST endpoint search+tree v15/Hexagonal/sequence/BR primary phần đọc/test/cross-tier pair). Flag NEED CONFIRMATION: gap SSOT `availableYears` cho dropdown năm AC-6 (chưa có trong API doc v15). Source FEAT chỉ audit. |
