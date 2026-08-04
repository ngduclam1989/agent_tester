# BUGFIX — BUG-W03-169

> Focus field "Mô tả" (multiline) trên màn Chỉnh sửa Nhóm vật tư hàng hoá → bàn phím ảo che khuất hoàn toàn field đang focus, user gõ chữ nhưng không thấy ký tự đang nhập.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-06

## 1. Summary

`MaterialGroupForm` (shared Add/Edit form) wraps its 5 fields in a `SingleChildScrollView`, with the "Mô tả" field (`CountTextField`, `minLines: 4`) last in the column. When the keyboard opens while this field is focused, the field is fully covered and the user cannot see what they're typing.

## 2. Root cause

`CustomScaffold` (`lib/ui/widgets/custom_scaffold.dart`) defaults `resizeToAvoidBottomInset` to `false`. Neither `EditMaterialGroupPage` nor `AddMaterialGroupPage` overrode this to `true`. Without the Scaffold resizing for the keyboard inset, Flutter's built-in scroll-into-view-on-focus behavior (`EditableText`'s internal `Scrollable.ensureVisible` call, triggered automatically for any `TextField`/`TextFormField` inside a `Scrollable` ancestor) never gets correct viewport metrics, so the "Mô tả" field — sitting near the bottom of the form — stays hidden behind the keyboard.

This is a **call-site defect, not a shared-widget defect** (Shared-Symbol Blast-Radius Gate, locus (a)): `CustomScaffold`'s `false` default is correct for the majority of its consumers (list/detail/filter/search/hub screens with no text input), which must keep working unchanged. Two consumers — `EditMaterialGroupPage` and `AddMaterialGroupPage` — both host `MaterialGroupForm` and its "Mô tả" field, so both needed the opt-in.

Audit sweep of every other `CustomScaffold` consumer (9 files: `material_group_filter_page.dart`, `material_group_detail_page.dart`, `material_group_search_page.dart`, `material_group_list_page.dart`, `internal_product_search_page.dart`, `internal_product_detail_page.dart`, `internal_product_list_page.dart`, `internal_product_filter_page.dart`, `inventory_hub_page.dart`) — 7 have no text field at all; the 2 search pages each have a single-line search bar pinned right under the AppBar (not multiline, not buried at the bottom of a long form), so they carry materially lower risk and are out of scope for this FEAT-CAT-GRP-EDIT bug.

## 3. Fix

- **`edit_material_group_page.dart`** — added `resizeToAvoidBottomInset: true,` to the `CustomScaffold(...)` call.
- **`add_material_group_page.dart`** — added `resizeToAvoidBottomInset: true,` to the `CustomScaffold(...)` call (same shared `MaterialGroupForm`/"Mô tả" field, same missing-flag root cause — verify.md §6 blast radius explicitly calls out testing the Create screen alongside Edit).
- **`custom_scaffold.dart`** — left untouched. Default stays `false` (Shared-Symbol Blast-Radius Gate: do not change a shared widget's default to fix 2 consumers).

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_edit/edit_material_group_page.dart` | Added `resizeToAvoidBottomInset: true` to `CustomScaffold` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | Added `resizeToAvoidBottomInset: true` to `CustomScaffold` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_edit/edit_material_group_page_keyboard_avoid_bug_169_test.dart` | **New** — static-source pin: both pages set the flag; `CustomScaffold`'s shared default stays `false` |

## 5. Regression / verification

- `edit_material_group_page_keyboard_avoid_bug_169_test.dart` — 3 tests: (1) `CustomScaffold`'s default `resizeToAvoidBottomInset = false,` line is unchanged (Shared-Symbol Gate guard); (2) `EditMaterialGroupPage`'s `CustomScaffold(...)` call contains `resizeToAvoidBottomInset: true,`; (3) same for `AddMaterialGroupPage`. Static-source regex pin (same strategy as `add_material_group_page_bug_078_test.dart`) because both pages wire their cubit through `getIt` + `AutoRoute` + `BasePage` with no DI-mocking precedent in this suite, so a live widget-test pump isn't practical without adding new test infra out of scope for this bug.
- `python3 scripts/check-mobile-canonical-primitives.py --file <touched files>`: `edit_material_group_page.dart` and `add_material_group_page.dart` both **OK, 0 hit**.
- Manual/device verification (per verify.md §4 pass criteria — focus field always visible above keyboard, cursor position stays in viewport while typing, tested on ≥2 screen sizes, no regression on other fields, Create screen also tested): **not runnable in this sandbox** (no device/emulator) — flagged for TEST_GROUP to confirm on a real device/emulator.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on PATH in this environment (`DEBT-W01-MOBILE-BUILD-ENV`). New test file is static-correct: verified against the actual post-fix source of both touched pages and the `custom_scaffold.dart` default line.
- KG update: **skipped** — no entity/event/permission change, UI-only Scaffold flag.

## 6. Non-goals / out of scope

- Did not touch the other 9 `CustomScaffold` consumers (list/detail/filter/search/hub) — none share the "multiline field near the bottom of a long scrollable form" pattern that causes this bug; changing their default risk profile is unrelated scope.
- Did not add a manual `FocusNode` listener + `Scrollable.ensureVisible()` call (verify.md candidate 3.2) — the `resizeToAvoidBottomInset: true` fix alone restores Flutter's built-in auto-scroll-into-view behavior for fields inside a `Scrollable`, which is sufficient here; adding a redundant manual listener would be unnecessary complexity for this bug's scope. If device verification later shows the built-in behavior is insufficient for very tall multiline content, that would be a follow-up bug, not part of this fix.
- Did not touch `count_textfield.dart`/`app_text_field.dart` — no shared-widget change was needed; root cause was entirely at the page-level `Scaffold` configuration.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-06 | 1 | agent-fix-garage-mobile | Fix — added `resizeToAvoidBottomInset: true` to both `EditMaterialGroupPage` and `AddMaterialGroupPage` `CustomScaffold` calls (shared `MaterialGroupForm`/"Mô tả" field, same root cause). `CustomScaffold` shared default left unchanged (Shared-Symbol Gate). New static-source regression test. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). KG update skipped (no entity/permission change). |
