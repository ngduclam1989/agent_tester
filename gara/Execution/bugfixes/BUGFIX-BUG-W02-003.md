# BUGFIX BUG-W02-003 — Dossier widgets use LocaleKeys instead of hardcoded Vietnamese

> **Bug L1 status (per `Tracking/WAVE02/BUGS.md`)**: OPEN → RESOLVED.
> **Authored by**: subagent `agent-fix-garage-mobile` (W02, 2026-06-18).
> **Scope**: 4 dossier widgets + locale bundles + generated keys. Same FEAT-INS-DOSSIER-CREATE. NO cross-boundary edit.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W02-003 (P2, OPEN → RESOLVED) |
| Symptom | All 4 dossier widgets (`insurance_dossier_screen.dart`, `insurance_dossier_tab.dart`, `acceptance_form_page.dart`, `authorization_form_page.dart`) hardcoded Vietnamese strings (e.g. `'Tạo hồ sơ bảo hiểm'`, `'Lưu thông tin'`, `'Bộ hồ sơ #v…'`, `'Chưa có hồ sơ bảo hiểm nào được xuất'`) — not routed through `LocaleKeys.*.tr()`. FEAT-INS-DOSSIER-CREATE §4.5 requires the `insuranceDossier*` namespace. |
| Category | P2 i18n drift — locale bundle bypass |
| Reporter | agent-fix-garage-mobile (REVIEW finding) |
| Spec | FEAT-INS-DOSSIER-CREATE §4.5 i18n + a11y |

## 2. Root-cause Why-chain

### Why #1 — Why were strings hardcoded inline?

W02 Phase B mobile slice 1 (insurance dossier UI) shipped without an i18n pass — DEV implemented the screen wrapped with String literals to reach a working flow quickly, intending to backfill keys before REVIEW. The backfill was missed.

### Why #2 — Why does this matter?

`lib/app/app.dart:72` calls `context.setLocale(const Locale('vi'))` as default but the app supports `Locale('en')` via `localizationsDelegates`/`supportedLocales`. Without keys in `vi.json`/`en.json`, switching locale (or any future Cambodian/Lao language) leaves the dossier screens stuck in Vietnamese.

### Why #3 — Why does the FEAT spec namespace use `insuranceDossier*` while this repo uses `snake_case` keys?

The FEAT was written against ARB conventions (`intl_*.arb` keys are typically camelCase). This repo uses `easy_localization` with snake_case keys via a single `vi.json`/`en.json` bundle + generated `LocaleKeys` constants in `lib/generated/locale_keys.gen.dart`. The fix follows the repo convention (snake_case) — `insurance_dossier_*` — preserving the spec intent (single namespace) while staying consistent with the 800+ existing keys.

### Root cause

DEV omitted the i18n pass for dossier widgets. The locale infrastructure (easy_localization + generated `LocaleKeys`) is in place — just need to add keys + swap literals to `.tr()` calls.

## 3. Fix

**Files**:

- `mobile/gf-garage-app/assets/localizations/vi.json` — added 18 keys under namespace `insurance_dossier_*` (screen_title, progress_*, subtitle_*, btn_*, export_success, empty_state, version_*, doc_semantics, acceptance_title, authorization_title).
- `mobile/gf-garage-app/assets/localizations/en.json` — same 18 keys with English translations.
- `mobile/gf-garage-app/lib/generated/locale_keys.gen.dart` — added 18 corresponding constants (the file's header says "DO NOT EDIT" but it's the only way to expose the keys without running `easy_localization:generate` in the agent env which lacks the toolchain; the fix re-runs deterministically next regen).
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_screen.dart` — swapped 10 hardcoded strings to `LocaleKeys.insurance_dossier_*.tr()`; added `import 'package:easy_localization/easy_localization.dart';` + `import 'locale_keys.gen.dart';`. For interpolated strings (e.g. `'$selectedCount/$total tài liệu sẵn sàng'`), used `tr(namedArgs: {'selected': '...', 'total': '...'})` with placeholder syntax in the JSON value (e.g. `"{selected}/{total} tài liệu sẵn sàng"`).
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_tab.dart` — swapped 5 hardcoded strings (empty state x2, version header, version subheader, doc semantics label).
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/acceptance_form_page.dart` — swapped AppBar title + Save button title (2 strings).
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/authorization_form_page.dart` — swapped AppBar title + Save button title (2 strings).

### Why this scope (not all 60+ form field labels)?

Per the bug's L2 Notes ("in-feat TC mobile-ui i18n smoke vi/en") + FIX agent rule of minimum scope, this PR keeps the scope to:

1. **AppBar titles** (high-visibility, user-facing on every entry).
2. **Action buttons** (Cancel, Save, Export).
3. **Empty-state and progress text** (the strings the bug explicitly called out).
4. **Version header/subheader** (the strings the bug explicitly called out).
5. **Semantics labels** for screen reader users (a11y per FEAT §4.5).

Form field labels inside `DossierFormSection` (e.g. `'Biển kiểm soát'`, `'Tên khách hàng'`, 50+ lines) are NOT covered by this PR — they are documented as `DEBT-W02-DOSSIER-FORM-FIELD-I18N` (follow-up backlog). The bug Title + L2 scope ("smoke vi/en") explicitly targets the prominent strings; tackling field-label sweep here would expand scope beyond the brief.

## 4. Blast radius

| Area | Change | Risk |
|---|---|---|
| `vi.json` / `en.json` | Additive — 18 new keys, no existing modification. | None. easy_localization tolerates extra keys. |
| `locale_keys.gen.dart` | Additive — 18 new constants appended before final `}`. | Next `dart run build_runner build` regen will re-emit these; idempotent. |
| 4 widget files | Replace literals with `.tr()`. Output unchanged in Vietnamese (translations preserved 1:1). | None — VI output identical, EN now works. |
| Other features | NO CHANGE. | None. |
| BFF / backend | NO CHANGE. | None. |

Cross-boundary: NONE. Contract change: NONE.

## 5. Regression test

Added `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_003_dossier_i18n_test.dart`:

- Pins the 18 production keys list.
- Asserts every key is declared as a `LocaleKeys.*` constant (catches drift in `locale_keys.gen.dart` regen).
- Asserts every key is present + non-blank in `vi.json` (real file load).
- Asserts every key is present + non-blank in `en.json` (real file load).
- Pins the user-facing Vietnamese strings for the 3 specific examples the bug called out: `'Tạo hồ sơ bảo hiểm'`, `'Lưu thông tin'`, `'Chưa có hồ sơ bảo hiểm nào được xuất'` — ensures the translation backing actually says what the bug expected.
- Greps the 4 production widgets and asserts **none** of the BUG-W02-003 forbidden literals are still present — catches future regression where someone re-hardcodes.

Run: `fvm flutter test test/ui/settlement/insurance_dossier/bug_w02_003_dossier_i18n_test.dart` (deferred to TEST_GROUP per DEBT-W01-MOBILE-BUILD-ENV).

## 6. Build / lint / test status

| Gate | Result |
|---|---|
| `fvm flutter analyze` | DEFERRED — no Flutter toolchain in agent env. Code reviewed statically; new imports (`easy_localization`, `locale_keys.gen.dart`) match the proven pattern used in `service_order_v3/.../tabs/payment_history_tab.dart`. |
| `fvm flutter test` | DEFERRED — TEST_GROUP. Tests are pure-Dart string + file assertions. |

## 7. Files changed

- `mobile/gf-garage-app/assets/localizations/vi.json` (+18 keys)
- `mobile/gf-garage-app/assets/localizations/en.json` (+18 keys)
- `mobile/gf-garage-app/lib/generated/locale_keys.gen.dart` (+18 constants)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_screen.dart` (i18n swap + imports)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/insurance_dossier_tab.dart` (i18n swap + imports)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/acceptance_form_page.dart` (i18n swap + imports)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/authorization_form_page.dart` (i18n swap + imports)
- `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_003_dossier_i18n_test.dart` (new regression test)
- `Tracking/WAVE02/BUGS.md` (status OPEN → IN_PROGRESS → RESOLVED + `[FIXED ...]` note)

## 8. Don't-touch list

- Existing 800+ locale keys — untouched.
- `lib/app/app.dart` locale boot — untouched.
- `lib/generated/locale_keys.gen.dart` header comment "DO NOT EDIT" — kept as-is; additive append only.
- `DossierFormField` widget — untouched.
- Form field labels inside `DossierFormSection` (50+ lines of `'Biển kiểm soát'`, `'Tên khách hàng'`, etc.) — documented as `DEBT-W02-DOSSIER-FORM-FIELD-I18N` follow-up, NOT in BUG-W02-003 scope.
