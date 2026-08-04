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

# FEAT-MKT-CAMP-CREATE: Tạo chiến dịch

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-CAMP-CREATE` |
| Title | Tạo chiến dịch |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo chiến dịch marketing mới với thông tin chung, phân khúc đối tượng, giai đoạn gửi và thiết lập chi tiết, **so that** garage có thể tiếp cận khách hàng qua nhiều kênh thông báo một cách có kế hoạch.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo chiến dịch
  - Tại: dialog **"Thêm mới chiến dịch"** trên màn hình Danh sách chiến dịch.
  - Khi: chủ garage chọn loại chiến dịch và xác nhận.
  - Thì: hệ thống chuyển sang màn hình tạo chiến dịch với form gồm các mục: **"Thông tin chung"**, **"Thiết lập giai đoạn"** và **"Thiết lập chi tiết"**.

- [ ] **AC-2**: Tạo chiến dịch thành công (lưu nháp)
  - Tại: form tạo chiến dịch, sau khi nhấn nút **"Lưu"**.
  - Khi: hệ thống tạo chiến dịch thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo mới chiến dịch thành công"**. Mã chiến dịch được hệ thống tự sinh. Trạng thái khởi tạo là **"Nháp"**.

- [ ] **AC-3**: Khởi chạy chiến dịch ngay từ form tạo
  - Tại: form tạo chiến dịch, nút **"Chạy"**.
  - Khi: chủ garage nhấn nút **"Chạy"**.
  - Thì: hệ thống hiển thị modal xác nhận với nội dung **"Bạn chắc chắn muốn chạy chiến dịch"**. Modal có hai nút: **"Hủy"** và **"Xác nhận"**.
  - Khi: chủ garage nhấn **"Xác nhận"**.
  - Thì: hệ thống lưu và khởi chạy chiến dịch, hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Khởi chạy chiến dịch thành công!"**.

- [ ] **AC-4**: Điều kiện nút lưu
  - Tại: cuối form tạo chiến dịch, nút **"Lưu"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút hiển thị **"Đang lưu..."** hoặc ở trạng thái bị mờ (disabled).

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin chung

- [ ] **AC-5**: Nhập tên chiến dịch
  - Tại: mục **"Thông tin chung"**, trường **"Tên chiến dịch"**.
  - Khi: chủ garage nhập tên chiến dịch.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tên chiến dịch"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên chiến dịch"**.

- [ ] **AC-6**: Chọn trạng thái
  - Tại: mục **"Thông tin chung"**, trường **"Trạng thái"**.
  - Khi: chủ garage chọn trạng thái.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Nháp"**, **"Đã lên lịch"**. Trường này bắt buộc. Giá trị mặc định là **"Nháp"**.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn trạng thái"**.

- [ ] **AC-7**: Chọn loại chiến dịch
  - Tại: mục **"Thông tin chung"**, trường **"Loại chiến dịch"**.
  - Khi: chủ garage chọn loại chiến dịch.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Chạy 1 lần"**, **"Lặp lại theo lịch"**, **"Tự động theo sự kiện"**. Trường này bắt buộc. Giá trị đã được chọn sẵn từ dialog thêm mới.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn loại chiến dịch"**.

- [ ] **AC-8**: Nhập người khởi tạo
  - Tại: mục **"Thông tin chung"**, trường **"Người khởi tạo"**.
  - Khi: chủ garage nhập người khởi tạo.
  - Thì: hệ thống hiển thị ô nhập text có gợi ý. Placeholder: **"Nhập tên người khởi tạo"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập người khởi tạo"**.

- [ ] **AC-9**: Chọn danh sách kênh sử dụng
  - Tại: mục **"Thông tin chung"**, trường **"Danh sách kênh sử dụng"**.
  - Khi: chủ garage chọn kênh gửi.
  - Thì: hệ thống hiển thị các tùy chọn: **"Push"**, **"SMS"**, **"Zalo"**, **"Email"**. Cho phép chọn nhiều kênh.
  - Khi: chủ garage không chọn kênh nào.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn ít nhất một kênh"**.

- [ ] **AC-10**: Chọn phân khúc và hiển thị số lượng khách hàng
  - Tại: mục **"Thông tin chung"**, trường **"Phân khúc"**.
  - Khi: chủ garage chọn phân khúc.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn phân khúc"**. Sau khi chọn, hệ thống hiển thị số lượng khách hàng thuộc phân khúc tại trường **"Khách hàng"**.

- [ ] **AC-11**: Nhập mô tả
  - Tại: mục **"Thông tin chung"**, trường **"Mô tả"**.
  - Khi: chủ garage nhập mô tả.
  - Thì: hệ thống hiển thị ô nhập dạng textarea. Placeholder: **"Nhập mô tả..."**. Trường này không bắt buộc.

- [ ] **AC-12**: Chọn ngày bắt đầu (loại "Chạy 1 lần")
  - Tại: mục **"Thông tin chung"**, trường **"Bắt đầu từ"**.
  - Khi: loại chiến dịch là **"Chạy 1 lần"** và chủ garage chọn ngày bắt đầu.
  - Thì: hệ thống hiển thị bộ chọn ngày giờ. Placeholder: **"Chọn ngày bắt đầu"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng chọn ngày bắt đầu"**.

- [ ] **AC-13**: Chọn sự kiện kích hoạt (loại "Tự động theo sự kiện")
  - Tại: mục **"Thông tin chung"**, trường **"Sự kiện"**.
  - Khi: loại chiến dịch là **"Tự động theo sự kiện"** và chủ garage chọn sự kiện.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Sinh nhật khách hàng"**, **"Hoàn thành booking"**, **"Đến hạn bảo dưỡng"**, **"Khách lâu không quay lại"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Sự kiện là bắt buộc"**.

- [ ] **AC-14**: Nhập số ngày (sự kiện "Khách lâu không quay lại")
  - Tại: mục **"Thông tin chung"**, trường **"Số ngày"**.
  - Khi: sự kiện đã chọn là **"Khách lâu không quay lại"** và chủ garage nhập số ngày.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập số ngày"**. Trường này bắt buộc khi sự kiện là **"Khách lâu không quay lại"**.
  - Khi: chủ garage bỏ trống trường này.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số ngày là bắt buộc và phải lớn hơn 0"**.

- [ ] **AC-15**: Thiết lập tần suất lặp lại (loại "Lặp lại theo lịch")
  - Tại: mục **"Thông tin chung"**, phần thiết lập lịch.
  - Khi: loại chiến dịch là **"Lặp lại theo lịch"**.
  - Thì: hệ thống hiển thị các trường: **"Tần suất"** (tùy chọn: **"Hàng ngày"**, **"Hàng tuần"**, **"Hàng tháng"**), **"Thứ"** (nếu hàng tuần), **"Ngày"** (nếu hàng tháng), **"Giờ"**.

#### Mục: Thiết lập giai đoạn

- [ ] **AC-16**: Thiết lập giai đoạn gửi
  - Tại: mục **"Thiết lập giai đoạn"**.
  - Khi: chủ garage cấu hình các giai đoạn gửi.
  - Thì: hệ thống hiển thị danh sách giai đoạn với label **"Giai đoạn"** kèm số thứ tự, mô tả **"Bắt đầu chạy sau x ngày/giờ giai đoạn trước đó kết thúc"** và đơn vị thời gian (tùy chọn: **"Ngày"**, **"Giờ"**). Nút **"Thêm"** cho phép thêm giai đoạn mới.

#### Mục: Thiết lập chi tiết

- [ ] **AC-17**: Thiết lập chi tiết từng giai đoạn
  - Tại: mục **"Thiết lập chi tiết"**, cho mỗi giai đoạn.
  - Khi: chủ garage cấu hình chi tiết giai đoạn.
  - Thì: hệ thống hiển thị các trường: **"Tên"**, **"Kênh"**, **"Template"**, **"Chương trình Voucher"**, **"Thời gian dự kiến chạy"**. Trường **"Chương trình Voucher"** liên kết tới danh sách chương trình voucher đang hoạt động, hiển thị thêm **"Số lượng tối đa"** và **"Đã sử dụng"**.

### Nhóm C — Phân quyền

- [ ] **AC-18**: Phân quyền tạo chiến dịch
  - Tại: màn hình Danh sách chiến dịch.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút tạo chiến dịch và có quyền tạo chiến dịch.

### Nhóm D — Xử lý lỗi

- [ ] **AC-19**: Validation form thất bại
  - Tại: form tạo chiến dịch, sau khi nhấn nút lưu.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm và không gửi yêu cầu lên hệ thống.

- [ ] **AC-20**: Tạo chiến dịch thất bại do lỗi hệ thống
  - Tại: form tạo chiến dịch, sau khi nhấn nút lưu.
  - Khi: hệ thống tạo chiến dịch thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Tạo chiến dịch: Mutation `CreateCampaign`
- Cập nhật chiến dịch: Mutation `UpdateCampaign`
- Danh sách phân khúc: Query `SearchSegments`
- Số lượng khách hàng phân khúc: Query `GetSegmentCustomerCount`
- Danh sách template: Query `SearchMessageTemplates`
- Danh sách chương trình voucher: Query `SearchVoucherPrograms`
- Giới hạn thông báo: Query `GetNotificationLimits`
- Danh sách người dùng: Query `SearchUsers`

## 5. Business Rules

- **BR-MKT-CAMP-CRE-001**: Chiến dịch khi tạo mới có trạng thái mặc định là **"Nháp"**. Mã chiến dịch được hệ thống tự sinh theo định dạng CAMP_{NNNNN}.
- **BR-MKT-CAMP-CRE-002**: Loại chiến dịch **"Chạy 1 lần"** yêu cầu bắt buộc có giai đoạn, ngày bắt đầu và phân khúc.
- **BR-MKT-CAMP-CRE-003**: Loại chiến dịch **"Tự động theo sự kiện"** yêu cầu bắt buộc chọn sự kiện kích hoạt.
- **BR-MKT-CAMP-CRE-004**: Loại chiến dịch **"Lặp lại theo lịch"** yêu cầu cấu hình tần suất lặp lại (hàng ngày/tuần/tháng).
- **BR-MKT-CAMP-CRE-005**: Nếu chiến dịch liên kết chương trình voucher, chương trình đó phải ở trạng thái **"Hoạt động"** khi khởi chạy.
- **BR-MKT-CAMP-CRE-006**: Gửi message bị giới hạn hàng tháng theo từng kênh cho mỗi garage. Hệ thống hiển thị **"Số lượng tối đa"** và **"Đã sử dụng"** cho mỗi kênh.

## 6. Edge Cases

- **EC-1**: Chưa có phân khúc nào — ô chọn phân khúc hiển thị danh sách trống; số lượng khách hàng hiển thị 0.
- **EC-2**: Chưa có template nào — ô chọn template hiển thị danh sách trống.
- **EC-3**: Chưa có chương trình voucher đang hoạt động — ô chọn voucher hiển thị danh sách trống.

## 7. Out of Scope

- Danh sách chiến dịch → xem `FEAT-MKT-CAMP-LIST`.
- Chi tiết chiến dịch → xem `FEAT-MKT-CAMP-DETAIL`.
- Chỉnh sửa chiến dịch → xem `FEAT-MKT-CAMP-EDIT`.
- Tạo phân khúc mới → xem `FEAT-MKT-SEG-CREATE`.
- Tạo chương trình voucher → xem `FEAT-MKT-VOUC-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (campaign-create screen, CreateCampaign/UpdateCampaign mutation, form sections) |
