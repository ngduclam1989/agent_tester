---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-BOOK-EDIT: Chỉnh sửa lịch hẹn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-EDIT` |
| Title | Chỉnh sửa lịch hẹn |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin lịch hẹn đã tạo (khách hàng, xe, thời gian, dịch vụ), **so that** tôi cập nhật được thông tin chính xác khi khách hàng thay đổi yêu cầu.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form chỉnh sửa

- [ ] **AC-1**: Mở màn hình chỉnh sửa lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Lịch hẹn mới"** hoặc **"Đã xác nhận"**.
  - Khi: chủ garage nhấn nút chỉnh sửa.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa lịch hẹn. Form hiển thị với dữ liệu hiện tại đã điền sẵn, gồm 5 mục: Thông tin khách hàng, Thông tin xe, Hình ảnh xe, Thời gian hẹn, Thông tin dịch vụ.

- [ ] **AC-2**: Không cho phép chỉnh sửa khi trạng thái không hợp lệ
  - Tại: màn hình Chi tiết lịch hẹn, lịch hẹn ở trạng thái **"Xe đã đến"**, **"Đã từ chối"** hoặc **"Đã hủy"**.
  - Khi: chủ garage xem chi tiết lịch hẹn.
  - Thì: nút chỉnh sửa không hiển thị.

#### Mục: Thông tin khách hàng

- [ ] **AC-3**: Chỉnh sửa SĐT khách hàng
  - Tại: mục Thông tin khách hàng, trường **"SĐT khách hàng"**.
  - Khi: chủ garage thay đổi số điện thoại.
  - Thì: hệ thống gợi ý danh sách khách hàng khớp. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc.

- [ ] **AC-4**: Chỉnh sửa tên khách hàng
  - Tại: mục Thông tin khách hàng, trường **"Tên khách hàng"**.
  - Khi: chủ garage thay đổi tên khách hàng.
  - Thì: hệ thống gợi ý danh sách khách hàng khớp. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.

#### Mục: Thông tin xe

- [ ] **AC-5**: Chỉnh sửa thông tin xe
  - Tại: mục Thông tin xe.
  - Khi: chủ garage thay đổi thông tin xe.
  - Thì: các trường hiển thị với dữ liệu hiện tại đã điền sẵn:
    - **"Biển số xe"** — placeholder: **"Nhập biển số xe (VD: 30A12345)"**. Không bắt buộc.
    - **"Số khung xe (Số VIN)"** — placeholder: **"Nhập số khung xe (Số VIN)"**. Không bắt buộc.
    - **"Số Km"** — placeholder: **"Nhập số Km"**. Không bắt buộc.
    - **"Hãng xe"** — placeholder: **"Chọn hãng xe"**. Không bắt buộc.
    - **"Dòng xe"** — placeholder: **"Chọn dòng xe"**. Không bắt buộc.
    - **"Năm sản xuất"** — placeholder: **"Chọn năm sản xuất"**. Không bắt buộc.
    - **"Phiên bản"** — placeholder: **"Chọn phiên bản"**. Không bắt buộc.

- [ ] **AC-6**: Validation biển số xe khi chỉnh sửa
  - Tại: mục Thông tin xe, trường Biển số xe.
  - Khi: chủ garage nhập biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

#### Mục: Hình ảnh xe

- [ ] **AC-7**: Chỉnh sửa hình ảnh xe
  - Tại: mục Hình ảnh xe.
  - Khi: chủ garage thêm hoặc xóa hình ảnh xe.
  - Thì: hệ thống cho phép tải thêm ảnh hoặc xóa ảnh đã có. Không bắt buộc.

#### Mục: Thời gian hẹn

- [ ] **AC-8**: Chỉnh sửa ngày và giờ hẹn
  - Tại: mục Thời gian hẹn, trường **"Ngày hẹn"** và **"Giờ hẹn"**.
  - Khi: chủ garage thay đổi ngày hoặc giờ hẹn.
  - Thì: hệ thống kiểm tra khung giờ tương tự như khi tạo mới (xem `FEAT-BOOK-CREATE` AC-12, AC-13, AC-14). Cả hai trường bắt buộc.

#### Mục: Thông tin dịch vụ

- [ ] **AC-9**: Chỉnh sửa thông tin dịch vụ
  - Tại: mục Thông tin dịch vụ.
  - Khi: chủ garage thay đổi thông tin dịch vụ.
  - Thì: các trường hiển thị với dữ liệu hiện tại đã điền sẵn:
    - **"Loại dịch vụ"** — bắt buộc.
    - **"Mô tả tình trạng xe"** — placeholder: **"Nhập mô tả tình trạng xe"**. Không bắt buộc.
    - **"Ghi chú khách hàng"** — placeholder: **"Nhập ghi chú"**. Không bắt buộc.
    - **"Ghi chú nội bộ"** — placeholder: **"Nhập ghi chú"**. Không bắt buộc.

### Nhóm B — Nút hành động trên form

- [ ] **AC-10**: Điều kiện nút lưu thay đổi
  - Tại: cuối form chỉnh sửa, nút **"Lưu thay đổi"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên khách hàng, SĐT khách hàng, Ngày hẹn, Giờ hẹn, Loại dịch vụ) và hệ thống không đang gửi yêu cầu.
  - Thì: nút ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút ở trạng thái bị mờ (disabled).

- [ ] **AC-11**: Hủy bỏ chỉnh sửa ⚠ NEED CLARIFICATION — KG chưa ghi nhận label nút hủy trên form chỉnh sửa.
  - Tại: cuối form chỉnh sửa, nút hủy bỏ.
  - Khi: chủ garage nhấn nút hủy bỏ.
  - Thì: hệ thống đóng form chỉnh sửa và quay về màn hình Chi tiết lịch hẹn. Dữ liệu đã thay đổi không được lưu.

### Nhóm C — Phân quyền

- [ ] **AC-12**: Phân quyền chỉnh sửa lịch hẹn
  - Tại: màn hình Chi tiết lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền chỉnh sửa lịch hẹn. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý kết quả

- [ ] **AC-13**: Chỉnh sửa lịch hẹn thành công
  - Tại: form chỉnh sửa, sau khi nhấn nút **"Lưu thay đổi"**.
  - Khi: hệ thống cập nhật thành công.
  - Thì: hiển thị toast với tiêu đề: **"Cập nhật lịch hẹn thành công"**, mô tả: **"Thông tin lịch hẹn đã được cập nhật."**. Hệ thống quay về màn hình Chi tiết lịch hẹn với dữ liệu đã cập nhật.

- [ ] **AC-14**: Chỉnh sửa lịch hẹn thất bại
  - Tại: form chỉnh sửa, sau khi nhấn nút **"Lưu thay đổi"**.
  - Khi: hệ thống cập nhật thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**.

- [ ] **AC-15**: Đồng bộ thông tin cập nhật sang Driver+
  - Tại: không qua màn hình — hệ thống tự động xử lý sau khi cập nhật thành công.
  - Khi: lịch hẹn được cập nhật thành công.
  - Thì: hệ thống đồng bộ thông tin lịch hẹn đã cập nhật sang Driver+ qua sự kiện `BOOKING.UPDATE.RESPONSE`. Khách hàng trên ứng dụng Driver+ nhận được thông tin lịch hẹn mới nhất.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Lấy dữ liệu lịch hẹn: Query `GetBookingByIdV3`
- Cập nhật lịch hẹn: Mutation `UpdateBookingV3`
- Gợi ý khách hàng: Query `SuggestCustomerByPhone`, `SuggestCustomerByName`
- Gợi ý xe: Query `SuggestVehicleByPlate`
- Kiểm tra khung giờ: Query `CheckAvailabilityV3`
- Danh mục hãng/dòng xe: Query `SearchCatalog`

## 5. Business Rules

- **BR-BOOK-EDIT-001**: Chỉ cho phép chỉnh sửa lịch hẹn khi trạng thái là **"Lịch hẹn mới"** hoặc **"Đã xác nhận"**. Các trạng thái khác không hiển thị nút chỉnh sửa.
- **BR-BOOK-EDIT-002**: Thông tin snapshot (khách hàng, xe) được cập nhật lại tại thời điểm lưu chỉnh sửa.


## 6. Edge Cases

- **EC-1**: Chỉnh sửa lịch hẹn đang ở trạng thái **"Đã xác nhận"** — cho phép, nhưng trạng thái không thay đổi sau khi lưu.
- **EC-2**: Trong khi chỉnh sửa, lịch hẹn bị hệ thống tự chuyển trạng thái (quá hạn) — khi lưu sẽ thất bại vì trạng thái đã thay đổi.

## 7. Out of Scope

- Tạo lịch hẹn mới → xem `FEAT-BOOK-CREATE`.
- Kiểm tra khung giờ chi tiết → xem `FEAT-BOOK-CREATE` AC-12, AC-13, AC-14 (cùng hành vi).

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-05-20 | 2 | Business Authority | Bổ sung AC-15: đồng bộ thông tin cập nhật sang Driver+ qua BOOKING.UPDATE.RESPONSE (KG gf-sales v5); xóa BR-BOOK-EDIT-003 (chuyển thành AC) |
