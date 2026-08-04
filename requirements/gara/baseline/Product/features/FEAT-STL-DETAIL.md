---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-SETTLEMENT"
boundary: "gf-accounting"
last_reviewed: "2026-05-27"
---

# FEAT-STL-DETAIL: Chi tiết phiếu quyết toán

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STL-DETAIL` |
| Title | Chi tiết phiếu quyết toán |
| Parent Epic | `EP-SETTLEMENT` |
| Boundary | `gf-accounting` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết phiếu quyết toán bao gồm thông tin khách hàng, dịch vụ, phụ tùng, tổng tiền và tài liệu đính kèm, **so that** tôi nắm được nội dung quyết toán và có thể in/xuất chứng từ.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết phiếu quyết toán
  - Tại: màn hình Danh sách phiếu quyết toán.
  - Khi: chủ garage nhấn vào dòng phiếu quyết toán trong bảng.
  - Thì: hệ thống chuyển sang màn hình chi tiết phiếu quyết toán. Màn hình gồm ba tab: **"Bảng chi phí"**, **"Chứng từ & hóa đơn"** và **"Lịch sử thanh toán"**. Tab **"Bảng chi phí"** được chọn mặc định.

- [ ] **AC-2**: Hiển thị mục Thông tin quyết toán
  - Tại: màn hình Chi tiết phiếu quyết toán, phần thông tin tổng quan.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán.
  - Thì: hiển thị mục **"Thông tin quyết toán"** với các trường ở trạng thái chỉ đọc: **"Phiếu dịch vụ liên kết"**, **"Tổng Tiền"**, **"Còn lại"**, **"Người tạo"**, **"Ngày tạo"**, **"Cập nhật lần cuối"**.

- [ ] **AC-3**: Hiển thị mục Ghi chú quyết toán
  - Tại: màn hình Chi tiết phiếu quyết toán, phần thông tin tổng quan.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán.
  - Thì: hiển thị trường **"Ghi chú quyết toán"**. Ở chế độ xem: hiển thị nội dung ghi chú chỉ đọc. Placeholder khi chưa có ghi chú: **"Nhập ghi chú quyết toán"**.

- [ ] **AC-4**: Hiển thị mục Thông tin khách hàng & xe
  - Tại: màn hình Chi tiết phiếu quyết toán, phần thông tin tổng quan.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán.
  - Thì: hiển thị mục **"Thông tin khách hàng & xe"** với các trường ở trạng thái chỉ đọc: **"Tên khách hàng"**, **"Số điện thoại"**, **"Loại khách hàng"**, **"Biển số xe"**, **"Hãng xe"**, **"Dòng xe"**, **"Số km đã chạy"**.

- [ ] **AC-5**: Hiển thị mục Thông tin bảo hiểm (phiếu bảo hiểm)
  - Tại: màn hình Chi tiết phiếu quyết toán, phần thông tin tổng quan.
  - Khi: phiếu quyết toán có bên thanh toán là **"Bảo hiểm"**.
  - Thì: hiển thị thông tin bảo hiểm với các trường ở trạng thái chỉ đọc: **"Đơn vị thanh toán"**, **"Công ty bảo hiểm"**, **"Số hợp đồng bảo hiểm"**, **"Người giám định"**, **"SĐT Liên hệ"**, **"Mã số thuế bảo hiểm"**, **"Ngày hết hạn"**, **"Hồ sơ bảo lãnh"**.
  - Khi: phiếu quyết toán có bên thanh toán là **"Khách hàng"**.
  - Thì: mục thông tin bảo hiểm không hiển thị.

### Nhóm B — Tab Bảng chi phí

- [ ] **AC-6**: Hiển thị tab Bảng chi phí
  - Tại: màn hình Chi tiết phiếu quyết toán, tab **"Bảng chi phí"**.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán.
  - Thì: hệ thống hiển thị mục **"Chi tiết chi phí"** gồm:
    - Bảng **"Dịch vụ thực hiện"** với các cột: **"Tên dịch vụ"**, **"Bên thanh toán"** (hiển thị **"Khách hàng"** hoặc **"Bảo hiểm"**), **"Người thực hiện"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Tổng"**.
    - Bảng **"Phụ tùng sử dụng"** với các cột: **"Tên phụ tùng"**, **"Phân khúc"**, **"Đơn vị tính"**, **"Đơn giá"**, **"Số lượng"**, **"Chiết khấu"**, **"Thuế"**, **"Thành tiền"**, **"Thành tiền phụ tùng"**.

- [ ] **AC-7**: Hiển thị tổng chi phí
  - Tại: tab **"Bảng chi phí"**, mục **"Tổng chi phí"**.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán.
  - Thì: hiển thị các trường tổng: **"Tổng thành tiền dịch vụ"**, **"Tổng thành tiền phụ tùng"**, **"Tổng thành tiền"**, **"Dịch vụ + Phụ tùng"**. Tất cả ở trạng thái chỉ đọc.

### Nhóm C — Tab Chứng từ & hóa đơn

- [ ] **AC-8**: Hiển thị tab Chứng từ & hóa đơn
  - Tại: màn hình Chi tiết phiếu quyết toán.
  - Khi: chủ garage nhấn tab **"Chứng từ & hóa đơn"**.
  - Thì: hệ thống hiển thị danh sách chứng từ và hóa đơn đã đính kèm. Cho phép **"Upload file chứng từ / hóa đơn"** khi ở chế độ chỉnh sửa.

- [ ] **AC-9**: Chưa có chứng từ
  - Tại: tab **"Chứng từ & hóa đơn"**.
  - Khi: phiếu quyết toán chưa có chứng từ hoặc hóa đơn nào.
  - Thì: hệ thống hiển thị thông báo: **"Chưa có chứng từ & hóa đơn"**.

### Nhóm D — Tab Lịch sử thanh toán

- [ ] **AC-10**: Hiển thị tab Lịch sử thanh toán
  - Tại: màn hình Chi tiết phiếu quyết toán.
  - Khi: chủ garage nhấn tab **"Lịch sử thanh toán"**.
  - Thì: hệ thống hiển thị bảng lịch sử thanh toán với các cột: **"Mã thanh toán"**, **"Ngày thanh toán"**, **"Số tiền"**, **"Phương thức"**, **"Ghi chú"**, **"Đã thanh toán"**, **"Còn lại"**.

- [ ] **AC-11**: Chưa có lịch sử thanh toán
  - Tại: tab **"Lịch sử thanh toán"**.
  - Khi: phiếu quyết toán chưa có giao dịch thanh toán nào.
  - Thì: hệ thống hiển thị thông báo: **"Chưa có lịch sử thanh toán"**.

### Nhóm E — Nút hành động

- [ ] **AC-12**: Nút In phiếu quyết toán
  - Tại: màn hình Chi tiết phiếu quyết toán, trạng thái **"Hoạt động"**.
  - Khi: chủ garage nhấn nút **"In phiếu"** hoặc **"In phiếu quyết toán"**.
  - Thì: hệ thống mở bản xem trước in phiếu quyết toán. Nội dung in chỉ bao gồm các hạng mục theo bên thanh toán tương ứng: phiếu **"Khách hàng"** chỉ in hạng mục khách hàng chi trả; phiếu **"Bảo hiểm"** chỉ in hạng mục bảo hiểm chi trả. Tổng tiền được hiển thị bằng chữ tiếng Việt.

- [ ] **AC-13**: Nút Chỉnh sửa
  - Tại: màn hình Chi tiết phiếu quyết toán, trạng thái **"Hoạt động"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển màn hình sang chế độ chỉnh sửa. Cho phép sửa trường **"Ghi chú quyết toán"** và quản lý chứng từ trong tab **"Chứng từ & hóa đơn"** (thêm mới, xóa). Các thông tin khác (dịch vụ, phụ tùng, tổng tiền, thông tin khách hàng) không được phép sửa.

- [ ] **AC-14**: Lưu chỉnh sửa phiếu quyết toán
  - Tại: màn hình Chi tiết phiếu quyết toán, chế độ chỉnh sửa.
  - Khi: chủ garage nhấn nút **"Lưu"** sau khi sửa ghi chú hoặc chứng từ.
  - Thì: hệ thống lưu thay đổi và hiển thị toast với tiêu đề **"Hóa đơn thanh toán"** và mô tả **"Cập nhật phiếu quyết toán thành công"**. Chế độ chỉnh sửa đóng, quay về chế độ xem.

- [ ] **AC-15**: Hủy chỉnh sửa
  - Tại: màn hình Chi tiết phiếu quyết toán, chế độ chỉnh sửa.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hệ thống bỏ qua các thay đổi chưa lưu và quay về chế độ xem.

- [ ] **AC-16**: Nút Hủy phiếu quyết toán — hiển thị modal xác nhận
  - Tại: màn hình Chi tiết phiếu quyết toán, trạng thái **"Hoạt động"**.
  - Khi: chủ garage nhấn hành động hủy phiếu quyết toán.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Xác nhận hủy quyết toán"** và nội dung: **"Bạn có chắc chắn muốn hủy phiếu quyết toán này không? Hệ thống sẽ mở lại Phiếu dịch vụ gốc để bạn có thể chỉnh sửa."**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**.

- [ ] **AC-17**: Xác nhận hủy phiếu quyết toán
  - Tại: modal xác nhận hủy quyết toán.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống hủy toàn bộ phiếu quyết toán cùng mã phiếu dịch vụ (nếu có cặp khách hàng/bảo hiểm thì hủy cả cặp). Trạng thái phiếu quyết toán chuyển sang **"Đã hủy"**. Phiếu dịch vụ liên kết được mở lại từ trạng thái đã quyết toán về trạng thái trước quyết toán.

- [ ] **AC-18**: Hủy phiếu quyết toán bị chặn khi đã có thanh toán
  - Tại: modal xác nhận hủy quyết toán.
  - Khi: chủ garage nhấn nút **"Xác nhận"** nhưng phiếu dịch vụ liên kết đã có giao dịch thanh toán.
  - Thì: hệ thống từ chối hủy và hiển thị thông báo: **"Không thể hủy vì đã có phát sinh thanh toán."**

- [ ] **AC-19**: Đóng modal hủy
  - Tại: modal xác nhận hủy quyết toán.
  - Khi: chủ garage nhấn nút **"Đóng"**.
  - Thì: hệ thống đóng modal, quay về màn hình chi tiết. Phiếu quyết toán không bị thay đổi.

- [ ] **AC-20**: Nút hành động ẩn khi phiếu đã hủy
  - Tại: màn hình Chi tiết phiếu quyết toán, trạng thái **"Đã hủy"**.
  - Khi: hệ thống tải xong dữ liệu phiếu quyết toán đã hủy.
  - Thì: các nút **"Chỉnh sửa"**, hủy phiếu quyết toán, và **"Thêm thanh toán"** không hiển thị. Chỉ hiển thị nút **"In phiếu"** (nếu có).

### Nhóm F — Phân quyền

- [ ] **AC-21**: Phân quyền xem chi tiết và thao tác phiếu quyết toán
  - Tại: màn hình Chi tiết phiếu quyết toán.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết, chỉnh sửa ghi chú/chứng từ, hủy phiếu quyết toán và in phiếu. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm G — Xử lý lỗi

- [ ] **AC-22**: Tải dữ liệu chi tiết thất bại
  - Tại: màn hình Chi tiết phiếu quyết toán.
  - Khi: hệ thống không tải được dữ liệu phiếu quyết toán (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi.

- [ ] **AC-23**: Lưu chỉnh sửa thất bại
  - Tại: màn hình Chi tiết phiếu quyết toán, chế độ chỉnh sửa, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống lưu thất bại do lỗi.
  - Thì: hệ thống hiển thị thông báo lỗi. Chế độ chỉnh sửa giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-SETTLEMENT.

## 4. API Reference

- Boundary: `gf-accounting` (qua BFF `agg-garage-graph`)
- Chi tiết phiếu quyết toán: Query `GetSettlementByCode`
- Cập nhật phiếu quyết toán: Mutation `UpdateSettlement`
- Hủy phiếu quyết toán: Mutation `CancelSettlement`

## 5. Business Rules

- **BR-STL-DTL-001**: Thông tin phiếu quyết toán trên màn hình chi tiết luôn được phạm vi theo garage hiện tại — không hiển thị phiếu quyết toán của garage khác.
- **BR-STL-DTL-002**: Hủy phiếu quyết toán sẽ hủy toàn bộ phiếu quyết toán cùng mã phiếu dịch vụ (bao gồm cả phiếu liên kết trong cặp khách hàng/bảo hiểm) và mở lại phiếu dịch vụ từ trạng thái đã quyết toán.
- **BR-STL-DTL-003**: Mở lại phiếu dịch vụ từ trạng thái đã quyết toán bị chặn nếu phiếu dịch vụ đã có giao dịch thanh toán.
- **BR-STL-DTL-004**: Cập nhật phiếu quyết toán chỉ cho phép thay đổi ghi chú và đồng bộ chứng từ. Chứng từ được đồng bộ theo đường dẫn file: đường dẫn không có trong yêu cầu cập nhật sẽ bị xóa mềm, đường dẫn mới sẽ được thêm.
- **BR-STL-DTL-005**: In phiếu quyết toán chỉ hiển thị các hạng mục theo bên thanh toán tương ứng: phiếu **"Khách hàng"** chỉ in hạng mục khách hàng chi trả; phiếu **"Bảo hiểm"** chỉ in hạng mục bảo hiểm chi trả. Tổng tiền được hiển thị bằng chữ tiếng Việt.
- **BR-STL-DTL-006**: Mô hình trạng thái phiếu quyết toán chỉ có nháp và đã hủy. Không có trạng thái phê duyệt hay thanh toán trên phiếu quyết toán — vòng đời thanh toán thuộc phiếu dịch vụ.

## 6. Edge Cases

- **EC-1**: Phiếu quyết toán thuộc cặp (có phiếu liên kết) — khi hủy, hệ thống hủy cả cặp cùng lúc.
- **EC-2**: Phiếu quyết toán đã hủy — các nút hành động (chỉnh sửa, hủy, thêm thanh toán) không hiển thị.
- **EC-3**: Phiếu quyết toán chưa có chứng từ — tab **"Chứng từ & hóa đơn"** hiển thị: **"Chưa có chứng từ & hóa đơn"**.
- **EC-4**: Phiếu quyết toán chưa có lịch sử thanh toán — tab **"Lịch sử thanh toán"** hiển thị: **"Chưa có lịch sử thanh toán"**.
- **EC-5**: Hủy bị chặn do đã có thanh toán — hệ thống hiển thị: **"Không thể hủy vì đã có phát sinh thanh toán."** và không thực hiện hủy.
- **EC-6**: Trường thông tin tùy chọn không có dữ liệu (ví dụ: ghi chú, thông tin bảo hiểm) — hiển thị trống hoặc placeholder tương ứng.

## 7. Out of Scope

- Tạo phiếu quyết toán → xem `FEAT-STL-CREATE`.
- Danh sách phiếu quyết toán → xem `FEAT-STL-LIST`.
- Thanh toán phiếu dịch vụ (thêm giao dịch thanh toán) → thuộc `FEAT-SO-DETAIL` (EP-SERVICE-ORDER).
- Quản lý trạng thái phiếu dịch vụ → thuộc `EP-SERVICE-ORDER`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-accounting + garage-web (settlement-voucher-code screen, 3 tabs: bảng chi phí/chứng từ & hóa đơn/lịch sử thanh toán, GetSettlementByCode/UpdateSettlement/CancelSettlement, cancel modal, print) |
