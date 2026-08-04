---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-PROCUREMENT"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-PO-DETAIL: Chi tiết đơn hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PO-DETAIL` |
| Title | Chi tiết đơn hàng |
| Parent Epic | `EP-PROCUREMENT` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết đơn hàng mua phụ tùng bao gồm thông tin chung, nhà cung cấp, danh sách phụ tùng, tài liệu đính kèm và lịch sử, **so that** tôi có thể theo dõi toàn diện tình trạng đơn hàng và thực hiện các thao tác quản lý.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết đơn hàng
  - Tại: màn hình Danh sách đơn hàng.
  - Khi: chủ garage nhấn vào dòng đơn hàng trong bảng.
  - Thì: hệ thống chuyển sang màn hình chi tiết đơn hàng. Màn hình hiển thị **"Mã đơn mua hàng"**, trạng thái đơn, và các mục thông tin.

- [ ] **AC-2**: Hiển thị mục Thông tin chung
  - Tại: màn hình Chi tiết đơn hàng, mục **"Thông tin chung"**.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Nguồn đơn"**, **"Mức ưu tiên"**, **"Ngày giao dự kiến"**, **"Phiếu dịch vụ liên kết"**, **"Ghi chú"**.

- [ ] **AC-3**: Hiển thị mục Nhà cung cấp
  - Tại: màn hình Chi tiết đơn hàng, mục **"Nhà cung cấp"**.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Tên nhà cung cấp"**, **"Số điện thoại"**, **"Mã số thuế"**, **"Địa chỉ"**, **"Phương thức thanh toán"**.

- [ ] **AC-4**: Hiển thị bảng phụ tùng đã chọn
  - Tại: màn hình Chi tiết đơn hàng, mục danh sách phụ tùng.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị bảng **"Phụ tùng đã chọn"** với các cột: **"Tên phụ tùng"**, **"Mã chính hãng"**, **"Phân khúc"**, **"Nguồn gốc"**, **"Đơn vị tính"**, **"Số lượng"**, **"Đơn giá"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**.

- [ ] **AC-5**: Hiển thị tổng hợp đơn hàng
  - Tại: màn hình Chi tiết đơn hàng, cuối bảng phụ tùng.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị thông tin tổng hợp: **"Tạm tính"**, **"Chiết khấu"**, **"Thuế"**, **"Tổng cộng"**.

- [ ] **AC-6**: Hiển thị mục Tài liệu đính kèm
  - Tại: màn hình Chi tiết đơn hàng, mục **"Tài liệu đính kèm"**.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị hai phân mục: **"Hóa đơn"** và **"Tài liệu khác"**. Cho phép xem và cập nhật tài liệu đính kèm.

- [ ] **AC-7**: Hiển thị mục Phiếu nhập kho liên kết
  - Tại: màn hình Chi tiết đơn hàng, mục **"Phiếu nhập kho liên kết"**.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị danh sách phiếu nhập kho liên kết (nếu có) với các trường: **"Mã phiếu nhập kho"**, **"Trạng thái"**, **"Ngày tạo phiếu"**, **"Cập nhật mới nhất"**.

- [ ] **AC-8**: Hiển thị mục Lịch sử ghi nhận
  - Tại: màn hình Chi tiết đơn hàng, mục **"Lịch sử ghi nhận"**.
  - Khi: hệ thống tải xong dữ liệu đơn hàng.
  - Thì: hiển thị danh sách lịch sử thay đổi trạng thái của đơn hàng. Mỗi mục hiển thị thời gian và nội dung thay đổi. Nếu đơn bị hủy, hiển thị **"Lý do hủy:"**. Nếu đơn bị hoàn hàng, hiển thị **"Lý do hoàn hàng:"**.

### Nhóm B — Nút hành động chuyển trạng thái

- [ ] **AC-9**: Chuyển trạng thái đơn hàng
  - Tại: màn hình Chi tiết đơn hàng, khu vực **"Chuyển trạng thái"**.
  - Khi: chủ garage chọn trạng thái mới từ ô chọn (placeholder: **"Chọn trạng thái"**) và nhấn **"Áp dụng"**.
  - Thì: hệ thống chuyển đơn hàng sang trạng thái mới. Toast hiển thị theo trạng thái:
    - Chuyển sang **"Chuẩn bị hàng"**: toast **"Đơn hàng đã được chuyển sang trạng thái chuẩn bị hàng."**
    - Chuyển sang **"Đang giao hàng"**: toast **"Đơn hàng đã được chuyển sang trạng thái đang giao hàng."** Hệ thống tự động tạo một phiếu nhập kho nguồn **"Nền tảng"** ở trạng thái **"Chờ duyệt"**, liên kết với đơn hàng này. Phiếu nhập kho hiển thị tại mục **"Phiếu nhập kho liên kết"**.

- [ ] **AC-10**: Hoàn thành đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage nhấn nút hoàn thành đơn hàng.
  - Thì: hệ thống hiển thị modal **"Hoàn thành đơn hàng"** với mô tả **"Đơn mua hàng sẽ được đánh dấu Hoàn thành và không thể chỉnh sửa lại."** và hai nút **"Hủy"** / **"Hoàn thành"**. Khi xác nhận, toast: **"Đơn hàng đã được hoàn thành."**.

- [ ] **AC-11**: Hủy đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage nhấn nút hủy đơn hàng.
  - Thì: hệ thống hiển thị modal **"Hủy đơn hàng"** với mô tả **"Hành động này không thể hoàn tác."** và trường **"Lý do hủy đơn"** (bắt buộc, placeholder: **"Nhập lý do hủy đơn"**). Hai nút **"Đóng"** / **"Xác nhận"**. Khi xác nhận, toast: **"Đơn hàng đã được huỷ."**.
  - Khi: chủ garage không nhập lý do hủy đơn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập lý do hủy đơn"**.

- [ ] **AC-12**: Hoàn hàng đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage nhấn nút hoàn hàng.
  - Thì: hệ thống hiển thị modal **"Hoàn đơn hàng"** với mô tả **"Hành động này không thể hoàn tác."** và trường **"Lý do hoàn hàng"** (bắt buộc, placeholder: **"Nhập lý do hoàn hàng"**). Hai nút **"Đóng"** / **"Xác nhận"**. Khi xác nhận, toast: **"Đơn hàng đã được ghi nhận hoàn hàng."**.
  - Khi: chủ garage không nhập lý do hoàn hàng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập lý do hoàn hàng"**.

- [ ] **AC-13**: Nút chỉnh sửa đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa đơn hàng (xem `FEAT-PO-EDIT`).

- [ ] **AC-14**: Cập nhật tài liệu đính kèm
  - Tại: màn hình Chi tiết đơn hàng, mục **"Tài liệu đính kèm"**.
  - Khi: chủ garage nhấn nút **"Cập nhật tài liệu đính kèm"** và tải lên tài liệu.
  - Thì: hệ thống cập nhật tài liệu đính kèm thành công, toast: **"Cập nhật tài liệu đính kèm thành công"**.

### Nhóm C — Phân quyền

- [ ] **AC-15**: Phân quyền xem chi tiết và thao tác đơn hàng
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết đơn hàng, chuyển trạng thái, hủy, hoàn hàng, hoàn thành và chỉnh sửa. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-16**: Tải dữ liệu chi tiết thất bại
  - Tại: màn hình Chi tiết đơn hàng.
  - Khi: hệ thống không tải được dữ liệu đơn hàng (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-PROCUREMENT.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Chi tiết đơn hàng: Query `GetPurchaseOrderDetailV3`
- Chuyển trạng thái: Mutation `UpdateDirectPurchaseOrderStatus`
- Xác nhận nhận hàng: Mutation `ConfirmReceivedPurchaseOrderByCode`
- Cập nhật tài liệu đính kèm: Mutation `UpdateDirectPurchaseOrderAttachments`

## 5. Business Rules

- **BR-PO-DTL-001**: Thông tin đơn hàng trên màn hình chi tiết luôn được phạm vi theo garage hiện tại — không hiển thị đơn hàng của garage khác.
- **BR-PO-DTL-002**: Đơn hàng ở trạng thái **"Hoàn thành"** hoặc **"Đã hủy"** không cho phép chỉnh sửa hoặc chuyển trạng thái.
- **BR-PO-DTL-003**: Hủy đơn hàng và hoàn hàng là hành động không thể hoàn tác — yêu cầu nhập lý do bắt buộc.
- **BR-PO-DTL-004**: Phiếu nhập kho liên kết hiển thị các phiếu nhập kho được tạo từ đơn hàng này.
- **BR-PO-DTL-005**: Lịch sử ghi nhận theo dõi mọi thay đổi trạng thái của đơn hàng theo thời gian.
- **BR-PO-DTL-006**: Khi đơn hàng chuyển sang trạng thái **"Đang giao hàng"**, hệ thống tự động tạo phiếu nhập kho nguồn **"Nền tảng"** ở trạng thái **"Chờ duyệt"** liên kết với đơn hàng — phiếu này do `gf-inventory-worker` (`ReceiptFulfillmentWorkflow`) xử lý qua sự kiện `PurchaseOrderStatusChanged`.

## 6. Edge Cases

- **EC-1**: Đơn hàng chưa có tài liệu đính kèm — mục **"Tài liệu đính kèm"** hiển thị trống.
- **EC-2**: Đơn hàng chưa liên kết phiếu nhập kho — mục **"Phiếu nhập kho liên kết"** hiển thị trống.
- **EC-3**: Đơn hàng đã hủy — hiển thị **"Lý do hủy"** trong mục Thông tin chung, không cho phép thao tác chuyển trạng thái hay chỉnh sửa.
- **EC-4**: Đơn hàng đã hoàn hàng — hiển thị **"Lý do hoàn"** trong mục Thông tin chung.

## 7. Out of Scope

- Chỉnh sửa đơn hàng → xem `FEAT-PO-EDIT`.
- Tạo đơn hàng mới → xem `FEAT-PO-CREATE`.
- Danh sách đơn hàng → xem `FEAT-PO-LIST`.
- Quản lý phiếu nhập kho — thuộc `EP-INVENTORY-RECEIPT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (purchase-orders-code detail screen, GetPurchaseOrderDetailV3, UpdateDirectPurchaseOrderStatus, status transitions, cancel/return modals) |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-9 side-effect: tự động tạo phiếu nhập kho khi PO → "Đang giao hàng". Thêm BR-PO-DTL-006 (auto-creation via ReceiptFulfillmentWorkflow). |
