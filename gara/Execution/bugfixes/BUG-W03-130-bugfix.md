# BUGFIX — BUG-W03-130

> [Danh sách sản phẩm][Filter "Nhóm hàng"] Dropdown liệt kê CẢ nhóm INACTIVE
> Severity: P2 · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-03

## Summary

Filter dropdown "Nhóm hàng" trên trang Danh sách sản phẩm liệt kê cả nhóm VTHH đã Ngừng hoạt động (INACTIVE) do call `useSearchMaterialGroups` thiếu param `status: ACTIVE`.

## Root cause

`InternalProductListPage.tsx` gọi `useSearchMaterialGroups({ keyword })` không truyền `status`. BFF mặc định trả cả ACTIVE + INACTIVE → dropdown hiện nhóm không hợp lệ cho filter.

## Files changed

- `src/features/inventory-catalog/internal-product/components/InternalProductListPage.tsx` — import `MaterialGroupStatus`; thêm `status: MaterialGroupStatus.ACTIVE` vào input `useSearchMaterialGroups`.

## Verify

1. Tạo 1 nhóm INACTIVE.
2. Mở Danh sách sản phẩm → filter "Nhóm hàng" → gõ mã nhóm INACTIVE → không hiển thị.
3. Gõ mã ACTIVE → hiển thị đúng, chọn filter apply OK.
4. Regression: dropdown "Nhóm vật tư/hàng hóa" trong form Create/Edit product không phá.

## Follow-up

Audit dropdown "Thuộc nhóm" trong `MaterialGroupListPage` — cùng pattern, cần verify riêng (không nằm trong scope bug này).
