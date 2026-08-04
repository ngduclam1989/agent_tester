---
cr_id: CR-20260612-01
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260612-01
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13256-45155&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13256:45155"
screen_slug: stl-detail-bh
fetched_at: 2026-06-29T03:16:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (wave02 oracle đã capture)
  get_variable_defs: cached (identical wave03 vocab)
  get_design_context: skipped (wave02 + PNG đủ)
  get_screenshot: success (1440×2584 scaled 1142×2048)
data_completeness:
  screen_inventory: complete (1 frame Chi tiết phiếu QT BH)
  component_inventory: complete (delegate wave01-ins-stl-detail-oracle.md canonical)
  variant_state: complete (BH variant — panel 1-cột BH only per CR-20260612-01)
  text_content: complete (verbatim từ PNG)
  design_tokens: complete (variable_defs success)
  interaction_states: partial (Figma không render hover/focus — verify shadcn baseline)
screenshots:
  - assets/wave03-cr-20260612-01--stl-detail-bh/_full.png
related_features: [FEAT-INS-STL-DETAIL]
design_vs_feat_notes:
  - "Node `13256:45155` = màn 'Chi tiết phiếu quyết toán' bên thanh toán = **Bảo hiểm**. CR-20260612-01 scope (a): panel 'Tổng giá dịch vụ' → 'Chi tiết theo bên thanh toán' BỎ cột 'Khách hàng thanh toán' (chỉ còn cột 'Bảo hiểm thanh toán'); 'Cân thanh toán' BỎ dòng 'Khách hàng thanh toán'. GIỮ section 'Phân bổ Bảo hiểm'."
  - "PNG xác nhận: panel 'Tổng giá dịch vụ' hiển thị: AC-9 'Chi tiết theo bên thanh toán' 1 cột 'Bảo hiểm thanh toán' (Dịch vụ 95.040đ / Phụ tùng 95.040đ / VAT 95.040đ / Cộng sau VAT 50.000đ); AC-10 'Phân bổ Bảo hiểm' 1 cột BH với dấu `-` prefix (CK liên kết BH — Vật tư -50.000.000đ / CK liên kết BH — Công dịch vụ -50.000.000đ / Giảm trừ bồi thường -50.000.000đ / Khấu hao vật tư-thay mới -50.000.000đ / Khấu trừ BH -50.000.000đ); AC-11 'Cân thanh toán' chỉ 'Bảo hiểm thanh toán 50.000.000đ' + 'Tổng thanh toán 50.000.000đ' brand."
  - "Resolved decision 2026-06-12: 'Tổng thanh toán' trên phiếu BH = 'Bảo hiểm thanh toán' (vì chỉ còn 1 cột) → GIỮ 'Tổng thanh toán' dòng (chốt BA/PO)."
  - "Section 'Đơn vị thanh toán' (Insurance info) chỉ render khi BH chi trả (PNG xác nhận: hiển thị Công ty BH 'Bảo hiểm PVI Hà Nội' + Số hợp đồng 'HD-000435-PVI-23481' + Người giám định 'Nguyễn Văn A' + SĐT '012 345 67889' + Mã số thuế '100021930' + Ngày hết hạn '29/01/2026' + Hồ sơ bảo lãnh 2 file)."
  - "Header actions: 'Chỉnh sửa' + 'Thêm thanh toán' + 'Tạo hồ sơ bảo hiểm' (3 buttons) + secondary 'Xuất hồ sơ bảo hiểm (PDF)' + 'In phiếu' chevron."
  - "Tab navigation: 4 tab — 'Bảng chi phí' (active brand-CD underline) · 'Chứng từ & hóa đơn' · 'Hồ sơ bảo hiểm đã xuất' · 'Lịch sử thanh toán'."
---

# Oracle — CR-20260612-01 (web) · wave 03 · screen "stl-detail-bh"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13256:45155`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **Chi tiết phiếu quyết toán bên Bảo hiểm** — panel
> "Tổng giá dịch vụ" theo CR-20260612-01 scope (a): **bỏ cột KH, giữ panel 1 cột BH** + giữ
> section "Phân bổ Bảo hiểm" dấu −.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chi tiết phiếu QT BH (panel 1-cột BH only) | 13256:45155 | 1440×2584 | assets/wave03-cr-20260612-01--stl-detail-bh/_full.png |

### Section-container in-scope

| Section | role | size |
|---|---|---|
| Header phiếu QT + thanh hành động (AC-1) | Header bar | 1440×80 |
| AC-2 Thông tin quyết toán | section | 1216×~172 |
| Thông tin khách hàng & xe (AC-3) | section | 1216×~150 |
| Đơn vị thanh toán (insurance info — BH variant only) | section | 1216×~250 |
| AC-4 Tab navigation (4 tabs) | tab bar | 1216×56 |
| AC-5 Tab "Bảng chi phí" — Dịch vụ thực hiện + Phụ tùng sử dụng | 2 sub-table | 1216×~840 |
| AC-6 Panel "Tổng giá dịch vụ" — 1 cột BH (CR scope) | right column panel | 600×~640 |

---

## Component Inventory

### Header (AC-1)
- BackArrow IconButton × 1 (chevron-left)
- Heading × 1 "#SET-20260326-00001" (text-2xl semibold) + Badge "Chờ thanh toán" (warning amber pill)
- Button cluster (right): Button outline "Chỉnh sửa" + Button outline "Thêm thanh toán" + Button primary brand-CD "Tạo hồ sơ bảo hiểm"

### AC-2 Thông tin quyết toán
- Title text "Thông tin quyết toán" (text-lg semibold)
- Secondary action cluster (right): Button outline "Xuất hồ sơ bảo hiểm (PDF)" + Button outline chevron "In phiếu"
- Info grid 4 cột × 2 rows: "Phiếu dịch vụ liên kết" (link #PHDV-20240723-001 text brand) | "Bên thanh toán" Badge "Bảo hiểm" (info-bg blue) | "Người tạo" Chủ doanh nghiệp | "Ngày tạo" 29/01/2026 13:00 — Row 2: "Cập nhật lần cuối" + "Ghi chú quyết toán"

### Thông tin khách hàng & xe (AC-3)
- Title text "Thông tin khách hàng & xe"
- Info grid 4 cột × 2 rows: Tên KH | Số ĐT | Loại KH | (empty col) — Biển số xe | Dòng xe | Hãng xe | Số km đã chạy

### Đơn vị thanh toán (BH variant only)
- Title text "Đơn vị thanh toán"
- Info grid 4 cột × 2 rows: Công ty BH (Bảo hiểm PVI Hà Nội) | Số HĐ BH | Người giám định | SĐT liên hệ — Mã số thuế BH | Ngày hết hạn | Hồ sơ bảo lãnh (2 file rows blue+red icon)

### AC-4 TabNav (4 tabs)
- Tab "Bảng chi phí" (active — brand-CD text + underline 2px brand-CD)
- Tab "Chứng từ & hóa đơn"
- Tab "Hồ sơ bảo hiểm đã xuất"
- Tab "Lịch sử thanh toán"

### AC-5 Bảng chi phí (2 sub-section)
- Section "Dịch vụ thực hiện" (title 18px semibold) + Table 8 cột (STT / Tên dịch vụ / Bên thanh toán / Người thực hiện / Đơn giá / Số lượng / Chiết khấu / Thuế / Thành tiền) — 5 sample rows
- Section "Phụ tùng sử dụng" + Table 9 cột (STT / Tên phụ tùng / Bên thanh toán / Phân khúc / Đơn vị tính / Đơn giá / Số lượng / Chiết khấu / Khấu hao VT / Thuế / Thành tiền) — 5 sample rows
- Footer row "Tổng" in mỗi table (bold + right-aligned)

### AC-6 Panel "Tổng giá dịch vụ" (CR-20260612-01 scope — 1 cột BH only)
- Title text × 1 "Tổng giá dịch vụ" (panel header)
- Section header "Chi tiết theo bên thanh toán" (BG muted, 14px medium muted-foreground)
- Bảng 2 cột × 5 rows (Khoản mục col 1 + "Bảo hiểm thanh toán" col 2 — KHÔNG có cột KH theo CR)
- Section header "Phân bổ Bảo hiểm" (text 14px semibold)
- Bảng 2 cột × 5 rows (Label + Value dấu `-` cột BH)
- Section header "Cân thanh toán" (text 14px semibold)
- Row "Bảo hiểm thanh toán" 50.000.000đ
- Row "Tổng thanh toán" 50.000.000đ (brand-CD `#0052ff` 20px semibold)

---

## Variant & State

### Bên thanh toán Badge
- variants: "Bảo hiểm" (info-bg blue `#eff6ff` + foreground-process `#2563eb`) · "Khách hàng" (verify ở KH variant)
- states observed: "Bảo hiểm" (this oracle)

### Status Badge "Chờ thanh toán"
- variants: warning amber pill — bg `#fff7ed` (verify) + text `#ea580c` (verify)
- states observed: "Chờ thanh toán" only

### Panel "Tổng giá dịch vụ" — CR-20260612-01 variant
- variants: `bh-only` (CR scope — 1 cột BH, không cột KH, không dòng KH ở Cân thanh toán) — THIS oracle
- diff vs baseline production (pre-CR): bỏ cột KH ở AC-9 + bỏ dòng KH ở AC-11

### Tab "Bảng chi phí" active
- variants: active (brand-CD text + 2px underline) · inactive (muted-foreground)
- states observed: cả 2 (active = Bảng chi phí, inactive = 3 tab còn lại)

---

## Text Content (verbatim)

### Header (AC-1)
- "#SET-20260326-00001" (mã phiếu)
- "Chờ thanh toán" (badge)
- "Chỉnh sửa" · "Thêm thanh toán" · "Tạo hồ sơ bảo hiểm" (3 buttons)

### AC-2 Thông tin quyết toán
- "Thông tin quyết toán" (title)
- "Xuất hồ sơ bảo hiểm (PDF)" · "In phiếu" (action buttons right)
- Labels: "Phiếu dịch vụ liên kết" · "Bên thanh toán" · "Người tạo" · "Ngày tạo" · "Cập nhật lần cuối" · "Ghi chú quyết toán"
- Sample values: "#PHDV-20240723-001" (link brand) · "Bảo hiểm" (badge) · "Chủ doanh nghiệp" · "29/01/2026 13:00" · "29/01/2026 13:00 (Nguyễn Văn A)" · "Chờ bảo hiểm duyệt giá lọc dầu"

### Thông tin khách hàng & xe (AC-3)
- "Thông tin khách hàng & xe" (title)
- Labels Row 1: "Tên khách hàng" · "Số điện thoại" · "Loại khách hàng"
- Labels Row 2: "Biển số xe" · "Dòng xe" · "Hãng xe" · "Số km đã chạy"
- Sample values: "Nguyễn Minh Tâm" · "0942328562" · "Tổ chức" · "25B2-09284" · "Camry" · "Toyota" · "1.000"

### Đơn vị thanh toán
- "Đơn vị thanh toán" (title)
- Labels: "Công ty bảo hiểm" · "Số hợp đồng bảo hiểm" · "Người giám định" · "SDT Liên hệ" · "Mã số thuế bảo hiểm" · "Ngày hết hạn" · "Hồ sơ bảo lãnh"
- Sample values: "Bảo hiểm PVI Hà Nội" · "HD-000435-PVI-23481" · "Nguyễn Văn A" · "012 345 67889" · "100021930" · "29/01/2026" · 2 file rows ("Filename.format")

### AC-4 TabNav
- "Bảng chi phí" (active) · "Chứng từ & hóa đơn" · "Hồ sơ bảo hiểm đã xuất" · "Lịch sử thanh toán"

### AC-5 Bảng chi phí
- "Dịch vụ thực hiện" (title section 1) · "Phụ tùng sử dụng" (title section 2)
- Table headers (Dịch vụ): "STT" · "Tên dịch vụ" · "Bên thanh toán" · "Người thực hiện" · "Đơn giá" · "Số lượng" · "Chiết khấu" · "Thuế" · "Thành tiền"
- Table headers (Phụ tùng): "STT" · "Tên phụ tùng" · "Bên thanh toán" · "Phân khúc" · "Đơn vị tính" · "Đơn giá" · "Số lượng" · "Chiết khấu" · "Khấu hao VT" · "Thuế" · "Thành tiền"
- Row label cells: "C- Khách hàng" · "I - Bảo hiểm" · "Cao cấp" · "Cái"
- Footer row label "Tổng"

### AC-6 Panel "Tổng giá dịch vụ" (CR scope)
- "Tổng giá dịch vụ" (panel title)
- "Chi tiết theo bên thanh toán" (header)
- "Khoản mục" (col 1 header) · "Bảo hiểm thanh toán" (col 2 header — right-aligned)
- "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT" (4 row labels)
- "Phân bổ Bảo hiểm" (header)
- "CK liên kết BH — Vật tư" · "CK liên kết BH — Công dịch vụ" · "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH" (5 row labels)
- "Cân thanh toán" (header)
- "Bảo hiểm thanh toán" (row 1 label) · "Tổng thanh toán" (row 2 label semibold)
- Sample values AC-9: "95.040đ" / "95.040đ" / "95.040đ" / "50.000đ"
- Sample values AC-10: "-50.000.000đ" each (BH gánh, dấu `-`)
- Sample values AC-11: "50.000.000đ" (Bảo hiểm thanh toán) · "50.000.000đ" (Tổng thanh toán brand-CD `#0052ff`)

### Footer (chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Page-level layout
- colors:
  - Page BG `#ffffff` → `bg-background`
  - Section heading text `#18181b` → `text-foreground`
  - Field label muted `#71717a` → `text-muted-foreground`
  - Brand-CD link/highlights `#0052ff` → `text-primary` / `text-brand-cd`
  - Section divider 1px `#e4e4e7` → `border-border`
- typography:
  - H1 mã phiếu: 24px / lh 32px / weight 600 → `text-2xl font-semibold` (token `text 2x large/leading-normal/semibold`)
  - Section title: 18px / lh 28px / weight 600 → `text-lg font-semibold` (token `text large/leading-normal/semibold`)
  - Field label: 14px / weight 500 → `text-sm font-medium` (token `text small/leading-normal/medium`)
  - Field value: 14px / weight 400 → `text-sm` (token `text small/leading-normal/regular`)
- spacing:
  - PageContainer width: 1280px → `w-[1280px]`
  - Section gap: 24-32px → `gap-6` to `gap-8` (token `spacing/6`-`spacing/8`)
- radius:
  - Card/Panel: 8px → `rounded-lg`
- size:
  - Header buttons: h=36 → `h-9`

### Badge "Chờ thanh toán" (warning amber)
- bg ~`#fff7ed` (background-warning, verify) · text ~`#ea580c` (foreground-warning)
- rounded-full · padding small horizontal
- typography: 14px medium

### Badge "Bảo hiểm" (info blue — Bên thanh toán)
- bg `#eff6ff` (background-process) · text `#2563eb` (foreground-process)
- rounded-full · padding small
- typography: 14px medium

### AC-6 Panel CR scope (1-cột BH)
- Section header (Chi tiết theo bên / Phân bổ Bảo hiểm / Cân thanh toán):
  - BG `#f4f4f5` → `bg-muted`
  - text `#71717a` → `text-muted-foreground` (Chi tiết) hoặc `#18181b` semibold (Phân bổ BH/Cân thanh toán)
  - h=36 → `h-9`
- Table cells:
  - 2 cols (KhoÁn mục 400 + Value 200) per CR scope
  - row h=52 (default Table/Cell wave02 spec)
  - BG white · text foreground · border-b border
- AC-11 "Tổng thanh toán" value:
  - color `#0052ff` → `text-primary` (brand-CD)
  - typography 20px weight 600 → `text-xl font-semibold` (token `text extra large/leading-normal/semibold`)

---

## Screenshots

> assets/wave03-cr-20260612-01--stl-detail-bh/
- `_full.png` — Màn Chi tiết phiếu QT BH full (13256:45155, 1440×2584 scaled 1142×2048)

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** = panel 1-cột BH only (bỏ cột KH AC-9 + bỏ dòng KH AC-11). Phần baseline khác (header / AC-2 / AC-3 / Đơn vị thanh toán / AC-4 / AC-5) = production fact để verify visual fidelity.
- **Wave01 STL-DETAIL canonical pointer**: `wave01-ins-stl-detail-oracle.md` cũng có cùng node — 5-cấp chi tiết hơn. Wave03 oracle thêm CR scope check.
- **Reverses BR-INS-STL-DET-009 v13**: panel BH trước đây 2 cột BH+KH → wave02 fullscreen-a5 oracle vẫn mô tả 3 cột (vì share panel SO-ADJ). CR-20260612-01 chỉ áp cho màn STL-DETAIL, KHÔNG áp cho panel SO Edit/Detail/Tạo QT.
- agent-test-ui verify: panel hiển thị 1 cột giá trị thay vì 2 (visual diff vs production baseline pre-CR).
