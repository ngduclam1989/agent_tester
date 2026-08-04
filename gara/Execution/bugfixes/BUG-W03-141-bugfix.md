# BUGFIX BUG-W03-141 — Reset app state on logout to drop cross-session filter/search

**Bug**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-141` (P3 · `FEAT-CAT-GRP-LIST`; may
escalate to P1 if cross-user leak confirmed)
**Verify**: `Tracking/WAVE03/verify/BUG-W03-141.verify.md`
**Fixed by**: agent-fix-garage-web (Wave 03 batch 2)
**Status**: `FIX_DONE`

## Root cause / audit result

Store audit (`src/store/filter.ts` + all `createFilterStore` callsites):

- `createFilterStore` uses `zustand`'s plain `create` — NO `persist` middleware.
- Filter/search state lives entirely in-memory (per Zustand store instance).
- On logout, `clearUserData` clears cookies + localStorage + permissions but
  does NOT reset any of the material-group / internal-product / other feature
  filter stores.
- `AuthSyncManager` handled the `"logout"` broadcast by calling
  `navigate({ to: ROUTES.LOGIN, replace: true })` — a client-side navigation
  that keeps the SPA runtime (and all Zustand stores) alive. Consequence: after
  logout + login (same or different user, same tab), all previously-set filter
  states remain in memory.

## Fix

`frontend/gf-gms-web/src/components/share/navigates/auth-sync-manager.tsx`

The logout branch of the broadcast handler now `window.location.replace(ROUTES.LOGIN)`
in the browser: a hard reload that resets every in-memory Zustand store, any
Apollo cache, and other module-level state. Login flow (redirect on
`"login"` message) is untouched — login already replaces auth state
explicitly.

`ROUTES.LOGIN` is used as the target so the reload lands on the login screen
(no back-navigation to the previously-authenticated page).

## Regression scope

- Logout UX now includes a full page reload before showing the login screen
  (slightly slower cold-start visually, but negligible).
- Login flow unchanged (still uses TanStack navigate).
- Filter states on all lists (MaterialGroup, InternalProduct, Booking, etc.)
  will now reset on any logout — matches the AC requirement across the entire
  app, not just this one screen.

## Cross-user leak severity

Because the state was memory-only (no `persist`), it can NOT leak across
different browsers or after a real browser close/reopen. But WITHIN the same
tab/session across logout+login, the leak was real (verify.md §9 P1 escalation
condition). This fix eliminates the leak in the same tab: hard reload drops
the process, so User B cannot inherit User A's filter.

Recommendation: retain `P3` classification unless a scenario is found where
state leaked across a real process boundary.

## Follow-ups

- Long-term: audit the codebase for any Zustand store that uses `persist`
  middleware AND stores tenant/user-scoped state (search, filter, drafts) —
  they would leak even after hard reload. Grep `persist` in
  `frontend/gf-gms-web/src/` returned zero hits during this fix, but a formal
  guard is recommended before wider adoption.
