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

# FEAT-CAT-TRANS-LIST: Danh sách nhà xe liên kết

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-TRANS-LIST` |
| Title | Danh sách nhà xe liên kết |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-system` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách nhà xe liên kết với tìm kiếm, lọc và phân trang, **so that** tôi có thể quản lý và tra cứu nhanh thông tin nhà xe liên kết phục vụ mua hàng và vận chuyển.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách nhà xe liên kết
  - Tại: menu hệ thống, mục **"Nhà xe liên kết"** trên thanh điều hướng.
  - Khi: chủ garage truy cập chức năng quản lý nhà xe liên kết.
  - Thì: hệ thống hiển thị màn hình **"Danh sách nhà xe liên kết"** với bảng dữ liệu gồm các cột: **"Tên nhà xe"**, **"Số điện thoại"**, **"Địa chỉ nhà xe nhận hàng"**, **"Thời gian chạy xe"**, **"Thông tin tuyến xe"**, **"Ngày tạo"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Hiển thị trạng thái nhà xe liên kết với badge
  - Tại: màn hình Danh sách nhà xe liên kết, cột **"Trạng thái"**.
  - Khi: hệ thống hiển thị giá trị trạng thái của từng nhà xe liên kết.
  - Thì: trạng thái hiển thị dưới dạng badge với giá trị:
    - **"Đang hoạt động"**
    - **"Ngừng hoạt động"**

- [ ] **AC-3**: Tìm kiếm nhà xe liên kết theo từ khóa
  - Tại: màn hình Danh sách nhà xe liên kết, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên nhà xe, số điện thoại hoặc tuyến xe. Placeholder: **"Tìm kiếm theo tên nhà xe, số điện thoại, tuyến xe"**. Kết quả được cập nhật tự động.

- [ ] **AC-4**: Lọc danh sách theo trạng thái
  - Tại: màn hình Danh sách nhà xe liên kết, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị lọc trạng thái.
  - Thì: hệ thống lọc danh sách theo trạng thái đã chọn. Các giá trị lọc: **"Hoạt động"** (chỉ nhà xe đang hoạt động), tất cả (mặc định — hiển thị cả hai trạng thái).

- [ ] **AC-5**: Phân trang danh sách
  - Tại: màn hình Danh sách nhà xe liên kết, cuối bảng dữ liệu.
  - Khi: danh sách nhà xe liên kết vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-6**: Nhấn vào dòng để xem chi tiết nhà xe liên kết
  - Tại: màn hình Danh sách nhà xe liên kết, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng nhà xe liên kết.
  - Thì: hệ thống chuyển sang màn hình Chi tiết nhà xe liên kết tương ứng.

- [ ] **AC-7**: Nút thêm nhà xe liên kết
  - Tại: màn hình Danh sách nhà xe liên kết, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Thêm nhà xe liên kết"**.
  - Thì: hệ thống chuyển sang màn hình tạo nhà xe liên kết mới (xem `FEAT-CAT-TRANS-CREATE`).

- [ ] **AC-8**: Nút sửa trên dòng danh sách
  - Tại: màn hình Danh sách nhà xe liên kết, cột thao tác trên từng dòng.
  - Khi: chủ garage nhấn icon sửa trên dòng nhà xe liên kết.
  - Thì: hệ thống chuyển sang màn hình chỉnh sửa nhà xe liên kết tương ứng (xem `FEAT-CAT-TRANS-EDIT`).

- [ ] **AC-9**: Nút xóa trên dòng danh sách
  - Tại: màn hình Danh sách nhà xe liên kết, cột thao tác trên từng dòng.
  - Khi: chủ garage nhấn icon xóa trên dòng nhà xe liên kết.
  - Thì: hệ thống hiển thị dialog xác nhận xóa (xem `FEAT-CAT-TRANS-DELETE`).

- [ ] **AC-10**: Danh sách trống
  - Tại: màn hình Danh sách nhà xe liên kết.
  - Khi: không có nhà xe liên kết nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-11**: Phân quyền xem danh sách nhà xe liên kết
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách nhà xe liên kết, tìm kiếm, lọc, và điều hướng sang chi tiết, tạo mới, chỉnh sửa hoặc xóa. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-system` (qua BFF `agg-garage-graph`)
- Danh sách nhà xe liên kết: Query `SearchTenantTransporterRegistries`

## 5. Business Rules

- **BR-CAT-TRANS-LST-001**: Danh sách nhà xe liên kết luôn được phạm vi theo garage hiện tại — không hiển thị nhà xe liên kết của garage khác.
- **BR-CAT-TRANS-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho tên nhà xe, số điện thoại và tuyến xe.
- **BR-CAT-TRANS-LST-003**: Trạng thái nhà xe liên kết chỉ có hai giá trị: **"Đang hoạt động"** và **"Ngừng hoạt động"**.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có nhà xe liên kết nào — hiển thị thông báo danh sách trống.
- **EC-2**: Kết hợp tìm kiếm và lọc trạng thái cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.

## 7. Out of Scope

- Tạo nhà xe liên kết mới → xem `FEAT-CAT-TRANS-CREATE`.
- Chỉnh sửa nhà xe liên kết → xem `FEAT-CAT-TRANS-EDIT`.
- Xóa nhà xe liên kết → xem `FEAT-CAT-TRANS-DELETE`.
- Quản lý nhà cung cấp, danh mục dịch vụ, hàng hóa → thuộc các FEAT khác trong `EP-CATALOG`.
- Báo giá, mua hàng và theo dõi đơn hàng → xem `EP-PROCUREMENT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-system + garage-web (linked-transporters list screen, SearchTenantTransporterRegistries query) |
| 2026-05-20 | 2 | Business Authority | Đổi tên "nhà vận chuyển" → "nhà xe liên kết" toàn bộ file (tiêu đề, metadata, user story). |
