---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-GRP-CREATE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-CREATE"
source_feat_sha: "183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4"
generated_at: "2026-06-29T14:36:41+00:00"
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
graphql_ops: ["createMaterialGroup"]
paired_backend_feats: ["FEAT-CAT-GRP-CREATE"]
paired_fe_web_feats: ["FEAT-CAT-GRP-CREATE"]
paired_mobile_feats: ["FEAT-CAT-GRP-CREATE"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-CREATE.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-CREATE (BFF): Tạo nhóm vật tư hàng hóa

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `createMaterialGroup` |
| Cross-tier pair | BE: `FEAT-CAT-GRP-CREATE` \| Web: `FEAT-CAT-GRP-CREATE` \| Mobile: `FEAT-CAT-GRP-CREATE` |

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

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL mutation `createMaterialGroup(input: CreateMaterialGroupInput!): MaterialGroupResponse!` — khai báo SDL types mới `CreateMaterialGroupInput`, `MaterialGroup`, `MaterialGroupApiResponse`, union `MaterialGroupResponse = MaterialGroupApiResponse | ErrorResponse`, enum `MaterialGroupStatus`.
- Passthrough toàn bộ input fields tới `POST /api/v2/material-groups` (gf-inventory V2-4); BFF không thực hiện business validation (BE là SSOT cho code uniqueness, format, description length).
- Enrich response: `createdByName` + `updatedByName` qua helper `enrichObjectWithByNames` (TENANT-USERS lookup); `parentName` là backend-native — BE đã resolve và trả về trong response body, BFF passthrough.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory trên mọi downstream call.
- Map error codes từ BE response (`ERR-INV-001`, `ERR-INV-002`, `ERR-INV-016`) sang GraphQL `errors[].extensions.code`.
- Enforce RBAC tại resolver: permission `CATALOG_GROUP_CREATE` chỉ thuộc `garage-owner` — `accountant` bị từ chối.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 10 AC-IDs từ bundle §C — mỗi AC xuất hiện ở §3 hoặc §4.

### Cluster A — Contract form fields (AC-2, AC-3, AC-4, AC-5, AC-6)

#### AC-2 → BFF expose field `code` trong CreateMaterialGroupInput

- **Khi**: FE/Mobile gửi mutation `createMaterialGroup` với `input.code`
- **BFF phải**: forward `code` as-is tới body `POST /api/v2/material-groups`; không sanitize hay validate pattern tại BFF (BE validate regex no-special-chars và trả ERR-INV-001 nếu vi phạm)
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `MaterialGroupApiResponse.data.code: String!`
- **Failure mode**: BE trả ERR-INV-001 (400) → BFF map sang `extensions.code: "ERR_INV_001"`
- **Ref**: op `createMaterialGroup` (§6.1), resolver `src/resolvers/inventory-catalog/createMaterialGroup.ts` (§6.2), §4.5

#### AC-3 → BFF expose field `name` trong CreateMaterialGroupInput

- **Khi**: FE/Mobile gửi mutation với `input.name`
- **BFF phải**: forward `name` tới downstream body; field required trong SDL (`String!`) — GraphQL layer reject null trước khi gọi resolver
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `MaterialGroupApiResponse.data.name: String!`
- **Failure mode**: `name` null → GraphQL validation error (400) trước khi đến downstream
- **Ref**: op `createMaterialGroup` (§6.1)

#### AC-4 → BFF expose field `parentId` trong CreateMaterialGroupInput

- **Khi**: FE/Mobile gửi mutation với `input.parentId` (optional — absent = nhóm gốc cấp 1)
- **BFF phải**: forward `parentId` tới downstream; nếu null/absent → gửi `null` hoặc bỏ field (BE xử lý nhóm gốc); `parentName` trong response là backend-native (BE resolve từ parent record, BFF passthrough)
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `MaterialGroupApiResponse.data.parentId: Int`, `MaterialGroupApiResponse.data.parentName: String`
- **Failure mode**: `parentId` không tồn tại hoặc INACTIVE → BE trả 4xx → BFF map sang GraphQL error generic `ERR_DOWNSTREAM_CLIENT`
- **Ref**: op `createMaterialGroup` (§6.1)

#### AC-5 → BFF expose field `status` trong CreateMaterialGroupInput (default ACTIVE tại BE)

- **Khi**: FE/Mobile gửi mutation với `input.status` (optional; absent → BE default ACTIVE)
- **BFF phải**: forward `status` nếu FE truyền; không inject default tại BFF (BE xử lý default); enum value ngoài `ACTIVE/INACTIVE` → GraphQL validation error trước khi gọi downstream
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `MaterialGroupApiResponse.data.status: MaterialGroupStatus!`
- **Failure mode**: invalid enum string → GraphQL validation error (400) — không đến downstream
- **Ref**: op `createMaterialGroup` (§6.1)

#### AC-6 → BFF expose field `description` trong CreateMaterialGroupInput

- **Khi**: FE/Mobile gửi mutation với `input.description` (optional, ≤255 chars)
- **BFF phải**: forward `description` tới downstream; không truncate hay enforce length tại BFF (BE validate ≤255 → ERR-INV-016)
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `MaterialGroupApiResponse.data.description: String`
- **Failure mode**: BE trả ERR-INV-016 (400) → BFF map sang `extensions.code: "ERR_INV_016"`
- **Ref**: op `createMaterialGroup` (§6.1), §4.5

### Cluster B — Mutation thực thi & response (AC-7, AC-8)

#### AC-7 → BFF map ERR-INV-002 (trùng mã nhóm) sang GraphQL error

- **Khi**: BE trả HTTP 409 + `ERR-INV-002` do mã nhóm đã tồn tại trong tenant
- **BFF phải**: catch downstream 409, wrap thành `GraphQLError` với `extensions.code: "ERR_INV_002"`; resolver trả `null` data + lỗi trong errors array — không crash
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4)
- **Output shape**: `errors[{ message: "...", extensions: { code: "ERR_INV_002" } }]`
- **Failure mode**: thiếu mapping ERR-INV-002 → FE nhận generic error, không thể hiển thị thông báo "mã đã tồn tại" đúng nghĩa — required mapping
- **Ref**: §4.5 error mapping table

#### AC-8 → BFF mutation `createMaterialGroup` trả MaterialGroupResponse đã enrich

- **Khi**: gf-inventory tạo thành công, trả HTTP 201 + body nhóm vật tư mới (bao gồm `parentName` backend-native)
- **BFF phải**: map BE response sang `MaterialGroupApiResponse.data` (`MaterialGroup`) partial → gọi `enrichObjectWithByNames(partial, context.tenantId)` để bổ sung `createdByName` + `updatedByName`; return union member `MaterialGroupApiResponse` (qua `MaterialGroupResponse!`)
- **Downstream**: `POST /api/v2/material-groups` (gf-inventory V2-4) response body
- **Output shape**: `MaterialGroupApiResponse { success, code, message, data: MaterialGroup { id, code, name, description, parentId, parentName, status, createdAt, createdBy, createdByName, updatedAt, updatedBy, updatedByName } }`
- **Failure mode**: `enrichObjectWithByNames` lỗi → log warning, graceful degrade (return response với `createdByName: null`, `updatedByName: null`) — không fail mutation
- **Ref**: op `createMaterialGroup` (§6.1), resolver step 4–6 (§6.2)

### Cluster C — Phân quyền & UI local (AC-1, AC-9, AC-10)

#### AC-1 → N/A

- Source AC này là UI-only (FE/Mobile mở form thêm nhóm vật tư — navigation + layout). BFF không touch — xem `features/fe-web/FEAT-CAT-GRP-CREATE.md` và `features/mobile/FEAT-CAT-GRP-CREATE.md`.

#### AC-9 → N/A

- Source AC này là FE/Mobile local UI (người dùng huỷ bỏ form — không gọi mutation, client-side state reset). BFF không touch.

#### AC-10 → BFF enforce RBAC tại resolver — chỉ garage-owner

- **Khi**: bất kỳ actor gọi mutation `createMaterialGroup`
- **BFF phải**: verify JWT tại auth guard; kiểm tra role `garage-owner` + permission `CATALOG_GROUP_CREATE`; `accountant` không có quyền này → throw `GraphQLError` với `extensions.code: "ERR_AUTH_FORBIDDEN"` trước khi gọi downstream
- **Downstream**: gf-inventory V2-4 sử dụng `x-api-key` service-to-service (chỉ gọi sau khi BFF xác nhận JWT hợp lệ)
- **Output shape**: `errors[{ extensions: { code: "ERR_AUTH_FORBIDDEN" } }]` nếu bị từ chối; data `null`
- **Failure mode**: thiếu auth guard = CORNERSTONE violation (unauthorized create)
- **Ref**: §4.1 auth header propagation, §9 BR table (BR-CAT-GRP-008)

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory REST — không drop header nào.
- RBAC gate tại resolver entry: permission `CATALOG_GROUP_CREATE` chỉ `garage-owner`; `accountant` bị reject trước khi gọi downstream.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- `createMaterialGroup` là single-write mutation — không có N+1 risk (1 downstream call per mutation).
- `enrichObjectWithByNames` gọi TENANT-USERS 1 lần per mutation call — không cần DataLoader.
- `parentName` backend-native: không thêm round-trip BFF → không overhead.

### 4.3 Security + data exposure

- KHÔNG log `Authorization` header, JWT, `tenantId` raw trong resolver log lines.
- Tenant scope: `X-Tenant-Id` lấy từ JWT header — không cho FE/Mobile truyền `tenantId` qua mutation input args.
- Response KHÔNG expose `tenant_id` scalar về phía client.
- `enrichObjectWithByNames` graceful degrade khi TENANT-USERS không tìm thấy user → trả `null` thay vì lộ error stack.

### 4.4 Contract stability

- `CreateMaterialGroupInput`, `MaterialGroupResponse`, `MaterialGroupStatus` là types mới — không breaking.
- Field rename/remove tương lai: `@deprecated(reason: "...")` trước khi xóa hard → CR MAJOR.
- Mutation name `createMaterialGroup` là stable public contract — KHÔNG rename mà không CR MAJOR.
- Nếu `MaterialGroupResponse` hoặc `MaterialGroupStatus` đã tồn tại từ feature khác (vd LIST): extend additive, không redeclare.

### 4.5 Error code mapping

| Downstream error (gf-inventory) | HTTP status | GraphQL extensions.code | Message hint | Source AC |
|---|---|---|---|---|
| `ERR-INV-001` | 400 | `ERR_INV_001` | Mã nhóm không hợp lệ — không dùng ký tự đặc biệt | AC-2 |
| `ERR-INV-002` | 409 | `ERR_INV_002` | Mã nhóm đã tồn tại trong hệ thống | AC-7 |
| `ERR-INV-016` | 400 | `ERR_INV_016` | Mô tả không được vượt quá 255 ký tự | AC-6 |
| 4xx generic | 4xx | `ERR_DOWNSTREAM_CLIENT` | Lỗi dữ liệu đầu vào | — |
| 5xx generic | 5xx | `ERR_DOWNSTREAM_SERVER` | Lỗi hệ thống — thử lại sau | — |
| JWT/permission fail | — | `ERR_AUTH_FORBIDDEN` | Không có quyền thực hiện thao tác này | AC-10 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> NEED CONFIRMATION (1/2): Xác nhận xem `MaterialGroupStatus` enum và `MaterialGroupResponse` type đã có trong SDL `agg-garage-graph` chưa (có thể đã khai báo từ `FEAT-CAT-GRP-LIST`). Nếu có → extend additive, không redeclare. Nếu chưa → khai báo mới per §5.3 dưới đây.

### 5.1 New types (nếu chưa tồn tại trong SDL)

| Type name | Kind | Fields key | Breaking? | AC ref |
|---|---|---|---|---|
| `CreateMaterialGroupInput` | input | `code: String!`, `name: String!`, `description: String`, `parentId: Int`, `status: MaterialGroupStatus` | NO (new) | AC-2/3/4/5/6 |
| `MaterialGroup` | type | `id: Int!`, `code: String!`, `name: String!`, `description: String`, `parentId: Int`, `parentName: String`, `status: MaterialGroupStatus!`, `childrenCount: Int`, `productCount: Int`, `createdAt: String`, `createdBy: String`, `createdByName: String`, `updatedAt: String`, `updatedBy: String`, `updatedByName: String` | NO (new) | AC-8 |
| `MaterialGroupApiResponse` | type | `implements ApiResponse { success: Boolean, code: String, message: String, data: MaterialGroup }` | NO (new) | AC-8 |
| `MaterialGroupResponse` | union | `= MaterialGroupApiResponse \| ErrorResponse` | NO (new) | AC-8 |
| `MaterialGroupStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new) | AC-5 |

### 5.2 Modified types (additive)

| Type | Change | Breaking? | Notes |
|---|---|---|---|
| `Mutation` | Thêm field `createMaterialGroup(input: CreateMaterialGroupInput!): MaterialGroupResponse!` | NO | Additive field extension |

### 5.3 Inline SDL (reference — verbatim từ Architecture/api/agg-garage-graph-graphql.md hoặc mới nếu chưa có)

```graphql
# Khai báo chỉ nếu chưa có từ LIST/DETAIL features
enum MaterialGroupStatus {
  ACTIVE
  INACTIVE
}

input CreateMaterialGroupInput {
  code: String!
  name: String!
  description: String
  parentId: Int
  status: MaterialGroupStatus
}

type MaterialGroup {
  id: Int!
  code: String!
  name: String!
  description: String
  parentId: Int
  parentName: String
  status: MaterialGroupStatus!
  childrenCount: Int
  productCount: Int
  createdAt: String
  createdBy: String
  createdByName: String
  updatedAt: String
  updatedBy: String
  updatedByName: String
}

# ApiResponse + ErrorResponse là shared interface/type — reuse, không redeclare
type MaterialGroupApiResponse implements ApiResponse {
  success: Boolean
  code: String
  message: String
  data: MaterialGroup
}

union MaterialGroupResponse = MaterialGroupApiResponse | ErrorResponse

extend type Mutation {
  createMaterialGroup(input: CreateMaterialGroupInput!): MaterialGroupResponse!
}
```

> **Chú ý dev**: `createdByName`/`updatedByName` nullable — BFF enrich sau khi nhận BE response (không phải field BE trả về). `parentName` non-null khi `parentId` có giá trị, null khi nhóm gốc — backend-native, BFF passthrough.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `createMaterialGroup` | mutation | `input: CreateMaterialGroupInput!` | `MaterialGroupResponse!` | JWT (`garage-owner` + permission `CATALOG_GROUP_CREATE`) | AC-2/3/4/5/6/7/8/10 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `createMaterialGroup` | `src/resolvers/inventory-catalog/createMaterialGroup.ts` | `FEAT-CAT-GRP-CREATE` BE §6.1 | `POST /api/v2/material-groups` (V2-4) | — (single write, no batching) | AC-8 |

**Resolver flow detail** (`createMaterialGroup`):

1. **Auth gate**: verify JWT → assert role `garage-owner` + permission `CATALOG_GROUP_CREATE`; fail → throw `GraphQLError(ERR_AUTH_FORBIDDEN)` (AC-10).
2. **Build request body**: map tường minh từng field từ `input` → `{ code, name, description, parentId, status }` (bỏ field undefined/null theo convention).
3. **Downstream call**: `GfInventoryDataSource.createMaterialGroup(body, context)` — forward headers `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
4. **On error (4xx/5xx)**: catch → map per §4.5 error table → throw `GraphQLError` với `extensions.code` tương ứng; không expose stack.
5. **On success (201)**: map BE response fields → `MaterialGroupApiResponse.data` (`MaterialGroup`) partial (gồm `parentName` backend-native).
6. **Enrich**: `enrichObjectWithByNames(partial, context.tenantId)` → bổ sung `createdByName`, `updatedByName`; nếu lỗi → log warning, graceful degrade (null fields).
7. **Return**: `MaterialGroupResponse!`.

### 6.3 DataLoader / batching strategy

Mutation `createMaterialGroup` là single-write path — không có DataLoader requirement cho luồng này.

| Component | Role | Notes |
|---|---|---|
| `enrichObjectWithByNames` | Utility (non-DataLoader) | Gọi TENANT-USERS REST 1 lần per mutation; trả display names theo `createdBy`/`updatedBy` UUID; graceful degrade nếu user not found → `null` |

### 6.4 Cache strategy

| Operation | Cache hint | Invalidation trigger | Notes |
|---|---|---|---|
| `createMaterialGroup` | `@cacheControl(maxAge: 0)` | — | Mutation — không cache; FE/Mobile list cache tự invalidate sau khi nhận response thành công |

### 6.5 Persisted query allowlist

> NEED CONFIRMATION (2/2): Xác nhận xem `agg-garage-graph` production có bật persisted query allowlist không. Nếu có → cần register `CreateMaterialGroupMutation` hash trước khi deploy spec này.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (Critical Rule #1 enforcement).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/inventory-catalog.graphql` | NEW (hoặc MODIFY additive nếu đã tạo từ LIST feature) | extend SDL additive | ~40 | AC-2/3/4/5/6/8 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/inventory-catalog/createMaterialGroup.ts` | NEW | resolver pattern (passthrough + enrich) | ~70 | AC-8/10 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (method `createMaterialGroup`) | new method trong existing class | ~25 | AC-8 |
| `utils/` | `bffs/agg-garage-graph/src/utils/tenant-users.ts` | REUSE (`enrichObjectWithByNames` existing) | existing utility — no change | ~0 | AC-8 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/inventory-catalog.test.ts` | NEW (hoặc ADDITIVE) | apollo test client + mock downstream | ~80 | AC-7/8/10 |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (V2-4 endpoint stable + contract test green).

```
(← BE FEAT-CAT-GRP-CREATE S4: POST /api/v2/material-groups contract stable)

S5  BFF schema + resolver wire
    Entry: BE FEAT §6 REST contract stable (V2-4 request/response shape confirmed)
    Exit: BFF contract test green + resolver → mock-BE pass + RBAC guard tested
    └─► (hand-off FE/Mobile S6: consume createMaterialGroup mutation)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF: SDL define + resolver impl + data-source method + error mapping + integration tests | schema + resolvers + data-sources + tests | BE FEAT-CAT-GRP-CREATE S4 complete | BFF contract test green; schema snapshot locked | BE FEAT-CAT-GRP-CREATE S4 |

## 9. Business Rules enforced (BFF — secondary)

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-GRP-008` (phân quyền tạo nhóm) | CORNERSTONE | auth guard tại resolver entry | `src/resolvers/inventory-catalog/createMaterialGroup.ts` | AC-10 | Chỉ `garage-owner` có `CATALOG_GROUP_CREATE` |
| `BR-CAT-GRP-012` (tenant isolation) | CORNERSTONE | header propagation; không nhận `tenantId` từ client args | resolver pre-call; `GfInventoryDataSource` | AC-10 | `X-Tenant-Id` từ JWT only — không override bởi input |

> **Primary BR enforcement** tại BE tier (gf-inventory domain). Xem `features/be/FEAT-CAT-GRP-CREATE.md §9` — BR-CAT-GRP-001/002/003/005/006/013 enforce tại domain/service layer.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Assertion |
|---|---|---|---|
| AC-2/3/4/5/6 | BFF contract (schema field presence + types) | test-api | Verify `CreateMaterialGroupInput` fields + `MaterialGroupResponse` shape match §5.3 SDL; snapshot diff |
| AC-7 | BFF integration (error mapping ERR-INV-002) | test-api | Mock BE return 409 `ERR-INV-002` → assert `extensions.code = "ERR_INV_002"` trong response errors |
| AC-8 | BFF integration (resolver → BE + enrich) | test-api | Mock BE 201 response + mock TENANT-USERS → assert `createdByName` populated; assert `parentName` passthrough từ BE body |
| AC-10 | BFF auth (RBAC) | test-isolation | `accountant` JWT → FORBIDDEN `ERR_AUTH_FORBIDDEN`; `garage-owner` JWT → success path (201 mock) |
| — | Schema snapshot | test-api | SDL snapshot diff — detect breaking changes trước merge |
| — | Error mapping `ERR-INV-001` / `ERR-INV-016` | test-api | Mock BE 400 với mỗi error code → assert mapping chính xác |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-CREATE.md` | DRAFT (pending) | Downstream `POST /api/v2/material-groups` (V2-4) — BFF resolver wraps; xem BE §6.1 cho request/response contract detail |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-CREATE.md` | DRAFT (pending) | Consume `createMaterialGroup` mutation từ §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-CREATE.md` | DRAFT (pending) | Consume `createMaterialGroup` mutation từ §6.1 |

**Source ID consistency** (item #18): `source_feat_sha = 183a1fe01cd88978011c3bf7ca35033ca71dabdfd8d27137f69c761f83cd91d4` phải identical cross-tier (BE / FE-web / Mobile files).

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-CREATE.md`](../../../../../Product/features/FEAT-CAT-GRP-CREATE.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-CREATE.md`](../be/FEAT-CAT-GRP-CREATE.md)
- **Paired FE-web**: [`features/fe-web/FEAT-CAT-GRP-CREATE.md`](../fe-web/FEAT-CAT-GRP-CREATE.md)
- **Paired Mobile**: [`features/mobile/FEAT-CAT-GRP-CREATE.md`](../mobile/FEAT-CAT-GRP-CREATE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`Execution/wave-specs/W03/work-packages/PKG-W03-inventory-catalog.md`](../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-017**: Additive aggregates — `MaterialGroup` entity độc lập trong gf-inventory (không reuse legacy `product` table)
- **Fan-out map**: [`Execution/wave-specs/W03/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | Delivery Authority | Audit đối chiếu code thực tế agg-garage-graph (audit 2026-07-01): (a) `MaterialGroupResponse` từ type phẳng → union `MaterialGroupApiResponse \| ErrorResponse`, field thật nằm ở `data: MaterialGroup` (§2/§3 output shapes/§5.1/§5.3/§6.2); (b) `id: ID!` → `id: Int!`; (c) `parentId: ID` → `parentId: Int` (input + type); (d) `createdAt/createdBy/updatedAt/updatedBy` từ `String!` → `String` (nullable); thêm `MaterialGroup`, `MaterialGroupApiResponse`, `childrenCount/productCount: Int`. Lý do: đối chiếu code thực tế agg-garage-graph — code là ground truth, sửa doc cho khớp. |
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho FEAT-CAT-GRP-CREATE W03. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (3 dòng), §2 trách nhiệm BFF (passthrough + enrich pattern), §3 BFF behaviour map 10 AC-IDs (AC-1/9 N/A UI-only, AC-2/3/4/5/6 input fields, AC-7 error mapping, AC-8 enrich response, AC-10 RBAC), §4 auth/perf/security/contract/error-mapping, §5 SDL delta (3 new types + Mutation extend), §6 ops contract (mutation createMaterialGroup → V2-4), §7 file map (5 entries bffs/agg-garage-graph), §8 S5 DAG, §9 BR secondary (BR-CAT-GRP-008/012), §10 test scope, §11 cross-tier pairs. 2 NEED CONFIRMATION items flagged (SDL type reuse + persisted query allowlist). |
