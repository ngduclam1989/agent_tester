---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-EDIT.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-EDIT"
source_feat_sha: "e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
version_note: "v2 — reconciled với deployed schema agg-garage-graph (audit 2026-07-01)"
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory", "gf-erp-mdm"]
modifies: []
change_type: "brownfield-enhancement"
graphql_ops:
  - "updateInternalProduct"
  - "mapSkuToInternalProduct"
  - "unmapSkuFromInternalProduct"
  - "addConversionUnit"
  - "updateConversionUnit"
  - "deleteConversionUnit"
  - "addInternalProductAttachment"
  - "deleteInternalProductAttachment"
  - "listUnits"
paired_backend_feats: ["FEAT-CAT-PROD-EDIT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-EDIT"]
paired_mobile_feats: ["FEAT-CAT-PROD-EDIT"]
authoring_inputs:
  kg_baseline_sha: ""
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: ""
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EDIT.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-EDIT (BFF): Chỉnh sửa mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EDIT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory`, `gf-erp-mdm` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `updateInternalProduct`, `mapSkuToInternalProduct`, `unmapSkuFromInternalProduct`, `addConversionUnit`, `updateConversionUnit`, `deleteConversionUnit`, `addInternalProductAttachment`, `deleteInternalProductAttachment`, `listUnits` |
| Cross-tier pair | BE: `FEAT-CAT-PROD-EDIT` \| Web: `FEAT-CAT-PROD-EDIT` \| Mobile: `FEAT-CAT-PROD-EDIT` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-EDIT.md`](../../../../../Product/features/FEAT-CAT-PROD-EDIT.md) |
| Source version | v10 |
| Source SHA | `e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Feature này cho phép chủ garage và kế toán cập nhật thông tin mã sản phẩm nội bộ sau khi tạo — đảm bảo danh mục vật tư luôn phản ánh thực tế vận hành. Hệ thống phân biệt rõ hai loại trường: trường bất biến hoàn toàn (mã SP, phương pháp tính giá) và trường bất biến có điều kiện (ĐVT chính — khoá khi đã phát sinh giao dịch kho). Feature thuộc luồng quản trị danh mục và cùng với CREATE/DETAIL/DELETE tạo thành vòng đời đầy đủ cho mã SP nội bộ — nền dữ liệu vật tư cho toàn bộ nghiệp vụ tồn kho V2.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose mutation `updateInternalProduct(id: Int!, input: UpdateInternalProductInput!): InternalProductResponse!` (V2-M5) dạng passthrough tới BE `PUT /api/v2/internal-products/{id}` (V2-11); BFF không tự validate immutability matrix — BE là primary enforcer
- Expose **7 sub-mutations** (V2-M7..M13) dạng passthrough một-đối-một tới BE sub-endpoints tương ứng cho CRUD ĐVT quy đổi, SKU mapping, và đính kèm (đếm M7,M8,M9,M10,M11,M12,M13 = 7 ops; corrected per CR-20260630-01 P1.2)
- Expose query `listUnits` (V2-Q9) trả danh sách đơn vị tính từ gf-erp-mdm `directory=UNIT` để FE/Mobile tải dropdown khi thêm ĐVT quy đổi
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống tất cả downstream REST calls của 9 operations trên
- Map error codes BE (ERR-INV-013, ERR-INV-014, ERR-INV-015, ERR-INV-047, ERR-CMN-004, ERR-CMN-005) sang GraphQL `extensions.code` cho FE consume
- Enforce RBAC tại auth guard: chỉ persona `garage-owner` (JWT claim) được phép gọi các mutation thay đổi state; persona `accountant` chỉ read

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Tải dữ liệu form + kiểm tra bất biến (AC-1, AC-2, AC-3, AC-5)

#### AC-1 → BFF reuse product detail query để tải giá trị hiện tại vào form

- **Khi**: FE/Mobile navigate tới màn hình chỉnh sửa sản phẩm và khởi tạo form
- **BFF phải**: reuse query `getInternalProduct(id: Int!)` đã định nghĩa trong FEAT-CAT-PROD-DETAIL BFF spec; trả enriched payload từ V2-8 bao gồm `code`, `name`, `mainUnitCode`, `mainUnitDisplayName`, `pricingMethod`, `status`, `nature`, `brand`, `originCode`, `originDisplayName`, `materialGroupName`, `skuMappings[]`, `conversionUnits[]`, `attachments[]` (type `InternalProduct` — KHÔNG có flag bất biến riêng, xem AC-3)
- **Downstream**: gf-inventory `GET /api/v2/internal-products/{id}` (V2-8) + gf-erp-mdm enrichment `mainUnitDisplayName` (directory=UNIT), `originDisplayName` (directory=COUNTRY)
- **Output shape**: `InternalProductResponse!` union → `InternalProductApiResponse.data: InternalProduct` (type đã spec tại FEAT-CAT-PROD-DETAIL BFF; KHÔNG có type riêng `InternalProductDetailResponse`)
- **Failure mode**: product không tồn tại hoặc khác tenant → `INTERNAL_PRODUCT_NOT_FOUND` (HTTP 404 mapped)
- **Ref**: query `getInternalProduct` (FEAT-CAT-PROD-DETAIL BFF §6.1); paired BE FEAT-CAT-PROD-EDIT §6.1

#### AC-2 → `code` loại khỏi UpdateInternalProductInput, trả read-only trong query

- **Khi**: BFF định nghĩa schema `UpdateInternalProductInput`
- **BFF phải**: KHÔNG include field `code` trong `UpdateInternalProductInput` — ngăn FE vô tình gửi yêu cầu đổi mã; `code` chỉ xuất hiện trong response read của `getInternalProduct` dưới dạng `String!` read-only
- **Downstream**: BE V2-11 độc lập enforce code-immutable (BR-CAT-PROD-004, ERR-INV-006); BFF schema là lớp phòng thủ đầu tiên
- **Output shape**: `code: String!` present trong `InternalProduct` (read query `getInternalProduct`), absent trong `UpdateInternalProductInput` (mutation input)
- **Failure mode**: nếu downstream trả ERR-INV-006 theo bất kỳ path nào → map `INTERNAL_PRODUCT_CODE_IMMUTABLE`
- **Ref**: op `updateInternalProduct` §6.1 input schema, §5.1 `UpdateInternalProductInput`

#### AC-3 → lock `mainUnitCode` — type `InternalProduct` KHÔNG có boolean lock flag

- **Khi**: FE load form chỉnh sửa và cần biết `mainUnitCode` có thể sửa không
- **RESOLVED (audit 2026-07-01)**: type `InternalProduct` deployed KHÔNG expose boolean flag (`hasTransaction` / `isMainUomLocked` KHÔNG tồn tại trong schema). BFF không trả cờ khóa riêng — khóa ĐVT chính do BE enforce khi mutation `updateInternalProduct` chạy (trả error nếu vi phạm), không phải qua read flag ở detail.
- **Downstream**: gf-inventory V2-8 detail response = full `InternalProduct` type (không thêm lock flag)
- **Output shape**: không có boolean flag; FE dựa vào error mapping của `updateInternalProduct` (xem §4.5) để phản hồi khi user sửa `mainUnitCode` đã khóa
- **Failure mode**: `mainUnitCode` thay đổi sau giao dịch → BE trả error → BFF map (xem §4.5)
- **Ref**: type `InternalProduct` §5.1; paired BE FEAT-CAT-PROD-EDIT §5.1; BR-CAT-PROD-006

#### AC-5 → `pricingMethod` có trong `UpdateInternalProductInput` (schema-level editable)

- **Khi**: BFF định nghĩa `UpdateInternalProductInput`
- **RESOLVED (audit 2026-07-01)**: schema deployed INCLUDE `pricingMethod: PricingMethod` (optional) trong `UpdateInternalProductInput` — KHÔNG loại bỏ như giả định trước đó. BFF passthrough field xuống BE; bất kỳ khóa `pricingMethod` (nếu có per BR-CAT-PROD-010) do BE enforce, không phải schema BFF.
- **Read response**: `pricingMethod: PricingMethod!` (non-null) trong type `InternalProduct`
- **Output shape**: `pricingMethod` present cả ở input (`PricingMethod`, optional) lẫn read type (`PricingMethod!`)
- **Failure mode**: nếu BE khóa pricingMethod và từ chối thay đổi → BE trả error → BFF passthrough error code
- **Ref**: §5.1 `UpdateInternalProductInput`, enum `PricingMethod` (PWA/SI/FIFO/MA), ADR-017

---

### Cluster B — Cập nhật thông tin chung + trạng thái (AC-4, AC-6)

#### AC-4 → BFF passthrough `updateInternalProduct` mutation cho thông tin chung

- **Khi**: FE gọi `updateInternalProduct(id: Int!, input: UpdateInternalProductInput!)`
- **BFF phải**: passthrough payload tới BE `PUT /api/v2/internal-products/{id}` (V2-11); không tự validate nội dung — BE là enforcer; chỉ forward auth headers + input JSON
- **Downstream**: gf-inventory `PUT /api/v2/internal-products/{id}` (V2-11) — input fields (khớp `UpdateInternalProductInput` §5.1): `name`, `mainUnitCode` (BE enforce immutability nếu có giao dịch), `nature` (`ProductNature`), `pricingMethod` (`PricingMethod`), `materialGroupId` (`Int`), `brand` (free-text, R18), `originCode`, `productSpec`, `technicalSpec`, `description`, `notes`, `imageUrl`, `status`
- **Output shape**: `InternalProductResponse!` — xem §5.1 union type
- **Failure mode**: `originCode` invalid → BE trả ERR-CMN-validation → BFF map `ORIGIN_CODE_NOT_FOUND`; `mainUnitCode` thay đổi sau giao dịch → BE trả ERR-INV-010 → BFF map `MAIN_UOM_CODE_IMMUTABLE`; product không tồn tại → 404 → `INTERNAL_PRODUCT_NOT_FOUND`
- **Ref**: op `updateInternalProduct` §6.1; resolver §6.2; BR-CAT-PROD-004, BR-CAT-PROD-006, BR-CAT-PROD-008

#### AC-6 → `status` field trong UpdateInternalProductInput để đổi ACTIVE/INACTIVE

- **Khi**: FE gọi `updateInternalProduct` với field `status: InternalProductStatus`
- **BFF phải**: include `status: InternalProductStatus` trong `UpdateInternalProductInput`; cùng payload với AC-4 (không phải mutation riêng); BE V2-11 xử lý status change
- **Downstream**: gf-inventory `PUT /api/v2/internal-products/{id}` (V2-11) nhận `status` field
- **Output shape**: `InternalProductResponse!` bao gồm `status: InternalProductStatus!` mới sau update
- **Failure mode**: enum value ngoài `ACTIVE | INACTIVE` → GraphQL schema validation reject trước khi đến resolver
- **Ref**: op `updateInternalProduct` §6.1; §5.1 `InternalProductStatus` enum

---

### Cluster C — CRUD ĐVT quy đổi / SKU mapping / đính kèm (AC-7)

#### AC-7 → Sub-mutations + listUnits cho quản lý child entities trong form sửa

- **Khi**: FE thao tác trên tab ĐVT quy đổi / SKU / đính kèm trong màn hình chỉnh sửa sản phẩm

**Nhánh 7a — ĐVT quy đổi**:
- **BFF phải**: expose ba sub-mutations passthrough tới gf-inventory sub-endpoints:
  - `addConversionUnit(id: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!` (V2-M9)
  - `updateConversionUnit(id: Int!, unitId: Int!, input: ConversionUnitInput!): InternalProductConversionUnitResponse!` (V2-M10)
  - `deleteConversionUnit(id: Int!, unitId: Int!): DeleteResponse!` (V2-M11)
- `ConversionUnitInput` (dùng chung add + update): `{ unitCode: String!, conversionRate: Float! }` — BE enforce: rate > 0 (ERR-INV-013), scale ≤ 6 chữ số thập phân (ERR-INV-047, R29 pass-through), unique unitCode per product (ERR-INV-014), immutable nếu đã có giao dịch (BR-CAT-PROD-012)

**Nhánh 7b — SKU mapping**:
- **BFF phải**: expose hai sub-mutations passthrough:
  - `mapSkuToInternalProduct(id: Int!, productId: Int!): InternalProductSkuMappingResponse!` (V2-M7) — arg `id` = internal product id, `productId` = legacy SKU productId (R9 arg rename)
  - `unmapSkuFromInternalProduct(id: Int!, productId: Int!): DeleteResponse!` (V2-M8)
- BE enforce: 1 SKU thuộc tối đa 1 mã nội bộ (ERR-INV-015, BR-CAT-PROD-013); xóa mapping KHÔNG xóa SKU gốc (BR-CAT-PROD-014)

**Nhánh 7c — Đính kèm**:
- **BFF phải**: expose hai sub-mutations passthrough:
  - `addInternalProductAttachment(id: Int!, input: AttachmentMetadataInput!): InternalProductAttachmentResponse!` (V2-M12, R11 metadata-only, ADR-016 presigned reuse)
  - `deleteInternalProductAttachment(id: Int!, attachmentId: Int!): DeleteResponse!` (V2-M13)
- `AttachmentMetadataInput`: `{ fileName: String!, fileType: String!, sizeBytes: Int!, storageUrl: String! }` — FE upload file trực tiếp tới ct-file-storage và gửi metadata + object key (`storageUrl`); BFF KHÔNG proxy binary upload. (KHÔNG có field `attachmentKind` trong input; `attachmentKind` chỉ ở output type `InternalProductAttachment` dạng `String!`, không phải enum)
- BE enforce: ≤ 5 tệp/product (BR-CAT-PROD-015), ≤ 10MB (ERR-CMN-004), PDF/JPG/PNG only (ERR-CMN-005)

**Nhánh 7d — listUnits dropdown**:
- **BFF phải**: expose query `listUnits: UnitListResponse!` (V2-Q9, KHÔNG có arg) → gf-erp-mdm (directory=UNIT) để FE tải dropdown ĐVT khi thêm conversion unit; op chung với FEAT-CAT-PROD-CREATE BFF — reuse, KHÔNG define mới
- Return: `UnitListResponse` union → `UnitListApiResponse.data: UnitListData { items: [Unit!]! }`, mỗi `Unit`: `{ code: String!, name: String! }`

- **Ref**: §5.1 input types; §6.1 sub-operations; §6.2 resolver mapping; paired BE FEAT-CAT-PROD-EDIT §6

---

### Cluster D — Lưu thành công + phân quyền (AC-8, AC-10)

#### AC-8 → Mutation response shape sau khi lưu thành công

- **Khi**: mutation `updateInternalProduct` hoặc bất kỳ sub-mutation nào hoàn thành thành công
- **BFF phải**: trả về union response tương ứng theo op (auto-gen qua `generateMultipleResponseTypes`):
  - `updateInternalProduct` → `InternalProductResponse` = `InternalProductApiResponse | ErrorResponse`, `data: InternalProduct` (full type)
  - `addConversionUnit` / `updateConversionUnit` → `InternalProductConversionUnitResponse`, `data: InternalProductConversionUnit`
  - `mapSkuToInternalProduct` → `InternalProductSkuMappingResponse`, `data: InternalProductSkuMapping`
  - `addInternalProductAttachment` → `InternalProductAttachmentResponse`, `data: InternalProductAttachment`
  - `deleteConversionUnit` / `unmapSkuFromInternalProduct` / `deleteInternalProductAttachment` → `DeleteResponse`, `data: DeleteResultData { id, code, success }`
- KHÔNG có type `InternalProductCommandApiResponse` — response trả full `InternalProduct` (FE consume để refresh local state)
- **Failure mode**: bất kỳ downstream 4xx/5xx → BFF map error code phù hợp + trả `ErrorResponse` với `code`, `message`, `statusCode`
- **Ref**: §5.1 union types; §6.1 return types

#### AC-9 → N/A

- Hủy bỏ là FE local navigation (navigate back không gọi mutation). BFF không touch.

#### AC-10 → RBAC auth guard: chỉ `garage-owner` được phép gọi mutation chỉnh sửa

- **Khi**: bất kỳ mutation nào trong danh sách 8 mutations của feature này được gọi
- **BFF phải**: verify JWT claim persona `garage-owner` tại auth middleware trước khi forward tới resolver; persona `accountant` chỉ được phép gọi read queries
- **Downstream**: tenantId extract từ JWT header `X-Tenant-Id`, KHÔNG accept từ GraphQL arg do client cung cấp
- **Output shape**: `FORBIDDEN` GraphQL error nếu RBAC check fail
- **Failure mode**: thiếu JWT / JWT expired / persona không match → `UNAUTHENTICATED` / `FORBIDDEN` tương ứng; KHÔNG propagate tới BE
- **Ref**: §4.1 auth header; §9 BR enforcement; BR-CAT-CMN-001

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- tenantId extract từ JWT; KHÔNG accept tenantId từ GraphQL arg client-controlled.
- Firebase token verify per request (production); dev/local bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- `listUnits` (V2-Q9): directory data ít thay đổi — apply `@cacheControl(maxAge: 300, scope: PUBLIC)` tại schema level; invalidate khi gf-erp-mdm unit catalog thay đổi (nếu có event).
- Các sub-mutations và `updateInternalProduct`: single-entity operations, không có N+1 concern.
- `getInternalProduct` enrichment (mainUnitDisplayName, originDisplayName): pattern đã establish tại FEAT-CAT-PROD-DETAIL BFF; reuse GfErpMdmDataSource methods hiện tại — KHÔNG duplicate call trong resolver này.

### 4.3 Security + data exposure

- KHÔNG log `storageUrl` (attachment object key), JWT, tenantId trong resolver body.
- Attachment upload flow: FE upload binary trực tiếp tới ct-file-storage → nhận object key; BFF chỉ nhận `storageUrl` string (cùng `fileName`, `fileType`, `sizeBytes`) trong `AttachmentMetadataInput` và passthrough tới gf-inventory. BFF KHÔNG proxy binary upload.
- Tenant scope enforce qua JWT header — mọi query/mutation đều scoped theo tenantId từ JWT.

### 4.4 Contract stability

- `UpdateInternalProductInput` additive only — thêm optional field OK; xóa field → CR MAJOR.
- `InternalProductResponse` union type — thêm field vào inner types OK; không xóa field existing; không thêm non-null field vào existing types.
- Sub-mutation input types (`ConversionUnitInput`, `AttachmentMetadataInput`): additive only. (SKU mapping ops dùng scalar args `id`/`productId`, không có input type riêng.)
- Breaking change → CR MAJOR + `/cr-raise MAJOR`.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL `extensions.code` | Source AC |
|---|---|---|
| `ERR-INV-006` — code immutable / format | `INTERNAL_PRODUCT_CODE_IMMUTABLE` | AC-2 |
| `ERR-INV-010` — mainUnitCode immutable (has transaction) | `MAIN_UOM_CODE_IMMUTABLE` | AC-3 |
| `ERR-CMN-validation` — originCode không tồn tại | `ORIGIN_CODE_NOT_FOUND` | AC-4 |
| `ERR-INV-013` — conversionRate ≤ 0 | `CONVERSION_RATE_INVALID` | AC-7 |
| `ERR-INV-014` — duplicate unitCode per product | `CONVERSION_UNIT_DUPLICATE` | AC-7 |
| `ERR-INV-047` — conversionRate scale > 6 chữ số thập phân | `CONVERSION_RATE_SCALE_EXCEEDED` | AC-7 |
| `ERR-INV-015` — SKU đã thuộc mã nội bộ khác | `SKU_ALREADY_MAPPED` | AC-7 |
| `ERR-CMN-004` — file size > 10MB | `ATTACHMENT_SIZE_EXCEEDED` | AC-7 |
| `ERR-CMN-005` — mime type không hợp lệ | `ATTACHMENT_MIME_INVALID` | AC-7 |
| HTTP 404 — product not found | `INTERNAL_PRODUCT_NOT_FOUND` | AC-1, AC-4 |
| HTTP 403 — RBAC reject | `FORBIDDEN` | AC-10 |
| HTTP 401 — token invalid/expired | `UNAUTHENTICATED` | AC-10 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Paths ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields chính | Breaking? | AC ref |
|---|---|---|---|---|
| `UpdateInternalProductInput` | input | `name: String`, `mainUnitCode: String`, `nature: ProductNature`, `pricingMethod: PricingMethod`, `materialGroupId: Int`, `brand: String`, `originCode: String`, `productSpec: String`, `technicalSpec: String`, `description: String`, `notes: String`, `imageUrl: String`, `status: InternalProductStatus` (tất cả optional; KHÔNG có field `code`) | NO (new) | AC-4, AC-5, AC-6 |
| `ConversionUnitInput` | input | `unitCode: String!`, `conversionRate: Float!` (dùng chung cho `addConversionUnit` + `updateConversionUnit`) | NO (new) | AC-7 |
| `AttachmentMetadataInput` | input | `fileName: String!`, `fileType: String!`, `sizeBytes: Int!`, `storageUrl: String!` | NO (new) | AC-7 |
| `Unit` | type | `code: String!`, `name: String!` | NO (new) | AC-7 |
| `UnitListData` | type | `items: [Unit!]!` | NO (new) | AC-7 |
| `InternalProductApiResponse` | type (auto-gen) | `success: Boolean`, `code: String`, `message: String`, `data: InternalProduct` | NO | AC-8 |
| `InternalProductResponse` | union (auto-gen) | `InternalProductApiResponse \| ErrorResponse` | NO | AC-8 |

> **Response unions cho sub-ops** (auto-gen qua `generateMultipleResponseTypes`, cùng pattern `{X}ApiResponse { success, code, message, data: {X} } \| ErrorResponse`): `InternalProductConversionUnitResponse` (data: `InternalProductConversionUnit`), `InternalProductSkuMappingResponse` (data: `InternalProductSkuMapping`), `InternalProductAttachmentResponse` (data: `InternalProductAttachment`), `UnitListResponse` (data: `UnitListData`), `DeleteResponse` (data: `DeleteResultData { id: Int, code: String, success: Boolean }`).

> **KHÔNG tồn tại trong code deployed** (đã loại khỏi spec sau audit 2026-07-01): `AddConversionUnitInput`, `UpdateConversionUnitInput`, `AddSkuMappingInput`, `AddAttachmentInput`, `AttachmentKind` enum, `InternalProductCommandApiResponse`, `UnitItem`, `InternalProductDetailResponse`.

> **Reuse (đã define trong module inventory-catalog, chung với FEAT-CAT-PROD-CREATE)**: enum `InternalProductStatus` (`ACTIVE`, `INACTIVE`), `ProductNature` (`GOODS`, `TOOL`, `SERVICE`, `OTHER`), `PricingMethod` (`PWA`, `SI`, `FIFO`, `MA`); query `listUnits` + type `Unit`/`UnitListData` — REUSE, KHÔNG define lại.

### 5.2 Modified types (additive — backward-compat)

| Type | Change | Breaking? | AC ref |
|---|---|---|---|
| `Mutation` | Thêm 8 mutation (V2-M5,M7..M13): `updateInternalProduct`, `mapSkuToInternalProduct`, `unmapSkuFromInternalProduct`, `addConversionUnit`, `updateConversionUnit`, `deleteConversionUnit`, `addInternalProductAttachment`, `deleteInternalProductAttachment` | NO | AC-4, AC-6, AC-7, AC-8 |
| `Query` | Thêm `listUnits: UnitListResponse!` (V2-Q9, no arg; reuse nếu CREATE đã có) | NO | AC-7 |

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `updateInternalProduct` | mutation | `id: Int!, input: UpdateInternalProductInput!` | `InternalProductResponse!` | JWT + tenantId (garage-owner only) | AC-4, AC-5, AC-6, AC-8 |
| `mapSkuToInternalProduct` | mutation | `id: Int!, productId: Int!` | `InternalProductSkuMappingResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `unmapSkuFromInternalProduct` | mutation | `id: Int!, productId: Int!` | `DeleteResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `addConversionUnit` | mutation | `id: Int!, input: ConversionUnitInput!` | `InternalProductConversionUnitResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `updateConversionUnit` | mutation | `id: Int!, unitId: Int!, input: ConversionUnitInput!` | `InternalProductConversionUnitResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `deleteConversionUnit` | mutation | `id: Int!, unitId: Int!` | `DeleteResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `addInternalProductAttachment` | mutation | `id: Int!, input: AttachmentMetadataInput!` | `InternalProductAttachmentResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `deleteInternalProductAttachment` | mutation | `id: Int!, attachmentId: Int!` | `DeleteResponse!` | JWT + tenantId (garage-owner only) | AC-7 |
| `listUnits` | query | (none) | `UnitListResponse!` | JWT | AC-7 |

> **RESOLVED (audit 2026-07-01)**: tên op + args + return type ở trên đã đối chiếu trực tiếp với schema deployed `agg-garage-graph` (`src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts`, V2-M5,M7..M13 + V2-Q9). Lưu ý: `mapSkuToInternalProduct(id, productId)` — `id` = internal product id, `productId` = legacy SKU productId (R9); `listUnits` KHÔNG có arg.

### 6.2 Resolver mapping (downstream BE endpoints)

> Resolver code deployed nằm trong single module file `src/graphql/modules/inventory-catalog/inventory-catalog.resolver.ts` (không phải per-op file `src/resolvers/catalog/*.ts`).

| Operation | Downstream | REST endpoint | DataLoader | AC ref |
|---|---|---|---|---|
| `updateInternalProduct` | gf-inventory (V2-11) | `PUT /api/v2/internal-products/{id}` | — | AC-4, AC-5, AC-6, AC-8 |
| `mapSkuToInternalProduct` | gf-inventory (V2-M7) | `POST /api/v2/internal-products/{id}/sku-mappings` (body `{ productId }`) | — | AC-7 |
| `unmapSkuFromInternalProduct` | gf-inventory (V2-M8) | `DELETE /api/v2/internal-products/{id}/sku-mappings/{productId}` | — | AC-7 |
| `addConversionUnit` | gf-inventory (V2-M9) | `POST /api/v2/internal-products/{id}/conversion-units` | — | AC-7 |
| `updateConversionUnit` | gf-inventory (V2-M10) | `PUT /api/v2/internal-products/{id}/conversion-units/{unitId}` | — | AC-7 |
| `deleteConversionUnit` | gf-inventory (V2-M11) | `DELETE /api/v2/internal-products/{id}/conversion-units/{unitId}` | — | AC-7 |
| `addInternalProductAttachment` | gf-inventory (V2-M12) | `POST /api/v2/internal-products/{id}/attachments` | — | AC-7 |
| `deleteInternalProductAttachment` | gf-inventory (V2-M13) | `DELETE /api/v2/internal-products/{id}/attachments/{attachmentId}` | — | AC-7 |
| `listUnits` | gf-erp-mdm | `POST /protected/catalog/v1/inquiry` body `{directory: "UNIT"}` (R30 fix 2026-07-01 — KHÔNG phải `GET /api/v1/units`; resolver gọi `gfErpMdmService.post(MDM_CATALOG_INQUIRY, {directory: "UNIT"})`) | — | AC-7 |

> **RESOLVED (audit 2026-07-01, corrected 2026-07-01 R30)**: op name/args/return type khớp schema deployed (`inventory-catalog.schema.ts` / `.resolver.ts`). Downstream REST paths derive từ resolver passthrough theo standard sub-resource pattern trên `/api/v2/internal-products/{id}` (verified 1-1 với `config/endpoints.ts`), map 1-1 từ GraphQL args (SKU mapping → `productId`, conversion unit → `unitId`, attachment → `attachmentId`). `listUnits` KHÔNG dùng REST endpoint riêng — gọi chung `MDM_CATALOG_INQUIRY = "/protected/catalog/v1/inquiry"` (POST, body `directory`) như FEAT-CAT-PROD-CREATE/LIST. NC-1/NC-3/NC-4 đã đóng.

### 6.3 DataLoader / batching strategy

Không có DataLoader mới cho feature này. Tất cả operations là single-entity mutations hoặc flat list query. `getInternalProduct` enrichment reuse DataLoader/method từ FEAT-CAT-PROD-DETAIL BFF.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `listUnits` | `@cacheControl(maxAge: 300, scope: PUBLIC)` | 5 phút | Unit catalog ít thay đổi |
| `updateInternalProduct` và sub-mutations | `@cacheControl(maxAge: 0)` | — | Mutation, no cache |

### 6.5 Persisted query allowlist

Không áp dụng cho W03 — nếu BFF enable allowlist ở production, thêm 9 operations (tên đã lock theo code, xem §6.1) vào allowlist.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Paths ⊆ `bffs/agg-garage-graph/**`.

> Cấu trúc deployed thực tế: module gộp `src/graphql/modules/inventory-catalog/` (schema `inventory-catalog.schema.ts` + resolver `inventory-catalog.resolver.ts` + types `inventory-catalog.types.ts`), KHÔNG phải per-op file `src/resolvers/catalog/*.ts` / `src/schema/catalog.graphql` như bảng planning trước đó.

| Layer | Path | Change type | Reuse pattern | AC ref |
|---|---|---|---|---|
| `schema` | `src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts` | MODIFY (additive) | extend SDL — add 8 mutations (V2-M5,M7..M13) + `listUnits` + input `UpdateInternalProductInput`/`ConversionUnitInput`/`AttachmentMetadataInput` + auto-gen response unions | AC-4, AC-5, AC-6, AC-7, AC-8 |
| `resolver` | `src/graphql/modules/inventory-catalog/inventory-catalog.resolver.ts` | MODIFY (additive) | resolver passthrough cho 8 mutations + `listUnits` | AC-4, AC-5, AC-6, AC-7, AC-8 |
| `data-source` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | methods: updateProduct, mapSku, unmapSku, addConversionUnit, updateConversionUnit, deleteConversionUnit, addAttachment, deleteAttachment | AC-4, AC-7, AC-8 |
| `data-source` | `src/data-sources/GfErpMdmDataSource.ts` | ADDITIVE | method `listUnits()` (directory=UNIT) — REUSE nếu đã có | AC-7 |
| `tests/integration` | `tests/integration/catalog-product-edit.test.ts` | NEW | apollo test client + mock gf-inventory + mock gf-erp-mdm | AC-4, AC-7, AC-8, AC-10 |

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory V2-11 + sub-endpoints V2-M7..M13 stable + test green)

S5  BFF schema + resolver wire (FEAT-CAT-PROD-EDIT)
    Entry: BE FEAT-CAT-PROD-EDIT §6 REST contracts stable (GraphQL op names + sub-resource paths đã lock theo code)
    Exit:  BFF contract test green; all 9 ops integration-tested (op names đã lock theo code)
    └─► (hand-off FE S6: garage-web FEAT-CAT-PROD-EDIT + garage-mobile FEAT-CAT-PROD-EDIT)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolvers + data-source methods + integration tests | schema, resolvers, data-sources | BE S4 green (contract lock theo code) | contract test green + N/A test for AC-9 | BE FEAT-CAT-PROD-EDIT S4 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary enforcement = BE. BFF chỉ enforce auth + schema-level type safety.

| BR ID | Severity | Enforcement tại BFF | File path | AC ref | Notes |
|---|---|---|---|---|---|
| `BR-CAT-CMN-001` | CORNERSTONE | Auth guard: persona `garage-owner` only cho mutations | `src/auth/catalogGuard.ts` | AC-10 | Primary at BE; BFF enforce persona check |
| tenant isolation | CORNERSTONE | tenantId từ JWT header, không accept từ arg | mọi resolver | AC-10 | Hardcoded resolve strategy |
| `BR-CAT-PROD-010` | NORMAL | `pricingMethod` CÓ trong `UpdateInternalProductInput` (schema optional) — BFF passthrough; lock (nếu có) enforce BE-side | — | AC-5 | Schema KHÔNG loại field; BE là enforcer |
| `BR-CAT-PROD-004` | NORMAL | `code` excluded khỏi `UpdateInternalProductInput` schema | schema module inventory-catalog | AC-2 | Schema-level fail-fast; BE enforce independently |
| `ProductNature` enum | NORMAL | GraphQL schema reject invalid enum values (`nature`) | schema module inventory-catalog | AC-4 | Schema-level type safety |
| `InternalProductStatus` enum | NORMAL | GraphQL schema reject invalid enum values (`status`) | schema module inventory-catalog | AC-6 | Schema-level type safety |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-PROD-EDIT.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (query) | test-api | Reuse từ FEAT-CAT-PROD-DETAIL test suite |
| AC-4 | BFF integration (mutation) | test-api | Mock gf-inventory V2-11, verify request shape + body mapping |
| AC-6 | BFF integration (status update) | test-api | Verify `status` field forwarded correctly trong update payload |
| AC-7 | BFF integration (sub-mutations ×8) | test-api | Mock gf-inventory sub-endpoints; verify error codes map (ERR-INV-013/014/015/047, ERR-CMN-004/005) |
| AC-7 | BFF integration (`listUnits`) | test-api | Mock gf-erp-mdm; verify cache directive `maxAge=300` |
| AC-8 | BFF contract (response shape) | test-api | Snapshot `InternalProductApiResponse.data: InternalProduct` (+ sub-op response unions) |
| AC-10 | BFF auth (RBAC) | test-isolation | `accountant` persona → FORBIDDEN cho 8 mutations; `garage-owner` → pass |
| — | BFF contract (SDL stability) | test-api | Schema snapshot test — detect breaking changes |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | Downstream REST V2-11 + sub-resource endpoints (xem §6.2) — BFF waits S4 green |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | Consume `updateInternalProduct` + sub-mutations từ §6.1; consume `getInternalProduct` (FEAT-CAT-PROD-DETAIL BFF) cho form load |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | Consume same ops từ §6.1 |

**Source ID consistency** (item #18): `source_feat_sha = e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc` — identical với BE/FE-web/Mobile files.

**NEED CONFIRMATION summary**:

| ID | Nội dung | Status | Escalate to |
|---|---|---|---|
| NC-1 | Tên chính xác của 9 GraphQL ops V2-M5..M13 + V2-Q9 | ✅ RESOLVED (audit 2026-07-01) — lock theo schema deployed `inventory-catalog.schema.ts` | — |
| NC-2 | Field lock ĐVT chính (`hasTransaction` / `isMainUomLocked`) trong response | ✅ RESOLVED (audit 2026-07-01) — KHÔNG tồn tại; type `InternalProduct` không có lock flag, khóa enforce ở mutation BE | — |
| NC-3 | REST paths cho sub-mutation endpoints V2-M7..M13 trên gf-inventory | ✅ RESOLVED (audit 2026-07-01) — resolver passthrough theo standard sub-resource pattern trên `/api/v2/internal-products/{id}` (xem §6.2) | — |
| NC-4 | REST endpoint gf-erp-mdm cho `listUnits` (V2-Q9) | ✅ RESOLVED (audit 2026-07-01, corrected R30) — `POST /protected/catalog/v1/inquiry` body `{directory: "UNIT"}` (KHÔNG phải `GET /api/v1/units`), xem §6.2 | — |

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EDIT.md`](../../../../../Product/features/FEAT-CAT-PROD-EDIT.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-EDIT.md`](../be/FEAT-CAT-PROD-EDIT.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: gf-inventory additive aggregates (InternalProduct entity strategy)
- **ADR-009**: JPA no relationship mapping (scalar FK only)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec FEAT-CAT-PROD-EDIT W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ, §2 BFF passthrough pattern, §3 BFF behaviour map 10/10 AC, §4 auth+perf+cache+error mapping, §5-§11 SDL delta + 9 ops contract + resolver mapping + file map. 4 NEED CONFIRMATION items: NC-1 op names, NC-2 hasTransaction field, NC-3 sub-endpoint REST paths, NC-4 listUnits gf-erp-mdm path. |
| 2026-07-01 | 2 | main agent (audit) | Đối chiếu code thực tế agg-garage-graph (`src/graphql/modules/inventory-catalog/inventory-catalog.schema.ts`), sửa doc cho khớp GraphQL contract deployed. Sub-mutation op names: `addInternalProductSkuMapping`→`mapSkuToInternalProduct`, `removeInternalProductSkuMapping`→`unmapSkuFromInternalProduct`, `addInternalProductConversionUnit`→`addConversionUnit`, `updateInternalProductConversionUnit`→`updateConversionUnit`, `removeInternalProductConversionUnit`→`deleteConversionUnit`, `removeInternalProductAttachment`→`deleteInternalProductAttachment`. Args `productId/skuId/unitId`→`id/productId/unitId/attachmentId` theo schema; return types sub-op sửa từ `InternalProductResponse!` → `InternalProductSkuMappingResponse!`/`InternalProductConversionUnitResponse!`/`InternalProductAttachmentResponse!`/`DeleteResponse!`. Input types: gộp `AddConversionUnitInput`/`UpdateConversionUnitInput`→`ConversionUnitInput` (field `uomCode`→`unitCode`), `AddAttachmentInput`→`AttachmentMetadataInput` (`fileName/fileType/sizeBytes/storageUrl`), xóa `AddSkuMappingInput`. `UpdateInternalProductInput`: `materialGroupCode`→`materialGroupId: Int`, ADD `pricingMethod: PricingMethod` (code CÓ field này — AC-5 + BR-CAT-PROD-010 sửa từ "excluded" → included). Enum: `InternalProductNature`→`ProductNature`, `InternalProductPricingMethod`→`PricingMethod`; xóa `AttachmentKind` enum (code dùng `attachmentKind: String!` ở output). Xóa type ảo `InternalProductCommandApiResponse`/`InternalProductDetailResponse`/`UnitItem`; response = union auto-gen `InternalProductApiResponse.data: InternalProduct`, `Unit`/`UnitListData`/`UnitListResponse`. `listUnits`: bỏ arg `directory`, return `[UnitItem!]!`→`UnitListResponse!`. AC-3: type `InternalProduct` không có lock flag (NC-2 resolved-negative). §7 file map sửa sang module gộp thực tế. §6.2 điền REST sub-resource paths (`/api/v2/internal-products/{id}/sku-mappings|conversion-units|attachments`) + `listUnits` → `GET /api/v1/units`. NC-1/NC-2/NC-3/NC-4 RESOLVED (đóng toàn bộ NEED CONFIRMATION theo code contract). |
| 2026-07-01 | 3 | main agent (self-verify) | **Sửa lỗi do lượt audit v2 tự suy luận sai**: §6.2 + NC-4 `listUnits` REST mapping `GET /api/v1/units` → `POST /protected/catalog/v1/inquiry` body `{directory:"UNIT"}` (verified trực tiếp `config/endpoints.ts` `MDM_CATALOG_INQUIRY` + resolver `listUnits` gọi `gfErpMdmService.post(...)`) — endpoint `/api/v1/units` KHÔNG tồn tại trong code, đây là suy diễn sai của lượt fix trước. Các REST path khác ở §6.2 (sku-mappings/conversion-units/attachments) đã verify khớp `endpoints.ts` — giữ nguyên. |
