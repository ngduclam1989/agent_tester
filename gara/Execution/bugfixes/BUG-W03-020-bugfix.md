# BUGFIX — BUG-W03-020

> AC-6 RBAC dual-persona không có defensive check — Delete/Edit button render unconditionally (CR-20260701-01 P1#3 verify)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`_DetailFooter` in `material_group_detail_page.dart` rendered the Delete/Edit `AppButton`s unconditionally with no role check — functionally correct today (both known personas, `garage-owner` + `accountant`, are allowed per AC-6), but not audit-friendly and not defensive against a hypothetical future 3rd persona.

## 2. Fix

Added an explicit `_canManageGroup(UserRole? role)` static guard checking `role == UserRole.garage || role == UserRole.ca` (both dual-persona values per Critical Rule #6 — `UserRole.garage` = `garage-owner`, `UserRole.ca` = `accountant`). `_DetailFooter.build()` reads the current role via `getIt<AppPreferences>().getProfileLocal?.role` and renders `SizedBox.shrink()` if the guard fails, otherwise renders the footer as before.

This is a no-op today (both defined roles pass) by design — it converts an implicit "works because only 2 roles exist" invariant into an explicit, self-documenting check, matching the CR-20260701-01 P1#3 verify intent ("cả 2 persona" + defensive against unknown personas).

## 3. Files changed

| File | Change |
|---|---|
| `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | `_DetailFooter`: added `static bool _canManageGroup(UserRole? role)`, `build()` reads `getIt<AppPreferences>().getProfileLocal?.role` and early-returns `const SizedBox.shrink()` if guard fails. New imports: `core/common/bases/enum/user_role.dart`, `core/local_storage/share_preferences.dart`, `injection_container.dart`. |

Note on authorship: this fix landed via the concurrent `agent-fix-garage-mobile` session (commit `52935e87`, same batch as BUG-016/017). This FIX cycle independently verified: (a) `UserRole` enum values (`garage`→`GARAGE_OWNER`, `ca`→`CA`) match Critical Rule #6 dual-persona; (b) `ProfileResponse.role` field type is `UserRole?`, so `getProfileLocal?.role` type-checks; (c) no pre-existing RBAC-role-check precedent elsewhere in `lib/ui/` (grep confirmed 0 hits for `UserRole.` outside `inventory_catalog` before this fix) — this is intentionally the first such usage, consistent with the bug report's own finding ("Không tìm thấy consumer nào của UserRole.garage/UserRole.ca").

## 4. Regression / verification

- Type-check via source inspection: `ProfileResponse.role: UserRole?` confirmed in `lib/core/models/response/profile/profile_response.dart:12` — `getProfileLocal?.role` resolves to `UserRole?`, compatible with `_canManageGroup(UserRole? role)` signature.
- `fvm flutter analyze` / `fvm flutter test` / widget test: **deferred** (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`).

## 5. Non-goals / out of scope

- Did not add a 3rd persona or change permission semantics — Critical Rule #6 (dual persona only) still holds; this is a defensive guard, not a scope change.

## 6. Follow-up

- TEST cycle: widget test asserting footer hidden when `getProfileLocal?.role` is `null` or an unrecognized value (defensive-path coverage), and visible for both `garage` and `ca`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile (+ concurrent session commit `52935e87`) | Fix — explicit `_canManageGroup` RBAC guard added to `_DetailFooter`; verified type-correctness against `ProfileResponse`/`UserRole`. |
