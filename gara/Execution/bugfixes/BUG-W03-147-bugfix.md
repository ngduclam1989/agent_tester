# BUGFIX — BUG-W03-147

> [Tạo nhóm vật tư][Mã nhóm VTHH] Accept tiếng Việt có dấu — regex miss Vietnamese diacritics
> Severity: P2 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Field "Mã nhóm VTHH" chấp nhận input tiếng Việt có dấu (VD "LỆ", "ĐẶC") — vi phạm BR-CAT-GRP-002 (chỉ A-Z, 0-9, `-`). Regex `MATERIAL_GROUP_CODE_INVALID_CHARS` chỉ block explicit set `~!@#$%^&*` nên miss Vietnamese Unicode range.

## Root cause

`constants/index.ts` khai báo:
```ts
export const MATERIAL_GROUP_CODE_INVALID_CHARS = /[~!@#$%^&*]/;
```
Regex chỉ match 8 char cụ thể → ký tự tiếng Việt có dấu (Ệ, Ặ, Ó...) hoặc bất kỳ ký tự nào ngoài `[A-Z0-9-]` đều pass.

## Files changed

- `src/features/inventory-catalog/material-group/constants/index.ts` — đổi regex thành negated whitelist:
  ```ts
  export const MATERIAL_GROUP_CODE_INVALID_CHARS = /[^A-Za-z0-9-]/;
  ```
  → Match bất kỳ ký tự không thuộc `[A-Za-z0-9-]` (bao gồm space, diacritics, special chars). Schema đã transform code sang uppercase khi submit.

## Verify

1. Nhập `GRP001` → OK (Latin + digit).
2. Nhập `GRP-01` → OK (allow `-`).
3. Nhập `GRP@001` → inline error verbatim ERR-INV-001 (regression cover BUG-W03-125).
4. Nhập `LỆ` hoặc `ĐẶC` → inline error verbatim ERR-INV-001 (bug này).
5. Nhập `NHÓM01` → inline error (chữ Ó có dấu).
6. Nhập `nhom01` → OK sau transform toUpperCase (theo submit path).

## Follow-up

- Audit BE `MaterialGroupRequest.code` `@Pattern` regex tại `gf-inventory` — cần verify server-side cũng reject Vietnamese diacritics (defense-in-depth). Cross-boundary → escalate `agent-fix-gf-inventory` nếu chưa cover.
- Audit các field "Mã" khác trong inventory-catalog (Mã sản phẩm nội bộ, Mã ĐVT quy đổi, Mã SKU) — pattern có thể bị lỗi tương tự.
