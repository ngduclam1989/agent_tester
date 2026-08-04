# BUGFIX — BUG-W03-064

> "Thuộc nhóm" (parent group) field must be locked (disabled) on the Material Group Edit screen, mirroring "Mã nhóm VTHH" — per business-decision reversal BR-CAT-GRP-009 v19 / FEAT-CAT-GRP-EDIT AC-4 v5.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`BR-CAT-GRP-009` previously allowed the parent group ("Thuộc nhóm") to be reassigned at any time from the Edit screen, blocked only by a backend cycle-guard (`ERR-INV-003`) when the chosen parent was the group itself or one of its descendants. On 2026-07-02, this business decision was reversed by the user (mobile dev, in-session): the parent group must now be chosen **once, only at creation time**, and locked permanently afterward — exactly the same immutability treatment already applied to "Mã nhóm VTHH" (`BR-CAT-GRP-004`). `Product/business-rules/BR-GF-INVENTORY-CATALOG.md` (BR-CAT-GRP-009 v19) and `Product/features/FEAT-CAT-GRP-EDIT.md` (AC-4 v5) were already updated to reflect this before this fix cycle started.

The mobile Edit screen's shared form (`material_group_form.dart`) had the code field correctly locked, but the parent-group field used `DropdownMenuWidget` — a shared widget with **no `enabled`/disabled param at all** — so it stayed fully tappable/openable in Edit mode regardless of the new rule.

## 2. Root cause

`DropdownMenuWidget` (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`) never had any notion of a disabled state; every consumer always got a fully interactive dropdown. When `BR-CAT-GRP-009` allowed changing the parent group freely (old v18), this was correct. Once the rule reversed (v19), there was no mechanism for the Edit screen to lock the field — the gap was purely missing plumbing on the shared widget, not a logic bug in the cubit (the backend cycle-guard `ERR-INV-003` handling in `edit_material_group_cubit.dart` was, and remains, correct defense-in-depth).

## 3. Fix

- **`DropdownMenuWidget`** (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`) — added a new optional `final bool enabled;` constructor field, **default `true`** (Shared-Symbol Blast-Radius Gate: 3 consumers found via `grep -rln "DropdownMenuWidget(" lib/` — `material_group_form.dart`, `material_group_filter_page.dart`, `internal_product_filter_page.dart` — none of them pass `enabled` today, so the default preserves their exact pre-fix behavior by construction). When `false`:
  - `enabled` is propagated straight to the underlying `AppTextField(enabled: enabled, ...)`, which already has a built-in disabled convention (grey `fillColor`, no focus/cursor) used elsewhere in this catalog — reused as-is, no new visual language invented.
  - `onTap` is set to `null` instead of the open/close toggle, so the `MenuAnchor` overlay can never be opened by tapping while disabled.
- **`material_group_form.dart`** — the "Thuộc nhóm" `DropdownMenuWidget` now passes `enabled: !widget.isEdit`, mirroring the exact `!widget.isEdit` gate already used for the code field above it. The **status** dropdown and both **filter-page** dropdowns are untouched (they don't pass `enabled`, so they keep the default `true`).
- **Create screen unaffected**: `add_material_group_page.dart` instantiates `MaterialGroupForm(isEdit: false, ...)`, so `enabled: !widget.isEdit` evaluates to `true` there — the parent-group dropdown stays fully editable at creation, unchanged.
- **Cycle-guard preserved**: `edit_material_group_cubit.dart`'s `ERR-INV-003`/`cycleError` handling was left untouched, per the updated BR/FEAT wording — it remains as backend defense-in-depth for a bypassed client, but is no longer reachable through normal UI use since the field is now locked before any parent-group value can be resubmitted.
- Updated the `MaterialGroupForm` class-level dartdoc (field list) to note the field is now locked in edit mode, since the previous doc line ("exclude self/descendants in edit") was stale relative to the new lock behavior.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart` | New optional `enabled` field (default `true`); propagated to `AppTextField.enabled`; `onTap` nulled when disabled |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | Wire `enabled: !widget.isEdit` on the "Thuộc nhóm" dropdown; dartdoc note updated |
| `mobile/gf-garage-app/test/ui/widgets/dropdown_menu/dropdown_menu_widget_test.dart` | **Updated** — new `BUG-W03-064` group: `enabled:false` disables `AppTextField` + blocks menu open; `enabled:true` and the omitted-default case still open the menu (Shared-Symbol Gate — all 3 consumers unaffected) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/material_group_form_bug_064_test.dart` | **New** — `MaterialGroupForm(isEdit: true)` locks the parent-group dropdown (disabled + tap-no-op); `isEdit: false` (Create) stays enabled/tappable |

## 5. Regression / verification

- `dropdown_menu_widget_test.dart` — `BUG-W03-064` group (4 tests): `enabled:false` → underlying `AppTextField.enabled == false`; tapping while disabled fires no `onOpened` and opens no `MenuItemButton`; `enabled:true` explicit and the **omitted-param default** both still open the menu and fire `onOpened` — pins that every pre-existing call-site (none of which pass `enabled`) is unaffected.
- `material_group_form_bug_064_test.dart` — pumps the real `MaterialGroupForm` widget: `isEdit:true` → parent-group `DropdownMenuWidget.enabled == false` and tapping its field opens no menu; `isEdit:false` (Create) → `enabled == true` and tapping still opens the menu (unchanged Create behavior).
- `python3 scripts/check-mobile-canonical-primitives.py --file <touched lib files>`:
  - `dropdown_menu_widget.dart` → **OK, 0 hit**.
  - `material_group_form.dart` → **2 P2 hits** (`setState()` at the pre-existing `onSelected` callbacks for the parent/status dropdowns, lines ~209/232) — confirmed via `git diff` that both lines are **pre-existing code, not touched by this fix** (this fix only added the `enabled: !widget.isEdit,` line). `MaterialGroupForm` has no cubit of its own by design (it emits `MaterialGroupFormValues` up to the parent page's cubit via the `onChanged` callback), so this is a stylistic-drift false positive against a callback-based shared form widget, out of scope for BUG-W03-064 — not fixed here to avoid unrelated scope creep.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no matching Flutter/Dart toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; the only SDK present, Flutter 3.32.8/Dart 3.8.1 at `/home/all_engineer/flutter`, fails `pubspec.yaml`'s `sdk: ^3.11.0` constraint — `Because cardoctor_garage_v3 requires SDK version ^3.11.0, version solving failed`). Both new/updated test files are static-correct: verified field names against `MaterialGroupDetail`/`MaterialGroupItem`/`MaterialGroupStatus` models, `AppTextField.enabled` propagation logic in `app_text_field.dart`, and `wrapLocalized`/`loadViTranslations` test-support helpers already used by sibling fidelity tests in this suite.
- KG update: **skipped** — this is a UI-only lock (no entity/event/permission schema change), and `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` is outside this dispatch's `OWNED_PATHS` (`mobile/gf-garage-app/**`, `Tracking/WAVE03/BUGS.md`, `Execution/bugfixes/**`, `Execution/FAILURE-MODES.md`). A KG edit was drafted and then reverted for this reason — flagging here instead so a future KG-sync pass can append it if desired.

## 6. Non-goals / out of scope

- Did not touch the **status** dropdown in `material_group_form.dart` or either **filter-page** dropdown (`material_group_filter_page.dart`, `internal_product_filter_page.dart`) — none of them are affected by BR-CAT-GRP-009 v19, and none pass `enabled` so they keep the pre-fix default behavior.
- Did not remove the client-side `_parentDataList` self/descendant exclusion filter or the `ERR-INV-003` cycle-guard handling in `edit_material_group_cubit.dart` — both remain as defense-in-depth per the updated BR/FEAT wording, even though the normal UI path can no longer reach them.
- Did not fix the pre-existing `setState()`-in-shared-widget P2 hits flagged by `check-mobile-canonical-primitives.py` on lines untouched by this bug (see §5) — unrelated debt, would be scope creep.
- Did not update the Figma edit-mode mockup (`Product/ux/figma-mobile/wave03-cat-grp-edit.md`) — already flagged **STALE** in `BR-CAT-GRP-009` v19's own Change Log entry (still draws the dropdown as active/editable); needs a designer update at the next `/prefetch-figma` pass, not part of this code fix.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — added `DropdownMenuWidget.enabled` (default `true`, Shared-Symbol Gate: 3 consumers unaffected), wired `enabled: !widget.isEdit` on the "Thuộc nhóm" dropdown in `material_group_form.dart`. 2 regression test files (1 updated, 1 new). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (out of OWNED_PATHS, no entity/permission change). |
