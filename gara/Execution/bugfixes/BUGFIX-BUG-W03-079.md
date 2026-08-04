# BUGFIX — BUG-W03-079

> Search-results card list on GRP + PROD search pages rendered a bare `ListView.builder` — no padding, no gap between cards
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`MaterialGroupSearchPage._buildBody` (`material_group_search_page.dart`) and `InternalProductSearchPage._buildBody` (`internal_product_search_page.dart`) both rendered their search-results card list as `Expanded(child: ListView.builder(itemCount: ..., itemBuilder: (_, i) => <Card>(...)))` — no `padding:` param (cards sat flush against the left/right screen edges) and no separator (cards stacked with zero vertical gap). This diverged from both the GRP list page (`material_group_list_page.dart`, which uses `ListWidget` with `padding: EdgeInsets.all(AppSizes.spacing16)` + `separatorHeight: AppSizes.spacing16`) and the canonical reference the user cited, `lib/ui/booking/booking_search/booking_search_page.dart` (`ListView.separated` with `padding: EdgeInsets.symmetric(horizontal: 16, vertical: 16)` + `separatorBuilder: (_, __) => Gap(16)`).

## 2. Root cause

Both search pages' `_buildBody` results branch was implemented with the plain `ListView.builder` constructor and never carried a `padding` or `separatorBuilder` — unlike the sibling list page (which reuses the shared `ListWidget` helper, itself wired with `padding`/`separatorHeight`) and unlike `booking_search_page.dart` (which explicitly sets both on its own `ListView.separated`). No shared helper is used by the two search pages' result list (they construct `ListView` directly), so the omission was local to each `_buildBody` and not inherited from a shared widget defect.

## 3. Fix

- **`material_group_search_page.dart`** (`_buildBody`, results branch) — changed `ListView.builder(itemCount: state.groups.length, itemBuilder: ...)` to `ListView.separated(padding: const EdgeInsets.all(AppSizes.spacing16), itemCount: state.groups.length, separatorBuilder: (_, __) => const Gap(AppSizes.spacing16), itemBuilder: ...)`. `itemBuilder` body (the `GroupListCard` construction + `onTap`) is unchanged.
- **`internal_product_search_page.dart`** (`_buildBody`, results branch) — identical treatment: `ListView.builder` → `ListView.separated` with the same `padding`/`separatorBuilder`, `itemBuilder` body (`InternalProductListCard`) unchanged.
- Both files already imported `package:cardoctor_garage_v3/core/common/styles/app_sizes.dart` and `package:gap/gap.dart` (used elsewhere on the same page — the empty-keyword header `Gap(8)` and `AppSizes.spacing16`/`spacing8` in the empty-keyword body) — no new imports were needed.
- No shared widget was touched (`GroupListCard`, `InternalProductListCard`, `booking_search_page.dart`, `material_group_list_page.dart` are all read-only references per bug scope) — the Shared-Symbol Blast-Radius Gate does not apply here; each edit is local to its own page's `_buildBody`.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Results `ListView.builder` → `ListView.separated` + `padding: EdgeInsets.all(AppSizes.spacing16)` + `Gap(AppSizes.spacing16)` separator |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Same treatment for the PROD results list |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_list_padding_test.dart` | **New** — mounts the real `MaterialGroupSearchPage` w/ mocked repository, asserts `ListView.padding == EdgeInsets.all(AppSizes.spacing16)` + exactly 1 `Gap(mainAxisExtent: AppSizes.spacing16)` between 2 cards |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_list_padding_test.dart` | **New** — same assertions for `InternalProductSearchPage` |

## 5. Regression / verification

- `material_group_search_list_padding_test.dart` / `internal_product_search_list_padding_test.dart` (new, same strategy as the existing `*_no_results_test.dart` BUG-W03-049 tests in this suite — mount the REAL page with `BlocProvider<...>.value` around a cubit wired to a `mocktail`-mocked `InventoryCatalogRepository`, not a reconstructed fragment): mock a 2-item search response, drive `cubit.changeKeyword(...)` + debounce pump (350ms) + `pumpAndSettle`, then assert (a) exactly 2 `GroupListCard`/`InternalProductListCard` render, (b) the results `ListView`'s `padding` equals `EdgeInsets.all(AppSizes.spacing16)`, (c) exactly 1 `Gap` descendant of that `ListView` has `mainAxisExtent == AppSizes.spacing16` (the separator between the 2 cards).
- `python3 scripts/check-mobile-canonical-primitives.py --file <both touched lib files>` → **OK: 0 anti-pattern hit** (exit 0) for both.
- Brace/paren/bracket balance verified via a standalone Python count script on both touched files — all 3 counts balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED**. This sandbox has a local Flutter SDK at `/home/all_engineer/flutter` (3.32.8 / Dart 3.8.1), but `pubspec.yaml` requires `sdk: ^3.11.0`; `flutter pub get` fails at version-solving (`The current Dart SDK version is 3.8.1... requires SDK version ^3.11.0`) and no `fvm`/matching Dart 3.11 toolchain is present on `PATH` — consistent with `DEBT-W01-MOBILE-BUILD-ENV` (see BUG-W03-030..078 sibling docs). Manually cross-checked the new `ListView.separated` call shape against the already-shipped, presumably-compiling reference (`booking_search_page.dart`) to confirm constructor param names/types match.

## 6. Non-goals / out of scope

- Did not touch `material_group_list_page.dart`, `booking_search_page.dart`, `GroupListCard`, or `InternalProductListCard` — all read-only references per the bug's explicit scope.
- Did not migrate the search pages' results list onto the shared `ListWidget` helper (used by `material_group_list_page.dart`) — the search pages don't need `ListWidget`'s pull-to-refresh/pagination/empty-state machinery (already handled by the page's own `_buildBody` branching on `state.loading`/`state.hasSearched`), so a plain `ListView.separated` with matching padding/gap is the minimal-scope fix per the bug's own suggested approach.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — GRP + PROD search results list: `ListView.builder` → `ListView.separated` with `padding: EdgeInsets.all(AppSizes.spacing16)` + `Gap(AppSizes.spacing16)` separator, matching `material_group_list_page.dart` / `booking_search_page.dart` reference pattern. 2 new regression test files. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
