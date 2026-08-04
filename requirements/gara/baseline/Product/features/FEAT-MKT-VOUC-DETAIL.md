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

# FEAT-MKT-VOUC-DETAIL: Chi tiết chương trình voucher

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-VOUC-DETAIL` |
| Title | Chi tiết chương trình voucher |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết chương trình voucher bao gồm thông tin chung, cấu hình voucher, mã QR và danh sách voucher, **so that** tôi có thể theo dõi tình trạng chương trình và thực hiện các thao tác quản lý (chạy, tạm dừng, hủy).

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết chương trình voucher
  - Tại: màn hình Danh sách chương trình voucher.
  - Khi: chủ garage nhấn vào dòng chương trình.
  - Thì: hệ thống hiển thị màn hình **"Chi tiết chương trình Voucher"** với các mục: **"Thông tin chung"**, **"Cấu hình Voucher"** và **"Danh sách Voucher"**.

- [ ] **AC-2**: Hiển thị thông tin chung
  - Tại: mục **"Thông tin chung"**.
  - Khi: hệ thống tải dữ liệu chương trình.
  - Thì: hệ thống hiển thị các trường: **"Tên chương trình"**, **"Thời gian"** (từ ngày — đến ngày), **"Mô tả"**, **"Mã QR chương trình"**.

- [ ] **AC-3**: Hiển thị cấu hình voucher
  - Tại: mục **"Cấu hình Voucher"**.
  - Khi: hệ thống tải dữ liệu chương trình.
  - Thì: hệ thống hiển thị các trường: **"Loại Voucher"**, **"Số lượng Voucher"**, **"Số lượng thu thập tối đa/Khách"**, **"Số lần dùng tối đa/Khách"**, **"Chu kỳ thu thập"**.

- [ ] **AC-4**: Hiển thị danh sách voucher
  - Tại: mục **"Danh sách Voucher"**.
  - Khi: chương trình đã được kích hoạt và có voucher.
  - Thì: hệ thống hiển thị bảng danh sách voucher với các cột: **"Mã Voucher"**, **"Tên khách hàng"**, **"Trạng thái"**, **"Thời gian nhận mã"**, **"Thời gian sử dụng"**, **"Ngày hết hạn"**. Có ô tìm kiếm: **"Tìm theo tên voucher, tên khách hàng"**.

- [ ] **AC-5**: Hiển thị trạng thái voucher với badge
  - Tại: mục **"Danh sách Voucher"**, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị trạng thái voucher.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Đã tạo, chưa phân phối"**
    - **"Khách hàng đã thu thập (QR Scan)"**
    - **"Đã gửi cho khách hàng qua chiến dịch Marketing"**
    - **"Đã sử dụng"**
    - **"Đã hết hạn"**

- [ ] **AC-6**: Xem chi tiết voucher
  - Tại: mục **"Danh sách Voucher"**, nhấn vào dòng voucher.
  - Khi: chủ garage nhấn vào một voucher.
  - Thì: hệ thống hiển thị dialog **"Thông tin Voucher"** với các trường: **"Khách hàng"**, **"Dịch vụ áp dụng"**, **"Số tiền gốc"**, **"Số tiền giảm"**, **"Số tiền sau giảm"**.

- [ ] **AC-7**: Hủy voucher đơn lẻ
  - Tại: mục **"Danh sách Voucher"**, cột thao tác.
  - Khi: chủ garage nhấn nút hủy voucher.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Hủy Voucher"** và nội dung **"Bạn chắc chắn muốn hủy voucher?"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**.

### Nhóm B — Nút hành động trạng thái

- [ ] **AC-8**: Nút **"Chạy"** chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher, thanh hành động.
  - Khi: chương trình ở trạng thái **"Nháp"** hoặc **"Tạm dừng"**.
  - Thì: nút **"Chạy"** hiển thị. Khi nhấn, hệ thống hiển thị modal xác nhận với tiêu đề **"Chạy chương trình Voucher"** và nội dung **"Bạn chắc chắn muốn chạy chương trình?"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**. Sau khi xác nhận thành công, hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Chạy chương trình voucher thành công."**.

- [ ] **AC-9**: Nút **"Tạm dừng"** chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher, thanh hành động.
  - Khi: chương trình ở trạng thái **"Hoạt động"**.
  - Thì: nút **"Tạm dừng"** hiển thị. Khi nhấn, hệ thống hiển thị modal xác nhận với tiêu đề **"Tạm dừng chương trình Voucher"** và nội dung **"Bạn chắc chắn muốn tạm dừng chương trình?"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**. Sau khi xác nhận thành công, hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạm dừng chương trình voucher thành công."**.

- [ ] **AC-10**: Nút **"Hủy"** chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher, thanh hành động.
  - Khi: chương trình ở trạng thái **"Hoạt động"** hoặc **"Tạm dừng"**.
  - Thì: nút **"Hủy"** hiển thị. Khi nhấn, hệ thống hiển thị modal xác nhận với tiêu đề **"Hủy chương trình Voucher"** và nội dung **"Bạn chắc chắn muốn hủy chương trình?"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**. Sau khi xác nhận thành công, hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Hủy chương trình voucher thành công."**.

### Nhóm C — Phân quyền

- [ ] **AC-11**: Phân quyền xem chi tiết chương trình voucher
  - Tại: màn hình Chi tiết chương trình voucher.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết và thực hiện các thao tác chạy, tạm dừng, hủy chương trình. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-12**: Thao tác hành động thất bại
  - Tại: màn hình Chi tiết chương trình voucher, sau khi thực hiện hành động.
  - Khi: hệ thống thực hiện hành động (chạy, tạm dừng, hủy) thất bại.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái chương trình giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Chi tiết chương trình voucher: Query `GetVoucherProgramById`
- Kích hoạt chương trình: Mutation `ActivateVoucherProgram`
- Tạm dừng chương trình: Mutation `SuspendVoucherProgram`
- Hủy chương trình: Mutation `CancelVoucherProgram`
- Sinh mã QR: Mutation `GenerateVoucherProgramQr`

## 5. Business Rules

- **BR-MKT-VOUC-DTL-001**: Chương trình voucher chuyển trạng thái theo quy tắc: **"Nháp"** -> **"Hoạt động"** -> **"Hết hạn"** / **"Đã hủy"** / **"Tạm dừng"**; **"Tạm dừng"** -> **"Hoạt động"** / **"Đã hủy"**.
- **BR-MKT-VOUC-DTL-002**: Khi kích hoạt chương trình, hệ thống sinh pool voucher theo số lượng đã cấu hình và lên lịch hết hạn tự động.
- **BR-MKT-VOUC-DTL-003**: Không cho phép hủy hoặc tạm dừng chương trình voucher đang liên kết với chiến dịch chưa hoàn thành hoặc chưa hủy.
- **BR-MKT-VOUC-DTL-004**: Trạng thái voucher đơn lẻ có các giá trị: **"Đã tạo, chưa phân phối"**, **"Khách hàng đã thu thập (QR Scan)"**, **"Đã gửi cho khách hàng qua chiến dịch Marketing"**, **"Đã sử dụng"**, **"Đã hết hạn"**.

## 6. Edge Cases

- **EC-1**: Chương trình chưa kích hoạt — mục **"Danh sách Voucher"** hiển thị trống.
- **EC-2**: Chương trình hết hạn hoặc đã hủy — không hiển thị nút hành động (chạy, tạm dừng, hủy).
- **EC-3**: Chương trình đang liên kết chiến dịch chưa hoàn thành — nút **"Hủy"** và **"Tạm dừng"** bị vô hiệu.

## 7. Out of Scope

- Danh sách chương trình voucher → xem `FEAT-MKT-VOUC-LIST`.
- Tạo chương trình voucher → xem `FEAT-MKT-VOUC-CREATE`.
- Chỉnh sửa chương trình voucher → xem `FEAT-MKT-VOUC-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (voucher-programs-id screen, GetVoucherProgramById query, action mutations) |
