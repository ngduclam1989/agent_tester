# BUGFIX — BUG-W03-116

> `mainUnitDisplayName` + `originDisplayName` luôn null trên Danh sách / Chi tiết sản phẩm (R18 enrichment chưa impl)
> Severity: **P2** · Boundary: `gf-inventory` · Status: **RESOLVED** · Date: 2026-07-03

## 1. Summary

`InternalProductSummaryResponse` (V2-7 search) + `InternalProductDetailResponse` (V2-8 get) chưa expose 2 field enrichment `mainUnitDisplayName` (Tên ĐVT chính) + `originDisplayName` (Tên xuất xứ) — BE trả `null`, GraphQL passthrough xuống UI hiển thị raw code (`UNIT_CAI`, `US`) thay vì tên tiếng Việt (`cái`, `Hoa Kỳ`). BFF `agg-garage-graph` đã declare 2 field này trong `inventory-catalog.schema.ts` + `InternalProductResponse` type (passthrough) — thiếu duy nhất ở BE producer side.

Cùng nhóm enrichment `materialGroupName` đã hoạt động OK vì nó enrich từ local table (`material_group`) qua join JPA — không cần gọi master gf-erp-mdm; `mainUnit` + `origin` cần lookup catalog directory `UNIT` + `COUNTRY` từ `gf-erp-mdm` mà chưa được viết.

## 2. Root cause (Why-chain)

1. UI hiển thị raw code → GraphQL trả `null` cho 2 field display name.
2. BFF `agg-garage-graph` là passthrough (`gfInventoryService.get/post`) — chỉ forward whatever BE returns; schema đã khai `mainUnitDisplayName: String` + `originDisplayName: String` nullable.
3. BE `InternalProductSummaryResponse` + `InternalProductDetailResponse` KHÔNG có 2 field này → GraphQL marshaller resolve từ property không tồn tại → `null`.
4. `InternalProductService.toSummary` + `.get(id)` chỉ populate `materialGroupName` (local table join), chưa gọi master lookup cho unit/origin.
5. `CatalogMdmValidationService` đã có cache `UNIT` + `COUNTRY` directory (5-min in-process, ADR-018) — nhưng chỉ expose `isValidUnitCode` / `isValidOriginCode` (Set of codes, write path), chưa expose `code → name` map (read/display path).

Root cause = **R18 display-name enrichment thiếu ở BE tier (`InternalProductService` + DTO + `CatalogMdmValidationService`)**. Không phải BFF bug — BFF đã ready.

## 3. Fix

**Minimum-scope**: reuse cache có sẵn của `CatalogMdmValidationService`, đổi từ `Set<String>` sang `Map<String, String> (code → displayName)` để cùng 1 cache phục vụ cả validation (containsKey) lẫn display (get). Thêm 2 fail-open lookup method (`getUnitDisplayName`, `getOriginDisplayName`) — catch `CatalogException` từ cold-cache + mdm-unavailable → trả `null` (list/detail render KHÔNG được vỡ khi master briefly down).

**Populate**: `InternalProductService.toSummary` + `.get(id)` gọi 2 lookup, populate 2 field mới trong DTO. Cache reuse → O(1) per row sau warm-up, không thêm N+1 REST call cho search page (đúng BR-CAT-PROD-024 perf budget).

Fail-open on display path là intentional distinction so với validation path (fail-closed) — reason đã document trong Javadoc `CatalogMdmValidationService`.

## 4. Files changed

| File | Change |
|---|---|
| `services/gf-inventory/src/main/java/com/actechx/gf/app/service/catalog/CatalogMdmValidationService.java` | Cache `Set<String>` → `Map<String, String>` (`code → displayName`); `containsKey()` thay `contains()`; thêm 2 method public `getUnitDisplayName(code)` + `getOriginDisplayName(code)` fail-open (return `null` khi cache cold + MDM unavailable HOẶC code không tồn tại). |
| `services/gf-inventory/src/main/java/com/actechx/gf/app/dto/catalog/CatalogDtos.java` | Thêm field `mainUnitDisplayName` + `originDisplayName` vào `InternalProductSummaryResponse` + `InternalProductDetailResponse` (position: ngay sau `mainUnitCode` / `originCode` tương ứng). |
| `services/gf-inventory/src/main/java/com/actechx/gf/app/service/catalog/InternalProductService.java` | `toSummary()` + `get(id)` builder thêm `.mainUnitDisplayName(mdmValidationService.getUnitDisplayName(...))` + `.originDisplayName(mdmValidationService.getOriginDisplayName(...))`. |
| `services/gf-inventory/src/test/java/com/actechx/gf/app/service/catalog/InternalProductServiceTest.java` | **New: 4 regression test** — `get_populatesUnitAndOriginDisplayNames_fromMdmDirectories`, `get_leavesOriginDisplayNameNull_whenOriginCodeMissing`, `search_populatesUnitAndOriginDisplayNames_forEveryRow`, `search_leavesDisplayNamesNull_whenMdmLookupReturnsNull` (fail-open contract). |

## 5. Blast radius

- **API contract**: additive — 2 field nullable mới trong response. Client cũ ignore field mới. BFF schema đã ready (không sync BFF).
- **Existing tests**: PASS unchanged — legacy `productEntity(id, mainUnitCode)` không set `originCode`, mock `mdmValidationService` mặc định trả `null` → display names null trong summary/detail cũ, không assert những field này.
- **Cache change**: `Set<String>` → `Map<String, String>` chỉ nội bộ `CatalogMdmValidationService`, không leak ra ngoài. Validation semantics giữ nguyên (`isValid*` chỉ đổi `contains` → `containsKey`).
- **Cross-boundary**: KHÔNG — BFF passthrough đã có sẵn field trong schema + TypeScript type; auto-flow sau khi BE deploy.
- **Migration**: KHÔNG cần V{N+1} — chỉ đổi DTO + service layer, không đổi entity/table.
- **Outbox / Kafka / Temporal**: KHÔNG chạm.
- **Perf**: search list 100 rows → 100 × O(1) map.get() sau cache warm — không thêm REST call ngoài trigger warm cache 1 lần/5 phút/tenant-agnostic directory.

## 6. Regression / verification

- 4 unit test mới trong `InternalProductServiceTest` — FAIL trước fix (DTO không có field), PASS sau fix. Cover 4 branch: happy (get/search), null-safe originCode, fail-open null từ MDM.
- `./gradlew build` → **BUILD SUCCESSFUL** (compile + spotless + test + jar).
- `./gradlew spotlessCheck` → PASS sau `spotlessApply`.
- `./gradlew test --tests InternalProductServiceTest` → PASS toàn bộ test suite (bao gồm 4 test mới + tất cả test cũ giữ nguyên assertion).
- Manual verify (QC responsibility, ngoài scope FIX): query `getInternalProduct(id).mainUnitDisplayName == "cái"` + `originDisplayName == "Hoa Kỳ"` với product có `mainUnitCode=UNIT_CAI` + `originCode=US`, master gf-erp-mdm healthy.

## 7. Non-goals / out of scope

- KHÔNG đổi API path / method / status code / error envelope — additive-only theo ADR-018 R28.
- KHÔNG refactor `InventoryDocPrintService.resolveUnitNames` (print path riêng biệt — có cache riêng, fail semantics riêng — CatalogMdmValidationService Javadoc đã note distinction).
- KHÔNG modify `InternalProductExportService.fetchDirectoryNames` (export path đã document "Isolated" trong Javadoc — thay đổi export scope ngoài phạm vi bug này).
- KHÔNG chạm agg-garage-graph BFF — schema đã ready + đã declare field, passthrough auto-flow.
- KHÔNG update knowledge-graph.yaml — enrichment 2 field response DTO thuần projection detail, không thay đổi entity / event / permission / BR đã document. `BR-CAT-PROD-024` (perf budget cache 5min) đã cover pattern này (không cần rule mới).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-03 | 1 | agent-fix-gf-inventory | Fix R18 display-name enrichment cho `mainUnitDisplayName` + `originDisplayName` trên `InternalProductSummaryResponse` + `InternalProductDetailResponse`. Extend `CatalogMdmValidationService` cache `Set<String>` → `Map<String, String>` (code → name) + 2 fail-open lookup method mới. 4 regression test mới. `./gradlew build` PASS. |
