# BUGFIX — BUG-W03-018

> Raw `TextStyle(...)` constructor thay vì `AppTextStyle.*` (R13)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`material_group_form.dart` (`_LabeledField`, required-marker asterisk) used a raw `TextStyle(color: AppColors.textErrorPrimary)` literal instead of the canonical `AppTextStyle.*` token, violating R13.

## 2. Fix

```dart
// before
TextSpan(
  text: ' *',
  style: TextStyle(color: AppColors.textErrorPrimary),
)

// after
TextSpan(
  text: ' *',
  // BUG-W03-018 fix: raw TextStyle(...) -> AppTextStyle.* token (R13)
  style: AppTextStyle.textSubtitleS5.copyWith(color: AppColors.textErrorPrimary),
)
```

Matches the label's own style (`AppTextStyle.textSubtitleS5`) with only the color overridden via `.copyWith`, per the canonical typography pattern (§1.5a).

## 3. Files changed

| File | Change |
|---|---|
| `lib/ui/inventory_catalog/widgets/material_group_form.dart` | `_LabeledField` required-asterisk `TextStyle(...)` → `AppTextStyle.textSubtitleS5.copyWith(color: AppColors.textErrorPrimary)`. |

Applied as part of the same rewrite pass as BUG-W03-019 (form catalog-widget replacement), since both touch the same file.

## 4. Regression / verification

- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart` → 0 hits for TextStyle/raw-color patterns (only 2 unrelated pre-existing `setState` P2 findings remain, see BUG-W03-019 doc).
- `fvm flutter analyze` / `fvm flutter test` / widget test: **deferred** (`BLOCKER-W02-MOBILE-HARNESS-FLUTTER`).

## 5. Non-goals / out of scope

- None — single-line fix, fully self-contained.

## 6. Follow-up

- None.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — raw `TextStyle` → `AppTextStyle.textSubtitleS5.copyWith(...)` token. |
