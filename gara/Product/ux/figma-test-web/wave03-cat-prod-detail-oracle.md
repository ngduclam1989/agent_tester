---
feat: FEAT-CAT-PROD-DETAIL
feat_file: Product/features/FEAT-CAT-PROD-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87538&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87538"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (5 top-level frame variants — Detail screen + Gắn SKU dialog + Thêm ĐVT quy đổi dialog)
  get_variable_defs: cached (tokens identical with wave03-cat-prod-create-oracle.md cache)
  get_design_context: skipped (PNG canonical sufficient — read-only view)
  get_screenshot: success (3 PNG: _full + detail-main + dialog-sku)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (5 frame variants captured)
  text_content: complete (verbatim from PNG)
  design_tokens: complete (cached)
  interaction_states: partial (Figma không render :hover/:focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-detail/_full.png
  - assets/wave03-cat-prod-detail/13492-57582-detail-main.png
  - assets/wave03-cat-prod-detail/14322-177796-detail-dialog-sku.png
---

# Oracle — FEAT-CAT-PROD-DETAIL (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14146:87538`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Chi tiết sản phẩm"** — view read-only của sản phẩm catalog
> + 2 dialog action overlay ("Gắn SKU cho IP-BP-0001" và "Thêm ĐVT quy đổi").

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Detail read-only (main canonical) | 13492:57582 | 1440×1124 | assets/wave03-cat-prod-detail/13492-57582-detail-main.png |
| Detail variant 2 (alt sub-state) | 14316:87589 | — | (xem _full.png cột 2) |
| Detail variant 3 (alt sub-state) | 14316:88132 | — | (xem _full.png cột 3) |
| Dialog "Gắn SKU cho IP-BP-0001" | 14322:177796 | 1440×900 | assets/wave03-cat-prod-detail/14322-177796-detail-dialog-sku.png |
| Dialog "Thêm ĐVT quy đổi" | 14322:178055 | 1440×900 | (xem _full.png cột 5) |

> **Note**: 3 frame "detail" đầu cùng layout, khác nhau ở tab active (ĐVT quy đổi | Mã SKU | Đính kèm file). Frame canonical hiển thị tab "ĐVT quy đổi" active.

---

## Component Inventory

### Screen: Detail main (13492:57582)

**Header chrome (shared)**
- Navbar × 1 — GMS logo + 7 menu items (Tổng quan · Mua hàng · Sửa chữa & Dịch vụ · Tồn kho · Khách hàng · Marketing · Nhân viên · **Danh mục** active) + notification bell + avatar
- Sub-tabs row × 1 — 3 tab: **Danh sách sản phẩm** (active brand-CD underline) · Nhóm vật tư hàng hóa · Kỳ kế toán

**Page header**
- BackArrow IconButton × 1 (chevron-left)
- H1 "Chi tiết sản phẩm" (text 2x-large/semibold 24px)
- StatusBadge × 1 — "Đang hoạt động" (success bg green-50, text green, radius full)
- Action button cluster (right): Button "Chỉnh sửa" (outline) + Button "Gắn SKU" (outline) + Button "Thêm ĐVT quy đổi" (outline)

**Section "Thông tin sản phẩm"** (sub-title text large/semibold 18px)
- Subtitle text × 1: "Hình ảnh"
- ImageDisplay × 1 (sample photo car, ~120×80px, radius md, read-only — KHÔNG có upload UI)
- ReadOnlyFieldGrid 4-column × 3 hàng + 1 hàng 4-col cuối
  - Row 1: 4 field — Mã sản phẩm nội bộ (`#IP-BP-0001` text link blue) · Tên sản phẩm (`Lọc dầu động cơ Toyota`) · Tính chất (`Vật tư hàng hoá`) · Nhóm vật tư/hàng hoá (`Phụ tùng bảo dưỡng`)
  - Row 2: 4 field — ĐVT chính (`Cái`) · Thương hiệu (`Toyota`) · Xuất xứ (`Nhật Bản`) · Phương pháp tính giá (`Bình quân cuối kỳ`)
  - Row 3: 4 field — Thông số kỹ thuật (`Đường kính 68mm, ren M20×1.5, chiều cao 75mm.`) · Quy cách sản phẩm (`Lọc dầu động cơ dùng cho Toyota Vios/Altis`) · Mô tả (`Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.`) · Ghi chú (`ĐVT chính không được sửa vì mã đã phát sinh giao dịch.`)

> **ReadOnly pattern**: mỗi field = stack (label `text-sm text-muted-foreground` text-base 14px · value `text-sm text-foreground` 14px). KHÔNG có input border, KHÔNG có placeholder, KHÔNG có icon dropdown.

**Tab navigation** (3 tab)
- Tab "ĐVT quy đổi" (ACTIVE — text brand-CD, underline 2px brand-CD)
- Tab "Mã SKU"
- Tab "Đính kèm file"

**Section "ĐVT quy đổi"** (active tab content)
- Table × 1 with header (text small/medium muted, bg gray-50)
  - Columns: STT · ĐVT · Tỷ lệ quy đổi · Thao tác (right-aligned, EMPTY trong view mode — column header có nhưng KHÔNG có icon edit/delete trên row)
- Table row × 5 (sample: ĐVT=Thùng, Tỷ lệ=12)
  - Per row: STT 1..5 · ĐVT Thùng · Tỷ lệ 12 · Thao tác cell rỗng (READ-ONLY mode)

**Audit footer (read-only metadata)**
- 4 columns x 1 row: Ngày tạo (`07/05/2026 09:55`) · Người tạo (`Nguyễn Văn Kho`) · Ngày sửa (`07/05/2026 09:55`) · Người sửa (`Nguyễn Văn Kho`)

**Footer (shared)**
- Text muted: "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Screen: Dialog "Gắn SKU cho IP-BP-0001" (14322:177796)

- Overlay scrim × 1 (bg overlay/90)
- Dialog box × 1 (centered, ~900px wide, radius lg, shadow lg, bg white, padding ~24px)
  - DialogHeader text × 1: "Gắn SKU cho IP-BP-0001" (text large/semibold, center-aligned)
  - SearchInput × 1: placeholder "Tìm theo SKU, tên SKU" (search icon leading)
  - Table × 1 (header bg gray-50): STT · Chọn (checkbox column) · SKU · Tên SKU · Trạng thái
  - Table row × 5: SKU sample `SKU-TOY-FO-01..05` + Status Badge
    - Row 1, 2, 5: Badge `Chưa mapping` (success bg green-50 text green)
    - Row 3, 4: Badge `Đã mapping mã khác` (danger bg red-50 text red)
    - Cell "Chọn": checkbox 16×16, default unchecked
  - DialogFooter Row × 1: Button "Huỷ" (outline) + Button "Gắn SKU" (primary brand-CD)

### Screen: Dialog "Thêm ĐVT quy đổi" (14322:178055)

- Overlay scrim × 1
- Dialog box × 1 (centered, ~480px wide, padding ~24px)
  - DialogHeader: "Thêm ĐVT quy đổi"
  - Form 2-column inline: Field "ĐVT quy đổi *" (Select) + Field "Tỷ lệ quy đổi *" (Input number)
  - DialogFooter: Button "Huỷ" (outline) + Button "Thêm" (primary brand-CD)

---

## Variant & State

### ReadOnlyField (Detail view pattern)
- Layout: vertical stack 2 row (label · value)
- Label: text small/regular muted (`#71717a`, 14px)
- Value: text small/regular foreground (`#18181b`, 14px); link value (Mã sản phẩm) = `text-link` blue `#1d4ed8`
- KHÔNG có border, KHÔNG có background, KHÔNG có padding ngoài label/value
- Width: full column (grid 4-col → each ~280px)

### StatusBadge "Đang hoạt động"
- Variant: success
- bg `bg-success-bg` (verify token, light green ~`#dcfce7` hoặc oklch tương đương)
- Text: text-success-foreground (green ~`#16a34a`)
- Border-radius: full · padding x=8 y=2 · font text-xs medium

### Button (outline — header actions)
- variant: outline · size: default (h-9 ≈ 36px)
- Default bg white text foreground border 1px `border-input` radius md
- Used: "Chỉnh sửa" · "Gắn SKU" · "Thêm ĐVT quy đổi"

### Tab navigation (3 tab cuối form)
- Inactive: text muted (`#71717a`)
- Active: text brand-CD (`#0052ff`) + underline 2px brand-CD
- Border-bottom container 1px `#e4e4e7`

### Table (ĐVT quy đổi — read-only)
- Header row: bg gray-50 (`#f4f4f5`), text small/medium muted
- Data row: bg white, border-bottom 1px `#e4e4e7`, height ~56px
- Cell "Thao tác": column header CÓ nhưng cell DATA rỗng (read-only mode — không có icon edit/trash)
- :hover row: bg gray-50 (verify shadcn baseline)

### Status Badge in SKU dialog
- "Chưa mapping" — success variant (bg light green, text green)
- "Đã mapping mã khác" — destructive variant (bg light red `#fee2e2`, text red `#dc2626`)
- Border-radius: full · padding x=8 y=2

### Checkbox (in SKU dialog row)
- Default: 16×16, border 1px `border-input`, bg white, unchecked
- :checked: bg brand-CD with white checkmark icon
- :disabled: opacity 50%

---

## Text Content (verbatim)

### Page chrome
- H1: "Chi tiết sản phẩm"
- Badge: "Đang hoạt động"
- Buttons (right): "Chỉnh sửa" · "Gắn SKU" · "Thêm ĐVT quy đổi"

### Section heading
- "Thông tin sản phẩm"
- Subtitle: "Hình ảnh"

### Field labels + values (read-only, Section Thông tin sản phẩm)
- "Mã sản phẩm nội bộ" → "#IP-BP-0001" (link blue)
- "Tên sản phẩm" → "Lọc dầu động cơ Toyota"
- "Tính chất" → "Vật tư hàng hóa"
- "Nhóm vật tư/hàng hóa" → "Phụ tùng bảo dưỡng"
- "ĐVT chính" → "Cái"
- "Thương hiệu" → "Toyota"
- "Xuất xứ" → "Nhật Bản"
- "Phương pháp tính giá" → "Bình quân cuối kỳ"
- "Thông số kỹ thuật" → "Đường kính 68mm, ren M20×1.5, chiều cao 75mm."
- "Quy cách sản phẩm" → "Lọc dầu động cơ dùng cho Toyota Vios/Altis"
- "Mô tả" → "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."
- "Ghi chú" → "ĐVT chính không được sửa vì mã đã phát sinh giao dịch."

### Tab nav
- "ĐVT quy đổi" (active) · "Mã SKU" · "Đính kèm file"

### Tab "ĐVT quy đổi" content
- Table headers: "STT" · "ĐVT" · "Tỷ lệ quy đổi" · "Thao tác"
- Sample rows: 1..5 / "Thùng" / "12"

### Audit footer
- "Ngày tạo" → "07/05/2026 09:55"
- "Người tạo" → "Nguyễn Văn Kho"
- "Ngày sửa" → "07/05/2026 09:55"
- "Người sửa" → "Nguyễn Văn Kho"

### Dialog "Gắn SKU cho IP-BP-0001"
- Header: "Gắn SKU cho IP-BP-0001"
- Search placeholder: "Tìm theo SKU, tên SKU"
- Headers: "STT" · "Chọn" · "SKU" · "Tên SKU" · "Trạng thái"
- Rows: 5x "SKU-TOY-FO-01" / "Lọc dầu Toyota chính hãng" + Badge
- Badges: "Chưa mapping" · "Đã mapping mã khác"
- Buttons: "Huỷ" · "Gắn SKU"

### Dialog "Thêm ĐVT quy đổi"
- Header: "Thêm ĐVT quy đổi"
- Field labels: "ĐVT quy đổi *" · "Tỷ lệ quy đổi *"
- Sample value: "Thùng" + "12"
- Buttons: "Huỷ" · "Thêm"

### Footer (shared chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0"
- "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

> **Tokens identical with wave03-cat-prod-create-oracle.md cache** (cùng file_key). Bổ sung token DETAIL-specific:

### Colors (mới so với CREATE)
- `#dcfce7` / `#16a34a` (success bg/text — Badge "Đang hoạt động", "Chưa mapping") → `bg-success-bg` / `text-success-foreground`
- `#fee2e2` / `#dc2626` (destructive bg/text — Badge "Đã mapping mã khác") → `bg-destructive-bg` / `text-destructive`

### Typography
- Audit footer label: `text-extra-small/regular` (12px) muted
- Audit footer value: `text-small/regular` (14px) foreground

### Spacing
- ReadOnlyField label→value gap: ~4px (verify)
- Field grid 4-col gap: ~24px col, ~16px row
- Section gap: ~32px

### Border radius
- Badge: `radius/full` = 9999
- Table border: `radius/md` = 6 (verify nếu Card wrap)

### Sizes
- Badge height: ~24px (auto từ padding y=2 + text 14)
- Image display: ~120×80px (read-only thumbnail)

---

## Notes (oracle interpretation, không phải fact để verify)

- Detail là view **READ-ONLY** của sản phẩm catalog — KHÔNG có input border, KHÔNG có upload UI, KHÔNG có icon edit trong cell Thao tác của Table ĐVT.
- 3 button header action ("Chỉnh sửa", "Gắn SKU", "Thêm ĐVT quy đổi") = entry point sang 3 flow:
  - "Chỉnh sửa" → route sang màn EDIT (FEAT-CAT-PROD-EDIT, oracle `wave03-cat-prod-edit-oracle.md`)
  - "Gắn SKU" → open dialog 14322:177796 inline
  - "Thêm ĐVT quy đổi" → open dialog 14322:178055 inline
- Badge "Đang hoạt động" reflect field `Trạng thái` từ CREATE → có variant "Ngừng hoạt động" (destructive) — KHÔNG capture trong frame canonical này; verify từ LIST oracle (có badge "Ngừng hoạt động" cam/đỏ).
- Audit footer (Ngày tạo / Người tạo / Ngày sửa / Người sửa) = system metadata read-only — DEV inject từ backend response (`createdAt`, `createdBy`, `updatedAt`, `updatedBy`).
- Field "Ghi chú" = "ĐVT chính không được sửa vì mã đã phát sinh giao dịch" — đây là TEXT CONTENT thực tế của ghi chú, KHÔNG phải UI hint/tooltip; là note nghiệp vụ persistent trong DB. DEV inject động.
- 3 tab cuối ("ĐVT quy đổi" / "Mã SKU" / "Đính kèm file") = mirror cấu trúc EDIT/CREATE, nhưng nội dung READ-ONLY (Table ĐVT không có icon thao tác per-row).
- Sample data "Lọc dầu động cơ Toyota", "IP-BP-0001", "Nguyễn Văn Kho", "07/05/2026 09:55" = mock — DEV inject động từ backend.
- Dialog "Gắn SKU" cho phép multi-select (checkbox column "Chọn") + filter status "Đã mapping mã khác" cho biết SKU đã gán product khác (verify behavior: disabled? warning? — cross-check FEAT AC).
- Interaction states (`:hover`, `:focus`) Figma không render → theo shadcn baseline.
