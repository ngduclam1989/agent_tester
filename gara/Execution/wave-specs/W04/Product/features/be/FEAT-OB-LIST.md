---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-OB-LIST.md"
source_version: 9
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-LIST"
source_feat_sha: "d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8"
generated_at: "2026-07-08T00:00:00+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán tìm 'Lốp' + lọc Kho X trên `POST /api/v2/opening-balances/search` → BE trả trang dữ liệu + `aggregates.totalQuantity`/`totalValue` theo filter hiện tại; bấm xóa 1 dòng → BE gọi lock-check `gf-accounting` (ADR-021, fail-CLOSED) rồi cascade sổ tồn (ADR-020) qua `DELETE /api/v2/opening-balances/{id}`."
consumes_contracts:
  - "POST /api/v2/opening-balances/search (self)"
  - "DELETE /api/v2/opening-balances/{id} (self)"
  - "GET /protected/v1/accounting-periods/lock-check (gf-accounting — ADR-021 advisory + authoritative REST consumer, fail-CLOSED trên commit-path delete)"
paired_bff_feats: ["FEAT-OB-LIST"]
paired_fe_web_feats: ["FEAT-OB-LIST"]
paired_mobile_feats: ["FEAT-OB-LIST"]
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  template_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-LIST.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-LIST (BE): Danh sách tồn đầu kỳ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-LIST` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `gf-accounting` (cross-boundary lock-check consumer) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán tìm 'Lốp' + lọc Kho X trên `POST /api/v2/opening-balances/search` → BE trả trang dữ liệu + `aggregates.totalQuantity`/`totalValue` theo filter hiện tại; bấm xóa 1 dòng → BE gọi lock-check `gf-accounting` (ADR-021, fail-CLOSED) rồi cascade sổ tồn (ADR-020) qua `DELETE /api/v2/opening-balances/{id}` |
| Cross-tier pair | BFF: `FEAT-OB-LIST` \| Web: `FEAT-OB-LIST` \| Mobile: `FEAT-OB-LIST` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) |
| Source version | v9 |
| Source SHA | `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` |
| Generated at | 2026-07-08T04:51:55+00:00 (bundle) |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần một nơi để rà soát toàn bộ dữ liệu tồn kho khởi điểm (tồn đầu kỳ) đã nạp vào hệ thống — tìm theo mã/tên, lọc theo kho / người nhập / ngày nhập, và xem tổng số lượng + giá trị đang áp dụng theo bộ lọc. Đây là màn hình cửa ngõ của luồng "Tồn đầu kỳ": từ đây garage khởi động import lần đầu, kiểm tra lại số liệu và xử lý xóa/sửa từng dòng khi phát hiện sai sót, trước khi các nghiệp vụ nhập/xuất kho (W05 trở đi) bắt đầu ghi tiếp vào sổ tồn dựa trên baseline này.

## 2. Trách nhiệm backend (`gf-inventory`)

- Cung cấp endpoint tìm kiếm phân trang trên `opening_balance_line` với keyword LIKE (mã/tên nội bộ, accent-insensitive) + 3 filter (kho, người import, khoảng ngày import) + sort mặc định theo `createdAt` giảm dần.
- Tính toán tổng hợp (`aggregates.totalQuantity` / `totalValue`) **server-side theo bộ lọc hiện tại** — không phải sum client-side của trang đang hiển thị.
- Enforce tenant isolation (`TenantFilter` + `TenantContext`) trên toàn bộ query — chỉ trả dòng thuộc garage hiện tại.
- Cung cấp endpoint xóa 1 dòng tồn đầu kỳ (trigger từ icon xóa trên danh sách) với guardrail kỳ kế toán đã đóng (cross-boundary lock-check `gf-accounting`, ADR-021) + guardrail cascade tồn âm point-in-time (`StockLedgerRecomputeService`, ADR-020) trước khi cho phép xóa.
- Cross-boundary REST consumer: gọi `gf-accounting GET /protected/v1/accounting-periods/lock-check` tại thời điểm xóa — authoritative, fail-CLOSED khi downstream lỗi/timeout (ADR-021).
- Migration: KHÔNG tạo cột/bảng mới ở FEAT này — tái sử dụng entity `opening_balance_line` + `inventory_stock_ledger` đã additive-migrate (Flyway `V{N+1}__inventory_v2_ob_ledger.sql`, phối hợp cùng FEAT-OB-IMPORT là write-path khởi tạo dữ liệu).

## 3. Hành vi cần triển khai (BE behaviour map)

> Coverage: 18/18 source AC-ID (đếm thủ công từ source FEAT §2 — bundle §C không extract được AC-ID tự động, xem NEED CONFIRMATION ở cuối file).

### Cluster A — Tìm kiếm, lọc, phân trang, tổng hợp (server-side)

#### AC-4 → Tìm kiếm theo từ khóa

- **Khi**: client gửi `POST /api/v2/opening-balances/search` với `keyword` khác rỗng.
- **BE phải**: thực hiện LIKE (accent-insensitive) trên `product_code` + `product_name` snapshot của dòng OB, scoped theo `tenant_id`.
- **Output**: `content[]` chỉ chứa các dòng khớp keyword, giữ nguyên shape response chuẩn W04-1.
- **Failure mode**: `keyword` không hợp lệ (vd quá dài) → `400 ERR-CMN-validation`.
- **Ref**: BR-OB-014 (§9), entity `OpeningBalanceLine` (§5.1), endpoint `POST /api/v2/opening-balances/search` (§6.1)

#### AC-5 → Lọc theo Kho / Người import / Ngày import

- **Khi**: client gửi kèm `warehouseId` và/hoặc `createdBy` và/hoặc `importedFrom`+`importedTo`.
- **BE phải**: áp filter tương ứng — `warehouseId` là scalar FK `warehouse.id` tenant-scoped; `createdBy` match chính xác `opening_balance_line.created_by`; `importedFrom`/`importedTo` là range trên `created_at`. Các filter combine AND với nhau và với `keyword` (AC-4).
- **Output**: `content[]` đã áp toàn bộ filter kết hợp.
- **Failure mode**: `warehouseId` không tồn tại trong tenant → trả `content: []` (không throw lỗi — filter không match); ngày sai format ISO-8601 → `400 ERR-CMN-validation`.
- **Ref**: BR-OB-014 (§9), endpoint `POST /api/v2/opening-balances/search` (§6.1)

#### AC-6 → Phân trang offset

- **Khi**: client gửi `page`/`size` (hoặc không gửi → default).
- **BE phải**: áp dụng offset paging, default `page=0`, `size=20`, `size` tối đa 100 (vượt → `400`). Trả kèm `totalElements`, `totalPages`.
- **Output**: `page`, `size`, `totalElements`, `totalPages` trong response.
- **Failure mode**: `size > 100` → `400 ERR-CMN-validation`.
- **Ref**: HLD index `idx_ob_tenant_created` (§5.2), endpoint `POST /api/v2/opening-balances/search` (§6.1)

#### AC-3 → Dòng Tổng (server-side aggregate)

- **Khi**: mỗi lần `search` được gọi (mọi tổ hợp filter, kể cả không filter).
- **BE phải**: tính `aggregates.totalQuantity` (SUM `quantity_on_hand`) + `aggregates.totalValue` (SUM `value_on_hand`) trên **toàn bộ tập kết quả sau khi áp filter** (không giới hạn theo trang hiện tại).
- **Output**: object `aggregates: { totalQuantity, totalValue }` nằm cùng response `content[]`.
- **Failure mode**: filter không match dòng nào → `aggregates: { totalQuantity: 0, totalValue: 0 }` (không lỗi).
- **Ref**: BR-OB-014 (§9), endpoint `POST /api/v2/opening-balances/search` (§6.1)

#### AC-9 → Phân quyền và phạm vi garage

- **Khi**: mọi request tới `search` hoặc xóa dòng (AC-11).
- **BE phải**: enforce `TenantFilter` (header `X-Tenant-Id` phải match tenant của JWT — Critical Rule #4); cho phép cả 2 role `accountant` + `garage-owner` truy cập ngang quyền (đọc + xóa dòng); KHÔNG phân biệt quyền giữa 2 role cho các endpoint thuộc FEAT này.
- **Output**: request hợp lệ → xử lý bình thường; tenant mismatch → chặn truy cập.
- **Failure mode**: tenant header mismatch → `403`; role ngoài 2 persona → không áp dụng (hệ thống chỉ có 2 actor, Critical Rule #6).
- **Ref**: BR-OB-CMN-002 (§9), §4.2 Tenant + auth

### Cluster B — Xóa 1 dòng (per-row delete)

#### AC-11 → Xóa dòng (per row)

- **Khi**: client gửi `DELETE /api/v2/opening-balances/{id}` (trigger từ icon xóa 🗑️ trên danh sách — popup xác nhận là UI concern, xem `fe-web/FEAT-OB-LIST.md`).
- **BE phải**:
  1. Xác thực `id` tồn tại + thuộc tenant hiện tại (404 nếu không).
  2. Gọi `gf-accounting GET /protected/v1/accounting-periods/lock-check?date={asOfDate}` (authoritative, trong transaction) — nếu `locked=true` hoặc downstream lỗi/timeout → fail-CLOSED, KHÔNG xóa (ADR-021).
  3. Xóa hard-delete row `opening_balance_line` + cascade recompute qua `StockLedgerRecomputeService.recompute(...)` (ADR-020) cho `(tenant, product, warehouse)` bị ảnh hưởng.
  4. Kiểm tra invariant `closing_qty ≥ 0` tại mọi ngày sau cascade — vi phạm → rollback toàn bộ transaction.
- **Output**: `200 { deletedId, cascadedRecomputedRows }`.
- **Failure mode**: `ERR-INV-024` (kỳ đã đóng, BR-OB-DEL-002) · `ERR-INV-036` (cascade tồn âm, BR-OB-DEL-003) · `404` not found · `503 ERR-CMN-007` (gf-accounting down, fail-CLOSED).
- **Ref**: BR-OB-DEL-002, BR-OB-DEL-003 (§9), ADR-020, ADR-021, entity `OpeningBalanceLine` + `InventoryStockLedger` (§5.1), endpoint `DELETE /api/v2/opening-balances/{id}` (§6.1)

### Cluster C — UI-only (N/A cho BE)

#### AC-1 → N/A (UI-only)

- Mở màn danh sách (Web GMS) — điều hướng + layout screen. Xem `fe-web/FEAT-OB-LIST.md §3 AC-1`.

#### AC-1b → N/A (UI-only)

- Mở màn danh sách (App Garage — entry qua mission tile). Xem `mobile/FEAT-OB-LIST.md §3 AC-1b`.

#### AC-2 → N/A (UI-only, data đã có trong response §6.1)

- Cột hiển thị trong bảng (Web GMS) — toàn bộ field (`productCode`, `productName`, `mainUnitCode`, `warehouseCode`/`warehouseName`, `quantityOnHand`, `valueOnHand`, `asOfDate`, `createdBy`, `createdAt`) đã có sẵn trong `content[]` response §6.1; render + sắp cột là việc của FE. Xem `fe-web/FEAT-OB-LIST.md §3 AC-2`.

#### AC-2b → N/A (UI-only, data đã có trong response §6.1)

- Card layout (App Garage) — cùng field source như AC-2, chỉ khác cách trình bày. Xem `mobile/FEAT-OB-LIST.md §3 AC-2b`.

#### AC-3b → N/A (UI-only)

- Trạng thái trống (Web GMS) — BE trả `content: [], totalElements: 0, aggregates: {totalQuantity: 0, totalValue: 0}` là hành vi mặc định tự nhiên của AC-3/AC-4/AC-5/AC-6 khi không có dòng nào match; hiển thị icon/text/empty layout là UI concern. Xem `fe-web/FEAT-OB-LIST.md §3 AC-3b`.

#### AC-3b-mobile → N/A (UI-only)

- Trạng thái trống (App Garage) — cùng lý do AC-3b. Xem `mobile/FEAT-OB-LIST.md §3 AC-3b-mobile`.

#### AC-4b → N/A (UI-only, dùng chung BE behaviour AC-4)

- Màn tìm kiếm dedicated (App Garage) — gọi cùng endpoint `search` với `keyword`; debounce 300ms là client-side concern. Xem `mobile/FEAT-OB-LIST.md §3 AC-4b`.

#### AC-5b → N/A (UI-only, dùng chung BE behaviour AC-5 subset)

- Bottom-sheet bộ lọc (App Garage, 2 filter Kho + Ngày Import) — subset của filter đã có ở AC-5 (`warehouseId`, `importedFrom`/`importedTo`); BE không cần thay đổi gì thêm. Xem `mobile/FEAT-OB-LIST.md §3 AC-5b`.

#### AC-5c → N/A (ngoài phạm vi FEAT-OB-LIST — dùng endpoint warehouse-search đã có)

- Kho dropdown paginated trong bottom-sheet dùng GraphQL `searchWarehouses` → REST `GET /api/v1/warehouses` (endpoint `Warehouse` module, đã tồn tại từ trước — không thuộc `opening-balances` search). Preserve-selection logic là client-side state. Xem `mobile/FEAT-OB-LIST.md §3 AC-5c`.

#### AC-6b → N/A (UI-only, dùng chung BE behaviour AC-6)

- Infinite-scroll (App Garage) — cùng cơ chế offset pagination của AC-6, client tự tính `hasNextPage` từ `totalPages`. Xem `mobile/FEAT-OB-LIST.md §3 AC-6b`.

#### AC-7 → N/A (UI-only, dẫn tới FEAT-OB-DELETE-LINES)

- Chọn dòng checkbox + nút "Xoá các dòng đã chọn" (Web GMS) — chỉ là UI state; hành động xóa hàng loạt thực thi qua `POST /api/v2/opening-balances/delete-lines` (W04-7), thuộc BE tier của `FEAT-OB-DELETE-LINES`, KHÔNG thuộc FEAT-OB-LIST theo citation API doc §3b.1. Xem `fe-web/FEAT-OB-LIST.md §3 AC-7`.

#### AC-8 → N/A (UI-only, dẫn tới FEAT-OB-IMPORT)

- Nút "Import tồn đầu kỳ" (Web GMS) — điều hướng mở wizard, thực thi tại BE tier của `FEAT-OB-IMPORT` (W04-3/W04-4). Xem `fe-web/FEAT-OB-LIST.md §3 AC-8`.

#### AC-10 → N/A (UI-only, dẫn tới FEAT-OB-EDIT)

- Icon sửa ✏️ (Web GMS) — điều hướng mở form sửa; thực thi tại BE tier của `FEAT-OB-EDIT` (W04-5 `PUT /api/v2/opening-balances/{id}`), KHÔNG thuộc FEAT-OB-LIST theo citation API doc §3b.1. Xem `fe-web/FEAT-OB-LIST.md §3 AC-10`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-OB-014** (CORNERSTONE): tenant isolation + tìm kiếm LIKE (mã/tên) + lọc Kho/Người import/Ngày import + dòng Tổng server-side — enforce tại `app/service` (query layer). Vi phạm scope tenant → `403`.
- **BR-OB-DEL-002** (CORNERSTONE): không cho xóa dòng OB nếu `asOfDate` rơi vào kỳ kế toán đã CLOSED — enforce qua cross-boundary lock-check `gf-accounting` (ADR-021), fail-CLOSED. Vi phạm → `ERR-INV-024` HTTP 400.
- **BR-OB-DEL-003** (CORNERSTONE): không cho xóa nếu cascade recompute làm tồn âm tại bất kỳ ngày nào (point-in-time). Enforce trong `StockLedgerRecomputeService` (ADR-020 bước 5). Vi phạm → `ERR-INV-036` HTTP 400, rollback transaction.
- **BR-OB-CMN-001** (NORMAL): mỗi dòng OB phải mang `created_by` + `created_at` — dữ liệu ghi tại write-path (FEAT-OB-IMPORT/EDIT), FEAT này chỉ pass-through hiển thị.
- **BR-OB-CMN-002** (NORMAL): permission gate `accountant` + `garage-owner` ngang quyền cho toàn bộ endpoint thuộc FEAT này.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `search` (đọc) + `DELETE /{id}` (ghi) đều yêu cầu JWT hợp lệ + tenant khớp; không phân biệt role giữa `accountant` và `garage-owner`.
- Toàn bộ endpoint OB gate bởi `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController` — tenant chưa enable flag → HTTP 403.

### 4.3 Idempotency + concurrency

- `POST /api/v2/opening-balances/search`: safe/idempotent (read-only), không cần idempotency key.
- `DELETE /api/v2/opening-balances/{id}`: idempotent tự nhiên theo REST semantic (lần gọi lặp lại sau lần xóa đầu → `404`).
- Xóa dòng chạy trong 1 `@Transactional` bao trọn: lock-check → hard-delete → cascade recompute → invariant check; Redisson lock key `stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}` (timeout 30s) ngăn 2 write-path chạy đồng thời trên cùng `(product, warehouse)`.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-4, AC-5, AC-6 | INLINE (filter/pagination sai format) |
| `ERR-INV-024` | 400 | AC-11 | TOAST (kỳ kế toán đã đóng) |
| `ERR-INV-036` | 400 | AC-11 | TOAST (xóa làm tồn cascade âm) |
| `403` tenant mismatch | 403 | AC-9 | EMPTY_STATE / redirect |
| `ERR-CMN-not-found` | 404 | AC-11 | TOAST |
| `ERR-CMN-007` | 503 | AC-11 | TOAST (retry — gf-accounting lock-check unavailable, fail-CLOSED) |

---

## 5. Schema delta (BE — contract focus)

> Entity `opening_balance_line` + `inventory_stock_ledger` đã được additive-migrate (Flyway `V{N+1}__inventory_v2_ob_ledger.sql`, ADR-009 scalar FK, tenant_id enforced) — write-path khởi tạo dữ liệu thuộc `FEAT-OB-IMPORT` (cùng wave). **FEAT-OB-LIST KHÔNG thêm cột mới** — chỉ đọc (search) + hard-delete 1 dòng. Bảng dưới liệt kê field liên quan (reference, không phải delta).

### 5.1 Entity reference — `gf-inventory` (no new columns)

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `opening_balance_line` | `id` | `BIGINT` | N | auto | (đã tồn tại — FEAT-OB-IMPORT) | — | AC-11 | PK, dùng cho `DELETE /{id}` |
| `opening_balance_line` | `tenant_id` | `BIGINT` | N | — | (đã tồn tại) | BR-OB-014 | AC-9 | tenant scope mọi query |
| `opening_balance_line` | `product_code` / `product_name` | `VARCHAR` | N | — | (đã tồn tại) | BR-OB-001 | AC-4 | LIKE search target |
| `opening_balance_line` | `warehouse_code` / `warehouse_id` | `VARCHAR` / `BIGINT` | N | — | (đã tồn tại) | BR-OB-005 | AC-5 | filter Kho |
| `opening_balance_line` | `quantity` / `value` | `DECIMAL(18,6)` / `DECIMAL(18,2)` | N | — | (đã tồn tại) | BR-OB-008/009 | AC-3 | nguồn SUM cho `aggregates` |
| `opening_balance_line` | `snapshot_date` (`asOfDate`) | `DATE` | N | — | (đã tồn tại) | BR-OB-002 | AC-11 | tham số gọi lock-check khi xóa |
| `opening_balance_line` | `created_by` / `created_at` | `VARCHAR` / `TIMESTAMPTZ` | N | — | (đã tồn tại) | BR-OB-CMN-001 | AC-5, AC-2 | filter Người import / Ngày import + sort mặc định |

### 5.2 Index / constraint changes

> Không thêm index mới — tái sử dụng index đã ratify tại HLD §6b.3 (cite cùng wave, owned bởi write-path FEAT). Liệt kê để phục vụ query plan của AC-4/5/6.

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `opening_balance_line` | `idx_ob_tenant_created` | `(tenant_id, created_at DESC)` | btree | Default sort AC-2/AC-6 | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_warehouse_asof` | `(tenant_id, warehouse_id, as_of_date)` | btree | Filter Kho + asOfDate AC-5 | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_created_by` | `(tenant_id, created_by)` | btree | Filter Người import AC-5 | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_asof` | `(tenant_id, as_of_date)` | btree | Hỗ trợ lock-check theo ngày AC-11 | HLD §6b.3 |
| `inventory_stock_ledger` | `idx_ledger_lookup` | `(tenant_id, product_id, warehouse_id, movement_date DESC)` | btree — critical | Cascade recompute lookup khi xóa (AC-11, ADR-020) | HLD §6b.3 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/opening-balances/search` | JWT + `X-Tenant-Id` + `X-Branch-Id` | `{ keyword?, warehouseId?, createdBy?, importedFrom?, importedTo?, page?, size?, sort? }` | `{ content[], totalElements, totalPages, page, size, aggregates: {totalQuantity, totalValue} }` | safe (read) | AC-3, AC-4, AC-5, AC-6, AC-9 | — |
| DELETE | `/api/v2/opening-balances/{id}` | JWT + `X-Tenant-Id` + `X-Branch-Id` | — | `{ deletedId, cascadedRecomputedRows }` | idempotent (repeat → 404) | AC-11 | ADR-021 lock-check |

### 6.2 Modified REST endpoints (additive)

_(không có — cả 2 endpoint trên là additive mới, W04 lần đầu ratify §3b)._

### 6.3 Kafka topics (publish/consume)

_(không có — ADR-020 chốt "trigger từ Kafka event OB EDIT/DELETE ở future wave → không bắt buộc outbox ở W04 (call intra-service, sync REST trong cùng service)")._

### 6.4 Cross-boundary REST consumed (outbound — `gf-inventory` là consumer)

| Endpoint tiêu thụ | Owner boundary | Khi gọi | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/accounting-periods/lock-check?date={asOfDate}` | `gf-accounting` | Tại commit-path `DELETE /api/v2/opening-balances/{id}` (authoritative, trong transaction) | fail-CLOSED — `503 ERR-CMN-007` nếu downstream lỗi/timeout, KHÔNG xóa | Spring Retry 3 lần exponential backoff (100/200/400ms) + Resilience4j circuit breaker (50% failure rate, cửa sổ mở 60s); cache LRU TTL 30s scope `(tenantId, date)` |

> **Hand-off tới BFF**: `agg-garage-graph` (`FEAT-OB-LIST` BFF tier) wrap `search` thành query `searchOpeningBalances` và `DELETE /{id}` thành mutation `deleteOpeningBalanceLine`. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/OpeningBalanceLine.java` | REUSE (no change) | Entity đã tồn tại từ FEAT-OB-IMPORT | — | AC-3, AC-4, AC-5, AC-11 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/OpeningBalanceLineRepository.java` | ADDITIVE | new finder `searchByFilters()` + `deleteByIdAndTenant()` | ~35 | AC-4, AC-5, AC-6, AC-11 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/OpeningBalanceService.java` | ADDITIVE | new method `search()` (aggregate SUM) + `deleteSingle()` (lock-check + cascade orchestration) | ~140 | AC-3, AC-4, AC-5, AC-6, AC-9, AC-11 |
| `adapter/client` | `services/gf-inventory/src/main/java/.../adapter/client/GfAccountingClient.java` | REUSE nếu đã tạo cho ADR-021 khác (FEAT-OB-IMPORT/EDIT) trong cùng wave, else NEW | Spring `RestClient` bean `gfAccountingClient` — `lockCheck(date)` | ~40 (nếu NEW) | AC-11 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/OpeningBalanceController.java` | ADDITIVE (hoặc extend nếu class đã tạo bởi FEAT sibling) | new endpoint `search` + `delete` | ~55 | AC-3, AC-4, AC-5, AC-6, AC-9, AC-11 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/OpeningBalanceLineJpaRepository.java` | ADDITIVE | `Specification`/JPQL cho filter dynamic + `SUM` aggregate query | ~30 | AC-3, AC-4, AC-5 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/OpeningBalanceServiceTest.java` | ADDITIVE | test search filter combos + aggregate + delete guardrails | ~180 | AC-3, AC-4, AC-5, AC-6, AC-9, AC-11 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/OpeningBalanceControllerContractTest.java` | NEW | contract test 2 endpoints | ~90 | AC-3, AC-4, AC-5, AC-6, AC-9, AC-11 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema baseline (shared, owned by FEAT-OB-IMPORT)
    Entry: KG.entities stable + migration V{N+1}__inventory_v2_ob_ledger.sql applied
    Exit: opening_balance_line + inventory_stock_ledger deployed local
    └─► S2

S2  Repository + Service logic (search + delete orchestration, BR primary)
    Entry: S1
    Exit: unit test ≥8 green (search filter combos + aggregate + guardrails)
    └─► S3

S3  REST adapter (controller — search + delete)
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test (cross-boundary REST lock-check gf-accounting)
    Entry: S3 + gf-accounting lock-check endpoint stable
    Exit: integ test green (fail-CLOSED scenario covered)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema baseline (shared) | db/migration | KG stable | Migration verified (FEAT-OB-IMPORT owns) | — |
| S2 | Service logic (search + delete) | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + gf-accounting lock-check | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-OB-014` | CORNERSTONE | app/service (query layer — tenant scope + LIKE + filter + aggregate) | `app/service/OpeningBalanceService.java::search()` | AC-3, AC-4, AC-5, AC-6 | `TC-BR-gf-inventory-OB-014-*` |
| `BR-OB-DEL-002` | CORNERSTONE | app/service (cross-boundary lock-check, authoritative) | `app/service/OpeningBalanceService.java::deleteSingle()` | AC-11 | `TC-BR-gf-inventory-OB-DEL-002-*` |
| `BR-OB-DEL-003` | CORNERSTONE | domain/service (shared `StockLedgerRecomputeService`, invariant `closing_qty ≥ 0`) | `domain/service/StockLedgerRecomputeService.java` (ADR-020) | AC-11 | `TC-BR-gf-inventory-OB-DEL-003-*` |
| `BR-OB-CMN-001` | NORMAL | domain/model (pass-through field, write tại FEAT-OB-IMPORT) | `domain/model/OpeningBalanceLine.java` | AC-2 (display, secondary FE) | `TC-BR-gf-inventory-OB-CMN-001-*` |
| `BR-OB-CMN-002` | NORMAL | app/service (permission gate dual persona) | `app/service/OpeningBalanceService.java` | AC-9 | `TC-BR-gf-inventory-OB-CMN-002-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement (empty state, card layout, wording popup) → FE/Mobile tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-3 | Unit (aggregate SUM) + API contract | test-api | server-side `aggregates` theo filter hiện tại, không phải sum trang hiện tại |
| AC-4 | API contract (LIKE search) | test-api | keyword accent-insensitive trên mã/tên |
| AC-5 | API contract (filter combos) | test-api | warehouseId / createdBy / importedFrom+importedTo, AND kết hợp |
| AC-6 | API contract (pagination) | test-api | default page=0/size=20, size>100 → 400 |
| AC-9 | Isolation (RBAC + tenant) | test-isolation | dual persona ngang quyền; cross-tenant leak zero-tolerance |
| AC-11 | Integration (cross-boundary lock-check + cascade) | test-api | `gf-inventory` ↔ `gf-accounting` fail-CLOSED scenario + cascade tồn âm rollback |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-LIST.md` | N-A (chưa gen tại thời điểm author BE) | Resolver wrap `search` → query `searchOpeningBalances`; `DELETE /{id}` → mutation `deleteOpeningBalanceLine` |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-LIST.md` | N-A (chưa gen tại thời điểm author BE) | UI consume BFF ops cho AC-1, AC-2, AC-3b, AC-4, AC-5, AC-6, AC-7, AC-8, AC-10, AC-11 popup |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` | N-A (chưa gen tại thời điểm author BE) | Flutter consume BFF `searchOpeningBalances` (view-only) cho AC-1b, AC-2b, AC-3b-mobile, AC-4b, AC-5b, AC-5c, AC-6b |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8`.

## 12. References

- **Source**: [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) v9
- **Parent EP**: [`EP-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md)
- **BR refs**: [`BR-GF-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md) §6b.3
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §0 Wave Index (W04) + §3b (W04-1, W04-6) + §5.1 Naming Registry
- **ADR**: [ADR-009](../../../../../Architecture/decisions/ADR-009-jpa-no-relationship-mapping.md), [ADR-019](../../../../../Architecture/decisions/ADR-019-accounting-period-lock-check.md), [ADR-020](../../../../../Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md), [ADR-021](../../../../../Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md), [ADR-022](../../../../../Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-inventory.md`](../../../../../Architecture/integrations/) §13b (gf-accounting lock-check consumer)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v4
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-OB-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE (search + xóa 1 dòng + cross-boundary lock-check consumer), §3 BE behaviour map 18/18 AC-ID (5 real BE behaviour: AC-3/4/5/6/9 search cluster + AC-11 delete cluster; 12 N/A UI-only với lý do rõ ràng, trong đó AC-7/AC-8/AC-10 dẫn sang FEAT-OB-DELETE-LINES/FEAT-OB-IMPORT/FEAT-OB-EDIT theo citation trực tiếp từ `gf-inventory-api.md` §3b.1), §4 ràng buộc + error code, §5-§11 BE-specific (schema reference no-delta, REST W04-1+W04-6, Hexagonal file map, sequence DAG, BR primary, test hand-off, cross-tier pair). Source FEAT chỉ audit. **NEED CONFIRMATION**: bundle §C (AC index) trả về "không tìm thấy AC-ID" (extraction script gap) — author đã đọc trực tiếp source FEAT §2 để lấy đủ 18 AC-ID (AC-1, AC-1b, AC-2, AC-2b, AC-3, AC-3b, AC-3b-mobile, AC-4, AC-4b, AC-5, AC-5b, AC-5c, AC-6, AC-6b, AC-7, AC-8, AC-9, AC-10, AC-11); đề nghị fix `scripts/preflight-wave-spec-bundle.py` AC-ID regex để nhận diện pattern `**AC-N [platform-marker]**` (khác baseline `**AC-N**` thuần). |
