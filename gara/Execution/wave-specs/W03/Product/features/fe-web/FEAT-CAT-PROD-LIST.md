---
type: execution
artifact_kind: converted-feature
tier_role: fe-web
source_ref: "Product/features/FEAT-CAT-PROD-LIST.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-LIST"
source_feat_sha: "d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118"
generated_at: "2026-06-29T15:00:00Z"
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
consumes_backend_feats: ["FEAT-CAT-PROD-LIST"]
consumes_bff_feats: ["FEAT-CAT-PROD-LIST"]
i18n_keys: []
screens_touched:
  - "src/features/inventory/catalog/pages/InternalProductListPage.tsx"
figma_refs:
  - "Product/ux/figma-web/wave03-cat-prod-list.md (node 14329:254775 — Empty State 14432:89699 + Populated State 14322:176695)"
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "NEED CONFIRMATION"
  template_sha: "b196f9...8b1398"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-LIST.fe-web.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-LIST (FE Web): Danh sách mã sản phẩm nội bộ

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-LIST` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Screens touched | `src/features/inventory/catalog/pages/InternalProductListPage.tsx` |
| Cross-tier consume | BE: `FEAT-CAT-PROD-LIST` \| BFF: `FEAT-CAT-PROD-LIST` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) |
| Source version | v7 |
| Source SHA | `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` |
| Generated at | 2026-06-29T15:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu nhanh danh sách mã sản phẩm nội bộ — chuẩn dùng để tính tồn kho và mapping SKU — để định vị sản phẩm cụ thể, kiểm tra trạng thái/tính chất, và truy cập các thao tác quản lý. Feature là điểm vào chính của subsystem catalog-v2 trong gf-inventory, cung cấp nền dữ liệu cho toàn bộ nghiệp vụ nhập/xuất/tồn kho V2. Kết quả tra cứu được phân trang và lọc đa chiều (từ khóa, trạng thái, tính chất, nhóm vật tư).

## 2. Trách nhiệm FE Web (garage-web)

- Render màn hình danh sách tại route `/inventory/internal-products`, tab "Danh sách sản phẩm" được chọn trong sub-tab nav; layout 3 tab (Danh sách sản phẩm / Nhóm vật tư hàng hóa / Kỳ kế toán) — xem figma spec `wave03-cat-prod-list.md` §1 Layout DSL `SubTabNav`.
- Fetch dữ liệu qua BFF query `searchInternalProducts` (V2-Q4), truyền filter `{keyword, status, nature, materialGroupId, page, size}` từ state UI; mặc định `status=ACTIVE`, `page=0`, `size=20`.
- Quản lý 4 state UI: `idle | loading | success | error` — skeleton table khi loading, empty-state khi no data, danh sách 10 cột khi có data, toast khi fetch error.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: Author đã scan `.claude/references/web-component-registry.yaml` (canonical registry, §G.X KG parse error → scan manual). Kết quả reuse ở §5.2.
- **Figma spec là visual SSOT**: layout, token, label verbatim từ `Product/ux/figma-web/wave03-cat-prod-list.md` (node 14329:254775). Mọi visual ref trong spec này cross-ref figma sections cụ thể.
- Consume BFF query `searchInternalProducts` cho danh sách; consume BFF query `searchMaterialGroups` (NEED CONFIRMATION tên op) để populate dropdown NhomHang.
- RBAC render: nút "Thêm sản phẩm" + "Tải lên" + "Xuất file" + row actions Sửa/Xóa chỉ hiển thị với `garage-owner` hoặc `accountant` có quyền catalog write — KHÔNG show-then-disable; conditional render.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Khởi tải màn hình danh sách

#### AC-1 → FE render màn hình danh sách khi user mở tab Danh sách sản phẩm

- **Khi**: user điều hướng đến route `/inventory/internal-products` hoặc click tab "Danh sách sản phẩm"
- **FE phải**: mount `InternalProductListPage`, trigger BFF query `searchInternalProducts` với default params `{status: ACTIVE, page: 0, size: 20}`, hiển thị skeleton table trong quá trình fetch
- **State transition**: `idle → loading (skeleton) → success (table populated) | error (toast)`
- **Component**: `InternalProductListPage.tsx` (NEW)
- **GraphQL op**: `searchInternalProducts` — input `{status: ACTIVE, page: 0, size: 20}`
- **i18n keys**: fixed VN labels (NEED CONFIRMATION — xem §4.3)
- **a11y**: page title `<h1>` "Danh sách sản phẩm" visible, tab trigger `role="tab"` với `aria-selected`
- **Ref**: figma spec `wave03-cat-prod-list.md` §1 Layout DSL `EmptyStatePage` + `PopulatedPage`, node `14432:89699` (empty) / `14322:176695` (populated)

#### AC-2 → FE render bảng 10 cột đúng thứ tự và label verbatim

- **Khi**: BFF `searchInternalProducts` trả về danh sách (success state)
- **FE phải**: render bảng với đúng 10 cột theo thứ tự: STT / Mã sản phẩm nội bộ (link `text-primary` → DETAIL) / Tên sản phẩm / Tính chất / Nhóm vật tư/hàng hoá / ĐVT chính / Thương hiệu / Xuất xứ / Trạng thái (StatusBadge pill) / Thao tác (2 icon)
- **State transition**: success — bảng filled; Trạng thái "Đang hoạt động" = green pill (`bg-background-success`/`text-foreground-success`); "Ngừng hoạt động" = red pill (`bg-background-error`/`text-foreground-error`)
- **Component**: `InternalProductTable.tsx` (NEW) reuse `share/tables/table` base
- **GraphQL op**: data từ `searchInternalProducts` response `.content[]`
- **a11y**: table với `<thead>/<tbody>`, Mã link có `aria-label="Xem chi tiết sản phẩm {code}"`; column label "Nhóm vật tư/hàng hoá" với slash và tone "hoá" (NOT "hóa" — figma verbatim `14432-89699.png L11`)
- **Ref**: figma spec `wave03-cat-prod-list.md` §4 Component Prop Map `Table` + §2 Design Token Map `StatusBadge`; `14322-176695.png` (Populated State)

#### AC-7 → FE render pagination row và xử lý chuyển trang

- **Khi**: BFF response `totalPages > 1`
- **FE phải**: render `PaginationRow` gồm `PageSizeControl` ("Hiển thị [20▾] mỗi trang") + `PageNavControl` (Trước / số trang / Tiếp); khi user đổi page size hoặc click số trang → re-trigger `searchInternalProducts` với `{page, size}` mới
- **State transition**: `loading (skeleton) → success` mỗi lần thay đổi trang
- **Component**: `TablePagination` (REUSE — NEED CONFIRMATION path, xem §5.2); `PageSizeSelect` dùng `share/inputs/input-select`
- **GraphQL op**: `searchInternalProducts` re-call với `page`/`size` mới
- **a11y**: pagination nav có `aria-label="Điều hướng trang"`, nút Trước/Tiếp có `aria-label` + disabled state khi first/last page
- **Ref**: figma spec `wave03-cat-prod-list.md` §1 Layout DSL `PaginationRow`, `14322-176695.png L25`

### Cluster B — Tìm kiếm và lọc

#### AC-3 → FE phải cung cấp search input debounce 300ms cho keyword

- **Khi**: user gõ vào ô tìm kiếm
- **FE phải**: debounce 300ms, reset page=0, re-trigger `searchInternalProducts` với `keyword` mới; placeholder verbatim "Tìm theo mã nội bộ, tên sản phẩm, SKU..." (char-by-char per figma `14432-89699.png L8`)
- **State transition**: `loading (skeleton) → success | error`
- **Component**: `share/inputs/input-search` (Priority 2 — share/; `form-search-input` registry key) với `w-[320px]` fixed per figma §6 Layout Width Table
- **GraphQL op**: `searchInternalProducts` `keyword` param
- **i18n keys**: fixed VN placeholder (NEED CONFIRMATION)
- **a11y**: `<input type="search">` + `aria-label="Tìm kiếm sản phẩm"` + icon `search-normal-1` (lucide-react) leading
- **Ref**: figma spec `wave03-cat-prod-list.md` §5 Field Composition Schema `SearchField`; `14432-89699.png L8`

#### AC-4 → FE render filter Trạng thái và pass vào BFF query

- **Khi**: user chọn option trong dropdown "Trạng thái"
- **FE phải**: reset page=0, re-trigger `searchInternalProducts` với `status` param; options = `{ALL: "Tất cả", ACTIVE: "Đang hoạt động", INACTIVE: "Ngừng hoạt động"}`; default ACTIVE (figma §5 `StatusFilterField`)
- **State transition**: re-loading → success
- **Component**: `customs/filter/single-select-filter-content` (Priority 1 — customs/; `filter-single-select` registry key); `w-[123px]` per figma §6
- **GraphQL op**: `searchInternalProducts` `status` param
- **Ref**: figma spec `wave03-cat-prod-list.md` §5 Field Composition Schema `StatusFilterField`; `14432-89699.png L8`

#### AC-5 → FE render filter Tính chất (nature enum) và pass vào BFF query

- **Khi**: user chọn option trong dropdown "Tính chất"
- **FE phải**: reset page=0, re-trigger `searchInternalProducts` với `nature` param; options = enum `{ALL: "Tất cả", GOODS: "Vật tư hàng hóa", TOOL: "Công cụ dụng cụ", SERVICE: "Dịch vụ", OTHER: "Khác"}` (NEED CONFIRMATION — enum codes `GOODS/TOOL/SERVICE/OTHER` per PKG §2.2.1; display labels cần BA confirm, đặc biệt "CCDC" vs "Công cụ dụng cụ")
- **State transition**: re-loading → success
- **Component**: `customs/filter/single-select-filter-content` (Priority 1 — customs/; `filter-single-select` registry key); `w-[118px]` per figma §6
- **GraphQL op**: `searchInternalProducts` `nature` param
- **Ref**: figma spec `wave03-cat-prod-list.md` §5 Field Composition Schema `TinhChatFilterField`; `14432-89699.png L8`

#### AC-6 → FE render filter Nhóm hàng (materialGroupId) và pass vào BFF query

- **Khi**: user chọn option trong dropdown "Nhóm hàng"
- **FE phải**: load danh sách material groups qua BFF query (NEED CONFIRMATION tên op — BFF paired spec §6.1 authoritative); khi user chọn một nhóm → reset page=0, re-trigger `searchInternalProducts` với `materialGroupId`; option "Tất cả" = null (không filter)
- **State transition**: dropdown load async; sau select → re-loading → success
- **Component**: `customs/filter/single-select-filter-content` (Priority 1 — customs/; `filter-single-select` registry key); `w-[133px]` per figma §6
- **GraphQL op**: `searchInternalProducts` `materialGroupId` param; material group load op = NEED CONFIRMATION
- **Ref**: figma spec `wave03-cat-prod-list.md` §5 Field Composition Schema `NhomHangFilterField`; `14432-89699.png L8`

### Cluster C — Thao tác toolbar và row actions

#### AC-8 → FE render 2 row action icons (Edit + Delete) per dòng, xử lý RBAC và state phụ thuộc

- **Khi**: bảng render row data
- **FE phải**: hiển thị 2 icon per row: `edit-2` (lucide-react) → navigate đến FEAT-CAT-PROD-EDIT; `trash` (lucide-react) → mở confirm dialog trước khi gọi mutation xóa. Icon màu `text-muted-foreground`. Khi server trả lỗi (vd: sản phẩm đang có giao dịch) → toast error với error code từ BFF
- **State transition**: Delete click → `confirm dialog` → mutation loading → success (refresh list) | error (toast)
- **Component**: `InternalProductRowActions.tsx` (NEW — Priority 1 customs scan: không có component fit tại customs/ cho domain catalog row actions; Priority 2 share/ scan: không có; Priority 3 ui/ scan: IconButton shadcn primitive — Build-new justification: domain-specific 2-icon row action + confirm dialog logic)
- **a11y**: `aria-label="Sửa sản phẩm {code}"` + `aria-label="Xóa sản phẩm {code}"`; keyboard Tab/Enter operable; KHÔNG có "Eye" Xem icon (Xem via Mã link — figma `14322-176695.png` Thao tác = 2 icons only)
- **Ref**: figma spec `wave03-cat-prod-list.md` §4 Component Prop Map `RowActions`; `14322-176695.png L13-22`

#### AC-9 → FE render 3 header toolbar buttons và trigger đúng navigation/flow

- **Khi**: user click một trong 3 buttons trong `HeaderActionGroup`
- **FE phải**:
  - "Tải lên" (outline, icon `document-upload` leading) → mở modal/page FEAT-CAT-PROD-IMPORT
  - "Xuất file" (outline, icon `document-download` leading) → trigger FEAT-CAT-PROD-EXPORT flow
  - "Thêm sản phẩm" (brand/primary, icon `add` leading) → navigate đến FEAT-CAT-PROD-CREATE route
- **Component**: `share/buttons/button` (Priority 2 — share/) với variant `outline` / `brand`; icon từ lucide-react per figma §4
- **a11y**: button text visible (không icon-only), `aria-label` redundant nếu label đủ rõ
- **Ref**: figma spec `wave03-cat-prod-list.md` §1 Layout DSL `HeaderActionGroup` `_children_count=3`; `14432-89699.png L7`

### Cluster D — Phân quyền và phạm vi

#### AC-10 → FE chỉ hiển thị data và actions phù hợp với role và tenant

- **Khi**: user load trang với mọi role
- **FE phải**: data từ BFF đã tenant-scoped (BFF forward `X-Tenant-Id`); FE render conditional: nút Thêm/Tải lên/Xuất file + icon Sửa/Xóa chỉ hiện khi role có quyền catalog-write. Không hiện rồi disabled — conditional render
- **Component**: role check qua auth context/hook hiện tại; kết hợp với `InternalProductListPage.tsx` RBAC guard
- **Ref**: paired BE spec §4 (tenant filter) + BFF spec §4 (auth propagation)

#### AC-11 → N/A (mobile scope)

- Source AC này định nghĩa phạm vi mobile chỉ xem (view-only). FE Web không bị ảnh hưởng — xem `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-LIST.md` §3.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám figma spec `Product/ux/figma-web/wave03-cat-prod-list.md` (node 14329:254775). Không re-invent layout / spacing / color.
- Filter row: fixed widths `w-[320px]`/`w-[123px]`/`w-[118px]`/`w-[133px]` — KHÔNG dùng `flex-1` (Trap 3 — figma §8 Anti-Pattern Trap).
- Header group: đúng 3 buttons (Tải lên + Xuất file + Thêm sản phẩm) — KHÔNG 2 (Trap 6 — incident fix verified); filter row đúng 4 controls; bảng đúng 10 cột — xem `14432-89699.png L7/L8/L11`.
- Label verbatim: placeholder "Tìm theo mã nội bộ, tên sản phẩm, SKU..." (full string với "..."); "Nhóm vật tư/hàng hoá" (slash + "hoá" với tone ó-ngã); "ĐVT chính" (có suffix "chính") — Trap 5.
- Status badge: "Đang hoạt động" = green soft pill (`bg-background-success`/`text-foreground-success`); "Ngừng hoạt động" = red soft pill (`bg-background-error`/`text-foreground-error`) — `14322-176695.png` rows 3+8 canonical.
- Design tokens PHẢI khớp 10 tokens detect ở §G.Y (xem §5.3).

### 4.2 State machine + error handling

- State tường minh: `idle | loading | success | error`. Loading → skeleton table (không blank). Empty success → empty-state centered (icon + "Không có dữ liệu") per figma `14432-89699.png L14-15`.
- KHÔNG ẩn FilterRow + 3 header buttons khi empty state — figma §8 `_negative_coverage` EC-1.
- KHÔNG render pagination khi empty state.
- Fetch error → toast (KHÔNG silent fail). Delete mutation error → toast với error code từ BFF.

### 4.3 i18n + a11y

- **i18n policy**: fixed VN labels inline (NEED CONFIRMATION — xác nhận với BA/PO xem W03 có dùng i18next không). Nếu confirmed i18next → tạo key `inventory.catalog.internalProduct.*` trong `src/i18n/{vi,en}.json`.
- a11y: `<h1>` cho page title; table dùng `<table>/<thead>/<tbody>`; search input `<input type="search">` + `aria-label`; filter selects có label (visually hidden nếu không có label text); pagination `aria-label`; row action icon buttons có `aria-label` với tên sản phẩm.
- Color contrast: status pills WCAG AA — `text-foreground-success` trên `bg-background-success` + `text-foreground-error` trên `bg-background-error`.

### 4.4 RBAC render + feature flag

- Chỉ 2 persona: `garage-owner` + `accountant` (Critical Rule #6). Buttons Thêm/Tải lên/Xuất file + icons Sửa/Xóa conditional render theo catalog write permission.
- Route `/inventory/internal-products` phải qua RBAC guard; redirect nếu unauthorized.

### 4.5 Business rule secondary (UI hint)

- BR-CAT-PROD-007 (search keyword): BFF enforce — FE chỉ truyền `keyword` string, không cần client-validate.
- BR-CAT-PROD-008 (status filter): FE render đúng default `ACTIVE` cho filter Trạng thái khi tải trang.
- BR-CAT-PROD-019 (nature enum): FE map enum code → display label trong cột Tính chất và filter dropdown (NEED CONFIRMATION display labels).
- BR-CAT-CMN-003: FE hiển thị audit info khi có (created/updated — relevant cho DETAIL, không phải LIST).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| BFF fetch error (network/5xx) | TOAST | global toast | AC-1 |
| Delete conflict (sản phẩm có giao dịch) | TOAST | `InternalProductRowActions` | AC-8 |
| Unauthorized 403 | REDIRECT `/unauthorized` | route guard | AC-10 |

---

## 5. Screen / Component breakdown (FE — primary content)

> §G.X: KG parse error — Author đã scan `.claude/references/web-component-registry.yaml` filesystem manually (canonical component registry per CLAUDE.md §2 #12) thay vì `knowledge-graph.yaml`.

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InternalProductListPage` | `/inventory/internal-products` | NEW | `14329:254775` (container), `14432:89699` (empty), `14322:176695` (populated) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 |

### 5.2 Components new/modified

> Author scanned `.claude/references/web-component-registry.yaml` (canonical registry). Priority scan: customs/ → share/ → ui/.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `InternalProductListPage` | `src/features/inventory/catalog/pages/InternalProductListPage.tsx` | NEW | — | filter state, pagination state | **Build-new** — justification: top-level page container, không có match tại customs/share/ui sau scan registry | AC-1, AC-10 |
| `InternalProductTable` | `src/features/inventory/catalog/components/InternalProductTable.tsx` | NEW | `{ data, isLoading }` | — | **Build-new (wraps Priority 2 — share/tables/table)** — justification: 10-col domain-specific table; wraps share/ table primitive; không có customs match | AC-2, AC-8 |
| `InternalProductRowActions` | `src/features/inventory/catalog/components/InternalProductRowActions.tsx` | NEW | `{ product, onDeleted }` | confirm dialog open | **Build-new** — justification: domain-specific 2-icon row action (Edit+Trash) + confirm delete logic; không có component fit tại customs/share/ui sau scan | AC-8 |
| `InternalProductFilterRow` | `src/features/inventory/catalog/components/InternalProductFilterRow.tsx` | NEW | `{ filters, onChange }` | — | **Build-new (wraps Priority 1 — customs/filter/ + Priority 2 — share/inputs/)** — justification: layout-wrapper cho 4 filter controls với fixed widths per figma | AC-3, AC-4, AC-5, AC-6 |
| `InputSearch` (search box) | `src/components/share/inputs/input-search.tsx` | REUSE | `variant=search`, `placeholder=verbatim`, `w-[320px]` | — | **Priority 2 — share/** (`form-search-input` registry key → `share/inputs/input-search`) | AC-3 |
| `SingleSelectFilterContent` (Status) | `src/components/customs/filter/single-select-filter-content.tsx` | REUSE | `options=[ACTIVE/INACTIVE/ALL]`, `default=ACTIVE`, `w-[123px]` | — | **Priority 1 — customs/** (`filter-single-select` registry key → `customs/filter/single-select-filter-content`) | AC-4 |
| `SingleSelectFilterContent` (Tính chất) | `src/components/customs/filter/single-select-filter-content.tsx` | REUSE | `options=natureEnum`, `w-[118px]` | — | **Priority 1 — customs/** (same component, different options) | AC-5 |
| `SingleSelectFilterContent` (Nhóm hàng) | `src/components/customs/filter/single-select-filter-content.tsx` | REUSE | `options=materialGroups (async)`, `w-[133px]` | — | **Priority 1 — customs/** (same component, async load) | AC-6 |
| `TablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ page, size, total, onChange }` | — | **Priority 2 — share/** (NEED CONFIRMATION path — orchestrator hint: reuse `TablePagination`; path tạm `share/tables/table-pagination`) | AC-7 |
| `Button` (3 toolbar buttons) | `src/components/share/buttons/button.tsx` | REUSE | `variant=outline|brand`, icon leading per figma §4 | — | **Priority 2 — share/** | AC-9 |
| `StatusBadge` (inline) | trong `InternalProductTable.tsx` (inline hoặc extract) | NEW (inline) | `{ status: ACTIVE|INACTIVE }` | — | **Build-new (wraps Priority 3 — ui/badge)** — justification: pill với 2 color variants; wrap shadcn Badge primitive | AC-2 |
| `EmptyState` (no data) | `src/components/share/displays/empty-state.tsx` | REUSE | `text="Không có dữ liệu"`, `icon=placeholder-empty-doc` | — | **Priority 2 — share/** (figma §4 Component Prop Map `EmptyState`) | AC-1 |

### 5.3 Design tokens & Figma refs

> 10 tokens detect ở bundle §G.Y — PHẢI dùng đúng, không thay thế bằng hex/px hardcode (reviewer item #21).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-background-success` | `tailwind.config.js` / tokens | Status badge pill "Đang hoạt động" bg (`#f0fdf4`) | AC-2 |
| `text-foreground-success` | tokens | Status badge text "Đang hoạt động" (`#16a34a`) | AC-2 |
| `bg-background-error` | tokens | Status badge pill "Ngừng hoạt động" bg (red soft) | AC-2 |
| `text-foreground-error` | tokens | Status badge text "Ngừng hoạt động" + Delete hover (`#ef4444`) | AC-2, AC-8 |
| `bg-muted` | tokens | Table header bg (`#f4f4f5`) | AC-2 |
| `bg-primary` | tokens | "Thêm sản phẩm" brand button bg (`#0052ff`) | AC-9 |
| `text-primary` | tokens | "Mã sản phẩm nội bộ" link color + brand CTA text-primary | AC-2, AC-9 |
| `text-foreground` | tokens | Body text, h1, table cell default (`#18181b`) | AC-1, AC-2 |
| `text-muted-foreground` | tokens | Filter placeholder, pagination labels, row action icons (`#71717a`) | AC-3, AC-7, AC-8 |
| `ring-primary` | tokens | Search input focus ring (blue) | AC-3 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave03-cat-prod-list.md` §2 Design Token Map + §3 State Table. PNG canonical: `14432-89699.png` (Empty State) + `14322-176695.png` (Populated State).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `searchInternalProducts` | query | `src/api/graphql/searchInternalProducts.graphql` | `['internalProducts', filters]` | `InternalProductListItemFragment` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 |
| `searchMaterialGroups` (NEED CONFIRMATION) | query | `src/api/graphql/searchMaterialGroups.graphql` | `['materialGroups', 'filterOptions']` | `MaterialGroupOptionFragment` | AC-6 |
| Delete mutation (NEED CONFIRMATION op name) | mutation | `src/api/graphql/deleteInternalProduct.graphql` | — | — | AC-8 |

> Tất cả ops phải tồn tại ở paired BFF FEAT `features/bff/FEAT-CAT-PROD-LIST.md` §6.1 (reviewer item #16 enforce). NEED CONFIRMATION: tên op `searchMaterialGroups` + delete mutation name — xem BFF spec authoritative.

### 6.2 REST endpoints consumed direct (bypass BFF)

Không có — mọi data qua BFF GraphQL.

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (list) | TanStack Query | — | `['internalProducts', filters]` | AC-1, AC-2, AC-7 |
| Server state (material groups) | TanStack Query | — | `['materialGroups', 'filterOptions']` | AC-6 |
| Filter state | local useState / URL search params | `InternalProductListPage` | `filters: {keyword, status, nature, materialGroupId}` | AC-3, AC-4, AC-5, AC-6 |
| Pagination state | local useState / URL search params | `InternalProductListPage` | `{page, size}` | AC-7 |
| Delete mutation | TanStack mutation | — | `onSuccess: invalidate ['internalProducts', *]` | AC-8 |

### 6.4 Routing

| Route | Component | Guard | AC ref |
|---|---|---|---|
| `/inventory/internal-products` | `InternalProductListPage` | RBAC: `garage-owner | accountant` | AC-1, AC-10 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory/catalog/pages/` | `InternalProductListPage.tsx` | NEW | top-level page | ~120 | AC-1, AC-10 |
| `src/features/inventory/catalog/components/` | `InternalProductTable.tsx` | NEW | wraps share/tables/table | ~180 | AC-2, AC-8 |
| `src/features/inventory/catalog/components/` | `InternalProductRowActions.tsx` | NEW | shadcn IconButton | ~60 | AC-8 |
| `src/features/inventory/catalog/components/` | `InternalProductFilterRow.tsx` | NEW | wraps customs/filter + share/inputs | ~80 | AC-3, AC-4, AC-5, AC-6 |
| `src/features/inventory/catalog/hooks/` | `useInternalProductList.ts` | NEW | TanStack Query wrapper | ~50 | AC-1, AC-7 |
| `src/features/inventory/catalog/types/` | `internal-product.types.ts` | NEW | TypeScript types | ~40 | — |
| `src/api/graphql/` | `searchInternalProducts.graphql` | NEW | persisted query | ~20 | AC-1 |
| `src/api/graphql/` | `searchMaterialGroups.graphql` | NEW | persisted query | ~15 | AC-6 |
| `src/api/generated/` | `searchInternalProducts.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | inventory catalog route entry | MODIFY (add) | TanStack Router | ~10 | AC-1 |
| `tests/features/inventory/catalog/` | `InternalProductListPage.test.tsx` | NEW | Vitest + RTL | ~150 | AC-1, AC-2, AC-3, AC-7, AC-8, AC-10 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL + resolver stable — searchInternalProducts + delete op confirmed)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma wave03-cat-prod-list.md ACTIVE
    Exit: E2E happy path green (list → search → filter → paginate)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Page + Table + FilterRow + Pagination + Row Actions + Routing + State | features + routes | BFF S5 SDL stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> BE tier là primary enforcement. FE chỉ: client-side hint + RBAC render + error display.

| BR ID | Severity | UI behavior | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-007` | NORMAL | Không cần client validate keyword | — | AC-3 | BFF enforce keyword search 3-col match |
| `BR-CAT-PROD-008` | NORMAL | Default filter `status=ACTIVE` khi tải trang | `InternalProductListPage` init state | AC-4 | UX convention |
| `BR-CAT-PROD-019` | NORMAL | Map nature enum → display label trong cột + filter dropdown | `InternalProductTable.tsx` + `InternalProductFilterRow.tsx` | AC-5 | BE final enforce; FE display mapping only |
| `BR-CAT-CMN-003` | NORMAL | Show toast error code từ BFF khi delete fail | `InternalProductRowActions.tsx` | AC-8 | BE enforce; FE display |

> **Primary enforcement** = BE tier (`features/be/FEAT-CAT-PROD-LIST.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (loading → empty → populated) | test-ui | skeleton + empty state + list render |
| AC-2 | UI (10 cols, labels verbatim, StatusBadge variants) | test-ui | verify column headers + badge colors |
| AC-3 | UI (search debounce, BFF called with keyword) | test-ui | mock BFF, verify query var |
| AC-4 | UI (status filter, default ACTIVE) | test-ui | default value + re-fetch |
| AC-5 | UI (nature filter options) | test-ui | enum options rendered |
| AC-6 | UI (materialGroup dropdown load async) | test-ui | async load + select → re-fetch |
| AC-7 | UI (pagination, page size change) | test-ui | page nav + size select |
| AC-8 | UI (row actions: edit nav + delete confirm) | test-ui + E2E | confirm dialog + success refresh |
| AC-9 | UI (toolbar 3 buttons, correct routing) | test-ui | button render + click nav |
| AC-10 | UI (RBAC conditional render) | test-ui + test-isolation | dual persona mock |
| (smoke) | E2E happy path | test-e2e | Playwright: open list → search → filter → paginate |

## 11. i18n & a11y

### 11.1 i18n keys

NEED CONFIRMATION — xác nhận với BA/PO về W03 i18n policy (fixed VN labels vs i18next).

Nếu confirmed i18next:

| Key | vi | en | AC ref |
|---|---|---|---|
| `inventory.catalog.internalProduct.pageTitle` | "Danh sách sản phẩm" | "Internal Product List" | AC-1 |
| `inventory.catalog.internalProduct.search.placeholder` | "Tìm theo mã nội bộ, tên sản phẩm, SKU..." | "Search by internal code, product name, SKU..." | AC-3 |
| `inventory.catalog.internalProduct.filter.status` | "Trạng thái" | "Status" | AC-4 |
| `inventory.catalog.internalProduct.filter.nature` | "Tính chất" | "Nature" | AC-5 |
| `inventory.catalog.internalProduct.filter.group` | "Nhóm hàng" | "Material Group" | AC-6 |
| `inventory.catalog.internalProduct.empty` | "Không có dữ liệu" | "No data" | AC-1 |
| `inventory.catalog.internalProduct.addButton` | "Thêm sản phẩm" | "Add Product" | AC-9 |

Nếu confirmed fixed VN → `i18n_keys: []`, hardcode VN inline, không dùng i18next keys.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` "Danh sách sản phẩm"; sub-tab `role="tablist"` + `role="tab"` + `aria-selected` | semantic nav |
| AC-2 | `<table>` với `<thead>/<tbody>`; "Mã sản phẩm nội bộ" cells = `<a>` link; StatusBadge đủ contrast WCAG AA | color contrast |
| AC-3 | `<input type="search">` + `aria-label="Tìm kiếm sản phẩm"`; icon `search-normal-1` `aria-hidden` | search semantic |
| AC-7 | Pagination `aria-label="Điều hướng trang"`; current page `aria-current="page"`; prev/next `aria-label` + disabled khi edge | pagination a11y |
| AC-8 | Row action icons: `aria-label="Sửa sản phẩm {code}"` + `aria-label="Xóa sản phẩm {code}"`; confirm dialog `role="alertdialog"` | action a11y |
| AC-9 | Toolbar buttons có text label (không icon-only) → label tự làm accessible name | button a11y |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-LIST.md` | DRAFT | BR primary enforcement; `searchInternalProducts` REST contract V2-7 |
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-LIST.md` | DRAFT | GraphQL ops consumed §6.1 — authoritative cho op names + SDL; V2-Q4 `searchInternalProducts` |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-LIST.md` | DRAFT | AC-11 mobile scope (view-only) — phân tách platform |

**Source ID consistency** (item #18): `source_feat_sha` = `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` identical với BE/BFF/Mobile files.

## 13. References

- **Source**: [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) v7
- **Paired BE**: [`features/be/FEAT-CAT-PROD-LIST.md`](../be/FEAT-CAT-PROD-LIST.md)
- **Paired BFF**: [`features/bff/FEAT-CAT-PROD-LIST.md`](../bff/FEAT-CAT-PROD-LIST.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-PROD-LIST.md`](../mobile/FEAT-CAT-PROD-LIST.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma spec (web)**: [`Product/ux/figma-web/wave03-cat-prod-list.md`](../../../../../Product/ux/figma-web/wave03-cat-prod-list.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Internal Product + MaterialGroup additive aggregate decision
- **ADR-018**: Bulk import JSON body 2-step pattern
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-CAT-PROD-LIST` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3 dòng Vietnamese), §2 trách nhiệm FE Web (7 bullets), §3 FE behaviour map 11 AC-IDs (10 covered + AC-11 N/A mobile), §4 visual fidelity (Figma SSOT + 10 tokens) + state + i18n + a11y + RBAC + BR secondary, §5-§11 FE-specific. §G.X KG parse error → scan web-component-registry.yaml manual. 3 NEED CONFIRMATION items: (1) fanout_map_sha; (2) BFF op names cho materialGroup query + delete mutation; (3) nature enum display labels + W03 i18n policy. |
