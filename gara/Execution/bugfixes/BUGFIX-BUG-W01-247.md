# BUGFIX BUG-W01-247 — INSURANCE STL detail `Chỉnh sửa` button no-op

> **Status**: VERIFIED (pending live re-test post-image-rebuild).
> **Authored by**: agent-fix-garage-web.
> **Cluster**: BUG-W01-246 (UI drift) — same patch addresses typography + handler wiring.

---

## 1. Failure mode

| Field | Value |
|---|---|
| Bug | BUG-W01-247 (P1) — FEAT-INS-STL-DETAIL / AC-11 |
| Symptom | Click `Chỉnh sửa` header button trên STL INSURANCE detail page → silent no-op (no navigate, no console error, no network) |
| Reporter | QC-Manual (evidence: `SET-20260610-00002`, status=DRAFT, payer=Bảo Minh) |
| Business impact | Blocker hoàn thiện DRAFT STL bảo hiểm trước khi xuất hồ sơ → workaround duy nhất là edit qua SO source |

## 2. Root cause

`frontend/gf-gms-web/src/features/settlement-voucher/components/detail/settlement-detail-dispatcher.tsx:34` mounted `<InsuranceSettlementDetailPage code={code} />` with **only** the `code` prop. The component's prop contract is:

```ts
interface InsuranceSettlementDetailPageProps {
  code: string;
  onBack?: () => void;
  onEdit?: (code: string) => void;
  onPrintAll?: (code: string) => void;
  onOpenServiceOrder?: (code: string) => void;
}
```

All three navigation handlers are **optional** and the header button calls `onEdit?.(detail.code)`. With `onEdit === undefined`, the optional-chain short-circuits → no-op. No throw, no log.

The baseline (non-INSURANCE) branch goes through `<SettlementVoucherDetail>/index.tsx` which builds `headerActions` with a wired `handleEnterEditMode` → so non-INSURANCE works. There is a SECOND dispatch site inside `index.tsx` that wires INSURANCE handlers correctly, but the route at `src/routes/_modules/_repair-services/settlement-voucher/$code/index.tsx:12` uses the standalone `SettlementDetailDispatcher`, not the `index.tsx` shell.

## 3. Fix

Patch `settlement-detail-dispatcher.tsx`:

- Import `useNavigate` from `@tanstack/react-router` + `ROUTES` from `@/config/route`.
- Add `useCallback` handlers identical to the baseline shell:
  - `handleBack` → `navigate({ to: ROUTES.SETTLEMENT_VOUCHER })`
  - `handleEdit` → `navigate({ to: ROUTES.SETTLEMENT_VOUCHER_DETAIL, params: { code }, search: { mode: "edit" } })`
  - `handleOpenServiceOrder(soCode)` → `navigate({ to: ROUTES.SERVICE_ORDER_DETAIL, params: { code: soCode } })`
- Pass all three to `<InsuranceSettlementDetailPage>`.

`onPrintAll` is intentionally left unwired — print-all-dossier is W02 scope (FEAT-INS-DOSSIER-EXPORT) and would be feature work outside this bug's scope.

## 4. Files touched

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/settlement-voucher/components/detail/settlement-detail-dispatcher.tsx` | Add `useNavigate` + 3 `useCallback` handlers + pass to `<InsuranceSettlementDetailPage>` |
| `frontend/gf-gms-web/src/features/settlement-voucher/components/detail/settlement-detail-dispatcher.test.tsx` | NEW — 4 regression assertions |

## 5. Regression test

`settlement-detail-dispatcher.test.tsx` mocks `useGetSettlementByCode` (returns `INSURANCE` type) + `useNavigate` + the `InsuranceSettlementDetailPage` component, then asserts:

1. `onEdit` prop is supplied (`probe-has-edit === "yes"`)
2. `onBack` prop is supplied (`probe-has-back === "yes"`)
3. `onOpenServiceOrder` prop is supplied (`probe-has-open-so === "yes"`)
4. Clicking the edit probe triggers `navigate(...)` with `search: { mode: "edit" }` and the correct `code` param.
5. Clicking the back probe triggers `navigate(...)` to the list route (no params/search).
6. Clicking the open-SO probe triggers `navigate(...)` with the SO code param.

## 6. Verification

- `cd frontend/gf-gms-web && npx vitest run` → 56/56 PASS (8 new + 48 pre-existing).
- `cd frontend/gf-gms-web && npm run build` → exit 0; bundle built in 17.21s.
- `cd frontend/gf-gms-web && npx eslint` on touched files → 0 errors / 0 warnings.

Live UI re-test (Playwright TC-W01-AC11-EDIT) deferred until next image rebuild — VERIFY_PENDING.

## 7. Residual / Follow-ups

- `onPrintAll` still no-op on INSURANCE branch (W02 scope, not this bug).
- Dispatcher pattern duplicates handler logic with `<SettlementVoucherDetail>/index.tsx`; future consolidation could lift navigation into a shared hook but that would be scope creep on this fix.
