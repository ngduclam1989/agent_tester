---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-LIST-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-LIST-V2"
source_feat_sha: "0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48"
generated_at: "2026-07-31T00:00:00Z"
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
graphql_ops: ["stockLedgerAtDate", "stockLedgerAtDateExport"]
paired_backend_feats: ["FEAT-STK-LIST-V2"]
paired_fe_web_feats: ["FEAT-STK-LIST-V2"]
paired_mobile_feats: ["FEAT-STK-LIST-V2"]
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "NOT_COMPUTED — no hash tool available in author sandbox"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-LIST-V2.bff.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-LIST-V2 (BFF): Báo cáo tồn kho đến ngày

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST-V2` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `stockLedgerAtDate` (Query), `stockLedgerAtDateExport` (Query) |
| Cross-tier pair | BE: FEAT-STK-LIST-V2 (`gf-inventory`) \| Web: FEAT-STK-LIST-V2 (`garage-web`) \| Mobile: FEAT-STK-LIST-V2 (`garage-mobile`, Q1-only scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-LIST-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) |
| Source version | v10 |
| Source SHA | `0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần biết chính xác tồn kho (số lượng + giá trị) của từng mã sản phẩm nội bộ tại bất kỳ thời điểm nào để phục vụ kiểm kê, đối soát sổ sách và quyết định nhập hàng. Feature cung cấp báo cáo tồn kho realtime, đọc trực tiếp từ sổ tồn (stock ledger), tách riêng theo từng kho, cho phép lọc theo ngày/kho/mã và xuất file Excel theo mẫu chuẩn. Đây là báo cáo đầu tiên trong nhóm 3 báo cáo Stock V2 (cùng NXT và thẻ kho), nằm ở cuối luồng nghiệp vụ: sau khi nhập/xuất kho và chạy tính giá bình quân gia quyền cuối kỳ (BQGQ), báo cáo phản ánh đúng số liệu đã chốt. Feature triển khai song song trên Web GMS và App Garage — duy nhất trong 3 báo cáo Stock V2 có mặt trên mobile W06.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 GraphQL query mới: `stockLedgerAtDate` (query danh sách tồn kho phân trang + dòng Tổng) và `stockLedgerAtDateExport` (xuất file `.xlsx`).
- Resolver pattern: **passthrough thuần** — không orchestrate nhiều downstream call, không aggregate, không transform field name (Naming Registry canonical giữa BE↔BFF↔FE↔Mobile).
- Downstream duy nhất: `gf-inventory` public REST — `POST /api/v1/stock-ledgers/at-date/search` (W06-STK-Q1) và `GET /api/v1/stock-ledgers/at-date/export` (W06-STK-EX1).
- KHÔNG cần DataLoader/batching — mỗi query là 1 lời gọi REST duy nhất, không có N+1 risk (BE đã denormalize `productName`/`warehouseName` trong response).
- KHÔNG cache ở BFF — dữ liệu phải realtime theo BR-STKV2-001 (BE cũng không cache).
- Propagate xuống downstream: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`. Feature-flag `Inventory:InventoryV2` gate ở BE (BFF chỉ forward request; BE trả 403 khi flag off → BFF map `FORBIDDEN`).

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage: 9/9 source AC-IDs.

### Cluster A — Query báo cáo + bộ lọc (AC-1 → AC-6, AC-9)

#### AC-1 → Mở màn báo cáo

- **Khi**: FE/Mobile gửi query `stockLedgerAtDate` khi user mở màn "Báo cáo tồn kho".
- **BFF phải**: passthrough request tới downstream với `asOfDate` mặc định = hôm nay nếu client không truyền (BE tự áp default nếu field bị bỏ trống).
- **Downstream**: `POST /api/v1/stock-ledgers/at-date/search` (`gf-inventory`).
- **Output shape**: `PagedStockLedgerAtDateApiResponse.data.content[]` + `aggregates` + pagination meta.
- **Failure mode**: 403 `FORBIDDEN` (feature-flag off / tenant mismatch) → GraphQL `FORBIDDEN`.
- **Ref**: op `stockLedgerAtDate` (§6.1), resolver `resolvers/stock-report/stockLedgerAtDate.ts` (§6.2), paired BE FEAT-STK-LIST-V2 §6 (W06-STK-Q1).

#### AC-2 → Cột hiển thị

- **Khi**: FE/Mobile render bảng với các cột `productCode/productName/mainUnitCode/warehouseCode/warehouseName/quantityOnHand/valueOnHand` + dòng Tổng.
- **BFF phải**: forward toàn bộ field verbatim (không rename) — canonical theo `gf-inventory-api.md §5.2`.
- **Downstream**: cùng `stockLedgerAtDate` call ở AC-1 (1 request phục vụ cả list + Tổng).
- **Output shape**: `StockLedgerAtDateRow` (7 field) + `StockLedgerAtDateAggregates` (`totalQuantity`, `totalValue`).
- **Failure mode**: N/A (read success path).
- **Ref**: SDL `StockLedgerAtDateRow`/`StockLedgerAtDateAggregates` (§5.1).

#### AC-3 → Số lượng & giá trị tồn

- **Khi**: FE cần hiển thị `quantityOnHand` + `valueOnHand` chính xác tới đơn vị nhỏ nhất.
- **BFF phải**: KHÔNG làm tròn/transform giá trị Decimal nhận từ BE — pass qua nguyên trạng (BE đã tính `closing_qty`/`closing_value` tại `max(movement_date) ≤ asOfDate`).
- **Downstream**: `stockLedgerAtDate` (W06-STK-Q1).
- **Output shape**: `quantityOnHand: Decimal!`, `valueOnHand: Decimal!`.
- **Failure mode**: N/A.
- **Ref**: SDL §5.1; BR-STKV2-001(b).

#### AC-4 → Bộ lọc

- **Khi**: FE/Mobile gửi input `asOfDate`, `warehouseIds[]`, `keyword` (search LIKE mã/tên), `page`/`size`/`sort`.
- **BFF phải**: map 1:1 GraphQL input `StockLedgerAtDateInput` → REST JSON body (`warehouseIds` forward nguyên mảng `[Int!]` → JSON array, không convert sang multi-value query param — theo v67 transport flip).
- **Downstream**: `POST /api/v1/stock-ledgers/at-date/search`.
- **Output shape**: filtered `content[]` + updated `aggregates`.
- **Failure mode**: 400 `ERR-CMN-validation` (asOfDate tương lai/malformed, `size > 100`, `sort` column ngoài whitelist, `keyword > 200` ký tự) → GraphQL `BAD_USER_INPUT`.
- **Ref**: input `StockLedgerAtDateInput` (§5.1); resolver mapping (§6.2).

#### AC-5 → Tách dòng theo kho

- **Khi**: sản phẩm tồn ở nhiều kho.
- **BFF phải**: KHÔNG gộp dòng — mỗi (mã + kho) đã là 1 row từ BE, BFF chỉ passthrough array nguyên trạng, không group-by lại ở resolver.
- **Downstream**: `stockLedgerAtDate`.
- **Output shape**: `content[]` — 1 phần tử / (productCode, warehouseCode).
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-006 (mirror BE row-splitting invariant).

#### AC-6 → Hiển thị mã theo ngày

- **Khi**: mã có SL=0 nhưng giá trị ≠ 0 (chênh lệch làm tròn giá vốn bình quân sau PWA) vẫn phải xuất hiện.
- **BFF phải**: N/A — đây là filter logic thực thi ở BE (`closing_qty <> 0 OR closing_value <> 0`); BFF không filter lại phía client, chỉ trả nguyên `content[]` đã lọc từ downstream.
- **Downstream**: `stockLedgerAtDate`.
- **Output shape**: N/A (không có transform bổ sung ở BFF).
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-007 v13 (BE-side invariant, xem be/ tier file §6).

#### AC-9 → Phân quyền (chủ garage + kế toán ngang quyền)

- **Khi**: cả 2 persona `garage-owner` và `accountant` mở báo cáo.
- **BFF phải**: KHÔNG có field-level RBAC riêng cho op này — forward JWT nguyên trạng xuống BE; BE không phân biệt persona cho endpoint này (BR-STKV2-015 quyền ngang nhau). BFF chỉ enforce auth context tồn tại (JWT hợp lệ + tenantId khớp).
- **Downstream**: `stockLedgerAtDate` / `stockLedgerAtDateExport`.
- **Output shape**: N/A.
- **Failure mode**: 401 (JWT thiếu/invalid) → `UNAUTHENTICATED`.
- **Ref**: §4.1 Auth header propagation; BR-STKV2-015.

### Cluster B — Xuất file (AC-8)

#### AC-8 → Xuất file

- **Khi**: FE gọi query `stockLedgerAtDateExport` khi user bấm nút "Xuất file" (giữ nguyên filter hiện tại của bảng).
- **BFF phải**: passthrough thuần — forward filter args (`asOfDate`, `warehouseIds`, `keyword`, `sort`) sang downstream export endpoint, nhận base64 `.xlsx` binary + metadata, trả nguyên vẹn cho client (KHÔNG decode/re-encode).
- **Downstream**: `GET /api/v1/stock-ledgers/at-date/export?asOfDate=&warehouseIds=&keyword=&sort=` (W06-STK-EX1, `gf-inventory`).
- **Output shape**: `StockReportExportPayload { contentType, fileName, contentBase64, contentLength }`.
- **Failure mode**: 400 `ERR-CMN-validation` → `BAD_USER_INPUT`; 403 `FORBIDDEN` (feature-flag/tenant) → `FORBIDDEN`; 500/timeout → `INTERNAL_SERVER_ERROR`.
- **Ref**: op `stockLedgerAtDateExport` (§6.1); SDL `StockReportExportPayload` (§5.1, shared type với FEAT-IP-VIEW-V2/FEAT-STK-DETAIL-V2 export ops); template Excel `Báo cáo tồn kho.xlsx` (BR-STKV2-005).

### Cluster C — Out of BFF scope

#### AC-7 → N/A (điều hướng FE-only)

- "Xem lịch sử (thẻ kho)" là hành vi điều hướng UI (deep-link sang màn thẻ kho `FEAT-STK-DETAIL-V2`, dùng query `stockCardDetail` riêng — không thuộc `stockLedgerAtDate`/`stockLedgerAtDateExport`). BFF không cần logic bổ sung cho AC này trong scope FEAT-STK-LIST-V2 — xem `fe-web/FEAT-STK-LIST-V2.md` §6 cho hành vi điều hướng, và `bff/FEAT-STK-DETAIL-V2.md` (sibling FEAT) cho query đích.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver (`stockLedgerAtDate`, `stockLedgerAtDateExport`) propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống REST downstream `gf-inventory`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- KHÔNG cần DataLoader — mỗi query là 1 REST call, response đã denormalized (`productName`, `warehouseName`) từ BE join.
- KHÔNG cache (`@cacheControl(maxAge: 0)`) — dữ liệu realtime bắt buộc theo BR-STKV2-001.
- Không áp persisted query allowlist riêng cho W06 (default Apollo behavior, không có nêu trong bundle §G).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / payment token trong resolver hoặc error log.
- Không có field-level RBAC bổ sung — dual persona ngang quyền theo BR-STKV2-015 (§3 AC-9).
- Tenant scope lấy từ header `X-Tenant-Id` (server-side context), KHÔNG lấy từ arg client-controlled.

### 4.4 Contract stability

- Schema additive only cho SDL 3j (`StockLedgerAtDateRow`, `StockLedgerAtDateAggregates`, `StockReportExportPayload` — type dùng chung, chỉ mở rộng thêm không sửa field cũ).
- Breaking change (rename/xóa field) → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| 400 `ERR-CMN-validation` | `BAD_USER_INPUT` | AC-4, AC-8 |
| 401 (missing/invalid Authorization) | `UNAUTHENTICATED` | AC-9 |
| 403 `FORBIDDEN` (tenant mismatch hoặc feature-flag `Inventory:InventoryV2` off) | `FORBIDDEN` | AC-1, AC-8, AC-9 |
| 404 (warehouse ID không tồn tại tenant scope) | `NOT_FOUND` | AC-4 |
| 500 | `INTERNAL_SERVER_ERROR` | AC-1, AC-8 |
| 504 (downstream aggregation timeout) | `GATEWAY_TIMEOUT` | AC-1 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Author tổng hợp từ bundle §G (GraphQL doc `agg-garage-graph-graphql.md §3j`, đã ratified W06). Path glob ⊆ `bffs/agg-garage-graph/src/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `StockLedgerAtDateRow` | type | `productCode: String!`, `productName: String!`, `mainUnitCode: String!`, `warehouseCode: String!`, `warehouseName: String!`, `quantityOnHand: Decimal!`, `valueOnHand: Decimal!` | NO (new) | AC-2, AC-3, AC-5 |
| `StockLedgerAtDateAggregates` | type | `totalQuantity: Decimal!`, `totalValue: Decimal!` | NO (new) | AC-2 |
| `StockLedgerAtDateInput` | input | `asOfDate: Date!`, `warehouseIds: [Int!]`, `keyword: String`, `page: Int = 0`, `size: Int = 20`, `sort: String = "productCode,asc"` | NO (new) | AC-4 |
| `StockLedgerAtDateExportInput` | input | `asOfDate: Date!`, `warehouseIds: [Int!]`, `keyword: String`, `sort: String = "productCode,asc"` (dedicated export input — KHÔNG dùng `StockLedgerAtDateInput`, cùng field trừ `page`/`size`) | NO (new) | AC-8 |
| `PagedStockLedgerAtDateApiResponse` / `PagedStockLedgerAtDateData` | type | envelope `data.{content, aggregates, totalElements, totalPages, page, size}` | NO (new) | AC-1, AC-2 |
| `StockReportExportPayload` (shared với siblings `FEAT-IP-VIEW-V2`/`FEAT-STK-DETAIL-V2` export) | type | `contentType: String!`, `fileName: String!`, `contentBase64: String!`, `contentLength: Int!` | NO (new) | AC-8 |
| `StockReportExportApiResponse` | type | `data: StockReportExportPayload` | NO (new) | AC-8 |

> **Shared-type coordination note**: `StockReportExportPayload`/`StockReportExportApiResponse` dùng chung 3 export op (`stockLedgerAtDateExport`, `stockInoutSummaryExport`, `stockCardDetailExport`). Khi impl, kiểm tra schema file `src/schema/stock-report.graphql` chưa bị sibling FEAT tier (`FEAT-IP-VIEW-V2` bff, `FEAT-STK-DETAIL-V2` bff) tạo trùng type — merge additive, không duplicate declaration.

### 5.2 Modified types (additive — backward-compat)

Không có — toàn bộ SDL cho FEAT này là types mới.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `stockLedgerAtDate` | query | `input: StockLedgerAtDateInput!` | `PagedStockLedgerAtDateApiResponse!` | JWT + tenantId | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9 |
| `stockLedgerAtDateExport` | query | `input: StockLedgerAtDateExportInput!` (dedicated export input type, verbatim `agg-garage-graph-graphql.md:51335,51345-51350` — KHÔNG phải `StockLedgerAtDateInput` với page/size omitted) | `StockReportExportApiResponse!` | JWT + tenantId | AC-8 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `stockLedgerAtDate` | `src/resolvers/stock-report/stockLedgerAtDate.ts` | `FEAT-STK-LIST-V2` (BE §6, W06-STK-Q1) | `POST /api/v1/stock-ledgers/at-date/search` | N/A (không cần DataLoader) | AC-1..AC-6, AC-9 |
| `stockLedgerAtDateExport` | `src/resolvers/stock-report/stockLedgerAtDateExport.ts` | `FEAT-STK-LIST-V2` (BE §6, W06-STK-EX1) | `GET /api/v1/stock-ledgers/at-date/export` | N/A | AC-8 |

### 6.3 DataLoader / batching strategy

Không cần — mỗi resolver gọi đúng 1 downstream REST request per invocation, response BE đã denormalized. Không có nested type resolution nào yêu cầu batch loading.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `stockLedgerAtDate` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Realtime bắt buộc (BR-STKV2-001), KHÔNG cache theo BE lẫn BFF |
| `stockLedgerAtDateExport` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Binary export, không cache |

### 6.5 Persisted query allowlist (nếu enable)

Không enable riêng cho W06 (bundle không có chỉ định persisted query allowlist cho module Stock V2 Reports).

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/src/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/stock-report.graphql` | NEW (shared additive với sibling FEAT-IP-VIEW-V2/FEAT-STK-DETAIL-V2) | extend SDL 3j | ~90 (toàn module Stock V2, ~35 riêng cho Q1/EX1) | AC-1..AC-6, AC-8, AC-9 |
| `resolvers/` | `src/resolvers/stock-report/stockLedgerAtDate.ts` | NEW | resolver passthrough pattern | ~40 | AC-1..AC-6, AC-9 |
| `resolvers/` | `src/resolvers/stock-report/stockLedgerAtDateExport.ts` | NEW | resolver passthrough pattern | ~35 | AC-8 |
| `data-sources/` | `src/data-sources/GfInventoryReportDataSource.ts` | NEW (hoặc extend `GfInventoryDataSource.ts` nếu đã tồn tại) | REST client method | ~35 | AC-1..AC-6, AC-8, AC-9 |
| `tests/integration` | `tests/integration/stock-report.test.ts` | ADDITIVE | apollo test client | ~60 | AC-1..AC-6, AC-8, AC-9 |
| `tests/contract` | `tests/contract/stock-report-contract.test.ts` | NEW | schema contract | ~30 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: gf-inventory W06-STK-Q1/EX1 integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-STK-LIST-V2 §6 (W06-STK-Q1/EX1) contracts stable
    Exit: BFF contract test green (stockLedgerAtDate, stockLedgerAtDateExport)
    └─► (hand-off FE Web + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | schema + resolvers + data-sources | BE FEAT-STK-LIST-V2 §6 stable | BFF contract test green | BE FEAT-STK-LIST-V2 S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce auth context + schema-level constraints.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-015` | NORMAL | forward JWT context, không phân biệt persona | `resolvers/stock-report/stockLedgerAtDate.ts` | AC-9 | Dual persona ngang quyền — không cần guard riêng |
| `BR-STKV2-005` | NORMAL | forward export filter nguyên vẹn, không transform template | `resolvers/stock-report/stockLedgerAtDateExport.ts` | AC-8 | Template Excel do BE bind, BFF chỉ pass base64 |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-STK-LIST-V2.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1, AC-2 | BFF contract (schema, cache hint) | test-api | snapshot SDL `stockLedgerAtDate` + cache directive maxAge=0 |
| AC-4 | BFF integration (resolver → BE) | test-api | mock downstream `gf-inventory`, verify filter mapping `warehouseIds[]` JSON array (không multi-value query param) |
| AC-8 | BFF integration (export passthrough) | test-api | verify base64 payload forward nguyên vẹn, không decode/re-encode |
| AC-9 | BFF auth (dual persona) | test-isolation | cả 2 persona `garage-owner`/`accountant` gọi query đều 200, không schema visibility khác biệt |
| — | Error mapping | test-api | assert 400/401/403/404/500/504 downstream → đúng GraphQL error code §4.5 |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-STK-LIST-V2.md` | PENDING (author song song, xem source of truth REST W06-STK-Q1/EX1) | Downstream REST endpoints (§6.1-§6.2) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-LIST-V2.md` | PENDING | Consume `stockLedgerAtDate` + `stockLedgerAtDateExport` từ §6.1 |
| Mobile | `Execution/wave-specs/W06/Product/features/mobile/FEAT-STK-LIST-V2.md` | PENDING | Consume `stockLedgerAtDate` only (Q1-only scope — mobile không có export theo PKG platform scope hiện tại, xác nhận lại ở mobile tier spec) |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) v10
- **Paired BE**: [`features/be/FEAT-STK-LIST-V2.md`](../be/FEAT-STK-LIST-V2.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3j (W06 Stock V2 Reports)
- **Downstream REST**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3g (W06-STK-Q1/EX1)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa sai arg-shape của `stockLedgerAtDateExport`** — spec cũ dùng `input: StockLedgerAtDateInput!` (input type của query non-export) thay vì ratified `StockLedgerAtDateExportInput` (`agg-garage-graph-graphql.md:51335,51345-51350`, v7.75). Thêm row type mới ở §5.1, sửa §6.1 args column. Root cause: `_decisions.md` note "không có input type riêng trong bundle §G" — bundle bị truncate, file gốc thật sự CÓ định nghĩa type riêng (F-7 anti-hallucination gap). Đồng bộ `version` frontmatter khớp Change Log. Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-STK-LIST-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough thuần, không cache, không DataLoader), §3 BFF behaviour map 9/9 AC (7 touched + AC-7 N/A điều hướng FE-only), §4 auth + perf + error mapping, §5-§11 BFF-specific (SDL 3j subset Q1/EX1, ops `stockLedgerAtDate`/`stockLedgerAtDateExport`, resolver/file map, cross-tier pair). Source FEAT chỉ audit. |
