# BUGFIX BUG-W01-258 — STL Detail purple "Bảo hiểm" — REOPENED v2 fix

> **Status**: RESOLVED (v2 — re-scoped).
> **Severity**: P2 (escalated from P3 — fix regression).
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Supersedes**: prior fix v1 (now reverted).

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-258 (P2) — FEAT-INS-STL-DETAIL / BR-INS-STL-DET-003 |
| Symptom v1 fix | Purple-500 applied to cost-tab "Bên thanh toán" cells (services + parts). Wrong location per BA chốt 2026-06-12 v2. |
| Symptom v2 expected | Purple-500 belongs ONLY to the info block "Thông tin quyết toán → Bên thanh toán" badge value (1 canonical location). Cost-tab payer cells revert to default `#18181B`. |

## 2. Root cause (v2 scope)

The v1 fix applied `text-purple-500` to two `col-ben-thanh-toan` cells inside
`cost-tab.tsx`, mirroring the prior reading of BR-INS-STL-DET-003. BA's
2026-06-12 amendment narrows the canonical purple location to the info block
Badge in `settlement-info.tsx`. Cost-tab cells must revert to the default
foreground colour.

## 3. Fix summary

1. `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/cost-tab.tsx`
   — remove `text-purple-500` from both `col-ben-thanh-toan` cells (services
   table + parts table); keep `data-testid` for regression assertion.
2. `frontend/gf-gms-web/src/features/insurance-settlement/components/detail/settlement-info.tsx`
   — change the "Bên thanh toán" Badge from `border-foreground-success
   text-foreground-success` to `border-purple-500 text-purple-500`; add
   `data-testid="info-payer-bao-hiem"` for regression assertion.
3. `cost-tab.render.test.tsx` — invert the BUG-W01-258 describe block to assert
   `not.toContain("text-purple-500")` on cost-tab payer cells (guard against
   the wrong-location regression returning).
4. New `settlement-info-payer-color.test.ts` — source-level guard that the
   info badge carries both `border-purple-500` and `text-purple-500`.

## 4. Regression tests

- `cost-tab.render.test.tsx` describe block `BUG-W01-258 — STL Detail cost-tab 'Bảo hiểm' payer reverts to default color` (2 assertions).
- `settlement-info-payer-color.test.ts` (2 assertions).

## 5. Verification

```
cd frontend/gf-gms-web
npx vitest run   # 91/91 PASS
npx tsc -b       # exit 0
yarn build       # exit 0
```

## 6. Status

REOPENED → RESOLVED.
