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

# FEAT-SO-SALE-CREATE: Tạo phiếu bán lẻ phụ tùng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-SALE-CREATE` |
| Title | Tạo phiếu bán lẻ phụ tùng |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu bán lẻ phụ tùng cho khách hàng, **so that** tôi có thể ghi nhận giao dịch bán phụ tùng không gắn với dịch vụ sửa chữa.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo phiếu bán lẻ phụ tùng
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage nhấn nút tạo phiếu bán lẻ phụ tùng.
  - Thì: hệ thống chuyển sang màn hình **"Tạo phiếu dịch vụ"** với loại phiếu là **"Bán phụ tùng"**. Form gồm 3 mục: **"Thông tin dịch vụ"**, **"Thông tin khách hàng"** và **"Phụ tùng sử dụng"**.

- [ ] **AC-2**: Tạo phiếu bán lẻ thành công
  - Tại: form tạo phiếu bán lẻ, sau khi nhấn nút tạo mới.
  - Khi: hệ thống tạo phiếu thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo phiếu dịch vụ thành công."**. Mã phiếu được hệ thống tự sinh theo định dạng PDV-{yyyyMMdd}-{00000}. Trạng thái phiếu khởi tạo là **"Báo giá"**. Loại phiếu là **"Bán phụ tùng"**. Hệ thống không tự sinh lịch hẹn walk-in cho phiếu bán lẻ.

- [ ] **AC-3**: Điều kiện nút tạo mới
  - Tại: cuối form tạo phiếu bán lẻ, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (SĐT khách hàng, Tên khách hàng, Người tạo phiếu) và đã thêm ít nhất một dòng phụ tùng, và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc chưa có dòng phụ tùng hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo phiếu bán lẻ
  - Tại: form tạo phiếu bán lẻ, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form tạo phiếu và quay về màn hình Danh sách phiếu dịch vụ. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin dịch vụ

- [ ] **AC-5**: Chọn người tạo phiếu
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Người tạo phiếu"**.
  - Khi: chủ garage chọn người tạo phiếu.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn nhân viên tạo phiếu"**. Trường này bắt buộc. Danh sách nhân viên được lấy từ danh sách nhân viên của garage.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô chọn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nhân viên tạo phiếu."**.

- [ ] **AC-6**: Nhập ghi chú
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập yêu cầu khách hàng hoặc ghi chú nội bộ"**. Trường này không bắt buộc.

- [ ] **AC-7**: Tải lên tài liệu khác
  - Tại: mục **"Thông tin dịch vụ"**, trường **"Tài liệu khác"**.
  - Khi: chủ garage tải lên tài liệu.
  - Thì: hệ thống hiển thị khu vực tải lên tệp. Trường này không bắt buộc.

#### Mục: Thông tin khách hàng

- [ ] **AC-8**: Nhập SĐT khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"SĐT khách hàng"**.
  - Khi: chủ garage nhập số điện thoại khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc. Nếu số điện thoại khớp với khách hàng trong hệ thống, hệ thống tự động điền tên khách hàng.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng"**.

- [ ] **AC-9**: Nhập tên khách hàng
  - Tại: mục **"Thông tin khách hàng"**, trường **"Tên khách hàng"**.
  - Khi: chủ garage nhập tên khách hàng.
  - Thì: hệ thống hiển thị ô nhập có tìm kiếm. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên khách hàng."**.

- [ ] **AC-10**: Chọn loại khách hàng và trường thông tin tổ chức
  - Tại: mục **"Thông tin khách hàng"**, trường Loại khách hàng.
  - Khi: chủ garage chọn loại khách hàng.
  - Thì:
    - Nếu chọn **"Cá nhân"** (mặc định): form không hiển thị thêm trường tổ chức.
    - Nếu chọn **"Tổ chức"**: form hiển thị thêm **"Tên tổ chức"**, **"SĐT tổ chức"**, **"Mã số thuế"** (placeholder: **"Nhập mã số thuế"**).

#### Mục: Phụ tùng sử dụng

- [ ] **AC-11**: Thêm dòng phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**.
  - Khi: chủ garage thêm dòng phụ tùng vào bảng.
  - Thì: hệ thống hiển thị bảng hạng mục phụ tùng với các cột: **"Tên phụ tùng"**, **"Bên thanh toán"** (placeholder: **"Chọn bên thanh toán"**, giá trị: **"C - Khách hàng"**, **"I - Bảo hiểm"**), **"Phân khúc"** (placeholder: **"Chọn phân khúc"**), **"Người thực hiện"** (placeholder: **"Chọn người thực hiện"**), **"Đơn vị tính"** (placeholder: **"Chọn"**), **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"** (placeholder: **"0 %"**), **"Thuế"**, **"Thành tiền"**, **"Thao tác"**.

- [ ] **AC-12**: Xóa dòng phụ tùng
  - Tại: mục **"Phụ tùng sử dụng"**, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa (icon thùng rác) trên dòng phụ tùng.
  - Thì: hệ thống xóa dòng phụ tùng khỏi bảng. Tổng tiền được cập nhật lại.

- [ ] **AC-13**: Hiển thị tổng tiền
  - Tại: mục **"Phụ tùng sử dụng"**, dòng **"Tổng"**.
  - Khi: chủ garage thêm, sửa hoặc xóa dòng phụ tùng.
  - Thì: hệ thống tự động tính và hiển thị **"Tổng"** thành tiền của tất cả dòng phụ tùng.

### Nhóm C — Phân quyền

- [ ] **AC-14**: Phân quyền tạo phiếu bán lẻ
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo phiếu bán lẻ và có quyền tạo phiếu bán lẻ.

### Nhóm D — Xử lý lỗi

- [ ] **AC-15**: Validation form thất bại
  - Tại: form tạo phiếu bán lẻ, sau khi nhấn nút tạo mới.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-12) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-16**: Tạo phiếu bán lẻ thất bại do lỗi hệ thống
  - Tại: form tạo phiếu bán lẻ, sau khi nhấn nút tạo mới.
  - Khi: hệ thống tạo phiếu thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-RETAIL.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Tạo phiếu bán lẻ: Mutation `CreateServiceOrderV3` (loại phiếu = **"Bán phụ tùng"**)
- Kiểm tra tồn kho: Query `GetTotalStockBySkus`

## 5. Business Rules

- **BR-SO-SALE-CRE-001**: Phiếu bán lẻ phụ tùng luôn có loại phiếu là **"Bán phụ tùng"**, khởi tạo ở trạng thái **"Báo giá"**.
- **BR-SO-SALE-CRE-002**: Mã phiếu được hệ thống tự sinh theo định dạng PDV-{yyyyMMdd}-{00000}, không cho phép nhập thủ công.
- **BR-SO-SALE-CRE-003**: Phiếu bán lẻ không tự sinh lịch hẹn walk-in khi tạo, khác với phiếu dịch vụ xe.
- **BR-SO-SALE-CRE-004**: Phiếu bán lẻ yêu cầu ít nhất một dòng phụ tùng. Không có mục dịch vụ/công (khác với phiếu dịch vụ xe).
- **BR-SO-SALE-CRE-005**: Trường SĐT khách hàng, Tên khách hàng và Người tạo phiếu là bắt buộc.
- **BR-SO-SALE-CRE-006**: Số điện thoại phải đúng định dạng. Nếu khớp với khách hàng trong hệ thống, tự động điền tên khách hàng.

## 6. Edge Cases

- **EC-1**: Khách hàng chưa có trong hệ thống — chủ garage nhập trực tiếp SĐT và tên khách hàng mới; hệ thống cho phép tạo phiếu mà không yêu cầu khách hàng phải tồn tại trước.
- **EC-2**: Phụ tùng không có tồn kho — hệ thống vẫn cho phép thêm phụ tùng vào phiếu; tồn kho chỉ để tham khảo.
- **EC-3**: Chọn loại khách hàng **"Tổ chức"** nhưng không nhập thông tin tổ chức — hệ thống cho phép vì các trường tổ chức không bắt buộc.

## 7. Out of Scope

- Tạo phiếu dịch vụ xe (loại Dịch vụ xe) → xem `FEAT-SO-CREATE`.
- Chi tiết phiếu bán lẻ → xem `FEAT-SO-SALE-DETAIL`.
- Chỉnh sửa phiếu bán lẻ → xem `FEAT-SO-SALE-EDIT`.
- Quyết toán phiếu bán lẻ → thuộc `EP-SETTLEMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order-sale-create screen) |
