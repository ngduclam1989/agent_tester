---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CATALOG"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-CAT-SUP-LIST: Danh sách nhà cung cấp

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-SUP-LIST` |
| Title | Danh sách nhà cung cấp |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách nhà cung cấp với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và tra cứu nhanh thông tin nhà cung cấp phục vụ mua hàng trực tiếp.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách nhà cung cấp
  - Tại: menu hệ thống, mục quản lý nhà cung cấp.
  - Khi: chủ garage truy cập chức năng quản lý nhà cung cấp.
  - Thì: hệ thống hiển thị màn hình danh sách nhà cung cấp với bảng dữ liệu gồm các cột: **"Mã NCC"**, **"Nhà cung cấp"**, **"Đơn hàng"**, **"Nguồn tạo"**, **"Số điện thoại"**, **"MST"**, **"Trạng thái"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái nhà cung cấp với badge
  - Tại: màn hình Danh sách nhà cung cấp, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng nhà cung cấp.
  - Thì: trạng thái hiển thị dưới dạng badge với giá trị:
    - **"Đang hoạt động"**
    - **"Ngừng hoạt động"**

- [ ] **AC-3**: Hiển thị nguồn tạo nhà cung cấp
  - Tại: màn hình Danh sách nhà cung cấp, cột **"Nguồn tạo"**.
  - Khi: hệ thống hiển thị giá trị nguồn tạo của từng nhà cung cấp.
  - Thì: nguồn tạo hiển thị một trong các giá trị:
    - **"Garage"**
    - **"CarDoctor"**

- [ ] **AC-4**: Tìm kiếm nhà cung cấp theo từ khóa
  - Tại: màn hình Danh sách nhà cung cấp, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên, mã hoặc số điện thoại. Placeholder: **"Tìm kiếm theo tên, mã, sđt,..."**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Lọc theo trạng thái
  - Tại: màn hình Danh sách nhà cung cấp, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị lọc trạng thái.
  - Thì: hệ thống lọc danh sách theo trạng thái đã chọn. Các giá trị lọc: **"Đang hoạt động"**, **"Ngừng hoạt động"**.

- [ ] **AC-6**: Lọc theo nguồn tạo
  - Tại: màn hình Danh sách nhà cung cấp, bộ lọc **"Nguồn tạo"**.
  - Khi: chủ garage chọn giá trị lọc nguồn tạo.
  - Thì: hệ thống lọc danh sách theo nguồn tạo đã chọn. Các giá trị lọc: **"Garage"**, **"CarDoctor"**.

- [ ] **AC-7**: Phân trang danh sách
  - Tại: màn hình Danh sách nhà cung cấp, cuối bảng dữ liệu.
  - Khi: danh sách nhà cung cấp vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-8**: Nhấn vào dòng để xem chi tiết nhà cung cấp
  - Tại: màn hình Danh sách nhà cung cấp, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng nhà cung cấp.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết nhà cung cấp"** tương ứng.

- [ ] **AC-9**: Nhấn vào cột Đơn hàng để xem danh sách đơn hàng của nhà cung cấp
  - Tại: màn hình Danh sách nhà cung cấp, cột **"Đơn hàng"**.
  - Khi: chủ garage nhấn vào giá trị cột **"Đơn hàng"** trên dòng nhà cung cấp.
  - Thì: hệ thống chuyển sang màn hình Danh sách đơn hàng (xem `FEAT-PO-LIST`) với bộ lọc nhà cung cấp tương ứng đã được áp dụng sẵn.
  - Khi: nhà cung cấp chưa có đơn hàng nào.
  - Thì: cột **"Đơn hàng"** hiển thị giá trị **"0"** và vẫn cho phép nhấn (chuyển sang danh sách đơn hàng trống).

- [ ] **AC-10**: Nút sửa trong cột thao tác
  - Tại: màn hình Danh sách nhà cung cấp, cột **"Thao tác"**.
  - Khi: chủ garage nhấn icon sửa trên dòng nhà cung cấp.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa nhà cung cấp tương ứng (xem `FEAT-CAT-SUP-EDIT`).

- [ ] **AC-11**: Nút thêm nhà cung cấp
  - Tại: màn hình Danh sách nhà cung cấp, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm nhà cung cấp"**.
  - Thì: hệ thống chuyển sang màn hình tạo nhà cung cấp mới (xem `FEAT-CAT-SUP-CREATE`).

- [ ] **AC-12**: Hiển thị địa chỉ khi chưa cập nhật
  - Tại: màn hình Danh sách nhà cung cấp.
  - Khi: nhà cung cấp chưa có thông tin địa chỉ.
  - Thì: hệ thống hiển thị **"Địa chỉ: Chưa cập nhật"**.

- [ ] **AC-13**: Danh sách trống
  - Tại: màn hình Danh sách nhà cung cấp.
  - Khi: không có nhà cung cấp nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-14**: Phân quyền xem danh sách nhà cung cấp
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách nhà cung cấp, tìm kiếm, lọc, và điều hướng sang chi tiết, tạo mới hoặc chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Danh sách nhà cung cấp: Query `SearchSuppliers`

## 5. Business Rules

- **BR-CAT-SUP-LST-001**: Danh sách nhà cung cấp luôn được phạm vi theo garage hiện tại — không hiển thị nhà cung cấp của garage khác.
- **BR-CAT-SUP-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho tên, mã và số điện thoại nhà cung cấp.
- **BR-CAT-SUP-LST-003**: Trạng thái nhà cung cấp chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**.
- **BR-CAT-SUP-LST-004**: Nguồn tạo nhà cung cấp chỉ có hai giá trị: **"Garage"** (garage tự tạo) và **"CarDoctor"** (đồng bộ từ hệ thống CarDoctor).

## 6. Edge Cases

- **EC-1**: Garage mới chưa có nhà cung cấp nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và lọc cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Nhà cung cấp nguồn **"CarDoctor"** — số điện thoại bị ẩn, cột **"Số điện thoại"** hiển thị trống hoặc hiển thị số riêng tư.

## 7. Out of Scope

- Tạo nhà cung cấp mới → xem `FEAT-CAT-SUP-CREATE`.
- Chỉnh sửa thông tin nhà cung cấp → xem `FEAT-CAT-SUP-EDIT`.
- Quản lý đơn mua hàng liên quan đến nhà cung cấp → thuộc `EP-PROCUREMENT`.
- Quản lý nhà xe liên kết → thuộc FEAT riêng trong `EP-CATALOG`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-purchase + garage-web (suppliers list screen, SearchSuppliers query) |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-9: nhấn cột Đơn hàng → link sang FEAT-PO-LIST với bộ lọc NCC. Đánh lại số AC-10→AC-14. Sửa "nhà vận chuyển" → "nhà xe liên kết". |
