# BUGFIX-BUG-W02-005: Print template render khấu hao raw % thay vì monetary (gf-sales scope)

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-005 |
| **Service** | gf-sales + gf-accounting (cross-boundary; file này là gf-sales scope) |
| **Priority** | P1 |
| **Mô tả** | Print template `settlement-insurance.html` + `settlement-customer.html` render dòng "Khấu hao vật tư / thay mới" với raw `%` (Thymeleaf format "-50" thay vì "-50.000 đ") vì `SettlementPrintDataBuilder.buildInsuranceAllocation` (gf-accounting) line 97 set `.depreciation(safeAmount(ins.getDepreciationDefaultPercent()))` — đẩy raw percent vào field monetary. Cùng root cause với BUG-W02-004. PKG-W02 §4.1: `for-print` response phải trả `breakdownByPayer` 5 khoản per-payer làm input cho gf-accounting `SettlementPrintStrategy`; integration đang miss vì DTO `ServiceOrderForPrintDto` ở gf-accounting chưa add `breakdownByPayer` field. |

## Root Cause (Why-chain)

1. **Why** print template render "-50" thay vì "-50.000 đ"? → Thymeleaf format raw integer `50` (= raw %) thay vì số tiền VND khấu hao.
2. **Why** raw `50` chui vào field monetary? → `SettlementPrintDataBuilder.buildInsuranceAllocation` (gf-accounting) line 97 set `.depreciation(safeAmount(ins.getDepreciationDefaultPercent()))` — `getDepreciationDefaultPercent()` là header `%` (0..100), không phải số tiền.
3. **Why** gf-accounting fall back về `getDepreciationDefaultPercent()` mà không dùng monetary value? → DTO `ServiceOrderForPrintDto` (gf-accounting side) chưa de-serialize field `breakdownByPayer` (kể cả `depreciationInsurance`/`depreciationCustomer`) từ `for-print` response của gf-sales → builder không có nguồn monetary để dùng → fall back về raw `%` trên Settlement entity.
4. **Why** gf-sales side phải làm gì? → **Đã không phải sửa**: gf-sales `ServiceOrderForPrintResponse.breakdownByPayer.depreciationInsurance`/`depreciationCustomer` **đã** carry monetary value (`InsuranceSettlementSummary.depreciationAmount = Σ part.finalAmount × depreciationPercent / 100`, tính inline trong `ServiceOrderInternalService.computeDepreciationAmount`, gọi từ `ServiceOrderForPrintService.buildBreakdownByPayer` line 158, 168-169). Contract phía gf-sales đã đúng từ W02 cycle 1.

**Kết luận gf-sales scope**: contract gf-sales side đã đúng (monetary). Bug nằm ở consumer (gf-accounting `ServiceOrderForPrintDto` + `SettlementPrintDataBuilder`). Phía gf-sales chỉ cần **pin contract semantics bằng regression test** để chống drift về raw `%` trong tương lai. gf-accounting fix song song (cross-boundary, agent-fix-gf-accounting handle ServiceOrderForPrintDto + builder mapping).

## Fix

- **Files changed**:
  - `services/gf-sales/src/test/java/com/actechx/gf/printing/service/ServiceOrderForPrintServiceTest.java` — ADD test mới `forPrint_depreciation_isMonetary_notRawPercent()` (regression pin contract).
- **Mô tả**: Không sửa code production trong gf-sales — `ServiceOrderForPrintResponse.breakdownByPayer.depreciationInsurance/depreciationCustomer` đã trả monetary từ trước (`InsuranceSettlementSummary.depreciationAmount`). Chỉ thêm regression test khẳng định semantics monetary để chống drift; test fail ngay nếu ai đó silently revert sang raw `%` (vd `.depreciationInsurance(so.getDepreciationDefaultPercent())`).
- **Cross-boundary coordination**: gf-accounting fix (`agent-fix-gf-accounting`) song song — add `breakdownByPayer` vào `ServiceOrderForPrintDto`, đổi `SettlementPrintDataBuilder.buildInsuranceAllocation` consume monetary value thay vì raw `%`.

## Regression Test

- **File**: `services/gf-sales/src/test/java/com/actechx/gf/printing/service/ServiceOrderForPrintServiceTest.java`
- **Test name**: `ServiceOrderForPrintServiceTest > BUG-W02-005 (P1): breakdownByPayer.depreciation* phải MONETARY (≈ finalAmount × %), KHÔNG raw percent`
- **Scenario**:
  - Stub SO có 1 part BH (`Payer.INSURANCE`) với `finalAmount = 110.000` (= 100.000 pre-VAT + 10.000 VAT) × `depreciationPercent = 30`.
  - Assert `breakdownByPayer.depreciationInsurance` compareTo `33.000` = 0 (monetary, KHÔNG raw `30`).
  - Assert `breakdownByPayer.depreciationCustomer` compareTo `33.000` = 0 (monetary).
  - Guard sanity: assert cả 2 field `> 100 đ` → cấm raw `%` (0..100) lọt qua.
- **Reproduce trước fix?**: Không vì gf-sales side đã đúng từ trước; test này là regression guard chống drift tương lai. Nếu source bị revert thành `.depreciationInsurance(so.getDepreciationDefaultPercent())` → test fail.

## Verification Checklist

- [x] Fix applied (regression test added; production code không cần sửa — contract đã đúng từ W02 cycle 1)
- [x] Regression test added
- [x] Regression test passes sau fix: `./gradlew test --tests ServiceOrderForPrintServiceTest` BUILD SUCCESSFUL
- [x] Existing tests still pass: `./gradlew test` BUILD SUCCESSFUL (4 actionable, 2 executed)
- [x] Build clean: `./gradlew build` BUILD SUCCESSFUL (spotlessCheck + spotlessJava format clean)
- [x] Tracking/WAVE02/BUGS.md status updated → `FIX_DONE` (canonical W02+ 9-status — RESOLVED equivalent)
- [x] Tracking/WAVE02/BUGS.md pivot dashboard cell refresh (FEAT × Status + SuspectedAgent × Status)
- [x] Boundary clean: chỉ edit trong `services/gf-sales/**` + `Execution/bugfixes/**` + `Tracking/WAVE02/BUGS.md`
- [x] No new P1/P2 introduced
- [ ] Cross-boundary coordination (gf-accounting): wait on `agent-fix-gf-accounting` cycle song song

## Cross-Reference

- Related bug: BUG-W02-004 (cùng root cause cho panel response gf-accounting `SettlementService.buildInsuranceAllocationView`)
- PKG-W02 §4.1: `for-print` response trả `breakdownByPayer` 5 khoản per-payer là input cho gf-accounting `SettlementPrintStrategy`
- CR-20260616-01 PRINT-INS-001/007
- BR-EP §7.2 worked example (monetary depreciation ≈ 200.000 đ)
- Source code paths (gf-sales, contract đã đúng):
  - `services/gf-sales/src/main/java/com/actechx/gf/app/dto/response/InsuranceSettlementSummary.java` — `depreciationAmount: BigDecimal` (monetary, line 43)
  - `services/gf-sales/src/main/java/com/actechx/gf/app/dto/response/ServiceOrderForPrintResponse.java` — `BreakdownByPayer.depreciationInsurance/depreciationCustomer: BigDecimal` (monetary, lines 133-134)
  - `services/gf-sales/src/main/java/com/actechx/gf/printing/service/ServiceOrderForPrintService.java` — `buildBreakdownByPayer` lines 158, 168-169 (đã consume monetary)
  - `services/gf-sales/src/main/java/com/actechx/gf/app/service/ServiceOrderInternalService.java` — `computeDepreciationAmount` lines 606-621 (Σ `part.finalAmount × percent / 100`)
