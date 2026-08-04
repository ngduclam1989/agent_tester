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

# FEAT-CUST-LIST: Danh sách khách hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CUST-LIST` |
| Title | Danh sách khách hàng |
| Parent Epic | `EP-CUSTOMER` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách khách hàng với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và tra cứu nhanh thông tin khách hàng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách khách hàng
  - Tại: menu hệ thống, mục quản lý khách hàng.
  - Khi: chủ garage truy cập chức năng quản lý khách hàng.
  - Thì: hệ thống hiển thị màn hình **"Danh sách khách hàng"** với bảng dữ liệu gồm các cột: **"Mã khách hàng"**, **"Tên khách hàng"**, **"Số điện thoại"**, **"Email"**, **"Nguồn"**, **"Trạng thái"**, **"Tổng chi tiêu"**, **"Số lần booking"**, **"Lần ghé thăm gần nhất"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái khách hàng với badge
  - Tại: màn hình Danh sách khách hàng, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng khách hàng.
  - Thì: trạng thái hiển thị dưới dạng badge với giá trị:
    - **"Đang hoạt động"**
    - **"Ngừng hoạt động"**

- [ ] **AC-3**: Tìm kiếm khách hàng theo từ khóa
  - Tại: màn hình Danh sách khách hàng, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên hoặc số điện thoại. Placeholder: **"Tìm theo tên, số điện thoại"**. Kết quả được cập nhật tự động.

- [ ] **AC-4**: Phân trang danh sách
  - Tại: màn hình Danh sách khách hàng, cuối bảng dữ liệu.
  - Khi: danh sách khách hàng vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-5**: Nhấn vào dòng để xem chi tiết khách hàng
  - Tại: màn hình Danh sách khách hàng, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng khách hàng.
  - Thì: hệ thống chuyển sang màn hình Chi tiết khách hàng tương ứng (xem `FEAT-CUST-DETAIL`).

- [ ] **AC-6**: Nút tải lên (import)
  - Tại: màn hình Danh sách khách hàng, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tải lên"**.
  - Thì: hệ thống chuyển sang màn hình tải lên danh sách khách hàng (xem `FEAT-CUST-IMPORT`).

- [ ] **AC-7**: Nút tạo khách hàng mới
  - Tại: màn hình Danh sách khách hàng, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút tạo khách hàng mới.
  - Thì: hệ thống chuyển sang màn hình tạo khách hàng mới (xem `FEAT-CUST-CREATE`).

- [ ] **AC-8**: Tải mẫu file import
  - Tại: màn hình Danh sách khách hàng hoặc màn hình tải lên.
  - Khi: chủ garage nhấn tải mẫu file.
  - Thì: hệ thống tải xuống file **"Mẫu file danh sách khách hàng.xlsx"** — file mẫu chuẩn để nhập liệu khách hàng hàng loạt.

- [ ] **AC-9**: Danh sách trống
  - Tại: màn hình Danh sách khách hàng.
  - Khi: không có khách hàng nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-10**: Phân quyền xem danh sách khách hàng
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách khách hàng, tìm kiếm, lọc, và điều hướng sang chi tiết, tạo mới hoặc tải lên. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CUSTOMER.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Danh sách khách hàng: Query `SearchCustomers`

## 5. Business Rules

- **BR-CUST-LST-001**: Danh sách khách hàng luôn được phạm vi theo garage hiện tại — không hiển thị khách hàng của garage khác.
- **BR-CUST-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho tên và số điện thoại khách hàng.
- **BR-CUST-LST-003**: Trạng thái khách hàng chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**.
- **BR-CUST-LST-004**: File mẫu import **"Mẫu file danh sách khách hàng.xlsx"** phải luôn khả dụng để tải xuống từ màn hình danh sách.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có khách hàng nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Khách hàng không có email — cột **"Email"** hiển thị trống.

## 7. Out of Scope

- Chi tiết khách hàng → xem `FEAT-CUST-DETAIL`.
- Tạo khách hàng mới → xem `FEAT-CUST-CREATE`.
- Chỉnh sửa thông tin khách hàng → xem `FEAT-CUST-EDIT`.
- Tải lên danh sách khách hàng → xem `FEAT-CUST-IMPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (customer list screen, SearchCustomers query) |
