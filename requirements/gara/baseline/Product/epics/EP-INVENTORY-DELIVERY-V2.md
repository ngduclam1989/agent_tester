---
type: epic
artifact_kind: epic
status: PLANNED
version: 9
tier: T2
owner_authority: Business Authority
boundary: "gf-inventory"
last_reviewed: "2026-07-16"  # v9 (2026-07-16) Kill-switch matrix Flag ON row cascade từ BR-IDV2-009 v40 banner→popup rewrite — annotation cũ: v8 Gap #5 Web flag-gate model fix (cascade EP-INVENTORY-RECEIPT-V2 v12 + PKG-W05 v6) — §5.2 rows "Feature Flag" + "V1 Module Hide" + §5.3 Kill-switch matrix rewrite theo FE web RouteFlagGate wrapper same-URL pattern (menu KHÔNG đụng, cả V1 và V2 dùng chung menu entry "Phiếu xuất kho"; URL `/inventory/deliveries*` giữ nguyên legacy, KHÔNG suffix `-v2`, KHÔNG redirect chéo; component per route branch V1↔V2 theo flag). V1 legacy component MUST preserve trong repo. **KHÔNG đụng** phần BE (`@FeatureOff` public controller trả 410 Gone `ERR-INV-050`) + Mobile RemoteConfig pattern + phần data integrity + convention inheritance + cross-EP note + §1-§4 + §6 Success Metric.
supersedes: "EP-INVENTORY-DELIVERY"
feature_flag: "Inventory:InventoryV2"
target_wave: "W05"
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
| Target wave | W05 — Inventory V2 (post-baseline) |

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
- **Auto-create từ SO (system-triggered)**: SO của `gf-sales` chuyển trạng thái **lần đầu tiên** theo loại — SO **"Dịch vụ xe"** (`SERVICE`) → `"Đang thực hiện"`; SO **"Bán lẻ"** (`RETAIL`) → `"Đã xác nhận"` (canonical FEAT-SO-DETAIL AC-17) — VÀ SO có phụ tùng nguồn INVENTORY VÀ flag `Inventory:InventoryV2` bật → hệ thống auto-create phiếu Xuất **"Nháp"**, loại theo SO (`DELIVERY_REPAIR` / `DELIVERY_SALE`), nguồn xuất fix "Nền tảng". 1 SO chỉ auto-create 1 lần; partial delivery sau → user tạo tay. Workflow: `DeliveryFulfillmentWorkflow` (Temporal, giữ tên V1 — logic cập nhật theo V2). Xem BR-IDV2-032 + CB-IDV2-003.

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
| `EP-SERVICE-ORDER` | Upstream | Đối soát phiếu dịch vụ (SO) khi xuất sửa chữa (user-triggered). **Trigger auto-create**: SO chuyển trạng thái theo loại (SERVICE → "Đang thực hiện"; RETAIL → "Đã xác nhận") lần đầu → hệ thống auto-create phiếu Xuất Nháp (BR-IDV2-032, CB-IDV2-003 event Kafka + Temporal `DeliveryFulfillmentWorkflow`). |
| `EP-INVENTORY-STOCK-V2` | Downstream | Phiếu xuất ghi sổ = biến động −tồn cho báo cáo tồn/NXT. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: phiếu xuất kho, ghi sổ/bỏ ghi sổ, trừ tồn, check tồn khả dụng, lock kỳ. |
| `agg-garage-graph` | BFF layer. |
| `gf-sales` | Cung cấp phiếu dịch vụ (SO) để đối soát + phát event Kafka khi SO chuyển trạng thái phù hợp để trigger auto-create phiếu Xuất V2 khi flag `Inventory:InventoryV2` bật. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Phiếu xuất kho V2 được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403. **FE web**: menu top-nav + URL giữ nguyên (dùng chung cho V1 lẫn V2), route wrap bởi `RouteFlagGate` component branch theo flag — flag ON render V2 component (mới W05), flag OFF render V1 legacy component (giữ nguyên trong repo) — xem §5.3 chi tiết. Mobile: RemoteConfig gate theo pattern hiện tại. |
| **V1 Module Hide** | Khi flag `Inventory:InventoryV2` = **ON** → BE V1 public controller (`InventoryDeliveryController` V1 endpoints tại `/api/v*/deliveries/*`) thêm `@FeatureOff("Inventory:InventoryV2")` → trả **`410 Gone`** với mã lỗi **`ERR-INV-050`** ("V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"). **FE web**: menu top-nav "Phiếu xuất kho" **KHÔNG bị ẩn** — cùng menu entry hoạt động cho cả V1 lẫn V2 (URL không đổi); RouteFlagGate wrapper chọn V2 component render khi flag ON, V1 legacy component render khi flag OFF. Mobile giữ pattern hiện tại. V1 data tables **KHÔNG delete** (giữ audit + rollback). Rollback flag OFF → BE V1 restore, BE V2 403; FE web click menu → V1 legacy component render (đối xứng, không cần đổi menu/URL). |

### 5.3 Feature Flag — Convention & Kill-switch Matrix

**Convention flag inheritance**: Feature flag `Inventory:InventoryV2` được **declare 1 lần ở EP frontmatter** (`feature_flag: "Inventory:InventoryV2"`). Toàn bộ 7 FEAT con (LIST/CREATE/DETAIL/EDIT V2 + DELETE/PRINT/EXPORT) **kế thừa flag từ EP** — KHÔNG cần declare `feature_flag:` per-FEAT. Rationale: 1 flag chung cho cả subsystem Nhập kho V2 + Xuất kho V2 (bật/tắt đồng bộ); tránh drift 14 chỗ khai báo.

**Kill-switch matrix** (per-tenant, không có global kill-switch):

**FE web pattern**: `RouteFlagGate` wrapper component per route đọc runtime `Inventory:InventoryV2` → flag ON render V2 component (W05 mới), flag OFF render V1 legacy component (giữ nguyên trong repo `frontend/gf-gms-web`, KHÔNG xóa). Menu sidebar `constants.ts` **KHÔNG đụng** — menu entry V1 hiện hành ("Phiếu xuất kho") reuse cho cả V1 và V2. URL `/inventory/deliveries*` **giữ nguyên legacy** — KHÔNG thêm suffix `-v2`, KHÔNG redirect chéo.

| Flag state | BE V2 API | BE V1 public API | FE web behavior (menu + URL giữ nguyên) | Fallback |
|---|---|---|---|---|
| **Flag ON** (tenant enabled) | ✅ Active | ❌ `@FeatureOff` → 410 Gone `ERR-INV-050` | Menu "Phiếu xuất kho" **VẪN HIỆN** → click → `RouteFlagGate` render **V2 component** (shared slip-form + inherit flows + reconciliation popup tại state transition Nháp→Ghi sổ per BR-IDV2-009 v40 + Ghi sổ/Bỏ ghi sổ + cost render "—") | User dùng V2 mới; V1 API không callable từ FE (chỉ Protected worker exempt) |
| **Flag OFF** (tenant chưa enable / rollback) | ❌ 403 Forbidden | ✅ Active | Menu "Phiếu xuất kho" **VẪN HIỆN** → click → `RouteFlagGate` render **V1 legacy component** (list/create/detail/edit cũ trước W05) | User dùng V1 như trước — no data loss (V2 data tables giữ nguyên chờ re-enable); menu + URL không đổi |

**Kill-switch trigger** (rollback từ ON → OFF): Ops team disable flag qua Feature Flag Service (per-tenant). Effect tức thời (< 1 phút cache propagation) — không cần re-deploy. FE re-render lại theo flag mới (RouteFlagGate re-evaluate) — user không cần logout/login.

**Data integrity khi rollback**: V2 phiếu đã ghi sổ vẫn giữ trong `inventory_delivery_v2` tables; khi user re-enable flag sau này, data hiện lại nguyên vẹn. V1 phiếu tạo trong thời gian OFF không migrate sang V2 (2 hệ thống độc lập). **V1 legacy component MUST preserve trong repo `frontend/gf-gms-web`** — không xóa, không sửa; RouteFlagGate cần cả 2 flavor để branch runtime. **Cross-EP note**: `Inventory:InventoryV2` bật/tắt đồng thời cả Nhập + Xuất — không thể bật riêng phần Nhập mà tắt phần Xuất (vì BQGQ + tồn kho liên thông 2 module).

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
| 2026-07-13 | 4 | Business Authority | **Bổ sung mô tả auto-create phiếu Xuất từ SO trong scope V2** (cascade BR-IDV2-032 + CB-IDV2-003, đối xứng EP-INVENTORY-RECEIPT-V2 v8 phía Nhập): §3 Ghi chú thêm bullet "Auto-create system-triggered" (SO SERVICE → "Đang thực hiện" / SO RETAIL → "Đã xác nhận" lần đầu → phiếu Nháp `DELIVERY_REPAIR` hoặc `DELIVERY_SALE`; nguồn xuất fix "Nền tảng"; 1 SO 1 lần; workflow `DeliveryFulfillmentWorkflow` Temporal giữ tên V1). §5.1 EP-SERVICE-ORDER đổi Liên quan → **Upstream** + thêm trigger note. §5.2 gf-sales cập nhật thêm event trigger. Đóng gap V1→V2: V1 fix nguồn "Nền tảng" + trạng thái "Chờ duyệt"; V2 hard cutover khi flag `Inventory:InventoryV2` bật. V1 EP-INVENTORY-DELIVERY line 76 note stale (nói "Hoàn thành" — canonical Q0 chốt là AC-17 pattern 2 nhánh). |
| 2026-07-13 | 5 | Business Authority (BA in-session review W05 chuẩn bị) | **§5.2 thêm row "V1 Module Hide"** (cascade ERROR-CODE-REGISTRY v18 — `ERR-INV-050`, đồng bộ EP-INVENTORY-RECEIPT-V2 v9). Khi flag `Inventory:InventoryV2` = ON → tab "Phiếu xuất kho" V1 (module cũ) bị ẩn ở FE web + Mobile; BE V1 controller `@FeatureOff("Inventory:InventoryV2")` trả 410 Gone `ERR-INV-050`. V1 data KHÔNG delete (audit + rollback). Rollback flag OFF → V1 restore, V2 hidden đối xứng. Đóng gap: trước đây flag chỉ enable V2 nhưng không note V1 bị ẩn — DEV có thể để V1 hoạt động song song → data drift risk. |
| 2026-07-14 | 6 | Business Authority | **Structured feature flag + Kill-switch matrix explicit** (BA-review 2026-07-14 C8.1 + C8.2 + C10.1 unblock, đối xứng EP-INVENTORY-RECEIPT-V2 v10). (a) Frontmatter thêm `feature_flag: "Inventory:InventoryV2"` + `target_wave: "W05"` (structured, scriptable). (b) §5.3 mới "Feature Flag — Convention & Kill-switch Matrix" gồm: (i) convention "flag ở EP, 7 FEAT con inherit"; (ii) kill-switch matrix 2 hàng × 5 cột (pattern "Menu ẩn + Route fallback V1"); (iii) note cross-EP: `Inventory:InventoryV2` bật/tắt đồng thời Nhập + Xuất (do BQGQ + tồn liên thông 2 module — không thể bật riêng). |
| 2026-07-15 | 7 | BA | **Body Metadata sync frontmatter W05** (BA-review 2026-07-15 F-DELTA-1 P2, đối xứng EP-INVENTORY-RECEIPT-V2 v11). Sửa Metadata table dòng "Target wave" từ `TBD — Inventory V2 (post-baseline)` → `W05 — Inventory V2 (post-baseline)` cho khớp frontmatter `target_wave: "W05"` (v6 đã fix). Không đụng nội dung nghiệp vụ. |
| 2026-07-15 | 8 | user bachho (Delivery Authority) + main agent (Business Authority scope FE web pattern) | **§5.2 "Feature Flag" + "V1 Module Hide" rows + §5.3 Kill-switch Matrix — Gap #5 Web flag-gate model fix (RouteFlagGate wrapper same-URL, menu KHÔNG đụng)** — cascade EP-INVENTORY-RECEIPT-V2 v12 (symmetric) + PKG-W05 v6. User bachho verify thực tế: menu web KHÔNG đụng đến, cả V1 và V2 dùng chung menu entry "Phiếu xuất kho" (từ V1 baseline), URL `/inventory/deliveries*` giữ nguyên legacy (KHÔNG suffix `-v2`, KHÔNG redirect chéo). Model chuyển từ "Menu-level toggle" (2 menu V1/V2 riêng, ẩn/hiện đối xứng) → "Route-level branch" (1 menu chung, component đằng sau URL branch theo flag qua `RouteFlagGate` wrapper). §5.2 "Feature Flag" row: bỏ statement "Web/Mobile ẩn menu/route"; thêm mô tả RouteFlagGate wrapper pattern. §5.2 "V1 Module Hide" row: bỏ statement "tab V1 bị ẩn ở FE web (menu top-nav)"; thêm statement menu KHÔNG bị ẩn + RouteFlagGate render V1 legacy khi OFF. §5.3 Kill-switch Matrix: rewrite matrix từ 5 cột (V2 API · V2 UI · V1 API · V1 UI · Fallback) → 4 cột (BE V2 API · BE V1 public API · FE web behavior · Fallback) + prose block "FE web pattern" mô tả RouteFlagGate + menu constants.ts giữ nguyên + V1 legacy component MUST preserve. Kill-switch trigger + Data integrity + Cross-EP note giữ nguyên semantic (cross-EP note vẫn valid: bật/tắt đồng thời Nhập + Xuất). Root cause: v5 (2026-07-13) đưa "V1 Module Hide → ẩn menu FE web" theo giả định menu-level toggle mà không verify implementation reality. **KHÔNG đụng**: phần BE (`@FeatureOff` public controller trả 410 Gone `ERR-INV-050`) + Mobile RemoteConfig pattern + convention inheritance + data integrity semantic + cross-EP note + §1-§4 + §6 Success Metric + §7 previous change log entries. Cascade EP-INVENTORY-RECEIPT-V2 v12 (main) + PKG-W05 v6. |
| 2026-07-16 | 9 | Business Authority | **§5.3 Kill-switch Matrix Flag ON row cascade từ BR-IDV2-009 v40 rewrite banner→popup** — dòng V2 component description trước đây liệt kê "reconciliation banner" (banner đối soát SO persistent). Sau BR-IDV2-009 v40 rewrite: banner đã BỎ HOÀN TOÀN → thay bằng **popup logic tại state transition Nháp→Ghi sổ**. Update dòng: "reconciliation banner" → "reconciliation popup tại state transition Nháp→Ghi sổ per BR-IDV2-009 v40". Root cause: kill-switch table copy pattern banner cũ, không cascade khi BR rewrite. KHÔNG đụng phần khác của kill-switch matrix. |
