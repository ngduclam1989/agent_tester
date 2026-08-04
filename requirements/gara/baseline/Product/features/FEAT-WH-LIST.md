---
type: feature
artifact_kind: feature
status: DONE
version: 1
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-WH-LIST: Danh sách kho hàng

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-WH-LIST` |
| Title | Danh sách kho hàng |
| Parent Epic | `EP-INVENTORY-STOCK` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách kho hàng của garage, **so that** tôi có thể biết garage đang có bao nhiêu kho và thông tin từng kho.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách kho hàng

- [ ] **AC-1**: Hiển thị màn hình danh sách kho hàng
  - Tại: menu hệ thống, mục quản lý kho.
  - Khi: chủ garage truy cập chức năng kho hàng.
  - Thì: hệ thống hiển thị màn hình **"Danh sách kho hàng"** với bảng dữ liệu gồm các cột: **"Mã kho"**, **"Tên kho"**, **"Chi nhánh"**, **"Địa chỉ"**, **"Trạng thái"**. Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm kho hàng
  - Tại: màn hình Danh sách kho hàng, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với mã kho hoặc tên kho. Placeholder: **"Tìm kiếm theo mã kho, tên kho"**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Nhấn vào dòng để xem chi tiết kho hàng
  - Tại: màn hình Danh sách kho hàng, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng kho hàng.
  - Thì: hệ thống hiển thị thông tin chi tiết kho hàng (expand/modal hoặc inline detail).

- [ ] **AC-4**: Hiển thị chi tiết kho hàng
  - Tại: màn hình chi tiết kho hàng (sau khi nhấn vào dòng).
  - Khi: hệ thống hiển thị thông tin chi tiết.
  - Thì: chi tiết kho gồm các trường: **"Mã kho"**, **"Tên kho"**, **"Chi nhánh"**, **"Địa chỉ"**, **"Ngày tạo"**.

- [ ] **AC-5**: Danh sách trống
  - Tại: màn hình Danh sách kho hàng.
  - Khi: không có kho hàng nào phù hợp với điều kiện tìm kiếm hoặc garage chưa có branch nào tạo kho.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-6**: Phân quyền xem danh sách kho hàng
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách kho hàng, tìm kiếm và xem chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-STOCK.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Danh sách kho hàng: Query `searchWarehouses`
- Chi tiết kho hàng: Query `getWarehouseById`

## 5. Business Rules

- **BR-WH-LST-001**: Kho hàng được tạo tự động khi tạo chi nhánh mới (BranchCreatedEvent) — không có chức năng tạo kho thủ công trên giao diện.
- **BR-WH-LST-002**: Danh sách kho hàng luôn được phạm vi theo garage hiện tại — không hiển thị kho của garage khác.
- **BR-WH-LST-003**: Mỗi chi nhánh có một kho hàng mặc định.

## 6. Edge Cases

- **EC-1**: Garage chỉ có 1 chi nhánh — danh sách hiển thị 1 kho duy nhất.
- **EC-2**: Garage mới tạo nhưng kho chưa được tạo tự động (event chưa xử lý) — danh sách trống.

## 7. Out of Scope

- Tạo, sửa, xóa kho hàng — không có API hỗ trợ.
- Quản lý tồn kho → xem `FEAT-STK-LIST`.
- Điều chỉnh tồn kho → xem `FEAT-STK-ADJUST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory (warehouse-search, warehouse-get-by-id APIs, searchWarehouses query, warehouse auto-created từ BranchCreatedEvent BR-019, view-only) |
