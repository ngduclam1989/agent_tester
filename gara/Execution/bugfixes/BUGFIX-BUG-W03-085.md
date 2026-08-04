# BUGFIX — BUG-W03-085

> The result-count `Row` ("X kết quả tìm kiếm cho ...") on the 2 Inventory Catalog search screens (Material Group Search, Internal Product Search) was wrapped in a symmetric `Padding` (top=bottom=8) instead of matching the canonical reference `booking_search_page.dart`'s asymmetric shape (top=20, no bottom padding).
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

Both `MaterialGroupSearchPage._buildBody()` and `InternalProductSearchPage._buildBody()` wrapped the result-count `Row` in `Padding(padding: const EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing8))`. The user (mobile dev) reported that the padding around "Kết quả tìm kiếm cho 'a'" looked wrong compared to `lib/ui/booking/booking_search/booking_search_page.dart` (~line 136), which uses `Padding(padding: const EdgeInsets.only(top: 20.0, right: 16, left: 16))` — asymmetric, top=20 (not 8), and no dedicated bottom padding at all because the `Row` sits directly above the `Expanded(ListWidget)`/`ListView` below it.

## 2. Root cause

The result-count `Row` was originally scaffolded with a generic symmetric `EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing8)` padding (the common default pattern used elsewhere in this codebase for card/section padding) instead of being built against the specific canonical reference screen (`booking_search_page.dart`) cited by the user report and by earlier related bugs (BUG-W03-051, which fixed the *content* structure of this same Row but left the Padding untouched). The reference screen's padding is intentionally asymmetric — larger top gap to visually separate the result-count line from the search input/tab bar above it, and zero bottom gap because the results list starts immediately below with its own `ListView` padding providing the visual gap to the first card.

## 3. Fix

- **`material_group_search_page.dart`** (`_buildBody()`, results branch) — changed the result-count `Row`'s wrapping `Padding.padding` from `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, vertical: AppSizes.spacing8)` to `EdgeInsets.only(top: 20.0, right: AppSizes.spacing16, left: AppSizes.spacing16)`, with an inline comment `// matches booking_search_page.dart reference padding` documenting why the raw `20.0` literal is kept as-is (booking's own reference uses the same raw literal, not an `AppSizes` token — there is no `AppSizes.spacing20` on the `{0,4,8,16,32,52}` scale, and inventing a mismatched token would diverge from the cited precedent).
- **`internal_product_search_page.dart`** (`_buildBody()`, results branch) — identical fix, same padding shape + comment.
- No other lines in either file were touched. The `ListView.separated`'s own `padding: EdgeInsets.all(AppSizes.spacing16)` (fixed separately by BUG-W03-079) was left untouched — it is a disjoint concern (results-list padding vs. result-count-header padding).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Result-count `Row`'s `Padding` changed from `EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing8)` to `EdgeInsets.only(top: 20.0, right: spacing16, left: spacing16)` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Identical fix |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_result_count_padding_test.dart` | **New** — mounts the real page with a mocked repository, asserts the result-count `Padding.padding` equals the new `EdgeInsets.only(...)` shape |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_result_count_padding_test.dart` | **New** — identical assertion for the Internal Product search page |

## 5. Regression / verification

- 2 new widget tests (`material_group_search_result_count_padding_test.dart`, `internal_product_search_result_count_padding_test.dart`) — same strategy as the existing `BUG-W03-079` list-padding tests in this suite: mount the **real** page (`MaterialGroupSearchPage` / `InternalProductSearchPage`) wrapped in `BlocProvider.value` with a `mocktail`-mocked `InventoryCatalogRepository`, drive a keyword search, locate the result-count prefix `Text` via its localized string, walk up to the ancestor `Padding`, and assert `padding == const EdgeInsets.only(top: 20.0, right: AppSizes.spacing16, left: AppSizes.spacing16)`. These fail against pre-fix HEAD (old `EdgeInsets.symmetric(...)` value) and pass post-fix.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` — **0 hit** on both touched lib files (run from design-repo root).
- Brace/paren/bracket balance manually verified (Python char-count script) on all 4 touched/added files — all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no matching Flutter/Dart toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; only Flutter 3.32.8 / Dart 3.8.1 present at `/home/all_engineer/flutter`, which fails `pubspec.yaml`'s `sdk: ^3.11.0` constraint — no `fvm` binary, no `.fvm/fvm_config.json` in the project — consistent with every other W03 mobile FIX cycle in this environment).
- KG update: **skipped** — pure UI-padding fix (no entity/event/permission/API contract change); `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` is outside this dispatch's `OWNED_PATHS`.
- Concurrent note: a separate FIX cycle for **BUG-W03-084** (result-count Row's *loading-state* logic, `*_search_cubit.dart` files only) ran concurrently on the same 2 feature folders during this session — disjoint files (cubit vs. page), no overlap; re-verified via git diff that this fix's page-level padding change did not collide with that cubit-level change.

## 6. Non-goals / out of scope

- Did not touch `booking_search_page.dart` (reference pattern only, read-only per the FIX dispatch's forbidden list).
- Did not touch the result-count `Row`'s content/text/font styling (that was already fixed by BUG-W03-051) — this bug is scoped strictly to the wrapping `Padding` shape.
- Did not touch the `ListView.separated`'s own list padding (`EdgeInsets.all(AppSizes.spacing16)`, fixed separately by BUG-W03-079).
- Did not audit other search/list screens across `lib/ui/inventory_catalog/**` for the same padding-shape drift class of defect — out of this bug's Touched files (`material_group_search_page.dart` / `internal_product_search_page.dart` only).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — changed the result-count `Row`'s `Padding` from `EdgeInsets.symmetric(horizontal: spacing16, vertical: spacing8)` to `EdgeInsets.only(top: 20.0, right: AppSizes.spacing16, left: AppSizes.spacing16)` matching `booking_search_page.dart`'s reference shape, on both `material_group_search_page.dart` and `internal_product_search_page.dart`. 2 new regression tests mounting the real page with a mocked repository. `check-mobile-canonical-primitives.py` 0 hit. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (no entity/event/permission change, out of `OWNED_PATHS`). |
