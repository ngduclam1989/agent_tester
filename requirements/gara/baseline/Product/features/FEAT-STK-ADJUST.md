---
type: feature
artifact_kind: feature
status: DONE
version: 2
tier: T2
owner_authority: Business Authority
parent_epic: "EP-INVENTORY-STOCK"
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
---

# FEAT-STK-ADJUST: Điều chỉnh tồn kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-ADJUST` |
| Title | Điều chỉnh tồn kho |
| Parent Epic | `EP-INVENTORY-STOCK` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** điều chỉnh số lượng tồn kho của sản phẩm khi phát hiện chênh lệch (kiểm kê), **so that** số lượng tồn kho trong hệ thống phản ánh đúng thực tế.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Cập nhật số lượng tồn kho

- [ ] **AC-1**: Mở modal cập nhật số lượng tồn kho
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: chủ garage nhấn nút **"Điều chỉnh tồn kho"**.
  - Thì: hệ thống mở modal **"Cập nhật số lượng tồn kho"** với các trường:
    - **"Tồn kho cũ"** — readonly, hiển thị số lượng tồn hiện tại.
    - **"Tồn kho cập nhật"** — input number, bắt buộc.
    - **"Lý do cập nhật"** — input, bắt buộc, placeholder: **"Nhập lý do cập nhật"**.

- [ ] **AC-2**: Xác nhận cập nhật số lượng tồn kho
  - Tại: modal Cập nhật số lượng tồn kho.
  - Khi: chủ garage nhập đủ thông tin và nhấn **"Xác nhận"**.
  - Thì: hệ thống gọi API stock-adjust (mutation `adjustStockQuantity`). Thành công → toast tiêu đề **"Thành công"**, mô tả **"Điều chỉnh tồn kho thành công."**. Đóng modal, số lượng tồn kho được cập nhật.

- [ ] **AC-3**: Hủy cập nhật
  - Tại: modal Cập nhật số lượng tồn kho.
  - Khi: chủ garage nhấn **"Hủy"**.
  - Thì: hệ thống đóng modal, không thay đổi dữ liệu.

### Nhóm B — Validation

- [ ] **AC-4**: Tồn kho cập nhật bắt buộc
  - Tại: modal Cập nhật số lượng tồn kho.
  - Khi: chủ garage bỏ trống trường **"Tồn kho cập nhật"**.
  - Thì: hệ thống hiển thị lỗi validation **"Vui lòng nhập số lượng tồn kho cập nhật"**.

- [ ] **AC-5**: Lý do cập nhật bắt buộc
  - Tại: modal Cập nhật số lượng tồn kho.
  - Khi: chủ garage bỏ trống trường **"Lý do cập nhật"**.
  - Thì: hệ thống hiển thị lỗi validation **"Vui lòng nhập lý do cập nhật"**.

- [ ] **AC-6**: Cho phép giá trị âm
  - Tại: modal Cập nhật số lượng tồn kho.
  - Khi: chủ garage nhập **"Tồn kho cập nhật"** là giá trị âm.
  - Thì: hệ thống chấp nhận giá trị âm (negative stock allowed theo BR-GF-INVENTORY-014).

### Nhóm C — Phân quyền

- [ ] **AC-7**: Phân quyền điều chỉnh tồn kho
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: chủ garage hoặc kế toán truy cập chức năng điều chỉnh tồn kho.
  - Thì: cả hai vai trò đều có quyền điều chỉnh tồn kho. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-STOCK.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Điều chỉnh tồn kho: Mutation `adjustStockQuantity` -> downstream PUT `/api/v2/stocks/adjust`
  - Request: `{ sku: string, warehouse_code: string, delta: decimal, reason: string }`
  - Response: `{ stock: object }`

## 5. Business Rules

- **BR-STK-ADJ-001**: Điều chỉnh tồn kho trực tiếp thay đổi quantity trên InventoryStock, tạo giao dịch ADJUSTMENT trong lịch sử (BR-GF-INVENTORY-015).
- **BR-STK-ADJ-002**: Nếu kỳ kho hiện tại đã đóng (CLOSED), hệ thống tự động trigger điều chỉnh kỳ kho (period stock adjustment).
- **BR-STK-ADJ-003**: Điều chỉnh cho phép kết quả tồn kho âm (BR-GF-INVENTORY-014).
- **BR-STK-ADJ-004**: Lý do điều chỉnh bắt buộc nhập — không cho phép điều chỉnh không có lý do.

## 6. Edge Cases

- **EC-1**: Cập nhật tồn kho về 0 — hợp lệ.
- **EC-2**: Cập nhật khi kỳ kho đã đóng — hệ thống tự xử lý điều chỉnh kỳ kho, không cần thao tác thêm từ user.

## 7. Out of Scope

- Danh sách tồn kho -> xem `FEAT-STK-LIST`.
- Chi tiết tồn kho -> xem `FEAT-STK-DETAIL`.
- Cập nhật giá bán -> xem `FEAT-STK-PRICE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory (stock-adjust API, adjustStockQuantity mutation, BR-015 ADJUSTMENT transaction + period stock trigger, BR-014 negative stock allowed) |
| 2026-05-22 | 2 | Business Authority | Sửa lại theo KG garage-web: form 2 bước → modal đơn "Cập nhật số lượng tồn kho". Xóa trường Sản phẩm, Kho, Chênh lệch. Đổi tên: "Số lượng tồn hiện tại"→"Tồn kho cũ", "Số lượng tồn thực tế"→"Tồn kho cập nhật", "Lý do điều chỉnh"→"Lý do cập nhật". Xóa modal xác nhận 2 bước. Thêm validation messages cụ thể từ KG (zod schemas). Xóa EC-3 (chênh lệch = 0). |
