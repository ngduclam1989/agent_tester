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

# FEAT-QR-CREATE: Tạo yêu cầu báo giá

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-QR-CREATE` |
| Title | Tạo yêu cầu báo giá |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo yêu cầu báo giá phụ tùng mới với thông tin xe, danh sách phụ tùng cần báo giá và thông tin xuất hóa đơn, **so that** nhà cung cấp có thể báo giá phụ tùng phục vụ nhu cầu mua hàng của garage.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và gửi

- [ ] **AC-1**: Mở màn hình tạo yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá.
  - Khi: chủ garage nhấn nút **"Thêm mới yêu cầu báo giá"**.
  - Thì: hệ thống chuyển sang màn hình **"Tạo mới yêu cầu báo giá"** với form trống, gồm 3 mục: **"Thông tin xe"**, **"Thông tin phụ tùng cần báo giá"**, **"Thông tin xuất hóa đơn"**.

- [ ] **AC-2**: Tạo yêu cầu báo giá thành công
  - Tại: form tạo yêu cầu báo giá, sau khi nhấn nút **"Tạo yêu cầu báo giá"**.
  - Khi: hệ thống tạo yêu cầu báo giá thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"**. Chuyển sang màn hình **"Đã tạo yêu cầu báo giá"** với mô tả **"Yêu cầu báo giá đã được khởi tạo, bạn sẽ nhận được thông báo khi có báo giá mới từ nhà cung cấp."** và nút **"Xem chi tiết"**.

- [ ] **AC-3**: Hủy bỏ tạo yêu cầu báo giá
  - Tại: form tạo yêu cầu báo giá, nút **"Hủy bỏ"**.
  - Khi: chủ garage nhấn nút **"Hủy bỏ"**.
  - Thì: hệ thống quay về màn hình Danh sách yêu cầu báo giá. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin xe

- [ ] **AC-4**: Tải lên hình ảnh đăng kiểm (OCR)
  - Tại: mục **"Thông tin xe"**, khu vực tải lên hình ảnh.
  - Khi: chủ garage tải lên hình ảnh đăng kiểm.
  - Thì: hệ thống xử lý OCR và tự động điền thông tin xe. Mô tả: **"Tải lên hình ảnh đăng kiểm để tự động điền thông tin xe"**. Khi quét thành công: toast **"Quét thông tin thành công!"**. Khi quét lỗi: toast tiêu đề **"Lỗi"**, mô tả **"Đã xảy ra lỗi khi xử lý ảnh"**.

- [ ] **AC-5**: Chọn hãng xe
  - Tại: mục **"Thông tin xe"**, trường **"Hãng xe"**.
  - Khi: chủ garage chọn hãng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Trường này bắt buộc.
  - Khi: chủ garage không chọn hãng xe.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Hãng xe là trường bắt buộc"**.

- [ ] **AC-6**: Chọn dòng xe
  - Tại: mục **"Thông tin xe"**, trường **"Dòng xe"**.
  - Khi: chủ garage chọn dòng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Trường này bắt buộc. Danh sách dòng xe phụ thuộc vào hãng xe đã chọn.
  - Khi: chủ garage không chọn dòng xe.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Dòng xe là trường bắt buộc"**.

- [ ] **AC-7**: Nhập các trường thông tin xe khác
  - Tại: mục **"Thông tin xe"**, các trường: **"Năm sản xuất"**, **"Phiên bản xe"**, **"Số khung xe (Số VIN)"** (placeholder: **"Nhập số khung xe (Số VIN)"**), **"Biển số xe"** (placeholder: **"Nhập biển số xe"**), **"Công ty bảo hiểm"**, **"Ghi chú"** (placeholder: **"Nhập ghi chú"**), **"Hình ảnh xe"** (tối đa 3 ảnh).
  - Khi: chủ garage nhập thông tin.
  - Thì: hệ thống cho phép nhập. Tất cả các trường này không bắt buộc.
  - Khi: chủ garage nhập biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

#### Mục: Thông tin phụ tùng cần báo giá

- [ ] **AC-8**: Thêm phụ tùng vào yêu cầu báo giá
  - Tại: mục **"Thông tin phụ tùng cần báo giá"**, nút **"Thêm phụ tùng"**.
  - Khi: chủ garage nhấn thêm phụ tùng.
  - Thì: hệ thống hiển thị ô nhập tên phụ tùng. Placeholder: **"Nhập hoặc chọn phụ tùng có sẵn"**. Bảng phụ tùng gồm các cột: **"Tên phụ tùng"**, **"Đơn vị tính"**, **"Số lượng"**, **"Thao tác"**. Tên phụ tùng là bắt buộc. Lỗi: **"Vui lòng nhập Tên phụ tùng"**.

- [ ] **AC-9**: Tạo nhanh phụ tùng
  - Tại: mục **"Thông tin phụ tùng cần báo giá"**, tab **"Tạo nhanh phụ tùng"**.
  - Khi: chủ garage nhập danh sách phụ tùng dạng text.
  - Thì: hệ thống hiển thị ô nhập text dạng textarea. Placeholder: **"Nhập danh sách phụ tùng ngăn cách nhau bởi dấu , ; . hoặc xuống dòng"**. Hệ thống tự động tách thành các dòng phụ tùng riêng biệt.

- [ ] **AC-10**: Tải lên file phụ tùng (import)
  - Tại: mục **"Thông tin phụ tùng cần báo giá"**, nút tải lên file.
  - Khi: chủ garage tải lên file Excel.
  - Thì: hệ thống kiểm tra file: chỉ chấp nhận file Excel, tối đa 30MB. Hiển thị xem trước với bảng: **"Tên phụ tùng"**, **"Số lượng"**, **"Đơn vị"**, **"Trạng thái"**, **"Lỗi (Nếu có)"**. Tải mẫu file: **"Tải xuống File mẫu"**.
  - Khi: file không đúng định dạng.
  - Thì: toast **"File không hợp lệ"**, mô tả **"Định dạng file không hợp lệ. Vui lòng upload file Excel."**.
  - Khi: file quá 30MB.
  - Thì: toast mô tả **"Dung lượng file quá 30MB. Vui lòng chọn file nhỏ hơn."**.
  - Khi: tải lên thành công.
  - Thì: toast **"Tải lên thành công."**.

- [ ] **AC-11**: Không được tạo phụ tùng trùng
  - Tại: form tạo yêu cầu báo giá, khi thêm phụ tùng.
  - Khi: chủ garage thêm phụ tùng có tên trùng với phụ tùng đã có trong danh sách.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và mô tả **"Không được tạo phụ tùng giống nhau trong một yêu cầu báo giá"**.

#### Mục: Thông tin xuất hóa đơn

- [ ] **AC-12**: Đánh dấu yêu cầu xuất hóa đơn
  - Tại: mục **"Thông tin xuất hóa đơn"**, checkbox **"Yêu cầu xuất hóa đơn"**.
  - Khi: chủ garage đánh dấu yêu cầu xuất hóa đơn.
  - Thì: hệ thống hiển thị thêm các trường: **"Tên công ty"** (placeholder: **"Nhập tên công ty"**, bắt buộc khi đánh dấu, lỗi: **"Vui lòng nhập tên công ty."**), **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**, bắt buộc khi đánh dấu, lỗi: **"Vui lòng nhập mã số thuế."**), **"Email công ty"** (placeholder: **"Nhập email công ty"**, không bắt buộc, lỗi format: **"Email công ty không đúng định dạng."**), **"Địa chỉ"** (placeholder: **"Nhập địa chỉ"**, bắt buộc khi đánh dấu, lỗi: **"Vui lòng nhập địa chỉ."**). Kèm ghi chú: **"Bạn không thể tự chỉnh sửa thông tin yêu cầu xuất hóa đơn, vui lòng liên hệ CSKH để được hỗ trợ."**.
  - Khi: chủ garage không đánh dấu.
  - Thì: các trường hóa đơn không hiển thị.

### Nhóm C — Phân quyền

- [ ] **AC-13**: Phân quyền tạo yêu cầu báo giá
  - Tại: màn hình Danh sách yêu cầu báo giá.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo yêu cầu báo giá và có quyền tạo. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-14**: Tạo yêu cầu báo giá thất bại do lỗi hệ thống
  - Tại: form tạo yêu cầu báo giá, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Tạo yêu cầu báo giá: Mutation `CreateQuotationAskV3`
- Danh mục phụ tùng: Query `SearchCatalog`, Query `GetMdmParts`
- Thông tin hóa đơn tenant: Query `QuotationAskTenantInvoiceInfo`

## 5. Business Rules

- **BR-QR-CRE-001**: Hãng xe và dòng xe là trường bắt buộc khi tạo yêu cầu báo giá.
- **BR-QR-CRE-002**: Không được tạo phụ tùng trùng tên trong cùng một yêu cầu báo giá.
- **BR-QR-CRE-003**: Khi yêu cầu xuất hóa đơn, các trường tên công ty, mã số thuế và địa chỉ trở thành bắt buộc.
- **BR-QR-CRE-004**: File import phụ tùng chỉ chấp nhận định dạng Excel, tối đa 30MB.
- **BR-QR-CRE-005**: Biển số xe phải đúng định dạng (ví dụ: 30A12345).
- **BR-QR-CRE-006**: Tên công ty không vượt quá 255 ký tự, mã số thuế không vượt quá 50 ký tự, email không vượt quá 255 ký tự, địa chỉ không vượt quá 255 ký tự.
- **BR-QR-CRE-007**: Hình ảnh xe tối đa 3 ảnh.

## 6. Edge Cases

- **EC-1**: Chưa nhập phụ tùng — hệ thống yêu cầu ít nhất một phụ tùng trước khi tạo yêu cầu báo giá.
- **EC-2**: File import có dòng lỗi — hiển thị trạng thái lỗi và chi tiết lỗi cho từng dòng, cho phép tải lên file khác.
- **EC-3**: OCR không nhận diện được thông tin — cho phép nhập thủ công.
- **EC-4**: Thông tin hóa đơn tenant không tải được — hiển thị **"Không thể tải thông tin xuất hóa đơn từ Quản lý Tenant. Vui lòng thử lại sau."**.

## 7. Out of Scope

- Danh sách yêu cầu báo giá → xem `FEAT-QR-LIST`.
- Chi tiết yêu cầu báo giá → xem `FEAT-QR-DETAIL`.
- Tạo yêu cầu mua hàng từ báo giá → xem `FEAT-PR-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (quotation-requests-create screen, CreateQuotationAskV3, form fields, OCR upload, spare parts import, invoice info, validation messages) |
