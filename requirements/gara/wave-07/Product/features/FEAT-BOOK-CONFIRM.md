---
type: feature
artifact_kind: feature
status: DONE
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-08-03"
---

# FEAT-BOOK-CONFIRM: Xác nhận lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-CONFIRM` |
| Title | Xác nhận lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | DONE |

## 1. User Story

**As** chủ garage / kế toán, **I want** xác nhận lịch hẹn để khách hàng biết garage đã tiếp nhận yêu cầu, **so that** khách hàng yên tâm và garage cam kết phục vụ đúng lịch.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xác nhận lịch hẹn

- [ ] **AC-1**: Hiển thị nút xác nhận
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: hệ thống hiển thị nút xác nhận lịch hẹn.

- [ ] **AC-2**: Ẩn nút xác nhận khi trạng thái không phù hợp
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái khác **"Lịch hẹn mới"** (ví dụ: **"Đã xác nhận"**, **"Xe đã đến"**, **"Đã từ chối"**, **"Đã hủy"**).
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút xác nhận không hiển thị.

- [ ] **AC-3**: Xác nhận lịch hẹn thành công
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
  - Khi: chủ garage nhấn nút xác nhận.
  - Thì: hệ thống chuyển trạng thái lịch hẹn sang **"Đã xác nhận"**. Hiển thị toast với tiêu đề: **"Xác nhận lịch hẹn thành công"**, mô tả: **"Lịch hẹn đã được xác nhận. Khách hàng sẽ nhận được thông báo qua Driver+"** (sửa lỗi chính tả "Drive+" → "Driver+", P2 fix 2026-08-03). Nút xác nhận biến mất, thay bằng nút Xe đã đến và nút Hủy.

- [ ] **AC-4**: Xác nhận lịch hẹn thất bại
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: hệ thống xác nhận thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái lịch hẹn không thay đổi.

### Nhóm B — Phân quyền

- [ ] **AC-5**: Phân quyền xác nhận lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xác nhận lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Xác nhận lịch hẹn: Mutation `ConfirmBookingV3`

## 5. Business Rules

- **BR-BOOK-CFM-001** (≡ `BR-BOOK-009` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Chỉ cho phép xác nhận lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
- **BR-BOOK-CFM-002** (≡ phần đầu `BR-BOOK-010` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Sau khi xác nhận, khách hàng nhận được thông báo qua ứng dụng Driver+ (nếu lịch hẹn có nguồn từ Driver+) — cơ chế gửi cụ thể nay thuộc `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` AC-1 (2026-08-03).
- **BR-BOOK-CFM-003** (≡ phần sau `BR-BOOK-010` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Hệ thống ghi nhận lịch sử chuyển trạng thái với người thực hiện và thời gian.

## 6. Edge Cases

- **EC-1**: Trong khi nhấn xác nhận, lịch hẹn đã bị hệ thống tự chuyển trạng thái (quá hạn) — xác nhận thất bại, hiển thị lỗi.

## 7. Out of Scope

- Nội dung thông báo chi tiết gửi cho khách hàng qua Driver+ — thuộc luồng notification.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-08-03 | 2 | user (Business Authority) qua main agent | BR-BOOK-CFM-002 thêm cross-ref cơ chế gửi cụ thể nay thuộc `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` (đợt viết lại tích hợp Driver+). |
| 2026-08-03 | 3 | user (Business Authority) qua main agent | **Fix P2 (BA-review round 1)**: AC-3 sửa lỗi chính tả "Drive+" → "Driver+" trong toast (đã sửa ở UX-FLOW-BOOKING v3 nhưng sót ở chính FEAT nguồn). Metadata table `Status` sửa "PLANNED" → **DONE** khớp frontmatter (drift template có sẵn từ trước, không riêng file này). |
| 2026-08-03 | 4 | user (Business Authority) qua main agent | **Fix F2 (BA-review Wave 7)**: BR-BOOK-CFM-001/002/003 thêm cross-ref (≡) sang ID trùng nội dung tại `BR-GF-SALES.md` §2.1 (`BR-BOOK-009`/`BR-BOOK-010`) — legacy trùng ID từ baseline, chỉ nối cross-ref 2 chiều, không xoá/gộp ID. |
