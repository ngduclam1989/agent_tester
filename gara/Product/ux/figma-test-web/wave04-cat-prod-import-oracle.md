---
feat: FEAT-CAT-PROD-IMPORT
feat_file: Product/features/FEAT-CAT-PROD-IMPORT.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87154&t=fE3MKR6uAHS9vkKm-4
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "14146:87154"
fetched_at: 2026-07-08T03:30:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (14 top-level frame IDs enumerated — 4 primary screen states + 2 helper "Lỗi hiển thị nhiều cột dữ liệu" study frames + tables)
  get_variable_defs: success (Garage design tokens map)
  get_design_context: skipped (per-frame PNG canonical sufficient — wizard page flow with 4 discrete states)
  get_screenshot: success (4 PNG per-frame at native 1440-wide resolution — root section 9393px width triggers per-frame rule §3.1.1)
data_completeness:
  screen_inventory: complete (4 in-scope screen states + 1 out-of-scope "result screen" flagged NEED CONFIRMATION per FEAT AC-8)
  component_inventory: complete
  variant_state: complete (empty / uploaded / preview / toast — 4 discrete states)
  text_content: complete (verbatim from PNG native resolution)
  design_tokens: complete (variable_defs full map)
  interaction_states: partial (Figma không render :hover/:focus/:drag-over — verify shadcn baseline + drag-drop UX)
screenshots:
  - assets/wave04-cat-prod-import/14601-133301-step1-empty.png
  - assets/wave04-cat-prod-import/14601-133897-step1-uploaded.png
  - assets/wave04-cat-prod-import/14601-134126-step2-preview.png
  - assets/wave04-cat-prod-import/14601-135187-result-toast.png
---

# Oracle — FEAT-CAT-PROD-IMPORT (web) · wave 04

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` section `14146:87154`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Wave 04 revision — Design đã chuyển từ **dialog overlay flow (wave03)**
> sang **full-page wizard flow** với 2 bước: (1) Tải Template + chọn file → (2) Kiểm tra dữ liệu (preview + filter)
> → success toast. Actions "Huỷ bỏ" / "Xác nhận" giờ đặt ở **page header top-right** (không còn dialog footer).

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Step 1A — Empty (page load, chưa chọn file) | 14601:133301 | 1440×822 | assets/wave04-cat-prod-import/14601-133301-step1-empty.png |
| Step 1B — Uploaded (đã chọn file, hiển thị FileItem) | 14601:133897 | 1440×822 | assets/wave04-cat-prod-import/14601-133897-step1-uploaded.png |
| Step 2 — Preview (filter + table + pagination, header actions visible) | 14601:134126 | 1440×1020 | assets/wave04-cat-prod-import/14601-134126-step2-preview.png |
| Success Toast (post-confirm — page-level notification) | 14601:135187 | 1440×900 | assets/wave04-cat-prod-import/14601-135187-result-toast.png |

**NEED CONFIRMATION** — Frames Figma NOT capture (FEAT AC yêu cầu):
- AC-3b lỗi file (invalid format / rỗng / >500 dòng `ERR-INV-041`) → verify UX-FLOW + BR-CAT-PROD-020
- AC-5 dòng lỗi trong preview (`ERR-INV-006/007/012/042/043/044`) → visual highlight row invalid + cột "Trạng thái"/"Lý do lỗi" chưa thấy trong screenshot Step 2 → verify PNG khi có dòng lỗi
- AC-8 màn kết quả "Kết quả import danh mục" (Tạo mới / Cập nhật=0 / Bỏ qua-lỗi / Thời gian + "Tải file lỗi" + "Đóng") → Figma frame 14601:135187 chỉ render Popup/Dialog Overlay + Toast, không có metrics dashboard visible → có thể là dialog riêng chưa gộp vào section này

**Note**: Metadata cũng chứa 2 frame "Lỗi hiển thị nhiều cột dữ liệu" (14601:135303, 14601:135395) — table column-layout study, KHÔNG phải screen state end-user thấy. Loại khỏi oracle scope.

---

## Component Inventory

### Screen 1A: Step 1 empty (14601:133301)
- Navbar × 1 (top, bg brand-CD `#0052ff`, menu items white — "GMS · Tổng quan · Mua hàng · Sửa chữa & Dịch vụ · Tồn kho · Khách hàng · Marketing · Nhân viên · Danh mục" — "Danh mục" pill white bg with brand text = active)
- Secondary tab-bar × 1 (bg white, border-bottom, tabs: "Danh sách sản phẩm" active blue underline · "Nhóm vật tư hàng hoá" · "Kỳ kế toán")
- PageHeader × 1 (row, horizontal):
  - Left: BackButton (arrow-left icon) + Title text "Tải lên danh mục sản phẩm" (text-2xl semibold `#18181b`)
- Section × 1 (vertical stack, gap ~20-24px)
  - SectionTitle × 1: "Thông tin cơ bản" (text-lg semibold `#18181b`)
  - DownloadLink Row × 1: Icon file-spreadsheet (16×16 blue) + Text link "Mẫu file danh sách sản phẩm.xlsx" (text-sm foreground-link `#1d4ed8` — no underline visible in screenshot)
  - DropZone × 1 (dashed border 1-2px `border-input` `#d4d4d8`, radius md, height ~140px, padding center)
    - Icon upload cloud-arrow-up (~20×20 brand-CD `#0052ff`) inside circle bg-info-bg `#eff6ff` (~40×40 circle)
    - Text primary: "Kéo thả hoặc " + "nhấn để chọn tệp" (link blue underline)
    - Sub-text: "Hỗ trợ file: .xls, .xlsx, .csv" (text-xs muted `#71717a`)
- Footer × 1 (bottom, horizontal, height ~48px, border-top)
  - Left: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0"
  - Right: "Hướng dẫn sử dụng · Hỗ trợ · Hotline: 0985135050"

### Screen 1B: Step 1 uploaded (14601:133897)
Identical với 1A + **FileItem row** appended dưới DropZone:
- FileItem × 1 (horizontal, bg white, border 1px `border-input` `#d4d4d8`, radius md, padding 12px 16px, gap 12px, height ~64px)
  - Icon XLS badge (~32×32, xanh lá Excel style — `bg-green-100` với text "XLS" hoặc file-spreadsheet lucide)
  - Text stack (col, gap 4px):
    - "Filename.format" (text-sm text-foreground)
    - "1.3MB" (text-xs muted-foreground)
  - IconButton trash (right-aligned, ~20×20 muted-foreground icon)

### Screen 2: Step 2 preview (14601:134126)
- Navbar + secondary tabs (identical layout)
- PageHeader × 1 with **header actions right-aligned**:
  - Left: BackButton (arrow-left) + Title "Tải lên danh mục sản phẩm"
  - Right: Button "Huỷ bỏ" (secondary outline, ~87×36) + Button "Xác nhận" (primary brand-CD `#0052ff`, ~87×36)
- Section: "Thông tin cơ bản" (identical layout)
- DownloadLink Row (identical)
- DropZone (identical, allow re-upload)
- FileItem row (identical)
- **FilterRow** × 1 (horizontal, gap ~16px, padding y=8, align items-center)
  - Left group:
    - SearchInput × 1: icon search-normal (16×16 muted) + placeholder "Tìm theo mã nội bộ, tên sản phẩm" (width ~320px, height 36, border input, radius md)
    - ButtonGroup × 1 (3 buttons segmented, gap 8px):
      - Button "Tất cả" (primary brand-CD `#0052ff` — ACTIVE, ~73×36)
      - Button "Hợp lệ" (secondary outline, ~75×36)
      - Button "Lỗi" (secondary outline, ~52×36)
    - Numbers Report × 1 (horizontal, gap ~12px, align center, text-xs):
      - "Tổng cộng: " + "40" (font-medium)
      - "Hợp lệ: " + "40" (number green foreground-success `#16a34a`, font-bold)
      - "Lỗi: " + "0" (number red foreground-error `#dc2626`, font-bold)
  - Right group:
    - Button "Tải file lỗi" × 1 (secondary outline with icon download, ~119×36)
- **Table** × 1 (bg white, border, header bg accent `#f4f4f5`)
  - Column headers (10 cột observed in screenshot; horizontal scroll ẩn cột phải):
    1. STT (60px)
    2. Mã sản phẩm nội bộ (185px)
    3. Tên sản phẩm (178px)
    4. ĐVT chính (120px)
    5. Phương pháp tính giá (180px)
    6. Thương hiệu (120px)
    7. Xuất xứ (120px)
    8. Tính chất (180px)
    9. Nhóm sản... (visible, truncated — likely "Nhóm sản phẩm" hoặc "Nhóm vật tư/hàng hoá" per FEAT-CAT-PROD BR-018)
    10. + 3 cột ngoài viewport theo metadata (168+168+154+168=cột "Quy cách" / "Trạng thái" / "Lý do lỗi" — verify khi scroll)
  - Row sample × 5 (identical với wave03 sample):
    - 1 · AS78-1234-EDC9 (link blue) · Bộ má phanh · Thùng · Bình quân cuối kỳ · Mazuda · Nhật Bản · Vật tư hàng hoá · Phụ tùng ...
    - 2 · MN56-4567-WSX6 · Lọc gió · Bình · Bình quân cuối kỳ · Hyundai · Hàn Quốc · Vật tư hàng hoá · Phụ tùng ...
    - 3 · VB34-7890-QAZ3 · Bộ bugi · Thùng · Bình quân cuối kỳ · Benzel · Đức · Vật tư hàng hoá · Phụ tùng ...
    - 4 · XC12-0123-REW0 · Dây curoa cam · Thùng · Bình quân cuối kỳ · Amerix · Mỹ · Vật tư hàng hoá · Phụ tùng ...
    - 5 · ZA90-3456-UYT7 · Kim phun nhiên liệu · Chiếc · Bình quân cuối kỳ · Renault · Pháp · Vật tư hàng hoá · Phụ tùng ...
- **Pagination** × 1 (horizontal between, padding y=8):
  - Left: "Hiển thị" + Select "5" (chevron-down, 60×36) + "mỗi trang"
  - Right: "< Trước" + button group "1" "2"(active — border) "3" "..." "Tiếp >"

### Screen 3: Success Toast (14601:135187)
- Page content **hidden** (metadata `hidden=true`) — screen bg gray/neutral (Figma canvas exposed)
- Popup/Dialog Overlay instance (per metadata, but visually chỉ thấy gray bg — có thể là confirm dialog trước khi commit, hoặc post-commit state screen sẽ hiển thị màn "Kết quả import")
- Toast × 1 (top-right, position ~x=1068 y=116 per metadata, 360×56):
  - bg `background-success` `#f0fdf4` (light green)
  - Border 1px `border-success` `#22c55e` (verify — may be subtle)
  - Radius md (6px), padding ~12-16px, shadow sm
  - Icon Check circle-filled (~20×20 white check inside green circle bg-foreground-success `#16a34a`)
  - Text: "Tải tệp lên thành công!" (text-sm font-medium foreground)
  - IconButton close × (~16×16 muted-foreground, right-aligned)

---

## Variant & State

### Page header
- Step 1 (Empty/Uploaded): back arrow + title only, no action buttons
- Step 2 (Preview): back arrow + title + Right cluster {Huỷ bỏ, Xác nhận}

### Button "Xác nhận" (page header, Step 2)
- Bounds: ~87×36, primary brand-CD `#0052ff` bg, text white
- ENABLED khi validation pass (per AC-6: chỉ ghi dòng hợp lệ, có thể enable ngay cả khi có dòng lỗi vì skip invalid)
- **NEED CONFIRMATION**: FEAT AC-6 nói "chỉ ghi các dòng hợp lệ, bỏ qua dòng lỗi" — button có DISABLED khi 100% dòng lỗi? Or luôn ENABLED? Verify FEAT AC / UX-FLOW.

### Button "Huỷ bỏ" (page header, Step 2)
- Bounds: ~87×36, secondary outline (border input, bg white)
- Text: "Huỷ bỏ"

### DropZone
- Empty state: dashed border 1-2px `border-input` `#d4d4d8`, height ~140px, radius md
- Uploaded state: identical border (KHÔNG có drag-over highlight trong static Figma)
- Hover / drag-over: verify shadcn baseline + browser drag-drop behavior — Figma không capture

### FileItem
- Layout: horizontal, bg white, border 1px `border-input`, radius md, height ~64px
- Icon XLS: 32×32 green Excel badge (image asset hoặc lucide `file-spreadsheet` với green color)
- Trash icon: right-aligned, muted-foreground

### FilterRow — SegmentedTabs "Tất cả / Hợp lệ / Lỗi"
- Active: bg brand-CD `#0052ff`, text white
- Inactive: bg white, border input `border-input`, text foreground
- Height 36, radius md

### FilterRow — Numbers
- "Tổng cộng: N" — label muted, number bold foreground
- "Hợp lệ: N" — label muted, **N in green** `text-foreground-success` `#16a34a` font-bold
- "Lỗi: N" — label muted, **N in red** `text-foreground-error` `#dc2626` font-bold

### Table Row (invalid)
- **NEED CONFIRMATION**: PNG hiện tại render "Lỗi: 0" nên không có row invalid visible. Frame study 14601:135303/14601:135395 tên "Lỗi hiển thị nhiều cột dữ liệu" là design study về cột layout, KHÔNG phải row error highlight. Cần fetch thêm frame với dòng lỗi để verify visual (bg-destructive/10 highlight? cột "Lý do lỗi"?).

### Toast (success)
- bg `#f0fdf4` (background-success light green)
- Border 1px `border-success` `#22c55e` (verify solid vs subtle)
- Radius md (6px), padding ~12-16px, shadow sm
- Icon Check trong green circle-filled (white check, bg `#16a34a`)
- Close icon × (lucide `x`, muted-foreground)
- Auto-dismiss timing: KHÔNG xác định từ Figma — verify FEAT / UX-FLOW (thường 3-5s)

---

## Text Content (verbatim)

### Navbar (shared across all screens)
- Logo: "GMS"
- Menu items: "Tổng quan" · "Mua hàng" · "Sửa chữa & Dịch vụ" · "Tồn kho" · "Khách hàng" · "Marketing" · "Nhân viên" · "Danh mục" (active)

### Secondary tab-bar (shared)
- "Danh sách sản phẩm" (active — blue underline)
- "Nhóm vật tư hàng hoá"
- "Kỳ kế toán"

### Step 1 (Empty + Uploaded)
- Page title: "Tải lên danh mục sản phẩm"
- Section title: "Thông tin cơ bản"
- Download link: "Mẫu file danh sách sản phẩm.xlsx"
- DropZone primary: "Kéo thả hoặc " + "nhấn để chọn tệp"
- DropZone sub: "Hỗ trợ file: .xls, .xlsx, .csv"
  ⚠️ Note: PNG hiển thị `.xls, .xlsx, .csv` nhưng FEAT AC-3b nói "file không phải `.xlsx` → báo lỗi định dạng" — có xung đột giữa Figma copy vs FEAT AC. DEV nên **theo FEAT** (chỉ chấp nhận `.xlsx`) và flag Figma copy để BA đối chiếu.
- FileItem sample: "Filename.format" + "1.3MB"

### Step 2 (Preview)
- Page title: "Tải lên danh mục sản phẩm" (same as Step 1)
- Page header actions: "Huỷ bỏ" · "Xác nhận"
- Section title: "Thông tin cơ bản"
- Search placeholder: "Tìm theo mã nội bộ, tên sản phẩm"
- Filter tabs: "Tất cả" · "Hợp lệ" · "Lỗi"
- Numbers: "Tổng cộng: 40" · "Hợp lệ: 40" · "Lỗi: 0"
- Action right: "Tải file lỗi"
- Table headers (visible): "STT" · "Mã sản phẩm nội bộ" · "Tên sản phẩm" · "ĐVT chính" · "Phương pháp tính giá" · "Thương hiệu" · "Xuất xứ" · "Tính chất" · "Nhóm sản..." (truncated)
  - **NEED CONFIRMATION**: FEAT AC-4 nói cột "Trạng thái" + "Lý do lỗi" — không thấy visible trong PNG Step 2 (viewport bị cắt hoặc cột được ẩn khi "Tổng cộng: 40 · Lỗi: 0"). Verify khi filter "Lỗi" or scroll horizontal.
- Sample rows (mã sản phẩm cột 2 hiển thị blue link):
  - 1 · AS78-1234-EDC9 · Bộ má phanh · Thùng · Bình quân cuối kỳ · Mazuda · Nhật Bản · Vật tư hàng hoá · Phụ tùng ...
  - 2 · MN56-4567-WSX6 · Lọc gió · Bình · Bình quân cuối kỳ · Hyundai · Hàn Quốc · Vật tư hàng hoá · Phụ tùng ...
  - 3 · VB34-7890-QAZ3 · Bộ bugi · Thùng · Bình quân cuối kỳ · Benzel · Đức · Vật tư hàng hoá · Phụ tùng ...
  - 4 · XC12-0123-REW0 · Dây curoa cam · Thùng · Bình quân cuối kỳ · Amerix · Mỹ · Vật tư hàng hoá · Phụ tùng ...
  - 5 · ZA90-3456-UYT7 · Kim phun nhiên liệu · Chiếc · Bình quân cuối kỳ · Renault · Pháp · Vật tư hàng hoá · Phụ tùng ...
- Pagination: "Hiển thị" + "5" + "mỗi trang" + "Trước" + page nums (1 · 2 · 3 · ...) + "Tiếp"

### Footer (shared)
- Left: "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0"
- Right: "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

### Success Toast
- Text: "Tải tệp lên thành công!"

---

## Design Tokens

Source: `get_variable_defs` (14146:87154) — Garage design system tokens.

### Colors (base — shared)
- `base/background` = `#ffffff` — page/dropzone/fileitem bg
- `base/foreground` = `#18181b` — text primary (headings, body)
- `base/muted-foreground` = `#71717a` — text muted (subtext, hint, close icon)
- `base/primary` = `#18181b` — text primary/foreground fallback
- `base/primary-foreground` = `#ffffff` — button text on brand bg
- `base/accent` = `#f4f4f5` — table header bg
- `base/border` = `#e4e4e7` — dividers
- `base/input` = `#d4d4d8` — border-input (fileitem, dropzone, buttons secondary)
- `Dark/3` = `#474847` — misc dark stroke

### Colors (brand + status)
- `base/foreground-brand-CD` = `#0052ff` — brand-CD blue (button primary, link, dropzone icon, tab active underline)
- `base/background-brand-CD` = `#0052ff` — button "Xác nhận" bg, "Tất cả" active tab bg
- `base/background-process` = `#eff6ff` — light blue circle bg for dropzone upload icon
- `base/foreground-link` = `#1d4ed8` — "Mẫu file danh sách sản phẩm.xlsx" link
- `base/foreground-success` = `#16a34a` — "Hợp lệ: 40" number green + toast check icon bg
- `base/background-success` = `#f0fdf4` — toast light green bg
- `base/border-success` = `#22c55e` — toast border green
- `base/foreground-error` = `#dc2626` — "Lỗi: 0" number red
- `base/background-error` = `#fef2f2` — invalid row bg (verify — chưa thấy trong PNG hiện tại)
- `base/background-error-reverse` = `#ef4444` — misc red badge

### Typography
- `typography/font family/font-sans` = "Inter" — mọi text
- `text 2x large/leading-normal/semibold` (24px/32px/700) — Page title "Tải lên danh mục sản phẩm"
- `text large/leading-normal/semibold` (18px/28px/700) — Section title "Thông tin cơ bản"
- `text base/leading-normal/semibold` (16px/24px/700) — Button label, table header
- `text small/leading-normal/semibold` (14px/20px/600) — Filter tab label, FileItem filename
- `text small/leading-normal/medium` (14px/20px/500) — Body text, download link, toast text
- `text small/leading-normal/regular` (14px/20px/400) — Table cell text, search placeholder
- `text extra small/leading-normal/regular` (12px/16px/400) — DropZone sub-text, FileItem size, filter numbers

### Spacing (Tailwind 4px scale)
- `spacing/0-5` = 2 (2px)
- `spacing/1` = 4
- `spacing/1-5` = 6
- `spacing/2` = 8
- `spacing/2-5` = 10
- `spacing/3` = 12
- `spacing/4` = 16
- `spacing/5` = 20
- `spacing/6` = 24
- `spacing/8` = 32
- `spacing/12` = 48

### Sizes (heights)
- `height/h-4` = 16 · `height/h-5` = 20 · `height/h-9` = 36 (button default, input) · `height/h-10` = 40
- `width/w-4` = 16 · `width/w-5` = 20 · `width/w-9` = 36 · `width/w-10` = 40

### Border radius
- `border radius/md` = 6 → most controls (button, input, fileitem, toast, dropzone, pagination button)
- `border radius/lg` = 8 → possibly section wrapper (verify — PNG doesn't clearly show wrapper radius)
- `border radius/full` = 9999 → circle icon bg, pill nav item

### Shadow
- `shadow/sm` = drop-shadow (0, 1, 2, 0, `#0000000D`) → toast subtle shadow
- `shadow/base` = drop-shadow multi (0,1,2 + 0,1,3) → button subtle
- `shadow/lg` = drop-shadow multi (0,4,6,-2 + 0,10,15,-3, `#0000001A`) → dialog (not used here as no dialog)

### Overlay
- `overlay/90` = `#0000001a` — dialog overlay (not applicable — no dialog in wave04 flow, but token present in section)
- `opacity/opacity-50` = 50 — disabled state

---

## Screenshots

> `assets/wave04-cat-prod-import/`
- `14601-133301-step1-empty.png` — Step 1 empty state (page load, DropZone empty, no page-header actions)
- `14601-133897-step1-uploaded.png` — Step 1 uploaded (FileItem visible below DropZone)
- `14601-134126-step2-preview.png` — Step 2 preview (FilterRow + Table + Pagination + page-header actions "Huỷ bỏ"/"Xác nhận")
- `14601-135187-result-toast.png` — Success toast top-right (post-import notification, page content hidden)

> **Section-level `_full.png` NOT fetched**: root section `14146:87154` width = 9393px (× 4.6 downscale nếu single-shot) — triggers per-frame rule (`_ref-figma-mcp-tools.md` §3.1.1). Per-frame PNG native 1440-wide đủ visual fidelity.

---

## Notes (oracle interpretation, không phải fact để verify)

- **Wave04 vs wave03 flow change**: Wave03 = **dialog overlay** (small dialog upload → large dialog preview → toast). Wave04 = **full-page wizard** (page 1 upload → page 2 preview với header actions → toast). Route mới cần thiết (`/inventory/catalog/products/import` hoặc tương tự), không còn dùng `<Dialog>` shadcn.
- **Header actions Step 2 only**: "Huỷ bỏ" + "Xác nhận" chỉ hiện ở page-header khi ở Step 2 (đã có preview data). Step 1 không có action button ở page header (chỉ có back arrow). Verify: DEV nên implement page-header conditional render theo step.
- **DropZone + FileItem persist across steps**: Step 2 vẫn hiển thị DropZone + FileItem — user có thể re-upload file khác. Verify: khi re-upload có reset preview table không? (per FEAT AC-7 "Quay lại" → về Step 1, nhưng nếu re-upload từ Step 2 thì behavior thế nào?)
- **Sub-text file support Figma vs FEAT mismatch**: Figma PNG "Hỗ trợ file: .xls, .xlsx, .csv" nhưng FEAT AC-3b "file không phải `.xlsx` → báo lỗi". DEV theo FEAT (chỉ `.xlsx`); cập nhật sub-text hoặc yêu cầu BA chốt lại wording (verify với BA).
- **AC-6 button "Xác nhận" state**: FEAT AC-6 "chỉ ghi các dòng hợp lệ, bỏ qua dòng lỗi" — implies button có thể enable ngay cả khi có dòng lỗi (khác wave03 disable khi có lỗi). Verify: DEV cho phép click "Xác nhận" khi có dòng lỗi + skip; hoặc disable + force fix (per FEAT strict).
- **AC-8 "Kết quả import" screen chưa capture**: Figma frame `14601:135187` tên `FEAT-CAT-PROD-IMPORT` chứa Popup/Dialog Overlay + Toast — screenshot chỉ visible toast + gray bg (Page content hidden). FEAT AC-8 mô tả metrics dashboard (Tạo mới / Cập nhật / Bỏ qua-lỗi / Thời gian + "Tải file lỗi" / "Đóng") — screen này chưa có trong Figma frame observed. DEV cần fallback: (a) implement per AC-8 spec, (b) verify với BA có Figma frame riêng nào không, (c) reuse wave03 pattern nếu áp dụng được.
- **Filter tab "Lỗi" behavior**: khi filter "Lỗi", table hiển thị chỉ dòng invalid — verify DEV render cột "Trạng thái" / "Lý do lỗi" visible (per FEAT AC-4). Có thể cột này ẩn khi "Tất cả" hiện tại (Lỗi: 0).
- **Filter tab "Hợp lệ"**: verify chỉ hiển thị dòng valid — hidden invalid rows.
- **Search behavior**: placeholder "Tìm theo mã nội bộ, tên sản phẩm" → search cross 2 cột? Or search full? Verify.
- **"Tải file lỗi" button**: FEAT AC-9 button ở màn kết quả nhưng Figma render trong FilterRow của Step 2 preview → cho phép download file lỗi ngay từ preview (không phải chỉ sau import). Verify BA — có thể button visible cả 2 chỗ.
- **Numbers "40 · 40 · 0"** = sample: Tổng 40 dòng, Hợp lệ 40, Lỗi 0 → matches pagination (5 rows/page × 8 pages). Real data từ backend.
- **Table cột 10 (Nhóm sản...)**: truncated trong viewport. FEAT AC-2 template gọi là "Nhóm sản phẩm" — verify verbatim cột header với BR-CAT-PROD-018 (canonical "Nhóm vật tư/hàng hoá"). Có thể là truncated "Nhóm sản phẩm" hoặc "Nhóm vật tư/hàng hoá" (13 chars vs 22 chars — cần scroll horizontal PNG for confirmation).
- **Table columns beyond viewport**: Metadata cho thấy 13 cột tổng cộng (60 + 185 + 178 + 120 + 180 + 120 + 120 + 180 + 180 + 168 + 168 + 154 + 168 = 1981px — vượt page width 1216px). Verify horizontal scroll behavior + sticky first column (STT?).
- **Interaction states (drag-over / hover / focus)**: Figma không capture — DEV theo shadcn baseline. Drag-over DropZone: verify `border-solid brand-CD` hoặc `bg-info-bg` highlight per web-component-registry.
- **Toast auto-dismiss**: Figma không capture timing — verify FEAT / UX-FLOW (thường 3-5s).
- **Boundary + Route**: agent-test-ui cần verify route (page URL) — có thể `/inventory/catalog/products/import` hoặc `/inventory/products/import`. Đối chiếu FEAT-CAT-PROD-LIST oracle + UX-FLOW-INVENTORY-CATALOG §3.2.
