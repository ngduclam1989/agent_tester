# BUGFIX-BUG-W03-118 — Wire testid field-level cho form Tạo/Sửa sản phẩm nội bộ

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-118`
> **L2 verify**: `Tracking/WAVE03/verify/BUG-W03-118.verify.md`
> **Feature**: FEAT-CAT-PROD-CREATE + FEAT-CAT-PROD-EDIT (partial — List/Detail follow-ups)
> **Boundary**: `garage-web`
> **Severity**: P2
> **Status**: OPEN → RESOLVED
> **Fixed by**: agent-fix-garage-web — 2026-07-03

---

## 1. Failure mode

`INV_CAT_TESTID.internalProduct.field*` khai báo 8+ key (fieldCode/Name/MainUnit/MaterialGroup/Nature/Brand/Origin/ImageUrl) nhưng không có element nào trong DOM render với data-testid tương ứng — Playwright `getByTestId(...)` count=0. E2E fallback về selector text/CSS → fragile.

## 2. Root cause

Component `share/inputs/{Input,InputSelect}` + `share/selects/select-filter` + `share/textareas/textarea` KHÔNG expose prop `data-testid` pass-through. GeneralInfoSection render các field trực tiếp mà không wrap → không có anchor cho testid.

## 3. Fix

`frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/sections/GeneralInfoSection.tsx`:

- Import `INV_CAT_TESTID` từ `../../../shared/testids`.
- Wrap 8 field trong `<div data-testid={INV_CAT_TESTID.internalProduct.fieldXxx}>`:
  - `fieldImageUrl` bọc `<ProductImageUpload />`
  - `fieldCode`, `fieldName`, `fieldNature`, `fieldMaterialGroup`, `fieldMainUnit`, `fieldBrand`, `fieldOrigin` bọc `<Input/>` / `<InputSelect/>` / `<SelectFilter/>` tương ứng.

Layout không ảnh hưởng: parent grid `grid-cols-1 lg:grid-cols-3` xem wrapper `<div>` là grid item, Input bên trong `w-full` trong `FormItem` giữ nguyên visual.

## 4. Non-goals (Follow-ups)

- Testid List/Detail (`page`, `detailPage`, `row(id)`, `btnEdit(id)`, `btnDelete(id)`, `pagination`, `tabConversion/tabSku/tabAttachment` ngoài phạm vi Create form) chưa audit trong session này (timeboxed per orchestrator instruction — wire top-6 registry field* trước). Cần agent-fix-garage-web session sau audit các `row(id)` action buttons trong `InternalProductListPage.tsx` + `InternalProductDetailPage.tsx`.
- Testid Material Group form (`materialGroup.fieldCode/Name/ParentId/Description/Status/btnSubmit/btnCancel`) trong `MaterialGroupFormDialog` cũng đang miss wire — orchestrator có thể spawn spin-off bug.
- Component `share/inputs/*` cần expose prop `dataTestId?: string` để tránh wrapper — refactor này nằm ngoài fix scope, propose vào `.claude/memory/agent-fix-garage-web/BUG_PATTERNS.md`.

## 5. Regression / verify

- Playwright `page.getByTestId('inv-cat.internal-product.field-code').count()` giờ trả `1` khi form Create/Edit mở.
- Visual không thay đổi.
- `npx eslint` trên GeneralInfoSection.tsx PASS.
- TypeScript build 0 errors trên toàn repo.

## 6. Files touched

- `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/components/sections/GeneralInfoSection.tsx`

## 7. Retro fields

- `agent_origin`: agent-dev-garage-web (initial impl không wire testid dù đã centralize registry).
- `root_cause_category`: checklist (missing wire audit khi extract testid registry).
- `recurrence_of`: null (nhưng cùng họ với FM-019 parallel-shell theme — testid coverage gap).
