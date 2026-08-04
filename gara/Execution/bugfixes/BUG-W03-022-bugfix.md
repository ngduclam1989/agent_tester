# BUGFIX — BUG-W03-022

> GraphQL variable `$id` khai `ID!` — BFF schema yêu cầu `Int!` (12/22 catalog-v2 operations)
> Severity: **P1** · Boundary: `garage-web` · Status: **RESOLVED** · Date: 2026-07-01

## 1. Summary

12 GraphQL hooks under `src/features/inventory-catalog/{material-group,internal-product}/hooks/` declared `$id: ID!` in their `gql` document literals. The BFF schema (`agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts`) declares every id-bearing argument for these 12 operations as `Int!`. GraphQL variable-usage validation does not coerce a named-type mismatch (`ID` ≠ `Int`), so Apollo Server rejects every one of these operations at document-validation time — before any resolver runs — with `Variable "$id" of type "ID!" used in position expecting type "Int!"` (HTTP 400).

## 2. Root cause

FE hook authoring applied a generic GraphQL heuristic ("use `ID!` for any entity identifier") instead of reading the actual BFF SDL argument scalar type before writing the `gql` document. The BFF schema — ground truth per rule W-R10 — declares `id: Int!` (and `unitId`/`attachmentId`/`productId`: `Int!`) uniformly across the catalog-v2 slice; no operation in this schema uses the GraphQL `ID` scalar for these arguments.

## 3. Files changed

| File | Change |
|---|---|
| `src/features/inventory-catalog/material-group/hooks/use-get-material-group.ts` | `$id: ID!` → `$id: Int!`; TS variable type `{ id: string }` → `{ id: number }`; call site `String(id)` → `Number(id)`. |
| `src/features/inventory-catalog/material-group/hooks/use-update-material-group.ts` | Same pattern. |
| `src/features/inventory-catalog/material-group/hooks/use-delete-material-group.ts` | Same pattern. |
| `src/features/inventory-catalog/internal-product/hooks/use-get-internal-product.ts` | Same pattern. |
| `src/features/inventory-catalog/internal-product/hooks/use-update-internal-product.ts` | Same pattern. |
| `src/features/inventory-catalog/internal-product/hooks/use-delete-internal-product.ts` | Same pattern. |
| `src/features/inventory-catalog/internal-product/hooks/use-map-sku.ts` | Same pattern (`productId` arg already correctly `Int!`, left untouched). |
| `src/features/inventory-catalog/internal-product/hooks/use-unmap-sku.ts` | Same pattern (`productId` untouched). |
| `src/features/inventory-catalog/internal-product/hooks/use-add-conversion-unit.ts` | Same pattern. |
| `src/features/inventory-catalog/internal-product/hooks/use-update-conversion-unit.ts` | Same pattern (`unitId` arg already correctly `Int!`, left untouched). |
| `src/features/inventory-catalog/internal-product/hooks/use-delete-conversion-unit.ts` | Same pattern (`unitId` untouched). |
| `src/features/inventory-catalog/internal-product/hooks/use-add-attachment.ts` | `$id: ID!` → `$id: Int!` (input-type fix tracked under BUG-W03-023, same file). |
| `src/features/inventory-catalog/internal-product/hooks/use-delete-attachment.ts` | Same pattern (`attachmentId` already correctly `Int!`, left untouched). |

## 4. Ground truth verification (rule W-R10)

Verified directly against BFF schema source file `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` (priority #1 per W-R10), not the summary table in the contract doc:

```
getMaterialGroup(id: Int!): MaterialGroupResponse!
updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!): MaterialGroupResponse!
deleteMaterialGroup(id: Int!): DeleteResponse!
getInternalProduct(id: Int!): InternalProductResponse!
updateInternalProduct(id: Int!, input: UpdateInternalProductInput!): InternalProductResponse!
deleteInternalProduct(id: Int!): DeleteResponse!
mapSkuToInternalProduct(id: Int!, productId: Int!): InternalProductSkuMappingResponse!
unmapSkuFromInternalProduct(id: Int!, productId: Int!): DeleteResponse!
addConversionUnit(id: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!
updateConversionUnit(id: Int!, unitId: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!
deleteConversionUnit(id: Int!, unitId: Int!): DeleteResponse!
addInternalProductAttachment(id: Int!, input: AttachmentMetadataInput!): InternalProductAttachmentResponse!
deleteInternalProductAttachment(id: Int!, attachmentId: Int!): DeleteResponse!
```

All 12 operations confirmed `id: Int!`; `unitId`/`attachmentId`/`productId` confirmed `Int!` (already correct in FE, untouched).

## 5. Regression / verification

- `npx tsc -b` — pass, 0 errors.
- `npx eslint src/features/inventory-catalog/` — pass, 0 errors/warnings.
- `npm run build` — pass (exit 0); pre-existing unrelated chunk-size warnings only.
- New regression test: `src/features/inventory-catalog/shared/__tests__/graphql-sdl-fidelity.test.ts` — parses every `gql` document via the `graphql` package and asserts `variableDefinitions` match the SDL ground truth for all 12 id-bearing operations + the untouched `unitId`/`attachmentId`/`productId` args.
- `vitest run` (repo-wide) currently fails at the test-environment layer — `html-encoding-sniffer` (jsdom dependency) throws `ERR_REQUIRE_ESM` on `@exodus/bytes` — reproducible on a pre-existing, previously-passing test file (`material-group.schema.test.ts`) with zero code changes involved, and also fails under `--environment=node` because the global `src/test/setup.ts` imports the CometChat SDK which requires `window`. This is a pre-existing `node_modules` dependency-resolution issue unrelated to this fix (out of scope to fix per FIX mandate — no source code involved). Test logic was independently verified correct via a standalone Node script driving `graphql.parse`/`print` directly (bypassing the broken vitest/jsdom harness): all 17 spot-checked operations (12 from this bug + 5 additional) passed.

## 6. Non-goals / out of scope

- The `showToast` option addition observed in `use-update-material-group.ts` and the `unitId`/`attachmentId`/`productId`-already-correct args were not touched beyond the scoped `$id` fix.
- Repo-wide `vitest`/jsdom environment breakage — flagged, not fixed (unrelated dependency issue, would require `node_modules`/lockfile changes outside FIX scope).

## 7. Follow-up

- TEST cycle: once the `vitest`/jsdom environment issue is resolved (separate infra ticket), re-run `npm test` to get a green CI signal for the new `graphql-sdl-fidelity.test.ts` suite.

## 8. Follow-up fix (ad-hoc, same session, NOT a new tracked bug)

**Scope**: All 22 catalog-v2 GraphQL hooks (the 17 covered by BUG-W03-022/023 + the 5 spot-checked-clean ops: `use-create-material-group.ts`, `use-create-internal-product.ts`, `use-search-skus.ts`, `use-list-units.ts`, and the previously-correct `productId`/`unitId`/`attachmentId` args) used the WRONG inline-fragment type condition (`... on <Type>`) for their success-response branch — same root-cause class as BUG-W03-022/023 (naming heuristic instead of reading real SDL, rule W-R10), discovered on independent orchestrator-verified re-audit after 022/023 closed.

**Root cause**: `generateMultipleResponseTypes()` (`agg-garage-graph/src/graphql/common/response.generator.ts`, config array at `inventory-catalog.schema.ts:13-104`) produces concrete response type names as `{dataType}ApiResponse` (single) or an explicit `Paged{X}ApiResponse` (paged) — e.g. `MaterialGroupApiResponse`, `PagedMaterialGroupApiResponse`, `DeleteApiResponse`. Every FE hook instead used an `ApiResponse{X}Response` heuristic (e.g. `ApiResponseMaterialGroupResponse`, `PagedApiResponseMaterialGroupResponse`) that does not exist anywhere in the BFF schema.

**Fix**: Renamed the inline-fragment type condition in all 22 `gql` documents to the real generated type name, verified individually against the config array + Query/Mutation return-type union member for each operation (notably the M14/M15 swap trap: `verifyImportInternalProducts` → `ImportInternalProductsReportApiResponse`, `importInternalProducts` → `ImportInternalProductsResultApiResponse` — these are distinct data shapes, not interchangeable). `ErrorResponse` fragment left untouched in all 22 files (confirmed real, defined in `base.schema.ts`, unchanged shape). Field selections inside each renamed fragment were verified unaffected (the wrapper rename doesn't change the underlying `data` type or its fields) — though this verification surfaced several **pre-existing, separate, unfixed** field-selection mismatches noted below.

Files changed (22, all under `src/features/inventory-catalog/{material-group,internal-product}/hooks/`): `use-search-material-groups.ts`, `use-get-material-group.ts`, `use-create-material-group.ts`, `use-update-material-group.ts`, `use-delete-material-group.ts`, `use-search-internal-products.ts`, `use-get-internal-product.ts`, `use-create-internal-product.ts`, `use-update-internal-product.ts`, `use-delete-internal-product.ts`, `use-map-sku.ts`, `use-unmap-sku.ts`, `use-add-conversion-unit.ts`, `use-update-conversion-unit.ts`, `use-delete-conversion-unit.ts`, `use-add-attachment.ts`, `use-delete-attachment.ts`, `use-verify-import-internal-product.ts`, `use-import-internal-products.ts`, `use-export-internal-products.ts`, `use-search-skus.ts`, `use-list-units.ts`.

**Regression test**: extended `src/features/inventory-catalog/shared/__tests__/graphql-sdl-fidelity.test.ts` with a new `describe` block asserting all 22 operations' inline-fragment type conditions against ground truth, a dedicated M14≠M15 distinctness check, an `ErrorResponse`-branch-present sanity check per operation, and a count guard (`toHaveLength(22)`) to catch future silently-dropped/added operations. Verified independently via standalone Node script (same jsdom/vitest environment caveat as §5 above) — 22/22 pass.

**Verification**: `npx tsc -b` pass, `npx eslint src/features/inventory-catalog/` pass, `npm run build` pass (exit 0). Same pre-existing `vitest`/jsdom `ERR_REQUIRE_ESM` environment issue as §5 (unrelated, not fixed here).

**Newly-surfaced, still out-of-scope field-selection mismatches** (found while verifying step 3 "field selections still valid post-rename", NOT fixed — rename-only task, and these change response *shape* expectations, not just a document-level type name):
- `ImportInternalProductsReport` (verify) real shape is `{ summary: ImportSummary!, validRows: [ImportRow!]!, errorRows: [ImportRow!]! }` — FE selects `{ products[], totalValid, totalInvalid }`, which doesn't exist on this type at all.
- `ImportInternalProductsResult` (commit) real shape is `{ importId, importedCount, failedCount, report: ImportInternalProductsReport! }` — FE selects `{ successCount, errorCount, updateCount, errors[] }`, none of which exist on this type.
- `ExportFileUrlData` real shape is `{ downloadUrl: String! }` only — FE also selects `fileName`, `totalRows`, neither of which exist.
- `UnitListData` real shape is `{ items: [Unit!]! }` — FE selects `data { code, name }` directly (flattened), missing the `items` wrapper.
- `InternalProduct`/nested `InternalProductConversionUnit` FE selection includes `hasTransactions`, not present in the SDL type (noted previously in BUG-W03-023-bugfix.md §6).

These are all **response-shape / field-selection bugs**, a different failure class from "wrong type condition name" (this fix) or "wrong input type name" (BUG-W03-023) — recommended as new bug ticket(s) for a future review/fix pass, not filed here per instruction not to add new `BUG-W03-0XX` tracker rows this cycle.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-web | Fix — `$id: ID!` → `$id: Int!` across 12 GraphQL hook documents (material-group + internal-product); regression test added; build/lint verified pass. |
| 2026-07-01 | 2 | agent-fix-garage-web | Ad-hoc follow-up (§8) — fixed wrong inline-fragment type condition on all 22 catalog-v2 hooks (`... on ApiResponse{X}Response` → real `{X}ApiResponse`/`Paged{X}ApiResponse`); extended regression test; documented newly-surfaced field-selection mismatches as out-of-scope follow-ups (no new BUGS.md row per orchestrator instruction). |
