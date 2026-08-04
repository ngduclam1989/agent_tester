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

# FEAT-SO-SALE-EDIT: Chỉnh sửa phiếu bán lẻ phụ tùng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-SALE-EDIT` |
| Title | Chỉnh sửa phiếu bán lẻ phụ tùng |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa phiếu bán lẻ phụ tùng, **so that** tôi có thể điều chỉnh thông tin phiếu khi cần thiết.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa phiếu bán lẻ
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa phiếu dịch vụ"** với form tương tự form tạo phiếu bán lẻ, dữ liệu được điền sẵn từ phiếu hiện tại. Mã phiếu hiển thị ở trạng thái chỉ đọc. Form gồm 3 mục: **"Thông tin dịch vụ"**, **"Thông tin khách hàng"** và **"Phụ tùng sử dụng"**.

- [ ] **AC-2**: Lưu chỉnh sửa thành công
  - Tại: form chỉnh sửa phiếu bán lẻ, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật phiếu thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật phiếu dịch vụ thành công."**. Hệ thống chuyển về màn hình Chi tiết phiếu bán lẻ với dữ liệu đã cập nhật.

- [ ] **AC-3**: Lưu và gửi báo giá thành công
  - Tại: form chỉnh sửa phiếu bán lẻ, phiếu liên kết với ứng dụng tài xế.
  - Khi: chủ garage nhấn nút gửi báo giá và hệ thống xử lý thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Gửi báo giá thành công"**. Hệ thống chuyển về màn hình Chi tiết phiếu bán lẻ.

- [ ] **AC-4**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa phiếu bán lẻ, nút lưu.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (SĐT khách hàng, Tên khách hàng, Người tạo phiếu) và có ít nhất một dòng phụ tùng, và hệ thống không đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc chưa có dòng phụ tùng hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút lưu ở trạng thái bị mờ (disabled).

- [ ] **AC-5**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa phiếu bán lẻ, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết phiếu bán lẻ. Dữ liệu đã thay đổi trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin dịch vụ

- [ ] **AC-6**: Mã phiếu chỉ đọc
  - Tại: mục **"Thông tin dịch vụ"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: mã phiếu hiển thị ở trạng thái chỉ đọc, không cho phép chỉnh sửa.

- [ ] **AC-7**: Chọn người tạo phiếu
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Người tạo phiếu"**.
  - Khi: chủ garage chọn người tạo phiếu.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm, điền sẵn giá trị hiện tại. Placeholder: **"Chọn nhân viên tạo phiếu"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**.

- [ ] **AC-8**: Nhập ghi chú
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea, điền sẵn giá trị hiện tại. Placeholder: **"Nhập yêu cầu khách hàng hoặc ghi chú nội bộ"**. Trường này không bắt buộc.

- [ ] **AC-9**: Tải lên tài liệu khác
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Tài liệu khác"**.
  - Khi: chủ garage tải lên hoặc xóa tài liệu.
  - Thì: hệ thống hiển thị khu vực tải lên tệp, hiển thị các tài liệu đã tải trước đó. Trường này không bắt buộc.

#### Mục: Thông tin khách hàng

- [ ] **AC-10**: Nhập SĐT khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"SĐT khách hàng"**.
  - Khi: chủ garage chỉnh sửa số điện thoại khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm, điền sẵn giá trị hiện tại. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc. Nếu số điện thoại khớp với khách hàng trong hệ thống, hệ thống tự động điền tên khách hàng.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng"**.

- [ ] **AC-11**: Nhập tên khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"Tên khách hàng"**.
  - Khi: chủ garage chỉnh sửa tên khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm, điền sẵn giá trị hiện tại. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên khách hàng."**.

- [ ] **AC-12**: Chọn loại khách hàng và trường thông tin tổ chức
  - Tại: mục **"Thông tin khách hàng"**, trường Loại khách hàng.
  - Khi: chủ garage chọn loại khách hàng.
  - Thì:
    - Nếu chọn **"Cá nhân"** (mặc định): form không hiển thị thêm trường tổ chức.
    - Nếu chọn **"Tổ chức"**: form hiển thị thêm **"Tên tổ chức"**, **"SĐT tổ chức"**, **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**), điền sẵn giá trị hiện tại nếu có.

#### Mục: Phụ tùng sử dụng

- [ ] **AC-13**: Hiển thị bảng phụ tùng điền sẵn
  - Tại: mục **"Phụ tùng sử dụng"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hệ thống hiển thị bảng hạng mục phụ tùng với dữ liệu điền sẵn từ phiếu hiện tại. Các cột: **"Tên phụ tùng"**, **"Bên thanh toán"** (placeholder: **"Chọn bên thanh toán"**, giá trị: **"C - Khách hàng"**, **"I - Bảo hiểm"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Người thực hiện"** (placeholder: **"Chọn người thực hiện"**), **"Đơn vị tính"** (placeholder: **"Chọn"**), **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"** (placeholder: **"0 %"**), **"Thuế"**, **"Thành tiền"**, **"Thao tác"**.

- [ ] **AC-14**: Thêm dòng phụ tùng mới
  - Tại: mục **"Phụ tùng sử dụng"**.
  - Khi: chủ garage thêm dòng phụ tùng mới vào bảng.
  - Thì: hệ thống thêm dòng trống vào cuối bảng để chủ garage nhập thông tin phụ tùng.

- [ ] **AC-15**: Xóa dòng phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa (icon thùng rác) trên dòng phụ tùng.
  - Thì: hệ thống xóa dòng phụ tùng khỏi bảng. Tổng tiền được cập nhật lại.

- [ ] **AC-16**: Hiển thị tổng tiền
  - Tại: mục **"Phụ tùng sử dụng"**, dòng **"Tổng"**.
  - Khi: chủ garage thêm, sửa hoặc xóa dòng phụ tùng.
  - Thì: hệ thống tự động tính và hiển thị **"Tổng"** thành tiền của tất cả dòng phụ tùng.

### Nhóm C — Phân quyền

- [ ] **AC-17**: Phân quyền chỉnh sửa phiếu bán lẻ
  - Tại: màn hình Chi tiết phiếu bán lẻ.
  - Khi: chủ garage hoặc kế toán truy cập phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Chỉnh sửa"** và có quyền chỉnh sửa phiếu bán lẻ.

### Nhóm D — Xử lý lỗi

- [ ] **AC-18**: Validation form thất bại
  - Tại: form chỉnh sửa phiếu bán lẻ, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-7 đến AC-15) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-19**: Cập nhật phiếu thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa phiếu bán lẻ, sau khi nhấn nút lưu.
  - Khi: hệ thống cập nhật phiếu thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã chỉnh sửa để chủ garage có thể thử lại.

- [ ] **AC-20**: Phiếu đã bị thay đổi trạng thái trong lúc chỉnh sửa
  - Tại: form chỉnh sửa phiếu bán lẻ, sau khi nhấn nút lưu.
  - Khi: phiếu đã bị chuyển trạng thái bởi người dùng khác (ví dụ: hủy hoặc hoàn thành) trong lúc chủ garage đang chỉnh sửa.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-RETAIL.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Lấy dữ liệu phiếu: Query `GetServiceOrderByCode`
- Cập nhật phiếu: Mutation `UpdateServiceOrderV3`
- Kiểm tra tồn kho: Query `GetTotalStockBySkus`

## 5. Business Rules

- **BR-SO-SALE-EDT-001**: Chỉ cho phép chỉnh sửa phiếu bán lẻ ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**. Các trạng thái khác (**"Đã xuất kho"**, **"Đã tạo quyết toán"**, **"Đã huỷ"**, **"Đã từ chối"**) không cho phép chỉnh sửa.
- **BR-SO-SALE-EDT-002**: Mã phiếu không được phép thay đổi (chỉ đọc).
- **BR-SO-SALE-EDT-003**: Phiếu bán lẻ yêu cầu ít nhất một dòng phụ tùng sau khi chỉnh sửa.
- **BR-SO-SALE-EDT-004**: Trường SĐT khách hàng, Tên khách hàng và Người tạo phiếu vẫn bắt buộc khi chỉnh sửa.
- **BR-SO-SALE-EDT-005**: Cập nhật phiếu bán lẻ đã gửi báo giá sẽ tăng số lần gửi báo giá, cho phép gửi lại.

## 6. Edge Cases

- **EC-1**: Chỉnh sửa phiếu khi người dùng khác đồng thời hủy phiếu — hệ thống từ chối cập nhật và thông báo lỗi.
- **EC-2**: Xóa toàn bộ dòng phụ tùng trên form — nút lưu bị vô hiệu hóa vì yêu cầu ít nhất một dòng phụ tùng.
- **EC-3**: Thay đổi loại khách hàng từ **"Tổ chức"** sang **"Cá nhân"** — thông tin tổ chức (Tên tổ chức, SĐT tổ chức, Mã số thuế) bị ẩn đi; giá trị trước đó không hiển thị trên form nhưng hệ thống xử lý xóa khi lưu.

## 7. Out of Scope

- Tạo phiếu bán lẻ → xem `FEAT-SO-SALE-CREATE`.
- Chi tiết phiếu bán lẻ → xem `FEAT-SO-SALE-DETAIL`.
- Chỉnh sửa phiếu dịch vụ xe (loại Dịch vụ xe) → xem `FEAT-SO-EDIT`.
- Quyết toán phiếu bán lẻ → thuộc `EP-SETTLEMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order-sale-code-edit screen, retail-sale form components) |
