# BUGFIX — BUG-W03-037

> GRP + PROD filter cubit eager-fetch 500-record group option list in `initData()` — violates rules-mobile §3.1 lazy-load-off-page
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`MaterialGroupFilterCubit.initData()` (`material_group_filter_cubit.dart:20-32`) and `InternalProductFilterCubit.initData()` (`internal_product_filter_cubit.dart:20-28`) both overrode `initData()` — auto-invoked by `BasePage.initState()` via `base_cubit.dart:56` the instant `MaterialGroupFilterPage`/`InternalProductFilterPage` opened — to eagerly call `_repository.searchMaterialGroups(status: ACTIVE, page: 0, size: 500)`. This fetches a 500-record dropdown option list ("Thuộc nhóm"/"Nhóm hàng") regardless of whether the user ever opens that `DropdownMenuWidget` overlay. This violates the newly-codified `rules-mobile/SKILL.md §3.1` (lazy-load API for off-page/overlay content).

## 2. Root cause

The dropdown option list is **overlay content** (a `MenuAnchor` popup, not visible until the user taps the field), not page-primary content — the page's primary content is just the label + empty input field. Fetching it unconditionally on page open wastes network/latency for users who open the Filter page and leave without ever touching the dropdown, and there was no mechanism on `DropdownMenuWidget` to hook a lazy-fetch to the actual "open" interaction.

## 3. Fix

- **`DropdownMenuWidget`** (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`) — added a new optional `final VoidCallback? onOpened;` constructor field. Invoked (`onOpened?.call();`) inside the existing `AppTextField.onTap` handler, only on the *open* transition (`else` branch, right before `controller.open()`), never on close, and never at all when the param is omitted. This is a pure call-site opt-in (Shared-Symbol Blast-Radius Gate category (a)) — the widget's 3rd consumer, `material_group_form.dart` (used by Add/Edit MaterialGroup forms), does not pass `onOpened` and is unaffected by construction.
- **`MaterialGroupFilterCubit`** — `initData()` override REMOVED entirely (falls back to `BaseCubit.initData()`'s no-op default). New method `Future<void> loadGroupOptionsIfNeeded()` added, guarded by `if (state.groupOptions.isNotEmpty) return;` before calling the same `searchMaterialGroups` request as before — so repeat dropdown open/close in the same page session never refetches.
- **`InternalProductFilterCubit`** — identical treatment: `initData()` override removed, `loadGroupOptionsIfNeeded()` added with the same guard.
- **`material_group_filter_page.dart`** — the "Thuộc nhóm" `DropdownMenuWidget` now passes `onOpened: cubit.loadGroupOptionsIfNeeded`.
- **`internal_product_filter_page.dart`** — only the "Nhóm hàng" `DropdownMenuWidget` (group) passes `onOpened: cubit.loadGroupOptionsIfNeeded`. The sibling "Loại sản phẩm" (`productType`) dropdown is intentionally left without `onOpened` — its options come from the local `InternalProductType` enum (`_typeOptions()`), no API call involved.
- No `_state.dart` change was needed — the "already loaded" guard reuses the existing `groupOptions.isEmpty`/`isNotEmpty` field rather than adding a new boolean flag, keeping the diff minimal and avoiding a freezed-codegen dependency in a sandbox with no Flutter toolchain.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | New optional `onOpened` callback, invoked pre-`controller.open()` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_cubit.dart` | `initData()` removed → `loadGroupOptionsIfNeeded()` (guarded) |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | Wire `onOpened: cubit.loadGroupOptionsIfNeeded` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_cubit.dart` | `initData()` removed → `loadGroupOptionsIfNeeded()` (guarded) |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Wire `onOpened: cubit.loadGroupOptionsIfNeeded` on the group dropdown only |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_cubit_test.dart` | **Updated** — old `initData loads...` test replaced with BUG-W03-037 group (no-fetch-in-initData, fetch-once-on-demand, no-refetch-guard) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_cubit_test.dart` | **New** — same 2 cubit assertions + sibling setter coverage |
| `mobile/gf-garage-app/test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` | **New** — shared-widget test (`onOpened` fires once on open, not on close, omission is safe) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_lazy_load_test.dart` | **New** — static source assertion (initData override absent + onOpened wiring present) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_lazy_load_test.dart` | **New** — same static source assertion for PROD |

## 5. Regression / verification

- `material_group_filter_cubit_test.dart` (updated) + `internal_product_filter_cubit_test.dart` (new): assert (a) `initData()` no longer calls `searchMaterialGroups` (`verifyNever`), (b) `loadGroupOptionsIfNeeded()` fetches ACTIVE-only options with `page:0, size:500` only when explicitly invoked, (c) 3 sequential calls to `loadGroupOptionsIfNeeded()` result in exactly 1 repository call (`.called(1)`) — no refetch guard regression.
- `dropdown_menu_widget_test.dart` (new, Shared-Symbol Blast-Radius Gate coverage for all consumers of this shared widget): `onOpened` fires exactly once on tap-to-open, does not fire again on tap-to-close, and omitting the param (the `MaterialGroupForm` call-site shape) throws no exception.
- `material_group_filter_lazy_load_test.dart` + `internal_product_filter_lazy_load_test.dart` (new, static source assertion): pin `Future<void> initData()` absent from both cubits and `onOpened: cubit.loadGroupOptionsIfNeeded` present in both pages.
- `python3 scripts/check-mobile-canonical-primitives.py --file <5 touched lib files> --include-code` → **OK: 0 anti-pattern hit** (exit 0).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`, consistent with BUG-W03-030..036). Manually verified via source diff + `grep` cross-check that no other `lib/` call site depended on the removed `initData()` eager-fetch behavior, and that `material_group_form.dart` (the 3rd `DropdownMenuWidget` consumer) is untouched and unaffected.

## 6. Non-goals / out of scope

- Did not touch `material_group_form.dart` — its `DropdownMenuWidget` usages (parent group + status dropdowns) receive `parentOptions`/enum values already resolved by the caller, not fetched inside the form itself; not part of this bug's Touched files and unaffected by the new optional param.
- Did not add a loading-spinner state for the brief window between dropdown-open and fetch-resolution — kept minimal per the bug's explicit scope guidance ("ưu tiên fix tối giản").
- Did not address BUG-W03-038 (filter-reopen not pre-filling the previously-applied selection) in this document — see `BUGFIX-BUG-W03-038.md` (same fix cycle, same 2 filter modules, separate root cause).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — moved 500-record group-option fetch out of `initData()` into new guarded `loadGroupOptionsIfNeeded()`, triggered via new `DropdownMenuWidget.onOpened` callback wired only on dropdown-open. 5 new/updated regression test files. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
