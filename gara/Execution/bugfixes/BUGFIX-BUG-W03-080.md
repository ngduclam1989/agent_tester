# BUGFIX — BUG-W03-080

> "Thuộc nhóm" filter dropdown showed a literal "--" placeholder instead of "Tất cả", and the shared `DropdownMenuWidget` always rendered a visible scrollbar track when opened.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) reported two related UI defects on the Material Group "Thuộc nhóm" filter page: (1) the "no specific parent group / show all" option in the filter dropdown rendered as a literal `"--"` string instead of the standard "Tất cả" (All) wording; (2) the shared `DropdownMenuWidget` menu (used by 3 consumers) always showed a visible scrollbar track/thumb when opened — verbatim: *"Bên bộ lọc sẽ không có item là -- mà sẽ hiển thị là Tất cả và ko được có scrollbar ở dropdown"*.

## 2. Root cause

**Part 1 — `"--"` literal.** `_MaterialGroupFilterPageState._optionsFor()` in `material_group_filter_page.dart` built its option list with `const _ParentGroupOption(null, '--')` as the sentinel "no parent filter" entry — a hardcoded literal picked when the page was first authored, never routed through the app's `LocaleKeys` i18n layer (rules-mobile §4.1 / M-30). The sibling `internal_product_filter_page.dart`, which has the exact same "all group" option shape (`_GroupOption(null, ...)`), already uses `LocaleKeys.common_all.tr()` for this slot — confirming this was a one-off drift on the material-group filter page rather than a missing locale key.

**Part 2 — Scrollbar.** `DropdownMenuWidget.build()` wrapped the menu's `SingleChildScrollView` in `Scrollbar(thumbVisibility: true, controller: scrollController, child: ...)`. `thumbVisibility: true` forces the scrollbar track/thumb to always render (not just during an active scroll gesture), which is the exact behavior the user flagged as unwanted. This is a shared widget with 3 consumers (`material_group_form.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart`) — the `Scrollbar` was a pure visual affordance with no functional role beyond what `SingleChildScrollView` already provides on its own.

## 3. Fix

- **`material_group_filter_page.dart`** (`_optionsFor()`) — changed `const _ParentGroupOption(null, '--')` to `_ParentGroupOption(null, LocaleKeys.common_all.tr())` (dropped `const` since `.tr()` is not a compile-time constant). Reused the existing `common_all` locale key (`vi.json` = "Tất cả", `en.json` = "All") — no new locale entry added, per rules-mobile §4.1 (LocaleKeys mandatory, reuse existing key before adding new).
- **`dropdown_menu_widget.dart`** (shared widget, `build()`'s `menuChildren`) — removed the `Scrollbar(thumbVisibility: true, controller: scrollController, child: ...)` wrapper. The inner `SingleChildScrollView(controller: scrollController, ...)` is unchanged and still receives the same `scrollController`, so scrolling continues to work for a long option list — only the always-visible track/thumb is gone.

### Shared-Symbol Blast-Radius Gate (Part 2)

`grep -rln "DropdownMenuWidget(" lib/ui` confirmed exactly 3 consumers:

- `lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart`
- `lib/ui/inventory_catalog/widgets/material_group_form.dart`
- `lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart`

Removing `Scrollbar` is a pure visual change with no API surface change (no param added/removed, no default behavior toggle) and no functional impact — `SingleChildScrollView` alone still handles scroll input/output identically. All 3 consumers are therefore safe by construction; no call-site edits were needed or made.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | 1-line change: `_ParentGroupOption(null, '--')` → `_ParentGroupOption(null, LocaleKeys.common_all.tr())` (dropped `const`) |
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | Removed the `Scrollbar(thumbVisibility: true, ...)` wrapper around `menuChildren`'s `SingleChildScrollView`; scroll controller wiring unchanged |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_all_option_label_test.dart` | **New** — static-source-pin regression test, 2 cases (Part 1) |
| `mobile/gf-garage-app/test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` | Appended new `BUG-W03-080` test group, 2 widget-test cases (Part 2) — existing test groups untouched |

## 5. Regression / verification

- `material_group_filter_all_option_label_test.dart` (static-source-pin, same convention as the existing `material_group_filter_initial_value_test.dart`/`material_group_filter_sync_race_test.dart` in this suite — the page wires its cubit through getIt + AutoRoute, no DI-mocking widget-pump precedent):
  1. Source no longer contains `_ParentGroupOption(null, '--')`.
  2. Source contains `_ParentGroupOption(null, LocaleKeys.common_all.tr())`.
- `dropdown_menu_widget_test.dart` new `BUG-W03-080` group (real widget tests, following the existing `host()`/`hostSelected()`/`hostEnabled()` harness pattern already in this file):
  1. Opening the menu (`tester.tap(find.byType(TextField))`) renders **no** `Scrollbar` widget (`find.byType(Scrollbar)` → `findsNothing`).
  2. With a 10-item `dataList` and an explicit `ScrollController`, the option list's `SingleChildScrollView` still has `controller` identical (`same()`) to the one passed in, and `scrollController.jumpTo(50)` successfully moves `scrollController.offset` to `50` — confirming scroll behavior survives the `Scrollbar` removal.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` → **OK, 0 anti-pattern hit** on both touched lib files.
- Brace/paren/bracket balance verified manually (Python count script) on all 4 touched files (2 lib + 2 test) — all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on PATH in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; `fvm`/`flutter`/`dart` all resolve to "command not found"). Both new/updated test files are static-correct: class/param names (`_ParentGroupOption`, `LocaleKeys.common_all`, `DropdownMenuWidget`, `SingleChildScrollView`, `Scrollbar`, `ScrollController`) were cross-checked against the real post-fix source before being written.
- KG update: **skipped** — this is a UI display-string + visual-affordance-only fix (no entity/event/permission schema change).

## 6. Non-goals / out of scope

- Did not touch any of the 3 `DropdownMenuWidget` call sites (`material_group_form.dart`, `material_group_filter_page.dart` beyond the unrelated Part-1 label change, `internal_product_filter_page.dart`) — the Scrollbar removal required no call-site changes per the Blast-Radius Gate analysis above.
- Did not add a new locale key — `common_all` already existed and is already used by the sibling `internal_product_filter_page.dart` for the identical UX slot.
- Did not touch `material_group_filter_sync_race_test.dart`'s local `_Option(null, '--')` harness class — that is a self-contained reconstruction of the page's (pre-Fix-080) `_syncTextController` logic for a different bug (BUG-W03-045) and never asserts on the `'--'` literal itself, so it is unaffected by this fix and was left untouched per the "existing tests: add only" scope rule.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — (1) `material_group_filter_page.dart` "all parent group" option label `'--'` → `LocaleKeys.common_all.tr()`; (2) shared `dropdown_menu_widget.dart` — removed `Scrollbar(thumbVisibility: true, ...)` wrapper, kept `SingleChildScrollView` for scroll behavior. Blast-Radius Gate confirmed 3 consumers, all safe by construction. 2 new/updated regression test files (4 cases total). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
