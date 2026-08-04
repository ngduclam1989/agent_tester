# BUGFIX BUG-W01-305 — STL Detail header "Còn lại" sai (= Tổng tiền)

> **Status**: RESOLVED (commit `ad51b955` "Remove debtPanel references from settlement models and update related calculations", 2026-06-17). Verified by orchestrator from committed diff.
> **Severity**: P1.
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix/dev-garage-mobile (Wave 01) — user-applied.
> **Related**: BUG-W01-295 (cùng nguồn serviceOrder.payments; debtPanel removal củng cố 295), BUG-W01-288 (web payment source), BUG-W01-304 (cluster BE-source-of-truth).

---

## 1. Failure mode

STL Detail (BH + KH variant) header: field "Còn lại" render bằng "Tổng tiền" thay vì trừ đã trả — vd `SET-20260617-00007`: Tổng=6.917.875 + Còn lại=6.917.875 dù đã có payment 17.875đ (đúng phải 6.900.000đ). Tab "Lịch sử thanh toán" cùng phiếu hiển thị Còn lại đúng → desync header vs tab.

BE response **KHÔNG** trả field `remainingAmount`/`debtAmount` dedicated (user confirm qua BE screenshot) → mobile PHẢI tự compute.

## 2. Root cause

Header (`settlement_info_widget.dart`) + cubit ưu tiên `debtPanel.remainingAmount` / `debtPanel.paidAmount` (kênh W02 BFF) — nhưng debtPanel trả rỗng/0 placeholder → "Còn lại" rơi về giá trị không trừ payment, hiển thị = Tổng tiền. Cùng anti-pattern debtPanel-shadowing như BUG-295 (tab).

## 3. Fix — Layer 1 (revert debtPanel, compute from payments)

Gỡ hẳn `debtPanel` khỏi settlement detail + tự compute từ `serviceOrder.payments`:

- `lib/core/models/response/settlement/settlement_detail_response.dart` — xoá field `debtPanel` (+ ctor param). `.g.dart` regenerate.
- `lib/ui/settlement/settlement_detail/widgets/settlement_info_widget.dart`:
  ```dart
  List<ServiceOrderPaymentV3> get _payments =>
      data?.serviceOrder?.payments?.where((e) => e.settlementCode == data?.code).toList() ?? [];
  double get _paidAmount => _payments.fold(0.0, (s, e) => s + (e.amount ?? 0));
  String get _remainingAmount => "${formatVNCurrency((data?.finalAmount ?? 0) - _paidAmount)} VND";
  ```
  → công thức canonical `Còn lại = finalAmount − Σ(payments WHERE settlementCode==code)`. `finalAmount` per-variant (BH = insuranceAmount, KH = customerAmount) vì mỗi phiếu QT là settlement riêng trong linked pair.
- `lib/ui/settlement/settlement_detail/settlement_detail_cubit.dart` — `remainingAmount = finalAmount − paidAmount` (bỏ debtPanel).
- `lib/ui/settlement/settlement_tab/payment_history_tab.dart` — gỡ `_debtPanelPayments` fallback; `_payments => _serviceOrderPayments`, `_paidAmount`/`_debtAmount` thuần từ serviceOrder.payments.

Filter `settlementCode == code` quan trọng: SO có cặp phiếu BH+KH linked → không cộng nhầm payment phiếu kia.

## 4. Blast radius / tương tác BUG-295

- Display-only; read-only consumer.
- **Củng cố BUG-295**: root cause 295 = debtPanel (list rỗng non-null W02) che serviceOrder.payments; xoá hẳn debtPanel → serviceOrder.payments là nguồn DUY NHẤT, không còn risk shadowing. Tab vẫn đúng. 2 test-case fallback của 295 (`payment_history_source_priority_test.dart`) được gỡ theo (path không còn).

## 5. Regression test

Commit chỉ chỉnh `payment_history_source_priority_test.dart` (gỡ 2 case debtPanel-fallback). **GAP**: chưa có test riêng cho header "Còn lại" formula (TC `TC-W01-MUI-STLDET-{BH,KH}-header-conlai-formula-*`, `...header-vs-tab-lich-su-conlai-parity`, `...payments-filter-by-settlementCode-paired-pair`) → khuyến nghị TEST_GROUP bổ sung widget/unit test cho `settlement_info_widget` (formula + settlementCode filter linked pair + partial payment).

## 6. Files changed (commit ad51b955)

- `lib/core/models/response/settlement/settlement_detail_response.dart`
- `lib/ui/settlement/settlement_detail/settlement_detail_cubit.dart`
- `lib/ui/settlement/settlement_detail/widgets/settlement_info_widget.dart`
- `lib/ui/settlement/settlement_tab/payment_history_tab.dart`
- `test/ui/settlement/payment_history_source_priority_test.dart`
- (+ `settlement_detail_response.g.dart` regenerate)

## 7. Verification

- Compile: `.g.dart` regenerate sạch (no debtPanel ref) — OK.
- `fvm flutter analyze` / `fvm flutter test` — DEFERRED cho TEST_GROUP.
- Runtime: re-test `SET-20260617-00007` → Còn lại = 6.900.000đ.

## 8. Follow-up (cleanup, non-blocking)

1. Comment lỗi thời "ưu tiên debtPanel..." ở `settlement_info_widget.dart:41,50` + `settlement_detail_cubit.dart:130` — gỡ.
2. `settlement_document.dart:196` vẫn select `debtPanel { }` trong GraphQL dù model bỏ field → over-fetch dead; gỡ khỏi selection set (tránh runtime error nếu BFF SDL drop debtPanel).
3. Thêm header regression test (§5).
4. Update `BUGFIX-BUG-W01-295.md` §3 — debtPanel fallback đã bị gỡ ở 305.
