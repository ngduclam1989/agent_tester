# BUGFIX — BUG-W03-098

> `ListWidget._handleLoading`/`_handleRefresh` had no try/catch/finally — a transient error during load-more permanently stuck the footer at `LoadStatus.loading` for the remaining lifetime of the screen.
> Severity: **P1** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User (mobile dev) reported, after the orchestrator had already confirmed `enablePullUp`/`onLoading` wiring was correct on both GRP-list and PROD-list screens (matching the working `customer_list` exemplar, page size 20 with ~42/~37 total records so a real page-2 fetch was expected): *"Nhưng sao phần load more chưa thấy được nhỉ"*. Since the wiring was already correct, the orchestrator audited the vendored `pull_to_refresh` 2.0.0 package source directly (`smart_refresher.dart`, `indicator_wrap.dart`) rather than re-checking call sites, and found the real gap: `ListWidget`'s footer/header callback handlers had no error handling, so any transient fetch failure left the `RefreshController` permanently unresolved. `ListWidget` is a shared widget with 33 consumer files app-wide — this fix is not scoped to the 2 catalog screens that surfaced it.

## 2. Root cause

`lib/ui/widgets/list/list_widget.dart`'s `_ListWidgetState`:

```dart
Future<void> _handleRefresh() async {
  await widget.onRefresh?.call();
  _refreshController.refreshCompleted();
}

Future<void> _handleLoading() async {
  await widget.onLoading?.call();
  _refreshController.loadComplete();
}
```

Neither method had a `try`/`catch`/`finally`. `pull_to_refresh` 2.0.0's `RefreshController` requires an explicit terminal call (`loadComplete()`/`refreshCompleted()` on success, or `loadFailed()`/`refreshFailed()` on failure) to leave the `LoadStatus.loading`/`RefreshStatus.refreshing` state. If the awaited `onLoading`/`onRefresh` callback throws, the line calling the terminal method is never reached, and the vendored package's `_dispatchModeByOffset` (`indicator_wrap.dart:467-468`) short-circuits on `LoadStatus.loading == mode` — i.e. it never re-evaluates gesture-driven dispatch once stuck in `loading`, so the footer never recovers for the remaining lifetime of the widget.

Independently, `MaterialGroupListCubit.loadMore()` and `InternalProductListCubit.loadMore()` called `_fetch(reset: false)` with **no** error handling at all (unlike `initData()`, which already wraps its own `_fetch(reset: true)` in try/catch for a different reason — falling back to empty-state UI). Any transient network/GraphQL error on a page-2+ fetch would therefore propagate uncaught straight through `ListWidget.onLoading` into the now-unguarded `_handleLoading()`, triggering exactly the stuck-footer bug above.

Confirmed via the vendored package source (`~/.pub-cache/hosted/pull_to_refresh-2.0.0/lib/src/smart_refresher.dart` + `internals/indicator_wrap.dart`) that `RefreshController.loadFailed()`/`refreshFailed()` set `footerMode`/`headerMode` to `LoadStatus.failed`/`RefreshStatus.failed`, and that `_dispatchModeByOffset`'s short-circuit only checks `LoadStatus.loading == mode` (line 468) — `failed` is explicitly handled by `_handleModeChange` (`mode == LoadStatus.failed` is grouped with `idle`/`noMore`, calling `finishLoading()`), so a `failed` state remains retriable, unlike `loading`.

## 3. Fix

### (a) `lib/ui/widgets/list/list_widget.dart` — shared widget, defense-in-depth for all 33 consumers

```dart
Future<void> _handleRefresh() async {
  try {
    await widget.onRefresh?.call();
    _refreshController.refreshCompleted();
  } catch (_) {
    _refreshController.refreshFailed();
  }
}

Future<void> _handleLoading() async {
  try {
    await widget.onLoading?.call();
    _refreshController.loadComplete();
  } catch (_) {
    _refreshController.loadFailed();
  }
}
```

The success path is unchanged (identical statements, now inside a `try`); the only new behavior is the `catch` branch, which always resolves the `RefreshController` into a package-native, retriable failure state instead of leaving it stuck. The local `ClassicFooter`/header indicators used by `ListWidget` are already deliberately minimal (`idleText`/`loadingText`/`failedText` all `""`, `idleIcon: SizedBox.shrink()`), so this fix intentionally does not add visible failed-state text/icon styling — that would be a separate, broader UI change out of this bug's scope; the fix here is purely about the `RefreshController`'s internal state no longer getting stuck, which is the actual reported symptom (load-more "never works again" for the rest of the screen's life).

### (b) `MaterialGroupListCubit.loadMore()` / `InternalProductListCubit.loadMore()` — root-cause-adjacent hardening

Both cubits (identical shape):

```dart
Future<void> loadMore() async {
  if (!state.enablePullUp) return;
  try {
    await _fetch(reset: false);
  } catch (_) {
    ToastMessageUtils.showOnMessage(
      AppMessageType.error,
      message: LocaleKeys.load_failed.tr(),
    );
  }
}
```

- Reused the existing `load_failed` LocaleKey ("Tải thất bại" / "Load failed") — already used for the exact same footer-failure semantics in `lib/app/app.dart`'s global `RefreshConfiguration.footerBuilder` (`failedText: LocaleKeys.load_failed.tr()`), so no new locale key was needed.
- Used `ToastMessageUtils.showOnMessage`, **not** `BaseCubit.launch()`/`emit(processing: true)` or `listProcessing: true` — per LL-MOB-014/§9.14 (this session's own codified rule, from BUG-W03-057/058/088), a background/list-loading error must never trip the global `BasePage` overlay.
- The `catch` branch does **not** re-emit `groups`/`products`/`enablePullUp`/`currentPage` — so a failed page-2+ fetch leaves the prior `enablePullUp: true` (and `groups`/`currentPage`) exactly as they were before the failed attempt. The footer therefore stays retriable and does not lose data or silently disable further load-more attempts, even though more pages may still exist.

### Shared-Symbol Blast-Radius Gate

`ListWidget` is used well beyond the 2 catalog screens. `rg -l "ListWidget\(" lib/` (33 files):

```
lib/ui/booking/booking_list/booking_list_page.dart
lib/ui/booking/booking_search/booking_search_page.dart
lib/ui/customer/customer_list/customer_list_page.dart
lib/ui/customer/customer_search/customer_search_page.dart
lib/ui/employee_accounts/list_employee_accounts/list_employee_accounts_page.dart
lib/ui/employee_accounts/search_employee_accounts/search_employee_accounts_page.dart
lib/ui/human_resource/employee_list/employee_list_page.dart
lib/ui/human_resource/employee_search/employee_search_page.dart
lib/ui/inventory/inventory_list/inventory_list_page.dart
lib/ui/inventory/inventory_search/inventory_search_page.dart
lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart
lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart
lib/ui/notification/notification_page.dart
lib/ui/ordering/purchase_order/list_order/list_order/list_order_page.dart
lib/ui/ordering/purchase_order/list_order/search_list_order/search_list_order_page.dart
lib/ui/ordering/purchase_order_v3/list_order_v3/list_order_v3/list_order_v3_page.dart
lib/ui/ordering/purchase_order_v3/list_order_v3/search_list_order_v3/search_list_order_v3_page.dart
lib/ui/ordering/purchase_request/list_purchase_request/list_purchase_request/list_purchase_request_page.dart
lib/ui/ordering/purchase_request/list_purchase_request/list_purchase_request_search/list_purchase_request_search_page.dart
lib/ui/quotation/history_update_quotation/history_update_quotation_page.dart
lib/ui/quotation/request_quote_list/request_quote_list_page.dart
lib/ui/quotation/request_quote_list_search/request_quote_list_search_page.dart
lib/ui/service_order_v3/service_order_list_search_v3/service_order_list_search_v3_page.dart
lib/ui/service_order_v3/service_order_list_v3/service_order_list_v3_page.dart
lib/ui/settlement/settlement_list/settlement_list_page.dart
lib/ui/settlement/settlement_search/settlement_search_page.dart
lib/ui/supplier/supplier_list/supplier_list_page.dart
lib/ui/supplier/supplier_search/supplier_search_page.dart
lib/ui/tenant_transporter_registry/list/tenant_transporter_registry_list_page.dart
lib/ui/tenant_transporter_registry/search/tenant_transporter_registry_search_page.dart
lib/ui/vehicle_management/vehicle_list/list/vehicle_management_list_page.dart
lib/ui/vehicle_management/vehicle_list/search/vehicle_management_search_page.dart
lib/ui/vehicle_management/vehicle_notes/vehicle_management_technical_notes_page.dart
lib/ui/vehicle_management/vehicle_parts/search/vehicle_management_parts_search_page.dart
lib/ui/vehicle_management/vehicle_parts/vehicle_management_parts_page.dart
lib/ui/vehicle_management/vehicle_services/search/vehicle_management_services_search_page.dart
lib/ui/vehicle_management/vehicle_services/vehicle_management_services_page.dart
```

The fix is a **call-site-agnostic defensive wrap** (locus (b) shared-contract defect per `bug-scope-guard.md`'s decision table — the widget was unsafe for *every* input, not just the 2 catalog screens): it does not add or change any constructor parameter, does not alter the happy-path statements (byte-identical, just now inside a `try`), and does not change any default. Every one of the 33 consumers is therefore safe by construction — no call-site edits were needed or made, and no consumer's success-case output changes.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/widgets/list/list_widget.dart` | `_handleRefresh()`/`_handleLoading()` wrapped in try/catch; catch calls `_refreshController.refreshFailed()`/`loadFailed()` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_cubit.dart` | `loadMore()`'s `_fetch(reset: false)` wrapped in try/catch; catch shows a `ToastMessageUtils` error toast (`LocaleKeys.load_failed`), no state re-emit |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/internal_product_list_cubit.dart` | Same as above, mirrored on the sibling cubit |
| `mobile/gf-garage-app/test/ui/widgets/list/list_widget_load_refresh_error_bug_098_test.dart` | New — 4 `testWidgets` (2 error-path, 2 happy-path-unchanged controls) |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/material_group_list_cubit_load_more_error_bug_098_test.dart` | New — mocktail cubit tests + static toast-call-site assertion |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_list/internal_product_list_cubit_load_more_error_bug_098_test.dart` | New — mirrored on the sibling cubit |

## 5. Regression / verification

- `test/ui/widgets/list/list_widget_load_refresh_error_bug_098_test.dart` — pumps a real `ListWidget` (`MaterialApp` host), retrieves the mounted `SmartRefresher`'s `onLoading`/`onRefresh` closures (i.e. `_handleLoading`/`_handleRefresh` themselves) via `tester.widget<SmartRefresher>(...).onLoading as Future<void> Function()`, and calls them directly — this bypasses the package's unrelated drag/animation gesture machinery (irrelevant to this bug) while still exercising the exact code path added by the fix:
  1. Throwing `onLoading` → `controller.footerStatus` ends at `LoadStatus.failed`, never observed at `LoadStatus.loading`; no uncaught exception (`tester.takeException()` is `null`).
  2. Non-throwing `onLoading` → `controller.footerStatus` ends at `LoadStatus.idle` (happy path unchanged).
  3. Throwing `onRefresh` → `controller.headerStatus` ends at `RefreshStatus.failed`, never `refreshing`.
  4. Non-throwing `onRefresh` → `controller.headerStatus` ends at `RefreshStatus.completed` (happy path unchanged).
- `test/ui/inventory_catalog/material_group_list/material_group_list_cubit_load_more_error_bug_098_test.dart` + sibling `internal_product_list_cubit_load_more_error_bug_098_test.dart` (mocktail, mirroring the existing `material_group_list_cubit_parent_filter_bug_067_test.dart` convention):
  - Page-2 fetch throwing → `cubit.loadMore()` future **completes** (does not rethrow/crash the caller).
  - Page-2 fetch throwing → `state.enablePullUp` stays `true` (not corrupted to `false`).
  - Page-2 fetch throwing → `state.groups`/`state.products` and `state.currentPage` are unchanged (no partial/corrupt merge).
  - `loadMore()` remains a no-op (no repository call) when `enablePullUp` is already `false` — unchanged guard.
  - Page-2 fetch succeeding still merges items and advances `currentPage` — happy path unchanged by the fix.
  - Static source assertion pins the exact `ToastMessageUtils.showOnMessage(AppMessageType.error, message: LocaleKeys.load_failed.tr())` call site inside `loadMore()`'s catch, and confirms that catch never emits `processing: true`/`listProcessing: true` (same convention as `toast_canonical_bug_055_test.dart`, invoking `toastification` outside a mounted `ToastificationWrapper` is out of scope for a pure cubit unit test).
- `python3 scripts/check-mobile-canonical-primitives.py --file` → **0 hit** on all 3 touched `lib/` files.
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no `fvm` on PATH in this environment; a raw Flutter SDK exists at `/home/all_engineer/flutter` (3.32.8 / Dart 3.8.1), but `flutter pub get` fails immediately (`pubspec.yaml` requires `sdk: ^3.11.0`, version-solving failure, no `.dart_tool/`) — same `DEBT-W01-MOBILE-BUILD-ENV` constraint as every prior mobile FIX cycle this wave. All 3 new test files were manually re-derived against the post-fix source (RefreshController/ClassicFooter/indicator_wrap.dart package internals, `MaterialGroupItem`/`InternalProductItem`/`BasePagingResponse`/`PageInfo` constructors) before being written; TEST_GROUP on a machine with the correct toolchain should run `fvm flutter test test/ui/widgets/list/list_widget_load_refresh_error_bug_098_test.dart test/ui/inventory_catalog/material_group_list/material_group_list_cubit_load_more_error_bug_098_test.dart test/ui/inventory_catalog/internal_product_list/internal_product_list_cubit_load_more_error_bug_098_test.dart` first.
- KG update: **skipped** — pure error-handling/control-flow fix, no entity/event/permission/screen contract change.

## 6. Non-goals / out of scope

- Did not add visible failed-state styling (icon/text) to `ListWidget`'s `ClassicFooter`/header — the local override in `list_widget.dart` deliberately shows no text/icon in any state today (`idleText`/`loadingText`/`failedText` all `""`); adding failed-state UI copy across 33 consumers is a separate, broader design decision out of this bug's scope. The fix here only ensures the `RefreshController`'s internal state resolves instead of hanging — the actual reported symptom.
- Did not touch `MaterialGroupListCubit.refresh()`/`InternalProductListCubit.refresh()` (the pull-down path driving `_handleRefresh`) — both already had a `try`/`finally` around `_fetch(reset: true)` (no state corruption risk there), and any exception they let propagate is now caught by the sibling `list_widget.dart` fix regardless.
- Did not touch `initData()` on either cubit — its existing try/catch (falling back to `pageStatus: PageStatus.loaded` for empty-state UI) is a different, already-correct pattern, unrelated to this bug.
- Did not modify the `pull_to_refresh` package itself (vendored dependency, out of scope) — only consumed its already-existing `loadFailed()`/`refreshFailed()` public API.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — `list_widget.dart`'s `_handleLoading`/`_handleRefresh` wrapped in try/catch (catch calls `RefreshController.loadFailed()`/`refreshFailed()`, package-native retriable failure states, verified via package source that they are not subject to the `LoadStatus.loading` short-circuit that caused the original hang); `MaterialGroupListCubit`/`InternalProductListCubit`'s `loadMore()` wrapped in try/catch (catch surfaces a `ToastMessageUtils` toast, reusing the existing `load_failed` LocaleKey, without corrupting `enablePullUp`/`groups`/`products`). Shared-Symbol Blast-Radius Gate confirmed 33 `ListWidget` consumers, all safe by construction (pure error-path addition, 0 happy-path change). 3 new regression test files (4 widget-level cases + 2×5 cubit-level cases). `flutter analyze`/`flutter test` DEFERRED (no matching toolchain, `DEBT-W01-MOBILE-BUILD-ENV`). |
