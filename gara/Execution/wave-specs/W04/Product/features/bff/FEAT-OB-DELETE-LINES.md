---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-OB-DELETE-LINES.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-DELETE-LINES"
source_feat_sha: "976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408"
generated_at: "2026-07-08T04:51:55+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["deleteOpeningBalanceLine", "deleteOpeningBalanceLines"]
paired_backend_feats: ["FEAT-OB-DELETE-LINES"]
paired_fe_web_feats: ["FEAT-OB-DELETE-LINES"]
paired_mobile_feats: []
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "{{sha256-fanout-map}}"
  template_sha: "{{sha256-template}}"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-DELETE-LINES.bff.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-DELETE-LINES (BFF): Xóa dòng tồn đầu kỳ đã chọn

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-DELETE-LINES` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| GraphQL ops | `deleteOpeningBalanceLine`, `deleteOpeningBalanceLines` |
| Cross-tier pair | BE: `FEAT-OB-DELETE-LINES` \| Web: `FEAT-OB-DELETE-LINES` \| Mobile: N/A (web-only, xem §11) |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-DELETE-LINES` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) |
| Source version | v7 |
| Source SHA | `976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408` |
| Generated at | 2026-07-08T04:51:55+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xóa những dòng tồn đầu kỳ đã import sai — theo từng dòng (icon xóa) hoặc theo lô đã chọn (checkbox + nút "Xóa dòng đã chọn") — để làm sạch dữ liệu điểm khởi đầu tồn kho. Hệ thống bảo vệ tính toàn vẹn sổ tồn bằng cách chặn xóa khi dòng thuộc kỳ kế toán đã khóa hoặc khi việc xóa làm tồn (mã sản phẩm + kho) xuống âm — chặn cả lô nếu có bất kỳ dòng vi phạm, không xóa một phần. Sau khi xóa hợp lệ, sổ tồn được tính lại (cascade) từ ngày của dòng bị xóa trở đi.

---

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 mutation trong module `opening-balance` (cùng file schema với `FEAT-OB-LIST`/`FEAT-OB-IMPORT`/`FEAT-OB-EDIT`): `deleteOpeningBalanceLine(id: Int!)` (xóa đơn dòng, icon 🗑️ per row) và `deleteOpeningBalanceLines(input: DeleteOpeningBalanceLinesInput!)` (xóa theo lô, checkbox + nút "Xóa dòng đã chọn").
- Resolver pattern: **pure passthrough, không enrichment** — forward nguyên `id` / `input.ids` xuống gf-inventory; KHÔNG tự thực hiện guardrail (kỳ đã khóa, cascade tồn âm) tại BFF — 2 kiểm tra này là authoritative ở BE (ADR-021 fail-CLOSED commit-path).
- Downstream: `DELETE /api/v2/opening-balances/{id}` (W04-6) cho đơn dòng; `POST /api/v2/opening-balances/delete-lines` (W04-7) cho theo lô.
- Auth header propagate xuống downstream: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- KHÔNG cần DataLoader/batching — mỗi request chỉ 1 downstream call, không có fan-out theo `content[]`.
- KHÔNG cache mutation response (dữ liệu OB thay đổi ngay sau xóa).
- Error mapping thuần forward mã lỗi BE trả về (`ERR-INV-024`, `ERR-INV-036`, `ERR-CMN-not-found`) kèm `offendingIds` cho `deleteOpeningBalanceLines` — BFF không tự suy luận hay reorder mã lỗi.
- Mobile scope: **KHÔNG expose** 2 mutation này trong mobile schema bundle — write actions (import/edit/delete) của module Opening Balance là web-only theo PKG §2.2 (mobile chỉ view-only `searchOpeningBalances`).

---

## 3. Hành vi cần triển khai (BFF behaviour map)

> Coverage gate: 6 source AC-IDs (FEAT-OB-DELETE-LINES v7 §2). Mỗi AC xuất hiện ở §3 hoặc §4.

### Cluster A — Xác nhận và thực hiện xóa

#### AC-1 → N/A (FE local — mở popup xác nhận)

- Nút "Xóa dòng đã chọn" mở popup "Xác nhận" là state cục bộ FE-web, chưa gọi API tại thời điểm này. BFF không có touchpoint — mutation chỉ được gọi khi user bấm "Xóa" bên trong popup (xem AC-2).

#### AC-2 → BFF passthrough thực hiện xóa (đơn dòng + theo lô)

- **Khi**: FE-web gọi `deleteOpeningBalanceLine(id)` (icon 🗑️ per row) hoặc `deleteOpeningBalanceLines(input: { ids })` (nút "Xóa dòng đã chọn" sau khi user bấm "Xóa" trong popup xác nhận)
- **BFF phải**: forward nguyên `id`/`ids[]` xuống gf-inventory, trả nguyên kết quả xóa + audit cascade (`cascadedRecomputedRows` / `cascadedKeys[]`) — không transform shape
- **Downstream**: gf-inventory `DELETE /api/v2/opening-balances/{id}` (W04-6) hoặc `POST /api/v2/opening-balances/delete-lines` (W04-7)
- **Output shape**: `DeleteOpeningBalanceLineResult { deletedId, cascadedRecomputedRows }` hoặc `DeleteOpeningBalanceLinesResult { requestedCount, deletedCount, cascadedKeys[] }`
- **Failure mode**: xem AC-4 (guardrail) — nếu tất cả dòng hợp lệ thì response `success: true`, `deletedCount == requestedCount` (all-or-nothing, BR-OB-DEL-004)
- **Ref**: op `deleteOpeningBalanceLine` / `deleteOpeningBalanceLines` (§6.1), resolver (§6.2), paired BE FEAT-OB-DELETE-LINES §6 (W04-6/W04-7)

#### AC-3 → N/A (FE local — hủy xóa)

- Nút "Hủy" trong popup đóng popup, không gọi API. BFF không có touchpoint.

---

### Cluster B — Chặn xóa (guardrail)

#### AC-4 → BFF forward guardrail error fail-fast (all-or-nothing)

- **Khi**: gf-inventory trả lỗi guardrail cho `deleteOpeningBalanceLines` — có ≥ 1 dòng trong `ids[]` thuộc kỳ kế toán đã đóng HOẶC việc xóa làm tồn (mã + kho) âm
- **BFF phải**: forward nguyên `errorCode` + `offendingIds: [<id đầu tiên vi phạm>]` từ BE — KHÔNG tự retry theo từng id còn lại, KHÔNG tự suy luận thứ tự ưu tiên (BE đã fail-fast theo thứ tự `ids[]` trong request, dừng tại id đầu tiên vi phạm — per BR-OB-DEL-004 chặn cả lô, không xóa dòng nào)
- **Downstream**: gf-inventory W04-7 response 400 `{errorCode: ERR-INV-024 | ERR-INV-036, offendingIds}` — với `deleteOpeningBalanceLine` (đơn dòng, icon 🗑️) áp dụng cùng 2 mã lỗi (không có `offendingIds`, chỉ 1 `id`)
- **Output shape**: GraphQL `ErrorResponse { code, message, statusCode, details }` — `extensions.code` = mã lỗi BE
- **Failure mode**: `ERR-INV-024` (BR-OB-DEL-002, kỳ đã đóng) hoặc `ERR-INV-036` (BR-OB-DEL-003, tồn âm) — theo BR-OB-DEL-005 khi 1 dòng vi phạm cả 2 điều kiện thì BE trả `ERR-INV-024` (kỳ đóng, kiểm tra trước) trước `ERR-INV-036` (tồn âm, kiểm tra sau); BFF chỉ forward mã BE trả, không tự áp rule ưu tiên
- **Ref**: `gf-inventory-api.md §3b.2 W04-6/W04-7` error table, `BR-OB-DEL-002/003/004/005`, FEAT-OB-DELETE-LINES AC-4

#### AC-5 → BFF passthrough (không có logic BFF riêng — cùng cơ chế AC-2/AC-4)

- Làm rõ ngữ nghĩa guardrail tồn ≥ 0: khi dòng OB đã dùng cho phiếu xuất **nhưng** đã có phiếu nhập bù đủ (tồn sau xóa vẫn ≥ 0) → BE **cho phép xóa** (không chặn chỉ vì "có phiếu xuất"). Đây là logic guardrail thuần BE (`StockLedgerRecomputeService` invariant check, ADR-020) — BFF không có xử lý riêng, chỉ forward `success: true` giống path AC-2 khi guardrail pass.

---

### Cluster C — Phân quyền

#### AC-6 → BFF enforce tenant scope, không phân nhánh theo persona

- **Khi**: resolver xử lý bất kỳ request `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines` nào (chủ garage hoặc kế toán)
- **BFF phải**: extract tenant context từ JWT (`X-Tenant-Id` header) — propagate xuống gf-inventory, KHÔNG có field `tenantId` client-controlled trong argument/input; KHÔNG phân biệt quyền xóa giữa `accountant`/`garage-owner` (2 role bình đẳng theo BR-OB-CMN-002) — schema không có field/branch logic theo role
- **Downstream**: gf-inventory W04-6/W04-7 — BE trả `403 tenant-mismatch` nếu `X-Tenant-Id` header không khớp token tenant
- **Failure mode**: thiếu/sai tenant context → `UNAUTHENTICATED_ERROR`/`FORBIDDEN_ERROR` trước hoặc từ downstream
- **Ref**: `gf-inventory-api.md §3b.2` Response 4xx (403 tenant-mismatch), `BR-OB-CMN-002`

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi call downstream propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id`.
- Tenant ID lấy từ JWT context, KHÔNG từ GraphQL argument.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Mỗi resolver = **1 downstream call duy nhất** (DELETE hoặc POST delete-lines) — không có enrichment, không có batch call, không fan-out.
- p95 target: theo `gf-inventory-api.md §3b.2` W04-6 ≤ 2s, W04-7 ≤ 5s cho batch 500.

### 4.3 Security + data exposure

- KHÔNG log JWT, tenant ID, dữ liệu tồn kho (số lượng/giá trị) trong resolver debug output.
- Tenant scope enforced ở header layer — client không control được tenant qua args.
- `offendingIds` trong error response chỉ chứa ID nội bộ (integer), không leak dữ liệu nhạy cảm khác.

### 4.4 Contract stability

- `DeleteOpeningBalanceLineResult`, `DeleteOpeningBalanceLinesInput`, `DeleteOpeningBalanceLinesResult` là type mới bổ sung vào module `opening-balance` (cùng file schema với OB-LIST/OB-IMPORT/OB-EDIT) — additive, không breaking.
- Breaking change → CR MAJOR.

### 4.5 Feature flag gate (Inventory:InventoryV2)

- Module `opening-balance` (bao gồm 2 mutation này) chỉ hoạt động khi tenant enable flag `Inventory:InventoryV2` — enforce **cả 2 layer**: (a) BE `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController`, (b) **BFF resolver-level** `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403 trước khi forward request xuống BE (align PKG-W04 §2.2.3 CR-20260707-02 + FEAT-OB-EDIT/FEAT-OB-LIST/FEAT-OB-IMPORT/FEAT-AP-EDIT). Khi flag tắt, BFF trả `FORBIDDEN_ERROR` HTTP 403 ngay tại resolver, không round-trip xuống BE — tiết kiệm 1 hop + tránh log noise 403 từ BE. BE guard vẫn giữ làm defense-in-depth cho các entry-point khác (S2S/testing bypass BFF).

### 4.6 Error code mapping

| Downstream error (BE, gf-inventory W04-6/W04-7) | GraphQL error | Source AC |
|---|---|---|
| `400` `ERR-INV-024` — dòng thuộc kỳ kế toán đã đóng | `ERR-INV-024` (extensions.code) | AC-4 |
| `400` `ERR-INV-036` — xóa làm cascade tồn âm | `ERR-INV-036` (extensions.code) | AC-4, AC-5 |
| `404` `ERR-CMN-not-found` — `id` không tồn tại (đã xóa lần trước, hoặc bất kỳ id trong lô không tồn tại) | `ERR-CMN-not-found` | AC-2 |
| `401` missing/invalid JWT | `UNAUTHENTICATED_ERROR` | AC-6 |
| `403` `X-Tenant-Id` mismatch hoặc flag `Inventory:InventoryV2` disabled | `FORBIDDEN_ERROR` | AC-6 |
| `503` gf-accounting lock-check down (fail-CLOSED, ADR-021) | `HTTP_ERROR` 503 `ERR-CMN-007` | AC-4 |
| `500` unexpected DB error / cascade rollback | `INTERNAL_ERROR` | AC-2 |
| Downstream timeout/backpressure | `TIMEOUT_ERROR` / `HTTP_ERROR` / `API_ERROR` | AC-2 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Bổ sung vào module `opening-balance` (cùng file `schema/opening-balance.graphql` với `FEAT-OB-LIST`/`FEAT-OB-IMPORT`/`FEAT-OB-EDIT`). `StockLedgerCascadeAudit` là type dùng chung (đã khai báo bởi paired FEAT-OB-IMPORT — reuse, không khai báo lại).

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `DeleteOpeningBalanceLineResult` | type | `deletedId: Int!`, `cascadedRecomputedRows: Int!` | NO (new) | AC-2 |
| `DeleteOpeningBalanceLinesInput` | input | `ids: [Int!]!` | NO (new) | AC-2, AC-4 |
| `DeleteOpeningBalanceLinesResult` | type | `requestedCount: Int!`, `deletedCount: Int!`, `cascadedKeys: [StockLedgerCascadeAudit!]!` (reuse type) | NO (new) | AC-2, AC-4 |

> **NEED CONFIRMATION → RESOLVED 2026-07-08 v2**: pattern chốt tại `features/bff/FEAT-OB-LIST.md §5.1` — `DeleteOpeningBalanceLineResultApiResponse` / `DeleteOpeningBalanceLinesResultApiResponse` là concrete type `implements ApiResponse` interface (shared với `ErrorResponse`); inline fragment §3g.6 là read-time discrimination qua `__typename`, KHÔNG cần named union SDL. Dev đọc `bffs/agg-garage-graph/src/schema/` khi impl S5a confirm `ApiResponse` interface đã reuse từ module catalog-v2 W03.

### 5.2 Modified types (additive)

| Type | Field added | Type | Nullable | AC ref |
|---|---|---|---|---|
| `Mutation` | `deleteOpeningBalanceLine` | `(id: Int!): DeleteOpeningBalanceLineResultApiResponse!` | NO (Non-null return) | AC-2, AC-4 |
| `Mutation` | `deleteOpeningBalanceLines` | `(input: DeleteOpeningBalanceLinesInput!): DeleteOpeningBalanceLinesResultApiResponse!` | NO (Non-null return) | AC-2, AC-4 |

### 5.3 SDL inline (canonical excerpt — nguyên văn `agg-garage-graph-graphql.md §3g.1`)

```graphql
type DeleteOpeningBalanceLineResult {
  deletedId: Int!
  cascadedRecomputedRows: Int!
}

input DeleteOpeningBalanceLinesInput {
  ids: [Int!]!
}

type DeleteOpeningBalanceLinesResult {
  requestedCount: Int!
  deletedCount: Int!
  cascadedKeys: [StockLedgerCascadeAudit!]!   # reuse type, đã khai báo bởi FEAT-OB-IMPORT
}

extend type Mutation {
  deleteOpeningBalanceLine(id: Int!): DeleteOpeningBalanceLineResultApiResponse!
  deleteOpeningBalanceLines(input: DeleteOpeningBalanceLinesInput!): DeleteOpeningBalanceLinesResultApiResponse!
}
```

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `deleteOpeningBalanceLine` | mutation | `id: Int!` | `DeleteOpeningBalanceLineResultApiResponse!` | JWT + X-Tenant-Id | AC-2, AC-4, AC-6 |
| `deleteOpeningBalanceLines` | mutation | `input: DeleteOpeningBalanceLinesInput!` | `DeleteOpeningBalanceLinesResultApiResponse!` | JWT + X-Tenant-Id | AC-1..6 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | Pattern | AC ref |
|---|---|---|---|---|---|
| `deleteOpeningBalanceLine` | `src/resolvers/opening-balance/deleteOpeningBalanceLine.ts` | `FEAT-OB-DELETE-LINES` (BE §6, W04-6) | `DELETE /api/v2/opening-balances/{id}` | tenant-scoped pure passthrough | AC-2, AC-4 |
| `deleteOpeningBalanceLines` | `src/resolvers/opening-balance/deleteOpeningBalanceLines.ts` | `FEAT-OB-DELETE-LINES` (BE §6, W04-7) | `POST /api/v2/opening-balances/delete-lines` | tenant-scoped pure passthrough | AC-2, AC-4 |

### 6.3 DataLoader / batching strategy

> KHÔNG cần DataLoader/batching — mỗi resolver chỉ 1 downstream call, không có nested type resolution hay per-item fan-out.

| Batch name | Key shape | Batch endpoint | Cache | AC ref |
|---|---|---|---|---|
| (none) | — | — | — | — |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `deleteOpeningBalanceLine` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, no cache |
| `deleteOpeningBalanceLines` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, no cache |

### 6.5 Persisted query allowlist

Kích hoạt theo policy chung của `agg-garage-graph`. `DeleteOpeningBalanceLineMutation` + `DeleteOpeningBalanceLinesMutation` cần đăng ký hash vào allowlist khi deploy production — thực hiện tại bước S5 exit.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/opening-balance.graphql` | ADDITIVE | extend `Mutation` + 3 type mới (song song OB-LIST/OB-IMPORT/OB-EDIT trong cùng file) | ~25 | AC-2, AC-4 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/opening-balance/deleteOpeningBalanceLine.ts` | NEW | pure passthrough resolver | ~35 | AC-2, AC-4 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/opening-balance/deleteOpeningBalanceLines.ts` | NEW | pure passthrough resolver | ~40 | AC-2, AC-4 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | existing DS — add `deleteOpeningBalanceLine`/`deleteOpeningBalanceLines` methods | ~25 | AC-2 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/opening-balance/deleteOpeningBalanceLine.test.ts` | NEW | apollo test client pattern | ~60 | AC-2, AC-4, AC-6 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/opening-balance/deleteOpeningBalanceLines.test.ts` | NEW | apollo test client pattern | ~80 | AC-1..6 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/opening-balance-contract.test.ts` | ADDITIVE | extend schema snapshot contract (đã có từ FEAT-OB-LIST) | ~20 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (gf-inventory W04-6/W04-7 contract stable).

```
(← BE tier S4: gf-inventory W04-6/W04-7 green)

S5  BFF opening-balance delete mutations + passthrough resolver
    Entry: BE FEAT-OB-DELETE-LINES §6 W04-6/W04-7 endpoint stable
    Exit:  BFF contract test green (envelope shape match + fail-fast error forwarding verified)
    └─► (hand-off FE-web S6; Mobile N/A — web-only)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Viết SDL types + extend Mutation | `schema/opening-balance.graphql` | — | schema compiles | — |
| S5.2 | Implement 2 resolver + DS method | `resolvers/` + `data-sources/` | S5.1 done | resolver forward W04-6/W04-7 + trả envelope đúng | S5.1 |
| S5.3 | Integration + contract tests | `tests/` | S5.2 done | all tests green (success path + guardrail error path + all-or-nothing) | S5.2 |

---

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement ở BE tier (xem `features/be/FEAT-OB-DELETE-LINES.md §9` khi tồn tại). BFF chỉ enforce auth + perf + contract; guardrail nghiệp vụ (kỳ khóa, tồn âm) là BE authoritative — BFF chỉ forward.

| BR ID | Severity | Enforcement tại BFF | File | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-DEL-002` | CORNERSTONE | Forward `ERR-INV-024` nguyên trạng, không tự retry | resolver | AC-4 | BE primary enforce lock-check |
| `BR-OB-DEL-003` | CORNERSTONE | Forward `ERR-INV-036` nguyên trạng | resolver | AC-4, AC-5 | BE primary enforce cascade invariant |
| `BR-OB-DEL-004` | CORNERSTONE | Forward `offendingIds` + không xóa partial (all-or-nothing) — BFF không tự chia nhỏ request | resolver | AC-2, AC-4 | Single downstream call, không loop retry per-id |
| `BR-OB-DEL-005` | NORMAL | Forward mã lỗi đúng thứ tự BE trả (024 trước 036) — BFF không tự reorder | resolver | AC-4 | Order logic là BE responsibility |
| `BR-OB-CMN-002` | CORNERSTONE (persona equality) | Schema không phân nhánh quyền xóa theo role | schema — không có role-branch logic | AC-6 | `accountant`/`garage-owner` cùng response shape |

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration | test-api | mock W04-6/W04-7 success → verify envelope `DeleteOpeningBalanceLineResult`/`DeleteOpeningBalanceLinesResult` mapped đúng |
| AC-4 | BFF integration | test-api | mock W04-7 trả `ERR-INV-024`/`ERR-INV-036` + `offendingIds` → verify GraphQL error forward nguyên `extensions.code` + `offendingIds`, KHÔNG mất data; mock W04-6 trả cùng 2 mã lỗi cho đơn dòng |
| AC-5 | BFF integration | test-api | mock W04-7 success khi guardrail pass (tồn sau xóa ≥ 0 dù có phiếu xuất trước đó) → verify passthrough success, không có logic BFF riêng |
| AC-6 | BFF auth | test-isolation | request thiếu `X-Tenant-Id` → `UNAUTHENTICATED_ERROR`; tenant mismatch → `FORBIDDEN_ERROR`; flag `Inventory:InventoryV2` off (mock BE 403) → `FORBIDDEN_ERROR`; verify 2 persona (`accountant`/`garage-owner`) nhận cùng response shape |
| all-or-nothing | BFF integration | test-api | mock W04-7 `requestedCount != deletedCount` case KHÔNG xảy ra (guard: nếu lỗi → deletedCount phải = 0, không có partial) |

---

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-DELETE-LINES.md` | N/A (chưa generate) | W04-6/W04-7 primary endpoint — BFF resolver pure passthrough, không enrichment |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-DELETE-LINES.md` | N/A (chưa generate) | Consume 2 mutation từ §6.1; popup xác nhận/hủy (AC-1/AC-3) + popup "Không thể xóa" (AC-4) là FE local state |
| Mobile | (không applicable) | N/A — web-only | Per PKG-W04 §2.2 "mobile scope narrowed" — write actions (import/edit/delete) của module Opening Balance chỉ chạy trên web; mobile chỉ view-only `searchOpeningBalances` (FEAT-OB-LIST). KHÔNG build mobile cho FEAT-OB-DELETE-LINES. |

**Source ID consistency** (item #18): `source_feat_sha` = `976b219417f3e222e5a8f200c8cb5de944bcce2e71a21ea5ccc2ead27de33408` — PHẢI identical với BE/FE-web tier files khi được generate.

---

## 12. References

- **Source**: [`Product/features/FEAT-OB-DELETE-LINES.md`](../../../../../Product/features/FEAT-OB-DELETE-LINES.md) v7
- **Paired BE**: [`features/be/FEAT-OB-DELETE-LINES.md`](../be/FEAT-OB-DELETE-LINES.md)
- **Paired FE-web**: [`features/fe-web/FEAT-OB-DELETE-LINES.md`](../fe-web/FEAT-OB-DELETE-LINES.md)
- **Sibling BFF spec (cùng module)**: [`features/bff/FEAT-OB-LIST.md`](FEAT-OB-LIST.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3g Opening Balance — mutations `deleteOpeningBalanceLine` (W04-M4) / `deleteOpeningBalanceLines` (W04-M5) (v7.58)
- **REST backend contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3b.2 W04-6 / W04-7 (v44)
- **PKG**: [`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **ADR-020**: Stock ledger daily snapshot — cascade recompute forward sau xóa
- **ADR-021**: OB period lock cross-boundary — fail-CLOSED commit-path (`ERR-CMN-007` khi gf-accounting down)
- **ADR-009**: No JPA relationship mapping — scalar FK pattern (BFF context: không expose join chain trong resolver)

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-OB-DELETE-LINES` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (pure passthrough, không enrichment, 2 mutation đơn dòng + theo lô), §3 BFF behaviour map 6 AC-ID (3 touch AC-2/AC-4/AC-5/AC-6 + 2 N/A FE-local AC-1/AC-3), §4 auth + perf + feature-flag Inventory:InventoryV2 gate + error mapping (fail-fast `ERR-INV-024` trước `ERR-INV-036` per BR-OB-DEL-005 — BE responsibility, BFF chỉ forward), §5 SDL delta (3 new type + reuse `StockLedgerCascadeAudit`, NEED CONFIRMATION về union return type chưa khai báo tường minh trong source doc — cùng pattern đã ghi nhận ở FEAT-OB-LIST), §6 ops/resolver/no-batching/no-cache, §7 file map `bffs/agg-garage-graph/**`, §8 S5 DAG (3 sub-step), §9 BR secondary (BR-OB-DEL-002/003/004/005, BR-OB-CMN-002), §10 test scope, §11 cross-tier (BE/FE-web chưa generate, Mobile N/A web-only per PKG §2.2). Nguồn: `Architecture/api/agg-garage-graph-graphql.md` v7.57 §3g.6 (deleteOpeningBalanceLine/deleteOpeningBalanceLines detail blocks) + `Architecture/api/gf-inventory-api.md` v44 §3b.2 W04-6/W04-7 (đọc bounded theo §0 Wave Index W04). |
| 2026-07-08 | 3 | Delivery Authority | **W04 BFF↔Arch alignment audit remediation Bước 3** (per plan `t-i-li-u-trong-home-engineer-ac-projects-graceful-stallman.md`). §4.5 shift từ "BFF KHÔNG kiểm tra flag" → **BFF resolver-level `@FeatureOn(Inventory:InventoryV2)` fail-fast HTTP 403** (align FEAT-OB-EDIT + FEAT-OB-IMPORT + FEAT-OB-LIST + FEAT-AP-EDIT + PKG-W04 §2.2.3 CR-20260707-02). BE guard giữ nguyên làm defense-in-depth cho S2S entry-point. §12 References version cite bump `agg-garage-graph-graphql.md v7.57 → v7.58` (cosmetic §0 Wave Index cascade). Gap version 2 (skipped — no v2 Change Log entry present, dùng v3 để match frontmatter). |
