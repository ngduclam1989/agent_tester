---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-FOUND"
boundary: "gf-hrms"
last_reviewed: "2026-05-27"
---

# FEAT-FND-EMP-STATUS: Quản lý trạng thái nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-STATUS` |
| Title | Quản lý trạng thái nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** quản lý trạng thái làm việc của nhân viên (tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại), **so that** garage kiểm soát được nhân sự đang hoạt động.

## 2. Acceptance Criteria

### Nhóm A — Tạm nghỉ nhân viên

- [ ] **AC-1**: Hiển thị nút tạm nghỉ khi nhân viên đang làm việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị nút/hành động cho phép chuyển nhân viên sang tạm nghỉ.

- [ ] **AC-2**: Ẩn nút tạm nghỉ khi trạng thái không phù hợp
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: nút tạm nghỉ không hiển thị.

- [ ] **AC-3**: Hiển thị hộp thoại xác nhận tạm nghỉ
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút tạm nghỉ.
  - Thì: hệ thống hiển thị hộp thoại xác nhận với tiêu đề **"Xác nhận tạm nghỉ"**, nội dung **"Bạn có chắc chắn muốn chuyển nhân viên {tên nhân viên} sang trạng thái tạm nghỉ?"**, lưu ý **"Lưu ý: Tài khoản SSO của nhân viên sẽ bị vô hiệu hóa tạm thời."**, cùng hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-4**: Xác nhận tạm nghỉ thành công
  - Tại: hộp thoại xác nhận tạm nghỉ.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống chuyển trạng thái nhân viên sang **"Tạm nghỉ"**. Hiển thị toast với tiêu đề **"Thành công"**, mô tả: **"Đã chuyển trạng thái nhân viên sang Tạm nghỉ."**. Hộp thoại đóng lại. Nút tạm nghỉ biến mất, thay thế bằng các hành động phù hợp với trạng thái mới. Hệ thống hiển thị thông báo: **"Nhân viên này đang trong trạng thái tạm nghỉ. Tài khoản truy cập (nếu có) đang bị vô hiệu hóa"**.

- [ ] **AC-5**: Hủy xác nhận tạm nghỉ
  - Tại: hộp thoại xác nhận tạm nghỉ.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hộp thoại đóng lại. Trạng thái nhân viên không thay đổi.

### Nhóm B — Chấm dứt hợp đồng

- [ ] **AC-6**: Hiển thị nút chấm dứt hợp đồng khi nhân viên đang làm việc hoặc tạm nghỉ
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"** hoặc **"Tạm nghỉ"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị nút/hành động **"Chấm dứt hợp đồng"**.

- [ ] **AC-7**: Ẩn nút chấm dứt hợp đồng khi đã nghỉ việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đã nghỉ việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: nút chấm dứt hợp đồng không hiển thị.

- [ ] **AC-8**: Hiển thị hộp thoại chấm dứt hợp đồng
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"** hoặc **"Tạm nghỉ"**.
  - Khi: chủ garage nhấn nút **"Chấm dứt hợp đồng"**.
  - Thì: hệ thống hiển thị hộp thoại chấm dứt hợp đồng gồm:
    - Trường **"Ngày nghỉ việc"** (bắt buộc).
    - Trường **"Lý do nghỉ việc"** với placeholder **"Vui lòng nhập lý do nghỉ việc"** (bắt buộc).
    - Hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-9**: Validation ngày nghỉ việc
  - Tại: hộp thoại chấm dứt hợp đồng.
  - Khi: chủ garage chọn ngày nghỉ việc nhỏ hơn ngày vào làm của nhân viên.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Ngày nghỉ việc không thể nhỏ hơn ngày vào làm."**. Nút **"Xác nhận"** bị vô hiệu hóa.

- [ ] **AC-10**: Validation trường bắt buộc trong hộp thoại chấm dứt hợp đồng
  - Tại: hộp thoại chấm dứt hợp đồng.
  - Khi: chủ garage chưa chọn ngày nghỉ việc hoặc chưa nhập lý do nghỉ việc.
  - Thì: nút **"Xác nhận"** bị vô hiệu hóa. Nếu nhấn submit khi thiếu ngày, hiển thị thông báo: **"Vui lòng chọn ngày nghỉ việc"**. Nếu thiếu lý do, hiển thị: **"Vui lòng nhập lý do nghỉ việc."**.

- [ ] **AC-11**: Chấm dứt hợp đồng thành công
  - Tại: hộp thoại chấm dứt hợp đồng, đã nhập đủ ngày nghỉ việc và lý do.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống chuyển trạng thái nhân viên sang **"Đã nghỉ việc"**. Ghi nhận ngày nghỉ việc và lý do. Hiển thị toast với tiêu đề **"Thành công"**, mô tả: **"Đã chấm dứt hợp đồng thành công."**. Hộp thoại đóng lại. Nút chấm dứt hợp đồng biến mất.

- [ ] **AC-12**: Hiển thị thông tin nghỉ việc sau khi chấm dứt hợp đồng
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, nhân viên ở trạng thái **"Đã nghỉ việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị khối **"Thông tin nghỉ việc"** gồm **"Ngày nghỉ việc:"** và **"Lý do:"** theo dữ liệu đã ghi nhận.

### Nhóm C — Kích hoạt lại nhân viên

- [ ] **AC-13**: Hiển thị nút kích hoạt lại khi nhân viên tạm nghỉ hoặc đã nghỉ việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị nút **"Kích hoạt lại"**.

- [ ] **AC-14**: Ẩn nút kích hoạt lại khi nhân viên đang làm việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: nút **"Kích hoạt lại"** không hiển thị.

- [ ] **AC-15**: Hiển thị hộp thoại kích hoạt lại nhân viên
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage nhấn nút **"Kích hoạt lại"**.
  - Thì: hệ thống hiển thị hộp thoại với tiêu đề **"Kích hoạt lại nhân viên"**, nội dung **"Nhân viên {tên nhân viên} sẽ được chuyển về trạng thái Đang làm việc. Quyền truy cập hệ thống sẽ được khôi phục."**, trạng thái đích hiển thị **"Đang làm việc"**, cùng hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-16**: Kích hoạt lại nhân viên thành công
  - Tại: hộp thoại kích hoạt lại nhân viên.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống chuyển trạng thái nhân viên sang **"Đang làm việc"**. Hiển thị toast với tiêu đề **"Thành công"**, mô tả: **"Đã kích hoạt lại nhân viên thành công."**. Hộp thoại đóng lại. Nút kích hoạt lại biến mất, thay thế bằng các hành động phù hợp với trạng thái **"Đang làm việc"**.

- [ ] **AC-17**: Hủy kích hoạt lại nhân viên
  - Tại: hộp thoại kích hoạt lại nhân viên.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hộp thoại đóng lại. Trạng thái nhân viên không thay đổi.

### Nhóm D — Phân quyền

- [ ] **AC-18**: Phân quyền quản lý trạng thái nhân viên
  - Tại: màn hình Chi tiết nhân viên.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền tạm nghỉ, chấm dứt hợp đồng và kích hoạt lại nhân viên. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm E — Xử lý lỗi

- [ ] **AC-19**: Tạm nghỉ nhân viên thất bại
  - Tại: hộp thoại xác nhận tạm nghỉ.
  - Khi: hệ thống xử lý thất bại (lỗi mạng, trạng thái đã thay đổi bởi người dùng khác).
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái nhân viên không thay đổi. Hộp thoại không đóng.

- [ ] **AC-20**: Chấm dứt hợp đồng thất bại
  - Tại: hộp thoại chấm dứt hợp đồng.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái nhân viên không thay đổi. Hộp thoại không đóng.

- [ ] **AC-21**: Kích hoạt lại nhân viên thất bại
  - Tại: hộp thoại kích hoạt lại nhân viên.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái nhân viên không thay đổi. Hộp thoại không đóng.

- [ ] **AC-22**: Thay đổi trạng thái đồng thời
  - Tại: màn hình Chi tiết nhân viên.
  - Khi: chủ garage nhấn xác nhận thay đổi trạng thái, nhưng nhân viên đã bị người dùng khác chuyển sang trạng thái khác trước đó.
  - Thì: hệ thống từ chối thao tác. Hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái nhân viên giữ nguyên giá trị do người dùng khác đã thay đổi.

## 3. UI/UX Reference

> TBD

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Tạm nghỉ nhân viên: Mutation `SuspendEmployee`
- Chấm dứt hợp đồng: Mutation `TerminateEmployee`
- Kích hoạt lại nhân viên: Mutation `ReactivateEmployee`

## 5. Business Rules

- **BR-FND-EMP-STS-001**: Trạng thái làm việc chỉ được chuyển theo các luồng hợp lệ: **"Đang làm việc"** sang **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**; **"Tạm nghỉ"** sang **"Đang làm việc"** hoặc **"Đã nghỉ việc"**; **"Đã nghỉ việc"** sang **"Đang làm việc"**.
- **BR-FND-EMP-STS-002**: Ngày nghỉ việc không được nhỏ hơn ngày vào làm của nhân viên.
- **BR-FND-EMP-STS-003**: Mọi thay đổi trạng thái (tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại) đều được ghi lại trong lịch sử trạng thái với người thực hiện và thời gian.
- **BR-FND-EMP-STS-004**: Tạm nghỉ và chấm dứt hợp đồng cố ý **không** tự động vô hiệu hóa tài khoản đăng nhập — trạng thái làm việc và trạng thái tài khoản được quản lý tách biệt.
- **BR-FND-EMP-STS-005**: Chỉ nhân viên ở trạng thái **"Đang làm việc"** mới được cập nhật thông tin cá nhân. Tuy nhiên, tạm nghỉ và chấm dứt hợp đồng có thể thực hiện từ các trạng thái hợp lệ tương ứng.

## 6. Edge Cases

- **EC-1**: Nhân viên đang ở trạng thái **"Đang làm việc"** nhưng trước khi nhấn xác nhận tạm nghỉ, người dùng khác đã chấm dứt hợp đồng nhân viên đó — thao tác tạm nghỉ thất bại.
- **EC-2**: Nhân viên đã nghỉ việc được kích hoạt lại — thông tin nghỉ việc (ngày nghỉ, lý do) vẫn được lưu trong lịch sử nhưng không còn hiển thị trên khối thông tin nghỉ việc.

## 7. Out of Scope

- Vô hiệu hóa hoặc kích hoạt lại tài khoản đăng nhập khi thay đổi trạng thái làm việc → xem `FEAT-FND-EMP-SSO`.
- Tạo mới hoặc chỉnh sửa thông tin nhân viên → xem `FEAT-FND-EMP-CREATE` và `FEAT-FND-EMP-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms + garage-web |
