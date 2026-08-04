---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-MARKETING"
boundary: "gf-customer"
last_reviewed: "2026-05-27"
---

# FEAT-MKT-SEG-LIST: Danh sách phân khúc

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-SEG-LIST` |
| Title | Danh sách phân khúc |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-customer` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách phân khúc khách hàng với tìm kiếm và phân trang, **so that** tôi có thể quản lý các phân khúc phục vụ cho chiến dịch marketing.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách phân khúc
  - Tại: menu hệ thống, mục Marketing.
  - Khi: chủ garage truy cập chức năng quản lý phân khúc.
  - Thì: hệ thống hiển thị màn hình **"Danh sách Phân khúc"** với bảng dữ liệu gồm các cột: **"Tên phân khúc"**, **"Ngày tạo"**, **"Ngày chỉnh sửa"**, **"Người khởi tạo"**, **"Lần chạy cuối cùng"**, **"SL khách"**, **"Trạng thái"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái phân khúc với badge
  - Tại: màn hình Danh sách phân khúc, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng phân khúc.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Đang hoạt động"**
    - **"Đang xử lý"**
    - **"Ngừng hoạt động"**

- [ ] **AC-3**: Tìm kiếm phân khúc theo từ khóa
  - Tại: màn hình Danh sách phân khúc, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên phân khúc. Placeholder: **"Tìm kiếm theo tên phân khúc"**. Kết quả được cập nhật tự động.

- [ ] **AC-4**: Phân trang danh sách
  - Tại: màn hình Danh sách phân khúc, cuối bảng dữ liệu.
  - Khi: danh sách phân khúc vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-5**: Nhấn vào dòng để xem chi tiết phân khúc
  - Tại: màn hình Danh sách phân khúc, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng phân khúc.
  - Thì: hệ thống chuyển sang màn hình Chi tiết phân khúc tương ứng (xem `FEAT-MKT-SEG-DETAIL`).

- [ ] **AC-6**: Nút tạo mới phân khúc
  - Tại: màn hình Danh sách phân khúc, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tạo mới phân khúc"**.
  - Thì: hệ thống chuyển sang màn hình tạo phân khúc (xem `FEAT-MKT-SEG-CREATE`).

- [ ] **AC-7**: Thay đổi trạng thái phân khúc từ danh sách
  - Tại: màn hình Danh sách phân khúc, cột **"Thao tác"**.
  - Khi: chủ garage thay đổi trạng thái phân khúc (kích hoạt hoặc ngừng hoạt động).
  - Thì: hệ thống cập nhật trạng thái và hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật trạng thái phân khúc thành công."**.

- [ ] **AC-8**: Danh sách trống
  - Tại: màn hình Danh sách phân khúc.
  - Khi: không có phân khúc nào phù hợp với điều kiện tìm kiếm.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-9**: Phân quyền xem danh sách phân khúc
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách phân khúc, tìm kiếm, thay đổi trạng thái và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm C — Xử lý lỗi

- [ ] **AC-10**: Thay đổi trạng thái phân khúc thất bại
  - Tại: màn hình Danh sách phân khúc, sau khi thay đổi trạng thái.
  - Khi: hệ thống cập nhật trạng thái thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Danh sách giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Danh sách phân khúc: Query `SearchSegments`
- Cập nhật trạng thái phân khúc: Mutation `UpdateSegment`

## 5. Business Rules

- **BR-MKT-SEG-LST-001**: Danh sách phân khúc luôn được phạm vi theo garage hiện tại — không hiển thị phân khúc của garage khác.
- **BR-MKT-SEG-LST-002**: Tìm kiếm từ khóa áp dụng cho tên phân khúc.
- **BR-MKT-SEG-LST-003**: Trạng thái phân khúc có ba giá trị: **"Đang hoạt động"**, **"Đang xử lý"**, **"Ngừng hoạt động"**.
- **BR-MKT-SEG-LST-004**: Không cho phép cập nhật trạng thái sang **"Đang xử lý"** từ giao diện — trạng thái này chỉ được hệ thống tự động chuyển khi đang đánh giá phân khúc.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có phân khúc nào — hiển thị thông báo danh sách trống.
- **EC-2**: Phân khúc đang ở trạng thái **"Đang xử lý"** — cột **"Thao tác"** không cho phép thay đổi trạng thái.

## 7. Out of Scope

- Tạo phân khúc → xem `FEAT-MKT-SEG-CREATE`.
- Chi tiết phân khúc → xem `FEAT-MKT-SEG-DETAIL`.
- Quản lý chiến dịch → xem `FEAT-MKT-CAMP-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (segments list screen, SearchSegments query, UpdateSegment mutation) |
