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

# FEAT-CUST-IMPORT: Import khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CUST-IMPORT` |
| Title | Import khách hàng |
| Parent Epic | `EP-CUSTOMER` |
| Boundary | `gf-customer` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** import danh sách khách hàng từ file Excel, **so that** có thể nhanh chóng thêm nhiều khách hàng vào hệ thống mà không cần nhập tay từng người.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Tải file, kiểm tra dữ liệu, xem kết quả kiểm tra, xác nhận import

- [ ] **AC-1**: Tải file Excel lên hệ thống
  - Tại: màn hình **"Import khách hàng"**.
  - Khi: chủ garage tải lên file Excel (.xlsx).
  - Thì: hệ thống nhận file và hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tải file thành công."**.

- [ ] **AC-2**: Tải về mẫu file import
  - Tại: màn hình Danh sách khách hàng.
  - Khi: chủ garage nhấn nút **"Tải về"**.
  - Thì: hệ thống tải về file mẫu **"Mẫu file danh sách khách hàng.xlsx"** để chủ garage điền thông tin khách hàng theo đúng định dạng.

- [ ] **AC-3**: Kiểm tra dữ liệu import (pre-validate)
  - Tại: màn hình **"Import khách hàng"**, sau khi tải file lên thành công.
  - Khi: hệ thống gọi kiểm tra dữ liệu thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tải file thành công."**. Màn hình hiển thị tóm tắt kết quả kiểm tra: **"Hợp lệ:"** kèm số lượng bản ghi hợp lệ và **"Không hợp lệ:"** kèm số lượng bản ghi không hợp lệ.

- [ ] **AC-4**: Xem danh sách kết quả kiểm tra
  - Tại: màn hình **"Import khách hàng"**, mục **"Thông tin cơ bản"**, sau khi kiểm tra dữ liệu hoàn tất.
  - Khi: chủ garage xem kết quả kiểm tra.
  - Thì: hệ thống hiển thị bảng dữ liệu với các cột: **"Họ và tên"**, **"Số điện thoại"**, **"Giới tính"**, **"Lỗi"**. Các bản ghi không hợp lệ hiển thị thông tin lỗi tại cột **"Lỗi"**.

- [ ] **AC-5**: Tìm kiếm trong danh sách kết quả kiểm tra
  - Tại: màn hình **"Import khách hàng"**, mục **"Thông tin cơ bản"**.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo tên hoặc số điện thoại. Placeholder: **"Tìm kiếm theo tên, số điện thoại"**.

- [ ] **AC-6**: Xác nhận import khách hàng
  - Tại: màn hình **"Import khách hàng"**, sau khi kiểm tra dữ liệu hoàn tất và có ít nhất 1 bản ghi hợp lệ.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống thực hiện import các bản ghi hợp lệ vào hệ thống. Các bản ghi không hợp lệ bị bỏ qua, không import. Khách hàng có số điện thoại trùng với khách hàng đã tồn tại trong garage được bỏ qua (skip duplicates).

- [ ] **AC-7**: Hủy bỏ import
  - Tại: màn hình **"Import khách hàng"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống hủy thao tác import và quay về màn hình Danh sách khách hàng. Dữ liệu đã tải lên không được lưu.

- [ ] **AC-8**: Điều kiện nút xác nhận
  - Tại: màn hình **"Import khách hàng"**, nút **"Xác nhận"**.
  - Khi: hệ thống đã kiểm tra dữ liệu và có ít nhất 1 bản ghi hợp lệ, đồng thời không đang gửi yêu cầu.
  - Thì: nút **"Xác nhận"** ở trạng thái khả dụng (enabled).
  - Khi: chưa kiểm tra dữ liệu, hoặc không có bản ghi hợp lệ nào, hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Xác nhận"** ở trạng thái bị mờ (disabled).

### Nhóm B — Phân quyền

- [ ] **AC-9**: Phân quyền import khách hàng
  - Tại: màn hình Danh sách khách hàng.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền truy cập chức năng import khách hàng và thực hiện toàn bộ luồng tải file, kiểm tra, xác nhận import.

### Nhóm C — Xử lý lỗi

- [ ] **AC-10**: File không đúng định dạng
  - Tại: màn hình **"Import khách hàng"**.
  - Khi: chủ garage tải lên file không phải định dạng .xlsx.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và từ chối xử lý file. Hệ thống không chuyển sang bước kiểm tra dữ liệu.

- [ ] **AC-11**: Dữ liệu số điện thoại không hợp lệ
  - Tại: màn hình **"Import khách hàng"**, bước kiểm tra dữ liệu.
  - Khi: bản ghi trong file có số điện thoại không đúng định dạng (không phải 10 chữ số bắt đầu bằng 0).
  - Thì: bản ghi được đánh dấu **"Không hợp lệ"** và hiển thị lỗi tại cột **"Lỗi"** trong bảng kết quả kiểm tra.

- [ ] **AC-12**: Số điện thoại trùng với khách hàng đã tồn tại trong garage
  - Tại: màn hình **"Import khách hàng"**, bước xác nhận import.
  - Khi: bản ghi hợp lệ có số điện thoại trùng với khách hàng đã tồn tại trong garage.
  - Thì: hệ thống tự động bỏ qua bản ghi trùng lặp, không tạo thêm khách hàng mới cho số điện thoại đó.

- [ ] **AC-13**: Import thất bại do lỗi hệ thống
  - Tại: màn hình **"Import khách hàng"**, sau khi nhấn nút **"Xác nhận"**.
  - Khi: hệ thống import thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Màn hình giữ nguyên trạng thái hiện tại để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CUSTOMER.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Kiểm tra dữ liệu import: Mutation `VerifyImportCustomers`
- Import khách hàng: Mutation `ImportCustomers`

## 5. Business Rules

- **BR-CUST-IMP-001**: Số điện thoại khách hàng phải đúng 10 chữ số và bắt đầu bằng số 0. Bản ghi có số điện thoại không hợp lệ bị đánh dấu lỗi trong bước kiểm tra.
- **BR-CUST-IMP-002**: Mỗi khách hàng trong một garage là duy nhất theo số điện thoại. Khi import, các bản ghi có số điện thoại trùng với khách hàng đã tồn tại được tự động bỏ qua (skip duplicates).
- **BR-CUST-IMP-003**: File import phải đúng định dạng .xlsx theo mẫu file **"Mẫu file danh sách khách hàng.xlsx"** do hệ thống cung cấp.
- **BR-CUST-IMP-004**: Dữ liệu import bao gồm các trường: họ và tên, số điện thoại, email, ngày sinh, giới tính, địa chỉ, tỉnh/thành phố, phường/xã, nguồn khách hàng, ghi chú. Trong đó họ và tên và số điện thoại là bắt buộc.

## 6. Edge Cases

- **EC-1**: File Excel rỗng (không có bản ghi nào) — hệ thống thông báo không có dữ liệu để import.
- **EC-2**: Toàn bộ bản ghi trong file đều không hợp lệ — hệ thống hiển thị **"Hợp lệ:"** 0 và nút **"Xác nhận"** bị mờ (disabled).
- **EC-3**: Nhiều bản ghi trong cùng file có số điện thoại trùng nhau — hệ thống xử lý theo thứ tự và bỏ qua bản ghi trùng lặp sau.

## 7. Out of Scope

- Tạo khách hàng đơn lẻ từ form nhập liệu → xem `FEAT-CUST-CREATE`.
- Chỉnh sửa thông tin khách hàng sau khi import → xem `FEAT-CUST-EDIT`.
- Export danh sách khách hàng ra file Excel — không thuộc luồng import.
- Quản lý phân khúc khách hàng sau khi import → thuộc `EP-MARKETING`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (customers import flow) |
