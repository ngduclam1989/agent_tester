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

# FEAT-CUST-CREATE: Tạo khách hàng mới

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CUST-CREATE` |
| Title | Tạo khách hàng mới |
| Parent Epic | `EP-CUSTOMER` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo khách hàng mới với thông tin cá nhân, địa chỉ và thông tin xe, **so that** garage có thể quản lý hồ sơ khách hàng phục vụ lịch hẹn và dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo khách hàng
  - Tại: màn hình Danh sách khách hàng.
  - Khi: chủ garage nhấn nút tạo khách hàng mới.
  - Thì: hệ thống chuyển sang màn hình tạo khách hàng mới với form trống, gồm 3 mục: **"Thông tin cơ bản"**, **"Thông tin địa chỉ"** và **"Thông tin xe"**.

- [ ] **AC-2**: Tạo khách hàng thành công
  - Tại: form tạo khách hàng, sau khi nhấn nút lưu.
  - Khi: hệ thống tạo khách hàng thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo khách hàng thành công."**. Mã khách hàng được hệ thống tự sinh theo định dạng KH-{sequence}. Trạng thái khách hàng khởi tạo là **"Đang hoạt động"**.

- [ ] **AC-3**: Điều kiện nút lưu
  - Tại: cuối form tạo khách hàng, nút lưu.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Họ và tên, Số điện thoại) và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo khách hàng
  - Tại: form tạo khách hàng, nút hủy bỏ.
  - Khi: chủ garage nhấn nút hủy bỏ.
  - Thì: hệ thống đóng form tạo khách hàng và quay về màn hình Danh sách khách hàng. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-5**: Nhập họ và tên
  - Tại: mục **"Thông tin cơ bản"**, trường **"Họ và tên"**.
  - Khi: chủ garage nhập họ và tên.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập họ và tên"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập họ và tên."**.

- [ ] **AC-6**: Nhập số điện thoại
  - Tại: mục **"Thông tin cơ bản"**, trường **"Số điện thoại"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc. Định dạng hợp lệ: 10 chữ số, bắt đầu bằng 0.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng (không phải 10 chữ số bắt đầu bằng 0).
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.

- [ ] **AC-7**: Nhập email
  - Tại: mục **"Thông tin cơ bản"**, trường **"Email"**.
  - Khi: chủ garage nhập email.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập Email"**. Trường này không bắt buộc.

- [ ] **AC-8**: Chọn ngày sinh
  - Tại: mục **"Thông tin cơ bản"**, trường **"Ngày sinh"**.
  - Khi: chủ garage chọn ngày sinh.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này không bắt buộc.

- [ ] **AC-9**: Chọn giới tính
  - Tại: mục **"Thông tin cơ bản"**, trường **"Giới tính"**.
  - Khi: chủ garage chọn giới tính.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: Nam, Nữ, Khác. Trường này không bắt buộc.

- [ ] **AC-10**: Chọn trạng thái
  - Tại: mục **"Thông tin cơ bản"**, trường **"Trạng thái"**.
  - Khi: chủ garage chọn trạng thái.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Đang hoạt động"**, **"Ngừng hoạt động"**. Giá trị mặc định là **"Đang hoạt động"**.

- [ ] **AC-11**: Nhập ghi chú
  - Tại: mục **"Thông tin cơ bản"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

- [ ] **AC-12**: Nhập tag
  - Tại: mục **"Thông tin cơ bản"**, trường **"Tag"**.
  - Khi: chủ garage nhập tag.
  - Thì: hệ thống hiển thị ô nhập tag. Placeholder: **"Nhập tag, Ngăn cách nhau bằng phím enter"**. Trường này không bắt buộc. Mỗi tag được tạo khi nhấn phím Enter.

#### Mục: Thông tin địa chỉ

- [ ] **AC-13**: Chọn tỉnh/thành phố
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Tỉnh/Thành phố"**.
  - Khi: chủ garage chọn tỉnh/thành phố.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn tỉnh/thành phố"**. Trường này không bắt buộc. Danh sách tỉnh/thành phố được lấy từ danh mục hệ thống và kiểm tra hợp lệ qua cache.

- [ ] **AC-14**: Chọn phường/xã
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Phường/Xã"**.
  - Khi: chủ garage chọn phường/xã.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn phường/xã"**. Trường này không bắt buộc. Danh sách phường/xã được lấy từ danh mục hệ thống và kiểm tra hợp lệ qua cache.

- [ ] **AC-15**: Nhập địa chỉ
  - Tại: mục **"Thông tin địa chỉ"**, trường **"Địa chỉ"**.
  - Khi: chủ garage nhập địa chỉ.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số nhà, đường, phố"**. Trường này không bắt buộc.

#### Mục: Thông tin xe

- [ ] **AC-16**: Nhập biển số xe
  - Tại: mục **"Thông tin xe"**, trường **"Biển số"**.
  - Khi: chủ garage nhập biển số xe.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập biển số"**. Trường này không bắt buộc. Hệ thống tự động chuyển thành chữ in hoa.
  - Khi: chủ garage nhập biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

- [ ] **AC-17**: Nhập số VIN
  - Tại: mục **"Thông tin xe"**, trường **"Số VIN"**.
  - Khi: chủ garage nhập số VIN.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số VIN"**. Trường này không bắt buộc.
  - Khi: chủ garage nhập số VIN không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số VIN không hợp lệ"**.

- [ ] **AC-18**: Nhập số máy
  - Tại: mục **"Thông tin xe"**, trường **"Số máy"**.
  - Khi: chủ garage nhập số máy.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số máy"**. Trường này không bắt buộc.
  - Khi: chủ garage nhập số máy không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số máy không hợp lệ"**.

- [ ] **AC-19**: Chọn hãng xe
  - Tại: mục **"Thông tin xe"**, trường **"Hãng xe"**.
  - Khi: chủ garage chọn hãng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn hãng xe"**. Trường này không bắt buộc. Danh sách hãng xe được lấy từ danh mục hệ thống.

- [ ] **AC-20**: Chọn dòng xe
  - Tại: mục **"Thông tin xe"**, trường **"Dòng xe"**.
  - Khi: chủ garage chọn dòng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn dòng xe"**. Trường này không bắt buộc. Danh sách dòng xe phụ thuộc vào hãng xe đã chọn; khi hãng xe được chọn, hệ thống kiểm tra hợp lệ phân cấp hãng-dòng xe qua danh mục hệ thống.

- [ ] **AC-21**: Chọn năm sản xuất
  - Tại: mục **"Thông tin xe"**, trường **"Năm sản xuất"**.
  - Khi: chủ garage chọn năm sản xuất.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn năm sản xuất"**. Trường này không bắt buộc.

- [ ] **AC-22**: Chọn phiên bản
  - Tại: mục **"Thông tin xe"**, trường **"Phiên bản"**.
  - Khi: chủ garage chọn phiên bản.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn phiên bản"**. Trường này không bắt buộc. Danh sách phiên bản phụ thuộc vào dòng xe đã chọn.

- [ ] **AC-23**: Nhập số Km gần nhất
  - Tại: mục **"Thông tin xe"**, trường **"Số Km gần nhất"**.
  - Khi: chủ garage nhập số Km gần nhất.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập số Km gần nhất"**. Trường này không bắt buộc.

- [ ] **AC-24**: Nhập số Km bảo dưỡng tiếp theo
  - Tại: mục **"Thông tin xe"**, trường **"Số Km bảo dưỡng tiếp theo"**.
  - Khi: chủ garage nhập số Km bảo dưỡng tiếp theo.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập số Km bảo dưỡng tiếp theo"**. Trường này không bắt buộc.

- [ ] **AC-25**: Nhập chu kỳ bảo dưỡng (Km)
  - Tại: mục **"Thông tin xe"**, trường **"Chu kỳ bảo dưỡng (Km)"**.
  - Khi: chủ garage nhập chu kỳ bảo dưỡng theo Km.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập chu kỳ bảo dưỡng (Km)"**. Trường này không bắt buộc.

- [ ] **AC-26**: Nhập chu kỳ bảo dưỡng (Tháng)
  - Tại: mục **"Thông tin xe"**, trường **"Chu kỳ bảo dưỡng (Tháng)"**.
  - Khi: chủ garage nhập chu kỳ bảo dưỡng theo tháng.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập chu kỳ bảo dưỡng (Tháng)"**. Trường này không bắt buộc.

- [ ] **AC-27**: Chọn ngày bảo dưỡng tiếp theo
  - Tại: mục **"Thông tin xe"**, trường **"Ngày bảo dưỡng tiếp theo"**.
  - Khi: chủ garage chọn ngày bảo dưỡng tiếp theo.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này không bắt buộc.

- [ ] **AC-28**: Đánh dấu xe chính
  - Tại: mục **"Thông tin xe"**, trường **"Xe chính"**.
  - Khi: chủ garage thêm xe cho khách hàng.
  - Thì: hệ thống hiển thị checkbox/toggle **"Xe chính"**. Xe đầu tiên được thêm mặc định là xe chính. Chỉ được phép có một xe chính trong mỗi yêu cầu tạo khách hàng; nếu đánh dấu xe khác làm xe chính, xe trước đó tự động bỏ đánh dấu.

- [ ] **AC-29**: Thêm nhiều xe
  - Tại: mục **"Thông tin xe"**.
  - Khi: chủ garage muốn thêm xe thứ hai trở đi.
  - Thì: hệ thống cho phép thêm nhiều xe cho cùng một khách hàng. Mỗi xe có đầy đủ các trường thông tin xe (từ AC-16 đến AC-28).

### Nhóm C — Phân quyền

- [ ] **AC-30**: Phân quyền tạo khách hàng
  - Tại: màn hình Danh sách khách hàng.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo khách hàng và có quyền tạo khách hàng.

### Nhóm D — Xử lý lỗi

- [ ] **AC-31**: Số điện thoại đã tồn tại
  - Tại: form tạo khách hàng, sau khi nhấn nút lưu.
  - Khi: số điện thoại đã tồn tại trong hệ thống của garage.
  - Thì: hệ thống hiển thị thông báo lỗi cho biết số điện thoại đã được sử dụng bởi khách hàng khác trong cùng garage. Form giữ nguyên dữ liệu đã nhập.

- [ ] **AC-32**: Validation form thất bại
  - Tại: form tạo khách hàng, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-28) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-33**: Tạo khách hàng thất bại do lỗi hệ thống
  - Tại: form tạo khách hàng, sau khi nhấn nút lưu.
  - Khi: hệ thống tạo khách hàng thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CUSTOMER.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Tạo khách hàng: Mutation `CreateCustomer`
- Danh mục tỉnh/thành phố, phường/xã: từ danh mục hệ thống (gf-erp-mdm, kiểm tra qua Redis cache)
- Danh mục hãng/dòng xe: từ danh mục hệ thống (gf-erp-mdm)

## 5. Business Rules

- **BR-CUST-CRE-001**: Số điện thoại khách hàng không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo và thông báo lỗi.
- **BR-CUST-CRE-002**: Mã khách hàng được hệ thống tự sinh theo định dạng KH-{sequence}, không cho phép nhập thủ công.
- **BR-CUST-CRE-003**: Tạo khách hàng từ giao diện yêu cầu ít nhất một xe; khi hãng xe được chọn, hệ thống kiểm tra hợp lệ phân cấp hãng-dòng xe qua danh mục hệ thống.
- **BR-CUST-CRE-004**: Mỗi yêu cầu tạo khách hàng chỉ được có một xe chính. Nếu không chỉ định, xe đầu tiên mặc định là xe chính.
- **BR-CUST-CRE-005**: Số điện thoại phải đúng 10 chữ số và bắt đầu bằng 0.
- **BR-CUST-CRE-006**: Biển số xe tự động chuyển thành chữ in hoa, chỉ chấp nhận ký tự chữ cái và số.
- **BR-CUST-CRE-007**: Tỉnh/thành phố và phường/xã (nếu có) được kiểm tra hợp lệ theo danh mục hệ thống qua cache.

## 6. Edge Cases

- **EC-1**: Khách hàng không có xe — hệ thống yêu cầu ít nhất một xe khi tạo từ giao diện; không cho phép lưu nếu chưa thêm xe.
- **EC-2**: Biển số xe đã tồn tại trong hệ thống cho khách hàng khác — hệ thống cho phép tạo (biển số không phải trường unique toàn cục) nhưng hiển thị cảnh báo nếu có.
- **EC-3**: Tỉnh/thành phố hoặc phường/xã không tìm thấy trong danh mục hệ thống — hệ thống báo lỗi validation.
- **EC-4**: Hãng xe được chọn nhưng dòng xe không thuộc hãng đó — hệ thống báo lỗi validation phân cấp hãng-dòng xe.

## 7. Out of Scope

- Chỉnh sửa thông tin khách hàng sau khi tạo → xem `FEAT-CUST-EDIT`.
- Import danh sách khách hàng hàng loạt — thuộc chức năng import riêng.
- Quản lý phân khúc khách hàng và chiến dịch marketing → xem `EP-MARKETING`.
- Xem chi tiết và lịch sử dịch vụ của khách hàng — thuộc chức năng xem chi tiết khách hàng.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (customer create/form sections) |
