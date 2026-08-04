# BUGFIX — BUG-W03-019

> Form input widget catalog bypass — raw `TextField` + `DropdownButtonFormField` + `OutlineInputBorder`
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`MaterialGroupForm` (shared by Add/Edit pages) used raw Material `TextField` + `DropdownButtonFormField<T>` + `OutlineInputBorder` at all 5 fields (code, name, parent, status, description) instead of the repo's canonical form-input catalog (`lib/ui/widgets/text_field/`, `lib/ui/widgets/dropdown_menu/`), violating R5 (UI conventions) + R10 (widget catalog compliance).

## 2. Fix

Rewrote `material_group_form.dart`:

- **Text fields** (code, name, description) — raw `TextField` → `AppTextField` (`lib/ui/widgets/text_field/app_text_field.dart`). Preserved `Semantics(identifier: ...)` test hooks, `inputFormatters`, `maxLines`/`maxLength`. External server-error text (`widget.codeErrorText` / `widget.descriptionErrorText`) is surfaced via `validator: (_) => errorText` + `autovalidateMode: AutovalidateMode.always` + `hasServerError: true` (since `AppTextField` exposes error state through its internal `FormField` rather than a raw always-visible `errorText` prop).
- **Dropdown fields** (parent, status) — raw `DropdownButtonFormField<T>` → `DropdownMenuWidget` (`lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`), which itself composes `AppTextField` (readOnly) + chevron `MenuAnchor` overlay (matches D-M3 default-pattern: chevron auto-rendered by the catalog widget). Introduced small private option wrapper classes (`_ParentOption`, `_StatusOption`) since `DropdownMenuWidget.dataList` renders `item.toString()` and returns the selected item as-is — this avoids ambiguous string-label matching (e.g. two parent groups sharing a display name) by carrying the real `id`/`enum` value through the round-trip.
- Removed `OutlineInputBorder` construction entirely — border styling now owned by `AppTextField`'s internal `_setBoder()` (canonical `AppColors.borderPrimary` + focus/error states).

## 3. Files changed

| File | Change |
|---|---|
| `lib/ui/inventory_catalog/widgets/material_group_form.dart` | Full rewrite of the 5-field body: `TextField` → `AppTextField` (×3); `DropdownButtonFormField` → `DropdownMenuWidget` (×2, via new `_ParentOption`/`_StatusOption` wrapper classes + `MenuController`/`ScrollController`/`TextEditingController` state per dropdown). Also folded in BUG-W03-018 (raw `TextStyle`) and the file's own BUG-W03-017 spacing fixes (same rewrite pass). |

## 4. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` → 2 P2 hits remain: `setState(() {...})` inside the two `DropdownMenuWidget.onSelected` callbacks (script pattern: "setState trong widget có BLoC — nên emit qua BLoC state"). **Assessed as pre-existing, out of scope**: `MaterialGroupForm` is a plain `StatefulWidget` (not itself extending `BaseCubit`/wrapped directly in a `BlocBuilder`) used purely to hold local, ephemeral form-field state before calling `widget.onChanged(...)` up to the parent Cubit-backed page — the original pre-fix code had the exact same `setState(() => _parentId = v)` / `setState(() => _status = v)` pattern (verified via git history), so this is not a regression introduced by this fix.
- Type/compile sanity: manual parens/brackets/braces balance check on the rewritten file → 0 diff (balanced). `AppTextField`/`DropdownMenuWidget` constructor signatures cross-checked against their source (`lib/ui/widgets/text_field/app_text_field.dart`, `lib/ui/widgets/dropdown_menu/dropdown_menu_widget.dart`) before use.
- `fvm flutter analyze` / `fvm flutter test` / widget test: **deferred** (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`) — recommend TEST cycle prioritize this file given the scope of the rewrite (form validation, dropdown selection round-trip, edit-mode pre-fill).

## 5. Non-goals / out of scope

- Did not add visual "selected item" highlight inside the `DropdownMenuWidget` overlay for parent/status (the widget's `_Submenu`/highlight mechanism belongs to the sibling `DropdownWidget`, not `DropdownMenuWidget` — no established precedent for adding it, and out of scope for a P2 catalog-compliance fix).
- Did not change `MaterialGroupFormValues` public contract (unchanged) or `Add/EditMaterialGroupPage` call sites (no API change needed — `onChanged` callback signature preserved).

## 6. Follow-up

- TEST cycle (priority): widget test covering (a) edit-mode pre-fill for parent/status dropdown display text, (b) validation error surfacing for code/description external server errors, (c) parent-dropdown exclude-self/descendants filter still applies in edit mode, (d) status dropdown default ACTIVE in create mode.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — full rewrite: raw `TextField`/`DropdownButtonFormField`/`OutlineInputBorder` → `AppTextField`/`DropdownMenuWidget` catalog widgets. Folded in BUG-018 (TextStyle) + BUG-017 (spacing) fixes for this file in the same pass. |
