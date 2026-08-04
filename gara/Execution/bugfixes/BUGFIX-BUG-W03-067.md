# BUGFIX — BUG-W03-067

> Mobile chưa gửi `parentIdProvided` khi search theo `parentId` — client-side counterpart của BUG-W03-066 (BFF schema)
> Severity: **P2** · Boundary: `garage-mobile` · Status: **RESOLVED** · Date: 2026-07-02

## 1. Summary

`SearchMaterialGroupsRequest.toJson()` (`material_group_models.dart`) only ever conditionally set `parentId` (`if (parentId != null) map['parentId'] = parentId`) and had no `parentIdProvided` field at all. `gf-inventory`'s backend `parentId` filter branch is gated on a `parentIdProvided: boolean` flag (see BUG-W03-066) — without the mobile client ever setting it, the branch never activated regardless of what `parentId` value was sent. BUG-W03-066 landed first (BFF `MaterialGroupSearchInput` now declares `parentIdProvided: Boolean`, additive/non-breaking, `FIX_DONE`), unblocking this fix.

The user explicitly emphasized (twice) that `parentIdProvided: true` must be sent **only when there is genuine, deliberate parent-scoping intent** — never unconditionally, and never merely because some `parentId`-shaped field happens to be non-null for unrelated reasons. This required auditing each of the 4 call sites individually rather than doing a blanket wire.

## 2. Root cause

Same shape as BUG-W03-066 on the other side of the contract: the mobile model was written before the 3-state (`all-level` / `root-only` / `children-of-X`) filter design existed on the backend, so it only ever had a 2-state `parentId` (`null` / `<id>`), with no way to distinguish "no filter intent" from "root-level filter intent" — and, until BUG-W03-066, the field didn't exist to send anyway.

## 3. Per-call-site intent audit (the crux of this fix)

Read each of the 4 call sites listed in the bug row's `component:` field in full (not assumed) before touching anything:

### 3.1 `material_group_list_cubit.dart` `_fetch()` — GENUINE INTENT, wired

This is the **only** call site with real parent-scoping intent. Traced the full data path:

- `MaterialGroupListState.parentIdFilter` (`int?`, default `null`) is set **exclusively** via `MaterialGroupListCubit.applyFilter({int? parentId})`.
- `applyFilter()` is called from `material_group_list_page.dart` with `value['parentId']`, where `value` is the `Map<String, dynamic>` popped by `MaterialGroupFilterPage`'s "Áp dụng" button: `Navigator.of(context).pop(<String, dynamic>{'parentId': state.parentId})`.
- `MaterialGroupFilterPage`'s dropdown options (`_optionsFor()`) are exactly `[_ParentGroupOption(null, "Tất cả"), ...groupOptions.map(...)]` — i.e. the UI exposes **two kinds of selection**: "Tất cả" (id `null`) or one specific group (id `<int>`). There is **no third "root-level only" option** in this dropdown today.

Conclusion: `state.parentIdFilter == null` always means "no parent-scoping intent" — whether the user never opened the filter, explicitly picked "Tất cả", or hit "Reset" — **never** "root-level only" (that 3rd backend-supported state simply isn't reachable from this UI yet). `state.parentIdFilter != null` always means the user explicitly picked one specific group to scope by (children-of-X). So the wiring is:

```dart
parentIdProvided: state.parentIdFilter != null
```

`true` exactly when there's a specific applied parent filter; `false`/omitted for the default "show everything" case (which also covers the "Tất cả" selection, since semantically that IS "no parent scoping" — sending `parentIdProvided:false` there is correct, not a shortcut).

### 3.2 `material_group_filter_cubit.dart` `loadGroupOptionsIfNeeded()` — NO intent, unchanged

Fetches **all** active groups (`size: 500`, no `parentId`) purely to populate the "Thuộc nhóm" dropdown's **options list** (the list the user picks *from* in §3.1) — this is the option-source fetch, not the filter application. It has zero parent-scoping intent by construction: it must always see the full tree to offer a complete picker. Left untouched (no `parentIdProvided` set, so it stays at the model's default `false`/omitted).

### 3.3 `add_material_group_cubit.dart` `initData()` — NO intent, unchanged

Fetches all active groups (`size: 200`, no `parentId`) to populate `parentOptions` — the "Thuộc nhóm" dropdown for the **Create** form, where the user picks a parent for a brand-new group. This picker must show the full tree (any active group can become the new group's parent); there is no reason to pre-filter it by any parent scope. Left untouched.

### 3.4 `edit_material_group_cubit.dart` `load()` — NO intent, unchanged

Fetches all active groups (`size: 200`, no `parentId`) into `parentOptions`, but critically: **`FEAT-CAT-GRP-EDIT` AC-4 (v5, 2026-07-02) now locks the "Thuộc nhóm" field disabled on the Edit screen** — "khoá vĩnh viễn sau khi tạo", same treatment as the "Mã nhóm VTHH" field. The user cannot re-pick a parent on Edit at all; this fetch exists solely to **resolve the current parent's display name** for the (disabled) field. It is not a picker in active use, so — like §3.2/§3.3 — it has no parent-scoping intent and must fetch the full tree to find the right name. Left untouched.

**Net result**: exactly 1 of 4 call sites required wiring. The other 3 are confirmed, by reading their actual UX purpose (not by assumption), to be full-tree lookup fetches with no filtering intent at all — wiring `parentIdProvided` there would have been the "set tràn lan" (blanket-set) anti-pattern the user explicitly warned against.

## 4. Fix

- **`material_group_models.dart`** — added `parentIdProvided` (`bool`, default `false`) to `SearchMaterialGroupsRequest`. `toJson()` changed from unconditional `if (parentId != null) map['parentId'] = parentId` to: when `parentIdProvided == true`, send both `parentId` (which may itself be `null`, for a future root-only case) and `parentIdProvided: true`; otherwise omit **both** keys entirely (matches legacy behavior and the `undefined`-when-omitted contract BUG-W03-066's BFF-side regression test already pins).
- **`material_group_list_cubit.dart`** — `_fetch()` now passes `parentIdProvided: state.parentIdFilter != null` alongside the existing `parentId: state.parentIdFilter`.
- **`material_group_filter_cubit.dart`, `add_material_group_cubit.dart`, `edit_material_group_cubit.dart`** — no code change (confirmed by audit above); the bug row's `component:` list included them as *candidates to audit*, not call sites guaranteed to need wiring.

## 5. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/material_group_models.dart` | Added `parentIdProvided` field (default `false`) to `SearchMaterialGroupsRequest`; `toJson()` sends `parentId`+`parentIdProvided:true` only when `parentIdProvided==true`, else omits both |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_cubit.dart` | `_fetch()` wires `parentIdProvided: state.parentIdFilter != null` (the one genuine-intent call site) |
| `mobile/gf-garage-app/test/core/models/inventory_catalog/material_group_models_parent_id_provided_bug_067_test.dart` | **New** — 5 cases pinning the 3 request shapes (omitted / root-only true+null / children-of-X true+id) + 2 edge cases |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_list/material_group_list_cubit_parent_filter_bug_067_test.dart` | **New** — 5 cases: initial load never sends `parentIdProvided:true` (crux regression), `applyFilter(id)` sends true, `applyFilter(null)` after a prior filter reverts to false, unrelated state changes (status/search/refresh) never flip it, applied filter survives unrelated refetches |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_cubit_test.dart` | **Appended** (existing tests untouched) — 1 new case: `loadGroupOptionsIfNeeded()` never sends `parentIdProvided:true` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_add/add_material_group_cubit_test.dart` | **Appended** — 1 new case: `initData()` never sends `parentIdProvided:true`; also added `SearchMaterialGroupsRequest` fallback-value registration needed for the new test |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_edit/edit_material_group_cubit_test.dart` | **Appended** — 1 new case: `load()`'s parent-options fetch never sends `parentIdProvided:true`; also added `SearchMaterialGroupsRequest` fallback-value registration |

## 6. Regression / verification

- **Model-level** (`material_group_models_parent_id_provided_bug_067_test.dart`): pins `toJson()` output for the 3 documented request shapes plus the edge case that setting a non-null `parentId` alone (without `parentIdProvided: true`) still omits both keys — `parentIdProvided` is the single source of truth for intent, not `parentId` non-null-ness.
- **Cubit-level, genuine-intent site** (`material_group_list_cubit_parent_filter_bug_067_test.dart`): the crux test is `'initial load (no filter ever applied) does NOT send parentIdProvided:true'` — this is exactly the regression shape the user warned about (a naive "set true whenever some parentId-shaped state exists" wiring would fail it, since `MaterialGroupListState` always technically "has" a `parentIdFilter` field). Also covers: applying/clearing the filter, and that unrelated state transitions (status filter, keyword search, refresh) don't accidentally flip the flag.
- **Cubit-level, no-intent sites** (3 files, appended): each asserts its call site's captured `SearchMaterialGroupsRequest.parentIdProvided` is `false` and that `toJson()` omits both `parentId`/`parentIdProvided` — these are the tests that would catch a future regression if someone "helpfully" wires `parentIdProvided` into one of these full-tree-lookup fetches without intent.
- `python3 scripts/check-mobile-canonical-primitives.py --file <each touched lib file>` → **0 hits** on both `material_group_models.dart` and `material_group_list_cubit.dart`.
- `fvm flutter analyze` / `fvm flutter test` — **BLOCKED**: no Flutter/Dart toolchain in this sandbox (`fvm`/`flutter`/`dart` not on `PATH`, no `.fvm/`), consistent with `DEBT-W01-MOBILE-BUILD-ENV`. Manually verified: brace/paren balance on all touched files, `SearchMaterialGroupsRequest` field/constructor signature matches all call sites, test fixture constructor shapes (`BasePagingResponse`, `BasePagingDataResponse`, `BaseResponse`) match the real classes' constructors (positional vs named args verified against source), and `MaterialGroupDetail`/`MaterialGroupItem` field names used in new fixtures match the real model. Build/test verify **DEFERRED** for TEST_GROUP on a machine with the toolchain.

## 7. Non-goals / out of scope

- Did **not** touch `material_group_search_cubit.dart` or `internal_product_filter_cubit.dart` — both also call `SearchMaterialGroupsRequest`, but neither is in this bug's `component:` scope and neither sets `parentId` at all (keyword-only search / different domain), confirmed by grep before excluding them.
- Did **not** add a UI affordance for the theoretical "root-level only" filter state — the model/wire-contract supports it (`parentId: null` + `parentIdProvided: true`), but no current mobile screen exposes a distinct "chỉ nhóm gốc" option, so no cubit sends it today. If Product ever adds that UI, wiring it is a 1-line change (`parentIdProvided: true` at the point that specific selection is made) thanks to the model already supporting the shape.
- Did **not** modify `gf-inventory` (backend) or `agg-garage-graph` (BFF) — both already correct (BUG-W03-066).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-02 | 1 | agent-fix-garage-mobile | Fix — added `parentIdProvided` (default `false`) to `SearchMaterialGroupsRequest`; audited all 4 candidate call sites individually (per-site intent reasoning in §3); wired the 1 genuine-intent site (`material_group_list_cubit.dart`); left the 3 no-intent full-tree-lookup sites unchanged; 2 new test files + 3 appended negative-case tests across the unchanged call sites' existing test files; `check-mobile-canonical-primitives.py` 0 hits; `flutter analyze`/`flutter test` DEFERRED (no toolchain, `DEBT-W01-MOBILE-BUILD-ENV`). |
