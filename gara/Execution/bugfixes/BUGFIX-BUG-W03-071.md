# BUGFIX — BUG-W03-071

> Shared 2-button footer (`BottomNavigationBarButton`/`BottomActionButtonConfig`): the secondary button ("Xoá"/"Huỷ" on GRP Detail/Edit/Add) rendered `buttonBackgroundSecondary` (`#F3F3F4`) + `textPrimary` (`#262626`) — 2 independent live Figma fetches confirm the real full-page footer token is `#EAEAEA` + `#273243`.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`'s `_buildButton()` hard-coded the `isPrimary: false` branch to `AppColors.buttonBackgroundSecondary` (`NeutralColor.s50` = `#F3F3F4`) + `AppColors.textPrimary` (`#262626`). Two independent live Figma fetches this session — node `21254:51661` (GRP Detail, `Product/ux/figma-mobile` scope) and node `21254:51963` (GRP Edit) both in file `5YU4H3iY726P8KNxI9oCYF` — confirmed the "Tab Button/2 Button/Default" component's secondary button binds `bg-[#eaeaea]` + text `#273243`, listed as a distinct named style dictionary entry ("Dark/100"). This is a **different** grey from the popup secondary token (`#f3f3f4`, already correctly verified for `ConfirmationDialog`/`AppDialog` via BUG-W03-052/063) — two separate design tokens for two separate contexts (popup vs full-page 2-button footer).

BUG-W03-061's original audit flagged this as P3 "low confidence" for GRP Detail alone (suspected the Figma MCP might be returning the default component instead of the instance override). This cycle's 2-node independent re-verification confirms it is real, not noise — raised to P2.

## 2. Root cause

- `BottomActionButtonConfig`/`BottomNavigationBarButton` (`lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart`) has always resolved the `isPrimary: false` background/content color to the single shared popup-secondary token (`buttonBackgroundSecondary`/`textPrimary`), because that pairing was correct for the widget's *original* context (dialog/popup secondary action, verified BUG-W03-063) and was carried forward unchanged when the widget was extended to also serve full-page 2-button footers (BUG-W03-039/061/062).
- No `AppColors` token exactly matching `#EAEAEA` existed before this fix — the nearest pre-existing value, `NeutralColor.s100` (`#E8E8EA`), is a different hex, not a match.

## 3. Fix (call-site-defect path — no shared default changed)

**Shared-Symbol Blast-Radius Gate (mandatory, symbol has >1 consumer):**

`grep -rn "isPrimary: false" lib/ui` enumerated 5 `BottomActionButtonConfig(isPrimary: false)` consumers pre-fix:

| Consumer | Figma confirmation for `#eaeaea`? | Action |
|---|---|---|
| `material_group_detail_page.dart` ("Xoá") | Yes — node `21254:51661` | Wired to new override |
| `edit_material_group_page.dart` ("Huỷ") | Yes — node `21254:51963` | Wired to new override |
| `add_material_group_page.dart` ("Huỷ") | Shares the Edit-frame Action bar layout | Wired to new override |
| `material_group_filter_page.dart` ("Đặt lại") | No (BUG-W03-039 filter footer, not audited this cycle) | **Untouched** — keeps shared default |
| `internal_product_filter_page.dart` ("Đặt lại") | No | **Untouched** — keeps shared default |

Plus 3 unrelated domain-forked legacy widgets also matched by the raw grep pattern (`lib/ui/booking/widgets/bottom_actions.dart`, `lib/ui/supplier/widgets/bottom_actions.dart`, `lib/ui/settlement/widgets/bottom_actions.dart`) — these use their own local `_ButtonData` class, **not** `BottomActionButtonConfig`, and are out of scope by construction.

Since only 3/5 `BottomActionButtonConfig` consumers have Figma confirmation, this is a **call-site-defect** fix (§Shared-Symbol Blast-Radius Gate decision tree, path (a)): add an opt-in override defaulting to the existing shared behavior, and wire only the 3 confirmed call sites. The shared default is **not** changed.

**Changes:**

1. `lib/core/common/styles/app_colors.dart` — added 2 new semantic tokens next to the existing `button*` group:
   ```dart
   /// Secondary button variant for full-page 2-button footers (Figma
   /// "Dark/100" style token). Distinct from [buttonBackgroundSecondary]
   /// (used by popup/dialog secondary actions) — do not merge the two.
   static const Color buttonBackgroundSecondaryStrong = Color(0xFFEAEAEA);
   static const Color buttonContentSecondaryStrong = NeutralColor.s900;
   ```
   `NeutralColor.s900` already equals `#273243` exactly (pre-existing palette value, no new raw literal needed for the text color). `#EAEAEA` has no existing palette-scale match (nearest is `NeutralColor.s100 = #E8E8EA`, a different hex), so it is added as a raw literal directly in `app_colors.dart` — consistent with this file's own established convention for values with no scale match (e.g. `textPrimary = Color(0xFF262626)`, `bgDialogPrimary = Color(0xFFF4F7FE)`).

2. `lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart` — extended `BottomActionButtonConfig` with 2 optional, backward-compatible params:
   ```dart
   final Color? secondaryBackgroundColor; // null (default) = unchanged behavior
   final Color? secondaryContentColor;    // null (default) = unchanged behavior
   ```
   `_buildButton()`'s `isPrimary: false` branch now resolves `data.secondaryBackgroundColor ?? AppColors.buttonBackgroundSecondary` / `data.secondaryContentColor ?? AppColors.textPrimary` — every consumer that does not pass the new params keeps byte-for-byte the same resolved colors as before.

3. Wired the override at the 3 confirmed call sites only:
   - `material_group_detail_page.dart` — `_DetailFooter`'s "Xoá" `BottomActionButtonConfig`.
   - `edit_material_group_page.dart` — `_buildFooter()`'s "Huỷ" `BottomActionButtonConfig`.
   - `add_material_group_page.dart` — `_buildFooter()`'s "Huỷ" `BottomActionButtonConfig`.

   Each now passes `secondaryBackgroundColor: AppColors.buttonBackgroundSecondaryStrong, secondaryContentColor: AppColors.buttonContentSecondaryStrong`.

4. Updated the stale inline comments at the 3 call sites that previously claimed the secondary path "uses the same tokens the old hand-rolled footer used" (no longer true post-fix) and fixed a pre-existing canonical-primitives false-positive: the edit/add footer comments literally contained the text `SizedBox(width: 12)` (inside prose, not code), which the `Color(0xFF...)`-adjacent spacing-literal regex in `check-mobile-canonical-primitives.py` matched as a P3 hit — reworded to "a 12px-wide SizedBox" (no digit immediately after `width:`), clearing the false positive as a side effect of touching that exact comment block.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/common/styles/app_colors.dart` | **+2 tokens**: `buttonBackgroundSecondaryStrong` (`Color(0xFFEAEAEA)`), `buttonContentSecondaryStrong` (`NeutralColor.s900`). |
| `mobile/gf-garage-app/lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart` | `BottomActionButtonConfig` gains optional `secondaryBackgroundColor`/`secondaryContentColor` (default `null`); `_buildButton()` uses `?? AppColors.buttonBackgroundSecondary` / `?? AppColors.textPrimary` fallback. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | "Xoá" `BottomActionButtonConfig` wired to the 2 new override params; stale comment corrected. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | "Huỷ" `BottomActionButtonConfig` wired to the 2 new override params; comment corrected (fixes a pre-existing canonical-primitives false positive). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | "Huỷ" `BottomActionButtonConfig` wired to the 2 new override params; comment corrected (fixes the same false positive). |
| `mobile/gf-garage-app/test/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button_test.dart` | **+group** "BUG-W03-071 — secondary background/content color override" (3 cases: default unchanged when not opted in, override applied when passed, `isPrimary: true` ignores the override). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_footer_secondary_color_bug_071_test.dart` | **New** — static source-pin regression: the 3 confirmed call sites wire both override params; the 2 unconfirmed filter-footer call sites contain neither param (blast-radius guard). |

**Don't-touch respected**: `material_group_filter_page.dart`, `internal_product_filter_page.dart`, and the 3 legacy `bottom_actions.dart` widgets (`booking/`, `supplier/`, `settlement/`) are untouched — `git diff` on all 5 confirms 0 lines changed. No `git commit`/`push`.

## 5. Blast-radius verification

- Pre-fix grep: `grep -rn "isPrimary: false" lib/ui` → 5 `BottomActionButtonConfig` consumers + 3 unrelated `_ButtonData` legacy widgets (listed in §3 table above).
- Post-fix grep: same command re-run — same 8 lines match (parameter addition doesn't remove `isPrimary: false` from any call site); `git diff` confirms 0 changed lines in the 2 filter pages and all 3 legacy `bottom_actions.dart` files.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` on all 5 touched lib files:
  - `bottom_navigation_bar_button.dart` → 0 hit.
  - `material_group_detail_page.dart` → 0 hit.
  - `edit_material_group_page.dart` → 0 hit (also cleared 1 pre-existing false-positive P3 hit from the stale `SizedBox(width: 12)` prose).
  - `add_material_group_page.dart` → 0 hit (same false-positive cleared).
  - `app_colors.dart` → 16 P2 hits (`Color(0xFF...)` literal), up from a **pre-existing baseline of 15** (unrelated to this fix — this file is itself the canonical location for raw literals with no palette-scale match, per its own established pattern of `textPrimary`/`textMutedForeground`/`bgDialogPrimary`/all of `PurpleColor.s*`; not a new violation class introduced by this fix).
- Brace/paren balance (manual grep count) on all 5 touched lib files + 2 touched/new test files: all balanced (see raw counts in the FIX cycle transcript; no mismatch found).

## 6. Regression / verification

- **Widget-level regression** (`bottom_navigation_bar_button_test.dart`, new group): (1) no override passed → `isPrimary: false` still resolves `AppColors.buttonBackgroundSecondary`/`AppColors.textPrimary` (guards the "don't change the shared default" invariant); (2) override passed → resolves the new `buttonBackgroundSecondaryStrong`/`buttonContentSecondaryStrong` values, explicitly asserted `isNot` the old default; (3) `isPrimary: true` ignores the override even if passed (guards against the override leaking into the primary-button branch).
- **Call-site regression** (new `material_group_footer_secondary_color_bug_071_test.dart`, static source pin — same strategy as `material_group_detail_fidelity_bug_061_test.dart`, since all 3 pages wire their cubit through getIt + AutoRoute + BasePage with no DI-mocking precedent in this suite): regex-pins the exact `isPrimary: false, secondaryBackgroundColor: AppColors.buttonBackgroundSecondaryStrong, secondaryContentColor: AppColors.buttonContentSecondaryStrong,` block in all 3 confirmed pages; asserts the 2 filter pages contain neither param string.
- **Build/analyze/test DEFERRED**: no Flutter toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle). TEST_GROUP on a machine with the toolchain should run:
  ```
  fvm flutter analyze lib/core/common/styles/app_colors.dart lib/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button.dart lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart
  fvm flutter test test/ui/widgets/bottom_navigation_bar_button/bottom_navigation_bar_button_test.dart test/ui/inventory_catalog/material_group_footer_secondary_color_bug_071_test.dart
  ```
- Golden (alchemist) vs oracle not attempted in this env (same DEBT) — substituted with the widget-property assertions above (background/content color exact-match), consistent with the carve-out already used by prior W03 mobile FIX cycles in this same environment.

## 7. Residual risk / follow-up

- `material_group_filter_page.dart` and `internal_product_filter_page.dart`'s "Đặt lại" secondary button (BUG-W03-039) were **not** re-audited against live Figma this cycle — they may or may not also need the `#eaeaea` token. Left on the shared default per the Blast-Radius Gate's "don't change what you haven't verified" rule. Flag for a future targeted Figma audit of the 2 filter-footer nodes if the same visual mismatch is reported there.
- Concurrent-session note: `material_group_detail_page.dart`'s unrelated `Gap(12)` → `Gap(20)` change (BUG-W03-070, a separate concurrent FIX cycle in the same session) landed in the working tree mid-cycle on lines disjoint from this fix's footer edit — re-verified `check-mobile-canonical-primitives.py` + brace/paren balance clean on the file after that external change, no interaction with this fix.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — root cause + call-site-defect fix + Shared-Symbol Blast-Radius Gate enumeration + regression + residual (2 independent live Figma fetches, closes BUG-W03-061's original P3 low-confidence flag as confirmed P2). |
