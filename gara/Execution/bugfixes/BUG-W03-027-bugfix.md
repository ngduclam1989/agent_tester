# BUGFIX — BUG-W03-027

> GraphQL schema contract mismatch — 100% (7/7) of mobile Inventory Catalog operations use invented type names, wrong scalar types, and a missing mutation argument
> Severity: **P1 (CRITICAL)** · Boundary: `garage-mobile` · Status: **FIX_DONE** · Date: 2026-07-01 · CR: `CR-20260701-07`

## 1. Summary

`InventoryCatalogDocument` (`lib/core/services/graphql/documents/inventory_catalog_document.dart`)
declared GraphQL query/mutation documents against INVENTED type names, an invented scalar type,
and was missing a required top-level mutation argument — none of which exist on the real BFF
schema, confirmed by reading
`agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` directly
(plus `common/response.generator.ts` for the response-union naming convention). This is the same
root-cause class already found and fixed on `garage-web` this session (BUG-W03-022 wrong `ID!`
scalar, BUG-W03-023 invented input type names) — but on mobile it is worse: it spans **100% (7/7)**
of the operations mobile wires, not a subset, and includes an entirely missing required argument
(`updateMaterialGroup`'s `id: Int!`) that BUG-W03-022/023 did not have an equivalent of.

Every one of these mismatches is a GraphQL **validation-layer** failure (unknown type / unknown
field / wrong variable scalar / missing required argument) — Apollo Server rejects the request
with HTTP 400 **before the resolver runs**. None of this had ever been exercised against a live
BFF because the Flutter toolchain has been unavailable in this sandbox for the whole wave
(`fvm flutter test` / integration/E2E all deferred) — so the contract drift was invisible to any
regression signal available to prior DEV/FIX/REVIEW cycles on this boundary.

## 2. Root cause

- The original mobile DEV cycle for this feature authored `gql` documents from a
  plausible-looking GraphQL convention (`{OperationName}Input`, `{OperationName}Response`,
  `ID!` for all identifiers) instead of reading the actual BFF SDL type declarations and the
  `generateMultipleResponseTypes(...)` naming convention it enforces
  (`{DataType}ApiResponse` success variant + `{DataType}Response` union, `Paged{DataType}...`
  wrapper for lists).
- No mechanical or process gate existed on this boundary to catch GraphQL document drift against
  the real SDL before this cycle (the equivalent gate — `graphql-sdl-fidelity.test.ts` — was only
  just introduced on `garage-web` as part of the BUG-W03-022/023 fix this same session; mobile has
  no direct analogue since `package:graphql_flutter`/`gql` document parsing isn't wired into a
  Dart-side SDL-fidelity test here).
- `updateMaterialGroup`'s missing `id` argument compounds a modeling mistake: the request model
  (`UpdateMaterialGroupRequest`) treated `id` as part of the mutation's `input` body, matching an
  (incorrect) assumption that all mutation state lives in one `input` argument — the real BFF
  signature is `updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!)`, a 2-argument
  mutation.

## 3. Files changed

| File | Change |
|---|---|
| `mobile/gf-garage-app/lib/core/services/graphql/documents/inventory_catalog_document.dart` | Rewrote all 7 query/mutation documents verbatim against the real SDL — see §4 table for the exact per-operation before/after. |
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/material_group_models.dart` | `UpdateMaterialGroupRequest.toJson()` no longer emits `'id'` in the JSON body (real `UpdateMaterialGroupInput` has no `id` field); `id` kept as a plain Dart field on the request class for the repository to read as a separate variable. |
| `mobile/gf-garage-app/lib/core/repositories/inventory_catalog/inventory_catalog_repository.dart` | `updateMaterialGroup()` now calls `_graphQLService.mutate(..., variables: {'id': request.id, 'input': request.toJson()})` (previously `{'input': request.toJson()}` only, with `id` incorrectly nested inside `input`). |
| `mobile/gf-garage-app/lib/core/models/inventory_catalog/internal_product_models.dart` | `InternalProductItem`/`InternalProductDetail`: `productType`→`nature`, `mainUnit`→`mainUnitCode`, `origin`→`originCode`, `specification` split into `productSpec`+`technicalSpec`, `createdByName`/`updatedByName` REMOVED from `InternalProductDetail` (not present on the real `InternalProduct` type). `SearchInternalProductsRequest.toJson()` now emits JSON key `'nature'` (was `'productType'`) — Dart constructor param name unchanged (internal-only, decoupled from the wire contract). |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/internal_product_list_card.dart` | `product.productType?.label` → `product.nature?.label`; `product.mainUnit` → `product.mainUnitCode`. |
| `mobile/gf-garage-app/lib/ui/inventory_catalog/internal_product_detail/internal_product_detail_page.dart` | `detail.productType?.label` → `detail.nature?.label`; `detail.origin` → `detail.originCode`; `detail.mainUnit` → `detail.mainUnitCode`; `detail.specification` (2 occurrences) → `detail.productSpec`. |

No other files were touched. `edit_material_group_cubit.dart` (already modified earlier this
session by the concurrent BUG-W03-026 error-code fix) was re-read fresh before this cycle and
verified to need **no** change — it already constructs
`UpdateMaterialGroupRequest(id: id, name: name, status: status, parentId: parentId, description: description)`,
which remains correct since the model still exposes `id` as a field; only the JSON serialization
changed.

## 4. Per-operation before/after (ground truth: `inventory-catalog.schema.ts`)

| # | Operation | Before (WRONG) | After (correct, verbatim against SDL) |
|---|---|---|---|
| 1 | `searchMaterialGroups` | `query SearchMaterialGroups($input: SearchMaterialGroupsInput)` / `... on SearchMaterialGroupsResponse` | `query SearchMaterialGroups($input: MaterialGroupSearchInput!)` / `... on PagedMaterialGroupApiResponse` |
| 2 | `getMaterialGroup` | `query GetMaterialGroup($id: ID!)` / `... on GetMaterialGroupResponse` | `query GetMaterialGroup($id: Int!)` / `... on MaterialGroupApiResponse` |
| 3 | `createMaterialGroup` | input type already correct; `... on CreateMaterialGroupResponse` | `... on MaterialGroupApiResponse` |
| 4 | `updateMaterialGroup` | `mutation UpdateMaterialGroup($input: UpdateMaterialGroupInput!) { updateMaterialGroup(input: $input) { ... on UpdateMaterialGroupResponse ... } }` — **missing `id` argument** | `mutation UpdateMaterialGroup($id: Int!, $input: UpdateMaterialGroupInput!) { updateMaterialGroup(id: $id, input: $input) { ... on MaterialGroupApiResponse ... } }` |
| 5 | `deleteMaterialGroup` | `mutation DeleteMaterialGroup($id: ID!)` / `... on DeleteMaterialGroupResponse` | `mutation DeleteMaterialGroup($id: Int!)` / `... on DeleteApiResponse` |
| 6 | `searchInternalProducts` | `query SearchInternalProducts($input: SearchInternalProductsInput)` / `... on SearchInternalProductsResponse`; fields `productType`, `mainUnit` | `query SearchInternalProducts($input: InternalProductSearchInput!)` / `... on PagedInternalProductApiResponse`; fields `nature`, `mainUnitCode` |
| 7 | `getInternalProduct` | `query GetInternalProduct($id: ID!)` / `... on GetInternalProductResponse`; fields `productType`, `mainUnit`, `origin`, `specification`, `createdByName`, `updatedByName` | `query GetInternalProduct($id: Int!)` / `... on InternalProductApiResponse`; fields `nature`, `mainUnitCode`, `originCode`, `productSpec` + `technicalSpec` (split); `createdByName`/`updatedByName` REMOVED (do not exist on `InternalProduct`) |

## 5. Enum reconciliation note (`ProductNature` vs `InternalProductType`)

The real BFF enum is `enum ProductNature { GOODS TOOL SERVICE OTHER }`. Mobile already has
`InternalProductType` (`lib/core/models/inventory_catalog/internal_product_status.dart`) with
values `goods/tool/service/other` and `jsonValue` getters returning exactly
`GOODS`/`TOOL`/`SERVICE`/`OTHER` — a byte-for-byte match. Rather than introduce a duplicate
`ProductNature` enum (which would require a parallel `fromJson`/`jsonValue` implementation and
touch every consumer of the existing enum for no behavioral gain), the fix **reused
`InternalProductType` as-is** and only renamed the *field* that carries it
(`productType` → `nature`, matching the real `InternalProduct.nature: ProductNature!` field name)
on `InternalProductItem`/`InternalProductDetail`. The enum class name itself was left unchanged to
minimize blast radius — this is a values-match, name-only field rename, not an enum redesign.

## 6. Impact if not fixed

- **All 7 operations** — every GraphQL request from `InventoryCatalogRepositoryImpl` for Material
  Group list/detail/create/edit/delete and Internal Product list/detail would be rejected by
  Apollo Server at the validation layer (unknown type / unknown field / scalar mismatch / missing
  required argument), before ever reaching the resolver. This is not a partial-degradation bug —
  it is a total feature outage for this entire mobile feature area the moment it talks to a real,
  schema-conformant BFF.
- `updateMaterialGroup` specifically would additionally fail with a **missing required argument**
  error even if the type names had been correct, since `id` was never sent at all.

## 7. Regression / verification

- `grep -rn` for all 9 invented type names across `lib/` (`SearchMaterialGroupsInput`,
  `SearchInternalProductsInput`, `GetMaterialGroupResponse`, `CreateMaterialGroupResponse`,
  `UpdateMaterialGroupResponse`, `DeleteMaterialGroupResponse`, `SearchMaterialGroupsResponse`,
  `SearchInternalProductsResponse`, `GetInternalProductResponse`) → **0 hits**.
- `grep -rn "\.productType\b" lib/` → remaining hits are all on filter/list UI *state* fields
  (`internal_product_filter_state.dart`, `internal_product_filter_page.dart`,
  `internal_product_list_state.dart`, `internal_product_list_cubit.dart`) and the
  `SearchInternalProductsRequest` constructor param — none are on `InternalProductItem`/
  `InternalProductDetail` model instances (those are 0 hits); this naming is intentionally
  decoupled from the wire contract (see §3 note) and out of scope to rename.
- `grep -rn "\.specification\b" lib/` → 0 hits.
- `grep -rn "\.mainUnit\b" lib/` → 0 hits (only `mainUnitCode`/`mainUnitDisplayName` remain).
- `grep -rn "createdByName\|updatedByName" lib/core/models/inventory_catalog/internal_product_models.dart` →
  0 hits (fully removed); confirmed before removal via
  `grep -rn "createdByName\|updatedByName" lib/ui/inventory_catalog/` that no UI file referenced
  these on `InternalProductDetail` (only `material_group_detail_page.dart` uses them, and that is
  for `MaterialGroupDetail`, which correctly retains both fields on the real schema).
- `grep -rn "InternalProductItem(\|InternalProductDetail(" lib/` → only the model's own factory
  constructors; no other construction call sites exist to update.
- `fvm dart analyze` / `fvm flutter test`: **DEFERRED**. Same known toolchain blocker as
  BUG-W03-026: a Flutter SDK exists at `/home/all_engineer/flutter` (3.32.8 / Dart 3.8.1), but
  `pubspec.yaml` requires `sdk: ^3.11.0` and no `.dart_tool/` is present (`flutter pub get` would
  fail version-solving). Same constraint as `BLOCKER-W02-MOBILE-HARNESS-FLUTTER` /
  `DEBT-W01-MOBILE-BUILD-ENV`. Static verification (grep-based, above) used instead.

## 8. Non-goals / out of scope / follow-ups

- `technicalSpec` is now correctly fetched (both in the `getInternalProduct` query and the
  `InternalProductDetail` model) but is **not yet surfaced** anywhere in
  `internal_product_detail_page.dart` — `_TechnicalSpecCard` currently only renders the unit row.
  Left as a follow-up rather than adding a new UI slot, to keep this fix mechanical (contract
  correctness only, per orchestrator scope discipline — no new UI features).
  Recommend a small follow-up DEV/FIX task to wire `detail.technicalSpec` into
  `_TechnicalSpecCard` (the section header already says "Thông số kỹ thuật" / "Technical spec",
  so the slot conceptually already exists).
- `pricingMethod` and `notes` (both real fields on `InternalProduct`) were **not** added to the
  query/model — out of scope per the fix prompt (optional scope-expansion, not required to
  address the crash-causing contract mismatches). Noted here as a candidate for a future DEBT
  item if the product needs these fields displayed on mobile.
- No shared GraphQL-SDL-fidelity regression test (equivalent to `garage-web`'s
  `graphql-sdl-fidelity.test.ts`) was added on the Dart side in this cycle — the Flutter toolchain
  block prevented writing/running a `flutter_test`-based equivalent. Recommend tracking this gap
  as DEBT for the next environment with a working toolchain, since this exact defect class
  (schema-contract drift undetected until manual audit) has now recurred on **both** garage-web
  and garage-mobile this wave.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-mobile | Initial fix — rewrote all 7 GraphQL documents, fixed `UpdateMaterialGroupRequest`/repository `id`-as-separate-variable, renamed/split 5 `InternalProduct*` model fields + 2 UI call sites, removed non-existent `createdByName`/`updatedByName` from `InternalProductDetail`. Build/analyze/test deferred (Flutter SDK version mismatch, no toolchain match, same as BUG-W03-026). |
