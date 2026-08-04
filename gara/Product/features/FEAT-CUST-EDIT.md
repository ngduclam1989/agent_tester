---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CUSTOMER"
boundary: "gf-customer"
last_reviewed: "2026-05-27"
---

# FEAT-CUST-EDIT: Chỉnh sửa khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CUST-EDIT` |
| Title | Chỉnh sửa khách hàng |
| Parent Epic | `EP-CUSTOMER` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin khách hàng hiện có (thông tin cá nhân, địa chỉ, xe), **so that** hồ sơ khách hàng luôn cập nhật.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa khách hàng
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa khách hàng"** với form đã điền sẵn dữ liệu hiện tại của khách hàng, gồm 3 mục: **"Thông tin cơ bản"**, **"Thông tin địa chỉ"** và **"Thông tin xe"**.

- [ ] **AC-2**: Hiển thị mã khách hàng (chỉ đọc)
  - Tại: form chỉnh sửa khách hàng, trường **"Mã khách hàng"**.
  - Khi: chủ garage mở form chỉnh sửa.
  - Thì: trường **"Mã khách hàng"** hiển thị ở trạng thái chỉ đọc (read-only) với giá trị mã hiện tại. Không cho phép chỉnh sửa.

- [ ] **AC-3**: Lưu chỉnh sửa thành công
  - Tại: form chỉnh sửa khách hàng, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật khách hàng thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Chỉnh sửa khách hàng thành công."**.

- [ ] **AC-4**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa khách hàng, nút lưu.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Họ và tên, Số điện thoại) và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

- [ ] **AC-5**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa khách hàng, nút hủy bỏ.
  - Khi: chủ garage nhấn nút hủy bỏ.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết khách hàng. Dữ liệu đã thay đổi trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-6**: Chỉnh sửa họ và tên
  - Tại: mục **"Thông tin cơ bản"**, trường **"Họ và tên"**.
  - Khi: chủ garage chỉnh sửa họ và tên.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập họ và tên"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập họ và tên."**.

- [ ] **AC-7**: Chỉnh sửa số điện thoại
  - Tại: mục **"Thông tin cơ bản"**, trường **"Số điện thoại"**.
  - Khi: chủ garage chỉnh sửa số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc. Định dạng hợp lệ: 10 chữ số, bắt đầu bằng 0.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng (không phải 10 chữ số bắt đầu bằng 0).
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.

- [ ] **AC-8**: Chỉnh sửa email
  - Tại: mục **"Thông tin cơ bản"**, trường **"Email"**.
  - Khi: chủ garage chỉnh sửa email.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập Email"**. Trường này không bắt buộc.

- [ ] **AC-9**: Chỉnh sửa ngày sinh
  - Tại: mục **"Thông tin cơ bản"**, trường **"Ngày sinh"**.
  - Khi: chủ garage chỉnh sửa ngày sinh.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker) với giá trị hiện tại. Trường này không bắt buộc.

- [ ] **AC-10**: Chỉnh sửa giới tính
  - Tại: mục **"Thông tin cơ bản"**, trường **"Giới tính"**.
  - Khi: chủ garage chỉnh sửa giới tính.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: Nam, Nữ, Khác. Giá trị hiện tại được chọn sẵn. Trường này không bắt buộc.

- [ ] **AC-11**: Chỉnh sửa trạng thái
  - Tại: mục **"Thông tin cơ bản"**, trường **"Trạng thái"**.
  - Khi: chủ garage chỉnh sửa trạng thái.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Đang hoạt động"**, **"Ngừng hoạt động"**. Giá trị hiện tại được chọn sẵn.

- [ ] **AC-12**: Chỉnh sửa ghi chú
  - Tại: mục **"Thông tin cơ bản"**, trường **"Ghi chú"**.
  - Khi: chủ garage chỉnh sửa ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea với giá trị hiện tại. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

- [ ] **AC-13**: Chỉnh sửa tag
  - Tại: mục **"Thông tin cơ bản"**, trường **"Tag"**.
  - Khi: chủ garage chỉnh sửa tag.
  - Thì: hệ thống hiển thị ô nhập tag với các tag hiện tại. Placeholder: **"Nhập tag, Ngăn cách nhau bằng phím enter"**. Trường này không bắt buộc. Cho phép thêm tag mới và xóa tag hiện có.

#### Mục: Thông tin địa chỉ

- [ ] **AC-14**: Chỉnh sửa tỉnh/thành phố
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Tỉnh/Thành phố"**.
  - Khi: chủ garage chỉnh sửa tỉnh/thành phố.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn tỉnh/thành phố"**. Trường này không bắt buộc. Danh sách tỉnh/thành phố được lấy từ danh mục hệ thống và kiểm tra hợp lệ qua cache.

- [ ] **AC-15**: Chỉnh sửa phường/xã
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Phường/Xã"**.
  - Khi: chủ garage chỉnh sửa phường/xã.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn phường/xã"**. Trường này không bắt buộc. Danh sách phường/xã được lấy từ danh mục hệ thống và kiểm tra hợp lệ qua cache.

- [ ] **AC-16**: Chỉnh sửa địa chỉ
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Địa chỉ"**.
  - Khi: chủ garage chỉnh sửa địa chỉ.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số nhà, đường, phố"**. Trường này không bắt buộc.

#### Mục: Thông tin xe

- [ ] **AC-17**: Chỉnh sửa biển số xe
  - Tại: mục **"Thông tin xe"**, trường **"Biển số"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa biển số xe.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập biển số"**. Trường này không bắt buộc. Hệ thống tự động chuyển thành chữ in hoa.
  - Khi: chủ garage nhập biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

- [ ] **AC-18**: Chỉnh sửa số VIN
  - Tại: mục **"Thông tin xe"**, trường **"Số VIN"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa số VIN.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số VIN"**. Trường này không bắt buộc.
  - Khi: chủ garage nhập số VIN không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số VIN không hợp lệ"**.

- [ ] **AC-19**: Chỉnh sửa số máy
  - Tại: mục **"Thông tin xe"**, trường **"Số máy"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa số máy.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số máy"**. Trường này không bắt buộc.
  - Khi: chủ garage nhập số máy không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số máy không hợp lệ"**.

- [ ] **AC-20**: Chỉnh sửa hãng xe
  - Tại: mục **"Thông tin xe"**, trường **"Hãng xe"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa hãng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn hãng xe"**. Trường này không bắt buộc. Khi thay đổi hãng xe, trường dòng xe và phiên bản được reset.

- [ ] **AC-21**: Chỉnh sửa dòng xe
  - Tại: mục **"Thông tin xe"**, trường **"Dòng xe"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa dòng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn dòng xe"**. Trường này không bắt buộc. Danh sách dòng xe phụ thuộc vào hãng xe đã chọn.

- [ ] **AC-22**: Chỉnh sửa năm sản xuất
  - Tại: mục **"Thông tin xe"**, trường **"Năm sản xuất"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa năm sản xuất.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại. Placeholder: **"Chọn năm sản xuất"**. Trường này không bắt buộc.

- [ ] **AC-23**: Chỉnh sửa phiên bản
  - Tại: mục **"Thông tin xe"**, trường **"Phiên bản"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa phiên bản.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại. Placeholder: **"Chọn phiên bản"**. Trường này không bắt buộc. Danh sách phiên bản phụ thuộc vào dòng xe đã chọn.

- [ ] **AC-24**: Chỉnh sửa số Km gần nhất
  - Tại: mục **"Thông tin xe"**, trường **"Số Km gần nhất"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa số Km gần nhất.
  - Thì: hệ thống hiển thị ô nhập số với giá trị hiện tại. Placeholder: **"Nhập số Km gần nhất"**. Trường này không bắt buộc.

- [ ] **AC-25**: Chỉnh sửa số Km bảo dưỡng tiếp theo
  - Tại: mục **"Thông tin xe"**, trường **"Số Km bảo dưỡng tiếp theo"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa số Km bảo dưỡng tiếp theo.
  - Thì: hệ thống hiển thị ô nhập số với giá trị hiện tại. Placeholder: **"Nhập số Km bảo dưỡng tiếp theo"**. Trường này không bắt buộc.

- [ ] **AC-26**: Chỉnh sửa chu kỳ bảo dưỡng (Km)
  - Tại: mục **"Thông tin xe"**, trường **"Chu kỳ bảo dưỡng (Km)"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa chu kỳ bảo dưỡng theo Km.
  - Thì: hệ thống hiển thị ô nhập số với giá trị hiện tại. Placeholder: **"Nhập chu kỳ bảo dưỡng (Km)"**. Trường này không bắt buộc.

- [ ] **AC-27**: Chỉnh sửa chu kỳ bảo dưỡng (Tháng)
  - Tại: mục **"Thông tin xe"**, trường **"Chu kỳ bảo dưỡng (Tháng)"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa chu kỳ bảo dưỡng theo tháng.
  - Thì: hệ thống hiển thị ô nhập số với giá trị hiện tại. Placeholder: **"Nhập chu kỳ bảo dưỡng (Tháng)"**. Trường này không bắt buộc.

- [ ] **AC-28**: Chỉnh sửa ngày bảo dưỡng tiếp theo
  - Tại: mục **"Thông tin xe"**, trường **"Ngày bảo dưỡng tiếp theo"** của xe hiện có.
  - Khi: chủ garage chỉnh sửa ngày bảo dưỡng tiếp theo.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker) với giá trị hiện tại. Trường này không bắt buộc.

- [ ] **AC-29**: Thay đổi xe chính
  - Tại: mục **"Thông tin xe"**, trường **"Xe chính"** của xe hiện có.
  - Khi: chủ garage đánh dấu xe khác làm xe chính.
  - Thì: hệ thống tự động bỏ đánh dấu xe chính trước đó. Chỉ được phép có một xe chính tại mọi thời điểm.

- [ ] **AC-30**: Thêm xe mới cho khách hàng hiện có
  - Tại: mục **"Thông tin xe"**, nút thêm xe.
  - Khi: chủ garage nhấn nút thêm xe.
  - Thì: hệ thống hiển thị một nhóm trường thông tin xe mới (trống) với đầy đủ các trường từ AC-17 đến AC-28.

- [ ] **AC-31**: Xóa xe khỏi khách hàng
  - Tại: mục **"Thông tin xe"**, nút xóa xe của xe hiện có.
  - Khi: chủ garage nhấn nút xóa xe.
  - Thì: hệ thống xóa xe khỏi danh sách xe của khách hàng trên form. Thay đổi chỉ được áp dụng khi nhấn nút lưu.

### Nhóm C — Phân quyền

- [ ] **AC-32**: Phân quyền chỉnh sửa khách hàng
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút chỉnh sửa và có quyền chỉnh sửa thông tin khách hàng.

### Nhóm D — Xử lý lỗi

- [ ] **AC-33**: Số điện thoại đã thuộc khách hàng khác
  - Tại: form chỉnh sửa khách hàng, sau khi nhấn nút lưu.
  - Khi: số điện thoại mới đã thuộc khách hàng khác trong cùng garage.
  - Thì: hệ thống hiển thị thông báo lỗi cho biết số điện thoại đã được sử dụng bởi khách hàng khác. Form giữ nguyên dữ liệu đã chỉnh sửa. Không cho phép lưu cho đến khi số điện thoại hợp lệ.

- [ ] **AC-34**: Validation form thất bại
  - Tại: form chỉnh sửa khách hàng, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-6 đến AC-29) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-35**: Chỉnh sửa khách hàng thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa khách hàng, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật khách hàng thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã chỉnh sửa để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CUSTOMER.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Lấy chi tiết khách hàng: Query `GetCustomer`
- Cập nhật khách hàng: Mutation `UpdateCustomer`
- Danh mục tỉnh/thành phố, phường/xã: từ danh mục hệ thống (gf-erp-mdm, kiểm tra qua Redis cache)
- Danh mục hãng/dòng xe: từ danh mục hệ thống (gf-erp-mdm)

## 5. Business Rules

- **BR-CUST-EDT-001**: Số điện thoại không được trùng với khách hàng khác trong cùng garage. Nếu thay đổi số điện thoại thành số đã tồn tại cho khách hàng khác, hệ thống từ chối cập nhật.
- **BR-CUST-EDT-002**: Mã khách hàng không cho phép chỉnh sửa — hiển thị chỉ đọc.
- **BR-CUST-EDT-003**: Mỗi khách hàng chỉ có một xe chính. Khi đánh dấu xe khác làm xe chính, xe trước đó tự động bỏ đánh dấu.
- **BR-CUST-EDT-004**: Biển số xe tự động chuyển thành chữ in hoa, chỉ chấp nhận ký tự chữ cái và số.
- **BR-CUST-EDT-005**: Tỉnh/thành phố và phường/xã (nếu có) được kiểm tra hợp lệ theo danh mục hệ thống qua cache.

## 6. Edge Cases

- **EC-1**: Khách hàng có xe đang liên kết với lịch hẹn hoặc phiếu dịch vụ đang mở — việc xóa xe trên form chỉnh sửa có thể bị hệ thống từ chối khi lưu nếu xe đang được tham chiếu.
- **EC-2**: Thay đổi hãng xe trong khi dòng xe và phiên bản đã được chọn — hệ thống reset dòng xe và phiên bản khi hãng xe thay đổi.
- **EC-3**: Tỉnh/thành phố hoặc phường/xã không tìm thấy trong danh mục hệ thống — hệ thống báo lỗi validation.

## 7. Out of Scope

- Tạo khách hàng mới → xem `FEAT-CUST-CREATE`.
- Quản lý phân khúc khách hàng và chiến dịch marketing → xem `EP-MARKETING`.
- Xem lịch sử dịch vụ và giao dịch của khách hàng — thuộc chức năng xem chi tiết khách hàng.
- Merge/gộp hồ sơ khách hàng trùng lặp — chưa thuộc phạm vi hiện tại.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (customer edit/form sections) |
