---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-GRP-LIST.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-LIST"
source_feat_sha: "cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef"
generated_at: "2026-06-29T14:45:00+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-CAT-GRP-LIST"]
consumes_bff_feats: ["FEAT-CAT-GRP-LIST"]
i18n_keys:
  - "inventoryCatalog.groupList.pageTitle"
  - "inventoryCatalog.groupList.search.placeholder"
  - "inventoryCatalog.groupList.filter.status.label"
  - "inventoryCatalog.groupList.filter.status.all"
  - "inventoryCatalog.groupList.filter.status.active"
  - "inventoryCatalog.groupList.filter.status.inactive"
  - "inventoryCatalog.groupList.filter.parentGroup.label"
  - "inventoryCatalog.groupList.addButton.label"
  - "inventoryCatalog.groupList.table.col.stt"
  - "inventoryCatalog.groupList.table.col.name"
  - "inventoryCatalog.groupList.table.col.code"
  - "inventoryCatalog.groupList.table.col.parent"
  - "inventoryCatalog.groupList.table.col.description"
  - "inventoryCatalog.groupList.table.col.status"
  - "inventoryCatalog.groupList.table.col.actions"
  - "inventoryCatalog.groupList.table.actions.edit.ariaLabel"
  - "inventoryCatalog.groupList.table.actions.delete.ariaLabel"
  - "inventoryCatalog.groupList.empty.text"
  - "inventoryCatalog.groupList.pagination.show"
  - "inventoryCatalog.groupList.pagination.perPage"
  - "inventoryCatalog.groupList.pagination.prev"
  - "inventoryCatalog.groupList.pagination.next"
screens_touched:
  - "frontend/gf-gms-web/src/features/inventory-catalog/pages/MaterialGroupListPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-grp-list.md (node 14423:88836 — 2 screens: Empty State 13501:134329 + Populated State 14432:88912)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "b196f929a69c41b1ee157cc20f4ff9ca92fe9ac2583db33ad9a27b16186a1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-LIST.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
  kg_component_scan: "author-manual — §G.X KG parse error; scanned .claude/references/web-component-registry.yaml (v3, 2026-06-22)"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-LIST (FE Web): Danh sách nhóm vật tư hàng hóa

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-LIST` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `frontend/gf-gms-web/src/features/inventory-catalog/pages/MaterialGroupListPage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-GRP-LIST` \| BFF: `FEAT-CAT-GRP-LIST` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) |
| Source version | v6 |
| Source SHA | `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` |
| Generated at | 2026-06-29T14:45:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu danh sách nhóm vật tư hàng hóa để phân loại và điều hướng trong hệ thống quản lý kho V2. Feature cho phép tìm kiếm theo mã/tên và lọc theo trạng thái hoặc nhóm cha, với kết quả hiển thị phẳng (flat) có phân trang — quan hệ cha–con thể hiện qua trường "Thuộc nhóm". Đây là điểm khởi đầu cho các luồng tạo, xem chi tiết, sửa và xóa nhóm vật tư trong wave W03 (Danh mục V2).

## 2. Trách nhiệm FE Web (garage-web)

- Render màn hình desktop console danh sách nhóm VTHH dạng bảng trải phẳng 7 cột, nằm trong tab "Nhóm vật tư hàng hóa" của trang Danh mục (`/inventory-catalog/groups`). KHÔNG mobile-first — xem figma spec `wave03-cat-grp-list.md` §Screen: Populated State.
- User flow: mở tab → `searchMaterialGroups` load với default (status=ACTIVE, page=1, size=20) → table populated hoặc empty state; search/filter → refetch; click "Tên nhóm VTHH" link → DETAIL; click row icon Sửa → EDIT; click row icon Xóa → confirm + DELETE; click "Thêm Nhóm VT/HH" → CREATE.
- State machine tường minh: `idle → loading (skeleton rows) → populated | empty`. Filter/search thay đổi → `loading → populated | empty`. Lỗi API → `error` (TOAST).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: filter bar dùng `customs/filter/filter` + `customs/filter/filter-option` (Priority 1); table/pagination/badge/search/button từ `share/` (Priority 2). Xem §5.2 cho inventory đầy đủ.
- **Figma spec là visual SSOT**: mọi column width, filter control width, token color, icon glyph theo `Product/ux/figma-web/wave03-cat-grp-list.md`. §5 references cross-ref figma sections.
- Consume BFF query `searchMaterialGroups` cho data table và populate dropdown "Thuộc nhóm"; RBAC render: ẩn "Thêm" button + row actions khi role không đủ quyền.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Khởi tải màn hình + hiển thị bảng

#### AC-1 → Render màn hình danh sách khi tab "Nhóm vật tư hàng hóa" active

- **Khi**: user truy cập route `/inventory-catalog/groups` (tab "Nhóm vật tư hàng hóa" selected)
- **FE phải**: dispatch `searchMaterialGroups({ status: "ACTIVE", page: 1, size: 20 })` ngay khi mount; render SubTabNav với tab "Nhóm vật tư hàng hóa" ở trạng thái selected (text-primary + blue underline) — xem figma spec `wave03-cat-grp-list.md` §Screen: Empty State §1 SubTabNav
- **State transition**: `idle → loading` (render skeleton rows) → `populated | empty`
- **Component**: `MaterialGroupListPage` (NEW — xem §5.2)
- **GraphQL op**: `searchMaterialGroups` (query, BFF V2-Q1)
- **i18n keys**: `inventoryCatalog.groupList.pageTitle` → h1 "Danh sách nhóm vật tư hàng hóa"
- **a11y**: h1 page title; SubTabNav dùng `role="tablist"` + `aria-selected` trên tab active
- **Ref**: figma node `13501:134329` (Empty State) + `14432:88912` (Populated State)

#### AC-2 → Hiển thị bảng 7 cột đúng thứ tự và format

- **Khi**: `searchMaterialGroups` trả về data (kể cả rỗng)
- **FE phải**: render bảng với đúng 7 cột theo thứ tự: STT (số thứ tự từ offset), Tên nhóm VTHH (link text-primary, click → DETAIL), Mã nhóm VTHH, Thuộc nhóm, Mô tả, Trạng thái (status badge pill), Thao tác (icon buttons). Table head bg-muted — xem figma spec `wave03-cat-grp-list.md` §1 Layout DSL GroupTable columns
- **State transition**: `loading → populated` (rows render) hoặc `→ empty` (EmptyState)
- **Component**: `share/tables/table-pagination` (Priority 2 — share), `share/badges/badge-status` cho cột Trạng thái
- **GraphQL op**: `searchMaterialGroups` response `content[]`
- **i18n keys**: `inventoryCatalog.groupList.table.col.*` (7 cột)
- **a11y**: `<th scope="col">` cho mỗi column header; table `aria-label="Danh sách nhóm vật tư hàng hóa"`
- **Ref**: figma node `13501:134329` L11 (head columns) + `14432:88912` L11-22 (populated rows); figma spec §2 Design Token Map token `bg-muted` cho table head

#### AC-3 → Flat list — quan hệ cha–con thể hiện qua cột "Thuộc nhóm"

- **Khi**: bảng populated với data có quan hệ cha–con
- **FE phải**: render cột "Thuộc nhóm" với `parentGroupName` (text bình thường) hoặc "—" nếu là root. KHÔNG render icon expand/collapse. KHÔNG thụt lề (indent) theo cấp. KHÔNG tree UI bất kỳ dạng nào — flat rows only
- **Component**: plain text cell + dash fallback; `share/navigates/link` cho cột "Tên nhóm VTHH"
- **Ref**: figma node `14432:88912` L13-22 (row data); figma spec §1 Layout DSL GroupTable `parent: nullable: true`; `_negative_coverage: "KHÔNG có expand/collapse caret per row, KHÔNG indent"`

#### AC-10 → Phạm vi dữ liệu theo garage (tenant)

- **FE phải**: không cần xử lý tenant isolation ở FE layer — BFF tự propagate `X-Tenant-Id` + `X-Branch-Id` headers từ auth context. Response chỉ trả data thuộc garage hiện tại. FE KHÔNG thêm tenantId vào GraphQL variables.
- **Ref**: CLAUDE.md Critical Rule #4 (TenantContext enforced BE); paired BFF spec §4 auth header propagation

#### AC-11 → Nền tảng — tính năng đầy đủ trên web

- Scope statement: màn hình danh sách nhóm VTHH phải implement đầy đủ trên web (không phải subset/lite). Desktop console layout, 1440px+ design reference — xem figma spec `wave03-cat-grp-list.md` frontmatter `screens_expected: 2` (Empty + Populated). Mobile scope → xem paired mobile spec `FEAT-CAT-GRP-LIST.md` (tier mobile).

### Cluster B — Tìm kiếm và lọc

#### AC-4 → Tìm kiếm theo mã/tên nhóm

- **Khi**: user nhập text vào ô tìm kiếm
- **FE phải**: debounce 300ms → dispatch `searchMaterialGroups({ keyword: value, page: 1, ... })`. Reset về page=1 khi keyword thay đổi. Placeholder verbatim từ i18n key `inventoryCatalog.groupList.search.placeholder` (giá trị vi: "Tìm theo mã nhóm, tên nhóm") — xem figma spec `wave03-cat-grp-list.md` §5 SearchField placeholder
- **State transition**: `populated → loading → populated | empty`
- **Component**: `share/inputs/input-search` (Priority 2 — share), `w-[320px]` per figma §6 Layout Width Table
- **GraphQL op**: `searchMaterialGroups({ keyword })` — BE OR-match `code/name` (BR-CAT-GRP-013, BE enforce)
- **i18n keys**: `inventoryCatalog.groupList.search.placeholder`
- **a11y**: `aria-label` = `inventoryCatalog.groupList.search.placeholder`; `<Search />` icon decorative `aria-hidden`
- **Ref**: figma node `13501:134329` L8; figma spec §5 SearchField; §8 Anti-Pattern Trap 3 (fixed width 320px, KHÔNG flex-stretch)

#### AC-5 → Lọc theo trạng thái

- **Khi**: user chọn option từ dropdown "Trạng thái"
- **FE phải**: dispatch `searchMaterialGroups({ status: selectedValue, page: 1, ... })`. Options: "Tất cả" (status=undefined/all), "Đang hoạt động" (status=ACTIVE, default), "Ngừng hoạt động" (status=INACTIVE). Width `w-[123px]` per figma §6
- **State transition**: `populated → loading → populated | empty`
- **Component**: `customs/filter/filter-option` (Priority 1 — customs) compose với `customs/filter/filter` container; options static enum
- **GraphQL op**: `searchMaterialGroups({ status })` 
- **i18n keys**: `inventoryCatalog.groupList.filter.status.*` (label + 3 options)
- **Ref**: figma node `13501:134329` L8 §5 StatusFilterField; §3 State Table StatusFilter

#### AC-6 → Lọc theo nhóm cha

- **Khi**: user chọn nhóm cha từ dropdown "Thuộc nhóm"
- **FE phải**: dispatch `searchMaterialGroups({ parentId: selectedGroupId, page: 1, ... })`. Dropdown options load dynamic từ `searchMaterialGroups({ size: 100, status: "ACTIVE" })` gọi lần đầu khi mount (separate TanStack Query key). Single-select. Deselect → parentId=undefined (không lọc). Width `w-[139px]` per figma §6
- **State transition**: options loading → populated; filter change → table loading
- **Component**: `customs/filter/filter-option` (Priority 1 — customs) với async options
- **GraphQL op**: `searchMaterialGroups({ size: 100, status: "ACTIVE" })` cho options; `searchMaterialGroups({ parentId })` cho table
- **i18n keys**: `inventoryCatalog.groupList.filter.parentGroup.label`
- **Ref**: figma node `13501:134329` L8 §5 ParentGroupFilterField; `multi: false` (1 nhóm cha tại một thời điểm)

### Cluster C — Thao tác trên dòng và điều hướng

#### AC-7 → Icon actions trên mỗi row

- **Khi**: bảng có data rows
- **FE phải**: render 2 icon buttons trên mỗi row trong cột "Thao tác": (1) `<Edit2 />` icon "Sửa" → navigate đến `FEAT-CAT-GRP-EDIT` route `/inventory-catalog/groups/{id}/edit`; (2) `<Trash2 />` icon "Xóa" → trigger confirm dialog → `FEAT-CAT-GRP-DELETE`. "Xem" detail trigger qua click vào link "Tên nhóm VTHH" (text-primary → navigate `/inventory-catalog/groups/{id}`). Icons inline không có kebab menu — xem figma spec `wave03-cat-grp-list.md` §8 Anti-Pattern Trap 6
- **Component**: `share/buttons/button` (Priority 2, `size="icon"`, `variant="ghost"`) cho Edit + Delete icon buttons
- **i18n keys**: `inventoryCatalog.groupList.table.actions.edit.ariaLabel`, `inventoryCatalog.groupList.table.actions.delete.ariaLabel`
- **a11y**: mỗi icon button cần `aria-label` (vi: "Sửa" / "Xóa")

> **NEED CONFIRMATION (AC-7)**: Source AC-7 mô tả 3 hành động "Xem/Sửa/Xóa" trong cột Thao tác. Figma PNG `14432-88912.png` chỉ render 2 icons (Edit pencil + Trash) — "Xem" trigger via blue name link. Figma spec `coverage_gaps`: BA cần xác nhận (a) "Xem" hoàn toàn via name link, không thêm Eye icon — OR — (b) thêm `<Eye />` icon inline làm icon thứ 3 trong Thao tác. Spec này implement option (a) theo PNG canonical. Điều chỉnh khi BA confirm.

#### AC-8 → Mở form tạo nhóm mới

- **Khi**: user click button "Thêm Nhóm VT/HH"
- **FE phải**: navigate đến route `FEAT-CAT-GRP-CREATE` (route: `/inventory-catalog/groups/create`). Button style: `variant="brand"`, `<Plus />` icon leading, label từ i18n `inventoryCatalog.groupList.addButton.label` (vi: "Thêm Nhóm VT/HH") — xem figma spec `wave03-cat-grp-list.md` §1 Layout DSL AddGroupButton; token `bg-brand`
- **Component**: `share/buttons/button` (Priority 2, `variant="brand"`)
- **i18n keys**: `inventoryCatalog.groupList.addButton.label`
- **a11y**: button focusable, Enter trigger; focus ring `ring-2 ring-primary/40` per figma §3 State Table AddGroupButton
- **Ref**: figma node `13501:134329` L6 `_png_verified: "Thêm Nhóm VT/HH"` + `13501:134329` §VV claim "SINGLE brand button"

### Cluster D — Phân quyền

#### AC-9 → RBAC — gate theo role

- **Khi**: user không có quyền view danh sách nhóm VTHH → redirect khỏi route
- **Khi**: user không có quyền tạo → ẩn "Thêm Nhóm VT/HH" button (KHÔNG show-then-disable)
- **Khi**: user không có quyền edit/delete → ẩn icon Sửa/Xóa trên từng row (KHÔNG show-then-disable)
- **FE phải**: đọc permission từ auth context → conditional render. Dùng `<Show when={canCreate}>` pattern (anti-pattern ap-conditional-render-without-show); KHÔNG dùng `{cond && <Button />}`
- **Component**: `share/containers/show` (Priority 2 — share) cho conditional render
- **Ref**: paired BFF spec §4 auth; CLAUDE.md Critical Rule #6 (dual persona: garage-owner + accountant)

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave03-cat-grp-list.md` (node 14423:88836). KHÔNG re-invent layout/spacing/color.
- Filter controls có **fixed width** per metadata XML: SearchInput `w-[320px]`, StatusFilter `w-[123px]`, ParentGroupFilter `w-[139px]` — KHÔNG `flex-1`/`flex-grow` (Anti-Pattern Trap 3, figma §8).
- Empty state: filter row + "Thêm" button PHẢI still visible khi table rỗng — KHÔNG ẩn controls (Anti-Pattern Trap 4, figma §8).
- Cột "Tên nhóm VTHH" render dạng link text-primary `#0052ff` (clickable) — xem figma `14432-88912.png` §VV claim "BLUE clickable link".
- Pagination hiển thị khi có data; current page indicator: bordered box `border border-input` — xem figma `14432-88912.png` §VV + Anti-Pattern Trap 7.
- Row actions: 2 icons inline, KHÔNG kebab menu (Anti-Pattern Trap 6, figma §8).
- Design tokens §5.3 phải match chính xác 11 tokens từ figma `wave03-cat-grp-list.md` §2 Design Token Map.

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | populated | empty | error`. Mỗi state có UI tương ứng: skeleton rows (loading), `share/emptys/no-data` (empty), TOAST (error).
- Filter/search change: reset page=1 + dispatch refetch.
- KHÔNG silent fail — mọi API error phải surface qua TOAST hoặc log (Sentry).

### 4.3 i18n + a11y

- **i18n policy**: dùng i18next keys cho mọi label string — KHÔNG hardcode tiếng Việt inline (G8). `i18n_keys` frontmatter liệt kê toàn bộ keys. File: `src/i18n/vi/inventory-catalog.json` + `src/i18n/en/inventory-catalog.json`.
- a11y: SubTabNav dùng `role="tablist"` + `aria-selected`; table có `aria-label`; search input có `aria-label`; icon-only buttons có `aria-label` (Sửa/Xóa); empty state text có `role="status"`; pagination buttons keyboard-navigable (Tab + Enter).

### 4.4 RBAC render + feature flag

- Gate view permission → TanStack Router `beforeLoad` guard redirect.
- Ẩn "Thêm Nhóm VT/HH": `<Show when={canCreate}>` — KHÔNG show-then-disable.
- Ẩn row actions Sửa/Xóa: conditional per-row theo role. KHÔNG show-then-disable.
- Persona: `garage-owner` và `accountant` — CLAUDE.md Critical Rule #6.

### 4.5 Business rules secondary (UI hint)

- **BR-CAT-GRP-013** (keyword OR-match 3 col): BE enforce. FE chỉ pass `keyword` string — không cần split logic.
- **BR-CAT-GRP-005** (flat-grouped-by-parent ordering khi sort=default): BE enforce ORDER BY. FE render rows theo thứ tự trả về — KHÔNG re-sort client-side.
- **BR-CAT-GRP-006**: scope nhóm VTHH theo tenant (FE không tự filter — BFF propagate tenant header).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-027` (MATERIAL_GROUP_TREE_OVERSIZE) | TOAST | `share/toasts/toast` | AC-6 (parent filter options) |
| Network / 500 | TOAST | `share/toasts/toast` | AC-1 (load fail) |
| 403 Forbidden | redirect / TOAST | router guard | AC-9 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `MaterialGroupListPage` | `/inventory-catalog/groups` | NEW | `14423:88836` (file root), `13501:134329` (Empty), `14432:88912` (Populated) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-11 |
| Sub-tab nav (Catalog parent layout) | `/inventory-catalog` | MODIFY (add tab) | `13501:134329` L4 SubTabNav | AC-11 |

### 5.2 Components new/modified

> **Reuse pattern column** references priority `customs/` > `share/` > `ui/`. Scan từ `.claude/references/web-component-registry.yaml` (§G.X KG parse error — scanned registry v3 manually).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `MaterialGroupListPage` | `src/features/inventory-catalog/pages/MaterialGroupListPage.tsx` | NEW | — | TanStack Query + filter state | **Build-new** — justification: page orchestrator không có precedent ở customs/share/ui; domain-new feature page | AC-1, AC-11 |
| Filter bar container | `src/components/customs/filter/filter.tsx` | REUSE | `{ filters, onFiltersChange }` | filter state qua useFilters | **Priority 1 — customs/** (filter bar orchestrator, `customs/filter/filter`) | AC-4, AC-5, AC-6 |
| Filter option chip (Status + ParentGroup) | `src/components/customs/filter/filter-option.tsx` | REUSE | `{ type, options, value, onChange }` | popover open/close | **Priority 1 — customs/** (`customs/filter/filter-option`) | AC-5, AC-6 |
| Search input | `src/components/share/inputs/input-search.tsx` | REUSE | `{ placeholder, value, onChange }` | uncontrolled local debounce | **Priority 2 — share/** (`share/inputs/input-search`, `w-[320px]` className) | AC-4 |
| Add button "Thêm Nhóm VT/HH" | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: "brand", size: "default" }` + `<Plus />` leading | — | **Priority 2 — share/** (`share/buttons/button`) | AC-8 |
| Row icon button (Edit / Delete) | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: "ghost", size: "icon" }` + lucide icon | — | **Priority 2 — share/** (`share/buttons/button`) | AC-7 |
| Paginated table | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ columns, data, pagination, onPageChange, isLoading }` | pagination từ hook | **Priority 2 — share/** (`share/tables/table-pagination`) | AC-1, AC-2, AC-3 |
| Status badge | `src/components/share/badges/badge-status.tsx` | REUSE | `{ status: "ACTIVE" \| "INACTIVE" }` | — | **Priority 2 — share/** (`share/badges/badge-status`) | AC-2 |
| Empty state | `src/components/share/emptys/no-data.tsx` | REUSE | `{ text }` | — | **Priority 2 — share/** (`share/emptys/no-data`) | AC-1 |
| Name column link | `src/components/share/navigates/link.tsx` | REUSE | `{ to: "/inventory-catalog/groups/{id}" }` | — | **Priority 2 — share/** (`share/navigates/link`, color `text-primary`) | AC-3, AC-7 |
| Page header | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, action: <AddButton /> }` | — | **Priority 2 — share/** (`share/layouts/page-header`) | AC-1 |
| Conditional render | `src/components/share/containers/show.tsx` | REUSE | `{ when: canCreate }` | — | **Priority 2 — share/** (`share/containers/show`, anti-pattern guard) | AC-9 |

### 5.3 Design tokens & Figma refs

> Tokens khớp chính xác 11 tokens từ `Product/ux/figma-web/wave03-cat-grp-list.md` §2 Design Token Map.

| Token | Tailwind class | Usage | AC ref |
|---|---|---|---|
| `bg-brand` | `bg-brand` (variant="brand") | "Thêm Nhóm VT/HH" button background | AC-8 |
| `bg-primary` | `bg-primary` | Đồng nghĩa brand button bg (figma `base/background-brand-CD`) | AC-8 |
| `bg-muted` | `bg-muted` | Table header background | AC-2 |
| `bg-background-success` | `bg-background-success` | Status badge "Đang hoạt động" background | AC-2 |
| `text-foreground` | `text-foreground` | H1 page title, table cell text, empty state text | AC-1, AC-2 |
| `text-primary` | `text-primary` | Cột "Tên nhóm VTHH" link color + brand button text | AC-3, AC-8 |
| `text-foreground-success` | `text-foreground-success` | Status badge "Đang hoạt động" text | AC-2 |
| `text-muted-foreground` | `text-muted-foreground` | Search placeholder, filter labels, pagination labels, row action icons (default) | AC-4, AC-5, AC-6, AC-7 |
| `text-foreground-error` | `text-foreground-error` | Trash icon hover state (danger preview) | AC-7 |
| `border-primary` | `border-primary` | Search input focus ring border | AC-4 |
| `ring-primary` | `ring-primary` | Search input + add button focus ring | AC-4, AC-8 |

> **Figma source-of-truth**: layout, icon glyphs, column widths theo `Product/ux/figma-web/wave03-cat-grp-list.md`. Status badge "Ngừng hoạt động" token màu giả định `bg-muted + text-muted-foreground` (PNG chỉ show "Đang hoạt động" rows) — **NEED CONFIRMATION** với BA nếu cần màu riêng (vàng/đỏ).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | AC ref |
|---|---|---|---|---|
| `searchMaterialGroups` | query | `src/api/graphql/searchMaterialGroups.graphql` | `['materialGroups', filters]` | AC-1, AC-2, AC-4, AC-5, AC-6 |
| `searchMaterialGroups` (parent options) | query | `src/api/graphql/searchMaterialGroups.graphql` | `['materialGroups', 'parentOptions']` | AC-6 |

> Cả 2 call dùng cùng GraphQL op `searchMaterialGroups` với params khác nhau. Op phải tồn tại ở BFF FEAT §6.1 (reviewer item #16).

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — mọi call qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (table data) | TanStack Query | — | `['materialGroups', { keyword, status, parentId, page, size }]` | AC-1, AC-4, AC-5, AC-6 |
| Server state (parent options) | TanStack Query | — | `['materialGroups', 'parentOptions']` | AC-6 |
| Pagination | `hooks/use-pagination.ts` | local | `PAGE_DEFAULT=1, PAGE_SIZE_DEFAULT=20` | AC-1 |
| Filter state | `customs/filter/filter` useFilters hook | local | `{ keyword, status, parentId }` | AC-4, AC-5, AC-6 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory-catalog/groups` | `MaterialGroupListPage` | prefetch `searchMaterialGroups` defaults | RBAC: view-material-group permission | AC-1, AC-9 |
| `/inventory-catalog/groups/create` | `MaterialGroupCreatePage` (FEAT-CAT-GRP-CREATE scope) | — | RBAC: create-material-group | AC-8 |
| `/inventory-catalog/groups/:id` | `MaterialGroupDetailPage` (FEAT-CAT-GRP-DETAIL scope) | — | RBAC: view-material-group | AC-7 |
| `/inventory-catalog/groups/:id/edit` | `MaterialGroupEditPage` (FEAT-CAT-GRP-EDIT scope) | — | RBAC: edit-material-group | AC-7 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Page component | `frontend/gf-gms-web/src/features/inventory-catalog/pages/MaterialGroupListPage.tsx` | NEW | composes share/customs components | ~200 | AC-1..AC-11 |
| Feature hook | `frontend/gf-gms-web/src/features/inventory-catalog/hooks/use-material-group-list.ts` | NEW | TanStack Query wrapper `searchMaterialGroups` | ~60 | AC-1, AC-4, AC-5, AC-6 |
| Feature types | `frontend/gf-gms-web/src/features/inventory-catalog/types/material-group.types.ts` | NEW | TypeScript interface from BFF schema | ~40 | — |
| GraphQL query | `frontend/gf-gms-web/src/api/graphql/searchMaterialGroups.graphql` | NEW | persisted query | ~25 | AC-1 |
| Generated types | `frontend/gf-gms-web/src/api/generated/searchMaterialGroups.generated.ts` | AUTO-GEN | graphql-codegen | — | — |
| i18n (vi) | `frontend/gf-gms-web/src/i18n/vi/inventory-catalog.json` | ADDITIVE | i18next keys | ~25 | AC-1..AC-8 |
| i18n (en) | `frontend/gf-gms-web/src/i18n/en/inventory-catalog.json` | ADDITIVE | i18next keys | ~25 | AC-1..AC-8 |
| Routes | `frontend/gf-gms-web/src/routes/inventory-catalog/groups.tsx` | NEW | TanStack Router file-based | ~20 | AC-1, AC-9 |
| Pagination hook | `frontend/gf-gms-web/src/hooks/use-pagination.ts` | REUSE (existing) | PAGE_DEFAULT=1, PAGE_SIZE_DEFAULT=20 | — | AC-1 |
| Tests | `frontend/gf-gms-web/tests/features/inventory-catalog/MaterialGroupListPage.test.tsx` | NEW | Vitest + RTL | ~150 | AC-1..AC-9 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL `searchMaterialGroups` stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma `wave03-cat-grp-list.md` confirmed
    Exit:  E2E happy path green (smoke — populated state + filter + navigate to detail)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Route + page scaffold + TanStack Query hook | features/routes | BFF S5 stable | query returns data | BFF S5 |
| S6 | Table columns + status badge + name link | features/components | S6 query hook | table renders correctly | S6 query |
| S6 | Filter bar (search + status + parent group) | features/components | S6 table | filter triggers refetch | S6 table |
| S6 | RBAC gates + empty state | features/components | S6 filter | empty + unauthorized render | S6 filter |
| S6 | i18n keys + a11y | i18n + aria attrs | S6 all components | i18next keys resolve | S6 |
| S6 | E2E smoke | tests | S6 complete | happy path green | S6 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-013` | NORMAL | keyword search OR-match — pass string as-is | `use-material-group-list.ts` | AC-4 | BE final enforce |
| `BR-CAT-GRP-005` | NORMAL | flat list ordering — render rows per API response order, KHÔNG re-sort | `MaterialGroupListPage` table | AC-3 | BE authoritative ORDER BY |
| `BR-CAT-GRP-006` | CORNERSTONE | tenant-scoped data — không thêm tenantId vào variables | `searchMaterialGroups.graphql` | AC-10 | BFF propagate header |
| RBAC-VIEW | CORNERSTONE | redirect nếu !canViewMaterialGroup | router guard `/inventory-catalog/groups` | AC-9 | conditional render |
| RBAC-CREATE | CORNERSTONE | ẩn "Thêm" button khi !canCreateMaterialGroup | `<Show when={canCreate}>` trong PageHeader | AC-9 | KHÔNG show-then-disable |
| RBAC-EDIT | CORNERSTONE | ẩn Edit icon khi !canEditMaterialGroup | row actions conditional | AC-7, AC-9 | per-row |
| RBAC-DELETE | CORNERSTONE | ẩn Delete icon khi !canDeleteMaterialGroup | row actions conditional | AC-7, AC-9 | per-row |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-GRP-LIST.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (load + skeleton) | test-ui | mount → loading state → populated |
| AC-2 | UI (table columns) | test-ui | 7 cols, head bg-muted, name = link |
| AC-3 | UI (flat list, no indent) | test-ui | parent name in Thuộc nhóm col; no caret |
| AC-4 | UI (search debounce) | test-ui | keyword input → query vars update |
| AC-5 | UI (status filter) | test-ui | select INACTIVE → refetch |
| AC-6 | UI (parent filter) | test-ui | select parent → parentId in query vars |
| AC-7 | UI (row actions) | test-ui | 2 icons visible; AC-7 NEED CONFIRMATION pending |
| AC-8 | UI (add button navigate) | test-ui | click → navigate `/inventory-catalog/groups/create` |
| AC-9 | UI (RBAC visibility) | test-ui + test-isolation | dual persona: garage-owner vs accountant |
| AC-10 | unit | test-ui | tenantId NOT in graphql variables |
| AC-11 | UI (desktop layout) | test-ui | 1440px viewport, all columns visible |
| (smoke) | E2E happy path | test-e2e | Playwright: open tab → filter → click name → detail |

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventoryCatalog.groupList.pageTitle` | "Danh sách nhóm vật tư hàng hóa" | "Material Group List" | AC-1 |
| `inventoryCatalog.groupList.search.placeholder` | "Tìm theo mã nhóm, tên nhóm" | "Search by group code, name" | AC-4 |
| `inventoryCatalog.groupList.filter.status.label` | "Trạng thái" | "Status" | AC-5 |
| `inventoryCatalog.groupList.filter.status.all` | "Tất cả" | "All" | AC-5 |
| `inventoryCatalog.groupList.filter.status.active` | "Đang hoạt động" | "Active" | AC-5 |
| `inventoryCatalog.groupList.filter.status.inactive` | "Ngừng hoạt động" | "Inactive" | AC-5 |
| `inventoryCatalog.groupList.filter.parentGroup.label` | "Thuộc nhóm" | "Parent Group" | AC-6 |
| `inventoryCatalog.groupList.addButton.label` | "Thêm Nhóm VT/HH" | "Add Material Group" | AC-8 |
| `inventoryCatalog.groupList.table.col.stt` | "STT" | "No." | AC-2 |
| `inventoryCatalog.groupList.table.col.name` | "Tên nhóm VTHH" | "Group Name" | AC-2 |
| `inventoryCatalog.groupList.table.col.code` | "Mã nhóm VTHH" | "Group Code" | AC-2 |
| `inventoryCatalog.groupList.table.col.parent` | "Thuộc nhóm" | "Parent Group" | AC-2, AC-3 |
| `inventoryCatalog.groupList.table.col.description` | "Mô tả" | "Description" | AC-2 |
| `inventoryCatalog.groupList.table.col.status` | "Trạng thái" | "Status" | AC-2 |
| `inventoryCatalog.groupList.table.col.actions` | "Thao tác" | "Actions" | AC-2 |
| `inventoryCatalog.groupList.table.actions.edit.ariaLabel` | "Sửa" | "Edit" | AC-7 |
| `inventoryCatalog.groupList.table.actions.delete.ariaLabel` | "Xóa" | "Delete" | AC-7 |
| `inventoryCatalog.groupList.empty.text` | "Không có dữ liệu" | "No data" | AC-1 |
| `inventoryCatalog.groupList.pagination.show` | "Hiển thị" | "Show" | AC-1 |
| `inventoryCatalog.groupList.pagination.perPage` | "mỗi trang" | "per page" | AC-1 |
| `inventoryCatalog.groupList.pagination.prev` | "Trước" | "Previous" | AC-1 |
| `inventoryCatalog.groupList.pagination.next` | "Tiếp" | "Next" | AC-1 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | SubTabNav: `role="tablist"` + `aria-selected="true"` on active tab; `role="tabpanel"` cho content | keyboard: Tab between tabs, Enter activate |
| AC-2 | Table: `aria-label` = i18n pageTitle; `<th scope="col">` mỗi header | screen reader: announce column headers |
| AC-4 | Search input: `aria-label` = search placeholder; `<Search />` icon `aria-hidden="true"` | keyboard: type → debounce → results |
| AC-7 | Icon buttons: `aria-label` = "Sửa" / "Xóa"; focusable với `tabIndex=0` | keyboard: Tab to icon → Enter/Space trigger |
| AC-8 | Add button: explicit `aria-label` khi context không rõ | focus ring `ring-primary/40` per figma §3 |
| AC-9 | Hidden elements: `display: none` (KHÔNG `visibility: hidden` / `opacity: 0`) khi ẩn qua RBAC | screen reader skip hidden controls |
| AC-1 | Empty state: `role="status"` để announce khi data thay đổi sang rỗng | aria-live polite |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-LIST.md` | DRAFT | BR primary enforcement, `searchMaterialGroups` backend logic (V2-1), ordering rule |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-LIST.md` | DRAFT | GraphQL op `searchMaterialGroups` consumed tại §6.1; SDL phải stable trước S6 entry |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-LIST.md` | DRAFT | Mirror feature AC-11 scope; mobile implementation tách biệt |

**Source ID consistency** (item #18): `source_feat_sha` = `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) v6
- **Figma spec**: [`Product/ux/figma-web/wave03-cat-grp-list.md`](../../../../../Product/ux/figma-web/wave03-cat-grp-list.md) — SSOT visual (node 14423:88836)
- **Paired BE**: [`features/be/FEAT-CAT-GRP-LIST.md`](../be/FEAT-CAT-GRP-LIST.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-GRP-LIST.md`](../bff/FEAT-CAT-GRP-LIST.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-GRP-LIST.md`](../mobile/FEAT-CAT-GRP-LIST.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml) v3
- **PKG**: [`Execution/wave-specs/W03/work-packages/PKG-W03-inventory-catalog.md`](../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: [`Architecture/decisions/ADR-017.md`](../../../../../Architecture/decisions/ADR-017.md) — additive aggregates `material_group` entity
- **Fan-out map**: [`Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-GRP-LIST` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map 11 AC-IDs (Clusters A–D), §4 visual fidelity + state machine + i18n + a11y + RBAC + BR secondary + error mapping, §5 screens/components (customs>share>ui reuse priority, §G.X manual registry scan), §6 GraphQL consume `searchMaterialGroups`, §7 file map ⊆ garage-web boundary, §8–§11 FE-specific impl. NEED CONFIRMATION: AC-7 icon count (2 vs 3 per figma coverage gap) + status badge "Ngừng hoạt động" inactive color. Source FEAT chỉ audit. |
