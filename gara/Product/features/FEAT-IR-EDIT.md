---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-IR-EDIT: Chỉnh sửa phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-EDIT` |
| Title | Chỉnh sửa phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa phiếu nhập kho đang ở trạng thái chờ duyệt bao gồm thông tin phiếu, danh sách sản phẩm, tệp đính kèm và ghi chú, **so that** tôi có thể cập nhật thông tin chính xác trước khi duyệt phiếu.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa

- [ ] **AC-1**: Mở màn hình chỉnh sửa phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa phiếu nhập kho"** với form đã điền sẵn dữ liệu hiện tại của phiếu, gồm 4 mục: Thông tin phiếu nhập kho, Danh sách sản phẩm nhập kho, Tệp đính kèm, Ghi chú.

- [ ] **AC-2**: Điều kiện trạng thái cho phép chỉnh sửa
  - Tại: màn hình Chi tiết phiếu nhập kho.
  - Khi: phiếu ở trạng thái khác **"Chờ duyệt"** (đã duyệt, hoàn tác, đã hủy).
  - Thì: nút **"Chỉnh sửa"** không hiển thị. Không cho phép truy cập màn hình chỉnh sửa.

### Nhóm B — Mục: Thông tin phiếu nhập kho

- [ ] **AC-3**: Chỉnh sửa nguồn nhập
  - Tại: mục **"Thông tin phiếu nhập kho"**, trường **"Nguồn nhập"**.
  - Khi: chủ garage thay đổi nguồn nhập.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại đã chọn sẵn. Các giá trị: **"Mua ngoài"**, **"Nền tảng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nguồn."**.

- [ ] **AC-4**: Chỉnh sửa mã đơn hàng
  - Tại: mục **"Thông tin phiếu nhập kho"**, trường **"Mã đơn hàng"**.
  - Khi: chủ garage chỉnh sửa mã đơn hàng.
  - Thì: hệ thống hiển thị ô nhập với giá trị hiện tại. Placeholder: **"Nhập mã đơn hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập mã đơn hàng."**.

- [ ] **AC-5**: Chỉnh sửa mã lô hàng
  - Tại: mục **"Thông tin phiếu nhập kho"**, trường **"Mã lô hàng"**.
  - Khi: chủ garage chỉnh sửa mã lô hàng.
  - Thì: hệ thống hiển thị ô nhập với giá trị hiện tại. Placeholder: **"Nhập mã lô hàng"**. Trường này không bắt buộc.

### Nhóm C — Mục: Danh sách sản phẩm nhập kho

- [ ] **AC-6**: Hiển thị danh sách sản phẩm hiện tại
  - Tại: mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: hệ thống tải dữ liệu phiếu nhập kho.
  - Thì: hệ thống hiển thị bảng sản phẩm với dữ liệu đã lưu, gồm các cột: **"Tên phụ tùng"**, **"Mã Genuine"**, **"Phân khúc"**, **"Xuất xứ"**, **"Đơn vị nhập"**, **"Quy đổi"**, **"Đơn vị kho"**, **"Số lượng"**, **"Số lượng nhập theo đơn vị nhập"**, **"Số lượng sau quy đổi"**, **"Số lượng sau quy đổi theo đơn vị kho"**, **"Giá nhập"**, **"Giá trên 1 đơn vị nhập"**, **"Giá bán gợi ý"**, **"Giá bán trên 1 đơn vị kho"**, **"Thao tác"**. Cho phép chỉnh sửa giá trị từng dòng.

- [ ] **AC-7**: Thêm dòng sản phẩm mới
  - Tại: mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage thêm dòng sản phẩm mới.
  - Thì: hệ thống hiển thị dòng trống mới trong bảng, cho phép nhập thông tin sản phẩm tương tự form tạo (xem `FEAT-IR-CREATE` AC-5).

- [ ] **AC-8**: Xóa dòng sản phẩm
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa dòng trên một dòng sản phẩm.
  - Thì: hệ thống xóa dòng sản phẩm khỏi bảng và cập nhật lại **"Tổng giá trị:"**.

- [ ] **AC-9**: Validation danh sách sản phẩm
  - Tại: mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage gửi form mà danh sách sản phẩm rỗng (đã xóa hết).
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.
  - Khi: chủ garage gửi form mà có dòng sản phẩm chưa điền đủ thông tin bắt buộc.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."**.

- [ ] **AC-10**: Validation số lượng nhập
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Số lượng"**.
  - Khi: chủ garage nhập số lượng cho dòng sản phẩm.
  - Thì: hệ thống chỉ chấp nhận giá trị lớn hơn hoặc bằng 0. Nếu bỏ trống, hiển thị thông báo lỗi: **"Vui lòng nhập số lượng."**. Nếu nhập giá trị âm, hiển thị thông báo lỗi: **"Số lượng phải lớn hơn hoặc bằng 0."**.

- [ ] **AC-11**: Validation đơn vị kho
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Đơn vị kho"**.
  - Khi: chủ garage bỏ trống đơn vị kho và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đơn vị kho."**.

- [ ] **AC-12**: Validation tỷ lệ quy đổi
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Quy đổi"**.
  - Khi: chủ garage nhập tỷ lệ quy đổi bằng 0 hoặc âm.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tỷ lệ quy đổi lớn hơn 0"**.

- [ ] **AC-13**: Validation giá bán gợi ý
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Giá bán gợi ý"**.
  - Khi: chủ garage nhập giá bán gợi ý âm.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập giá đề xuất lớn hơn hoặc bằng 0"**.

- [ ] **AC-14**: Validation số lượng nhập không vượt quá số lượng đặt hàng
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Số lượng"**, khi phiếu có nguồn **"Nền tảng"** và liên kết với đơn hàng.
  - Khi: chủ garage nhập số lượng vượt quá số lượng đặt hàng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số lượng nhập không được vượt quá số lượng đặt hàng."**.

- [ ] **AC-15**: Hiển thị tổng giá trị
  - Tại: cuối mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage thay đổi sản phẩm hoặc số lượng.
  - Thì: hệ thống tự động tính lại và hiển thị **"Tổng giá trị:"** = tổng giá nhập của tất cả dòng sản phẩm.

### Nhóm D — Mục: Tệp đính kèm

- [ ] **AC-16**: Chỉnh sửa tệp đính kèm
  - Tại: mục **"Tệp đính kèm"**.
  - Khi: chủ garage thêm hoặc xóa tệp đính kèm.
  - Thì: hệ thống cho phép tải lên tệp mới hoặc xóa tệp đã có. **"Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"**. Trường này không bắt buộc.

### Nhóm E — Mục: Ghi chú

- [ ] **AC-17**: Chỉnh sửa ghi chú
  - Tại: mục **"Ghi chú"**, trường ghi chú.
  - Khi: chủ garage chỉnh sửa ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea với nội dung hiện tại. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

### Nhóm F — Nút hành động trên form

- [ ] **AC-18**: Điều kiện nút lưu phiếu nhập kho
  - Tại: cuối form chỉnh sửa phiếu nhập kho, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Nguồn nhập, Mã đơn hàng, ít nhất một sản phẩm với tên, số lượng, đơn vị kho) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái bị mờ (disabled).

- [ ] **AC-19**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa phiếu nhập kho, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết phiếu nhập kho. Các thay đổi chưa lưu bị hủy bỏ.

### Nhóm G — Phân quyền

- [ ] **AC-20**: Phân quyền chỉnh sửa phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho hoặc Danh sách phiếu nhập kho.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa phiếu nhập kho ở trạng thái **"Chờ duyệt"**. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm H — Xử lý lỗi và trạng thái sau lưu

- [ ] **AC-21**: Lưu phiếu nhập kho thành công
  - Tại: form chỉnh sửa phiếu nhập kho, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật phiếu nhập kho thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Cập nhật phiếu nhập kho thành công."**. Phiếu giữ nguyên trạng thái **"Chờ duyệt"**. Hệ thống chuyển về màn hình chi tiết phiếu nhập kho.

- [ ] **AC-22**: Lưu phiếu nhập kho thất bại
  - Tại: form chỉnh sửa phiếu nhập kho, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật phiếu nhập kho thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã chỉnh sửa để chủ garage có thể thử lại.

- [ ] **AC-23**: Validation form thất bại
  - Tại: form chỉnh sửa phiếu nhập kho, sau khi nhấn nút **"Lưu"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-3 đến AC-14) và không gửi yêu cầu lên hệ thống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-RECEIPT.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu nhập kho: Query `GetReceiptByCode`
- Cập nhật phiếu nhập kho: Mutation `UpdateReceipts`
- Lấy thông tin đơn hàng: Query `GetPurchaseOrderForReceipt`
- Tìm sản phẩm: Query `SearchProducts`, `SearchGroupedProductApiResponse`

## 5. Business Rules

- **BR-IR-EDT-001**: Chỉ phiếu nhập kho ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa. Phiếu ở trạng thái **"Đã duyệt"**, **"Hoàn tác"**, **"Đã hủy"** không thể chỉnh sửa.
- **BR-IR-EDT-002**: Sau khi lưu, phiếu giữ nguyên trạng thái **"Chờ duyệt"** — chỉnh sửa không làm thay đổi trạng thái.
- **BR-IR-EDT-003**: Nguồn nhập **"Mua ngoài"** cho phép chỉnh sửa các trường sản phẩm (phân khúc, thông tin bổ sung). Nguồn nhập **"Nền tảng"** giới hạn chỉnh sửa — số lượng nhập không được vượt quá số lượng đặt hàng.
- **BR-IR-EDT-004**: Danh sách sản phẩm sau chỉnh sửa phải có ít nhất một dòng sản phẩm với đầy đủ thông tin bắt buộc (tên, số lượng, đơn vị kho).
- **BR-IR-EDT-005**: Validation các trường bắt buộc và giới hạn giá trị áp dụng tương tự như khi tạo phiếu (xem `FEAT-IR-CREATE`).

## 6. Edge Cases

- **EC-1**: Phiếu đã chuyển trạng thái trong lúc đang chỉnh sửa (ví dụ người khác duyệt phiếu) — khi gửi form, hệ thống từ chối cập nhật và hiển thị lỗi.
- **EC-2**: Sản phẩm đã bị xóa khỏi danh mục sau khi tạo phiếu — dòng sản phẩm vẫn hiển thị với thông tin đã lưu, cho phép chỉnh sửa.
- **EC-3**: Đơn hàng liên kết đã thay đổi số lượng — validation số lượng nhập áp dụng theo số lượng đặt hàng mới nhất.

## 7. Out of Scope

- Tạo phiếu nhập kho → xem `FEAT-IR-CREATE`.
- Xem chi tiết phiếu nhập kho → xem `FEAT-IR-DETAIL`.
- Duyệt, hủy, hoàn tác phiếu nhập kho → xem `FEAT-IR-DETAIL`.
- Danh sách phiếu nhập kho → xem `FEAT-IR-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-receipt-code-edit screen, UpdateReceipts mutation, chỉ edit khi PENDING, bảng sản phẩm với quy đổi đơn vị, validation schema) |
