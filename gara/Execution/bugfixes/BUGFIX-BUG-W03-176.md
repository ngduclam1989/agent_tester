# BUGFIX — BUG-W03-176

> [Import sản phẩm][Tải file lỗi] Format không đồng nhất — vỡ style từ dòng 11 trở đi + cột "Lỗi" không style theo header khác
> Severity: **P3** · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

File "Tải file lỗi" clone template `.xlsx` chỉ có 10 dòng data pre-styled (border + font Times New Roman size 12) + 9 cột gốc (A-J) đã style header nền `#8DB4E2`. Dòng thứ 11+ và cột "Lỗi" (K, mới thêm ngoài template) ghi giá trị nhưng không set style tường minh → rơi về style mặc định (không border/font khác).

## 2. Root cause

`handleDownloadWithErrors` chỉ set `.value` cho mỗi cell khi ghi data rows và header cột "Lỗi", dựa vào cell style kế thừa sẵn có trong template. Template gốc (`public/templates/cat-prod-import-template.xlsx`, xác nhận qua ExcelJS) chỉ pre-style row 1 (header) + row 2-11 (10 data rows) × cột A-J — không có gì để kế thừa cho row 12+ hoặc cột K.

## 3. Fix

`src/features/inventory-catalog/internal-product/helper/import.ts`: định nghĩa 3 style constant dùng chung (`IMPORT_ERROR_FILE_FONT`, `IMPORT_ERROR_FILE_BORDER`, `IMPORT_ERROR_FILE_HEADER_FILL` — giá trị match style gốc template đã đọc qua ExcelJS: font Times New Roman size 12, border thin 4 cạnh, fill `#8DB4E2` cho header). Áp dụng tường minh cho:
- Header cột "Lỗi" (K1): font + fill + border + alignment center/middle.
- MỌI data row (không phụ thuộc số dòng, loop `for (col = 1; col <= 11; col++)`): font + border cho từng cell.

## 4. Verify

- Test mới `handleDownloadWithErrors > applies consistent border/font style beyond the 10-row template boundary` — dựng 15 error rows, verify row 16 (dòng data thứ 15, vượt phạm vi 10 dòng pre-style) có border + font đúng.
- Test mới `handleDownloadWithErrors > styles the 'Lỗi' header column consistently with the other headers` — verify header K có `fill` đúng `#8DB4E2`.
- `yarn vitest run src/features/inventory-catalog/internal-product/helper/__tests__/import.test.ts` — 16/16 pass.
- Manual: import file 20+ dòng mixed → tải file lỗi → mở file, verify style đồng nhất toàn bộ dòng + header "Lỗi" style giống 9 cột khác.

## 5. Blast radius / regression risk

- Cùng hàm/file với BUG-W03-175 — fix chung 1 cycle không tạo conflict (filter rows trước, style sau, độc lập nhau).
- Không regression nội dung dữ liệu — chỉ thêm style, không đổi `.value` logic.
