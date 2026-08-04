# BUGFIX — BUG-W03-175

> [Import sản phẩm][Tải file lỗi] File tải về gồm cả bản ghi hợp lệ — vi phạm AC-9 (chỉ được chứa dòng lỗi)
> Severity: **P2** · Boundary: `garage-web` · Status: **FIX_DONE** · Date: 2026-07-07

## 1. Summary

Nút "Tải file lỗi" build file `.xlsx` client-side từ mảng `dataWithErrors` (đầy đủ cả dòng hợp lệ + dòng lỗi) mà không filter, khiến file tải về chứa cả bản ghi đã import thành công.

## 2. Root cause

`handleDownloadWithErrors` (`src/features/inventory-catalog/internal-product/helper/import.ts`) nhận tham số `dataWithErrors` và ghi nguyên mảng vào workbook, không filter theo `row.error`. Một trong hai callsite tại `components/import/index.tsx` (nút "Tải file lỗi" ở màn preview trước khi xác nhận) truyền thẳng biến `dataWithErrors` chưa filter; callsite khác (màn "Kết quả import danh mục") đã tự filter đúng ở tầng gọi (`errorRowsForDownload`), nhưng helper vẫn không có safety-net nào nếu caller quên filter.

## 3. Fix

`src/features/inventory-catalog/internal-product/helper/import.ts`: thêm `const errorRows = dataWithErrors.filter((row) => Boolean(row.error));` ngay đầu `handleDownloadWithErrors` và dùng `errorRows` cho toàn bộ phần ghi workbook. Fix tại tầng helper (single source of truth) đảm bảo đúng AC-9 bất kể callsite nào gọi (cả màn preview và màn kết quả).

## 4. Verify

- Test mới `handleDownloadWithErrors > only writes rows that have an error` (`helper/__tests__/import.test.ts`) — dựng 3 rows (2 valid + 1 error), verify workbook xuất ra chỉ có header + 1 data row đúng row lỗi.
- `yarn vitest run src/features/inventory-catalog/internal-product/helper/__tests__/import.test.ts` — 16/16 pass.
- Manual: import file mixed (valid + error) → tải file lỗi ở cả 2 màn (preview + kết quả) → file chỉ chứa dòng lỗi.

## 5. Blast radius / regression risk

- Thay đổi trong hàm shared duy nhất dùng bởi cả 2 callsite trong `components/import/index.tsx` — không có callsite khác (`grep handleDownloadWithErrors` chỉ match file import nội bộ này + `customers/helper/index.ts` là hàm riêng biệt không liên quan).
- Không đổi signature/behavior khi input đã pre-filter (double-filter vô hại).
