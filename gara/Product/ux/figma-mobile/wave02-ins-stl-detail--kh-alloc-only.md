---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=758-28571&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "758:28571"
screen_slug: kh-alloc-only
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 1
status: TRANSFORM_FAILED
fallback: Product/ux/figma-mobile/wave02-ins-stl-detail--section.md
related_cr: CR-20260618-01
related_feat: [FEAT-INS-STL-CREATE, FEAT-INS-STL-DETAIL]
failed_checks:
  - "M-13: AC coverage cho case 'BH 100% + KH chịu phân bổ' chưa có AC riêng trong FEAT-INS-STL-DETAIL — cần cascade CR-20260618-01 vào FEAT.md trước khi DEV impl"
  - "M-14: Decomposition chưa drill leaf — sub-tree của node 758:28571 (text Số tiền, dòng phân bổ) chưa fetch design_context per-leaf; widget tree dựa metadata + screenshot"
  - "M-11: Widget Tree integrity ở cấp section, leaf widget mapping → component cần verify khi DEV impl"
  - "M-18: Section-container PNG chỉ 1 (_full.png = toàn screen 758:28571). Nested cards (Header info · Section Phân bổ BH · Tổng thanh toán) chưa có PNG riêng — bù qua _full"
coverage_gaps:
  - "AC mới (chưa có trong FEAT-INS-STL-DETAIL v hiện tại): case 'phiếu QT KH chỉ phân bổ BH' khi BH chi trả 100% phụ tùng + dịch vụ. CR-20260618-01 cần cascade vào FEAT-INS-STL-DETAIL.md (BR-INS-STL-CRE-* mới) trước khi DEV ref."
  - "Verify visual với screenshot `_full.png`: layout KHÔNG có Section/DichVuThucHien + Section/PhuTungSuDung (vì BH 100% phụ tùng + dịch vụ → KH không chịu)"
  - "Verify Section/PhanBoBaoHiem chỉ render 3 khoản (dấu +): Khấu trừ bảo hiểm · Khấu hao vật tư-thay mới · Giảm trừ bồi thường. ẨN 2 khoản CK liên kết BH (Vật tư + Công DV) — chốt CR-20260616-01 (đã chốt) áp dụng tại đây"
  - "Verify Section/CanThanhToan: chỉ 1 dòng 'Tổng thanh toán' = tổng 3 khoản phân bổ (KHÔNG có dòng 'Thành tiền dịch vụ' + 'Thành tiền phụ tùng')"
  - "Verify bản in (PRINT-INS-007 — CR-20260616-01): in phiếu KH 3 khoản dấu (+) khớp template. Mẫu Product/ux/assets/SETTLEMENT-INSURANCE-001-print-customer.html"
---

> ⚠️ **CR-20260618-01 — INS-STL-CREATE-DUAL-VOUCHER-WHEN-INSURANCE-COVERS-ALL** (APPROVED 2026-06-18, slot W02 Phase A)
>
> Layout phiếu QT KH **"chỉ phân bổ BH"** — case "Bảo hiểm chi trả 100% phụ tùng + dịch vụ, Khách hàng vẫn còn chịu 3 khoản phân bổ BH" (Khấu trừ bảo hiểm + Khấu hao vật tư-thay mới + Giảm trừ bồi thường > 0). Logic sinh phiếu QT KH **đã mở rộng**: tạo phiếu KH kể cả khi không có phụ tùng/dịch vụ KH chi trả, miễn là có khoản phân bổ BH chuyển KH chịu > 0. Cụm CR liên quan: CR-20260612-01 (panel chi tiết per-payer) · CR-20260616-01 (bản in 3 khoản dấu +) · CR-20260616-02 (panel 2 cột).
>
> **Cross-link FEAT**: chỉ render khi `FEAT-INS-STL-CREATE` (logic) quyết định sinh phiếu QT KH với mode `insuranceCoversAll=true`. Layout = thuộc `FEAT-INS-STL-DETAIL`.

## Icon Catalog (shared)
> Refer wave02-ins-stl-detail--section.md §Icon Catalog (canonical). Mobile icon set giữ nguyên cross-screen.

---

## Screen: Phiếu QT KH "chỉ phân bổ BH" — BH 100% + KH chịu phân bổ (758:28571)
- Device frame: 375x1703px (phone — scroll vertical vừa, ngắn hơn các phiếu QT KH có dịch vụ vì lược bỏ 2 bảng line-item)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg)
- AppBar: có — title "Chi tiết phiếu quyết toán" (verify), leading back, trailing kebab
- Body layout: SingleChildScrollView → Column (sections stacked, divider 6px #f4f7fe giữa các khối)
- BottomBar: có — ActionBar phiếu QT KH (Sửa phiếu · Thanh toán · KHÔNG có entry "+ Tạo hồ sơ bảo hiểm" vì payer ≠ BH — verify gate BR-INS-DOSSIER-011)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu quyết toán" · more]
  └── Body: SingleChildScrollView
      └── Column
          ├── Section/ThongTinQuyetToan        [Mã phiếu QT (KH) · Người tạo · Bên thanh toán = Khách hàng · Ngày tạo · Ghi chú]
          ├── Gap(6) divider #f4f7fe
          ├── Section/ThongTinKhachHangXe       [Tên KH · SĐT · Loại KH · Hãng xe · Biển số · Số KM]
          ├── TabBar [Bảng chi phí* · Chứng từ & Hoá đơn · Lịch sử thanh toán]   ← * active
          ├── Section/PhanBoBaoHiem (CR-20260618-01 — chỉ 3 khoản dấu +)
          │   ├── Header "Phân bổ Bảo hiểm"
          │   ├── Row [Khấu trừ bảo hiểm: +XXX.XXXđ] (dấu + đỏ — chuyển KH chịu)
          │   ├── Row [Khấu hao vật tư-thay mới: +XXX.XXXđ] (dấu + đỏ)
          │   └── Row [Giảm trừ bồi thường: +XXX.XXXđ] (dấu + đỏ)
          │   (⚠ ẨN: 2 khoản CK liên kết BH Vật tư + Công DV — CR-20260616-01)
          └── Section/CanThanhToan
              └── Row [Tổng thanh toán: XXX.XXXđ] (= tổng 3 khoản phân bổ KH chịu — bold, highlight)
  BottomBar: ActionBar [Sửa phiếu · Thanh toán]

### CustomAppBar
- BG: #ffffff → AppColors.bgBase; border-bottom 1px #e8e8ea → AppColors.borderPrimary
- Text: "Chi tiết phiếu quyết toán" 16px weight=600 → AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Icons: leading arrow_left 20px · trailing more_vert 20px (#262626 → AppColors.textPrimary)
→ flutter: CustomAppBar(title: "Chi tiết phiếu quyết toán", leading: back, actions: [more])

### Section/ThongTinQuyetToan
- Layout: Column gap=Gap(AppSizes.spacing8), padding=EdgeInsets.all(16)
- BG: #ffffff → AppColors.bgBase
- Header: "Thông tin quyết toán" 18px weight=700 → AppTextStyle.textHeadingH3 color=#262626 → AppColors.textPrimary
- Body: InfoRow[{label, value, icon}] (label 14px C5 textTertiary · value 14px B5 textPrimary)
  - Mã phiếu: link "#SET-..." (textActivePrimary #0052ff)
  - Phiếu DVLK: link "PDV-..." (textActivePrimary)
  - Người tạo: vd "Chủ doanh nghiệp"
  - **Bên thanh toán: "Khách hàng"** (KHÔNG phải "Bảo hiểm")
  - Ngày tạo + Cập nhật
  - Ghi chú: text "_" rỗng
→ flutter: Reuse Section/ThongTinQuyetToan pattern từ wave02-ins-stl-detail--section.md (canonical)

### Section/ThongTinKhachHangXe
- Layout: Column gap=Gap(AppSizes.spacing8), padding=EdgeInsets.all(16)
- Reuse pattern — không khác phiếu QT KH thông thường
→ flutter: Same as section spec canonical

### TabBar
- 3 tabs (KHÔNG có "Hồ sơ bảo hiểm đã xuất" vì payer=KH — BR-INS-DOSSIER-VIEW-008 ẩn tab này khi payer≠BH)
- Active tab default: "Bảng chi phí"
→ flutter: DefaultTabController(length: 3) — bộ tab baseline phiếu QT KH

### Section/PhanBoBaoHiem (CR-20260618-01 + CR-20260616-01)
- Bounds: w=fill h=hug
- BG: #ffffff → AppColors.bgBase
- Padding: EdgeInsets.all(16)
- Header: "Phân bổ Bảo hiểm" 16px weight=700 → AppTextStyle.textHeadingH4 color=#262626 → AppColors.textPrimary
- 3 dòng (CR-20260616-01 chốt 2026-06-16 — ẨN 2 khoản CK liên kết BH; CR-20260618-01 mở rộng case BH 100%):
  1. **Khấu trừ bảo hiểm**: label Body/B5 textPrimary · value `+XXX.XXXđ` dấu `+` Caption/C5 weight=500 color=#ed1f42 → AppColors.textErrorPrimary
  2. **Khấu hao vật tư-thay mới**: cùng pattern
  3. **Giảm trừ bồi thường**: cùng pattern
- KHÔNG hiển thị 2 khoản:
  - ❌ CK liên kết BH - Vật tư (ẨN — chỉ ảnh hưởng bên BH)
  - ❌ CK liên kết BH - Công dịch vụ (ẨN)
→ flutter: Column với ListView.builder(itemCount: 3) hoặc 3 PanelAllocationRow component reuse từ FEAT-INS-STL-DETAIL panel "Phân bổ Bảo hiểm" + filter prop `hiddenKeys: [ck_lien_ket_vat_tu, ck_lien_ket_cong_dv]`

### Section/CanThanhToan
- Bounds: w=fill h=hug
- BG: #ffffff → AppColors.bgBase, border-top 1px #e8e8ea → borderPrimary
- Padding: EdgeInsets.all(16)
- Row layout: Text "Tổng thanh toán" (label, weight=600) `——` Text value (bold + highlight color brand-blue #0052ff → textActivePrimary HOẶC textPrimary tuỳ visual reconcile)
- Value = tổng 3 khoản phân bổ KH chịu
- KHÔNG có dòng "Thành tiền dịch vụ" + "Thành tiền phụ tùng" (case BH 100% → KH không chịu service/parts)
→ flutter: Row([Text("Tổng thanh toán", weight=600), Spacer(), Text(amount, weight=700, color: highlight)])

### BottomBar/ActionBar
- Layout: Row sticky bottom, padding=EdgeInsets.all(16)
- 2 nút: "Sửa phiếu" (secondary) · "Thanh toán" (primary, nếu chưa thanh toán đủ)
- KHÔNG có "+ Tạo hồ sơ bảo hiểm" (gate BR-INS-DOSSIER-011 — chỉ hiển thị khi payer=BH; ở đây payer=KH → ẩn)
→ flutter: Row([Expanded(AppButton.text("Sửa phiếu", secondary)), Gap(12), Expanded(AppButton.text("Thanh toán", primary))])

---

## Screenshots
> assets/wave02-ins-stl-detail--kh-alloc-only/
- `_full.png` — toàn screen 758:28571 "Phiếu QT KH chỉ phân bổ BH" — case CR-20260618-01 (375x1703)

---

## Cross-reference
- **CR canonical**: `Tracking/CHANGE-REQUESTS.md#CR-20260618-01` (line 257-278)
- **Logic FEAT (sinh phiếu)**: `Product/features/FEAT-INS-STL-CREATE.md` — cascade pending: AC mới + BR-INS-STL-CRE-* (điều kiện sinh phiếu QT KH theo phân bổ BH chuyển KH > 0, kể cả khi BH 100% phụ tùng + dịch vụ)
- **Layout FEAT (hiển thị)**: `Product/features/FEAT-INS-STL-DETAIL.md` — cascade pending: case "phiếu QT KH chỉ phân bổ BH" trong panel "Tổng giá dịch vụ"
- **Cụm CR W02 Phase A**: CR-20260612-01 (per-payer panel) · CR-20260616-01 (bản in 3/5 khoản) · CR-20260616-02 (panel 2 cột) · CR-20260618-01 (sinh phiếu KH khi BH 100%)
- **Cross-platform**: Web tương ứng = node `13906:29632` trên file `EMGjGsnAJzGoGwTSK7dTuZ` (GMS-v.3) — chưa register web split (out of scope mobile run)
