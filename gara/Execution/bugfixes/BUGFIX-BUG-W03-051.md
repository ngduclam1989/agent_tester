# BUGFIX — BUG-W03-051

> Result-count text sai font (1 Text style thay vì 2-phần như booking_search_page.dart) + PROD locale key sai content so chính spec của nó
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

`MaterialGroupSearchPage` and `InternalProductSearchPage` (`lib/ui/inventory_catalog/{material_group_search,internal_product_search}/*_page.dart`) both rendered their search-result-count line as a single `Text` widget styled `AppTextStyle.textCaptionC7` + `AppColors.textTertiary` (small, uniformly grey). The user requested this match `lib/ui/booking/booking_search/booking_search_page.dart`'s pattern (~line 137-142), which splits the line into a `Row` of two `Text` widgets with different typography weight (larger "count + phrase" segment, smaller keyword segment). Separately, PROD's own `catProd_searchResultCount` locale value had unrelated content defect: wrong word order (keyword before count), straight quotes, and an em-dash separator — none of which matched PROD's own Figma spec (`wave03-cat-prod-list.md:263`), which requires the exact same structure as GRP.

## 2. Root cause

**(a) Font/structure** — both pages were authored with a single templated `LocaleKeys.*_searchResultCount.tr(namedArgs: {keyword, count})` string rendered as one `Text`, instead of following the 2-part `Row` pattern already established by `booking_search_page.dart` for the same UI concept (result count + search keyword recap). No prior review caught the divergence because both pages compiled and rendered a readable, non-empty result-count line — the defect is purely typographic/structural fidelity, not a functional break.

**(b) PROD content defect** — `catProd_searchResultCount` (vi.json) read `"\"{keyword}\" — {count} kết quả"` (keyword first, straight quotes, em-dash), which was never verified against `catGrp_searchResultCount` (`"{count} kết quả tìm kiếm cho "{keyword}""`, count first, curly quotes, no em-dash) or PROD's own Figma spec (`wave03-cat-prod-list.md:263`, `_png_verified`: `"1 kết quả tìm kiếm cho "IP-BP-0001""` — identical structure to GRP). The two locale keys were authored independently for GRP vs PROD and drifted.

## 3. Fix

**(a) Font/structure (both GRP + PROD)** — replaced the single `Text` with a `Row` of 2 `Text` widgets, matching booking's exact structural/font pattern but preserving GRP/PROD's own curly-quote requirement (booking's own screen legitimately uses straight quotes because its own Figma spec doesn't require curly quotes — that difference is domain-specific and was NOT applied backwards onto GRP/PROD):

```dart
// lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart
// lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart
Row(
  children: [
    Text(
      LocaleKeys.catGrp_searchResultCountPrefix.tr(namedArgs: {
        'count': '${state.groups.length}',
      }),
      style: AppTextStyle.textSubtitleS5,
    ),
    Expanded(
      child: Text(
        ' “${state.keyword}”',
        style: AppTextStyle.textCaptionC5,
        overflow: TextOverflow.ellipsis,
      ),
    ),
  ],
),
```

(PROD identical, using `catProd_searchResultCountPrefix` + `state.products.length`.)

The keyword's curly quotes (“ ”, U+201C/U+201D) are written as literal characters directly in the Dart source, matching the existing codebase convention already used elsewhere (`lib/ui/inventory/inventory_search/inventory_search_page.dart:201` — `'“${state.myKeyword}”'`), not `\u` escape sequences.

**(b) Locale key split** — `catGrp_searchResultCount`/`catProd_searchResultCount` (single template combining count+phrase+keyword) removed and replaced with `catGrp_searchResultCountPrefix`/`catProd_searchResultCountPrefix` (count+phrase only, no keyword) in both `assets/localizations/vi.json` and `assets/localizations/en.json`:

| Key | vi | en |
|---|---|---|
| `catGrp_searchResultCountPrefix` (new) | `{count} kết quả tìm kiếm cho` | `{count} results for` |
| `catProd_searchResultCountPrefix` (new) | `{count} kết quả tìm kiếm cho` | `{count} results for` |
| `catGrp_searchResultCount` (removed) | was `{count} kết quả tìm kiếm cho "{keyword}"` (curly) | was `{count} results for "{keyword}"` (curly) |
| `catProd_searchResultCount` (removed, content bug) | was `"{keyword}" — {count} kết quả` (straight, keyword-first, em-dash) | was `"{keyword}" — {count} results` (straight, keyword-first, em-dash) |

`grep -rn "catGrp_searchResultCount\|catProd_searchResultCount" lib/` confirmed both old keys had exactly 1 consumer each (the 2 page files being fixed), so the old keys were removed rather than left as dead entries.

**(c) PROD content bug closure** — the new `catProd_searchResultCountPrefix` uses the same wording as `catGrp_searchResultCountPrefix` ("{count} kết quả tìm kiếm cho"), matching both GRP and PROD's own Figma spec — the old broken keyword-first/em-dash/straight-quote wording was not carried over.

## 4. Shared-Symbol Blast-Radius Gate

No shared widget/util touched — both call sites are page-local `Row`/`Text` fragments, not a shared component. `LocaleKeys.catGrp_searchResultCountPrefix`/`catProd_searchResultCountPrefix` are each used by exactly 1 page (their respective search page), confirmed via `grep -rn`.

## 5. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_search/material_group_search_page.dart` | Result-count `Text` → `Row([Text(prefix, textSubtitleS5), Expanded(Text(curly-keyword, textCaptionC5, ellipsis))])`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_search/internal_product_search_page.dart` | Same restructure, using `catProd_searchResultCountPrefix` + `state.products.length`. |
| `mobile/gf-garage-app/assets/localizations/vi.json` | Removed `catGrp_searchResultCount`/`catProd_searchResultCount`; added `catGrp_searchResultCountPrefix`/`catProd_searchResultCountPrefix` (adjacent to old key positions). |
| `mobile/gf-garage-app/assets/localizations/en.json` | Same key swap, en wording. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_result_count_test.dart` | **NEW** — 3 widget tests: Row has 2 Text children; first Text styled `textSubtitleS5` no color override; second Text curly-quoted keyword styled `textCaptionC5` in `Expanded` with ellipsis. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_result_count_test.dart` | **NEW** — same 3 cases for PROD, plus explicit assertion that the old broken `"keyword" — count kết quả` form is absent. |

## 6. Regression / verification

- `material_group_search_result_count_test.dart` / `internal_product_search_result_count_test.dart`:
  - Result-count area renders a `Row` with exactly 2 `Text` descendants (not 1 single `Text`).
  - First `Text` matches the localized prefix string (`LocaleKeys.*_searchResultCountPrefix.tr(namedArgs:{count})`), styled `AppTextStyle.textSubtitleS5`, no `color` override (i.e. not tertiary-grey).
  - Second `Text` is the curly-quoted keyword (` "keyword"` with U+201C/U+201D), styled `AppTextStyle.textCaptionC5`, `overflow: TextOverflow.ellipsis`, wrapped in an `Expanded` ancestor.
  - PROD test additionally asserts the straight-quote/em-dash/keyword-first old wording (`'"IP-BP-0001" — 1 kết quả'`) is NOT rendered and the new prefix (`'1 kết quả tìm kiếm cho'`) contains no em-dash.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` (run from design-repo root) → **OK: 0 anti-pattern hit** for both touched page files and both new test files.
- Brace/paren/bracket balance verified via a Python character-count script for all 4 touched/created files — all balanced.
- Curly-quote character audit: `python3` string-membership check confirms both page files use the literal `“${state.keyword}”` form (U+201C/U+201D) and do **not** contain the straight-quote form `"${state.keyword}"`.
- `assets/localizations/{vi,en}.json` re-parsed via `json.load` after edits — both valid JSON.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`). TEST_GROUP must re-run on a machine with the correct toolchain (Flutter 3.41/Dart 3.11) before flipping to `VERIFIED`.
- `lib/generated/locale_keys.gen.dart`: **the entire `lib/generated/` directory does not exist in this checkout** (gitignored, codegen-only output — confirmed via `find . -iname "*.gen.dart"` returning nothing repo-wide, not just for this file). The task's fallback instruction ("manually add entries to `locale_keys.gen.dart` following neighboring entries") could not be executed because there is no file to hand-edit and no neighboring entries to pattern-match against. **This is a pre-existing environment gap** (same root cause as `DEBT-W01-MOBILE-BUILD-ENV` — no toolchain means no codegen output checked into this sandbox), not something introduced by this fix. Flagged in `needs_review`: whoever runs this fix cycle's output through a real toolchain MUST run `fvm dart run easy_localization:generate -S assets/localizations -O lib/generated -o locale_keys.gen.dart -f keys` (or `build_runner`) before `flutter analyze`/`flutter build` will succeed, since the page files now reference `LocaleKeys.catGrp_searchResultCountPrefix`/`catProd_searchResultCountPrefix`, which do not yet exist as generated symbols anywhere in this checkout.

## 7. Non-goals / out of scope

- `booking_search_page.dart` was read-only reference — not modified. Its straight-quote wording is a legitimate per-domain difference (its own Figma spec doesn't require curly quotes) and was not "corrected" to curly quotes.
- No other consumer of `catGrp_searchResultCount`/`catProd_searchResultCount` existed, so no other call site needed updating.
- No shared widget/component was touched.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — BUG-W03-051 result-count Row/2-Text restructure + PROD locale content fix. |
