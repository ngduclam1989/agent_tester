# BUGFIX BUG-W02-057 — Settlement Edit page (SO có BH) gate CostSummary widget

> **Status**: PROPOSED FIX (blocked by harness session_id propagation gap — see §8).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-056 (settlement_create sibling).

---

## 1. Failure Mode

Màn "Chỉnh sửa phiếu quyết toán" — phiếu KH từ SO có BH — render trùng lặp `CostSummarySettlementWidget` + `InsuranceSettlementDetailView`. Theo BA: khi `soHasInsurance=true`, chỉ render panel canonical, ẩn CostSummary.

## 2. Root Cause

`settlement_edit_page.dart`:
- Line 91 đã render đúng `InsuranceSettlementDetailView` khi `cubit.soHasInsurance` ✓
- **NHƯNG** line 127 + 175 `CostSummarySettlementWidget` render vô điều kiện trong `_buildCustomerSection` / `_buildInsuranceSection` → trùng panel khi `soHasInsurance=true`

Cubit getters (line 70-73):
- `soHasInsurance => (_data?.serviceOrder?.hasInsurance == true) && showInsuranceSection;` ✓
- `insuranceSnapshot => mapInsuranceSnapshot(_data);` ✓

Bug filing ban đầu (verify file) đoán "thiếu panel + thiếu cubit getter" — **OUTDATED**: cả 2 đã exist. Bug thực sự = chỉ thiếu gate cho CostSummary widget (sibling pattern với BUG-W02-056).

## 3. Proposed Fix

Gate cả 2 `CostSummarySettlementWidget` trong `_buildCustomerSection` (line 127) và `_buildInsuranceSection` (line 175) bằng `if (!cubit.soHasInsurance)`:

```dart
// Trong _buildCustomerSection (line 110-130):
_buildNoteField("Ghi chú (khách hàng)", _noteCustomerController),
if (!cubit.soHasInsurance)
  CostSummarySettlementWidget(cubit.customerCostSummary),

// Trong _buildInsuranceSection (line 133-178):
_buildNoteField("Ghi chú (bảo hiểm)", _noteInsuranceController),
if (!cubit.soHasInsurance)
  CostSummarySettlementWidget(cubit.insuranceCostSummary),
```

## 4. Touched Files

- `mobile/gf-garage-app/lib/ui/settlement/settlement_edit/settlement_edit_page.dart` (line 127, 175)

## 5. Don't-touch

- Cubit `settlement_edit_cubit.dart` — `soHasInsurance` + `insuranceSnapshot` đã correct
- `InsuranceSettlementDetailView` render (line 91) — đã đúng với `lockToCustomerSide: true`
- Note field / data fetch logic

## 6. Regression Test (Proposed)

`settlement_edit_widget_test.dart` — add `TC-W02-MUI-EDIT-001`:
```dart
testWidgets('soHasInsurance=true → panel + CostSummary absent', (tester) async {
  await tester.pumpWidget(_pump(soHasInsurance: true));
  expect(find.byType(InsuranceSettlementDetailView), findsOneWidget);
  expect(find.byType(CostSummarySettlementWidget), findsNothing);
});

testWidgets('soHasInsurance=false → CostSummary + no panel', (tester) async {
  await tester.pumpWidget(_pump(soHasInsurance: false));
  expect(find.byType(InsuranceSettlementDetailView), findsNothing);
  expect(find.byType(CostSummarySettlementWidget), findsAtLeastNWidgets(1));
});
```

## 7. Blast Radius

- Pure composition gate — không đụng business logic
- Mobile-only (settlement_edit_page.dart)
- Backend / cubit / data flow không thay đổi

## 8. Why Not Self-Applied (Harness Limitation)

Same as BUG-W02-056 — hook FM-012 block session_id propagation gap. Fix sẵn sàng để apply (~6 lines).

## 9. Status

PROPOSED FIX. Coordinate với BUG-W02-056 (same pattern) — apply both trong 1 commit.
