# BUGFIX — BUG-W03-093

> Field "Tính chất" (`productType`) trên màn Lọc Sản phẩm nội bộ không mặc định hiện "Tất cả" — cùng bug class đã sửa cho "Nhóm hàng" ở BUG-W03-082, nhưng field này bị bỏ sót.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User report: "phần lọc lên Sản phẩm, tính chất đang bị lỗi: không mặc định chọn là tất cả, hãy để logic nó giống Nhóm vật tư". BUG-W03-082 fixed the exact same symptom for the sibling "Nhóm hàng" (`materialGroupId`) dropdown on `internal_product_filter_page.dart` (`_syncGroupTextController`), but explicitly left `_syncTypeTextController` ("Tính chất" / `productType`) untouched, calling it "ngoài scope (options từ local enum, không có race)". That earlier scoping correctly identified `_typeOptions()` has no async-race concern, but missed that the method still carried the *same* null-special-case defect as the group controller's pre-fix code.

## 2. Root cause

`_syncTypeTextController` special-cased `state.productType == null` (the "Tất cả" selection/default) to an explicit blank string:

```dart
if (state.productType == null) {
  _typeTextController.text = '';
  return;
}
```

instead of falling through to the general resolve-via-`_typeOptions()` lookup, which already contains a `_TypeOption(null, LocaleKeys.common_all.tr())` entry as its first item. So whenever `productType` was `null` — the initial default, or after tapping "Tất cả" — the text field was hardcoded blank rather than showing "Tất cả".

Unlike `_syncGroupTextController` (whose `groupOptions` load asynchronously, requiring the BUG-W03-082 compound-key guard `'${materialGroupId}_${groupOptions.length}'` to avoid a stale-sync race), `_typeOptions()` is built purely from the static `InternalProductType.values` enum — always available synchronously — so the existing simple guard `_syncedType == state.productType` is sufficient once the null special-case is removed. No compound key needed here.

## 3. Fix

Removed the `if (state.productType == null) { _typeTextController.text = ''; return; }` branch from `_syncTypeTextController`, letting it fall through unconditionally to the shared resolve-via-`_typeOptions()` logic:

```dart
void _syncTypeTextController(InternalProductFilterState state) {
  if (_syncedType == state.productType) return;
  _syncedType = state.productType;
  final match = _typeOptions().where((o) => o.type == state.productType);
  _typeTextController.text = match.isNotEmpty ? match.first.label : '';
}
```

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | Removed the `productType == null` special-case branch from `_syncTypeTextController`; method now always resolves the label via `_typeOptions()`. `_syncGroupTextController` ("Nhóm hàng", already correct from BUG-W03-082) untouched. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_type_all_option_sync_test.dart` | **New** — regression test (sibling of `internal_product_filter_all_option_sync_test.dart`), harness-based, driven off the real cubit's state stream via `BlocBuilder`. |

**Don't-touch respected**: `_syncGroupTextController` (BUG-W03-082, already correct), the cubit (`internal_product_filter_cubit.dart`), and the GRP filter page (`material_group_filter_page.dart`) were not touched — out of this bug's scope.

## 5. Blast-radius verification

- `_syncTypeTextController` has exactly 1 consumer (`InternalProductFilterPage.builder`, called each rebuild) — no shared-symbol gate needed.
- `python3 scripts/check-mobile-canonical-primitives.py --file mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` → 0 hit.
- Brace/paren/bracket balance verified on both the edited `lib/` file and the new `test/` file — balanced.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on `PATH` in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle, incl. BUG-W03-082/090).

## 6. Regression / verification

| Scenario | Test |
|---|---|
| Default (nothing selected) state resolves "Tất cả" label for "Tính chất" from the very first build, not blank | `internal_product_filter_type_all_option_sync_test.dart` |
| After Reset (`productType` cleared back to `null`), field resolves back to "Tất cả" instead of staying stuck blank | `internal_product_filter_type_all_option_sync_test.dart` |

**Residual risk**: none identified — change removes a dead-end early-return branch, does not alter the guard shape or any other field. `_syncGroupTextController` / cubit / GRP filter page unaffected by construction.
