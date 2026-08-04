# BUGFIX — BUG-W03-073

> `InternalProductDetailPage` loaded-state 4-card Column had NO outer padding (cards flush against screen edges + AppBar) + all 8 gap positions around `SectionDivider()` (2 per card × 4 card) used the wrong 8px spacing instead of Figma's uniform 12px.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Two independent Figma-fidelity gaps in
`lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart`, found
by orchestrator live Figma audit (`get_metadata`/`get_design_context` on node `21526:45088`,
file `5YU4H3iY726P8KNxI9oCYF`, fresh re-fetch) AFTER the BUG-W03-053 rewrite had already landed
a large fidelity pass on this same file:

1. **Missing 16px outer padding.** `_buildContent`'s loaded-state branch returned
   `SingleChildScrollView(child: Column(children: [4 cards]))` with no `Padding`/`EdgeInsets`
   wrapping the Column at all — cards rendered flush against the left/right screen edges and
   directly under the `AppBar` (no gap). Figma's `DetailContent` wrapper (node `21526:45089`)
   has `p-[16px]` on all 4 sides. The loading-skeleton branch of the same method (`_SkeletonBox`
   consumers) already applied `EdgeInsets.symmetric(horizontal: AppSizes.spacing16, ...)` —
   confirming the loaded-content path's omission was a real gap, not an intentional design
   choice (cross-checked against `material_group_detail_page.dart`, which correctly wraps its
   content sections in 16px horizontal padding).
2. **Wrong gap around `SectionDivider` (8px instead of 12px), all 4 cards.** Every card
   (`_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`) used
   `Gap(AppSizes.spacing8)` immediately before AND after its `const SectionDivider()` — 8
   locations total. Figma confirms every card's inner content is a `flex-col` container with a
   uniform `gap-[12px]` applied to ALL children (title/header → divider → attribute rows), not
   just some. The codebase already had a correct precedent for this exact "raw 12, no
   `AppSizes` token" case at 2 other spots in the same file (`Gap(12) // figma binding scale 12
   — no exact AppSizes match`, between the 2 `AttributesFieldRow`s in `_GeneralInfoCard` and
   `_SpecDescriptionCard`) — only the 8 divider-adjacent positions had been left at the wrong
   8px value.

Pre-existing context: this file had an **uncommitted** working-tree change from a prior
session (BUG-W03-068 — card `borderRadius` 8→12 across all 4 cards, already verified correct
against live Figma) at the time this fix cycle started. That change was **not** reverted or
disturbed — it is orthogonal (border radius vs. padding/gap) and was re-verified intact after
this fix (see §4).

## 2. Root cause

1. The outer `Padding` wrap was simply never authored for the loaded-content branch during the
   BUG-W03-053 rewrite — that rewrite focused on card *content* (field set, ordering, labels)
   and card *decoration* (added in the earlier BUG-W03-034 pass), not the page-level scroll
   container's own padding. The loading skeleton got its padding from a different code path
   (`_SkeletonBox`'s own `build()`), so the asymmetry between loading/loaded states was never
   caught by a side-by-side comparison.
2. The 8 `Gap(AppSizes.spacing8)` positions around `SectionDivider` were carried over unchanged
   from an earlier iteration of the page (predating the current card layout) — when the
   flex-col `gap-[12px]` binding was later correctly identified and pinned as `Gap(12)` between
   the 2 `AttributesFieldRow`s in 2 of the 4 cards (a different, non-adjacent-to-divider spot),
   the same audit did not re-check the divider-adjacent gaps for the same binding, leaving them
   stale at the old 8px value.

## 3. Fix

`internal_product_detail_page.dart`:

```dart
// Before (bug): no outer padding, trailing Gap(16) compensating for it
return SingleChildScrollView(
  physics: const AlwaysScrollableScrollPhysics(),
  child: Column(
    children: [
      _HeaderCard(detail: detail),
      Gap(AppSizes.spacing8),
      _GeneralInfoCard(detail: detail),
      Gap(AppSizes.spacing8),
      _TechnicalSpecCard(detail: detail),
      Gap(AppSizes.spacing8),
      _SpecDescriptionCard(detail: detail),
      Gap(AppSizes.spacing16),
    ],
  ),
);

// After (fix): Padding(EdgeInsets.all(16)) wraps the whole card stack
return SingleChildScrollView(
  physics: const AlwaysScrollableScrollPhysics(),
  child: Padding(
    padding: const EdgeInsets.all(AppSizes.spacing16),
    child: Column(
      children: [
        _HeaderCard(detail: detail),
        Gap(AppSizes.spacing8),
        _GeneralInfoCard(detail: detail),
        Gap(AppSizes.spacing8),
        _TechnicalSpecCard(detail: detail),
        Gap(AppSizes.spacing8),
        _SpecDescriptionCard(detail: detail),
      ],
    ),
  ),
);
```

The trailing `Gap(AppSizes.spacing16)` that previously sat after the last card was **removed**
— it existed to give the scroll content some bottom whitespace in the absence of any outer
padding; keeping it alongside the new `EdgeInsets.all(16)` bottom padding would have produced a
32px bottom gap instead of Figma's 16px. Figma's `DetailContent` wrapper padding is uniform on
all 4 sides (`EdgeInsets.all`, not `symmetric`) — confirmed live against node `21526:45089`.

The 3 `Gap(AppSizes.spacing8)` **between** the 4 top-level cards (i.e. the spacing that
separates `_HeaderCard` from `_GeneralInfoCard`, etc.) are a **separate, unrelated** binding
from the divider gaps and were **not** touched — they remain `Gap(AppSizes.spacing8)`.

For each of the 4 card classes, both `Gap(AppSizes.spacing8)` positions immediately
surrounding `const SectionDivider()` were changed:

```dart
// Before
Gap(AppSizes.spacing8),
const SectionDivider(),
Gap(AppSizes.spacing8),

// After
Gap(12), // figma binding scale 12 — no exact AppSizes match
const SectionDivider(),
Gap(12), // figma binding scale 12 — no exact AppSizes match
```

Applied identically in `_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`,
`_SpecDescriptionCard` — 8 positions total, matching the exact comment convention already used
elsewhere in this file (between the 2 `AttributesFieldRow`s in `_GeneralInfoCard` and
`_SpecDescriptionCard`).

## 4. Blast radius

Single-consumer page (`InternalProductDetailPage` + its 4 private card classes are all
library-private to this one file) — no Shared-Symbol Blast-Radius Gate needed. No public
API/contract/event touched. No other screen imports these private classes.

Re-verified after the edit that the pre-existing, unrelated BUG-W03-068 `borderRadius`
8→12 fix (uncommitted at the start of this cycle) was not disturbed: all 4
`borderRadius: BorderRadius.circular(12)` occurrences still present, byte-for-byte unchanged
outside of the lines this fix touched (confirmed via `git diff` — the diff only shows the
`_buildContent` Padding wrap and the 8 `Gap` line changes, zero touches to any
`BoxDecoration`/`borderRadius` line).

## 5. Regression test

`test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_073_test.dart`
(new file, 7 cases, group `BUG-W03-073: internal_product_detail_page Figma fidelity`) —
consistent with the established convention for this page (no DI-mocking widget-tree-pump
precedent for this cubit/AutoRoute-wired page — see `internal_product_detail_card_decoration_test.dart`
BUG-W03-034, `internal_product_detail_bug_053_test.dart` BUG-W03-053), this test pins the fix
via static source assertion:

1. Loaded-state Column is wrapped in `Padding(padding: const EdgeInsets.all(AppSizes.spacing16), child: Column(...))`.
2. Loading skeleton still applies its own pre-existing horizontal-16 padding (unchanged, no regression).
3. Exactly 4 `SectionDivider()` usages remain (one per card).
4. All 4 `SectionDivider()` occurrences are immediately preceded and followed by
   `Gap(12), // figma binding scale 12 — no exact AppSizes match` (8 positions total, regex
   count == 4 card-pairs).
5. No `SectionDivider()` is still surrounded by the stale `Gap(AppSizes.spacing8)` pattern.
6. The 3 inter-card gaps (`_HeaderCard` → `_GeneralInfoCard` → `_TechnicalSpecCard` →
   `_SpecDescriptionCard`) remain `Gap(AppSizes.spacing8)`, unchanged — proves this fix did not
   touch the unrelated inter-card spacing.
7. Pre-existing BUG-W03-068 radius fix still intact: 4/4 `borderRadius: BorderRadius.circular(12)`.

All 7 assertions were independently re-derived and verified via an equivalent Python `re`
script run directly against the live source file before handoff (all 7 passed) — see
verification transcript in this cycle's session log. `python3
scripts/check-mobile-canonical-primitives.py --file internal_product_detail_page.dart` → **0
anti-pattern hits**.

`fvm flutter analyze` / `fvm flutter test` — **DEFERRED**. No Flutter toolchain available in
this sandbox environment (`DEBT-W01-MOBILE-BUILD-ENV`). Bracket-balance sanity check
(`(`/`)`, `{`/`}`, `[`/`]` counts) confirmed the edited source file has no unbalanced
delimiters introduced by this change.

## 6. Files changed

- `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` (fix)
- `test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_073_test.dart` (new regression test)

## 7. Residual risk / follow-up (not fixed, out of scope)

- `SectionDivider` (shared widget, `lib/ui/inventory/widgets/section_divider.dart`) renders at
  6px thickness instead of a Figma hairline (~1px). Flagged by the original bug report as a
  cross-cutting shared-widget issue, out of scope for this page-specific fix (multiple other
  consumers use this widget) — needs its own audit/CR if fixed globally.
- Build/test verification is deferred to `TEST_GROUP` on a machine with the Flutter 3.41
  toolchain (`DEBT-W01-MOBILE-BUILD-ENV`).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — outer 16px padding (all 4 sides) on loaded-state card stack + 8× `Gap(AppSizes.spacing8)` → `Gap(12)` around `SectionDivider` in all 4 cards. Regression test added, `flutter analyze`/`flutter test` deferred (no toolchain). |
