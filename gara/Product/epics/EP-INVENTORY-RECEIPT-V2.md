---
type: epic
artifact_kind: epic
status: PLANNED
version: 6
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-02"
supersedes: "EP-INVENTORY-RECEIPT"
---

# EP-INVENTORY-RECEIPT-V2: Nhập kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-RECEIPT-V2` |
| Title | Nhập kho (V2) |
| Status | PLANNED |
| Priority | P1 |
| Target wave | TBD — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: V2 của `EP-INVENTORY-RECEIPT` (bản gốc giữ nguyên làm baseline). Nền tảng tồn/giá/vòng đời phiếu V2 đặc tả ở `BR-GF-INVENTORY-RECEIPT-V2`.

## 1. Outcome / Hypothesis

Nếu garage quản lý phiếu nhập kho theo mô hình V2 — ghi sổ kho theo **mã sản phẩm nội bộ** (mapping SKU), nhập theo **ĐVT quy đổi** nhưng lưu tồn theo **ĐVT chính**, gắn **kho** từng dòng, tuân **lock kỳ kế toán** và **chặn tồn âm** — thì garage có số liệu tồn kho và giá trị chính xác, nhất quán xuyên suốt các phân hệ, làm nền cho tính giá xuất kho và báo cáo tồn/NXT realtime.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Tạo, chỉnh sửa, ghi sổ / bỏ ghi sổ, xóa, in, xuất excel phiếu nhập kho |
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
  │   (DRAFT)        │  (cộng tồn theo  │   (POSTED)       │
  │                  │   SL quy đổi)    │                  │
  │                  │◀─────────────────│                  │
  └────────┬─────────┘  Bỏ ghi sổ kho   └──────────────────┘
           │            (trừ tồn, về Nháp)
           │ Xóa
           ▼
       (đã xóa)
```

**Ghi chú:**
- **Vòng đời mới**: **Nháp → Ghi sổ kho → Bỏ ghi sổ kho** (về Nháp). **Bỏ trạng thái "Đã hủy"** của V1 — chỉ còn **Xóa**.
- **Ghi sổ kho** = cộng tồn theo **SL quy đổi (ĐVT chính)** cho từng (mã nội bộ + kho + garage). **Bỏ ghi sổ kho** = trừ tồn lại, đưa phiếu về Nháp để sửa.
- **Chặn tồn âm**: ghi sổ / sửa / xóa làm tồn lũy kế tại bất kỳ thời điểm nào từ ngày chứng từ trở đi < 0 → chặn (xem `BR-GF-INVENTORY-RECEIPT-V2`).
- **Lock kỳ kế toán**: phiếu có ngày chứng từ thuộc **kỳ đã đóng** → không cho thêm/sửa/xóa.
- Sửa/xóa phiếu, xóa dòng, đổi SP/SL/ngày/kho → **tính lại tồn**.
- Nguồn nhập (Mua ngoài / Nền tảng) + Loại phiếu (Nhập mua / Nhập hàng bán bị trả lại / Nhập khác) là 2 trường riêng. PO không bắt buộc. Đối tượng đổ theo loại phiếu (Nhập mua→NCC; Nhập hàng bán bị trả lại→Khách hàng; Nhập khác→tất cả).

## 4. Features

| FEAT ID | Title | Link | Loại | Priority |
|---|---|---|---|---|
| `FEAT-IR-LIST-V2` | Danh sách phiếu nhập kho (V2) | [FEAT-IR-LIST-V2](../features/FEAT-IR-LIST-V2.md) | V2 | P1 |
| `FEAT-IR-CREATE-V2` | Tạo phiếu nhập kho (V2) | [FEAT-IR-CREATE-V2](../features/FEAT-IR-CREATE-V2.md) | V2 | P1 |
| `FEAT-IR-DETAIL-V2` | Chi tiết phiếu nhập kho (V2) | [FEAT-IR-DETAIL-V2](../features/FEAT-IR-DETAIL-V2.md) | V2 | P1 |
| `FEAT-IR-EDIT-V2` | Chỉnh sửa phiếu nhập kho (V2) | [FEAT-IR-EDIT-V2](../features/FEAT-IR-EDIT-V2.md) | V2 | P1 |
| `FEAT-IR-DELETE` | Xóa phiếu nhập kho | [FEAT-IR-DELETE](../features/FEAT-IR-DELETE.md) | Mới | P1 |
| `FEAT-IR-PRINT` | In phiếu nhập kho | [FEAT-IR-PRINT](../features/FEAT-IR-PRINT.md) | Mới | P2 |
| `FEAT-IR-EXPORT` | Xuất excel danh sách phiếu nhập kho | [FEAT-IR-EXPORT](../features/FEAT-IR-EXPORT.md) | Mới | P2 |

> File V1 (`FEAT-IR-LIST/CREATE/DETAIL/EDIT`) giữ nguyên làm baseline, không sửa.

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-CATALOG` | Upstream | Chọn mã sản phẩm nội bộ + SKU + ĐVT (chính/quy đổi) từ danh mục. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Upstream | Kỳ kế toán đã đóng → khóa phiếu trong kỳ. |
| `EP-PROCUREMENT` | Upstream | Phiếu nhập có thể kế thừa dữ liệu từ đơn hàng mua (PO) — không bắt buộc. |
| `EP-INVENTORY-OPENING-BALANCE` | Liên quan | Cùng đóng góp tồn (mã+kho+gara). |
| `EP-INVENTORY-STOCK-V2` | Downstream | Phiếu nhập đã ghi sổ là biến động +tồn cho báo cáo tồn/NXT. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` (PRC) | Downstream | Giá trị nhập trong kỳ là đầu vào công thức BQGQ. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: phiếu nhập kho, ghi sổ/bỏ ghi sổ, cập nhật tồn theo (mã+kho+gara), chặn tồn âm, lock kỳ. |
| `agg-garage-graph` | BFF layer. |
| `gf-purchase` | Cung cấp dữ liệu đơn hàng mua (PO) khi phiếu liên kết. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Phiếu nhập kho V2 được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ phiếu nhập được ghi sổ kho | >= 90% | Số phiếu "Ghi sổ kho" / tổng phiếu (loại Nháp bỏ dở) |
| Vi phạm tồn âm | = 0 | Số thao tác bị chặn do tồn âm (kỳ vọng chặn 100%) |
| Vi phạm sửa/xóa phiếu trong kỳ đã đóng | = 0 | Số thao tác bị chặn do kỳ khóa |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-RECEIPT-V2 (V2 của EP-INVENTORY-RECEIPT) — vòng đời Nháp→Ghi sổ kho→Bỏ ghi sổ (bỏ Đã hủy, chỉ Xóa); SKU+mã nội bộ, ĐVT quy đổi→tồn theo ĐVT chính, kho theo dòng, lock kỳ kế toán, chặn tồn âm point-in-time, tính lại tồn. 4 feature V2 + 3 feature mới (DELETE/PRINT/EXPORT). |
| 2026-06-10 | 2 | Business Authority | Thêm §0 Δ Thay đổi so với V1. |
| 2026-06-10 | 3 | Business Authority | Thêm khung **CR** cấp epic (tailor): Metadata (Loại thay đổi CR + Epic target production) + đổi §0 thành **Bối cảnh thay đổi (Change Request — DEV đọc trước)** umbrella; bảng Δ giữ ở §0.1/0.2. |
| 2026-06-10 | 4 | Business Authority | Gỡ khung mapping V1↔V2 (CR, §0 Bối cảnh, bảng Δ, lineage tags) — spec V2 đứng độc lập; giữ nguyên toàn bộ nội dung nghiệp vụ. |
| 2026-06-16 | 5 | Business Authority | Gỡ con trỏ §27 tới `Plan/INVENTORY-V2-RULES.md` (note file sắp xóa) → đổi sang tham chiếu nội bộ `BR-GF-INVENTORY-RECEIPT-V2`. |
| 2026-07-02 | 6 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 — gate toàn bộ API Phiếu nhập kho V2. Ref BR-GF-INVENTORY §6.6 v3, CR-1782974034. |
