---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-PROCUREMENT"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-PO-EDIT: Chỉnh sửa đơn hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PO-EDIT` |
| Title | Chỉnh sửa đơn hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin đơn hàng mua phụ tùng bao gồm nhà cung cấp, phụ tùng và điều kiện giao hàng, **so that** tôi có thể cập nhật đơn hàng khi có thay đổi yêu cầu mua hàng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa đơn hàng"** với form được điền sẵn dữ liệu hiện tại của đơn hàng, gồm 2 mục: **"Thông tin đơn hàng"** và **"Danh sách phụ tùng cần mua"**.

- [ ] **AC-2**: Lưu chỉnh sửa đơn hàng thành công
  - Tại: form chỉnh sửa đơn hàng, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật đơn hàng thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật đơn hàng thành công."**. Hệ thống chuyển về màn hình Chi tiết đơn hàng.

- [ ] **AC-3**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa đơn hàng, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Nhà cung cấp, Trạng thái, Mức ưu tiên, Ngày giao dự kiến) và đã có ít nhất một phụ tùng với đơn giá, và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc, chưa có phụ tùng, hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ chỉnh sửa đơn hàng
  - Tại: form chỉnh sửa đơn hàng, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Tiếp tục chỉnh sửa đơn hàng?"** và mô tả **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** với hai nút **"Hủy"** và **"Tiếp tục"**. Nếu chọn **"Tiếp tục"**, quay về màn hình Chi tiết đơn hàng; nếu chọn **"Hủy"**, ở lại form.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin đơn hàng

- [ ] **AC-5**: Thay đổi nhà cung cấp
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Nhà cung cấp"**.
  - Khi: chủ garage thay đổi nhà cung cấp.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn nhà cung cấp"**. Trường này bắt buộc. Khi thay đổi nhà cung cấp, hệ thống cập nhật các trường liên hệ từ nhà cung cấp mới.
  - Khi: chủ garage bỏ chọn nhà cung cấp.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Nhà cung cấp là bắt buộc"**.

- [ ] **AC-6**: Chỉnh sửa trạng thái đơn hàng
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Trạng thái"**.
  - Khi: chủ garage thay đổi trạng thái.
  - Thì: hệ thống hiển thị ô chọn. Trường này bắt buộc. Lỗi khi để trống: **"Trạng thái đơn hàng là bắt buộc"**.

- [ ] **AC-7**: Chỉnh sửa mức ưu tiên
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Mức ưu tiên"**.
  - Khi: chủ garage thay đổi mức ưu tiên.
  - Thì: hệ thống hiển thị ô chọn với các giá trị: **"Bình thường"**, **"Gấp"**, **"Khẩn cấp"**. Trường này bắt buộc. Lỗi khi để trống: **"Mức ưu tiên là bắt buộc"**.

- [ ] **AC-8**: Chỉnh sửa ngày giao dự kiến
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Ngày giao dự kiến"**.
  - Khi: chủ garage thay đổi ngày giao dự kiến.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này bắt buộc. Lỗi khi để trống: **"Ngày giao dự kiến là bắt buộc"**. Lỗi khi ngày nhỏ hơn ngày hiện tại: **"Ngày giao dự kiến không được nhỏ hơn ngày hiện tại"**.

- [ ] **AC-9**: Chỉnh sửa các trường còn lại
  - Tại: mục **"Thông tin đơn hàng"**, các trường: **"Phiếu dịch vụ liên kết"** (placeholder: **"Chọn phiếu dịch vụ liên kết"**), **"Số điện thoại liên hệ"** (placeholder: **"Nhập số điện thoại"**), **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**), **"Địa chỉ"** (placeholder: **"Nhập địa chỉ"**), **"Phương thức thanh toán"**, **"Ghi chú"** (placeholder: **"Nhập ghi chú"**).
  - Khi: chủ garage chỉnh sửa các trường trên.
  - Thì: hệ thống cho phép chỉnh sửa. Tất cả các trường này không bắt buộc.

#### Mục: Danh sách phụ tùng cần mua

- [ ] **AC-10**: Chỉnh sửa danh sách phụ tùng
  - Tại: mục **"Danh sách phụ tùng cần mua"**.
  - Khi: chủ garage chỉnh sửa thông tin phụ tùng (số lượng, đơn giá, chiết khấu, thuế) hoặc thêm/xóa phụ tùng.
  - Thì: hệ thống cho phép chỉnh sửa tương tự form tạo (xem `FEAT-PO-CREATE` AC-15 đến AC-18). Bảng phụ tùng gồm các cột: **"Tên phụ tùng"**, **"Mã chính hãng"**, **"Phân khúc"**, **"Nguồn gốc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thao tác"**. Tìm kiếm phụ tùng: placeholder **"Tìm kiếm phụ tùng"**.

### Nhóm C — Phân quyền

- [ ] **AC-11**: Phân quyền chỉnh sửa đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa đơn hàng. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-12**: Đơn hàng không có phụ tùng sau chỉnh sửa
  - Tại: form chỉnh sửa đơn hàng, sau khi nhấn nút **"Lưu"**.
  - Khi: tất cả phụ tùng đã bị xóa.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Đơn hàng phải có ít nhất một phụ tùng"**. Form giữ nguyên dữ liệu.

- [ ] **AC-13**: Phụ tùng chưa có đơn giá
  - Tại: form chỉnh sửa đơn hàng, sau khi nhấn nút **"Lưu"**.
  - Khi: có phụ tùng chưa nhập đơn giá.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Vui lòng nhập đơn giá"**. Form giữ nguyên dữ liệu.

- [ ] **AC-14**: Cập nhật đơn hàng thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa đơn hàng, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã chỉnh sửa.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Chi tiết đơn hàng: Query `GetPurchaseOrderDetailV3`
- Cập nhật đơn hàng: Mutation `UpdateDirectPurchaseOrder`
- Tìm kiếm nhà cung cấp: Query `SearchSuppliers`
- Tạo sản phẩm mới: Mutation `CreateProducts`

## 5. Business Rules

- **BR-PO-EDT-001**: Đơn hàng ở trạng thái **"Hoàn thành"** hoặc **"Đã hủy"** không cho phép chỉnh sửa.
- **BR-PO-EDT-002**: Sau khi chỉnh sửa, đơn hàng vẫn phải có ít nhất một phụ tùng.
- **BR-PO-EDT-003**: Các ràng buộc validation giống form tạo: nhà cung cấp bắt buộc, trạng thái bắt buộc, mức ưu tiên bắt buộc, ngày giao dự kiến bắt buộc và >= ngày hiện tại, đơn giá >= 0, chiết khấu 0–100%.
- **BR-PO-EDT-004**: Khi thay đổi nhà cung cấp, thông tin liên hệ được cập nhật từ nhà cung cấp mới nhưng cho phép chỉnh sửa thủ công.

## 6. Edge Cases

- **EC-1**: Đơn hàng đã hoàn thành hoặc đã hủy — nút **"Chỉnh sửa"** không hiển thị trên màn hình Chi tiết.
- **EC-2**: Xóa hết phụ tùng rồi nhấn lưu — hệ thống báo lỗi, không cho lưu.
- **EC-3**: Thay đổi nhà cung cấp nhưng thông tin liên hệ cũ đã bị chỉnh tay — hệ thống ghi đè bằng thông tin nhà cung cấp mới.

## 7. Out of Scope

- Chi tiết đơn hàng → xem `FEAT-PO-DETAIL`.
- Tạo đơn hàng mới → xem `FEAT-PO-CREATE`.
- Danh sách đơn hàng → xem `FEAT-PO-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-orders-code-edit screen, UpdateDirectPurchaseOrder, form fields, validation messages, confirm-leave modal) |
