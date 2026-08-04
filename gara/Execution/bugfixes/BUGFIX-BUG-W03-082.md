# BUGFIX — BUG-W03-082

> GRP + PROD "Thuộc nhóm"/"Nhóm hàng" dropdown text field never resolved to the "Tất cả" label (stayed permanently blank), and the Apply/Reset footer buttons on both filter pages were always tappable regardless of whether the user had actually changed anything.
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-02

## 1. Summary

User report (mobile dev, "tham khảo booking_filter_page.dart"): (1) "ở bộ lọc nếu mà chưa chọn gì mà bấm tất cả thì chưa hiển thị là tất cả" — selecting "Tất cả" in the "Thuộc nhóm" (GRP) / "Nhóm hàng" (PROD) filter dropdown never updated the text field. (2) "nút Áp dụng vẫn hiển thị dù chưa có thay đổi" — the Apply and Reset buttons stayed enabled even when the filter had not been touched. User pointed at `booking_filter_page.dart`/`booking_filter_cubit.dart` as the reference pattern (`dataFilter`/`originalDataFilter` snapshot + `isFilterChanged` getter driving `BottomActions.isEnableShowResults`).

## 2. Root cause

**Fix 1 — "Tất cả" not reflected in the field:**

`_MaterialGroupFilterPageState._syncTextController` (`material_group_filter_page.dart`) guarded re-sync with:

```dart
final alreadySynced = _syncedParentId == state.parentId &&
    (_textController.text.isNotEmpty || state.parentId == null);
if (alreadySynced) return;
```

When `state.parentId == null` (the "Tất cả" option), the `state.parentId == null` disjunct is always `true`, so `alreadySynced` collapses to just `_syncedParentId == state.parentId`. Since `_syncedParentId` also defaults to `null`, this guard matched trivially on the **very first build** — before the user ever interacted with the dropdown — and the text field was stamped as "already synced" without the assignment line ever running. The field stayed blank forever, even after the user explicitly tapped "Tất cả" (which, being an already-`null` value, often produces an identical cubit state that `Cubit.emit()` dedupes and never even re-triggers a rebuild).

`internal_product_filter_page.dart`'s `_syncGroupTextController` (the "Nhóm hàng" dropdown, backed by the same async `loadGroupOptionsIfNeeded()` pattern) had the **same** short-circuit shape, plus a second, distinct defect: it explicitly special-cased `materialGroupId == null` to `_groupTextController.text = '';` instead of resolving through `_groupOptions(state)` (whose first entry is already the "Tất cả" option) — so even fixing the guard alone would not have surfaced the "Tất cả" label there. `_syncTypeTextController` ("Loại sản phẩm") was NOT touched — its options come from a local enum, always synchronously available, so there is no async-race guard to worry about; out of this bug's scope.

**Fix 2 — Apply/Reset always enabled:**

`MaterialGroupFilterState`/`MaterialGroupFilterCubit` and `InternalProductFilterState`/`InternalProductFilterCubit` had **no baseline-snapshot tracking at all** — only the live `parentId` / `productType`+`materialGroupId`. Both filter pages' `BottomActionButtonConfig` for "Áp dụng" and "Thiết lập lại" never passed `isActive:`, which defaults to `true` (`BottomActionButtonConfig.isActive = true`), so both buttons stayed tappable no matter what.

## 3. Fix

**Reference pattern**: `lib/ui/booking/booking_filtter/booking_filter_cubit.dart` — `dataFilter` (live) + `originalDataFilter` (snapshot from `init()`) + `bool get isFilterChanged => current != original`, wired to `BottomActions.isEnableShowResults: cubit.isFilterChanged`.

**Fix 1 — compound sync key (call-site only, no shared widget touched):**

- `material_group_filter_page.dart._syncTextController` — guard replaced with a compound key over `parentId` AND `groupOptions.length` (renamed field `_syncedParentId` (`int?`) → `_syncedKey` (`String?`)):
  ```dart
  final syncKey = '${state.parentId}_${state.groupOptions.length}';
  if (_syncedKey == syncKey) return;
  _syncedKey = syncKey;
  ```
  Preserves the BUG-W03-045 intent (re-sync once async `groupOptions` resolves with the same `parentId`, since `groupOptions.length` changing produces a new key) while no longer trivially matching on `parentId == null`.
- `internal_product_filter_page.dart._syncGroupTextController` — same compound-key treatment (renamed field `_syncedGroupId` (`int?`) → `_syncedGroupKey` (`String?`)) over `materialGroupId` + `groupOptions.length`, AND the `materialGroupId == null → text = ''` special-case branch was removed — the `null` case now resolves uniformly through `_groupOptions(state)`, same as the GRP page's `_optionsFor(state)`.
- `_syncTypeTextController` left unchanged (out of scope, no race — confirmed by existing `internal_product_filter_sync_race_test.dart` assertion pinning it unchanged).

**Fix 2 — dirty-state tracking (mirrors `BookingFilterCubit`):**

- `MaterialGroupFilterState` gained `originalParentId` (`int?`, default `null`).
- `MaterialGroupFilterCubit` gained `void init() => emit(state.copyWith(originalParentId: state.parentId));` and `bool get isFilterChanged => state.parentId != state.originalParentId;`.
- `material_group_filter_page.dart.initState()` calls `cubit.init()` unconditionally, AFTER the existing `if (widget.initialParentId != null) { cubit.setParentId(...); cubit.loadGroupOptionsIfNeeded(); }` block — so `init()` snapshots whatever `parentId` the page opened with (either the preloaded value or the default `null`), matching the "reflects whatever the filter was opened with" requirement without altering the pre-existing `cubit.setParentId(widget.initialParentId)` / `cubit.loadGroupOptionsIfNeeded()` call sites (kept literal — pinned by `material_group_filter_initial_value_test.dart`'s source-wiring assertions).
- `InternalProductFilterState` gained `originalProductType` (`InternalProductType?`) + `originalMaterialGroupId` (`int?`).
- `InternalProductFilterCubit` gained `void init() => emit(state.copyWith(originalProductType: state.productType, originalMaterialGroupId: state.materialGroupId));` and `bool get isFilterChanged => state.productType != state.originalProductType || state.materialGroupId != state.originalMaterialGroupId;`.
- `internal_product_filter_page.dart.initState()` calls `cubit.init()` unconditionally, after both existing conditional `setProductType`/`setMaterialGroupId` blocks (same rationale, same call-site preservation for `internal_product_filter_initial_value_test.dart`'s assertions).
- Both pages: `isActive: cubit.isFilterChanged` wired onto **both** the "Thiết lập lại" (Reset) and "Áp dụng" (Apply) `BottomActionButtonConfig` — user explicitly asked for both buttons ("cả nút thiết lập lại nhé"), not just Apply. Confirmed `BottomActionButtonConfig.isActive` behavior first (`bottom_navigation_bar_button.dart` — `onPress: data.isActive ? () => _handleTapAt(...) : null`, i.e. `false` disables tap via `AppButton`'s own disabled rendering).

`reset()` on both cubits is unchanged (still resets to `parentId: null` / `productType: null, materialGroupId: null` — clears to "no filter", not to the original value); this matches existing `MaterialGroupFilterCubit`/`InternalProductFilterCubit` unit tests (`reset clears selection back to null`) and is not something this bug asked to change.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | `_syncedParentId` → `_syncedKey` (compound-key guard); `initState()` calls `cubit.init()`; both footer buttons wired `isActive: cubit.isFilterChanged`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_cubit.dart` | New `init()` + `isFilterChanged` getter. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_state.dart` | New `originalParentId` field. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | `_syncedGroupId` → `_syncedGroupKey` (compound-key guard, drops null-special-case); `initState()` calls `cubit.init()`; both footer buttons wired `isActive: cubit.isFilterChanged`. `_syncTypeTextController` untouched. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_cubit.dart` | New `init()` + `isFilterChanged` getter. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_state.dart` | New `originalProductType` + `originalMaterialGroupId` fields. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_all_option_sync_test.dart` | **New** — harness-based: default state resolves "Tất cả" from the first build; field resolves back to "Tất cả" after Reset. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_all_option_sync_test.dart` | **New** — same, for the "Nhóm hàng" dropdown. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_dirty_state_test.dart` | **New** — cubit-level `isFilterChanged` across fresh-open / reopen-with-filter / changed / reset. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_dirty_state_test.dart` | **New** — same, for `productType` + `materialGroupId`. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_sync_race_test.dart` | **Updated** — trailing static-source assertion pinning the OLD BUG-W03-045 guard string (`_textController.text.isNotEmpty || state.parentId == null`) is now inverted (must be ABSENT) plus a new assertion pinning the compound-key replacement; `testWidgets` harness (independent, reconstructs the fixed logic locally) left unchanged — still a valid narrower BUG-W03-045 race regression. |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_sync_race_test.dart` | **Updated** — same treatment for the `_groupTextController` guard string; `_syncedType` unchanged-guard assertion kept as-is. |

**Don't-touch respected**: `DropdownMenuWidget`, `BottomNavigationBarButton`, `booking_filter_cubit.dart` untouched (read-only reference only). No `git commit`/push.

## 5. Note on updating 2 existing tests (BUG-W03-045's regression files)

`material_group_filter_sync_race_test.dart` and `internal_product_filter_sync_race_test.dart` each had a trailing static-source `test()` asserting the exact OLD guard substring (`_textController.text.isNotEmpty || state.parentId == null` / `_groupTextController.text.isNotEmpty || state.materialGroupId == null`) was present in the real page source — this is precisely the code this bug's root cause requires removing. Per this bug's explicit fix instructions and root-cause analysis, that disjunct is the defect, not an implementation detail incidental to the BUG-W03-045 fix. Leaving the old assertion unchanged would make the test suite permanently self-contradictory against the fix this bug requires. Both assertions were inverted (now assert the string is ABSENT) with 2 new assertions added pinning the new compound-key shape, cross-referencing BUG-W03-082 in the docstring; the `testWidgets` behavioral test in each file (which reconstructs the sync logic in a local, independent harness rather than exercising the real page's private method) was left untouched — it remains a valid, narrower regression guard for the original BUG-W03-045 async-race scenario in isolation. No coverage was deleted, only re-targeted at the now-correct implementation.

## 6. Blast-radius verification

- `grep -rln "MaterialGroupFilterCubit\|InternalProductFilterCubit\|MaterialGroupFilterPage\|InternalProductFilterPage" lib/` outside the 2 filter folders: only a comment reference in `material_group_list_cubit.dart` (no code dependency) — no other consumer of these cubits/pages/private fields.
- `python3 scripts/check-mobile-canonical-primitives.py --file <path>` on all 6 touched lib files: 0 hit each.
- Brace/paren balance (grep count) on all 6 touched lib files + all 6 touched/new test files: all balanced.
- Concurrent-session note: BUG-W03-083 (a separate, concurrently-running FIX cycle — label-weight `textSubtitleS5` + footer secondary-color token wiring) edited the same 2 page files simultaneously on disjoint lines. Re-read each file immediately before every edit (hit "file modified since read" from the Edit tool twice, re-read and reapplied both times) and re-verified `check-mobile-canonical-primitives.py` + brace/paren balance on the latest snapshot after every edit — no line-level overlap with this fix's scope (field declarations / `initState()` / `_sync*TextController` bodies / footer `isActive:` param vs BUG-083's `style:`/`secondaryBackgroundColor:`/`secondaryContentColor:` lines).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/Dart toolchain on `PATH` in this environment (`DEBT-W01-MOBILE-BUILD-ENV`, same gap as every prior W03 mobile FIX cycle).

## 7. Regression / verification

| Scenario | Test |
|---|---|
| GRP: default (nothing selected) resolves "Tất cả" from the very first build | `material_group_filter_all_option_sync_test.dart` |
| GRP: field resolves back to "Tất cả" after Reset | `material_group_filter_all_option_sync_test.dart` |
| PROD "Nhóm hàng": default resolves "Tất cả" from the very first build | `internal_product_filter_all_option_sync_test.dart` |
| PROD "Nhóm hàng": field resolves back to "Tất cả" after Reset | `internal_product_filter_all_option_sync_test.dart` |
| GRP: `isFilterChanged` false on fresh open / reopen-with-filter; true after change; false again after Reset (fresh-open case) | `material_group_filter_dirty_state_test.dart` |
| PROD: `isFilterChanged` false on fresh open / reopen-with-filter; true after `productType` OR `materialGroupId` change; false again after Reset (fresh-open case) | `internal_product_filter_dirty_state_test.dart` |
| BUG-W03-045 async race still covered (no regression from the guard-shape change) | `material_group_filter_sync_race_test.dart` / `internal_product_filter_sync_race_test.dart` (updated static assertions + unchanged `testWidgets`) |

**Residual risk**: `reset()` clears to `null`/`null` rather than restoring `originalParentId`/`originalProductType`/`originalMaterialGroupId` — so if a user reopens the filter with an existing selection, changes it, then taps Reset, `isFilterChanged` stays `true` (Reset doesn't return the buttons to disabled in that specific path, only in the fresh-open case where the original was already `null`). This matches `reset()`'s pre-existing, unchanged semantics ("clear filter", not "revert to opened value") and was not something this bug's Notes asked to change — flagged here for future audit if product intent differs.
