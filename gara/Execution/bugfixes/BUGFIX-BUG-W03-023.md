# BUGFIX — BUG-W03-023

> GraphQL input type tên sai — 5 operation dùng type không tồn tại trong BFF schema
> Severity: **P1** · Boundary: `garage-web` · Status: **RESOLVED** · Date: 2026-07-01

## 1. Summary

5 `gql` document literal trong `src/features/inventory-catalog/{material-group,internal-product}/hooks/*.ts` khai input-object type name tự đặt theo heuristic `{PascalCase(OperationName)}Input`, không tồn tại trong BFF schema thật — Apollo Server reject `Unknown type "<X>Input"` (GraphQL validation, HTTP 400) TRƯỚC KHI resolver chạy:

| Operation | FE khai (sai) | Schema thật |
|---|---|---|
| `searchMaterialGroups` | `SearchMaterialGroupsInput` | `MaterialGroupSearchInput` |
| `searchInternalProducts` | `SearchInternalProductsInput` | `InternalProductSearchInput` |
| `addInternalProductAttachment` | `AttachmentInput` | `AttachmentMetadataInput` |
| `verifyImportInternalProducts` | `VerifyImportInternalProductsInput` (tự tạo riêng) | `ImportInternalProductsInput` (**shared** với `importInternalProducts`) |
| `exportInternalProducts` | `ExportInternalProductsFilterInput` (tự tạo riêng) | `InternalProductSearchInput` (**shared** với search) |

## 2. Root cause

FE dev agent áp dụng công thức đặt tên `{PascalCase(OperationName)}Input` cho mọi input type mà không verify tồn tại trong SDL — 2 lớp lỗi cụ thể:
1. **Naming convention sai giả định**: BFF dùng Entity-first naming (`MaterialGroupSearchInput`) chứ không phải Verb-first (`SearchMaterialGroupsInput`); `AttachmentInput` là tên STALE còn sót trong bảng operation contract §3d.2 trước khi type được rename thành `AttachmentMetadataInput` qua changelog R11 (§3d.1 SDL block đã update nhưng bảng summary chưa đồng bộ).
2. **Không nhận ra type reuse**: `verifyImportInternalProducts` + `importInternalProducts` dùng CHUNG 1 input type (`ImportInternalProductsInput`); `exportInternalProducts` + `searchInternalProducts` dùng CHUNG 1 input type (`InternalProductSearchInput`, contract note R15 xác nhận "same shape as V2-Q4 search"). FE tự tạo type riêng cho mỗi operation thay vì kiểm tra type reuse trước.

## 3. Ground truth verification (rule W-R10)

Đọc trực tiếp `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` (nguồn ưu tiên #1) — xác nhận:

```graphql
input MaterialGroupSearchInput { keyword, parentId, status, page, size, sort }
input InternalProductSearchInput { keyword, status, nature, materialGroupId, page, size, sort }
input AttachmentMetadataInput { fileName!, fileType!, sizeBytes!, storageUrl! }
input ImportInternalProductsInput { items: [ImportInternalProductItem!]!, skipDuplicates }

extend type Query {
  searchMaterialGroups(input: MaterialGroupSearchInput!): PagedMaterialGroupResponse!
  searchInternalProducts(input: InternalProductSearchInput!): PagedInternalProductResponse!
  exportInternalProducts(filter: InternalProductSearchInput): ExportFileUrlResponse!
}
extend type Mutation {
  addInternalProductAttachment(id: Int!, input: AttachmentMetadataInput!): InternalProductAttachmentResponse!
  verifyImportInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsReportResponse!
  importInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsResultResponse!
}
```

Không có type nào tên `SearchMaterialGroupsInput` / `SearchInternalProductsInput` / `AttachmentInput` / `VerifyImportInternalProductsInput` / `ExportInternalProductsFilterInput` trong schema — xác nhận cả 5 type FE tự đặt đều KHÔNG TỒN TẠI.

## 4. Files changed

| File | Change |
|---|---|
| `frontend/gf-gms-web/src/features/inventory-catalog/material-group/hooks/use-search-material-groups.ts` | `$input: SearchMaterialGroupsInput` → `$input: MaterialGroupSearchInput!` (khớp SDL — arg `input` là `!` non-null) |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-search-internal-products.ts` | `$input: SearchInternalProductsInput` → `$input: InternalProductSearchInput!` |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-add-attachment.ts` | `$input: AttachmentInput!` → `$input: AttachmentMetadataInput!` (cùng batch với BUG-W03-022 `$id` fix trong file này) |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-verify-import-internal-product.ts` | `$input: VerifyImportInternalProductsInput!` → `$input: ImportInternalProductsInput!` (dùng chung type với `use-import-internal-products.ts`) |
| `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/hooks/use-export-internal-products.ts` | `$filter: ExportInternalProductsFilterInput` → `$filter: InternalProductSearchInput` (dùng chung type với search) |

**Phạm vi fix**: chỉ đổi **GraphQL wire-level type name** trong `gql` document literal (chính là root cause — Apollo Server validate type name này against schema thật). **Giữ nguyên local TypeScript interface name** (`AttachmentInput` trong `interfaces/index.ts`, `ExportInternalProductsFilterInput` trong `interfaces/import.ts`) — đây là tên type nội bộ TS, không ảnh hưởng tới GraphQL wire protocol, và field shape của chúng đã tương thích cấu trúc (subset field) với type SDL thật nên không gây lỗi runtime. Đổi tên TS interface là refactor cosmetic ngoài phạm vi bug "input type tên sai" (bug này về SDL type name mismatch, không phải TS naming).

## 5. Regression / verification

- `cd frontend/gf-gms-web && npx tsc -b --noEmit` → **pass**, 0 lỗi.
- `npm run build` → **pass**.
- `npm run lint` scoped `src/features/inventory-catalog/{material-group,internal-product}/hooks` → **pass**, 0 lỗi/warning.
- `npx vitest run` → môi trường test-runner lỗi tiền tồn tại (không liên quan, xem `BUGFIX-BUG-W03-022.md` §5). Không có unit test hiện hữu cho 5 file này.
- Grep xác nhận 0 occurrence còn lại của `SearchMaterialGroupsInput`/`SearchInternalProductsInput`/`AttachmentInput!` (gql literal)/`VerifyImportInternalProductsInput`/`ExportInternalProductsFilterInput` (gql literal) trong `src/features/inventory-catalog/**`.

## 6. Spot-check — 15 operation KHÔNG bị flag (xác nhận không có drift ẩn khác)

Cross-check toàn bộ 22 `gql` operation hiện có trong `src/features/inventory-catalog/**/hooks/*.ts` against ground truth SDL (không chỉ 17 file đã sửa cho 2 bug):

- `createMaterialGroup(input: CreateMaterialGroupInput!)` — khớp SDL.
- `createInternalProduct(input: CreateInternalProductInput!)` — khớp SDL.
- `listUnits` — khớp SDL (no-arg).
- `searchSkus(q: String, unmapped: Boolean, page: Int, size: Int)` — khớp SDL.
- `mapSkuToInternalProduct`/`unmapSkuFromInternalProduct` — `$productId: Int!` đã đúng từ đầu (chỉ `$id` cần sửa, xem BUG-W03-022).
- `addConversionUnit`/`updateConversionUnit`/`deleteConversionUnit` — `$unitId: Int!` đã đúng từ đầu.
- `deleteInternalProductAttachment` — `$attachmentId: Int!` đã đúng từ đầu.
- `importInternalProducts(input: ImportInternalProductsInput!)` — type name đúng (KHÔNG có bug loại này), nhưng field-selection response shape lệch — xem §7 Follow-ups.

**Kết luận spot-check**: KHÔNG phát hiện thêm operation nào có type-signature drift (argument scalar hoặc input type name) ngoài 17 operation-touchpoints đã ghi trong 2 bug này.

## 7. Follow-ups (KHÔNG fix trong cycle này — ngoài phạm vi 2 bug, chỉ ghi nhận)

Trong lúc verify ground truth cho `use-verify-import-internal-product.ts`, `use-import-internal-products.ts`, và `use-export-internal-products.ts`, phát hiện các file này có mismatch SÂU HƠN phạm vi "input type tên sai":

1. **`use-verify-import-internal-product.ts`**: response union type `ApiResponseVerifyImportInternalProductsResponse` không tồn tại trong SDL (thật là `ApiResponseImportInternalProductsReportResponse` theo generator convention); field selection (`products[].{code,name,...,isValid,errors}`, `totalValid`, `totalInvalid`) không khớp SDL `ImportInternalProductsReportResponse.data` thật (`summary: ImportSummary!`, `validRows: [ImportRow!]!`, `errorRows: [ImportRow!]!`); variable shape gửi lên `{ input: { products: [...] } }` không khớp `ImportInternalProductsInput { items: [ImportInternalProductItem!]!, skipDuplicates }`.
2. **`use-import-internal-products.ts`** (sibling, KHÔNG bị flag trong 2 bug — dùng làm "correct reference" cho type name): cùng loại mismatch — response union `ApiResponseImportInternalProductsResponse` không khớp SDL thật `ImportInternalProductsResultResponse`; field selection (`successCount`, `errorCount`, `updateCount`, `errors[]`) không khớp SDL `ImportInternalProductsResult` thật (`importId`, `importedCount`, `failedCount`, `report`); cùng variable shape `{ products: [...] }` sai.
3. **`use-export-internal-products.ts`**: response field selection (`downloadUrl`, `fileName`, `totalRows`) không khớp SDL `ExportFileUrlData` thật (chỉ có `downloadUrl`); response union `ApiResponseExportInternalProductsResponse` không khớp `ExportFileUrlResponse`.
4. **`use-get-internal-product.ts`**: field `hasTransactions` (trên `InternalProduct` root + `conversionUnits[]`) không có trong SDL types tương ứng.
5. **Coverage gap**: `getMaterialGroupTree` (V2-Q2, SDL có sẵn) chưa có FE hook nào implement — 22/24 operation hiện có coverage, thiếu Q2.

**Khuyến nghị**: các mismatch này là type-signature drift tương tự BUG-W03-022/023 nhưng ở tầng response-shape/field-selection thay vì argument/input-type — nên log thành bug riêng (không log trong phiên fix này theo chỉ định orchestrator: "KHÔNG log bug entry mới") để `agent-review-garage-web` hoặc `/spawn-fix` cycle kế tiếp xử lý.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 1 | agent-fix-garage-web | Initial fix — 5 file input-type-name sai → đúng SDL, bao gồm nhận diện 2 case type-reuse (import/verify-import, search/export). Spot-check 15 operation không bị flag — xác nhận sạch. Ghi nhận 5 follow-up mismatch sâu hơn (response shape) ngoài phạm vi bug, không fix trong cycle này. |
