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

# FEAT-PO-CREATE: Tạo đơn hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PO-CREATE` |
| Title | Tạo đơn hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo đơn hàng mua phụ tùng mới với thông tin nhà cung cấp, danh sách phụ tùng và điều kiện giao hàng, **so that** garage có thể đặt mua phụ tùng phục vụ sửa chữa và kinh doanh.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo đơn hàng
  - Tại: màn hình Danh sách đơn hàng.
  - Khi: chủ garage nhấn nút **"Tạo đơn hàng mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo đơn hàng mới với form trống, gồm 2 mục chính: **"Thông tin đơn hàng"** và **"Danh sách phụ tùng cần mua"**.

- [ ] **AC-2**: Tạo đơn hàng thành công
  - Tại: form tạo đơn hàng, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo đơn hàng thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo đơn hàng mới thành công."**. Hệ thống chuyển về màn hình Danh sách đơn hàng.

- [ ] **AC-3**: Điều kiện nút tạo
  - Tại: cuối form tạo đơn hàng, nút tạo.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Nhà cung cấp, Trạng thái, Mức ưu tiên, Ngày giao dự kiến) và đã thêm ít nhất một phụ tùng với đơn giá, và hệ thống không đang gửi yêu cầu.
  - Thì: nút tạo ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc, chưa có phụ tùng, hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút tạo ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo đơn hàng
  - Tại: form tạo đơn hàng, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Tiếp tục tạo đơn hàng?"** và mô tả **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** với hai nút **"Hủy"** và **"Tiếp tục"**. Nếu chọn **"Tiếp tục"**, quay về màn hình Danh sách đơn hàng; nếu chọn **"Hủy"**, ở lại form.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin đơn hàng

- [ ] **AC-5**: Chọn nhà cung cấp
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Nhà cung cấp"**.
  - Khi: chủ garage chọn nhà cung cấp.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn nhà cung cấp"**. Trường này bắt buộc. Khi chọn nhà cung cấp, hệ thống tự động điền các trường: **"Số điện thoại liên hệ"**, **"Mã số thuế"**, **"Địa chỉ"**, **"Phương thức thanh toán"** từ thông tin nhà cung cấp.
  - Khi: chủ garage không chọn nhà cung cấp.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Nhà cung cấp là bắt buộc"**.

- [ ] **AC-6**: Chọn trạng thái đơn hàng
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Trạng thái"**.
  - Khi: chủ garage chọn trạng thái.
  - Thì: hệ thống hiển thị ô chọn. Trường này bắt buộc. Các giá trị: **"Chờ xác nhận"**, **"Chuẩn bị hàng"**, **"Đang giao hàng"**, **"Đã giao hàng"**, **"Hoàn thành"**, **"Đã hủy"**.
  - Khi: chủ garage không chọn trạng thái.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Trạng thái đơn hàng là bắt buộc"**.

- [ ] **AC-7**: Chọn mức ưu tiên
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Mức ưu tiên"**.
  - Khi: chủ garage chọn mức ưu tiên.
  - Thì: hệ thống hiển thị ô chọn. Trường này bắt buộc. Các giá trị: **"Bình thường"**, **"Gấp"**, **"Khẩn cấp"**.
  - Khi: chủ garage không chọn mức ưu tiên.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Mức ưu tiên là bắt buộc"**.

- [ ] **AC-8**: Chọn ngày giao dự kiến
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Ngày giao dự kiến"**.
  - Khi: chủ garage chọn ngày giao dự kiến.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này bắt buộc. Ngày giao dự kiến phải lớn hơn hoặc bằng ngày hiện tại.
  - Khi: chủ garage không chọn ngày giao dự kiến.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Ngày giao dự kiến là bắt buộc"**.
  - Khi: chủ garage chọn ngày nhỏ hơn ngày hiện tại.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Ngày giao dự kiến không được nhỏ hơn ngày hiện tại"**.

- [ ] **AC-9**: Chọn phiếu dịch vụ liên kết
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Phiếu dịch vụ liên kết"**.
  - Khi: chủ garage chọn phiếu dịch vụ liên kết.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn phiếu dịch vụ liên kết"**. Trường này không bắt buộc.

- [ ] **AC-10**: Nhập số điện thoại liên hệ
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Số điện thoại liên hệ"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số điện thoại"**. Trường này không bắt buộc. Giá trị được tự động điền khi chọn nhà cung cấp.

- [ ] **AC-11**: Nhập mã số thuế
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Mã số thuế"**.
  - Khi: chủ garage nhập mã số thuế.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mã số thuế"**. Trường này không bắt buộc.

- [ ] **AC-12**: Nhập địa chỉ
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Địa chỉ"**.
  - Khi: chủ garage nhập địa chỉ.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập địa chỉ"**. Trường này không bắt buộc.

- [ ] **AC-13**: Chọn phương thức thanh toán
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Phương thức thanh toán"**.
  - Khi: chủ garage chọn phương thức thanh toán.
  - Thì: hệ thống hiển thị ô chọn. Trường này không bắt buộc.

- [ ] **AC-14**: Nhập ghi chú
  - Tại: mục **"Thông tin đơn hàng"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

#### Mục: Danh sách phụ tùng cần mua

- [ ] **AC-15**: Thêm phụ tùng vào đơn hàng
  - Tại: mục **"Danh sách phụ tùng cần mua"**, nút **"Thêm phụ tùng"**.
  - Khi: chủ garage nhấn thêm phụ tùng.
  - Thì: hệ thống hiển thị ô tìm kiếm phụ tùng. Placeholder: **"Tìm kiếm phụ tùng"**. Chọn phụ tùng từ danh sách tồn kho hoặc tạo sản phẩm mới. Bảng phụ tùng gồm các cột: **"Tên phụ tùng"**, **"Mã chính hãng"**, **"Phân khúc"**, **"Nguồn gốc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thao tác"**.

- [ ] **AC-16**: Nhập thông tin phụ tùng trong dòng
  - Tại: mục **"Danh sách phụ tùng cần mua"**, một dòng phụ tùng đã thêm.
  - Khi: chủ garage nhập thông tin phụ tùng.
  - Thì: trường **"Đơn giá"** bắt buộc; lỗi: **"Vui lòng nhập đơn giá"**. Trường **"Số lượng"** phải lớn hơn 0. Trường **"Chiết khấu"** phải lớn hơn hoặc bằng 0 và không vượt quá 100%. **"Thành tiền"** được tự động tính dựa trên số lượng, đơn giá, chiết khấu và thuế.

- [ ] **AC-17**: Xóa dòng phụ tùng
  - Tại: mục **"Danh sách phụ tùng cần mua"**, cột **"Thao tác"**.
  - Khi: chủ garage nhấn biểu tượng xóa trên dòng phụ tùng.
  - Thì: hệ thống xóa dòng phụ tùng đó khỏi bảng.

- [ ] **AC-18**: Tạo sản phẩm mới từ form đơn hàng
  - Tại: mục **"Danh sách phụ tùng cần mua"**, khi tìm kiếm phụ tùng không có kết quả.
  - Khi: chủ garage nhấn **"Tạo sản phẩm mới"**.
  - Thì: hệ thống hiển thị modal **"Thêm sản phẩm mới"** với các trường: **"Tên sản phẩm"** (bắt buộc, placeholder: **"Nhập tên sản phẩm"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Đơn vị"** (bắt buộc, placeholder: **"Chọn đơn vị"**), **"Xuất xứ"** (placeholder: **"Nhập xuất xứ"**). Khi tạo thành công, toast: **"Tạo sản phẩm thành công."**.
  - Khi: tên sản phẩm để trống.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên sản phẩm không được để trống"**.
  - Khi: đơn vị để trống.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Đơn vị không được để trống"**.

- [ ] **AC-19**: Hiển thị tổng hợp đơn hàng
  - Tại: cuối form tạo đơn hàng, khu vực tổng hợp.
  - Khi: đã thêm ít nhất một phụ tùng.
  - Thì: hệ thống hiển thị thông tin tổng hợp: **"Tạm tính"**, **"Chiết khấu"**, **"Thuế"**, **"Tổng cộng"**. Kèm thông báo: **"Kiểm tra lại thông tin nhà cung cấp & danh sách phụ tùng trước khi đặt đơn"**.

### Nhóm C — Phân quyền

- [ ] **AC-20**: Phân quyền tạo đơn hàng
  - Tại: màn hình Danh sách đơn hàng.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo đơn hàng và có quyền tạo đơn hàng.

### Nhóm D — Xử lý lỗi

- [ ] **AC-21**: Đơn hàng không có phụ tùng
  - Tại: form tạo đơn hàng, sau khi nhấn nút tạo.
  - Khi: chưa thêm phụ tùng nào vào đơn hàng.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Đơn hàng phải có ít nhất một phụ tùng"**. Form giữ nguyên dữ liệu.

- [ ] **AC-22**: Phụ tùng chưa có đơn giá
  - Tại: form tạo đơn hàng, sau khi nhấn nút tạo.
  - Khi: có phụ tùng chưa nhập đơn giá.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Vui lòng nhập đơn giá"**. Form giữ nguyên dữ liệu.

- [ ] **AC-23**: Tạo đơn hàng thất bại do lỗi hệ thống
  - Tại: form tạo đơn hàng, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo đơn hàng thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Tạo đơn hàng mua ngoài: Mutation `CreateDirectPurchaseOrder`
- Tìm kiếm nhà cung cấp: Query `SearchSuppliers`
- Tạo sản phẩm mới: Mutation `CreateProducts`

## 5. Business Rules

- **BR-PO-CRE-001**: Đơn hàng phải có ít nhất một phụ tùng. Nếu không có phụ tùng, hệ thống từ chối tạo.
- **BR-PO-CRE-002**: Mỗi phụ tùng trong đơn hàng phải có đơn giá lớn hơn hoặc bằng 0.
- **BR-PO-CRE-003**: Chiết khấu phải lớn hơn hoặc bằng 0 và không được vượt quá 100%.
- **BR-PO-CRE-004**: Ngày giao dự kiến không được nhỏ hơn ngày hiện tại.
- **BR-PO-CRE-005**: Nhà cung cấp, trạng thái đơn hàng và mức ưu tiên là các trường bắt buộc.
- **BR-PO-CRE-006**: Khi chọn nhà cung cấp, hệ thống tự động điền thông tin liên hệ (số điện thoại, mã số thuế, địa chỉ, phương thức thanh toán) từ dữ liệu nhà cung cấp.
- **BR-PO-CRE-007**: Mức ưu tiên gồm 3 giá trị: **"Bình thường"**, **"Gấp"**, **"Khẩn cấp"**.

## 6. Edge Cases

- **EC-1**: Nhà cung cấp không có thông tin liên hệ — các trường tự động điền hiển thị trống, cho phép nhập thủ công.
- **EC-2**: Tìm kiếm phụ tùng không có kết quả — hiển thị **"Không tìm thấy kết quả phù hợp"** và cho phép tạo sản phẩm mới.
- **EC-3**: Sản phẩm mới đã tồn tại trong kho — hiển thị thông báo **"Sản phẩm đã tồn tại trong kho"** và cho phép tiếp tục thêm.

## 7. Out of Scope

- Chỉnh sửa đơn hàng sau khi tạo → xem `FEAT-PO-EDIT`.
- Chi tiết đơn hàng → xem `FEAT-PO-DETAIL`.
- Quản lý nhà cung cấp — thuộc chức năng danh mục riêng trong `EP-CATALOG`.
- Đơn hàng qua nền tảng — luồng tạo đơn hàng này chỉ áp dụng cho nguồn **"Mua ngoài"**.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-orders-create screen, CreateDirectPurchaseOrder mutation, form fields, validation messages) |
