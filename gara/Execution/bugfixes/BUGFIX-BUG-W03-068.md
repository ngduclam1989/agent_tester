# BUGFIX — BUG-W03-068

> Residual Figma-fidelity finding on `InternalProductDetailPage` (`FEAT-CAT-PROD-DETAIL`), re-audited against live Figma after the original `BUG-W03-053` fix cycle: (1) all 4 `ProductInfomation` card containers still used `BorderRadius.circular(8)` instead of the Figma-mandated `circular(12)`; (2) the `catProd_descriptionAndSpec` section title locale value was "Mô tả & quy cách" but the live Figma verbatim text is "Quy cách mô tả".
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`internal_product_detail_page.dart` renders 4 `ProductInfomation` card widgets (`_HeaderCard`, `_GeneralInfoCard`, `_TechnicalSpecCard`, `_SpecDescriptionCard`). All 4 used `BoxDecoration(borderRadius: BorderRadius.circular(8), ...)`. Live re-fetch of Figma node `21526:45088` (file `5YU4H3iY726P8KNxI9oCYF`) — performed independently by this fix cycle in addition to the orchestrator's prior confirmation — shows all 4 card containers use `rounded-[var(--spacing---border/12,12px)]`, i.e. radius 12, not 8. Separately, the `_SpecDescriptionCard` section title used locale key `catProd_descriptionAndSpec`, whose `vi.json` value was "Mô tả & quy cách"; the live Figma node `21526:45132` verbatim text is "Quy cách mô tả".

## 2. Root cause

- **Radius**: the original `BUG-W03-034` fix (which added `BoxDecoration`/`borderRadius`/`boxShadow` to these 4 cards in the first place) pinned `circular(8)`. The subsequent `BUG-W03-053` audit flagged the radius mismatch but classified it P3 ("có thể là chuẩn hoá hệ thống, không chắc là bug") and explicitly left it out of that fix's scope. Sibling screens (`InternalProductListPage`, `MaterialGroupListPage`, `MaterialGroupDetailPage`) had since been corrected to radius 12 elsewhere in the W03 cycle, but `InternalProductDetailPage`'s 4 cards were never revisited — a residual drift, not a new regression.
- **Text**: during the `BUG-W03-053` fix cycle, an earlier uncommitted WIP pass had (correctly) set the value to "Quy cách mô tả", but a later step in that same cycle reverted it back to "Mô tả & quy cách" under the mistaken belief that the pre-fix HEAD value was already correct and that "Quy cách mô tả" came from misreading the bug row's "X→Y" notation backwards. This fix cycle re-fetched the live Figma node twice independently (orchestrator + this agent) and confirmed the reverted value was the wrong one.

## 3. Fix

- **`internal_product_detail_page.dart`** — changed `BorderRadius.circular(8)` → `BorderRadius.circular(12)` at all 4 card-decoration call sites (lines 152, 202, 261, 299 — `_HeaderCard`/`_GeneralInfoCard`/`_TechnicalSpecCard`/`_SpecDescriptionCard`).
- **`assets/localizations/vi.json`** — `catProd_descriptionAndSpec` value changed from `"Mô tả & quy cách"` to `"Quy cách mô tả"` (verbatim Figma node `21526:45132`).
- **`assets/localizations/en.json`** — `catProd_descriptionAndSpec` value changed from `"Description & specification"` to `"Specification & description"` (word order flipped to match the corrected vi ordering; no independent Figma citation exists for the EN string — semantic equivalent, not a verbatim source).
- **`test/.../internal_product_detail_bug_053_test.dart`** — the existing test `'catProd_descriptionAndSpec is "Mô tả & quy cách"'` (with a comment claiming the old value was "correct, reverted from a WIP misread") asserted the disproven value. Updated the assertion to expect `"Quy cách mô tả"` and replaced the incorrect comment with a note pointing to this bug's second independent live re-verification.
- **`test/.../internal_product_detail_card_decoration_test.dart`** (BUG-W03-034's regression test, not in the originally stated Touch-scope but a direct, unavoidable consequence of the radius fix) — its assertion counted exactly 4 occurrences of `BorderRadius.circular(8)` in the page source; left unchanged it would fail post-fix while asserting a value now proven wrong by two independent live Figma fetches. Updated the regex/assertion + inline comment to `circular(12)`.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | `BorderRadius.circular(8)` → `circular(12)` at 4 call sites (152, 202, 261, 299) |
| `mobile/gf-garage-app/assets/localizations/vi.json` | `catProd_descriptionAndSpec`: "Mô tả & quy cách" → "Quy cách mô tả" |
| `mobile/gf-garage-app/assets/localizations/en.json` | `catProd_descriptionAndSpec`: "Description & specification" → "Specification & description" |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_bug_053_test.dart` | Assertion + comment updated to expect "Quy cách mô tả" |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/internal_product_detail_card_decoration_test.dart` | Assertion + comment updated to expect `circular(12)` (BUG-W03-034 test, downstream of same root cause) |

## 5. Regression / verification

- `internal_product_detail_bug_053_test.dart` — `'catProd_descriptionAndSpec is "Quy cách mô tả"'` now fails against pre-fix `vi.json` and passes against post-fix `vi.json` (fail-before/pass-after).
- `internal_product_detail_card_decoration_test.dart` — `'all 4 detail cards apply borderRadius: BorderRadius.circular(12)'` now fails against pre-fix source (0 matches) and passes against post-fix source (4 matches).
- `python3 scripts/check-mobile-canonical-primitives.py --file lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` (run from design-repo root against the mirrored path) → `OK: 0 anti-pattern hit`.
- `vi.json`/`en.json` parsed successfully with `python3 -m json` (no syntax errors introduced).
- Brace/paren/bracket balance verified manually with a string/comment-aware scanner on all 3 changed Dart files (naive-scanner false positives from apostrophes in Vietnamese string literals were double-checked and ruled out) — all balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain available in this environment (no `fvm`/`flutter`/`dart` on `PATH`, no `.fvm/` directory), consistent with `DEBT-W01-MOBILE-BUILD-ENV`. Changes are narrowly scoped (2 literal value changes in 1 source file + 2 JSON string values + 2 test assertions) with no new symbols, imports, or API surface — low regression risk from unverified static analysis.
- KG update: **skipped** — pure UI token (radius) + locale string value fix, no entity/event/permission/API change.

## 6. Non-goals / out of scope

- Did not re-audit the other 4 sibling screens (`InternalProductListPage`, `MaterialGroupListPage`, `MaterialGroupCreatePage`, `MaterialGroupDetailPage`) mentioned in the bug's Notes as already-corrected to radius 12 — out of this bug's Touched-files scope, and the bug notes state they were already verified fixed.
- Did not touch the EN locale value beyond a semantic reordering — no independent EN-verbatim Figma source exists to cite, per the task's explicit instruction to use judgment for the EN pairing.
- Did not extend `check-mobile-canonical-primitives.py` or add a new golden/visual test — the existing static source-assertion test convention for this page (established by `BUG-W03-034`/`BUG-W03-053`) was reused and corrected in place rather than introducing a new test mechanism.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — card radius 8→12 (4 call sites) + `catProd_descriptionAndSpec` locale value corrected to "Quy cách mô tả" (vi) / "Specification & description" (en); updated 2 existing regression tests (`internal_product_detail_bug_053_test.dart`, `internal_product_detail_card_decoration_test.dart`) that pinned the disproven values. `flutter analyze`/`flutter test` DEFERRED (no matching toolchain). |
