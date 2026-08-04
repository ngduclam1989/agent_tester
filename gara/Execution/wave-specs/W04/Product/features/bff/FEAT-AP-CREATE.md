---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-AP-CREATE.md"
source_version: 6
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-CREATE"
source_feat_sha: "fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c"
generated_at: "2026-07-08T09:30:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "ct-saas-tenant"]
modifies: []
change_type: "new-capability"
graphql_ops:
  - "createAccountingPeriod"
paired_backend_feats: ["FEAT-AP-CREATE"]
paired_fe_web_feats: ["FEAT-AP-CREATE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "29aa42e1a902864edb2449b59fc1f7419dc0ee8a1bca7a79e7bc368d176208bd"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: ""
  template_sha: ""
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-CREATE.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
need_confirmation:
  - id: "NC-BFF-AP-001"
    detail: "AC-12 'Phân quyền tạo' — bundle/API doc §3e chỉ ghi auth 'authenticated/context-dependent', không có BR-ID riêng cho granular RBAC restriction trên mutation createAccountingPeriod (khác với Insurance module có BR-GF-ACCOUNTING-013 rõ ràng). W04 DESIGN batch enforce baseline: mọi authenticated user (2 persona accountant | garage-owner) đều gọi được — cần Business Authority/PO xác nhận có persona-restrict riêng (vd chỉ accountant) hay không trước DEV."
---

# FEAT-AP-CREATE (BFF): Tạo kỳ kế toán — BFF Passthrough + Enrichment

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting`, `ct-saas-tenant` (enrichment only) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `createAccountingPeriod` |
| Cross-tier pair | BE: FEAT-AP-CREATE \| Web: FEAT-AP-CREATE \| Mobile: — (out of scope, Web GMS only) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) |
| Source version | v6 |
| Source SHA | `fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c` |
| Generated at | 2026-07-08T09:30:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage/kế toán cần tạo kỳ kế toán mới (Năm/Quý/Tháng) — có thể tự động sinh kỳ con — để thiết lập khung kỳ kiểm soát đóng/mở sổ kho. Kỳ kế toán là mốc chốt sổ dùng xuyên suốt các luồng nhập/xuất kho, tồn đầu kỳ và báo cáo kế toán ở các wave sau. Đây là bước khởi tạo nền tảng cho `EP-INVENTORY-ACCOUNTING-PERIOD`, tiền đề để `gf-inventory` (Opening Balance, Receipt, Delivery) enforce lock kỳ qua REST advisory (ADR-021).

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose 1 mutation `createAccountingPeriod(input: AccountingPeriodCreateInput!): AccountingPeriodCreateResult!` — **passthrough thuần** sang `gf-accounting POST /api/v2/accounting-periods` (Op-ID backend `V4-AP-4`, `gf-accounting-api.md §4.4`), KHÔNG business logic validate (overlap/parent-range/date do backend enforce).
- Sau khi nhận response backend, thực hiện **1 enrichment bổ sung**: resolve `createdByName`/`updatedByName` trên field `createdPeriod` qua **Pattern TENANT-USERS** (`ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic`, helper `enrichObjectWithByNames`) — KHÔNG phải cross-boundary business enrichment, chỉ display-name lookup.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting` + `ct-saas-tenant`.
- Map lỗi validate backend (`ERR-INV-021/022/023`) + lỗi auth thành GraphQL error union chuẩn (`ErrorResponse`) cho FE consume.
- Gate feature qua schema availability — module `accounting-period` chỉ bật khi `Inventory:InventoryV2` ON (mirror backend `@FeatureOn`); nếu flag OFF, resolver trả lỗi fail-fast (xem §4.3).
- KHÔNG tự tính `code` (auto-derived backend), KHÔNG tự validate business rule ngày/overlap (đó là gf-accounting territory).

## 3. Hành vi cần triển khai (BFF behaviour map)

> Mỗi source AC-ID → 1 BFF behaviour statement. Coverage 12/12.

### Cluster A — Mở form / hủy bỏ (FE local, BFF không touch)

#### AC-1 → N/A (mở form thêm kỳ — local UI state của FE)

- Mở modal/form "Thêm kỳ kế toán" là FE local state (không gọi BFF cho tới khi submit). Xem `fe-web/FEAT-AP-CREATE.md §3 AC-1`.

#### AC-11 → N/A (huỷ bỏ — FE local, đóng form không gọi BFF)

- Đóng form/discard input là FE local action, không có GraphQL op tương ứng. Xem `fe-web/FEAT-AP-CREATE.md §3 AC-11`.

### Cluster B — Input mapping (mutation `createAccountingPeriod`)

#### AC-2 → BFF expose SDL enum `AccountingPeriodType` cho FE chọn loại kỳ

- **Khi**: FE render dropdown "Loại kỳ" (Năm/Quý/Tháng) rồi gán giá trị vào `input.type` khi submit.
- **BFF phải**: expose enum `AccountingPeriodType { YEAR, QUARTER, MONTH }` trong schema (§5.1); forward `input.type` nguyên văn xuống backend, không transform.
- **Ref**: SDL §5.1, mutation input field `type` (§6.1).

#### AC-3 → BFF forward field `name` (bắt buộc, không unique — BR-AP-002)

- **Khi**: FE nhập tên kỳ kế toán.
- **BFF phải**: forward `input.name: String!` (schema-level required, không transform/trim — trách nhiệm backend nếu cần).
- **Failure mode**: backend trả 400 `ERR-CMN-validation` (blank/quá 255 ký tự) → GraphQL `BAD_USER_INPUT`.
- **Ref**: §6.1 `AccountingPeriodCreateInput.name`.

#### AC-4 → BFF forward field đặc thù theo loại kỳ (`year`, `parentId`)

- **Khi**: FE nhập field đặc thù theo `type` đã chọn — `year` (bắt buộc mọi type, form hiển thị dropdown năm khi `type=YEAR`; QUARTER/MONTH có thể derive client-side từ parent chain nhưng field vẫn required ở schema) + `parentId` (bắt buộc khi `type ≠ YEAR`, per BR-AP-004).
- **BFF phải**: forward `input.year: Int!` + `input.parentId: ID` (nullable) verbatim; KHÔNG tự derive/validate cross-consistency `year = EXTRACT(YEAR FROM startDate)` — backend CHECK constraint enforce (per `gf-accounting-data-model.md §2ter.1 v10`).
- **Ref**: §5.1 `AccountingPeriodCreateInput.year` (v7.55 add), `.parentId`.

#### AC-5 → BFF forward `parentId` chọn từ dropdown "Thuộc kỳ" (kỳ cha hợp lệ)

- **Khi**: FE chọn kỳ cha từ dropdown đã được filter theo type hợp lệ (YEAR cho kỳ QUARTER, QUARTER cho kỳ MONTH). Dữ liệu populate dropdown lấy từ query `searchAccountingPeriodTree` — thuộc scope BFF `FEAT-AP-LIST`, KHÔNG phải scope mutation này.
- **BFF phải**: chỉ forward `input.parentId` đã chọn xuống backend; validate "parent hợp lệ" (type cha đúng, tenant match) là trách nhiệm backend (`ERR-INV-022`).
- **Ref**: §11 cross-ref `FEAT-AP-LIST` (BFF) cho nguồn dropdown data.

#### AC-6 → BFF forward `startDate`/`endDate` (ISO `YYYY-MM-DD`)

- **Khi**: FE nhập ngày bắt đầu/kết thúc kỳ.
- **BFF phải**: forward `input.startDate: String!` + `input.endDate: String!` nguyên văn (ISO string, không parse/format lại tại BFF).
- **Failure mode**: `ERR-INV-021` (endDate < startDate, BR-AP-006), `ERR-INV-022` (range ngoài parent range, BR-AP-007) — map §4.5.
- **Ref**: §6.1 input fields.

#### AC-7 → BFF forward `displayOrder`/`description`/`status` (optional, có default)

- **Khi**: FE nhập/chọn thứ tự hiển thị, mô tả, trạng thái ban đầu.
- **BFF phải**: forward `input.displayOrder: Int` (default 0 nếu FE không gửi — schema optional, backend áp default), `input.description: String` (optional, ≤500 chars — backend validate), `input.status: AccountingPeriodStatus` (default `OPEN` nếu FE không gửi).
- **Ref**: §5.1 `AccountingPeriodCreateInput`, §5.1 enum `AccountingPeriodStatus`.

#### AC-8 → BFF forward `autoGenerateChildren` + trả `AutoGenerateSummary`

- **Khi**: FE tick tùy chọn "Tự động sinh kỳ con" (chỉ available khi `type=YEAR` hoặc `type=QUARTER` — BR-AP-009; UI ẩn/disable cho `type=MONTH`, nhưng BFF vẫn phải xử lý defensive nếu bị bypass).
- **BFF phải**: forward `input.autoGenerateChildren: Boolean` (default `false`); trả nguyên văn field `generated: AutoGenerateSummary!` từ backend response gồm `created`, `skipped`, `skippedDetails: [AutoGenerateSkippedDetail!]!` (mỗi item: `type`, `startDate`, `endDate`, `conflictWithId`) — không transform, để FE tự render toast "Đã tạo X kỳ, bỏ qua Y kỳ đã tồn tại".
- **Failure mode**: nếu FE bypass gửi `autoGenerateChildren=true` với `type=MONTH` → backend 400 `BAD_USER_INPUT` (standard gateway validation, không phải `ERR-INV-*` riêng).
- **Ref**: §5.1 `AutoGenerateSummary`, `AutoGenerateSkippedDetail`; §6.1 op response shape.

#### AC-9 → BFF map lỗi validate khoảng ngày thành GraphQL error union

- **Khi**: backend trả 400 do vi phạm BR-AP-006/007/008 (endDate<startDate / ngoài range parent / trùng biên sibling).
- **BFF phải**: pass thẳng `ERR-INV-021`/`ERR-INV-022`/`ERR-INV-023` (giữ nguyên code, không rename) vào union `ErrorResponse` — KHÔNG duplicate validate tại BFF.
- **Ref**: §4.5 error mapping table.

### Cluster C — Lưu & phân quyền

#### AC-10 → BFF orchestrate mutation `createAccountingPeriod` (core save flow)

- **Khi**: FE submit form hợp lệ (đã qua client-side basic validate).
- **BFF phải** thực hiện 2 bước:
  1. **Passthrough create**: `POST /api/v2/accounting-periods` (gf-accounting, `V4-AP-4`) với body = `input` nguyên văn (camelCase khớp SDL). Response 201 → `{createdPeriod, generated}`.
  2. **Enrichment `createdByName`/`updatedByName`** (conditional, single-hop): gom `createdBy`/`updatedBy` từ `createdPeriod` → gọi `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` `{iamUserIds, tenantId}` (tenantId từ JWT) → merge qua helper `enrichObjectWithByNames`. Nullable defensive — trả `null` khi không match, KHÔNG throw.
- **Downstream**: `gf-accounting POST /api/v2/accounting-periods` (bước 1) + `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` (bước 2, conditional).
- **Output shape**: `AccountingPeriodCreateResult { createdPeriod: AccountingPeriod!, generated: AutoGenerateSummary! }`.
- **Failure mode**: xem §4.5 table; enrichment step lỗi → non-fatal (trả `createdByName: null`, KHÔNG abort mutation — record đã tạo thành công ở backend).
- **Ref**: op `createAccountingPeriod` (§6.1), resolver `src/resolvers/accounting-period/createAccountingPeriod.ts` (§6.2), paired BE `features/be/FEAT-AP-CREATE.md §6` (V4-AP-4).

#### AC-12 → BFF enforce auth guard (authenticated + tenant match) cho mutation

- **Khi**: resolver `createAccountingPeriod` nhận request.
- **BFF phải**: verify JWT hợp lệ (production; dev/local có thể bypass theo profile); `X-Tenant-Id` forward xuống backend cho tenant isolation (BR-AP-015). Nếu module flag `Inventory:InventoryV2` OFF → trả lỗi fail-fast 403 (mirror backend `@FeatureOn` gate).
- **Failure mode**: JWT thiếu/hết hạn → `UNAUTHENTICATED_ERROR` 401; flag OFF → `FORBIDDEN_ERROR` 403.
- **NEED CONFIRMATION** [`NC-BFF-AP-001`]: chưa rõ có persona-restrict riêng (vd chỉ `accountant`) ngoài baseline authenticated hay không — bundle/API doc §3e không cite BR-ID granular RBAC cho AP module (khác Insurance có `BR-GF-ACCOUNTING-013` rõ). W04 batch enforce baseline 2-persona (`accountant` | `garage-owner`) đều được tạo kỳ.
- **Ref**: §4.1, §4.3, §9 BR table.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting` + `ct-saas-tenant`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Mutation single-record — không có nested list, không cần DataLoader.
- Enrichment `createdByName`/`updatedByName` là **1 request duy nhất** ct-saas-tenant cho cả 2 field (batch trong cùng call, không fan-out 2 lần) — per Pattern TENANT-USERS canonical.
- Không cache (mutation).

### 4.3 Security + data exposure

- KHÔNG log `Authorization`/JWT trong resolver.
- Feature-flag gate: module `accounting-period` chỉ active khi `Inventory:InventoryV2` ON — mirror backend `@FeatureOn("Inventory:InventoryV2")`; nếu OFF, fail-fast 403 tại resolver trước khi gọi downstream (tránh leak endpoint tồn tại/không qua timing).
- Tenant scope enforced qua `X-Tenant-Id` header (không client-controlled arg trong `input`).

### 4.4 Contract stability

- Schema additive only — `AccountingPeriodCreateInput`/`AccountingPeriodCreateResult` là type mới (W04 DESIGN, chưa có baseline trước đó).
- Breaking change (rename/remove field) → CR MAJOR + ADR update.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC | Notes |
|---|---|---|---|
| 400 `ERR-INV-021` (endDate < startDate) | `ERR-INV-021` (pass-through, giữ nguyên code) | AC-6, AC-9 | BR-AP-006 |
| 400 `ERR-INV-022` (child range ngoài parent range / invalid parent type) | `ERR-INV-022` | AC-4, AC-5, AC-9 | BR-AP-003/004/007 |
| 400 `ERR-INV-023` (sibling overlap) | `ERR-INV-023` | AC-9, AC-10 | BR-AP-008 |
| 400 (blank `name`, `autoGenerateChildren=true` khi `type=MONTH`) | `BAD_USER_INPUT` | AC-3, AC-8 | Standard gateway validation |
| 401 | `UNAUTHENTICATED_ERROR` | AC-12 | Missing/invalid JWT |
| 403 | `FORBIDDEN_ERROR` | AC-12 | `Inventory:InventoryV2` OFF hoặc tenant mismatch |
| 5xx / timeout | `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | AC-10 | Forward từ gf-accounting |
| khác | `UNKNOWN_ERROR` / `INTERNAL_ERROR` | — | Fallback |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Types dưới thuộc module SDL `accounting-period` (shared với `FEAT-AP-LIST/DETAIL/EDIT/DELETE` — canonical single-declaration, feature này chỉ "sở hữu" slice `AccountingPeriodCreateInput`/`AccountingPeriodCreateResult`/`AutoGenerateSummary`/`AutoGenerateSkippedDetail`; enum `AccountingPeriodType`/`AccountingPeriodStatus` và type `AccountingPeriod` dùng chung cross-feature, KHÔNG re-declare nếu đã tồn tại từ spec tier BFF khác trong cùng wave).

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `AccountingPeriodType` | enum | `YEAR`, `QUARTER`, `MONTH` | NO (new, shared) | AC-2 |
| `AccountingPeriodStatus` | enum | `OPEN`, `CLOSED` | NO (new, shared) | AC-7 |
| `AccountingPeriod` | type | `id: ID!`, `code: String`, `name: String!`, `type: AccountingPeriodType!`, `parentId: ID`, `parentName: String`, `startDate: String!`, `endDate: String!`, `status: AccountingPeriodStatus!`, `displayOrder: Int!`, `description: String`, `createdAt/createdBy/createdByName/updatedAt/updatedBy/updatedByName: String` | NO (new, shared — output của `createdPeriod`) | AC-10 |
| `AutoGenerateSkippedDetail` | type | `type: AccountingPeriodType!`, `startDate: String!`, `endDate: String!`, `conflictWithId: ID` | NO (new) | AC-8 |
| `AutoGenerateSummary` | type | `created: Int!`, `skipped: Int!`, `skippedDetails: [AutoGenerateSkippedDetail!]!` | NO (new) | AC-8 |
| `AccountingPeriodCreateResult` | type | `createdPeriod: AccountingPeriod!`, `generated: AutoGenerateSummary!` | NO (new) | AC-10 |
| `AccountingPeriodCreateInput` | input | `name: String!`, `type: AccountingPeriodType!`, `parentId: ID`, `year: Int!`, `startDate: String!`, `endDate: String!`, `status: AccountingPeriodStatus`, `displayOrder: Int`, `description: String`, `autoGenerateChildren: Boolean` | NO (new) | AC-2..AC-9 |

### 5.2 Modified types (additive — backward-compat)

Không có type baseline nào bị modify — toàn bộ module `accounting-period` là DESIGN mới (ADR-019), chưa có schema trước đó.

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `createAccountingPeriod` | mutation | `input: AccountingPeriodCreateInput!` | `AccountingPeriodCreateResult!` | JWT + `X-Tenant-Id` + `Inventory:InventoryV2` flag ON | AC-2..AC-10, AC-12 |

Op-ID backend reference: `AP-M1` (`agg-garage-graph-graphql.md §3e.2`).

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `createAccountingPeriod` | `src/resolvers/accounting-period/createAccountingPeriod.ts` | `FEAT-AP-CREATE` (BE — `gf-accounting-api.md §4.4`, Op-ID `V4-AP-4`) | `POST /api/v2/accounting-periods` | n/a (single call) | AC-10 |
| `createAccountingPeriod` (enrichment) | `src/resolvers/accounting-period/createAccountingPeriod.ts` | `ct-saas-tenant` (Pattern TENANT-USERS, không có FEAT riêng) | `POST /api/v1/saas-tenant/tenant-users/search/basic` | n/a (conditional single call, không loader) | AC-10 |

> **Path discrepancy note** (audit — xem §13 Change Log + `_decisions.md`): PKG snapshot bundle §H liệt kê REST index khác (`V4-AP-2 POST /protected/accounting/v1/accounting-periods`). SSOT áp dụng = `agg-garage-graph-graphql.md §3e.6` + `gf-accounting-api.md §4.4` (Architecture Authority ratified, path `POST /api/v2/accounting-periods`, Op-ID `V4-AP-4`) — PKG bundle excerpt là snapshot cũ hơn, KHÔNG dùng làm nguồn path.

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| (không cần DataLoader) | — | — | — | Mutation single-record, enrichment ct-saas-tenant đã batch 1-call cho cả `createdByName`+`updatedByName` — không có N+1 risk. |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `createAccountingPeriod` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, không cache. |

### 6.5 Persisted query allowlist (nếu enable)

Không bắt buộc trong W04 DESIGN batch. Thêm khi production security audit yêu cầu (mirror pattern các module khác trong file).

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/accounting-period.graphql` | ADDITIVE (module mới — shared với 4 FEAT-AP-* khác cùng wave, first-write-wins hoặc merge) | extend SDL với slice `AccountingPeriodCreateInput`/`AccountingPeriodCreateResult` | ~70 | AC-2..AC-10 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/accounting-period/createAccountingPeriod.ts` | NEW | passthrough + 1 enrichment resolver pattern (mirror catalog-v2 discipline) | ~70 | AC-3..AC-10, AC-12 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfAccountingDataSource.ts` | ADDITIVE | new method `createAccountingPeriod(input)` | ~25 | AC-10 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/CtSaasTenantDataSource.ts` (reuse nếu đã tồn tại — Pattern TENANT-USERS canonical) | ADDITIVE (reuse method `searchTenantUsersBasic`) | reuse helper `enrichObjectWithByNames` | ~0 (reuse) | AC-10 |
| `auth/` | `bffs/agg-garage-graph/src/auth/accountingPeriodGuard.ts` (nếu cần custom guard cho `Inventory:InventoryV2` flag check) | NEW (defensive, có thể reuse generic flag-guard hiện hữu) | guard pattern | ~15 | AC-12 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/createAccountingPeriod.test.ts` | NEW | apollo test client + mock downstream (gf-accounting + ct-saas-tenant) | ~90 | AC-8, AC-9, AC-10, AC-12 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/accounting-period-contract.test.ts` | NEW (hoặc reuse nếu FEAT-AP-LIST đã tạo trước cùng wave) | schema contract snapshot | ~40 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (`gf-accounting` V4-AP-4 endpoint stable + `Inventory:InventoryV2` flag seed). BFF S5 exit hand-off S6 cho FE-web (`garage-web` — mobile out of scope).

```
(← BE tier S4: gf-accounting POST /api/v2/accounting-periods stable, integration green)

S5a  BFF SDL + types (accounting-period module)
     Entry: BE FEAT §6 (V4-AP-4) stable
     Exit: schema lint green, type generation pass

S5b  Data Source method + enrichment reuse
     Entry: S5a green
     Exit: GfAccountingDataSource.createAccountingPeriod unit test pass (mock HTTP); ct-saas-tenant enrichment reuse verified

S5c  Resolver createAccountingPeriod (passthrough + enrichment)
     Entry: S5b green
     Exit: integration test mock downstream → happy path + error mapping verified

S5d  Auth guard (Inventory:InventoryV2 flag + JWT)
     Entry: S5c green
     Exit: flag-OFF 403 test pass, missing-JWT 401 test pass

S5e  BFF contract test
     Entry: S5d green
     Exit: SDL snapshot stable
     └─► (hand-off FE-web S6 — mobile N/A)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5a | SDL + type definitions | schema | BE §6 (V4-AP-4) stable | schema lint + typecheck | BE S4 |
| S5b | Data Source method + enrichment reuse | data-sources | S5a | unit test mock HTTP pass | S5a |
| S5c | Resolver `createAccountingPeriod` | resolvers | S5b | integration test happy-path + error mapping | S5b |
| S5d | Auth guard (`Inventory:InventoryV2` + JWT) | auth + resolvers | S5c | flag/JWT guard test pass | S5c |
| S5e | BFF contract test | tests/contract | S5d | SDL snapshot stable | S5d |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary enforcement = BE tier (`gf-accounting`). BFF chỉ enforce: auth context, schema-level required fields, error pass-through.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-002` | NORMAL | schema-level required `name: String!` | `schema/accounting-period.graphql` | AC-3 | Backend authoritative validate blank/length |
| `BR-AP-004` | CORNERSTONE | `parentId` nullable schema; backend authoritative validate parent-type | `resolvers/accounting-period/createAccountingPeriod.ts` | AC-4, AC-5 | BFF passthrough only, không local check |
| `BR-AP-006` | NORMAL | error pass-through `ERR-INV-021` | `resolvers/accounting-period/createAccountingPeriod.ts` | AC-6, AC-9 | endDate ≥ startDate — backend enforced |
| `BR-AP-008` | CORNERSTONE | error pass-through `ERR-INV-023` | `resolvers/accounting-period/createAccountingPeriod.ts` | AC-9, AC-10 | Sibling overlap — backend enforced |
| `BR-AP-009` | NORMAL | forward `autoGenerateChildren` không giới hạn tại BFF; backend reject `type=MONTH` | `resolvers/accounting-period/createAccountingPeriod.ts` | AC-8 | UI (FE) đã disable option cho MONTH; BFF defensive không tự thêm rule riêng |
| `BR-AP-015` | CORNERSTONE | `X-Tenant-Id` propagate xuống backend | `resolvers/accounting-period/createAccountingPeriod.ts` | AC-12 | Tenant isolation |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-AP-CREATE.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-8 | BFF integration (mutation, autoGenerateChildren) | test-api | Mock backend response `generated.skipped>0` → verify `skippedDetails[]` shape pass-through nguyên văn |
| AC-9 | BFF integration (error mapping) | test-api | Inject backend 400 `ERR-INV-021/022/023` → verify GraphQL error union giữ nguyên code |
| AC-10 | BFF integration (happy path + enrichment) | test-api | Mock gf-accounting 201 + ct-saas-tenant match → verify `createdByName`/`updatedByName` populated; mock ct-saas-tenant miss → verify `null` non-fatal |
| AC-12 | BFF auth (RBAC + flag guard) | test-isolation | Missing JWT → 401; `Inventory:InventoryV2` OFF → 403; dual persona (accountant/garage-owner) → OK theo NC-BFF-AP-001 baseline |
| — | SDL contract snapshot | test-api | Schema lint + type snapshot — regression guard |

---

## 11. Cross-tier coordination (BFF perspective)

> Tham chiếu cross-tier chỉ read-only. BFF KHÔNG spec impl tier khác.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-CREATE.md` | PENDING (spawn cùng wave, chưa xác nhận DRAFT/ACTIVE tại thời điểm authoring BFF) | Downstream REST `POST /api/v2/accounting-periods` (V4-AP-4) — BFF resolver wrap passthrough |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-CREATE.md` | PENDING | Consume mutation `createAccountingPeriod` §6.1; dropdown "Thuộc kỳ" (AC-5) cần data từ `FEAT-AP-LIST` (BFF) query `searchAccountingPeriodTree` |
| Mobile | — (N/A) | N/A | AP module Web GMS only (`agg-garage-graph-graphql.md §3e.4` — "AP ops KHÔNG cho mobile trong batch hiện tại") |

**Source ID consistency** (item #18): `source_feat_sha = fe7dbc1d75c2a9aa454aa1a5a80a147bece4558e97c2bab605d5cfc8139b936c` phải identical với BE/FE-web files khi được authored.

**Sibling FEAT trong cùng module SDL**: `FEAT-AP-LIST`, `FEAT-AP-DETAIL`, `FEAT-AP-EDIT`, `FEAT-AP-DELETE` (cùng `agg-garage-graph` module `accounting-period`) — SDL enum/type dùng chung, KHÔNG re-declare trùng khi implement (xem §5 note).

---

## 12. References

- **Source**: [`Product/features/FEAT-AP-CREATE.md`](../../../../../Product/features/FEAT-AP-CREATE.md) v6
- **Paired BE**: [`features/be/FEAT-AP-CREATE.md`](../be/FEAT-AP-CREATE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3e Accounting Period (v7.58, §0 Wave Index row W03-side/W04)
- **Backend API**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.4
- **ADR-019**: [`Architecture/decisions/ADR-019.md`](../../../../../Architecture/decisions/ADR-019.md) — AP boundary ownership + schema + cross-boundary lock-check
- **ADR-009**: [`Architecture/decisions/ADR-009.md`](../../../../../Architecture/decisions/ADR-009.md) — no JPA relationship mapping (BE context)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Bundle used**: `/tmp/exec-spec-bundles/W04/FEAT-AP-CREATE.bff.md` (generated 2026-07-08T04:51:55+00:00)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-AP-CREATE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough+enrichment, §3 BFF behaviour map 12/12 AC-IDs, §4 auth+perf+security+error mapping, §5 SDL delta (7 types, shared module note), §6 ops contract 1 mutation `createAccountingPeriod` (Op-ID AP-M1 → backend V4-AP-4), §7 file map (7 entries ⊆ bffs/agg-garage-graph), §8 S5 DAG, §9 BR secondary (6 rows), §10 test hand-off, §11 cross-tier pairs (mobile N/A — Web GMS only). Resolved path discrepancy: dùng `agg-garage-graph-graphql.md §3e.6`/`gf-accounting-api.md §4.4` (`POST /api/v2/accounting-periods`) làm SSOT thay vì PKG bundle snapshot cũ (`V4-AP-2 .../protected/accounting/v1/...`) — xem `_decisions.md`. Flag `NC-BFF-AP-001`: chưa rõ persona-restrict granular cho AC-12, cần BA/PO xác nhận trước DEV. |
