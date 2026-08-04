---
name: api-testcase-generator
description: >
  Công cụ sinh kịch bản/ca kiểm thử tự động cho API - Tự động tạo các ca kiểm thử (testcase) API và kịch bản tự động hóa dựa trên tài liệu Swagger/OpenAPI.

  **Năng lực cốt lõi**: Phân tích Swagger JSON/YAML, tự động phân tích chuỗi phụ thuộc của API, hỗ trợ xuất nhiều định dạng (Pytest/Postman/JMeter/Excel), tích hợp thư viện quy tắc assert (đoán nhận), hỗ trợ sinh testcase theo kịch bản nghiệp vụ.

  **Từ khóa kích hoạt**:
  - "生成接口测试用例"、"API测试"、"Swagger测试"
  - "生成自动化脚本"、"接口场景用例"
  - "根据接口文档生成测试"
  - "Sinh testcase kiểm thử API", "Kiểm thử API", "Test API", "Test Swagger"
  - "Tạo kịch bản tự động hóa API", "Sinh script automation API", "Kịch bản test API"
  - "Tạo testcase từ tài liệu API", "Sinh test từ swagger"
---

# Công cụ sinh kịch bản/ca kiểm thử tự động cho API

## Tài liệu tham khảo nhanh

### Định dạng đầu vào

| Loại | Định dạng hỗ trợ |
|------|---------|
| Swagger/OpenAPI | `.json`, `.yaml`, `.yml` |
| Tài liệu trực tuyến | Bất kỳ URL Swagger nào có thể truy cập |

### Định dạng đầu ra

| Định dạng | Đuôi file | Kịch bản áp dụng |
|------|---------|---------|
| Pytest + Requests | `.py` | Framework kiểm thử tự động Python |
| Postman Collection | `.json` | Kiểm thử thủ công / API nhanh |
| JMeter | `.jmx` | Kiểm thử hiệu năng / API |
| Bảng Excel | `.xlsx` | Đánh giá kịch bản / Quản lý testcase |

### Các loại ca kiểm thử (Testcase)

| Loại | Mô tả |
|------|------|
| Kiểm thử đơn API | Kiểm thử độc lập từng API |
| Kiểm thử chuỗi kịch bản | Kết nối nhiều API theo luồng nghiệp vụ |
| Kiểm thử tích cực (Positive) | Xác thực luồng nghiệp vụ hoạt động bình thường |
| Kiểm thử tiêu cực (Negative) | Tham số lỗi, vượt quyền, quá thời gian (timeout), v.v. |

---

## Các tính năng cốt lõi

### 1. Phân tích Swagger/OpenAPI

Tự động phân tích tài liệu Swagger/OpenAPI để trích xuất:
- Đường dẫn API (Paths) và phương thức HTTP (GET, POST, PUT, DELETE, v.v.)
- Tham số yêu cầu (Query/Body/Path/Header)
- Mã trạng thái phản hồi (Response status code) và Schema
- Phương thức xác thực (Bearer Token, API Key, OAuth2)

### 2. Sinh chuỗi kịch bản nghiệp vụ

**Tự động phân tích**:
- Khớp trường ID trong Response Schema với các tham số đường dẫn (Path parameters) của API tiếp theo để suy ra sự phụ thuộc.
- Nhận diện luồng CRUD (Create → Read → Update → Delete).
- Nhận diện luồng xác thực (Login → Business API → Logout).

**Chỉ định thủ công**:
- Hỏi ý kiến người dùng trong quá trình thực hiện xem có cần bổ sung hoặc điều chỉnh chuỗi kịch bản nghiệp vụ hay không.
- Hỗ trợ người dùng tự định nghĩa thứ tự gọi API và quy tắc truyền dữ liệu giữa các API.

### 3. Chiến lược đoán nhận (Assert)

**Đoán nhận mặc định**:
- Khớp mã trạng thái HTTP (2xx/4xx/5xx).
- Kiểm tra kiểu nội dung phản hồi (Content-Type).

**Thư viện quy tắc đoán nhận nghiệp vụ** (`.agent/skills/api-testcase-generator/references/assertion-rules.md`):
- Tạo tài nguyên → Gọi API truy vấn để xác nhận tài nguyên tồn tại.
- Cập nhật tài nguyên → Gọi API truy vấn để xác nhận trường dữ liệu đã thay đổi.
- Xóa tài nguyên → Gọi API truy vấn để xác nhận tài nguyên không còn tồn tại (404).
- Truy vấn danh sách → Kết quả trả về là một mảng và chứa phần tử vừa thao tác.
- Đăng nhập → Phản hồi chứa Token và các yêu cầu tiếp theo sử dụng token đó được xác thực thành công.

**Đoán nhận tùy chỉnh**:
- Hỗ trợ người dùng mở rộng các quy tắc đoán nhận thông qua các bình luận (comments) hoặc file quy tắc.

### 4. Xuất đa định dạng

Lựa chọn định dạng xuất tùy theo yêu cầu của người dùng hoặc framework sẵn có trong dự án:
- **Pytest**: Tạo mã nguồn Python có thể chạy trực tiếp, hỗ trợ cấu hình `conftest.py`.
- **Postman**: Tạo định dạng Collection v2.1, bao gồm mã kịch bản đoán nhận trong phần Tests.
- **JMeter**: Tạo file JMX, tích hợp các bộ đoán nhận và truyền biến.
- **Excel**: Tạo tài liệu testcase tiêu chuẩn, gồm các bước thực hiện, kết quả mong muốn và độ ưu tiên.

---

## Luồng công việc

```
1. Phân tích Swagger → Trích xuất định nghĩa API và Model Schema
2. Phân tích phụ thuộc → Tự động suy luận chuỗi gọi API
3. Hỏi ý kiến người dùng → Xác nhận/Bổ sung kịch bản và định dạng đầu ra
4. Tải quy tắc đoán nhận → Áp dụng đoán nhận mã trạng thái và nghiệp vụ
5. Sinh ca kiểm thử → Xuất các file theo định dạng đã chọn
```

### Các bước chi tiết

#### Bước 1: Phân tích Swagger

Đọc tài liệu Swagger dạng JSON/YAML hoặc URL do người dùng cung cấp và gọi script để phân tích:

```bash
python .agent/skills/api-testcase-generator/scripts/swagger_parser.py --input swagger.json --output parsed_api.json
```

Kết quả file `parsed_api.json` sẽ chứa:
- Danh sách API (đường dẫn, phương thức, tham số, phản hồi)
- Định nghĩa Model (Schema)
- Quan hệ phụ thuộc được tự động suy luận

#### Bước 2: Phân tích và Tương tác

Sau khi tải `parsed_api.json`, hệ thống sẽ hiển thị cho người dùng:
1. Số lượng API nhận diện được và phân bổ theo module.
2. Chuỗi kịch bản nghiệp vụ tự động suy luận (ví dụ: luồng CRUD, luồng đăng nhập).
3. Hỏi người dùng xem có cần:
   - Điều chỉnh hoặc bổ sung chuỗi kịch bản nghiệp vụ hay không.
   - Chọn định dạng xuất mong muốn (Pytest/Postman/JMeter/Excel).
   - Chỉ định đường dẫn của framework kiểm thử hiện tại (để tương thích).

#### Bước 3: Sinh ca kiểm thử

Sau khi xác nhận yêu cầu, gọi script sinh testcase:

```bash
python .agent/skills/api-testcase-generator/scripts/generate_testcases.py \
  --input parsed_api.json \
  --format pytest \
  --scenarios scenarios.json \
  --output ./api_tests/
```

Giải thích các tham số:
- `--input`: File JSON chứa API đã được phân tích.
- `--format`: Định dạng đầu ra (`pytest`, `postman`, `jmeter`, `excel`).
- `--scenarios`: File JSON cấu hình kịch bản (tùy chọn, mặc định sử dụng kết quả tự động phân tích).
- `--output`: Thư mục lưu kết quả.

---

## Thư viện quy tắc đoán nhận (Assert)

Tham khảo file `.agent/skills/api-testcase-generator/references/assertion-rules.md` để xem toàn bộ quy tắc.

### Các mẫu đoán nhận nghiệp vụ phổ biến

| Loại thao tác | Nội dung đoán nhận |
|---------|---------|
| POST Tạo mới | Mã trạng thái 201/200; Phản hồi chứa các trường đã tạo; Gọi GET để xác nhận tồn tại |
| GET Truy vấn | Mã trạng thái 200; Phản hồi là đối tượng/mảng; Các trường quan trọng không trống |
| PUT/PATCH Cập nhật | Mã trạng thái 200; Các trường phản hồi đã thay đổi; Gọi GET để xác nhận cập nhật |
| DELETE Xóa | Mã trạng thái 200/204; Gọi GET trả về 404 |
| LIST Danh sách | Mã trạng thái 200; Phản hồi là một mảng; Phân trang chính xác |
| LOGIN Đăng nhập | Mã trạng thái 200; Phản hồi chứa token; Sử dụng token để truy cập các API cần bảo mật thành công |

---

## Các mẫu chuỗi kịch bản nghiệp vụ

Tham khảo file `.agent/skills/api-testcase-generator/references/scenario-patterns.md` để xem toàn bộ các mẫu kịch bản nghiệp vụ.

### Các kịch bản phổ biến

| Kịch bản | Ví dụ chuỗi gọi API |
|------|---------|
| Luồng CRUD đầy đủ | Create → Get → Update → Get → Delete → Get(404) |
| Luồng nghiệp vụ có xác thực | Login → Create → List → Logout → AccessDenied (Truy cập bị từ chối) |
| Luồng chuẩn bị và dọn dẹp dữ liệu | Login → CreateData → RunTest → DeleteData → Logout |
| Luồng thao tác hàng loạt | Login → CreateA → CreateB → List → DeleteAll → Logout |

---

## Giải thích về các Script

### swagger_parser.py

Phân tích file Swagger/OpenAPI và xuất cấu trúc JSON.

```bash
python .agent/skills/api-testcase-generator/scripts/swagger_parser.py --input swagger.json --output parsed_api.json
```

### generate_testcases.py

Sinh ra các ca kiểm thử theo định dạng chỉ định dựa trên kết quả phân tích.

```bash
python .agent/skills/api-testcase-generator/scripts/generate_testcases.py \
  --input parsed_api.json \
  --format pytest \
  --output ./output/
```

---

## Tương thích với các Framework hiện có

Nếu dự án của người dùng đã có sẵn framework kiểm thử, Kỹ năng này hỗ trợ:
1. **Chế độ chèn mã nguồn (Code Injection)**: Sinh mã kiểm thử và chèn trực tiếp vào thư mục `tests/` hiện có.
2. **Chế độ file cấu hình (Configuration File)**: Đọc cấu hình từ `pytest.ini` / `conftest.py` / `package.json` để điều chỉnh cho phù hợp.
3. **Chế độ kế thừa lớp cơ sở (Base Class Inheritance)**: Lớp Pytest sinh ra sẽ kế thừa lớp `BaseTest` hiện có của dự án.

Khi tương tác với người dùng sẽ thu thập:
- Loại framework hiện tại (Pytest/Unittest/JMeter/Postman)
- Đường dẫn lớp cơ sở hoặc file cấu hình
- Phương thức xác thực và logic xử lý tập trung

---

## Các thư viện phụ thuộc

Đảm bảo môi trường Python cục bộ đã cài đặt:

| Tên thư viện | Lệnh cài đặt |
|-----|---------|
| `requests` | `pip install requests` |
| `pyyaml` | `pip install pyyaml` |
| `openpyxl` | `pip install openpyxl` |
| `jinja2` | `pip install jinja2` |

---

## Ví dụ thực tế

### Ví dụ 1: Sinh kịch bản Pytest từ Swagger

1. Người dùng cung cấp `swagger.json`.
2. Phân tích và tự động nhận diện chuỗi CRUD.
3. Hỏi người dùng để xác nhận định dạng đầu ra là Pytest.
4. Sinh file `test_user_api.py`:
   - `test_create_user` → Tạo người dùng và đoán nhận mã 201.
   - `test_get_user` → Truy vấn thông tin người dùng và đoán nhận tồn tại.
   - `test_update_user` → Cập nhật thông tin và đoán nhận thay đổi.
   - `test_delete_user` → Xóa người dùng và đoán nhận trả về 404 khi truy vấn lại.
5. Mã nguồn có thể chạy trực tiếp bằng lệnh: `pytest test_user_api.py`.

### Ví dụ 2: Sinh testcase dạng Excel theo kịch bản nghiệp vụ

1. Người dùng cung cấp URL Swagger trực tuyến.
2. Phân tích và nhận diện các module đăng nhập và đơn hàng.
3. Người dùng chỉ định kịch bản thủ công: `Login → CreateOrder → GetOrder → CancelOrder`.
4. Sinh file Excel chứa:
   - Các bước: Thứ tự gọi API.
   - Truyền biến: Hướng dẫn truyền các biến như Token, OrderId.
   - Đoán nhận: Điểm xác thực mã trạng thái và nghiệp vụ cho từng bước.

---

## Các lưu ý quan trọng

1. **Tính đầy đủ của Swagger**: Các trường hoặc phản hồi chưa được định nghĩa rõ ràng trong tài liệu có thể dẫn đến việc sinh ca kiểm thử thiếu thông tin.
2. **Xác thực bảo mật**: Ca kiểm thử được tạo ra sẽ chứa các vị trí giữ chỗ cho phần xác thực, người dùng cần điền Token/Khóa bảo mật thực tế.
3. **Cô lập dữ liệu**: Khuyên dùng dữ liệu độc lập cho mỗi chuỗi kịch bản để tránh xung đột dữ liệu.
4. **Đánh giá thủ công**: Các chuỗi kịch bản nghiệp vụ tự động sinh ra nên được con người xem lại để đảm bảo đúng logic nghiệp vụ.
5. **Cấu hình môi trường**: Kịch bản cần được cấu hình `base_url` và thông tin xác thực trước khi chạy.
