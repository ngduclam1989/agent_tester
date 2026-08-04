---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SUPPORT"
boundary: "agg-garage-graph"
last_reviewed: "2026-05-27"
---

# FEAT-SUP-FEEDBACK: Gửi phản hồi

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SUP-FEEDBACK` |
| Title | Gửi phản hồi |
| Parent Epic | `EP-SUPPORT` |
| Boundary | `agg-garage-graph` |
| Priority | P2 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** gửi phản hồi về phần mềm, **so that** nhà cung cấp phần mềm có thể cải thiện sản phẩm.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị form và điền thông tin phản hồi

- [ ] **AC-1**: Hiển thị màn hình gửi phản hồi
  - Tại: menu hệ thống, mục góp ý.
  - Khi: chủ garage truy cập chức năng gửi phản hồi.
  - Thì: hệ thống hiển thị form phản hồi với tiêu đề **"GÓP Ý NHANH – GIÚP ỨNG DỤNG PHỤC VỤ GARAGE TỐT HƠN"** và mô tả: **"Chúng tôi đang cập nhật phiên bản mới và muốn lắng nghe trải nghiệm thực tế từ garage. Vui lòng dành 1 phút chia sẻ ý kiến để ứng dụng có thể phục vụ Garage tốt hơn."**

- [ ] **AC-2**: Mục Tên Garage
  - Tại: form phản hồi, mục **"Tên Garage?"**.
  - Khi: chủ garage điền tên garage.
  - Thì: trường này là bắt buộc. Nếu để trống, hiển thị thông báo lỗi: **"Đây là câu hỏi bắt buộc"**.

- [ ] **AC-3**: Mục Loại vấn đề
  - Tại: form phản hồi, mục **"Loại vấn đề Anh/Chị gặp phải?"**.
  - Khi: chủ garage chọn loại vấn đề gặp phải.
  - Thì: trường này là bắt buộc, cho phép chọn nhiều giá trị. Danh sách lựa chọn bao gồm:
    - **"Nhóm chức năng quản lý sửa chữa và dịch vụ (đặt lịch, phiếu dịch vụ, quyết toán)"**
    - **"Nhóm chức năng mua hàng (tạo yêu cầu báo giá, đặt đơn,...)"**
    - **"Nhóm chức năng quản trị kho"**
    - **"Nhóm chức năng quản lý khách hàng"**
    - **"Nhóm chức năng quản lý nhân viên"**
    - **"Nhóm chức năng thống kê"**
    - **"Chất lượng hỗ trợ khách hàng (đội ngũ chăm sóc khách hàng)"**
    - **"Trải nghiệm ứng dụng, web, góp ý bổ sung tính năng"**
    - **"Khác"**
  - Nếu không chọn giá trị nào, hiển thị thông báo lỗi: **"Đây là câu hỏi bắt buộc"**.

- [ ] **AC-4**: Mục Loại vấn đề khác — trường bổ sung
  - Tại: form phản hồi, mục **"Loại vấn đề Anh/Chị gặp phải?"**.
  - Khi: chủ garage chọn **"Khác"** trong danh sách loại vấn đề.
  - Thì: hệ thống hiển thị trường nhập bổ sung với placeholder: **"Câu trả lời của bạn"**. Trường này trở thành bắt buộc khi đã chọn **"Khác"**. Nếu để trống, hiển thị thông báo lỗi: **"Đây là câu hỏi bắt buộc"**.

- [ ] **AC-5**: Mục Chi tiết góp ý
  - Tại: form phản hồi, mục **"Chi tiết góp ý, vấn đề và mong muốn của Anh/Chị?"**.
  - Khi: chủ garage nhập nội dung chi tiết.
  - Thì: trường này là bắt buộc, placeholder: **"Nhập nội dung"**. Nếu để trống, hiển thị thông báo lỗi: **"Vui lòng nhập nội dung"**.

- [ ] **AC-6**: Mục Địa chỉ Garage
  - Tại: form phản hồi, mục **"Địa chỉ Garage của Anh/Chị?"**.
  - Khi: chủ garage nhập địa chỉ garage.
  - Thì: trường này là tùy chọn.

- [ ] **AC-7**: Mục Số điện thoại
  - Tại: form phản hồi, mục **"Số điện thoại của Garage (để chúng tôi có thể phản hồi nhanh)?"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: trường này là tùy chọn. Nếu nhập giá trị không đúng định dạng, hiển thị thông báo lỗi: **"Số điện thoại không hợp lệ"**.

- [ ] **AC-8**: Mục Email
  - Tại: form phản hồi, trường email.
  - Khi: chủ garage nhập email.
  - Thì: trường này là tùy chọn, placeholder: **"Nhập Email của bạn"**. Nếu nhập giá trị không đúng định dạng, hiển thị thông báo lỗi: **"Email không hợp lệ"**.

### Nhóm B — Gửi phản hồi và kết quả

- [ ] **AC-9**: Điều kiện nút Gửi
  - Tại: form phản hồi, nút **"Gửi"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên Garage, Loại vấn đề, Chi tiết góp ý).
  - Thì: nút **"Gửi"** khả dụng (enabled). Nếu còn thiếu trường bắt buộc hoặc đang gửi request, nút **"Gửi"** bị mờ (disabled).

- [ ] **AC-10**: Gửi phản hồi thành công
  - Tại: form phản hồi, nút **"Gửi"**.
  - Khi: chủ garage nhấn nút **"Gửi"** và hệ thống xử lý thành công.
  - Thì: hệ thống hiển thị toast thành công với title **"Thành công"** và description: **"Cảm ơn bạn đã góp ý! Ý kiến của bạn đã được gửi tới bộ phận CSKH."** Hiển thị thông báo xác nhận: **"Phản hồi của bạn đã được ghi nhận."** Có hai nút hành động: **"Đóng"** để đóng form và **"Gửi lại"** để gửi phản hồi mới.

- [ ] **AC-11**: Gửi phản hồi thất bại
  - Tại: form phản hồi, nút **"Gửi"**.
  - Khi: chủ garage nhấn nút **"Gửi"** và hệ thống xử lý thất bại.
  - Thì: hệ thống hiển thị toast lỗi với title **"Lỗi"** và description: **"Có lỗi xảy ra, vui lòng thử lại sau!"**. Đồng thời hiển thị thông báo: **"Gửi phản hồi thất bại. Vui lòng thử lại."**

- [ ] **AC-12**: Xóa hết câu trả lời
  - Tại: form phản hồi, liên kết **"Xóa hết câu trả lời"**.
  - Khi: chủ garage nhấn **"Xóa hết câu trả lời"**.
  - Thì: hệ thống xóa toàn bộ dữ liệu đã nhập trong form, đưa form về trạng thái ban đầu.

### Nhóm C — Phân quyền

- [ ] **AC-13**: Phân quyền gửi phản hồi
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền truy cập chức năng gửi phản hồi, điền form và gửi. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Trạng thái trống và lỗi

- [ ] **AC-14**: Validation tổng hợp khi gửi form
  - Tại: form phản hồi, nút **"Gửi"**.
  - Khi: chủ garage nhấn nút **"Gửi"** mà chưa điền đủ trường bắt buộc.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng cho từng trường bắt buộc chưa điền: **"Đây là câu hỏi bắt buộc"** cho Tên Garage và Loại vấn đề, **"Vui lòng nhập nội dung"** cho Chi tiết góp ý.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SUPPORT.

## 4. API Reference

- Boundary: `agg-garage-graph` (BFF)
- Gửi phản hồi: qua endpoint Google Sheet (`feedback-google-sheet`)

## 5. Business Rules

- **BR-SUP-FB-001**: Form phản hồi có ba trường bắt buộc: Tên Garage, Loại vấn đề, và Chi tiết góp ý.
- **BR-SUP-FB-002**: Loại vấn đề cho phép chọn nhiều giá trị cùng lúc.
- **BR-SUP-FB-003**: Khi chọn loại vấn đề **"Khác"**, trường mô tả bổ sung trở thành bắt buộc.
- **BR-SUP-FB-004**: Phản hồi được gửi đến bộ phận CSKH qua dịch vụ bên ngoài (Google Sheet).
- **BR-SUP-FB-005**: Sau khi gửi thành công, người dùng có thể gửi phản hồi mới thông qua nút **"Gửi lại"**.

## 6. Edge Cases

- **EC-1**: Nhập email không đúng định dạng — hiển thị thông báo **"Email không hợp lệ"**.
- **EC-2**: Nhập số điện thoại không đúng định dạng — hiển thị thông báo **"Số điện thoại không hợp lệ"**.
- **EC-3**: Mất kết nối mạng khi gửi phản hồi — hiển thị thông báo lỗi **"Có lỗi xảy ra, vui lòng thử lại sau!"**.
- **EC-4**: Người dùng chọn **"Khác"** rồi bỏ chọn — trường mô tả bổ sung ẩn đi và không còn bắt buộc.

## 7. Out of Scope

- Chat hỗ trợ CSKH: thuộc `FEAT-SUP-CHAT`.
- Quản lý phản hồi phía CSKH (xem, phản hồi, thống kê): nằm ngoài phạm vi hệ thống garage.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (feedback screen). Cover form gửi phản hồi với 8 loại vấn đề + Khác, validation, toast thành công/thất bại. |
