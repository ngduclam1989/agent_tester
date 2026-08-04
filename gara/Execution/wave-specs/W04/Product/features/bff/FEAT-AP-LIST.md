---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-LIST.md"
source_version: 8
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-LIST"
source_feat_sha: "a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf"
generated_at: "2026-07-08T05:15:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting"]
modifies: []
change_type: "new-capability"
graphql_ops: ["searchAccountingPeriodTree"]
paired_backend_feats: ["FEAT-AP-LIST"]
paired_fe_web_feats: ["FEAT-AP-LIST"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NOT-COMPUTED (author session không có Bash tool — orchestrator backfill)"
  template_sha: "NOT-COMPUTED (author session không có Bash tool — orchestrator backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-LIST.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-LIST (BFF): Danh sách kỳ kế toán

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-LIST` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `searchAccountingPeriodTree` |
| Cross-tier pair | BE: `FEAT-AP-LIST` \| Web: `FEAT-AP-LIST` \| Mobile: — (out-of-scope, xem §11) |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) |
| Source version | v8 |
| Source SHA | `a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf` |
| Generated at | 2026-07-08T04:51:55+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu nhanh danh mục **kỳ kế toán** (Năm → Quý → Tháng) để biết kỳ nào đang mở, kỳ nào đã đóng — phục vụ kiểm soát chốt sổ kho và tính giá xuất kho. Feature là điểm vào chính của subsystem Kỳ kế toán mới trên `gf-accounting`, hiển thị dữ liệu dạng cây phân cấp có tìm kiếm theo tên và lọc theo năm. Đây là bước khởi đầu cho toàn bộ luồng nghiệp vụ chốt kỳ / tồn đầu kỳ của Inventory V2 (W04).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query mới `searchAccountingPeriodTree(input: AccountingPeriodTreeSearchInput!): [AccountingPeriodTreeNode!]!` (op `AP-Q2`) trong module `accounting-period` — **query duy nhất** FEAT-AP-LIST cần (bundle §H liệt kê 2 endpoint BE `search`/`tree`, nhưng SSOT hiện hành `agg-garage-graph-graphql.md v7.58 §3e` đã bỏ hẳn `searchAccountingPeriods` paged — xem NEED CONFIRMATION §4.4 + Change Log).
- Resolver pattern: **passthrough thuần** — forward `{year, name}` từ `input` tới `gf-accounting` `POST /api/v2/accounting-periods/tree`, giữ nguyên nested tree structure (ancestor path + full descendant subtree khi có `name` search) mà backend trả về.
- Downstream duy nhất cho FEAT-AP-LIST: `gf-accounting` (`POST /api/v2/accounting-periods/tree`, ref `gf-accounting-api.md §4.2`). KHÔNG cross-call boundary khác.
- KHÔNG cần DataLoader riêng: tree trả về nested đầy đủ trong 1 downstream call — không có per-item enrichment N+1 risk cho FEAT-AP-LIST.
- KHÔNG cache server-side response mutable theo request — client-side cache do FE quản lý, invalidate khi user tạo/xóa kỳ (per `§3e.3` resolver discipline).
- BFF-enforce defensive cap **500 nodes/tenant** trước khi return — backend trả plain `HTTP 413` (không có registry code) khi vượt cap; BFF dịch sang GraphQL error `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` kèm `hint` gợi ý thu hẹp filter `year`/`name`.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream call `gf-accounting`.
- Gate resolver bằng `@FeatureOn("Inventory:InventoryV2")` — tenant OFF → fail-fast HTTP 403 (per PKG-W04 §2.2.3), trước khi forward downstream.
- Web only — module `accounting-period` KHÔNG add vào mobile schema bundle (per `§3e.4`, UX-FLOW-INVENTORY-ACCOUNTING-PERIOD dòng 31 "Web GMS only").

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 9 source AC-ID từ bundle §C (AC-1..AC-9; source thực tế có thêm AC-4b/AC-6b — được cover inline trong AC-4/AC-6 dưới đây để giữ traceability đầy đủ, không tách header riêng vì bundle index không liệt kê).

### Cluster A — Khởi tạo và tải cây kỳ kế toán

#### AC-1 → BFF expose query load cây kỳ khi mở màn hình

- **Khi**: FE-web gọi `searchAccountingPeriodTree(input: {})` (hoặc `{year: <năm hiện tại>}`) lúc mở tab "Kỳ kế toán"
- **BFF phải**: kiểm tra `@FeatureOn("Inventory:InventoryV2")` trước → forward `input` nguyên vẹn tới `gf-accounting POST /api/v2/accounting-periods/tree`, tenant context trích từ JWT/`X-Tenant-Id` header (không từ arg)
- **Downstream**: `gf-accounting` — `POST /api/v2/accounting-periods/tree` (ref V4-AP-2, `gf-accounting-api.md §4.2`)
- **Output shape**: `[AccountingPeriodTreeNode!]!` — mảng root node (kỳ Năm), mỗi node có `children[]` lồng nhau
- **Failure mode**: `gf-accounting` timeout/502/500 → GraphQL `TIMEOUT_ERROR`/`HTTP_ERROR`/`INTERNAL_ERROR`; flag OFF → HTTP 403 fail-fast
- **Ref**: op `searchAccountingPeriodTree` (§6.1), resolver `src/resolvers/accounting-period/searchAccountingPeriodTree.ts` (§6.2), paired BE FEAT-AP-LIST §6

#### AC-2 → BFF expose đủ field cho 6 cột hiển thị

- **Khi**: FE render bảng cây với các cột "Tên kỳ kế toán / Loại kỳ kế toán / Ngày bắt đầu / Ngày kết thúc / Trạng thái / Thao tác"
- **BFF phải**: đảm bảo type `AccountingPeriodTreeNode` expose đủ `name`, `type`, `startDate`, `endDate`, `status` cho 5 cột dữ liệu (cột "Thao tác" là FE-only, không cần data field riêng — dùng `id` sẵn có để build link)
- **Downstream**: cùng call AC-1 — không có call bổ sung riêng cho từng cột
- **Output shape**: `AccountingPeriodTreeNode { id, code, name, type, parentId, startDate, endDate, status, displayOrder, children }`
- **Ref**: §5.1 SDL type

#### AC-3 → BFF expose cấu trúc cây phân cấp qua field `children`

- **Khi**: danh sách có kỳ năm/quý/tháng cần hiển thị lồng nhau (thụt cấp, icon expand/collapse)
- **BFF phải**: trả nguyên field `children: [AccountingPeriodTreeNode!]!` đệ quy do backend build sẵn (recursive CTE) — KHÔNG tự dựng cây tại BFF, KHÔNG flatten
- **Downstream**: cùng call AC-1
- **Output shape**: cây lồng tối đa 3 cấp (YEAR → QUARTER → MONTH, `children: []` ở lá)
- **Failure mode**: tree > 500 nodes/tenant → backend plain `HTTP 413` → BFF dịch `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (413) kèm `hint` gợi ý filter — xem §4.5
- **Ref**: §5.1 `AccountingPeriodTreeNode`, §3e.3 resolver discipline (tree size cap)

#### AC-4 → BFF trả field `status` (OPEN/CLOSED) cho FE render badge; AC-4b empty state trả mảng rỗng

- **Khi**: bảng được render, cần badge trạng thái xanh/đỏ theo từng node
- **BFF phải**: forward nguyên `status: AccountingPeriodStatus!` (`OPEN | CLOSED`) từ backend — KHÔNG tự suy diễn màu badge (là FE concern)
- **Note (source AC-4b — trạng thái trống)**: khi garage chưa có kỳ nào, `gf-accounting` trả `periods: []` (rỗng, không lỗi) → BFF trả `[]` cho `searchAccountingPeriodTree` — FE tự render empty-state UI, KHÔNG có error path riêng cho case này
- **Downstream**: cùng call AC-1
- **Output shape**: `status: AccountingPeriodStatus!` enum 2 giá trị
- **Ref**: §5.1 `enum AccountingPeriodStatus`

### Cluster B — Tìm kiếm & lọc

#### AC-5 → BFF forward tham số tìm kiếm theo tên

- **Khi**: FE truyền `input.name: String` (LIKE-unaccent search)
- **BFF phải**: forward nguyên `name` vào body `POST /api/v2/accounting-periods/tree` — backend authoritative xử lý `WHERE LOWER(unaccent(name)) LIKE ...` qua index `idx_ap_tenant_name`; BFF KHÔNG tự normalize/filter tại resolver layer
- **Downstream**: `gf-accounting` — body `{year, name}`
- **Output shape**: tree giữ matching node + full ancestor path + full descendant subtree (semantics backend, BFF chỉ passthrough)
- **Ref**: §3e.3 "Name search normalization"

#### AC-6 → BFF forward tham số lọc năm; AC-6b sort order backend authoritative

- **Khi**: FE truyền `input.year: Int` (mặc định năm hiện tại khi FE không truyền hoặc gửi giá trị mặc định)
- **BFF phải**: forward nguyên `year` vào body downstream — KHÔNG tự set default tại resolver (backend `POST /api/v2/accounting-periods/tree` tự default = năm hiện tại khi field null)
- **Note (source AC-6b — thứ tự hiển thị)**: sort theo `displayOrder ASC` trong từng cấp cha là backend build sẵn trong response cây; BFF trả nguyên thứ tự `children[]` nhận được, KHÔNG tự re-sort tại resolver
- **Downstream**: `gf-accounting` — body `{year, name}`
- **Output shape**: tree đã filter theo năm (root YEAR matching năm chỉ định)
- **Ref**: `gf-accounting-api.md §4.2` semantics

### Cluster C — Thao tác

#### AC-7 → N/A (nút thao tác theo dòng — FE routing)

- Icon **Xem/Sửa/Xóa** trên mỗi dòng điều hướng FE sang `FEAT-AP-DETAIL` (`getAccountingPeriod`), `FEAT-AP-EDIT` (`updateAccountingPeriod`), `FEAT-AP-DELETE` (`deleteAccountingPeriod`) — mỗi op thuộc phạm vi BFF spec của FEAT tương ứng, KHÔNG thuộc `FEAT-AP-LIST` BFF resolver.

#### AC-8 → N/A (mở form thêm kỳ — FE routing)

- Nút "Thêm kỳ kế toán" mở form `FEAT-AP-CREATE` (op `createAccountingPeriod`) — thuộc phạm vi BFF spec riêng của `FEAT-AP-CREATE`, không phải `FEAT-AP-LIST`.

### Cluster D — Phân quyền & tenant

#### AC-9 → BFF enforce tenant scope từ JWT + feature-flag gate

- **Khi**: chủ garage hoặc kế toán gọi `searchAccountingPeriodTree`
- **BFF phải**: (a) extract tenant từ JWT/`X-Tenant-Id` header — KHÔNG cho phép `tenantId` truyền qua GraphQL arg (input type không có field này); (b) không phân biệt role `garage-owner` vs `accountant` cho query read-only này — cả 2 persona cùng auth context được phép gọi; (c) check `@FeatureOn("Inventory:InventoryV2")` trước khi forward — flag OFF cho tenant → fail-fast 403
- **Downstream**: `gf-accounting` chỉ trả kỳ thuộc `X-Tenant-Id` hiện tại (tenant filter tại backend)
- **Failure mode**: thiếu/sai JWT → `UNAUTHENTICATED_ERROR` (401); flag OFF → `FORBIDDEN` (403) trước khi gọi downstream
- **Ref**: §4.1, §4.5

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi call downstream (`gf-accounting`) propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- Tenant ID lấy từ JWT/header context, KHÔNG từ GraphQL argument (`AccountingPeriodTreeSearchInput` không có field `tenantId`).
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Resolver là pure passthrough: tổng downstream call = **1** (`gf-accounting POST /api/v2/accounting-periods/tree`) per GraphQL request.
- KHÔNG DataLoader / per-item field resolver — cây trả về nested sẵn từ backend (recursive CTE).
- Defensive cap **500 nodes/tenant** — BFF check `summary.total`/độ dài mảng phẳng trước khi return; vượt cap → GraphQL error 413 (không forward payload đầy đủ).

### 4.3 Security + data exposure

- KHÔNG log JWT, tenant ID, hoặc nội dung `name` search trong resolver debug output.
- Tenant scope enforced ở header layer — client không control được tenant qua args.
- `code` (mã kỳ tự sinh `AP-{type}-{tenantId}-{slug}`) là non-user-facing theo BR-AP-002 — BFF trả nguyên, KHÔNG mask nhưng FE không hiển thị cột này (chỉ dùng cho AC-2 5 cột kể trên, không có `code`).

### 4.4 Contract stability

- `AccountingPeriodTreeSearchInput`, `AccountingPeriodTreeNode`, `AccountingPeriodType`, `AccountingPeriodStatus` là type mới hoàn toàn — no breaking-change risk.
- **NEED CONFIRMATION**: task brief ban đầu mô tả `accountingPeriods(filter, page)` + passthrough → BE `V4-AP-3`. Đối chiếu SSOT hiện hành `Architecture/api/agg-garage-graph-graphql.md v7.58 §3e` (retrieved 2026-07-08, cùng ngày với bundle generation): op `searchAccountingPeriods` (paged, tương đương `accountingPeriods(filter, page)`) đã bị **xóa tại v7.54** (2026-07-08, quyết định user quannn "không cần api searchAccountingPeriods, FEAT-AP-LIST sẽ dùng searchAccountingPeriodTree"); `V4-AP-3` map tới `getAccountingPeriod` (chi tiết 1 kỳ, thuộc `FEAT-AP-DETAIL`) — KHÔNG phải LIST. Spec này dùng **`searchAccountingPeriodTree` (AP-Q2) → `V4-AP-2` (`gf-accounting-api.md §4.2`)** làm nguồn authoritative duy nhất, khớp SSOT mới nhất + `§3e.2` "6 operations: 3 query + 3 mutation" hiện hành. Escalate về orchestrator/Delivery Authority nếu task brief cần re-align.
- Thêm field mới vào `AccountingPeriodTreeNode` trong tương lai: additive-only (nullable).
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `year`/`name` invalid (out of range, > 255 chars) | `ERR-CMN-validation` | AC-5, AC-6 |
| `gf-accounting` plain `HTTP 413` (tree > 500 nodes/tenant) | `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (413) | AC-3 |
| `gf-accounting` timeout/502/500 | `TIMEOUT_ERROR` / `HTTP_ERROR` / `INTERNAL_ERROR` | AC-1 |
| Missing/invalid JWT hoặc `X-Tenant-Id` | `UNAUTHENTICATED_ERROR` / `FORBIDDEN_ERROR` | AC-9 |
| `Inventory:InventoryV2` flag OFF cho tenant | HTTP 403 (fail-fast trước khi gọi downstream) | AC-9 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Schema mới hoàn toàn cho module `accounting-period`. Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `AccountingPeriodType` | enum | `YEAR`, `QUARTER`, `MONTH` | NO (new) | AC-2, AC-3 |
| `AccountingPeriodStatus` | enum | `OPEN`, `CLOSED` | NO (new) | AC-4 |
| `AccountingPeriodTreeNode` | type | `id: ID!`, `code: String`, `name: String!`, `type: AccountingPeriodType!`, `parentId: ID`, `startDate: String!`, `endDate: String!`, `status: AccountingPeriodStatus!`, `displayOrder: Int!`, `children: [AccountingPeriodTreeNode!]!` | NO (new) | AC-2, AC-3, AC-4 |
| `AccountingPeriodTreeSearchInput` | input | `year: Int` (default current year), `name: String` (optional LIKE-unaccent) | NO (new) | AC-5, AC-6 |

> Chỉ SDL cần cho `FEAT-AP-LIST`. Các type khác của module `accounting-period` (`AccountingPeriod`, `AccountingPeriodDetail`, `AccountingPeriodCreateInput/Result`, `AccountingPeriodUpdateInput`, `AccountingPeriodLockCheckResult`, `AutoGenerateSummary`) thuộc phạm vi BFF spec của `FEAT-AP-DETAIL`/`FEAT-AP-CREATE`/`FEAT-AP-EDIT`/`FEAT-AP-DELETE` — KHÔNG duplicate ở đây (đã ratified chung 1 SDL module `§3e.1` — dev implement 1 lần cho cả 5 FEAT).

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Query` | `searchAccountingPeriodTree` | `(input: AccountingPeriodTreeSearchInput!): [AccountingPeriodTreeNode!]!` | NO (non-null return) | AC-1 |

### 5.3 SDL inline (canonical excerpt — ref `agg-garage-graph-graphql.md §3e.1`)

```graphql
"Loại kỳ kế toán (3 cấp cố định Năm → Quý → Tháng — BR-AP-003)"
enum AccountingPeriodType {
  YEAR
  QUARTER
  MONTH
}

"Trạng thái kỳ kế toán (OPEN ⇄ CLOSED đối xứng — BR-AP-010/011)"
enum AccountingPeriodStatus {
  OPEN
  CLOSED
}

"Kỳ kế toán — node có children cho tree view (FEAT-AP-LIST)"
type AccountingPeriodTreeNode {
  id: ID!
  code: String
  name: String!
  type: AccountingPeriodType!
  parentId: ID
  startDate: String!
  endDate: String!
  status: AccountingPeriodStatus!
  displayOrder: Int!
  children: [AccountingPeriodTreeNode!]!
}

"Tree search input (FEAT-AP-LIST cây phân cấp + name LIKE)"
input AccountingPeriodTreeSearchInput {
  year: Int      # default current year — filter root YEAR period
  name: String   # optional LIKE-unaccent search trên accounting_period.name
}

extend type Query {
  searchAccountingPeriodTree(input: AccountingPeriodTreeSearchInput!): [AccountingPeriodTreeNode!]!
}
```

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `searchAccountingPeriodTree` | query | `input: AccountingPeriodTreeSearchInput!` | `[AccountingPeriodTreeNode!]!` | JWT + `X-Tenant-Id` + `@FeatureOn("Inventory:InventoryV2")` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-9 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | Pattern | AC ref |
|---|---|---|---|---|---|
| `searchAccountingPeriodTree` | `src/resolvers/accounting-period/searchAccountingPeriodTree.ts` | `FEAT-AP-LIST` (BE `gf-accounting-api.md §4.2`, ref `V4-AP-2`) | `POST /api/v2/accounting-periods/tree` | tenant-scoped pure passthrough + defensive tree-cap | AC-1, AC-3, AC-5, AC-6 |

### 6.3 DataLoader / batching strategy

> Không áp dụng: resolver `searchAccountingPeriodTree` là pure passthrough (1 downstream call `gf-accounting`), tree nested trả sẵn từ backend — không có per-item enrichment → không cần DataLoader.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `searchAccountingPeriodTree` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Không cache server-side; FE tự cache client-side, invalidate khi tạo/xóa kỳ |

### 6.5 Persisted query allowlist

Kích hoạt theo policy chung của `agg-garage-graph`. Operation `SearchAccountingPeriodTree` cần đăng ký hash vào allowlist khi deploy production — thực hiện tại bước S5 exit.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/accounting-period.graphql` | NEW | new module file (ratified chung §3e — dev viết 1 lần cho cả 5 FEAT-AP-*) | ~40 (phần LIST scope) | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/accounting-period/searchAccountingPeriodTree.ts` | NEW | pure passthrough resolver + tree-cap defensive check | ~50 | AC-1, AC-3, AC-9 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfAccountingDataSource.ts` | ADDITIVE (add method) | reuse existing DS (Insurance Settlement W01/W02 đã có) | ~25 | AC-1 |
| `auth/` | `bffs/agg-garage-graph/src/auth/featureFlagGuard.ts` | ADDITIVE (reuse shared `@FeatureOn` guard nếu đã có; NEW nếu chưa) | shared feature-flag guard pattern | ~15 (nếu NEW) | AC-9 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/accounting-period/searchAccountingPeriodTree.test.ts` | NEW | apollo test client pattern | ~90 | AC-1..6, AC-9 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/accounting-period-contract.test.ts` | NEW | schema snapshot contract (chung module — dùng lại cho FEAT-AP khác) | ~40 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (`gf-accounting` `POST /api/v2/accounting-periods/tree` contract stable).

```
(← BE tier S4: gf-accounting V4-AP-2 tree endpoint green)

S5  BFF accounting-period schema + pure passthrough resolver
    Entry: BE FEAT-AP-LIST §6 V4-AP-2 endpoint stable
    Exit:  BFF contract test green (tree envelope shape match) + tree-cap 413 translate verified
    └─► (hand-off FE-web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Viết SDL types (`AccountingPeriodTreeNode`, enums, `AccountingPeriodTreeSearchInput`) + extend `Query` | `schema/accounting-period.graphql` | — | schema compiles | — |
| S5.2 | Implement resolver + DS method + `@FeatureOn` guard | `resolvers/` + `data-sources/` + `auth/` | S5.1 done | resolver forward `POST /api/v2/accounting-periods/tree`, trả nested tree, tree-cap 413 dịch đúng | S5.1 |
| S5.3 | Integration + contract tests | `tests/` | S5.2 done | all tests green (incl. flag-OFF 403 case) | S5.2 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement ở BE tier (xem `features/be/FEAT-AP-LIST.md §9`). BFF chỉ enforce auth + perf + contract + schema-level constraint.

| BR ID | Severity | Enforcement tại BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-015` | CORNERSTONE | Tenant scope từ JWT/header — KHÔNG client-arg; forward `name`/`year` nguyên vẹn cho backend LIKE/filter | `resolvers/accounting-period/searchAccountingPeriodTree.ts` | AC-5, AC-6, AC-9 | BE primary enforce filter logic; BFF secondary guard tenant |
| `BR-AP-003` | NORMAL | Schema-level: `AccountingPeriodType` enum chỉ 3 giá trị `YEAR/QUARTER/MONTH` — GraphQL tự reject giá trị ngoài enum | `enum AccountingPeriodType` | AC-2, AC-3 | BE primary enforce hierarchy constraint |
| `BR-AP-010` | NORMAL | Schema-level: `AccountingPeriodStatus` enum chỉ 2 giá trị `OPEN/CLOSED` — GraphQL tự reject giá trị khác | `enum AccountingPeriodStatus` | AC-4 | BE primary; BFF chỉ passthrough hiển thị |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration | test-api | gọi `searchAccountingPeriodTree(input: {})` → mock `gf-accounting` tree response → verify shape `[AccountingPeriodTreeNode!]!` |
| AC-2 | BFF contract | test-api | snapshot SDL type `AccountingPeriodTreeNode` đủ 5 field data cho cột bảng |
| AC-3 | BFF integration | test-api | mock nested 3-cấp tree → verify resolver trả nguyên `children[]` đệ quy, không flatten |
| AC-4 | BFF integration | test-api | mock node `status=CLOSED`/`OPEN` → verify passthrough; mock `[]` (AC-4b) → verify trả mảng rỗng, không lỗi |
| AC-5 | BFF integration | test-api | `input.name="Quý 2"` → verify downstream body `{name: "Quý 2"}` |
| AC-6 | BFF integration | test-api | `input.year=2026` → verify downstream body `{year: 2026}`; `input={}` → verify không tự inject default tại BFF |
| AC-9 | BFF auth | test-isolation | thiếu `X-Tenant-Id`/JWT → `UNAUTHENTICATED`; flag `Inventory:InventoryV2` OFF cho tenant → HTTP 403 trước khi gọi downstream |
| tree-cap | BFF integration | test-api | mock backend plain `HTTP 413` → verify BFF dịch đúng `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` + `hint` |
| passthrough | BFF integration | test-api | verify resolver chỉ gọi đúng **1** downstream (`gf-accounting` tree) per request |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-LIST.md` | N-A (chưa generate tại thời điểm authoring này) | `V4-AP-2` `POST /api/v2/accounting-periods/tree` — BFF resolver pure passthrough wrap tree nested |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-LIST.md` | N-A (chưa generate) | Consume `searchAccountingPeriodTree` từ §6.1; render bảng cây 5 cột (§3 AC-2) + badge trạng thái (AC-4) + search/filter (AC-5/6) |
| Mobile | — | N-A — **out-of-scope** | AP module Web GMS only (UX-FLOW-INVENTORY-ACCOUNTING-PERIOD dòng 31 + `§3e.4`); PKG-W04 §2.2.5 không liệt kê FEAT-AP-* trong 2 màn mobile W04 |

**Source ID consistency** (item #18): `source_feat_sha` = `a3d27bb0bff3e16209fc92f26bc7c9f88ed2012816dcba95fdf5300087eff6bf` — PHẢI identical với BE/FE-web tier files khi generate.

---

## 12. References

- **Source**: [`Product/features/FEAT-AP-LIST.md`](../../../../../Product/features/FEAT-AP-LIST.md) v8
- **Paired BE**: [`features/be/FEAT-AP-LIST.md`](../be/FEAT-AP-LIST.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3e (bounded read theo `.agents/_ref-api-doc-wave-index.md`)
- **BE REST contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.2
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **ADR-019**: Accounting Period on gf-accounting boundary — 3 quyết định (boundary ownership, schema strategy, cross-boundary lock-check surface)
- **ADR-009**: No JPA relationship mapping — scalar FK pattern (BFF context: không expose join chain trong resolver)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-AP-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier, sẽ đồng bộ khi BE/FE-web tier generate), §2 trách nhiệm BFF (passthrough tree + feature-flag gate), §3 BFF behaviour map 9 AC (7 touch + 2 N/A FE-routing), §4 auth + perf + cache + error mapping + NEED CONFIRMATION (correction từ task brief `accountingPeriods(filter,page)`/`V4-AP-3` → SSOT thực tế `searchAccountingPeriodTree`/`V4-AP-2` per `agg-garage-graph-graphql.md v7.57 §3e`, xóa `searchAccountingPeriods` paged tại v7.54 cùng ngày), §5-§11 BFF-specific (SDL delta 4 type mới, 1 op, resolver mapping, file map `agg-garage-graph`, S5 DAG, BR secondary, test hand-off, cross-tier pair — BE/FE-web N-A chưa generate, Mobile out-of-scope). Nguồn: bounded read `agg-garage-graph-graphql.md §0 Wave Index → §3e` + `gf-accounting-api.md §4.1-§4.8` (đọc trực tiếp ngoài bundle vì bundle §G chứa extract sai — mẫu `policyRoleList` không liên quan AP). `fanout_map_sha`/`template_sha` NOT-COMPUTED (author session không có Bash tool, theo precedent `_decisions.md` W04). |
