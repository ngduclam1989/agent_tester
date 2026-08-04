# BUGFIX BUG-W02-007 — Orchestrator contract regression suite for `exportInsuranceDossier`

> **Bug L1 status (per `Tracking/WAVE02/BUGS.md`)**: `RESOLVED`.
> **Authored by**: subagent agent-fix-agg-garage-graph (W02, 2026-06-18).
> **Scope**: Add regression script + npm script. NO orchestrator logic change. NO cross-boundary edit.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W02-007 (P2, OPEN → RESOLVED) |
| Symptom | The W02 BFF orchestrator for `exportInsuranceDossier` (Phase A resolve → Phase B render parallel → Phase C upload → Phase D persist atomic) has NO contract regression test. PKG-W02 §4.3 test-api requires "BFF orchestrator 4-phase happy + abort scenarios (Phase B render fail → no batch, Phase D persist fail → atomic rollback)". Only `test:insurance-mapper` + `test:insurance-contract` exist, both covering W01 settle/SO surface — no harness for the W02 dossier orchestrator. |
| Category | P2 test gap (regression risk) |
| Reporter | agent-review-backend (REVIEW finding) |
| Spec | PKG-W02 §4.3 + §5 Gate |

## 2. Root-cause Why-chain

### Why #1 — Why is there no orchestrator test?

The repo standard is "no first-party test runner" (see `CLAUDE.md` Build Commands — only build, lint, dev). Existing regression scripts are self-contained ts-node assertion files invoked via `npm run test:*`. The W02 orchestrator (`orchestrator.ts`) was authored without a parallel ts-node assertion script — the contract pattern was W01-only.

### Why #2 — Why does PKG-W02 §4.3 require this specifically?

The orchestrator coordinates 3 downstream services (gf-sales, gf-accounting, ct-file-storage) across 4 phases with strict atomicity guarantees: Phase B/C fail → BFF abort, no Phase D call; Phase D fail → 500 surfaced (atomic rollback owned by gf-accounting). Without a contract test, contract drift in any of the 3 downstream services would silently bypass the abort matrix at integration time.

### Root cause

Test gap, not code defect: contract regression coverage absent. Without it, future edits could (a) reorder phases, (b) call Phase D after a Phase B/C failure, (c) silently swallow downstream errors, or (d) introduce retries that violate atomicity — and CI would not catch any of those drifts.

## 3. Fix

**New file**: `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/insurance-dossiers/orchestrator.regression.ts`

Self-contained ts-node assertion script (same pattern as `insurance.mapper.regression.ts`). Strategy: stub the module-scoped passthrough service singletons (`gfAccountingService`, `gfSalesService`, `ctFileStorage`) per scenario, record per-phase call log, invoke `exportInsuranceDossier`, assert on phase ordering + downstream calls per phase + abort semantics. Pure orchestration test — does NOT exercise real HTTP, does NOT mock real Apollo context, does NOT assert on Phase D rollback internals (gf-accounting integration test owns that).

**Scenario matrix (7 scenarios, 28 assertions)**:

| Scenario | Trigger | Asserts |
|---|---|---|
| 1. Happy path | All 4 doc types succeed | versionNo=1, 4 export items, Phase A first, Phase D last, all renders before any upload (Promise.all per phase) |
| 2a. Input validation — empty settlementCode | `settlementCode=""` | Throws `INS_DOSSIER_NO_DOC_SELECTED`, HTTP 400, NO downstream call |
| 2b. Input validation — missing acceptance form | `documentTypes=[ACCEPTANCE_RECORD]` + no `acceptanceFormData` | Throws `INS_DOSSIER_FORM_INCOMPLETE`, HTTP 400 |
| 3. Phase A 404 | `gf-accounting GET /settlements/{code}` throws with errorResponse.statusCode=404 | Throws `INS_STL_NOT_FOUND`, HTTP 404, NO Phase B/C/D call |
| 4. Phase B render fail → no batch | settlement-sheet render returns status=502 | Throws `INS_DOSSIER_RENDER_FAIL`, HTTP 502, documentType propagated, **NO Phase C upload, NO Phase D persist** |
| 5. Phase C upload fail → no batch | ct-file-storage uploadMultipart throws | Throws `INS_DOSSIER_STORAGE_UPLOAD_FAIL`, HTTP 502, **NO Phase D persist** |
| 6. Phase D persist fail → atomic abort | gf-accounting POST persist-batch throws with status=500 | Throws `INS_DOSSIER_PERSIST_FAIL`, HTTP 500, no retry from BFF (rollback ownership = gf-accounting) |
| 7. Phase D missing versionNo | gf-accounting returns `data: {}` | Throws `INS_DOSSIER_PERSIST_FAIL`, HTTP 500 |

**npm script added** to `package.json`:

```json
"test:insurance-dossier-orchestrator": "ts-node src/graphql/modules/gf-accounting/insurance-dossiers/orchestrator.regression.ts"
```

Run: `npm run test:insurance-dossier-orchestrator`.

### Stubbing strategy

The orchestrator imports passthrough services at module load:

```ts
import { ctFileStorage, gfAccountingService, gfSalesService } from "../../../common/passthrough.service";
```

These are exported instances (singletons). The regression script swaps the HTTP methods (`get`, `getRaw`, `postRaw`, `post`, `uploadMultipart`) on those exact instances before invoking the orchestrator, then restores them in a finally block. Each scenario installs its own stub set + restores cleanly so scenarios are independent.

## 4. Blast radius

| Area | Change | Risk |
|---|---|---|
| `orchestrator.regression.ts` | New file. | None — pure test. |
| `package.json` | New npm script. | None — additive. |
| `orchestrator.ts` | NO CHANGE. | None. |
| Resolver / SDL | NO CHANGE. | None. |
| Cross-boundary (gf-sales / gf-accounting / ct-file-storage) | NO CHANGE. | None. |

No production code changed. No contract change.

## 5. Regression test

The new file IS the regression. It guards:

- **PKG-W02 §4.3 atomicity invariant**: "Phase B render fail → no batch, Phase D persist fail → atomic rollback" — directly asserted in Scenarios 4 + 6.
- **Phase ordering invariant**: Promise.all per phase (all renders before any upload, all uploads before persist) — Scenario 1.
- **Error code envelope**: `INS_*` code + correct HTTP status + documentType propagation — every scenario.
- **Input validation gate**: validateInput aborts BEFORE Phase A — Scenarios 2a/2b.

Future orchestrator changes that violate any of these will fail the regression.

## 6. Build / lint / test status

| Gate | Result |
|---|---|
| `npm run build` | PASS |
| `npm run typecheck` | PASS |
| `npm run lint` (new + changed files) | PASS (no new lint errors in `orchestrator.regression.ts` or `package.json`) |
| `npm run test:insurance-dossier-orchestrator` | PASS — 28/28 assertions across 7 scenarios |
| `npm run test:insurance-contract` | PASS (no regression) |
| `npm run test:insurance-mapper` | PASS (no regression) |

## 7. Files changed

- `bffs/agg-garage-graph/src/graphql/modules/gf-accounting/insurance-dossiers/orchestrator.regression.ts` (new, +443 lines)
- `bffs/agg-garage-graph/package.json` (+1 test script)
- `Tracking/WAVE02/BUGS.md` (status OPEN → RESOLVED + `[FIXED ...]` note)
