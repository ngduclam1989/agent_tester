---
name: testcase-generator
description: >
  Công cụ sinh kịch bản/ca kiểm thử (testcase-generator) - Tự động sinh các ca kiểm thử chức năng dựa trên tài liệu yêu cầu (PRD).

  **Năng lực cốt lõi**: Hỗ trợ đầu vào PRD (Word/Markdown/PDF), chỉ xuất định dạng Excel, bao phủ nhiều loại kiểm thử (chức năng/biên/ngoại lệ), sàng lọc kịch bản kiểm thử thông minh (tích cực/tiêu cực).

  **Từ khóa kích hoạt**:
  - Nhóm sinh mới: "生成测试用例"、"创建用例"、"输出测试用例", "sinh testcase", "tạo testcase", "xuất testcase"
  - Nhóm sàng lọc: "只要正向"、"不要异常"、"只要功能测试", "chỉ testcase tích cực", "chỉ luồng chính", "chỉ testcase chức năng", "không lấy ngoại lệ"
---

# Công cụ sinh kịch bản/ca kiểm thử

## Tài liệu tham khảo nhanh

### Định dạng đầu ra

Chỉ xuất định dạng Excel (file `.xlsx`), trực tiếp tạo file Excel chứa các kịch bản kiểm thử.

### Sàng lọc loại kịch bản kiểm thử

| Từ khóa lọc | Hiệu quả |
|-------|------|
| "只要正向" (Chỉ tích cực), "正向用例" (Testcase tích cực) | Chỉ sinh các ca kiểm thử luồng chính/tích cực (positive test cases) |
| "不要异常" (Không lấy ngoại lệ), "不要反向" (Không lấy tiêu cực) | Loại trừ các ca kiểm thử ngoại lệ/tiêu cực (negative test cases) |
| "只要功能" (Chỉ chức năng) | Chỉ sinh các ca kiểm thử chức năng (functional test cases) |

### Nhận diện loại đầu vào

| Loại | Định dạng hỗ trợ |
|------|---------|
| Tài liệu PRD | `.docx`, `.md`, `.txt`, `.pdf` |
| Bản vẽ thiết kế | `.png`, `.jpg` (cần đi kèm mô tả văn bản) |
| Tài liệu trực tuyến | Bất kỳ URL nào có thể truy cập |

---

## Các tính năng cốt lõi

### 1. Phân tích đầu vào thông minh

Tự động nhận diện loại tài liệu đầu vào và trích xuất các yêu cầu tính năng.

### 2. Khía cạnh bao phủ kiểm thử

| Loại kiểm thử | Nội dung bao phủ |
|------|---------|
| Kiểm thử tích cực (Positive) | Xác thực luồng nghiệp vụ cốt lõi |
| Kiểm thử tiêu cực (Negative) | Nhập liệu bất thường, xử lý lỗi |
| Kiểm thử giá trị biên (Boundary) | Biên nhập liệu, biên điều kiện |
| Phân vùng tương đương (Equivalence) | Phân nhóm hợp lý các dữ liệu kiểm thử |
| Kiểm thử kịch bản (Scenario) | Luồng nghiệp vụ liên module, kịch bản liên kết nhiều module |
| Kiểm thử phân quyền (Security/Auth) | Truy cập chưa xác thực, vượt quyền, xác thực vai trò & quyền hạn |
| Kiểm thử ngoại lệ mạng (Network) | Mất mạng, hết thời gian (timeout), môi trường mạng yếu |
| Kiểm thử đồng thời (Concurrency) | Gửi trùng lặp, tranh chấp tài nguyên đồng thời, race conditions |

### 3. Quy chuẩn các trường dữ liệu

**Các trường tiêu chuẩn**:

| Trường | Bắt buộc | Giải thích |
|------|-----|------|
| Mã testcase | ✓ | Định dạng: TC_Module_STT, ví dụ: TC_LOGIN_001 |
| Phân hệ/Module | ✓ | Module chứa testcase này |
| Tiêu đề testcase | ✓ | Mô tả ngắn gọn điểm kiểm thử |
| Loại testcase | ✓ | Kiểm thử chức năng / kiểm thử biên / kiểm thử ngoại lệ |
| Độ ưu tiên | ✓ | P0/P1/P2 |
| Điều kiện tiên quyết | ✓ | Điều kiện cần thỏa mãn trước khi thực hiện |
| Các bước thực hiện | ✓ | Mô tả từng bước thao tác |
| Kết quả mong muốn | ✓ | Hành vi mong đợi ứng với từng bước |

### 4. Định nghĩa độ ưu tiên

| Độ ưu tiên | Tỷ lệ | Định nghĩa |
|-------|------|------|
| P0 | 10-25% | Tính năng cốt lõi, luồng chính |
| P1 | 30-60% | Tính năng quan trọng, kịch bản phổ biến |
| P2 | 10-25% | Tính năng phụ, kịch bản đặc thù/ngoại lệ |

---

## Luồng công việc

```
1. Phân tích tài liệu đầu vào → Nhận diện loại tài liệu
2. Trích xuất yêu cầu tính năng → Nhận diện các trường dữ liệu và quy tắc nghiệp vụ
3. Sinh các kịch bản kiểm thử → Áp dụng các phương pháp thiết kế testcase
4. Đảm bảo độ bao phủ đầy đủ → Tích cực + Ngoại lệ + Biên + Phân quyền + Mạng + Đồng thời
5. Xuất file Excel → Trực tiếp sinh file định dạng .xlsx
```

### Quy trình xuất file Excel

Khi số lượng testcase lớn (nhiều hơn 10 ca), sử dụng file trung gian để tránh vượt quá giới hạn độ dài đầu ra:

```
1. Sinh mảng kịch bản kiểm thử dạng JSON
2. Sử dụng write_to_file() lưu vào file JSON tạm thời (ví dụ: testcases.json)
3. Sử dụng execute_command() gọi script để chuyển đổi định dạng
```

**Gọi script**:
```bash
python scripts/write_excel_from_json.py --data testcases.json --output output.xlsx
```

**Yêu cầu định dạng JSON**:
```json
{
  "testcases": [
    {
      "case_id": "TC_LOGIN_001",
      "module": "Phân hệ Đăng nhập",
      "case_name": "Tiêu đề testcase",
      "case_type": "Kiểm thử chức năng",
      "priority": "P0",
      "precondition": "Điều kiện tiên quyết",
      "test_steps": "Các bước thực hiện",
      "expected_result": "Kết quả mong muốn",
      "remark": "Ghi chú"
    }
  ]
}
```

---

## Hỗ trợ Template (Mẫu)

### File Template

Thư mục `.agent/skills/testcase-generator/assets/` đã được thiết lập sẵn các template tiêu chuẩn:

| File Template | Mục đích sử dụng |
|---------|------|
| `Bản_mẫu_testcase.xlsx` | File Excel mẫu cho testcase chức năng tiêu chuẩn |
| `template-config.json` | Định nghĩa cấu hình template |

### Cách sử dụng

Khi xuất file Excel, sử dụng file `.agent/skills/testcase-generator/assets/Bản_mẫu_testcase.xlsx` làm chuẩn định dạng.

---

## Thư viện phụ thuộc

Đảm bảo môi trường Python cục bộ đã cài đặt các thư viện sau:

| Tên thư viện | Lệnh cài đặt |
|-----|---------|
| `openpyxl` | `pip install openpyxl` |
| `python-docx` | `pip install python-docx` |
| `pypdf` | `pip install pypdf` |
| `markdown` | `pip install markdown` |

**Chạy script**:
```bash
python .agent/skills/testcase-generator/scripts/write_excel_from_json.py --data testcases.json --output output.xlsx
```

---

## Tài liệu tham khảo

Để xem chi tiết tiêu chuẩn và phương pháp luận, vui lòng tham khảo:

| Tài liệu | Giải thích |
|------|------|
| `references/testcase-standard.md` | Tiêu chuẩn thiết kế ca kiểm thử chức năng |

---

## Ví dụ thực tế

### Ví dụ 1: Sinh Excel từ PRD

Sinh testcase cho module Đăng nhập dựa trên PRD:

1. Phân tích nội dung PRD, nhận diện yêu cầu chức năng của module Đăng nhập.
2. Sinh các ca kiểm thử chức năng (chủ yếu là luồng tích cực).
3. Gọi `.agent/skills/testcase-generator/scripts/write_excel_from_json.py` để xuất ra file Excel.
4. Đầu ra: `Testcase_Module_Dang_Nhap.xlsx` (Bảng tính Excel chứa các ca kiểm thử)

---

## Lưu ý quan trọng

1. **Chất lượng tài liệu**: Tài liệu đầu vào càng đầy đủ và chi tiết thì testcase sinh ra càng chính xác.
2. **Đánh giá thủ công**: Khuyến nghị rà soát và đánh giá thủ công các chi tiết nghiệp vụ sau khi sinh testcase.
3. **Giới hạn trường dữ liệu**: Nếu có tài liệu giới hạn trường dữ liệu, vui lòng cung cấp cùng lúc.
4. **Sàng lọc testcase**: Sử dụng các từ khóa kích hoạt để kiểm soát chính xác các loại testcase được sinh ra.
