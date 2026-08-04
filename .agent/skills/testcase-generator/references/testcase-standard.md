# Tiêu chuẩn thiết kế ca kiểm thử chức năng (Functional Testcase)

## Tổng quan

Tài liệu này định nghĩa tiêu chuẩn sinh các ca kiểm thử (testcase) chức năng, nhằm đảm bảo độ bao phủ kiểm thử đầy đủ, diễn đạt rõ ràng và có tính thực thi cao.

## Cấu trúc ca kiểm thử

### Các trường bắt buộc

| Trường | Giải thích | Ví dụ |
|------|------|------|
| Mã testcase | Mã định danh duy nhất, sử dụng định dạng TC_Module_STT | TC_LOGIN_001 |
| Phân hệ/Module | Module chức năng chứa testcase | Module Đăng nhập |
| Tiêu đề testcase | Mô tả ngắn gọn điểm kiểm thử | Tên đăng nhập đúng, mật khẩu đúng, đăng nhập thành công |
| Loại testcase | Kiểm thử chức năng / kiểm thử biên / kiểm thử ngoại lệ | Kiểm thử chức năng |
| Độ ưu tiên | P0/P1/P2 | P0 |
| Điều kiện tiên quyết | Các điều kiện bắt buộc phải thỏa mãn trước khi thực hiện test | 1. Người dùng đã đăng ký tài khoản<br>2. Người dùng đã mở trang đăng nhập |
| Các bước thực hiện | Mô tả chi tiết từng bước thao tác | 1. Nhập tên đăng nhập: test<br>2. Nhập mật khẩu: 123456<br>3. Click nút "Đăng nhập" |
| Kết quả mong muốn | Hành vi mong đợi tương ứng với từng bước | 1. Ô nhập liệu hiển thị đúng nội dung đã nhập<br>2. Mật khẩu hiển thị dạng ký tự ẩn ***<br>3. Trang web chuyển hướng đến Trang chủ |

## Khía cạnh bao phủ kiểm thử

### 1. Kiểm thử chức năng tích cực (Positive Functional Testing)

Xác thực luồng hoạt động bình thường của các chức năng nghiệp vụ cốt lõi.

**Kịch bản ví dụ**:
- Người dùng có thể đăng ký, đăng nhập, đăng xuất bình thường.
- Dữ liệu được lưu trữ và hiển thị chính xác.
- Luồng nghiệp vụ được hoàn thành trơn tru.

### 2. Kiểm thử chức năng tiêu cực (Negative Functional Testing)

Xác thực khả năng xử lý lỗi và các tình huống bất thường.

**Các điểm cần bao phủ**:
- Bỏ trống đầu vào / Chuỗi rỗng.
- Nhập liệu quá dài.
- Ký tự đặc biệt (SQL Injection, XSS).
- Sai định dạng đầu vào (email, số điện thoại, v.v.).
- Thao tác trùng lặp (gửi trùng lặp, đăng nhập trùng lặp).
- Thao tác đồng thời.

### 3. Kiểm thử giá trị biên (Boundary Value Testing)

Kiểm thử tại các điểm biên và điều kiện giới hạn.

**Các loại biên**:
- Biên số học: Giá trị tối thiểu, tối đa, (tối thiểu - 1), (tối đa + 1).
- Biên ký tự: Bỏ trống, 1 ký tự, quá dài (độ dài tối đa + 1).
- Biên thời gian: Thời gian sớm nhất, muộn nhất, thời gian hết hạn.
- Biên số lượng: 0, 1, số lượng tối đa, (số lượng tối đa + 1).

### 4. Phân vùng tương đương (Equivalence Partitioning)

Phân chia dữ liệu đầu vào thành các nhóm hợp lý, chọn ra dữ liệu đại diện cho mỗi nhóm.

**Nguyên tắc phân chia**:
- Vùng tương đương hợp lệ: Dữ liệu tuân thủ đúng quy tắc.
- Vùng tương đương không hợp lệ: Dữ liệu vi phạm quy tắc.

**Ví dụ** (Xác thực mật khẩu):
| Vùng tương đương | Dữ liệu mẫu | Kết quả mong đợi |
|--------|---------|---------|
| Hợp lệ - Đúng quy tắc | Test123456 | Thành công |
| Không hợp lệ - Quá ngắn | Test12 | Thông báo mật khẩu quá ngắn |
| Không hợp lệ - Quá đơn giản | testtesttest | Thông báo mật khẩu không đủ độ mạnh |
| Không hợp lệ - Chứa khoảng trắng | Test 1234 | Thông báo định dạng lỗi |

### 5. Kiểm thử luồng và trạng thái (State & Flow Testing)

Xác thực chuyển đổi trạng thái và luồng nghiệp vụ.

**Trọng tâm cần lưu ý**:
- Định nghĩa trạng thái có rõ ràng không.
- Điều kiện chuyển đổi trạng thái có chính xác không.
- Việc chuyển đổi trạng thái bất hợp lý có bị chặn chính xác không.
- Luồng nghiệp vụ có toàn vẹn không.

**Ví dụ** (Máy trạng thái của đơn hàng):
- Chờ thanh toán → Đã thanh toán → Đã giao hàng → Đã nhận hàng → Hoàn thành.
- Chờ thanh toán → Đã hủy.
- Đã giao hàng → Đang trả hàng → Đã trả hàng.

### 6. Kiểm thử kịch bản (Scenario Testing)

Kiểm thử đầu-cuối (End-to-End) dựa trên kịch bản sử dụng thực tế của người dùng.

**Các yếu tố của kịch bản**:
- Vai trò: Loại người dùng.
- Mục tiêu: Người dùng muốn hoàn thành việc gì.
- Các bước: Đường dẫn để hoàn thành mục tiêu.
- Kết quả mong muốn: Kết quả kỳ vọng.

**Ví dụ**:
| Kịch bản | Vai trò | Các bước | Kết quả mong muốn |
|------|------|------|------|
| Luồng mua sắm thông thường | Người dùng thường | Duyệt hàng → Thêm vào giỏ hàng → Thanh toán → Trả tiền → Xem đơn hàng | Tạo đơn hàng thành công |
| Sử dụng mã giảm giá | Người dùng thường | Chọn sản phẩm → Áp mã giảm giá → Thanh toán → Trả tiền | Khấu trừ đúng số tiền giảm giá |

### 7. Kiểm thử phân quyền (Security & Authorization Testing)

Xác thực việc kiểm soát quyền hạn của người dùng có chính xác hay không.

**Các điểm cần bao phủ**:
- Truy cập chưa xác thực: Người dùng chưa đăng nhập cố tình truy cập các trang hoặc API cần quyền.
- Vượt quyền: Người dùng quyền thấp thực hiện các thao tác của quyền cao (ví dụ: người dùng thường cố xóa dữ liệu).
- Quyền theo vai trò: Các vai trò khác nhau truy cập đúng phạm vi tính năng tương ứng.
- Thay đổi quyền hạn: Quyền hạn thay đổi có hiệu lực ngay lập tức.
- Quyền hiển thị trang: Kiểm soát việc ẩn/hiển thị menu, nút bấm, liên kết.

**Ví dụ**:
| Kịch bản | Vai trò | Thao tác | Kết quả mong muốn |
|------|------|------|------|
| Truy cập chưa đăng nhập | Khách vãng lai | Truy cập trực tiếp trang danh sách người dùng | Chuyển hướng về trang đăng nhập |
| Vượt quyền ngang/dọc | Người dùng thường | Cố truy cập trang quản trị hệ thống | Báo lỗi không có quyền truy cập |
| Quyền theo vai trò | Admin | Truy cập module quản lý thành viên | Truy cập bình thường |
| Thay đổi quyền hạn | Admin | Thu hồi quyền của một người dùng | Người dùng đó lập tức mất quyền thao tác |

### 8. Kiểm thử ngoại lệ mạng (Network Exception Testing)

Xác thực hành vi của hệ thống khi mạng gặp sự cố.

**Các điểm cần bao phủ**:
- Mất kết nối mạng: Thao tác sau khi mất mạng không gây treo ứng dụng, dữ liệu nhập không bị mất.
- Yêu cầu timeout: Xử lý lỗi khi yêu cầu gọi API vượt quá thời gian phản hồi.
- Chuyển đổi mạng: Độ ổn định khi chuyển đổi qua lại giữa WiFi ↔ Mạng di động (3G/4G/5G).
- Môi trường mạng yếu (2G/3G yếu): Tải chậm, cơ chế tự động thử lại (retry).

**Ví dụ**:
| Kịch bản | Thao tác | Kết quả mong muốn |
|------|------|------|
| Mất mạng khi submit | Tắt mạng rồi click nút Gửi | Báo lỗi kết nối mạng, giữ nguyên dữ liệu đã nhập |
| Yêu cầu bị timeout | API quá thời gian quy định không phản hồi | Báo lỗi kết nối hết hạn, cho phép thử lại |
| Load mạng yếu | Tải danh sách trong điều kiện mạng yếu | Hiển thị thanh tiến trình load hoặc thông báo quá hạn |

### 9. Kiểm thử đồng thời (Concurrency Testing)

Xác thực tính nhất quán dữ liệu và độ ổn định của hệ thống trong kịch bản đồng thời.

**Các điểm cần bao phủ**:
- Gửi trùng lặp: Click nhanh liên tiếp nút Gửi dẫn đến việc ghi nhận nhiều lần.
- Mua hàng đồng thời: Nhiều người cùng tranh chấp một lượng tồn kho có hạn.
- Tranh chấp dữ liệu: Nhiều người cùng chỉnh sửa một bản ghi dữ liệu tại một thời điểm.
- Xung đột trạng thái: Thao tác đồng thời dẫn đến trạng thái không nhất quán.

**Ví dụ**:
| Kịch bản | Thao tác | Kết quả mong muốn |
|------|------|------|
| Gửi trùng lặp | Nhấp nhanh nút submit 2 lần | Chỉ ghi nhận và thực hiện submit 1 lần |
| Mua hàng đồng thời | 100 người cùng click mua 1 sản phẩm cuối | Chỉ có duy nhất 1 người mua thành công |
| Sửa đổi dữ liệu | Hai người cùng sửa một biểu mẫu | Người submit sau nhận thông báo dữ liệu đã thay đổi |

## Quy chuẩn diễn đạt

### Quy chuẩn mô tả các bước thực hiện

1. **Rõ ràng và cụ thể**: Mỗi bước chỉ mô tả một hành động thao tác.
2. **Có khả năng thực thi**: Các bước phải có thể thao tác trực tiếp trên giao diện/hệ thống.
3. **Có kết quả mong muốn tương ứng**: Mỗi bước cần có kết quả kỳ vọng rõ ràng.
4. **Tính độc lập**: Các bước thực hiện tương đối độc lập với nhau.

### Các mẫu diễn đạt phổ biến

**Nhóm thao tác**:
- Click nút "XXX"
- Nhập "XXX" vào ô nhập liệu XXX
- Chọn tùy chọn "XXX"
- Tích chọn / Bỏ tích chọn checkbox "XXX"
- Lựa chọn "XXX" từ menu thả xuống (dropdown)
- Nhấn giữ phần tử "XXX"

**Nhóm kiểm chứng**:
- Trang web chuyển hướng đến XXX
- Hiển thị hộp thoại thông báo "XXX"
- Hiển thị thông báo lỗi "XXX"
- Nút "XXX" chuyển sang trạng thái khả dụng (enable) / vô hiệu hóa (disable)
- Danh sách XXX hiển thị N bản ghi

### Các điểm cần tránh

1. ❌ Tránh mô tả mơ hồ: "Nhập thông tin đúng", "Click xác nhận".
2. ❌ Tránh các bước nhảy cóc: "Đăng nhập trực tiếp" thay vì "Nhập tài khoản, mật khẩu rồi click Đăng nhập".
3. ❌ Tránh gộp các bước: Tách riêng mỗi hành động thao tác thành một bước.
4. ❌ Tránh các bước lặp: Không viết "Lặp lại các bước trên".

## Nguyên tắc phân chia độ ưu tiên

| Độ ưu tiên | Kịch bản áp dụng | Tỷ lệ khuyến nghị |
|-------|---------|---------|
| P0 | Tính năng cốt lõi, luồng cơ bản, luồng chính | 20-25% |
| P1 | Tính năng quan trọng, kịch bản nghiệp vụ phổ biến | 30-60% |
| P2 | Tính năng phụ, kịch bản đặc thù hoặc ngoại lệ | 10-25% |

## Danh sách kiểm tra chất lượng (QA Checklist)

Sau khi sinh các ca kiểm thử chức năng, hãy tự kiểm tra lại các điểm sau:

- [ ] Mỗi testcase P0 đều có đầy đủ các ca kiểm thử luồng tích cực và tiêu cực.
- [ ] Các giá trị biên đã được bao phủ đầy đủ.
- [ ] Phân vùng tương đương được phân chia hợp lý.
- [ ] Các bước kiểm thử có tính thực thi cao.
- [ ] Kết quả mong đợi rõ ràng và kiểm chứng được.
- [ ] Không có testcase trùng lặp.
- [ ] Phân chia độ ưu tiên hợp lý.