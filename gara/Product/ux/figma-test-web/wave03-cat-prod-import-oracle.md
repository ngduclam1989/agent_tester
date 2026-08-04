---
feat: FEAT-CAT-PROD-IMPORT
feat_file: Product/features/FEAT-CAT-PROD-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87154&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87154"
fetched_at: 2026-06-29T03:15:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: partial (output-too-large 60.4KB — extracted 5 top-level frame IDs via grep)
  get_variable_defs: cached (tokens identical with wave03-cat-prod-create-oracle.md cache)
  get_design_context: skipped (PNG canonical sufficient — dialog overlay flow)
  get_screenshot: success (6 PNG: _full + 5 per-frame dialogs)
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete (5 frame state captured — empty/selected/preview-valid/preview-invalid/success)
  text_content: complete (verbatim from PNG)
  design_tokens: complete (cached)
  interaction_states: partial (Figma không render :hover/:focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cat-prod-import/_full.png
  - assets/wave03-cat-prod-import/13493-62079-upload-empty.png
  - assets/wave03-cat-prod-import/14234-215639-upload-selected.png
  - assets/wave03-cat-prod-import/13496-85517-preview-valid.png
  - assets/wave03-cat-prod-import/14234-215401-preview-paginated.png
  - assets/wave03-cat-prod-import/13496-88655-success-toast.png
---

# Oracle — FEAT-CAT-PROD-IMPORT (web) · wave 03

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14146:87154`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Tính năng **Import sản phẩm hàng loạt từ Excel** —
> flow 2-step dialog overlay: (1) upload file → (2) preview data + validation → success toast.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Dialog 1A — Upload empty (file chưa chọn, button "Kiểm tra dữ liệu" disabled) | 13493:62079 | 1440×900 | assets/wave03-cat-prod-import/13493-62079-upload-empty.png |
| Dialog 1B — Upload selected (file đã chọn, hiển thị FileItem, button enabled) | 14234:215639 | 1440×900 | assets/wave03-cat-prod-import/14234-215639-upload-selected.png |
| Dialog 2A — Preview valid (40 hợp lệ / 0 không hợp lệ, button "Xác nhận" enabled) | 13496:85517 | 1440×900 | assets/wave03-cat-prod-import/13496-85517-preview-valid.png |
| Dialog 2B — Preview với errors (20 hợp lệ / 20 không hợp lệ, button "Xác nhận" DISABLED) | 14234:215401 | 1440×900 | assets/wave03-cat-prod-import/14234-215401-preview-paginated.png |
| Success Toast (top-right, dialog dismiss) | 13496:88655 | 1440×900 | assets/wave03-cat-prod-import/13496-88655-success-toast.png |

> **Note**: Tất cả 5 state là **dialog overlay** trên page LIST sản phẩm (page bị ẩn `hidden=true` trong Figma). Toast là notification standalone (KHÔNG có scrim).

---

## Component Inventory

### Screen 1A: Upload empty (13493:62079)
- Overlay scrim × 1 (`Popup/Dialog Overlay` full viewport, bg overlay/90)
- Dialog box × 1 (centered, ~880px wide, padding ~24px, bg white, radius lg, shadow lg)
  - DialogHeader text × 1: "Tải lên danh mục sản phẩm" (text large/semibold, center-aligned)
  - DownloadLink Row × 1: Icon (file/spreadsheet, 16×16 blue) + Text link "Mẫu file danh sách sản phẩm.xlsx" (text-link blue underline)
  - DropZone × 1 (dashed border 2px `border-input`, radius md, height ~140px, padding center)
    - Icon upload (cloud-arrow-up 24×24 brand-CD circle bg-info-bg ~40×40)
    - Text: "Kéo thả hoặc {Nhấn để tải lên}" — "Nhấn để tải lên" là link blue underline
    - Sub-text: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" (text-xs muted)
  - DialogFooter Row × 1 (horizontal, right-aligned, gap ~8px)
    - Button "Huỷ" (secondary outline, bg white)
    - Button "Kiểm tra dữ liệu" (primary brand-CD, **DISABLED** = opacity 50% / bg light blue)

### Screen 1B: Upload selected (14234:215639)
- Identical với 1A + **FileItem** appended dưới DropZone:
  - FileItem Row × 1 (horizontal, bg white, border 1px `border-input`, radius md, padding 12px, gap 12px)
    - Icon file XLS (32×32 colored green Excel badge)
    - Text stack: "Filename.format" (text-sm) + "1.3MB" (text-xs muted)
    - IconButton trash (16×16 muted, right-aligned)
  - Button "Kiểm tra dữ liệu" ENABLED (bg brand-CD `#0052ff`, text white)

### Screen 2A: Preview valid (13496:85517)
- Overlay scrim × 1
- Dialog box × 1 (centered, ~1100px wide — bigger than upload dialog, padding ~24px)
  - DialogHeader text × 1: "Xem trước dữ liệu" (text large/semibold, center-aligned)
  - SummaryRow × 1 (horizontal, gap ~24px, padding y=12)
    - Text: "Hợp lệ: " + "40" (number bold green `text-success-foreground`)
    - Text: "Không hợp lệ: " + "0" (number bold red `text-destructive`)
  - Table × 1 (header bg gray-50, columns 7)
    - Columns: STT · Mã sản phẩm nội bộ · Tên sản phẩm · ĐVT chính · Phương pháp tính giá · Thương hiệu · Xuất xứ · Tính chất
    - Row x 5: STT 1..5 + sample data ("AS78-1234-EDC9", "Bộ má phanh", "Thùng", "Bình quân cuối kỳ", "Mazuda", "Nhật Bản", "Vật tư hàng hoá")
  - Pagination Row × 1 (horizontal between, padding y=8)
    - Left: "Hiển thị" + Select "5" + "mỗi trang"
    - Right: "← Trước" + button group "1" "2"(active) "3" "..." "Tiếp →"
  - DialogFooter Row × 1 (right-aligned, gap ~8px)
    - Button "Quay lại" (secondary outline)
    - Button "Xác nhận" (primary brand-CD, **ENABLED** when 0 errors)

### Screen 2B: Preview với errors (14234:215401)
- Identical structure với 2A, KHÁC:
  - Summary: "Hợp lệ: 20" (green) + "Không hợp lệ: 20" (red)
  - Button "Xác nhận" **DISABLED** (opacity 50% / bg light blue)
  - Table rows có thể có visual indicator cho row invalid (verify trong _full.png cột 4 — có vẻ row được highlight bg-destructive-bg light pink khi có error)

### Screen 3: Success Toast (13496:88655)
- KHÔNG có scrim/overlay (toast standalone)
- Toast box × 1 (position top-right, ~360px wide, bg `bg-success-bg` light green, border 1px `border-success`, radius md, padding 12px, shadow sm)
  - Icon Check (16×16 white) inside green circle background
  - Text: "Tải tệp lên thành công!" (text-sm font-medium foreground)
  - IconButton X close (16×16 muted, right-aligned)

---

## Variant & State

### Dialog box (upload — small)
- Bounds: w≈880 h auto (~330-400px)
- Layout: vertical stack, padding 24px, gap 20-24px
- Centered viewport

### Dialog box (preview — large)
- Bounds: w≈1100 h auto (~580px)
- Same layout pattern, wider for table

### DropZone (upload area)
- DashedBorder 2px `border-input` (`#d4d4d8`) radius md
- Height: ~140px (collapsed) or ~120px khi có FileItem dưới
- Hover state: bg light blue (verify shadcn baseline)
- Drag-over state: border solid brand-CD (verify — Figma không capture)

### FileItem
- Layout: horizontal flex, bg white, border 1px `border-input`, radius md
- Padding: 12px, gap 12px (icon → text → trash)
- Icon XLS: square ~32×32 with green Excel badge style (lucide `file-spreadsheet` hoặc image asset)

### Button "Kiểm tra dữ liệu"
- ENABLED: bg `#0052ff` text white (primary brand-CD)
- DISABLED: bg light blue / opacity 50% (verify — looks like `bg-primary/50` or `bg-blue-200`)

### Button "Xác nhận"
- Identical với "Kiểm tra dữ liệu" — primary brand-CD, ENABLED/DISABLED tùy số errors

### Status numbers ("Hợp lệ" / "Không hợp lệ")
- "Hợp lệ" count: text font-bold `text-success-foreground` green
- "Không hợp lệ" count: text font-bold `text-destructive` red
- Label "Hợp lệ:" / "Không hợp lệ:" `text-sm font-medium text-foreground`

### Pagination
- Page buttons: 32×32 (icon size), default bg white border 1px `border-input`, radius md
- Active page: bg white, border 1px `border-input` (visible border around "2")
- Prev/Next: text-sm với icon chevron
- "..." ellipsis: text muted, no border

### Toast (success)
- bg `bg-success-bg` light green (~`#dcfce7` hoặc `oklch(0.98 0.05 145)`)
- Border 1px `border-success` (verify — green border ~`#86efac`)
- Padding 12px, radius md, shadow sm
- Icon Check trong green circle (filled, white check)
- Close icon X (lucide `x`, 16×16 muted)
- Auto-dismiss timing: KHÔNG xác định từ Figma — verify product (thường 3-5s)

---

## Text Content (verbatim)

### Dialog 1 (Upload empty + selected)
- Header: "Tải lên danh mục sản phẩm"
- Download link: "Mẫu file danh sách sản phẩm.xlsx"
- DropZone main: "Kéo thả hoặc " + "Nhấn để tải lên"
- DropZone sub: "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"  
  ⚠️ Note: "xlxs" có thể typo "xlsx" trong Figma — verify final wording (DEV implementation nên dùng đúng `.xlsx`)
- FileItem sample: "Filename.format" + "1.3MB"
- Buttons: "Huỷ" · "Kiểm tra dữ liệu"

### Dialog 2 (Preview)
- Header: "Xem trước dữ liệu"
- Summary labels: "Hợp lệ:" · "Không hợp lệ:"
- Table headers: "STT" · "Mã sản phẩm nội bộ" · "Tên sản phẩm" · "ĐVT chính" · "Phương pháp tính giá" · "Thương hiệu" · "Xuất xứ" · "Tính chất"
- Sample rows:
  - 1 / "AS78-1234-EDC9" / "Bộ má phanh" / "Thùng" / "Bình quân cuối kỳ" / "Mazuda" / "Nhật Bản" / "Vật tư hàng hoá"
  - 2 / "MN56-4567-WSX6" / "Lọc gió" / "Bình" / "Bình quân cuối kỳ" / "Hyundai" / "Hàn Quốc" / "Vật tư hàng hoá"
  - 3 / "VB34-7890-QAZ3" / "Bộ bugi" / "Thùng" / "Bình quân cuối kỳ" / "Benzel" / "Đức" / "Vật tư hàng hoá"
  - 4 / "XC12-0123-REW0" / "Dây curoa cam" / "Thùng" / "Bình quân cuối kỳ" / "Amerix" / "Mỹ" / "Vật tư hàng hoá"
  - 5 / "ZA90-3456-UYT7" / "Kim phun nhiên liệu" / "Chiếc" / "Bình quân cuối kỳ" / "Renault" / "Pháp" / "Vật tư hàng hoá"
- Pagination labels: "Hiển thị" + "5" + "mỗi trang" + "Trước" + page nums + "Tiếp"
- Buttons: "Quay lại" · "Xác nhận"

### Toast
- Text: "Tải tệp lên thành công!"

---

## Design Tokens

> **Tokens identical với `wave03-cat-prod-create-oracle.md` cache**. IMPORT-specific:

### Colors (mới so với CREATE)
- `#dcfce7` (success bg) / `#16a34a` (success text) — Toast bg + "Hợp lệ" count text
- `#fee2e2` (destructive bg) / `#dc2626` (destructive text) — "Không hợp lệ" count text + invalid row highlight (verify)
- `#0052ff` (brand-CD) opacity 50% → button disabled appearance

### Typography
- Summary numbers: `text-base font-bold` (~16px bold)
- Summary labels: `text-sm font-medium`
- Toast text: `text-sm font-medium`
- Download link: `text-sm text-link` underline

### Spacing
- Dialog padding: 24px (spacing/6)
- Dialog body sections gap: 20-24px
- DropZone padding: ~24-32px
- Summary row gap: 24px (between Hợp lệ / Không hợp lệ groups)
- Pagination buttons gap: 4px
- Toast padding: 12px

### Border radius
- Dialog: `radius/lg` = 8
- FileItem: `radius/md` = 6
- DropZone: `radius/md` = 6
- Toast: `radius/md` = 6
- Pagination button: `radius/md` = 6

### Sizes
- Upload dialog: w≈880
- Preview dialog: w≈1100
- Toast: w≈360
- DropZone height: ~140px
- FileItem height: ~56-64px
- Pagination button: 32×32
- File icon (XLS): 32×32

---

## Notes (oracle interpretation, không phải fact để verify)

- IMPORT flow **2-step dialog** với 5 visual state thực tế:
  1. Open dialog → state empty (DropZone trống, button "Kiểm tra dữ liệu" disabled)
  2. User chọn file → state selected (FileItem hiển thị, button enabled)
  3. Click "Kiểm tra dữ liệu" → POST file → state preview (Table render 5 row/page, paginated)
     - 3a: validation pass (`Hợp lệ > 0, Không hợp lệ = 0`) → button "Xác nhận" enabled
     - 3b: validation fail (`Không hợp lệ > 0`) → button "Xác nhận" disabled (DEV: hoặc force confirm + skip invalid rows? verify FEAT AC)
  4. Click "Xác nhận" → POST commit → state success (dialog dismiss + toast top-right)
- Template download link "Mẫu file danh sách sản phẩm.xlsx" → click → download Excel template từ static asset hoặc backend endpoint. Verify URL với FEAT AC.
- Sub-text "Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf" trong DropZone là **MISLEADING** — IMPORT chỉ chấp nhận `.xlsx` (template là Excel). Đây có thể là copy-paste từ component upload generic — verify với BA, DEV nên hiển thị "Hỗ trợ file: .xlsx" thay vì list mọi extension.
- Summary "Hợp lệ: 40 / Không hợp lệ: 0" cho thấy file 40 row total → 5 row x 8 page = 40 (matches pagination 1, 2, 3, ..., active "2"). Sample is mock.
- Row invalid trong Table (screen 2B): Figma _full.png cột 4 có visual highlight light pink/red cho row invalid — DEV implement: `<tr className={row.valid ? '' : 'bg-destructive/10'}>`. Cũng có thể có column "Lý do lỗi" (verify _full.png cột 4).
- Pagination "5 mỗi trang" = page size default. Verify nếu có option khác (10/20/50) hoặc cố định.
- Toast vị trí top-right (Figma frame `14234:215401` ở x=14234) — DEV implement: shadcn `<Sonner />` hoặc `<Toast />` với position `top-right`. Auto-dismiss 3-5s (verify).
- "Tải tệp lên thành công" trong toast = **post-commit success** (sau "Xác nhận"), KHÔNG phải post-upload success (sau "Kiểm tra dữ liệu"). Verify wording chính xác với FEAT AC (có thể "Tạo sản phẩm thành công" hợp lý hơn).
- Button DISABLED state Figma render = opacity 50% hoặc bg light → DEV theo shadcn baseline (`disabled:opacity-50 disabled:pointer-events-none`).
- Interaction states (`:hover`, `:focus`, `:drag-over`) Figma không render → theo shadcn baseline + verify drag-and-drop behavior với UX-FLOW.
- FEAT cross-link: import flow trigger từ button "Tải lên" trên màn LIST (xem `wave03-cat-prod-list-oracle.md` header right cluster).
