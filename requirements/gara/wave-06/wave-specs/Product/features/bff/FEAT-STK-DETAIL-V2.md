---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-DETAIL-V2.md"
source_version: 16
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-DETAIL-V2"
source_feat_sha: "1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7"
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
graphql_ops: ["stockCardDetail", "stockCardDetailExport"]
paired_backend_feats: ["FEAT-STK-DETAIL-V2"]
paired_fe_web_feats: ["FEAT-STK-DETAIL-V2"]
paired_mobile_feats: []
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A (not provided by orchestrator context bundle — no shasum tool available to author)"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-DETAIL-V2.bff.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-DETAIL-V2 (BFF): Thẻ kho theo mã

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-DETAIL-V2` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `stockCardDetail` (query), `stockCardDetailExport` (query) |
| Cross-tier pair | BE: `FEAT-STK-DETAIL-V2` \| Web: — (không có trong fanout map wave này) \| Mobile: — (out of scope, web-only feature) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-DETAIL-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) |
| Source version | v16 |
| Source SHA | `1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần truy vết chính xác dòng chảy nhập/xuất và số dư tồn của một mã sản phẩm tại một kho cụ thể trong một khoảng ngày, phục vụ đối soát kiểm kê và giải trình số liệu khi có sai lệch. Thẻ kho là báo cáo drill-down từ báo cáo tồn tổng quan, hiển thị realtime từng phiếu nhập/xuất đã ghi sổ kèm số dư chạy (running balance) theo đúng trình tự thời gian. Giá trị các dòng xuất phản ánh đúng phương pháp Bình quân gia quyền cuối kỳ (BQGQ) sau khi PRC đã chạy, giúp người dùng nắm rõ nguyên nhân biến động giá trị tồn kho theo từng giao dịch.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 GraphQL query mới trong domain Stock V2 Reports (`agg-garage-graph-graphql.md §3j`): `stockCardDetail` (Q3) và `stockCardDetailExport` (EX3).
- Resolver là **passthrough thuần** — KHÔNG orchestrate, KHÔNG aggregate nhiều downstream call, KHÔNG cache business data.
- Consume downstream `gf-inventory` public REST: `POST /api/v1/stock/card/search` (paginated `content[]` + `context` + `opening` + `aggregates`) và `GET /api/v1/stock/card/export` (xuất `.xlsx` base64).
- KHÔNG cần DataLoader/batching — BE đã denormalize `productName`/`warehouseName`/`mainUnitCode` ngay trong response row, không phát sinh N+1 nested resolver.
- KHÔNG cache response (`@cacheControl(maxAge: 0, scope: PRIVATE)`) — data realtime theo BR-STKV2-001/012.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id` xuống downstream; forward nguyên trạng feature-flag gate `Inventory:InventoryV2` (BE trả 403 khi tenant chưa bật — BFF chỉ map lỗi, không tự kiểm tra flag).

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage: 8/8 source AC-ID.

### Cluster A — Truy vấn thẻ kho (page load)

#### AC-1 → Query `stockCardDetail` cấp data cho full-page (đổi từ popup)

- **Khi**: FE mở route full-page "Thẻ kho" (v7 — đổi từ popup) và gọi query `stockCardDetail(input: StockCardDetailInput!)`.
- **BFF phải**: passthrough input `{productCode, warehouseCode, fromDate, toDate, page, size}` xuống REST; trả nguyên response gồm `context` (để FE render header mã+kho không cần round-trip khác), `opening`, `content[]`, `aggregates`.
- **Downstream**: `gf-inventory POST /api/v1/stock/card/search` (W06-STK-Q3).
- **Output shape**: `PagedStockCardDetailApiResponse.data.{context, opening, content[], aggregates, totalElements, totalPages, page, size}`.
- **Failure mode**: 400 → `BAD_USER_INPUT`; 403 (tenant mismatch/feature flag off) → `FORBIDDEN_ERROR`; 404 (warehouse không thuộc tenant) → `NOT_FOUND`.
- **Ref**: op `stockCardDetail` (§6.1), resolver `src/resolvers/stock-v2/stockCardDetail.ts` (§6.2), paired BE `FEAT-STK-DETAIL-V2` §6 (W06-STK-Q3).

### Cluster B — Cột hiển thị & running balance

#### AC-2 → Cột hiển thị — SDL field mapping đầy đủ

- **Khi**: FE render bảng thẻ kho với cột Ngày / Mã phiếu / Loại phiếu / Đầu kỳ SL+GT / Nhập SL+GT / Xuất SL+GT / Cuối kỳ SL+GT.
- **BFF phải**: expose type `StockCardDetailRow` với đủ field canonical (`movementDate, slipCode, slipType, openingQty, openingValue, inboundQty, inboundValue, outboundQty, outboundValue, closingQty, closingValue`) — KHÔNG rename, KHÔNG bớt field so với Naming Registry `gf-inventory-api.md §5.2`.
- **Downstream**: field-for-field passthrough từ `content[]` response REST.
- **Output shape**: `content: [StockCardDetailRow!]!`.
- **Failure mode**: N/A (schema-level contract).
- **Ref**: SDL `StockCardDetailRow` (§5.1), Naming Registry `gf-inventory-api.md §5.2`.

#### AC-3 → Mỗi dòng = 1 phiếu, chạy running

- **Khi**: FE cần running balance per-row (đầu kỳ dòng sau = cuối kỳ dòng trước).
- **BFF phải**: KHÔNG tự tính running balance ở resolver — BE đã compute per-row `openingQty/openingValue` trong RAM cho toàn filtered range trước khi cắt trang (pagination-safe, v7.79). BFF chỉ forward nguyên `content[]` đúng thứ tự BE trả về — KHÔNG re-sort ở BFF layer.
- **Downstream**: `content[].openingQty/openingValue` (v7.79 BE-computed, seed từ ledger point-lookup cho dòng đầu).
- **Output shape**: giống `StockCardDetailRow`.
- **Failure mode**: N/A.
- **Ref**: SDL `StockCardDetailRow.openingQty/openingValue` field comment (§5.1).

#### AC-4 → Đầu kỳ dòng đầu — object `opening` luôn trả

- **Khi**: FE cần hiển thị dòng "Đầu kỳ" tổng quát, kể cả khi không có phát sinh trong khoảng ngày.
- **BFF phải**: forward object `opening: StockCardDetailOpening!` non-null luôn — KHÔNG omit hay conditional theo `content[]` rỗng.
- **Downstream**: response REST luôn có field `opening` (BE guarantee empty-movement case vẫn populate).
- **Output shape**: `data.opening.{openingQty, openingValue}`.
- **Failure mode**: N/A.
- **Ref**: SDL `StockCardDetailOpening` (§5.1).

### Cluster C — Giá trị BQGQ & dòng tổng

#### AC-5 → Giá trị theo BQGQ

- **Khi**: sau khi PRC (BQGQ) chạy xong, giá vốn phiếu xuất + giá trị sổ tồn được cập nhật.
- **BFF phải**: forward nguyên `Decimal` giá trị đã BE-compute — KHÔNG làm tròn / KHÔNG tính lại ở resolver layer (giá trị BQ đã round scale=2 ở BE per BR-PRC-013).
- **Downstream**: `content[].outboundValue`/`closingValue` phản ánh giá vốn PWA sau PRC.
- **Output shape**: `StockCardDetailRow.{outboundValue, closingValue}` type `Decimal`.
- **Failure mode**: N/A.
- **Ref**: SDL field comment (§5.1); mirror semantic PRC `averageUnitPrice` (§3f.1).

#### AC-6 → Dòng tổng — object `aggregates` luôn trả

- **Khi**: FE render dòng "Tổng" ở chân bảng.
- **BFF phải**: forward `aggregates: StockCardDetailAggregates!` non-null luôn (kể cả empty-movement) — BE-computed SUM trên full filtered range trước pagination.
- **Downstream**: response REST field `aggregates`.
- **Output shape**: `data.aggregates.{openingQty, openingValue, totalInboundQty, totalInboundValue, totalOutboundQty, totalOutboundValue, closingQty, closingValue}`.
- **Failure mode**: N/A.
- **Ref**: SDL `StockCardDetailAggregates` (§5.1).

### Cluster D — Xuất file & phân quyền

#### AC-7 → Xuất file

- **Khi**: FE bấm nút "Xuất file" trên màn thẻ kho.
- **BFF phải**: expose query `stockCardDetailExport(input: StockCardDetailExportInput!)` passthrough sang REST GET export; forward base64 payload nguyên trạng — KHÔNG re-encode, KHÔNG stream-transform ở BFF.
- **Downstream**: `gf-inventory GET /api/v1/stock/card/export` (W06-STK-EX3, template `Báo cáo thẻ kho.xlsx`).
- **Output shape**: `StockReportExportApiResponse.data.{contentType, fileName, contentBase64, contentLength}`.
- **Failure mode**: 400/403/500 map như AC-1; export payload lớn → resolver timeout phải ≥ timeout downstream export endpoint (xem §4.2).
- **Ref**: op `stockCardDetailExport` (§6.1), SDL `StockReportExportPayload` (§5.1 — shared type, kiểm tra đã tạo bởi FEAT-STK-LIST-V2/FEAT-IP-VIEW-V2 BFF spec trước khi thêm mới).

#### AC-8 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: cả 2 persona `garage-owner` và `accountant` gọi `stockCardDetail`/`stockCardDetailExport`.
- **BFF phải**: KHÔNG thêm field-level RBAC hay role-gating riêng ở resolver/schema — schema visible identical cho cả 2 persona; chỉ verify JWT hợp lệ + tenant match (như mọi authenticated op khác). RBAC primary enforcement ở BE (`authenticated + tenant + branch`, không phân biệt role).
- **Downstream**: N/A (BE không phân biệt role trong response).
- **Output shape**: N/A.
- **Failure mode**: 401 `UNAUTHENTICATED` nếu JWT invalid; KHÔNG có 403 role-based (chỉ 403 tenant-mismatch/feature-flag).
- **Ref**: BR-STKV2-015, §4.1 Auth header propagation.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- **Lưu ý**: subsystem này dùng **user JWT** (`authenticated + tenant + branch`) — KHÔNG phải `x-api-key` S2S (đó là subsystem PRC-facing riêng biệt cho `gf-accounting` caller, không liên quan Stock V2 Reports).
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- KHÔNG cần DataLoader — BE denormalize `productName`/`warehouseName`/`mainUnitCode` ngay trong response row, không có nested resolver cần batch.
- Cache: `@cacheControl(maxAge: 0, scope: PRIVATE)` cho cả 2 op — data realtime, KHÔNG cache theo BR-STKV2-001/012.
- Export (`stockCardDetailExport`) trả payload base64 `.xlsx` có thể lớn — resolver timeout phải ≥ timeout HTTP client downstream export endpoint (theo `Architecture/TECHSTACK.md §http-client`), tránh BFF timeout sớm hơn BE khi file lớn.
- Persisted query allowlist: chưa enable cho W06 (N/A).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / card data trong resolver.
- Tenant scope lấy từ `X-Tenant-Id` header (JWT-derived context) — KHÔNG cho phép client override qua GraphQL argument.
- `warehouseCode` (Q3 drill-down arg, business code — khác `warehouseIds` numeric dùng ở Q1/Q2) không phải PII nhưng vẫn phải qua tenant-scope check ở BE; BFF chỉ forward, không tự validate ownership.

### 4.4 Contract stability

- Schema additive only. Types `StockCardDetailRow/Context/Opening/Aggregates` là mới, KHÔNG modify field cũ nào.
- Field rename → `@deprecated(reason: "...")` giữ field cũ.
- Shared export type `StockReportExportPayload`/`StockReportExportApiResponse` — nếu sibling FEAT (FEAT-STK-LIST-V2/FEAT-IP-VIEW-V2 BFF spec) đã declare trước, **REUSE** — KHÔNG duplicate declare trong `stock-v2.graphql`.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| 400 `ERR-CMN-validation` | `BAD_USER_INPUT` | AC-1, AC-7 |
| 401 (missing/invalid JWT) | `UNAUTHENTICATED` | AC-8 |
| 403 `FORBIDDEN` (tenant mismatch / feature flag `Inventory:InventoryV2` off) | `FORBIDDEN_ERROR` | AC-1, AC-8 |
| 404 (warehouse không tồn tại tenant scope) | `NOT_FOUND` | AC-1 |
| 500 | `INTERNAL_SERVER_ERROR` | AC-1, AC-7 |
| 504 (downstream aggregation timeout) | `GATEWAY_TIMEOUT` | AC-1 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Field naming canonical per `gf-inventory-api.md §5.2`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `StockCardDetailRow` | type | `movementDate: Date!`, `slipCode: String!`, `slipType: String!`, `openingQty: Decimal!`, `openingValue: Decimal!`, `inboundQty/Value: Decimal!`, `outboundQty/Value: Decimal!`, `closingQty/Value: Decimal!` | NO (new) | AC-2, AC-3 |
| `StockCardDetailContext` | type | `productCode: String!`, `productName: String!`, `mainUnitCode: String!`, `warehouseCode: String!`, `warehouseName: String!` | NO (new) | AC-1 |
| `StockCardDetailOpening` | type | `openingQty: Decimal!`, `openingValue: Decimal!` | NO (new) | AC-4 |
| `StockCardDetailAggregates` | type | `openingQty/Value`, `totalInboundQty/Value`, `totalOutboundQty/Value`, `closingQty/Value` (all `Decimal!`) | NO (new) | AC-6 |
| `StockCardDetailInput` | input | `productCode: String!`, `warehouseCode: String!`, `fromDate: Date!`, `toDate: Date!`, `page: Int = 0`, `size: Int = 20` | NO (new) | AC-1 |
| `StockCardDetailExportInput` | input | `productCode: String!`, `warehouseCode: String!`, `fromDate: Date!`, `toDate: Date!` | NO (new) | AC-7 |
| `PagedStockCardDetailApiResponse` / `PagedStockCardDetailData` | type | `data: {context, opening, content[], aggregates, totalElements, totalPages, page, size}` | NO (new) | AC-1 |
| `StockReportExportPayload` (shared, EX1/EX2/EX3) | type | `contentType: String!`, `fileName: String!`, `contentBase64: String!`, `contentLength: Int!` | NO (new — reuse if sibling FEAT-STK-LIST-V2/FEAT-IP-VIEW-V2 đã declare) | AC-7 |
| `StockReportExportApiResponse` (shared) | type | `data: StockReportExportPayload` | NO (new — reuse) | AC-7 |

### 5.2 Modified types (additive — backward-compat)

> Không có type hiện hữu nào bị modify — toàn bộ types ở §5.1 là mới.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `stockCardDetail` | query | `input: StockCardDetailInput!` | `PagedStockCardDetailApiResponse!` | JWT + `X-Tenant-Id` + `X-Branch-Id` | AC-1..AC-6, AC-8 |
| `stockCardDetailExport` | query | `input: StockCardDetailExportInput!` | `StockReportExportApiResponse!` | JWT + `X-Tenant-Id` + `X-Branch-Id` | AC-7 |

> **Correction (export args)**: `stockCardDetailExport` dùng dedicated input type `StockCardDetailExportInput` (ratified verbatim, `agg-garage-graph-graphql.md:51341,51358-51363`, v7.75) — KHÔNG phải direct scalar args rời như quyết định trước đó. Quyết định cũ dựa trên bundle §G bị truncate (không thấy type), không phải Architecture thật thiếu type. Xem `Execution/wave-specs/W06/_decisions.md`.

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `stockCardDetail` | `src/resolvers/stock-v2/stockCardDetail.ts` | `FEAT-STK-DETAIL-V2` (BE §6, W06-STK-Q3) | `POST /api/v1/stock/card/search` | none (passthrough single call) | AC-1..AC-6, AC-8 |
| `stockCardDetailExport` | `src/resolvers/stock-v2/stockCardDetailExport.ts` | `FEAT-STK-DETAIL-V2` (BE §6, W06-STK-EX3) | `GET /api/v1/stock/card/export` | none | AC-7 |

### 6.3 DataLoader / batching strategy

> **N/A cho feature này** — cả 2 op là single downstream call, BE đã denormalize toàn bộ dimension field (`productName`, `warehouseName`, `mainUnitCode`) ngay trong response row. Không có nested resolver field cần batch → không setup DataLoader.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `stockCardDetail` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | 0 (no cache) | N/A | Realtime semantic BR-STKV2-001/012 — sổ tồn thay đổi liên tục theo phiếu |
| `stockCardDetailExport` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | 0 | N/A | File luôn generate mới nhất tại thời điểm request |

### 6.5 Persisted query allowlist (nếu enable)

> Chưa enable persisted query cho W06 — N/A.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/stock-v2.graphql` | MODIFY (additive) | extend SDL — thêm Q3 types + reuse export types nếu sibling FEAT đã tạo | ~90 | AC-1..AC-8 |
| `resolvers/` | `src/resolvers/stock-v2/stockCardDetail.ts` | NEW | passthrough resolver pattern | ~50 | AC-1..AC-6, AC-8 |
| `resolvers/` | `src/resolvers/stock-v2/stockCardDetailExport.ts` | NEW | passthrough resolver pattern | ~35 | AC-7 |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | 2 method mới `getStockCardDetail` / `exportStockCardDetail` (reuse existing data source nếu Q1/Q2 đã tạo) | ~40 | AC-1, AC-7 |
| `tests/integration` | `tests/integration/stock-v2/stock-card-detail.test.ts` | ADDITIVE | apollo test client | ~70 | AC-1..AC-8 |
| `tests/contract` | `tests/contract/stock-v2-contract.test.ts` | MODIFY (additive) | schema snapshot extend | ~30 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green — `gf-inventory` W06-STK-Q3/EX3 stable). BFF S5 exit hand-off S6 cho FE Web (khi tier file được author).

```
(← BE tier S4: integration green — gf-inventory W06-STK-Q3/EX3)

S5  BFF schema + resolver wire
    Entry: BE FEAT-STK-DETAIL-V2 §6 contracts stable (W06-STK-Q3, W06-STK-EX3)
    Exit: BFF contract test green (schema snapshot) — không cần DataLoader N+1 check (single-call passthrough)
    └─► (hand-off FE Web S6, khi fanout map assign paired_fe_web_feats)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | schema + resolvers + data-sources | BE FEAT-STK-DETAIL-V2 §6 stable | BFF contract test green | BE FEAT-STK-DETAIL-V2 S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce auth context + schema-level constraints + no-cache directive.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-015` | CORNERSTONE | KHÔNG field-level RBAC — schema identical cho 2 persona | `resolvers/stock-v2/*.ts` | AC-8 | dual persona (`garage-owner`/`accountant`) quyền ngang nhau |
| `BR-STKV2-001` / `BR-STKV2-012` | NORMAL | no-cache directive enforcement | `schema/stock-v2.graphql` | AC-4, AC-5, AC-6 | realtime semantic — BFF không được cache response |
| Tenant isolation (Critical Rule #4) | CORNERSTONE | resolver pre-check qua header context | `resolvers/stock-v2/*.ts` | AC-1, AC-8 | tenantId từ JWT-derived `X-Tenant-Id`, KHÔNG qua client-controlled arg |

> **Primary BR enforcement** = BE tier. Xem `Execution/wave-specs/W06/Product/features/be/FEAT-STK-DETAIL-V2.md §9` (khi author).

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF contract (schema + cache hint) | test-api | snapshot SDL `StockCardDetailInput`/`PagedStockCardDetailApiResponse` + `@cacheControl(maxAge: 0)` |
| AC-2, AC-3, AC-4, AC-5, AC-6 | BFF integration (resolver → BE passthrough field-fidelity) | test-api | mock downstream `gf-inventory`, verify `content[]`/`opening`/`aggregates` forward 1:1 không mất field |
| AC-7 | BFF integration (export passthrough) | test-api | verify `stockCardDetailExport` forward base64 payload nguyên trạng, không truncate |
| AC-8 | BFF auth (RBAC) | test-isolation | dual persona, schema visibility identical, chỉ 401 khi JWT invalid |
| — | No-cache guard | test-api | assert response header `cache-control: no-store` hoặc tương đương cho cả 2 op |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-STK-DETAIL-V2.md` | DRAFT (author song song trong wave này) | Downstream REST W06-STK-Q3/EX3 (§6.1-§6.2) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-DETAIL-V2.md` | ACTIVE candidate (DRAFT) | Tier file riêng đã được author (consumes ops `stockCardDetail`/`stockCardDetailExport`); `paired_fe_web_feats` reconciled từ `[]` → `["FEAT-STK-DETAIL-V2"]` |
| Mobile | — | N/A | Ngoài scope — Q3 web-only per FEAT platform scope (mobile chỉ có `FEAT-STK-LIST-V2` Q1) |

**Source ID consistency** (item 18): `source_feat_sha` = `1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7`, phải identical với BE tier file khi author.

## 12. References

- **Source**: [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) v16
- **Paired BE**: [`features/be/FEAT-STK-DETAIL-V2.md`](../be/FEAT-STK-DETAIL-V2.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3j`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **Downstream REST**: [`Architecture/api/gf-inventory-api.md §3g, §5.2`](../../../../../Architecture/api/gf-inventory-api.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa sai arg-shape của `stockCardDetailExport`** — spec cũ dùng 4 direct scalar args (`productCode, warehouseCode, fromDate, toDate`) với "Decision note" biện minh "không có input type riêng trong bundle §G SDL", nhưng ratified Architecture thật sự CÓ định nghĩa `StockCardDetailExportInput` (`agg-garage-graph-graphql.md:51341,51358-51363`, v7.75) — bundle chỉ bị truncate. Thêm row type mới §5.1, sửa §3/§6.1 args + xóa "Decision note" sai, thay bằng "Correction" ghi rõ nguồn gốc lỗi. Đồng bộ `version` frontmatter khớp Change Log. Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-STK-DETAIL-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF, §3 BFF behaviour map cho 8/8 AC-ID, §4 auth + perf + cache + error mapping, §5-§11 BFF-specific (SDL Q3/EX3, GraphQL ops passthrough thuần, no DataLoader/no cache, cross-tier pair). Source FEAT chỉ audit. |
