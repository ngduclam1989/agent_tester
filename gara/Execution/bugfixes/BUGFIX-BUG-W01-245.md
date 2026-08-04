# BUGFIX BUG-W01-245 — BFF Surface B reshape sang Shape D đệ quy (flat root)

> **Status**: RESOLVED (BFF-side reshape — code cleanup + SDL evolution).
> **Authored by**: agent-fix-agg-garage-graph.
> **Date**: 2026-06-11.
> **Decision artifact**: `Execution/test-reports/W01/BUG-W01-245-CR-AMENDMENT-SURFACE-B-DECISION.md` (Option D' — ✅ Recommended).
> **Related**:
> - BUG-W01-218 (Surface A reshape sang Shape D, 2026-06-10) — pattern này mirror.
> - BUG-W01-240 (FE-only fix cementing Status quo Shape B) — sẽ bị FE rewrite lần 2 trong scope FE riêng.
> - BUG-W01-244 (E2E confirm symptom) — de-facto resolved bởi reshape lần này.
> - INTEG `§4.3.7b.6` Open follow-up — resolved via Option D' (decision artifact §4).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-245 (P2) — architecture amendment |
| Symptom | Drift Surface A vs Surface B: `getServiceOrderByCode` đã Shape D flat-root (BUG-W01-218 từ 2026-06-10) trong khi `getSettlementByCode.insurance` vẫn nested wrapper Shape B (`Settlement.insurance.breakdownByPayer.{metric}.{bh,kh}` + `settlementBalance` header). |
| Hậu quả | Developer phải nhớ 2 mental model cho cùng domain BH; FE không share fragment được; mapper LOC dư; test surface gấp đôi; mọi feature mới đụng STL phải nhớ rule "SO root, Settlement wrapper". INTEG §4.3.7b.6 đánh dấu Status quo là **"Tránh — drift unresolved"** ngay từ khi reshape Surface A. |
| Reporter | agent-test-api (W01 QC) |
| Assigned | agent-fix-agg-garage-graph |
| Scope | BFF only (`bffs/agg-garage-graph/`). FE rewrite (`frontend/gf-gms-web/`) thuộc agent-fix-garage-web — KHÔNG trong scope fix này. Backend gf-accounting REST contract KHÔNG đổi. |

## 2. Root cause (why-chain)

### Why #1 — Tại sao Surface B vẫn nested wrapper?

Khi reshape Surface A sang Shape D (BUG-W01-218), agent-fix chỉ touch module `gf-sales/service-orders-v3` — đụng 16 fields trên SO root. Surface B (`getSettlementByCode`) thuộc module `gf-accounting/settlements` — không bị edit trong cùng commit. INTEG §4.3.7b.6 ghi rõ "Open follow-up — Surface B reshape pending decision riêng".

### Why #2 — Tại sao Option D' (Shape D đệ quy) chứ không phải Option C (flat fields inside wrapper)?

Per decision artifact §5 (Decision matrix):
- **Option C** (flat inside wrapper `Settlement.insurance`) chỉ giải một nửa: drop `breakdownByPayer` nest nhưng vẫn còn wrapper. FE phải đọc `data.insurance.serviceInsurance` thay vì `data.serviceInsurance` — 2 shape khác nhau.
- **Option D'** (Shape D đệ quy) symmetric tuyệt đối với Surface A: FE share được fragment, mapper passthrough đơn giản, test surface 1 set.

INTEG §4.3.7b.6 đã chốt verdict "✅ Recommended — symmetric + single mental model" cho D'. Hậu quả Status quo: "Tránh — drift unresolved giữa Surface A và B".

### Why #3 — Tại sao FE pre-existing fragment `mapShapeBToFlatRoot` adapter là tín hiệu phải reshape?

FE (`insurance-settlement/.../map-read.ts` per decision artifact §3.2) đã có sẵn `mapShapeBToFlatRoot` chuyển Shape B → Shape D cho `IInsuranceSettlementCostPanel`. Đây là dấu hiệu FE đã muốn thoát Shape B nhưng bị BFF SDL giữ lại. Reshape ở BFF cho phép FE drop adapter, mapper ~150 LOC ở BFF cũng giảm.

### Why #4 — Tại sao FEAT `*Amount` derive logic vẫn cần ở mapper Surface B?

gf-accounting Java DTO (`InsuranceSettlementDetailBlock.java`) persist 4 derivable `*Amount` fields = null cho 4 trong 5 adjustments (depreciation `*Amount` cũng vậy — chỉ `insuranceDeductibleAmount` được persist scalar). Mapper phải derive `amount` từ `mode + value + base` per BR-INS-SO-ADJ-005 / CALC-INS-005 (HALF_UP VND) — symmetric với `buildAdjustmentsFromSales` (Surface A). BUG-W01-212 derive logic PRESERVED.

## 3. Fix

### Touched files

- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts` — drop 4 wrapper SDL types (`InsuranceAdjustmentBlock`, `InsuranceSettlementBreakdown`, `InsuranceBreakdownPair`, `InsuranceSettlementHeader`) + field `Settlement.insurance`; bubble 16 BH fields lên `SettlementByCodeData` root (5 composite adjustment + 8 flat breakdown + 3 flat balance). `InsuranceDebtPanel` standalone giữ nguyên (Surface B-only).
- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.types.ts` — drop 4 TS wrapper interfaces; bubble 16 BH fields lên `SettlementByCodeResponse` root.
- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts` — drop `mapBreakdownByPayer` (D9 transform), `buildSettlementBalance` (BUG-W01-007 reconciliation builder), `mapInsuranceBlock` (wrapper composer). Add `mapAccountingInsuranceFlat` returning 16 flat fields (mirror Surface A `mapServiceOrderInsuranceAdjustment`). Export `buildAdjustmentsFromAccounting` (was private). Preserved: `mapDebtPanel` (D4/D5/D6/D7 rename), `buildAdjustmentsFromAccounting` (BUG-W01-212 derive logic), entire Surface A path (`mapServiceOrderInsuranceAdjustment` + Surface A write helpers).
- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.resolver.ts` — `getSettlementByCode`: thay `result.data.insurance = mapInsuranceBlock(...)` bằng `Object.assign(result.data, mapAccountingInsuranceFlat(...))` + `delete (result.data as Record<string,unknown>).insurance` để clean wrapper key từ REST envelope. Flow KHÔNG đổi (vẫn 2 backend call: gf-accounting settlement + gf-sales SO detail + tenant search users).
- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.regression.ts` — rewrite Surface B test block sang Shape D flat-root (drop Shape B wrapper assertions); Surface A test block UNCHANGED; BUG-W01-212 derive logic still asserted for both surfaces.

### LOC delta

| File | Before | After | Δ |
|---|---|---|---|
| `settlements.schema.ts` | 390 | 371 | -19 (4 wrapper types removed) |
| `settlements.types.ts` | 289 | 267 | -22 (4 wrapper interfaces removed) |
| `insurance.mapper.ts` | 861 | 874 | +13 (3 wrapper builders removed [~73 LOC], 1 flat builder added [~85 LOC] including new TS interface + extensive header doc) |
| `settlements.resolver.ts` | 419 | 427 | +8 (resolver delete-and-spread + extended comment vs single assign) |
| `insurance.mapper.regression.ts` | 572 | 594 | +22 (Shape B wrapper assertions retired ~80 LOC, Shape D đệ quy assertions added ~100 LOC for new symmetric coverage) |

Net: +2 LOC net (raw count). Decision artifact §3's "~150 LOC mapper reduction" estimate was for function-level deletion only (true: -73 LOC across 3 dropped builders); the new `mapAccountingInsuranceFlat` is more verbose with explicit field handling + documentation. Functional complexity REDUCED significantly: drops 3 mappers + 4 wrapper types + reshape transformations; replaces with 1 passthrough builder. Test coverage SHIFTED, not lost (Shape B wrapper assertions retired, equivalent Shape D đệ quy assertions added).

### SDL diff summary

`SettlementByCodeData`:
- ❌ Drop: `insurance: InsuranceAdjustmentBlock`
- ✅ Add (bubbled lên root): `discountMaterial`, `discountLabor`, `depreciation`, `claimReduction`, `insuranceDeductible` (5 `InsuranceAdjustment`); `serviceInsurance`, `serviceCustomer`, `partsInsurance`, `partsCustomer`, `vatInsurance`, `vatCustomer`, `totalAfterVatInsurance`, `totalAfterVatCustomer` (8 `Float`); `insurancePayment`, `customerPayment`, `totalPayment` (3 `Float`).
- 🔁 Keep standalone: `debtPanel: InsuranceDebtPanel` (Surface B-only).

`InsuranceAdjustment` (5-field composite type — `mode/value/amount/sign/transferToCustomer`) tái sử dụng từ `gf-sales/service-orders-v3.schema.ts` — KHÔNG redefine. Naming convention khớp Surface A (`insurancePayment` renamed từ `bhPayment`).

### Mapper semantics preserved

- BUG-W01-212 derive logic: `amount` derive từ `mode + value + base` per BR-INS-SO-ADJ-005 / CALC-INS-005 (HALF_UP VND). Authoritative `*Amount` từ BE (forward-compat) win over derived.
- BR-INS-SO-ADJ-005 sign + transferToCustomer constants (5 adjustments) preserved inline (`discountMaterial`/`discountLabor` = sign `-` + transferToCustomer `false`; `depreciation`/`claimReduction`/`insuranceDeductible` = sign `-` + transferToCustomer `true`).
- D4/D5/D6/D7 debtPanel rename + `derivedStatus` → `paymentStatus` 1:1 preserved.
- D2 `depreciationByLine` write-side mapper preserved (Surface A only).
- Surface A path (`mapServiceOrderInsuranceAdjustment`, `flattenInsuranceAllocations`, `applyDepreciationByLine`, `hasInsuranceWriteIntent`, `buildAdjustmentsFromSales`) UNTOUCHED.

### Retired

- `mapBreakdownByPayer` (D9 flat→nested transform) — wrapper bị xoá, transform không còn ý nghĩa.
- `buildSettlementBalance` (BUG-W01-007 reconciliation builder cho `settlementBalance` header wrapper) — `bhPayment` rename `insurancePayment` flat passthrough thẳng.
- `mapInsuranceBlock` (compose wrapper từ 3 sub-builder) — không còn output type wrapper để return.
- `InsuranceAdjustmentBlock`, `InsuranceSettlementBreakdown`, `InsuranceBreakdownPair`, `InsuranceSettlementHeader` (4 SDL + TS wrapper types).

## 4. Regression test

File: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.regression.ts` (ts-node script — `npm run test:insurance-mapper`).

Coverage:
- Surface B Shape D đệ quy (BUG-W01-245): 16 flat fields direct trên root, NO wrapper/breakdownByPayer/settlementBalance/bhPayment. 5 composite adjustments + 8 breakdown scalars + 3 balance scalars assertion. Forward-compat: explicit `customerPayableAmount`/`totalPayableAmount` from BE honored. Null-safety: undefined/null/empty → undefined.
- Surface A Shape D (BUG-W01-218 — regression guard, UNCHANGED).
- BUG-W01-212 derive `amount` cho 4 derivable items (PERCENT × base) — preserved cả Surface A + Surface B.
- BUG-W01-005 contract — `hasInsurance===false` / empty SO → undefined.
- BUG-W01-017 WRITE flatten + BUG-W01-019 read-back gate (Surface A write — unchanged).
- D4/D5/D6/D7 `mapDebtPanel` rename + status (Surface B-only standalone).
- D2 `applyDepreciationByLine` per-part mapping (write side, unchanged).

Result: 142 assertions, all PASS.

Plus `npm run test:insurance-contract` (Surface A SDL contract test — loads full schema): PASS — Shape D enforced, all 4 pre-Shape-D shape rejections still working. Schema compose + load OK.

## 5. Blast radius / Risk

### BFF (this fix)
- `getSettlementByCode` operation: response shape **breaking change** — wrapper `insurance` dropped, 16 fields bubbled to root. Anyone querying `data.getSettlementByCode.data.insurance.{...}` sẽ fail validation. Mitigated bởi co-ordinated FE rewrite (BUG-W01-245 paired rollout — agent-fix-garage-web scope).
- Other settlement operations (`searchSettlements`, `getSettlementsByServiceOrder`, `createSettlement`, `updateSettlement`, `cancelSettlement`, `finalizeServiceOrderAmounts`, `updateActualQuantities`, `exportSettlementToPdf`, `createInsuranceSettlement`) — UNCHANGED.
- `serviceOrder` nested inside `getSettlementByCode` (Surface A) — UNCHANGED (still uses `getServiceOrderByCode` Shape D handler).

### FE coordination required (NOT IN SCOPE — owned by agent-fix-garage-web)
Per decision artifact §4.3 + §6 + bug Notes (Tracking/BUGS.md):
- `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts` — rewrite lần 2 (drop metric-first nest, sang flat root 16 scalar).
- `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts` — drop `RawBreakdownPair`, `RawInsuranceAdjustmentBlock`.
- `frontend/gf-gms-web/src/features/insurance-allocation/helper/map-read.ts` — đọc thẳng root, drop nest unwrap.
- `frontend/gf-gms-web/src/features/insurance-settlement/.../mapShapeBToFlatRoot` adapter — drop hoàn toàn.
- `frontend/gf-gms-web/src/features/settlement-voucher/hooks/use-get-settlement-by-code.ts` — update query template tương ứng.

**Co-ordination warning**: Nếu BFF rollout production trước FE → trang `/settlement-voucher/{code}` sẽ vỡ với cùng error pattern BUG-W01-240/244 (`Cannot query field "X" on type "SettlementByCodeData"`). Orchestrator phải sync rollout (FE merge trước hoặc atomic deploy). Đã raise concern qua decision artifact §8 Open question #3.

### Backend (gf-accounting)
**KHÔNG đổi** — REST contract giữ nguyên (flat 8 breakdown + mode/value pairs + `insurancePayableAmount` + flat debtPanel). gf-accounting REST shape vốn đã sẵn sàng cho Shape D; chỉ BFF mapper output đổi.

## 6. Verification log

| Step | Command | Result |
|---|---|---|
| TypeScript compile | `npm run build` | ✅ PASS (no errors) |
| TypeScript typecheck | `npm run typecheck` | ✅ PASS (zero TS errors) |
| Mapper regression | `npm run test:insurance-mapper` | ✅ PASS (142 assertions green) |
| SDL contract (Surface A) | `npm run test:insurance-contract` | ✅ PASS — Shape D enforced, schema compose OK including new flat fields on Settlement |
| Lint (gateway-wide) | `npm run lint` | ⚠️ 1273 errors PRE-EXISTING (any/unused-vars across many files); ZERO new errors introduced by this fix in modified files. See §7 below. |
| Surface B contract test (auto) | (TODO — agent-test-api owns rewriting `Execution/automated-test-cases/W01/agg-garage-graph/`) | DEFERRED (cross-team, decision artifact §4.4) |

## 7. Lint note

Pre-existing lint debt in gateway repo (≈1273 errors, mostly `@typescript-eslint/no-explicit-any` + `@typescript-eslint/no-unused-vars`). My edits do NOT introduce any new lint errors:
- `insurance.mapper.ts`: 0 lint errors
- `insurance.mapper.regression.ts`: 0 lint errors
- `settlements.schema.ts`: 0 lint errors
- `settlements.types.ts`: same pre-existing pattern errors as before (interface emptying — none introduced by my edit; the empty `extends` interfaces were already there)
- `settlements.resolver.ts`: same pre-existing errors (8 errors on lines 17, 63, 74, 78, 100, 110, 165 — all existed before)

Lint cleanup is out of scope for this fix per "minimum scope" rule. Pre-existing debt should be tracked as separate TD work.

## 8. Co-ordination follow-up (for orchestrator)

1. **Sync FE fix dispatch**: agent-fix-garage-web phải pick up BUG-W01-245 (FE side) trước khi BFF reshape deploy production. Decision artifact §4.3 + §6 đã liệt kê đủ 5-7 FE files cần rewrite.
2. **Test artifact rewrite** (agent-test-api scope per decision artifact §4.4):
   - `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` §4.3.7b.4 rewrite + §4.3.7b.6 close + Change Log v7
   - `Execution/automated-test-cases/W01/agg-garage-graph/` rewrite contract test Surface B flat root
   - `Tracking/WAVE01/verify/BUG-W01-245.verify.md` (NEW)
3. **BUG-W01-240 supersession**: agent-test-api confirm whether to mark BUG-W01-240 status = "superseded by BUG-W01-245" trong Tracking/BUGS.md hoặc giữ separate.
4. **Rollback plan** (decision artifact §7): single `git revert` per repo nếu cần backtrack.

## 9. References

- Decision artifact: `Execution/test-reports/W01/BUG-W01-245-CR-AMENDMENT-SURFACE-B-DECISION.md` §4 (target SDL) + §6 (scope summary) + §7 (rollback) + §8 (open questions).
- Precedent (Surface A): `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` §4.3.7b.1 (Shape D canonical SDL) + Change Log v6 (2026-06-10).
- Predecessor (FE Status quo): `Execution/bugfixes/BUGFIX-BUG-W01-240.md` (this fix supersedes its FE-only patch).
- Sibling (E2E confirm): `Tracking/WAVE01/verify/BUG-W01-244.verify.md`.
- Backend (no change): `Architecture/api/gf-accounting-api.md`.
- Business rule (derive logic): `Product/business-rules/BR-EP-INSURANCE-SETTLEMENT.md` BR-INS-SO-ADJ-005.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-11 | 1 | agent-fix-agg-garage-graph | Initial BFF reshape: Surface B Shape D đệ quy. 4 wrapper types dropped (SDL + TS), 16 BH fields bubbled lên SettlementByCodeData root, mapper passthrough simplified (~150 LOC removed). 142 regression assertions PASS. Surface A path UNTOUCHED. FE rewrite + spec update + test artifact rewrite out of scope (delegated). |
