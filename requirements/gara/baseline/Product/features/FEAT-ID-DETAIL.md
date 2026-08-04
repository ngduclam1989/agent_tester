---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-DELIVERY"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-ID-DETAIL: Chi tiết phiếu xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-ID-DETAIL` |
| Title | Chi tiết phiếu xuất kho |
| Parent Epic | `EP-INVENTORY-DELIVERY` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu xuất kho bao gồm thông tin phiếu, danh sách sản phẩm và tổng kết, đồng thời thực hiện các hành động xác nhận xuất kho, hủy phiếu và hoàn tác phiếu, **so that** tôi có thể kiểm tra, duyệt và quản lý trạng thái phiếu xuất kho.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết phiếu xuất kho

- [ ] **AC-1**: Hiển thị màn hình chi tiết phiếu xuất kho
  - Tại: màn hình Danh sách phiếu xuất kho.
  - Khi: chủ garage nhấn vào một dòng phiếu xuất kho.
  - Thì: hệ thống chuyển sang màn hình chi tiết phiếu xuất kho, hiển thị mục **"Thông tin phiếu xuất kho"** gồm các trường: **"Mã phiếu dịch vụ"**, **"Mã lô hàng"**, **"Nguồn"**, **"Tên khách hàng"**, **"Ghi chú nội bộ"**. Trạng thái phiếu hiển thị dưới dạng badge.

- [ ] **AC-2**: Hiển thị danh sách sản phẩm trong phiếu
  - Tại: màn hình Chi tiết phiếu xuất kho, bên dưới mục thông tin phiếu.
  - Khi: hệ thống tải xong dữ liệu phiếu.
  - Thì: hệ thống hiển thị danh sách sản phẩm xuất kho với các cột tương ứng (tên phụ tùng, mã genuine, phân khúc, xuất xứ, đơn vị kho, số lượng xuất, giá vốn khi xuất).

- [ ] **AC-3**: Hiển thị tổng kết phiếu xuất kho
  - Tại: màn hình Chi tiết phiếu xuất kho, mục **"Tổng kết"**.
  - Khi: hệ thống hiển thị chi tiết phiếu.
  - Thì: mục tổng kết hiển thị **"Tổng số sản phẩm"** và **"Tổng giá trị phiếu xuất"**.

- [ ] **AC-4**: Không tìm thấy phiếu xuất kho
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: mã phiếu xuất kho không tồn tại trong hệ thống.
  - Thì: hệ thống hiển thị thông báo: **"Không tìm thấy phiếu xuất kho"**.

### Nhóm B — Hành động trạng thái: Xác nhận xuất kho (Hoàn tất)

- [ ] **AC-5**: Hiển thị nút Hoàn tất
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: phiếu ở trạng thái **"Chờ duyệt"**.
  - Thì: hệ thống hiển thị nút **"Hoàn tất"**.
  - Khi: phiếu ở trạng thái **"Đã duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"**.
  - Thì: nút **"Hoàn tất"** không hiển thị.

- [ ] **AC-6**: Xác nhận xuất kho thành công
  - Tại: màn hình Chi tiết phiếu xuất kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Hoàn tất"** và xác nhận hành động.
  - Thì: hệ thống chuyển trạng thái phiếu sang **"Đã duyệt"**. Hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Xác nhận xuất kho thành công."**. Số lượng tồn kho của các sản phẩm trong phiếu giảm tương ứng. Nút **"Hoàn tất"** biến mất, hiển thị nút **"Hoàn tác"**.

### Nhóm C — Hành động trạng thái: Hủy phiếu

- [ ] **AC-7**: Hiển thị nút Hủy
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: phiếu ở trạng thái **"Chờ duyệt"**.
  - Thì: hệ thống hiển thị nút **"Hủy"**.
  - Khi: phiếu ở trạng thái **"Đã duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"**.
  - Thì: nút **"Hủy"** không hiển thị.

- [ ] **AC-8**: Nhập lý do hủy phiếu
  - Tại: màn hình Chi tiết phiếu xuất kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống mở modal yêu cầu nhập lý do hủy phiếu. Placeholder: **"Nhập lý do hủy phiếu"**.

- [ ] **AC-9**: Hủy phiếu xuất kho thành công
  - Tại: modal nhập lý do hủy phiếu.
  - Khi: chủ garage nhập lý do và xác nhận hủy.
  - Thì: hệ thống chuyển trạng thái phiếu sang **"Đã hủy"**. Hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Hủy phiếu xuất kho thành công."**. Nút **"Hoàn tất"** và **"Hủy"** biến mất. Phiếu không còn cho phép chỉnh sửa.

### Nhóm D — Hành động trạng thái: Hoàn tác phiếu

- [ ] **AC-10**: Hiển thị nút Hoàn tác
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: phiếu ở trạng thái **"Đã duyệt"**.
  - Thì: hệ thống hiển thị nút **"Hoàn tác"**.
  - Khi: phiếu ở trạng thái **"Chờ duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"**.
  - Thì: nút **"Hoàn tác"** không hiển thị.

- [ ] **AC-11**: Hoàn tác phiếu xuất kho thành công
  - Tại: màn hình Chi tiết phiếu xuất kho, phiếu ở trạng thái **"Đã duyệt"**.
  - Khi: chủ garage nhấn nút **"Hoàn tác"** và xác nhận hành động.
  - Thì: hệ thống chuyển trạng thái phiếu sang **"Hoàn tác"**. Hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Hoàn tác phiếu xuất kho thành công."**. Số lượng tồn kho của các sản phẩm trong phiếu tăng trở lại tương ứng. Nút **"Hoàn tác"** biến mất.

### Nhóm E — Các hành động khác

- [ ] **AC-12**: Nút Chỉnh sửa
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: phiếu ở trạng thái **"Chờ duyệt"**.
  - Thì: hệ thống hiển thị nút **"Chỉnh sửa"**. Khi nhấn, hệ thống chuyển sang màn hình chỉnh sửa phiếu xuất kho (xem `FEAT-ID-EDIT`).
  - Khi: phiếu ở trạng thái **"Đã duyệt"**, **"Đã hủy"** hoặc **"Hoàn tác"**.
  - Thì: nút **"Chỉnh sửa"** không hiển thị.

- [ ] **AC-13**: Nút In phiếu
  - Tại: màn hình Chi tiết phiếu xuất kho, phiếu ở trạng thái **"Chờ duyệt"**, **"Đã duyệt"** hoặc **"Hoàn tác"**.
  - Khi: chủ garage nhấn nút **"In phiếu"**.
  - Thì: hệ thống xuất phiếu xuất kho dưới dạng PDF và mở giao diện in.
  - Khi: phiếu ở trạng thái **"Đã hủy"**.
  - Thì: nút **"In phiếu"** không hiển thị.

- [ ] **AC-14**: Nút Tạo phiếu (tạo nhanh từ chi tiết)
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: chủ garage nhấn nút **"Tạo phiếu"**.
  - Thì: hệ thống chuyển sang màn hình tạo phiếu xuất kho mới (xem `FEAT-ID-CREATE`).

### Nhóm F — Phân quyền

- [ ] **AC-15**: Phân quyền xem chi tiết và thực hiện hành động trạng thái
  - Tại: màn hình Chi tiết phiếu xuất kho.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết phiếu xuất kho, xác nhận xuất kho, hủy phiếu, hoàn tác phiếu, chỉnh sửa và in phiếu. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm G — Xử lý lỗi

- [ ] **AC-16**: Xác nhận xuất kho thất bại do lỗi hệ thống
  - Tại: màn hình Chi tiết phiếu xuất kho, khi thực hiện hoàn tất.
  - Khi: hệ thống xử lý xác nhận xuất kho thất bại do lỗi.
  - Thì: hệ thống hiển thị toast lỗi. Trạng thái phiếu giữ nguyên **"Chờ duyệt"**.

- [ ] **AC-17**: Hủy phiếu thất bại do lỗi hệ thống
  - Tại: modal nhập lý do hủy phiếu.
  - Khi: hệ thống xử lý hủy phiếu thất bại do lỗi.
  - Thì: hệ thống hiển thị toast lỗi. Trạng thái phiếu giữ nguyên **"Chờ duyệt"**.

- [ ] **AC-18**: Hoàn tác phiếu thất bại do lỗi hệ thống
  - Tại: màn hình Chi tiết phiếu xuất kho, khi thực hiện hoàn tác.
  - Khi: hệ thống xử lý hoàn tác thất bại do lỗi.
  - Thì: hệ thống hiển thị toast lỗi. Trạng thái phiếu giữ nguyên **"Đã duyệt"**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-INVENTORY-DELIVERY.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu xuất kho: Query `GetDeliveryByCode`
- Danh sách sản phẩm: Query `GetDeliveryItems`
- Xác nhận xuất kho: Mutation `CompleteDelivery`
- Hủy phiếu xuất kho: Mutation `CancelDelivery`
- Hoàn tác phiếu xuất kho: Mutation `ReverseDelivery`

## 5. Business Rules

- **BR-ID-DTL-001**: Trạng thái phiếu xuất kho tuân theo vòng đời: **"Chờ duyệt"** -> **"Đã duyệt"** / **"Đã hủy"**, **"Đã duyệt"** -> **"Hoàn tác"**. Không có chuyển đổi trạng thái nào khác.
- **BR-ID-DTL-002**: Xác nhận xuất kho (hoàn tất) chỉ thực hiện được khi phiếu ở trạng thái **"Chờ duyệt"**. Khi hoàn tất, hệ thống giảm tồn kho tương ứng với số lượng xuất của từng sản phẩm.
- **BR-ID-DTL-003**: Hủy phiếu chỉ thực hiện được khi phiếu ở trạng thái **"Chờ duyệt"**. Khi hủy, bắt buộc nhập lý do hủy.
- **BR-ID-DTL-004**: Hoàn tác phiếu chỉ thực hiện được khi phiếu ở trạng thái **"Đã duyệt"**. Khi hoàn tác, hệ thống tăng tồn kho trở lại tương ứng với số lượng xuất của từng sản phẩm.
- **BR-ID-DTL-005**: Nút **"Chỉnh sửa"** chỉ hiển thị khi phiếu ở trạng thái **"Chờ duyệt"**.
- **BR-ID-DTL-006**: Xác nhận xuất kho thực hiện kiểm tra đối chiếu với phiếu dịch vụ: phiếu dịch vụ phải tồn tại và không bị hủy, sản phẩm và số lượng phải khớp. Nếu không khớp, hệ thống trả kết quả với cờ cảnh báo (không chặn thao tác).

## 6. Edge Cases

- **EC-1**: Phiếu xuất kho đã bị hủy — màn hình chỉ hiển thị thông tin chi tiết, không hiển thị nút hành động nào (kể cả **"In phiếu"**). Phiếu hoàn tác — chỉ hiển thị **"In phiếu"** và **"Tạo phiếu"**.
- **EC-2**: Hoàn tác phiếu khi kỳ kho đã đóng — hệ thống vẫn cho phép hoàn tác và kích hoạt điều chỉnh tồn kho kỳ.
- **EC-3**: Phiếu xuất kho có sản phẩm đã bị xóa khỏi danh mục — thông tin sản phẩm vẫn hiển thị theo dữ liệu đã lưu tại thời điểm tạo phiếu.

## 7. Out of Scope

- Tạo phiếu xuất kho mới → xem `FEAT-ID-CREATE`.
- Chỉnh sửa phiếu xuất kho → xem `FEAT-ID-EDIT`.
- Danh sách phiếu xuất kho → xem `FEAT-ID-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-delivery-code detail screen, CompleteDelivery/CancelDelivery/ReverseDelivery mutations, delivery status lifecycle) |
| 2026-05-21 | 2 | Business Authority | Sửa AC-13 + EC-1: ẩn nút "In phiếu" ở trạng thái "Đã hủy" — phiếu đã hủy không được in. |
