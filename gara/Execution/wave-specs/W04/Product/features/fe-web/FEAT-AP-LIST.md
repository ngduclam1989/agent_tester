---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-AP-LIST.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-LIST"
source_feat_sha: "4f8f84b66f77ad85dfd24566c14a9e982dbcf7dec9de018c89c82507abbfeb83"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-web"
platform: web
modifies:
  - "src/components/customs/inventory/sub-nav-danh-muc.tsx"
change_type: "new-capability"
consumes_backend_feats: ["FEAT-AP-LIST"]
consumes_bff_feats: ["FEAT-AP-LIST"]
i18n_keys:
  - "inventory.accountingPeriod.list.title"
  - "inventory.accountingPeriod.list.addCta"
  - "inventory.accountingPeriod.list.searchPlaceholder"
  - "inventory.accountingPeriod.list.yearFilterLabel"
  - "inventory.accountingPeriod.list.columnName"
  - "inventory.accountingPeriod.list.columnType"
  - "inventory.accountingPeriod.list.columnStartDate"
  - "inventory.accountingPeriod.list.columnEndDate"
  - "inventory.accountingPeriod.list.columnStatus"
  - "inventory.accountingPeriod.list.columnAction"
  - "inventory.accountingPeriod.list.statusClosed"
  - "inventory.accountingPeriod.list.statusOpen"
  - "inventory.accountingPeriod.list.emptyCaption"
  - "inventory.accountingPeriod.list.actionView"
  - "inventory.accountingPeriod.list.actionEdit"
  - "inventory.accountingPeriod.list.actionDelete"
  - "inventory.accountingPeriod.list.deleteConfirmTitle"
screens_touched:
  - "src/routes/_modules/_catalog/accounting-period/index.tsx"
figma_refs:
  - "Product/ux/figma-web/wave04-ap-list.md (node 14492:89259 — Danh sách kỳ kế toán dạng cây: Default populated tree 14653:92128 + Empty state 13521:59963, 2 screens)"
coverage_gaps:
  - "[RESOLVED 2026-07-09 — user quannn re-confirm in KG entry] AC-7: cột 'Thao tác' render **2 icon** (Sửa + Xóa), KHÔNG có icon Xem. Hành động **Xem chi tiết** trigger bằng cách **click vào giá trị cột đầu tiên 'Tên kỳ kế toán'** (render dạng link) → mở FEAT-AP-DETAIL. Pattern riêng cho AP-LIST — KHÔNG copy 3-icon pattern từ các list khác (Product/Group). Cross-ref: `knowledge-graph.yaml` `implementation.pages.inventory_accounting_period` inline comment (2026-07-09). BA confirm chuỗi 2026-07-08 + 2026-07-09."
  - "AC-6: Figma placeholder label dropdown năm hiển thị 'Kỳ kế toán' (generic text, không phải giá trị năm). Theo AC-6, dropdown lọc theo NĂM — implementation render 'Năm {year}' theo FEAT authoritative, không port label Figma literal."
  - "AC-6 (v10 non-clearable): dropdown năm KHÔNG cho phép clear/bỏ chọn (per FEAT v10 BA confirm 2026-07-08 — user quannn in-session) — không có nút × / option 'Tất cả' / 'Xóa lọc', user chỉ đổi giá trị. Component `single-select-filter-content` PHẢI compose với prop `clearable={false}` — DEV verify prop tồn tại; nếu component default có clear icon → wrap/extend qua `/allow-new-component` reason='extend'. State `year` luôn có giá trị hợp lệ, không bao giờ null."
  - "Không có pagination trong Figma PNG. FEAT không explicit yêu cầu pagination — cây có thể long-scroll. Implementation cân nhắc virtualize scroll hoặc pagination top-level (Năm) nếu ≥50 nodes — NEED CONFIRMATION với BA nếu cần."
  - "Chevron expand/collapse trong Figma PNG bất thường (collapsed hiện chevron-up thay vì chevron-right). Implementation dùng chuẩn shadcn Collapsible: chevron-right (collapsed) → chevron-down (expanded), không port anomaly Figma."
  - "[RESOLVED 2026-07-09] GraphQL query op = **`searchAccountingPeriodTree`** (AP-Q2, per `Architecture/api/agg-garage-graph-graphql.md §3e.2` v7.58 W04 ACTIVE signature `6e7c581a8073`). Input: `AccountingPeriodTreeSearchInput!` (`{year, name}`). Response: `[AccountingPeriodTreeNode!]!`. BFF passthrough → `POST /api/v2/accounting-periods/tree`. AP-Q1 `searchAccountingPeriods` đã removed v7.54 — KHÔNG dùng. Cross-ref: paired BFF spec `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-LIST.md`."
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "n/a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-LIST.fe-web.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-LIST (FE Web): Danh sách kỳ kế toán

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-LIST` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `src/routes/_modules/_catalog/accounting-period/index.tsx` |
| Cross-tier consume | BE: FEAT-AP-LIST \| BFF: FEAT-AP-LIST |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) |
| Source version | v8 |
| Source SHA | `a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf` |
| Generated at | 2026-07-08T04:51:55+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần một danh mục kỳ kế toán tổ chức theo cấu trúc phân cấp Năm → Quý → Tháng để kiểm soát việc chốt sổ kho theo từng giai đoạn. Màn danh sách là điểm tra cứu trung tâm — cho phép xem nhanh các kỳ đã tạo, trạng thái đóng/mở của từng kỳ, tìm kiếm theo tên và lọc theo năm. Đây cũng là cửa ngõ điều hướng tới các thao tác vòng đời kỳ (tạo mới, xem chi tiết, sửa, xóa) — nền tảng cho việc tính giá xuất kho và khóa sổ các phiếu nhập/xuất theo kỳ ở các wave sau.

---

## 2. Trách nhiệm FE Web (garage-web)

- Render route dedicated `/inventory/accounting-period` — 1 trong 3 tab của khu vực **Danh mục** (cùng "Danh sách sản phẩm", "Nhóm vật tư hàng hóa") — bổ sung tab thứ 3 "Kỳ kế toán" vào SubNav dùng chung (`customs/inventory/sub-nav-danh-muc.tsx`, MODIFY).
- User flow chính: mount trang → fetch cây kỳ kế toán theo năm mặc định (năm hiện tại) → render bảng 6 cột dạng cây (Năm → Quý → Tháng, expand/collapse) → user search/filter/expand/thao tác từng dòng (Xem/Sửa/Xóa) hoặc bấm "Thêm kỳ kế toán" để tạo mới.
- State machine UI: `loading` (skeleton trên TableSection) → `tree` (dữ liệu populated) hoặc `empty` (0 kỳ — header/filter/CTA vẫn hiển thị đầy đủ) → `error` (toast, giữ bảng rỗng, cho retry).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (đã scan `.claude/references/web-component-registry.yaml` §G.X thay thế — KG parse error buộc dùng registry canonical): lookup key `data-table` → `share/tables/table` (P2, base structural table — extend tree-mode); `filter-panel` → `customs/filter/main-filter` + `customs/filter/filter-popover-trigger` + `customs/filter/single-select-filter-content` (P1, search + year dropdown filter); `badge` → `share/badges/badge` (P2, trạng thái chip); `alert-confirm` → `share/dialogs/alert-confirm` (P2, xác nhận xóa); `no-data` → `share/emptys/no-data` (P2, empty state). **KHÔNG có tree-hierarchy render primitive nào trong registry ở bất kỳ layer nào** — TreeCell (indent + chevron expand/collapse) là build-new, justification xem §5.2.
- **Figma spec là visual SSOT**: `Product/ux/figma-web/wave04-ap-list.md` (node `14492:89259`). Chú ý 5 coverage_gaps ghi ở frontmatter (icon Xem thiếu trong Figma, label dropdown năm generic, chevron pattern anomaly, không pagination, GraphQL op tên chưa xác nhận).
- GraphQL query consume từ BFF: `accountingPeriodTreeList` (**NEED CONFIRMATION** — placeholder tên op, xem coverage_gaps + §6.1) trả tree cấu trúc theo filter `keyword` + `year`.
- RBAC render: cả 2 persona `garage-owner` và `accountant` có quyền ngang nhau (per UX-FLOW "Người thực hiện: Chủ garage và Kế toán — quyền ngang nhau") — không có ẩn/hiện action theo persona trong LIST. Route gate qua TanStack Router `beforeLoad`: feature flag `Inventory:InventoryV2` OFF → redirect.

---

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage gate: 9/9 source AC-ID (AC-1..AC-9) cover ở dưới.

### Cluster A — Entry point & phân quyền

#### AC-1 → FE render trang danh sách kỳ kế toán dạng cây (route + page shell)

- **Khi**: User click tab "Kỳ kế toán" trong SubNav Danh mục hoặc navigate trực tiếp route `/inventory/accounting-period`.
- **FE phải**: Render Navbar + SubNav (tab "Kỳ kế toán" active, underline brand blue) + PageHeader ("Danh sách kỳ kế toán" H1 24px semibold + CTA "Thêm kỳ kế toán" top-right) + FilterRow (search + năm dropdown) + TableSection 6 cột dạng cây. Đây là full-page route, KHÔNG phải modal/dialog.
- **State transition**: `idle` → mount → gọi query tree list với `year = năm hiện tại` (loading skeleton trên TableSection) → `tree` (populated) hoặc `error` (toast).
- **Component**: `share/navigation/navbar-main` (REUSE, đã dùng ở AP-DETAIL/AP-EDIT — theo figma spec), `customs/inventory/sub-nav-danh-muc` (MODIFY — thêm tab thứ 3), `share/layouts/page-header` (P2).
- **GraphQL op**: `accountingPeriodTreeList` (NEED CONFIRMATION — xem §6.1).
- **i18n keys**: `inventory.accountingPeriod.list.title`, `inventory.accountingPeriod.list.addCta`.
- **a11y**: `<h1>` cho PageTitle; SubNav `role="tablist"` + `aria-selected` cho tab active.
- **Ref**: figma spec §1 Layout DSL PageHeader + SubNav, node `14653:92128`.

#### AC-9 → FE enforce phạm vi tenant + phân quyền route

- **Khi**: Route mount, trước khi render bất kỳ UI nào.
- **FE phải**: TanStack Router `beforeLoad` guard kiểm tra feature flag `Inventory:InventoryV2` ON + quyền truy cập (garage-owner | accountant — quyền ngang nhau). Flag OFF hoặc thiếu quyền → redirect về trang Danh mục mặc định (không show-then-disable). Mọi query tự động scope theo tenant hiện tại từ JWT context — FE KHÔNG truyền `tenantId` thủ công vào query variables.
- **Component**: Route loader/guard trong `src/routes/_modules/_catalog/accounting-period/index.tsx`.
- **RBAC**: redirect, không hiện route ẩn.
- **Ref**: bundle §UX-FLOW "Người thực hiện: Chủ garage và Kế toán — quyền ngang nhau"; primary enforcement (tenant filter) ở BE — xem `be/FEAT-AP-LIST.md §9` khi available.

### Cluster B — Bảng & cây phân cấp

#### AC-2 → FE render 6 cột bảng đúng thứ tự + nhãn verbatim

- **Khi**: TableSection render (mọi state — default/empty).
- **FE phải**: Render TableHeader 6 cột theo đúng thứ tự & nhãn verbatim Figma: "Tên kỳ kế toán" (392px, left) / "Loại kỳ kế toán" (392px, left) / "Ngày bắt đầu" (164px, left) / "Ngày kết thúc" (164px, left) / "Trạng thái" (164px, left) / "Thao tác" (100px, center). KHÔNG thêm cột "Thứ tự hiển thị" — field này chỉ dùng làm sort key ngầm (xem AC-6b).
- **Component**: `share/tables/table` (P2 base) với custom `columns` config.
- **i18n keys**: `inventory.accountingPeriod.list.columnName/.columnType/.columnStartDate/.columnEndDate/.columnStatus/.columnAction`.
- **a11y**: `<th scope="col">` cho mỗi header cell.
- **Ref**: figma spec §1 Layout DSL `TableHeader.columns`, node `14653:92128` L260; anti-pattern trap AP-AP-LIST-5.

#### AC-3 → FE render cây phân cấp Năm → Quý → Tháng với expand/collapse

- **Khi**: Query trả về danh sách node, mỗi node có `depth` (0=Năm, 1=Quý, 2=Tháng), `hasChildren`, `children[]`.
- **FE phải**: Render TreeCell tại cột "Tên kỳ kế toán" — indent theo `depth`; node có `hasChildren=true` hiện chevron toggle (collapsed = chevron-right, expanded = chevron-down — chuẩn shadcn Collapsible, KHÔNG port pattern chevron-up bất thường trong Figma PNG, xem coverage_gap); node lá (Tháng, `hasChildren=false`) KHÔNG có chevron. Toggle là client-side (dữ liệu tree đã load 1 lần, không re-fetch khi expand/collapse).
- **State transition**: local state `expandedIds: Set<string>` — toggle add/remove id.
- **Component**: `TreeCell` (**NEW/build-new** — xem §5.2 justification).
- **Ref**: figma spec §1 `TableBody.default_case.rowContent.TenKyKeToanCell`, node `14653:92128`; anti-pattern trap AP-AP-LIST-4.

#### AC-4 → FE hiển thị badge trạng thái đóng/mở kỳ + empty state toàn trang

- **Khi**: (a) mỗi row render cột "Trạng thái"; (b) query trả về 0 kỳ cho tenant.
- **FE phải**:
  1. Row status: badge chip TEXT-ONLY (KHÔNG icon) — "Đã đóng kỳ" (nền đỏ nhạt, chữ đỏ, `status = CLOSED`) hoặc "Chưa đóng kỳ" (nền xanh nhạt, chữ xanh, `status = OPEN`).
  2. Empty state: PageHeader + FilterRow + CTA "Thêm kỳ kế toán" **VẪN hiển thị đầy đủ và enabled** — chỉ TableBody chuyển sang illustration rỗng + caption "Không có dữ liệu" (semibold, centered).
- **State transition**: `tableBody: 'tree' | 'empty' | 'loading'`.
- **Component**: `share/badges/badge` (P2, 2 variant closed/open); `share/emptys/no-data` (P2, empty illustration + caption).
- **i18n keys**: `inventory.accountingPeriod.list.statusClosed`, `.statusOpen`, `.emptyCaption`.
- **Ref**: figma spec §1 `TrangThaiCell` + `TableBody.empty_case`, node `14653:92128` (default) + `13521:59963` (empty); anti-pattern trap AP-AP-LIST-2, AP-AP-LIST-3, AP-AP-LIST-11.

### Cluster C — Tìm kiếm & lọc

#### AC-5 → FE tìm kiếm theo tên kỳ kế toán

- **Khi**: User gõ vào ô search "Tìm theo tên kỳ kế toán".
- **FE phải**: Debounce 300ms → gọi lại query tree với `keyword` filter LIKE match **CHỈ trên tên kỳ** (KHÔNG match loại kỳ hay mã — anti-pattern trap AP-AP-LIST-9). Kết hợp AND với filter năm hiện hành.
- **Component**: search input trong `customs/filter/main-filter` (P1) — fallback `share/inputs/input-search` (P2) nếu main-filter không khớp anatomy sau khi DEV thử compose.
- **i18n keys**: `inventory.accountingPeriod.list.searchPlaceholder`.
- **Ref**: figma spec node `14653:92128` L200, placeholder "Tìm theo tên kỳ kế toán".

#### AC-6 → FE lọc theo năm (dropdown default năm hiện tại, sort desc) + sort ngầm theo displayOrder

- **Khi**: Page mount hoặc user chọn năm khác từ dropdown.
- **FE phải**: Render YearFilter hiển thị "Năm {year}" (KHÔNG dùng nhãn generic Figma "Kỳ kế toán" — coverage_gap); default = năm hiện tại; dropdown liệt kê các năm có kỳ, sort **DESCENDING** (năm mới nhất lên đầu — anti-pattern trap AP-AP-LIST-8). Chọn năm khác → re-query tree filter theo năm mới. **Dropdown KHÔNG cho phép clear/bỏ chọn** (per FEAT v10 BA confirm 2026-07-08): KHÔNG render nút × / option "Tất cả" / "Xóa lọc"; component `single-select-filter-content` PHẢI được compose với prop `clearable={false}` (hoặc tương đương — DEV verify prop; nếu component mặc định có clear icon → wrap/extend qua `/allow-new-component` reason="extend"). State `year: number` luôn có giá trị hợp lệ, KHÔNG bao giờ null/undefined. Trong mỗi cấp cha, rows sort **ASC theo `displayOrder`** (field ẩn, KHÔNG hiển thị thành cột — AC-6b, anti-pattern trap AP-AP-LIST-5/AP-AP-LIST-6).
- **Component**: `customs/filter/filter-popover-trigger` + `customs/filter/single-select-filter-content` (P1).
- **i18n keys**: `inventory.accountingPeriod.list.yearFilterLabel`.
- **Ref**: figma spec node `14653:92128` L200 `YearFilter`; anti-pattern trap AP-AP-LIST-7, AP-AP-LIST-8, AP-AP-LIST-10.

### Cluster D — Thao tác dòng & điều hướng

#### AC-7 → FE render 2 icon Thao tác + click-name Xem chi tiết

- **Khi**: Mỗi row (mọi cấp — Năm/Quý/Tháng) render cột "Tên kỳ kế toán" + cột "Thao tác".
- **FE phải** (per FEAT v9, BA confirm 2026-07-08 in-session):
  1. **Cột "Tên kỳ kế toán"** (cột đầu tiên): render giá trị `row.name` **dạng link** (`role="link"`, `cursor: pointer`, hover underline) — click → `navigate('/inventory/accounting-period/{id}')` (mở FEAT-AP-DETAIL). KHÔNG thay đổi indentation/chevron của TreeCell — chevron toggle (expand/collapse) và text link là 2 hit-target độc lập trong cùng cell.
  2. **Cột "Thao tác"** (cột cuối): render **2 icon-button ghost**:
     - **Sửa** (icon Edit2) → `navigate('/inventory/accounting-period/edit/{id}')` (mở FEAT-AP-EDIT).
     - **Xóa** (icon Trash) → mở `AlertConfirm` xác nhận xóa (mở FEAT-AP-DELETE khi confirm).
  KHÔNG render icon Eye/Xem trong cột Thao tác — pattern này lệch với các list khác (Product/Group render 3 icon), đây là quyết định chủ đích riêng cho AP-LIST. Figma PNG khớp với behaviour này (2 icon).
- **Component**: `share/buttons/button` variant `ghost` size `icon` × 2 (P2); `share/dialogs/alert-confirm` (P2) cho Xóa; TreeCell (build-new) render name text như `<Link>` component từ TanStack Router.
- **i18n keys**: `inventory.accountingPeriod.list.actionEdit/.actionDelete`, `.deleteConfirmTitle`. (Bỏ `.actionView` — không còn nút riêng.)
- **a11y**: cell "Tên kỳ kế toán" link có `aria-label` "Xem chi tiết kỳ kế toán {row.name}"; 2 icon-button có `aria-label` "Sửa kỳ kế toán {row.name}" / "Xóa kỳ kế toán {row.name}".
- **Ref**: figma spec node `14653:92128` `ThaoTacCell` (2 button: RowEditButton/RowDeleteButton); FEAT-AP-LIST v9 AC-7.

#### AC-8 → FE mở form thêm kỳ kế toán

- **Khi**: User click CTA "Thêm kỳ kế toán" (top-right PageHeader — luôn enabled kể cả ở empty state).
- **FE phải**: `navigate('/inventory/accounting-period/create')` (mở FEAT-AP-CREATE) — full-page navigation, KHÔNG mở modal.
- **Component**: `share/buttons/button` variant brand + leading icon `AddCircle` (iconsax-reactjs) (P2).
- **i18n keys**: `inventory.accountingPeriod.list.addCta` (dùng chung với AC-1).
- **Ref**: figma spec node `14653:92128` `AddCTA.onClick`.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave04-ap-list.md` (node `14492:89259`), 2 screen: Default populated tree (`14653:92128`) + Empty state (`13521:59963`).
- Design token bám `§5.3` — không hardcode hex/px ngoài token map.
- Cột "Thao tác" render **2 icon** (Sửa + Xóa) khớp Figma; Xem chi tiết trigger bằng click cột đầu "Tên kỳ kế toán" (link) — per FEAT v9 (BA confirm 2026-07-08).
- Dropdown năm PHẢI hiển thị "Năm {year}" thay vì label generic Figma "Kỳ kế toán" (coverage_gap #2).
- Dropdown năm **KHÔNG cho phép clear/bỏ chọn** — không có nút × / option "Tất cả" / "Xóa lọc"; user chỉ đổi giá trị sang năm khác, luôn có đúng 1 năm được chọn (per FEAT v10 BA confirm 2026-07-08; anti-pattern trap: hiển thị icon clear trong YearFilter dropdown).
- Chevron expand/collapse dùng chuẩn shadcn (chevron-right → chevron-down), không port anomaly Figma (coverage_gap #4).
- Badge trạng thái là text-chip KHÔNG icon — sai lệch = anti-pattern trap AP-AP-LIST-2/AP-AP-LIST-3.

### 4.2 State machine + error handling

- State transition tường minh: `idle → loading → tree | empty → error`.
- Loading: skeleton trên TableSection (giữ Header/FilterRow/CTA nguyên trạng, không skeleton toàn trang).
- Error (network/BFF fail): TOAST error + giữ bảng ở state trước đó (hoặc empty nếu lần fetch đầu) + cho phép retry (click lại filter hoặc reload).
- KHÔNG silent fail — mọi lỗi phải reach UI qua toast hoặc inline banner.

### 4.3 i18n + a11y

- **LocaleKeys mandatory**: mọi label string qua i18n key `src/i18n/{vi,en}.json` namespace `inventory.accountingPeriod.list.*` (liệt kê đủ ở frontmatter `i18n_keys`) — KHÔNG hardcode tiếng Việt inline trong JSX. Nhãn vi PHẢI verbatim khớp Figma (per §11.1).
- SubNav: `role="tablist"` + mỗi tab `role="tab"` + `aria-selected`.
- TreeCell expand toggle: `aria-expanded` + `aria-label` ("Mở rộng {periodName}" / "Thu gọn {periodName}").
- Icon-button hành động: `aria-label` bắt buộc (icon-only).
- Table header: `<th scope="col">`.
- Keyboard nav: Tab qua search → year filter → tree rows (Enter toggle expand) → row actions; Escape đóng AlertConfirm.

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` gate route qua `beforeLoad` — OFF → redirect (không show-then-disable).
- 2 persona `garage-owner` + `accountant` quyền ngang nhau — không có action nào ẩn/hiện theo persona riêng cho LIST (Critical Rule #6 — không tạo actor mới).
- Query luôn tenant-scoped tự động từ JWT context.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem `be/FEAT-AP-LIST.md §9` khi tier BE được author). FE chỉ:
  - Tenant-scope query tự động (không truyền tenantId thủ công) — hỗ trợ BR-AP-003.
  - Badge trạng thái hiển thị đúng theo field `status` từ BE (không tự suy luận trạng thái ở client) — hỗ trợ BR-AP-015 (liên quan trạng thái đóng/mở kỳ).
  - Toast/redirect khi server reject với error code (xem §4.6).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| Generic fetch/network error | TOAST | `share/toasts/toast` | AC-1 |
| `ERR-AP-*` (nếu BFF forward lỗi từ BE — TBD khi BE tier author) | TOAST | `share/toasts/toast` | AC-1 |
| RBAC/permission denied | REDIRECT (route guard) | route loader | AC-9 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `AccountingPeriodListPage` | `/inventory/accounting-period` | NEW | `14653:92128` (default) / `13521:59963` (empty) | AC-1..9 |
| `SubNavDanhMuc` | (shared, mọi tab Danh mục) | MODIFY (thêm tab "Kỳ kế toán") | — | AC-1 |

### 5.2 Components new/modified

> Reuse priority `customs/` > `share/` > `ui/`. Đã scan `.claude/references/web-component-registry.yaml` (thay thế KG do parse error ở §G.X) theo lookup key `data-table`, `filter-panel`, `badge-status`/`badge`, `alert-confirm`, `no-data`, `icon-button`, `primary-button`, `page-header`.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `NavbarMain` | `src/components/share/navigation/navbar-main.tsx` | REUSE | existing props | — | **Priority 2 — share/** (identical AP-DETAIL/AP-EDIT theo figma spec) | AC-1 |
| `SubNavDanhMuc` | `src/components/customs/inventory/sub-nav-danh-muc.tsx` | MODIFY | `{ activeKey: "accounting-period" }` | — | **Priority 1 — customs/** (thêm tab thứ 3 vào component domain sẵn có) | AC-1 |
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, primaryCta: { label, icon, onClick } }` | — | **Priority 2 — share/** (registry lookup `page-header`) | AC-1, AC-4, AC-8 |
| `MainFilter` | `src/components/customs/filter/main-filter.tsx` | REUSE | `{ searchValue, onSearchChange, filters }` | — | **Priority 1 — customs/** (registry lookup `filter-panel` — combine search + filter chip) | AC-5, AC-6 |
| `FilterPopoverTrigger` + `SingleSelectFilterContent` | `src/components/customs/filter/{filter-popover-trigger,single-select-filter-content}.tsx` | REUSE | `{ label, options, selected, onSelect }` | — | **Priority 1 — customs/** (year dropdown chip) | AC-6 |
| `Table` | `src/components/share/tables/table.tsx` | REUSE (extend) | `{ columns, rows }` | — | **Priority 2 — share/** (registry lookup `data-table`; base header/body, extend cho tree render) | AC-2, AC-3 |
| `TreeCell` (kebab-case: `tree-cell.tsx`) | `src/features/inventory-accounting-period/components/tree-cell.tsx` | NEW | `{ depth, hasChildren, expanded, onToggle, children }` | local `expandedIds` | **Build-new** — justification: không có tree-hierarchy render primitive trong registry ở bất kỳ layer nào (`data-table` chỉ cover header/body/row-selection/sticky-cols, không cover indent/expand-collapse) | AC-3 |
| `Badge` | `src/components/share/badges/badge.tsx` | REUSE | `variant: 'destructive-subtle' \| 'success-subtle'` | — | **Priority 2 — share/** (registry lookup `badge`) | AC-4 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ message }` | — | **Priority 2 — share/** (registry lookup `no-data`) | AC-4 |
| `Button` (icon action) | `src/components/share/buttons/button.tsx` | REUSE | `variant="ghost" size="icon"` × 3 | — | **Priority 2 — share/** (registry lookup `icon-button`) | AC-7 |
| `AlertConfirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ open, onConfirm, onCancel, title }` | — | **Priority 2 — share/** (registry lookup `alert-confirm`) | AC-7 |
| `Button` (CTA) | `src/components/share/buttons/button.tsx` | REUSE | `variant="brand"` + leading icon | — | **Priority 2 — share/** (registry lookup `primary-button`) | AC-8 |
| `AccountingPeriodListPage` (kebab-case: `index.tsx`) | `src/routes/_modules/_catalog/accounting-period/index.tsx` | NEW | — | `expandedIds, keyword, year, filterState` | **Build-new** — justification: page-level route orchestrator, không có component fit ở customs/share/ui cho toàn bộ page composition; pattern domain-new | AC-1..9 |

### 5.3 Design tokens & Figma refs

> Tokens detected tại bundle §G.Y (`bg-brand`, `bg-destructive`, `text-foreground`, `text-muted-foreground`, `text-primary`) + tokens verified trực tiếp từ figma spec §2 Design Token Map / §1 Layout DSL variant map (đọc trực tiếp file, không chỉ bundle excerpt).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-brand` (`#0052ff`) | figma spec §2 Design Token Map | Navbar background + AddCTA button background | AC-1, AC-8 |
| `text-foreground` (`#18181b`) | figma spec §2 | PageTitle color + table row text | AC-1, AC-2 |
| `text-muted-foreground` (`#71717a`) | figma spec §2 | TableHeader label color + row action icon color | AC-2, AC-7 |
| `text-primary` | figma spec §1 (SubNav active tab underline) | Active tab indicator "Kỳ kế toán" | AC-1 |
| `bg-destructive` (mapped từ `bg-destructive-subtle`/`text-destructive` trong figma §1 Layout DSL variant_closed) | figma spec §1 `TrangThaiCell.variant_closed` | Badge "Đã đóng kỳ" background + text | AC-4 |
| `bg-success` (mapped từ `bg-success-subtle`/`text-success` trong figma §1 Layout DSL variant_open) | figma spec §1 `TrangThaiCell.variant_open` | Badge "Chưa đóng kỳ" background + text | AC-4 |
| `border-input` (`#d4d4d8`) | figma spec §2 | SearchInput + YearFilter border | AC-5, AC-6 |
| `border-border` (`#e4e4e7`) | figma spec §2 | Table header/row border-bottom | AC-2 |

> **Figma source-of-truth**: visual / micro-interaction / responsive theo `Product/ux/figma-web/wave04-ap-list.md`. Không re-invent layout — đặc biệt cấu trúc TreeCell indent + chevron và 2-state (default/empty).

---

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `accountingPeriodTreeList` (**NEED CONFIRMATION** — tên op tạm, xem coverage_gaps) | query | `src/api/graphql/accountingPeriodTreeList.graphql` | `['accounting-period', 'tree', { year, keyword }]` | `AccountingPeriodTreeNodeFragment` | AC-1, AC-3, AC-5, AC-6 |

> Mọi op phải tồn tại ở paired BFF FEAT `features/bff/FEAT-AP-LIST.md §6.1` — file này chưa được author tại thời điểm spec FE-web này generate (bundle không cung cấp op chính xác cho domain kỳ kế toán). DEV PHẢI đối chiếu lại tên op + shape response khi BFF tier spec sẵn sàng, trước khi codegen.

### 6.2 REST endpoints consumed direct (bypass BFF)

_(không có — mọi data qua BFF GraphQL)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (tree list) | TanStack Query | — | `['accounting-period', 'tree', { year, keyword }]` | AC-1, AC-5, AC-6 |
| Expanded tree node ids | Local state (`useState`) | `AccountingPeriodListPage` | `expandedIds: Set<string>` | AC-3 |
| Search keyword | Local state (debounced) | `AccountingPeriodListPage` | `keyword: string` | AC-5 |
| Selected year filter | Local state | `AccountingPeriodListPage` | `year: number` (default = current year) | AC-6 |
| Delete confirm dialog | Local state | `AccountingPeriodListPage` | `deleteTargetId: string \| null` | AC-7 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/accounting-period` | `AccountingPeriodListPage` | `beforeLoad` prefetch tree query năm hiện tại | Feature flag `Inventory:InventoryV2` + role `garage-owner \| accountant` | AC-1, AC-9 |

---

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| Route | `src/routes/_modules/_catalog/accounting-period/index.tsx` | NEW | TanStack Router createFileRoute + beforeLoad guard | ~60 | AC-1, AC-9 |
| SubNav | `src/components/customs/inventory/sub-nav-danh-muc.tsx` | MODIFY (thêm tab) | customs/filter pattern sẵn có | ~10 | AC-1 |
| Page | `src/features/inventory-accounting-period/pages/AccountingPeriodListPage.tsx` | NEW | React FC + local state | ~180 | AC-1..9 |
| Component | `src/features/inventory-accounting-period/components/tree-cell.tsx` | NEW | build-new (xem §5.2) | ~90 | AC-3 |
| Component | `src/features/inventory-accounting-period/components/status-badge.tsx` | NEW (thin wrapper `share/badges/badge`) | wrap share/badges/badge với 2 variant | ~25 | AC-4 |
| Component | `src/features/inventory-accounting-period/components/row-actions.tsx` | NEW | wrap 3× `share/buttons/button` ghost/icon | ~50 | AC-7 |
| Hook | `src/features/inventory-accounting-period/hooks/use-accounting-period-tree-list.ts` | NEW | TanStack `useQuery` wrapper | ~30 | AC-1, AC-5, AC-6 |
| Types | `src/features/inventory-accounting-period/types/accounting-period.types.ts` | NEW | TypeScript interfaces | ~35 | — |
| GraphQL | `src/api/graphql/accountingPeriodTreeList.graphql` | NEW | query (op name TBD — coverage_gap) | ~20 | AC-1 |
| Generated | `src/api/generated/accountingPeriodTreeList.generated.ts` | AUTO-GEN | codegen | — | — |
| i18n | `src/i18n/vi/inventory-accounting-period.json` | NEW | i18next namespace | ~20 | AC-1..8 |
| i18n | `src/i18n/en/inventory-accounting-period.json` | NEW | i18next namespace | ~20 | AC-1..8 |
| Tests | `tests/features/inventory-accounting-period/AccountingPeriodListPage.test.tsx` | NEW | Vitest + RTL | ~200 | AC-1..9 |

---

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: accountingPeriodTreeList SDL + resolver stable — op name pending confirmation)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma wave04-ap-list.md confirmed
    Exit: E2E happy path green (smoke — load tree → expand/collapse → search → filter năm → row action navigate)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6.1 | Route + SubNav tab MODIFY + RBAC guard | routes + components/customs | — | Route navigable, tab hiển thị | — |
| S6.2 | PageHeader + FilterRow (main-filter + year dropdown) | features/components | S6.1 | Filter UI render OK | S6.1 |
| S6.3 | Table + TreeCell + StatusBadge (mock data) | features/components | S6.2 | Tree render + expand/collapse OK (mock) | S6.2 |
| S6.4 | Hook `use-accounting-period-tree-list` (BFF S5) | features/hooks | BFF S5 | Real data render OK | S6.3 |
| S6.5 | RowActions (Xem/Sửa/Xóa) + AlertConfirm | features/components | S6.4 | Navigate + confirm dialog OK | S6.4 |
| S6.6 | Empty state + error toast | features/pages | S6.4 | Empty/error state render OK | S6.4 |
| S6.7 | i18n keys wiring (vi/en) | i18n | S6.1-S6.6 | Không còn hardcode string | S6.6 |
| S6.8 | E2E smoke (Playwright happy path) | tests | S6.7 | E2E green | S6.7 |

---

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ: tenant-scope query, RBAC render, error display. BR text chi tiết chưa có trong bundle này (bundle §D không tìm thấy section mention cụ thể) — xem BE tier `features/be/FEAT-AP-LIST.md §9` khi available để đối chiếu.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-003` | NEED CONFIRMATION (BE tier chưa author) | Query tenant-scoped tự động, không truyền tenantId thủ công | `hooks/use-accounting-period-tree-list.ts` | AC-1, AC-9 | BE final enforce (tenant filter) |
| `BR-AP-010` | NEED CONFIRMATION | (rule text pending BE tier) | — | AC-6 | Liên quan tới filter/sort — đối chiếu lại khi BE tier sẵn sàng |
| `BR-AP-015` | NEED CONFIRMATION | Badge trạng thái hiển thị đúng field `status` từ BE, không tự suy luận | `components/status-badge.tsx` | AC-4 | Liên quan đóng/mở kỳ |
| `BR-GF-INVENTORY-ACCOUNTING-PERIOD` (umbrella) | N/A | Không có UI action riêng cho LIST — governance doc cấp boundary | — | — | Tham chiếu chung cho slice AP |

> **Primary enforcement** = BE tier (`features/be/FEAT-AP-LIST.md §9`) — chưa tồn tại tại thời điểm spec FE-web này generate.

---

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (route render + page shell) | test-ui | Navbar + SubNav tab active + PageHeader + FilterRow + Table render |
| AC-2 | UI (table columns) | test-ui | Verify đúng 6 cột, đúng thứ tự + nhãn verbatim |
| AC-3 | UI (tree expand/collapse) | test-ui | Indent theo depth, chevron toggle, leaf không chevron |
| AC-4 | UI (badge + empty state) | test-ui | 2 variant badge + empty illustration header vẫn hiện |
| AC-5 | UI (search debounce) | test-ui | LIKE match tên kỳ only |
| AC-6 | UI (year filter default + sort desc) | test-ui | Default năm hiện tại, dropdown sort desc |
| AC-7 | UI (3 row actions) | test-ui | Xem/Sửa navigate đúng route, Xóa mở confirm |
| AC-8 | UI (CTA navigate) | test-ui | Navigate `/create`, enabled cả empty state |
| AC-9 | UI (RBAC + flag gate) | test-ui + test-isolation | Flag OFF redirect; dual persona check |
| (smoke) | E2E happy path | test-e2e | Playwright: load tree → expand → search → filter năm → click Xem |

---

## 11. i18n & a11y

### 11.1 i18n keys

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventory.accountingPeriod.list.title` | "Danh sách kỳ kế toán" | "Accounting period list" | AC-1 |
| `inventory.accountingPeriod.list.addCta` | "Thêm kỳ kế toán" | "Add accounting period" | AC-1, AC-8 |
| `inventory.accountingPeriod.list.searchPlaceholder` | "Tìm theo tên kỳ kế toán" | "Search by period name" | AC-5 |
| `inventory.accountingPeriod.list.yearFilterLabel` | "Năm {{year}}" | "Year {{year}}" | AC-6 |
| `inventory.accountingPeriod.list.columnName` | "Tên kỳ kế toán" | "Period name" | AC-2 |
| `inventory.accountingPeriod.list.columnType` | "Loại kỳ kế toán" | "Period type" | AC-2 |
| `inventory.accountingPeriod.list.columnStartDate` | "Ngày bắt đầu" | "Start date" | AC-2 |
| `inventory.accountingPeriod.list.columnEndDate` | "Ngày kết thúc" | "End date" | AC-2 |
| `inventory.accountingPeriod.list.columnStatus` | "Trạng thái" | "Status" | AC-2 |
| `inventory.accountingPeriod.list.columnAction` | "Thao tác" | "Action" | AC-2 |
| `inventory.accountingPeriod.list.statusClosed` | "Đã đóng kỳ" | "Closed" | AC-4 |
| `inventory.accountingPeriod.list.statusOpen` | "Chưa đóng kỳ" | "Open" | AC-4 |
| `inventory.accountingPeriod.list.emptyCaption` | "Không có dữ liệu" | "No data" | AC-4 |
| `inventory.accountingPeriod.list.actionView` | "Xem chi tiết" | "View detail" | AC-7 |
| `inventory.accountingPeriod.list.actionEdit` | "Sửa" | "Edit" | AC-7 |
| `inventory.accountingPeriod.list.actionDelete` | "Xóa" | "Delete" | AC-7 |
| `inventory.accountingPeriod.list.deleteConfirmTitle` | "Xóa kỳ kế toán?" | "Delete accounting period?" | AC-7 |

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | SubNav `role="tablist"`, tab `role="tab"` + `aria-selected` | keyboard nav Left/Right giữa tab |
| AC-2 | Table header `<th scope="col">` cho 6 cột | screen reader |
| AC-3 | TreeCell toggle: `aria-expanded` + `aria-label` mô tả tên kỳ | keyboard Enter/Space toggle |
| AC-4 | Badge trạng thái: đủ contrast WCAG AA cho text-on-subtle-bg | manual QA |
| AC-7 | 3 icon-button: `aria-label` bắt buộc ("Xem chi tiết", "Sửa", "Xóa") | icon-only buttons |
| AC-9 | Redirect khi thiếu quyền: không render UI trung gian (tránh flash-of-unauthorized-content) | route guard |

---

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-LIST.md` | PENDING (chưa author tại thời điểm FE-web tier này generate) | BR primary enforcement, contract source (REST `POST /protected/accounting/v1/accounting-periods/search` — V4-AP-1) |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-LIST.md` | PENDING (chưa author) | GraphQL op `accountingPeriodTreeList` (NEED CONFIRMATION tên chính thức khi tier này sẵn sàng) — §6.1 |
| Mobile | — | N/A | AP-LIST không có mobile screen riêng trong W04 (xem `FEAT-INV-MOBILE-MENU` cho mobile hub tile) |

**Source ID consistency** (item 18): `source_feat_sha` = `a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf` — PHẢI identical với BE/BFF tier files khi được author.

---

## 13. References

- **Source**: [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) v8
- **Paired BE**: [`features/be/FEAT-AP-LIST.md`](../be/FEAT-AP-LIST.md) (chưa tồn tại — pending)
- **Paired BFF**: [`features/bff/FEAT-AP-LIST.md`](../bff/FEAT-AP-LIST.md) (chưa tồn tại — pending)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md)
- **Figma spec**: [`Product/ux/figma-web/wave04-ap-list.md`](../../../../../Product/ux/figma-web/wave04-ap-list.md) (node `14492:89259`)
- **Web component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

---

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-AP-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web (reuse-first customs/filter + share/tables/table + build-new TreeCell), §3 FE behaviour map 9/9 AC-ID, §4 visual fidelity + state + i18n (LocaleKeys mandatory) + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (screens/components/GraphQL consumed op TBD/state/cross-tier pair). Source FEAT chỉ audit. NEED CONFIRMATION: (a) tên GraphQL op chính thức (BFF tier chưa author), (b) pagination cho tree ≥50 nodes, (c) BR-AP-003/010/015 rule text chi tiết (chờ BE tier). |
| 2026-07-08 | 2 | Delivery Authority (quannn) + main agent | **Rewrite AC-7 § — bỏ icon Xem, chuyển Xem chi tiết sang click cột "Tên kỳ kế toán"** (cascade từ FEAT-AP-LIST v9 BA confirm 2026-07-08 in-session, phản hồi gap review fe-web vs figma-web). §3 Cluster D AC-7: cột "Thao tác" render **2 icon** (Sửa + Xóa) khớp Figma; cột đầu "Tên kỳ kế toán" render dạng link → click mở FEAT-AP-DETAIL; TreeCell giữ chevron toggle độc lập. §0 coverage_gaps entry AC-7 rewrite từ "Figma thiếu Eye icon → FE PHẢI render 3 icon per FEAT authoritative" thành "Figma khớp v9 — 2 icon + click-name pattern, KHÔNG copy 3-icon từ list khác". §4.1 visual fidelity bullet cột Thao tác rewrite. i18n bỏ key `.actionView`. a11y refine `aria-label` cho cell link. Component list bỏ 1 icon-button (3→2). frontmatter bump `source_version 8→9`, `source_feat_sha` mới `4f5dea…7ad935`, spec `version 1→2`. |
| 2026-07-08 | 3 | Delivery Authority (quannn) + main agent | **AC-6 bổ sung ràng buộc: YearFilter dropdown KHÔNG cho phép clear** (cascade FEAT v10 BA confirm 2026-07-08 in-session). §3 Cluster C AC-6: thêm câu tường minh — dropdown KHÔNG render nút × / option "Tất cả" / "Xóa lọc"; `single-select-filter-content` PHẢI compose với prop `clearable={false}` (DEV verify prop; nếu component mặc định có clear icon → wrap/extend qua `/allow-new-component reason=extend`); state `year: number` luôn có giá trị hợp lệ, không bao giờ null. §4.1 visual fidelity thêm bullet non-clearable + anti-pattern trap. §0 coverage_gaps thêm entry AC-6 non-clearable với hướng dẫn DEV. frontmatter bump `source_version 9→10`, `source_feat_sha` mới `4f8f84…beb83`, spec `version 2→3`. Không đổi contract BFF/BE (query luôn có `year` mandatory) — chỉ ràng buộc client-side UX. |
