# BUGFIX — BUG-W03-065

> "Mô tả" (description) field in `MaterialGroupForm` hand-rolled its own character counter instead of using the canonical `CountTextField` — plus a wrong `maxLength` (250 instead of the BR-CAT-GRP-012-mandated 255).
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`material_group_form.dart` (the shared Add/Edit form for Material Group, `FEAT-CAT-GRP-CREATE`/`FEAT-CAT-GRP-EDIT`) rendered its "Mô tả" field with a raw `AppTextField` plus a hand-rolled `ValueListenableBuilder<TextEditingValue>` counter (`Text('${value.text.length}/250')`), instead of the repo's existing canonical shared widget `CountTextField` (`lib/ui/widgets/text_field/count_textfield.dart`), which already renders this exact pattern and has 4 established consumers (`feedback_page.dart`, `car_information_form.dart`, `items_page_v3.dart`, `cancel_purchase_dialog.dart`). The code carried a self-aware comment naming this a deliberate call-site workaround, because `CountTextField` did not (yet) support the `hasServerError`/`validator` passthrough this field needs to surface server-side errors via `widget.descriptionErrorText`. Separately, `BR-CAT-GRP-012` (`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`) mandates a 255-character max for the description, but the field was wired to `maxLength: 250`.

## 2. Root cause

`CountTextField` was originally built as a self-contained widget (owns its own internal `TextEditingController`, exposes only `onChanged`/`initialValue`/`hintText`/`titleText`/`maxLength`/`isRequired`) for its 4 simple existing consumers, none of which needed server-side validation error display. `material_group_form.dart`'s description field needed `hasServerError`/`validator` (to render `widget.descriptionErrorText`, matching the pattern already used for the adjacent "Mã nhóm VTHH" field in the same form), so at the time it was written the call site fell back to manually reimplementing the counter around a raw `AppTextField` rather than extending the shared widget — leaving the 250/255 mismatch uncaught in the same pass.

## 3. Fix

- **`CountTextField`** (`lib/ui/widgets/text_field/count_textfield.dart`) — added 2 new optional constructor params, **`hasServerError`** (`bool`, default `false`) and **`validator`** (`FormFieldValidator<String>?`, default `null`), passed straight through to the internal `AppTextField(hasServerError:, validator:, autovalidateMode: widget.validator != null ? AutovalidateMode.always : null)`. Shared-Symbol Blast-Radius Gate: enumerated all 4 existing consumers via `grep -n "CountTextField(" -A 12` on `feedback_page.dart`, `car_information_form.dart`, `items_page_v3.dart`, `cancel_purchase_dialog.dart` — none pass the 2 new params, so with the chosen defaults their rendered output and behavior are unchanged by construction (`hasServerError: false` / `validator: null` / `autovalidateMode: null` match `AppTextField`'s own pre-existing defaults).
- **`material_group_form.dart`**:
  - Replaced the manual `Column(children: [AppTextField(...), ValueListenableBuilder(...)])` block for the "Mô tả" field with a single `CountTextField(initialValue: widget.initial?.description, hintText:, maxLength: 255, hasServerError: widget.descriptionErrorText != null, validator: widget.descriptionErrorText != null ? (_) => widget.descriptionErrorText : null, onChanged: ...)` call, still wrapped in the same `Semantics(identifier: 'field-group-description', textField: true)` as before.
  - `maxLength` corrected `250` → `255` to match `BR-CAT-GRP-012`.
  - The `_descCtrl` (`TextEditingController`) field was removed entirely — `CountTextField` owns its own internal controller built from `initialValue`, so the surrounding state was migrated from the `TextEditingController`-driven pattern to the `initialValue`+`onChanged` pattern the other 4 `CountTextField` consumers already use: a plain `String _description` field, set from `widget.initial?.description ?? ''` in `initState`, updated in the new `onChanged: (value) { _description = value ?? ''; _emit(); }` callback, and read directly in `_emit()`. The now-dead `_descCtrl.addListener(_emit)` (`initState`) and `_descCtrl.dispose()` (`dispose`) call sites were removed — no dangling controller left behind.
  - Removed the class-level dartdoc line describing "Mô tả (optional, maxLength 250)" (updated to 255) and the call-site comment documenting the now-resolved workaround (the code is self-explanatory as a direct `CountTextField` call — no replacement comment added, per the repo's "no code comments describing what code does" convention).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/text_field/count_textfield.dart` | New optional `hasServerError`/`validator` params (defaults preserve existing 4-consumer behavior); passthrough to internal `AppTextField` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | "Mô tả" field migrated to `CountTextField(maxLength: 255, ...)`; `_descCtrl` removed, replaced by `String _description` + `onChanged` callback; stale doc-string/workaround comments updated/removed |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/material_group_form_bug_065_test.dart` | **New** — `CountTextField` used with `maxLength: 255`; counter shows `n/255` not `n/250`; server error surfaces via `hasServerError`/`validator`; no error when `descriptionErrorText` is null |
| `mobile/gf-garage-app/test/ui/widgets/text_field/count_textfield_bug_065_test.dart` | **New** — pre-existing call shape (no new params) still renders the counter with no exception; new `hasServerError`+`validator` params surface the error text |

## 5. Regression / verification

- `material_group_form_bug_065_test.dart` (4 cases): `CountTextField.maxLength == 255`; prefilled `description: 'abc'` renders `3/255` and NOT `3/250`; `descriptionErrorText` set → error text rendered + `CountTextField.hasServerError == true`; no `descriptionErrorText` → `hasServerError == false` and `validator == null`.
- `count_textfield_bug_065_test.dart` (2 cases): default/pre-existing call shape (`initialValue`+`maxLength`+`onChanged` only) renders the counter (`3/500`) with `tester.takeException() == null`; `hasServerError: true` + `validator` surfaces the error text with no `Form` ancestor required (confirmed against Flutter's `FormFieldState.build()` — `autovalidateMode == always` triggers `_validate()` independent of a `Form.maybeOf(context)` ancestor, the same mechanism the pre-existing "Mã nhóm VTHH" field in this form already relies on).
- `python3 scripts/check-mobile-canonical-primitives.py --file <touched lib files>`:
  - `material_group_form.dart` → **2 P2 hits** (`setState()` at lines 208/231, the pre-existing parent-group/status `DropdownMenuWidget.onSelected` callbacks).
  - `count_textfield.dart` → **1 P2 hit** (`setState()` at line 42, the pre-existing internal-controller listener).
  - Both confirmed via `git diff` (against the nested `mobile/gf-garage-app` repo's own `git`) to be **pre-existing lines untouched by this fix's diff** — `material_group_form.dart:208/231` predate this cycle (from `BUG-W03-062`), `count_textfield.dart:42` predates the widget extension in this cycle. Both files are plain `StatefulWidget`s with no BLoC/Cubit involved, so this is the same `setState`-heuristic false-positive class already noted as out-of-scope in `BUGFIX-BUG-W03-064.md` §5 — left as-is, not fixed here to avoid unrelated scope creep.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no matching Flutter/Dart toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; only SDK present, Flutter 3.32.8/Dart 3.8.1 at `/home/all_engineer/flutter`, fails `pubspec.yaml`'s `sdk: ^3.11.0` — `Because cardoctor_garage_v3 requires SDK version ^3.11.0, version solving failed`). Both new test files are static-correct: field names verified against `MaterialGroupDetail`/`MaterialGroupStatus` models, `CountTextField`/`AppTextField` param names read directly from source, and `wrapLocalized`/`loadViTranslations` test-support helpers reused from the sibling `material_group_form_bug_064_test.dart`.
- KG update: **skipped** — this is a UI-only widget-catalog compliance + validation-limit fix, no entity/event/permission schema change.

## 6. Non-goals / out of scope

- Did not fix the 3 pre-existing `setState()` P2 heuristic hits flagged by `check-mobile-canonical-primitives.py` on lines untouched by this bug's diff (see §5) — unrelated debt, would be scope creep beyond `BUG-W03-065`'s Touched files.
- Did not add golden (alchemist) tests for the 4 pre-existing `CountTextField` consumers — the new params are additive/opt-in with defaults that reproduce the exact prior `AppTextField` call shape by construction (verified via source read, not just claimed), so no visual regression risk exists for them; only widget tests were added per §5.
- Did not touch `feedback_page.dart`, `car_information_form.dart`, `items_page_v3.dart`, or `cancel_purchase_dialog.dart` — none needed changes; the Shared-Symbol Blast-Radius Gate was satisfied purely by choosing defaults on the 2 new `CountTextField` params.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `CountTextField` extended with optional `hasServerError`/`validator` passthrough (default-safe, 4 pre-existing consumers unaffected); `material_group_form.dart` "Mô tả" field migrated from hand-rolled counter to `CountTextField(maxLength: 255, ...)`, `_descCtrl` removed. 2 new regression test files. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
