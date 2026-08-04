---
type: feature
artifact_kind: feature
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-ID-CREATE: Tạo phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-CREATE` |
| Title | Tạo phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu xuất kho với thông tin nguồn xuất, phiếu dịch vụ liên kết và danh sách sản phẩm xuất, **so that** garage có thể ghi nhận và quản lý hàng hóa xuất ra khỏi kho phục vụ dịch vụ sửa chữa hoặc mua ngoài.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo phiếu xuất kho
  - Tại: màn hình Danh sách phiếu xuất kho.
  - Khi: chủ garage nhấn nút **"Tạo phiếu xuất kho mới"**.
  - Thì: hệ thống chuyển sang màn hình **"Tạo phiếu xuất kho"** với form trống, gồm 2 mục: **"Thông tin phiếu xuất kho"** và **"Danh sách sản phẩm xuất kho"**.

- [ ] **AC-2**: Tạo phiếu xuất kho thành công
  - Tại: form tạo phiếu xuất kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo phiếu xuất kho thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo phiếu xuất kho thành công."**. Mã phiếu xuất kho được hệ thống tự sinh. Trạng thái phiếu khởi tạo là **"Chờ duyệt"**.

- [ ] **AC-3**: Điều kiện nút tạo mới
  - Tại: cuối form tạo phiếu xuất kho, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Mã phiếu dịch vụ, ít nhất một sản phẩm với đầy đủ thông tin) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo phiếu xuất kho
  - Tại: form tạo phiếu xuất kho, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form tạo phiếu xuất kho và quay về màn hình Danh sách phiếu xuất kho. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin phiếu xuất kho

- [ ] **AC-5**: Nguồn xuất phiếu tạo thủ công
  - Tại: form **"Tạo phiếu xuất kho"**.
  - Khi: chủ garage tạo phiếu xuất kho qua form.
  - Thì: form không hiển thị trường chọn nguồn xuất. Nguồn xuất (**"Mua ngoài"** hoặc **"Nền tảng"**) được kế thừa tự động từ phiếu dịch vụ liên kết — khi chủ garage chọn mã phiếu dịch vụ, hệ thống kế thừa nguồn xuất từ phiếu dịch vụ đó.

- [ ] **AC-6**: Chọn mã phiếu dịch vụ
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Mã phiếu dịch vụ"**.
  - Khi: chủ garage nhập hoặc tìm kiếm mã phiếu dịch vụ.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Tìm kiếm mã phiếu dịch vụ"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và thực hiện submit.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập mã phiếu dịch vụ."**.

- [ ] **AC-7**: Nhập mã lô hàng
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Mã lô hàng"**.
  - Khi: chủ garage nhập mã lô hàng.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mã lô hàng"**. Trường này không bắt buộc.

- [ ] **AC-8**: Nhập ghi chú
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

- [ ] **AC-9**: Đính kèm tệp
  - Tại: mục **"Thông tin phiếu xuất kho"**, trường **"Tệp đính kèm"**.
  - Khi: chủ garage tải lên tệp đính kèm.
  - Thì: hệ thống cho phép tải lên tối đa 5 tệp, mỗi tệp tối đa 30 MB. Hiển thị thông báo giới hạn: **"(Tối đa 5 tệp (30mb/tệp))"**. Trường này không bắt buộc.

#### Mục: Danh sách sản phẩm xuất kho

- [ ] **AC-10**: Thêm sản phẩm vào danh sách xuất kho
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, bảng sản phẩm.
  - Khi: chủ garage chọn sản phẩm từ danh mục.
  - Thì: hệ thống hiển thị ô chọn sản phẩm. Placeholder: **"Chọn"**. Sau khi chọn, sản phẩm được thêm vào bảng với các cột: **"Tên phụ tùng"**, **"Mã Genuine"**, **"Phân khúc"**, **"Xuất xứ"**, **"Đơn vị kho"**, **"Giá vốn"**, **"Số lượng"**, **"Số lượng theo đơn vị kho"**, **"Giá vốn trên 1 đơn vị kho"**, **"Thao tác"**. Phải có ít nhất một sản phẩm trong danh sách.
  - Khi: danh sách sản phẩm trống khi submit.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.

- [ ] **AC-11**: Nhập số lượng xuất cho sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Số lượng"** của một dòng sản phẩm.
  - Khi: chủ garage nhập số lượng xuất.
  - Thì: hệ thống hiển thị ô nhập số. Trường này bắt buộc cho mỗi sản phẩm.
  - Khi: chủ garage bỏ trống hoặc nhập giá trị không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số lượng."** hoặc **"Số lượng phải lớn hơn hoặc bằng 0."**.

- [ ] **AC-12**: Nhập đơn vị kho cho sản phẩm
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, cột **"Đơn vị kho"** của một dòng sản phẩm.
  - Khi: chủ garage không nhập đơn vị kho.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đơn vị kho."**. Trường này bắt buộc.

- [ ] **AC-13**: Nhập giá vốn cho sản phẩm
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
  - Thì: hệ thống hiển thị **"Tổng giá trị:"** tính tổng giá trị xuất kho dựa trên số lượng và giá vốn của từng sản phẩm.

### Nhóm C — Phân quyền

- [ ] **AC-17**: Phân quyền tạo phiếu xuất kho
  - Tại: màn hình Danh sách phiếu xuất kho.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Tạo phiếu xuất kho mới"** và có quyền tạo phiếu xuất kho.

### Nhóm D — Xử lý lỗi

- [ ] **AC-18**: Validation form thất bại
  - Tại: form tạo phiếu xuất kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-6 đến AC-14) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-19**: Tạo phiếu xuất kho thất bại do lỗi hệ thống
  - Tại: form tạo phiếu xuất kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo phiếu xuất kho thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-20**: Số lượng xuất vượt quá số lượng đặt hàng
  - Tại: mục **"Danh sách sản phẩm xuất kho"**, khi nguồn xuất là **"Nền tảng"**.
  - Khi: chủ garage nhập số lượng xuất vượt quá số lượng đặt hàng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số lượng xuất không được vượt quá số lượng đặt hàng."**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-INVENTORY-DELIVERY.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Tạo phiếu xuất kho: Mutation `CreateDelivery`
- Tìm kiếm sản phẩm cho phiếu xuất: Query `GetPartsForDeliveryV3`

## 5. Business Rules

- **BR-ID-CRE-001**: Mã phiếu xuất kho được hệ thống tự sinh, không cho phép nhập thủ công.
- **BR-ID-CRE-002**: Phiếu xuất kho khi tạo luôn khởi tạo ở trạng thái **"Chờ duyệt"**.
- **BR-ID-CRE-003**: Phiếu xuất kho bắt buộc phải có ít nhất một sản phẩm với đầy đủ thông tin (tên, số lượng, đơn vị kho).
- **BR-ID-CRE-004**: Mã phiếu dịch vụ là trường bắt buộc khi tạo phiếu xuất kho. Nguồn xuất (**"Mua ngoài"** / **"Nền tảng"**) kế thừa từ phiếu dịch vụ liên kết — form không có trường chọn nguồn. Ngoài tạo thủ công qua form, hệ thống cũng tự động tạo phiếu xuất kho khi phiếu dịch vụ chuyển trạng thái phù hợp (xem `FEAT-SO-DETAIL`).
- **BR-ID-CRE-005**: Tệp đính kèm tối đa 5 tệp, mỗi tệp không vượt quá 30 MB.
- **BR-ID-CRE-006**: Khi nguồn xuất là **"Nền tảng"**, số lượng xuất không được vượt quá số lượng đặt hàng.
- **BR-ID-CRE-007**: Số lượng xuất của mỗi sản phẩm phải lớn hơn hoặc bằng 0. Giá vốn phải lớn hơn hoặc bằng 0.

## 6. Edge Cases

- **EC-1**: Mã phiếu dịch vụ không tìm thấy trong hệ thống — hệ thống không cho phép chọn, chỉ hiển thị các phiếu dịch vụ hợp lệ trong ô tìm kiếm.
- **EC-2**: Sản phẩm không có trong danh mục kho — hệ thống chỉ cho phép chọn sản phẩm đã tồn tại trong danh mục.
- **EC-3**: Xóa tất cả sản phẩm khỏi danh sách rồi nhấn submit — hệ thống báo lỗi yêu cầu ít nhất một sản phẩm.

## 7. Out of Scope

- Xác nhận xuất kho (hoàn tất phiếu) → xem `FEAT-ID-DETAIL`.
- Hủy phiếu xuất kho → xem `FEAT-ID-DETAIL`.
- Chỉnh sửa phiếu xuất kho sau khi tạo → xem `FEAT-ID-EDIT`.
- Quản lý danh mục sản phẩm, product line → thuộc `EP-CATALOG`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-delivery-create screen, CreateDelivery mutation, form schema validations) |
| 2026-05-20 | 2 | Business Authority | Sửa AC-5: form tạo thủ công không có trường chọn nguồn — luôn tạo "Mua ngoài". "Nền tảng" chỉ auto-create từ SO. Cập nhật AC-3, BR-ID-CRE-004. |
| 2026-05-21 | 3 | Business Authority | Sửa AC-5, BR-ID-CRE-004: nguồn xuất kế thừa từ phiếu dịch vụ liên kết (không phải "luôn Mua ngoài"). Cả hai nguồn đều tạo thủ công được — tùy nguồn của SO liên kết. |
