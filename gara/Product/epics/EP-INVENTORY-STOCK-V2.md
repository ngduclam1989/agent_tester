---
type: epic
artifact_kind: epic
status: PLANNED
version: 5
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-01"
supersedes: "EP-INVENTORY-STOCK"
---

# EP-INVENTORY-STOCK-V2: Báo cáo tồn kho (V2)

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-STOCK-V2` |
| Title | Báo cáo tồn kho V2 (tồn đến ngày · NXT · thẻ kho) |
| Status | PLANNED |
| Priority | P1 |
| Target wave | TBD — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: V2 của `EP-INVENTORY-STOCK` (bản gốc giữ baseline). Gom **2 báo cáo**: Báo cáo tồn kho (V2 của STOCK) + Báo cáo NXT (`FEAT-IP-VIEW` dời từ `EP-INVENTORY-PERIOD` cũ sang) + thẻ kho. **Chỉ 3 feature mới**; file V1 cũ (LIST/DETAIL/ADJUST/PRICE) giữ nguyên, không đụng, không link. **V2 KHÔNG có điều chỉnh tồn (ADJUST)**. Nền tảng cơ chế lưu tồn (sổ tồn): `BR-GF-INVENTORY-STOCK-V2`.

## 1. Outcome / Hypothesis

Nếu garage xem được **tồn kho đến bất kỳ ngày nào** (số lượng realtime, giá trị theo BQGQ), **báo cáo Nhập-Xuất-Tồn** theo khoảng, và **thẻ kho** (lịch sử biến động từng mã) — tất cả dựa trên **cơ chế lưu tồn (sổ tồn)** — thì garage nắm chính xác tồn và giá trị tại mọi thời điểm phục vụ kiểm kê, đối soát và ra quyết định.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Xem báo cáo tồn đến ngày, NXT, thẻ kho; xuất file |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

## 3. Cơ chế nền (lưu tồn / sổ tồn)

```
Mỗi lần ghi sổ nhập/xuất, import OB, sửa/xóa phiếu, hoặc chạy BQGQ
        │  → cập nhật biến động ngày (SL/GT nhập + xuất) + tồn cuối ngày
        ▼   theo (mã+kho+gara) — phiếu cùng ngày gộp thành 1 điểm dữ liệu
   Sổ tồn  ──┬─ Báo cáo tồn đến ngày  = tồn cuối ngày của mốc gần nhất ≤ D
             ├─ Báo cáo NXT           = ĐỌC THẲNG sổ tồn (Đầu + Nhập + Xuất + Cuối)
             └─ Thẻ kho               = đọc chi tiết phiếu nhập/xuất (running, per-phiếu)
```

**Ghi chú:**
- **SL tồn**: realtime (lưu sẵn theo sổ tồn). **Giá trị tồn**: theo BQGQ — luôn là **số** (= GT tồn đầu + GT nhập − giá vốn xuất; giá vốn xuất = 0 nếu chưa chạy BQGQ). **Không dùng chữ "Tạm tính"** trong ô.
- **Sổ tồn ghi nhận cả biến động ngày (SL/GT nhập + xuất) + tồn cuối ngày** — Báo cáo tồn-đến-ngày và Báo cáo NXT đọc **CÙNG 1 nguồn (sổ tồn)** để đảm bảo nhất quán, không lệch số giữa 2 báo cáo tại cùng mốc ngày.
- **Thẻ kho** vẫn đọc chi tiết phiếu nhập/xuất (per-phiếu granularity, running balance) — đầu kỳ tra sổ tồn.
- **OB lưu trong bảng tồn đầu kỳ** (source riêng, không nằm trong sổ tồn). Sổ tồn là **projection** — engine tính lại từ (bảng OB + phiếu detail). Xóa/sửa OB (`FEAT-OB-DELETE-LINES` / `FEAT-OB-EDIT`) → thao tác ở bảng OB → engine tính lại sổ tồn.
- Báo cáo theo **(mã + kho + gara)** — tách dòng theo kho (1 mã ở nhiều kho → nhiều dòng). Không filter Garage (theo login).
- V2 **không có điều chỉnh tồn**: mọi biến động qua phiếu nhập/xuất + import tồn đầu.

## 4. Features

| FEAT ID | Title | Link | Loại | Priority |
|---|---|---|---|---|
| `FEAT-STK-LIST-V2` | Báo cáo tồn kho đến ngày | [FEAT-STK-LIST-V2](../features/FEAT-STK-LIST-V2.md) | V2 | P1 |
| `FEAT-IP-VIEW-V2` | Báo cáo Nhập Xuất Tồn (NXT) | [FEAT-IP-VIEW-V2](../features/FEAT-IP-VIEW-V2.md) | V2 (dời từ EP-PERIOD) | P1 |
| `FEAT-STK-DETAIL-V2` | Xem lịch sử tồn kho (thẻ kho) | [FEAT-STK-DETAIL-V2](../features/FEAT-STK-DETAIL-V2.md) | V2 | P1 |

> File V1 cũ (`FEAT-STK-LIST`, `FEAT-STK-DETAIL`, `FEAT-STK-ADJUST`, `FEAT-STK-PRICE`, `FEAT-IP-VIEW`) giữ nguyên baseline — không sửa, không link vào epic V2.

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-DELIVERY-V2` | Upstream | Phiếu ghi sổ tạo biến động → sổ tồn tồn. |
| `EP-INVENTORY-OPENING-BALANCE` | Upstream | Tồn đầu kỳ là điểm khởi đầu sổ tồn. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` (PRC) | Upstream | Giá trị tồn / giá vốn xuất chốt sau khi chạy BQGQ; chưa chạy → giá vốn xuất = 0. |
| `EP-INVENTORY-CATALOG` | Upstream | Hiển thị theo mã sản phẩm nội bộ + ĐVT chính. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: sổ tồn tồn, báo cáo tồn/NXT/thẻ kho. |
| `agg-garage-graph` | BFF layer. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Báo cáo tồn/NXT/thẻ kho được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Thời gian tải báo cáo tồn đến ngày | <= 3 giây | Từ chọn bộ lọc đến hiển thị |
| Khớp số lượng tồn báo cáo vs sổ tồn | = 100% | Đối chiếu định kỳ |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-STOCK-V2 (V2 của EP-INVENTORY-STOCK) — 3 feature mới: Báo cáo tồn đến ngày (STK-LIST-V2), Báo cáo NXT (IP-VIEW-V2 dời từ EP-PERIOD), Thẻ kho (STK-DETAIL-V2). Dựa trên cơ chế lưu tồn (sổ tồn): SL realtime + giá trị theo BQGQ (số/0, không "Tạm tính"). V2 bỏ điều chỉnh tồn; file V1 cũ giữ nguyên không link. |
| 2026-06-15 | 2 | Business Authority | Đổi thuật ngữ tiếng Anh sang **"sổ tồn"** (§3 + dependencies). |
| 2026-06-16 | 3 | Business Authority | Gỡ con trỏ §27 tới `Plan/INVENTORY-V2-RULES.md` §7.1 (note file sắp xóa) → đổi sang `BR-GF-INVENTORY-STOCK-V2`. |
| 2026-07-02 | 5 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 — gate toàn bộ API Báo cáo tồn/NXT/thẻ kho. Ref BR-GF-INVENTORY §6.6 v3, CR-1782974034. |
| 2026-07-01 | 4 | Business Authority | **Sync §3 Cơ chế nền với BR-STKV2-001/010 v5** — sơ đồ Báo cáo NXT đổi từ "Đầu (tra) + Nhập/Xuất (tính) + Cuối" → "**ĐỌC THẲNG sổ tồn**" (cùng nguồn với báo cáo tồn-đến-ngày). Thẻ kho vẫn đọc chi tiết phiếu (per-phiếu running). Ghi chú bổ sung: OB lưu tách biệt trong sổ tồn (xóa độc lập qua `FEAT-OB-DELETE-LINES`); sổ tồn ghi nhận cả biến động ngày + tồn cuối ngày; phiếu cùng ngày gộp thành 1 điểm dữ liệu. |
