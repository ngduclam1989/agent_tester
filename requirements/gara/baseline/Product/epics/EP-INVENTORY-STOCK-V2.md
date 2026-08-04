---
type: epic
artifact_kind: epic
status: PLANNED
version: 10
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-31"
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
| Target wave | **W06** (3 FEAT: `FEAT-STK-LIST-V2` · `FEAT-IP-VIEW-V2` · `FEAT-STK-DETAIL-V2` — đang thực hiện per `PKG-W06-inventory-pricing-stock-report.md`) |

> **Phạm vi V2 / forward design**: V2 của `EP-INVENTORY-STOCK` (bản gốc giữ baseline). Gom **2 báo cáo**: Báo cáo tồn kho (V2 của STOCK) + Báo cáo NXT (`FEAT-IP-VIEW` dời từ `EP-INVENTORY-PERIOD` cũ sang) + thẻ kho. **Chỉ 3 feature mới**; file V1 cũ (LIST/DETAIL/ADJUST/PRICE) giữ nguyên, không đụng, không link. **V2 KHÔNG có điều chỉnh tồn (ADJUST)**. Nền tảng cơ chế lưu tồn (sổ tồn): `BR-GF-INVENTORY-STOCK-V2`.
>
> **Platform scope W06:** Web GMS triển khai đủ 3 feature. App Garage W06 chỉ triển khai `FEAT-STK-LIST-V2` (view-only) và đi vào từ tile **"Tồn kho"** của `FEAT-INV-MOBILE-MENU`; mobile không triển khai `FEAT-IP-VIEW-V2` / `FEAT-STK-DETAIL-V2` trong W06.

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
             └─ Thẻ kho full-page     = đọc chi tiết phiếu nhập/xuất (running, per-phiếu)
```

**Ghi chú:**
- **SL tồn**: realtime (lưu sẵn theo sổ tồn). **Giá trị tồn**: theo BQGQ — luôn là **số** (= GT tồn đầu + GT nhập − giá vốn xuất; giá vốn xuất = 0 nếu chưa chạy BQGQ). **Không dùng chữ "Tạm tính"** trong ô.
- **Sổ tồn ghi nhận cả biến động ngày (SL/GT nhập + xuất) + tồn cuối ngày** — Báo cáo tồn-đến-ngày và Báo cáo NXT đọc **CÙNG 1 nguồn (sổ tồn)** để đảm bảo nhất quán, không lệch số giữa 2 báo cáo tại cùng mốc ngày.
- **Thẻ kho** mở từ link **"Xem lịch sử"** trên báo cáo tồn và chuyển sang **màn full-page** (không phải popup); vẫn đọc chi tiết phiếu nhập/xuất (per-phiếu granularity, running balance) — đầu kỳ tra sổ tồn.
- **OB lưu trong bảng tồn đầu kỳ** (source riêng, không nằm trong sổ tồn). Sổ tồn là **projection** — engine tính lại từ (bảng OB + phiếu detail). Xóa/sửa OB (`FEAT-OB-DELETE-LINES` / `FEAT-OB-EDIT`) → thao tác ở bảng OB → engine tính lại sổ tồn.
- Báo cáo theo **(mã + kho + gara)** — tách dòng theo kho (1 mã ở nhiều kho → nhiều dòng). Không filter Garage (theo login).
- V2 **không có điều chỉnh tồn**: mọi biến động qua phiếu nhập/xuất + import tồn đầu.
- Empty state dùng thống nhất text **"Không có dữ liệu"** cho Báo cáo tồn, NXT và bảng thẻ kho khi filter không có dòng phù hợp.

## 4. Features

| FEAT ID | Title | Link | Loại | Priority |
|---|---|---|---|---|
| `FEAT-STK-LIST-V2` | Báo cáo tồn kho đến ngày | [FEAT-STK-LIST-V2](../features/FEAT-STK-LIST-V2.md) | V2 | P1 |
| `FEAT-IP-VIEW-V2` | Báo cáo Nhập Xuất Tồn (NXT) | [FEAT-IP-VIEW-V2](../features/FEAT-IP-VIEW-V2.md) | V2 (dời từ EP-PERIOD) | P1 |
| `FEAT-STK-DETAIL-V2` | Xem lịch sử tồn kho (thẻ kho) | [FEAT-STK-DETAIL-V2](../features/FEAT-STK-DETAIL-V2.md) | V2 | P1 |

> File V1 cũ (`FEAT-STK-LIST`, `FEAT-STK-DETAIL`, `FEAT-STK-ADJUST`, `FEAT-STK-PRICE`, `FEAT-IP-VIEW`) giữ nguyên baseline — không sửa, không link vào epic V2.

### 4.1 Platform Scope (W06)

| Platform | Scope W06 | Entry / Navigation |
|---|---|---|
| **Web GMS** | Đầy đủ 3 feature: `FEAT-STK-LIST-V2`, `FEAT-IP-VIEW-V2`, `FEAT-STK-DETAIL-V2`. | Top-nav **"Tồn kho"** + sub-tabs **"Báo cáo tồn kho"**, **"Báo cáo NXT"**; link **"Xem lịch sử"** từ báo cáo tồn mở thẻ kho full-page. |
| **App Garage** | Chỉ `FEAT-STK-LIST-V2` trong W06. Không expose NXT, không expose thẻ kho, không render action **"Xem lịch sử"**. | Home mission tile **"Quản lý kho hàng"** → hub `FEAT-INV-MOBILE-MENU` → tile **"Tồn kho"** → màn **Báo cáo tồn kho đến ngày**. |

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
| **V1 Module Hide** | Khi flag `Inventory:InventoryV2` = **ON** → V1 bị ẩn theo platform. **Web GMS**: ẩn 2 tab V1 trong menu top-nav — (a) **"Tồn kho"** V1 (module cũ FEAT-STK-LIST + FEAT-STK-DETAIL + FEAT-STK-ADJUST + FEAT-STK-PRICE) thay bởi `FEAT-STK-LIST-V2` + `FEAT-STK-DETAIL-V2`; (b) **"Tồn kho theo kỳ"** V1 thay bởi `FEAT-IP-VIEW-V2`. **App Garage W06**: nếu có tile/route V1 thì ẩn; hub chỉ hiện tile **"Tồn kho"** dẫn vào `FEAT-STK-LIST-V2` (không NXT/thẻ kho). BE V1 controllers thực tế chỉ có **2** class (không phải 3 — sửa GAP-W06-GI-03 2026-07-31): `InventoryStockController` (bao gồm cả logic điều chỉnh tồn — action Adjust nằm chung class này qua `AdjustStockRequest`, KHÔNG tách class riêng `InventoryStockAdjustmentController` như bản trước đây mô tả) + `InventoryPeriodStockController` (tên đúng — KHÔNG phải `InventoryPeriodController`). Cả 2 class đã có sẵn `@FeatureOn(FeatureFlags.INVENTORY_STOCK)` ở class-level (và lặp lại ở từng method) — cascade W06 thêm `@FeatureOff("Inventory:InventoryV2")` phải **kết hợp với gate cũ**: `INVENTORY_STOCK` vẫn phải ON (module V1 tổng vẫn bật) nhưng `Inventory:InventoryV2` cũng ON thì method trả 410 (ưu tiên: check `InventoryV2` trước — nếu ON → 410 `ERR-INV-050` ngay, không cần check `INVENTORY_STOCK`; nếu `InventoryV2` OFF → fallback check `INVENTORY_STOCK` như hiện tại). Thêm `@FeatureOff("Inventory:InventoryV2")` → trả **`410 Gone`** với mã lỗi **`ERR-INV-050`** ("V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"). V1 data tables **KHÔNG delete** (giữ audit + rollback). Rollback flag OFF → V1 restore, V2 hidden (đối xứng). |

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
| 2026-07-13 | 6 | Business Authority (BA in-session review W05 chuẩn bị) | **§5.2 thêm row "V1 Module Hide"** (cascade ERROR-CODE-REGISTRY v18 — `ERR-INV-050`, đồng bộ EP-INVENTORY-RECEIPT-V2 v9 + EP-INVENTORY-DELIVERY-V2 v5). Khi flag `Inventory:InventoryV2` = ON → **2 tab V1 bị ẩn** ở FE web + Mobile: (a) "Tồn kho" V1 (STK-LIST/DETAIL/ADJUST/PRICE V1) — thay bởi STK-LIST-V2 + STK-DETAIL-V2; (b) "Tồn kho theo kỳ" V1 (FEAT-IP-VIEW từ EP-INVENTORY-PERIOD cũ) — thay bởi FEAT-IP-VIEW-V2 (đã dời sang STOCK-V2). BE V1 controllers `@FeatureOff("Inventory:InventoryV2")` trả 410 Gone `ERR-INV-050`. V1 data KHÔNG delete (audit + rollback). Rollback flag OFF → V1 restore, V2 hidden đối xứng. STOCK-V2 gộp 2 module V1 (khác RECEIPT/DELIVERY-V2 chỉ ẩn 1 module) → row này liệt kê 2 tab. Đóng gap: trước đây flag chỉ enable V2 nhưng không note V1 bị ẩn — DEV có thể để V1 hoạt động song song → data drift risk. |
| 2026-07-21 | 7 | Business Authority (user directive) | **Sync W06 Product drift với FEAT-STK-* latest**: Thẻ kho mở **full-page** từ "Xem lịch sử"; thêm note empty state **"Không có dữ liệu"**; mirror UX-FLOW v7 sau các thay đổi 2026-07-20 của `FEAT-STK-LIST-V2`, `FEAT-IP-VIEW-V2`, `FEAT-STK-DETAIL-V2`. |
| 2026-07-21 | 8 | Business Authority (user directive) | **Làm rõ mobile scope Stock V2 W06** — Web GMS đủ 3 feature; App Garage chỉ `FEAT-STK-LIST-V2` qua tile **"Tồn kho"** trong `FEAT-INV-MOBILE-MENU`; mobile không triển khai NXT/thẻ kho và không có action "Xem lịch sử". |
| 2026-07-31 | 9 | Business Authority (user directive, `/warm-up gf-inventory` W06 Phase A GAP-W06-GI-03) | **§5.2 V1 Module Hide: sửa tên controller sai** — bản v6/v8 liệt kê 3 V1 controller (`InventoryStockController` + `InventoryStockAdjustmentController` + `InventoryPeriodController`) nhưng code thật chỉ có **2** class: `InventoryStockController` (logic điều chỉnh tồn nằm chung, không tách class riêng) + `InventoryPeriodStockController` (tên đúng, khác `InventoryPeriodController`). Bổ sung ghi chú thứ tự ưu tiên gate: `Inventory:InventoryV2` ON → 410 ngay (không cần check `INVENTORY_STOCK`); OFF → fallback check `INVENTORY_STOCK` như hiện tại. Không đổi hành vi nghiệp vụ (410 + `ERR-INV-050` + V1 data giữ nguyên vẫn đúng) — chỉ sửa tên class cho khớp code, để REVIEW gate (`PKG-W06 §4.2`) grep đúng. v8 → v9. |
| 2026-07-31 | 10 | Business Authority (user directive, `/warm-up gf-inventory` W06 Phase A GAP-W06-GI-10) | **§Metadata "Target wave": xóa `TBD` doc-hygiene stale** — đổi từ `TBD — Inventory V2 (post-baseline)` sang `**W06**` (3 FEAT đang thực hiện per `PKG-W06-inventory-pricing-stock-report.md`). Wave đã chốt từ lâu (PKG-W06 v6, `STATE.json`, `Plan/WAVE-SEQUENCE.md`) — dòng TBD chỉ chưa được cập nhật theo. Pure doc-hygiene, không đổi scope/behavior. v9 → v10. |
