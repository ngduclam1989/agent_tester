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

# FEAT-STK-PRICE: Cập nhật giá bán và giá vốn

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-PRICE` |
| Title | Cập nhật giá bán và giá vốn |
| Parent Epic | `EP-INVENTORY-STOCK` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** cập nhật giá bán và giá vốn của sản phẩm tồn kho trực tiếp trên danh sách, **so that** giá trong hệ thống luôn phản ánh đúng chính sách giá hiện tại của garage.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Cập nhật giá bán

- [ ] **AC-1**: Click cell giá bán gợi ý mở modal
  - Tại: màn hình danh sách tồn kho (xem `FEAT-STK-LIST`), cell **"Giá bán gợi ý"** của một sản phẩm.
  - Khi: chủ garage click vào cell giá bán gợi ý.
  - Thì: hệ thống mở modal **"Cập nhật giá bán gợi ý"** với: **"Giá bán cũ"** (readonly, giá trị hiện tại) và **"Giá bán mới"** (input, bắt buộc).

- [ ] **AC-2**: Xác nhận cập nhật giá bán gợi ý
  - Tại: modal cập nhật giá bán gợi ý.
  - Khi: chủ garage nhập giá bán mới và nhấn **"Xác nhận"**.
  - Thì: hệ thống gọi mutation `UpdateStockPrice`. Thành công → toast **"Thành công"**, đóng modal, giá bán mới hiển thị trên danh sách.

- [ ] **AC-3**: Hủy cập nhật giá bán gợi ý
  - Tại: modal cập nhật giá bán gợi ý.
  - Khi: chủ garage nhấn **"Hủy"**.
  - Thì: hệ thống đóng modal, giữ nguyên giá cũ, không gọi API.

### Nhóm B — Cập nhật giá vốn

- [ ] **AC-4**: Click cell giá vốn mở modal
  - Tại: màn hình danh sách tồn kho, cell **"Giá vốn"** của một sản phẩm.
  - Khi: chủ garage click vào cell giá vốn.
  - Thì: hệ thống mở modal **"Cập nhật giá vốn"** với: **"Giá vốn cũ"** (readonly, giá trị hiện tại) và **"Giá vốn mới"** (input, bắt buộc).

- [ ] **AC-5**: Xác nhận cập nhật giá vốn
  - Tại: modal cập nhật giá vốn.
  - Khi: chủ garage nhập giá vốn mới và nhấn **"Xác nhận"**.
  - Thì: hệ thống gọi mutation `UpdateStockPrice`. Thành công → toast **"Điều chỉnh giá vốn thành công."**, đóng modal, giá vốn mới hiển thị trên danh sách.

- [ ] **AC-6**: Hủy cập nhật giá vốn
  - Tại: modal cập nhật giá vốn.
  - Khi: chủ garage nhấn **"Hủy"**.
  - Thì: hệ thống đóng modal, giữ nguyên giá cũ, không gọi API.

### Nhóm C — Validation

- [ ] **AC-7**: Giá bán gợi ý mới bắt buộc
  - Tại: modal cập nhật giá bán gợi ý.
  - Khi: chủ garage bỏ trống trường giá bán gợi ý mới.
  - Thì: hệ thống hiển thị lỗi validation **"Vui lòng nhập giá bán gợi ý mới"**.

- [ ] **AC-8**: Giá vốn mới bắt buộc
  - Tại: modal cập nhật giá vốn.
  - Khi: chủ garage bỏ trống trường giá vốn mới.
  - Thì: hệ thống hiển thị lỗi validation **"Vui lòng nhập giá vốn mới"**.

### Nhóm D — Phân quyền

- [ ] **AC-9**: Phân quyền cập nhật giá bán và giá vốn
  - Tại: màn hình danh sách tồn kho.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền cập nhật giá bán và giá vốn. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-STOCK.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Cập nhật giá bán: Mutation `updateStockPrice` -> returns `UpdateStockPriceResponse`
- Downstream API: PUT `/api/v2/stocks/prices` (`stock-update-prices`)
  - Request: `{ items: array }`
  - Response: `{ updated: integer }`

## 5. Business Rules

- **BR-STK-PRC-001**: Giá bán (suggestedPrice) và giá vốn (costPrice) là thuộc tính của tồn kho, cập nhật qua cùng mutation `UpdateStockPrice`.
- **BR-STK-PRC-002**: Mỗi lần cập nhật áp dụng cho 1 sản phẩm — click cell trên danh sách mở modal tương ứng.
- **BR-STK-PRC-003**: Giá bán mới và giá vốn mới là trường bắt buộc trên modal.

## 6. Edge Cases

- **EC-1**: Cập nhật giá bán / giá vốn cho sản phẩm có tồn kho = 0 — vẫn cho phép (giá độc lập với số lượng tồn).
- **EC-2**: Cập nhật giá giống giá hiện tại — cho phép nhưng không tạo thay đổi thực tế.

## 7. Out of Scope

- Danh sách tồn kho → xem `FEAT-STK-LIST`.
- Chi tiết tồn kho → xem `FEAT-STK-DETAIL`.
- Điều chỉnh tồn kho → xem `FEAT-STK-ADJUST`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory (stock-update-prices API, updateStockPrice mutation, batch update, giá bán >= 0) |
| 2026-05-21 | 2 | Business Authority | Sửa lại theo KG garage-web: xóa checkbox/batch/inline edit — thay bằng click cell → modal đơn lẻ (adjust-suggested-price-modal, adjust-cost-price-modal). Thêm luồng cập nhật giá vốn (AC-4→AC-6). Validation messages lấy từ KG (zod schemas). |
| 2026-05-22 | 3 | Business Authority | Đổi tên "Giá bán"→"Giá bán gợi ý" trong AC-1, AC-2, AC-3, AC-7 cho khớp tên cột trên FEAT-STK-LIST (KG garage-web: editable-suggested-price-cell, adjust-suggested-price-modal). |
