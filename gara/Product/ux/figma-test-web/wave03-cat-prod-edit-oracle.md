---
feat: FEAT-CAT-PROD-EDIT
feat_file: Product/features/FEAT-CAT-PROD-EDIT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87153&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87153"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: partial (output-too-large, saved to persisted file — extracted top-level frame IDs only)
  get_variable_defs: cached (tokens identical with wave03-cat-prod-create-oracle.md cache)
  get_design_context: skipped (PNG canonical + CREATE oracle reuse-able for shared form structure)
  get_screenshot: success (2 PNG: _full + edit-main)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (3 frame variants captured)
  text_content: complete (verbatim from PNG)
  design_tokens: complete (cached)
  interaction_states: partial (Figma không render :hover/:focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-edit/_full.png
  - assets/wave03-cat-prod-edit/13489-260701-edit-main.png
---

# Oracle — FEAT-CAT-PROD-EDIT (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14146:87153`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Sửa sản phẩm"** — form chỉnh sửa sản phẩm catalog.
> Layout giống CREATE 100% nhưng (a) tiêu đề "Sửa sản phẩm" thay vì "Thêm sản phẩm",
> (b) button "Lưu" thay vì "Tạo", (c) form prefilled data, (d) tab "ĐVT quy đổi" active default
> (có button "Thêm ĐVT quy đổi" + Table 5 row có icon edit/trash trong cột Thao tác),
> (e) field "ĐVT chính" **DISABLED** với hint "Mã đã phát sinh giao dịch, không sửa được".

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Edit main — tab "ĐVT quy đổi" active (canonical) | 13489:260701 | 1440×1178 | assets/wave03-cat-prod-edit/13489-260701-edit-main.png |
| Edit variant 2 (alt tab/sub-state) | — | 1440×1178 | (xem _full.png cột 2) |
| Edit variant 3 (alt tab/sub-state) | — | 1440×1178 | (xem _full.png cột 3) |

> **Note**: Metadata trả "output-too-large" (111KB) — chỉ extract top-level. 3 frame variant cùng layout, khác tab active hoặc sub-section state.

---

## Component Inventory

### Screen: Edit main (13489:260701)

**Header chrome (shared — identical với CREATE/DETAIL)**
- Navbar × 1 + Sub-tabs row × 1 (Danh sách sản phẩm active)

**Page header**
- BackArrow IconButton × 1 (chevron-left)
- H1 "Sửa sản phẩm" (text 2x-large/semibold 24px)
- Action button cluster (right): Button "Huỷ bỏ" (secondary outline) + Button "Lưu" (primary brand-CD, white text)

**Section "Thông tin chung"** (sub-title text large/semibold 18px)
- ImageUpload card × 1 (Ảnh sản phẩm, 252×252) — placeholder DashedBorder + Icon upload + 2-line text "Kéo thả hoặc Nhấn để tải lên" + "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"
  - Variant: empty placeholder (DEV: edit mode có thể prefill existing image — verify state khi có ảnh)
- FormGrid 3-column × 4 hàng input + 1 hàng textarea (2-col)
  - Row 1: Input "Mã sản phẩm nội bộ *" (prefilled `IP-BP-0001`) · Input "Tên sản phẩm *" (prefilled `Lọc dầu động cơ Toyota`) · Select "Tính chất" (prefilled `Nhóm vật tư hàng hoá`)
  - Row 2: Select "Nhóm vật tư/hàng hóa" (prefilled `Phụ tùng bảo dưỡng`) · Select "ĐVT chính *" (prefilled `Cái`, **DISABLED + hint text dưới: "Mã đã phát sinh giao dịch, không sửa được"**) · Select "Trạng thái" (prefilled `Đang hoạt động`)
  - Row 3: Input "Thương hiệu" (prefilled `Toyota`) · Input "Xuất xứ" (prefilled `Nhật Bản`) · Select "Phương pháp tính giá" (prefilled `Bình quân cuối kỳ`, **DISABLED + same hint underneath**)
  - Row 4: Input "Thông số kỹ thuật" (full row col1+col2, prefilled `Đường kính 68mm, ren M20×1.5, chiều cao 75mm.`) · Input "Quy cách sản phẩm" (col3, prefilled `Lọc dầu động cơ dùng cho Toyota Vios/Altis`)
  - Row 5: Textarea "Mô tả" (col1+col2, prefilled `Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ.`) · Textarea "Ghi chú" (col3, placeholder `Nhập ghi chú`)

**Tab navigation cuối form** (3 tab — KHÁC CREATE: tab "ĐVT quy đổi" active default)
- Tab "ĐVT quy đổi" (ACTIVE — text brand-CD, underline 2px brand-CD)
- Tab "Mã SKU"
- Tab "Đính kèm file"

**Section "ĐVT quy đổi"** (active tab content — KHÁC CREATE)
- Button "Thêm DVT quy đổi" × 1 (secondary outline) — note: capitalization "DVT" trong Figma có thể typo của "ĐVT"
- Table × 1 with header (text small/medium muted, bg gray-50)
  - Columns: STT · ĐVT · Tỷ lệ quy đổi · Thao tác (right-aligned)
- Table row × 5 (sample: ĐVT=Thùng, Tỷ lệ=12)
  - Per row: cells + 2 icon button trong cột Thao tác (Edit pencil 16×16 + Trash 16×16)

**Footer (shared)** — identical chrome

---

## Variant & State

### Button (primary brand-CD) — "Lưu"
- Default bg `#0052ff` text white border-radius md padding y=8 x=16
- :hover bg darker (verify shadcn baseline) · :disabled opacity 50%
- KHÁC CREATE: label "Lưu" thay vì "Tạo"

### Button (secondary outline) — "Huỷ bỏ" / "Thêm DVT quy đổi"
- Default bg transparent text foreground border 1px `#d4d4d8`

### Select DISABLED state
- bg `bg-muted` light gray (verify token `bg-gray-50` ≈ `#f4f4f5`)
- text muted (`#71717a`)
- cursor not-allowed (verify shadcn baseline)
- ChevronDown icon vẫn render (verify nếu muted hoặc hidden)
- Hint text dưới field: `text-extra-small/regular` (12px) `text-muted-foreground` "Mã đã phát sinh giao dịch, không sửa được"

### Input (text) — prefilled
- Default bg white border 1px `#d4d4d8` radius md padding 8px 12px height ~36px
- Value: prefilled foreground color (`#18181b`), không phải placeholder muted
- Required mark "*" sau label = `text-foreground-error` (`#dc2626`)

### Tab navigation
- Inactive: text muted · Active: text brand-CD + underline 2px brand-CD

### Table row (Edit mode — KHÁC Detail)
- bg white · :hover bg `#f9fafb` (verify shadcn)
- Border-bottom 1px `#e4e4e7`
- Cell "Thao tác": 2 icon button (Edit pencil + Trash, 16×16, color muted, gap ~8px, right-aligned)

### Image upload card (placeholder)
- Dashed border 2px (`border-input`) radius md
- Icon upload (cloud-arrow-up 24×24 brand-CD bg light blue circle 40×40)
- Text: "Kéo thả hoặc {Nhấn để tải lên}" — link "Nhấn để tải lên" `text-link` underline
- Sub-text: `text-extra-small/regular` muted

---

## Text Content (verbatim)

### Page chrome
- H1: "Sửa sản phẩm"
- Buttons (header right): "Huỷ bỏ" · "Lưu"
- Back arrow icon (no label)

### Section heading
- "Thông tin chung"

### Field labels + prefilled values (Section Thông tin chung)
- "Ảnh sản phẩm"  
  Upload card: "Kéo thả hoặc " + "Nhấn để tải lên" (link)  
  Sub: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"
- "Mã sản phẩm nội bộ *" → "IP-BP-0001"
- "Tên sản phẩm *" → "Lọc dầu động cơ Toyota"
- "Tính chất" → "Nhóm vật tư hàng hoá"
- "Nhóm vật tư/hàng hóa" → "Phụ tùng bảo dưỡng"
- "ĐVT chính *" → "Cái"  
  ⚠️ DISABLED + hint dưới: "Mã đã phát sinh giao dịch, không sửa được" (verify từ Figma — text trong _full.png cột 2/3)
- "Trạng thái" → "Đang hoạt động"
- "Thương hiệu" → "Toyota"
- "Xuất xứ" → "Nhật Bản"
- "Phương pháp tính giá" → "Bình quân cuối kỳ"  
  ⚠️ DISABLED + hint dưới (giống ĐVT chính)
- "Thông số kỹ thuật" → "Đường kính 68mm, ren M20×1.5, chiều cao 75mm."
- "Quy cách sản phẩm" → "Lọc dầu động cơ dùng cho Toyota Vios/Altis"
- "Mô tả" → "Phụ tùng bảo dưỡng định kỳ, dùng để lọc dầu động cơ."
- "Ghi chú" — placeholder: "Nhập ghi chú" (KHÔNG prefilled)

### Tab nav
- "ĐVT quy đổi" (active) · "Mã SKU" · "Đính kèm file"

### Tab "ĐVT quy đổi" content
- Button: "Thêm DVT quy đổi" ⚠️ (Figma viết "DVT" — verify với BA wording chuẩn "ĐVT")
- Table headers: "STT" · "ĐVT" · "Tỷ lệ quy đổi" · "Thao tác"
- Sample rows: 1..5 / "Thùng" / "12" + 2 icon (Edit + Trash) per row

### Footer (shared chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0"
- "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Required asterisk (KHÁC CREATE: 3 trường giữ nguyên required)
- 3 trường có "*": Mã sản phẩm nội bộ · Tên sản phẩm · ĐVT chính

---

## Design Tokens

> **Tokens identical với `wave03-cat-prod-create-oracle.md` cache** — Edit reuse 100% form layout + token palette của Create. EDIT-specific:

### Colors (mới so với CREATE)
- `#f4f4f5` (base/muted, bg-disabled) → `bg-muted` (Select disabled bg)
- `#71717a` (base/muted-foreground) → `text-muted-foreground` (disabled value text + hint text)

### Typography
- Hint text below disabled field: `text-extra-small/regular` (12px) `text-muted-foreground`
- Button "Lưu" / "Huỷ bỏ" / "Thêm DVT quy đổi": `text-small/medium` (14px) weight 500

### Spacing
- Hint gap below field: ~4px (verify)
- Table row height: ~52-56px (verify shadcn baseline)
- Icon button trong cell Thao tác: 32×32 click target, icon 16×16 muted, gap 8px between icons

### Border radius
- Identical với CREATE: `radius/md` cho Input/Select/Button, `radius/lg` cho Card/Dialog

### Sizes
- ImageUpload: 252×252 (giống CREATE)
- Table row height: ~52-56 (icon row, edit mode)

---

## Notes (oracle interpretation, không phải fact để verify)

- EDIT = CREATE form **với prefilled data** + 2 khác biệt UI:
  - (a) tiêu đề "Sửa sản phẩm" + button "Lưu" (thay "Thêm sản phẩm" + "Tạo")
  - (b) tab "ĐVT quy đổi" active default (CREATE: tab "Mã SKU" active default)
  - (c) field "ĐVT chính" + "Phương pháp tính giá" DISABLED khi sản phẩm đã phát sinh giao dịch (rule nghiệp vụ — verify với BR-CAT-PROD-EDIT)
- Hint text dưới field disabled = persistent server-side rule, KHÔNG phải tooltip. DEV implement: render `<p className="text-xs text-muted-foreground mt-1">` dưới Select khi `disabled=true`.
- Sample prefilled "IP-BP-0001", "Lọc dầu động cơ Toyota" = mock; runtime inject từ row context (URL param hoặc store).
- Button "Thêm DVT quy đổi" — Figma viết "DVT" có thể typo "ĐVT" → verify với BA wording chuẩn; DEV implementation nên dùng đúng "ĐVT quy đổi".
- Table ĐVT quy đổi trong EDIT có icon Edit + Trash per row → trigger sub-dialog edit (giống dialog "Thêm ĐVT quy đổi" nhưng prefilled) hoặc xoá row. Verify behavior với UX-FLOW.
- 5 sample row đều "Thùng" / "12" = mock, runtime data ≠ uniformly Thùng.
- KHÔNG có tab "Mã SKU" content sâu trong frame canonical EDIT (tab inactive) — verify với CREATE oracle (tab "Mã SKU" canonical đã capture button "Gắn SKU" + Table mapping).
- DEV cần handle TWO mode: (1) sản phẩm chưa phát sinh giao dịch → cả 2 field enabled; (2) đã phát sinh → 2 field disabled + hint. Server response phải có flag (vd `canEditUnit: boolean` + `canEditPricingMethod: boolean`).
- Image upload trong EDIT: nếu sản phẩm đã có ảnh → DEV render thumbnail + "Thay đổi" overlay thay vì empty placeholder. Verify state với UX-FLOW (Figma chỉ show empty state).
- Interaction states (`:hover`, `:focus`, `:active`) Figma không render → theo shadcn/ui baseline.
