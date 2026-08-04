# BUGFIX BUG-W01-274 — Mobile Create SO: "Khấu hao vật tư" field shown on Create

> **Status**: VERIFIED (fix present in working tree, pending regression test + re-test).
> **Severity**: P3.
> **Boundary**: garage-mobile.
> **Authored by**: agent-fix-garage-mobile (Wave 01).
> **Related**: BUG-W01-271 (web counterpart — `agent-fix-garage-web`, OPEN), BR-INS-SO-PS-006.

---

## 1. Failure mode

Trên màn Tạo mới Phiếu dịch vụ (Create SO), ô "Khấu hao vật tư"
(`LocaleKeys.so_depreciation_material`) hiển thị trong card phụ tùng (`_PartItemCard`)
ngay cả khi đang **tạo mới** và cho cả dòng payer = Khách hàng. Theo BR-INS-SO-PS-006 /
BR-INS-SO-ADJ-010, khấu hao chỉ áp ở **SO Edit / Detail / STL** và chỉ cho dòng payer =
Bảo hiểm — KHÔNG ở màn Tạo mới.

## 2. Root cause

`lib/ui/service_order_v3/service_order_creation_v3/pages/items_page_v3.dart` —
`_PartItemCard` gate ô khấu hao chỉ bằng `if (widget.hasInsurance)` (cờ cấp-SO), nên rò rỉ
sang Create + dòng khách-hàng-trả.

## 3. Fix

1. Thêm `final bool isEditMode;` (default `false`) vào `_PartItemCard`.
2. Tại construction site trong `_buildPartsSection` truyền `isEditMode: state.isEditMode`
   (getter sẵn có `serviceOrderId != null`, cùng cờ `InsuranceAllocationSectionV3Host` đang
   dùng).
3. Đổi gate:
   ```dart
   // before
   if (widget.hasInsurance) ...[
   // after
   if (widget.isEditMode && _payer == PayerType.insurance) ...[
   ```
   `_payer == PayerType.insurance` đã bao hàm hasInsurance (vì `PayerType.getPayers` chỉ
   cho chọn insurance khi hasInsurance) → bỏ check `hasInsurance` không gây regression.

## 4. Blast radius / don't-touch

- **Touched**: `items_page_v3.dart` (khai báo field ~798–806; construction ~204; gate
  ~1178). Chỉ 1 file.
- **Don't-touch**: `InsuranceAllocationSectionV3Host` gate (`isEditMode && hasInsurance`);
  enum `PayerType`; cubit/state.

## 5. Regression test

Widget test (group BUG-W01-274), 5 ca: (1) Create + payer=insurance → field ẩn; (2) Edit +
payer=insurance → hiện; (3) Edit + payer=customer → ẩn; (4) Edit toggle payer
insurance↔customer → hiện/ẩn reactively; (5) Create + item.payer=INSURANCE seed → vẫn ẩn
(chặn leak qua entrypoint copy-from-SO).

## 6. Status

OPEN → VERIFIED. L2: `Tracking/WAVE01/verify/BUG-W01-274.verify.md`.
