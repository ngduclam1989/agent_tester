# BUGFIX — BUG-W03-125

> [Tạo nhóm vật tư][Mã nhóm VTHH] Wording drift ERR-INV-001/002
> Severity: P3 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

FE validation messages cho ERR-INV-001 (special char) và ERR-INV-002 (duplicate code) không match verbatim với `Product/error-code/ERROR-CODE-REGISTRY.md`. Registry là source-of-truth cho user-facing message.

## Root cause

- Zod schema `materialGroupFormSchema.code` refine message hardcode wording legacy.
- `applyInlineErrorIfMapped` trong `MaterialGroupFormPage` ưu tiên BE `message` fallback trước descriptor — BE trả wording khác registry.

## Files changed

- `src/features/inventory-catalog/material-group/schemas/material-group.schema.ts` — refine message đổi thành wording verbatim registry.
- `src/features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx` — reverse fallback order: `descriptor.messageVi || message`.

## Verify

Test cases (agent-test-ui TC-W03-UI-C-002):

1. Nhập `GRP@001` → inline error "Mã nhóm vật tư hàng hóa không hợp lệ — không được chứa ký tự đặc biệt"
2. Nhập mã trùng → server error mapped → "Mã nhóm vật tư hàng hóa đã tồn tại"

Regression: các ERR-INV-* khác cùng descriptor pattern không bị đổi.

## Follow-up

None.

## Note

Code changes actually landed 2026-07-03 in this session. Prior FIX_DONE claim from doc was ahead of code (schema wording + descriptor fallback order).
