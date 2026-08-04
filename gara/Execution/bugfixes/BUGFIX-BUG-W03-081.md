# BUGFIX — BUG-W03-081

> `MaterialGroupDetailPage`'s "Người tạo"/"Người sửa" `StartInfoRow`s fell back to the raw `detail.createdBy`/`detail.updatedBy` (a bare user id/username string, NOT a display name) whenever `detail.createdByName`/`detail.updatedByName` was `null`, instead of showing `'—'`.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User (mobile dev) reported and confirmed directly via a clarifying question (2026-07-02) that `material_group_detail_page.dart:154-155,161-163` had a 2-level fallback:

```dart
value: detail.createdByName ?? detail.createdBy ?? '—'
value: detail.updatedByName ?? detail.updatedBy ?? '—'
```

`createdByName`/`updatedByName` is the human-readable display name; `createdBy`/`updatedBy` is a raw id/username (per `MaterialGroupDetail` model, `lib/core/models/inventory_catalog/material_group_models.dart:64-68`). When `*Name` is null but the raw id is present, the row rendered the raw id string — a confusing/incorrect value for the "Người tạo"/"Người sửa" field. User confirmed the required behavior explicitly: *"nếu detail.createdByName mà null thì sẽ hiển thị -- chứ không được hiển thị detail.createdBy"*.

## 2. Root cause

The `?? detail.createdBy` / `?? detail.updatedBy` fallback segments were added as a defensive "show something rather than nothing" measure, but `createdBy`/`updatedBy` is not fit for direct user-facing display — it is an internal identifier, not a name. The correct contract is: display name if available, otherwise the em-dash placeholder — never fall through to a non-name identifier field.

## 3. Fix

`material_group_detail_page.dart` — removed the `?? detail.createdBy` / `?? detail.updatedBy` fallback segments on both `StartInfoRow`s:

```dart
// createdBy row
value: detail.createdByName ?? '—',

// updatedBy row
value: detail.updatedByName ?? '—',
```

Priority order (display name first, then em-dash) is unchanged for the non-null-name case — only the raw-id fallback was removed.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` | Removed `?? detail.createdBy` / `?? detail.updatedBy` fallback from the "Người tạo"/"Người sửa" `StartInfoRow` value expressions — now `detail.createdByName ?? '—'` / `detail.updatedByName ?? '—'`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_081_test.dart` | **New** — static source pins (raw-id fallback string absent from source; em-dash-only fallback present) + 3 widget-render cases: `createdByName` null + `createdBy` non-null → renders em-dash, never the raw id; `updatedByName` null + `updatedBy` non-null → renders em-dash, never the raw id; `createdByName` non-null → still takes priority over `createdBy`. |

**Don't-touch respected**: model (`material_group_models.dart`), repository, and GraphQL document untouched — the `createdBy`/`updatedBy`/`createdByName`/`updatedByName` fields themselves are correct as-is; this is purely a display-fallback fix on the page.

## 5. Verification

- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart` → **0 hit**.
- Brace/paren balance verified on both the page and the new test file (`python3` count check) → balanced.
- Regex/static source assertions in the new test file were verified against the real post-fix source (string containment checks) — the removed fallback string is confirmed absent, the fixed em-dash-only expression confirmed present.
- **Build/analyze/test DEFERRED**: no Flutter toolchain in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle). TEST_GROUP on a machine with the toolchain should run:
  ```
  fvm flutter analyze lib/ui/inventory_catalog/material_group_detail/material_group_detail_page.dart
  fvm flutter test test/ui/inventory_catalog/material_group_detail/material_group_detail_fidelity_bug_081_test.dart
  ```

## 6. Residual risk / follow-up

None — this is a minimum-scope 2-line display-fallback fix, no shared-symbol blast radius (`StartInfoRow` usages within this file are the only consumers touched; the widget itself was not modified), no cross-boundary or model/repository/GraphQL impact.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial BUGFIX doc — root cause + fix (removed raw createdBy/updatedBy fallback, em-dash-only when *Name is null) + regression test. |
