---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-GRP-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DELETE"
source_feat_sha: "c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277"
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
demo_signature: "Chủ garage xóa thành công nhóm vật tư rỗng; hệ thống chặn xóa khi nhóm có mã SP nội bộ hoặc còn nhóm con"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-GRP-DELETE"]
paired_fe_web_feats: ["FEAT-CAT-GRP-DELETE"]
paired_mobile_feats: ["FEAT-CAT-GRP-DELETE"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DELETE.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-GRP-DELETE (BE): Xóa nhóm vật tư hàng hóa

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DELETE` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage xóa thành công nhóm vật tư rỗng; hệ thống chặn xóa khi nhóm có mã SP nội bộ hoặc còn nhóm con |
| Cross-tier pair | BFF: FEAT-CAT-GRP-DELETE \| Web: FEAT-CAT-GRP-DELETE \| Mobile: FEAT-CAT-GRP-DELETE |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) |
| Source version | v2 |
| Source SHA | `c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép chủ garage xóa vĩnh viễn một nhóm vật tư hàng hóa không còn dùng khỏi danh mục phân cấp. Để bảo vệ tính toàn vẹn dữ liệu, hệ thống tự động ngăn xóa nhóm khi còn nhóm con hoặc khi đã có mã sản phẩm nội bộ được gắn vào nhóm đó. Đây là mắt xích hoàn thiện vòng đời CRUD nhóm vật tư, đảm bảo danh mục luôn gọn gàng và nhất quán trước khi các nghiệp vụ nhập/xuất kho V2 vận hành trên nền dữ liệu này.

## 2. Trách nhiệm backend (`gf-inventory`)

- Expose endpoint `DELETE /api/v2/material-groups/{id}` (PKG V2-6) với auth JWT tenant-scoped; xóa cứng row khỏi bảng `material_group`.
- Enforce BR-CAT-GRP-010 (SSOT primary): trước khi xóa, kiểm tra `internal_product` có `material_group_id = id` trong cùng tenant; vi phạm → reject `ERR-INV-004` HTTP 409.
- Enforce BR-CAT-GRP-011 (SSOT primary): trước khi xóa, kiểm tra `material_group` có `parent_id = id` trong cùng tenant; vi phạm → reject `ERR-INV-005` HTTP 409.
- Kiểm tra quyền xóa (AC-6): chỉ persona `garage-owner` được phép thực hiện; `accountant` → reject HTTP 403.
- Không có sự kiện Kafka publish và không có migration schema mới — bảng `material_group` đã tồn tại từ `FEAT-CAT-GRP-CREATE` (migration `V20260624010000__create_material_group.sql`).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — UI-only actions (BE không touch)

#### AC-1 → N/A (UI-only — confirm popup)

Source AC này xử lý hiển thị hộp thoại xác nhận trên client trước khi gửi request. BE không tham gia ở bước này. Xem `fe-web/FEAT-CAT-GRP-DELETE.md §3 AC-1` và `mobile/FEAT-CAT-GRP-DELETE.md §3 AC-1`.

#### AC-3 → N/A (UI-only — cancel action)

Source AC này xử lý hành động hủy xóa (đóng popup) hoàn toàn ở client, không phát HTTP request. BE không touch. Xem `fe-web/FEAT-CAT-GRP-DELETE.md §3 AC-3`.

### Cluster B — Guard validation & delete

#### AC-2 → Xử lý xóa nhóm vật tư sau khi vượt qua guard checks

- **Khi**: Client gửi `DELETE /api/v2/material-groups/{id}` với JWT hợp lệ + tenant context.
- **BE phải**: (1) Resolve tenant từ JWT; (2) Load `MaterialGroup` theo `id` + `tenant_id` — nếu không tìm thấy → `404`; (3) Chạy guard check AC-4 (check linked products) và AC-5 (check child groups); (4) Nếu cả hai guard pass → `materialGroupRepository.deleteById(id)` trong transaction; (5) Trả về `200 { id, code, name }` của record vừa xóa.
- **Output**: HTTP 200 với `{ data: { id, code, name } }` của nhóm đã xóa.
- **Failure mode**: 404 nếu không tìm thấy; 409 nếu guard fail (xem AC-4, AC-5); 403 nếu thiếu quyền (AC-6).
- **Ref**: endpoint `DELETE /api/v2/material-groups/{id}` (§6.1), entity `material_group` (§5.1).

#### AC-4 → Chặn xóa khi nhóm đã gắn mã sản phẩm nội bộ

- **Khi**: `DELETE /api/v2/material-groups/{id}` — guard check trước khi persist delete.
- **BE phải**: Đếm `SELECT COUNT(*) FROM internal_product WHERE material_group_id = :id AND tenant_id = :tenantId`. Nếu count > 0 → ném exception map về `ERR-INV-004` HTTP 409 trước khi thực hiện bất kỳ thao tác xóa nào.
- **Output**: HTTP 409 `{ errorCode: "ERR-INV-004", message: "Nhóm vật tư đang được sử dụng bởi mã sản phẩm nội bộ, không thể xóa" }`.
- **Failure mode**: Đây chính là failure case — BE phải reject và không xóa.
- **Ref**: BR-CAT-GRP-010 (§9, §4.1), `internal_product.material_group_id` (§5.1), endpoint `DELETE /api/v2/material-groups/{id}` (§6.1).

#### AC-5 → Chặn xóa khi nhóm còn nhóm con

- **Khi**: `DELETE /api/v2/material-groups/{id}` — guard check trước khi persist delete.
- **BE phải**: Đếm `SELECT COUNT(*) FROM material_group WHERE parent_id = :id AND tenant_id = :tenantId`. Nếu count > 0 → ném exception map về `ERR-INV-005` HTTP 409 trước khi thực hiện bất kỳ thao tác xóa nào. Guard này độc lập với AC-4 — cả hai guard đều phải pass để xóa được thực hiện.
- **Output**: HTTP 409 `{ errorCode: "ERR-INV-005", message: "Nhóm vật tư còn nhóm con, không thể xóa" }`.
- **Failure mode**: Đây chính là failure case — BE phải reject và không xóa.
- **Ref**: BR-CAT-GRP-011 (§9, §4.1), `material_group.parent_id` (§5.1), endpoint `DELETE /api/v2/material-groups/{id}` (§6.1).

#### AC-6 → RBAC guard — chỉ garage-owner được xóa

- **Khi**: `DELETE /api/v2/material-groups/{id}` — auth check trước guard validation.
- **BE phải**: Kiểm tra role từ JWT claims. Chỉ `garage-owner` được phép thực hiện xóa. `accountant` gửi request → reject HTTP 403 ngay, không thực hiện bất kỳ query nào.
- **Output**: HTTP 403 `{ errorCode: "ERR-CMN-403", message: "Không có quyền thực hiện thao tác này" }`.
- **Failure mode**: 403 Forbidden với error message chuẩn.
- **Ref**: Critical Rule #6 (dual persona), `TenantContext` + JWT role claim (§4.2).

> **NEED CONFIRMATION (1/5)**: Source FEAT AC-6 chỉ ghi "Phân quyền xóa" không list explicit role(s). Spec này suy luận `garage-owner` ONLY dựa trên pattern catalog management trong hệ thống. Nếu `accountant` cũng cần quyền xóa nhóm vật tư, Business Authority cần confirm để cập nhật §4.2 + §9 trước khi implement.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-GRP-010** (CORNERSTONE): Không cho phép xóa nhóm vật tư khi đã có ít nhất 1 `internal_product` với `material_group_id` trỏ về nhóm đó trong cùng tenant — enforce tại `app/service/MaterialGroupService.java` trước delete. Vi phạm → `ERR-INV-004` + HTTP 409.
- **BR-CAT-GRP-011** (CORNERSTONE): Không cho phép xóa nhóm vật tư khi còn ít nhất 1 `material_group` có `parent_id` trỏ về nhóm đó trong cùng tenant — enforce tại `app/service/MaterialGroupService.java` trước delete. Vi phạm → `ERR-INV-005` + HTTP 409.

### 4.2 Tenant + auth

- Mọi query phải propagate `tenant_id` qua `TenantFilter` + `TenantContext` (Critical Rule #4). Cross-tenant fetch trả 404.
- Endpoint yêu cầu JWT Bearer token. Role `garage-owner` → cho phép. Role `accountant` → HTTP 403.
- `X-Tenant-Id` header phải match `data.tenantId` trong `TenantContext`.

### 4.3 Idempotency + concurrency

- DELETE là idempotent theo HTTP semantics: nếu record không tồn tại (đã xóa trước đó) → trả `404 Not Found` (không retry silent).
- Không cần `Idempotency-Key` header cho DELETE theo PKG convention (nhất quán với V2-5 PUT).
- Không có optimistic locking cần thiết cho delete — lock row tại DB transaction level là đủ.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-004` | 409 | AC-4 | TOAST (lỗi chặn xóa — "Nhóm đang có mã SP nội bộ") |
| `ERR-INV-005` | 409 | AC-5 | TOAST (lỗi chặn xóa — "Nhóm còn nhóm con") |
| `ERR-CMN-403` | 403 | AC-6 | TOAST (không có quyền) |
| `404 Not Found` | 404 | AC-2 | TOAST (nhóm không tồn tại) |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

Không có schema delta mới. Bảng `material_group` đã được tạo bởi `FEAT-CAT-GRP-CREATE` (migration `V20260624010000__create_material_group.sql`). Bảng `internal_product` đã tạo bởi `FEAT-CAT-PROD-CREATE` (migration `V20260624020000__create_internal_product.sql`). Feature DELETE chỉ thực hiện `DELETE FROM material_group WHERE id = ? AND tenant_id = ?` — không thêm/sửa cột.

| Entity | Relevant columns (read-only cho guard checks) | BR ref |
|---|---|---|
| `material_group` | `id UUID PK`, `tenant_id`, `parent_id UUID nullable` (tự tham chiếu — scalar FK) | BR-CAT-GRP-011 |
| `internal_product` | `material_group_id UUID nullable` (scalar FK → `material_group.id`) | BR-CAT-GRP-010 |

### 5.2 Index / constraint changes

Không có index mới. Guard check queries sử dụng các index đã tồn tại:

| Table | Index/constraint | Columns | Usage in delete guard |
|---|---|---|---|
| `material_group` | `idx_material_group_parent_id_tenant` (expected từ CREATE) | `(parent_id, tenant_id)` | Guard AC-5: count children |
| `internal_product` | `idx_internal_product_material_group_id` (expected từ CREATE) | `(material_group_id, tenant_id)` | Guard AC-4: count linked products |

> **NEED CONFIRMATION (2/5)**: Nếu `FEAT-CAT-GRP-CREATE` hoặc `FEAT-CAT-PROD-CREATE` chưa tạo các index trên, `FEAT-CAT-GRP-DELETE` cần thêm migration `V20260624070000__add_material_group_delete_guard_indexes.sql` để đảm bảo guard check không full-scan khi tenant có nhiều records. Confirm index coverage tại FEAT-CAT-GRP-CREATE BE spec.

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| DELETE | `/api/v2/material-groups/{id}` | JWT Bearer (garage-owner only) | — (path param `id` UUID) | `{ data: { id, code, name } }` HTTP 200 | safe-delete (404 on repeat) | AC-2, AC-4, AC-5, AC-6 |

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <jwt>",
    "X-Tenant-Id": "<tenantId>"
  },
  "path": {
    "id": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Response 200** (xóa thành công):
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "NHOM-001",
    "name": "Nhóm vật tư A"
  }
}
```

**Error responses**:

| HTTP | Error code | Condition |
|---|---|---|
| 404 | — | `id` không tồn tại hoặc không thuộc tenant hiện tại |
| 403 | `ERR-CMN-403` | Role không phải `garage-owner` |
| 409 | `ERR-INV-004` | Nhóm có `internal_product` gắn (BR-CAT-GRP-010) |
| 409 | `ERR-INV-005` | Nhóm có nhóm con (BR-CAT-GRP-011) |

### 6.2 Modified REST endpoints

Không có endpoint nào bị modify — đây là endpoint hoàn toàn mới.

### 6.3 Kafka topics

Không publish Kafka event cho delete operation này (PKG không đề cập outbox; delete nhóm là thao tác nội bộ catalog).

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode |
|---|---|---|---|
| `DELETE /api/v2/material-groups/{id}` | `agg-garage-graph` (BFF) | User confirm xóa từ web/mobile | Propagate HTTP error code về BFF → FE/Mobile |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-GRP-DELETE.md`) sẽ wrap endpoint này thành GraphQL mutation `deleteMaterialGroup(id: ID!): MaterialGroupDeleteResult`. KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**`. Cross-boundary touch chỉ qua §6.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/MaterialGroup.java` | REUSE | đã tạo từ FEAT-CAT-GRP-CREATE | 0 (no change) | — |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/MaterialGroupRepository.java` | ADDITIVE | thêm `countByParentIdAndTenantId(UUID parentId, String tenantId)` | ~5 | AC-5 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductRepository.java` | ADDITIVE | thêm `countByMaterialGroupIdAndTenantId(UUID groupId, String tenantId)` | ~5 | AC-4 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/MaterialGroupService.java` | ADDITIVE | thêm method `deleteMaterialGroup(UUID id)` + guard check calls | ~40 | AC-2, AC-4, AC-5, AC-6 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/MaterialGroupController.java` | ADDITIVE | thêm `@DeleteMapping("/{id}")` handler | ~20 | AC-2, AC-6 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/MaterialGroupServiceTest.java` | ADDITIVE | thêm test cases: happy path delete, guard ERR-INV-004, guard ERR-INV-005, RBAC 403 | ~80 | AC-2, AC-4, AC-5, AC-6 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/MaterialGroupControllerTest.java` | ADDITIVE | contract test DELETE endpoint | ~40 | AC-2, AC-4, AC-5 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Repository extension (finder methods)
    Entry: MaterialGroupRepository + InternalProductRepository đã tồn tại từ FEAT-CAT-GRP-CREATE
    Exit: countBy* methods compile, unit test stub green
    └─► S2

S2  Service logic — deleteMaterialGroup() + guard checks
    Entry: S1
    Exit: unit test ≥6 green (happy path + ERR-INV-004 + ERR-INV-005 + 404 + 403 + repeat-idempotent)
    └─► S3

S3  REST adapter — DELETE /api/v2/material-groups/{id}
    Entry: S2
    Exit: contract test green (200 + 403 + 404 + 409x2)
    └─► S4

S4  Integration test (tenant isolation + RBAC)
    Entry: S3 + gf-inventory running local
    Exit: integ test green (xác nhận TenantFilter isolate cross-tenant)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Thêm finder methods | domain/repository | Repository class tồn tại | Compile + unit stub green | — |
| S2 | Implement delete service logic | app/service | S1 | Unit test ≥6 green | S1 |
| S3 | REST DELETE endpoint | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test tenant isolation | test/integration | S3 + local stack | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

> BE là source-of-truth cho BR enforcement. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-CAT-GRP-010` | CORNERSTONE | service (primary) | `app/service/MaterialGroupService.java::deleteMaterialGroup()` — `countByMaterialGroupIdAndTenantId > 0` → throw ERR-INV-004 | AC-4 | `TC-BR-INV-GRP-010-*` |
| `BR-CAT-GRP-011` | CORNERSTONE | service (primary) | `app/service/MaterialGroupService.java::deleteMaterialGroup()` — `countByParentIdAndTenantId > 0` → throw ERR-INV-005 | AC-5 | `TC-BR-INV-GRP-011-*` |

> **Enforcement order trong `deleteMaterialGroup()`**: RBAC check (AC-6) → 404 guard → BR-CAT-GRP-010 (AC-4) → BR-CAT-GRP-011 (AC-5) → delete. Thứ tự này đảm bảo fail-fast với error code rõ ràng nhất.

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | — | — | UI-only, không có BE test |
| AC-2 | API contract + Integration | test-api | Happy path: 200 + record bị xóa không query được sau đó |
| AC-3 | — | — | UI-only, không có BE test |
| AC-4 | API contract (negative) | test-api | Guard: group có linked internal_product → 409 ERR-INV-004 |
| AC-5 | API contract (negative) | test-api | Guard: group có child group → 409 ERR-INV-005 |
| AC-6 | Isolation (RBAC) | test-isolation | accountant token → 403; garage-owner token → pass guards |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-GRP-DELETE.md` | PENDING | GraphQL mutation `deleteMaterialGroup(id: ID!)` wrap `DELETE /api/v2/material-groups/{id}`; propagate ERR-INV-004/005 → GraphQL error extension |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DELETE.md` | PENDING | Confirm popup (AC-1) + cancel (AC-3) + TOAST error display cho ERR-INV-004/005 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DELETE.md` | PENDING | Flutter confirm dialog (AC-1) + cancel (AC-3) + SnackBar/dialog error display |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) v2
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-6
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-6
- **ADR-009**: No JPA relationship mapping — `parent_id` scalar self-FK; `material_group_id` scalar FK
- **ADR-017**: Additive aggregate pattern — `material_group` entity độc lập trong gf-inventory

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-GRP-DELETE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ identical cross-tier, §2 trách nhiệm BE, §3 BE behaviour map 6 AC (AC-1 + AC-3 → N/A UI-only; AC-2/4/5/6 → BE behaviour), §4 ràng buộc + error codes (ERR-INV-004/005), §5 schema delta (no new migration), §6 REST DELETE V2-6, §7-§11 BE-specific. 2 NEED CONFIRMATION markers. |
