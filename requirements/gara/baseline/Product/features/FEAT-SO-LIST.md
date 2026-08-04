---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SERVICE-ORDER"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-SO-LIST: Danh sách phiếu dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-LIST` |
| Title | Danh sách phiếu dịch vụ |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách tất cả phiếu dịch vụ với tìm kiếm, lọc theo trạng thái, loại phiếu và trạng thái thanh toán, **so that** tôi có thể quản lý và theo dõi tiến độ phiếu dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách phiếu dịch vụ
  - Tại: menu hệ thống, mục quản lý phiếu dịch vụ.
  - Khi: chủ garage truy cập chức năng quản lý phiếu dịch vụ.
  - Thì: hệ thống hiển thị màn hình **"Danh sách phiếu dịch vụ"** với bảng dữ liệu gồm các cột: **"Mã phiếu"**, **"Tên khách hàng"**, **"SĐT khách hàng"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Loại phiếu"**, **"Trạng thái phiếu"**, **"Trạng thái thanh toán"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái phiếu với badge
  - Tại: màn hình Danh sách phiếu dịch vụ, cột **"Trạng thái phiếu"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng phiếu.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Báo giá"**
    - **"Đã xác nhận"**
    - **"Đã từ chối"**
    - **"Đang thực hiện"**
    - **"Hoàn thành"**
    - **"Đã huỷ"**
    - **"Đã xuất kho"**
    - **"Đã tạo quyết toán"**

- [ ] **AC-3**: Hiển thị trạng thái thanh toán với badge
  - Tại: màn hình Danh sách phiếu dịch vụ, cột **"Trạng thái thanh toán"**.
  - Khi: hệ thống hiển thị giá trị trạng thái thanh toán của từng phiếu.
  - Thì: trạng thái thanh toán hiển thị dưới dạng badge với các giá trị:
    - **"Chưa thanh toán"**
    - **"Thanh toán 1 phần"**
    - **"Đã thanh toán"**

- [ ] **AC-4**: Lọc theo trạng thái phiếu
  - Tại: màn hình Danh sách phiếu dịch vụ, bộ lọc **"Trạng thái phiếu"**.
  - Khi: chủ garage chọn một hoặc nhiều giá trị trạng thái phiếu từ bộ lọc.
  - Thì: hệ thống lọc danh sách chỉ hiển thị phiếu có trạng thái phù hợp. Các giá trị lọc: **"Báo giá"**, **"Đã xác nhận"**, **"Đã từ chối"**, **"Đang thực hiện"**, **"Hoàn thành"**, **"Đã huỷ"**, **"Đã xuất kho"**, **"Đã tạo quyết toán"**.

- [ ] **AC-5**: Lọc theo loại phiếu
  - Tại: màn hình Danh sách phiếu dịch vụ, bộ lọc **"Loại phiếu"**.
  - Khi: chủ garage chọn giá trị loại phiếu từ bộ lọc.
  - Thì: hệ thống lọc danh sách chỉ hiển thị phiếu có loại phù hợp. Các giá trị lọc:
    - **"Dịch vụ xe"**
    - **"Bán phụ tùng"**

- [ ] **AC-6**: Lọc theo trạng thái thanh toán
  - Tại: màn hình Danh sách phiếu dịch vụ, bộ lọc **"Trạng thái thanh toán"**.
  - Khi: chủ garage chọn giá trị trạng thái thanh toán từ bộ lọc.
  - Thì: hệ thống lọc danh sách chỉ hiển thị phiếu có trạng thái thanh toán phù hợp. Các giá trị lọc: **"Chưa thanh toán"**, **"Thanh toán 1 phần"**, **"Đã thanh toán"**.

- [ ] **AC-7**: Tìm kiếm phiếu dịch vụ theo từ khóa
  - Tại: màn hình Danh sách phiếu dịch vụ, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã phiếu, tên khách hàng, số điện thoại khách hàng hoặc biển số xe. Kết quả được cập nhật tự động.

- [ ] **AC-8**: Phân trang danh sách
  - Tại: màn hình Danh sách phiếu dịch vụ, cuối bảng dữ liệu.
  - Khi: danh sách phiếu dịch vụ vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-9**: Nhấn vào dòng để xem chi tiết phiếu dịch vụ
  - Tại: màn hình Danh sách phiếu dịch vụ, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng phiếu dịch vụ.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phiếu dịch vụ tương ứng (xem `FEAT-SO-DETAIL` hoặc `FEAT-SO-SALE-DETAIL` tùy theo loại phiếu).

- [ ] **AC-10**: Nút tạo phiếu dịch vụ mới
  - Tại: màn hình Danh sách phiếu dịch vụ, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút tạo phiếu dịch vụ mới.
  - Thì: hệ thống chuyển sang màn hình tạo phiếu dịch vụ tương ứng với loại phiếu được chọn — phiếu **"Dịch vụ xe"** (xem `FEAT-SO-CREATE`) hoặc phiếu **"Bán phụ tùng"** (xem `FEAT-SO-SALE-CREATE`).

- [ ] **AC-11**: Kết hợp nhiều bộ lọc đồng thời
  - Tại: màn hình Danh sách phiếu dịch vụ, các bộ lọc.
  - Khi: chủ garage chọn đồng thời nhiều bộ lọc (trạng thái phiếu, loại phiếu, trạng thái thanh toán) và/hoặc nhập từ khóa tìm kiếm.
  - Thì: hệ thống áp dụng tất cả điều kiện lọc đồng thời và hiển thị kết quả khớp với toàn bộ điều kiện.

### Nhóm B — Trạng thái trống

- [ ] **AC-12**: Danh sách trống sau khi tìm kiếm hoặc lọc
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: không có phiếu dịch vụ nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo **"Không tìm thấy phiếu dịch vụ phù hợp."**

- [ ] **AC-13**: Danh sách trống khi chưa có dữ liệu
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: hệ thống chưa có phiếu dịch vụ nào.
  - Thì: hệ thống hiển thị thông báo **"Hiện chưa có phiếu dịch vụ nào trong hệ thống."**

### Nhóm C — Validation

- [ ] **AC-14**: Validation số điện thoại khi tìm kiếm
  - Tại: màn hình Danh sách phiếu dịch vụ, ô tìm kiếm.
  - Khi: chủ garage nhập giá trị số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo **"Số điện thoại không đúng định dạng"**.

- [ ] **AC-15**: Validation biển số xe khi tìm kiếm
  - Tại: màn hình Danh sách phiếu dịch vụ, ô tìm kiếm.
  - Khi: chủ garage nhập giá trị biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

### Nhóm D — Phân quyền

- [ ] **AC-16**: Phân quyền xem danh sách phiếu dịch vụ
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách phiếu dịch vụ, tìm kiếm, lọc, và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SERVICE-ORDER.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Danh sách phiếu dịch vụ: Query `SearchServiceOrdersV3`

## 5. Business Rules

- **BR-SO-LST-001**: Danh sách phiếu dịch vụ luôn được phạm vi theo garage hiện tại — không hiển thị phiếu của garage khác.
- **BR-SO-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã phiếu, tên khách hàng, số điện thoại khách hàng và biển số xe.
- **BR-SO-LST-003**: Trạng thái phiếu có 8 giá trị: **"Báo giá"**, **"Đã xác nhận"**, **"Đã từ chối"**, **"Đang thực hiện"**, **"Hoàn thành"**, **"Đã huỷ"**, **"Đã xuất kho"**, **"Đã tạo quyết toán"**.
- **BR-SO-LST-004**: Trạng thái thanh toán có 3 giá trị: **"Chưa thanh toán"**, **"Thanh toán 1 phần"**, **"Đã thanh toán"**.
- **BR-SO-LST-005**: Loại phiếu có 2 giá trị: **"Dịch vụ xe"** và **"Bán phụ tùng"**.
- **BR-SO-LST-006**: Nhấn vào dòng phiếu sẽ điều hướng sang màn hình chi tiết tương ứng với loại phiếu — phiếu **"Dịch vụ xe"** sang chi tiết dịch vụ, phiếu **"Bán phụ tùng"** sang chi tiết bán phụ tùng.
- **BR-SO-LST-007**: Các bộ lọc có thể kết hợp đồng thời — hệ thống áp dụng giao (AND) tất cả điều kiện lọc.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có phiếu dịch vụ nào — hiển thị thông báo **"Hiện chưa có phiếu dịch vụ nào trong hệ thống."**
- **EC-2**: Kết hợp tìm kiếm và nhiều bộ lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Phiếu không có thông tin hãng xe hoặc dòng xe — cột tương ứng hiển thị trống.

## 7. Out of Scope

- Tạo phiếu dịch vụ (loại dịch vụ xe) → xem `FEAT-SO-CREATE`.
- Tạo phiếu bán phụ tùng → xem `FEAT-SO-SALE-CREATE`.
- Chi tiết phiếu dịch vụ → xem `FEAT-SO-DETAIL`.
- Chi tiết phiếu bán phụ tùng → xem `FEAT-SO-SALE-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (SO list screen, SearchServiceOrdersV3 query, bộ lọc trạng thái/loại phiếu/thanh toán) |
