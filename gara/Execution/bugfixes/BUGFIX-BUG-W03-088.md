# BUGFIX — BUG-W03-088

> `EP-INVENTORY-CATALOG` detail screens (PROD + GRP) — refresh either shows the wrong loading indicator (PROD) or has no refresh at all (GRP)
> Severity: **P1** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User report (mobile dev, 2026-07-02): "Ở các màn detail tôi đã bảo thêm refresh nhưng sao chưa
work. Hiện shimmer cũng chưa có mà bị dính loading indicator cả BasePage." — a repeat of an
earlier request to add pull-to-refresh to **both** Inventory Catalog detail screens. Orchestrator
audit confirmed two distinct root causes on two screens sharing the same feature area:

1. **Product Detail** (`FEAT-CAT-PROD-DETAIL`) — pull-to-refresh **was already implemented**
   (`internal_product_detail_page.dart` had a working `SmartRefresher` + `RefreshController`,
   shipped in the original commit, not a recent regression) but triggered the wrong loading UX:
   every refresh flipped `state.processing` to `true`, which `BasePage`'s global `BlocListener`
   turns into a full-screen `_GlobalLoadingOverlay` **stacked on top of** the SmartRefresher's own
   pull-spinner — two loading indicators at once.
2. **Group Detail** (`FEAT-CAT-GRP-DETAIL`) — had **no pull-to-refresh at all**.
   `material_group_detail_page.dart` only called `cubit.load()` from `initState()` and after a
   successful Edit; the only "refresh" affordance was `LoadEmpty(onRefresh: ...)`, which only
   renders when `detail == null` (error/not-found state) — never available once data is loaded.

## 2. Root cause

Both screens' cubits (`ProductDetailCubit.load()`, `MaterialGroupDetailCubit.load()`) called
`BaseCubit.launch()` with no options. Per `base_cubit.dart:11-39` (made functional by
BUG-W03-057, which fixed `isShowLoading` from a dead param to an actually-gating one): when
`state.pageStatus` is already `PageStatus.loaded` — true for any refresh, as opposed to the very
first load — `launch()` hits the `else if (isShowLoading)` branch, and since the caller never
passed `isShowLoading: false`, the default `true` fires `emit(processing: true)`. `BasePage`'s
`BlocListener` (`base_page.dart:109-118`) turns any `processing` edge into the full-screen
`_GlobalLoadingOverlay` (`base_page.dart:262-277`).

- **Product Detail**: the `SmartRefresher.onRefresh` callback existed and called
  `cubit.load(widget.productId)`, but never passed `isShowLoading: false` through — and
  `ProductDetailCubit.load()` itself had no `isShowLoading` parameter to forward in the first
  place, so there was no way to suppress the overlay even by editing only the call-site.
- **Group Detail**: no `SmartRefresher` existed on the page at all — a pure missing-feature gap,
  unrelated to the `isShowLoading` mechanism (though the same mechanism was needed once the
  refresh affordance was added).

## 3. Fix

### 3a. `ProductDetailCubit.load()` / `MaterialGroupDetailCubit.load()` — forward `isShowLoading`

Both cubits' `load()` methods gained an `{bool isShowLoading = true}` parameter, forwarded
straight into `launch(..., isShowLoading: isShowLoading)`. Default `true` preserves every
existing call site's behavior byte-for-byte (both cubits have exactly 1 page consumer each — not
a shared symbol, no blast-radius concern):

```dart
// product_detail_cubit.dart / material_group_detail_cubit.dart — before
Future<void> load(int id) async {
  return launch(() async {
    final response = await _repository.getInternalProduct(id); // or getMaterialGroup
    emit(state.copyWith(detail: response.data));
  });
}

// after
Future<void> load(int id, {bool isShowLoading = true}) async {
  return launch(() async {
    final response = await _repository.getInternalProduct(id);
    emit(state.copyWith(detail: response.data));
  }, isShowLoading: isShowLoading);
}
```

### 3b. Product Detail — `onRefresh` now suppresses the overlay

`internal_product_detail_page.dart`'s existing `SmartRefresher.onRefresh` callback now passes
`isShowLoading: false`:

```dart
onRefresh: () async {
  await cubit.load(widget.productId, isShowLoading: false);
  _refreshController.refreshCompleted();
},
```

No other change to this page — the `RefreshController` field, `dispose()`, and `SmartRefresher`
wiring were already correct (BUG-W03-088's audit confirmed this half was NOT a recent
regression).

### 3c. Group Detail — new `SmartRefresher` around the loaded-content branch

`material_group_detail_page.dart` gained:

- `import 'package:pull_to_refresh/pull_to_refresh.dart';`
- A `final _refreshController = RefreshController();` field + `dispose()` override (mirrors
  Product Detail's pattern).
- `_buildBody()`'s loaded-content branch (the `SingleChildScrollView` rendered once
  `detail != null`) is now wrapped in a `SmartRefresher` whose `onRefresh` calls
  `cubit.load(widget.groupId, isShowLoading: false)`:

```dart
return SmartRefresher(
  controller: _refreshController,
  enablePullDown: true,
  enablePullUp: false,
  onRefresh: () async {
    await cubit.load(widget.groupId, isShowLoading: false);
    _refreshController.refreshCompleted();
  },
  child: SingleChildScrollView(
    padding: const EdgeInsets.symmetric(vertical: AppSizes.spacing16),
    child: Column(...), // unchanged content
  ),
);
```

The `loading`/`initial` branch (`LoadingRowShimmerWidget`) and the `detail == null` branch
(`LoadEmpty`, which already has its own internal `SmartRefresher` — see `load_empty.dart`) were
**left untouched** — this mirrors the established codebase convention (`ListWidget`, the shared
list-rendering widget used across the app, only wraps `SmartRefresher` around its "main list"
state too, not its loading/empty states). The bug report's own framing ("refresh khi ĐÃ có data")
also scopes the fix to the loaded-content branch only.

### 3d. `_DetailFooter`'s post-Edit reload — untouched

`material_group_detail_page.dart`'s `onEdit` callback (`await cubit.load(widget.groupId)`, no
`isShowLoading` override) is unchanged — it still shows the global overlay after a successful
Edit, which is existing, intentional behavior (a full navigation round-trip, not a silent
background refresh) and outside this bug's scope.

## 4. Blast radius

- `ProductDetailCubit` / `MaterialGroupDetailCubit` — each has exactly 1 page consumer
  (`internal_product_detail_page.dart` / `material_group_detail_page.dart` respectively); not
  shared symbols, no Shared-Symbol Blast-Radius Gate audit needed.
- `BaseCubit.launch()` itself — **not modified** in this fix (already fixed by BUG-W03-057); this
  fix only adds new call sites that pass `isShowLoading: false`, which is additive and backward
  compatible with every other `launch()` consumer in the app.
- No API/GraphQL/event contract touched — pure client-side loading-state + widget-tree change.

## 5. Regression tests

Two new files, mirroring the established mocktail cubit-test convention
(`edit_material_group_cubit_test.dart`) plus the static source-assertion convention
(`internal_product_detail_bug_087_test.dart`) for the page-wiring pins:

- `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_detail/product_detail_refresh_bug_088_test.dart`
  - Cubit test: drives the real `ProductDetailCubit` against a mocktail-mocked
    `InventoryCatalogRepository`. First loads to `PageStatus.loaded`, then calls
    `load(1, isShowLoading: false)` and asserts **zero** `processing: true` emissions and every
    emitted state keeps `pageStatus == loaded` (core bug assertion).
  - Sanity test: default `isShowLoading: true` call from `loaded` still emits the `processing`
    edge — proves non-refresh callers keep pre-fix behavior (opt-in only via the refresh
    call-site).
  - Source-pin test: `internal_product_detail_page.dart` must contain
    `cubit.load(widget.productId, isShowLoading: false)` and must NOT contain the pre-fix bare
    call.
- `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_refresh_bug_088_test.dart`
  - Same 2 cubit-emission cases for `MaterialGroupDetailCubit`.
  - Source-pin tests: `material_group_detail_page.dart` imports `pull_to_refresh`, contains
    `SmartRefresher(`, its `onRefresh` calls `cubit.load(widget.groupId, isShowLoading: false)`,
    and declares + disposes its own `RefreshController` — pins the previously-absent
    pull-to-refresh affordance now existing.

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py --file <f>` → **0 hit** on all 4 touched
  lib files (`product_detail_cubit.dart`, `internal_product_detail_page.dart`,
  `material_group_detail_cubit.dart`, `material_group_detail_page.dart`).
- Paren/brace/bracket balance manually verified on all 4 lib files + both new test files (2
  false-positive "mismatches" from the naive counter traced to intentional unbalanced parens
  *inside Dart string literals* being tested for substring presence, e.g. `'SmartRefresher('` —
  confirmed not real syntax errors by full manual read).
- `fvm flutter analyze` / `fvm flutter test`: **BLOCKED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). Tests written statically-correct, following
  the same DI/mocktail pattern as pre-existing tests in this suite (e.g.
  `edit_material_group_cubit_test.dart`) that already exercise real freezed-generated state/cubit
  classes without local codegen. TEST_GROUP must re-run on a machine with the toolchain
  (`fvm dart run build_runner build --delete-conflicting-outputs` first, since
  `ProductDetailState`/`MaterialGroupDetailState` are `@freezed` and their generated
  `*.freezed.dart` parts are gitignored/not present in this working tree) before flipping to
  `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — pure
  loading-state/widget-wiring bugfix, no entity/event/permission/screen contract changed.

## 7. Non-goals / out of scope

- No shimmer/skeleton work beyond what already existed (Product Detail's `_SkeletonBox` /
  `LoadingRowShimmerWidget`, Group Detail's `LoadingRowShimmerWidget`) — the user's "shimmer cũng
  chưa có" complaint in the report is interpreted here as referring to the double-loading-overlay
  confusion (shimmer was masked/overshadowed by the incorrectly-firing global overlay), not a
  request for new shimmer widgets; both screens already had loading skeletons pre-fix.
- Group Detail's `loading`/`initial` and `detail == null` branches intentionally do NOT get a
  `SmartRefresher` — matches the established `ListWidget` convention and the bug's own framing
  (refresh needed "khi ĐÃ có data").
- `_DetailFooter`'s post-Edit `cubit.load(widget.groupId)` call (Group Detail) intentionally keeps
  the global-overlay behavior — out of scope (§3d).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — `isShowLoading` passthrough on both detail cubits' `load()`; Product Detail refresh call-site suppresses the global overlay; Group Detail gains a new `SmartRefresher`/`RefreshController` around its loaded-content branch. 4 lib files + 2 new regression test files. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
