---
feat: FEAT-INS-SO-ADJUSTMENT
feat_file: Product/features/FEAT-INS-SO-ADJUSTMENT.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=319-65571&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "319:65571"
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 10
status: TRANSFORM_FAILED
fallback: Product/ux/figma-mobile/wave01-ins-so-adjustment.md
failed_checks:
  - "M-13: AC-coverage cross-check chưa exhaustive — FEAT covers nhiều màn (Tạo SO Edit, Chi tiết SO, Phân bổ BH expand/collapse, biến thể không-BH 'k bh'); refer wave01 spec + visual reconcile"
  - "M-14: Decomposition chưa drill leaf cho 10 frames — dựa metadata + screenshot. SO-ADJUSTMENT là FEAT lớn nhất (10 screen-state, frame lớn nhất 375x3614px)"
  - "M-11: Widget Tree integrity chỉ ở cấp section per frame; chi tiết widget reuse từ wave01 spec đã chi tiết hơn"
  - "M-18: Section-container PNG ở mức top-level frame (10 frames + _full). Nested section bên trong (PanelPhanBoBH expand/collapse, sub-tab Tổng quan/Chi tiết phân bổ) không có PNG riêng — bù qua _full + per-frame PNG"
coverage_gaps:
  - "W02 CR-20260616-02 (2-cột Cân thanh toán): verify mobile design có áp 2-cột (Bảo hiểm | Khách hàng) trên panel 'Cân thanh toán' của màn SO Edit + SO Detail chưa, hay vẫn 1-cột legacy (FEAT-INS-SO-ADJUSTMENT version pre-CR)"
  - "Frame 437:18975 / 437:20991 / 437:23481 'k bh' = state SO KHÔNG có Bảo hiểm — panel Phân bổ BH KHÔNG render (conditional BR). Verify giữ baseline (FEAT-INS-SO-ADJUSTMENT AC negative path)"
  - "Cross-reference wave01-ins-so-adjustment.md (đã spec chi tiết single-frame 319:65571) — wave02 spec này refresh sau CR-20260616-02; nội dung 5 dòng điều chỉnh + 2 card phân bổ BH giữ nguyên"
---

## Icon Catalog (shared)
> Refer wave01-ins-so-adjustment.md §Icon Catalog (canonical). Mobile icon set giữ nguyên cross-wave.

> **Note (M5 cross-frame)**: 10 frames chia 2 cluster theo TRẠNG THÁI SO:
> - **Cluster "Tạo phiếu dịch vụ" (Edit/SO Edit)**: `397:23265`, `444:27342`, `553:23784`, `397:25040`, `555:29224` — màn EDIT SO với panel "Tổng giá dịch vụ" (gồm Phân bổ BH) ở các state expand/collapse + scroll.
> - **Cluster "Tạo phiếu dịch vụ - k bh"** (KHÔNG bảo hiểm): `437:18975`, `437:20991` — màn EDIT SO khi không có hạng mục Nguồn TT=BH; panel Phân bổ BH ẨN.
> - **Cluster "Chi tiết phiếu dịch vụ" (SO Detail)**: `397:27621`, `437:23054` — màn DETAIL SO read-only (sau khi xác nhận) với phân bổ BH hiển thị.
> - **Cluster "Chi tiết phiếu dịch vụ - k bh"**: `437:23481` — màn DETAIL SO không BH.
>
> Header app bar + bộ thông tin chung (mã SO · KH · xe · trạng thái) **giống nhau** trên cả 10. Chi tiết widget reuse từ wave01 spec.

---

## Screen: Tạo phiếu dịch vụ — Edit state đầy đủ panel "Tổng giá dịch vụ" (397:23265)
- Device frame: 375x3614px (scroll vertical rất dài — full edit form)
- Scaffold + AppBar: cùng pattern wave01 (xem wave01-ins-so-adjustment.md §AppBar canonical)
- Body: SingleChildScrollView → Column (sections: Loại phiếu · Khách hàng & xe · Bảng dịch vụ · Bảng phụ tùng · Panel "Tổng giá dịch vụ" mở rộng · Ghi chú · Nút Xác nhận/Lưu)
- Panel "Tổng giá dịch vụ" (FEAT-INS-SO-ADJUSTMENT AC-9..AC-11):
  - Khối "Phân bổ Bảo hiểm": 5 dòng điều chỉnh (CK Vật tư · CK Công DV · Giảm trừ · Khấu hao · Khấu trừ BH) — inline editable cho 3 dòng đầu (số tiền + cờ áp dụng)
  - Khối "Cân thanh toán": 2-cột (BH | KH) — verify W02 CR-20260616-02 áp dụng (vs 1-cột legacy)
→ flutter: Reuse panel component spec wave01 § Panel/PhanBoBaoHiem.

---

## Screen: Tạo phiếu dịch vụ — state mặc định/intro (444:27342)
- Device frame: 375x812px (viewport baseline)
- State: SO mới chưa nhập panel BH — header + ngữ cảnh nhập
- Widget Tree: Scaffold/AppBar + Section/HeaderSO + Section/InputBatDau (verify visual)

## Screen: Tạo phiếu dịch vụ — state với entry phân bổ (553:23784)
- Device frame: 375x812px
- State: variant entry state — verify visual reconcile `553-23784.png`

## Screen: Tạo phiếu dịch vụ - k bh (KHÔNG bảo hiểm) (437:18975)
- Device frame: 375x2785px
- State: SO không có hạng mục Nguồn TT=BH → panel Phân bổ BH ẨN; chỉ panel "Cân thanh toán" 1-cột (KH).
- Conditional BR: FEAT-INS-SO-ADJUSTMENT AC: hide panel BH khi `hasInsurance == false`.

## Screen: Tạo phiếu dịch vụ — state panel expanded (397:25040)
- Device frame: 375x2982px
- State: panel "Tổng giá dịch vụ" mở rộng đầy đủ (expand cả Phân bổ BH + Cân thanh toán) — chính state để verify W02 CR-20260616-02 layout 2-cột.

## Screen: Tạo phiếu dịch vụ — state alt (555:29224)
- Device frame: 375x3279px
- State: variant scroll/state — verify `555-29224.png` (có thể là sub-tab Tổng quan vs Chi tiết phân bổ)

## Screen: Tạo phiếu dịch vụ - k bh (variant) (437:20991)
- Device frame: 375x2777px
- State: variant SO không BH (scroll/state khác) — verify

## Screen: Chi tiết phiếu dịch vụ — read-only sau xác nhận (397:27621)
- Device frame: 375x2401px
- State: SO Detail (sau xác nhận) read-only — hiển thị panel Phân bổ BH ở chế độ view-only.
- BottomBar: ActionBar [Edit SO · Thanh toán · Tạo phiếu quyết toán]

## Screen: Chi tiết phiếu dịch vụ — alt state (437:23054)
- Device frame: 375x2401px
- State: variant scroll/expand state cho SO Detail có BH

## Screen: Chi tiết phiếu dịch vụ - k bh (KHÔNG bảo hiểm) (437:23481)
- Device frame: 375x1495px
- State: SO Detail KHÔNG có BH → panel Phân bổ BH ẨN.

---

## Screenshots
> assets/wave02-ins-so-adjustment/
- `_full.png` — toàn section FEAT-INS-SO-ADJUSTMENT (3581x4813 → 1533x2048)
- `397-23265.png` — Tạo SO full edit (375x3614)
- `444-27342.png` — Tạo SO state intro (375x812)
- `553-23784.png` — Tạo SO state entry (375x812)
- `437-18975.png` — Tạo SO k bh (375x2785)
- `397-25040.png` — Tạo SO panel expanded (375x2982)
- `555-29224.png` — Tạo SO state alt (375x3279)
- `437-20991.png` — Tạo SO k bh variant (375x2777)
- `397-27621.png` — Chi tiết SO có BH (375x2401)
- `437-23054.png` — Chi tiết SO có BH variant (375x2401)
- `437-23481.png` — Chi tiết SO k bh (375x1495)

---

## Cross-reference
- Chi tiết widget mapping cấp leaf: `Product/ux/figma-mobile/wave01-ins-so-adjustment.md` (đã spec node 319:65571 đầy đủ ở wave01)
- W02 changes: CR-20260616-02 (panel "Cân thanh toán" 2-cột Bảo hiểm | Khách hàng) — verify áp ở screens panel hiển thị (`397:23265`, `397:25040`, `397:27621`, `437:23054`)
