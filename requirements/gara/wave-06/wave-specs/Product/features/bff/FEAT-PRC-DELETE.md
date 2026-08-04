---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DELETE.md"
source_version: 7
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DELETE"
source_feat_sha: "8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f"
generated_at: "2026-07-31T06:31:29+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting"]
modifies: []
change_type: "new-capability"
graphql_ops: ["priceCalcRunDelete"]
paired_backend_feats: ["FEAT-PRC-DELETE"]
paired_fe_web_feats: ["FEAT-PRC-DELETE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "n/a"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-DELETE (BFF): Xóa log tính giá

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DELETE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `priceCalcRunDelete` (mutation) |
| Cross-tier pair | BE: `FEAT-PRC-DELETE` \| Web: N/A per fan-out map (xem §11 note) \| Mobile: N/A (PRC web-only per PKG-W06 scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) |
| Source version | v7 |
| Source SHA | `8adf8f5bfdef34f5a068b719a9264332c85d9f089d1204bf5d726aa2f47a6a5f` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Sau khi chạy tính giá xuất kho BQGQ (CREATE/RECALC), garage cần dọn dẹp lịch sử tính giá khi có log dư thừa hoặc tính nhầm, để danh sách log gọn gàng và dễ tra cứu. Thao tác xóa chỉ xóa bản ghi lịch sử (soft-delete) — hệ thống tuyệt đối không tự động đảo giá vốn đã điền vào phiếu xuất, tránh gây sai lệch dữ liệu kế toán ngoài ý muốn. Để bảo vệ tính toàn vẹn số liệu đã chốt, hệ thống chặn xóa khi kỳ kế toán liên quan đã đóng hoặc khi log đang trong trạng thái tính toán dở dang. Chủ garage và kế toán có quyền thao tác ngang nhau.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose mutation `priceCalcRunDelete` (module `price-calc-run`, W06 PRC) — passthrough thuần sang `gf-accounting DELETE /api/v2/price-calc-runs/{id}` (W06-5), không orchestrate, không aggregate, không cache kết quả.
- Forward `id` verbatim làm path param xuống downstream; KHÔNG tự validate trạng thái kỳ hoặc trạng thái run (guard là trách nhiệm BE, xem §4.5).
- Map response BE 200 `{runId, deleted, message}` sang GraphQL type `PriceCalcRunDeleteResult` trong union `PriceCalcRunDeleteApiResponse`.
- Map lỗi downstream 409 (`ERR-INV-024` kỳ đóng, `ERR-INV-029` run đang PENDING/RUNNING) sang `ErrorResponse` union để FE hiển thị đúng thông báo chặn.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`; feature flag `Inventory:InventoryV2` gate ở BE — BFF forward request bình thường, BE trả 403 khi flag off.
- KHÔNG cache mutation (`@cacheControl(maxAge: 0, scope: PRIVATE)`) — FE tự refetch `priceCalcRunList` sau khi xóa thành công.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Xóa log tính giá qua GraphQL (AC-2, AC-4, AC-4b, AC-5)

#### AC-2 → Expose mutation `priceCalcRunDelete` — soft-delete, không rollback

- **Khi**: FE user xác nhận xóa trong popup (sau AC-1) → gọi mutation `priceCalcRunDelete(id)`.
- **BFF phải**: forward `id` xuống `DELETE /api/v2/price-calc-runs/{id}` (W06-5); trả nguyên vẹn response 200 `{runId, deleted: true, message}` từ BE — KHÔNG tự thêm/lược field, KHÔNG tự trigger rollback giá vốn ở tầng BFF (BE là source-of-truth cho no-rollback semantic).
- **Downstream**: `gf-accounting DELETE /api/v2/price-calc-runs/{id}` (W06-5).
- **Output shape**: `PriceCalcRunDeleteApiResponse` → `PriceCalcRunDeleteResult { runId, deleted, message }`.
- **Failure mode**: 404 khi `id` không tồn tại/không tenant-scope → `ERR-CMN-not-found`.
- **Ref**: mutation `priceCalcRunDelete` (§6.1), SDL `PriceCalcRunDeleteResult` (§5.1), paired BE FEAT-PRC-DELETE §5.5 (W06-5).

#### AC-4 → Mapping 409 `ERR-INV-024` (kỳ đã đóng) sang GraphQL error

- **Khi**: `priceCalcRunDelete` gọi với run thuộc kỳ kế toán đã CLOSED.
- **BFF phải**: map HTTP 409 `ERR-INV-024` verbatim từ downstream sang `ErrorResponse` union — KHÔNG tự retry, KHÔNG tự silence lỗi.
- **Downstream**: `gf-accounting DELETE /api/v2/price-calc-runs/{id}`, Response 4xx table (BR-PRC-011).
- **Output shape**: `ErrorResponse` union (BFF error convention).
- **Ref**: §4.5 Error code mapping.

#### AC-4b → Mapping 409 `ERR-INV-029` (run đang "Đang tính") sang GraphQL error

- **Khi**: `priceCalcRunDelete` gọi với run có `status ∈ {PENDING, RUNNING}`.
- **BFF phải**: map HTTP 409 `ERR-INV-029` verbatim sang `ErrorResponse` union.
- **Downstream**: `gf-accounting DELETE /api/v2/price-calc-runs/{id}`, Response 4xx table (BR-PRC-011).
- **Output shape**: `ErrorResponse` union.
- **Ref**: §4.5 Error code mapping.

#### AC-5 → Auth header propagation — dual persona, không field-level RBAC riêng

- **Khi**: mọi request tới `priceCalcRunDelete`.
- **BFF phải**: propagate `Authorization` (JWT) verbatim xuống `gf-accounting`; KHÔNG áp field-level RBAC riêng cho PRC — 2 persona `garage-owner`/`accountant` quyền ngang nhau. `deletedBy` (tài khoản thực hiện) do BE tự resolve từ security context, BFF không set hay override.
- **Downstream**: `gf-accounting DELETE /api/v2/price-calc-runs/{id}`.
- **Ref**: §4.1 Auth header propagation.

### Cluster B — UI-only (N/A đối với BFF)

#### AC-1 → N/A (xem fe-web/ tier file)

- Mở popup xác nhận là FE local UI state (dialog open khi user bấm icon xóa). BFF không touch cho tới khi user bấm xác nhận.

#### AC-3 → N/A (xem fe-web/ tier file)

- Nút "Hủy" (hoặc đóng ✕) đóng popup local, không gọi mutation nào xuống BFF.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Resolver `priceCalcRunDelete` propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.
- Feature flag `Inventory:InventoryV2` gate ở BE (`PriceCalcRunController` class-level) — BFF forward request bình thường; BE trả 403 khi flag off → BFF map lên `FORBIDDEN_ERROR`.

### 4.2 Performance + N+1

- Không cần DataLoader — mutation single-entity theo `id`, không có nested resolution field-level cần batch.
- Không cache — mỗi lần gọi là 1 lần xóa thật (mutation) hoặc replay idempotent (BE-side, không phải BFF cache).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT trong resolver log (chỉ log prefix/hash nếu cần trace).
- Tenant scope: filter qua `X-Tenant-Id` header (từ JWT context), KHÔNG qua arg client-controlled.
- Không có field-level RBAC riêng cho op này — cả 2 persona đều được phép gọi khi có JWT tenant hợp lệ.

### 4.4 Contract stability

- Schema additive only. Field rename ở `PriceCalcRunDeleteResult` → `@deprecated(reason: "...")` giữ field cũ.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `404` (run không tồn tại / không tenant-scope) | `NOT_FOUND_ERROR` | AC-2 |
| `409 ERR-INV-024` (kỳ đã đóng — BR-PRC-011) | `ACCOUNTING_PERIOD_LOCKED` (mirror mã BE verbatim, xem `gf-accounting-api.md §4.8`) | AC-4 |
| `409 ERR-INV-029` (run `status ∈ {PENDING, RUNNING}` — BR-PRC-011) | `PRICE_CALC_RUN_CONFLICT` | AC-4b |
| `403` (tenant mismatch / feature flag off) | `FORBIDDEN_ERROR` | AC-5 |
| `401` | `UNAUTHENTICATED_ERROR` | AC-5 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> SDL đã ratify tại `agg-garage-graph-graphql.md §3f.1` (v7.74+, ✅ resolved §0 Wave Index cho W06). FEAT-PRC-DELETE dùng chung module `price-calc-run` với FEAT-PRC-LIST/CREATE/DETAIL/RECALC (5 FEAT cùng SDL, mỗi FEAT-tier chỉ đảm nhiệm behaviour riêng — xem §3). Liệt kê dưới đây phần liên quan trực tiếp DELETE flow.

### 5.1 New types (đã tồn tại — reference, không tạo mới lần này)

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `PriceCalcRunDeleteResult` | type | `runId: Int!`, `deleted: Boolean!`, `message: String!` | NO (existing) | AC-2 |
| `PriceCalcRunDeleteApiResponse` | type (wrapper) | `data: PriceCalcRunDeleteResult` | NO (existing) | AC-2 |

### 5.2 Modified types

> Không có thay đổi additive cho FEAT-PRC-DELETE — SDL đã ratify đầy đủ ở round trước (v7.74 Round 2). Nếu dev phát hiện field thiếu, phải `/cr-raise` cascade Architecture Authority trước khi impl (KHÔNG tự thêm field SDL).

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 Operations dùng bởi FEAT-PRC-DELETE

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunDelete` | mutation | `id: Int!` | `PriceCalcRunDeleteApiResponse!` | JWT + X-Tenant-Id | AC-2, AC-4, AC-4b, AC-5 |

> Op ID cross-ref `agg-garage-graph-graphql.md §2 Endpoint Summary`: `priceCalcRunDelete`=#364 (Mutation, args `id: Int!`, return `PriceCalcRunDeleteApiResponse!`, **KHÔNG có `idempotencyKey`** — DELETE tự nhiên idempotent theo BE §5.5 Semantics). Cite verified verbatim §0 Wave Index W06 → §2 rows #360-365 2026-07-31 (`references_verbatim`). Note: bundle §G "Paired BE REST endpoints" block bị flag ⚠️ stale (keyword-match `Delete` pick nhầm section FEAT-AP-DELETE thay vì PRC) — REST endpoint W06-5 đã fallback-read + verify trực tiếp `gf-accounting-api.md v24 §5.5` (line 1557-1591).

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunDelete` | `src/resolvers/price-calc-run/priceCalcRunDelete.ts` | `FEAT-PRC-DELETE` (BE §5.5, W06-5) | `DELETE /api/v2/price-calc-runs/{id}` | none (1:1 passthrough) | AC-2, AC-4, AC-4b |

### 6.3 DataLoader / batching strategy

> Không cần DataLoader — mutation single-entity theo `id`, không có N+1 risk.

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| _(none)_ | — | — | — | — |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `priceCalcRunDelete` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache; FE tự refetch `priceCalcRunList` sau khi xóa thành công |

### 6.5 Persisted query allowlist

> Không sử dụng persisted query cho module này (ngoài phạm vi baseline hiện hữu của BFF).

| Query name | Hash | First-seen | AC ref |
|---|---|---|---|
| _(none)_ | — | — | — |

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Module `price-calc-run` đã tồn tại (dùng chung 5 FEAT-PRC-*); FEAT-PRC-DELETE chỉ impl 1 resolver mutation `priceCalcRunDelete` mới (nếu chưa có từ FEAT khác impl trước — coordinate qua §11).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/price-calc-run.graphql` | ALREADY RATIFIED (no change — SDL v7.74+ stable) | — | 0 | — |
| `resolvers/` | `src/resolvers/price-calc-run/priceCalcRunDelete.ts` | NEW (hoặc reuse nếu FEAT-PRC-LIST/DETAIL bff-tier impl trước) | resolver pattern (passthrough) | ~30 | AC-2, AC-4, AC-4b |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | ADDITIVE — 1 method mới `deletePriceCalcRun(id)` | new method | ~15 | AC-2 |
| `tests/integration` | `tests/integration/price-calc-run.test.ts` | ADDITIVE (append case, module test file dùng chung) | apollo test client | ~50 | AC-2, AC-4, AC-4b |
| `tests/contract` | `tests/contract/price-calc-run-contract.test.ts` | ADDITIVE (nếu chưa tồn tại từ FEAT khác cùng module) | schema contract | ~10 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: integration green — FEAT-PRC-DELETE §5.5 W06-5 stable)

S5  BFF schema + resolver wire
    Entry: BE FEAT §5.5 contract stable (W06-5)
    Exit: BFF contract test green (priceCalcRunDelete)
    └─► (hand-off FE Web S6 — Mobile out-of-scope PRC)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | resolvers + data-sources | BE FEAT §5.5 stable | BFF contract test green | BE FEAT-PRC-DELETE S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory: BR-PRC-011 tại `gf-accounting`). BFF chỉ enforce:

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-011` | CORNERSTONE | resolver passthrough error mapping (không tự chặn ở BFF — nguồn thật là BE guard trên `period.status` + `run.status`) | `src/resolvers/price-calc-run/priceCalcRunDelete.ts` | AC-4, AC-4b | BFF chỉ map 409 `ERR-INV-024`/`ERR-INV-029`, không validate lại period/run status |
| `BR-AP-CMN-002` | CORNERSTONE | auth guard (no field-level RBAC, chỉ JWT presence check) | generic JWT guard (dùng chung module `price-calc-run`) | AC-5 | dual persona equal rights — không có persona-specific branching |
| `BR-PRC-016` | NORMAL | N/A (BE soft-delete semantic — không rollback giá vốn) | — | AC-2 | BFF chỉ forward response `deleted: true` + `message` nguyên văn, không có logic riêng |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-PRC-DELETE.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF contract (schema union response) | test-api | snapshot SDL `PriceCalcRunDeleteApiResponse`/`PriceCalcRunDeleteResult` |
| AC-2 | BFF integration (resolver → BE DELETE) | test-api | mock `gf-accounting` DELETE 200, verify request path `id` + headers forward |
| AC-4 | BFF error mapping | test-api | mock downstream 409 `ERR-INV-024`, verify GraphQL error code đúng §4.5 |
| AC-4b | BFF error mapping | test-api | mock downstream 409 `ERR-INV-029`, verify GraphQL error code đúng §4.5 |
| AC-5 | BFF auth (RBAC) | test-isolation | dual persona (garage-owner + accountant) đều được phép, không role nào bị chặn |
| AC-1, AC-3 | N/A | — | FE-only, xem fe-web tier test scope |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DELETE.md` | DRAFT (pending — batch chạy song song) | Downstream REST endpoint W06-5 `DELETE /api/v2/price-calc-runs/{id}` — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DELETE.md` (`paired_fe_web_feats: ["FEAT-PRC-DELETE"]`) | ACTIVE candidate (DRAFT) | Mutation `priceCalcRunDelete` gọi từ icon "Xóa" + popup xác nhận, có tier file riêng — xem `features/fe-web/FEAT-PRC-DELETE.md`. |
| Mobile | N/A | N/A | PRC toàn bộ web-only per `PKG-W06-inventory-pricing-stock-report.md §1 Overview` — không có mobile tier cho FEAT-PRC-* |

**Note phối hợp resolver dùng chung**: mutation `priceCalcRunDelete` dùng chung module `price-calc-run` với 4 FEAT-PRC-* khác (LIST/CREATE/DETAIL/RECALC). Nếu agent BFF khác đã impl resolver trước, agent impl FEAT-PRC-DELETE reuse thay vì tạo trùng — coordinate qua PR review.

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-DELETE.md`](../../../../../Product/features/FEAT-PRC-DELETE.md) v7
- **Paired BE**: [`features/be/FEAT-PRC-DELETE.md`](../be/FEAT-PRC-DELETE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3f`](../../../../../Architecture/api/agg-garage-graph-graphql.md) (PRC module, §0 Wave Index W06, op #364)
- **Downstream REST**: [`Architecture/api/gf-accounting-api.md §5.5`](../../../../../Architecture/api/gf-accounting-api.md) (W06-5 DELETE) + `§6.2/§6.3 Naming Registry`
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-PRC-DELETE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough thuần module `price-calc-run`), §3 BFF behaviour map cover 6/6 AC-IDs (AC-1/AC-3 = N/A FE-only), §4 auth + perf + cache + error mapping (2 mã lỗi 409 canonical), §5-§11 BFF-specific (SDL reference/ops/resolver/DataLoader-none/cross-tier pair). Contract verified trực tiếp từ `gf-accounting-api.md v24 §5.5` (line 1557-1591) + `agg-garage-graph-graphql.md v7.81 §0 Wave Index + §2 row #364` (fallback-read do bundle §G "Paired BE REST endpoints" block flagged stale ⚠️ — keyword-match `Delete` đã pick nhầm section FEAT-AP-DELETE thay vì PRC). Source FEAT chỉ audit. |
