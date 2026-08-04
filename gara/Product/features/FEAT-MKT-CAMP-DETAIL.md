---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-MARKETING"
boundary: "gf-marketing"
last_reviewed: "2026-05-27"
---

# FEAT-MKT-CAMP-DETAIL: Chi tiết chiến dịch

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-CAMP-DETAIL` |
| Title | Chi tiết chiến dịch |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết chiến dịch marketing bao gồm thông tin chung, giai đoạn gửi, danh sách khách hàng và kết quả gửi, **so that** tôi có thể theo dõi hiệu quả chiến dịch và thực hiện các thao tác quản lý (chạy, tạm dừng, tiếp tục, hủy).

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết và điều hướng nhanh

- [ ] **AC-1**: Hiển thị màn hình chi tiết chiến dịch
  - Tại: màn hình Danh sách chiến dịch.
  - Khi: chủ garage nhấn vào dòng chiến dịch.
  - Thì: hệ thống hiển thị màn hình chi tiết chiến dịch với các mục: **"Thông tin chung"**, **"Thiết lập giai đoạn"**, **"Thiết lập chi tiết"**, **"Khách hàng"**, **"Kết quả"** và thanh điều hướng nhanh **"Đi nhanh"**.

- [ ] **AC-2**: Hiển thị thông tin chung
  - Tại: mục **"Thông tin chung"**.
  - Khi: hệ thống tải dữ liệu chiến dịch.
  - Thì: hệ thống hiển thị các trường: **"Tên chiến dịch"**, **"Ngày khởi tạo"**, **"Trạng thái"** (badge), **"Người khởi tạo"**, **"Danh sách kênh"**, **"Loại chiến dịch"**, **"Mô tả"**, **"Thời gian bắt đầu"**, **"Phân khúc"**. Nếu loại là **"Tự động theo sự kiện"**: hiển thị thêm **"Sự kiện"** và **"Thời gian"**. Nếu loại là **"Lặp lại theo lịch"**: hiển thị thêm cấu hình tần suất.

- [ ] **AC-3**: Hiển thị thiết lập giai đoạn
  - Tại: mục **"Thiết lập giai đoạn"**.
  - Khi: chiến dịch có các giai đoạn gửi.
  - Thì: hệ thống hiển thị danh sách giai đoạn với label **"Giai đoạn"** kèm số thứ tự và thông tin **"Bắt đầu chạy sau"** (số ngày/giờ).

- [ ] **AC-4**: Hiển thị thiết lập chi tiết từng giai đoạn
  - Tại: mục **"Thiết lập chi tiết"**, cho mỗi giai đoạn.
  - Khi: hệ thống tải dữ liệu giai đoạn.
  - Thì: hệ thống hiển thị các trường: **"Tên"**, **"Kênh"**, **"Template"**, **"Chương trình Voucher"**, **"Số lượng tối đa"**, **"Đã sử dụng"**, **"Thời gian dự kiến chạy"**, **"Thời gian bắt đầu thực tế"**, **"Thời gian hoàn thành"**, **"Trạng thái"** (badge giai đoạn).

- [ ] **AC-5**: Xem danh sách khách hàng của chiến dịch
  - Tại: mục **"Khách hàng"**, nút **"Xem chi tiết"**.
  - Khi: chủ garage nhấn **"Xem chi tiết"**.
  - Thì: hệ thống hiển thị dialog **"Danh sách khách hàng"** với bảng gồm các cột: **"Tên khách hàng"**, **"Số điện thoại"**, **"Email"**, **"Thời điểm thực hiện"**, **"Chi tiết lỗi"**. Có ô tìm kiếm: **"Tìm theo tên, số điện thoại"**. Hiển thị **"Tổng số"** khách hàng. Hỗ trợ lọc theo tab: **"Tất cả"** và các trạng thái gửi. Có bộ lọc **"Trạng thái"**, **"Kênh"**, **"Giai đoạn"**.

- [ ] **AC-6**: Hiển thị kết quả chiến dịch
  - Tại: mục **"Kết quả"**.
  - Khi: chiến dịch đã hoặc đang chạy.
  - Thì: hệ thống hiển thị số liệu tổng hợp: **"Đã gửi"**, **"Đã nhận"**, **"Thất bại"**.

### Nhóm B — Nút hành động trạng thái

- [ ] **AC-7**: Nút **"Chạy"** chiến dịch
  - Tại: màn hình Chi tiết chiến dịch, thanh hành động.
  - Khi: chiến dịch ở trạng thái **"Nháp"** hoặc **"Đã lên lịch"** hoặc **"Tạm dừng"**.
  - Thì: nút **"Chạy"** hiển thị. Khi nhấn, hệ thống hiển thị modal xác nhận. Sau khi xác nhận thành công, trạng thái chuyển sang **"Đang chạy"**.

- [ ] **AC-8**: Nút **"Tạm dừng"** chiến dịch
  - Tại: màn hình Chi tiết chiến dịch, thanh hành động.
  - Khi: chiến dịch ở trạng thái **"Đang chạy"**.
  - Thì: nút **"Tạm dừng"** hiển thị. Khi nhấn, hệ thống tạm dừng chiến dịch. Trạng thái chuyển sang **"Tạm dừng"**.

- [ ] **AC-9**: Nút **"Hủy"** chiến dịch
  - Tại: màn hình Chi tiết chiến dịch, thanh hành động.
  - Khi: chiến dịch ở trạng thái **"Đang chạy"** hoặc **"Tạm dừng"**.
  - Thì: nút **"Hủy"** hiển thị. Khi nhấn, hệ thống hiển thị modal với tiêu đề **"Xác nhận hủy"** và nội dung **"Bạn chắc chắn muốn hủy chiến dịch"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**. Sau khi xác nhận, trạng thái chuyển sang **"Đã hủy"**.

### Nhóm C — Phân quyền

- [ ] **AC-10**: Phân quyền xem chi tiết chiến dịch
  - Tại: màn hình Chi tiết chiến dịch.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết và thực hiện các thao tác chạy, tạm dừng, hủy chiến dịch. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-11**: Thao tác hành động thất bại
  - Tại: màn hình Chi tiết chiến dịch, sau khi thực hiện hành động.
  - Khi: hệ thống thực hiện hành động (chạy, tạm dừng, hủy) thất bại.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái chiến dịch giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Chi tiết chiến dịch: Query `GetCampaignById`
- Danh sách message: Query `SearchCampaignMessages`
- Giới hạn thông báo: Query `GetNotificationLimits`
- Hủy chiến dịch: Mutation `CancelCampaign`
- Tạm dừng chiến dịch: Mutation `PauseCampaign`
- Tiếp tục chiến dịch: Mutation `ResumeCampaign`
- Tạm dừng giai đoạn: Mutation `PauseCampaignWave`
- Tiếp tục giai đoạn: Mutation `ResumeCampaignWave`
- Hủy giai đoạn: Mutation `CancelCampaignWave`

## 5. Business Rules

- **BR-MKT-CAMP-DTL-001**: Chiến dịch chỉ chuyển trạng thái theo quy tắc: **"Nháp"** -> **"Đã lên lịch"** -> **"Đang chạy"** -> **"Hoàn thành"**; **"Đang chạy"** -> **"Tạm dừng"** / **"Đã hủy"**; **"Tạm dừng"** -> **"Đang chạy"** / **"Đã hủy"**.
- **BR-MKT-CAMP-DTL-002**: Kết quả chiến dịch hiển thị số liệu tổng hợp: đã gửi, đã nhận, thất bại — cập nhật theo thời gian thực khi chiến dịch đang chạy.
- **BR-MKT-CAMP-DTL-003**: Trạng thái giai đoạn có các giá trị: **"Đang thiết lập"**, **"Đã lên lịch"**, **"Đang chạy"**, **"Hoàn thành"**, **"Tạm dừng"**, **"Đã hủy"**, **"Bỏ qua"**.
- **BR-MKT-CAMP-DTL-004**: Trạng thái message gửi có các giá trị: **"Chờ gửi"**, **"Đang gửi"**, **"Đã gửi"**, **"Đã nhận"**, **"Đã mở"**, **"Đã click"**, **"Thất bại"**, **"Lỗi (bounce)"**.

## 6. Edge Cases

- **EC-1**: Chiến dịch chưa chạy — mục **"Kết quả"** hiển thị giá trị 0 cho tất cả số liệu.
- **EC-2**: Chiến dịch không có giai đoạn — mục **"Thiết lập giai đoạn"** và **"Thiết lập chi tiết"** hiển thị trống.
- **EC-3**: Chiến dịch hoàn thành hoặc đã hủy — không hiển thị nút hành động (chạy, tạm dừng, hủy).

## 7. Out of Scope

- Danh sách chiến dịch → xem `FEAT-MKT-CAMP-LIST`.
- Tạo chiến dịch → xem `FEAT-MKT-CAMP-CREATE`.
- Chỉnh sửa chiến dịch → xem `FEAT-MKT-CAMP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (campaign-id screen, GetCampaignById query, action mutations) |
