# BUGFIX — BUG-W03-075

> AppBar backgrounds on the 2 Inventory Catalog search screens (Material Group Search, Internal Product Search) were rendering grey instead of white — a stale spec citation was followed instead of the live Figma source of truth.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Both `MaterialGroupSearchPage` and `InternalProductSearchPage` set `backgroundColor: AppColors.bgPrimary` (`NeutralColor.s100` = `#e8e8ea`, grey) on their `AppBarCustom(...)`, each citing an inline comment referencing `Figma wave03-cat-grp-list.md GroupSearchAppBar (21252:48381): AppColors.bgPrimary`. The user (mobile dev) reported the AppBar of both search screens looked visibly darker than the rest of the app. The orchestrator re-fetched the exact cited Figma node (`21252:48381`, file `5YU4H3iY726P8KNxI9oCYF`, frame "Tìm kiếm nhóm vật tư hàng hóa - Default") live and confirmed the root Header container is `bg-base` (white) — the previously-cited spec value was wrong (no `_png_verified` pin existed for that specific claim in the original spec doc, per `LL-MOB-011` lesson class). The sibling `booking_search_page.dart` search screen never overrides `AppBarCustom.backgroundColor` at all, relying on the widget's own default `Colors.white` — confirming white is also the established app-wide convention for this screen archetype.

## 2. Root cause

Spec-authoring drift: an earlier prefetch/spec pass for `wave03-cat-grp-list.md` recorded `AppColors.bgPrimary` for the `GroupSearchAppBar` binding without a `_png_verified` screenshot pin backing that specific claim, and both DEV/FIX cycles for the 2 search pages copied the value verbatim (including cross-applying it to the Internal Product search screen, which cited a different, equally unverified, node reference `wave03-cat-prod-list.md ProductSearchAppBar (21235:24802)`). No live Figma re-fetch was performed to cross-check the claim against the actual node before this cycle.

## 3. Fix

- **`material_group_search_page.dart`** — removed the line `backgroundColor: AppColors.bgPrimary,` and its stale citing comment from the `AppBarCustom(...)` call in `builder()`. `AppBarCustom`'s own constructor default (`backgroundColor = Colors.white`, `lib/ui/widgets/app_bar/app_bar_custom.dart:35`) now applies, matching `booking_search_page.dart`'s reference pattern exactly (no override at all).
- **`internal_product_search_page.dart`** — identical fix: removed `backgroundColor: AppColors.bgPrimary,` + its citing comment from the equivalent `AppBarCustom(...)` call.
- No other lines in either file were touched. The `AppColors` import remains used by both files (multiple other tokens: `bgBase`, `bgSecondary`, `textPrimary`, `textTertiary`, `textSecondary`).
- `CustomScaffold.backgroundColor: AppColors.bgBase` (already white, unaffected) is a separate, unrelated property — it was already correct and untouched.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Removed `backgroundColor: AppColors.bgPrimary` + stale citing comment from `AppBarCustom(...)` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Removed `backgroundColor: AppColors.bgPrimary` + stale citing comment from `AppBarCustom(...)` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_appbar_fidelity_test.dart` | **Updated** — new `BUG-W03-075` group: 1 widget test (`AppBarCustom.backgroundColor == Colors.white`, `isNot(AppColors.bgPrimary)`) + 1 source-string test (`AppColors.bgPrimary` no longer present in page source) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_appbar_fidelity_test.dart` | **Updated** — identical `BUG-W03-075` group added |

## 5. Regression / verification

- `material_group_search_appbar_fidelity_test.dart` / `internal_product_search_appbar_fidelity_test.dart` — new `BUG-W03-075` group in each: reconstructs the existing `_SearchAppBarHost` fragment (unchanged, never had the bug — it never set `backgroundColor:`) and asserts `AppBarCustom.backgroundColor == Colors.white` / `isNot(AppColors.bgPrimary)`; a second, independent `File(...).readAsStringSync()` test asserts the literal string `AppColors.bgPrimary` no longer appears anywhere in the real page source — this second assertion is the one that actually fails-before/passes-after this fix (fail on pre-fix HEAD, pass post-fix).
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` — **0 hit** on both touched lib files.
- `grep -n bgPrimary` on both touched lib files confirms zero remaining references post-fix.
- `dart format --output=none --summary=line` (Dart SDK 3.8.1, no full package resolution available) — all 4 touched files reported `Changed` (i.e., parsed successfully; a parse error would instead report a format failure), confirming brace/paren/bracket balance and overall syntactic validity. This is a strictly stronger check than a manual bracket-count script (which is unreliable against Dart string literals containing unbalanced parens, e.g. reason strings).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no matching Flutter/Dart toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; the only SDK present, Dart 3.8.1, fails `pubspec.yaml`'s `sdk: ^3.11.0` constraint, consistent with every other W03 mobile FIX cycle in this environment).
- KG update: **skipped** — this is a pure UI-token fix (no entity/event/permission/API contract change); `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` is outside this dispatch's `OWNED_PATHS`.
- Concurrent note: a separate FIX cycle for **BUG-W03-079** (`ListView.builder` → `ListView.separated` with padding/gap in `_buildBody`) landed on both of these same 2 files during this session — disjoint concern (result-list body vs. AppBar), verified via re-diff that this fix's 2-line-removal-per-file diff did not collide with or revert that change.

## 6. Non-goals / out of scope

- Did not touch `AppBarCustom` itself (its `Colors.white` default was already correct and is shared by many other consumers — no shared-symbol change needed here, this was purely a call-site override removal, Shared-Symbol Blast-Radius Gate §3(a) call-site-defect path).
- Did not touch `booking_search_page.dart` (reference pattern only, not part of this bug's scope).
- Did not audit other AppBar `backgroundColor` usages across the rest of `lib/ui/inventory_catalog/**` for the same stale-spec-citation class of defect — out of this bug's Touched files; a broader audit could be filed as a separate sibling-audit bug if desired (per the `FM-W03-306` prevention pattern already used for BUG-W03-074/076/077).
- Did not update the underlying Figma prefetch spec docs (`wave03-cat-grp-list.md` / `wave03-cat-prod-list.md`) that carried the original wrong `bgPrimary` binding claim — flagging here for a future `/prefetch-figma` re-pass to correct the `_png_verified` gap (`LL-MOB-011` lesson class), not part of this code fix's scope.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — removed stale `backgroundColor: AppColors.bgPrimary` override (+ citing comment) from `AppBarCustom(...)` in both `material_group_search_page.dart` and `internal_product_search_page.dart`, matching the `booking_search_page.dart` reference pattern (no override, keeps `AppBarCustom` default `Colors.white`). 2 test files updated (1 `BUG-W03-075` group each). `check-mobile-canonical-primitives.py` 0 hit. `dart format --output=none` confirms syntactic validity. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (no entity/event/permission change, out of `OWNED_PATHS`). |
