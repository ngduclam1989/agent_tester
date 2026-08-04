# BUGFIX — BUG-W03-102

> Màn Chi tiết nhóm vật tư hàng hoá (`material_group_detail_page.dart`) dùng em-dash `'—'` làm null-placeholder, khác `'--'` (2 dấu gạch ngang liền) mà List/Search card (`group_list_card.dart`) đã dùng — lệch nội dung chuỗi thuần tuý.
> Severity: **P3** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User report 2026-07-02 (mobile dev): "ở màn Chi tiết nhóm vật tư hàng hoá, thông tin nào null đang hiển thị là -- thì sẽ là - -, cho giống với card, chỉ giống nội dung chứ ko giống kích thước nhé, size như cũ" — Detail page's null-placeholder rendered visually as a single em-dash glyph (`—`, U+2014), which looks distinct from the two-hyphen placeholder (`--`) already used by the List/Search card widget for the exact same purpose. User explicitly scoped the ask to content only, not size/style.

## 2. Root cause

`material_group_detail_page.dart` hardcoded the Unicode em-dash character `'—'` (U+2014, a single glyph) as its null-placeholder string literal in 8 places, while `group_list_card.dart` (confirmed correct, used as the reference) uses the two-character ASCII string `'--'` for the same semantic purpose:

```dart
// group_list_card.dart (reference — already correct, untouched)
group.code != null ? '#${group.code}' : '--'
group.name ?? '--'
group.parentName ?? '--'
```

```dart
// material_group_detail_page.dart (before fix)
String _formatDateTime(String? iso) {
  if (iso == null || iso.isEmpty) return '—';
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return '—';
  ...
}
...
detail.name ?? '—'
value: detail.parentName ?? '—'
value: detail.description ?? '—'
value: detail.createdByName ?? '—'
value: detail.updatedByName ?? '—'
...
detail.code ?? '—'   // in _SummaryHeader
```

This is a pure string-content inconsistency between two widgets that both render null-placeholders for the same domain fields — no `TextStyle`/font-size/`AppTextStyle` was involved.

## 3. Fix

Replaced every occurrence of the em-dash literal `'—'` with the two-hyphen literal `'--'` in `material_group_detail_page.dart` — content-only change, no style/size touched:

```dart
// After
String _formatDateTime(String? iso) {
  if (iso == null || iso.isEmpty) return '--';
  final parsed = DateTime.tryParse(iso);
  if (parsed == null) return '--';
  ...
}
...
detail.name ?? '--'
value: detail.parentName ?? '--'
value: detail.description ?? '--'
value: detail.createdByName ?? '--'
value: detail.updatedByName ?? '--'
...
detail.code ?? '--'   // in _SummaryHeader
```

Also updated the doc-comment directly above `_formatDateTime()` (previously said `Guards null/parse-fail with '—' (matches the existing `?? '—'` fallback convention...`) so it stays accurate to the new literal.

No `TextStyle`/`AppTextStyle`/font-size/font-weight change on any `Text`/`StartInfoRow` — every surrounding widget's `style:` param is byte-for-byte unchanged.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | 8 occurrences of `'—'` → `'--'` (2 in `_formatDateTime()` return branches, `detail.name`/`parentName`/`description`/`createdByName`/`updatedByName ?? '--'`, `_SummaryHeader`'s `detail.code ?? '--'`); doc-comment above `_formatDateTime()` updated to match. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_test.dart` | **Existing test file, updated** — local mirror of `_formatDateTime()` (kept in sync manually, per file's own header note, since the real one is a private top-level function) changed from `'—'` to `'--'`; its 3 null/empty/invalid-guard test cases (renamed `'returns em-dash for ...'` → `'returns placeholder for ...'`) and 2 static source-pin assertions (`source.contains("value: detail.createdAt ?? '--'")`) updated to the new literal. Test intent/logic unchanged — only the placeholder literal + descriptive names. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_061_test.dart` | **Existing test file, updated** — regex source-pin `r"detail\.name \?\? '—',..."` → `'--'`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_072_test.dart` | **Existing test file, updated** — regex source-pin `r"Text\(\s*detail\.name \?\? '—',..."` → `'--'`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_081_test.dart` | **Existing test file, updated** — 2 static `source.contains(...'—'...)` assertions + 3 widget-render assertions (`value: detail.createdByName ?? '—'` / `find.textContaining('—')`) changed to `'--'`; prose mentions of "em-dash" renamed to "`'--'` placeholder" for accuracy. Test intent/logic (createdBy/updatedBy null-fallback priority) unchanged. |

**Don't-touch respected**: `internal_product_detail_page.dart` (PROD Detail — out of scope, user explicitly said "Chi tiết nhóm vật tư hàng hoá" = GRP Detail only; PROD Detail may or may not have the same em-dash usage — needs a separate audit if scope is expanded later), `group_list_card.dart` (already correct — used as read-only reference, not modified), all `TextStyle`/`AppTextStyle`/font-size bindings on the touched `Text`/`StartInfoRow` widgets (byte-for-byte unchanged).

## 5. Blast-radius verification

- Call-site-local string-literal change inside a single page file — `'—'`/`'--'` are plain `String` values, not a shared design token/widget/model, so no other consumer is affected.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → 0 hit.
- Manual brace/paren/bracket balance check on the edited source + all 4 edited test files (string-literal-aware) → balanced.
- `grep -c "'—'" material_group_detail_page.dart` → 0 (no em-dash literal remains). `grep -o "'--'" material_group_detail_page.dart | wc -l` → 10 (8 code occurrences + 2 inside the updated doc-comment — matches the original em-dash occurrence count, none dropped).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on `PATH` in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle).

## 6. Regression / verification

| Scenario | Test |
|---|---|
| `_formatDateTime(null)` returns `'--'` | `material_group_detail_fidelity_test.dart` — `'returns placeholder for null'` |
| `_formatDateTime('')` returns `'--'` | `material_group_detail_fidelity_test.dart` — `'returns placeholder for empty string'` |
| `_formatDateTime('not-a-date')` returns `'--'` | `material_group_detail_fidelity_test.dart` — `'returns placeholder for unparseable string'` |
| Source pins: no raw `?? '--'` passthrough left for createdAt/updatedAt (formatter used instead) | `material_group_detail_fidelity_test.dart` — static source-pin test |
| `detail.name ?? '--'` binds `AppTextStyle.textHeadingH2` (style untouched by this fix) | `material_group_detail_fidelity_bug_061_test.dart` / `..._bug_072_test.dart` — regex source-pin |
| `createdByName`/`updatedByName` null → row renders `'--'`, never the raw id | `material_group_detail_fidelity_bug_081_test.dart` — static + widget-render assertions |

**Residual risk**: none identified — pure string-literal substitution, no logic/behavior/style change beyond the placeholder's visible content. `internal_product_detail_page.dart` (PROD Detail) was not audited for the same em-dash-vs-`'--'` inconsistency — flagged as a follow-up if the user expands scope.
