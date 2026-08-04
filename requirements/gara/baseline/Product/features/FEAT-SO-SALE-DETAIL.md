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

# FEAT-SO-SALE-DETAIL: Chi tiết phiếu bán lẻ phụ tùng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-SO-SALE-DETAIL` |
| Title | Chi tiết phiếu bán lẻ phụ tùng |
| Parent Epic | `EP-SERVICE-ORDER` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu bán lẻ bao gồm thông tin khách hàng, phụ tùng bán, trạng thái và thanh toán, **so that** tôi nắm được tình trạng đơn bán lẻ.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết phiếu bán lẻ
  - Tại: màn hình Danh sách phiếu dịch vụ.
  - Khi: chủ garage nhấn vào dòng phiếu bán lẻ (loại **"Bán phụ tùng"**) trong bảng.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết phiếu dịch vụ"** với tiêu đề gồm mã phiếu. Màn hình gồm các mục: **"Thông tin dịch vụ và thanh toán"**, **"Thông tin khách hàng"**, **"Phụ tùng sử dụng"**, **"Tổng chi phí"**, **"Thông tin khác"** (Người tạo, Tổ chức, Ghi chú, Tài liệu khác), **"Thông tin liên kết"** và **"Lịch sử thanh toán"**.

- [ ] **AC-2**: Hiển thị mục Thông tin dịch vụ và thanh toán
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Thông tin dịch vụ và thanh toán"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Loại phiếu"** (hiển thị **"Phiếu bán hàng"**), **"Thời gian dự kiến giao xe"**, **"Tổng tiền"**, **"Trạng thái thanh toán"** (hiển thị badge: **"Chưa thanh toán"**, **"Thanh toán 1 phần"**, hoặc **"Đã thanh toán"**).

- [ ] **AC-3**: Hiển thị trạng thái phiếu bán lẻ
  - Tại: màn hình Chi tiết phiếu bán lẻ.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: trạng thái phiếu hiển thị dưới dạng badge với các giá trị theo vòng đời phiếu bán lẻ:
    - **"Báo giá"** — trạng thái khởi tạo.
    - **"Đã xác nhận"** — đã xác nhận đơn hàng.
    - **"Đã xuất kho"** — đã hoàn thành giao hàng.
    - **"Đã tạo quyết toán"** — đã tạo quyết toán.
    - **"Đã huỷ"** — phiếu đã bị hủy.
    - **"Đã từ chối"** — phiếu bị từ chối.

- [ ] **AC-4**: Hiển thị mục Thông tin khách hàng
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Thông tin khách hàng"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Tên khách hàng"**, **"Số điện thoại"**, **"Loại khách hàng"** (hiển thị **"Cá nhân"** hoặc **"Tổ chức"**).

- [ ] **AC-5**: Hiển thị mục Phụ tùng sử dụng
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Phụ tùng sử dụng"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị bảng phụ tùng với các cột: **"Tên phụ tùng"**, **"Bên thanh toán"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Tổng"**.

- [ ] **AC-6**: Hiển thị mục Tổng chi phí
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Tổng chi phí"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị **"Tổng thành tiền"** — tổng giá trị tất cả dòng phụ tùng.

- [ ] **AC-7**: Hiển thị mục Thông tin khác
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Thông tin khác"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các thông tin chỉ đọc:
    - Nhóm **"Người tạo"**: **"Người tạo"** và **"Thời gian tạo phiếu"**.
    - Nhóm **"Tổ chức"** (chỉ hiển thị khi loại khách hàng là **"Tổ chức"**): **"Tên tổ chức"**, **"SĐT tổ chức"**, **"Mã số thuế"**.
    - **"Ghi chú"** và **"Tài liệu khác"**.

- [ ] **AC-8**: Hiển thị mục Thông tin liên kết
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Thông tin liên kết"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị các liên kết (nếu có): **"Phiếu lịch hẹn liên kết"**, **"Yêu cầu báo giá liên kết"**, **"Đơn hàng ngoài sàn liên kết"**, **"Phiếu quyết toán liên kết"**, **"Phiếu xuất kho liên kết"**.

- [ ] **AC-9**: Hiển thị mục Lịch sử thanh toán
  - Tại: màn hình Chi tiết phiếu bán lẻ, mục **"Lịch sử thanh toán"**.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hiển thị danh sách giao dịch thanh toán gồm: **"Ngày thanh toán"**, **"Phương thức"**, **"Số tiền"**, **"Đã thanh toán"** và **"Còn lại"**.
  - Khi: chưa có giao dịch thanh toán nào.
  - Thì: hiển thị thông báo: **"Chưa có giao dịch thanh toán."**.

### Nhóm B — Nút hành động theo trạng thái

- [ ] **AC-10**: Nút hành động khi phiếu ở trạng thái **"Báo giá"**
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các nút: **"Chỉnh sửa"**, **"Xác nhận"** (xác nhận đơn hàng), **"Hủy"** (hủy phiếu). Nút **"Gửi báo giá"** hiển thị nếu phiếu liên kết với ứng dụng tài xế. Mục **"Phụ tùng sử dụng"** hiển thị nút **"Đặt hàng"**.

- [ ] **AC-11**: Xác nhận đơn hàng
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"**.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận đơn hàng"** với nội dung **"Xác nhận đơn hàng?"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-12**: Xác nhận đơn hàng thành công
  - Tại: hộp thoại Xác nhận đơn hàng.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển từ **"Báo giá"** sang **"Đã xác nhận"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Xác nhận đơn hàng thành công."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-13**: Nút hành động khi phiếu ở trạng thái **"Đã xác nhận"**
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Đã xác nhận"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị nút **"Hoàn thành đơn hàng"** (chuyển sang **"Đã xuất kho"**) và nút **"Hủy"**. Nút **"Chỉnh sửa"** hiển thị. Mục **"Phụ tùng sử dụng"** hiển thị nút **"Đặt hàng"**.

- [ ] **AC-14**: Hoàn thành đơn hàng (xác nhận xuất kho)
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút **"Hoàn thành đơn hàng"**.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận hoàn thành"** với nội dung xác nhận. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-15**: Hoàn thành đơn hàng thành công
  - Tại: hộp thoại Xác nhận hoàn thành.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển từ **"Đã xác nhận"** sang **"Đã xuất kho"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Hoàn thành dịch vụ thành công."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-16**: Nút hành động khi phiếu ở trạng thái **"Đã xuất kho"**
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Đã xuất kho"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: nút **"Chỉnh sửa"**, **"Xác nhận"**, **"Hoàn thành đơn hàng"** và **"Hủy"** không hiển thị. Nút **"Đặt hàng"** trong mục **"Phụ tùng sử dụng"** không hiển thị. Phiếu ở trạng thái chỉ xem, chờ quyết toán.

- [ ] **AC-17**: Nút hành động khi phiếu ở trạng thái **"Đã huỷ"**
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Đã huỷ"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị thông báo **"Phiếu dịch vụ đã hủy"**. Tất cả nút hành động không hiển thị. Nút **"Đặt hàng"** trong mục **"Phụ tùng sử dụng"** không hiển thị. Phiếu ở trạng thái chỉ xem.

- [ ] **AC-18**: Nút hành động khi phiếu ở trạng thái **"Đã tạo quyết toán"**
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Đã tạo quyết toán"**.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: tất cả nút hành động chỉnh sửa/chuyển trạng thái không hiển thị. Nút **"Đặt hàng"** trong mục **"Phụ tùng sử dụng"** không hiển thị. Phiếu ở trạng thái chỉ xem.

- [ ] **AC-19**: Hủy phiếu bán lẻ
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận hủy phiếu"** gồm trường **"Ghi chú"** (placeholder: **"Nhập chi tiết lý do hủy"**, bắt buộc). Hộp thoại gồm nút **"Đóng"** và **"Xác nhận"**.
  - Khi: chủ garage bỏ trống trường **"Ghi chú"**.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập lý do hủy phiếu"**.

- [ ] **AC-20**: Hủy phiếu bán lẻ thành công
  - Tại: hộp thoại Xác nhận hủy phiếu.
  - Khi: chủ garage nhấn nút **"Xác nhận"** với lý do hủy hợp lệ và hệ thống xử lý thành công.
  - Thì: trạng thái phiếu chuyển sang **"Đã huỷ"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã hủy phiếu thành công."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-21**: Gửi báo giá
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"**, phiếu liên kết với ứng dụng tài xế.
  - Khi: chủ garage nhấn nút **"Gửi báo giá"**.
  - Thì: hệ thống hiển thị hộp thoại xác nhận gửi báo giá gồm thông tin: **"Tài xế"**, **"Tổng tiền"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-22**: Gửi báo giá thành công
  - Tại: hộp thoại xác nhận gửi báo giá.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Gửi báo giá thành công."**. Trạng thái **"Đã gửi báo giá"** được cập nhật trên mục thông tin dịch vụ.

- [ ] **AC-23**: Nút In phiếu
  - Tại: màn hình Chi tiết phiếu bán lẻ.
  - Khi: chủ garage xem chi tiết phiếu.
  - Thì: hệ thống hiển thị các tùy chọn in: **"In báo giá"**, **"In lệnh sửa chữa"**, **"In phiếu dịch vụ"**, **"Tạo hình ảnh phiếu"**.

- [ ] **AC-24**: Quay về danh sách phiếu dịch vụ
  - Tại: màn hình Chi tiết phiếu bán lẻ.
  - Khi: chủ garage nhấn nút quay lại.
  - Thì: hệ thống chuyển về màn hình Danh sách phiếu dịch vụ.

- [ ] **AC-25**: Nhấn nút chỉnh sửa
  - Tại: màn hình Chi tiết phiếu bán lẻ, phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa phiếu bán lẻ (xem `FEAT-SO-SALE-EDIT`).

### Nhóm C — Phân quyền

- [ ] **AC-26**: Phân quyền xem chi tiết và thao tác phiếu bán lẻ
  - Tại: màn hình Chi tiết phiếu bán lẻ.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết phiếu, xác nhận đơn hàng, hoàn thành đơn hàng, hủy phiếu, gửi báo giá và in phiếu. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-27**: Hành động chuyển trạng thái thất bại
  - Tại: hộp thoại xác nhận (xác nhận đơn hàng, hoàn thành đơn hàng, hủy phiếu).
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái phiếu không thay đổi. Hộp thoại đóng lại.

- [ ] **AC-28**: Gửi báo giá thất bại
  - Tại: hộp thoại xác nhận gửi báo giá.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Hộp thoại đóng lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-RETAIL.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu bán lẻ: Query `GetServiceOrderByCode`
- Xác nhận đơn hàng: Mutation `ConfirmServiceOrderV3`
- Hoàn thành đơn hàng: Mutation `CompleteServiceOrderV3`
- Hủy phiếu: Mutation `CancelServiceOrderV3`
- Gửi báo giá: Mutation `SendQuotationV3`

## 5. Business Rules

- **BR-SO-SALE-DTL-001**: Vòng đời trạng thái phiếu bán lẻ: **"Báo giá"** -> **"Đã xác nhận"** -> **"Đã xuất kho"** -> **"Đã tạo quyết toán"**. Phiếu có thể hủy từ **"Báo giá"** hoặc **"Đã xác nhận"** sang **"Đã huỷ"**. Phiếu có thể bị từ chối từ **"Báo giá"** sang **"Đã từ chối"**.
- **BR-SO-SALE-DTL-002**: Phiếu bán lẻ quyết toán từ trạng thái **"Đã xuất kho"** sang **"Đã tạo quyết toán"**; khác với phiếu dịch vụ xe quyết toán từ **"Hoàn thành"**.
- **BR-SO-SALE-DTL-003**: Nút **"Chỉnh sửa"** chỉ hiển thị khi phiếu ở trạng thái **"Báo giá"** hoặc **"Đã xác nhận"**.
- **BR-SO-SALE-DTL-004**: Nút **"Đặt hàng"** trong mục phụ tùng ẩn khi phiếu ở trạng thái **"Đã xuất kho"**, **"Đã huỷ"** hoặc **"Đã tạo quyết toán"**.
- **BR-SO-SALE-DTL-005**: Hủy phiếu bắt buộc nhập lý do hủy.
- **BR-SO-SALE-DTL-006**: Gửi báo giá bị chặn nếu đã gửi trước đó hoặc không có dòng phụ tùng nào.

## 6. Edge Cases

- **EC-1**: Phiếu bán lẻ ở trạng thái **"Đã xuất kho"** chưa có quyết toán — phiếu ở trạng thái chỉ xem, chờ quyết toán từ `EP-SETTLEMENT`.
- **EC-2**: Phiếu bán lẻ có giao dịch thanh toán nhưng chưa thanh toán đủ — trạng thái thanh toán hiển thị **"Thanh toán 1 phần"**, phiếu vẫn theo vòng đời bình thường.
- **EC-3**: Phiếu bán lẻ ở trạng thái **"Đã từ chối"** (bị từ chối qua ứng dụng tài xế) — phiếu ở trạng thái chỉ xem, tương tự **"Đã huỷ"**.

## 7. Out of Scope

- Tạo phiếu bán lẻ → xem `FEAT-SO-SALE-CREATE`.
- Chỉnh sửa phiếu bán lẻ → xem `FEAT-SO-SALE-EDIT`.
- Quyết toán phiếu bán lẻ → thuộc `EP-SETTLEMENT`.
- Ghi nhận thanh toán trên phiếu — thuộc `EP-SETTLEMENT`.
- Chi tiết phiếu dịch vụ xe (loại Dịch vụ xe) → xem `FEAT-SO-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web (service-order-sale-code detail screen, retail-sale-detail actions, cancel/confirm/complete modals) |
