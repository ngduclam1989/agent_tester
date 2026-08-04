# BUGFIX BUG-W01-290 — Khấu hao VT mobile Tab "Xác nhận" (parity post-VAT)

> **Status**: RESOLVED (no production-code change — regression test added).
> **Severity**: P2.
> **Boundary**: garage-mobile (Flutter).
> **Authored by**: agent-fix-garage-mobile (Wave 01) — documented from applied working tree 2026-06-17.
> **Related**: BUG-W01-252 (web/BE baseline `computeDepreciationAmount` dùng `getFinalAmount()` post-VAT), BUG-W01-261/262 (SDL `parts[i].depreciationPercent` only), BUG-W01-294 (sister — client-side compute pattern).

---

## 1. Failure mode (suspected)

Nghi mobile SO-Edit Tab "Xác nhận" tính Khấu hao vật tư = `dep% × part.preVatAmount` thay vì `dep% × part.postVatAmount` → lệch web/BE sau fix BUG-W01-252.

## 2. Root cause — KHÔNG phải defect

Điều tra code hiện tại: đường tính đã post-VAT đúng.

- `InsuranceBreakdownMapper.partLinesOf` (`lib/ui/service_order_v3/service_order_creation_v3/insurance_breakdown_mapper.dart:72`) dựng `InsurancePartLine.lineTotal = sourcePrice - discountPrice + taxPrice` (post-VAT; `taxPrice` là getter VAT đã tính).
- `InsuranceAllocationCalculator.depreciationAmount` (`lib/ui/service_order/insurance/model/insurance_allocation_models.dart:199-210`) nhân `dep%` với `lineTotal` post-VAT đó.
- STL Detail đọc khấu hao server-authoritative (`insurance_settlement_detail_view.dart:63` → `data.depreciation.amount`).

Không tồn tại nhánh pre-VAT. Bug = false-positive triage (không reproduce trên code hiện hành).

## 3. Fix

Không sửa code. Chốt hành vi bằng regression test để tránh tái phát (pin post-VAT base).

## 4. Regression test

`test/ui/service_order_v3/service_order_creation_v3/insurance_depreciation_post_vat_test.dart` — pin `lineTotal == net + taxPrice` và `depreciation 10% × 1.100.000 == 110.000`.

## 5. Files changed

- `mobile/gf-garage-app/test/ui/service_order_v3/service_order_creation_v3/insurance_depreciation_post_vat_test.dart` (NEW)

## 6. Verification

- `flutter test` — DEFERRED cho TEST_GROUP (không có toolchain ở session design-repo).

## 7. Follow-up

TEST_GROUP re-run xác nhận pass → RESOLVED → VERIFIED. Nếu QA vẫn thấy số lệch trên thiết bị thật, capture mutation payload + screenshot để reopen với repro cụ thể (hiện chưa có).
