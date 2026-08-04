---
type: epic
artifact_kind: epic
status: PLANNED
version: 3
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: "EP-INVENTORY-DELIVERY"
---

# EP-INVENTORY-DELIVERY-V2: Xuất kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-DELIVERY-V2` |
| Title | Xuất kho (V2) |
| Status | PLANNED |
| Priority | P1 |
| Target wave | TBD — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: V2 của `EP-INVENTORY-DELIVERY` (bản gốc giữ baseline). Dùng chung mô hình tồn/giá/vòng đời phiếu V2 với `EP-INVENTORY-RECEIPT-V2`.

## 1. Outcome / Hypothesis

Nếu garage quản lý phiếu xuất kho theo mô hình V2 — ghi sổ trừ tồn theo **mã sản phẩm nội bộ**, xuất theo **ĐVT quy đổi** quy về **ĐVT chính**, kiểm **tồn khả dụng** trước khi xuất (**chặn tồn âm**), đối soát phiếu dịch vụ và tuân **lock kỳ kế toán** — thì số liệu xuất kho và giá vốn (BQGQ cuối kỳ) chính xác, phục vụ báo cáo tồn/NXT realtime.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo, sửa, ghi sổ / bỏ ghi sổ, xóa, in, xuất excel phiếu xuất kho |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

## 3. Vòng đời trạng thái

```
  ┌──────────────────┐
  │    Tạo mới       │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐   Ghi sổ kho     ┌──────────────────┐
  │     Nháp         │─────────────────▶│   Ghi sổ kho     │
  │   (DRAFT)        │  (trừ tồn theo   │   (POSTED)       │
  │                  │   SL quy đổi)    │                  │
  │                  │◀─────────────────│                  │
  └────────┬─────────┘  Bỏ ghi sổ kho   └────────┬─────────┘
           │            (cộng tồn lại,            │
           │ Xóa         về Nháp)        Xóa (kỳ chưa khóa)
           ▼                                      ▼
       (đã xóa)                               (đã xóa)
```

**Ghi chú:**
- Vòng đời: **Nháp → Ghi sổ kho → Bỏ ghi sổ kho** (về Nháp). Không có "Đã hủy" — chỉ Xóa.
- **Ghi sổ kho** = trừ tồn theo SL quy đổi (ĐVT chính). **Trước khi trừ: check tồn khả dụng** — không cho ghi sổ nếu làm tồn âm (point-in-time).
- **Xóa**: cho xóa cả phiếu **Nháp** và **Ghi sổ kho** khi **kỳ chưa khóa** (xóa phiếu ghi sổ → cộng tồn lại). Chặn khi kỳ đã đóng hoặc xóa làm tồn âm.
- **Giá vốn xuất** = 0 cho tới khi chạy BQGQ cuối kỳ → cập nhật giá vốn thực (xem `EP-INVENTORY-ACCOUNTING-PERIOD` PRC).
- **Đối soát phiếu dịch vụ (SO)**: đối soát SL/sản phẩm giữa phiếu xuất và SO liên kết — **cảnh báo, không chặn** (giữ như V1).

## 4. Features

| FEAT ID | Title | Link | Loại | Priority |
|---|---|---|---|---|
| `FEAT-ID-LIST-V2` | Danh sách phiếu xuất kho (V2) | [FEAT-ID-LIST-V2](../features/FEAT-ID-LIST-V2.md) | V2 | P1 |
| `FEAT-ID-CREATE-V2` | Tạo phiếu xuất kho (V2) | [FEAT-ID-CREATE-V2](../features/FEAT-ID-CREATE-V2.md) | V2 | P1 |
| `FEAT-ID-DETAIL-V2` | Chi tiết phiếu xuất kho (V2) | [FEAT-ID-DETAIL-V2](../features/FEAT-ID-DETAIL-V2.md) | V2 | P1 |
| `FEAT-ID-EDIT-V2` | Chỉnh sửa phiếu xuất kho (V2) | [FEAT-ID-EDIT-V2](../features/FEAT-ID-EDIT-V2.md) | V2 | P1 |
| `FEAT-ID-DELETE` | Xóa phiếu xuất kho | [FEAT-ID-DELETE](../features/FEAT-ID-DELETE.md) | Mới | P1 |
| `FEAT-ID-PRINT` | In phiếu xuất kho | [FEAT-ID-PRINT](../features/FEAT-ID-PRINT.md) | Mới | P2 |
| `FEAT-ID-EXPORT` | Xuất excel danh sách phiếu xuất kho | [FEAT-ID-EXPORT](../features/FEAT-ID-EXPORT.md) | Mới | P2 |

> File V1 (`FEAT-ID-LIST/CREATE/DETAIL/EDIT`) giữ nguyên làm baseline.

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-CATALOG` | Upstream | Chọn mã sản phẩm nội bộ + SKU + ĐVT từ danh mục. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Upstream | Kỳ đã đóng → khóa phiếu; PRC cập nhật giá vốn xuất (BQGQ). |
| `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-OPENING-BALANCE` | Upstream | Nguồn tồn để xuất (nhập + tồn đầu kỳ). |
| `EP-SERVICE-ORDER` | Liên quan | Đối soát phiếu dịch vụ (SO) khi xuất sửa chữa. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Phiếu xuất ghi sổ = biến động −tồn cho báo cáo tồn/NXT. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: phiếu xuất kho, ghi sổ/bỏ ghi sổ, trừ tồn, check tồn khả dụng, lock kỳ. |
| `agg-garage-graph` | BFF layer. |
| `gf-sales` | Cung cấp phiếu dịch vụ (SO) để đối soát. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Phiếu xuất kho V2 được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu xuất được ghi sổ kho | >= 90% | Số phiếu "Ghi sổ kho" / tổng phiếu |
| Vi phạm tồn âm khi xuất | = 0 | Số lần ghi sổ bị chặn do tồn âm (kỳ vọng chặn 100%) |
| Tỷ lệ phiếu xuất lệch SO | <= 5% | Số phiếu có cờ cảnh báo lệch SO / tổng phiếu liên kết SO |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-DELIVERY-V2 (V2 của EP-INVENTORY-DELIVERY) — vòng đời Nháp→Ghi sổ kho→Bỏ ghi sổ; trừ tồn theo SL quy đổi, check tồn khả dụng (chặn tồn âm), giá vốn xuất=0 đến khi BQGQ, đối soát SO (cảnh báo), lock kỳ, xóa phiếu ghi sổ khi kỳ chưa khóa. 4 V2 + 3 mới (DELETE/PRINT/EXPORT). |
| 2026-06-16 | 2 | Business Authority | Gỡ con trỏ §27 tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang `EP-INVENTORY-RECEIPT-V2`. |
| 2026-07-02 | 3 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 — gate toàn bộ API Phiếu xuất kho V2. Ref BR-GF-INVENTORY §6.6 v3, CR-1782974034. |
