---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-ID-EDIT: Chỉnh sửa phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-EDIT` |
| Title | Chỉnh sửa phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin phiếu xuất kho đang ở trạng thái chờ duyệt, bao gồm nguồn xuất, phiếu dịch vụ liên kết, ghi chú và danh sách sản phẩm, **so that** tôi có thể điều chỉnh thông tin phiếu trước khi xác nhận xuất kho.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa, thay đổi thông tin và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa phiếu xuất kho
  - Tại: màn hình Chi tiết phiếu xuất kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa phiếu xuất kho"** với form được điền sẵn dữ liệu hiện tại của phiếu, gồm 2 mục: **"Thông tin phiếu xuất kho"** và **"Danh sách sản phẩm xuất kho"**.

- [ ] **AC-2**: Lưu chỉnh sửa thành công
  - Tại: form chỉnh sửa phiếu xuất kho, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật phiếu xuất kho thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật phiếu xuất kho thành công."**. Trạng thái phiếu giữ nguyên **"Chờ duyệt"**.

- [ ] **AC-3**: Điều kiện nút lưu
  - Tại: cuối form chỉnh sửa phiếu xuất kho, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Nguồn xuất, Mã phiếu dịch vụ, ít nhất một sản phẩm với đầy đủ thông tin) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa phiếu xuất kho, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết phiếu xuất kho. Các thay đổi chưa lưu bị hủy bỏ.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin phiếu xuất kho

- [ ] **AC-5**: Chỉnh sửa nguồn xuất
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Nguồn xuất"**.
  - Khi: chủ garage thay đổi nguồn xuất.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Mua ngoài"**, **"Nền tảng"**. Trường này bắt buộc. Giá trị hiện tại của phiếu được điền sẵn.
  - Khi: chủ garage bỏ trống trường này và thực hiện submit.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn nguồn."**.

- [ ] **AC-6**: Chỉnh sửa mã phiếu dịch vụ
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Mã phiếu dịch vụ"**.
  - Khi: chủ garage thay đổi mã phiếu dịch vụ.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Tìm kiếm mã phiếu dịch vụ"**. Trường này bắt buộc. Giá trị hiện tại được điền sẵn.
  - Khi: chủ garage bỏ trống trường này và thực hiện submit.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập mã phiếu dịch vụ."**.

- [ ] **AC-7**: Chỉnh sửa mã lô hàng
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Mã lô hàng"**.
  - Khi: chủ garage thay đổi mã lô hàng.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mã lô hàng"**. Trường này không bắt buộc. Giá trị hiện tại được điền sẵn.

- [ ] **AC-8**: Chỉnh sửa ghi chú
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Ghi chú"**.
  - Khi: chủ garage thay đổi ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc. Giá trị hiện tại được điền sẵn.

- [ ] **AC-9**: Chỉnh sửa tệp đính kèm
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Tệp đính kèm"**.
  - Khi: chủ garage thêm hoặc xóa tệp đính kèm.
  - Thì: hệ thống cho phép tải lên tối đa 5 tệp, mỗi tệp tối đa 30 MB. Hiển thị thông báo giới hạn: **"(Tối đa 5 tệp (30mb/tệp))"**. Tệp đã đính kèm trước đó hiển thị sẵn.

#### Mục: Danh sách sản phẩm xuất kho

- [ ] **AC-10**: Chỉnh sửa danh sách sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, bảng sản phẩm.
  - Khi: chủ garage chỉnh sửa danh sách sản phẩm (thêm, xóa, thay đổi số lượng).
  - Thì: hệ thống hiển thị bảng sản phẩm với dữ liệu hiện tại được điền sẵn. Chủ garage có thể thêm sản phẩm mới (placeholder: **"Chọn"**), xóa sản phẩm và thay đổi số lượng. Phải có ít nhất một sản phẩm trong danh sách.
  - Khi: danh sách sản phẩm trống khi submit.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.

- [ ] **AC-11**: Chỉnh sửa số lượng xuất cho sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Số lượng"** của một dòng sản phẩm.
  - Khi: chủ garage thay đổi số lượng xuất.
  - Thì: hệ thống cập nhật giá trị. Trường này bắt buộc cho mỗi sản phẩm.
  - Khi: chủ garage bỏ trống hoặc nhập giá trị không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số lượng."** hoặc **"Số lượng phải lớn hơn hoặc bằng 0."**.

- [ ] **AC-12**: Chỉnh sửa đơn vị kho cho sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Đơn vị kho"** của một dòng sản phẩm.
  - Khi: chủ garage không nhập đơn vị kho.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đơn vị kho."**. Trường này bắt buộc.

- [ ] **AC-13**: Chỉnh sửa giá vốn cho sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Giá vốn"** của một dòng sản phẩm.
  - Khi: chủ garage nhập giá vốn không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập giá vốn."** hoặc **"Vui lòng nhập giá vốn lớn hơn hoặc bằng 0"**.

- [ ] **AC-14**: Validation đầy đủ thông tin sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, khi submit form.
  - Khi: một hoặc nhiều sản phẩm trong danh sách thiếu thông tin bắt buộc (tên, số lượng, đơn vị kho).
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."**.

- [ ] **AC-15**: Xóa sản phẩm khỏi danh sách
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Thao tác"** của một dòng sản phẩm.
  - Khi: chủ garage nhấn nút xóa dòng.
  - Thì: hệ thống xóa sản phẩm đó khỏi danh sách. Nếu danh sách còn lại trống, validation sẽ yêu cầu thêm ít nhất một sản phẩm khi submit.

- [ ] **AC-16**: Hiển thị tổng giá trị
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cuối bảng sản phẩm.
  - Khi: danh sách có sản phẩm với số lượng và giá vốn.
  - Thì: hệ thống hiển thị **"Tổng giá trị:"** tính tổng giá trị xuất kho dựa trên số lượng và giá vốn của từng sản phẩm, cập nhật khi thay đổi.

### Nhóm C — Phân quyền

- [ ] **AC-17**: Phân quyền chỉnh sửa phiếu xuất kho
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Chỉnh sửa"** (khi phiếu ở trạng thái **"Chờ duyệt"**) và có quyền chỉnh sửa phiếu xuất kho.

### Nhóm D — Xử lý lỗi

- [ ] **AC-18**: Validation form thất bại
  - Tại: form chỉnh sửa phiếu xuất kho, sau khi nhấn nút **"Lưu"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-14) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-19**: Lưu chỉnh sửa thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa phiếu xuất kho, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống cập nhật phiếu xuất kho thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-20**: Số lượng xuất vượt quá số lượng đặt hàng
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, khi nguồn xuất là **"Nền tảng"**.
  - Khi: chủ garage nhập số lượng xuất vượt quá số lượng đặt hàng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số lượng xuất không được vượt quá số lượng đặt hàng."**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-INVENTORY-DELIVERY.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu xuất kho: Query `GetDeliveryByCode`
- Danh sách sản phẩm: Query `GetDeliveryItems`
- Cập nhật phiếu xuất kho: Mutation `UpdateDelivery`
- Tìm kiếm sản phẩm cho phiếu xuất: Query `GetPartsForDeliveryV3`

## 5. Business Rules

- **BR-ID-EDT-001**: Chỉ phiếu xuất kho ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa. Phiếu ở trạng thái **"Đã duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"** không cho phép chỉnh sửa.
- **BR-ID-EDT-002**: Sau khi lưu chỉnh sửa, trạng thái phiếu vẫn giữ nguyên **"Chờ duyệt"**.
- **BR-ID-EDT-003**: Phiếu xuất kho sau chỉnh sửa vẫn bắt buộc phải có ít nhất một sản phẩm với đầy đủ thông tin (tên, số lượng, đơn vị kho).
- **BR-ID-EDT-004**: Nguồn xuất và mã phiếu dịch vụ vẫn là trường bắt buộc khi chỉnh sửa.
- **BR-ID-EDT-005**: Tệp đính kèm tối đa 5 tệp, mỗi tệp không vượt quá 30 MB.
- **BR-ID-EDT-006**: Khi nguồn xuất là **"Nền tảng"**, số lượng xuất không được vượt quá số lượng đặt hàng.
- **BR-ID-EDT-007**: Số lượng xuất của mỗi sản phẩm phải lớn hơn hoặc bằng 0. Giá vốn phải lớn hơn hoặc bằng 0.

## 6. Edge Cases

- **EC-1**: Phiếu xuất kho đã chuyển trạng thái (bởi người dùng khác) trong khi đang chỉnh sửa — khi submit, hệ thống báo lỗi do phiếu không còn ở trạng thái **"Chờ duyệt"**.
- **EC-2**: Sản phẩm đã có trong phiếu nhưng không còn trong danh mục kho — thông tin sản phẩm vẫn hiển thị theo dữ liệu đã lưu, cho phép chỉnh sửa số lượng hoặc xóa.
- **EC-3**: Xóa tất cả sản phẩm khỏi danh sách rồi nhấn lưu — hệ thống báo lỗi yêu cầu ít nhất một sản phẩm.

## 7. Out of Scope

- Tạo phiếu xuất kho mới → xem `FEAT-ID-CREATE`.
- Xác nhận xuất kho, hủy phiếu, hoàn tác phiếu → xem `FEAT-ID-DETAIL`.
- Danh sách phiếu xuất kho → xem `FEAT-ID-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-delivery-code-edit screen, UpdateDelivery mutation, form schema validations) |
