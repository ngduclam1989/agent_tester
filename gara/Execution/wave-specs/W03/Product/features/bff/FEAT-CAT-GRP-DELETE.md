---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-GRP-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DELETE"
source_feat_sha: "c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277"
generated_at: "2026-06-29T15:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["deleteMaterialGroup"]
paired_backend_feats: ["FEAT-CAT-GRP-DELETE"]
paired_fe_web_feats: ["FEAT-CAT-GRP-DELETE"]
paired_mobile_feats: ["FEAT-CAT-GRP-DELETE"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "N/A"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DELETE.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-DELETE (BFF): Xóa nhóm vật tư hàng hóa

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DELETE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `deleteMaterialGroup` |
| Cross-tier pair | BE: `FEAT-CAT-GRP-DELETE` \| Web: `FEAT-CAT-GRP-DELETE` \| Mobile: `FEAT-CAT-GRP-DELETE` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) |
| Source version | v2 |
| Source SHA | `c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` |
| Generated at | 2026-06-29T15:00:00Z |

---

## 1. Mục đích nghiệp vụ

Tính năng cho phép chủ garage xóa vĩnh viễn một nhóm vật tư hàng hóa không còn dùng khỏi danh mục phân cấp. Để bảo vệ tính toàn vẹn dữ liệu, hệ thống tự động ngăn xóa nhóm khi còn nhóm con hoặc khi đã có mã sản phẩm nội bộ được gắn vào nhóm đó. Đây là mắt xích hoàn thiện vòng đời CRUD nhóm vật tư, đảm bảo danh mục luôn gọn gàng và nhất quán trước khi các nghiệp vụ nhập/xuất kho V2 vận hành trên nền dữ liệu này.

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose mutation `deleteMaterialGroup(id: Int!): DeleteResponse!` (PKG V2-M3) trong SDL catalog domain.
- Resolver pattern **passthrough**: nhận `id` → forward `DELETE /api/v2/material-groups/{id}` xuống `gf-inventory`; không orchestrate thêm bước nào.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST trên mọi lời gọi.
- Map downstream error codes `ERR-INV-004` và `ERR-INV-005` lên `ErrorResponse` GraphQL shape để FE/Mobile hiển thị đúng constraint message.
- Enforce RBAC tại resolver: chỉ persona `garage-owner` hoặc `accountant` mới được gọi mutation (AC-6).
- Không cần DataLoader/batching — delete là thao tác đơn entity.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 6/6 source AC-IDs (bundle §C).

### Cluster A — Delete operation (AC-1, AC-2, AC-3)

#### AC-1 → N/A (FE/Mobile local UI — BFF không touch)

- Source AC-1 (popup xác nhận xóa) là trạng thái UI cục bộ do FE-web và Mobile quản lý trước khi gửi mutation. BFF không expose thêm op nào cho bước này.
- Xem `features/fe-web/FEAT-CAT-GRP-DELETE.md` §3 và `features/mobile/FEAT-CAT-GRP-DELETE.md` §3.

#### AC-2 → BFF expose `deleteMaterialGroup` mutation, passthrough đến gf-inventory V2-6

- **Khi**: FE/Mobile gửi mutation `deleteMaterialGroup(id: Int!)`.
- **BFF phải**: forward `DELETE /api/v2/material-groups/{id}` xuống `gf-inventory` với auth headers; trả `DeleteResponse` shape về client.
- **Downstream**: `gf-inventory` REST `DELETE /api/v2/material-groups/{id}` (V2-6) — `x-api-key` service-to-service auth.
- **Output shape**: `DeleteResponse` — thành công trả `DeleteApiResponse { success, code, message, data: DeleteResultData }` (result thật ở `data { id, code, success }` — tất cả nullable); lỗi trả `ErrorResponse`.
- **Failure mode**: downstream trả non-2xx → map lên `ErrorResponse` với `code` và `statusCode` tương ứng (xem §4.5).
- **Ref**: op `deleteMaterialGroup` (§6.1), resolver `src/resolvers/catalog/deleteMaterialGroup.ts` (§6.2), paired BE `FEAT-CAT-GRP-DELETE` §6.1 (V2-6).

#### AC-3 → N/A (FE/Mobile local UI — BFF không touch)

- Source AC-3 (hủy xóa, đóng popup) là action UI cục bộ — client không gửi gì xuống BFF. BFF không touch.
- Xem `features/fe-web/FEAT-CAT-GRP-DELETE.md` §3 và `features/mobile/FEAT-CAT-GRP-DELETE.md` §3.

### Cluster B — Constraint validation từ downstream (AC-4, AC-5)

#### AC-4 → BFF map `ERR-INV-004` lên `ErrorResponse` khi nhóm còn mã sản phẩm nội bộ

- **Khi**: gf-inventory reject request vì nhóm đang có `internal_product` gắn vào (BR-CAT-GRP-010).
- **BFF phải**: nhận HTTP 409 + body `{ errorCode: "ERR-INV-004" }` từ downstream → map thành `ErrorResponse { code: "ERR-INV-004", statusCode: 409, message: ... }` trong union `DeleteResponse`.
- **BFF không tự enforce** rule này — gf-inventory là primary enforcer. BFF chỉ relay đúng error shape.
- **Ref**: paired BE `FEAT-CAT-GRP-DELETE` §9 (BR-CAT-GRP-010 primary).

#### AC-5 → BFF map `ERR-INV-005` lên `ErrorResponse` khi nhóm còn nhóm con

- **Khi**: gf-inventory reject request vì nhóm vẫn còn nhóm con (BR-CAT-GRP-011).
- **BFF phải**: nhận HTTP 409 + body `{ errorCode: "ERR-INV-005" }` → map thành `ErrorResponse { code: "ERR-INV-005", statusCode: 409, message: ... }`.
- **BFF không tự enforce** rule này — gf-inventory là primary enforcer.
- **Ref**: paired BE `FEAT-CAT-GRP-DELETE` §9 (BR-CAT-GRP-011 primary).

### Cluster C — Phân quyền (AC-6)

#### AC-6 → BFF enforce RBAC: chỉ `garage-owner` / `accountant` được xóa nhóm vật tư

- **Khi**: mutation `deleteMaterialGroup` được gọi.
- **BFF phải**: kiểm tra JWT claim role trước khi forward downstream — reject ngay tại resolver nếu persona không hợp lệ.
- **Downstream**: không gọi gf-inventory nếu RBAC fail — tiết kiệm round-trip + giữ audit sạch.
- **Output shape**: RBAC fail → `ErrorResponse { code: "UNAUTHORIZED", statusCode: 403 }`.
- **Ref**: `src/auth/catalogDeleteGuard.ts` (§6.2), BR-CAT-CMN-RBAC (secondary enforcement tại BFF).

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- Tenant context resolve từ JWT — KHÔNG accept `tenantId` từ client args (phòng tenant spoofing).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Delete là thao tác đơn entity — không cần DataLoader.
- Không cache mutation (cache-control `maxAge: 0`).

### 4.3 Security + data exposure

- KHÔNG log `id` nhóm vật tư kèm `tenantId` trong prod logs dưới dạng plain text.
- Tenant scope enforce qua JWT header — query gf-inventory đã tenant-scoped tại BE; BFF không cần double-check tại data layer.

### 4.4 Contract stability

- `DeleteResponse` union type — additive only. Không xóa member type hoặc field đã publish.
- `deleteMaterialGroup` mutation argument `id: Int!` — breaking change (rename/type change) → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (gf-inventory) | HTTP | GraphQL `ErrorResponse.code` | Source AC |
|---|---|---|---|
| `ERR-INV-004` | 409 | `ERR-INV-004` | AC-4 |
| `ERR-INV-005` | 409 | `ERR-INV-005` | AC-5 |
| `GMS.gf-inventory.*.02` (x-api-key fail) | 403 | `DOWNSTREAM_AUTH_ERROR` | — |
| `GMS.gf-inventory.*.03` (not found) | 404 | `NOT_FOUND` | AC-2 |
| `GMS.gf-inventory.*.06` (internal) | 500 | `INTERNAL_SERVER_ERROR` | — |

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Members / Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `DeleteResponse` | union | `DeleteApiResponse \| ErrorResponse` | NO (new) — NEED CONFIRMATION #1 | AC-2 |
| `DeleteApiResponse` | object (implements `ApiResponse`) | `success: Boolean, code: String, message: String, data: DeleteResultData` | NO (new) | AC-2 |
| `DeleteResultData` | object | `id: Int, code: String, success: Boolean` (tất cả nullable) | NO (new) | AC-2 |

> **NEED CONFIRMATION #1**: Xác nhận `DeleteResponse` chưa tồn tại trong `Architecture/api/agg-garage-graph-graphql.md` SDL. Nếu chưa có, thêm `union DeleteResponse = DeleteApiResponse | ErrorResponse` cùng `type DeleteApiResponse implements ApiResponse { success: Boolean, code: String, message: String, data: DeleteResultData }` và `type DeleteResultData { id: Int, code: String, success: Boolean }`. Nếu đã có union cùng tên nhưng member khác → cần CR MAJOR để reconcile.

### 5.2 Modified types (additive)

| Type | Field / operation added | Signature | Nullable | AC ref |
|---|---|---|---|---|
| `Mutation` | `deleteMaterialGroup` | `deleteMaterialGroup(id: Int!): DeleteResponse!` | non-null | AC-2, AC-6 |

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `deleteMaterialGroup` | mutation | `id: Int!` | `DeleteResponse!` | JWT (garage-owner \| accountant) | AC-2, AC-6 |

**Sample request**:
```json
{
  "operationName": "DeleteMaterialGroup",
  "query": "mutation DeleteMaterialGroup($id: Int!) { deleteMaterialGroup(id: $id) { __typename ... on DeleteApiResponse { success code message data { id code success } } ... on ErrorResponse { code message statusCode } } }",
  "variables": { "id": 1 }
}
```

**Sample success response**:
```json
{
  "data": {
    "deleteMaterialGroup": {
      "__typename": "DeleteApiResponse",
      "success": true,
      "code": "SUCCESS",
      "message": "Xóa nhóm vật tư thành công",
      "data": { "id": 1, "code": "NVL001", "success": true }
    }
  }
}
```

**Sample error response (AC-4)**:
```json
{
  "data": {
    "deleteMaterialGroup": {
      "__typename": "ErrorResponse",
      "code": "ERR-INV-004",
      "message": "Nhóm vật tư đang có mã sản phẩm nội bộ — không thể xóa",
      "statusCode": 409
    }
  }
}
```

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `deleteMaterialGroup` | `bffs/agg-garage-graph/src/resolvers/catalog/deleteMaterialGroup.ts` | `FEAT-CAT-GRP-DELETE` (BE §6.1 V2-6) | `DELETE /api/v2/material-groups/{id}` | — (no batch) | AC-2, AC-4, AC-5, AC-6 |

### 6.3 DataLoader / batching strategy

Không cần DataLoader — `deleteMaterialGroup` là thao tác đơn entity không có sub-field resolution.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `deleteMaterialGroup` | `@cacheControl(maxAge: 0)` | — | — | mutation, không cache |

### 6.5 Persisted query allowlist

| Query name | Hash | AC ref |
|---|---|---|
| `DeleteMaterialGroup` | (generate khi impl) | AC-2 |

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (boundary isolation rule #1).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/catalog.graphql` | MODIFY (additive) | extend SDL — thêm `union DeleteResponse` + mutation field | ~8 | AC-2 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/deleteMaterialGroup.ts` | NEW | resolver passthrough pattern (tương tự `deleteCampaign`) | ~45 | AC-2, AC-6 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | new method `deleteMaterialGroup(id, headers)` | ~20 | AC-2 |
| `auth/` | `bffs/agg-garage-graph/src/auth/catalogDeleteGuard.ts` | NEW (nếu chưa có guard catalog) | RBAC guard pattern | ~25 | AC-6 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog-delete.test.ts` | NEW | Apollo test client pattern | ~70 | AC-2, AC-4, AC-5 |

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory DELETE /api/v2/material-groups/{id} integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-CAT-GRP-DELETE §6 contracts stable (V2-6 endpoint deployed)
    Exit: BFF contract test green + RBAC guard test pass
    └─► (hand-off FE-web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Thêm SDL: `union DeleteResponse` + mutation `deleteMaterialGroup` | `schema/catalog.graphql` | — | SDL additive build pass | — |
| S5.2 | Impl resolver + data-source method | `resolvers/catalog/` + `data-sources/` | S5.1 | Resolver forward đúng endpoint + header | S5.1 |
| S5.3 | RBAC guard cho mutation | `auth/catalogDeleteGuard.ts` | S5.2 | Dual-persona test: owner=pass, non-persona=403 | S5.2 |
| S5.4 | Integration test (success + ERR-INV-004 + ERR-INV-005) | `tests/integration/` | S5.3 + BE V2-6 stable | All test cases green | S5.3 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement = BE tier (gf-inventory). BFF chỉ enforce auth context + schema constraints.

| BR ID | Severity | Enforcement tại BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-010` | CORNERSTONE | Secondary (error relay) | `resolvers/catalog/deleteMaterialGroup.ts` | AC-4 | Primary enforcement tại BE; BFF map ERR-INV-004 → ErrorResponse |
| `BR-CAT-GRP-011` | CORNERSTONE | Secondary (error relay) | `resolvers/catalog/deleteMaterialGroup.ts` | AC-5 | Primary enforcement tại BE; BFF map ERR-INV-005 → ErrorResponse |
| RBAC (garage-owner \| accountant) | CORNERSTONE | Primary (auth guard) | `auth/catalogDeleteGuard.ts` | AC-6 | BFF enforce trước khi gọi downstream |
| Tenant isolation (TenantContext) | CORNERSTONE | Relay (JWT header forward) | `data-sources/GfInventoryDataSource.ts` | — | BE là primary; BFF forward X-Tenant-Id đúng từ JWT |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration (resolver → gf-inventory) | test-api | Mock downstream gf-inventory V2-6; verify DELETE path + header forwarding |
| AC-4 | BFF error mapping | test-api | Mock gf-inventory 409 ERR-INV-004 → kiểm tra `ErrorResponse.code` = `"ERR-INV-004"` |
| AC-5 | BFF error mapping | test-api | Mock gf-inventory 409 ERR-INV-005 → kiểm tra `ErrorResponse.code` = `"ERR-INV-005"` |
| AC-6 | BFF auth (RBAC) | test-isolation | Dual persona: `garage-owner` → pass, non-persona JWT → 403 `ErrorResponse` |
| — | SDL contract snapshot | test-api | Snapshot `deleteMaterialGroup` mutation + `DeleteResponse` union — detect breaking change |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DELETE.md` | DRAFT (pending) | Downstream V2-6 endpoint — BFF resolver wrap; primary BR enforcement ở đây |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DELETE.md` | DRAFT (pending) | Consume `deleteMaterialGroup` mutation từ §6.1; handle AC-1/AC-3 popup UI |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DELETE.md` | DRAFT (pending) | Consume `deleteMaterialGroup` mutation từ §6.1; handle AC-1/AC-3 popup UI |

**Source ID consistency** (item #18): `source_feat_sha` = `c54ba6ef6099250e80d50b065be504b42d360d0a27ebb6ac7ee5825da4c26277` — identical cross-tier.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DELETE.md`](../../../../../Product/features/FEAT-CAT-GRP-DELETE.md) v2
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DELETE.md`](../be/FEAT-CAT-GRP-DELETE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Additive aggregates — `material_group` entity strategy trong gf-inventory

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-CAT-GRP-DELETE` W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough pattern, §3 BFF behaviour map 6 AC-IDs (AC-1/AC-3 N/A FE/Mobile local UI; AC-2 mutation expose; AC-4/AC-5 error relay; AC-6 RBAC guard), §4 auth + perf + error mapping, §5 SDL delta (union DeleteResponse NEW — NEED CONFIRMATION #1), §6 ops contract + sample, §7 file map ⊆ bffs/agg-garage-graph/**, §8 S5 DAG, §9 BR secondary, §10 test scope, §11 cross-tier. |
| 2026-07-01 | 2 | main agent (quannn) | Đối chiếu code thực tế agg-garage-graph (audit 2026-07-01) — sửa `DeleteResponse` union member `ApiResponseString` → `DeleteApiResponse` (§3 AC-2, §5.1, §6.1 sample query + success response, NEED CONFIRMATION #1); bổ sung shape thật `DeleteApiResponse implements ApiResponse { success, code, message, data: DeleteResultData }` + `DeleteResultData { id, code, success }` (tất cả nullable, result nằm ở `data.*` không phẳng trên response). Argument `id: Int!` giữ nguyên (đã khớp code). |
