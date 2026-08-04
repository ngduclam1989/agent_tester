---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-EDIT.md"
source_feat_id: "FEAT-CAT-PROD-EDIT"
source_feat_sha: "e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc"
source_feat_version: 10
source: "gen-execution-spec"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "agg-garage-graph"]
modifies: []
change_type: "new-capability"
demo_signature: "Garage-owner sửa tên/nhóm/xuất xứ mã SP nội bộ + quản lý ĐVT quy đổi/SKU/đính kèm; hệ thống khóa mã SP và ĐVT chính khi đã phát sinh giao dịch."
consumes_contracts:
  - "NEED CONFIRMATION: GET /api/v1/directories/UNIT?code={code} @ gf-erp-mdm (validate mainUnitCode)"
  - "NEED CONFIRMATION: GET /api/v1/directories/COUNTRY?code={code} @ gf-erp-mdm (validate originCode)"
paired_bff_feats: ["FEAT-CAT-PROD-EDIT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-EDIT"]
paired_mobile_feats: ["FEAT-CAT-PROD-EDIT"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EDIT.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-EDIT (BE): Chỉnh sửa mã sản phẩm nội bộ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0). Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EDIT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `agg-garage-graph` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Garage-owner sửa tên/nhóm/xuất xứ mã SP nội bộ; hệ thống khóa mã SP và ĐVT chính khi đã phát sinh giao dịch |
| Cross-tier pair | BFF: FEAT-CAT-PROD-EDIT \| Web: FEAT-CAT-PROD-EDIT \| Mobile: FEAT-CAT-PROD-EDIT |

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

## 2. Trách nhiệm backend (`gf-inventory`)

- Phục vụ `GET /api/v2/internal-products/{id}` (V2-8) trả đầy đủ scalar fields + sub-resources (`skuMappings[]`, `conversionUnits[]`, `attachments[]`) để client pre-populate form sửa.
- Tiếp nhận `PUT /api/v2/internal-products/{id}` (V2-11): enforce immutability matrix, validate `originCode` qua gf-erp-mdm, validate `materialGroupCode` ACTIVE, persist state change, ghi audit trail vào `internal_product_history`.
- Phục vụ sub-resource CRUD: ĐVT quy đổi V2-15/16/17 (validate rate/scale/uniqueness + immutability khi có giao dịch), SKU mapping V2-13/14 (enforce 1-SKU-1-product constraint), tệp đính kèm V2-18/19 (enforce ≤5 files/≤10MB/MIME whitelist).
- Enforce BR-CAT-PROD-004 (code bất biến), BR-CAT-PROD-006 (mainUnitCode bất biến khi đã có giao dịch), BR-CAT-PROD-010 (pricing_method luôn khoá) tại service/domain layer — BE là SSOT cho các BR này.
- Không publish Kafka event, không khởi Temporal workflow — EDIT là synchronous REST-only operation.
- Không cần Flyway migration mới: tất cả bảng đã tạo bởi FEAT-CAT-PROD-CREATE (V20260624020000–V20260624060000).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Đọc dữ liệu hiện tại

#### AC-1 → Phục vụ dữ liệu pre-populate cho form sửa

- **Khi**: BFF hoặc client gọi `GET /api/v2/internal-products/{id}` với JWT hợp lệ.
- **BE phải**: Trả `InternalProductDetailResponse` gồm scalar fields từ `internal_product` + sub-resources: `skuMappings[]` từ `internal_product_sku_mapping`, `conversionUnits[]` từ `internal_product_uom_conversion`, `attachments[]` từ `internal_product_attachment`, `materialGroupName` (join scalar). BFF enrich `mainUnitDisplayName` + `originDisplayName` từ gf-erp-mdm (không phải BE responsibility).
- **Output**: HTTP 200, `InternalProductDetailResponse`.
- **Failure mode**: product không tồn tại hoặc khác tenant → HTTP 404.
- **Ref**: BR-CAT-CMN-002, entity `internal_product` (§5.1), endpoint V2-8 (§6.1).

### Cluster B — Bất biến nghiệp vụ (Immutability enforcement)

#### AC-2 → Từ chối mọi thay đổi mã sản phẩm

- **Khi**: Client gửi `PUT /api/v2/internal-products/{id}` với `code` khác giá trị hiện tại trong DB.
- **BE phải**: Kiểm tra tại service layer — nếu `code` trong request body khác `internal_product.code` hiện tại → reject ngay, không tiến hành update. Nếu `code` omit trong body → skip check.
- **Output**: HTTP 400 + `ERR-INV-006`.
- **Failure mode**: Bất kỳ attempt đổi code nào đều từ chối; không phụ thuộc vào trạng thái giao dịch.
- **Ref**: BR-CAT-PROD-004 (CORNERSTONE), entity `internal_product.code` (§5.1).

#### AC-3 → Kiểm tra giao dịch tồn kho trước khi cho phép đổi ĐVT chính

- **Khi**: Client gửi `PUT /api/v2/internal-products/{id}` với `mainUnitCode` khác giá trị hiện tại.
- **BE phải**: Truy vấn bảng giao dịch tồn kho liên quan (NEED CONFIRMATION: tên bảng/cột xác nhận — có thể là `inventory_receipt_item`, `inventory_delivery_item`, hoặc bảng khác liên kết qua `internal_product_id`) để kiểm tra sản phẩm đã phát sinh giao dịch chưa. Nếu đã có → reject với NEED CONFIRMATION (error code cho BR-CAT-PROD-006 violation chưa được extract trong bundle). Nếu chưa có → validate `mainUnitCode` mới vs gf-erp-mdm `directory=UNIT`; invalid → `ERR-CMN-validation`; valid → cập nhật `main_unit_code`.
- **Output**: Có giao dịch → HTTP 422 + NEED CONFIRMATION error code. Chưa có + unitCode hợp lệ → HTTP 200.
- **Failure mode**: gf-erp-mdm không phản hồi → HTTP 502 propagate; không rollback state local đã kiểm tra.
- **Ref**: BR-CAT-PROD-006 (CORNERSTONE), entity `internal_product.main_unit_code` (§5.1).

#### AC-5 → Từ chối thay đổi phương pháp tính giá

- **Khi**: Client gửi `PUT /api/v2/internal-products/{id}` với `pricingMethod` trong body.
- **BE phải**: NEED CONFIRMATION (hành vi mong muốn — silently ignore field hay reject HTTP 400? BR-CAT-PROD-010 Phase 1 lock — bundle không chỉ rõ error code). Mặc định đề xuất: reject HTTP 400 + NEED CONFIRMATION error code để FE/client rõ ràng; tránh silent ignore gây confusion.
- **Output**: HTTP 400 + NEED CONFIRMATION error code.
- **Ref**: BR-CAT-PROD-010 (CORNERSTONE), entity `internal_product.pricing_method` (§5.1).

### Cluster C — Cập nhật thông tin sản phẩm

#### AC-4 → Persist các trường thông tin chung được phép sửa

- **Khi**: Client gửi `PUT /api/v2/internal-products/{id}` với payload hợp lệ (vượt qua Cluster B checks).
- **BE phải**: Validate rồi persist các trường được phép: `name` (required), `materialGroupCode` → lookup `material_group` cùng tenant phải tồn tại + ACTIVE (BR-CAT-PROD-009; fail → HTTP 422), `nature` ∈ `{GOODS, TOOL, SERVICE, OTHER}` (ERR-INV-012 nếu invalid), `brand` (free-text VARCHAR(255), không validate catalog — R18), `originCode` (validate vs gf-erp-mdm `directory=COUNTRY` ISO 3166-1 alpha-3 — R18; invalid → `ERR-CMN-validation` HTTP 422), `imageUrl` (opaque string; request value `null` → set `image_url = NULL`; previous S3 object KHÔNG auto-delete — gf-inventory không quản lý file lifecycle), `productSpec`, `technicalSpec`, `description` (≤500 chars — R26), `notes` (≤500 chars — R26). Sau persist thành công → INSERT vào `internal_product_history` trong cùng transaction (BR-CAT-CMN-001).
- **Output**: HTTP 200 + `InternalProductResponse` phản ánh state mới.
- **Failure mode**: Validation error → HTTP 400/422 với error code tương ứng; DB write failure → HTTP 500 + rollback.
- **Ref**: BR-CAT-PROD-008, BR-CAT-PROD-009, BR-CAT-PROD-019, BR-CAT-CMN-001, entity `internal_product` (§5.1).

#### AC-6 → Xử lý chuyển đổi trạng thái ACTIVE ↔ INACTIVE

- **Khi**: Client gửi `PUT /api/v2/internal-products/{id}` với `status` khác giá trị hiện tại.
- **BE phải**: Cho phép chuyển đổi ACTIVE ↔ INACTIVE. NEED CONFIRMATION: BR-CAT-PROD-025 có ràng buộc block nào không (vd từ chối INACTIVE nếu đang có giao dịch pending, hoặc có SKU mapping active)? Bundle không extract nội dung BR-CAT-PROD-025. Sau persist → ghi `internal_product_history` với action `STATUS_CHANGED`.
- **Output**: HTTP 200 + state mới; hoặc HTTP 422 + NEED CONFIRMATION error code nếu BR-CAT-PROD-025 có block condition.
- **Ref**: BR-CAT-PROD-025, BR-CAT-CMN-001, entity `internal_product.status` (§5.1).

#### AC-8 → Xác nhận persist thành công và trả response

- **Khi**: Tất cả validation trong Cluster B + Cluster C pass; DB write thành công.
- **BE phải**: Return HTTP 200 với `InternalProductResponse`. Persist `internal_product` + INSERT `internal_product_history` phải trong cùng 1 transaction (atomicity).
- **Output**: HTTP 200.
- **Failure mode**: Transaction fail → HTTP 500, rollback toàn bộ.
- **Ref**: BR-CAT-CMN-001, entity `internal_product` + `internal_product_history` (§5.1).

### Cluster D — Quản lý sub-resources

#### AC-7 → CRUD ĐVT quy đổi, SKU mapping, tệp đính kèm

**D1 — ĐVT quy đổi (V2-15, V2-16, V2-17)**

- **Thêm** (`POST /api/v2/internal-products/{id}/conversion-units`): Validate `conversionRate > 0` (ERR-INV-013); validate scale ≤6 chữ số thập phân ở app-layer trước khi save — DB NUMERIC(18,6) silently rounds nên app phải reject trước (ERR-INV-047 — R29, BR-CAT-PROD-011 v15); validate unique `(internal_product_id, uomId)` (ERR-INV-014). Persist → `internal_product_uom_conversion`.
- **Sửa rate** (`PUT /api/v2/internal-products/{id}/conversion-units/{uomId}`): Kiểm tra "has transactions" cho row này trước — nếu đã có → NEED CONFIRMATION error code (BR-CAT-PROD-012 violation); nếu chưa → validate rate/scale rồi persist.
- **Xóa** (`DELETE /api/v2/internal-products/{id}/conversion-units/{uomId}`): Kiểm tra "has transactions" — nếu đã có → NEED CONFIRMATION error code (BR-CAT-PROD-012); nếu chưa → hard DELETE row.
- **Ref**: BR-CAT-PROD-011 v15, BR-CAT-PROD-012, entity `internal_product_uom_conversion` (§5.1).

**D2 — SKU mapping (V2-13, V2-14)**

- **Thêm** (`POST /api/v2/internal-products/{id}/sku-mappings` body `{skuId}`): Validate `skuId` tồn tại trong bảng `product` (scalar FK lookup — ADR-009: không JPA relationship). Enforce unique `(tenant_id, sku_id)` trên toàn bộ bảng `internal_product_sku_mapping` — 1 SKU thuộc tối đa 1 mã nội bộ (ERR-INV-015). Persist row mới.
- **Xóa** (`DELETE /api/v2/internal-products/{id}/sku-mappings/{skuId}`): Hard DELETE mapping row; TUYỆT ĐỐI KHÔNG xóa bản ghi SKU gốc trong bảng `product` (BR-CAT-PROD-014).
- **Ref**: BR-CAT-PROD-013, BR-CAT-PROD-014, entity `internal_product_sku_mapping` (§5.1).

**D3 — Tệp đính kèm (V2-18, V2-19)**

- **Thêm** (`POST /api/v2/internal-products/{id}/attachments` body `{fileUrl, fileName, fileSize, mimeType, attachmentKind}`): Client đã upload lên ct-file-storage trước và truyền `fileUrl` (object key). Validate: `COUNT(attachments WHERE internal_product_id = id AND tenant_id = t) < 5` (BR-CAT-PROD-015 — NEED CONFIRMATION error code khi vượt ≤5 limit); `fileSize ≤ 10MB` (ERR-CMN-004); `mimeType ∈ {application/pdf, image/jpeg, image/png}` (ERR-CMN-005). Persist → `internal_product_attachment`.
- **Xóa** (`DELETE /api/v2/internal-products/{id}/attachments/{attachmentId}`): Hard DELETE row; KHÔNG gọi ct-file-storage để xóa object (gf-inventory không quản lý file storage lifecycle).
- **Ref**: BR-CAT-PROD-015, entity `internal_product_attachment` (§5.1).

### Cluster E — Phân quyền

#### AC-9 → N/A (UI-only cancel)

- Client bấm Huỷ bỏ trên form sửa — không có BE endpoint call nào. BE không cần xử lý. Xem `fe-web/FEAT-CAT-PROD-EDIT.md §3 AC-9` + `mobile/FEAT-CAT-PROD-EDIT.md §3 AC-9`.

#### AC-10 → Enforce phân quyền sửa mã sản phẩm

- **Khi**: Mọi request đến V2-11, V2-13, V2-14, V2-15, V2-16, V2-17, V2-18, V2-19.
- **BE phải**: Verify JWT role/permission — NEED CONFIRMATION: permission name cụ thể (`INTERNAL_PRODUCT_EDIT` hay tương đương) cần xác nhận từ KG/BR-GF-INVENTORY-CATALOG. Dựa trên BR-GF-INVENTORY-CATALOG và Critical Rule #6 (dual persona only): chỉ `garage-owner` có quyền mutate. `accountant` chỉ read. Role không đủ → HTTP 403.
- **Output**: HTTP 403 nếu thiếu role.
- **Ref**: BR-GF-INVENTORY-CATALOG, Critical Rule #6.

## 4. Ràng buộc & rule cần enforce

### 4.1 Immutability matrix

| Trường | Bất biến | Điều kiện | Error code | BR ref |
|---|---|---|---|---|
| `internal_product.code` | Luôn luôn | — | `ERR-INV-006` | BR-CAT-PROD-004 (CORNERSTONE) |
| `internal_product.main_unit_code` | Có điều kiện | Có giao dịch tồn kho liên quan | NEED CONFIRMATION | BR-CAT-PROD-006 (CORNERSTONE) |
| `internal_product.pricing_method` | Luôn luôn (Phase 1) | — | NEED CONFIRMATION | BR-CAT-PROD-010 (CORNERSTONE) |
| `internal_product_uom_conversion.uom_id` | Có điều kiện (delete/edit row) | Row liên quan có giao dịch tồn kho | NEED CONFIRMATION | BR-CAT-PROD-012 |
| `internal_product_sku_mapping.sku_id` | Không bất biến | — | — | BR-CAT-PROD-013/014 |
| `internal_product_attachment.file_url` | Không bất biến | — | — | BR-CAT-PROD-015 |

### 4.2 Business rule SSOT (BE primary)

- **BR-CAT-PROD-004** (CORNERSTONE): `code` bất biến — enforce tại `InternalProductService::update()`. Vi phạm → `ERR-INV-006` HTTP 400.
- **BR-CAT-PROD-006** (CORNERSTONE): `main_unit_code` bất biến khi sản phẩm đã có giao dịch tồn kho — enforce tại service layer, truy vấn transaction tables trước khi cho phép cập nhật.
- **BR-CAT-PROD-008**: Whitelist trường được phép sửa — enforce qua `UpdateInternalProductRequest` DTO (ignore fields ngoài whitelist).
- **BR-CAT-PROD-009**: `materialGroupCode` phải ACTIVE — enforce tại service layer, query `material_group WHERE code = :code AND tenant_id = :t AND status = ACTIVE`. Fail → HTTP 422.
- **BR-CAT-PROD-010** (CORNERSTONE): `pricing_method` luôn khoá Phase 1 — reject hoặc ignore field trong PUT body (xem NEED CONFIRMATION §3 AC-5).
- **BR-CAT-PROD-011 v15**: `conversionRate > 0` (ERR-INV-013) + app-layer scale ≤6 chữ số thập phân (ERR-INV-047); validate trước save vì DB NUMERIC(18,6) silently rounds.
- **BR-CAT-PROD-012**: `internal_product_uom_conversion` immutable khi row đã liên quan giao dịch — enforce trước DELETE/PUT trên V2-16/V2-17.
- **BR-CAT-PROD-013**: Unique `(tenant_id, sku_id)` trong `internal_product_sku_mapping` — 1 SKU thuộc tối đa 1 mã nội bộ; guard bằng DB constraint + service layer (ERR-INV-015 HTTP 409).
- **BR-CAT-PROD-014**: Xóa SKU mapping chỉ hard DELETE row trong `internal_product_sku_mapping`; KHÔNG động chạm bảng `product`.
- **BR-CAT-PROD-015**: Tổng attachment ≤5/product; `fileSize ≤ 10MB` (ERR-CMN-004); `mimeType` whitelist (ERR-CMN-005) — enforce tại service layer trước INSERT `internal_product_attachment`.
- **BR-CAT-PROD-019**: `nature` enum validation `{GOODS, TOOL, SERVICE, OTHER}` (ERR-INV-012) — enforce qua `@Valid` annotation trên DTO.
- **BR-CAT-PROD-023**: NEED CONFIRMATION — nội dung rule chưa được extract trong bundle.
- **BR-CAT-PROD-025**: NEED CONFIRMATION — nội dung rule về giới hạn chuyển trạng thái chưa được extract.
- **BR-CAT-CMN-001**: Mọi thao tác mutate → INSERT `internal_product_history` cùng transaction với thay đổi chính.

### 4.3 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; tenant context resolve từ JWT claim `custom:tenant_id`.
- Tất cả query WHERE `tenant_id = :currentTenantId`. Cross-tenant access → 404 (không expose existence).
- V2-11, V2-13÷V2-19 yêu cầu JWT authenticated + role `garage-owner` (AC-10).
- V2-8 (read): authenticated (NEED CONFIRMATION: `accountant` có quyền read không?).

### 4.4 Idempotency + concurrency

- `PUT` V2-11: retry-safe — same payload + same state → same result, không tạo duplicate history nếu không có thay đổi thực (detect via field comparison trước INSERT history).
- `POST` V2-13 (SKU mapping): unique constraint `(tenant_id, sku_id)` guard duplicate insert → HTTP 409 + ERR-INV-015.
- `POST` V2-15 (conversion unit): unique constraint `(internal_product_id, uom_id)` guard → HTTP 409 + ERR-INV-014.
- `DELETE` V2-14/17/19: idempotent — xóa row không tồn tại → HTTP 404 (không phải 500).

### 4.5 Cross-boundary validation

- Validate `originCode` vs gf-erp-mdm `directory=COUNTRY` (NEED CONFIRMATION: API path exact) — invalid → `ERR-CMN-validation` HTTP 422.
- Validate `mainUnitCode` (khi được phép thay đổi) vs gf-erp-mdm `directory=UNIT` (NEED CONFIRMATION: API path exact) — invalid → `ERR-CMN-validation` HTTP 422.
- gf-erp-mdm timeout/502 → propagate HTTP 502; không rollback state gf-inventory đã validate.

### 4.6 Error code mapping

| Error | HTTP | Trigger | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-006` | 400 | code thay đổi attempt (AC-2) | TOAST |
| NEED CONFIRMATION | 422 | mainUnitCode changed nhưng has transactions (AC-3) | TOAST |
| `ERR-CMN-validation` | 422 | originCode / mainUnitCode không tồn tại trong gf-erp-mdm (AC-3/AC-4) | INLINE |
| `ERR-INV-012` | 400 | nature enum value không hợp lệ (AC-4) | INLINE |
| NEED CONFIRMATION | 400 | pricing_method change attempt (AC-5) | TOAST |
| NEED CONFIRMATION | 422 | status change bị block bởi BR-CAT-PROD-025 (AC-6) | TOAST |
| `ERR-INV-013` | 400 | conversionRate ≤ 0 (AC-7 D1) | INLINE |
| `ERR-INV-047` | 400 | conversionRate scale > 6 chữ số thập phân (AC-7 D1) | INLINE |
| `ERR-INV-014` | 409 | duplicate uomId trong conversion-units cùng product (AC-7 D1) | TOAST |
| NEED CONFIRMATION | 422 | conversion unit delete/edit khi has transactions (AC-7 D1, BR-CAT-PROD-012) | TOAST |
| `ERR-INV-015` | 409 | SKU đã thuộc mã nội bộ khác (AC-7 D2) | TOAST |
| `ERR-CMN-004` | 400 | attachment fileSize > 10MB (AC-7 D3) | INLINE |
| `ERR-CMN-005` | 400 | attachment MIME type không hợp lệ (AC-7 D3) | INLINE |
| NEED CONFIRMATION | 400 | attachment count ≥ 5 (AC-7 D3, BR-CAT-PROD-015) | TOAST |
| HTTP 403 | 403 | thiếu role garage-owner (AC-10) | TOAST |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> Không có migration mới: tất cả bảng đã được tạo bởi FEAT-CAT-PROD-CREATE (Flyway V20260624020000–V20260624060000 theo ADR-017). FEAT-CAT-PROD-EDIT chỉ thêm service/controller logic trên schema hiện có.

| Entity | Column | Type | Nullable | Default | Migration | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `internal_product` | `name` | `VARCHAR(255)` | N | — | V20260624020000 (existing) | BR-CAT-PROD-008 | AC-4 | Mutable field |
| `internal_product` | `material_group_id` | `UUID` | Y | NULL | Existing | BR-CAT-PROD-009 | AC-4 | Scalar FK → `material_group.id` (ADR-009) |
| `internal_product` | `status` | `ENUM(ACTIVE,INACTIVE)` | N | ACTIVE | Existing | BR-CAT-PROD-025 | AC-6 | Mutable; giới hạn per BR-CAT-PROD-025 (NEED CONFIRMATION) |
| `internal_product` | `main_unit_code` | `VARCHAR(20)` | N | — | Existing | BR-CAT-PROD-006 | AC-3 | Bất biến khi has transactions |
| `internal_product` | `pricing_method` | `ENUM(PWA)` | N | PWA | Existing | BR-CAT-PROD-010 | AC-5 | Always locked Phase 1 |
| `internal_product` | `nature` | `ENUM(GOODS,TOOL,SERVICE,OTHER)` | N | GOODS | Existing | BR-CAT-PROD-019 | AC-4 | Mutable |
| `internal_product` | `brand` | `VARCHAR(255)` | Y | NULL | Existing | — | AC-4 | Free-text, không validate catalog (R18) |
| `internal_product` | `origin_code` | `VARCHAR(20)` | Y | NULL | Existing | — | AC-4 | Codified ISO 3166-1 alpha-3; validate vs gf-erp-mdm (R18) |
| `internal_product` | `image_url` | `VARCHAR(500)` | Y | NULL | Existing | — | AC-4 | Opaque string; clear-by-null (null → set NULL); no S3 auto-delete |
| `internal_product` | `description` | `VARCHAR(500)` | Y | NULL | Existing | — | AC-4 | R26: ≤500 chars |
| `internal_product` | `notes` | `VARCHAR(500)` | Y | NULL | Existing | — | AC-4 | R26: ≤500 chars (down từ 1000) |
| `internal_product_uom_conversion` | `conversion_rate` | `NUMERIC(18,6)` | N | — | V20260624030000 (existing) | BR-CAT-PROD-011 v15 | AC-7 D1 | Rate > 0; app-layer scale guard ≤6 dec → ERR-INV-047 |
| `internal_product_sku_mapping` | `sku_id` | `BIGINT` | N | — | V20260624040000 (existing) | BR-CAT-PROD-013 | AC-7 D2 | Scalar FK → `product.id`; unique `(tenant_id, sku_id)` |
| `internal_product_attachment` | `file_url` | `VARCHAR(500)` | N | — | V20260624050000 (existing) | BR-CAT-PROD-015 | AC-7 D3 | ct-file-storage object key; no auto-delete on row remove |
| `internal_product_history` | `action` | `VARCHAR(100)` | N | — | V20260624060000 (existing) | BR-CAT-CMN-001 | AC-8 | Audit record per mutate operation |

### 5.2 Index / constraint changes

> Không có index/constraint mới — tất cả đã được tạo trong CREATE migrations. Bảng dưới là tham chiếu cho enforcement.

| Table | Constraint name | Columns | Type | Purpose |
|---|---|---|---|---|
| `internal_product_sku_mapping` | `uq_sku_mapping_tenant_sku` | `(tenant_id, sku_id)` | UNIQUE | 1 SKU → max 1 mã nội bộ (BR-CAT-PROD-013, ERR-INV-015) |
| `internal_product_uom_conversion` | `uq_uom_conv_product_uom` | `(internal_product_id, uom_id)` | UNIQUE | Không trùng ĐVT cho cùng product (ERR-INV-014) |
| `internal_product` | `uq_product_tenant_code` | `(tenant_id, code)` | UNIQUE | ERR-INV-007 (guard duplicate CREATE, không liên quan EDIT vì code immutable) |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 Endpoints phục vụ FEAT-CAT-PROD-EDIT

> Các endpoint này được define đầy đủ tại `Architecture/api/gf-inventory-api.md` §4. PKG §2.2.1 index tại V2-8, V2-11, V2-13÷V2-19. FEAT-CAT-PROD-EDIT không thêm endpoint mới ngoài danh mục này.

| # | Method | Path | Auth | Request | Response | Idempotency | AC ref |
|---|---|---|---|---|---|---|---|
| V2-8 | `GET` | `/api/v2/internal-products/{id}` | JWT | — | `InternalProductDetailResponse` | safe (read) | AC-1 |
| V2-11 | `PUT` | `/api/v2/internal-products/{id}` | JWT | `UpdateInternalProductRequest` | `InternalProductResponse` | retry-safe (same data) | AC-2/3/4/5/6/8 |
| V2-13 | `POST` | `/api/v2/internal-products/{id}/sku-mappings` | JWT | `{skuId: Long}` | `SkuMappingResponse` | client idempotency-key | AC-7 D2 |
| V2-14 | `DELETE` | `/api/v2/internal-products/{id}/sku-mappings/{skuId}` | JWT | — | HTTP 204 | idempotent | AC-7 D2 |
| V2-15 | `POST` | `/api/v2/internal-products/{id}/conversion-units` | JWT | `{uomId, conversionRate}` | `ConversionUnitResponse` | client idempotency-key | AC-7 D1 |
| V2-16 | `PUT` | `/api/v2/internal-products/{id}/conversion-units/{uomId}` | JWT | `{conversionRate}` | `ConversionUnitResponse` | retry-safe | AC-7 D1 |
| V2-17 | `DELETE` | `/api/v2/internal-products/{id}/conversion-units/{uomId}` | JWT | — | HTTP 204 | idempotent | AC-7 D1 |
| V2-18 | `POST` | `/api/v2/internal-products/{id}/attachments` | JWT | `{fileUrl, fileName, fileSize, mimeType, attachmentKind}` | `AttachmentResponse` | client idempotency-key | AC-7 D3 |
| V2-19 | `DELETE` | `/api/v2/internal-products/{id}/attachments/{attachmentId}` | JWT | — | HTTP 204 | idempotent | AC-7 D3 |

### 6.2 Modified REST endpoints (additive)

> Không có thay đổi additive với endpoints hiện hữu — tất cả V2-11 và V2-13÷V2-19 là implement lần đầu cho EDIT feature.

### 6.3 Kafka topics

> FEAT-CAT-PROD-EDIT không publish / consume Kafka event — operation synchronous REST-only.

### 6.4 Cross-boundary REST consumers

| Endpoint consumed | Boundary nguồn | When | Failure mode | Retry policy |
|---|---|---|---|---|
| NEED CONFIRMATION: `GET /api/v1/directories/UNIT?code={mainUnitCode}` | `gf-erp-mdm` | V2-11 khi `mainUnitCode` request khác current + chưa có giao dịch | HTTP 502 propagate; không rollback gf-inventory | sync, fail fast |
| NEED CONFIRMATION: `GET /api/v1/directories/COUNTRY?code={originCode}` | `gf-erp-mdm` | V2-11 khi `originCode` present trong body | HTTP 502 propagate | sync, fail fast |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-PROD-EDIT.md`) wrap V2-11 + V2-13÷V2-19 thành GraphQL mutations. BFF cũng enrich response với `mainUnitDisplayName` / `originDisplayName` từ gf-erp-mdm (sau khi BE return). KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (Critical Rule #1, boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InternalProduct.java` | MODIFY | Extend `update()` method với whitelist fields + immutability check | ~35 | AC-2/3/4/5/6 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InternalProductUomConversion.java` | MODIFY | Validate rate/scale + "has transactions" guard | ~25 | AC-7 D1 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductRepository.java` | ADDITIVE | Thêm `existsTransactionByInternalProductId()` hoặc tương đương (NEED CONFIRMATION: method name) | ~15 | AC-3/AC-7 D1 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductAttachmentRepository.java` | ADDITIVE | Thêm `countByTenantIdAndInternalProductId()` | ~8 | AC-7 D3 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/InternalProductService.java` | MODIFY | `update()`, `addConversionUnit()`, `updateConversionUnitRate()`, `deleteConversionUnit()`, `addSkuMapping()`, `deleteSkuMapping()`, `addAttachment()`, `deleteAttachment()` | ~220 | AC-2÷AC-8 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/InternalProductHistoryService.java` | ADDITIVE / REUSE | `recordEdit()`, `recordStatusChange()`, `recordSubResourceChange()` | ~55 | AC-8 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/UpdateInternalProductRequest.java` | NEW | Request DTO with `@Valid` — whitelist fields, validation annotations | ~65 | AC-4 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/AddConversionUnitRequest.java` | NEW | `{uomId, conversionRate}` + `@Valid` | ~20 | AC-7 D1 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/UpdateConversionUnitRequest.java` | NEW | `{conversionRate}` + `@Valid` | ~15 | AC-7 D1 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/AddSkuMappingRequest.java` | NEW | `{skuId}` + `@NotNull` | ~12 | AC-7 D2 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/AddAttachmentRequest.java` | NEW | `{fileUrl, fileName, fileSize, mimeType, attachmentKind}` + `@Valid` | ~30 | AC-7 D3 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/InternalProductController.java` | MODIFY | Thêm handler cho PUT V2-11 + POST/DELETE V2-13÷V2-19 | ~130 | AC-1÷AC-10 |
| `adapter/client` | `services/gf-inventory/src/main/java/.../adapter/client/ErpMdmClient.java` | ADDITIVE / REUSE | Reuse nếu đã có từ FEAT-CAT-PROD-CREATE; thêm `validateCountryCode()` nếu chưa | ~30 | AC-3/AC-4 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/InternalProductServiceEditTest.java` | NEW | Unit tests BR enforcement (immutability matrix, rate scale, sub-resource rules) | ~220 | AC-2÷AC-8 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/InternalProductEditContractTest.java` | NEW | Contract tests per endpoint (V2-11 + V2-13÷V2-19) | ~160 | AC-1÷AC-10 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Service + domain logic (immutability checks, BR enforcement, sub-resource validation)
    Entry: Schema đã có từ FEAT-CAT-PROD-CREATE migrations (V20260624020000+)
    Exit: Unit test ≥ 10 green (BR-CAT-PROD-004/006/010 + scale ERR-INV-047 + sub-resource rules)
    └─► S2

S2  REST adapter (controller — PUT V2-11 + POST/DELETE V2-13÷V2-19)
    Entry: S1 service stable
    Exit: Contract test green cho toàn bộ 9 endpoints
    └─► S3

S3  Cross-boundary integration (gf-erp-mdm validate originCode / mainUnitCode)
    Entry: S2; gf-erp-mdm client stub available (hoặc reuse từ FEAT-CAT-PROD-CREATE S3)
    Exit: Integration test green — valid/invalid code + 502 fallback path
    └─► S4

S4  E2E integration test (full edit flow + audit trail)
    Entry: S3; FEAT-CAT-PROD-CREATE endpoint V2-10 stable (seed data)
    Exit: Integ test green — create → edit → GET V2-8 phản ánh state mới + history INSERT
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Service + domain | `domain` + `app/service` + `app/dto` | Schema existing | Unit test ≥10 green | — |
| S2 | REST controller | `adapter/controller` | S1 | Contract test green | S1 |
| S3 | gf-erp-mdm client | `adapter/client` | S2 | Integration test green | S2 |
| S4 | E2E integration | `test/integration` | S3 + seed data via V2-10 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC |
|---|---|---|---|---|
| `BR-CAT-PROD-004` | CORNERSTONE | domain (primary) | `domain/model/InternalProduct.java::assertCodeImmutable()` + service | AC-2 |
| `BR-CAT-PROD-006` | CORNERSTONE | service (primary) | `app/service/InternalProductService.java::update()` — has-transactions guard | AC-3 |
| `BR-CAT-PROD-008` | NORMAL | DTO validation (secondary) + service | `app/dto/UpdateInternalProductRequest.java` (whitelist) | AC-4 |
| `BR-CAT-PROD-009` | NORMAL | service | `app/service/InternalProductService.java` — materialGroup ACTIVE check | AC-4 |
| `BR-CAT-PROD-010` | CORNERSTONE | service | `app/service/InternalProductService.java::update()` — pricingMethod field gate | AC-5 |
| `BR-CAT-PROD-011 v15` | NORMAL | service (app-layer scale) + DTO | `app/service/InternalProductService.java::addConversionUnit()` + `UpdateConversionUnitRequest` | AC-7 D1 |
| `BR-CAT-PROD-012` | CORNERSTONE | service | `app/service/InternalProductService.java::deleteConversionUnit()` + `updateConversionUnitRate()` | AC-7 D1 |
| `BR-CAT-PROD-013` | NORMAL | DB constraint (primary) + service | `adapter/persistence` unique constraint; `InternalProductService::addSkuMapping()` | AC-7 D2 |
| `BR-CAT-PROD-014` | NORMAL | service | `app/service/InternalProductService.java::deleteSkuMapping()` | AC-7 D2 |
| `BR-CAT-PROD-015` | NORMAL | service (count + size + mime) | `app/service/InternalProductService.java::addAttachment()` | AC-7 D3 |
| `BR-CAT-PROD-019` | NORMAL | DTO validation | `app/dto/UpdateInternalProductRequest.java` — `@Valid` enum | AC-4 |
| `BR-CAT-PROD-023` | NORMAL | service | NEED CONFIRMATION — rule content không có trong bundle | — |
| `BR-CAT-PROD-025` | NORMAL | service | NEED CONFIRMATION — rule content về status change restriction không có trong bundle | AC-6 |
| `BR-CAT-CMN-001` | NORMAL | service (audit) | `app/service/InternalProductHistoryService.java` | AC-8 |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (read) | test-api | V2-8 response shape đầy đủ + tenant isolation (cross-tenant → 404) |
| AC-2 | Unit (immutability) | test-api | Attempt code change → HTTP 400 ERR-INV-006 |
| AC-3 | Unit (conditional immutability) | test-api | mainUnitCode: no txn → allow + validate; has txn → reject |
| AC-4 | Unit (validation) + API contract | test-api | originCode invalid → ERR-CMN-validation; materialGroup INACTIVE → 422 |
| AC-5 | Unit (immutability) | test-api | pricingMethod field → reject/ignore per confirmed behaviour |
| AC-6 | Unit (status transition) | test-api | ACTIVE ↔ INACTIVE; BR-CAT-PROD-025 block condition khi confirmed |
| AC-7 | API contract (sub-resource) + unit | test-api | D1: rate/scale validation + duplicate uomId; D2: duplicate SKU → ERR-INV-015; D3: count/size/mime |
| AC-8 | Integration (audit trail) | test-api | PUT V2-11 → history INSERT trong same transaction → GET V2-8 reflect new state |
| AC-9 | N/A — UI-only cancel | — | Không có BE test cần thiết |
| AC-10 | Isolation (RBAC) | test-isolation | Non garage-owner → HTTP 403 trên V2-11 và V2-13÷V2-19 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | BFF wrap V2-11 + V2-13÷V2-19 thành GraphQL mutations; enrich `mainUnitDisplayName` / `originDisplayName` từ gf-erp-mdm |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | FE consume BFF GraphQL mutations; render immutability feedback (AC-2/3/5) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-EDIT.md` | DRAFT (pending) | Flutter consume BFF GraphQL mutations; same immutability display logic |

**Source ID consistency** (item #18): tất cả tier file có cùng `source_feat_sha = e4531a39c8012b1c1c166f8490890d8f31fb7e9c7683282bfc6438e0a142b6dc`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EDIT.md`](../../../../../Product/features/FEAT-CAT-PROD-EDIT.md) v10
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md) · [`BR-GF-INVENTORY-DELIVERY-V2.md`](../../business-rules/BR-GF-INVENTORY-DELIVERY-V2.md) · [`BR-GF-INVENTORY-RECEIPT-V2.md`](../../business-rules/BR-GF-INVENTORY-RECEIPT-V2.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 (V2-8, V2-11, V2-13÷V2-19)
- **Integration**: [`Architecture/integrations/INTEG-BFF-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-BFF-gf-inventory.md)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-009**: No JPA relationship mapping (scalar FK only)
- **ADR-017**: Additive aggregates — `InternalProduct` + `MaterialGroup` entities mới trong gf-inventory

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho FEAT-CAT-PROD-EDIT W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 BE behaviour map (10/10 AC covered), §4 immutability matrix + ràng buộc + error code mapping, §5 schema (no new migration — tables from CREATE), §6 REST (V2-8/11/13÷19) + cross-boundary, §7 file map Hexagonal, §8 DAG S1→S4, §9 BR SSOT, §10 test scope, §11 cross-tier. 9 NEED CONFIRMATION markers cần BA/Architecture Authority confirm. |
