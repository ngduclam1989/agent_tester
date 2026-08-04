# BUGFIX — BUG-W03-173

> Field "Mã nhóm VTHH" (disabled) trên màn Chỉnh sửa Nhóm vật tư hàng hoá hiển thị nền trắng thay vì xám, không đồng bộ với field disabled khác cùng form ("Thuộc nhóm" đúng nền xám).
> Severity: **P3** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-06

## 1. Summary

`AppTextField` (`lib/ui/widgets/text_field/app_text_field.dart`) already had correct disabled-styling logic: `fillColor: widget.enabled ? widget.fillColor : Colors.grey.shade200`. `MaterialGroupForm`'s "Mã nhóm VTHH" callsite, however, only passed `readOnly: widget.isEdit` — `enabled` was left at its default `true` — so the field never rendered through the grey branch, even though input was correctly blocked by `readOnly`. Visually this made a functionally-locked field look identical to an active/editable one, out of sync with the "Thuộc nhóm" field right below it, which already correctly disables via `enabled: !widget.isEdit`.

## 2. Root cause

Confirmed candidate **(B)** from `verify/BUG-W03-173.verify.md` §3.1: the callsite passed `readOnly: widget.isEdit` without the matching `enabled: !widget.isEdit`. `readOnly` and `enabled` are distinct Flutter `TextField` properties — `readOnly` only blocks editing, `enabled` also drives the disabled visual branch (grey fill, no focus ring, no cursor). This is the same combination other screens in this app already use for locked/display-only fields (e.g. `customer_page_v3.dart:269-270`, `items_page_v3.dart:749-750` both pass `readOnly: true, enabled: false` together).

The callsite carried a `BUG-W03-062` comment justifying the `readOnly`-only decision, claiming a live Figma edit-mode mockup (node `21254:51963`) rendered the locked code field "identical to editable fields (white fill, border-primary)". Cross-checking `Product/ux/figma-mobile/wave03-cat-grp-edit.md` §GroupCodeField confirms it does reference the CREATE-mode's editable-field styling for that node — but `Product/features/FEAT-CAT-GRP-EDIT.md` v5's own Change Log (2026-07-02) already flags this same edit-mode Figma mockup as **STALE** relative to the current locked-field business rule (it was raised while investigating the sibling "Thuộc nhóm" field, `BUG-W03-064`, which needed the same disabled treatment). AC-2 requires the code field to render `disabled` with a helper hint ("Không được sửa mã nhóm sau khi tạo."), consistent with a genuinely locked/greyed field, not a merely-`readOnly` one that still looks active.

## 3. Fix

- **`material_group_form.dart`** — added `enabled: !widget.isEdit` to the "Mã nhóm VTHH" `AppTextField`, alongside the existing `readOnly: widget.isEdit`. In edit mode this now renders through `AppTextField`'s existing `Colors.grey.shade200` fallback, matching the "Thuộc nhóm" field. In create mode (`isEdit: false`) the field stays fully editable and untouched (`enabled: true`, `readOnly: false`), same as before.
- Removed the stale `BUG-W03-062` comment block that had justified the `readOnly`-only decision — it referenced the now-known-stale edit-mode Figma mockup and no longer reflects the correct behavior.
- **`AppTextField` canonical widget untouched** — no shared-widget change was needed; this was purely a call-site defect (Shared-Symbol Blast-Radius Gate, locus (a)). `AppTextField` has 61 consumers across the app; none of their behavior changes.
- **Out of scope (per verify.md §3.3, explicitly flagged as a separate finding, not this bug's root cause)**: `AppTextField`'s own hardcoded `Colors.grey.shade200`/`Colors.white` literals (design-token violation, should be `AppColors.*`) were **not** touched — that's a pre-existing debt item independent of this bug, left for a separate DEBT ticket per the verify doc's own recommendation.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` | Added `enabled: !widget.isEdit` to the "Mã nhóm VTHH" `AppTextField`; removed stale `BUG-W03-062` justification comment |
| `mobile/gf-garage-app/test/ui/inventory_catalog/widgets/material_group_form_bug_173_test.dart` | **New** — edit mode: code field `enabled == false` + `readOnly == true`; create mode: code field `enabled == true` + `readOnly == false` (no regression on FEAT-CAT-GRP-CREATE) |

## 5. Regression / verification

- `material_group_form_bug_173_test.dart` — 2 widget tests, locating the code field via its existing `Semantics(identifier: 'field-group-code')` ancestor: (1) `isEdit: true` → `AppTextField.enabled == false` (grey-fill branch reachable) and `readOnly == true` (still rejects input, no regression on `BR-CAT-GRP-004`); (2) `isEdit: false` → `enabled == true`, `readOnly == false` (Create screen unaffected).
- No pre-existing test asserted the old (incorrect) `enabled`/`readOnly` combination for this field — confirmed via `grep -rl "field-group-code\|GroupCodeField" test/` before writing the new test, so no conflicting assertions to update.
- `material_group_form_bug_064_test.dart` (sibling "Thuộc nhóm" lock test) re-read — asserts only the parent-group `DropdownMenuWidget`, not the code field; unaffected by this change.
- `python3 scripts/check-mobile-canonical-primitives.py --file material_group_form.dart`: 2 pre-existing P2 hits (`setState()` in the parent/status dropdown `onSelected` callbacks) — confirmed identical to the finding already documented in `BUGFIX-BUG-W03-064.md` §5, on lines untouched by this fix. Not in scope.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on PATH in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). New test file is static-correct: verified field/type names against `MaterialGroupForm`/`AppTextField` and the `wrapLocalized`/`loadViTranslations` test-support helpers already used by sibling tests in this suite (`material_group_form_bug_065_test.dart`, `material_group_form_bug_064_test.dart`).
- KG update: **skipped** — no entity/event/permission change, UI-only styling fix.

## 6. Non-goals / out of scope

- Did not fix `AppTextField`'s own hardcoded `Colors.grey.shade200`/`Colors.white` (design-token debt, §3.3 of verify doc — explicitly called out as a separate, non-blocking finding) — left as a follow-up DEBT item, not part of this bug's root cause.
- Did not add the AC-2-mandated helper hint text ("Không được sửa mã nhóm sau khi tạo.") under the code field — that gap pre-dates this bug, is not what BUG-W03-173 reported (which is specifically about fill color, not missing helper text), and would be scope expansion; flagging here as a residual AC-2 gap for a future bug/DEBT ticket.
- Did not update the Figma edit-mode mockup (`Product/ux/figma-mobile/wave03-cat-grp-edit.md`) — already flagged STALE via `FEAT-CAT-GRP-EDIT.md` v5's Change Log (same staleness note that also covers the "Thuộc nhóm" field in `BUGFIX-BUG-W03-064.md`); needs a designer update at the next `/prefetch-figma` pass, not part of this code fix.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-06 | 1 | agent-fix-garage-mobile | Fix — added `enabled: !widget.isEdit` to the "Mã nhóm VTHH" `AppTextField` in `material_group_form.dart`, matching the already-correct "Thuộc nhóm" disabled pattern; removed stale `BUG-W03-062` comment that had justified the readOnly-only decision based on a now-flagged-stale Figma mockup. New widget regression test (2 tests, both modes). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (no entity/permission change). |
