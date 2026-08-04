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

# FEAT-PR-CREATE: Tạo yêu cầu mua hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PR-CREATE` |
| Title | Tạo yêu cầu mua hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo yêu cầu mua hàng (đặt hàng) từ yêu cầu báo giá đã có báo giá, **so that** garage có thể đặt hàng phụ tùng qua nền tảng với thông tin phụ tùng, nhà xe vận chuyển và phương thức thanh toán.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Xác nhận đặt hàng và thanh toán

- [ ] **AC-1**: Mở màn hình xác nhận đặt hàng
  - Tại: màn hình Chi tiết yêu cầu báo giá (xem `FEAT-QR-DETAIL`).
  - Khi: chủ garage nhấn nút **"Gửi yêu cầu đặt hàng"** sau khi chọn phụ tùng từ báo giá.
  - Thì: hệ thống hiển thị màn hình **"Xác nhận yêu cầu đặt hàng"** gồm các mục: **"Thông tin người đặt"**, **"Phụ tùng đã chọn"**, **"Thông tin nhà xe"**, **"Thanh toán"**.

- [ ] **AC-2**: Hiển thị mục Thông tin người đặt
  - Tại: màn hình Xác nhận yêu cầu đặt hàng, mục **"Thông tin người đặt"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị thông tin garage: tên, số điện thoại, địa chỉ. Thông tin được lấy tự động từ hồ sơ garage.

- [ ] **AC-3**: Hiển thị mục Phụ tùng đã chọn
  - Tại: màn hình Xác nhận yêu cầu đặt hàng, mục **"Phụ tùng đã chọn"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị bảng phụ tùng đã chọn từ báo giá với các thông tin: **"Nhà cung cấp"**, **"Tên phụ tùng"**, **"Thông tin phụ tùng"**, **"ĐVT"**, **"Số lượng"**, **"Giá hàng hóa"**, **"Giá dịch vụ"**.

- [ ] **AC-4**: Hiển thị mục Thông tin nhà xe
  - Tại: màn hình Xác nhận yêu cầu đặt hàng, mục **"Thông tin nhà xe"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị thông tin nhà xe liên kết: **"Nhà xe"**, **"Thời gian xe chạy"**. Chủ garage có thể thay đổi nhà xe liên kết.

- [ ] **AC-5**: Chọn phương thức thanh toán
  - Tại: màn hình Xác nhận yêu cầu đặt hàng, mục **"Thanh toán"**.
  - Khi: chủ garage chọn phương thức thanh toán.
  - Thì: hệ thống hiển thị các phương thức thanh toán khả dụng. Kèm **"Chi tiết thanh toán"** gồm: **"Tổng tiền hàng hóa"**, **"Tổng tiền thanh toán"** và ghi chú **"Chưa bao gồm chi phí vận chuyển giữa Garage và nhà xe"**.

- [ ] **AC-6**: Xác nhận đặt hàng
  - Tại: màn hình Xác nhận yêu cầu đặt hàng, nút **"Xác nhận đặt hàng"**.
  - Khi: chủ garage nhấn nút xác nhận.
  - Thì: hệ thống hiển thị thông báo **"Sau khi xác nhận đặt hàng, bạn sẽ không thể thay đổi phương thức thanh toán"**. Nếu xác nhận, hệ thống tạo yêu cầu đặt hàng. Khi thành công, hiển thị **"Đã gửi yêu cầu đặt hàng!"** với mô tả **"Bạn sẽ nhận được thông báo khi nhà cung cấp xác nhận."**.

- [ ] **AC-7**: Thanh toán đơn hàng
  - Tại: màn hình thanh toán, sau khi đặt hàng.
  - Khi: yêu cầu đặt hàng yêu cầu thanh toán trước.
  - Thì: hệ thống hiển thị màn hình **"Thanh toán"** với phương thức tương ứng (QR chuyển khoản, thẻ tín dụng). Hiển thị thông tin: **"Số tiền"**, **"Ngân hàng"**, **"Số tài khoản"**, **"Tên tài khoản"**. Khi thanh toán thành công: **"Thanh toán thành công"**.

### Nhóm B — Phân quyền

- [ ] **AC-8**: Phân quyền tạo yêu cầu đặt hàng
  - Tại: màn hình Chi tiết yêu cầu báo giá.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền gửi yêu cầu đặt hàng. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm C — Xử lý lỗi

- [ ] **AC-9**: Hủy yêu cầu đặt hàng
  - Tại: màn hình Chi tiết yêu cầu đặt hàng.
  - Khi: chủ garage nhấn nút **"Hủy yêu cầu đặt hàng"**.
  - Thì: hệ thống hiển thị modal **"Xác nhận hủy yêu cầu đặt hàng"** với mô tả **"Bạn có chắc chắn muốn hủy yêu cầu đặt hàng không? Hành động này không thể hoàn tác."** và hai nút **"Đóng"** / **"Xác nhận hủy"**.

- [ ] **AC-10**: Thanh toán thất bại
  - Tại: màn hình thanh toán.
  - Khi: giao dịch thanh toán thất bại hoặc hết thời gian.
  - Thì: hệ thống hiển thị **"Hết thời gian thanh toán"** với mô tả **"Giao dịch đã quá thời gian chờ thanh toán. Quý khách vui lòng tạo lại mã QR."** và nút **"Tạo lại QR"**.

- [ ] **AC-11**: Phương thức thanh toán không hỗ trợ
  - Tại: màn hình thanh toán.
  - Khi: phương thức thanh toán tạm thời không hỗ trợ.
  - Thì: hệ thống hiển thị thông báo **"Hình thức thanh toán này tạm thời không hỗ trợ. Vui lòng đặt lại đơn hàng và chọn hình thức thanh toán khác!"**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Đặt hàng: Mutation `PrPlaceOrder`
- Thanh toán QR: Mutation `PrCheckoutQR`
- Thanh toán thẻ: Mutation `PrCheckoutCC`
- Lấy phương thức thanh toán: Query `PrGetPaymentMethods`
- Hủy yêu cầu đặt hàng: Mutation `CancelPurchaseRequest`

## 5. Business Rules

- **BR-PR-CRE-001**: Yêu cầu đặt hàng được tạo từ yêu cầu báo giá đã có phụ tùng được báo giá bởi nhà cung cấp.
- **BR-PR-CRE-002**: Sau khi xác nhận đặt hàng, phương thức thanh toán không thể thay đổi.
- **BR-PR-CRE-003**: Tổng tiền thanh toán chưa bao gồm chi phí vận chuyển giữa garage và nhà xe.
- **BR-PR-CRE-004**: Hủy yêu cầu đặt hàng là hành động không thể hoàn tác.
- **BR-PR-CRE-005**: Yêu cầu đặt hàng khởi tạo ở trạng thái **"Chờ xác nhận"** — chờ nhà cung cấp xác nhận.

## 6. Edge Cases

- **EC-1**: Nhà cung cấp xác nhận thiếu hàng — trạng thái chuyển sang **"Thiếu hàng"**.
- **EC-2**: Thanh toán QR hết thời gian — cho phép tạo lại mã QR.
- **EC-3**: Lỗi tạo mã QR — hiển thị **"Lỗi tạo mã QR"** và cho phép thử lại.

## 7. Out of Scope

- Danh sách yêu cầu mua hàng → xem `FEAT-PR-LIST`.
- Chi tiết yêu cầu mua hàng → xem `FEAT-PR-DETAIL`.
- Tạo yêu cầu báo giá → xem `FEAT-QR-CREATE`.
- Chi tiết yêu cầu báo giá → xem `FEAT-QR-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-requests-create, purchase-requests-code screens, PrPlaceOrder, checkout flows, cancel request) |
