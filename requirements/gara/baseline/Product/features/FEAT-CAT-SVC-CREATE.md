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

# FEAT-CAT-SVC-CREATE: Tạo dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-SVC-CREATE` |
| Title | Tạo dịch vụ |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-erp-mdm` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo dịch vụ mới với đầy đủ thông tin cơ bản và mô tả, **so that** garage có thể bổ sung danh mục dịch vụ phục vụ cho phiếu dịch vụ và báo giá.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo dịch vụ
  - Tại: màn hình Danh sách dịch vụ.
  - Khi: chủ garage nhấn nút **"Tạo dịch vụ mới"**.
  - Thì: hệ thống chuyển sang màn hình **"Tạo dịch vụ mới"** với form trống, gồm 2 mục: **"Thông tin cơ bản"** và **"Hình ảnh & mô tả"**.

- [ ] **AC-2**: Tạo dịch vụ thành công
  - Tại: form tạo dịch vụ, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo dịch vụ thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo dịch vụ thành công."**. Hệ thống chuyển về màn hình Danh sách dịch vụ. Dịch vụ mới xuất hiện trong danh sách.

- [ ] **AC-3**: Điều kiện nút tạo mới
  - Tại: cuối form tạo dịch vụ, nút **"Tạo mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên dịch vụ, Đơn vị, Giá bán) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Tạo mới"** ở trạng thái bị mờ (disabled).

- [ ] **AC-4**: Hủy bỏ tạo dịch vụ
  - Tại: form tạo dịch vụ, nút **"Huỷ bỏ"**.
  - Khi: chủ garage nhấn nút **"Huỷ bỏ"**.
  - Thì: hệ thống đóng form và quay về màn hình Danh sách dịch vụ. Dữ liệu đã nhập trên form không được lưu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-5**: Nhập tên dịch vụ
  - Tại: mục **"Thông tin cơ bản"**, trường **"Tên dịch vụ"**.
  - Khi: chủ garage nhập tên dịch vụ.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tên dịch vụ"**. Trường này bắt buộc. Giới hạn tối đa 200 ký tự.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên dịch vụ không được để trống"**.
  - Khi: chủ garage nhập vượt quá 200 ký tự.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Tên dịch vụ không được vượt quá 200 ký tự"**.

- [ ] **AC-6**: Hiển thị mã dịch vụ
  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã dịch vụ"**.
  - Khi: chủ garage đang ở form tạo dịch vụ mới.
  - Thì: trường **"Mã dịch vụ"** hiển thị với placeholder: **"Mã dịch vụ"**. Trường này không bắt buộc.

- [ ] **AC-7**: Chọn đơn vị
  - Tại: mục **"Thông tin cơ bản"**, trường **"Đơn vị"**.
  - Khi: chủ garage chọn đơn vị.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn đơn vị"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô chọn.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Đơn vị không được để trống"**.

- [ ] **AC-8**: Nhập giá bán
  - Tại: mục **"Thông tin cơ bản"**, trường **"Giá bán"**.
  - Khi: chủ garage nhập giá bán.
  - Thì: hệ thống hiển thị ô nhập số. Placeholder: **"Nhập giá bán"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán không được để trống"**.
  - Khi: chủ garage nhập giá trị không phải số.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán phải là số"**.
  - Khi: chủ garage nhập giá trị nhỏ hơn 0.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Giá bán phải lớn hơn hoặc bằng 0"**.

#### Mục: Hình ảnh & mô tả

- [ ] **AC-9**: Nhập mô tả
  - Tại: mục **"Hình ảnh & mô tả"**, trường **"Mô tả"**.
  - Khi: chủ garage nhập mô tả dịch vụ.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mô tả"**. Trường này không bắt buộc.

- [ ] **AC-10**: Tải hình ảnh
  - Tại: mục **"Hình ảnh & mô tả"**, khu vực **"Hình ảnh"**.
  - Khi: chủ garage tải lên hình ảnh cho dịch vụ.
  - Thì: hệ thống cho phép tải hình ảnh minh họa cho dịch vụ. Trường này không bắt buộc.

### Nhóm C — Phân quyền

- [ ] **AC-11**: Phân quyền tạo dịch vụ
  - Tại: màn hình Danh sách dịch vụ.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Tạo dịch vụ mới"** và có quyền tạo dịch vụ.

### Nhóm D — Xử lý lỗi

- [ ] **AC-12**: Validation form thất bại
  - Tại: form tạo dịch vụ, sau khi nhấn nút **"Tạo mới"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-5 đến AC-8) và không gửi yêu cầu lên hệ thống.

- [ ] **AC-13**: Tạo dịch vụ thất bại do lỗi hệ thống
  - Tại: form tạo dịch vụ, sau khi nhấn nút **"Tạo mới"**.
  - Khi: hệ thống tạo dịch vụ thất bại do lỗi.
  - Thì: hệ thống hiển thị toast lỗi. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-erp-mdm` (qua BFF `agg-garage-graph`)
- Tạo dịch vụ: Mutation (Create Service)
- Danh mục đơn vị: từ danh mục hệ thống (gf-erp-mdm)

## 5. Business Rules

- **BR-CAT-SVC-CRE-001**: Tên dịch vụ là trường bắt buộc, không được để trống, giới hạn tối đa 200 ký tự.
- **BR-CAT-SVC-CRE-002**: Đơn vị là trường bắt buộc, không được để trống. Danh sách đơn vị được lấy từ danh mục hệ thống.
- **BR-CAT-SVC-CRE-003**: Giá bán là trường bắt buộc, phải là số và phải lớn hơn hoặc bằng 0.
- **BR-CAT-SVC-CRE-004**: Mã dịch vụ là trường không bắt buộc.
- **BR-CAT-SVC-CRE-005**: Dịch vụ được tạo thuộc phạm vi garage hiện tại — không ảnh hưởng đến danh mục dịch vụ của garage khác.

## 6. Edge Cases

- **EC-1**: Chủ garage nhập giá bán bằng 0 — hệ thống chấp nhận vì giá bán chỉ cần lớn hơn hoặc bằng 0.
- **EC-2**: Chủ garage nhập tên dịch vụ đúng 200 ký tự — hệ thống chấp nhận vì nằm trong giới hạn cho phép.

## 7. Out of Scope

- Danh sách dịch vụ và tìm kiếm → xem `FEAT-CAT-SVC-LIST`.
- Chỉnh sửa thông tin dịch vụ sau khi tạo → xem `FEAT-CAT-SVC-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (inventory-services-create screen, form fields, validation rules) |
