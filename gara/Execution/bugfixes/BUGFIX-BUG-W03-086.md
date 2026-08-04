# BUGFIX — BUG-W03-086

> Shared-widget Figma-fidelity finding on `SectionDivider` (`FEAT-CAT-PROD-LIST`) — the mobile-only remaining call site left un-migrated by `BUG-W03-077`.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`InternalProductListCard` (`lib/ui/inventory_catalog/widgets/internal_product_list_card.dart:57`) rendered its divider between the item-name row and the attribute grid via `const SectionDivider()` — no `height:` override — so it fell through to the shared widget's default `height: 6`. Live Figma re-fetch of the Product Card component (node `21526:43524`, divider child `21526:45258` "Line", file `5YU4H3iY726P8KNxI9oCYF`) confirms the real divider is a 1px hairline, color `#e8e8ea` (`NeutralColor.s100`), matching the divider already fixed on the sibling `GroupListCard` in `BUG-W03-077` (`group_list_card.dart:65`, `SectionDivider(height: 1)`, commit `f3330e71`).

`BUG-W03-077`'s fix added the optional `height` param to `SectionDivider` (default `6`, backward-compatible) and applied `height: 1` explicitly at `group_list_card.dart` and audited `material_group_detail_page.dart` (found already correct, left unchanged) — but `internal_product_list_card.dart`, despite sharing the exact same widget and the exact same Figma hairline treatment, was never migrated in that pass. This bug closes that gap.

The user-provided screenshot (`reports/screens/inventory/product/prd-list-has-data.png`) that prompted this report was itself a stale capture of the GRP-list screen (pre-`BUG-W03-077` fix, saved under the wrong folder) — not live evidence of the PROD-list card. The real defect was found by direct code + live-Figma audit of `internal_product_list_card.dart`, independent of that screenshot.

## 2. Root cause

- `SectionDivider` hardcodes `height: 6` as its default (`lib/ui/inventory/widgets/section_divider.dart:5`) — correct for consumers not yet audited against Figma, but wrong wherever the real spec calls for a 1px hairline.
- `internal_product_list_card.dart:57` called `const SectionDivider()` with no override, so it silently inherited the 6px default instead of the 1px hairline its Figma node specifies.
- Genuine **call-site defect** (per Shared-Symbol Blast-Radius Gate §3a) — the widget's default is unchanged and remains correct/unaudited-neutral for every other consumer; only this one call site needed the explicit override, exactly mirroring the `group_list_card.dart` precedent from `BUG-W03-077`.

## 3. Fix

- **`internal_product_list_card.dart:57`** — `const SectionDivider()` → `const SectionDivider(height: 1)`. Single-line, single-consumer change.
- No change to `section_divider.dart` — the shared widget's `height = 6` default is untouched (other unaudited consumers still rely on it).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | `SectionDivider()` → `SectionDivider(height: 1)` (line 57) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/internal_product_list_card_divider_bug_086_test.dart` | **New** — 1-case regression pinning `SectionDivider.height == 1` inside the rendered card, mirroring `group_list_card_divider_fontweight_bug_077_test.dart`'s pattern |

## 5. Shared-Symbol Blast-Radius Gate

- `grep -rn "SectionDivider(" lib` → 11 consumers unchanged in count (5 unaudited legacy `lib/ui/inventory/*` + 6 `inventory_catalog/*`, incl. this one). Only `internal_product_list_card.dart` changed.
- Every other consumer still calls `SectionDivider()`/`SectionDivider(verticalMargin: ...)` without `height:` → identical rendering to pre-fix, by construction (shared default `height = 6` untouched).
- This is a call-site opt-in (locus (a)), not a shared-contract change — no other consumer requires re-verification.

## 6. Regression / verification

- 1 new test case (`internal_product_list_card_divider_bug_086_test.dart`) — fail-before-fix / pass-after-fix, pins `SectionDivider.height == 1` at this card's render tree.
- `python3 scripts/check-mobile-canonical-primitives.py --file lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` (run from design-repo root) → `OK: 0 anti-pattern hit`.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain available in this environment (`which fvm flutter dart` → empty), consistent with `DEBT-W01-MOBILE-BUILD-ENV` and the precedent set by `BUGFIX-BUG-W03-060/069/077`. Manually reviewed for static correctness (single literal-argument change, brace/paren balance unaffected). TEST_GROUP to run `fvm flutter analyze lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` + `fvm flutter test test/ui/inventory_catalog/widgets/internal_product_list_card_divider_bug_086_test.dart` on a machine with the matching toolchain.
- KG update: **skipped** — pure UI token (divider height) fix, no entity/event/permission/API change.

## 7. Non-goals / out of scope

- Did not touch the 5 unaudited legacy `lib/ui/inventory/*` `SectionDivider` consumers, or `internal_product_detail_page.dart` / `add_material_group_page.dart` / `edit_material_group_page.dart` / `material_group_detail_page.dart` — none of those were flagged by the live Figma audit for this bug; out of scope.
- Did not audit the list-level separator (`Gap` between cards, not the `Divider` line inside the card) or `ListTabBarWidget`'s border — orchestrator audit confirmed both are correct, no action needed.
- Did not add a golden/alchemist visual test — followed the existing static-assertion test convention already established for sibling `internal_product_list_card_*_test.dart` / `group_list_card_*_test.dart` files, consistent with the mobile-toolchain-deferred environment.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `internal_product_list_card.dart:57` `SectionDivider()` → `SectionDivider(height: 1)`, completing the `BUG-W03-077` hairline migration for the one call site that pass missed. 1 new regression test file. `check-mobile-canonical-primitives.py` → 0 hit. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
