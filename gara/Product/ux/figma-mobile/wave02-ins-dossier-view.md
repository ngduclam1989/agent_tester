---
feat: FEAT-INS-DOSSIER-VIEW
feat_file: Product/features/FEAT-INS-DOSSIER-VIEW.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-43731&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "319:43731"
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 3
status: TRANSFORM_FAILED
fallback: Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md
failed_checks:
  - "M-13: AC-coverage cross-check chưa exhaustive — checklist AC-1..AC-8 vs spec body; xem coverage_gaps"
  - "M-14: Decomposition chưa drill leaf — dựa metadata XML + screenshot"
  - "M-18: Section-container PNG ở mức top-level frame (3 frames + _full). Sections lồng (Header bộ hồ sơ · Grid thẻ PDF · Preview PDF) không có PNG riêng — bù qua per-screen PNG + _full"
coverage_gaps:
  - "AC-1 tiền đề tab — frame top-level 'Chi tiết phiếu quyết toán - Phân bổ BH' chứa tab '?' với content preview PDF (frame 410:27599 'Nhóm B — Preview file PDF (cột phải)'). Verify tab bar trên Tab strip mobile có '4 tab' khi payer=BH (Bảng chi phí · Chứng từ & hoá đơn · Hồ sơ bảo hiểm đã xuất · Lịch sử thanh toán) — đồng bộ FEAT-INS-STL-DETAIL AC-4 + BR-INS-STL-DET-007"
  - "AC-3 grid 2-cột thẻ PDF — verify visual: layout 2 cột × N (≤4) thẻ PDF với icon + tên + size + mã phiếu QT trên mỗi thẻ; thẻ chọn highlight viền nổi bật"
  - "AC-4/AC-5 hành động xem PDF — verify hành vi tap thẻ trên mobile: mở native PDF viewer hoặc trình xem in-app (flutter_pdfx / external app launch). Mã CB-INS-DOSSIER-VIEW-002 (BR §5)"
  - "AC-7 nhiều bộ hồ sơ (versioning) — list dọc 'Bộ hồ sơ {mã phiếu QT}' với ngày xuất riêng từng bộ. Frame 410:27794 (1395px) có thể chứa state 2 bộ — verify"
  - "AC-8 empty state — frame nào hiển thị 'Chưa có hồ sơ nào được xuất' (ERR-INS-010 EMPTY_STATE) — verify trong 1 trong 3 frames hoặc gap"
---

## Icon Catalog (shared)

| Figma layer | source | Notes |
|---|---|---|
| vuesax/linear/arrow-left | assets/icons/arrow_left.svg | Back — top app bar leading, 20px |
| vuesax/linear/more (rotate 90) | Icons.more_vert | Kebab — top app bar trailing, 20px |
| Icon PDF | assets/icons/pdf.svg | Card thẻ PDF — đầu thẻ, 24-32px (verify) |
| Tab indicator | Underline 2px #0052ff → borderActive | TabBar tab active |

> **Note (M5 cross-frame)**: 3 frame mobile của FEAT-INS-DOSSIER-VIEW đều là **state của cùng MỘT màn "Chi tiết phiếu quyết toán"** (FEAT-STL-DETAIL extended) ở các sub-state khác nhau — tab "Hồ sơ bảo hiểm đã xuất" active + scroll position khác nhau (812 vs 1395). Header app bar + 2 khối info Top (Thông tin quyết toán + Thông tin KH&xe) + tab bar **giống nhau** trên cả 3 → canonical mô tả ở Screen 1.

---

## Screen: Tab "Hồ sơ bảo hiểm đã xuất" — Preview PDF state (410:27598)
- Device frame: 375x812px (phone — viewport baseline)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg)
- AppBar: có — title "Chi tiết phiếu quyết toán", leading back, trailing kebab
- Body layout: Column (TabContent scroll dọc); active tab = "Hồ sơ bảo hiểm đã xuất"
- BottomBar: action bar phiếu QT (Sửa phiếu · Thanh toán · Hồ sơ BH) — verify
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu quyết toán" · more]
  └── Body: Column
      ├── Section/Header [Thông tin quyết toán + Thông tin KH&xe]  (collapsed/condensed)
      ├── TabBar [Bảng chi phí · Chứng từ & hoá đơn · Hồ sơ bảo hiểm đã xuất* · Lịch sử thanh toán]   ← * active (AC-1)
      └── TabContent: Section/PreviewPDF (frame 410:27599 "Nhóm B — Preview file PDF (cột phải)")
          ├── Card/PreviewPDF (frame 410:27601 — AC-4)
          │   ├── PdfHeader [Garage BD Miền Bắc · 205 Đường Hồ Tùng Mậu]
          │   └── PdfBody    [Nội dung phiếu in render]
          └── (Card lưới thẻ PDF của bộ hồ sơ - có thể ngoài viewport — verify scroll)
  BottomBar: ActionBar phiếu QT — verify (Sửa phiếu/Thanh toán/Hồ sơ BH — AC-13 FEAT-INS-STL-DETAIL)

### CustomAppBar
- BG: #ffffff → AppColors.bgBase; border-bottom 1px #e8e8ea → AppColors.borderPrimary
- Text: "Chi tiết phiếu quyết toán" 16px weight=600 → AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Icons: leading arrow_left 20px · trailing more_vert 20px (#262626 → AppColors.textPrimary)
→ flutter: CustomAppBar(title: "Chi tiết phiếu quyết toán", leading: back, actions: [more])

### TabBar (4 tabs)
- Bounds: w=fill h=FIXED(~44-48px), scroll-x horizontal khi tab labels overflow
- Tab labels (theo BR-INS-DOSSIER-VIEW-008): "Bảng chi phí" · "Chứng từ & hoá đơn" · **"Hồ sơ bảo hiểm đã xuất"** · "Lịch sử thanh toán"
- Tab active = "Hồ sơ bảo hiểm đã xuất" → underline 2px #0052ff → AppColors.borderActive + text color #0052ff → textActivePrimary
- Text inactive: 14px weight=500 → AppTextStyle.textBodyB5 color=#595e69 → AppColors.textSecondary
- Text active: 14px weight=600 → AppTextStyle.textSubtitleS5 color=#0052ff → AppColors.textActivePrimary
→ flutter: DefaultTabController(length: 4, ...) + TabBar(isScrollable: true, ...) với customStyle

### Section/PreviewPDF (410:27599)
- Bounds: w=fill h=517px (verify viewport)
- Layout: Card → Container (BG #ffffff → bgBase) chứa Preview PDF (chế độ read-only viewer)
- Card title: hiển thị thông tin garage ở đầu PDF ("Garage BD Miền Bắc" · địa chỉ "205 Đường Hồ Tùng Mậu") — tự từ template PDF
- Tap card → mở PDF viewer fullscreen (AC-4 + AC-5)
→ flutter: PdfPreviewCard(filePath, onTap: () => openPdfFullscreen(...)); rendering qua flutter_pdfx hoặc native viewer launch

---

## Screen: Tab "Hồ sơ bảo hiểm đã xuất" — Grid thẻ PDF + scroll dài (410:27794)
- Device frame: 375x1395px (scroll vertical dài — state list nhiều bộ hồ sơ hoặc full grid expanded)
- Scaffold + AppBar: identical Screen 410:27598 (canonical)
- Body: Column scroll
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu quyết toán" · more]
  └── Body: SingleChildScrollView → Column
      ├── Section/Header                            (collapsed condensed)
      ├── TabBar [4 tabs, "Hồ sơ bảo hiểm đã xuất"* active]
      └── TabContent/HoSoDaXuat
          ├── BoHoSo/v_latest                       ← AC-2 (mới nhất top)
          │   ├── BoHoSoHeader [tiêu đề "Bộ hồ sơ #SET-20260326-00001" + dòng phụ "Xuất ngày dd/mm/yyyy hh:mm · N tài liệu PDF"]
          │   └── Grid 2-cột × N (≤4) thẻ PDF       ← AC-3
          │       ├── Card/PDF "Phiếu quyết toán.pdf · 100kb" + mã #SET-...
          │       ├── Card/PDF "Phiếu báo giá.pdf · 80kb" + mã
          │       ├── Card/PDF "Biên bản nghiệm thu.pdf · 120kb" + mã
          │       └── Card/PDF "Giấy ủy quyền.pdf · 90kb" + mã
          └── BoHoSo/v_n-1 (nếu có bộ trước)        ← AC-7
              ├── BoHoSoHeader [tiêu đề + ngày xuất]
              └── Grid 2-cột

### BoHoSoHeader
- Padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)
- Title "Bộ hồ sơ #SET-20260326-00001" 16px weight=600 → AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Subtitle "Xuất ngày 26/03/2026 08:05 · 4 tài liệu PDF" 12px weight=400 → AppTextStyle.textCaptionC7 color=#888c94 → AppColors.textTertiary
→ flutter: Column với 2 Text + Gap(AppSizes.spacing4)

### Card/PDF (AC-3)
- Bounds: w=fill (½ row trừ gap) h=hug (FIXED ~100-120px verify)
- Layout: Column gap=Gap(AppSizes.spacing8), padding=EdgeInsets.all(12)
- BG: #ffffff → AppColors.bgBase
- Border: 1px solid #e8e8ea → AppColors.borderPrimary; selected highlight → 2px #0052ff → AppColors.borderActive (AC-3: "thẻ đang chọn highlight viền nổi bật")
- Border radius: 8 → BorderRadius.circular(8)
- Content:
  - Icon PDF (top-left) 24-32px
  - Tên file + size ("Phiếu quyết toán.pdf · 100kb") same line — 14px weight=500 → AppTextStyle.textBodyB5 color=#262626 → AppColors.textPrimary
  - Mã phiếu QT "#SET-20260326-00001" 12px weight=400 → AppTextStyle.textCaptionC7 color=#888c94 → AppColors.textTertiary
- Tap → mở PDF (AC-4)
→ flutter: InkWell(onTap, child: Container(decoration: ..., child: Column([Icon, Text, Text]))); reuse pattern AppCard nếu có

### Grid layout
- 2-column GridView with mainAxisSpacing/crossAxisSpacing = 12 (AppSizes.spacing12)
- Padding outer: EdgeInsets.symmetric(horizontal: 16)
→ flutter: GridView.builder(gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: ..., mainAxisSpacing: 12, crossAxisSpacing: 12), itemCount: N, itemBuilder: (ctx, i) => Card/PDF)

---

## Screen: Tab state khác hoặc Empty state (410:27966)
- Device frame: 375x812px
- Scaffold + AppBar: identical Screen 410:27598 (canonical)
- Body: variant — verify visual qua screenshot `410-27966.png`. Có thể là:
  - **Empty state** "Chưa có hồ sơ nào được xuất" (AC-8 + ERR-INS-010)
  - State scroll khác của tab Hồ sơ đã xuất
  - State trước khi tap thẻ PDF (default highlight thẻ đầu)
- Widget Tree (tentative — verify):
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu quyết toán" · more]
  └── Body: Column
      ├── Section/Header (condensed)
      ├── TabBar [4 tabs]
      └── TabContent/HoSoDaXuat
          └── (Empty state hoặc grid state default highlight)

### EmptyState/HoSoTrong (tentative — AC-8)
- Centered Column với:
  - Icon empty (vd assets/icons/empty_folder.svg hoặc Icons.folder_open) ~64-80px #b8babf → AppColors.textQuaternary
  - Text "Chưa có hồ sơ nào được xuất" 14px weight=500 → AppTextStyle.textBodyB5 color=#888c94 → AppColors.textTertiary
- Vị trí: center body khi list rỗng (BR-INS-DOSSIER-VIEW-002)
→ flutter: EmptyState widget (nếu có) hoặc Center(child: Column([Icon, Gap, Text]))

> **Verify gap**: confirm 410:27966 là empty-state hay grid state — visual reconcile với `assets/wave02-ins-dossier-view/410-27966.png`.

---

## Screenshots
> assets/wave02-ins-dossier-view/
- `_full.png` — toàn section FEAT-INS-DOSSIER-VIEW (1467x1840 → 1547x1920)
- `410-27598.png` — Screen 1: Tab "Hồ sơ bảo hiểm đã xuất" preview PDF (375x812)
- `410-27794.png` — Screen 2: Tab — grid thẻ PDF scroll dài (375x1395)
- `410-27966.png` — Screen 3: State variant / empty (375x812)
