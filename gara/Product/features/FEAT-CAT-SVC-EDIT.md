---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CATALOG"
boundary: "gf-erp-mdm"
last_reviewed: "2026-05-27"
---

# FEAT-CAT-SVC-EDIT: Chỉnh sửa dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-SVC-EDIT` |
| Title | Chỉnh sửa dịch vụ |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-erp-mdm` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin dịch vụ đã tồn tại, **so that** tôi có thể cập nhật giá bán, đơn vị hoặc mô tả dịch vụ cho phù hợp với thực tế vận hành.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa dịch vụ
  - Tại: màn hình Danh sách dịch vụ, cột **"Thao tác"**.
  - Khi: chủ garage nhấn biểu tượng chỉnh sửa của dòng dịch vụ.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa dịch vụ"** với form đã điền sẵn dữ liệu hiện tại của dịch vụ, gồm 2 mục: **"Thông tin cơ bản"** và **"Hình ảnh & mô tả"**.

- [ ] **AC-2**: Lưu chỉnh sửa dịch vụ thành công
  - Tại: form chỉnh sửa dịch vụ, sau khi nhấn nút **"Lưu lại"**.
  - Khi: hệ thống cập nhật dịch vụ thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật dịch vụ thành công."**. Hệ thống chuyển về màn hình Danh sách dịch vụ. Dữ liệu cập nhật được phản ánh trong danh sách.

- [ ] **AC-3**: Điều kiện nút lưu lại
  - Tại: cuối form chỉnh sửa dịch vụ, nút **"Lưu lại"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên dịch vụ, Đơn vị, Giá bán) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu lại"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Lưu lại"** ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ chỉnh sửa dịch vụ
  - Tại: form chỉnh sửa dịch vụ, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form và quay về màn hình Danh sách dịch vụ. Thay đổi chưa lưu không được áp dụng.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-5**: Chỉnh sửa tên dịch vụ
  - Tại: mục **"Thông tin cơ bản"**, trường **"Tên dịch vụ"**.
  - Khi: chủ garage chỉnh sửa tên dịch vụ.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại đã điền sẵn. Placeholder: **"Nhập tên dịch vụ"**. Trường này bắt buộc. Giới hạn tối đa 200 ký tự.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên dịch vụ không được để trống"**.
  - Khi: chủ garage nhập vượt quá 200 ký tự.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên dịch vụ không được vượt quá 200 ký tự"**.

- [ ] **AC-6**: Hiển thị mã dịch vụ
  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã dịch vụ"**.
  - Khi: chủ garage đang ở form chỉnh sửa dịch vụ.
  - Thì: trường **"Mã dịch vụ"** hiển thị giá trị hiện tại với placeholder: **"Mã dịch vụ"**. Trường này không bắt buộc.

- [ ] **AC-7**: Chỉnh sửa đơn vị
  - Tại: mục **"Thông tin cơ bản"**, trường **"Đơn vị"**.
  - Khi: chủ garage chỉnh sửa đơn vị.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại đã điền sẵn. Placeholder: **"Chọn đơn vị"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô chọn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Đơn vị không được để trống"**.

- [ ] **AC-8**: Chỉnh sửa giá bán
  - Tại: mục **"Thông tin cơ bản"**, trường **"Giá bán"**.
  - Khi: chủ garage chỉnh sửa giá bán.
  - Thì: hệ thống hiển thị ô nhập số với giá trị hiện tại đã điền sẵn. Placeholder: **"Nhập giá bán"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán không được để trống"**.
  - Khi: chủ garage nhập giá trị không phải số.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán phải là số"**.
  - Khi: chủ garage nhập giá trị nhỏ hơn 0.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán phải lớn hơn hoặc bằng 0"**.

#### Mục: Hình ảnh & mô tả

- [ ] **AC-9**: Chỉnh sửa mô tả
  - Tại: mục **"Hình ảnh & mô tả"**, trường **"Mô tả"**.
  - Khi: chủ garage chỉnh sửa mô tả dịch vụ.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại đã điền sẵn. Placeholder: **"Nhập mô tả"**. Trường này không bắt buộc.

- [ ] **AC-10**: Chỉnh sửa hình ảnh
  - Tại: mục **"Hình ảnh & mô tả"**, khu vực **"Hình ảnh"**.
  - Khi: chủ garage thay đổi hình ảnh cho dịch vụ.
  - Thì: hệ thống cho phép tải lên hoặc xóa hình ảnh minh họa cho dịch vụ. Trường này không bắt buộc.

### Nhóm C — Phân quyền

- [ ] **AC-11**: Phân quyền chỉnh sửa dịch vụ
  - Tại: màn hình Danh sách dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy biểu tượng chỉnh sửa trong cột **"Thao tác"** và có quyền chỉnh sửa dịch vụ.

### Nhóm D — Xử lý lỗi

- [ ] **AC-12**: Validation form thất bại
  - Tại: form chỉnh sửa dịch vụ, sau khi nhấn nút **"Lưu lại"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-8) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-13**: Cập nhật dịch vụ thất bại do lỗi hệ thống
  - Tại: form chỉnh sửa dịch vụ, sau khi nhấn nút **"Lưu lại"**.
  - Khi: hệ thống cập nhật dịch vụ thất bại do lỗi.
  - Thì: hệ thống hiển thị toast lỗi. Form giữ nguyên dữ liệu đã chỉnh sửa để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-erp-mdm` (qua BFF `agg-garage-graph`)
- Lấy chi tiết dịch vụ: Query `GetServiceById`
- Cập nhật dịch vụ: Mutation (Update Service)
- Danh mục đơn vị: từ danh mục hệ thống (gf-erp-mdm)

## 5. Business Rules

- **BR-CAT-SVC-EDT-001**: Tên dịch vụ là trường bắt buộc, không được để trống, giới hạn tối đa 200 ký tự.
- **BR-CAT-SVC-EDT-002**: Đơn vị là trường bắt buộc, không được để trống. Danh sách đơn vị được lấy từ danh mục hệ thống.
- **BR-CAT-SVC-EDT-003**: Giá bán là trường bắt buộc, phải là số và phải lớn hơn hoặc bằng 0.
- **BR-CAT-SVC-EDT-004**: Mã dịch vụ là trường không bắt buộc.
- **BR-CAT-SVC-EDT-005**: Chỉ chỉnh sửa được dịch vụ thuộc phạm vi garage hiện tại — không ảnh hưởng đến danh mục dịch vụ của garage khác.

## 6. Edge Cases

- **EC-1**: Chủ garage mở form chỉnh sửa nhưng không thay đổi gì và nhấn **"Lưu lại"** — hệ thống vẫn gửi yêu cầu cập nhật.
- **EC-2**: Dịch vụ đang được sử dụng trong phiếu dịch vụ — việc chỉnh sửa thông tin dịch vụ không ảnh hưởng đến các phiếu dịch vụ đã tạo trước đó.

## 7. Out of Scope

- Danh sách dịch vụ và tìm kiếm → xem `FEAT-CAT-SVC-LIST`.
- Tạo dịch vụ mới → xem `FEAT-CAT-SVC-CREATE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (inventory-services-id-edit screen, GetServiceById query, form fields, validation rules) |
