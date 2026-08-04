---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-30"
wave: "W03"
boundary: "gf-inventory"
checklist_source: "pkg-fallback"
---

# Implementation Checklist — W03 · gf-inventory

> Source: `PKG-W03-inventory-catalog.md` §4.1 + §5.1 (pkg-fallback — wave-spec status PARTIAL/DRAFT).
> Wave single-phase (5 boundary chạy song song, gate cuối Day 1 = GraphQL contract chốt).
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<path> · ac:<FEAT-AC> · review:<R*/D*>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/D* — shift-left).

- [x] T1 Flyway migration `V{N+1}__inventory_v2_catalog.sql` — 5 bảng additive (`material_group`, `internal_product`, `internal_product_sku_mapping`, `internal_product_conversion_unit`, `internal_product_attachment`) + unique index `(tenant_id, code)` · scope:`src/main/resources/db/migration/V*__inventory_v2_catalog.sql` · ac:`FEAT-CAT-GRP-CREATE-AC-1,FEAT-CAT-PROD-CREATE-AC-1` · review:`R10,R3`
- [x] T2 Domain entities + enums `ProductNature {GOODS, TOOL, SERVICE, OTHER}` (R8 D-B English) + `PricingMethod {PWA, SI, FIFO, MA}` (R13) — scalar FK only (ADR-009) · scope:`src/main/java/**/domain/model/{MaterialGroup,InternalProduct,InternalProductSkuMapping,InternalProductConversionUnit,InternalProductAttachment}.java`,`src/main/java/**/domain/enums/{ProductNature,PricingMethod}.java` · ac:`FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-PROD-CREATE-AC-1` · review:`R3,R4`
- [x] T3 JPA repositories scalar FK ADR-009 — KHÔNG `@ManyToOne`/`@OneToMany` cross-aggregate · scope:`src/main/java/**/domain/repository/*Repository.java` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R3,R4`
- [x] T4 Material Group V2-1 `POST /search` flat-grouped-by-parent ordering (R7) + V2-2 `GET /tree` với tree cap 1000 nodes defense → 413 `ERR-INV-027` (R3 F10) · scope:`src/main/java/**/adapter/controller/MaterialGroupController.java`,`src/main/java/**/app/service/MaterialGroupQueryService.java` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-GRP-LIST-AC-3` · review:`R1,R8,R14`
- [x] T5 Material Group V2-3 detail + V2-4 create (`ERR-INV-001`/`002`/`016`) + V2-5 update với circular check BFS (`ERR-INV-003`) + cascade INACTIVE 1 transaction recursive CTE (BR-CAT-GRP-007) · scope:`src/main/java/**/app/service/MaterialGroupCommandService.java` · ac:`FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-GRP-EDIT-AC-1,FEAT-CAT-GRP-DETAIL-AC-1` · review:`R4,R14`
- [x] T6 Material Group V2-6 delete guards (`ERR-INV-004`/`005`) — block khi còn product hoặc còn group con · scope:`src/main/java/**/app/service/MaterialGroupCommandService.java` · ac:`FEAT-CAT-GRP-DELETE-AC-1,FEAT-CAT-GRP-DELETE-AC-2` · review:`R4,R14`
- [x] T7 Internal Product V2-7 `POST /search` body input (R10) + 3-col keyword `code/name/SKU` + V2-8 detail · scope:`src/main/java/**/adapter/controller/InternalProductController.java`,`src/main/java/**/app/service/InternalProductQueryService.java` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-DETAIL-AC-1` · review:`R1,R8`
- [x] T8 Internal Product V2-10 create — validate `mainUnitCode` vs gf-erp-mdm `directory=UNIT` (R8 A) + `originCode` vs `directory=COUNTRY` (R18 NEW) + `nature` ∈ 4 English enum (R8 D-B) + `initialProductIds[]` (R9) + `imageUrl` opaque URL ≤500 chars (R25 OQ10, KHÔNG validate format/prefix, KHÔNG quản lý S3) + `brand` free-text VARCHAR(255) (R18 revert R8 D-C, KHÔNG validate catalog) · scope:`src/main/java/**/app/service/InternalProductCommandService.java` · ac:`FEAT-CAT-PROD-CREATE-AC-1,FEAT-CAT-PROD-CREATE-AC-2` · review:`R4,R14`
- [x] T9 Internal Product V2-11 update + immutability matrix (`mainUnitCode` immutable post-transaction) + V2-12 delete (`ERR-INV-008`) · scope:`src/main/java/**/app/service/InternalProductCommandService.java` · ac:`FEAT-CAT-PROD-EDIT-AC-1,FEAT-CAT-PROD-DELETE-AC-1` · review:`R4,R14`
- [x] T10 SKU mapping V2-13/V2-14 — body field + path arg `productId` per R9 (FK column = legacy `product.id`); unique global `ERR-INV-015` · scope:`src/main/java/**/adapter/controller/SkuMappingController.java`,`src/main/java/**/app/service/SkuMappingCommandService.java` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R3,R14`
- [x] T11 Conversion-unit V2-15/V2-16/V2-17 (R8 D-E rename path `/conversion-units` + field `unitCode` + table `internal_product_conversion_unit`) — rate > 0 `ERR-INV-013` + precision guard `BigDecimal.scale() ≤ 6` → `ERR-INV-047` (R29 BA 2026-06-26 BR-CAT-PROD-011 v15) qua `@ConversionRatePrecision` annotation hoặc service-layer check, áp dụng V2-10 initial + V2-15 add + V2-16 update; unique unit per product `ERR-INV-014`; immutable post-transaction; main-unit guard · scope:`src/main/java/**/adapter/controller/ConversionUnitController.java`,`src/main/java/**/app/service/ConversionUnitService.java`,`src/main/java/**/adapter/validation/ConversionRatePrecisionValidator.java` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R4,R14`
- [x] T12 Attachment V2-18/V2-19 metadata-only `AttachmentInput` (ADR-016 presigned URL pattern reuse, KHÔNG multipart direct); ≤ 5 file/product, ≤ 10MB, MIME PDF/JPG/PNG (`ERR-CMN-004`/`005`) · scope:`src/main/java/**/adapter/controller/AttachmentController.java`,`src/main/java/**/app/service/AttachmentService.java` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R4,R14`
- [x] T13 Import V2-20 verify + V2-21 commit — Apache POI parser .xlsx + R14 schema strict (KHÔNG `imageUrl/description/notes`) + cột "phương pháp tính giá" BỎ QUA (BR-CAT-PROD-017 v4) + verify-then-commit pattern + default `pricing_method=PWA` (R13) + `nature=GOODS` (R8 D-B) + trùng mark `ERR-INV-007` + skip · scope:`src/main/java/**/adapter/controller/InternalProductImportController.java`,`src/main/java/**/app/service/InternalProductImportService.java`,`src/main/java/**/adapter/parser/ExcelImportParser.java` · ac:`FEAT-CAT-PROD-IMPORT-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R4,R14`
- [x] T14 Import cap defense — `items.length ≤ 500` ADR-018 → `ERR-INV-041` (R28 canonical, drop `ERR-INV-019` legacy) + `originCode` invalid per-row → `ERR-INV-044` (R28 BR-CAT-PROD-023) · scope:`src/main/java/**/app/service/InternalProductImportService.java` · ac:`FEAT-CAT-PROD-IMPORT-AC-2` · review:`R14`
- [x] T15 Export V2-22 (R22 canonical 2026-06-25) — R15 GET→POST + body subset V2-7 + Option A single-call backend stream binary (Apache POI → 200 OK + `Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx"`) + 9 cột canonical = template import (KHÔNG audit fields) + skip `imageUrl` + row-cap 1000 → `ERR-INV-045` DIALOG (R23 canonical) "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"; tenant từ JWT context; KHÔNG Option B async/presigned · scope:`src/main/java/**/adapter/controller/InternalProductExportController.java`,`src/main/java/**/app/service/InternalProductExportService.java` · ac:`FEAT-CAT-PROD-EXPORT-AC-1,FEAT-CAT-PROD-EXPORT-AC-5` · review:`R1,R14`
- [x] T16 SKU search V2-23 `GET /api/v2/skus/search?q=&unmapped=&page=&size=` từ legacy `product` table; response `{productId, sku, productName, brand, origin}` per R9 + ADR-017 · scope:`src/main/java/**/adapter/controller/SkuSearchController.java`,`src/main/java/**/app/service/SkuSearchService.java` · ac:`FEAT-CAT-PROD-CREATE-AC-2` · review:`R1,R14`
- [x] T17 TenantFilter + TenantContext enforce mọi query/repo (rule #10); path KHÔNG `{tenantId}` — auth context resolve · scope:`src/main/java/**/adapter/web/TenantFilter.java`,`src/main/java/**/domain/repository/**` · ac:`FEAT-CAT-GRP-LIST-AC-10,FEAT-CAT-PROD-LIST-AC-10` · review:`R8`
- [x] T18 Unit test ≥ 80% — focus service layer (cascade, circular, import parser, tree cap, 500-row cap, delete guards) · scope:`src/test/java/**/app/service/**` · ac:`FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R17`
- [ ] T19 Integration test Testcontainers postgres 8 scenario — (a) cha→con→ngừng cha→con cascade INACTIVE; (b) import 100 dòng mix→verify→import→assert chỉ valid persist; (c) gắn SKU đã thuộc product khác→`ERR-INV-015`; (d) sửa `mainUnitCode` sau giao dịch→reject; (e) xóa nhóm còn product→`ERR-INV-004`; (f) tree 1001 nodes→413 `ERR-INV-027`; (g) import 501 rows→400 `ERR-INV-041` (R28); (h) import row originCode="ZZZ"→`ERR-INV-044` (R28 BR-CAT-PROD-023) · scope:`src/test/java/**/integration/InventoryCatalogIntegrationTest.java` · ac:`FEAT-CAT-GRP-EDIT-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R17,R18`
- [x] T20 KG `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` cập nhật entities (R8 E rename) + endpoints (23 V2 endpoint) + enums (R8 D-B + R13) + `last_verified`; 3-in-1 version bump trên artifact chạm · scope:`Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R1`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:...]`
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] Build + lint + test pass; coverage đạt ngưỡng
- [ ] 3-in-1 version bump trên artifact chạm (nếu có)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-30 | 1 | Delivery Authority (/planning-wave 03 → Step 4.5) | Generated for W03/gf-inventory (source=pkg-fallback; PKG-W03 v25 §4.1+§5.1). |
