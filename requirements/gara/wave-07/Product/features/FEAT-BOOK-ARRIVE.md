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

# FEAT-BOOK-ARRIVE: Xác nhận xe đã đến

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-ARRIVE` |
| Title | Xác nhận xe đã đến |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | DONE |

## 1. User Story

**As** chủ garage / kế toán, **I want** xác nhận xe của khách hàng đã đến garage theo lịch hẹn, **so that** garage bắt đầu quy trình tiếp nhận và tạo phiếu dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xác nhận xe đã đến

- [ ] **AC-1**: Hiển thị nút xe đã đến
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Đã xác nhận"**.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: hệ thống hiển thị nút xác nhận xe đã đến.

- [ ] **AC-2**: Ẩn nút xe đã đến khi trạng thái không phù hợp
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái khác **"Đã xác nhận"** (ví dụ: **"Lịch hẹn mới"**, **"Xe đã đến"**, **"Đã từ chối"**, **"Đã hủy"**).
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút xe đã đến không hiển thị.

- [ ] **AC-3**: Xác nhận xe đã đến thành công
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút xác nhận xe đã đến.
  - Thì: hệ thống chuyển trạng thái lịch hẹn sang **"Xe đã đến"**. Ghi nhận thời điểm xe đến. Hiển thị toast với tiêu đề: **"Thành công"**, mô tả: **"Đã cập nhật xe đã đến"**. Nút xe đã đến biến mất.

- [ ] **AC-4**: Xác nhận xe đã đến thất bại
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: hệ thống xác nhận thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái lịch hẹn không thay đổi.

### Nhóm B — Phân quyền

- [ ] **AC-5**: Phân quyền xác nhận xe đã đến
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xác nhận xe đã đến. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Xác nhận xe đã đến: Mutation `ArriveBookingV3`

## 5. Business Rules

- **BR-BOOK-ARR-001** (≡ phần đầu `BR-BOOK-011` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Chỉ cho phép xác nhận xe đã đến khi lịch hẹn ở trạng thái **"Đã xác nhận"**.
- **BR-BOOK-ARR-002** (≡ phần sau `BR-BOOK-011` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Hệ thống ghi nhận thời điểm xe đến tại thời điểm xác nhận.
- **BR-BOOK-ARR-003**: Hệ thống ghi nhận lịch sử chuyển trạng thái với người thực hiện và thời gian.
- **BR-BOOK-ARR-004** (≡ `BR-BOOK-012` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Sau khi xe đã đến, lịch hẹn sẵn sàng để tạo phiếu dịch vụ liên kết (xem `FEAT-SO-CREATE`).
- **BR-BOOK-ARR-005** (mới, 2026-08-03): Nếu lịch hẹn có nguồn từ Driver+, hệ thống đồng bộ trạng thái **"Xe đã đến"** sang Driver+ — chi tiết xem `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` AC-3.

## 6. Edge Cases

- **EC-1**: Trong khi nhấn xác nhận, lịch hẹn đã bị hệ thống tự hủy (quá hạn) — xác nhận thất bại.

## 7. Out of Scope

- Tạo phiếu dịch vụ từ lịch hẹn đã đến → xem `FEAT-SO-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-08-03 | 2 | user (Business Authority) qua main agent | Thêm BR-BOOK-ARR-005 (mới): đồng bộ trạng thái "Xe đã đến" sang Driver+ khi lịch hẹn có nguồn D+ — chi tiết `FEAT-BOOK-DRIVERPLUS-OUTBOUND.md` (đợt viết lại tích hợp Driver+). |
| 2026-08-03 | 3 | user (Business Authority) qua main agent | **Fix P2 (BA-review round 1)**: Metadata table `Status` sửa "PLANNED" → **DONE** khớp frontmatter (drift template có sẵn từ trước, thuần editorial). |
| 2026-08-03 | 4 | user (Business Authority) qua main agent | **Fix F2 (BA-review Wave 7)**: BR-BOOK-ARR-001/002/004 thêm cross-ref (≡) sang ID trùng nội dung tại `BR-GF-SALES.md` §2.1 (`BR-BOOK-011`/`BR-BOOK-012`) — legacy trùng ID từ baseline, không phải phát sinh mới, chỉ nối cross-ref 2 chiều để tránh drift âm thầm về sau, không xoá/gộp ID. |
