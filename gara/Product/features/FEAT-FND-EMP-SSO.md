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

# FEAT-FND-EMP-SSO: Quản lý tài khoản đăng nhập nhân viên

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-FND-EMP-SSO` |
| Title | Quản lý tài khoản đăng nhập nhân viên |
| Parent Epic | `EP-FOUND` |
| Boundary | `gf-hrms` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** cấp, vô hiệu hóa và kích hoạt lại tài khoản đăng nhập cho nhân viên, **so that** chỉ nhân viên được phép mới truy cập hệ thống.

## 2. Acceptance Criteria

### Nhóm A — Cấp tài khoản

- [ ] **AC-1**: Hiển thị nút cấp tài khoản khi nhân viên chưa có tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, nhân viên ở trạng thái làm việc **"Đang làm việc"** và trạng thái tài khoản **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: hệ thống hiển thị thông báo **"Nhân viên này chưa có tài khoản để truy cập vào hệ thống Garage"** và nút **"Cấp tài khoản"**.

- [ ] **AC-2**: Ẩn nút cấp tài khoản khi nhân viên không ở trạng thái đang làm việc
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, nhân viên ở trạng thái làm việc **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"** và trạng thái tài khoản **"Chưa cấp tài khoản"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: nút cấp tài khoản không hiển thị. Hệ thống hiển thị thông báo: **"Không khả dụng"** và **"Không thể thực hiện cấp mới tài khoản hệ thống (SSO) vào lúc này."** cùng **"Nhân viên đang không ở trạng thái làm việc."**.

- [ ] **AC-3**: Hiển thị hộp thoại cấp tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, nhân viên **"Đang làm việc"** và tài khoản **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**.
  - Khi: chủ garage nhấn nút **"Cấp tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Cấp tài khoản hệ thống"** gồm:
    - Thông báo: **"Hệ thống sẽ khởi tạo tài khoản dựa trên thông tin nhân viên"**.
    - Trường **"Quyền"** với placeholder **"Chọn quyền"**.
    - Thông báo: **"Sẽ được gửi tự động về số điện thoại của nhân viên"**.
    - Hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-4**: Cấp tài khoản thành công — chuyển sang trạng thái đang tạo
  - Tại: hộp thoại cấp tài khoản.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống chuyển trạng thái tài khoản sang **"Đang tạo tài khoản"**. Hiển thị toast với tiêu đề **"Cấp tài khoản cho nhân viên"**, mô tả: **"Cấp tài khoản cho nhân viên thành công!"**. Hộp thoại chuyển sang trạng thái **"Đang cấp tài khoản hệ thống"** với thông báo: **"Hệ thống đang tiến hành cấp tài khoản truy cập cho nhân viên. Quá trình này có thể mất vài phút. Vui lòng quay lại kiểm tra trạng thái sau ít phút."** và nút **"Đóng"**.

- [ ] **AC-5**: Hiển thị trạng thái đang tạo tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Đang tạo tài khoản"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: hệ thống hiển thị trạng thái **"Đang cấp tài khoản"**. Không có nút hành động nào khả dụng trong lúc đang tạo.

- [ ] **AC-6**: Tài khoản được tạo thành công từ hệ thống bên ngoài
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản đang ở trạng thái **"Đang tạo tài khoản"**.
  - Khi: hệ thống bên ngoài xử lý xong và phản hồi thành công.
  - Thì: trạng thái tài khoản chuyển sang **"Đang hoạt động"**. Khi chủ garage tải lại trang, tab Tài khoản hiển thị thông tin tài khoản đã cấp gồm trạng thái và ngày cấp.

- [ ] **AC-7**: Tài khoản tạo thất bại từ hệ thống bên ngoài
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản đang ở trạng thái **"Đang tạo tài khoản"**.
  - Khi: hệ thống bên ngoài xử lý xong và phản hồi thất bại.
  - Thì: trạng thái tài khoản chuyển sang **"Tạo thất bại"**. Khi chủ garage tải lại trang, hệ thống hiển thị lại nút **"Cấp tài khoản"** để thử lại.

### Nhóm B — Vô hiệu hóa tài khoản

- [ ] **AC-8**: Hiển thị nút thu hồi tài khoản khi tài khoản đang hoạt động
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Đang hoạt động"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: hệ thống hiển thị thông tin tài khoản gồm trạng thái tài khoản, ngày cấp, và nút **"Thu hồi tài khoản"**. Hiển thị trạng thái **"Nhân viên chưa được cấp tài khoản"** không xuất hiện.

- [ ] **AC-9**: Ẩn nút thu hồi tài khoản khi tài khoản không đang hoạt động
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Chưa cấp tài khoản"**, **"Đang tạo tài khoản"**, **"Đã vô hiệu hóa"** hoặc **"Tạo thất bại"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: nút **"Thu hồi tài khoản"** không hiển thị.

- [ ] **AC-10**: Hiển thị hộp thoại thu hồi tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản **"Đang hoạt động"**.
  - Khi: chủ garage nhấn nút **"Thu hồi tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Thu hồi tài khoản"** với nội dung: **"Hành động này sẽ xóa hoàn toàn quyền truy cập của nhân viên {tên nhân viên} vào hệ thống Garage."** và **"Mọi dữ liệu phiên đăng nhập hiện tại sẽ bị hủy bỏ. Bạn có chắc chắn muốn tiếp tục?"**, cùng hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-11**: Thu hồi tài khoản thành công
  - Tại: hộp thoại thu hồi tài khoản.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống gửi yêu cầu vô hiệu hóa tài khoản. Hiển thị toast với mô tả: **"Thu hồi tài khoản thành công!"**. Hộp thoại đóng lại. Trạng thái tài khoản chuyển sang **"Đã vô hiệu hóa"** sau khi hệ thống bên ngoài xử lý xong.

- [ ] **AC-12**: Hiển thị trạng thái tài khoản đã vô hiệu hóa
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Đã vô hiệu hóa"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: hệ thống hiển thị thông báo **"Tài khoản đã bị vô hiệu hóa"** và **"Tài khoản bị khóa tự động để đảm bảo an toàn hệ thống do nhân viên không ở trạng thái làm việc."**. Hiển thị nút **"Kích hoạt lại tài khoản"** (nếu nhân viên đang ở trạng thái **"Đang làm việc"**).

- [ ] **AC-13**: Vô hiệu hóa tài khoản không yêu cầu nhân viên đang làm việc
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản **"Đang hoạt động"**, nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage nhấn thu hồi tài khoản và xác nhận.
  - Thì: hệ thống vẫn cho phép thu hồi tài khoản thành công. Trạng thái làm việc không ảnh hưởng đến khả năng vô hiệu hóa tài khoản.

### Nhóm C — Kích hoạt tài khoản

- [ ] **AC-14**: Hiển thị nút kích hoạt lại tài khoản khi đủ điều kiện
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Đã vô hiệu hóa"** và nhân viên ở trạng thái **"Đang làm việc"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: hệ thống hiển thị nút **"Kích hoạt lại tài khoản"**.

- [ ] **AC-15**: Ẩn nút kích hoạt lại tài khoản khi nhân viên không đang làm việc
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản ở trạng thái **"Đã vô hiệu hóa"** nhưng nhân viên ở trạng thái **"Tạm nghỉ"** hoặc **"Đã nghỉ việc"**.
  - Khi: chủ garage xem tab Tài khoản.
  - Thì: nút **"Kích hoạt lại tài khoản"** không hiển thị. Hệ thống chỉ hiển thị thông tin tài khoản đã bị vô hiệu hóa.

- [ ] **AC-16**: Hiển thị hộp thoại kích hoạt lại tài khoản
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản, tài khoản **"Đã vô hiệu hóa"** và nhân viên **"Đang làm việc"**.
  - Khi: chủ garage nhấn nút **"Kích hoạt lại tài khoản"**.
  - Thì: hệ thống hiển thị hộp thoại **"Kích hoạt lại tài khoản hệ thống?"** với nội dung: **"Tài khoản của nhân viên {tên nhân viên} sẽ được kích hoạt lại và có thể đăng nhập vào hệ thống Garage. Bạn có chắc chắn muốn tiếp tục?"**, cùng hai nút **"Hủy"** và **"Xác nhận"**.

- [ ] **AC-17**: Kích hoạt lại tài khoản thành công
  - Tại: hộp thoại kích hoạt lại tài khoản.
  - Khi: chủ garage nhấn nút **"Xác nhận"**.
  - Thì: hệ thống gửi yêu cầu kích hoạt lại tài khoản. Hộp thoại đóng lại. Trạng thái tài khoản chuyển sang **"Đang hoạt động"** sau khi hệ thống bên ngoài xử lý xong. Nút **"Kích hoạt lại tài khoản"** biến mất, thay thế bằng nút **"Thu hồi tài khoản"**.

  > **NEED CLARIFICATION**: KG frontend không có toast thành công riêng cho kích hoạt lại tài khoản (chỉ có toast **"Đã kích hoạt lại nhân viên thành công."** cho kích hoạt lại trạng thái làm việc). Cần Business Authority xác nhận toast text cho luồng này.

- [ ] **AC-18**: Hủy kích hoạt lại tài khoản
  - Tại: hộp thoại kích hoạt lại tài khoản.
  - Khi: chủ garage nhấn nút **"Hủy"**.
  - Thì: hộp thoại đóng lại. Trạng thái tài khoản không thay đổi.

### Nhóm D — Phân quyền

- [ ] **AC-19**: Phân quyền quản lý tài khoản đăng nhập
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền cấp, vô hiệu hóa và kích hoạt lại tài khoản đăng nhập. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm E — Xử lý lỗi

- [ ] **AC-20**: Cấp tài khoản thất bại
  - Tại: hộp thoại cấp tài khoản.
  - Khi: hệ thống xử lý thất bại (lỗi mạng, lỗi hệ thống).
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái tài khoản không thay đổi. Hộp thoại không đóng.

- [ ] **AC-21**: Thu hồi tài khoản thất bại
  - Tại: hộp thoại thu hồi tài khoản.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái tài khoản không thay đổi. Hộp thoại không đóng.

- [ ] **AC-22**: Kích hoạt lại tài khoản thất bại
  - Tại: hộp thoại kích hoạt lại tài khoản.
  - Khi: hệ thống xử lý thất bại.
  - Thì: hiển thị toast với tiêu đề: **"Lỗi"**. Trạng thái tài khoản không thay đổi. Hộp thoại không đóng.

- [ ] **AC-23**: Thay đổi trạng thái tài khoản đồng thời
  - Tại: màn hình Chi tiết nhân viên, tab Tài khoản.
  - Khi: chủ garage nhấn xác nhận thay đổi trạng thái tài khoản, nhưng tài khoản đã bị người dùng khác thay đổi trạng thái trước đó.
  - Thì: hệ thống từ chối thao tác. Hiển thị toast với tiêu đề: **"Lỗi"**.

## 3. UI/UX Reference

> TBD

## 4. API Reference

- Boundary: `gf-hrms` (qua BFF `agg-garage-graph`)
- Cấp tài khoản: Mutation `ProvisionEmployeeSso`
- Vô hiệu hóa tài khoản: Mutation `DisableEmployeeSso`
- Kích hoạt lại tài khoản: Mutation `EnableEmployeeSso`

## 5. Business Rules

- **BR-FND-EMP-SSO-001**: Cấp tài khoản chỉ thực hiện được khi trạng thái tài khoản là **"Chưa cấp tài khoản"** hoặc **"Tạo thất bại"**.
- **BR-FND-EMP-SSO-002**: Cấp tài khoản và kích hoạt lại tài khoản yêu cầu nhân viên phải ở trạng thái làm việc **"Đang làm việc"**.
- **BR-FND-EMP-SSO-003**: Vô hiệu hóa tài khoản chỉ yêu cầu tài khoản ở trạng thái **"Đang hoạt động"** — **không** yêu cầu nhân viên đang ở trạng thái **"Đang làm việc"**. Nhân viên đã tạm nghỉ hoặc nghỉ việc vẫn có thể bị thu hồi tài khoản.
- **BR-FND-EMP-SSO-004**: Kích hoạt lại tài khoản yêu cầu tài khoản ở trạng thái **"Đã vô hiệu hóa"** **và** nhân viên ở trạng thái **"Đang làm việc"**.
- **BR-FND-EMP-SSO-005**: Trạng thái tài khoản chỉ thay đổi thực sự sau khi hệ thống bên ngoài xử lý xong và phản hồi kết quả. Phía người dùng nhìn thấy trạng thái trung gian (đang tạo) cho đến khi có kết quả.
- **BR-FND-EMP-SSO-006**: Khi tạo nhân viên mới với tùy chọn cấp tài khoản ngay, hệ thống bắt đầu cấp tài khoản ngay lập tức — trạng thái tài khoản chuyển thẳng sang **"Đang tạo tài khoản"** (xem `FEAT-FND-EMP-CREATE`).

## 6. Edge Cases

- **EC-1**: Tài khoản đang ở trạng thái **"Đang tạo tài khoản"** — người dùng không thể thực hiện bất kỳ thao tác nào trên tài khoản cho đến khi nhận được kết quả từ hệ thống bên ngoài.
- **EC-2**: Nhân viên bị chấm dứt hợp đồng trong khi tài khoản vẫn **"Đang hoạt động"** — tài khoản không tự vô hiệu hóa (theo thiết kế). Chủ garage cần chủ động thu hồi tài khoản nếu muốn.
- **EC-3**: Nhân viên bị tạm nghỉ rồi kích hoạt lại — tài khoản giữ nguyên trạng thái trước đó (nếu **"Đang hoạt động"** thì vẫn **"Đang hoạt động"**, nếu **"Đã vô hiệu hóa"** thì vẫn **"Đã vô hiệu hóa"**).

## 7. Out of Scope

- Thay đổi trạng thái làm việc nhân viên (tạm nghỉ, chấm dứt hợp đồng, kích hoạt lại) → xem `FEAT-FND-EMP-STATUS`.
- Tạo mới nhân viên kèm cấp tài khoản → xem `FEAT-FND-EMP-CREATE`.
- Quản lý quyền và vai trò trong tài khoản đăng nhập → ngoài phạm vi tài liệu hiện tại.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-hrms + garage-web |
