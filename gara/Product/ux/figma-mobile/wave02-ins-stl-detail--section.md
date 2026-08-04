---
feat: FEAT-INS-STL-DETAIL
feat_file: Product/features/FEAT-INS-STL-DETAIL.md
platform: mobile
boundary: garage-mobile
figma_url: https://www.figma.com/design/nAoFS33sTWj3ctWjZMUDEl/App-GMS-v3---New-Design?node-id=81-39472&m=dev
file_key: "nAoFS33sTWj3ctWjZMUDEl"
node_id: "81:39472"
screen_slug: section
fetched_at: 2026-06-22T03:00:00+00:00
transform_version: 5
transform_mode: fresh-fetch
screenshots: true
screens_expected: 4
status: TRANSFORM_FAILED
fallback: Product/ux/figma-mobile/wave01-ins-stl-detail.md
failed_checks:
  - "M-13: AC-coverage cross-check chưa exhaustive — refer wave01-ins-stl-detail.md (đã spec đầy đủ AC mapping); xem coverage_gaps W02"
  - "M-14: Decomposition chưa drill leaf — dựa metadata + screenshot. Widget mapping chi tiết ở wave01 spec"
  - "M-18: Section-container PNG ở mức top-level frame (4 frames + _full). Nested panel (Phân bổ BH expand/collapse, sub-tab Tổng quan/Chi tiết phân bổ) không có PNG riêng — bù qua _full + per-frame PNG"
coverage_gaps:
  - "W02 CR-20260612-01 (panel chi tiết QT tách per-payer): mobile design có áp 1-cột per-payer chưa? phiếu BH chỉ cột 'Bảo hiểm thanh toán' (bỏ KH, giữ 'Tổng thanh toán'); phiếu KH 1 cột KH + section 'Phân bổ Bảo hiểm' khi SO có BH (3 khoản chuyển KH dấu +, ẩn 2 khoản CK liên kết BH — chốt 2026-06-16). 4 frame mobile có thể chưa update — verify visual"
  - "Frame 437:18516 'Chi tiết QT không BH' — verify giữ baseline FEAT-STL-DETAIL (không hiển thị panel Phân bổ BH)"
  - "Frame 563:27555 / 758:28571 'Có BH - Khách hàng chi trả' — verify cấu trúc phiếu QT KH có BH (CR-20260612-01)"
  - "Frame 407:17089 'Có BH - Bảo hiểm chi trả' — verify cấu trúc phiếu QT BH (CR-20260612-01 — chỉ cột BH)"
  - "AC-5 bảng line-item: refer gap đã ghi ở wave01 (mobile không có bảng line-item chi tiết — verify với design owner)"
  - "AC-8/AC-9 tab Hồ sơ BH / Lịch sử thanh toán: refer wave01 gap"
---

## Icon Catalog (shared)
> Refer wave01-ins-stl-detail.md §Icon Catalog (canonical). Mobile icon set giữ nguyên cross-wave.

> **Note (M5 cross-frame)**: 4 frame mobile là **state variant của cùng MỘT màn "Chi tiết phiếu quyết toán"** ở 3 ngữ cảnh:
> - **`407:17089` (375x2111) — "Có BH - Bảo hiểm chi trả"**: phiếu QT BH (Bên thanh toán = BH) → panel chỉ cột "Bảo hiểm thanh toán" (CR-20260612-01).
> - **`437:18516` (375x1644) — "không BH"**: phiếu QT KH baseline (Bên thanh toán = KH, SO không có BH) → giữ panel "Tổng giá dịch vụ" baseline 1-cột KH (không có section Phân bổ Bảo hiểm).
> - **`563:27555` (375x2034) — "Có BH - Khách hàng chi trả"**: phiếu QT KH từ SO có BH → 1 cột KH + section "Phân bổ Bảo hiểm" với 3 khoản chuyển KH dấu (+), ẩn 2 khoản CK liên kết BH (CR-20260612-01 chốt 2026-06-16).
> - **`758:28571` (375x1703) — "Có BH - Khách hàng chi trả" (CR-20260618-01 — case BH 100% + KH chịu phân bổ)**: phiếu QT KH "chỉ phân bổ BH" — KHÔNG có dòng dịch vụ/phụ tùng (BH chi trả 100%), chỉ 3 khoản phân bổ chuyển KH (dấu +) + Tổng thanh toán = 3 khoản. **Đã được split sang spec riêng `wave02-ins-stl-detail--kh-alloc-only.md`** (CR-20260618-01 canonical reference).

Header + 2 khối info top + tab bar + action bar **giống nhau** cross-frame → canonical mô tả ở wave01 spec.

---

## Screen: Phiếu QT BH — Bảo hiểm chi trả (CR-20260612-01 — 1 cột BH) (407:17089)
- Device frame: 375x2111px
- Scaffold + AppBar: cùng pattern wave01 §AppBar canonical
- Bên thanh toán phiếu = **Bảo hiểm** → panel "Tổng giá dịch vụ":
  - Khối "Chi tiết theo bên thanh toán" → **chỉ cột "Bảo hiểm thanh toán"** (bỏ cột KH)
  - Khối "Phân bổ Bảo hiểm" → giữ (5 dòng điều chỉnh)
  - Khối "Cân thanh toán" → **giữ "Tổng thanh toán"** (chốt 2026-06-12) — chỉ 1 dòng tổng (không 2 dòng KH/BH như baseline)
- Entry "+ Tạo hồ sơ bảo hiểm" trên action bar (gate BR-INS-DOSSIER-011 — chỉ hiển thị payer=BH) — đồng bộ FEAT-INS-DOSSIER-CREATE AC-1
→ flutter: Reuse PanelTongGiaDichVu component với mode `payer=insurance` → ẩn cột KH

## Screen: Phiếu QT KH baseline — không BH (437:18516)
- Device frame: 375x1644px
- Bên thanh toán phiếu = **Khách hàng** + SO **không có BH** → panel "Tổng giá dịch vụ" baseline:
  - Khối "Chi tiết theo bên thanh toán" → chỉ cột KH
  - Khối "Phân bổ Bảo hiểm" → **KHÔNG render** (BR-INS-STL-DET-007 conditional)
  - Khối "Cân thanh toán" → 1 dòng KH
- KHÔNG có entry "+ Tạo hồ sơ bảo hiểm" (gate ẩn — BR-INS-DOSSIER-011)
- Giữ baseline FEAT-STL-DETAIL — KHÔNG bị ảnh hưởng CR W02
→ flutter: Reuse PanelTongGiaDichVu component với mode `baseline` (no BH section)

## Screen: Phiếu QT KH từ SO có BH (CR-20260612-01 — 1 cột KH + section "Phân bổ BH" chuyển KH) (563:27555)
- Device frame: 375x2034px
- Bên thanh toán phiếu = **Khách hàng** + SO **có BH** → panel "Tổng giá dịch vụ" mode đặc thù (CR-20260612-01):
  - Khối "Chi tiết theo bên thanh toán" → 1 cột KH
  - **Section "Phân bổ Bảo hiểm"** (mới trong CR) → **3 khoản chuyển KH** dấu (+):
    - Giảm trừ bồi thường (+)
    - Khấu hao vật tư/thay mới (+)
    - Khấu trừ bảo hiểm (+)
    - **ẨN** 2 khoản: CK liên kết BH - Vật tư + CK liên kết BH - Công dịch vụ (chốt 2026-06-16)
  - Khối "Cân thanh toán" → 1 dòng KH
- KHÔNG có entry "+ Tạo hồ sơ bảo hiểm" (payer ≠ BH)
→ flutter: PanelTongGiaDichVu với mode `payer=customer, hasInsurance=true` → render section "Phân bổ Bảo hiểm" với 3 khoản (+) hidden=[ck_vat_tu, ck_cong_dv]

## Screen: Phiếu QT KH "chỉ phân bổ BH" (CR-20260618-01 — case BH 100% + KH chịu phân bổ) (758:28571)
- Device frame: 375x1703px
- Bên thanh toán phiếu = **Khách hàng** + SO **có BH chi trả 100%** phụ tùng + dịch vụ → phiếu KH chỉ chứa 3 khoản phân bổ chuyển KH chịu (dấu +).
- **KHÔNG có** Section/DichVuThucHien + Section/PhuTungSuDung (vì BH chi trả 100% → KH không chịu service/parts).
- Section/PhanBoBaoHiem hiển thị **chỉ 3 khoản** (dấu +): Khấu trừ bảo hiểm + Khấu hao vật tư-thay mới + Giảm trừ bồi thường (ẩn 2 khoản CK liên kết BH — chốt CR-20260616-01 + CR-20260618-01).
- Khối "Cân thanh toán": Tổng thanh toán = tổng 3 khoản phân bổ (không có dòng dịch vụ/phụ tùng cộng vào).
- **Spec chi tiết đã tách sang `wave02-ins-stl-detail--kh-alloc-only.md`** (CR-20260618-01 canonical) — refer spec đó cho widget tree đầy đủ.
→ flutter: PanelTongGiaDichVu với mode `payer=customer, hasInsurance=true, insuranceCoversAll=true` → ẩn Section dịch vụ/phụ tùng, render chỉ Section "Phân bổ Bảo hiểm" với 3 khoản (+) + Cân thanh toán 1-dòng.

---

## Screenshots
> assets/wave02-ins-stl-detail--section/
- `_full.png` — toàn section FEAT-INS-STL-DETAIL (2390x2567 → 1912x2048)
- `407-17089.png` — Phiếu QT BH (Bảo hiểm chi trả, 1 cột BH) (375x2111)
- `437-18516.png` — Phiếu QT KH baseline (không BH) (375x1644)
- `563-27555.png` — Phiếu QT KH có BH (1 cột KH + section Phân bổ BH chuyển KH) (375x2034)
- `758-28571.png` — Phiếu QT KH "chỉ phân bổ BH" (CR-20260618-01 — BH 100% + KH chịu phân bổ; spec chi tiết tại `wave02-ins-stl-detail--kh-alloc-only.md`) (375x1703)

---

## Cross-reference
- Chi tiết widget mapping cấp leaf: `Product/ux/figma-mobile/wave01-ins-stl-detail.md` (đã spec node 81:39472 đầy đủ ở wave01 với 5 frame cũ — frame set có thể đổi nhẹ vì design refresh, verify)
- W02 changes: CR-20260612-01 (panel chi tiết QT tách per-payer 1 cột) — verify áp ở screens `407:17089` (phiếu BH) + `563:27555` / `758:28571` (phiếu KH có BH)
- Cross-link: FEAT-INS-DOSSIER-CREATE entry (frame 700:28585 thuộc spec dossier-create) trỏ về màn này khi payer=BH
