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

# FEAT-FND-EMP-CREATE: Tạo nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-CREATE` |
| Title | Tạo nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo hồ sơ nhân viên mới với đầy đủ thông tin cá nhân và thông tin công việc, **so that** garage có thể quản lý đội ngũ nhân viên, phân vai trò và theo dõi trạng thái làm việc.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo nhân viên
  - Tại: màn hình Danh sách nhân viên.
  - Khi: chủ garage nhấn nút **"Thêm nhân viên"**.
  - Thì: hệ thống chuyển sang màn hình tạo nhân viên mới với form trống, gồm 2 mục: **"Thông tin chung"** và **"Thông tin công việc"**.

- [ ] **AC-2**: Lưu nhân viên thành công
  - Tại: form tạo nhân viên, sau khi nhấn nút lưu.
  - Khi: hệ thống tạo nhân viên thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo nhân viên thành công."**. Mã nhân viên được hệ thống tự sinh. Trạng thái nhân viên khởi tạo là **"Đang làm việc"**. Hệ thống ghi nhận lịch sử trạng thái ban đầu.

- [ ] **AC-3**: Điều kiện nút lưu
  - Tại: cuối form tạo nhân viên, nút lưu.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Họ và tên đệm, Tên, Số điện thoại, Vai trò, Ngày vào làm) và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo nhân viên
  - Tại: form tạo nhân viên, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống hiển thị hộp thoại xác nhận với tiêu đề **"Hủy tạo mới nhân viên?"** và nội dung **"Thông tin vừa nhập sẽ không được lưu lại. Bạn có chắc chắn muốn hủy?"**. Nếu xác nhận, hệ thống đóng form và quay về màn hình Danh sách nhân viên. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin chung

- [ ] **AC-5**: Nhập họ và tên đệm
  - Tại: mục **"Thông tin chung"**, trường **"Họ và tên đệm"**.
  - Khi: chủ garage nhập họ và tên đệm.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập họ và tên đệm"**. Trường này bắt buộc. Giới hạn tối đa 200 ký tự.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập họ và tên đệm."**.

- [ ] **AC-6**: Nhập tên
  - Tại: mục **"Thông tin chung"**, trường **"Tên"**.
  - Khi: chủ garage nhập tên.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tên"**. Trường này bắt buộc. Giới hạn tối đa 100 ký tự.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên."**.

- [ ] **AC-7**: Nhập số điện thoại
  - Tại: mục **"Thông tin chung"**, trường **"Số điện thoại"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.

- [ ] **AC-8**: Hiển thị mã nhân viên
  - Tại: mục **"Thông tin chung"**, trường **"Mã nhân viên"**.
  - Khi: chủ garage đang ở form tạo nhân viên mới.
  - Thì: trường **"Mã nhân viên"** hiển thị ở trạng thái chỉ đọc (read-only) với placeholder: **"Tự sinh sau khi lưu"**. Không cho phép nhập thủ công.

- [ ] **AC-9**: Chọn ngày sinh
  - Tại: mục **"Thông tin chung"**, trường **"Ngày sinh"**.
  - Khi: chủ garage chọn ngày sinh.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này không bắt buộc.

- [ ] **AC-10**: Nhập email
  - Tại: mục **"Thông tin chung"**, trường **"Email"**.
  - Khi: chủ garage nhập email.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập email"**. Trường này không bắt buộc.

- [ ] **AC-11**: Nhập CCCD/CMND
  - Tại: mục **"Thông tin chung"**, trường **"CCCD/CMND"**.
  - Khi: chủ garage nhập số CCCD/CMND.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập CCCD/CMND"**. Trường này không bắt buộc.
  - Khi: chủ garage nhập giá trị không hợp lệ (không phải số, hoặc độ dài khác 9 và 12 ký tự).
  - Thì: hệ thống hiển thị thông báo lỗi: **"CCCD/CMND chỉ chứa số, độ dài 9 hoặc 12 ký tự"**.

- [ ] **AC-12**: Chọn tỉnh/thành phố
  - Tại: mục **"Thông tin chung"**, trường **"Tỉnh/Thành phố"**.
  - Khi: chủ garage chọn tỉnh/thành phố.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn tỉnh/thành phố"**. Trường này không bắt buộc. Danh sách tỉnh/thành phố được lấy từ danh mục hệ thống.

- [ ] **AC-13**: Chọn phường/xã
  - Tại: mục **"Thông tin chung"**, trường **"Phường/Xã"**.
  - Khi: chủ garage chọn phường/xã.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn phường/xã"**. Trường này không bắt buộc. Danh sách phường/xã được lấy từ danh mục hệ thống.

- [ ] **AC-14**: Nhập địa chỉ
  - Tại: mục **"Thông tin chung"**, trường **"Địa chỉ"**.
  - Khi: chủ garage nhập địa chỉ.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập địa chỉ"**. Trường này không bắt buộc.

- [ ] **AC-15**: Tải ảnh đại diện
  - Tại: mục **"Thông tin chung"**, khu vực ảnh đại diện.
  - Khi: chủ garage tải lên ảnh đại diện.
  - Thì: hệ thống hiển thị nút **"Tải ảnh lên"** và cho phép tải 1 ảnh đại diện cho nhân viên. Trường này không bắt buộc.

#### Mục: Thông tin công việc

- [ ] **AC-16**: Chọn vai trò
  - Tại: mục **"Thông tin công việc"**, trường **"Vai trò"**.
  - Khi: chủ garage chọn vai trò.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn vai trò"**. Trường này bắt buộc. Các tùy chọn gồm: Thợ sửa chữa, Cố vấn dịch vụ, Kế toán, Nhân viên quản lý kho, Nhân viên dịch vụ nhanh, Nhân viên Marketing, Chăm sóc khách hàng, Quản lý nhân sự, Chủ sở hữu.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô chọn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn vai trò."**.

- [ ] **AC-17**: Chọn ngày vào làm
  - Tại: mục **"Thông tin công việc"**, trường **"Ngày vào làm"**.
  - Khi: chủ garage chọn ngày vào làm.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô chọn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn ngày vào làm."**.

### Nhóm C — Phân quyền

- [ ] **AC-18**: Phân quyền tạo nhân viên
  - Tại: màn hình Danh sách nhân viên.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Thêm nhân viên"** và có quyền tạo nhân viên.

### Nhóm D — Xử lý lỗi

- [ ] **AC-19**: Số điện thoại đã tồn tại
  - Tại: form tạo nhân viên, sau khi nhấn nút lưu.
  - Khi: số điện thoại đã tồn tại trong hệ thống của garage.
  - Thì: hệ thống hiển thị hộp thoại **"Nhân viên đã có trên hệ thống"** kèm thông tin nhân viên hiện có (Họ tên, Mã nhân viên, Số điện thoại, Trạng thái). Hộp thoại cung cấp tùy chọn **"Khôi phục hồ sơ"** nếu nhân viên hiện có đã nghỉ việc.

- [ ] **AC-20**: Khôi phục hồ sơ nhân viên từ hộp thoại trùng số điện thoại
  - Tại: hộp thoại **"Nhân viên đã có trên hệ thống"**, nút **"Khôi phục hồ sơ"**.
  - Khi: chủ garage nhấn nút **"Khôi phục hồ sơ"**.
  - Thì: hệ thống khôi phục hồ sơ nhân viên và hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã khôi phục hồ sơ nhân viên thành công."**.

- [ ] **AC-21**: Validation form thất bại
  - Tại: form tạo nhân viên, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-17) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-22**: Tạo nhân viên thất bại do lỗi hệ thống
  - Tại: form tạo nhân viên, sau khi nhấn nút lưu.
  - Khi: hệ thống tạo nhân viên thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Có lỗi xảy ra"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-FOUND.

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Tạo nhân viên: Mutation `CreateEmployee`
- Danh mục tỉnh/thành phố, phường/xã: từ danh mục hệ thống (gf-erp-mdm)

## 5. Business Rules

- **BR-FND-EMP-CRE-001**: Số điện thoại không được trùng trong cùng một garage. Nếu trùng, hệ thống hiển thị hộp thoại thông tin nhân viên đã tồn tại và cho phép khôi phục hồ sơ (nếu nhân viên đã nghỉ việc).
- **BR-FND-EMP-CRE-002**: Mã nhân viên được hệ thống tự sinh theo định dạng chuẩn, không cho phép nhập thủ công. Mã được tạo sau khi lưu thành công.
- **BR-FND-EMP-CRE-003**: Khi tạo nhân viên, hệ thống luôn ghi nhận lịch sử trạng thái **"Đang làm việc"** ban đầu.
- **BR-FND-EMP-CRE-004**: Tỉnh/thành phố và phường/xã (nếu có) được kiểm tra hợp lệ theo danh mục hệ thống. Nếu để trống thì bỏ qua kiểm tra.
- **BR-FND-EMP-CRE-005**: CCCD/CMND chỉ chứa số, độ dài 9 hoặc 12 ký tự.

## 6. Edge Cases

- **EC-1**: Nhân viên có số điện thoại đã tồn tại nhưng trạng thái **"Đã nghỉ việc"** — hệ thống cho phép khôi phục hồ sơ thay vì tạo mới.
- **EC-2**: Nhân viên có số điện thoại đã tồn tại và trạng thái **"Đang làm việc"** hoặc **"Tạm nghỉ"** — hệ thống chỉ hiển thị thông tin nhân viên hiện có, không cho phép tạo thêm.
- **EC-3**: Tỉnh/thành phố hoặc phường/xã không tìm thấy trong danh mục hệ thống — hệ thống báo lỗi validation.

## 7. Out of Scope

- Chỉnh sửa thông tin nhân viên sau khi tạo → xem `FEAT-FND-EMP-EDIT`.
- Cấp tài khoản hệ thống (SSO) cho nhân viên — thuộc chức năng quản lý tài khoản, không thuộc luồng tạo nhân viên.
- Quản lý trạng thái làm việc (tạm nghỉ, nghỉ việc, kích hoạt lại) — thuộc chức năng lifecycle nhân viên.
- Đổi vai trò nhân viên — thuộc chức năng quản lý vai trò.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms v2 + garage-web (employees create/form sections) |
