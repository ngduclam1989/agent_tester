---
feat: FEAT-CAT-PROD-CREATE
feat_file: Product/features/FEAT-CAT-PROD-CREATE.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87151&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87151"
fetched_at: 2026-06-29T03:00:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (5 top-level frames discovered)
  get_variable_defs: success
  get_design_context: success (frame 13485:224077 — primary canonical)
  get_screenshot: success (3 PNG: _full + main + cancel-dialog)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (5 frame variants captured)
  text_content: complete (verbatim from design_context)
  design_tokens: complete (variable_defs)
  interaction_states: partial (Figma không render :hover/:focus; verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-create/_full.png
  - assets/wave03-cat-prod-create/13485-224077-main.png
  - assets/wave03-cat-prod-create/13492-61124-cancel-dialog.png
---

# Oracle — FEAT-CAT-PROD-CREATE (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14146:87151`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Thêm sản phẩm"** — form 1-bước tạo sản phẩm catalog
> với 3 tab cuối (ĐVT quy đổi · Mã SKU · Đính kèm file) + dialog confirm hủy.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Default — form rỗng (tab Mã SKU active) | 13485:224077 | 1440×1178 | assets/wave03-cat-prod-create/13485-224077-main.png |
| Form scrolled (tab ĐVT quy đổi/khác active) | 14322:173797 | 1440×1260 | (xem _full.png cột 2) |
| Default duplicate / sub-state | 13492:60547 | 1440×1178 | (xem _full.png cột 3) |
| Cancel confirm dialog overlay | 13492:61124 | 1440×900 | assets/wave03-cat-prod-create/13492-61124-cancel-dialog.png |
| Cancel confirm dialog overlay (variant) | 14322:173501 | 1440×900 | (xem _full.png cột 5) |

---

## Component Inventory

### Screen: Default form (13485:224077)

**Header chrome (shared)**
- Navbar (top) × 1 — instance shared: GMS logo + 7 menu items (Tổng quan · Mua hàng · Sửa chữa & Dịch vụ · Tồn kho · Khách hàng · Marketing · Nhân viên · **Danh mục** active) + notification bell + avatar
- Sub-tabs row × 1 — 3 tab: **Danh sách sản phẩm** (active, brand-CD underline) · Nhóm vật tư hàng hóa · Kỳ kế toán

**Page header**
- BackArrow IconButton × 1 (chevron-left)
- H1 "Thêm sản phẩm" (text 2x-large/semibold 24px)
- Action buttons (right cluster): Button "Huỷ bỏ" (secondary outline) + Button "Tạo" (primary brand-CD, white text)

**Section "Thông tin chung"** (sub-title text large/semibold 18px)
- ImageUpload card × 1 (Ảnh sản phẩm, 252×252) — placeholder DashedBorder + Icon upload + 2-line text
- FormGrid 3-column × 4 hàng input + 1 hàng textarea (2-col)
  - Row 1: Input "Mã sản phẩm nội bộ *" · Input "Tên sản phẩm *" · Select "Tính chất" (chevron-down)
  - Row 2: Select "Nhóm vật tư/hàng hóa" · Select "ĐVT chính *" · Select "Trạng thái"
  - Row 3: Input "Thương hiệu" · Input "Xuất xứ" · Select "Phương pháp tính giá"
  - Row 4: Input "Thông số kỹ thuật" (full row col1+col2) · Input "Quy cách sản phẩm" (col3)
  - Row 5: Textarea "Mô tả" (col1+col2, ~80px height) · Textarea "Ghi chú" (col3, ~80px)

**Tab navigation cuối form** (3 tab)
- Tab "ĐVT quy đổi"
- Tab "Mã SKU" (active — text brand-CD, underline 2px brand-CD)
- Tab "Đính kèm file"

**Section "Mã SKU"** (active tab content)
- Button "Gắn SKU" × 1 (secondary outline)
- Table × 1 with header (text small/medium muted, bg gray-50)
  - Columns: STT · SKU · Tên SKU · Thao tác (right-aligned)
- Table row × 5 (sample data SKU-TOY-FO-01..05, "Lọc dầu Toyota …")
  - Per row: cell text + Icon button (trash, 16×16) ở cột Thao tác

**Footer (shared)**
- Text muted: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Screen: Cancel confirm dialog (13492:61124)
- Overlay scrim (bg overlay/90 = #0000001A)
- Dialog box × 1 (centered, ~400px wide, rounded-lg, shadow-lg, bg white)
  - DialogHeader: title text large/semibold
  - DialogBody: description text small/regular
  - DialogFooter: 2 buttons (cancel secondary + confirm destructive)

---

## Variant & State

### Button (primary brand-CD)
- Default bg #0052ff text white border-radius md (6px) padding y=spacing/2 (8px) x=spacing/4 (16px)
- :hover bg darker (verify shadcn baseline) · :disabled opacity 50%
- Used: "Tạo" header action

### Button (secondary outline)
- Default bg transparent text foreground border 1px #d4d4d8 (base/input)
- Used: "Huỷ bỏ" · "Gắn SKU"

### Select (chevron-down)
- Default bg white border 1px #d4d4d8 radius md height ~36px
- ChevronDown icon (16×16 muted) ở right padding 12px
- Used: Tính chất · Nhóm vật tư/hàng hóa · ĐVT chính · Trạng thái · Phương pháp tính giá

### Input (text)
- Default bg white border 1px #d4d4d8 radius md padding 8px 12px height ~36px font small
- Required mark "*" sau label (text foreground-error #dc2626)

### Tab navigation (ĐVT quy đổi · Mã SKU · Đính kèm file)
- Inactive: text muted (foreground-muted #71717a)
- Active: text brand-CD #0052ff + underline 2px brand-CD
- Border-bottom container 1px #e4e4e7

### ImageUpload card
- Dashed border 2px (base/input) radius md
- Icon upload (cloud-arrow-up 24×24 brand-CD background-process #eff6ff circle)
- Text: "Kéo thả hoặc {Nhấn để tải lên}" — "Nhấn để tải lên" là Link (text foreground-link #1d4ed8 underline)
- Sub-text: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" (text extra-small/regular muted)

### Table row
- Default bg white · :hover bg #f9fafb (gray-50, verify shadcn)
- Border-bottom 1px #e4e4e7

### Required field mark
- "*" sau label name = text foreground-error #dc2626

---

## Text Content (verbatim)

### Page chrome
- H1: "Thêm sản phẩm"
- Buttons (header right): "Huỷ bỏ" · "Tạo"
- Back arrow icon (no label)

### Section heading
- "Thông tin chung" (text large/semibold)

### Field labels (Section Thông tin chung)
- "Ảnh sản phẩm" (image upload header)
- "Kéo thả hoặc " + "Nhấn để tải lên" (link)
- "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"
- "Mã sản phẩm nội bộ *"  — placeholder/sample: "IP-BP-0001"
- "Tên sản phẩm *"  — sample: "Lọc dầu động cơ Toyota"
- "Tính chất" — value: "Nhóm vật tư hàng hoá"
- "Nhóm vật tư/hàng hóa" — value: "Phụ tùng bảo dưỡng"
- "ĐVT chính *" — value: "Cái"
- "Trạng thái" — value: "Đang hoạt động"
- "Thương hiệu" — value: "Toyota"
- "Xuất xứ" — value: "Nhật Bản"
- "Phương pháp tính giá" — value: "Bình quân cuối kỳ"
- "Thông số kỹ thuật" — sample: "Đường kính 68mm, ren M20x1.5, chiều cao 75mm."
- "Quy cách sản phẩm" — sample: "Lọc dầu động cơ dùng cho Toyota Vios/Altis"
- "Mô tả" — sample: "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."
- "Ghi chú" — placeholder: "Nhập ghi chú"

### Tab nav cuối form
- "ĐVT quy đổi" · "Mã SKU" · "Đính kèm file"

### Tab "Mã SKU" content
- Button: "Gắn SKU"
- Table headers: "STT" · "SKU" · "Tên SKU" · "Thao tác"
- Sample rows:
  - 1 / "SKU-TOY-FO-01" / "Lọc dầu Toyota chính hãng"
  - 2 / "SKU-TOY-FO-02" / "Lọc dầu Toyota Hilux / Fortuner"
  - 3 / "SKU-TOY-FO-03" / "Lọc dầu Toyota Vios / Yaris"
  - 4 / "SKU-TOY-FO-04" / "Lọc dầu Toyota Camry / Corolla Altis"
  - 5 / "SKU-TOY-FO-05" / "Lọc dầu Toyota Innova"

### Footer (shared chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0"
- "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Required asterisk
- 3 trường có "*": Mã sản phẩm nội bộ · Tên sản phẩm · ĐVT chính

---

## Design Tokens

### Colors
- `#0052ff` (base/background-brand-CD, base/foreground-brand-CD, base/border-brand-CD) → tailwind `bg-brand-cd` / `text-brand-cd` / `border-brand-cd`
- `#ffffff` (base/background, base/primary-foreground) → `bg-white` / `text-white`
- `#18181b` (base/foreground, base/primary, base/secondary-foreground) → `text-foreground`
- `#71717a` (base/muted-foreground) → `text-muted-foreground`
- `#e4e4e7` (base/border) → `border-border`
- `#d4d4d8` (base/input) → `border-input`
- `#f4f4f5` (base/accent, base/secondary) → `bg-accent` / `bg-secondary`
- `#dc2626` (base/foreground-error) → `text-destructive` (required asterisk)
- `#ef4444` (base/background-error-reverse) → `bg-destructive` (verify)
- `#eff6ff` (base/background-process) → `bg-info-bg` (upload icon circle)
- `#1d4ed8` (base/foreground-link) → `text-link` (Nhấn để tải lên link)
- `#0000001a` (overlay/90) → `bg-black/10` (dialog scrim)

### Typography (Inter font family)
- `text-2x-large/semibold` → 24px/32px weight 600 → `text-2xl font-semibold` (H1 "Thêm sản phẩm")
- `text-large/semibold` → 18px/28px weight 600 → `text-lg font-semibold` (Section "Thông tin chung")
- `text-base/semibold` → 16px/24px weight 600 → `text-base font-semibold`
- `text-small/medium` → 14px/20px weight 500 → `text-sm font-medium` (field labels · button text)
- `text-small/regular` → 14px/20px weight 400 → `text-sm` (input value · table cell)
- `text-extra-small/regular` → 12px/16px weight 400 → `text-xs` (placeholder · footer · upload hint)

### Spacing
- `spacing/1` = 4 · `spacing/1-5` = 6 · `spacing/2` = 8 · `spacing/2-5` = 10 · `spacing/3` = 12 · `spacing/4` = 16 · `spacing/5` = 20 · `spacing/6` = 24 · `spacing/8` = 32 · `spacing/12` = 48
- Page container padding x = 80px (left/right) → cách edge viewport
- Section padding container = 32px (verify)
- FormGrid gap row = 16-24px, gap col = 24px (3-col layout)
- Button padding y = 8 (spacing/2) x = 16 (spacing/4)

### Border radius
- `radius/md` = 6 → Input/Select/Button default
- `radius/lg` = 8 → Dialog box
- `radius/default` = 4 → Tag/Badge
- `radius/full` = 9999 → Avatar / IconButton circle

### Shadow
- `shadow/sm` = drop-shadow 0 1 2 0 (rgba 0/0/0/0.05) → subtle (verify card use)
- `shadow/base` = drop-shadow stack → Card / Select dropdown
- `shadow/lg` = drop-shadow stack → Dialog box (cancel confirm)

### Sizes
- `width/w-4` = `height/h-4` = 16 → small icon (chevron-down, trash)
- `width/w-5` = `height/h-5` = 20 → medium icon
- `width/w-9` = `height/h-9` = 36 → Input/Select height (verify)
- `width/w-10` = `height/h-10` = 40 → Avatar / large icon button

### Effects
- Dialog box: shadow/lg + radius/lg + bg white + padding spacing/6 (24px)
- Dialog scrim: overlay/90 (#0000001A) full viewport

---

## Notes (oracle interpretation, không phải fact để verify)

- 5 frame variants trong section đại diện 5 STATE chứ không phải 5 màn khác nhau (cùng URL/route): default · scrolled · dialog confirm cancel · etc.
- Sample data trong Figma (IP-BP-0001, Toyota, SKU-TOY-FO-01..05) là **mock**, không phải required default — DEV xử lý theo FEAT AC.
- Required mark "*" CHỈ 3 trường (Mã sản phẩm nội bộ · Tên sản phẩm · ĐVT chính) — các trường khác optional theo Figma; cross-check FEAT AC.
- Tab "ĐVT quy đổi" + "Đính kèm file" content chưa fetch sâu (chỉ tab "Mã SKU" active trong canonical frame) — verify content trong variant frame 14322:173797 nếu Test cần.
- Interaction states (:hover, :focus, :active) Figma không render → DEV theo shadcn/ui baseline + radius md.
