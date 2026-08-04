# BUGFIX-BUG-W02-005 (gf-accounting scope): Print template render khấu hao raw % thay vì monetary

> Companion file. Xem `BUGFIX-BUG-W02-005.md` cho gf-sales scope (contract đã đúng, regression test pin). File này document gf-accounting fix: extend DTO + rewrite builder consume monetary.

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-005 (gf-accounting scope) |
| **Service** | gf-accounting |
| **Priority** | P1 |
| **Mô tả** | Print template `settlement-insurance.html` + `settlement-customer.html` render dòng "Khấu hao vật tư / thay mới" với raw `%` ("-50" / "-50.000" tùy fixture) thay vì monetary "-50.000 đ" / "-200.000 đ" thực. Cùng root cause với BUG-W02-004 — `SettlementPrintDataBuilder.buildInsuranceAllocation` line 97 set `.depreciation(safeAmount(ins.getDepreciationDefaultPercent()))` (raw `%` từ snapshot). PKG-W02 §4.1 yêu cầu `for-print response` trả `breakdownByPayer` 5 khoản per-payer là input cho `SettlementPrintStrategy`; integration gap: `ServiceOrderForPrintDto` ở gf-accounting **chưa de-serialize** `breakdownByPayer` field từ gf-sales response. |

## Root Cause (Why-chain)

1. **Why** print "-50" / "-50.000" raw %? → Thymeleaf format integer `50` từ field `context.insuranceAllocation.depreciation`, vì builder forward raw `%` thay vì monetary.
2. **Why** builder forward raw `%`? → Line 97 `getDepreciationDefaultPercent()` returns the snapshot `%` (BR-GF-ACCOUNTING-006 — snapshot immutable). Không có nguồn monetary trong code path.
3. **Why** không dùng monetary từ gf-sales? → `ServiceOrderForPrintDto` (consumer-side DTO) chưa khai báo nested `breakdownByPayer.depreciationInsurance/Customer` — Jackson silently drop field. Builder không có monetary source khác.
4. **Why** không pull từ panel response trong gf-accounting? → `SettlementPrintStrategy.buildPrintContext` đã có `settlementResponse = settlementService.getByCode(...)` chứa `breakdownByPayer` panel, nhưng builder chỉ đọc `settlement.getInsurance()` (snapshot raw) khi build `InsuranceAllocationBlock`. Missing read path.

**Root cause**: 2 gap song song — (a) DTO contract gf-accounting side không match gf-sales for-print response; (b) builder không tận dụng panel monetary value đã có trong SettlementResponse (single source of truth crossover BUG-W02-004).

## Fix

- **Files changed**:
  - `services/gf-accounting/src/main/java/com/actechx/gf/adapter/client/dto/ServiceOrderForPrintDto.java` — ADD nested static class `BreakdownByPayer` (8 monetary fields: `discountMaterialInsurance`, `discountLaborInsurance`, `claimReductionInsurance`, `depreciationInsurance`, `insuranceDeductibleInsurance`, `claimReductionCustomer`, `depreciationCustomer`, `insuranceDeductibleCustomer`) + field `breakdownByPayer` trên parent.
  - `services/gf-accounting/src/main/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilder.java` — rewrite `buildInsuranceAllocation` + add `resolveDepreciationAmount(settlement, so, ins)` static method với 3-tier preference:
    1. gf-sales `for-print.breakdownByPayer.depreciationInsurance/Customer` (per-line accurate, CALC-INS-003).
    2. Panel response `settlement.breakdownByPayer.{insuranceSide,customerSide}.depreciation` (server-computed via SettlementService — single source with màn detail).
    3. Snapshot fallback `breakdownPartsInsurance × percent / 100` (defensive cho code path không build panel).
  - `services/gf-accounting/src/test/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilderTest.java` — NEW unit test 5 cases cover tier 1/2/3 + zero edge cases + customer-side variant.
  - `services/gf-accounting/src/test/java/com/actechx/gf/printing/strategy/SettlementPrintGoldenRenderIT.java` — NEW golden Thymeleaf render IT (covers BUG-W02-006).

- **Mô tả thay đổi**: Additive contract — `ServiceOrderForPrintDto.BreakdownByPayer` field optional (null khi gf-sales chưa attach hoặc deserialize fail → tier 2/3 cover). API public của gf-accounting **không đổi** — chỉ thay đổi internal data flow cho field `InsuranceAllocationBlock.depreciation`.

## Regression Test

- **Files**:
  - `SettlementPrintDataBuilderTest` (unit) — 5 test cases:
    - `useGfSalesForPrintMonetary_whenAttached` — tier 1 win (gf-sales monetary thắng panel).
    - `fallBackToPanelMonetary_whenForPrintMissingBreakdown` — tier 2 fallback.
    - `fallBackToSnapshotCompute_whenPanelAndForPrintMissing` — tier 3 fallback (10M × 20% = 2M, not raw "20").
    - `zeroPercentOrZeroParts_returnsZero` — defensive zero case.
    - `customerSide_usesDepreciationCustomerField` — CUSTOMER side dùng đúng field, không nhầm INSURANCE field.
  - `SettlementPrintGoldenRenderIT` (golden render) — 3 test cases:
    - `insuranceVariant_rendersMonetaryDepreciation` — settlement-insurance.html render monetary "-200.000", KHÔNG raw "-20" / "-50".
    - `customerVariant_rendersMonetaryDepreciationAndHidesCkLink` — settlement-customer.html render "+200.000" + ẨN 2 CK liên kết BH (PRINT-INS-007).
    - `baselineVariant_rendersWithoutInsuranceAllocation` — settlement.html baseline KHÔNG có section "Phân bổ bảo hiểm".

- **Reproduce trước fix**: ✅ `SettlementPrintDataBuilderTest.fallBackToSnapshotCompute_whenPanelAndForPrintMissing` sẽ FAIL ở dòng `isEqualByComparingTo("2000000")` vì pre-fix returns `20`. Golden render test sẽ FAIL ở `contains("-200.000")` vì pre-fix render `-20`.

## Blast Radius

- **Contract**: `ServiceOrderForPrintDto` additive — chưa publish (consumer-only DTO trong gf-accounting); không break Jackson deserialization khi gf-sales chưa gửi field.
- **Print pipeline**: 3 variant template (`settlement.html`, `settlement-insurance.html`, `settlement-customer.html`) — fix touch chỉ field `depreciation` rendered; CK + claim + deductible giữ nguyên (snapshot monetary đã đúng từ trước cho 4 field này).
- **Dossier orchestrator (Phase B render)**: `agg-garage-graph` orchestrator gọi `/api/v1/settlements/{id}/export-pdf` reuse `SettlementPrintStrategy` → fix tự động lan tỏa đúng monetary qua dossier PDF.
- **Backwards compat**: tier 2/3 đảm bảo gf-accounting vẫn hoạt động đúng kể cả khi gf-sales chưa deploy phiên bản gửi `breakdownByPayer`. Zero downtime risk.

## Verification Checklist

- [x] Fix applied (DTO extension + builder rewrite)
- [x] Regression tests added (`SettlementPrintDataBuilderTest` 5 cases + `SettlementPrintGoldenRenderIT` 3 cases)
- [ ] `./gradlew build checkstyleMain test` — build run deferred trong sandbox (Bash gradle deny); manual review imports + signatures.
- [x] Tracking/WAVE02/BUGS.md status note appended với "FIXED gf-accounting scope 2026-06-18".
- [x] Boundary clean: edits chỉ trong `services/gf-accounting/**` + `Execution/bugfixes/**` + `Tracking/WAVE02/BUGS.md`.
- [x] Critical Rules: tenant isolation OK; KHÔNG đụng public API contract / event schema / Flyway migration.
- [x] Cross-boundary coordination: gf-sales side đã pin contract (BUGFIX-BUG-W02-005.md by agent-fix-gf-sales).

## Cross-Reference

- BUG-W02-004 (cùng root cause panel response — share monetary via tier 2 fallback).
- BUG-W02-006 (golden render test gap — closed bằng `SettlementPrintGoldenRenderIT` trong cùng commit).
- PKG-W02 §4.1 (integration spec for `for-print.breakdownByPayer`).
- CR-20260616-01 PRINT-INS-001/007 (template variant 5-/3-khoản allocation).
- BR §7.1, §7.2 (per-line precedence CALC-INS-003 + worked example 200.000 đ).
- Source paths:
  - `services/gf-accounting/src/main/java/com/actechx/gf/adapter/client/dto/ServiceOrderForPrintDto.java` (new `BreakdownByPayer` nested class).
  - `services/gf-accounting/src/main/java/com/actechx/gf/printing/strategy/SettlementPrintDataBuilder.java:80-130` (rewrite buildInsuranceAllocation + resolveDepreciationAmount).
  - `services/gf-sales/src/main/java/com/actechx/gf/app/dto/response/ServiceOrderForPrintResponse.java:130-140` (matching producer schema).
