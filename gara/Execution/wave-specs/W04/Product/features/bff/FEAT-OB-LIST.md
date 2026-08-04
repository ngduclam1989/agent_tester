---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-OB-LIST.md"
source_version: 9
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-LIST"
source_feat_sha: "d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["searchOpeningBalances"]
paired_backend_feats: ["FEAT-OB-LIST"]
paired_fe_web_feats: ["FEAT-OB-LIST"]
paired_mobile_feats: ["FEAT-OB-LIST"]
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "{{sha256-fanout-map}}"
  template_sha: "{{sha256-template}}"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-LIST.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-LIST (BFF): Danh sách tồn đầu kỳ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-LIST` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `searchOpeningBalances` |
| Cross-tier pair | BE: `FEAT-OB-LIST` \| Web: `FEAT-OB-LIST` \| Mobile: `FEAT-OB-LIST` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) |
| Source version | v9 |
| Source SHA | `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` |
| Generated at | 2026-07-08T04:51:55+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xem lại nhanh các dòng tồn kho đầu kỳ đã import — theo mã, kho, số lượng và giá trị — để rà soát tính chính xác của điểm khởi đầu tồn kho trước khi hệ thống vận hành các nghiệp vụ nhập/xuất phía sau. Danh sách hỗ trợ tìm kiếm theo mã/tên, lọc theo kho/người import/ngày import, hiển thị dòng tổng hợp và cho phép chọn dòng để xử lý khi phát hiện sai sót. Đây là màn hình mặc định của module Tồn đầu kỳ, phục vụ đầy đủ trên Web GMS và ở chế độ chỉ xem trên App Garage.

---

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query mới `searchOpeningBalances(input: OpeningBalanceSearchInput!)` trong module `opening-balance` (module W04 mới, song song `accounting-period` §3e và `catalog-v2` §3d).
- Resolver pattern: **pure passthrough + 2 enrichment** — forward nguyên `input` tới gf-inventory `POST /api/v2/opening-balances/search` (W04-1) với header tenant context, rồi enrich response trước khi trả FE/Mobile.
- Downstream cần gọi: 1 call bắt buộc gf-inventory W04-1 + tối đa 2 batch call enrichment theo distinct value trong `content[]` — `mainUnitCode` → gf-erp-mdm `POST /api/v1/catalog/inquiry` (directory=UNIT, reuse `fetchAllUnits()` cache TTL 5min chung với catalog V2) và `createdBy` → ct-saas-tenant `POST /api/v1/saas-tenant/tenant-users/search/basic` (Pattern TENANT-USERS).
- Batching: KHÔNG dùng DataLoader per-item — resolver collect distinct `mainUnitCode[]`/`createdBy[]` từ `content[]` rồi gọi 1 batch call/loại, request-scoped, chống N+1.
- Auth header propagate xuống downstream: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- Mobile scope **PARTIAL**: mobile schema bundle chỉ expose `searchOpeningBalances` (view-only per `UX-FLOW-INVENTORY-OPENING-BALANCE.md:29`) — không include W04-M1..M5 (import/edit/delete), các op đó thuộc FEAT-OB-IMPORT/FEAT-OB-EDIT/FEAT-OB-DELETE-LINES.
- Không cache response query ở BFF layer (dữ liệu OB có thể thay đổi bởi FEAT-OB-EDIT/FEAT-OB-DELETE-LINES ngay sau đó); enrichment cache riêng (`UNIT::{tenantId}` TTL 5min) vẫn giữ theo cơ chế catalog V2 sẵn có.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 19 source AC-IDs (FEAT-OB-LIST v9 §2). Mỗi AC xuất hiện ở §3 hoặc §4.

### Cluster A — Khởi tạo và tải danh sách

#### AC-1 [web] → BFF expose query đọc danh sách mặc định

- **Khi**: FE-web gọi `searchOpeningBalances(input: {})` khi mở màn "Tồn đầu kỳ" (input rỗng/default page=0,size=20)
- **BFF phải**: forward `input` tới gf-inventory W04-1, không tự ý inject filter; trả nguyên `PagedOpeningBalanceApiResponse` envelope
- **Downstream**: gf-inventory `POST /api/v2/opening-balances/search` (W04-1)
- **Output shape**: `PagedOpeningBalanceApiResponse.data.content[]` + `aggregates` + pagination fields
- **Failure mode**: gf-inventory 502/500 → `INTERNAL_SERVER_ERROR`; flag `Inventory:InventoryV2` disabled cho tenant → BE 403 fail-fast → `FORBIDDEN_ERROR`
- **Ref**: op `searchOpeningBalances` (§6.1), resolver `src/resolvers/opening-balance/searchOpeningBalances.ts` (§6.2), paired BE FEAT-OB-LIST §6 (W04-1)

#### AC-1b [mobile] → N/A (mobile tile navigation)

- Tap tile "Tồn đầu kỳ" trên Home mission tile "Quản lý kho hàng" là local navigation (push route) — Mobile tier concern. BFF không có touchpoint riêng cho hành động mở màn; màn mobile sau khi mở gọi cùng `searchOpeningBalances` (xem AC-6b/AC-4b/AC-5b cho behaviour thực tế).

#### AC-2 [web] → BFF trả field cho từng cột bảng

- **Khi**: resolver nhận `content[]` từ gf-inventory W04-1
- **BFF phải**: trả nguyên field snapshot (`productCode`, `productName`, `mainUnitCode`, `warehouseCode`, `warehouseName`, `quantityOnHand`, `valueOnHand`, `asOfDate`, `createdBy`, `createdAt`, `fileName`, `fileChecksum`) + **enrich** `createdByName` (batch qua ct-saas-tenant, nullable defensive)
- **Downstream**: gf-inventory W04-1 (data) + ct-saas-tenant `tenant-users/search/basic` (enrichment, conditional khi có `createdBy` + JWT có `tenantId`)
- **Output shape**: `OpeningBalanceLine` đủ field cho cột bảng web (không có `mainUnitName` bắt buộc ở web — cột "ĐVT" web dùng `mainUnitCode` theo AC-2; `mainUnitName` chủ yếu phục vụ card mobile AC-2b)
- **Failure mode**: ct-saas-tenant lỗi/timeout → `createdByName: null` (fallback, KHÔNG throw)
- **Ref**: SDL `OpeningBalanceLine` (§5.1), paired BE FEAT-OB-LIST §6 (W04-1 response schema)

#### AC-2b [mobile] → BFF trả field + enrich `mainUnitName` cho card

- **Khi**: resolver nhận `content[]` — Mobile card cần field `warehouseName`, `asOfDate`, `quantityOnHand`, `valueOnHand`, `mainUnitName`
- **BFF phải**: enrich `mainUnitName` batch qua `fetchAllUnits()` (gf-erp-mdm directory=UNIT, cache TTL 5min shared catalog V2) theo distinct `mainUnitCode` trong `content[]`; fallback `null` khi enrichment miss — FE/Mobile tự fallback hiển thị `mainUnitCode` khi `mainUnitName` null (theo FEAT-OB-LIST AC-2b spec)
- **Downstream**: gf-erp-mdm `POST /api/v1/catalog/inquiry` (directory=UNIT, batch, cache-first)
- **Output shape**: `OpeningBalanceLine.mainUnitName: String` (nullable)
- **Failure mode**: gf-erp-mdm lỗi/timeout → `mainUnitName: null`, KHÔNG throw, KHÔNG fan-out per-row
- **Ref**: SDL `OpeningBalanceLine.mainUnitName` (§5.1), resolver discipline (§2)

#### AC-3 [cross-platform] → BFF passthrough dòng tổng hợp

- **Khi**: resolver nhận `aggregates` object từ gf-inventory W04-1 response
- **BFF phải**: trả nguyên `aggregates.totalQuantity` + `aggregates.totalValue` (server-side tính theo filter hiện tại) — KHÔNG tự tính lại ở BFF/FE từ `content[]` trang hiện tại
- **Downstream**: gf-inventory W04-1 (cùng call với AC-1)
- **Output shape**: `PagedOpeningBalanceData.aggregates: OpeningBalanceAggregates!`
- **Ref**: SDL `OpeningBalanceAggregates` (§5.1)

#### AC-3b [web] → BFF trả `totalElements=0` khi tenant chưa có OB

- **Khi**: gf-inventory W04-1 trả `content: [], totalElements: 0` (tenant chưa import dòng OB nào)
- **BFF phải**: passthrough nguyên response — KHÔNG throw error cho case rỗng; FE tự quyết định render empty state theo `totalElements`
- **Downstream**: gf-inventory W04-1
- **Output shape**: `PagedOpeningBalanceData { content: [], totalElements: 0, ... }`

#### AC-3b-mobile [mobile] → BFF trả `totalElements=0` cho card empty state

- Cùng behaviour AC-3b — resolver không phân biệt platform, Mobile tự render "Chưa có tồn đầu kỳ" theo `totalElements = 0` từ cùng response.

---

### Cluster B — Tìm kiếm và lọc

#### AC-4 [web] → BFF forward `keyword` search

- **Khi**: FE-web truyền `input.keyword: String` (ô tìm kiếm inline)
- **BFF phải**: forward nguyên `keyword` tới gf-inventory W04-1 body — BE tự LIKE-match mã/tên sản phẩm nội bộ (accent-insensitive); BFF không tự filter phía client
- **Downstream**: gf-inventory W04-1 body `{ keyword: "...", ... }`
- **Ref**: SDL `OpeningBalanceSearchInput.keyword` (§5.1)

#### AC-4b [mobile] → BFF forward `keyword` (dedicated search screen, reuse AC-4)

- **Khi**: Mobile màn Tìm kiếm dedicated gọi `searchOpeningBalances(input: { keyword, ...activeFilters, page: 0, size: 20 })` sau debounce ≥300ms (Mobile tier local behaviour)
- **BFF phải**: xử lý y hệt AC-4 — không có resolver/op riêng cho search mobile, reuse cùng `searchOpeningBalances`
- **Downstream**: gf-inventory W04-1 (chung endpoint với AC-4)
- **Note**: debounce + 3-state UI (Default/Results/No Results) là Mobile tier concern, không phải BFF logic

#### AC-5 [web] → BFF forward filter Kho/Người import/Ngày import

- **Khi**: FE-web truyền `input.warehouseId`, `input.createdBy`, `input.importedFrom`/`input.importedTo`
- **BFF phải**: forward nguyên các field vào body gf-inventory W04-1 — không tự resolve hay validate thêm ở BFF
- **Downstream**: gf-inventory W04-1 body `{ warehouseId, createdBy, importedFrom, importedTo, ... }`
- **Ref**: SDL `OpeningBalanceSearchInput` (§5.1)

#### AC-5b [mobile] → BFF forward subset filter (Kho + Ngày Import — KHÔNG có Người import)

- **Khi**: Mobile bottom-sheet "Bộ lọc" áp dụng chỉ 2 filter: `warehouseId` + `importedFrom`/`importedTo` (không có filter "Người import" trên mobile per FEAT-OB-LIST AC-5b)
- **BFF phải**: forward đúng subset field được gửi — schema `OpeningBalanceSearchInput.createdBy` vẫn tồn tại (dùng chung web) nhưng Mobile client đơn giản không gửi field này; BFF không cần logic riêng biệt platform
- **Downstream**: gf-inventory W04-1 body (subset)

#### AC-5c [mobile] → N/A (reuse op `searchWarehouses` có sẵn, ngoài phạm vi BFF work của FEAT-OB-LIST)

- Dropdown "Kho" trong bottom-sheet gọi GraphQL `searchWarehouses(input: WarehouseSearchRequest)` (op #305 đã tồn tại sẵn trong schema, không thuộc module `opening-balance` W04) với `size=20` + load-more pagination. Đây là op chia sẻ toàn hệ thống — KHÔNG cần BFF work mới trong scope FEAT-OB-LIST; preserve-selection logic là Mobile tier client-side state.

#### AC-6 [web] → BFF forward `page`/`size`/`sort`

- **Khi**: FE-web truyền `input.page`, `input.size`, `input.sort` (offset paging, default `page=0, size=20, sort="createdAt,desc"`)
- **BFF phải**: forward nguyên tới gf-inventory W04-1 (Spring Pageable); trả nguyên `totalElements`/`totalPages`/`page`/`size` trong `PagedOpeningBalanceData` — KHÔNG có `PageInfo` type riêng (khác pattern catalog V2), field pagination nằm phẳng trong `PagedOpeningBalanceData`
- **Downstream**: gf-inventory W04-1 Pageable response
- **Output shape**: `PagedOpeningBalanceData { totalElements, totalPages, page, size }`

#### AC-6b [mobile] → BFF forward `page`/`size` cho infinite-scroll

- **Khi**: Mobile gọi `searchOpeningBalances(input: { page: current+1, size: 20, ...activeFilters })` khi scroll đạt 75% list length
- **BFF phải**: xử lý y hệt AC-6 — client (Mobile tier) tự compute `hasNextPage = page + 1 < totalPages` từ response, BFF không tính hộ
- **Downstream**: gf-inventory W04-1 (chung endpoint)

---

### Cluster C — Phân quyền & tenant

#### AC-9 [cross-platform] → BFF enforce tenant scope + RBAC ngang quyền 2 persona

- **Khi**: resolver xử lý bất kỳ request `searchOpeningBalances` nào (web hoặc mobile)
- **BFF phải**: extract tenant context từ JWT (`X-Tenant-Id` header) — propagate xuống gf-inventory, KHÔNG có field `tenantId` client-controlled trong `OpeningBalanceSearchInput`; KHÔNG phân biệt quyền đọc giữa `accountant`/`garage-owner` (2 role bình đẳng theo BR-OB-CMN-002) — schema không có field/branch logic theo role cho query đọc này
- **Downstream**: gf-inventory W04-1 — BE trả `403 tenant-mismatch` nếu `X-Tenant-Id` header không khớp token tenant
- **Output shape**: query argument không có `tenantId`
- **Failure mode**: thiếu/sai tenant context → `UNAUTHENTICATED_ERROR`/`FORBIDDEN_ERROR` trước khi hoặc từ downstream
- **Ref**: `gf-inventory-api.md §3b.2 W04-1` Response 4xx (403 tenant-mismatch)

---

### Cluster D — N/A (write action & navigation — không thuộc BFF scope query đọc)

#### AC-7 [web-only] → N/A (chọn dòng checkbox — FE local state)

- Checkbox chọn dòng để hiện nút "Xoá các dòng đã chọn" là state cục bộ FE-web; hành động xóa thực tế thuộc `FEAT-OB-DELETE-LINES` (op `deleteOpeningBalanceLines` riêng). BFF không có touchpoint cho FEAT-OB-LIST.

#### AC-8 [web-only] → N/A (mở wizard import — routing sang FEAT-OB-IMPORT)

- Nút "Import tồn đầu kỳ" mở wizard là FE-web navigation. Op BFF liên quan (`verifyImportOpeningBalances`/`importOpeningBalances`) thuộc `FEAT-OB-IMPORT`, không thuộc FEAT-OB-LIST.

#### AC-10 [web-only] → N/A (mở form sửa — routing sang FEAT-OB-EDIT)

- Icon sửa mở form là FE-web navigation. Op BFF (`updateOpeningBalanceLine`) thuộc `FEAT-OB-EDIT`.

#### AC-11 [web-only] → N/A (popup xác nhận xóa — routing sang FEAT-OB-DELETE-LINES)

- Icon xóa per-row mở popup xác nhận (cùng guardrail `FEAT-OB-DELETE-LINES`). Op BFF (`deleteOpeningBalanceLine`) thuộc `FEAT-OB-DELETE-LINES`, không thuộc FEAT-OB-LIST.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi call downstream propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- Tenant ID lấy từ JWT context, KHÔNG từ GraphQL argument (`OpeningBalanceSearchInput` không có field `tenantId`).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Resolver tổng downstream calls = **1 bắt buộc** (gf-inventory W04-1) + **tối đa 2 batch** enrichment (gf-erp-mdm UNIT, ct-saas-tenant tenant-users) per request — KHÔNG per-item DataLoader, KHÔNG fan-out theo số dòng `content[]`.
- Enrichment `mainUnitName` reuse cache `UNIT::{tenantId}` TTL 5min chung với catalog V2 — không tạo cache mới.
- p95 target: theo `gf-inventory-api.md §3b.2 W04-1` ≤ 300ms downstream + overhead enrichment batch.

### 4.3 Security + data exposure

- KHÔNG log JWT, tenant ID, dữ liệu tồn kho (số lượng/giá trị) trong resolver debug output.
- Tenant scope enforced ở header layer — client không control được tenant qua args.
- Enrichment `createdByName`/`mainUnitName` nullable defensive — KHÔNG throw khi lookup miss, tránh leak lỗi cross-boundary vào response chính.

### 4.4 Contract stability

- `OpeningBalanceSearchInput`, `OpeningBalanceLine`, `PagedOpeningBalanceData`, `OpeningBalanceAggregates`, `PagedOpeningBalanceApiResponse` là type mới (module W04) — no breaking change risk cho FEAT-OB-LIST scope.
- Field mới thêm sau này vào `OpeningBalanceLine`: additive-only (nullable).
- Breaking change → CR MAJOR (per §3.2 Critical Rule Boundary/contract discipline).

### 4.5 Feature flag gate (Inventory:InventoryV2)

- Toàn bộ module `opening-balance` (bao gồm `searchOpeningBalances`) chỉ hoạt động khi tenant enable flag `Inventory:InventoryV2` — enforce **cả 2 layer**: (a) BE `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController` per `gf-inventory-api.md §3b` intro, (b) **BFF resolver-level** `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403 trước khi forward request xuống BE (align PKG-W04 §2.2.3 CR-20260707-02 + FEAT-OB-EDIT/FEAT-OB-DELETE-LINES/FEAT-OB-IMPORT/FEAT-AP-EDIT). Khi flag tắt, BFF trả `FORBIDDEN_ERROR` HTTP 403 ngay tại resolver, không round-trip xuống BE — tiết kiệm 1 hop + tránh log noise 403 từ BE. BE guard vẫn giữ làm defense-in-depth cho các entry-point khác (S2S/testing bypass BFF).
- Web GMS/Mobile client-side tự ẩn menu/tile theo state matrix (không phụ thuộc lỗi runtime để ẩn UI) nhưng nếu bypass gọi trực tiếp op → luôn nhận 403 nhất quán.

### 4.6 Error code mapping

| Downstream error (BE, gf-inventory W04-1) | GraphQL error | Source AC |
|---|---|---|
| `400` body invalid (dates malformed, `size > 100`) | `ERR-CMN-validation` | AC-4, AC-5, AC-6 |
| `401` missing/invalid JWT | `UNAUTHENTICATED_ERROR` | AC-9 |
| `403` `X-Tenant-Id` mismatch (tenant-mismatch) | `FORBIDDEN_ERROR` | AC-9 |
| `403` flag `Inventory:InventoryV2` disabled (fail-fast) | `FORBIDDEN_ERROR` | AC-1 |
| `500` unexpected DB error | `INTERNAL_ERROR` | AC-1, AC-3 |
| Downstream timeout/backpressure | `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | AC-1 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Schema mới hoàn toàn cho module `opening-balance` (W04, ADR-020/021/022 context). Không đụng module `catalog-v2` (§3d) hay `accounting-period` (§3e).

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `OpeningBalanceLine` | type | `id: Int!`, `productCode: String!`, `productName: String`, `mainUnitCode: String!`, `mainUnitName: String` (BFF-enriched), `warehouseCode: String!`, `warehouseName: String`, `quantityOnHand: Float!`, `valueOnHand: Float!`, `asOfDate: String!`, `createdBy: String!`, `createdByName: String` (BFF-enriched), `createdAt: String!`, `fileName: String`, `fileChecksum: String` | NO (new) | AC-2, AC-2b, AC-3 |
| `PagedOpeningBalanceData` | type | `content: [OpeningBalanceLine!]!`, `totalElements: Int!`, `totalPages: Int!`, `page: Int!`, `size: Int!`, `aggregates: OpeningBalanceAggregates!` | NO (new) | AC-1, AC-3, AC-6 |
| `OpeningBalanceAggregates` | type | `totalQuantity: Float!`, `totalValue: Float!` | NO (new) | AC-3 |
| `OpeningBalanceSearchInput` | input | `keyword: String`, `warehouseId: Int`, `createdBy: String`, `importedFrom: String`, `importedTo: String`, `page: Int = 0`, `size: Int = 20`, `sort: String = "createdAt,desc"` | NO (new) | AC-4..6 |
| `PagedOpeningBalanceApiResponse` | type (envelope, `implements ApiResponse` per module convention) | `success: Boolean`, `code: String`, `message: String`, `data: PagedOpeningBalanceData` | NO (new) | AC-1 |

> **NEED CONFIRMATION → RESOLVED 2026-07-08 v2**: pattern chốt = `PagedOpeningBalanceApiResponse` là concrete type `implements ApiResponse` interface (shared với `ErrorResponse` — pattern chuẩn module khác cùng repo `agg-garage-graph`, vd catalog-v2 `PagedInternalProductResponse`). SDL return type Query khai `PagedOpeningBalanceApiResponse!` per §3g.2. Query document §3g.6 dùng inline fragment `... on ... { ... } ... on ErrorResponse { ... }` là READ-TIME discrimination qua `__typename` — KHÔNG cần named union type ở SDL. Dev đối chiếu `bffs/agg-garage-graph/src/schema/` khi impl S5a xác nhận `ApiResponse` interface đã tồn tại (chắc chắn có — reuse từ module catalog-v2 W03).

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Query` | `searchOpeningBalances` | `(input: OpeningBalanceSearchInput!): PagedOpeningBalanceApiResponse!` | NO (Non-null return, per §3g.2 source table) | AC-1 |

### 5.3 SDL inline (canonical excerpt — nguyên văn `agg-garage-graph-graphql.md §3g.1`)

```graphql
type OpeningBalanceLine {
  id: Int!
  productCode: String!
  productName: String
  mainUnitCode: String!
  mainUnitName: String              # BFF enrichment via gf-erp-mdm POST /api/v1/catalog/inquiry directory=UNIT (reuse fetchAllUnits() cache TTL 5min). Nullable defensive.
  warehouseCode: String!
  warehouseName: String
  quantityOnHand: Float!
  valueOnHand: Float!
  asOfDate: String!    # ISO-8601 date YYYY-MM-DD
  createdBy: String!
  createdByName: String             # BFF enrichment via ct-saas-tenant Pattern TENANT-USERS. Nullable defensive. KHÔNG có updatedByName (OB snapshot pattern).
  createdAt: String!   # ISO-8601 timestamp
  fileName: String
  fileChecksum: String
}

type PagedOpeningBalanceData {
  content: [OpeningBalanceLine!]!
  totalElements: Int!
  totalPages: Int!
  page: Int!
  size: Int!
  aggregates: OpeningBalanceAggregates!
}

type OpeningBalanceAggregates {
  totalQuantity: Float!
  totalValue: Float!
}

input OpeningBalanceSearchInput {
  keyword: String
  warehouseId: Int
  createdBy: String
  importedFrom: String    # date
  importedTo: String      # date
  page: Int = 0
  size: Int = 20
  sort: String = "createdAt,desc"
}

extend type Query {
  searchOpeningBalances(input: OpeningBalanceSearchInput!): PagedOpeningBalanceApiResponse!
}
```

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `searchOpeningBalances` | query | `input: OpeningBalanceSearchInput!` | `PagedOpeningBalanceApiResponse!` (tagged envelope — response discriminates `__typename: PagedOpeningBalanceApiResponse \| ErrorResponse` per §3g.6 query document; xem NEED CONFIRMATION §5.1) | JWT + X-Tenant-Id | AC-1..6, AC-9 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | Pattern | AC ref |
|---|---|---|---|---|---|
| `searchOpeningBalances` | `src/resolvers/opening-balance/searchOpeningBalances.ts` | `FEAT-OB-LIST` (BE §6, W04-1) | `POST /api/v2/opening-balances/search` | tenant-scoped pure passthrough + 2 enrichments | AC-1..6, AC-9 |

### 6.3 DataLoader / batching strategy

> KHÔNG dùng DataLoader per-item cổ điển (không có nested type resolution) — resolver collect distinct value trước, gọi 1 batch call/loại, request-scoped.

| Batch name | Key shape | Batch endpoint | Cache | AC ref |
|---|---|---|---|---|
| `mainUnitNameBatch` | `{tenantId, unitCodes: distinct mainUnitCode[] từ content[]}` | gf-erp-mdm `POST /api/v1/catalog/inquiry` (directory=UNIT) via `fetchAllUnits()` | Shared TTL 5min key `UNIT::{tenantId}` (reuse catalog V2 mechanism) | AC-2b |
| `createdByNameBatch` | `{tenantId, iamUserIds: distinct createdBy[] từ content[]}` | ct-saas-tenant `POST /api/v1/saas-tenant/tenant-users/search/basic` (Pattern TENANT-USERS, `enrichArrayWithByNames`) | Request-scoped (no cache) | AC-2 |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `searchOpeningBalances` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Dữ liệu có thể đổi ngay bởi FEAT-OB-EDIT/DELETE-LINES; không cache ở BFF (enrichment cache riêng vẫn giữ TTL 5min) |

### 6.5 Persisted query allowlist

Kích hoạt theo policy chung của `agg-garage-graph`. Operation `SearchOpeningBalancesQuery` cần đăng ký hash vào allowlist khi deploy production — thực hiện tại bước S5 exit.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/opening-balance.graphql` | NEW | new module file (song song `accounting-period.graphql`, `inventory-catalog.graphql`) | ~90 | AC-1..9 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/opening-balance/searchOpeningBalances.ts` | NEW | pure passthrough + 2-enrichment resolver | ~70 | AC-1..6, AC-9 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | existing DS — add `searchOpeningBalances` method | ~30 | AC-1 |
| `enrichment/` | `bffs/agg-garage-graph/src/enrichment/catalog-v2.enrichment.ts` | ADDITIVE | reuse `fetchAllUnits()` cache đã có | ~15 | AC-2b |
| `enrichment/` | `bffs/agg-garage-graph/src/enrichment/tenant-users.enrichment.ts` | ADDITIVE (nếu chưa có module riêng, reuse helper Pattern TENANT-USERS hiện hữu) | reuse `enrichArrayWithByNames` | ~15 | AC-2 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/opening-balance/searchOpeningBalances.test.ts` | NEW | apollo test client pattern | ~100 | AC-1..6, AC-9 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/opening-balance-contract.test.ts` | NEW | schema snapshot contract | ~50 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (gf-inventory W04-1 contract stable).

```
(← BE tier S4: gf-inventory W04-1 green)

S5  BFF opening-balance schema + passthrough+enrichment resolver
    Entry: BE FEAT-OB-LIST §6 W04-1 endpoint stable
    Exit:  BFF contract test green (envelope shape match + enrichment batch verified)
    └─► (hand-off FE-web S6, Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Viết SDL types + extend Query | `schema/opening-balance.graphql` | — | schema compiles | — |
| S5.2 | Implement resolver + DS method | `resolvers/` + `data-sources/` | S5.1 done | resolver forward W04-1 + trả envelope | S5.1 |
| S5.3 | Wire 2 enrichment batch (mainUnitName, createdByName) | `enrichment/` | S5.2 done | batch collect distinct + fallback null verified | S5.2 |
| S5.4 | Integration + contract tests | `tests/` | S5.3 done | all tests green | S5.3 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement ở BE tier (xem `features/be/FEAT-OB-LIST.md §9` khi tồn tại). BFF chỉ enforce auth + perf + contract.

| BR ID | Severity | Enforcement tại BFF | File | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-014` | NORMAL | Tenant scope từ JWT — không client-arg; forward filter Kho/Người import/Ngày import nguyên trạng | resolver + DS | AC-4, AC-5, AC-9 | BE primary enforce LIKE/filter/sort; BFF secondary guard tenant |
| `BR-OB-CMN-001` | NORMAL | Trả nguyên `createdBy`/`createdAt` + enrich `createdByName` cho hiển thị "Người import"/"Ngày import" | resolver enrichment | AC-2 | Display-only, không validate |
| `BR-OB-CMN-002` | CORNERSTONE (persona equality) | Schema không phân nhánh quyền đọc theo role — `accountant`/`garage-owner` cùng response shape | schema — không có role-branch logic | AC-9 | Write actions (import/edit/delete) enforce RBAC ở FEAT riêng, không thuộc FEAT-OB-LIST |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration | test-api | gọi `searchOpeningBalances` input rỗng → mock gf-inventory W04-1 → verify envelope `PagedOpeningBalanceApiResponse.data.content/aggregates` |
| AC-2 | BFF integration | test-api | mock W04-1 trả `createdBy` → verify batch call ct-saas-tenant + `createdByName` mapped đúng; mock miss → verify `null` fallback (không throw) |
| AC-2b | BFF integration | test-api | mock `mainUnitCode` distinct → verify batch call gf-erp-mdm UNIT + `mainUnitName` mapped; cache-hit không gọi lại trong TTL |
| AC-3 | BFF integration | test-api | verify `aggregates.totalQuantity`/`totalValue` passthrough nguyên từ downstream, không tự tính lại |
| AC-4 | BFF integration | test-api | `keyword="Lốp"` → verify downstream request body `{ keyword: "Lốp" }` |
| AC-5 | BFF integration | test-api | `warehouseId`, `createdBy`, `importedFrom/To` → verify downstream body forward đúng |
| AC-6 | BFF integration | test-api | `page: 2, size: 10, sort` → verify `PagedOpeningBalanceData.page/size` mapped đúng |
| AC-9 | BFF auth | test-isolation | request thiếu `X-Tenant-Id` → `UNAUTHENTICATED_ERROR`; tenant mismatch → `FORBIDDEN_ERROR`; flag `Inventory:InventoryV2` off (mock BE 403) → `FORBIDDEN_ERROR` |
| passthrough/N+1 | BFF integration | test-api | verify resolver gọi đúng 1 downstream data call + tối đa 2 batch enrichment (không fan-out theo số dòng `content[]`) |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-LIST.md` | N/A (chưa generate) | W04-1 primary endpoint — BFF resolver pure passthrough + 2 enrichment wrap paged envelope |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-LIST.md` | N/A (chưa generate) | Consume `searchOpeningBalances` từ §6.1; render bảng đầy đủ (search+3 filter+checkbox+import/edit/delete nav) |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` | N/A (chưa generate) | View-only; consume cùng `searchOpeningBalances` (không có W04-M1..M5); card layout + infinite-scroll |

**Source ID consistency** (item #18): `source_feat_sha` = `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` — PHẢI identical với BE/FE-web/Mobile tier files khi được generate.

---

## 12. References

- **Source**: [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) v9
- **Paired BE**: [`features/be/FEAT-OB-LIST.md`](../be/FEAT-OB-LIST.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3g Opening Balance (v7.58)
- **REST backend contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3b.2 W04-1 (v44)
- **PKG**: [`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **ADR-020**: Stock ledger daily snapshot (context, không ảnh hưởng trực tiếp query đọc này)
- **ADR-021**: OB period lock cross-boundary (context cho write-path, FEAT-OB-LIST chỉ read)
- **ADR-009**: No JPA relationship mapping — scalar FK pattern (BFF context: không expose join chain trong resolver)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-OB-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (pure passthrough + 2 enrichments), §3 BFF behaviour map 19 AC-ID (13 touch, 6 N/A — write actions/navigation thuộc FEAT-OB-IMPORT/EDIT/DELETE-LINES + AC-5c reuse op có sẵn), §4 auth + perf + feature-flag Inventory:InventoryV2 gate + error mapping, §5 SDL delta (5 new types, NEED CONFIRMATION về union return type chưa khai báo tường minh trong source doc), §6 ops/resolver/batching/cache, §7 file map `bffs/agg-garage-graph/**`, §8 S5 DAG (4 sub-step, thêm S5.3 enrichment wiring), §9 BR secondary (BR-OB-014, BR-OB-CMN-001, BR-OB-CMN-002), §10 test scope, §11 cross-tier (BE/FE-web/Mobile chưa generate tại thời điểm này). Nguồn: `Architecture/api/agg-garage-graph-graphql.md` v7.57 §3g + `Architecture/api/gf-inventory-api.md` v44 §3b.2 W04-1 (đọc bounded theo §0 Wave Index W04). |
| 2026-07-08 | 3 | Delivery Authority | **W04 BFF↔Arch alignment audit remediation Bước 3** (per plan `t-i-li-u-trong-home-engineer-ac-projects-graceful-stallman.md`). §4.5 shift từ "BFF KHÔNG kiểm tra flag" → **BFF resolver-level `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403** (align FEAT-OB-EDIT + FEAT-OB-IMPORT + FEAT-OB-DELETE-LINES + FEAT-AP-EDIT + PKG-W04 §2.2.3 CR-20260707-02). BE guard giữ nguyên làm defense-in-depth cho S2S entry-point. §12 References version cite bump `agg-garage-graph-graphql.md v7.57 → v7.58` (cosmetic §0 Wave Index cascade). Gap version 2 (skipped — no v2 Change Log entry present, dùng v3 để match frontmatter). |
