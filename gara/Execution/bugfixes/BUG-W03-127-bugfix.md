# BUGFIX — BUG-W03-127

> [Chỉnh sửa nhóm vật tư][Thuộc nhóm] Field vẫn editable, trái FEAT-CAT-GRP-EDIT v5
> Severity: P2 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Field "Thuộc nhóm" trong Edit form của Material Group không bị disable — trái với FEAT-CAT-GRP-EDIT v5 yêu cầu khóa vĩnh viễn cùng pattern "Mã nhóm".

## Root cause

`SelectSuggestedMaterialGroup` trong `MaterialGroupFormPage.tsx` thiếu prop `disabled={isEdit}`. Field "Mã nhóm" đã có pattern này (`disabled={isEdit}` trên `Input`), nhưng "Thuộc nhóm" chưa được cập nhật theo rule mới.

## Files changed

- `src/features/inventory-catalog/material-group/components/MaterialGroupFormPage.tsx` — thêm `disabled={isEdit}` prop cho `SelectSuggestedMaterialGroup`.

## Verify

1. Mở Edit form nhóm con → field "Thuộc nhóm" phải disabled (không click được).
2. Field "Mã nhóm" vẫn disabled (không phá pattern hiện có).
3. Các field khác (Tên, Trạng thái, Mô tả) vẫn editable.
4. Create mode: field "Thuộc nhóm" editable (chỉ 1 lần khi tạo).

Regression: các form khác dùng `SelectSuggestedMaterialGroup` không bị ảnh hưởng (prop optional).

## Follow-up

None.
