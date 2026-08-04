---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-OB-LIST.md"
source_version: 9
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-LIST"
source_feat_sha: "d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8"
generated_at: "2026-07-08T06:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-OB-LIST"]
consumes_bff_feats: ["FEAT-OB-LIST"]
i18n_keys: []
screens_touched:
  - "src/routes/_modules/_inventory/opening-balances/index.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ob-list.md (node 14492:89262 — Danh sách tồn đầu kỳ: 3 states default/empty/bulk-select)"
coverage_gaps:
  - "Route slug: PKG §2.2.4.a table dùng `/inventory/opening-balances` (số nhiều, canonical dùng ở §5/§6/§7 dưới đây); Figma §1 Layout DSL literal ghi `/inventory/opening-balance` (số ít, chỉ metadata mô tả layout, không phải nguồn routing authoritative). Dùng PKG làm nguồn route canonical."
  - "Filter 'Người import' chưa có component customs dành riêng cho semantic 'người import OB' — spec đề xuất reuse `customs/select/account-select-filter` (đã build cho 'người tạo/người duyệt', cùng semantic account-level filter) theo Reuse-First priority customs trước. NEED CONFIRMATION khi DEV: nếu prop/data-source không khớp (vd cần filter theo `createdBy` cụ thể trong domain OB) → có thể cần extend prop qua `/allow-new-component` reason=\"extend\" thay vì build-new."
  - "`OpeningBalanceTotalRow` (dòng Tổng aggregate footer) — KHÔNG có component sẵn ở customs/share/ui sau khi scan §5.2 → Build-new, cần `/allow-new-component` trước khi implement (xem §5.2)."
  - "SubNav module Inventory V2 (`Phiếu nhập kho | Phiếu xuất kho | [Tồn đầu kỳ] | Tính giá xuất kho | Báo cáo tồn kho | Báo cáo NXT`) là shared layout element dùng chung cho toàn bộ 10 FEAT W04 (5 AP + 4 OB + hub) — chưa xác định FEAT nào build trước; OB-LIST chỉ REUSE + active tab 'Tồn đầu kỳ'. Coordinate với DEV agent-dev-garage-web để tránh double-build."
  - "Menu entry cha (T-web-Nav1) chưa chốt tên: PKG đề xuất 'Kho V2' hoặc 'Quản lý kho hàng' — verify figma navbar trước khi implement."
  - "File path `src/features/inventory-opening-balance/**` suy luận theo convention W03 catalog (`src/features/inventory-catalog/**`) — chưa verify trực tiếp filesystem `frontend/gf-gms-web` (không truy cập được từ design repo). DEV xác nhận/điều chỉnh path khi implement nếu convention lệch."
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "n/a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-LIST.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-LIST (FE Web): Danh sách tồn đầu kỳ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-LIST` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_inventory/opening-balances/index.tsx` |
| Cross-tier consume | BE: `FEAT-OB-LIST` \| BFF: `FEAT-OB-LIST` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) |
| Source version | v9 |
| Source SHA | `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` |
| Generated at | 2026-07-08T06:00:00Z |

## 1. Mục đích nghiệp vụ

Tồn đầu kỳ là điểm khởi đầu số liệu tồn kho — garage cần một nơi duy nhất để tra cứu, rà soát và quản lý các dòng đã import theo mã sản phẩm, kho và ngày chốt. Màn danh sách phục vụ cả chủ garage lẫn kế toán ngang quyền, cho phép tìm kiếm theo mã/tên sản phẩm, lọc theo kho/người import/ngày import, xem tổng hợp số lượng và giá trị tồn theo bộ lọc hiện tại. Đây cũng là cửa ngõ mở sang các luồng import, sửa và xóa dòng tồn đầu kỳ, làm nền tảng trước khi garage bắt đầu ghi nhận phiếu nhập/xuất kho ở các wave sau.

## 2. Trách nhiệm FE Web (garage-web)

- Màn **"Tồn đầu kỳ / Danh sách tồn đầu kỳ"** tại route `/inventory/opening-balances` — entry mặc định của module Tồn đầu kỳ (tab active trong SubNav Inventory V2), gồm PageHeader + FilterRow + TableSection (bảng + dòng Tổng + phân trang).
- User flow chính: mount → gọi `searchOpeningBalances` (page 0, size 20, sort `createdAt,desc`) → render bảng 12 cột hoặc empty state → user search/filter → reset page 0 + re-fetch → user tick checkbox → hiện nút "Xoá các dòng đã chọn" → user bấm Import / sửa dòng / xóa dòng → điều hướng sang `FEAT-OB-IMPORT` / `FEAT-OB-EDIT` / `FEAT-OB-DELETE-LINES` (out of scope tier này).
- State machine UI: `idle → loading (fetch) → success (rows | empty) → error (toast)`; loading lại mỗi khi filter/search/page/pageSize thay đổi.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (xem §5.2). Chỉ build-new khi cả 3 layer không match — entry phải có justification (`OpeningBalanceTotalRow` là trường hợp duy nhất ở feature này).
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest đều theo `Product/ux/figma-web/wave04-ob-list.md` (node `14492:89262`, 3 state: default/empty/bulk-select). §2/§4/§5 references cross-ref figma sections. KHÔNG suy luận visual từ AC/BR text đơn thuần.
- GraphQL op consume từ BFF: query `searchOpeningBalances` (danh sách + filter + dòng Tổng). Các mutation `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines` chỉ **trigger navigate** (không thực thi trong FEAT này — thuộc `FEAT-OB-DELETE-LINES`).
- RBAC render: route gate feature-flag `Inventory:InventoryV2` (TanStack Router `beforeLoad`); 2 persona `garage-owner` + `accountant` xem quyền write ngang nhau — KHÔNG có gating riêng theo role trong feature này (khác với mobile — view-only, xem mobile/ tier file).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 19/19 source AC-ID (12 áp dụng tier fe-web + 7 N/A mobile-only, khai báo explicit dưới).

### Cluster A — Danh sách & Tổng hợp

#### AC-1 → FE render page shell mặc định + nút Import luôn hiện, nút bulk-delete ẩn mặc định

- **Khi**: user điều hướng tới route `/inventory/opening-balances` (từ menu "Tồn đầu kỳ" hoặc deep-link).
- **FE phải**: render `OpeningBalanceListPage` gồm PageHeader (title "Danh sách tồn đầu kỳ" + button "Import tồn đầu kỳ" luôn enable, top-right) + FilterRow (search input + 3 filter Kho/Người import/Ngày import) + TableSection (bảng + dòng Tổng + phân trang). Nút "Xoá các dòng đã chọn" ẩn mặc định (điều kiện `selectedRowsCount === 0`), chỉ hiện prefix filter row khi có ≥1 dòng tick (xem AC-7).
- **State transition**: `idle → loading` (mount, fetch page 0) `→ success` (render rows theo AC-2 hoặc empty theo AC-3b).
- **Component**: `share/layouts/page-header` (PageHeader), `share/buttons/button` variant brand (ImportButton), `customs/filter/filter` (FilterRow root).
- **GraphQL op**: `searchOpeningBalances(input: { page: 0, size: 20, sort: "createdAt,desc" })`.
- **i18n keys**: N/A — fixed VN label "Danh sách tồn đầu kỳ" / "Import tồn đầu kỳ" (không dùng i18next, xem §4.3).
- **a11y**: H1 semantics cho PageTitle; button `aria-label="Import tồn đầu kỳ"`.
- **Ref**: figma spec `wave04-ob-list.md` §1 Layout DSL `PageHeader` + `FilterRow._bulk_delete_visible: false`, node `13575:86900`.

#### AC-2 → FE render bảng 12 cột theo đúng thứ tự

- **Khi**: bảng render sau khi `searchOpeningBalances` trả về `content[]`.
- **FE phải**: render 12 cột theo thứ tự: checkbox chọn-tất-cả, STT, Tồn đến ngày (`asOfDate` format `dd/MM/yyyy`), Kho (`warehouseName`), Mã nội bộ (`productCode` — blue link `text-brand`), Tên nội bộ (`productName`), ĐVT (`mainUnitName` fallback `mainUnitCode`), Số lượng tồn (`quantityOnHand`, right-align), Giá trị tồn (`valueOnHand`, VND format right-align), Người import (`createdByName` fallback `createdBy`), Ngày import (`createdAt` format `dd/MM/yyyy`), Thao tác (icon sửa ✏️ + icon xóa 🗑️, 2 icon-button/dòng luôn hiện). Sort mặc định server-side `createdAt,desc` — KHÔNG có UI toggle sort.
- **State transition**: render phase của success state (AC-1).
- **Component**: `share/tables/table-pagination` (column config + row data), `share/buttons/button` variant ghost size icon (RowEditButton + RowDeleteButton, 2 instance/row).
- **GraphQL op**: field selection trong `searchOpeningBalances` response type `OpeningBalanceLine`.
- **i18n keys**: N/A — fixed VN column header verbatim (STT, Tồn đến ngày, Kho, Mã nội bộ, Tên nội bộ, ĐVT, Số lượng tồn, Giá trị tồn, Người import, Ngày import, Thao tác).
- **a11y**: `<th scope="col">` mỗi cột; icon-only button `aria-label="Sửa dòng tồn đầu kỳ"` / `aria-label="Xóa dòng tồn đầu kỳ"`.
- **Ref**: figma spec §1 `TableHeader.columns` (12 entries) + `TableBody.default_case.rowContent`, node `13575:86900`; anti-pattern trap AP-OB-LIST-8 (KHÔNG dùng overflow menu 3-dot thay 2 icon).

#### AC-3 → FE render dòng Tổng server-side aggregate

- **Khi**: bảng có rows hiển thị theo filter hiện tại (state khác empty).
- **FE phải**: render `TotalRow` cuối bảng = `data.aggregates.totalQuantity` + `data.aggregates.totalValue` từ response `searchOpeningBalances` — **server-side tính theo filter hiện tại**, KHÔNG sum client-side dữ liệu trang hiện tại.
- **State transition**: cùng success state; recompute mỗi khi filter/search/page thay đổi (re-fetch).
- **Component**: `OpeningBalanceTotalRow` (build-new, xem §5.2) — background `bg-accent`.
- **GraphQL op**: field `data.aggregates { totalQuantity totalValue }` trong `searchOpeningBalances`.
- **i18n keys**: N/A — fixed label "Tổng".
- **a11y**: `aria-label="Dòng tổng hợp"` trên row.
- **Ref**: figma spec §1 `TotalRow._computed_over: "current-filtered result"`; anti-pattern AP-OB-LIST-7.

#### AC-3b → FE render empty state — header đầy đủ, chỉ ẩn phần bảng data

- **Khi**: `data.totalElements === 0` sau initial fetch (chưa import OB nào cho tenant).
- **FE phải**: giữ nguyên PageHeader + FilterRow + Import button (đều enable — user vẫn có thể apply filter hoặc mở Import); TableBody chuyển sang illustration + text "Không có dữ liệu" (giữa vùng bảng, header cột vẫn hiện); ẩn `TotalRow` + `PaginationRow` + nút "Xoá các dòng đã chọn" (không có gì để chọn/tổng hợp).
- **State transition**: `success` (empty variant).
- **Component**: `share/emptys/no-data` (prop `caption="Không có dữ liệu"`).
- **GraphQL op**: cùng `searchOpeningBalances`, check `data.totalElements === 0`.
- **i18n keys**: N/A — fixed "Không có dữ liệu".
- **a11y**: empty illustration container `role="status"`.
- **Ref**: figma spec Screen "Empty state — chưa import OB nào", node `14547:95824`; anti-pattern AP-OB-LIST-5/AP-OB-LIST-6.

### Cluster B — Tìm kiếm & Lọc

#### AC-4 → FE search LIKE debounce 300ms

- **Khi**: user gõ vào SearchInput placeholder "Tìm theo mã, tên sản phẩm nội bộ".
- **FE phải**: debounce ≥ 300ms → set `filter.keyword` → reset `page = 0` → re-fetch `searchOpeningBalances` với `input.keyword`.
- **State transition**: `idle → typing → debounce → loading → success`.
- **Component**: `share/inputs/input-search`.
- **GraphQL op**: `searchOpeningBalances(input: { keyword, page: 0, ... })`.
- **i18n keys**: N/A — fixed placeholder verbatim "Tìm theo mã, tên sản phẩm nội bộ" (KHÔNG paraphrase — xem anti-pattern AP-OB-LIST-4).
- **a11y**: `aria-label="Tìm kiếm theo mã, tên sản phẩm nội bộ"`.
- **Ref**: figma spec §1 `SearchInput`, node `13575:86900`.

#### AC-5 → FE 3 filter độc lập kết hợp

- **Khi**: user chọn giá trị filter Kho / Người import / Ngày import.
- **FE phải**: mỗi filter cập nhật state tương ứng (`warehouseId` / `createdBy` / `importedFrom` + `importedTo`) → reset `page = 0` → re-fetch. 3 filter độc lập, có thể combine cùng lúc và kết hợp với `keyword` (AC-4).
- **State transition**: `idle → filter-applied → loading → success`.
- **Component**: `customs/filter/filter-popover-trigger` (trigger button), `customs/select/warehouses-select-filter` (Kho), `customs/select/account-select-filter` (Người import — reuse account-level filter, xem `coverage_gaps`), `share/date-picker/date-range-filter` (Ngày import).
- **GraphQL op**: `searchOpeningBalances(input: { warehouseId, createdBy, importedFrom, importedTo, ... })`.
- **i18n keys**: N/A — fixed label "Kho" / "Người import" / "Ngày import".
- **a11y**: mỗi trigger button `aria-haspopup="listbox"`.
- **Ref**: figma spec §1 `KhoFilter` / `NguoiImportFilter` / `NgayImportFilter`, node `13575:86900`.

### Cluster C — Phân trang & chọn dòng

#### AC-6 → FE phân trang offset, mặc định 20/trang

- **Khi**: `data.totalElements > pageSize`.
- **FE phải**: render `PageSizeSelector` (option 10/20/50/100, default 20) + `PageNavigator` (nút "Trước"/"Tiếp" + số trang) — thay đổi 1 trong 2 → set `page`/`pageSize` state → re-fetch.
- **State transition**: `success → loading (page change) → success`.
- **Component**: `share/tables/table-pagination` (pagination integrated).
- **GraphQL op**: `searchOpeningBalances(input: { page, size })`.
- **i18n keys**: N/A — fixed "Hiển thị" / "mỗi trang" / "Trước" / "Tiếp".
- **a11y**: `<nav aria-label="Phân trang">`.
- **Ref**: figma spec §1 `PaginationRow`, node `13575:86900`.

#### AC-7 → FE checkbox chọn dòng → hiện nút "Xoá các dòng đã chọn"

- **Khi**: user tick 1+ checkbox trên bảng (hoặc header select-all).
- **FE phải**: track `selectedRowIds` (client state); khi `selectedRowIds.length >= 1` → render button "Xoá các dòng đã chọn" (variant outline, icon Trash) prefix bên trái ô tìm kiếm + vertical divider — ẩn hoàn toàn khi `length === 0` (mặc định). Click button → navigate `/inventory/opening-balances/delete-lines` (dialog `OpeningBalanceDeleteLinesDialog` thuộc `FEAT-OB-DELETE-LINES` — thực thi mutation nằm ngoài scope tier này, xem §12).
- **State transition**: `idle → selecting → bulk-select mode`.
- **Component**: `share/tables/table-pagination` (controlled `selectedIds` / `onRowSelect`), `share/buttons/button` variant outline (BulkDeleteButton).
- **GraphQL op**: N/A trực tiếp trong FEAT-OB-LIST — trigger route dẫn tới `FEAT-OB-DELETE-LINES` (dùng `deleteOpeningBalanceLines`, xem §12).
- **i18n keys**: N/A — fixed verbatim **"Xoá các dòng đã chọn"** (giữ dấu huyền "oá" + chữ "các" — KHÔNG paraphrase, xem anti-pattern AP-OB-LIST-1/AP-OB-LIST-2).
- **a11y**: header checkbox `aria-label="Chọn tất cả dòng trên trang này"`.
- **Ref**: figma spec Screen "Bulk-select mode — có ≥1 dòng tick", node `13575:95132`.

### Cluster D — Actions điều hướng (thực thi thuộc FEAT khác)

#### AC-8 → FE điều hướng sang wizard Import

- **Khi**: user bấm button "Import tồn đầu kỳ" (top-right, luôn enable — kể cả empty state per AC-3b).
- **FE phải**: `navigate('/inventory/opening-balances/import')` — route thuộc `FEAT-OB-IMPORT` (out of scope tier này, xem §12).
- **Component**: `share/buttons/button` variant brand.
- **GraphQL op**: N/A (pure navigation).
- **i18n keys**: N/A — fixed "Import tồn đầu kỳ".
- **a11y**: `aria-label="Import tồn đầu kỳ"`.
- **Ref**: figma spec §1 `ImportButton.onClick`.

#### AC-10 → FE điều hướng sang form sửa dòng

- **Khi**: user bấm icon sửa (✏️) trên 1 dòng.
- **FE phải**: `navigate('/inventory/opening-balances/{row.id}/edit')` — route thuộc `FEAT-OB-EDIT` (out of scope tier này).
- **Component**: `share/buttons/button` variant ghost size icon (RowEditButton).
- **GraphQL op**: N/A (pure navigation).
- **i18n keys**: N/A.
- **a11y**: `aria-label="Sửa dòng tồn đầu kỳ"`.
- **Ref**: figma spec §1 `RowEditButton.onClick`.

#### AC-11 → FE mở popup xác nhận xóa dòng (guardrail thuộc FEAT-OB-DELETE-LINES)

- **Khi**: user bấm icon xóa (🗑️) trên 1 dòng.
- **FE phải**: trigger flow xác nhận xóa dùng chung với `FEAT-OB-DELETE-LINES` cho riêng dòng đó (guardrail kỳ đóng + tồn âm xử lý ở dialog/mutation riêng — out of scope tier này, xem §12).
- **Component**: `share/buttons/button` variant ghost size icon (RowDeleteButton, trigger only).
- **GraphQL op**: N/A trực tiếp — trigger `deleteOpeningBalanceLine` thuộc `FEAT-OB-DELETE-LINES` (xem §12).
- **i18n keys**: N/A.
- **a11y**: `aria-label="Xóa dòng tồn đầu kỳ"`.
- **Ref**: figma spec §1 `RowDeleteButton.onClick`; anti-pattern AP-OB-LIST-9.

### Cluster E — Phân quyền & tenant

#### AC-9 → FE không có gating riêng theo persona; tenant scope tự động qua session

- **Khi**: chủ garage hoặc kế toán truy cập màn `/inventory/opening-balances`.
- **FE phải**: KHÔNG có logic ẩn/hiện UI theo persona — cả 2 role (`garage-owner`, `accountant`) thấy đầy đủ actions write (Import/sửa/xóa) ngang nhau. Tenant scope tự động qua JWT/session (`X-Tenant-Id` header truyền BFF) — không có filter/param FE tự set tenant. Route chỉ gate theo feature-flag `Inventory:InventoryV2` (xem §4.4), KHÔNG gate theo persona.
- **Component**: TanStack Router `beforeLoad` guard (feature-flag only).
- **GraphQL op**: N/A (session-scoped server-side, không có input riêng cho persona).
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: BR-OB-014 (tenant isolation — enforce BE); §4.4 RBAC + feature flag.

### Cluster F — Mobile-only (N/A tier fe-web)

#### AC-1b → N/A (mobile entry point mission tile "Quản lý kho hàng" → tile "Tồn đầu kỳ" trên Home Sảnh chính — xem `mobile/FEAT-OB-LIST.md`)

#### AC-2b → N/A (mobile card layout 5-field — xem `mobile/FEAT-OB-LIST.md`)

#### AC-3b-mobile → N/A (mobile empty state "Chưa có tồn đầu kỳ" không CTA — xem `mobile/FEAT-OB-LIST.md`)

#### AC-4b → N/A (mobile dedicated search screen 3 state Default/Results/No Results — xem `mobile/FEAT-OB-LIST.md`)

#### AC-5b → N/A (mobile filter bottom-sheet 2 filter Kho + Ngày Import — xem `mobile/FEAT-OB-LIST.md`)

#### AC-5c → N/A (mobile Kho dropdown paginated + preserve selection — xem `mobile/FEAT-OB-LIST.md`)

#### AC-6b → N/A (mobile infinite-scroll pagination trigger 75% list length — xem `mobile/FEAT-OB-LIST.md`)

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ob-list.md` (node `14492:89262`, 3 state: default `13575:86900` / empty `14547:95824` / bulk-select `13575:95132`). KHÔNG re-invent layout/spacing/color.
- Design tokens: `bg-brand` (Navbar + ImportButton), `bg-accent` (TotalRow background), `text-foreground` (PageTitle + TableRow text), `text-muted-foreground` (TableHeader label + placeholder + trailing icon), `text-primary` (ImportButton label text). Tokens MUST khớp bundle §G.Y "Design tokens referenced" — không hardcode hex/px.
- Header + FilterRow + Import button KHÔNG bao giờ ẩn (kể cả empty state — AC-3b); chỉ vùng bảng data thay đổi theo state.
- Mọi visual AC (bảng 12 cột, dòng Tổng, bulk-select prefix) MUST cross-ref figma section tương ứng (đã ghi ở §3 mỗi AC).
- Icon library `iconsax-reactjs` (garage-web convention v7.6) — KHÔNG dùng `lucide-react` (anti-pattern AP-OB-LIST-10).

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | error`. `success` có 3 variant con: `default (rows)` / `empty (illustration)` / `bulk-select (rows + selection)`.
- Error network/downstream (`TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` / `UNKNOWN_ERROR`) → TOAST message, giữ nguyên header + filter (không unmount page).
- KHÔNG silent fail — mọi error reach UI qua toast hoặc inline banner.

### 4.3 i18n + a11y

- **Fixed VN labels (KHÔNG dùng i18next)** — theo pattern established ở wave Catalog W03 (`FEAT-CAT-PROD-IMPORT` §4.3 tiền lệ). `i18n_keys: []`.
- SearchInput: `aria-label` mô tả rõ mục đích tìm kiếm.
- Table: `<th scope="col">` mỗi cột; icon-only action button PHẢI có `aria-label`.
- Bulk-select checkbox: `aria-label` cho header (chọn tất cả) và mỗi row checkbox (`aria-label="Chọn dòng {STT}"`).
- Pagination: `<nav aria-label="Phân trang">`; page size selector có `<label>` ẩn hoặc `aria-label`.
- Empty state illustration: `role="status"` để screen reader announce.

### 4.4 RBAC render + feature flag

- Feature-flag `Inventory:InventoryV2` gate route `/inventory/opening-balances` qua TanStack Router `beforeLoad` (CR-20260707-02) — flag OFF → redirect + ẩn menu entry "Tồn đầu kỳ" khỏi sidebar.
- Persona check: chỉ 2 actor `garage-owner` + `accountant` (Critical Rule #6) — cả 2 có quyền write ngang nhau, KHÔNG có role-based hide/disable riêng trong feature này (khác biệt so với mobile view-only).
- Route guard chạy TRƯỚC khi render bất kỳ UI component nào (loader-level, không show-then-disable).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE tier (xem paired `be/FEAT-OB-LIST.md §9` khi được author). FE chỉ:
  - Cấu trúc cột hiển thị đúng field OB (BR-OB-001) — không có input validation ở màn list (read-only).
  - Search LIKE + 3 filter + dòng Tổng wiring UI (BR-OB-014) — logic tính toán/tenant scope enforce BE.
  - Hiển thị đúng cột Người import / Ngày import (BR-OB-CMN-001).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-CMN-validation` | TOAST | toast global | AC-4, AC-5, AC-6 (page/size/sort/date range invalid) |
| `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | TOAST | toast global | AC-1 (initial fetch) |
| `UNKNOWN_ERROR` / `INTERNAL_ERROR` | TOAST | toast global | AC-1 |
| `FORBIDDEN_ERROR` (feature-flag OFF hoặc tenant mismatch) | REDIRECT (route guard, không toast) | TanStack Router `beforeLoad` | AC-9 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `OpeningBalanceListPage` | `/inventory/opening-balances` | NEW | `13575:86900` (default) / `14547:95824` (empty) / `13575:95132` (bulk-select) | AC-1, AC-2, AC-3, AC-3b, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10, AC-11 |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Author consult `.claude/references/web-component-registry.yaml` §1/§2 để biết component có sẵn ở priority cao nhất. Build-new entry phải có justification rằng cả 3 layer không có component fit.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `customs/filter/filter` | `src/components/customs/filter/filter.tsx` | REUSE | filter children slots | filter state hook | **Priority 1 — customs/** (filter bar root, `filter-panel` lookup key) | AC-5 |
| `customs/filter/filter-popover-trigger` | `src/components/customs/filter/filter-popover-trigger.tsx` | REUSE | `{ label, trailingIcon, onOpen }` | popover open | **Priority 1 — customs/** | AC-5 |
| `customs/select/warehouses-select-filter` | `src/components/customs/select/warehouses-select-filter.tsx` | REUSE | `{ value, onChange }` | branch-scoped accumulated options | **Priority 1 — customs/** (đã build cho warehouse filter domain) | AC-5 |
| `customs/select/account-select-filter` | `src/components/customs/select/account-select-filter.tsx` | REUSE | `{ value, onChange }` | `useUserList` | **Priority 1 — customs/** (reuse account-level filter cho "Người import"; xem `coverage_gaps` nếu prop lệch) | AC-5 |
| `share/date-picker/date-range-filter` | `src/components/share/date-picker/date-range-filter.tsx` | REUSE | `{ from, to, onChange }` | compact trigger + popover | **Priority 2 — share/** (không domain-specific — generic date-range filter) | AC-5 |
| `share/inputs/input-search` | `src/components/share/inputs/input-search.tsx` | REUSE | `{ placeholder, onChange }` | debounce local | **Priority 2 — share/** | AC-4 |
| `share/layouts/page-header` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, primaryCta }` | — | **Priority 2 — share/** | AC-1, AC-8 |
| `share/buttons/button` | `src/components/share/buttons/button.tsx` | REUSE | `variant`, `size`, `isLoading` | — | **Priority 2 — share/** (ImportButton brand, BulkDeleteButton outline, row icon-buttons ghost) | AC-1, AC-7, AC-8, AC-10, AC-11 |
| `share/tables/table-pagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ columns, rows, onRowSelect, selectedIds, pageSize, currentPage, totalCount, onPageChange, onPageSizeChange }` | controlled selection + page | **Priority 2 — share/** | AC-2, AC-6, AC-7 |
| `share/emptys/no-data` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ caption }` | — | **Priority 2 — share/** | AC-3b |
| `customs/navigation/inventory-sub-nav` (shared) | `src/components/customs/navigation/inventory-sub-nav.tsx` | REUSE (cross-FEAT shared) | `{ activeKey: "opening-balance" }` | — | **Priority 1 — customs/** — shared Inventory V2 SubNav dùng chung 10 FEAT W04; coordinate build-once với sibling FEAT (xem `coverage_gaps`) | (layout-level, không gắn AC riêng) |
| `OpeningBalanceTotalRow` (kebab-case file) | `src/features/inventory-opening-balance/components/opening-balance-total-row.tsx` | NEW | `{ totalQuantity, totalValue }` | local (stateless) | **Build-new** — justification: không có component aggregate footer row ở customs/share/ui sau khi scan §1/§2 registry; cần `/allow-new-component` (`proposed_layer=share`, generic aggregate footer pattern) trước implement | AC-3 |

### 5.3 Design tokens & Figma refs

> Design tokens MUST khớp tokens detected ở bundle §G.Y "Design tokens referenced" (anti-hallucination guard — reviewer item #21 check). Figma refs reference figma spec file paths, không chỉ node-id.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-brand` | `tailwind.config.js` (`@theme` custom) | ImportButton fill background `#0052ff` | AC-1, AC-8 |
| `bg-accent` | `src/styles/tokens/**` | TotalRow background highlight | AC-3 |
| `text-foreground` | tokens | PageTitle + TableRow default text color | AC-1, AC-2 |
| `text-muted-foreground` | tokens | TableHeader label + SearchInput placeholder + filter trailing icon | AC-2, AC-4, AC-5 |
| `text-primary` | tokens | ImportButton label text (primary-foreground on brand background) | AC-1, AC-8 |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo `Product/ux/figma-web/wave04-ob-list.md`. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `searchOpeningBalances` | query | `src/api/graphql/opening-balance/search-opening-balances.graphql` | `['opening-balance-list', filters, page, size]` | `OpeningBalanceLineFragment` | AC-1, AC-2, AC-3, AC-3b, AC-4, AC-5, AC-6, AC-7 |

> **Cross-tier note (item #16)**: `deleteOpeningBalanceLine` / `deleteOpeningBalanceLines` KHÔNG được gọi trực tiếp bởi FEAT-OB-LIST — AC-7/AC-11 chỉ trigger navigate sang route thuộc `FEAT-OB-DELETE-LINES`, nơi 2 mutation này thực sự được consume (xem paired BFF module `agg-garage-graph-graphql.md §3g.2` W04-M4/W04-M5). Tương tự AC-8/AC-10 trigger navigate sang `FEAT-OB-IMPORT`/`FEAT-OB-EDIT`.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | (none — mọi traffic qua BFF `agg-garage-graph`) | boundary isolation | — |

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state | TanStack Query | — | `['opening-balance-list', filters, page, size]` | AC-1, AC-2, AC-3, AC-6 |
| Client state (selection) | React local state | `OpeningBalanceListPage` | `selectedRowIds: number[]` | AC-7 |
| Client state (filter draft) | React local state / URL search params | `OpeningBalanceListPage` | `{ keyword, warehouseId, createdBy, importedFrom, importedTo, page, size }` | AC-4, AC-5, AC-6 |
| Form state | — | — | (không có form ở màn list) | — |
| Optimistic UI | — | — | (read-only list, không có optimistic mutation trực tiếp) | — |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/opening-balances` | `OpeningBalanceListPage` | `loader() => prefetch searchOpeningBalances (page 0, size 20)` | RBAC: `garage-owner \| accountant` + feature-flag `Inventory:InventoryV2` | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/routes/_modules/_inventory/opening-balances/` | `index.tsx` | NEW | TanStack Router file route | ~40 | AC-1 |
| `src/features/inventory-opening-balance/pages/` | `opening-balance-list-page.tsx` | NEW | compose reuse components §5.2 | ~220 | AC-1-AC-11 |
| `src/features/inventory-opening-balance/components/` | `opening-balance-total-row.tsx` | NEW (build-new, needs approval) | aggregate footer row | ~40 | AC-3 |
| `src/features/inventory-opening-balance/hooks/` | `use-opening-balances.ts` | NEW | TanStack Query wrapper | ~50 | AC-1, AC-4, AC-5, AC-6 |
| `src/features/inventory-opening-balance/types/` | `opening-balance.types.ts` | NEW | TypeScript types (mirror SDL) | ~30 | — |
| `src/api/graphql/opening-balance/` | `search-opening-balances.graphql` | ADDITIVE | persisted query | ~25 | AC-1-AC-7 |
| `src/api/generated/` | `search-opening-balances.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/layouts/home/modules/` | `constants.ts` | MODIFY (add menu entry) | T-web-Nav1 (PKG §2.2.4.a) | ~10 | AC-1 |
| `tests/features/inventory-opening-balance/` | `opening-balance-list-page.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1-AC-11 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL §3g W04-Q1 searchOpeningBalances stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave04-ob-list.md)
    Exit: E2E happy path green (smoke) — list load + search + filter + pagination + bulk-select trigger
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components (page-header/filter/table/total-row) + routing + state + reuse-first gate | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Hiển thị đúng cấu trúc/field per BR (read-only list — không có input form ở feature này).
> - RBAC-driven route gate (feature-flag).
> - Error code → display mode mapping (§4.6).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-001` | CORNERSTONE | Render đúng cấu trúc cột OB (ngày/kho/mã/ĐVT/SL/giá trị) | `opening-balance-list-page.tsx` (table config) | AC-2 | Display-only; BE final enforce persistence |
| `BR-OB-014` | CORNERSTONE | Tenant scope tự động (session), search LIKE + 3 filter + dòng Tổng wiring | `FilterRow` + `OpeningBalanceTotalRow` | AC-3, AC-4, AC-5 | Query logic + tenant filter enforce BE |
| `BR-OB-CMN-001` | NORMAL | Hiển thị cột Người import / Ngày import | `TableHeader` cột 10-11 | AC-2 | Display-only |

> **Primary enforcement** = BE tier (`features/be/FEAT-OB-LIST.md §9` khi được author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | render page shell + Import button luôn enable |
| AC-2 | UI | test-ui | 12 cột đúng thứ tự + đúng label verbatim |
| AC-3 | UI (calculation display) | test-ui | dòng Tổng server-side aggregate, không sum client |
| AC-3b | UI (negative — empty state) | test-ui | header giữ đầy đủ, ẩn total/pagination/bulk-delete |
| AC-4 | UI | test-ui | debounce 300ms, placeholder verbatim |
| AC-5 | UI | test-ui | 3 filter combine + reset page 0 |
| AC-6 | UI | test-ui | pagination offset default 20 |
| AC-7 | UI (state toggle) | test-ui | checkbox select → bulk-delete button hiện/ẩn |
| AC-8 | UI (navigation) | test-ui | Import button navigate `/inventory/opening-balances/import` |
| AC-9 | UI (RBAC visibility) | test-ui + test-isolation | dual persona ngang quyền + tenant scope |
| AC-10 | UI (navigation) | test-ui | row edit icon navigate `/inventory/opening-balances/{id}/edit` |
| AC-11 | UI (navigation) | test-ui | row delete icon trigger confirm flow |
| (smoke) | E2E happy path | test-e2e | Playwright: load → search → filter → paginate → select → bulk-delete trigger |

## 11. i18n & a11y

### 11.1 i18n keys

> KHÔNG áp dụng — fixed VN labels (KHÔNG dùng i18next), `i18n_keys: []` per §4.3. Toàn bộ label hardcode inline verbatim theo figma spec (vd "Danh sách tồn đầu kỳ", "Import tồn đầu kỳ", "Xoá các dòng đã chọn", "Tìm theo mã, tên sản phẩm nội bộ", "Không có dữ liệu").

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | H1 heading semantics cho PageTitle | screen reader landmark |
| AC-2 | `<th scope="col">` mỗi cột; icon-only action có `aria-label` | pencil/trash icon-button |
| AC-3 | `aria-label="Dòng tổng hợp"` | aggregate row announce |
| AC-3b | Empty illustration `role="status"` | announce "Không có dữ liệu" |
| AC-4 | SearchInput `aria-label` mô tả rõ | keyboard accessible |
| AC-5 | Filter trigger `aria-haspopup="listbox"` | keyboard nav dropdown |
| AC-6 | `<nav aria-label="Phân trang">` | pagination landmark |
| AC-7 | Checkbox header + row `aria-label` rõ ràng | "Chọn tất cả" / "Chọn dòng {STT}" |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-LIST.md` | N-A (chưa author tại thời điểm spawn này) | BR primary enforcement (BR-OB-001/014/CMN-001), contract source `searchOpeningBalances` downstream `POST /api/v2/opening-balances/search` (`gf-inventory-api.md §3b.2 W04-1`) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-LIST.md` | N-A (chưa author tại thời điểm spawn này) | GraphQL op `searchOpeningBalances` (§6.1) — SDL `agg-garage-graph-graphql.md §3g.1/§3g.6 W04-Q1` |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` | N-A (chưa author tại thời điểm spawn này) | View-only mirror — chỉ consume `searchOpeningBalances`, KHÔNG có write action (§3g.4 Mobile scope) |
| Sibling FEAT (out of scope, referenced) | `FEAT-OB-IMPORT` / `FEAT-OB-EDIT` / `FEAT-OB-DELETE-LINES` (fe-web tier, cùng wave) | N-A | AC-8/AC-10/AC-7/AC-11 chỉ trigger navigate sang các route này — actual implementation thuộc execution spec riêng của từng FEAT |

**Source ID consistency** (item 18): `source_feat_sha` = `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` — PHẢI identical với BE/BFF/Mobile files khi được author trong cùng wave.

## 13. References

- **Source**: [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) v9
- **Paired BE**: [`features/be/FEAT-OB-LIST.md`](../be/FEAT-OB-LIST.md) (khi được author)
- **Paired BFF**: [`features/bff/FEAT-OB-LIST.md`](../bff/FEAT-OB-LIST.md) (khi được author)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md)
- **Figma spec**: [`Product/ux/figma-web/wave04-ob-list.md`](../../../../../Product/ux/figma-web/wave04-ob-list.md) (node `14492:89262`)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **API contract**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index W04 → §3g Opening Balance
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-OB-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier — sẽ đối chiếu khi BE/BFF/Mobile author), §2 trách nhiệm FE Web, §3 FE behaviour map 19/19 AC-ID (12 áp dụng web + 7 N/A mobile-only), §4 visual fidelity + state + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (route `/inventory/opening-balances` + component reuse §5.2 priority customs>share>ui + 1 build-new `OpeningBalanceTotalRow` cần `/allow-new-component` + GraphQL `searchOpeningBalances` (`agg-garage-graph-graphql.md §3g.1/§3g.6 W04-Q1`) + cross-ref navigate sang FEAT-OB-IMPORT/FEAT-OB-EDIT/FEAT-OB-DELETE-LINES cho AC-7/8/10/11). Source FEAT chỉ audit. 6 coverage_gaps ghi nhận (route slug drift PKG vs figma, filter "Người import" component fit, TotalRow build-new, SubNav shared build coordination, menu label chưa chốt, file path suy luận convention). |
