---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-CREATE.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-CREATE"
source_feat_sha: "ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "gf-erp-mdm"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage tạo mã SP nội bộ (code unique, mainUnitCode hợp lệ), gắn SKU + ĐVT quy đổi → HTTP 201 trả về id"
consumes_contracts:
  - "GET /protected/v1/directory-items?directory=UNIT (gf-erp-mdm — validate mainUnitCode)"
  - "GET /protected/v1/directory-items?directory=COUNTRY (gf-erp-mdm — validate originCode)"
paired_bff_feats: ["FEAT-CAT-PROD-CREATE"]
paired_fe_web_feats: ["FEAT-CAT-PROD-CREATE"]
paired_mobile_feats: ["FEAT-CAT-PROD-CREATE"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-CREATE.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-CREATE (BE): Tạo mã sản phẩm nội bộ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `gf-erp-mdm` (consumer) |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage tạo mã SP nội bộ (code unique, mainUnitCode hợp lệ), gắn SKU + ĐVT quy đổi → HTTP 201 trả về id |
| Cross-tier pair | BFF: FEAT-CAT-PROD-CREATE \| Web: FEAT-CAT-PROD-CREATE \| Mobile: FEAT-CAT-PROD-CREATE |

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

## 2. Trách nhiệm backend (gf-inventory)

- Deploy schema Flyway additive (V20260624020000..V20260624060000): tạo `internal_product`, `internal_product_uom_conversion`, `internal_product_sku_mapping`, `internal_product_attachment`, `internal_product_history` trong schema `dev_gf_inventory`.
- Expose REST endpoint `POST /api/v2/internal-products` (V2-10): nhận payload, validate toàn bộ fields, persist product + conversion units + SKU mappings trong một ACID transaction.
- Enforce BR-CAT-PROD primary tại domain + service layer: code format/uniqueness, nature enum, pricing_method locked=PWA, conversion rate > 0 và precision ≤ 6 scale, SKU 1-to-1 constraint.
- Validate cross-boundary trước save: `mainUnitCode` vs gf-erp-mdm `directory=UNIT`; `originCode` vs gf-erp-mdm `directory=COUNTRY` (ISO 3166-1 alpha-3).
- Ghi audit record vào `internal_product_history` (action=CREATE) trong cùng transaction (BR-CAT-CMN-001).
- Trả 201 Created với payload đủ để BFF/FE render confirmation; lỗi validation trả 400/409 với error code chuẩn.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Phân quyền

#### AC-1 → N/A (UI-only — điều hướng mở form tạo)

Source AC này thuộc tier fe-web / mobile (navigate to create form). BE không touch. Xem `fe-web/FEAT-CAT-PROD-CREATE.md §3 AC-1`.

#### AC-16 → N/A (UI-only — hủy bỏ form)

Source AC này thuộc tier fe-web / mobile (cancel / discard state). BE không touch. Xem `fe-web/FEAT-CAT-PROD-CREATE.md §3 AC-16`.

#### AC-17 → Kiểm tra phân quyền tạo mã SP nội bộ

- **Khi**: client gửi `POST /api/v2/internal-products` với JWT.
- **BE phải**: resolve JWT claim `custom:tenant_id` qua TenantFilter → xác nhận role ∈ {`garage-owner`, `accountant`} và tenant hợp lệ. Thiếu token hoặc role sai → reject trước khi xử lý business logic.
- **Output**: 401 nếu token invalid; 403 nếu role không được phép.
- **Failure mode**: không leak thông tin tenant khi unauthorized.
- **Ref**: Critical Rule #4 (tenant isolation) + #6 (dual persona only); endpoint V2-10 (§6.1).

### Cluster B — Nhập & validate thông tin chính

#### AC-2 → Validate và lưu mã sản phẩm nội bộ

- **Khi**: nhận body field `code` (required).
- **BE phải**: (a) validate code không chứa ký tự `~!@#$%^&*` (BR-CAT-PROD-001 → ERR-INV-006 + 400); (b) check unique `(tenant_id, code)` — duplicate → ERR-INV-007 + 409 (BR-CAT-PROD-002); (c) persist `code VARCHAR(50)` vào `internal_product`.
- **Output**: code stored as-is (case-sensitive); 400/409 với error code nếu fail.
- **Failure mode**: ERR-INV-006 (format), ERR-INV-007 (conflict).
- **Ref**: BR-CAT-PROD-001, BR-CAT-PROD-002; entity `internal_product` (§5.1); endpoint V2-10 (§6.1).

#### AC-3 → Validate và lưu tên sản phẩm

- **Khi**: nhận body field `name` (required).
- **BE phải**: validate name non-null, non-empty; persist `name VARCHAR(255)` vào `internal_product`.
- **Output**: 400 + ERR-CMN-validation nếu name rỗng hoặc null.
- **Failure mode**: ERR-CMN-validation generic.
- **Ref**: BR-CAT-PROD-005; entity `internal_product.name` (§5.1).

#### AC-4 → Validate và lưu tính chất sản phẩm

- **Khi**: nhận body field `nature` (optional, default `GOODS`).
- **BE phải**: validate nature ∈ {`GOODS`, `TOOL`, `SERVICE`, `OTHER`} (BR-CAT-PROD-019); nếu absent → default `GOODS`; persist enum `nature` vào `internal_product`.
- **Output**: 400 + ERR-INV-012 nếu nature value không hợp lệ.
- **Failure mode**: ERR-INV-012.
- **Ref**: BR-CAT-PROD-019; entity `internal_product.nature` (§5.1); endpoint V2-10 (§6.1).

#### AC-5 → Validate và resolve nhóm vật tư

- **Khi**: nhận body field `materialGroupCode` (optional).
- **BE phải**: nếu có `materialGroupCode` → query `material_group WHERE code = materialGroupCode AND tenant_id = currentTenant AND status = ACTIVE`; not found hoặc INACTIVE → 400 + ERR-CMN-validation. Resolve `material_group_id (UUID)` → persist scalar FK vào `internal_product.material_group_id`.
- **Output**: 400 + ERR-CMN-validation ("Nhóm vật tư không tồn tại hoặc không hoạt động") nếu fail.
- **Failure mode**: ERR-CMN-validation.
- **Ref**: BR-CAT-PROD-009; entity `internal_product.material_group_id` (§5.1); endpoint V2-10 (§6.1).

#### AC-6 → Validate đơn vị tính chính qua gf-erp-mdm

- **Khi**: nhận body field `mainUnitCode` (required).
- **BE phải**: gọi gf-erp-mdm `GET /protected/v1/directory-items?directory=UNIT&code={mainUnitCode}` (x-api-key auth); not found → 400 + ERR-CMN-validation ("Đơn vị tính không tồn tại"). Persist `main_unit_code VARCHAR(20)`.
- **Output**: 400 + ERR-CMN-validation nếu mainUnitCode không tồn tại trong UNIT directory.
- **Failure mode**: gf-erp-mdm down → propagate 502 (fail-fast, không cache cross-boundary).
- **Ref**: BR-CAT-PROD-005, BR-CAT-PROD-006 (immutability ở UPDATE); cross-boundary `ErpMdmDirectoryClient` (§6.4).

#### AC-7 → Khởi tạo trạng thái ACTIVE

- **Khi**: tạo mới product qua V2-10.
- **BE phải**: luôn set `status = ACTIVE` bất kể body. Client không được override tại create. Persist enum `status` vào `internal_product`.
- **Output**: `status: ACTIVE` trong response 201.
- **Failure mode**: N/A (forced default).
- **Ref**: entity `internal_product.status` (§5.1).

#### AC-8 → Lưu các trường thông tin bổ sung

- **Khi**: nhận body fields `brand?`, `originCode?`, `productSpec?`, `technicalSpec?`, `description?`, `notes?`.
- **BE phải**:
  - `brand`: persist free-text `VARCHAR(255)` — KHÔNG validate catalog (R18 revert R8-D-C).
  - `originCode`: nếu có → validate vs gf-erp-mdm `directory=COUNTRY` ISO 3166-1 alpha-3; invalid → 400 + `ERR-CMN-validation` ("Mã quốc gia xuất xứ không tồn tại") (R28). Persist `origin_code VARCHAR(20)`.
  - `productSpec`, `technicalSpec`: persist text nullable.
  - `description`: persist `VARCHAR(500)` nullable.
  - `notes`: persist `VARCHAR(500)` nullable (R26 — max 500, bỏ 1000 cũ).
- **Output**: 400 + ERR-CMN-validation nếu originCode invalid.
- **Failure mode**: gf-erp-mdm down khi validate originCode → 502 fail-fast.
- **Ref**: entity `internal_product` brand/origin_code columns (§5.1); cross-boundary `ErpMdmDirectoryClient` (§6.4).

#### AC-9 → Phương pháp tính giá mặc định PWA (locked)

- **Khi**: tạo mới product.
- **BE phải**: luôn set `pricing_method = PWA` (BR-CAT-PROD-010, R13). Body field `pricingMethod` nếu có → ignore. Persist enum vào `internal_product`.
- **Output**: `pricingMethod: PWA` trong response (read-only).
- **Failure mode**: N/A.
- **Ref**: BR-CAT-PROD-010; entity `internal_product.pricing_method` (§5.1).

#### AC-10 → Lưu URL ảnh sản phẩm

- **Khi**: nhận body field `imageUrl?` (optional).
- **BE phải**: persist `image_url VARCHAR(500)` dưới dạng opaque string. gf-inventory KHÔNG quản lý S3 lifecycle (R25 OQ10). Null/absent → store NULL.
- **Output**: `imageUrl` trả về trong response 201 nếu có.
- **Failure mode**: N/A (no validation trên URL string).
- **Ref**: entity `internal_product.image_url` (§5.1).

### Cluster C — Đơn vị quy đổi & SKU mapping

#### AC-11 → Persist đơn vị quy đổi trong transaction tạo

- **Khi**: nhận body array `initialConversionUnits?[]`, mỗi phần tử `{uomCode: string, conversionRate: decimal}`.
- **BE phải**:
  - (a) `conversionRate > 0` → ERR-INV-013 + 400 nếu ≤ 0 (BR-CAT-PROD-011).
  - (b) Scale ≤ 6 chữ số thập phân → ERR-INV-047 + 400 (BR-CAT-PROD-011 v15 R29) — app layer PHẢI reject trước save; DB NUMERIC(18,6) round silently là không đủ.
  - (c) Unique `uomCode` per product → ERR-INV-014 + 400 nếu duplicate.
  - Persist tất cả rows vào `internal_product_uom_conversion` atomic với parent. Array rỗng → skip.
- **Output**: rows trong DB; 400 + error code nếu validation fail.
- **Failure mode**: ERR-INV-013, ERR-INV-047, ERR-INV-014.
- **Ref**: BR-CAT-PROD-011 v15, BR-CAT-PROD-012; entity `internal_product_uom_conversion` (§5.1).

#### AC-12 → Persist SKU mapping trong transaction tạo

- **Khi**: nhận body array `initialProductIds?[]` — danh sách SKU ID (Long) cần gắn vào mã nội bộ mới (R9).
- **BE phải**: với mỗi `sku_id`: (a) kiểm tra tồn tại `product.id` trong tenant scope; (b) enforce UNIQUE `(tenant_id, sku_id)` trên `internal_product_sku_mapping` → ERR-INV-015 + 409 nếu SKU đã thuộc mã nội bộ khác (BR-CAT-PROD-013). Persist rows atomic với parent.
- **Output**: mapping rows trong DB; 409 + ERR-INV-015 nếu conflict.
- **Failure mode**: ERR-INV-015.
- **Ref**: BR-CAT-PROD-013, BR-CAT-PROD-014; entity `internal_product_sku_mapping` (§5.1).

#### AC-13 → Schema tệp đính kèm sẵn sàng (upload qua endpoint riêng)

- **Phạm vi V2-10**: body V2-10 KHÔNG nhận attachment trực tiếp. Schema `internal_product_attachment` được deploy qua Flyway V20260624050000 trong feature này.
- Upload flow xử lý qua endpoint riêng sau khi product đã được tạo.
- **NEED CONFIRMATION #1**: endpoint path upload attachment (V2-1X) chưa được define tường minh trong PKG §2.2.1 scope FEAT-CAT-PROD-CREATE — cần BA/Architecture xác nhận path (V2-16?) hoặc thuộc FEAT-CAT-PROD-DETAIL/EDIT.
- **Ref**: BR-CAT-PROD-015 (≤5 file, ≤10MB, PDF/JPG/PNG); entity `internal_product_attachment` (§5.1).

### Cluster D — Persist kết quả & lỗi nghiệp vụ

#### AC-14 → Trả 201 sau khi lưu thành công

- **Khi**: toàn bộ validation pass, transaction commit thành công.
- **BE phải**: trả HTTP 201 Created với body đầy đủ (xem §6.1). Ghi audit record vào `internal_product_history` (action=CREATE) trong cùng transaction (BR-CAT-CMN-001).
- **Output**: 201 + `InternalProductResponse`.
- **Failure mode**: transaction rollback toàn bộ nếu bất kỳ step nào fail.
- **Ref**: BR-CAT-CMN-001; entity `internal_product_history` (§5.1).

#### AC-15 → Trả 409 khi trùng mã

- **Khi**: `code` đã tồn tại cho cùng `tenant_id`.
- **BE phải**: detect duplicate tại service layer (pre-check) hoặc bắt `DataIntegrityViolationException` từ DB unique constraint → 409 + ERR-INV-007.
- **Output**: HTTP 409 + `{"errorCode": "ERR-INV-007", "message": "Mã sản phẩm đã tồn tại"}`.
- **Ref**: BR-CAT-PROD-002; constraint `uq_internal_product_tenant_code` (§5.2).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-PROD-001** (CORNERSTONE): code không chứa `~!@#$%^&*` — validate tại `InternalProductValidator.validateCode()`. Vi phạm → ERR-INV-006 + 400.
- **BR-CAT-PROD-002** (CORNERSTONE): `(tenant_id, code)` UNIQUE — DB constraint + service pre-check. Vi phạm → ERR-INV-007 + 409.
- **BR-CAT-PROD-005** (NORMAL): required fields `code`, `name`, `mainUnitCode` — @Valid tại request DTO. Vi phạm → ERR-CMN-validation + 400.
- **BR-CAT-PROD-009** (NORMAL): `materialGroupCode` phải tồn tại + ACTIVE trong tenant — service layer pre-check. Vi phạm → ERR-CMN-validation + 400.
- **BR-CAT-PROD-010** (CORNERSTONE): `pricing_method` default `PWA`, locked tại create — domain model set default, không accept override. Enforce = ignore input silently.
- **BR-CAT-PROD-011 v15** (CORNERSTONE): `conversionRate` scale ≤ 6 chữ số thập phân — app layer reject trước save (DB NUMERIC(18,6) rounds silently → phải block ở service). Vi phạm → ERR-INV-047 + 400.
- **BR-CAT-PROD-013** (CORNERSTONE): 1 SKU thuộc tối đa 1 mã nội bộ — UNIQUE `(tenant_id, sku_id)` trong `internal_product_sku_mapping`. Vi phạm → ERR-INV-015 + 409.
- **BR-CAT-PROD-019** (NORMAL): `nature` ∈ {`GOODS`, `TOOL`, `SERVICE`, `OTHER`}, default `GOODS` — enum parse tại request. Vi phạm → ERR-INV-012 + 400.
- **BR-CAT-CMN-001** (NORMAL): audit ledger — ghi `internal_product_history` action=CREATE trong cùng transaction với create.

### 4.2 Tenant + auth

- Mọi query propagate `X-Tenant-Id` qua TenantFilter; TenantContext resolve từ JWT claim `custom:tenant_id` (Critical Rule #4).
- `POST /api/v2/internal-products` yêu cầu role `garage-owner` hoặc `accountant` (Critical Rule #6 — dual persona only).
- `material_group` lookup + SKU existence check đều filter theo `tenant_id = currentTenant`.

### 4.3 Idempotency + concurrency

- Không có idempotency-key yêu cầu cho V2-10 (code unique là natural guard).
- UNIQUE constraint `(tenant_id, code)` là defense-in-depth tại DB layer.
- Transaction scope bắt buộc: `internal_product` + `internal_product_uom_conversion` + `internal_product_sku_mapping` + `internal_product_history` atomic trong 1 Spring `@Transactional`.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-006` | 400 | AC-2 | INLINE (field: code) |
| `ERR-INV-007` | 409 | AC-15 | TOAST |
| `ERR-INV-012` | 400 | AC-4 | INLINE (field: nature) |
| `ERR-INV-013` | 400 | AC-11 | INLINE (field: conversionRate — rate ≤ 0) |
| `ERR-INV-014` | 400 | AC-11 | INLINE (field: uomCode — duplicate UOM) |
| `ERR-INV-015` | 409 | AC-12 | INLINE (field: skuId — already mapped) |
| `ERR-INV-047` | 400 | AC-11 | INLINE (field: conversionRate — scale > 6) |
| `ERR-CMN-validation` | 400 | AC-3, AC-5, AC-6, AC-8 | INLINE (field-level message từ BE) |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> Flyway additive từ V20260423100000. KHÔNG ddl-auto. KHÔNG rewrite migration cũ.
>
> **NEED CONFIRMATION #2**: ADR-017 migration file `V20260624030000__create_internal_product_conversion_uom.sql` dùng tên `internal_product_conversion_uom` nhưng PKG §2.2.1 và orchestrator context dùng `internal_product_uom_conversion`. DEV agent cần xác nhận table name canonical trước khi tạo migration.

| Entity | Column | Type | Nullable | Default | Migration | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `internal_product` | `id` | UUID PK | N | gen_random_uuid() | V20260624020000 | — | AC-14 | PK |
| `internal_product` | `tenant_id` | UUID | N | — | V20260624020000 | Critical Rule #4 | AC-17 | TenantFilter scope |
| `internal_product` | `code` | VARCHAR(50) | N | — | V20260624020000 | BR-CAT-PROD-001/002 | AC-2 | UNIQUE (tenant_id, code) |
| `internal_product` | `name` | VARCHAR(255) | N | — | V20260624020000 | BR-CAT-PROD-005 | AC-3 | Required |
| `internal_product` | `main_unit_code` | VARCHAR(20) | N | — | V20260624020000 | BR-CAT-PROD-005/006 | AC-6 | Scalar ref → gf-erp-mdm UNIT (ADR-009 cross-boundary code) |
| `internal_product` | `material_group_id` | UUID | Y | NULL | V20260624020000 | BR-CAT-PROD-009 | AC-5 | Scalar FK → material_group.id (ADR-009 no @ManyToOne) |
| `internal_product` | `status` | ENUM(ACTIVE,INACTIVE) | N | ACTIVE | V20260624020000 | — | AC-7 | Forced ACTIVE tại create |
| `internal_product` | `nature` | ENUM(GOODS,TOOL,SERVICE,OTHER) | N | GOODS | V20260624020000 | BR-CAT-PROD-019 | AC-4 | |
| `internal_product` | `pricing_method` | ENUM(PWA,...) | N | PWA | V20260624020000 | BR-CAT-PROD-010 | AC-9 | Locked = PWA tại create |
| `internal_product` | `brand` | VARCHAR(255) | Y | NULL | V20260624020000 | R18 | AC-8 | Free-text, KHÔNG validate catalog |
| `internal_product` | `origin_code` | VARCHAR(20) | Y | NULL | V20260624020000 | R18 | AC-8 | ISO 3166-1 alpha-3; validate vs gf-erp-mdm COUNTRY |
| `internal_product` | `image_url` | VARCHAR(500) | Y | NULL | V20260624020000 | R25 OQ10 | AC-10 | Opaque URL string |
| `internal_product` | `product_spec` | TEXT | Y | NULL | V20260624020000 | — | AC-8 | |
| `internal_product` | `technical_spec` | TEXT | Y | NULL | V20260624020000 | — | AC-8 | |
| `internal_product` | `description` | VARCHAR(500) | Y | NULL | V20260624020000 | R26 OQ13 | AC-8 | Label "Mô tả" |
| `internal_product` | `notes` | VARCHAR(500) | Y | NULL | V20260624020000 | R26 OQ13 | AC-8 | Max 500 (R26 drop 1000 cũ) |
| `internal_product` | `created_at/by, updated_at/by` | TIMESTAMP / VARCHAR | N | now() | V20260624020000 | BR-CAT-CMN-001 | AC-14 | Audit cols |
| `internal_product_uom_conversion` | `id` | UUID PK | N | gen_random_uuid() | V20260624030000 | — | AC-11 | |
| `internal_product_uom_conversion` | `tenant_id` | UUID | N | — | V20260624030000 | Critical Rule #4 | AC-11 | |
| `internal_product_uom_conversion` | `internal_product_id` | UUID | N | — | V20260624030000 | — | AC-11 | Scalar FK → internal_product.id (ADR-009) |
| `internal_product_uom_conversion` | `uom_code` | VARCHAR(20) | N | — | V20260624030000 | BR-CAT-PROD-011 | AC-11 | Scalar ref → gf-erp-mdm UNIT; UNIQUE (internal_product_id, uom_code) |
| `internal_product_uom_conversion` | `conversion_rate` | NUMERIC(18,6) | N | — | V20260624030000 | BR-CAT-PROD-011 v15 | AC-11 | > 0 (ERR-INV-013); scale ≤ 6 enforce tại app (ERR-INV-047) |
| `internal_product_uom_conversion` | `created_at/by, updated_at/by` | TIMESTAMP / VARCHAR | N | now() | V20260624030000 | — | AC-11 | |
| `internal_product_sku_mapping` | `id` | UUID PK | N | gen_random_uuid() | V20260624040000 | — | AC-12 | |
| `internal_product_sku_mapping` | `tenant_id` | UUID | N | — | V20260624040000 | Critical Rule #4 | AC-12 | |
| `internal_product_sku_mapping` | `internal_product_id` | UUID | N | — | V20260624040000 | — | AC-12 | Scalar FK (ADR-009) |
| `internal_product_sku_mapping` | `sku_id` | BIGINT | N | — | V20260624040000 | BR-CAT-PROD-013/014 | AC-12 | Scalar FK → product.id; UNIQUE (tenant_id, sku_id) |
| `internal_product_sku_mapping` | `created_at/by` | TIMESTAMP / VARCHAR | N | now() | V20260624040000 | — | AC-12 | |
| `internal_product_attachment` | `id` | UUID PK | N | gen_random_uuid() | V20260624050000 | BR-CAT-PROD-015 | AC-13 | Schema-only tại feature này |
| `internal_product_attachment` | `tenant_id` | UUID | N | — | V20260624050000 | Critical Rule #4 | AC-13 | |
| `internal_product_attachment` | `internal_product_id` | UUID | N | — | V20260624050000 | — | AC-13 | Scalar FK (ADR-009) |
| `internal_product_attachment` | `file_url` | VARCHAR(500) | N | — | V20260624050000 | — | AC-13 | ct-file-storage object key |
| `internal_product_attachment` | `file_name` | VARCHAR(255) | N | — | V20260624050000 | — | AC-13 | |
| `internal_product_attachment` | `file_size` | BIGINT | N | — | V20260624050000 | BR-CAT-PROD-015 | AC-13 | ≤ 10MB = 10_485_760 bytes (ERR-CMN-004) |
| `internal_product_attachment` | `mime_type` | VARCHAR(50) | N | — | V20260624050000 | BR-CAT-PROD-015 | AC-13 | PDF/JPG/PNG (ERR-CMN-005) |
| `internal_product_attachment` | `attachment_kind` | ENUM(IMAGE,DOC) | N | — | V20260624050000 | — | AC-13 | |
| `internal_product_history` | `id` | UUID PK | N | gen_random_uuid() | V20260624060000 | BR-CAT-CMN-001 | AC-14 | Audit ledger |
| `internal_product_history` | `tenant_id` | UUID | N | — | V20260624060000 | — | AC-14 | |
| `internal_product_history` | `internal_product_id` | UUID | N | — | V20260624060000 | — | AC-14 | |
| `internal_product_history` | `action` | ENUM(CREATE,UPDATE,DELETE) | N | — | V20260624060000 | — | AC-14 | |
| `internal_product_history` | `actor` | VARCHAR(255) | N | — | V20260624060000 | — | AC-14 | User ID từ JWT |
| `internal_product_history` | `occurred_at` | TIMESTAMP | N | now() | V20260624060000 | — | AC-14 | |

### 5.2 Index / constraint changes

| Table | Constraint/index name | Columns | Type | Purpose |
|---|---|---|---|---|
| `internal_product` | `uq_internal_product_tenant_code` | `(tenant_id, code)` | UNIQUE | BR-CAT-PROD-002, ERR-INV-007 |
| `internal_product` | `idx_internal_product_tenant` | `(tenant_id)` | btree | TenantFilter query |
| `internal_product` | `idx_internal_product_group` | `(material_group_id)` | btree | Filter by group |
| `internal_product_uom_conversion` | `uq_ip_uom_product_uomcode` | `(internal_product_id, uom_code)` | UNIQUE | BR-CAT-PROD-011, ERR-INV-014 |
| `internal_product_sku_mapping` | `uq_ip_sku_tenant_sku` | `(tenant_id, sku_id)` | UNIQUE | BR-CAT-PROD-013, ERR-INV-015 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Response | Idempotency | AC ref |
|---|---|---|---|---|---|
| POST | `/api/v2/internal-products` | JWT Bearer | 201 `InternalProductResponse` | Natural: code UNIQUE | AC-2..AC-15 |

**`InternalProductCreateRequest` (V2-10 body)**:

```json
{
  "code": "string (required, max 50, no ~!@#$%^&*)",
  "name": "string (required, max 255)",
  "mainUnitCode": "string (required, max 20 — validate vs gf-erp-mdm directory=UNIT)",
  "materialGroupCode": "string? (optional — validate exists+ACTIVE in tenant)",
  "nature": "GOODS | TOOL | SERVICE | OTHER (optional, default GOODS)",
  "brand": "string? (optional, max 255, free-text no catalog validation)",
  "originCode": "string? (optional, max 20, ISO 3166-1 alpha-3 — validate vs gf-erp-mdm directory=COUNTRY)",
  "productSpec": "string? (optional, text)",
  "technicalSpec": "string? (optional, text)",
  "description": "string? (optional, max 500)",
  "notes": "string? (optional, max 500)",
  "imageUrl": "string? (optional, max 500, opaque URL)",
  "initialProductIds": "[Long]? (optional — SKU IDs to map at create time, R9)",
  "initialConversionUnits": "[{uomCode: string, conversionRate: decimal}]? (optional)"
}
```

**`InternalProductResponse` (201 body)**:

```json
{
  "id": "UUID",
  "code": "string",
  "name": "string",
  "status": "ACTIVE",
  "nature": "GOODS | TOOL | SERVICE | OTHER",
  "pricingMethod": "PWA",
  "mainUnitCode": "string",
  "materialGroupId": "UUID | null",
  "brand": "string | null",
  "originCode": "string | null",
  "imageUrl": "string | null",
  "productSpec": "string | null",
  "technicalSpec": "string | null",
  "description": "string | null",
  "notes": "string | null",
  "tenantId": "UUID",
  "createdAt": "ISO8601",
  "createdBy": "string"
}
```

### 6.2 Modified REST endpoints (additive)

N/A — feature này chỉ tạo endpoint mới, không modify existing.

### 6.3 Kafka topics

N/A — FEAT-CAT-PROD-CREATE không publish/consume Kafka event. Tạo mã nội bộ là synchronous REST; không có state-changing event yêu cầu outbox trong scope này.

### 6.4 Cross-boundary REST consumers

| Endpoint consumed | Exposed by | When | Failure mode | Retry |
|---|---|---|---|---|
| `GET /protected/v1/directory-items?directory=UNIT&code={code}` | `gf-erp-mdm` | Validate `mainUnitCode` tại V2-10 | 502 propagate lên client | Fail-fast, no retry |
| `GET /protected/v1/directory-items?directory=COUNTRY&code={code}` | `gf-erp-mdm` | Validate `originCode` tại V2-10 | 502 propagate lên client | Fail-fast, no retry |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-PROD-CREATE.md`) sẽ wrap V2-10 thành GraphQL mutation `createInternalProduct`. KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (Critical Rule #1 — boundary isolation).

| Layer | Path glob | Change type | Est. LoC | AC ref |
|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InternalProduct.java` | NEW | ~80 | AC-2,3,4,5,6,7,8,9,10 |
| `domain/model` | `.../domain/model/InternalProductUomConversion.java` | NEW | ~35 | AC-11 |
| `domain/model` | `.../domain/model/InternalProductSkuMapping.java` | NEW | ~30 | AC-12 |
| `domain/model` | `.../domain/model/InternalProductAttachment.java` | NEW | ~25 | AC-13 (schema only) |
| `domain/model` | `.../domain/model/InternalProductHistory.java` | NEW | ~25 | AC-14 |
| `domain/repository` | `.../domain/repository/InternalProductRepository.java` | NEW | ~15 | AC-2,14,15 |
| `domain/repository` | `.../domain/repository/InternalProductUomConversionRepository.java` | NEW | ~10 | AC-11 |
| `domain/repository` | `.../domain/repository/InternalProductSkuMappingRepository.java` | NEW | ~10 | AC-12 |
| `domain/repository` | `.../domain/repository/InternalProductHistoryRepository.java` | NEW | ~10 | AC-14 |
| `app/service` | `.../app/service/InternalProductService.java` | NEW | ~180 | AC-2..AC-15 |
| `app/service` | `.../app/service/InternalProductValidator.java` | NEW | ~70 | AC-2,4,5,6,8,11,12 |
| `app/dto` | `.../app/dto/InternalProductCreateRequest.java` | NEW | ~55 | AC-2..AC-13 |
| `app/dto` | `.../app/dto/InternalProductResponse.java` | NEW | ~60 | AC-14 |
| `adapter/controller` | `.../adapter/controller/InternalProductController.java` | NEW | ~50 | AC-14,15,17 |
| `adapter/persistence` | `.../adapter/persistence/InternalProductJpaRepository.java` | NEW | ~15 | AC-2,14,15 |
| `adapter/persistence` | `.../adapter/persistence/InternalProductUomConversionJpaRepository.java` | NEW | ~10 | AC-11 |
| `adapter/persistence` | `.../adapter/persistence/InternalProductSkuMappingJpaRepository.java` | NEW | ~10 | AC-12 |
| `adapter/client` | `.../adapter/client/ErpMdmDirectoryClient.java` | NEW/EXTEND | ~45 | AC-6, AC-8 |
| `db/migration` | `.../resources/db/migration/V20260624020000__create_internal_product.sql` | NEW | ~40 | AC-2..AC-10 |
| `db/migration` | `.../resources/db/migration/V20260624030000__create_internal_product_conversion_uom.sql` | NEW | ~20 | AC-11 |
| `db/migration` | `.../resources/db/migration/V20260624040000__create_internal_product_sku_mapping.sql` | NEW | ~20 | AC-12 |
| `db/migration` | `.../resources/db/migration/V20260624050000__create_internal_product_attachment.sql` | NEW | ~20 | AC-13 |
| `db/migration` | `.../resources/db/migration/V20260624060000__create_internal_product_history.sql` | NEW | ~15 | AC-14 |
| `test/unit` | `.../test/java/.../app/service/InternalProductServiceTest.java` | NEW | ~230 | AC-2..AC-15 |
| `test/contract` | `.../test/java/.../adapter/controller/InternalProductControllerTest.java` | NEW | ~100 | AC-14,15,17 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema migration (V20260624020000..V20260624060000)
    Entry: ADR-017 table naming confirmed (NEED CONFIRMATION #2 resolved)
    Exit: Flyway migration green, tables exist in dev_gf_inventory
    └─► S2

S2  Domain entities + repositories + validator + service
    Entry: S1
    Exit: InternalProductServiceTest ≥ 10 green (code regex, uniqueness, nature enum,
          conversionRate rate/scale/unique, SKU conflict, PWA forced, status forced)
    └─► S3

S3  REST adapter (InternalProductController POST /api/v2/internal-products)
       + ErpMdmDirectoryClient (UNIT + COUNTRY validation)
    Entry: S2 + gf-erp-mdm contract stable
    Exit: InternalProductControllerTest contract green; HTTP 201/400/409 all covered
    └─► S4

S4  Integration test (erp-mdm stub + product table cross-check)
    Entry: S3
    Exit: integ test green (mainUnitCode invalid, originCode invalid, SKU conflict scenarios)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Flyway migrations ×5 | db/migration | ADR-017 naming stable | Migration test green | — |
| S2 | Entity + repo + validator + service | domain + app | S1 | Unit test ≥ 10 green | S1 |
| S3 | REST adapter + DTO + erp-mdm client | adapter | S2 + erp-mdm contract | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + stubs | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (path hint) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-PROD-001` | CORNERSTONE | app/service (validator) | `InternalProductValidator.validateCode()` | AC-2 | `TC-BR-gf-inventory-PROD-001-*` |
| `BR-CAT-PROD-002` | CORNERSTONE | DB constraint + service pre-check | `uq_internal_product_tenant_code` | AC-2, AC-15 | `TC-BR-gf-inventory-PROD-002-*` |
| `BR-CAT-PROD-005` | NORMAL | request validation (@Valid) | `InternalProductCreateRequest` | AC-2, AC-3, AC-6 | `TC-BR-gf-inventory-PROD-005-*` |
| `BR-CAT-PROD-009` | NORMAL | app/service | `InternalProductService.resolveMaterialGroup()` | AC-5 | `TC-BR-gf-inventory-PROD-009-*` |
| `BR-CAT-PROD-010` | CORNERSTONE | domain model (immutable default) | `InternalProduct` constructor: `pricingMethod = PWA` | AC-9 | `TC-BR-gf-inventory-PROD-010-*` |
| `BR-CAT-PROD-011 v15` | CORNERSTONE | app/service (pre-save scale check) | `InternalProductValidator.validateConversionRate()` | AC-11 | `TC-BR-gf-inventory-PROD-011-*` |
| `BR-CAT-PROD-013` | CORNERSTONE | DB constraint + service pre-check | `uq_ip_sku_tenant_sku` | AC-12 | `TC-BR-gf-inventory-PROD-013-*` |
| `BR-CAT-PROD-019` | NORMAL | request validation (enum parse) | `InternalProductCreateRequest.nature` | AC-4 | `TC-BR-gf-inventory-PROD-019-*` |
| `BR-CAT-CMN-001` | NORMAL | app/service (within transaction) | `InternalProductHistoryService.recordCreate()` | AC-14 | `TC-BR-gf-inventory-CMN-001-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | Unit (validation) + API contract (negative) | test-api | Code regex ERR-INV-006; duplicate ERR-INV-007 + 409 |
| AC-3 | Unit (required field) | test-api | name empty/null → ERR-CMN-validation |
| AC-4 | Unit (enum) | test-api | nature invalid → ERR-INV-012; absent → default GOODS |
| AC-5 | Unit + Integration | test-api | materialGroupCode not found / INACTIVE → 400 |
| AC-6 | Unit + Integration | test-api | mainUnitCode invalid vs gf-erp-mdm stub → ERR-CMN-validation |
| AC-8 | Unit + Integration | test-api | originCode invalid → ERR-CMN-validation; brand free-text pass |
| AC-9 | Unit | test-api | pricing_method always PWA regardless of input field |
| AC-11 | Unit | test-api | rate ≤ 0 → ERR-INV-013; scale > 6 → ERR-INV-047; dup uom → ERR-INV-014 |
| AC-12 | Unit + Integration | test-api | sku_id already mapped → ERR-INV-015 + 409 |
| AC-14 | API contract | test-api | 201 response shape; history record written |
| AC-15 | API contract (negative) | test-api | Duplicate code → 409 + ERR-INV-007 |
| AC-17 | Isolation (RBAC) | test-isolation | garage-owner ✅; accountant ✅; unauthorized → 401/403 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-CREATE.md` | DRAFT-pending | Wrap `POST /api/v2/internal-products` → `createInternalProduct` mutation |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-CREATE.md` | DRAFT-pending | Form UI + BFF mutation consume |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-CREATE.md` | DRAFT-pending | Flutter screen + BLoC + BFF mutation consume |

**Source ID consistency** (item #18): tất cả tier file phải có cùng `source_feat_sha = ea1840f182e9f1b7d399cf9f327e242d6fbe686ac5860c1e8049a986edbaaaab`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-CREATE.md`](../../../../../Product/features/FEAT-CAT-PROD-CREATE.md) v12
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md), [`BR-GF-INVENTORY.md`](../../business-rules/BR-GF-INVENTORY.md)
- **ADR**: [`Architecture/decisions/ADR-009.md`](../../../../../Architecture/decisions/ADR-009.md) (JPA no-relationship), [`Architecture/decisions/ADR-017.md`](../../../../../Architecture/decisions/ADR-017.md) (additive aggregates, migration sequence)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-10
- **Integration**: [`Architecture/integrations/INTEG-BFF-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-BFF-gf-inventory.md)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`Execution/wave-specs/W03/work-packages/PKG-W03-inventory-catalog.md`](../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec FEAT-CAT-PROD-CREATE W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ 3-5 dòng, §2 trách nhiệm BE, §3 behaviour map 17 AC-IDs (15 covered + AC-1/AC-16 N/A UI-only), §4 ràng buộc + error codes, §5 schema 5 bảng mới Flyway V20260624020000..060000, §6 REST V2-10 + cross-boundary gf-erp-mdm (UNIT+COUNTRY), §7 Hexagonal file map, §8 DAG S1-S4. NEED CONFIRMATION: AC-13 attachment upload endpoint path; internal_product_uom_conversion vs internal_product_conversion_uom naming. |
