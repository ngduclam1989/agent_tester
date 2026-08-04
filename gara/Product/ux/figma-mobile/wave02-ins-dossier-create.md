---
feat: FEAT-INS-DOSSIER-CREATE
feat_file: Product/features/FEAT-INS-DOSSIER-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=437-24051&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "437:24051"
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 7
status: TRANSFORM_FAILED
fallback: Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md
failed_checks:
  - "M-13: AC-coverage cross-check chưa exhaustive — checklist control §AC (AC-1..AC-14) vs spec body không assert đầy đủ; xem coverage_gaps bên dưới"
  - "M-14: Decomposition depth chưa drill leaf cho mỗi frame — get_design_context skip để giới hạn context; widget tree dựa metadata XML cộng visual reconcile với screenshot"
  - "M-11: Widget Tree integrity dựa metadata structure, chưa verify từng leaf widget mapping → component catalog"
  - "M-18: Section-container PNG ở mức top-level frame only (7 frames + _full). Nested section bên trong (Nhóm A / Nhóm B / từng tab content) KHÔNG có PNG riêng — coverage 1-cấp; bù qua `_full.png` + per-screen PNG"
coverage_gaps:
  - "AC-3 (dòng phụ tài liệu — chốt 2026-06-17): dossier-list mobile screen `437-26437` enumerate 4 dòng tài liệu — verify dòng phụ Phiếu báo giá MOBILE = mã phiếu QT (web = mã PDV) + dòng phụ Giấy ủy quyền app phần đuôi 'Cần bổ sung nội dung' (FEAT v22 bỏ rule này, nhưng design có thể còn legacy)"
  - "AC-6 (banner cảnh báo cam trên app — Biên bản nghiệm thu): frame `452-24043` cần verify banner '⚠ Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ.' xuất hiện trên top section"
  - "AC-6 form fields (Lập biên bản / Bên A / Bên B / Nội dung / Ký): bảng prefill vs nhập tay FEAT §AC-6 — verify field labels khớp design (BKS xe, Ngày lập, Địa điểm, Căn cứ phiếu báo giá, Tên KH, Đại diện garage…). 'Thêm mục điều khoản' button ở dưới Nội dung nghiệm thu"
  - "AC-7 form fields (Giấy ủy quyền): frame `452-24580` rất dài (2401px) — verify đủ 3 mục I/II/III (Bên ủy quyền KH / Bên được ủy quyền garage / Nội dung ủy quyền) + IV. Cam kết + Khối ký; prefill chỉ Tên KH (BR-INS-DOSSIER-003)"
  - "AC-8 nút thao tác — app: nút 'Lưu thông tin' (lưu cục bộ, NOT persist server — đồng bộ EC-1 + BR-INS-DOSSIER-003) — cần xác nhận có ở footer mỗi màn chi tiết tài liệu"
  - "AC-9 footer Xuất hồ sơ — frame `437-26437` (danh sách) cần verify footer 'Xuất hồ sơ bảo hiểm' (disabled tới khi tick ≥1 tài liệu)"
  - "AC-1 entry điều kiện — frame `700-28585` 'Chi tiết phiếu quyết toán - Có BH - Bảo hiểm chi trả' verify nút '+ Tạo hồ sơ bảo hiểm' chỉ hiển thị khi payer=BH (BR-INS-DOSSIER-011 + FEAT-INS-STL-DETAIL AC-13)"
---

## Icon Catalog (shared)

> Icon catalog dựa metadata XML — chi tiết stroke/source cần drill design_context follow-up.

| Figma layer | source | Notes |
|---|---|---|
| vuesax/linear/arrow-left | assets/icons/arrow_left.svg (flutter_svg) | Back — top app bar leading, 20px |
| vuesax/linear/arrow-down / arrow-up | assets/icons/arrow_down.svg / arrow_up.svg | Mũi tên row tài liệu (›/▾) trên list, 20px |
| vuesax/linear/edit | assets/icons/edit.svg | Row trailing edit cards (Bên A, mục điều khoản…), 16-20px |
| vuesax/linear/trash | assets/icons/trash.svg | Row trailing delete (xoá điều khoản), 16-20px |
| vuesax/linear/add | assets/icons/add.svg | Nút "+ Thêm mục điều khoản", 20px |
| vuesax/linear/document-text | assets/icons/document_text.svg | Row icon: Mã phiếu, Mã PDV, 16px |
| Checkbox (filled / unfilled) | flutter Checkbox / custom AppCheckBox | Đầu dòng tài liệu, default unchecked (AC-3) |

> **Note (M5 cross-frame)**: 7 frame dưới đây thuộc CÙNG flow "Tạo & quản lý hồ sơ bảo hiểm" — frame `700-28585` là **entry** (màn Chi tiết QT BH có nút "+ Tạo hồ sơ bảo hiểm"); `437-26437` là **list màn Hồ sơ bảo hiểm** (4 dòng tài liệu); `452-22958` / `452-23711` / `452-24043` / `452-24580` là 4 màn **chi tiết tài liệu** (Phiếu QT / Phiếu báo giá / Biên bản nghiệm thu / Giấy ủy quyền) — tap dòng list → push màn chi tiết tương ứng (per AC-3 mobile branch). Frame `452-23174` là state phụ của danh sách (verify visual diff vs `437-26437`).

---

## Screen: Entry — Chi tiết phiếu QT BH với nút "+ Tạo hồ sơ bảo hiểm" (700:28585)
- Device frame: 375x2111px (phone — màn cuộn dọc dài)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg, log M-3 không có semantic token)
- AppBar: có — title "Chi tiết phiếu quyết toán", leading back, trailing kebab
- Body layout: Column (sections stacked) + ListView scroll
- Padding: EdgeInsets.zero (sections tự padding 16)
- BottomBar: có — ActionBar với nút "+ Tạo hồ sơ bảo hiểm" (gate: payer=BH only — BR-INS-DOSSIER-011)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu quyết toán" · more]
  └── Body: SingleChildScrollView
      └── Column
          ├── Section/NhomA-Header [InfoDV + Phiếu quyết toán + KH&xe]   ← frame 700:28587
          ├── Section/NhomB-Tabs [Tabs - 2: "Bảng chi phí" · "Chứng từ & hoá đơn" · "Hồ sơ bảo hiểm đã xuất" · _Partials/Tabs 1]  ← frame 700:28594
          │   └── TabContent_BangChiPhi  (active state — Phân bổ Bảo hiểm card)
          └── BottomBar/ActionBar [+ Tạo hồ sơ bảo hiểm (primary)]   ← gate AC-1 + BR-011

### CustomAppBar
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary (bottom)
- Text: "Chi tiết phiếu quyết toán" 16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Icons: leading arrow_left 20px · trailing more_vert 20px (both #262626 → AppColors.textPrimary)
→ flutter: CustomAppBar(title: "Chi tiết phiếu quyết toán", leading: back, actions: [more]) // lib/ui/widgets/app_bar/custom_app_bar.dart

### Section/NhomA-Header (700:28587)
- Bounds: w=fill h=hug
- Layout: Column, crossAxis=stretch
- BG: #ffffff → AppColors.bgBase
- Children:
  - InfoDV + Phiếu quyết toán (instance 700:28588) — 375x302 — block thông tin tổng quan + mã phiếu QT
  - Divider 6px #f4f7fe (rounded-rectangle 700:28589) → BoxDecoration(color: Color(0xFFF4F7FE))
  - Khối "Thông tin khách hàng & xe" (AC-3 mark) — instance 700:28590, 375x58
  - Divider 6px #f4f7fe
  - Info xe/ View (instance 700:28592) — 375x58
→ flutter: Column con với Section composables reuse từ FEAT-INS-STL-DETAIL (custom row InfoRow)

### Section/NhomB-Tabs (700:28594, AC-4)
- Bounds: w=fill h=1350
- Layout: Column
- TabBar (frame 700:28597) — 4 tabs ngang scroll-x: "Bảng chi phí" · "Chứng từ & hoá đơn" · "Hồ sơ bảo hiểm đã xuất" · {tab 4}
  - Active: tab "Bảng chi phí" (default landing — instance 700:28598)
  - Underline indicator 2px #0052ff → AppColors.borderActive ở dưới tab active
- TabContent active = "Bảng chi phí" → Panel "Phân bổ Bảo hiểm" + breakdown 5 dòng (sync với FEAT-INS-STL-DETAIL — reuse cùng panel)
→ flutter: AppTabBar(...) hoặc DefaultTabController với 4 Tab; ưu tiên reuse widget từ wave01-ins-stl-detail tab bar

### BottomBar/ActionBar (entry "Tạo hồ sơ bảo hiểm")
- Bounds: w=fill h=FIXED(80px) sticky bottom
- BG: #ffffff → AppColors.bgBase, top border 1px #e8e8ea → AppColors.borderPrimary
- Layout: Row (action buttons) — verify với screenshot: nút primary "+ Tạo hồ sơ bảo hiểm" (CHỈ khi `payer=BH` — gate BR-INS-DOSSIER-011 + FEAT-INS-STL-DETAIL AC-13)
- Hành vi tap: điều hướng push tới màn "Hồ sơ bảo hiểm" (frame 437:26437 — AC-1)
→ flutter: AppButton.text(title: "+ Tạo hồ sơ bảo hiểm", appButtonSize: AppButtonSize.large(), appButtonColor: AppButtonColor.primary(), onPress: () => Navigator.pushNamed(...)) — gate `if soPayer == Insurance`

---

## Screen: Danh sách Hồ sơ bảo hiểm (4 dòng tài liệu) (437:26437)
- Device frame: 375x812px (phone — fixed; no scroll if list ≤ ~5 dòng)
- Scaffold: CustomScaffold, bg=#ffffff → AppColors.bgBase
- AppBar: có — title "Hồ sơ bảo hiểm", leading back (‹)
- Body layout: Column [Header text + 4-row list + footer button]
- BottomBar: có (footer "Xuất hồ sơ bảo hiểm" disabled tới khi tick ≥1 dòng — AC-9)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Hồ sơ bảo hiểm"]
  └── Body: Column
      ├── Header text "Tài liệu bảo hiểm" + subtitle "Chọn tài liệu cần xuất."   ← AC-2
      ├── ListView/RowTaiLieu (4 dòng — AC-3, mặc định KHÔNG tick — AC-3 chốt 2026-06-18)
      │   ├── Row/PhieuQuyetToan       [☐ "Phiếu quyết toán" · "SET-20260326-00001" › ]
      │   ├── Row/PhieuBaoGia          [☐ "Phiếu báo giá" · "SET-20260326-00001"[mobile] › ]
      │   ├── Row/BienBanNghiemThu     [☐ "Biên bản nghiệm thu" · "Thông tin được sử dụng để lập biên bản nghiệm thu" › ]
      │   └── Row/GiayUyQuyen          [☐ "Giấy ủy quyền nhận tiền bồi thường" · "Áp dụng cho garage chưa ký liên kết với bảo hiểm ·" › ]
      └── BottomBar [AppButton "Xuất hồ sơ bảo hiểm" disabled-until-any-checked]

### Header
- Title "Tài liệu bảo hiểm" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
- Subtitle "Chọn tài liệu cần xuất." 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#888c94 → AppColors.textTertiary

### Row/{TaiLieu}
- Bounds: w=fill h=FIXED(~80px) (verify từng row)
- Layout: Row, gap=Gap(AppSizes.spacing12), padding=EdgeInsets.symmetric(horizontal: 16, vertical: 16)
- Border: bottom 1px solid #e8e8ea → AppColors.borderPrimary
- Leading: Checkbox (mặc định bỏ trống — AC-3 + BR-INS-DOSSIER-002 v22)
- Middle: Column [Title (Body/B5 14px weight=500 color=#262626 → textPrimary) + Subtitle (Caption/C7 12px weight=400 color=#888c94 → textTertiary)]
- Trailing: assets/icons/arrow_right.svg (›) 20px #888c94 → textTertiary (tap → push màn chi tiết tài liệu — AC-3 mobile branch)
→ flutter: AppListTile / custom Row(checkbox + Column + chevron); reuse pattern existing list rows. Lưu ý KHÔNG dùng raw ListTile.

### BottomBar
- Layout: Row, padding=EdgeInsets.all(16)
- AppButton "Xuất hồ sơ bảo hiểm" primary, fill w, h=FIXED(48-56px) → AppButton.text(appButtonSize: AppButtonSize.large(), appButtonColor: AppButtonColor.primary())
- State: disabled khi không tick dòng nào → BG=#e8e8ea (verify) — AC-9 + BR-INS-DOSSIER-004

---

## Screen: Danh sách Hồ sơ bảo hiểm (state phụ — verify) (452:23174)
- Device frame: 375x812px
- Scaffold: identical với `437-26437`
- Sự khác biệt vs `437-26437`: cần visual reconcile bằng screenshot — possibly state có ≥1 checkbox đã tick + button "Xuất hồ sơ bảo hiểm" enabled, hoặc state khi tap màn hồ sơ lần đầu chưa scroll, hoặc variant nội dung khác.
- Widget Tree: như Screen 437:26437 — tham chiếu canonical ở screen đó.

> **Coverage gap (cần verify)**: Frame `452-23174` 812px giống `437-26437` size — confirm whether đây là state "tick 1 dòng → footer enabled" hay variant copy khác. Visual reconcile với `assets/wave02-ins-dossier-create/452-23174.png`.

---

## Screen: Chi tiết tài liệu — Phiếu quyết toán (452:22958)
- Device frame: 375x1251px (scroll vertical dài)
- Scaffold: CustomScaffold, bg=#ffffff → AppColors.bgBase
- AppBar: có — title "Phiếu quyết toán", leading back (‹) (back về danh sách 437:26437)
- Body layout: SingleChildScrollView → Column
- BottomBar: KHÔNG có (read-only — AC-4 + BR-INS-DOSSIER-002; thao tác "In phiếu" CHỈ ở web)
- Widget Tree (xem screenshot `452-22958.png`):
  Scaffold
  ├── CustomAppBar [back · "Phiếu quyết toán"]
  └── Body: SingleChildScrollView → Column
      ├── Section/Header [Tiêu đề "PHIẾU QUYẾT TOÁN SỬA CHỮA" + mã "SET-20260326-00001"]
      ├── Section/ThongTinChung [Garage · Ngày quyết toán · Khách hàng · Biển số xe]
      ├── Table/DichVuThucHien [STT · Nội dung · ĐVT · SL · Đơn giá · Thành tiền] + dòng Tổng
      ├── Table/PhuTungSuDung [cùng cấu trúc cột] + dòng Tổng
      └── Section/PhanBoBaoHiem [5 dòng CK Vật tư / CK Công DV / Giảm trừ / Khấu hao VT/Thay mới / Khấu trừ BH] + dòng Tổng thanh toán

### Section/Header
- Title "PHIẾU QUYẾT TOÁN SỬA CHỮA" all-caps 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
- Subtitle mã phiếu — 14px weight=500 → theme: AppTextStyle.textBodyB5 color=#888c94 → AppColors.textTertiary

### Section/ThongTinChung
- Layout: Column gap=Gap(AppSizes.spacing8); mỗi row Row(label + value)
- Field: Garage | Ngày quyết toán | Khách hàng (vd "Chungntt — 0123123123") | Biển số xe (vd "30A1234 — ACURA TSX") (AC-4)
→ flutter: Reuse InfoRow widget (label/value pattern)

### Table/DichVuThucHien · Table/PhuTungSuDung
- Layout: Custom table (Row header + ListView rows + footer Row "Tổng")
- Columns: STT · Nội dung · ĐVT · SL · Đơn giá · Thành tiền — 6 cột
- Border: top/bottom solid #e8e8ea → AppColors.borderPrimary; row separator subtle
- Read-only — AC-4 + BR-INS-DOSSIER-002
→ flutter: Custom table widget (KHÔNG dùng DataTable Material vì cần style match design); xem widget `table/` trong catalog hoặc compose Column + Row

### Section/PhanBoBaoHiem
- Headers + 5 dòng explicit: CK liên kết BH - Vật tư · CK liên kết BH - Công dịch vụ · Giảm trừ bồi thường · Khấu hao vật tư/thay mới · Khấu trừ bảo hiểm + dòng **Tổng thanh toán** (bold)
- Reuse panel pattern từ FEAT-INS-STL-DETAIL (đã spec wave01) — verify số liệu read-only mapping
- Read-only (AC-4)

---

## Screen: Chi tiết tài liệu — Phiếu báo giá (452:23711)
- Device frame: 375x812px (scroll nếu nội dung > viewport)
- Scaffold: CustomScaffold, bg=#ffffff → AppColors.bgBase
- AppBar: có — title "Phiếu báo giá", leading back (‹)
- Body: SingleChildScrollView → Column
- BottomBar: KHÔNG có (read-only — AC-5)
- Widget Tree (xem screenshot `452-23711.png`):
  Scaffold
  ├── CustomAppBar [back · "Phiếu báo giá"]
  └── Body: SingleChildScrollView → Column
      ├── Section/Header [Tiêu đề "PHIẾU BÁO GIÁ SỬA CHỮA" + subtitle "PDV-... · Bảo hiểm đã duyệt giá"]
      ├── Section/ThongTinChung [Garage · Ngày báo giá · Công ty bảo hiểm · Số hợp đồng BH]
      └── Table/HangMuc [STT · Nội dung sửa chữa · Phụ tùng · Đơn giá · Thành tiền] + dòng Tổng

### Section/Header
- Title "PHIẾU BÁO GIÁ SỬA CHỮA" — 18px weight=700 → textHeadingH3 → textPrimary
- Subtitle = "PDV-20260320-00639 · Bảo hiểm đã duyệt giá" — 12-14px weight=400 → textCaptionC5/C7 → textTertiary

### Section/ThongTinChung
- Field: Garage | Ngày báo giá | Công ty bảo hiểm (vd "Bảo hiểm Bảo Việt") | Số hợp đồng BH (vd "BV-2903812-093814") — AC-5
→ flutter: InfoRow reuse

### Table/HangMuc
- Columns: STT · Nội dung sửa chữa · Phụ tùng · Đơn giá · Thành tiền — 5 cột (1 cột ít hơn Phiếu QT do gộp Nội dung+Phụ tùng — AC-5)
- Read-only — AC-5 + BR-INS-DOSSIER-002

---

## Screen: Chi tiết tài liệu — Biên bản nghiệm thu (452:24043)
- Device frame: 375x1640px (scroll vertical rất dài — template điền nhiều trường)
- Scaffold: CustomScaffold, bg=#ffffff → AppColors.bgBase
- AppBar: có — title "Biên bản nghiệm thu", leading back (‹)
- Body: SingleChildScrollView → Column
- **Banner cảnh báo cam** (AC-6 app branch): "⚠ Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ." — BG #fff8ec → AppColors.bgWarning, border-left/icon #ff6b00 → bgWarningStrong
- BottomBar: có — nút **"Lưu thông tin"** (lưu cục bộ trong phiên, KHÔNG persist server — AC-6 + EC-1 + BR-INS-DOSSIER-003)
- Widget Tree (xem screenshot `452-24043.png`):
  Scaffold
  ├── CustomAppBar [back · "Biên bản nghiệm thu"]
  ├── Body: SingleChildScrollView
  │   └── Column
  │       ├── Banner/CanhBaoCam (icon warning + text "⚠ Các trường mẫu cần được kiểm tra ...")
  │       ├── Section/TieuDeQuocHieu  ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----"]
  │       ├── Section/TenBienBan       ["BIÊN BẢN NGHIỆM THU, THANH LÝ HỢP ĐỒNG"]
  │       ├── Section/LapBienBan        [BKS xe* · Ngày lập* · Địa điểm* · Căn cứ phiếu báo giá]    ← * = nhập tay
  │       ├── Section/BenA              [Tên KH (prefill) · các trường khác (nhập tay)]
  │       ├── Section/BenB              [garage prefill: tên · đại diện · chức vụ · địa chỉ · MST/STK/NH]
  │       ├── Section/NoiDungNghiemThu  [List 4 điều khoản template prefill · button "+ Thêm mục điều khoản"]
  │       └── Section/KhoiKy            [Đại diện khách hàng · Đại diện xưởng sửa chữa]
  └── BottomBar [AppButton "Lưu thông tin" (secondary/primary)]

### Banner/CanhBaoCam
- Bounds: w=fill h=hug (~48-56px) — đầu body
- BG: #fff8ec → AppColors.bgWarning
- Border-left: 4px #ff6b00 → AppColors.bgWarningStrong (verify với screenshot)
- Padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8)
- Icon: warning circle 16-20px #ff6b00 → bgWarningStrong (vuesax/linear/warning hoặc Icons.warning_amber)
- Text: "Các trường mẫu cần được kiểm tra và bổ sung trước khi xuất hồ sơ." 12-13px weight=500 → textBodyB7/textSubtitleS6 color=#ff6b00 → textWarningPrimary
→ flutter: Container(decoration: BoxDecoration(color: AppColors.bgWarning, ...), child: Row([icon, Gap(8), Text]))

### Section/LapBienBan (Lập biên bản — AC-6 bảng "Lập biên bản")
- Fields: BKS xe · Ngày lập biên bản (dd/mm/yyyy) · Địa điểm lập biên bản · Căn cứ phiếu báo giá (số + ngày)
- Source: BKS+Ngày+Địa điểm = **nhập tay**; Căn cứ phiếu báo giá = **prefill** (từ Phiếu báo giá trong bộ hồ sơ)
- Input pattern: text editable trực tiếp click vào ô (per AC-6 mobile branch — "Các trường thông tin có thể chỉnh sửa trực tiếp")
- Border editable: 1px dashed/solid #e8e8ea → AppColors.borderPrimary; focus = #0052ff → AppColors.borderActive
→ flutter: AppTextField (inline editable) hoặc EditableText/InlineEditableField pattern; field label theo bảng AC-6

### Section/NoiDungNghiemThu
- Template prefill 4 điều khoản chuẩn (AC-6 + FEAT §AC-6 list):
  1. Hoàn thành sửa chữa
  2. Nhận bàn giao
  3. Bảo hành
  4. Lập thành 02 bản
- Mỗi điều khoản = Text editable (xoá/sửa được)
- Button "+ Thêm mục điều khoản" — add row tự do
- Trailing edit/delete trên mỗi row (icon edit + trash)
→ flutter: ListView.builder + AppButton.textIcon(title: "Thêm mục điều khoản", icon: Icons.add)

### Section/KhoiKy
- 2 cột (Row, mainAxis=spaceBetween)
  - "Đại diện khách hàng (Ký, ghi rõ họ tên)"
  - "Đại diện xưởng sửa chữa (Ký, ghi rõ họ tên)"
- Text 12-13px weight=400 → textCaptionC7
- Ký tay ngoài hệ thống (BR-INS-DOSSIER-003)

### BottomBar/LuuThongTin
- Layout: padding=EdgeInsets.all(16), bg=#ffffff
- Top border 1px #e8e8ea → AppColors.borderPrimary
- AppButton "Lưu thông tin" w=fill h=FIXED(48-56px) — variant: secondary (xám) hoặc primary tuỳ design
- Hành vi tap: lưu nội dung điền vào state cục bộ (Bloc/state in-memory), pop về list — KHÔNG gọi server (EC-1 + BR-INS-DOSSIER-003)
- Persist thật khi user nhấn "Xuất hồ sơ bảo hiểm" trên list (AC-9)
→ flutter: AppButton.text(title: "Lưu thông tin", appButtonSize: AppButtonSize.large(), appButtonColor: AppButtonColor.primary() or secondary())

---

## Screen: Chi tiết tài liệu — Giấy ủy quyền (452:24580)
- Device frame: 375x2401px (scroll vertical rất dài — 4 mục I/II/III/IV + ký)
- Scaffold: CustomScaffold, bg=#ffffff → AppColors.bgBase
- AppBar: có — title "Giấy ủy quyền" (verify wording — có thể "Giấy ủy quyền nhận tiền bồi thường"), leading back (‹)
- Body: SingleChildScrollView → Column
- **Banner cảnh báo cam** (AC-7 app branch — verify) — cùng pattern như Biên bản nghiệm thu
- BottomBar: có — nút **"Lưu thông tin"** (lưu cục bộ — AC-7 + EC-1)
- Widget Tree (xem screenshot `452-24580.png`):
  Scaffold
  ├── CustomAppBar [back · "Giấy ủy quyền"]
  ├── Body: SingleChildScrollView
  │   └── Column
  │       ├── Banner/CanhBaoCam        ← verify visibility
  │       ├── Section/TieuDeQuocHieu  ["CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM / Độc lập - Tự do - Hạnh phúc / -----o0o-----"]
  │       ├── Section/TenGiay          ["GIẤY ỦY QUYỀN"]
  │       ├── Section/DauPhieu          [Địa danh + ngày lập (nhập tay)]
  │       ├── Section/I-BenUyQuyen      [Họ tên/Tên đơn vị (prefill Tên KH only) · Địa chỉ · Quốc tịch · Đại diện/Chức vụ · GCN bảo hiểm · CMND/CCCD + ngày + nơi cấp — tất cả NHẬP TAY trừ Tên]
  │       ├── Section/II-BenDuocUyQuyen [garage prefill: Tên/Công ty · Địa chỉ · MST · Điện thoại · Đại diện · Chức vụ · STK · Ngân hàng]
  │       ├── Section/III-NoiDungUyQuyen [Loại xe · BKS (prefill từ QT BH) · Số tiền bồi thường · Bằng chữ (prefill từ QT BH) · Ngày tai nạn · Nội dung (nhập tay)]
  │       ├── Section/IV-CamKet         [List 3 điều khoản template prefill · button "+ Thêm mục điều khoản"]
  │       └── Section/KhoiKy            [Đại diện khách hàng · Đại diện xưởng sửa chữa]
  └── BottomBar [AppButton "Lưu thông tin"]

### Section/I-BenUyQuyen (KH)
- Field list (AC-7 bảng I):
  - **Họ tên / Tên đơn vị** → **Prefill chỉ Tên** (từ phiếu QT BH — BR-INS-DOSSIER-003)
  - Địa chỉ, Quốc tịch, Đại diện/Chức vụ, GCN bảo hiểm tự nguyện/bắt buộc, Số CMND/CCCD · Ngày cấp · Nơi cấp — **NHẬP TAY**
- Input pattern: AppTextField inline editable, label + value editable
→ flutter: AppTextField label-above hoặc inline pattern

### Section/II-BenDuocUyQuyen (garage)
- Field list: Tên garage/Công ty · Địa chỉ · MST · Điện thoại · Đại diện · Chức vụ · Số tài khoản · Ngân hàng — **Prefill từ hồ sơ garage**
- Read-only hiển thị (verify với screenshot — có thể editable cho phép đính chính)

### Section/III-NoiDungUyQuyen
- Field list:
  - Loại xe · Biển kiểm soát → **Prefill** từ xe trên QT BH
  - Số tiền bồi thường · Bằng chữ → **Prefill** từ QT BH (số bồi thường BH chi trả)
  - Ngày tai nạn · Nội dung → **NHẬP TAY**

### Section/IV-CamKet
- Template prefill 3 điều khoản chuẩn (AC-7)
- Button "+ Thêm mục điều khoản" — add row tự do
→ flutter: ListView.builder + AppButton.textIcon

### BottomBar/LuuThongTin (cùng pattern AC-6)
→ flutter: AppButton.text(title: "Lưu thông tin", appButtonSize: AppButtonSize.large(), appButtonColor: AppButtonColor.primary())

---

## Screenshots
> assets/wave02-ins-dossier-create/
- `_full.png` — toàn section FEAT-INS-DOSSIER-CREATE (3096x3284 → 1934x2048)
- `700-28585.png` — Screen 1: Entry "Chi tiết phiếu QT BH" có nút "+ Tạo hồ sơ bảo hiểm" (375x2111)
- `437-26437.png` — Screen 2: Danh sách Hồ sơ bảo hiểm (4 dòng tài liệu, footer Xuất) (375x812)
- `452-23174.png` — Screen 3: State phụ Danh sách (375x812)
- `452-22958.png` — Screen 4: Chi tiết Phiếu quyết toán (read-only, 375x1251)
- `452-23711.png` — Screen 5: Chi tiết Phiếu báo giá (read-only, 375x812)
- `452-24043.png` — Screen 6: Chi tiết Biên bản nghiệm thu (template điền + Lưu cục bộ, 375x1640)
- `452-24580.png` — Screen 7: Chi tiết Giấy ủy quyền (template điền + Lưu cục bộ, 375x2401)
