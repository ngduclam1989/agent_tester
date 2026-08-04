# BUGFIX-BUG-W02-075: `getSettlementByCode` phiếu QT KH có BH trả `customerPayment` + `totalPayment` = null

> **REDESIGN 2026-06-25** — fix trước (commit `20196eb`) thêm response field `customerPayableAmount`/`totalPayableAmount` được populate từ persisted snapshot field `depreciationAmount` (vi phạm constraint). Bản này derive 2 giá trị tại **read-path BFF**, KHÔNG đụng entity/snapshot/REST DTO.

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-075 |
| **Service** | agg-garage-graph (BFF, fix thật) |
| **Priority** | P1 |
| **Mô tả** | Phiếu QT Khách hàng tạo từ SO có chọn bảo hiểm (vd `SET-20260624-00002`): GraphQL `getSettlementByCode` trả `customerPayment` = null và `totalPayment` = null → 2 ô "Khách hàng thanh toán" + "Tổng thanh toán" hiển thị 0đ. Các giá trị thành phần đều có đủ (Cộng sau VAT KH 12.238.225 + 3 khoản phân bổ chuyển KH). `insurancePayment` tính ĐÚNG → chỉ riêng phần tiền KH phải trả bị null. |

## Root Cause (Why-chain)

1. **Why** FE 2 ô KH/tổng hiển thị 0đ? → GraphQL trả `customerPayment = null`, `totalPayment = null`.
2. **Why** BFF trả null? → `insurance.mapper.ts:mapAccountingInsuranceFlat` đọc `customerPayableAmount`/`totalPayableAmount` từ block `insurance` của REST → `undefined` (gf-accounting không persist 2 field này, đúng theo BR-GF-ACCOUNTING-006 — chỉ persist `insurancePayableAmount`).
3. **Why** resolver không tự derive? → Khối reconciliation `settlements.resolver.ts:getSettlementByCode` chỉ derive `customerPayment`/`totalPayment` cho `settlementType === "INSURANCE"` (từ `so.customerAmount`/`so.finalAmount`). Phiếu **CUSTOMER** có phân bổ BH không được nhánh nào xử lý → null chảy xuống FE.

**Root cause**: "Khách hàng thanh toán" là **derived** (Cộng sau VAT KH + 3 khoản phân bổ chuyển KH chịu), không persist; nhưng read-path BFF không có nhánh derive cho phiếu CUSTOMER có BH. Fix sai trước đó persist/surface 2 field ở REST DTO (kéo theo persisted `depreciationAmount`) → vi phạm constraint.

## Fix — read-path BFF (`agg-garage-graph`)

- `insurance.mapper.ts` — ADD helper thuần `deriveCustomerVoucherBalances({ totalAfterVatCustomer, claimReduction, depreciation, insuranceDeductible })` = `totalAfterVatCustomer + Σ(customerAmount của 3 khoản transferToCustomer=true)`. Trả `{}` (giữ SDL scalar absent) khi thiếu `totalAfterVatCustomer`.
- `settlements.resolver.ts` `getSettlementByCode` — thêm nhánh phiếu **CUSTOMER** có phân bổ BH: override `depreciation = so.depreciation` (đồng nhất phiếu BH — BUG-W02-079) rồi set `customerPayment` + `totalPayment = customerPayment` (phiếu KH 1 bên thanh toán) từ helper, chỉ khi đang `undefined` (giữ passthrough nếu BE/SO đã cung cấp).

**Mô tả**: derive thuần ở BFF — KHÔNG đụng `settlement_records` schema / aggregate / snapshot / REST DTO. gf-accounting/gf-sales vẫn authoritative cho từng thành phần (`totalAfterVatCustomer`, các khoản allocation). Helper là re-aggregation cho FE convenience (giống `deriveAmount`/`deriveWaveFlags` đã có).

## Trade-off / Số liệu

- Bug report kỳ vọng 17.092.815 (tính với Khấu hao **sai** trước-VAT 1.046.500). Sau fix BUG-W02-079 (Khấu hao đúng = sau-VAT 1.094.350 từ `so.depreciation`), `customerPayment` tự-nhất-quán = **17.140.665** = 12.238.225 + 3.508.090 + 1.094.350 + 300.000. Regression assert giá trị đúng sau cả 2 fix.

## Regression Test

- BFF `insurance.mapper.regression.ts` — block `deriveCustomerVoucherBalances`:
  - `customerPayment` = công thức AC-6 (KHÔNG null) + `totalPayment === customerPayment`.
  - Chênh lệch customerPayment giữa khấu hao sau-VAT vs trước-VAT = đúng phần VAT khấu hao (cover liên đới BUG-W02-079).
  - Khoản `transferToCustomer=false` (CK liên kết) KHÔNG cộng vào KH.
  - Thiếu `totalAfterVatCustomer` → trả `{}` (không emit 0).

## Blast Radius

- **Contract**: KHÔNG breaking — `customerPayment`/`totalPayment` đã có trong SDL `SettlementByCodeResponse`; chỉ thay đổi từ null → có giá trị cho phiếu KH có BH.
- **Consumer**: garage-web + garage-mobile panel "Cân thanh toán". Phiếu BH giữ nhánh cũ (derive từ SO). Phiếu KH baseline không BH → `totalAfterVatCustomer` undefined → helper trả `{}` → không ảnh hưởng.

## Verification Checklist

- [x] Helper + nhánh resolver landed; BFF `npm run typecheck` + `npm run build` PASS.
- [x] `npm run test:insurance-mapper` green (gồm 5 assertion mới).
- [x] gf-accounting KHÔNG đụng tới (chỉ reverse persisted field qua BUG-W02-052 chung).
- [ ] REVIEW_GROUP approved (pending).

## Cross-Reference

- BUG-W02-079 (cùng phiếu — Khấu hao đúng base sau VAT; cùng override `so.depreciation`).
- BUG-W02-052 (reverse persisted field chung).
- BR-INS-STL-DET-009(b) + worked example FEAT-INS-STL-DETAIL AC-6 dòng 102.
- BFF: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts` (`deriveCustomerVoucherBalances`) + `settlements.resolver.ts`.
