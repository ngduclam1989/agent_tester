---
feat: FEAT-CAT-GRP-LIST
feat_file: Product/features/FEAT-CAT-GRP-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88836&t=g9GrqfVRsuvDYwl3-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14423:88836"
fetched_at: 2026-06-29T03:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (2 top-level frames — empty 13501:134329 + populated 14432:88912)
  get_variable_defs: success (canonical fetch — token vocab cached for sibling FEATs)
  get_design_context: not-called (DEV spec wave03-cat-grp-list.md đã có full design context; oracle dùng metadata + DEV-spec supplement per §4b source 1)
  get_screenshot: success (3 PNG: _full + empty + populated)
data_completeness:
  screen_inventory: complete
  component_inventory: complete (supplemented from DEV spec Product/ux/figma-web/wave03-cat-grp-list.md)
  variant_state: complete
  text_content: complete (verbatim from DEV spec ASCII mockup + §VV claims)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-grp-list/_full.png
  - assets/wave03-cat-grp-list/13501-134329-empty.png
  - assets/wave03-cat-grp-list/14432-88912-populated.png
---

# Oracle — FEAT-CAT-GRP-LIST (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14423:88836`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Danh sách nhóm vật tư hàng hóa"** — table 7-col
> trải phẳng có search + 2 filter + brand "Thêm Nhóm VT/HH" + pagination. 2 screen state:
> Empty (no data) + Populated (12 row sample). Per-row actions: 2 icon button (Edit + Trash);
> "Xem" triggered via blue clickable name link (text-primary).

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Empty state (no data) | 13501:134329 | 1440×817 | assets/wave03-cat-grp-list/13501-134329-empty.png |
| Populated (12 sample rows + pagination) | 14432:88912 | 1440×1032 | assets/wave03-cat-grp-list/14432-88912-populated.png |

---

## Component Inventory

### Screen: Empty (13501:134329)

**Header chrome (shared)** — Navbar + Sub-tabs (active "Nhóm vật tư hàng hóa"). Identical CREATE/EDIT/DETAIL.

**Page header (`Page Header / 3`, height 80)**
- H1 "Danh sách nhóm vật tư hàng hóa" (text 2x-large/semibold 24/32)
- Brand button "Thêm Nhóm VT/HH" (right-aligned) — Variant=Default brand-CD size=default, h=36, leading icon `vuesax/linear/add` (Plus 16×16), text white

**Filter row** (height 36, gap 8, flex row, items-center)
- SearchInput × 1 (width 320) — Input variant=Search, placeholder "Tìm theo mã nhóm, tên nhóm", leading icon `vuesax/linear/search-normal-1` 16×16
- StatusFilter Select × 1 (width 123) — placeholder "Trạng thái", trailing `arrow-down-2` chevron 16×16
- ParentGroupFilter Select × 1 (width 139) — placeholder "Thuộc nhóm", trailing chevron 16×16

**Table (header-only when empty)**
- 7-col Table header (h=40, bg-muted `#f4f4f5`):
  - Col widths Empty: STT 95 · Tên nhóm VTHH 238 · Mã nhóm VTHH 208.6 · Thuộc nhóm 208.6 · Mô tả 208.6 · Trạng thái 208.6 · Thao tác 208.6
- Empty state placeholder (centered below header)
  - Illustrated empty doc icon (mặt buồn) — local asset OR fallback lucide `<FileX />` muted
  - Text "Không có dữ liệu" (text base/semibold 16/24, foreground)

**Footer (shared)** — Section Footer / 01 (h=40, simpler than CREATE/EDIT/DETAIL Section Footer / 2). Same content "Phần mềm quản lý Garage..."

### Screen: Populated (14432:88912)

**Header chrome + Page header + Filter row** — Identical Empty.

**Table (with 12 sample rows)**
- 7-col Table (h=664 total, h=40 head + 12×52 body rows)
- Col widths Populated (different from Empty): STT 90 · Tên nhóm VTHH 416 · Mã nhóm VTHH 268 · Thuộc nhóm 168 · Mô tả 180 · Trạng thái 154 · Thao tác 100
- Per row 52px tall, divider bottom 1px `#e4e4e7`, bg white :hover bg muted/40
- Cell renders:
  - STT cell: plain number text 14/regular
  - Tên nhóm VTHH cell: **text 14/regular brand-CD `#0052ff` (clickable link)** → navigates to FEAT-CAT-GRP-DETAIL
  - Mã nhóm VTHH cell: plain text 14/regular foreground (e.g. "BP-63982")
  - Thuộc nhóm cell: plain text 14/regular foreground (nullable, blank string nếu root)
  - Mô tả cell: plain text 14/regular foreground (nullable)
  - Trạng thái cell: **StatusBadge soft-pill** (bg `#f0fdf4` text `#16a34a`) "Đang hoạt động" (text 14/medium small/medium hoặc text-xs/medium per shadcn Badge variant)
  - Thao tác cell: RowActions container (flex row gap 8, items-center)
    - IconButton "Sửa" — icon `vuesax/linear/edit-2` 20×20 color muted-foreground (ghost button)
    - IconButton "Xóa" — icon `vuesax/linear/trash` 20×20 color muted-foreground (ghost button)
    - **NO Eye/Xem icon trong Thao tác** (Xem = clickable name link in cột "Tên nhóm VTHH")

**Pagination row** (below table, h=36, flex justify-between items-center)
- Left cluster: "Hiển thị" text + Select page-size (default 20, width 80) + "mỗi trang" text
- Right cluster: shadcn Pagination — `< Trước  1  [2]  3  ...  Tiếp >` (current page 2 in bordered box `bg-background border border-input`)

**Footer (shared)** — Same as Empty.

---

## Variant & State

### Button "Thêm Nhóm VT/HH" (brand-CD size=default)
- Variant=Default size=default — h=36, px=16 py=8, radius md (6)
- Bg `#0052ff`, text white, leading icon `<Plus />` 16×16
- :hover `bg-primary/90`; :focus ring brand-CD; :disabled opacity 50%

### Input variant=Search (SearchInput)
- Width 320 (fixed), h=36, bg white, border 1px `#d4d4d8`, radius md, shadow sm, padding 8 12 with leading icon padding-left 32 (`pl-8` shadcn cva variant)
- Leading icon `<Search />` 16×16 muted-foreground
- :focus ring brand-CD, border brand-CD

### Select (StatusFilter + ParentGroupFilter)
- Width 123 / 139 (fixed), h=36, bg white, border 1px `#d4d4d8`, radius md
- Trailing chevron-down 16×16 muted-foreground
- Default state shows placeholder muted-foreground; selected state shows value foreground
- :open dropdown panel (shadow base, radius md)

### Table head (`bg-muted`)
- Bg `#f4f4f5` (base/accent / muted)
- Text 14/medium muted-foreground (column labels)
- Border-bottom 1px `#e4e4e7`
- H=40

### Table row (body)
- Default bg white, h=52, border-bottom 1px `#e4e4e7`
- :hover bg muted/40 (`#f4f4f5` with opacity)
- Text 14/regular foreground

### Tên nhóm VTHH cell — link variant
- Text 14/regular brand-CD `#0052ff`
- :hover underline (shadcn Link default)
- Clickable → navigate to DETAIL route

### StatusBadge active "Đang hoạt động"
- Bg `#f0fdf4` (background-success) text `#16a34a` (foreground-success)
- Padding y=2 x=8, radius `rounded-full` (9999 — fully rounded pill — different from DETAIL badge which uses radius lg)
- Font 12/medium hoặc 14/medium (text-xs vs text-sm) — verify với PNG; design_context not fetched, but DEV spec marks `text-xs weight-500`

### StatusBadge inactive "Ngừng hoạt động" (assumed — NOT in PNG)
- Bg `#f4f4f5` (muted) text `#71717a` (muted-foreground)
- Same padding + radius as active
- Verify per BR / DEV spec coverage_gap

### RowActions IconButtons (Edit + Trash)
- Variant=Ghost size=icon (square hover bg-accent radius md)
- Icon 20×20 muted-foreground default
- :hover Edit → foreground; :hover Trash → foreground-error `#ef4444` (red glyph danger preview)
- Gap 8 between 2 icons

### Pagination (shadcn `<Pagination>`)
- prev: "Trước" + leading icon `<ChevronLeft />` 16×16
- next: "Tiếp" + trailing icon `<ChevronRight />` 16×16
- Current page (page 2): `bg-background border border-input` (boxed)
- Other pages: plain text muted-foreground
- Ellipsis "..." literal muted-foreground

### Empty state placeholder
- Centered (mx-auto my-auto) within TableShell empty body
- Illustrated mascot icon (mặt buồn) + text "Không có dữ liệu" 16/semibold foreground

---

## Text Content (verbatim)

### Page chrome
- H1: "Danh sách nhóm vật tư hàng hóa"
- Brand button: "Thêm Nhóm VT/HH" (with leading `+` icon)

### Filter row
- Search placeholder: "Tìm theo mã nhóm, tên nhóm"
- Status filter placeholder: "Trạng thái"
- Parent group filter placeholder: "Thuộc nhóm"

### Table headers (7 cols)
- "STT" · "Tên nhóm VTHH" · "Mã nhóm VTHH" · "Thuộc nhóm" · "Mô tả" · "Trạng thái" · "Thao tác"

### Status badge labels
- "Đang hoạt động" (active variant — observed)
- "Ngừng hoạt động" (inactive variant — assumed, no PNG ground-truth)

### Empty state
- "Không có dữ liệu"

### Pagination
- "Hiển thị" + Select "20" + "mỗi trang"
- Prev/Next: "Trước" / "Tiếp" với chevron icons
- Page list: "1  [2]  3  ...  Tiếp >" (page 2 in box per PNG)

### Sample row data (verbatim from DEV spec ASCII mockup §0)
- Row 1: 1 / "Vật tư hàng hoá" / "BP-63982" / "" / "Phụ tùng" / "Đang hoạt động" / [Edit | Trash]
- Row 2: 2 / "Bộ phận cảm biến tốc độ" / "LG-20487" / "Vật tư hàng hoá" / "Hệ thống phanh" / "Đang hoạt động" / [Edit | Trash]
- Row 3: 3 / "Bộ phận điều hòa không khí" / "BG-48291" / "Vật tư hàng hoá" / "Dầu động cơ" / "Đang hoạt động" / [Edit | Trash]
- … 12 rows total visible (sample data — KHÔNG phải required data, DEV bind từ API)

### Subtab + Navbar + Footer (shared chrome)
- Identical CREATE/EDIT/DETAIL — verbatim:
  - Subtab: "Danh sách sản phẩm" · "Nhóm vật tư hàng hóa" (active) · "Kỳ kế toán"
  - Navbar: "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục " (active)
  - Footer (Section Footer / 01 — simpler): "Phần mềm quản lý Garage (G.M.S), phiên bản 2" · "Hướng dẫn" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Colors (cached from variable_defs)
- `#0052ff` brand-CD → brand button bg, Tên nhóm VTHH cell text (link), subtab active
- `#ffffff` background → page bg, table row body bg, input bg, select bg
- `#18181b` foreground → H1, table cell text, empty state text
- `#71717a` muted-foreground → filter placeholder, table head label, pagination label, row action icon default, footer
- `#e4e4e7` border → table row divider, subtab nav border, button outline
- `#d4d4d8` input → SearchInput border, Select border, pagination current-page border
- `#f4f4f5` accent / muted → table head bg, row :hover bg
- `#f0fdf4` background-success → StatusBadge "Đang hoạt động" bg
- `#16a34a` foreground-success → StatusBadge "Đang hoạt động" text
- `#ef4444` background-error-reverse → Trash icon :hover state (DEV trap §8 hover destructive preview)

### Typography (Inter font-sans)
- `text 2x large/semibold` 24/32 weight 600 → H1
- `text small/medium` 14/20 weight 500 → Brand button text, sub-tab active label, table head labels, StatusBadge text
- `text small/regular` 14/20 weight 400 → SearchInput placeholder/value, filter text, table cell text, pagination label
- `text xs/medium` 12/16 weight 500 → StatusBadge variant (alt — verify; some PNG render 12px, some 14px)
- `text base/semibold` 16/24 weight 600 → Empty state "Không có dữ liệu"

### Spacing
- Page container max-w 1280 padding-x 32 (spacing/8)
- Page header padding-y 20
- Filter row gap 8 (spacing/2) items-center NO flex-1 stretch
- Table internal: h=40 head + 52 row body
- Pagination: row h=36, page-size cluster gap 8, page navigator gap 4 (shadcn default)
- RowActions gap 8 (spacing/2) between Edit + Trash
- StatusBadge padding y=2 (spacing/0-5) x=8 (spacing/2)
- Brand button padding y=8 x=16 (size=default)

### Border radius
- `border-radius/md` = 6 → Brand button, SearchInput, Select, Pagination current-page box
- `rounded-full` = 9999 → StatusBadge (fully rounded pill)
- `border-radius/lg` = 8 → none specific (Footer ghost button uses lg)

### Shadow
- `shadow/sm` → SearchInput, Select, Brand button (light raise)

### Sizes
- `width/w-4` = `height/h-4` = 16 → Plus icon, Search icon, chevron-down (filter trailing), pagination chevrons
- `width/w-5` = `height/h-5` = 20 → RowActions Edit/Trash icons
- `width/w-9` = `height/h-9` = 36 → Brand button h, SearchInput h, Select h, Pagination button h
- Table row h=52, head h=40

### Effects
- Row :hover bg muted/40 (subtle highlight)
- Trash :hover text-foreground-error (red preview)
- Tên nhóm link :hover underline
- Current page (pagination): bordered box visually elevated vs other pages

---

## Notes (oracle interpretation, không phải fact để verify)

- 2 screen state captured: Empty + Populated. Verify: Empty state CÒN visible filter row + brand button (NOT hidden) — see DEV spec Trap §8 #4.
- "Thao tác" cell renders 2 icons inline (Edit + Trash), NOT 3-icon (no Eye). "Xem" action triggered via blue name link in "Tên nhóm VTHH" column — see DEV spec coverage_gap: AC-7 (BA confirms wording or DEV adds Eye icon).
- Column widths Empty (95/238/208.6/...) vs Populated (90/416/268/168/180/154/100) — DIFFERENT between states because Populated has wider Tên nhóm column (416 vs 238) to accommodate data. DEV verify if widths should be fixed or fluid `flex-1` based on FEAT layout decision.
- StatusBadge LIST uses `rounded-full` (fully rounded pill) — DIFFERENT from DETAIL Badge which uses `radius/lg` (8 — soft pill). Two distinct shapes within same feature group; DEV verify business intent (LIST = compact data display; DETAIL = inline-with-H1 prominent).
- Footer "Section Footer / 01" trên LIST = simpler version (h=40) vs "Section Footer / 02" (h=48) trên CREATE/EDIT/DETAIL. Text content also slightly different: "phiên bản 2" (LIST) vs "phiên bản 2.0" (CREATE/EDIT/DETAIL) + "Hướng dẫn" (LIST) vs "Hướng dẫn sử dụng " (others). Verify intentional vs inconsistency; agent-test-ui flag if implementation mismatch.
- Pagination shows page 2 in box (active state) — implementation should highlight current page visually (DEV spec Trap §8 #7).
- 12 sample rows = mock data for visual. Actual data binding from API ListMaterialGroups (page-size 20). All rows "Đang hoạt động" in PNG — inactive variant assumed similar shape, gray colors.
- Interaction states (:hover, :focus) Figma không render → DEV shadcn baseline.
- Cross-ref DEV spec `Product/ux/figma-web/wave03-cat-grp-list.md` for layout DSL, anti-pattern traps, and field composition schema. Oracle here is SUBSET focused on verification facts (5-cấp); DEV spec is implementation guide.
