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

# FEAT-MKT-VOUC-CREATE: Tạo chương trình voucher

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-VOUC-CREATE` |
| Title | Tạo chương trình voucher |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo chương trình voucher mới với thông tin cơ bản và cấu hình voucher, **so that** tôi có thể phát hành voucher cho khách hàng phục vụ các hoạt động marketing.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, tạo và hủy

- [ ] **AC-1**: Mở màn hình tạo chương trình voucher
  - Tại: màn hình Danh sách chương trình voucher.
  - Khi: chủ garage nhấn nút **"Thêm mới"**.
  - Thì: hệ thống hiển thị màn hình **"Tạo chương trình Voucher mới"** với form gồm hai mục: **"Thông tin cơ bản"** và **"Cấu hình Voucher"**.

- [ ] **AC-2**: Tạo chương trình voucher thành công
  - Tại: form tạo chương trình voucher, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo chương trình voucher thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo mới chương trình voucher thành công."**, sau đó chuyển về màn hình Danh sách chương trình voucher.

- [ ] **AC-3**: Hủy bỏ tạo chương trình voucher
  - Tại: form tạo chương trình voucher, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống quay về màn hình trước đó. Dữ liệu đã nhập trên form không được lưu.

- [ ] **AC-4**: Điều kiện nút tạo
  - Tại: cuối form tạo chương trình voucher, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút ở trạng thái bị mờ (disabled).

### Nhóm B — Chi tiết form: Thông tin cơ bản

- [ ] **AC-5**: Mục **"Thông tin cơ bản"**
  - Tại: form tạo chương trình voucher, mục **"Thông tin cơ bản"**.
  - Khi: hệ thống hiển thị form.
  - Thì: mục gồm các trường:

  | # | Trường | Bắt buộc | Placeholder | Validation khi lỗi |
  |---|---|---|---|---|
  | 1 | **"Tên chương trình"** | Có | **"Nhập tên chương trình"** | **"Vui lòng nhập tên chương trình"** |
  | 2 | **"Từ ngày"** | Có | **"dd/mm/yyyy hh:mm"** | **"Vui lòng chọn ngày bắt đầu"** |
  | 3 | **"Đến ngày"** | Có | **"dd/mm/yyyy hh:mm"** | **"Vui lòng chọn ngày kết thúc"** · **"Ngày kết thúc phải sau ngày bắt đầu"** |
  | 4 | **"Trạng thái"** | Có | — | **"Vui lòng chọn trạng thái"** |
  | 5 | **"Mô tả"** | Không | **"Nhập mô tả"** | — |

### Nhóm C — Chi tiết form: Cấu hình Voucher

- [ ] **AC-6**: Mục **"Cấu hình Voucher"**
  - Tại: form tạo chương trình voucher, mục **"Cấu hình Voucher"**.
  - Khi: hệ thống hiển thị form.
  - Thì: mục gồm các trường:

  | # | Trường | Bắt buộc | Validation khi lỗi |
  |---|---|---|---|
  | 1 | **"Loại Voucher"** | Có | **"Vui lòng chọn loại voucher"** |
  | 2 | **"Số lượng Voucher"** | Có | **"Số lượng voucher phải là số nguyên"** |
  | 3 | **"Số lượng thu thập tối đa/Khách"** | Không | **"Số lượng thu thập tối đa/Khách phải là số nguyên"** |
  | 4 | **"Số lần dùng tối đa/Khách"** | Không | **"Số lần dùng tối đa/Khách phải là số nguyên"** |
  | 5 | **"Chu kỳ thu thập"** | Không | — |

- [ ] **AC-7**: Các giá trị chọn cho trường **"Loại Voucher"**
  - Tại: mục **"Cấu hình Voucher"**, trường **"Loại Voucher"**.
  - Khi: chủ garage mở dropdown chọn loại.
  - Thì: hệ thống hiển thị danh sách:
    - **"Giảm theo %"**
    - **"Giảm cố định"**
    - **"Miễn phí dịch vụ"**
    - **"Quà tặng"**

- [ ] **AC-8**: Các giá trị chọn cho trường **"Chu kỳ thu thập"**
  - Tại: mục **"Cấu hình Voucher"**, trường **"Chu kỳ thu thập"**.
  - Khi: chủ garage mở dropdown chọn chu kỳ.
  - Thì: hệ thống hiển thị danh sách:
    - **"Không"**
    - **"Mỗi ngày"**
    - **"Mỗi tuần"**
    - **"Mỗi tháng"**
    - **"Mỗi năm"**

- [ ] **AC-9**: Các giá trị chọn cho trường **"Trạng thái"**
  - Tại: mục **"Thông tin cơ bản"**, trường **"Trạng thái"**.
  - Khi: chủ garage mở dropdown chọn trạng thái.
  - Thì: hệ thống hiển thị danh sách:
    - **"Nháp"**
    - **"Hoạt động"**

### Nhóm D — Phân quyền

- [ ] **AC-10**: Phân quyền tạo chương trình voucher
  - Tại: màn hình tạo chương trình voucher.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền tạo chương trình voucher. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm E — Xử lý lỗi

- [ ] **AC-11**: Validation form thất bại
  - Tại: form tạo chương trình voucher, sau khi nhấn nút tạo.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm và không gửi yêu cầu lên hệ thống.

- [ ] **AC-12**: Tạo chương trình voucher thất bại do lỗi hệ thống
  - Tại: form tạo chương trình voucher, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo chương trình voucher thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Tạo chương trình voucher: Mutation `CreateVoucherProgram`

## 5. Business Rules

- **BR-MKT-VOUC-CRE-001**: Mã chương trình voucher được hệ thống tự sinh theo định dạng VP_{NNNNN} — không cho phép nhập thủ công.
- **BR-MKT-VOUC-CRE-002**: Ngày kết thúc (**"Đến ngày"**) phải sau ngày bắt đầu (**"Từ ngày"**) và không được trước thời điểm hiện tại.
- **BR-MKT-VOUC-CRE-003**: Khi tạo với trạng thái **"Hoạt động"**, hệ thống kích hoạt quy trình sinh voucher và lên lịch hết hạn tự động.
- **BR-MKT-VOUC-CRE-004**: Số lượng Voucher phải là số nguyên dương.

## 6. Edge Cases

- **EC-1**: Tạo chương trình voucher với trạng thái **"Hoạt động"** — hệ thống tự kích hoạt quy trình sinh voucher ngay sau khi tạo.
- **EC-2**: Nhập ngày kết thúc trước ngày bắt đầu — hệ thống hiển thị lỗi **"Ngày kết thúc phải sau ngày bắt đầu"**.

## 7. Out of Scope

- Danh sách chương trình voucher → xem `FEAT-MKT-VOUC-LIST`.
- Chi tiết chương trình voucher → xem `FEAT-MKT-VOUC-DETAIL`.
- Chỉnh sửa chương trình voucher → xem `FEAT-MKT-VOUC-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (voucher-programs-create screen, CreateVoucherProgram mutation, form fields with validation) |
