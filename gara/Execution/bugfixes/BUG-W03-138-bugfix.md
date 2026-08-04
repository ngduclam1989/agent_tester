# BUGFIX BUG-W03-138 — Delete dialog silent-failure on ErrorResponse

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-138` (P2 · `FEAT-CAT-GRP-DELETE`)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-138.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE` (scoped) + `needs_review` for global refactor

## Root cause

Shared `src/hooks/use-mutation.ts` returns `data: undefined` on the
`ErrorResponse` union branch (lines 234–244 pre-fix). The material-group
delete hook `use-delete-material-group.ts` did `return
res.data?.deleteMaterialGroup` → resolved to `undefined`. `MaterialGroupDeleteDialog.handleConfirm`
then read `.code` from `undefined` and never transitioned to the
`"blocked-product"` / `"blocked-children"` state. User saw silent no-op.

## Fix (scoped)

`frontend/gf-gms-web/src/features/inventory-catalog/material-group/hooks/use-delete-material-group.ts`

`execute` now:

1. Returns `res.data.deleteMaterialGroup` when `useMutation` did surface a
   payload (success path unchanged).
2. Falls back to `{ code, message }` reconstructed from `res.errors[0]` when
   `data` is undefined (the ErrorResponse branch). Dialog callsite still
   reads `.code` → transitions correctly to `blocked-product`
   (`ERR-INV-004`) or `blocked-children` (`ERR-INV-005`).
3. Returns `undefined` only when no error and no data (unreachable in
   practice; kept as a safe default).

## Escalated (not fixed here)

Global refactor of `use-mutation.ts` to preserve the ErrorResponse object
inside `data: { [mutationKey]: result }` — verify.md option (a) — is deferred:
`useMutation` has ~265 callsites across features. Silent behavioral change of
that surface exceeds the fix charter's "blast radius ≤ 5 callers" guardrail.
See `needs_review[]` in the batch return.

## Regression scope

- `use-delete-material-group` only. `use-mutation.ts` untouched.
- Happy path (successful delete): identical to prior — dialog closes via
  `onSuccess` callback.
- Other error codes (`ERR-INV-006`, network, etc.) now also produce a
  dialog-visible fallback because `code` is populated — the dialog stays in
  `"confirm"` state (no matching branch), which matches prior behavior.

## Follow-ups

- Filed as `needs_review` for orchestrator to decide on the global
  `use-mutation.ts` refactor. Suggested approach when approved: modify only the
  ErrorResponse branch (lines ~234-244) to set `data: { [mutationKey]: result }`
  — backward-compatible superset because `.success` is absent on
  `ErrorResponse`, so existing `if (res.data?.foo?.success)` checks are
  unaffected.
