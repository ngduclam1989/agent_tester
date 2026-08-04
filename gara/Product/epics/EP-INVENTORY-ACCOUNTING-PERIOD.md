---
type: epic
artifact_kind: epic
status: PLANNED
version: 16
tier: T2
owner_authority: Business Authority
boundary: "gf-accounting"
last_reviewed: "2026-07-07"
supersedes: null
---

# EP-INVENTORY-ACCOUNTING-PERIOD: Kỳ kế toán & Tính giá xuất kho

---

## Metadata

| Field | Value |
|---|---|
| Epic ID | `EP-INVENTORY-ACCOUNTING-PERIOD` |
| Title | Kỳ kế toán & Tính giá xuất kho (BQGQ cuối kỳ) |
| Status | PLANNED |
| Priority | P1 |
| Target wave | TBD — Inventory V2 (post-baseline) |

> **Phạm vi V2 / forward design**: Epic này là **mới hoàn toàn**, không có bản V1 gốc. **Kỳ kế toán ≠ kỳ kho** (`EP-INVENTORY-PERIOD` cũ — "Tồn kho theo kỳ" — giữ nguyên, không liên quan).
>
> **Trạng thái viết**: epic gồm 2 nhóm feature — **Kỳ kế toán (AP, 5)** và **Tính giá xuất kho (PRC, 5)**. **Cả 2 nhóm đã đặc tả đầy đủ** (10/10 feature).

## 1. Outcome / Hypothesis

Nếu garage có một danh mục **kỳ kế toán** phân cấp (năm → quý → tháng) với khả năng **đóng/mở kỳ** — và (giai đoạn sau) UI **tính giá xuất kho theo BQGQ cuối kỳ** — thì garage kiểm soát được thời điểm chốt sổ kho: khi đóng kỳ, các phiếu nhập/xuất trong kỳ bị khóa chỉnh sửa, đảm bảo số liệu tồn và giá vốn nhất quán để lên báo cáo tồn/NXT.

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý danh mục kỳ kế toán: tạo/sửa/xóa kỳ, đóng/mở kỳ; (giai đoạn sau) chạy tính giá xuất kho |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

## 3. Vòng đời trạng thái

### 3.1 Kỳ kế toán (AP)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │   Chưa đóng      │────────▶│    Đã đóng       │
  │   (OPEN)         │  Đóng   │   (CLOSED)       │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Mở lại kỳ            │
           └────────────────────────────┘
```

**Ghi chú:**
- Kỳ kế toán khởi tạo ở trạng thái **"Chưa đóng"**.
- Cấu trúc phân cấp **3 cấp cố định**: **Năm → Quý → Tháng**. Kỳ quý/tháng phải gắn vào kỳ cha hợp lệ ("Thuộc kỳ").
- **Đóng / mở kỳ không ràng buộc thứ tự** — người dùng tự thao tác trên từng kỳ. Cho phép **mở lại** kỳ đã đóng.
- Khi kỳ ở trạng thái **"Đã đóng"**: chặn thêm / sửa / xóa phiếu nhập kho, xuất kho có ngày chứng từ thuộc kỳ đó (chi tiết tại `EP-INVENTORY-RECEIPT-V2`, `EP-INVENTORY-DELIVERY-V2`).
- Đóng/mở kỳ là **field trạng thái** sửa qua `FEAT-AP-EDIT` (không có feature đóng/mở riêng).

### 3.2 Tính giá xuất kho (PRC)

> `FEAT-PRC-*` là UI tính giá xuất kho theo **BQGQ cuối kỳ** — tính theo **mã sản phẩm nội bộ** (+ kho + garage). Chi tiết công thức/vòng đời: `BR-GF-INVENTORY-ACCOUNTING-PERIOD` §2.2 (BR-PRC-*).

```
  Chọn kỳ + kho + mã  ──► Thực hiện tính giá (BQGQ)
       │                      │
       │                      ▼
       │            ┌──────────────────────────┐
       │            │ • Đơn giá BQ = (GT tồn đầu│
       │            │   + GT nhập)/(SL tồn đầu  │
       │            │   + SL nhập)              │
       │            │ • Điền giá vốn phiếu xuất │
       │            │ • Cập nhật giá trị sổ tồn │
       │            │ • Ghi log lần chạy        │
       │            └──────────┬───────────────┘
       │                       │ Tính lại (ghi đè)
       │                       ▼
       │              (cập nhật lại kết quả)
       └─ Xóa log (không rollback; chặn nếu kỳ đã đóng)
```

**Ghi chú:**
- **Đơn giá BQ chỉ dùng phía NHẬP** (+ tồn đầu kỳ); giá vốn xuất là **output** = Đơn giá BQ × **SL quy đổi**. **NHẬP trong kỳ (SL + GT)** = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua); giá trị kế thừa (không theo đơn giá BQ): "Nhập hàng bán bị trả lại" ← phiếu **Xuất bán** gốc (BR-IRV2-031); "Xuất trả hàng mua" ← phiếu **Nhập mua** gốc (BR-IDV2-030). **Mọi "SL" trong PRC = SL quy đổi (ĐVT chính)**; đơn giá BQ ra theo ĐVT chính (khác đơn giá nhập theo ĐVT nhập).
- **Tồn đầu kỳ** = **tồn kho của mặt hàng theo (Mã + Kho + Garage), tính đến hết ngày "Từ ngày" − 1** — **SL tồn đầu** (SL quy đổi ĐVT chính) và **GT tồn đầu** (tiền tuyệt đối VND); mã chưa phát sinh gì trước kỳ → đến từ **OB** (nếu có) hoặc 0. Đơn giá BQ = **kết quả chạy giá** = (GT đầu + GT nhập)/(SL đầu + SL nhập), **làm tròn 2 chữ số thập phân sau khi tính** và **dùng giá trị đó để tính tiền vốn** (cột "Đơn giá bình quân" hiển thị đúng 2 lẻ này); đơn giá = 0 hợp lệ (mã chưa nhập / nhập tiền 0).
- **KHÔNG bắt tính tuần tự**: tính kỳ nào cũng được — vì tồn đầu lấy theo **tồn kho đến "Từ ngày" − 1** nên đã phản ánh mọi biến động nhập/xuất của các kỳ trước (kể cả kỳ chưa tính giá: phiếu xuất chưa tính → tiền vốn = 0). Tính/tính lại một kỳ → các kỳ **sau** cần tính lại.
- **Tính lặp khi có phiếu trả tự tham chiếu**: nếu mã có dòng phiếu **"Nhập hàng bán bị trả lại" "Tự nhập giá" KHÔNG tích** (đơn giá để hệ thống cập nhật) tham chiếu phiếu **Xuất bán cùng kỳ chưa tính** → GT nhập phụ thuộc giá vốn xuất (output BQGQ) → hệ thống **tính lặp đến khi đơn giá BQ hội tụ** (BR-PRC-017); dòng **"Tự nhập giá" tích** (nhập đơn giá tay) → không lặp.
- Chọn **kỳ** → tự điền Từ/Đến, khóa không sửa. Tính theo **(Mã + Kho + Garage)**; chọn **"Tất cả mã"** hoặc mã cụ thể.
- **Sau khi tính**: cập nhật giá vốn phiếu xuất + **giá trị sổ tồn** (báo cáo tự đúng). **Tính lại** ghi đè + audit mới; **chặn RECALC nếu kỳ đã đóng** (mở lại kỳ để tính). **Xóa log** không rollback giá vốn; chặn nếu kỳ đã đóng.
- Mã **lỗi** → không cập nhật giá vốn + giá trị tồn cho mã đó; bảng "Sản phẩm chạy giá lỗi".

## 4. Features

### 4.1 Kỳ kế toán (AP) — 5 feature

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-AP-LIST` | Danh sách kỳ kế toán | [FEAT-AP-LIST](../features/FEAT-AP-LIST.md) | P1 |
| `FEAT-AP-CREATE` | Tạo kỳ kế toán | [FEAT-AP-CREATE](../features/FEAT-AP-CREATE.md) | P1 |
| `FEAT-AP-DETAIL` | Chi tiết kỳ kế toán | [FEAT-AP-DETAIL](../features/FEAT-AP-DETAIL.md) | P1 |
| `FEAT-AP-EDIT` | Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) | [FEAT-AP-EDIT](../features/FEAT-AP-EDIT.md) | P1 |
| `FEAT-AP-DELETE` | Xóa kỳ kế toán | [FEAT-AP-DELETE](../features/FEAT-AP-DELETE.md) | P1 |

### 4.2 Tính giá xuất kho (PRC) — 5 feature

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-PRC-LIST` | Danh sách lịch sử tính giá xuất kho | [FEAT-PRC-LIST](../features/FEAT-PRC-LIST.md) | P1 |
| `FEAT-PRC-CREATE` | Thực hiện tính giá xuất kho | [FEAT-PRC-CREATE](../features/FEAT-PRC-CREATE.md) | P1 |
| `FEAT-PRC-DETAIL` | Chi tiết lần tính giá xuất kho | [FEAT-PRC-DETAIL](../features/FEAT-PRC-DETAIL.md) | P1 |
| `FEAT-PRC-RECALC` | Tính lại giá xuất kho | [FEAT-PRC-RECALC](../features/FEAT-PRC-RECALC.md) | P1 |
| `FEAT-PRC-DELETE` | Xóa khoản mục lịch sử tính giá | [FEAT-PRC-DELETE](../features/FEAT-PRC-DELETE.md) | P1 |

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT-V2` | Downstream | Phiếu nhập kho tuân lock theo kỳ kế toán (đóng kỳ → khóa phiếu trong kỳ). |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Phiếu xuất kho tuân lock theo kỳ kế toán. |
| `EP-INVENTORY-OPENING-BALANCE` | Downstream | Tồn đầu kỳ liên hệ kỳ kế toán **gián tiếp qua "Tồn đến ngày"** (không gắn trực tiếp); ngày rơi vào kỳ đã đóng → chặn import/xóa. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn / NXT theo kỳ kế toán. |
| `EP-INVENTORY-CATALOG` | Upstream | (PRC) Tính giá xuất kho theo mã sản phẩm nội bộ + phương pháp tính giá khai ở từng mã. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-accounting` | **Boundary chính**: master của Kỳ kế toán (AP — trạng thái đóng/mở, phân cấp Năm→Quý→Tháng) + Tính giá xuất kho BQGQ cuối kỳ (PRC). Khớp pattern ERP truyền thống (kế toán tính money/costing). |
| `gf-inventory` | Consumer Kỳ (đọc trạng thái đóng/mở qua REST để chặn phiếu chỉnh sửa trong kỳ đóng) + owner Sổ tồn SL (số lượng) + owner Tồn đầu kỳ (OB, thuộc `EP-INVENTORY-OPENING-BALANCE`). PRC cross-boundary REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang `gf-accounting` (AP + PRC) và `gf-inventory` (Sổ tồn / OB). |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Kỳ kế toán + Tính giá được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

## 6. Success Metric

| Metric | Target | Measurement |
|---|---|---|
| Tỷ lệ kỳ kế toán được đóng đúng hạn | >= 90% | Số kỳ đóng trong vòng N ngày sau ngày kết thúc / tổng kỳ |
| Vi phạm chỉnh sửa phiếu trong kỳ đã đóng | = 0 | Số thao tác sửa phiếu bị chặn do kỳ đóng (kỳ vọng chặn 100%) |
| Thời gian trung bình tạo kỳ kế toán (auto sinh) | <= 1 phút | Từ mở form đến lưu thành công |

## 7. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 1 | Business Authority | Khởi tạo EP-INVENTORY-ACCOUNTING-PERIOD (epic mới, no V1) — đặc tả nhóm AP (Kỳ kế toán, 5 feature): phân cấp Năm→Quý→Tháng, đóng/mở kỳ không ràng buộc thứ tự (cho mở lại), tự động sinh kỳ. Nhóm PRC (Tính giá xuất kho, 5 feature) đánh dấu "sắp bổ sung" — đặc tả ở giai đoạn sau. |
| 2026-06-03 | 2 | Business Authority | Bổ sung nhóm PRC (Tính giá xuất kho, 5 feature): §3.2 vòng đời + công thức BQGQ (đơn giá BQ chỉ dùng nhập, tồn đầu = SL × đơn giá neo, tính tuần tự, snapshot), §4.2 link 5 feature FEAT-PRC-*. Epic hoàn tất 10/10 feature. |
| 2026-06-15 | 3 | Business Authority | Rà completeness (B2): §5.1 sửa quan hệ với EP-OPENING-BALANCE — tồn đầu kỳ liên hệ kỳ **gián tiếp qua "Tồn đến ngày"**, không gắn trực tiếp (đồng bộ Plan §7.5 + BR-OB-002 + BR-AP-013). |
| 2026-06-15 | 4 | Business Authority | Tái thiết kế công thức BQGQ ở §3.2: tồn đầu = tồn cuối lần gần nhất + Σ nhập kỳ chưa tính, cộng thẳng (SL,GT) — **bỏ đơn giá neo**; **KHÔNG bắt tính tuần tự**; sau khi tính **cập nhật giá trị sổ tồn** (báo cáo tự đúng); tính lại kỳ → kỳ sau cần tính lại. Diagram §3.2 đổi "Snapshot giá trị tồn" → "Cập nhật giá trị sổ tồn". |
| 2026-06-16 | 5 | Business Authority | §3.2 ghi chú: làm rõ **đơn giá BQ = kết quả chạy giá (GT đầu+GT nhập)/(SL đầu+SL nhập)**, suy ra khi hiển thị (bảng chi tiết có cột "Đơn giá bình quân", 2 số lẻ); đơn giá=0 hợp lệ (mã chưa nhập / nhập tiền 0). Gỡ cụm "đơn giá neo" khỏi thân §3.2 (mô tả thẳng cộng thẳng (SL,GT)). |
| 2026-06-16 | 6 | Business Authority | Gỡ câu nhắc "WAC cũ chạy ngầm cuối tháng giữ nguyên" ở §3.2 (dấu vết V1 — V2 đứng độc lập). Ghi rõ FEAT-PRC-* tính BQGQ cuối kỳ theo **mã sản phẩm nội bộ**. |
| 2026-06-16 | 7 | Business Authority | Gỡ 2 con trỏ tới `Plan/INVENTORY-V2-RULES.md` (note file sắp xóa): §27 mệnh đề bối cảnh (bỏ) + §3.2 "Chi tiết công thức §7.2" → đổi sang `BR-GF-INVENTORY-ACCOUNTING-PERIOD` §2.2 (BR-PRC-*). |
| 2026-06-16 | 8 | Business Authority | Sửa công thức carry-over §3.2: tồn đầu = tồn cuối gần nhất + Σ nhập − Σ xuất kỳ giữa chưa tính (khớp MISA, đồng bộ BR-PRC-002/004). |
| 2026-06-16 | 9 | Business Authority | Chốt ĐVT (M4) §3.2: mọi "SL" trong PRC = SL quy đổi (ĐVT chính); giá vốn xuất = đơn giá BQ × SL quy đổi; đơn giá BQ theo ĐVT chính (khác đơn giá nhập). Đồng bộ BR-PRC-001/005. |
| 2026-06-16 | 10 | Business Authority | Đồng bộ mô tả **tồn đầu kỳ** §3.2 theo điểm-thời-gian = **tồn kho đến "Từ ngày" − 1** (SL + GT riêng; mã mới → OB hoặc 0); "không bắt tuần tự" diễn đạt lại theo tồn đầu đã phản ánh biến động kỳ trước. Bỏ diễn đạt dồn cũ. Khớp BR-PRC-002/003/004/006. |
| 2026-06-16 | 11 | Business Authority | §3.2: thêm định nghĩa **NHẬP trong kỳ (SL + GT)** = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua); giá trị kế thừa (không theo BQ): "Nhập hàng bán bị trả lại" ← Xuất bán gốc, "Xuất trả hàng mua" ← Nhập mua gốc (*[MÔ TẢ SAU]*). Khớp BR-PRC-001/005. |
| 2026-06-16 | 12 | Business Authority | §3.2: thêm bullet **tính lặp** (BR-PRC-017) — mã có phiếu "Nhập hàng bán bị trả lại" đơn giá=0 tham chiếu Xuất bán cùng kỳ chưa tính → GT nhập phụ thuộc giá vốn xuất → tính lặp đến khi đơn giá BQ hội tụ; nhập tay≠0 → không lặp. |
| 2026-06-16 | 13 | Business Authority | §3.2: đổi làm tròn đơn giá BQ (BR-PRC-013) — **làm tròn 2 chữ số thập phân sau khi tính** và **dùng giá trị đó tính tiền vốn** (không còn full precision). |
| 2026-06-16 | 14 | Business Authority | §3.2: đổi điều kiện tính lặp (BR-PRC-017) từ "đơn giá=0" → theo checkbox **"Tự nhập giá" KHÔNG tích**; tích (nhập tay) → không lặp. |
| 2026-07-02 | 15 | Business Authority | **Thêm Feature Flag `Inventory:InventoryV2`** vào §5.2 — gate toàn bộ API Kỳ kế toán + Tính giá. Ref BR-GF-INVENTORY §6.6 v3, CR-1782974034. |
| 2026-07-07 | 16 | Business Authority + Senior PM | **Move boundary ownership**: frontmatter `boundary` gf-inventory → **gf-accounting**. §5.2 role table refactor — thêm dòng `gf-accounting` là Boundary chính (master Kỳ + PRC); dòng `gf-inventory` giáng vai trò xuống consumer Kỳ + owner Sổ tồn SL + owner OB. Rationale: Kỳ kế toán + Tính giá xuất kho BQGQ thuộc nghiệp vụ kế toán (kho chỉ tracks số lượng, kế toán tính money/costing) — khớp pattern ERP truyền thống (SAP FI-CO, Misa, Fast, Odoo). Chỗ cross-boundary duy nhất: `gf-accounting` REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. OB + Sổ tồn giữ ở `gf-inventory`. Tên file EP + BR (BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) giữ nguyên legacy để tránh cascade break reference. |
