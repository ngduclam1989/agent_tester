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

# FEAT-CAT-SVC-LIST: Danh sách dịch vụ

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-SVC-LIST` |
| Title | Danh sách dịch vụ |
| Parent Epic | `EP-CATALOG` |
| Boundary | `gf-erp-mdm` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách dịch vụ với khả năng tìm kiếm và phân trang, **so that** tôi có thể quản lý danh mục dịch vụ garage cung cấp, nắm bắt nhanh thông tin giá bán và đơn vị của từng dịch vụ.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm và điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách dịch vụ
  - Tại: menu hệ thống, mục quản lý dịch vụ.
  - Khi: chủ garage truy cập chức năng quản lý dịch vụ.
  - Thì: hệ thống hiển thị màn hình **"Danh sách dịch vụ"** với bảng dữ liệu gồm các cột: **"Tên dịch vụ"**, **"Mã dịch vụ"**, **"Đơn vị"**, **"Giá bán"**, **"Ngày tạo"**, **"Ngày cập nhật"**, **"Thao tác"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm dịch vụ theo từ khóa
  - Tại: màn hình Danh sách dịch vụ, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên dịch vụ hoặc mã dịch vụ. Placeholder: **"Tìm theo tên dịch vụ, mã dịch vụ"**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Phân trang danh sách
  - Tại: màn hình Danh sách dịch vụ, cuối bảng dữ liệu.
  - Khi: danh sách dịch vụ vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-4**: Nút chỉnh sửa trong cột thao tác
  - Tại: màn hình Danh sách dịch vụ, cột **"Thao tác"** của dòng dịch vụ.
  - Khi: chủ garage xem danh sách dịch vụ.
  - Thì: cột **"Thao tác"** hiển thị biểu tượng chỉnh sửa. Khi nhấn, hệ thống chuyển sang màn hình chỉnh sửa dịch vụ (xem `FEAT-CAT-SVC-EDIT`).

- [ ] **AC-5**: Nút tạo dịch vụ mới
  - Tại: màn hình Danh sách dịch vụ, phía trên bảng dữ liệu.
  - Khi: chủ garage nhấn nút **"Tạo dịch vụ mới"**.
  - Thì: hệ thống chuyển sang màn hình tạo dịch vụ mới (xem `FEAT-CAT-SVC-CREATE`).

- [ ] **AC-6**: Danh sách trống
  - Tại: màn hình Danh sách dịch vụ.
  - Khi: không có dịch vụ nào phù hợp với điều kiện tìm kiếm hoặc garage chưa có dịch vụ nào.
  - Thì: hệ thống hiển thị thông báo trống trong bảng dữ liệu.

### Nhóm B — Phân quyền

- [ ] **AC-7**: Phân quyền xem danh sách dịch vụ
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách dịch vụ, tìm kiếm, và điều hướng sang tạo hoặc chỉnh sửa dịch vụ. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW cho EP-CATALOG.

## 4. API Reference

- Boundary: `gf-erp-mdm` (qua BFF `agg-garage-graph`)
- Danh sách dịch vụ: Query `SearchServices`

## 5. Business Rules

- **BR-CAT-SVC-LST-001**: Danh sách dịch vụ luôn được phạm vi theo garage hiện tại — không hiển thị dịch vụ của garage khác.
- **BR-CAT-SVC-LST-002**: Tìm kiếm từ khóa áp dụng đồng thời cho tên dịch vụ và mã dịch vụ.
- **BR-CAT-SVC-LST-003**: Cột **"Thao tác"** luôn hiển thị biểu tượng chỉnh sửa cho mỗi dòng dịch vụ.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có dịch vụ nào — hiển thị thông báo danh sách trống.
- **EC-2**: Từ khóa tìm kiếm không khớp bất kỳ dịch vụ nào — hiển thị bảng trống.

## 7. Out of Scope

- Tạo dịch vụ mới → xem `FEAT-CAT-SVC-CREATE`.
- Chỉnh sửa thông tin dịch vụ → xem `FEAT-CAT-SVC-EDIT`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG garage-web (inventory-services list screen, SearchServices query) |
