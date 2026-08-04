# BUGFIX — BUG-W03-177

> [Thêm sản phẩm][Ảnh sản phẩm] Helper text + logic upload sai định dạng — cho phép/ghi nhận nhầm định dạng tài liệu (doc/xlsx/pdf) thay vì ảnh
> Severity: **P2** · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

Field "Ảnh sản phẩm" (Create/Edit sản phẩm) dùng `ACCEPT_ATTR = ".doc,.docx,.jpeg,.jpg,.png,.xlsx,.xlxs,.pdf"` và helper text tương ứng — cả `accept` attribute lẫn text hiển thị đều chấp nhận/ghi định dạng tài liệu (doc/xlsx/pdf), không phải whitelist ảnh.

## 2. Root cause

`ProductImageUpload.tsx` (`src/features/inventory-catalog/internal-product/components/ProductImageUpload.tsx`) định nghĩa `ACCEPT_ATTR`/`SUBTEXT` với danh sách định dạng tài liệu (nghi copy nhầm từ field "Đính kèm file" — cùng form nhưng tab khác). Ngoài helper text sai, `<input accept>` cũng cho phép chọn file doc/xlsx/pdf — không có validate bổ sung nào chặn khi user bypass `accept` (chọn "All files").

## 3. Fix

`src/features/inventory-catalog/internal-product/components/ProductImageUpload.tsx`:
- Đổi `PRODUCT_IMAGE_UPLOAD_EXTENSIONS = [".jpg", ".jfif", ".png", ".heic", ".heif", ".jpeg"]`; `ACCEPT_ATTR`/`SUBTEXT` derive từ constant này.
- Thêm `isAcceptedImageFile(file)` kiểm tra extension (lowercase, `endsWith`) — extension-based (không dựa MIME vì HEIC/HEIF thường có MIME rỗng/sai trên nhiều browser, theo pattern đã dùng ở `employee-form-avatar.tsx`/`quotation-requests/single-image-upload.tsx`).
- Trong `handleFiles`: nếu file không khớp whitelist → `toastCustom({ title: "File không đúng định dạng.", description: SUBTEXT, status: "error" })` và return sớm, không gọi `uploadAttachments`.

`ProductImageUpload` là component dùng chung cho cả Create và Edit (qua `GeneralInfoSection.tsx` — single callsite, đã audit `grep ProductImageUpload`) — fix 1 nơi cover cả 2 màn, không cần sửa riêng Edit.

## 4. Verify

- `npx tsc --noEmit` — pass, không lỗi type trên file.
- `yarn lint` — không warning/error mới trên file.
- Manual: vào Thêm sản phẩm → verify helper text đúng whitelist ảnh; chọn `.jpg`/`.png` → upload OK; chọn `.pdf`/`.docx` (bypass accept qua "All files") → toast lỗi "File không đúng định dạng.", không upload.
- Manual Edit sản phẩm: cùng hành vi (component chung).

## 5. Blast radius / regression risk

- Chỉ 1 file + 1 callsite duy nhất (`GeneralInfoSection.tsx`) — không lan sang field "Đính kèm file" (dùng component khác).
- Không đổi flow upload (`useAttachments`/`FolderTypeEnum.INVENTORY`) — chỉ thêm validate trước khi gọi.
