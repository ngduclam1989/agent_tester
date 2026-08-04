# BUGFIX — BUG-W03-089

> `EP-INVENTORY-CATALOG` GRP + PROD search screens — status TabBar (Tất cả/Đang hoạt động/Ngừng
> hoạt động) was purely decorative
> Severity: **P1** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User report (mobile dev, 2026-07-02): "ở màn search, khi search xong bằng keyword thì bấm chuyển
trạng thái sẽ phải lọc theo Đang hoạt động, Ngừng hoạt động... call lại API, hiển thị kết quả
nhé." Both `MaterialGroupSearchPage` and `InternalProductSearchPage` render a 3-tab `TabBar`
("Tất cả" / "Đang hoạt động" / "Ngừng hoạt động") inside their `AppBarCustom.bottom`, but tapping
any tab did nothing at all — no re-query, no filtering. `material_group_list_page.dart` already
implements the correct pattern for its own (non-search) status tabs.

## 2. Root cause

Both search pages create `_tabController = TabController(length: 3, vsync: this)` in
`initState()` but never call `_tabController.addListener(...)` — tapping a tab only moved the
TabBar's own visual indicator; no callback fired anywhere in the app. Even if a listener had
existed, both search cubits' `_search()` only ever built
`SearchMaterialGroupsRequest`/`SearchInternalProductsRequest` with `keyword`/`page`/`size` —
never `status` — despite both request models already declaring a `status` field
(`material_group_models.dart:134`, `internal_product_models.dart:161`) and both cubits' own
`State` classes having no `status` field to hold a selection in the first place. Two independent
gaps (missing listener wiring + missing state field/request wiring) combined to make the TabBar
fully decorative.

## 3. Fix

Applied the already-correct `material_group_list_page.dart` pattern (`_tabStatuses` +
`_handleTabChange` + `addListener`/`removeListener`, §35-64 there) to both search pages, adapted
to each search cubit's own state/method names.

### 3a. State — new `status` field

`material_group_search_state.dart` / `internal_product_search_state.dart` each gained:

```dart
@Default(null) MaterialGroupStatus? status,   // or InternalProductStatus?
```

placed next to the existing `keyword` field. `material_group_search_cubit.dart` /
`internal_product_search_cubit.dart` gained the matching model import
(`material_group_status.dart` / `internal_product_status.dart`) so both the cubit file and its
`part of` state file can reference the enum type.

### 3b. Cubit — new `changeStatus()` method, `_search()` now sends `status`

```dart
// material_group_search_cubit.dart (internal_product_search_cubit.dart mirrors this 1:1)
Future<void> changeStatus(MaterialGroupStatus? status) async {
  if (state.status == status) return;
  _debounce?.cancel();
  if (state.keyword.isEmpty) {
    emit(state.copyWith(status: status));
    return;
  }
  emit(state.copyWith(status: status, loading: true));
  await _search();
}

Future<void> _search() async {
  final keyword = state.keyword;
  final status = state.status;               // NEW — was missing entirely
  final requestToken = ++_searchToken;
  emit(state.copyWith(loading: true, errorEntity: null));
  try {
    final response = await _repository.searchMaterialGroups(
      SearchMaterialGroupsRequest(
        keyword: keyword,
        status: status,                       // NEW
        page: 0,
        size: 50,
      ),
    );
    ...
```

Design notes:

- **No-op guard** (`if (state.status == status) return;`) mirrors `material_group_list_page.dart`'s
  `_handleTabChange` guard (`_tabController.index == _lastTabIndex`) at the cubit layer too, so a
  page-level double-tap or accidental duplicate call never fires an extra request.
- **Debounce cancelled, not used** — a tab change must search immediately (per the bug report:
  "call lại API ... nhé"), unlike keystroke typing which still debounces 300ms via the untouched
  `changeKeyword()`/`_debounce` path.
- **Empty-keyword short-circuit** — if the user taps a tab before ever typing a keyword, `changeStatus`
  only updates `state.status` and returns without querying the repository. This matches
  `_buildBody`'s existing `keyword.isEmpty` branch (renders the "type at least N characters" info
  panel, not the results list) — firing a network request the UI can't show yet would be pure
  waste (§3.1 Lazy-load API rule).
- **BUG-W03-084 loading-state pattern extended to this path** — `changeStatus` emits
  `loading: true` *synchronously*, before `await _search()` runs, exactly like `changeKeyword()`
  already does before its debounce `Timer` fires. This closes the same class of gap BUG-W03-084
  fixed (UI briefly falling through to the "0 kết quả" branch while `loading` is still `false`),
  just for the tab-triggered path instead of the keystroke path. `_search()`'s own
  `loading: true` re-emission is harmless/idempotent and was left untouched.
- **Stale-response guard reused as-is** — `_search()`'s existing
  `requestToken != _searchToken || keyword != state.keyword` staleness check already covers
  status-triggered calls too: every `_search()` invocation (whether from the debounce `Timer` or
  from `changeStatus`) bumps `_searchToken`, so an in-flight keyword search superseded by a tab tap
  (or vice versa) is discarded correctly without needing a separate `status` comparison.

### 3c. Page — `_tabStatuses` + listener wiring

```dart
// material_group_search_page.dart (internal_product_search_page.dart mirrors this 1:1)
int _lastTabIndex = 0;   // search's default selected tab is index 0 ("Tất cả")

static const _tabStatuses = <MaterialGroupStatus?>[
  null,
  MaterialGroupStatus.active,
  MaterialGroupStatus.inactive,
];

@override
void initState() {
  super.initState();
  _tabController = TabController(length: 3, vsync: this);   // no initialIndex — unchanged
  _tabController.addListener(_handleTabChange);
  _focusNode.requestFocus();
}

void _handleTabChange() {
  if (_tabController.indexIsChanging) return;
  if (_tabController.index == _lastTabIndex) return;
  _lastTabIndex = _tabController.index;
  cubit.changeStatus(_tabStatuses[_lastTabIndex]);
}

@override
void dispose() {
  _tabController.removeListener(_handleTabChange);
  _controller.dispose();
  _focusNode.dispose();
  _tabController.dispose();
  super.dispose();
}
```

Unlike `material_group_list_page.dart` (whose default selected tab is index 1 = "Đang hoạt
động"), the search pages' `TabController` was never constructed with an `initialIndex` — it
defaults to `0` ("Tất cả"). This is kept as-is (search's own pre-existing default, not something
this bug asked to change); `_lastTabIndex` is initialized to match (`0`), not copied from the
list page's `1`.

## 4. Blast radius

- `MaterialGroupSearchCubit` / `InternalProductSearchCubit` — each has exactly 1 page consumer
  (`MaterialGroupSearchPage` / `InternalProductSearchPage`); not shared symbols, no Shared-Symbol
  Blast-Radius Gate audit needed.
- `SearchMaterialGroupsRequest.status` / `SearchInternalProductsRequest.status` — pre-existing
  fields on the request models, not modified; this fix is purely a new caller now populating an
  already-supported field.
- `material_group_list_page.dart` / `material_group_list_cubit.dart` (the reference pattern) —
  **not touched**, read-only reference per scope.
- No API/GraphQL/event contract touched — pure client-side state + widget-wiring change.
- Existing `BUG-W03-021` regression assertion (`material_group_search_cubit_test.dart`,
  `captured.status, isNull` on the very first keyword search) still holds: `state.status`
  defaults to `null` and only changes once the user explicitly taps a tab, so a fresh search with
  no tab interaction still sends `status: null` — the "search ignores the parent list's tab
  filter on entry" invariant that test protects is unaffected.

## 5. Regression tests

- `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_cubit_test.dart`
  — new `BUG-W03-089 — MaterialGroupSearchCubit.changeStatus` group (4 cases): empty-keyword
  no-op-network guard, non-empty-keyword immediate re-query preserving keyword + status, `loading`
  flips `true` synchronously before the request resolves, re-selecting the same status is a
  no-op.
- `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_cubit_test.dart`
  — mirrors the above 1:1 for `InternalProductSearchCubit.changeStatus`.
- `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_search/material_group_search_status_tab_bug_089_test.dart`
  (**new**) — mounts the REAL `MaterialGroupSearchPage` with a mocked
  `InventoryCatalogRepository` (same strategy as the existing BUG-W03-085 result-count-padding
  test), searches by keyword, then taps the actual "Đang hoạt động" / "Ngừng hoạt động" / "Tất cả"
  `Tab` widgets and asserts the repository is re-called each time with the right `status` and the
  keyword preserved — this is the test that would have caught the original bug (listener never
  wired), since it drives the real `TabController` through real `tester.tap()`, not a
  cubit-method call.
- `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_search/internal_product_search_status_tab_bug_089_test.dart`
  (**new**) — mirrors the above 1:1 for `InternalProductSearchPage`.

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py --file <f>` → **0 hit** on all 4 touched
  lib files (`material_group_search_page.dart`, `material_group_search_cubit.dart`,
  `internal_product_search_page.dart`, `internal_product_search_cubit.dart`) and both new state
  files.
- Paren/brace/bracket balance manually verified on all 6 touched/new lib files + all 4
  touched/new test files.
- `fvm flutter analyze` / `fvm flutter test`: **BLOCKED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). `MaterialGroupSearchState` /
  `InternalProductSearchState` are `@freezed` and gained a new field — their generated
  `*.freezed.dart` parts are gitignored/not present in this working tree, so
  `fvm dart run build_runner build --delete-conflicting-outputs` must run before
  `flutter analyze`/`flutter test` on a machine with the toolchain. TEST_GROUP must re-run there
  before flipping to `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — pure
  cubit-method/state-field/widget-wiring bugfix reusing an already-registered request field
  (`status`), no new entity/event/permission/screen contract.

## 7. Non-goals / out of scope

- Did not touch `material_group_list_page.dart` / `material_group_list_cubit.dart` (read-only
  structural reference per scope).
- Did not change the search pages' default selected tab (`index 0` / "Tất cả") to match the list
  page's default (`index 1` / "Đang hoạt động") — no evidence in the bug report or Figma spec
  that the search screen should default differently than its current shipped behavior.
- Did not add a `launch()`-based rewrite of `_search()`'s manual try/catch — out of scope
  (pre-existing style in this file, unrelated to the reported bug).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — `status` field added to both search states; `changeStatus()` added to both search cubits (immediate re-query, no debounce, BUG-W03-084 loading pattern extended); `_tabStatuses`/`_handleTabChange`/`addListener`/`removeListener` wired on both search pages, mirroring `material_group_list_page.dart`. 6 lib files + 4 regression test files (2 new). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
