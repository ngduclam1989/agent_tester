# BUGFIX BUG-W02-056 — Settlement Create page (SO có BH) render thừa CostSummarySettlementWidget

> **Status**: PROPOSED FIX (blocked by harness session_id propagation gap — see §8).
> **Authored by**: agent-fix-garage-mobile (W02 FIX cycle 2026-06-24).
> **Related**: BUG-W02-057 (settlement_edit sibling), BUG-W02-026 (CostSummary widget design).

---

## 1. Failure Mode

Màn "Tạo phiếu quyết toán" SO có BH (`soHasInsurance=true`) render thừa block `CostSummarySettlementWidget` (Tổng thành tiền dịch vụ / phụ tùng / Bảo hiểm trả) trùng lặp với panel canonical "Tổng giá dịch vụ" (`InsuranceSettlementDetailView`) ngay bên dưới.

Theo BA: block CostSummary chỉ hiển thị ở màn Tạo QT KHÔNG có BH; khi có BH thì "Phân bổ Bảo hiểm" + "Tổng giá dịch vụ" đã đủ.

## 2. Root Cause

`settlement_create_page.dart:130` (customer section) và `:178` (insurance section) render `CostSummarySettlementWidget` vô điều kiện. Panel canonical render tại `:87`:
```dart
if (cubit.soHasInsurance)
  InsuranceSettlementDetailView(snapshot: cubit.insuranceSnapshot)
else
  SummarySettlementWidget(...)
```

Panel canonical đã gate đúng. CostSummary chưa gate → trùng.

Figma oracle `Product/ux/figma-mobile/wave02-ins-stl-create.md` node `553:25702` chỉ đặc tả panel "Tổng giá dịch vụ" — KHÔNG có per-section mini cost-summary.

## 3. Proposed Fix

Gate cả 2 `CostSummarySettlementWidget` trong `_buildCustomerSection` (line 130) và `_buildInsuranceSection` (line 178) bằng `if (!cubit.soHasInsurance)`:

```dart
// Trong _buildCustomerSection (line 113-133):
_buildNoteField("Ghi chú (khách hàng)", _noteCustomerController),
if (!cubit.soHasInsurance)
  CostSummarySettlementWidget(cubit.customerCostSummary),

// Trong _buildInsuranceSection (line 136-181):
_buildNoteField("Ghi chú (bảo hiểm)", _noteInsuranceController),
if (!cubit.soHasInsurance)
  CostSummarySettlementWidget(cubit.insuranceCostSummary),
```

## 4. Touched Files

- `mobile/gf-garage-app/lib/ui/settlement/settlement_create/settlement_create_page.dart` (line 130, 178)

## 5. Don't-touch

- Cubit getters `customerCostSummary` / `insuranceCostSummary` (vẫn dùng cho màn không-BH)
- Panel canonical `InsuranceSettlementDetailView` (đã đúng)
- ExpandableWidget structure / section ordering

## 6. Regression Test (Proposed)

`ins_stl_create_widget_test.dart` — add `TC-W02-MUI-A-008`:
```dart
testWidgets('soHasInsurance=true → CostSummarySettlementWidget ABSENT', (tester) async {
  await tester.pumpWidget(_pump(soHasInsurance: true));
  expect(find.byType(CostSummarySettlementWidget), findsNothing);
  expect(find.byType(InsuranceSettlementDetailView), findsOneWidget);
});

testWidgets('soHasInsurance=false → CostSummarySettlementWidget PRESENT', (tester) async {
  await tester.pumpWidget(_pump(soHasInsurance: false));
  expect(find.byType(CostSummarySettlementWidget), findsOneWidget);
  expect(find.byType(InsuranceSettlementDetailView), findsNothing);
});
```

## 7. Blast Radius

- Pure composition gate — không đụng cubit / data flow / business logic
- Không cross-boundary impact (mobile-only)
- Backend không cần thay đổi (`grandTotalSummary` / `insuranceCostSummary` cubit getters vẫn nguyên)

## 8. Why Not Self-Applied (Harness Limitation)

Subagent spawn ở môi trường này: hook `check-boundary.sh` không phân biệt subagent vs main session (CLAUDE_CODE_CHILD_SESSION=1 nhưng inherit parent's CLAUDE_CODE_SESSION_ID). Edit/Write vào `mobile/gf-garage-app/lib/` bị FM-012 block.

**Fix sẵn sàng để apply** — chỉ ~6 lines change, low risk.

## 9. Status

PROPOSED FIX — code change documented, regression test scaffolded. Apply path:
1. Main agent (sentinel chủ session) chạy fix trực tiếp HOẶC
2. Harness fix subagent session_id propagation HOẶC
3. Manual apply via `/spawn-dev garage-mobile` với explicit override
