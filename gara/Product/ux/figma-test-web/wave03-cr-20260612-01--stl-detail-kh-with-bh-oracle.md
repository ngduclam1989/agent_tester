---
cr_id: CR-20260612-01
cr_anchor: Tracking/CHANGE-REQUESTS.md#CR-20260612-01
platform: web
boundary: garage-web
figma_url: https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=13354-56440&m=dev
file_key: "EMGjGsnAJzGoGwTSK7dTuZ"
node_id: "13354:56440"
screen_slug: stl-detail-kh-with-bh
fetched_at: 2026-06-29T03:17:00+07:00
oracle_version: 1
mcp_tools_used:
  get_metadata: skipped (visual diff vs other STL-DETAIL screens captured via PNG)
  get_variable_defs: cached (identical wave03 vocab)
  get_design_context: skipped
  get_screenshot: success (1440×2244 scaled 1315×2048)
data_completeness:
  screen_inventory: complete (1 frame Chi tiết phiếu QT KH (from SO có BH))
  component_inventory: complete
  variant_state: complete (KH variant with insurance allocation rendered)
  text_content: complete (verbatim từ PNG)
  design_tokens: complete (variable_defs success)
  interaction_states: partial (verify shadcn baseline)
screenshots:
  - assets/wave03-cr-20260612-01--stl-detail-kh-with-bh/_full.png
related_features: [FEAT-INS-STL-DETAIL]
design_vs_feat_notes:
  - "Node `13354:56440` = màn 'Chi tiết phiếu quyết toán' bên thanh toán = **Khách hàng**, ĐI TỪ SO **CÓ chọn Bảo hiểm**. CR-20260612-01 scope (b): trong 'Tổng giá dịch vụ' THÊM mục 'Phân bổ Bảo hiểm' (3 khoản chuyển sang KH chịu dấu `+`) NẾU phiếu QT đi từ SO có BH."
  - "PNG xác nhận: panel hiển thị: AC-9 'Chi tiết theo bên thanh toán' 1 cột 'Khách hàng thanh toán' (Dịch vụ 0đ / Phụ tùng 95.040đ / VAT 95.040đ / Cộng sau VAT 95.040đ); AC-10 'Phân bổ Bảo hiểm' 1 cột KH với dấu `+` (Giảm trừ bồi thường +50.000.000đ / Khấu hao vật tư-thay mới +50.000.000đ / Khấu trừ BH +50.000.000đ — CHỈ 3 KHOẢN, BỎ 2 khoản CK liên kết BH theo Resolved 2026-06-16); AC-11 'Cân thanh toán': 'Khách hàng thanh toán 50.000.000đ' + 'Tổng thanh toán 50.000.000đ' brand."
  - "Cross-ref CR-20260616-01 resolved: 2 khoản 'CK liên kết BH — Vật tư' + 'CK liên kết BH — Công dịch vụ' chỉ ảnh hưởng bên BH, KHÔNG hiển thị trên phiếu KH (chốt BA/PO anhluong 2026-06-16). Phiếu KH (từ SO có BH) chỉ 3 khoản chuyển sang KH chịu."
  - "Section 'Đơn vị thanh toán' (BH info) KHÔNG hiển thị ở phiếu KH (header section trống) — KH không cần thông tin BH chi trả."
  - "Header buttons: 'Chỉnh sửa' + 'Thêm thanh toán' (KHÔNG có 'Tạo hồ sơ bảo hiểm' vì phiếu KH); 'In phiếu' chevron."
  - "Tab navigation: 3 tab — 'Bảng chi phí' (active brand-CD) · 'Chứng từ & hóa đơn' · 'Lịch sử thanh toán' (KHÔNG có 'Hồ sơ bảo hiểm đã xuất' tab vì phiếu KH)."
---

# Oracle — CR-20260612-01 (web) · wave 03 · screen "stl-detail-kh-with-bh"

> Design-conformance oracle cho `agent-test-ui`. Nguồn: Figma `GMS-v.3` node `13354:56440`
> (file_key `EMGjGsnAJzGoGwTSK7dTuZ`). Màn **Chi tiết phiếu quyết toán bên Khách hàng** đi
> từ SO **CÓ chọn Bảo hiểm** — panel "Tổng giá dịch vụ" theo CR-20260612-01 scope (b):
> THÊM mục "Phân bổ Bảo hiểm" 3 khoản dấu `+` cho KH chịu.

---

## Screen Inventory

| Screen state | nodeId | size | screenshot |
|---|---|---|---|
| Chi tiết phiếu QT KH (from SO có BH) — panel +Phân bổ BH 3 khoản | 13354:56440 | 1440×2244 | assets/wave03-cr-20260612-01--stl-detail-kh-with-bh/_full.png |

### Section-container in-scope

| Section | role | size |
|---|---|---|
| Header phiếu QT + thanh hành động | Header bar | 1440×80 |
| Thông tin quyết toán | section | 1216×~150 |
| Thông tin khách hàng & xe | section | 1216×~150 |
| **NO** Đơn vị thanh toán (KH variant — bỏ section BH info) | — | — |
| Tab navigation (3 tabs — không có "Hồ sơ bảo hiểm đã xuất") | tab bar | 1216×56 |
| Bảng chi phí — Dịch vụ + Phụ tùng | 2 sub-table | 1216×~700 |
| Panel "Tổng giá dịch vụ" — 1 cột KH + Phân bổ BH 3 khoản dấu + | right column panel | 600×~500 |

---

## Component Inventory

### Header
- BackArrow IconButton × 1
- Heading × 1 "#SET-20260326-00001" + Badge "Chờ thanh toán" (warning amber)
- Button cluster: Button outline "Chỉnh sửa" + Button outline "Thêm thanh toán" + secondary "In phiếu" chevron (NO "Tạo hồ sơ bảo hiểm")

### Thông tin quyết toán
- Title text "Thông tin quyết toán"
- Info grid 4 cột × 2 rows: "Phiếu dịch vụ liên kết" (#PHDV-20240723-001 link brand) | "Bên thanh toán" Badge "Khách hàng" (info-bg) | "Người tạo" Chủ doanh nghiệp | "Ngày tạo" 29/01/2026 13:00 — Row 2: "Cập nhật lần cuối" + "Ghi chú quyết toán"

### Thông tin khách hàng & xe
- Title text "Thông tin khách hàng & xe"
- Info grid 4 cột × 2 rows: KH Name | Phone | Type | (empty) — Biển số | Dòng xe | Hãng xe | Số km

### Tab navigation (3 tabs — KH variant)
- Tab "Bảng chi phí" (active brand-CD + underline)
- Tab "Chứng từ & hóa đơn"
- Tab "Lịch sử thanh toán"

### Bảng chi phí
- Section "Dịch vụ thực hiện" + Table 8 cột × 5 rows (sample data — KH only) + Footer "Tổng"
- Section "Phụ tùng sử dụng" + Table 9 cột × 5 rows (sample data) + Footer "Tổng"

### Panel "Tổng giá dịch vụ" (CR-20260612-01 scope KH + BH)
- Title text × 1 "Tổng giá dịch vụ"
- Section header "Chi tiết theo bên thanh toán" muted
- Bảng 2 cột × 5 rows ("Khoản mục" + "Khách hàng thanh toán" — chỉ 1 cột giá trị)
- Section header "Phân bổ Bảo hiểm" — **NEW per CR scope (b)**
- Bảng 2 cột × 3 rows ("Khoản mục" + KH value dấu `+`) — **CHỈ 3 KHOẢN** (Giảm trừ bồi thường / Khấu hao vật tư-thay mới / Khấu trừ BH)
- Section header "Cân thanh toán"
- Row "Khách hàng thanh toán" 50.000.000đ
- Row "Tổng thanh toán" 50.000.000đ (brand-CD 20px semibold)

---

## Variant & State

### Bên thanh toán Badge
- variants: "Khách hàng" (info-bg blue or accent — verify) · "Bảo hiểm" (BH variant)
- states observed: "Khách hàng" (this oracle)

### Panel "Tổng giá dịch vụ" — CR-20260612-01 KH+BH variant
- variants: `kh-with-bh-allocation` (this) — 1 cột KH + Phân bổ BH 3 khoản dấu +
- diff vs baseline KH (pre-CR): trước đây phiếu KH KHÔNG có "Phân bổ Bảo hiểm"; sau CR có 3 khoản

### Tabs (3-tab KH variant)
- variants: KH variant có 3 tab (bỏ "Hồ sơ bảo hiểm đã xuất") · BH variant có 4 tab
- states observed: 3 tab KH

---

## Text Content (verbatim)

### Header
- "#SET-20260326-00001" · "Chờ thanh toán" (badge) · "Chỉnh sửa" · "Thêm thanh toán" · "In phiếu"

### Thông tin quyết toán
- "Thông tin quyết toán" (title)
- Labels: "Phiếu dịch vụ liên kết" · "Bên thanh toán" · "Người tạo" · "Ngày tạo" · "Cập nhật lần cuối" · "Ghi chú quyết toán"
- Sample values: "#PHDV-20240723-001" · "Khách hàng" (badge) · "Chủ doanh nghiệp" · "29/01/2026 13:00" · "29/01/2026 13:00 (Nguyễn Văn A)" · "Chờ bảo hiểm duyệt giá lọc dầu"

### Thông tin khách hàng & xe
- "Thông tin khách hàng & xe" (title)
- Labels: "Tên khách hàng" · "Số điện thoại" · "Loại khách hàng" · "Biển số xe" · "Dòng xe" · "Hãng xe" · "Số km đã chạy"
- Sample values: "Nguyễn Minh Tâm" · "0942328562" · "Tổ chức" · "25B2-09284" · "Camry" · "Toyota" · "1.000"

### Tab navigation
- "Bảng chi phí" (active) · "Chứng từ & hóa đơn" · "Lịch sử thanh toán"

### Bảng chi phí
- "Dịch vụ thực hiện" · "Phụ tùng sử dụng" (2 section titles)
- Headers (Dịch vụ): "STT" · "Tên dịch vụ" · "Bên thanh toán" · "Người thực hiện" · "Đơn giá" · "Số lượng" · "Chiết khấu" · "Thuế" · "Thành tiền"
- Headers (Phụ tùng): "STT" · "Tên phụ tùng" · "Bên thanh toán" · "Phân khúc" · "Đơn vị tính" · "Đơn giá" · "Số lượng" · "Chiết khấu" · "Thuế" · "Thành tiền"
- Row label: "C- Khách hàng" · "Cao cấp" · "Cái"
- Footer label: "Tổng"

### Panel "Tổng giá dịch vụ"
- "Tổng giá dịch vụ" (title)
- "Chi tiết theo bên thanh toán" (header)
- "Khoản mục" · "Khách hàng thanh toán" (2 col headers)
- "Dịch vụ" · "Phụ tùng" · "VAT" · "Cộng sau VAT" (4 row labels)
- "Phân bổ Bảo hiểm" (header — NEW per CR)
- "Giảm trừ bồi thường" · "Khấu hao vật tư / thay mới" · "Khấu trừ BH" (3 row labels — **NOT 5**, CR Resolved 2026-06-16)
- "Cân thanh toán" (header)
- "Khách hàng thanh toán" (row 1 label) · "Tổng thanh toán" (row 2 label semibold)
- Sample values AC-9: "0đ" / "95.040đ" / "95.040đ" / "95.040đ"
- Sample values "Phân bổ Bảo hiểm": "+50.000.000đ" each (KH gánh, dấu `+`)
- Sample values "Cân thanh toán": "50.000.000đ" (KH) · "50.000.000đ" (Tổng brand-CD)

### Footer (chrome)
- "Phầm mềm quản lý Garage (G.M.S), phiên bản 2.0" · "Hướng dẫn sử dụng" · "Hỗ trợ" · "Hotline: 0985135050"

---

## Design Tokens

### Page-level layout
- colors: identical wave03-cr-20260612-01--stl-detail-bh oracle (same component library)
- typography: identical
- spacing: identical (PageContainer 1280px, Section gap 24-32px)

### Badge "Khách hàng" (info — Bên thanh toán)
- variant: info accent (verify hex — PNG hiển thị light blue rounded pill)

### Panel CR scope (1-cột KH + Phân bổ BH 3 khoản)
- 2 cols layout (Khoản mục 400 + Value 200)
- "Phân bổ Bảo hiểm" có 3 hàng (NOT 5)
- Value dấu `+` prefix với màu PNG observation = đen `#18181b` (verify với BA xem có style đỏ `#dc2626` text-foreground-error theo wave02 oracle no)
- "Tổng thanh toán" value brand-CD 20px semibold

---

## Screenshots

> assets/wave03-cr-20260612-01--stl-detail-kh-with-bh/
- `_full.png` — Màn Chi tiết phiếu QT KH from SO có BH full (13354:56440, 1440×2244 scaled 1315×2048)

---

## Coverage notes (oracle — non-blocking)

- **CR scope verify** = panel 1-cột KH + "Phân bổ Bảo hiểm" 3 khoản dấu `+` (Resolved 2026-06-16 — chỉ 3 khoản chuyển KH chịu, bỏ 2 khoản CK liên kết BH).
- agent-test-ui verify: phiếu KH (từ SO có BH) hiển thị section "Phân bổ Bảo hiểm" với đúng 3 khoản — đây là behavior NEW per CR (pre-CR phiếu KH KHÔNG có section này).
- Cross-check với CR-20260616-01 (bản in phiếu KH có BH): 3 khoản giống panel màn — đảm bảo màn ↔ giấy đồng bộ.
- KH variant tabs = 3 tab (bỏ "Hồ sơ bảo hiểm đã xuất" so với BH 4 tab) — verify visual.
