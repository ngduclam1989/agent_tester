---
feat: FEAT-CAT-GRP-EDIT
feat_file: Product/features/FEAT-CAT-GRP-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88839&t=g9GrqfVRsuvDYwl3-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14423:88839"
fetched_at: 2026-06-29T03:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (1 top-level frame 13501:137679)
  get_variable_defs: cached (identical token vocab cross wave 03 FEATs — fetched once trên FEAT-CAT-GRP-LIST 14423:88836)
  get_design_context: success (frame 13501:137679 — full page tree)
  get_screenshot: success (2 PNG: _full + main frame)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete (verbatim from design_context)
  design_tokens: complete (variable_defs cached)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-grp-edit/_full.png
  - assets/wave03-cat-grp-edit/13501-137679-main.png
---

# Oracle — FEAT-CAT-GRP-EDIT (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14423:88839`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Chỉnh sửa nhóm vật tư hàng hóa"** — form 1-bước
> sửa nhóm vật tư hàng hoá. **Layout/composition IDENTICAL CREATE** (cùng 4 field + 1 textarea),
> khác biệt: H1 + nhãn nút "Lưu" (vs "Tạo" ở CREATE) + giá trị field được pre-filled từ data hiện tại.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Default — form pre-filled (canonical) | 13501:137679 | 1440×1024 | assets/wave03-cat-grp-edit/13501-137679-main.png |

> Section chỉ chứa 1 frame canonical. Form pre-filled từ data nhóm "Lọc dầu động cơ Toyota" hiện tại.

---

## Component Inventory

### Screen: Edit form (13501:137679)

**Header chrome (shared)** — Navbar (top, brand-CD bg, h=104) + Sub-tabs row (active "Nhóm vật tư hàng hóa"). Identical FEAT-CAT-GRP-CREATE.

**Page header (`Page Header / 3`, height 80)**
- BackArrow IconButton × 1 (Ghost size=icon 40×40, icon `vuesax/linear/arrow-left` 20×20)
- H1 "Chỉnh sửa nhóm vật tư hàng hóa" (text 2x-large/semibold 24/32)
- Action cluster (right):
  - Button "Huỷ bỏ" (Variant=Outline size=lg, h=40, px=32 py=8, border `base/input`, shadow sm)
  - Button "Lưu" (Variant=Default brand-CD size=lg, h=40, px=32 py=8, bg `#0052ff`, text white, shadow brand)

**Section "Thông tin chung"** (title text 18px/28 weight 600, padding-bottom 16)

**FormGrid 2-column × 2 hàng** (gap 16px, height per row 58)
- Row 1:
  - Field 1 (600px): "Mã nhóm VTHH *" — _SelectTrigger 36px text "IP-BP-0001" (read-only / immutable — code khoá khi EDIT theo BR)
  - Field 2 (Input 600px): "Tên nhóm VTHH *" — Input 36px pre-filled "Lọc dầu động cơ Toyota"
- Row 2:
  - Field 3 (Combobox 600px): "Thuộc nhóm" — Input wrapper 36px text "Nhóm vật tư hàng hoá" + trailing `arrow-down` 20×20
  - Field 4 (Select 600px): "Trạng thái" — _SelectTrigger 36px text "Đang hoạt động" + chevron-down 16×16

**Textarea row (full width)** (padding-top 16)
- Textarea × 1: "Mô tả" — label 14/medium + textarea 126px tall, pre-filled text muted-foreground "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."

**Footer (shared)** — Identical CREATE/DETAIL footer.

---

## Variant & State

### Button "Lưu" (primary brand-CD, size=lg)
- Variant=Default size=lg — h=40, px=32 py=8, radius md (6), bg `#0052ff`, text white
- Drop-shadow `0px 1px 1.5px rgba(0,0,0,0.1), 0px 1px 1px rgba(0,0,0,0.06)`
- :hover `bg-primary/90`; :focus ring brand-CD; :disabled opacity 50% (verify khi form invalid)

### Button "Huỷ bỏ" — Identical CREATE (Variant=Outline size=lg). Default bg white, border `#d4d4d8`, text foreground.

### Input "Tên nhóm VTHH" + "Mã nhóm VTHH"
- Default bg white border 1px `#d4d4d8` h=36 radius md padding 8 12 shadow sm — IDENTICAL CREATE
- Pre-filled value: text 14/regular foreground (KHÔNG muted-foreground vì có value)
- Required mark "*" red destructive
- **EDIT-specific**: "Mã nhóm VTHH" thường disabled / read-only trong EDIT mode (BR: code không edit được) → verify per FEAT AC. PNG render giống enabled state nhưng business rule typically immutable.

### Combobox "Thuộc nhóm" + Select "Trạng thái" — Identical CREATE variant/state.

### Textarea "Mô tả" — Identical CREATE. Pre-filled value rendered với màu muted-foreground (`#71717a`) trong PNG — verify trên implementation: nếu là value thực thì phải text-foreground (black); muted-foreground = placeholder. PNG hiển thị muted có thể là quirk render hoặc value-treated-as-placeholder, DEV theo BR (value-fill: black; placeholder: gray).

### Sub-tab "Nhóm vật tư hàng hóa" (active) — Identical CREATE/DETAIL: text brand-CD + 2px underline brand-CD.

---

## Text Content (verbatim)

### Page chrome
- H1: "Chỉnh sửa nhóm vật tư hàng hóa"
- Header buttons (right): "Huỷ bỏ" · "Lưu"
- BackArrow icon (no label)

### Section heading
- "Thông tin chung " (trailing space verbatim)

### Field labels + pre-filled values
- "Mã nhóm VTHH *" — value: "IP-BP-0001"
- "Tên nhóm VTHH *" — value: "Lọc dầu động cơ Toyota"
- "Thuộc nhóm" — value: "Nhóm vật tư hàng hoá"
- "Trạng thái" — value: "Đang hoạt động"
- "Mô tả" — value: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."

### Required asterisk
- 2 trường có "*": Mã nhóm VTHH · Tên nhóm VTHH

### Subtab + Navbar + Footer (shared chrome)
- Identical FEAT-CAT-GRP-CREATE — verbatim text:
  - Subtab: "Danh sách sản phẩm" · "Nhóm vật tư hàng hóa" · "Kỳ kế toán"
  - Navbar: "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục "
  - Footer: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng " · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Colors — identical FEAT-CAT-GRP-CREATE (cached vocab)
- `#0052ff` brand-CD (button "Lưu", subtab active, navbar "Danh mục" text)
- `#ffffff` background (page, navbar pill, button "Lưu" text)
- `#18181b` foreground (H1, label, input text)
- `#71717a` muted-foreground (subtab inactive, textarea placeholder, footer)
- `#e4e4e7` border (subtab nav bottom)
- `#d4d4d8` input border (Input/Select/Textarea/Cancel)
- `#f4f4f5` accent (hover state)
- `#dc2626` destructive (required asterisk "*")
- `#474847` Dark/3 (footer link)

### Typography — identical FEAT-CAT-GRP-CREATE
- `text 2x large/semibold` 24/32 weight 600 → H1
- `text large/semibold` 18/28 weight 600 → Section heading
- `text small/medium` 14/20 weight 500 → label, button text, navbar link
- `text small/leading-none/medium` 14/1 weight 500 → compact label
- `text small/regular` 14/20 weight 400 → input value, footer
- `font-light` 14/20 weight 300 → footer copyright

### Spacing — identical FEAT-CAT-GRP-CREATE
- Page container max-w 1280 padding-x 32 · gap 32 · header py 20
- FormGrid row 16 col 16 internal 8 · Button py 8 px 32 · Input py 8 px 12 gap 4 · Textarea py 8 px 12 min-h 60

### Border radius — identical CREATE
- `border-radius/md` = 6 → Button, Input, Select, Textarea, Navbar link
- `border-radius/lg` = 8 → Footer ghost button

### Shadow — identical CREATE
- `shadow/sm` → Input/Select/Textarea/Outline button
- `shadow/base` → Select dropdown
- Brand button: `drop-shadow [0 1 1.5 rgba(0,0,0,0.10), 0 1 1 rgba(0,0,0,0.06)]`

### Sizes — identical CREATE
- 16/20/36/40 (w-4/w-5/w-9/w-10) icon + control heights

---

## Notes (oracle interpretation, không phải fact để verify)

- EDIT layout = CREATE layout (cùng frame template). DEV typically reuse cùng form component, switch mode via prop (`mode: 'create' | 'edit'`).
- Differences vs CREATE:
  - H1: "Chỉnh sửa..." (vs "Thêm...")
  - Primary button label: "Lưu" (vs "Tạo")
  - Fields are pre-filled từ existing data
  - "Mã nhóm VTHH" thường read-only / disabled trong EDIT (immutable code per BR catalog)
- "Mô tả" value trong PNG render với màu muted-foreground (gray) → potentially Figma render quirk. Implementation phải distinguish: value = text-foreground (black), placeholder = text-muted-foreground (gray).
- Interaction states (:hover/:focus/:disabled) — verify shadcn baseline (cùng variant CREATE).
- Validation/error states không có trong PNG canonical — DEV theo Variant=Default+State=Error baseline shadcn cho Input/Select khi FEAT AC trigger.
- BR check: nếu BR cấm edit "Mã nhóm VTHH" → field render disabled (bg accent, opacity 50% hoặc bg muted/foreground muted) — không match PNG enabled-state render; DEV theo BR thay vì PNG.
