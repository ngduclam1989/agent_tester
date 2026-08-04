---
feat: FEAT-INS-STL-CREATE
feat_file: Product/features/FEAT-INS-STL-CREATE.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=553-27738&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "553:27738"
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 2
status: TRANSFORM_FAILED
fallback: Product/ux/UX-FLOW-INSURANCE-SETTLEMENT.md
failed_checks:
  - "M-13: AC-coverage cross-check chưa exhaustive (AC-1..AC-7 vs spec body); xem coverage_gaps"
  - "M-14: Decomposition chưa drill leaf — dựa metadata XML + screenshot"
  - "M-18: Section-container PNG chỉ 2 frames + _full — nested panel (Chi tiết theo bên thanh toán · Phân bổ Bảo hiểm · Cân thanh toán) không có PNG riêng"
coverage_gaps:
  - "AC-3 panel 'Chi tiết theo bên thanh toán' — verify hiển thị 2 cột (Khách hàng · Bảo hiểm) với line-item snapshot từ SO"
  - "AC-4 section 'Phân bổ Bảo hiểm' với 5 dòng (CK liên kết BH Vật tư · CK liên kết BH Công DV · Giảm trừ bồi thường · Khấu hao VT/Thay mới · Khấu trừ BH) — xác nhận có ở mobile (web đã có)"
  - "AC-5 khối 'Cân thanh toán' 2-cột (CR-20260616-02 chốt 2-cột Bảo hiểm | Khách hàng dóng thẳng theo bên thanh toán) — verify mobile có áp 2-cột chưa, hay vẫn 1-cột legacy"
  - "AC-6 'Tổng tiền bảo hiểm trả' read-only = computed — verify field hiển thị disabled/non-editable trên mobile (baseline FEAT-STL-CREATE field nhập tay → ở đây chuyển read-only)"
  - "AC-7 snapshot phân bổ vào cặp phiếu QT khi xác nhận — server-side, không impact UI; verify nút 'Xác nhận' hiện diện"
  - "Conditional render: panel Phân bổ BH chỉ hiển thị khi SO có hạng mục Nguồn TT=Bảo hiểm (BR-INS-STL-CRE-009) — verify ở frame nào (553:25702 có BH; 553:28214 'Chi tiết phiếu dịch vụ' context trước khi nhấn 'Tạo phiếu QT')"
---

## Icon Catalog (shared)

| Figma layer | source | Notes |
|---|---|---|
| vuesax/linear/arrow-left | assets/icons/arrow_left.svg | Back — top app bar leading, 20px |
| vuesax/linear/info-circle | assets/icons/info_circle.svg | Info hint trên panel (verify), 16-20px |
| Checkbox / radio | flutter Checkbox / Radio | Verify nếu có (loại phiếu) |

> **Note**: frame `553-28214` "Chi tiết phiếu dịch vụ" là **context màn trước** (SO Detail có nút "Tạo phiếu quyết toán" — AC-1 trigger). Frame `553-25702` "Xác nhận tạo phiếu quyết toán - full" là **màn target chính** với panel "Tổng giá dịch vụ" (AC-2..AC-7).

---

## Screen: Xác nhận Tạo phiếu quyết toán — full + Panel Tổng giá dịch vụ (553:25702)
- Device frame: 375x2194px (phone — scroll vertical rất dài)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg)
- AppBar: có — title "Tạo phiếu quyết toán" (verify wording — có thể "Xác nhận tạo phiếu QT"), leading back (‹)
- Body layout: SingleChildScrollView → Column
- BottomBar: có — Row ["Hủy" (secondary) · "Xác nhận" (primary)] (baseline FEAT-STL-CREATE)
- Widget Tree:
  Scaffold
  ├── CustomAppBar [back · "Tạo phiếu quyết toán"]
  └── Body: SingleChildScrollView → Column
      ├── Section/LoaiPhieu      [Radio/Dropdown "Loại phiếu" = "Dịch vụ xe" (baseline)]
      ├── Section/ThongTinSO     [Snapshot SO: mã SO · ngày · khách hàng · xe]
      ├── Section/KhachHangChiTra [Bảng dịch vụ + phụ tùng (cột KH chịu) + ghi chú]
      ├── Section/BaoHiemChiTra   [Bảng dịch vụ + phụ tùng (cột BH chịu) + ghi chú]   ← conditional BR-INS-STL-CRE-009
      ├── Panel/TongGiaDichVu (AC-2..AC-5 — đặc thù BH)
      │   ├── Khối1/ChiTietTheoBenThanhToan        [AC-3: 2 cột Khách hàng · Bảo hiểm; line-item per dịch vụ/phụ tùng]
      │   ├── Khối2/PhanBoBaoHiem                  [AC-4: 5 dòng CK Vật tư · CK Công DV · Giảm trừ · Khấu hao · Khấu trừ BH]
      │   └── Khối3/CanThanhToan (2-cột — CR-20260616-02)  [AC-5: Bảo hiểm | Khách hàng, mỗi khoản +/− đúng cột]
      ├── Section/InputTongTien   [Tổng tiền khách trả (nhập tay) · **Tổng tiền bảo hiểm trả (read-only = computed)**]  ← AC-6
      └── BottomBar [AppButton "Hủy" (secondary) + AppButton "Xác nhận" (primary)]

### CustomAppBar
- BG: #ffffff → AppColors.bgBase; border-bottom 1px #e8e8ea → AppColors.borderPrimary
- Text: "Tạo phiếu quyết toán" 16px weight=600 → AppTextStyle.textSubtitleS4 color=#262626 → AppColors.textPrimary
- Icons: leading arrow_left 20px #262626 → AppColors.textPrimary
→ flutter: CustomAppBar(title: "Tạo phiếu quyết toán", leading: back)

### Panel/TongGiaDichVu (AC-2 — read-only, conditional BR-INS-STL-CRE-009)
- Bounds: w=fill h=hug
- BG: #ffffff → AppColors.bgBase
- Padding: EdgeInsets.all(16) → AppSizes.spacing16
- Border-top 1px #e8e8ea → AppColors.borderPrimary (separator vs section trên)
- Header text "Tổng giá dịch vụ" 16px weight=700 → AppTextStyle.textHeadingH4 color=#262626 → AppColors.textPrimary

### Panel/TongGiaDichVu — Khối 1: Chi tiết theo bên thanh toán (AC-3)
- Layout: Column → Table 2-cột (Khách hàng | Bảo hiểm), header row + line-item rows
- Mỗi line item: dịch vụ/phụ tùng + số tiền theo cột
- Read-only

### Panel/TongGiaDichVu — Khối 2: Phân bổ Bảo hiểm (AC-4)
- Layout: Column gap=Gap(AppSizes.spacing8)
- 5 dòng (đồng bộ FEAT-INS-STL-DETAIL + FEAT-INS-SO-ADJUSTMENT):
  1. **CK liên kết BH - Vật tư** (label + số)
  2. **CK liên kết BH - Công dịch vụ** (label + số)
  3. **Giảm trừ bồi thường** (label + số, có thể -)
  4. **Khấu hao vật tư/thay mới** (label + số, có thể -)
  5. **Khấu trừ bảo hiểm** (label + số, có thể -)
- Số liệu computed server-side (snapshot SO) — read-only
→ flutter: Reuse component panel "Phân bổ Bảo hiểm" từ FEAT-INS-SO-ADJUSTMENT/STL-DETAIL — KHÔNG dựng lại

### Panel/TongGiaDichVu — Khối 3: Cân thanh toán (AC-5 + CR-20260616-02 — 2-cột)
- Layout: Row 2-cột (Bảo hiểm | Khách hàng), mỗi cột list khoản +/−
- Cột Bảo hiểm: các khoản BH chi trả (+) trừ điều chỉnh (−) → ra "Tổng phải thu BH"
- Cột Khách hàng: các khoản KH chịu trừ điều chỉnh → ra "Tổng phải thu KH"
- Read-only (display-only, server-side compute)
→ flutter: Row([Expanded(Column[cột BH]), Expanded(Column[cột KH])]) hoặc reuse PanelCanThanhToan 2-cột component

### Section/InputTongTien (AC-6)
- Trường "Tổng tiền khách trả" — AppTextField nhập tay (baseline)
- Trường "Tổng tiền bảo hiểm trả" — **read-only = computed** (AC-6 changes from baseline editable). Disabled state visually distinct (bg #f3f3f4 → AppColors.bgSecondary, text color #888c94 → textTertiary)
→ flutter: AppTextField(readOnly: true, fillColor: AppColors.bgSecondary, ...) cho field bảo hiểm

### BottomBar
- Padding: EdgeInsets.all(16), bg #ffffff → bgBase, top border 1px #e8e8ea → borderPrimary
- Row: AppButton "Hủy" (secondary, expanded) · Gap(12) · AppButton "Xác nhận" (primary, expanded)
- Hành vi "Xác nhận": tạo cặp phiếu QT KH+BH + snapshot phân bổ vào DB (AC-7 + BR-INS-STL-CRE-007)
→ flutter: Row([Expanded(AppButton.text("Hủy", secondary)), Gap(12), Expanded(AppButton.text("Xác nhận", primary))])

---

## Screen: Context — Chi tiết phiếu dịch vụ (entry "Tạo phiếu quyết toán") (553:28214)
- Device frame: 375x1682px (scroll vertical dài)
- Scaffold: CustomScaffold, bg=#f4f7fe → Color(0xFFF4F7FE) (page-bg, đồng bộ Chi tiết SO)
- AppBar: có — title "Chi tiết phiếu dịch vụ", leading back, trailing kebab
- Body: SingleChildScrollView → Column (đồng bộ FEAT-SO-DETAIL baseline + FEAT-INS-SO-ADJUSTMENT extensions)
- BottomBar: ActionBar (FEAT-SO-DETAIL AC-15) với nút **"Tạo phiếu quyết toán"** (gate khi SO ở trạng thái Hoàn thành — AC-1)
- Widget Tree (verify với `553-28214.png` — chỉ context, không phải target màn impl):
  Scaffold
  ├── CustomAppBar [back · "Chi tiết phiếu dịch vụ" · more]
  └── Body: SingleChildScrollView → Column
      ├── Section/ThongTinPhieu [SO header info: mã SO, khách, xe, trạng thái Hoàn thành]
      ├── Section/DichVuPhuTung [bảng dịch vụ + phụ tùng baseline]
      ├── Panel/PhanBoBaoHiem (FEAT-INS-SO-ADJUSTMENT — nếu SO có BH) [collapsible]
      └── (Section khác …)
  BottomBar: ActionBar [Edit · "+ Thanh toán" · "Tạo phiếu quyết toán" (chính)]

> **Lưu ý**: frame này là **context trước** màn target. Spec implementation cho FEAT-INS-STL-CREATE tập trung vào `553-25702`. Frame `553-28214` được giữ để xác nhận flow entry (nút "Tạo phiếu QT" gate trạng thái) — chi tiết bao quát ở FEAT-INS-SO-ADJUSTMENT spec mobile.

---

## Screenshots
> assets/wave02-ins-stl-create/
- `_full.png` — toàn section FEAT-INS-STL-CREATE (982x2347 → 897x2048)
- `553-25702.png` — Screen 1: Màn Xác nhận tạo phiếu QT (375x2194) — TARGET implementation
- `553-28214.png` — Screen 2: Context Chi tiết SO entry "Tạo phiếu QT" (375x1682)
