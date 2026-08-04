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

# FEAT-CUST-DETAIL: Chi tiết khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CUST-DETAIL` |
| Title | Chi tiết khách hàng |
| Parent Epic | `EP-CUSTOMER` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết thông tin khách hàng bao gồm thông tin cá nhân, địa chỉ, xe và lịch sử tương tác, **so that** tôi có thể nắm bắt toàn diện về khách hàng phục vụ chăm sóc và dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết khách hàng
  - Tại: màn hình Danh sách khách hàng.
  - Khi: chủ garage nhấn vào dòng khách hàng trong bảng.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết khách hàng"**. Màn hình gồm hai tab: **"Thông tin khách hàng"** và **"Lịch sử tương tác"**. Tab **"Thông tin khách hàng"** được chọn mặc định.

- [ ] **AC-2**: Hiển thị mục Thông tin cơ bản
  - Tại: màn hình Chi tiết khách hàng, tab **"Thông tin khách hàng"**, mục **"Thông tin cơ bản"**.
  - Khi: hệ thống tải xong dữ liệu khách hàng.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Mã khách hàng"**, **"Họ và tên"**, **"Số điện thoại"**, **"Giới tính"**, **"Ngày sinh"**, **"Ghi chú"**.

- [ ] **AC-3**: Hiển thị mục Thông tin địa chỉ
  - Tại: màn hình Chi tiết khách hàng, tab **"Thông tin khách hàng"**, mục **"Thông tin địa chỉ"**.
  - Khi: hệ thống tải xong dữ liệu khách hàng.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Tỉnh/Thành phố"**, **"Phường/Xã"**, **"Địa chỉ"**.

- [ ] **AC-4**: Hiển thị mục Thông tin xe
  - Tại: màn hình Chi tiết khách hàng, tab **"Thông tin khách hàng"**, mục **"Thông tin xe"**.
  - Khi: hệ thống tải xong dữ liệu khách hàng.
  - Thì: hiển thị danh sách xe của khách hàng. Mỗi xe hiển thị các trường ở trạng thái chỉ đọc: **"Biển số"**, **"Số VIN"**, **"Số máy"**, **"Hãng xe"**, **"Dòng xe"**, **"Phiên bản"**, **"Năm sản xuất"**, **"Số Km gần nhất"**, **"Số Km bảo dưỡng tiếp theo"**, **"Chu kỳ bảo dưỡng (Km)"**, **"Chu kỳ bảo dưỡng (Tháng)"**, **"Ngày bảo dưỡng tiếp theo"**.

- [ ] **AC-5**: Khách hàng có nhiều xe
  - Tại: màn hình Chi tiết khách hàng, tab **"Thông tin khách hàng"**, mục **"Thông tin xe"**.
  - Khi: khách hàng có nhiều hơn một xe được liên kết.
  - Thì: hệ thống hiển thị tất cả xe của khách hàng, mỗi xe là một khối thông tin riêng biệt với đầy đủ các trường.

- [ ] **AC-6**: Khách hàng chưa có xe
  - Tại: màn hình Chi tiết khách hàng, tab **"Thông tin khách hàng"**, mục **"Thông tin xe"**.
  - Khi: khách hàng chưa có xe nào được liên kết.
  - Thì: mục **"Thông tin xe"** hiển thị trạng thái trống, không có khối thông tin xe nào.

### Nhóm B — Tab Lịch sử tương tác

- [ ] **AC-7**: Hiển thị tab Lịch sử tương tác
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage nhấn tab **"Lịch sử tương tác"**.
  - Thì: hệ thống hiển thị bảng lịch sử tương tác với các cột: **"Thời gian"**, **"Nội dung"**.

- [ ] **AC-8**: Hiển thị nội dung lịch sử tương tác
  - Tại: tab **"Lịch sử tương tác"**.
  - Khi: hệ thống tải xong dữ liệu lịch sử.
  - Thì: mỗi dòng hiển thị thời gian và nội dung tương tác. Các loại tương tác bao gồm: **"Khách hàng đặt lịch"**, **"Khách hàng sử dụng dịch vụ"**, và các tương tác khác theo dữ liệu hệ thống.

- [ ] **AC-9**: Lịch sử tương tác trống
  - Tại: tab **"Lịch sử tương tác"**.
  - Khi: khách hàng chưa có lịch sử tương tác nào.
  - Thì: hệ thống hiển thị trạng thái trống.

### Nhóm C — Nút hành động

- [ ] **AC-10**: Nút chỉnh sửa khách hàng
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa khách hàng (xem `FEAT-CUST-EDIT`).

- [ ] **AC-11**: Quay về danh sách khách hàng
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage nhấn nút quay lại.
  - Thì: hệ thống chuyển về màn hình Danh sách khách hàng (xem `FEAT-CUST-LIST`).

### Nhóm D — Phân quyền

- [ ] **AC-12**: Phân quyền xem chi tiết và thao tác khách hàng
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết khách hàng, chuyển tab, và điều hướng sang chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm E — Xử lý lỗi

- [ ] **AC-13**: Tải dữ liệu chi tiết thất bại
  - Tại: màn hình Chi tiết khách hàng.
  - Khi: hệ thống không tải được dữ liệu khách hàng (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CUSTOMER.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Chi tiết khách hàng: Query `GetCustomer`

## 5. Business Rules

- **BR-CUST-DTL-001**: Thông tin khách hàng trên màn hình chi tiết luôn được phạm vi theo garage hiện tại — không hiển thị khách hàng của garage khác.
- **BR-CUST-DTL-002**: Một khách hàng có thể liên kết với nhiều xe. Mỗi xe hiển thị đầy đủ thông tin bao gồm thông số bảo dưỡng.
- **BR-CUST-DTL-003**: Lịch sử tương tác được ghi nhận tự động khi khách hàng thực hiện các hoạt động trong hệ thống (đặt lịch, sử dụng dịch vụ).
- **BR-CUST-DTL-004**: Thông tin xe bao gồm thông số bảo dưỡng (**"Số Km bảo dưỡng tiếp theo"**, **"Chu kỳ bảo dưỡng (Km)"**, **"Chu kỳ bảo dưỡng (Tháng)"**, **"Ngày bảo dưỡng tiếp theo"**) phục vụ theo dõi lịch bảo dưỡng định kỳ.

## 6. Edge Cases

- **EC-1**: Khách hàng có nhiều xe — tất cả xe đều hiển thị trong mục **"Thông tin xe"**, mỗi xe là một khối riêng biệt.
- **EC-2**: Khách hàng chưa có xe — mục **"Thông tin xe"** hiển thị trạng thái trống.
- **EC-3**: Khách hàng chưa có lịch sử tương tác — tab **"Lịch sử tương tác"** hiển thị trạng thái trống.
- **EC-4**: Trường thông tin tùy chọn không có dữ liệu (ví dụ: **"Email"**, **"Ngày sinh"**, **"Ghi chú"**) — hiển thị trống, không hiển thị giá trị mặc định.

## 7. Out of Scope

- Chỉnh sửa thông tin khách hàng → xem `FEAT-CUST-EDIT`.
- Tạo khách hàng mới → xem `FEAT-CUST-CREATE`.
- Danh sách khách hàng → xem `FEAT-CUST-LIST`.
- Tải lên danh sách khách hàng → xem `FEAT-CUST-IMPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (customer detail screen, tabs: thong-tin-khach-hang, lich-su-tuong-tac, vehicle info, GetCustomer query) |
