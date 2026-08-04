# BUGFIX — BUG-W03-091

> `EP-INVENTORY-CATALOG` Group Detail — 2 remaining non-refresh reload call sites still trigger the
> BasePage global loading overlay instead of the local shimmer
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

User follow-up report (mobile dev, 2026-07-02): "Tiếp màn detail vẫn chưa hiện shimmer mà hiện
loading của BasePage" — filed right after BUG-W03-088 shipped, which had fixed the
`SmartRefresher.onRefresh` pull-to-refresh path on `material_group_detail_page.dart`. Orchestrator
audit confirmed BUG-W03-088's fix was correctly scoped to pull-to-refresh only — but the same page
has 2 **other** call sites that call `cubit.load(widget.groupId)` without `isShowLoading: false`,
both of which can fire while `state.pageStatus` is already `loaded`:

1. `_DetailFooter.onEdit` — reload after a successful `EditMaterialGroupRoute` pop(true), wired
   into the Scaffold `bottomNavigationBar` footer.
2. `LoadEmpty(onRefresh: ...)` inside `_buildBody()` — the retry action shown when
   `detail == null` (error/not-found state).

This gap was **not a new regression** — BUG-W03-088's own regression test
(`material_group_detail_refresh_bug_088_test.dart`, test case 2) explicitly documented it at the
time as a known-remaining gap ("non-refresh callers (e.g. post-Edit reload) keep pre-fix
behavior"), and BUG-W03-088's BUGFIX doc §3d/§7 recorded the post-Edit reload call site as
out-of-scope. This bug closes that gap for both remaining call sites.

`internal_product_detail_page.dart` (Product Detail) does **not** have this gap — audited and
confirmed it has only 2 `cubit.load()` call sites total (`initState()` fresh-load,
`SmartRefresher.onRefresh` refresh), and both were already correct pre-existing (the
`SmartRefresher` one fixed by BUG-W03-088). No changes needed there.

## 2. Root cause

Same mechanism as BUG-W03-088 (`base_cubit.dart:11-39`, `BaseCubit.launch()`): when
`state.pageStatus` is already `PageStatus.loaded`, `launch()` hits the
`else if (isShowLoading)` branch; the default `true` (when the caller omits the param) fires
`emit(processing: true)`, which `BasePage`'s global `BlocListener` turns into the full-screen
`_GlobalLoadingOverlay` instead of the page's own local shimmer (`LoadingRowShimmerWidget`, gated
on `pageStatus == loading || initial` in `_buildBody()`, never reached once `pageStatus` stays
`loaded`).

`MaterialGroupDetailCubit.load()` already had the `{bool isShowLoading = true}` parameter
(added by BUG-W03-088) — the gap here was purely at the **call sites**, which never forwarded
`isShowLoading: false`:

```dart
// material_group_detail_page.dart — before
onEdit: () async {
  final updated = await context.pushRoute(EditMaterialGroupRoute(groupId: detail.id ?? 0));
  if (updated == true) {
    await cubit.load(widget.groupId);              // <- no isShowLoading: false
  }
},

// ...
if (detail == null) {
  return LoadEmpty(
    onRefresh: () async => cubit.load(widget.groupId),   // <- no isShowLoading: false
    text: LocaleKeys.catGrp_notFound.tr(),
  );
}
```

## 3. Fix

Added `isShowLoading: false` to both call sites — no other change, no new parameters, no widget
restructuring:

```dart
// _DetailFooter.onEdit — after
onEdit: () async {
  final updated = await context.pushRoute(EditMaterialGroupRoute(groupId: detail.id ?? 0));
  if (updated == true) {
    await cubit.load(widget.groupId, isShowLoading: false);
  }
},

// LoadEmpty(onRefresh: ...) — after
if (detail == null) {
  return LoadEmpty(
    onRefresh: () async =>
        cubit.load(widget.groupId, isShowLoading: false),
    text: LocaleKeys.catGrp_notFound.tr(),
  );
}
```

The page's single remaining bare call — `cubit.load(widget.groupId);` inside `initState()` — is
intentionally left unchanged: `state.pageStatus` starts at `PageStatus.initial` (not `loaded`) on
first mount, so `launch()` always takes the `if (state.pageStatus != PageStatus.loaded)` branch
regardless of `isShowLoading`, meaning the flag has no observable effect there.

## 4. Blast radius

- `MaterialGroupDetailCubit.load()` itself — **not modified** (already has the `isShowLoading`
  parameter from BUG-W03-088). This fix only changes call-site arguments on
  `material_group_detail_page.dart`, which is not a shared symbol (single-consumer page).
- No API/GraphQL/event contract touched — pure client-side loading-state call-site change.
- `internal_product_detail_page.dart` — audited, confirmed no equivalent gap, **not touched**.

## 5. Regression tests

- `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_reload_bug_091_test.dart`
  (new) — static source-assertion tests against `material_group_detail_page.dart` (same convention
  as BUG-W03-088's page-level source-pin group, `internal_product_detail_bug_087_test.dart`):
  - Exactly 1 bare `cubit.load(widget.groupId)` call site remains, and it is the `initState()`
    first load (regex-located, with a preceding-context check for `initState`) — guards against a
    3rd call site reintroducing the bug.
  - `_DetailFooter.onEdit` contains the literal
    `await cubit.load(widget.groupId, isShowLoading: false);`.
  - `LoadEmpty(onRefresh: ...)` contains the literal
    `cubit.load(widget.groupId, isShowLoading: false)`.
- `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_detail/material_group_detail_refresh_bug_088_test.dart`
  (updated, not a new file) — the cubit-emission behavior that both fixed call sites now rely on
  (`load(id, isShowLoading: false)` from an already-`loaded` state emits **no** `processing: true`)
  was already covered generically by this file's test case 1 (cubit-level, call-site agnostic).
  Updated:
  - Top-of-file comment now records that BUG-W03-088's scope was pull-to-refresh only, and that
    the other 2 call sites' gap is closed by this bug (BUG-W03-091), cross-referencing the new
    test file.
  - Test case 2 ("default `isShowLoading:true` call … still emits the processing edge") reworded —
    it no longer claims "non-refresh callers (e.g. post-Edit reload) keep pre-fix behavior" (no
    longer true, since post-Edit reload now opts out). Reworded to describe the cubit's own default
    behavior generically (opt-in-to-suppress, unchanged), cross-referencing the new BUG-W03-091 test
    file for the call-site-level assertions.

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py --file material_group_detail_page.dart` →
  **0 hit**.
- Paren/brace/bracket balance manually verified on the touched lib file (clean) and both test
  files; naive full-file counters flagged apparent mismatches in `material_group_detail_page.dart`'s
  sibling test file due to unbalanced parens *inside Dart string literals/comments* (test
  descriptions, prose) — confirmed not real syntax errors by full manual read of every flagged
  line, consistent with the same false-positive class already noted in BUGFIX-BUG-W03-088.md §6.
- `fvm flutter analyze` / `fvm flutter test`: **BLOCKED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). Regression tests written statically-correct,
  same source-assertion pattern as pre-existing tests in this suite. TEST_GROUP must re-run on a
  machine with the toolchain before flipping to `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — pure
  call-site argument change, no entity/event/permission/screen contract changed.

## 7. Non-goals / out of scope

- `internal_product_detail_page.dart` — audited, no equivalent gap found, not touched.
- No new loading-UX affordance (shimmer/skeleton) added — both call sites already fall back to
  the existing content staying visible (no `pageStatus` change) once `isShowLoading: false` is
  passed; there was never a missing shimmer widget, only an incorrectly-firing global overlay
  masking the fact that no visible loading indicator was needed at all in these 2 cases (retry from
  error state re-uses the same `LoadEmpty`/error UI while the request is in flight; post-Edit
  reload keeps the pre-Edit content visible until the response resolves).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Initial fix — added `isShowLoading: false` to `_DetailFooter.onEdit` and `LoadEmpty(onRefresh: ...)` call sites on `material_group_detail_page.dart`. New regression test file `material_group_detail_reload_bug_091_test.dart` (3 source-pin cases); updated `material_group_detail_refresh_bug_088_test.dart` comment + test case 2 reason to remove the now-inaccurate "known-remaining gap" framing. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
