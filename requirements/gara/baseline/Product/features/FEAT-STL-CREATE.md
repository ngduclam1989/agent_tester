---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SETTLEMENT"
boundary: "gf-accounting"
last_reviewed: "2026-05-27"
---

# FEAT-STL-CREATE: Tạo phiếu quyết toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STL-CREATE` |
| Title | Tạo phiếu quyết toán |
| Parent Epic | `EP-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu quyết toán cho phiếu dịch vụ đã hoàn thành, **so that** tôi có thể ghi nhận và theo dõi công nợ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, xem thông tin và xác nhận tạo

- [ ] **AC-1**: Mở màn hình tạo phiếu quyết toán
  - Tại: màn hình Phiếu dịch vụ hoặc điều hướng tạo phiếu quyết toán.
  - Khi: chủ garage truy cập chức năng tạo phiếu quyết toán.
  - Thì: hệ thống hiển thị màn hình **"Tạo phiếu quyết toán"**. Hệ thống tải snapshot thông tin phiếu dịch vụ từ hệ thống quản lý phiếu dịch vụ trước khi hiển thị form.

- [ ] **AC-2**: Không tìm thấy phiếu dịch vụ
  - Tại: màn hình Tạo phiếu quyết toán.
  - Khi: hệ thống không tìm thấy thông tin phiếu dịch vụ.
  - Thì: hệ thống hiển thị thông báo: **"Không tìm thấy thông tin phiếu dịch vụ"**.

- [ ] **AC-3**: Tạo phiếu quyết toán thành công
  - Tại: màn hình Tạo phiếu quyết toán, sau khi nhấn nút **"Xác nhận"**.
  - Khi: hệ thống tạo phiếu quyết toán thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo phiếu quyết toán thành công"**. Mã phiếu quyết toán được hệ thống tự sinh. Trạng thái phiếu quyết toán khởi tạo ở trạng thái nháp. Phiếu dịch vụ liên kết được chuyển sang trạng thái đã quyết toán.

- [ ] **AC-4**: Tạo cặp phiếu quyết toán khi có cả khách hàng và bảo hiểm
  - Tại: màn hình Tạo phiếu quyết toán.
  - Khi: phiếu dịch vụ có cả hạng mục do khách hàng chi trả và hạng mục do bảo hiểm chi trả.
  - Thì: hệ thống tự động tạo cặp hai phiếu quyết toán: một phiếu **"Khách hàng"** và một phiếu **"Bảo hiểm"**, liên kết với nhau qua mã phiếu quyết toán liên quan.

- [ ] **AC-5**: Tạo phiếu quyết toán đơn lẻ — chỉ khách hàng hoặc chỉ bảo hiểm
  - Tại: màn hình Tạo phiếu quyết toán.
  - Khi: phiếu dịch vụ chỉ có hạng mục do khách hàng chi trả hoặc chỉ có hạng mục do bảo hiểm chi trả.
  - Thì: hệ thống tạo một phiếu quyết toán duy nhất với bên thanh toán tương ứng (**"Khách hàng"** hoặc **"Bảo hiểm"**).

- [ ] **AC-6**: Điều kiện nút xác nhận
  - Tại: cuối màn hình Tạo phiếu quyết toán, nút **"Xác nhận"**.
  - Khi: phiếu dịch vụ đã được tải thành công và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Xác nhận"** ở trạng thái khả dụng (enabled).
  - Khi: phiếu dịch vụ chưa được tải hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Xác nhận"** ở trạng thái bị mờ (disabled).

- [ ] **AC-7**: Hủy bỏ tạo phiếu quyết toán
  - Tại: màn hình Tạo phiếu quyết toán, nút **"Hủy"**.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống đóng màn hình tạo phiếu quyết toán và quay về màn hình trước đó. Không tạo phiếu quyết toán.

### Nhóm B — Chi tiết từng mục form: Loại phiếu dịch vụ xe

- [ ] **AC-8**: Hiển thị form loại dịch vụ xe — mục Khách hàng chi trả
  - Tại: màn hình Tạo phiếu quyết toán, khi phiếu dịch vụ thuộc loại **"Dịch vụ xe"**.
  - Khi: phiếu dịch vụ có hạng mục do khách hàng chi trả.
  - Thì: hệ thống hiển thị mục **"Khách hàng chi trả"** gồm:
    - Bảng **"Dịch vụ thực hiện"** với các cột: **"Tên dịch vụ"**, **"Bên thanh toán"** (hiển thị **"Khách hàng"** hoặc **"Bảo hiểm"**), **"Người thực hiện"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Tổng"**.
    - Bảng **"Phụ tùng sử dụng"** với các cột: **"Tên phụ tùng"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thành tiền phụ tùng"**.
    - Trường **"Ghi chú"** dạng textarea. Placeholder: **"Nhập ghi chú..."**.

- [ ] **AC-9**: Hiển thị form loại dịch vụ xe — mục Bảo hiểm chi trả
  - Tại: màn hình Tạo phiếu quyết toán, khi phiếu dịch vụ thuộc loại **"Dịch vụ xe"**.
  - Khi: phiếu dịch vụ có hạng mục do bảo hiểm chi trả.
  - Thì: hệ thống hiển thị mục **"Bảo hiểm chi trả"** với cấu trúc tương tự mục Khách hàng chi trả (bảng dịch vụ, bảng phụ tùng, ghi chú). Ngoài ra hiển thị thông tin bảo hiểm gồm: **"Công ty bảo hiểm"**, **"Số hợp đồng bảo hiểm"**, **"Người giám định"**, **"Số điện thoại"**.

- [ ] **AC-10**: Nhập tổng tiền khách trả
  - Tại: màn hình Tạo phiếu quyết toán, mục tổng tiền.
  - Khi: chủ garage nhập tổng tiền khách trả.
  - Thì: hệ thống hiển thị trường **"Tổng tiền khách trả"** cho phép nhập số tiền. Trường này bắt buộc. Giá trị do chủ garage nhập, không được hệ thống tự tính.
  - Khi: chủ garage nhập số tiền không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số tiền quyết toán không hợp lệ"**.

- [ ] **AC-11**: Nhập tổng tiền bảo hiểm trả
  - Tại: màn hình Tạo phiếu quyết toán, mục tổng tiền (khi có bảo hiểm).
  - Khi: phiếu dịch vụ có hạng mục do bảo hiểm chi trả và chủ garage nhập tổng tiền bảo hiểm trả.
  - Thì: hệ thống hiển thị trường **"Tổng tiền bảo hiểm trả"** cho phép nhập số tiền. Trường này bắt buộc khi có bảo hiểm. Giá trị do chủ garage nhập, không được hệ thống tự tính.
  - Khi: chủ garage nhập số tiền không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số tiền quyết toán không hợp lệ"**.

### Nhóm C — Chi tiết từng mục form: Loại bán phụ tùng

- [ ] **AC-12**: Hiển thị form loại bán phụ tùng
  - Tại: màn hình Tạo phiếu quyết toán, khi phiếu dịch vụ thuộc loại **"Bán phụ tùng"**.
  - Khi: hệ thống tải xong snapshot phiếu dịch vụ.
  - Thì: hệ thống hiển thị mục **"Phụ tùng sử dụng"** với các cột: **"Tên phụ tùng"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thành tiền phụ tùng"**. Trường **"Ghi chú (Khách hàng)"** dạng textarea. Placeholder: **"Nhập ghi chú..."**.

- [ ] **AC-13**: Hiển thị tổng chi phí
  - Tại: màn hình Tạo phiếu quyết toán, mục tổng chi phí.
  - Khi: hệ thống tải xong snapshot phiếu dịch vụ.
  - Thì: hệ thống hiển thị các trường thông tin tổng: **"Tổng chi phí phiếu dịch vụ"**, **"Tổng chi phí"**. Giá trị được lấy từ snapshot phiếu dịch vụ (chỉ đọc).

### Nhóm D — Phân quyền

- [ ] **AC-14**: Phân quyền tạo phiếu quyết toán
  - Tại: màn hình Phiếu dịch vụ hoặc điều hướng tạo phiếu quyết toán.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền tạo phiếu quyết toán. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm E — Xử lý lỗi

- [ ] **AC-15**: Phiếu dịch vụ đã có phiếu quyết toán đang hoạt động
  - Tại: màn hình Tạo phiếu quyết toán, sau khi nhấn nút **"Xác nhận"**.
  - Khi: phiếu dịch vụ đã có phiếu quyết toán đang hoạt động cùng loại bên thanh toán.
  - Thì: hệ thống từ chối tạo và hiển thị thông báo lỗi cho biết đã tồn tại phiếu quyết toán đang hoạt động cho phiếu dịch vụ này.

- [ ] **AC-16**: Phiếu dịch vụ là bắt buộc
  - Tại: màn hình Tạo phiếu quyết toán.
  - Khi: chủ garage cố gắng tạo phiếu quyết toán mà không chọn phiếu dịch vụ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Phiếu dịch vụ là bắt buộc"**.

- [ ] **AC-17**: Tạo phiếu quyết toán thất bại do lỗi hệ thống
  - Tại: màn hình Tạo phiếu quyết toán, sau khi nhấn nút **"Xác nhận"**.
  - Khi: hệ thống tạo phiếu quyết toán thất bại do lỗi.
  - Thì: hệ thống hiển thị thông báo lỗi. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SETTLEMENT.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`)
- Tạo phiếu quyết toán: Mutation `CreateSettlement`

## 5. Business Rules

- **BR-STL-CRE-001**: Tạo phiếu quyết toán phải lấy snapshot phiếu dịch vụ trước khi ghi nhận — đảm bảo dữ liệu chi phí dịch vụ và phụ tùng khớp tại thời điểm quyết toán.
- **BR-STL-CRE-002**: Nếu phiếu dịch vụ có cả hạng mục khách hàng và bảo hiểm, hệ thống tạo cặp phiếu quyết toán **"Khách hàng"** và **"Bảo hiểm"**, liên kết hai chiều qua mã phiếu quyết toán liên quan.
- **BR-STL-CRE-003**: Nếu phiếu dịch vụ chỉ có hạng mục khách hàng thì tạo phiếu **"Khách hàng"**; chỉ có hạng mục bảo hiểm thì tạo phiếu **"Bảo hiểm"**. Cả hai trường hợp đều chuyển phiếu dịch vụ sang trạng thái đã quyết toán.
- **BR-STL-CRE-004**: Không cho phép tạo phiếu quyết toán đang hoạt động trùng mã phiếu dịch vụ và loại bên thanh toán. Phiếu đã hủy trước đó có thể được tái sử dụng mã khi tạo lại.
- **BR-STL-CRE-005**: Tổng tiền quyết toán (tổng tiền khách trả, tổng tiền bảo hiểm trả) nhận trực tiếp từ giá trị chủ garage nhập — hệ thống không tự tính server-side.
- **BR-STL-CRE-006**: Mã phiếu quyết toán được hệ thống tự sinh theo định dạng SET-yyyyMMdd-00001, không cho phép nhập thủ công.
- **BR-STL-CRE-007**: Phiếu quyết toán khởi tạo luôn ở trạng thái nháp. Không có trạng thái phê duyệt hay thanh toán trên phiếu quyết toán — vòng đời thanh toán thuộc phiếu dịch vụ.

## 6. Edge Cases

- **EC-1**: Phiếu dịch vụ có toàn bộ hạng mục thuộc khách hàng, không có bảo hiểm — hệ thống tạo một phiếu quyết toán duy nhất loại **"Khách hàng"**.
- **EC-2**: Phiếu dịch vụ có toàn bộ hạng mục thuộc bảo hiểm, không có khách hàng — hệ thống tạo một phiếu quyết toán duy nhất loại **"Bảo hiểm"**.
- **EC-3**: Phiếu dịch vụ đã từng có phiếu quyết toán bị hủy — hệ thống cho phép tạo lại phiếu quyết toán mới, có thể tái sử dụng mã cũ.
- **EC-4**: Chủ garage nhập tổng tiền quyết toán khác với tổng chi phí trên snapshot — hệ thống chấp nhận giá trị do chủ garage nhập (theo nghiệp vụ cho phép thương lượng giá).

## 7. Out of Scope

- Chi tiết phiếu quyết toán sau khi tạo → xem `FEAT-STL-DETAIL`.
- Danh sách phiếu quyết toán → xem `FEAT-STL-LIST`.
- Thanh toán phiếu dịch vụ → thuộc `FEAT-SO-DETAIL` (EP-SERVICE-ORDER).
- Quản lý trạng thái phiếu dịch vụ → thuộc `EP-SERVICE-ORDER`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-accounting + garage-web (settlement-voucher-create screen, CreateSettlement mutation, form dịch vụ xe/bán phụ tùng, cặp CUSTOMER/INSURANCE) |
