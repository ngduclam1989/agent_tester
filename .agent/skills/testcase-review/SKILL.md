---
name: testcase-review
description: "Công cụ đánh giá/thẩm định testcase (testcase-review) - So sánh các ca kiểm thử hiện có với tài liệu yêu cầu (PRD) để phát hiện kịch bản kiểm thử bị thiếu hoặc cần bổ sung. Năng lực cốt lõi: Hỗ trợ phân tích so sánh testcase định dạng Excel với tài liệu yêu cầu định dạng Word/PDF/PRD/Hình ảnh, tự động nhận diện lỗ hổng bao phủ tính năng và đề xuất bổ sung kịch bản kiểm thử. Kịch bản kích hoạt: đánh giá testcase, bổ sung testcase, đối chiếu yêu cầu, kiểm tra tính đầy đủ của testcase, phân tích độ bao phủ yêu cầu, bổ sung điểm kiểm thử, testcase bị thiếu."
---

# Thẩm định ca kiểm thử (Testcase Review)

## Tài liệu tham khảo nhanh

### Nhận diện file đầu vào

| Loại file | Giải thích |
|---------|------|
| Ca kiểm thử (Testcase) | Định dạng `.xlsx` (Excel), dòng đầu tiên bắt buộc là tiêu đề bảng |
| Tài liệu yêu cầu | Các định dạng `.docx` (Word), `.pdf`, `.md`, `.txt`, hoặc hình ảnh (`.png/.jpg`) |

### Nội dung đầu ra

| Loại đầu ra | Giải thích |
|---------|------|
| Testcase bị thiếu | Các điểm tính năng có trong tài liệu yêu cầu nhưng chưa được bao phủ trong testcase |
| Khuyến nghị bổ sung | Danh sách testcase cần bổ sung được phân loại theo module và độ ưu tiên |
| Báo cáo độ bao phủ | Thống kê phần trăm độ bao phủ testcase theo từng module |

---

## Các tính năng cốt lõi

### 1. Phân tích tài liệu

**Phân tích testcase dạng Excel**:
- Đọc file Excel, tự động nhận diện dòng tiêu đề.
- Trích xuất các trường dữ liệu: Mã testcase, Phân hệ/Module, Tiêu đề testcase, Các bước thực hiện, Kết quả mong đợi.
- Nhận diện các nhóm module và phân bổ độ ưu tiên.

**Phân tích tài liệu yêu cầu**:
- **Word (.docx)**: Trích xuất các đoạn văn bản và nội dung bảng biểu.
- **PDF (.pdf)**: Trích xuất nội dung văn bản (sử dụng PyMuPDF).
- **Markdown (.md)**: Phân tích trực tiếp cấu trúc tiêu đề (heading) và các danh sách.
- **Hình ảnh (.png/.jpg)**: Sử dụng mô hình thị giác AI để trích xuất phần mô tả tính năng.

### 2. So sánh và Phân tích

**Tính toán độ bao phủ**:
```
Độ bao phủ của module = (Số điểm tính năng đã bao phủ trong testcase / Tổng số điểm tính năng của module đó trong PRD) × 100%
```

**Nhận diện lỗ hổng (Gaps)**:
- PRD có mô tả tính năng rõ ràng nhưng testcase không có điểm kiểm thử tương ứng.
- Các bước thực hiện trong testcase mâu thuẫn hoặc không khớp với mô tả trong PRD.
- Thiếu các ca kiểm thử cho kịch bản ngoại lệ hoặc điều kiện biên.

### 3. Xuất báo cáo

**Cấu trúc báo cáo thẩm định**:
```
## BÁO CÁO THẨM ĐỊNH TESTCASE

### Tổng quan độ bao phủ
| Module | Số điểm tính năng | Số testcase hiện có | Độ bao phủ |
|-----|-------------|-----------|--------|

### Danh sách testcase bị thiếu
#### [Tên Module]
1. **[Điểm tính năng]** - Giải thích nguyên nhân thiếu
   - Loại testcase khuyến nghị: Kiểm thử chức năng / Kiểm thử biên / Kiểm thử ngoại lệ
   - Độ ưu tiên khuyến nghị: P0/P1/P2

### Khuyến nghị bổ sung khác
...
```

---

## Luồng công việc

```
1. Thu thập file → Xác nhận đường dẫn file testcase (Excel) và tài liệu yêu cầu (PRD)
2. Phân tích testcase → Trích xuất module, tiêu đề testcase, các bước thực hiện từ file Excel
3. Phân tích yêu cầu → Trích xuất các điểm tính năng trong tài liệu yêu cầu
4. Phân tích đối chiếu → So khớp các tính năng với testcase hiện có để tìm lỗ hổng
5. Tạo báo cáo → Xuất báo cáo thẩm định cấu trúc chi tiết
```

---

## Các cách kích hoạt

### Thẩm định đầy đủ (Khuyên dùng)

```
Người dùng: Hãy thẩm định độ bao phủ của các kịch bản kiểm thử hiện tại so với tài liệu yêu cầu
→ Load cùng lúc file Excel testcase và tài liệu PRD
→ Tiến hành đối chiếu phân tích toàn bộ
→ Xuất báo cáo thẩm định đầy đủ
```

### Thẩm định chuyên sâu (Theo phân hệ)

```
Người dùng: Chỉ kiểm tra độ bao phủ testcase của module Đăng nhập
→ Sàng lọc các testcase liên quan đến Đăng nhập
→ Trích xuất yêu cầu của module Đăng nhập
→ Tiến hành phân tích chuyên biệt
```

### Thẩm định đơn tài liệu

```
Người dùng: Kiểm tra xem tài liệu PRD này còn thiếu những testcase nào
→ Chỉ tải lên tài liệu yêu cầu (PRD)
→ Dựa trên nội dung yêu cầu để sinh danh sách testcase khuyến nghị bổ sung
```

---

## Hỗ trợ Script

### scripts/read_excel.py

Đọc file Excel kịch bản kiểm thử và trích xuất dữ liệu cấu trúc:

```bash
python scripts/read_excel.py <duong_dan_file_excel>
```

Đầu ra định dạng JSON:
```json
{
  "modules": ["Đăng nhập", "Đăng ký", "Trang chủ"],
  "testcases": [
    {
      "case_id": "TC_001",
      "module": "Đăng nhập",
      "title": "Đăng nhập thành công với tài khoản và mật khẩu đúng",
      "type": "Kiểm thử chức năng",
      "priority": "P0",
      "steps": "...",
      "expected": "..."
    }
  ]
}
```

### scripts/read_docx.py

Đọc tài liệu yêu cầu Word:

```bash
python scripts/read_docx.py <duong_dan_file_docx>
```

### scripts/read_pdf.py

Đọc tài liệu yêu cầu PDF:

```bash
python scripts/read_pdf.py <duong_dan_file_pdf>
```

---

## Tài liệu tham khảo

Để tìm hiểu chi tiết phương pháp luận đánh giá, vui lòng tham khảo:

| Tài liệu | Giải thích |
|------|------|
| `references/testcase-review-methodology.md` | Tiêu chuẩn và phương pháp luận thẩm định ca kiểm thử |
| `references/coverage-analysis.md` | Hướng dẫn phân tích độ bao phủ và nhận diện lỗ hổng |

---

## Ví dụ thực tế

### Ví dụ 1: Luồng thẩm định đầy đủ

```
Người dùng: Hãy đối chiếu thẩm định giúp tôi testcase hiện có và tài liệu yêu cầu.

AI: Vui lòng cung cấp đường dẫn đến các file sau:
  - File Excel chứa các ca kiểm thử
  - Tài liệu yêu cầu (hỗ trợ .docx / .pdf / .md / Hình ảnh)

Người dùng: File testcase là Testcase_Dang_Nhap.xlsx, tài liệu yêu cầu là PRD.docx

AI:
1. Phân tích Excel testcase → Trích xuất các module: Đăng nhập, Đăng ký, Danh sách thiết bị, Trang chủ
2. Phân tích tài liệu Word → Trích xuất các phân hệ và điểm tính năng chi tiết
3. Đối chiếu phân tích → Module Đăng nhập đạt độ bao phủ 85%, thiếu 2 ca kiểm thử biên
4. Xuất báo cáo thẩm định
```

### Ví dụ 2: Thẩm định chuyên sâu

```
Người dùng: Chỉ kiểm tra tính đầy đủ của các testcase thuộc module Trang chủ.

AI:
1. Sàng lọc các testcase thuộc module Trang chủ
2. Trích xuất các điểm yêu cầu của Trang chủ trong PRD
3. Phân tích độ bao phủ tương ứng
4. Xuất báo cáo thẩm định chuyên sâu cho module Trang chủ
```

---

## Lưu ý quan trọng

1. **Tính toàn vẹn của file**: Đảm bảo dòng đầu tiên của file Excel testcase là dòng tiêu đề, tài liệu yêu cầu chứa mô tả tính năng đầy đủ.
2. **Khớp module**: Tên trường "Phân hệ/Module" trong file Excel cần tương khớp với cấu trúc module trong tài liệu yêu cầu.
3. **Ngưỡng cảnh báo**: Đối với các module có độ bao phủ dưới 70%, khuyến nghị cần tập trung bổ sung gấp.
4. **Tham chiếu độ ưu tiên**: Các testcase độ ưu tiên P0 bắt buộc phải bao phủ toàn bộ luồng nghiệp vụ chính.
