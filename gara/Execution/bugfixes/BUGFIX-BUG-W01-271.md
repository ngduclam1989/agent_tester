# BUGFIX BUG-W01-271 — Create SO bảng "Phụ tùng sử dụng" hiển thị sai cột "Khấu hao VT"

> **Status**: RESOLVED.
> **Severity**: P2.
> **Authored by**: agent-fix-garage-web (Wave 01).
> **Related**: BUG-W01-267 (RESOLVED — depreciationPercent persist), BUG-W01-268 (RESOLVED — header/align), BUG-W01-274 (Mobile counterpart, separate boundary).

---

## 1. Failure mode

Tại màn Tạo mới Phiếu dịch vụ (Create SO) — bảng "Phụ tùng sử dụng"
hiển thị cột "Khấu hao VT" khi `hasInsurance=true`. User có thể nhập
giá trị `%` vào cột này dù API `POST /api/v3/service-orders` (§2207)
KHÔNG nhận field `depreciationPercent` / `depreciationByLine` (per
`gf-sales-api.md §3bis.1` locked 2026-05-30: "Chỉ Edit + Detail — KHÔNG
Create").

Expected: bảng "Phụ tùng sử dụng" trên Create SO hoàn toàn ẩn cột "Khấu hao VT"
(cả khi `hasInsurance=true` lẫn `false`). Column chỉ xuất hiện trên SO Edit
(`PUT /{id}`), SO Detail (`GET /detail/{code}`), STL Detail, STL Edit.

## 2. Root cause / Verification

Audit code path hiện hành phát hiện column **đã được gated đúng** từ
trước (likely qua fix BUG-W01-254/268):

- `src/features/service-order/components/form/items-table-section.tsx:102-104`:
  ```tsx
  const showDepreciationColumn =
    !isService && !!allValues.hasInsurance && mode !== "create";
  ```
- `src/features/service-order/components/form/items-table-section.tsx:577-601`:
  column definition `id: "depreciationPercent"` được wrap trong
  `...(showDepreciationColumn ? [...] : [])` spread — guard chính xác.
- `src/features/service-order/components/form/index.tsx:289`:
  `<PartItemsSection mode={isEditing ? "edit" : "create"} />` — Create flow
  không pass `isEditing` prop → `isEditing=undefined` → falsy → `mode="create"`
  → `showDepreciationColumn=false`.
- `src/features/service-order/helper/index.ts:207`:
  `if (!formatData.depreciationPercent) delete formatData.depreciationPercent`
  — submit mapper strip field khi falsy → payload Create SO sạch.

Bug có thể có nguồn từ thời điểm trước fix BUG-W01-254/268. Hành động
fix lần này = **bổ sung regression guard** ở source-level để prevent
future regressions.

## 3. Fix

NEW regression test file `depreciation-create-hidden.test.ts` —
source-level guards (4 specs):

1. `items-table-section guards showDepreciationColumn on mode !== 'create'` —
   assert source pattern `showDepreciationColumn[...]mode !== "create"`.
2. `column definition (id: depreciationPercent) is gated behind showDepreciationColumn` —
   assert spread pattern `...(showDepreciationColumn ? [{ id: "depreciationPercent" ... } ] : [])`.
3. `form host (ServiceOrderForm) threads mode='create' khi không phải editing` —
   assert form host pattern `<PartItemsSection mode={isEditing ? "edit" : "create"}>`.
4. `submit mapper strips depreciationPercent khi falsy` — assert helper
   `if (!formatData.depreciationPercent) delete formatData.depreciationPercent` pattern.

Không sửa source code logic — code path đã đúng theo spec; fix lần này
là **regression guard** preventing future drift.

## 4. Regression test

File: `src/features/service-order/components/form/depreciation-create-hidden.test.ts`
(4 specs, source-level reads — không phải DOM render, vì full RHF + Apollo
+ zustand boot brittle trong jsdom).

## 5. Blast radius

- Touched: 1 NEW test file.
- No source code change — code đã đúng spec.
- No public API change.

## 6. Verification

- `npm run build` → exit 0.
- Lint touched file → clean.
- Vitest (node env) — 4 specs PASS.

## 7. Manual verification recommendation

QC nên re-check manually trên live environment để confirm column thật sự
ẩn (image evidence trong bug report khả dĩ từ thời điểm trước fix
BUG-W01-254/268). Steps theo `verify/BUG-W01-271.verify.md` §2.
