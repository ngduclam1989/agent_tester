---
feat: FEAT-CAT-PROD-LIST
feat_file: Product/features/FEAT-CAT-PROD-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14329-254775&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14329:254775"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (2 top-level frames — list-with-data + list-empty)
  get_variable_defs: cached (tokens identical with wave03-cat-prod-create-oracle.md cache)
  get_design_context: skipped (PNG canonical sufficient — Table + Filter pattern shadcn)
  get_screenshot: success (3 PNG: _full + list-data + list-empty)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (2 frame state captured — data + empty)
  text_content: complete (verbatim from PNG)
  design_tokens: complete (cached)
  interaction_states: partial (Figma không render :hover/:focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-list/_full.png
  - assets/wave03-cat-prod-list/14322-176695-list-data.png
  - assets/wave03-cat-prod-list/14432-89699-list-empty.png
---

# Oracle — FEAT-CAT-PROD-LIST (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14329:254775`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Danh sách sản phẩm"** — listing + filter + actions
> table layout. 2 state: (A) có data (12 row sample), (B) empty state.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| List với data (12 row, pagination) | 14322:176695 | 1440×1032 | assets/wave03-cat-prod-list/14322-176695-list-data.png |
| List empty state ("Không có dữ liệu") | 14432:89699 | 1440×817 | assets/wave03-cat-prod-list/14432-89699-list-empty.png |

> **Note**: KHÁC với CREATE/EDIT/DETAIL ở Page container — LIST dùng `Page Container` width 1376 (full-width minus 32px padding) thay vì 1216 form-width. Mục đích: fit table 10 column.

---

## Component Inventory

### Screen A: List với data (14322:176695)

**Header chrome (shared)**
- Navbar × 1 — GMS logo + 7 menu items (Danh mục active, white pill background)
- Sub-tabs row × 1 — 3 tab: **Danh sách sản phẩm** (active brand-CD underline) · Nhóm vật tư hàng hóa · Kỳ kế toán

**Page header**
- H1 "Danh sách sản phẩm" (text 2x-large/semibold 24px, left-aligned, NO BackArrow — đây là trang gốc)
- Action button cluster (right): Button "Tải lên" (secondary outline, icon upload leading) + Button "Xuất file" (secondary outline, icon download leading) + Button "Thêm sản phẩm" (primary brand-CD, icon plus circle leading)

**Filter row** (4 control inline, gap ~8px)
- SearchInput × 1 (w=320, icon-left search, placeholder "Tìm theo mã nội bộ, tên sản phẩm, SKU...")
- Select "Trạng thái" (chevron-down, w~123)
- Select "Tính chất" (chevron-down, w~118)
- Select "Nhóm hàng" (chevron-down, w~133)

**DataTable × 1** (10 columns, header bg gray-50)
- Columns + width: STT (60) · Mã sản phẩm nội bộ (168) · Tên sản phẩm (186) · Tính chất (168) · Nhóm vật tư/hàng hoá (180) · ĐVT chính (120) · Thương hiệu (120) · Xuất xứ (120) · Trạng thái (154) · Thao tác (100, right-aligned)
- Header row height: 40px, text small/medium muted (`#71717a`)
- Data row × 12 (canonical sample):
  - STT: "1".."12" (text-sm centered)
  - Mã sản phẩm nội bộ: link blue (`text-link`) — e.g. "AS78-1234-EDC9", "MN56-4567-WSX6", "VB34-7890-QAZ3", "XC12-0123-REW0", "ZA90-3456-UYT7", "NM78-6789-POI4", "OP56-9012-JKL1", "UI34-5432-FGH8", "QW12-8765-ASD5", "LK90-2345-ZXA2", "DF90-8901-RFV2", "BX45-7892-CVB9"
  - Tên sản phẩm: text foreground (e.g. "Bộ má phanh", "Lọc gió", "Bộ bugi", "Dây curoa cam", "Kim phun nhiên liệu", "Bơm nước", "Van nhiệt", "Cuộn đánh lửa", "Cảm biến oxy", "Bình nước làm mát", "Nắp két nước", "Nắp chia điện")
  - Tính chất: e.g. "Vật tư tiêu hao", "Vật tư hàng hoá"
  - Nhóm vật tư/hàng hoá: e.g. "Phụ tùng", "Hệ thống phanh", "Dầu động cơ", "Phụ kiện", "Hệ thống điện", "Hệ thống làm mát", "Dầu nhớt", "Hệ thống nhiên liệu"
  - ĐVT chính: e.g. "Thùng", "Bình", "Chiếc", "Chai", "Cuộn", "Bịch", "Viên"
  - Thương hiệu: e.g. "Mazuda", "Hyundai", "Benzel", "Amerix", "Renault", "Ferrano", "Volstra", "Britannia", "Maple Motors", "Kangaroo Auto", "Solara", "Volgograd Au..."
  - Xuất xứ: e.g. "Nhật Bản", "Hàn Quốc", "Đức", "Mỹ", "Pháp", "Ý", "Thụy Điển", "Anh", "Canada", "Úc", "Tây Ban Nha", "Nga"
  - Trạng thái: Badge "Đang hoạt động" (success green) | Badge "Ngừng hoạt động" (warning/destructive cam-đỏ)
  - Thao tác: 2 IconButton (Edit pencil 16×16 muted + Trash 16×16 muted, gap ~12px, right-aligned)
- Row height: 52px · Border-bottom 1px `#e4e4e7`

**Pagination Row** (horizontal between, padding y=8)
- Left: "Hiển thị" + Select "20" (chevron-down) + "mỗi trang"
- Right: "← Trước" + button group "1" "2"(active) "3" "..." "Tiếp →"

**Footer (shared)**
- Text muted: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Screen B: List empty (14432:89699)

- Identical chrome (Navbar + Sub-tabs + Page header + Filter row + Table header)
- Table body: EMPTY STATE × 1 (centered, padding ~80px vertical)
  - EmptyIllustration (paper face icon ~120×120, muted line art style)
  - Text "Không có dữ liệu" (text-base font-medium foreground, center-aligned)
- KHÔNG có pagination khi empty (verify behavior: pagination ẩn hoặc disabled)
- Footer shared

---

## Variant & State

### Button "Thêm sản phẩm" (primary brand-CD with icon)
- variant: default · size: default (h-9 ≈ 36px) + iconLeft slot
- Default bg `#0052ff` text white border-radius md
- Icon: plus-circle (lucide `plus-circle`) 16×16 white, leading
- :hover bg darker · :disabled opacity 50%

### Button "Tải lên" / "Xuất file" (secondary outline with icon)
- variant: outline · size: default + iconLeft
- Default bg white text foreground border 1px `border-input`
- Icon: "Tải lên" = upload/copy icon 16×16 muted; "Xuất file" = download/copy icon 16×16 muted

### SearchInput (filter)
- variant: Search (per `_ref-web-transform-figma.md §1.5`)
- Bounds: w=320 h=36
- Default: border `border-gray-300`, shadow-sm, padding `pl-9 pr-3 py-[7px]`, text-xs
- iconLeft: search (16×16 muted)
- Placeholder: text-xs muted

### Select (Trạng thái / Tính chất / Nhóm hàng) — filter
- Bounds: w auto (123-133) h=36
- Default bg white border 1px `border-input` radius md padding x=12 y=8
- ChevronDown icon (16×16 muted, right)

### Mã sản phẩm nội bộ (link cell)
- Text style: `text-sm` color `text-link` (`#1d4ed8`) underline on hover (verify shadcn default)
- Click navigate sang Detail screen (Verify route)

### Status Badge "Đang hoạt động" / "Ngừng hoạt động"
- "Đang hoạt động": bg `bg-success-bg` (light green `#dcfce7`), text `text-success-foreground` (green ~`#16a34a`), border 0
- "Ngừng hoạt động": bg `bg-warning-bg` (light orange/peach `#fff7ed` hoặc light red), text `text-warning-foreground` (orange `#f97316`) hoặc destructive (verify exact token)
- Border-radius: full · padding x=8 y=4 · font `text-xs font-medium`

### IconButton (Edit + Trash trong cột Thao tác)
- size: icon (32×32 click target, icon 16×16)
- variant: ghost (transparent bg, hover bg gray-50)
- Edit icon: pencil/edit-2 (lucide `pencil` or `square-pen`)
- Trash icon: lucide `trash` / `trash-2`
- Color: muted (`#71717a`)

### Table row
- Default bg white · :hover bg `#f9fafb` (gray-50, verify shadcn)
- Border-bottom 1px `#e4e4e7`
- Height: 52px

### Pagination (giống IMPORT preview)
- Page buttons: 32×32, default bg white border 1px `border-input`, radius md
- Active page: border-2 brand-CD hoặc bg muted (verify từ PNG — looks like border around "2")
- "..." muted ellipsis (no border)

### EmptyState
- Layout: vertical center, padding y=80px+
- Illustration: 120×120 muted line art (paper face icon)
- Text: `text-base font-medium foreground` centered

---

## Text Content (verbatim)

### Page chrome
- H1: "Danh sách sản phẩm"
- Buttons header right: "Tải lên" · "Xuất file" · "Thêm sản phẩm"

### Filter
- Search placeholder: "Tìm theo mã nội bộ, tên sản phẩm, SKU..."
- Select labels (placeholder/default text): "Trạng thái" · "Tính chất" · "Nhóm hàng"

### Table headers
- "STT" · "Mã sản phẩm nội bộ" · "Tên sản phẩm" · "Tính chất" · "Nhóm vật tư/hàng hoá" · "ĐVT chính" · "Thương hiệu" · "Xuất xứ" · "Trạng thái" · "Thao tác"

### Sample data rows (canonical — 12 row)
| STT | Mã | Tên | Tính chất | Nhóm | ĐVT | Thương hiệu | Xuất xứ | Trạng thái |
|---|---|---|---|---|---|---|---|---|
| 1 | AS78-1234-EDC9 | Bộ má phanh | Vật tư tiêu hao | Phụ tùng | Thùng | Mazuda | Nhật Bản | Đang hoạt động |
| 2 | MN56-4567-WSX6 | Lọc gió | Vật tư hàng hoá | Hệ thống phanh | Bình | Hyundai | Hàn Quốc | Đang hoạt động |
| 3 | VB34-7890-QAZ3 | Bộ bugi | Vật tư tiêu hao | Dầu động cơ | Thùng | Benzel | Đức | Ngừng hoạt động |
| 4 | XC12-0123-REW0 | Dây curoa cam | Vật tư hàng hoá | Phụ kiện | Thùng | Amerix | Mỹ | Ngừng hoạt động |
| 5 | ZA90-3456-UYT7 | Kim phun nhiên liệu | Vật tư tiêu hao | Phụ tùng | Chiếc | Renault | Pháp | Đang hoạt động |
| 6 | NM78-6789-POI4 | Bơm nước | Vật tư hàng hoá | Hệ thống điện | Chai | Ferrano | Ý | Đang hoạt động |
| 7 | OP56-9012-JKL1 | Van nhiệt | Vật tư tiêu hao | Phụ tùng | Cuộn | Volstra | Thụy Điển | Đang hoạt động |
| 8 | UI34-5432-FGH8 | Cuộn đánh lửa | Vật tư hàng hoá | Hệ thống làm mát | Bịch | Britannia | Anh | Đang hoạt động |
| 9 | QW12-8765-ASD5 | Cảm biến oxy | Vật tư tiêu hao | Phụ kiện | Thùng | Maple Motors | Canada | Đang hoạt động |
| 10 | LK90-2345-ZXA2 | Bình nước làm mát | Vật tư hàng hoá | Dầu nhớt | Bình | Kangaroo Auto | Úc | Đang hoạt động |
| 11 | DF90-8901-RFV2 | Nắp két nước | Vật tư tiêu hao | Phụ tùng | Thùng | Solara | Tây Ban Nha | Đang hoạt động |
| 12 | BX45-7892-CVB9 | Nắp chia điện | Vật tư hàng hoá | Hệ thống nhiên liệu | Viên | Volgograd Au... | Nga | Đang hoạt động |

### Pagination
- Left: "Hiển thị" · "20" · "mỗi trang"
- Right: "Trước" · "1" · "2" (active) · "3" · "..." · "Tiếp"

### Empty state
- Text: "Không có dữ liệu"

### Footer (shared chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0"
- "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

> **Tokens identical với `wave03-cat-prod-create-oracle.md` cache**. LIST-specific:

### Colors (mới so với CREATE)
- `#dcfce7` (success bg) / `#16a34a` (success text) — Badge "Đang hoạt động"
- `#fff7ed` (warning bg) / `#f97316` (warning text) — Badge "Ngừng hoạt động" (verify — có thể là destructive variant tùy convention)
- `#1d4ed8` (text-link) — Mã sản phẩm cell value (cùng token đã có ở CREATE)
- `bg-gray-50` (~`#f4f4f5`) — Table header bg + :hover row

### Typography
- H1 page header: `text-2xl font-semibold` (24px) — identical CREATE
- Table header: `text-sm font-medium text-muted-foreground` (14px medium muted)
- Table cell: `text-sm text-foreground` (14px regular)
- Link cell (Mã sản phẩm): `text-sm text-link` (underline on hover)
- Badge: `text-xs font-medium`
- Empty state: `text-base font-medium`

### Spacing
- Page container padding x = 32px (KHÁC CREATE — 80px) — full-width table layout
- Filter row gap: 8px
- Table cell padding: x=12 y=16 (verify)
- Pagination padding y: 8px
- Empty state padding y: 80px+

### Border radius
- Filter Search/Select: `radius/md` = 6
- Table border-bottom: 1px (no radius — flat table style)
- Badge: `radius/full` = 9999
- Button icon (square): `radius/md` = 6

### Shadow
- Filter Search: `shadow-sm` (per shadcn variant=Search)

### Sizes
- Filter Search width: 320
- Filter Select width: ~120-133 (auto based on text)
- Table row height: 52
- Table header height: 40
- Page container width: 1376 (= viewport 1440 - 32×2 padding)
- IconButton click target: 32×32 (icon 16×16)
- Pagination button: 32×32
- Empty illustration: 120×120 (verify)

---

## Notes (oracle interpretation, không phải fact để verify)

- LIST là **trang gốc** của Danh mục sản phẩm — KHÔNG có BackArrow ở page header.
- 3 button header action = 3 entry point:
  - "Tải lên" → open IMPORT dialog (xem `wave03-cat-prod-import-oracle.md`)
  - "Xuất file" → trigger export (download Excel/CSV) — verify behavior với FEAT AC
  - "Thêm sản phẩm" → route sang CREATE screen (xem `wave03-cat-prod-create-oracle.md`)
- 4 filter control (Search + 3 Select) — DEV implement: SearchInput debounced (verify 300-500ms), 3 Select fetch options từ backend hoặc enum static.
- Cell "Mã sản phẩm nội bộ" link → route sang DETAIL (xem `wave03-cat-prod-detail-oracle.md`) với param `productId`.
- Cell "Thao tác" 2 icon:
  - Edit pencil → route sang EDIT (xem `wave03-cat-prod-edit-oracle.md`) hoặc inline modal (verify)
  - Trash → trigger DELETE dialog (xem `wave03-cat-prod-delete-oracle.md` — 2 variant: confirm/blocked)
- Badge "Ngừng hoạt động" trong _full.png cột 2 = cam/đỏ — DEV implement bg-warning-bg + text-warning-foreground (verify exact token, có thể là destructive variant nếu Garage convention treat ngừng = destructive).
- Pagination "20 mỗi trang" = default page size. Verify nếu có option khác.
- Sample data 12 row, brand names ("Mazuda", "Volstra", "Solara", "Volgograd Au...", "Kangaroo Auto") = mock — KHÔNG phải brand thực tế. DEV inject từ backend.
- Vietnamese typo trong PNG: "Phụ kiện" cho XC12 thực tế là "Phụ kiện" (đúng); "Hệ thống làm mát" cho UI34 (Cuộn đánh lửa) là sample mismatch nghiệp vụ (cuộn đánh lửa thuộc hệ thống điện) — mock, không phải bug UI.
- Empty state illustration = paper face icon (line art). DEV asset path verify trong codebase (`frontend/gf-gms-web/src/components/share/EmptyState/` hoặc image asset).
- Khi list empty + filter active → có thể có copy khác ("Không tìm thấy sản phẩm khớp filter") — Figma KHÔNG capture; verify với FEAT AC.
- Interaction states (`:hover` row + button focus) Figma không render → theo shadcn baseline.
- Page width = 1376 (full table-fit) KHÁC với 1216 form (CREATE/EDIT/DETAIL) — DEV implement: dùng PageContainer variant=wide hoặc page-specific layout class.
