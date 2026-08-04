# BUGFIX — BUG-W03-078

> Primary CTA on the Material Group Add screen must read "Lưu" (Save) per live Figma re-verify — code was wired to "Tạo" (Create).
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) reported a wording mismatch on the "Thêm nhóm vật tư hàng hóa" (Add Material Group) screen's primary button, referencing live Figma node `21555:24247` ("Button Tạo -> Lưu"). The orchestrator independently re-fetched the same file (`5YU4H3iY726P8KNxI9oCYF`), frame "Thêm Nhóm vật tư hàng hóa", Action bar instance `21252:51305`, and confirmed the primary button (background `#0052ff`) has verbatim text **"Lưu"**. The mobile code (`add_material_group_page.dart`) had the primary button wired to `LocaleKeys.common_create.tr()` ("Tạo") instead.

## 2. Root cause

`add_material_group_page.dart`'s `_buildFooter()` builds the pinned-bottom `BottomNavigationBarButton` with two `BottomActionButtonConfig` entries — a secondary "Huỷ" and a primary submit button. The primary button's `title` was set to `LocaleKeys.common_create.tr()`. This is a plain wording drift: the sibling `edit_material_group_page.dart` screen already uses `LocaleKeys.common_save.tr()` ("Lưu") correctly for its own primary button, and the Add screen's Figma frame ("Thêm Nhóm vật tư hàng hóa") shares the same Action bar component as Edit — both are "Lưu", not "Tạo". No logic/state bug — purely a display-label key mismatch, isolated to this one call site.

## 3. Fix

- **`add_material_group_page.dart`** (`_buildFooter`) — changed the primary `BottomActionButtonConfig.title` from `LocaleKeys.common_create.tr()` to `LocaleKeys.common_save.tr()`. One line changed, no structural change to the widget tree.
- **Locale key verify (no new entry)** — confirmed `common_save` already exists in both `assets/localizations/vi.json:1074` ("Lưu") and `assets/localizations/en.json:1081` ("Save"), and is already consumed by `edit_material_group_page.dart:120`. No new key added to either JSON file, per the fix scope in the BUGS.md Notes column ("KHÔNG tạo key mới").
- **Secondary button re-verify (no change)** — the "Huỷ" secondary button (`AppColors.buttonBackgroundSecondaryStrong` / `buttonContentSecondaryStrong` override from BUG-W03-071) was re-checked against the same `21555:24247` node fetch and confirmed still correct (`#eaeaea` background) — left untouched.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` | 1-line change: primary `BottomActionButtonConfig.title` `LocaleKeys.common_create.tr()` → `LocaleKeys.common_save.tr()` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_add/add_material_group_page_bug_078_test.dart` | **New** — static-source-pin regression test, 3 cases |

## 5. Regression / verification

- `add_material_group_page_bug_078_test.dart` (static-source-pin, same strategy as `material_group_footer_secondary_color_bug_071_test.dart` — the page wires its cubit through getIt + AutoRoute + BasePage with no DI-mocking precedent in this suite):
  1. `add_material_group_page.dart` no longer contains `LocaleKeys.common_create.tr()`, and the primary `BottomActionButtonConfig` is wired to `title: LocaleKeys.common_save.tr()` / `onTap: () => _submit(context)` / `isActive: canSubmit`.
  2. GRP Add's primary-button wiring matches the GRP Edit sibling screen's `common_save` usage (cross-screen consistency check).
  3. The secondary "Huỷ" button keeps its full BUG-W03-071 wiring (`common_cancel` + `isPrimary: false` + `secondaryBackgroundColor`/`secondaryContentColor` = `AppColors.buttonBackgroundSecondaryStrong`/`buttonContentSecondaryStrong`) — unaffected by this fix.
  - All 3 regex assertions were independently dry-run against the live post-fix source (`python3 -c ...`) before being written into the test file — all matched.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_add/add_material_group_page.dart` → **OK, 0 anti-pattern hit**.
- Brace/paren/bracket balance verified manually (Python count script) on the touched lib file — `()`/`{}`/`[]` all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on PATH in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`; `fvm`/`flutter`/`dart` all resolve to "command not found"). The new test file is static-correct: field/class names (`BottomActionButtonConfig`, `LocaleKeys.common_save`/`common_cancel`, `AppColors.buttonBackgroundSecondaryStrong`/`buttonContentSecondaryStrong`) were cross-checked against the real `add_material_group_page.dart` and `edit_material_group_page.dart` source, and the `common_save` key's presence/value was verified directly against `assets/localizations/{vi,en}.json`.
- KG update: **skipped** — this is a UI display-string-only fix (no entity/event/permission schema change).

## 6. Non-goals / out of scope

- Did not touch `edit_material_group_page.dart` — it already uses `common_save` correctly and was only read for cross-reference.
- Did not touch any locale JSON file — `common_save` already existed with the correct verbatim value ("Lưu" / "Save") for both locales.
- Did not re-litigate the secondary "Huỷ" button styling (BUG-W03-071) — re-verified against the same live Figma node fetch and confirmed already correct, left untouched.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — primary CTA `LocaleKeys.common_create.tr()` → `LocaleKeys.common_save.tr()` on GRP Add screen, matching live Figma node 21555:24247 / Action bar 21252:51305 verbatim "Lưu". No new locale key. 1 new regression test file (3 cases, static-source-pin). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
