# BUGFIX BUG-W01-291 — Part-detail panel thiếu "Khấu hao VT" (insurance)

> **Status**: RESOLVED.
> **Severity**: P2.
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: AC-5 / BR-INS-SO-ADJ-009b (column-level depreciation), BUG-W01-290 (depreciation base).

---

## 1. Failure mode

Panel "Thông tin chi tiết phụ tùng" (expansion/popup của part row) THIẾU field "Khấu hao VT" cho part `payer=INSURANCE`. Cột bảng cấp trên render đúng; sub-detail panel không bind `depreciationPercent`. Cùng gap trên 3 màn: STL Detail + STL Edit + STL Create.

## 2. Root cause

`SettlementCalculation._settlementPartDetailRows` (`lib/core/extensions/settlement_extensions.dart:167-201`) — list row chi tiết part — không có row depreciation. Extension này được chia sẻ bởi cả 3 màn settlement → 1 chỗ thiếu, 3 màn cùng lỗi. (SO-Edit Tab Xác nhận render qua path khác `item_summary_card.dart:514` nên đã đúng.)

## 3. Fix — Layer 1 (display-only, shared)

Thêm row depreciation giữa "Đơn giá" và "Số lượng", chỉ cho part insurance có `depreciationPercent`:

```dart
if (e.payer == PayerType.insurance && e.depreciationPercent != null)
  SettlementDetailRowData(
    iconPath: Assets.icons.receiptItem,
    label: '${LocaleKeys.so_depreciation_material.tr()}:',
    value: '${e.depreciationPercent!.toStringAsFixed(0)}%',
  ),
```

`PayerType` + locale key `so_depreciation_material` đã có sẵn (thêm 2 import). Một thay đổi shared → fix đồng thời STL Detail/Edit/Create.

## 4. Blast radius

- Chỉ thêm 1 row hiển thị trong part-detail panel; part non-insurance hoặc `depreciationPercent == null` không đổi (no regression baseline).
- Không đụng data/persist/aggregate.

## 5. Regression test

`test/core/extensions/settlement_part_depreciation_row_test.dart` — assert row "Khấu hao VT" xuất hiện cho insurance part có `depreciationPercent`, vắng mặt cho customer part / null.

## 6. Files changed

- `mobile/gf-garage-app/lib/core/extensions/settlement_extensions.dart`
- `mobile/gf-garage-app/test/core/extensions/settlement_part_depreciation_row_test.dart` (NEW)

## 7. Verification

- `flutter test` / `flutter analyze` — DEFERRED cho TEST_GROUP.

## 8. Follow-up

AC-5 / BR-INS-SO-ADJ-009b chốt depreciation ở column-level; detail-panel field-list trước đây underspec. Nếu BA/PO muốn formalize field "Khấu hao VT" trong detail panel → CR amend FEAT (non-blocking, fix đã theo intent column-level).
