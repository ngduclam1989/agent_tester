---
type: feature
artifact_kind: feature
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-BOOK-LIST: Danh sách lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-LIST` |
| Title | Danh sách lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách toàn bộ lịch hẹn với khả năng tìm kiếm và lọc theo nhiều tiêu chí, **so that** tôi nắm được tình hình lịch hẹn hàng ngày và xử lý kịp thời.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xem và tìm kiếm danh sách

- [ ] **AC-1**: Hiển thị danh sách lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage truy cập màn hình lịch hẹn.
  - Thì: hệ thống hiển thị bảng danh sách với tiêu đề **"Danh sách lịch hẹn"** và các cột:
    - **"Mã lịch hẹn"**
    - **"Nguồn"**
    - **"Khách hàng"**
    - **"Biển số xe"**
    - **"Thời gian hẹn"**
    - **"Trạng thái"**
    - **"Thao tác"**

- [ ] **AC-2**: Tìm kiếm lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo biển số xe, tên khách hàng hoặc số điện thoại. Placeholder: **"Tìm kiếm biển số, tên khách, SĐT"**.

- [ ] **AC-3**: Lọc theo trạng thái
  - Tại: màn hình Danh sách lịch hẹn, bộ lọc.
  - Khi: chủ garage chọn lọc theo trạng thái.
  - Thì: hệ thống hiển thị các tùy chọn trạng thái: **"Lịch hẹn mới"**, **"Đã xác nhận"**, **"Đã từ chối"**, **"Xe đã đến"**, **"Đã hủy"**. Hệ thống lọc danh sách theo trạng thái đã chọn.

- [ ] **AC-4**: Lọc theo nguồn lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn, bộ lọc.
  - Khi: chủ garage chọn lọc theo nguồn.
  - Thì: hệ thống hiển thị các tùy chọn nguồn: **"Từ ứng dụng tài xế"**, **"Garage Care"**. Hệ thống lọc danh sách theo nguồn đã chọn.

- [ ] **AC-5**: Lọc theo khoảng thời gian hẹn
  - Tại: màn hình Danh sách lịch hẹn, bộ lọc.
  - Khi: chủ garage chọn khoảng thời gian (từ ngày — đến ngày).
  - Thì: hệ thống lọc danh sách chỉ hiển thị lịch hẹn có thời gian hẹn nằm trong khoảng đã chọn.

- [ ] **AC-6**: Hiển thị trạng thái bằng tên tiếng Việt
  - Tại: màn hình Danh sách lịch hẹn, cột Trạng thái.
  - Khi: danh sách hiển thị.
  - Thì: trạng thái hiển thị bằng tên tiếng Việt: **"Lịch hẹn mới"**, **"Đã xác nhận"**, **"Đã từ chối"**, **"Xe đã đến"**, **"Đã hủy"**. Cả hai trạng thái nội bộ hủy và không đến đều hiển thị là **"Đã hủy"**.

- [ ] **AC-7**: Hiển thị nguồn bằng tên tiếng Việt
  - Tại: màn hình Danh sách lịch hẹn, cột Nguồn.
  - Khi: danh sách hiển thị.
  - Thì: nguồn hiển thị bằng tên tiếng Việt: **"Từ ứng dụng tài xế"**, **"Garage Care"**.

- [ ] **AC-8**: Đặt lại bộ lọc
  - Tại: màn hình Danh sách lịch hẹn, khu vực bộ lọc.
  - Khi: chủ garage nhấn nút **"Đặt lại bộ lọc"**.
  - Thì: hệ thống xóa toàn bộ tiêu chí lọc đã chọn (trạng thái, nguồn, khoảng thời gian, từ khóa tìm kiếm) và hiển thị lại danh sách mặc định.

- [ ] **AC-9**: Phân trang
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: số lượng lịch hẹn vượt quá giới hạn hiển thị mỗi trang.
  - Thì: hệ thống hiển thị phân trang và cho phép chuyển trang.

- [ ] **AC-10**: Nút tạo lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage nhấn nút **"Tạo lịch hẹn"**.
  - Thì: hệ thống chuyển sang màn hình tạo lịch hẹn mới (xem `FEAT-BOOK-CREATE`).

- [ ] **AC-11**: Nhấn vào lịch hẹn để xem chi tiết
  - Tại: màn hình Danh sách lịch hẹn, một dòng trong bảng.
  - Khi: chủ garage nhấn vào một lịch hẹn.
  - Thì: hệ thống chuyển sang màn hình chi tiết lịch hẹn (xem `FEAT-BOOK-DETAIL`).

- [ ] **AC-12**: Nút chỉnh sửa lịch hẹn trên danh sách
  - Tại: màn hình Danh sách lịch hẹn, cột **"Thao tác"**.
  - Khi: lịch hẹn ở trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"**.
  - Thì: hệ thống hiển thị nút chỉnh sửa trong cột Thao tác. Khi chủ garage nhấn nút, hệ thống chuyển sang màn hình chỉnh sửa lịch hẹn (xem `FEAT-BOOK-EDIT`).

- [ ] **AC-13**: Ẩn nút chỉnh sửa khi trạng thái không cho phép
  - Tại: màn hình Danh sách lịch hẹn, cột **"Thao tác"**.
  - Khi: lịch hẹn ở trạng thái **"Đã từ chối"**, **"Xe đã đến"** hoặc **"Đã hủy"**.
  - Thì: nút chỉnh sửa không hiển thị trong cột Thao tác.

### Nhóm B — Hành vi hệ thống liên quan

- [ ] **AC-14**: Lịch hẹn quá hạn tự động chuyển trạng thái
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** quá hạn thời gian quy định.
  - Thì: hệ thống tự động chuyển trạng thái sang **"Đã hủy"** và ghi nhận lịch sử. Lịch hẹn hiển thị trạng thái mới trong danh sách.

### Nhóm C — Phân quyền

- [ ] **AC-15**: Phân quyền xem danh sách lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền xem danh sách lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Tìm kiếm và lọc danh sách: Query `SearchBookingsV3`

## 5. Business Rules

- **BR-BOOK-LIST-001**: Danh sách lịch hẹn hiển thị theo phạm vi garage hiện tại (tenant). Không hiển thị lịch hẹn của garage khác.
- **BR-BOOK-LIST-002**: Trạng thái không đến và đã hủy đều hiển thị chung là **"Đã hủy"** trên giao diện (theo KG frontend).
- **BR-BOOK-LIST-003**: Lịch hẹn quá hạn ở trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"** được hệ thống tự động chuyển sang **"Đã hủy"**, ghi lịch sử và gửi thông báo.

## 6. Edge Cases

- **EC-1**: Không có lịch hẹn nào — hiển thị trạng thái trống phù hợp.
- **EC-2**: Tìm kiếm không có kết quả — hiển thị trạng thái trống với thông báo phù hợp.

## 7. Out of Scope

- Thao tác nhanh trên danh sách (xác nhận, hủy, xe đã đến) → xem `FEAT-BOOK-CONFIRM`, `FEAT-BOOK-CANCEL`, `FEAT-BOOK-ARRIVE`.
- Chi tiết từng lịch hẹn → xem `FEAT-BOOK-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-05-19 | 2 | Business Authority | Bổ sung AC-8: nút "Đặt lại bộ lọc" (xác nhận từ BA qua screenshot, KG chưa ghi nhận label); đánh lại số AC |
| 2026-05-19 | 3 | Business Authority | Bổ sung AC-12, AC-13: nút chỉnh sửa trong cột Thao tác (xác nhận từ BA, KG có route `/booking/$code/edit`); đánh lại số AC |
