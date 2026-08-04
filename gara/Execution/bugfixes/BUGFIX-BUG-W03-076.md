# BUGFIX — BUG-W03-076

> Two-part live Figma re-audit finding on the GRP-list card (`FEAT-CAT-GRP-LIST`) and its PROD-list sibling: (1) the group/product code is missing its "#" literal prefix; (2) the "Thuộc nhóm" field icon substitute (`icClipboardTick`, chosen in `BUG-W03-069`) still doesn't match Figma's floppy-disk shape per user confirmation.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE (part 1) / not-swapped, documented (part 2)** · Date: 2026-07-02

## 1. Summary

Live Figma node `21235:29063` (file `5YU4H3iY726P8KNxI9oCYF`) renders the group/product code as 2 separate `<span>` elements inside the same `<p>`: `<span>#</span><span>IP-BP-0001</span>`. This confirms "#" is a UI-level literal prefix the frontend must add — it is not part of the `code` value returned by the backend. `GroupListCard` (`group_list_card.dart`) and `InternalProductListCard` (`internal_product_list_card.dart`) both rendered `<field>.code ?? '--'` directly, with no "#" prefix.

Separately, the user re-confirmed that the `icClipboardTick` icon substitute used for the "Thuộc nhóm" field (chosen in `BUG-W03-069` because no floppy-disk/save asset existed in `assets/icons/`) still doesn't visually match Figma's `vuesax/linear/floppy-disk` icon.

## 2. Root cause

- **"#" prefix**: `group.code`/`product.code` are rendered verbatim from the backend response with no UI-level formatting. The Figma binding's 2-span structure was not carried over when the card body was authored — the "#" literal was simply never added.
- **Icon**: `BUG-W03-069`'s root cause note already recorded that `assets/icons/` had zero floppy-disk/save assets at the time; `icClipboardTick` was picked as the closest existing asset by elimination, not by genuine shape match. The user's fresh visual QA pass confirms that elimination pick is still visually wrong.

## 3. Fix

- **`group_list_card.dart`** — `group.code ?? '--'` → `group.code != null ? '#${group.code}' : '--'`. The "#" is prefixed only when `code` is non-null; the `'--'` fallback for missing data is left as a plain dash with no "#" (no Figma reference exists for the null-code state — judgment call, documented here per the fix instructions).
- **`internal_product_list_card.dart`** — same change: `product.code ?? '--'` → `product.code != null ? '#${product.code}' : '--'`.
- **Icon**: **not swapped**. See §6 Non-goals for the asset survey and the reason no swap was applied.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | `group.code ?? '--'` → `group.code != null ? '#${group.code}' : '--'` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | `product.code ?? '--'` → `product.code != null ? '#${product.code}' : '--'` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/group_list_card_code_prefix_bug_076_test.dart` | **New** — 2-case regression test group `BUG-W03-076` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/internal_product_list_card_code_prefix_bug_076_test.dart` | **New** — 2-case regression test group `BUG-W03-076` |

## 5. Regression / verification

- New `group_list_card_code_prefix_bug_076_test.dart` (2 cases): non-null code (`'IP-BP-0001'`) renders exactly `'#IP-BP-0001'` (and the un-prefixed `'IP-BP-0001'` string is absent); null code renders `'--'` with no `'#--'` variant present. Both fail against pre-fix source (no "#") and pass against post-fix source.
- New `internal_product_list_card_code_prefix_bug_076_test.dart` — identical 2-case structure for `InternalProductListCard`/`product.code`.
- Checked the 3 sibling `group_list_card_*_test.dart` files (`_icons_test`, `_figma_fidelity_bug_060_test`, `_description_test`, `_name_style_test`) and the sibling `internal_product_list_card_bug_059_test.dart` — none assert the exact rendered code text (`find.text('IP-BP-0001')`) without the prefix, so no existing assertion is broken by this change.
- Blast radius: `GroupListCard` has 2 consumers (`material_group_list_page.dart`, `material_group_search_page.dart`); `InternalProductListCard` has 2 consumers (`internal_product_list_page.dart`, `internal_product_search_page.dart`) — both card widgets are shared-contract fixes (same code path for every consumer, no call-site branching), so all 4 consumers inherit the corrected prefix automatically.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` (run from design-repo root) → `OK: 0 anti-pattern hit` for both changed files.
- Brace/paren/bracket balance verified with a Python counter on both changed files — all balanced (`group_list_card.dart`: 49/49 `()`, 6/6 `{}`, 6/6 `[]`; `internal_product_list_card.dart`: 44/44 `()`, 8/8 `{}`, 5/5 `[]`).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain available in this environment (no `fvm`/`flutter`/`dart` on `PATH`), consistent with `DEBT-W01-MOBILE-BUILD-ENV`. The change is a single ternary-expression swap on an already-nullable field with no new imports/symbols — low regression risk from unverified static analysis. TEST_GROUP to run `fvm flutter analyze lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` + `fvm flutter test test/ui/inventory_catalog/material_group_list/group_list_card_code_prefix_bug_076_test.dart test/ui/inventory_catalog/widgets/internal_product_list_card_code_prefix_bug_076_test.dart` on a machine with the matching toolchain.
- KG update: **skipped** — pure UI-literal formatting fix, no entity/event/permission/API change.

## 6. Non-goals / out of scope — icon swap NOT applied

Surveyed `assets/icons/` (217 files) for a shape closer to `vuesax/linear/floppy-disk` than `icClipboardTick`:

- **`box.svg`** (the candidate named in the bug's Notes) is a `vuesax/linear/box` icon — an isometric 3D cube/package outline (top-face hexagon split by 3 edges + a vertical centerline), not a flat square/save shape. It is **not** a closer shape match than `icClipboardTick` (a flat rectangular clipboard silhouette, which at least shares the flat-rectangle-with-top-notch silhouette family that floppy-disk icons belong to). Rejected.
- Also reviewed every other square/rectangle/storage-adjacent icon in the catalog for a floppy-disk-like silhouette (square outline + small notched/cut corner + an internal horizontal bar/label rectangle): `layer.svg` (3 stacked diamond/hexagon layers), `archive-book.svg` (book/folder with ribbon bookmark), `document-text.svg` / `receipt-item.svg` (document/receipt with folded corner, but both already have distinct dedicated semantic meanings elsewhere in the app and are visually document-shaped, not disk-shaped), `color-swatch.svg` (paint swatch pair), `inventory-group.svg` (a 48x48 multi-layer illustration, not a 16x16 line icon — wrong format entirely). None is a closer floppy-disk match than the existing `icClipboardTick`.
- No `floppy`/`disk`/`save` asset exists anywhere in `assets/icons/` (re-confirmed by name grep, same result as `BUG-W03-069`).
- Per the fix instructions ("if truly nothing in the existing catalog is a good match, leave `icClipboardTick` as-is... do NOT fabricate a new SVG asset file"), **`icClipboardTick` is left unchanged**. This also avoids breaking the existing locked regression coverage in `group_list_card_icons_test.dart` (`BUG-W03-069`'s test, which asserts `icClipboardTick` specifically for this field, count 1) — this FIX cycle's scope forbids editing existing test logic, and no candidate asset justified that trade-off regardless.
- **Follow-up recommendation**: flag to design/asset team to add a real `vuesax/linear/floppy-disk` (or equivalent save/disk) SVG to `assets/icons/` — once available, a dedicated follow-up bug can swap the asset and update `group_list_card_icons_test.dart` in the same cycle.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — added literal `'#'` prefix to `group.code`/`product.code` rendering in `group_list_card.dart` + `internal_product_list_card.dart` (non-null only, `'--'` fallback unprefixed). 2 new regression test files (2 cases each). Icon swap for "Thuộc nhóm" surveyed (`box.svg` + full catalog scan) and **not applied** — no closer floppy-disk match found; `icClipboardTick` left as-is. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
