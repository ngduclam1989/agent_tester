---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-MARKETING"
boundary: "gf-marketing"
last_reviewed: "2026-05-27"
---

# FEAT-MKT-VOUC-LIST: Danh sách chương trình voucher

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-VOUC-LIST` |
| Title | Danh sách chương trình voucher |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách chương trình voucher với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý các chương trình voucher đang hoạt động, nháp hoặc đã kết thúc.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách chương trình voucher
  - Tại: menu hệ thống, mục Marketing.
  - Khi: chủ garage truy cập chức năng quản lý chương trình voucher.
  - Thì: hệ thống hiển thị màn hình danh sách chương trình voucher với bảng dữ liệu gồm các cột: **"Mã chương trình"**, **"Tên chương trình"**, **"Loại Voucher"**, **"Ngày bắt đầu"**, **"Ngày kết thúc"**, **"Tổng Voucher"**, **"Voucher đã dùng"**, **"Trạng thái"**, **"Ngày tạo"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái chương trình voucher với badge
  - Tại: màn hình Danh sách chương trình voucher, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng chương trình.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Nháp"**
    - **"Hoạt động"**
    - **"Hết hạn"**
    - **"Đã hủy"**
    - **"Tạm dừng"**

- [ ] **AC-3**: Hiển thị loại voucher
  - Tại: màn hình Danh sách chương trình voucher, cột **"Loại Voucher"**.
  - Khi: hệ thống hiển thị giá trị loại voucher.
  - Thì: loại voucher hiển thị với các giá trị:
    - **"Giảm theo %"**
    - **"Giảm cố định"**
    - **"Miễn phí dịch vụ"**
    - **"Quà tặng"**

- [ ] **AC-4**: Tìm kiếm chương trình voucher theo từ khóa
  - Tại: màn hình Danh sách chương trình voucher, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã hoặc tên chương trình. Placeholder: **"Tìm theo mã, tên"**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Phân trang danh sách
  - Tại: màn hình Danh sách chương trình voucher, cuối bảng dữ liệu.
  - Khi: danh sách chương trình vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-6**: Nhấn vào dòng để xem chi tiết chương trình voucher
  - Tại: màn hình Danh sách chương trình voucher, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng chương trình.
  - Thì: hệ thống chuyển sang màn hình Chi tiết chương trình voucher tương ứng (xem `FEAT-MKT-VOUC-DETAIL`).

- [ ] **AC-7**: Nút thêm mới chương trình voucher
  - Tại: màn hình Danh sách chương trình voucher, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo chương trình voucher (xem `FEAT-MKT-VOUC-CREATE`).

- [ ] **AC-8**: Xóa chương trình voucher từ danh sách
  - Tại: màn hình Danh sách chương trình voucher, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa chương trình voucher ở trạng thái **"Nháp"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Xác nhận xóa chương trình voucher"** và hai nút: **"Hủy"** và **"Xóa"**.
  - Khi: chủ garage nhấn **"Xóa"**.
  - Thì: hệ thống xóa chương trình voucher, hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Xóa chương trình voucher thành công"**, và cập nhật danh sách.

- [ ] **AC-9**: Danh sách trống
  - Tại: màn hình Danh sách chương trình voucher.
  - Khi: không có chương trình nào phù hợp với điều kiện tìm kiếm.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-10**: Phân quyền xem danh sách chương trình voucher
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách chương trình voucher, tìm kiếm, xóa và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm C — Xử lý lỗi

- [ ] **AC-11**: Xóa chương trình voucher thất bại
  - Tại: modal xác nhận xóa chương trình voucher.
  - Khi: hệ thống xóa chương trình voucher thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Danh sách giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Danh sách chương trình voucher: Query `SearchVoucherPrograms`
- Xóa chương trình voucher: Mutation `DeleteVoucherProgram`

## 5. Business Rules

- **BR-MKT-VOUC-LST-001**: Danh sách chương trình voucher luôn được phạm vi theo garage hiện tại — không hiển thị chương trình của garage khác.
- **BR-MKT-VOUC-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã và tên chương trình.
- **BR-MKT-VOUC-LST-003**: Chỉ cho phép xóa chương trình voucher ở trạng thái **"Nháp"**.
- **BR-MKT-VOUC-LST-004**: Trạng thái chương trình voucher có năm giá trị: **"Nháp"**, **"Hoạt động"**, **"Hết hạn"**, **"Đã hủy"**, **"Tạm dừng"**.
- **BR-MKT-VOUC-LST-005**: Mã chương trình voucher được hệ thống tự sinh theo định dạng VP_{NNNNN}, không cho phép nhập thủ công.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có chương trình voucher nào — hiển thị thông báo danh sách trống.
- **EC-2**: Xóa chương trình không ở trạng thái **"Nháp"** — nút xóa không hiển thị hoặc bị vô hiệu.

## 7. Out of Scope

- Tạo chương trình voucher → xem `FEAT-MKT-VOUC-CREATE`.
- Chi tiết chương trình voucher → xem `FEAT-MKT-VOUC-DETAIL`.
- Chỉnh sửa chương trình voucher → xem `FEAT-MKT-VOUC-EDIT`.
- Quản lý chiến dịch → xem `FEAT-MKT-CAMP-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (voucher-programs list screen, SearchVoucherPrograms query, DeleteVoucherProgram mutation) |
