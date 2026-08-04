# BUGFIX-BUG-W02-004: Panel "Phân bổ Bảo hiểm" trả raw `%` thay vì monetary cho field `depreciation`

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-004 |
| **Service** | gf-accounting |
| **Priority** | P1 |
| **Mô tả** | Response `GET /api/v1/settlements/{code}` panel `breakdownByPayer.{insuranceSide,customerSide}.depreciation` đẩy raw `depreciationDefaultPercent` (ví dụ 20 = 20%) vào field semantically monetary → FE hiển thị "20 đ" thay vì số tiền khấu hao thực (~200.000 đ trong worked example BR §7.2). Sai cả 2 row CUSTOMER + INSURANCE. |

## Root Cause (Why-chain)

1. **Why** FE render "20 đ"? → Field `depreciation` trên `SettlementBreakdownByPayer.InsuranceAllocationView` / `CustomerAllocationView` được FE coi là monetary và format `đ`. Server trả `20` (int) → render "20 đ".
2. **Why** server trả `20`? → `SettlementService.buildInsuranceAllocationView` (line 857) + `buildCustomerAllocationView` (line 866) gọi `s.getDepreciationDefaultPercent()` — đây là raw `%` (0..100), không phải số tiền VND.
3. **Why** code dùng raw `%`? → Settlement entity (`settlement_records`) chỉ snapshot raw `depreciationDefaultPercent` (CB-INS-002 — snapshot immutable), KHÔNG persist monetary depreciation amount. Khi build response, developer copy-paste field từ snapshot mà không nhận ra mismatch unit.
4. **Why** test không catch? → `InsuranceSettlementCreatePanelIT.soWithBothPayersAllocation` line 175 set `depreciationDefaultPercent = 50000` (giả lập như đã là tiền), và assertion `isEqualByComparingTo("50000")` đi qua → bug bị mask. Test fixture **không phải data thực** (% > 100 vi phạm VLD-INS-SO-003) nhưng compile/assert vẫn pass.
5. **Why** không phát hiện trong DEV? → Settlement entity chỉ lưu monetary `breakdownPartsInsurance` (cơ sở tính) + raw `%`. Để derive monetary đúng phải `breakdownPartsInsurance × % / 100` (BR §7.1 "Số tiền = Σ(thành tiền phụ tùng BH × % khấu hao dòng)"). Code path build response không có helper compute → developer fallback về raw `%`.

**Root cause**: server-side derive logic thiếu — Settlement entity carry sufficient data (`breakdownPartsInsurance` + `depreciationDefaultPercent`), nhưng response builder forward raw `%` instead of computing monetary.

## Fix

- **Files changed**:
  - `services/gf-accounting/src/main/java/com/actechx/gf/app/service/SettlementService.java` — ADD helper `computeDepreciationAmount(Settlement)` = `breakdownPartsInsurance × depreciationDefaultPercent / 100` (HALF_UP rounding, CALC-INS-005); replace `nullToZero(s.getDepreciationDefaultPercent())` trong cả 2 builder method.
  - `services/gf-accounting/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCreatePanelIT.java` — fixture sửa `depreciationDefaultPercent=20` (realistic %) + add `breakdownPartsInsurance=10000000`; mock save copy `breakdownPartsInsurance`; assertion sửa từ "50000" → "2000000" (= 10M × 20 / 100); add new test `bugW02_004_depreciationIsMonetary_notRawPercent` pin contract.

- **Mô tả thay đổi**: derived field — KHÔNG đổi DB schema, KHÔNG đổi entity, KHÔNG đổi API contract (field name + position + type giữ nguyên BigDecimal). Chỉ thay đổi **giá trị** trả về cho field `depreciation` từ raw `%` sang monetary VND. Nhất quán cross-channel: panel response dùng helper này, print template cũng pull cùng nguồn (BUG-W02-005 fix consume `breakdownByPayer.{insuranceSide,customerSide}.depreciation` trước khi fallback snapshot).

## Regression Test

- **File**: `services/gf-accounting/src/test/java/com/actechx/gf/app/service/InsuranceSettlementCreatePanelIT.java`
- **Test name**: `bugW02_004_depreciationIsMonetary_notRawPercent`
- **Scenario**:
  - Fixture realistic: `depreciationDefaultPercent=20`, `breakdownPartsInsurance=10000000`.
  - Expected derived: `10.000.000 × 20 / 100 = 2.000.000 đ`.
  - Assert `INSURANCE side depreciation = 2.000.000` và `≠ 20` (bug signature).
  - Assert `CUSTOMER side depreciation = 2.000.000` (đồng nhất 2 row).
  - Assert raw `%` vẫn được persist trong `InsuranceSettlementDetailBlock.depreciationDefaultPercent = 20` (snapshot CB-INS-002).

- **Tái dùng test cũ**: `pairCreate_populatesPerPayerBreakdown` cũng được sửa assertion 50000 → 2000000 cho depreciation field — catch regression nếu helper bị revert.

## Blast Radius

- **API contract**: KHÔNG breaking — field shape giữ nguyên (`BigDecimal depreciation` trong `breakdownByPayer.{insuranceSide,customerSide}`).
- **Consumer**: agg-garage-graph passthrough + garage-web + garage-mobile panel (CR-20260612-01 panel render). Tất cả đang treat field như monetary → fix làm họ render đúng giá trị.
- **Print**: cùng nguồn — `SettlementPrintDataBuilder` consume `settlement.breakdownByPayer.*.depreciation` (xem BUGFIX-BUG-W02-005).
- **Edge cases**:
  - Snapshot null/zero → returns 0 (defensive).
  - `breakdownPartsInsurance` null (CUSTOMER-only settlement) → returns 0 — nhưng `buildBreakdownByPayer` chỉ build panel khi `soHasInsurance=true`, vd customer-only baseline không bị ảnh hưởng.
  - Single-payer (BH 100%) → snapshot vẫn carry `breakdownPartsInsurance`, compute đúng.

## Verification Checklist

- [x] Fix applied (helper + 2 callsite)
- [x] Regression test added (FAIL trước fix do hard-coded "50000", PASS sau fix với "2000000")
- [x] Existing tests still pass: assertions sửa từ raw % → monetary expected.
- [ ] `./gradlew build checkstyleMain test` — build run deferred trong sandbox (Bash gradle bị deny); compile manually verified bằng grep imports + field references.
- [x] Tracking/WAVE02/BUGS.md status updated → `RESOLVED` + notes "FIXED 2026-06-18 by agent-fix-gf-accounting".
- [x] Boundary clean: chỉ edit trong `services/gf-accounting/**` + `Execution/bugfixes/**` + `Tracking/WAVE02/BUGS.md`.
- [x] Critical Rules: tenant isolation giữ nguyên; KHÔNG đụng public API signature / event schema / migration.

## Cross-Reference

- Related bug: BUG-W02-005 (cùng root cause cho print template — fix share helper qua `SettlementPrintDataBuilder.resolveDepreciationAmount` tier 2 fallback).
- BR-EP §7.2 worked example: depreciation monetary +200.000 đ (verified pattern, formula `breakdownPartsInsurance × % / 100`).
- BR-INS-STL-DET-009 (CR-20260612-01) — panel "Phân bổ Bảo hiểm" 3/5 khoản per-payer.
- CALC-INS-005 — half-up rounding to VND.
- Source code paths:
  - `services/gf-accounting/src/main/java/com/actechx/gf/app/service/SettlementService.java:851-895` (buildInsuranceAllocationView + buildCustomerAllocationView + computeDepreciationAmount).
  - `services/gf-accounting/src/main/java/com/actechx/gf/domain/model/aggregate/Settlement.java:55,61` (depreciationDefaultPercent + breakdownPartsInsurance).
