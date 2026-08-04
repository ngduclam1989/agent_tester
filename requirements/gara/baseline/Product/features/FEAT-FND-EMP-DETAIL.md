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

# FEAT-FND-EMP-DETAIL: Chi tiết nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-DETAIL` |
| Title | Chi tiết nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P0 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết hồ sơ nhân viên cùng trạng thái tài khoản hệ thống, và thực hiện các hành động quản lý trạng thái làm việc và tài khoản, **so that** tôi có thể quản lý toàn diện vòng đời nhân viên từ khi tạo đến khi nghỉ việc, bao gồm cấp/thu hồi quyền truy cập hệ thống.

## 2. Acceptance Criteria

### Nhóm A — Hiển thị thông tin chi tiết

- [ ] **AC-1**: Hiển thị màn hình chi tiết nhân viên
  - Tại: màn hình Danh sách nhân viên.
  - Khi: chủ garage nhấn vào dòng nhân viên trong bảng.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết nhân viên"** với tiêu đề là tên nhân viên. Màn hình gồm các mục: **"Hồ sơ nhân viên"**, **"Thông tin chung"**, **"Thông tin công việc"**, và tab **"Thông tin tài khoản (SSO)"**.

- [ ] **AC-2**: Hiển thị mục Thông tin chung
  - Tại: màn hình Chi tiết nhân viên, mục **"Thông tin chung"**.
  - Khi: hệ thống tải xong dữ liệu nhân viên.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Họ và tên"**, **"Mã nhân viên"**, **"Ngày sinh"**, **"Số điện thoại"**, **"Địa chỉ"**.

- [ ] **AC-3**: Hiển thị mục Thông tin công việc
  - Tại: màn hình Chi tiết nhân viên, mục **"Thông tin công việc"**.
  - Khi: hệ thống tải xong dữ liệu nhân viên.
  - Thì: hiển thị các trường ở trạng thái chỉ đọc: **"Vai trò"**, **"Ngày vào làm"**.

- [ ] **AC-4**: Hiển thị trạng thái nhân viên trên màn hình chi tiết
  - Tại: màn hình Chi tiết nhân viên.
  - Khi: hệ thống tải xong dữ liệu nhân viên.
  - Thì: trạng thái nhân viên hiển thị dưới dạng badge với màu tương ứng:
    - **"Đang làm việc"** — badge màu xanh (blue).
    - **"Tạm nghỉ"** — badge màu cam (orange).
    - **"Đã nghỉ việc"** — badge màu đỏ (red).

- [ ] **AC-5**: Hiển thị thông báo khi nhân viên đang tạm nghỉ
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"**.
  - Khi: hệ thống tải xong dữ liệu nhân viên.
  - Thì: hệ thống hiển thị thông báo: **"Nhân viên này đang trong trạng thái tạm nghỉ. Tài khoản truy cập (nếu có) đang bị vô hiệu hóa"**.

- [ ] **AC-6**: Hiển thị thông tin nghỉ việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đã nghỉ việc"**.
  - Khi: hệ thống tải xong dữ liệu nhân viên.
  - Thì: hệ thống hiển thị mục **"Thông tin nghỉ việc"** gồm: **"Ngày nghỉ việc:"** và **"Lý do:"**.

- [ ] **AC-7**: Hiển thị tab Thông tin tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab **"Thông tin tài khoản (SSO)"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị trạng thái tài khoản hiện tại (**"Trạng thái SSO"**) và các thông tin liên quan tùy theo trạng thái. Nếu tài khoản đang hoạt động, hiển thị thêm **"Tên đăng nhập"** và **"Ngày cấp"**.

- [ ] **AC-8**: Tab tài khoản — trạng thái chưa cấp
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Chưa cấp tài khoản"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị thông báo: **"Nhân viên này chưa có tài khoản để truy cập vào hệ thống Garage"** và nút **"Cấp tài khoản"**.

- [ ] **AC-9**: Tab tài khoản — trạng thái tạo thất bại
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Tạo thất bại"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị thông báo lỗi và nút **"Cấp tài khoản"** để thử lại.

- [ ] **AC-10**: Tab tài khoản — trạng thái đang hoạt động
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Đang hoạt động"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị thông tin tài khoản gồm **"Tên đăng nhập"**, **"Ngày cấp"**, **"Trạng thái SSO"** và nút **"Thu hồi tài khoản"**.

- [ ] **AC-11**: Tab tài khoản — trạng thái đã vô hiệu hóa
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Đã vô hiệu hóa"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị thông báo: **"Tài khoản đã bị vô hiệu hóa"** kèm mô tả: **"Tài khoản bị khóa tự động để đảm bảo an toàn hệ thống do nhân viên không ở trạng thái làm việc."**. Nút **"Kích hoạt lại tài khoản"** chỉ hiển thị khi nhân viên ở trạng thái **"Đang làm việc"**.

- [ ] **AC-12**: Tab tài khoản — nhân viên không ở trạng thái làm việc
  - Tại: tab **"Thông tin tài khoản (SSO)"**, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** và chưa có tài khoản.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: hệ thống hiển thị thông báo: **"Không khả dụng"** kèm mô tả: **"Không thể thực hiện cấp mới tài khoản hệ thống (SSO) vào lúc này."** và **"Nhân viên đang không ở trạng thái làm việc."**. Không hiển thị nút cấp tài khoản.

- [ ] **AC-13**: Quay về danh sách nhân viên
  - Tại: màn hình Chi tiết nhân viên.
  - Khi: chủ garage nhấn nút quay lại.
  - Thì: hệ thống chuyển về màn hình Danh sách nhân viên.

### Nhóm B — Nút hành động theo trạng thái làm việc

- [ ] **AC-14**: Nút hành động khi nhân viên đang làm việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị các nút: **"Chỉnh sửa"**, **"Tạm nghỉ"** (dẫn đến xác nhận tạm nghỉ), **"Chấm dứt hợp đồng"** (dẫn đến xác nhận chấm dứt).

- [ ] **AC-15**: Nút hành động khi nhân viên tạm nghỉ
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị các nút: **"Kích hoạt lại"** và **"Chấm dứt hợp đồng"**. Nút **"Chỉnh sửa"** không hiển thị.

- [ ] **AC-16**: Nút hành động khi nhân viên đã nghỉ việc
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đã nghỉ việc"**.
  - Khi: chủ garage xem chi tiết nhân viên.
  - Thì: hệ thống hiển thị nút **"Kích hoạt lại"**. Nút **"Chỉnh sửa"** và **"Chấm dứt hợp đồng"** không hiển thị.

- [ ] **AC-17**: Xác nhận tạm nghỉ nhân viên
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút tạm nghỉ.
  - Thì: hệ thống hiển thị hộp thoại **"Xác nhận tạm nghỉ"** với nội dung: **"Bạn có chắc chắn muốn chuyển nhân viên {tên nhân viên} sang trạng thái tạm nghỉ?"** kèm lưu ý: **"Lưu ý: Tài khoản SSO của nhân viên sẽ bị vô hiệu hóa tạm thời."**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-18**: Tạm nghỉ nhân viên thành công
  - Tại: hộp thoại Xác nhận tạm nghỉ.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái nhân viên chuyển sang **"Tạm nghỉ"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã chuyển trạng thái nhân viên sang Tạm nghỉ."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-19**: Xác nhận chấm dứt hợp đồng
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"** hoặc **"Tạm nghỉ"**.
  - Khi: chủ garage nhấn nút **"Chấm dứt hợp đồng"**.
  - Thì: hệ thống hiển thị hộp thoại **"Chấm dứt hợp đồng"** gồm:
    - Trường **"Ngày nghỉ việc"** — bộ chọn ngày, bắt buộc. Khi bỏ trống: hiển thị lỗi **"Vui lòng chọn ngày nghỉ việc"**.
    - Trường **"Lý do nghỉ việc"** — ô nhập text. Placeholder: **"Vui lòng nhập lý do nghỉ việc"**. Khi bỏ trống: hiển thị lỗi **"Vui lòng nhập lý do nghỉ việc."**.
    - Nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-20**: Validation ngày nghỉ việc
  - Tại: hộp thoại Chấm dứt hợp đồng, trường **"Ngày nghỉ việc"**.
  - Khi: chủ garage chọn ngày nghỉ việc nhỏ hơn ngày vào làm.
  - Thì: hệ thống hiển thị thông báo lỗi: **"Ngày nghỉ việc không thể nhỏ hơn ngày vào làm."**.

- [ ] **AC-21**: Chấm dứt hợp đồng thành công
  - Tại: hộp thoại Chấm dứt hợp đồng.
  - Khi: chủ garage nhấn nút **"Xác nhận"** với ngày nghỉ việc và lý do hợp lệ, hệ thống xử lý thành công.
  - Thì: trạng thái nhân viên chuyển sang **"Đã nghỉ việc"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã chấm dứt hợp đồng thành công."**. Mục **"Thông tin nghỉ việc"** xuất hiện trên màn hình chi tiết. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-22**: Xác nhận kích hoạt lại nhân viên
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage nhấn nút **"Kích hoạt lại"**.
  - Thì: hệ thống hiển thị hộp thoại **"Kích hoạt lại nhân viên"** với nội dung: **"Nhân viên {tên nhân viên} sẽ được chuyển về trạng thái Đang làm việc. Quyền truy cập hệ thống sẽ được khôi phục."**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-23**: Kích hoạt lại nhân viên thành công
  - Tại: hộp thoại Kích hoạt lại nhân viên.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái nhân viên chuyển sang **"Đang làm việc"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Đã kích hoạt lại nhân viên thành công."**. Các nút hành động cập nhật theo trạng thái mới.

- [ ] **AC-24**: Nhấn nút chỉnh sửa
  - Tại: màn hình Chi tiết nhân viên, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút **"Chỉnh sửa"**.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa nhân viên (xem `FEAT-FND-EMP-EDIT`).

### Nhóm B2 — Nút hành động tài khoản (SSO)

- [ ] **AC-25**: Cấp tài khoản hệ thống
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút **"Cấp tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Cấp tài khoản hệ thống"** với nội dung: **"Hệ thống sẽ khởi tạo tài khoản dựa trên thông tin nhân viên"** kèm trường chọn **"Quyền"** (placeholder: **"Chọn quyền"**) và thông báo: **"Sẽ được gửi tự động về số điện thoại của nhân viên"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-26**: Cấp tài khoản thành công
  - Tại: hộp thoại Cấp tài khoản hệ thống.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: hệ thống hiển thị trạng thái **"Đang cấp tài khoản"** với thông báo: **"Hệ thống đang tiến hành cấp tài khoản truy cập cho nhân viên. Quá trình này có thể mất vài phút. Vui lòng quay lại kiểm tra trạng thái sau ít phút."**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Cấp tài khoản cho nhân viên thành công!"**. Hộp thoại hiển thị nút **"Đóng"**.

- [ ] **AC-27**: Thu hồi tài khoản (vô hiệu hóa)
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Đang hoạt động"**.
  - Khi: chủ garage nhấn nút **"Thu hồi tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Thu hồi tài khoản"** với nội dung: **"Hành động này sẽ xóa hoàn toàn quyền truy cập của nhân viên {tên nhân viên} vào hệ thống Garage."** kèm dòng: **"Mọi dữ liệu phiên đăng nhập hiện tại sẽ bị hủy bỏ. Bạn có chắc chắn muốn tiếp tục?"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-28**: Thu hồi tài khoản thành công
  - Tại: hộp thoại Thu hồi tài khoản.
  - Khi: chủ garage nhấn nút **"Xác nhận"** và hệ thống xử lý thành công.
  - Thì: trạng thái tài khoản chuyển sang **"Đã vô hiệu hóa"**. Hiển thị toast với tiêu đề **"Thành công"** và mô tả **"Thu hồi tài khoản thành công!"**. Tab tài khoản cập nhật hiển thị theo trạng thái mới.

- [ ] **AC-29**: Kích hoạt lại tài khoản
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Đã vô hiệu hóa"**, nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút **"Kích hoạt lại tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Kích hoạt lại tài khoản hệ thống?"** với nội dung: **"Tài khoản của nhân viên {tên nhân viên} sẽ được kích hoạt lại và có thể đăng nhập vào hệ thống Garage. Bạn có chắc chắn muốn tiếp tục?"**. Hộp thoại gồm nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-30**: Kích hoạt lại tài khoản — ẩn nút khi nhân viên không làm việc
  - Tại: tab **"Thông tin tài khoản (SSO)"**, tài khoản ở trạng thái **"Đã vô hiệu hóa"**, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem tab tài khoản.
  - Thì: nút **"Kích hoạt lại tài khoản"** không hiển thị. Hệ thống chỉ hiển thị thông báo trạng thái vô hiệu hóa.

### Nhóm C — Phân quyền

- [ ] **AC-31**: Phân quyền xem chi tiết và thao tác nhân viên
  - Tại: màn hình Chi tiết nhân viên.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết nhân viên, thực hiện tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại, và quản lý tài khoản. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm D — Xử lý lỗi

- [ ] **AC-32**: Hành động trạng thái thất bại
  - Tại: hộp thoại xác nhận (tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại).
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái nhân viên không thay đổi. Hộp thoại đóng lại.

- [ ] **AC-33**: Hành động tài khoản thất bại
  - Tại: hộp thoại xác nhận (cấp tài khoản, thu hồi, kích hoạt lại tài khoản).
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề **"Lỗi"**. Trạng thái tài khoản không thay đổi. Hộp thoại đóng lại.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-FOUND.

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Chi tiết nhân viên: Query `GetEmployeeByCode`
- Tạm nghỉ: Mutation `SuspendEmployee`
- Chấm dứt hợp đồng: Mutation `TerminateEmployee`
- Kích hoạt lại nhân viên: Mutation `ReactivateEmployee`
- Cấp tài khoản: Mutation `ProvisionEmployeeSso`
- Thu hồi tài khoản: Mutation `DisableEmployeeSso`
- Kích hoạt lại tài khoản: Mutation `EnableEmployeeSso`

## 5. Business Rules

- **BR-FND-EMP-DTL-001**: Chỉ nhân viên ở trạng thái **"Đang làm việc"** mới hiển thị nút **"Chỉnh sửa"**.
- **BR-FND-EMP-DTL-002**: Trạng thái làm việc chỉ chuyển theo quy tắc: **"Đang làm việc"** sang **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**; **"Tạm nghỉ"** sang **"Đang làm việc"** hoặc **"Đã nghỉ việc"**; **"Đã nghỉ việc"** sang **"Đang làm việc"**.
- **BR-FND-EMP-DTL-003**: Ngày nghỉ việc không được nhỏ hơn ngày vào làm.
- **BR-FND-EMP-DTL-004**: Hệ thống ghi nhận lịch sử trạng thái mỗi khi có thay đổi trạng thái (tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại) kèm người thực hiện và thời gian.
- **BR-FND-EMP-DTL-005**: Cấp tài khoản chỉ thực hiện được khi tài khoản ở trạng thái **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"** và nhân viên ở trạng thái **"Đang làm việc"**.
- **BR-FND-EMP-DTL-006**: Thu hồi tài khoản (vô hiệu hóa) chỉ thực hiện được khi tài khoản ở trạng thái **"Đang hoạt động"**. Không yêu cầu nhân viên phải ở trạng thái **"Đang làm việc"** — có thể thu hồi tài khoản của nhân viên đã nghỉ việc hoặc tạm nghỉ.
- **BR-FND-EMP-DTL-007**: Kích hoạt lại tài khoản yêu cầu tài khoản ở trạng thái **"Đã vô hiệu hóa"** **và** nhân viên ở trạng thái **"Đang làm việc"**.
- **BR-FND-EMP-DTL-008**: Trạng thái làm việc và trạng thái tài khoản hoạt động độc lập — chấm dứt hợp đồng hoặc tạm nghỉ không tự động thu hồi tài khoản.

## 6. Edge Cases

- **EC-1**: Chấm dứt hợp đồng nhân viên đang có tài khoản hoạt động — trạng thái nhân viên chuyển sang **"Đã nghỉ việc"** nhưng tài khoản vẫn ở trạng thái **"Đang hoạt động"** cho đến khi thu hồi thủ công.
- **EC-2**: Kích hoạt lại nhân viên từ **"Đã nghỉ việc"** có tài khoản **"Đã vô hiệu hóa"** — sau khi kích hoạt lại nhân viên, chủ garage có thể kích hoạt lại tài khoản trong tab tài khoản.
- **EC-3**: Cấp tài khoản đang xử lý (trạng thái **"Đang tạo tài khoản"**) — quá trình bất đồng bộ, chủ garage cần quay lại kiểm tra sau vài phút.

## 7. Out of Scope

- Chỉnh sửa thông tin nhân viên → xem `FEAT-FND-EMP-EDIT`.
- Tạo nhân viên mới → xem `FEAT-FND-EMP-CREATE`.
- Danh sách nhân viên → xem `FEAT-FND-EMP-LIST`.
- Đổi vai trò nhân viên — thuộc chức năng quản lý vai trò (chưa có FEAT riêng).

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms v2 + garage-web (employees-id detail screen, account-tab, modal dialogs, lifecycle actions) |
