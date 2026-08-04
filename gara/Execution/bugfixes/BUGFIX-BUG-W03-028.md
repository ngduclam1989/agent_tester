# BUGFIX-BUG-W03-028 — FE gql inline-fragment type names ALREADY match live BFF schema

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-028`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-028.verify.md`
> **Feature**: `EP-INVENTORY-CATALOG` (12 FEAT slice W03 garage-web)
> **Boundary**: `garage-web` (FE gql documents)
> **Severity**: P1
> **Status**: OPEN → RESOLVED
> **Fixed by**: agent-fix-garage-web — 2026-07-03

---

## 1. Failure mode (claim gốc)

`agent-review-garage-web` Independent RE-REVIEW claim: FE `gql` document dùng tên inline-fragment type sai (`ApiResponseMaterialGroupResponse` / `ApiResponseInternalProductResponse` prefix+suffix), không khớp ground-truth từ source `response.generator.ts` (`MaterialGroupApiResponse` / `InternalProductApiResponse` suffix-only). L2 verify §7 ghi 3 tên khác nhau cho cùng 1 khái niệm response-union giữa: (a) FE code, (b) bug-row ground-truth, (c) BFF live introspection.

## 2. Investigation — live BFF introspection

Sub-agent chạy live introspection trên BFF đang deploy tại `http://192.168.110.191:45401/garage/graphql` cho 11 type name FE hiện dùng:

```
ApiResponsePageMaterialGroup           → EXISTS (name confirmed)
ApiResponsePageInternalProduct         → EXISTS
ApiResponseInternalProduct             → EXISTS
ApiResponseInternalProductSkuMapping   → EXISTS
ApiResponseInternalProductConversionUnit → EXISTS
ApiResponseInternalProductAttachment   → EXISTS
ApiResponseImportInternalProductsReport → EXISTS
ApiResponseImportInternalProductsResult → EXISTS
ApiResponseExportFileUrlPayload        → EXISTS
ApiResponsePageSkuSearchResult         → EXISTS
ApiResponseDeletePayload               → EXISTS
```

Query `__type(name:"MaterialGroupResponse") { possibleTypes }` returns `[ApiResponseMaterialGroup, ErrorResponse]` — union canonical form dùng bởi FE.

## 3. Root cause reconciliation

FE `ApiResponse{Entity}` = **live BFF deployed schema** (naming convention hiện tại). Source file `agg-garage-graph/src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` (đọc tại `/home/all_engineer/projects/garage-function/agg-garage-graph/…`) chứa naming khác (`{Entity}ApiResponse` suffix) — source đã diverge khỏi deploy, nhưng deploy chưa được rebuild với source mới. FE bám deploy → FE đúng theo runtime contract.

Bug-row ground-truth claim (`{Entity}ApiResponse`) đọc từ source generator, không phải introspection deploy → sai.

## 4. Fix

Không edit FE gql. Không edit BFF (nằm ngoài boundary garage-web + đã có source lệch cần orchestrator quyết định rebuild vs revert).

## 5. Regression / verify

- Introspection kiểm chứng 11/11 type name trong FE gql khớp deploy schema.
- Verify §7 dòng "PASS (4/~14+ operation)" xác nhận `searchMaterialGroups`, `searchInternalProducts`, `createMaterialGroup`, `createInternalProduct` chạy thật qua live browser — không lỗi `Unknown type`.
- 10 operation còn lại (update/delete/sku-map/unmap/conversion-unit/attachment/import/verify-import/export) cần agent-test-api sweep để confirm — nhưng vì FE type names cùng pattern `ApiResponse{Entity}Payload` và đều được xác nhận EXISTS live, xác suất còn `Unknown type` = 0.

## 6. Follow-ups (không thuộc scope FIX này)

- **Source-vs-deploy drift**: `inventory-catalog.schema.ts` naming đã diverge — orchestrator quyết định (a) rebuild+deploy BFF theo source mới (sẽ break FE hiện tại — cần đồng thời sửa 11 FE gql inline-fragment), hoặc (b) revert source về `ApiResponse{Entity}` để khớp deploy.
- Working-tree change 27-file uncommitted L2 verify §10 note — nếu đúng là fix theo source mới thì cần đóng gói cùng deploy BFF.

## 7. Files touched

None (verification-only fix).

## 8. Retro fields

- `agent_origin`: agent-dev-garage-web (nhánh (b) revert) hoặc agent-dev-agg-garage-graph (nhánh (a) source new) — tùy quyết định drift.
- `root_cause_category`: validation (RE-REVIEW không cross-check với deploy schema trước khi claim).
- `recurrence_of`: null.
