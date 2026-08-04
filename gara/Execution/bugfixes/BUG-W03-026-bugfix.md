# BUGFIX — BUG-W03-026

> Error-code hyphen/underscore mismatch — inline error UX + "cannot delete" dialog never triggers
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

Three `garage-mobile` cubits compared the BFF/BE-returned GraphQL error `code` against
**underscore**-formatted string literals (`ERR_INV_002`, `ERR_INV_003`, `ERR_INV_004`,
`ERR_INV_005`, `ERR_INV_016`), but the canonical BE/BFF error code format is
**hyphenated** (`ERR-INV-002` … `ERR-INV-016`) — confirmed with zero exception across
`Architecture/data/gf-inventory-data-model.md`, `Architecture/hld/gf-inventory-HLD.md`,
`Architecture/decisions/ADR-017-*.md`, and BFF spec
`Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-EDIT.md` (lines 76, 195-196:
*"Surface error codes ERR-INV-003 ... và ERR-INV-016 ... từ BE về GraphQL layer không
transform"*). The mobile GraphQL adapter chain
(`graphql_service_base.dart:230` → `ServerError` → `ServerError.fromServerError` →
`entity.key`) also performs **no normalization** anywhere — the code reaches the cubit
verbatim in the hyphenated form the BE sends. Since the comparisons used underscores,
they could **never match**, so the specific inline-error UX silently never triggered and
every affected case fell through to the generic `errorEntity` SnackBar instead.

Fix is a surgical string-literal change — underscore → hyphen — at the 6 known
comparison sites, no other logic touched.

## 2. Root cause

- The 3 cubits were authored against an assumed/legacy error-code naming convention
  (underscore, matching Kafka `MESSAGE_TYPE` style casing used elsewhere in the repo)
  instead of the actual BE/BFF contract (hyphenated, per `ADR-017-*` + inventory HLD).
- No shared error-code constant/enum is used for these comparisons (raw string literal
  per call site) and no normalization layer exists between GraphQL response parsing and
  cubit consumption — so the drift went undetected until traced end-to-end for this
  fix cycle.

## 3. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_cubit.dart` | `submit()` catch block: `'ERR_INV_002'` → `'ERR-INV-002'` (duplicate code → `codeErrorText`), `'ERR_INV_016'` → `'ERR-INV-016'` (description too long → `descriptionErrorText`). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_cubit.dart` | `submit()` catch block: `'ERR_INV_003'` → `'ERR-INV-003'` (parent-cycle → `cycleError`), `'ERR_INV_016'` → `'ERR-INV-016'` (description too long → `descriptionErrorText`). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_delete/material_group_delete_cubit.dart` | `delete()` catch block: `'ERR_INV_004'` → `'ERR-INV-004'` (`DeleteOutcome.blockedHasProducts`), `'ERR_INV_005'` → `'ERR-INV-005'` (`DeleteOutcome.blockedHasChildren`). |

6 single-line literal edits total, 2 per file. No other logic in these files was touched.

## 4. Additional-site sweep

Ran `grep -rn "ERR_INV" lib/` (repo-wide, not scoped to `inventory_catalog/`) after the
6 fixes — **0 hits**. Also swept the broader pattern `ERR_[A-Z]+_[0-9]` across `lib/` for
any other domain with the same underscore/hyphen drift — **0 hits**. The 6 known sites
were exhaustive; no additional occurrences found.

## 5. Impact if not fixed

- `add_material_group_cubit.dart`: duplicate group code submit → BE rejects
  `ERR-INV-002` → should show inline "Mã đã tồn tại" under the code field; comparison
  failure meant a generic error SnackBar showed instead.
- `edit_material_group_cubit.dart`: parent-cycle validation (`ERR-INV-003`), same failure
  mode.
- `material_group_delete_cubit.dart` — **most severe**: the entire "Không thể xoá"
  (cannot-delete) dialog UX, which distinguishes "has products" vs "has children"
  reasons (dialog/enum wiring itself previously verified correct under
  BUG-W03-015/020), **never triggered at all** because the gate comparison itself
  always failed. Every delete-blocked case silently degraded to the generic error path.

## 6. Regression / verification

- `grep -rn "ERR_INV" lib/` → 0 hits (all converted to hyphen).
- `grep -rn "ERR-INV" lib/` → 7 hits (6 fixed comparisons + 1 dartdoc comment in
  `material_group_delete_handler.dart:10` referencing `ERR-INV-004/005`, already
  correct, unchanged).
- New `bloc_test`-style cubit unit tests (using `flutter_test` + `mocktail`, matching
  repo convention — `bloc_test` package itself is not a project dependency):
  - `test/ui/inventory_catalog/material_group_add/add_material_group_cubit_test.dart`
  - `test/ui/inventory_catalog/material_group_edit/edit_material_group_cubit_test.dart`
  - `test/ui/inventory_catalog/material_group_delete/material_group_delete_cubit_test.dart`

  Each covers: (a) the hyphenated code reaches the intended specific state
  (`codeErrorText` / `descriptionErrorText` / `cycleError` / `DeleteOutcome.blockedHasProducts`
  / `DeleteOutcome.blockedHasChildren`), (b) the **old underscore code as a regression
  guard** — asserts it does NOT match anymore and instead falls through to the generic
  `errorEntity` / `DeleteOutcome.error` path, and (c) an unrelated error code still hits
  the generic fallback unchanged (confirms the `else` branch is untouched).
- `fvm flutter analyze` / `fvm flutter test` on the 3 changed files: **DEFERRED**.
  A Flutter SDK was found at `/home/all_engineer/flutter` (3.32.8 / Dart 3.8.1), but
  `flutter pub get` fails immediately: `pubspec.yaml` requires `sdk: ^3.11.0` while the
  available Dart SDK is `3.8.1` — version-solving failure, no `.dart_tool/` present.
  Same constraint as prior W03 mobile FIX cycles
  (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER` / `DEBT-W01-MOBILE-BUILD-ENV`). Test files are
  written and ready for CI / next environment with a matching toolchain.

## 7. Non-goals / out of scope

- No shared error-code enum/constant was introduced — kept to the minimal literal fix
  per orchestrator scope (mechanical string-literal fix only). A follow-up debt item to
  centralize error-code constants (avoid future drift) is worth raising separately.
- No changes to `graphql_service_base.dart` / `error_entity.dart` — the chain already
  passes the code through verbatim (correct behavior); the bug was purely in the
  cubit-side comparison literals.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Initial fix — 6 string-literal edits (underscore → hyphen) across 3 cubits + 3 new regression test files. Build/analyze/test deferred (Flutter SDK version mismatch, no toolchain match). |
