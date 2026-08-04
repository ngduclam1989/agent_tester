---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-VEHICLE"
boundary: "gf-customer"
last_reviewed: "2026-05-27"
---

# FEAT-VEH-DETAIL: Chi tiết xe

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-VEH-DETAIL` |
| Title | Chi tiết xe |
| Parent Epic | `EP-VEHICLE` |
| Boundary | `gf-customer` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết thông tin xe bao gồm tổng quan, dịch vụ đã thực hiện, phụ tùng đã thay và ghi chú kỹ thuật, **so that** tôi nắm được toàn bộ lịch sử sửa chữa và tình trạng xe.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin xe

- [ ] **AC-1**: Hiển thị màn hình chi tiết xe
  - Tại: màn hình Danh sách xe hoặc từ liên kết xe trong hệ thống.
  - Khi: chủ garage nhấn vào dòng xe trong bảng.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết xe"**. Màn hình gồm phần header **"Thông tin xe"**, phần thống kê tổng quan, và 4 tab: **"Tổng quan"**, **"Dịch vụ đã thực hiện"**, **"Phụ tùng đã thay"**, **"Ghi chú kỹ thuật"**. Tab **"Tổng quan"** được chọn mặc định.

- [ ] **AC-2**: Hiển thị header Thông tin xe
  - Tại: màn hình Chi tiết xe, phần header **"Thông tin xe"**.
  - Khi: hệ thống tải xong dữ liệu xe.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Biển số"**, **"Số máy"**, **"Hãng xe"**, **"Dòng xe"**, **"Phiên bản"**, **"Năm sản xuất"**, **"Số Km gần nhất"**.

- [ ] **AC-3**: Hiển thị phần thống kê tổng quan
  - Tại: màn hình Chi tiết xe, phần thống kê.
  - Khi: hệ thống tải xong dữ liệu xe.
  - Thì: hiển thị các chỉ số: **"Tổng chi tiêu cho xe"**, **"Số lần đến Garage"**, **"Cập nhật gần nhất"**.

### Nhóm B — Tab Tổng quan

- [ ] **AC-4**: Hiển thị tab Tổng quan
  - Tại: màn hình Chi tiết xe, tab **"Tổng quan"**.
  - Khi: chủ garage xem tab Tổng quan (mặc định khi vào màn hình).
  - Thì: hệ thống hiển thị bảng **"5 phiếu dịch vụ gần nhất"** với các cột: **"Mã phiếu DV"**, **"Ngày thực hiện"**, **"Khách hàng"**, **"Số điện thoại"**, **"Bảo hiểm"**, **"Trạng thái"**.

- [ ] **AC-5**: Giá trị cột Bảo hiểm
  - Tại: tab **"Tổng quan"**, bảng 5 phiếu dịch vụ gần nhất, cột **"Bảo hiểm"**.
  - Khi: hệ thống tải xong dữ liệu phiếu dịch vụ.
  - Thì: cột **"Bảo hiểm"** hiển thị giá trị **"Không"** hoặc **"Chưa rõ"** tùy theo dữ liệu phiếu dịch vụ.

- [ ] **AC-6**: Tab Tổng quan trống
  - Tại: tab **"Tổng quan"**, bảng 5 phiếu dịch vụ gần nhất.
  - Khi: xe chưa có phiếu dịch vụ nào.
  - Thì: hệ thống hiển thị thông báo: **"Xe này chưa có phiếu dịch vụ nào."**.

### Nhóm B2 — Tab Dịch vụ đã thực hiện

- [ ] **AC-7**: Hiển thị tab Dịch vụ đã thực hiện
  - Tại: màn hình Chi tiết xe.
  - Khi: chủ garage nhấn tab **"Dịch vụ đã thực hiện"**.
  - Thì: hệ thống hiển thị bảng với các cột: **"Hạng mục DV/PT"**, **"Ngày hoàn thành"**, **"Người thực hiện"**, **"ĐVT"**, **"Thời gian"**, **"Phiếu dịch vụ"**.

- [ ] **AC-8**: Tìm kiếm trong tab Dịch vụ đã thực hiện
  - Tại: tab **"Dịch vụ đã thực hiện"**.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc kết quả theo từ khóa. Placeholder ô tìm kiếm: **"Tìm kiếm tên dịch vụ, mã phiếu DV"**.

- [ ] **AC-9**: Tab Dịch vụ đã thực hiện trống
  - Tại: tab **"Dịch vụ đã thực hiện"**.
  - Khi: xe chưa có dịch vụ đã thực hiện nào.
  - Thì: hệ thống hiển thị thông báo: **"Chưa có dịch vụ đã thực hiện."**.

### Nhóm B3 — Tab Phụ tùng đã thay

- [ ] **AC-10**: Hiển thị tab Phụ tùng đã thay
  - Tại: màn hình Chi tiết xe.
  - Khi: chủ garage nhấn tab **"Phụ tùng đã thay"**.
  - Thì: hệ thống hiển thị bảng với các cột: **"Tên phụ tùng"**, **"Ngày thay"**, **"Phiếu dịch vụ"**, **"Số Km lúc thay"**, **"SL"**, **"Thời gian"**.

- [ ] **AC-11**: Tìm kiếm trong tab Phụ tùng đã thay
  - Tại: tab **"Phụ tùng đã thay"**.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc kết quả theo từ khóa. Placeholder ô tìm kiếm: **"Tìm kiếm tên phụ tùng, phiếu dịch vụ"**.

- [ ] **AC-12**: Tab Phụ tùng đã thay trống
  - Tại: tab **"Phụ tùng đã thay"**.
  - Khi: xe chưa có phụ tùng đã thay nào.
  - Thì: hệ thống hiển thị thông báo: **"Chưa có phụ tùng đã thay."**.

### Nhóm B4 — Tab Ghi chú kỹ thuật

- [ ] **AC-13**: Hiển thị tab Ghi chú kỹ thuật
  - Tại: màn hình Chi tiết xe.
  - Khi: chủ garage nhấn tab **"Ghi chú kỹ thuật"**.
  - Thì: hệ thống hiển thị danh sách ghi chú kỹ thuật được tổng hợp từ các phiếu dịch vụ liên kết với xe. Mỗi ghi chú hiển thị cột **"Phiếu DV liên kết"**. Phần mô tả tab: **"Ghi chú được tổng hợp từ các phiếu dịch vụ liên kết với xe. Nhấn vào mã phiếu DV để xem đầy đủ ngữ cảnh tại nguồn"**.

- [ ] **AC-14**: Nhấn vào mã phiếu DV trong tab Ghi chú kỹ thuật
  - Tại: tab **"Ghi chú kỹ thuật"**, cột **"Phiếu DV liên kết"**.
  - Khi: chủ garage nhấn vào mã phiếu DV.
  - Thì: hệ thống điều hướng đến màn hình chi tiết phiếu dịch vụ tương ứng.

- [ ] **AC-15**: Tab Ghi chú kỹ thuật trống
  - Tại: tab **"Ghi chú kỹ thuật"**.
  - Khi: xe chưa có ghi chú kỹ thuật nào.
  - Thì: hệ thống hiển thị thông báo: **"Chưa có ghi chú kỹ thuật."**.

- [ ] **AC-16**: Trạng thái đang tải dữ liệu tab Ghi chú kỹ thuật
  - Tại: tab **"Ghi chú kỹ thuật"**.
  - Khi: hệ thống đang tải dữ liệu ghi chú.
  - Thì: hệ thống hiển thị thông báo: **"Đang tải dữ liệu..."**.

### Nhóm C — Phân quyền

- [ ] **AC-17**: Phân quyền xem chi tiết xe
  - Tại: màn hình Chi tiết xe.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết xe, chuyển tab, tìm kiếm và điều hướng. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-18**: Xe không tồn tại hoặc không tìm thấy
  - Tại: màn hình Chi tiết xe.
  - Khi: hệ thống không tìm thấy thông tin xe (xe không tồn tại, xe thuộc garage khác, hoặc ID không hợp lệ).
  - Thì: hệ thống hiển thị thông báo: **"Không tìm thấy thông tin xe"**.

- [ ] **AC-19**: Tải dữ liệu tab thất bại
  - Tại: bất kỳ tab nào trên màn hình Chi tiết xe.
  - Khi: hệ thống không tải được dữ liệu của tab (lỗi mạng hoặc lỗi server).
  - Thì: hệ thống hiển thị thông báo lỗi tại vùng nội dung của tab. Các tab khác và phần header vẫn hoạt động bình thường.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-VEHICLE.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Chi tiết xe: Query `GetVehicle`
- 5 phiếu dịch vụ gần nhất: Query `GetLatestServiceOrdersByVehicleV3` (dữ liệu từ `gf-sales`)
- Dịch vụ đã thực hiện: Query `SearchCompletedItemsV3` (dữ liệu từ `gf-sales`)
- Phụ tùng đã thay: Query `SearchCompletedPartsV3` (dữ liệu từ `gf-sales`)
- Ghi chú kỹ thuật: Query `SearchCompletedVehicleNotesV3` (dữ liệu từ `gf-sales`)

## 5. Business Rules

- **BR-VEH-DTL-001**: Thông tin xe trên màn hình chi tiết luôn được phạm vi theo garage hiện tại — không hiển thị xe của garage khác.
- **BR-VEH-DTL-002**: Tab **"Tổng quan"** chỉ hiển thị tối đa 5 phiếu dịch vụ gần nhất liên kết với xe.
- **BR-VEH-DTL-003**: Dữ liệu dịch vụ đã thực hiện, phụ tùng đã thay và ghi chú kỹ thuật được tổng hợp từ các phiếu dịch vụ đã hoàn thành liên kết với xe — dữ liệu nguồn thuộc `gf-sales`, truy xuất qua BFF.
- **BR-VEH-DTL-004**: Ghi chú kỹ thuật được tổng hợp tự động từ các phiếu dịch vụ — không cho phép tạo hoặc chỉnh sửa ghi chú trực tiếp trên màn hình chi tiết xe.
- **BR-VEH-DTL-005**: Mã phiếu DV trong tab **"Ghi chú kỹ thuật"** là liên kết điều hướng — cho phép truy ngược đến phiếu dịch vụ gốc để xem đầy đủ ngữ cảnh.

## 6. Edge Cases

- **EC-1**: Xe chưa có phiếu dịch vụ nào — tab **"Tổng quan"** hiển thị **"Xe này chưa có phiếu dịch vụ nào."**, các tab còn lại hiển thị thông báo trống tương ứng.
- **EC-2**: Xe có phiếu dịch vụ nhưng chưa có dịch vụ hoàn thành — tab **"Dịch vụ đã thực hiện"** hiển thị **"Chưa có dịch vụ đã thực hiện."** trong khi tab **"Tổng quan"** vẫn có dữ liệu.
- **EC-3**: Xe có phiếu dịch vụ nhưng không thay phụ tùng — tab **"Phụ tùng đã thay"** hiển thị **"Chưa có phụ tùng đã thay."**.
- **EC-4**: Xe có phiếu dịch vụ nhưng không có ghi chú kỹ thuật — tab **"Ghi chú kỹ thuật"** hiển thị **"Chưa có ghi chú kỹ thuật."**.
- **EC-5**: Trường thông tin xe không có dữ liệu (ví dụ: **"Số máy"**, **"Phiên bản"**, **"Năm sản xuất"**) — hiển thị trống, không hiển thị giá trị mặc định.

## 7. Out of Scope

- Chỉnh sửa thông tin xe → thuộc `FEAT-CUST-EDIT`.
- Chat xe → thuộc `EP-SUPPORT`.
- Danh sách xe → thuộc `FEAT-VEH-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (vehicles-id detail screen, 4 tabs: tong-quan, dich-vu-da-thuc-hien, phu-tung-da-thay, ghi-chu-ky-thuat, GetVehicle + gf-sales queries) |
