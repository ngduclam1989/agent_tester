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

# FEAT-CAT-TRANS-EDIT: Chỉnh sửa nhà xe liên kết

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-TRANS-EDIT` |
| Title | Chỉnh sửa nhà xe liên kết |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-system` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin nhà xe liên kết đã có, **so that** tôi có thể cập nhật tên, tuyến xe, số điện thoại, địa chỉ nhận hàng hoặc trạng thái khi thông tin thay đổi.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa nhà xe liên kết
  - Tại: màn hình Chi tiết nhà xe liên kết, nút **"Chỉnh sửa"**; hoặc màn hình Danh sách nhà xe liên kết, icon sửa trên dòng.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"** hoặc icon sửa.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa nhà xe liên kết"** với form được điền sẵn dữ liệu hiện tại của nhà xe liên kết, gồm mục **"Thông tin chung"** chứa các trường nhập liệu.

- [ ] **AC-2**: Xác nhận trước khi cập nhật
  - Tại: form chỉnh sửa nhà xe liên kết, sau khi nhấn nút **"Cập nhật"**.
  - Khi: chủ garage nhấn nút **"Cập nhật"**.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Xác nhận cập nhật nhà xe liên kết"** và nội dung **"Bạn có chắc chắn muốn cập nhật bản ghi {transporterName} không?"** (trong đó {transporterName} là tên nhà xe hiện tại). Dialog có hai nút: **"Đóng"** (đóng dialog, quay lại form) và **"Xác nhận"** (tiến hành cập nhật).

- [ ] **AC-3**: Cập nhật nhà xe liên kết thành công
  - Tại: dialog xác nhận cập nhật nhà xe liên kết.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống cập nhật thành công.
  - Thì: hệ thống hiển thị toast với mô tả **"Cập nhật thông tin nhà xe liên kết thành công."**. Hệ thống chuyển về màn hình Chi tiết nhà xe liên kết với dữ liệu đã cập nhật. Thông tin **"Cập nhật lúc {updatedAt}"** được cập nhật tương ứng.

- [ ] **AC-4**: Điều kiện nút cập nhật
  - Tại: cuối form chỉnh sửa nhà xe liên kết, nút **"Cập nhật"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Cập nhật"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Cập nhật"** ở trạng thái bị mờ (disabled).

- [ ] **AC-5**: Hủy bỏ chỉnh sửa nhà xe liên kết
  - Tại: form chỉnh sửa nhà xe liên kết, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"** và form có dữ liệu đã thay đổi so với ban đầu.
  - Thì: hệ thống hiển thị dialog xác nhận với tiêu đề **"Tiếp tục chỉnh sửa nhà xe liên kết"** và nội dung **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."**. Dialog có hai nút: **"Đóng"** (quay lại form tiếp tục chỉnh sửa) và **"Tiếp tục"** (rời khỏi form, quay về màn hình trước đó, thay đổi không được lưu).

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin chung

- [ ] **AC-6**: Chỉnh sửa tên nhà xe
  - Tại: mục **"Thông tin chung"**, trường **"Tên nhà xe"**.
  - Khi: chủ garage chỉnh sửa tên nhà xe.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn tên nhà xe hiện tại. Placeholder: **"Nhập tên nhà xe"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên nhà xe là bắt buộc."**.

- [ ] **AC-7**: Chỉnh sửa số điện thoại
  - Tại: mục **"Thông tin chung"**, trường **"Số điện thoại"**.
  - Khi: chủ garage chỉnh sửa số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn số điện thoại hiện tại. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc. Định dạng hợp lệ: đúng 10 chữ số.
  - Khi: chủ garage nhập số điện thoại không đúng 10 chữ số.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại phải gồm 10 số."**.

- [ ] **AC-8**: Chỉnh sửa địa chỉ nhà xe nhận hàng
  - Tại: mục **"Thông tin chung"**, trường **"Địa chỉ nhà xe nhận hàng"**.
  - Khi: chủ garage chỉnh sửa địa chỉ nhà xe nhận hàng.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn địa chỉ hiện tại. Placeholder: **"Nhập địa chỉ nhận hàng"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Địa chỉ nhà xe nhận hàng là bắt buộc."**.

- [ ] **AC-9**: Chỉnh sửa thông tin tuyến xe
  - Tại: mục **"Thông tin chung"**, trường **"Thông tin tuyến xe"**.
  - Khi: chủ garage chỉnh sửa thông tin tuyến xe.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn thông tin tuyến xe hiện tại. Placeholder: **"Nhập tuyến xe/chuyến xe"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Thông tin tuyến xe là bắt buộc."**.

- [ ] **AC-10**: Chỉnh sửa thời gian xe chạy
  - Tại: mục **"Thông tin chung"**, trường **"Thời gian xe chạy"**.
  - Khi: chủ garage chỉnh sửa thời gian xe chạy.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn thời gian hiện tại. Placeholder: **"Nhập thời gian xe chạy"**. Trường này bắt buộc. Định dạng: giờ:phút (hh:mm), có thể nhập nhiều giá trị cách nhau bằng dấu phẩy.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Thời gian xe chạy là bắt buộc."**.

- [ ] **AC-11**: Chỉnh sửa ghi chú
  - Tại: mục **"Thông tin chung"**, trường **"Ghi chú"**.
  - Khi: chủ garage chỉnh sửa ghi chú.
  - Thì: hệ thống hiển thị ô nhập text được điền sẵn ghi chú hiện tại. Placeholder: **"Nhập ghi chú"**. Trường này không bắt buộc.

- [ ] **AC-12**: Chỉnh sửa trạng thái
  - Tại: mục **"Thông tin chung"**, trường **"Trạng thái"**.
  - Khi: chủ garage chọn trạng thái mới cho nhà xe liên kết.
  - Thì: hệ thống hiển thị ô chọn với các tùy chọn: **"Đang hoạt động"**, **"Ngừng hoạt động"**. Giá trị mặc định là trạng thái hiện tại của nhà xe liên kết.

### Nhóm C — Phân quyền

- [ ] **AC-13**: Phân quyền chỉnh sửa nhà xe liên kết
  - Tại: màn hình Chi tiết nhà xe liên kết hoặc Danh sách nhà xe liên kết.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Chỉnh sửa"** / icon sửa và có quyền chỉnh sửa nhà xe liên kết. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-14**: Số điện thoại đã tồn tại
  - Tại: form chỉnh sửa nhà xe liên kết, sau khi nhấn xác nhận cập nhật.
  - Khi: số điện thoại mới đã tồn tại trong danh sách nhà xe liên kết của garage (thuộc nhà xe liên kết khác).
  - Thì: hệ thống hiển thị thông báo lỗi cho biết số điện thoại đã được sử dụng. Form giữ nguyên dữ liệu đã nhập.

- [ ] **AC-15**: Validation form thất bại
  - Tại: form chỉnh sửa nhà xe liên kết, sau khi nhấn nút **"Cập nhật"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-6 đến AC-11) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-16**: Cập nhật nhà xe liên kết thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa nhà xe liên kết, sau khi nhấn xác nhận cập nhật.
  - Khi: hệ thống cập nhật nhà xe liên kết thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với mô tả **"Không thể lưu thông tin nhà xe liên kết. Vui lòng thử lại sau."**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-system` (qua BFF `agg-garage-graph`)
- Lấy chi tiết nhà xe liên kết: Query `GetTenantTransporterRegistryDetail` (điền sẵn form)
- Cập nhật nhà xe liên kết: Mutation `UpdateTenantTransporterRegistry`

## 5. Business Rules

- **BR-CAT-TRANS-EDT-001**: Số điện thoại nhà xe liên kết không được trùng với nhà xe liên kết khác trong cùng một garage. Nếu trùng, hệ thống từ chối cập nhật và thông báo lỗi.
- **BR-CAT-TRANS-EDT-002**: Số điện thoại phải đúng 10 chữ số.
- **BR-CAT-TRANS-EDT-003**: Thời gian xe chạy theo định dạng hh:mm, có thể nhập nhiều giá trị cách nhau bằng dấu phẩy.
- **BR-CAT-TRANS-EDT-004**: Các trường bắt buộc khi cập nhật: Tên nhà xe, Số điện thoại, Địa chỉ nhà xe nhận hàng, Thông tin tuyến xe, Thời gian xe chạy.
- **BR-CAT-TRANS-EDT-005**: Trạng thái nhà xe liên kết có thể thay đổi giữa **"Đang hoạt động"** và **"Ngừng hoạt động"** khi chỉnh sửa.

## 6. Edge Cases

- **EC-1**: Chủ garage nhấn **"Huỷ bỏ"** khi form không có thay đổi — hệ thống quay về màn hình trước đó mà không hiển thị dialog xác nhận.
- **EC-2**: Chủ garage thay đổi số điện thoại thành số đã tồn tại trong garage — hệ thống từ chối cập nhật và hiển thị thông báo lỗi.
- **EC-3**: Nhà xe liên kết đã bị xóa bởi người dùng khác trong khi đang chỉnh sửa — hệ thống báo lỗi khi cập nhật.

## 7. Out of Scope

- Danh sách nhà xe liên kết → xem `FEAT-CAT-TRANS-LIST`.
- Tạo nhà xe liên kết mới → xem `FEAT-CAT-TRANS-CREATE`.
- Xóa nhà xe liên kết → xem `FEAT-CAT-TRANS-DELETE`.
- Quản lý nhà cung cấp, danh mục dịch vụ, hàng hóa → thuộc các FEAT khác trong `EP-CATALOG`.
- Báo giá, mua hàng và theo dõi đơn hàng → xem `EP-PROCUREMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-system + garage-web (linked-transporters-id-edit screen, UpdateTenantTransporterRegistry mutation) |
| 2026-05-20 | 2 | Business Authority | Đổi tên "nhà vận chuyển" → "nhà xe liên kết" toàn bộ file (tiêu đề, metadata). |
