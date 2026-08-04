---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-DETAIL.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DETAIL"
source_feat_sha: "6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "ct-saas-tenant"]
modifies: []
change_type: "new-capability"
graphql_ops: ["getAccountingPeriod"]
paired_backend_feats: ["FEAT-AP-DETAIL"]
paired_fe_web_feats: ["FEAT-AP-DETAIL"]
paired_mobile_feats: []
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NOT-COMPUTED (no Bash tool available trong authoring spawn — xem _decisions.md)"
  template_sha: "NOT-COMPUTED (no Bash tool available trong authoring spawn — xem _decisions.md)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DETAIL.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DETAIL (BFF): Chi tiết kỳ kế toán

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DETAIL` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting`, `ct-saas-tenant` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `getAccountingPeriod` (Query, Op ID `AP-Q3`) |
| Cross-tier pair | BE: `FEAT-AP-DETAIL` \| Web: `FEAT-AP-DETAIL` \| Mobile: N/A (AP module Web GMS only — §3e.4) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) |
| Source version | v5 |
| Source SHA | `6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4` |
| Generated at | 2026-07-08T04:51:55+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần xem chi tiết một kỳ kế toán cụ thể — vị trí trong cây phân cấp Năm/Quý/Tháng, khoảng thời gian, trạng thái đóng/mở, và thông tin người tạo/sửa gần nhất. Màn hình chi tiết là điểm trung chuyển bắt buộc trước khi người dùng quyết định chỉnh sửa kỳ hoặc quay lại danh sách quản lý kỳ kế toán. Tính năng thuộc nhóm quản trị nền tảng kế toán tồn kho (`EP-INVENTORY-ACCOUNTING-PERIOD`), giúp garage xác nhận đúng mốc chốt sổ trước khi ghi nhận nghiệp vụ tồn kho phụ thuộc (Tồn đầu kỳ, phiếu nhập/xuất tương lai).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query mới `getAccountingPeriod(id: ID!): AccountingPeriodDetail!` (module `accounting-period`, Op ID `AP-Q3`, §3e — DESIGN scope ADR-019) — **passthrough thuần**, không business logic.
- Forward request xuống `gf-accounting` `GET /api/v2/accounting-periods/{id}` (V4-AP-3) kèm header `Authorization` + `X-Tenant-Id`.
- Enrich 2 field display-only `createdByName`/`updatedByName` qua **Pattern TENANT-USERS** (`ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic`) — 1 batch call gộp cả 2 field, helper `enrichObjectWithByNames` (single-object, không phải paged).
- **KHÔNG** fan-out thêm request cho `parentName`/`parentBreadcrumb` — `gf-accounting` đã embed sẵn qua recursive CTE trong cùng response §4.3.
- Map lỗi backend (`ERR-CMN-not-found` HTTP 404 khi `id` không tồn tại hoặc tenant mismatch) sang union `ErrorResponse` GraphQL, giữ nguyên code — **không tạo mã lỗi mới**.
- Truyền nguyên trạng response `403 FORBIDDEN_ERROR` khi backend fail-fast do feature-flag `Inventory:InventoryV2` OFF (`@FeatureOn("Inventory:InventoryV2")` class-level trên `AccountingPeriodController`) — BFF **không** tự implement flag check riêng, chỉ propagate.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage: 6/6 source AC-IDs. AC không có BFF touchpoint khai báo `→ N/A`.

### Cluster A — Mở & hiển thị chi tiết kỳ

#### AC-1 → Mở màn xem chi tiết — expose query passthrough

- **Khi**: FE-web điều hướng vào màn chi tiết kỳ (từ danh sách hoặc route trực tiếp theo `id`).
- **BFF phải**: expose query `getAccountingPeriod(id: ID!)`, forward `id` xuống `gf-accounting`, trả `AccountingPeriodDetail!` hoặc union `ErrorResponse` (404).
- **Downstream**: `GET /api/v2/accounting-periods/{id}` (gf-accounting, V4-AP-3).
- **Output shape**: `AccountingPeriodDetail` (§5.1).
- **Failure mode**: `ERR-CMN-not-found` (404) khi `id` không tồn tại hoặc tenant mismatch — cùng code, không leak existence cross-tenant.
- **Ref**: op `getAccountingPeriod` (§6.1), resolver `src/resolvers/accounting-period/getAccountingPeriod.resolver.ts` (§6.2), paired BE `FEAT-AP-DETAIL` §6 (V4-AP-3).

#### AC-2 → Các trường hiển thị — response shape đầy đủ

- **Khi**: FE render form/card chi tiết kỳ (code, tên, loại kỳ, kỳ cha, breadcrumb, ngày bắt đầu/kết thúc, trạng thái, thứ tự hiển thị, mô tả).
- **BFF phải**: đảm bảo `AccountingPeriodDetail` expose đủ field 1-1 với backend response §4.3 (camelCase, không rename, không lược field) — bao gồm `parentBreadcrumb` (embedded, không fan-out thêm request).
- **Downstream**: `GET /api/v2/accounting-periods/{id}` (gf-accounting, V4-AP-3) — cùng response đã dùng ở AC-1.
- **Output shape**: `AccountingPeriodDetail.{code, name, type, parentId, parentName, parentBreadcrumb, startDate, endDate, status, displayOrder, description}`.
- **Failure mode**: field thiếu ở backend response → BFF trả `null` cho field nullable (defensive), không throw.
- **Ref**: SDL `AccountingPeriodDetail` (§5.1), `AccountingPeriodBreadcrumb` (§5.1).

### Cluster B — Thông tin audit

#### AC-3 → Thông tin audit — enrichment createdByName/updatedByName

- **Khi**: FE render block "Ngày tạo / Người tạo / Ngày sửa / Người sửa" (BR-AP-CMN-001).
- **BFF phải**: sau khi nhận response backend (chứa `createdBy`/`updatedBy` dạng `iamUserId` string), gọi `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` với `{iamUserIds, tenantId}` (tenantId extract từ JWT) — 1 batch call map cả 2 field, merge qua `enrichObjectWithByNames`.
- **Downstream**: `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` (Pattern TENANT-USERS, canonical §3b prelude).
- **Output shape**: `AccountingPeriodDetail.{createdAt, createdBy, createdByName, updatedAt, updatedBy, updatedByName}`.
- **Failure mode**: `ct-saas-tenant` fail/không match `iamUserId` → `createdByName`/`updatedByName` trả `null` (graceful degrade, không abort query — cùng pattern FEAT-CAT-GRP-LIST BFF W03).
- **Ref**: §3e.1 SDL comment `AccountingPeriodDetail.createdByName/updatedByName`, §3e.3 Resolver discipline enrichment bullet (b).

### Cluster C — Điều hướng & phân quyền (FE-local / auth-context)

#### AC-4 → N/A (FE local navigation)

- Chuyển sang màn chỉnh sửa là route change client-side (FE-web dùng lại `id` đã có, mở form edit — gọi `updateAccountingPeriod` mutation thuộc `FEAT-AP-EDIT` BFF spec riêng, không thuộc scope query của FEAT-AP-DETAIL). BFF không có touchpoint mới ở AC này.

#### AC-5 → N/A (FE local navigation)

- Quay về danh sách là route change client-side (FE-web gọi lại `searchAccountingPeriodTree` thuộc `FEAT-AP-LIST` BFF spec riêng). BFF không có touchpoint mới ở AC này.

#### AC-6 → Phân quyền xem — auth context forward, không field-level filter

- **Khi**: FE gọi `getAccountingPeriod` với JWT của persona `garage-owner` hoặc `accountant`.
- **BFF phải**: forward `Authorization` header nguyên trạng xuống `gf-accounting`; **không** tự filter field hay reject theo persona (BR-AP-CMN-002 — 2 persona quyền ngang nhau trên toàn bộ danh mục kỳ kế toán). Nếu backend fail-fast 403 do flag `Inventory:InventoryV2` OFF hoặc auth invalid → propagate `FORBIDDEN_ERROR`/`UNAUTHENTICATED_ERROR` nguyên trạng, không swallow.
- **Downstream**: `GET /api/v2/accounting-periods/{id}` (gf-accounting) — cùng call AC-1, chỉ khác nhánh lỗi.
- **Output shape**: union `ErrorResponse` khi 401/403.
- **Failure mode**: `UNAUTHENTICATED_ERROR` (401) / `FORBIDDEN_ERROR` (403 — bao gồm case flag OFF).
- **Ref**: §4.1 Auth header propagation, §4.5 Error code mapping, BR-AP-CMN-002.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver `accounting-period` propagate `Authorization` + `X-Tenant-Id` xuống downstream REST `gf-accounting` (per §4.3 headers requirement).
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.
- **Feature-flag fail-fast**: `AccountingPeriodController` gate `@FeatureOn("Inventory:InventoryV2")` class-level tại backend. Khi flag OFF, backend trả `403`; BFF **KHÔNG** implement flag check riêng ở resolver — chỉ propagate response 403 nguyên trạng qua union `ErrorResponse`.

### 4.2 Performance + N+1

- `getAccountingPeriod` là single-object query — **KHÔNG cần DataLoader** (không có N+1 risk, không batch nhiều `id` cùng lúc trong 1 request).
- Enrichment `createdByName`/`updatedByName` dùng 1 request `ct-saas-tenant` duy nhất per query (map cả `createdBy` + `updatedBy` cùng lúc) — không fan-out 2 request riêng.
- Không cần persisted query whitelist riêng cho op này (module DESIGN scope, chưa production).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / card data trong resolver.
- Tenant scope lấy từ `X-Tenant-Id`/JWT — **KHÔNG** dùng arg client-controlled cho tenant filter (backend tự enforce tenant qua header/context).
- 404 response KHÔNG leak existence cross-tenant (id thuộc tenant khác → cùng `ERR-CMN-not-found` như id không tồn tại).

### 4.4 Contract stability

- Schema additive only trong scope AP module (DESIGN — §3e). Field rename → `@deprecated(reason: "...")` giữ field cũ.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `404 ERR-CMN-not-found` (id không tồn tại / tenant mismatch) | `ERR-CMN-not-found` | AC-1 |
| `403` (feature-flag `Inventory:InventoryV2` OFF hoặc RBAC reject) | `FORBIDDEN_ERROR` | AC-6 |
| `401` (JWT invalid/missing) | `UNAUTHENTICATED_ERROR` | AC-6 |
| Timeout / 5xx từ `gf-accounting` | `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | AC-1 |
| `ct-saas-tenant` fail/no-match (enrichment) | (không throw — graceful degrade `null`) | AC-3 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Types dưới đây thuộc module `accounting-period` (§3e SDL, shared across 5 FEAT-AP-* — chỉ types liên quan trực tiếp `FEAT-AP-DETAIL` liệt kê ở đây; `AccountingPeriod` flat + `AccountingPeriodTreeNode` + input types thuộc scope FEAT-AP-LIST/CREATE/EDIT/DELETE — xem tier spec tương ứng để tránh SDL duplicate).

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `AccountingPeriodType` | enum | `YEAR`, `QUARTER`, `MONTH` (shared — có thể đã định nghĩa bởi FEAT-AP-LIST/CREATE tier spec khác) | NO (new) | AC-2 |
| `AccountingPeriodStatus` | enum | `OPEN`, `CLOSED` (shared) | NO (new) | AC-2 |
| `AccountingPeriodBreadcrumb` | type | `id: ID!`, `name: String!`, `type: AccountingPeriodType!` | NO (new) | AC-2 |
| `AccountingPeriodDetail` | type | `id: ID!`, `code: String`, `name: String!`, `type: AccountingPeriodType!`, `parentId: ID`, `parentName: String`, `parentBreadcrumb: [AccountingPeriodBreadcrumb!]!`, `startDate: String!`, `endDate: String!`, `status: AccountingPeriodStatus!`, `displayOrder: Int!`, `description: String`, `createdAt: String`, `createdBy: String`, `createdByName: String`, `updatedAt: String`, `updatedBy: String`, `updatedByName: String` | NO (new) | AC-1, AC-2, AC-3 |

### 5.2 Modified types (additive — backward-compat)

_(không có — FEAT-AP-DETAIL không modify type đã tồn tại; module `accounting-period` toàn bộ mới trong wave này)._

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `getAccountingPeriod` | query | `id: ID!` | `AccountingPeriodDetail!` | JWT + tenantId (header) | AC-1, AC-2, AC-3, AC-6 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `getAccountingPeriod` | `src/resolvers/accounting-period/getAccountingPeriod.resolver.ts` | `FEAT-AP-DETAIL` (BE §6, V4-AP-3) | `GET /api/v2/accounting-periods/{id}` | N/A — single-object, không batch | AC-1, AC-2 |

### 6.3 DataLoader / batching strategy

- **N/A cho op chính** — `getAccountingPeriod` fetch 1 record theo `id`, không có N+1 risk (không list nhiều period cùng lúc).
- Enrichment `createdByName`/`updatedByName` dùng inline helper `enrichObjectWithByNames` (1 request `ct-saas-tenant` per resolver invocation, gộp cả `createdBy` + `updatedBy`) — **không cần DataLoader keyed batching** vì chỉ 1 object per query.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `getAccountingPeriod` | Không có `@cacheControl` directive explicit trong Architecture spec (§3e.6) | — | mutation `updateAccountingPeriod` (FEAT-AP-EDIT) đổi status/name/description | Read-only nhưng data có thể đổi khi user đóng/mở kỳ ở màn khác — không cache server-side. Client-side (Apollo cache normalize theo `id`) tự invalidate khi mutation trả record cùng `id`. |

### 6.5 Persisted query allowlist (nếu enable)

_(không enable trong scope W04 — module DESIGN, chưa production)._

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Nhiều file có thể đã tồn tại từ FEAT-AP-LIST/CREATE tier spec khác (cùng module `accounting-period`) — dev PHẢI kiểm tra trước khi tạo mới (tránh SDL/file conflict).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/accounting-period/accounting-period.schema.ts` | NEW hoặc MODIFY (additive — nếu đã tồn tại từ FEAT-AP-LIST/CREATE) | extend SDL với `AccountingPeriodDetail` + `AccountingPeriodBreadcrumb` + `getAccountingPeriod` | ~35 | AC-1, AC-2, AC-3 |
| `resolvers/` | `src/resolvers/accounting-period/getAccountingPeriod.resolver.ts` | NEW | passthrough resolver pattern (mirror catalog-v2 §3d) | ~45 | AC-1, AC-2 |
| `resolvers/` | `src/resolvers/accounting-period/accounting-period.enrichment.ts` | NEW hoặc ADDITIVE (nếu module đã có enrichment helper từ FEAT khác) | Pattern TENANT-USERS `enrichObjectWithByNames` | ~25 | AC-3 |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | NEW hoặc ADDITIVE — new method `getAccountingPeriodById(id, headers)` | REST client wrapper pattern | ~20 | AC-1 |
| `tests/integration` | `tests/integration/accounting-period.test.ts` | ADDITIVE | apollo test client | ~50 | AC-1, AC-2, AC-3, AC-6 |
| `tests/contract` | `tests/contract/accounting-period-contract.test.ts` | NEW hoặc ADDITIVE | schema contract snapshot | ~20 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE.

```
(← BE tier S4: integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-AP-DETAIL §6 (V4-AP-3) stable
    Exit: BFF contract test green (getAccountingPeriod)
    └─► (hand-off FE-web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver `getAccountingPeriod` | schema + resolvers + data-sources + enrichment | BE FEAT-AP-DETAIL §6 stable | BFF contract test green | BE FEAT-AP-DETAIL S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory). BFF chỉ enforce auth context + schema-level constraints.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-CMN-001` | NORMAL | passthrough + enrichment display name | `resolvers/accounting-period/getAccountingPeriod.resolver.ts`, `accounting-period.enrichment.ts` | AC-3 | BE trả raw `createdBy`/`updatedBy` (iamUserId string); BFF enrich `createdByName`/`updatedByName` — audit content chính (ngày/người tạo/sửa) là primary BE responsibility. |
| `BR-AP-CMN-002` | CORNERSTONE | auth context forward — không field-level filter theo persona | `resolvers/accounting-period/getAccountingPeriod.resolver.ts` | AC-6 | 2 persona (`garage-owner`, `accountant`) quyền xem ngang nhau — BFF forward JWT nguyên trạng, không tự phân biệt persona. |
| `BR-AP-010` | NORMAL | primary BE — enforcement transition `status` thuộc `FEAT-AP-EDIT` | N/A tại BFF (chỉ passthrough field `status`) | AC-2 | `getAccountingPeriod` chỉ đọc `status` hiện tại, không đổi trạng thái — mutation đổi status là scope `FEAT-AP-EDIT` BFF spec riêng. |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-AP-DETAIL.md §9` (khi tier BE đã được author).

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF contract (schema, error union) | test-api | snapshot SDL `getAccountingPeriod` + 404 error shape |
| AC-2 | BFF integration (resolver → BE field mapping) | test-api | mock downstream `gf-accounting`, verify 1-1 field shape với §4.3 response |
| AC-3 | BFF integration (enrichment) | test-api | mock `ct-saas-tenant`, verify `createdByName`/`updatedByName` populate + graceful degrade khi enrichment fail |
| AC-6 | BFF auth (RBAC + flag fail-fast) | test-isolation | dual persona, verify không field-level filter; mock backend 403 khi flag OFF → verify propagate `FORBIDDEN_ERROR` |
| — | N/A N+1 guard | — | không áp dụng — single-object query |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DETAIL.md` | PENDING (chưa author tại thời điểm spawn này) | Downstream REST endpoint (`GET /api/v2/accounting-periods/{id}`, V4-AP-3) — BFF resolver wrap. |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-DETAIL.md` | PENDING (chưa author tại thời điểm spawn này) | Consume query `getAccountingPeriod` (§6.1). |
| Mobile | N/A | N/A | AP module Web GMS only (`agg-garage-graph-graphql.md §3e.4` — "AP ops KHÔNG cho mobile trong batch hiện tại"). |

**Source ID consistency** (item 18): `source_feat_sha` `6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4` phải identical với BE/FE-web files khi được author.

## 12. References

- **Source**: [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) v5
- **Paired BE**: [`features/be/FEAT-AP-DETAIL.md`](../be/FEAT-AP-DETAIL.md) (PENDING)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index (W03-side) + §3e Accounting Period
- **Downstream REST**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.3
- **ADR**: [`Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md`](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md)
- **BR**: [`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.3 (BR-AP-CMN-001/002), §2.1 (BR-AP-010)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-AP-DETAIL` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough query `getAccountingPeriod` + enrichment TENANT-USERS), §3 BFF behaviour map per AC-ID (6/6 coverage — AC-4/AC-5 N/A FE-local nav), §4 auth (flag `Inventory:InventoryV2` fail-fast passthrough) + perf + error mapping, §5-§11 BFF-specific (SDL `AccountingPeriodDetail`/`AccountingPeriodBreadcrumb`, ops contract, resolver mapping, cross-tier pair). Source FEAT chỉ audit. Endpoint/SDL grounded trực tiếp từ `Architecture/api/gf-accounting-api.md` v15 §4.3 + `agg-garage-graph-graphql.md` §3e (bounded read theo Wave Index — không đọc whole 47k-dòng file). BR content grounded từ `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 §2.3 (bundle §D extraction trỏ nhầm file — resolved qua direct read, xem `_decisions.md`). |
