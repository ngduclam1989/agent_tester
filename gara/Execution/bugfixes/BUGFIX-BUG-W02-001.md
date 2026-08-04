# BUGFIX BUG-W02-001 — SDL phantom field `negativeInsuranceWarn` on SettlementByCodeData

> **Bug L1 status (per `Tracking/WAVE02/BUGS.md`)**: `RESOLVED`.
> **Authored by**: subagent agent-fix-agg-garage-graph (W02, 2026-06-18).
> **Scope**: BFF SDL gap — additive field. NO breaking change. NO cross-boundary edit.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W02-001 (P1, OPEN → RESOLVED) |
| Symptom | Apollo phantom-field reject `getSettlementByCode` when mobile/web client selects `data.negativeInsuranceWarn` on `SettlementByCodeData`. SDL declares the field only on `ServiceOrderDetailV3Data` (Surface A) — `SettlementByCodeData` (Surface B) returns the value via the BFF mapper but does not declare it, so the GraphQL validator rejects the query before resolution. |
| Category | P1 contract drift — SDL behind mapper output |
| Reporter | agent-review-garage-mobile (REVIEW finding) |
| Spec | FEAT-INS-STL-CREATE AC-6 / CR-20260612-02 BR-INS-SO-ADJ-010 / CR-20260618-01 BR-INS-STL-CRE-009 |

## 2. Root-cause Why-chain

### Why #1 — Why does the mobile query select `negativeInsuranceWarn` on `SettlementByCodeData`?

CR-20260612-02 / BR-INS-SO-ADJ-010 define `negativeInsuranceWarn` as the FE/mobile signal to render popup ERR-INS-003 ("Hoàn thành phiếu dịch vụ" warn-and-allow). The flag is the third member of the W02 Phase A "wave flags" trio alongside `soHasInsurance` + `customerStillHasInsuranceAllocation`. All three should be co-present at both surfaces because both the Service Order detail screen and the Settlement detail screen render the same warning popup.

### Why #2 — Why does the BFF mapper already compute it for the Settlement surface?

`bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts:786-815` (`deriveWaveFlags`) emits ALL three flags from a single source — the function returns `{ soHasInsurance, customerStillHasInsuranceAllocation, negativeInsuranceWarn }`. Line 803-806 computes `negativeInsuranceWarn = (insurancePayment < 0)` and line 813 attaches it to the output bag.

`settlements.resolver.ts:201-217` (`getSettlementByCode` post-process) calls `deriveWaveFlags` and runs `Object.assign(settlementData, waveFlags)` — so the field is **already on the JSON response** at runtime.

### Why #3 — Why does the SDL only declare 2 of the 3 flags on `SettlementByCodeData`?

The SDL was updated in an earlier CR (CR-20260618-01) to add `soHasInsurance` + `customerStillHasInsuranceAllocation`. The third flag (`negativeInsuranceWarn`, CR-20260612-02) landed at the same time on Surface A (`service-orders-v3.schema.ts:709`) but the symmetric addition on Surface B was missed. The mapper change shipped, the SDL change did not — classic contract-vs-implementation drift.

### Root cause

SDL gap: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts:272-278` declared only 2 wave flags on `SettlementByCodeData` although the runtime mapper outputs 3. Mobile client query is correct against the design intent; SDL must catch up.

## 3. Fix

**File**: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts`

Add field `negativeInsuranceWarn: Boolean` to `SettlementByCodeData` immediately after `customerStillHasInsuranceAllocation`. Update the W02 Phase A comment block to say "3 cờ" instead of "2 cờ" and cite CR-20260612-02 + BR-INS-SO-ADJ-010 alongside the existing references.

```graphql
# W02 Phase A: 3 co BFF dung chung tren chi tiet phieu QT (additive) —
# CR-20260618-01 + CR-20260612-02 + BR-INS-STL-CRE-009 + BR-INS-STL-DET-009 +
# BR-INS-SO-ADJ-010 + PRINT-INS-007.
soHasInsurance: Boolean
customerStillHasInsuranceAllocation: Boolean
negativeInsuranceWarn: Boolean
```

### Why this fix (not the alternative)?

The briefing flagged a decision point: should the BFF SDL add the field, or should mobile remove the field from its query? The fix adds the field because:

1. **BR-INS-SO-ADJ-010 documents a settlement-level use case** — the popup ERR-INS-003 applies wherever insurancePayment is rendered, including the Settlement detail screen.
2. **The BFF mapper already computes the value for this surface** (insurance.mapper.ts:803) — the runtime contract emits the field; removing the mobile selection would force the mapper output to be discarded as an undocumented extra, which violates SDL-output consistency.
3. **Additive change is non-breaking** — existing clients that do NOT select the field are unaffected; symmetric with Surface A (`ServiceOrderDetailV3Data.negativeInsuranceWarn`).
4. **Symmetric trio at both surfaces** — `deriveWaveFlags` is a single source of truth that emits the trio; the SDL should mirror that surface, not split it.

## 4. Blast radius

| Area | Change | Risk |
|---|---|---|
| SDL `SettlementByCodeData` | Additive field (`Boolean`, nullable). | None for existing consumers. New field opt-in via selection. |
| Resolver `getSettlementByCode` | NO CHANGE — already mutates settlementData with waveFlags. | None. |
| Mapper `deriveWaveFlags` | NO CHANGE — was already correct. | None. |
| Mobile `garage-mobile` | Existing query now validates against SDL. | Resolves phantom-field rejection (was breaking; now green). |
| Web `garage-web` | Free to select the field once they need it. | None. |
| gf-accounting / gf-sales | NO CHANGE. | None. |

Cross-boundary: NONE. Contract change: additive only.

## 5. Regression test

Extended `bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts` with two new validations (Step 7, g):

- `Surface A`: query asserts `getServiceOrderByCode { data { negativeInsuranceWarn } }` is accepted (guards CR-20260612-02 / BR-INS-SO-ADJ-010 base case).
- `Surface B`: query asserts `getSettlementByCode { data { soHasInsurance, customerStillHasInsuranceAllocation, negativeInsuranceWarn } }` is accepted — locks the BUG-W02-001 SDL drift closed; future drop of `negativeInsuranceWarn` will fail the regression.

Run: `npm run test:insurance-contract`. New assertions:

```
PASS: SDL accepts `negativeInsuranceWarn` on Surface A ServiceOrderDetailV3Data (CR-20260612-02 / BR-INS-SO-ADJ-010).
PASS: SDL accepts `negativeInsuranceWarn` on Surface B SettlementByCodeData (BUG-W02-001 SDL drift closed).
```

## 6. Build / lint / test status

| Gate | Result |
|---|---|
| `npm run build` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` (3 changed files) | PASS (no new lint errors) |
| `npm run test:insurance-contract` | PASS — all assertions including new Surface A/B guards |
| `npm run test:insurance-mapper` | PASS (no regression) |

## 7. Files changed

- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/settlements.schema.ts` (+1 SDL field, +5 comment lines)
- `bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts` (+regression suite Step 7g)
- `Tracking/WAVE02/BUGS.md` (status OPEN → RESOLVED + `[FIXED ...]` note)

## 8. Mobile-side cross-reference (agent-fix-garage-mobile, 2026-06-18)

The mobile-side query at `mobile/gf-garage-app/lib/core/services/graphql/documents/settlement_document.dart:199` selects `negativeInsuranceWarn` on `SettlementByCodeData`. Once the BFF SDL fix (above) shipped, the mobile query is contract-valid — **no Dart code change required**.

To prevent future drift in either direction (mobile query removing the flag, or SDL re-dropping it), `agent-fix-garage-mobile` added a static regression test on the mobile side:

- `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_001_settlement_query_contract_test.dart` — pins the 3 wave-flag selections (`soHasInsurance`, `customerStillHasInsuranceAllocation`, `negativeInsuranceWarn`) in `SettlementDocument.getSettlementByCode` and the operation declaration shape.

If a future regression removes any flag from the mobile query, the test fails immediately (no Flutter toolchain required — pure Dart string assertion).
