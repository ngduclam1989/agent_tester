---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-OB-IMPORT.md"
source_version: 20
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-IMPORT"
source_feat_sha: "a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán chọn file `.xlsx` đã parse ở FE (SheetJS) → BE `POST /api/v2/opening-balances/verify-import` validate cap 500 dòng + 10 loại lỗi + trả preview (`totalRows`/`validRows`/`errorRows` + `previewLines[]`); toàn bộ dòng hợp lệ → kế toán bấm Xác nhận → BE `POST /api/v2/opening-balances/import` ghi **all-or-nothing** vào `opening_balance_line` rồi cascade `StockLedgerRecomputeService` (ADR-020) → trả `{importedRows, cascadedKeys[]}`."
consumes_contracts:
  - "POST /api/v2/opening-balances/verify-import (self, W04-3)"
  - "POST /api/v2/opening-balances/import (self, W04-4)"
  - "GET /protected/v1/accounting-periods/lock-check (gf-accounting — ADR-021 V4-AP-LC; advisory fail-OPEN tại verify-import, authoritative fail-CLOSED tại import)"
paired_bff_feats: []
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  template_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-IMPORT.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-IMPORT (BE): Import tồn đầu kỳ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-IMPORT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `gf-accounting` (cross-boundary lock-check consumer) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán chọn file `.xlsx` đã parse ở FE (SheetJS) → BE `POST /api/v2/opening-balances/verify-import` validate cap 500 dòng + 10 loại lỗi + trả preview; toàn bộ dòng hợp lệ → bấm Xác nhận → BE `POST /api/v2/opening-balances/import` ghi **all-or-nothing** + cascade `StockLedgerRecomputeService` (ADR-020) |
| Cross-tier pair | BFF: N/A (pending fan-out) \| Web: N/A (pending fan-out) \| Mobile: — (out of scope — wizard là Web only per API doc §3b.4) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-IMPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) |
| Source version | v20 |
| Source SHA | `a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8` |
| Generated at | 2026-07-08T04:51:55+00:00 (bundle) |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần thiết lập nhanh số lượng và giá trị tồn kho khởi điểm (tồn đầu kỳ) theo mã sản phẩm nội bộ, thông qua file `.xlsx` mẫu kèm bước kiểm tra dữ liệu trước khi ghi — tránh sai số ảnh hưởng tới toàn bộ nghiệp vụ nhập/xuất kho phát sinh sau đó. Đây là điểm khởi tạo dữ liệu cho luồng "Tồn đầu kỳ": kết quả ghi vào `opening_balance_line` đồng thời khởi tạo sổ tồn point-in-time (`inventory_stock_ledger`, ADR-020) — nền tảng mà mọi phiếu nhập/xuất kho từ W05 trở đi ghi tiếp vào. Vì là baseline cho toàn bộ dữ liệu tồn kho, feature bắt buộc mô hình **all-or-nothing** — chỉ ghi khi toàn bộ dòng trong file hợp lệ, không chấp nhận ghi một phần.

## 2. Trách nhiệm backend (`gf-inventory`)

- Cung cấp 2 endpoint theo mô hình "wizard 2 bước, body JSON" (ADR-018/ADR-022): `POST /api/v2/opening-balances/verify-import` (preview, read-only) + `POST /api/v2/opening-balances/import` (commit, ghi dữ liệu).
- Resolve identifier nghiệp vụ từ file: `productCode` → `internal_product.id` (+ ĐVT chính snapshot), `warehouseName`/`warehouseId` → `warehouse.id`; validate 10+ business rule (mã tồn tại/ACTIVE, ĐVT khớp, số dương, kho tồn tại, trùng mã+kho, kỳ kế toán, cascade âm, thứ tự ngày so với phiếu đã ghi sổ).
- Enforce cap 500 dòng/lần (defense-in-depth cùng FE + BFF) + ngữ nghĩa file rỗng KHÔNG phải lỗi (`canCommit=false`, không throw mã lỗi).
- Cross-boundary REST consumer: gọi `gf-accounting GET /protected/v1/accounting-periods/lock-check` (ADR-021) — **advisory fail-OPEN** tại verify-import (kèm marker `warningLockCheckUnavailable` khi downstream lỗi), **authoritative fail-CLOSED** tại import (rollback nếu downstream lỗi/timeout).
- Commit **all-or-nothing** trong 1 `@Transactional`: bulk insert `opening_balance_line` (JPA batch_size=100) rồi cascade ghi sổ tồn qua `StockLedgerRecomputeService.recompute(...)` (ADR-020, BR-STKV2-001) cho mỗi `(tenant, product, warehouse)` bị chạm; kiểm tra invariant `closing_qty ≥ 0` — vi phạm → rollback toàn bộ (kể cả bulk insert đã chạy).
- Idempotency: `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` bắt buộc trên `import`, dedup 24h qua `processed_events`, replay trả cached response.
- Migration: **tạo mới** 2 bảng `opening_balance_line` + `inventory_stock_ledger` qua Flyway `V{N+1}__inventory_v2_ob_ledger.sql` (additive, ADR-009 scalar FK, tenant_id enforced) — FEAT này là write-path khởi tạo dữ liệu đầu tiên của epic; `FEAT-OB-LIST`/`FEAT-OB-EDIT`/`FEAT-OB-DELETE-LINES` chỉ tái sử dụng schema.

## 3. Hành vi cần triển khai (BE behaviour map)

> Coverage: 10/10 source AC-ID. **NEED CONFIRMATION**: bundle §C (AC index) chỉ liệt kê 9 AC-ID (thiếu `AC-3b` — cùng gap regex đã ghi nhận ở `FEAT-OB-LIST.md` Change Log, pattern `**AC-3b**` không match baseline `**AC-N**`). Author đã đọc trực tiếp source FEAT §2 để bổ sung `AC-3b` (Kiểm tra cấp file — .xlsx / file rỗng / >500 dòng) — đây là behaviour BE-relevant quan trọng nhất (defense-in-depth cap 500 + empty-file semantics), KHÔNG thể bỏ sót.

### Cluster A — Kiểm tra cấp file (defense-in-depth, cả 2 endpoint)

#### AC-3b → Kiểm tra cấp file + cap 500 dòng

- **Khi**: client gửi `POST /api/v2/opening-balances/verify-import` hoặc `POST /api/v2/opening-balances/import` với body JSON `{fileName, fileChecksum, rows[]}`.
- **BE phải**: (1) nếu body JSON malformed / thiếu field bắt buộc → `400 ERR-CMN-validation` (đây là lớp phòng thủ khi FE `.xlsx`-extension-check bị bypass — BE không bao giờ nhận binary `.xlsx`, chỉ nhận JSON đã parse); (2) đếm `rows.length` — nếu **> 500** → chặn toàn bộ request ngay, KHÔNG xử lý dòng nào, trả `ERR-INV-048` (BR-OB-004b) ở cả 2 endpoint; (3) nếu `rows.length == 0` (file rỗng, chỉ có header) → **KHÔNG throw lỗi** — verify-import trả `HTTP 200` với `totalRows=0/validRows=0/errorRows=0/canCommit=false/previewLines=[]` (canCommit=false vì `totalRows===0`, không có gì để commit; BA/PO chốt 2026-07-06 phương án (b)).
- **Output**: reject (`ERR-INV-048`) / pass-through xử lý per-row (Cluster B) / pass-through empty-result (verify-import only).
- **Failure mode**: `400 ERR-INV-048` (>500 dòng) · `400 ERR-CMN-validation` (malformed body / extension bypass).
- **Ref**: BR-OB-004b (§9), ADR-022 §"Enforce cap 500", entity `OpeningBalanceLine` (§5.1), endpoint `POST /verify-import` + `POST /import` (§6.1)

### Cluster B — Preview / validate từng dòng (verify-import, W04-3)

#### AC-4 → Hiển thị tổng quan (server tính toán)

- **Khi**: `verify-import` chạy xong toàn bộ `rows[]` (sau khi qua gate AC-3b).
- **BE phải**: tính `totalRows`/`validRows`/`errorRows`; gom `warehousesInFile[]` (distinct tên kho resolve được trong file, phục vụ card "Kho áp dụng" FE); build `previewLines[]` — mỗi item `{rowNumber, status: VALID|ERROR, resolvedProductCode?, resolvedWarehouseCode?, errors: [{code, field, message}]}`; tính `canCommit = (totalRows > 0 AND errorRows == 0)`.
- **Output**: response `{totalRows, validRows, errorRows, warehousesInFile[], previewLines[], canCommit}` (§6.1).
- **Failure mode**: không throw HTTP-level error cho case validate — mọi lỗi dòng nằm trong `previewLines[].errors[]`; ngoại lệ 502/503 khi `gf-accounting` unreachable (xem AC-5 lock-check).
- **Ref**: endpoint `POST /verify-import` (§6.1)

#### AC-5 → Trạng thái dòng + đánh dấu lỗi (10 loại validate)

- **Khi**: mỗi dòng trong `rows[]` được xử lý (sau gate AC-3b).
- **BE phải** chạy tuần tự các bước resolve + validate cho từng dòng:
  1. Resolve `productCode` → `internal_product` (cùng tenant) — không tồn tại → `ERR-INV-009`; tồn tại nhưng ngừng hoạt động → `ERR-INV-010`.
  2. Resolve ĐVT — ưu tiên canonical `mainUnitCode` nếu FE gửi, fallback `unitName` (v43 "Canonical + display coexist") — khớp `internal_product.main_unit_code` không → sai khác → `ERR-INV-019`.
  3. Resolve kho — ưu tiên canonical `warehouseId`, fallback `warehouseName` — không tồn tại trong danh mục kho của tenant → `ERR-INV-020`.
  4. Validate `quantity > 0` → vi phạm `ERR-INV-032`; `value ≥ 0` → vi phạm `ERR-INV-033`.
  5. Validate trường bắt buộc thiếu → `ERR-INV-017`; `asOfDate` sai định dạng `YYYY-MM-DD` → `ERR-INV-018`.
  6. Gọi lock-check `gf-accounting` (advisory, per distinct `asOfDate`, LRU cache 30s) — `locked=true` → `ERR-INV-024`.
  7. Kiểm tra trùng `(productCode, warehouseCode)` — với OB đã import trước đó **hoặc** với dòng khác trong cùng file → `ERR-INV-034` (BR-OB-012, mỗi mã+kho chỉ 1 OB).
  8. Simulate cascade point-in-time — nếu chèn OB làm tồn `(mã+kho)` âm tại bất kỳ ngày nào từ `asOfDate` trở đi → `ERR-INV-036`.
  9. Kiểm tra `asOfDate` phải **trước** mọi phiếu nhập/xuất đã ghi sổ của `(mã+kho)` — vi phạm (sau/cùng ngày) → `ERR-INV-035`.
- **Output**: `previewLines[N].status = ERROR` + `errors[]` liệt kê toàn bộ vi phạm của dòng đó (không early-return per-row — khác với gate cấp file AC-3b vốn early-return cho cả request); dòng không vi phạm → `status = VALID`.
- **Failure mode**: N/A ở tầng HTTP (đây là preview, lỗi nằm trong body response) — ngoại lệ `502`/`503` khi `gf-accounting` lock-check unreachable → response kèm `warningLockCheckUnavailable: true` cho các dòng có `asOfDate` chưa xác định được trạng thái kỳ, FE disable nút Xác nhận.
- **Ref**: BR-OB-006, BR-OB-007, BR-OB-010, BR-OB-005, BR-OB-008, BR-OB-009, BR-OB-011, BR-OB-013, BR-OB-012, BR-OB-015, BR-OB-016 (§9), ADR-021, entity `OpeningBalanceLine` (§5.1), endpoint `POST /verify-import` (§6.1)

### Cluster C — Commit all-or-nothing (import, W04-4)

#### AC-6 → Xác nhận import (all-or-nothing + cascade sổ tồn)

- **Khi**: client gửi `POST /api/v2/opening-balances/import` với **cùng payload** đã verify PASS (`X-Idempotency-Key` bắt buộc).
- **BE phải** trong 1 `@Transactional`:
  1. Re-run toàn bộ validate Cluster A + Cluster B (defense-in-depth, không tin kết quả verify trước đó của client).
  2. Nếu **≥ 1 dòng lỗi** (kể cả trùng mã+kho theo BR-OB-012) → throw → **rollback toàn bộ**, KHÔNG ghi dòng nào (BR-OB-004a) — response trả `{errorCode, errorRows: [...]}`.
  3. Re-check lock-check **authoritative** cho mỗi ngày distinct trong `rows[]` — `locked=true` hoặc downstream lỗi/timeout → **fail-CLOSED**, rollback, `ERR-INV-024` hoặc `503 ERR-CMN-007`.
  4. Bulk insert `opening_balance_line` (JPA `batch_size=100`) — mỗi dòng ghi 3 nhóm field: **(a) nghiệp vụ** (`product_id`/`product_code`/`product_name` resolve, `warehouse_id`/`warehouse_code` resolve, `main_unit_code` server-derive, `quantity`, `value`, `as_of_date`); **(b) tenant + audit server-derive** (`tenant_id`/`garage_id` từ `TenantContext` — Critical Rule #10, `created_by` từ auth context, `created_at` server timestamp, `source_filename`/`source_checksum` SHA-256); **(c) system key** (`id`).
  5. Với mỗi `(tenant, product, warehouse)` distinct bị chạm → gọi `StockLedgerRecomputeService.recompute(fromDate = min(asOfDate) cho key đó)` (ADR-020, BR-STKV2-001).
  6. Kiểm tra invariant `closing_qty ≥ 0` tại mọi ngày sau cascade — vi phạm → throw `ERR-INV-036` → **rollback toàn bộ transaction** (undo cả bước 4 lẫn 5).
- **Output**: `200 {totalRows, importedRows (= totalRows), importedAt, importedBy, fileName, fileChecksum, cascadedKeys[]}`.
- **Failure mode**: `400` (row error / trùng mã+kho) · `400 ERR-INV-036` (cascade âm, rollback) · `409` (idempotency key đã dùng trong 24h → trả cached response `200` với `alreadyImported: true`, KHÔNG ghi lại) · `503 ERR-CMN-007` (gf-accounting down, fail-CLOSED, rollback).
- **Ref**: BR-OB-004a, BR-STKV2-001 (§9), ADR-020, ADR-021, ADR-022, entity `OpeningBalanceLine` + `InventoryStockLedger` (§5.1), endpoint `POST /import` (§6.1)

#### AC-8 → Audit trail cho kết quả import (data only — toast UI ở fe-web)

- **Khi**: `import` commit thành công (bước 6 AC-6 pass).
- **BE phải**: trả đủ field audit trong response (`importedAt`, `importedBy`, `fileName`, `fileChecksum`) để FE render toast + để các field này persist trong `opening_balance_line` (`created_by`, `created_at`, `source_filename`, `source_checksum`) — tra cứu lại được qua `FEAT-OB-LIST` (cột Người import / Ngày import). BE **không có** endpoint "màn kết quả" riêng — chỉ trả trong response của `POST /import`.
- **Output**: response `POST /import` (§6.1); dữ liệu audit persist trong entity `OpeningBalanceLine` (§5.1).
- **Failure mode**: N/A (case thành công; lỗi xem AC-6).
- **Ref**: BR-OB-CMN-001 (§9), endpoint `POST /import` (§6.1); toast rendering + điều hướng → xem `fe-web/FEAT-OB-IMPORT.md §3 AC-8`.

### Cluster D — Phân quyền

#### AC-9 → Phân quyền import

- **Khi**: mọi request tới `verify-import` hoặc `import`.
- **BE phải**: enforce `TenantFilter` (`X-Tenant-Id` phải match tenant của JWT — Critical Rule #4); cho phép `accountant` + `garage-owner` ngang quyền (không phân biệt vai trò cho 2 endpoint thuộc FEAT này); gate `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController`.
- **Output**: request hợp lệ → xử lý bình thường; tenant mismatch → chặn; flag off → chặn.
- **Failure mode**: `403` tenant mismatch · `403` flag `Inventory:InventoryV2` chưa bật cho tenant.
- **Ref**: BR-OB-CMN-002 (§9), §4.2 Tenant + auth

### Cluster E — UI-only (N/A cho BE)

#### AC-1 → N/A (UI-only)

- Mở màn "Tải lên danh sách tồn đầu kỳ" (single page, không wizard stepper) — layout + header actions là UI concern. Xem `fe-web/FEAT-OB-IMPORT.md §3 AC-1`.

#### AC-2 → N/A (UI-only, FE bundled static asset — không có BE endpoint)

- Link tải file template `.xlsx` (2 tab: "Danh sách tồn sản phẩm" + "ĐVT") — theo ADR-022 §"Parse file — CHỈ browser-side ở FE", template là **FE bundled static asset** sync từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx`, **KHÔNG có BE endpoint, KHÔNG S3, KHÔNG call qua BFF** (BA/PO chốt 2026-07-06, endpoint đề xuất ban đầu W04-2 đã bị xóa khỏi API doc §3b). Xem `fe-web/FEAT-OB-IMPORT.md §3 AC-2`.

#### AC-3 → N/A (UI-only, client-side browser parse)

- Chọn file kéo-thả / nhấn chọn — BE **không bao giờ nhận binary `.xlsx`**; FE parse `.xlsx` browser-side qua SheetJS (ADR-022 §"Parse file") rồi submit JSON body qua `verify-import`/`import` (Cluster A/B/C). Card file + hiển thị preview inline là UI concern. Xem `fe-web/FEAT-OB-IMPORT.md §3 AC-3`.

#### AC-7 → N/A (UI-only)

- Nút "Huỷ bỏ" / back arrow — đóng màn, quay về `FEAT-OB-LIST`, không gọi BE. Xem `fe-web/FEAT-OB-IMPORT.md §3 AC-7`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-OB-004a** (CORNERSTONE): all-or-nothing — chỉ ghi khi toàn bộ dòng hợp lệ; ≥1 dòng lỗi → chặn cả file, rollback toàn bộ, không ghi dòng nào — enforce tại `app/service` trong 1 `@Transactional`.
- **BR-OB-004b** (CORNERSTONE): cap 500 dòng/lần + validate cấp file (định dạng, file rỗng) — enforce defense-in-depth tại `app/service` (cả `verify-import` lẫn `import`). Vi phạm → `ERR-INV-048` HTTP 400.
- **BR-OB-005** (NORMAL): kho phải tồn tại trong danh mục kho của tenant. Vi phạm → `ERR-INV-020`.
- **BR-OB-006 / 007** (CORNERSTONE): mã sản phẩm nội bộ phải tồn tại + ACTIVE. Vi phạm → `ERR-INV-009` / `ERR-INV-010`.
- **BR-OB-008 / 009** (NORMAL): `quantity > 0`, `value ≥ 0`. Vi phạm → `ERR-INV-032` / `ERR-INV-033`.
- **BR-OB-010** (CORNERSTONE): ĐVT trong file phải khớp ĐVT chính của mã sản phẩm (kể cả ĐVT quy đổi cũng lỗi). Vi phạm → `ERR-INV-019`.
- **BR-OB-011** (NORMAL): trường bắt buộc + định dạng ngày `YYYY-MM-DD`. Vi phạm → `ERR-INV-017` / `ERR-INV-018`.
- **BR-OB-012** (CORNERSTONE): OB duy nhất theo `(mã + kho)` — trùng (cùng file hoặc với OB đã import) → CHẶN. Vi phạm → `ERR-INV-034`.
- **BR-OB-013** (CORNERSTONE): chặn import dòng có `asOfDate` thuộc kỳ kế toán đã đóng (cross-boundary lock-check `gf-accounting`, ADR-021); ngày không thuộc kỳ nào → cho phép. Vi phạm → `ERR-INV-024`.
- **BR-OB-015** (CORNERSTONE): chặn nếu chèn OB làm tồn `(mã+kho)` âm tại bất kỳ thời điểm nào từ `asOfDate` trở đi (invariant `StockLedgerRecomputeService`, ADR-020 bước 5). Vi phạm → `ERR-INV-036`.
- **BR-OB-016** (CORNERSTONE): `asOfDate` phải **trước** mọi phiếu nhập/xuất đã ghi sổ của `(mã+kho)` — OB là điểm khởi đầu. Vi phạm → `ERR-INV-035`.
- **BR-STKV2-001** (CORNERSTONE): import OB hợp lệ → trigger `StockLedgerRecomputeService` cascade tính lại tồn cuối ngày (tình huống #1 trong 5 tình huống cập nhật sổ tồn). Enforce tại `domain/service` (shared engine, ADR-020).
- **BR-OB-CMN-001** (NORMAL): mỗi dòng OB phải mang `created_by`/`created_at`/`source_filename`/`source_checksum` (server derive tại write-path này).
- **BR-OB-CMN-002** (NORMAL): permission gate `accountant` + `garage-owner` ngang quyền cho cả 2 endpoint.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` (+ `X-Branch-Id`) qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `verify-import` + `import` yêu cầu JWT hợp lệ + tenant khớp; không phân biệt role giữa `accountant` và `garage-owner`.
- Toàn bộ endpoint OB gate bởi `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController` — tenant chưa bật flag → HTTP 403.

### 4.3 Idempotency + concurrency

- `POST /verify-import`: read-only preview — idempotent tự nhiên (cùng payload → cùng response, cache-friendly), không cần idempotency key.
- `POST /import`: **bắt buộc** `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` — dedup 24h qua `processed_events` (per `gf-inventory-HLD.md §5`); replay trong window → trả cached response `200` kèm `alreadyImported: true`, KHÔNG ghi lại.
- Commit chạy trong 1 `@Transactional` bao trọn: re-validate → re-check lock-check → bulk insert → cascade recompute → invariant check. Redisson lock key `stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}` (timeout 30s) ngăn 2 write-path chạy đồng thời trên cùng `(product, warehouse)` — concurrency giữa các key khác vẫn OK.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-3b | INLINE (malformed body / extension bypass) |
| `ERR-INV-048` | 400 | AC-3b | TOAST (vượt 500 dòng/lần import) |
| `ERR-INV-009` | 400 | AC-5 | INLINE (mã sản phẩm không tồn tại) |
| `ERR-INV-010` | 400 | AC-5 | INLINE (mã sản phẩm ngừng hoạt động) |
| `ERR-INV-017` | 400 | AC-5 | INLINE (thiếu trường bắt buộc) |
| `ERR-INV-018` | 400 | AC-5 | INLINE (sai định dạng ngày) |
| `ERR-INV-019` | 400 | AC-5 | INLINE (ĐVT khác ĐVT chính) |
| `ERR-INV-020` | 400 | AC-5 | INLINE (kho không tồn tại) |
| `ERR-INV-024` | 400 | AC-5 (preview) / AC-6 (commit) | INLINE (preview) / TOAST (commit — kỳ kế toán đã đóng) |
| `ERR-INV-032` | 400 | AC-5 | INLINE (SL tồn ≤ 0) |
| `ERR-INV-033` | 400 | AC-5 | INLINE (giá trị tồn < 0) |
| `ERR-INV-034` | 400 | AC-5, AC-6 | INLINE (trùng mã+kho) |
| `ERR-INV-035` | 400 | AC-5 | INLINE (ngày sau/cùng ngày phiếu) |
| `ERR-INV-036` | 400 | AC-5 (preview simulate) / AC-6 (commit) | INLINE (preview) / TOAST (commit — cascade tồn âm) |
| `409` idempotency replay | 409/200 | AC-6 | TOAST INFO (đã import trước đó — hiển thị kết quả cached) |
| `ERR-CMN-007` | 503 | AC-6 | TOAST (gf-accounting lock-check unavailable, fail-CLOSED, retry) |

---

## 5. Schema delta (BE — contract focus)

> FEAT này là write-path khởi tạo dữ liệu đầu tiên của epic — **tạo mới** cả 2 bảng qua Flyway `V{N+1}__inventory_v2_ob_ledger.sql` (additive, ADR-009 scalar FK, tenant_id enforced). `FEAT-OB-LIST` / `FEAT-OB-EDIT` / `FEAT-OB-DELETE-LINES` (cùng wave) tái sử dụng schema này (no-delta).

### 5.1 Entity changes — `gf-inventory`

**`opening_balance_line`** (NEW table):

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `opening_balance_line` | `id` | `BIGINT` | N | auto (identity) | Flyway V{N+1} | — | — | PK |
| `opening_balance_line` | `tenant_id` | `BIGINT` | N | — | Flyway V{N+1} | BR-OB-CMN-002 | AC-9 | tenant scope mọi query |
| `opening_balance_line` | `garage_id` | `BIGINT` | N | — | Flyway V{N+1} | — | AC-9 | branch scope (`X-Branch-Id`) |
| `opening_balance_line` | `product_id` | `BIGINT` | N | — | Flyway V{N+1} | BR-OB-006 | AC-5 | scalar FK `internal_product.id` (ADR-009, no JPA relationship) |
| `opening_balance_line` | `product_code` | `VARCHAR(64)` | N | — | Flyway V{N+1} | BR-OB-001 | AC-5 | snapshot, dùng LIKE search (`FEAT-OB-LIST`) |
| `opening_balance_line` | `product_name` | `VARCHAR(255)` | N | — | Flyway V{N+1} | BR-OB-001 | AC-5 | snapshot |
| `opening_balance_line` | `warehouse_id` | `BIGINT` | N | — | Flyway V{N+1} | BR-OB-005 | AC-5 | scalar FK `warehouse.id` (ADR-009) |
| `opening_balance_line` | `warehouse_code` | `VARCHAR(64)` | N | — | Flyway V{N+1} | BR-OB-005 | AC-5 | snapshot |
| `opening_balance_line` | `main_unit_code` | `VARCHAR(32)` | N | — | Flyway V{N+1} | BR-OB-010 | AC-5 | snapshot `internal_product.main_unit_code`, server-enforced khớp (không lấy trực tiếp từ file khi có mismatch) |
| `opening_balance_line` | `quantity` | `DECIMAL(18,6)` | N | — | Flyway V{N+1} | BR-OB-008 | AC-6 | SL tồn (> 0); nguồn SUM cho `aggregates` (`FEAT-OB-LIST`) |
| `opening_balance_line` | `value` | `DECIMAL(18,2)` | N | — | Flyway V{N+1} | BR-OB-009 | AC-6 | GT tồn (≥ 0) |
| `opening_balance_line` | `as_of_date` | `DATE` | N | — | Flyway V{N+1} | BR-OB-002, BR-OB-013 | AC-5, AC-6 | "Tồn đến ngày" — tham số lock-check + cascade recompute |
| `opening_balance_line` | `source_filename` | `VARCHAR(255)` | Y | `NULL` | Flyway V{N+1} | BR-OB-CMN-001 | AC-8 | audit tên file import |
| `opening_balance_line` | `source_checksum` | `VARCHAR(128)` | Y | `NULL` | Flyway V{N+1} | BR-OB-CMN-001 | AC-8 | audit SHA-256 nội dung file |
| `opening_balance_line` | `created_by` | `VARCHAR(255)` | N | — | Flyway V{N+1} | BR-OB-CMN-001 | AC-6, AC-8 | userId từ auth context |
| `opening_balance_line` | `created_at` | `TIMESTAMPTZ` | N | `now()` | Flyway V{N+1} | BR-OB-CMN-001 | AC-6, AC-8 | server timestamp |

**`inventory_stock_ledger`** (NEW table, ADR-020 point-in-time daily snapshot):

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `inventory_stock_ledger` | `id` | `BIGINT` | N | auto (identity) | Flyway V{N+1} | — | — | PK |
| `inventory_stock_ledger` | `tenant_id` | `BIGINT` | N | — | Flyway V{N+1} | — | AC-6 | tenant scope |
| `inventory_stock_ledger` | `garage_id` | `BIGINT` | N | — | Flyway V{N+1} | — | AC-6 | branch scope |
| `inventory_stock_ledger` | `product_id` | `BIGINT` | N | — | Flyway V{N+1} | — | AC-6 | scalar FK (ADR-009) |
| `inventory_stock_ledger` | `product_code` | `VARCHAR(64)` | N | — | Flyway V{N+1} | — | AC-6 | denormalized snapshot cho query |
| `inventory_stock_ledger` | `warehouse_id` | `BIGINT` | N | — | Flyway V{N+1} | — | AC-6 | scalar FK (ADR-009) |
| `inventory_stock_ledger` | `warehouse_code` | `VARCHAR(64)` | N | — | Flyway V{N+1} | — | AC-6 | denormalized snapshot |
| `inventory_stock_ledger` | `movement_date` | `DATE` | N | — | Flyway V{N+1} | BR-STKV2-001 | AC-6 | point-in-time key — 1 row/ngày có biến động |
| `inventory_stock_ledger` | `inbound_qty` / `inbound_value` | `DECIMAL(18,6)` / `DECIMAL(18,2)` | N | — | Flyway V{N+1} | ADR-020 v6 | AC-6 | SL/GT nhập ngày. **OB baseline row** = `opening_balance_line.quantity_on_hand`/`value_on_hand` (OB là "nhập lần đầu" của mã+kho — ADR-020 v6 uniform formula, override v5 "given closing_qty"; NXT report BR-STKV2-010 SUM bao gồm OB row) |
| `inventory_stock_ledger` | `outbound_qty` / `outbound_value` | `DECIMAL(18,6)` / `DECIMAL(18,2)` | N | — | Flyway V{N+1} | ADR-020 | AC-6 | SL/GT xuất ngày (0 tại OB import — không có xuất) |
| `inventory_stock_ledger` | `closing_qty` / `closing_value` | `DECIMAL(18,6)` / `DECIMAL(18,2)` | N | — | Flyway V{N+1} | ADR-020 v6, BR-OB-015 | AC-6 | tồn cuối ngày **running formula uniform cho MỌI row**: `closing_N = closing_{N-1} + inbound_N − outbound_N` (row đầu chuỗi: `previous_closing=0` → `closing = inbound`); invariant `closing_qty ≥ 0` |
| `inventory_stock_ledger` | `origin_context` | `VARCHAR(16)` enum `OB_IMPORT\|OB_EDIT\|OB_DELETE\|RECEIPT\|DELIVERY\|PRICE_RECALC` | N | — | Flyway V{N+1} | ADR-020 §C3 | AC-6 | audit chain-of-cause; FEAT này ghi `OB_IMPORT` |
| `inventory_stock_ledger` | `updated_at` | `TIMESTAMPTZ` | N | `now()` | Flyway V{N+1} | — | AC-6 | |

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `opening_balance_line` | `idx_ob_tenant_created` | `(tenant_id, created_at DESC)` | btree | Default sort danh sách (`FEAT-OB-LIST`) | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_warehouse_asof` | `(tenant_id, warehouse_id, as_of_date)` | btree | Filter Kho + asOfDate | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_created_by` | `(tenant_id, created_by)` | btree | Filter Người import | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_asof` | `(tenant_id, as_of_date)` | btree | Hỗ trợ lock-check theo ngày | HLD §6b.3 |
| `opening_balance_line` | `uq_ob_tenant_product_warehouse` | `(tenant_id, product_id, warehouse_id)` | unique btree | **BR-OB-012** — mỗi (mã+kho) chỉ 1 OB; enforce ở DB layer (secondary defense sau app validate `ERR-INV-034`) | BR-OB-012 |
| `inventory_stock_ledger` | `idx_ledger_lookup` | `(tenant_id, product_id, warehouse_id, movement_date DESC)` | btree — critical | Cascade recompute lookup (AC-6, ADR-020) + read "gần nhất ≤ D" | HLD §6b.3, ADR-020 |
| `inventory_stock_ledger` | `uq_ledger_tenant_product_warehouse_date` | `(tenant_id, product_id, warehouse_id, movement_date)` | unique btree | ADR-020 — 1 row/ngày có biến động cho mỗi key | ADR-020 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/opening-balances/verify-import` | JWT + `X-Tenant-Id` + `X-Branch-Id` | `{ fileName, fileChecksum, rows[]: [{ rowNumber, productCode, productName?, unitName, mainUnitCode?, warehouseName, warehouseId?, quantity, value, asOfDate }] }` (1..500 rows) | `{ totalRows, validRows, errorRows, warehousesInFile[], previewLines[]: [{rowNumber, status, resolvedProductCode?, resolvedWarehouseCode?, errors[]}], canCommit }` | safe (read-only preview) | AC-3b, AC-4, AC-5 | ADR-021 lock-check (advisory) |
| POST | `/api/v2/opening-balances/import` | JWT + `X-Tenant-Id` + `X-Branch-Id` + `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` | cùng schema với `verify-import` | `{ totalRows, importedRows, importedAt, importedBy, fileName, fileChecksum, cascadedKeys[]: [{productCode, warehouseCode, fromDate, affectedRows}] }` | client idempotency-key, dedup 24h | AC-3b, AC-6, AC-8 | ADR-021 lock-check (authoritative) |

> **Field-level detail** (canonical + display coexist v43, per `Architecture/api/gf-inventory-api.md §3b.2 W04-3/W04-4`): mỗi row carry cả canonical (`mainUnitCode`, `warehouseId` — optional, ưu tiên nếu FE gửi) và display fallback (`unitName`, `warehouseName` — bắt buộc, dùng khi canonical thiếu). Mismatch giữa canonical + display khi cả 2 present → `ERR-INV-019` (unit) / `ERR-INV-020` (warehouse).

### 6.2 Modified REST endpoints (additive)

_(không có — cả 2 endpoint là additive mới, W04 lần đầu ratify §3b.2 W04-3/W04-4)._

### 6.3 Kafka topics (publish/consume)

_(không có — ADR-020 chốt "trigger từ Kafka event OB EDIT/DELETE ở future wave → không bắt buộc outbox ở W04 (call intra-service, sync REST trong cùng service)")._

### 6.4 Cross-boundary REST consumed (outbound — `gf-inventory` là consumer)

| Endpoint tiêu thụ | Owner boundary | Khi gọi | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (V4-AP-LC) | `gf-accounting` | Per distinct `asOfDate` — advisory tại `verify-import` (preview), authoritative tại `import` (trong transaction, ADR-021) | **Fail-OPEN kèm marker** tại verify-import (`warningLockCheckUnavailable: true`, nút Xác nhận vẫn disabled cho dòng chưa xác định) · **Fail-CLOSED** tại import (`503 ERR-CMN-007`, rollback) | Spring Retry 3 lần exponential backoff (100/200/400ms) + Resilience4j circuit breaker (50% failure rate, cửa sổ mở 60s); LRU cache TTL 30s scope `(tenantId, date)` |

> **Hand-off tới BFF**: `agg-garage-graph` sẽ wrap `verify-import` thành mutation `verifyImportOpeningBalances` và `import` thành mutation `importOpeningBalances` (per `gf-inventory-api.md §3b.4` UI mapping). KHÔNG describe GraphQL ở đây — đó là BFF tier territory (tier file chưa gen tại thời điểm author BE — xem §11).

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/OpeningBalanceLine.java` | NEW | entity mới — write-path khởi tạo | ~60 | AC-6 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InventoryStockLedger.java` | NEW | entity mới — write-path khởi tạo | ~70 | AC-6 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/OpeningBalanceLineRepository.java` | NEW | finder `existsByTenantAndProductAndWarehouse()`, `saveAll()` | ~30 | AC-5, AC-6 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InventoryStockLedgerRepository.java` | NEW | finder cho recompute lookup | ~30 | AC-6 |
| `domain/service` | `services/gf-inventory/src/main/java/.../domain/service/StockLedgerRecomputeService.java` | NEW (shared engine, ADR-020 — `FEAT-OB-LIST`/`FEAT-OB-EDIT`/`FEAT-OB-DELETE-LINES` REUSE khi build sau) | `recompute(tenantId, productCode, warehouseCode, fromDate)` — delete + rebuild forward, invariant check | ~150 | AC-6 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/OpeningBalanceImportService.java` | NEW | `verify(request)` (Cluster A/B logic) + `commit(request)` (Cluster C — all-or-nothing + cascade orchestration) | ~220 | AC-3b, AC-4, AC-5, AC-6, AC-8, AC-9 |
| `adapter/client` | `services/gf-inventory/src/main/java/.../adapter/client/GfAccountingClient.java` | NEW (hoặc REUSE nếu sibling FEAT trong cùng wave đã tạo trước) | Spring `RestClient` bean `gfAccountingClient` — `lockCheck(date)` với circuit breaker + retry | ~40 | AC-5, AC-6 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/OpeningBalanceController.java` | NEW (hoặc extend nếu class đã tạo bởi FEAT sibling) | `@FeatureOn(Inventory:InventoryV2)` class-level; endpoint `verify-import` + `import` | ~50 | AC-3b, AC-4, AC-5, AC-6, AC-9 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/OpeningBalanceLineJpaRepository.java` | NEW | Spring Data JPA + unique constraint mapping | ~20 | AC-6 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/InventoryStockLedgerJpaRepository.java` | NEW | Spring Data JPA + bulk delete/insert cho recompute | ~30 | AC-6 |
| `db/migration` | `services/gf-inventory/src/main/resources/db/migration/V{N+1}__inventory_v2_ob_ledger.sql` | NEW | Flyway additive — tạo 2 bảng + index (§5) | ~60 | AC-6 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/OpeningBalanceImportServiceTest.java` | NEW | test 10 loại validate + all-or-nothing + cascade + idempotency replay | ~220 | AC-3b, AC-4, AC-5, AC-6, AC-8, AC-9 |
| `test/unit` | `services/gf-inventory/src/test/java/.../domain/service/StockLedgerRecomputeServiceTest.java` | NEW | test recompute invariant `closing_qty ≥ 0` | ~120 | AC-6 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/OpeningBalanceImportControllerContractTest.java` | NEW | contract test 2 endpoints | ~100 | AC-3b, AC-4, AC-5, AC-6, AC-9 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema migration (2 bảng mới, ADR-009 scalar FK)
    Entry: KG.entities stable, ADR-020/021/022 ratified
    Exit: schema deployed local, migration test green
    └─► S2

S2  Repository + Service logic (validate 10 loại + all-or-nothing + cascade orchestration, BR enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green (bao gồm StockLedgerRecomputeService invariant test)
    └─► S3

S3  REST adapter (controller — verify-import + import)
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test (cross-boundary REST lock-check gf-accounting — fail-OPEN verify / fail-CLOSED import)
    Entry: S3 + gf-accounting lock-check endpoint (V4-AP-LC) stable
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema migration (2 bảng mới) | db/migration | KG stable | Migration test green | — |
| S2 | Entity + service logic (validate + commit + cascade) | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + gf-accounting lock-check | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-OB-004a` | CORNERSTONE | app/service (transaction boundary) | `app/service/OpeningBalanceImportService.java::commit()` | AC-6 | `TC-BR-gf-inventory-OB-004a-*` |
| `BR-OB-004b` | CORNERSTONE | app/service (defense-in-depth) | `app/service/OpeningBalanceImportService.java::verify()`/`commit()` | AC-3b | `TC-BR-gf-inventory-OB-004b-*` |
| `BR-OB-005` | NORMAL | app/service (resolve warehouse) | `app/service/OpeningBalanceImportService.java::resolveRow()` | AC-5 | `TC-BR-gf-inventory-OB-005-*` |
| `BR-OB-006` / `BR-OB-007` | CORNERSTONE | app/service (resolve product) | `app/service/OpeningBalanceImportService.java::resolveRow()` | AC-5 | `TC-BR-gf-inventory-OB-006-*` |
| `BR-OB-008` / `BR-OB-009` | NORMAL | app/service (row validate) | `app/service/OpeningBalanceImportService.java::validateRow()` | AC-5 | `TC-BR-gf-inventory-OB-008-*` |
| `BR-OB-010` | CORNERSTONE | app/service (resolve unit) | `app/service/OpeningBalanceImportService.java::resolveRow()` | AC-5 | `TC-BR-gf-inventory-OB-010-*` |
| `BR-OB-011` | NORMAL | app/service (row validate) | `app/service/OpeningBalanceImportService.java::validateRow()` | AC-5 | `TC-BR-gf-inventory-OB-011-*` |
| `BR-OB-012` | CORNERSTONE | app/service (primary) + repository unique constraint (secondary) | `app/service/OpeningBalanceImportService.java::validateDuplicate()` + `uq_ob_tenant_product_warehouse` | AC-5, AC-6 | `TC-BR-gf-inventory-OB-012-*` |
| `BR-OB-013` | CORNERSTONE | app/service (cross-boundary lock-check) | `app/service/OpeningBalanceImportService.java::checkLock()` | AC-5, AC-6 | `TC-BR-gf-inventory-OB-013-*` |
| `BR-OB-015` | CORNERSTONE | domain/service (shared `StockLedgerRecomputeService`, invariant) | `domain/service/StockLedgerRecomputeService.java` (ADR-020) | AC-5, AC-6 | `TC-BR-gf-inventory-OB-015-*` |
| `BR-OB-016` | CORNERSTONE | app/service (order check vs phiếu đã ghi sổ) | `app/service/OpeningBalanceImportService.java::validateOrder()` | AC-5 | `TC-BR-gf-inventory-OB-016-*` |
| `BR-STKV2-001` | CORNERSTONE | domain/service (shared engine trigger) | `domain/service/StockLedgerRecomputeService.java` (ADR-020) | AC-6 | `TC-BR-gf-inventory-STKV2-001-*` |
| `BR-OB-CMN-001` | NORMAL | app/service (audit derive) | `app/service/OpeningBalanceImportService.java::commit()` | AC-6, AC-8 | `TC-BR-gf-inventory-OB-CMN-001-*` |
| `BR-OB-CMN-002` | NORMAL | app/service (permission gate) | `app/service/OpeningBalanceImportService.java` | AC-9 | `TC-BR-gf-inventory-OB-CMN-002-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense — vd `uq_ob_tenant_product_warehouse`).
> - UI/client-side enforcement (drop zone hint, badge màu, wording rút gọn) → FE tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-3b | API contract (cap 500 + empty-file semantic) | test-api | verify `ERR-INV-048` khi >500, `canCommit=false` không throw khi empty |
| AC-4 | API contract (aggregate counts) | test-api | `totalRows`/`validRows`/`errorRows` khớp `previewLines[]` |
| AC-5 | Unit (10 loại validate) + API contract | test-api | resolve productCode/unit/warehouse, canonical + display coexist fallback |
| AC-6 | Integration (all-or-nothing + cascade + cross-boundary lock-check) | test-api | rollback scenario (any row error / cascade âm / lock-check down); idempotency replay |
| AC-8 | API contract (audit field trong response) | test-api | `importedAt`/`importedBy`/`fileName`/`fileChecksum` khớp entity persist |
| AC-9 | Isolation (RBAC + tenant) | test-isolation | dual persona ngang quyền; flag `Inventory:InventoryV2` off → 403 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-IMPORT.md` | N-A (chưa gen tại thời điểm author BE) | Resolver wrap `verify-import` → mutation `verifyImportOpeningBalances`; `import` → mutation `importOpeningBalances` |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-IMPORT.md` | N-A (chưa gen tại thời điểm author BE) | UI consume BFF ops cho AC-1, AC-2, AC-3, AC-4 (render 3 thẻ + bảng), AC-5 (badge trạng thái), AC-6 (nút Xác nhận + disable), AC-7, AC-8 (toast) |
| Mobile | — | out of scope | Wizard import chỉ **Web only** theo `Architecture/api/gf-inventory-api.md §3b.4 UI Action mapping` — App Garage không có entry point cho FEAT-OB-IMPORT ở W04 |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = a236e4413e8321df58c435948cc37455c86e3589452c10a9c1216c20023e82e8`.

## 12. References

- **Source**: [`Product/features/FEAT-OB-IMPORT.md`](../../../../../Product/features/FEAT-OB-IMPORT.md) v20
- **Parent EP**: [`EP-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md)
- **BR refs**: [`BR-GF-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md) §6b.3
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §0 Wave Index (W04) + §3b.2 (W04-3, W04-4) + §3b.3 (error codes) + §5.1 Naming Registry
- **ADR**: [ADR-009](../../../../../Architecture/decisions/ADR-009-jpa-no-relationship-mapping.md), [ADR-018](../../../../../Architecture/decisions/ADR-018-inventory-v2-bulk-import-pattern.md), [ADR-020](../../../../../Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md), [ADR-021](../../../../../Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md), [ADR-022](../../../../../Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-inventory.md`](../../../../../Architecture/integrations/) §13b (gf-accounting lock-check consumer)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v4
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Sibling BE tier (cùng wave, no-delta schema reuse)**: [`FEAT-OB-LIST.md`](FEAT-OB-LIST.md)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 3 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Cascade ADR-020 v6 uniform running formula** cho §5.1 entity col table `inventory_stock_ledger`. Sub-edits: (1) row `inbound_qty`/`inbound_value` — Default column "`0`" → "—"; Description reword từ "SL/GT nhập ngày" → "SL/GT nhập ngày. OB baseline row = `opening_balance_line.quantity_on_hand`/`value_on_hand` (OB là 'nhập lần đầu' của mã+kho — ADR-020 v6 uniform formula, override v5 'given closing_qty'; NXT report BR-STKV2-010 SUM bao gồm OB row)". (2) row `outbound_qty`/`outbound_value` — Default "`0`" → "—"; Description clarify "0 tại OB import — không có xuất". (3) row `closing_qty`/`closing_value` — extend Description: "running formula uniform cho MỌI row: `closing_N = closing_{N-1} + inbound_N − outbound_N` (row đầu chuỗi: `previous_closing=0` → `closing = inbound`); invariant `closing_qty ≥ 0`". Cite `ADR-020 v6`. Source: user quannn 2026-07-08 "inbound_qty, inbound_value sẽ là số lượng nhập từ import vào" + AskUserQuestion resolve "OB tính như 'Nhập trong kỳ'". Cascade pair với `Architecture/decisions/ADR-020 v6` + `Architecture/data/gf-inventory-data-model.md v22` + `Architecture/hld/gf-inventory-HLD.md v18`. Không đụng §2 lock-check path (v2 fix), §5.2 indexes, §5.3 constraints, §6-§11 sequence/BR/test. |
| 2026-07-08 | 2 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Fix P0+P1 drift alignment vs Architecture canonical** (audit 2026-07-08). (1) **Lock-check endpoint path** (P0): `GET /protected/accounting/v1/accounting-periods/lock-check` → `GET /protected/v1/accounting-periods/lock-check` (bỏ segment `/accounting`, canonical API doc §2.2 row #23 + ADR-021). Cascade §0 audit trail + §2 + §6.4 (3 mention). **NEED CONFIRMATION #2 v1 giờ đã resolved** — path đã align cả ADR-021 lẫn API doc (spec v1 đã hiểu nhầm claim drift; API doc canonical là `/protected/v1/...` không phải `/protected/accounting/v1/...`). (2) **Drop col `movement_kind`** (P1): §5.1 entity col table `inventory_stock_ledger` — bỏ row `movement_kind VARCHAR(16) enum OB\|SLIP` (ADR-020 v5 2026-07-08 drop — engine detect row đầu chuỗi via `ORDER BY movement_date ASC LIMIT 1 per key`). Cascade §5.1 col table. Sibling `FEAT-OB-LIST.md §5.1` đã đúng (không nêu col) — dùng làm oracle. |
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-OB-IMPORT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE (2 endpoint wizard 2-bước + cross-boundary lock-check consumer + commit all-or-nothing + migration owner), §3 BE behaviour map 10/10 AC-ID (Cluster A file-level gate AC-3b, Cluster B preview validate AC-4/AC-5, Cluster C commit all-or-nothing AC-6/AC-8, Cluster D permission AC-9, 4 N/A UI-only AC-1/AC-2/AC-3/AC-7), §4 ràng buộc + error code (13 mã lỗi ERR-INV + ERR-CMN-007), §5-§11 BE-specific (schema **tạo mới** 2 bảng `opening_balance_line`+`inventory_stock_ledger`, REST W04-3/W04-4 full field detail, Hexagonal file map, sequence DAG, BR primary 14 rule, test hand-off, cross-tier pair). Source FEAT chỉ audit. **NEED CONFIRMATION #1**: bundle §C (AC index) thiếu `AC-3b` (regex extraction gap `**AC-3b**` không match pattern baseline — cùng issue đã ghi nhận ở `FEAT-OB-LIST.md` Change Log) — author đã bổ sung trực tiếp từ source FEAT §2; đề nghị fix `scripts/preflight-wave-spec-bundle.py` AC-ID regex. **NEED CONFIRMATION #2**: đường dẫn lock-check REST giữa `ADR-021` text (`GET /protected/v1/accounting-periods/lock-check`) và `Architecture/api/gf-accounting-api.md §V4-AP-LC` (`GET /protected/v1/accounting-periods/lock-check`) không khớp nhau (thiếu segment `/accounting`); sibling `FEAT-OB-LIST.md` §6.4 đã dùng path ngắn theo ADR-021. Spec này **chọn path đầy đủ theo `gf-accounting-api.md`** (Architecture spec = SSOT cho REST contract, ADR chỉ mô tả decision rationale) — đề nghị Architecture Authority đối chiếu + fix drift giữa 2 tài liệu. **NEED CONFIRMATION #3**: PKG §2.2.2 excerpt (bundle §H) liệt kê thêm field `unit_price` + `import_batch_id` cho `opening_balance_line` không khớp với API contract (`gf-inventory-api.md §5.1 Naming Registry`) lẫn sibling `FEAT-OB-LIST.md §5.1` (chỉ có `quantity`/`value`, không có `unit_price`/`import_batch_id`) — spec này loại bỏ 2 field thừa, dùng Naming Registry làm nguồn canonical. |
