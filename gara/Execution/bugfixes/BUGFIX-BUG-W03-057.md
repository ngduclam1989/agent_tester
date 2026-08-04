# BUGFIX — BUG-W03-057

> `BaseCubit.launch()` — `isShowLoading` param khai báo nhưng KHÔNG được dùng trong thân hàm (dead param), 16 call site kỳ vọng suppress global loading overlay không có tác dụng
> Severity: **P3** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`BaseCubit.launch()` (`lib/core/common/bases/bloc/base_cubit.dart:11-39`) declares a named
param `isShowLoading` (default `true`) intended to let callers suppress the global loading
overlay for silent/background refreshes. The method body never read the param — every call
unconditionally emitted `processing: true`/`processing: false` (when `state.pageStatus` was
already `PageStatus.loaded`) regardless of what was passed. 16 call sites across the mobile
app pass this param explicitly expecting it to have an effect; none of them did.

## 2. Root cause

`launch()`'s two `pageStatus == loaded` branches (pre-emit before `future()`, post-emit in the
success `.then()` callback) and the catch-path branch used a plain `if (pageStatus != loaded)
{...} else {...}` structure — the `else` unconditionally emitted `processing`. `isShowLoading`
was accepted as a parameter but never referenced anywhere in the method body — a
dead-param-that-looks-implemented defect (name reads as if it gates behavior; it does not).

## 3. Fix

`base_cubit.dart` — the 3 `emit(processing: ...)` branches (success pre-emit, success
post-emit, catch-path) changed `else` → `else if (isShowLoading)`. The 3 `pageStatus`
transition branches (`loading`/`loaded`/`error`) are **untouched** — they remain unconditional,
since they gate the initial-load spinner, not the silent-refresh overlay, and are orthogonal
to this bug. Default stays `true` — every call site that omits the param keeps its exact
pre-fix behavior (backward-compatible by construction).

```dart
// Before (bug): unconditional processing emit
} else {
  emit(state.copyWith(processing: true, errorEntity: null) as S);
}

// After (fix): gated by isShowLoading
} else if (isShowLoading) {
  emit(state.copyWith(processing: true, errorEntity: null) as S);
}
```
Same change mirrored on the success post-emit branch and the catch-path branch.

## 4. Blast radius — 16 call-site audit (Shared-Symbol Blast-Radius Gate)

`base_cubit.dart` is a shared base class (>1 consumer) — every consumer was enumerated and
classified into 3 groups before the fix, then re-verified after:

**Group 1 — literal `isShowLoading: true` passthrough (no behavior change, true was already
the effective pre-fix behavior)**: `cart_cubit.dart:21`, `create_new_order_cubit.dart:565,610`,
`create_new_product_cubit.dart:115`, `list_purchase_request_cubit.dart:46`. Verified — all 5
sites pass a literal `true`, unaffected by the fix.

**Group 2 — genuine passthrough, no competing manual `processing` emit (behavior change, in
the intended direction)**: `marketplace_order_detail_cubit.dart` — `getData(String id, {bool
isShowLoading = true})` (line 41) forwards the caller's bool straight into `launch(...,
isShowLoading: isShowLoading)` (line 52) with zero manual emits inside. 3 internal callers pass
`isShowLoading: false` (lines 69, 143, 179 — silent refreshes after `updateOrderStage`/
attachment mutations). Post-fix, these silent refreshes correctly stop flashing the global
overlay — this is the bug's intended fix landing, not a regression (no double-emit risk, no
manual emit competes with `launch()`'s own).

**Group 3 — local `isShowLoading` on `getData(...)` NEVER forwarded into `launch(fetchAndEmit)`
(re-verified independently — no regression, files NOT touched)**: `order_detail_cubit.dart`
(`getData` line 37-51), `order_detail_v3_cubit.dart` (`getData` line 40-54),
`purchase_request_detail_cubit.dart` (`getData` line 79-141). Pattern in all 3:
```dart
Future<void> getData(String id, {bool isShowLoading = true, bool isRefresh = false}) async {
  Future<void> fetchAndEmit() async {
    if (!isShowLoading) {
      emit(state.copyWith(processing: false));
    }
    ...
  }
  if (isRefresh) {
    await fetchAndEmit();
  } else {
    return launch(fetchAndEmit);   // <- isShowLoading NEVER forwarded here
  }
}
```
The local `isShowLoading` only gates a manual `emit(processing: false)` **inside**
`fetchAndEmit`, used exclusively on the `isRefresh: true` path (timer-driven auto-refresh via
`startAutoRefresh()`), which bypasses `launch()` entirely. The plain `launch(fetchAndEmit)`
call (used when `isRefresh: false` — e.g. `order_detail_page.dart:71` /
`order_detail_v3_page.dart:71` call `getData(code, isShowLoading: false)`) never forwards the
local var to `launch()`'s own `isShowLoading` param — `launch()` always sees its own default
`true` there, identical to pre-fix behavior (pre-fix, `launch()`'s branches emitted
unconditionally anyway, which was already equivalent to "always true"). **Confirmed via full
re-read of all 3 files + both call sites — no regression found. These 3 files were
deliberately NOT touched.**

## 5. Regression test

`mobile/gf-garage-app/test/core/common/bases/bloc/base_cubit_test.dart` (new file) — drives the
real `BaseCubit` via a minimal hand-rolled concrete `_FixtureState`/`_FixtureCubit` (no
build_runner/freezed needed; `copyWith` implemented as a getter returning a callable closure
with a sentinel-default `errorEntity` param, mirroring freezed's generated `copyWith` shape).
5 test cases, group `BUG-W03-057 — BaseCubit.launch() isShowLoading gating`:

1. `isShowLoading: true` (default), success path, starting from `PageStatus.loaded` →
   2 emissions: `processing: true` (errorEntity cleared) then `processing: false`.
2. `isShowLoading: false`, success path, starting from `loaded` → **0 emissions** (no
   `processing` toggle at all) — the core bug-fix assertion.
3. `isShowLoading: true`, error path (future throws) → 3 emissions (`processing:true` →
   `processing:false` → `errorEntity` set via `handleError`), original error re-thrown to
   caller.
4. `isShowLoading: false`, error path → **no emission ever has `processing: true`**, error
   still re-thrown, `errorEntity` still gets set (error handling is never skipped just because
   the overlay is suppressed).
5. Fail-safe: cubit starting from `PageStatus.initial` (non-loaded) with
   `isShowLoading: false` still transitions `pageStatus` `loading → loaded` normally — proves
   the `pageStatus` branch is untouched by the fix.

## 6. Verification status

- `python3 scripts/check-mobile-canonical-primitives.py`: not applicable (no UI/widget file
  touched).
- `fvm flutter analyze` / `fvm flutter test`: **BLOCKED — no `fvm`/`flutter`/`dart` toolchain in
  this environment** (`DEBT-W01-MOBILE-BUILD-ENV`). Test written statically-correct; manually
  traced every emission sequence against the fixed source (§5 above) instead of executing.
  TEST_GROUP must re-run on a machine with the toolchain before flipping to `VERIFIED`.
- KG (`Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml`): **not updated** — this
  is a pure implementation-detail bugfix inside a shared BLoC base class; no
  entity/event/permission/screen changed.

## 7. Non-goals / out of scope

- Group 3 cubits (`order_detail_cubit.dart`, `order_detail_v3_cubit.dart`,
  `purchase_request_detail_cubit.dart`) were **not** refactored to newly wire their local
  `isShowLoading` into `launch()` — that would be a behavior change (new suppression on the
  `isRefresh: false` path) beyond this bug's scope, not a regression fix. No CR raised for it;
  flagged here only as a documented observation for a future wave if product wants that
  suppression too.
- No change to `handleError()`, `initData()`, or `retry()`.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — gate 3 `processing` emit branches in `BaseCubit.launch()` on `isShowLoading` (pageStatus branches untouched). 16 call-site blast-radius audit (3 groups) re-verified independently — group 3 (3 files) confirmed no regression, not touched. New regression test `base_cubit_test.dart` (5 cases). `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
