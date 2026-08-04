---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CATALOG"
boundary: "gf-system"
last_reviewed: "2026-05-27"
---

# FEAT-CAT-TRANS-CREATE: Tạo nhà xe liên kết

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-TRANS-CREATE` |
| Title | Tạo nhà xe liên kết |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-system` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo nhà xe liên kết mới với thông tin tuyến xe, số điện thoại và địa chỉ nhận hàng, **so that** garage có thể quản lý danh sách nhà xe liên kết phục vụ mua hàng và vận chuyển phụ tùng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo nhà xe liên kết
  - Tại: màn hình Danh sách nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Thêm nhà xe liên kết"**.
  - Thì: hệ thống chuyển sang màn hình **"Tạo nhà xe liên kết mới"** với form trống, gồm mục **"Thông tin chung"** chứa các trường nhập liệu.

- [ ] **AC-2**: Xác nhận trước khi tạo
  - Tại: form tạo nhà xe liên kết, sau khi nhấn nút **"Tạo mới"**.
  - Khi: chủ garage nhấn nút **"Tạo mới"**.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Xác nhận tạo nhà xe liên kết"** và nội dung **"Bạn có chắc chắn muốn tạo bản ghi {transporterName} không?"** (trong đó {transporterName} là tên nhà xe đã nhập). Dialog có hai nút: **"Đóng"** (đóng dialog, quay lại form) và **"Xác nhận"** (tiến hành tạo).

- [ ] **AC-3**: Tạo nhà xe liên kết thành công
  - Tại: dialog xác nhận tạo nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống tạo thành công.
  - Thì: hệ thống hiển thị toast với mô tả **"Lưu thông tin nhà xe liên kết thành công."**. Trạng thái nhà xe liên kết mặc định là **"Đang hoạt động"**. Hệ thống chuyển về màn hình Danh sách nhà xe liên kết.

- [ ] **AC-4**: Điều kiện nút tạo mới
  - Tại: cuối form tạo nhà xe liên kết, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái bị mờ (disabled).

- [ ] **AC-5**: Hủy bỏ tạo nhà xe liên kết
  - Tại: form tạo nhà xe liên kết, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"** và form có dữ liệu đã nhập.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Tiếp tục thêm nhà xe liên kết"** và nội dung **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."**. Dialog có hai nút: **"Đóng"** (quay lại form tiếp tục nhập) và **"Tiếp tục"** (rời khỏi form, quay về màn hình Danh sách nhà xe liên kết, dữ liệu không được lưu).

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin chung

- [ ] **AC-6**: Nhập tên nhà xe
  - Tại: mục **"Thông tin chung"**, trường **"Tên nhà xe"**.
  - Khi: chủ garage nhập tên nhà xe.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tên nhà xe"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên nhà xe là bắt buộc."**.

- [ ] **AC-7**: Nhập số điện thoại
  - Tại: mục **"Thông tin chung"**, trường **"Số điện thoại"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc. Định dạng hợp lệ: đúng 10 chữ số.
  - Khi: chủ garage nhập số điện thoại không đúng 10 chữ số.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại phải gồm 10 số."**.

- [ ] **AC-8**: Nhập địa chỉ nhà xe nhận hàng
  - Tại: mục **"Thông tin chung"**, trường **"Địa chỉ nhà xe nhận hàng"**.
  - Khi: chủ garage nhập địa chỉ nhà xe nhận hàng.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập địa chỉ nhận hàng"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Địa chỉ nhà xe nhận hàng là bắt buộc."**.

- [ ] **AC-9**: Nhập thông tin tuyến xe
  - Tại: mục **"Thông tin chung"**, trường **"Thông tin tuyến xe"**.
  - Khi: chủ garage nhập thông tin tuyến xe.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tuyến xe/chuyến xe"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Thông tin tuyến xe là bắt buộc."**.

- [ ] **AC-10**: Nhập thời gian xe chạy
  - Tại: mục **"Thông tin chung"**, trường **"Thời gian xe chạy"**.
  - Khi: chủ garage nhập thời gian xe chạy.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập thời gian xe chạy"**. Trường này bắt buộc. Định dạng: giờ:phút (hh:mm), có thể nhập nhiều giá trị cách nhau bằng dấu phẩy.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Thời gian xe chạy là bắt buộc."**.

- [ ] **AC-11**: Nhập ghi chú
  - Tại: mục **"Thông tin chung"**, trường **"Ghi chú"**.
  - Khi: chủ garage nhập ghi chú.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

### Nhóm C — Phân quyền

- [ ] **AC-12**: Phân quyền tạo nhà xe liên kết
  - Tại: màn hình Danh sách nhà xe liên kết.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Thêm nhà xe liên kết"** và có quyền tạo nhà xe liên kết. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-13**: Số điện thoại đã tồn tại
  - Tại: form tạo nhà xe liên kết, sau khi nhấn xác nhận tạo.
  - Khi: số điện thoại đã tồn tại trong danh sách nhà xe liên kết của garage.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại đã tồn tại."**. Form giữ nguyên dữ liệu đã nhập.

- [ ] **AC-14**: Validation form thất bại
  - Tại: form tạo nhà xe liên kết, sau khi nhấn nút **"Tạo mới"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-6 đến AC-11) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-15**: Tạo nhà xe liên kết thất bại do lỗi hệ thống
  - Tại: form tạo nhà xe liên kết, sau khi nhấn xác nhận tạo.
  - Khi: hệ thống tạo nhà xe liên kết thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với mô tả **"Không thể lưu thông tin nhà xe liên kết. Vui lòng thử lại sau."**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-system` (qua BFF `agg-garage-graph`)
- Tạo nhà xe liên kết: Mutation `CreateTenantTransporterRegistry`

## 5. Business Rules

- **BR-CAT-TRANS-CRE-001**: Số điện thoại nhà xe liên kết không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo và thông báo lỗi.
- **BR-CAT-TRANS-CRE-002**: Số điện thoại phải đúng 10 chữ số.
- **BR-CAT-TRANS-CRE-003**: Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy.
- **BR-CAT-TRANS-CRE-004**: Trạng thái nhà xe liên kết mặc định khi tạo là **"Đang hoạt động"**.
- **BR-CAT-TRANS-CRE-005**: Các trường bắt buộc khi tạo: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy.

## 6. Edge Cases

- **EC-1**: Chủ garage nhấn **"Huỷ bỏ"** khi form trống — hệ thống quay về Danh sách nhà xe liên kết mà không hiển thị dialog xác nhận.
- **EC-2**: Chủ garage nhập số điện thoại đã tồn tại trong garage — hệ thống từ chối tạo và hiển thị thông báo lỗi dưới trường số điện thoại.

## 7. Out of Scope

- Danh sách nhà xe liên kết → xem `FEAT-CAT-TRANS-LIST`.
- Chỉnh sửa nhà xe liên kết → xem `FEAT-CAT-TRANS-EDIT`.
- Xóa nhà xe liên kết → xem `FEAT-CAT-TRANS-DELETE`.
- Quản lý nhà cung cấp, danh mục dịch vụ, hàng hóa → thuộc các FEAT khác trong `EP-CATALOG`.
- Báo giá, mua hàng và theo dõi đơn hàng → xem `EP-PROCUREMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-system + garage-web (linked-transporters-create screen, CreateTenantTransporterRegistry mutation) |
| 2026-05-20 | 2 | Business Authority | Đổi tên "nhà vận chuyển" → "nhà xe liên kết" toàn bộ file (tiêu đề, metadata, user story). |
