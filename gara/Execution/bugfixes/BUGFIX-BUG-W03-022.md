# BUGFIX — BUG-W03-022

> GraphQL variable `$id` khai `ID!` — BFF schema yêu cầu `Int!` (12/22 catalog-v2 operations)
> Severity: **P1** · Boundary: `garage-web` · Status: **RESOLVED** · Date: 2026-07-01

## 1. Summary

12 `gql` document literal trong `src/features/inventory-catalog/{material-group,internal-product}/hooks/*.ts` khai `$id: ID!` cho argument `id` của operation `getMaterialGroup`, `updateMaterialGroup`, `deleteMaterialGroup`, `getInternalProduct`, `updateInternalProduct`, `deleteInternalProduct`, `mapSkuToInternalProduct`, `unmapSkuFromInternalProduct`, `addConversionUnit`, `updateConversionUnit`, `deleteConversionUnit`, `addInternalProductAttachment`, `deleteInternalProductAttachment` — trong khi BFF schema thật (`agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts`) khai TẤT CẢ arg `id`/`unitId`/`attachmentId` liên quan bằng `Int!`. GraphQL variable-usage validation (named type `ID` ≠ `Int`, Apollo Server không tự coerce) → request bị reject ở tầng document-validation TRƯỚC KHI resolver chạy (`Variable "$id" of type "ID!" used in position expecting type "Int!"`, HTTP 400) — không phải lỗi data.

## 2. Root cause

FE dev agent áp dụng heuristic GraphQL phổ biến "dùng scalar `ID` cho mọi entity identifier" khi viết `gql` document, thay vì đọc SDL thật (`extend type Query`/`extend type Mutation` argument list) trong BFF schema source hoặc contract doc §3d.1 SDL block trước khi khai variable type. Đây là type-signature drift ở tầng document literal — operation name + field selection đều đúng, chỉ scalar type của argument `id` sai.

## 3. Ground truth verification (rule W-R10)

Đọc trực tiếp `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` (nguồn ưu tiên #1 theo `rules-web` §12 W-R10) — xác nhận toàn bộ 12 operation:

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

Khớp `Architecture/api/agg-garage-graph-graphql.md` §3d.2 operation summary (V2-Q3/Q5, V2-M2/3/5/6/7/8/9/10/11/12/13 đều `id: Int!`). `productId`/`unitId`/`attachmentId` args đã đúng `Int!` từ đầu — KHÔNG cần sửa.

## 4. Files changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/inventory-catalog/material-group/hooks/use-get-material-group.ts` | `$id: ID!` → `$id: Int!`; TS variables `{ id: string }` → `{ id: number }`; `variables: { id: String(id ?? "") }` → `{ id: Number(id ?? 0) }` |
| `frontend/gf-gms-web/src/features/inventory-catalog/material-group/hooks/use-update-material-group.ts` | `$id: ID!` → `$id: Int!`; TS variables `{ id: string; input }` → `{ id: number; input }`; `execute` call-site `String(id)` → `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/material-group/hooks/use-delete-material-group.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number }`; call-site `String(id)` → `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-get-internal-product.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number }`; `variables: { id: Number(id ?? 0) }` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-update-internal-product.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number; input }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-delete-internal-product.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-map-sku.ts` | `$id: ID!` → `$id: Int!` (giữ nguyên `$productId: Int!` — đã đúng); TS variables → `{ id: number; productId: number }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-unmap-sku.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number; productId: number }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-add-conversion-unit.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number; input }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-update-conversion-unit.ts` | `$id: ID!` → `$id: Int!` (giữ `$unitId: Int!`); TS variables → `{ id: number; unitId: number; input }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-delete-conversion-unit.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number; unitId: number }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-add-attachment.ts` | `$id: ID!` → `$id: Int!` (cùng batch với BUG-W03-023 input type fix trong file này); TS variables → `{ id: number; input: AttachmentInput }`; call-site `Number(id)` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-delete-attachment.ts` | `$id: ID!` → `$id: Int!`; TS variables → `{ id: number; attachmentId: number }`; call-site `Number(id)` |

**Rationale cho việc sửa cả TS variable type + runtime call-site (không chỉ gql literal)**: `src/hooks/use-mutation.ts`/`use-query.ts` truyền `TVariables` thẳng vào Apollo `useMutation`/`useQuery` không qua transform layer nào — nếu chỉ đổi `$id: ID!` → `$id: Int!` trong gql mà giữ nguyên `String(id)` ở call-site, GraphQL sẽ nhận 1 JS string value cho scalar `Int!` → vẫn reject ở tầng coercion. Phải đổi đồng bộ cả 3 lớp (gql scalar + TS type + runtime value) để fix thực sự hoạt động.

## 5. Regression / verification

- `cd frontend/gf-gms-web && npx tsc -b --noEmit` → **pass**, 0 lỗi.
- `npm run build` (`tsc -b && vite build`) → **pass**, build thành công (chỉ có warning pre-existing về chunk size, không liên quan).
- `npm run lint` scoped `src/features/inventory-catalog/{material-group,internal-product}/hooks` → **pass**, 0 lỗi/warning trong 2 thư mục này (full-repo lint có lỗi pre-existing ở các feature khác — `voucher-programs`, `quotation-requests`, `comet-layout` — không liên quan tới fix này).
- `npx vitest run src/features/inventory-catalog` → môi trường test-runner có lỗi tiền tồn tại (`html-encoding-sniffer` ESM/CJS `ERR_REQUIRE_ESM`), xảy ra trên MỌI folder có test file trong repo (đã verify tương tự lỗi khi chạy `src/features/purchase-orders`), không phải regression từ fix này. Không có unit test hiện hữu dưới `hooks/` cho 12 file đã sửa (0 file `*.test.ts` match) — regression guard cho fix này là SDL ground-truth cross-check (§3) chứ không phải test tự động.
- Grep xác nhận 0 occurrence còn lại của `$id: ID!`/`{ id: string` trong toàn bộ `src/features/inventory-catalog/**`.

## 6. Non-goals / out of scope

- Field-selection shape mismatch trong `use-get-internal-product.ts` (`hasTransactions` field không có trong SDL `InternalProduct`/`InternalProductConversionUnit`) — không phải scope bug này (chỉ về argument scalar type), ghi nhận follow-up.
- 5 operation input-type-name sai — xem `BUGFIX-BUG-W03-023.md` (bug riêng, batch cùng cycle).
- `getMaterialGroupTree` (V2-Q2) chưa có FE hook tương ứng — coverage gap, không phải regression từ fix này, ngoài phạm vi 2 bug.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-web | Initial fix — 12 file `$id: ID!` → `$id: Int!` đồng bộ 3 lớp (gql scalar + TS variable type + runtime call-site). Verify ground truth trực tiếp BFF schema source per rule W-R10. `tsc -b` + `build` + scoped `lint` pass. |
