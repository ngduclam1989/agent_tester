---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-DETAIL.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DETAIL"
source_feat_sha: "1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory", "gf-erp-mdm"]
modifies: []
change_type: "new-capability"
graphql_ops:
  - "getInternalProduct"
  - "searchSkus"
  - "mapSkuToInternalProduct"
  - "unmapSkuFromInternalProduct"
  - "addConversionUnit"
  - "updateConversionUnit"
  - "deleteConversionUnit"
paired_backend_feats: ["FEAT-CAT-PROD-DETAIL"]
paired_fe_web_feats: ["FEAT-CAT-PROD-DETAIL"]
paired_mobile_feats: ["FEAT-CAT-PROD-DETAIL"]
authoring_inputs:
  kg_baseline_sha: ""
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DETAIL.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-DETAIL (BFF): Xem chi tiết mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DETAIL` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory`, `gf-erp-mdm` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `getInternalProduct`, `searchSkus`, `mapSkuToInternalProduct`, `unmapSkuFromInternalProduct`, `addConversionUnit`, `updateConversionUnit`, `deleteConversionUnit` |
| Cross-tier pair | BE: `FEAT-CAT-PROD-DETAIL` \| Web: `FEAT-CAT-PROD-DETAIL` \| Mobile: `FEAT-CAT-PROD-DETAIL` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) |
| Source version | v10 |
| Source SHA | `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` |
| Generated at | 2026-06-29T14:36:41+00:00 |
| Bundle | `/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DETAIL.bff.md` |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu đầy đủ thông tin một mã sản phẩm nội bộ — thông tin chung, đơn vị tính quy đổi, SKU được gắn, và tệp đính kèm — để nắm bản chất vật tư và cập nhật mapping ngay trên màn hình chi tiết mà không phải vào form sửa riêng. Feature này là điểm tra cứu trung tâm trong luồng quản lý danh mục mã SP nội bộ V2, hỗ trợ nền dữ liệu vật tư phục vụ tính tồn và báo cáo toàn hệ thống Garage.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose query `getInternalProduct(id: Int!): InternalProductResponse!` — primary call tới gf-inventory V2-8 + orchestrate enrichment song song từ gf-erp-mdm cho `mainUnitDisplayName` và `originDisplayName` (R18). Data type là `InternalProduct` (bọc trong `InternalProductApiResponse`).
- Expose query `searchSkus(q: String, unmapped: Boolean, page: Int, size: Int): PagedSkuSearchResponse!` — hỗ trợ modal "Gắn SKU" tìm kiếm legacy SKU catalog; args flat (không có `SearchSkuInput`).
- Expose 4 inline mutation cho thao tác quản lý từ màn hình detail: `mapSkuToInternalProduct`, `unmapSkuFromInternalProduct`, `addConversionUnit`, `deleteConversionUnit` — passthrough tới gf-inventory.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống mọi downstream REST call.
- Map gf-inventory error codes (`ERR-INV-013/014/015/047`) sang GraphQL error codes.
- KHÔNG cache `getInternalProduct` (dữ liệu mutable — UOM/SKU/attachment thay đổi inline).

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Detail query & enrichment

#### AC-1 → BFF expose getInternalProduct query entry point

- **Khi**: FE/Mobile gửi `query { getInternalProduct(id: Int!) { ... } }`
- **BFF phải**: gọi gf-inventory `GET /api/v2/internal-products/{id}` — critical; 404 hoặc wrong-tenant → abort, trả lỗi. Tenant context resolve từ `Authorization` JWT, KHÔNG từ path param.
- **Downstream**: `gf-inventory GET /api/v2/internal-products/{id}` (primary, abort on fail)
- **Output shape**: `InternalProductResponse` union → success branch `InternalProductApiResponse { data: InternalProduct }`
- **Failure mode**: 404 → `INTERNAL_PRODUCT_NOT_FOUND`; 401/403 → `FORBIDDEN`
- **Ref**: op `getInternalProduct` (§6.1), resolver `src/resolvers/catalog/getInternalProduct.ts` (§6.2)

#### AC-2 → BFF orchestrate enrichment để populate display names

- **Khi**: V2-8 response thành công; `mainUnitCode` luôn present; `originCode` nullable
- **BFF phải**: Promise.all song song — (a) gf-erp-mdm resolve `mainUnitDisplayName` từ `mainUnitCode` (directory=UNIT); (b) nếu `originCode` không null → resolve `originDisplayName` từ `originCode` (directory=COUNTRY, R18 NEW). `materialGroupName` passthrough từ V2-8 payload (gf-inventory JOIN sẵn). KHÔNG có `brandDisplayName` (R18 — brand là free-text raw string).
- **Downstream**: gf-erp-mdm catalog lookup (2 calls, non-critical — enrichment fail → field null, log warn, không abort)
- **Output shape**: `InternalProduct.mainUnitDisplayName: String`, `.originDisplayName: String`, `.materialGroupName: String`

#### AC-3 → BFF passthrough audit fields

- **Khi**: V2-8 response bao gồm audit metadata
- **BFF phải**: map `createdAt`, `createdBy`, `updatedAt`, `updatedBy` → `InternalProduct` type. Không transform, không strip.
- **Output shape**: `InternalProduct.createdAt: String`, `.createdBy: String`, `.updatedAt: String`, `.updatedBy: String`

#### AC-4 → BFF assemble nested collection tabs

- **Khi**: V2-8 enriched response bao gồm collections đã preload
- **BFF phải**: map `skuMappings[]`, `conversionUnits[]`, `attachments[]` từ V2-8 payload → typed arrays. Single downstream call, không N+1 secondary fetch cho collections.
- **Output shape**: `InternalProduct.skuMappings: [InternalProductSkuMapping!]`, `.conversionUnits: [InternalProductConversionUnit!]`, `.attachments: [InternalProductAttachment!]`

### Cluster B — UOM conversion inline management

#### AC-5 → BFF expose UOM conversion CRUD mutations

- **Khi**: FE gửi mutation add hoặc remove conversion unit inline từ tab ĐVT quy đổi
- **BFF phải**:
  - Add: `addConversionUnit(id: Int!, input: ConversionUnitInput!)` → passthrough gf-inventory `POST /api/v2/internal-products/{id}/conversion-units` body `{unitCode, conversionRate}` (input field là `unitCode`, KHÔNG phải `uomCode`).
  - Remove: `deleteConversionUnit(id: Int!, unitId: Int!)` → passthrough gf-inventory `DELETE /api/v2/internal-products/{id}/conversion-units/{unitId}` (removal by `unitId: Int!`, KHÔNG phải `uomCode`).
  - Code cũng expose `updateConversionUnit(id: Int!, unitId: Int!, input: ConversionUnitInput!)` — DETAIL screen chủ yếu dùng add + delete; op update giữ ở SDL cho hoàn chỉnh, không phải trọng tâm feature này.
  - BFF không tự validate `conversionRate` scale — BE enforce `ERR-INV-047` (R29). BFF chỉ surface error.
- **Downstream**: gf-inventory (critical — abort nếu fail, không retry mặc định)
- **Output shape**: Add → `InternalProductConversionUnitResponse` union; Remove → `DeleteResponse` union
- **Failure mode**: `ERR-INV-013` → `CONVERSION_RATE_INVALID`; `ERR-INV-014` → `CONVERSION_UNIT_DUPLICATE`; `ERR-INV-047` (R29 scale >6 decimal, BR-CAT-PROD-011 v15) → `CONVERSION_RATE_SCALE_EXCEEDED`; BR-CAT-PROD-012 (UOM immutable khi có giao dịch) → `CONVERSION_UNIT_IMMUTABLE`

### Cluster C — SKU mapping inline management

#### AC-6 → BFF expose SKU search + link mutation

- **Khi**: FE mở modal "Gắn SKU" → search SKU → confirm gắn
- **BFF phải**:
  - Search: `searchSkus(q: String, unmapped: Boolean, page: Int, size: Int)` → passthrough tới legacy SKU catalog; args flat (không có `SearchSkuInput`). Filter "SKU chưa được map" qua arg `unmapped: Boolean`. Trả `PagedSkuSearchResponse` (data `PagedSkuSearchData { content: [SkuSearchResult], pageInfo: PageInfo }`).
  - Link: `mapSkuToInternalProduct(id: Int!, productId: Int!)` → passthrough gf-inventory `POST /api/v2/internal-products/{id}/sku-mappings` body `{productId}` (`id` = internal product id trên path; `productId` = legacy SKU/product id trong body).
- **Downstream**: SKU search (non-critical, modal context — fail hiện empty list); gf-inventory link mutation (critical)
- **Output shape**: Search → `PagedSkuSearchResponse` union; Link → `InternalProductSkuMappingResponse` union
- **Failure mode**: `ERR-INV-015` (SKU đã thuộc internal product khác, BR-CAT-PROD-013) → `SKU_ALREADY_MAPPED`

#### AC-7 → BFF expose unlink SKU mutation

- **Khi**: FE bấm "Bỏ gắn" một SKU từ tab SKU mappings
- **BFF phải**: `unmapSkuFromInternalProduct(id: Int!, productId: Int!)` → passthrough gf-inventory `DELETE /api/v2/internal-products/{id}/sku-mappings/{productId}`. BR-CAT-PROD-014: xóa mapping, KHÔNG xóa SKU gốc — op name và semantic phải rõ.
- **Downstream**: gf-inventory (critical)
- **Output shape**: `DeleteResponse` union (data: DeleteResultData)
- **Failure mode**: mapping không tồn tại → GraphQL error; wrong tenant → `FORBIDDEN`

### Cluster D — Attachments

#### AC-8 → BFF passthrough attachment metadata từ V2-8

- **Khi**: V2-8 response bao gồm `attachments[]`
- **BFF phải**: map `fileUrl` (relative path từ gf-inventory — ct-file-storage object key), `fileName`, `fileSizeBytes`, `fileType`, `attachmentKind` → `InternalProductAttachment[]`. KHÔNG compose full download URL tại BFF — FE nối env domain config theo ADR-016 pattern.
- **Output shape**: `InternalProduct.attachments: [InternalProductAttachment!]`

#### AC-10 → N/A tại BFF tier

- "Các nút hành động" (Sửa, Xóa, Kích hoạt/Ngừng) là FE UI routing. Mutations tương ứng thuộc FEAT-CAT-PROD-EDIT (edit, toggle status) và FEAT-CAT-PROD-DELETE (delete). BFF không spec lại các mutations đó trong file này.

### Cluster E — Permissions & mobile scope

#### AC-11 → RBAC guard tại resolver layer

- **BFF phải**: enforce auth guard trên mọi op. Read ops (`getInternalProduct`, `searchSkus`) — cả `garage-owner` + `accountant` đều được. Write mutations (`mapSku`, `unmapSku`, `addConversionUnit`, `deleteConversionUnit`) — **NEED CONFIRMATION [NC-4]**: chỉ `garage-owner` hay cả `accountant` cũng có quyền thực hiện inline mutations?
- JWT missing/invalid → `UNAUTHENTICATED`. Tenant isolation: propagate `X-Tenant-Id` từ JWT — gf-inventory TenantFilter enforce tại BE (cross-tenant fetch → 404).

#### AC-12 → Mobile scope: read-only passthrough

- BFF GraphQL schema không phân biệt mobile vs web — cùng schema cho cả hai platform. Mobile tier FEAT-CAT-PROD-DETAIL chỉ consume `getInternalProduct` query (view-only, per source AC-12). Mutations (`mapSku`, `unmapSku`, `addConversionUnit`, `deleteConversionUnit`) mobile KHÔNG call — scope điều phối ở Mobile tier spec, không cần BFF-level restriction.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- JWT missing/invalid → GraphQL error `UNAUTHENTICATED` trước khi gọi downstream.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- `getInternalProduct`: 1 primary call (V2-8) + tối đa 2 enrichment calls (gf-erp-mdm, song song) — tổng tối đa 3 concurrent downstream calls. Collections (skuMappings/conversionUnits/attachments) preloaded trong V2-8 — không N+1.
- `searchSkus`: single downstream call.
- Write mutations: single downstream call mỗi op.
- KHÔNG cần DataLoader (không có list resolver per-field resolution across multiple parent objects trong feature này).

### 4.3 Security + data exposure

- KHÔNG log JWT / Bearer token / PII trong resolver.
- `fileUrl` attachment là relative path — BFF KHÔNG compose full URL (FE handle per ADR-016). KHÔNG expose ct-file-storage domain tại BFF layer.
- Tenant isolation: `X-Tenant-Id` từ JWT, KHÔNG từ client-controlled arg.

### 4.4 Contract stability

- Mọi type/field/op là new-capability — không breaking change với schema hiện có.
- Breaking change trong tương lai → CR MAJOR + `@deprecated(reason: "...")` keep old field.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| gf-inventory 404 (product not found) | `INTERNAL_PRODUCT_NOT_FOUND` | AC-1 |
| gf-inventory 401 / 403 | `FORBIDDEN` | AC-1, AC-11 |
| `ERR-INV-013` (conversionRate ≤ 0) | `CONVERSION_RATE_INVALID` | AC-5 |
| `ERR-INV-014` (duplicate UOM code) | `CONVERSION_UNIT_DUPLICATE` | AC-5 |
| `ERR-INV-047` (scale > 6 decimal, R29) | `CONVERSION_RATE_SCALE_EXCEEDED` | AC-5 |
| BE BR-CAT-PROD-012 (UOM immutable khi có giao dịch) | `CONVERSION_UNIT_IMMUTABLE` | AC-5 |
| `ERR-INV-015` (SKU đã thuộc internal product khác) | `SKU_ALREADY_MAPPED` | AC-6 |
| mapping không tồn tại (unlink) | `SKU_MAPPING_NOT_FOUND` | AC-7 |

---

## 5. GraphQL SDL delta

### 5.1 New types

| Type name | Kind | Key fields | Breaking? | AC ref |
|---|---|---|---|---|
| `InternalProduct` | type | `id: Int!`, `code: String!`, `name: String!`, `mainUnitCode: String!`, `mainUnitDisplayName: String`, `status: InternalProductStatus!`, `nature: ProductNature!`, `pricingMethod: PricingMethod!`, `materialGroupId: Int`, `materialGroupName: String`, `brand: String`, `originCode: String`, `originDisplayName: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`, `imageUrl: String`, `conversionUnits: [InternalProductConversionUnit!]`, `skuMappings: [InternalProductSkuMapping!]`, `attachments: [InternalProductAttachment!]`, `createdAt: String`, `createdBy: String`, `updatedAt: String`, `updatedBy: String` | NO (new) | AC-1..AC-8 |
| `InternalProductSkuMapping` | type | `id: Int!`, `productId: Int!`, `sku: String!`, `productName: String` | NO (new) | AC-4, AC-6, AC-7 |
| `InternalProductConversionUnit` | type | `id: Int!`, `unitCode: String!`, `unitDisplayName: String`, `conversionRate: Float!` | NO (new) | AC-4, AC-5 |
| `InternalProductAttachment` | type | `id: Int!`, `fileUrl: String!`, `fileName: String!`, `fileType: String!`, `fileSizeBytes: Int!`, `attachmentKind: String!` | NO (new) | AC-4, AC-8 |
| `InternalProductApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: InternalProduct` | NO (new) | AC-1 |
| `InternalProductConversionUnitApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: InternalProductConversionUnit` | NO (new) | AC-5 |
| `InternalProductSkuMappingApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: InternalProductSkuMapping` | NO (new) | AC-6 |
| `SkuSearchResult` | type | `productId: Int!`, `sku: String!`, `name: String`, `brand: String`, `origin: String`, `mappingStatus: SkuMappingStatus!`, `mappedInternalProductCode: String` | NO (new) | AC-6 |
| `PagedSkuSearchData` | type | `content: [SkuSearchResult]`, `pageInfo: PageInfo` | NO (new) | AC-6 |
| `PagedSkuSearchApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: PagedSkuSearchData` | NO (new) | AC-6 |
| `DeleteApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: DeleteResultData` | NO (new) | AC-5, AC-7 |
| `DeleteResultData` | type | `id: Int`, `code: String`, `success: Boolean` | NO (new) | AC-5, AC-7 |
| `ConversionUnitInput` | input | `unitCode: String!`, `conversionRate: Float!` | NO (new) | AC-5 |
| `InternalProductStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new) | AC-2 |
| `ProductNature` | enum | `GOODS`, `TOOL`, `SERVICE`, `OTHER` | NO (new) | AC-2 |
| `PricingMethod` | enum | `PWA`, `SI`, `FIFO`, `MA` | NO (new) | AC-1 |
| `SkuMappingStatus` | enum | `UNMAPPED`, `MAPPED_OTHER`, `MAPPED_SELF` | NO (new) | AC-6 |

### 5.2 New union types

| Union name | Members | AC ref |
|---|---|---|
| `InternalProductResponse` | `InternalProductApiResponse \| ErrorResponse` | AC-1 |
| `PagedSkuSearchResponse` | `PagedSkuSearchApiResponse \| ErrorResponse` | AC-6 |
| `InternalProductSkuMappingResponse` | `InternalProductSkuMappingApiResponse \| ErrorResponse` | AC-6 |
| `InternalProductConversionUnitResponse` | `InternalProductConversionUnitApiResponse \| ErrorResponse` | AC-5 |
| `DeleteResponse` | `DeleteApiResponse \| ErrorResponse` | AC-5, AC-7 |

### 5.3 Root operation extensions

```graphql
extend type Query {
  # V2-Q5: detail enriched cho màn hình chi tiết mã SP nội bộ
  getInternalProduct(id: Int!): InternalProductResponse!
  # V2-Q8: tìm kiếm SKU legacy cho modal "Gắn SKU" (args flat, filter unmapped)
  searchSkus(q: String, unmapped: Boolean, page: Int, size: Int): PagedSkuSearchResponse!
}

extend type Mutation {
  # id = internal product id (path); productId = legacy SKU/product id (body)
  mapSkuToInternalProduct(id: Int!, productId: Int!): InternalProductSkuMappingResponse!
  unmapSkuFromInternalProduct(id: Int!, productId: Int!): DeleteResponse!
  addConversionUnit(id: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!
  # updateConversionUnit tồn tại trong code; DETAIL screen chủ yếu add + delete
  updateConversionUnit(id: Int!, unitId: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!
  deleteConversionUnit(id: Int!, unitId: Int!): DeleteResponse!
}
```

---

## 6. GraphQL Operations contract

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `getInternalProduct` | query | `id: Int!` | `InternalProductResponse!` | JWT + tenantId | AC-1..AC-4, AC-8 |
| `searchSkus` | query | `q: String, unmapped: Boolean, page: Int, size: Int` | `PagedSkuSearchResponse!` | JWT + tenantId | AC-6 |
| `mapSkuToInternalProduct` | mutation | `id: Int!, productId: Int!` | `InternalProductSkuMappingResponse!` | JWT + tenantId | AC-6 |
| `unmapSkuFromInternalProduct` | mutation | `id: Int!, productId: Int!` | `DeleteResponse!` | JWT + tenantId | AC-7 |
| `addConversionUnit` | mutation | `id: Int!, input: ConversionUnitInput!` | `InternalProductConversionUnitResponse!` | JWT + tenantId | AC-5 |
| `updateConversionUnit` | mutation | `id: Int!, unitId: Int!, input: ConversionUnitInput!` | `InternalProductConversionUnitResponse!` | JWT + tenantId | AC-5 |
| `deleteConversionUnit` | mutation | `id: Int!, unitId: Int!` | `DeleteResponse!` | JWT + tenantId | AC-5 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE | REST endpoint | AC ref |
|---|---|---|---|---|
| `getInternalProduct` | `src/resolvers/catalog/getInternalProduct.ts` | `gf-inventory` | `GET /api/v2/internal-products/{id}` | AC-1 |
| `getInternalProduct` (enrichment unit) | `src/resolvers/catalog/getInternalProduct.ts` | `gf-erp-mdm` | catalog lookup directory=UNIT (Promise.all branch A) | AC-2 |
| `getInternalProduct` (enrichment country) | `src/resolvers/catalog/getInternalProduct.ts` | `gf-erp-mdm` | catalog lookup directory=COUNTRY (Promise.all branch B, R18) | AC-2 |
| `searchSkus` | `src/resolvers/catalog/searchSkus.ts` | `gf-inventory` | SKU search (args `q`/`unmapped`/`page`/`size`) → `PagedSkuSearchData` | AC-6 |
| `mapSkuToInternalProduct` | `src/resolvers/catalog/mapSkuToInternalProduct.ts` | `gf-inventory` | `POST /api/v2/internal-products/{id}/sku-mappings` body `{productId}` | AC-6 |
| `unmapSkuFromInternalProduct` | `src/resolvers/catalog/unmapSkuFromInternalProduct.ts` | `gf-inventory` | `DELETE /api/v2/internal-products/{id}/sku-mappings/{productId}` | AC-7 |
| `addConversionUnit` | `src/resolvers/catalog/addConversionUnit.ts` | `gf-inventory` | `POST /api/v2/internal-products/{id}/conversion-units` | AC-5 |
| `updateConversionUnit` | `src/resolvers/catalog/updateConversionUnit.ts` | `gf-inventory` | `PUT /api/v2/internal-products/{id}/conversion-units/{unitId}` | AC-5 |
| `deleteConversionUnit` | `src/resolvers/catalog/deleteConversionUnit.ts` | `gf-inventory` | `DELETE /api/v2/internal-products/{id}/conversion-units/{unitId}` | AC-5 |

### 6.3 DataLoader / batching strategy

Không cần DataLoader cho feature này. Enrichment gf-erp-mdm trong `getInternalProduct` là fixed-count (tối đa 2 calls) chạy qua Promise.all — không phải list iteration per parent object.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `getInternalProduct` | `@cacheControl(maxAge: 0)` | — | mutable inline — UOM/SKU/attachment thay đổi trực tiếp từ màn hình này |
| `searchSkus` | `@cacheControl(maxAge: 30, scope: PRIVATE)` | 30s | SKU catalog tương đối ổn định; scope PRIVATE theo tenant |
| mutations (4 ops) | `@cacheControl(maxAge: 0)` | — | không cache |

### 6.5 Persisted query allowlist

Không bắt buộc ở tier dev. Production enforcement tùy Apollo Router config.

---

## 7. File/module impact map

> Paths ⊆ `bffs/agg-garage-graph/**` (boundary isolation rule #1).

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/catalog.graphql` | MODIFY additive | extend SDL — new types + union + ops | ~130 | §5.1-5.3 |
| `resolvers/` | `src/resolvers/catalog/getInternalProduct.ts` | NEW | orchestrator resolver (primary + Promise.all enrichment) | ~75 | AC-1..4, AC-8 |
| `resolvers/` | `src/resolvers/catalog/searchSkus.ts` | NEW | passthrough query resolver | ~35 | AC-6 |
| `resolvers/` | `src/resolvers/catalog/mapSkuToInternalProduct.ts` | NEW | mutation resolver passthrough | ~30 | AC-6 |
| `resolvers/` | `src/resolvers/catalog/unmapSkuFromInternalProduct.ts` | NEW | mutation resolver passthrough | ~25 | AC-7 |
| `resolvers/` | `src/resolvers/catalog/addConversionUnit.ts` | NEW | mutation resolver passthrough | ~30 | AC-5 |
| `resolvers/` | `src/resolvers/catalog/updateConversionUnit.ts` | NEW | mutation resolver passthrough (op tồn tại trong code) | ~30 | AC-5 |
| `resolvers/` | `src/resolvers/catalog/deleteConversionUnit.ts` | NEW | mutation resolver passthrough | ~25 | AC-5 |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | new methods: `getInternalProductById`, `searchSkus`, `mapSku`, `unmapSku`, `addConversionUnit`, `updateConversionUnit`, `deleteConversionUnit` | ~95 | AC-1, AC-5, AC-6, AC-7 |
| `data-sources/` | `src/data-sources/GfErpMdmDataSource.ts` | ADDITIVE | new methods: `getUomDisplayName`, `getCountryDisplayName` | ~35 | AC-2 |
| `tests/integration` | `tests/integration/catalog-product-detail.test.ts` | NEW | Apollo test client — mock gf-inventory + gf-erp-mdm | ~100 | AC-1..AC-8, AC-11 |

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory V2-8 + SKU mapping / conversion-unit mutation endpoints stable)

S5  BFF schema + resolver wire
    Entry: BE FEAT-CAT-PROD-DETAIL §6 contracts stable (V2-8 response shape + mutation paths)
    Exit: BFF contract test green + enrichment pipeline pass + N+1 check pass
    └─► (hand-off FE-web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | SDL schema extend catalog.graphql | schema | — | SDL compile OK | — |
| S5.2 | DataSource methods (GfInventoryDataSource + GfErpMdmDataSource) | data-sources | S5.1 | method impl pass | S5.1 |
| S5.3 | Resolver `getInternalProduct` + enrichment orchestration | resolvers | S5.2 | resolver unit test pass | S5.2 |
| S5.4 | mutation resolvers (add/update/delete UOM, map/unmap SKU) | resolvers | S5.2 | mutation resolver pass | S5.2 |
| S5.5 | Resolver `searchSkus` | resolvers | S5.2 | search resolver pass | S5.2 |
| S5.6 | Integration test suite | tests | S5.3..S5.5 | all tests green | S5.3..S5.5 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement = BE tier. Xem `features/be/FEAT-CAT-PROD-DETAIL.md §9`.

| BR ID | Enforcement at BFF | Where (path) | Touchpoint AC | Notes |
|---|---|---|---|---|
| `BR-CAT-CMN-001` (audit trail) | N/A — BE enforces; BFF passthrough audit fields | `getInternalProduct` resolver | AC-3 | passthrough only |
| `BR-CAT-PROD-011` (conversionRate > 0, scale ≤6, v15) | Surface `ERR-INV-047` từ BE → `CONVERSION_RATE_SCALE_EXCEEDED` | `addConversionUnit.ts` | AC-5 | BE enforce primary |
| `BR-CAT-PROD-012` (UOM immutable khi có giao dịch) | Surface error từ BE → `CONVERSION_UNIT_IMMUTABLE` | `deleteConversionUnit.ts` | AC-5 | passthrough error |
| `BR-CAT-PROD-013` (1 SKU max 1 internal product) | Surface `ERR-INV-015` → `SKU_ALREADY_MAPPED` | `mapSkuToInternalProduct.ts` | AC-6 | passthrough error |
| `BR-CAT-PROD-014` (unlink ≠ xóa SKU gốc) | Op semantic: DELETE mapping endpoint, KHÔNG DELETE sku master | `unmapSkuFromInternalProduct.ts` | AC-7 | semantic guard |
| RBAC (AC-11) | Auth guard tại resolver entry | tất cả resolvers | AC-11 | NC-4 NEED CONFIRMATION cho write mutations |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (getInternalProduct) | test-api | 200 happy path + 404 not found |
| AC-2 | BFF integration (enrichment orchestration) | test-api | mock gf-erp-mdm: graceful null khi enrichment fail |
| AC-3 | BFF contract (audit fields) | test-api | snapshot response shape — createdAt/updatedAt present |
| AC-4 | BFF integration (nested collections) | test-api | assert skuMappings/conversionUnits/attachments populated từ V2-8 |
| AC-5 | BFF integration (add/remove UOM) | test-api | ERR-INV-013/014/047 + BR-CAT-PROD-012 error mapping |
| AC-6 | BFF integration (searchSkus + linkSku) | test-api | ERR-INV-015 mapping → SKU_ALREADY_MAPPED |
| AC-7 | BFF integration (unlinkSku) | test-api | success 200 + wrong-tenant 403 |
| AC-8 | BFF contract (attachment fileUrl) | test-api | assert fileUrl = relative path, không có scheme/domain |
| AC-11 | BFF auth (RBAC) | test-isolation | dual persona test; NC-4 pending xác nhận write persona |
| — | N+1 guard | test-api | assert max 3 concurrent downstream calls cho `getInternalProduct` |

---

## 11. Cross-tier coordination

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | V2-8 response shape + SKU mapping / conversion-unit endpoint paths phải stable trước S5.4 |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | Consume: `getInternalProduct`, `searchSkus`, 4 mutations |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | Consume: `getInternalProduct` only (AC-12 view-only scope) |

**Source ID consistency** (item #18): `source_feat_sha` = `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` — identical cross-tier với BE/FE/Mobile files.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-DETAIL.md`](../be/FEAT-CAT-PROD-DETAIL.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-016**: BFF orchestrator pattern, fileUrl handling (relative path, no domain at BFF)
- **ADR-017**: catalog-v2 entity model (internal_product, sku_mapping, conversion_uom, attachment)
- **ADR-009**: scalar FK only — no JPA relationship mapping

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec FEAT-CAT-PROD-DETAIL W03. Query `getInternalProduct` (V2-Q5) orchestrate enrichment + `searchSkus` (V2-Q8) + 4 inline mutations (link/unlink SKU, add/remove UOM). 4 NEED CONFIRMATION markers (NC-1: UOM CRUD endpoints; NC-2: searchSkus downstream; NC-3: SKU mapping endpoints; NC-4: write mutation RBAC persona). |
| 2026-07-01 | 2 | main agent (audit) | Reconcile toàn bộ contract với code thực (inventory-catalog schema/types/resolver). Rename `SearchSkuResponse`→`PagedSkuSearchResponse`, `SearchSkuItem`→`SkuSearchResult`+fields, `SearchSkuPage`→`PagedSkuSearchData`; xoá `SearchSkuInput` (searchSkus args flat `q/unmapped/page/size`). Sửa `searchSkus` return + args; data type detail `InternalProductDetail`→`InternalProduct`. Sửa field SKU mapping `skuId/skuCode/skuName`→`productId/sku/productName`; conversion unit `uomCode/uomDisplayName`→`unitCode/unitDisplayName`; `ConversionUnitInput.uomCode`→`unitCode`; attachment `fileSize/mimeType/AttachmentKind enum`→`fileSizeBytes:Int!/fileType/attachmentKind:String!`. Mutation args `(productId, skuId)`/`(productId, uomCode)`→`(id, productId)`/`(id, unitId)`; unmap + delete return `Boolean!`→`DeleteResponse!` (+ `DeleteApiResponse`/`DeleteResultData`). Thêm enum `PricingMethod`, `SkuMappingStatus`; `pricingMethod: String!`→`PricingMethod!`, `materialGroupId: String`→`Int`. Sửa nullability: response `success/code/message` non-null→nullable (implements `ApiResponse`); collections `[T!]!`→`[T!]`; audit fields `String!`→`String`. Thêm op `updateConversionUnit` (tồn tại trong code). Gỡ marker NC-1/NC-2/NC-3 (đã resolve trong code); giữ NC-4 (RBAC persona) — còn open. |
