# BUGFIX — BUG-W03-083

> GRP filter's "Thuộc nhóm" field label used `AppTextStyle.textBodyB5` (14px Medium/500) — live Figma re-verify confirms `AppTextStyle.textSubtitleS5` (14px SemiBold/600). Same bug class confirmed on PROD filter's "Tính chất"/"Nhóm hàng" labels via a second, independent live Figma node. Both filter pages' "Thiết lập lại" footer button were also missing the `#eaeaea` secondary-color override already established by BUG-W03-071 for the GRP Detail/Edit/Add footers.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User report: "Thuộc nhóm cũng đang sai size" (GRP filter page). Live re-fetch of Figma node `21252:49574` (file `5YU4H3iY726P8KNxI9oCYF`, "Bộ lọc nhóm vật tư hàng hóa - Default") confirmed the "Thuộc nhóm" label binds `font-['Inter:Semi_Bold'] font-semibold text-[14px]` — `Subtitle/S5` (14px SemiBold/600) — while `material_group_filter_page.dart` used `AppTextStyle.textBodyB5` (14px Medium/500). Same font size, wrong weight — visually distinct enough that the user described it as "sai size".

The PROD filter (`internal_product_filter_page.dart`, "Tính chất" + "Nhóm hàng" labels) used the identical `textBodyB5` token. Rather than assume the same fix applied blindly, this cycle independently live-fetched the PROD filter's own Figma node (`21235:25937`, "Bộ lọc sản phẩm - Default", same file) and confirmed both labels there also bind `Subtitle/S5` — same convention, confirmed not assumed.

The same 2 live fetches also confirmed the "Thiết lập lại" footer button in both pages binds `bg-[#eaeaea]` + text `#273243` — the exact same "Dark/100" token BUG-W03-071 already added to `app_colors.dart` (`AppColors.buttonBackgroundSecondaryStrong` / `buttonContentSecondaryStrong`) for the GRP Detail/Edit/Add footers, but explicitly left un-wired on these 2 filter pages because they were "not re-audited" at the time (see `BUGFIX-BUG-W03-071.md` §7 residual risk). This bug is that flagged follow-up audit, now confirmed for both filter pages.

## 2. Root cause

- **Label weight**: `material_group_filter_page.dart` and `internal_product_filter_page.dart` field labels were written using `AppTextStyle.textBodyB5` instead of `AppTextStyle.textSubtitleS5` — both tokens share the same 14px size / 20px line-height, differing only in `fontWeight` (Medium/500 vs SemiBold/600), which made the discrepancy easy to miss without a live Figma binding check (§9.11 LL-MOB-011 class: claim not `_png_verified`-pinned = untrusted until independently re-verified).
- **Footer color**: BUG-W03-071's Shared-Symbol Blast-Radius Gate deliberately left these 2 filter-footer "Thiết lập lại" buttons on the shared default (`AppColors.buttonBackgroundSecondary` / `#F3F3F4`) because it had no Figma confirmation for them at the time — a residual-risk gap by design, not an oversight, explicitly flagged for a future audit.

## 3. Fix

**Live Figma re-verification (mandatory per this bug's instructions, done before any edit):**

- Node `21252:49574` (GRP filter, `5YU4H3iY726P8KNxI9oCYF`) — re-fetched via `mcp__plugin_figma_figma__get_design_context`. Confirms: "Thuộc nhóm" label = `font-['Inter:Semi_Bold'] font-semibold text-[14px]` color `#273243` (`Subtitle/S5`); footer "Thiết lập lại" = `bg-[#eaeaea]` text `#273243` (font-bold 16px, unrelated to this fix's scope — footer text weight/size is unchanged, only the background/content color params are wired).
- Node `21235:25937` (PROD filter, same file, "Bộ lọc sản phẩm - Default") — independently re-fetched. Confirms: BOTH "Tính chất" and "Nhóm hàng" labels = `font-['Inter:Semi_Bold'] font-semibold text-[14px]` color `#273243` (`Subtitle/S5`); footer "Thiết lập lại" = `bg-[#eaeaea]` text `#273243` — identical to the GRP node.

**Changes (call-site only — no shared widget/token change, both already exist from BUG-W03-071):**

1. `material_group_filter_page.dart` — "Thuộc nhóm" label `style:` changed `AppTextStyle.textBodyB5` → `AppTextStyle.textSubtitleS5`.
2. `internal_product_filter_page.dart` — "Tính chất" (`catProd_type`) and "Nhóm hàng" (`catGrp_titleShort`) label `style:` both changed `AppTextStyle.textBodyB5` → `AppTextStyle.textSubtitleS5`.
3. `material_group_filter_page.dart` — "Thiết lập lại" `BottomActionButtonConfig(isPrimary: false)` gained `secondaryBackgroundColor: AppColors.buttonBackgroundSecondaryStrong, secondaryContentColor: AppColors.buttonContentSecondaryStrong`.
4. `internal_product_filter_page.dart` — same override wired onto its "Thiết lập lại" `BottomActionButtonConfig`.

No new tokens, no shared-widget change — `AppColors.buttonBackgroundSecondaryStrong`/`buttonContentSecondaryStrong` and the `BottomActionButtonConfig.secondaryBackgroundColor`/`secondaryContentColor` optional params were all added by BUG-W03-071 and are reused verbatim. `app_colors.dart` and `bottom_navigation_bar_button.dart` are untouched.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | "Thuộc nhóm" label `textBodyB5` → `textSubtitleS5`; "Thiết lập lại" `BottomActionButtonConfig` wired to the 2 existing override params. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | "Tính chất" + "Nhóm hàng" labels `textBodyB5` → `textSubtitleS5`; "Thiết lập lại" `BottomActionButtonConfig` wired to the 2 existing override params. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_label_weight_bug_083_test.dart` | **New** — static source-pin: GRP filter label uses `textSubtitleS5`, not `textBodyB5`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_label_weight_bug_083_test.dart` | **New** — static source-pin: PROD filter's 2 labels use `textSubtitleS5`, not `textBodyB5`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter_footer_secondary_color_bug_083_test.dart` | **New** — static source-pin: both filter pages' "Thiết lập lại" button wire `secondaryBackgroundColor`/`secondaryContentColor` to the Strong tokens. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_footer_secondary_color_bug_071_test.dart` | **Updated** — the group "unconfirmed consumers stay on the shared default" (2 tests asserting the 2 filter pages did NOT wire `secondaryBackgroundColor`/`secondaryContentColor`) is renamed to "follow-up-confirmed consumers now opt into the strong secondary override" and its 2 assertions flipped `isFalse` → `isTrue`, cross-referencing this bug. See §5 for why this is not a "weaken a test to hide a bug" edit. |

**Don't-touch respected**: `app_colors.dart`, `bottom_navigation_bar_button.dart` untouched (`git diff` 0 lines). No `git commit`/push.

## 5. Note on updating an existing test (BUG-W03-071's regression file)

`material_group_footer_secondary_color_bug_071_test.dart` originally asserted the 2 filter-footer "Thiết lập lại" buttons did **not** contain `secondaryBackgroundColor`/`secondaryContentColor`, because BUG-W03-071's Blast-Radius Gate had no Figma confirmation for them and explicitly deferred that decision ("left on the shared default per the Blast-Radius Gate's 'don't change what you haven't verified' rule... flag for a future targeted Figma audit" — `BUGFIX-BUG-W03-071.md` §7). This bug (BUG-W03-083) **is** that flagged future audit, and its 2 independent live Figma fetches now confirm the token does apply. The old assertion encoded an explicitly-provisional "not yet confirmed" state, not a fixed business rule — leaving it unchanged after the underlying assumption was superseded would create a hard, permanent test-suite contradiction against the very fix this bug requires. The 2 assertions were flipped from `isFalse` to `isTrue` with a cross-reference comment; no test was deleted or weakened to mask a defect — the opposite: coverage now asserts the newly-confirmed, more-complete correct state.

## 6. Blast-radius verification

- `grep -rn "isPrimary: false" lib/ui` before/after this fix: same 8 lines match (parameter addition doesn't remove `isPrimary: false` from any call site) — no new/removed consumers.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` on both touched lib files: `material_group_filter_page.dart` → 0 hit; `internal_product_filter_page.dart` → 0 hit.
- Brace/paren/bracket balance (Python count script) on both touched lib files + all 4 touched/new test files: all balanced.
- Concurrent-session note: BUG-W03-082 (a separate, concurrently-running FIX cycle — dropdown sync + Apply/Reset dirty-gating state-management logic) is editing these same 2 page files simultaneously on disjoint lines (field declarations / `initState`/`_sync*TextController` bodies). Re-verified after each observed working-tree change mid-cycle that this fix's own lines (label `style:` + footer `BottomActionButtonConfig` params) remained intact and that `check-mobile-canonical-primitives.py` + brace/paren/bracket balance stayed clean on the latest snapshot each time — no interaction with this fix's scope.

## 7. Regression / verification

- **Label weight** (`material_group_filter_label_weight_bug_083_test.dart`, `internal_product_filter_label_weight_bug_083_test.dart`): static source-pin regex confirming each of the 3 labels (GRP "Thuộc nhóm"; PROD "Tính chất", "Nhóm hàng") is wired to `AppTextStyle.textSubtitleS5` and that `textBodyB5` no longer appears for those specific `Text(...)` calls. All 3 regex patterns were dry-run against the actual post-fix source in Python before being written into the Dart test files, confirming they match.
- **Footer color** (`material_group_filter_footer_secondary_color_bug_083_test.dart`): static source-pin regex confirming both filter pages' "Thiết lập lại" `BottomActionButtonConfig(isPrimary: false, ...)` block wires `secondaryBackgroundColor: AppColors.buttonBackgroundSecondaryStrong` + `secondaryContentColor: AppColors.buttonContentSecondaryStrong`. Same dry-run-before-write discipline applied.
- **Build/analyze/test DEFERRED**: no Flutter toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle). TEST_GROUP on a machine with the toolchain should run:
  ```
  fvm flutter analyze lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart
  fvm flutter test test/ui/inventory_catalog/material_group_filter/material_group_filter_label_weight_bug_083_test.dart test/ui/inventory_catalog/internal_product_filter/internal_product_filter_label_weight_bug_083_test.dart test/ui/inventory_catalog/material_group_filter_footer_secondary_color_bug_083_test.dart test/ui/inventory_catalog/material_group_footer_secondary_color_bug_071_test.dart
  ```
- Golden (alchemist) vs oracle not attempted in this env (same DEBT) — substituted with static source-pin assertions above, consistent with the carve-out already used by prior W03 mobile FIX cycles in this same environment.

## 8. Residual risk / follow-up

- `test/ui/inventory_catalog/internal_product_filter/internal_product_filter_fidelity_test.dart` (BUG-W03-031) contains a test named "field labels use AppTextStyle.textBodyB5 token, not default Text style" that asserts against a **self-contained local mock widget** (`_FilterFieldsHost`, defined inside that same test file) rather than the real page source — it does not read the real page file, so it is unaffected by (and will continue to pass after) this fix, but its mock now diverges from the real page's corrected `textSubtitleS5` styling. Left untouched per this cycle's Forbidden Actions (only ADD regression tests, don't modify unrelated existing test logic) since it is not a hard conflict (the test still passes) — flagged here for a future cleanup pass to either delete the now-redundant assertion or update the mock to match current fidelity, so a future reader doesn't mistake it for live coverage of the real page's typography.
- Both filter pages' footer button *text* weight/size (Bold 16px per the live Figma fetch) was not part of this bug's scope and was not touched — out of scope per the bug's explicit Fix 1/Fix 2 boundaries.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — 2 independent live Figma re-verifications (GRP node 21252:49574 + PROD's own node 21235:25937) confirm label weight (`textBodyB5`→`textSubtitleS5`) and footer secondary-button color (`buttonBackgroundSecondaryStrong`/`buttonContentSecondaryStrong`, reusing BUG-W03-071 tokens) on both filter pages; updates 2 now-superseded assertions in the BUG-W03-071 regression file. |
