# BUGFIX BUG-W01-295 — STL Detail BH tab "Lịch sử thanh toán" rỗng (mobile)

> **Status**: RESOLVED.
> **Severity**: P1.
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: **BUG-W01-288** (web counterpart, RESOLVED 2026-06-16 — §8a.2 đã predict mobile follow-up), FEAT-INS-STL-DETAIL AC-9, BR-INS-STL-DET-007.

---

## 1. Failure mode

STL Detail biến thể BH: tab "Lịch sử thanh toán" RỖNG ("Chưa có Lịch sử thanh toán") + header "Đã thanh toán = 0đ" / "Còn lại = 11.004.960đ" dù phiếu QT (`SET-20260616-00011` linked pair) đã phát sinh giao dịch thanh toán. Accountant reconcile blind.

## 2. Root cause

`PaymentHistoryTab` (`lib/ui/settlement/settlement_tab/payment_history_tab.dart:30-48`) ưu tiên SAI nguồn:

- `_payments` getter trả `debtPanel.paymentHistory` khi `history != null` — nhưng kênh W02 BFF placeholder trả **list rỗng NON-NULL** → không bao giờ fallthrough xuống `serviceOrder.payments` (kênh W01 production, đã được select sẵn trong `settlement_document.dart:134-139`).
- `_paidAmount` (cũ 47-48) cũng ưu tiên `debtPanel.paidAmount = 0`.

Khác web BUG-288: **selection set KHÔNG thiếu** (`serviceOrder.payments` đã có trong query) — chỉ **sai thứ tự ưu tiên nguồn**.

## 3. Fix — Layer 1 (display-only)

Đảo ưu tiên: `serviceOrder.payments` (lọc `settlementCode == code`) thành nguồn CHÍNH, `debtPanel.paymentHistory` chỉ fallback khi nguồn chính rỗng:

```dart
List<_PaymentLine> get _serviceOrderPayments =>
    data?.serviceOrder?.payments
        ?.where((e) => e.settlementCode == code)
        .map((e) => _PaymentLine(...)).toList() ?? [];
List<_PaymentLine> get _debtPanelPayments => data?.debtPanel?.paymentHistory?... ?? [];
bool get _hasServiceOrderPayments => _serviceOrderPayments.isNotEmpty;
List<_PaymentLine> get _payments =>
    _hasServiceOrderPayments ? _serviceOrderPayments : _debtPanelPayments;
```

`_paidAmount` / `_debtAmount` derive theo nguồn đã chọn (SO payments → sum amount + `finalAmount - paid`; fallback debtPanel `paidAmount`/`remainingAmount`). Filter `settlementCode == code` để tách payment thuộc phiếu KH khác cùng SO (linked pair).

## 4. Blast radius

- Chỉ tab "Lịch sử thanh toán" STL Detail; read-only, không cascade mutation/cache.
- Customer variant không đổi (đã có SO payments → giờ là primary, parity).

## 5. Regression test

`test/ui/settlement/payment_history_source_priority_test.dart` — assert: SO payments là primary; debtPanel rỗng non-null không che; fallback debtPanel khi SO payments rỗng; filter settlementCode; `_paidAmount`/`_debtAmount` derive đúng nguồn.

## 6. Files changed

- `mobile/gf-garage-app/lib/ui/settlement/settlement_tab/payment_history_tab.dart`
- `mobile/gf-garage-app/test/ui/settlement/payment_history_source_priority_test.dart` (NEW)

## 7. Verification

- `flutter test` / `flutter analyze` — DEFERRED cho TEST_GROUP.

## 8. Follow-up

TEST_GROUP re-test đúng phiếu `SET-20260616-00011` (đã có giao dịch) để xác nhận VERIFIED. Khi BFF aggregator `debtPanel.paymentHistory` enable kênh dedicated (phase sau), revisit thứ tự ưu tiên — đồng bộ với web BUG-288 §8 follow-up (CR amend AC-9 data-source policy).
