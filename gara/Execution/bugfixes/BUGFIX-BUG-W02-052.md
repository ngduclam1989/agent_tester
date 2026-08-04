# BUGFIX-BUG-W02-052: `getSettlementByCode` trả `depreciation = null/0` khi khấu hao áp per-dòng (`depreciationDefaultPercent = 0`)

> **REDESIGN 2026-06-25** — fix trước (commit `20196eb`) thêm persisted snapshot field `depreciationAmount` (vi phạm constraint user). Bản này **reverse** toàn bộ persisted field và chuyển fix sang **read-path** (BFF), KHÔNG đụng entity/aggregate/snapshot.

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-052 |
| **Service** | gf-accounting (read-path revert) + agg-garage-graph (BFF, fix thật) + gf-sales (escalated) |
| **Priority** | P1 |
| **Mô tả** | Response `GET /api/v1/settlements/{code}` (Chi tiết / Sửa phiếu QT KH có BH) trả `depreciation = null/0` khi khấu hao được áp **per-dòng** và header `depreciationDefaultPercent = 0`. Triệu chứng: "Phiếu dịch vụ có data nhưng Phiếu QT trả null/0". |

## Root Cause (Why-chain)

1. **Why** `depreciation = 0`? → gf-accounting `SettlementService.computeDepreciationAmount` derive `breakdownPartsInsurance × depreciationDefaultPercent / 100` — chỉ header %. Header=0 → 0.
2. **Why** không có nguồn per-line? → gf-accounting snapshot là immutable (CB-INS-002) và chỉ lưu raw `depreciation_default_percent`; per-line part data (`part.finalAmount × line%`) chỉ tồn tại ở gf-sales.
3. **Why** không thể persist per-line vào gf-accounting? → **Constraint (user-imposed)**: cấm thêm field persisted trên `settlement_records` / aggregate / snapshot. Khấu hao đúng (BR §7.1 dòng 356) = Σ(thành tiền phụ tùng BH **sau VAT** × % dòng) là sau-VAT per-dòng — không tái lập được từ snapshot before-VAT.

**Root cause**: gf-accounting không có (và không được phép có) nguồn khấu hao authoritative. Nguồn duy nhất hợp lệ = gf-sales, đọc tại read-path. Fix sai trước đó persist `depreciationAmount` lên snapshot → vi phạm constraint.

## Fix

### (A) Reverse fix sai (gf-accounting) — gỡ persisted field

- `SettlementEntity.java` — gỡ `@Column(name="depreciation_amount") depreciationAmount`.
- `Settlement.java` (aggregate) — gỡ field + 3 propagation site (2× snapshot builder, 1× `toBuilder()`).
- `InsuranceSettlementSnapshot.java` — gỡ field.
- `CreateSettlementRequest.java` — gỡ field + clause trong `hasInsuranceBlock()`.
- `ServiceOrderForSettlementDto.java` — gỡ field.
- `SettlementService.computeDepreciationAmount` — gỡ nhánh per-line precedence, trở lại header-% only (transitional). Javadoc ghi rõ authoritative figure đến từ read-path / gf-sales.
- `SettlementService` — gỡ `computeCustomerPayableAmount` + 3 populate site trong `buildInsuranceDetailBlock`; `buildInsuranceSnapshot` gỡ coalesce `depreciationAmount`.
- `InsuranceSettlementDetailBlock.java` (response, non-persisted) — gỡ 3 field `depreciationAmount`/`customerPayableAmount`/`totalPayableAmount` (repopulate ở BFF, không cần ở REST DTO).

### (B) Fix thật — read-path BFF (`agg-garage-graph`)

- `settlements.resolver.ts` `getSettlementByCode` — mở rộng khối đồng bộ SO: phiếu **CUSTOMER** có phân bổ BH (`settlementType === "CUSTOMER"` + `totalAfterVatCustomer !== undefined`) nay **cũng** override `settlementData.depreciation = so.depreciation` (trước chỉ áp `INSURANCE`). `so.depreciation` là khấu hao authoritative từ gf-sales (cùng nguồn phiếu BH dùng) → hết null/0.

## Trade-off

- gf-accounting REST trả khấu hao header-% (transitional, có thể 0). Đây là **best-effort** — FE đi qua BFF, nơi `so.depreciation` cover. Client gọi REST trực tiếp (không qua BFF) sẽ thấy header-% cho tới khi gf-sales emit `settlementSummary.depreciationAmount` (escalated). Đây là hệ quả không thể tránh của constraint "no persisted field" + nguyên tắc snapshot immutable (CB-INS-002).

## Escalation (cross-boundary)

→ **agent-fix-gf-sales** (Trigger #1): emit `settlementSummary.depreciationAmount` (Σ part.finalAmount sau-VAT × line%) trên `for-settlement` / SO detail. Hook forward-compat `summary.depreciationAmount` đã có sẵn ở `insurance.mapper.ts` (`buildAdjustmentsFromSales`) — khi gf-sales phát, `so.depreciation` tự dùng giá trị này, không cần đổi BFF.

## Regression Test

- gf-accounting `SettlementDepreciationPerLineTest` (rewrite) — pin header-% transitional: `headerPercentDepreciation_insuranceSide` (20% × 10M → 2M), `headerPercentZero_depreciationZero` (header=0 → 0, read-path bù), `customerRow_headerPercentDepreciation`.
- BFF `insurance.mapper.regression.ts` — `deriveCustomerVoucherBalances` block (gián tiếp cover override depreciation cho phiếu KH).

## Verification Checklist

- [x] gf-accounting: gỡ hết persisted field, `./gradlew compileJava` PASS.
- [x] gf-accounting `./gradlew test` 94/96 PASS (2 fail = BUG-W02-067 dossier font, pre-existing ngoài scope).
- [x] BFF `npm run typecheck` + `npm run build` PASS; `npm run test:insurance-mapper` green.
- [x] KHÔNG đụng `settlement_records` schema / aggregate / snapshot field.
- [ ] REVIEW_GROUP approved (pending).

## Cross-Reference

- BUG-W02-075 (cùng phiếu KH — `customerPayment`/`totalPayment` derive ở BFF).
- BUG-W02-079 (cùng read-path override `so.depreciation` cho phiếu KH).
- BR-EP §7.1 dòng 356 / CALC-INS-003 / CNF-INS-002 / BR-INS-STL-DET-009(b).
- BFF: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.resolver.ts` + `insurance.mapper.ts`.
