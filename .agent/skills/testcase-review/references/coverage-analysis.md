# Hướng dẫn phân tích độ bao phủ và nhận diện lỗ hổng

## Phương pháp tính độ bao phủ

### Độ bao phủ điểm tính năng (Feature-point Coverage)

```
Độ bao phủ điểm tính năng = (Số điểm tính năng đã bao phủ trong testcase / Tổng số điểm tính năng trong tài liệu yêu cầu) × 100%
```

**Định nghĩa điểm tính năng**:
- Các hạng mục tính năng được liệt kê rõ ràng trong tài liệu yêu cầu (PRD).
- Mỗi đơn vị tính năng/hành động mà người dùng có thể thực hiện.
- Mỗi điểm xác thực quy tắc nghiệp vụ.

### Độ bao phủ phân hệ (Module Coverage)

```
Độ bao phủ phân hệ = (Số testcase hiện có của module / Tổng số điểm tính năng của module đó trong PRD) × 100%
```

## Tiêu chuẩn xếp hạng độ bao phủ

| Xếp hạng | Độ bao phủ | Giải thích |
|------|--------|------|
| Xuất sắc | ≥ 90% | Bao phủ toàn diện, có thể phát hành (go-live) |
| Tốt | 70-89% | Bao phủ cơ bản, rủi ro nhẹ |
| Trung bình | 50-69% | Bao phủ một phần, rủi ro vừa phải |
| Yếu | < 50% | Thiếu sót nhiều, rủi ro cao |

## Thuật toán nhận diện lỗ hổng (Gaps)

### 1. Khớp độ tương đồng văn bản

```python
def match_functionality(case_title: str, requirement_text: str) -> float:
    """
    Tính toán độ tương đồng giữa tiêu đề testcase và mô tả yêu cầu trong PRD.

    Returns:
        Điểm số tương đồng trong khoảng 0.0 - 1.0
    """
    # Sử dụng phương pháp chồng lấp từ khóa hoặc độ tương đồng ngữ nghĩa
    case_keywords = extract_keywords(case_title)
    req_keywords = extract_keywords(requirement_text)
    overlap = len(case_keywords & req_keywords)
    total = len(req_keywords)
    return overlap / total if total > 0 else 0
```

### 2. Ánh xạ cấp phân hệ (Module Mapping)

```
Phân hệ yêu cầu A (trong PRD)
  ├── Điểm tính năng A1
  ├── Điểm tính năng A2
  └── Điểm tính năng A3

Module testcase A (trong file testcase)
  ├── Testcase 1 (bao phủ A1)
  ├── Testcase 2 (bao phủ A2)
  └── Testcase 3 (bao phủ A1, A2)

Chưa bao phủ (Lỗ hổng): A3
```

### 3. Nhận diện mở rộng ngữ nghĩa

Sử dụng đồng nghĩa, gần nghĩa để mở rộng so khớp:

| Từ khóa trong PRD | Cách diễn đạt tương đương trong testcase |
|-----------|-------------|
| Đăng nhập | Đăng nhập hệ thống, log in, sign in, đăng nhập tài khoản |
| Đăng ký | Tạo tài khoản mới, đăng ký tài khoản, sign up |
| Xóa | Gỡ bỏ, loại bỏ, hủy, xóa dữ liệu, delete |
| Sửa đổi | Cập nhật, điều chỉnh, thay đổi thông tin, edit, update |

## Các mẫu lỗ hổng phổ biến (Gap Patterns)

### Mẫu 1: Chưa bao phủ yêu cầu ngầm định

**Cách nhận diện**: Các diễn đạt trong PRD như "hệ thống cần hỗ trợ", "phải có khả năng", "nên được", v.v.

```
Yêu cầu: Hệ thống phải hỗ trợ upload file dung lượng lớn.
Testcase hiện tại: Chỉ có testcase upload file dung lượng nhỏ.
→ Lỗ hổng: Thiếu testcase upload file dung lượng lớn.
```

### Mẫu 2: Chưa bao phủ luồng ngoại lệ

**Cách nhận diện**: Có testcase cho luồng tích cực nhưng hoàn toàn trống kịch bản luồng ngoại lệ.

```
Luồng tích cực: Luồng thanh toán thông thường.
Lỗ hổng:
  - Xử lý khi thanh toán bị gián đoạn.
  - Tự động thử lại khi hết hạn (timeout).
  - Hiển thị thông báo khi thanh toán thất bại.
  - Cơ chế phòng chống thanh toán trùng lặp.
```

### Mẫu 3: Chưa bao phủ kịch bản phân quyền

**Cách nhận diện**: Có kịch bản tính năng nhưng thiếu kịch bản xác thực phân quyền.

```
Tính năng: Xem danh sách thành viên ✓
Phân quyền:
  - Người dùng thường không được phép xem ✗
  - Quản trị viên (Admin) được phép xem ✓
  - Khách vãng lai truy cập bị chặn ✗
```

### Mẫu 4: Chưa bao phủ kịch bản tương thích

**Cách nhận diện**: Có kịch bản kiểm thử chức năng nhưng thiếu kịch bản tương thích.

```
Tính năng Web: Đăng nhập, đăng ký, đăng bài ✓
Tương thích:
  - Tương thích trình duyệt (Chrome/Firefox/Safari) ✗
  - Độ phân giải màn hình khác nhau (1920/1366/1280) ✗
  - Tương thích trên thiết bị di động (Mobile responsive) ✗
```

## Đánh giá độ ưu tiên

### Đánh giá mức độ ảnh hưởng (Impact)

| Mức độ | Giải thích | Ví dụ |
|--------|------|------|
| Cao | Chặn đứng luồng nghiệp vụ cốt lõi | Chức năng đăng nhập hoàn toàn bị lỗi |
| Trung bình | Chức năng bị lỗi một phần | Lỗi tính năng trong một số điều kiện đặc thù |
| Thấp | Lỗi trải nghiệm người dùng (UX/UI) | Giao diện bị lệch nhẹ |

### Đánh giá mức độ khẩn cấp (Urgency)

| Mức độ | Giải thích | Ví dụ |
|--------|------|------|
| Cao | Lỗi đã xuất hiện trên môi trường Production | Có phản hồi thực tế từ người dùng |
| Trung bình | Xác suất xảy ra cao | Các điều kiện biên thường xuyên bị chạm tới |
| Thấp | Xác suất xảy ra cực thấp | Kịch bản ngoại lệ cực kỳ hiếm gặp |

### Ma trận ưu tiên

|  | Ảnh hưởng Thấp | Ảnh hưởng Trung bình | Ảnh hưởng Cao |
|---|---|---|---|
| **Khẩn cấp Cao** | P1 | P0 | P0 |
| **Khẩn cấp Trung bình** | P2 | P1 | P0 |
| **Khẩn cấp Thấp** | P2 | P2 | P1 |

## Cách tạo khuyến nghị bổ sung

### Mẫu trình bày testcase

```markdown
**Bổ sung testcase [TC_XXX]**

| Trường | Nội dung |
|------|------|
| Phân hệ/Module | XXX |
| Tiêu đề testcase | [Mô tả chi tiết điểm kiểm thử] |
| Loại testcase | Kiểm thử chức năng / Kiểm thử biên / Kiểm thử ngoại lệ |
| Độ ưu tiên | P0/P1/P2 |
| Điều kiện tiên quyết | [Các điều kiện cần thỏa mãn trước khi thực hiện] |
| Các bước thực hiện | 1. [Bước 1] 2. [Bước 2] 3. [Bước 3] |
| Kết quả mong muốn | [Hành vi kỳ vọng tương ứng từng bước] |
```

### Ví dụ trích xuất mô tả yêu cầu

Yêu cầu gốc trong PRD:
```
Module quản lý người dùng cần hỗ trợ:
1. Thêm mới người dùng (Bắt buộc: Tên đăng nhập, Số điện thoại)
2. Chỉnh sửa thông tin người dùng
3. Xóa người dùng (yêu cầu phải xác nhận lại)
4. Nhập hàng loạt người dùng từ file Excel (Import Excel)
```

Đề xuất bổ sung testcase:
| Lỗ hổng tính năng | Tiêu đề testcase đề xuất | Độ ưu tiên |
|-----------|-------------|--------|
| Nhập hàng loạt (Import) | Báo lỗi khi file Excel sai định dạng | P1 |
| Nhập hàng loạt (Import) | Xử lý dữ liệu trùng lặp khi import | P1 |
| Xác nhận xóa | Kiểm tra người dùng vẫn tồn tại nếu click Cancel khi xóa | P2 |
| Định dạng SĐT | Chặn và báo lỗi khi SĐT sai định dạng | P1 |
