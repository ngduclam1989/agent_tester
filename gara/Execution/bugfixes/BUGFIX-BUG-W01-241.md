# BUGFIX BUG-W01-241 — JS minified "i" pageerror on /settlement-voucher list

> **Status**: VERIFIED (iteration 2 — VERIFIED FAILED live; iteration 3 ESCALATED).
> **Authored by**: agent-fix-garage-web.
> **Related**: BUG-W01-240 (RESOLVED — eliminated cascade hypothesis A).

---

## 1. Failure mode

`page.on('pageerror', …)` captures `["i"]` on `/settlement-voucher` list page
load on every run. Error does not block render but is an unhandled JS
exception in production-minified bundle.

## 2. Iteration history

### Iteration 1 — ESCALATED (2026-06-11)

Three hypotheses: (A) cascade from BUG-W01-240; (B) orphan
`useInsuranceFilterOptions()` invocation; (C) generic unhandled rejection.
Production build has no stack — escalated under Trigger #6.

### Iteration 2 — Fix attempt (2026-06-11)

Removed the orphan hook (import + invocation) from the list component. Added
source-level regression `orphan-insurance-filter.test.ts`. Local verification
passed. VERIFY_PENDING for live re-test.

### Iteration 2 verdict (2026-06-12)

Live re-test: `pageerror ["i"]` still fires after image rebuild (testid
backfill confirmed in deployed bundle). Hypothesis B did not cover the real
source. **REOPENED**.

### Iteration 3 — ESCALATED (this run, 2026-06-12)

No new structurally-suspect surface inside the list component after the v2
fix. The minified single-character symbol "i" gives zero stack signal. With
read-only access to source + dist bundle (no live debugger), no fresh
hypothesis reaches the `high`-confidence Clarification Gate required by the
agent definition.

**Trigger #6 (Root cause unclear after Phase 1)** — escalating without
applying a third speculative patch.

## 3. What is needed to unblock

1. Temporary source-map build deploy OR
2. Add a smoke-test instrumentation pass that registers
   `window.onerror` / `window.onunhandledrejection` to capture stack + line +
   error class for "i" before any productionised obfuscation.
3. Once stack is captured, re-spawn `agent-fix-garage-web` with the captured
   trace as Iteration 3 hypothesis seed.

## 4. Files reviewed (read-only)

- `frontend/gf-gms-web/src/features/settlement-voucher/components/list/index.tsx`
- `frontend/gf-gms-web/src/features/settlement-voucher/hooks/use-search-settlements.ts`
- `frontend/gf-gms-web/src/features/settlement-voucher/hooks/use-settlement-list.ts`
- `frontend/gf-gms-web/src/features/settlement-voucher/store/index.ts`
- `frontend/gf-gms-web/src/features/settlement-voucher/constants/index.ts`
- `frontend/gf-gms-web/src/router.ts`
- `frontend/gf-gms-web/src/hooks/use-query.ts`

No additional structural anomaly identified in any of the above.

## 5. Status

REOPENED → ESCALATED (Trigger #6).
