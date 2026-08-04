---
type: execution
artifact_kind: implementation-checklist
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
wave: "W04"
boundary: "garage-web"
checklist_source: "wave-spec"
---

# Implementation Checklist — W04 · garage-web

> Source: `Execution/wave-specs/W04/Product/features/fe-web/FEAT-*.md` (9 files ACTIVE — 5 AP + 4 OB) + `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` §2.2.4 + §4.1 + §5.1 + Nav spec.
> Wave single-phase 5 ngày. Desktop console KHÔNG mobile-first (G12), KHÔNG cache custom (G5), route guard qua `Inventory:InventoryV2` flag (CR-20260707-02).
> Import Product FE-only rewrite piggyback CR-20260707-01 — atomic commit, disable khi `errorRows>0`, bỏ màn kết quả trung gian.
> Reuse-First per `.claude/references/web-component-registry.yaml` — layer priority `customs > share > ui`. NEW component → `/allow-new-component` trước.
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

## Tasks

> Format: `- [ ] T{n} <mô tả tiếng Việt> · scope:<path/glob> · ac:<FEAT-AC> · review:<R*/W-R*> · layer:<route|component|hook|graphql|test>`
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/W-R* — shift-left).

- [ ] T1 Menu entry — thêm parent "Danh mục kho" (verbatim Figma W04 navbar label) + 2 child "Kỳ kế toán" + "Tồn đầu kỳ" vào sidebar; RBAC gate per `BR-AP-CMN-002` + `BR-OB-CMN-002`; ẩn hoàn toàn khi `Inventory:InventoryV2=OFF` · scope:`frontend/gf-gms-web/src/layouts/home/modules/constants.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`W-R1,R7` · layer:`component`
- [ ] T2 Route `/inventory/accounting-periods` list + tree view — TanStack Router `beforeLoad` gate `Inventory:InventoryV2`; filter type/year/status; tree Năm→Quý→Tháng expand/collapse; row actions "Xem"/"Sửa"/"Xóa"/"Đóng"/"Mở lại" theo status (BR-AP-EDIT-005/006); reuse `share/tables/table-pagination` + `customs/tree-view` + `customs/filter/*` · scope:`src/routes/_modules/_inventory/accounting-periods/index.tsx`,`src/features/inventory-accounting-period/components/AccountingPeriodListPage.tsx` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-LIST-AC-2,FEAT-AP-LIST-AC-3` · review:`W-R1,W-R3,W-R4,R3,R4,R5` · layer:`route|component`
- [ ] T3 Route `/inventory/accounting-periods/new` — form CREATE (react-hook-form + zod); radio `type` Năm/Quý/Tháng; date-period-picker theo type; checkbox "Tự sinh kỳ con"; reuse `share/inputs/input-select` + `customs/date-period-picker` + `share/forms/form-input`; error inline `ERR-INV-021..026` · scope:`src/routes/_modules/_inventory/accounting-periods/new.tsx`,`src/features/inventory-accounting-period/components/AccountingPeriodFormPage.tsx`,`src/features/inventory-accounting-period/schemas/accounting-period.schema.ts` · ac:`FEAT-AP-CREATE-AC-1,FEAT-AP-CREATE-AC-2,FEAT-AP-CREATE-AC-3` · review:`W-R1,W-R8,R3,R6` · layer:`route|component|hook`
- [ ] T4 Route `/inventory/accounting-periods/:id` — detail (info block + kỳ con list + audit info); reuse `share/description-list/description-item` layout; render enrichment `parentPeriodName` từ Q · scope:`src/routes/_modules/_inventory/accounting-periods/$id.tsx`,`src/features/inventory-accounting-period/components/AccountingPeriodDetailPage.tsx` · ac:`FEAT-AP-DETAIL-AC-1` · review:`W-R1,R3,R5` · layer:`route|component`
- [ ] T5 Route `/inventory/accounting-periods/:id/edit` — form sửa mode `_mode: edit-only` annotation (W-R8) + 2 nút hành động "Đóng kỳ" / "Mở lại" theo status; confirm modal danger dùng `ui/alert-dialog`; disabled logic per `BR-AP-EDIT-005/006/007` · scope:`src/routes/_modules/_inventory/accounting-periods/$id.edit.tsx`,`src/features/inventory-accounting-period/components/AccountingPeriodEditPage.tsx` · ac:`FEAT-AP-EDIT-AC-1,FEAT-AP-EDIT-AC-2,FEAT-AP-EDIT-AC-3,FEAT-AP-EDIT-AC-4` · review:`W-R1,W-R8,R3,R6` · layer:`route|component`
- [ ] T6 Row action Delete AP list — confirm modal danger + wording verbatim per `FEAT-AP-DELETE-AC-1..3`; toast success sau khi xóa; error `ERR-INV-not-found` + `ERR-CMN-007` render TOAST · scope:`src/features/inventory-accounting-period/components/DeleteAccountingPeriodDialog.tsx` · ac:`FEAT-AP-DELETE-AC-1,FEAT-AP-DELETE-AC-2,FEAT-AP-DELETE-AC-3` · review:`W-R1,R3,R5` · layer:`component`
- [ ] T7 Route `/inventory/opening-balances` list — filter (product/warehouse/date) qua `customs/filter/*`; checkbox multi-select column; button "Xóa đã chọn" header; `OpeningBalanceTotalRow` sticky footer (Tổng SL / Tổng Giá trị); reuse `share/tables/table-pagination` + `share/inputs/input-search` · scope:`src/routes/_modules/_inventory/opening-balances/index.tsx`,`src/features/inventory-opening-balance/components/OpeningBalanceListPage.tsx`,`src/features/inventory-opening-balance/components/OpeningBalanceTotalRow.tsx` · ac:`FEAT-OB-LIST-AC-1,FEAT-OB-LIST-AC-2,FEAT-OB-LIST-AC-3` · review:`W-R1,W-R3,R3,R4,R5` · layer:`route|component`
- [ ] T8 Route `/inventory/opening-balances/import` **SINGLE-PAGE** (PKG v8 F3 fix — KHÔNG wizard 4-step) — upload file + inline preview + 3 cards stats (Tổng dòng / Hợp lệ / Lỗi) + tab "ĐVT reference" + button "Tải file lỗi" + banner empty-file "0 dòng — không thể commit" + button "Xác nhận" **disabled khi `errorRows > 0`** + toast SUCCESS + `router.navigate` về list. Reuse `share/uploads/excel-upload` + `customs/preview-table` + `customs/banner-info` + `customs/stats-pills`; LocaleKeys mandatory (W-R1) · scope:`src/routes/_modules/_inventory/opening-balances/import.tsx`,`src/features/inventory-opening-balance/components/import/**`,`src/features/inventory-opening-balance/helper/import.ts`,`src/features/inventory-opening-balance/constants/import.ts` · ac:`FEAT-OB-IMPORT-AC-1,FEAT-OB-IMPORT-AC-2,FEAT-OB-IMPORT-AC-3,FEAT-OB-IMPORT-AC-4` · review:`W-R1,W-R4,W-R5,R3,R5,R6` · layer:`route|component|hook`
- [ ] T9 Modal/drawer edit OB line — 5 field editable (SL / Giá / Ghi chú / 2 field khác per FEAT-OB-EDIT) + ĐVT readonly; react-hook-form + zod; save disabled khi form invalid; reuse `ui/dialog` + `share/forms/form-input` · scope:`src/features/inventory-opening-balance/components/EditOpeningBalanceLineDialog.tsx`,`src/features/inventory-opening-balance/schemas/opening-balance-line.schema.ts` · ac:`FEAT-OB-EDIT-AC-1,FEAT-OB-EDIT-AC-2` · review:`W-R1,W-R6,R3,R5` · layer:`component`
- [ ] T10 Delete-selected OB confirm — popup danger dùng `ui/alert-dialog`; wording verbatim per `FEAT-OB-DELETE-LINES-AC-4`; fail-fast display "chỉ báo 1 mã lỗi" (không aggregate) · scope:`src/features/inventory-opening-balance/components/DeleteOpeningBalanceLinesDialog.tsx` · ac:`FEAT-OB-DELETE-LINES-AC-1,FEAT-OB-DELETE-LINES-AC-2,FEAT-OB-DELETE-LINES-AC-3,FEAT-OB-DELETE-LINES-AC-4` · review:`W-R1,R3,R5` · layer:`component`
- [ ] T11 GraphQL hooks — sinh 15 op: `useAccountingPeriodsQuery`, `useAccountingPeriodTreeQuery`, `useAccountingPeriodQuery(id)`, `useCreateAccountingPeriodMutation`, `useUpdateAccountingPeriodMutation`, `useCloseAccountingPeriodMutation`, `useReopenAccountingPeriodMutation`, `useDeleteAccountingPeriodMutation`, `useSearchOpeningBalancesQuery`, `useVerifyImportOpeningBalancesMutation`, `useImportOpeningBalancesMutation`, `useUpdateOpeningBalanceLineMutation`, `useDeleteOpeningBalanceLineMutation`, `useDeleteOpeningBalanceLinesMutation` + 1 lookup query cho ĐVT reference tab; `refetchQueries` sau mutation (G5: KHÔNG cache policy custom) · scope:`src/features/inventory-accounting-period/**/hooks/use-*.ts`,`src/features/inventory-accounting-period/**/graphql/*.gql`,`src/features/inventory-opening-balance/**/hooks/use-*.ts`,`src/features/inventory-opening-balance/**/graphql/*.gql` · ac:`FEAT-AP-LIST-AC-1,FEAT-AP-CREATE-AC-1,FEAT-AP-EDIT-AC-1,FEAT-AP-DELETE-AC-1,FEAT-OB-LIST-AC-1,FEAT-OB-IMPORT-AC-1,FEAT-OB-EDIT-AC-1,FEAT-OB-DELETE-LINES-AC-1` · review:`R5` · layer:`graphql|hook`
- [ ] T12 **CR-20260707-01 FE-only** — rewrite `/inventory/internal-products/import`: button "Xác nhận" disabled khi `errorRows.length > 0` + inline warning "Vui lòng sửa {N} dòng lỗi rồi tải lại tệp" + **bỏ hẳn màn kết quả import trung gian** ("X thành công / Y lỗi"); flow mới: upload → preview → sửa file → re-upload → confirm → toast SUCCESS + redirect list. Giữ button "Tải file lỗi" ở preview. KHÔNG đụng BE/BFF · scope:`src/routes/_modules/_inventory/internal-products/import.tsx`,`src/features/inventory-catalog/internal-product/components/import/**` · ac:`FEAT-CAT-PROD-IMPORT-AC-1,FEAT-CAT-PROD-IMPORT-AC-2` (CR-20260707-01) · review:`W-R1,W-R4,R3,R5` · layer:`route|component`
- [ ] T13 Sidebar hiding gate `Inventory:InventoryV2` — flag OFF → menu item "Danh mục kho" ẩn hoàn toàn khỏi sidebar (CR-20260707-02); route `beforeLoad` redirect `/` khi flag OFF; test cả 2 state · scope:`src/layouts/home/modules/constants.ts`,`src/routes/_modules/_inventory/accounting-periods/**`,`src/routes/_modules/_inventory/opening-balances/**`,`src/lib/feature-flags/index.ts` · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`R7,R10` · layer:`route|component`
- [ ] T14 Verbatim labels + LocaleKeys per Figma W04 (W-R1) — 9 Figma spec `Product/ux/figma-web/wave04-*.md` (ap-list/create/detail/edit/delete + ob-list/import + cat-prod-import + 1 shared); mọi label/placeholder/description verbatim binding mapper §1; CẤM fabricate helper text (W-R1 §Item 20) · scope:`src/features/inventory-accounting-period/**`,`src/features/inventory-opening-balance/**`,`src/features/inventory-catalog/internal-product/components/import/**` · ac:`FEAT-AP-*,FEAT-OB-*` · review:`W-R1,W-R7,R3` · layer:`component`
- [ ] T15 Error-code map — 13 `ERR-INV-*` + `ERR-CMN-007` + `ERR-CMN-not-found` + `ERR-INV-021..026` (AP domain) → user-facing message centralized `src/shared/error-codes/index.ts` (W-R5); render handler theo `display` token (`INLINE_FIELD` / `INLINE_FORM` / `DIALOG` / `TOAST`); nguồn `Product/error-code/ERROR-CODE-REGISTRY.md` §6 YAML · scope:`src/shared/error-codes/index.ts`,`src/features/inventory-accounting-period/error-messages.ts`,`src/features/inventory-opening-balance/error-messages.ts` · ac:`FEAT-AP-CREATE-AC-2,FEAT-OB-IMPORT-AC-2,FEAT-OB-DELETE-LINES-AC-4` · review:`W-R5,R3` · layer:`component`
- [ ] T16 Vitest ≥ 60% + testid coverage ≥ 95% — component tests cho list/form/dialog (AP + OB + CR-20260707-01 import); hook tests cho 15 GraphQL op; centralized error-codes tests theo display token; import single-page state machine (upload → preview → confirm với disable-on-error); LocaleKeys resolution smoke test · scope:`src/features/inventory-accounting-period/**/__tests__/**`,`src/features/inventory-opening-balance/**/__tests__/**`,`src/features/inventory-catalog/internal-product/components/import/__tests__/**`,`src/shared/error-codes/__tests__/**` · ac:`FEAT-AP-CREATE-AC-2,FEAT-OB-IMPORT-AC-2,FEAT-OB-DELETE-LINES-AC-4` · review:`R9` · layer:`test`
- [ ] T17 KG `Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` cập nhật — add 8 route (`/inventory/accounting-periods` + `/new` + `/:id` + `/:id/edit` + `/inventory/opening-balances` + `/import` + edit-dialog + delete-dialog page-level Figma refs) + 15 GraphQL op mapping (KHÔNG đụng `implementation.components` — registry là source of truth UI per G11); 3-in-1 version bump trên artifact chạm · scope:`Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` · ac:`FEAT-AP-LIST-AC-1,FEAT-OB-LIST-AC-1` · review:`R11` · layer:`graphql`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:<lý do>]`
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] Build + lint + test pass; coverage đạt ngưỡng ≥ 60%; testid ≥ 95%
- [ ] Reuse-First verify — 0 build-new component ngoài registry ready; entry mới có `/allow-new-component` audit trail
- [ ] Feature-flag `Inventory:InventoryV2` verify — cả 2 state (ON/OFF) render đúng (sidebar hidden + route redirect khi OFF)
- [ ] 3-in-1 version bump trên artifact chạm (KG + checklist nếu edit)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority (/planning-wave 04 → Step 4.5) | Generated for W04/garage-web (source=wave-spec; 9 FEAT tier fe-web files ACTIVE). 8 route + 15 hook + CR-20260707-01 FE-only rewrite Import Product. |
