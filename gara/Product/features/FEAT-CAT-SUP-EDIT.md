---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-CATALOG"
boundary: "gf-purchase"
last_reviewed: "2026-05-27"
---

# FEAT-CAT-SUP-EDIT: Chỉnh sửa nhà cung cấp

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-SUP-EDIT` |
| Title | Chỉnh sửa nhà cung cấp |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-purchase` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** chỉnh sửa thông tin nhà cung cấp hiện có, **so that** tôi có thể cập nhật thông tin nhà cung cấp khi cần thiết.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, chỉnh sửa và lưu

- [ ] **AC-1**: Mở màn hình chỉnh sửa nhà cung cấp
  - Tại: màn hình Chi tiết nhà cung cấp hoặc cột Thao tác trên danh sách.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"** hoặc icon sửa.
  - Thì: hệ thống chuyển sang màn hình **"Chỉnh sửa nhà cung cấp"** với form được điền sẵn dữ liệu hiện tại của nhà cung cấp, gồm 2 mục: **"Thông tin cơ bản"** và **"Thông tin địa chỉ"**. Ngoài ra hiển thị các trường chỉ đọc: **"Ngày tạo"**, **"Ngày cập nhật"**, **"Nguồn"**.

- [ ] **AC-2**: Xác nhận lưu chỉnh sửa
  - Tại: form chỉnh sửa nhà cung cấp, sau khi nhấn nút **"Lưu chỉnh sửa"**.
  - Khi: chủ garage nhấn nút **"Lưu chỉnh sửa"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Xác nhận lưu chỉnh sửa"** và nội dung **"Bạn có chắc chắn muốn lưu các thay đổi này?"**. Modal có hai nút: **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-3**: Cập nhật nhà cung cấp thành công
  - Tại: modal xác nhận lưu chỉnh sửa.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống cập nhật nhà cung cấp thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cập nhật nhà cung cấp thành công."**.

- [ ] **AC-4**: Điều kiện nút Lưu chỉnh sửa
  - Tại: cuối form chỉnh sửa nhà cung cấp, nút **"Lưu chỉnh sửa"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên nhà cung cấp, Số điện thoại) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Lưu chỉnh sửa"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Lưu chỉnh sửa"** ở trạng thái bị mờ (disabled).

- [ ] **AC-5**: Hủy bỏ chỉnh sửa
  - Tại: form chỉnh sửa nhà cung cấp, nút **"Hủy"**.
  - Khi: chủ garage nhấn nút **"Hủy"** và form đã có thay đổi so với dữ liệu ban đầu.
  - Thì: hệ thống hiển thị modal cảnh báo với nội dung **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** và nút **"Tiếp tục"** (ở lại) hoặc xác nhận rời đi. Nếu chủ garage xác nhận rời đi, hệ thống quay về màn hình trước đó và không lưu thay đổi.

- [ ] **AC-6**: Tiếp tục chỉnh sửa sau khi cập nhật thành công
  - Tại: sau khi cập nhật nhà cung cấp thành công.
  - Khi: hệ thống hiển thị tùy chọn **"Tiếp tục chỉnh sửa nhà cung cấp"**.
  - Thì: nếu chủ garage chọn tiếp tục, form được giữ nguyên tại màn hình chỉnh sửa với dữ liệu đã cập nhật. Nếu không, hệ thống quay về màn hình trước đó.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-7**: Trường mã nhà cung cấp (chỉ đọc)
  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã nhà cung cấp"**.
  - Khi: hệ thống hiển thị form chỉnh sửa.
  - Thì: trường **"Mã nhà cung cấp"** hiển thị giá trị mã hiện tại. Placeholder: **"Nhập mã nhà cung cấp"**. Trường này không cho phép chỉnh sửa mã đã sinh.

- [ ] **AC-8**: Chỉnh sửa tên nhà cung cấp
  - Tại: mục **"Thông tin cơ bản"**, trường **"Tên nhà cung cấp"**.
  - Khi: chủ garage chỉnh sửa tên nhà cung cấp.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập tên nhà cung cấp"**. Trường này bắt buộc.
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên nhà cung cấp."**.

- [ ] **AC-9**: Chỉnh sửa số điện thoại
  - Tại: mục **"Thông tin cơ bản"**, trường **"Số điện thoại"**.
  - Khi: chủ garage chỉnh sửa số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc (đối với nhà cung cấp nguồn **"Garage"**).
  - Khi: chủ garage xóa trắng trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại nhà cung cấp."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng."**.

- [ ] **AC-10**: Chỉnh sửa mã số thuế
  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã số thuế"**.
  - Khi: chủ garage chỉnh sửa mã số thuế.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập mã số thuế"**. Trường này không bắt buộc.

- [ ] **AC-11**: Chỉnh sửa kho ưu tiên nhận hàng
  - Tại: mục **"Thông tin cơ bản"**, trường **"Kho ưu tiên nhận hàng"**.
  - Khi: chủ garage chỉnh sửa kho ưu tiên.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại. Placeholder: **"Chọn kho ưu tiên"**. Trường này không bắt buộc. Danh sách kho được lấy từ danh mục kho (Query `SearchWarehouses`). Các giá trị ưu tiên: **"Kho ưu tiên 1"**, **"Kho ưu tiên 2"**, **"Kho ưu tiên 3"**.

- [ ] **AC-12**: Chỉnh sửa điều khoản thanh toán
  - Tại: mục **"Thông tin cơ bản"**, trường **"Điều khoản thanh toán"**.
  - Khi: chủ garage chỉnh sửa điều khoản thanh toán.
  - Thì: hệ thống hiển thị ô chọn với giá trị hiện tại. Placeholder: **"Chọn điều khoản"**. Trường này không bắt buộc. Các tùy chọn:
    - **"COD (Thanh toán khi nhận hàng)"**
    - **"Trong vòng 7 ngày"**
    - **"Trong vòng 15 ngày"**
    - **"Trong vòng 30 ngày"**
    - **"Trong vòng 60 ngày"**
    - **"Thanh toán sau"**

- [ ] **AC-13**: Chỉnh sửa trạng thái hoạt động
  - Tại: mục **"Thông tin cơ bản"**, trường **"Trạng thái hoạt động"**.
  - Khi: chủ garage chỉnh sửa trạng thái hoạt động.
  - Thì: hệ thống hiển thị toggle/switch cho phép bật/tắt. Hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**.

#### Mục: Thông tin địa chỉ

- [ ] **AC-14**: Chỉnh sửa tỉnh/thành phố
  - Tại: mục **"Thông tin địa chỉ"**, trường tỉnh/thành phố.
  - Khi: chủ garage chỉnh sửa tỉnh/thành phố.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn tỉnh/thành phố"**. Trường này không bắt buộc.

- [ ] **AC-15**: Chỉnh sửa phường/xã
  - Tại: mục **"Thông tin địa chỉ"**, trường phường/xã.
  - Khi: chủ garage chỉnh sửa phường/xã.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm với giá trị hiện tại. Placeholder: **"Chọn phường/xã"**. Trường này không bắt buộc.

- [ ] **AC-16**: Chỉnh sửa địa chỉ cụ thể
  - Tại: mục **"Thông tin địa chỉ"**, trường địa chỉ cụ thể.
  - Khi: chủ garage chỉnh sửa địa chỉ cụ thể.
  - Thì: hệ thống hiển thị ô nhập text với giá trị hiện tại. Placeholder: **"Nhập số nhà, đường, phố"**. Trường này không bắt buộc.

### Nhóm C — Phân quyền và giới hạn theo nguồn tạo

- [ ] **AC-17**: Phân quyền chỉnh sửa nhà cung cấp
  - Tại: màn hình Chi tiết nhà cung cấp hoặc Danh sách nhà cung cấp.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút chỉnh sửa và có quyền chỉnh sửa nhà cung cấp. Không có ngoại lệ phân quyền cho chức năng này.

- [ ] **AC-18**: Giới hạn chỉnh sửa nhà cung cấp nguồn CarDoctor
  - Tại: form chỉnh sửa nhà cung cấp, nhà cung cấp có nguồn tạo **"CarDoctor"**.
  - Khi: chủ garage mở form chỉnh sửa nhà cung cấp nguồn **"CarDoctor"**.
  - Thì: hệ thống chỉ cho phép chỉnh sửa một tập trường hạn chế. Các trường đồng bộ từ CarDoctor không cho phép chỉnh sửa.

### Nhóm D — Xử lý lỗi

- [ ] **AC-19**: Số điện thoại đã tồn tại
  - Tại: modal xác nhận lưu chỉnh sửa, sau khi nhấn **"Xác nhận"**.
  - Khi: số điện thoại mới đã tồn tại cho nhà cung cấp khác trong cùng garage.
  - Thì: hệ thống hiển thị thông báo lỗi cho biết số điện thoại đã được sử dụng. Form giữ nguyên dữ liệu đã nhập.

- [ ] **AC-20**: Cập nhật nhà cung cấp thất bại do lỗi hệ thống
  - Tại: modal xác nhận lưu chỉnh sửa, sau khi nhấn **"Xác nhận"**.
  - Khi: hệ thống cập nhật nhà cung cấp thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thất bại"** và mô tả **"Cập nhật nhà cung cấp thất bại, vui lòng thử lại."**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-21**: Validation form thất bại
  - Tại: form chỉnh sửa nhà cung cấp, sau khi nhấn nút **"Lưu chỉnh sửa"**.
  - Khi: các trường bắt buộc bị xóa trắng hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-8, AC-9) và không gửi yêu cầu lên hệ thống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Lấy thông tin nhà cung cấp: Query `GetSupplierById`
- Cập nhật nhà cung cấp: Mutation `UpdateSupplier`
- Danh sách kho: Query `SearchWarehouses`

## 5. Business Rules

- **BR-CAT-SUP-EDT-001**: Số điện thoại nhà cung cấp không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối cập nhật và thông báo lỗi.
- **BR-CAT-SUP-EDT-002**: Mã nhà cung cấp không cho phép chỉnh sửa sau khi đã tạo.
- **BR-CAT-SUP-EDT-003**: Nhà cung cấp nguồn **"Garage"** được chỉnh sửa hầu hết các trường trừ mã nhà cung cấp. Nhà cung cấp nguồn **"CarDoctor"** chỉ cho phép chỉnh sửa một tập trường hạn chế.
- **BR-CAT-SUP-EDT-004**: Trường Số điện thoại bắt buộc đối với nhà cung cấp nguồn **"Garage"**.
- **BR-CAT-SUP-EDT-005**: Điều khoản thanh toán chỉ chấp nhận các giá trị: **"COD (Thanh toán khi nhận hàng)"**, **"Trong vòng 7 ngày"**, **"Trong vòng 15 ngày"**, **"Trong vòng 30 ngày"**, **"Trong vòng 60 ngày"**, **"Thanh toán sau"**.

## 6. Edge Cases

- **EC-1**: Nhà cung cấp nguồn **"CarDoctor"** — một số trường đồng bộ từ hệ thống CarDoctor hiển thị chỉ đọc, không cho phép chỉnh sửa.
- **EC-2**: Nhà cung cấp đang có đơn hàng liên kết — hệ thống vẫn cho phép chỉnh sửa thông tin nhà cung cấp; đơn hàng cũ giữ nguyên snapshot thông tin tại thời điểm tạo.
- **EC-3**: Số điện thoại mới trùng với chính nhà cung cấp đang chỉnh sửa (không thay đổi) — hệ thống cho phép lưu bình thường.

## 7. Out of Scope

- Tạo nhà cung cấp mới → xem `FEAT-CAT-SUP-CREATE`.
- Danh sách nhà cung cấp → xem `FEAT-CAT-SUP-LIST`.
- Quản lý đơn mua hàng liên quan đến nhà cung cấp → thuộc `EP-PROCUREMENT`.
- Xóa nhà cung cấp — hệ thống không hỗ trợ xóa, chỉ chuyển trạng thái **"Ngừng hoạt động"**.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-purchase + garage-web (suppliers-id-edit screen, UpdateSupplier mutation, GetSupplierById query) |
