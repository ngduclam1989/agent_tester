---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-LIST.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-LIST"
source_feat_sha: "d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118"
generated_at: "2026-06-29T00:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["searchInternalProducts"]
paired_backend_feats: ["FEAT-CAT-PROD-LIST"]
paired_fe_web_feats: ["FEAT-CAT-PROD-LIST"]
paired_mobile_feats: ["FEAT-CAT-PROD-LIST"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "{{sha256-fanout-map}}"
  template_sha: "671ef501ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-LIST.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-LIST (BFF): Danh sách mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-LIST` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `searchInternalProducts` |
| Cross-tier pair | BE: `FEAT-CAT-PROD-LIST` \| Web: `FEAT-CAT-PROD-LIST` \| Mobile: `FEAT-CAT-PROD-LIST` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) |
| Source version | v7 |
| Source SHA | `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` |
| Generated at | 2026-06-29T00:00:00Z |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu nhanh danh sách mã sản phẩm nội bộ — chuẩn dùng để tính tồn kho và mapping SKU — để định vị sản phẩm cụ thể, kiểm tra trạng thái/tính chất, và truy cập các thao tác quản lý. Feature là điểm vào chính của subsystem catalog-v2 trong gf-inventory, cung cấp nền dữ liệu cho toàn bộ nghiệp vụ nhập/xuất/tồn kho V2. Kết quả tra cứu được phân trang và lọc đa chiều (từ khóa, trạng thái, tính chất, nhóm vật tư).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query mới `searchInternalProducts(input: InternalProductSearchInput!): PagedInternalProductResponse!` trong catalog module — không chỉnh sửa query `searchProducts` (legacy SKU).
- Resolver pattern: **pure passthrough** — forward input tới gf-inventory `POST /api/v2/internal-products/search` (V2-7) và trả nguyên paged envelope. KHÔNG có per-item DataLoader enrichment.
- Downstream cần gọi: chỉ 1 call — gf-inventory (V2-7). Các display field enriched (`mainUnitDisplayName`, `materialGroupName`, `originDisplayName`) nếu có là do gf-inventory V2-7 payload trả sẵn, KHÔNG do BFF enrich.
- Không đăng ký DataLoader riêng cho query này: resolver chỉ 1 downstream call, không có N+1 risk từ per-item enrichment.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream call gf-inventory.
- Không cache response: dữ liệu catalog thay đổi thường xuyên, tenant-scoped, không có consistent invalidation trigger.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 11 source AC-IDs từ bundle §C. Mỗi AC xuất hiện ở §3 hoặc §4.

### Cluster A — Khởi tạo và tải danh sách

#### AC-1 → BFF expose query đọc danh sách sản phẩm nội bộ

- **Khi**: FE-web hoặc Mobile gọi `searchInternalProducts(input: {})` (input rỗng hoặc default values)
- **BFF phải**: forward nguyên input tới gf-inventory `POST /api/v2/internal-products/search` với tenant context trích từ JWT header; KHÔNG inject default page/size (schema không có default) — gf-inventory tự áp default pagination khi field null
- **Downstream**: gf-inventory V2-7 — body `InternalProductSearchInput {}` (page/size null → BE default)
- **Output shape**: `PagedInternalProductResponse` (union) → `PagedInternalProductApiResponse { data: PagedInternalProductData { content: [InternalProduct], pageInfo: PageInfo } }`
- **Failure mode**: gf-inventory 502/500 → GraphQL `INTERNAL_SERVER_ERROR` extension
- **Ref**: op `searchInternalProducts` (§6.1), resolver `src/resolvers/catalog/searchInternalProducts.ts` (§6.2)

---

### Cluster B — Dữ liệu hiển thị

#### AC-2 → BFF trả nguyên item fields cho từng dòng trong bảng

- **Khi**: resolver nhận mảng `content[]` từ gf-inventory V2-7
- **BFF phải**: trả nguyên `InternalProduct` item như gf-inventory V2-7 payload — KHÔNG enrich display fields. Các field `mainUnitDisplayName`, `materialGroupName`, `originDisplayName` nếu được populate là do gf-inventory V2-7 payload trả sẵn, không do BFF gọi thêm downstream.
- **Downstream**: chỉ gf-inventory V2-7 (không có call bổ sung gf-erp-mdm / V2-3)
- **Output shape**: `InternalProduct` đủ fields cho FE/Mobile render bảng (id, code, name, status, nature, mainUnitCode, mainUnitDisplayName, materialGroupId, materialGroupName, originCode, originDisplayName, brand, imageUrl, ...)
- **Failure mode**: gf-inventory V2-7 502/500 → `INTERNAL_SERVER_ERROR` (không có soft-fail per-field vì không có enrichment)
- **Ref**: paired BE FEAT-CAT-PROD-LIST §5 (V2-7 response schema)

---

### Cluster C — Tìm kiếm và lọc

#### AC-3 → BFF chuyển tiếp keyword tìm kiếm 3 cột

- **Khi**: FE/Mobile truyền `keyword: String` trong `InternalProductSearchInput`
- **BFF phải**: pass `keyword` field vào body gf-inventory V2-7 — BE tự OR-match trên cột `code/name/SKU`; BFF không tự filter
- **Downstream**: gf-inventory V2-7 body `{ keyword: "...", ... }`
- **Output shape**: filtered `PagedInternalProductResponse`

#### AC-4 → BFF chuyển tiếp filter trạng thái

- **Khi**: FE/Mobile truyền `status: InternalProductStatus` (ACTIVE hoặc INACTIVE) trong input
- **BFF phải**: map GraphQL enum → forward `status` field tới V2-7; nếu không truyền, resolver không inject default (để BE dùng default của nó)
- **Downstream**: gf-inventory V2-7 body `{ status: "ACTIVE", ... }`

#### AC-5 → BFF chuyển tiếp filter tính chất sản phẩm

- **Khi**: FE/Mobile truyền `nature: ProductNature` (GOODS/TOOL/SERVICE/OTHER) trong input
- **BFF phải**: map GraphQL enum → forward `nature` tới V2-7; validate enum tại GraphQL layer trước khi gọi downstream (GraphQL schema tự reject giá trị ngoài enum)
- **Downstream**: gf-inventory V2-7 body `{ nature: "GOODS", ... }`

#### AC-6 → BFF chuyển tiếp filter nhóm hàng

- **Khi**: FE/Mobile truyền `materialGroupId: Int` trong input để lọc
- **BFF phải**: forward `materialGroupId` tới V2-7 cho việc lọc; BFF không tự resolve options list
- **Downstream**: gf-inventory V2-7 (filter)
- **Note**: FE lấy option list cho filter dropdown qua query riêng (FEAT-CAT-GRP-LIST) — KHÔNG thuộc phạm vi resolver `searchInternalProducts`

#### AC-7 → BFF truyền pagination params và map pageInfo

- **Khi**: FE/Mobile truyền `page`, `size`, `sort` trong input
- **BFF phải**: forward `page/size/sort` tới gf-inventory V2-7 (Spring Pageable), wrap response page metadata vào `PageInfo { page, size, totalElements, totalPages, first, last, hasNext, hasPrevious }`
- **Downstream**: gf-inventory V2-7 Pageable response
- **Output shape**: `PagedInternalProductResponse.pageInfo` đầy đủ

---

### Cluster D — Tương tác và phân quyền

#### AC-8 → BFF trả status per item để FE/Mobile quyết định action buttons

- **Khi**: resolver trả `content[]`
- **BFF phải**: include `status` (ACTIVE/INACTIVE) và `id` trong mỗi `InternalProduct` — đủ để FE/Mobile render action buttons phù hợp theo trạng thái
- **Note**: logic enable/disable button không nằm ở BFF — BFF chỉ trả data, FE/Mobile tier quyết định render

#### AC-9 → N/A (Mở chức năng từ toolbar — FE/Mobile routing)

- Toolbar actions (create, import, export) là FE/Mobile điều hướng sang feature riêng (FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-IMPORT, FEAT-CAT-PROD-EXPORT). BFF không có touchpoint.

#### AC-10 → BFF enforce tenant scope từ JWT — KHÔNG cho phép client-controlled tenantId

- **Khi**: resolver xử lý bất kỳ request nào
- **BFF phải**: extract tenant context từ JWT (`X-Tenant-Id` header, không từ GraphQL args), propagate xuống gf-inventory trong downstream call
- **Output shape**: query argument `InternalProductSearchInput` KHÔNG có field `tenantId`
- **Failure mode**: thiếu hoặc sai tenant context → `UNAUTHENTICATED` trước khi gọi downstream

#### AC-11 → N/A (Mobile view-only scope — Mobile tier concern)

- Mobile platform dùng cùng `searchInternalProducts` query; không render action buttons create/edit/delete là quyết định Mobile tier. BFF không phân biệt client platform qua query này.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi call downstream propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- Tenant ID lấy từ JWT context, KHÔNG từ GraphQL argument (`tenantId` không xuất hiện trong `InternalProductSearchInput`).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Resolver là pure passthrough: tổng downstream calls = **1** (gf-inventory V2-7) per GraphQL request — không phụ thuộc page size.
- KHÔNG có per-item field resolver / DataLoader → không có N+1 risk. Display fields enriched (nếu có) đến từ V2-7 payload.

### 4.3 Security + data exposure

- KHÔNG log JWT, tenant ID, product code trong resolver debug output.
- Tenant scope enforced ở header layer — client không control được `tenantId` qua args.
- `brand` field trả về là free-text (R18 revert — không validate catalog) — chấp nhận và trả nguyên.

### 4.4 Contract stability

- `InternalProductSearchInput`, `PagedInternalProductResponse`, `PagedInternalProductApiResponse`, `PagedInternalProductData`, `InternalProduct`, `InternalProductStatus`, `ProductNature`, `PricingMethod` là types mới — no breaking change risk.
- Thêm field mới vào `InternalProduct` trong tương lai: additive-only (nullable).
- Field rename → `@deprecated(reason: "...")` giữ old field; Breaking change → CR MAJOR.
- Query `searchProducts` (legacy SKU) KHÔNG bị sửa đổi.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error | Source AC |
|---|---|---|
| gf-inventory 400 (invalid filter/pagination) | `BAD_USER_INPUT` | AC-3, AC-4, AC-5, AC-6, AC-7 |
| gf-inventory 401 / missing tenant | `UNAUTHENTICATED` | AC-10 |
| gf-inventory 403 (forbidden scope) | `FORBIDDEN` | AC-10 |
| gf-inventory 502 / 500 | `INTERNAL_SERVER_ERROR` | AC-1, AC-2 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Schema mới hoàn toàn cho catalog-v2 InternalProduct. Query `searchProducts` (legacy) không bị đụng.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `InternalProductStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new) | AC-4 |
| `ProductNature` | enum | `GOODS`, `TOOL`, `SERVICE`, `OTHER` | NO (new) | AC-5 |
| `PricingMethod` | enum | `PWA`, `SI`, `FIFO`, `MA` | NO (new) | — |
| `InternalProductSearchInput` | input | `keyword: String`, `status: InternalProductStatus`, `nature: ProductNature`, `materialGroupId: Int`, `page: Int`, `size: Int`, `sort: String` (không có default value) | NO (new) | AC-3..7 |
| `InternalProduct` | type | `id: Int!`, `code: String!`, `name: String!`, `mainUnitCode: String!`, `mainUnitDisplayName: String`, `status: InternalProductStatus!`, `nature: ProductNature!`, `pricingMethod: PricingMethod!`, `materialGroupId: Int`, `materialGroupName: String`, `brand: String`, `originCode: String`, `originDisplayName: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`, `imageUrl: String`, `conversionUnits: [InternalProductConversionUnit!]`, `skuMappings: [InternalProductSkuMapping!]`, `attachments: [InternalProductAttachment!]`, `createdAt: String`, `createdBy: String`, `updatedAt: String`, `updatedBy: String` | NO (new) | AC-2 |
| `PagedInternalProductData` | type | `content: [InternalProduct]`, `pageInfo: PageInfo` | NO (new) | AC-1, AC-7 |
| `PagedInternalProductApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: PagedInternalProductData` | NO (new) | AC-1 |
| `PagedInternalProductResponse` | **union** | `= PagedInternalProductApiResponse \| ErrorResponse` | NO (new) | AC-1, AC-7 |

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Query` | `searchInternalProducts` | `(input: InternalProductSearchInput!): PagedInternalProductResponse!` | NO (Non-null return) | AC-1 |

> `PageInfo` reuse existing type trong schema (đã có từ `searchProducts`). KHÔNG tạo duplicate.

### 5.3 SDL inline (canonical excerpt)

```graphql
enum InternalProductStatus {
  ACTIVE
  INACTIVE
}

enum ProductNature {
  GOODS
  TOOL
  SERVICE
  OTHER
}

enum PricingMethod {
  PWA
  SI
  FIFO
  MA
}

input InternalProductSearchInput {
  keyword: String
  status: InternalProductStatus
  nature: ProductNature
  materialGroupId: Int
  page: Int
  size: Int
  sort: String
}

# Canonical shared type — list view consumes a subset; full type expose all fields.
type InternalProduct {
  id: Int!
  code: String!
  name: String!
  mainUnitCode: String!
  mainUnitDisplayName: String
  status: InternalProductStatus!
  nature: ProductNature!
  pricingMethod: PricingMethod!
  materialGroupId: Int
  materialGroupName: String
  brand: String
  originCode: String
  originDisplayName: String
  productSpec: String
  technicalSpec: String
  description: String
  notes: String
  imageUrl: String
  conversionUnits: [InternalProductConversionUnit!]
  skuMappings: [InternalProductSkuMapping!]
  attachments: [InternalProductAttachment!]
  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type PagedInternalProductData {
  content: [InternalProduct]
  pageInfo: PageInfo
}

type PagedInternalProductApiResponse implements ApiResponse {
  success: Boolean
  code: String
  message: String
  data: PagedInternalProductData
}

union PagedInternalProductResponse = PagedInternalProductApiResponse | ErrorResponse

extend type Query {
  searchInternalProducts(input: InternalProductSearchInput!): PagedInternalProductResponse!
}
```

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `searchInternalProducts` | query | `input: InternalProductSearchInput!` | `PagedInternalProductResponse!` | JWT + X-Tenant-Id | AC-1..7, AC-10 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream FEAT | REST endpoint | Pattern | AC ref |
|---|---|---|---|---|---|
| `searchInternalProducts` | `src/resolvers/catalog/searchInternalProducts.ts` | FEAT-CAT-PROD-LIST (BE V2-7) | `POST /api/v2/internal-products/search` | tenant-scoped pure passthrough | AC-1..7 |

> KHÔNG có per-item field resolver: `mainUnitDisplayName`, `materialGroupName`, `originDisplayName` được gf-inventory V2-7 payload trả sẵn — resolver trả nguyên item.

### 6.3 DataLoader / batching strategy

> Không áp dụng: resolver `searchInternalProducts` là pure passthrough (1 downstream call gf-inventory V2-7), không có per-item enrichment → không cần DataLoader. Các display field enriched đến trực tiếp từ V2-7 payload.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `searchInternalProducts` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Catalog data thay đổi thường xuyên; không cache list |

### 6.5 Persisted query allowlist

Kích hoạt theo policy chung của `agg-garage-graph`. Operation `SearchInternalProducts` cần đăng ký hash vào allowlist khi deploy production — thực hiện tại bước S5 exit.

---

## 7. File / module impact map

> Path glob ⊆ `bffs/agg-garage-graph/**` (boundary isolation §3.2 Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Est LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/inventory-catalog.graphql` | NEW | new module file | ~75 | AC-1..7 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/searchInternalProducts.ts` | NEW | pure passthrough resolver | ~45 | AC-1..7, AC-10 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | existing DS — add `searchInternalProducts` method | ~35 | AC-1 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog/searchInternalProducts.test.ts` | NEW | apollo test client pattern | ~100 | AC-1..7 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/inventory-catalog-contract.test.ts` | NEW | schema snapshot contract | ~50 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (gf-inventory V2-7 contract stable).

```
(← BE tier S4: gf-inventory V2-7 green)

S5  BFF catalog schema + pure passthrough resolver
    Entry: BE FEAT-CAT-PROD-LIST §6 V2-7 endpoint stable
    Exit:  BFF contract test green (union envelope shape match)
    └─► (hand-off FE-web S6, Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Viết SDL types + extend Query | `schema/inventory-catalog.graphql` | — | schema compiles | — |
| S5.2 | Implement resolver + DS method | `resolvers/` + `data-sources/` | S5.1 done | resolver forward V2-7 + trả union envelope | S5.1 |
| S5.3 | Integration + contract tests | `tests/` | S5.2 done | all tests green | S5.2 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement ở BE tier (xem `features/be/FEAT-CAT-PROD-LIST.md §9`). BFF chỉ enforce auth + perf + contract.

| BR ID | Severity | Enforcement tại BFF | File | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-007` | CORNERSTONE | Tenant scope từ JWT — KHÔNG client-arg | resolver + DS | AC-10 | BE primary; BFF secondary guard |
| `BR-CAT-PROD-008` | NORMAL | Status filter forward đúng; không inject default nếu client không truyền | resolver input mapping | AC-4 | BE xử lý default |
| `BR-CAT-CMN-003` | NORMAL | List view (FE/Mobile) không render audit fields; `InternalProduct` type có expose `createdAt/By`, `updatedAt/By` nhưng client tự chọn subset | schema — client field selection | AC-2 | Detail view (FEAT-CAT-PROD-DETAIL) dùng cùng type |
| `BR-CAT-PROD-019` | NORMAL | `nature` enum chỉ 4 giá trị `GOODS/TOOL/SERVICE/OTHER` — GraphQL schema reject tự động | `ProductNature` enum | AC-5 | Schema-level enforcement |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration | test-api | gọi `searchInternalProducts` input rỗng → mock gf-inventory V2-7 → verify `PagedInternalProductResponse` union → `PagedInternalProductApiResponse.data.content/pageInfo` structure |
| AC-2 | BFF integration | test-api | mock gf-inventory V2-7 trả item có sẵn display fields → verify resolver trả nguyên item (không call downstream bổ sung) |
| AC-3 | BFF integration | test-api | `keyword="ABC"` → verify downstream request body `{ keyword: "ABC" }` |
| AC-4 | BFF integration | test-api | `status: INACTIVE` → downstream body `{ status: "INACTIVE" }` |
| AC-5 | BFF integration | test-api | `nature: TOOL` → downstream body `{ nature: "TOOL" }` |
| AC-6 | BFF integration | test-api | `materialGroupId: 5` → downstream body `{ materialGroupId: 5 }` |
| AC-7 | BFF integration | test-api | `page: 2, size: 10` → verify `pageInfo.page=2`, `pageInfo.size=10` mapped correctly |
| AC-10 | BFF auth | test-isolation | request thiếu `X-Tenant-Id` → `UNAUTHENTICATED`; valid JWT → tenantId propagated trong downstream header |
| passthrough | BFF integration | test-api | verify resolver chỉ gọi đúng 1 downstream (gf-inventory V2-7) per request — không có call enrichment bổ sung |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-LIST.md` | DRAFT | V2-7 primary endpoint — BFF resolver pure passthrough wrap paged envelope |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-LIST.md` | DRAFT | Consume `searchInternalProducts` từ §6.1; render bảng với display fields đến từ V2-7 payload |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-LIST.md` | DRAFT | AC-11 view-only scope; consume `searchInternalProducts` từ §6.1; không render write action buttons |

**Source ID consistency** (item #18): `source_feat_sha` = `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` — identical với BE/FE-web/Mobile tier files.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) v7
- **Paired BE**: [`features/be/FEAT-CAT-PROD-LIST.md`](../be/FEAT-CAT-PROD-LIST.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Additive aggregates — InternalProduct + MaterialGroup entities trong gf-inventory (ADR relevant for BE schema, BFF context)
- **ADR-009**: No JPA relationship mapping — scalar FK pattern (BFF context: không expose join chain trong resolver)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec W03 FEAT-CAT-PROD-LIST. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough+enrich, §3 BFF behaviour map 11 ACs (9 touch, 2 N/A), §4 auth+perf+error, §5 SDL delta (5 new types + extend Query), §6 ops/resolver/DataLoader (6 loaders — 2 NEED CONFIRMATION), §7 file map agg-garage-graph, §8 S5 DAG, §9 BR secondary, §10 test scope, §11 cross-tier. NEED CONFIRMATION: gf-erp-mdm batch endpoint paths (loaders 1-2), loaders 5-6 identity. |
| 2026-07-01 | 2 | main agent (audit) | Reconcile spec khớp code thật (inventory-catalog.schema.ts). Rename `InternalProductListItem` → `InternalProduct` + bổ sung đủ field thật; `InternalProductNature` → `ProductNature`; thêm enum `PricingMethod`. §5.1: `materialGroupId: ID`→`Int`, `id: ID!`→`Int!`, bỏ default `page=0`/`size=20`; `PagedInternalProductResponse` sửa thành UNION (`PagedInternalProductApiResponse \| ErrorResponse`) + envelope `PagedInternalProductApiResponse`(success/code/message nullable, data) + `PagedInternalProductData{content,pageInfo}`. Gỡ toàn bộ kiến trúc DataLoader/enrichment không tồn tại trong code (§2, §3 AC-2/AC-6, §4.2, §6.2, §6.3, §7, §8, §9 N+1, §10): resolver là pure passthrough 1 downstream call gf-inventory V2-7, display field enriched đến từ V2-7 payload. Drop gf-erp-mdm khỏi boundaries_consumed. Versioning 3-in-1. |
