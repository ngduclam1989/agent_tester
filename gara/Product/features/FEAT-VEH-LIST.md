---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-VEHICLE"
boundary: "gf-customer"
last_reviewed: "2026-05-27"
---

# FEAT-VEH-LIST: Danh sách xe

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-VEH-LIST` |
| Title | Danh sách xe |
| Parent Epic | `EP-VEHICLE` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách tất cả xe trong hệ thống với tìm kiếm, lọc và xuất file, **so that** tôi có thể theo dõi xe khách hàng, lịch sử ghé thăm và chi tiêu.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách xe
  - Tại: menu hệ thống, mục quản lý xe.
  - Khi: chủ garage truy cập chức năng quản lý xe.
  - Thì: hệ thống hiển thị màn hình **"Danh sách xe"** với bảng dữ liệu gồm các cột: **"Biển số"**, **"Hãng xe"**, **"Dòng xe"**, **"Năm SX"**, **"Số KM gần nhất"**, **"Lần cuối đến garage"**, **"Tổng chi tiêu"**, **"Tên khách hàng"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm xe theo từ khóa
  - Tại: màn hình Danh sách xe, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với biển số hoặc tên khách hàng. Placeholder: **"Tìm kiếm biển số, tên khách hàng"**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Lọc theo hãng xe và dòng xe
  - Tại: màn hình Danh sách xe, bộ lọc **"Hãng xe & Dòng xe"**.
  - Khi: chủ garage chọn giá trị lọc theo hãng xe và dòng xe.
  - Thì: hệ thống hiển thị danh sách xe khớp với hãng xe và dòng xe đã chọn. Đây là bộ lọc kết hợp — khi chọn hãng xe, danh sách dòng xe được lọc theo hãng đã chọn.

- [ ] **AC-4**: Lọc theo năm sản xuất
  - Tại: màn hình Danh sách xe, bộ lọc **"Năm sản xuất"**.
  - Khi: chủ garage chọn giá trị lọc theo năm sản xuất.
  - Thì: hệ thống hiển thị danh sách xe khớp với năm sản xuất đã chọn.

- [ ] **AC-5**: Lọc theo số Km gần nhất
  - Tại: màn hình Danh sách xe, bộ lọc **"Số Km gần nhất"**.
  - Khi: chủ garage chọn giá trị lọc theo số Km gần nhất.
  - Thì: hệ thống hiển thị danh sách xe khớp với khoảng số Km đã chọn.

- [ ] **AC-6**: Lọc theo lần cuối đến garage
  - Tại: màn hình Danh sách xe, bộ lọc **"Lần cuối đến Garage"**.
  - Khi: chủ garage chọn giá trị lọc theo lần cuối đến garage.
  - Thì: hệ thống hiển thị danh sách xe khớp với khoảng thời gian đã chọn.

- [ ] **AC-7**: Phân trang danh sách
  - Tại: màn hình Danh sách xe, cuối bảng dữ liệu.
  - Khi: danh sách xe vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-8**: Nhấn vào dòng để xem chi tiết xe
  - Tại: màn hình Danh sách xe, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng xe.
  - Thì: hệ thống chuyển sang màn hình Chi tiết xe tương ứng (xem `FEAT-VEH-DETAIL`).

### Nhóm B — Xuất file

- [ ] **AC-9**: Nút xuất file danh sách xe
  - Tại: màn hình Danh sách xe, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Xuất file"**.
  - Thì: hệ thống xuất danh sách xe hiện tại (bao gồm điều kiện tìm kiếm và lọc đang áp dụng) ra file Excel và tải xuống cho người dùng.

### Nhóm C — Phân quyền

- [ ] **AC-10**: Phân quyền xem danh sách xe
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách xe, tìm kiếm, lọc, xuất file và điều hướng sang chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

> **NEED CLARIFICATION**: KG chứa thông báo **"Bạn không có quyền xuất file Excel."** — tuy nhiên theo mô hình phân quyền hiện tại (§10 _RULES.md) cả chủ garage và kế toán đều có quyền ngang nhau (ngoại trừ nhóm chat theo xe). Cần Business Authority xác nhận: thông báo này áp dụng cho trường hợp nào? Có vai trò nào bị giới hạn xuất file không?

### Nhóm D — Trạng thái trống và lỗi

- [ ] **AC-11**: Danh sách trống
  - Tại: màn hình Danh sách xe.
  - Khi: không có xe nào trong hệ thống hoặc không có xe nào phù hợp với điều kiện tìm kiếm/lọc.
  - Thì: hệ thống hiển thị thông báo: **"Hiện chưa có xe nào trong hệ thống."**

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-VEHICLE.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Danh sách xe: Query `SearchVehicles`

## 5. Business Rules

- **BR-VEH-LST-001**: Danh sách xe luôn được phạm vi theo garage hiện tại — không hiển thị xe của garage khác.
- **BR-VEH-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho biển số và tên khách hàng.
- **BR-VEH-LST-003**: Bộ lọc **"Hãng xe & Dòng xe"** là bộ lọc kết hợp — danh sách dòng xe phụ thuộc vào hãng xe đã chọn.
- **BR-VEH-LST-004**: Xuất file Excel áp dụng các điều kiện tìm kiếm và lọc đang hiển thị — không phải toàn bộ dữ liệu xe.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có xe nào — hiển thị thông báo **"Hiện chưa có xe nào trong hệ thống."**
- **EC-2**: Kết hợp nhiều bộ lọc và tìm kiếm cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Xe không có thông tin năm sản xuất hoặc số Km — cột tương ứng hiển thị trống.
- **EC-4**: Xe chưa từng đến garage (chưa có phiếu dịch vụ) — cột **"Lần cuối đến garage"** và **"Tổng chi tiêu"** hiển thị trống hoặc giá trị mặc định 0.

## 7. Out of Scope

- Tạo/chỉnh sửa xe: thuộc `FEAT-CUST-CREATE`, `FEAT-CUST-EDIT` (quản lý xe trong khách hàng).
- Chi tiết xe: thuộc `FEAT-VEH-DETAIL`.
- Chat xe: thuộc `EP-SUPPORT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (vehicles list screen, SearchVehicles query) |
