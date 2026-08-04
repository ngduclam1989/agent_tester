# BUGFIX BUG-W01-267 — Per-row depreciation persists Create / Edit / Detail

> **Status**: RESOLVED (FE) + ESCALATION raised on BFF gap.
> **Severity**: P1
> **Authored by**: agent-fix-garage-web (Wave 01, follow-up FIX cycle).
> **Related**: BUG-W01-254 (column editable — RESOLVED), BUG-W01-261/262 (BFF + gf-sales per-part contract — out of FE scope), BUG-W01-237 (gf-sales BE persist NULL — separate OPEN row).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-267 (P1) — FEAT-INS-SO-ADJUSTMENT / AC-5, BR-INS-SO-ADJ-005, AC-14 |
| Symptom | On SO Create / Edit / Detail the "Khấu hao VT" column was supposed to carry the per-part depreciation % end-to-end. User report: payload sent on save did not surface the value (Create), the cell came back empty after reload (Edit), and the read-only screen rendered "0%" / "—" (Detail). |
| Reporter | QC-Manual (2026-06-12) |

## 2. Hypotheses examined (per scope prompt)

1. **Write mapper strips `depreciationPercent`** — checked `formatServiceOrderFormData` in `service-order/helper/index.ts`. The mapper already emits `depreciationPercent: part.depreciationPercent ?? null` (lines 204 + 320 for retail). No leak.
2. **Edit `defaultValues` mapper drops the field** — checked `service-order/components/edit/index.tsx`. The parts mapper at line 171 hydrates `depreciationPercent: part.depreciationPercent ?? null` from the GraphQL response. No leak.
3. **GraphQL read query doesn't select the field** — checked `use-service-order-detail.ts`. The selection set includes `depreciationPercent` on `parts` (line 117). No leak.
4. **Detail read-only renderer doesn't render the field** — checked `service-order/components/detail/parts-used.tsx`. The conditional `Khấu hao` column renders `{row.original.depreciationPercent ?? 0}%` when `hasInsurance` is true (lines 134-149). No leak.
5. **Interfaces strip the field at TS layer** — checked `service-order/interfaces/index.ts`. Both `ServiceOrderPart` (line 155) and `IServiceOrderDetailPart` (line 249) declare `depreciationPercent?: number | null`. No leak.

## 3. Root cause (FE-side findings)

The FE write/read pipeline is correctly wired end-to-end for Edit and Detail.
Two genuine FE-side defects remained from the BUG-W01-261/262 contract refactor:

### 3.1 WRITE helper still emitting removed `depreciationByLine` key

`buildInsuranceAllocationRequest` in `insurance-allocation/helper/index.ts` still
declared `depreciationByLine` on `IInsuranceAllocationRequestInput` and emitted
it on the output (as `undefined` when no lines, or as a `[{lineId, percent}]`
array when "Áp dụng tất cả" cascaded). After BUG-W01-261/262 the BFF SDL
`UpdateServiceOrderV3Input` explicitly REJECTS that field (per-row depreciation
travels on `parts[i].depreciationPercent` on the same payload — see
`bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/insurance-adjustment.contract.regression.ts:253`).
The stale key in the FE payload would silently fail the whole mutation when the
gateway shipped a stricter validator, and the dangling type forced regression
tests on `buildServiceOrderEditPayload` to fail.

### 3.2 Stale regression test pinning the removed builder

`depreciation-material-column.test.ts` (legacy BUG-W01-254 suite) still asserted
that `service-order/components/form/index.tsx` contained the `values.parts` /
`part?.depreciationPercent` builder that the BUG-W01-261 refactor deleted. Two
test suites — this one and the new `depreciation-persist.test.ts` BUG-W01-267
suite — held mutually exclusive expectations; the legacy one was wrong post-
refactor and was masking the real regression target.

## 4. Out-of-scope finding (escalated)

`bffs/agg-garage-graph/src/graphql/modules/gf-sales/service-orders-v3/service-orders-v3.schema.ts`
declares the **CREATE input** as:

```graphql
input ServiceOrderPartV3Input {
  partId: Int
  …
  payer: String
}                       # ← NO depreciationPercent
```

The **UPDATE input** has it (line 321) but the CREATE input does not. So when a
user creates an SO with `hasInsurance=true` + populates the "Khấu hao VT"
column, the GraphQL gateway strips `parts[i].depreciationPercent` from the
payload before forwarding it to `gf-sales` — the FE has nothing it can do
about that. This is the actual root cause of the Create-side symptom and
belongs to `agent-fix-agg-garage-graph`. ESCALATED on the JSON return.

## 5. Fix summary (FE-side)

1. **Helper** (`insurance-allocation/helper/index.ts`) — drop the
   `depreciationByLine` parameter, the unused `IDepreciationLineSource` interface,
   and the field on the returned object. Build only the 5 fields the BFF accepts
   (`discountMaterial`, `discountLabor`, `claimReduction`, `depreciationDefault`,
   `insuranceDeductible`) and filter out `undefined` keys via `Object.entries`
   so the payload no longer carries dangling property names.

2. **Public types** (`insurance-allocation/interfaces/index.ts` +
   `insurance-allocation/index.ts`) — remove `IInsuranceDepreciationLineRequest`
   and the field on `IInsuranceAllocationRequestInput`. Per-row depreciation
   now travels solely on `parts[i].depreciationPercent` (already wired in the
   SO write mapper).

3. **Regression test alignment** (`depreciation-material-column.test.ts`) —
   replace the assertion against the deleted form-side `depreciationByLine`
   builder with a guard that the source NO LONGER contains
   `values.partsDepreciation` or `depreciationByLine`. Test name aligned to
   the column rename + editable contract; legacy BUG-W01-254 prose dropped.

4. **Companion test update** (`build-allocation-request.test.ts`) — adjust the
   legacy-flat-shape case to drop the per-line argument and assert that
   `request` has NO `depreciationByLine` property.

5. **Comment hygiene** (`insurance-allocation/components/total-service-price-panel.tsx`)
   — drop the `BR-INS-SO-ADJ-002/003` design-artifact reference from the docblock
   and the inline `BA-chốt rule` marker on the empty-slot fallback, per
   `.claude/rules/code-comment-rules.md` Forbidden #6 (Design-artifact coupling).

## 6. Files touched

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/insurance-allocation/helper/index.ts` | Drop `depreciationByLine` param + key, drop unused `IDepreciationLineSource` & `IInsuranceDepreciationLineRequest` imports, switch payload filter to `Object.entries` so undefined keys vanish. |
| `frontend/gf-gms-web/src/features/insurance-allocation/interfaces/index.ts` | Remove `IInsuranceDepreciationLineRequest` interface and `depreciationByLine` field on `IInsuranceAllocationRequestInput`. |
| `frontend/gf-gms-web/src/features/insurance-allocation/index.ts` | Drop the `IInsuranceDepreciationLineRequest` re-export. |
| `frontend/gf-gms-web/src/features/insurance-allocation/components/total-service-price-panel.tsx` | Strip 2 inline comment violations (BR-INS-SO-ADJ-002/003 ref, BA-chốt marker). |
| `frontend/gf-gms-web/src/features/insurance-allocation/helper/build-allocation-request.test.ts` | Drop the per-line argument from the legacy-flat-shape case; flip assertion to `not.toHaveProperty("depreciationByLine")`. |
| `frontend/gf-gms-web/src/features/service-order/components/form/depreciation-material-column.test.ts` | Rewrite third test to assert form/index.tsx no longer references `partsDepreciation` / `depreciationByLine`. |

## 7. Regression coverage

| Test file | Assertion |
|---|---|
| `service-order/components/form/depreciation-persist.test.ts` | Pre-existing BUG-W01-267 source-level pins on write mapper (`parts[i].depreciationPercent`) + Edit defaultValues mapper. PASS. |
| `service-order/components/form/depreciation-material-column.test.ts` | Header rename + editable cell binding + no legacy builder reappears. PASS. |
| `service-order/components/edit/build-service-order-edit-payload.test.ts` | Single consolidated payload, no `depreciationByLine`. PASS. |
| `insurance-allocation/helper/build-allocation-request.test.ts` | 5-field nested/legacy dual-shape unwrap, no `depreciationByLine` in output. PASS. |

Full suite: **18 files / 81 tests PASS** (`yarn test --run`).

## 8. Verification

```bash
cd frontend/gf-gms-web
yarn test --run          # 81/81 PASS
yarn build               # tsc -b && vite build → exit 0
```

`yarn lint` baseline is dirty (pre-existing errors in unrelated files); no new
lint issues introduced on the files touched.

## 9. Residual / Follow-ups

- **ESCALATION**: `ServiceOrderPartV3Input` (Create input) on
  `bffs/agg-garage-graph` missing `depreciationPercent: Float`. Without this,
  SO Create with insurance cannot persist per-row depreciation no matter what
  the FE sends. `agent-fix-agg-garage-graph` to mirror the field from
  `UpdateServiceOrderPartV3Input` (line 321) onto the Create input — additive,
  passthrough.
- BUG-W01-237 (BE persist NULL on gf-sales) is a separate OPEN row and is not
  fixed here. Once the BFF gap above closes, retest BUG-W01-237 to confirm
  whether gf-sales accepts and persists the new value.
- `InsuranceAdjustmentInput.depreciationByLine` on the RHF/zod side is preserved
  intentionally — it remains the internal "Áp dụng tất cả" buffer wired to
  `<AdjustmentFields>` and `<InsuranceAllocationSection>`. The cleanup here is
  scoped to the WRITE boundary so no UI affordance regresses.

## 10. Status

OPEN → RESOLVED (FE). Escalation tracked in §9 + JSON return.
