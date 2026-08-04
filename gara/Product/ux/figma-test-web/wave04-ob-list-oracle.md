---
feat: FEAT-OB-LIST
feat_file: Product/features/FEAT-OB-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89262&t=W7XJPVvhmdBPtv2c-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14492:89262"
fetched_at: 2026-07-08T03:30:00+07:00
oracle_version: 1
screenshots:
  - assets/wave04-ob-list/_full.png
  - assets/wave04-ob-list/13575-86900.png
  - assets/wave04-ob-list/14547-95824.png
  - assets/wave04-ob-list/13575-95132.png
mcp_tools_used:
  get_metadata: success
  get_variable_defs: success
  get_design_context: partial (root node oversized — captured section-level: PageHeader/4 [14646:91949], Filter [13575:86906], Filter-with-Selection [13575:95138])
  get_screenshot: success (4 PNGs — 1 root overview + 3 per-frame native res)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (default + empty + selection observed; hover/focus/disabled not observed as separate variant frames — supplemented from shadcn baseline §1.5)
  text_content: complete
  design_tokens: complete
  interaction_states: partial (hover/focus/active/disabled not variant-frames in Figma — inferred from shadcn baseline)
observations:
  - "AC-3 spec 'dòng Tổng cuối bảng' KHÔNG observe được trong 3 Figma frames (default/empty/selection). Table = 1 head + 12 data rows (13 cells × width column), pagination sát dưới table. Cần BA/Design confirm: (a) Tổng row đã có trong design nhưng ẩn dưới viewport, hoặc (b) design pending update. Marker cho agent-test-ui: verify AC-3 vẫn phải test trên implementation nếu backend `PagedOpeningBalanceData.aggregates` trả `totalQuantity/totalValue` (server-side). Nếu implementation không render → BUG spec-vs-design conflict escalate BA/PO."
---

## Screen Inventory

| Screen state | nodeId | size (WxH) | screenshot |
|---|---|---|---|
| Default (data rows, no selection) | 13575:86900 | 1440x1032 | assets/wave04-ob-list/13575-86900.png |
| Empty (Không có dữ liệu) | 14547:95824 | 1440x817 | assets/wave04-ob-list/14547-95824.png |
| Selection (with "Xoá các dòng đã chọn" button visible) | 13575:95132 | 1440x1032 | assets/wave04-ob-list/13575-95132.png |

---

## Component Inventory (shadcn primitives + share/customs vocab)

### Screen: Default (13575:86900)

- Navbar × 1 — top blue bar (bg-#0052ff) 1440×104: logo "GMS" + 8 tabs + notification bell + avatar (share/navigation/navbar)
- Sub-nav TabRow × 1 — 6 tabs: Phiếu nhập kho, Phiếu xuất kho, Tồn đầu kỳ (selected/blue underline), Tính giá xuất kho, Báo cáo tồn kho, Báo cáo NXT (share/tabs or ui/tabs)
- PageHeader × 1 (`Page Header / 4` — node 14646:91949, w=1376 h=80) — H1 title "Danh sách tồn đầu kỳ" + right-aligned primary Button "Import tồn đầu kỳ" (share/page-header)
- FilterRow × 1 (`Fillter` — node 13575:86906, w=1376 h=36) — 4 controls:
  - Input × 1 (`Input / Basic` variant Default — w=320 h=36) with search icon prefix + placeholder "Tìm theo mã, tên sản phẩm nội bộ "
  - Button × 3 (variant Outline size=default) — "Kho " + arrow-down, "Người import" + arrow-down, "Ngày import" + calendar icon (14853 asset)
- Table × 1 (`Sản phẩm / Table` — node 13575:89578, w=1376 h=664) — 12 columns × 13 rows (1 head @40px + 12 data @52px each)
  - `Table / Head` × 11 (checkbox col uses `Table / Cell` variant for head)
  - `Table / Cell` × 144 (12 rows × 12 cols)
- Pagination × 1 (`Table Pagination` — node 13575:87096, w=1376 h=36)
- Footer × 1 (`Section Footer / 01` — node 13575:87097, w=1440 h=40)

### Screen: Empty (14547:95824)

- Navbar × 1 (identical to Default)
- Sub-nav TabRow × 1 (identical)
- PageHeader × 1 (variant `Page Header / 3` — node 14547:95828, w=1376 h=80) — same title + "Import tồn đầu kỳ" button (still visible)
- FilterRow × 1 (`Fillter` — 4 controls identical to Default)
- Table head × 1 (`Sản phẩm / Table` — h=40 only, no data rows) — 12 head cells
- **EmptyState** × 1 (`Table Data/Empty` — node 14547:101030, w=1376 h=445) — centered illustration icon + text "Không có dữ liệu"
- No pagination
- Footer × 1

### Screen: Selection (13575:95132)

- Navbar × 1 (identical)
- Sub-nav × 1 (identical)
- PageHeader × 1 (`Page Header / 4` — variant with "Import tồn đầu kỳ" button — identical to Default)
- FilterRow × 1 (`Fillter` — node 13575:95138, w=1376 h=36) — **6 elements** (Selection variant):
  - Button-list "Xoá các dòng đã chọn" (`Button list` — node 14853:93125, w=205 h=36) — outline variant + `vuesax/linear/trash` icon left
  - Divider × 1 (`Divider` — node 14853:93159, vertical hairline w~0 h=11.3px, x=213)
  - Input × 1 (`Input / Basic` — 320×36, x=221) — same placeholder "Tìm theo mã, tên sản phẩm nội bộ "
  - Button × 3 (Kho / Người import / Ngày import — identical to Default, positions shifted x=549/639/790)
- Table × 1 (`Sản phẩm / Table` — 12 cols × 13 rows, identical structure)
  - 7/12 rows have checkbox `checked` state visible (rows 1, 4, 5, 6, 8, 9, 10)
- Pagination × 1 (identical)
- Footer × 1

---

## Variant & State

### Navbar (14547:95825 / 13575:86901 / 13575:95133)
- variants: single global variant
- observed: default (Tồn kho tab active white text + white underline)

### PageHeader (Page Header / 4 vs Page Header / 3)
- variants observed: `Page Header / 4` (Default + Selection) = title + right primary CTA button; `Page Header / 3` (Empty) = same layout — SAME visual per PNG (both render "Import tồn đầu kỳ" button)
- states observed: default (both states enabled)

### Button — "Import tồn đầu kỳ" (I14646:91949;22127:5909)
- variants (shadcn): variant=default (bg-brand), size=lg-ish (h=40 px-32 py-8), Code Connect node 10613:123318 `Variant=Default, State=Default, Size=lg`
- states observed: default only
- states inferred (shadcn baseline §1.5): hover, focus-visible, active, disabled — not variant-frame in Figma

### Button — filter outline (Kho / Người import / Ngày import — 13575:86908/86909/86910)
- variants (shadcn): `Variant=Outline, State=Default, Size=default` — Code Connect node 10613:123368
- states observed: default only
- states inferred: hover, open (dropdown expanded), focus-visible — not variant-frame in Figma

### Button — "Xoá các dòng đã chọn" (14853:93128)
- variant (shadcn): Outline, size default, h=36 px-16 py-8, gap=8, leading icon `vuesax/linear/trash`
- states observed: default (visible only when ≥1 row checked per AC-1/AC-7)
- inferred: hidden (0 selected), default (≥1 selected), hover, focus-visible

### Input / Basic — search box (13575:86907 / 13575:95139)
- variant Code Connect: `Horizontal Layout=No, Variant=Default, State=Default` (11849:101386)
- states observed: default (placeholder shown, no focus ring)
- states inferred: focus (ring primary), filled, disabled — not variant-frame

### Table / Head vs Table / Cell
- head row: h=40 (single variant)
- data cell: h=52 (single variant)
- selection state variant: checkbox column `Table / Cell` row shows checked-box glyph (bg brand blue + white checkmark) in Screen 3
- row state observed: default (no hover/selected-row highlight visible in Figma)

### Checkbox (inferred from Screen 3 rows)
- variants observed: unchecked (border #d4d4d8, bg white, 16×16), checked (bg #0052ff + white checkmark, 16×16)
- states inferred: hover, focus-visible, indeterminate (header checkbox all-select semi-state) — not variant-frame

### EmptyState (14547:101030 `Table Data/Empty`)
- single variant — illustration + label
- state: static

### Pagination (13575:87096 / 13575:95298 `Table Pagination`)
- variants observed: default — "Hiển thị [20 v] mỗi trang" left · pager "< Trước 1 [2] 3 ... Tiếp >" right (current page = 2 in mock)
- states inferred: page 1 (prev disabled), last page (next disabled)

---

## Text Content (verbatim VN)

### Screen: Default (13575:86900)

**Navbar tabs (top blue bar)**:
- "GMS"
- "Tổng quan"
- "Mua hàng"
- "Sửa chữa & Dịch vụ"
- "Tồn kho" (active)
- "Khách hàng"
- "Marketing"
- "Nhân viên"
- "Danh mục"

**Sub-nav tabs**:
- "Phiếu nhập kho"
- "Phiếu xuất kho"
- "Tồn đầu kỳ" (active — blue text + blue bottom border)
- "Tính giá xuất kho"
- "Báo cáo tồn kho"
- "Báo cáo NXT"

**Page title / actions**:
- "Danh sách tồn đầu kỳ" (H1)
- "Import tồn đầu kỳ" (primary CTA, top-right)

**Filter row**:
- Search placeholder: "Tìm theo mã, tên sản phẩm nội bộ " (trailing space verbatim from Figma text node I13575:86907;65:522)
- "Kho " (trailing space verbatim)
- "Người import"
- "Ngày import"

**Table headers (12 columns L→R)**:
1. (checkbox — no text label; header-cell contains select-all checkbox)
2. "STT"
3. "Tồn đến ngày"
4. "Kho"
5. "Mã nội bộ"
6. "Tên nội bộ"
7. "ĐVT"
8. "Số lượng tồn"
9. "Giá trị tồn"
10. "Người import"
11. "Ngày import"
12. "Thao tác"

**Table data (mock, 12 rows)** — sample row #1:
- STT: "1"
- Tồn đến ngày: "15/03/2023"
- Kho: "Kho chính" (some rows: "Kho phụ tùn..." — text-ellipsis truncated at col width 113px)
- Mã nội bộ: "PN-18901" (blue link color #0052ff)
- Tên nội bộ: "Lọc dầu động cơ Toyota"
- ĐVT: "Cái"
- Số lượng tồn: "24" (right-aligned)
- Giá trị tồn: "9.300.000đ" (right-aligned, VN thousand separator "." + suffix "đ")
- Người import: "Nguyễn Văn Ánh"
- Ngày import: "15/03/2023"
- Thao tác: (edit ✏️ icon + delete 🗑️ icon)

**Pagination**:
- "Hiển thị" · "20" (select) · "mỗi trang"
- "< Trước" · "1" · "2" (current) · "3" · "..." · "Tiếp >"

**Footer**:
- "Phần mềm quản lý Garage (G.M.S), phiên bán 2.0" (left — note verbatim "phiên bán" — potential typo in Figma design, transcribe as-observed for oracle)
- "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Screen: Empty (14547:95824)

- All navbar / sub-nav / page-header / filter-row text: identical to Default
- Table headers: identical 12 columns
- **Empty body text**: "Không có dữ liệu" (centered below illustration icon)
- No pagination text
- Footer text identical

### Screen: Selection (13575:95132)

- All navbar / sub-nav / page-header / footer text: identical to Default
- **New button label (leftmost in filter row)**: "Xoá các dòng đã chọn" (verbatim: "Xoá" with acute-below/grave "á" — Vietnamese "xóa" alternate spelling "xoá"; "các" not "cac"; "đã" not "da"; "chọn" not "chon")
- Search + 3 filter buttons: identical text to Default
- Table headers + row data: identical

---

## Design Tokens

### Colors (hex → expected Tailwind class per §1.5 web transform)

| Role / Element | Hex | Expected Tailwind |
|---|---|---|
| Brand primary (navbar bg, primary button bg, blue link, checkbox checked, tab-active underline, pagination current) | #0052ff | `bg-primary` / `bg-brand` / `text-primary` (base/background-brand-CD variable) |
| Primary foreground (button text on blue) | #ffffff | `text-primary-foreground` / `text-white` |
| Base foreground (body text, headings) | #18181b | `text-foreground` |
| Muted foreground (placeholder, secondary text) | #71717a | `text-muted-foreground` |
| Border input (filter buttons, search input, checkbox unchecked) | #d4d4d8 | `border-input` |
| Border (subtle borders — sub-nav divider bottom line) | #e4e4e7 | `border` / `border-border` |
| Background (page/table/card) | #ffffff | `bg-background` / `bg-white` |
| Background error reverse (potential destructive delete confirm — not seen this screen) | #ef4444 | `bg-destructive` |
| Neutral 600 (some icon strokes) | #525252 | `text-neutral-600` |
| Accent (light gray — muted section bg) | #f4f4f5 | `bg-accent` / `bg-muted` |
| Transparent | #ffffff00 | `bg-transparent` |

### Typography (5-property; family/size/weight/lh/ls all captured)

| Role | Family | Size | Weight | Line-height | Letter-spacing | Expected Tailwind |
|---|---|---|---|---|---|---|
| Page title H1 "Danh sách tồn đầu kỳ" | Inter | 24px | 600 (Semi Bold) | 32px | 0 | `text-2xl font-semibold leading-8` |
| Button label (Import, filter dropdown, Xoá) | Inter | 14px | 500 (Medium) | 20px | 0 | `text-sm font-medium leading-5` |
| Input placeholder text | Inter | 14px | 400 (Regular) | 20px | 0 | `text-sm font-normal leading-5 text-muted-foreground` |
| Table head cell | Inter | 14px | 500 (Medium) | 20px | 0 | `text-sm font-medium leading-5` |
| Table body cell | Inter | 14px | 400 (Regular) | 20px | 0 | `text-sm font-normal leading-5` |
| Empty state "Không có dữ liệu" | Inter | ~16px | 600 (Semi Bold) | 24px | 0 | `text-base font-semibold leading-6 text-foreground` |
| Pagination label | Inter | 14px | 400 | 20px | 0 | `text-sm leading-5` |

### Spacing

| Container | Padding / Gap |
|---|---|
| Content area (Content — 13575:86905) | padding: 0 32px (parent Page content ml/mr=32), gap between filter and table: 24 |
| Filter row (Fillter) | `gap: 8` between elements, `content-center flex flex-wrap items-center`; input width fixed 320px |
| Filter row (Selection variant) | `gap: 8` items; "Button list" wrapper `gap: 12` (spacing/3) items-end |
| Primary button "Import tồn đầu kỳ" | h=40, px=32 (spacing/8), py=8 (spacing/2), gap=8 |
| Outline filter button (Kho/Người import/Ngày import) | h=36, px=16 (spacing/4), py=8 (spacing/2), gap=8 |
| Selection button "Xoá các dòng đã chọn" | h=36, px=16, py=8, gap=8, w=205 |
| Search input `Input / Basic` | h=36, px=12 (spacing/3), py=4 (spacing/1), gap=4, w=320 |
| Table cell head | h=40 |
| Table cell body | h=52 |
| Page header row | py=20 (spacing/5) |
| Divider (14853:93159) | vertical hairline (rotated 90deg), height=11.353px, gap around: 4-8px |

### Column widths (default state — Sản phẩm/Table 1376px total)

| # | Column | Width (px) |
|---|---|---|
| 1 | Checkbox | 60 |
| 2 | STT | 60 |
| 3 | Tồn đến ngày | 113 |
| 4 | Kho | 113 |
| 5 | Mã nội bộ | 120 |
| 6 | Tên nội bộ | 201 |
| 7 | ĐVT | 79 (head 85 aligned x=-3) |
| 8 | Số lượng tồn | 112 |
| 9 | Giá trị tồn | 133 |
| 10 | Người import | 172 |
| 11 | Ngày import | 113 |
| 12 | Thao tác | 100 |
| **Total** | | **1376** |

### Radius

| Element | Value | Expected Tailwind |
|---|---|---|
| Buttons (all — Import, filter outline, Xoá, Input) | 6px | `rounded-md` (border-radius/md) |
| Table (no visible outer radius) | 0 | — |
| Checkbox | 4px | `rounded-sm` (border-radius/default = 4) |
| Full-round | 9999 | `rounded-full` |

### Shadow

| Element | Effect | Expected Tailwind |
|---|---|---|
| Search input (13575:86907) | `shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]` (shadow/sm) | `shadow-sm` |
| Outline filter buttons (Kho/Người import/Ngày import) | `drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]` | `shadow-sm` (approx) |
| Primary button "Import tồn đầu kỳ" | `drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.06)]` (shadow/base composite: `0 1px 2px #0000000F` + `0 1px 3px #0000001A`) | `shadow-md` (closest baseline) |

### Icons observed

| Element | Figma layer | Expected iconsax-reactjs |
|---|---|---|
| Primary CTA icon | `vuesax/linear/document-upload` | `<DocumentUpload variant="Linear" size="16" color="#ffffff" />` |
| Filter dropdown chevron | `vuesax/linear/arrow-down` | `<ArrowDown variant="Linear" size="16" color="#18181b" />` |
| Search input prefix | `Icon / Search` (14:3568) | `<SearchNormal1 variant="Linear" size="16" color="#71717a" />` (or `Search` mapping) |
| "Xoá các dòng đã chọn" prefix | `vuesax/linear/trash` | `<Trash variant="Linear" size="16" color="#18181b" />` |
| Row action edit | (Thao tác cell, edit-2 glyph) | `<Edit2 variant="Linear" size="16" color="#71717a" />` |
| Row action delete | (Thao tác cell, trash glyph) | `<Trash variant="Linear" size="16" color="#71717a" />` |
| Ngày import calendar | (button trailing calendar) | `<Calendar variant="Linear" size="16" color="#18181b" />` |
| Navbar bell + red dot | (notification icon) | `<Notification variant="Linear" size="20" color="#ffffff" />` + red dot indicator |

### Interaction states (P1 spec — mostly inferred from shadcn baseline §1.5, Figma has no state-variant frames)

| Element | State | Expected treatment |
|---|---|---|
| Primary button "Import tồn đầu kỳ" | hover | darken bg by ~5% (`hover:bg-primary/90`) |
| Primary button | focus-visible | ring width 2 + `ring-primary/50` offset 2 |
| Primary button | active | scale-95 or bg press |
| Primary button | disabled | `opacity-50 cursor-not-allowed` |
| Outline filter button | hover | `hover:bg-accent hover:text-accent-foreground` |
| Outline filter button | open (dropdown) | border-primary or bg-accent |
| Search input | focus | `focus-visible:ring-2 ring-ring ring-offset-2` |
| Search input | disabled | `bg-muted cursor-not-allowed opacity-50` |
| Search input | error | `border-destructive` + destructive helper text |
| Checkbox | checked | bg #0052ff + white checkmark (observed screen 3 rows) |
| Checkbox | indeterminate (header select-partial) | not observed variant; inferred `data-[state=indeterminate]:bg-primary` + horizontal bar glyph |
| Checkbox | hover | `hover:border-primary` |
| Table row | hover | Figma does NOT show hover variant — inferred `hover:bg-muted/50` per shadcn table baseline |
| Table row | selected (via checkbox) | Figma screen 3 shows checkbox checked but ROW BG remains white — no row highlight variant observed |
| Pagination current page | active | bg #0052ff + text white (observed "2" is filled blue) |
| Pagination other pages | default | text #18181b, no bg |
| Pagination "< Trước" / "Tiếp >" | disabled (first/last page) | inferred `opacity-50 cursor-not-allowed` |

---

## Screenshots

> assets/wave04-ob-list/

- `_full.png` — Section overview (root 14492:89262, all 3 screens tiled — 6365×1551 downscaled to 2048×519, for orientation only; **do NOT use for pixel claims** per `_ref-figma-mcp-tools.md §3.1.1`)
- `13575-86900.png` — Screen 1: Default state with 12 mock data rows (native 1440×1032)
- `14547-95824.png` — Screen 2: Empty state "Không có dữ liệu" (native 1440×817)
- `13575-95132.png` — Screen 3: Selection state with "Xoá các dòng đã chọn" button + 7 checkboxes checked (native 1440×1032)
