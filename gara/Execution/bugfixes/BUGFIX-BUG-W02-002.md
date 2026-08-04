# BUGFIX BUG-W02-002 — Dossier date fields use dd/MM/yyyy via picker

> **Bug L1 status (per `Tracking/WAVE02/BUGS.md`)**: OPEN → RESOLVED.
> **Authored by**: subagent `agent-fix-garage-mobile` (W02, 2026-06-18).
> **Scope**: 2 dossier form pages + 1 shared widget file. Same FEAT-INS-DOSSIER-CREATE. NO cross-boundary edit.

---

## 1. Failure mode (observed)

| Field | Value |
|---|---|
| Bug | BUG-W02-002 (P1, OPEN → RESOLVED) |
| Symptom | 5 date fields (`billDate`, `quoteDate`, `dateIssued`, `customerCertDate`, `accidentDate`) rendered hint `YYYY-MM-DD` and accepted any free-text string. SDL spec (`AcceptanceFormInput.billDate`, `AuthorizationFormInput.dateIssued`/`accidentDate`) and FEAT-INS-DOSSIER-CREATE §4.5 require `dd/MM/yyyy`. Users following the hint typed `2026-06-15` → BFF mutation `exportInsuranceDossier` sent `YYYY-MM-DD` strings to `gf-accounting` → Thymeleaf render of `acceptance-record.html` / `authorization-letter.html` reformats as ISO date or fails parse. |
| Category | P1 UI/Contract — date format drift mobile vs BFF SDL vs Thymeleaf template |
| Reporter | agent-fix-garage-mobile (REVIEW finding, agent-review-garage-mobile cycle 1) |
| Spec | FEAT-INS-DOSSIER-CREATE AC-6 / SDL `AcceptanceFormInput.billDate` + `AuthorizationFormInput.dateIssued`/`accidentDate` (dd/MM/yyyy comments) / FEAT §4.5 `AppDatePicker` vi locale |

## 2. Root-cause Why-chain

### Why #1 — Why did the form render `YYYY-MM-DD` as the hint?

`mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/acceptance_form_page.dart:155,161` and `.../authorization_form_page.dart:197,219,243` used `DossierFormField(... hintText: 'YYYY-MM-DD')` with a plain `TextEditingController` and no input formatter. The hint guided users into the wrong format.

### Why #2 — Why is `YYYY-MM-DD` wrong?

The BFF SDL inline comments above each date field say `# dd/MM/yyyy`. `gf-accounting`'s Thymeleaf templates render via `<th:text="${dossier.billDate}">` with no parse layer — they format what the BFF sends. If the BFF receives `YYYY-MM-DD`, the printed dossier either prints the raw ISO string or fails Vietnamese formatting downstream.

### Why #3 — Why was there no format validation gating `_canSave`?

The original `_canSave` getter only checked `controller.text.trim().isNotEmpty` — any non-empty string passed, including ISO and free text. The form would happily build the mutation payload with garbage dates.

### Why #4 — Why didn't FEAT §4.5 (`AppDatePicker` vi locale) get applied at DEV time?

The W02 DEV cycle implemented the dossier forms as plain text fields, deferring the date picker presumably as a polish item. Cycle-2 REVIEW caught it as a P1 because of the contract impact.

### Root cause

Free-text TextField + wrong hint + no validation. The mobile form was not enforcing the BFF SDL date format, allowing users to ship strings `gf-accounting`'s Thymeleaf templates can't render.

## 3. Fix

**Files**:

- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/widgets/dossier_form_field.dart` — added new widget `DossierDateField` (wraps `AppTextFieldCustomWidget` with `onTap` → `showDatePicker` vi locale → writes `dd/MM/yyyy` into the controller, exposes `onChanged` callback for parent `setState`); added helper `isValidDossierDateString` that parses strictly against `DateFormatter.ddMMYYYY` (`dd/MM/yyyy`).
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/acceptance_form_page.dart` — replaced 2 `DossierFormField(hintText: 'YYYY-MM-DD', ...)` rows (`_billDate`, `_quoteDate`) with `DossierDateField(onChanged: (_) => setState(() {}))`; tightened `_canSave` to use `isValidDossierDateString(_billDate.text)` + optional check for `_quoteDate`.
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/authorization_form_page.dart` — same swap for 3 rows (`_dateIssued`, `_customerCertDate`, `_accidentDate`); `_canSave` tightened on `_dateIssued` (required) + `_accidentDate` (required) + `_customerCertDate` (optional).

### Why this fix (not the alternative)?

- **Date picker dialog** (`showDatePicker`) is the smallest change that prevents user typing — the user cannot enter `YYYY-MM-DD` because the picker emits Vietnamese `dd/MM/yyyy` via the existing `intl` + `GlobalMaterialLocalizations` already wired in `lib/app/app.dart:118-126`.
- **Standard Flutter API** instead of the heavier `AppDatePicker` shell — `AppDatePicker` uses an Underline border + different label style; matching the existing `DossierFormField` visual fidelity is cleaner via wrapping `AppTextFieldCustomWidget` with `onTap`.
- **Strict parse** in `isValidDossierDateString` rejects both the wrong format and malformed dates (e.g. `32/13/2026`).
- **`onChanged` callback** wires `setState(() {})` so the parent `_canSave` re-evaluates immediately after the picker pops.
- Per the briefing "minimum scope" rule: no swap of any other field, no refactor of `DossierFormField`, no change to BFF mutation shape.

## 4. Blast radius

| Area | Change | Risk |
|---|---|---|
| `DossierFormField` widget | NO CHANGE — kept as the text-field variant for non-date fields. | None. |
| `DossierDateField` widget (NEW) | Additive — exposes `controller` + writes `dd/MM/yyyy` on pick. | None. |
| `acceptance_form_page.dart` `_canSave` | Tightened — requires valid `dd/MM/yyyy` for `_billDate`; rejects malformed `_quoteDate`. | Existing flow now blocks save until date is picked — matches FEAT-INS-DOSSIER-CREATE AC-6. |
| `authorization_form_page.dart` `_canSave` | Same tightening on 3 date fields. | Same. |
| `dossier_form_inputs.dart` | NO CHANGE — toJson still emits whatever string the controller holds. | None. |
| BFF `exportInsuranceDossier` mutation | NO CHANGE — payload shape identical, only content format constrained. | None — additive correctness gate, not a contract change. |
| `gf-accounting` Thymeleaf render | NO CHANGE — now correctly receives `dd/MM/yyyy` and renders Vietnamese date format. | Positive — fixes BUG-W02-002 root cause. |

Cross-boundary: NONE. Contract change: NONE (string shape preserved, only content format constrained on the client).

## 5. Regression test

Added `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_002_dossier_date_format_test.dart`:

- Asserts `DateFormatter.ddMMYYYY == 'dd/MM/yyyy'` (anchors the canonical SDL format constant).
- `isValidDossierDateString` accepts `dd/MM/yyyy` (`15/06/2026`, `01/01/2020`, trimmed whitespace).
- `isValidDossierDateString` rejects `YYYY-MM-DD` (`2026-06-15`) — the exact format the broken hint had suggested.
- `isValidDossierDateString` rejects null / empty / malformed (`32/13/2026`).

Run: `fvm flutter test test/ui/settlement/insurance_dossier/bug_w02_002_dossier_date_format_test.dart` (deferred to TEST_GROUP — no Flutter toolchain available in this DEV environment per `Execution/FAILURE-MODES.md` DEBT-W01-MOBILE-BUILD-ENV).

## 6. Build / lint / test status

| Gate | Result |
|---|---|
| `fvm flutter analyze` (4 changed files) | DEFERRED — no Flutter toolchain in agent env (FAILURE-MODES.md). Code reviewed statically; no `import` errors expected (`intl` + `DateFormatter` already used elsewhere). |
| `fvm flutter test` | DEFERRED — TEST_GROUP runs on a machine with toolchain. Regression test is pure-Dart string assertion; should pass without app harness. |

## 7. Files changed

- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/widgets/dossier_form_field.dart` (+`DossierDateField` widget, +`isValidDossierDateString` helper, +2 imports `intl` / `DateFormatter`)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/acceptance_form_page.dart` (2 fields swapped to `DossierDateField`; `_canSave` tightened)
- `mobile/gf-garage-app/lib/ui/insurance_settlement/dossier/authorization_form_page.dart` (3 fields swapped to `DossierDateField`; `_canSave` tightened)
- `mobile/gf-garage-app/test/ui/settlement/insurance_dossier/bug_w02_002_dossier_date_format_test.dart` (new regression test)
- `Tracking/WAVE02/BUGS.md` (status OPEN → IN_PROGRESS → RESOLVED + `[FIXED ...]` note)

## 8. Don't-touch list

- BFF SDL `AcceptanceFormInput` / `AuthorizationFormInput` shape — kept as-is (string format dd/MM/yyyy is in the contract comment).
- `gf-accounting` Thymeleaf templates — kept as-is (now receive correct format).
- `dossier_form_inputs.dart` — JSON shape unchanged.
- Other `DossierFormField` callers (non-date labels) — untouched.
