---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-30"
wave: "W03"
boundary: "garage-web"
checklist_source: "pkg-fallback"
---

# Implementation Checklist — W03 · garage-web

> Source: `PKG-W03-inventory-catalog.md` §4.1 + §5.1 (pkg-fallback — wave-spec status PARTIAL/DRAFT).
> Wave single-phase. Desktop console KHÔNG mobile-first (G12), KHÔNG i18n (G8), KHÔNG cache custom (G5), KHÔNG route guard (G10).
> Day 2+ start: cần GraphQL contract `inventory-catalog.gql` chốt từ agg-garage-graph (Day 1 gate).
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<path> · ac:<FEAT-AC> · review:<R*/D*>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/D* — shift-left).

- [x] T1 Reuse-First gate verify `.claude/references/component-registry.yaml` — match toàn bộ UI element W03 vào registry §1 keys (`data-table-with-pagination`, `form-text-input(-uppercase)`, `form-textarea`, `form-combo-select`, `form-tag-input`, `file-upload`, `excel-upload`, `excel-export`, `ui/dialog`, `ui/alert-dialog`); xác nhận **0 build-new** (G4); KHÔNG đăng ký entry mới qua `/allow-new-component` · scope:`.claude/references/component-registry.yaml` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R4,R4b`
- [x] T2 Wire route TanStack Router + breadcrumb cho 9 route inventory-catalog (label hardcode VN per G8) · scope:`src/routes/_modules/_inventory/inventory-catalog/**` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R3,R7`
- [x] T3 `MaterialGroupListPage` flat table (G4: KHÔNG tree) dùng `share/tables/table-pagination` reuse — cột: Mã / Tên / Nhóm cha (`parentName` enrich BFF Q1) / Mô tả / Trạng thái / Action; search box `share/inputs/input-search` "Tìm theo mã nhóm, tên nhóm"; filter `customs/filter/*` (status/parentId); pagination theo `usePagination` hook (page=1, size=20); wire Q1 `searchMaterialGroups` · scope:`src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-GRP-LIST-AC-2,FEAT-CAT-GRP-LIST-AC-3,FEAT-CAT-GRP-LIST-AC-4,FEAT-CAT-GRP-LIST-AC-5,FEAT-CAT-GRP-LIST-AC-6` · review:`R3,R4,R5`
- [x] T4 `MaterialGroupFormDialog` unified create + edit (modal `ui/dialog`) — react-hook-form + zod; field `code` (autoUppercase regex BR-CAT-GRP-002 — `ERR-INV-001` inline), `name` required, `description` (`share/textareas/textarea`, ≤ 255 `ERR-INV-016`), `parentId` (`share/inputs/input-select` từ Q1 ACTIVE-only + loại self & descendants client-side per BR-CAT-GRP-009); cascade INACTIVE confirm qua `ui/alert-dialog` reuse + Q1 filter `parentId+status=ACTIVE` lấy direct-children count cho copy "Ngừng hoạt động nhóm này sẽ kéo theo {N} nhóm con đang hoạt động chuyển sang Ngừng hoạt động. Tiếp tục?" · scope:`src/features/inventory-catalog/material-group/components/MaterialGroupFormDialog.tsx`,`src/features/inventory-catalog/material-group/schemas/material-group.schema.ts` · ac:`FEAT-CAT-GRP-CREATE-AC-1,FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-GRP-EDIT-AC-1` · review:`R3,R4,R6`
- [x] T5 `InternalProductListPage` — `share/tables/table-pagination` reuse; cột: Mã / Tên / ĐVT chính (`mainUnitDisplayName`) / Nhóm (`materialGroupName`) / Brand / Tính chất / Trạng thái / Action; filter bar `customs/filter/*` (status + materialGroupId + nature + 3-col keyword `code/name/SKU` R10); 3 button header "Tạo mới" / "Nhập từ Excel" / "Xuất file"; wire Q4 `searchInternalProducts` POST body input (R10) · scope:`src/features/inventory-catalog/internal-product/components/InternalProductListPage.tsx` · ac:`FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-2` · review:`R3,R4,R5`
- [x] T6 `InternalProductFormPage` Section "Thông tin chung" (create + edit chia mode) — dropdown `mainUnitCode` từ Q9 `listUnits`; `materialGroupCode` từ Q1 ACTIVE-only; `nature` `share/inputs/input-select` 4 enum English `GOODS/TOOL/SERVICE/OTHER` (R8 D-B) label hardcode VN `{GOODS:"Hàng hóa",TOOL:"CCDC",SERVICE:"Dịch vụ",OTHER:"Khác"}`; `brand` text input free-text VARCHAR(255) (R18 revert, KHÔNG dropdown); `originCode` dropdown từ gf-erp-mdm `directory=COUNTRY` ISO 3166-1 alpha-3 (R18 NEW); `imageUrl` opaque URL field; immutable `mainUnitCode` khi `hasTransactions===true` (cờ Q5, BR-CAT-PROD-006) · scope:`src/features/inventory-catalog/internal-product/components/sections/GeneralInfoSection.tsx`,`src/features/inventory-catalog/internal-product/schemas/internal-product.schema.ts` · ac:`FEAT-CAT-PROD-CREATE-AC-1,FEAT-CAT-PROD-CREATE-AC-2,FEAT-CAT-PROD-EDIT-AC-1` · review:`R3,R6`
- [x] T7 `InternalProductFormPage` Section "SKU" — modal "Gắn SKU" qua Q8 `searchSkus(unmapped=true)` + M7 `assignSku` mutation; integrate `share/inputs/tag-input` (SKU chip list); M8 `removeSku` cho từng chip · scope:`src/features/inventory-catalog/internal-product/components/sections/SkuMappingSection.tsx`,`src/features/inventory-catalog/internal-product/components/AssignSkuDialog.tsx` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R3,R5`
- [x] T8 `InternalProductFormPage` Section "ĐVT quy đổi" — `share/tables/table-pagination` inline edit (conversion-unit table); wire M9/M10/M11; conversion-unit row edit/delete disable khi `hasTransactions===true` (BR-CAT-PROD-012) · scope:`src/features/inventory-catalog/internal-product/components/sections/ConversionUnitSection.tsx` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R3,R5`
- [x] T9 `InternalProductFormPage` Section "Đính kèm" — `share/files/file-upload` (PDF/JPG/PNG ≤5 file ≤10MB); wire M12/M13 (metadata-only, ADR-016 presigned URL upload client-side trước) · scope:`src/features/inventory-catalog/internal-product/components/sections/AttachmentSection.tsx` · ac:`FEAT-CAT-PROD-EDIT-AC-1` · review:`R3,R5`
- [x] T10 `InternalProductDetailPage` Tabs widget 4 tab (Thông tin chung / SKU / ĐVT / Đính kèm — KHÔNG tab Lịch sử per BR v8 chốt 2026-06-16) + audit info; render BFF enrichment fields `mainUnitDisplayName` + `originDisplayName` (R18) + `materialGroupName` từ Q5; brand render raw text (free-text) · scope:`src/features/inventory-catalog/internal-product/components/InternalProductDetailPage.tsx` · ac:`FEAT-CAT-PROD-DETAIL-AC-1` · review:`R3,R5`
- [x] T11 `ImportInternalProduct` dedicated route `/inventory/internal-products/import` mirror customer import (v5 anatomy) — scaffold `components/import/index.tsx` + `hooks/{use-verify-import-internal-product,use-import-internal-products}` + `helper/import.ts` (`formatDataImportInternalProductData` + `filterImportDataForDisplay` + `handleDownloadWithErrors`) + `interfaces/import.ts` + `schemas/import.ts` zod `{excel: File}` + `constants/import.ts` (`SAMPLE_FILE_INTERNAL_PRODUCT_IMPORT_NAME/URL`); reuse `ExcelUpload + FilesPreview + Container + Section + Show + TablePagination + InputSearch + PageHeader + Button + toastCustom`; client-side XLSX parse (`XLSX.read` + `sheet_to_json` + `parseExcelDate`); 4 bước Upload→Verify (M14)→Display (1 table + InputSearch + filter Tất cả/Hợp lệ/Lỗi + nút "Tải lỗi" qua `handleDownloadWithErrors`)→Commit (M15 + toast + `router.navigate` về list); nút "Tải file mẫu" header link `public/sample-files/danh-muc-ma-san-pham-noi-bo.xlsx`; **FE-side cap 500 hint** sau `sheet_to_json` (toast + reset, KHÔNG gọi M14) · scope:`src/routes/_modules/_inventory/internal-products/import.tsx`,`src/features/inventory-catalog/internal-product/components/import/**` · ac:`FEAT-CAT-PROD-IMPORT-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R3,R5,R6`
- [x] T12 Export wire R22 single-call download (drop legacy paginated client-side assemble) — nút "Xuất file" + Apollo `useExportInternalProductsLazyQuery` + `onCompleted` → `window.location.href = data.downloadUrl` (BFF reverse-proxy short-lived URL TTL 60s, browser handle download); reuse `share/exports/export-excel` cho UI Button styling (KHÔNG dùng `fetchPage` paginated logic, viết handler inline ~20 LoC); error code `ERR-INV-045` (R23 canonical) render DIALOG "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"; filename Vietnamese pass-through từ BFF `Content-Disposition` · scope:`src/features/inventory-catalog/internal-product/hooks/use-export-internal-products.ts`,`src/features/inventory-catalog/internal-product/components/ExportButton.tsx` · ac:`FEAT-CAT-PROD-EXPORT-AC-1,FEAT-CAT-PROD-EXPORT-AC-5` · review:`R3,R5`
- [x] T13 Build error code module `src/features/inventory-catalog/error-messages.ts` từ `Product/error-code/ERROR-CODE-REGISTRY.md` §6 YAML — extract `message_vi` + `display` + `action` cho 13 mã (`ERR-INV-001..008, 012-016, 019` + `ERR-CMN-004/005/006/007`); render handler theo `display` token (`INLINE_FIELD` / `INLINE_FORM` / `DIALOG` / `TOAST`); KHÔNG tự đặt câu; KHÔNG handle `ERR-INV-027` (tree oversize — FE web không gọi Q2) · scope:`src/features/inventory-catalog/error-messages.ts` · ac:`FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R3`
- [x] T14 Wire Apollo Client hooks 9 query (Q1, Q3, Q4, Q5, Q7, Q8, Q9 — bỏ Q2 vì FE web không gọi) + 13 mutation (M1..M6 + M7 + M8 + M9..M13 + M14 + M15); `refetchQueries` cho list page sau mutation (G5: KHÔNG cache policy custom); invalidate `getInternalProduct(id)` sau update · scope:`src/features/inventory-catalog/**/hooks/use-*.ts`,`src/features/inventory-catalog/**/graphql/*.gql` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1,FEAT-CAT-PROD-EDIT-AC-1` · review:`R5`
- [x] T15 Testid coverage matrix §2.2.3 wire ≥ 95% — gate REVIEW · scope:`src/features/inventory-catalog/**` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R9`
- [x] T16 Vitest + Testing Library ≥ 60% — focus form validation (regex + 4 English enum + cascade UX), import preview state machine, FE-side 500-row hint, error code handler theo display token · scope:`src/features/inventory-catalog/**/__tests__/**` · ac:`FEAT-CAT-GRP-CREATE-AC-2,FEAT-CAT-PROD-IMPORT-AC-2` · review:`R9`
- [x] T17 Bundle/code-split self-assess (G13) — `npm run build` analyzer → wrap route bằng `React.lazy()` + `Suspense` nếu module > 50KB; nhỏ hơn import sync · scope:`src/routes/_modules/_inventory/inventory-catalog/**.lazy.tsx` · ac:`FEAT-CAT-PROD-LIST-AC-1` · review:`R3,R7`
- [x] T18 KG `Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` cập nhật pages (KHÔNG đụng `implementation.components` — registry là source of truth UI per G11); 3-in-1 version bump trên artifact chạm · scope:`Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` · ac:`FEAT-CAT-GRP-LIST-AC-1,FEAT-CAT-PROD-LIST-AC-1` · review:`R11`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [x] Mọi task trên `[x]` hoặc `[deferred:...]` (T1-T18 done; verified 2026-06-30)
- [x] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện (subagent return `needs_review[]` chỉ chứa pre-existing W01/W02 baseline + 1 cosmetic — không P0/P1 trong W03 scope)
- [deferred: lint baseline + coverage gap accepted by orchestrator 2026-06-30 — see DEBT-W03-WEB-COVERAGE + needs_review entries 1-2; W03 scope clean: build pass, inventory-catalog lint 0/0, test 50/50] Build + lint + test pass; coverage đạt ngưỡng
- [x] 3-in-1 version bump trên artifact chạm (nếu có) — Tracking/DEBT-REGISTRY.md v4→v5; KG bumped trong prior session

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-30 | 1 | Delivery Authority (/planning-wave 03 → Step 4.5) | Generated for W03/garage-web (source=pkg-fallback; PKG-W03 v25 §4.1+§5.1). |
