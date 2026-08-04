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

# FEAT-STK-DETAIL: Chi tiết tồn kho

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-DETAIL` |
| Title | Chi tiết tồn kho |
| Parent Epic | `EP-INVENTORY-STOCK` |
| Boundary | `gf-inventory` |
| Priority | P1 |
| Status | PLANNED |

## 1. User Story

**As** chủ garage / kế toán, **I want** xem chi tiết tồn kho của một sản phẩm bao gồm thông tin tồn kho hiện tại, giá vốn, giá bán, và lịch sử xuất nhập (thẻ kho), **so that** tôi có thể theo dõi biến động tồn kho theo thời gian và truy vết nguồn gốc thay đổi.

## 2. Acceptance Criteria

### Nhóm A — Luồng chính: Hiển thị chi tiết tồn kho

- [ ] **AC-1**: Hiển thị màn hình chi tiết tồn kho
  - Tại: màn hình Danh sách tồn kho.
  - Khi: chủ garage nhấn vào một sản phẩm trong danh sách tồn kho.
  - Thì: hệ thống chuyển sang màn hình **"Chi tiết tồn kho"** với tiêu đề tên sản phẩm kèm SKU. Màn hình hiển thị các mục: Thông tin tồn kho, Lịch sử xuất nhập.

- [ ] **AC-2**: Hiển thị mục thông tin tồn kho
  - Tại: màn hình Chi tiết tồn kho, mục **"Thông tin tồn kho"**.
  - Khi: hệ thống tải dữ liệu chi tiết tồn kho.
  - Thì: hệ thống hiển thị các trường thông tin:
    - **"Tên phụ tùng"** — tên sản phẩm.
    - **"SKU"** — mã SKU sản phẩm.
    - **"Phân khúc"** — phân khúc sản phẩm.
    - **"Đơn vị"** — đơn vị tính.
    - **"Kho"** — tên kho chứa.
    - **"Số lượng tồn"** — số lượng tồn kho hiện tại (cho phép giá trị âm).
    - **"Số lượng đặt trước"** — số lượng đang được đặt trước (tracking marker, không trừ khỏi số lượng tồn).
    - **"Giá vốn"** — giá vốn trung bình.
    - **"Giá bán"** — giá bán hiện tại.

- [ ] **AC-3**: Hiển thị lịch sử xuất nhập (thẻ kho)
  - Tại: màn hình Chi tiết tồn kho, mục **"Lịch sử xuất nhập"**.
  - Khi: hệ thống tải dữ liệu lịch sử xuất nhập.
  - Thì: hệ thống hiển thị bảng paginated với các cột:
    - **"Ngày"** — ngày giao dịch.
    - **"Loại giao dịch"** — loại giao dịch: nhập kho (RECEIPT), xuất kho (DELIVERY), điều chỉnh (ADJUSTMENT).
    - **"Mã chứng từ"** — mã phiếu liên kết.
    - **"Số lượng thay đổi"** — số lượng thay đổi trong giao dịch.
    - **"Số lượng tồn sau giao dịch"** — số lượng tồn kho sau khi thực hiện giao dịch.
    - **"Giá vốn"** — giá vốn tại thời điểm giao dịch.
    - **"Ghi chú"** — ghi chú giao dịch (nếu có).

- [ ] **AC-4**: Phân trang lịch sử xuất nhập
  - Tại: màn hình Chi tiết tồn kho, mục **"Lịch sử xuất nhập"**.
  - Khi: lịch sử xuất nhập có nhiều hơn một trang.
  - Thì: hệ thống hiển thị phân trang và cho phép chủ garage chuyển trang.

- [ ] **AC-5**: Lịch sử xuất nhập trống
  - Tại: màn hình Chi tiết tồn kho, mục **"Lịch sử xuất nhập"**.
  - Khi: sản phẩm chưa có lịch sử xuất nhập.
  - Thì: hệ thống hiển thị thông báo **"Chưa có lịch sử xuất nhập"**.

- [ ] **AC-6**: Sản phẩm không tồn tại
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: mã sản phẩm không tồn tại trong hệ thống.
  - Thì: hệ thống hiển thị thông báo **"Không tìm thấy thông tin tồn kho"**.

### Nhóm B — Nút hành động

- [ ] **AC-7**: Nút điều chỉnh tồn kho
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: chủ garage nhấn nút **"Điều chỉnh tồn kho"**.
  - Thì: hệ thống chuyển sang màn hình điều chỉnh tồn kho (xem `FEAT-STK-ADJUST`).

- [ ] **AC-8**: Nút quay lại
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: chủ garage nhấn nút **"Quay lại"**.
  - Thì: hệ thống quay về màn hình Danh sách tồn kho.

### Nhóm C — Phân quyền

- [ ] **AC-9**: Phân quyền xem chi tiết tồn kho
  - Tại: màn hình Chi tiết tồn kho.
  - Khi: chủ garage hoặc kế toán truy cập.
  - Thì: cả hai vai trò đều có quyền xem chi tiết tồn kho. Không có ngoại lệ phân quyền cho chức năng này.

## 3. UI/UX Reference

> TBD — sẽ bổ sung sau khi gen UX-FLOW-INVENTORY-STOCK.

## 4. API Reference

- Boundary: `gf-inventory` (qua BFF `agg-garage-graph`)
- Chi tiết tồn kho: REST `stock-get-by-id` — GET `/api/v2/stocks/{id}`
- Lịch sử xuất nhập: Query `getHistoryStock` — GET `/api/v2/stocks/history` (paginated)

## 5. Business Rules

- **BR-STK-DTL-001**: Lịch sử xuất nhập hiển thị tất cả giao dịch: nhập kho (RECEIPT), xuất kho (DELIVERY), điều chỉnh (ADJUSTMENT).
- **BR-STK-DTL-002**: Tồn kho cho phép âm — hiển thị giá trị âm bình thường, không chặn hoặc cảnh báo.
- **BR-STK-DTL-003**: Số lượng đặt trước là tracking marker — hiển thị nhưng không trừ khỏi số lượng tồn.

## 6. Edge Cases

- **EC-1**: Sản phẩm không tồn tại (mã không hợp lệ hoặc đã bị xóa) — hiển thị thông báo **"Không tìm thấy thông tin tồn kho"**.
- **EC-2**: Sản phẩm chưa có lịch sử xuất nhập — hiển thị bảng trống với thông báo **"Chưa có lịch sử xuất nhập"**.
- **EC-3**: Tồn kho âm — hiển thị giá trị âm bình thường, không chặn hiển thị.

## 7. Out of Scope

- Danh sách tồn kho → xem `FEAT-STK-LIST`.
- Điều chỉnh tồn kho → xem `FEAT-STK-ADJUST`.
- Cập nhật giá bán → xem `FEAT-STK-PRICE`.

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo FEAT từ KG gf-inventory (stock-get-by-id, stock-history APIs, getHistoryStock query, 3 loại giao dịch: RECEIPT/DELIVERY/ADJUSTMENT) |
