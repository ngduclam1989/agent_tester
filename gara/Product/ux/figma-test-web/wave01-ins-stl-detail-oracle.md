---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13255-177002&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13255:177002"
fetched_at: 2026-06-04T07:45:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: success (partial — output > token limit, đọc qua file đã lưu + jq)
  get_variable_defs: success
  get_design_context: success (AC-5 cost table > token limit — trích text qua file đã lưu)
  get_screenshot: success
data_completeness:
  screen_inventory: complete
  component_inventory: complete
  variant_state: complete
  text_content: complete
  design_tokens: complete
  interaction_states: partial (Figma chỉ có state default mỗi tab; không có hover/focus/disabled cho tab/button/row)
screenshots:
  - assets/wave01-ins-stl-detail/_full.png
  - assets/wave01-ins-stl-detail/13262-56407.png
  - assets/wave01-ins-stl-detail/13256-45316.png
  - assets/wave01-ins-stl-detail/13262-56411.png
  - assets/wave01-ins-stl-detail/13257-550593.png
  - assets/wave01-ins-stl-detail/13256-46273-tab-chungtu.png
  - assets/wave01-ins-stl-detail/13256-47395-tab-hosobh.png
  - assets/wave01-ins-stl-detail/13257-465756-tab-lichsutt.png
design_vs_feat_notes:
  - "AC-1 nút hành động #2: Figma render 'Xuất hồ sơ bảo hiểm (PDF)' — FEAT AC-1/AC-12 + BR-002 gọi là 'In toàn bộ hồ sơ'. Tên label hiển thị khác tên trong FEAT (cùng chức năng in/xuất)."
  - "AC-1 KHÔNG còn nút 'Button' placeholder (FEAT AC-1 nhắc bỏ qua placeholder — design mới đã loại)."
  - "AC-4 tab #2: Figma 'Chứng từ & hóa đơn' (FEAT viết 'Chứng từ & hoá đơn' — biến thể chính tả hoá/hóa)."
  - "AC-3: Figma tách 'Dòng xe' (Camry) + 'Hãng xe' (Toyota) thành 2 trường; FEAT AC-3 mô tả 'Hãng xe' gộp (vd Honda - Civic). Field labels Figma: Tên khách hàng / Số điện thoại / Loại khách hàng / Biển số xe / Dòng xe / Hãng xe / Số km đã chạy."
  - "AC-6 panel 'Phân bổ Bảo hiểm': KHÔNG có dấu +/− và màu xanh/đỏ (giống FEAT-INS-SO-ADJUSTMENT AC-10). Header khối 3 ghi 'Cần thanh toán' (typo — FEAT: 'Cân thanh toán')."
  - "AC-9 'Lịch sử thanh toán': frame Figma hiển thị EMPTY state ('Không tồn tại bản ghi!') — KHÔNG render bảng có dữ liệu (cột Ngày/Số tiền/Phương thức/Ghi chú/File theo FEAT AC-9 là component baseline). Verify bảng populated theo baseline FEAT-STL-DETAIL."
  - "AC-2 có nút 'In phiếu' (outline sm, icon arrow-down) ở góc phải khối 'Thông tin quyết toán' — không nêu trong FEAT AC-2 (baseline section action)."
---

# Oracle — FEAT-INS-STL-DETAIL (web) · wave 01

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13255:177002`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **"Chi tiết phiếu quyết toán bảo hiểm"** (loại Bảo hiểm) —
> 4 trạng thái = 4 tab. Phần MỚI so với phiếu QT KH baseline: tab "Hồ sơ bảo hiểm đã xuất" + "Lịch sử thanh toán"
> + panel "Tổng giá dịch vụ" có phân bổ BH (AC-6, mirror SO-ADJUSTMENT).

---

## Screen Inventory

| Screen state (tab active) | nodeId | size | screenshot |
|---|---|---|---|
| Tab "Bảng chi phí" (mặc định) | 13256:45155 | 1440×2400 | assets/wave01-ins-stl-detail/_full.png |
| Tab "Chứng từ & hóa đơn" (empty) | 13256:46273 | 1440×1168 | assets/wave01-ins-stl-detail/13256-46273-tab-chungtu.png |
| Tab "Hồ sơ bảo hiểm đã xuất" | 13256:47395 | 1440×1667 | assets/wave01-ins-stl-detail/13256-47395-tab-hosobh.png |
| Tab "Lịch sử thanh toán" (empty) | 13257:465756 | 1440×1168 | assets/wave01-ins-stl-detail/13257-465756-tab-lichsutt.png |

> 4 frame = **cùng 1 màn**, khác nhau ở tab đang active (header + thông tin quyết toán + thông tin KH&xe giống nhau).
> Header + 2 khối thông tin + thanh tab GIỐNG HỆT mọi state → mô tả 1 lần (lấy từ state "Bảng chi phí" 13256:45155).

### Section-container in-scope

| Section | nodeId | size | screenshot |
|---|---|---|---|
| Nhóm A — Header + Thông tin quyết toán + Thông tin KH&xe (AC-1/2/3) | 13262:56407 | 1216×480 | assets/wave01-ins-stl-detail/13262-56407.png |
| AC-4 — Thanh 4 tab | 13256:45316 | 1216×56 | assets/wave01-ins-stl-detail/13256-45316.png |
| AC-5 — Bảng chi phí (Dịch vụ thực hiện + Phụ tùng sử dụng) | 13262:56411 | 1216×792 | assets/wave01-ins-stl-detail/13262-56411.png |
| AC-6 — Panel "Tổng giá dịch vụ" (phân bổ BH) | 13257:550593 | 600×816 | assets/wave01-ins-stl-detail/13257-550593.png |
| AC-7 — Tab "Chứng từ & hóa đơn" (empty state) | 13256:48512 | 1216×400 | assets/wave01-ins-stl-detail/13256-46273-tab-chungtu.png |
| AC-8 — Tab "Hồ sơ bảo hiểm đã xuất" | 13256:230242 | — | assets/wave01-ins-stl-detail/13256-47395-tab-hosobh.png |
| AC-9 — Tab "Lịch sử thanh toán" (empty state) | 13257:465918 | — | assets/wave01-ins-stl-detail/13257-465756-tab-lichsutt.png |

---

## Component Inventory

### Section: Nhóm A — Header (13262:56407)
- AC-1: Button (Ghost, icon) × 1 — back arrow-left 20px · Heading × 1 (mã phiếu) · Badge (Warning) × 1 — "Chờ thanh toán"
- AC-1: Button × 3 (action bar) — "Chỉnh sửa" (Outline, edit icon 16px) · "Xuất hồ sơ bảo hiểm (PDF)" (Outline) · "Tạo hồ sơ bảo hiểm" (Default/brand)
- AC-2: Title text × 1 "Thông tin quyết toán" + Button (Outline sm) "In phiếu" · Infor Item × 6 (label + value) · Badge (purple) "Bảo hiểm" (Bên thanh toán) · link value (#PHDV…) brand
- AC-3: Title text × 1 "Thông tin khách hàng & xe" · Infor Item × 6 (label + value)

### Section: AC-4 Thanh tab (13256:45316)
- Tab Nav Link × 4 — 1 active (brand + border-b-2) + 3 inactive (muted)

### Section: AC-5 Bảng chi phí (13262:56411)
- Title text × 2 — "Dịch vụ thực hiện" / "Phụ tùng sử dụng"
- Table (Head + Cell) × 2 bảng — cột: STT · Tên dịch vụ/Tên phụ tùng · Phân khúc · Đơn vị tính · Bên thanh toán · Người thực hiện · Đơn giá · Số lượng · Chiết khấu · Khấu hao VT · Thuế · Thành tiền
- Badge "Bên thanh toán" trong cell — "I - Bảo hiểm" / "C- Khách hàng"
- Pagination (theo FEAT AC-5 — phân trang; data-bound)

### Section: AC-6 Panel "Tổng giá dịch vụ" (13257:550593)
- (giống FEAT-INS-SO-ADJUSTMENT Nhóm C) Title × 1 + Section header × 3 + Table Head × 3 + Table Cell read-only. Không control.

### Tab content phụ
- AC-7 (13256:48512): empty-state (icon + 2 dòng text) — reuse baseline
- AC-8 (13256:230242): Document set container × N (title card + danh sách "Upload / item" PDF + badge "Đã xuất") · preview pane PDF + nút "Xem PDF" — **nội dung thuộc FEAT-INS-DOSSIER-VIEW**
- AC-9 (13257:465918): empty-state (icon + 2 dòng text) — bảng lịch sử là component baseline

---

## Variant & State

### Badge "Chờ thanh toán" (header AC-1)
- variant: Warning — bg `#fff7ed` (background-warning) · text `#ea580c` (foreground-warning) · rounded-lg 8px · 14px medium

### Badge "Bảo hiểm" (AC-2 Bên thanh toán)
- variant: New (purple) — bg `#faf5ff` (purple/50) · text `#a855f7` (purple/500) · rounded-lg 8px · 14px medium
- ⚠ khác badge "Bảo hiểm" success (xanh) ở SO-ADJUSTMENT — ở đây dùng tím cho "Bên thanh toán = Bảo hiểm".

### Button action bar (AC-1)
- "Chỉnh sửa" / "Xuất hồ sơ bảo hiểm (PDF)": Outline, h-40, border `#d4d4d8`, px-8 (32) py-2, rounded-md, text `#18181b`/black 14px medium
- "Tạo hồ sơ bảo hiểm": Default/brand, h-40, bg `#0052ff`, text white 14px medium, drop-shadow

### Tab Nav Link (AC-4)
- active "Bảng chi phí": text `#0052ff` (brand) 18px semibold, border-b-2 `#0052ff`
- inactive 3 tab: text `#71717a` (muted) 18px semibold, không border
- container border-b `#e4e4e7`; mỗi tab px-3 py-2, py-1.5 wrapper

### Badge "Bên thanh toán" trong bảng (AC-5)
- "I - Bảo hiểm" / "C- Khách hàng" — chip phân biệt nguồn TT (verify presence + wording; màu xác nhận qua screenshot)

### "Tổng thanh toán" value (AC-6)
- 20px / 600 · color `#0052ff` (brand) — dòng nhấn

### States chưa có trong Figma
- ⚠ Không có variant hover/focus/disabled cho tab/button/row, không có state phiếu CANCEL (nút "Tạo hồ sơ bảo hiểm" chỉ hiện khi DRAFT — BR-004; verify theo FEAT). Verdict interaction theo baseline shadcn + FEAT.

---

## Text Content

### Header AC-1 (13262:56407)
- "#SET-20260326-00001"   ← mã phiếu (data-bound format `#SET-yyyyMMdd-NNNNN`)
- "Chờ thanh toán"        ← badge trạng thái
- "Chỉnh sửa" · "Xuất hồ sơ bảo hiểm (PDF)" · "Tạo hồ sơ bảo hiểm"   ← 3 nút hành động

### AC-2 "Thông tin quyết toán"
- "Thông tin quyết toán" (tiêu đề) · "In phiếu" (nút)
- Labels: "Phiếu dịch vụ liên kết" · "Bên thanh toán" · "Người tạo" · "Ngày tạo" · "Cập nhật lần cuối" · "Ghi chú quyết toán"
- Values mẫu (data-bound — verify format/sự hiện diện, KHÔNG verify giá trị): "#PHDV-20240723-001" (link brand) · Badge "Bảo hiểm" · "Chủ doanh nghiệp" · "29/01/2026 13:00" · "29/01/2026 13:00 (Nguyễn Văn A)" · "Chờ bảo hiểm duyệt giá lọc dầu"

### AC-3 "Thông tin khách hàng & xe"
- "Thông tin khách hàng & xe" (tiêu đề)
- Labels: "Tên khách hàng" · "Số điện thoại" · "Loại khách hàng" · "Biển số xe" · "Dòng xe" · "Hãng xe" · "Số km đã chạy"
- Values mẫu: "Nguyễn Minh Tâm" · "0942328562" · "Tổ chức" · "25B2-09284" · "Camry" · "Toyota" · "1.000"

### AC-4 Thanh tab
- "Bảng chi phí" · "Chứng từ & hóa đơn" · "Hồ sơ bảo hiểm đã xuất" · "Lịch sử thanh toán"

### AC-5 Bảng chi phí — header cột
- "Dịch vụ thực hiện" · "Phụ tùng sử dụng" (tiêu đề 2 bảng)
- Cột: "STT" · "Tên dịch vụ" / "Tên phụ tùng" · "Phân khúc" · "Đơn vị tính" · "Bên thanh toán" · "Người thực hiện" · "Đơn giá" · "Số lượng" · "Chiết khấu" · "Khấu hao VT" · "Thuế" · "Thành tiền" · "Tổng"
- Chip nguồn TT: "I - Bảo hiểm" · "C- Khách hàng"; phân khúc mẫu "Cao cấp"; đơn vị mẫu "Cái"; "0%" (chiết khấu/khấu hao)

### AC-6 Panel "Tổng giá dịch vụ"
- "Tổng giá dịch vụ" · "Chi tiết theo bên thanh toán"
- "Khoản mục" · "Bảo hiểm thanh toán" · "Khách hàng thanh toán"   ← 3 header cột
- "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT"
- "Phân bổ Bảo hiểm" → "CK liên kết BH — Vật tư" · "CK liên kết BH — Công dịch vụ" · "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH"
- "Cần thanh toán" (⚠ typo) → "Bảo hiểm thanh toán" · "Khách hàng thanh toán" · "Tổng thanh toán"

### AC-7 / AC-9 empty state
- "Không tồn tại bản ghi!"
- "Vui lòng thêm mới bản ghi để bảng dữ liệu được hiển thị."

### AC-8 "Hồ sơ bảo hiểm đã xuất"
- "Bộ hồ sơ #SET-20260326-00001" (title card mỗi bộ) · "Phiếu quyết toán bảo hiểm" / "Phiếu quyết toán.pdf" (file) · badge "Đã xuất" · "Xem PDF"
- (chi tiết wording thuộc FEAT-INS-DOSSIER-VIEW)

### Footer (mọi state)
- "Phần mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Header AC-1
- Mã phiếu: 24px / 600 / lh 32px → `text-2xl font-semibold` · `#18181b`
- Action button text: 14px / 500 → `text-sm font-medium`; nút brand text white `#0052ff` bg
- Badge "Chờ thanh toán": 14px / 500 · bg `#fff7ed` → `bg-background-warning` · text `#ea580c` → `text-foreground-warning`
- spacing: action buttons gap=8 (`gap-2`), h-40 (`h-10`), px-8 (`px-8`=32), py-2

### AC-2 / AC-3 Info blocks
- Tiêu đề khối: 18px / 600 / lh 28px → `text-lg font-semibold` · `#18181b`
- Label: 14px / 400 / lh 20px → `text-sm` · `#71717a` → `text-muted-foreground`
- Value: 14px / 500 / lh 20px → `text-sm font-medium` · `#000000`/`#18181b`; value link brand `#0052ff`
- "In phiếu": Outline sm, h-32 (`h-8`), px-3 py-2, text 12px (`text-xs`) medium, icon arrow-down 16px
- spacing: Title pb=16 (`pb-4`); block gap=24 (`gap-6`); Infor Item w=292px; cột gap=16 (`gap-4`)
- Badge "Bảo hiểm" (Bên TT): bg `#faf5ff` (purple/50) · text `#a855f7` (purple/500) · rounded-lg 8px

### AC-4 Tab
- Tab text: 18px / 600 / lh 28px → `text-lg font-semibold`
- active color `#0052ff` → `text-primary` + border-b-2 `#0052ff`; inactive `#71717a` → `text-muted-foreground`
- container border-b `#e4e4e7` → `border`; tab px=12 (`px-3`) py=8 (`py-2`); wrapper py=6 (`py-1.5`)

### AC-5 Bảng chi phí
- Header cell: 14px / 500 → `text-sm font-medium`; bg head `#f4f4f5` → `bg-accent`; border-b `#e4e4e7`
- Cell value: 14px / 400-500 · `#18181b`/`#000000`
- (cấu trúc bảng nhiều cột — verify cột + thứ tự + chip nguồn TT)

### AC-6 Panel "Tổng giá dịch vụ" (= SO-ADJUSTMENT Nhóm C)
- typography: tiêu đề 18px/600 → `text-lg font-semibold`; section header 14px/600 → `text-sm font-semibold` `#000000`; Table Head 14px/500; Cell value 14px/500 canh phải; "Tổng thanh toán" value **20px/600** `#0052ff` → `text-xl font-semibold text-primary`
- colors: Table Head bg `#f4f4f5` → `bg-accent`; border-b `#e4e4e7` → `border`; row Phân bổ/Cân TT bg `rgba(255,255,255,0.5)` (alpha/50)
- spacing: Title pb=16 (`pb-4`); header container p=8 (`p-2`) w-250; Head h-40 (`h-10`) px-2; Cell h-52 p-2; cột giá trị w-200 (`w-[200px]`), cột nhãn flex-1

### Tokens chung (file)
- font: Inter (`--font-sans`) · radius: `rounded-md` 6px / `rounded-lg` 8px
- colors: foreground `#18181b` · muted `#71717a` · brand `#0052ff` · border `#e4e4e7` · input `#d4d4d8` · accent `#f4f4f5` · success `#16a34a`/`#f0fdf4` · warning `#ea580c`/`#fff7ed` · purple `#a855f7`/`#faf5ff`
- shadow: `shadow-sm` (0 1px 2px rgba(0,0,0,.05)) · `shadow/base` (drop-shadow kép)

---

## Screenshots
> assets/wave01-ins-stl-detail/
- `_full.png` — toàn màn state "Bảng chi phí" (frame 13256:45155, 1229×2048 scaled)
- `13262-56407.png` — Nhóm A: Header + Thông tin quyết toán + Thông tin KH&xe (AC-1/2/3)
- `13256-45316.png` — AC-4: thanh 4 tab
- `13262-56411.png` — AC-5: bảng chi phí (Dịch vụ thực hiện + Phụ tùng sử dụng)
- `13257-550593.png` — AC-6: panel "Tổng giá dịch vụ" (phân bổ BH)
- `13256-46273-tab-chungtu.png` — state tab "Chứng từ & hóa đơn" (AC-7 empty)
- `13256-47395-tab-hosobh.png` — state tab "Hồ sơ bảo hiểm đã xuất" (AC-8)
- `13257-465756-tab-lichsutt.png` — state tab "Lịch sử thanh toán" (AC-9 empty)

---

## Coverage notes (oracle — non-blocking)
- **AC-8 "Hồ sơ bảo hiểm đã xuất"**: nội dung (document set + preview PDF) thuộc **FEAT-INS-DOSSIER-VIEW** — oracle này chỉ verify tab tồn tại + điều hướng; chi tiết conformance ở oracle FEAT-INS-DOSSIER-VIEW (wave 02).
- **AC-9 "Lịch sử thanh toán"**: Figma chỉ có empty state; bảng populated (Ngày/Số tiền/Phương thức/Ghi chú/File) = component baseline FEAT-STL-DETAIL → verify theo baseline.
- **AC-7 "Chứng từ & hoá đơn"**: reuse baseline (xem/thêm/xoá chứng từ) — Figma chỉ empty state.
- **AC-10/11/12/13** (quyền sửa, huỷ cascade, in toàn bộ, tạo hồ sơ): hành vi/nghiệp vụ — verify theo FEAT AC + UX-FLOW, không có state riêng trong Figma (nút "Tạo hồ sơ bảo hiểm" chỉ DRAFT — BR-004).
- 7 design-vs-FEAT discrepancy ghi ở frontmatter `design_vs_feat_notes`.
