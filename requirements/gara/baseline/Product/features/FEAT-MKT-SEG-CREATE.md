---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-MARKETING"
boundary: "gf-customer"
last_reviewed: "2026-05-27"
---

# FEAT-MKT-SEG-CREATE: Tạo phân khúc

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-SEG-CREATE` |
| Title | Tạo phân khúc |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-customer` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** tạo phân khúc khách hàng mới với các tiêu chí lọc và xem trước danh sách khách hàng phù hợp, **so that** tôi có thể nhóm khách hàng phục vụ cho chiến dịch marketing.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Mở form, tạo và hủy

- [ ] **AC-1**: Mở màn hình tạo phân khúc
  - Tại: màn hình Danh sách phân khúc.
  - Khi: chủ garage nhấn nút **"Tạo mới phân khúc"**.
  - Thì: hệ thống hiển thị màn hình **"Tạo phân khúc mới"** với form gồm ba mục: **"Thông tin chung"**, **"Cấu hình"** và **"Danh sách khách hàng"**.

- [ ] **AC-2**: Tạo phân khúc thành công
  - Tại: form tạo phân khúc, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo phân khúc thành công.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Tạo mới phân khúc thành công."**, sau đó chuyển về màn hình Danh sách phân khúc.

- [ ] **AC-3**: Hủy bỏ tạo phân khúc
  - Tại: form tạo phân khúc.
  - Khi: chủ garage nhấn nút hủy.
  - Thì: hệ thống quay về màn hình trước đó. Dữ liệu đã nhập trên form không được lưu.

- [ ] **AC-4**: Điều kiện nút tạo
  - Tại: cuối form tạo phân khúc.
  - Khi: chủ garage đã điền đủ các trường bắt buộc và hệ thống không đang gửi yêu cầu.
  - Thì: nút tạo ở trạng thái khả dụng (enabled).
  - Khi: thiếu trường bắt buộc hoặc hệ thống đang gửi yêu cầu.
  - Thì: nút ở trạng thái bị mờ (disabled).

### Nhóm B — Chi tiết form: Thông tin chung

- [ ] **AC-5**: Mục **"Thông tin chung"**
  - Tại: form tạo phân khúc, mục **"Thông tin chung"**.
  - Khi: hệ thống hiển thị form.
  - Thì: mục gồm các trường:

  | # | Trường | Bắt buộc | Validation khi lỗi |
  |---|---|---|---|
  | 1 | **"Tên phân khúc"** | Có | **"Vui lòng nhập tên phân khúc"** |
  | 2 | **"Mô tả"** | Không | — |

### Nhóm C — Chi tiết form: Cấu hình tiêu chí

- [ ] **AC-6**: Mục **"Cấu hình"** — thêm tiêu chí
  - Tại: form tạo phân khúc, mục **"Cấu hình"**.
  - Khi: chủ garage nhấn nút **"Thêm tiêu chí"**.
  - Thì: hệ thống thêm một dòng tiêu chí mới với trường **"Tiêu chí"** (dropdown). Placeholder: **"Chọn tiêu chí"**. Validation: **"Vui lòng chọn tiêu chí"** · **"Tiêu chí không hợp lệ"**.

- [ ] **AC-7**: Các giá trị chọn cho trường **"Tiêu chí"**
  - Tại: mục **"Cấu hình"**, dropdown tiêu chí.
  - Khi: chủ garage mở dropdown chọn tiêu chí.
  - Thì: hệ thống hiển thị danh sách:
    - **"Chi tiêu"**
    - **"Thời gian đăng ký"**
    - **"Tỉnh/Thành phố"**
    - **"Thông tin xe"**
    - **"Khách còn hoạt động trong"**
    - **"Số lượt booking từ"**

- [ ] **AC-8**: Trường con theo loại tiêu chí **"Chi tiêu"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Chi tiêu"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường **"Chi tiêu từ"** (số tiền tối thiểu) và chi tiêu đến (số tiền tối đa). Validation: **"Vui lòng nhập chi tiêu từ hoặc chi tiêu đến"**.

- [ ] **AC-9**: Trường con theo loại tiêu chí **"Thời gian đăng ký"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Thời gian đăng ký"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường **"Từ ngày - đến ngày"** (khoảng thời gian). Validation: **"Vui lòng chọn từ ngày và đến ngày"**.

- [ ] **AC-10**: Trường con theo loại tiêu chí **"Tỉnh/Thành phố"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Tỉnh/Thành phố"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường **"Tỉnh/Thành phố"** (chọn nhiều). Validation: **"Vui lòng chọn ít nhất một Tỉnh/Thành phố"**.

- [ ] **AC-11**: Trường con theo loại tiêu chí **"Thông tin xe"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Thông tin xe"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường **"Hãng xe"** (chọn nhiều, bắt buộc) và **"Dòng xe"** (chọn nhiều, không bắt buộc). Validation hãng xe: **"Vui lòng chọn ít nhất một Hãng xe"**.

- [ ] **AC-12**: Trường con theo loại tiêu chí **"Khách còn hoạt động trong"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Khách còn hoạt động trong"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường nhập số ngày không hoạt động. Validation: **"Vui lòng nhập số ngày không hoạt động"**.

- [ ] **AC-13**: Trường con theo loại tiêu chí **"Số lượt booking từ"**
  - Tại: mục **"Cấu hình"**, khi chọn tiêu chí **"Số lượt booking từ"**.
  - Khi: hệ thống hiển thị trường con.
  - Thì: hiển thị trường nhập số lượt booking. Validation: **"Vui lòng nhập số lượt booking"**.

- [ ] **AC-14**: Kết hợp nhiều tiêu chí
  - Tại: mục **"Cấu hình"**, khi có nhiều hơn một tiêu chí.
  - Khi: hệ thống hiển thị các tiêu chí.
  - Thì: giữa các tiêu chí hiển thị nhãn **"Và"** — tức các tiêu chí được kết hợp theo điều kiện AND.

### Nhóm D — Chi tiết form: Danh sách khách hàng (xem trước)

- [ ] **AC-15**: Mục **"Danh sách khách hàng"** — xem trước
  - Tại: form tạo phân khúc, mục **"Danh sách khách hàng"**.
  - Khi: chủ garage đã cấu hình tiêu chí.
  - Thì: hệ thống hiển thị bảng xem trước danh sách khách hàng phù hợp với các cột: **"Tên khách hàng"**, **"Số điện thoại"**, **"Email"**. Có ô tìm kiếm: **"Tìm theo tên, số điện thoại"**.

### Nhóm E — Phân quyền

- [ ] **AC-16**: Phân quyền tạo phân khúc
  - Tại: màn hình tạo phân khúc.
  - Khi: chủ garage hoặc kế toán truy cập hệ thống.
  - Thì: cả hai vai trò đều có quyền tạo phân khúc. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm F — Xử lý lỗi

- [ ] **AC-17**: Validation form thất bại
  - Tại: form tạo phân khúc, sau khi nhấn nút tạo.
  - Khi: các trường bắt buộc chưa được điền đủ hoặc dữ liệu nhập không hợp lệ.
  - Thì: hệ thống hiển thị thông báo lỗi tương ứng dưới từng trường vi phạm và không gửi yêu cầu lên hệ thống.

- [ ] **AC-18**: Tạo phân khúc thất bại do lỗi hệ thống
  - Tại: form tạo phân khúc, sau khi nhấn nút tạo.
  - Khi: hệ thống tạo phân khúc thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Form giữ nguyên dữ liệu đã nhập để chủ garage có thể thử lại.

- [ ] **AC-19**: Tên phân khúc trùng
  - Tại: form tạo phân khúc, sau khi nhấn nút tạo.
  - Khi: tên phân khúc đã tồn tại trong garage.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"** và form giữ nguyên dữ liệu.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-customer` (qua BFF `agg-garage-graph`)
- Tạo phân khúc: Mutation `CreateSegment`
- Xem trước khách hàng: Query `PreviewSegmentCustomers`

## 5. Business Rules

- **BR-MKT-SEG-CRE-001**: Tên phân khúc phải không trùng trong phạm vi garage hiện tại.
- **BR-MKT-SEG-CRE-002**: Sau khi tạo, hệ thống tự động kích hoạt quy trình đánh giá phân khúc bất đồng bộ (qua Temporal workflow) để xác định danh sách khách hàng phù hợp.
- **BR-MKT-SEG-CRE-003**: Các tiêu chí được kết hợp theo điều kiện AND — khách hàng phải thỏa mãn tất cả tiêu chí để thuộc phân khúc.
- **BR-MKT-SEG-CRE-004**: Xem trước khách hàng là dry-run — không lưu kết quả vào hệ thống.

## 6. Edge Cases

- **EC-1**: Không có tiêu chí nào được cấu hình — mục **"Danh sách khách hàng"** hiển thị trống.
- **EC-2**: Tiêu chí lọc không khớp khách hàng nào — bảng xem trước hiển thị trống.
- **EC-3**: Tên phân khúc trùng với phân khúc đã tồn tại — hệ thống báo lỗi.

## 7. Out of Scope

- Danh sách phân khúc → xem `FEAT-MKT-SEG-LIST`.
- Chi tiết phân khúc → xem `FEAT-MKT-SEG-DETAIL`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-customer + garage-web (segments-create screen, CreateSegment mutation, PreviewSegmentCustomers query, criteria fields with validation) |
