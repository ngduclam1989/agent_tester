| https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87561&t=W7XJPVvhmdBPtv2c-4 |
| ---------------------------------------------------------------------------------------------------- |
| https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87562&t=W7XJPVvhmdBPtv2c-4 |
| https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87563&t=W7XJPVvhmdBPtv2c-4 |
| https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14146-87564&t=W7XJPVvhmdBPtv2c-4 |
| https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14492-89261&t=W7XJPVvhmdBPtv2c-4 |

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
# FEAT-CAT-SUP-CREATE: Tạo nhà cung cấp

---

## Metadata

| Field       | Value                   |
| ----------- | ----------------------- |
| Feature ID  | `FEAT-CAT-SUP-CREATE` |
| Title       | Tạo nhà cung cấp     |
| Parent Epic | `EP-CATALOG`          |
| Boundary    | `gf-purchase`         |
| Priority    | P1                      |
| Status      | PLANNED                 |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo nhà cung cấp mới với thông tin cơ bản và địa chỉ, **so that** garage có thể quản lý nhà cung cấp phục vụ mua hàng trực tiếp.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, nhập thông tin và lưu

- [ ] **AC-1**: Mở màn hình tạo nhà cung cấp

  - Tại: màn hình Danh sách nhà cung cấp.
  - Khi: chủ garage nhấn nút **"Thêm nhà cung cấp"**.
  - Thì: hệ thống chuyển sang màn hình **"Thêm nhà cung cấp"** với form trống, gồm 2 mục: **"Thông tin cơ bản"** và **"Thông tin địa chỉ"**.
- [ ] **AC-2**: Xác nhận tạo nhà cung cấp

  - Tại: form tạo nhà cung cấp, sau khi nhấn nút **"Thêm mới"**.
  - Khi: chủ garage nhấn nút **"Thêm mới"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Xác nhận thêm nhà cung cấp"** và nội dung **"Bạn có chắc chắn muốn thêm nhà cung cấp này?"**. Modal có hai nút: **"Hủy"** và **"Xác nhận"**.
- [ ] **AC-3**: Tạo nhà cung cấp thành công

  - Tại: modal xác nhận tạo nhà cung cấp.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống tạo nhà cung cấp thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo mới nhà cung cấp thành công."**. Mã nhà cung cấp được hệ thống tự sinh. Trạng thái nhà cung cấp khởi tạo theo giá trị đã chọn trong form (mặc định **"Đang hoạt động"**). Nguồn tạo tự động gán là **"Garage"**.
- [ ] **AC-4**: Điều kiện nút Thêm mới

  - Tại: cuối form tạo nhà cung cấp, nút **"Thêm mới"**.
  - Khi: chủ garage đã điền đủ các trường bắt buộc (Tên nhà cung cấp, Số điện thoại) và hệ thống không đang gửi yêu cầu.
  - Thì: nút **"Thêm mới"** ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút **"Thêm mới"** ở trạng thái bị mờ (disabled).
- [ ] **AC-5**: Tiếp tục thêm nhà cung cấp sau khi tạo thành công

  - Tại: sau khi tạo nhà cung cấp thành công.
  - Khi: hệ thống hiển thị tùy chọn **"Tiếp tục thêm nhà cung cấp"**.
  - Thì: nếu chủ garage chọn tiếp tục, form được làm mới để nhập nhà cung cấp tiếp theo. Nếu không, hệ thống quay về màn hình Danh sách nhà cung cấp.
- [ ] **AC-6**: Hủy bỏ tạo nhà cung cấp

  - Tại: form tạo nhà cung cấp, nút **"Hủy"**.
  - Khi: chủ garage nhấn nút **"Hủy"** và form đã có dữ liệu nhập.
  - Thì: hệ thống hiển thị modal cảnh báo với nội dung **"Dữ liệu đã nhập sẽ bị mất nếu bạn rời khỏi màn hình này."** và nút **"Tiếp tục"** (ở lại) hoặc xác nhận rời đi. Nếu chủ garage xác nhận rời đi, hệ thống quay về màn hình Danh sách nhà cung cấp và không lưu dữ liệu.

### Nhóm B — Chi tiết từng mục form

#### Mục: Thông tin cơ bản

- [ ] **AC-7**: Nhập mã nhà cung cấp

  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã nhà cung cấp"**.
  - Khi: chủ garage nhập mã nhà cung cấp.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mã nhà cung cấp"**. Trường này không bắt buộc — nếu bỏ trống, hệ thống tự sinh mã theo định dạng chuẩn.
- [ ] **AC-8**: Nhập tên nhà cung cấp

  - Tại: mục **"Thông tin cơ bản"**, trường **"Tên nhà cung cấp"**.
  - Khi: chủ garage nhập tên nhà cung cấp.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập tên nhà cung cấp"**. Trường này bắt buộc.
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập tên nhà cung cấp."**.
- [ ] **AC-9**: Nhập số điện thoại

  - Tại: mục **"Thông tin cơ bản"**, trường **"Số điện thoại"**.
  - Khi: chủ garage nhập số điện thoại.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số điện thoại"**. Trường này bắt buộc (đối với nhà cung cấp nguồn **"Garage"**).
  - Khi: chủ garage bỏ trống trường này và rời khỏi ô nhập.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Vui lòng nhập số điện thoại nhà cung cấp."**.
  - Khi: chủ garage nhập số điện thoại không đúng định dạng.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Số điện thoại không đúng định dạng."**.
- [ ] **AC-10**: Nhập mã số thuế

  - Tại: mục **"Thông tin cơ bản"**, trường **"Mã số thuế"**.
  - Khi: chủ garage nhập mã số thuế.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập mã số thuế"**. Trường này không bắt buộc.
- [ ] **AC-11**: Chọn kho ưu tiên nhận hàng

  - Tại: mục **"Thông tin cơ bản"**, trường **"Kho ưu tiên nhận hàng"**.
  - Khi: chủ garage chọn kho ưu tiên.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn kho ưu tiên"**. Trường này không bắt buộc. Danh sách kho được lấy từ danh mục kho (Query `SearchWarehouses`). Các giá trị ưu tiên: **"Kho ưu tiên 1"**, **"Kho ưu tiên 2"**, **"Kho ưu tiên 3"**.
- [ ] **AC-12**: Chọn điều khoản thanh toán

  - Tại: mục **"Thông tin cơ bản"**, trường **"Điều khoản thanh toán"**.
  - Khi: chủ garage chọn điều khoản thanh toán.
  - Thì: hệ thống hiển thị ô chọn. Placeholder: **"Chọn điều khoản"**. Trường này không bắt buộc. Các tùy chọn:
    - **"COD (Thanh toán khi nhận hàng)"**
    - **"Trong vòng 7 ngày"**
    - **"Trong vòng 15 ngày"**
    - **"Trong vòng 30 ngày"**
    - **"Trong vòng 60 ngày"**
    - **"Thanh toán sau"**
- [ ] **AC-13**: Chọn trạng thái hoạt động

  - Tại: mục **"Thông tin cơ bản"**, trường **"Trạng thái hoạt động"**.
  - Khi: chủ garage chọn trạng thái hoạt động.
  - Thì: hệ thống hiển thị toggle/switch cho phép bật/tắt. Giá trị mặc định: **"Đang hoạt động"**. Hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**.

#### Mục: Thông tin địa chỉ

- [ ] **AC-14**: Chọn tỉnh/thành phố

  - Tại: mục **"Thông tin địa chỉ"**, trường tỉnh/thành phố.
  - Khi: chủ garage chọn tỉnh/thành phố.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn tỉnh/thành phố"**. Trường này không bắt buộc.
- [ ] **AC-15**: Chọn phường/xã

  - Tại: mục **"Thông tin địa chỉ"**, trường phường/xã.
  - Khi: chủ garage chọn phường/xã.
  - Thì: hệ thống hiển thị ô chọn có tìm kiếm. Placeholder: **"Chọn phường/xã"**. Trường này không bắt buộc.
- [ ] **AC-16**: Nhập địa chỉ cụ thể

  - Tại: mục **"Thông tin địa chỉ"**, trường địa chỉ cụ thể.
  - Khi: chủ garage nhập địa chỉ cụ thể.
  - Thì: hệ thống hiển thị ô nhập text. Placeholder: **"Nhập số nhà, đường, phố"**. Trường này không bắt buộc.

### Nhóm C — Phân quyền

- [ ] **AC-17**: Phân quyền tạo nhà cung cấp
  - Tại: màn hình Danh sách nhà cung cấp.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều nhìn thấy nút **"Thêm nhà cung cấp"** và có quyền tạo nhà cung cấp. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-18**: Số điện thoại đã tồn tại

  - Tại: modal xác nhận tạo nhà cung cấp, sau khi nhấn **"Xác nhận"**.
  - Khi: số điện thoại đã tồn tại trong hệ thống của garage.
  - Thì: hệ thống hiển thị thông báo lỗi cho biết số điện thoại đã được sử dụng bởi nhà cung cấp khác trong cùng garage. Form giữ nguyên dữ liệu đã nhập.
- [ ] **AC-19**: Tạo nhà cung cấp thất bại do lỗi hệ thống

  - Tại: modal xác nhận tạo nhà cung cấp, sau khi nhấn **"Xác nhận"**.
  - Khi: hệ thống tạo nhà cung cấp thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thất bại"** và mô tả **"Tạo mới nhà cung cấp thất bại, vui lòng thử lại."**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.
- [ ] **AC-20**: Validation form thất bại

  - Tại: form tạo nhà cung cấp, sau khi nhấn nút **"Thêm mới"**.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm (xem AC-8, AC-9) và không gửi yêu cầu lên hệ thống.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-purchase` (qua BFF `agg-garage-graph`)
- Tạo nhà cung cấp: Mutation `CreateSupplier`
- Danh sách kho: Query `SearchWarehouses`

## 5. Business Rules

- **BR-CAT-SUP-CRE-001**: Số điện thoại nhà cung cấp không được trùng trong cùng một garage. Nếu trùng, hệ thống từ chối tạo và thông báo lỗi.
- **BR-CAT-SUP-CRE-002**: Mã nhà cung cấp được hệ thống tự sinh nếu không nhập thủ công — không cho phép trùng mã trong cùng garage.
- **BR-CAT-SUP-CRE-003**: Nhà cung cấp tạo từ giao diện garage luôn có nguồn tạo là **"Garage"**. Nhà cung cấp nguồn **"CarDoctor"** chỉ được đồng bộ từ hệ thống, không cho phép tạo thủ công.
- **BR-CAT-SUP-CRE-004**: Trường Số điện thoại bắt buộc đối với nhà cung cấp nguồn **"Garage"**.
- **BR-CAT-SUP-CRE-005**: Điều khoản thanh toán chỉ chấp nhận các giá trị: **"COD (Thanh toán khi nhận hàng)"**, **"Trong vòng 7 ngày"**, **"Trong vòng 15 ngày"**, **"Trong vòng 30 ngày"**, **"Trong vòng 60 ngày"**, **"Thanh toán sau"**.

## 6. Edge Cases

- **EC-1**: Chủ garage nhập mã nhà cung cấp thủ công trùng với mã đã tồn tại — hệ thống báo lỗi trùng mã.
- **EC-2**: Chủ garage không chọn kho ưu tiên — hệ thống cho phép lưu vì trường không bắt buộc.
- **EC-3**: Chủ garage không chọn điều khoản thanh toán — hệ thống cho phép lưu vì trường không bắt buộc.

## 7. Out of Scope

- Chỉnh sửa nhà cung cấp sau khi tạo → xem `FEAT-CAT-SUP-EDIT`.
- Danh sách nhà cung cấp → xem `FEAT-CAT-SUP-LIST`.
- Tạo đơn mua hàng trực tiếp từ nhà cung cấp → thuộc `EP-PROCUREMENT`.
- Đồng bộ nhà cung cấp từ CarDoctor — thuộc luồng nội bộ hệ thống.

## 8. Change Log

| Date       | Version | Author             | Description                                                                                        |
| ---------- | ------- | ------------------ | -------------------------------------------------------------------------------------------------- |
| 2026-05-20 | 1       | Business Authority | Khởi tạo FEAT từ KG gf-purchase + garage-web (suppliers-create screen, CreateSupplier mutation) |
