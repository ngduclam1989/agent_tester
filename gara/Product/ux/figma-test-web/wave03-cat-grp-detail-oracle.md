---
feat: FEAT-CAT-GRP-DETAIL
feat_file: Product/features/FEAT-CAT-GRP-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14423-88838&t=g9GrqfVRsuvDYwl3-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14423:88838"
fetched_at: 2026-06-29T03:05:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (1 top-level frame 13501:137145)
  get_variable_defs: cached (identical token vocab cross wave 03 FEATs)
  get_design_context: success (frame 13501:137145 — full page tree)
  get_screenshot: success (2 PNG: _full + main frame)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete (verbatim from design_context)
  design_tokens: complete (variable_defs cached)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-grp-detail/_full.png
  - assets/wave03-cat-grp-detail/13501-137145-main.png
---

# Oracle — FEAT-CAT-GRP-DETAIL (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14423:88838`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Chi tiết nhóm vật tư hàng hóa"** — read-only view
> hiển thị 8 info cell (4 thông tin nghiệp vụ + 4 audit metadata) với badge trạng thái xanh
> và 1 nút "Chỉnh sửa" navigate sang FEAT-CAT-GRP-EDIT.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Default — read-only chi tiết (canonical) | 13501:137145 | 1440×1024 | assets/wave03-cat-grp-detail/13501-137145-main.png |

> Section chỉ chứa 1 frame canonical. Sample data nhóm "Lọc dầu động cơ Toyota" (#IP-BP-0001).

---

## Component Inventory

### Screen: Detail read-only (13501:137145)

**Header chrome (shared)** — Navbar + Sub-tabs (active "Nhóm vật tư hàng hóa"). Identical CREATE/EDIT.

**Page header (`Page Header / 3`, height 80)**
- BackArrow IconButton × 1 (Ghost size=icon 40×40, icon `vuesax/linear/arrow-left` 20×20)
- H1 "Chi tiết nhóm vật tư hàng hóa" (text 2x-large/semibold 24/32)
- Badge × 1 (inline sau H1, vertical-aligned center):
  - Variant=Success State=Default
  - Bg `#f0fdf4` (base/background-success) text `#16a34a` (foreground-success)
  - Padding y=2 (spacing/0-5) x=10 (spacing/2-5), radius lg (8), gap 6
  - Text "Đang hoạt động" 14/medium
- Action cluster (right):
  - Button "Chỉnh sửa" × 1 (Variant=Outline size=lg, h=40, px=32 py=8)
    - Leading icon `vuesax/linear/edit` 16×16
    - Text "Chỉnh sửa" 14/medium foreground

**Section "Thông tin chung"** (title text 18px/28 weight 600, padding-bottom 16)

**Info Grid Content × 2 hàng** (gap 16 row, 4 col × 4 col equal-width, mỗi cell h=48)

- Row 1 — Info nghiệp vụ:
  - Cell 1: "Mã nhóm VTHH" (label muted) / **"#IP-BP-0001"** (value 14/medium **brand-CD `#0052ff`** — clickable link / chip)
  - Cell 2: "Tên nhóm VTHH" (label muted) / "Lọc dầu động cơ Toyota" (value 14/medium foreground-black)
  - Cell 3: "Thuộc nhóm " (trailing space) (label muted) / "Vật tư hàng hóa" (value)
  - Cell 4: "Nhóm vật tư/hàng hóa" (label muted) / "Phụ tùng bảo dưỡng" (value)

- Row 2 — Audit metadata:
  - Cell 5: "Ngày tạo" (label muted) / "07/05/2026 09:55" (value 14/medium)
  - Cell 6: "Người tạo" (label muted) / "Nguyễn Văn Kho" (value)
  - Cell 7: "Ngày sửa" (label muted) / "07/05/2026 09:55" (value)
  - Cell 8: "Người sửa" (label muted) / "Nguyễn Văn Kho" (value)

**Footer (shared)** — Identical CREATE/EDIT footer.

---

## Variant & State

### Badge "Đang hoạt động" (Variant=Success)
- Bg `#f0fdf4` (base/background-success) — pale green
- Text `#16a34a` (base/foreground-success) — dark green
- Padding y=2 x=10, radius lg (8 → soft-pill rounded, NOT fully rounded `rounded-full`)
- Font: text small/medium 14/20 weight 500
- Variant inactive (NOT shown in PNG): assume `bg-muted` + `text-muted-foreground` (verify shadcn Badge secondary)

### Button "Chỉnh sửa" (Variant=Outline size=lg) — same outline button như CREATE/EDIT "Huỷ bỏ", + leading icon `vuesax/linear/edit` 16×16
- Default bg white, border 1px `#d4d4d8`, drop-shadow `0 1 1 rgba(0,0,0,0.05)`
- :hover bg accent; :focus ring brand-CD; :disabled opacity 50%

### Button "BackArrow" (Ghost icon 40×40) — Identical CREATE/EDIT.

### Info cell (label + value pattern)
- Container: flex-col, gap 8 (spacing/2), w=flex-1 (4 cells distribute equally trong row, width ~298 mỗi cell)
- Label: text 14/regular muted-foreground `#71717a`
- Value: text 14/medium foreground-black `#18181b` (default) HOẶC brand-CD `#0052ff` (riêng cell "Mã nhóm VTHH" — render as clickable link with leading "#")

### Mã nhóm VTHH value "#IP-BP-0001" — special variant
- Text color brand-CD `#0052ff` (NOT foreground-black)
- Font 14/medium
- Leading "#" character (phần của text, không phải icon)
- Possibly clickable link → navigates to system reference (verify FEAT AC)

### Sub-tab active "Nhóm vật tư hàng hóa" — Identical CREATE/EDIT.

---

## Text Content (verbatim)

### Page chrome
- H1: "Chi tiết nhóm vật tư hàng hóa"
- Badge (inline H1): "Đang hoạt động"
- Header action button: "Chỉnh sửa" (với edit icon 16×16 leading)
- BackArrow icon (no label)

### Section heading
- "Thông tin chung " (trailing space verbatim)

### Info row 1 (nghiệp vụ)
- "Mã nhóm VTHH" — value: "#IP-BP-0001" (brand-CD color, clickable)
- "Tên nhóm VTHH" — value: "Lọc dầu động cơ Toyota"
- "Thuộc nhóm " — value: "Vật tư hàng hóa" (note: "hóa" — vs CREATE/EDIT sample "hoá")
- "Nhóm vật tư/hàng hóa" — value: "Phụ tùng bảo dưỡng"

### Info row 2 (audit)
- "Ngày tạo" — value: "07/05/2026 09:55"
- "Người tạo" — value: "Nguyễn Văn Kho"
- "Ngày sửa" — value: "07/05/2026 09:55"
- "Người sửa" — value: "Nguyễn Văn Kho"

### Subtab + Navbar + Footer (shared chrome)
- Identical FEAT-CAT-GRP-CREATE — verbatim text:
  - Subtab: "Danh sách sản phẩm" · "Nhóm vật tư hàng hóa" · "Kỳ kế toán"
  - Navbar: "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục "
  - Footer: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng " · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Colors
- `#0052ff` brand-CD → text-brand-cd (cell "Mã nhóm VTHH" value "#IP-BP-0001", subtab active, navbar "Danh mục")
- `#ffffff` background → page bg, navbar "Danh mục" pill bg, button "Chỉnh sửa" bg
- `#18181b` foreground → H1, info value text (cell 2-8)
- `#71717a` muted-foreground → all info labels, subtab inactive, footer
- `#e4e4e7` border → subtab nav border
- `#d4d4d8` input → outline button border
- `#f0fdf4` base/background-success → Badge bg
- `#16a34a` base/foreground-success → Badge text
- `#474847` Dark/3 → footer link text

### Typography (Inter font-sans)
- `text 2x large/semibold` 24/32 weight 600 → H1 "Chi tiết nhóm vật tư hàng hóa"
- `text large/semibold` 18/28 weight 600 → Section "Thông tin chung "
- `text small/medium` 14/20 weight 500 → Badge text, button text, info value, navbar link
- `text small/regular` 14/20 weight 400 → info label, footer
- `font-light` 14/20 weight 300 → footer copyright

### Spacing
- Page container max-w 1280 padding-x 32 (spacing/8)
- Page content gap 32
- Page header padding-y 20 (spacing/5)
- Section title padding-bottom 16 (spacing/4)
- Info Wrap gap-y 16 (Content blocks) gap-col 8 (cell horizontal spacing)
- Info cell internal gap 8 (label-value)
- Cell width 298 mỗi cell (4 cell trong row 1216, gap 8 → 4×298 + 3×8 = 1216) — verify
- Header right cluster gap 8
- Badge padding y=2 (spacing/0-5) x=10 (spacing/2-5), gap 6 (spacing/1-5)
- Button padding y=8 x=32 (size=lg), gap 8 (icon-text)

### Border radius
- `border-radius/md` = 6 → Button outline
- `border-radius/lg` = 8 → Badge soft-pill
- `border-radius/md` = 6 → Navbar link, Subtab link

### Shadow
- `shadow/sm` → Outline button "Chỉnh sửa"

### Sizes
- `width/w-4` = `height/h-4` = 16 → edit icon (button "Chỉnh sửa" leading)
- `width/w-5` = `height/h-5` = 20 → arrow-left (back button)
- `width/w-10` = `height/h-10` = 40 → Avatar, BackArrow button, "Chỉnh sửa" button height
- Info cell height 48 (row 1) / 70 (row "Tạo phiếu" — vì Frame 1948757373 wrap value 2 line) — DEV verify trên implementation, KHÔNG fix cứng

### Effects
- Badge: soft-pill (radius lg) + 2 màu success token (bg pale + text dark)
- "#IP-BP-0001" value: prefix `#` literal trong text + color brand-CD → suggests link/identifier styled as chip

---

## Notes (oracle interpretation, không phải fact để verify)

- DETAIL = read-only view, KHÔNG có Input / Select / Textarea — chỉ label + value pattern.
- Layout 4-col × 2-row info grid identical pattern with FEAT-CAT-PROD-DETAIL (cùng template "Page Header / 3" + Section "Thông tin chung" + Info Wrap).
- "Mã nhóm VTHH" value rendered with `#` prefix + brand-CD color → có thể là clickable link cho referenced master data (verify AC). DEV render as `<a class="text-brand-cd">#IP-BP-0001</a>` hoặc styled span with same visual.
- Badge "Đang hoạt động" inline với H1 (cùng container `Header Tittle`) — vertical-align center, gap 8 — DEV layout `flex items-center gap-2` cho H1 + badge.
- Inactive variant Badge "Ngừng hoạt động" KHÔNG có trong PNG canonical → assume bg-muted/text-muted-foreground (verify shadcn Badge secondary) hoặc red destructive nếu BR yêu cầu visual distinction.
- Action button cluster CHỈ có 1 nút "Chỉnh sửa" — KHÔNG có "Xóa" (DELETE action triggered từ LIST screen row action, không trên DETAIL). Verify AC.
- 8 info cell label text MUST verbatim Vietnamese (đặc biệt "Thuộc nhóm " trailing space, "Nhóm vật tư/hàng hóa" có slash) — agent-test-ui verify exact text.
- Date format "07/05/2026 09:55" = dd/MM/yyyy HH:mm — DEV verify format helper.
- Audit fields ("Ngày tạo / sửa", "Người tạo / sửa") same date/người → record vừa được tạo (chưa edit). Khi edit → "Ngày sửa" + "Người sửa" sẽ khác.
- Interaction states (:hover/:focus) — outline button shadcn baseline.
