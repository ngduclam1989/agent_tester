---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-DELETE.md"
source_version: 2
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-DELETE"
source_feat_sha: "dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246"
generated_at: "2026-06-29T14:40:00+00:00"
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
graphql_ops: ["deleteInternalProduct"]
paired_backend_feats: ["FEAT-CAT-PROD-DELETE"]
paired_fe_web_feats: ["FEAT-CAT-PROD-DELETE"]
paired_mobile_feats: ["FEAT-CAT-PROD-DELETE"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "{{sha256-fanout-map}}"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-DELETE.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-DELETE (BFF): Xóa mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-DELETE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `deleteInternalProduct` (mutation V2-M6) |
| Cross-tier pair | BE: `FEAT-CAT-PROD-DELETE` \| Web: `FEAT-CAT-PROD-DELETE` \| Mobile: `FEAT-CAT-PROD-DELETE` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) |
| Source version | v2 |
| Source SHA | `dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần loại bỏ các mã sản phẩm nội bộ không còn dùng để danh mục vật tư không bị thừa và gây nhầm lẫn trong nghiệp vụ kho. Hệ thống bảo vệ tính toàn vẹn bằng cách từ chối xóa bất kỳ mã nào đã phát sinh giao dịch nhập kho, xuất kho, hoặc có tồn kho — chỉ xóa được khi mã thực sự chưa được dùng trong vận hành. Feature này là thao tác hủy bỏ trong luồng quản lý danh mục catalog V2 của wave W03.

---

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL mutation `deleteInternalProduct(id: Int!): DeleteResponse!` (V2-M6) cho FE-web và Mobile tiêu thụ.
- Passthrough thuần tới gf-inventory `DELETE /api/v2/internal-products/{id}` (V2-12) — không orchestrate thêm phase nào.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory mọi request.
- Map lỗi downstream `ERR-INV-008` (BE trả khi mã đã phát sinh dữ liệu sử dụng) sang GraphQL error với `extensions.code = "ERR-INV-008"` và message tường minh để FE/Mobile hiển thị.
- Enforce RBAC tại resolver: chỉ persona `garage-owner` được thực thi mutation xóa (AC-5).

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 5 AC từ bundle §C đều được khai báo bên dưới.

### Cluster A — Xác nhận và thực hiện xóa

#### AC-1 → N/A (FE local UI)

- Source AC này xử lý việc hiển thị popup xác nhận xóa — đây là FE/Mobile local UI state, BFF không touch.
- Xem `features/fe-web/FEAT-CAT-PROD-DELETE.md §3` và `features/mobile/FEAT-CAT-PROD-DELETE.md §3`.

#### AC-2 → BFF forward mutation xóa tới gf-inventory

- **Khi**: FE/Mobile gửi mutation `deleteInternalProduct(id: Int!)` sau khi người dùng xác nhận xóa.
- **BFF phải**: passthrough `id` tới gf-inventory `DELETE /api/v2/internal-products/{id}` kèm đầy đủ auth headers; trả member `DeleteApiResponse` của union `DeleteResponse` với `data.success = true` khi BE trả HTTP 200/204.
- **Downstream**: `DELETE /api/v2/internal-products/{id}` — gf-inventory (V2-12).
- **Output shape**: `union DeleteResponse = DeleteApiResponse | ErrorResponse`; success case resolve `DeleteApiResponse { success: Boolean, code: String, message: String, data: DeleteResultData { id: Int, code: String, success: Boolean } }` (tất cả field nullable).
- **Failure mode**: bất kỳ lỗi non-2xx từ BE → resolver throw `GraphQLError` với `extensions.code` tương ứng (xem §4.5).
- **Ref**: op `deleteInternalProduct` (§6.1), resolver `src/resolvers/catalog/deleteInternalProduct.ts` (§6.2), paired BE FEAT-CAT-PROD-DELETE §6.

#### AC-3 → N/A (FE local UI)

- Source AC này xử lý hành động hủy dialog xóa — FE/Mobile đóng modal mà không gọi mutation. BFF không touch.
- Xem `features/fe-web/FEAT-CAT-PROD-DELETE.md §3`.

### Cluster B — Chặn xóa khi có dữ liệu sử dụng

#### AC-4 → BFF surface lỗi ERR-INV-008 từ BE

- **Khi**: FE/Mobile gửi mutation `deleteInternalProduct(id)` cho mã đã phát sinh giao dịch kho.
- **BFF phải**: nhận HTTP 422 + `ERR-INV-008` từ gf-inventory, map sang `GraphQLError` với `extensions.code = "ERR-INV-008"` và `message` mô tả lý do từ chối. KHÔNG nuốt lỗi hay trả `success: false` im lặng.
- **Downstream**: gf-inventory V2-12 trả 422 (BE enforce BR-CAT-PROD-016 primary).
- **Output shape**: GraphQL `errors[]` array với extension code.
- **Failure mode**: BFF chỉ relay lỗi BE — KHÔNG tự validate điều kiện phát sinh dữ liệu (đó là BE primary).
- **Ref**: error mapping §4.5, paired BE FEAT-CAT-PROD-DELETE §9 (BR-CAT-PROD-016 enforcement).

### Cluster C — Phân quyền

#### AC-5 → BFF enforce RBAC tại resolver entry

- **Khi**: bất kỳ request nào gọi mutation `deleteInternalProduct`.
- **BFF phải**: kiểm tra JWT claims tại resolver entry — chỉ cho phép persona `garage-owner`; persona `accountant` nhận `GraphQLError` với `extensions.code = "FORBIDDEN"` và HTTP 403.
- **Downstream**: gf-inventory KHÔNG được gọi nếu auth guard fail.
- **Output shape**: GraphQL `errors[]` với code `FORBIDDEN`.
- **Ref**: resolver guard (§6.2), BR enforcement §9.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory.
- Firebase token verify per request (production); dev/local bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Mutation `deleteInternalProduct` là single-resource op — không có nested resolution; DataLoader không cần thiết.
- Không cache mutation response (`@cacheControl(maxAge: 0, scope: PRIVATE)` mặc định cho mọi mutation).

### 4.3 Security + data exposure

- KHÔNG log JWT, `X-Tenant-Id`, hoặc payload request trong resolver.
- Tenant scope: `tenantId` lấy từ JWT context, KHÔNG nhận từ mutation args (client-controlled injection risk).

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` keep old.
- Breaking change (rename mutation / đổi return type) → CR MAJOR.

### 4.5 Error code mapping

> Lỗi nghiệp vụ resolve qua union `DeleteResponse` → `ErrorResponse` member (không throw `GraphQLError`). Lỗi infra (5xx) → `GraphQLError` thrown.

| Downstream error (BE) | HTTP BE | Resolution | Code / Message hint | Source AC |
|---|---|---|---|---|
| `ERR-INV-008` | 422 | `ErrorResponse` member | code `ERR-INV-008` — "Mã sản phẩm đã phát sinh dữ liệu sử dụng, không thể xóa" | AC-4 |
| `404 Not Found` | 404 | `ErrorResponse` member | code `NOT_FOUND` — "Mã sản phẩm không tồn tại hoặc không thuộc tenant hiện tại" | AC-2 |
| `403 Forbidden` (JWT persona) | 401/403 | `GraphQLError` thrown | `FORBIDDEN` — "Không có quyền thực hiện thao tác này" | AC-5 |
| `5xx Internal` | 500/502 | `GraphQLError` thrown | `INTERNAL_SERVER_ERROR` — generic | AC-2 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Members | Breaking? | AC ref |
|---|---|---|---|---|
| `DeleteResponse` | union | `DeleteApiResponse \| ErrorResponse` | NO (new) | AC-2, AC-4 |
| `DeleteApiResponse` | object (implements `ApiResponse`) | `success: Boolean, code: String, message: String, data: DeleteResultData` | NO (new) | AC-2 |
| `DeleteResultData` | object | `id: Int, code: String, success: Boolean` (tất cả nullable) | NO (new) | AC-2 |

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Mutation` (root) | `deleteInternalProduct` | `(id: Int!): DeleteResponse!` | non-null | AC-2, AC-5 |

> **Breaking changes** → REJECT. Field rename → `@deprecated(reason: "...")`.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `deleteInternalProduct` | mutation | `id: Int!` | `DeleteResponse!` | JWT + tenantId (garage-owner only) | AC-2, AC-4, AC-5 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `deleteInternalProduct` | `src/resolvers/catalog/deleteInternalProduct.ts` | `FEAT-CAT-PROD-DELETE` (BE §6) | `DELETE /api/v2/internal-products/{id}` (V2-12) | — (single-resource, no batch) | AC-2, AC-4, AC-5 |

**Resolver logic outline** (không code — chỉ mô tả luồng):
1. Auth guard: verify JWT persona = `garage-owner` → throw `FORBIDDEN` nếu fail (AC-5).
2. Extract `tenantId` từ JWT context (KHÔNG từ args).
3. Gọi `GfInventoryDataSource.deleteInternalProduct(id)` với headers propagated.
4. HTTP 200/204 → trả `DeleteResponse` resolved as `DeleteApiResponse { success: true, code: ..., message: ..., data: DeleteResultData { id, code, success } }`.
5. HTTP 422 + `ERR-INV-008` → resolve as `ErrorResponse { code: "ERR-INV-008", message: "..." }` (AC-4).
6. HTTP 404 → resolve as `ErrorResponse { code: "NOT_FOUND", ... }`.
7. HTTP 5xx → throw `INTERNAL_SERVER_ERROR`.

### 6.3 DataLoader / batching strategy

Mutation xóa đơn lẻ — không yêu cầu DataLoader hay batching. N/A cho feature này.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `deleteInternalProduct` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | Mutation, không cache |

### 6.5 Persisted query allowlist

| Query name | AC ref | Notes |
|---|---|---|
| `DeleteInternalProductMutation` | AC-2 | Đăng ký vào allowlist khi enable persisted query |

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/catalog.graphql` | MODIFY (additive) | extend SDL — thêm mutation + type `DeleteResponse` nếu chưa có | ~10 | AC-2 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/deleteInternalProduct.ts` | NEW | resolver passthrough pattern | ~50 | AC-2, AC-4, AC-5 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | thêm method `deleteInternalProduct(id: number)` | ~20 | AC-2 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog-prod-delete.test.ts` | NEW | apollo test client + mock gf-inventory | ~80 | AC-2, AC-4, AC-5 |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: gf-inventory DELETE /api/v2/internal-products/{id} integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-CAT-PROD-DELETE §6 contract stable (V2-12 endpoint ready)
    Exit:  BFF contract test green (deleteInternalProduct mutation + ERR-INV-008 mapping)
    └─► (hand-off FE-web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Extend SDL: thêm `DeleteResponse` (nếu chưa có) + mutation field | `src/schema/catalog.graphql` | — | schema compile pass | — |
| S5.2 | Thêm method `deleteInternalProduct` vào `GfInventoryDataSource` | `src/data-sources/` | S5.1 | method call gf-inventory V2-12 | S5.1 |
| S5.3 | Implement resolver: auth guard + passthrough + error map | `src/resolvers/catalog/deleteInternalProduct.ts` | S5.1, S5.2 | resolver unit test pass | S5.2 |
| S5.4 | Integration test: mock BE 200/422/404/403 → verify GraphQL response | `tests/integration/` | S5.3, BE V2-12 stable | contract test green | S5.3 |

## 9. Business Rules enforced (BFF — secondary)

> BE (gf-inventory) là primary enforcer của mọi BR nghiệp vụ. BFF chỉ surface kết quả.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-016` | CORNERSTONE | Surface ERR-INV-008 từ BE (error mapping §4.5) | `src/resolvers/catalog/deleteInternalProduct.ts` | AC-4 | BE là primary enforcer; BFF chỉ relay lỗi |
| RBAC — `garage-owner` only | CORNERSTONE | Auth guard tại resolver entry | `src/resolvers/catalog/deleteInternalProduct.ts` | AC-5 | Persona check từ JWT claims |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-PROD-DELETE.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration (resolver → gf-inventory mock) | test-api | Verify `DELETE /api/v2/internal-products/{id}` được gọi với đúng headers; response `{ success: true }` |
| AC-4 | BFF error mapping | test-api | Mock gf-inventory trả HTTP 422 + `ERR-INV-008`; verify GraphQL error có `extensions.code = "ERR-INV-008"` |
| AC-5 | BFF auth (RBAC) | test-isolation | Gọi mutation với JWT persona `accountant` → expect `FORBIDDEN`; persona `garage-owner` → pass |
| — | Schema contract | test-api | Snapshot SDL thêm mutation `deleteInternalProduct`; verify return type `DeleteResponse!` |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-DELETE.md` | DRAFT (pending) | Downstream REST V2-12 `DELETE /api/v2/internal-products/{id}` — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-DELETE.md` | DRAFT (pending) | Consume mutation `deleteInternalProduct` từ §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-DELETE.md` | DRAFT (pending) | Consume mutation `deleteInternalProduct` từ §6.1 |

**Source ID consistency** (item 18): `source_feat_sha` = `dccb7a05a1f14d3eac063775d25e624a1a4f42cfc1b7cc180ea43fe039c32246` — identical với BE/FE-web/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-DELETE.md`](../../../../../Product/features/FEAT-CAT-PROD-DELETE.md) v2
- **Paired BE**: [`features/be/FEAT-CAT-PROD-DELETE.md`](../be/FEAT-CAT-PROD-DELETE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **ADR-017**: Additive aggregates — InternalProduct entity trong gf-inventory.

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-CAT-PROD-DELETE` W03. Mutation V2-M6 `deleteInternalProduct(id: Int!): DeleteResponse!` passthrough tới gf-inventory V2-12; ERR-INV-008 mapping; RBAC garage-owner only. Policy v2 tier-authoritative. |
| 2026-07-01 | 2 | main agent | Sửa union member + response shape cho khớp code thực tế agg-garage-graph (audit 2026-07-01): §5.1 union member `ApiResponseString → DeleteApiResponse` + thêm type `DeleteApiResponse`/`DeleteResultData`; §3 AC-2 + §6.2 output shape phẳng `DeleteResponse { success, message }` → union với data nested `DeleteApiResponse { success, code, message, data: DeleteResultData { id, code, success } }` (tất cả nullable); bỏ NEED CONFIRMATION reuse ApiResponseString (đã xác nhận từ code). |
