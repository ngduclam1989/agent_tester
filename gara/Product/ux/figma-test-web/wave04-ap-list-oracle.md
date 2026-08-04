---
feat: FEAT-AP-LIST
feat_file: Product/features/FEAT-AP-LIST.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89259&t=W7XJPVvhmdBPtv2c-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14492:89259"
fetched_at: 2026-07-08T03:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (2 top-level frames — empty 13521:59963 + populated 14653:92128, root section 4670×1347)
  get_variable_defs: success (color/spacing/typography/radius/shadow tokens resolved)
  get_design_context: success (populated frame — full JSX + inline screenshot, code confirms label text verbatim)
  get_screenshot: success (2 PNG per-frame at 1024 max — no downscale trap since each frame ≤1440 wide)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: partial (Figma renders default only; :hover/:focus/:disabled per shadcn baseline §1.5 web transform doc — no Figma variant for interaction states)
  text_content: complete (verbatim from get_design_context.code JSX literals + PNG cross-check)
  design_tokens: complete (variable_defs resolved to hex + Tailwind classes)
  interaction_states: partial (default state captured; hover/focus/active/disabled = shadcn baseline)
coverage_gaps:
  - "AC-6/6b: filter dropdown Figma shows label 'Kỳ kế toán' (period-type semantic) instead of year DESC dropdown per FEAT AC-6 — verify against production, may be Figma placeholder mislabel; oracle records verbatim Figma text"
  - "AC-7 partial: PNG Thao tác column renders 2 icon buttons per row (Edit2 pencil + Trash) — Xem icon absent in Figma; FEAT AC-7 requires 3 (Xem/Sửa/Xóa). Either 'Xem' triggers via row/name click (like FEAT-CAT-GRP-LIST blue link pattern — but names here rendered black, not primary blue in PNG) or Figma is out of sync with AC-7. Flag for BA/UX confirm"
  - "AC-3 expand/collapse chevron: PNG shows ▼ (open) for Năm 2026, Quý 1/2026, Quý 2/2026 and ▲ (closed variant) for Quý 3/2026 + Quý 4/2026. Chevron icon = arrow-down-2 (Icon / Circle 20×20). Only expandable rows (year, quarter) render chevron; month rows render empty 40×40 spacer (opacity-0 Button) to preserve indent grid"
  - "Figma typo note: FEAT-AP-LIST v5 change log records designer typo 'đóng ký' in Figma badge text vs canonical 'đóng kỳ' in FEAT. get_design_context.code returns literal 'Đã đóng kỳ' / 'Chưa đóng kỳ' (dấu huyền) — oracle records code-authoritative text; agent-test-ui verify implementation renders 'kỳ' (canonical), NOT 'ký'"
screenshots:
  - assets/wave04-ap-list/13521-59963-empty.png
  - assets/wave04-ap-list/14653-92128-populated.png
---

# Oracle — FEAT-AP-LIST (web) · wave 04

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14492:89259`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Danh sách kỳ kế toán"** — table 6-col hierarchical
> tree (Năm → Quý → Tháng) với chevron expand/collapse, search + filter dropdown, brand button
> "Thêm kỳ kế toán", badge status (success/error), 2 screen state: Empty (13521:59963, 1440×817)
> + Populated (14653:92128, 1440×868, 10 sample rows). Per-row action: 2 icon button (Edit2 + Trash);
> "Xem" per FEAT AC-7 not visible in Figma — see coverage_gaps.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Empty state (no data) | 13521:59963 | 1440×817 | assets/wave04-ap-list/13521-59963-empty.png |
| Populated (10 sample rows, tree Năm→Quý→Tháng) | 14653:92128 | 1440×868 | assets/wave04-ap-list/14653-92128-populated.png |

---

## Component Inventory

### Screen: Empty (13521:59963)

**Header chrome (shared, identical với Populated)**
- Navbar × 1 (h=104) — GMS brand + top-nav tabs (Tổng quan · Mua hàng · Sửa chữa & Dịch vụ · Tồn kho · Khách hàng · Marketing · Nhân viên · Danh mục [active white pill on blue]) + bell notification icon + Avatar
- Sub-tabs (in "Danh mục") × 3 — "Danh sách sản phẩm" · "Nhóm vật tư hàng hoá" · **"Kỳ kế toán"** (active — text-primary #0052ff + underline)

**Page Header / 3 (`14653:92132`, h=80, px=0, py=20)**
- H1 "Danh sách kỳ kế toán" — Font Inter Semi-Bold 24/32, color foreground #18181b, weight 600
- Button brand (right-aligned, absolute right in Flex justify-between):
  - Variant=Default brand-CD, size=default; h=40, px=32, py=8, radius=rounded-md 6px
  - BG `base/background-brand-CD` #0052ff · Text "Thêm kỳ kế toán" (Inter Medium 14/20 primary-foreground white)
  - Leading icon `vuesax/linear/add-square` (Plus-in-square) 16×16 white
  - Shadow drop `0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.06)`

**Filter row (`13521:59969` / `14653:92134`, h=36, gap=8, flex-wrap)**
- SearchInput × 1 (width 320, h=36) — Input / Basic variant Default
  - Icon leading `vuesax/linear/search-normal-1` (Icon / Search) 16×16 muted
  - Placeholder text "Tìm theo tên kỳ kế toán" (Inter Regular 14/20, color muted-foreground #71717a)
  - BG white, border `base/input` #d4d4d8 solid 1px, radius=rounded-md 6px, shadow-sm, px=12 py=4
- Filter Button × 1 (width 126, h=36) — Variant Outline
  - Text "Kỳ kế toán" (Inter Regular 14/20 foreground #18181b) — NOTE: FEAT AC-6 requires year filter DESC; verify prod
  - Trailing icon `vuesax/linear/arrow-down` (chevron 16×16 muted)
  - BG white, border `base/input` #d4d4d8, radius=rounded-md 6px, drop-shadow-sm, px=16 py=8, gap=8

**Table header (visible in empty state, `13521:59973`, h=40)**
- 6 columns TableHead sticky @ top of empty area, bg=`base/accent` #f4f4f5, border-b #e4e4e7
- Column widths — verbatim từ metadata:
  1. `13521:59988` — 392×40 — Tên kỳ kế toán
  2. `13521:60002` — 392×40 — Loại kỳ kế toán
  3. `13521:60016` — 164×40 — Ngày bắt đầu
  4. `13521:65508` — 164×40 — Ngày kết thúc
  5. `13521:60044` — 164×40 — Trạng thái
  6. `13521:60058` — 100×40 — Thao tác

**Empty state placeholder (`Table Data/Empty` instance @ 13521:59967, w=1376 h=445)**
- Centered illustration icon (document-with-arrow SVG, ~90×90, muted stroke)
- Text "Không có dữ liệu" (Inter Semi-Bold, likely text-base 16/24 semibold, foreground #18181b), centered below icon
- No table body rows

**Section Footer / 01 (`13521:60073`, h=40, border-t #e4e4e7, px=32)**
- Left: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0" (Inter Light 300, 14/20, muted-foreground #71717a)
- Right (justify-end, gap=8): 3 ghost buttons (h=40, px=32, py=8, radius=rounded-lg 8px)
  - "Hướng dẫn sử dụng"
  - "Hỗ trợ"
  - "Hotline: 0985135050"

---

### Screen: Populated (14653:92128)

**Header chrome, Page Header, Filter row, Footer** — identical với Empty (shared instances).

**Table (`14653:92137`, `Sản phẩm / Table`, w=1376, h=560, 6 col × 10 row body)**

Table cấu trúc column-based (mỗi column = 1 Frame `Collum` vertical stack):

- **Column 1 — Tên kỳ kế toán** (392w, tree column)
  - `TableHead` (392×40) text "Tên kỳ kế toán" (Inter Medium 14/20 foreground)
  - Row cell composite: `[chevron-cell 56×52] × depth + name-cell flex-1`
    - depth 0 (Year): 1 chevron cell + name-cell 336w
    - depth 1 (Quarter): 2 cell (invisible spacer 56 + chevron 56) + name-cell 280w
    - depth 2 (Month): 3 cell (2 invisible spacer 56 + chevron 56 opacity-0) + name-cell 280w
  - Chevron button: Variant=Ghost Size=icon Button, 40×40, radius=rounded-md 6px, contains Icon `vuesax/linear/arrow-down-2` (or up when collapsed) 20×20 — NAME `Icon / Circle`
  - Chevron behavior:
    - Expandable (Year, Quarter with children): visible chevron ▼ (open) or ▲ (collapsed)
    - Leaf (Month) OR spacer column: opacity-0 (invisible but takes 40×40 space to preserve grid indent)
  - Text row: Inter Regular 14/20 foreground #18181b, single-line ellipsis, `text-ellipsis whitespace-nowrap`

- **Column 2 — Loại kỳ kế toán** (392w, text-only)
  - TableHead "Loại kỳ kế toán"
  - Cell text values: "Kỳ kế toán năm" / "Kỳ kế toán quý" / "Kỳ kế toán tháng" (Inter Regular 14/20)

- **Column 3 — Ngày bắt đầu** (164w)
  - TableHead "Ngày bắt đầu " (trailing space in Figma layer)
  - Cell placeholder "12/12/2026" (all 10 rows identical sample data)

- **Column 4 — Ngày kết thúc** (164w)
  - TableHead "Ngày kết thúc " (trailing space)
  - Cell placeholder "12/12/2026"

- **Column 5 — Trạng thái** (164w, badge chip)
  - TableHead "Trạng thái " (trailing space)
  - Badge variants (per FEAT AC-4 + BR-AP-010):
    - `Variant=Success`: BG `base/background-success` #f0fdf4, text `base/foreground-success` #16a34a, text "Chưa đóng kỳ" (Inter Medium 14/20), radius=rounded-lg 8px, px=10 py=2, gap=6
    - `Variant=Error`: BG `base/background-error` #fef2f2, text `base/foreground-error` #dc2626, border 1px transparent, text "Đã đóng kỳ" (Inter Medium 14/20), radius=rounded-lg 8px, px=10 py=2, gap=6

- **Column 6 — Thao tác** (100w, action icons)
  - TableHead "Thao tác" (align text-center, Inter Medium 14/20 foreground)
  - Cell (100×52, justify-center): 2 icon-button per row visible trong PNG (Figma code cells empty — icons render via row hover or absolute overlay in prod):
    - Edit2 icon (pencil) — likely `vuesax/linear/edit-2` 16×16 muted
    - Trash icon — likely `vuesax/linear/trash` 16×16 muted
  - Ghost Button Size=icon 40×40 per icon per FEAT AC-7 shadcn baseline

**Row height**: 52px (h=52 = Tailwind `h-13` arbitrary or `[52px]`), border-b #e4e4e7 solid 1px between rows.

---

## Variant & State

### Button "Thêm kỳ kế toán" (I14653:92132;17421:80012)
- variants: Variant=Default (brand-CD)
- state: default only
- shadcn baseline (§1.5): expected states hover (opacity/shade shift), focus-visible (ring-2 ring-primary), active, disabled (opacity-50, cursor-not-allowed) — NOT captured in Figma

### Button filter "Kỳ kế toán" (`14653:92136`)
- variants: Variant=Outline
- state: default (closed dropdown)
- shadcn expected states: hover (bg-accent), focus-visible (ring), open (chevron rotate 180° — not shown in Figma)

### SearchInput (`14653:92135` — Input / Basic)
- variants: Variant=Default, Horizontal Layout=No
- state: default (placeholder shown, no value)
- expected states: focus (ring-primary), filled (text-foreground), disabled (bg-muted opacity-50)

### Badge status (`I14653:92217`..`14653:92226`)
- variants: Variant=Success (Chưa đóng kỳ) + Variant=Error (Đã đóng kỳ)
- state: default
- No hover/click state (badge is display-only)

### Chevron button (`I14653:92141`..`14653:92177;498:5996`) — expand/collapse toggle
- variants: Variant=Ghost, Size=icon
- states observed:
  - default (visible ▼ chevron, opacity 1) — expanded row
  - collapsed (visible ▲ chevron) — Figma renders arrow-down icon rotated OR different asset (Quý 3/2026 + Quý 4/2026 rows)
  - spacer (opacity-0, still 40×40) — non-expandable rows preserving grid alignment
- Expected DEV: use single arrow-down icon + CSS rotate on collapsed state

### Icon Buttons per row Edit + Trash (Thao tác column)
- variants: Variant=Ghost Size=icon shadcn per baseline
- state: default; expected hover (bg-accent), focus-visible ring, active, disabled

### Sub-tab "Kỳ kế toán" (navigation, header chrome)
- state: active (text-primary #0052ff + underline decoration)
- other siblings: default (foreground #18181b, no underline)

---

## Text Content

### Screen: Empty (13521:59963) — verbatim

- Navbar tabs (top-level): "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục" (active)
- Sub-tabs (level 2): "Danh sách sản phẩm" · "Nhóm vật tư hàng hoá" · "Kỳ kế toán" (active blue)
- Page H1: "Danh sách kỳ kế toán"
- Brand button: "Thêm kỳ kế toán"
- Search placeholder: "Tìm theo tên kỳ kế toán"
- Filter dropdown label: "Kỳ kế toán" (see coverage_gaps — likely Figma mislabel vs AC-6 year filter)
- Table headers (6): "Tên kỳ kế toán" · "Loại kỳ kế toán" · "Ngày bắt đầu" · "Ngày kết thúc" · "Trạng thái" · "Thao tác"
- Empty placeholder text: "Không có dữ liệu"
- Footer left: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0"
- Footer right buttons: "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Screen: Populated (14653:92128) — verbatim từ get_design_context.code

Table body row values (Column 1: Tên kỳ kế toán) — 10 rows in Figma sample:

1. "Năm 2026" (root, expanded)
2. "Quý 1/2026" (child of Năm 2026, expanded)
3. "Tháng 1/2026" (child of Quý 1/2026)
4. "Tháng 3/2026"
5. "Tháng 5/2026"
6. "Quý 2/2026" (child of Năm 2026, expanded)
7. "Tháng 5/2026"
8. "Tháng 7/2026"
9. "Quý 3/2026" (collapsed — chevron up)
10. "Quý 4/2026" (collapsed — chevron up)

Column 2 (Loại kỳ kế toán) values map — sample data trong Figma:
- Row 1: "Kỳ kế toán năm" (trailing space in Figma)
- Row 2, 6, 9, 10: "Kỳ kế toán quý"
- Row 3, 4, 5, 7, 8: "Kỳ kế toán tháng"

Column 3 + 4 (Ngày bắt đầu / Ngày kết thúc): "12/12/2026" (sample placeholder — all rows identical, DEV: bind từ API)

Column 5 (Trạng thái) badge text:
- Rows 1, 2, 3, 5 (indexes 0-based match: Năm 2026, Quý 1/2026, Tháng 1/2026, Tháng 5/2026): "Đã đóng kỳ" (error badge)
- Rows 4, 6, 7, 8, 9, 10 (Tháng 3/2026, Quý 2/2026, Tháng 5/2026, Tháng 7/2026, Quý 3/2026, Quý 4/2026): "Chưa đóng kỳ" (success badge)

> **Verbatim rule note**: get_design_context.code JSX literal returns "Đã đóng kỳ" và "Chưa đóng kỳ" (dấu huyền = "kỳ"). Đây là canonical text agent-test-ui verify. Nếu implementation render "đóng ký" (dấu sắc = "ký") thì WRONG_TEXT verdict — FEAT v5 change log đã ghi nhận typo Figma, canonical wording tại code + FEAT.

---

## Design Tokens

### Screen: Populated + Empty (shared token vocab — variable_defs authoritative)

#### Colors (hex → Tailwind class per `_ref-web-transform-figma.md §1.5`)

| Hex | Figma token | Tailwind class | Role / Where |
|---|---|---|---|
| `#0052ff` | `base/background-brand-CD`, `base/foreground-brand-CD` | `bg-primary` / `text-primary` | Brand button BG "Thêm kỳ kế toán"; sub-tab active text/underline |
| `#ffffff` | `base/background`, `base/primary-foreground` | `bg-background` / `text-primary-foreground` | Page BG, button text on brand |
| `#18181b` | `base/foreground` | `text-foreground` | Body text, H1, table cell, header |
| `#71717a` | `base/muted-foreground` | `text-muted-foreground` | Placeholder text, footer, muted labels |
| `#e4e4e7` | `base/border` | `border-border` | Table row/column borders |
| `#d4d4d8` | `base/input` | `border-input` | Input + outline button border |
| `#f4f4f5` | `base/accent` | `bg-accent` | Table header background |
| `#16a34a` | `base/foreground-success` | `text-foreground-success` | Badge "Chưa đóng kỳ" text |
| `#f0fdf4` | `base/background-success` | `bg-background-success` | Badge "Chưa đóng kỳ" bg |
| `#dc2626` | `base/foreground-error` | `text-foreground-error` | Badge "Đã đóng kỳ" text |
| `#fef2f2` | `base/background-error` | `bg-background-error` | Badge "Đã đóng kỳ" bg |
| `#ffffff00` | `tailwind colors/base/transparent` | `bg-transparent` / `border-transparent` | Badge border (transparent) + Chevron ghost button BG |

#### Typography (5-property complete)

| Role | Family | Size | Weight | Line height | Letter spacing | Where |
|---|---|---|---|---|---|---|
| H1 page title | Inter | 24px | 600 (Semi-Bold) | 32px | 0 | "Danh sách kỳ kế toán" |
| Body base semibold | Inter | 16px | 600 | 24px | 0 | "Không có dữ liệu" (empty state, likely) |
| Small medium | Inter | 14px | 500 (Medium) | 20px | 0 | Table head text, Button label ("Thêm kỳ kế toán", "Kỳ kế toán"), Badge text, active sub-tab |
| Small regular | Inter | 14px | 400 (Regular) | 20px | 0 | Table cell text (name, type, date), sub-tab inactive, footer buttons |
| Small light | Inter | 14px | 300 (Light) | 20px | 0 | Footer copyright text "Phần mềm quản lý Garage..." |

#### Spacing (Tailwind scale — Figma variable → px)

| Figma token | px | Tailwind |
|---|---|---|
| `spacing/0` | 0 | `p-0`, `gap-0` |
| `spacing/0-5` | 2 | `py-0.5` (badge) |
| `spacing/1` | 4 | `gap-1`, `p-1` |
| `spacing/1-5` | 6 | `gap-1.5` (badge internal) |
| `spacing/2` | 8 | `gap-2`, `p-2` (table cell, filter row) |
| `spacing/2-5` | 10 | `px-2.5` (badge) |
| `spacing/3` | 12 | `gap-3`, `px-3` (input) |
| `spacing/4` | 16 | `p-4`, `px-4` (button filter, chevron btn) |
| `spacing/5` | 20 | `py-5` (Page Header Flex) |
| `spacing/6` | 24 | `gap-6`, `pb-6` (Content section gap) |
| `spacing/8` | 32 | `px-8`, `py-8` (Page content px, brand button px, footer button px) |
| `spacing/40` | 160 | `p-40` (n/a here) |

Container sizing:
- Frame width 1440px (viewport target)
- Page content px = 32 (spacing/8) → content width = 1376
- Search input width 320, filter button width 126, gap 8
- Table columns: 392 + 392 + 164 + 164 + 164 + 100 = 1376 ✓
- Row height 52 (arbitrary `h-[52px]`), header height 40 (`h-10`)
- Footer height 40 (`h-10`)

#### Radius / Shadow / Border

| Token | Value | Where |
|---|---|---|
| `border radius/md` | 6px = `rounded-md` | Button, Input, chevron ghost button |
| `border radius/lg` | 8px = `rounded-lg` | Badge chip, footer buttons |
| `radius/rounded-full` | 9999px = `rounded-full` | Avatar |
| `shadow/base` | `0 1px 2px #0000000F, 0 1px 3px #0000001A` = `shadow-base` (Tailwind `shadow`) | — |
| `shadow/sm` | `0 1px 2px #0000000D` = `shadow-sm` | Search input, brand button drop-shadow |
| Border width | 1px solid | All borders (input, badge, table row separator, footer top) |

---

## Screenshots

> assets/wave04-ap-list/
- `13521-59963-empty.png` — Empty state (1440×817 native, 1024w rendered, no data + illustration icon + "Không có dữ liệu")
- `14653-92128-populated.png` — Populated (1440×868 native, 1024w rendered, 10 rows tree hierarchy Năm→Quý→Tháng, badge success + error, per-row Edit + Trash icons)

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | agent-orchestrator + Figma MCP (session-1) | Initial oracle for FEAT-AP-LIST wave 04 (web). 2 screen state (empty + populated). Full 5-cấp conformance từ metadata + variable_defs + design_context + per-frame PNG. Coverage_gaps: (a) AC-6 filter dropdown label "Kỳ kế toán" vs FEAT year-filter — Figma likely mislabel; (b) AC-7 Xem icon absent (only Edit + Trash in PNG); (c) chevron spacer semantic; (d) Figma badge typo "đóng ký" vs canonical "đóng kỳ" per FEAT v5 change log. |
