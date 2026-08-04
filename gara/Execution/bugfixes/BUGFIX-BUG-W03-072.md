# BUGFIX — BUG-W03-072

> (1) `MaterialGroupDetailPage`'s group `name` rendered inside `_SummaryHeader` (grouped with code+badge) ABOVE the `SectionDivider` — live Figma (node 21254:51766, file 5YU4H3iY726P8KNxI9oCYF) places it as the FIRST field-list item BELOW the divider. (2) `MaterialGroupForm`'s "Thuộc nhóm" dropdown showed a literal black `"--"` when no parent was selected, instead of an empty/placeholder state.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

Two independent Figma-fidelity issues in `lib/ui/inventory_catalog/` reported by the mobile dev (2026-07-02) and confirmed by orchestrator live Figma audit (`get_metadata`/`get_design_context` on node `21254:51661`, file `5YU4H3iY726P8KNxI9oCYF`):

1. **`material_group_detail/material_group_detail_page.dart`** — the group `name` `Text` lived inside the private `_SummaryHeader` widget, placed above `const SectionDivider()` alongside the code+badge row. Live Figma confirms the real layout is `Header (code+badge) -> Divider -> Frame[name, Thuộc nhóm, Mô tả, ...]` — the name (node `21254:51766`, Heading/H2) is the first element of the field-list block **below** the divider, not part of the header.
2. **`widgets/material_group_form.dart`** (shared Add/Edit form) — `_parentDataList` injected a fake sentinel `_ParentOption(null, '--')` and `_parentLabelFor(null)` returned the literal string `'--'`. Since `DropdownMenuWidget`'s underlying `AppTextField` only shows its grey `hintWidget` placeholder when the bound `TextEditingController`'s text is empty, the non-empty `'--'` string always rendered as an ordinary black value — visually indistinguishable from an actually-selected parent — even for a root group (no parent).

## 2. Root cause

1. `_SummaryHeader` was authored to hold "everything above the divider" as a single unit and the name `Text` was added to it without re-checking against the live Figma frame structure — the prefetched spec doc (superseded by BUG-W03-061's live-Figma reconciliation for token/spacing, but not for placement) never flagged the placement drift.
2. `_parentDataList`/`_parentLabelFor` modeled "no parent selected" as a selectable dummy option (`id: null, label: '--'`) instead of an absence-of-value state. `DropdownMenuWidget` (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart:48-63`) passes `hintWidget` + `controller: textEditingController` straight into `AppTextField` -> `TextFormField(decoration: InputDecoration(hint: widget.hintWidget, ...))` (`lib/ui/widgets/text_field/app_text_field.dart:338-339`) — standard Flutter `TextFormField` only paints `decoration.hint` when the controller's text is empty. A non-empty sentinel string therefore always wins over the hint, regardless of whether a real selection was made.

## 3. Fix

### (1) Detail page — move name below the divider

`_SummaryHeader` now renders only the code+badge `Row` (its trailing `Gap(AppSizes.spacing4)` + `Text(detail.name...)` removed). The name `Text` (same `AppTextStyle.textHeadingH2`/`AppColors.textPrimary` styling, unchanged) is now the first child of the field-list `Column` that follows `SectionDivider()`, immediately before the `StartInfoRow(label: catGrp_parent...)` row, separated by the same `Gap(AppSizes.spacing8)` used between the other field rows in that block.

No other content in `_SummaryHeader` or the field-list block changed.

### (2) Form — empty string instead of fake "--" sentinel

- `_parentDataList` getter: removed the leading `const _ParentOption(null, '--')` entry — the list now contains only real parent options (`widget.parentOptions` mapped/filtered, unchanged).
- `_parentLabelFor(int? id)`: returns `''` (was `'--'`) both for `id == null` and for the "no match found" fallback.

Net effect: when `initial?.parentId == null` (create, or edit of a root group), `_parentTextCtrl`'s initial text is `''`, so `DropdownMenuWidget` falls back to its grey `hintText` placeholder — confirmed via `dropdown_menu_widget.dart:48-63` + `app_text_field.dart:338-339` read before relying on it, per the FIX dispatch instruction. When a real parent is set, `_parentLabelFor` still resolves and shows its name unchanged — the dropdown's own selectable data list no longer offers a "no parent" option (there was never a `codeErrorText`/business need for the user to explicitly select "no parent" from the menu — that state is the default/absence, matching the mobile dev's expectation: "để null, hiện placeholder nghĩa là không chọn -> đó là nhóm cha").

**Shared-Symbol Blast-Radius Gate**: `_parentDataList`/`_parentLabelFor` are private to `_MaterialGroupFormState`, consumed only inside `material_group_form.dart` itself (1 consumer, not shared) — gate does not apply. `MaterialGroupForm` itself is a shared widget (2 consumers: `edit_material_group_page.dart`, `add_material_group_page.dart`), but neither call site passes anything through `_parentDataList`/`_parentLabelFor` — both consumers are unaffected by construction (same public API, same `parentOptions`/`initial` params).

Note: `material_group_filter_page.dart` has its own unrelated `_ParentGroupOption(null, '--')` sentinel (a filter "any parent" option, semantically a real selectable choice, not an absence-of-value default) — out of scope for this bug (different file, different feature, different semantics) and left untouched.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | Moved `Text(detail.name...)` from `_SummaryHeader` to the first position of the field-list `Column` after `SectionDivider`, before the "Thuộc nhóm" `StartInfoRow`. `_SummaryHeader` now renders only code+badge. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | Removed the `_ParentOption(null, '--')` sentinel from `_parentDataList`; `_parentLabelFor(null)`/no-match fallback now return `''` instead of `'--'`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_072_test.dart` | **New** — static source pins (`_SummaryHeader` no longer contains `detail.name`; name is the first child of the field-list block, immediately before the "Thuộc nhóm" row) + body-structure mirror render test (name renders below the divider, above the parent row). |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/material_group_form_bug_072_test.dart` | **New** — create mode / edit-root-group mode: parent field controller text is empty, no literal `"--"` renders anywhere, sentinel option absent from `dataList`; edit-with-real-parent mode unaffected (still shows the parent name). |

**Don't-touch respected**: `material_group_filter_page.dart` (its own unrelated `'--'` sentinel), `edit_material_group_page.dart`, `add_material_group_page.dart` (consume `MaterialGroupForm`'s public API only, no changes needed) — untouched.

## 5. Verification

- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → **0 hit**.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` → **2 P2 hit** (`setState` at lines 207/230, inside the parent/status `DropdownMenuWidget.onSelected` callbacks) — confirmed via `git diff` these 2 lines are **pre-existing**, unrelated to this fix's diff (this fix only touches `_parentDataList`/`_parentLabelFor`, lines 83-95). Not introduced by BUG-W03-072; not addressed here (out of scope — a BLoC-migration concern for a future bug, would require re-plumbing the form's local `setState` selection state through a Cubit, well beyond a placeholder-text fix). Flagged in §6 residual risk.
- `python3 scripts/check-mobile-canonical-primitives.py --file` on both new test files → **0 hit** (added the established `// figma binding scale 20` justify-comment on the mirrored `Gap(20)` literals in the detail-page test, matching the BUG-W03-070 test convention).
- Regex/static assertions in both new test files were verified directly against the real post-fix source (`python3 -c` regex dry-run) before being committed to the test files, confirming they pin the actual structure rather than an imagined one.
- **Build/analyze/test DEFERRED**: no Flutter toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle). TEST_GROUP on a machine with the toolchain should run:
  ```
  fvm flutter analyze lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart lib/ui/inventory_catalog/widgets/material_group_form.dart
  fvm flutter test test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_072_test.dart test/ui/inventory_catalog/widgets/material_group_form_bug_072_test.dart
  ```
- Golden (alchemist) vs oracle not attempted in this env (same DEBT) — substituted with the static source pins + body-structure mirror render assertions above (position/absence-of-literal), consistent with the carve-out already used by prior W03 mobile FIX cycles in this same environment.

## 6. Residual risk / follow-up

- `material_group_form.dart`'s 2 pre-existing P2 `setState` hits (parent/status dropdown selection handled via local `setState` instead of BLoC emit) are unrelated to this fix and were not introduced by it — left untouched per minimum-scope. Flag for a future dedicated BLoC-migration bug if `check-mobile-canonical-primitives.py` P2 debt on this file needs closing.
- **Sibling-audit finding, filed not fixed** (`FM-W03-306` prevention guidance — grep the boundary for the same structural signature before closing): `material_group_filter_page.dart:62`'s `_optionsFor()` has the identical `_ParentGroupOption(null, '--')` sentinel shape, and `_syncTextController()` resolves it to the literal `'--'` string on an initial/never-filtered `parentId == null` state (same `dropdown_menu_widget.dart`/`app_text_field.dart` hint-on-empty mechanism). Not fixed here — outside this bug's L3 Touched files, and unlike the form's sentinel this filter option may be an intentional selectable "no filter"/"Tất cả" menu entry rather than a pure bug, so it needs live Figma confirmation before applying the same fix shape. Filed as **BUG-W03-074** (P3, OPEN) in `Tracking/WAVE03/BUGS.md` for a dedicated follow-up audit.
- Concurrent-session note: this session had extreme concurrent-write contention on `Tracking/WAVE03/BUGS.md` and on `material_group_form.dart`/`material_group_detail_page.dart` themselves (BUG-W03-061/062/064/065/070/071 all touched overlapping regions). Re-read both files fresh immediately before editing (this cycle) and re-verified via `git diff` after editing that the final diff contains only this fix's 2 intended hunks — no accidental clobber of concurrent work.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — root cause + fix (name placement below divider; empty-string parent placeholder instead of fake "--") + regression tests + residual (pre-existing unrelated setState P2 debt on the form file). |
