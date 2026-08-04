---
type: execution-spec
artifact_kind: business-rule
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md"
source_version: 27
source_sha: "NOT-COMPUTED — no SHA256 tool available trong agent session này (xem §7 OI-W04-BR-001)"
generated_at: "2026-07-08T00:00:00Z"
boundary: "gf-accounting"
applies_to_feats:
  - FEAT-AP-LIST
  - FEAT-AP-CREATE
  - FEAT-AP-DETAIL
  - FEAT-AP-EDIT
  - FEAT-AP-DELETE
  - FEAT-OB-IMPORT
  - FEAT-OB-EDIT
  - FEAT-OB-DELETE-LINES
parent_pkg: "PKG-W04-inventory-period-opening-balance"
---

# BR-GF-INVENTORY-ACCOUNTING-PERIOD — Wave W04 Scoped Spec

> **Phạm vi**: Nhóm rule **Kỳ kế toán (BR-AP-\*)** + **CB-AP-001** + **BR-AP-CMN-\*** — phục vụ 5 FEAT-AP-\* (boundary `gf-accounting`, master) + enforcement cross-boundary "khóa kỳ" tiêu thụ bởi 3 FEAT-OB-\* write-path (boundary `gf-inventory`, qua REST advisory ADR-021).
> Rule text §1 là **VERBATIM copy** (filtered) từ nguồn canonical (v27, xem SHA note ở §7). Policy `mode=business-rule` §2 modes-extra.
> **KHÔNG bao gồm** nhóm **Tính giá xuất kho (BR-PRC-\*)** — 12 rule PRC (`BR-PRC-001..017`) thuộc `FEAT-PRC-*`, ngoài phạm vi W04 (deferred W06 per PKG-W04 §2.3 "Tính giá BQGQ + báo cáo (W06)"). Rule PRC KHÔNG được filter/verbatim-copy ở file này — xem lại nguồn canonical khi W06 mở.
> Boundary primary: `gf-accounting` (AP master — EP v16 boundary move 2026-07-07). Boundary consumer cross-boundary: `gf-inventory` (OB write-path lock-check, ADR-021).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` |
| Source version | 27 |
| Source SHA | NOT COMPUTED — xem §7 OI-W04-BR-001 (agent session không có tool hash; orchestrator cần backfill qua `sha256sum`) |
| Generated at | 2026-07-08T00:00:00Z |
| PKG | `PKG-W04-inventory-period-opening-balance` (v9) |
| Boundary primary | `gf-accounting` |
| Boundary consumer (cross-boundary) | `gf-inventory` (3 FEAT-OB-\* write-path qua ADR-021) |

---

## §1 Rule Statements (VERBATIM — filtered W04 scope: Kỳ kế toán + Cross-boundary + Audit/Phân quyền)

> Filter theo modes-extra §2 bullet 2: chỉ giữ rule áp dụng cho FEAT trong wave (5 FEAT-AP-\* + cross-boundary consumption bởi 3 FEAT-OB-\*). Loại bỏ toàn bộ §2.2 Tính giá xuất kho (BR-PRC-001..017, Features=FEAT-PRC-\*) vì FEAT-PRC-\* không thuộc W04.

### 1.1 Cross-boundary Rules

| # | Rule | Hướng | Boundary liên quan | Cơ chế |
|---|---|---|---|---|
| CB-AP-001 | Kỳ kế toán do `gf-accounting` sở hữu (master); `gf-inventory` consume qua REST khi cần chặn phiếu nhập/xuất kho / import tồn đầu kỳ trong kỳ đóng và làm mốc cho báo cáo tồn/NXT. PRC BQGQ (thuộc `gf-accounting`) cross-boundary REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory`. | Cross-boundary | `gf-accounting` (owner Kỳ + PRC) ↔ `gf-inventory` (owner Sổ tồn SL + OB + phiếu nhập/xuất) | REST sync (gf-inventory → gf-accounting đọc Kỳ; gf-accounting → gf-inventory đọc Sổ tồn khi PRC BQGQ) |

> **W04 scope note**: nhánh "PRC BQGQ đọc Sổ tồn" của CB-AP-001 KHÔNG active trong W04 (FEAT-PRC-\* chưa build — W06). W04 chỉ active nhánh "`gf-inventory` consume Kỳ qua REST" — cụ thể là `AccountingPeriodClient.lockCheck()` gọi `GET /protected/v1/accounting-periods/lock-check` (ADR-021) từ 3 write-path FEAT-OB-IMPORT/FEAT-OB-EDIT/FEAT-OB-DELETE-LINES.

### 1.2 Kỳ kế toán (BR-AP-001 .. BR-AP-016)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-AP-001 | Kỳ kế toán khởi tạo ở trạng thái **"Chưa đóng"** (OPEN). | Status Init | FEAT-AP-CREATE |
| BR-AP-002 | Kỳ kế toán **không có mã** — định danh bằng **Tên kỳ kế toán** (bắt buộc). Tên scoped theo garage; **không bắt buộc kiểm tra trùng**. | Identity | FEAT-AP-CREATE, FEAT-AP-EDIT |
| BR-AP-003 | Kỳ kế toán có **3 loại**: **Kỳ kế toán năm**, **Kỳ kế toán quý**, **Kỳ kế toán tháng** — cấu trúc phân cấp cố định **Năm → Quý → Tháng**. | Hierarchy | FEAT-AP-CREATE, FEAT-AP-LIST |
| BR-AP-003a | Khi tạo **Kỳ Năm**, field **"Năm"** là **dropdown single-select** liệt kê **`[currentYear, currentYear + 49]`** = **50 giá trị** (sort ascending, VD 2026 mở form → dropdown `2026..2075`). **Default selected = `currentYear`** khi mở form. `currentYear` = năm hệ thống tại thời điểm mở form. **KHÔNG cho chọn năm quá khứ** (< `currentYear`); muốn nhập kỳ Năm quá khứ phải qua migration/import baseline (out of scope FEAT-AP-CREATE). Dropdown năm KHÔNG phụ thuộc tenant — cùng logic mọi garage. Trùng năm đã có → BR-AP-008 chặn nhờ overlap khoảng ngày (không cần rule riêng). | Widget / Validation | FEAT-AP-CREATE |
| BR-AP-004 | Trường **"Thuộc kỳ"** bắt buộc với kỳ quý và kỳ tháng (kỳ năm không có). Kỳ quý thuộc một kỳ năm; kỳ tháng thuộc một kỳ quý (gắn theo năm tương ứng). Dropdown chỉ hiển thị kỳ cha hợp lệ. (Chỉ thiết lập khi tạo — khóa khi sửa, xem BR-AP-016.) | Hierarchy | FEAT-AP-CREATE |
| BR-AP-005 | Trường bắt buộc: **Loại kỳ**, **Tên kỳ kế toán**, **Ngày bắt đầu**, **Ngày kết thúc**, **Đã đóng kỳ**; thêm **Thuộc kỳ** (với quý/tháng) và **Năm** (với kỳ năm). **Thứ tự hiển thị** (mặc định 0) và **Mô tả** không bắt buộc. | Validation | FEAT-AP-CREATE |
| BR-AP-006 | **Ngày kết thúc ≥ ngày bắt đầu**. Vi phạm → mã lỗi **`ERR-INV-021`**. (Áp khi tạo — ngày khóa khi sửa.) | Validation | FEAT-AP-CREATE |
| BR-AP-007 | Kỳ con phải nằm **trong** khoảng ngày của kỳ cha: ngày bắt đầu con ≥ ngày bắt đầu cha **và** ngày kết thúc con ≤ ngày kết thúc cha — **cho phép trùng ngày biên** (vd cùng 01/01). Vi phạm → mã lỗi **`ERR-INV-022`** (chặn lưu). (Áp khi tạo — ngày khóa khi sửa.) | Validation | FEAT-AP-CREATE |
| BR-AP-008 | Các kỳ **cùng cấp trong cùng kỳ cha không chồng lấn** khoảng ngày → mã lỗi **`ERR-INV-023`**. (Áp khi tạo — ngày khóa khi sửa.) | Validation | FEAT-AP-CREATE |
| BR-AP-009 | **Tự động sinh kỳ** (checkbox): tạo kỳ **năm** + tích → tự sinh đầy đủ cây con (4 quý + 12 tháng); tạo kỳ **quý** + tích → tự sinh 3 tháng con. Kỳ **tháng** không có tùy chọn này (cấp thấp nhất). Ngày bắt đầu/kết thúc của kỳ auto sinh được tính tự động theo loại kỳ. **Bỏ qua kỳ con đã tồn tại** (trùng khoảng ngày — theo BR-AP-008), chỉ sinh kỳ còn thiếu; sau khi sinh hiển thị **thông báo tóm tắt** ("Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại"). | Automation | FEAT-AP-CREATE |
| BR-AP-010 | Trạng thái đóng kỳ có 2 giá trị: **"Chưa đóng"** (OPEN) / **"Đã đóng"** (CLOSED), sửa qua `FEAT-AP-EDIT` (không có feature đóng/mở riêng). | Status | FEAT-AP-EDIT |
| BR-AP-011 | **Đóng / mở kỳ không ràng buộc thứ tự** — người dùng tự thao tác trên từng kỳ. **Cho phép mở lại** kỳ đã đóng. | Status Guard | FEAT-AP-EDIT |
| BR-AP-012 | Khi kỳ ở trạng thái **"Đã đóng"**, hệ thống **chặn thêm / sửa / xóa** phiếu nhập kho và xuất kho có ngày chứng từ thuộc kỳ đó, **và chặn chạy tính giá (CREATE lần đầu / RECALC) cho kỳ** (BR-PRC-008) → mã lỗi **`ERR-INV-024`** (enforcement chi tiết tại EP-INVENTORY-RECEIPT-V2 / EP-INVENTORY-DELIVERY-V2 / FEAT-PRC-CREATE). | Lock | FEAT-AP-EDIT |
| BR-AP-013 | Kỳ kế toán **đã đóng** hoặc **đã phát sinh dữ liệu kho liên quan** (phiếu nhập/xuất có ngày chứng từ thuộc kỳ; tồn đầu kỳ có **"Tồn đến ngày" rơi vào kỳ** — OB liên hệ kỳ *gián tiếp qua ngày*, không gắn trực tiếp; hoặc bản ghi tính giá trong kỳ) **không được xóa** → mã lỗi **`ERR-INV-025`**. | Delete Guard | FEAT-AP-DELETE |
| BR-AP-014 | Kỳ **cha còn kỳ con** không được xóa — phải xóa hết toàn bộ kỳ con trước → mã lỗi **`ERR-INV-026`**. | Delete Guard | FEAT-AP-DELETE |
| BR-AP-015 | Danh mục kỳ kế toán luôn được phạm vi theo garage hiện tại (tenant isolation). Tìm kiếm áp dụng dạng LIKE trên tên kỳ; bộ lọc theo năm (mặc định năm hiện tại). | Tenant Isolation / Search | FEAT-AP-LIST |
| BR-AP-016 | Khi **chỉnh sửa** kỳ, chỉ cho phép sửa **Tên kỳ kế toán, Mô tả, Thứ tự hiển thị, Trạng thái** (dropdown "Chưa đóng" / "Đã đóng"). Các trường **Loại kỳ, Năm (kỳ Năm — hiển thị năm hiện tại read-only, đồng bộ semantic với "Thuộc kỳ" của Quý/Tháng), Thuộc kỳ, Ngày bắt đầu, Ngày kết thúc, Tự động sinh kỳ** bị **khóa** (cố định sau khi tạo). Muốn đổi loại kỳ / năm / khoảng ngày → phải xóa kỳ (nếu đủ điều kiện BR-AP-013/014) và tạo lại. | Immutability | FEAT-AP-EDIT |

### 1.3 Audit & Phân quyền (BR-AP-CMN-001 .. BR-AP-CMN-002)

| BR ID | Rule | Category | Features |
|---|---|---|---|
| BR-AP-CMN-001 | Kỳ kế toán hiển thị thông tin audit: ngày tạo / người tạo / ngày sửa / người sửa. | Audit | FEAT-AP-DETAIL |
| BR-AP-CMN-002 | Hệ thống có 2 vai trò — **chủ garage** và **kế toán** — với **quyền ngang nhau** trên toàn bộ danh mục kỳ kế toán (xem / tạo / sửa / đóng-mở / xóa) **và chức năng tính giá xuất kho (PRC)** (tạo / xem / tính lại / xóa log). | Permission | (toàn bộ feature AP + PRC — W04 chỉ có 5 FEAT-AP-\* active; PRC deferred W06) |

---

## §2 Rationale (VERBATIM — trích header + preamble nguồn)

> Trích nguyên văn từ header + preamble nguồn canonical v27.

> **Note tên file legacy**: file này quản lý business rules cho Kỳ kế toán (BR-AP-\*) + Tính giá xuất kho (BR-PRC-\*) — nay thuộc `boundary: gf-accounting` (Kỳ + BQGQ là nghiệp vụ kế toán, khớp pattern ERP truyền thống SAP FI-CO / Misa / Fast / Odoo). Tên `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` giữ nguyên legacy để tránh cascade break reference từ EP/FEAT/KG/HLD/PKG. Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. Ref EP-INVENTORY-ACCOUNTING-PERIOD v16.

Tập business rules cho `EP-INVENTORY-ACCOUNTING-PERIOD`. File **mới**, không thay thế `BR-GF-INVENTORY.md` (rule kỳ kho cũ ở BR-IP-\* giữ nguyên — **Kỳ kế toán ≠ kỳ kho**).

Gồm 2 nhóm rule: **Kỳ kế toán (BR-AP)** + **Tính giá xuất kho (BR-PRC)** — cả 2 đã đặc tả đầy đủ.

> **W04 scope note (không thuộc nguồn, ghi chú của file này)**: W04 chỉ deliver nhóm **Kỳ kế toán (BR-AP)**. Nhóm **Tính giá xuất kho (BR-PRC)** deferred sang W06 (PKG-W04 §2.3 Out of Scope). File spec này KHÔNG verbatim-copy BR-PRC-\* — xem nguồn canonical trực tiếp khi wave PRC mở.

---

## §3 Enforcement Layer

### 3.1 Tổng quan phân lớp

| Layer | Vai trò | Rules chính |
|---|---|---|
| Domain (`gf-accounting` — `app/service`, class `AccountingPeriodService`) | PRIMARY — enforce toàn bộ BR-AP-\* (CORNERSTONE per domain SSOT), hierarchy validation, immutability guard, status transition | BR-AP-001..016, CB-AP-001 (nhánh owner) |
| REST adapter (`gf-accounting` — `adapter/controller`, class `AccountingPeriodController`) | Secondary — validate input DTO trước domain; map lỗi HTTP; `@FeatureOn("Inventory:InventoryV2")` class-level gate | BR-AP-005, BR-AP-006, BR-AP-016 |
| DB-level (`gf-accounting` — `ddl-auto=update`, **KHÔNG Flyway** — xem OI-W04-BR-004) | Hard constraint — CHECK, index, self-FK scalar | `end_date >= start_date`, `year = EXTRACT(YEAR FROM start_date)`, `parent_id` self-FK scalar (ADR-009) |
| Cross-boundary consumer (`gf-inventory` — `adapter/client`, bean `gfAccountingClient` / `AccountingPeriodClient.lockCheck()`) | PRIMARY cho enforcement "chặn ghi vào kỳ CLOSED" trên 3 OB write-path — advisory + authoritative theo ADR-021 | BR-AP-012 (nhánh consumer) |
| BFF (`agg-garage-graph`) | Passthrough — KHÔNG business logic; `@FeatureOn("Inventory:InventoryV2")` resolver-level gate fail-fast trước forward BE | (không enforce BR trực tiếp — passthrough) |
| UI (`garage-web`) | Secondary — dropdown năm range (BR-AP-003a), dropdown "Thuộc kỳ" filter hợp lệ (BR-AP-004), field lock display (BR-AP-016), badge trạng thái (BR-AP-010) | BR-AP-003a, BR-AP-004, BR-AP-010, BR-AP-016 |

### 3.2 Chi tiết enforcement per rule

| Rule | Primary layer | Cơ chế |
|---|---|---|
| BR-AP-001 | Domain `AccountingPeriodService.create()` | `status = OPEN` set unconditionally tại CREATE (`V4-AP-2`); request field `status` chỉ nhận optional với default `OPEN` — không override sang khác khi tạo mới ngoài optional field. |
| BR-AP-002 | Domain / REST adapter | `name` required (`@NotBlank`), KHÔNG unique constraint trên `(tenant_id, name)` (explicit theo BR — no uniqueness check). |
| BR-AP-003 | Domain | Enum `AccountingPeriodType {YEAR, QUARTER, MONTH}` — persist string column `type`; hierarchy validate tại `V4-AP-2` (parent type phải khớp: QUARTER→parent YEAR, MONTH→parent QUARTER). |
| BR-AP-003a | UI (`garage-web`) primary + Domain defensive | FE dropdown single-select generate `[currentYear, currentYear+49]` client-side, default=currentYear, không render option quá khứ. Backend: field `year` NOT NULL (v10 add) + CHECK `year = EXTRACT(YEAR FROM start_date)` — defensive cross-consistency, KHÔNG re-validate range 50 năm ở BE (UI-only constraint theo BR). |
| BR-AP-004 | Domain (`V4-AP-2` create validation) | `parentId` required nếu `type != YEAR`; validate parent tồn tại + đúng type cấp trên. UI dropdown "Thuộc kỳ" chỉ hiển thị kỳ cha hợp lệ (client-side filter theo `year` + `type`). |
| BR-AP-005 | REST adapter | `@NotBlank`/`@NotNull` DTO validation: `type`, `name`, `startDate`, `endDate`; `status` default OPEN nếu omit; `displayOrder` default 0. |
| BR-AP-006 | Domain + DB | App-layer check `endDate >= startDate` trả `ERR-INV-021`; DB CHECK constraint defensive backup. |
| BR-AP-007 | Domain | App-layer check con range ⊆ cha range (cho trùng biên) trả `ERR-INV-022`. |
| BR-AP-008 | Domain | `SELECT ... FOR UPDATE` lock trên `parent_id` row trước overlap check (chống race concurrent POST) → `ERR-INV-023` nếu overlap. |
| BR-AP-009 | Domain | `autoGenerateChildren=true` → atomic `@Transactional` insert N rows (YEAR→4Q+12M, QUARTER→3M); skip existing siblings (theo BR-AP-008 check); response `{created, skipped, skippedDetails[]}`; `year` propagate từ YEAR parent xuống children. |
| BR-AP-010 | Domain / REST | `PUT /api/v2/accounting-periods/{id}` (`V4-AP-4`) field `status` — không có endpoint đóng/mở riêng biệt. Enum `AccountingPeriodStatus {OPEN, CLOSED}`. |
| BR-AP-011 | Domain | Transition đối xứng OPEN⇄CLOSED — KHÔNG có business check ràng buộc thứ tự cha/con khi đổi trạng thái (status update độc lập per-row). |
| BR-AP-012 | **Cross-boundary — split 2 phía**: (a) Domain `gf-accounting` sở hữu field `status` (đổi qua `V4-AP-4`); (b) Cross-boundary consumer `gf-inventory` `AccountingPeriodClient.lockCheck()` | (a) `gf-accounting` chỉ chịu trách nhiệm expose trạng thái qua `GET /protected/v1/accounting-periods/lock-check?date=...` (advisory, idempotent, cache LRU 30s caller-side). (b) `gf-inventory` — enforcement authoritative thực tế nằm ở **3 OB write-path commit guard** (`POST /opening-balances/import`, `PUT /opening-balances/{id}`, `POST /opening-balances/delete-lines`) — fail-CLOSED per ADR-021 → `ERR-INV-024`. **W04 phạm vi**: chỉ 3 OB write-path active; enforcement trên phiếu nhập/xuất kho (RECEIPT-V2/DELIVERY-V2) và PRC CREATE/RECALC là **out-of-scope W04** (deferred wave sau — xem PKG-W04 §2.3). |
| BR-AP-013 | Domain (`DELETE /api/v2/accounting-periods/{id}`, `V4-AP-5`) — **PARTIAL W04** | Guard (1) `status=OPEN` check active; guard (2, xem BR-AP-014) active. Guard (3) "không có stock transaction / OB liên hệ gián tiếp qua ngày / bản ghi tính giá" **KHÔNG enforce trong `accounting_period` batch W04** — theo `gf-accounting-api.md §4.6`: "guard (3) declared ở BR/ADR và là responsibility của downstream consumers khi commit transactions" (cross-boundary check với gf-inventory/OB/PRC chưa build reverse lock trong W04). Xem OI-W04-BR-003. |
| BR-AP-014 | Domain | Recursive CTE check `accounting_period WHERE parent_id = id` — COUNT > 0 → reject `ERR-INV-026`. |
| BR-AP-015 | Domain | Mọi query scope `WHERE tenant_id = SecurityUtils.getCurrentTenantIdAsLong()` (Critical Rule #4); keyword search LIKE trên `name`; filter `year` default current year (index `idx_ap_tenant_year`). |
| BR-AP-016 | Domain + REST adapter | `PUT /api/v2/accounting-periods/{id}` (`V4-AP-4`) — request DTO CHỈ chấp nhận `name`/`description`/`displayOrder`/`status`; field `type`/`parentId`/`startDate`/`endDate`/`autoGenerateChildren` trong payload → reject `400` (mã lỗi propose `ERR-AP-001`, **pending BA register** — xem OI-W04-BR-002). UI khóa (disable) hiển thị các field immutable read-only. |
| CB-AP-001 | Cross-boundary REST 2 chiều | (a) `gf-inventory → gf-accounting`: `AccountingPeriodClient.lockCheck()` (ADR-021, active W04 — 3 OB write-path). (b) `gf-accounting → gf-inventory`: PRC BQGQ đọc Sổ tồn (out-of-scope W04, deferred W06). |
| BR-AP-CMN-001 | Domain | Audit columns `created_at`/`created_by`/`updated_at`/`updated_by` fill tự động Spring Data auditing (`@CreatedDate`/`@CreatedBy`/`@LastModifiedDate`/`@LastModifiedBy`). Status transition (đóng/mở) KHÔNG có cột audit riêng — dùng chung `updated_at`/`updated_by` (per `gf-accounting-data-model.md §2ter.1`). |
| BR-AP-CMN-002 | BFF / REST adapter | Endpoint auth scope `authenticated` — cả `garage-owner` + `accountant` đều pass; không phân biệt role tại endpoint level (Critical Rule #6 dual persona). |

### 3.3 DB-level constraints (từ `gf-accounting-data-model.md` v10 §2ter.1)

> **KHÔNG dùng Flyway** — `accounting_period` sinh schema qua `spring.jpa.hibernate.ddl-auto=update` (CLAUDE.md Gotcha #5: gf-accounting không có Flyway DDL, đồng nhất với 3 bảng design insurance). Xem OI-W04-BR-004 về drift wording ở PKG-W04.

**Table `accounting_period`**:

| Constraint | Detail |
|---|---|
| PK | `id BIGINT` (`GenerationType.IDENTITY`) |
| NOT NULL | `tenant_id, name, type, start_date, end_date, year, status, display_order` |
| CHECK | `end_date >= start_date` (BR-AP-006, defensive) |
| CHECK | `year = EXTRACT(YEAR FROM start_date)` (v10 add — defensive cross-consistency với BR-AP-003a) |
| Self-FK scalar | `parent_id BIGINT` (ADR-009 — KHÔNG `@ManyToOne`; nullable cho YEAR, NOT NULL cho QUARTER/MONTH per BR-AP-004) |
| UNIQUE | **KHÔNG có** trên `(tenant_id, name)` — BR-AP-002 explicit "không bắt buộc kiểm tra trùng tên" |
| VARCHAR cap | `name VARCHAR(255)`, `description VARCHAR(500)`, `code VARCHAR(50)` (auto-derived, không user-facing) |
| Index | `idx_ap_tenant_year(tenant_id, year)`, `idx_ap_tenant_status(tenant_id, status)`, `idx_ap_tenant_dates(tenant_id, start_date, end_date)`, `idx_ap_parent(parent_id)`, `idx_ap_tenant_name(tenant_id, name)` |

---

## §4 Test Ideas

### TC-BR-gf-accounting-AP — Kỳ kế toán

| TC ID | Rule | Scenario | Loại | Expected |
|---|---|---|---|---|
| TC-BR-AP-001-01 | BR-AP-001 | Tạo kỳ mới → kiểm tra `status` trả về | Happy | `status = OPEN` |
| TC-BR-AP-002-01 | BR-AP-002 | Tạo 2 kỳ cùng tenant, cùng `name` | Happy | Cả 2 tạo thành công — không unique constraint |
| TC-BR-AP-003-01 | BR-AP-003 | Tạo kỳ QUARTER với `parentId` trỏ tới kỳ MONTH | Violation | 400 — parent type mismatch |
| TC-BR-AP-003a-01 | BR-AP-003a | Mở form tạo kỳ Năm — verify dropdown 50 giá trị `[currentYear..currentYear+49]`, default=currentYear | Happy | Dropdown đúng 50 option, sort ASC, default currentYear |
| TC-BR-AP-003a-02 | BR-AP-003a | FE bypass gửi `year < currentYear` (giả lập tamper request) | Edge | Backend CHECK constraint `year = EXTRACT(YEAR FROM startDate)` vẫn pass nếu startDate khớp năm quá khứ — **note: BE không tự chặn năm quá khứ theo BR** (UI-only constraint); flag DEV cần xác nhận có defensive BE hay không (OI-W04-BR-005) |
| TC-BR-AP-004-01 | BR-AP-004 | Tạo kỳ QUARTER thiếu `parentId` | Violation | 400 required field |
| TC-BR-AP-004-02 | BR-AP-004 | Tạo kỳ YEAR với `parentId != null` | Violation | 400 — YEAR không được có parent |
| TC-BR-AP-005-01 | BR-AP-005 | Tạo kỳ thiếu `name` | Violation | 400 required |
| TC-BR-AP-006-01 | BR-AP-006 | `endDate < startDate` | Violation | 400 `ERR-INV-021` |
| TC-BR-AP-006-02 | BR-AP-006 | `endDate == startDate` | Happy | 201 Created (boundary case cho phép) |
| TC-BR-AP-007-01 | BR-AP-007 | Kỳ con có `startDate` trước kỳ cha | Violation | 400 `ERR-INV-022` |
| TC-BR-AP-007-02 | BR-AP-007 | Kỳ con trùng ngày biên với kỳ cha (cùng `startDate`) | Happy | 201 Created |
| TC-BR-AP-008-01 | BR-AP-008 | Tạo 2 kỳ QUARTER cùng cha, khoảng ngày overlap | Violation | 400 `ERR-INV-023` |
| TC-BR-AP-008-02 | BR-AP-008 | 2 request `SELECT FOR UPDATE` overlap concurrent (race) | Concurrency | Request thứ 2 chờ lock, sau đó reject `ERR-INV-023` nếu overlap |
| TC-BR-AP-009-01 | BR-AP-009 | Tạo kỳ YEAR + `autoGenerateChildren=true`, chưa có con nào | Happy | 1 YEAR + 4 QUARTER + 12 MONTH tạo trong 1 transaction; `generated.created=16, skipped=0` |
| TC-BR-AP-009-02 | BR-AP-009 | Tạo kỳ YEAR + `autoGenerateChildren=true`, đã có sẵn Quý 1 | Happy | Skip Quý 1 + 3 tháng con của nó (nếu đã tồn tại); `skippedDetails[]` ghi rõ; toast tóm tắt |
| TC-BR-AP-010-01 | BR-AP-010 | `PUT` đổi `status` từ OPEN → CLOSED | Happy | `status = CLOSED`, `updated_at`/`updated_by` cập nhật |
| TC-BR-AP-011-01 | BR-AP-011 | Đóng kỳ MONTH trong khi kỳ QUARTER cha vẫn OPEN | Happy | Cho phép — không ràng buộc thứ tự |
| TC-BR-AP-011-02 | BR-AP-011 | Mở lại (CLOSED → OPEN) một kỳ đã đóng | Happy | `status = OPEN` — cho phép mở lại |
| TC-BR-AP-012-01 | BR-AP-012 (nhánh consumer) | Đóng kỳ chứa ngày `2026-06-15`, gọi `POST /opening-balances/import` với dòng `tonDenNgay=2026-06-15` | Violation | `lock-check` trả `locked=true` → import commit-path reject `ERR-INV-024`, rollback toàn transaction |
| TC-BR-AP-012-02 | BR-AP-012 (nhánh consumer) | Kỳ OPEN chứa ngày, gọi `PUT /opening-balances/{id}` với `snapshot_date` mới thuộc kỳ OPEN nhưng cũ thuộc kỳ CLOSED | Violation | Edit reject `ERR-INV-024` (check CẢ ngày cũ VÀ ngày mới per FEAT-OB-EDIT AC-5) |
| TC-BR-AP-012-03 | BR-AP-012 (nhánh consumer) | `gf-accounting` down/timeout khi gọi `import` commit-path | Fail-CLOSED | Chặn commit, response `ERR-CMN-007` 503; verify-import (preview) fail-OPEN với `warningLockCheckUnavailable` marker |
| TC-BR-AP-013-01 | BR-AP-013 | Xóa kỳ `status=CLOSED` | Violation | 400 `ERR-INV-025` |
| TC-BR-AP-013-02 | BR-AP-013 | Xóa kỳ OPEN, không con, không stock transaction (guard 3 KHÔNG check trong W04 batch — xem OI-W04-BR-003) | Happy (W04 partial) | 204 No Content — **DEV lưu ý**: nếu OB đã tồn tại thuộc kỳ này, W04 KHÔNG tự chặn xóa (guard 3 chưa implement); nguy cơ orphan data — flag test integration cross-boundary riêng |
| TC-BR-AP-014-01 | BR-AP-014 | Xóa kỳ YEAR còn 1 QUARTER con | Violation | 400 `ERR-INV-026` |
| TC-BR-AP-014-02 | BR-AP-014 | Xóa kỳ MONTH lá (không con) | Happy | 204 No Content |
| TC-BR-AP-015-01 | BR-AP-015 | Tenant A search kỳ — không thấy kỳ tenant B | Tenant isolation | Response chỉ chứa kỳ tenant A |
| TC-BR-AP-015-02 | BR-AP-015 | Mở list lần đầu, không chọn filter năm | Happy | Mặc định filter `year = currentYear` |
| TC-BR-AP-016-01 | BR-AP-016 | `PUT` payload chứa `type` khác giá trị hiện tại | Violation | 400 reject (mã đề xuất `ERR-AP-001`, chưa BA register — flag OI-W04-BR-002) |
| TC-BR-AP-016-02 | BR-AP-016 | `PUT` chỉ đổi `name`/`description`/`displayOrder`/`status` | Happy | 200, các field khác giữ nguyên |
| TC-BR-AP-CMN-001-01 | BR-AP-CMN-001 | Xem detail kỳ chưa từng sửa | Happy | `updatedAt`/`updatedBy` null/rỗng, `createdAt`/`createdBy` có giá trị — field vẫn hiển thị (KHÔNG ẩn) |
| TC-BR-AP-CMN-002-01 | BR-AP-CMN-002 | User role `accountant` gọi CRUD kỳ | Happy | Pass — quyền ngang `garage-owner` |

---

## §5 BR → FEAT → AC Mapping

### FEAT-AP-LIST

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-AP-003 | AC-3 | Hiển thị cây phân cấp Năm→Quý→Tháng, expand/collapse |
| BR-AP-010 | AC-4 | Badge trạng thái text chip (xanh=Chưa đóng, đỏ=Đã đóng) — KHÔNG icon |
| BR-AP-015 | AC-5, AC-6, AC-6b, AC-9 | Tenant isolation; search LIKE tên; filter năm default current year; sort ASC theo `display_order` trong phạm vi kỳ cha |
| (không có BR riêng) | AC-4b | Empty state "chưa có kỳ nào" — UI-only behavior |

### FEAT-AP-CREATE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-AP-001 | AC-10 | `status = OPEN` khi tạo |
| BR-AP-002 | AC-3 | Tên bắt buộc, không unique |
| BR-AP-003 | AC-2 | Radio 3 loại kỳ |
| BR-AP-003a | AC-4 | Dropdown "Năm" 50 giá trị `[currentYear..+49]` cho kỳ Năm |
| BR-AP-004 | AC-4, AC-5 | "Thuộc kỳ" bắt buộc quý/tháng; dropdown filter kỳ cha hợp lệ |
| BR-AP-005 | AC-3, AC-6, AC-7 | Trường bắt buộc + default `displayOrder=0`/`status=OPEN` |
| BR-AP-006 | AC-9 | `endDate >= startDate` → `ERR-INV-021` |
| BR-AP-007 | AC-9 | Kỳ con trong khoảng cha, cho trùng biên → `ERR-INV-022` |
| BR-AP-008 | AC-9 | Không chồng lấn cùng cấp → `ERR-INV-023` |
| BR-AP-009 | AC-8 | Auto-generate children, skip existing + toast tóm tắt |
| BR-AP-CMN-002 | AC-12 | Phân quyền ngang nhau |

### FEAT-AP-DETAIL

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-AP-CMN-001 | AC-3 | 4 field audit — hiển thị kể cả khi chưa từng sửa (giá trị rỗng "—") |
| BR-AP-010 | AC-2 | Field "Trạng thái" read-only |
| BR-AP-CMN-002 | AC-6 | Phân quyền xem ngang nhau |

### FEAT-AP-EDIT

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-AP-016 | AC-2, AC-3 | 4 field editable (Tên/Mô tả/Trạng thái/Thứ tự) + field khóa (Loại kỳ/Năm/Thuộc kỳ/Ngày/Tự động sinh kỳ) |
| BR-AP-010 | AC-4 | Đổi `status` qua dropdown "Trạng thái" |
| BR-AP-011 | AC-5 | Mở lại kỳ, không ràng buộc thứ tự |
| BR-AP-012 | AC-4 | Đóng kỳ → khóa phiếu nhập/xuất trong kỳ (enforcement thực tế ở downstream — RECEIPT-V2/DELIVERY-V2 ngoài W04; OB write-path trong W04 qua ADR-021) |
| BR-AP-CMN-002 | AC-8 | Phân quyền sửa ngang nhau |

### FEAT-AP-DELETE

| BR ID | AC liên quan | Ghi chú |
|---|---|---|
| BR-AP-013 | AC-4 | Guard CLOSED / có dữ liệu kho liên quan → `ERR-INV-025` (**W04 chỉ enforce nhánh CLOSED** — nhánh "dữ liệu kho liên quan" là guard(3), chưa build cross-boundary check trong W04, xem OI-W04-BR-003) |
| BR-AP-014 | AC-5 | Guard còn kỳ con → `ERR-INV-026` |
| BR-AP-CMN-002 | AC-6 | Phân quyền xóa ngang nhau |

### FEAT-OB-IMPORT / FEAT-OB-EDIT / FEAT-OB-DELETE-LINES (cross-boundary consumer — chi tiết AC tại FEAT gốc + `BR-GF-INVENTORY-OPENING-BALANCE.md`)

| BR ID (nguồn AP) | Cơ chế cross-boundary | Ghi chú |
|---|---|---|
| BR-AP-012 (qua CB-AP-001 + ADR-021) | `gf-inventory` gọi `AccountingPeriodClient.lockCheck()` — advisory ở verify-path, authoritative fail-CLOSED ở commit-path | FEAT-OB-IMPORT AC-5, FEAT-OB-EDIT AC-5, FEAT-OB-DELETE-LINES AC-4 tham chiếu `ERR-INV-024`. Rule chi tiết validate từng field (`BR-OB-006..016`, `BR-OB-EDIT-*`, `BR-OB-DEL-*`) thuộc `BR-GF-INVENTORY-OPENING-BALANCE.md` — **KHÔNG duplicate ở file này**, chỉ map điểm nối cross-boundary. |

---

## §6 Error Code Mapping

> Nguồn canonical: `Product/error-code/ERROR-CODE-REGISTRY.md` v17. **D2 micro-decision** (ADR-019 §Decision): mã lỗi Kỳ kế toán giữ verbatim `ERR-INV-021..026` dù boundary đã đổi sang `gf-accounting` — tránh registry cascade cost + `ERR-INV-024` đã dùng cross-boundary (OB/RECEIPT-V2/DELIVERY-V2). Namespace mới `ERR-AP-*` chỉ dùng cho case mới phát sinh do move boundary (BR-AP-016 immutable-field violation), hiện **pending register**.

| Code | ERR ID | HTTP | Display mode | Message (vi) | Trigger | Status |
|---|---|---|---|---|---|---|
| `ERR-INV-021` | INV-021 | 400 | INLINE_FIELD | "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu" | BR-AP-006 | Registered |
| `ERR-INV-022` | INV-022 | 400 | INLINE_FIELD | "Khoảng ngày của kỳ con phải nằm trong khoảng ngày của kỳ cha" | BR-AP-007 (+ reuse cho parent-type mismatch BR-AP-003/004) | Registered |
| `ERR-INV-023` | INV-023 | 400 | INLINE_FIELD | "Khoảng ngày bị chồng lấn với kỳ cùng cấp trong cùng kỳ cha" | BR-AP-008 | Registered |
| `ERR-INV-024` | INV-024 | 400 | INLINE_FORM | "Kỳ kế toán đã đóng — không thể thêm/sửa/xóa/ghi sổ chứng từ thuộc kỳ này" | BR-AP-012 (owner) / BR-OB-013, BR-OB-EDIT-002, BR-OB-DEL-002 (consumer cross-boundary, ADR-021) | Registered — **đã dùng cross-boundary**, mismatch namespace tolerated (D2, OQ2) |
| `ERR-INV-025` | INV-025 | 400 | DIALOG | "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa" | BR-AP-013 | Registered — **W04 chỉ trigger nhánh CLOSED** (guard 3 chưa active, xem OI-W04-BR-003) |
| `ERR-INV-026` | INV-026 | 400 | DIALOG | "Kỳ cha còn kỳ con, phải xóa hết kỳ con trước" | BR-AP-014 | Registered |
| _(propose)_ `ERR-AP-001` | — | 400 | (chưa chốt — đề xuất INLINE_FORM) | "Không thể sửa trường [Loại kỳ/Năm/Thuộc kỳ/Ngày/Tự động sinh kỳ] — các trường này cố định sau khi tạo" | BR-AP-016 | **PENDING** — chưa register trong ERROR-CODE-REGISTRY.md (OI-W04-BR-002, flag OQ7 tại `gf-accounting-api.md §4.8`) |
| _(no code)_ | — | 413 | (BFF translate `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE`) | Tree size > 500 periods/tenant | PL5 + ADR-019 | Plain HTTP 413, không dùng registry code (tránh resurrect deprecated `ERR-INV-027`) |
| `ERR-CMN-007` | CMN-007 | 503 | TOAST | "Hệ thống đang bận, vui lòng thử lại sau" | `gf-accounting` unreachable khi `gf-inventory` gọi lock-check trên commit-path OB (fail-CLOSED, ADR-021) | Registered (platform-level) |

---

## §7 Open Items / NEED CONFIRMATION

| ID | Mô tả | Severity |
|---|---|---|
| OI-W04-BR-001 | **`source_sha` chưa tính được**: agent session viết file này không có tool hash (chỉ Read/Write/Edit, không có Bash/`sha256sum`). Orchestrator cần backfill `source_sha` thực tế của `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 trước khi DRAFT → ACTIVE (reviewer W04 nên chặn cho tới khi field này có giá trị hash hợp lệ). | BLOCKING cho ACTIVE transition — không block nội dung DRAFT |
| OI-W04-BR-002 | **`ERR-AP-001` (BR-AP-016 immutable-field violation) chưa được Business Authority register** trong `ERROR-CODE-REGISTRY.md`. Flag OQ7 tại `gf-accounting-api.md §4.8`. DEV FEAT-AP-EDIT hiện phải dùng placeholder response 400 generic cho tới khi mã chính thức được cấp. | FOLLOW-UP CR (BA + Architect) — không block DEV nếu dùng placeholder tạm |
| OI-W04-BR-003 | **BR-AP-013 guard (3) "đã phát sinh dữ liệu kho liên quan" KHÔNG enforce trong `accounting_period` DELETE batch W04** — theo `gf-accounting-api.md §4.6`, guard 3 là "responsibility của downstream consumers khi commit transactions" và chưa có reverse cross-boundary check (`gf-inventory` chưa expose "has-data-for-period" query cho `gf-accounting` gọi ngược). Rủi ro: W04 cho phép xóa kỳ OPEN dù đã có OB import thuộc kỳ đó → orphan reference (OB còn "Tồn đến ngày" trỏ vào kỳ đã xóa). DEV cần xác nhận đây là chấp nhận được cho W04 hay cần block bổ sung integration test cảnh báo. | HIGH — cần Architecture Authority + BA xác nhận trước GA |
| OI-W04-BR-004 | **Drift wording migration**: `PKG-W04-inventory-period-opening-balance.md §2.2.1` ghi "Flyway `V{N+1}__accounting_v1_accounting_period.sql`" nhưng `Architecture/data/gf-accounting-data-model.md v10 §2ter` + CLAUDE.md Gotcha #5 xác nhận `accounting_period` sinh qua `ddl-auto=update` (KHÔNG Flyway, đồng nhất 3 bảng insurance design). DEV PHẢI theo data-model.md (authoritative Architecture doc). Follow-up CR sửa PKG wording. | LOW — không block DEV nếu đọc đúng data-model.md |
| OI-W04-BR-005 | **BR-AP-003a chỉ là UI constraint** — dropdown 50 năm chặn năm quá khứ ở FE; chưa rõ backend `POST /api/v2/accounting-periods` có defensive re-validate `year >= currentYear` hay không (CHECK constraint hiện tại chỉ verify `year == EXTRACT(YEAR FROM startDate)`, không verify `year >= currentYear`). Nếu client bypass FE (gọi API trực tiếp) có thể tạo kỳ Năm quá khứ. Cần Architecture xác nhận có cần defensive BE hay chấp nhận rủi ro (UI-only theo BR gốc). | MEDIUM — cần Architecture Authority xác nhận scope BE validation |
| OI-W04-BR-006 (kế thừa từ nguồn v24, đã resolve ở v25) | CB-AP-001 rule content đã được rewrite ở source v25 (2026-07-07) — không còn open. Ghi chú lại đây để tránh nhầm với OI cũ. | RESOLVED — no action |

---

## §8 References

- `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 (nguồn canonical)
- `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9
- `Architecture/api/gf-accounting-api.md` v15 §2, §4.1-4.8 (Accounting Period endpoints V4-AP-1..5 + V4-AP-LC)
- `Architecture/data/gf-accounting-data-model.md` v10 §2ter (entity `accounting_period`)
- `Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md` (boundary + lock-check pattern gốc)
- `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 (áp dụng lock-check cho 3 OB write-path)
- `Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md` v4 (OB import wizard, cascade tại commit)
- `Architecture/decisions/ADR-009` (JPA no relationship mapping — self-FK scalar `parent_id`)
- `Product/error-code/ERROR-CODE-REGISTRY.md` v17
- `Product/features/FEAT-AP-LIST.md` v8, `FEAT-AP-CREATE.md` v6, `FEAT-AP-DETAIL.md` v5, `FEAT-AP-EDIT.md` v7, `FEAT-AP-DELETE.md` v4
- `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` (nguồn BR-OB-\* — cross-ref cho §5 cross-boundary mapping, KHÔNG verbatim copy ở file này)
- `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v2 (reference shape cho execution-spec BR mode)

---

## §9 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT W04 scoped spec. Verbatim copy (filtered) BR-AP-001..016 + CB-AP-001 + BR-AP-CMN-001/002 từ BR-GF-INVENTORY-ACCOUNTING-PERIOD v27 — loại bỏ BR-PRC-\* (out-of-scope W04, deferred W06). Bổ sung §3 Enforcement Layer (domain `gf-accounting` primary + cross-boundary consumer `gf-inventory` cho BR-AP-012 qua ADR-021), §4 Test Ideas (23 TC), §5 BR→FEAT→AC mapping cho 5 FEAT-AP-\* + cross-boundary note cho 3 FEAT-OB-\*, §6 Error code mapping (ERR-INV-021..026 + propose ERR-AP-001 pending + ERR-CMN-007). 6 Open Items ghi nhận: source_sha chưa tính được (no hash tool), ERR-AP-001 pending BA register, BR-AP-013 guard(3) partial-enforce W04, PKG Flyway-wording drift vs ddl-auto=update thực tế, BR-AP-003a UI-only past-year guard chưa rõ BE defensive, CB-AP-001 đã resolve ở nguồn (ghi chú tránh nhầm). |
