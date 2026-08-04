# BUGFIX BUG-W01-294 — Tạo phiếu QT BH tự tính client-side thay vì đọc BE

> **Status**: RESOLVED.
> **Severity**: P1 (financial drift risk).
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: FEAT-INS-STL-CREATE AC-5 (cùng snapshot server-side với SO + STL Detail), AC-6 (read-only computed server-side), BR-INS-STL-CRE-003 (server-side authoritative), BUG-W01-290 (sister pattern).

---

## 1. Failure mode

Trên màn Tạo phiếu QT BH, "Tổng tiền KH thanh toán" + "BH thanh toán" mobile **tự tính client-side** (sum line `finalAmount`) thay vì đọc giá trị BE-computed. Rủi ro: công thức mobile bỏ qua điều chỉnh BH (khấu hao / miễn thường / claim reduction dịch chuyển tiền BH↔KH) → lệch BE; kế toán confirm số sai; BE recompute đúng khi snapshot → display vs DB mismatch.

## 2. Root cause

`SettlementCreateCubit` (`lib/ui/settlement/settlement_create/settlement_create_cubit.dart`) tính tổng client-side:
- `customerCostSummary` (cũ line 100-105) → `('Khách trả', customerTotal)`,
- `insuranceCostSummary` (cũ 171-176) → `('Bảo hiểm trả', insuranceTotal)`,
- `grandTotalSummary` (cũ 188-192) → `customerTotal` / `insuranceTotal` / `grandTotal`,

tất cả = sum line `finalAmount`, không phản ánh điều chỉnh BH. Vi phạm AC-5/AC-6/BR-INS-STL-CRE-003 (settlementBalance server-authoritative). Request payload đã đúng (không gửi precomputed amount — `settlement_create_cubit.dart:204/206` đã comment out) → đây là lỗi **hiển thị**, không phải lỗi contract.

## 3. Fix — Layer 1 (display-only, no contract change)

Thêm getter ưu tiên giá trị BE-computed cho SO bảo hiểm, fallback line-sum khi null:

```dart
double get customerPaymentDisplay =>
    (_order?.hasInsurance == true ? _order?.customerPayment : null) ?? customerTotal;
double get insurancePaymentDisplay =>
    (_order?.hasInsurance == true ? _order?.insurancePayment : null) ?? insuranceTotal;
double get totalPaymentDisplay =>
    (_order?.hasInsurance == true ? _order?.totalPayment : null) ?? grandTotal;
```

Bind 3 getter này vào `customerCostSummary` / `insuranceCostSummary` / `grandTotalSummary`. `customerPayment`/`insurancePayment`/`totalPayment` là field BE-computed trên `ServiceOrderDetailV3` (`:110-112`), đã được select trong GraphQL `serviceOrder` block sẵn → không đổi query/payload.

## 4. Blast radius

- Chỉ thay nguồn 3 dòng hiển thị tổng tiền cho SO bảo hiểm; SO non-insurance giữ line-sum (fallback) → no regression.
- KHÔNG client-recompute khi edit; KHÔNG đổi mutation payload / contract.

## 5. Regression test

`test/ui/settlement/settlement_create/settlement_create_cubit_payment_binding_test.dart` — assert SO bảo hiểm hiển thị `customerPayment`/`insurancePayment`/`totalPayment` từ BE; fallback line-sum khi field null; SO non-insurance dùng line-sum.

## 6. Files changed

- `mobile/gf-garage-app/lib/ui/settlement/settlement_create/settlement_create_cubit.dart`
- `mobile/gf-garage-app/test/ui/settlement/settlement_create/settlement_create_cubit_payment_binding_test.dart` (NEW)

## 7. Verification

- `flutter test` / `flutter analyze` — DEFERRED cho TEST_GROUP.

## 8. Follow-up

TEST_GROUP đối chiếu số mobile vs BE snapshot trên phiếu BH có điều chỉnh (khấu hao/miễn thường) để chắc parity. Xác nhận BUG-W01-290 (cùng pattern Tab Xác nhận) không còn nguồn client-compute nào khác.
