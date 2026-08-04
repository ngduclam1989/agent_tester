---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-30"
wave: "W03"
boundary: "agg-garage-graph"
checklist_source: "pkg-fallback"
---

# Implementation Checklist — W03 · agg-garage-graph

> Source: `PKG-W03-inventory-catalog.md` §4.1 + §5.1 (pkg-fallback — wave-spec status PARTIAL/DRAFT).
> Wave single-phase. **GraphQL contract chốt cuối Day 1** = gate downstream cho web + mobile mock.
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<path> · ac:<FEAT-AC> · review:<R*/D*>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/D* — shift-left).

- [x] T1 Schema `inventory-catalog.gql` — 9 query (V2-Q1..Q9) + 15 mutation (V2-M1..M15) = 24 ops khớp `api/agg-garage-graph-graphql.md` v7.24 §3d.2; SDL introspection clean; **chốt cuối Day 1 → web/mobile mock theo contract** · scope:`src/schema/inventory-catalog.gql` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R1,R18`
- [x] T2 Resolvers passthrough Material Group Q1 `searchMaterialGroups` + Q2 `getMaterialGroupTree` + Q3 `getMaterialGroup` + M1 `createMaterialGroup` + M2 `updateMaterialGroup` + M3 `deleteMaterialGroup` — gọi gf-inventory REST + auth header propagation (`Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`) · scope:`src/resolvers/material-group.resolver.ts` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-GRP-CREATE-AC-1,FEAT-CAT-GRP-EDIT-AC-1,FEAT-CAT-GRP-DELETE-AC-1,FEAT-CAT-GRP-DETAIL-AC-1` · review:`R2,R16`
- [x] T3 Resolvers passthrough Internal Product Q4 `searchInternalProducts` + Q5 `getInternalProduct` + M4 `createInternalProduct` + M5 `updateInternalProduct` + M6 `deleteInternalProduct` — auth header propagation · scope:`src/resolvers/internal-product.resolver.ts` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-CREATE-AC-1,FEAT-CAT-PROD-EDIT-AC-1,FEAT-CAT-PROD-DELETE-AC-1,FEAT-CAT-PROD-DETAIL-AC-1` · review:`R2,R16`
- [partial:no dataloader npm dep — used equivalent gather-and-batch pattern] T4 DataLoader 6 loader (`materialGroupById`, `unitByCode` gf-erp-mdm R8 A, `originCountryByCode` gf-erp-mdm R18 NEW thay `brandByCode` đã xóa, `skuMappingsByProductId`, `conversionUnitsByProductId` R8 E, `attachmentsByProductId`) — chống N+1 trên `searchInternalProducts` · scope:`src/data-loaders/inventory-catalog.loaders.ts` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-DETAIL-AC-1` · review:`R16,R17`
- [x] T5 BFF batch enrichment R18 — `InternalProduct.mainUnitDisplayName` + `originDisplayName` (R18 NEW) qua gf-erp-mdm batch (Q4/Q5, `directory=UNIT/COUNTRY`) + `materialGroupName` batch lookup · scope:`src/resolvers/internal-product.resolver.ts`,`src/services/enrichment.service.ts` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-DETAIL-AC-1` · review:`R16`
- [x] T6 Backend-native passthrough verify (R21 v7.24) — `MaterialGroup.parentName` (Q1/Q2/Q3 + M1/M2 response) gf-inventory tự fill payload qua recursive CTE; BFF chỉ passthrough, KHÔNG gom IDs / KHÔNG batch riêng; `null` khi root · scope:`src/resolvers/material-group.resolver.ts` · ac:`FEAT-CAT-GRP-LIST-AC-3,FEAT-CAT-GRP-DETAIL-AC-1` · review:`R1,R16`
- [x] T7 TENANT-USERS enrichment R20 v7.23 — helper `enrichObjectWithByNames` + `enrichArrayWithByNames` cho `MaterialGroup.createdByName/updatedByName`; flow gom distinct `iamUserIds` → `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` `{iamUserIds, tenantId từ JWT}` → merge; áp dụng V2-Q1 (paged content[]) + V2-Q2 (tree flatten) + V2-Q3 (single) + V2-M1/M2 (mutation response); conditional skip khi no `*By` / no tenantId · scope:`src/services/tenant-users.enrichment.ts`,`src/resolvers/material-group.resolver.ts` · ac:`FEAT-CAT-GRP-DETAIL-AC-1` · review:`R16`
- [x] T8 Defense logic Q2 tree cap — MAX 1000 nodes BFF-side → throw `MATERIAL_GROUP_TREE_OVERSIZE` HTTP 413 + hint redirect Q1 (BE: `ERR-INV-027`) · scope:`src/resolvers/material-group.resolver.ts` · ac:`FEAT-CAT-GRP-LIST-AC-1` · review:`R16`
- [x] T9 SKU mapping resolvers M7 `assignSku` + M8 `removeSku` (R9 arg rename `productId`) · scope:`src/resolvers/sku-mapping.resolver.ts` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R2,R16`
- [x] T10 Conversion-unit resolvers M9 `addConversionUnit` + M10 `updateConversionUnit` + M11 `removeConversionUnit` (R8 D-E `unitCode`) — pass-through `ERR-INV-047` precision guard (R29) cho V2-M9/M10 · scope:`src/resolvers/conversion-unit.resolver.ts` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R2,R16`
- [x] T11 Attachment resolvers M12 `addAttachment` + M13 `removeAttachment` metadata-only (ADR-016 presigned reuse) · scope:`src/resolvers/attachment.resolver.ts` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R2,R16`
- [x] T12 Import resolvers M14 `verifyImportInternalProducts` + M15 `importInternalProducts` — defense cap `input.items.length ≤ 500` BFF-side → throw `ERR-INV-041` (R28 canonical sync Product registry v14 line 139 + BR-CAT-PROD-020; drop `ERR-INV-019` legacy); BFF pass-through `ERR-INV-044` per-row originCode invalid (BR-CAT-PROD-023, R28) · scope:`src/resolvers/internal-product-import.resolver.ts` · ac:`FEAT-CAT-PROD-IMPORT-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R2,R16`
- [x] T13 Export Q7 `exportInternalProducts` R22 reverse-proxy pattern — resolver (1) validate filter subset Q4; (2) sinh short-lived signed token TTL 60s (Redis hoặc in-memory Map với cleanup) lưu mapping `{token → {filter, tenantId từ JWT, userId}}`; (3) return `data.downloadUrl = "/export/internal-products/{token}"`; ADD Express middleware `/export/internal-products/:token` handler validate token + re-construct request → call gf-inventory V2-22 với forwarded auth + body filter → stream binary response back với `Content-Disposition` + `Content-Type` pass-through; token use-once hoặc expire 60s; BE trả `400 ERR-INV-045` (R23 canonical) khi matched-count > 1000 → BFF pass-through `extensions.code=ERR-INV-045` · scope:`src/resolvers/internal-product-export.resolver.ts`,`src/middleware/export-proxy.middleware.ts`,`src/services/signed-token.service.ts` · ac:`FEAT-CAT-PROD-EXPORT-AC-1,FEAT-CAT-PROD-EXPORT-AC-5` · review:`R2,R16,R8`
- [x] T14 SKU search Q8 `searchSkus` (V2-23, `unmapped=true` filter) + `listUnits` Q9 gọi gf-erp-mdm `/protected/catalog/v1/inquiry?directory=UNIT` trực tiếp (KHÔNG gf-inventory) · scope:`src/resolvers/sku-search.resolver.ts`,`src/resolvers/units.resolver.ts` · ac:`FEAT-CAT-PROD-CREATE-AC-2` · review:`R2,R16`
- [x] T15 Error code mapping `error-code-map.ts` — `ERR-INV-001..019` + `ERR-INV-027` + `ERR-INV-045` (R23 canonical export row-cap) + `ERR-INV-047` (R29 BA 2026-06-26 conversion rate precision ≤6 decimals, pass-through cho V2-M9/M10) + `ERR-CMN-004/005/006` → `extensions.code` GraphQL · scope:`src/utils/error-code-map.ts` · ac:`FEAT-CAT-PROD-IMPORT-AC-2,FEAT-CAT-PROD-EXPORT-AC-5` · review:`R16`
- [partial:no Vitest runner first-party; regression script substitutes] T16 Vitest contract test ≥ 80% — happy path 24 ops + 2 error case + supertest cho 3 cap defense (Q2 1001 nodes, M14 501 rows, Q7 filter quá rộng → `ERR-INV-045` R23 canonical) + TENANT-USERS enrichment test (Q1 paged + Q3 single + conditional no-tenantId/no-match → null) · scope:`src/__tests__/inventory-catalog/**` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R17,R18`
- [x] T17 KG `Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml` cập nhật 24 ops + `last_verified`; 3-in-1 version bump trên artifact chạm · scope:`Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R1`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:...]`
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] Build + lint + test pass; coverage đạt ngưỡng
- [ ] 3-in-1 version bump trên artifact chạm (nếu có)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-30 | 1 | Delivery Authority (/planning-wave 03 → Step 4.5) | Generated for W03/agg-garage-graph (source=pkg-fallback; PKG-W03 v25 §4.1+§5.1). |
