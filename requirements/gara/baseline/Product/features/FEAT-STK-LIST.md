---
type: feature
artifact_kind: feature
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-STK-LIST: Danh sách tồn kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST` |
| Title | Danh sách tồn kho |
| Parent Epic | `EP-INVENTORY-STOCK` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem danh sách tồn kho của garage với tìm kiếm theo tên/SKU/mã Genuine, lọc theo phân khúc và trạng thái, phân trang, **so that** tôi có thể nắm bắt tình trạng tồn kho của từng sản phẩm nhanh chóng.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị danh sách, tìm kiếm, lọc, điều hướng

- [ ] **AC-1**: Hiển thị màn hình danh sách tồn kho
  - Tại: menu hệ thống, mục quản lý kho.
  - Khi: chủ garage truy cập chức năng tồn kho.
  - Thì: hệ thống hiển thị màn hình **"Danh sách tồn kho"** với bảng dữ liệu gồm các cột: **"Tên phụ tùng"**, **"SKU"**, **"Mã Genuine"**, **"Nguồn gốc"**, **"Phân khúc"**, **"Tồn kho khả dụng"**, **"Dự kiến nhập"**, **"Dự kiến xuất"**, **"Đơn vị tính"**, **"Giá vốn"**, **"Giá bán gợi ý"**, **"Ngày cập nhật"**, **"Thao tác"** (xem Lịch sử cập nhật tồn kho). Dữ liệu được phân trang.

- [ ] **AC-2**: Tìm kiếm tồn kho theo từ khóa
  - Tại: màn hình Danh sách tồn kho, ô tìm kiếm.
  - Khi: chủ garage nhập từ khóa vào ô tìm kiếm.
  - Thì: hệ thống lọc danh sách theo từ khóa khớp với tên phụ tùng, SKU hoặc mã Genuine. Placeholder: **"Tìm kiếm theo mã SKU, mã Genuine, tên..."**. Kết quả được cập nhật tự động.

- [ ] **AC-3**: Lọc danh sách theo phân khúc
  - Tại: màn hình Danh sách tồn kho, bộ lọc **"Phân khúc"**.
  - Khi: chủ garage chọn giá trị phân khúc từ dropdown.
  - Thì: hệ thống lọc danh sách tồn kho theo phân khúc đã chọn. Giá trị: **"Hàng xịn"**, **"Hàng thương hiệu"**, **"Hàng liên doanh"**, **"Hàng bãi"**, **"Khác"**. Mặc định hiển thị tất cả.

- [ ] **AC-3a**: Lọc danh sách theo trạng thái
  - Tại: màn hình Danh sách tồn kho, bộ lọc **"Trạng thái"**.
  - Khi: chủ garage chọn giá trị trạng thái từ dropdown.
  - Thì: hệ thống lọc danh sách tồn kho theo trạng thái tồn kho. Giá trị: **"Còn hàng"**, **"Hết hàng"**. Mặc định hiển thị tất cả.

- [ ] **AC-4**: Phân trang danh sách
  - Tại: màn hình Danh sách tồn kho, cuối bảng dữ liệu.
  - Khi: danh sách tồn kho vượt quá số lượng hiển thị trên một trang.
  - Thì: hệ thống hiển thị phân trang cho phép chuyển giữa các trang.

- [ ] **AC-5**: Nhấn vào dòng để xem chi tiết tồn kho
  - Tại: màn hình Danh sách tồn kho, một dòng trong bảng.
  - Khi: chủ garage nhấn vào dòng tồn kho.
  - Thì: hệ thống chuyển sang màn hình Chi tiết tồn kho tương ứng (xem `FEAT-STK-DETAIL`).

- [ ] **AC-6**: Hiển thị số lượng tồn âm
  - Tại: màn hình Danh sách tồn kho, cột **"Tồn kho khả dụng"**.
  - Khi: sản phẩm có số lượng tồn kho âm (negative stock).
  - Thì: hệ thống hiển thị giá trị âm bình thường — không cảnh báo, không chặn hiển thị.

- [ ] **AC-7**: Danh sách trống
  - Tại: màn hình Danh sách tồn kho.
  - Khi: không có sản phẩm tồn kho nào phù hợp với điều kiện tìm kiếm hoặc lọc.
  - Thì: hệ thống hiển thị thông báo danh sách trống.

### Nhóm B — Phân quyền

- [ ] **AC-8**: Phân quyền xem danh sách tồn kho
  - Tại: menu hệ thống.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem danh sách tồn kho, tìm kiếm, lọc và điều hướng sang chi tiết. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-STOCK.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Danh sách tồn kho (web): Query `searchInventoryStocks` -> `SearchInventoryStocksResponse`, downstream GET `/api/v2/stocks`
- Danh sách tồn kho (mobile): GET `/api/v2/stocks/mobile` (lightweight)

## 5. Business Rules

- **BR-STK-LST-001**: Danh sách tồn kho luôn được phạm vi theo garage hiện tại — không hiển thị tồn kho của garage khác.
- **BR-STK-LST-002**: Tồn kho cho phép âm (negative stock) — hiển thị bình thường không cảnh báo (ref: BR-GF-INVENTORY-014).
- **BR-STK-LST-003**: Số lượng đặt trước là tracking marker — không trừ khỏi số lượng tồn hiển thị (availableQuantity = quantity, không phải quantity - reservedQuantity).
- **BR-STK-LST-004**: Tìm kiếm từ khóa áp dụng đồng thời cho tên phụ tùng, SKU và mã Genuine.

## 6. Edge Cases

- **EC-1**: Garage mới chưa có tồn kho — hiển thị thông báo danh sách trống.
- **EC-2**: Sản phẩm có tồn kho âm — hiển thị giá trị âm bình thường, không chặn hoặc cảnh báo.
- **EC-3**: Kết hợp nhiều bộ lọc (phân khúc + trạng thái) và tìm kiếm cùng lúc — hệ thống áp dụng tất cả điều kiện đồng thời và hiển thị kết quả khớp.

## 7. Out of Scope

- Chi tiết tồn kho -> xem `FEAT-STK-DETAIL`.
- Điều chỉnh tồn kho -> xem `FEAT-STK-ADJUST`.
- Cập nhật giá bán -> xem `FEAT-STK-PRICE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory (stock-search API, searchInventoryStocks query, negative stock BR-014, reserved quantity tracking only) |
| 2026-05-21 | 2 | Business Authority | Thay bộ lọc "Kho" bằng 2 bộ lọc đúng theo KG: "Phân khúc" (tiers — 5 giá trị enum) và "Trạng thái" (inStock/lowStock — Còn hàng/Hết hàng). Xóa cột "Kho" khỏi AC-1. Xóa FEAT-WH-LIST khỏi Out of Scope. |
| 2026-05-22 | 3 | Business Authority | Bổ sung 5 cột thiếu theo KG garage-web: Mã Genuine, Nguồn gốc, Dự kiến nhập, Dự kiến xuất, Ngày cập nhật. Đổi tên: "Số lượng tồn"→"Tồn kho khả dụng", "Giá bán"→"Giá bán gợi ý", "Đơn vị"→"Đơn vị tính". Xóa cột "Số lượng đặt trước". Ghi rõ Thao tác = xem Lịch sử cập nhật tồn kho. Cập nhật placeholder tìm kiếm + BR-004. |
