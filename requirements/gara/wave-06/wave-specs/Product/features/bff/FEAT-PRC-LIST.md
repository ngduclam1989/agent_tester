---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-LIST.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-LIST"
source_feat_sha: "5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "gf-hrms"]
modifies: []
change_type: "new-capability"
graphql_ops: ["priceCalcRunList"]
paired_backend_feats: ["FEAT-PRC-LIST"]
paired_fe_web_feats: ["FEAT-PRC-LIST"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "N/A (module không dùng KG — SDL contract verify trực tiếp từ Architecture/api/agg-garage-graph-graphql.md §2 Endpoint Summary row 360 + §3f.1)"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A (không được cung cấp trong Context Bundle)"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-LIST.bff.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-LIST (BFF): Danh sách lịch sử tính giá xuất kho

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-LIST` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting`, `gf-hrms` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `priceCalcRunList` (Query) |
| Cross-tier pair | BE: `FEAT-PRC-LIST` \| Web: chưa fan-out trong batch W06 hiện tại \| Mobile: N/A (module PRC web-only) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) |
| Source version | v12 |
| Source SHA | `5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae` |
| Generated at | 2026-07-31T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu lại các lần đã chạy tính giá vốn xuất kho theo phương pháp bình quân gia quyền cuối kỳ, để biết kỳ/kho nào đã được chốt giá, ai chạy, khi nào, và kết quả (thành công hay có lỗi). Màn hình này là cửa ngõ điều hướng: từ đây người dùng mở lại chi tiết một lần tính, xóa log không còn cần, hoặc khởi chạy một lần tính giá mới. Đây là bước khởi đầu của luồng nghiệp vụ tính giá xuất kho (PRC) trong quy trình chốt sổ kế toán cuối kỳ.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 1 GraphQL query mới `priceCalcRunList` (module `price-calc-run`) — passthrough thuần, không orchestrate multi-downstream.
- Forward filter/sort/pagination args (`PriceCalcRunSearchInput`) nguyên trạng sang REST search endpoint `gf-accounting`, không tự suy luận thêm điều kiện lọc, không dedup log.
- Enrich field `executedByName` (tên hiển thị tài khoản thực hiện) qua DataLoader tái sử dụng pattern TENANT-USERS (gf-hrms) — chống N+1 khi list nhiều dòng trên 1 trang.
- Propagate auth header (`Authorization`, `X-Tenant-Id`) xuống downstream REST `gf-accounting`; feature-flag `Inventory:InventoryV2` off → BE trả 403 → BFF map thành `FORBIDDEN_ERROR`.
- KHÔNG cache response (log tính giá có thể chuyển trạng thái "Đang tính" → "Thành công"/"Hoàn thành có lỗi" giữa các lần FE refresh).
- **KHÔNG sở hữu** 3 op phục vụ cột "Thao tác": `priceCalcRunGet` (Xem), `priceCalcRunDelete` (Xóa), `priceCalcRunCreate` (nút "Tính giá") — spec tại paired FEAT-PRC-DETAIL/FEAT-PRC-DELETE/FEAT-PRC-CREATE BFF tier tương ứng.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Mở màn + hiển thị danh sách

#### AC-1 → Expose passthrough query cho màn danh sách

- **Khi**: FE mount màn "Danh sách tính giá xuất kho", gọi query `priceCalcRunList(input: PriceCalcRunSearchInput!)` với input rỗng/mặc định.
- **BFF phải**: passthrough thuần — forward `input` (mặc định `page=0, size=20, sort="executedAt,desc"` theo SDL default) xuống REST search; KHÔNG orchestrate thêm downstream call nào khác cho case mở màn mặc định.
- **Downstream**: `POST /api/v2/price-calc-runs/search` (gf-accounting, op ID W06-1).
- **Output shape**: `PagedPriceCalcRunApiResponse.data.content[]` (`PriceCalcRun[]`) + `pageable`.
- **Failure mode**: feature-flag off → BE 403 → `FORBIDDEN_ERROR`; validation lỗi (page<0, size>100) → BE 400 `ERR-CMN-validation` → `BAD_USER_INPUT`.
- **Ref**: op `priceCalcRunList` (§6.1), resolver `src/resolvers/price-calc-run/priceCalcRunList.ts` (§6.2), paired BE `FEAT-PRC-LIST` §6.1 (W06-1).

#### AC-2 → Field exposure map 1:1 cột + enrich `executedByName`

- **Khi**: FE render bảng, cần đủ field cho 9 cột dữ liệu (cột "STT" tự tính client-side theo index, không cần field riêng).
- **BFF phải**: SDL `PriceCalcRun` cung cấp đủ field map cột ("Kỳ kế toán"→`periodName`, "Từ ngày"/"Đến ngày"→`fromDate`/`toDate`, "Kho"→`warehouseName`, "Phương pháp tính giá vốn"→`pricingMethod`, "Tài khoản thực hiện"→`executedByName`, "Ngày giờ thực hiện"→`executedAt`, "Số mã"→`itemsResolvedCount`, "Trạng thái"→`status`). `executedByName` là field BFF-populated nullable qua DataLoader — REST response chỉ trả `executedBy` (raw identity/userId), KHÔNG có tên hiển thị.
- **Downstream**: REST field `executedBy` (raw) + DataLoader batch lookup tên hiển thị qua `gf-hrms` (pattern TENANT-USERS, tái sử dụng nguyên trạng từ OB §3g — không tạo loader mới).
- **Output shape**: field `executedByName: String` (nullable) trên type `PriceCalcRun`.
- **Failure mode**: DataLoader batch lookup lỗi/user không tìm thấy → `executedByName = null` (FE tier tự quyết định fallback hiển thị `executedBy` raw hoặc "—").
- **Ref**: SDL `PriceCalcRun.executedByName` (§5.1), DataLoader `tenantUserLoaderByTenant` (§6.3, reuse).
- **Note (status mapping)**: BE enum `PriceCalcRunStatus` có 4 giá trị (`PENDING`/`RUNNING`/`SUCCEEDED`/`COMPLETED_WITH_ERRORS`) nhưng UI chỉ hiển thị 3 trạng thái (`PENDING`+`RUNNING` cùng gộp "Đang tính" theo BR-PRC-014). BFF **KHÔNG** collapse giá trị enum — forward nguyên trạng; mapping label thực hiện ở FE-web tier.

#### AC-3 → Không override sort, không dedup log

- **Khi**: FE không truyền `input.sort` (dùng default) hoặc truyền override tường minh.
- **BFF phải**: KHÔNG áp thêm sort logic hay dedup tại resolver — forward `input.sort` verbatim xuống REST (default SDL `"executedAt,desc"` nếu client bỏ trống); mỗi record REST trả về map 1:1 sang 1 dòng UI, không merge các log cùng kỳ/kho.
- **Downstream**: REST `sort` query/body param; thứ tự mặc định enforce primary tại BE (BR-PRC-018).
- **Output shape**: `content[]` giữ nguyên thứ tự REST trả về.
- **Failure mode**: N/A (read-only, không mutate).
- **Ref**: SDL `PriceCalcRunSearchInput.sort` default (§5.1), BR-PRC-018 (primary enforce tại BE — xem `features/be/FEAT-PRC-LIST.md §9`).

### Cluster B — Bộ lọc, phân trang, phân quyền

#### AC-4 → Bộ lọc passthrough

- **Khi**: FE gửi `input.pricingMethod` / `input.executedFrom` / `input.executedTo`.
- **BFF phải**: forward nguyên trạng 3 field filter xuống REST body; KHÔNG validate business logic thêm ở resolver (chỉ schema-level type check GraphQL enum/`Date` scalar).
- **Downstream**: REST `POST /api/v2/price-calc-runs/search` body `pricingMethod`/`executedFrom`/`executedTo`.
- **Output shape**: `content[]` đã filter theo tiêu chí gửi lên.
- **Failure mode**: filter combination vô nghĩa (`executedFrom > executedTo`) → BE 400 `ERR-CMN-validation` → `BAD_USER_INPUT`.
- **Ref**: SDL `PriceCalcRunSearchInput` (§5.1).

#### AC-5 → Phân trang passthrough

- **Khi**: FE gửi `input.page`/`input.size` hoặc dùng default (`page=0, size=20`).
- **BFF phải**: forward `page`/`size` verbatim; KHÔNG tự cap `size` tại BFF (cap `size≤100` là validation của BE qua `ERR-CMN-validation`).
- **Downstream**: REST `page`/`size` param.
- **Output shape**: `PagedPriceCalcRunData.{totalElements, totalPages, page, size}`.
- **Failure mode**: `size>100` → BE 400 `ERR-CMN-validation` → `BAD_USER_INPUT`.
- **Ref**: SDL `PriceCalcRunSearchInput.page/size` default (§5.1).

#### AC-6 → N/A (BFF không sở hữu 3 op con của cột "Thao tác")

- Cột "Thao tác" (Xem/Xóa) + nút "Tính giá" trigger 3 op nằm ngoài scope `FEAT-PRC-LIST`: `priceCalcRunGet` (Xem → paired `FEAT-PRC-DETAIL` BFF tier), `priceCalcRunDelete` (Xóa → paired `FEAT-PRC-DELETE` BFF tier), `priceCalcRunCreate` (nút "Tính giá" → paired `FEAT-PRC-CREATE` BFF tier). `FEAT-PRC-LIST` BFF chỉ chịu trách nhiệm expose `priceCalcRunList`; render nút/action là FE-web/mobile concern.

#### AC-7 → Phân quyền + tenant scope

- **Khi**: request đến resolver `priceCalcRunList`.
- **BFF phải**: enforce `@requiresAuth` (JWT hợp lệ, không phân biệt persona — `garage-owner`/`accountant` quyền ngang nhau theo BR-AP-CMN-002); KHÔNG cho phép client truyền `tenantId`/`garageId` qua GraphQL arg — tenant scope resolve từ JWT/header `X-Tenant-Id`, forward xuống REST nguyên trạng.
- **Downstream**: REST filter tenant tại DB layer (BE responsibility primary).
- **Output shape**: N/A (auth gate, không đổi response shape).
- **Failure mode**: JWT thiếu/hết hạn → 401 `UNAUTHENTICATED`; feature-flag off → `FORBIDDEN_ERROR`.
- **Ref**: BR-AP-CMN-002 (secondary enforce tại BFF auth guard, §4.1).

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver `priceCalcRunList` propagate `Authorization`, `X-Tenant-Id` xuống downstream REST `gf-accounting`.
- Firebase/JWT token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Resolver `priceCalcRunList` cần DataLoader `tenantUserLoaderByTenant` (reuse, pattern OB §3g) batch resolve `executedByName` cho toàn bộ `executedBy` distinct trong 1 page — batch key `{tenantId, userIds[]}`, tránh gọi `gf-hrms` per-row.
- KHÔNG `@cacheControl` giữ TTL > 0 cho op này (xem §6.4).
- Persisted query whitelist: N/A — chưa enable cho wave này.

### 4.3 Security + data exposure

- KHÔNG log PII / JWT trong resolver.
- Tenant scope resolve từ header `X-Tenant-Id`, KHÔNG cho phép override qua GraphQL argument client-controlled.
- `executedByName` chỉ là tên hiển thị nội bộ tenant (không phải PII nhạy cảm ngoài phạm vi tenant) — vẫn scope theo `X-Tenant-Id` khi batch lookup `gf-hrms`.

### 4.4 Contract stability

- Module `price-calc-run` là schema mới hoàn toàn W06 — mọi extension sau khi ratify phải additive only. Field rename → `@deprecated(reason: "...")` giữ field cũ.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `ERR-CMN-validation` (400 — page/size/date range invalid) | `BAD_USER_INPUT` | AC-1, AC-4, AC-5 |
| 403 (feature-flag `Inventory:InventoryV2` off) | `FORBIDDEN_ERROR` | AC-1, AC-7 |
| 401 (JWT thiếu/hết hạn) | `UNAUTHENTICATED` | AC-7 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Module `price-calc-run` (§3f `agg-garage-graph-graphql.md`) là NEW hoàn toàn cho W06. Bảng dưới chỉ liệt kê type/field mà `priceCalcRunList` sử dụng trực tiếp. Các type khác trong cùng module (`PriceCalcRunItem`, `PriceCalcRunDetail`, `PriceCalcRunKickoff`, `AffectedSubsequentPeriod`, `PriceCalcRunCreateInput`, `PriceCalcRunRecalcInput`, `PriceCalcItemsForCogsLookupInput`, ...) thuộc scope paired FEAT-PRC-DETAIL/CREATE/RECALC/DELETE BFF tier — KHÔNG spec lại ở đây.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `PriceCalcRun` | type | `id: Int!`, `periodId: Int!`, `periodName: String!`, `fromDate: Date!`, `toDate: Date!`, `warehouseId: Int!`, `warehouseCode: String!`, `warehouseName: String!`, `pricingMethod: PricingMethod!`, `executedBy: String!`, `executedByName: String` (nullable, BFF-populated), `executedAt: DateTime!`, `scope: PriceCalcScope!`, `status: PriceCalcRunStatus!`, `itemsResolvedCount: Int!`, `itemsDoneCount: Int!`, `itemsErrorCount: Int!`, `warningsSkippedItems: Int!` | NO (new) | AC-2 |
| `PriceCalcRunSearchInput` | input | `warehouseId: Int`, `pricingMethod: PricingMethod`, `executedFrom: Date`, `executedTo: Date`, `page: Int = 0`, `size: Int = 20`, `sort: String = "executedAt,desc"` | NO (new) | AC-1, AC-4, AC-5 |
| `PagedPriceCalcRunApiResponse` | type | `data: PagedPriceCalcRunData` | NO (new) | AC-1 |
| `PagedPriceCalcRunData` | type | `content: [PriceCalcRun!]!`, `totalElements: Int!`, `totalPages: Int!`, `page: Int!`, `size: Int!` | NO (new) | AC-1, AC-5 |
| `PricingMethod` | enum | `PWA` | NO (new) | AC-2, AC-4 |
| `PriceCalcRunStatus` | enum | `PENDING`, `RUNNING`, `SUCCEEDED`, `COMPLETED_WITH_ERRORS` | NO (new) | AC-2 |
| `PriceCalcScope` | enum | `ALL`, `SPECIFIC` | NO (new) | AC-2 |

### 5.2 Modified types (additive — backward-compat)

N/A — module mới hoàn toàn, không có type hiện hữu bị chỉnh sửa.

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunList` | query | `input: PriceCalcRunSearchInput!` | `PagedPriceCalcRunApiResponse!` | JWT + tenantId (`@requiresAuth`) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-7 |

> **Verified**: `Architecture/api/agg-garage-graph-graphql.md` §2 Endpoint Summary row #360 (module `price-calc-run (W06 PRC)`). Op counterpart `priceCalcRunGet`/`priceCalcRunCreate`/`priceCalcRunRecalc`/`priceCalcRunDelete`/`priceCalcItemsForCogsLookup` (rows #361-365) thuộc paired FEAT-PRC-DETAIL/CREATE/RECALC/DELETE BFF tier — KHÔNG spec lại.

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunList` | `src/resolvers/price-calc-run/priceCalcRunList.ts` | `FEAT-PRC-LIST` (BE §6.1, W06-1) | `POST /api/v2/price-calc-runs/search` | `{tenantId, userIds[]}` (executedByName enrich) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-7 |

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| `tenantUserLoaderByTenant` (reuse — pattern TENANT-USERS đã tồn tại cho OB §3g `executedByName`) | `{tenantId, userIds[]}` | `gf-hrms` batch user lookup (pattern hiện hữu, không tạo endpoint mới) | request-scoped | `priceCalcRunList` resolver N+1 guard cho `executedByName` |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `priceCalcRunList` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | KHÔNG cache — `status` (`PENDING`/`RUNNING`) đổi liên tục khi job nền chạy; FE tự refresh theo thao tác người dùng |

### 6.5 Persisted query allowlist (nếu enable)

N/A — chưa enable cho wave này.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/price-calc-run/priceCalcRun.graphql` | NEW (module dùng chung — sibling FEAT-PRC-CREATE/DETAIL/RECALC/DELETE cùng extend file này) | new SDL, phần List ~30 dòng | ~30 (phần List) | AC-1, AC-2, AC-4, AC-5 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/price-calc-run/priceCalcRunList.ts` | NEW | resolver passthrough pattern | ~50 | AC-1, AC-3, AC-7 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfAccountingDataSource.ts` | ADDITIVE (method `searchPriceCalcRuns`) | new method | ~25 | AC-1 |
| `data-loaders/` | (reuse `tenantUserLoaderByTenant` hiện hữu — không tạo file mới) | REUSE | DataLoader pattern (existing) | 0 | AC-2 |
| `auth/` | (reuse guard `requiresAuth` hiện hữu — không custom auth riêng) | REUSE | guard pattern (existing) | 0 | AC-7 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/price-calc-run-list.test.ts` | NEW | apollo test client | ~60 | AC-1, AC-2, AC-4, AC-5, AC-7 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/price-calc-run-contract.test.ts` | NEW (module dùng chung — sibling FEAT có thể extend) | schema contract | ~40 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-PRC-LIST §6.1 (W06-1) contract stable
    Exit: BFF contract test green + DataLoader pass N+1 check
    └─► (hand-off FE/Mobile S6 — khi fan-out sinh)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver `priceCalcRunList` | schema + resolvers + data-sources + loaders (reuse) | BE FEAT-PRC-LIST §6.1 stable | BFF contract test green | BE FEAT-PRC-LIST S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce:
> - Auth context (RBAC, tenantId guard)
> - N+1 guard
> - Schema-level constraints (required fields, enum values, default sort/page/size)

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-CMN-002` | CORNERSTONE | `@requiresAuth` guard, không phân biệt persona | `src/resolvers/price-calc-run/priceCalcRunList.ts` | AC-7 | garage-owner + accountant quyền ngang nhau — không cần field-level RBAC |
| `BR-PRC-018` | NORMAL | SDL default `sort = "executedAt,desc"`, KHÔNG override tại resolver | `src/schema/price-calc-run/priceCalcRun.graphql` | AC-3 | primary enforce tại BE; BFF chỉ giữ default, không tự áp logic sort |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-PRC-LIST.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF contract (schema, cache hint) | test-api | snapshot SDL `priceCalcRunList` + `@cacheControl(maxAge: 0)` |
| AC-2 | BFF integration (DataLoader enrichment) | test-api | mock `gf-hrms` batch lookup, verify `executedByName` populate + batch call count = 1 per page (không N+1) |
| AC-4, AC-5 | BFF integration (passthrough filter/pagination) | test-api | mock downstream `gf-accounting`, verify request body forward verbatim (không thêm/bớt field) |
| AC-7 | BFF auth (RBAC) | test-isolation | dual persona (`garage-owner`, `accountant`) đều pass; JWT thiếu → `UNAUTHENTICATED`; feature-flag off → `FORBIDDEN_ERROR` |
| — | N+1 guard | test-api | inflight DataLoader batch count assertion (≤1 call/page bất kể số dòng) |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-LIST.md` | IN PROGRESS (batch W06 song song) | Downstream REST endpoint W06-1 (§6.1-§6.2) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-LIST.md` | N/A — chưa fan-out trong batch W06 hiện tại | Khi generate, consume `priceCalcRunList` từ §6.1 |
| Mobile | — | N/A | Module PRC web-only theo PKG §2.2 mobile scope (chỉ `FEAT-STK-LIST-V2` có mobile) |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/FE tier files khi generate.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) v12
- **Paired BE**: [`features/be/FEAT-PRC-LIST.md`](../be/FEAT-PRC-LIST.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §2 (row #360) + §3f
- **Paired REST**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §5 (W06-1) + §6.2 Naming Registry
- **ADR**: [`ADR-027-prc-engine.md`](../../../../../Architecture/decisions/) (BQGQ engine — cite qua PKG §H), [`ADR-028-prc-temporal-execution.md`](../../../../../Architecture/decisions/)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-PRC-LIST` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF, §3 BFF behaviour map per 7 AC-ID (AC-6 → N/A, thuộc paired FEAT-PRC-DETAIL/DELETE/CREATE), §4 auth + perf + cache + error mapping, §5-§11 BFF-specific (SDL/ops/resolver/DataLoader/cross-tier pair). GraphQL op `priceCalcRunList` verified verbatim tại `agg-garage-graph-graphql.md` §2 row #360 (không suy luận từ convention). Source FEAT chỉ audit. |
