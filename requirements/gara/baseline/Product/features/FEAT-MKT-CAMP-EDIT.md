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

# FEAT-MKT-CAMP-EDIT: Chỉnh sửa chiến dịch

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-CAMP-EDIT` |
| Title | Chỉnh sửa chiến dịch |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin chiến dịch marketing đang ở trạng thái nháp, **so that** tôi có thể điều chỉnh nội dung, phân khúc và giai đoạn gửi trước khi khởi chạy.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa, sửa thông tin và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa chiến dịch
  - Tại: màn hình Chi tiết chiến dịch, chiến dịch ở trạng thái **"Nháp"**.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa chiến dịch với form đã điền sẵn dữ liệu hiện tại, gồm các mục: **"Thông tin chung"**, **"Thiết lập giai đoạn"** và **"Thiết lập chi tiết"**.

- [ ] **AC-2**: Lưu chỉnh sửa thành công
  - Tại: form chỉnh sửa chiến dịch, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật chiến dịch thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Chỉnh sửa chiến dịch thành công"**.

- [ ] **AC-3**: Khởi chạy chiến dịch từ form chỉnh sửa
  - Tại: form chỉnh sửa chiến dịch, nút **"Chạy"**.
  - Khi: chủ garage nhấn nút **"Chạy"**.
  - Thì: hệ thống hiển thị modal xác nhận với nội dung **"Bạn chắc chắn muốn chạy chiến dịch"**. Modal có hai nút: **"Hủy"** và **"Xác nhận"**.
  - Khi: chủ garage nhấn **"Xác nhận"**.
  - Thì: hệ thống lưu và khởi chạy chiến dịch, hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Khởi chạy chiến dịch thành công!"**.

- [ ] **AC-4**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa chiến dịch, nút **"Hủy"**.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống quay về màn hình trước đó. Dữ liệu đã sửa trên form không được lưu.

- [ ] **AC-5**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa chiến dịch, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút hiển thị **"Đang lưu..."** hoặc ở trạng thái bị mờ (disabled).

### Nhóm B — Chi tiết form (giống form tạo)

- [ ] **AC-6**: Form chỉnh sửa có cấu trúc giống form tạo
  - Tại: màn hình chỉnh sửa chiến dịch.
  - Khi: hệ thống hiển thị form.
  - Thì: form gồm các mục và trường giống như form tạo chiến dịch (xem `FEAT-MKT-CAMP-CREATE` AC-5 đến AC-17), với dữ liệu đã điền sẵn từ chiến dịch hiện tại. Các trường bắt buộc, placeholder, validation và thông báo lỗi giữ nguyên như form tạo.

- [ ] **AC-7**: Chiến dịch không ở trạng thái nháp không cho phép chỉnh sửa
  - Tại: màn hình Chi tiết chiến dịch.
  - Khi: chiến dịch không ở trạng thái **"Nháp"**.
  - Thì: nút chỉnh sửa không hiển thị hoặc bị vô hiệu. Nếu truy cập trực tiếp URL chỉnh sửa, hệ thống hiển thị thông báo **"Không tìm thấy chiến dịch"** hoặc chuyển về chi tiết ở chế độ chỉ đọc.

### Nhóm C — Phân quyền

- [ ] **AC-8**: Phân quyền chỉnh sửa chiến dịch
  - Tại: màn hình Chi tiết chiến dịch.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa chiến dịch khi chiến dịch ở trạng thái **"Nháp"**. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-9**: Validation form thất bại
  - Tại: form chỉnh sửa chiến dịch, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm và không gửi yêu cầu lên hệ thống.

- [ ] **AC-10**: Cập nhật chiến dịch thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa chiến dịch, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật chiến dịch thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Lấy chi tiết chiến dịch: Query `GetCampaignById`
- Cập nhật chiến dịch: Mutation `UpdateCampaign`
- Tạo chiến dịch (dùng chung form): Mutation `CreateCampaign`
- Danh sách phân khúc: Query `SearchSegments`
- Số lượng khách hàng phân khúc: Query `GetSegmentCustomerCount`
- Danh sách template: Query `SearchMessageTemplates`
- Danh sách chương trình voucher: Query `SearchVoucherPrograms`
- Giới hạn thông báo: Query `GetNotificationLimits`
- Danh sách người dùng: Query `SearchUsers`

## 5. Business Rules

- **BR-MKT-CAMP-EDT-001**: Chiến dịch chỉ cho phép chỉnh sửa khi ở trạng thái **"Nháp"**. Các trạng thái khác không cho phép chỉnh sửa.
- **BR-MKT-CAMP-EDT-002**: Khi lưu, hệ thống giữ nguyên mã chiến dịch đã sinh — không cho phép thay đổi.
- **BR-MKT-CAMP-EDT-003**: Nếu chiến dịch liên kết chương trình voucher, chương trình đó phải ở trạng thái **"Hoạt động"** khi khởi chạy.

## 6. Edge Cases

- **EC-1**: Truy cập URL chỉnh sửa cho chiến dịch không ở trạng thái **"Nháp"** — hệ thống hiển thị thông báo **"Không tìm thấy chiến dịch"**.
- **EC-2**: Phân khúc hoặc chương trình voucher đã liên kết bị xóa hoặc thay đổi trạng thái — hệ thống vẫn hiển thị dữ liệu cũ trên form nhưng validate lại khi lưu.

## 7. Out of Scope

- Danh sách chiến dịch → xem `FEAT-MKT-CAMP-LIST`.
- Tạo chiến dịch → xem `FEAT-MKT-CAMP-CREATE`.
- Chi tiết chiến dịch → xem `FEAT-MKT-CAMP-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (campaign-id-edit screen, UpdateCampaign mutation, edit form) |
