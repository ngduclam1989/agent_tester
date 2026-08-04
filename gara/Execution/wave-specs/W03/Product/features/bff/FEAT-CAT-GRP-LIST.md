---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-GRP-LIST.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-LIST"
source_feat_sha: "cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory", "ct-saas-tenant"]
modifies: []
change_type: "new-capability"
graphql_ops: ["searchMaterialGroups", "getMaterialGroupTree"]
paired_backend_feats: ["FEAT-CAT-GRP-LIST"]
paired_fe_web_feats: ["FEAT-CAT-GRP-LIST"]
paired_mobile_feats: ["FEAT-CAT-GRP-LIST"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "671ef5244c4497f55306e4fbd7035c4512437deb1b9862f766a9aceefdef01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-LIST.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-LIST (BFF): Danh sách nhóm vật tư hàng hóa

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-LIST` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory`, `ct-saas-tenant` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `searchMaterialGroups`, `getMaterialGroupTree` |
| Cross-tier pair | BE: `FEAT-CAT-GRP-LIST` \| Web: `FEAT-CAT-GRP-LIST` \| Mobile: `FEAT-CAT-GRP-LIST` |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-GRP-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) |
| Source version | v6 |
| Source SHA | `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` |
| Generated at | 2026-06-29T14:36:41+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu danh sách nhóm vật tư hàng hóa để phân loại và điều hướng trong hệ thống quản lý kho V2. Feature cho phép tìm kiếm theo mã/tên và lọc theo trạng thái hoặc nhóm cha, với kết quả hiển thị phẳng (flat) có phân trang — quan hệ cha–con thể hiện qua trường "Thuộc nhóm". Đây là điểm khởi đầu cho các luồng tạo, xem chi tiết, sửa và xóa nhóm vật tư trong wave W03 (Danh mục V2).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 GraphQL queries: `searchMaterialGroups(input: MaterialGroupSearchInput!)` (V2-Q1) cho danh sách trải phẳng phân trang, và `getMaterialGroupTree` (V2-Q2) cho cây phân cấp đầy đủ.
- Passthrough `parentName` từ gf-inventory (backend-native JOIN, R21) — BFF không tự join.
- Enrich `createdByName` / `updatedByName` cho mỗi page kết quả bằng batch call duy nhất tới `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` qua helper `enrichArrayWithByNames`.
- BFF enforce defensive cap cho `getMaterialGroupTree`: nếu gf-inventory trả HTTP 413 + `ERR-INV-027`, BFF map sang GraphQL error `MATERIAL_GROUP_TREE_OVERSIZE` kèm hint redirect client sang `searchMaterialGroups`.
- Forward `input.sort="default"` nguyên vẹn xuống gf-inventory (BE authoritative flat-grouped-by-parent ORDER BY, R7) — BFF không tự reorder.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory và ct-saas-tenant trên mỗi request.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: TẤT CẢ 11 AC-IDs từ bundle §C phải xuất hiện ở §3 hoặc §4. AC không touch → khai báo explicit N/A.

### Cluster A — Danh sách, tìm kiếm và bộ lọc

#### AC-1 → BFF expose query khởi tạo danh sách nhóm vật tư

- **Khi**: FE-web hoặc Mobile gửi query `searchMaterialGroups(input: MaterialGroupSearchInput!)`
- **BFF phải**: forward toàn bộ `MaterialGroupSearchInput` xuống `POST /api/v2/material-groups/search` (gf-inventory), enrich kết quả với `createdByName`/`updatedByName`, trả `PagedMaterialGroupResponse`
- **Downstream**: `POST /api/v2/material-groups/search` (gf-inventory)
- **Output shape**: `PagedMaterialGroupResponse` (union) → `PagedMaterialGroupApiResponse { success, code, message, data: PagedMaterialGroupData { content: [MaterialGroup], pageInfo: PageInfo } }`
- **Failure mode**: gf-inventory 401 → `UNAUTHORIZED`; 500 → `INTERNAL_SERVER_ERROR`
- **Ref**: op `searchMaterialGroups` (§6.1), resolver `src/resolvers/catalog/searchMaterialGroups.ts` (§6.2)

#### AC-2 → BFF expose đủ cột dữ liệu theo schema type `MaterialGroup`

- **Khi**: gf-inventory trả danh sách flat với `parentName` (R21 backend-native)
- **BFF phải**: map response gf-inventory → `MaterialGroup` đủ fields: `id`, `code`, `name`, `parentId`, `parentName` (passthrough), `status`, `description`, `childrenCount`, `productCount`, `createdBy`, `updatedBy`, `createdAt`, `updatedAt`; append `createdByName`/`updatedByName` từ `enrichArrayWithByNames`
- **Downstream**: gf-inventory `POST /api/v2/material-groups/search`; ct-saas-tenant `POST /api/v1/saas-tenant/tenant-users/search/basic` (batch enrichment)
- **Output shape**: `MaterialGroup` đủ 15 fields (xem §5.1)
- **Failure mode**: ct-saas-tenant fail → BFF log warn, graceful degrade `createdByName`/`updatedByName` = `null` (KHÔNG abort toàn request)
- **Ref**: `enrichArrayWithByNames` (§6.3), op `searchMaterialGroups` (§6.1)

#### AC-3 → BFF trả flat list với `parentName` cho FE render quan hệ cha–con

- **Khi**: FE cần hiển thị cột "Thuộc nhóm" trong bảng danh sách
- **BFF phải**: KHÔNG tự restructure flat list thành cây. `parentName` là backend-native field (gf-inventory JOIN `material_group` cha theo `parent_id`, R21) — BFF chỉ expose field đúng tên trong `MaterialGroup`
- **Downstream**: gf-inventory trả `parentName` trong response body
- **Output shape**: flat array `data.content: [MaterialGroup]` — FE render cột "Thuộc nhóm" từ `parentName`
- **Ref**: R21 backend-native parentName; op `searchMaterialGroups` (§6.1)

#### AC-4 → BFF forward keyword search xuống gf-inventory

- **Khi**: FE gửi `input.keyword` (mã hoặc tên nhóm)
- **BFF phải**: forward `keyword` string tới `POST /api/v2/material-groups/search` body. OR-match trên `code/name` là trách nhiệm gf-inventory (BR-CAT-GRP-013) — BFF KHÔNG tự filter.
- **Downstream**: gf-inventory V2-1 `keyword` field
- **Output shape**: filtered `PagedMaterialGroupResponse`
- **Ref**: BR-CAT-GRP-013

#### AC-5 → BFF forward status enum, enforce type-safety ở schema layer

- **Khi**: FE gửi `input.status` (ACTIVE | INACTIVE | omit)
- **BFF phải**: GraphQL schema enforce `MaterialGroupStatus` enum — invalid value bị reject trước khi gọi downstream. Forward valid enum value xuống gf-inventory search.
- **Downstream**: gf-inventory V2-1 `status` filter
- **Output shape**: filtered `PagedMaterialGroupResponse`
- **Failure mode**: invalid enum literal → GraphQL schema validation error (HTTP 400, trước downstream call)

#### AC-6 → BFF forward `parentId` filter xuống gf-inventory

- **Khi**: FE gửi `input.parentId` để lọc các nhóm con của một nhóm cha
- **BFF phải**: forward `parentId: Int` tới gf-inventory search body. Không tự validate sự tồn tại của `parentId` — delegate hoàn toàn xuống gf-inventory.
- **Downstream**: gf-inventory V2-1 `parentId` field
- **Output shape**: `PagedMaterialGroupResponse` chứa nhóm con trực tiếp của parentId

### Cluster B — Cây phân cấp (popup/selector dùng V2-Q2)

#### AC-1 (tree path) → BFF expose query cây và enforce defensive cap 1000 nodes

> AC-1 bao gồm cả entry point dùng cây dropdown; behavior này ánh xạ vào `getMaterialGroupTree`.

- **Khi**: FE/Mobile gọi `getMaterialGroupTree` để lấy cây đầy đủ (vd picker nhóm cha khi tạo/sửa)
- **BFF phải**: gọi `GET /api/v2/material-groups/tree` (gf-inventory). Nếu gf-inventory trả HTTP 413 + `ERR-INV-027` → BFF throw GraphQL error `MATERIAL_GROUP_TREE_OVERSIZE` với hint message "Danh mục quá lớn (>1000 nhóm), vui lòng dùng searchMaterialGroups để tra cứu có phân trang."
- **Downstream**: `GET /api/v2/material-groups/tree` (gf-inventory V2-2)
- **Output shape**: `MaterialGroupTreeResponse` (union) → `MaterialGroupTreeApiResponse { success, code, message, data: MaterialGroupTreeData { nodes: [MaterialGroupTreeNode!]! } }`; mỗi `MaterialGroupTreeNode { group: MaterialGroup!, children: [MaterialGroupTreeNode!]! }` recursive (xem §5.1)
- **Failure mode**: ERR-INV-027 (413) → `MATERIAL_GROUP_TREE_OVERSIZE`; gf-inventory 401 → `UNAUTHORIZED`
- **Ref**: op `getMaterialGroupTree` (§6.1), resolver `src/resolvers/catalog/getMaterialGroupTree.ts` (§6.2)

### Cluster C — Quyền truy cập và phạm vi tenant

#### AC-9 → BFF enforce phân quyền: JWT required, persona check

- **Khi**: Bất kỳ query nào trong FEAT này (`searchMaterialGroups`, `getMaterialGroupTree`)
- **BFF phải**: verify `Authorization` JWT header valid; extract `tenantId` + user context; propagate `X-Tenant-Id` xuống downstream. Missing/expired JWT → throw `UNAUTHORIZED` trước khi gọi gf-inventory.
- **Downstream**: gf-inventory TenantFilter active — đảm bảo chỉ trả data tenant hiện tại
- **Failure mode**: JWT missing → `UNAUTHORIZED`; gf-inventory 403 → `FORBIDDEN`
- **Ref**: §4.1, BR-CAT-GRP-006 (quyền thao tác); BR-CAT-GRP-005 (quyền xem)

#### AC-10 → BFF enforce tenant scope từ JWT (không từ client arg)

- **Khi**: Query `searchMaterialGroups` hoặc `getMaterialGroupTree`
- **BFF phải**: tenantId LUÔN lấy từ JWT context — KHÔNG accept `tenantId` từ GraphQL arg client-controlled (CR #4 tenant isolation). Forward `X-Tenant-Id` header xuống gf-inventory.
- **Downstream**: gf-inventory TenantFilter tự filter `tenant_id` column
- **Failure mode**: cross-tenant attempt tự nhiên bị gf-inventory block (trả `[]`/404)

#### AC-11 → BFF phục vụ đồng thời web và mobile qua cùng schema

- **Khi**: FE-web và Mobile đều tiêu thụ cùng 2 GraphQL queries
- **BFF phải**: Schema và resolver không platform-specific. Cùng `searchMaterialGroups` và `getMaterialGroupTree` serve cả 2 platform qua 1 BFF schema duy nhất.
- **Ref**: `paired_fe_web_feats: ["FEAT-CAT-GRP-LIST"]`, `paired_mobile_feats: ["FEAT-CAT-GRP-LIST"]`

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory và ct-saas-tenant.
- `tenantId` extract từ JWT context — KHÔNG nhận từ client arg (CR #4).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- `searchMaterialGroups`: KHÔNG call ct-saas-tenant per-record. Dùng `enrichArrayWithByNames` helper: collect tất cả `createdBy`/`updatedBy` IDs trong page → 1 batch call duy nhất → merge vào response. Tối đa 1 call ct-saas-tenant per `searchMaterialGroups` request.
- `getMaterialGroupTree`: 1 downstream call duy nhất tới gf-inventory. Không cần DataLoader (tree không loop N+1).
- Cap defensive 1000 nodes (`getMaterialGroupTree`) phòng over-fetch; redirect client sang `searchMaterialGroups` nếu vượt.

### 4.3 Security + data exposure

- KHÔNG log JWT/Authorization header content trong resolver.
- `tenantId` không expose qua GraphQL arg — chỉ server-side extract từ JWT.
- `createdByName`/`updatedByName` là display name (non-PII); KHÔNG log email hoặc username raw trong resolver.

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` giữ old field.
- Breaking change (remove type/field, rename enum) → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE/external) | GraphQL error code | Source AC |
|---|---|---|
| gf-inventory 413 + `ERR-INV-027` (`MATERIAL_GROUP_TREE_OVERSIZE`) | `MATERIAL_GROUP_TREE_OVERSIZE` (+ hint message) | AC-1 (tree path) |
| gf-inventory 401 | `UNAUTHORIZED` | AC-9 |
| gf-inventory 403 | `FORBIDDEN` | AC-9 |
| gf-inventory 404 | `NOT_FOUND` | AC-6 |
| ct-saas-tenant any error | log warn + graceful degrade (`*Name` = null) | AC-2 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields (chính) | Breaking? | AC ref |
|---|---|---|---|---|
| `MaterialGroupSearchInput` | input | `keyword: String`, `parentId: Int`, `status: MaterialGroupStatus`, `page: Int`, `size: Int`, `sort: String` | NO (new) | AC-1, AC-4, AC-5, AC-6 |
| `MaterialGroup` | type | `id: Int!`, `code: String!`, `name: String!`, `parentId: Int`, `parentName: String`, `status: MaterialGroupStatus!`, `description: String`, `childrenCount: Int`, `productCount: Int`, `createdBy: String`, `createdByName: String`, `updatedBy: String`, `updatedByName: String`, `createdAt: String`, `updatedAt: String` | NO (new) | AC-2, AC-3 |
| `PagedMaterialGroupData` | type | `content: [MaterialGroup]`, `pageInfo: PageInfo` | NO (new) | AC-1 |
| `PagedMaterialGroupApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: PagedMaterialGroupData` | NO (new) | AC-1 |
| `PagedMaterialGroupResponse` | union | `PagedMaterialGroupApiResponse \| ErrorResponse` | NO (new) | AC-1 |
| `MaterialGroupStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new, nếu chưa có) | AC-5 |
| `MaterialGroupTreeNode` | type | `group: MaterialGroup!`, `children: [MaterialGroupTreeNode!]!` | NO (new) | AC-1 (tree) |
| `MaterialGroupTreeData` | type | `nodes: [MaterialGroupTreeNode!]!` | NO (new) | AC-1 (tree) |
| `MaterialGroupTreeApiResponse` | type (implements `ApiResponse`) | `success: Boolean`, `code: String`, `message: String`, `data: MaterialGroupTreeData` | NO (new) | AC-1 (tree) |
| `MaterialGroupTreeResponse` | union | `MaterialGroupTreeApiResponse \| ErrorResponse` | NO (new) | AC-1 (tree) |

> `PageInfo` — NEED CONFIRMATION: kiểm tra `bffs/agg-garage-graph/src/schema/` xem type `PageInfo` đã được định nghĩa từ feature trước chưa (vd settlement/booking pagination). Nếu đã có → reuse, KHÔNG redeclare. Nếu chưa → add `PageInfo { page: Int!, size: Int!, totalElements: Int!, totalPages: Int!, first: Boolean!, last: Boolean!, hasNext: Boolean!, hasPrevious: Boolean! }`.

### 5.2 Modified types (additive)

Không có breaking change. Nếu có `Query` type extend:

| Type | Field added | Return type | AC ref |
|---|---|---|---|
| `Query` | `searchMaterialGroups` | `PagedMaterialGroupResponse!` | AC-1 |
| `Query` | `getMaterialGroupTree` | `MaterialGroupTreeResponse!` | AC-1 (tree) |

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `searchMaterialGroups` | query | `input: MaterialGroupSearchInput!` | `PagedMaterialGroupResponse!` | JWT + tenantId | AC-1, AC-4, AC-5, AC-6 |
| `getMaterialGroupTree` | query | _(none)_ | `MaterialGroupTreeResponse!` | JWT + tenantId | AC-1 (tree) |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream boundary | REST endpoint | DataLoader | AC ref |
|---|---|---|---|---|---|
| `searchMaterialGroups` | `src/resolvers/catalog/searchMaterialGroups.ts` | `gf-inventory` | `POST /api/v2/material-groups/search` | — (batch enrich via §6.3) | AC-1, AC-4, AC-5, AC-6 |
| `getMaterialGroupTree` | `src/resolvers/catalog/getMaterialGroupTree.ts` | `gf-inventory` | `GET /api/v2/material-groups/tree` | — (single call) | AC-1 (tree) |

**Enrichment step** (`searchMaterialGroups` only):
1. Call gf-inventory `POST /api/v2/material-groups/search` → `content[]` với `createdBy`/`updatedBy` (user ID strings).
2. Collect unique user IDs từ `content[]`.
3. Call `enrichArrayWithByNames(content, ['createdBy', 'updatedBy'], ctSaasTenantDataSource)` → ct-saas-tenant `POST /api/v1/saas-tenant/tenant-users/search/basic` body `{ userIds: [...] }`.
4. Merge `createdByName`/`updatedByName` vào từng item.
5. Trả `PagedMaterialGroupResponse` (envelope `PagedMaterialGroupApiResponse.data.content`).

**Error handling `getMaterialGroupTree`**:
```
gf-inventory 413 + ERR-INV-027
  → throw GraphQL UserInputError("MATERIAL_GROUP_TREE_OVERSIZE",
      { hint: "Vui lòng dùng searchMaterialGroups để tra cứu có phân trang." })
```

### 6.3 DataLoader / batching strategy

| Loader / helper | Key shape | Batch endpoint | TTL | Use cases |
|---|---|---|---|---|
| `enrichArrayWithByNames` | `{ userIds: string[] }` | `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` | request-scoped | Enrich `createdByName`/`updatedByName` trong `searchMaterialGroups` |

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `searchMaterialGroups` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | list thay đổi sau create/edit/delete — không cache |
| `getMaterialGroupTree` | `@cacheControl(maxAge: 30, scope: PRIVATE)` | 30s | tree ít thay đổi hơn; invalidate khi có mutation GRP |

### 6.5 Persisted query allowlist

NEED CONFIRMATION: xác nhận `agg-garage-graph` có bật persisted query whitelist không (pattern từ các FEAT W02 trước). Nếu có → add `SearchMaterialGroupsQuery` + `GetMaterialGroupTreeQuery` hash vào allowlist.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (Critical Rule #1).

| Layer | Path glob | Change type | Reuse pattern | Est. LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/catalog.graphql` | NEW hoặc MODIFY (additive) | extend SDL catalog domain | ~50 | AC-1..6, AC-11 |
| `resolvers/catalog/` | `src/resolvers/catalog/searchMaterialGroups.ts` | NEW | resolver pattern (passthrough + enrich) | ~70 | AC-1, AC-4, AC-5, AC-6 |
| `resolvers/catalog/` | `src/resolvers/catalog/getMaterialGroupTree.ts` | NEW | resolver pattern (passthrough + error map) | ~40 | AC-1 (tree) |
| `data-sources/` | `src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (new methods) | reuse existing datasource class nếu đã có | ~50 | AC-1, AC-4, AC-6 |
| `helpers/` | `src/helpers/enrichArrayWithByNames.ts` | NEW hoặc REUSE | batch enrichment helper (reuse nếu đã có từ W02) | ~40 | AC-2 |
| `tests/integration/` | `tests/integration/catalog-grp-list.test.ts` | NEW | apollo test client | ~80 | AC-1, AC-4, AC-5, AC-9 |
| `tests/contract/` | `tests/contract/catalog-grp-schema.test.ts` | NEW | schema snapshot | ~30 | (schema) |

> `enrichArrayWithByNames` — NEED CONFIRMATION: kiểm tra xem helper này đã tồn tại trong `bffs/agg-garage-graph/src/helpers/` hay `src/utils/` từ W02 (FEAT-INS-DOSSIER series). Nếu đã có → reuse nguyên helper, KHÔNG duplicate.

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory V2-1 + V2-2 integration green)

S5  BFF schema + resolver wire (agg-garage-graph)
    Entry: gf-inventory REST endpoints V2-1 + V2-2 contract stable
    Exit:  BFF contract test green + enrichment N+1 check pass
           + getMaterialGroupTree 413-map verified
    └─► (hand-off FE-web S6, Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Add SDL types + queries vào `catalog.graphql` | `schema/` | — | `npm run typecheck` pass | — |
| S5.2 | Impl `GfInventoryDataSource` methods (search + tree) | `data-sources/` | S5.1 | method test pass | S5.1 |
| S5.3 | Impl `searchMaterialGroups` resolver + enrich | `resolvers/catalog/` | S5.2 | resolver unit test pass | S5.2 |
| S5.4 | Impl `getMaterialGroupTree` resolver + 413 error map | `resolvers/catalog/` | S5.2 | error map test pass | S5.2 |
| S5.5 | Integration test + N+1 guard validation | `tests/integration/` | S5.3, S5.4 | all tests green | S5.3, S5.4 |

---

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary. Primary enforcement = gf-inventory tier.

| BR ID | Severity | Enforcement tại BFF | Where (file path) | AC ref | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-005` | NORMAL | Defensive cap 1000 nodes | `resolvers/catalog/getMaterialGroupTree.ts` | AC-1 (tree) | Map ERR-INV-027 → `MATERIAL_GROUP_TREE_OVERSIZE` |
| `BR-CAT-GRP-013` | NORMAL | Forward keyword; OR-match thực hiện ở BE | `data-sources/GfInventoryDataSource.ts` | AC-4 | BFF KHÔNG tự filter |
| `BR-CAT-GRP-006` | CORNERSTONE | JWT auth guard — tenantId from JWT only | resolver pre-check | AC-9, AC-10 | Tenant isolation CR #4 |

> Primary BR enforcement (GRP-001..013): xem `features/be/FEAT-CAT-GRP-LIST.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (resolver → gf-inventory) | test-api | mock gf-inventory V2-1; verify request body shape + pagination forward |
| AC-1 (tree) | BFF integration + error map | test-api | mock gf-inventory V2-2; verify 413 → `MATERIAL_GROUP_TREE_OVERSIZE` |
| AC-2 | BFF enrichment | test-api | mock ct-saas-tenant; verify `createdByName`/`updatedByName` merge |
| AC-2 | BFF enrichment graceful degrade | test-api | ct-saas-tenant 500 → `*Name`=null, response still returned |
| AC-4, AC-5, AC-6 | BFF integration filter forward | test-api | verify keyword/status/parentId forwarded verbatim |
| AC-9 | BFF auth guard | test-isolation | missing JWT → `UNAUTHORIZED`; valid JWT → pass |
| AC-10 | BFF tenant isolation | test-isolation | tenantId from JWT only; arg override not accepted |
| — | N+1 guard | test-api | assert ct-saas-tenant called ≤1 time per `searchMaterialGroups` |
| — | Schema contract | test-contract | SDL snapshot: `MaterialGroup`, `PagedMaterialGroupResponse` (union), `MaterialGroupTreeResponse` (union) |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-LIST.md` | PENDING | Downstream REST V2-1 + V2-2 (gf-inventory) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-LIST.md` | PENDING | Consume `searchMaterialGroups` + `getMaterialGroupTree` từ §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-LIST.md` | PENDING | Consume `searchMaterialGroups` + `getMaterialGroupTree` từ §6.1 |

**Source ID consistency** (item #18): `source_feat_sha` = `cad1316d66146a0d77200a0287efb5e4558beb6a0f4cb30b9ef72847100915ef` — identical với BE/FE-web/Mobile files.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-LIST.md`](../../../../../Product/features/FEAT-CAT-GRP-LIST.md) v6
- **Paired BE**: [`features/be/FEAT-CAT-GRP-LIST.md`](../be/FEAT-CAT-GRP-LIST.md) (PENDING)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **ADR-017**: Additive aggregates — `material_group` entity độc lập trong gf-inventory
- **BR refs**: `BR-CAT-GRP-005`, `BR-CAT-GRP-006`, `BR-CAT-GRP-013`

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-CAT-GRP-LIST` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3 dòng tiếng Việt), §2 trách nhiệm BFF (6 bullet), §3 behaviour map 11 AC-IDs, §4 auth+perf+error mapping, §5 SDL delta types mới, §6 ops contract 2 queries + enrichment flow + 413 error map, §7 file map ⊆ bffs/agg-garage-graph/**, §8-§11 DAG/BR/test/cross-tier. Source FEAT chỉ audit. |
| 2026-07-01 | 2 | Delivery Authority | Đối chiếu code thực tế agg-garage-graph (audit 2026-07-01) — fix drift GraphQL contract §3/§5/§6/§10: (a) return `searchMaterialGroups` `MaterialGroupPage!` → union `PagedMaterialGroupResponse!` (envelope `PagedMaterialGroupApiResponse implements ApiResponse` → `data: PagedMaterialGroupData { content, pageInfo }`); (b) return `getMaterialGroupTree` `MaterialGroupTreeNode!` → union `MaterialGroupTreeResponse!` (→ `MaterialGroupTreeApiResponse.data: MaterialGroupTreeData { nodes }`); (c) list item type `MaterialGroupListItem` → `MaterialGroup`; (d) scalar `id: ID!` → `id: Int!`, `parentId: ID` → `parentId: Int` (input + type); (e) bổ sung field thiếu `description`, `childrenCount`, `productCount` (13 → 15 fields); (f) `MaterialGroupTreeNode` flat `{id,code,name,status,children}` → `{ group: MaterialGroup!, children: [MaterialGroupTreeNode!]! }`. Lý do: doc lệch so với schema thật đã deploy. |
