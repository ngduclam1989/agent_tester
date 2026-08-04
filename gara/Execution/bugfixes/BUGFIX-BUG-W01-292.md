# BUGFIX BUG-W01-292 — STL Detail BH variant render thừa "Tổng chi phí"

> **Status**: RESOLVED.
> **Severity**: P3 (cosmetic, không affect calc).
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: figma `Product/ux/figma-mobile/wave01-ins-stl-detail.md:19` (canonical 2 cards), CR-20260612-01 (BH cố ý phân kỳ với web), BUG-W01-275 (sibling — mobile SO Detail thừa "Tổng chi phí").

---

## 1. Failure mode

Màn Chi tiết Phiếu quyết toán biến thể BH render thừa mục "Tổng chi phí". Figma mobile canonical cho BH chỉ có 2 card "Phải thu BH" + "KH chịu điều chỉnh", KHÔNG có "Tổng chi phí" / "Tổng thanh toán" (cân đối BH dùng panel "Phân bổ bảo hiểm").

## 2. Root cause

`CostTab` (`lib/ui/settlement/settlement_tab/cost_tab.dart:50-54`) render `Text("Tổng chi phí")` + `CostSummarySettlementWidget` cho insurance section **vô điều kiện** — copy-paste từ customer variant, không gate theo loại phiếu BH.

## 3. Fix — Layer 1 (display-only)

Gate khối "Tổng chi phí" insurance section sau `!data!.isInsuranceType` (extension `SettlementCalculation.isInsuranceType` đã có, `settlement_extensions.dart:67`):

```dart
if (!data!.isInsuranceType) ...[
  Text("Tổng chi phí", style: AppTextStyle.textSubtitleS4),
  CostSummarySettlementWidget(data!.insuranceCostSummary),
],
```

Customer-section block giữ nguyên → no baseline regression.

## 4. Blast radius

- Chỉ ẩn 1 block trên BH variant; KH variant + non-insurance không đổi.
- Không đụng calc/data.

## 5. Regression test

`test/ui/settlement/cost_tab_insurance_total_hidden_test.dart` — assert "Tổng chi phí" vắng mặt khi `isInsuranceType == true`, hiện diện khi KH variant.

## 6. Files changed

- `mobile/gf-garage-app/lib/ui/settlement/settlement_tab/cost_tab.dart`
- `mobile/gf-garage-app/test/ui/settlement/cost_tab_insurance_total_hidden_test.dart` (NEW)

## 7. Verification

- `flutter test` / `flutter analyze` — DEFERRED cho TEST_GROUP.

## 8. Follow-up

Design source CONFIRMED (figma §1.25 + CR-20260612-01) → không cần CR. Cân nhắc kiểm tra widget shared với BUG-W01-275 (SO Detail) để tránh tái phát chỗ khác.
