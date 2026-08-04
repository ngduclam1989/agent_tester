---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-RECEIPT"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-IR-DETAIL: Chi tiết phiếu nhập kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IR-DETAIL` |
| Title | Chi tiết phiếu nhập kho |
| Parent Epic | `EP-INVENTORY-RECEIPT` |
| Boundary | `gf-inventory` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu nhập kho bao gồm thông tin phiếu, danh sách sản phẩm, tổng kết, ghi chú, tài liệu đính kèm và thực hiện các hành động duyệt, hủy, hoàn tác, in phiếu, **so that** tôi có thể kiểm tra thông tin và xử lý phiếu nhập kho theo quy trình.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết phiếu nhập kho

- [ ] **AC-1**: Hiển thị màn hình chi tiết phiếu nhập kho
  - Tại: màn hình Danh sách phiếu nhập kho.
  - Khi: chủ garage nhấn vào một phiếu nhập kho.
  - Thì: hệ thống chuyển sang màn hình chi tiết với tiêu đề **"Phiếu nhập kho"** kèm mã phiếu. Màn hình hiển thị các mục: Thông tin phiếu nhập kho, Danh sách sản phẩm nhập kho, Tổng kết, Ghi chú nội bộ, Tài liệu đính kèm.

- [ ] **AC-2**: Hiển thị mục thông tin phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, mục **"Thông tin phiếu nhập kho"**.
  - Khi: hệ thống tải dữ liệu chi tiết phiếu.
  - Thì: hệ thống hiển thị các trường thông tin:
    - **"Nguồn"** — nguồn nhập: **"Mua ngoài"** hoặc **"Nền tảng"**.
    - **"Liên kết PO"** — mã đơn hàng liên kết (nếu có).
    - **"Mã lô hàng"** — mã lô hàng (nếu có).
    - **"Tên nhà cung cấp"** — tên nhà cung cấp (nếu có).
    - **"Tạo phiếu"** — tên người tạo và ngày tạo.
    - **"Hoàn tất"** — tên người duyệt và ngày hoàn tất (hiển thị khi phiếu đã duyệt).

- [ ] **AC-3**: Hiển thị danh sách sản phẩm nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, mục **"Danh sách sản phẩm nhập kho"**.
  - Khi: hệ thống tải dữ liệu chi tiết phiếu.
  - Thì: hệ thống hiển thị bảng sản phẩm với các cột: **"Tên phụ tùng"**, **"Mã Genuine"**, **"Phân khúc"**, **"Xuất xứ"**, **"Đơn vị nhập"**, **"Quy đổi"**, **"Đơn vị kho"**, **"Số lượng"**, **"Số lượng nhập theo đơn vị nhập"**, **"Số lượng sau quy đổi"**, **"Số lượng sau quy đổi theo đơn vị kho"**, **"Giá nhập"**, **"Giá trên 1 đơn vị nhập"**, **"Giá bán gợi ý"**, **"Giá bán trên 1 đơn vị kho"**.

- [ ] **AC-4**: Hiển thị tổng kết
  - Tại: màn hình Chi tiết phiếu nhập kho, mục **"Tổng kết"**.
  - Khi: hệ thống tải dữ liệu chi tiết phiếu.
  - Thì: hệ thống hiển thị:
    - **"Tổng số sản phẩm"** — tổng số dòng sản phẩm trong phiếu.
    - **"Tổng giá trị phiếu nhập"** — tổng giá trị nhập kho.

- [ ] **AC-5**: Hiển thị ghi chú nội bộ
  - Tại: màn hình Chi tiết phiếu nhập kho, mục **"Ghi chú nội bộ"**.
  - Khi: hệ thống tải dữ liệu chi tiết phiếu.
  - Thì: hệ thống hiển thị nội dung ghi chú nội bộ (nếu có).

- [ ] **AC-6**: Hiển thị tài liệu đính kèm
  - Tại: màn hình Chi tiết phiếu nhập kho, mục **"Tài liệu đính kèm"**.
  - Khi: hệ thống tải dữ liệu chi tiết phiếu.
  - Thì: hệ thống hiển thị danh sách tệp đính kèm. Nếu có nhiều tệp, hiển thị nút **"Xem thêm"** / **"Thu gọn"** để mở rộng hoặc thu gọn danh sách.

- [ ] **AC-7**: Phiếu nhập kho không tồn tại
  - Tại: màn hình Chi tiết phiếu nhập kho.
  - Khi: mã phiếu nhập kho không tồn tại trong hệ thống.
  - Thì: hệ thống hiển thị thông báo **"Không tìm thấy phiếu nhập kho"**.

### Nhóm B — Nút hành động trên chi tiết

- [ ] **AC-8**: Nút chỉnh sửa phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa phiếu nhập kho (xem `FEAT-IR-EDIT`).
  - Khi: phiếu ở trạng thái khác **"Chờ duyệt"**.
  - Thì: nút **"Chỉnh sửa"** không hiển thị.

- [ ] **AC-9**: Nút hoàn tất (duyệt) phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Hoàn tất"**.
  - Thì: hệ thống hiển thị modal **"Xác nhận cập nhật trạng thái phiếu nhập kho"** với tiêu đề **"Xác nhận nhập kho"** và thông báo **"Vui lòng kiểm tra kỹ trước khi bấm xác nhận"**. Modal có hai nút: **"Hủy"** và **"Xác nhận"**.
  - Khi: chủ garage nhấn **"Xác nhận"** trên modal.
  - Thì: hệ thống duyệt phiếu nhập kho, chuyển trạng thái sang **"Đã duyệt"**, hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Xác nhận nhập kho thành công."**. Tồn kho được cập nhật tăng theo từng dòng sản phẩm trong phiếu.
  - Khi: chủ garage nhấn **"Hủy"** trên modal.
  - Thì: hệ thống đóng modal, giữ nguyên trạng thái phiếu.
  - Khi: phiếu ở trạng thái khác **"Chờ duyệt"**.
  - Thì: nút **"Hoàn tất"** không hiển thị.

- [ ] **AC-10**: Nút hủy phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, phiếu ở trạng thái **"Chờ duyệt"**.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống hiển thị modal **"Hủy phiếu nhập kho"** với câu hỏi **"Bạn chắc chắn muốn hủy phiếu nhập kho?"**, trường nhập **"Lý do hủy phiếu"** (placeholder: **"Nhập lý do hủy phiếu"**). Modal có hai nút: **"Hủy"** và **"Xác nhận"**.
  - Khi: chủ garage nhập lý do hủy và nhấn **"Xác nhận"** trên modal.
  - Thì: hệ thống hủy phiếu nhập kho, chuyển trạng thái sang **"Đã hủy"**, hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Hủy phiếu nhập kho thành công."**.
  - Khi: chủ garage nhấn **"Hủy"** trên modal.
  - Thì: hệ thống đóng modal, giữ nguyên trạng thái phiếu.
  - Khi: phiếu ở trạng thái khác **"Chờ duyệt"**.
  - Thì: nút **"Hủy"** không hiển thị.

- [ ] **AC-11**: Nút hoàn tác phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho, phiếu ở trạng thái **"Đã duyệt"**.
  - Khi: chủ garage nhấn nút **"Hoàn tác"**.
  - Thì: hệ thống hiển thị modal với câu hỏi **"Bạn chắc chắn muốn hoàn tác phiếu nhập kho?"**, trường nhập **"Lý do hoàn tác"** (placeholder: **"Nhập lý do hoàn tác"**). Modal có hai nút: **"Đóng"** và **"Xác nhận"**.
  - Khi: chủ garage nhập lý do hoàn tác và nhấn **"Xác nhận"** trên modal.
  - Thì: hệ thống hoàn tác phiếu nhập kho, chuyển trạng thái sang **"Hoàn tác"**, hiển thị toast với tiêu đề **"Thành công"**, mô tả **"Hoàn tác phiếu nhập kho thành công."**. Tồn kho được cập nhật giảm lại theo từng dòng sản phẩm trong phiếu.
  - Khi: chủ garage nhấn **"Đóng"** trên modal.
  - Thì: hệ thống đóng modal, giữ nguyên trạng thái phiếu.
  - Khi: phiếu ở trạng thái khác **"Đã duyệt"**.
  - Thì: nút **"Hoàn tác"** không hiển thị.

- [ ] **AC-12**: Nút in phiếu
  - Tại: màn hình Chi tiết phiếu nhập kho.
  - Khi: chủ garage nhấn nút **"In phiếu"**.
  - Thì: hệ thống xuất phiếu nhập kho dưới dạng PDF và mở bản in.

### Nhóm C — Ma trận nút hành động theo trạng thái

- [ ] **AC-13**: Ma trận hiển thị nút hành động
  - Tại: màn hình Chi tiết phiếu nhập kho.
  - Khi: hệ thống hiển thị chi tiết phiếu theo trạng thái.
  - Thì: các nút hành động hiển thị theo ma trận:

    | Trạng thái | Chỉnh sửa | Hoàn tất | Hủy | Hoàn tác | In phiếu |
    |---|---|---|---|---|---|
    | **"Chờ duyệt"** | Hiển thị | Hiển thị | Hiển thị | Ẩn | Hiển thị |
    | **"Đã duyệt"** | Ẩn | Ẩn | Ẩn | Hiển thị | Hiển thị |
    | **"Hoàn tác"** | Ẩn | Ẩn | Ẩn | Ẩn | Hiển thị |
    | **"Đã hủy"** | Ẩn | Ẩn | Ẩn | Ẩn | Ẩn |

### Nhóm D — Phân quyền

- [ ] **AC-14**: Phân quyền xem chi tiết và thao tác phiếu nhập kho
  - Tại: màn hình Chi tiết phiếu nhập kho.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết, duyệt, hủy, hoàn tác và in phiếu nhập kho. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-RECEIPT.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu nhập kho: Query `GetReceiptByCode`
- Duyệt (hoàn tất): Mutation `CompleteReceipts`
- Hủy: Mutation `CancelReceipts`
- Hoàn tác: Mutation `ReverseReceipts`

## 5. Business Rules

- **BR-IR-DTL-001**: Vòng đời trạng thái phiếu nhập kho: **"Chờ duyệt"** -> **"Đã duyệt"** / **"Đã hủy"**; **"Đã duyệt"** -> **"Hoàn tác"**. Không có chuyển trạng thái nào khác được phép.
- **BR-IR-DTL-002**: Khi duyệt (hoàn tất) phiếu nhập kho, hệ thống tăng tồn kho theo từng dòng sản phẩm (số lượng và giá vốn). Danh sách sản phẩm phải không rỗng để duyệt.
- **BR-IR-DTL-003**: Khi hoàn tác phiếu nhập kho đã duyệt, hệ thống giảm tồn kho trở lại theo từng dòng sản phẩm.
- **BR-IR-DTL-004**: Chỉ phiếu ở trạng thái **"Chờ duyệt"** mới cho phép chỉnh sửa, duyệt hoặc hủy. Chỉ phiếu ở trạng thái **"Đã duyệt"** mới cho phép hoàn tác.
- **BR-IR-DTL-005**: In phiếu khả dụng ở tất cả trạng thái trừ **"Đã hủy"**.

## 6. Edge Cases

- **EC-1**: Phiếu nhập kho không tồn tại (mã không hợp lệ hoặc đã bị xóa) — hiển thị thông báo **"Không tìm thấy phiếu nhập kho"**.
- **EC-2**: Hoàn tác phiếu đã duyệt khi kỳ kho đã đóng — hệ thống vẫn xử lý hoàn tác và tự động tạo điều chỉnh kho cho kỳ đã đóng.
- **EC-3**: Duyệt phiếu khi có sản phẩm chưa có trong kho — hệ thống tự động tạo bản ghi tồn kho mới cho sản phẩm.

## 7. Out of Scope

- Tạo phiếu nhập kho → xem `FEAT-IR-CREATE`.
- Chỉnh sửa phiếu nhập kho → xem `FEAT-IR-EDIT`.
- Danh sách phiếu nhập kho → xem `FEAT-IR-LIST`.
- Quản lý tồn kho và điều chỉnh kho → thuộc `EP-INVENTORY-PERIOD`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory + garage-web (inventory-receipt-code detail screen, CompleteReceipts/CancelReceipts/ReverseReceipts mutations, ma trận nút hành động theo trạng thái, modal xác nhận/hủy/hoàn tác) |
| 2026-05-21 | 2 | Business Authority | Sửa AC-13 + BR-IR-DTL-005: ẩn nút "In phiếu" ở trạng thái "Đã hủy" — phiếu đã hủy không được in. |
