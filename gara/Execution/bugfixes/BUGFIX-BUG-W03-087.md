# BUGFIX — BUG-W03-087

> Shared-widget Figma-fidelity finding on `SectionDivider` (`FEAT-CAT-PROD-DETAIL`) — the last remaining call site deliberately deferred out of scope by `BUG-W03-073`.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`InternalProductDetailPage` (`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`) renders 4 cards — `_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard` — each with a `const SectionDivider()` call between its section title and its content (lines 176, 215, 274, 312). None of the 4 calls carried a `height:` override, so all 4 fell through to the shared widget's default `height: 6`. Live Figma re-fetch (node `21526:45088`, file `5YU4H3iY726P8KNxI9oCYF`) confirms all 4 divider children are "Line" nodes (`height="0"` hairline vector), `get_design_context` renders `inset-[-1px_0_0_0]` = 1px, color `#e8e8ea` — the same hairline treatment already migrated for the sibling `InternalProductListCard` in `BUG-W03-086` and `GroupListCard` in `BUG-W03-077`.

This exact gap had already been surfaced once, by `BUG-W03-073`'s own audit of this same page, which explicitly noted: *"SectionDivider widget dùng chung ... render dày 6px thay vì hairline ~1px như Figma Line node — ra ngoài scope page-specific fix này"* — i.e. flagged and deliberately deferred, not missed. This bug closes that deferred gap, completing the 3-part `SectionDivider` hairline migration started by `BUG-W03-077` (GRP list card + shared-widget param) and continued by `BUG-W03-086` (PROD list card).

## 2. Root cause

- `SectionDivider` hardcodes `height: 6` as its default (`lib/ui/inventory/widgets/section_divider.dart:5`) — correct for consumers not yet audited against Figma, wrong wherever the real spec calls for a 1px hairline.
- All 4 card widgets in `internal_product_detail_page.dart` called `const SectionDivider()` with no override, so each silently inherited the 6px default instead of the 1px hairline the shared Figma node specifies.
- Genuine **call-site defect** (per Shared-Symbol Blast-Radius Gate §3a) — the widget's default is unchanged and remains correct/unaudited-neutral for every other consumer; only these 4 call sites (all within the same page) needed the explicit override.

## 3. Fix

- **`internal_product_detail_page.dart`** — all 4 `const SectionDivider()` calls (lines 176, 215, 274, 312, one per card) → `const SectionDivider(height: 1)`.
- No change to `section_divider.dart` — the shared widget's `height = 6` default is untouched (other unaudited consumers still rely on it).
- **Cascade to 2 pre-existing regression tests**: `internal_product_detail_bug_053_test.dart` and `internal_product_detail_bug_073_test.dart` each hard-pinned the literal `SectionDivider()` (bare, no arguments) via regex/`String.contains` — 4-occurrence-count assertions plus one gap-pattern assertion in the 073 test. Since the corrected source no longer contains that literal anywhere, these assertions were updated in place to the new correct literal `SectionDivider(height: 1)`, keeping the same strictness (still asserting exactly 4 occurrences / the same gap structure) — not weakened. This mirrors the established precedent of `BUG-W03-068`, which updated the same page's `internal_product_detail_card_decoration_test.dart` radius-literal assertion in place (`8` → `12`) when a later live-Figma correction changed the correct value.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | 4× `SectionDivider()` → `SectionDivider(height: 1)` (lines 176, 215, 274, 312) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_053_test.dart` | Updated 2 literal-pinning assertions (`SectionDivider()` → `SectionDivider(height: 1)`) to track the corrected source; added a header-comment cross-reference to BUG-W03-087 |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_073_test.dart` | Updated 2 literal-pinning assertions (count regex + divider-gap regex) to the corrected `SectionDivider(height: 1)` literal; added a header-comment cross-reference to BUG-W03-087 |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_087_test.dart` | **New** — static-source-assertion regression test: pins all 4 dividers at `height: 1`, asserts no bare `SectionDivider()` remains, and pins the shared widget's `height: 6` default is untouched |

## 5. Shared-Symbol Blast-Radius Gate

- `SectionDivider` remains an >1-consumer shared widget (11 consumers per the `BUG-W03-086` count — 5 unaudited legacy `lib/ui/inventory/*` + 6 `inventory_catalog/*`, this page contributing 4 of the 6). Only `internal_product_detail_page.dart`'s 4 call sites changed.
- Every other consumer still calls `SectionDivider()`/`SectionDivider(verticalMargin: ...)` without `height:` → identical rendering to pre-fix, by construction (shared default `height = 6` untouched).
- This is a call-site opt-in (locus (a)), not a shared-contract change — no other consumer requires re-verification.

## 6. Regression / verification

- 1 new regression test file (`internal_product_detail_bug_087_test.dart`, 3 cases) — fail-before-fix / pass-after-fix, pins `SectionDivider(height: 1)` at all 4 card sites, pins no bare `SectionDivider()` remains, and pins the shared widget's untouched `height: 6` default.
- 2 pre-existing regression tests updated in place (`internal_product_detail_bug_053_test.dart`, `internal_product_detail_bug_073_test.dart`) to track the corrected literal — see §3 for rationale (mirrors `BUG-W03-068` precedent, not a weakening).
- `python3 scripts/check-mobile-canonical-primitives.py --file internal_product_detail_page.dart` (run from design-repo root) → `OK: 0 anti-pattern hit`.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain available in this environment (`which fvm flutter dart` → empty), consistent with `DEBT-W01-MOBILE-BUILD-ENV` and the precedent set by `BUGFIX-BUG-W03-060/069/077/086`. Manually reviewed for static correctness (4 literal-argument changes + brace/paren balance verified). TEST_GROUP to run `fvm flutter analyze lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` + `fvm flutter test test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_{053,073,087}_test.dart` on a machine with the matching toolchain.
- KG update: **skipped** — pure UI token (divider height) fix, no entity/event/permission/API change.

## 7. Non-goals / out of scope

- Did not touch the shared `SectionDivider` widget's default (`height: 6`) — other unaudited consumers (5 legacy `lib/ui/inventory/*` files) are untouched, per Shared-Symbol Blast-Radius Gate.
- Did not re-audit `group_list_card.dart` / `internal_product_list_card.dart` / `material_group_detail_page.dart` — already fixed/verified correct by `BUG-W03-077`/`BUG-W03-086`, out of this bug's scope.
- Did not add a golden/alchemist visual test — followed the existing static-assertion test convention already established for this exact page (`internal_product_detail_bug_034/053/073_test.dart`), consistent with the mobile-toolchain-deferred environment and the private-class constraint (`_HeaderCard` et al. are library-private, precluding a widget-tree pump without new DI-mocking infrastructure this suite doesn't otherwise use).
- `BUG-W03-088` (a new, unrelated P1 `garage-mobile` bug) landed concurrently in `Tracking/WAVE03/BUGS.md` mid-cycle — out of this bug's scope, left `OPEN` for its own FIX cycle.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — 4× `SectionDivider()` → `SectionDivider(height: 1)` across `_HeaderCard`/`_GeneralInfoCard`/`_TechnicalSpecCard`/`_SpecDescriptionCard` in `internal_product_detail_page.dart`, completing the `BUG-W03-077`→`BUG-W03-086`→`BUG-W03-087` hairline migration (last call site, deliberately deferred by `BUG-W03-073`). 1 new regression test file + 2 pre-existing literal-pinning tests updated in place (mirrors `BUG-W03-068` precedent). `check-mobile-canonical-primitives.py` → 0 hit. `flutter analyze`/`flutter test` DEFERRED (no toolchain).
