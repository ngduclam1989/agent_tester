---
type: feature
artifact_kind: feature
status: DONE
version: 7
tier: T2
owner_authority: Business Authority
parent_epic: "EP-BOOKING"
boundary: "gf-sales"
last_reviewed: "2026-05-27"
---

# FEAT-BOOK-CREATE: Tạo lịch hẹn mới

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-BOOK-CREATE` |
| Title | Tạo lịch hẹn mới |
| Parent Epic | `EP-BOOKING` |
| Boundary | `gf-sales` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo lịch hẹn mới cho khách hàng (từ Web GMS hoặc nhận tự động từ ứng dụng tài xế Driver+) với đầy đủ thông tin xe, thời gian và loại dịch vụ, **so that** garage có thể lên kế hoạch tiếp nhận xe và phân bổ công việc hiệu quả.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form và điền thông tin

- [ ] **AC-1**: Mở màn hình tạo lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage nhấn nút **"Tạo lịch hẹn"**.
  - Thì: hệ thống chuyển sang màn hình tạo lịch hẹn mới với form trống, gồm 5 mục: Thông tin khách hàng, Thông tin xe, Hình ảnh xe, Thời gian hẹn, Thông tin dịch vụ.

#### Mục: Thông tin khách hàng

- [ ] **AC-2**: Nhập SĐT khách hàng
  - Tại: mục Thông tin khách hàng, trường **"SĐT khách hàng"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống gợi ý danh sách khách hàng khớp từ dữ liệu đã có. Placeholder: **"Chọn/Nhập SĐT khách hàng"**. Trường này bắt buộc.

- [ ] **AC-3**: Nhập tên khách hàng
  - Tại: mục Thông tin khách hàng, trường **"Tên khách hàng"**.
  - Khi: chủ garage nhập tên khách hàng.
  - Thì: hệ thống gợi ý danh sách khách hàng khớp từ dữ liệu đã có. Placeholder: **"Chọn/Nhập tên khách hàng"**. Trường này bắt buộc.

- [ ] **AC-4**: Chọn khách hàng từ gợi ý
  - Tại: mục Thông tin khách hàng, danh sách gợi ý (từ SĐT hoặc tên).
  - Khi: chủ garage chọn một khách hàng trong danh sách gợi ý.
  - Thì: hệ thống tự động điền SĐT và tên khách hàng tương ứng.

#### Mục: Thông tin xe

- [ ] **AC-5**: Nhập biển số xe
  - Tại: mục Thông tin xe, trường **"Biển số xe"**.
  - Khi: chủ garage nhập biển số xe.
  - Thì: hệ thống gợi ý danh sách xe khớp từ dữ liệu đã có. Placeholder: **"Nhập biển số xe (VD: 30A12345)"**. Trường này không bắt buộc.

- [ ] **AC-6**: Validation biển số xe
  - Tại: mục Thông tin xe, trường Biển số xe.
  - Khi: chủ garage nhập biển số xe không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Biển số xe không đúng định dạng (Ví dụ chuẩn: 30A12345)"**.

- [ ] **AC-7**: Chọn xe từ gợi ý
  - Tại: mục Thông tin xe, danh sách gợi ý.
  - Khi: chủ garage chọn một xe trong danh sách gợi ý.
  - Thì: hệ thống tự động điền các trường Số khung xe (Số VIN), Số Km, Hãng xe, Dòng xe, Năm sản xuất, Phiên bản từ dữ liệu xe đã có.

- [ ] **AC-8**: Nhập thông tin xe thủ công
  - Tại: mục Thông tin xe.
  - Khi: chủ garage nhập thủ công các trường thông tin xe.
  - Thì: các trường hiển thị gồm:
    - **"Số khung xe (Số VIN)"** — ô nhập text, placeholder: **"Nhập số khung xe (Số VIN)"**. Không bắt buộc.
    - **"Số Km"** — ô nhập số, placeholder: **"Nhập số Km"**. Không bắt buộc.
    - **"Hãng xe"** — ô chọn có tìm kiếm, placeholder: **"Chọn hãng xe"**. Không bắt buộc.
    - **"Dòng xe"** — ô chọn có tìm kiếm, placeholder: **"Chọn dòng xe"**. Không bắt buộc.
    - **"Năm sản xuất"** — ô chọn, placeholder: **"Chọn năm sản xuất"**. Không bắt buộc.
    - **"Phiên bản"** — ô chọn, placeholder: **"Chọn phiên bản"**. Không bắt buộc.

#### Mục: Hình ảnh xe

- [ ] **AC-9**: Tải ảnh xe
  - Tại: mục Hình ảnh xe, trường **"Hình ảnh xe"**.
  - Khi: chủ garage tải lên hình ảnh xe.
  - Thì: hệ thống cho phép tải nhiều ảnh cùng lúc. Trường này không bắt buộc.

#### Mục: Thời gian hẹn

- [ ] **AC-10**: Chọn ngày hẹn
  - Tại: mục Thời gian hẹn, trường **"Ngày hẹn"**.
  - Khi: chủ garage chọn ngày.
  - Thì: hệ thống hiển thị bộ chọn ngày (date picker). Trường này bắt buộc.

- [ ] **AC-11**: Chọn giờ hẹn
  - Tại: mục Thời gian hẹn, trường **"Giờ hẹn"**.
  - Khi: chủ garage chọn giờ.
  - Thì: hệ thống hiển thị bộ chọn giờ (time picker). Trường này bắt buộc.

- [ ] **AC-12**: Kiểm tra khung giờ — đang kiểm tra
  - Tại: mục Thời gian hẹn, sau khi chọn ngày và giờ.
  - Khi: hệ thống đang gọi kiểm tra khung giờ.
  - Thì: hiển thị thông báo: **"Đang kiểm tra khung giờ..."**.

- [ ] **AC-13**: Kiểm tra khung giờ — khung giờ phù hợp
  - Tại: mục Thời gian hẹn, sau khi kiểm tra xong.
  - Khi: không có lịch hẹn nào gần thời điểm đã chọn.
  - Thì: hiển thị thông báo thành công: **"Khung giờ phù hợp - Không có lịch hẹn gần thời điểm này"**.

- [ ] **AC-14**: Kiểm tra khung giờ — có lịch hẹn gần
  - Tại: mục Thời gian hẹn, sau khi kiểm tra xong.
  - Khi: có lịch hẹn gần thời điểm đã chọn.
  - Thì: hiển thị cảnh báo: **"Có {n} lịch hẹn gần thời điểm bạn chọn"** kèm liên kết **"Chi tiết"** để mở hộp thoại danh sách lịch hẹn lân cận.

#### Mục: Thông tin dịch vụ

- [ ] **AC-15**: Chọn loại dịch vụ
  - Tại: mục Thông tin dịch vụ, trường **"Loại dịch vụ"**.
  - Khi: chủ garage chọn loại dịch vụ.
  - Thì: hệ thống hiển thị nhóm radio button với các tùy chọn loại dịch vụ. Trường này bắt buộc.

- [ ] **AC-16**: Nhập mô tả tình trạng xe
  - Tại: mục Thông tin dịch vụ, trường **"Mô tả tình trạng xe"**.
  - Khi: chủ garage nhập mô tả.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập mô tả tình trạng xe"**. Không bắt buộc.

- [ ] **AC-17**: Nhập ghi chú khách hàng
  - Tại: mục Thông tin dịch vụ, trường **"Ghi chú khách hàng"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Không bắt buộc.

- [ ] **AC-18**: Nhập ghi chú nội bộ
  - Tại: mục Thông tin dịch vụ, trường **"Ghi chú nội bộ"**.
  - Khi: chủ garage nhập ghi chú nội bộ.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập ghi chú"**. Không bắt buộc.

### Nhóm A2 — Luồng tạo tự động từ ứng dụng tài xế (Driver+)

- [ ] **AC-23**: Nhận yêu cầu đặt lịch từ Driver+
  - Tại: không qua màn hình Web GMS — hệ thống tự động xử lý.
  - Khi: khách hàng đặt lịch hẹn từ ứng dụng tài xế (Driver+).
  - Thì: hệ thống tự động tạo lịch hẹn mới với trạng thái **"Lịch hẹn mới"**, nguồn hiển thị là **"Từ ứng dụng tài xế"**. Lịch hẹn xuất hiện trong danh sách lịch hẹn trên Web GMS để chủ garage xác nhận hoặc từ chối.

- [ ] **AC-24**: Nhận yêu cầu hủy lịch hẹn từ Driver+
  - Tại: không qua màn hình Web GMS — hệ thống tự động xử lý.
  - Khi: khách hàng hủy lịch hẹn từ ứng dụng tài xế (Driver+).
  - Thì: hệ thống tự động hủy lịch hẹn tương ứng. Trạng thái lịch hẹn chuyển sang **"Đã hủy"** trên danh sách lịch hẹn Web GMS.

- [ ] **AC-25**: Nhận lịch hẹn từ Garage Care
  - Tại: không qua màn hình Web GMS — hệ thống tự động xử lý.
  - Khi: lịch hẹn được tạo từ nguồn Garage Care.
  - Thì: hệ thống tự động tạo lịch hẹn với trạng thái **"Đã xác nhận"** (bỏ qua bước xác nhận thủ công). Lịch hẹn xuất hiện trong danh sách lịch hẹn Web GMS.

- [ ] **AC-26**: Tự sinh lịch hẹn walk-in từ Phiếu dịch vụ
  - Tại: không qua màn hình lịch hẹn — hệ thống tự động xử lý khi tạo Phiếu dịch vụ.
  - Khi: chủ garage tạo Phiếu dịch vụ (loại sửa chữa, không phải bán lẻ) mà không gắn với lịch hẹn nào.
  - Thì: hệ thống tự động sinh một lịch hẹn walk-in với trạng thái **"Xe đã đến"**, nguồn **"Walk-in"**, thời điểm xe đến ghi nhận là thời điểm tạo phiếu. Lịch hẹn này xuất hiện trong danh sách lịch hẹn Web GMS và được liên kết với Phiếu dịch vụ vừa tạo. Không áp dụng cho Phiếu dịch vụ loại bán lẻ.

### Nhóm B — Nút hành động trên form

- [ ] **AC-19**: Điều kiện nút tạo lịch hẹn
  - Tại: cuối form tạo lịch hẹn, nút submit.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên khách hàng, SĐT khách hàng, Ngày hẹn, Giờ hẹn, Loại dịch vụ) và hệ thống không đang gửi yêu cầu.
  - Thì: nút submit ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút submit ở trạng thái bị mờ (disabled).

- [ ] **AC-27**: Hủy bỏ tạo lịch hẹn ⚠ NEED CLARIFICATION — KG chưa ghi nhận label nút trên booking form; label tạm dùng **"Hủy bỏ"** cần Business Authority xác nhận.
  - Tại: cuối form tạo lịch hẹn, nút hủy bỏ.
  - Khi: chủ garage nhấn nút **"Hủy bỏ"**.
  - Thì: hệ thống đóng form tạo lịch hẹn và quay về màn hình Danh sách lịch hẹn. Dữ liệu đã nhập trên form không được lưu.

### Nhóm C — Phân quyền

- [ ] **AC-20**: Phân quyền tạo lịch hẹn
  - Tại: màn hình Danh sách lịch hẹn.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Tạo lịch hẹn"** và có quyền tạo lịch hẹn.

### Nhóm D — Xử lý lỗi và trạng thái sau tạo

- [ ] **AC-21**: Tạo lịch hẹn thành công
  - Tại: form tạo lịch hẹn, sau khi nhấn nút submit.
  - Khi: hệ thống tạo lịch hẹn thành công.
  - Thì: lịch hẹn mới được tạo với trạng thái **"Đã xác nhận"**. Hệ thống tự sinh mã lịch hẹn. Nguồn lịch hẹn được ghi nhận tự động.

- [ ] **AC-22**: Tạo lịch hẹn thất bại
  - Tại: form tạo lịch hẹn, sau khi nhấn nút submit.
  - Khi: hệ thống tạo lịch hẹn thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-BOOKING.

## 4. API Reference

- Boundary: `gf-sales` (qua BFF `agg-garage-graph`)
- Tạo lịch hẹn: Mutation `CreateBookingV3`
- Gợi ý khách hàng theo SĐT: Query `SuggestCustomerByPhone`
- Gợi ý khách hàng theo tên: Query `SuggestCustomerByName`
- Gợi ý xe theo biển số: Query `SuggestVehicleByPlate`
- Kiểm tra khung giờ: Query `CheckAvailabilityV3`
- Tải ảnh: Mutation `UploadAttachment`
- Danh mục hãng/dòng xe: Query `SearchCatalog`

## 5. Business Rules

- **BR-BOOK-001**: Trạng thái khởi tạo phụ thuộc vào nguồn tạo lịch hẹn. Garage Care là tên sản phẩm bao gồm Web GMS và App Garage.
  - Tạo từ Garage Care (Web GMS, App Garage) → trạng thái **"Đã xác nhận"**.
  - Nhận từ ứng dụng tài xế (Driver+) → trạng thái **"Lịch hẹn mới"**.
  - Tự sinh từ Phiếu dịch vụ walk-in → trạng thái **"Xe đã đến"** (xem `FEAT-SO-CREATE`).
- **BR-BOOK-002**: Mã lịch hẹn được hệ thống tự sinh theo định dạng chuẩn, không cho phép nhập thủ công.
- **BR-BOOK-003**: Nguồn lịch hẹn được ghi nhận tự động khi tạo, không hiển thị trên form tạo.
- **BR-BOOK-004**: Khi chọn khách hàng/xe từ gợi ý, thông tin snapshot được lưu cùng lịch hẹn tại thời điểm tạo.
- **BR-BOOK-005**: Lịch hẹn từ Driver+ được tạo qua kênh sự kiện tự động — garage không nhập liệu mà chỉ xác nhận hoặc từ chối (xem `FEAT-BOOK-CONFIRM`, `FEAT-BOOK-DECLINE`). Sau khi tạo thành công, hệ thống phản hồi xác nhận về Driver+ qua sự kiện `BOOKING.CREATE.RESPONSE` và gửi thông báo cho khách hàng (KG gf-sales v5).
- **BR-BOOK-006**: Khi tạo Phiếu dịch vụ loại sửa chữa mà không gắn lịch hẹn, hệ thống tự sinh booking walk-in với trạng thái **"Xe đã đến"**. Không áp dụng cho Phiếu dịch vụ loại bán lẻ. Chi tiết trigger tạo xem `FEAT-SO-CREATE`.

## 6. Edge Cases

- **EC-1**: Khách hàng mới chưa có trong hệ thống — cho phép nhập thủ công mà không cần chọn từ gợi ý.
- **EC-2**: Xe mới chưa có trong hệ thống — cho phép nhập biển số và thông tin xe thủ công.
- **EC-3**: Chọn khung giờ đã có nhiều lịch hẹn — hiển thị cảnh báo nhưng vẫn cho phép tạo (không chặn).

## 7. Out of Scope

- Chi tiết trigger tạo walk-in từ Phiếu dịch vụ (form, điều kiện, validation) → xem `FEAT-SO-CREATE`.
- Quản lý cấu hình khung giờ (timeslot) — thuộc `EP-FOUND`.
- Xác nhận / từ chối lịch hẹn Driver+ → xem `FEAT-BOOK-CONFIRM`, `FEAT-BOOK-DECLINE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-19 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-sales + garage-web |
| 2026-05-19 | 2 | Business Authority | Bổ sung Nhóm A2: luồng tạo tự động từ Driver+ và Garage Care (AC-23, AC-24, AC-25); thêm BR-BOOK-005; cập nhật BR-BOOK-001 chi tiết theo nguồn; bỏ Driver+ khỏi Out of Scope |
| 2026-05-19 | 3 | Business Authority | Bổ sung AC-26: tự sinh booking walk-in từ Phiếu dịch vụ; thêm BR-BOOK-006; cập nhật Out of Scope chỉ cross-ref trigger sang FEAT-SO-CREATE |
| 2026-05-19 | 4 | Business Authority | Bổ sung AC-27: nút hủy bỏ form tạo lịch hẹn (⚠ label cần xác nhận — KG chưa ghi nhận); đổi tên Nhóm B thành "Nút hành động trên form" |
| 2026-05-19 | 5 | Business Authority | Cập nhật trường bắt buộc theo xác nhận BA: Tên KH, SĐT KH, Ngày hẹn, Giờ hẹn, Loại dịch vụ đều bắt buộc; cập nhật AC-2, AC-3, AC-10, AC-11, AC-19 |
| 2026-05-20 | 6 | Business Authority | Cập nhật BR-BOOK-005: bổ sung phản hồi BOOKING.CREATE.RESPONSE về Driver+ và thông báo khách hàng sau khi tạo (KG gf-sales v5) |
| 2026-05-20 | 7 | Business Authority | Sửa AC-21: trạng thái sau tạo từ Web GMS là **"Đã xác nhận"** (không phải "Lịch hẹn mới"). Sửa BR-BOOK-001: Garage Care bao gồm Web GMS + App Garage → gộp thành 1 dòng, bỏ dòng Web GMS riêng. |
