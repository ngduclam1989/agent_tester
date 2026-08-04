---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "81:39472"
fetched_at: 2026-06-04T10:06:05+07:00
transform_version: 5
screenshots: true
screens_expected: 5
coverage_gaps:
  - "AC-5: bảng line-item 'Dịch vụ thực hiện' / 'Phụ tùng sử dụng' (cột STT/Tên/Bên TT/Người thực hiện/Đơn giá/SL/Chiết khấu/Thuế + phân trang) — KHÔNG có trong design mobile. Tab 'Bảng chi phí' mobile chỉ render panel 'Phân bổ Bảo hiểm' (cards + breakdown). Bảng hạng mục chi tiết không xuất hiện ở bất kỳ frame nào → verify với design owner liệu mobile cố ý bỏ bảng line-item hay chỉ chưa vẽ."
  - "AC-8: tab 'Hồ sơ Bảo Hiểm' — KHÔNG có frame riêng cho nội dung tab này (data-state lẫn empty-state). Tab tồn tại trong tab bar nhưng không drill được nội dung → fallback FEAT-INS-DOSSIER-VIEW."
  - "AC-9: tab 'Lịch sử thanh toán' — chỉ có EMPTY-STATE frame (340:53400), KHÔNG có data-state với bảng lịch sử (cột Ngày/Số tiền/Phương thức/Ghi chú/File). So gap cũ AC-9: vẫn chỉ empty-state — design data-state không tồn tại → DEV fallback FEAT AC-9 copy + component baseline."
  - "AC-7: tab 'Chứng từ & Hoá đơn' — chỉ EMPTY-STATE (340:52956), không có data-state danh sách chứng từ. So gap cũ: ĐÃ xác nhận đúng là design chỉ vẽ empty-state → reuse cơ chế baseline FEAT-STL-DETAIL."
  - "AC-12: nút 'In toàn bộ hồ sơ' — KHÔNG thấy trên mobile (top bar chỉ back + ⋮; bottom bar = Sửa phiếu/Thanh toán/Hồ sơ BH). Có thể nằm trong menu ⋮ (không drill được). Fallback AC-12 copy."
  - "AC-6 (so gap cũ AC-10/AC-11): ĐÃ LẤP data-state. Panel 'Phân bổ Bảo hiểm' với cả 2 sub-tab Tổng quan (bảng Khoản mục|BH|KH) + Chi tiết phân bổ (5 dòng điều chỉnh CK Vật tư/Công DV, Giảm trừ, Khấu hao, Khấu trừ có màu xanh/cam) nay capture đầy đủ từ frame 319:42361 + 319:42657 (trước gap chỉ show bảng computed, thiếu 5 dòng explicit). Lưu ý: mobile chỉ 2 card (Phải thu BH + KH chịu điều chỉnh), KHÔNG có card thứ 3 'Tổng thanh toán' như AC-6 web."
---

## Icon Catalog (shared)

| Figma layer | source | Notes |
|---|---|---|
| vuesax/linear/arrow-left | assets/icons/arrow_left.svg (flutter_svg) | Back — top app bar leading, 20px |
| vuesax/linear/more (rotate 90) | Icons.more_vert | Kebab menu — top app bar trailing, 20px |
| vuesax/linear/document-text | assets/icons/document_text.svg | Row icon: Mã phiếu / Phiếu DVLK / Ghi chú, 16px |
| vuesax/linear/user-square | assets/icons/user_square.svg | Row icon: Người tạo, 16px |
| vuesax/linear/moneys | assets/icons/moneys.svg | Row icon: Bên thanh toán, 16px |
| vuesax/linear/calendar | assets/icons/calendar.svg | Row icon: Ngày tạo, 16px |
| vuesax/linear/refresh-2 | assets/icons/refresh_2.svg | Row icon: Cập nhật, 16px |
| vuesax/linear/user | assets/icons/user.svg | Row icon: Tên khách hàng, 16px |
| vuesax/linear/call-calling | assets/icons/call_calling.svg | Row icon: SĐT, 16px |
| vuesax/linear/profile-2user | assets/icons/profile_2user.svg | Row icon: Loại khách hàng, 16px |
| vuesax/linear/car | assets/icons/car.svg | Row icon: Hãng xe, 16px |
| vuesax/linear/chart | assets/icons/chart.svg | Row icon: Biển số xe, 16px |
| vuesax/linear/cpu-charge | assets/icons/cpu_charge.svg | Row icon: Số KM đã chạy, 16px |
| vuesax/linear/arrow-right | assets/icons/arrow_right.svg | Section header trailing (Thông tin quyết toán), 20px |
| vuesax/linear/arrow-up / arrow-down | assets/icons/arrow_up.svg / arrow_down.svg | Toggle "Thu gọn / Xem chi tiết phân bổ", 24px |
| vuesax/linear/edit | assets/icons/edit.svg | Action bar — nút edit (icon-only variant), 24px |
| vuesax/linear/add | assets/icons/add.svg | Action bar — nút "+" Thanh toán / Hồ sơ BH, 24px |

> **Lưu ý layout chung (M5 cross-frame)**: 5 screen dưới đây là cùng MỘT màn "Chi tiết phiếu quyết toán" ở các state khác nhau (tab active + panel Phân bổ collapsed/expanded + sub-tab Tổng quan/Chi tiết phân bổ). Header app bar + 2 khối thông tin (Thông tin quyết toán, Thông tin KH & xe) + tab bar + action bar **giống nhau** trên cả 5 → mô tả canonical ở Screen 1; các screen sau chỉ ghi phần khác.

---

## Screen: Chi tiết QT BH — Tab Bảng chi phí · Phân bổ collapsed (340:54941)
- Device frame: 375x1102px (phone)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg, không có semantic token — log M-3); body cuộn dọc (SingleChildScrollView)
- AppBar: có (custom top bar) — title "Chi tiết phiếu quyết toán", leading back, trailing kebab
- Body layout: Column (sections stacked), divider 6px màu #f4f7fe giữa các khối
- BottomBar: có — Action bar (xem block dưới)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · title · more]
  └── Body: SingleChildScrollView
      └── Column
          ├── Section/ThongTinQuyetToan
          ├── Gap(6) divider #f4f7fe
          ├── Section/ThongTinKhachHangXe
          ├── TabBar [Bảng chi phí* · Chứng từ & Hoá đơn · Hồ sơ Bảo Hiểm · Lịch sử thanh toán]
          └── Section/PhanBoBaoHiem (collapsed)
              ├── Header "Phân bổ Bảo hiểm" + mô tả
              ├── Row [Card/PhaiThuBH · Card/KHChiuDieuChinh]
              └── Button/ToggleXemChiTiet "Xem chi tiết phân bổ ⌄"
  BottomBar: ActionBar [edit · + Thanh toán · + Hồ sơ BH]

### CustomAppBar (319:42471)
- Bounds: w=fill h=FIXED(52px) (dưới status bar 44px)
- Layout-mode: stack (title canh giữa, leading/trailing 2 đầu)
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary (bottom)
- Text: "Chi tiết phiếu quyết toán" 16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Icons:
  - leading: assets/icons/arrow_left.svg (vuesax/linear/arrow-left), 20px, #262626 → AppColors.textPrimary
  - trailing: Icons.more_vert (vuesax/linear/more rotate 90), 20px, #262626 → AppColors.textPrimary
→ flutter: CustomAppBar(title: "Chi tiết phiếu quyết toán", leading: back, actions: [more]) // lib/ui/widgets/app_bar/custom_app_bar.dart

### Section/ThongTinQuyetToan (340:55433)
- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=start
- BG: #ffffff → AppColors.bgBase
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
  #### Row/Header
  - Text: "Thông tin quyết toán" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
  - Icons: trailing assets/icons/arrow_right.svg, 20px, #262626 → AppColors.textPrimary (collapse toggle section)
  #### Column/InfoRows (mỗi dòng: icon 16px + label + value)
  - Mã phiếu: **"#SET-20260326-00001"** → value link màu #0052ff → AppColors.textActivePrimary (icon document-text)
  - Phiếu DVLK: **"PDV-20260320-00639"** → link #0052ff → AppColors.textActivePrimary (link sang PDV) (icon document-text)
  - Người tạo: "Chủ doanh nghiệp" (icon user-square)
  - Bên thanh toán: "Bảo hiểm" (icon moneys)
  - Ngày tạo: "26/03/2026 08:05" (icon calendar)
  - Cập nhật: "26/03/2026 08:05" (icon refresh-2)
  - Ghi chú: "_" (rỗng → hiển thị "_") (icon document-text)
  - Label text 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#888c94 → AppColors.textTertiary
  - Value text 14px weight=500 → theme: AppTextStyle.textBodyB5 color=#262626 → AppColors.textPrimary
→ flutter: Column con với reusable InfoRow(icon, label, value, isLink) // pattern lặp; value link → InkWell màu textActivePrimary

### Section/ThongTinKhachHangXe (340:58234)
- Bounds: w=fill h=hug
- Layout: Column, gap=Gap(AppSizes.spacing8), crossAxis=start; có divider mảnh ngăn nhóm KH / nhóm xe
- BG: #ffffff → AppColors.bgBase
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
  #### Row/Header
  - Text: "Thông tin khách hàng & xe" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
  #### Column/InfoRows
  - Tên khách hàng: "Minh Tâm" (icon user)
  - SĐT: "0867771212" (icon call-calling)
  - Loại khách hàng: "Cá nhân" (icon profile-2user)
  - — divider —
  - Hãng xe: "Honda Civic" (icon car)
  - Biển số xe: "19A99979" (icon chart)
  - Số KM đã chạy: "20.000km" (icon cpu-charge)
  - Label 14px/400 → theme: AppTextStyle.textCaptionC5 color=#888c94 → AppColors.textTertiary
  - Value 14px/500 → theme: AppTextStyle.textBodyB5 color=#262626 → AppColors.textPrimary
→ flutter: Column với InfoRow tái dùng

### TabBar/4tab (340:55846)
- Bounds: w=fill h=FIXED(44px)
- Layout-mode: flex(Row), scrollable horizontal (4 tab vượt width 375)
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary (bottom)
- Padding: EdgeInsets.symmetric(horizontal: 16) → AppSizes.spacing16; gap=Gap(AppSizes.spacing12); mỗi tab py=12 px=4
- Tabs:
  - "Bảng chi phí" — ACTIVE: text 14px weight=500 → theme: AppTextStyle.textBodyB5 color=#0052ff → AppColors.textActivePrimary; underline 3px #0052ff → AppColors.borderActive
  - "Chứng từ & Hoá đơn" — inactive: 14px/400 → theme: AppTextStyle.textCaptionC5 color=#262626 → AppColors.textPrimary
  - "Hồ sơ Bảo Hiểm" — inactive (cùng style)
  - "Lịch sử thanh toán" — inactive (cùng style)
→ flutter: TabBar(isScrollable: true, ...) — Material TabBar (no catalog widget — verify with widget owner); indicatorWeight 3, indicatorColor AppColors.borderActive

### Section/PhanBoBaoHiem — collapsed (340:55109)
- Bounds: w=fill h=hug
- Layout-mode: flex(Column), gap=Gap(AppSizes.spacing16), crossAxis=stretch
- BG: #f4f7fe → Color(0xFFF4F7FE) (page-bg — log M-3)
- Padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16) → AppSizes.spacing16
  #### Text/Header
  - Text: "Phân bổ Bảo hiểm" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
  #### Text/Description
  - Text: "Phiếu này chỉ gồm các hạng mục có bên thanh toán = Bảo hiểm. Hạng mục khách hàng thanh toán không hiển thị trong phiếu quyết toán bảo hiểm." 12px weight=400 → theme: AppTextStyle.textCaptionC7 color=#262626 → AppColors.textPrimary
  #### Row/Cards
  - Layout-mode: flex(Row), gap=Gap(AppSizes.spacing16), 2 card flex bằng nhau
    ##### Card/PhaiThuBH (340:55947)
    - Bounds: w=fill(flex) h=hug
    - BG: #ffffff → AppColors.bgBase
    - Border: 1px solid #1e88ff → AppColors.borderActive (BlueColor.s500) radius=BorderRadius.circular(12)
    - Padding: EdgeInsets.symmetric(horizontal: 12, vertical: 16)
    - Text title: "Phải thu BH" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#172554 → Color(0xFF172554) (blue/950 — log M-3)
    - Text value: "197.680.000đ" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#0052ff → AppColors.buttonBackgroundPrimary
    ##### Card/KHChiuDieuChinh (340:55948)
    - Bounds: w=fill(flex) h=hug
    - BG: #ffffff → AppColors.bgBase
    - Border: 1px solid #f97316 → Color(0xFFF97316) (orange/500 — log M-3) radius=BorderRadius.circular(12)
    - Padding: EdgeInsets.symmetric(horizontal: 12, vertical: 16)
    - Text title: "KH chịu điều chỉnh" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#172554 → Color(0xFF172554) (log M-3)
    - Text value: "2.720.000đ" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#ff6b00 → AppColors.textWarningPrimary
  #### Button/ToggleXemChiTiet (340:55950)
  - Bounds: w=fill h=hug
  - BG: #ffffff → AppColors.bgBase radius=BorderRadius.circular(8)
  - Padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)
  - Text: "Xem chi tiết phân bổ" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#0052ff → AppColors.buttonBackgroundPrimary
  - Icons: trailing assets/icons/arrow_down.svg (collapsed) / arrow_up.svg (expanded), 24px, #0052ff → AppColors.buttonBackgroundPrimary
  - State: collapsed (mũi tên xuống, "Xem chi tiết phân bổ") ↔ expanded ("Thu gọn chi tiết phân bổ", mũi tên lên)
  → flutter: AppButton.textIcon(title: "Xem chi tiết phân bổ", ...) hoặc InkWell custom toggle — verify catalog

### ActionBar (canonical — rendered từ _full screenshot)
- Bounds: w=fill h=hug
- Layout-mode: flex(Row), gap=Gap(AppSizes.spacing8), crossAxis=center
- BG: #ffffff → AppColors.bgBase; radius top BorderRadius.vertical(top: Radius.circular(8))
- Shadow: drop shadow 0 -4 12 rgba(0,0,0,0.06) → AppShadows.boxShadow (verify giá trị shadow token)
- Padding: EdgeInsets.only(top: 16, bottom: 24, left: 16, right: 16)
  #### Button/Edit (icon-only)
  - Bounds: w=FIXED(48px) h=FIXED(48px)
  - BG: #ffffff → AppColors.bgBase; Border 1px solid #0052ff → AppColors.borderActive radius=BorderRadius.circular(8)
  - Icons: standalone assets/icons/edit.svg, 24px, #0052ff → AppColors.buttonBackgroundPrimary
  → flutter: AppButton.icon(icon: edit, appButtonColor: AppButtonColor.custom(...primary outline), appButtonSize: AppButtonSize.medium())
  #### Button/ThanhToan
  - Bounds: w=fill(flex) h=hug; BG #0052ff → AppColors.buttonBackgroundPrimary radius=BorderRadius.circular(8); py=12
  - Text: "+ Thanh toán" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#ffffff → AppColors.textWhite
  → flutter: AppButton.text(title: "+ Thanh toán", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary())
  #### Button/HoSoBH
  - Bounds: w=fill(flex) h=hug; BG #0052ff → AppColors.buttonBackgroundPrimary radius=BorderRadius.circular(8); py=12
  - Text: "+ Hồ sơ BH" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#ffffff → AppColors.textWhite
  → flutter: AppButton.text(title: "+ Hồ sơ BH", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary())

> **Variant note (M8)**: Figma frame chứa 2 design alternate cho Action bar:
> - 319:42472 (h=144, 3-button): Row [Sửa phiếu (bg secondary #f3f3f4 → AppColors.bgSecondary, text #273243 → AppColors.textPrimary) | + Thanh toán (primary)] + full-width [Tạo hồ sơ Bảo hiểm (primary)].
> - 319:42473 (h=88, 2-icon): [edit icon outline] [add icon outline] + full-width [Tạo hồ sơ Bảo hiểm (primary)].
> Bản RENDER trên screenshot (_full) = [edit icon] + [+ Thanh toán] + [+ Hồ sơ BH] (canonical ở trên). DEV verify với widget owner dùng variant nào. Nhãn "Sửa phiếu" ↔ AC-1 "Chỉnh sửa"; "Tạo hồ sơ Bảo hiểm" ↔ AC-1/AC-13 "+ Tạo hồ sơ bảo hiểm" (chỉ enable khi DRAFT — BR-INS-STL-DET-004).

---

## Screen: Chi tiết QT BH — Tab Bảng chi phí · Phân bổ expanded · sub-tab Tổng quan (319:42361)
- Device frame: 375x1463px (phone) — DATA-STATE đầy đủ nhất
- Scaffold / AppBar / 2 khối thông tin / TabBar / ActionBar: **giống Screen 1** (canonical) — không lặp.
- Khác Screen 1: panel "Phân bổ Bảo hiểm" EXPANDED → nút đổi "Thu gọn chi tiết phân bổ ⌃" + lộ Card breakdown với sub-tab "Tổng quan" (active) / "Chi tiết phân bổ".
- Widget Tree (phần khác):
  Section/PhanBoBaoHiem (expanded)
  ├── Header + mô tả + Row[Card PhaiThuBH · Card KHChiuDieuChinh]   (như Screen 1)
  ├── Button/ToggleThuGon "Thu gọn chi tiết phân bổ ⌃"
  └── Card/ChiTietPB
      ├── SubTabBar [Tổng quan* · Chi tiết phân bổ]
      └── Table/TongQuan (3 cột: Khoản mục | BH | KH)

### Button/ToggleThuGon (340:55950 — expanded state)
- Text: "Thu gọn chi tiết phân bổ" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#0052ff → AppColors.buttonBackgroundPrimary
- Icons: trailing assets/icons/arrow_up.svg, 24px, #0052ff → AppColors.buttonBackgroundPrimary
- State: expanded

### Card/ChiTietPB — sub-tab Tổng quan (340:56028)
- Bounds: w=fill h=hug
- Layout-mode: flex(Column), gap=Gap(AppSizes.spacing16), crossAxis=stretch
- BG: #ffffff → AppColors.bgBase radius=BorderRadius.circular(12)
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
  #### SubTabBar (segmented)
  - Bounds: w=fill h=hug
  - BG: #f3f4f6 → Color(0xFFF3F4F6) (gray/100 — log M-3) radius=BorderRadius.circular(8); padding 4
  - Tab "Tổng quan" — ACTIVE: bg #ffffff → AppColors.bgBase radius=BorderRadius.circular(6); text 14px/700 → theme: AppTextStyle.textHeadingH5 color=#0052ff → AppColors.buttonBackgroundPrimary
  - Tab "Chi tiết phân bổ" — inactive: text 14px/700 → theme: AppTextStyle.textHeadingH5 color=#595e69 → AppColors.textSecondary
  → flutter: SegmentedButton hoặc custom toggle — verify catalog (lib/ui/widgets/)
  #### Table/TongQuan (Khoản mục | BH | KH)
  - Layout-mode: flex(Row) 3 cột (cột Khoản mục trái, BH + KH phải canh phải)
  - Header row: ô "Khoản mục" bg #f3f3f4 → AppColors.bgSecondary; "BH" bg #f4f7fe → Color(0xFFF4F7FE) (page-bg — log M-3) màu #0052ff → AppColors.buttonBackgroundPrimary; "KH" bg #fff8ec → Color(0xFFFFF8EC) (orange/50 — log M-3) màu #ff6b00 → AppColors.textWarningPrimary. Header text 14px/700 → theme: AppTextStyle.textHeadingH5
  - Rows (label đen #000000 → Color(0xFF000000) raw — log M-3; BH #0052ff → AppColors.buttonBackgroundPrimary; KH #ff6b00 → AppColors.textWarningPrimary; row text 14px/400 → theme: AppTextStyle.textCaptionC5):

    | Khoản mục | BH | KH |
    |---|---|---|
    | Dịch vụ | 21.000.000 | 0 |
    | Phụ tùng | 168.000.000 | 30.000.000 |
    | VAT | 18.900.000 | 3.000.000 |
    | **Tạm tính sau VAT** (14px/600 → theme: AppTextStyle.textSubtitleS5) | **207.900.000** | **33.000.000** |

  - Divider line ngăn nhóm (#e8e8ea → AppColors.borderPrimary).
  - Hàng "Điều chỉnh BH" (label 14px/400 → AppTextStyle.textCaptionC5): BH 21.000.000 / KH 2.720.000 (bold #0052ff / #ff6b00)
  - Hàng **"Sau điều chỉnh"** (14px/700 → theme: AppTextStyle.textHeadingH5): BH **168.000.000** / KH **2.720.000** (bold)
  → flutter: Table hoặc Column<Row> custom — no catalog widget cho bảng phân bổ — verify với widget owner
  > AC-6 mapping: panel này = tương đương mobile của "Tổng giá dịch vụ" / "Chi tiết theo bên thanh toán" (web). Giá trị khớp FEAT AC-6: Cộng sau VAT BH 207.900.000 / KH 33.000.000.

---

## Screen: Chi tiết QT BH — Tab Bảng chi phí · Phân bổ expanded · sub-tab Chi tiết phân bổ (319:42657)
- Device frame: 375x1419px (phone) — DATA-STATE (sub-tab Chi tiết phân bổ active)
- Scaffold / AppBar / khối thông tin / TabBar / ActionBar / cards Phải thu+KH chịu / toggle: **giống Screen 2**.
- Khác: trong Card/ChiTietPB, sub-tab "Chi tiết phân bổ" ACTIVE → bảng đổi sang danh sách khoản điều chỉnh BH.
- Widget Tree (phần khác):
  Card/ChiTietPB
  ├── SubTabBar [Tổng quan · Chi tiết phân bổ*]
  └── Table/ChiTietPhanBo (label | giá trị)

### Card/ChiTietPB — sub-tab Chi tiết phân bổ (340:56870)
- Bounds: w=fill h=hug; BG #ffffff → AppColors.bgBase radius=BorderRadius.circular(12); padding 16
  #### SubTabBar
  - "Tổng quan" — inactive: text 14px/700 → theme: AppTextStyle.textHeadingH5 color=#595e69 → AppColors.textSecondary
  - "Chi tiết phân bổ" — ACTIVE: bg #ffffff → AppColors.bgBase radius=BorderRadius.circular(6); text 14px/700 → theme: AppTextStyle.textHeadingH5 color=#0052ff → AppColors.buttonBackgroundPrimary
  #### Table/ChiTietPhanBo (label trái + giá trị phải)
  - Layout-mode: flex(Row) 2 cột (label trái / value canh phải); rows gap=Gap(14)
  - Rows (label 14px/400 → theme: AppTextStyle.textCaptionC5 color=#000000 → Color(0xFF000000) raw — log M-3; value 14px/600 → theme: AppTextStyle.textSubtitleS5):

    | Khoản | Giá trị | Màu giá trị |
    |---|---|---|
    | CK liên kết BH - Vật tư | 0 | #15aa2c → AppColors.textSuccessPrimary |
    | CK liên kết BH - Công dịch vụ | 30.000.000 | #15aa2c → AppColors.textSuccessPrimary |
    | Giảm trừ bồi thường | 3.000.000 | #15aa2c → AppColors.textSuccessPrimary |
    | Khấu hao vật tư / thay mới | 33.000.000 | #ff6b00 → AppColors.textWarningPrimary |
    | Khấu trừ bảo hiểm | 33.000.000 | #ff6b00 → AppColors.textWarningPrimary |

  - Divider line (#e8e8ea → AppColors.borderPrimary).
  - Hàng tổng **"KH chịu từ điều chỉnh BH"** (label 14px/700 → theme: AppTextStyle.textHeadingH5 color=#000000 → Color(0xFF000000); value 14px/700 #ff6b00 → AppColors.textWarningPrimary): **2.720.000**
  → flutter: Table/Column custom — verify catalog
  > AC-6 mapping: phần "Phân bổ Bảo hiểm" (CK liên kết BH — Vật tư/Công dịch vụ, Giảm trừ bồi thường, Khấu hao vật tư/thay mới, Khấu trừ BH). Khớp FEAT AC-6. Màu: khoản giảm chi phí (xanh #15aa2c), khoản tăng KH chịu (cam #ff6b00).

---

## Screen: Chi tiết QT BH — Tab Chứng từ & Hoá đơn · empty-state (340:52956)
- Device frame: 375x1118px (phone)
- Scaffold / AppBar / khối thông tin / ActionBar: **giống Screen 1**.
- Khác: TabBar tab "Chứng từ & Hoá đơn" ACTIVE; body tab = EMPTY-STATE.
- Widget Tree (phần khác):
  TabBar [Bảng chi phí · Chứng từ & Hoá đơn* · Hồ sơ Bảo Hiểm · Lịch sử thanh toán]
  └── EmptyState/ChungTu

### EmptyState/ChungTu (340:57630)
- Bounds: w=fill h=hug
- Layout-mode: flex(Column), crossAxis=center, gap=Gap(AppSizes.spacing16)
- BG: #f4f7fe → Color(0xFFF4F7FE) (page-bg — log M-3)
- Illustration: graphic "tài liệu + ?" (placeholder) — assets/images/empty_documents.svg (verify asset path với widget owner)
- Text: "Bạn chưa có Hồ sơ bảo hiểm nào" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#262626 → AppColors.textPrimary
  > M4/coverage_gap AC-7: chỉ empty-state, không có data-state danh sách chứng từ (cột/hành động thêm-xoá). Nhãn empty-state là placeholder dùng chung ("Hồ sơ bảo hiểm") — DEV dùng copy đúng ngữ cảnh "chứng từ & hoá đơn" + reuse cơ chế baseline FEAT-STL-DETAIL (AC-7).
→ flutter: EmptyState widget (verify catalog lib/ui/widgets/) — Column[SvgPicture.asset, Gap, Text]

---

## Screen: Chi tiết QT BH — Tab Lịch sử thanh toán · empty-state (340:53400)
- Device frame: 375x1118px (phone)
- Scaffold / AppBar / khối thông tin / ActionBar: **giống Screen 1**.
- Khác: TabBar cuộn sang phải, tab "Lịch sử thanh toán" ACTIVE; body tab = EMPTY-STATE.
- Widget Tree (phần khác):
  TabBar [… Chứng từ & Hoá đơn · Hồ sơ Bảo Hiểm · Lịch sử thanh toán*]
  └── EmptyState/LichSuThanhToan

### EmptyState/LichSuThanhToan (340:58228)
- Bounds: w=fill h=hug
- Layout-mode: flex(Column), crossAxis=center, gap=Gap(AppSizes.spacing16)
- BG: #f4f7fe → Color(0xFFF4F7FE) (page-bg — log M-3)
- Illustration: graphic "tài liệu + ?" — assets/images/empty_documents.svg (verify asset)
- Text: "Bạn chưa có Hồ sơ bảo hiểm nào" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#262626 → AppColors.textPrimary
  > M4/coverage_gap AC-9: chỉ empty-state. Data-state (bảng lịch sử BH — cột Ngày/Số tiền/Phương thức/Ghi chú/File, sort giảm dần theo ngày) KHÔNG có frame design → DEV fallback FEAT AC-9 copy + component baseline. Nhãn empty-state placeholder ("Hồ sơ bảo hiểm") — dùng copy đúng "lịch sử thanh toán".
→ flutter: EmptyState widget — Column[SvgPicture.asset, Gap, Text]

---

## Screenshots
> assets/wave01-ins-stl-detail/
- `319-42361_full.png` — toàn màn: Tab Bảng chi phí · Phân bổ expanded · sub-tab Tổng quan (data-state)
- `319-42657_full.png` — toàn màn: Phân bổ expanded · sub-tab Chi tiết phân bổ (data-state)
- `340-54941_full.png` — toàn màn: Tab Bảng chi phí · Phân bổ collapsed
- `340-52956_full.png` — toàn màn: Tab Chứng từ & Hoá đơn (empty-state)
- `340-53400_full.png` — toàn màn: Tab Lịch sử thanh toán (empty-state)
- `340-55433.png` — Section: Thông tin quyết toán
- `340-58234.png` — Section: Thông tin khách hàng & xe
- `340-55942.png` — Section: Phân bổ Bảo hiểm (cards + toggle + Card breakdown Tổng quan)
- `340-56870.png` — Card: Chi tiết phân bổ (danh sách khoản điều chỉnh BH)
