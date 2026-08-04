---
type: epic
artifact_kind: epic
status: DONE
version: 3
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-05-27"
supersedes: null
---

# EP-INVENTORY-STOCK: Tồn kho

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-STOCK` |
| Title | Tồn kho |
| Status | PLANNED |
| Priority | P1 |
| Target wave | Wave 1 |

## 1. Outcome / Hypothesis

Nếu garage có thể xem danh sách tồn kho realtime, tra cứu thẻ kho và lịch sử xuất nhập của từng sản phẩm, điều chỉnh tồn kho (kiểm kê) khi có chênh lệch, và cập nhật giá bán hàng loạt — trên một hệ thống duy nhất — thì garage sẽ kiểm soát chính xác số lượng tồn, phát hiện chênh lệch kịp thời, và quản lý giá bán linh hoạt.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Xem tồn kho, tra cứu thẻ kho, điều chỉnh tồn, cập nhật giá bán |
| Kế toán | PRIMARY | Quyền tương đương chủ garage trong quản lý tồn kho |

## 3. Vòng đời trạng thái

Epic này tập trung vào **xem** và **điều chỉnh** dữ liệu tồn kho — không có vòng đời trạng thái riêng cho bản ghi tồn kho (InventoryStock).

**Ghi chú:**
- Tồn kho (InventoryStock) không có trạng thái chuyển đổi — chỉ có số lượng tồn (quantity), số lượng đặt trước (reservedQuantity), và giá vốn (costPrice).
- Tồn kho cho phép **âm** (negative stock) theo yêu cầu nghiệp vụ (BR-GF-INVENTORY-014).
- Số lượng đặt trước (reservedQuantity) là **tracking marker only** — KHÔNG trừ khỏi số lượng khả dụng (availableQuantity = quantity).
- Điều chỉnh tồn kho (stock adjustment) trực tiếp thay đổi quantity, tạo giao dịch ADJUSTMENT, và trigger điều chỉnh kỳ kho nếu kỳ đã đóng (BR-GF-INVENTORY-015).

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-STK-LIST` | Danh sách tồn kho | [FEAT-STK-LIST](../features/FEAT-STK-LIST.md) | P1 |
| `FEAT-STK-DETAIL` | Chi tiết tồn kho | [FEAT-STK-DETAIL](../features/FEAT-STK-DETAIL.md) | P1 |
| `FEAT-STK-ADJUST` | Điều chỉnh tồn kho | [FEAT-STK-ADJUST](../features/FEAT-STK-ADJUST.md) | P1 |
| `FEAT-STK-PRICE` | Cập nhật giá bán | [FEAT-STK-PRICE](../features/FEAT-STK-PRICE.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT` | Upstream | Phiếu nhập kho khi duyệt sẽ tăng tồn kho; hoàn tác sẽ giảm tồn kho. |
| `EP-INVENTORY-DELIVERY` | Upstream | Phiếu xuất kho khi duyệt sẽ giảm tồn kho; hoàn tác sẽ tăng tồn kho. |
| `EP-INVENTORY-PERIOD` | Related | Tồn kho theo kỳ (period stock) dựa trên snapshot tồn kho tại thời điểm chốt kỳ. Điều chỉnh tồn kho trigger điều chỉnh kỳ kho nếu kỳ đã đóng. |
| `EP-CATALOG` | Upstream | Danh mục sản phẩm (Product, ProductLine) cung cấp thông tin sản phẩm hiển thị trên tồn kho. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: xử lý toàn bộ nghiệp vụ tồn kho (InventoryStock), điều chỉnh tồn, cập nhật giá bán, lịch sử xuất nhập. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| `gf-inventory-worker` | Temporal workflows: fulfillment (tạo phiếu xuất từ PO), reservation-expiry, period-closure. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ garage sử dụng tồn kho hàng tuần | >= 70% | Số tuần có truy cập tồn kho / tổng tuần hoạt động |
| Độ chính xác tồn kho sau kiểm kê | >= 95% | Số sản phẩm không cần điều chỉnh / tổng sản phẩm kiểm kê |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Business Authority | Khởi tạo EP-INVENTORY-STOCK từ 5 FEAT: tồn kho (LIST/DETAIL v1), điều chỉnh tồn (ADJUST v1), cập nhật giá bán (PRICE v1), kho hàng (WH-LIST v1). Negative stock cho phép (BR-014). Warehouse auto-created từ branch event (BR-019). |
| 2026-05-21 | 2 | Business Authority | Đổi tên "Quản lý kho hàng & tồn kho" → "Tồn kho". |
| 2026-05-21 | 3 | Business Authority | Xóa FEAT-WH-LIST (Danh sách kho hàng) — hiện tại 1 garage mặc định 1 kho, chưa có màn hình danh sách kho riêng. Xóa mentions kho hàng khỏi outcome, personas, ghi chú, architecture dependencies. |
