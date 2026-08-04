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

# FEAT-MKT-VOUC-EDIT: Chỉnh sửa chương trình voucher

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-VOUC-EDIT` |
| Title | Chỉnh sửa chương trình voucher |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin chương trình voucher đang ở trạng thái nháp, **so that** tôi có thể điều chỉnh cấu hình voucher trước khi kích hoạt chương trình.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa, sửa thông tin và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher, chương trình ở trạng thái **"Nháp"**.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa chương trình Voucher"** với form đã điền sẵn dữ liệu hiện tại, gồm các mục: **"Thông tin cơ bản"** và **"Cấu hình Voucher"**.

- [ ] **AC-2**: Lưu chỉnh sửa thành công
  - Tại: form chỉnh sửa chương trình voucher, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật chương trình voucher thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Chỉnh sửa chương trình voucher thành công."**.

- [ ] **AC-3**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa chương trình voucher, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống quay về màn hình trước đó. Dữ liệu đã sửa trên form không được lưu.

- [ ] **AC-4**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa chương trình voucher, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút ở trạng thái bị mờ (disabled).

### Nhóm B — Chi tiết form (giống form tạo)

- [ ] **AC-5**: Form chỉnh sửa có cấu trúc giống form tạo
  - Tại: màn hình chỉnh sửa chương trình voucher.
  - Khi: hệ thống hiển thị form.
  - Thì: form gồm các mục và trường giống như form tạo chương trình voucher (xem `FEAT-MKT-VOUC-CREATE` AC-5 đến AC-9), với dữ liệu đã điền sẵn từ chương trình hiện tại. Các trường bắt buộc, placeholder, validation và thông báo lỗi giữ nguyên như form tạo.

- [ ] **AC-6**: Chương trình không ở trạng thái nháp không cho phép chỉnh sửa
  - Tại: màn hình Chi tiết chương trình voucher.
  - Khi: chương trình không ở trạng thái **"Nháp"**.
  - Thì: nút chỉnh sửa không hiển thị hoặc bị vô hiệu. Nếu truy cập trực tiếp URL chỉnh sửa, hệ thống chuyển về chi tiết ở chế độ chỉ đọc.

### Nhóm C — Phân quyền

- [ ] **AC-7**: Phân quyền chỉnh sửa chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa chương trình voucher khi chương trình ở trạng thái **"Nháp"**. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-8**: Validation form thất bại
  - Tại: form chỉnh sửa chương trình voucher, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm và không gửi yêu cầu lên hệ thống.

- [ ] **AC-9**: Cập nhật chương trình voucher thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa chương trình voucher, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật chương trình voucher thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Lấy chi tiết chương trình voucher: Query `GetVoucherProgramById`
- Cập nhật chương trình voucher: Mutation `UpdateVoucherProgram`

## 5. Business Rules

- **BR-MKT-VOUC-EDT-001**: Chương trình voucher chỉ cho phép chỉnh sửa khi ở trạng thái **"Nháp"**. Các trạng thái khác không cho phép chỉnh sửa.
- **BR-MKT-VOUC-EDT-002**: Khi lưu, hệ thống giữ nguyên mã chương trình đã sinh — không cho phép thay đổi.
- **BR-MKT-VOUC-EDT-003**: Ngày kết thúc (**"Đến ngày"**) phải sau ngày bắt đầu (**"Từ ngày"**) và không được trước thời điểm hiện tại.

## 6. Edge Cases

- **EC-1**: Truy cập URL chỉnh sửa cho chương trình không ở trạng thái **"Nháp"** — hệ thống chuyển về chi tiết ở chế độ chỉ đọc.

## 7. Out of Scope

- Danh sách chương trình voucher → xem `FEAT-MKT-VOUC-LIST`.
- Tạo chương trình voucher → xem `FEAT-MKT-VOUC-CREATE`.
- Chi tiết chương trình voucher → xem `FEAT-MKT-VOUC-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (voucher-programs-id-edit screen, UpdateVoucherProgram mutation, edit form) |
