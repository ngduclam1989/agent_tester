---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-AP-EDIT.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-EDIT"
source_feat_sha: "17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416"
generated_at: "2026-07-08T04:55:00+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting"]
modifies: []
change_type: "new-capability"
graphql_ops:
  - "updateAccountingPeriod"
paired_backend_feats: ["FEAT-AP-EDIT"]
paired_fe_web_feats: ["FEAT-AP-EDIT"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: ""
  template_sha: ""
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-EDIT.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
need_confirmation:
  - id: "NC-BFF-AP-002"
    detail: "RESOLVED 2026-07-08 v2 — chốt map `FORBIDDEN_ERROR` HTTP 403 khi `Inventory:InventoryV2` OFF, align với 7/8 FEAT còn lại cùng W04. BE `@FeatureOn` class-level guard trên `AccountingPeriodController` trả HTTP 403, BFF passthrough verbatim."
    status: "RESOLVED"
---

# FEAT-AP-EDIT (BFF): Chỉnh sửa kỳ kế toán — BFF Passthrough

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-EDIT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | ACTIVE |
| GraphQL ops | `updateAccountingPeriod` |
| Cross-tier pair | BE: FEAT-AP-EDIT \| Web: FEAT-AP-EDIT \| Mobile: (không có) |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) |
| Source version | v7 |
| Source SHA | `17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416` |
| Generated at | 2026-07-08T04:55:00+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần chỉnh sửa một số thông tin hiển thị của kỳ kế toán (tên, mô tả, thứ tự hiển thị) và chủ động đóng hoặc mở lại kỳ để kiểm soát thời điểm chốt sổ kho. Khi một kỳ bị đóng, các phiếu nhập/xuất phát sinh trong kỳ đó sẽ bị khóa ghi nhận (advisory qua ADR-021). Các trường xác định khung kỳ (loại kỳ, kỳ cha, ngày bắt đầu/kết thúc) là bất biến sau khi tạo, đảm bảo tính toàn vẹn cấu trúc cây kỳ kế toán. Feature nằm trong nhóm quản lý kỳ kế toán (EP-INVENTORY-ACCOUNTING-PERIOD), tiền đề cho import tồn đầu kỳ và ghi sổ tồn theo ngày ở các feature liên quan.

---

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose **1 mutation** `updateAccountingPeriod(id: ID!, input: AccountingPeriodUpdateInput!): AccountingPeriod!` — passthrough thuần xuống `PUT /api/v2/accounting-periods/{id}` (V4-AP-5, gf-accounting). Đóng/mở lại kỳ **KHÔNG có mutation riêng** — status transition `OPEN ⇄ CLOSED` được thực hiện bằng cách FE truyền `input.status` trong cùng mutation update (per SDL Architecture `agg-garage-graph-graphql.md §3e.2` AP-M2).
- Input type canonical: `AccountingPeriodUpdateInput` **4 field** `name: String!`, `description: String`, `displayOrder: Int`, `status: AccountingPeriodStatus!` — bỏ hoàn toàn 5 field bất biến (`type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren`), schema-level defense bổ trợ cho `ERR-AP-001` ở BE.
- Auth guard RBAC (chỉ `garage-owner` + `accountant` — Critical Rule #6) + propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- Resolver-level feature flag guard `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403 khi flag OFF (align PKG-W04 §2.2.3 CR-20260707-02 với các resolver §3g Opening Balance khác).
- Map lỗi downstream (`ERR-AP-001` immutable field, `ERR-CMN-not-found` HTTP 404, `FORBIDDEN_ERROR` feature-flag-off / role fail) thành GraphQL `extensions.code` / `ErrorResponse` union chuẩn cho FE consume.
- KHÔNG chứa business validation (overlap check, `HAS_CHILDREN_STRICT`, order constraint mở lại kỳ) — pure passthrough, BE là primary enforcement.
- KHÔNG fetch-merge-write client-side: FE chịu trách nhiệm gửi đủ 4 field (bao gồm `status` hiện tại nếu chỉ edit info khác) trong 1 mutation call. Full-body PUT semantic tuân §3e.6 backend spec.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Chỉnh sửa thông tin kỳ

#### AC-1 → N/A (tái dùng query đã có ở FEAT-AP-DETAIL tier bff)

- Mở form chỉnh sửa là hành vi FE: gọi query `getAccountingPeriod(id)` (expose ở `FEAT-AP-DETAIL` BFF tier, tương ứng BE `V4-AP-3`) để prefill dữ liệu hiện tại vào form. BFF của `FEAT-AP-EDIT` không cần thêm query mới cho việc này.
- Ref: xem `fe-web/FEAT-AP-EDIT.md §3 AC-1`, query `getAccountingPeriod` định nghĩa ở `bff/FEAT-AP-DETAIL.md §6.1`.

#### AC-2 → BFF input schema cho phép sửa `name`/`description`/`displayOrder` (giữ `status` hiện tại)

- **Khi**: FE gửi mutation `updateAccountingPeriod(id: ID!, input: AccountingPeriodUpdateInput!)` với `name`/`description`/`displayOrder` mới, `status` giữ nguyên giá trị hiện tại (FE lấy từ prefill AC-1).
- **BFF phải**: validate input theo GraphQL schema (`name: String!` non-null ≤255 ký tự, `description: String` ≤500, `displayOrder: Int`, `status: AccountingPeriodStatus!` non-null), passthrough xuống V4-AP-5 với full body.
- **Downstream**: `PUT /api/v2/accounting-periods/{id}` (V4-AP-5) — 1 round-trip duy nhất.
- **Output shape**: `AccountingPeriod!` (type reuse — owner declaration ở `FEAT-AP-CREATE` §5.1 BFF tier; FEAT-AP-LIST không dùng flat type; FEAT-AP-DETAIL dùng type riêng `AccountingPeriodDetail`).
- **Failure mode**: BE 400 validation → propagate mapped error; 404 → `ERR-CMN-not-found`.
- **Ref**: op `updateAccountingPeriod` (§6.1), resolver `src/resolvers/accounting-period/updateAccountingPeriod.ts` (§6.2), paired BE `FEAT-AP-EDIT §6` (V4-AP-5).

#### AC-3 → BFF input schema loại trừ trường bị khóa + error mapping `ERR-AP-001`

- **Khi**: FE cố gắng gửi field `type`/`parentId`/`startDate`/`endDate`/`autoGenerateChildren` trong input.
- **BFF phải**: `AccountingPeriodUpdateInput` KHÔNG khai báo 5 field này (schema-level exclusion) — client không thể gửi qua GraphQL hợp lệ; nếu FE cố gửi variable lạ, GraphQL validation tự reject `GRAPHQL_VALIDATION_FAILED` trước khi vào resolver. Trường hợp BE vẫn nhận payload có field lạ (edge case khác), BFF passthrough mã `ERR-AP-001` xuất phát từ BE.
- **Output shape**: n/a (validation reject).
- **Failure mode**: `GRAPHQL_VALIDATION_FAILED` (client-side schema reject) hoặc `ERR-AP-001` (server-side pass-through, hiếm xảy ra).
- **Ref**: §5.1 input type, §4.5 error mapping. `ERR-AP-001` là namespace mới đang chờ Business Authority đăng ký chính thức (OQ7 — xem BE tier).

#### AC-6 → BFF mutation `updateAccountingPeriod` persist thay đổi (lưu thay đổi)

- **Khi**: FE bấm "Lưu" trên form chỉnh sửa.
- **BFF phải**: dùng cùng flow AC-2 — trả về `AccountingPeriod` đã update để FE render lại card/detail.
- **Ref**: trùng AC-2, xem trên.

### Cluster B — Đóng / mở lại kỳ (status transition qua `updateAccountingPeriod`)

> **Note**: SDL Architecture §3e.2 chỉ có 1 mutation `updateAccountingPeriod`; đóng/mở lại kỳ là **special case status transition**, KHÔNG có endpoint riêng. FE build 2 button "Đóng kỳ" / "Mở lại kỳ" gọi cùng mutation với `input.status = CLOSED | OPEN` (per §6.2 note SDL "close/reopen = special case của status update, không có endpoint riêng").

#### AC-4 → BFF passthrough status transition `status = CLOSED` (đóng kỳ)

- **Khi**: FE gửi mutation `updateAccountingPeriod(id, input)` với `input.status = "CLOSED"` (kèm `name`/`description`/`displayOrder` hiện tại từ prefill).
- **BFF phải**: validate schema theo `AccountingPeriodUpdateInput`, passthrough xuống V4-AP-5 — BE là primary enforcement của rule đóng kỳ (`updated_at`/`updated_by` được cập nhật tại BE, không có `closedAt` field riêng per SDL §3e.6 note).
- **Downstream**: `PUT /api/v2/accounting-periods/{id}` (V4-AP-5) với body chứa `status: CLOSED`.
- **Output shape**: `AccountingPeriod!` (`status=CLOSED`, `updatedAt` mới).
- **Failure mode**: 404 → `ERR-CMN-not-found`; validation → `ERR-CMN-validation`; feature-flag-off → `FORBIDDEN_ERROR`.
- **Ref**: op `updateAccountingPeriod` (§6.1), BE §6 V4-AP-5.

#### AC-5 → BFF passthrough status transition `status = OPEN` (mở lại kỳ), không ràng buộc thứ tự

- **Khi**: FE gửi mutation `updateAccountingPeriod(id, input)` với `input.status = "OPEN"` (kèm 3 field còn lại) — có thể mở lại bất kỳ kỳ CLOSED nào, không cần theo thứ tự thời gian (BR-AP-011 — enforce ở BE, BFF chỉ passthrough).
- **BFF phải**: tương tự AC-4 nhưng `status: "OPEN"`. BFF KHÔNG thêm validate thứ tự phía mình — để BE tự quyết định.
- **Downstream**: `PUT /api/v2/accounting-periods/{id}` (V4-AP-5) với body chứa `status: OPEN`.
- **Output shape**: `AccountingPeriod!` (`status=OPEN`, `updatedAt` mới).
- **Failure mode**: tương tự AC-4.
- **Ref**: op `updateAccountingPeriod` (§6.1), BE §9 BR-AP-011.

### Cluster C — Hủy bỏ & phân quyền

#### AC-7 → N/A (Hủy bỏ — FE local UI, không gọi BFF)

- Hành động "Huỷ bỏ" chỉ đóng form phía FE, không gọi bất kỳ GraphQL operation nào. BFF không touch.
- Ref: `fe-web/FEAT-AP-EDIT.md §3 AC-7`.

#### AC-8 → BFF enforce auth guard RBAC trên mutation

- **Khi**: mutation `updateAccountingPeriod` được gọi.
- **BFF phải**: kiểm tra JWT claim `role` thuộc `{garage-owner, accountant}` (Critical Rule #6 — dual persona only); `X-Tenant-Id` từ JWT phải match tenant của accounting period (kiểm qua response BE 403/404). Không đủ quyền → `FORBIDDEN_ERROR` (HTTP 403).
- **Downstream**: guard chạy trước khi gọi REST call.
- **Output shape**: n/a (reject sớm nếu fail guard).
- **Failure mode**: `FORBIDDEN_ERROR`.
- **Ref**: §4.1, §4.3, §9 BR table.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation + feature flag guard

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST (`gf-accounting`).
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- `X-Tenant-Id` trong JWT phải match tenant của accounting period. Không match → `FORBIDDEN_ERROR`.
- Resolver-level `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403 khi flag OFF (PKG-W04 §2.2.3 CR-20260707-02).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Mutation là single-entity, không có nested list — không cần DataLoader.
- 1 round-trip downstream duy nhất (PUT V4-AP-5) — không fetch-merge-write client-side; FE cung cấp đủ 4 field trong 1 call.
- Không cache mutation (`@cacheControl(maxAge: 0, scope: PRIVATE)`).

### 4.3 Security + data exposure

- KHÔNG log JWT, `Authorization` header trong resolver.
- Tenant scope enforced qua `X-Tenant-Id` header (không phải client-controlled arg).
- KHÔNG expose field nội bộ (`tenant_id` raw, audit user id thô) ngoài `updatedBy`/`updatedByName`/`updatedAt` đã định nghĩa ở type `AccountingPeriod`.

### 4.4 Contract stability

- Schema additive only. `AccountingPeriodUpdateInput` KHÔNG được thêm field `type`/`parentId`/`startDate`/`endDate`/`autoGenerateChildren` — vi phạm = breaking đối với hợp đồng "immutable fields" (BR-AP-016).
- Field rename → `@deprecated(reason: "...")` giữ field cũ.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping (registry pass-through)

| Downstream error (BE) | GraphQL `extensions.code` | Source AC | Notes |
|---|---|---|---|
| 400 `ERR-AP-001` (immutable field violation) | `ERR-AP-001` | AC-3 | Verbatim pass-through per §3e.6 registry. Namespace pending BA register — OQ7 (xem BE tier). |
| 404 `ERR-CMN-not-found` (generic HTTP 404 từ BE) | `ERR-CMN-not-found` | AC-2, AC-4, AC-5, AC-6 | Verbatim pass-through per §3e.6. `id` không tồn tại hoặc sai tenant. Không có ERR-AP-* code dedicated — dùng common namespace per gf-accounting-api.md §4.7 pattern. |
| 400 `ERR-CMN-validation` (name blank, ≤255, description ≤500, displayOrder Int) | `ERR-CMN-validation` | AC-2, AC-4, AC-5, AC-6 | Standard validation lỗi. |
| Flag `Inventory:InventoryV2` off (BE `@FeatureOn` guard) hoặc role/tenant mismatch | `FORBIDDEN_ERROR` (HTTP 403) | AC-8, (all) | Registry canonical per §3e.6 — align với 7/8 FEAT khác cùng W04. NC-BFF-AP-002 resolved. |

> **Convention**: BFF passthrough verbatim registry code từ `agg-garage-graph-graphql.md §3e.6` — KHÔNG rewrite sang SCREAMING_SNAKE tự phát. TEST error-code coverage list ở PKG-W04 §4.3 align với registry codes trên.

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `AccountingPeriodUpdateInput` | input | `name: String!`, `description: String`, `displayOrder: Int`, `status: AccountingPeriodStatus!` | NO (new) | AC-2, AC-3, AC-4, AC-5, AC-6 |

> **Alignment note**: type name + shape verbatim từ `Architecture/api/agg-garage-graph-graphql.md §3e.1` (line 46981). Enum `AccountingPeriodStatus` đã declared ở `FEAT-AP-CREATE §5.1` (values `OPEN` / `CLOSED`).

### 5.2 Modified types (additive — backward-compat)

Không có type hiện hữu nào bị modified. `AccountingPeriod` (flat type) — **owner declaration**: `FEAT-AP-CREATE` §5.1 BFF tier — reuse nguyên trạng làm return type. FEAT-AP-LIST không dùng flat type (chỉ `AccountingPeriodTreeNode`); FEAT-AP-DETAIL dùng type riêng `AccountingPeriodDetail` — cả 2 KHÔNG contribute vào ownership.

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `updateAccountingPeriod` | mutation | `id: ID!`, `input: AccountingPeriodUpdateInput!` | `AccountingPeriod!` | JWT (role: `garage-owner`\|`accountant`) + `X-Tenant-Id` + `@FeatureOn(Inventory:InventoryV2)` | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 |

> **Alignment note**: signature verbatim từ `agg-garage-graph-graphql.md §3e.2` row AP-M2 (line 47001). Close/reopen KHÔNG có mutation riêng — status transition thực hiện bằng cách FE truyền `input.status = CLOSED | OPEN` trong cùng mutation (per §6.2 note SDL "close/reopen = special case của status update").

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream | REST endpoint | Method | Op-ID | AC ref |
|---|---|---|---|---|---|---|
| `updateAccountingPeriod` | `bffs/agg-garage-graph/src/resolvers/accounting-period/updateAccountingPeriod.ts` | gf-accounting | `PUT /api/v2/accounting-periods/{id}` | PUT | **V4-AP-5** (§4.5 gf-accounting-api.md) | AC-2, AC-3, AC-4, AC-5, AC-6 |

**Ghi chú — `V4-AP-LC` (lock-check) KHÔNG thuộc phạm vi BFF này**: endpoint `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (ADR-021) là cross-boundary REST advisory được `gf-inventory` gọi trực tiếp (S2S, không qua BFF) để verify ngày OPEN trước OB write-path. BFF `FEAT-AP-EDIT` không consume endpoint này.

**Passthrough pattern** (áp dụng resolver):

```typescript
// updateAccountingPeriod resolver — conceptual (không copy verbatim vào BFF code)
const updated = await gfAccountingDS.updateAccountingPeriod(id, {
  name: input.name,
  description: input.description,
  displayOrder: input.displayOrder,
  status: input.status,  // FE chịu trách nhiệm cung cấp status; đóng kỳ = CLOSED, mở lại = OPEN, giữ nguyên = current status
}); // PUT V4-AP-5
return updated;
```

FE close/reopen UX flow: prefill period detail qua `getAccountingPeriod`, khi user click "Đóng kỳ" / "Mở lại kỳ" → FE build input với 3 field còn lại giữ nguyên + `status` field toggle, gọi mutation. BFF không cần fetch-merge.

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Use cases | Notes |
|---|---|---|---|
| (không cần DataLoader) | — | Mutation là single-entity, không nested list | N+1 risk không xuất hiện trong scope feature này |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `updateAccountingPeriod` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, không cache |

FE cần refetch query `getAccountingPeriod(id)`/`searchAccountingPeriodTree(...)` (FEAT-AP-DETAIL/FEAT-AP-LIST tier bff) sau khi mutation thành công để đồng bộ list/detail cache — không có subscription trong W04.

### 6.5 Persisted query allowlist

Không bắt buộc trong W04. Thêm khi production security audit yêu cầu (cùng pattern với các FEAT khác cùng wave).

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/accounting-period.graphql` | MODIFY (additive — thêm 1 mutation + 1 input vào schema module đã tạo bởi FEAT-AP-CREATE/FEAT-AP-LIST) | extend SDL | ~15 | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/accounting-period/updateAccountingPeriod.ts` | NEW | passthrough resolver pattern | ~40 | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfAccountingDataSource.ts` | ADDITIVE | new method `updateAccountingPeriod` | ~15 | AC-2, AC-4, AC-5, AC-6 |
| `auth/` | `bffs/agg-garage-graph/src/auth/accountingPeriodEditGuard.ts` | NEW | guard pattern (dual persona) | ~20 | AC-8 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/accounting-period-edit.test.ts` | NEW | apollo test client + mock downstream | ~70 | AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/accounting-period-edit-contract.test.ts` | NEW | schema contract snapshot | ~30 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (gf-accounting `V4-AP-5` stable, feature-flag `Inventory:InventoryV2` ON). BFF S5 exit hand-off S6 cho FE-web.

```
(← BE tier S4: gf-accounting PUT V4-AP-5 stable, Inventory:InventoryV2 ON)

S5a  BFF SDL + input type
     Entry: BE FEAT §6 (V4-AP-5) contracts stable
     Exit: schema lint green, type generation pass

S5b  Data Source layer
     Entry: S5a green
     Exit: GfAccountingDS.updateAccountingPeriod unit test pass (mock HTTP)

S5c  Resolver mutation (passthrough)
     Entry: S5b green
     Exit: integration test mock downstream → PUT sequence verified cho các variant (info-edit, close, reopen)

S5d  Auth guard + error mapping + @FeatureOn
     Entry: S5c green
     Exit: role guard test pass; error mapping table verified; flag-off returns FORBIDDEN_ERROR

S5e  BFF contract test
     Entry: S5d green
     Exit: SDL snapshot stable
     └─► (hand-off FE-web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5a | SDL + input type definition | schema | BE §6 stable | schema lint + typecheck | BE S4 |
| S5b | Data Source method (`updateAccountingPeriod`) | data-sources | S5a | unit test mock HTTP pass | S5a |
| S5c | Resolver mutation passthrough | resolvers | S5b | integration test PUT sequence | S5b |
| S5d | Auth guard + error mapping + @FeatureOn | auth + resolvers | S5c | role + error + flag test | S5c |
| S5e | BFF contract test | tests/contract | S5d | SDL snapshot stable | S5d |

---

## 9. Business Rules enforced (BFF — secondary)

> BFF là secondary enforcement. Primary tại `gf-accounting`. BFF enforce: schema-level immutable field exclusion, no order-constraint pass-through, RBAC, feature flag.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-016` | CORNERSTONE | Input schema loại trừ 5 field bất biến (`type`, `parentId`, `startDate`, `endDate`, `autoGenerateChildren`) | `bffs/agg-garage-graph/src/schema/accounting-period.graphql` (`AccountingPeriodUpdateInput`) | AC-2, AC-3, AC-6 | Schema-level defense-in-depth; primary enforce `ERR-AP-001` ở BE |
| `BR-AP-011` | NORMAL | Không thêm ràng buộc thứ tự phía BFF khi status transition OPEN | `src/resolvers/accounting-period/updateAccountingPeriod.ts` | AC-5 | Passthrough — BE tự quyết định |
| `BR-AP-012` | NORMAL | Passthrough thuần cho status transition CLOSED / OPEN — không lọc field client-side | `src/resolvers/accounting-period/updateAccountingPeriod.ts` | AC-4, AC-5 | FE cung cấp full body 4 field |
| RBAC (Critical Rule #6 — dual persona) | CORNERSTONE | Auth guard chỉ `garage-owner` + `accountant` | `bffs/agg-garage-graph/src/auth/accountingPeriodEditGuard.ts` | AC-8 | Reject role khác |
| `@FeatureOn(Inventory:InventoryV2)` | NORMAL | Resolver-level guard fail-fast 403 khi flag OFF | `src/resolvers/accounting-period/updateAccountingPeriod.ts` | (all) | PKG-W04 §2.2.3 CR-20260707-02 |

> **Primary BR enforcement** = BE tier `gf-accounting`. Xem `features/be/FEAT-AP-EDIT.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration (mutation info-edit) | test-api | Mock PUT downstream, verify body 4 field đúng, status giữ nguyên |
| AC-3 | BFF schema (input exclusion) | test-api | Assert `AccountingPeriodUpdateInput` không có field `type`/`parentId`/`startDate`/`endDate`/`autoGenerateChildren`; inject raw query lạ → verify `GRAPHQL_VALIDATION_FAILED` |
| AC-4 | BFF integration (close = status CLOSED) | test-api | Mock downstream, verify body `status=CLOSED`, 3 field còn lại giữ nguyên |
| AC-5 | BFF integration (reopen = status OPEN) | test-api | Mock downstream, verify body `status=OPEN`, không kiểm tra thứ tự |
| AC-6 | BFF integration (persist) | test-api | Trùng AC-2 |
| AC-8 | BFF auth (RBAC + FeatureOn) | test-isolation | Dual persona: `garage-owner`/`accountant`=OK, invalid role=`FORBIDDEN_ERROR`; flag OFF=`FORBIDDEN_ERROR` |
| — | SDL contract snapshot | test-api | Schema lint + type snapshot |
| — | Passthrough round-trip guard | test-api | Verify chỉ 1 downstream call/mutation (PUT), không thừa call fetch trước đó |

---

## 11. Cross-tier coordination (BFF perspective)

> Tham chiếu cross-tier chỉ read-only. BFF KHÔNG spec impl tier khác.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-EDIT.md` | (pending reconcile) | Downstream REST endpoint (§6.2) — `V4-AP-5` (PUT). BFF resolver passthrough thuần. |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-EDIT.md` | (pending reconcile) | Consume 1 mutation từ §6.1. FE build 2 button "Đóng kỳ" / "Mở lại kỳ" cùng gọi `updateAccountingPeriod` với `input.status` khác nhau. FE-tier spec cần update để bỏ 2 mutation invented `closeAccountingPeriod` / `reopenAccountingPeriod` — reconcile theo dõi ở `_decisions.md`. |
| Mobile | (không có) | N/A | AP domain (kỳ kế toán) chưa có mobile touchpoint W04 — Mobile hub `FEAT-INV-MOBILE-MENU` chỉ có 3 tile W04, không bao gồm AP edit |

**Source ID consistency** (item #18): `source_feat_sha = 17487a1791fce729db4bfc12e2e87ed072b745374292945802ba711bc7995416` identical với BE/FE-web files.

---

## 12. References

- **Source**: [`Product/features/FEAT-AP-EDIT.md`](../../../../../Product/features/FEAT-AP-EDIT.md) v7
- **Paired BE**: [`features/be/FEAT-AP-EDIT.md`](../be/FEAT-AP-EDIT.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema** (canonical §3e.1/§3e.2/§3e.6 AP-M2): [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) v7.58
- **BE API doc**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §Accounting Period (`V4-AP-5`)
- **ADR-009**: [`Architecture/decisions/ADR-009.md`](../../../../../Architecture/decisions/ADR-009.md) — no JPA relationship mapping (BE context)
- **ADR-019**: [`Architecture/decisions/ADR-019.md`](../../../../../Architecture/decisions/ADR-019.md) — AP boundary + schema + REST advisory `lock-check` (Decision C, không dùng bởi BFF này)
- **ADR-021**: [`Architecture/decisions/ADR-021.md`](../../../../../Architecture/decisions/ADR-021.md) — REST advisory pattern áp dụng cho OB write-path (context, không dùng bởi BFF này)
- **PKG**: [`Execution/wave-specs/W04/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`Execution/wave-specs/W04/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Bundle used**: `/tmp/exec-spec-bundles/W04/FEAT-AP-EDIT.bff.md` (generated 2026-07-08T04:51:55+00:00)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-AP-EDIT` W04. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough, §3 BFF behaviour map per 8 AC-IDs (5 touched, 2 N/A, 1 auth), §4 auth + perf + security + error mapping, §5 SDL delta (1 new input type, reuse `AccountingPeriod` type), §6 ops contract + fetch-merge-write resolver mapping xuống `V4-AP-3`/`V4-AP-4` (gf-accounting), §7 file map (8 files ⊆ `bffs/agg-garage-graph`), §8 S5 DAG, §9 BR secondary, §10 test hand-off, §11 cross-tier pairs (Mobile N/A). Flag NEED CONFIRMATION NC-BFF-AP-001 (fetch-merge assumption cho partial update) + NC-BFF-AP-002 (feature-flag-off error shape). |
| 2026-07-08 | 2 | Delivery Authority | **W04 BFF↔Arch alignment audit remediation** (per `_decisions.md` Row 14-19). (a) **G2**: replace REST path `/protected/accounting/v1/accounting-periods/` → `/api/v2/accounting-periods/` (10 occurrence — §2, §3 AC-2/AC-4/AC-5, §6.2 table 6 rows, NC-BFF-AP-001 body) + fix lock-check note line 247 `/protected/v1/accounting-periods/lock-check`. (b) **G3**: bỏ mapping `ERR-AP-013` HAS_CHILDREN (không applicable cho AP-EDIT do BR-AP-016 immutable dates); đổi `ERR-AP-020 NOT_FOUND` → `ERR-CMN-not-found` (generic HTTP 404 per gf-accounting-api.md §4.7 pattern). Update §2 bullet 5 mapping list. (c) **G7**: `FEATURE_DISABLED` → `FORBIDDEN_ERROR` (HTTP 403) khi Inventory:InventoryV2 OFF; NC-BFF-AP-002 status RESOLVED. (d) **G9**: §5.2 clarify `AccountingPeriod` flat type ownership — owner = FEAT-AP-CREATE §5.1; FEAT-AP-LIST/DETAIL không contribute (dùng TreeNode / Detail type riêng). §3 AC-2 output shape note updated cùng scope. **G1 (close/reopen mutation vs SDL §3e.2 single `updateAccountingPeriod`)** documented là **known tech debt** per user directive không đụng Architecture — spec giữ 3 mutation semantic đúng BA intent (BR-AP-011/BR-PRC-008), Arch v7.57 as-is. |
| 2026-07-08 | 3 | Delivery Authority | **G1 reconcile FEAT-AP-EDIT ↔ Arch v7.58 SDL §3e single mutation** (Bước 1 Option A per user quannn 2026-07-08 approve plan `t-i-li-u-trong-home-engineer-ac-projects-graceful-stallman.md`). (a) Xoá 2 mutation invented `closeAccountingPeriod` / `reopenAccountingPeriod`; consolidate về single `updateAccountingPeriod(id, input: AccountingPeriodUpdateInput!): AccountingPeriod!` verbatim SDL §3e.2 AP-M2 (line 47001). (b) Rename input `UpdateAccountingPeriodInput` → `AccountingPeriodUpdateInput` + add required field `status: AccountingPeriodStatus!` (4 field tổng — match SDL §3e.1 line 46981 verbatim). (c) Rename error codes SCREAMING_SNAKE → registry canonical: `ACCOUNTING_PERIOD_IMMUTABLE_FIELD` → `ERR-AP-001`, `ACCOUNTING_PERIOD_NOT_FOUND` → `ERR-CMN-not-found`, `PERMISSION_DENIED` → `FORBIDDEN_ERROR` (align 8 spec BFF W04 khác + registry §3e.6 pass-through convention). (d) Fix Op-ID `V4-AP-4` (PUT) → `V4-AP-5` verbatim §3e.6 line 47440 + drop fetch-merge-write 2-step pattern (đổi sang passthrough 1-step: FE cung cấp full body 4 field). Close/reopen UX shift: FE build 2 button cùng gọi `updateAccountingPeriod` với `input.status = CLOSED | OPEN` khác nhau. §3 AC-4/AC-5 rewrite theo status-transition semantic; §6.1 chỉ còn 1 row; §6.2 chỉ còn 1 PUT downstream; §7 file map bỏ 2 resolver close/reopen; §8 S5 DAG simplify; §9 BR table adjust; §10 test scope simplify; §11 cross-tier note fe-web spec cần follow-up reconcile. (e) Add `@FeatureOn(Inventory:InventoryV2)` resolver-level guard §2/§4.1/§9 để align FEAT-OB-EDIT + PKG-W04 CR-20260707-02. NC-BFF-AP-001 (fetch-merge assumption) closed — không còn applicable sau khi shift passthrough. Reviewer verdict cần refresh. Version cite Architecture bump v7.57 → v7.58. |
