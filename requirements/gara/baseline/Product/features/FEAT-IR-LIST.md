---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-IR-LIST: Danh sách phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-LIST` |
| Title | Danh sách phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phiếu nhập kho với tìm kiếm, lọc theo trạng thái, nguồn nhập, ngày tạo và phân trang, **so that** tôi có thể quản lý và tra cứu nhanh các phiếu nhập kho của garage.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách phiếu nhập kho
  - Tại: menu hệ thống, mục quản lý kho.
  - Khi: chủ garage truy cập chức năng nhập kho.
  - Thì: hệ thống hiển thị màn hình **"Danh sách phiếu nhập kho"** với bảng dữ liệu gồm các cột: **"Mã phiếu nhập kho"**, **"Nguồn nhập"**, **"Đơn hàng tương ứng"**, **"Trạng thái"**, **"Phụ tùng nhập"**, **"Tên nhà cung cấp"**, **"Người tạo"**, **"Người duyệt"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái phiếu nhập kho với badge
  - Tại: màn hình Danh sách phiếu nhập kho, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng phiếu nhập kho.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Chờ duyệt"**
    - **"Đã duyệt"**
    - **"Hoàn tác"**
    - **"Đã hủy"**

- [ ] **AC-3**: Hiển thị nguồn nhập
  - Tại: màn hình Danh sách phiếu nhập kho, cột **"Nguồn nhập"**.
  - Khi: hệ thống hiển thị giá trị nguồn nhập của từng phiếu.
  - Thì: nguồn nhập hiển thị với các giá trị:
    - **"Mua ngoài"**
    - **"Nền tảng"**

- [ ] **AC-4**: Tìm kiếm phiếu nhập kho
  - Tại: màn hình Danh sách phiếu nhập kho, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã phiếu hoặc mã đơn hàng (PO). Placeholder: **"Tìm kiếm theo mã phiếu, mã PO"**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Lọc danh sách theo trạng thái
  - Tại: màn hình Danh sách phiếu nhập kho, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị lọc trạng thái.
  - Thì: hệ thống lọc danh sách theo trạng thái đã chọn: **"Chờ duyệt"**, **"Đã duyệt"**, **"Hoàn tác"**, **"Đã hủy"**.

- [ ] **AC-6**: Lọc danh sách theo nguồn nhập
  - Tại: màn hình Danh sách phiếu nhập kho, bộ lọc **"Nguồn nhập"**.
  - Khi: chủ garage chọn giá trị lọc nguồn nhập.
  - Thì: hệ thống lọc danh sách theo nguồn nhập đã chọn: **"Mua ngoài"**, **"Nền tảng"**.

- [ ] **AC-7**: Lọc danh sách theo ngày tạo
  - Tại: màn hình Danh sách phiếu nhập kho, bộ lọc **"Ngày tạo"**.
  - Khi: chủ garage chọn khoảng thời gian.
  - Thì: hệ thống lọc danh sách theo khoảng ngày tạo đã chọn.

- [ ] **AC-8**: Phân trang danh sách
  - Tại: màn hình Danh sách phiếu nhập kho, cuối bảng dữ liệu.
  - Khi: danh sách phiếu nhập kho vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-9**: Xem danh sách sản phẩm trong phiếu (modal)
  - Tại: màn hình Danh sách phiếu nhập kho, cột **"Phụ tùng nhập"**.
  - Khi: chủ garage nhấn vào giá trị phụ tùng nhập của một phiếu.
  - Thì: hệ thống hiển thị modal **"Danh sách sản phẩm trong phiếu nhập kho"** với thông tin chi tiết từng sản phẩm và **"Tổng giá trị"** của phiếu.

- [ ] **AC-10**: Nhấn vào dòng để xem chi tiết phiếu nhập kho
  - Tại: màn hình Danh sách phiếu nhập kho, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng phiếu nhập kho.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phiếu nhập kho tương ứng (xem `FEAT-IR-DETAIL`).

- [ ] **AC-11**: Nút tạo phiếu nhập kho mới
  - Tại: màn hình Danh sách phiếu nhập kho, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tạo phiếu nhập kho mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo phiếu nhập kho mới (xem `FEAT-IR-CREATE`).

- [ ] **AC-12**: Nút chỉnh sửa phiếu trên cột thao tác
  - Tại: màn hình Danh sách phiếu nhập kho, cột **"Thao tác"**, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút sửa trên dòng phiếu.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa phiếu nhập kho (xem `FEAT-IR-EDIT`).
  - Khi: phiếu ở trạng thái khác **"Chờ duyệt"** (đã duyệt, hoàn tác, đã hủy).
  - Thì: nút sửa không hiển thị hoặc bị vô hiệu hóa.

- [ ] **AC-13**: Nút xuất file
  - Tại: màn hình Danh sách phiếu nhập kho, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Xuất file"**.
  - Thì: hệ thống xuất danh sách phiếu nhập kho ra file với các cột: **"Mã phiếu nhập"**, **"Nguồn nhập"**, **"Đơn hàng tương ứng"**, **"Trạng thái"**, **"Danh sách phụ tùng nhập kho"** (gồm **"Tên"**, **"SKU"**, **"Phân khúc"**, **"Số lượng nhập"**, **"Đơn vị"**, **"Giá vốn khi nhập (đ/1 đơn vị)"**), **"Ngày tạo"**, **"Ngày hoàn tất"**, **"Người hoàn tất"**, **"Ngày hoàn tác"**, **"Người hoàn tác"**, **"Ngày hủy"**, **"Người hủy"**, **"Lý do hủy"**.

- [ ] **AC-14**: Danh sách trống
  - Tại: màn hình Danh sách phiếu nhập kho.
  - Khi: không có phiếu nhập kho nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-15**: Phân quyền xem danh sách phiếu nhập kho
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách phiếu nhập kho, tìm kiếm, lọc, xuất file và điều hướng sang chi tiết, tạo mới hoặc chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-RECEIPT.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Danh sách phiếu nhập kho: Query `SearchReceipts`

## 5. Business Rules

- **BR-IR-LST-001**: Danh sách phiếu nhập kho luôn được phạm vi theo garage hiện tại — không hiển thị phiếu của garage khác.
- **BR-IR-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã phiếu nhập kho và mã đơn hàng (PO).
- **BR-IR-LST-003**: Trạng thái phiếu nhập kho có bốn giá trị: **"Chờ duyệt"**, **"Đã duyệt"**, **"Hoàn tác"**, **"Đã hủy"**.
- **BR-IR-LST-004**: Nguồn nhập phiếu nhập kho có hai giá trị: **"Mua ngoài"** và **"Nền tảng"**.
- **BR-IR-LST-005**: Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa từ cột thao tác trên danh sách.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có phiếu nhập kho nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và nhiều bộ lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Phiếu nhập kho không có đơn hàng tương ứng (nguồn **"Mua ngoài"**) — cột **"Đơn hàng tương ứng"** hiển thị trống.

## 7. Out of Scope

- Chi tiết phiếu nhập kho → xem `FEAT-IR-DETAIL`.
- Tạo phiếu nhập kho mới → xem `FEAT-IR-CREATE`.
- Chỉnh sửa phiếu nhập kho → xem `FEAT-IR-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-receipt list screen, SearchReceipts query, 4 trạng thái, 2 nguồn nhập, xuất file, modal sản phẩm) |
