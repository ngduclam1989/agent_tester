---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-ID-LIST: Danh sách phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-LIST` |
| Title | Danh sách phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu xuất kho với tìm kiếm, lọc theo trạng thái, nguồn xuất, ngày tạo và phân trang, **so that** tôi có thể theo dõi, tra cứu và quản lý toàn bộ phiếu xuất kho của garage.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách phiếu xuất kho
  - Tại: menu hệ thống, mục quản lý kho.
  - Khi: chủ garage truy cập chức năng xuất kho.
  - Thì: hệ thống hiển thị màn hình **"Danh sách phiếu xuất kho"** với bảng dữ liệu gồm các cột: **"Mã phiếu xuất kho"**, **"Nguồn xuất"**, **"Mã phiếu dịch vụ"**, **"Trạng thái"**, **"Phụ tùng xuất"**, **"Tên khách hàng"**, **"Người tạo"**, **"Người duyệt"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái phiếu xuất kho với badge
  - Tại: màn hình Danh sách phiếu xuất kho, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng phiếu.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Chờ duyệt"**
    - **"Đã duyệt"**
    - **"Đã hủy"**
    - **"Hoàn tác"**

- [ ] **AC-3**: Hiển thị nguồn xuất
  - Tại: màn hình Danh sách phiếu xuất kho, cột **"Nguồn xuất"**.
  - Khi: hệ thống hiển thị giá trị nguồn xuất của từng phiếu.
  - Thì: nguồn xuất hiển thị với các giá trị:
    - **"Mua ngoài"**
    - **"Nền tảng"**

- [ ] **AC-4**: Tìm kiếm phiếu xuất kho theo từ khóa
  - Tại: màn hình Danh sách phiếu xuất kho, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã phiếu xuất kho hoặc mã phiếu dịch vụ. Placeholder: **"Tìm theo mã phiếu xuất kho, mã phiếu dịch vụ"**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Lọc theo trạng thái
  - Tại: màn hình Danh sách phiếu xuất kho, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị trạng thái để lọc.
  - Thì: hệ thống lọc danh sách chỉ hiển thị các phiếu có trạng thái tương ứng. Các giá trị lọc: **"Chờ duyệt"**, **"Đã duyệt"**, **"Đã hủy"**, **"Hoàn tác"**.

- [ ] **AC-6**: Lọc theo nguồn xuất
  - Tại: màn hình Danh sách phiếu xuất kho, bộ lọc **"Nguồn xuất"**.
  - Khi: chủ garage chọn giá trị nguồn xuất để lọc.
  - Thì: hệ thống lọc danh sách chỉ hiển thị các phiếu có nguồn xuất tương ứng. Các giá trị lọc: **"Mua ngoài"**, **"Nền tảng"**.

- [ ] **AC-7**: Lọc theo ngày tạo
  - Tại: màn hình Danh sách phiếu xuất kho, bộ lọc **"Ngày tạo"**.
  - Khi: chủ garage chọn khoảng ngày tạo.
  - Thì: hệ thống lọc danh sách chỉ hiển thị các phiếu được tạo trong khoảng ngày đã chọn.

- [ ] **AC-8**: Phân trang danh sách
  - Tại: màn hình Danh sách phiếu xuất kho, cuối bảng dữ liệu.
  - Khi: danh sách phiếu xuất kho vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-9**: Nhấn vào dòng để xem chi tiết phiếu xuất kho
  - Tại: màn hình Danh sách phiếu xuất kho, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng phiếu xuất kho.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phiếu xuất kho tương ứng (xem `FEAT-ID-DETAIL`).

- [ ] **AC-10**: Xem sản phẩm trong phiếu từ danh sách
  - Tại: màn hình Danh sách phiếu xuất kho, cột **"Phụ tùng xuất"**.
  - Khi: chủ garage nhấn vào giá trị phụ tùng xuất của một phiếu.
  - Thì: hệ thống mở modal **"Danh sách sản phẩm trong phiếu xuất kho"** hiển thị danh sách sản phẩm của phiếu đó với các cột: **"Tên phụ tùng"**, **"Mã Genuine"**, **"Phân khúc"**, **"Xuất xứ"**, **"Đơn vị kho"**, **"SL xuất"**, **"Đơn vị bán"**, **"Quy đổi"**. Modal có nút **"Đóng"** để đóng.

- [ ] **AC-11**: Nút tạo phiếu xuất kho mới
  - Tại: màn hình Danh sách phiếu xuất kho, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tạo phiếu xuất kho mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo phiếu xuất kho mới (xem `FEAT-ID-CREATE`).

- [ ] **AC-12**: Xuất file danh sách phiếu xuất kho
  - Tại: màn hình Danh sách phiếu xuất kho, nút **"Xuất file"**.
  - Khi: chủ garage nhấn nút **"Xuất file"**.
  - Thì: hệ thống tải xuống file chứa danh sách phiếu xuất kho theo điều kiện lọc hiện tại. File bao gồm các cột: **"Mã phiếu xuất kho"**, **"Nguồn xuất"**, **"Mã phiếu dịch vụ"**, **"Mã đơn bán hàng"**, **"Trạng thái"**, **"Danh sách phụ tùng xuất kho"** (gồm **"Tên"**, **"SKU"**, **"Phân khúc"**, **"Số lượng xuất"**, **"Đơn vị"**, **"Giá vốn khi xuất (đ/1 đơn vị)"**), **"Ngày tạo"**, **"Ngày hoàn tất"**, **"Người hoàn tất"**, **"Ngày hoàn tác"**, **"Người hoàn tác"**, **"Ngày hủy"**, **"Người hủy"**, **"Lý do hủy"**.

- [ ] **AC-13**: Nút chỉnh sửa trong cột thao tác
  - Tại: màn hình Danh sách phiếu xuất kho, cột **"Thao tác"**.
  - Khi: phiếu xuất kho ở trạng thái **"Chờ duyệt"**.
  - Thì: cột **"Thao tác"** hiển thị nút sửa. Khi nhấn, hệ thống chuyển sang màn hình chỉnh sửa phiếu xuất kho tương ứng (xem `FEAT-ID-EDIT`).
  - Khi: phiếu xuất kho ở trạng thái **"Đã duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"**.
  - Thì: nút sửa không hiển thị trong cột **"Thao tác"**.

- [ ] **AC-14**: Danh sách trống
  - Tại: màn hình Danh sách phiếu xuất kho.
  - Khi: không có phiếu xuất kho nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-15**: Phân quyền xem danh sách phiếu xuất kho
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách phiếu xuất kho, tìm kiếm, lọc, xuất file và điều hướng sang chi tiết, tạo mới hoặc chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-INVENTORY-DELIVERY.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Danh sách phiếu xuất kho: Query `SearchDeliveries`
- Danh sách sản phẩm trong phiếu: Query `GetDeliveryItems`
- Tìm kiếm sản phẩm xuất kho: Query `SearchDeliveryProducts`

## 5. Business Rules

- **BR-ID-LST-001**: Danh sách phiếu xuất kho luôn được phạm vi theo garage hiện tại — không hiển thị phiếu xuất kho của garage khác.
- **BR-ID-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã phiếu xuất kho và mã phiếu dịch vụ.
- **BR-ID-LST-003**: Trạng thái phiếu xuất kho có 4 giá trị: **"Chờ duyệt"**, **"Đã duyệt"**, **"Đã hủy"**, **"Hoàn tác"**.
- **BR-ID-LST-004**: Nguồn xuất có 2 giá trị: **"Mua ngoài"** và **"Nền tảng"**.
- **BR-ID-LST-005**: Nút sửa trong cột thao tác chỉ hiển thị khi phiếu ở trạng thái **"Chờ duyệt"**.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có phiếu xuất kho nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và nhiều bộ lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Phiếu xuất kho không gắn phiếu dịch vụ — cột **"Mã phiếu dịch vụ"** hiển thị trống.
- **EC-4**: Phiếu xuất kho không gắn khách hàng — cột **"Tên khách hàng"** hiển thị trống.

## 7. Out of Scope

- Chi tiết phiếu xuất kho, xác nhận xuất kho, hủy phiếu, hoàn tác phiếu → xem `FEAT-ID-DETAIL`.
- Tạo phiếu xuất kho mới → xem `FEAT-ID-CREATE`.
- Chỉnh sửa phiếu xuất kho → xem `FEAT-ID-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-delivery list screen, SearchDeliveries query) |
