# BUGFIX-BUG-W01-236: gf-sales line-level `depreciationPercent` validation missing (VLD-INS-SO-007)

## Iteration 3 — REOPENED → RESOLVED (2026-06-12)

> **REOPENED reason (Run 2):** Test environment (dev cluster) had not received the fix deployment — QC retested against stale build. Code fix was correct and unit tests pass.
> **Run 3 resolution:** Confirmed code fix is complete and regression tests pass. Status updated to RESOLVED. Issue was deployment lag, not a code defect.


## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W01-236 |
| **Service** | gf-sales |
| **Priority** | P1 |
| **Source TC** | TC-W01-API-SOADJ-034 (percent=150), TC-W01-API-SOADJ-035 (percent=-5) |
| **Feature / AC** | FEAT-INS-SO-ADJUSTMENT / AC-14, VLD-INS-SO-007 |
| **Mô tả** | `updateServiceOrderV3` accepts `depreciationByLine[].percent` outside `[0,100]` (eg `150`, `-5`) without returning HTTP 400. Per BR-EP §5.5 the FE expects `INS_ADJ_PERCENT_OUT_OF_RANGE` when `>100` and `INS_ADJ_VALUE_NEGATIVE` when `<0`, both at HTTP 400. |

## Reproduction Steps

Verified pre-fix via `Tracking/WAVE01/verify/BUG-W01-236.verify.md` + runner spec
`Execution/auto/specs/W01/api/w01-insurance-soadj.test.ts` (cases SOADJ-034, SOADJ-035).

1. `updateServiceOrderV3(id: 4, input: { hasInsurance: true, depreciationByLine: [{ lineId: <part>, percent: 150 }] })` — pre-fix returns HTTP 200 success instead of `400 INS_ADJ_PERCENT_OUT_OF_RANGE`.
2. Same call with `percent: -5` — pre-fix returns HTTP 200 success instead of `400 INS_ADJ_VALUE_NEGATIVE`.

## Root Cause

Why-chain:

1. **Why does HTTP 200 come back?** No exception is thrown anywhere on the request path.
2. **Why is no exception thrown?** `ServiceOrderInternalService#validateInsuranceAdjustmentInputs` only ranges the **header-level** scalar fields (`discountMaterial`, `discountLabor`, `claimReduction`, `insuranceDeductibleAmount`, `depreciationDefaultPercent`). It does not iterate per-line `depreciationPercent` overrides.
3. **Why doesn't the late-stage validation catch it?** The late call site is `computeSettlementSummary#computeDepreciationAmount`, which (a) only runs when `hasInsurance == true`, and (b) filters lines by `payer == INSURANCE` via `matchesPayer(part.getPayer(), false)`. A CUSTOMER-payer part — or any part on a SO where `hasInsurance` is later coerced to false — skips this check entirely.
4. **Why does the spec require pre-persist validation?** AC-14 mandates field-level error before save so the SO remains untouched; deferring to `computeSettlementSummary` (which runs after `serviceOrderRepository.save`) means the invalid percent is already written to `service_order_part.depreciation_percent` before the rollback path can fire.
5. **Why two separate codes for `>100` vs `<0`?** BR-EP §5.5 (registry CR-1780980611, HTTP status updated by CR-1781085632) assigns `INS_ADJ_PERCENT_OUT_OF_RANGE` (INS-1003, 400) for `>100` and `INS_ADJ_VALUE_NEGATIVE` (INS-1005, 400) for `<0`; the existing `validatePercent` helper emits a single code regardless of direction (which is exactly the symptom captured separately under BUG-W01-238).

Net root cause: `validateInsuranceAdjustmentInputs` has no per-line loop; `computeDepreciationAmount` is the only line-level validator and it does not run pre-persist for CUSTOMER-payer parts or `hasInsurance=false` paths.

## Fix

- **Files changed:**
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderInternalService.java` — add public `validateLineDepreciationPercents(List<BigDecimal>)` that iterates per-line `depreciationPercent` overrides and throws `InvalidInsuranceAdjustmentException` with `INS_ADJ_VALUE_NEGATIVE` (negative) or `INS_ADJ_PERCENT_OUT_OF_RANGE` (>100), both HTTP 400, field `depreciationPercent`. Null entries skipped (no override).
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderV3Service.java` — invoke the new validator from `updateServiceOrderFields` right after the existing header-level `validateInsuranceAdjustmentInputs` call (i.e. inside the `hasInsurance` branch of the SERVICE-order update), before `updateChildEntities` saves the parts. Passes `request.getParts().stream().map(...::getDepreciationPercent).toList()`.

- **Why this approach:** pre-persist + colocated with the existing pre-persist validator keeps the failure path consistent (`InvalidInsuranceAdjustmentException` → `GlobalExceptionHandler` → HTTP 400 + `code`), runs independent of payer, and short-circuits before `service_order_part` rows are touched. No new exception class, no controller advice changes, no schema migration — surgical addition that mirrors the existing pattern (`validateInsuranceAdjustmentInputs`).

- **Why not extend `validatePercent`:** the existing helper emits a single code for `<0` and `>100`; splitting it would change every call site (header-level CK/depreciation paths) and re-open BUG-W01-238 oracle drift outside the scope of this fix. The new method only services the line-level path and uses the registry-canonical code per direction.

## Regression Test

- **File:** `services/gf-sales/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCalculationTest.java`
- **New test names:**
  - `BUG-W01-236/VLD-INS-SO-007: line-level depreciationPercent > 100 rejected pre-persist with INS_ADJ_PERCENT_OUT_OF_RANGE`
  - `BUG-W01-236/VLD-INS-SO-007: line-level depreciationPercent < 0 rejected pre-persist with INS_ADJ_VALUE_NEGATIVE`
  - `BUG-W01-236/VLD-INS-SO-007: boundary values 0 and 100 + null overrides are accepted`
  - `BUG-W01-236/VLD-INS-SO-007: empty / null per-line list is a no-op (no exception)`
  - `BUG-W01-236/VLD-INS-SO-007: out-of-range line rejected even when one line is valid — first violation short-circuits the loop`
- **Pre-fix state:** these tests would not compile (the method did not exist) and the only validator that touches line-level percent ran after persist, behind a payer/insurance gate, with a single-direction code — so the field-level oracle in the runner (SOADJ-034/035) could not pass.
- **Post-fix state:** 5/5 PASS. Full `InsuranceSettlementCalculationTest` PASS. `./gradlew build` (compile + spotlessCheck + test) PASS.

## Verification Checklist

- [x] Fix applied (`ServiceOrderInternalService` + `ServiceOrderV3Service`).
- [x] Regression test reproduces bug behavior pre-fix (method did not exist; oracle had no pre-persist hook).
- [x] Regression test passes post-fix (5/5 new cases).
- [x] Existing tests still pass (`./gradlew build` green; `InsuranceSettlementCalculationTest` 30+ cases PASS).
- [x] `Tracking/WAVE01/BUGS.md` status updated → `RESOLVED`.
- [x] No published REST/event contract changed (additive validation only; same HTTP 400 + same `InvalidInsuranceAdjustmentException` envelope).

## Blast Radius

| Surface | Impact |
|---|---|
| `PUT /api/v3/service-orders/{id}` (request with `parts[].depreciationPercent`) | Now rejects invalid percents pre-persist with the registry-canonical code per direction. Valid percents and `null` overrides unchanged. |
| `GET .../for-settlement` / settlement compute | Unchanged. `computeSettlementSummary` still does its post-save line-level validation for INSURANCE-payer parts. |
| BFF `agg-garage-graph` (`applyDepreciationByLine`) | Unchanged. BFF still maps `depreciationByLine[]` → `parts[].depreciationPercent` (gap on missing `parts[]` is BUG-W01-237 — escalated, not fixed here). |
| Other 6 `updateServiceOrder*` flows (V2/RETAIL etc.) | Unchanged — the V3 update is the only path that ingests per-line `depreciationPercent`. |

## Cross-Reference

- `Tracking/WAVE01/verify/BUG-W01-236.verify.md` — L2 verify, runner SOADJ-034/035.
- BUG-W01-237 — sibling persist bug for same field; root cause is upstream BFF `applyDepreciationByLine` dropping the input when no `parts[]` is sent. **Escalated** (cross-boundary, agg-garage-graph), not fixed in gf-sales.
- BUG-W01-238 — oracle drift over `INS_ADJ_VALUE_NEGATIVE` vs `INS_ADJ_PERCENT_OUT_OF_RANGE` for header-level percent fields. **Escalated** (needs Business Authority CR on BR-EP §5.5 registry semantic), not fixed here.
- Source-of-truth code: `Architecture/api/gf-sales-api.md` §3bis.1 / §3bis.4; `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` §5.5.

## Notes

The fix uses the registry codes verbatim (`INS_ADJ_PERCENT_OUT_OF_RANGE`, `INS_ADJ_VALUE_NEGATIVE`) and the registry-canonical Vietnamese messages from the FEAT spec to keep FE field-error mapping deterministic. Both throw HTTP 400 (per CR-1781085632 — 422 was reverted to 400 to keep the FE error boundary from crashing).
