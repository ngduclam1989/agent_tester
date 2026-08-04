# BUGFIX — BUG-W03-038

> Filter đã áp dụng KHÔNG truyền lại vào màn Filter khi mở lại — luôn reset về rỗng
> Severity: **P2** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01

## 1. Summary

`material_group_list_page.dart:155-161` pushed `MaterialGroupFilterRoute` with **no argument** — even though `MaterialGroupListState.parentIdFilter` already held the previously-applied group id (used to toggle the AppBar's `icHaveFilter`/`icFilter` icon). `MaterialGroupFilterCubit` always started from `super(const MaterialGroupFilterState())` (`parentId: null` unconditionally), so reopening the Filter page after a filter had already been applied always showed the "Thuộc nhóm" dropdown empty ("--") — the user had no way to see what filter was currently active without remembering it. Identical defect on the PROD side: `internal_product_list_page.dart:106-107` pushed `InternalProductFilterRoute` with no argument; `InternalProductFilterCubit` always started both `productType`/`materialGroupId` at `null`.

## 2. Root cause

Half-applied filter-state management: the List page tracked "does a filter exist" (via `hasFilter` boolean, driving the icon) but never forwarded the *actual selected value* back into the Filter page/cubit when reopening it. The Filter page/cubit had no constructor/route mechanism to receive an initial value at all.

## 3. Fix

Same fix cycle as BUG-W03-037 (same 2 filter modules, avoids file conflicts) — established the existing repo convention (seen on `MaterialGroupDetailPage`: `@PathParam('id') required this.groupId` → `cubit.load(widget.groupId)` in `initState()`) rather than threading the value through the cubit's `@injectable` constructor (which is built via `getIt<C>()` in `buildCubit()` and cannot easily receive a per-navigation argument):

- **`MaterialGroupFilterPage`** — new optional constructor field `final int? initialParentId;`. `_MaterialGroupFilterPageState.initState()` now: if `widget.initialParentId != null`, calls `cubit.setParentId(widget.initialParentId)` **and** `cubit.loadGroupOptionsIfNeeded()`. The second call is a deliberate, commented `// preload:` exception to the BUG-W03-037 lazy-load rule (rules-mobile §3.1 explicitly allows this when justified) — the "Thuộc nhóm" text field must render the pre-selected group's *label*, not just its id, and the label can only be resolved once `groupOptions` has loaded.
- **`material_group_list_page.dart`** — `context.pushRoute(const MaterialGroupFilterRoute())` → `context.pushRoute(MaterialGroupFilterRoute(initialParentId: state.parentIdFilter))`.
- **`InternalProductFilterPage`** — new optional fields `final InternalProductType? initialProductType;` + `final int? initialMaterialGroupId;`. `initState()` seeds `cubit.setProductType(widget.initialProductType)` unconditionally-if-non-null, and `cubit.setMaterialGroupId(widget.initialMaterialGroupId)` + `cubit.loadGroupOptionsIfNeeded()` (same preload justification) when the group id is non-null. The "Loại sản phẩm" dropdown needs no preload — its options are the local `InternalProductType` enum, always available without a fetch.
- **`internal_product_list_page.dart`** — `context.pushRoute(const InternalProductFilterRoute())` → `context.pushRoute(InternalProductFilterRoute(initialProductType: state.productTypeFilter, initialMaterialGroupId: state.materialGroupIdFilter))`.
- `MaterialGroupFilterRoute`/`InternalProductFilterRoute` are auto_route-generated (`router.gr.dart`, gitignored, not present in this sandbox — no Flutter toolchain to run `build_runner`). Per existing wave convention (same as `MaterialGroupDetailRoute(groupId: id)` already used pre-fix), the annotated `@RoutePage()` page constructor is the source-of-truth; auto_route generates a matching named constructor argument from it. Codegen must be re-run before a real build.

## 4. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_filter/material_group_filter_page.dart` | New `initialParentId` field + `initState()` seed + preload |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/material_group_list/material_group_list_page.dart` | Push `MaterialGroupFilterRoute(initialParentId: state.parentIdFilter)` |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_filter/internal_product_filter_page.dart` | New `initialProductType`/`initialMaterialGroupId` fields + `initState()` seed + preload |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_list/internal_product_list_page.dart` | Push `InternalProductFilterRoute(initialProductType: ..., initialMaterialGroupId: ...)` |
| `mobile/gf-garage-app/test/ui/inventory_catalog/material_group_filter/material_group_filter_initial_value_test.dart` | **New** — cubit-level sequence test + source-wiring assertions |
| `mobile/gf-garage-app/test/ui/inventory_catalog/internal_product_filter/internal_product_filter_initial_value_test.dart` | **New** — same for PROD |

No cubit source files were touched for this bug — `setParentId`/`setProductType`/`setMaterialGroupId`/`loadGroupOptionsIfNeeded` all already existed (the last one added by the concurrent BUG-W03-037 fix in this same cycle) and are reused as-is. No `_state.dart` change needed.

## 5. Regression / verification

- `material_group_filter_initial_value_test.dart` (new): cubit-level test mirrors the exact `initState()` sequence (`cubit.setParentId(7)` then `await cubit.loadGroupOptionsIfNeeded()`) and asserts `state.parentId == 7` plus the matching `groupOptions` entry resolves to the correct label — proving the preload path correctly surfaces the pre-selected group's name. A second test asserts the null-initial-value path stays fully lazy (no fetch at all — protects the BUG-W03-037 fix from regressing). Static source-assertion tests pin `initialParentId` field presence, the `initState()` wiring, and that `material_group_list_page.dart` no longer pushes the route with `const ...()`.
- `internal_product_filter_initial_value_test.dart` (new): identical structure for the PROD module (`productType` + `materialGroupId` seeded together, group label resolved via preload; `InternalProductType` sibling needs no preload).
- `python3 scripts/check-mobile-canonical-primitives.py --file <4 touched lib files> --include-code` → **OK: 0 anti-pattern hit** (exit 0).
- `fvm flutter analyze` / `fvm flutter test`: **DEFERRED** — no Flutter/fvm toolchain in this sandbox (`DEBT-W01-MOBILE-BUILD-ENV`). Manually verified: `widget.initialParentId`/`widget.initialProductType`/`widget.initialMaterialGroupId` types match the corresponding `MaterialGroupListState`/`InternalProductListState` filter field types exactly (`int?`, `InternalProductType?`, `int?`) — no implicit cast risk; `cubit.setParentId`/`setProductType`/`setMaterialGroupId` signatures already accept nullable values (pre-existing, used by the Reset button), so passing a nullable `widget.initial*` field through unconditionally would also have been safe, though the `if (... != null)` guard was kept for symmetry with the explicit preload trigger.

## 6. Non-goals / out of scope

- Did not add a UI loading indicator for the brief window between page-open (with a pre-selected value) and the preload fetch resolving — same minimal-fix stance as BUG-W03-037.
- Did not change `MaterialGroupListCubit.applyFilter()` / `InternalProductListCubit.applyFilter()` (List-side apply logic) — pre-existing and correct, untouched.
- Did not touch `router.gr.dart` (generated, not present in this sandbox) — codegen must be re-run before a real build, consistent with the wave-wide DEFERRED-toolchain convention.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Fix — added `initial*` route-forwarded constructor fields to both filter pages, seeded into the cubit (+ explicit preload of `groupOptions` where a label needs resolving) in `initState()`, and updated both List pages to forward their current filter state on push. 2 new regression test files. `flutter analyze`/`flutter test` DEFERRED (no toolchain). |
