---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-DETAIL-V2.md"
source_version: 16
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-DETAIL-V2"
source_feat_sha: "1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7"
generated_at: "2026-07-31T09:00:00+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán mở thẻ kho theo mã + kho + khoảng ngày → xem chuỗi phiếu nhập/xuất chạy running (Đầu kỳ/Nhập/Xuất/Cuối kỳ) + dòng Tổng → xuất Excel"
consumes_contracts: []
paired_bff_feats: ["FEAT-STK-DETAIL-V2"]
paired_fe_web_feats: ["FEAT-STK-DETAIL-V2"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a — not provided in Context Bundle at authoring time"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-DETAIL-V2.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-DETAIL-V2 (BE): Thẻ kho — chi tiết nhập xuất tồn theo mã + kho

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-DETAIL-V2` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán mở thẻ kho theo mã + kho + khoảng ngày → xem chuỗi phiếu nhập/xuất chạy running + dòng Tổng → xuất Excel |
| Cross-tier pair | BFF: `FEAT-STK-DETAIL-V2` (agg-garage-graph, query `stockCardDetail`) \| Web: `FEAT-STK-DETAIL-V2` (garage-web) \| Mobile: N/A (web-only per PKG scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-DETAIL-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) |
| Source version | v16 |
| Source SHA | `1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7` |
| Generated at | 2026-07-31T09:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần truy vết chính xác dòng chảy nhập/xuất và số dư tồn của một mã sản phẩm tại một kho cụ thể trong một khoảng ngày, phục vụ đối soát kiểm kê và giải trình số liệu khi có sai lệch. Thẻ kho là báo cáo drill-down từ báo cáo tồn tổng quan, hiển thị realtime từng phiếu nhập/xuất đã ghi sổ kèm số dư chạy (running balance) theo đúng trình tự thời gian. Giá trị các dòng xuất phản ánh đúng phương pháp Bình quân gia quyền cuối kỳ (BQGQ) sau khi PRC đã chạy, giúp người dùng nắm rõ nguyên nhân biến động giá trị tồn kho theo từng giao dịch.

## 2. Trách nhiệm backend (gf-inventory)

- Cung cấp REST endpoint mới `POST /api/v1/stock/card/search` trả về chuỗi phiếu nhập/xuất chạy running (`context` + `opening` + `content[]` + `aggregates`) theo (mã sản phẩm + kho + khoảng ngày) — toàn bộ running balance tính trong RAM tại BE trước khi cắt trang (pagination-safe, đúng cho mọi `page`).
- Cung cấp REST endpoint xuất Excel `GET /api/v1/stock/card/export` theo cùng bộ filter bắt buộc, bám mẫu `Báo cáo thẻ kho.xlsx`, row cap 10k phòng vệ OOM.
- Tổng hợp Đầu kỳ dòng đầu tiên từ point-lookup `inventory_stock_ledger` tại `max(movement_date) < fromDate`; các dòng phiếu sau kế thừa Cuối kỳ dòng liền trước — không truy vấn ledger cho từng dòng phiếu (ledger chỉ dùng cho seed Đầu kỳ, không phải nguồn `content[]`).
- Enumerate SLIP thật (UNION `receipt`+`receipt_line` và `delivery`+`delivery_line`, `status='POSTED'` only, join line-level `warehouse_id`) — không dùng dòng ảo `OPENING`/`OB_IMPORT`.
- Enforce BR-STKV2-012/013/014 tại service layer khi tổng hợp response; enforce feature flag `@FeatureOn(Inventory:InventoryV2)` class-level + dual persona permission (`accountant` + `garage-owner` ngang quyền, BR-STKV2-015) tại controller layer.
- Không có thay đổi schema/migration — 2 endpoint hoàn toàn read-only, tái sử dụng entity + index đã có từ W04 (`InventoryStockLedger`) và W05 (`Receipt`/`ReceiptLine`, `Delivery`/`DeliveryLine`).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Mở thẻ kho + hiển thị dữ liệu

#### AC-1 → Nhận filter bắt buộc (mã + kho + khoảng ngày), trả context cho full-page

- **Khi**: client POST `/api/v1/stock/card/search` với `productCode`, `warehouseCode`, `fromDate`, `toDate` (tất cả bắt buộc; `fromDate`/`toDate` default lần lượt ngày 01 và ngày cuối tháng hiện tại nếu FE không truyền).
- **BE phải**: resolve `internal_product` + `warehouse` theo tenant scope → trả top-level `context` object (`productCode/productName/mainUnitCode/warehouseCode/warehouseName`) một lần duy nhất cho toàn response (không lặp lại per-row như Q1/Q2) để FE render header full-page.
- **Output**: `{data: {context, opening, content[], aggregates, totalElements, totalPages, page, size}}`.
- **Failure mode**: `productCode`/`warehouseCode` không tồn tại tenant scope → 404 `ERR-CMN-not-found`; date range invalid (`toDate < fromDate` hoặc `toDate > today`) → 400 `ERR-CMN-validation`.
- **Ref**: BR-STKV2-012 (§9), entity `InventoryStockLedger`/`InternalProduct`/`Warehouse` (§5.1), endpoint `POST /api/v1/stock/card/search` (§6.1). Điều hướng full-page (thay popup) là UI concern — xem `fe-web/FEAT-STK-DETAIL-V2.md §3 AC-1`.

#### AC-2 → Response cung cấp đủ 10 field cột hiển thị per dòng phiếu

- **Khi**: BE compose `content[]` cho response Q3.
- **BE phải**: mỗi item `content[]` phải mang đủ field `movementDate, slipCode, slipType, openingQty, openingValue, inboundQty, inboundValue, outboundQty, outboundValue, closingQty, closingValue` — nguồn: `receipt.entry_date`/`delivery.entry_date` (KHÔNG phải `inventory_stock_ledger.movement_date`, vì ledger gộp phiếu theo ngày).
- **Output**: `content[].{...}` shape `StockCardDetailItem`.
- **Failure mode**: N/A (mapping field, không có input lỗi riêng).
- **Ref**: BR-STKV2-013 (§9), endpoint `POST /api/v1/stock/card/search` (§6.1).

#### AC-3 → Mỗi dòng = 1 phiếu thật, chạy running balance

- **Khi**: BE tổng hợp `content[]` cho 1 request Q3.
- **BE phải**: `UNION ALL` 2 sub-query — (c.1) `receipt JOIN receipt_line` `status='POSTED'` `entry_date BETWEEN fromDate AND toDate` filter theo `receipt_line.product_id` + `receipt_line.warehouse_id`; (c.2) symmetric `delivery JOIN delivery_line`. Merge kết quả `ORDER BY movementDate ASC, id ASC` (line PK tiebreak), duyệt tuần tự trong RAM: dòng đầu tiên `openingQty_0 = opening.openingQty` (từ AC-4); mỗi dòng N: `closingQty_N = openingQty_N + inboundQty_N − outboundQty_N`; dòng N+1 kế thừa `openingQty_{N+1} = closingQty_N`. Toàn bộ chuỗi tính XONG trước khi cắt trang (LIMIT/OFFSET áp sau) để đảm bảo đúng ở mọi `page`.
- **Output**: `content[]` đã sắp thứ tự thời gian với running balance chính xác không phụ thuộc trang hiện tại.
- **Failure mode**: N/A (BE-internal computation, không có input lỗi riêng ngoài AC-1).
- **Ref**: BR-STKV2-013 (§9), entity `ReceiptLine`/`DeliveryLine` (§5.1), endpoint `POST /api/v1/stock/card/search` (§6.1).

#### AC-4 → Đầu kỳ dòng đầu = snapshot sổ tồn tại "Từ ngày − 1"

- **Khi**: BE resolve Đầu kỳ cho request Q3 (top-level `opening` object + seed cho `content[0]`).
- **BE phải**: point-lookup `inventory_stock_ledger` tại `(tenant_id, product_id, warehouse_id)` với `movement_date = MAX(movement_date) < fromDate`; trả `closing_qty`/`closing_value` của dòng đó làm `openingQty`/`openingValue`; nếu không có ledger row trước `fromDate` → trả `"0.000000"`/`"0"`.
- **Output**: `opening.{openingQty, openingValue}` (luôn trả, kể cả 0-movement case) + `aggregates.openingQty/openingValue` (duplicate cho FE bind Tổng row).
- **Failure mode**: N/A (không có ledger row = hợp lệ, trả 0, không phải lỗi).
- **Ref**: BR-STKV2-012 (§9), entity `InventoryStockLedger` (§5.1), endpoint `POST /api/v1/stock/card/search` (§6.1).

### Cluster B — Giá trị BQGQ + dòng Tổng + xuất file + phân quyền

#### AC-5 → Giá trị dòng Xuất phản ánh đúng BQGQ

- **Khi**: BE compose `outboundQty`/`outboundValue` cho dòng SLIP-xuất.
- **BE phải**: đọc trực tiếp `delivery_line.quantity_in_base` / `delivery_line.cost_value` (KHÔNG tính lại từ `inventory_stock_ledger.outbound_value`). `cost_value` = 0 trước khi PRC chạy (pre-PWA) và được PRC (FEAT-PRC-CREATE/RECALC) cập nhật retroactive qua `bulk-fill-cost` — Q3 chỉ đọc giá trị hiện tại, không tự tính BQGQ.
- **Output**: `content[].outboundValue` chính xác theo giá vốn BQGQ tại thời điểm đọc.
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-014 (§9), entity `DeliveryLine` (§5.1), endpoint `POST /api/v1/stock/card/search` (§6.1).

#### AC-6 → Dòng Tổng BE-computed trên toàn bộ filtered range

- **Khi**: BE trả response Q3 (mọi trường hợp, kể cả 0 movement).
- **BE phải**: tính `aggregates{openingQty, openingValue, totalInboundQty, totalInboundValue, totalOutboundQty, totalOutboundValue, closingQty, closingValue}` trên TOÀN BỘ filtered range TRƯỚC khi cắt trang (không phải chỉ trang hiện tại). Case 0 movement: `content: []` + `aggregates.opening* = closing*` (Đầu=Cuối) + `totalInbound*/totalOutbound* = 0`.
- **Output**: `aggregates` object — FE bind trực tiếp, không tự sum `content[]` (tránh sai khi multi-page).
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-014 (dòng Tổng formula bảo toàn, §9), endpoint `POST /api/v1/stock/card/search` (§6.1).

#### AC-7 → Xuất file Excel theo mẫu chuẩn

- **Khi**: client GET `/api/v1/stock/card/export` với cùng 4 filter bắt buộc (`productCode`, `warehouseCode`, `fromDate`, `toDate`) dưới dạng query param.
- **BE phải**: generate `.xlsx` qua Apache POI bám mẫu `Product/ux/assets/Báo cáo thẻ kho.xlsx` (header meta + context + range → column header 11 cột → 1 dòng/phiếu thật chronological → dòng Tổng theo `aggregates`); áp row cap 10.000 dòng; vượt cap → 400 `ERR-CMN-validation`.
- **Output**: binary stream `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="bao-cao-the-kho-{productCode}-{warehouseCode}-{fromDate}_{toDate}.xlsx"`.
- **Failure mode**: 400 `ERR-CMN-validation` (filter invalid hoặc >10k dòng); 404 `ERR-CMN-not-found` (product/warehouse không tồn tại tenant scope — 0-movement KHÔNG phải 404, trả 200 với sheet chỉ có header + dòng Tổng Đầu=Cuối).
- **Ref**: BR-STKV2-005 (§9), endpoint `GET /api/v1/stock/card/export` (§6.1).

#### AC-8 → Phân quyền — chủ garage + kế toán ngang nhau

- **Khi**: mọi request tới cả 2 endpoint Q3 + EX3.
- **BE phải**: cho phép cả 2 persona `accountant` và `garage-owner` truy cập với quyền ngang nhau — không phân biệt role, không có endpoint/field nào chỉ 1 persona thấy được.
- **Output**: 200 cho cả 2 persona hợp lệ cùng tenant/branch.
- **Failure mode**: 403 `FORBIDDEN` nếu tenant mismatch hoặc feature flag `Inventory:InventoryV2` OFF cho tenant.
- **Ref**: BR-STKV2-015 (§9), endpoint `POST /api/v1/stock/card/search` + `GET /api/v1/stock/card/export` (§6.1).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-STKV2-012** (CORNERSTONE): Thẻ kho = chuỗi phiếu nhập/xuất theo (mã+kho), Đầu kỳ dòng đầu tra sổ tồn tại `Từ ngày − 1` — enforce tại `app/service` (query composition + RAM merge). Vi phạm → tính sai running balance, không có error code (data-integrity bug, không phải validation).
- **BR-STKV2-013** (CORNERSTONE): mỗi dòng `content[]` = 1 phiếu nhập/xuất thật, KHÔNG gộp theo ngày (khác `inventory_stock_ledger` daily-aggregate), KHÔNG có dòng ảo `OPENING`/`OB_IMPORT` — enforce tại `domain`/repository query layer (UNION receipt/delivery slip lines, không đọc `inventory_stock_ledger` cho `content[]`).
- **BR-STKV2-014** (NORMAL): giá trị Xuất = 0 trước khi PRC chạy, cập nhật sau PWA — enforce tại field mapping (đọc trực tiếp `delivery_line.cost_value`, không tính toán lại tại Q3).
- **BR-STKV2-015** (CORNERSTONE): dual persona quyền ngang nhau (`accountant` + `garage-owner`) — enforce tại `adapter/controller` (security annotation).
- **BR-STKV2-005** (NORMAL): file export bám mẫu Excel chuẩn theo từng báo cáo (`Báo cáo thẻ kho.xlsx`) — enforce tại export service (template binding).
- **BR-STKV2-013/014** (CORNERSTONE, formula bảo toàn): `openingValue + inboundValue − outboundValue = closingValue` — BR-STKV2-013 enforce per-dòng running balance (AC-3), BR-STKV2-014 enforce `aggregates` dòng Tổng (AC-6). **KHÔNG phải BR-STKV2-010** — rule đó thuộc `FEAT-IP-VIEW-V2` (báo cáo NXT), khác domain (xem `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` §2.4 cột Features).

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4).
- Class-level `@FeatureOn(Inventory:InventoryV2)` trên controller — tenant chưa enable flag → 403.
- `accountant` + `garage-owner` — cả 2 role có quyền truy cập ngang nhau, không có role-specific field/branch.

### 4.3 Idempotency + concurrency

- Cả 2 endpoint là GET/POST-safe read-only — không cần `X-Idempotency-Key`, không optimistic locking (không ghi dữ liệu).
- Export endpoint idempotent theo filter — cùng filter → cùng nội dung file (bỏ qua ordering ties).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-1 | INLINE_FIELD (date range / missing productCode-warehouseCode) |
| `ERR-CMN-not-found` | 404 | AC-1, AC-7 | DIALOG/EMPTY_STATE — chỉ khi product/warehouse thực sự không tồn tại tenant scope; **KHÔNG** dùng cho case 0-movement-in-range (case đó trả 200 + `content: []` + `aggregates` populated) |
| `FORBIDDEN` | 403 | AC-8 | TOAST/redirect (tenant mismatch hoặc feature flag OFF) |
| `ERR-CMN-validation` | 400 | AC-7 | DIALOG ("vượt 10.000 dòng — thu hẹp khoảng ngày") |

---

## 5. Schema delta (BE — contract focus)

> Feature này **không có thay đổi entity/schema** — 2 endpoint hoàn toàn read-only, tái sử dụng entity + bảng đã tồn tại từ W04 (`inventory_stock_ledger`) và W05 (`receipt`/`receipt_line`, `delivery`/`delivery_line`) + catalog (`internal_product`, `warehouse`).

### 5.1 Entity changes — `gf-inventory`

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | N/A — không có schema change | — | — | Đọc-only qua `InventoryStockLedger`, `ReceiptLine`, `DeliveryLine`, `InternalProduct`, `Warehouse` (entity đã tồn tại, không extend cột) |

> **Boundary migration policy**: `gf-inventory` dùng Flyway V{N+1} additive — nhưng feature này không cần migration vì không thay đổi schema.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| — | — | — | — | Không có index mới. Tái sử dụng `idx_ledger_lookup (tenant_id, product_id, warehouse_id, movement_date DESC)` (seed Đầu kỳ AC-4), `idx_receipt_line_product_wh`/`idx_delivery_line_product_wh (tenant_id, product_id, warehouse_id)` (SLIP line-level narrow, AC-3), `idx_receipt_tenant_status_wh`/`idx_delivery_tenant_status_wh` hoặc `idx_receipt_tenant_entry`/`idx_delivery_tenant_entry` (header-side status+date narrow, AC-3) — tất cả đã có từ W04/W05 | ADR-020, ADR-023, ADR-024 |

> **Perf follow-up**: chưa có single composite index `(tenant, warehouse, product, date)` span cả `receipt`+`receipt_line` (hoặc `delivery`+`delivery_line`) — query dùng 2-step join (line-level narrow → header-level date/status filter). Chấp nhận được ở scale hiện tại (~200 phiếu/tháng/(mã+kho)); p95 target ≤300ms cần verify lại tại `agent-test-performance` nếu volume tăng.

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v1/stock/card/search` | JWT (authenticated + tenant + branch) | `{productCode, warehouseCode, fromDate, toDate, page?, size?}` | `{data: {context, opening, content[], aggregates, totalElements, totalPages, page, size}}` | safe (read) | AC-1..AC-6, AC-8 | — |
| GET | `/api/v1/stock/card/export` | JWT (authenticated + tenant + branch) | query params `productCode, warehouseCode, fromDate, toDate` | binary `.xlsx` stream | safe (read) | AC-7, AC-8 | — |

> **Contract verified**: cả 2 endpoint grep-verbatim từ `Architecture/api/gf-inventory-api.md` §3g.2 (W06-STK-Q3 line 8891, W06-STK-EX3 line 9143), §0 Wave Index confirms W06 → `§3g` ACTIVE cho read-side. `references_verbatim`: `{endpoint: "POST /api/v1/stock/card/search", source: "gf-inventory-api.md:8891"}`, `{endpoint: "GET /api/v1/stock/card/export", source: "gf-inventory-api.md:9143"}`.

### 6.2 Modified REST endpoints (additive)

| Method | Path | Change | Backward-compat? | AC ref |
|---|---|---|---|---|
| — | — | N/A — cả 2 endpoint đều mới trong W06 (không sửa endpoint cũ) | — | — |

### 6.3 Kafka topics (publish/consume)

| Topic | Direction | Schema | When | AC ref |
|---|---|---|---|---|
| — | — | — | N/A — feature thuần đọc, không publish/consume event | — |

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `POST /api/v1/stock/card/search` | `agg-garage-graph` (BFF passthrough GraphQL `stockCardDetail`) | FE mở trang thẻ kho (drill-down từ Q1) | Passthrough lỗi lên FE nguyên trạng | sync, fail fast (read-only, safe retry) |
| `GET /api/v1/stock/card/export` | `agg-garage-graph` (BFF passthrough) hoặc `garage-web` gọi trực tiếp qua `<a href>` download | FE bấm nút "Xuất file" | Passthrough lỗi lên FE | sync, fail fast |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-STK-DETAIL-V2.md`) sẽ wrap 2 endpoint này thành GraphQL query `stockCardDetail` (theo `agg-garage-graph-graphql.md v7.81 §3j`) — KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**`. Module `StockV2Report` đã tồn tại từ W06-STK-Q1/Q2 — Q3 là additive method trong cùng controller/service.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/InventoryStockLedger.java` | REUSE (no change) | reuse (Đầu kỳ point-lookup) | 0 | AC-4 |
| `app/dto` | `src/main/java/.../app/dto/StockCardDetailResponse.java` | NEW | new DTO (`context`/`opening`/`content[]`/`aggregates`) | ~60 | AC-1, AC-2, AC-6 |
| `app/service` | `src/main/java/.../app/service/StockV2ReportService.java` | MODIFY | extend (additive method `searchStockCard()`) | ~120 | AC-1..AC-6 |
| `app/service` | `src/main/java/.../app/service/StockV2ReportExportService.java` | MODIFY | extend (additive method `exportStockCard()`) | ~70 | AC-7 |
| `adapter/controller` | `src/main/java/.../adapter/controller/StockV2ReportController.java` | MODIFY | extend (2 endpoint mới) | ~40 | AC-1, AC-7, AC-8 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/InventoryStockLedgerJpaRepository.java` | ADDITIVE | new finder (opening point-lookup) | ~15 | AC-4 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/ReceiptLineJpaRepository.java` | ADDITIVE | new finder (slip enumeration receipt-side) | ~20 | AC-3 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/DeliveryLineJpaRepository.java` | ADDITIVE | new finder (slip enumeration delivery-side) | ~20 | AC-3 |
| `db/migration` | — | NONE | không có migration (read-only feature) | 0 | — |
| `test/unit` | `src/test/java/.../app/service/StockV2ReportServiceTest.java` | ADDITIVE | new test methods (running-balance correctness, 0-movement case) | ~180 | AC-1..AC-6 |
| `test/contract` | `src/test/java/.../adapter/controller/StockV2ReportControllerContractTest.java` | ADDITIVE | contract test (2 endpoint, error codes) | ~100 | AC-1, AC-7, AC-8 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema migration / entity update
    Entry: KG.entities stable
    Exit: N/A — không có schema thay đổi, bỏ qua bước migration
    └─► S2

S2  Repository + Service logic (BR enforcement primary)
    Entry: S1 (no-op)
    Exit: unit test ≥8 green (running-balance correctness + 0-movement case)
    └─► S3

S3  REST adapter (controller)
    Entry: S2
    Exit: contract test green (2 endpoint + error codes)
    └─► S4

S4  Integration test
    Entry: S3
    Exit: integ test green (drill-down từ Q1 → Q3 với data thật W04/W05)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | (bỏ qua — không có schema change) | — | KG stable | N/A | — |
| S2 | Service logic: sub-query (a) context, (b) opening point-lookup, (c) SLIP enumeration UNION, (d) RAM merge running balance | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter: `POST /stock/card/search` + `GET /stock/card/export` | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-STKV2-012` | CORNERSTONE | app/service (primary) | `app/service/StockV2ReportService.java::searchStockCard()` | AC-1, AC-4 | `TC-BR-STKV2-012-*` |
| `BR-STKV2-013` | CORNERSTONE | app/service + adapter/persistence | `app/service/StockV2ReportService.java` (UNION query composition) | AC-2, AC-3 | `TC-BR-STKV2-013-*` |
| `BR-STKV2-014` | CORNERSTONE | app/service | `app/service/StockV2ReportService.java` (field mapping outboundValue + dòng Tổng balance formula `openingValue + inboundValue − outboundValue = closingValue`) | AC-5, AC-6 | `TC-BR-STKV2-014-*` |
| `BR-STKV2-015` | CORNERSTONE | adapter/controller | `adapter/controller/StockV2ReportController.java` (security annotation) | AC-8 | `TC-BR-STKV2-015-*` |
| `BR-STKV2-005` | NORMAL | app/service | `app/service/StockV2ReportExportService.java` (template binding) | AC-7 | `TC-BR-STKV2-005-*` |

> **Enforcement layer priority**: Primary ở `domain/` hoặc `app/service/` (SSOT). UI hint (FE render "Không có biến động", format số) → secondary tier, xem `fe-web/FEAT-STK-DETAIL-V2.md §11`.

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (negative) | test-api | missing productCode/warehouseCode, invalid date range, unknown product/warehouse → 404 |
| AC-2 | API contract (positive) | test-api | verify đủ 10 field per `content[]` item |
| AC-3, AC-4 | Unit (running-balance calc) + Integration | test-api | seed ledger + nhiều phiếu nhập/xuất xen kẽ, verify chuỗi Đầu/Cuối kỳ đúng qua nhiều trang |
| AC-5 | Integration (post-PRC value) | test-api | verify `outboundValue` = 0 trước PRC, cập nhật đúng sau `bulk-fill-cost` |
| AC-6 | Unit + API contract (0-movement edge case) | test-api | `content: []` case → `aggregates.opening* = closing*` |
| AC-7 | API contract + file-content check | test-api | verify .xlsx template layout + row cap 10k |
| AC-8 | Isolation (RBAC) | test-isolation | dual persona `accountant` + `garage-owner` truy cập ngang nhau |

## 11. Cross-tier coordination (BE perspective)

> Cross-link sang các tier file khác cùng `FEAT-STK-DETAIL-V2`. Reviewer items 15-18 enforce consistency.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-STK-DETAIL-V2.md` | N/A (chưa spawn tại thời điểm authoring — Batch C pending) | Resolver wrap §6.1 endpoints thành GraphQL query `stockCardDetail` |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-DETAIL-V2.md` | N/A (chưa spawn tại thời điểm authoring — Batch D pending) | UI consume BFF `stockCardDetail`, full-page thay popup (v7) |
| Mobile | — | N/A | Web-only theo PKG scope — mobile chỉ có `FEAT-STK-LIST-V2` (Q1) |

**Source ID consistency** (item 18): tất cả tier file phải cùng `source_feat_sha = 1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7`.

## 12. References

- **Source**: [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) v16
- **Parent EP**: [`EP-INVENTORY-STOCK-V2.md`](../../epics/EP-INVENTORY-STOCK-V2.md) (converted)
- **BR refs**: [`BR-GF-INVENTORY-STOCK-V2.md`](../../business-rules/BR-GF-INVENTORY-STOCK-V2.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3g.2 (W06-STK-Q3 line 8891, W06-STK-EX3 line 9143), §0 Wave Index (W06 row)
- **Integration**: N/A — feature không có cross-boundary REST call (self-contained trên bảng của chính `gf-inventory`)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v46
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa sai BR-ID citation cho công thức bảo toàn cân bằng ở AC-6/§4.1/§9** — `BR-STKV2-010` (thực ra rule đó `Features=FEAT-IP-VIEW-V2`, báo cáo NXT, không phải Thẻ kho) → `BR-STKV2-014` (rule đúng, `Features=FEAT-STK-DETAIL-V2`, "Dòng Tổng... GT Cuối kỳ = GT Đầu + GT Nhập" khi GT Xuất=0). §9 mapping table: merge touchpoint AC-6 vào row `BR-STKV2-014` hiện có (severity NORMAL → CORNERSTONE, touchpoint AC-5 → AC-5, AC-6), xóa row `BR-STKV2-010` sai (AC-3 per-dòng running balance đã đúng cite `BR-STKV2-013` từ trước, không đổi). Đồng bộ `version` frontmatter khớp Change Log. Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-STK-DETAIL-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 BE behaviour map cho 8 AC (không N/A — toàn bộ AC có BE contract touchpoint), §4 ràng buộc + error code, §5 schema delta (không có thay đổi — pure read-only), §6 API contract delta (2 endpoint mới `POST /api/v1/stock/card/search` + `GET /api/v1/stock/card/export`, verified verbatim từ `gf-inventory-api.md` §3g.2 vì bundle §G truncate section này), §7-§11 BE-specific. Source FEAT chỉ audit. |
