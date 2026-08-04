# BUGFIX-BUG-W03-136 — Wording ERR-INV-046 verbatim cho Mô tả / Ghi chú >500 ký tự

> **L1 ticket**: `Tracking/WAVE03/BUGS.md` row `BUG-W03-136`
> **L2 verify**: (not written — task instruction cite `ERROR-CODE-REGISTRY.md` verbatim)
> **Feature**: FEAT-CAT-PROD-CREATE + FEAT-CAT-PROD-EDIT
> **Boundary**: `garage-web`
> **Severity**: P3
> **Status**: OPEN → RESOLVED
> **Fixed by**: agent-fix-garage-web — 2026-07-03

---

## 1. Failure mode

Form tạo/sửa sản phẩm nội bộ: khi user nhập `Mô tả` hoặc `Ghi chú` > 500 ký tự, message inline hiển thị paraphrase (`Mô tả tối đa 500 ký tự` / `Ghi chú tối đa 500 ký tự`) thay vì verbatim spec ERR-INV-046 (`Mô tả / Ghi chú vượt quá 500 ký tự`). Cùng loại wording drift với BUG-W03-125.

## 2. Root cause

`internal-product.schema.ts` (Zod) khai `description.max(500, \`Mô tả tối đa ${…} ký tự\`)` + `notes.max(500, \`Ghi chú tối đa ${…} ký tự\`)` — dev tự viết template string thay vì cite verbatim message từ `Product/error-code/ERROR-CODE-REGISTRY.md` L144.

## 3. Fix

`frontend/gf-gms-web/src/features/inventory-catalog/internal-product/schemas/internal-product.schema.ts`:

- L74-75: message đổi thành plain string `"Mô tả / Ghi chú vượt quá 500 ký tự"`.
- L82-83: message đổi thành plain string `"Mô tả / Ghi chú vượt quá 500 ký tự"`.

Không đổi max length (vẫn = 500 = `INTERNAL_PRODUCT_DESCRIPTION_MAX_LENGTH` = `INTERNAL_PRODUCT_NOTES_MAX_LENGTH`).

## 4. Regression / verify

- `internal-product.schema.test.ts` hiện có test `rejects description over 500 chars` + `rejects notes over 500 chars` (chỉ assert `success===false`, không assert message) — vẫn PASS.
- `npx eslint` trên schema file PASS.
- TypeScript build 0 errors.

## 5. Files touched

- `frontend/gf-gms-web/src/features/inventory-catalog/internal-product/schemas/internal-product.schema.ts`

## 6. Retro fields

- `agent_origin`: agent-dev-garage-web (schema author).
- `root_cause_category`: knowledge (không cite ERROR-CODE-REGISTRY verbatim khi viết message).
- `recurrence_of`: BUG-W03-125 (cùng họ wording drift ERR-INV-*).
