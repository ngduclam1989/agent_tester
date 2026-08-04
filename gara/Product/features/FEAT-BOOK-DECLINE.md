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

# FEAT-BOOK-DECLINE: Từ chối lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-DECLINE` |
| Title | Từ chối lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** từ chối lịch hẹn khi garage không thể phục vụ (hết chỗ, không hỗ trợ loại dịch vụ, v.v.), **so that** khách hàng được thông báo kịp thời để tìm garage khác.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Từ chối lịch hẹn

- [ ] **AC-1**: Hiển thị nút từ chối
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: hệ thống hiển thị nút từ chối lịch hẹn.

- [ ] **AC-2**: Ẩn nút từ chối khi trạng thái không phù hợp
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái khác **"Lịch hẹn mới"** (ví dụ: **"Đã xác nhận"**, **"Xe đã đến"**, **"Đã từ chối"**, **"Đã hủy"**).
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút từ chối không hiển thị.

- [ ] **AC-3**: Mở hộp thoại nhập lý do từ chối
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage nhấn nút từ chối lịch hẹn.
  - Thì: hệ thống hiển thị hộp thoại yêu cầu nhập lý do từ chối. Placeholder: **"Nhập lý do từ chối"**.

- [ ] **AC-4**: Từ chối lịch hẹn thành công
  - Tại: hộp thoại nhập lý do từ chối.
  - Khi: chủ garage nhập lý do và xác nhận từ chối.
  - Thì: hệ thống chuyển trạng thái lịch hẹn sang **"Đã từ chối"**. Hiển thị toast với tiêu đề: **"Đã từ chối lịch hẹn"**, mô tả: **"Thông tin từ chối đã được gửi cho khách hàng trên Driver+"**. Nút từ chối biến mất. Lý do từ chối được ghi nhận trong lịch sử trạng thái.

- [ ] **AC-5**: Từ chối lịch hẹn thất bại
  - Tại: hộp thoại nhập lý do từ chối.
  - Khi: hệ thống từ chối thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái lịch hẹn không thay đổi.

### Nhóm B — Phân quyền

- [ ] **AC-6**: Phân quyền từ chối lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền từ chối lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Từ chối lịch hẹn: Mutation `DeclineBookingV3`

## 5. Business Rules

- **BR-BOOK-DEC-001**: Chỉ cho phép từ chối lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
- **BR-BOOK-DEC-002**: Sau khi từ chối, thông tin từ chối (lý do) được gửi cho khách hàng qua ứng dụng Driver+ (nếu lịch hẹn có nguồn từ Driver+).
- **BR-BOOK-DEC-003**: Lý do từ chối được ghi nhận trong lịch sử trạng thái cùng người thực hiện và thời gian.

## 6. Edge Cases

- **EC-1**: Trong khi mở hộp thoại từ chối, lịch hẹn đã bị hệ thống tự chuyển trạng thái (quá hạn) — từ chối thất bại.

## 7. Out of Scope

- Nội dung thông báo chi tiết gửi cho khách hàng qua Driver+ — thuộc luồng notification.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
