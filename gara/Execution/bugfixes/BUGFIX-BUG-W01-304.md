# BUGFIX BUG-W01-304 — Mobile STL Detail/Edit KH variant "Khách trả" self-compute

> **Status**: RESOLVED (commit `a7ed455a`, 2026-06-17). Verified by orchestrator from committed diff — `customerPaymentDisplay` getter + `customerCostSummary` index-2 khớp spec; cover cả Detail + Edit (chung extension); 4 tests. **Pending TEST_GROUP** + runtime T1 Charles `getSettlementByCode` (defer khi có stack).
> **Severity**: P2 (upgrade P1 nếu adjustment phổ biến / mobile print đọc cùng widget).
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01, diagnosis) — code-verified real repo paths.
> **Related**: **BUG-W01-294** (mobile Create — đã fix, là reference), BUG-W01-290 (cùng self-compute cluster), BR-INS-STL-CRE-003, BR-INS-STL-DET-009 (CR-20260612-01).

---

## 1. Failure mode

STL Detail + STL Edit, **KH variant từ SO BH**: Section "Tổng chi phí" → row "Khách trả (Dịch vụ + phụ tùng)" tự tính client-side `= totalCustomerServiceAmount + totalCustomerPartAmount` (vd 1.641.600 + 2.062.260 = 3.703.860đ) thay vì đọc BE field. Khi phiếu KH có adjustment chuyển KH chịu (Giảm trừ bồi thường/Khấu hao/Khấu trừ BH, dấu +) → số SAI (đúng phải 3.903.860đ nếu +200.000). Evidence: `assets/BUG-W01-304/mobile-stl-detail-kh-variant-khach-tra-self-compute-buggy.png`.

## 2. Root cause

`lib/core/extensions/settlement_extensions.dart:64`: `totalCustomerAmount => totalCustomerServiceAmount + totalCustomerPartAmount`, dùng tại `customerCostSummary` index-2 ("Khách trả"), **line 112**. BE field `customerPayment` đã include adjustment chuyển KH chịu (BR-INS-STL-DET-009 (a)); self-sum bỏ qua → drift. Vi phạm BR-INS-STL-CRE-003 (server-authoritative). Create screen đã fix điều này ở BUG-294 (`settlement_create_cubit.dart` `customerPaymentDisplay` 71-73, 122); Detail/Edit dùng **extension chưa fix**.

## 3. Fix — Layer 1 (display-only, mobile-only, 1 điểm)

`lib/core/extensions/settlement_extensions.dart` — thêm getter sau `totalCustomerAmount` (mirror chain BH ở `insurance_settlement_detail_view.dart:68`):

```dart
double get customerPaymentDisplay =>
    (serviceOrder?.hasInsurance == true
        ? (customerPayment ?? serviceOrder?.customerPayment ?? serviceOrder?.customerAmount)
        : null)
    ?? totalCustomerAmount;
```

Đổi `customerCostSummary` line 112: `('Khách trả', totalCustomerAmount)` → `('Khách trả', customerPaymentDisplay)`.

## 4. 1 fix cover cả 2 màn

Detail (`cost_tab.dart:38` + `settlement_detail_page.dart`) và Edit (`settlement_edit_cubit.dart:62` delegate `customerCostSummary` về `_data.customerCostSummary`) **cùng consume extension getter** trên `SettlementDetailResponse`. `cost_summary_settlement_widget.dart:45` render index-2 → không cần đổi widget.

## 5. Fields + cross-variant verified

- `SettlementDetailResponse` có top-level `customerPayment/insurancePayment/totalPayment` (`settlement_detail_response.dart:64-66`); `serviceOrder` (ServiceOrderDetailV3) có `hasInsurance/customerPayment/customerAmount`. GraphQL `getSettlementByCode` select cả top-level `customerPayment` (`settlement_document.dart:194`) lẫn nested `serviceOrder.customerPayment` (line 177) → field có dữ liệu.
- **BH variant KHÔNG bị bug**: `insurance_settlement_detail_view.dart:65-73` đã đọc `data.customerPayment ?? so?.customerPayment ?? so?.customerAmount`. Chỉ KH variant (qua extension) dính — khớp scope user.

## 6. Blast radius

- KH non-insurance: `hasInsurance==false` → giữ `totalCustomerAmount` (no regression). Read-only, không cascade persist.

## 7. Regression test (apply-ready)

`test/core/extensions/settlement_extensions_customer_payment_test.dart` (group BUG-W01-304):
- KH-from-SO-BH: `serviceOrder.hasInsurance=true`, sum lines = 3.703.860, top-level `customerPayment=3.903.860` → `customerCostSummary[2].$2 == 3.903.860` (KHÔNG phải sum).
- non-insurance KH: `hasInsurance==false` → == `totalCustomerAmount` (giữ nguyên).
- BE-null-guard: `hasInsurance==true` nhưng `customerPayment` & `serviceOrder.customerPayment` null → fallback `totalCustomerAmount`.

## 8. Files to change

- `mobile/gf-garage-app/lib/core/extensions/settlement_extensions.dart`
- `mobile/gf-garage-app/test/core/extensions/settlement_extensions_customer_payment_test.dart` (NEW)

## 9. Verification (DEFERRED)

`fvm flutter analyze` + `fvm flutter test` → TEST_GROUP. Runtime: **T1** Charles intercept `getSettlementByCode` phiếu KH (linked pair `SET-20260616-00011/00012`) dump `customerPayment/totalPayment` → `Execution/test-reports/W01/API/BUG-W01-304-T1-mobile-bff-response.json` (xác nhận BE compute adjusted value cho KH variant).

## 10. Follow-up

Gộp cùng PR cluster self-compute (290/294). Spec gap nhẹ: BR-INS-STL-CRE-003 nên amend explicit "UI client KHÔNG self-compute; đọc trực tiếp BFF field" (CR follow-up, non-blocking).
