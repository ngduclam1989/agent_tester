---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-FOUND"
boundary: "gf-hrms"
last_reviewed: "2026-05-27"
---

# FEAT-FND-EMP-EDIT: Chỉnh sửa nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-EDIT` |
| Title | Chỉnh sửa nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin nhân viên đang làm việc tại garage, **so that** hồ sơ nhân viên luôn được cập nhật chính xác khi có thay đổi về thông tin cá nhân hoặc vai trò công việc.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa, sửa thông tin và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa nhân viên từ màn hình chi tiết
  - Tại: màn hình Hồ sơ nhân viên, nhân viên đang ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa nhân viên"** với form gồm 2 mục: **"Thông tin chung"** và **"Thông tin công việc"**. Tất cả các trường được điền sẵn dữ liệu hiện tại của nhân viên.

- [ ] **AC-2**: Mở màn hình chỉnh sửa nhân viên từ danh sách
  - Tại: màn hình Danh sách nhân viên, cột hành động.
  - Khi: chủ garage nhấn nút chỉnh sửa trên dòng nhân viên đang ở trạng thái **"Đang làm việc"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa nhân viên"** với form điền sẵn dữ liệu hiện tại, tương tự AC-1.

- [ ] **AC-3**: Không cho phép chỉnh sửa nhân viên không ở trạng thái "Đang làm việc"
  - Tại: màn hình Hồ sơ nhân viên hoặc Danh sách nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem thông tin nhân viên.
  - Thì: nút chỉnh sửa không khả dụng hoặc không hiển thị. Hệ thống chỉ cho phép chỉnh sửa nhân viên đang ở trạng thái **"Đang làm việc"**.

- [ ] **AC-4**: Sửa thông tin và lưu thành công
  - Tại: màn hình Chỉnh sửa nhân viên, form đã điền sẵn dữ liệu.
  - Khi: chủ garage thay đổi các trường thông tin và nhấn nút **"Lưu"**.
  - Thì: hệ thống cập nhật thông tin nhân viên. Hiển thị toast với tiêu đề: **"Thành công"**, mô tả: **"Cập nhật nhân viên thành công."**. Hệ thống quay về màn hình Hồ sơ nhân viên với dữ liệu đã cập nhật.

- [ ] **AC-5**: Hủy bỏ chỉnh sửa
  - Tại: màn hình Chỉnh sửa nhân viên.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống hiển thị hộp thoại xác nhận **"Hủy chỉnh sửa"** với nội dung: **"Thông tin vừa thay đổi sẽ không được lưu lại. Bạn có chắc chắn muốn hủy?"**. Nếu xác nhận hủy, hệ thống quay về màn hình trước đó. Dữ liệu thay đổi không được lưu.

### Nhóm B — Chi tiết mục form

#### Mục: Thông tin chung

- [ ] **AC-6**: Trường Họ và tên đệm
  - Tại: mục **"Thông tin chung"**, trường **"Họ và tên đệm"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại.
    - Placeholder: **"Nhập họ và tên đệm"**.
    - Trường bắt buộc. Nếu để trống, hiển thị lỗi: **"Vui lòng nhập họ và tên đệm."**.
    - Giới hạn: **"Họ và tên đệm không quá 200 ký tự"**.

- [ ] **AC-7**: Trường Tên
  - Tại: mục **"Thông tin chung"**, trường **"Tên"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại.
    - Placeholder: **"Nhập tên"**.
    - Trường bắt buộc. Nếu để trống, hiển thị lỗi: **"Vui lòng nhập tên."**.
    - Giới hạn: **"Tên không quá 100 ký tự"**.

- [ ] **AC-8**: Trường Số điện thoại
  - Tại: mục **"Thông tin chung"**, trường **"Số điện thoại"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại.
    - Placeholder: **"Nhập số điện thoại"**.
    - Trường bắt buộc. Nếu để trống, hiển thị lỗi: **"Vui lòng nhập số điện thoại."**.
    - Số điện thoại không được trùng với nhân viên khác trong cùng garage.

- [ ] **AC-9**: Trường Mã nhân viên (chỉ đọc)
  - Tại: mục **"Thông tin chung"**, trường **"Mã nhân viên"**.
  - Khi: chủ garage xem trường này.
  - Thì:
    - Trường hiển thị mã nhân viên hiện tại.
    - Trường chỉ đọc, không cho phép chỉnh sửa.

- [ ] **AC-10**: Trường Ngày sinh
  - Tại: mục **"Thông tin chung"**, trường **"Ngày sinh"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Hệ thống hiển thị bộ chọn ngày.
    - Trường không bắt buộc.

- [ ] **AC-11**: Trường Email
  - Tại: mục **"Thông tin chung"**, trường **"Email"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Placeholder: **"Nhập email"**.
    - Trường không bắt buộc.

- [ ] **AC-12**: Trường CCCD/CMND
  - Tại: mục **"Thông tin chung"**, trường **"CCCD/CMND"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Placeholder: **"Nhập CCCD/CMND"**.
    - Trường không bắt buộc.
    - Nếu nhập không đúng định dạng, hiển thị lỗi: **"CCCD/CMND chỉ chứa số, độ dài 9 hoặc 12 ký tự"**.

- [ ] **AC-13**: Trường Tỉnh/Thành phố
  - Tại: mục **"Thông tin chung"**, trường **"Tỉnh/Thành phố"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Placeholder: **"Chọn tỉnh/thành phố"**.
    - Trường không bắt buộc.
    - Giá trị phải hợp lệ theo danh mục địa chính.

- [ ] **AC-14**: Trường Phường/Xã
  - Tại: mục **"Thông tin chung"**, trường **"Phường/Xã"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Placeholder: **"Chọn phường/xã"**.
    - Trường không bắt buộc.
    - Giá trị phải hợp lệ theo danh mục địa chính.

- [ ] **AC-15**: Trường Địa chỉ
  - Tại: mục **"Thông tin chung"**, trường **"Địa chỉ"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại (nếu có).
    - Placeholder: **"Nhập địa chỉ"**.
    - Trường không bắt buộc.

- [ ] **AC-16**: Ảnh đại diện (Avatar)
  - Tại: mục **"Thông tin chung"**, khu vực ảnh đại diện.
  - Khi: chủ garage nhấn **"Tải ảnh lên"** hoặc thay đổi ảnh đại diện.
  - Thì:
    - Hệ thống cho phép tải lên ảnh đại diện mới thay thế ảnh hiện tại (nếu có).
    - Trường không bắt buộc.

#### Mục: Thông tin công việc

- [ ] **AC-17**: Trường Vai trò
  - Tại: mục **"Thông tin công việc"**, trường **"Vai trò"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn vai trò hiện tại.
    - Placeholder: **"Chọn vai trò"**.
    - Trường bắt buộc. Nếu để trống, hiển thị lỗi: **"Vui lòng chọn vai trò."**.
    - Các tùy chọn vai trò: **"Thợ sửa chữa"**, **"Cố vấn dịch vụ"**, **"Kế toán"**, **"Nhân viên quản lý kho"**, **"Nhân viên dịch vụ nhanh"**, **"Nhân viên Marketing"**, **"Chăm sóc khách hàng"**, **"Quản lý nhân sự"**, **"Chủ sở hữu"**.
    - Nếu vai trò thay đổi so với giá trị hiện tại, hệ thống ghi nhận lịch sử thay đổi vai trò.

- [ ] **AC-18**: Trường Ngày vào làm
  - Tại: mục **"Thông tin công việc"**, trường **"Ngày vào làm"**.
  - Khi: chủ garage chỉnh sửa trường này.
  - Thì:
    - Trường được điền sẵn giá trị hiện tại.
    - Hệ thống hiển thị bộ chọn ngày.
    - Trường bắt buộc. Nếu để trống, hiển thị lỗi: **"Vui lòng chọn ngày vào làm."**.

### Nhóm C — Phân quyền

- [ ] **AC-19**: Phân quyền chỉnh sửa nhân viên
  - Tại: màn hình Hồ sơ nhân viên hoặc Danh sách nhân viên.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa thông tin nhân viên. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-20**: Số điện thoại trùng với nhân viên khác
  - Tại: màn hình Chỉnh sửa nhân viên, sau khi nhấn nút **"Lưu"**.
  - Khi: số điện thoại mới đã được sử dụng bởi nhân viên khác trong cùng garage.
  - Thì: hệ thống hiển thị hộp thoại **"Nhân viên đã có trên hệ thống"** với thông tin nhân viên đang sử dụng số điện thoại đó. Thông tin nhân viên không được cập nhật.

- [ ] **AC-21**: Cập nhật thất bại do lỗi hệ thống
  - Tại: màn hình Chỉnh sửa nhân viên, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Thông tin nhân viên không thay đổi.

- [ ] **AC-22**: Mã nhân viên không hợp lệ khi truy cập trang chỉnh sửa
  - Tại: màn hình Chỉnh sửa nhân viên.
  - Khi: mã nhân viên trong đường dẫn không tồn tại hoặc không hợp lệ.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**, mô tả: **"Mã nhân viên không hợp lệ."**.

- [ ] **AC-23**: Điều kiện nút Lưu
  - Tại: cuối form chỉnh sửa nhân viên, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Họ và tên đệm, Tên, Số điện thoại, Vai trò, Ngày vào làm) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái bị mờ (disabled).

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX Flow liên quan.

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Cập nhật nhân viên: Mutation `UpdateEmployee`
- Lấy thông tin nhân viên: Query `GetEmployeeByCode`

## 5. Business Rules

- **BR-FND-EMP-EDT-001**: Chỉ nhân viên đang ở trạng thái **"Đang làm việc"** mới được chỉnh sửa thông tin. Nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** không cho phép chỉnh sửa.
- **BR-FND-EMP-EDT-002**: Khi thay đổi số điện thoại, số mới không được trùng với nhân viên khác trong cùng garage. Nếu trùng, hệ thống hiển thị thông tin nhân viên đang sử dụng số đó.
- **BR-FND-EMP-EDT-003**: Khi thay đổi vai trò, hệ thống ghi nhận lịch sử thay đổi vai trò gồm vai trò cũ, vai trò mới, người thực hiện và thời gian thay đổi.
- **BR-FND-EMP-EDT-004**: Mã nhân viên là giá trị chỉ đọc, không cho phép thay đổi sau khi tạo.
- **BR-FND-EMP-EDT-005**: Tỉnh/Thành phố và Phường/Xã phải hợp lệ theo danh mục địa chính. Nếu để trống thì bỏ qua kiểm tra.

## 6. Edge Cases

- **EC-1**: Nhân viên bị chuyển sang trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** trong khi đang mở form chỉnh sửa — lưu thất bại, hiển thị lỗi.
- **EC-2**: Hai người dùng cùng chỉnh sửa một nhân viên — người lưu sau sẽ ghi đè dữ liệu của người lưu trước.

## 7. Out of Scope

- Tạo mới nhân viên → xem `FEAT-FND-EMP-CREATE`.
- Quản lý trạng thái nhân viên (tạm nghỉ, nghỉ việc, kích hoạt lại) — thuộc chức năng riêng trong `EP-FOUND`.
- Cấp / thu hồi / kích hoạt tài khoản hệ thống (SSO) — thuộc chức năng riêng trong `EP-FOUND`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms + garage-web |
