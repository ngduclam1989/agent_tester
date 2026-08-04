---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-CREATE.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-CREATE"
source_feat_sha: "ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab"
generated_at: "2026-06-29T14:40:00+00:00"
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
  - "createInternalProduct"
  - "addInternalProductSkuMapping"
  - "removeInternalProductSkuMapping"
  - "addConversionUnit"
  - "removeInternalProductConversionUnit"
  - "addInternalProductAttachment"
  - "removeInternalProductAttachment"
  # RESOLVED per CR-20260630-01 P1.1: V2-M13 = deleteInternalProductAttachment (per agg-garage-graph-graphql.md v7.30) — KHÔNG thuộc CREATE flow; image set qua V2-M4 input.imageUrl per R25 OQ10 (opaque URL).
paired_backend_feats: ["FEAT-CAT-PROD-CREATE"]
paired_fe_web_feats: ["FEAT-CAT-PROD-CREATE"]
paired_mobile_feats: ["FEAT-CAT-PROD-CREATE"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-CREATE.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-CREATE (BFF): Tạo mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory`, `gf-erp-mdm` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `createInternalProduct`, `addInternalProductSkuMapping`, `removeInternalProductSkuMapping`, `addConversionUnit`, `removeInternalProductConversionUnit`, `addInternalProductAttachment`, `removeInternalProductAttachment` |
| Cross-tier pair | BE: FEAT-CAT-PROD-CREATE \| Web: FEAT-CAT-PROD-CREATE \| Mobile: FEAT-CAT-PROD-CREATE |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-CREATE.md`](../../../../../Product/features/FEAT-CAT-PROD-CREATE.md) |
| Source version | v12 |
| Source SHA | `ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần danh mục mã sản phẩm nội bộ chuẩn hóa làm nền cho toàn bộ nghiệp vụ kho V2. Mỗi mã nội bộ tích hợp thông tin định danh (mã, tên, đơn vị chính, tính chất), bộ đơn vị quy đổi và danh sách SKU gắn kèm — đảm bảo data tồn kho nhất quán trước khi thực hiện nhập/xuất/tính giá. Feature này là entry point bắt buộc của catalog V2; FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT và toàn bộ nghiệp vụ kho V2 đều phụ thuộc vào sự tồn tại của mã nội bộ.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose mutation `createInternalProduct(input: CreateInternalProductInput!): InternalProductResponse!` passthrough tới gf-inventory `POST /api/v2/internal-products`; enrich response với `mainUnitDisplayName` (gf-erp-mdm `directory=UNIT`), `originDisplayName` (gf-erp-mdm `directory=COUNTRY`) và `materialGroupName`.
- Expose 6 sub-mutations (V2-M7..M12) cho SKU mapping, ĐVT quy đổi và tệp đính kèm — mỗi sub-mutation passthrough trực tiếp tới endpoint gf-inventory tương ứng. **V2-M13 = `deleteInternalProductAttachment` (per agg-garage-graph-graphql.md v7.30) — KHÔNG thuộc CREATE flow** (image URL set qua V2-M4 `input.imageUrl` opaque per R25 OQ10; delete attachment thuộc EDIT flow). Resolved per CR-20260630-01 P1.1.
- Propagate auth headers (`Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`) xuống cả gf-inventory và gf-erp-mdm.
- Enforce RBAC tại resolver: chỉ `garage-owner` và `accountant` được gọi write mutations; trả `FORBIDDEN` nếu role không đủ quyền.
- Map tất cả BE error codes (ERR-INV-006/007/012/013/014/015/047 + ERR-CMN-004/005) về GraphQL error shape thống nhất.
- DataLoader cho gf-erp-mdm enrichment (UOM + COUNTRY) batch per request để tránh N+1.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Form init + data entry cơ bản

#### AC-1 → N/A (FE local navigation)

BFF không touch. FE/Mobile điều hướng tới form tạo sản phẩm — không có GraphQL op nào trigger từ AC-1.

#### AC-2 → Expose `code` trong `CreateInternalProductInput` + map duplicate error

- **Khi**: FE/Mobile gọi mutation `createInternalProduct` với `input.code`.
- **BFF phải**: forward `code: String!` (required) tới gf-inventory V2-10; không validate regex tại BFF (BE primary); map BE 409 `ERR-INV-007` (`(tenant_id, code) UNIQUE` vi phạm) → GraphQL error `INTERNAL_PRODUCT_DUPLICATE_CODE`; map BE 400 `ERR-INV-006` (code format) → `INTERNAL_PRODUCT_INVALID_CODE`.
- **Downstream**: `POST /api/v2/internal-products` (gf-inventory)
- **Output shape**: `InternalProductResponse.data.code`
- **Failure mode**: xem §4.5
- **Ref**: op `createInternalProduct` (§6.1), resolver `src/resolvers/catalog/createInternalProduct.ts` (§6.2)

#### AC-3 → Forward `name` trong `CreateInternalProductInput`

- **Khi**: FE/Mobile pass `input.name`.
- **BFF phải**: forward `name: String!` (required) tới BE V2-10; không validate tại BFF.
- **Downstream**: `POST /api/v2/internal-products` (gf-inventory)
- **Output shape**: `InternalProductResponse.data.name`
- **Failure mode**: missing `name` → GraphQL validation error trước khi call downstream
- **Ref**: op `createInternalProduct` (§6.1)

#### AC-4 → Expose `nature` enum trong `CreateInternalProductInput`

- **Khi**: FE/Mobile chọn tính chất sản phẩm và pass `input.nature`.
- **BFF phải**: expose enum `ProductNature { GOODS TOOL SERVICE OTHER }` khớp BE enum; `nature: ProductNature!` required (BE reject nếu thiếu); forward tới BE V2-10; map `ERR-INV-012` → `INTERNAL_PRODUCT_INVALID_NATURE`.
- **Downstream**: `POST /api/v2/internal-products` (gf-inventory)
- **Output shape**: `InternalProductResponse.data.nature`
- **Failure mode**: `ERR-INV-012` — xem §4.5
- **Ref**: op `createInternalProduct` (§6.1)

#### AC-16 → N/A (FE local action)

Hủy bỏ là local state discard tại FE/Mobile — không có GraphQL call.

### Cluster B — Phân loại + đơn vị tính

#### AC-5 → Forward `materialGroupId` + enrich `materialGroupName` trong response

- **Khi**: FE/Mobile chọn nhóm vật tư và pass `input.materialGroupId`.
- **BFF phải**: forward `materialGroupId: Int` (optional) tới BE V2-10; BE validates ACTIVE status; enrich `materialGroupName` trong response — NEED CONFIRMATION #2: BE V2-10 response đã bao gồm `materialGroupName` (BFF passthrough) hay BFF cần call thêm `GET /api/v2/material-groups/{id}` (V2-3)?
- **Downstream**: `POST /api/v2/internal-products` (gf-inventory); có thể cộng thêm V2-3 nếu cần enrich.
- **Output shape**: `InternalProductResponse.data.{materialGroupId, materialGroupName}`
- **Failure mode**: `materialGroupId` không tồn tại hoặc INACTIVE → BE 400 → BFF map → `MATERIAL_GROUP_INVALID`
- **Ref**: op `createInternalProduct` (§6.1)

#### AC-6 → Forward `mainUnitCode` + enrich `mainUnitDisplayName`

- **Khi**: FE/Mobile chọn ĐVT chính và pass `input.mainUnitCode`.
- **BFF phải**: forward `mainUnitCode: String!` (required) tới BE V2-10 (BE validates vs gf-erp-mdm `directory=UNIT`); sau create thành công, call gf-erp-mdm `directory=UNIT` với `mainUnitCode` để lấy `mainUnitDisplayName` và inject vào response.
- **Downstream**: `POST /api/v2/internal-products` + gf-erp-mdm directory UNIT lookup
- **Output shape**: `InternalProductResponse.data.{mainUnitCode, mainUnitDisplayName}`
- **Failure mode**: gf-erp-mdm enrichment fail → degrade gracefully: trả `mainUnitDisplayName: null`, KHÔNG abort mutation; BE 400 nếu `mainUnitCode` không hợp lệ → map về `UNIT_CODE_INVALID`
- **Ref**: op `createInternalProduct` (§6.1), DataLoader `catalogUomLoader` (§6.3)

#### AC-7 → `status` optional trong input (default ACTIVE do BE)

`CreateInternalProductInput` có expose `status: InternalProductStatus` (optional); khi FE/Mobile omit, BE inject default `ACTIVE`. Form tạo thường không set field này — nhưng schema vẫn khai báo để đồng nhất với BE input contract.

### Cluster C — Thông tin bổ sung + ảnh

#### AC-8 → Expose các optional fields + enrich `originDisplayName`

- **Khi**: FE/Mobile điền thông tin bổ sung và pass trong `createInternalProduct`.
- **BFF phải**: expose trong `CreateInternalProductInput`: `brand: String`, `originCode: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`; forward tất cả tới BE V2-10; nếu `originCode` non-null và create thành công, call gf-erp-mdm `directory=COUNTRY` để enrich `originDisplayName`; `brand` là free-text, BFF KHÔNG validate catalog (R18). NEED CONFIRMATION #1: gf-erp-mdm có multi-code batch endpoint để merge UNIT + COUNTRY lookup trong 1 call không (tránh 2 round-trip)?
- **Downstream**: `POST /api/v2/internal-products` + gf-erp-mdm COUNTRY lookup (nếu `originCode` non-null)
- **Output shape**: `InternalProductResponse.data.{brand, originCode, originDisplayName, productSpec, technicalSpec, description, notes}`
- **Failure mode**: `originCode` không hợp lệ → BE trả `ERR-CMN-validation` ("Mã quốc gia xuất xứ không tồn tại") → BFF map về `VALIDATION_ERROR` với message passthrough; gf-erp-mdm enrichment fail → `originDisplayName: null` (degrade gracefully)
- **Ref**: op `createInternalProduct` (§6.1), DataLoader `catalogCountryLoader` (§6.3)

#### AC-9 → `pricingMethod` optional trong input (default PWA do BE)

`CreateInternalProductInput` có expose `pricingMethod: PricingMethod` (optional); enum `PricingMethod` gồm `PWA SI FIFO MA` (BE là source of truth). Khi FE/Mobile omit, BE inject default `PWA` (BR-CAT-PROD-010). Form tạo thường không set field này; response trả `pricingMethod` (non-null) trong `InternalProduct`.

#### AC-10 → Forward `imageUrl` opaque string

- **Khi**: FE/Mobile đã upload ảnh lên file storage và pass URL opaque string vào `input.imageUrl`.
- **BFF phải**: forward `imageUrl: String` (optional) tới BE V2-10 nguyên vẹn; BFF không quản lý S3/file-storage; `imageUrl: null` để clear được support (per V2-11 pattern).
- **Downstream**: `POST /api/v2/internal-products` (gf-inventory)
- **Output shape**: `InternalProductResponse.data.imageUrl`
- **Failure mode**: BFF passthrough; BE validates format nếu cần
- **Ref**: op `createInternalProduct` (§6.1)

### Cluster D — ĐVT quy đổi + SKU + Tệp đính kèm

#### AC-11 → Sub-mutations add/remove ĐVT quy đổi (post-create)

- **Khi**: FE/Mobile thêm/xoá ĐVT quy đổi sau khi tạo sản phẩm (KHÔNG inline tại create — `CreateInternalProductInput` không nhận conversion unit trực tiếp; sub-entity thêm qua mutation riêng).
- **BFF phải**:
  - Expose mutation `addConversionUnit(id: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!` → passthrough BE V2-15 `POST /api/v2/internal-products/{id}/conversion-units`.
  - Expose mutation `removeInternalProductConversionUnit(internalProductId: ID!, unitCode: String!): MutationResult!` → passthrough BE V2-16 `DELETE /api/v2/internal-products/{id}/conversion-units/{unitCode}`.
  - Map BE errors: `ERR-INV-013` (rate ≤ 0) → `CONVERSION_RATE_INVALID`; `ERR-INV-014` (unitCode trùng) → `CONVERSION_UNIT_DUPLICATE`; `ERR-INV-047` (scale > 6 thập phân) → `CONVERSION_RATE_SCALE_EXCEEDED`.
- **Downstream**: V2-15 / V2-16 (gf-inventory)
- **Output shape**: `InternalProductConversionUnitResponse.data: InternalProductConversionUnit`
- **Failure mode**: xem §4.5. NEED CONFIRMATION #3 RESOLVED (audit 2026-07-01): `ConversionUnitInput` dùng `unitCode: String!` (khớp code thực tế agg-garage-graph).
- **Ref**: ops `addConversionUnit`, `removeInternalProductConversionUnit` (§6.1)

#### AC-12 → Sub-mutations add/remove SKU mapping (post-create)

- **Khi**: FE/Mobile gắn SKU vào sản phẩm nội bộ sau khi tạo (KHÔNG inline tại create — `CreateInternalProductInput` không nhận SKU mapping trực tiếp; sub-entity thêm qua mutation riêng).
- **BFF phải**:
  - Expose mutation `addInternalProductSkuMapping(internalProductId: ID!, input: AddSkuMappingInput!): InternalProductSkuMappingResponse!` → passthrough BE V2-17 `POST /api/v2/internal-products/{id}/sku-mappings`.
  - Expose mutation `removeInternalProductSkuMapping(internalProductId: ID!, skuId: ID!): MutationResult!` → passthrough BE V2-18 `DELETE /api/v2/internal-products/{id}/sku-mappings/{skuId}`.
  - Map `ERR-INV-015` (1 SKU thuộc tối đa 1 mã nội bộ) → `SKU_ALREADY_MAPPED`.
- **Downstream**: V2-17 / V2-18 (gf-inventory)
- **Output shape**: `InternalProductSkuMappingResponse.data: InternalProductSkuMapping`
- **Failure mode**: `ERR-INV-015` — xem §4.5
- **Ref**: ops `addInternalProductSkuMapping`, `removeInternalProductSkuMapping` (§6.1)

#### AC-13 → Expose sub-mutations add/remove attachment

- **Khi**: FE/Mobile tải tệp đính kèm vào sản phẩm.
- **BFF phải**:
  - Expose mutation `addInternalProductAttachment(id: Int!, input: AttachmentMetadataInput!): InternalProductAttachmentResponse!` → passthrough BE V2-19 `POST /api/v2/internal-products/{id}/attachments`.
  - Expose mutation `removeInternalProductAttachment(internalProductId: ID!, attachmentId: ID!): MutationResult!` → passthrough BE V2-20 `DELETE /api/v2/internal-products/{id}/attachments/{attachmentId}`.
  - Map `ERR-CMN-004` (file > 10MB) → `ATTACHMENT_SIZE_EXCEEDED`; `ERR-CMN-005` (MIME type không hợp lệ) → `ATTACHMENT_TYPE_INVALID`.
  - Giới hạn 5 file/product (BR-CAT-PROD-015) enforce tại BE primary; BFF không re-validate nhưng map error về FE.
- **Downstream**: V2-19 / V2-20 (gf-inventory)
- **Output shape**: `InternalProductAttachmentResponse.data: InternalProductAttachment`
- **Failure mode**: `ERR-CMN-004/005` — xem §4.5
- **Ref**: ops `addInternalProductAttachment`, `removeInternalProductAttachment` (§6.1)

### Cluster E — Lưu thành công + Trùng mã

#### AC-14 → Trả response enriched sau khi create thành công

- **Khi**: `createInternalProduct` mutation thành công (gf-inventory trả 201 + entity).
- **BFF phải**: compose `InternalProductApiResponse { success: true, data: InternalProduct }` (member của union `InternalProductResponse`) với enriched fields: `mainUnitDisplayName` (gf-erp-mdm UNIT lookup), `originDisplayName` (gf-erp-mdm COUNTRY, nếu `originCode` non-null), `materialGroupName` (NEED CONFIRMATION #2). Enrichment calls chạy sau V2-10 success.
- **Downstream**: gf-erp-mdm enrichment (parallel nếu cả UOM + COUNTRY đều cần)
- **Output shape**: `InternalProductResponse` — toàn bộ fields xem §5.1
- **Failure mode**: gf-erp-mdm timeout → degrade gracefully: trả `mainUnitDisplayName: null` / `originDisplayName: null`, KHÔNG abort mutation; BFF log warning.
- **Ref**: op `createInternalProduct` (§6.1), DataLoaders (§6.3)

#### AC-15 → Map duplicate code error về GraphQL error response

- **Khi**: `createInternalProduct` được gọi với `code` đã tồn tại cho tenant.
- **BFF phải**: intercept BE 409 `ERR-INV-007` → trả GraphQL `errors[{ code: "INTERNAL_PRODUCT_DUPLICATE_CODE", message: "Mã sản phẩm đã tồn tại — vui lòng nhập mã khác" }]` (HTTP 200 với `errors[]` per GraphQL spec); KHÔNG retry.
- **Downstream**: BE V2-10 trả 409
- **Output shape**: `{ data: { createInternalProduct: null }, errors: [...] }`
- **Ref**: op `createInternalProduct` (§6.1), §4.5

### Cluster F — Phân quyền

#### AC-17 → RBAC check tại BFF resolver trước khi gọi downstream

- **Khi**: bất kỳ write mutation nào trong feature được gọi (`createInternalProduct`, `add*`, `remove*`).
- **BFF phải**: auth guard verify JWT role/permission; chỉ cho phép `garage-owner` và `accountant` với quyền write catalog; unauthorized → GraphQL error `{ code: "FORBIDDEN", statusCode: 403 }` trước khi gọi BE; token expire / missing → `UNAUTHORIZED (401)`.
- **Downstream**: không gọi downstream nếu RBAC fail.
- **Output shape**: `errors: [{ code: "FORBIDDEN" }]`
- **Ref**: `src/auth/catalogWriteGuard.ts` (§7)

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống cả gf-inventory và gf-erp-mdm.
- Token verify per request (production); local bypass theo profile.
- CORS: KHÔNG `origin: "*"` production.

### 4.2 Performance + N+1

- `catalogUomLoader`: key `{ code: String }`, batch tới gf-erp-mdm `directory=UNIT`; TTL request-scoped.
- `catalogCountryLoader`: key `{ code: String }`, batch tới gf-erp-mdm `directory=COUNTRY`; TTL request-scoped.
- NEED CONFIRMATION #1: nếu gf-erp-mdm hỗ trợ multi-code batch, merge UNIT + COUNTRY vào 1 DataLoader `catalogDirectoryLoader` với key `{ directory, code }` để tiết kiệm round-trip.
- Sub-mutations là single-entity call; DataLoader không cần nhưng `x-request-id` phải forward.

### 4.3 Security + data exposure

- KHÔNG log JWT, `Authorization` header, `X-Tenant-Id` trong resolver.
- Tenant scope từ JWT claim, KHÔNG từ GraphQL arg client-controlled.
- `imageUrl` và `fileUrl` là opaque strings — BFF không fetch content, không validate S3 path.

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")`, giữ old field.
- Enum `ProductNature`, `PricingMethod`, `InternalProductStatus` phải sync với BE enum values (BE là source of truth). `attachmentKind` là plain `String` scalar (KHÔNG phải enum).
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | HTTP BE | GraphQL error code | Source AC |
|---|---|---|---|
| `ERR-INV-006` (code format invalid) | 400 | `INTERNAL_PRODUCT_INVALID_CODE` | AC-2 |
| `ERR-INV-007` (duplicate code) | 409 | `INTERNAL_PRODUCT_DUPLICATE_CODE` | AC-2, AC-15 |
| `ERR-INV-012` (nature invalid) | 400 | `INTERNAL_PRODUCT_INVALID_NATURE` | AC-4 |
| `ERR-CMN-validation` (originCode không tồn tại) | 400 | `VALIDATION_ERROR` + message passthrough | AC-8 |
| `ERR-INV-013` (conversionRate ≤ 0) | 400 | `CONVERSION_RATE_INVALID` | AC-11 |
| `ERR-INV-047` (conversionRate scale > 6) | 400 | `CONVERSION_RATE_SCALE_EXCEEDED` | AC-11 |
| `ERR-INV-014` (unitCode trùng) | 409 | `CONVERSION_UNIT_DUPLICATE` | AC-11 |
| `ERR-INV-015` (SKU đã thuộc mã khác) | 409 | `SKU_ALREADY_MAPPED` | AC-12 |
| `ERR-CMN-004` (file > 10MB) | 400 | `ATTACHMENT_SIZE_EXCEEDED` | AC-13 |
| `ERR-CMN-005` (MIME type không hợp lệ) | 400 | `ATTACHMENT_TYPE_INVALID` | AC-13 |
| materialGroupId invalid | 400 | `MATERIAL_GROUP_INVALID` | AC-5 |
| 403 downstream | 403 | `FORBIDDEN` | AC-17 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `CreateInternalProductInput` | input | `code: String!`, `name: String!`, `mainUnitCode: String!`, `nature: ProductNature!`, `pricingMethod: PricingMethod`, `materialGroupId: Int`, `brand: String`, `originCode: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`, `imageUrl: String`, `status: InternalProductStatus` | NO (new) | AC-2/3/4/5/6/7/8/9/10 |
| `ConversionUnitInput` | input | `unitCode: String!`, `conversionRate: Float!` | NO (new) | AC-11 |
| `AddSkuMappingInput` | input | `skuId: ID!` | NO (new) | AC-12 |
| `AttachmentMetadataInput` | input | `fileName: String!`, `fileType: String!`, `sizeBytes: Int!`, `storageUrl: String!` | NO (new) | AC-13 |
| `InternalProduct` | type | `id: Int!`, `code: String!`, `name: String!`, `mainUnitCode: String!`, `mainUnitDisplayName: String`, `status: InternalProductStatus!`, `nature: ProductNature!`, `pricingMethod: PricingMethod!`, `materialGroupId: Int`, `materialGroupName: String`, `brand: String`, `originCode: String`, `originDisplayName: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`, `imageUrl: String`, `conversionUnits: [InternalProductConversionUnit!]`, `skuMappings: [InternalProductSkuMapping!]`, `attachments: [InternalProductAttachment!]`, `createdAt: String`, `createdBy: String`, `updatedAt: String`, `updatedBy: String` | NO (new) | AC-14 |
| `InternalProductResponse` | union | `= InternalProductApiResponse \| ErrorResponse` | NO (new) | AC-14/15 |
| `InternalProductApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: InternalProduct` | NO (new) | AC-14/15 |
| `InternalProductSkuMapping` | type | `id: ID!`, `skuId: ID!`, `sku: String`, `skuName: String` | NO (new) | AC-12 |
| `InternalProductConversionUnit` | type | `id: Int!`, `unitCode: String!`, `unitDisplayName: String`, `conversionRate: Float!` | NO (new) | AC-11 |
| `InternalProductAttachment` | type | `id: Int!`, `fileUrl: String!`, `fileName: String!`, `fileType: String!`, `fileSizeBytes: Int!`, `attachmentKind: String!` | NO (new) | AC-13 |
| `InternalProductSkuMappingResponse` | union | `= InternalProductSkuMappingApiResponse \| ErrorResponse` | NO (new) | AC-12 |
| `InternalProductConversionUnitResponse` | union | `= InternalProductConversionUnitApiResponse \| ErrorResponse` | NO (new) | AC-11 |
| `InternalProductAttachmentResponse` | union | `= InternalProductAttachmentApiResponse \| ErrorResponse` | NO (new) | AC-13 |
| `MutationResult` | type | `success: Boolean!`, `code: String`, `message: String` | NO (new — nếu chưa có global) | AC-11/12/13 |
| `ProductNature` | enum | `GOODS`, `TOOL`, `SERVICE`, `OTHER` | NO (new) | AC-4 |
| `PricingMethod` | enum | `PWA`, `SI`, `FIFO`, `MA` | NO (new) | AC-9 |
| `InternalProductStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new — nếu chưa có) | AC-7 |

### 5.2 Modified types (additive)

Không có existing type bị modify. Toàn bộ types trên là new-capability.

> Nếu `MutationResult`, `InternalProductStatus` hoặc `ErrorResponse`/`ApiResponse` đã tồn tại trong schema → reuse, không khai báo lại.

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `createInternalProduct` | mutation | `input: CreateInternalProductInput!` | `InternalProductResponse!` | JWT + tenantId | AC-2/3/4/5/6/8/10/11/12/14/15 |
| `addInternalProductSkuMapping` | mutation | `internalProductId: ID!`, `input: AddSkuMappingInput!` | `InternalProductSkuMappingResponse!` | JWT + tenantId | AC-12 |
| `removeInternalProductSkuMapping` | mutation | `internalProductId: ID!`, `skuId: ID!` | `MutationResult!` | JWT + tenantId | AC-12 |
| `addConversionUnit` | mutation | `id: Int!`, `input: ConversionUnitInput!` | `InternalProductConversionUnitResponse!` | JWT + tenantId | AC-11 |
| `removeInternalProductConversionUnit` | mutation | `internalProductId: ID!`, `unitCode: String!` | `MutationResult!` | JWT + tenantId | AC-11 |
| `addInternalProductAttachment` | mutation | `id: Int!`, `input: AttachmentMetadataInput!` | `InternalProductAttachmentResponse!` | JWT + tenantId | AC-13 |
| `removeInternalProductAttachment` | mutation | `internalProductId: ID!`, `attachmentId: ID!` | `MutationResult!` | JWT + tenantId | AC-13 |

> **RESOLVED (CR-20260630-01 P1.1)**: V2-M13 = `deleteInternalProductAttachment(internalProductId: ID!, attachmentId: ID!): MutationResult!` per `agg-garage-graph-graphql.md` v7.30 line 44742. KHÔNG thuộc CREATE flow — image URL set qua V2-M4 `input.imageUrl` (opaque per R25 OQ10). Delete attachment thuộc FEAT-CAT-PROD-EDIT scope.

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream boundary | REST endpoint | DataLoader | AC ref |
|---|---|---|---|---|---|
| `createInternalProduct` | `src/resolvers/catalog/createInternalProduct.ts` | gf-inventory | `POST /api/v2/internal-products` | — | AC-2..15 |
| `createInternalProduct` (enrich UOM) | `src/resolvers/catalog/createInternalProduct.ts` | gf-erp-mdm | `GET /api/v1/directories/entries?directory=UNIT&code={code}` | `catalogUomLoader` | AC-6/14 |
| `createInternalProduct` (enrich COUNTRY) | `src/resolvers/catalog/createInternalProduct.ts` | gf-erp-mdm | `GET /api/v1/directories/entries?directory=COUNTRY&code={code}` | `catalogCountryLoader` | AC-8/14 |
| `addInternalProductSkuMapping` | `src/resolvers/catalog/addInternalProductSkuMapping.ts` | gf-inventory | `POST /api/v2/internal-products/{id}/sku-mappings` | — | AC-12 |
| `removeInternalProductSkuMapping` | `src/resolvers/catalog/removeInternalProductSkuMapping.ts` | gf-inventory | `DELETE /api/v2/internal-products/{id}/sku-mappings/{skuId}` | — | AC-12 |
| `addConversionUnit` | `src/resolvers/catalog/addConversionUnit.ts` | gf-inventory | `POST /api/v2/internal-products/{id}/conversion-units` | — | AC-11 |
| `removeInternalProductConversionUnit` | `src/resolvers/catalog/removeInternalProductConversionUnit.ts` | gf-inventory | `DELETE /api/v2/internal-products/{id}/conversion-units/{unitCode}` | — | AC-11 |
| `addInternalProductAttachment` | `src/resolvers/catalog/addInternalProductAttachment.ts` | gf-inventory | `POST /api/v2/internal-products/{id}/attachments` | — | AC-13 |
| `removeInternalProductAttachment` | `src/resolvers/catalog/removeInternalProductAttachment.ts` | gf-inventory | `DELETE /api/v2/internal-products/{id}/attachments/{attachmentId}` | — | AC-13 |

> gf-erp-mdm directory endpoint path (`/api/v1/directories/entries?directory=...`) cần xác nhận vs `Architecture/api/gf-erp-mdm-api.md` — author dùng pattern suy luận từ `directory=UNIT/COUNTRY` trong bundle §H.

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Batch endpoint | TTL | Use cases |
|---|---|---|---|---|
| `catalogUomLoader` | `{ code: String }` | gf-erp-mdm `directory=UNIT` | request-scoped | `mainUnitDisplayName` enrich trong create + detail response |
| `catalogCountryLoader` | `{ code: String }` | gf-erp-mdm `directory=COUNTRY` | request-scoped | `originDisplayName` enrich trong create + detail response |

> Nếu gf-erp-mdm hỗ trợ batch multi-code (NEED CONFIRMATION #1), merge thành 1 loader `catalogDirectoryLoader` key `{ directory: "UNIT" | "COUNTRY", code: String }`.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| Tất cả 7 mutations | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | mutations, no cache |

### 6.5 Persisted query allowlist

Cập nhật sau khi FE/Mobile gen query hash. Placeholder: `src/persisted-queries/catalog/`.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`

| Layer | Path | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/catalog/internal-product.graphql` | NEW | new SDL domain file | ~130 | AC-2..17 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/createInternalProduct.ts` | NEW | resolver + DataLoader compose | ~80 | AC-2..15 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/addInternalProductSkuMapping.ts` | NEW | passthrough resolver | ~35 | AC-12 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/removeInternalProductSkuMapping.ts` | NEW | passthrough resolver | ~30 | AC-12 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/addConversionUnit.ts` | NEW | passthrough resolver | ~35 | AC-11 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/removeInternalProductConversionUnit.ts` | NEW | passthrough resolver | ~30 | AC-11 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/addInternalProductAttachment.ts` | NEW | passthrough resolver | ~35 | AC-13 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/removeInternalProductAttachment.ts` | NEW | passthrough resolver | ~30 | AC-13 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | add catalog V2 methods | ~60 | AC-2..15 |
| `data-loaders/` | `bffs/agg-garage-graph/src/data-loaders/catalogUomLoader.ts` | NEW | DataLoader pattern | ~40 | AC-6/14 |
| `data-loaders/` | `bffs/agg-garage-graph/src/data-loaders/catalogCountryLoader.ts` | NEW | DataLoader pattern | ~40 | AC-8/14 |
| `auth/` | `bffs/agg-garage-graph/src/auth/catalogWriteGuard.ts` | NEW | auth guard pattern | ~25 | AC-17 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog/createInternalProduct.test.ts` | NEW | Apollo test client | ~100 | AC-2..15 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/catalog-internal-product-contract.test.ts` | NEW | schema contract snapshot | ~60 | — |

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory V2-10 + V2-15..V2-20 integration green)

S5  BFF schema + resolver wire
    Entry: gf-inventory endpoints V2-10/V2-15..V2-20 stable
           gf-erp-mdm directory lookup endpoint confirmed (NEED CONFIRMATION #1/#3)
    Exit: BFF contract test green + DataLoader N+1 check pass + RBAC test pass
    └─► (hand-off FE-web + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolvers + DataLoaders + auth guard | schema + resolvers + data-sources + loaders + auth | BE S4 complete; NEED CONFIRMATION items resolved | Contract test green, N+1 check pass | FEAT-CAT-PROD-CREATE BE S4 |

---

## 9. Business Rules enforced (BFF — secondary)

| BR ID | Severity | Enforcement tại BFF | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| BR-CAT-PROD-023 (RBAC tạo) | CORNERSTONE | auth guard | `src/auth/catalogWriteGuard.ts` | AC-17 | Chỉ `garage-owner` + `accountant`; primary enforce ở JWT layer |
| Tenant isolation | CORNERSTONE | resolver pre-check | mọi resolver trong `src/resolvers/catalog/` | AC-17 | tenantId từ JWT, KHÔNG từ GraphQL args client-controlled |
| N+1 guard | NORMAL | DataLoader | `catalogUomLoader`, `catalogCountryLoader` | (perf) | batch ≤ 100 per request |
| BR-CAT-PROD-015 (max 5 attachments) | NORMAL | passthrough — enforce tại BE primary | BE V2-19 | AC-13 | BFF map error nếu BE reject |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-PROD-CREATE.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration | test-api | mock gf-inventory V2-10; verify `code` forwarded; assert `ERR-INV-006/007` mapped |
| AC-4 | BFF schema contract | test-api | enum `ProductNature` 4 values match BE |
| AC-6 | BFF integration (DataLoader) | test-api | assert `catalogUomLoader` called; `mainUnitDisplayName` populated |
| AC-8 | BFF integration (DataLoader) | test-api | assert `catalogCountryLoader` called khi `originCode` non-null; degrade gracefully khi gf-erp-mdm fail |
| AC-11 | BFF integration | test-api | mock V2-15/V2-16; assert `ERR-INV-013/014/047` mapped correctly |
| AC-12 | BFF integration | test-api | mock V2-17/V2-18; assert `ERR-INV-015` → `SKU_ALREADY_MAPPED` |
| AC-13 | BFF integration | test-api | mock V2-19/V2-20; assert `ERR-CMN-004/005` mapped |
| AC-14 | BFF integration | test-api | assert enriched response fields non-null khi gf-erp-mdm healthy |
| AC-15 | BFF integration | test-api | BE 409 `ERR-INV-007` → GraphQL `INTERNAL_PRODUCT_DUPLICATE_CODE` |
| AC-17 | BFF auth | test-isolation | dual persona; missing role → `FORBIDDEN`; expired token → `UNAUTHORIZED` |
| — | N+1 guard | test-api | inflight call count assertion per DataLoader per request |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-CREATE.md` | chưa gen | Downstream REST V2-10 / V2-15..V2-20 — BFF resolver wraps; BFF S5 blocked until BE S4 |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-CREATE.md` | chưa gen | Consumes 7 mutations từ §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-CREATE.md` | chưa gen | Consumes 7 mutations từ §6.1 |

**Source ID consistency** (item 18): `source_feat_sha = ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab` — identical cross-tier.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-CREATE.md`](../../../../../Product/features/FEAT-CAT-PROD-CREATE.md) v12
- **Paired BE**: [`features/be/FEAT-CAT-PROD-CREATE.md`](../be/FEAT-CAT-PROD-CREATE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **gf-inventory API**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-10/V2-15..V2-20
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: additive aggregates InternalProduct + MaterialGroup trong gf-inventory
- **ADR-009**: no JPA relationship mapping — scalar FK only
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-CAT-PROD-CREATE` W03. Policy v2 "tier-authoritative": 7 confirmed mutations (V2-M4 create + V2-M7..M12 sub-mutations sku-mapping/conversion-unit/attachment) + V2-M13 NEED CONFIRMATION. DataLoader enrich (UOM + COUNTRY), RBAC guard, error mapping §4.5 (12 error codes). 4 NEED CONFIRMATION items flagged. |
| 2026-07-01 | 2 | main agent (audit) | **Đối chiếu code thực tế agg-garage-graph (audit hậu-DEV 2026-07-01)** — sửa doc cho khớp schema deployed: (1) enum `InternalProductNature`→`ProductNature`; `ProductStatus`→`InternalProductStatus`; `PricingMethod` `{PWA}`→`{PWA SI FIFO MA}`; xoá enum `AttachmentKind` (attachmentKind là `String`). (2) `InternalProductResponse` từ plain type → `union = InternalProductApiResponse \| ErrorResponse`; thêm `InternalProductApiResponse implements ApiResponse`; 3 sub-response cũng đổi sang union pattern; `success: Boolean!`→`Boolean`. (3) `CreateInternalProductInput`: `materialGroupCode:String`→`materialGroupId:Int`; `nature` +`!` required; thêm `pricingMethod`/`status`; xoá `initialSkuIds`/`initialConversionUnits` (input KHÔNG nhận sub-entity inline — thêm qua mutation riêng post-create). (4) `InternalProduct`: `id:ID!`→`id:Int!`; `materialGroupId:ID`→`Int`; xoá `materialGroupCode`; list `[..!]!`→`[..!]` nullable; `createdAt/By,updatedAt/By` `String!`→`String`. (5) `InternalProductConversionUnit`: `id:ID!`→`Int!`, `uomCode`→`unitCode`, `uomDisplayName`→`unitDisplayName`. (6) `InternalProductAttachment`: `id:ID!`→`Int!`, `fileSize`→`fileSizeBytes`, `mimeType`→`fileType`, `attachmentKind:AttachmentKind!`→`String!`. (7) `ConversionUnitInput.uomCode`→`unitCode`; xoá `AddConversionUnitInput` (add dùng `ConversionUnitInput`). (8) `AddAttachmentInput`→`AttachmentMetadataInput { fileName, fileType, sizeBytes, storageUrl }`. (9) op `addInternalProductConversionUnit`→`addConversionUnit(id:Int!, input:ConversionUnitInput!)`; `addInternalProductAttachment(id:Int!, input:AttachmentMetadataInput!)`; remove-conversion arg `uomCode`→`unitCode`. (10) NC#3 đóng (`unitCode`). LƯU Ý: SKU-mapping ops/type + remove-mutation arg convention KHÔNG có trong cheat sheet audit → giữ nguyên, cần BE verify. |
