# Thư viện quy tắc đoán nhận (Assert)

## Đoán nhận mặc định

Tất cả các ca kiểm thử API mặc định bao gồm các đoán nhận sau:

| Mục đoán nhận | Mô tả |
|-------|------|
| Mã trạng thái HTTP | Tự động suy luận dựa trên phương thức (POST → 201, DELETE → 204, GET/PUT/PATCH → 200) |
| Content-Type | Xác thực Content-Type của phản hồi khớp với khai báo Produces trong API |
| Thời gian phản hồi | Tùy chọn: Thời gian phản hồi < 5 giây (ngưỡng hiệu năng cơ bản) |

## Các mẫu đoán nhận nghiệp vụ

### API Tạo mới (POST)

**Mục tiêu**: Xác thực tài nguyên được tạo thành công và dữ liệu được lưu trữ chính xác.

| Điểm đoán nhận | Ví dụ |
|-------|------|
| Mã trạng thái 201/200 | `assert response.status_code == 201` |
| Phản hồi chứa trường id | `assert 'id' in response.json()` |
| Khớp các trường quan trọng với yêu cầu | `assert response.json()['name'] == payload['name']` |
| Kiểm tra lại bằng API GET | Gọi API GET truy vấn tài nguyên vừa tạo, xác nhận nó tồn tại và các trường dữ liệu khớp nhau |
| Kiểm tra trong danh sách | Gọi API GET danh sách (LIST), xác nhận mảng trả về có chứa tài nguyên vừa tạo |

### API Truy vấn (GET)

**Mục tiêu**: Xác thực API truy vấn trả về đúng dữ liệu.

| Điểm đoán nhận | Ví dụ |
|-------|------|
| Mã trạng thái 200 | `assert response.status_code == 200` |
| Phản hồi không trống | `assert response.json() is not None` |
| Tồn tại các trường quan trọng | `assert 'id' in data and 'name' in data` |
| Đúng kiểu dữ liệu | `assert isinstance(data['id'], (int, str))` |
| Phân trang danh sách đúng | `assert len(data['items']) <= page_size` |

### API Cập nhật (PUT/PATCH)

**Mục tiêu**: Xác thực cập nhật tài nguyên thành công và thay đổi có hiệu lực.

| Điểm đoán nhận | Ví dụ |
|-------|------|
| Mã trạng thái 200 | `assert response.status_code == 200` |
| Trường phản hồi được cập nhật | `assert response.json()['status'] == 'updated'` |
| Kiểm tra lại bằng API GET | Gọi API GET truy vấn tài nguyên, xác nhận giá trị trường đã thay đổi |
| Các trường không cập nhật được giữ nguyên | `assert response.json()['id'] == original_id` |

### API Xóa (DELETE)

**Mục tiêu**: Xác thực xóa tài nguyên thành công và không thể truy cập lại.

| Điểm đoán nhận | Ví dụ |
|-------|------|
| Mã trạng thái 200/204 | `assert response.status_code in (200, 204)` |
| Kiểm tra lại bằng API GET trả về 404 | Gọi API GET truy vấn tài nguyên, xác nhận trả về 404 hoặc Not Found |
| Danh sách không còn chứa tài nguyên đã xóa | Gọi API GET danh sách (LIST), xác nhận mảng trả về không chứa tài nguyên đó |

### API Xác thực (Login/Auth)

**Mục tiêu**: Xác thực đăng nhập thành công và Token hợp lệ.

| Điểm đoán nhận | Ví dụ |
|-------|------|
| Mã trạng thái 200 | `assert response.status_code == 200` |
| Phản hồi chứa Token | `assert 'token' in response.json()` |
| Token không rỗng | `assert len(response.json()['token']) > 0` |
| Sử dụng Token truy cập API bảo mật thành công | Kèm theo Token khi gọi API nghiệp vụ, xác nhận mã trả về là 200 |
| Truy cập không có Token bị từ chối | Không mang theo Token khi gọi API bảo mật, xác nhận mã trả về là 401/403 |

## Các mẫu đoán nhận ngoại lệ

| Kịch bản | Mã trạng thái | Nội dung đoán nhận |
|------|-------|---------|
| Thiếu tham số | 400 | Phản hồi chứa thông tin lỗi chỉ rõ trường bị thiếu |
| Sai kiểu dữ liệu tham số | 400 | Phản hồi chứa thông báo tham số sai định dạng |
| Tài nguyên không tồn tại | 404 | Mã trạng thái 404, phản hồi chứa thông tin Not Found |
| Không có quyền truy cập | 403 | Mã trạng thái 403 (Forbidden) |
| Chưa xác thực | 401 | Mã trạng thái 401 (Unauthorized) |
| Xung đột dữ liệu | 409 | Mã trạng thái 409 (ví dụ: tạo trùng lặp dữ liệu độc nhất) |

## Quy tắc mở rộng

Người dùng có thể mở rộng các đoán nhận bằng cách:
1. Khai báo các đoán nhận tùy chỉnh trong trường mở rộng `x-test-assertions` của Swagger.
2. Cung cấp file `assertion-config.json` để ghi đè lên các quy tắc mặc định.
