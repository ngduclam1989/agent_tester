# BUGFIX — BUG-W03-146

> [Danh sách nhóm vật tư][Cột Mô tả] Data dài không word-wrap → phá layout table
> Severity: P2 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Cột "Mô tả" trong bảng Danh sách nhóm vật tư không có max-width ép buộc trên cell — data dài (250 ký tự) kéo dài ra khỏi khung, phá layout table, đẩy cột Trạng thái/Thao tác ra khỏi viewport.

## Root cause

Column definition có `meta.headerClassName: "w-[300px]"` nhưng cell chỉ có `line-clamp-4 break-all` không kèm `max-w-[300px]` — với table layout auto, TD tự expand theo content nếu không có constraint hiển ở cell level.

## Files changed

- `src/features/inventory-catalog/material-group/components/MaterialGroupListPage.tsx` — cell "Mô tả": thêm `max-w-[300px] whitespace-normal break-words` (thay `break-all` bằng `break-words` cho tiếng Việt), giữ `line-clamp-4` để cap chiều cao; thêm `meta.cellClassName: "max-w-[300px]"` cho table container áp dụng ở TD level.

## Verify

1. Tạo 3 nhóm với description: rỗng / 50 ký tự / 255 ký tự.
2. Mở Danh sách → không xuất hiện horizontal scroll bar.
3. Cột Trạng thái + Thao tác luôn visible.
4. Cell 255 ký tự wrap gọn, không kéo cột phình ra.

## Follow-up

Audit cột "Mô tả" tương tự trong `MaterialGroupListPage`-adjacent (InternalProductListPage, các List khác) — cùng pattern, cần verify riêng.
