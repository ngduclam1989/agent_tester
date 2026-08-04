# BUGFIX — BUG-W03-178

> [Danh sách sản phẩm][Bộ lọc Nhóm hàng] "Đặt lại" không reset lại danh sách nhóm bên trong dropdown (giữ nguyên kết quả search cũ)
> Severity: **P3** · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

Filter "Nhóm hàng" (dropdown searchable, `searchMode: "api"`) ở Danh sách sản phẩm: sau khi search + chọn 1 nhóm rồi bấm "Đặt lại", mở lại dropdown vẫn hiển thị options đã lọc hẹp theo keyword search cũ — vì query nguồn options (`useSearchMaterialGroups`) vẫn dùng `materialGroupKeyword` cũ, không được reset.

## 2. Root cause

Nút "Đặt lại" (`src/components/customs/filter/filter-option.tsx` → `onResetFilter`) chỉ gọi `clearMaskFilter(filter.key)` — reset giá trị filter ĐÃ CHỌN (`materialGroupId` mask). Nó không biết về state phụ `materialGroupKeyword` sống ở component cha (`InternalProductListPage.tsx`) dùng để search server-side cho dropdown — `FilterDataType` chưa có cơ chế callback cho case này.

## 3. Fix

- `src/interfaces/filter.ts`: thêm field optional `onReset?: () => void` vào `FilterDataType` (additive, không breaking cho callsite khác chưa dùng).
- `src/components/customs/filter/filter-option.tsx`: `onResetFilter` gọi thêm `filter.onReset?.()` song song với `clearMaskFilter`.
- `src/features/inventory-catalog/internal-product/components/InternalProductListPage.tsx`: filter config `materialGroupId` truyền `onReset: () => setMaterialGroupKeyword("")` (qua `handleMaterialGroupFilterReset`).

## 4. Verify

- `npx tsc --noEmit` — pass.
- `yarn lint` — không lỗi mới trên 3 file đã sửa.
- Manual: mở dropdown "Nhóm hàng" → gõ keyword → chọn 1 nhóm → "Đặt lại" → mở lại dropdown → verify hiển thị full danh sách mặc định (không còn giới hạn theo keyword cũ) + bảng sản phẩm bỏ lọc đúng.

## 5. Blast radius / regression risk

- `FilterDataType.onReset` là field mới optional — các callsite hiện tại (`MaterialGroupListPage.tsx`, `supplier-select.tsx`, v.v. dùng `searchMode: "api"`) không truyền field này nên hành vi giữ nguyên, không regression.
- `filter-option.tsx` (shared component) chỉ thêm 1 dòng gọi callback optional — không đổi flow reset hiện có (`clearMaskFilter` + `applyFilter` + close popover vẫn chạy như trước).
- Không đụng vào picker Create/Edit (khác component/khác state).
