---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-DETAIL.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DETAIL"
source_feat_sha: "1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d"
generated_at: "2026-06-29T15:00:00+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage mở chi tiết mã SP nội bộ → xem thông tin chung + tabs ĐVT/SKU/đính kèm → gắn SKU mới → bỏ gắn → upload file đính kèm."
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-PROD-DETAIL"]
paired_fe_web_feats: ["FEAT-CAT-PROD-DETAIL"]
paired_mobile_feats: ["FEAT-CAT-PROD-DETAIL"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DETAIL.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-DETAIL (BE): Xem chi tiết mã sản phẩm nội bộ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DETAIL` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage mở chi tiết mã SP nội bộ → xem thông tin chung + tabs ĐVT/SKU/đính kèm → gắn SKU mới → bỏ gắn → upload file đính kèm. |
| Cross-tier pair | BFF: FEAT-CAT-PROD-DETAIL \| Web: FEAT-CAT-PROD-DETAIL \| Mobile: FEAT-CAT-PROD-DETAIL |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) |
| Source version | v10 |
| Source SHA | `1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d` |
| Generated at | 2026-06-29T15:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu đầy đủ thông tin một mã sản phẩm nội bộ — thông tin chung, đơn vị tính quy đổi, SKU được gắn, và tệp đính kèm — để nắm bản chất vật tư và cập nhật mapping ngay trên màn hình chi tiết mà không phải vào form sửa riêng. Feature này là điểm tra cứu trung tâm trong luồng quản lý danh mục mã SP nội bộ V2, hỗ trợ nền dữ liệu vật tư phục vụ tính tồn và báo cáo toàn hệ thống Garage.

## 2. Trách nhiệm backend (gf-inventory)

- Cung cấp endpoint `GET /api/v2/internal-products/{id}` (V2-8) trả đầy đủ scalar fields của `internal_product`, derived field `materialGroupName` (JOIN nội bộ với `material_group` cùng boundary), và 3 child arrays `skuMappings[]` / `conversionUnits[]` / `attachments[]`; trả raw codes `mainUomCode` / `originCode` để BFF enrich display name từ gf-erp-mdm (BE không gọi gf-erp-mdm).
- Enforce BR-CAT-CMN-002: audit fields `createdAt/By`, `updatedAt/By` bắt buộc trong mọi response.
- Cung cấp endpoints CRUD cho `internal_product_uom_conversion` (thêm/sửa/xóa) với enforcement BR-CAT-PROD-011 v15 (rate > 0, scale ≤ 6 chữ số thập phân ở app layer) và BR-CAT-PROD-012 (immutable khi sản phẩm đã có giao dịch kho).
- Cung cấp endpoints gắn/bỏ gắn SKU qua `internal_product_sku_mapping` với enforcement BR-CAT-PROD-013 (1 SKU → tối đa 1 mã nội bộ) và BR-CAT-PROD-014 (xóa mapping không xóa SKU gốc).
- Cung cấp endpoints upload/xóa file đính kèm qua `internal_product_attachment` với enforcement BR-CAT-PROD-015 (max 5 files/product, ≤ 10 MB, PDF/JPG/PNG).
- Enforce TenantFilter + TenantContext trên mọi endpoint; RBAC dual-persona (garage-owner / accountant) theo AC-11.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Đọc chi tiết mã sản phẩm nội bộ

#### AC-1 → Serve endpoint V2-8 khi client mở màn chi tiết

- **Khi**: BFF gọi `GET /api/v2/internal-products/{id}` với JWT hợp lệ.
- **BE phải**: resolve `tenantId` từ JWT qua `TenantContext`; lookup `internal_product` theo `id` + `tenant_id`; trả 404 nếu không tìm thấy hoặc cross-tenant (không leak existence).
- **Output**: HTTP 200 + response JSON đầy đủ (xem §6.1 V2-8); HTTP 404 nếu not found.
- **Failure mode**: `id` không tồn tại hoặc thuộc tenant khác → HTTP 404, không message leak.
- **Ref**: BR-CAT-CMN-002 (§9), entity `InternalProduct` (§5.1), endpoint V2-8 (§6.1).

#### AC-2 → Trả đầy đủ scalar fields và materialGroupName

- **Khi**: V2-8 resolve thành công.
- **BE phải**: include tất cả scalar fields của `internal_product` (code, name, mainUomCode, originCode, brand, nature, pricingMethod, materialGroupId, status, imageUrl, productSpec, technicalSpec, description, notes) + derived `materialGroupName` từ JOIN với `material_group` cùng boundary.
- **Output**: `materialGroupName` populated nếu `materialGroupId` khác null; null nếu chưa gắn nhóm. Không có `brandDisplayName` (brand là free-text — R18). Không có `mainUnitDisplayName` / `originDisplayName` (BFF enrich từ gf-erp-mdm).
- **Failure mode**: không apply (JOIN nội bộ gf-inventory).
- **Ref**: ADR-017, entity `InternalProduct` (§5.1), endpoint V2-8 (§6.1).

#### AC-3 → Trả audit fields đầy đủ trong response

- **Khi**: V2-8 resolve thành công.
- **BE phải**: populate `createdAt`, `createdByUserName`, `updatedAt`, `updatedByUserName` từ audit columns của `internal_product`; resolve display name của người tạo/sửa từ principal context.
- **Output**: 4 audit fields không null trong response.
- **Failure mode**: không apply.
- **Ref**: BR-CAT-CMN-002 (§9), entity `InternalProduct` (§5.1).

#### AC-4 → Trả 3 child arrays (tabs dữ liệu liên quan)

- **Khi**: V2-8 resolve thành công.
- **BE phải**: query 3 child tables theo `internal_product_id` + `tenant_id`; populate `skuMappings[]` (JOIN với legacy `product` để lấy `skuCode`, `skuName`), `conversionUnits[]`, `attachments[]`; trả `[]` nếu không có bản ghi.
- **Output**: `skuMappings: [{id, skuId, skuCode, skuName}]`; `conversionUnits: [{id, uomCode, conversionRate}]`; `attachments: [{id, fileUrl, fileName, fileSize, mimeType, attachmentKind}]`.
- **Failure mode**: không apply (JOIN nội bộ gf-inventory).
- **Ref**: entities `InternalProductUomConversion`, `InternalProductSkuMapping`, `InternalProductAttachment` (§5.1), endpoint V2-8 (§6.1).

### Cluster B — Quản lý ĐVT quy đổi

#### AC-5 → CRUD endpoints cho đơn vị tính quy đổi

- **Khi**: client gọi add/edit/delete conversion unit qua endpoints V2-12..V2-14.
- **BE phải (thêm)**: validate `conversionRate > 0` (ERR-INV-013); validate scale ≤ 6 chữ số thập phân ở app layer trước khi save — DB `NUMERIC(18,6)` silently round không đủ bảo vệ, app layer PHẢI reject trước (ERR-INV-047); validate `uomCode` unique per `internal_product_id` (ERR-INV-014); insert row `internal_product_uom_conversion`.
- **BE phải (sửa)**: check immutability trước — nếu `internal_product` đã có giao dịch kho (receipt/delivery/reservation), từ chối HTTP 409 (BR-CAT-PROD-012); nếu chưa, apply cùng validation như thêm.
- **BE phải (xóa)**: check immutability (BR-CAT-PROD-012); xóa row.
- **Output**: 201 Created + record khi thêm; 200 + updated record khi sửa; 204 No Content khi xóa.
- **Failure mode**: rate ≤ 0 → ERR-INV-013 (422); scale > 6 → ERR-INV-047 (422); duplicate uomCode → ERR-INV-014 (409); có giao dịch → HTTP 409.
- **Ref**: BR-CAT-PROD-011 v15, BR-CAT-PROD-012 (§9), entity `InternalProductUomConversion` (§5.1), endpoints V2-12..V2-14 (§6.1).

### Cluster C — Quản lý SKU mapping

#### AC-6 → Endpoint gắn SKU vào mã SP nội bộ

- **Khi**: client gọi POST để gắn `skuId` vào mã SP nội bộ (endpoint V2-16 — NEED CONFIRMATION path).
- **BE phải**: validate `skuId` tồn tại trong legacy `product` table + cùng `tenant_id`; validate chưa có mapping `(tenant_id, sku_id)` trong `internal_product_sku_mapping` (ERR-INV-015); insert row.
- **Output**: 201 Created + mapping record `{id, skuId, skuCode, skuName}`.
- **Failure mode**: `skuId` đã gắn mã nội bộ khác (kể cả mã hiện tại) → ERR-INV-015 (409); `skuId` không tồn tại → HTTP 422.
- **Ref**: BR-CAT-PROD-013 (§9), entity `InternalProductSkuMapping` (§5.1), endpoint V2-16 (§6.1).

#### AC-7 → Endpoint bỏ gắn SKU

- **Khi**: client gọi DELETE để bỏ mapping (endpoint V2-17 — NEED CONFIRMATION path).
- **BE phải**: lookup `internal_product_sku_mapping` theo `internal_product_id` + `sku_id` + `tenant_id`; xóa row mapping; KHÔNG xóa row `product`.
- **Output**: 204 No Content.
- **Failure mode**: mapping không tồn tại → HTTP 404.
- **Ref**: BR-CAT-PROD-014 (§9), entity `InternalProductSkuMapping` (§5.1), endpoint V2-17 (§6.1).

### Cluster D — Quản lý file đính kèm

#### AC-8 → Endpoints upload và xóa file đính kèm

- **Khi**: client gọi POST để upload hoặc DELETE để xóa (endpoints V2-18..V2-19 — NEED CONFIRMATION paths).
- **BE phải (upload)**: validate count file hiện tại của product < 5 (BR-CAT-PROD-015, ERR-CMN-004); validate `fileSize ≤ 10 MB` (ERR-CMN-004); validate `mimeType ∈ {PDF, JPG, PNG}` (ERR-CMN-005); persist `ct-file-storage object key` + metadata vào `internal_product_attachment`.
- **BE phải (xóa)**: lookup row theo `id` + `internal_product_id` + `tenant_id`; xóa row; file object trên ct-file-storage KHÔNG tự xóa (cleanup ngoài scope batch này).
- **Output**: 201 Created + attachment record khi upload; 204 No Content khi xóa.
- **Failure mode**: count ≥ 5 → ERR-CMN-004 (422); size > 10 MB → ERR-CMN-004 (422); mime không hợp lệ → ERR-CMN-005 (422).
- **Ref**: BR-CAT-PROD-015 (§9), entity `InternalProductAttachment` (§5.1), endpoints V2-18..V2-19 (§6.1).

### Cluster E — Phân quyền và phạm vi

#### AC-10 → N/A (UI-only)

Nút hành động trên màn chi tiết ("Sửa", "Xóa", "Kích hoạt/Vô hiệu hóa") là navigation/trigger thuộc FE/Mobile tier — delegate sang `FEAT-CAT-PROD-EDIT` và `FEAT-CAT-PROD-DELETE`. BE không có endpoint mới từ AC này. Xem `fe-web/FEAT-CAT-PROD-DETAIL.md §3 AC-10`.

#### AC-11 → Enforce RBAC trên mọi endpoint của feature

- **Khi**: mọi request tới V2-8, V2-12..V2-14, V2-16..V2-17, V2-18..V2-19.
- **BE phải**: resolve role từ JWT claims; apply permission matrix — `garage-owner`: full access (read + write); `accountant`: read-only (V2-8 only, các write endpoint trả 403) — NEED CONFIRMATION: permission matrix cần Business Authority confirm từ source AC-11 text trước impl.
- **Output**: HTTP 403 nếu role không đủ quyền thực hiện write.
- **Failure mode**: role thiếu → HTTP 403.
- **Ref**: Critical Rule #6 (dual persona), §4.2.

#### AC-12 → N/A (Mobile tier scope)

Giới hạn view-only trên mobile là responsibility của mobile tier (mobile không render action buttons; xem `mobile/FEAT-CAT-PROD-DETAIL.md §3 AC-12`). BE phục vụ cùng set endpoints cho web và mobile — không có endpoint riêng cho mobile.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-CMN-002** (CORNERSTONE): audit fields `createdAt/By`, `updatedAt/By` bắt buộc trong response V2-8; enforce tại service layer. Vi phạm = mapping bug — không được ship.
- **BR-CAT-PROD-011 v15** (CORNERSTONE): `conversionRate > 0` (ERR-INV-013 HTTP 422); scale ≤ 6 chữ số thập phân app-layer guard (ERR-INV-047 HTTP 422) — DB `NUMERIC(18,6)` silently round; app layer PHẢI validate trước save. Enforce tại `InternalProductDetailService`.
- **BR-CAT-PROD-012** (CORNERSTONE): `internal_product_uom_conversion` immutable khi `internal_product` đã có giao dịch (receipt/delivery/reservation); check bằng count nội bộ gf-inventory; vi phạm → HTTP 409.
- **BR-CAT-PROD-013** (CORNERSTONE): unique `(tenant_id, sku_id)` trên `internal_product_sku_mapping` (ERR-INV-015 HTTP 409); enforce bằng unique constraint DB + pre-check service layer.
- **BR-CAT-PROD-014** (NORMAL): DELETE SKU mapping chỉ xóa row mapping, KHÔNG xóa `product` row; enforce bằng DELETE statement trên mapping table only.
- **BR-CAT-PROD-015** (NORMAL): max 5 attachments/product (ERR-CMN-004 HTTP 422); size ≤ 10 MB (ERR-CMN-004 HTTP 422); mime ∈ {PDF, JPG, PNG} (ERR-CMN-005 HTTP 422); count check tại service layer trước insert.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `TenantContext.getTenantId()` enforce mọi query — cross-tenant fetch trả 404 (Critical Rule #4).
- Tenant resolve từ JWT, không có `{tenantId}` trong path.
- Role: `garage-owner` full access; `accountant` read-only (pending NEED CONFIRMATION — xem AC-11).

### 4.3 Idempotency + concurrency

- `GET /api/v2/internal-products/{id}`: safe, không cần idempotency key.
- POST/DELETE child table endpoints: unique constraint DB là primary guard (ERR-INV-014, ERR-INV-015); không cần client idempotency key riêng.
- Immutability check (BR-CAT-PROD-012): check-then-act; race condition chấp nhận được ở scale hiện tại.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-013` | 422 | AC-5 | INLINE (conversion rate field) |
| `ERR-INV-014` | 409 | AC-5 | TOAST ("Đơn vị tính đã tồn tại trong danh sách") |
| `ERR-INV-047` | 422 | AC-5 | INLINE (conversion rate field — scale > 6 chữ số) |
| `ERR-INV-015` | 409 | AC-6 | TOAST ("SKU đã được gắn với mã sản phẩm nội bộ khác") |
| `ERR-CMN-004` | 422 | AC-8 | TOAST (quá 5 file hoặc file > 10 MB) |
| `ERR-CMN-005` | 422 | AC-8 | TOAST (định dạng file không hợp lệ — chỉ PDF/JPG/PNG) |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

Schema cho tất cả entities dưới đây được tạo ở **FEAT-CAT-PROD-CREATE** (Flyway additive migration block V20260624020000..V20260624060000 trong schema `dev_gf_inventory`). Feature này KHÔNG thêm migration mới — chỉ đọc và ghi vào schema đã tạo.

| Entity | Table | Scope tại feature này | AC ref |
|---|---|---|---|
| `InternalProduct` | `internal_product` | READ (V2-8 scalar + audit fields + materialGroupName JOIN) | AC-1, AC-2, AC-3 |
| `MaterialGroup` | `material_group` | READ (JOIN để lấy `materialGroupName`) | AC-2 |
| `InternalProductUomConversion` | `internal_product_uom_conversion` | READ (V2-8 `conversionUnits[]`) + WRITE (V2-12..V2-14) | AC-4, AC-5 |
| `InternalProductSkuMapping` | `internal_product_sku_mapping` | READ (V2-8 `skuMappings[]`) + WRITE (V2-16..V2-17) | AC-4, AC-6, AC-7 |
| `InternalProductAttachment` | `internal_product_attachment` | READ (V2-8 `attachments[]`) + WRITE (V2-18..V2-19) | AC-4, AC-8 |
| `Product` (legacy) | `product` | READ-ONLY JOIN (populate `skuCode`, `skuName` trong `skuMappings[]` và validate `skuId` existence tại AC-6) | AC-4, AC-6 |

> NEED CONFIRMATION: tên bảng ĐVT quy đổi — ADR-017 dùng `internal_product_conversion_uom` với cột `uom_code`; PKG §2.2.1 dùng `internal_product_uom_conversion` với cột `uom_id`. Architecture Authority cần xác nhận canonical name + column type trước khi impl V2-12..V2-14.

### 5.2 Index / constraint changes

Không có index/constraint mới tại FEAT-CAT-PROD-DETAIL — đã đủ từ migration block FEAT-CAT-PROD-CREATE.

---

## 6. API contract delta (BE — REST)

> Canonical spec tại `Architecture/api/gf-inventory-api.md` §4 (V2-1..V2-23). Section này là index dev-actionable + validation notes — KHÔNG duplicate canonical spec.

### 6.1 REST endpoints

#### V2-8 — Detail endpoint (primary)

| Field | Value |
|---|---|
| Method + Path | `GET /api/v2/internal-products/{id}` |
| Auth | JWT Bearer (`X-Tenant-Id` via TenantFilter) |
| Idempotency | safe (read-only) |
| AC ref | AC-1, AC-2, AC-3, AC-4 |

Response body (BE layer — trước BFF enrich):
```json
{
  "id": "uuid",
  "code": "string",
  "name": "string",
  "mainUomCode": "string",
  "originCode": "string|null",
  "brand": "string|null",
  "nature": "GOODS|TOOL|SERVICE|OTHER",
  "pricingMethod": "PWA",
  "materialGroupId": "uuid|null",
  "materialGroupName": "string|null",
  "status": "ACTIVE|INACTIVE",
  "imageUrl": "string|null",
  "productSpec": "string|null",
  "technicalSpec": "string|null",
  "description": "string|null",
  "notes": "string|null",
  "createdAt": "ISO8601",
  "createdByUserName": "string",
  "updatedAt": "ISO8601",
  "updatedByUserName": "string",
  "skuMappings": [
    { "id": "uuid", "skuId": "long", "skuCode": "string", "skuName": "string" }
  ],
  "conversionUnits": [
    { "id": "uuid", "uomCode": "string", "conversionRate": "decimal(18,6)" }
  ],
  "attachments": [
    { "id": "uuid", "fileUrl": "string", "fileName": "string", "fileSize": "long", "mimeType": "string", "attachmentKind": "IMAGE|DOC" }
  ]
}
```

> BFF enrich `mainUnitDisplayName` (gọi gf-erp-mdm `directory=UNIT` với `mainUomCode`) và `originDisplayName` (gọi gf-erp-mdm `directory=COUNTRY` với `originCode` — R18 NEW) sau khi nhận response này. BE KHÔNG gọi gf-erp-mdm. KHÔNG có `brandDisplayName` (brand free-text — R18).

#### V2-15..V2-17 — ĐVT quy đổi CRUD

> **RESOLVED (CR-20260630-01 P2.4)**: Canonical IDs per `Architecture/api/gf-inventory-api.md` v24 — V2-15 POST, V2-16 PUT, V2-17 DELETE conversion-units. (V2-12 = DELETE product; V2-13 = POST sku-mapping — không thuộc conversion-units block).

| # | Method + Path | Key validation | Error codes | AC ref |
|---|---|---|---|---|
| V2-15 | `POST /api/v2/internal-products/{id}/conversion-units` | rate > 0; scale ≤ 6 (app layer); uomCode unique/product | ERR-INV-013, ERR-INV-014, ERR-INV-047 | AC-5 |
| V2-16 | `PUT /api/v2/internal-products/{id}/conversion-units/{unitId}` | immutability check BR-CAT-PROD-012; same validation as V2-15 | ERR-INV-013, ERR-INV-047, HTTP 409 (immutable) | AC-5 |
| V2-17 | `DELETE /api/v2/internal-products/{id}/conversion-units/{unitId}` | immutability check BR-CAT-PROD-012 | HTTP 409 (immutable), HTTP 404 | AC-5 |

#### V2-16..V2-17 — SKU mapping

> NEED CONFIRMATION: paths inferred. Verify vs `Architecture/api/gf-inventory-api.md` §V2-16..V2-17.

| # | Method + Path (inferred) | Key validation | Error codes | AC ref |
|---|---|---|---|---|
| V2-16 | `POST /api/v2/internal-products/{id}/sku-mappings` | skuId exists (same tenant); unique (tenant_id, sku_id) | ERR-INV-015 | AC-6 |
| V2-17 | `DELETE /api/v2/internal-products/{id}/sku-mappings/{skuId}` | mapping exists + tenant check | HTTP 404 | AC-7 |

#### V2-18..V2-19 — File đính kèm

> NEED CONFIRMATION: paths inferred. Verify vs `Architecture/api/gf-inventory-api.md` §V2-18..V2-19. File object trên ct-file-storage KHÔNG bị xóa khi gọi V2-19 (orphan cleanup ngoài scope batch này — per ADR-016 pattern).

| # | Method + Path (inferred) | Key validation | Error codes | AC ref |
|---|---|---|---|---|
| V2-18 | `POST /api/v2/internal-products/{id}/attachments` | count < 5; size ≤ 10 MB; mime ∈ {PDF,JPG,PNG} | ERR-CMN-004, ERR-CMN-005 | AC-8 |
| V2-19 | `DELETE /api/v2/internal-products/{id}/attachments/{attachmentId}` | record exists + tenant check | HTTP 404 | AC-8 |

### 6.2 Modified REST endpoints

Không có endpoint hiện tại bị modify.

### 6.3 Kafka topics

Không có Kafka event publish/consume trong feature này.

### 6.4 Cross-boundary REST consumers

`GET /api/v2/internal-products/{id}` (V2-8) được consumed bởi `agg-garage-graph` (BFF) trong GraphQL resolver `internalProduct(id)`. BFF sau đó gọi thêm gf-erp-mdm để enrich display names — đó là BFF responsibility, không phải BE.

---

## 7. File/module impact map (BE — Hexagonal)

> Paths ⊆ `services/gf-inventory/**` (Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/InternalProduct.java` | REUSE | entity đã tạo ở FEAT-CAT-PROD-CREATE | — | AC-1..AC-4 |
| `domain/model` | `src/main/java/.../domain/model/InternalProductUomConversion.java` | ADDITIVE | thêm domain method `validateScale()` (scale ≤ 6) | ~15 | AC-5 |
| `domain/model` | `src/main/java/.../domain/model/InternalProductSkuMapping.java` | REUSE | entity đã tạo | — | AC-4, AC-6, AC-7 |
| `domain/model` | `src/main/java/.../domain/model/InternalProductAttachment.java` | REUSE | entity đã tạo | — | AC-4, AC-8 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductRepository.java` | ADDITIVE | thêm `findDetailById(UUID id, UUID tenantId)` aggregate query + materialGroupName JOIN | ~25 | AC-1..AC-4 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductUomConversionRepository.java` | ADDITIVE | thêm findByInternalProductId, delete, countByInternalProductId | ~20 | AC-4, AC-5 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductSkuMappingRepository.java` | ADDITIVE | thêm findBySkuIdAndTenantId, findByInternalProductId | ~15 | AC-4, AC-6, AC-7 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductAttachmentRepository.java` | ADDITIVE | thêm countByInternalProductIdAndTenantId | ~10 | AC-4, AC-8 |
| `app/service` | `src/main/java/.../app/service/InternalProductDetailService.java` | NEW | detail aggregation + child CRUD + BR enforcement | ~220 | AC-1..AC-8, AC-11 |
| `adapter/controller` | `src/main/java/.../adapter/controller/InternalProductController.java` | ADDITIVE | thêm GET V2-8 + child management endpoints V2-12..V2-19 | ~130 | AC-1..AC-8, AC-11 |
| `test/unit` | `src/test/java/.../app/service/InternalProductDetailServiceTest.java` | NEW | unit tests: BR-011 scale/rate, BR-012 immutability, BR-013 unique SKU, BR-015 count/mime | ~260 | AC-1..AC-8 |
| `test/contract` | `src/test/java/.../adapter/controller/InternalProductDetailContractTest.java` | NEW | contract tests V2-8 + child endpoints happy/error path | ~160 | AC-1..AC-8, AC-11 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Verify schema + aggregate query
    Entry: migration từ FEAT-CAT-PROD-CREATE deployed (V20260624020000..V20260624060000)
    Hành động: implement findDetailById JPQL + 3 child queries; verify JOIN materialGroupName
    Exit: repository queries trả đúng shape; unit test trên repo layer green
    └─► S2

S2  Service logic — InternalProductDetailService
    Entry: S1
    Hành động:
      - Detail aggregation (assemble response với 3 child arrays + materialGroupName)
      - Conversion unit CRUD + BR-CAT-PROD-011 v15 (rate + scale) + BR-CAT-PROD-012 (immutable)
      - SKU mapping add/remove + BR-CAT-PROD-013 + BR-CAT-PROD-014
      - Attachment upload/delete + BR-CAT-PROD-015 (count/size/mime)
    Exit: unit test ≥ 14 green (bao gồm scale guard, immutability, SKU unique, attachment limit)
    └─► S3

S3  REST adapter — InternalProductController (additive)
    Entry: S2
    Hành động: GET V2-8; POST/PUT/DELETE V2-12..V2-14; POST/DELETE V2-16..V2-17; POST/DELETE V2-18..V2-19
    Exit: contract test green (happy path + error codes mỗi endpoint)
    └─► S4

S4  Integration test
    Entry: S3 + FEAT-CAT-PROD-CREATE endpoints stable
    Hành động: tenant isolation, RBAC 403 cho accountant (pending confirm), cross-aggregate immutability
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Aggregate query | domain/repository | Migration V20260624020000..060000 deployed | Repo test green | — |
| S2 | Service logic + BR enforcement | domain + app/service | S1 | Unit test ≥ 14 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + CREATE endpoints stable | Integ test green | S3 |

---

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-CMN-002` | CORNERSTONE | service | `app/service/InternalProductDetailService.java` (map audit fields) | AC-3 | `TC-BR-gf-inventory-CMN-002-*` |
| `BR-CAT-PROD-011 v15` | CORNERSTONE | domain model (scale) + service (rate) | `domain/model/InternalProductUomConversion.java::validateScale()` + `InternalProductDetailService.java` | AC-5 | `TC-BR-gf-inventory-PROD-011-*` |
| `BR-CAT-PROD-012` | CORNERSTONE | service (immutability check) | `app/service/InternalProductDetailService.java::checkConversionUnitImmutability()` | AC-5 | `TC-BR-gf-inventory-PROD-012-*` |
| `BR-CAT-PROD-013` | CORNERSTONE | repository (unique constraint) + service (pre-check) | `adapter/persistence/InternalProductSkuMappingJpaRepository.java` + `InternalProductDetailService.java` | AC-6 | `TC-BR-gf-inventory-PROD-013-*` |
| `BR-CAT-PROD-014` | NORMAL | service (DELETE mapping only) | `app/service/InternalProductDetailService.java::detachSku()` | AC-7 | `TC-BR-gf-inventory-PROD-014-*` |
| `BR-CAT-PROD-015` | NORMAL | service (count + mime + size) | `app/service/InternalProductDetailService.java::validateAttachment()` | AC-8 | `TC-BR-gf-inventory-PROD-015-*` |

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (happy + 404) | test-api | GET V2-8: found / not found / cross-tenant → 404 |
| AC-2 | API contract (field presence) | test-api | Verify mọi scalar field + materialGroupName; confirm không có brandDisplayName |
| AC-3 | API contract (audit fields) | test-api | 4 audit fields present + không null |
| AC-4 | API contract (child arrays) | test-api | Empty array `[]` vs populated; JOIN correctness (skuCode/skuName) |
| AC-5 | Unit (BR-011/012) + API contract | test-api | rate=0 → ERR-INV-013; scale=7 → ERR-INV-047; duplicate uomCode → ERR-INV-014; có giao dịch → 409 |
| AC-6 | API contract + integration | test-api | SKU đã gắn mã khác → ERR-INV-015; valid gắn → 201 |
| AC-7 | API contract | test-api | Delete mapping → 204; legacy `product` row không bị xóa |
| AC-8 | API contract (negative) | test-api | 6th file → ERR-CMN-004; > 10 MB → ERR-CMN-004; invalid mime → ERR-CMN-005 |
| AC-11 | Isolation (RBAC) | test-isolation | accountant gọi write endpoint → 403 (pending confirm permission matrix) |
| AC-10 | N/A (BE) | — | — |
| AC-12 | N/A (BE) | — | — |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | Wrap V2-8 → GraphQL `internalProduct(id)` query; enrich `mainUnitDisplayName` + `originDisplayName` từ gf-erp-mdm (read-only vs BE) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | Consume BFF GraphQL op; render 3 tabs (ĐVT/SKU/đính kèm); action buttons navigate sang FEAT-CAT-PROD-EDIT / FEAT-CAT-PROD-DELETE |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DETAIL.md` | DRAFT (pending) | View-only per AC-12; không render write action buttons |

**Source ID consistency** (item 18): tất cả tier file dùng `source_feat_sha = 1a6b2a272a5fa92488f6e6cf97fa3268d0f597460a777d80ea1b6188f00da67d`.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DETAIL.md`](../../../../../Product/features/FEAT-CAT-PROD-DETAIL.md) v10
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §V2-8, §V2-12..V2-19
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-009**: JPA no relationship mapping (scalar FK only)
- **ADR-017**: InternalProduct + MaterialGroup additive aggregates; migration sequence
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-PROD-DETAIL` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE (gf-inventory), §3 BE behaviour map 11 AC-IDs (8 active + 3 N/A), §4 ràng buộc + error code, §5 schema delta (REUSE — no new migration), §6 API contract V2-8 primary + V2-12..V2-19 child management (paths inferred — 3 NEED CONFIRMATION), §7 file map Hexagonal, §8 sequence DAG S1-S4, §9 BR SSOT, §10 test scope, §11 cross-tier pair. |
