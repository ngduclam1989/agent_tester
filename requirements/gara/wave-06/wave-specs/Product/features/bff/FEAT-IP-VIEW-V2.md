---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-IP-VIEW-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-IP-VIEW-V2"
source_feat_sha: "1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e"
generated_at: "2026-07-31T06:31:29+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["stockInoutSummary", "stockInoutSummaryExport"]
paired_backend_feats: ["FEAT-IP-VIEW-V2"]
paired_fe_web_feats: ["FEAT-IP-VIEW-V2"]
paired_mobile_feats: []
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A — not provided in Context Bundle"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-IP-VIEW-V2.bff.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-IP-VIEW-V2 (BFF): Báo cáo Nhập-Xuất-Tồn (NXT)

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IP-VIEW-V2` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `stockInoutSummary` (query), `stockInoutSummaryExport` (query) |
| Cross-tier pair | BE: `FEAT-IP-VIEW-V2` \| Web: `FEAT-IP-VIEW-V2` \| Mobile: N/A (web-only per platform scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-IP-VIEW-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) |
| Source version | v10 |
| Source SHA | `1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần xem biến động và số dư tồn kho của từng mã sản phẩm theo khoảng ngày tùy chọn — tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ — để phục vụ đối soát cuối tháng và ra quyết định nhập hàng. Đây là 1 trong 3 báo cáo tồn kho V2 (cùng với "tồn đến ngày" và "thẻ kho"), đọc realtime từ sổ tồn để đảm bảo số liệu nhất quán giữa các báo cáo. Feature này thay thế báo cáo NXT bản cũ (`FEAT-IP-VIEW`) đã production, chuyển sang mô hình đọc trực tiếp sổ tồn thay vì tổng hợp chi tiết phiếu.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 GraphQL query mới: `stockInoutSummary` (paged report) và `stockInoutSummaryExport` (xuất file `.xlsx`) — thuộc module Stock V2 Reports (`agg-garage-graph-graphql.md §3j`).
- Resolver pattern: **passthrough thuần** — không orchestrate, không aggregate, không cache. Backend authority = `gf-inventory` (SSOT tính toán các cột SL/GT + dòng Tổng).
- Downstream BE endpoint: `POST /api/v1/stock/inout-summary/search` (W06-STK-Q2) cho query chính; `GET /api/v1/stock/inout-summary/export` (W06-STK-EX2) cho export.
- Không cần DataLoader/batching — mỗi request là 1 call passthrough duy nhất tới downstream (không có N+1 pattern trong report row-level).
- Cache strategy: **KHÔNG cache** — dữ liệu realtime từ sổ tồn (mirror BE "KHÔNG BFF cache, KHÔNG BE cache" semantic).
- Auth header propagate downstream: `Authorization`, `X-Tenant-Id`, `X-Branch-Id` — BE gate bằng `@FeatureOn(Inventory:InventoryV2)`; flag OFF → BE trả 403 `FORBIDDEN` → BFF map `FORBIDDEN_ERROR`.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage: 8/8 AC-ID (bundle §C).

### Cluster A — Mở màn + hiển thị báo cáo

#### AC-1 → BFF phải expose query đọc report với input range ngày

- **Khi**: FE gửi query `stockInoutSummary(input: StockInoutSummaryInput!)` khi mở màn (mặc định range = tháng hiện tại, tính toán ở FE).
- **BFF phải**: Passthrough `input.fromDate` + `input.toDate` (bắt buộc trong SDL, `Date!`) sang REST body `POST /api/v1/stock/inout-summary/search`.
- **Downstream**: `POST /api/v1/stock/inout-summary/search` (gf-inventory, W06-STK-Q2).
- **Output shape**: `PagedStockInoutSummaryApiResponse` → `data.content[]` + `data.aggregates`.
- **Failure mode**: 400 `ERR-CMN-validation` (fromDate/toDate malformed hoặc `toDate < fromDate`) → GraphQL `BAD_USER_INPUT`.
- **Ref**: op `stockInoutSummary` (§6.1), resolver `src/resolvers/inventory/stockInoutSummary.ts` (§6.2), paired BE FEAT-IP-VIEW-V2 §6 (`W06-STK-Q2`).

#### AC-2 → SDL type phải expose đủ cột (không rename)

- **Khi**: FE render bảng báo cáo.
- **BFF phải**: Định nghĩa `StockInoutSummaryRow` với field names khớp verbatim canonical `gf-inventory-api.md §5.2` (`productCode`, `productName`, `mainUnitCode`, `warehouseCode`, `warehouseName`, `openingQty`, `openingValue`, `inboundQty`, `inboundValue`, `outboundQty`, `outboundValue`, `closingQty`, `closingValue`) — KHÔNG rename field ở BFF layer (Naming Registry discipline).
- **Downstream**: field mapping 1:1 từ REST `content[]`.
- **Output shape**: `StockInoutSummaryRow!` — 13 field (5 dimension + 8 numeric 4-nhóm × 2).
- **Failure mode**: N/A (schema-level, không runtime error).
- **Ref**: SDL §5.1, resolver `stockInoutSummary.ts`, Naming Registry `gf-inventory-api.md §5.2`.

#### AC-3 → BFF KHÔNG tính lại công thức cột — passthrough giá trị BE-computed

- **Khi**: FE hiển thị số liệu SL/GT của từng cột.
- **BFF phải**: Forward giá trị `openingQty/Value`, `inboundQty/Value`, `outboundQty/Value`, `closingQty/Value` nguyên trạng — KHÔNG recompute, KHÔNG round lại, KHÔNG mutate ở resolver layer. Công thức tính SSOT tại `gf-inventory` BE.
- **Downstream**: `POST /api/v1/stock/inout-summary/search`.
- **Output shape**: `StockInoutSummaryRow` numeric fields (Decimal string passthrough).
- **Failure mode**: N/A.
- **Ref**: resolver `stockInoutSummary.ts`, paired BE FEAT-IP-VIEW-V2 §6.

#### AC-4 → BFF passthrough Giá trị (GT) theo BQGQ nguyên trạng

- **Khi**: Kỳ chưa chạy BQGQ (pre-PWA) → `outboundValue` = 0 theo BE computation (BR-STKV2-011).
- **BFF phải**: KHÔNG áp business logic bù trừ hay ẩn field khi giá trị = 0 — trả nguyên `outboundValue: "0"` như BE trả về.
- **Downstream**: `POST /api/v1/stock/inout-summary/search`.
- **Output shape**: `StockInoutSummaryRow.outboundValue`.
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-011, resolver `stockInoutSummary.ts`.

### Cluster B — Bộ lọc + tách dòng theo kho

#### AC-5 → BFF phải map input filter 1:1 xuống REST body

- **Khi**: FE gửi filter `warehouseIds`, `keyword`, `fromDate`, `toDate`, `page`, `size`, `sort` qua `StockInoutSummaryInput`.
- **BFF phải**: Forward `input.warehouseIds: [Int!]` verbatim thành JSON array trong body (v67 transport: `[Int!]` GraphQL → JSON array, KHÔNG multi-value query param); forward `keyword`/`page`/`size`/`sort` nguyên trạng; `warehouseIds` rỗng/omit = "tất cả kho tenant" (không set field hoặc gửi `[]`, theo BE default).
- **Downstream**: `POST /api/v1/stock/inout-summary/search` body.
- **Output shape**: filtered `content[]` + `totalElements`/`totalPages`/`page`/`size`.
- **Failure mode**: 400 `ERR-CMN-validation` (`size > 100`, `sort` ngoài whitelist, `keyword > 200 chars`) → `BAD_USER_INPUT`.
- **Ref**: SDL `StockInoutSummaryInput` (§5.1), resolver `stockInoutSummary.ts`.

#### AC-6 → BFF KHÔNG gộp dòng theo kho — passthrough per-row

- **Khi**: 1 mã sản phẩm có tồn ở nhiều kho.
- **BFF phải**: Trả `content[]` với mỗi (mã + kho) là 1 row riêng biệt — KHÔNG group/merge ở resolver layer (BE đã split sẵn, BFF chỉ forward mảng).
- **Downstream**: `POST /api/v1/stock/inout-summary/search`.
- **Output shape**: `content: [StockInoutSummaryRow!]!` — mỗi element có `warehouseCode`/`warehouseName` riêng.
- **Failure mode**: N/A.
- **Ref**: resolver `stockInoutSummary.ts`, BE §5.4.2/§5.4.3 row-splitting semantic.

## Cluster C — Xuất file + phân quyền

#### AC-7 → BFF phải expose query export xuất file `.xlsx`

- **Khi**: FE gọi query `stockInoutSummaryExport` khi bấm nút "Xuất file".
- **BFF phải**: Forward filter (`fromDate`, `toDate`, `warehouseIds`, `keyword`, `sort` — không có `page`/`size`, export toàn bộ scope) sang REST GET query string; nhận base64 payload trả nguyên trạng — KHÔNG decode/transform binary ở BFF.
- **Downstream**: `GET /api/v1/stock/inout-summary/export?fromDate=&toDate=&warehouseIds=&keyword=&sort=` (gf-inventory, W06-STK-EX2).
- **Output shape**: `StockReportExportApiResponse` → `data: StockReportExportPayload` (`contentType`, `fileName`, `contentBase64`, `contentLength`).
- **Failure mode**: lỗi downstream (400/403/5xx) map tương tự AC-1/AC-5 → GraphQL error tương ứng.
- **Ref**: op `stockInoutSummaryExport` (§6.1), resolver `src/resolvers/inventory/stockInoutSummaryExport.ts` (§6.2), paired BE FEAT-IP-VIEW-V2 §6 (`W06-STK-EX2`).

#### AC-8 → BFF KHÔNG áp field-level RBAC — chỉ propagate auth header

- **Khi**: Cả `garage-owner` và `accountant` cùng gọi `stockInoutSummary`/`stockInoutSummaryExport`.
- **BFF phải**: Propagate `Authorization` + `X-Tenant-Id` + `X-Branch-Id` xuống downstream nguyên trạng, KHÔNG filter theo role vì cả 2 persona có quyền ngang nhau (BR-STKV2-015) — permission check thực hiện tại BE (feature-flag `Inventory:InventoryV2` + JWT role validity), không phải RBAC field-level ở BFF.
- **Downstream**: `POST /api/v1/stock/inout-summary/search` + `GET .../export`.
- **Output shape**: N/A (auth passthrough, không transform data).
- **Failure mode**: BE trả 403 `FORBIDDEN` khi feature flag OFF hoặc tenant mismatch → BFF map `FORBIDDEN_ERROR`.
- **Ref**: BR-STKV2-015, §4.1 Auth header propagation.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver (`stockInoutSummary`, `stockInoutSummaryExport`) propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id` xuống downstream REST — không tự chế thêm header.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Không có DataLoader/batching pattern cho module này — mỗi resolver là 1 REST call duy nhất (list report đã paginate + aggregate server-side tại BE).
- KHÔNG set `@cacheControl(maxAge: N)` > 0 — dữ liệu realtime, mọi request phải hit downstream fresh (mirror BE "KHÔNG BFF cache" semantic §2).
- Không có persisted query whitelist cho module này trong W06 (báo cáo có filter combination lớn, ad-hoc query hợp lệ).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / payment token trong resolver.
- KHÔNG field-level RBAC riêng — cả `garage-owner` và `accountant` xem full field set (BR-STKV2-015).
- Tenant scope lấy từ header `X-Tenant-Id` (server-derived từ JWT context), KHÔNG lấy từ client-controlled arg trong `StockInoutSummaryInput`.

### 4.4 Contract stability

- Schema additive only. `StockInoutSummaryRow`/`StockInoutSummaryAggregates`/`StockReportExportPayload` là type mới, không có field cần deprecate trong W06.
- Breaking change (rename/xóa field) → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| 400 `ERR-CMN-validation` | `BAD_USER_INPUT` | AC-1, AC-5 |
| 401 (missing/invalid `Authorization`) | `UNAUTHENTICATED` | AC-8 |
| 403 `FORBIDDEN` (tenant mismatch hoặc `Inventory:InventoryV2` flag OFF) | `FORBIDDEN_ERROR` | AC-8 |
| 404 (warehouse ID không tồn tại tenant scope) | `NOT_FOUND` | AC-5 |
| 500 / 504 (unexpected / downstream timeout) | `INTERNAL_SERVER_ERROR` | AC-1, AC-7 |

> Error taxonomy suy ra từ pattern module `StockV2Report` cùng subsystem (§3g.2 coverage rule khẳng định "response shape align verbatim" giữa Q1/Q2/Q3 và exports) — mirror bảng 4xx/5xx đã xác nhận verbatim cho `W06-STK-Q1` trong bundle §G. Full bảng chi tiết cho `W06-STK-Q2`/`EX2` là authoritative tại `gf-inventory-api.md §3g.2 W06-STK-Q2` / `W06-STK-EX2` — dev verify lại khi impl (không phải hallucination endpoint, chỉ suy luận taxonomy pattern trong cùng subsystem).

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `StockInoutSummaryRow` | type | `productCode: String!`, `productName: String!`, `mainUnitCode: String!`, `warehouseCode: String!`, `warehouseName: String!`, `openingQty: Decimal!`, `openingValue: Decimal!`, `inboundQty: Decimal!`, `inboundValue: Decimal!`, `outboundQty: Decimal!`, `outboundValue: Decimal!`, `closingQty: Decimal!`, `closingValue: Decimal!` | NO (new) | AC-2, AC-3, AC-4, AC-6 |
| `StockInoutSummaryAggregates` | type | `totalOpeningQty: Decimal!`, `totalOpeningValue: Decimal!`, `totalInboundQty: Decimal!`, `totalInboundValue: Decimal!`, `totalOutboundQty: Decimal!`, `totalOutboundValue: Decimal!`, `totalClosingQty: Decimal!`, `totalClosingValue: Decimal!` | NO (new) | AC-2 |
| `StockInoutSummaryInput` | input | `fromDate: Date!`, `toDate: Date!`, `warehouseIds: [Int!]`, `keyword: String`, `page: Int = 0`, `size: Int = 20`, `sort: String = "productCode,asc"` | NO (new) | AC-1, AC-5 |
| `StockInoutSummaryExportInput` | input | `fromDate: Date!`, `toDate: Date!`, `warehouseIds: [Int!]`, `keyword: String`, `sort: String = "productCode,asc"` | NO (new) | AC-7 |
| `PagedStockInoutSummaryApiResponse` | type | `data: PagedStockInoutSummaryData` | NO (new) | AC-1 |
| `PagedStockInoutSummaryData` | type | `content: [StockInoutSummaryRow!]!`, `aggregates: StockInoutSummaryAggregates!`, `totalElements: Int!`, `totalPages: Int!`, `page: Int!`, `size: Int!` | NO (new) | AC-1, AC-2 |
| `StockReportExportPayload` | type (shared module-wide) | `contentType: String!`, `fileName: String!`, `contentBase64: String!`, `contentLength: Int!` | NO (new, shared với Q1/Q3 export — KHÔNG re-declare nếu đã tạo bởi FEAT-STK-LIST-V2 bff tier spec) | AC-7 |
| `StockReportExportApiResponse` | type (shared module-wide) | `data: StockReportExportPayload` | NO (new, shared) | AC-7 |

> **Shared-type coordination**: `StockReportExportPayload`/`StockReportExportApiResponse` dùng chung cho cả 3 report export (Q1/Q2/Q3). Impl chỉ add 1 lần trong schema — dev cross-check với `features/bff/FEAT-STK-LIST-V2.md` (nếu đã ACTIVE) trước khi tạo duplicate declaration.

### 5.2 Modified types (additive — backward-compat)

_(không có — module Stock V2 Reports là capability mới W06, không sửa type cũ)._

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `stockInoutSummary` | query | `input: StockInoutSummaryInput!` | `PagedStockInoutSummaryApiResponse!` | JWT + tenantId + branchId (dual persona) | AC-1..AC-6 |
| `stockInoutSummaryExport` | query | `input: StockInoutSummaryExportInput!` | `StockReportExportApiResponse!` | JWT + tenantId + branchId (dual persona) | AC-7 |

> `stockInoutSummaryExport` dùng dedicated input type `StockInoutSummaryExportInput` (ratified verbatim, `agg-garage-graph-graphql.md:51338,51351-51357`, v7.75) — KHÔNG phải direct scalar args rời. Field trùng với `StockInoutSummaryInput` trừ `page`/`size` (export toàn bộ scope filtered, không phân trang) — derive trực tiếp từ REST query params verbatim (`gf-inventory-api.md §3g.1 W06-STK-EX2`), KHÔNG hallucinate endpoint mới.

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `stockInoutSummary` | `src/resolvers/inventory/stockInoutSummary.ts` | `FEAT-IP-VIEW-V2` (BE §6, `W06-STK-Q2`) | `POST /api/v1/stock/inout-summary/search` | — (no batching, direct passthrough) | AC-1..AC-6 |
| `stockInoutSummaryExport` | `src/resolvers/inventory/stockInoutSummaryExport.ts` | `FEAT-IP-VIEW-V2` (BE §6, `W06-STK-EX2`) | `GET /api/v1/stock/inout-summary/export` | — | AC-7 |

### 6.3 DataLoader / batching strategy

_(không có — không có N+1 pattern trong module này; mỗi query là 1 call passthrough duy nhất tới report endpoint đã paginate/aggregate ở BE)._

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `stockInoutSummary` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Realtime read — KHÔNG BFF cache (mirror BE "KHÔNG cache" semantic §2) |
| `stockInoutSummaryExport` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Binary export, không cache |

### 6.5 Persisted query allowlist (nếu enable)

_(không dùng persisted query cho module Stock V2 Reports trong W06 — filter combination lớn, ad-hoc query hợp lệ)._

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/inventory.graphql` | MODIFY (additive) | extend SDL §3j types + ops | ~90 | AC-1..AC-7 |
| `resolvers/` | `src/resolvers/inventory/stockInoutSummary.ts` | NEW | passthrough resolver pattern | ~35 | AC-1..AC-6 |
| `resolvers/` | `src/resolvers/inventory/stockInoutSummaryExport.ts` | NEW | passthrough resolver pattern (binary) | ~30 | AC-7 |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | new methods `getStockInoutSummary`, `exportStockInoutSummary` | ~30 | AC-1..AC-7 |
| `tests/integration` | `tests/integration/inventory/stockInoutSummary.test.ts` | NEW | apollo test client | ~60 | AC-1..AC-6 |
| `tests/contract` | `tests/contract/inventory/stockInoutSummary-contract.test.ts` | NEW | schema contract | ~30 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green — `gf-inventory` W06-STK-Q2/EX2 endpoints stable). BFF S5 exit hand-off S6 cho FE Web (khi FE-web tier spec cho FEAT-IP-VIEW-V2 được author).

```
(← BE tier S4: gf-inventory W06-STK-Q2/EX2 integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-IP-VIEW-V2 §6 (W06-STK-Q2/EX2) contracts stable
    Exit: BFF contract test green (SDL snapshot + cache directive)
    └─► (hand-off FE Web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | schema + resolvers + data-sources | BE FEAT-IP-VIEW-V2 §6 stable | BFF contract test green | BE FEAT-IP-VIEW-V2 S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce:
> - Auth context propagation (tenant/branch header, không field-level RBAC)
> - Schema-level constraints (required fields trong `StockInoutSummaryInput`)
> - No-cache directive (realtime semantic)

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-015` | CORNERSTONE | Không filter theo role — propagate auth header nguyên trạng, để BE quyết định | `resolvers/inventory/stockInoutSummary.ts`, `stockInoutSummaryExport.ts` | AC-8 | Dual persona (`garage-owner` + `accountant`) quyền ngang nhau |
| Tenant isolation (Critical Rule #4) | CORNERSTONE | Header `X-Tenant-Id` derive từ JWT context, không nhận từ client arg | mọi resolver §6.2 | AC-1, AC-5, AC-8 | Server-side derive, không client-controlled |
| `BR-STKV2-011` | NORMAL | Passthrough only — KHÔNG suy luận/tính lại giá trị 0 pre-PWA | `resolvers/inventory/stockInoutSummary.ts` | AC-4 | Giá trị GT xuất = 0 pre-PWA là BE-computed |

> **Primary BR enforcement** = BE tier. Xem `Execution/wave-specs/W06/Product/features/be/FEAT-IP-VIEW-V2.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1, AC-5 | BFF contract (schema, filter args mapping) | test-api | snapshot SDL `StockInoutSummaryInput`/`Row`; verify `warehouseIds` JSON-array forward |
| AC-2, AC-3, AC-4, AC-6 | BFF integration (resolver → BE) | test-api | mock downstream `gf-inventory`, verify field passthrough không mutate |
| AC-7 | BFF integration (export passthrough) | test-api | mock downstream export, verify base64 payload không transform |
| AC-8 | BFF auth (dual persona) | test-isolation | cả 2 persona đều access được, verify header propagation |
| — | No-cache guard | test-api | assert `@cacheControl(maxAge: 0)` directive present |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-IP-VIEW-V2.md` | (xem file BE — spawn song song trong batch W06) | Downstream REST endpoints `W06-STK-Q2`/`W06-STK-EX2` (§6) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-IP-VIEW-V2.md` | (xem file FE Web — spawn song song trong Batch D W06, `has_ui_touchpoint=true` per PKG §1 "3 report routes" trên `garage-web`) | Consume GraphQL ops `stockInoutSummary`/`stockInoutSummaryExport` từ §6.1 |
| Mobile | — | N-A (out-of-scope — FEAT-IP-VIEW-V2 web-only per PKG platform scope, mobile chỉ `FEAT-STK-LIST-V2` Q1) | Không cần pairing |

**Source ID consistency** (item 18): `source_feat_sha` = `1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e` — phải identical với BE tier file khi được author.

## 12. References

- **Source**: [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) v10
- **Paired BE**: [`features/be/FEAT-IP-VIEW-V2.md`](../be/FEAT-IP-VIEW-V2.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3j`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **Downstream API (gf-inventory)**: [`Architecture/api/gf-inventory-api.md §3g, §5.2`](../../../../../Architecture/api/gf-inventory-api.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa sai arg-shape của `stockInoutSummaryExport`** — spec cũ khai 5 scalar arg rời (`fromDate, toDate, warehouseIds, keyword, sort`) thay vì ratified `input: StockInoutSummaryExportInput!` (`agg-garage-graph-graphql.md:51338,51351-51357`, v7.75). Thêm row type mới §5.1, sửa §6.1 args column. Root cause: bundle §G truncate, không có nghĩa endpoint thiếu type. Đồng bộ `version` frontmatter khớp Change Log. Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-IP-VIEW-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough thuần, no-cache), §3 BFF behaviour map cover 8/8 AC-ID, §4 auth + perf + cache + error mapping, §5-§11 BFF-specific (SDL types `StockInoutSummaryRow`/`Aggregates`/`Input`, ops `stockInoutSummary`/`stockInoutSummaryExport`, resolver/file map, cross-tier pair — FE Web chưa spawn trong batch W06). Source FEAT chỉ audit. |
