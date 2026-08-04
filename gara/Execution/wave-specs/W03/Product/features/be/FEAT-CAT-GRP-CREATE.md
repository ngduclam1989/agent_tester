---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-GRP-CREATE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-CREATE"
source_feat_sha: "183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4"
generated_at: "2026-06-29T14:36:41+00:00"
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
demo_signature: "POST /api/v2/material-groups tạo nhóm vật tư mới, trả 201 + entity; trùng mã trả ERR-INV-002."
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-GRP-CREATE"]
paired_fe_web_feats: ["FEAT-CAT-GRP-CREATE"]
paired_mobile_feats: ["FEAT-CAT-GRP-CREATE"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da30d40bb271c9bf87e13a0da4ba1614d00a9f7b4ec180956a821c4100"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-CREATE.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-CREATE (BE): Tạo nhóm vật tư hàng hóa

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | POST /api/v2/material-groups tạo nhóm vật tư mới, trả 201 + entity; trùng mã trả ERR-INV-002. |
| Cross-tier pair | BFF: FEAT-CAT-GRP-CREATE \| Web: FEAT-CAT-GRP-CREATE \| Mobile: FEAT-CAT-GRP-CREATE |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) |
| Source version | v4 |
| Source SHA | `183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xây dựng cấu trúc phân loại vật tư hàng hóa phân cấp trước khi sử dụng danh mục mã sản phẩm nội bộ. Feature cho phép tạo mới một nhóm vật tư với mã định danh nội bộ, tên hiển thị, nhóm cha tùy chọn và mô tả. Nhóm vật tư sau khi tạo là điều kiện tiên quyết để gán mã SP nội bộ và là nền dữ liệu phân loại cho toàn bộ nghiệp vụ kho V2 (nhập/xuất/tồn/tính giá).

## 2. Trách nhiệm backend (gf-inventory)

- Expose `POST /api/v2/material-groups` nhận yêu cầu tạo nhóm vật tư, trả 201 + entity đã persist.
- Validate toàn bộ dữ liệu đầu vào: code regex không ký tự đặc biệt, name bắt buộc, description ≤ 255 ký tự, parentId tồn tại và ACTIVE trong cùng tenant.
- Enforce unique `(tenant_id, code)` tại DB constraint + service layer; trả ERR-INV-002 trên xung đột.
- Persist entity `material_group` mới vào schema `dev_gf_inventory`; status mặc định ACTIVE khi client không cung cấp.
- Là primary SSOT cho BR-CAT-GRP-001, BR-CAT-GRP-002, BR-CAT-GRP-003, BR-CAT-GRP-006, BR-CAT-GRP-012.
- Migration additive Flyway `V20260624010000__create_material_group.sql` — gf-inventory dùng Flyway (KHÔNG ddl-auto, KHÔNG rewrite migration cũ).
- Không phát Kafka event; không gọi boundary ngoài.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Validate đầu vào

#### AC-1 → N/A (UI-only)

Source AC này mô tả hành vi mở form trên giao diện. BE không touch. Xem `fe-web/FEAT-CAT-GRP-CREATE.md §3 AC-1` và `mobile/FEAT-CAT-GRP-CREATE.md §3 AC-1`.

#### AC-2 → Enforce code format tại service layer

- **Khi**: `POST /api/v2/material-groups` nhận body field `code`.
- **BE phải**: reject nếu `code` null, blank, hoặc chứa bất kỳ ký tự trong tập `~!@#$%^&*`. Áp dụng regex whitelist phủ nhận ký tự đặc biệt này tại `MaterialGroupValidator`.
- **Output**: HTTP 400 + `ERR-INV-001` nếu vi phạm.
- **Failure mode**: trả lỗi sớm (fail-fast) trước khi bất kỳ DB operation nào chạy.
- **Ref**: BR-CAT-GRP-001 (§9), entity `material_group.code VARCHAR(50)` (§5.1), endpoint `POST /api/v2/material-groups` (§6.1).

#### AC-3 → Enforce name bắt buộc

- **Khi**: `POST /api/v2/material-groups` nhận body field `name`.
- **BE phải**: reject nếu `name` null hoặc blank (sau trim).
- **Output**: HTTP 400 + generic validation error (field `name` required).
- **Failure mode**: fail-fast cùng batch với AC-2 nếu dùng `@Valid` bean validation.
- **Ref**: BR-CAT-GRP-002 (§9), entity `material_group.name VARCHAR(255)` (§5.1).

#### AC-4 → Validate parentId tồn tại và ACTIVE

- **Khi**: `POST /api/v2/material-groups` nhận body field `parentId` (optional UUID).
- **BE phải**: nếu `parentId` được cung cấp (non-null), lookup `material_group` theo `(tenant_id, id = parentId)`. Phải tồn tại VÀ có `status = ACTIVE`. Nếu không tìm thấy → HTTP 400. Nếu tìm thấy nhưng INACTIVE → HTTP 400. `parentId = null` hợp lệ (nhóm gốc không có cha).
- **Output**: HTTP 400 + `ERR-INV-PARENT-INVALID` nếu vi phạm. **NEED CONFIRMATION**: error code cụ thể cho parentId not found / INACTIVE chưa được liệt kê tường minh trong PKG §2.2.1 V2-4 — BA/Architecture Authority cần confirm code chính thức (đề xuất `ERR-INV-028` hoặc reuse generic `ERR-CMN-validation`).
- **Ref**: BR-CAT-GRP-003 (§9), entity `material_group.parent_id UUID scalar FK` (§5.1).

#### AC-5 → Xử lý status mặc định

- **Khi**: `POST /api/v2/material-groups` nhận body field `status` (optional).
- **BE phải**: nếu `status` không cung cấp → default `ACTIVE`. Nếu cung cấp → validate thuộc enum `{ACTIVE, INACTIVE}`.
- **Output**: entity tạo ra với status đúng; HTTP 400 nếu giá trị ngoài enum.
- **Ref**: BR-CAT-GRP-006 (§9), entity `material_group.status ENUM` (§5.1).

#### AC-6 → Enforce description length

- **Khi**: `POST /api/v2/material-groups` nhận body field `description` (optional).
- **BE phải**: nếu `description` được cung cấp và `length > 255` ký tự → reject.
- **Output**: HTTP 400 + `ERR-INV-016`.
- **Ref**: DB constraint `material_group.description VARCHAR(255)` (§5.1), endpoint V2-4 (§6.1).

#### AC-7 → Enforce uniqueness (tenant_id, code)

- **Khi**: toàn bộ input validation pass, BE chuẩn bị INSERT vào `material_group`.
- **BE phải**: kiểm tra duplicate bằng DB unique constraint `uq_material_group_tenant_code` trên `(tenant_id, code)`. Nếu đã tồn tại record với cùng `(tenant_id, code)` → abort INSERT.
- **Output**: HTTP 409 + `ERR-INV-002`.
- **Failure mode**: bắt `DataIntegrityViolationException` từ JPA → map sang `ERR-INV-002` tại exception handler. Không cần pre-check SELECT (chạy race với concurrent inserts).
- **Ref**: BR-CAT-GRP-012 (§9), constraint `uq_material_group_tenant_code` (§5.2).

### Cluster B — Persist và trả kết quả

#### AC-8 → Persist entity và trả 201

- **Khi**: tất cả validation (AC-2 đến AC-7) đều pass.
- **BE phải**: INSERT `material_group` row với đầy đủ `id` (UUID gen server-side), `tenant_id` (từ `TenantContext`), `code`, `name`, `description`, `parent_id`, `status`, `created_at` (UTC now), `created_by` (sub từ JWT).
- **Output**: HTTP 201 + response body `{ id, code, name, description, parentId, status, createdAt, createdBy }`.
- **Ref**: endpoint `POST /api/v2/material-groups` (§6.1), entity `material_group` (§5.1).

### Cluster C — Phân quyền

#### AC-10 → RBAC tại endpoint level

- **Khi**: bất kỳ request nào tới `POST /api/v2/material-groups`.
- **BE phải**: verify JWT hợp lệ (Authorization header); user phải có permission tạo nhóm vật tư. Cả hai persona `garage-owner` và `accountant` đều được phép. Request không có JWT hợp lệ → 401. JWT hợp lệ nhưng thiếu permission → 403.
- **Output**: HTTP 401 hoặc 403 tùy trường hợp; proceed bình thường nếu authed.
- **NEED CONFIRMATION**: tên permission constant cụ thể (vd `MATERIAL_GROUP_CREATE`) chưa xuất hiện trong đoạn KG trích trong bundle (đoạn permissions bị truncate). Architecture Authority cần confirm permission name từ KG `gf-inventory.knowledge-graph.yaml §permissions`.
- **Ref**: Critical Rule #4 (tenant isolation), Critical Rule #6 (dual persona only).

### Cluster D — Hủy bỏ (N/A)

#### AC-9 → N/A (UI-only)

Source AC này mô tả hành vi hủy/đóng form trên giao diện — không phát sinh HTTP call đến BE. Xem `fe-web/FEAT-CAT-GRP-CREATE.md §3 AC-9` và `mobile/FEAT-CAT-GRP-CREATE.md §3 AC-9`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-GRP-001** (CORNERSTONE): Mã nhóm không chứa ký tự `~!@#$%^&*` — enforce tại `app/service/MaterialGroupValidator`. Vi phạm → `ERR-INV-001` + HTTP 400.
- **BR-CAT-GRP-002** (CORNERSTONE): Tên nhóm bắt buộc, không blank — enforce tại validator / `@NotBlank` bean validation. Vi phạm → HTTP 400.
- **BR-CAT-GRP-003** (CORNERSTONE): parentId nếu cung cấp phải tồn tại và ACTIVE trong cùng tenant — enforce tại `app/service/MaterialGroupService` (lookup + status check). Vi phạm → HTTP 400.
- **BR-CAT-GRP-006** (NORMAL): status mặc định ACTIVE khi không cung cấp — enforce tại service layer (default injection).
- **BR-CAT-GRP-008** (NORMAL): description ≤ 255 ký tự — enforce tại validator + DB constraint `VARCHAR(255)`. Vi phạm → `ERR-INV-016` + HTTP 400.
- **BR-CAT-GRP-012** (CORNERSTONE): Mã nhóm duy nhất trong phạm vi tenant — enforce tại DB unique constraint `uq_material_group_tenant_code` + service exception handler. Vi phạm → `ERR-INV-002` + HTTP 409.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `TenantContext` inject `tenantId` vào entity lúc persist (Critical Rule #4).
- `OriginTenantId` trong mọi cross-boundary call phải match `data.tenantId` — không áp dụng cho feature này (không gọi boundary ngoài).
- JWT required; `sub` claim dùng populate `created_by`.

### 4.3 Idempotency + concurrency

- Không có Idempotency-Key header cho CREATE; client retry dẫn đến ERR-INV-002 (duplicate code) — expected behavior.
- Unique constraint DB làm race-condition guard; không cần optimistic locking cho CREATE.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Condition | Display mode (FE hint) |
|---|---|---|---|---|
| `ERR-INV-001` | 400 | AC-2 | code chứa ký tự đặc biệt `~!@#$%^&*` | INLINE (field `code`) |
| `ERR-INV-002` | 409 | AC-7 | Trùng `(tenant_id, code)` | TOAST hoặc INLINE (field `code`) |
| `ERR-INV-016` | 400 | AC-6 | `description` > 255 ký tự | INLINE (field `description`) |
| NEED CONFIRMATION | 400 | AC-4 | `parentId` không tồn tại hoặc INACTIVE | INLINE (field `parentId`) |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> Bảng `material_group` là entity **mới hoàn toàn** (catalog-v2 subsystem per ADR-017). Không thay đổi entity legacy nào.

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `material_group` | `id` | `UUID` | N | gen server-side | Flyway V20260624010000 | — | AC-8 | PK |
| `material_group` | `tenant_id` | `UUID` | N | from TenantContext | Flyway V20260624010000 | Critical Rule #4 | AC-8 | Tenant isolation |
| `material_group` | `code` | `VARCHAR(50)` | N | — | Flyway V20260624010000 | BR-CAT-GRP-001, 012 | AC-2, AC-7 | Regex: no `~!@#$%^&*` |
| `material_group` | `name` | `VARCHAR(255)` | N | — | Flyway V20260624010000 | BR-CAT-GRP-002 | AC-3 | Required |
| `material_group` | `description` | `VARCHAR(255)` | Y | NULL | Flyway V20260624010000 | BR-CAT-GRP-008 | AC-6 | ≤255 chars |
| `material_group` | `parent_id` | `UUID` | Y | NULL | Flyway V20260624010000 | BR-CAT-GRP-003 | AC-4 | Scalar self-FK — ADR-009: KHÔNG `@ManyToOne` |
| `material_group` | `status` | `ENUM('ACTIVE','INACTIVE')` | N | `'ACTIVE'` | Flyway V20260624010000 | BR-CAT-GRP-006 | AC-5 | |
| `material_group` | `created_at` | `TIMESTAMPTZ` | N | `now()` | Flyway V20260624010000 | — | AC-8 | Audit col |
| `material_group` | `created_by` | `VARCHAR(255)` | Y | — | Flyway V20260624010000 | — | AC-8 | JWT sub |
| `material_group` | `updated_at` | `TIMESTAMPTZ` | Y | — | Flyway V20260624010000 | — | — | Audit col |
| `material_group` | `updated_by` | `VARCHAR(255)` | Y | — | Flyway V20260624010000 | — | — | Audit col |

> **Migration policy**: gf-inventory dùng Flyway (KHÔNG ddl-auto). File `V20260624010000__create_material_group.sql` là migration đầu tiên của catalog-v2. KHÔNG rewrite migration cũ (Critical Rule #17 / CLAUDE.md §7 #9).

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `material_group` | `uq_material_group_tenant_code` | `(tenant_id, code)` | UNIQUE | Enforce BR-CAT-GRP-012 — mã nhóm duy nhất trong tenant | ADR-017 |
| `material_group` | `idx_material_group_tenant_status` | `(tenant_id, status)` | btree | Query list/filter theo status trong tenant | ADR-017 |
| `material_group` | `idx_material_group_parent` | `(parent_id)` | btree | Lookup children theo parent_id (dùng cho cascade INACTIVE / tree walk) | ADR-017 |

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/material-groups` | JWT (Authorization header) | `MaterialGroupCreateRequest` | `MaterialGroupResponse` (201) | none — duplicate code → ERR-INV-002 | AC-2,3,4,5,6,7,8,10 | — |

**Request schema** `MaterialGroupCreateRequest`:
```json
{
  "code": "string (required, ≤50, no ~!@#$%^&*)",
  "name": "string (required, ≤255)",
  "description": "string? (optional, ≤255)",
  "parentId": "UUID? (optional — null = root group)",
  "status": "ACTIVE | INACTIVE (optional, default ACTIVE)"
}
```

**Response schema** `MaterialGroupResponse` (201):
```json
{
  "id": "UUID",
  "code": "string",
  "name": "string",
  "description": "string | null",
  "parentId": "UUID | null",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISO8601-UTC",
  "createdBy": "string"
}
```

**Error responses**:

| Status | Error code | Condition |
|---|---|---|
| 400 | `ERR-INV-001` | code chứa ký tự `~!@#$%^&*` |
| 400 | `ERR-INV-016` | description > 255 ký tự |
| 400 | NEED CONFIRMATION | parentId không tồn tại hoặc INACTIVE |
| 401 | — | JWT thiếu / expired |
| 403 | — | Permission thiếu |
| 409 | `ERR-INV-002` | Trùng `(tenant_id, code)` |

### 6.2 Modified REST endpoints (additive)

Không có endpoint hiện hữu nào bị modify.

### 6.3 Kafka topics

Không phát / consume Kafka event.

### 6.4 Cross-boundary REST consumers

Không gọi boundary ngoài.

> **Hand-off tới BFF**: BFF FEAT `features/bff/FEAT-CAT-GRP-CREATE.md` sẽ wrap endpoint `POST /api/v2/material-groups` thành GraphQL mutation `createMaterialGroup`. KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (Critical Rule #1). Cross-boundary touch chỉ qua §6.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroup.java` | NEW | new entity | ~60 | AC-2,3,4,5,6,8 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/MaterialGroupRepository.java` | NEW | new repository interface | ~15 | AC-7,8 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/MaterialGroupService.java` | NEW | new service | ~120 | AC-2,3,4,5,6,7,8 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/MaterialGroupValidator.java` | NEW | new validator | ~60 | AC-2,3,6 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/MaterialGroupCreateRequest.java` | NEW | new DTO | ~30 | AC-2,3,4,5,6 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/MaterialGroupResponse.java` | NEW | new DTO | ~30 | AC-8 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/MaterialGroupController.java` | NEW | new controller | ~40 | AC-8,10 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/MaterialGroupJpaRepository.java` | NEW | new JPA repo | ~20 | AC-7,8 |
| `db/migration` | `services/gf-inventory/src/main/resources/db/migration/V20260624010000__create_material_group.sql` | NEW | Flyway additive | ~25 | AC-8 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/MaterialGroupServiceTest.java` | NEW | new test class | ~180 | AC-2,3,4,5,6,7,8,10 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/MaterialGroupCreateContractTest.java` | NEW | contract test | ~100 | AC-2,3,7,8 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema migration (V20260624010000__create_material_group.sql)
    Entry: ADR-017 schema stable (material_group columns finalized)
    Exit: migration file exists + local DB apply success + migration test green
    └─► S2

S2  Entity + Repository + Validator + Service logic (BR primary enforcement)
    Entry: S1
    Exit: unit test ≥ 10 green (AC-2/3/4/5/6/7/8/10 coverage)
    └─► S3

S3  REST adapter (MaterialGroupController — POST /api/v2/material-groups)
    Entry: S2
    Exit: contract test green (positive + 4 negative cases: ERR-INV-001/002/016/parentId)
    └─► S4

S4  Integration test (RBAC + tenant isolation + DB state verify)
    Entry: S3
    Exit: integ test green (201 round-trip + 401/403 isolation)
    └─► (hand-off BFF tier S5 — wire createMaterialGroup mutation)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema migration + index | db/migration | ADR-017 schema stable | Migration test green | — |
| S2 | Entity + Validator + Service | domain + app | S1 | Unit test ≥ 10 green | S1 |
| S3 | REST controller | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-CAT-GRP-001` | CORNERSTONE | app/service (primary) | `app/service/MaterialGroupValidator.java` | AC-2 | `TC-BR-inv-grp-001-*` |
| `BR-CAT-GRP-002` | CORNERSTONE | app/service + bean validation | `app/dto/MaterialGroupCreateRequest.java` (@NotBlank) | AC-3 | `TC-BR-inv-grp-002-*` |
| `BR-CAT-GRP-003` | CORNERSTONE | app/service (lookup + status check) | `app/service/MaterialGroupService.java::validateParent()` | AC-4 | `TC-BR-inv-grp-003-*` |
| `BR-CAT-GRP-006` | NORMAL | app/service (default injection) | `app/service/MaterialGroupService.java::create()` | AC-5 | `TC-BR-inv-grp-006-*` |
| `BR-CAT-GRP-008` | NORMAL | app/service + DB constraint | `app/service/MaterialGroupValidator.java` + schema | AC-6 | `TC-BR-inv-grp-008-*` |
| `BR-CAT-GRP-012` | CORNERSTONE | DB unique constraint (primary) + exception handler (secondary) | `V20260624010000__create_material_group.sql` (uq) + `adapter/controller/MaterialGroupController.java` (handler) | AC-7 | `TC-BR-inv-grp-012-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | API contract (negative) | test-api | Reject code với `~!@#$%^&*` → 400 ERR-INV-001 |
| AC-3 | API contract (negative) | test-api | Reject null/blank name → 400 |
| AC-4 | API contract (negative) | test-api | Reject parentId INACTIVE + parentId not found → 400 |
| AC-5 | Unit (service) | test-api | Default ACTIVE khi omit status; reject invalid enum |
| AC-6 | API contract (negative) | test-api | Reject description > 255 → 400 ERR-INV-016 |
| AC-7 | API contract (negative) | test-api | Duplicate code trong cùng tenant → 409 ERR-INV-002 |
| AC-8 | API contract (positive) | test-api | POST → 201 + entity body có đủ fields |
| AC-10 | Isolation (RBAC) | test-isolation | 401 không có JWT; 403 nếu thiếu permission; 201 với cả 2 persona hợp lệ |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-CREATE.md` | PENDING | Resolver `createMaterialGroup` wrap `POST /api/v2/material-groups` (§6.1) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-CREATE.md` | PENDING | UI form consume BFF mutation |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-CREATE.md` | PENDING | Flutter screen consume BFF mutation |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) v4
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 endpoint V2-4
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-4
- **ADR-009**: JPA no relationship mapping (scalar FK only)
- **ADR-017**: Additive aggregates — `material_group` entity mới trong gf-inventory; migration sequence V20260624010000
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-GRP-CREATE` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3 dòng), §2 trách nhiệm BE, §3 BE behaviour map (10 ACs: 8 BE, 2 N/A UI-only), §4 ràng buộc + error code, §5-§11 BE-specific (schema material_group Flyway V20260624010000 / POST endpoint / Hexagonal file map / sequence DAG / BR primary / test scope / cross-tier pair). 2 NEED CONFIRMATION: (1) error code parentId validation; (2) permission constant name từ KG permissions. |
