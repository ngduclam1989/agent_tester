---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-BOOK-CANCEL: Hủy lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-CANCEL` |
| Title | Hủy lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** hủy lịch hẹn đã xác nhận khi khách hàng không đến hoặc yêu cầu hủy, **so that** garage giải phóng khung giờ và cập nhật trạng thái chính xác.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hủy lịch hẹn

- [ ] **AC-1**: Hiển thị nút hủy lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Đã xác nhận"** và chưa có phiếu dịch vụ liên kết.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: hệ thống hiển thị nút hủy lịch hẹn.

- [ ] **AC-2**: Ẩn nút hủy khi trạng thái không phù hợp
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái khác **"Đã xác nhận"** (ví dụ: **"Lịch hẹn mới"**, **"Xe đã đến"**, **"Đã từ chối"**, **"Đã hủy"**).
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút hủy không hiển thị.

- [ ] **AC-3**: Ẩn nút hủy khi đã có phiếu dịch vụ liên kết
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Đã xác nhận"** nhưng đã có phiếu dịch vụ liên kết.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút hủy không hiển thị.

- [ ] **AC-4**: Mở hộp thoại nhập lý do hủy
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage nhấn nút hủy lịch hẹn.
  - Thì: hệ thống hiển thị hộp thoại yêu cầu nhập lý do hủy. Placeholder: **"Nhập lý do hủy lịch hẹn"**.

- [ ] **AC-5**: Hủy lịch hẹn thành công
  - Tại: hộp thoại nhập lý do hủy.
  - Khi: chủ garage nhập lý do và xác nhận hủy.
  - Thì: hệ thống chuyển trạng thái lịch hẹn sang **"Đã hủy"**. Hiển thị toast: **"Hủy lịch hẹn thành công"**. Nút hủy biến mất. Lý do hủy được ghi nhận trong lịch sử trạng thái.

- [ ] **AC-6**: Hủy lịch hẹn thất bại
  - Tại: hộp thoại nhập lý do hủy.
  - Khi: hệ thống hủy thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái lịch hẹn không thay đổi.

### Nhóm B — Phân quyền

- [ ] **AC-7**: Phân quyền hủy lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền hủy lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Hủy lịch hẹn: Mutation `CancelBookingV3`

## 5. Business Rules

- **BR-BOOK-CAN-001**: Chỉ cho phép hủy lịch hẹn ở trạng thái **"Đã xác nhận"**.
- **BR-BOOK-CAN-002**: Không cho phép hủy lịch hẹn đã có phiếu dịch vụ liên kết.
- **BR-BOOK-CAN-003**: Lý do hủy được ghi nhận trong lịch sử trạng thái cùng người thực hiện và thời gian.
- **BR-BOOK-CAN-004**: Hệ thống cũng tự động hủy lịch hẹn quá hạn (không qua nút bấm) — xem `FEAT-BOOK-LIST` AC-14.

## 6. Edge Cases

- **EC-1**: Trong khi mở hộp thoại hủy, phiếu dịch vụ vừa được tạo liên kết — hủy thất bại do vi phạm BR-BOOK-CAN-002.

## 7. Out of Scope

- Hủy tự động do quá hạn — hành vi hệ thống, mô tả trong `FEAT-BOOK-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
