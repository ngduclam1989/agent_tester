---
feat: FEAT-CAT-GRP-CREATE
feat_file: Product/features/FEAT-CAT-GRP-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88837&t=g9GrqfVRsuvDYwl3-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14423:88837"
fetched_at: 2026-06-29T03:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (1 top-level frame 13501:136447)
  get_variable_defs: success (cached — identical token vocab cross wave 03 FEATs)
  get_design_context: success (frame 13501:136447 — full page tree)
  get_screenshot: success (2 PNG: _full + main frame)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete (verbatim from design_context)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-grp-create/_full.png
  - assets/wave03-cat-grp-create/13501-136447-main.png
---

# Oracle — FEAT-CAT-GRP-CREATE (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14423:88837`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Thêm nhóm vật tư hàng hóa"** — form 1-bước tạo
> nhóm vật tư hàng hoá với 4 trường thuộc tính + 1 trường Mô tả (textarea full-row).

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Default — form rỗng (canonical) | 13501:136447 | 1440×1024 | assets/wave03-cat-grp-create/13501-136447-main.png |

> Section chỉ chứa 1 frame canonical (không có nhiều variant — khác với CAT-PROD-CREATE).
> Sample data trong frame (IP-BP-0001, Lọc dầu động cơ Toyota, Nhóm vật tư hàng hoá, Đang hoạt động,
> Phụ tùng bảo dưỡng…) chỉ là filled-state mock — DEV xử lý theo FEAT AC (form CREATE thực tế rỗng).

---

## Component Inventory

### Screen: Default form (13501:136447)

**Header chrome (shared)**
- Navbar (top) × 1 — instance shared: GMS logo + 7 menu items (Tổng quan · Mua hàng · Sửa chữa & Dịch vụ · Tồn kho · Khách hàng · Marketing · Nhân viên · **Danh mục** active) + notification bell (10×10 dot) + avatar 40×40
- Sub-tabs row × 1 — 3 tab: Danh sách sản phẩm · **Nhóm vật tư hàng hóa** (active brand-CD + underline 2px) · Kỳ kế toán

**Page header (`Page Header / 3`, height 80)**
- BackArrow IconButton × 1 (Variant=Ghost size=icon, 40×40, chứa icon `vuesax/linear/arrow-left` 20×20)
- H1 "Thêm nhóm vật tư hàng hóa" (text 2x-large/semibold 24/32 weight 600)
- Action cluster (right):
  - Button "Huỷ bỏ" (Variant=Outline size=lg, h=40, px=32 py=8, border `base/input`, drop-shadow sm)
  - Button "Tạo" (Variant=Default brand-CD size=lg, h=40, px=32 py=8, bg `#0052ff`, text white, drop-shadow sm)

**Section "Thông tin chung"** (title text 18px/28 weight 600, padding-bottom 16)

**FormGrid 2-column × 2 hàng** (gap 16px col, gap 16px row, height per row 58 — label 20 + control 36 + gap 2)
- Row 1:
  - Field 1 (Select-like control 600px): "Mã nhóm VTHH *" — _SelectTrigger 36px no chevron — sample text "IP-BP-0001" (Note: trong CREATE thực tế = system-generated code, read-only / auto-fill — không có chevron arrow trong PNG canonical)
  - Field 2 (Input 600px): "Tên nhóm VTHH *" — Input 36px text "Lọc dầu động cơ Toyota"
- Row 2:
  - Field 3 (Input/Select hybrid 600px): "Thuộc nhóm" — Input wrapper 36px text "Nhóm vật tư hàng hoá" + trailing icon `arrow-down` 20×20 (= Combobox / Select with search)
  - Field 4 (Select 600px): "Trạng thái" — _SelectTrigger 36px text "Đang hoạt động" + chevron-down 16×16

**Textarea row (full width)** (padding-top 16)
- Textarea × 1: "Mô tả" — label 14/medium + textarea container border `base/input` radius md, min-height 60px, total 126px tall, placeholder text muted-foreground "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."

**Footer (shared)**
- Text "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" (font-light 14/20 color foreground-black)
- 3 link button: "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050" — Ghost buttons h=40 radius lg

---

## Variant & State

### Button "Tạo" (primary brand-CD, size=lg)
- Variant=Default size=lg per shadcn — h=40, px=32 py=8, radius md (6)
- Default bg `#0052ff` text white drop-shadow `0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.06)`
- :hover verify shadcn baseline (`bg-primary/90`); :focus ring brand-CD; :disabled opacity 50%

### Button "Huỷ bỏ" (secondary outline, size=lg)
- Variant=Outline size=lg — h=40, px=32 py=8, radius md
- Default bg white border 1px `#d4d4d8` (`base/input`) text foreground (`#18181b`) drop-shadow `0 1 1 rgba(0,0,0,0.05)`
- :hover bg accent (`#f4f4f5`); :focus ring; :disabled opacity 50%

### Button "BackArrow" (ghost icon)
- Variant=Ghost size=icon (40×40 square, padding 8/16, radius md, bg transparent)
- :hover bg accent; :focus ring

### Input / Basic ("Tên nhóm VTHH", "Mã nhóm VTHH")
- Default bg white border 1px `#d4d4d8` radius md, h=36, padding 8 12, shadow `0px 1px 2px rgba(0,0,0,0.05)`
- Text 14/regular foreground
- Required mark "*" sau label = text `#dc2626` (foreground-error)
- :focus ring brand-CD; :error border `#dc2626` + ring red; :disabled bg accent opacity 50%

### Select / Combobox ("Thuộc nhóm" + trailing arrow-down 20×20, "Trạng thái" + chevron-down 16×16)
- Default bg white border 1px `#d4d4d8` radius md h=36 padding 8 12 gap 4
- Chevron icon muted-foreground
- :open dropdown panel shadcn `SelectContent` (shadow base, radius md, bg white)
- :focus ring brand-CD

### Textarea ("Mô tả")
- Default bg white border 1px `#d4d4d8` radius md, min-h 60, padding 8 12, shadow sm
- Text 14/regular; placeholder muted-foreground
- :focus ring brand-CD; :disabled bg accent

### Label
- Text 14/medium foreground (`#18181b`) line-height 1 (compact)
- Required suffix " *" (space + asterisk) text `#dc2626`

### Navbar link "Danh mục" (active)
- Bg white (inverted vs other links which are brand-CD bg with white text)
- Text brand-CD `#0052ff` (no opacity)
- Padding 12 16 radius md

### Sub-tab "Nhóm vật tư hàng hóa" (active)
- Border-bottom 2px solid brand-CD
- Text brand-CD `#0052ff` (no opacity, full color)
- Inactive sibling tabs: text muted-foreground (`#71717a`)

---

## Text Content (verbatim)

### Page chrome
- H1: "Thêm nhóm vật tư hàng hóa"
- Header buttons (right): "Huỷ bỏ" · "Tạo"
- BackArrow icon (no label)

### Section heading
- "Thông tin chung " (trailing space verbatim — text large/semibold 18px)

### Field labels + sample values (sample = mock filled-state, không phải default placeholder)
- "Mã nhóm VTHH *" — sample: "IP-BP-0001"
- "Tên nhóm VTHH *" — sample: "Lọc dầu động cơ Toyota"
- "Thuộc nhóm" — sample: "Nhóm vật tư hàng hoá" (note: dấu "hoá" — verbatim Figma, khác "hóa" ở H1)
- "Trạng thái" — sample: "Đang hoạt động"
- "Mô tả" — sample muted-foreground: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."

### Required asterisk
- 2 trường có "*": Mã nhóm VTHH · Tên nhóm VTHH
- Trường KHÔNG có "*": Thuộc nhóm · Trạng thái · Mô tả

### Subtab nav (shared chrome)
- "Danh sách sản phẩm" · "Nhóm vật tư hàng hóa" (active) · "Kỳ kế toán"

### Navbar menu (shared chrome)
- "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục " (active, trailing space verbatim)

### Footer (shared chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" (verbatim — note typo "Phầm" giữ nguyên design)
- "Hướng dẫn sử dụng " (trailing space verbatim) · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Colors
- `#0052ff` (base/background-brand-CD, base/foreground-brand-CD) → tailwind `bg-brand-cd` / `text-brand-cd` / `border-brand-cd` (button "Tạo" bg, subtab active underline + text, navbar "Danh mục" text)
- `#ffffff` (base/background, base/primary-foreground) → `bg-white` / `text-white` (page bg, navbar "Danh mục" bg, button "Tạo" text)
- `#18181b` (base/foreground) → `text-foreground` (H1, label, input text)
- `#71717a` (base/muted-foreground) → `text-muted-foreground` (subtab inactive, textarea placeholder, footer)
- `#e4e4e7` (base/border) → `border-border` (subtab nav bottom border)
- `#d4d4d8` (base/input) → `border-input` (Input + Select + Textarea border, Cancel button border)
- `#f4f4f5` (base/accent) → `bg-accent` (hover state, secondary surface)
- `#dc2626` (foreground-error) → `text-destructive` (required asterisk "*")
- `#474847` (Dark/3) → footer link text (Hướng dẫn sử dụng / Hỗ trợ / Hotline)

### Typography (Inter font-sans)
- `text 2x large/leading-normal/semibold` → 24px/32px weight 600 letter-spacing 0 → `text-2xl font-semibold` (H1 "Thêm nhóm vật tư hàng hóa")
- `text large/leading-normal/semibold` → 18px/28px weight 600 letter-spacing 0 → `text-lg font-semibold` (Section "Thông tin chung")
- `text base/leading-normal/semibold` → 16px/24px weight 600 → `text-base font-semibold` (GMS logo text)
- `text small/leading-normal/medium` → 14px/20px weight 500 → `text-sm font-medium` (label, button text, navbar link)
- `text small/leading-none/medium` → 14px/1 weight 500 (compact label — "Thuộc nhóm", "Trạng thái", "Mô tả")
- `text small/leading-normal/regular` → 14px/20px weight 400 → `text-sm` (input value, footer link)
- `font-light` 14/20 weight 300 → footer "Phầm mềm quản lý Garage..."

### Spacing tokens
- `spacing/0` = 0 · `spacing/0-5` = 2 · `spacing/1` = 4 · `spacing/1-5` = 6 · `spacing/2` = 8 · `spacing/2-5` = 10 · `spacing/3` = 12 · `spacing/4` = 16 · `spacing/5` = 20 · `spacing/6` = 24 · `spacing/8` = 32 · `spacing/40` = 160
- Page container max-width 1280, padding-x 32 (spacing/8)
- Page content gap 32 (spacing/8)
- Page header padding-y 20 (spacing/5)
- Section title padding-bottom 16 (spacing/4)
- FormGrid row gap 16, column gap 16, internal label-control gap 8 (spacing/2)
- Header right buttons cluster gap 8 (spacing/2)
- Button padding y=8 (spacing/2) x=32 (spacing/8) — size=lg
- Input padding y=8 x=12 (spacing/3) gap 4 (spacing/1)
- Textarea padding y=8 x=12 min-h 60

### Border radius
- `border radius/md` = 6 → Button, Input, Select, Textarea, Navbar link, Subtab link
- `border radius/lg` = 8 → Footer ghost button

### Shadow
- `shadow/sm` = drop-shadow `0 1 2 rgba(0,0,0,0.05)` → Input, Select trigger, Textarea container, Outline button
- `shadow/base` = drop-shadow stack `0 1 2 rgba(0,0,0,0.06)` + `0 1 3 rgba(0,0,0,0.10)` → Select dropdown content
- Brand button shadow → `drop-shadow [0 1 1.5 rgba(0,0,0,0.10), 0 1 1 rgba(0,0,0,0.06)]`

### Sizes
- `width/w-4` = `height/h-4` = 16 → chevron-down (Trạng thái), notification bell
- `width/w-5` = `height/h-5` = 20 → arrow-left (back), arrow-down (Thuộc nhóm trailing)
- `width/w-9` = `height/h-9` = 36 → Input / Select trigger height
- `width/w-10` = `height/h-10` = 40 → Avatar, IconButton 40×40, Button size=lg height

### Effects
- Active navbar "Danh mục" pill: white bg trên container brand-CD bg (color inversion)
- Subtab active: text brand-CD + 2px underline brand-CD (no bg)
- Required asterisk "*" rendered inline sau label, color destructive

---

## Notes (oracle interpretation, không phải fact để verify)

- Frame canonical chứa sample data filled-state (IP-BP-0001 / Lọc dầu động cơ Toyota / Nhóm vật tư hàng hoá / Đang hoạt động / mô tả Phụ tùng bảo dưỡng…) — đây là **filled-state mock** minh hoạ component, KHÔNG phải required default value. CREATE form thực tế khi load = trống (placeholder hoặc auto-generated code cho Mã nhóm VTHH).
- "Mã nhóm VTHH" trong PNG render = _SelectTrigger 36px KHÔNG có chevron → có thể là read-only input (system auto-generated code) hoặc Combobox không-arrow. DEV verify per FEAT AC business rule (BR: code auto-generated by backend hay user-input).
- "Thuộc nhóm" có trailing `arrow-down` 20×20 → render là Combobox / Select với search-on-type. Options dynamic từ API list parent groups.
- "Trạng thái" có trailing `chevron-down` 16×16 size khác (smaller) → render Select đơn giản 2 option: "Đang hoạt động" / "Ngừng hoạt động" (theo BR catalog status).
- Interaction states (:hover, :focus, :error, :disabled) Figma không render → DEV theo shadcn/ui baseline (variant matches Component descriptions: Outline/lg, Default/lg, Ghost/icon, Select, Input/Basic Variant=Default State=Filled, Textarea State=Default).
- FEAT-CAT-GRP-CREATE phiên bản này KHÔNG có 3 tab cuối form (khác CAT-PROD-CREATE) — chỉ duy nhất 1 section "Thông tin chung" với 4 field + 1 textarea.
- Sample text trong "Mô tả" muted-foreground color → trên CREATE form load lần đầu = placeholder text gray (chưa nhập). Khi user nhập → text foreground (black). Verify state mapping placeholder vs value.
