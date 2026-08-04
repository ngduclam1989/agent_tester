---
type: feature
artifact_kind: feature
status: DONE
version: 4
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-IR-CREATE: Tạo phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-CREATE` |
| Title | Tạo phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phiếu nhập kho để ghi nhận hàng hóa, phụ tùng nhập về kho bao gồm thông tin nguồn nhập, đơn hàng, danh sách sản phẩm và tệp đính kèm, **so that** tôi có thể theo dõi và quản lý tồn kho chính xác.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form tạo phiếu nhập kho

- [ ] **AC-1**: Mở màn hình tạo phiếu nhập kho
  - Tại: màn hình Danh sách phiếu nhập kho.
  - Khi: chủ garage nhấn nút **"Tạo phiếu nhập kho mới"**.
  - Thì: hệ thống chuyển sang màn hình **"Tạo phiếu nhập kho"** với form trống, gồm 4 mục: Thông tin phiếu nhập kho, Danh sách sản phẩm nhập kho, Tệp đính kèm, Ghi chú.

### Nhóm B — Mục: Thông tin phiếu nhập kho

- [ ] **AC-2**: Nguồn nhập phiếu tạo thủ công
  - Tại: form **"Tạo phiếu nhập kho"**.
  - Khi: chủ garage tạo phiếu nhập kho qua form.
  - Thì: form không hiển thị trường chọn nguồn nhập. Nguồn nhập (**"Mua ngoài"** hoặc **"Nền tảng"**) được kế thừa tự động từ đơn hàng mua liên kết — khi chủ garage nhập mã đơn hàng, hệ thống kế thừa nguồn nhập từ đơn hàng mua đó.

- [ ] **AC-3**: Nhập mã đơn hàng
  - Tại: mục **"Thông tin phiếu nhập kho"**, trường **"Mã đơn hàng"**.
  - Khi: chủ garage nhập mã đơn hàng.
  - Thì: hệ thống hiển thị ô nhập. Placeholder: **"Nhập mã đơn hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập mã đơn hàng."**.

- [ ] **AC-4**: Nhập mã lô hàng
  - Tại: mục **"Thông tin phiếu nhập kho"**, trường **"Mã lô hàng"**.
  - Khi: chủ garage nhập mã lô hàng.
  - Thì: hệ thống hiển thị ô nhập. Placeholder: **"Nhập mã lô hàng"**. Trường này không bắt buộc.

### Nhóm C — Mục: Danh sách sản phẩm nhập kho

- [ ] **AC-5**: Thêm dòng sản phẩm
  - Tại: mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage thêm dòng sản phẩm mới.
  - Thì: hệ thống hiển thị dòng mới trong bảng với các cột:
    - **"Tên phụ tùng"** — ô chọn/nhập có gợi ý từ danh mục sản phẩm.
    - **"Mã Genuine"** — hiển thị tự động theo sản phẩm đã chọn.
    - **"Phân khúc"** — ô chọn. Placeholder: **"Chọn"**.
    - **"Xuất xứ"** — hiển thị tự động theo sản phẩm đã chọn.
    - **"Đơn vị nhập"** — ô nhập/chọn.
    - **"Quy đổi"** — ô nhập số (tỷ lệ quy đổi từ đơn vị nhập sang đơn vị kho).
    - **"Đơn vị kho"** — ô nhập/chọn. Bắt buộc.
    - **"Số lượng"** — ô nhập số (số lượng nhập theo đơn vị nhập). Bắt buộc.
    - **"Số lượng nhập theo đơn vị nhập"** — hiển thị tự động.
    - **"Số lượng sau quy đổi"** — tính tự động = Số lượng x Quy đổi.
    - **"Số lượng sau quy đổi theo đơn vị kho"** — hiển thị tự động.
    - **"Giá nhập"** — ô nhập số (giá trên 1 đơn vị nhập).
    - **"Giá trên 1 đơn vị nhập"** — hiển thị tự động.
    - **"Giá bán gợi ý"** — ô nhập số.
    - **"Giá bán trên 1 đơn vị kho"** — hiển thị tự động.
    - **"Thao tác"** — nút xóa dòng.
  - Cho phép thêm nhiều dòng sản phẩm.

- [ ] **AC-6**: Xóa dòng sản phẩm
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa dòng trên một dòng sản phẩm.
  - Thì: hệ thống xóa dòng sản phẩm khỏi bảng và cập nhật lại **"Tổng giá trị:"**.

- [ ] **AC-7**: Validation danh sách sản phẩm
  - Tại: mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage gửi form mà chưa thêm sản phẩm nào.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng thêm ít nhất một sản phẩm."**.
  - Khi: chủ garage gửi form mà có dòng sản phẩm chưa điền đủ thông tin bắt buộc (tên, số lượng, đơn vị kho).
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đầy đủ thông tin sản phẩm (tên, số lượng, đơn vị kho)."**.

- [ ] **AC-8**: Validation số lượng nhập
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Số lượng"**.
  - Khi: chủ garage nhập số lượng cho dòng sản phẩm.
  - Thì: hệ thống chỉ chấp nhận giá trị lớn hơn hoặc bằng 0. Nếu bỏ trống, hiển thị thông báo lỗi: **"Vui lòng nhập số lượng."**. Nếu nhập giá trị âm, hiển thị thông báo lỗi: **"Số lượng phải lớn hơn hoặc bằng 0."**.

- [ ] **AC-9**: Validation đơn vị kho
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Đơn vị kho"**.
  - Khi: chủ garage bỏ trống đơn vị kho và gửi form.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập đơn vị kho."**.

- [ ] **AC-10**: Validation tỷ lệ quy đổi
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Quy đổi"**.
  - Khi: chủ garage nhập tỷ lệ quy đổi bằng 0 hoặc âm.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tỷ lệ quy đổi lớn hơn 0"**.

- [ ] **AC-11**: Validation giá bán gợi ý
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Giá bán gợi ý"**.
  - Khi: chủ garage nhập giá bán gợi ý âm.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập giá đề xuất lớn hơn hoặc bằng 0"**.

- [ ] **AC-12**: Validation số lượng nhập không vượt quá số lượng đặt hàng
  - Tại: mục **"Danh sách sản phẩm nhập kho"**, cột **"Số lượng"**, khi phiếu nhập kho có nguồn **"Nền tảng"** và liên kết với đơn hàng.
  - Khi: chủ garage nhập số lượng vượt quá số lượng đặt hàng từ đơn hàng tương ứng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số lượng nhập không được vượt quá số lượng đặt hàng."**.

- [ ] **AC-13**: Hiển thị tổng giá trị
  - Tại: cuối mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: chủ garage đã thêm sản phẩm.
  - Thì: hệ thống tự động tính và hiển thị **"Tổng giá trị:"** = tổng giá nhập của tất cả dòng sản phẩm.

### Nhóm D — Mục: Tệp đính kèm

- [ ] **AC-14**: Tải tệp đính kèm
  - Tại: mục **"Tệp đính kèm"**.
  - Khi: chủ garage nhấn **"Nhấn để tải lên"**.
  - Thì: hệ thống cho phép tải lên tệp đính kèm. **"Hỗ trợ file: .doc, .jpeg, .png, .xlxs, .pdf"**. Trường này không bắt buộc.

### Nhóm E — Mục: Ghi chú

- [ ] **AC-15**: Nhập ghi chú
  - Tại: mục **"Ghi chú"**, trường ghi chú.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

### Nhóm F — Nút hành động trên form

- [ ] **AC-16**: Điều kiện nút tạo phiếu nhập kho
  - Tại: cuối form tạo phiếu nhập kho, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Mã đơn hàng, ít nhất một sản phẩm với tên, số lượng, đơn vị kho) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái bị mờ (disabled).

- [ ] **AC-17**: Hủy bỏ tạo phiếu nhập kho
  - Tại: form tạo phiếu nhập kho, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form tạo phiếu nhập kho và quay về màn hình Danh sách phiếu nhập kho. Dữ liệu đã nhập trên form không được lưu.

### Nhóm G — Phân quyền

- [ ] **AC-18**: Phân quyền tạo phiếu nhập kho
  - Tại: màn hình Danh sách phiếu nhập kho.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo phiếu nhập kho và có quyền tạo phiếu nhập kho.

### Nhóm H — Xử lý lỗi và trạng thái sau tạo

- [ ] **AC-19**: Tạo phiếu nhập kho thành công
  - Tại: form tạo phiếu nhập kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo phiếu nhập kho thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Tạo phiếu nhập kho thành công."**. Phiếu nhập kho được tạo với trạng thái **"Chờ duyệt"**. Mã phiếu nhập kho được hệ thống tự sinh. Hệ thống chuyển về màn hình chi tiết phiếu nhập kho vừa tạo.

- [ ] **AC-20**: Tạo phiếu nhập kho thất bại
  - Tại: form tạo phiếu nhập kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo phiếu nhập kho thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-21**: Validation form thất bại
  - Tại: form tạo phiếu nhập kho, sau khi nhấn nút **"Tạo mới"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-3 đến AC-12) và không gửi yêu cầu lên hệ thống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-RECEIPT.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Tạo phiếu nhập kho: Mutation `CreateReceipts`
- Lấy thông tin đơn hàng: Query `GetPurchaseOrderForReceipt`
- Tìm sản phẩm: Query `SearchProducts`, `SearchGroupedProductApiResponse`

## 5. Business Rules

- **BR-IR-CRE-001**: Phiếu nhập kho được tạo với trạng thái khởi tạo là **"Chờ duyệt"**. Mã phiếu nhập kho được hệ thống tự sinh, không cho phép nhập thủ công.
- **BR-IR-CRE-002**: Nguồn nhập (**"Mua ngoài"** / **"Nền tảng"**) kế thừa từ đơn hàng mua liên kết — form không có trường chọn nguồn. Cho phép chỉnh sửa các trường sản phẩm (phân khúc, thông tin bổ sung). Ngoài tạo thủ công qua form, hệ thống cũng tự động tạo phiếu nhập kho khi đơn hàng mua chuyển sang **"Đang giao hàng"** (xem `FEAT-PO-DETAIL`).
- **BR-IR-CRE-003**: Danh sách sản phẩm nhập kho phải có ít nhất một dòng sản phẩm với đầy đủ thông tin bắt buộc (tên, số lượng, đơn vị kho) mới cho phép tạo phiếu.
- **BR-IR-CRE-004**: Số lượng nhập trên mỗi dòng sản phẩm phải lớn hơn hoặc bằng 0. Khi nguồn nhập là **"Nền tảng"**, số lượng nhập không được vượt quá số lượng đặt hàng từ đơn hàng tương ứng.
- **BR-IR-CRE-005**: Tỷ lệ quy đổi phải lớn hơn 0. Số lượng sau quy đổi = Số lượng nhập x Tỷ lệ quy đổi.
- **BR-IR-CRE-006**: Giá bán gợi ý phải lớn hơn hoặc bằng 0.

## 6. Edge Cases

- **EC-1**: Sản phẩm mới chưa có trong danh mục — cho phép tạo nhanh sản phẩm từ form nhập kho.
- **EC-2**: Đơn hàng không tồn tại hoặc không hợp lệ — hệ thống hiển thị lỗi khi tra cứu mã đơn hàng.
- **EC-3**: Nguồn **"Mua ngoài"** — mã đơn hàng vẫn bắt buộc (AC-3), nhưng sản phẩm được nhập thủ công (không kéo từ đơn hàng), cho phép chỉnh sửa phân khúc và thông tin bổ sung.

## 7. Out of Scope

- Xem chi tiết phiếu nhập kho sau khi tạo → xem `FEAT-IR-DETAIL`.
- Chỉnh sửa phiếu nhập kho → xem `FEAT-IR-EDIT`.
- Duyệt (hoàn tất) phiếu nhập kho → xem `FEAT-IR-DETAIL`.
- Hủy phiếu nhập kho → xem `FEAT-IR-DETAIL`.
- Quản lý danh mục sản phẩm → thuộc `EP-CATALOG`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-receipt-create screen, CreateReceipts mutation, 2 nguồn nhập, bảng sản phẩm chi tiết với quy đổi đơn vị, validation schema) |
| 2026-05-20 | 2 | Business Authority | Sửa AC-2: form tạo thủ công không có trường chọn nguồn — luôn tạo "Mua ngoài". "Nền tảng" chỉ auto-create từ PO. Cập nhật AC-16, BR-IR-CRE-002. |
| 2026-05-21 | 3 | Business Authority | Sửa EC-3: làm rõ nguồn "Mua ngoài" vẫn yêu cầu mã đơn hàng (theo AC-3) nhưng sản phẩm nhập thủ công — khớp với KG BR-008. |
| 2026-05-21 | 4 | Business Authority | Sửa AC-2, BR-IR-CRE-002: nguồn nhập kế thừa từ đơn hàng mua liên kết (không phải "luôn Mua ngoài"). Cả hai nguồn đều tạo thủ công được — tùy nguồn của PO liên kết. |
