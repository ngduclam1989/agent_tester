---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571
file_key: nAoFS33sTWj3ctWjZMUDEl
node_id: "319:65571"
fetched_at: 2026-06-04T10:34:34+07:00
transform_version: 5
screenshots: true
screens_expected: 1
coverage_gaps:
  - "AC-8: nút 'Áp dụng tất cả' khấu hao — KHÔNG có trên design mobile (Khấu hao = 1 field % đơn, không có cột '% khấu hao' per dòng phụ tùng → cơ chế đồng loạt/override không render trên màn này)"
  - "AC-5 (cách b): cột 'Khấu hao (%)' per dòng phụ tùng — KHÔNG render (mobile chỉ có 1 field % tổng)"
  - "AC-10: section 'Phân bổ Bảo hiểm' (5 dòng điều chỉnh có dấu ±/màu) — KHÔNG render dạng 5 dòng riêng; mobile gộp thành bảng 'Tổng hợp phân bổ' (Tạm tính sau VAT / Điều chỉnh BH / Sau điều chỉnh)"
  - "AC-11: khối 'Cân thanh toán' 3 ô (BH/KH/Tổng) — mobile thay bằng 2 result card đầu màn (Dự kiến BH thanh toán / Dự kiến KH thanh toán); KHÔNG có ô 'Tổng thanh toán' riêng"
  - "AC-12: cảnh báo 'BH thanh toán không thể âm' — không thấy state cảnh báo trên screenshot (default state, không âm)"
  - "AC-2: khu vực thông tin bảo hiểm baseline (toggle + dropdown công ty BH + 6 trường + upload) — nằm ở tab khác ('Hồ sơ Bảo Hiểm'), KHÔNG thuộc màn 'Phân bổ bảo hiểm' này"
---

# Figma DEV Spec (mobile) — FEAT-INS-SO-ADJUSTMENT

> Nhập & tính các khoản điều chỉnh BH trên Phiếu dịch vụ — tab **"Phân bổ bảo hiểm"** trong màn Chỉnh sửa phiếu dịch vụ.
> Node section gốc `319:65571` chứa 1 màn mobile (frame `238:41124` "Chi tiết phiếu quyết toán - Phân bổ BH"). Sibling `319:68504` là title-frame cross-feature (loại).
> ⚠️ Theo G3 (mcp-tools §4): reference code là JSX không tin được cho Flutter → token/structure dựa metadata + variable_defs + screenshot.

## Icon Catalog (shared)

| Figma layer | source | Notes |
|---|---|---|
| vuesax/linear/arrow-down | `Icons.keyboard_arrow_down` (hoặc `assets/icons/arrow_down.svg`) | trailing icon dropdown đơn vị trong input số |
| vuesax/linear/arrow-left (nav back) | `Icons.arrow_back_ios` (hoặc `assets/icons/arrow_left.svg`) | nút back trên AppBar |

---

## Screen: Chi tiết phiếu quyết toán - Phân bổ BH (238:41124)

- Device frame: 375x1560px (phone, nội dung cao → scroll vertical)
- Scaffold: CustomScaffold, bg=#f4f7fe → `Color(0xFFF4F7FE)` // page-bg, không match AppColors semantic (M-3 escape)
- AppBar: có — title "Chỉnh sửa phiếu dịch vụ", leading back, trailing kebab (3 chấm). Dưới AppBar là TabBar 4 tab (… Chứng từ & Hoá đơn | Hồ sơ Bảo Hiểm | **Phân bổ bảo hiểm** active). Tab active = "Phân bổ bảo hiểm".
- Body layout: ListView (scroll), gap=Gap(AppSizes.spacing16) giữa các section-card
- Padding: ngang EdgeInsets.symmetric(horizontal: 16) → AppSizes.spacing16 (card có margin 16px mỗi bên)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [title "Chỉnh sửa phiếu dịch vụ", back, kebab]
  ├── TabBar [tabs: …, "Hồ sơ Bảo Hiểm", "Phân bổ bảo hiểm"(active)]
  └── ListView
      ├── Section/HeaderFormula        (238:41223)
      ├── Row/ResultCards              (238:41225)  [Card BH | Card KH]
      ├── Card/PanelNhapDieuChinh      (238:41467)  [5 × Input/Basic]
      ├── Card/TongHopPhanBo           (238:41798)  [bảng 3 cột + footer note]
      └── ActionBar/Bottom             (238:41236/238:41249)  [Huỷ | Lưu]
- BottomBar: có (Action bar pinned dưới) — xem Section/ActionBar.

---

### Section/HeaderFormula (238:41223)
- Bounds: w=fill h=hug (FIXED 54px)
- Layout-mode: flex (Column)
- Padding: EdgeInsets.only(left: 16, right: 16) → AppSizes.spacing16
- Text (tiêu đề): "Phân bổ Bảo hiểm" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#172554 → `Color(0xFF172554)` // tailwind blue/950, không match AppColors (M-3 escape)
- Text (mô tả công thức): "BH thanh toán = phần bảo hiểm duyệt sau chiết khấu liên kết, giảm trừ bồi thường, khấu hao vật tư và khấu trừ bảo hiểm. KH thanh toán gồm phần tự trả và các khoản bị loại trừ." 14px weight=400 → theme: AppTextStyle.textCaptionC5 color=#71717a → AppColors.textMutedForeground
→ flutter: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text("Phân bổ Bảo hiểm", style: AppTextStyle.textHeadingH3), Gap(AppSizes.spacing4), Text("BH thanh toán = …", style: AppTextStyle.textCaptionC5)])

---

### Row/ResultCards (238:41225)
- Bounds: w=fill h=hug (FIXED 110px frame; mỗi card 164.5x78)
- Layout-mode: flex (Row), gap=Gap(AppSizes.spacing16), mainAxis=spaceBetween, 2 card chia đôi
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
- Note (M5/M7): 2 card cùng cấu trúc, khác màu accent + nhãn + giá trị → 1 block canonical + biến thể.

  #### Card/KetQua (canonical) — 2 instance: BH (xanh) | KH (cam)
  - Bounds: w=fill (Expanded) h=FIXED(78px)
  - Layout-mode: flex (Column), crossAxis=start
  - BG: #ffffff → AppColors.bgBase
  - Border: 1px solid {accent} radius=12 → BorderRadius.circular(12) // border radius/xl
    - instance BH: border #1e88ff → AppColors.borderActive (carDoctor/500)
    - instance KH: border #f97316 → `Color(0xFFF97316)` // tailwind orange/500, không match AppColors (M-3 escape)
  - Padding: EdgeInsets.all(12) → `EdgeInsets.all(12)` // AppSizes không có spacing12 chính thức → literal + comment (M-7 escape)
  - Text (label): 14px weight=500 → theme: AppTextStyle.textBodyB5
    - BH: "Dự kiến BH thanh toán" color=#0052ff → AppColors.textActivePrimary
    - KH: "Dự kiến KH thanh toán" color=#ff6b00 → AppColors.textWarningPrimary (bg-Warning-Strong)
  - Text (giá trị): 18px weight=700 → theme: AppTextStyle.textHeadingH3
    - BH: "197.680.000đ" color=#0052ff → AppColors.textActivePrimary
    - KH: "2.720.000đ" color=#ff6b00 → AppColors.textWarningPrimary
  → flutter: Expanded(child: Container(decoration: BoxDecoration(color: AppColors.bgBase, border: Border.all(color: AppColors.borderActive), borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text("Dự kiến BH thanh toán", style: AppTextStyle.textBodyB5.copyWith(color: AppColors.textActivePrimary)), Text("197.680.000đ", style: AppTextStyle.textHeadingH3.copyWith(color: AppColors.textActivePrimary))]))) // instance KH: border Color(0xFFF97316) + color AppColors.textWarningPrimary
  - Data note: nhãn + accent từ AC-11 ("BH thanh toán" ô xanh / "Khách hàng thanh toán" ô cam); giá trị computed server-side (`settlementBalance.bhPayment` / `customerPayment`) — §4 API.

---

### Card/PanelNhapDieuChinh (238:41467) — "Hạng mục" (5 khoản điều chỉnh)
- Bounds: w=fill h=hug (FIXED 598px instance), card 343px rộng
- Layout-mode: flex (Column), gap=Gap(AppSizes.spacing16)
- BG: #ffffff → AppColors.bgBase (base/card)
- Border: 1px solid #ffffff radius=12 → BorderRadius.circular(12) // viền trùng nền (borderless card); nếu cần tách → AppColors.borderPrimary
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
- Header text: "Hạng mục" 16px weight=700 → theme: AppTextStyle.textHeadingH4 color=#172554 → `Color(0xFF172554)` // blue/950 (M-3 escape)

  #### Column/InputList (Slot)
  - Bounds: w=fill h=hug
  - Layout: Column, gap=Gap(AppSizes.spacing16), crossAxis=stretch
  - Note (M5): 5 instance "Input / Basic" cùng cấu trúc (Label + ô nhập số + suffix đơn vị + dropdown arrow + helper text). 1 block canonical + bảng biến thể bên dưới.

    #### Input/Basic (canonical) — TextField số + suffix đơn vị
    - Bounds: w=fill h=hug. Ô input h=FIXED(36px) // height/h-9
    - Layout-mode: flex (Column), gap=Gap(AppSizes.spacing8)
    - Label: {nhãn} 14px weight=500 → theme: AppTextStyle.textBodyB5 color=#71717a → AppColors.textMutedForeground
    - Ô input:
      - BG: #ffffff → AppColors.bgBase (base/background)
      - Border: 1px solid #e4e4e7 radius=8 → BorderRadius.circular(8) // border radius/lg; #e4e4e7 (base/input) ≈ #e8e8ea → AppColors.borderPrimary
      - Padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4) → vertical AppSizes.spacing4; horizontal `12` literal // M-7: 12 ngoài scale → literal + comment
      - Layout-mode (trong ô): flex (Row), gap=Gap(AppSizes.spacing4), items=center
      - Text giá trị (input): "{value}" 14px weight=300(Light) → theme: AppTextStyle.textCaptionC5 color=#000000 → AppColors.textPrimary // M-4: weight Light(300) không có token chính xác → C5 + comment
      - Text suffix đơn vị: "{vnđ|%}" 14px weight=300 → theme: AppTextStyle.textCaptionC5 color=#71717a → AppColors.textMutedForeground, align=right
      - Icons:
        - trailing (chỉ field có dropdown đơn vị): vuesax/linear/arrow-down, 20px, #71717a → AppColors.textMutedForeground
    - Helper text (dưới ô): {mô tả} 12px weight=300 → theme: AppTextStyle.textCaptionC7 color=#71717a → AppColors.textMutedForeground
    → flutter: AppTextField(label: "{nhãn}", suffix: _UnitDropdown(value: "vnđ"|"%"), helperText: "{mô tả}", keyboardType: TextInputType.number) // suffix = dropdown đơn vị VND/% (arrow-down); field chỉ-% (Khấu hao) suffix "%" tĩnh không dropdown — verify với widget owner

| # | Nhãn (Label) | value (mock) | suffix đơn vị | dropdown? | Helper text | AC |
|---|---|---|---|---|---|---|
| 1 | Chiết khấu liên kết BH - Vật tư | 2.000.000 | vnđ | có (VND/%) | Khoản garage giảm trừ cho doanh nghiệp bảo hiểm trên phần vật tư/phụ tùng. | AC-3 |
| 2 | Chiết khấu liên kết BH - Công dịch vụ | 2.000.000 | vnđ | có (VND/%) | Khoản garage giảm trừ cho doanh nghiệp bảo hiểm trên phần công sửa chữa. | AC-4 |
| 3 | Khấu hao vật tư / thay mới | 5 | % | không (chỉ %) | Tỷ lệ khấu hao vật tư do khách hàng chịu, có thể áp dụng đồng loạt hoặc chỉnh riêng từng phụ tùng. | AC-5/AC-8 |
| 4 | Giảm trừ bồi thường | 1.000.000 | vnđ | có (VND/%) | Khoản loại trừ hoặc giảm bồi thường theo hồ sơ bảo hiểm, chuyển sang khách hàng chi trả. | AC-6 |
| 5 | Khấu trừ bảo hiểm | 1.000.000 | vnđ | có (VND/%) | Khoản khấu trừ theo hợp đồng mà khách hàng phải tự thanh toán. | AC-7 |

> **AC-8/AC-5(b) gap**: Khấu hao trên mobile là **1 field % đơn** (#3), suffix "%" tĩnh — **KHÔNG có** nút "Áp dụng tất cả" và **KHÔNG có** cột "Khấu hao (%)" per dòng phụ tùng. Helper text gợi ý "áp dụng đồng loạt hoặc chỉnh riêng" nhưng UI cơ chế per-line không render trên màn này → coverage_gaps. DEV fallback theo AC-8 nếu cần cơ chế đồng loạt.
> **AC-7 note (M2)**: design mobile suffix "vnđ" + dropdown arrow cho Khấu trừ BH, nhưng BR-INS-SO-ADJ-003/AC-7 chốt Khấu trừ BH **chỉ VND, không %** → DEV bind dropdown chỉ 1 option VND (hoặc disable đổi đơn vị). Lệch design vs AC → theo AC.

---

### Card/TongHopPhanBo (238:41798) — "Tổng hợp phân bổ"
- Bounds: w=fill h=hug (FIXED 368px instance), card 343px
- Layout-mode: flex (Column), gap=Gap(AppSizes.spacing16)
- BG: #ffffff → AppColors.bgBase
- Border: 1px radius=12 → BorderRadius.circular(12)
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
- Header text: "Tổng hợp phân bổ" 18px weight=700 → theme: AppTextStyle.textHeadingH3 color=#172554 → `Color(0xFF172554)` // blue/950 (M-3 escape)

  #### Section/BangPhanBo (0:184) — bảng 3 cột
  - Bounds: w=fill h=hug
  - Layout-mode: flex (Row) gồm 3 cột (Khoản mục ~103px | BH ~103px | KH ~103px), mỗi cột là Column các dòng. Header row + 4 dòng dữ liệu + Line phân cách + 2 dòng tổng.
  - Header row (0:192/0:208/0:223):
    - "Khoản mục" 14px weight=500 → theme: AppTextStyle.textBodyB5 color=#262626 → AppColors.textPrimary; nền header #f4f7fe → `Color(0xFFF4F7FE)` // dialog-primary-bg (M-3 escape)
    - "BH" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#0052ff → AppColors.textActivePrimary, align=right
    - "KH" 14px weight=700 → theme: AppTextStyle.textHeadingH5 color=#ff6b00 → AppColors.textWarningPrimary, align=right
  - Dòng dữ liệu (Khoản mục | BH | KH) — Text 14px weight=400 → theme: AppTextStyle.textCaptionC5; cột nhãn color=#262626 → AppColors.textPrimary, cột BH color=#0052ff → AppColors.textActivePrimary, cột KH color=#ff6b00 → AppColors.textWarningPrimary, align=right:
    - "Dịch vụ" | 21.000.000 | 0
    - "Phụ tùng" | 168.000.000 | 30.000.000
    - "VAT (10%)" | 18.900.000 | 3.000.000  // nhãn "(10%)" phản ánh thuế nhập per dòng (AC-9), không cố định
    - "Tạm tính sau VAT" (weight=700 → AppTextStyle.textHeadingH5) | 207.900.000 | 33.000.000  // = "Cộng sau VAT" trong FEAT AC-9 (mobile dùng nhãn "Tạm tính sau VAT")
  - Line phân cách (0:239): 1px → AppColors.borderPrimary
  - Dòng tổng (0:240) — 2 dòng:
    - "Điều chỉnh BH" (weight=700 → AppTextStyle.textHeadingH5) | 21.000.000 | 2.720.000
    - "Sau điều chỉnh" (weight=700 → AppTextStyle.textHeadingH5) | 168.000.000 | 2.720.000
  → flutter: Table(columnWidths: {...}, children: [...]) // no catalog widget — financial summary 3-col, verify với widget owner; dùng Table hoặc Row+Expanded
  - Footer note text (0:262): "(Dịch vụ + phụ tùng + VAT, sau chiết khấu liên kết và các khoản khách hàng chịu)" 12px weight=400 → theme: AppTextStyle.textCaptionC7 color=#71717a → AppColors.textMutedForeground

> **AC-9 coverage OK**: bảng "Chi tiết theo bên thanh toán" (Dịch vụ/Phụ tùng/VAT/Tạm tính sau VAT × BH/KH) render đầy đủ.
> **AC-10/AC-11 gap**: mobile **KHÔNG** render section "Phân bổ Bảo hiểm" dạng 5 dòng điều chỉnh riêng (±/màu) cũng **KHÔNG** có khối "Cân thanh toán" 3 ô. Thay bằng: (a) 2 result card đầu màn (BH/KH thanh toán dự kiến — AC-11 một phần), (b) 2 dòng tổng "Điều chỉnh BH"/"Sau điều chỉnh" trong bảng này. → coverage_gaps; DEV theo AC-10/AC-11 nếu cần layout chi tiết hơn.

---

### Section/ActionBar (238:41236 + 238:41249)
- Bounds: w=fill h=hug (FIXED 88px), pinned bottom
- Layout-mode: flex (Row), gap=Gap(AppSizes.spacing16), padding EdgeInsets.all(16) → AppSizes.spacing16
- BG: #ffffff → AppColors.bgBase, shadow trên → AppShadows.boxShadow
- Note (M7): metadata mark 238:41236 (2 button) hidden + 238:41249 (1 button Lưu) visible, **nhưng** `_full.png` render CẢ 2 button "Huỷ chỉnh sửa" + "Lưu chỉnh sửa" → theo screenshot ground-truth (M7) render 2 button.

  #### AppButton/HuyChinhSua (secondary)
  - Bounds: w=flex h=FIXED(48px) // AppButtonSize.medium
  - BG: #f3f3f4 → AppColors.buttonBackgroundSecondary (Base/bg-Secondary)
  - Text: "Huỷ chỉnh sửa" 16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
  → flutter: AppButton.text(title: "Huỷ chỉnh sửa", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.custom(backgroundColor: AppColors.buttonBackgroundSecondary, titleColor: AppColors.textPrimary), onPress: ...)

  #### AppButton/LuuChinhSua (primary)
  - Bounds: w=fill/flex h=FIXED(48px) // AppButtonSize.medium
  - BG: #0052ff → AppColors.buttonBackgroundPrimary
  - Text: "Lưu chỉnh sửa" 16px weight=600 → theme: AppTextStyle.textSubtitleS4 color=#ffffff → AppColors.textWhite
  → flutter: AppButton.text(title: "Lưu chỉnh sửa", appButtonSize: AppButtonSize.medium(), appButtonColor: AppButtonColor.primary(), onPress: ...)
  - Data note: nhãn "Lưu" theo AC-13 (lưu các trường điều chỉnh khi lưu SO).

---

## Screenshots
> assets/wave01-ins-so-adjustment/
- `_full.png` — toàn screen "Phân bổ bảo hiểm" (238:41124)
- `238-41223.png` — Section: Header + dòng mô tả công thức
- `238-41225.png` — Row: 2 result card (Dự kiến BH / KH thanh toán)
- `238-41467.png` — Card: Panel nhập "Hạng mục" (5 field điều chỉnh)
- `238-41798.png` — Card: Bảng "Tổng hợp phân bổ" (3 cột BH/KH)
- `238-41249.png` — Action bar (nút Lưu chỉnh sửa)
