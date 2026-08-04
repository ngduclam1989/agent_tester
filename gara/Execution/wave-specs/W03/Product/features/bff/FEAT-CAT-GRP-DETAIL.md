---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-GRP-DETAIL.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-DETAIL"
source_feat_sha: "d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2"
generated_at: "2026-06-29T15:00:00+00:00"
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
graphql_ops: ["getMaterialGroup"]
paired_backend_feats: ["FEAT-CAT-GRP-DETAIL"]
paired_fe_web_feats: ["FEAT-CAT-GRP-DETAIL"]
paired_mobile_feats: ["FEAT-CAT-GRP-DETAIL"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-DETAIL.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-DETAIL (BFF): Xem chi tiết nhóm vật tư hàng hóa

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-DETAIL` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `getMaterialGroup` |
| Cross-tier pair | BE: FEAT-CAT-GRP-DETAIL \| Web: FEAT-CAT-GRP-DETAIL \| Mobile: FEAT-CAT-GRP-DETAIL |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) |
| Source version | v4 |
| Source SHA | `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Feature cung cấp khả năng tra cứu toàn bộ thông tin của một nhóm vật tư hàng hóa (MaterialGroup) trong danh mục kho, bao gồm thông tin mô tả, trạng thái, cấu trúc phân cấp, và lịch sử tạo/cập nhật (audit trail). Chủ garage và kế toán cần thấy đầy đủ nội dung nhóm trước khi quyết định chỉnh sửa hoặc xóa, giảm rủi ro thao tác nhầm. Feature này là điểm đọc trung tâm trong luồng CRUD nhóm VTHH của EP-INVENTORY-CATALOG, phục vụ nền dữ liệu vật tư chuẩn hóa cho toàn bộ nghiệp vụ kho V2 downstream.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query `getMaterialGroup(id: Int!): MaterialGroupResponse!` phục vụ cả FE-web và Mobile client truy vấn chi tiết nhóm VTHH.
- Resolver passthrough: gọi `GET /api/v2/material-groups/{id}` trên gf-inventory, passthrough toàn bộ scalar fields từ response (code, name, description, parentId, parentName, status, audit timestamps).
- Enrich `createdByName` và `updatedByName` từ userId fields `createdBy`/`updatedBy` qua Pattern TENANT-USERS `enrichObjectWithByNames` — không cần downstream call thêm ngoài pattern này.
- `parentName` là backend-native — gf-inventory resolve sẵn trong response V2-3; BFF passthrough trực tiếp, KHÔNG cần thêm call enrichment cho parent.
- Propagate headers `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống mọi downstream call tới gf-inventory.
- Map HTTP error từ gf-inventory (404/401/403/500) sang `ErrorResponse` GraphQL union branch.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 7 source AC-IDs phải xuất hiện tại §3 hoặc §4.

### Cluster A — Query và hiển thị dữ liệu

#### AC-1 → BFF expose query tra cứu chi tiết nhóm VTHH

- **Khi**: FE-web hoặc Mobile gửi `query getMaterialGroup(id: Int!)`.
- **BFF phải**: resolver gọi gf-inventory `GET /api/v2/material-groups/{id}`, compose response vào `MaterialGroupApiResponse.data` và trả `MaterialGroupResponse` union về client.
- **Downstream**: `GET /api/v2/material-groups/{id}` (gf-inventory, V2-3) — auth bearer passthrough.
- **Output shape**: `MaterialGroupResponse` (union `MaterialGroupApiResponse | ErrorResponse`).
- **Failure mode**: gf-inventory 404 → `ErrorResponse { statusCode: 404, code: "NOT_FOUND" }`; gf-inventory 500 → `ErrorResponse { statusCode: 500 }`.
- **Ref**: op `getMaterialGroup` (§6.1), resolver `src/resolvers/catalog/getMaterialGroup.ts` (§6.2), paired BE `FEAT-CAT-GRP-DETAIL` be/ §6.1.

#### AC-2 → BFF passthrough đầy đủ scalar fields của nhóm VTHH

- **Khi**: gf-inventory trả response V2-3 thành công.
- **BFF phải**: map toàn bộ scalar fields vào `MaterialGroup` type — `id`, `code`, `name`, `description`, `parentId`, `parentName`, `status`, `childrenCount`, `productCount` — không drop, không transform giá trị.
- **Downstream**: response từ `GET /api/v2/material-groups/{id}` đã chứa `parentName` (backend-native, gf-inventory tự resolve từ scalar FK); BFF không cần gọi thêm.
- **Output shape**: `MaterialGroup` fields lên client theo GraphQL field selection của FE/Mobile.
- **Failure mode**: field null từ BE → null trong response (không substitute).

#### AC-3 → BFF enrich tên người tạo/cập nhật qua Pattern TENANT-USERS

- **Khi**: gf-inventory response chứa `createdBy` và `updatedBy` (userId string).
- **BFF phải**: gọi `enrichObjectWithByNames(object, ['createdBy', 'updatedBy'])` để resolve `createdByName` và `updatedByName` (tên hiển thị người dùng thuộc tenant). Trả thêm `createdAt`, `updatedAt` passthrough.
- **Downstream**: Pattern TENANT-USERS (internal BFF utility — batch resolve user display names per tenant; không expose downstream endpoint riêng sang gf-hrms trong phạm vi resolver này trừ khi pattern đã định nghĩa call).
- **Output shape**: `MaterialGroup.createdByName: String`, `MaterialGroup.updatedByName: String` — nullable nếu user không còn tồn tại trong tenant.
- **Failure mode**: enrich fail → log warn, trả `null` cho name fields, KHÔNG abort query.

#### AC-4 → N/A

- Source AC này chỉ là điều hướng UI (chuyển sang màn chỉnh sửa). BFF không touch — xem `fe-web/FEAT-CAT-GRP-DETAIL.md` và `mobile/FEAT-CAT-GRP-DETAIL.md`.

#### AC-5 → N/A

- Source AC này chỉ là điều hướng UI (quay lại danh sách). BFF không touch — xem `fe-web/FEAT-CAT-GRP-DETAIL.md` và `mobile/FEAT-CAT-GRP-DETAIL.md`.

### Cluster B — Phân quyền và phạm vi nền tảng

#### AC-6 → BFF enforce auth guard + propagate permission context

- **Khi**: client gửi `getMaterialGroup` với token hợp lệ hoặc thiếu token.
- **BFF phải**: validate `Authorization` header hiện diện trước khi forward tới gf-inventory. Token invalid/thiếu → trả `ErrorResponse { statusCode: 401 }` ngay tại BFF layer, không forward. Token hợp lệ nhưng gf-inventory trả 403 → map sang `ErrorResponse { statusCode: 403 }` — RBAC primary check ở BE.
- **Downstream**: gf-inventory enforce tenant isolation + permission check; BFF chỉ propagate header, không duplicate permission logic.
- **Failure mode**: 401 (no/invalid token) tại BFF; 403 (no permission) từ gf-inventory passthrough mapped.

#### AC-7 → BFF expose 1 unified query cho cả web và mobile

- **Khi**: FE-web hoặc Mobile gọi `getMaterialGroup`.
- **BFF phải**: không có platform-specific variant — cùng 1 query `getMaterialGroup(id: Int!)` phục vụ cả hai platform. Client tự chọn field selection theo nhu cầu render.
- **Downstream**: 1 call duy nhất `GET /api/v2/material-groups/{id}` (gf-inventory) không phân biệt client platform.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `GET /api/v2/material-groups/{id}`.
- KHÔNG truyền tenantId qua query args — resolve từ JWT context.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance

- Query đơn (1 downstream call) — không cần DataLoader cho `getMaterialGroup`.
- `enrichObjectWithByNames` nên dùng batch nội bộ nếu pattern support nhiều userId trong 1 call để tránh 2 round-trips riêng.
- Cache hint: `@cacheControl(maxAge: 30, scope: PRIVATE)` — read-only, invalidate nếu FEAT-CAT-GRP-EDIT mutation complete (subscription hoặc manual).

### 4.3 Security + data exposure

- KHÔNG log `Authorization` header / JWT trong resolver.
- Tenant isolation: gf-inventory enforce — BFF không cần filter thêm nhưng KHÔNG cho phép client override `tenantId` qua arg.

### 4.4 Contract stability

- Schema additive only. `MaterialGroup`, `MaterialGroupApiResponse`, `MaterialGroupResponse` là types mới — KHÔNG breaking.
- Nếu sau này cần deprecate field → `@deprecated(reason: "...")`, giữ nguyên field, KHÔNG xóa hard.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (gf-inventory) | GraphQL error (ErrorResponse) | Source AC |
|---|---|---|
| HTTP 404 (group not found) | `statusCode: 404, code: "NOT_FOUND"` | AC-1 |
| HTTP 401 (unauthorized) | `statusCode: 401` (tại BFF hoặc passthrough) | AC-6 |
| HTTP 403 (forbidden) | `statusCode: 403` | AC-6 |
| HTTP 500 (internal error) | `statusCode: 500` | AC-1 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `MaterialGroup` | type | `id: Int!`, `code: String!`, `name: String!`, `description: String`, `parentId: Int`, `parentName: String`, `status: MaterialGroupStatus!`, `childrenCount: Int`, `productCount: Int`, `createdAt: String`, `updatedAt: String`, `createdBy: String`, `updatedBy: String`, `createdByName: String`, `updatedByName: String` | NO (new) | AC-2, AC-3 |
| `MaterialGroupApiResponse` | type (implements ApiResponse) | `success: Boolean`, `code: String`, `message: String`, `data: MaterialGroup` | NO (new) | AC-1 |
| `MaterialGroupResponse` | union | `MaterialGroupApiResponse \| ErrorResponse` | NO (new) | AC-1, AC-6 |

> `MaterialGroupStatus` enum (`ACTIVE`, `INACTIVE`) có thể đã được thêm bởi FEAT-CAT-GRP-LIST SDL — nếu đã tồn tại thì reuse, KHÔNG redeclare. `ErrorResponse` đã có sẵn trong schema baseline.

### 5.2 Modified types (additive — backward-compat)

| Type | Field added | Type | Notes |
|---|---|---|---|
| `Query` | `getMaterialGroup` | `getMaterialGroup(id: Int!): MaterialGroupResponse!` | New query entry |

> Schema additive — không thay đổi type đã có.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `getMaterialGroup` | query | `id: Int!` | `MaterialGroupResponse!` | JWT + tenantId | AC-1, AC-2, AC-3, AC-6, AC-7 |

**Sample query (client-side):**

```graphql
query GetMaterialGroupDetail($id: Int!) {
  getMaterialGroup(id: $id) {
    __typename
    ... on MaterialGroupApiResponse {
      success
      code
      message
      data {
        id
        code
        name
        description
        parentId
        parentName
        status
        childrenCount
        productCount
        createdAt
        updatedAt
        createdBy
        updatedBy
        createdByName
        updatedByName
      }
    }
    ... on ErrorResponse {
      id
      code
      message
      statusCode
      path
      timestamp
    }
  }
}
```

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `getMaterialGroup` | `src/resolvers/catalog/getMaterialGroup.ts` | `FEAT-CAT-GRP-DETAIL` (BE §6.1) | `GET /api/v2/material-groups/{id}` | none (single call) | AC-1 |
| `getMaterialGroup` (enrich) | trong cùng resolver | Pattern TENANT-USERS | `enrichObjectWithByNames(obj, ['createdBy','updatedBy'])` | per tenant (batch internal) | AC-3 |

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Notes |
|---|---|---|
| (không cần DataLoader riêng) | — | Single downstream call, no list/N+1 risk. `enrichObjectWithByNames` đã có batch nội bộ theo pattern. |

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Invalidation trigger |
|---|---|---|---|
| `getMaterialGroup` | `@cacheControl(maxAge: 30, scope: PRIVATE)` | 30s per tenant session | FEAT-CAT-GRP-EDIT mutation complete |

### 6.5 Persisted query allowlist

Nếu allowlist enabled: đăng ký `GetMaterialGroupDetail` query hash sau khi SDL stable.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Estimated LoC | AC ref |
|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/catalog.graphql` | MODIFY (additive) | ~30 | AC-1, AC-2, AC-3 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/getMaterialGroup.ts` | NEW | ~55 | AC-1, AC-3, AC-6 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (new method `getMaterialGroupById`) | ~20 | AC-1 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog-material-group.test.ts` | ADDITIVE | ~70 | AC-1, AC-3, AC-6 |

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: FEAT-CAT-GRP-DETAIL BE §6.1 contract stable — GET /api/v2/material-groups/{id} live)

S5  BFF schema + resolver wire
    Entry: BE FEAT-CAT-GRP-DETAIL §6.1 stable (gf-inventory V2-3 endpoint live)
    Exit:  BFF contract test green + enrichObjectWithByNames pass
    └─► (hand-off FE-web S6: FEAT-CAT-GRP-DETAIL fe-web/ + Mobile S6: mobile/)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver + data-source method | schema + resolvers + data-sources | BE V2-3 endpoint stable | BFF contract test green | BE FEAT S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là gf-inventory). BFF chỉ enforce auth context, N+1 guard, contract constraints.

| BR ID | Severity | Enforcement tại BFF | Ghi chú |
|---|---|---|---|
| `BR-CAT-CMN-002` | CORNERSTONE | Auth guard — JWT required; 401 khi thiếu token | RBAC chi tiết primary tại BE |
| `BR-CAT-GRP-006` | — | N/A tại BFF — rule enforce tại gf-inventory (BE primary); BFF passthrough response | NEED CONFIRMATION: xem be/ §4 |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-GRP-DETAIL.md §4`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration | test-api | Mock gf-inventory V2-3, verify resolver compose `MaterialGroupApiResponse.data` đúng shape |
| AC-2 | BFF contract | test-api | Snapshot SDL `MaterialGroup` fields; verify passthrough không drop field |
| AC-3 | BFF integration | test-api | Mock `enrichObjectWithByNames`, verify `createdByName`/`updatedByName` có mặt; enrich fail → null field, query không abort |
| AC-6 | BFF auth | test-isolation | Thiếu token → 401 tại BFF; gf-inventory 403 → `ErrorResponse { statusCode: 403 }` |
| AC-7 | BFF integration | test-api | Same `getMaterialGroup` query response shape dùng được cho cả web và mobile field selection |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-DETAIL.md` | DRAFT | Downstream REST `GET /api/v2/material-groups/{id}` (V2-3) — read-only BFF reference |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-DETAIL.md` | DRAFT | Consume `getMaterialGroup` query — read-only BFF reference |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-DETAIL.md` | DRAFT | Consume `getMaterialGroup` query — read-only BFF reference |

**Source ID consistency** (item #18): `source_feat_sha` = `d6e7e690d8ce03cf0db4f8373b728e73de760fcf159963114d4472d1769767b2` — identical với BE/FE-web/Mobile tier files.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-DETAIL.md`](../../../../../Product/features/FEAT-CAT-GRP-DETAIL.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-DETAIL.md`](../be/FEAT-CAT-GRP-DETAIL.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **ADR-009**: Cấm JPA relationship mapping (scalar FK only) — không ảnh hưởng trực tiếp BFF nhưng chi phối shape BE response.
- **ADR-017**: MaterialGroup là entity mới độc lập trong gf-inventory — `GET /api/v2/material-groups/{id}` là endpoint mới (không có baseline).

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho FEAT-CAT-GRP-DETAIL W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical với be/ tier), §2 trách nhiệm BFF (passthrough + enrichObjectWithByNames), §3 behaviour map 7 AC-IDs (5 behaviour + AC-4/AC-5 N/A navigation), §4 auth/perf/error-mapping, §5-§11 BFF-specific (SDL delta, ops contract, resolver mapping, file map, DAG, test scope). |
| 2026-07-01 | 2 | main agent (audit) | Sửa §5.1 + §3/§4/§6/§10 khớp code thực tế agg-garage-graph (audit 2026-07-01): (1) type `MaterialGroupData` → `MaterialGroup` (tên type thật); (2) `MaterialGroupApiResponse.success: Boolean!` → `Boolean` (nullable, implements ApiResponse); (3) `data: MaterialGroupData` → `data: MaterialGroup`; (4) thêm field thật còn thiếu `childrenCount: Int`, `productCount: Int` (§5.1 + §3 AC-2 + sample query §6.1); (5) audit fields `createdAt/updatedAt/createdBy/updatedBy` từ `String!` → `String` (nullable đúng code). |
