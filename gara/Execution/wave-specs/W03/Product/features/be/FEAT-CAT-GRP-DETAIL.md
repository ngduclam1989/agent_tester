---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-GRP-DETAIL.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DETAIL"
source_feat_sha: "d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2"
generated_at: "2026-06-29T14:50:00+00:00"
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
demo_signature: "Chủ garage / kế toán gọi GET /api/v2/material-groups/{id} → nhận đầy đủ thông tin nhóm VTHH kèm audit trail (created/updated_at/by)."
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-GRP-DETAIL"]
paired_fe_web_feats: ["FEAT-CAT-GRP-DETAIL"]
paired_mobile_feats: ["FEAT-CAT-GRP-DETAIL"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DETAIL.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-DETAIL (BE): Xem chi tiết nhóm vật tư hàng hóa

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DETAIL` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `agg-garage-graph` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage / kế toán gọi GET /api/v2/material-groups/{id} → nhận đầy đủ thông tin nhóm VTHH kèm audit trail (created/updated_at/by). |
| Cross-tier pair | BFF: FEAT-CAT-GRP-DETAIL \| Web: FEAT-CAT-GRP-DETAIL \| Mobile: FEAT-CAT-GRP-DETAIL |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) |
| Source version | v4 |
| Source SHA | `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` |
| Generated at | 2026-06-29T14:50:00+00:00 |

## 1. Mục đích nghiệp vụ

Feature cung cấp khả năng tra cứu toàn bộ thông tin của một nhóm vật tư hàng hóa (MaterialGroup) trong danh mục kho, bao gồm thông tin mô tả, trạng thái, cấu trúc phân cấp, và lịch sử tạo/cập nhật (audit trail). Chủ garage và kế toán cần thấy đầy đủ nội dung nhóm trước khi quyết định chỉnh sửa hoặc xóa, giảm rủi ro thao tác nhầm. Feature này là điểm đọc trung tâm trong luồng CRUD nhóm VTHH của EP-INVENTORY-CATALOG, phục vụ nền dữ liệu vật tư chuẩn hóa cho toàn bộ nghiệp vụ kho V2 downstream.

## 2. Trách nhiệm backend (gf-inventory)

- Expose endpoint `GET /api/v2/material-groups/{id}` (V2-3) trả đầy đủ scalar fields + audit fields của entity `material_group` thuộc tenant hiện tại.
- Enforce TenantFilter: chỉ trả record thuộc `tenant_id` resolve từ JWT — cross-tenant fetch trả 404.
- Enforce BR-CAT-CMN-002: audit fields `created_at`, `created_by`, `updated_at`, `updated_by` phải có mặt trong response (không được omit).
- Enforce BR-CAT-GRP-006: NEED CONFIRMATION — bundle không extract nội dung rule đầy đủ; theo pattern GRP feature set, rule này có thể ràng buộc hiển thị parent group context (parentCode/parentName). Xem `Product/business-rules/BR-GF-INVENTORY-CATALOG.md §BR-CAT-GRP-006` trước khi impl.
- Endpoint read-only — không sinh Kafka event, không cross-boundary call, không Flyway migration riêng (schema `material_group` được tạo bởi FEAT-CAT-GRP-CREATE migration V20260624010000).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Query & response (AC-1, AC-2, AC-3)

#### AC-1 → BE resolve và trả detail khi nhận GET request

- **Khi**: BFF (`agg-garage-graph`) gọi `GET /api/v2/material-groups/{id}` với JWT header hợp lệ.
- **BE phải**: extract `tenantId` từ JWT qua `TenantContext` → execute query `SELECT * FROM material_group WHERE id = :id AND tenant_id = :tenantId AND deleted = false` (hoặc tương đương per entity pattern).
- **Output**: HTTP 200 + `MaterialGroupDetailResponse` body nếu tìm thấy; HTTP 404 + error code `GMS.gf-inventory.MATERIAL_GROUP_READ.03` nếu `id` không tồn tại hoặc thuộc tenant khác.
- **Failure mode**: 404 trả về cùng shape cho cả "không tồn tại" và "sai tenant" để tránh data leak.
- **Ref**: entity `material_group` §5.1, endpoint V2-3 §6.1.

#### AC-2 → BE map đầy đủ descriptive fields vào response

- **Khi**: query AC-1 thành công.
- **BE phải**: map từ entity sang `MaterialGroupDetailResponse`: `id`, `code`, `name`, `description`, `status` (enum `ACTIVE/INACTIVE`), `parentId` (nullable UUID), `parentCode` (nullable, denormalize từ parent record nếu `parentId != null`), `parentName` (nullable, denormalize tương tự), `level` (nếu entity lưu).
- **Output**: response body chứa đủ các trường trên — không omit field nào dù null.
- **Failure mode**: N/A (structural — data integrity đảm bảo bởi migration constraint `NOT NULL` trên required cols).
- **Ref**: entity `material_group` §5.1, KG ADR-017 schema definition.

#### AC-3 → BE include audit fields (BR-CAT-CMN-002)

- **Khi**: query AC-1 thành công.
- **BE phải**: append audit block vào response: `createdAt` (ISO8601), `createdBy` (username string), `updatedAt` (ISO8601), `updatedBy` (username string) — map từ audit cols `created_at/by`, `updated_at/by` trên `material_group`.
- **Output**: response có `auditInfo { createdAt, createdBy, updatedAt, updatedBy }` hoặc flat fields tùy convention boundary (align với pattern `gf-inventory` existing endpoints).
- **Failure mode**: N/A.
- **Ref**: BR-CAT-CMN-002 §9.

### Cluster B — Navigation (AC-4, AC-5)

#### AC-4 → N/A (UI-only)

- Chuyển sang màn chỉnh sửa là navigation action thuộc FE/Mobile tier. BE không touch. Xem `fe-web/FEAT-CAT-GRP-DETAIL.md §3 AC-4` và `mobile/FEAT-CAT-GRP-DETAIL.md §3 AC-4`.

#### AC-5 → N/A (UI-only)

- Quay lại danh sách là navigation action thuộc FE/Mobile tier. BE không touch. Xem `fe-web/FEAT-CAT-GRP-DETAIL.md §3 AC-5` và `mobile/FEAT-CAT-GRP-DETAIL.md §3 AC-5`.

### Cluster C — Authorization (AC-6)

#### AC-6 → BE enforce tenant isolation + role authorization

- **Khi**: bất kỳ request nào đến endpoint V2-3.
- **BE phải**: (a) validate JWT → 401 nếu token thiếu/expired (`GMS.gf-inventory.MATERIAL_GROUP_READ.02`); (b) `TenantFilter` enforce `tenant_id` từ JWT — cross-tenant trả 404 (không expose 403 để tránh enumeration); (c) cả hai role `garage-owner` và `accountant` được phép xem — không có role restriction riêng cho read.
- **Output**: 401 nếu unauthenticated; 404 nếu cross-tenant; 200 nếu authorized + found.
- **Failure mode**: fail-closed — missing/invalid token → 401 (không fallback anonymous).
- **Ref**: Critical Rule #4 (tenant isolation), Critical Rule #6 (dual persona).

### Cluster D — Platform scope (AC-7)

#### AC-7 → BE trả response nhất quán cho cả web và mobile consumer

- **Khi**: BFF `agg-garage-graph` gọi endpoint V2-3 từ GraphQL resolver phục vụ web hoặc mobile.
- **BE phải**: không có platform-specific branching trong response — cùng `MaterialGroupDetailResponse` shape cho mọi caller; platform differentiation là trách nhiệm BFF/FE/Mobile tier.
- **Output**: single stable response contract.
- **Failure mode**: N/A.
- **Ref**: paired tier files §11.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-CMN-002** (NORMAL): audit fields `created_at/by`, `updated_at/by` phải xuất hiện trong mọi detail response của danh mục — enforce tại `app/service` (service layer map audit cols, không được drop). Vi phạm → response thiếu field → AC-3 FAIL.
- **BR-CAT-GRP-006** (NEED CONFIRMATION — severity unknown): theo bundle §D, rule này được cite trong source FEAT. Đọc `Product/business-rules/BR-GF-INVENTORY-CATALOG.md §BR-CAT-GRP-006` để xác định enforcement layer trước impl.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `TenantContext.getTenantId()` phải match `material_group.tenant_id` của record được truy xuất (Critical Rule #4).
- Endpoint `/api/v2/material-groups/{id}` yêu cầu JWT — scope: cả `garage-owner` và `accountant`.
- Cross-tenant 404 (không 403) để tránh resource enumeration.

### 4.3 Idempotency + concurrency

- Endpoint GET read-only — idempotency-key không áp dụng (safe method).
- Không cần optimistic locking cho read path.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `GMS.gf-inventory.MATERIAL_GROUP_READ.02` | 401 | AC-6 | REDIRECT_LOGIN |
| `GMS.gf-inventory.MATERIAL_GROUP_READ.03` | 404 | AC-1, AC-6 | EMPTY_STATE / TOAST |
| `GMS.gf-inventory.MATERIAL_GROUP_READ.06` | 500 | AC-1 | TOAST (generic) |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> FEAT-CAT-GRP-DETAIL là read-only feature — không có schema delta riêng. Bảng `material_group` được tạo bởi FEAT-CAT-GRP-CREATE via Flyway `V20260624010000__create_material_group.sql` (ADR-017). Agent BE phải đảm bảo migration đó đã applied trước khi impl endpoint này.

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `material_group` | `id` | `UUID` | N | gen_random_uuid() | Flyway V20260624010000 (FEAT-CAT-GRP-CREATE) | — | AC-1 | PK |
| `material_group` | `code` | `VARCHAR(50)` | N | — | Flyway V20260624010000 | — | AC-2 | Unique (tenant_id, code) |
| `material_group` | `name` | `VARCHAR(255)` | N | — | Flyway V20260624010000 | — | AC-2 | |
| `material_group` | `description` | `VARCHAR(255)` | Y | NULL | Flyway V20260624010000 | — | AC-2 | |
| `material_group` | `status` | `VARCHAR(20) ENUM` | N | `ACTIVE` | Flyway V20260624010000 | — | AC-2 | ACTIVE/INACTIVE |
| `material_group` | `parent_id` | `UUID` | Y | NULL | Flyway V20260624010000 | BR-CAT-GRP-006 | AC-2 | Scalar self-FK ADR-009 |
| `material_group` | `tenant_id` | `VARCHAR(50)` | N | — | Flyway V20260624010000 | — | AC-6 | TenantFilter scope |
| `material_group` | `created_at` | `TIMESTAMP` | N | NOW() | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-3 | Audit col |
| `material_group` | `created_by` | `VARCHAR(255)` | N | — | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-3 | Audit col |
| `material_group` | `updated_at` | `TIMESTAMP` | N | NOW() | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-3 | Audit col |
| `material_group` | `updated_by` | `VARCHAR(255)` | N | — | Flyway V20260624010000 | BR-CAT-CMN-002 | AC-3 | Audit col |

### 5.2 Index / constraint changes

> Không có index mới cho FEAT-CAT-GRP-DETAIL. Index `(tenant_id, id)` và unique `(tenant_id, code)` đã được tạo bởi V20260624010000 (FEAT-CAT-GRP-CREATE scope).

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `material_group` | `idx_material_group_tenant_id` | `(tenant_id, id)` | btree | Tenant-scoped lookup by PK (GET detail) | ADR-009 |

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

> Endpoint này mới hoàn toàn (catalog-v2 subsystem theo ADR-017). KHÔNG có endpoint đối ứng trong baseline `/api/v1/`.

| Method | Path | Auth | Request | Response body | Idempotency | AC ref | BR ref |
|---|---|---|---|---|---|---|---|
| `GET` | `/api/v2/material-groups/{id}` | JWT Bearer | path: `id` (UUID) | `MaterialGroupDetailResponse` — xem schema dưới | safe (read) | AC-1, AC-2, AC-3 | BR-CAT-CMN-002 |

**Response schema `MaterialGroupDetailResponse`**:

```json
{
  "id": "uuid",
  "code": "string",
  "name": "string",
  "description": "string | null",
  "status": "ACTIVE | INACTIVE",
  "parentId": "uuid | null",
  "parentCode": "string | null",
  "parentName": "string | null",
  "createdAt": "ISO8601",
  "createdBy": "string",
  "updatedAt": "ISO8601",
  "updatedBy": "string"
}
```

> `parentCode` và `parentName` được denormalize tại service layer (1 extra query hoặc JOIN) khi `parentId != null`. KHÔNG để BFF tự resolve parent — data đã có trong cùng boundary.

**Error codes (V2-3)**:

| Code | HTTP | Condition |
|---|---|---|
| `GMS.gf-inventory.MATERIAL_GROUP_READ.02` | 401 | JWT thiếu hoặc hết hạn |
| `GMS.gf-inventory.MATERIAL_GROUP_READ.03` | 404 | id không tồn tại hoặc cross-tenant |
| `GMS.gf-inventory.MATERIAL_GROUP_READ.06` | 500 | Lỗi xử lý nội bộ |

### 6.2 Modified REST endpoints (additive)

> Không có — FEAT-CAT-GRP-DETAIL không sửa endpoint nào đã tồn tại.

### 6.3 Kafka topics

> Không có — endpoint read-only, không publish/consume event.

### 6.4 Cross-boundary REST consumers

> Endpoint V2-3 được consume bởi `agg-garage-graph` (BFF) qua GraphQL resolver. Không có cross-boundary call từ phía gf-inventory.

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /api/v2/material-groups/{id}` | `agg-garage-graph` | GraphQL query `materialGroupDetail` | BFF trả GraphQL error → FE/Mobile EMPTY_STATE | sync, fail fast (no retry — read idempotent) |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-GRP-DETAIL.md`) wrap endpoint này thành GraphQL query op.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (boundary isolation Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/MaterialGroup.java` | READ (no change) | existing entity từ FEAT-CAT-GRP-CREATE | 0 | AC-1 |
| `domain/repository` | `src/main/java/.../domain/repository/MaterialGroupRepository.java` | ADDITIVE | new finder `findByIdAndTenantId()` nếu chưa có | ~5 | AC-1, AC-6 |
| `app/service` | `src/main/java/.../app/service/MaterialGroupService.java` | ADDITIVE | method `getDetail(id, tenantId)` — resolve parent denorm | ~40 | AC-1, AC-2, AC-3 |
| `app/dto` | `src/main/java/.../app/dto/MaterialGroupDetailResponse.java` | NEW | new DTO class | ~30 | AC-2, AC-3 |
| `adapter/controller` | `src/main/java/.../adapter/controller/MaterialGroupController.java` | ADDITIVE | new GET handler | ~20 | AC-1, AC-6 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/MaterialGroupJpaRepository.java` | ADDITIVE | `findByIdAndTenantId()` Spring Data method | ~5 | AC-1 |
| `test/unit` | `src/test/java/.../app/service/MaterialGroupServiceTest.java` | ADDITIVE | test cases: found / not-found / cross-tenant / audit-fields | ~80 | AC-1, AC-2, AC-3, AC-6 |
| `test/contract` | `src/test/java/.../adapter/controller/MaterialGroupControllerTest.java` | ADDITIVE | contract tests GET /api/v2/material-groups/{id} | ~50 | AC-1, AC-6 |

## 8. Implementation sequence DAG (BE — S1→S4)

> Schema tạo bởi FEAT-CAT-GRP-CREATE (V20260624010000) — S1 là verify migration applied, không tạo mới.

```
S1  Verify schema (material_group table exists)
    Entry: FEAT-CAT-GRP-CREATE migration applied
    Exit: table + index verify pass
    └─► S2

S2  Repository + Service logic
    Entry: S1
    Exit: unit tests ≥6 green (found / not-found / cross-tenant / audit-fields / parent-denorm / no-parent)
    └─► S3

S3  REST adapter (GET handler + DTO mapping)
    Entry: S2
    Exit: contract test green (200 / 401 / 404 shape)
    └─► S4

S4  Integration test
    Entry: S3
    Exit: integ test green (real DB + TenantFilter end-to-end)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify migration applied | db/migration | FEAT-CAT-GRP-CREATE done | Schema smoke pass | FEAT-CAT-GRP-CREATE S1 |
| S2 | Repository finder + Service getDetail | domain + app | S1 | Unit test ≥6 green | S1 |
| S3 | REST GET adapter + DTO | adapter/controller + app/dto | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-CAT-CMN-002` | NORMAL | service (primary) | `app/service/MaterialGroupService.java::getDetail()` | AC-3 | `TC-BR-gf-inventory-CMN-002-*` |
| `BR-CAT-GRP-006` | NEED CONFIRMATION | TBD | Xác định sau khi đọc BR file đầy đủ | AC-2 (parent context) | `TC-BR-gf-inventory-GRP-006-*` |

> **Enforcement layer priority**: primary tại `app/service` — KHÔNG thả audit field mapping xuống controller. BFF/FE/Mobile chỉ secondary (display hint).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (happy path) | test-api | GET 200 với valid id + valid JWT |
| AC-1 | API contract (not-found) | test-api | GET 404 với id không tồn tại |
| AC-2 | API contract (field completeness) | test-api | Assert tất cả descriptive fields có mặt trong response |
| AC-3 | API contract (audit fields) | test-api | Assert `createdAt/By`, `updatedAt/By` không null |
| AC-6 | API contract (unauthorized) | test-api | GET 401 khi thiếu JWT |
| AC-6 | Isolation (cross-tenant) | test-isolation | GET 404 khi id tồn tại nhưng thuộc tenant khác |
| AC-7 | API contract | test-api | Cùng response shape được BFF gọi từ cả web và mobile resolver |

> AC-4, AC-5: UI-only — test thuộc FE/Mobile tier.

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DETAIL.md` | PENDING | Resolver wrap V2-3 → GraphQL query `materialGroupDetail` |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DETAIL.md` | PENDING | Detail screen consume BFF GraphQL query; navigation AC-4/AC-5 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DETAIL.md` | PENDING | Flutter detail screen; navigation AC-4/AC-5; Bloc state |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) v4
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) (BR-CAT-CMN-002, BR-CAT-GRP-006)
- **HLD**: `Architecture/hld/gf-inventory-HLD.md`
- **API contract**: `Architecture/api/gf-inventory-api.md` §4 (V2-3)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: `Execution/wave-specs/W03/work-packages/PKG-W03-inventory-catalog.md` §2.2.1
- **ADR-017**: catalog-v2 additive aggregates (MaterialGroup entity definition)
- **ADR-009**: JPA no relationship mapping (scalar FK `parent_id`)
- **Fan-out map**: `Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`
- **Bundle**: `/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DETAIL.be.md`

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-GRP-DETAIL` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map (7 AC — AC-4/AC-5 N/A UI-only, AC-7 platform scope BE perspective), §4 ràng buộc, §5 schema reference (no new migration — depends on FEAT-CAT-GRP-CREATE), §6 REST V2-3 GET detail, §7 Hexagonal file map, §8 S1-S4 DAG, §9 BR primary (BR-CAT-CMN-002; BR-CAT-GRP-006 NEED CONFIRMATION), §10 test scope, §11 cross-tier pair. |
