---
type: feature
artifact_kind: feature
status: DONE
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-BOOK-DETAIL: Chi tiết lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-DETAIL` |
| Title | Chi tiết lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | DONE |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem toàn bộ thông tin chi tiết của một lịch hẹn bao gồm thông tin khách hàng, xe, dịch vụ, lịch sử trạng thái và liên kết phiếu dịch vụ, **so that** tôi có đầy đủ ngữ cảnh để ra quyết định xác nhận, từ chối hoặc tiếp nhận xe.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xem thông tin chi tiết

- [ ] **AC-1**: Mở màn hình chi tiết lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage nhấn vào một lịch hẹn trong danh sách.
  - Thì: hệ thống chuyển sang màn hình chi tiết lịch hẹn với tiêu đề **"Lịch hẹn"**.

- [ ] **AC-2**: Hiển thị thông tin tổng quan
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: màn hình được tải.
  - Thì: hệ thống hiển thị:
    - Mã lịch hẹn
    - **"Trạng thái"** — tên tiếng Việt tương ứng
    - **"Nguồn"** — tên tiếng Việt tương ứng
    - **"Thời gian hẹn"**

- [ ] **AC-3**: Hiển thị thông tin khách hàng
  - Tại: màn hình Chi tiết lịch hẹn, mục thông tin khách hàng.
  - Khi: màn hình được tải.
  - Thì: hệ thống hiển thị: tên khách hàng, số điện thoại.

- [ ] **AC-4**: Hiển thị thông tin xe
  - Tại: màn hình Chi tiết lịch hẹn, mục thông tin xe.
  - Khi: màn hình được tải.
  - Thì: hệ thống hiển thị: biển số xe, hãng xe, dòng xe, phiên bản, năm sản xuất, số VIN, số Km, hình ảnh xe (nếu có).

- [ ] **AC-5**: Hiển thị thông tin dịch vụ
  - Tại: màn hình Chi tiết lịch hẹn, mục thông tin dịch vụ.
  - Khi: màn hình được tải.
  - Thì: hệ thống hiển thị: loại dịch vụ, mô tả tình trạng xe, ghi chú khách hàng, ghi chú nội bộ.

- [ ] **AC-6**: Hiển thị lịch sử trạng thái
  - Tại: màn hình Chi tiết lịch hẹn, mục lịch sử.
  - Khi: màn hình được tải.
  - Thì: hệ thống hiển thị danh sách lịch sử chuyển trạng thái theo thứ tự thời gian, mỗi mục gồm: hành động, mô tả, người thực hiện, thời gian. Nếu có lý do (hủy, từ chối) thì hiển thị lý do.

- [ ] **AC-7**: Hiển thị liên kết phiếu dịch vụ
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn đã được liên kết với phiếu dịch vụ.
  - Thì: hệ thống hiển thị mã phiếu dịch vụ và trạng thái phiếu dịch vụ liên kết.

- [ ] **AC-8**: Không có phiếu dịch vụ liên kết
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn chưa được liên kết với phiếu dịch vụ nào.
  - Thì: hệ thống không hiển thị thông tin phiếu dịch vụ hoặc hiển thị trạng thái chưa có liên kết.

### Nhóm B — Nút hành động trên chi tiết

- [ ] **AC-9**: Hiển thị các nút hành động theo trạng thái
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Lịch hẹn mới"**.
  - Thì: hiển thị nút Xác nhận (xem `FEAT-BOOK-CONFIRM`), nút Từ chối (xem `FEAT-BOOK-DECLINE`), nút Chỉnh sửa (xem `FEAT-BOOK-EDIT`).

- [ ] **AC-10**: Nút hành động khi trạng thái "Đã xác nhận"
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Đã xác nhận"**.
  - Thì: hiển thị nút Xe đã đến (xem `FEAT-BOOK-ARRIVE`), nút Hủy (xem `FEAT-BOOK-CANCEL`), nút Chỉnh sửa (xem `FEAT-BOOK-EDIT`).

- [ ] **AC-11**: Nút hành động khi trạng thái "Xe đã đến"
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Xe đã đến"** và chưa có phiếu dịch vụ liên kết.
  - Thì: hiển thị nút tạo phiếu dịch vụ (xem `FEAT-SO-CREATE`). Khi nhấn nút, hệ thống chuyển sang màn hình tạo phiếu dịch vụ với thông tin lịch hẹn được liên kết sẵn.

- [ ] **AC-12**: Ẩn nút tạo phiếu dịch vụ khi đã có liên kết
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Xe đã đến"** và đã có phiếu dịch vụ liên kết.
  - Thì: nút tạo phiếu dịch vụ không hiển thị. Thay vào đó hiển thị thông tin phiếu dịch vụ liên kết (xem AC-7).

- [ ] **AC-13**: Ẩn nút hành động khi trạng thái kết thúc
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: lịch hẹn ở trạng thái **"Đã từ chối"** hoặc **"Đã hủy"**.
  - Thì: không hiển thị nút hành động. Chỉ hiển thị thông tin xem.

### Nhóm C — Phân quyền

- [ ] **AC-14**: Phân quyền xem chi tiết lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Lấy chi tiết lịch hẹn: Query `GetBookingByIdV3`

## 5. Business Rules

- **BR-BOOK-DET-001** (≡ `BR-BOOK-020` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Thông tin khách hàng và xe hiển thị là snapshot tại thời điểm tạo lịch hẹn, không phải dữ liệu hiện tại của khách hàng/xe trong hệ thống.
- **BR-BOOK-DET-002**: Nút hành động chỉ hiển thị phù hợp với trạng thái hiện tại của lịch hẹn (xem AC-9, AC-10, AC-11, AC-13).
- **BR-BOOK-DET-003** (≡ `BR-BOOK-019` tại `BR-GF-SALES.md` §2.1 — BA-review Wave 7 F2): Lịch sử trạng thái ghi nhận đầy đủ: trạng thái trước, trạng thái sau, lý do (nếu có), người thực hiện, thời gian.

## 6. Edge Cases

- **EC-1**: Lịch hẹn không có thông tin xe — các trường xe hiển thị trống.
- **EC-2**: Lịch hẹn không có hình ảnh xe — mục hình ảnh không hiển thị.
- **EC-3**: Lịch sử trạng thái chỉ có 1 mục (vừa tạo) — hiển thị bình thường.

## 7. Out of Scope

- Xác nhận, từ chối, hủy, xe đã đến → xem `FEAT-BOOK-CONFIRM`, `FEAT-BOOK-DECLINE`, `FEAT-BOOK-CANCEL`, `FEAT-BOOK-ARRIVE`.
- Chỉnh sửa lịch hẹn → xem `FEAT-BOOK-EDIT`.
- Tạo phiếu dịch vụ từ lịch hẹn → xem `FEAT-SO-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-05-20 | 2 | Business Authority | Sửa AC-3: xóa email (không có trong KG frontend); bổ sung AC-11/AC-12: nút tạo phiếu dịch vụ khi "Xe đã đến" (xác nhận từ BA, permission KG có "Cho phép tạo phiếu dịch vụ liên kết"); tách AC-13: trạng thái kết thúc chỉ còn "Đã từ chối"/"Đã hủy"; đánh lại số AC |
| 2026-08-03 | 3 | user (Business Authority) qua main agent | **Fix P2 (BA-review round 1, đợt viết lại Driver+ EP-BOOKING)**: Metadata table `Status` sửa "PLANNED" → **DONE** khớp frontmatter (drift template có sẵn từ trước, thuần editorial). |
| 2026-08-03 | 4 | user (Business Authority) qua main agent | **Fix F2 (BA-review Wave 7)**: BR-BOOK-DET-001/003 thêm cross-ref (≡) sang ID trùng nội dung tại `BR-GF-SALES.md` §2.1 (`BR-BOOK-020`/`BR-BOOK-019`) — legacy trùng ID từ baseline, chỉ nối cross-ref 2 chiều, không xoá/gộp ID. |
