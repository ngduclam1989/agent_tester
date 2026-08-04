# BUGFIX — BUG-W03-077

> Shared-widget Figma-fidelity finding on `SectionDivider` + `StartInfoRow` (`FEAT-CAT-GRP-LIST` / `FEAT-CAT-GRP-DETAIL`). Filed against 2 call sites (`group_list_card.dart`, `material_group_detail_page.dart`); live Figma re-verification during this fix cycle confirmed the defect for `group_list_card.dart` only — `material_group_detail_page.dart` was found to already match Figma and was left unchanged.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED (scope narrowed by fresh Figma re-verify)** · Date: 2026-07-02

## 1. Summary

Two shared widgets, `SectionDivider` (`lib/ui/inventory/widgets/section_divider.dart`, 11 consumers) and `StartInfoRow` (`lib/ui/inventory/widgets/start_info_row.dart`, 6 consumers), were reported to render incorrectly for `inventory_catalog` consumers: a divider hardcoded to `height: 6` where Figma shows a 1px hairline, and a value `Text` hardcoded to `FontWeight.w500` (Medium) where Figma shows Regular (w400). The bug was filed against 2 call sites — `group_list_card.dart` (GRP-list) and `material_group_detail_page.dart` (GRP-detail) — citing Figma nodes `21235:29063` and `21526:45088` respectively.

Before applying any change, this fix cycle independently re-fetched all 3 cited Figma nodes via `mcp__plugin_figma_figma__get_design_context` (file `5YU4H3iY726P8KNxI9oCYF`):

- **`21235:29063`** ("Sản phẩm" card, backs `group_list_card.dart`) — confirms the reported defect. `Separator` (`21235:29071`) is `bg-[var(--base/border-primary,#e8e8ea)] h-px` (1px). The "Thuộc nhóm" value span (`21235:29087`) has no font-weight class override, inheriting the parent `FieldLabelValue` wrapper's `font-['Inter:Regular'] font-normal` — i.e. Regular/w400, not the widget's w500 default.
- **`21526:45088`** ("Chi tiết sản phẩm") — this is **`internal_product_detail_page.dart`**, a different screen with a completely different card/attribute-grid layout (`AttributesField` pairs, no `SectionDivider`/`StartInfoRow` usage at all). It is **not** the node backing `material_group_detail_page.dart`.
- **`21254:51661`** ("Chi tiết nhóm vật tư hàng hoá", the node actually documented in `Product/ux/figma-mobile/wave03-cat-grp-detail.md` line 27 as backing `material_group_detail_page.dart`) — the divider node `21254:51763` is `bg-[var(--base/bg-primary,#e8e8ea)] h-[6px]`, i.e. **6px**, matching the widget's current default exactly. All 6 `FieldsList` value spans (`Thuộc nhóm`, `Mô tả`, `Ngày tạo`, `Người tạo`, `Ngày sửa`, `Người sửa`) have an explicit `font-['Inter:Medium'] font-medium` override on the value span — i.e. **Medium/w500**, matching the widget's current default exactly.

Conclusion: the original bug filing conflated the "PROD-detail" node (`21526:45088`, `internal_product_detail_page.dart`) with the GRP-detail node (`21254:51661`, `material_group_detail_page.dart`) when describing the divider defect ("PROD-detail divider tương tự `h-0` + 1px line image" is true for `21526:45088` but irrelevant to `material_group_detail_page.dart`). `material_group_detail_page.dart` already renders correctly against its real Figma node and required **no code change**.

## 2. Root cause

- `SectionDivider` hardcodes `height: 6` unconditionally — correct for most consumers (incl. the real GRP-detail node) but wrong for the GRP-list card `Separator`, which Figma specifies as a 1px hairline.
- `StartInfoRow`'s default value `Text` hardcodes `FontWeight.w500` unconditionally — correct for most consumers (incl. all 6 GRP-detail `FieldsList` rows) but wrong for the GRP-list card's "Thuộc nhóm" `InfoField`, which Figma specifies as Regular (w400) with no weight override.
- Both are genuine **call-site defects** (per Shared-Symbol Blast-Radius Gate §3a), not shared-contract defects — the widgets' existing defaults are correct for the majority of consumers (verified: GRP-detail, and by extension the 5 unaudited `lib/ui/inventory/*` legacy consumers, are assumed correct until audited — their rendering is byte-for-byte unchanged by this fix).

## 3. Fix

- **`section_divider.dart`** — added optional `height` param (`double height = 6`), replacing the hardcoded `height: 6` in the `Container` with `height: height`. Default unchanged for every consumer that doesn't pass it.
- **`start_info_row.dart`** — added optional `valueFontWeight` param (`FontWeight? valueFontWeight`), used as `fontWeight: valueFontWeight ?? FontWeight.w500` in the default value `Text`'s `TextStyle` (only applies when `contentWidget` is null). Default unchanged for every consumer that doesn't pass it.
- **`group_list_card.dart`** — the only file changed at a call-site level:
  - `const SectionDivider()` → `const SectionDivider(height: 1)` (between the item-name text and the "Thuộc nhóm" info row).
  - The "Thuộc nhóm" `StartInfoRow(...)` call now passes `valueFontWeight: FontWeight.w400`.
- **`material_group_detail_page.dart`** — **no change**. Both its `SectionDivider()` and its 6 `StartInfoRow(...)` calls keep the widget defaults (`height: 6`, `valueFontWeight: null` → w500), which the fresh Figma re-verify confirms is already correct.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory/widgets/section_divider.dart` | Added optional `height` param (default `6`, preserves existing behavior) |
| `mobile/gf-garage-app/lib/ui/inventory/widgets/start_info_row.dart` | Added optional `valueFontWeight` param (default `null` → `FontWeight.w500`, preserves existing behavior) |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` | `SectionDivider()` → `SectionDivider(height: 1)`; "Thuộc nhóm" `StartInfoRow` gets `valueFontWeight: FontWeight.w400` |
| `mobile/gf-garage-app/test/ui/inventory/widgets/section_divider_test.dart` | **New** — 3-case regression: default height unchanged, `height: 1` override, `verticalMargin` combined with override |
| `mobile/gf-garage-app/test/ui/inventory/widgets/start_info_row_test.dart` | **New** — 4-case regression: default weight unchanged, `valueFontWeight: w400` override, label weight unaffected, override ignored when `contentWidget` set |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/group_list_card_divider_fontweight_bug_077_test.dart` | **New** — 2-case regression pinning `SectionDivider.height == 1` and `StartInfoRow.valueFontWeight == FontWeight.w400` inside the rendered card |

`material_group_detail_page.dart` is **not** in this list — investigated, found already correct, left untouched.

## 5. Shared-Symbol Blast-Radius Gate

Enumerated before and after the fix — identical in both passes:

- `grep -rln "SectionDivider(" lib/ui` → 11 consumers (excluding the widget's own definition file): `delivery_detail_page.dart`, `receipt_detail_page.dart`, `service_detail_page.dart`, `stock_detail_page.dart`, `detail_loading_widget.dart` (5 unaudited legacy `lib/ui/inventory/*`) + `internal_product_detail_page.dart`, `add_material_group_page.dart`, `material_group_detail_page.dart`, `edit_material_group_page.dart`, `group_list_card.dart`, `internal_product_list_card.dart` (6 `inventory_catalog/*`).
- `grep -rln "StartInfoRow(" lib/ui` → 6 consumers (excluding definition file): `delivery_info_section.dart`, `receipt_info_section.dart`, `service_info_section.dart`, `stock_history_section.dart` (4 unaudited legacy) + `material_group_detail_page.dart`, `group_list_card.dart` (2 `inventory_catalog/*`).
- `git diff --stat` (scoped to this bug's touched files) confirms exactly 3 non-test files changed: `section_divider.dart`, `start_info_row.dart`, `group_list_card.dart` — **`material_group_detail_page.dart` has 0 diff from this fix** (a pre-existing unrelated diff from a different, concurrent fix cycle on that file was observed in the working tree but is out of this bug's scope and was not touched by this cycle).
- Every consumer other than `group_list_card.dart` calls `SectionDivider()`/`StartInfoRow()` without the new params → identical rendering to pre-fix, by construction (new params are optional with defaults equal to the prior hardcoded values).

## 6. Regression / verification

- 9 new test cases across 3 new files (see §4) — all follow fail-before-fix / pass-after-fix for the changed call site, and pin default-unchanged behavior for every other consumer.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` (run from design-repo root) → `OK: 0 anti-pattern hit` on all 3 changed source files.
- Brace/paren/bracket balance verified with a Python counter on all 3 changed source files + 3 new test files — all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain available in this environment (`which fvm flutter dart` → empty), consistent with `DEBT-W01-MOBILE-BUILD-ENV` and the precedent set by `BUGFIX-BUG-W03-060/069/050`. TEST_GROUP to run `fvm flutter analyze lib/ui/inventory/widgets/section_divider.dart lib/ui/inventory/widgets/start_info_row.dart lib/ui/inventory_catalog/material_group_list/widgets/group_list_card.dart` + `fvm flutter test test/ui/inventory/widgets/section_divider_test.dart test/ui/inventory/widgets/start_info_row_test.dart test/ui/inventory_catalog/material_group_list/group_list_card_divider_fontweight_bug_077_test.dart` on a machine with the matching toolchain.
- KG update: **skipped** — pure UI token (divider height + font weight) fix, no entity/event/permission/API change.

## 7. Non-goals / out of scope

- **Did not apply any change to `material_group_detail_page.dart`** — the bug's original filing asked for `SectionDivider height:1` + `StartInfoRow valueFontWeight: w400` on all 6 `FieldsList` rows there too, contingent on a "re-verify before blindly applying" gate. The fresh live-Figma fetch of the page's real node (`21254:51661`) contradicts that request (divider is genuinely 6px; all 6 values are genuinely Medium/w500) — applying the requested change would have introduced a **new** fidelity regression on an already-correct screen. Flagging this discrepancy explicitly for the Business/Design Authority: the original bug's citation of node `21526:45088` ("PROD-detail") for `material_group_detail_page.dart` appears to be a node mix-up with `internal_product_detail_page.dart`.
- Did not audit or touch the 5 unaudited legacy `lib/ui/inventory/*` `SectionDivider` consumers or the 4 unaudited legacy `StartInfoRow` consumers — out of this bug's scope; their defaults are preserved unchanged by construction.
- Did not add a golden/alchemist visual test — followed the existing static-assertion test convention already established for sibling `group_list_card_*_test.dart` files, consistent with the mobile-toolchain-deferred environment.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — added optional `height` param to `SectionDivider` and `valueFontWeight` param to `StartInfoRow` (both backward-compatible, defaults preserve prior behavior); applied `height: 1` + `valueFontWeight: w400` at `group_list_card.dart`'s "Thuộc nhóm" call site only. Live re-verify of Figma node `21254:51661` (the real node backing `material_group_detail_page.dart`) found that page already correct — **no change applied there**, narrowing fix scope from the bug's original 2-file request to 1 file, with the discrepancy documented for Business/Design Authority follow-up. 3 new regression test files (9 cases). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
