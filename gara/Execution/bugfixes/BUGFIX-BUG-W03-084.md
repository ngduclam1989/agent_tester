# BUGFIX — BUG-W03-084

> Search cubit (GRP + PROD) shows "0 kết quả tìm kiếm cho '<keyword>'" for ~300ms while the debounce timer is pending, instead of a loading spinner
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`MaterialGroupSearchCubit.changeKeyword()` and `InternalProductSearchCubit.changeKeyword()` both emitted the new `keyword` synchronously but only emitted `loading: true` 300ms later, inside `_search()`, when the debounce `Timer` actually fired. During that 300ms gap the state was `keyword` = new non-empty value + `loading = false` (stale) + `hasSearched = false` (stale) + `groups`/`products = []` (stale). The pages' `_buildBody` checks, in order, `keyword.isEmpty` → `loading && <list>.isEmpty` → `hasSearched && <list>.isEmpty` → default results branch — with `loading` and `hasSearched` both still `false`, every keystroke fell through to the default branch and rendered `CatalogSearchNoResults` ("0 kết quả tìm kiếm cho '<keyword>'") for the full debounce window before the real search ran.

## 2. Root cause

`changeKeyword()` scheduled the debounce `Timer` without first marking the cubit as "a search is now pending." `loading` was only flipped inside `_search()`, i.e. only once the timer callback fired — leaving no state value the page could check to know a search was in-flight during the debounce itself. Reference pattern `BookingSearchCubit.changeSearch()` avoids this entirely by not emitting the search term until inside the timer callback (alongside kicking off the fetch) — but per the bug's fix guidance, the simpler fix for these two cubits (which intentionally keep `keyword` reflecting the raw input immediately, for input-field responsiveness) is to emit `loading: true` up front instead.

## 3. Fix

- **`MaterialGroupSearchCubit.changeKeyword()`** (`lib/ui/inventory_catalog/material_group_search/material_group_search_cubit.dart`) — added `emit(state.copyWith(loading: true));` immediately after the `keyword.isEmpty` early-return branch, before scheduling `_debounce = Timer(...)`. The pre-existing `keyword.isEmpty` branch (which clears `groups`/`hasSearched`/`loading`) is unchanged.
- **`InternalProductSearchCubit.changeKeyword()`** (`lib/ui/inventory_catalog/internal_product_search/internal_product_search_cubit.dart`) — identical one-line fix.
- `_search()` in both cubits still emits `loading: true` again once the timer fires; this second emission is now a no-op state transition (already `true`) and is left untouched — it is still required for the case where a caller invokes `_search()`/state directly without a prior `changeKeyword()` emission (none currently, but keeps `_search()` self-contained).
- No change to `{material_group,internal_product}_search_page.dart` — `_buildBody`'s `state.loading && state.<list>.isEmpty` branch was already correctly positioned before the `hasSearched` / default branches; it simply never triggered during the debounce window because `loading` was never `true` yet.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_cubit.dart` | `changeKeyword()` now emits `loading: true` synchronously before scheduling the debounce `Timer` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_cubit.dart` | Same fix |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_cubit_test.dart` | **Updated** — new `BUG-W03-084` group: (a) non-empty keyword sets `loading == true` synchronously, (b) clearing keyword after typing resets `loading` back to `false` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_cubit_test.dart` | **New** — full cubit test file (this cubit had no prior dedicated test), mirrors the MaterialGroup cubit's keyword/debounce/error-fallback coverage plus the same `BUG-W03-084` regression group |

## 5. Regression / verification

- `material_group_search_cubit_test.dart` (`BUG-W03-084` group, 2 tests): `cubit.changeKeyword('a')` → `cubit.state.loading` is `true` **synchronously** (asserted with no `await`/timer pump), `keyword == 'a'`, `hasSearched == false`, `groups` empty (i.e. exactly the pre-fetch pending state the page's spinner branch checks for); a second test verifies clearing the keyword right after still resets `loading` to `false` via the untouched early-return branch.
- `internal_product_search_cubit_test.dart` (new, same `BUG-W03-084` group): identical two assertions for `InternalProductSearchCubit`, plus baseline keyword/debounce/error-fallback coverage this cubit previously lacked.
- Both tests assert against the exact page condition `state.loading && state.<list>.isEmpty` used by `_buildBody` (traced in `material_group_search_page.dart:149` / equivalent in `internal_product_search_page.dart`) — confirming the spinner branch now covers the debounce window with no gap.
- `python3 scripts/check-mobile-canonical-primitives.py --file <2 touched lib files>` → **OK: 0 anti-pattern hit** (exit 0), run individually for both files.
- Brace/paren balance verified on all 4 touched/created files (cubits + tests) — balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`, consistent with prior W03 bugfixes). Fix is a single-line, no-new-symbol change (`emit(state.copyWith(loading: true));` reuses the existing `loading` field already present on both freezed states) — no codegen (`build_runner`) required.

## 6. Non-goals / out of scope

- Did not touch `material_group_search_page.dart` / `internal_product_search_page.dart` — `_buildBody`'s branch order was already correct; only the cubit's missing early `loading` emission needed fixing.
- Did not touch `booking_search_cubit.dart` — used read-only as the reference UX pattern; its own `keyword`-deferred-until-timer approach was not ported since it would change these cubits' input-field-responsiveness contract, which the simpler `loading`-first fix avoids.
- Did not restructure the debounce `Timer`/`_search()` flow — the fix is additive (one new synchronous emission), no logic reordering elsewhere.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `changeKeyword()` in both GRP/PROD search cubits now emits `loading: true` synchronously before scheduling the debounce timer, closing the "0 kết quả" flash gap. 1 updated + 1 new regression test file. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
