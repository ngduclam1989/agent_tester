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

# FEAT-MKT-SEG-DETAIL: Chi tiết phân khúc

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-SEG-DETAIL` |
| Title | Chi tiết phân khúc |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-customer` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phân khúc khách hàng bao gồm thông tin chung, cấu hình tiêu chí và danh sách khách hàng, **so that** tôi có thể theo dõi phân khúc và chạy lại đánh giá khi cần.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết và chạy lại

- [ ] **AC-1**: Hiển thị màn hình chi tiết phân khúc
  - Tại: màn hình Danh sách phân khúc.
  - Khi: chủ garage nhấn vào dòng phân khúc.
  - Thì: hệ thống hiển thị màn hình **"Chi tiết phân khúc"** với các mục: **"Thông tin chung"**, **"Cấu hình"** và **"Danh sách khách hàng"**.

- [ ] **AC-2**: Hiển thị thông tin chung
  - Tại: mục **"Thông tin chung"**.
  - Khi: hệ thống tải dữ liệu phân khúc.
  - Thì: hệ thống hiển thị các trường: **"Tên phân khúc"**, **"Mô tả"**.

- [ ] **AC-3**: Hiển thị cấu hình tiêu chí
  - Tại: mục **"Cấu hình"**.
  - Khi: phân khúc có tiêu chí đã cấu hình.
  - Thì: hệ thống hiển thị danh sách tiêu chí với nhãn **"Tiêu chí"** kèm số thứ tự và giá trị chi tiết tương ứng. Giữa các tiêu chí hiển thị nhãn **"Và"**. Các trường chi tiết theo loại tiêu chí:
    - **"Chi tiêu"**: hiển thị **"Chi tiêu từ"** và chi tiêu đến.
    - **"Thời gian đăng ký"**: hiển thị **"Từ ngày - đến ngày"**.
    - **"Tỉnh/Thành phố"**: hiển thị danh sách tỉnh/thành phố đã chọn.
    - **"Thông tin xe"**: hiển thị **"Hãng xe"** và **"Dòng xe"**.
    - **"Khách còn hoạt động trong"**: hiển thị số ngày.
    - **"Số lượt booking từ"**: hiển thị số lượt.

- [ ] **AC-4**: Cấu hình trống
  - Tại: mục **"Cấu hình"**.
  - Khi: phân khúc không có tiêu chí.
  - Thì: hệ thống hiển thị thông báo **"Không có tiêu chí"**.

- [ ] **AC-5**: Hiển thị danh sách khách hàng
  - Tại: mục **"Danh sách khách hàng"**.
  - Khi: phân khúc đã được đánh giá.
  - Thì: hệ thống hiển thị bảng khách hàng thuộc phân khúc với các cột: **"Tên khách hàng"**, **"Số điện thoại"**, **"Email"**. Có ô tìm kiếm: **"Tìm theo tên, số điện thoại"**.

- [ ] **AC-6**: Nút **"Chạy lại"** phân khúc
  - Tại: màn hình Chi tiết phân khúc, thanh hành động.
  - Khi: chủ garage nhấn nút **"Chạy lại"**.
  - Thì: hệ thống kích hoạt quy trình đánh giá lại phân khúc bất đồng bộ. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Chạy lại phân khúc thành công."**. Trạng thái phân khúc chuyển sang **"Đang xử lý"** trong quá trình đánh giá.

### Nhóm B — Phân quyền

- [ ] **AC-7**: Phân quyền xem chi tiết phân khúc
  - Tại: màn hình Chi tiết phân khúc.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết và thực hiện chạy lại phân khúc. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm C — Xử lý lỗi

- [ ] **AC-8**: Chạy lại phân khúc thất bại
  - Tại: màn hình Chi tiết phân khúc, sau khi nhấn **"Chạy lại"**.
  - Khi: hệ thống kích hoạt đánh giá phân khúc thất bại.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái phân khúc giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Chi tiết phân khúc: Query `GetSegment`
- Chạy lại phân khúc: Mutation `UpdateSegmentRules`

## 5. Business Rules

- **BR-MKT-SEG-DTL-001**: Khi chạy lại phân khúc, hệ thống xóa toàn bộ membership hiện tại và đánh giá lại từ đầu theo tiêu chí đã cấu hình.
- **BR-MKT-SEG-DTL-002**: Trong quá trình đánh giá, trạng thái phân khúc chuyển sang **"Đang xử lý"** và tự động chuyển về **"Đang hoạt động"** khi hoàn thành.
- **BR-MKT-SEG-DTL-003**: Không cho phép chạy lại hoặc chỉnh sửa phân khúc nếu phân khúc đang liên kết với chiến dịch chưa hoàn thành.

## 6. Edge Cases

- **EC-1**: Phân khúc chưa được đánh giá — mục **"Danh sách khách hàng"** hiển thị trống.
- **EC-2**: Phân khúc đang ở trạng thái **"Đang xử lý"** — nút **"Chạy lại"** bị vô hiệu.
- **EC-3**: Phân khúc đang liên kết chiến dịch chưa hoàn thành — nút **"Chạy lại"** bị vô hiệu.

## 7. Out of Scope

- Danh sách phân khúc → xem `FEAT-MKT-SEG-LIST`.
- Tạo phân khúc → xem `FEAT-MKT-SEG-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (segments-id screen, GetSegment query, UpdateSegmentRules mutation, criteria display, customer list) |
