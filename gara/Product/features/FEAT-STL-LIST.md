---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SETTLEMENT"
boundary: "gf-accounting"
last_reviewed: "2026-05-27"
---

# FEAT-STL-LIST: Danh sách phiếu quyết toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STL-LIST` |
| Title | Danh sách phiếu quyết toán |
| Parent Epic | `EP-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu quyết toán với tìm kiếm và lọc, **so that** tôi có thể quản lý và theo dõi trạng thái quyết toán của các phiếu dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách phiếu quyết toán
  - Tại: menu hệ thống, mục quyết toán.
  - Khi: chủ garage truy cập chức năng quản lý phiếu quyết toán.
  - Thì: hệ thống hiển thị màn hình **"Danh sách phiếu quyết toán"** với bảng dữ liệu gồm các cột: **"Mã quyết toán"**, **"Phiếu dịch vụ"**, **"Tên khách hàng"**, **"Số điện thoại"**, **"Bên thanh toán"**, **"Tổng tiền"**, **"Trạng thái"**, **"Trạng thái thanh toán"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái phiếu quyết toán với badge
  - Tại: màn hình Danh sách phiếu quyết toán, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng phiếu quyết toán.
  - Thì: trạng thái hiển thị dưới dạng badge với giá trị:
    - **"Hoạt động"**
    - **"Đã hủy"**

- [ ] **AC-3**: Hiển thị trạng thái thanh toán với badge
  - Tại: màn hình Danh sách phiếu quyết toán, cột **"Trạng thái thanh toán"**.
  - Khi: hệ thống hiển thị giá trị trạng thái thanh toán của từng phiếu quyết toán.
  - Thì: trạng thái thanh toán hiển thị dưới dạng badge với giá trị:
    - **"Chờ thanh toán"**
    - **"Đã thanh toán"**
    - **"Chưa thanh toán"**
    - **"Thanh toán một phần"**

- [ ] **AC-4**: Hiển thị bên thanh toán
  - Tại: màn hình Danh sách phiếu quyết toán, cột **"Bên thanh toán"**.
  - Khi: hệ thống hiển thị giá trị bên thanh toán của từng phiếu quyết toán.
  - Thì: bên thanh toán hiển thị với giá trị:
    - **"Khách hàng"**
    - **"Bảo hiểm"**

- [ ] **AC-5**: Tìm kiếm phiếu quyết toán theo từ khóa
  - Tại: màn hình Danh sách phiếu quyết toán, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã quyết toán, mã phiếu dịch vụ, tên khách hàng hoặc số điện thoại khách hàng. Placeholder: **"Tìm mã quyết toán, mã phiếu dịch vụ, tên KH, SĐT khách hàng"**. Kết quả được cập nhật tự động.

- [ ] **AC-6**: Lọc theo loại phiếu
  - Tại: màn hình Danh sách phiếu quyết toán, bộ lọc.
  - Khi: chủ garage chọn lọc theo loại phiếu.
  - Thì: hệ thống hiển thị tùy chọn:
    - **"Bán phụ tùng"**
    - **"Dịch vụ xe"**

- [ ] **AC-7**: Lọc theo trạng thái
  - Tại: màn hình Danh sách phiếu quyết toán, bộ lọc.
  - Khi: chủ garage chọn lọc theo trạng thái.
  - Thì: hệ thống hiển thị tùy chọn:
    - **"Hoạt động"**
    - **"Đã hủy"**

- [ ] **AC-8**: Lọc theo trạng thái thanh toán
  - Tại: màn hình Danh sách phiếu quyết toán, bộ lọc.
  - Khi: chủ garage chọn lọc theo trạng thái thanh toán.
  - Thì: hệ thống hiển thị tùy chọn:
    - **"Chờ thanh toán"**
    - **"Đã thanh toán"**
    - **"Chưa thanh toán"**
    - **"Thanh toán một phần"**

- [ ] **AC-9**: Lọc theo bên thanh toán
  - Tại: màn hình Danh sách phiếu quyết toán, bộ lọc.
  - Khi: chủ garage chọn lọc theo bên thanh toán.
  - Thì: hệ thống hiển thị tùy chọn:
    - **"Khách hàng"**
    - **"Bảo hiểm"**

- [ ] **AC-10**: Lọc theo công ty bảo hiểm
  - Tại: màn hình Danh sách phiếu quyết toán, bộ lọc **"Công ty bảo hiểm"**.
  - Khi: chủ garage chọn lọc theo công ty bảo hiểm.
  - Thì: hệ thống hiển thị danh sách công ty bảo hiểm để lọc. Chỉ hiển thị phiếu quyết toán có bên thanh toán là **"Bảo hiểm"** và thuộc công ty bảo hiểm đã chọn.

- [ ] **AC-11**: Phân trang danh sách
  - Tại: màn hình Danh sách phiếu quyết toán, cuối bảng dữ liệu.
  - Khi: danh sách phiếu quyết toán vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-12**: Nhấn vào dòng để xem chi tiết phiếu quyết toán
  - Tại: màn hình Danh sách phiếu quyết toán, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng phiếu quyết toán.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phiếu quyết toán tương ứng (xem `FEAT-STL-DETAIL`).

- [ ] **AC-13**: Nút sửa trong cột Thao tác
  - Tại: màn hình Danh sách phiếu quyết toán, cột **"Thao tác"**.
  - Khi: chủ garage nhấn icon sửa trên dòng phiếu quyết toán.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phiếu quyết toán ở chế độ chỉnh sửa (xem `FEAT-STL-DETAIL`).

- [ ] **AC-14**: Danh sách trống — không có phiếu quyết toán nào
  - Tại: màn hình Danh sách phiếu quyết toán.
  - Khi: hệ thống chưa có phiếu quyết toán nào.
  - Thì: hệ thống hiển thị thông báo: **"Hiện chưa có phiếu quyết toán nào trong hệ thống."**

- [ ] **AC-15**: Danh sách trống — không tìm thấy kết quả phù hợp
  - Tại: màn hình Danh sách phiếu quyết toán.
  - Khi: không có phiếu quyết toán nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo: **"Không tìm thấy phiếu quyết toán phù hợp."**

### Nhóm B — Phân quyền

- [ ] **AC-16**: Phân quyền xem danh sách phiếu quyết toán
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách phiếu quyết toán, tìm kiếm, lọc, và điều hướng sang chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SETTLEMENT.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`)
- Danh sách phiếu quyết toán: Query `SearchSettlements`

## 5. Business Rules

- **BR-STL-LST-001**: Danh sách phiếu quyết toán luôn được phạm vi theo garage hiện tại — không hiển thị phiếu quyết toán của garage khác.
- **BR-STL-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã quyết toán, mã phiếu dịch vụ, tên khách hàng và số điện thoại khách hàng.
- **BR-STL-LST-003**: Trạng thái phiếu quyết toán chỉ có hai giá trị: **"Hoạt động"** và **"Đã hủy"**.
- **BR-STL-LST-004**: Trạng thái thanh toán có bốn giá trị: **"Chờ thanh toán"**, **"Đã thanh toán"**, **"Chưa thanh toán"** và **"Thanh toán một phần"**.
- **BR-STL-LST-005**: Bên thanh toán chỉ có hai giá trị: **"Khách hàng"** và **"Bảo hiểm"**.
- **BR-STL-LST-006**: Loại phiếu quyết toán chỉ có hai giá trị: **"Bán phụ tùng"** và **"Dịch vụ xe"**.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có phiếu quyết toán nào — hiển thị thông báo: **"Hiện chưa có phiếu quyết toán nào trong hệ thống."**
- **EC-2**: Kết hợp nhiều bộ lọc cùng lúc (loại phiếu, trạng thái, trạng thái thanh toán, bên thanh toán, công ty bảo hiểm) — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Phiếu quyết toán không có tên khách hàng hoặc số điện thoại — cột tương ứng hiển thị trống.

## 7. Out of Scope

- Chi tiết phiếu quyết toán → xem `FEAT-STL-DETAIL`.
- Tạo phiếu quyết toán → xem `FEAT-STL-CREATE`.
- Thanh toán phiếu dịch vụ → thuộc `FEAT-SO-DETAIL` (EP-SERVICE-ORDER).
- Quản lý trạng thái phiếu dịch vụ → thuộc `EP-SERVICE-ORDER`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-accounting + garage-web (settlement-voucher list screen, SearchSettlements query, bộ lọc loại phiếu/trạng thái/thanh toán/bên thanh toán/công ty bảo hiểm) |
