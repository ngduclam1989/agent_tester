---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-IP-VIEW-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-IP-VIEW-V2"
source_feat_sha: "1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e"
generated_at: "2026-07-31T06:45:00+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority                    # Architecture Authority co-sign §5 §6 §7
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: ["FEAT-IP-VIEW"]
change_type: "brownfield-enhancement"
demo_signature: "Kế toán mở tab Báo cáo NXT, chọn khoảng ngày + kho → hệ thống trả về SL/GT đầu kỳ, nhập, xuất, cuối kỳ theo từng (mã + kho) đọc trực tiếp từ sổ tồn; bấm Xuất file → tải .xlsx đúng mẫu chuẩn."
consumes_contracts: []
paired_bff_feats: ["FEAT-IP-VIEW-V2"]
paired_fe_web_feats: ["FEAT-IP-VIEW-V2"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A — không có bash tool trong session này để tính sha256, orchestrator backfill"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-IP-VIEW-V2.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-IP-VIEW-V2 (BE): Báo cáo Nhập Xuất Tồn (NXT)

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IP-VIEW-V2` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán mở tab Báo cáo NXT, chọn khoảng ngày + kho → hệ thống trả về SL/GT đầu kỳ, nhập, xuất, cuối kỳ theo từng (mã + kho) đọc trực tiếp từ sổ tồn; bấm Xuất file → tải .xlsx đúng mẫu chuẩn |
| Cross-tier pair | BFF: `FEAT-IP-VIEW-V2` \| Web: `FEAT-IP-VIEW-V2` \| Mobile: N/A (Web GMS only — xem §11 note) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-IP-VIEW-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) |
| Source version | v10 |
| Source SHA | `1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e` |
| Generated at | 2026-07-31T06:45:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần xem biến động và số dư tồn kho của từng mã sản phẩm theo khoảng ngày tùy chọn — tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ — để phục vụ đối soát cuối tháng và ra quyết định nhập hàng. Đây là 1 trong 3 báo cáo tồn kho V2 (cùng với "tồn đến ngày" và "thẻ kho"), đọc realtime từ sổ tồn để đảm bảo số liệu nhất quán giữa các báo cáo. Feature này thay thế báo cáo NXT bản cũ (`FEAT-IP-VIEW`) đã production, chuyển sang mô hình đọc trực tiếp sổ tồn thay vì tổng hợp chi tiết phiếu.

## 2. Trách nhiệm backend (`gf-inventory`)

- Thêm 2 REST endpoint mới (đọc, không sinh state): search phân trang báo cáo NXT + export `.xlsx` theo bộ lọc hiện tại, đọc trực tiếp từ `inventory_stock_ledger` (bảng đã tồn tại từ W04) — KHÔNG đọc lại chi tiết `receipt_line`/`delivery_line` để đảm bảo cùng nguồn dữ liệu với báo cáo "tồn đến ngày" (`FEAT-STK-LIST-V2`, Q1) và "thẻ kho" (`FEAT-STK-DETAIL-V2`, Q3).
- Tính 4 nhóm số liệu (Đầu kỳ / Nhập kho / Xuất kho / Cuối kỳ) × (SL, GT) cho từng cặp (mã sản phẩm + kho) trong khoảng `[fromDate, toDate]`, áp dụng công thức BR-STKV2-001/010/011 (§4.1).
- Enforce filter rule: mỗi (mã + kho) tách thành 1 dòng riêng; chỉ trả dòng có phát sinh nhập/xuất trong kỳ HOẶC tồn đầu/cuối ≠ 0 (BR-STKV2-009/010); không có filter theo Garage (BR-STKV2-003/004).
- Enforce phân quyền ngang giữa `garage-owner` và `accountant` (BR-STKV2-015) — không có role-based restriction bổ sung.
- Generate file `.xlsx` export bám đúng mẫu chuẩn `Báo cáo nhập xuất tồn.xlsx` (tên sheet / cột / thứ tự / định dạng số / merge header nhóm) theo bộ lọc đang áp dụng (BR-STKV2-005).
- Không phát sinh migration mới — tái sử dụng schema `inventory_stock_ledger` + index `idx_ledger_lookup` đã có từ W04/W06-STK-Q1.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Truy vấn & công thức báo cáo

#### AC-1 → Endpoint mặc định khi mở màn báo cáo
- **Khi**: FE gọi lần đầu tab "Báo cáo NXT" không truyền filter tường minh.
- **BE phải**: nhận request search với `fromDate`/`toDate` mặc định (server áp default nếu field bị bỏ trống theo §6.1) trả về trang đầu (`page=0, size=20`) cùng `aggregates` (dòng Tổng) và `totalElements`/`totalPages` cho phân trang.
- **Output**: `PagedApiResponse<StockInoutSummaryItem>` kèm `aggregates`.
- **Failure mode**: `FORBIDDEN` (403) nếu tenant chưa bật `@FeatureOn(Inventory:InventoryV2)`.
- **Ref**: BR-STKV2-001 (§9), endpoint `POST /api/v1/stock/inout-summary/search` (§6.1).

#### AC-2 → Đủ field cho 4 nhóm cột 2-tầng
- **Khi**: build response item.
- **BE phải**: trả đủ text field (`productCode`, `productName`, `mainUnitCode`, `warehouseCode`, `warehouseName`) + 8 field số (`openingQty/Value`, `inboundQty/Value`, `outboundQty/Value`, `closingQty/Value`) đúng tên field khớp Naming Registry §5.4 (FE map trực tiếp sang 4 nhóm 2-tầng, BE không cần biết cấu trúc UI).
- **Output**: `StockInoutSummaryItem` (§5.2) + `StockInoutSummaryAggregates` (8 field Tổng, BE-computed).
- **Failure mode**: N/A (mapping thuần).
- **Ref**: BR-STKV2-001/002 (§9), DTO `StockInoutSummaryItem` (§5.2).

#### AC-3 → Công thức 4 cột đọc trực tiếp sổ tồn
- **Khi**: tính giá trị cho từng (mã + kho) trong khoảng `[fromDate, toDate]`.
- **BE phải**: (a) **Tồn đầu kỳ** = `closingQty`/`closingValue` của dòng sổ tồn có `movementDate` lớn nhất `≤ fromDate − 1`; (b) **Nhập trong kỳ** = `SUM(inbound_qty)`, `SUM(inbound_value)` của các dòng sổ tồn có `movementDate ∈ [fromDate, toDate]`; (c) **Xuất trong kỳ** = `SUM(outbound_qty)`, `SUM(outbound_value)` cùng khoảng; (d) **Tồn cuối kỳ** = `closingQty`/`closingValue` của dòng sổ tồn có `movementDate` lớn nhất `≤ toDate`. TUYỆT ĐỐI KHÔNG join `receipt_line`/`delivery_line` để tính lại — chỉ đọc `inventory_stock_ledger`.
- **Output**: 8 field số trong `StockInoutSummaryItem`.
- **Failure mode**: N/A (read-only aggregation).
- **Ref**: BR-STKV2-001/010 (§9), index `idx_ledger_lookup` (§5.2).

#### AC-4 → GT theo trạng thái BQGQ
- **Khi**: mã sản phẩm chưa chạy tính giá BQGQ (PRC) trong kỳ.
- **BE phải**: trả `openingValue`/`inboundValue` là giá trị thật (đơn giá nhập đã biết, không phụ thuộc PRC); `outboundValue = 0` (giá vốn chưa chốt, per BR-STKV2-011); `closingValue = openingValue + inboundValue − outboundValue` (tự động = openingValue + inboundValue khi outboundValue=0). Sau khi PRC chạy, `outboundValue`/`closingValue` là số liệu thật lấy từ ledger đã cập nhật (§3f W06-P3/P5 cascade). BE KHÔNG trả text "Tạm tính" — đây là field số thuần, phần chú thích UI thuộc tier FE.
- **Output**: field `outboundValue`/`closingValue` đúng theo state PWA hiện tại của ledger.
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-011 (§9).

### Cluster B — Bộ lọc & tách dòng

#### AC-5 → Bộ lọc
- **Khi**: request có `fromDate`, `toDate`, `warehouseIds?`, `keyword?`.
- **BE phải**: validate `toDate ≥ fromDate`; áp default `fromDate = ngày 01 tháng hiện tại`, `toDate = ngày cuối tháng hiện tại` khi field bị bỏ trống; `warehouseIds` rỗng/omit = tất cả kho tenant; `keyword` LIKE-unaccent match `internal_product.code` OR `internal_product.name` (≤ 200 ký tự); KHÔNG có filter theo Garage (BR-STKV2-003/004 — field không tồn tại trong request schema).
- **Output**: request validate pass → query thực thi; fail → `ERR-CMN-validation` (400).
- **Failure mode**: 400 khi `toDate < fromDate`, format ngày sai, `keyword` quá dài, `size > 100`, `sort` ngoài whitelist.
- **Ref**: BR-STKV2-003/004 (§9), request schema (§6.1).

#### AC-6 → Tách dòng theo kho & điều kiện hiển thị mã
- **Khi**: build result set.
- **BE phải**: GROUP BY `(productId, warehouseId)` — mỗi (mã + kho) = đúng 1 dòng, không gộp kho. Chỉ trả dòng thỏa `inboundQty <> 0 OR outboundQty <> 0 OR openingQty <> 0 OR openingValue <> 0 OR closingQty <> 0 OR closingValue <> 0` (BR-STKV2-009/010 — có phát sinh trong kỳ HOẶC tồn đầu/cuối khác 0). Khi không có dòng nào khớp filter → trả `content: []` với HTTP 200 (không phải lỗi) để FE tự render `EMPTY_STATE` (EC-4 nguồn).
- **Output**: `content[]` đúng điều kiện lọc trên; `totalElements = 0` là kết quả hợp lệ.
- **Failure mode**: N/A — empty result set không phải lỗi.
- **Ref**: BR-STKV2-009/010 (§9).

### Cluster C — Xuất file & phân quyền

#### AC-7 → Xuất file
- **Khi**: FE gọi export với cùng filter đang áp dụng trên bảng.
- **BE phải**: generate file `.xlsx` bám đúng mẫu `Product/ux/assets/Báo cáo nhập xuất tồn.xlsx` — tên sheet, thứ tự cột, định dạng số, merge header nhóm 2-tầng phải khớp mẫu; áp dụng cùng bộ filter (`fromDate/toDate/warehouseIds/keyword`) như search, KHÔNG phân trang (xuất toàn bộ dòng khớp filter).
- **Output**: binary `.xlsx` response, `Content-Disposition: attachment`.
- **Failure mode**: `ERR-CMN-validation` (400) nếu filter invalid; 500 nếu generate lỗi.
- **Ref**: BR-STKV2-005 (§9), endpoint `GET /api/v1/stock/inout-summary/export` (§6.1).

#### AC-8 → Phân quyền ngang
- **Khi**: mọi request tới 2 endpoint trên.
- **BE phải**: chỉ enforce `authenticated + tenant + branch` (JWT + `X-Tenant-Id` + `X-Branch-Id`) — KHÔNG thêm role-based check phân biệt `garage-owner` vs `accountant`; cả 2 persona có quyền truy cập ngang nhau.
- **Output**: request có JWT hợp lệ + đúng tenant → luôn cho qua bất kể persona.
- **Failure mode**: 401 thiếu/sai JWT; 403 tenant mismatch.
- **Ref**: BR-STKV2-015 (§9), §4.2.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-STKV2-001/002** (CORNERSTONE): sổ tồn (`inventory_stock_ledger`) là nguồn duy nhất cho SL (luôn số thực) và GT (số thật hoặc 0 tùy trạng thái BQGQ) — enforce tại `app/service` (query + assembly). Vi phạm (đọc nhầm nguồn chi tiết phiếu) → sai lệch số liệu, phát hiện qua reconciliation test giữa Q1/Q2/Q3.
- **BR-STKV2-003/004** (NORMAL): báo cáo tách theo kho, không filter theo Garage — enforce tại request DTO (field không tồn tại) + query layer (`GROUP BY warehouseId`).
- **BR-STKV2-005** (NORMAL): export `.xlsx` bám mẫu chuẩn, đúng bộ filter đang áp dụng — enforce tại `app/service` export generator.
- **BR-STKV2-009/010/011** (CORNERSTONE): 1 dòng/(mã+kho); Đầu kỳ = tra cứu, Nhập/Xuất = tính tổng, Cuối kỳ = tra cứu; chỉ hiển thị mã có phát sinh hoặc tồn ≠ 0; GT Xuất = 0 khi chưa chạy BQGQ — enforce tại `app/service` (query + filter HAVING).
- **BR-STKV2-015** (NORMAL): `garage-owner` và `accountant` quyền ngang nhau — enforce tại `adapter/config` (Spring Security role mapping, không phân biệt 2 role trên 2 endpoint này).

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- Cả 2 endpoint yêu cầu `Authorization: Bearer` (JWT user) — KHÔNG phân biệt role `accountant`/`garage-owner` (BR-STKV2-015).
- Gate `@FeatureOn(Inventory:InventoryV2)` — tenant chưa bật flag → HTTP 403 `FORBIDDEN`.

### 4.3 Idempotency + concurrency

- Cả 2 endpoint là read-only, không mutate state — an toàn khi retry (safe/idempotent theo semantic dù `search` dùng verb POST cho JSON body per v67 convention).
- Không cần optimistic locking / version field (không ghi dữ liệu).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-5, AC-7 | INLINE (filter form) |
| `FORBIDDEN` | 403 | AC-1, AC-8 | TOAST / redirect (feature flag off / tenant mismatch) |
| — (JWT missing/invalid) | 401 | AC-8 | Redirect login |
| — (warehouse not found) | 404 | AC-5 | TOAST |
| — (downstream timeout) | 504 | AC-1 | TOAST + retry |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

Không có entity/schema change. Feature đọc trực tiếp `InventoryStockLedger` (entity + bảng `inventory_stock_ledger`) đã tồn tại từ W04 (`EP-INVENTORY-RECEIPT-V2`/`DELIVERY-V2`) và đã có 6 field số (`opening_qty/value`, `inbound_qty/value`, `outbound_qty/value`, `closing_qty/value` — theo naming cột thực tế trong data-model §4b.2) cần cho báo cáo NXT. Không cần Flyway migration mới.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `inventory_stock_ledger` | `idx_ledger_lookup` | `(tenant_id, product_id, warehouse_id, movement_date DESC)` | btree | Tái sử dụng — cùng index W06-STK-Q1 dùng cho point-lookup (Đầu/Cuối kỳ) VÀ range-scan (SUM Nhập/Xuất trong `[fromDate, toDate]`). Không cần index mới. | ADR-020 |

**DTO shapes** (`app/dto`, tham chiếu §6.1 request/response):

```
StockInoutSummarySearchRequest {
  fromDate: LocalDate           // default = ngày 01 tháng hiện tại
  toDate: LocalDate             // default = ngày cuối tháng hiện tại
  warehouseIds: List<Long>?     // null/empty = tất cả kho tenant
  keyword: String?              // ≤ 200 chars
  page: Integer = 0
  size: Integer = 20            // max 100
  sort: String = "productCode,asc"
}

StockInoutSummaryItem {
  productCode: String
  productName: String
  mainUnitCode: String
  warehouseCode: String
  warehouseName: String
  openingQty: BigDecimal(18,6)
  openingValue: BigDecimal(18,2)
  inboundQty: BigDecimal(18,6)
  inboundValue: BigDecimal(18,2)
  outboundQty: BigDecimal(18,6)
  outboundValue: BigDecimal(18,2)
  closingQty: BigDecimal(18,6)
  closingValue: BigDecimal(18,2)
}

StockInoutSummaryAggregates {
  totalOpeningQty, totalOpeningValue,
  totalInboundQty, totalInboundValue,
  totalOutboundQty, totalOutboundValue,
  totalClosingQty, totalClosingValue: BigDecimal
}
```

## 6. API contract delta (BE — REST + cross-boundary)

> **F-7 contract discipline**: 2 endpoint dưới đây grep-verbatim từ bundle §G (`✅ §0 Wave Index resolved for W06`), section token `§3g` (`gf-inventory-api.md`). KHÔNG suy diễn — cite trực tiếp.

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v1/stock/inout-summary/search` | JWT + `X-Tenant-Id` + `X-Branch-Id` | `StockInoutSummarySearchRequest` | `PagedApiResponse<StockInoutSummaryItem>` + `aggregates` | safe (read) | AC-1..AC-6 | — |
| GET | `/api/v1/stock/inout-summary/export` | JWT + `X-Tenant-Id` + `X-Branch-Id` | query params (mirror search filter) | binary `.xlsx` | safe (read) | AC-7 | — |

> **references_verbatim**: `{endpoint: "POST /api/v1/stock/inout-summary/search", source: "gf-inventory-api.md §3g (W06-STK-Q2)"}`, `{endpoint: "GET /api/v1/stock/inout-summary/export", source: "gf-inventory-api.md §3g (W06-STK-EX2)"}`.

### 6.2 Modified REST endpoints (additive)

_(không có — 2 endpoint hoàn toàn mới)_

### 6.3 Kafka topics (publish/consume)

_(không có — feature thuần đọc, không publish/consume event)_

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `POST /api/v1/stock/inout-summary/search` | `agg-garage-graph` (BFF passthrough GraphQL `stockInoutSummary`) | Khi FE Web mở/tương tác tab "Báo cáo NXT" | 4xx pass-through nguyên trạng; 5xx → BFF hiển thị lỗi generic | sync, fail fast |
| `GET /api/v1/stock/inout-summary/export` | `garage-web` (tải file trực tiếp qua REST, không qua GraphQL) | Khi user bấm nút "Xuất file" | 4xx/5xx → toast lỗi FE | sync, fail fast |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-IP-VIEW-V2.md`) sẽ wrap endpoint search thành GraphQL query `stockInoutSummary`. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `adapter/controller` | `src/main/java/.../adapter/controller/StockV2ReportController.java` | MODIFY (extend nếu đã tồn tại từ FEAT-STK-LIST-V2) hoặc NEW | thêm 2 endpoint mới | ~40 | AC-1, AC-7 |
| `app/dto` | `src/main/java/.../app/dto/StockInoutSummarySearchRequest.java` | NEW | request DTO | ~20 | AC-5 |
| `app/dto` | `src/main/java/.../app/dto/StockInoutSummaryItem.java` | NEW | response item DTO | ~25 | AC-2 |
| `app/dto` | `src/main/java/.../app/dto/StockInoutSummaryAggregates.java` | NEW | aggregates DTO | ~15 | AC-2 |
| `app/service` | `src/main/java/.../app/service/StockInoutSummaryQueryService.java` | NEW | query build + aggregation logic | ~120 | AC-3, AC-4, AC-6 |
| `app/service` | `src/main/java/.../app/service/StockInoutSummaryExportService.java` | NEW | `.xlsx` generation theo mẫu | ~90 | AC-7 |
| `domain/repository` | `src/main/java/.../domain/repository/InventoryStockLedgerRepository.java` | ADDITIVE | new finder cho range aggregation | ~15 | AC-3 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/InventoryStockLedgerJpaRepository.java` | ADDITIVE | native/JPQL query method | ~30 | AC-3, AC-6 |
| `test/unit` | `src/test/java/.../app/service/StockInoutSummaryQueryServiceTest.java` | NEW | test methods AC-3, AC-4, AC-6 | ~120 | AC-3, AC-4, AC-6 |
| `test/contract` | `src/test/java/.../adapter/controller/StockV2ReportControllerContractTest.java` | ADDITIVE | contract test cho 2 endpoint mới | ~60 | AC-1, AC-5, AC-7 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema (N/A — tái sử dụng inventory_stock_ledger)
    Entry: KG.entities stable (InventoryStockLedger đã có từ W04)
    Exit: xác nhận không cần migration
    └─► S2

S2  Repository + Service logic (query + aggregation + BR enforcement primary)
    Entry: S1
    Exit: unit test ≥6 green (AC-3, AC-4, AC-6)
    └─► S3

S3  REST adapter (controller: search + export)
    Entry: S2
    Exit: contract test green (AC-1, AC-5, AC-7, AC-8)
    └─► S4

S4  Integration test (cross-check số liệu khớp Q1/Q3 cùng nguồn sổ tồn)
    Entry: S3 + FEAT-STK-LIST-V2/FEAT-STK-DETAIL-V2 endpoints stable
    Exit: integ test green — reconciliation Q1 closingQty == Q2 closingQty tại cùng ngày
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Xác nhận không cần migration | — | KG stable | Confirmed no schema change | — |
| S2 | Query/aggregation service + BR enforcement | domain + app | S1 | Unit test ≥6 green | S1 |
| S3 | REST adapter (2 endpoint) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test (reconciliation) | test/integration | S3 + counterpart endpoints | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-STKV2-001` / `BR-STKV2-002` | CORNERSTONE | app/service (primary) | `app/service/StockInoutSummaryQueryService.java` | AC-1, AC-2, AC-3 | `TC-BR-gf-inventory-STKV2-001-*` |
| `BR-STKV2-003` / `BR-STKV2-004` | NORMAL | app/dto + app/service | `app/dto/StockInoutSummarySearchRequest.java`, `app/service/StockInoutSummaryQueryService.java` | AC-5, AC-6 | `TC-BR-gf-inventory-STKV2-003-*` |
| `BR-STKV2-005` | NORMAL | app/service | `app/service/StockInoutSummaryExportService.java` | AC-7 | `TC-BR-gf-inventory-STKV2-005-*` |
| `BR-STKV2-009` / `BR-STKV2-010` / `BR-STKV2-011` | CORNERSTONE | app/service (primary) | `app/service/StockInoutSummaryQueryService.java` | AC-3, AC-4, AC-6 | `TC-BR-gf-inventory-STKV2-009-*` |
| `BR-STKV2-015` | NORMAL | adapter/config (Spring Security) | `adapter/config/SecurityConfig.java` | AC-8 | `TC-BR-gf-inventory-STKV2-015-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement → đó là FE/Mobile tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract | test-api | default filter khi request bỏ trống fromDate/toDate |
| AC-3 | Unit (calc) + reconciliation | test-api | so khớp Đầu/Cuối kỳ Q2 với closingQty/Value Q1 cùng ngày |
| AC-4 | Unit (calc) | test-api | pre-PWA vs post-PWA outboundValue/closingValue |
| AC-5 | API contract (negative) | test-api | validate toDate < fromDate, keyword quá dài, sort ngoài whitelist |
| AC-6 | API contract | test-api | filter điều kiện hiển thị mã (phát sinh HOẶC tồn ≠ 0), empty state 0 rows |
| AC-7 | API contract (export) | test-api | verify sheet name/cột/thứ tự/format khớp mẫu `Báo cáo nhập xuất tồn.xlsx` |
| AC-8 | Isolation (RBAC) | test-isolation | cả 2 persona (`garage-owner`, `accountant`) truy cập thành công ngang nhau |

## 11. Cross-tier coordination (BE perspective)

> Cross-link sang các tier file khác cùng `FEAT-IP-VIEW-V2`. Reviewer items 15-18 enforce consistency.
>
> **NEED CONFIRMATION**: Context Bundle `add_fields` truyền `paired_bff_feats: []` và `paired_fe_web_feats: []`, nhưng bundle §G + §H (BFF passthrough GraphQL `stockInoutSummary` tại `agg-garage-graph-graphql.md §3j`, FE Web consumer list tại §3g header) xác nhận rõ FEAT-IP-VIEW-V2 CÓ BFF touchpoint và FE Web touchpoint. Author đã điền `["FEAT-IP-VIEW-V2"]` cho 2 field này theo bằng chứng bundle, lệch với giá trị mặc định trong Context Bundle — flag cho reviewer/orchestrator xác nhận lại fan-out map. `paired_mobile_feats: []` giữ nguyên vì đúng platform scope (Web GMS only, source FEAT §Metadata + §7 Out of Scope).

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-IP-VIEW-V2.md` | PENDING (Batch C song song) | Resolver wrap `POST /api/v1/stock/inout-summary/search` thành GraphQL query `stockInoutSummary` |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-IP-VIEW-V2.md` | PENDING (Batch D song song) | UI consume BFF op `stockInoutSummary`; export dùng REST export endpoint trực tiếp |
| Mobile | N/A | N/A | Web GMS only trong W06 — mobile hub tile "Tồn kho" chỉ mở `FEAT-STK-LIST-V2` (Q1) |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e`.

## 12. References

- **Source**: [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) v10
- **Parent EP**: [`EP-INVENTORY-STOCK-V2.md`](../../epics/EP-INVENTORY-STOCK-V2.md) (converted)
- **BR refs**: [`BR-GF-INVENTORY-STOCK-V2.md`](../../business-rules/BR-GF-INVENTORY-STOCK-V2.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3g (W06-STK-Q2, W06-STK-EX2)
- **Integration**: [`Architecture/integrations/`](../../../../../Architecture/integrations/) — không có cross-boundary REST consumer cho feature này
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v46
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-IP-VIEW-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map 8/8 AC-ID, §4 ràng buộc + error code, §5-§11 BE-specific (không có schema/migration mới — pure read report reuse `inventory_stock_ledger` W04; 2 REST endpoint mới search+export; BR SSOT primary tại app/service; test hand-off; cross-tier pair BFF/FE-web). Source FEAT chỉ audit.
