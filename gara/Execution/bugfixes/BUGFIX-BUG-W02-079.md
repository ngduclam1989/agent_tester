# BUGFIX-BUG-W02-079: Khấu hao vật tư (`depreciation.amount`) phiếu QT KH dùng base TRƯỚC VAT, lệch với phiếu BH

> **REDESIGN 2026-06-25** — fix trước (commit `20196eb`) surface `depreciationAmount` ở REST DTO, populate từ persisted snapshot field (vi phạm constraint). Bản này fix tại **read-path BFF**: mở rộng override `so.depreciation` cho phiếu KH — KHÔNG đụng entity/snapshot/REST DTO.

## Bug

| Thuộc tính | Chi tiết |
|---|---|
| **ID** | BUG-W02-079 |
| **Service** | agg-garage-graph (BFF, fix thật) + gf-sales (escalated — nguồn after-VAT) |
| **Priority** | P1 |
| **Mô tả** | Phiếu QT KH có BH (vd `SET-20260624-00002`): API trả `depreciation.amount` = 1.046.500 (10% × 10.465.000 giá phụ tùng TRƯỚC thuế) nhưng ĐÚNG phải 1.094.350 (sau thuế) — giống phiếu BH `SET-20260624-00003` cùng SO (BH trả đúng). Khấu hao `transferToCustomer=true` → sai số chảy vào tiền KH phải chịu. Vi phạm BR-EP §7.1 (base = Cộng sau VAT theo bên thanh toán). |

## Root Cause (Why-chain)

1. **Why** phiếu KH `depreciation.amount` = 1.046.500 còn phiếu BH = 1.094.350, dù cùng SO? → Hai phiếu lấy `depreciation.amount` từ **2 nguồn khác nhau ở tầng BFF**.
2. **Why** 2 nguồn? → `settlements.resolver.ts` override `depreciation = so.depreciation` (gf-sales, sau VAT = 1.094.350) **CHỈ khi `settlementType === "INSURANCE"`**. Phiếu KH không vào nhánh này → giữ giá trị do `buildAdjustmentsFromAccounting` derive.
3. **Why** giá trị derive của phiếu KH = 1.046.500? → `insurance.mapper.ts:buildAdjustmentsFromAccounting` fallback `deriveAmount("PERCENT", percent, breakdownPartsInsurance)` = 10% × 10.465.000 (parts BH **trước VAT**) = 1.046.500.
4. **Why** không thể dựng base sau-VAT từ snapshot? → Tỉ lệ ngụ ý parts sau/trước VAT = 10.943.500 / 10.465.000 ≈ **1.0457** (không phải 1.1 = 10% VAT) → after-VAT-parts **không tái lập được** từ before-VAT bằng tỉ lệ cố định. Khấu hao đúng (BR §7.1 dòng 356) = Σ(thành tiền phụ tùng BH **sau VAT** × % dòng) — chỉ gf-sales có per-line part data để tính.

**Root cause**: BFF tính khấu hao phiếu KH trên base **trước VAT** (`breakdownPartsInsurance`), sai về bản chất. Nguồn after-VAT per-dòng authoritative chỉ tồn tại ở gf-sales (`so.depreciation`), đã được dùng cho phiếu BH nhưng KHÔNG cho phiếu KH. Fix sai trước đó cố surface giá trị qua REST (kéo theo persisted field) → vi phạm constraint, và vẫn lệ thuộc base trước-VAT từ snapshot.

## Fix — read-path BFF (`agg-garage-graph`)

- `settlements.resolver.ts` `getSettlementByCode` — nhánh phiếu **CUSTOMER** có phân bổ BH nay **cũng** override `settlementData.depreciation = so.depreciation` (trước chỉ áp `INSURANCE`). Cả phiếu KH + BH đọc CÙNG nguồn khấu hao từ gf-sales → 2 phiếu khớp tuyệt đối, hết lệch trước/sau VAT.

**Mô tả**: passthrough-first — `so.depreciation` là nguồn authoritative gf-sales (cùng object phiếu BH dùng). KHÔNG đụng `settlement_records` schema / aggregate / snapshot / REST DTO. gf-accounting REST giữ giá trị header-% transitional (chỉ dùng cho client gọi REST trực tiếp).

## Escalation (cross-boundary)

→ **agent-fix-gf-sales** (Trigger #1): hiện `so.depreciation.amount` do BFF tự derive từ `summary.breakdownPartsInsurance` (trước VAT) **trừ khi** gf-sales emit `settlementSummary.depreciationAmount` (sau VAT, Σ per-dòng). Hook forward-compat `summary.depreciationAmount` đã có ở `insurance.mapper.ts:buildAdjustmentsFromSales` (line ~454). Khi gf-sales phát field này → `so.depreciation` sau-VAT cho CẢ 2 phiếu (override đã thống nhất nguồn) → 1.094.350 đúng. Tới lúc đó cả 2 phiếu vẫn KHỚP nhau (cùng `so.depreciation`), chỉ là transitional trước-VAT cho tới khi gf-sales ship.

## Regression Test

- BFF `insurance.mapper.regression.ts` — `deriveCustomerVoucherBalances` block: assert chênh lệch `customerPayment` khi khấu hao sau-VAT (1.094.350) vs trước-VAT (1.046.500) = đúng phần VAT khấu hao (47.850) → chứng minh khấu hao phải đến từ `so.depreciation` (sau VAT) để 2 phiếu khớp + tiền KH đúng.

## Blast Radius

- **Contract**: KHÔNG breaking — `depreciation` đã có trong SDL; chỉ thay nguồn cho phiếu KH (so.depreciation thay vì derive trước-VAT).
- **Consumer**: garage-web + garage-mobile panel "Phân bổ Bảo hiểm" + "Cân thanh toán" (qua BUG-W02-075). Phiếu BH không đổi. Phiếu KH baseline không BH → không vào nhánh.

## Verification Checklist

- [x] Override mở rộng cho phiếu KH landed; BFF `npm run typecheck` + `npm run build` PASS.
- [x] `npm run test:insurance-mapper` green.
- [x] gf-accounting KHÔNG đụng (reverse persisted field qua BUG-W02-052 chung).
- [ ] REVIEW_GROUP approved (pending).

## Cross-Reference

- BUG-W02-075 (cùng phiếu — tiền KH dùng Khấu hao đã fix tại đây; cùng nhánh resolver).
- BUG-W02-052 (reverse persisted field chung; override `so.depreciation` cho phiếu KH).
- BR-EP-INSURANCE-SETTLEMENT §7.1 dòng 350+356 (base = Cộng sau VAT theo bên thanh toán) + CALC-INS-003 + CALC-INS-005.
- BFF: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.resolver.ts` + `insurance.mapper.ts`.
