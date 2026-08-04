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

# FEAT-FND-EMP-LIST: Danh sách nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-LIST` |
| Title | Danh sách nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách nhân viên với khả năng tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý đội ngũ nhân viên, nắm bắt nhanh trạng thái làm việc và trạng thái tài khoản của từng người.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách nhân viên
  - Tại: menu hệ thống, mục quản lý nhân viên.
  - Khi: chủ garage truy cập chức năng quản lý nhân viên.
  - Thì: hệ thống hiển thị màn hình **"Danh sách nhân viên"** với bảng dữ liệu gồm các cột: **"Mã nhân viên"**, **"Họ và tên"**, **"Năm sinh"**, **"Số điện thoại"**, **"Vai trò"**, **"Ngày vào làm"**, **"Tài khoản"**, **"Trạng thái"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái nhân viên với badge màu
  - Tại: màn hình Danh sách nhân viên, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng nhân viên.
  - Thì: trạng thái hiển thị dưới dạng badge với màu tương ứng:
    - **"Đang làm việc"** — badge màu xanh (blue).
    - **"Tạm nghỉ"** — badge màu cam (orange).
    - **"Đã nghỉ việc"** — badge màu đỏ (red).

- [ ] **AC-3**: Hiển thị trạng thái tài khoản
  - Tại: màn hình Danh sách nhân viên, cột **"Tài khoản"**.
  - Khi: hệ thống hiển thị giá trị trạng thái tài khoản của từng nhân viên.
  - Thì: trạng thái tài khoản hiển thị theo các giá trị:
    - **"Chưa cấp tài khoản"**
    - **"Đang tạo tài khoản"**
    - **"Đang hoạt động"**
    - **"Đã vô hiệu hóa"**
    - **"Tạo thất bại"**

- [ ] **AC-4**: Hiển thị vai trò nhân viên
  - Tại: màn hình Danh sách nhân viên, cột **"Vai trò"**.
  - Khi: hệ thống hiển thị vai trò của từng nhân viên.
  - Thì: vai trò hiển thị theo tên tiếng Việt: Thợ sửa chữa, Cố vấn dịch vụ, Kế toán, Nhân viên quản lý kho, Nhân viên dịch vụ nhanh, Nhân viên Marketing, Chăm sóc khách hàng, Quản lý nhân sự, Chủ sở hữu.

- [ ] **AC-5**: Tìm kiếm nhân viên theo từ khóa
  - Tại: màn hình Danh sách nhân viên, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên, mã nhân viên hoặc số điện thoại. Placeholder: **"Tìm kiếm tên, mã nhân viên, sđt"**. Kết quả được cập nhật tự động.

- [ ] **AC-6**: Lọc theo vai trò
  - Tại: màn hình Danh sách nhân viên, bộ lọc **"Vai trò"**.
  - Khi: chủ garage chọn giá trị lọc theo vai trò.
  - Thì: hệ thống hiển thị danh sách nhân viên khớp với vai trò đã chọn. Các tùy chọn gồm: Thợ sửa chữa, Cố vấn dịch vụ, Kế toán, Nhân viên quản lý kho, Nhân viên dịch vụ nhanh, Nhân viên Marketing, Chăm sóc khách hàng, Quản lý nhân sự, Chủ sở hữu.

- [ ] **AC-7**: Lọc theo trạng thái
  - Tại: màn hình Danh sách nhân viên, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị lọc theo trạng thái.
  - Thì: hệ thống hiển thị danh sách nhân viên khớp với trạng thái đã chọn. Các tùy chọn gồm: **"Đang làm việc"**, **"Tạm nghỉ"**, **"Đã nghỉ việc"**.

- [ ] **AC-8**: Lọc theo trạng thái tài khoản
  - Tại: màn hình Danh sách nhân viên, bộ lọc **"Trạng thái tài khoản"**.
  - Khi: chủ garage chọn giá trị lọc theo trạng thái tài khoản.
  - Thì: hệ thống hiển thị danh sách nhân viên khớp với trạng thái tài khoản đã chọn.

- [ ] **AC-9**: Phân trang danh sách
  - Tại: màn hình Danh sách nhân viên, cuối bảng dữ liệu.
  - Khi: danh sách nhân viên vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-10**: Nhấn vào dòng để xem chi tiết nhân viên
  - Tại: màn hình Danh sách nhân viên, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng nhân viên.
  - Thì: hệ thống chuyển sang màn hình Chi tiết nhân viên tương ứng (xem `FEAT-FND-EMP-DETAIL`).

- [ ] **AC-11**: Nút chỉnh sửa trong cột thao tác
  - Tại: màn hình Danh sách nhân viên, cột **"Thao tác"** của dòng nhân viên có trạng thái **"Đang làm việc"**.
  - Khi: chủ garage xem danh sách nhân viên.
  - Thì: cột **"Thao tác"** hiển thị nút chỉnh sửa. Khi nhấn, hệ thống chuyển sang màn hình chỉnh sửa nhân viên (xem `FEAT-FND-EMP-EDIT`).

- [ ] **AC-12**: Ẩn nút chỉnh sửa khi nhân viên không ở trạng thái phù hợp
  - Tại: màn hình Danh sách nhân viên, cột **"Thao tác"** của dòng nhân viên có trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem danh sách nhân viên.
  - Thì: cột **"Thao tác"** không hiển thị nút chỉnh sửa.

- [ ] **AC-13**: Nút tạo nhân viên
  - Tại: màn hình Danh sách nhân viên, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm nhân viên"**.
  - Thì: hệ thống chuyển sang màn hình tạo nhân viên mới (xem `FEAT-FND-EMP-CREATE`).

- [ ] **AC-14**: Danh sách trống
  - Tại: màn hình Danh sách nhân viên.
  - Khi: không có nhân viên nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo: **"Không tìm thấy nhân viên nào phù hợp với điều kiện lọc"**.

### Nhóm B — Phân quyền

- [ ] **AC-15**: Phân quyền xem danh sách nhân viên
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách nhân viên, tìm kiếm, lọc, và điều hướng sang chi tiết hoặc chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-FOUND.

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Danh sách nhân viên: Query `SearchEmployees`

## 5. Business Rules

- **BR-FND-EMP-LST-001**: Danh sách nhân viên luôn được phạm vi theo garage hiện tại — không hiển thị nhân viên của garage khác.
- **BR-FND-EMP-LST-002**: Nút chỉnh sửa trong cột **"Thao tác"** chỉ hiển thị cho nhân viên có trạng thái **"Đang làm việc"**. Nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** không hiển thị nút chỉnh sửa.
- **BR-FND-EMP-LST-003**: Trạng thái nhân viên hiển thị dưới dạng badge với màu phân biệt để nhận dạng nhanh.
- **BR-FND-EMP-LST-004**: Tìm kiếm từ khóa áp dụng đồng thời cho tên, mã nhân viên và số điện thoại.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có nhân viên nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp bộ lọc và tìm kiếm cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.

## 7. Out of Scope

- Chi tiết nhân viên và các nút hành động trạng thái → xem `FEAT-FND-EMP-DETAIL`.
- Tạo nhân viên mới → xem `FEAT-FND-EMP-CREATE`.
- Chỉnh sửa thông tin nhân viên → xem `FEAT-FND-EMP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms v2 + garage-web (employees list screen, use-employee-list-for-web, use-search-employees) |
