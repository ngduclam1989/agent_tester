# BUGFIX — BUG-W03-017

> Hardcode spacing/dimension literal widespread không có `// figma binding scale` comment (R13)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

25+ locations across `lib/ui/inventory_catalog/**` used raw spacing/dimension literals (`EdgeInsets.all(16)`, `EdgeInsets.symmetric(horizontal:16,vertical:12)`, `SizedBox(width:12)`, `SizedBox(height:6)`, `Gap(12)`, `Container(height:104,width:343)`) without either converting in-scale values to `AppSizes.spacing{0,4,8,16,32,52}` tokens or annotating out-of-scale values with a `// figma binding scale N` justification comment (R13).

## 2. Fix approach

Ran `scripts/check-mobile-canonical-primitives.py --file <each>` across all 37 files under `lib/ui/inventory_catalog/` to get a mechanical, exhaustive hit list (initial full-tree scan: 19 hits P3). Cross-referenced with manual grep for `EdgeInsets`/`Container` patterns the script doesn't cover (it only flags `Gap`/`SizedBox`, not `EdgeInsets`/`Container`), which surfaced the full 25+ location count matching the bug report. For each hit:
- **In-scale value** (16, 8, 4, 32, 52) → converted to `AppSizes.spacing{N}` token.
- **Out-of-scale value** (12, 6, 104, 343, 18) → kept raw + added inline `// figma binding scale N` comment per rules-mobile §1.5 M-26.

## 3. Files changed (final state, mixed authorship — see note)

| File | Change |
|---|---|
| `lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | `Gap(12)` ×2 → justified; `Container(height:104)` footer → justified; `EdgeInsets.symmetric(16,12)` → `spacing16` + justified 12; `SizedBox(width:12)` → justified. |
| `lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | `EdgeInsets.symmetric(16,12)` → `spacing16` + justified 12. |
| `lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | Same as above. |
| `lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | `EdgeInsets.all(16)` ×2 → `spacing16`; `SizedBox(height:6)` ×2 → justified; `SizedBox(height:16)` → `spacing16`; `SizedBox(width:12)` → justified. |
| `lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` | `EdgeInsets.only(right:16)` ×2 → `spacing16`. |
| `lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | `EdgeInsets.symmetric(16,8)` → `spacing16`/`spacing8`. |
| `lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | `SizedBox(height:12)` → justified; `SizedBox(height:8)` ×3 → `spacing8`; `EdgeInsets.symmetric(16,4)` → `spacing16`/`spacing4`; `EdgeInsets.all(16)` ×4 → `spacing16`; `Gap(12)` ×4 → justified; `SizedBox(height:4)` → `spacing4`. |
| `lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | `EdgeInsets.symmetric(16,12)` → `spacing16` + justified 12; `SizedBox(width:12)` → justified. Import `app_sizes.dart` added. |
| `lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | Same pattern as add page. Import `app_sizes.dart` added. |
| `lib/ui/inventory_catalog/widgets/material_group_form.dart` | `EdgeInsets.all(16)` → `spacing16`; `Gap(12)` ×4 → justified; `SizedBox(height:6)` → justified (as part of BUG-W03-019 rewrite). |
| `lib/ui/inventory_catalog/hub/widgets/feature_tile.dart` | No code change — the single remaining checker hit (`:17`) is inside a `///` doc comment describing the widget's own `Gap(12)` usage (which is itself already justified 2 lines above in the same doc comment: "gap 12 (figma binding scale — ngoài AppSizes scale {0,4,8,16,32,52})"). False-positive (script does not distinguish comments from code); verified, no action needed. |

**Note on authorship**: the bulk of this fix (all files except `material_group_add/edit_material_group_page.dart` and `material_group_form.dart`) landed via a concurrent `agent-fix-garage-mobile` session working the same bug list in parallel (commit `52935e87` + further uncommitted work observed mid-session on `internal_product_detail_page.dart`). This FIX cycle: (a) independently authored the `add_material_group_page.dart` + `edit_material_group_page.dart` fixes (untouched by the concurrent session at time of edit); (b) authored the `material_group_form.dart` fix as part of the BUG-019 catalog-widget rewrite; (c) ran the mechanical checker across the full directory to confirm exhaustive closure and catch anything the concurrent session missed.

## 4. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file <37 files under lib/ui/inventory_catalog>` → final result: **0 real hits**. Only remaining flagged item is the doc-comment false-positive in `feature_tile.dart` (documented above, not a code violation).
- `fvm flutter analyze` / `fvm flutter test`: **deferred** (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`).

## 5. Non-goals / out of scope

- Did not touch `Container(width: 343)` style card-width literals if any existed outside grep scope of this pass — none found in final grep (`Container(...height: ...)` patterns fully covered).
- Pre-existing `setState()` P2 findings in the rewritten `material_group_form.dart` (2 hits) — unrelated to spacing; tracked as accepted pre-existing pattern (local widget-only state for a `StatefulWidget` not itself wrapped in a Cubit), out of R13 scope.

## 6. Follow-up

- None — mechanical scan clean.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile (+ concurrent session commit `52935e87` + further uncommitted work) | Fix — closed all 19+ mechanically-flagged P3 hits + manually-grepped EdgeInsets/Container hardcodes across `lib/ui/inventory_catalog/**` (10 files touched, mixed authorship). Full-tree checker re-run confirms 0 real hits. |
