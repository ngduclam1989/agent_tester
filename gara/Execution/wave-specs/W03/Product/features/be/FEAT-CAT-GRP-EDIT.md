---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-GRP-EDIT.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-EDIT"
source_feat_sha: "87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436"
source_feat_version: 4
generated_at: "2026-06-29T15:00:00+00:00"
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
demo_signature: "Chủ garage PUT /api/v2/material-groups/{id} đổi tên + chuyển INACTIVE → cascade INACTIVE toàn bộ nhóm con trong 1 transaction → 200 OK updated DTO"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-GRP-EDIT"]
paired_fe_web_feats: ["FEAT-CAT-GRP-EDIT"]
paired_mobile_feats: ["FEAT-CAT-GRP-EDIT"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-EDIT.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-EDIT (BE): Chỉnh sửa nhóm vật tư hàng hóa

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-EDIT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `agg-garage-graph` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage PUT /api/v2/material-groups/{id} → đổi tên + cascade INACTIVE → 200 OK |
| Cross-tier pair | BFF: FEAT-CAT-GRP-EDIT \| Web: FEAT-CAT-GRP-EDIT \| Mobile: FEAT-CAT-GRP-EDIT |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) |
| Source version | v4 |
| Source SHA | `87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` |
| Generated at | 2026-06-29T15:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần cập nhật thông tin nhóm vật tư hàng hóa theo nhu cầu vận hành thực tế — đổi tên, chỉnh mô tả, thay đổi nhóm cha hoặc điều chỉnh trạng thái hoạt động. Tính năng này đảm bảo cây phân cấp nhóm vật tư luôn phản ánh đúng cấu trúc tổ chức hàng hóa của garage, phục vụ các nghiệp vụ kho V2 như nhập/xuất tồn và tính giá. FEAT-CAT-GRP-EDIT nằm trong luồng quản lý danh mục sau bước tạo mới (FEAT-CAT-GRP-CREATE) và trước khi xóa (FEAT-CAT-GRP-DELETE).

## 2. Trách nhiệm backend (gf-inventory)

- Expose endpoint `PUT /api/v2/material-groups/{id}` (V2-5) xử lý toàn bộ validation + persist thay đổi trong 1 transaction, tenant-scoped.
- Enforce code immutable (BR-CAT-GRP-004, CORNERSTONE): bỏ qua hoặc từ chối field `code` trong request body nếu khác giá trị hiện tại.
- Thực thi cycle-prevention khi thay `parentId` bằng recursive CTE / BFS kiểm tra descendant trước UPDATE (BR-CAT-GRP-009, ERR-INV-003).
- Cascade UPDATE `status = INACTIVE` xuống toàn bộ cây con trong cùng transaction khi node cha chuyển sang INACTIVE (BR-CAT-GRP-007).
- Validate `description ≤ 255 chars` (BR-CAT-GRP-012, ERR-INV-016) và enforce tenant isolation qua TenantFilter/TenantContext trên mọi query.
- Expose endpoint read `GET /api/v2/material-groups/{id}` (V2-3) — shared với FEAT-CAT-GRP-DETAIL — để BFF/client lấy dữ liệu current trước khi render form chỉnh sửa.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Đọc dữ liệu hiện tại cho form

#### AC-1 → Trả detail nhóm để populate form chỉnh sửa

- **Khi**: BFF gọi `GET /api/v2/material-groups/{id}` (V2-3) trước khi render UI form sửa.
- **BE phải**: Truy vấn `material_group` tenant-scoped theo `id`; trả full DTO gồm `id`, `code`, `name`, `description`, `parentId`, `status`, audit fields.
- **Output**: `200 OK` với `MaterialGroupDetailDto`; `404` nếu không tìm thấy trong tenant.
- **Failure mode**: `id` không thuộc tenant → 404 (không tiết lộ existence cross-tenant).
- **Ref**: entity `material_group` (§5.1), endpoint `GET /api/v2/material-groups/{id}` (§6.1).

### Cluster B — Bất biến mã nhóm và chỉnh sửa trường văn bản

#### AC-2 → Enforce mã nhóm bất biến

- **Khi**: Client gửi `PUT /api/v2/material-groups/{id}` với field `code` trong request body.
- **BE phải**: Bỏ qua giá trị `code` trong body (không persist thay đổi) — hoặc trả 400 nếu `code` gửi lên khác giá trị hiện tại. Enforcement tại service layer trước khi gọi repository.
- **Output**: `code` trong response luôn giữ nguyên giá trị gốc.
- **Failure mode**: Phát hiện `code` khác → `400 BAD REQUEST` + message "Mã nhóm không được thay đổi".
- **Ref**: BR-CAT-GRP-004 (§9), `MaterialGroupService::update()` (§7).

#### AC-3 → Validate và persist tên nhóm mới

- **Khi**: Client gửi `name` hợp lệ trong body PUT.
- **BE phải**: Validate `name` không null/blank; persist giá trị mới vào `material_group.name`.
- **Output**: Updated `name` trong response DTO.
- **Failure mode**: `name` rỗng → `400 BAD REQUEST` (validation standard).
- **Ref**: entity `material_group.name VARCHAR(255)` (§5.1), endpoint V2-5 (§6.1).

#### AC-6 → Validate và persist mô tả

- **Khi**: Client gửi `description` trong body PUT (nullable).
- **BE phải**: Validate `description` ≤ 255 chars; persist hoặc set null nếu không gửi.
- **Output**: Updated `description` trong response DTO.
- **Failure mode**: `description` vượt 255 chars → `400 BAD REQUEST` + `ERR-INV-016`.
- **Ref**: BR-CAT-GRP-012 (§9), `ERR-INV-016` (§4.4).

### Cluster C — Cấu trúc cây phân cấp và cascade trạng thái

#### AC-4 → Validate nhóm cha mới và chống circular reference

- **Khi**: Client gửi `parentId` mới (UUID hoặc null) trong body PUT.
- **BE phải**:
  1. Nếu `parentId` không null: kiểm tra tồn tại + thuộc cùng tenant.
  2. Chạy recursive CTE / BFS từ node `id` xuống cây con — nếu `parentId` mới nằm trong tập descendants → reject `ERR-INV-003`.
  3. Nếu `parentId = id` (self-reference) → reject `ERR-INV-003`.
  4. Nếu `parentId = null` → node trở thành root (hợp lệ).
  5. **NEED CONFIRMATION**: BR-CAT-GRP-008 — cần xác nhận liệu `parentId` mới có bắt buộc phải ở trạng thái `ACTIVE` không (pattern tương đồng với CREATE V2-4). Hiện giả định: `parentId` phải ACTIVE → reject nếu INACTIVE.
- **Output**: `parentId` updated trong response.
- **Failure mode**: Circular → `422 UNPROCESSABLE_ENTITY` + `ERR-INV-003`; parentId không tồn tại → `404`.
- **Ref**: BR-CAT-GRP-009 (§9), ADR-017 §Hierarchy strategy, endpoint V2-5 (§6.1).

#### AC-5 → Cascade INACTIVE xuống cây con trong 1 transaction

- **Khi**: Client gửi `status = INACTIVE` trong body PUT cho node đang ACTIVE (hoặc bất kỳ node nào có con).
- **BE phải**:
  - ACTIVE → INACTIVE: thực thi recursive CTE `UPDATE material_group SET status = 'INACTIVE' WHERE id IN (descendant_ids)` trong cùng transaction (BR-CAT-GRP-007). Toàn bộ transaction commit/rollback atomically.
  - INACTIVE → ACTIVE: chỉ update node hiện tại, KHÔNG cascade ngược lên hoặc xuống con.
- **Output**: `200 OK` với updated node DTO; tất cả con trong DB đã là INACTIVE.
- **Failure mode**: Transaction fail → rollback toàn bộ, trả `500`.
- **Ref**: BR-CAT-GRP-007 (§9, CORNERSTONE), ADR-017 §Cascade INACTIVE, `MaterialGroupRepository::cascadeInactive()` (§7).

### Cluster D — Lưu thay đổi atomically

#### AC-7 → Xử lý PUT atomically và trả updated DTO

- **Khi**: Client gửi `PUT /api/v2/material-groups/{id}` với body hợp lệ sau tất cả validation (AC-2→AC-6).
- **BE phải**: Thực thi tất cả validation trong service layer → nếu pass hết → persist trong 1 `@Transactional` boundary → update `updated_at`, `updated_by` → trả `MaterialGroupDetailDto`.
- **Output**: `200 OK` với updated `MaterialGroupDetailDto`.
- **Failure mode**: Bất kỳ validation nào fail → rollback, trả error tương ứng (xem §4.4).
- **Ref**: endpoint `PUT /api/v2/material-groups/{id}` (§6.1), BR toàn bộ §9.

#### AC-8 → N/A (UI-only)

- Source AC này thuộc tier fe-web / mobile (cancel navigation, discard form state). BE không touch. Xem `fe-web/FEAT-CAT-GRP-EDIT.md §3 AC-8` và `mobile/FEAT-CAT-GRP-EDIT.md §3 AC-8`.

### Cluster E — Phân quyền

#### AC-9 → Enforce RBAC trên PUT endpoint

- **Khi**: Bất kỳ request `PUT /api/v2/material-groups/{id}`.
- **BE phải**: Verify JWT token có permission cho phép chỉnh sửa danh mục nhóm vật tư. **NEED CONFIRMATION**: exact permission code / role scope (garage-owner vs accountant vs cả hai). Hiện giả định: scope `authenticated` + role có `CATALOG_MATERIAL_GROUP_WRITE` permission; thiếu → `403 FORBIDDEN`.
- **Output**: `403` nếu unauthorized; proceed nếu authorized.
- **Failure mode**: JWT missing → `401`; JWT valid nhưng thiếu permission → `403`.
- **Ref**: Critical Rule #4 (tenant isolation), Critical Rule #6 (dual persona only).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-GRP-004** (CORNERSTONE): `code` của nhóm bất biến sau khi tạo — enforce tại `app/service/MaterialGroupService.java` (reject/ignore field trước persist). Vi phạm → `400`.
- **BR-CAT-GRP-007** (CORNERSTONE): Cascade INACTIVE xuống toàn bộ cây con trong 1 transaction atomic — enforce tại `app/service/MaterialGroupService.java` + `adapter/persistence` (recursive CTE). Vi phạm = data inconsistency; không có phương án partial cascade.
- **BR-CAT-GRP-008** (NORMAL — NEED CONFIRMATION): Khả năng quy định `parentId` mới phải ACTIVE — enforce tại service layer trước UPDATE. Vi phạm → `400`/`422`.
- **BR-CAT-GRP-009** (CORNERSTONE): Cycle prevention — `parentId` mới không được là descendant của node hiện tại — enforce tại service layer bằng recursive CTE / BFS trước UPDATE. Vi phạm → `ERR-INV-003` + `422`.
- **BR-CAT-GRP-012** (NORMAL): `description ≤ 255 chars` — enforce tại validation layer. Vi phạm → `ERR-INV-016` + `400`.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `TenantContext` inject vào service layer — tất cả query thêm `WHERE tenant_id = :tenantId` (Critical Rule #4).
- `PUT /api/v2/material-groups/{id}` yêu cầu JWT authenticated + permission catalog-write (NEED CONFIRMATION role scope — xem AC-9).
- Cross-tenant fetch trả `404` (không tiết lộ existence).

### 4.3 Idempotency + concurrency

- `PUT /api/v2/material-groups/{id}` là idempotent về mặt kết quả cuối nếu body giống nhau — không cần idempotency-key riêng.
- Entity `material_group` không có `@Version` optimistic locking theo ADR-017 spec. Last-write-wins semantics. Nếu concurrent edit xảy ra, ưu tiên request thành công sau cùng — không conflict resolution.
- Cascade INACTIVE (AC-5) phải wrap trong `@Transactional(isolation = READ_COMMITTED)` để tránh partial update.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-003` | 422 | AC-4 | TOAST — "Nhóm cha không hợp lệ: tạo thành vòng tròn trong cây phân cấp" |
| `ERR-INV-016` | 400 | AC-6 | INLINE — dưới field mô tả |
| Standard 404 | 404 | AC-1, AC-4 | TOAST — "Không tìm thấy nhóm vật tư" |
| Standard 403 | 403 | AC-9 | TOAST — "Bạn không có quyền chỉnh sửa" |
| Standard 400 (name blank) | 400 | AC-3 | INLINE — dưới field tên |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

> FEAT-CAT-GRP-EDIT **không thêm cột hoặc bảng mới**. Entity `material_group` đã được tạo đầy đủ trong FEAT-CAT-GRP-CREATE migration `V20260624010000__create_material_group.sql` (ADR-017). EDIT feature chỉ thực hiện UPDATE row hiện tại.

| Entity | Trạng thái | Migration | BR ref | AC ref | Notes |
|---|---|---|---|---|---|
| `material_group` | **No change** (existing từ FEAT-CAT-GRP-CREATE) | N/A — đã có `V20260624010000` | BR-CAT-GRP-004/007/009/012 | AC-2..AC-7 | Columns: `name`, `description`, `parent_id`, `status`, audit `updated_at/by` — tất cả đã tồn tại |

### 5.2 Index / constraint changes

> Không có index hoặc constraint mới. Constraint `UNIQUE (tenant_id, code)` và `parent_id` scalar FK self-ref (ADR-009 compliant — KHÔNG `@ManyToOne`) đã có trong migration V20260624010000.

---

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

> V2-5 là endpoint PRIMARY cho FEAT-CAT-GRP-EDIT. V2-3 (GET detail) được tạo bởi FEAT-CAT-GRP-DETAIL — EDIT reuse, không define lại.

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| PUT | `/api/v2/material-groups/{id}` | JWT (authenticated, catalog-write) | `MaterialGroupUpdateInput` (xem below) | `MaterialGroupDetailDto` | Idempotent (same body → same result) | AC-2..AC-7 |
| GET | `/api/v2/material-groups/{id}` | JWT (authenticated) | — | `MaterialGroupDetailDto` | safe (read) | AC-1 |

**`MaterialGroupUpdateInput` schema**:

```json
{
  "name": "string (required, non-blank, ≤255)",
  "description": "string? (nullable, ≤255 — ERR-INV-016)",
  "parentId": "UUID? (nullable = set root; circular check — ERR-INV-003)",
  "status": "ACTIVE | INACTIVE (nullable = no change)"
}
```

> `code` KHÔNG được include trong `MaterialGroupUpdateInput`. Nếu client gửi `code` → ignored hoặc rejected (BE enforce BR-CAT-GRP-004).

**`MaterialGroupDetailDto` schema** (response):

```json
{
  "id": "UUID",
  "code": "string",
  "name": "string",
  "description": "string?",
  "parentId": "UUID?",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISO8601",
  "createdBy": "string",
  "updatedAt": "ISO8601",
  "updatedBy": "string"
}
```

### 6.2 Modified REST endpoints (additive)

> Không có endpoint baseline nào bị modify — `material_group` là entity mới W03 (ADR-017).

### 6.3 Kafka topics

> FEAT-CAT-GRP-EDIT không publish Kafka event. Catalog update thuần REST — không có downstream consumer cần event notification trong batch W03.

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode |
|---|---|---|---|
| `PUT /api/v2/material-groups/{id}` | `agg-garage-graph` (BFF mutation) | Khi user lưu form chỉnh sửa | BFF forward 4xx/5xx nguyên trạng |
| `GET /api/v2/material-groups/{id}` | `agg-garage-graph` (BFF query) | Khi populate form + refresh sau edit | BFF forward 404 nếu not found |

> **Hand-off tới BFF**: BFF FEAT `features/bff/FEAT-CAT-GRP-EDIT.md` sẽ wrap V2-5 PUT thành GraphQL mutation `updateMaterialGroup` và V2-3 GET thành query `materialGroup`. KHÔNG describe GraphQL ở đây.

---

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**`. Cross-boundary chỉ qua §6 REST.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroup.java` | MODIFY | Thêm method `isDescendantOf()` helper (hỗ trợ cycle check) | ~15 | AC-4 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/MaterialGroupRepository.java` | ADDITIVE | Thêm `findDescendantIds(UUID id, UUID tenantId)` + `cascadeInactive(Set<UUID> ids, UUID tenantId)` | ~20 | AC-4, AC-5 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/MaterialGroupService.java` | MODIFY | Thêm `update()` method: validate code immutable → cycle check → cascade logic → persist | ~90 | AC-2..AC-7, AC-9 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/MaterialGroupController.java` | MODIFY | Thêm `@PutMapping("/{id}")` handler | ~25 | AC-7, AC-9 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/MaterialGroupJpaRepository.java` | ADDITIVE | Thêm `@Query` JPQL native cho recursive CTE descendants + bulk update | ~30 | AC-4, AC-5 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/MaterialGroupUpdateInput.java` | NEW | Request DTO (code field excluded) | ~20 | AC-2..AC-7 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/MaterialGroupServiceUpdateTest.java` | NEW | Unit test: code-immutable, cycle-detect, cascade-INACTIVE, description-length | ~150 | AC-2..AC-7 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/MaterialGroupPutContractTest.java` | NEW | Contract test PUT V2-5: happy path + ERR-INV-003 + ERR-INV-016 + 404 + 403 | ~100 | AC-2..AC-9 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

> Không có schema migration mới — S1 bắt đầu từ repository layer (schema đã có từ FEAT-CAT-GRP-CREATE).

```
S1  Repository queries (recursive CTE cho cycle check + cascade INACTIVE)
    Entry: material_group table đã deployed (FEAT-CAT-GRP-CREATE S1 done)
    Exit: findDescendantIds() + cascadeInactive() pass unit test trực tiếp
    └─► S2

S2  Service logic (MaterialGroupService::update — validate + orchestrate S1 queries)
    Entry: S1
    Exit: unit test ≥8 green — code-immutable, circular, cascade, description-len, permission
    └─► S3

S3  REST adapter (PUT handler + DTO mapping)
    Entry: S2
    Exit: contract test green (PUT happy path + 4xx negative cases)
    └─► S4

S4  Integration test (end-to-end: BFF call → gf-inventory → DB assert cascade)
    Entry: S3 + FEAT-CAT-GRP-CREATE S4 done (entity pre-existing)
    Exit: integ test green — cascade INACTIVE verifiable via follow-up GET /tree
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Recursive CTE repository queries | `adapter/persistence` + `domain/repository` | Schema từ CREATE deployed | Descendant query + cascade query pass | FEAT-CAT-GRP-CREATE S1 |
| S2 | Service logic (validate + orchestrate) | `app/service` | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter PUT handler | `adapter/controller` | S2 | Contract test green | S2 |
| S4 | Integration test | `test/integration` | S3 + entity seeded | Integ test green | S3 |

---

## 9. Business Rules to enforce (BE — SSOT cho BR)

> BE là source-of-truth cho BR enforcement. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-GRP-004` | CORNERSTONE | service (primary) | `MaterialGroupService::update()` — reject/ignore `code` field | AC-2 | `TC-BR-INV-GRP-004-*` |
| `BR-CAT-GRP-007` | CORNERSTONE | service + persistence (primary) | `MaterialGroupService::update()` + `MaterialGroupJpaRepository::cascadeInactive()` — 1 `@Transactional` | AC-5 | `TC-BR-INV-GRP-007-*` |
| `BR-CAT-GRP-008` | NORMAL (NEED CONFIRMATION) | service | `MaterialGroupService::update()` — validate parentId ACTIVE | AC-4 | `TC-BR-INV-GRP-008-*` |
| `BR-CAT-GRP-009` | CORNERSTONE | service (primary) | `MaterialGroupService::update()` — BFS/recursive CTE descendant check trước UPDATE | AC-4 | `TC-BR-INV-GRP-009-*` |
| `BR-CAT-GRP-012` | NORMAL | validation (primary) | `MaterialGroupUpdateInput` validation — `@Size(max=255)` trên `description` | AC-6 | `TC-BR-INV-GRP-012-*` |

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (read) | test-api | GET /api/v2/material-groups/{id} → 200 DTO / 404 wrong-tenant |
| AC-2 | Unit (code-immutable) | test-api | PUT với `code` khác → verify DB code không đổi hoặc 400 |
| AC-3 | Unit + API contract | test-api | PUT `name` valid → 200; name blank → 400 |
| AC-4 | Unit (cycle detection) + API contract | test-api | parentId = descendant → ERR-INV-003; parentId null → 200 root |
| AC-5 | Unit (cascade) + Integration | test-api | ACTIVE→INACTIVE → verify cây con INACTIVE trong DB; INACTIVE→ACTIVE → con giữ nguyên |
| AC-6 | Unit + API contract | test-api | description 256 chars → ERR-INV-016; null → 200 |
| AC-7 | Integration | test-api | Full PUT payload → 200 DTO fields match; DB state verify |
| AC-8 | N/A BE | — | UI cancel — test-ui / test-mobile-ui |
| AC-9 | Isolation (RBAC) | test-isolation | PUT không có JWT → 401; JWT thiếu permission → 403 |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-EDIT.md` | PENDING | Wrap V2-5 PUT → `updateMaterialGroup` mutation; wrap V2-3 GET → `materialGroup` query |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-EDIT.md` | PENDING | Consume BFF mutation/query; render form; enforce code field disabled (BR-CAT-GRP-004 secondary) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-EDIT.md` | PENDING | Flutter Bloc consume BFF; render form; enforce code field disabled |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436`.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) v4
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md) (BR-CAT-GRP-004/007/008/009/012/013)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md) (§catalog-v2 subsystem)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) (§V2-3, §V2-5)
- **ADR-009**: JPA no relationship mapping — scalar FK `parent_id` self-ref
- **ADR-017**: Additive aggregates — `material_group` adjacency-list, Flyway migration sequence, cycle/cascade strategy
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-5
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-GRP-EDIT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 BE behaviour map 9 ACs (AC-8 N/A UI-only), §4 ràng buộc + error code, §5 no schema delta (reuse CREATE migration), §6 V2-5 PUT + V2-3 GET, §7 file map Hexagonal, §8 sequence DAG S1-S4, §9 BR primary table, §10 test scope, §11 cross-tier. 2 NEED CONFIRMATION: BR-CAT-GRP-008 exact semantics + AC-9 permission code. |
