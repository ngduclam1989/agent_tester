---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W06"
last_reviewed: "2026-07-31"
source_ref: "Product/epics/EP-INVENTORY-STOCK-V2.md"
source_version: 10
source_sha: "5c14944ba36614033715a6de26112e9bb7fcc222b994f70db8f002ddba105c57"  # backfilled by orchestrator 2026-07-31 (author session had no Bash tool)
generated_at: "2026-07-31T00:00:00+00:00"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
features_in_wave:
  - FEAT-STK-LIST-V2
  - FEAT-IP-VIEW-V2
  - FEAT-STK-DETAIL-V2
boundaries_affected:
  - gf-inventory
  - agg-garage-graph
authoring_inputs:
  kg_baseline_sha: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "N/A — epic mode, no fanout map"
  bundle_path: "N/A — epic mode, no per-tier bundle"
  bundle_generated_at: "N/A"
paired_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
---

# EP-INVENTORY-STOCK-V2 — Execution Spec (W06)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INVENTORY-STOCK-V2.md` v10.
> §1-§6 verbatim từ source. §7-§13 là DEV section do Delivery Authority + Architecture Authority soạn.
> **Paired epic** (cùng wave W06, cùng PKG-W06, khác boundary lead — giá trị tồn của epic này phụ thuộc kết quả tính giá do epic kia sinh ra qua S2S): `EP-INVENTORY-ACCOUNTING-PERIOD` (nhóm PRC, boundary `gf-accounting`) — execution spec sibling tại `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` (do agent khác trong wave đồng thời soạn).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-STOCK-V2.md`](../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Source version | 10 |
| Source SHA | `5c14944ba36614033715a6de26112e9bb7fcc222b994f70db8f002ddba105c57` (backfilled 2026-07-31, xem §10 NC-W06-EP-STK-001 RESOLVED) |
| Generated at | 2026-07-31T00:00:00+00:00 |
| Wave | W06 — Inventory V2 Slice 4/4: Tính giá + Báo cáo (wave cuối) |

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

---

## §7 Service Impact Matrix

> Wave W06 — 3 FEAT Stock V2 × 4 boundary trực tiếp (`gf-inventory` lead — read-only report subsystem, `agg-garage-graph` BFF passthrough, `garage-web` full 3 report + export, `garage-mobile` partial chỉ `FEAT-STK-LIST-V2`) + 1 boundary cross-boundary upstream provider (`gf-accounting` — KHÔNG spawn DEV cho scope epic này, ghi cost value ngược vào `gf-inventory` qua S2S do sibling epic PRC sở hữu). File này chỉ scope phần **Báo cáo tồn kho V2 (Stock V2 Reports)** — phần Tính giá BQGQ (PRC, 5 FEAT `FEAT-PRC-*`) thuộc execution spec sibling `EP-INVENTORY-ACCOUNTING-PERIOD.md`. `boundaries_affected` frontmatter chỉ liệt kê 2 boundary chính (`gf-inventory` + `agg-garage-graph`); bảng dưới liệt kê đầy đủ 5 boundary chạm tới Stock V2 (gồm UI + cross-boundary provider) để phục vụ DEV.

| Boundary | Role | FEATs touched (W06 Stock V2) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-inventory` | **Lead boundary** (read-only reports) | Tất cả 3 FEAT Stock V2 | **KHÔNG schema mới** — đọc thẳng schema đã tồn tại: `inventory_stock_ledger` (sổ tồn, ADR-020 W04) + `receipt`/`receipt_line` + `delivery`/`delivery_line` (W05) + `opening_balance`/`opening_balance_line` (W04). Q3 thẻ kho đọc `receipt_line` UNION `delivery_line` (KHÔNG đọc sổ tồn gộp). | **MỚI** 6 endpoint canonical `W06-STK-Q1..Q3` (report) + `W06-STK-EX1..EX3` (export) dưới `/api/v1/stock-ledgers/at-date*`, `/api/v1/stock/inout-summary*`, `/api/v1/stock/card*` per `Architecture/api/gf-inventory-api.md` v72 §3g + §5.2 Naming Registry. JWT + tenant + branch auth, `@FeatureOn(Inventory:InventoryV2)`. + **V1 Module Hide**: `InventoryStockController` + `InventoryPeriodStockController` thêm `@FeatureOff("Inventory:InventoryV2")` → 410 Gone `ERR-INV-050` khi flag ON (ưu tiên trên `@FeatureOn(INVENTORY_STOCK)` sẵn có; V1 data KHÔNG xóa). | — | **KHÔNG publish/consume event nào cho Stock V2 Reports** — subsystem đọc thẳng, không có write-path riêng (giá trị cập nhật gián tiếp qua write-path của Receipt/Delivery/OB/PRC, không phải qua event Stock V2). |
| `agg-garage-graph` | BFF orchestrator (passthrough) | Tất cả 3 FEAT Stock V2 | GraphQL SDL types: `StockLedgerAtDateInput/Result`, `StockInoutSummaryInput/Result`, `StockCardDetailInput/Result` (§3j v7.79) | **MỚI** 6 GraphQL ops (§3j Stock V2 Reports, v7.79): `stockLedgerAtDate` (mobile SUPPORTED) · `stockInoutSummary` (web-only) · `stockCardDetail` (web-only) · `stockLedgerAtDateExport` · `stockInoutSummaryExport` · `stockCardDetailExport` (3 export base64 binary proxy) — passthrough thuần (KHÔNG compute lại `aggregates` từ `content[]`/`items[]` — luôn dùng BE-computed), `@FeatureOn(Inventory:InventoryV2)` fail-fast, error-code map | — | — |
| `garage-web` | UI consumer (full 3 report + export) | Tất cả 3 FEAT Stock V2 | — | — | **MỚI** 3 route: `/inventory-stock/reports/at-date` (`StockAtDateReportPage`) · `/inventory-stock/reports/inout` (`StockInoutSummaryReportPage`) · `/inventory-stock/reports/card/$productCode` (`StockCardDetailPage`, full-page — entry chỉ từ nút "Xem lịch sử" trên Q1, tự lấy mã+kho, bộ lọc Kho **disabled** context-only). **Navigation**: menu entry mới "Báo cáo tồn kho" (landing = at-date; NXT/Thẻ kho truy cập qua tab/link trong trang, không hiện riêng sidebar) + **V1 Module Hide** (ẩn 2 tab V1 "Tồn kho" + "Tồn kho theo kỳ" khỏi menu top-nav khi flag ON, route/component V1 KHÔNG xóa — rollback đối xứng). Reuse-First: `data-table-with-pagination`/`form-date-range`/`excel-export`/`no-data`/`loading-inline`. | — |
| `garage-mobile` | UI consumer (**PARTIAL — chỉ `FEAT-STK-LIST-V2`, READ-ONLY**) | `FEAT-STK-LIST-V2` only. **Excluded** (web-only, không có Figma mobile node W06): `FEAT-IP-VIEW-V2`, `FEAT-STK-DETAIL-V2` | — | — | **MỚI** 1 screen `StockAtDateReportPage` (`lib/ui/inventory/`, Cubit `StockAtDateReportCubit`, Figma node `21632:28892` file `5YU4H3iY726P8KNxI9oCYF`) — READ-ONLY, KHÔNG nút Tạo/Sửa/Xóa/Xuất file (export chỉ web). Filter: Kho (multi-select) + khoảng ngày mốc "đến ngày" + search mã/tên. **Cross-wave state-matrix**: hub `FEAT-INV-MOBILE-MENU` enable thêm 1 tile "Tồn kho" (route → `StockAtDateReportPage`) → tổng 6 tile W06 (BR-INV-MENU-002); ~1h task, KHÔNG count vào FEAT Stock V2. | — |
| `gf-accounting` | **Cross-boundary upstream provider** (KHÔNG spawn DEV cho scope epic Stock V2 — sở hữu bởi sibling epic `EP-INVENTORY-ACCOUNTING-PERIOD`) | Không FEAT Stock V2 nào touch entity `gf-accounting` trực tiếp; giá trị **Giá trị tồn / GT xuất** trong 3 báo cáo phụ thuộc kết quả PRC (BQGQ) do `gf-accounting` tính và ghi ngược vào `gf-inventory` | — (không có schema mới do epic Stock V2) | `gf-accounting` → `gf-inventory` REST S2S ghi cost value (`W06-P3` bulk-fill-cost, `W06-P4` bulk-inherit-cost, `W06-P5` bulk-recompute-ledger) — **5 endpoint S2S sở hữu bởi sibling epic**, epic Stock V2 chỉ **đọc kết quả** sau khi PRC chạy xong | — | — |

**Dependency arrows:**
- `garage-web` / `garage-mobile` → `agg-garage-graph` (6 GraphQL ops Stock V2 §3j; mobile chỉ wire Query `stockLedgerAtDate`).
- `agg-garage-graph` → `gf-inventory` (6 REST endpoint `W06-STK-Q1..Q3`/`EX1..EX3` passthrough).
- `gf-accounting` (sibling epic PRC) → `gf-inventory` (REST S2S ghi giá vốn + giá trị sổ tồn — **upstream write, không phải write-path của epic Stock V2**; epic Stock V2 chỉ đọc kết quả sau khi ghi xong).
- `gf-inventory` (nội bộ) — 3 report endpoint đọc trực tiếp `inventory_stock_ledger` (Q1/Q2) hoặc `receipt_line`/`delivery_line` (Q3) — không gọi service nào cross-boundary tại read-path.

---

## §8 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` v19 §1 Cross-boundary Rules (CB-STKV2-001) — chỉ 1 CB rule canonical, đánh dấu **"Nội bộ"** (report đọc trong-boundary, không có REST/Kafka cross-boundary thật ở read-path). 2 CB bổ sung dưới đây là **execution-spec observed** (không phải BR canonical ID) để tường minh 2 điểm cross-boundary thực tế của toàn subsystem (BFF passthrough + upstream PRC write).

| CB ID | Mô tả | REST/GraphQL/Kafka touchpoint | Integration file |
|---|---|---|---|
| CB-STKV2-001 | Báo cáo tồn/NXT/thẻ kho đọc sổ tồn tồn + dòng chi tiết phiếu nhập/xuất + tồn đầu kỳ (cùng boundary `gf-inventory`). Giá trị phụ thuộc kết quả BQGQ (PRC). | Đọc trực tiếp trong-boundary — không REST/Kafka cross-boundary tại read-path | `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` §1 (nguồn BA) |
| CB-STKV2-002 (BFF-side, execution-spec observed) | `agg-garage-graph` passthrough thuần 6 GraphQL ops Stock V2 sang `gf-inventory` — không persistence, không business logic ở BFF layer (KHÔNG compute lại `aggregates` từ payload thô). Auth header propagation `Authorization` + `X-Tenant-Id` + `X-Branch-Id`. | `agg-garage-graph` → `gf-inventory` REST (6 endpoint W06-STK-Q1..Q3/EX1..EX3) | `Architecture/api/agg-garage-graph-graphql.md` v7.79 §3j |
| CB-STKV2-003 (upstream dependency, execution-spec observed — **KHÔNG owned bởi epic này**) | Giá trị **Giá trị tồn** và **GT xuất** trong cả 3 báo cáo phụ thuộc kết quả tính giá BQGQ (PRC) do `gf-accounting` ghi ngược vào `gf-inventory` qua 5 endpoint S2S (`W06-P1..P5`, sở hữu bởi sibling epic `EP-INVENTORY-ACCOUNTING-PERIOD`). Trước khi tenant chạy PRC lần đầu trong kỳ → GT xuất = 0 là hành vi thiết kế hợp lệ (BR-STKV2-002/011/014), **không phải lỗi/thiếu dữ liệu**. | `gf-accounting` → `gf-inventory` REST S2S (5 endpoint, ngoài phạm vi build của epic Stock V2) | `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v2 + sibling execution spec `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` |

---

## §9 Implementation Sequence DAG

> Topological order: schema đã có sẵn (W04/W05) → BE report API (song song, KHÔNG phụ thuộc PRC S2S vì đọc thẳng ledger có sẵn) → BE export + V1 hide → BFF wire → Web + Mobile parallel cuối. **`gf-inventory` DEV agent build chung 1 lượt cả 11 endpoint canonical** (5 S2S PRC-facing thuộc sibling epic PRC + 6 report/export thuộc epic này) — effort dưới đây trích riêng phần Stock V2 report/export (Day 3-4) từ estimate combined của `agent-dev-gf-inventory` (~26h/~3.5 ngày, per PKG-W06 §4.1); Day 1-2 (S2S scaffold) và Day 5 (test) là công việc chung, note lại để rõ boundary nhưng KHÔNG lặp effort.

```
DAY 1-2 — gf-inventory (S2S scaffold — SHARED hạ tầng với sibling epic PRC, KHÔNG thuộc
  build-scope report của epic Stock V2 này):
  Contract review §3f+§3g v72; scaffold StockV2ReportController + 5 S2S protected endpoint
    controller (output feed cho gf-accounting Day 3 consume — thuộc sibling epic)
  Entry : W05 hard gate pass (Nhập/Xuất trong kỳ ổn định + sổ tồn stable — đầu vào báo cáo)
  Exit  : StockV2ReportController scaffold sẵn sàng cho Day 3

DAY 3 — gf-inventory (Stock V2 Reports — core build-scope epic này):
  W06-STK-Q1 (tồn đến ngày — hide-rule OR closing_qty≠0 HOẶC closing_value≠0, bắt case SL=0
    nhưng GT≠0 do chênh lệch làm tròn BQGQ) ·
  W06-STK-Q2 (NXT — 4-nhóm cột Đầu/Nhập/Xuất/Cuối, mỗi nhóm SL+GT) ·
  W06-STK-Q3 (thẻ kho — nguồn dữ liệu = receipt_line UNION delivery_line POSTED, line-level,
    KHÔNG đọc sổ tồn (mất granularity per-phiếu); context{}/opening{}/content[] structure;
    no-movement case trả 200 KHÔNG 404)
  Entry : inventory_stock_ledger (ADR-020 W04, stable) + receipt_line/delivery_line (W05,
          stable) — Stock V2 Reports KHÔNG phụ thuộc PRC S2S hoàn tất; giá vốn=0 nếu chưa
          chạy BQGQ là hành vi hợp lệ theo thiết kế, không phải blocker (§8 CB-STKV2-003)
  Exit  : 3 report endpoint integration tested dev

DAY 4 — gf-inventory (Export + V1 Module Hide — core build-scope epic này):
  W06-STK-EX1/EX2/EX3 (3 export Excel — POI SXSSF streaming, row cap 50k/50k/10k, template
    binding Product/ux/assets/{Báo cáo tồn kho,Báo cáo nhập xuất tồn,Báo cáo thẻ kho}.xlsx)
  V1 hide: InventoryStockController + InventoryPeriodStockController (2 class thật, GAP-W06-
    GI-03 fix) thêm @FeatureOff("Inventory:InventoryV2") → 410 Gone ERR-INV-050 (ưu tiên trên
    @FeatureOn(INVENTORY_STOCK) sẵn có); V1 data KHÔNG xóa
  Entry : Q1-Q3 stable
  Exit  : 6 endpoint report/export canonical integration tested dev; unit test ≥80%

DAY 5 — gf-inventory (test + KG sync — SHARED với sibling epic PRC):
  Integration test: report hide-rule edge case (Q1) + Q3 pagination-safe running total +
    reconciliation invariant (cuối dòng phiếu cuối ngày D = tồn cuối ngày D sổ tồn) + export
    row cap + V1 endpoint 410 khi flag ON / restore khi flag OFF
  KG sync (gf-inventory.knowledge-graph.yaml — 6 endpoint report/export mới) + review fix

══════════════════════════════════════════════════════
DAY 2-3 — agg-garage-graph (BFF, depends gf-inventory report API available Day 3-4):
  SDL Stock V2 types + 6 GraphQL ops §3j passthrough (v7.79) — stockLedgerAtDate/
    stockInoutSummary/stockCardDetail + 3 export base64 binary proxy
  @FeatureOn(Inventory:InventoryV2) fail-fast; error-code map extend
  Entry : gf-inventory 3 report endpoint available (Day 3), 3 export endpoint (Day 4)
  Exit  : Regression script `.regression.ts` PASS (mirror pattern hiện có, KHÔNG Vitest per
          CR-20260731-01); SDL deployed staging

══════════════════════════════════════════════════════
DAY 1-3 — garage-web (depends BFF ops available, song song mock Day 1-2):
  [Day 1] Reuse-First registry lookup (data-table-with-pagination/form-date-range/
    excel-export/no-data/loading-inline); menu entry mới "Báo cáo tồn kho" (T-web-Nav1) +
    T-web-Nav5 (V1 Module Hide — ẩn 2 tab "Tồn kho"/"Tồn kho theo kỳ" theo flag, V1
    route/component KHÔNG xóa)
  [Day 3] StockAtDateReportPage + StockInoutSummaryReportPage + StockCardDetailPage
    (full-page, bộ lọc Kho disabled context-only, entry chỉ từ "Xem lịch sử" trên Q1) +
    export button 3 nơi + Q3 no-movement render dòng Tổng (KHÔNG catch 404)
  Entry : agg-garage-graph SDL + 6 ops deployed staging; Figma web W06 prefetched
          (STK-LIST-V2/IP-VIEW-V2/STK-DETAIL-V2 node, file EMGjGsnAJzGoGwTSK7dTuZ)
  Exit  : Vitest ≥60%; testid ≥95%; V1 tab hide/restore theo flag test pass

══════════════════════════════════════════════════════
DAY 1-3 — garage-mobile (PARTIAL — chỉ FEAT-STK-LIST-V2, depends BFF Query
  stockLedgerAtDate):
  [Day 1] Reuse-First widget verify (ListWidget/SmartRefresher/CustomAppBar/AppButton);
    LocaleKeys VN/EN key inventory (~10-15 key); hub state matrix enable 1 tile "Tồn kho"
    (BR-INV-MENU-002)
  [Day 2] StockAtDateReportPage (SmartRefresher + skeleton + filter Kho multi-select +
    khoảng ngày + search + list) — READ-ONLY, KHÔNG nút Tạo/Sửa/Xóa/Xuất
  [Day 3] Widget/bloc_test/alchemist golden ≥60%; Semantics + SafeArea + KG sync
  Entry : agg-garage-graph Query stockLedgerAtDate deployed; Figma mobile node 21632:28892
          verified (file 5YU4H3iY726P8KNxI9oCYF)
  Exit  : coverage ≥60% pass; hub 6-tile matrix (BR-INV-MENU-002) verified
```

---

## §10 Architecture References

- **`Architecture/api/gf-inventory-api.md`** v72 §0 Wave Index W06 + §3g Stock V2 Reports (`W06-STK-Q1..Q3` + `EX1..EX3`) + §3f PRC-facing S2S (`W06-P1..P5`, sibling epic) + §5.2 Naming Registry.
- **`Architecture/api/agg-garage-graph-graphql.md`** v7.79 §0 + §3j Stock V2 Reports — 6 GraphQL ops canonical.
- **`Architecture/hld/gf-inventory-HLD.md`** v33 §6b.9 (W06 Stock V2 Reports subsystem callout — expected load, pagination, index reuse, cache strategy no-cache realtime, N+1 avoidance).
- **`ADR-020`** (`Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v7) — sổ tồn point-in-time snapshot model + engine tính lại dùng chung `inventory_stock_ledger` — nền tảng đọc của cả 3 báo cáo.
- **`ADR-027`** (`Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` v5) — engine BQGQ, sở hữu bởi sibling epic PRC; epic này chỉ tiêu thụ kết quả (giá vốn xuất).
- **`ADR-009`** (`Architecture/decisions/ADR-009-*.md`) — JPA no relationship mapping, scalar FK only.
- **`ADR-004`** — outbox/inbox mandatory (không áp trực tiếp cho Stock V2 Reports — subsystem không có write-path/event riêng).
- **KG `gf-inventory`** (`Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml`, baseline SHA `456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b`) — W06 thêm 6 endpoint report/export sau wave complete.
- **KG `agg-garage-graph`** — 6 GraphQL ops W06 Stock V2 sau wave complete.
- **`Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md`** v19 — 1 CB rule (CB-STKV2-001) + 16 rule BR-STKV2-001..016 (BR-STKV2-001..005a nền tảng, 006..008 tồn-đến-ngày, 009..011 NXT, 012..014 thẻ kho, 015 phân quyền, 016 platform scope).
- **`Product/Commons/ERROR-CODE-REGISTRY.md`** v32 — mã lỗi liên quan: `ERR-INV-050` (V1 hide), `ERR-CMN-validation/not-found`.
- **`Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md`** v8 — phase plan combined PRC+Stock-V2, DEV task breakdown, effort, deliverable checklist.
- **Sibling execution spec**: `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` — Tính giá BQGQ (5 FEAT `FEAT-PRC-*`, boundary `gf-accounting`), nguồn giá vốn xuất cho epic này.

---

## §11 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho |
|---|---|---|---|
| NC-W06-EP-STK-001 | ~~`source_sha` chưa tính được~~ **RESOLVED 2026-07-31** — orchestrator backfill `5c14944ba36614033715a6de26112e9bb7fcc222b994f70db8f002ddba105c57` vào frontmatter + §0. | Delivery Authority (tooling / orchestrator) | RESOLVED — không còn block ACTIVE |
| NC-W06-EP-STK-002 | **Sibling epic `EP-INVENTORY-ACCOUNTING-PERIOD.md` execution spec đang được soạn song song** bởi agent khác (`exec-spec-ep-accounting-period`) trong cùng phiên — file `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` có thể chưa tồn tại tại thời điểm file này được ghi. §8 CB-STKV2-003 + §10 tham chiếu tới file đó bằng path dự kiến (không phải link đã verify tồn tại) — đề nghị orchestrator verify path tồn tại sau khi cả 2 spec hoàn tất, hoặc để nguyên (path convention đã cố định theo `parent_pkg` + tên epic, rủi ro thấp). | Delivery Authority (orchestrator) | Không block DEV — chỉ là forward-reference giữa 2 sibling doc, không phải hard dependency runtime |
| NC-W06-EP-STK-003 | **Effort Day 3-4 (Stock V2 report/export) trích tách từ estimate combined `~26h/~3.5 ngày` của `agent-dev-gf-inventory`** (PKG-W06 §4.1) — PKG không tách riêng effort Stock V2 report vs PRC S2S scaffold (Day 1-2). Nếu cần effort riêng cho báo cáo, Delivery Authority cần bổ sung breakdown tại PKG hoặc theo dõi Actuals cuối wave (PKG §10). | Delivery Authority | Không block DEV — chỉ ảnh hưởng độ chính xác capacity planning |

---

## §12 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-STOCK-V2.md` v10 | BA source-of-truth |
| Sibling epic (paired, cùng PKG-W06) | `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v24 | Tính giá BQGQ, boundary `gf-accounting` — nguồn giá vốn xuất |
| Business rules | `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` v19 | 1 CB + 16 BR-STKV2 |
| Work package | `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v8 | Combined PRC+Stock-V2 DEV task breakdown, effort, deliverable checklist |
| KG gf-inventory | `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` | Entity baseline, SHA `456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b` |
| gf-inventory API | `Architecture/api/gf-inventory-api.md` v72 | 6 endpoint W06-STK-Q1..Q3/EX1..EX3 canonical §3g |
| GraphQL ops | `Architecture/api/agg-garage-graph-graphql.md` v7.79 | 6 ops Stock V2 canonical §3j |
| gf-inventory HLD | `Architecture/hld/gf-inventory-HLD.md` v33 | §6b.9 W06 Stock V2 Reports subsystem callout |
| ADR-020 | `Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v7 | Sổ tồn point-in-time + engine tính lại dùng chung |
| ADR-027 | `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` v5 | Engine BQGQ (sibling epic sở hữu, epic này tiêu thụ kết quả) |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| Integration (upstream) | `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v2 | S2S PRC → gf-inventory (sở hữu sibling epic) |
| Error registry | `Product/Commons/ERROR-CODE-REGISTRY.md` v32 | `ERR-INV-050` V1 hide + `ERR-CMN-validation/not-found` |
| UX-FLOW | `Product/ux/UX-FLOW-INVENTORY-CATALOG.md` | Ghi chú: UX-FLOW riêng cho Stock V2 chưa xác nhận tên file chuẩn tại thời điểm soạn — verify với Product Authority nếu cần |
| FEAT-STK-LIST-V2 | `Product/features/FEAT-STK-LIST-V2.md` | |
| FEAT-IP-VIEW-V2 | `Product/features/FEAT-IP-VIEW-V2.md` | |
| FEAT-STK-DETAIL-V2 | `Product/features/FEAT-STK-DETAIL-V2.md` | |

---

## §13 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W06 từ `EP-INVENTORY-STOCK-V2` v10. §1-§6 verbatim copy từ source (Outcome, Personas, Cơ chế nền sổ tồn, 3 FEAT + Platform Scope, Dependencies, Success Metric). §7 Service Impact Matrix (3 FEAT Stock V2 × 4 boundary trực tiếp `gf-inventory` lead read-only reports + `agg-garage-graph` BFF passthrough + `garage-web` full 3 report/export + `garage-mobile` partial chỉ `FEAT-STK-LIST-V2` — cùng 1 boundary cross-boundary upstream provider `gf-accounting` sở hữu bởi sibling epic PRC). §8 Cross-boundary contracts (CB-STKV2-001 từ BR v19 §1 — nội bộ + CB-STKV2-002/003 BFF-side/upstream-dependency execution-spec observed). §9 Implementation sequence DAG (gf-inventory Day 1-2 S2S scaffold shared → Day 3 report API → Day 4 export + V1 hide → Day 5 test shared → BFF Day 2-3 → Web Day 1-3 + Mobile Day 1-3 song song). §10 Architecture references (ADR-020/027/009/004 + HLD v33 §6b.9 + KG + BR + error registry + PKG). §11 Open items (3 NC markers: source_sha compute — precedent NC-W05-EP-IR-001, sibling epic file forward-reference chưa verify tồn tại, effort Day 3-4 trích tách từ estimate combined chưa tách riêng). |
