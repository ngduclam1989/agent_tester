---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SERVICE-ORDER"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-SO-EDIT: Chỉnh sửa phiếu dịch vụ sửa chữa

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-EDIT` |
| Title | Chỉnh sửa phiếu dịch vụ sửa chữa |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa phiếu dịch vụ sửa chữa bao gồm cập nhật thông tin khách hàng, xe, dịch vụ và phụ tùng, **so that** tôi có thể điều chỉnh nội dung phiếu khi cần thiết.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu dịch vụ, phiếu ở trạng thái cho phép chỉnh sửa.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa phiếu dịch vụ"** với form đã điền sẵn dữ liệu hiện tại của phiếu, gồm các mục: **"Thông tin chung"**, **"Thông tin khách hàng"**, **"Thông tin xe"**, **"Chi tiết dịch vụ thực hiện"**, **"Phụ tùng sử dụng"**, **"Tổng chi phí"**.

- [ ] **AC-2**: Hiển thị mã phiếu (chỉ đọc)
  - Tại: form chỉnh sửa phiếu dịch vụ.
  - Khi: chủ garage mở form chỉnh sửa.
  - Thì: mã phiếu dịch vụ hiển thị ở trạng thái chỉ đọc (read-only). Không cho phép chỉnh sửa.

- [ ] **AC-3**: Lưu chỉnh sửa thành công — phiếu chưa gửi báo giá
  - Tại: form chỉnh sửa phiếu dịch vụ, phiếu chưa gửi báo giá đến Driver+.
  - Khi: chủ garage nhấn nút lưu và hệ thống cập nhật thành công.
  - Thì: hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật phiếu dịch vụ thành công."**. Hệ thống chuyển về màn hình Chi tiết phiếu dịch vụ.

- [ ] **AC-4**: Lưu chỉnh sửa — phiếu đã gửi báo giá trước đó
  - Tại: form chỉnh sửa phiếu dịch vụ, phiếu đã gửi báo giá đến Driver+ trước đó.
  - Khi: chủ garage nhấn nút lưu.
  - Thì: hệ thống hiển thị hộp thoại xác nhận với nội dung: **"Bạn đã gửi báo giá trước đó. Mọi chỉnh sửa sẽ tạo báo giá mới và gửi lại cho khách hàng xác nhận. Bạn có chắc chắn muốn lưu?"** kèm nút **"Hủy"** và **"Lưu chỉnh sửa"**. Nếu chủ garage chọn **"Gửi lại báo giá cho khách hàng"**, hệ thống lưu và gửi lại báo giá.

- [ ] **AC-5**: Lưu chỉnh sửa thành công — gửi lại báo giá
  - Tại: hộp thoại xác nhận gửi lại báo giá.
  - Khi: chủ garage xác nhận và hệ thống xử lý thành công.
  - Thì: hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Gửi báo giá thành công"**. Hệ thống chuyển về màn hình Chi tiết phiếu dịch vụ.

- [ ] **AC-6**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa phiếu dịch vụ.
  - Khi: chủ garage nhấn nút **"Hủy bỏ"**.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết phiếu dịch vụ. Dữ liệu đã thay đổi trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin chung

- [ ] **AC-7**: Chỉnh sửa loại dịch vụ
  - Tại: mục **"Thông tin chung"**, trường **"Loại dịch vụ"**.
  - Khi: chủ garage chỉnh sửa loại dịch vụ.
  - Thì: hệ thống hiển thị các tùy chọn: **"Sửa chữa"**, **"Bảo dưỡng"**, **"Car Spa"**. Giá trị hiện tại được chọn sẵn. Trường này không bắt buộc.

- [ ] **AC-8**: Chỉnh sửa nhân viên tạo phiếu
  - Tại: mục **"Thông tin chung"**, trường **"Nhân viên tạo phiếu"**.
  - Khi: chủ garage chỉnh sửa nhân viên tạo phiếu.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn nhân viên tạo phiếu"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**.

- [ ] **AC-9**: Chỉnh sửa thời gian dự kiến giao xe
  - Tại: mục **"Thông tin chung"**, trường **"Thời gian dự kiến giao xe"**.
  - Khi: chủ garage chỉnh sửa thời gian dự kiến giao xe.
  - Thì: hệ thống hiển thị bộ chọn ngày giờ với giá trị hiện tại. Placeholder: **"Nhập thời gian dự kiến giao xe"**. Trường này không bắt buộc.

#### Mục: Thông tin khách hàng

- [ ] **AC-10**: Chỉnh sửa số điện thoại khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"SĐT khách hàng"**.
  - Khi: chủ garage chỉnh sửa số điện thoại khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm (autocomplete) với giá trị hiện tại. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng"**.

- [ ] **AC-11**: Chỉnh sửa tên khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"Tên khách hàng"**.
  - Khi: chủ garage chỉnh sửa tên khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm (autocomplete) với giá trị hiện tại. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên khách hàng."**.

- [ ] **AC-12**: Chỉnh sửa loại khách hàng và trường thông tin tổ chức
  - Tại: mục **"Thông tin khách hàng"**, trường loại khách hàng.
  - Khi: chủ garage chọn loại khách hàng.
  - Thì:
    - Nếu chọn **"Cá nhân"** (mặc định): form không hiển thị thêm trường tổ chức.
    - Nếu chọn **"Tổ chức"**: form hiển thị thêm **"Tên tổ chức"**, **"SĐT tổ chức"**, **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**).

#### Mục: Thông tin xe

- [ ] **AC-13**: Chỉnh sửa biển số xe
  - Tại: mục **"Thông tin xe"**, trường **"Biển số xe"**.
  - Khi: chủ garage chỉnh sửa biển số xe.
  - Thì: hệ thống hiển thị ô nhập autocomplete với giá trị hiện tại. Trường này bắt buộc. Hệ thống tự động chuyển thành chữ in hoa.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập biển số xe."**.
  - Khi: chủ garage nhập biển số không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

- [ ] **AC-14**: Chỉnh sửa hãng xe
  - Tại: mục **"Thông tin xe"**, trường **"Hãng xe"**.
  - Khi: chủ garage chỉnh sửa hãng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Trường này bắt buộc. Khi thay đổi hãng xe, trường **"Dòng xe"** và **"Phiên bản xe"** được reset.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn hãng xe."**.

- [ ] **AC-15**: Chỉnh sửa dòng xe
  - Tại: mục **"Thông tin xe"**, trường **"Dòng xe"**.
  - Khi: chủ garage chỉnh sửa dòng xe.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Trường này bắt buộc. Danh sách dòng xe phụ thuộc vào hãng xe đã chọn.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn dòng xe."**.

- [ ] **AC-16**: Chỉnh sửa năm sản xuất và phiên bản xe
  - Tại: mục **"Thông tin xe"**, trường **"Năm sản xuất"** và **"Phiên bản xe"**.
  - Khi: chủ garage chỉnh sửa năm sản xuất hoặc phiên bản xe.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại. Trường này không bắt buộc. Danh sách phiên bản xe phụ thuộc vào dòng xe đã chọn.

- [ ] **AC-17**: Chỉnh sửa thông tin xe bổ sung
  - Tại: mục **"Thông tin xe"**, các trường **"Số khung xe (Số VIN)"**, **"Số km đã chạy"**, **"Mức nhiên liệu"**, **"Màu xe"**.
  - Khi: chủ garage chỉnh sửa các trường bổ sung.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Các trường này không bắt buộc. Trường **"Số khung xe (Số VIN)"** có placeholder: **"Nhập số khung xe (Số VIN)"**.
  - Khi: chủ garage nhập số VIN không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số VIN không hợp lệ"**.

- [ ] **AC-18**: Chỉnh sửa bên thanh toán phiếu
  - Tại: mục **"Thông tin xe"**, trường bên thanh toán.
  - Khi: chủ garage chọn bên thanh toán.
  - Thì: hệ thống hiển thị các tùy chọn: **"C - Khách hàng"**, **"I - Bảo hiểm"**. Giá trị hiện tại được chọn sẵn.

- [ ] **AC-19**: Chỉnh sửa thông tin bảo hiểm
  - Tại: mục **"Thông tin xe"**, trường **"Bảo hiểm"**.
  - Khi: chủ garage chọn **"Có"** bảo hiểm.
  - Thì: form hiển thị thêm các trường: **"Công ty bảo hiểm"** (bắt buộc khi có bảo hiểm), **"Số hợp đồng bảo hiểm"**, **"Ngày hết hạn"**, **"Số điện thoại liên hệ bảo hiểm"** (placeholder: **"Nhập số điện thoại"**), **"Người giám định"**, **"Hồ sơ bảo lãnh"**.
  - Khi: chủ garage chọn **"Không"** bảo hiểm.
  - Thì: các trường bảo hiểm bị ẩn.
  - Khi: chủ garage chọn **"Có"** bảo hiểm nhưng bỏ trống **"Công ty bảo hiểm"**.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên công ty bảo hiểm."**.

- [ ] **AC-20**: Tải ảnh đăng kiểm
  - Tại: mục **"Thông tin xe"**.
  - Khi: chủ garage xem form chỉnh sửa.
  - Thì: hệ thống hiển thị tùy chọn **"Tải ảnh đăng kiểm để tự động điền thông tin xe"**, **"Hình ảnh xe"**, và **"Tài liệu khác"**.

#### Mục: Chi tiết dịch vụ thực hiện

- [ ] **AC-21**: Chỉnh sửa danh sách dịch vụ
  - Tại: mục **"Chi tiết dịch vụ thực hiện"**.
  - Khi: chủ garage chỉnh sửa danh sách dịch vụ.
  - Thì: hệ thống hiển thị bảng dịch vụ đã điền sẵn với các cột: **"Tên dịch vụ"**, **"Bên thanh toán"** (placeholder: **"Chọn bên thanh toán"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Người thực hiện"** (placeholder: **"Chọn người thực hiện"**), **"Đơn vị tính"** (placeholder: **"Chọn"**), **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"** (placeholder: **"0 %"**), **"Thuế"**, **"Thành tiền"**. Cột **"Thao tác"** chứa nút xóa dòng. Cho phép thêm dòng dịch vụ mới và xóa dòng hiện có.

#### Mục: Phụ tùng sử dụng

- [ ] **AC-22**: Chỉnh sửa danh sách phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**.
  - Khi: chủ garage chỉnh sửa danh sách phụ tùng.
  - Thì: hệ thống hiển thị bảng phụ tùng đã điền sẵn với các cột: **"Tên phụ tùng"**, **"Bên thanh toán"** (placeholder: **"Chọn bên thanh toán"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Người thực hiện"** (placeholder: **"Chọn người thực hiện"**), **"Đơn vị tính"** (placeholder: **"Chọn"**), **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"** (placeholder: **"0 %"**), **"Thuế"**, **"Thành tiền"**. Cột **"Thao tác"** chứa nút xóa dòng. Cho phép thêm dòng phụ tùng mới và xóa dòng hiện có.

#### Mục: Mô tả và ghi chú

- [ ] **AC-23**: Chỉnh sửa mô tả tình trạng xe
  - Tại: form chỉnh sửa, trường **"Mô tả tình trạng xe"**.
  - Khi: chủ garage chỉnh sửa mô tả tình trạng xe.
  - Thì: hệ thống hiển thị ô nhập dạng textarea với giá trị hiện tại. Placeholder: **"Nhập mô tả tình trạng xe"**. Trường này không bắt buộc.

- [ ] **AC-24**: Chỉnh sửa ghi chú
  - Tại: form chỉnh sửa, trường **"Ghi chú"**.
  - Khi: chủ garage chỉnh sửa ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea với giá trị hiện tại. Placeholder: **"Nhập yêu cầu khách hàng hoặc ghi chú nội bộ"**. Trường này không bắt buộc.

#### Mục: Tổng chi phí

- [ ] **AC-25**: Hiển thị tổng chi phí (tự động tính)
  - Tại: mục **"Tổng chi phí"**.
  - Khi: chủ garage thay đổi dịch vụ hoặc phụ tùng.
  - Thì: hệ thống tự động tính và hiển thị: **"Tổng thành tiền dịch vụ"**, **"Tổng thành tiền phụ tùng"**, **"Tổng thành tiền"** kèm mô tả **"(Dịch vụ + Phụ tùng)"**. Các trường này chỉ đọc.

### Nhóm A2 — Điều kiện nút lưu

- [ ] **AC-26**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa phiếu dịch vụ.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (**"SĐT khách hàng"**, **"Tên khách hàng"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Nhân viên tạo phiếu"**) và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

### Nhóm C — Phân quyền

- [ ] **AC-27**: Phân quyền chỉnh sửa phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Chỉnh sửa"** (khi phiếu ở trạng thái cho phép) và có quyền chỉnh sửa phiếu dịch vụ. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-28**: Validation form thất bại
  - Tại: form chỉnh sửa phiếu dịch vụ, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-8 đến AC-19) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-29**: Chỉnh sửa phiếu thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa phiếu dịch vụ, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật phiếu thất bại do lỗi.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã chỉnh sửa để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SERVICE-ORDER.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Lấy chi tiết phiếu: Query `GetServiceOrderByCode`
- Cập nhật phiếu: Mutation `UpdateServiceOrderV3`
- Kiểm tra tồn kho phụ tùng: Query `GetTotalStockBySkus`

## 5. Business Rules

- **BR-SO-EDT-001**: Mã phiếu dịch vụ không cho phép chỉnh sửa — hiển thị chỉ đọc.
- **BR-SO-EDT-002**: Chỉnh sửa phiếu chỉ được phép khi phiếu ở trạng thái **"Báo giá"**, **"Đang thực hiện"**, **"Đã xác nhận"**, hoặc **"Đã từ chối"**. Phiếu ở trạng thái **"Hoàn thành"**, **"Đã huỷ"**, hoặc **"Đã tạo quyết toán"** không cho phép chỉnh sửa.
- **BR-SO-EDT-003**: Khi chỉnh sửa phiếu đã gửi báo giá trước đó, hệ thống tự động tạo báo giá mới và gửi lại cho khách hàng xác nhận (tăng số lần gửi báo giá).
- **BR-SO-EDT-004**: Biển số xe tự động chuyển thành chữ in hoa, chỉ chấp nhận ký tự chữ cái và số.
- **BR-SO-EDT-005**: Khi thay đổi hãng xe, trường dòng xe và phiên bản xe được reset do phụ thuộc danh mục.
- **BR-SO-EDT-006**: Trường **"Công ty bảo hiểm"** bắt buộc khi chọn có bảo hiểm. Nếu không có bảo hiểm, các trường bảo hiểm không hiển thị.
- **BR-SO-EDT-007**: Dòng dịch vụ và phụ tùng bị xóa trên form sử dụng cơ chế xóa mềm — chỉ được áp dụng khi nhấn nút lưu.

## 6. Edge Cases

- **EC-1**: Chỉnh sửa phiếu có phụ tùng đã liên kết với phiếu xuất kho — việc xóa phụ tùng trên form chỉnh sửa có thể ảnh hưởng đến phiếu xuất kho liên kết.
- **EC-2**: Thay đổi hãng xe trong khi dòng xe và phiên bản đã được chọn — hệ thống reset dòng xe và phiên bản khi hãng xe thay đổi.
- **EC-3**: Chỉnh sửa phiếu đang ở trạng thái **"Đã từ chối"** — hệ thống vẫn cho phép chỉnh sửa nội dung để gửi lại báo giá cho khách hàng.
- **EC-4**: Chỉnh sửa phiếu có phụ tùng từ yêu cầu báo giá — các phụ tùng có nguồn từ yêu cầu báo giá vẫn giữ liên kết.

## 7. Out of Scope

- Tạo phiếu dịch vụ mới → xem `FEAT-SO-CREATE`.
- Chi tiết phiếu dịch vụ → xem `FEAT-SO-DETAIL`.
- Danh sách phiếu dịch vụ → xem `FEAT-SO-LIST`.
- Chỉnh sửa phiếu bán lẻ phụ tùng — thuộc phạm vi phiếu bán lẻ (loại phiếu khác).
- Quyết toán phiếu dịch vụ → xem `EP-SETTLEMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order-code-edit screen, form sections, validation rules, resend-quotation confirmation dialog) |
