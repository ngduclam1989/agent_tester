---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-LIST.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-LIST"
source_feat_sha: "d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118"
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
demo_signature: "POST /api/v2/internal-products/search {keyword='dầu', status=ACTIVE, page=0, size=20} → Spring Page<InternalProductSummary> match code/name/SKU"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-PROD-LIST"]
paired_fe_web_feats: ["FEAT-CAT-PROD-LIST"]
paired_mobile_feats: ["FEAT-CAT-PROD-LIST"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-LIST.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-LIST (BE): Danh sách mã sản phẩm nội bộ — tìm kiếm & bộ lọc

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-LIST` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `agg-garage-graph` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | POST /api/v2/internal-products/search với keyword+filters → Spring Page<InternalProductSummary> |
| Cross-tier pair | BFF: FEAT-CAT-PROD-LIST \| Web: FEAT-CAT-PROD-LIST \| Mobile: FEAT-CAT-PROD-LIST |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) |
| Source version | v7 |
| Source SHA | `d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu nhanh danh sách mã sản phẩm nội bộ — chuẩn dùng để tính tồn kho và mapping SKU — để định vị sản phẩm cụ thể, kiểm tra trạng thái/tính chất, và truy cập các thao tác quản lý. Feature là điểm vào chính của subsystem catalog-v2 trong gf-inventory, cung cấp nền dữ liệu cho toàn bộ nghiệp vụ nhập/xuất/tồn kho V2. Kết quả tra cứu được phân trang và lọc đa chiều (từ khóa, trạng thái, tính chất, nhóm vật tư).

## 2. Trách nhiệm backend (gf-inventory)

- Expose `POST /api/v2/internal-products/search` (V2-7) nhận `InternalProductSearchInput` và trả `Page<InternalProductSummaryResponse>` theo Spring Pageable — endpoint áp dụng R10 (GET→POST 2026-06-24).
- Thực hiện keyword OR-match trên 3 cột: `internal_product.code`, `internal_product.name`, và `product.sku` (LEFT JOIN `internal_product_sku_mapping` → `product`); nếu keyword null/rỗng → trả toàn bộ theo filters còn lại.
- Enforce status default `ACTIVE` khi caller không truyền `status`; validate `nature` ∈ `{GOODS, TOOL, SERVICE, OTHER}` khi có; validate `materialGroupId` tồn tại trong tenant khi có.
- Scope toàn bộ query theo `tenant_id` từ JWT (`TenantFilter` / `TenantContext`) — không expose cross-tenant record (Critical Rule #4).
- Enforce RBAC: cả `accountant` và `garage-owner` đều được search (BR-CAT-PROD-007); không có field-level restriction ở tier BE.
- Không tạo migration riêng: table `internal_product` và `internal_product_sku_mapping` được tạo bởi W03 batch migration thuộc FEAT-CAT-PROD-CREATE (V20260624020000 + V20260624040000); feature LIST chỉ cần index phù hợp (xem §5.2).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Search & filter endpoint

#### AC-1 → Endpoint trả response mặc định cho màn hình load

- **Khi**: BFF gọi `POST /api/v2/internal-products/search` không truyền filter (hoặc `status=ACTIVE`, `page=0`, `size=20`)
- **BE phải**: xử lý request với `status` mặc định `ACTIVE`, trả danh sách trang đầu mã sản phẩm thuộc tenant; nếu không có bản ghi → trả `Page.empty()` (HTTP 200, `content: []`)
- **Output**: `Page<InternalProductSummaryResponse>` — `{content[], page: {number, size, totalElements, totalPages}}`
- **Failure mode**: thiếu JWT / tenant không resolve → `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.02` (401)
- **Ref**: endpoint `POST /api/v2/internal-products/search` (§6.1), entity `internal_product` (§5.1)

#### AC-2 → Response projection bao gồm đủ field để hiển thị bảng

- **Khi**: `POST /api/v2/internal-products/search` thành công
- **BE phải**: trả projection `InternalProductSummaryResponse` chứa: `id`, `code`, `name`, `nature` (enum), `status` (enum), `materialGroupId`, `materialGroupName` (join `material_group.name`), `mainUnitCode`, `imageUrl` (nullable), `skuCount` (COUNT join `internal_product_sku_mapping`), `createdAt`, `updatedAt` — KHÔNG trả `conversionUnits[]`, `attachments[]`, full `skuMappings[]` (chỉ ở V2-8 detail)
- **Output**: mỗi phần tử trong `content[]` có đủ các fields trên
- **Failure mode**: không có
- **Ref**: entity `internal_product`, `material_group` (§5.1), endpoint V2-7 (§6.1)

#### AC-3 → Keyword OR-match trên 3 cột code / name / SKU

- **Khi**: `keyword` được truyền trong request body (không rỗng, không blank)
- **BE phải**: áp `WHERE (ip.code ILIKE %keyword% OR ip.name ILIKE %keyword% OR p.sku ILIKE %keyword%)` — sử dụng `LEFT JOIN internal_product_sku_mapping ipsm ON ipsm.internal_product_id = ip.id JOIN product p ON p.id = ipsm.sku_id`; query phải `DISTINCT` (1 product có nhiều SKU → không duplicate row)
- **Output**: tập kết quả chỉ chứa các mã SP match ít nhất 1 trong 3 cột; không có bản ghi match → `content: []` (200)
- **Failure mode**: không có (empty search là hợp lệ)
- **Ref**: BR-CAT-GRP-013 (pattern keyword search), endpoint V2-7 (§6.1)

#### AC-4 → Lọc theo trạng thái với mặc định ACTIVE

- **Khi**: caller truyền `status` ∈ `{ACTIVE, INACTIVE}` hoặc không truyền
- **BE phải**: nếu `status` null → filter `WHERE ip.status = 'ACTIVE'` (default); nếu truyền explicit → filter đúng giá trị; nếu value ngoài enum → reject `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.01` (400)
- **Output**: danh sách chỉ chứa bản ghi đúng trạng thái đã lọc
- **Failure mode**: enum không hợp lệ → 400
- **Ref**: entity `internal_product.status` enum (§5.1)

#### AC-5 → Lọc theo tính chất (nature)

- **Khi**: caller truyền `nature` ∈ `{GOODS, TOOL, SERVICE, OTHER}`
- **BE phải**: filter `WHERE ip.nature = :nature`; `nature` null → không filter (trả mọi tính chất); value ngoài enum → reject 400
- **Output**: danh sách chỉ chứa bản ghi đúng tính chất; `nature` trong mỗi item response map sang enum display (display mapping ở BFF/FE)
- **Failure mode**: enum không hợp lệ → `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.01` (400)
- **Ref**: BR-CAT-PROD-019 (4 giá trị nature), entity `internal_product.nature` (§5.1)

#### AC-6 → Lọc theo nhóm vật tư

- **Khi**: caller truyền `materialGroupId` (UUID)
- **BE phải**: filter `WHERE ip.material_group_id = :materialGroupId AND ipsm.tenant_id = :tenantId`; xác nhận nhóm vật tư tồn tại trong tenant (nếu không tồn tại → trả `content: []` — không throw 404 vì list-filter context); `materialGroupId` null → không filter
- **Output**: danh sách mã SP thuộc nhóm vật tư chỉ định
- **Failure mode**: không có (unknown groupId → empty list)
- **Ref**: entity `internal_product.material_group_id` FK scalar (§5.1), BR-CAT-PROD-007

#### AC-7 → Phân trang Spring Pageable

- **Khi**: request có `page`, `size`, `sort` trong body
- **BE phải**: dùng Spring `Pageable` (offset-based); mặc định `page=0`, `size=20`; enforce max `size=100` (reject > 100 → 400); `sort` hỗ trợ `code`, `name`, `createdAt` (ASC/DESC); default sort = `code ASC`
- **Output**: response `{content[], page: {number, size, totalElements, totalPages}}` — Spring Page-wrapper
- **Failure mode**: `size` > 100 → `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.01` (400); sort field không hợp lệ → 400
- **Ref**: ADR-016 (list pagination pattern — Spring Pageable), endpoint V2-7 (§6.1)

#### AC-8 → N/A (UI-only — row actions theo trạng thái)

- Source AC-8 xác định nút thao tác theo dòng (sửa/xóa/kích hoạt) phụ thuộc `status` của mỗi item. BE không cần logic riêng cho AC này — response đã trả `status` trong mỗi item (AC-2). FE/Mobile tier tự render button visibility dựa vào giá trị `status`. Xem `fe-web/FEAT-CAT-PROD-LIST.md §3 AC-8`.

#### AC-9 → N/A (UI-only — toolbar navigation)

- Source AC-9 xác định nút "Thêm mới", "Nhập Excel", "Xuất Excel" trên thanh công cụ. Đây là navigation/routing FE. BE không touch. Xem `fe-web/FEAT-CAT-PROD-LIST.md §3 AC-9`.

### Cluster B — Bảo mật & phân quyền

#### AC-10 → Tenant isolation + RBAC enforcement

- **Khi**: mọi call tới `POST /api/v2/internal-products/search`
- **BE phải**: (a) `TenantFilter` inject `tenant_id` từ JWT vào mọi query — không có `tenant_id` path param, resolve hoàn toàn từ JWT claim; (b) cả `accountant` và `garage-owner` đều được phép; (c) cross-tenant record KHÔNG được xuất hiện trong `content[]` — `WHERE ip.tenant_id = :tenantId` bắt buộc; (d) JWT thiếu / tenant không resolve → 401
- **Output**: response chỉ chứa bản ghi thuộc tenant caller
- **Failure mode**: 401 nếu JWT thiếu/hết hạn; không có 403 riêng (cả 2 role đều read)
- **Ref**: Critical Rule #4 (tenant isolation), BR-CAT-PROD-008 (phạm vi garage), ADR-009

#### AC-11 → N/A (Mobile platform restriction — view-only)

- Source AC-11 giới hạn Mobile chỉ hiển thị danh sách (không có nút thêm/sửa/xóa). Endpoint `POST /api/v2/internal-products/search` vốn là read-only (không side-effect), nên không cần server-side restriction cho Mobile. Mobile tier spec handle presentation-layer restriction. Xem `mobile/FEAT-CAT-PROD-LIST.md §3 AC-11`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-PROD-007** (NORMAL): Danh sách mã SP nội bộ phải scoped theo `tenant_id` — không bao giờ trả bản ghi chéo tenant. Enforce tại `TenantFilter` + `WHERE ip.tenant_id = :tenantId` trong mọi query. Vi phạm = data breach (Critical Rule #4).
- **BR-CAT-PROD-008** (NORMAL): Phạm vi hiển thị giới hạn trong garage hiện tại — không expose dữ liệu vượt ranh giới tenant. Enforce tại service layer (`InternalProductSearchService`) — verify `tenantId` từ `TenantContext` trước khi build `Specification`.
- **BR-CAT-PROD-019** (NORMAL): `nature` phải thuộc 4 giá trị enum `GOODS/TOOL/SERVICE/OTHER`. Enforce tại controller validation (`@Valid`) — giá trị ngoài enum → reject 400 trước khi đến service layer.
- **BR-CAT-CMN-003** (NORMAL): Keyword search phải OR-match đồng thời trên `code`, `name`, và SKU — không được thu hẹp xuống 1 cột đơn. Enforce tại repository (`InternalProductSearchRepository::buildSearchSpec`).

### 4.2 Tenant + auth

- Mọi call phải có JWT hợp lệ — `TenantFilter` extract `tenant_id` từ claim `custom:tenant_id`; thiếu hoặc không resolve → reject 401 trước khi vào controller.
- `OriginTenantId` header (nếu có trong cross-boundary call từ BFF) phải match `tenant_id` trong JWT (Critical Rule #4).
- Cả `accountant` và `garage-owner` đều read-only; không cần role-split ở endpoint này.

### 4.3 Idempotency + concurrency

- Endpoint là read-only (no side-effect) — không cần `Idempotency-Key` header.
- Không có optimistic locking: query thuần đọc, không ghi.
- DISTINCT bắt buộc khi JOIN `internal_product_sku_mapping` — tránh inflate row count khi 1 product có nhiều SKU.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.01` | 400 | AC-4, AC-5, AC-7 | TOAST — "Tham số tìm kiếm không hợp lệ" |
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.02` | 401 | AC-10 | REDIRECT login |
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.06` | 500 | — | TOAST — "Lỗi hệ thống, vui lòng thử lại" |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity references — `gf-inventory`

> Feature LIST không tạo table mới. Các table dưới đây được tạo bởi W03 batch migration (thuộc FEAT-CAT-PROD-CREATE). Author ghi lại để dev biết entity nào cần đọc.

| Entity (table) | Columns dùng cho search | Migration owner | BR ref | AC ref |
|---|---|---|---|---|
| `internal_product` | `id`, `tenant_id`, `code`, `name`, `nature`, `status`, `material_group_id`, `main_unit_code`, `image_url`, `created_at`, `updated_at` | W03 batch `V20260624020000__create_internal_product.sql` | BR-CAT-PROD-007/008/019 | AC-1..7, AC-10 |
| `material_group` | `id`, `tenant_id`, `name` (JOIN để lấy `materialGroupName`) | W03 batch `V20260624010000__create_material_group.sql` | — | AC-2, AC-6 |
| `internal_product_sku_mapping` | `internal_product_id`, `sku_id`, `tenant_id` (JOIN để keyword-match SKU + COUNT) | W03 batch `V20260624040000__create_internal_product_sku_mapping.sql` | BR-CAT-PROD-013 | AC-3 |
| `product` (legacy) | `id`, `sku` (JOIN để keyword-match SKU code) | Pre-existing (baseline) — KHÔNG modify | — | AC-3 |

> ADR-009: quan hệ giữa `internal_product` và `material_group` là scalar FK (`material_group_id UUID`). KHÔNG dùng `@ManyToOne`. JOIN thực hiện tường minh ở JPQL/Specification.

### 5.2 Index / constraint changes

> Các index sau cần được khai báo trong `V20260624020000__create_internal_product.sql` (hoặc `V20260624070000__create_internal_product_search_idx.sql` nếu tách riêng). Author NEED CONFIRMATION nếu migration số đã tồn tại.

| Table | Index name | Columns | Type | Purpose | AC ref |
|---|---|---|---|---|---|
| `internal_product` | `idx_ip_tenant_status` | `(tenant_id, status)` | btree | Filter AC-4 nhanh | AC-4 |
| `internal_product` | `idx_ip_tenant_nature` | `(tenant_id, nature)` | btree | Filter AC-5 nhanh | AC-5 |
| `internal_product` | `idx_ip_tenant_group` | `(tenant_id, material_group_id)` | btree | Filter AC-6 nhanh | AC-6 |
| `internal_product` | `idx_ip_tenant_code_name` | `(tenant_id, code, name)` | btree | keyword ILIKE fallback; nếu volume lớn → `pg_trgm` GIN index cần xem xét | AC-3 |
| `internal_product_sku_mapping` | `idx_ipsm_product_id` | `(internal_product_id)` | btree | JOIN hiệu quả cho keyword SKU + COUNT | AC-3 |

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

**V2-7**: `POST /api/v2/internal-products/search`

| Field | Value |
|---|---|
| Method | POST |
| Path | `/api/v2/internal-products/search` |
| Auth | JWT (Bearer) — `TenantFilter` resolve tenant từ `custom:tenant_id` claim |
| Idempotency | Safe read-only — không cần `Idempotency-Key` |
| AC ref | AC-1..7, AC-10 |
| CB ref | — |

**Request body** (`InternalProductSearchInput`):
```json
{
  "keyword": "string | null",
  "status": "ACTIVE | INACTIVE | null (default ACTIVE)",
  "nature": "GOODS | TOOL | SERVICE | OTHER | null",
  "materialGroupId": "UUID | null",
  "page": "integer (default 0)",
  "size": "integer (default 20, max 100)",
  "sort": "string (default 'code,asc' — support: code,asc|code,desc|name,asc|name,desc|createdAt,desc)"
}
```

**Response 200** (`Page<InternalProductSummaryResponse>`):
```json
{
  "content": [
    {
      "id": "UUID",
      "code": "string",
      "name": "string",
      "nature": "GOODS | TOOL | SERVICE | OTHER",
      "status": "ACTIVE | INACTIVE",
      "materialGroupId": "UUID | null",
      "materialGroupName": "string | null",
      "mainUnitCode": "string",
      "imageUrl": "string | null",
      "skuCount": "integer"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 42,
    "totalPages": 3
  }
}
```

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.01` | 400 | Body không parse được; enum `status`/`nature` ngoài range; `size` > 100; sort field không hợp lệ |
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.02` | 401 | JWT thiếu, hết hạn, hoặc không resolve được `tenant_id` |
| `GMS.gf-inventory.INTERNAL_PRODUCT_SEARCH.06` | 500 | Lỗi xử lý nội bộ (query fail, mapping lỗi) |

### 6.2 Modified REST endpoints (additive)

_Không có endpoint hiện tại nào bị modify._

### 6.3 Kafka topics (publish/consume)

_Feature LIST là read-only — không publish/consume Kafka event._

### 6.4 Cross-boundary REST consumers

_Feature LIST không gọi cross-boundary REST (không cần enrich `mainUnitDisplayName`/`originDisplayName` — đó là BFF responsibility)._

> **Hand-off tới BFF**: BFF (`agg-garage-graph`) wrap `POST /api/v2/internal-products/search` thành GraphQL query `internalProducts(input: InternalProductSearchInput): InternalProductPage`. Enrich `mainUnitDisplayName` từ gf-erp-mdm `directory=UNIT` (resolve tại BFF DataLoader). Xem `bff/FEAT-CAT-PROD-LIST.md §6`.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**`. Cross-boundary touch chỉ qua §6.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/InternalProduct.java` | READ (existing entity) | — | 0 (read-only) | AC-2 |
| `domain/model` | `src/main/java/.../domain/model/InternalProductSummary.java` | NEW (projection interface/record) | new record | ~25 | AC-2 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductRepository.java` | ADDITIVE | new search method | ~15 | AC-3..7 |
| `app/service` | `src/main/java/.../app/service/InternalProductSearchService.java` | NEW | new service class | ~70 | AC-1..7, AC-10 |
| `app/dto` | `src/main/java/.../app/dto/InternalProductSearchInput.java` | NEW | DTO class | ~30 | AC-3..7 |
| `app/dto` | `src/main/java/.../app/dto/InternalProductSummaryResponse.java` | NEW | DTO class | ~30 | AC-2 |
| `adapter/controller` | `src/main/java/.../adapter/controller/InternalProductController.java` | NEW (or ADDITIVE if reuse) | new endpoint method | ~30 | AC-1, AC-10 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/InternalProductJpaRepository.java` | NEW | Spring Data + Specification | ~50 | AC-3..7 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/InternalProductSpecification.java` | NEW | Specification builder | ~60 | AC-3..7 |
| `test/unit` | `src/test/java/.../app/service/InternalProductSearchServiceTest.java` | NEW | unit test | ~120 | AC-1..7, AC-10 |
| `test/contract` | `src/test/java/.../adapter/controller/InternalProductSearchContractTest.java` | NEW | contract test | ~80 | AC-1, AC-4, AC-10 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Entity + projection DTO
    Entry: W03 batch migration đã apply (V20260624020000/V20260624040000)
    Exit: InternalProduct entity readable, InternalProductSummary projection compile
    └─► S2

S2  Repository + Specification (search logic)
    Entry: S1
    Exit: unit test ≥8 green — keyword OR-match (3 cột), status filter default ACTIVE, nature filter, materialGroupId filter, DISTINCT, Pageable
    └─► S3

S3  Service + DTO + Controller
    Entry: S2
    Exit: contract test green (POST /api/v2/internal-products/search — happy path + 401 + 400 enum invalid)
    └─► S4

S4  Integration test (tenant isolation + cross-role)
    Entry: S3
    Exit: integ test green — (a) cross-tenant không leak; (b) accountant + garage-owner cùng đọc; (c) keyword SKU match
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Entity read + projection DTO | domain/model + app/dto | W03 migration applied | Compile clean | — |
| S2 | Repository + Specification | adapter/persistence | S1 | Unit test ≥8 green | S1 |
| S3 | Service + Controller | app/service + adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green (tenant isolation + RBAC) | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-PROD-007` | NORMAL | service (primary) | `InternalProductSearchService::search()` — scope query theo tenantId | AC-1, AC-10 | `TC-BR-inventory-PROD-007-*` |
| `BR-CAT-PROD-008` | NORMAL | service + filter | `TenantFilter` + `InternalProductSpecification::tenantScope()` | AC-10 | `TC-BR-inventory-PROD-008-*` |
| `BR-CAT-PROD-019` | NORMAL | controller validation (primary) | `@Valid InternalProductSearchInput` — `nature` enum binding | AC-5 | `TC-BR-inventory-PROD-019-*` |
| `BR-CAT-CMN-003` | NORMAL | repository (primary) | `InternalProductSpecification::keywordSpec()` — OR 3-col + DISTINCT | AC-3 | `TC-BR-inventory-CMN-003-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (happy path) | test-api | Default params → 200 + `content[]` + `page{}` |
| AC-2 | API contract (field check) | test-api | Assert `materialGroupName`, `skuCount`, `imageUrl` null-safe trong response |
| AC-3 | Unit + API contract | test-api | keyword match code, name, SKU riêng lẻ; keyword không match → `content: []` |
| AC-4 | Unit (status default) | test-api | null status → ACTIVE default; INACTIVE explicit; invalid enum → 400 |
| AC-5 | Unit (nature filter) | test-api | nature=GOODS filter; invalid enum → 400 |
| AC-6 | Unit (group filter) | test-api | materialGroupId existing → filtered; unknown UUID → `content: []` |
| AC-7 | API contract (pagination) | test-api | size=5, page=1; size=101 → 400; sort=name,desc valid |
| AC-10 | Isolation (RBAC + tenant) | test-isolation | Dual tenant cross-leak; accountant + garage-owner đều 200; no JWT → 401 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-LIST.md` | PENDING | Wrap V2-7 thành GraphQL `internalProducts` query; enrich `mainUnitDisplayName` từ gf-erp-mdm tại BFF DataLoader |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-LIST.md` | PENDING | Consume GraphQL query; render table + filters + pagination; row actions (AC-8, AC-9) là FE territory |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-LIST.md` | PENDING | Consume GraphQL query; view-only (AC-11); no create/edit buttons |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = d5f32d83fb3f2cba296abfedefc85cc9579dd56c9227ad61655f810cd37cf118`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-LIST.md`](../../../../../Product/features/FEAT-CAT-PROD-LIST.md) v7
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-7
- **ADR**: `ADR-009` (no JPA relationship), `ADR-016` (Spring Pageable pattern), `ADR-017` (additive aggregates — internal_product entity)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-7
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho FEAT-CAT-PROD-LIST W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map 11 AC (AC-1..7 + AC-10 triển khai, AC-8/9/11 khai báo N/A), §4 ràng buộc, §5 entity refs + index, §6 V2-7 POST search contract, §7 file map hexagonal, §8 sequence S1-S4, §9 BR primary, §10 test scope, §11 cross-tier pair. |
