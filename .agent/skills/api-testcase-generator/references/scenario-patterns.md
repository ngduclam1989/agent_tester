# Các mẫu kịch bản chuỗi API

## Định nghĩa mẫu

Kịch bản chuỗi API là một tập hợp các API được gọi theo trình tự logic nghiệp vụ, dữ liệu giữa các API được truyền qua các biến (như Token, ID, v.v.).

### Quy tắc truyền biến

| Loại biến | Cách truyền | Ví dụ |
|---------|---------|------|
| Token xác thực | Header: Authorization | `Bearer ${token}` |
| ID tài nguyên | Tham số đường dẫn (Path Parameter) | `/users/${user_id}` |
| Tham số truy vấn | Tham số truy vấn (Query Parameter) | `?page=${page}&size=${size}` |
| Dữ liệu liên kết | Tham chiếu trường trong Body | `{"parent_id": "${parent_id}"}` |

## Các mẫu kịch bản nghiệp vụ phổ biến

### 1. Luồng CRUD đầy đủ

**Chuỗi gọi**: Create → Get → Update → Get → Delete → Get(404)

**Kịch bản áp dụng**: Quản lý một tài nguyên đơn lẻ.

**Truyền biến**:
- `Create` trả về `id` → Dùng làm tham số Path cho các bước `Get/Update/Delete`.

**Trọng tâm đoán nhận (Assert)**:
- Sau khi tạo, truy vấn lại phải tồn tại.
- Sau khi cập nhật, truy vấn lại các trường phải thay đổi.
- Sau khi xóa, truy vấn lại phải trả về mã lỗi 404.

### 2. Luồng nghiệp vụ có xác thực

**Chuỗi gọi**: Login → Business API → Logout → Access Denied

**Kịch bản áp dụng**: Luồng nghiệp vụ yêu cầu đăng nhập và phân quyền.

**Truyền biến**:
- `Login` trả về `token` → Gắn vào Header của các yêu cầu tiếp theo.

**Trọng tâm đoán nhận**:
- Đăng nhập thành công và lấy được Token.
- Gọi API nghiệp vụ thành công khi có Token.
- Sau khi đăng xuất, Token mất hiệu lực, truy cập lại phải trả về mã 401.

### 3. Luồng chuẩn bị - kiểm thử - dọn dẹp dữ liệu

**Chuỗi gọi**: Login → Create Test Data → Run Tests → Delete Test Data → Logout

**Kịch bản áp dụng**: Các ca kiểm thử phức tạp yêu cầu phải có dữ liệu chuẩn bị trước (pre-requisite data).

**Truyền biến**:
- `Login` → `token`
- `Create Test Data` → Các ID tài nguyên được tạo
- Các ID tài nguyên được dùng cho các bước kiểm thử và bước xóa dọn dẹp

**Trọng tâm đoán nhận**:
- Dữ liệu được tạo thành công.
- Các bước kiểm thử sử dụng đúng dữ liệu đã chuẩn bị.
- Dữ liệu được dọn dẹp hoàn toàn sau khi kiểm thử (tránh ô nhiễm dữ liệu hệ thống).

### 4. Luồng thao tác hàng loạt

**Chuỗi gọi**: Login → Create A → Create B → Create C → List All → Delete All → Logout

**Kịch bản áp dụng**: Kịch bản quản lý và thao tác với nhiều dữ liệu cùng lúc.

**Trọng tâm đoán nhận**:
- API danh sách (List All) trả về đầy đủ tất cả tài nguyên đã tạo.
- Sau khi xóa hàng loạt (Delete All), tất cả tài nguyên đều không thể truy cập được nữa.

### 5. Luồng chuyển đổi trạng thái

**Chuỗi gọi**: Create → Status:Pending → Approve → Status:Approved → Reject(Thất bại) → Delete

**Kịch bản áp dụng**: Luồng nghiệp vụ có liên quan đến máy trạng thái (state machine) như đơn hàng, quy trình phê duyệt.

**Trọng tâm đoán nhận**:
- Chuyển đổi trạng thái diễn ra chính xác.
- Chuyển đổi trạng thái không hợp lệ bị hệ thống từ chối.

## Cấu hình định dạng kịch bản

Định nghĩa kịch bản tùy chỉnh bằng định dạng JSON:

```json
{
  "scenarios": [
    {
      "name": "user_crud_flow",
      "type": "crud",
      "description": "Luồng CRUD đầy đủ của người dùng",
      "apis": [
        {
          "ref": "createUser",
          "extract": [
            {"from": "response.json().id", "to": "user_id"}
          ]
        },
        {
          "ref": "getUserById",
          "path_params": {
            "id": "${user_id}"
          }
        },
        {
          "ref": "updateUser",
          "path_params": {
            "id": "${user_id}"
          }
        },
        {
          "ref": "deleteUser",
          "path_params": {
            "id": "${user_id}"
          }
        },
        {
          "ref": "getUserById",
          "path_params": {
            "id": "${user_id}"
          },
          "expected_status": 404
        }
      ]
    }
  ]
}
```

## Quy tắc tự động nhận diện

Thứ tự ưu tiên khi Kỹ năng tự động nhận diện các kịch bản:
1. Các phương thức POST → GET → PUT/PATCH → DELETE trên cùng một tài nguyên (resource) được nhận diện là CRUD.
2. API POST có đường dẫn chứa login/auth/token được nhận diện là điểm Đăng nhập.
3. Các API có khai báo `security` sẽ tự động liên kết với kịch bản có xác thực.
4. Response Schema chứa trường `id` và tham số đường dẫn của API tiếp theo có tên tương tự sẽ được nhận diện là quan hệ phụ thuộc truyền biến.
