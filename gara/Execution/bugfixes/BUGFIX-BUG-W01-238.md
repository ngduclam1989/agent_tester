# BUGFIX-BUG-W01-238: Error code sai cho `PERCENT < 0` — phải trả `INS_ADJ_VALUE_NEGATIVE` thay vì `INS_ADJ_PERCENT_OUT_OF_RANGE`

> **Status**: RESOLVED — Path B implemented (split `validatePercent` thành 2 nhánh).
> **Previous status**: ESCALATED — sau đó Business Authority xác nhận Path B. Code change applied.

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-238 |
| **Service** | gf-sales |
| **Priority** | P3 |
| **Source TC** | TC-W01-API-SOADJ-008, TC-W01-API-SOADJ-031 |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT / AC-14, BR-EP §5.5 Error Code Registry |
| **Mô tả** | Registry `BR-EP-INSURANCE-SETTLEMENT.md §5.5` gán `INS_ADJ_VALUE_NEGATIVE` (INS-1005) cho `PERCENT < 0` + `depreciationDefaultPercent < 0`. Server trả `INS_ADJ_PERCENT_OUT_OF_RANGE` (INS-1003) cho cả `< 0` lẫn `> 100`. Code không khớp spec. |

## Reproduction Steps

`updateServiceOrderV3(id: 4, input: { discountMaterial: { mode: PERCENT, value: -0.01 } })` → `extensions.code = INS_ADJ_PERCENT_OUT_OF_RANGE` (actual) thay vì `INS_ADJ_VALUE_NEGATIVE` (registry spec).

## Root Cause Analysis (Why-chain)

1. **Why server trả `INS_ADJ_PERCENT_OUT_OF_RANGE` cho `-0.01`?** `ServiceOrderInternalService#validatePercent(BigDecimal, String)` check cả 2 bounds trong 1 nhánh — `if (percent.signum() < 0 || percent.compareTo(HUNDRED) > 0) throw CODE_PERCENT_OUT_OF_RANGE` — emit INS-1003 bất kể chiều nào.
2. **Why không split `< 0` vs `> 100`?** Helper được viết trước registry-canonical CR-1780980611 (BR-EP §5.5 v21) tách `INS_ADJ_PERCENT_OUT_OF_RANGE` (INS-1003, >100) khỏi `INS_ADJ_VALUE_NEGATIVE` (INS-1005, <0). Implementation không được refactor theo CR.
3. **Why split quan trọng?** FE/Mobile bind field error trực tiếp theo `extensions.code`. Code khác nhau → message khác nhau và field highlight khác nhau:
   - `INS_ADJ_PERCENT_OUT_OF_RANGE` → "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100."
   - `INS_ADJ_VALUE_NEGATIVE` → "Vui lòng nhập giá trị từ 0 trở lên."
4. **Why Path B được chọn?** Ít blast radius hơn Path A (đổi registry semantic) vì Path B chỉ ảnh hưởng implementation gf-sales. Path B cũng align với `validateLineDepreciationPercents` (BUG-W01-236) vốn đã dùng split code per direction đúng. Business Authority xác nhận Path B.
5. **Why test cũ phải sửa assertion?** Test `inputValidation_negativePercentRejected` đang assert `CODE_PERCENT_OUT_OF_RANGE` cho `claimReductionValue=-5, mode=PERCENT` — assertion này lock-in behavior sai. Sau fix, phải assert `CODE_VALUE_NEGATIVE`. (Sửa assertion sai, không xóa test — per Forbidden Actions.)

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderInternalService.java`
    - Split `validatePercent(BigDecimal, String)` thành 2 nhánh riêng biệt:
      - `percent.signum() < 0` → throw `InvalidInsuranceAdjustmentException(CODE_VALUE_NEGATIVE, field, "Phần trăm điều chỉnh không thể âm")`
      - `percent.compareTo(HUNDRED) > 0` → throw `InvalidInsuranceAdjustmentException(CODE_PERCENT_OUT_OF_RANGE, field, "Chiết khấu không thể lớn hơn 100%")`
  - `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
    - Sửa assertion trong `inputValidation_negativePercentRejected`: `assertEquals(CODE_VALUE_NEGATIVE, ex.getCode())` (thay vì `CODE_PERCENT_OUT_OF_RANGE`).
    - Cập nhật display name test → reference BUG-W01-238.
    - Thêm assertion HTTP status = `HttpStatus.BAD_REQUEST` (400).

- **Approach rationale:** Path B — split implementation để match registry spec, mirror pattern của `validateLineDepreciationPercents` (BUG-W01-236). Minimal change: chỉ sửa validatePercent, không ảnh hưởng call sites khác (tất cả đều dùng chung pattern `validatePercent(value, fieldName)`).

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
- **Existing tests updated:**
  - `inputValidation_negativePercentRejected` — assertion sửa từ `CODE_PERCENT_OUT_OF_RANGE` → `CODE_VALUE_NEGATIVE`. Pre-fix: test FAILED after split (expected wrong code). Post-fix: PASS.
- **New regression tests (BUG-W01-238):**
  - `bug238_negativeDiscountMaterialPercent_returnsValueNegative` — discountMaterialMode=PERCENT, value=-5 → expect `CODE_VALUE_NEGATIVE`.
  - `bug238_negativeLineDepreciationPercent_returnsValueNegative` — line depreciationPercent=-1 → expect `CODE_VALUE_NEGATIVE` via `validateLineDepreciationPercents`.

## Verification Checklist

- [x] Fix applied (`ServiceOrderInternalService.validatePercent` split 2 nhánh).
- [x] Existing test assertion corrected (không xóa test — chỉ fix assertion sai).
- [x] Regression tests added and pass.
- [x] Existing tests still pass (full suite 286 tests green).
- [x] `./gradlew build` green.
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] Path B confirmed by Business Authority before implementation.

## Blast Radius

| Surface | Impact |
|---|---|
| `validatePercent` — percent < 0 | Now returns `CODE_VALUE_NEGATIVE` (INS-1005, HTTP 400). Previously `CODE_PERCENT_OUT_OF_RANGE`. |
| `validatePercent` — percent > 100 | Unchanged: `CODE_PERCENT_OUT_OF_RANGE` (INS-1003, HTTP 400). |
| `validatePercent` — valid percent [0,100] | Unchanged: no exception. |
| FE/Mobile error binding | `INS_ADJ_VALUE_NEGATIVE` → "Vui lòng nhập giá trị từ 0 trở lên." now correct per registry. |
| TC SOADJ-008, SOADJ-031 | Now pass with registry-canonical assertion (was PASS-conditional with adjusted-actual oracle). |

## Cross-Reference

- BUG-W01-236 — sibling (line-level percent validation). Fixed earlier; `validateLineDepreciationPercents` already used split codes correctly — provides the template for Path B.
- CR-1780980611 — BR-EP §5.5 v21 — original registry split that created this drift.
- CR-1781085632 — HTTP 400 for all 5 VALIDATION codes (did not touch per-direction code split).
- Previous ESCALATED version of this file: git history — `agent-fix-gf-sales` initial pass before BA decision.

## Notes

Path B chosen over Path A (registry update) because: (a) gf-sales code change is smaller blast radius than updating BR-EP canonical registry + cascading to FE/Mobile consumers, (b) implementation already has a correct template in `validateLineDepreciationPercents`, (c) BA confirmed path in W01 closeout. SOADJ-008/031 now unconditional PASS.
