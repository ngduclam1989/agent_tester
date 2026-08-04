---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-MARKETING"
boundary: "gf-marketing"
last_reviewed: "2026-05-27"
---

# FEAT-MKT-CAMP-LIST: Danh sách chiến dịch

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-MKT-CAMP-LIST` |
| Title | Danh sách chiến dịch |
| Parent Epic | `EP-MARKETING` |
| Boundary | `gf-marketing` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách chiến dịch marketing với tìm kiếm, lọc trạng thái và phân trang, **so that** tôi có thể quản lý và theo dõi các chiến dịch đang chạy, đã hoàn thành hoặc đang nháp.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách chiến dịch
  - Tại: menu hệ thống, mục Marketing.
  - Khi: chủ garage truy cập chức năng quản lý chiến dịch.
  - Thì: hệ thống hiển thị màn hình **"Danh sách chiến dịch"** với bảng dữ liệu gồm các cột: **"Mã chiến dịch"**, **"Tên chiến dịch"**, **"Loại chiến dịch"**, **"Ngày tạo"**, **"Người khởi tạo"**, **"Ngày bắt đầu"**, **"Ngày kết thúc"**, **"Trạng thái"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái chiến dịch với badge
  - Tại: màn hình Danh sách chiến dịch, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng chiến dịch.
  - Thì: trạng thái hiển thị dưới dạng badge với các giá trị:
    - **"Nháp"**
    - **"Đã lên lịch"**
    - **"Đang chạy"**
    - **"Tạm dừng"**
    - **"Hoàn thành"**
    - **"Đã hủy"**

- [ ] **AC-3**: Hiển thị loại chiến dịch
  - Tại: màn hình Danh sách chiến dịch, cột **"Loại chiến dịch"**.
  - Khi: hệ thống hiển thị giá trị loại chiến dịch.
  - Thì: loại chiến dịch hiển thị với các giá trị:
    - **"Chạy 1 lần"**
    - **"Lặp lại theo lịch"**
    - **"Tự động theo sự kiện"**

- [ ] **AC-4**: Tìm kiếm chiến dịch theo từ khóa
  - Tại: màn hình Danh sách chiến dịch, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã hoặc tên chiến dịch. Placeholder: **"Tìm kiếm theo mã, tên"**. Kết quả được cập nhật tự động.

- [ ] **AC-5**: Lọc theo trạng thái
  - Tại: màn hình Danh sách chiến dịch, bộ lọc trạng thái.
  - Khi: chủ garage chọn trạng thái để lọc.
  - Thì: hệ thống lọc danh sách chiến dịch theo trạng thái đã chọn. Các giá trị lọc: **"Nháp"**, **"Đã lên lịch"**, **"Đang chạy"**, **"Tạm dừng"**, **"Hoàn thành"**, **"Đã hủy"**.

- [ ] **AC-6**: Lọc theo ngày tạo
  - Tại: màn hình Danh sách chiến dịch, bộ lọc ngày tạo.
  - Khi: chủ garage chọn khoảng thời gian.
  - Thì: hệ thống lọc danh sách chiến dịch theo ngày tạo trong khoảng thời gian đã chọn.

- [ ] **AC-7**: Phân trang danh sách
  - Tại: màn hình Danh sách chiến dịch, cuối bảng dữ liệu.
  - Khi: danh sách chiến dịch vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-8**: Nhấn vào dòng để xem chi tiết chiến dịch
  - Tại: màn hình Danh sách chiến dịch, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng chiến dịch.
  - Thì: hệ thống chuyển sang màn hình Chi tiết chiến dịch tương ứng (xem `FEAT-MKT-CAMP-DETAIL`).

- [ ] **AC-9**: Nút thêm mới chiến dịch
  - Tại: màn hình Danh sách chiến dịch, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm mới"**.
  - Thì: hệ thống hiển thị dialog **"Thêm mới chiến dịch"** với ô chọn loại chiến dịch. Placeholder: **"Chọn loại chiến dịch"**. Sau khi chọn loại và xác nhận, hệ thống chuyển sang màn hình tạo chiến dịch (xem `FEAT-MKT-CAMP-CREATE`).

- [ ] **AC-10**: Xóa chiến dịch từ danh sách
  - Tại: màn hình Danh sách chiến dịch, cột **"Thao tác"**.
  - Khi: chủ garage nhấn nút xóa chiến dịch ở trạng thái **"Nháp"**.
  - Thì: hệ thống hiển thị modal xác nhận với tiêu đề **"Xác nhận xóa"** và nội dung **"Bạn chắc chắn muốn xóa chiến dịch"**. Modal có hai nút: **"Đóng"** và **"Xác nhận"**.
  - Khi: chủ garage nhấn **"Xác nhận"**.
  - Thì: hệ thống xóa chiến dịch và cập nhật danh sách.

- [ ] **AC-11**: Danh sách trống
  - Tại: màn hình Danh sách chiến dịch.
  - Khi: không có chiến dịch nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-12**: Phân quyền xem danh sách chiến dịch
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách chiến dịch, tìm kiếm, lọc, xóa và điều hướng sang chi tiết hoặc tạo mới. Không có ngoại lệ phân quyền cho chức năng này.

### Nhóm C — Xử lý lỗi

- [ ] **AC-13**: Xóa chiến dịch thất bại
  - Tại: modal xác nhận xóa chiến dịch.
  - Khi: hệ thống xóa chiến dịch thất bại do lỗi.
  - Thì: hệ thống hiển thị toast với tiêu đề **"Lỗi"**. Danh sách giữ nguyên.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-MARKETING.

## 4. API Reference

- Boundary: `gf-marketing` (qua BFF `agg-garage-graph`)
- Danh sách chiến dịch: Query `SearchCampaigns`
- Xóa chiến dịch: Mutation `DeleteCampaign`

## 5. Business Rules

- **BR-MKT-CAMP-LST-001**: Danh sách chiến dịch luôn được phạm vi theo garage hiện tại — không hiển thị chiến dịch của garage khác.
- **BR-MKT-CAMP-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho mã và tên chiến dịch.
- **BR-MKT-CAMP-LST-003**: Chỉ cho phép xóa chiến dịch ở trạng thái **"Nháp"**.
- **BR-MKT-CAMP-LST-004**: Trạng thái chiến dịch có sáu giá trị: **"Nháp"**, **"Đã lên lịch"**, **"Đang chạy"**, **"Tạm dừng"**, **"Hoàn thành"**, **"Đã hủy"**.
- **BR-MKT-CAMP-LST-005**: Mã chiến dịch được hệ thống tự sinh theo định dạng CAMP_{NNNNN}, không cho phép nhập thủ công.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có chiến dịch nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và lọc trạng thái cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.
- **EC-3**: Xóa chiến dịch không ở trạng thái **"Nháp"** — nút xóa không hiển thị hoặc bị vô hiệu.

## 7. Out of Scope

- Tạo chiến dịch mới → xem `FEAT-MKT-CAMP-CREATE`.
- Chi tiết chiến dịch → xem `FEAT-MKT-CAMP-DETAIL`.
- Chỉnh sửa chiến dịch → xem `FEAT-MKT-CAMP-EDIT`.
- Quản lý chương trình voucher → xem `FEAT-MKT-VOUC-LIST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-marketing + garage-web (campaign list screen, SearchCampaigns query, DeleteCampaign mutation) |
