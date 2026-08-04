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

# FEAT-PR-DETAIL: Chi tiết yêu cầu mua hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PR-DETAIL` |
| Title | Chi tiết yêu cầu mua hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết yêu cầu mua hàng (đặt hàng qua nền tảng) bao gồm thông tin chung, người đặt, phụ tùng, nhà xe, thanh toán, **so that** tôi có thể theo dõi tình trạng yêu cầu đặt hàng và thực hiện thanh toán hoặc hủy.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết yêu cầu đặt hàng
  - Tại: màn hình Danh sách yêu cầu đặt hàng.
  - Khi: chủ garage nhấn vào dòng yêu cầu trong bảng.
  - Thì: hệ thống chuyển sang màn hình chi tiết yêu cầu đặt hàng gồm các mục: **"Thông tin chung"**, **"Thông tin người đặt"**, **"Phụ tùng đã chọn"**, **"Thông tin nhà xe"**, **"Thanh toán"**.

- [ ] **AC-2**: Hiển thị mục Thông tin chung
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, mục **"Thông tin chung"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Mã yêu cầu báo giá liên kết"**, **"Ngày tạo"**, **"Trạng thái thanh toán"**, **"Yêu cầu xuất hóa đơn"**. Nếu đã hủy, hiển thị thêm **"Lý do hủy"**.

- [ ] **AC-3**: Hiển thị mục Thông tin người đặt
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, mục **"Thông tin người đặt"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị các trường: **"Người đặt"**, **"Số điện thoại"**, **"Địa chỉ"**.

- [ ] **AC-4**: Hiển thị bảng Phụ tùng đã chọn
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, mục **"Phụ tùng đã chọn"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị bảng phụ tùng với các cột: **"STT"**, **"Nhà cung cấp"**, **"Tên phụ tùng"**, **"Thông tin phụ tùng"**, **"ĐVT"**, **"Số lượng"**, **"Giá hàng hóa"**, **"Giá dịch vụ"**, **"Giá"**.

- [ ] **AC-5**: Hiển thị mục Thông tin nhà xe
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, mục **"Thông tin nhà xe"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị: **"Nhà xe"**, **"Thời gian xe chạy"**.

- [ ] **AC-6**: Hiển thị mục Thanh toán
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, mục **"Thanh toán"**.
  - Khi: hệ thống tải xong dữ liệu.
  - Thì: hiển thị: **"Phương thức thanh toán"**, **"Chi tiết thanh toán"** (gồm **"Tổng tiền hàng hóa"**, **"Tổng tiền thanh toán"**).

### Nhóm B — Nút hành động

- [ ] **AC-7**: Nút thanh toán đơn hàng
  - Tại: màn hình Chi tiết yêu cầu đặt hàng, trạng thái **"Chờ thanh toán"**.
  - Khi: chủ garage nhấn nút **"Thanh toán đơn hàng"**.
  - Thì: hệ thống chuyển sang luồng thanh toán (xem `FEAT-PR-CREATE` AC-7).

- [ ] **AC-8**: Nút hủy yêu cầu đặt hàng
  - Tại: màn hình Chi tiết yêu cầu đặt hàng.
  - Khi: chủ garage nhấn nút **"Hủy yêu cầu đặt hàng"**.
  - Thì: hệ thống hiển thị modal **"Xác nhận hủy yêu cầu đặt hàng"** với mô tả **"Bạn có chắc chắn muốn hủy yêu cầu đặt hàng không? Hành động này không thể hoàn tác."** và hai nút **"Đóng"** / **"Xác nhận hủy"**. Khi xác nhận, trạng thái chuyển sang **"Đã hủy"**.

### Nhóm C — Phân quyền

- [ ] **AC-9**: Phân quyền xem chi tiết và thao tác yêu cầu đặt hàng
  - Tại: màn hình Chi tiết yêu cầu đặt hàng.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết, thanh toán và hủy yêu cầu đặt hàng. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-10**: Tải dữ liệu chi tiết thất bại
  - Tại: màn hình Chi tiết yêu cầu đặt hàng.
  - Khi: hệ thống không tải được dữ liệu (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Chi tiết yêu cầu đặt hàng: Query `GetPurchaseRequestDetailByCode`
- Hủy yêu cầu đặt hàng: Mutation `CancelPurchaseRequest`
- Thanh toán QR: Mutation `PrCheckoutQR`
- Thanh toán thẻ: Mutation `PrCheckoutCC`

## 5. Business Rules

- **BR-PR-DTL-001**: Thông tin yêu cầu đặt hàng trên màn hình chi tiết luôn được phạm vi theo garage hiện tại.
- **BR-PR-DTL-002**: Yêu cầu đặt hàng ở trạng thái **"Đã tạo đơn"** hoặc **"Đã hủy"** không cho phép hủy.
- **BR-PR-DTL-003**: Nút thanh toán chỉ hiển thị khi trạng thái là **"Chờ thanh toán"**.
- **BR-PR-DTL-004**: Mỗi yêu cầu đặt hàng liên kết với một mã yêu cầu báo giá.

## 6. Edge Cases

- **EC-1**: Yêu cầu đã hủy — hiển thị **"Lý do hủy"**, không cho phép thao tác thanh toán hay hủy.
- **EC-2**: Yêu cầu thiếu hàng — trạng thái **"Thiếu hàng"**, chờ nhà cung cấp cập nhật.
- **EC-3**: Phương thức thanh toán tạm không hỗ trợ — hiển thị thông báo yêu cầu đặt lại đơn.

## 7. Out of Scope

- Danh sách yêu cầu mua hàng → xem `FEAT-PR-LIST`.
- Tạo yêu cầu mua hàng → xem `FEAT-PR-CREATE`.
- Chi tiết yêu cầu báo giá → xem `FEAT-QR-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-requests-code detail screen, GetPurchaseRequestDetailByCode, CancelPurchaseRequest, checkout flows) |
