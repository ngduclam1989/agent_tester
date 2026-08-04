# BUGFIX-BUG-W02-053: Bản in phiếu QT section "Phân bổ bảo hiểm" sai 2 chiều — VALUE (raw % thay vì số tiền) + SIGN (phiếu BH dấu hỗn hợp thay vì all −)

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-053 |
| **Service** | gf-accounting (print builder + Thymeleaf template) |
| **Priority** | P1 |
| **Mô tả** | Bản in phiếu QT (section "Phân bổ bảo hiểm") sai **2 chiều**. **(A) VALUE**: 3 khoản ở PERCENT-mode render raw `%` thay vì số tiền — "CK liên kết BH - Vật tư" `-10` (phải `-494.950`), "CK liên kết BH - Công dịch vụ" `-5` (phải `-266.475`), "Giảm trừ bồi thường" `+10` (phải `1.075.476`). **(B) SIGN**: bản in **BH** hiển thị dấu hỗn hợp (Giảm trừ / Khấu hao / Khấu trừ dấu `+`) trong khi PRINT-INS-001 + mockup yêu cầu **TẤT CẢ 5 khoản dấu `−`**; bản in **KH** (PRINT-INS-007) đúng 3 khoản dấu `+`. "Tổng thanh toán" vẫn đúng — chỉ line items sai. |

## Root Cause (Why-chain)

### (A) VALUE — raw % thay vì monetary

1. **Why** bản in show `-10` / `-5` / `+10` thay vì số tiền VND? → Thymeleaf format raw integer (= raw percent của adjustment) thay vì số tiền đã quy đổi.
2. **Why** raw percent chui vào field monetary của `InsuranceAllocationBlock`? → `SettlementPrintDataBuilder.buildInsuranceAllocation` bind thẳng `.discountMaterial(ins.getDiscountMaterialValue())`, `.discountLabor(ins.getDiscountLaborValue())`, `.claimReduction(ins.getClaimReductionValue())` — tức snapshot `*Value` raw.
3. **Why** snapshot `*Value` lại là raw percent? → `InsuranceSettlementDetailBlock.*Value` lưu giá trị **theo mode**: khi `discountMaterialMode`/`discountLaborMode`/`claimReductionMode == PERCENT` thì `*Value` là phần trăm (vd `10`), KHÔNG phải VND. Chỉ đúng khi mode = AMOUNT.
4. **Why** chỉ `depreciation` được xử lý đúng còn 3 khoản kia thì không? → BUG-W02-005 chỉ generalize fix cho `.depreciation` (qua `resolveDepreciationAmount` 3-tier preference). 3 khoản discount/claim vẫn bind raw `*Value` → fix W02-005 **incomplete**.

**Kết luận (A)**: bản in cần monetary cho **cả 5 khoản**, lấy từ nguồn đã quy đổi (gf-sales `for-print.breakdownByPayer` hoặc panel `SettlementResponse.breakdownByPayer`), KHÔNG bind raw snapshot `*Value` (raw chỉ đúng khi mode = AMOUNT).

### (B) SIGN — phiếu BH dấu hỗn hợp thay vì all −

1. **Why** phiếu BH render `− − + + +` (claimReduction / depreciation / insuranceDeductible mang `+`)? → Template `settlement.html` INSURANCE value block hard-code prefix `'+'` cho 3 dòng claimReduction / depreciation / insuranceDeductible.
2. **Why** template lại dùng dấu hỗn hợp cho phiếu BH? → Template kế thừa convention dấu của **panel màn detail** (BR-INS-STL-DET-009: CK liên kết BH `−`, các khoản transfer `+`) — convention panel KHÁC convention bản in.
3. **Why** convention bản in BH phải all `−`? → PRINT-INS-001 + mockup canonical `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-insurance.html` (oracle) vẽ cả 5 khoản dấu `−` (cả 5 đều TRỪ tiền BH). Mockup phiếu KH `...-print-customer.html` vẽ 3 khoản transfer dấu `+`.

**Kết luận (B)**: phiếu BH (payerSide = INSURANCE) phải all `−`; phiếu KH (payerSide = CUSTOMER) giữ nguyên 3 khoản `+` (đã đúng — KHÔNG đụng).

## Fix

- **Files changed**:
  - `services/gf-accounting/src/main/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilder.java` — (A) generalize 3-tier monetary resolver. Thêm helper `resolveAllocationAmount(...)` nhận extractor lambdas (Tier1 gf-sales for-print, Tier2 panel, Tier3 snapshot raw `*Value`), pick side INSURANCE/CUSTOMER theo `settlement.getSettlementType()` y như `resolveDepreciationAmount`. `buildInsuranceAllocation` nay resolve cả `discountMaterial`, `discountLabor`, `claimReduction`, `insuranceDeductible` (cùng `depreciation` giữ qua `resolveDepreciationAmount`) sang monetary. `resolveDepreciationAmount` giữ nguyên (BUG-W02-005 logic).
  - `services/gf-accounting/src/main/resources/templates/settlement/settlement.html` — (B) đổi 3 prefix `'+'` → `'-'` trong INSURANCE value block (claimReduction / depreciation / insuranceDeductible) → cả 5 khoản phiếu BH dấu `−`. CUSTOMER block (3 khoản `+`) KHÔNG đụng.
  - `services/gf-accounting/src/test/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilderTest.java` — ADD 2 test VALUE (BUG-W02-053): snapshot PERCENT mode (raw 10/5/10) + for-print monetary (494950/266475/1075476) → block phơi MONETARY KHÔNG raw %; tier-2 fallback panel monetary cho cả 3 khoản discount/claim.
  - `services/gf-accounting/src/test/java/com/actechx/gf/printing/template/SettlementTemplateRegressionTest.java` — ADD golden Thymeleaf-render test (BUG-W02-053 SIGN): phiếu BH render all 5 khoản dấu `−`, phiếu KH 3 khoản dấu `+`; blocklist raw `>-10<`/`>-5<`/`>+10<`.

- **Mô tả approach**:
  - (A) Tái dùng đúng 3-tier preference đã được thiết lập cho depreciation (BUG-W02-005) — generalize thành helper nhận lambda thay vì duplicate 4 lần. Tier 1 = gf-sales `for-print.breakdownByPayer` (đã carry monetary per-payer: INSURANCE side `discountMaterialInsurance`/`discountLaborInsurance`/`claimReductionInsurance`/`insuranceDeductibleInsurance`; CUSTOMER side chỉ có `claimReductionCustomer`/`insuranceDeductibleCustomer`). Tier 2 = panel `SettlementBreakdownByPayer` (`InsuranceAllocationView` / `CustomerAllocationView`). Tier 3 = snapshot raw `*Value` (chỉ đúng khi mode = AMOUNT). `insuranceDeductible` route qua cùng path để nhất quán (dù là AMOUNT-mode).
  - (B) Sign là convention **bản in** (không phải convention panel) → sửa tại template, đúng oracle mockup. Không đụng logic depreciation (BUG-W02-005) hay panel/snapshot (thuộc BUG-W02-052).

- **Cross-boundary**: KHÔNG sửa gf-sales — `for-print.breakdownByPayer` đã emit đủ field monetary cần thiết (verified trong `ServiceOrderForPrintDto.BreakdownByPayer`). Fix nằm hoàn toàn ở consumer gf-accounting.

## Regression Test

- **File 1**: `services/gf-accounting/src/test/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilderTest.java`
  - **Test name**: `SettlementPrintDataBuilderTest > BUG-W02-053 VALUE: INSURANCE settlement có snapshot discount/claim ở PERCENT mode (raw 10/5/10) nhưng for-print carry monetary (494950/266475/1075476) → block phơi MONETARY, KHÔNG raw %.`
  - **Test name**: `SettlementPrintDataBuilderTest > BUG-W02-053 VALUE tier 2: for-print thiếu → fall back panel monetary cho cả 3 khoản discount/claim (KHÔNG raw % snapshot).`
  - **Scenario**: snapshot mode PERCENT raw 10/5/10; for-print (hoặc panel) carry monetary 494950/266475/1075476. Assert `InsuranceAllocationBlock.discountMaterial/discountLabor/claimReduction` = monetary, `isNotEqualByComparingTo` raw %. **FAIL trước fix** (bind raw `*Value` → trả 10/5/10), **PASS sau fix**.
- **File 2** (golden/template — SIGN): `services/gf-accounting/src/test/java/com/actechx/gf/printing/template/SettlementTemplateRegressionTest.java`
  - **Test name**: `SettlementTemplateRegressionTest > BUG-W02-053 SIGN: phiếu BH (INSURANCE) render TẤT CẢ 5 khoản Phân bổ bảo hiểm dấu − (KHÔNG còn dấu + hỗn hợp).`
  - **Test name**: `SettlementTemplateRegressionTest > BUG-W02-053 SIGN: phiếu KH (CUSTOMER) giữ 3 khoản transfer dấu + (PRINT-INS-007 — KHÔNG đổi).`
  - **Scenario**: render `settlement/settlement` với `InsuranceAllocationBlock` payerSide=INSURANCE → assert all 5 dấu `−`, `doesNotContain` `+1.075.476`/`+323.076`/`+100.000`; blocklist raw `>-10<`/`>-5<`/`>+10<`. payerSide=CUSTOMER → assert 3 khoản dấu `+`. **FAIL trước fix** (template hard-code `+` cho 3 dòng BH), **PASS sau fix**.

## Verification Checklist

- [x] Fix applied (builder 3-tier resolver generalized + template sign all − cho phiếu BH)
- [x] Regression test added (VALUE: `SettlementPrintDataBuilderTest` ×5; SIGN+VALUE: `SettlementTemplateRegressionTest` ×4)
- [x] Regression test reproduces bug trước fix (VALUE: bind raw `*Value` → 10/5/10 fails `isEqualByComparingTo("494950")`; SIGN: template `+` → `plusCount.isZero()` fails)
- [x] Regression test passes sau fix: `./gradlew test` — `SettlementPrintDataBuilderTest 10/10 PASS`, `SettlementTemplateRegressionTest 4/4 PASS`
- [x] Existing tests still pass + build clean: `JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./gradlew build` BUILD SUCCESSFUL (12 suites, 93 tests, 0 failures; spotlessCheck PASS — no `checkstyleMain` task on this repo, uses spotless instead)
- [x] Jacoco coverage on `SettlementPrintDataBuilder`: line 79.1%, instruction 76.6%, method 100% — delta ≥ 0 vs HEAD (added 5 unit + 4 render tests covering all 3 tiers + sign convention).
- [x] Boundary clean: chỉ edit `services/gf-accounting/**` + `Execution/bugfixes/**` + `Tracking/WAVE02/BUGS.md`
- [x] Tracking/WAVE02/BUGS.md status updated OPEN → IN_PROGRESS → RESOLVED
- [x] No new P1/P2 introduced (chỉ thêm test + generalize resolver + sửa sign template)
- [ ] Cross-boundary follow-up — `agent-fix-gf-sales` verify `for-print.breakdownByPayer` field naming alignment (`deductibleInsurance/Customer` vs gf-accounting consumer `insuranceDeductibleInsurance/Customer`); not blocking — tier 2/3 cover graceful degradation. (See `bugs_escalated[]` in RETURN.)

## Cross-Reference

- BUG-W02-005 — incomplete fix (chỉ depreciation value, cùng `buildInsuranceAllocation`). Bug này hoàn tất phần còn lại (3 khoản discount/claim).
- BUG-W02-006 — golden coverage gap (không assert dấu, không blocklist -10/-5/+10). `SettlementTemplateRegressionTest` lấp gap này.
- BUG-W02-004 — API panel %→money sibling (cùng họ root cause).
- BUG-W02-052 — depreciation=null API (cùng root-cause family) — KHÔNG đụng trong fix này; depreciation monetary resolution giữ qua `resolveDepreciationAmount`.
- BUG-W02-081 — FE preview sibling (garage-web): biểu hiện CÒN SÓT của 053-B trên preview FE; bug này fix server-side Thymeleaf (gf-accounting) đúng convention all −.
- Oracle canonical: `Product/ux/assets/SETTLEMENT-INSURANCE-001-print-insurance.html` (BH all −) + `...-print-customer.html` (KH 3 khoản +).
- PRINT-INS-001 (BH: 5 khoản dấu −) + PRINT-INS-007 (KH: 3 khoản dấu +) / CR-20260616-01.
- Source paths:
  - `services/gf-accounting/.../printing/strategy/SettlementPrintDataBuilder.java` — `buildInsuranceAllocation` + `resolveAllocationAmount` (new) + `resolveDepreciationAmount`.
  - `services/gf-accounting/.../adapter/client/dto/ServiceOrderForPrintDto.java` — `BreakdownByPayer` 8 field monetary per-payer (tier 1).
  - `services/gf-accounting/.../app/dto/response/SettlementBreakdownByPayer.java` — `InsuranceAllocationView` / `CustomerAllocationView` (tier 2).
  - `services/gf-accounting/.../resources/templates/settlement/settlement.html` — INSURANCE value block (lines ~123-127) all dấu −.
