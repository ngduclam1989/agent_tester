# BUGFIX-BUG-W01-272: [SO Edit] gf-sales blocks UpdateServiceOrderV3 when insurance payable is negative — violates AC-12 + EC-2

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-272 |
| **Service** | gf-sales |
| **Priority** | P2 |
| **Mô tả** | `UpdateServiceOrderV3` mutation bị block hoàn toàn khi `insurancePayable < 0`. Scenario: tất cả items `payer=CUSTOMER`, `parts=[]`, nhập `discountMaterial={mode:AMOUNT, value:50000}` → `partsPostVatIns = 0` → discount 50.000đ > base 0 → BE throw `INS_ADJ_AMOUNT_EXCEEDS_BASE` → HTTP 4xx. Spec AC-12 + EC-2 (CHỐT PO 2026-06-02) quy định cho lưu kèm cảnh báo, không chặn. |

## Root Cause

**Why-chain (5 bước):**

1. Tại sao `UpdateServiceOrderV3` fail? → `computeSettlementSummary` ném `InvalidInsuranceAdjustmentException(CODE_AMOUNT_EXCEEDS_BASE)`.
2. Tại sao nó ném exception? → `resolveAdjustmentAmount` cho `discountMaterial` được gọi với `enforceBase = true`, và base (`partsPostVatIns`) = 0 trong khi `discountMaterialValue = 50000 > 0`.
3. Tại sao `partsPostVatIns = 0`? → Tất cả items có `payer = CUSTOMER`, không có INSURANCE-payer parts, nên tổng phần BH = 0.
4. Tại sao `enforceBase = true` gây throw khi chỉ làm insurancePayable âm? → `validateNonNegativeAmount` throw khi `amount > base` (`50000 > 0`), bất kể `insurancePayable` âm có hợp lệ per spec hay không.
5. Tại sao điều này sai? → AC-12 CHỐT PO 2026-06-02 nói rõ: "cho lưu kèm cảnh báo (không chặn)" khi `insurancePayable ≤ 0`. Hành vi `enforceBase = true` cho `discountMaterial`/`discountLabor` (thêm bởi BUG-W01-203) đã bị supersede bởi AC-12.

**Root class:** `ServiceOrderInternalService.computeSettlementSummary()` gọi `resolveAdjustmentAmount` với `enforceBase = true` cho `discountMaterial` và `discountLabor`. Khi base BH = 0 (không có INSURANCE items/parts), bất kỳ giá trị AMOUNT dương nào cũng vượt base → throw block save.

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderInternalService.java` — đổi `enforceBase = true` → `enforceBase = false` cho cả `discountMaterial` và `discountLabor` trong `computeSettlementSummary`; update Javadoc `resolveAdjustmentAmount`
  - `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java` — fix assertions sai của 2 test BUG-W01-203 (thay `assertThrows(EXCEEDS_BASE)` → assert non-block + warning); add 2 regression tests BUG-W01-272; add static imports `assertDoesNotThrow`, `assertTrue`

- **Mô tả:** `claimReduction` đã dùng `enforceBase = false` (cho phép vượt base, chỉ warning) — áp dụng cùng logic cho `discountMaterial` và `discountLabor`. Warning path `INS_ADJ_BH_PAYMENT_NEGATIVE` tại `computeSettlementSummary` line 546-548 đã sẵn sàng xử lý `insurancePayable < 0`. Không cần thêm code mới — chỉ thay 2 boolean `true` → `false`.

  Không chỉnh sửa:
  - Validation `percent > 100` (BUG-W01-236, vẫn throw — đúng spec)
  - `validateNonNegativeAmount` cho `insuranceDeductibleAmount` (vẫn require ≥ 0)
  - Logic tính công thức BH thanh toán (giữ nguyên)
  - API signature, event schema, migration

## Reproduction Steps

1. SO với `hasInsurance = true`, tất cả items `payer = CUSTOMER`, `parts = []`
2. Gọi `PUT /api/v3/service-orders/{id}` với `discountMaterial = {mode:"AMOUNT", value:50000}`
3. Trước fix: response là `ErrorResponse` (HTTP 4xx, `INS_ADJ_AMOUNT_EXCEEDS_BASE`)
4. Sau fix: response là `success: true`, `insuranceAmount = -50000` persist vào DB

## Regression Test

- **File:** `src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
- **Test 1:** `bug272_allCustomerPayer_discountMaterialExceedsZeroBase_savesWithWarning`
  - Scenario: 2 items CUSTOMER-payer, parts=[], `discountMaterial={AMOUNT, 50000}`
  - Assert: `insurancePayable = -50000`, warning `INS_ADJ_BH_PAYMENT_NEGATIVE` present, no exception
- **Test 2:** `bug272_discountMaterialOverZeroBase_noExceptionThrown`
  - Scenario: 1 item CUSTOMER-payer, `discountMaterial={AMOUNT, 50000}`
  - Assert: `assertDoesNotThrow` — regression guard thuần tuý
- **Test 3 (updated):** `amountOverBaseAllowedWithWarning` (đổi từ `amountOverBaseRejected`)
  - Scenario: service BH base=1M, discountLabor AMOUNT 2M > base
  - Assert: `insurancePayable = -1000000`, warning present (không còn assert throw)
- **Test 4 (updated):** `materialDiscountOverBaseAllowedWithWarning` (đổi từ `materialDiscountOverBaseRejected`)
  - Scenario: parts BH base=168M, discountMaterial AMOUNT 200M > base
  - Assert: `insurancePayable = -32000000`, warning present (không còn assert throw)

## Blast Radius

- **Ảnh hưởng trực tiếp:** `ServiceOrderInternalService.computeSettlementSummary` — dùng bởi `ServiceOrderV3Service.update` và `ServiceOrderInternalService.getForSettlement`
- **Scope hẹp:** Chỉ thay đổi guard `enforceBase` cho 2 adjustments. Không đụng `claimReduction`, `deductible`, `depreciation`, `percent > 100`, hay negative-input validation.
- **Downstream safe:** `insurance_amount < 0` là hợp lệ cho audit theo spec; gf-accounting nhận snapshot âm (không filter).
- **Không có breaking change API/event/migration.**

## Verification Checklist

- [x] Fix applied: `enforceBase = false` cho discountMaterial và discountLabor trong `computeSettlementSummary`
- [x] Regression tests FAIL trước fix (EXCEEDS_BASE throw khi `50000 > 0 base`)
- [x] Regression tests PASS sau fix (no throw, warning emitted, negative persist)
- [x] Existing tests updated (BUG-W01-203 assertions sai per AC-12 supersede — fixed to assert non-block)
- [x] `percent > 100` still throws — `validatePercent` unchanged (BUG-W01-236 guard intact)
- [x] Negative input (`value < 0`) still throws — `validateNonNegativeAmount` check `signum < 0` unchanged
- [x] No API/event/migration change
- [x] `Tracking/WAVE01/BUGS.md` status updated → ✅ Đã sửa

## Cross-Reference

- AC-12 + EC-2: FEAT-INS-SO-ADJUSTMENT.md v21 (CHỐT PO 2026-06-02) — canonical spec cho non-block warning
- BUG-W01-203: added `enforceBase = true` (original intent: prevent CK > base); superseded by AC-12 for save-with-warning case
- BUG-W01-208: same pattern for `claimReduction` — already `enforceBase = false`
- BUG-W01-236: `percent > 100` still hard-blocked — unaffected by this fix
