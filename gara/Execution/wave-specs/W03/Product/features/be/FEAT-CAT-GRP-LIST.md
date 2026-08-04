---
type: execution-spec
artifact_kind: feature-be
status: ACTIVE
version: 1
tier: T4
owner_authority: "Delivery Authority + Architecture Authority"
wave: "W03"
last_reviewed: "2026-06-29"
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-LIST"
source_feat_sha: "cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef"
source_feat_version: 6
generated_at: "2026-06-29T14:45:00Z"
tier_role: backend
target_boundary: gf-inventory
parent_epic: EP-INVENTORY-CATALOG
parent_pkg: PKG-W03-inventory-catalog
boundary: gf-inventory
boundaries_affected: ["gf-inventory"]
modifies: []
change_type: new-capability
demo_signature: "POST /api/v2/material-groups/search trả flat paginated list nhóm vật tư với flat-grouped-by-parent ordering, keyword/status/parentId filter"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-GRP-LIST"]
paired_fe_web_feats: ["FEAT-CAT-GRP-LIST"]
paired_mobile_feats: ["FEAT-CAT-GRP-LIST"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da30d40bb271c9bf87e13a0da4ba1614d00a9f7b4ec180956a821c4100"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-LIST.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
---

# FEAT-CAT-GRP-LIST (BE): Tra cứu danh sách nhóm vật tư hàng hóa

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl feature tra cứu nhóm VTHH. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-LIST` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | POST /api/v2/material-groups/search trả flat paginated list với flat-grouped-by-parent ordering |
| Cross-tier pair | BFF: FEAT-CAT-GRP-LIST \| Web: FEAT-CAT-GRP-LIST \| Mobile: FEAT-CAT-GRP-LIST |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) |
| Source version | v6 |
| Source SHA | `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` |
| Generated at | 2026-06-29T14:45:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu danh sách nhóm vật tư hàng hóa để phân loại và điều hướng trong hệ thống quản lý kho V2. Feature cho phép tìm kiếm theo mã/tên và lọc theo trạng thái hoặc nhóm cha, với kết quả hiển thị phẳng (flat) có phân trang — quan hệ cha–con thể hiện qua trường "Thuộc nhóm". Đây là điểm khởi đầu cho các luồng tạo, xem chi tiết, sửa và xóa nhóm vật tư trong wave W03 (Danh mục V2).

## 2. Trách nhiệm backend (gf-inventory)

- Expose `POST /api/v2/material-groups/search` (V2-1) trả flat paginated list từ entity `material_group` với Spring Pageable wrapper; hỗ trợ filter `keyword`, `parentId`, `status` và flat-grouped-by-parent ordering khi `sort=default` (backend authoritative ORDER BY — siblings cùng `parent_id` liền kề nhau).
- Resolve `parentCode` + `parentName` qua self-join scalar FK `parent_id` trên cùng bảng — ADR-009 compliant (KHÔNG `@ManyToOne`; explicit JPQL join).
- Enforce BR-CAT-GRP-013: keyword OR-match trên `code` và `name`; case-insensitive.
- Enforce tenant isolation: `TenantFilter` + `TenantContext` inject `tenant_id` condition vào mọi query; cross-tenant fetch trả `[]`.
- Enforce RBAC: chỉ `garage-owner` và `accountant` được access; JWT bearer required (Critical Rule #6).
- Không có schema migration mới cho feature này — entity `material_group` đã tạo qua migration `V20260624010000__create_material_group.sql` thuộc scope FEAT-CAT-GRP-CREATE.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Query & Search

#### AC-1 → Xử lý search request, trả paginated response

- **Khi**: BFF gọi `POST /api/v2/material-groups/search` với body hợp lệ (có thể rỗng — defaults: `page=0, size=20`)
- **BE phải**: Parse `MaterialGroupSearchInput`, inject `tenant_id` từ `TenantContext`, thực thi query phân trang trên `material_group` table với toàn bộ filter đang active
- **Output**: Spring Pageable wrapper `{content: MaterialGroupSearchResponse[], page: {number, size, totalElements, totalPages}}`
- **Failure mode**: Body không parse được → HTTP 400 + `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.01`; token thiếu/hết hạn → HTTP 401 + `.02`; lỗi DB → HTTP 500 + `.06`
- **Ref**: endpoint V2-1 §6.1, entity `material_group` §5.1

#### AC-2 → Populate đầy đủ fields trong response item để FE/BFF render bảng

- **Khi**: Query thực thi thành công
- **BE phải**: Trả mỗi item với: `id`, `code`, `name`, `description`, `parentId`, `parentCode`, `parentName` (via self-join), `status`, `level` (depth tính từ root — 0 = root, 1 = child, ...),  `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
- **Output**: `MaterialGroupSearchResponse` DTO đủ fields; BE không quyết định cột nào FE/BFF hiển thị
- **Failure mode**: Self-join fail (dữ liệu corrupt) → log warn + `parentCode/parentName = null`; không HTTP error
- **Ref**: entity `material_group` §5.1, endpoint V2-1 §6.1

#### AC-3 → Flat list với flat-grouped-by-parent ordering

- **Khi**: Request có `sort=default` hoặc `sort` field vắng mặt (implicit default)
- **BE phải**: ORDER BY sắp xếp root groups (`parent_id IS NULL`) trước, sau đó siblings cùng `parent_id` liền kề nhau. Implementation gợi ý: `ORDER BY COALESCE(parent_id::text, ''), code` — đảm bảo root đứng đầu, siblings adjacent, consistent cross-page. Ordering này là backend authoritative; FE/BFF không được sort lại.
- **Output**: Flat list đúng thứ tự flat-grouped; mỗi item có `parentId` + `parentName` để FE render cột "Thuộc nhóm"
- **Failure mode**: N/A (ordering is best-effort; non-breaking)
- **Ref**: R7 (PKG §2.2.1 V2-1 ordering note), entity `material_group.parent_id` §5.1

#### AC-4 → Keyword search theo mã/tên nhóm (BR-CAT-GRP-013)

- **Khi**: Body có field `keyword` không null và không rỗng
- **BE phải**: Áp OR-match trên `code` và `name` — `LOWER(code) LIKE LOWER('%{keyword}%') OR LOWER(name) LIKE LOWER('%{keyword}%')` — case-insensitive. **[NEED CONFIRMATION #1]**: PKG §2.2.1 V2-1 viết "3-col keyword OR-match `code/name`" nhưng chỉ đặt tên 2 cột; cột thứ 3 nếu có (vd `description`) cần BA xác nhận trước khi impl. Đề xuất mặc định là 2-col (code/name) cho material_group.
- **Output**: Filtered paginated list; khi `keyword` không match bất kỳ row nào → `content: [], totalElements: 0`
- **Failure mode**: N/A (no error for zero results)
- **Ref**: BR-CAT-GRP-013, endpoint V2-1 §6.1

#### AC-5 → Lọc theo trạng thái

- **Khi**: Body có field `status` = `ACTIVE` hoặc `INACTIVE`
- **BE phải**: Filter `material_group.status = :status`; khi `status` null/vắng → không filter (trả cả ACTIVE và INACTIVE)
- **Output**: Filtered list theo status hoặc full list
- **Failure mode**: `status` có giá trị ngoài enum `{ACTIVE, INACTIVE}` → HTTP 400 + `.01`
- **Ref**: entity `material_group.status` §5.1, endpoint V2-1 §6.1

#### AC-6 → Lọc theo nhóm cha

- **Khi**: Body có field `parentId` không null (UUID)
- **BE phải**: Validate `parentId` tồn tại trong `material_group` cùng tenant; nếu không tồn tại → HTTP 404 + `.03`. Nếu tồn tại → filter `material_group.parent_id = :parentId` (children trực tiếp, depth=1, không đệ quy).
- **Output**: Flat list chỉ gồm direct children của parentId; có thể rỗng nếu không có con
- **Failure mode**: `parentId` không tồn tại hoặc không thuộc tenant → HTTP 404 + `.03`
- **Ref**: entity `material_group.parent_id` (scalar FK ADR-009) §5.1, BR-CAT-GRP-006 §9, endpoint V2-1 §6.1

### Cluster B — Permission & Tenant scope

#### AC-7 → N/A (UI-only)

Source AC-7 là nút thao tác per-row (xem chi tiết / sửa / xóa) — thuộc FE/Mobile tier render. BE cung cấp endpoint riêng cho từng action (FEAT-CAT-GRP-DETAIL V2-3, FEAT-CAT-GRP-EDIT V2-5, FEAT-CAT-GRP-DELETE V2-6). BE không touch. Xem `fe-web/FEAT-CAT-GRP-LIST.md §3 AC-7` và `mobile/FEAT-CAT-GRP-LIST.md §3 AC-7`.

#### AC-8 → N/A (UI-only)

Source AC-8 là nút mở form thêm nhóm mới — thuộc FE/Mobile navigation. Endpoint tạo nhóm thuộc scope FEAT-CAT-GRP-CREATE (`POST /api/v2/material-groups`). BE không touch trong feature này. Xem `fe-web/FEAT-CAT-GRP-LIST.md §3 AC-8`.

#### AC-9 → Enforce RBAC tại endpoint V2-1

- **Khi**: Mọi request đến `POST /api/v2/material-groups/search`
- **BE phải**: Validate JWT bearer; resolve role từ JWT claims; chỉ allow `garage-owner` và `accountant` (Critical Rule #6 dual-persona only); reject nếu token missing → 401; token valid nhưng role không match → 403
- **Output**: Authorized request tiếp tục; unauthorized → HTTP 401 + `.02` hoặc 403 + `.04`
- **Failure mode**: Token invalid/expired → 401; role không phải garage-owner hoặc accountant → 403
- **Ref**: Critical Rule #6, §4.2

#### AC-10 → Tenant isolation tại query layer

- **Khi**: Mọi request đến endpoint search, bất kể filter nào
- **BE phải**: `TenantContext` inject `AND tenant_id = :currentTenantId` vào mọi Specification; không bao giờ query cross-tenant; `X-Tenant-Id` header resolve tenant qua `TenantFilter`
- **Output**: Paginated result chỉ chứa data của tenant hiện tại; tenant khác không leak dù không có 404
- **Failure mode**: `X-Tenant-Id` missing → HTTP 401 + `.02`; `OriginTenantId` mismatch → reject (Critical Rule #4)
- **Ref**: Critical Rule #4, §4.2

#### AC-11 → Endpoint phục vụ cả web và mobile không phân biệt platform

- **Khi**: BFF web (`agg-garage-graph` web resolver) và BFF mobile gọi cùng endpoint V2-1
- **BE phải**: Không có platform-specific logic; 1 endpoint trả 1 response shape cho cả hai
- **Output**: Cùng `Page<MaterialGroupSearchResponse>` shape; BFF tự map sang GraphQL type phù hợp platform
- **Failure mode**: N/A (no platform-specific failure at BE layer)
- **Ref**: PKG §1 scope — "đầy đủ trên web + mobile"

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-GRP-013** (NORMAL): Keyword OR-match trên `code` và `name` (xác nhận số cột — xem NEED CONFIRMATION #1) — enforce tại `app/service/MaterialGroupService.java::buildSearchSpec()` trong Specification builder. Vi phạm (bỏ sót cột) → data quality gap, kết quả tìm kiếm thiếu.
- **BR-CAT-GRP-006** (NORMAL): `parentId` filter phải validate parent tồn tại trong cùng tenant — enforce tại `app/service/MaterialGroupService.java::validateParentExists()`. Vi phạm → HTTP 404 + `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.03`.
- **BR-CAT-GRP-005** (NORMAL): Giới hạn 1000 nodes/tenant áp dụng cho V2-2 (tree endpoint) — **KHÔNG áp cho V2-1** (flat list có phân trang không bị giới hạn node count). V2-2 là additive future endpoint, ngoài scope FEAT-CAT-GRP-LIST.

### 4.2 Tenant + auth

- Mọi query có điều kiện `tenant_id = TenantContext.current()` — không có exception (Critical Rule #4).
- `TenantFilter` tự động inject condition qua JPA Filter hoặc Specification; KHÔNG hardcode `tenantId` từ path param.
- Chỉ `garage-owner` và `accountant` được access (Critical Rule #6 dual-persona).
- JWT bearer bắt buộc; `X-Tenant-Id` header resolve tenant.
- `OriginTenantId` (nếu present) phải match `data.tenantId` — violation = data breach.

### 4.3 Idempotency + concurrency

- `POST /api/v2/material-groups/search` là read-only — idempotent tự nhiên; không cần `Idempotency-Key` header.
- Không có optimistic locking (không modify state).
- Consistent ordering: client phải giữ cùng `sort` param giữa các page để pagination ổn định.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.01` | 400 | AC-1, AC-5 | TOAST — body/enum không hợp lệ |
| `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.02` | 401 | AC-9, AC-10 | REDIRECT_LOGIN |
| `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.03` | 404 | AC-6 | TOAST — parentId không tồn tại hoặc không thuộc tenant |
| `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.04` | 403 | AC-9 | EMPTY_STATE — role không đủ quyền |
| `GMS.gf-inventory.MATERIAL_GROUP_SEARCH.06` | 500 | AC-1 | TOAST — lỗi xử lý nội bộ |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> `material_group` entity đã tạo bởi scope FEAT-CAT-GRP-CREATE (migration `V20260624010000__create_material_group.sql`). FEAT-CAT-GRP-LIST **không thêm column mới** — chỉ đọc entity hiện hữu.

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `material_group` | `id` | `UUID PK` | N | `gen_random_uuid()` | Flyway V20260624010000 (FEAT-CAT-GRP-CREATE) | — | AC-1 | PK |
| `material_group` | `tenant_id` | `UUID NOT NULL` | N | — | Flyway V20260624010000 | Critical Rule #4 | AC-10 | Tenant isolation — inject by TenantFilter |
| `material_group` | `code` | `VARCHAR(50) NOT NULL` | N | — | Flyway V20260624010000 | BR-CAT-GRP-013 | AC-2, AC-4 | Searchable keyword col #1; unique per tenant |
| `material_group` | `name` | `VARCHAR(255) NOT NULL` | N | — | Flyway V20260624010000 | BR-CAT-GRP-013 | AC-2, AC-4 | Searchable keyword col #2 |
| `material_group` | `description` | `VARCHAR(255)` | Y | NULL | Flyway V20260624010000 | — | AC-2 | Optional; possible keyword col #3 — NEED CONFIRMATION #1 |
| `material_group` | `parent_id` | `UUID` | Y | NULL | Flyway V20260624010000 | ADR-009 | AC-3, AC-6 | Scalar self-FK; KHÔNG `@ManyToOne`; NULL = root |
| `material_group` | `status` | `ENUM(ACTIVE, INACTIVE)` | N | `ACTIVE` | Flyway V20260624010000 | BR-CAT-GRP-007 | AC-5 | Lọc trạng thái |
| `material_group` | `created_at` | `TIMESTAMP NOT NULL` | N | `now()` | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-2 | Audit |
| `material_group` | `created_by` | `VARCHAR NOT NULL` | N | — | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-2 | Audit |
| `material_group` | `updated_at` | `TIMESTAMP NOT NULL` | N | `now()` | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-2 | Audit |
| `material_group` | `updated_by` | `VARCHAR NOT NULL` | N | — | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-2 | Audit |

### 5.2 Index / constraint changes

> Không có index mới cho FEAT-CAT-GRP-LIST — indexes đã tạo bởi FEAT-CAT-GRP-CREATE. Liệt kê để DEV biết query plan.

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `material_group` | `uq_material_group_tenant_code` | `(tenant_id, code)` | UNIQUE | Enforce uniqueness BR-CAT-GRP-001; secondary search index | ADR-017 |
| `material_group` | `idx_material_group_tenant_parent` | `(tenant_id, parent_id)` | btree | Tối ưu filter AC-6 + flat-grouped-by-parent sort ordering | ADR-009 |
| `material_group` | `idx_material_group_tenant_status` | `(tenant_id, status)` | btree | Tối ưu filter AC-5 | ADR-017 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/material-groups/search` | JWT bearer | `MaterialGroupSearchInput` | `Page<MaterialGroupSearchResponse>` | safe (read-only) | AC-1..AC-6, AC-9..AC-11 | — |

**`MaterialGroupSearchInput`** (request body):
```json
{
  "keyword": "string? — OR-match code/name (BR-CAT-GRP-013); NEED CONFIRMATION #1 nếu có cột thứ 3",
  "parentId": "UUID? — filter direct children; validate existence AC-6",
  "status": "ACTIVE | INACTIVE | null — null = no filter (AC-5)",
  "page": "int — default 0",
  "size": "int — default 20, max 50",
  "sort": "string? — default = flat-grouped-by-parent (AC-3)"
}
```

**`MaterialGroupSearchResponse`** (per item trong `content[]`):
```json
{
  "id": "UUID",
  "code": "string",
  "name": "string",
  "description": "string | null",
  "parentId": "UUID | null",
  "parentCode": "string | null",
  "parentName": "string | null",
  "status": "ACTIVE | INACTIVE",
  "level": "int — 0=root, 1=child, ... (computed from parent_id depth)",
  "createdAt": "ISO8601",
  "createdBy": "string",
  "updatedAt": "ISO8601",
  "updatedBy": "string"
}
```

**Response envelope (Spring Pageable)**:
```json
{
  "content": [ /* MaterialGroupSearchResponse[] */ ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 100,
    "totalPages": 5
  }
}
```

### 6.2 Modified REST endpoints (additive)

> Không có endpoint hiện hữu nào bị modify bởi FEAT-CAT-GRP-LIST.

### 6.3 Kafka topics (publish/consume)

> Không có Kafka event — feature là read-only query, không trigger state change.

### 6.4 Cross-boundary REST consumers

> Không có cross-boundary REST call từ phía gf-inventory cho feature này. `agg-garage-graph` (BFF) gọi vào gf-inventory endpoint V2-1 theo chiều inbound.

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-GRP-LIST.md`) wrap `POST /api/v2/material-groups/search` thành GraphQL query operation `materialGroupSearch(input: MaterialGroupSearchInput!): MaterialGroupSearchPage`. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (Critical Rule #11 + #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroup.java` | READ | existing entity (FEAT-CAT-GRP-CREATE) | 0 | AC-1..AC-6 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroupSearchInput.java` | NEW | input DTO | ~30 | AC-1, AC-4..AC-6 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroupSearchResponse.java` | NEW | response DTO | ~40 | AC-2, AC-3 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/MaterialGroupRepository.java` | ADDITIVE | extend interface: add `findAll(Specification, Pageable)` | ~15 | AC-3..AC-6 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/MaterialGroupService.java` | ADDITIVE | add `search(MaterialGroupSearchInput, tenantId)` + Specification builder + `validateParentExists()` | ~90 | AC-1..AC-6, AC-10 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/MaterialGroupController.java` | ADDITIVE | add `POST /api/v2/material-groups/search` handler; RBAC annotation | ~35 | AC-1, AC-9 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/MaterialGroupJpaRepository.java` | ADDITIVE | extend `JpaSpecificationExecutor<MaterialGroup>` | ~5 | AC-3..AC-6 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/MaterialGroupServiceSearchTest.java` | NEW | unit test: keyword/status/parentId/sort combinations + tenant isolation | ~130 | AC-4..AC-6, AC-10 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/MaterialGroupSearchContractTest.java` | NEW | contract test V2-1: happy path + 400/401/403/404 cases | ~90 | AC-1, AC-9 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Verify entity MaterialGroup tồn tại (migration V20260624010000 — FEAT-CAT-GRP-CREATE)
    Entry: FEAT-CAT-GRP-CREATE branch staged hoặc migration deployed
    Exit: Flyway schema_history có entry V20260624010000; MaterialGroup.java compile
    └─► S2

S2  DTO + Repository + Specification
    Entry: S1
    Exit: MaterialGroupSearchInput + MaterialGroupSearchResponse compile; JpaRepository extend JpaSpecificationExecutor; unit test ≥6 green (keyword/status/parentId/tenant isolation filter)
    └─► S3

S3  Service search logic + flat-grouped-by-parent ordering
    Entry: S2
    Exit: MaterialGroupService.search() với toàn bộ filter combinations pass unit test; ORDER BY flat-grouped-by-parent verified; validateParentExists() tested (valid/invalid/cross-tenant)
    └─► S4

S4  REST controller + contract test + RBAC
    Entry: S3
    Exit: MaterialGroupController POST /api/v2/material-groups/search contract test green; RBAC 401/403 pass; Pageable envelope shape correct
    └─► (hand-off BFF tier S5 — wrap thành GraphQL op)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify migration entity | db/migration | FEAT-CAT-GRP-CREATE migration staged | `material_group` table + MaterialGroup.java exist | — |
| S2 | DTO + Repository + Specification | domain + adapter/persistence | S1 | Unit test ≥6 green | S1 |
| S3 | Service search logic + ordering | app/service | S2 | Unit test filter + sort green | S2 |
| S4 | REST controller + contract test | adapter/controller | S3 | Contract + RBAC test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-CAT-GRP-013` | NORMAL | service (Specification builder) | `app/service/MaterialGroupService.java::buildSearchSpec()` | AC-4 | `TC-BR-gf-inventory-GRP013-*` |
| `BR-CAT-GRP-006` | NORMAL | service (parent validation) | `app/service/MaterialGroupService.java::validateParentExists()` | AC-6 | `TC-BR-gf-inventory-GRP006-*` |
| `BR-CAT-GRP-005` | NORMAL | N/A cho V2-1 (flat list paginated); áp cho V2-2 tree — additive future | — | — | — |

> Critical Rules #4 (tenant isolation) + #6 (dual persona) không có BR-ID riêng — enforce tại framework layer (`TenantFilter`) và controller RBAC annotation.

> **Enforcement layer priority** (rules-backend): Primary phải ở `domain/` hoặc `app/service/`; UI/client-side enforcement → đó là FE/Mobile tier secondary.

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (happy path + empty result) | test-api | Verify Spring Pageable envelope shape; `totalElements=0` case |
| AC-2 | API contract (response fields) | test-api | Assert mọi field MaterialGroupSearchResponse populated; `parentName` từ self-join |
| AC-3 | Unit (sort ordering) | test-api | Siblings cùng `parent_id` liền kề trong result; root trước children |
| AC-4 | Unit (keyword filter) | test-api | OR-match code/name; case-insensitive; zero-result case |
| AC-5 | Unit (status filter) | test-api | ACTIVE-only / INACTIVE-only / null = all |
| AC-6 | Unit (parentId filter) + API contract (404) | test-api | Valid parentId → direct children only; parentId không tồn tại → 404 `.03`; cross-tenant parentId → 404 |
| AC-7 | N/A (UI-only) | — | — |
| AC-8 | N/A (UI-only) | — | — |
| AC-9 | Isolation (RBAC) | test-isolation | Missing JWT → 401; wrong role → 403; garage-owner + accountant → 200 |
| AC-10 | Isolation (tenant) | test-isolation | Cross-tenant data không leak; `tenant_id` condition mandatory |
| AC-11 | N/A (platform-agnostic at BE) | — | 1 endpoint phục vụ cả 2 platform; BFF orchestrates |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-LIST.md` | DRAFT (pending) | Wrap V2-1 → GraphQL query `materialGroupSearch`; handle parentId dropdown lookup |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-LIST.md` | DRAFT (pending) | Render flat table; cột "Thuộc nhóm" từ `parentName`; filter UI |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-LIST.md` | DRAFT (pending) | Flutter list screen; consume BFF op `materialGroupSearch` |

**Source ID consistency** (reviewer item #18): tất cả tier file có cùng `source_feat_sha = cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) v6
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-1..V2-2
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`Execution/work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Additive aggregates — `material_group` entity strategy
- **ADR-009**: JPA no relationship mapping — scalar FK policy

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho FEAT-CAT-GRP-LIST W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier 3 dòng), §2 trách nhiệm BE gf-inventory, §3 BE behaviour map 11 AC-IDs (AC-7/AC-8 N/A UI-only; AC-11 N/A platform-agnostic at BE), §4 ràng buộc + error code, §5 schema reference — không migration mới (entity tạo bởi FEAT-CAT-GRP-CREATE), §6 V2-1 search endpoint contract + request/response shape, §7 Hexagonal file map, §8 sequence DAG S1→S4, §9 BR primary (GRP-013/GRP-006/GRP-005 scope note), §10 test scope, §11 cross-tier pair. 1 NEED CONFIRMATION (#1 — số cột keyword OR-match 2 vs 3). |
