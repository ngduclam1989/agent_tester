# BUGFIX — BUG-W03-096

> `MaterialGroupDeleteCubit.delete()` không hiện dialog "Không thể xoá" (ERR-INV-004/ERR-INV-005) dù BFF trả đúng mã lỗi — cubit đọc sai field trên `ServerError` bắt được.
> Severity: **P1** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 0. Correction notice (read first)

This cycle's **first pass investigated the wrong root cause** and has been fully reverted. The original dispatch prompt hypothesized that the producer, `GraphQLServiceBase._handleGraphQLResponse` (`lib/core/services/graphql/graphql_service_base.dart`), only set `errorCode:` and never `key:` on the `ServerError` it throws — mirroring the (correct) convention used by `ServerError.fromOperationGraphQL` in `error_entity.dart`. That premise was **wrong**: the producer was always correct.

- **First pass (superseded, reverted)**: edited `graphql_service_base.dart` — extracted the 3 `ServerError(...)` throw sites into `@visibleForTesting` static builder methods (`buildHrm001ServerError`/`buildUnauthorizedServerError`/`buildErrorResponseServerError`) and added `key: code`/`key: errorCode` to each. Added a new test file `test/core/services/graphql/graphql_service_base_test.dart` asserting `key == errorCode` on the builders.
- **Orchestrator correction**: re-verification confirmed `_handleGraphQLResponse` already sets `errorCode: code` correctly at all 3 throw sites (lines ~206/212/249) and always has — the file needed no change.
- **Revert**: both changes above were reverted before handoff — confirmed via `git diff`/`git status` showing **0 hit** on `graphql_service_base.dart`, and the new test file no longer exists on disk.
- **Corrected fix** (this doc, below): a 1-line change in the actual consumer, `MaterialGroupDeleteCubit.delete()`.

## 1. Summary

User report 2026-07-02 (mobile dev, with a real log of `ERR-INV-004` when attempting to delete a material group that still has products): the "Không thể xoá" (cannot-delete) dialog never appeared — the delete flow always fell through to the generic error toast instead, even though the BFF/BE returned the correct, well-formed error code.

## 2. Root cause

`MaterialGroupDeleteCubit.delete()` (`lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart:28`) caught the thrown `ServerError` and read the wrong field:

```dart
final code = entity is ServerError ? entity.key ?? '' : '';
```

The producer, `GraphQLServiceBase._handleGraphQLResponse`, parses the GraphQL error payload correctly and throws `ServerError(message: ..., errorCode: code, statusCode: statusCode)` at all 3 of its throw sites — but it only ever sets `errorCode:`, never `key:` (this is simply how that class's throw sites have always been written; it is not a bug in that file — `ServerError.key` defaults to `null` when the constructor param is omitted). So `entity.key` was always `null`, `code` was always `''`, and the `if (code == 'ERR-INV-004')` / `else if (code == 'ERR-INV-005')` gate never matched — every delete-blocked case fell through to `DeleteOutcome.error` (generic toast) instead of `DeleteOutcome.blockedHasProducts` / `DeleteOutcome.blockedHasChildren` (the "Không thể xoá" dialog).

This is a **reader-reads-wrong-field** bug, not a **producer-omits-field** bug — a materially simpler root cause than the one first hypothesized (see §0).

## 3. Fix

One-line change — read `entity.errorCode` instead of `entity.key`:

```dart
// Before
final code = entity is ServerError ? entity.key ?? '' : '';

// After
final code = entity is ServerError ? entity.errorCode ?? '' : '';
```

No change to `graphql_service_base.dart` (producer was always correct — see §0). No change to the `if (code == 'ERR-INV-004') / else if (code == 'ERR-INV-005')` matching logic itself.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` | Line 28: `entity.key ?? ''` → `entity.errorCode ?? ''`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_delete/material_group_delete_cubit_test.dart` | **Existing test file (from BUG-W03-026), updated** — its 4 fixtures constructed `ServerError(..., key: 'ERR...')`, which no longer matches what the real producer sends (`errorCode:` only) and would have gone stale/false-negative under the corrected fix. Changed all 4 to `ServerError(..., errorCode: 'ERR...')`. Assertion logic and test intent unchanged — only the constructor field name used to build the fixture, to keep the fixture shape faithful to production. Header comment extended to document both BUG-W03-026 (hyphen-vs-underscore format) and BUG-W03-096 (`.key` vs `.errorCode` field) as two independent root causes hitting the same gate. No new test file created (avoids duplicate coverage of the same cubit method). |

**Don't-touch respected**: `graphql_service_base.dart` (see §0 — reverted to its pre-cycle state, 0 diff), `error_entity.dart` (producer of the correct `fromOperationGraphQL` convention, untouched, was never the issue), the `if (code == 'ERR-INV-004') / 'ERR-INV-005'` matching literals themselves (unchanged, already correct per BUG-W03-026).

## 5. Blast-radius verification

- `entity.key` → `entity.errorCode` is a **call-site-local read**, not a shared-symbol/widget change — `ServerError` itself (`error_entity.dart`) is untouched, so no other consumer of `ServerError.key`/`ServerError.errorCode` is affected by this diff.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` → 0 hit.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/test/ui/inventory_catalog/material_group_delete/material_group_delete_cubit_test.dart` → 0 hit.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on `PATH` in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle).

## 6. Regression / verification

| Scenario | Test |
|---|---|
| `ServerError` carrying `errorCode: 'ERR-INV-004'` (has products) → `DeleteOutcome.blockedHasProducts` | `material_group_delete_cubit_test.dart` — `'ERR-INV-004 (has products) returns blockedHasProducts'` |
| `ServerError` carrying `errorCode: 'ERR-INV-005'` (has children) → `DeleteOutcome.blockedHasChildren` | `material_group_delete_cubit_test.dart` — `'ERR-INV-005 (has children) returns blockedHasChildren'` |
| Old underscore code `ERR_INV_004` must NOT match (regression guard from BUG-W03-026, re-verified still correct under `.errorCode`) | `material_group_delete_cubit_test.dart` — `'old underscore codes ... must NOT match'` |
| Unrelated error code falls through to generic error | `material_group_delete_cubit_test.dart` — `'unrelated server error code falls through to DeleteOutcome.error'` |
| Successful delete clears error state | `material_group_delete_cubit_test.dart` — `'successful delete returns success and clears errorEntity'` |

**Independent of BUG-W03-095** (a separate BFF-side bug about why an HTTP-level exception is raised at all) — this mobile-side fix is defense-in-depth valuable regardless of whether/when BUG-W03-095 lands, since it corrects how the mobile app reads whatever `ServerError` it receives.

**Residual risk**: none identified — the change makes the reader consistent with what the producer has always sent; no behavior other than the delete-blocked-dialog gate is affected.
