---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-GRP-EDIT.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-GRP-EDIT"
source_feat_sha: "87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436"
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
graphql_ops: ["updateMaterialGroup"]
paired_backend_feats: ["FEAT-CAT-GRP-EDIT"]
paired_fe_web_feats: ["FEAT-CAT-GRP-EDIT"]
paired_mobile_feats: ["FEAT-CAT-GRP-EDIT"]
authoring_inputs:
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-GRP-EDIT.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-GRP-EDIT (BFF): Chỉnh sửa nhóm vật tư hàng hóa

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-GRP-EDIT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `updateMaterialGroup` |
| Cross-tier pair | BE: `FEAT-CAT-GRP-EDIT` \| Web: `FEAT-CAT-GRP-EDIT` \| Mobile: `FEAT-CAT-GRP-EDIT` |

## 0. Nguồn (audit only)

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) |
| Source version | v4 |
| Source SHA | `87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần cập nhật thông tin nhóm vật tư hàng hóa theo nhu cầu vận hành thực tế — đổi tên, chỉnh mô tả, thay đổi nhóm cha hoặc điều chỉnh trạng thái hoạt động. Tính năng này đảm bảo cây phân cấp nhóm vật tư luôn phản ánh đúng cấu trúc tổ chức hàng hóa của garage, phục vụ các nghiệp vụ kho V2 như nhập/xuất tồn và tính giá. FEAT-CAT-GRP-EDIT nằm trong luồng quản lý danh mục sau bước tạo mới (FEAT-CAT-GRP-CREATE) và trước khi xóa (FEAT-CAT-GRP-DELETE).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL mutation `updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!): MaterialGroupResponse!` (PKG V2-M2) để FE/Mobile gọi khi người dùng lưu chỉnh sửa nhóm vật tư.
- Passthrough resolver: forward toàn bộ input xuống gf-inventory `PUT /api/v2/material-groups/{id}` (V2-5) — không có orchestration multi-phase.
- Enrich response: sau khi BE trả kết quả, BFF resolve `parentName` từ V2-3 (nếu `parentId` non-null) và `createdByName`/`updatedByName` từ TENANT-USERS endpoint — cùng pattern M1 (FEAT-CAT-GRP-CREATE BFF).
- Enforce auth: chỉ persona `garage-owner` được phép gọi mutation; propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` headers xuống downstream.
- Surface error codes ERR-INV-003 (chu trình parent) và ERR-INV-016 (mô tả vượt 255 ký tự) từ BE về GraphQL layer không transform.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Tải dữ liệu hiện tại vào form chỉnh sửa

#### AC-1 → N/A (query reuse từ FEAT-CAT-GRP-DETAIL BFF)

Mở form chỉnh sửa là hành vi UI — FE/Mobile dùng lại query `getMaterialGroup(id)` đã định nghĩa ở FEAT-CAT-GRP-DETAIL BFF spec để pre-populate form. BFF không cần op mới cho AC-1.

### Cluster B — Thao tác chỉnh sửa từng trường

#### AC-2 → Schema contract: `UpdateMaterialGroupInput` không khai báo field `code`

- **Khi**: client gọi `updateMaterialGroup` với bất kỳ payload nào.
- **BFF phải**: đảm bảo `UpdateMaterialGroupInput` không có field `code`. GraphQL reject tại schema validation layer nếu client truyền `code` ngoài spec — trước khi resolver chạy.
- **Downstream**: không phát sinh REST call — enforce ở schema layer.
- **Output shape**: N/A (schema validation error nếu vi phạm).
- **Failure mode**: GraphQL field unknown error.
- **Ref**: `src/schema/material-group.graphql` (§7), paired BE FEAT-CAT-GRP-EDIT §9 BR-CAT-GRP-004.

#### AC-3 → BFF forward `name` từ `UpdateMaterialGroupInput` xuống V2-5

- **Khi**: FE/Mobile gọi `updateMaterialGroup` với `input.name`.
- **BFF phải**: include `name` trong body PUT tới V2-5. Validation độ dài, ký tự đặc biệt do BE enforce.
- **Downstream**: `PUT /api/v2/material-groups/{id}` (gf-inventory V2-5).
- **Output shape**: `MaterialGroupApiResponse.data.name` phản ánh giá trị mới.
- **Failure mode**: BE error — passthrough.
- **Ref**: op `updateMaterialGroup` (§6.1), resolver `src/resolvers/inventory/updateMaterialGroup.ts` (§7).

#### AC-4 → BFF forward `parentId` từ input; surface ERR-INV-003 nếu BE detect chu trình

- **Khi**: FE/Mobile gọi `updateMaterialGroup` với `input.parentId` (nullable — null để xóa parent).
- **BFF phải**: forward `parentId` xuống V2-5. Nếu BE trả ERR-INV-003 (BR-CAT-GRP-009 cycle check), BFF surface về GraphQL error với code `ERR-INV-003`. Thành công → enrich `parentName` từ V2-3.
- **Downstream**: V2-5 (primary) + V2-3 `GET /api/v2/material-groups/{parentId}` nếu parentId non-null (enrich).
- **Output shape**: `MaterialGroupApiResponse.data.parentId` + `MaterialGroupApiResponse.data.parentName`.
- **Failure mode**: `ERR-INV-003` passthrough (xem §4.5).
- **Ref**: op `updateMaterialGroup` (§6.1), paired BE FEAT-CAT-GRP-EDIT §9 BR-CAT-GRP-009.

#### AC-5 → BFF forward `status` từ input; cascade INACTIVE hoàn toàn ở BE

- **Khi**: FE/Mobile gọi `updateMaterialGroup` với `input.status` (enum `ACTIVE` hoặc `INACTIVE`).
- **BFF phải**: forward `status` xuống V2-5. Cascade UPDATE toàn bộ nhóm con INACTIVE (BR-CAT-GRP-007) do BE thực hiện trong 1 transaction — BFF không thực hiện bước cascade bổ sung.
- **Downstream**: `PUT /api/v2/material-groups/{id}` (gf-inventory V2-5).
- **Output shape**: `MaterialGroupApiResponse.data.status` phản ánh trạng thái mới.
- **Failure mode**: BE error — passthrough.
- **Ref**: op `updateMaterialGroup` (§6.1), paired BE FEAT-CAT-GRP-EDIT §9 BR-CAT-GRP-007.

#### AC-6 → BFF forward `description` từ input; surface ERR-INV-016 nếu > 255 ký tự

- **Khi**: FE/Mobile gọi `updateMaterialGroup` với `input.description` (nullable).
- **BFF phải**: forward `description` xuống V2-5. Nếu BE trả ERR-INV-016 (description > 255 ký tự), BFF surface về GraphQL error với code `ERR-INV-016`.
- **Downstream**: `PUT /api/v2/material-groups/{id}` (gf-inventory V2-5).
- **Output shape**: `MaterialGroupApiResponse.data.description` phản ánh giá trị mới.
- **Failure mode**: `ERR-INV-016` passthrough (xem §4.5).
- **Ref**: op `updateMaterialGroup` (§6.1), paired BE FEAT-CAT-GRP-EDIT §9 BR-CAT-GRP-012.

### Cluster C — Lưu và huỷ bỏ

#### AC-7 → Mutation `updateMaterialGroup` — primary BFF contract

- **Khi**: FE/Mobile gọi `updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!)` sau khi người dùng bấm "Lưu".
- **BFF phải**:
  1. Validate auth (AC-9 — từ chối nếu không phải `garage-owner`).
  2. Forward `{name, description, parentId, status}` từ `input` xuống V2-5 `PUT /api/v2/material-groups/{id}` với headers tenant.
  3. Nhận response thành công từ BE.
  4. Nếu `parentId` non-null: gọi V2-3 `GET /api/v2/material-groups/{parentId}` → lấy `name` → gán `parentName`.
  5. Enrich `createdByName`/`updatedByName` từ `POST ct-saas-tenant /api/v1/saas-tenant/tenant-users/search/basic` body `{iamUserIds:[createdBy,updatedBy], tenantId}` (canonical R20 v7.23; resolved per CR-20260630-01 P2.1). Degrade gracefully nếu endpoint fail: trả `null` cho display names, không block mutation result.
  6. Trả `MaterialGroupResponse!`.
- **Downstream**: V2-5 (primary) → V2-3 (enrich parentName) → TENANT-USERS (enrich display names).
- **Output shape**: `MaterialGroupResponse!` (§5.1).
- **Failure mode**: V2-5 error → passthrough error code; TENANT-USERS fail → degrade gracefully (null display names).
- **Ref**: op `updateMaterialGroup` (§6.1), resolver `src/resolvers/inventory/updateMaterialGroup.ts` (§7).

#### AC-8 → N/A (client-side cancel)

Huỷ bỏ là hành vi UI local — FE/Mobile discard form state, không gọi BFF. Không cần contract BFF cho AC-8.

### Cluster D — Phân quyền

#### AC-9 → BFF auth guard: chỉ `garage-owner` được phép gọi mutation

- **Khi**: bất kỳ caller nào gọi `updateMaterialGroup`.
- **BFF phải**: kiểm tra JWT claims trước khi resolver forward xuống BE. Chỉ persona `garage-owner` được phép; `accountant` bị từ chối với GraphQL auth error. Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` downstream nếu pass.
- **Downstream**: không gọi nếu auth fail — resolver return early.
- **Output shape**: GraphQL auth error nếu unauthorized.
- **Failure mode**: unauthorized → GraphQL auth error (không leak thông tin BE endpoint).
- **Ref**: `src/auth/materialGroupGuard.ts` (§7), paired BE FEAT-CAT-GRP-EDIT §4.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi REST call xuống downstream từ resolver `updateMaterialGroup` propagate: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- JWT role check trước khi forward: chỉ `garage-owner` persona. `accountant` không có write permission cho catalog groups.
- `tenantId` resolve từ JWT claims — KHÔNG từ client arg (ngăn tenant spoofing).

### 4.2 Performance

- `updateMaterialGroup` là mutation single-entity — DataLoader không cần.
- `parentName` enrichment: 1 sequential call V2-3 sau V2-5 — chấp nhận được (mutation path, không phải list).
- TENANT-USERS enrichment: tối đa 2 calls (createdBy + updatedBy) — degrade gracefully nếu fail.

### 4.3 Security

- KHÔNG log JWT, `X-Tenant-Id`, PII trong resolver logs.
- Tenant scope enforce qua header — KHÔNG cho phép client override `tenantId` qua input args.
- Error message từ BE trả về không được leak internal stack trace về FE.

### 4.4 Contract stability

- `UpdateMaterialGroupInput` và `MaterialGroupResponse` additive only sau khi release.
- Field rename → `@deprecated(reason: "...")`, giữ field cũ ít nhất 1 wave trước xóa.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Trigger | Source AC |
|---|---|---|---|
| `ERR-INV-003` | `ERR-INV-003` (passthrough) | `parentId` tạo chu trình trong cây nhóm — BR-CAT-GRP-009 | AC-4 |
| `ERR-INV-016` | `ERR-INV-016` (passthrough) | `description` vượt 255 ký tự — BR-CAT-GRP-012 | AC-6 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `UpdateMaterialGroupInput` | input | `name: String`, `description: String`, `parentId: Int`, `status: MaterialGroupStatus` (tất cả optional — không có `code`) | NO (new) | AC-3/4/5/6 |
| `MaterialGroupResponse` | union | `MaterialGroupApiResponse \| ErrorResponse` (xem schema block bên dưới) | NO (new — shared với M1 FEAT-CAT-GRP-CREATE) | AC-7 |
| `MaterialGroupApiResponse` | type | `success: Boolean`, `code: String`, `message: String`, `data: MaterialGroup` (implements `ApiResponse`) | NO (new — shared với M1) | AC-7 |
| `MaterialGroup` | type | xem schema block bên dưới | NO (new — shared với M1) | AC-7 |
| `MaterialGroupStatus` | enum | `ACTIVE`, `INACTIVE` | NO (new — shared với M1) | AC-5 |

```graphql
union MaterialGroupResponse = MaterialGroupApiResponse | ErrorResponse

type MaterialGroupApiResponse implements ApiResponse {
  success: Boolean
  code: String
  message: String
  data: MaterialGroup
}

type MaterialGroup {
  id: Int!
  code: String!
  name: String!
  parentId: Int
  parentName: String        # BFF enriched: GET /api/v2/material-groups/{parentId}
  status: MaterialGroupStatus!
  description: String
  childrenCount: Int
  productCount: Int
  createdAt: String
  createdBy: String
  createdByName: String      # BFF enriched: POST ct-saas-tenant /api/v1/saas-tenant/tenant-users/search/basic (R20 v7.23; CR-20260630-01 P2.1)
  updatedAt: String
  updatedBy: String
  updatedByName: String      # BFF enriched: POST ct-saas-tenant /api/v1/saas-tenant/tenant-users/search/basic (R20 v7.23; CR-20260630-01 P2.1)
}

enum MaterialGroupStatus {
  ACTIVE
  INACTIVE
}

input UpdateMaterialGroupInput {
  name: String
  parentId: Int
  description: String
  status: MaterialGroupStatus
}
```

> `MaterialGroupResponse` là union (`MaterialGroupApiResponse | ErrorResponse`) — field nghiệp vụ nằm ở `data: MaterialGroup`. Union + `MaterialGroupApiResponse` + `MaterialGroup` + `MaterialGroupStatus` là shared types dùng cho cả M1 (`createMaterialGroup`) và M2 (`updateMaterialGroup`). Khai báo một lần trong `schema/material-group.graphql` — nếu M1 (FEAT-CAT-GRP-CREATE BFF) author trước, không khai báo lại.

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Mutation` | `updateMaterialGroup` | `MaterialGroupResponse!` | NO | AC-7 |

Full mutation signature:
```graphql
extend type Mutation {
  updateMaterialGroup(id: Int!, input: UpdateMaterialGroupInput!): MaterialGroupResponse!
}
```

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `updateMaterialGroup` | mutation | `id: Int!, input: UpdateMaterialGroupInput!` | `MaterialGroupResponse!` | JWT + tenantId (garage-owner only) | AC-7, AC-9 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream boundary | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `updateMaterialGroup` (primary) | `src/resolvers/inventory/updateMaterialGroup.ts` | `gf-inventory` | `PUT /api/v2/material-groups/{id}` | — | AC-7 |
| `updateMaterialGroup` (enrich parentName) | same resolver — sequential post-primary | `gf-inventory` | `GET /api/v2/material-groups/{parentId}` (V2-3, skip if parentId null) | — | AC-4, AC-7 |
| `updateMaterialGroup` (enrich display names) | same resolver — sequential post-primary | `ct-saas-tenant` | `POST /api/v1/saas-tenant/tenant-users/search/basic` body `{iamUserIds: [createdBy, updatedBy], tenantId}` → `{data: {content: [{iamUserId, fullName}]}}` (canonical R20 v7.23 per agg-garage-graph-graphql.md §3b; resolved per CR-20260630-01 P2.1) | — | AC-7 |

### 6.3 DataLoader / batching strategy

Không cần DataLoader — `updateMaterialGroup` trả về single entity, không phải list.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `updateMaterialGroup` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | Mutation — không cache |

### 6.5 Persisted query allowlist

N/A cho wave này.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/material-group.graphql` | ADDITIVE (new types + mutation op) | extend SDL file — shared với M1 (FEAT-CAT-GRP-CREATE) | ~35 | AC-2, AC-7 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/inventory/updateMaterialGroup.ts` | NEW | passthrough + sequential enrich pattern (ref M1 resolver) | ~70 | AC-7, AC-9 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE (thêm methods `updateMaterialGroup`, `getMaterialGroupById`) | add methods to existing class | ~30 | AC-7 |
| `auth/` | `bffs/agg-garage-graph/src/auth/materialGroupGuard.ts` | NEW nếu chưa có từ M1 (FEAT-CAT-GRP-CREATE) | guard pattern — reuse tương tự guard khác trong project | ~20 | AC-9 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/material-group.test.ts` | ADDITIVE | apollo test client | ~80 | AC-7, AC-9 |

---

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: gf-inventory V2-5 stable + contract test green)

S5  BFF schema + resolver wire
    Entry: FEAT-CAT-GRP-EDIT BE §6.2 V2-5 contract confirmed
    Exit:  BFF integration test green (mock V2-5 + V2-3 + TENANT-USERS)
           Schema additive verified (no breaking change)
           Auth guard: garage-owner allow / accountant reject
    └─► (hand-off FE-Web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Extend SDL | `schema/material-group.graphql` | — | Types + mutation compiles | — |
| S5.2 | Add DataSource methods | `GfInventoryDataSource.ts` | S5.1 | Unit test methods pass | S5.1 |
| S5.3 | Implement resolver + guard | `updateMaterialGroup.ts` + `materialGroupGuard.ts` | S5.2 | Integration test green | S5.2 |
| S5.4 | Integration test | `tests/integration/material-group.test.ts` | S5.3 + BE V2-5 stable | All cases pass | S5.3, BE S4 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement ở BE tier. Xem `features/be/FEAT-CAT-GRP-EDIT.md §9`.

| BR ID | Severity | BFF role | Where (file path) | Touchpoint AC |
|---|---|---|---|---|
| `BR-CAT-GRP-004` | CORNERSTONE | Schema: `code` absent từ `UpdateMaterialGroupInput` | `src/schema/material-group.graphql` | AC-2 |
| `BR-CAT-GRP-007` | CORNERSTONE | Passthrough — cascade INACTIVE enforce ở BE; BFF không thêm logic | `src/resolvers/inventory/updateMaterialGroup.ts` | AC-5 |
| `BR-CAT-GRP-009` | CORNERSTONE | Surface ERR-INV-003 về FE khi BE detect chu trình parent | `src/resolvers/inventory/updateMaterialGroup.ts` | AC-4 |
| `BR-CAT-GRP-008` | NORMAL | Passthrough | `src/resolvers/inventory/updateMaterialGroup.ts` | AC-7 |
| `BR-CAT-GRP-012` | NORMAL | Surface ERR-INV-016 về FE khi description > 255 | `src/resolvers/inventory/updateMaterialGroup.ts` | AC-6 |
| `BR-CAT-GRP-013` | NORMAL | Passthrough | `src/resolvers/inventory/updateMaterialGroup.ts` | AC-7 |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-7 | BFF integration (resolver → BE) | test-api | Mock V2-5 response; verify enrich pipeline (parentName + display names); verify `MaterialGroupResponse` shape |
| AC-9 | BFF auth (RBAC) | test-isolation | Dual persona: `garage-owner` allow, `accountant` reject; JWT missing → reject |
| AC-2 | BFF schema contract | test-api | Assert `UpdateMaterialGroupInput` không có field `code`; gửi `code` trong variables → schema validation error |
| AC-4 | BFF error passthrough (ERR-INV-003) | test-api | Mock V2-5 trả ERR-INV-003; assert GraphQL error code passthrough không transform |
| AC-6 | BFF error passthrough (ERR-INV-016) | test-api | Mock V2-5 trả ERR-INV-016; assert GraphQL error code passthrough không transform |
| — | enrich degrade gracefully | test-api | Mock TENANT-USERS endpoint fail; assert mutation vẫn trả result với `null` cho `createdByName`/`updatedByName` |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-GRP-EDIT.md` | DRAFT (pending) | V2-5 `PUT /api/v2/material-groups/{id}` + error codes (read-only ref — KHÔNG modify) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-GRP-EDIT.md` | DRAFT (pending) | Consume `updateMaterialGroup` mutation từ §6.1 |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-GRP-EDIT.md` | DRAFT (pending) | Consume `updateMaterialGroup` mutation từ §6.1 |

**Source ID consistency** (item 18): `source_feat_sha = 87ac66157ba43be54853b388445e069debedbebc49da6e2ec41a27030a3ea436` — identical across tất cả tier files.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-GRP-EDIT.md`](../../../../../Product/features/FEAT-CAT-GRP-EDIT.md) v4
- **Paired BE**: [`features/be/FEAT-CAT-GRP-EDIT.md`](../be/FEAT-CAT-GRP-EDIT.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.2
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **ADR-009**: JPA no relationship mapping — context cấm @ManyToOne cross-boundary (BE tier, BFF read-only)
- **ADR-017**: Additive aggregates — MaterialGroup entity mới trong gf-inventory

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho FEAT-CAT-GRP-EDIT W03. Mutation V2-M2 `updateMaterialGroup` — passthrough to gf-inventory V2-5, response enrich parentName + TENANT-USERS. 9 ACs covered (AC-1 N/A: reuse detail query; AC-8 N/A: client-side cancel). 1 NEED CONFIRMATION: TENANT-USERS endpoint path + boundary. |
| 2026-07-01 | 2 | main agent | Sửa §5 SDL delta khớp code thực tế agg-garage-graph (audit 2026-07-01): (1) `MaterialGroupResponse` từ flat `type` → union `MaterialGroupApiResponse \| ErrorResponse`, field nghiệp vụ chuyển vào `data: MaterialGroup`; thêm `MaterialGroupApiResponse` (implements `ApiResponse`) + `MaterialGroup` type. (2) `MaterialGroup` bổ sung `childrenCount: Int`, `productCount: Int`; `createdAt`/`createdBy` từ non-null `String!` → nullable `String`. (3) `UpdateMaterialGroupInput` — mọi field optional (`name`, `status` bỏ `!`; xác nhận không có `code`). (4) AC-3/4/5/6 output shape trỏ `MaterialGroupApiResponse.data.*` thay vì flat `MaterialGroupResponse.*`. |
