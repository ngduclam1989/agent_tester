---
type: epic
artifact_kind: epic
status: PLANNED
version: 13
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-16"  # v13 (2026-07-16) Kill-switch matrix Flag ON row cascade từ cross-slip inheritance ADR-024 D1 — annotation cũ: v12 Gap #5 Web flag-gate model fix (cascade PKG-W05 v6) — §5.2 rows "Feature Flag" + "V1 Module Hide" + §5.3 Kill-switch matrix rewrite theo FE web RouteFlagGate wrapper same-URL pattern (menu KHÔNG đụng, cả V1 và V2 dùng chung menu entry "Phiếu nhập kho"; URL `/inventory/receipts*` giữ nguyên legacy, KHÔNG suffix `-v2`, KHÔNG redirect chéo; component per route branch V1↔V2 theo flag). V1 legacy component MUST preserve trong repo. **KHÔNG đụng** phần BE (`@FeatureOff` public controller trả 410 Gone `ERR-INV-050`) + Mobile RemoteConfig pattern + phần data integrity + convention inheritance + §1-§4 + §6 Success Metric.
supersedes: "EP-INVENTORY-RECEIPT"
feature_flag: "Inventory:InventoryV2"
target_wave: "W05"
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
| Target wave | W05 — Inventory V2 (post-baseline) |

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
- Nguồn nhập (Mua ngoài / Nền tảng — kế thừa V1) + Loại phiếu (Nhập mua = `RECEIPT_PURCHASE` / Nhập hàng bán bị trả lại = `RECEIPT_SALE_RETURN` / Nhập khác = `RECEIPT_OTHER` — mã enum backend, lock BR-IRV2-009) là 2 trường riêng. PO không bắt buộc. Đối tượng đổ theo loại phiếu (Nhập mua→NCC; Nhập hàng bán bị trả lại→Khách hàng; Nhập khác→tất cả).
- **Auto-create từ PO (system-triggered)**: PO của `gf-purchase` chuyển trạng thái **"Đang giao hàng"** lần đầu → hệ thống auto-create phiếu Nhập **"Nháp"** loại `RECEIPT_PURCHASE`, nguồn kế thừa `PO.Nguồn đơn` (áp cả 2 source PO `DIRECT` + `QUOTATION_ASK` khi flag `Inventory:InventoryV2` bật). 1 PO chỉ auto-create 1 lần; partial delivery sau → user tạo tay. Xem BR-IRV2-033 + CB-IRV2-003.

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
| `EP-PROCUREMENT` | Upstream | Phiếu nhập có thể kế thừa dữ liệu từ đơn hàng mua (PO) — không bắt buộc (user-triggered). **Trigger auto-create**: PO chuyển "Đang giao hàng" lần đầu → hệ thống auto-create phiếu Nháp (BR-IRV2-033, CB-IRV2-003 event Kafka). |
| `EP-INVENTORY-OPENING-BALANCE` | Liên quan | Cùng đóng góp tồn (mã+kho+gara). |
| `EP-INVENTORY-STOCK-V2` | Downstream | Phiếu nhập đã ghi sổ là biến động +tồn cho báo cáo tồn/NXT. |
| `EP-INVENTORY-ACCOUNTING-PERIOD` (PRC) | Downstream | Giá trị nhập trong kỳ là đầu vào công thức BQGQ. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: phiếu nhập kho, ghi sổ/bỏ ghi sổ, cập nhật tồn theo (mã+kho+gara), chặn tồn âm, lock kỳ. |
| `agg-garage-graph` | BFF layer. |
| `gf-purchase` | Cung cấp dữ liệu đơn hàng mua (PO) khi phiếu liên kết + phát event `PurchaseOrderStatusChanged` (Kafka) để trigger auto-create phiếu Nhập V2 khi flag `Inventory:InventoryV2` bật. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Phiếu nhập kho V2 được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403. **FE web**: menu top-nav + URL giữ nguyên (dùng chung cho V1 lẫn V2), route wrap bởi `RouteFlagGate` component branch theo flag — flag ON render V2 component (mới W05), flag OFF render V1 legacy component (giữ nguyên trong repo) — xem §5.3 chi tiết. Mobile: RemoteConfig gate theo pattern hiện tại. |
| **V1 Module Hide** | Khi flag `Inventory:InventoryV2` = **ON** → BE V1 public controller (`InventoryReceiptController` V1 endpoints tại `/api/v*/receipts/*`) thêm `@FeatureOff("Inventory:InventoryV2")` → trả **`410 Gone`** với mã lỗi **`ERR-INV-050`** ("V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"). **FE web**: menu top-nav "Phiếu nhập kho" **KHÔNG bị ẩn** — cùng menu entry hoạt động cho cả V1 lẫn V2 (URL không đổi); RouteFlagGate wrapper chọn V2 component render khi flag ON, V1 legacy component render khi flag OFF. Mobile giữ pattern hiện tại. V1 data tables **KHÔNG delete** (giữ audit + rollback). Rollback flag OFF → BE V1 restore, BE V2 403; FE web click menu → V1 legacy component render (đối xứng, không cần đổi menu/URL). |

### 5.3 Feature Flag — Convention & Kill-switch Matrix

**Convention flag inheritance**: Feature flag `Inventory:InventoryV2` được **declare 1 lần ở EP frontmatter** (`feature_flag: "Inventory:InventoryV2"`). Toàn bộ 7 FEAT con (LIST/CREATE/DETAIL/EDIT V2 + DELETE/PRINT/EXPORT) **kế thừa flag từ EP** — KHÔNG cần declare `feature_flag:` per-FEAT. Rationale: 1 flag cho cả subsystem Nhập kho V2 (bật/tắt đồng bộ); tránh drift 7 FEAT × 2 EP = 14 chỗ khai báo.

**Kill-switch matrix** (per-tenant, không có global kill-switch):

**FE web pattern**: `RouteFlagGate` wrapper component per route đọc runtime `Inventory:InventoryV2` → flag ON render V2 component (W05 mới), flag OFF render V1 legacy component (giữ nguyên trong repo `frontend/gf-gms-web`, KHÔNG xóa). Menu sidebar `constants.ts` **KHÔNG đụng** — 2 menu entry V1 hiện hành ("Phiếu nhập kho") reuse cho cả V1 và V2. URL `/inventory/receipts*` **giữ nguyên legacy** — KHÔNG thêm suffix `-v2`, KHÔNG redirect chéo.

| Flag state | BE V2 API | BE V1 public API | FE web behavior (menu + URL giữ nguyên) | Fallback |
|---|---|---|---|---|
| **Flag ON** (tenant enabled) | ✅ Active | ❌ `@FeatureOff` → 410 Gone `ERR-INV-050` | Menu "Phiếu nhập kho" **VẪN HIỆN** → click → `RouteFlagGate` render **V2 component** (shared slip-form + cross-slip inheritance từ phiếu Xuất bán gốc cho RECEIPT_SALE_RETURN per ADR-024 D1 + Ghi sổ/Bỏ ghi sổ) | User dùng V2 mới; V1 API không callable từ FE (chỉ Protected worker exempt) |
| **Flag OFF** (tenant chưa enable / rollback) | ❌ 403 Forbidden | ✅ Active | Menu "Phiếu nhập kho" **VẪN HIỆN** → click → `RouteFlagGate` render **V1 legacy component** (list/create/detail/edit cũ trước W05) | User dùng V1 như trước — no data loss (V2 data tables giữ nguyên chờ re-enable); menu + URL không đổi |

**Kill-switch trigger** (rollback từ ON → OFF): Ops team disable flag qua Feature Flag Service (per-tenant). Effect tức thời (< 1 phút cache propagation) — không cần re-deploy. FE re-render lại theo flag mới (RouteFlagGate re-evaluate) — user không cần logout/login.

**Data integrity khi rollback**: V2 phiếu đã ghi sổ vẫn giữ trong `inventory_receipt_v2` tables; khi user re-enable flag sau này, data hiện lại nguyên vẹn. V1 phiếu tạo trong thời gian OFF không migrate sang V2 (2 hệ thống độc lập). **V1 legacy component MUST preserve trong repo `frontend/gf-gms-web`** — không xóa, không sửa; RouteFlagGate cần cả 2 flavor để branch runtime.

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
| 2026-07-13 | 7 | Business Authority (BA in-session review W05 chuẩn bị) | **§3 note enum Loại phiếu Nhập thêm mã backend** (Option A prefix `RECEIPT_*`, cascade BR-IRV2-009 v28): `RECEIPT_PURCHASE` (Nhập mua) / `RECEIPT_SALE_RETURN` (Nhập hàng bán bị trả lại) / `RECEIPT_OTHER` (Nhập khác). Label VN chỉ dùng UI; mọi filter/API/DB/event/log dùng mã enum. Nguồn nhập (Mua ngoài / Nền tảng) note "kế thừa V1" — KHÔNG đặt mã V2 (BA quyết giữ enum V1 legacy, DEV lookup source V1). |
| 2026-07-13 | 8 | Business Authority | **Bổ sung mô tả auto-create phiếu Nhập từ PO trong scope V2** (cascade BR-IRV2-033 + CB-IRV2-003): §3 Ghi chú thêm bullet "Auto-create system-triggered" (PO chuyển "Đang giao hàng" lần đầu → phiếu Nháp `RECEIPT_PURCHASE`, nguồn kế thừa `PO.Nguồn đơn`, áp cả 2 source PO khi flag bật, 1 PO 1 lần). §5.1 EP-PROCUREMENT + §5.2 gf-purchase cập nhật thêm event trigger `PurchaseOrderStatusChanged` (Kafka). Đóng gap V1→V2: V1 fix nguồn "Nền tảng" + trạng thái "Chờ duyệt" + chỉ source `DIRECT`; V2 hard cutover khi flag `Inventory:InventoryV2` bật. |
| 2026-07-13 | 9 | Business Authority (BA in-session review W05 chuẩn bị) | **§5.2 thêm row "V1 Module Hide"** (cascade ERROR-CODE-REGISTRY v18 — `ERR-INV-050`). Khi flag `Inventory:InventoryV2` = ON → tab "Phiếu nhập kho" V1 (module cũ) bị ẩn ở FE web + Mobile; BE V1 controller `@FeatureOff("Inventory:InventoryV2")` trả 410 Gone `ERR-INV-050`. V1 data KHÔNG delete (giữ audit + rollback). Rollback flag OFF → V1 restore, V2 hidden đối xứng. Đóng gap: trước đây flag chỉ enable V2 (`@FeatureOn`) nhưng không note V1 bị ẩn — DEV có thể để V1 hoạt động song song → data drift risk (phiếu tạo qua V1 không vào sổ tồn V2). |
| 2026-07-14 | 10 | Business Authority | **Structured feature flag + Kill-switch matrix explicit** (BA-review 2026-07-14 C8.1 + C8.2 + C10.1 unblock). (a) Frontmatter thêm `feature_flag: "Inventory:InventoryV2"` + `target_wave: "W05"` (structured, scriptable — thay cho declare-only-in-body prose). (b) §5.3 mới "Feature Flag — Convention & Kill-switch Matrix" gồm: (i) convention "flag ở EP, 7 FEAT con inherit — không cần declare per-FEAT" (đóng gap C8.1 finding sai scope FEAT); (ii) kill-switch matrix 2 hàng (Flag ON/OFF) × 5 cột (V2 API · V2 UI · V1 API · V1 UI · Fallback) — pattern user chọn "Menu ẩn + Route fallback về V1" (đóng gap C8.2); (iii) note data integrity khi rollback (V2 tables preserved). |
| 2026-07-15 | 11 | BA | **Body Metadata sync frontmatter W05** (BA-review 2026-07-15 F-DELTA-1 P2). Sửa Metadata table dòng "Target wave" từ `TBD — Inventory V2 (post-baseline)` → `W05 — Inventory V2 (post-baseline)` cho khớp frontmatter `target_wave: "W05"` (v10 đã fix). Human-readable body doc coherent với machine-readable frontmatter; script + reader không mâu thuẫn nữa. Không đụng nội dung nghiệp vụ. |
| 2026-07-15 | 12 | user bachho (Delivery Authority) + main agent (Business Authority scope FE web pattern) | **§5.2 "Feature Flag" + "V1 Module Hide" rows + §5.3 Kill-switch Matrix — Gap #5 Web flag-gate model fix (RouteFlagGate wrapper same-URL, menu KHÔNG đụng)** — cascade PKG-W05 v6. User bachho verify thực tế: menu web KHÔNG đụng đến, cả V1 và V2 dùng chung menu entry "Phiếu nhập kho" (từ V1 baseline), URL `/inventory/receipts*` giữ nguyên legacy (KHÔNG suffix `-v2`, KHÔNG redirect chéo). Model chuyển từ "Menu-level toggle" (2 menu V1/V2 riêng, ẩn/hiện đối xứng) → "Route-level branch" (1 menu chung, component đằng sau URL branch theo flag qua `RouteFlagGate` wrapper). §5.2 "Feature Flag" row: bỏ statement "Web/Mobile ẩn menu/route"; thêm mô tả RouteFlagGate wrapper pattern. §5.2 "V1 Module Hide" row: bỏ statement "tab V1 bị ẩn ở FE web (menu top-nav)"; thêm statement menu KHÔNG bị ẩn + RouteFlagGate render V1 legacy khi OFF. §5.3 Kill-switch Matrix: rewrite matrix từ 5 cột (V2 API · V2 UI · V1 API · V1 UI · Fallback) → 4 cột (BE V2 API · BE V1 public API · FE web behavior · Fallback) + prose block "FE web pattern" mô tả RouteFlagGate + menu constants.ts giữ nguyên + V1 legacy component MUST preserve. Kill-switch trigger + Data integrity blocks giữ nguyên semantic, thêm note RouteFlagGate re-evaluate runtime. Root cause pattern lỗi: v9 (2026-07-13) đưa "V1 Module Hide → ẩn menu FE web" theo giả định menu-level toggle mà không verify implementation reality. **KHÔNG đụng**: phần BE (`@FeatureOff` public controller trả 410 Gone `ERR-INV-050`) + Mobile RemoteConfig pattern + convention inheritance + data integrity semantic + §1-§4 + §6 Success Metric + §7 previous change log entries. Cascade EP-INVENTORY-DELIVERY-V2 v7→v8 symmetric + PKG-W05 v6 (main). |
| 2026-07-16 | 13 | Business Authority | **§5.3 Kill-switch Matrix Flag ON row copy-paste drift fix** — dòng V2 component description trước đây liệt kê "reconciliation banner" NHƯNG Receipt V2 KHÔNG có SO reconciliation concept (chỉ Delivery mới có, per BR-IDV2-009). Receipt V2 concept thật là **cross-slip inheritance** từ phiếu Xuất bán gốc cho `RECEIPT_SALE_RETURN` (Nhập hàng bán bị trả lại) per ADR-024 D1. Update dòng: "reconciliation banner" → "cross-slip inheritance từ phiếu Xuất bán gốc cho RECEIPT_SALE_RETURN per ADR-024 D1". Root cause: kill-switch table copy pattern từ EP-INVENTORY-DELIVERY-V2 nhưng không adapt concept per Receipt semantic — cascade lỗi copy-paste khi symmetric-ify 2 EP. KHÔNG đụng phần khác của kill-switch matrix. |
