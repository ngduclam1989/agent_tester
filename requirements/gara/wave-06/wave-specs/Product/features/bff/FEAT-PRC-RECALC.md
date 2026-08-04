---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-RECALC.md"
source_version: 21
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-RECALC"
source_feat_sha: "ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f"
generated_at: "2026-07-31T06:31:29Z"
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
graphql_ops: ["priceCalcRunRecalc"]
paired_backend_feats: ["FEAT-PRC-RECALC"]
paired_fe_web_feats: ["FEAT-PRC-RECALC"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "N/A (BFF tier — GraphQL SDL sourced từ Architecture/api/agg-garage-graph-graphql.md, không phụ thuộc KG)"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A (không được orchestrator cung cấp lần chạy này)"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-RECALC (BFF): Tính lại giá vốn cho lần tính đã có

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-RECALC` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `priceCalcRunRecalc` (mới, owned) · `priceCalcRunGet` (reuse — shared FEAT-PRC-DETAIL, dùng cho polling) |
| Cross-tier pair | BE: FEAT-PRC-RECALC \| Web: N/A (UI nút "Tính lại" thuộc FEAT-PRC-DETAIL fe-web theo fan-out map) \| Mobile: N/A (PRC ngoài phạm vi mobile W06) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-RECALC` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) |
| Source version | v21 |
| Source SHA | `ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f` |
| Generated at | 2026-07-31T06:31:29Z |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần tính lại giá vốn cho một lần tính PRC đã có, khi dữ liệu đầu vào phát sinh thay đổi sau khi lần tính gốc đã hoàn tất (vd phiếu nhập/xuất bổ sung, sửa dữ liệu tồn). Tính năng cho phép chọn tính lại toàn bộ mã hoặc chỉ những mã đang lỗi, đảm bảo giá vốn phiếu xuất và giá trị sổ tồn được cập nhật đúng mà không mất dấu vết audit của lần tính gốc. Feature nằm ở cuối vòng đời một lần tính giá xuất kho BQGQ — tiếp nối FEAT-PRC-CREATE/FEAT-PRC-DETAIL, cung cấp đường sửa sai khi phát hiện dữ liệu đầu vào chưa chuẩn.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose mutation mới `priceCalcRunRecalc(id: Int!, input: PriceCalcRunRecalcInput!, idempotencyKey: String!): PriceCalcRunKickoffApiResponse!` — **passthrough thuần**, không orchestrate nhiều downstream call, không tự validate business rule.
- Forward `idempotencyKey` (client sinh `PRC-RECALC-{runId}-{clientNonce}`) xuống REST header `X-Idempotency-Key` khi gọi `gf-accounting`.
- Giữ nguyên semantic HTTP 202 (kick-off run mới) / HTTP 200 (idempotent replay trong window 5 phút) — không tự transform sang shape khác; trả `PriceCalcRunKickoff` verbatim gồm `runId`, `sourceRunId`, `runScope`, `status`, `pollingUrl`, `pollingIntervalHint`, `warningsSkippedItems`, `affectedSubsequentPeriods[]`, `idempotentReplay`.
- Cho polling tiến độ sau kick-off: reuse query đã ratify `priceCalcRunGet(id, includeItems, itemStatus, keyword)` (op #361 — thuộc FEAT-PRC-DETAIL, KHÔNG cần thêm resolver/route mới cho RECALC).
- Map lỗi downstream (400/401/403/404/409/503) sang GraphQL `extensions.code` verbatim — không transform message; FE tự render toast/label theo code.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id` xuống downstream — cả 2 persona (`garage-owner`, `accountant`) quyền ngang nhau, không phân biệt ở BFF layer.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Trigger tính lại (AC-1, AC-1b)

#### AC-1 → Kick-off recalc toàn bộ (`runScope: ALL`)

- **Khi**: FE gọi mutation `priceCalcRunRecalc(id, input: {runScope: ALL}, idempotencyKey)` từ nút "Tính lại" trên màn chi tiết lần tính đã ở trạng thái terminal (`SUCCEEDED` | `COMPLETED_WITH_ERRORS`).
- **BFF phải**: passthrough thuần — forward `runScope: ALL` + header `X-Idempotency-Key` xuống downstream nguyên trạng, không transform body.
- **Downstream**: `POST /api/v2/price-calc-runs/{id}/recalc` (gf-accounting, W06-4).
- **Output shape**: `PriceCalcRunKickoffApiResponse { data: PriceCalcRunKickoff }` — `runId` (row mới), `sourceRunId` (run gốc), `status: PENDING`, `pollingUrl`, `pollingIntervalHint: 5000`.
- **Failure mode**: xem §4.5.
- **Ref**: op `priceCalcRunRecalc` (`agg-garage-graph-graphql.md:433`, §6.1), input `PriceCalcRunRecalcInput` (§5), downstream BE §5.4 (`gf-accounting-api.md:1484`).

#### AC-1b → Kick-off recalc chỉ mã lỗi (`runScope: ERROR_ONLY`)

- **Khi**: FE gọi cùng mutation với `input: {runScope: ERROR_ONLY}` từ nút "Tính lại mã lỗi" (chỉ hiện khi source run có ít nhất 1 item `status = ERROR`).
- **BFF phải**: forward `runScope: ERROR_ONLY` nguyên trạng — **KHÔNG** tự kiểm tra "source run có item ERROR hay không" ở BFF layer; validation này là trách nhiệm BE (trả 400 nếu vi phạm, defensive check vì nút vốn đã disable khi không có item ERROR).
- **Downstream**: cùng endpoint W06-4, body `{runScope: "ERROR_ONLY"}`.
- **Output shape**: cùng `PriceCalcRunKickoff` shape với AC-1.
- **Failure mode**: 400 nếu `ERROR_ONLY` nhưng source run không có item `ERROR` nào (defensive check BE — nút FE vốn đã disable trường hợp này, per AC-5b source FEAT).
- **Ref**: op `priceCalcRunRecalc` (§6.1), enum `PriceCalcRunScope.ERROR_ONLY` (§5).

### Cluster B — Ghi đè kết quả / chạy nền (AC-2, AC-2b)

#### AC-2 → Ghi đè kết quả (BFF chỉ forward, không optimistic-update)

- **Khi**: sau kick-off, FE polling `priceCalcRunGet(id: newRunId, includeItems: true, itemStatus: [DONE, ERROR])` mỗi 5s để lấy giá vốn/giá trị đã ghi đè.
- **BFF phải**: passthrough `GET /api/v2/price-calc-runs/{id}` nguyên trạng — trả `items[]` (đã ghi đè theo BE) + `aggregates{}` (luôn non-null bất kể `includeItems`). **KHÔNG** cache riêng ở BFF layer — Redis cache 3s TTL cho polling đã nằm ở tầng `gf-accounting`, tránh double-cache gây stale.
- **Downstream**: `GET /api/v2/price-calc-runs/{id}` (W06-2, reuse — không thuộc RECALC sở hữu riêng).
- **Output shape**: `PriceCalcRunDetailApiResponse { data: PriceCalcRunDetail }`.
- **Failure mode**: 404 nếu run không tồn tại hoặc tenant mismatch.
- **Ref**: op `priceCalcRunGet` (`agg-garage-graph-graphql.md:431`, §6.1 — reuse FEAT-PRC-DETAIL), type `PriceCalcRunDetail` (§5).

#### AC-2b → Chạy nền — ghi đè tại chỗ (không xóa trắng)

- **Khi**: giữa các lần poll, run chuyển tuần tự `PENDING → RUNNING → SUCCEEDED | COMPLETED_WITH_ERRORS`.
- **BFF phải**: forward field `run.status` + `progressPercent`/`progressItemsDone`/`progressItemsTotal` nguyên trạng mỗi lần poll — **KHÔNG** suy luận hoặc nội suy (interpolate) tiến độ ở BFF; FE tự render progress bar từ giá trị BE trả trực tiếp.
- **Downstream**: cùng `GET /api/v2/price-calc-runs/{id}`.
- **Output shape**: `PriceCalcRunDetail.run.status`, `PriceCalcRunDetail.progressPercent`.
- **Failure mode**: N/A (read-only, không side-effect ở BFF).
- **Ref**: type `PriceCalcRunDetail` (§5).

### Cluster C — Chặn tính lại (AC-3, AC-3b)

#### AC-3 → Chặn khi kỳ đã đóng (áp cho cả 2 nút — ALL và ERROR_ONLY)

- **Khi**: source run thuộc kỳ kế toán đã `CLOSED`.
- **BFF phải**: **KHÔNG** tự kiểm tra trạng thái kỳ ở BFF layer — passthrough lỗi 409 nguyên trạng từ downstream vào GraphQL `errors[].extensions.code`.
- **Downstream**: 409 response từ W06-4 (`ERR-INV-024`).
- **Output shape**: GraphQL error `extensions.code = "ERR-INV-024"`.
- **Failure mode**: áp dụng đồng nhất cho cả `runScope=ALL` và `ERROR_ONLY` — BFF không phân biệt path xử lý theo `runScope`.
- **Ref**: §4.5 error mapping row AC-3, `gf-accounting-api.md:1543`.

#### AC-3b → Chặn khi đang có lần tính chạy nền cùng (kỳ + kho)

- **Khi**: có run khác `status ∈ {PENDING, RUNNING}` cùng (period + warehouse) — kể cả nếu `id` truyền vào không ở trạng thái terminal.
- **BFF phải**: passthrough 409 nguyên trạng, không retry ngầm, không tự chuyển hướng sang polling run đang chạy.
- **Downstream**: 409 W06-4 (`ERR-INV-029`) — path param `id` yêu cầu `status ∈ {SUCCEEDED, COMPLETED_WITH_ERRORS}` (terminal), nếu không → 409.
- **Output shape**: GraphQL error `extensions.code = "ERR-INV-029"`.
- **Ref**: §4.5 error mapping row AC-3b, `gf-accounting-api.md:1491`.

### Cluster D — Mã lỗi + phân quyền (AC-4, AC-5)

#### AC-4 → Mã lỗi khi tính lại (full mapping)

- **Khi**: bất kỳ lỗi nào từ downstream (400 body invalid/business defensive check, 401 auth, 403 tenant mismatch hoặc feature-flag off, 404 source run không tồn tại, 409 x2, 503 Temporal Cloud outage).
- **BFF phải**: map 1:1 downstream HTTP status + error code sang GraphQL `extensions.code` — xem bảng đầy đủ §4.5. Không transform message tiếng Việt (giữ nguyên cho FE tự bind theo code).
- **Downstream**: xem §4.5.
- **Ref**: §4.5.

#### AC-5 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: cả 2 persona (`garage-owner`, `accountant`) gọi mutation `priceCalcRunRecalc`.
- **BFF phải**: **KHÔNG** field-level RBAC riêng biệt cho op này — auth guard chỉ verify JWT hợp lệ + `tenantId` khớp context, không phân biệt persona.
- **Ref**: §4.1, §4.3.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Resolver `priceCalcRunRecalc` propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id` xuống downstream REST — theo pattern chung của BFF, không có exception cho op này.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Không cần DataLoader cho `priceCalcRunRecalc` (mutation single downstream call, không batch nhiều entity).
- Polling `priceCalcRunGet` (reuse) đã có cơ chế cache 3s TTL ở tầng BE — BFF không cache thêm để tránh 2 tầng cache lệch nhau.
- Không có persisted query allowlist bổ sung riêng cho op này (kế thừa policy chung của schema).

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / idempotency key value trong resolver log.
- Không field-level RBAC khác biệt giữa `garage-owner` và `accountant` cho recalc (AC-5).
- Tenant scope lấy từ header/context (`X-Tenant-Id` resolved từ JWT), KHÔNG tin `tenantId` client tự truyền qua argument.

### 4.4 Contract stability

- Op `priceCalcRunRecalc` cùng các type liên quan (`PriceCalcRunRecalcInput`, `PriceCalcRunKickoff`, `PriceCalcRunScope`) đã được ratify chung trong đợt thiết kế W06 PRC (schema `agg-garage-graph-graphql.md` v7.81, §3f) — RECALC **KHÔNG** cần thêm SDL type mới, chỉ reuse types đã có.
- Breaking change (đổi kiểu field, xóa field) → CR MAJOR. Deprecate field cũ → `@deprecated(reason: "...")`, không xóa hard.

### 4.5 Error code mapping

| Downstream error (BE, `gf-accounting-api.md §5.4`) | HTTP | GraphQL error code | Source AC | Notes |
|---|---|---|---|---|
| Body invalid (`runScope` ngoài enum) hoặc `ERROR_ONLY` khi source không có item ERROR | 400 | `ERR-CMN-validation` | AC-4 | Defensive check — nút FE vốn disable trường hợp source không có item ERROR |
| Auth thất bại | 401 | `UNAUTHENTICATED` | AC-4 | |
| Tenant mismatch / feature flag `Inventory:InventoryV2` off | 403 | `FORBIDDEN_ERROR` | AC-4 | |
| Source run không tồn tại (tenant-scoped) | 404 | `ERR-CMN-not-found` | AC-4 | |
| Kỳ của source run đã `CLOSED` | 409 | `ERR-INV-024` | AC-3 | Áp cho cả `ALL` và `ERROR_ONLY` |
| Có run active (`PENDING`/`RUNNING`) cùng (period+warehouse), hoặc source run `id` chưa terminal | 409 | `ERR-INV-029` | AC-3b | |
| Temporal Cloud outage — `WorkflowClient.start()` fail | 503 | `ERR-CMN-service-unavailable` | AC-4 | BE compensating DELETE row; FE có thể retry với backoff |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> `priceCalcRunRecalc` **KHÔNG cần SDL mới** — mọi type liên quan đã ratify cùng đợt W06 PRC (`agg-garage-graph-graphql.md` v7.81 §3f.1, cascade từ `gf-accounting-api.md` §5/§6.2/§6.3). Bảng dưới liệt kê type hiện hữu được RECALC tiêu thụ, để dev đối chiếu — không phải delta cần code thêm ở tầng schema.

### 5.1 Types hiện hữu tiêu thụ bởi RECALC (reuse — KHÔNG mới)

| Type name | Kind | Vai trò trong RECALC | Breaking? | AC ref |
|---|---|---|---|---|
| `PriceCalcRunRecalcInput` | input | Argument `input` của mutation — field `runScope: PriceCalcRunScope!` | NO (existing) | AC-1, AC-1b |
| `PriceCalcRunScope` | enum | `ALL \| ERROR_ONLY` | NO (existing) | AC-1, AC-1b |
| `PriceCalcRunKickoff` | type | Return payload (`runId`, `sourceRunId`, `runScope`, `status`, `pollingUrl`, `pollingIntervalHint`, `warningsSkippedItems`, `affectedSubsequentPeriods[]`, `idempotentReplay`) | NO (existing) | AC-1, AC-1b |
| `PriceCalcRunKickoffApiResponse` | type | Response wrapper (`data: PriceCalcRunKickoff`) | NO (existing) | AC-1, AC-1b |
| `AffectedSubsequentPeriod` | type | Cảnh báo cascade kỳ sau (BR-PRC-015) trong `PriceCalcRunKickoff.affectedSubsequentPeriods[]` | NO (existing) | AC-1 |
| `PriceCalcRunDetail` / `PriceCalcRunDetailApiResponse` | type | Return payload của `priceCalcRunGet` khi FE polling (AC-2, AC-2b) — reuse FEAT-PRC-DETAIL | NO (existing) | AC-2, AC-2b |

### 5.2 Modified types

> N/A — RECALC không thêm field mới vào type nào. Mọi field cần thiết đã có sẵn từ đợt ratify W06 PRC gốc (cascade F-05 v19 + F-13 v7.76 add `affectedSubsequentPeriods`).

> **Breaking changes** → REJECT (BFF schema additive only).

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 Operations liên quan

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunRecalc` | mutation (**mới, owned bởi FEAT-PRC-RECALC**) | `id: Int!`, `input: PriceCalcRunRecalcInput!`, `idempotencyKey: String!` | `PriceCalcRunKickoffApiResponse!` | JWT + tenantId, dual persona | AC-1, AC-1b |
| `priceCalcRunGet` | query (**reuse — owned bởi FEAT-PRC-DETAIL**) | `id: Int!`, `includeItems: Boolean = true`, `itemStatus: [PriceCalcItemStatus!]`, `keyword: String` | `PriceCalcRunDetailApiResponse!` | JWT + tenantId | AC-2, AC-2b |

> Verbatim source: `Architecture/api/agg-garage-graph-graphql.md:433` (`priceCalcRunRecalc`), `:431` (`priceCalcRunGet`) — Endpoint Summary §2, cross-checked với §0 Wave Index W06 row (§3f PRC, ops `W06-1..W06-6`).

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunRecalc` | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | `FEAT-PRC-RECALC` (BE §5.4) | `POST /api/v2/price-calc-runs/{id}/recalc` | — (single call, không batch) | AC-1, AC-1b |
| `priceCalcRunGet` | `src/resolvers/priceCalcRun/getPriceCalcRun.ts` (reuse — đã impl cho FEAT-PRC-DETAIL) | `FEAT-PRC-DETAIL` (BE §5.2) | `GET /api/v2/price-calc-runs/{id}` | — | AC-2, AC-2b |

### 6.3 DataLoader / batching strategy

> N/A — `priceCalcRunRecalc` là mutation kick-off single-run, không có N+1 pattern (không resolve nested list entity). `priceCalcRunGet` (reuse) cũng không cần loader vì chỉ fetch 1 run theo `id`.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `priceCalcRunRecalc` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, không cache |
| `priceCalcRunGet` (polling) | không set cache hint riêng ở BFF | — | Client-side polling interval 5s | Cache 3s TTL đã có ở tầng `gf-accounting` (Redis) — BFF không duplicate layer cache để tránh double-stale window |

### 6.5 Persisted query allowlist

> N/A — không có evidence persisted query allowlist áp riêng cho module PRC trong scope W06.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `resolvers/` | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | NEW | resolver passthrough pattern | ~45 | AC-1, AC-1b |
| `resolvers/` | `src/resolvers/priceCalcRun/getPriceCalcRun.ts` | REUSE (không sửa — đã impl cho FEAT-PRC-DETAIL) | — | 0 | AC-2, AC-2b |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | ADDITIVE (thêm method `recalcPriceCalcRun(id, body, idempotencyKey)`) | new method trên data source đã có | ~20 | AC-1, AC-1b |
| `error-mapping/` | `src/errors/priceCalcRunErrorMap.ts` (nếu chưa có, reuse pattern module khác) | REUSE hoặc ADDITIVE nhỏ | error map table | ~10 | AC-4 |
| `tests/integration` | `tests/integration/priceCalcRun-recalc.test.ts` | NEW | apollo test client | ~70 | AC-1, AC-1b, AC-3, AC-3b, AC-4 |
| `tests/contract` | `tests/contract/priceCalcRun-contract.test.ts` | REUSE/EXTEND (nếu file đã tồn tại từ FEAT-PRC-CREATE) | schema contract snapshot | ~15 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (FEAT-PRC-RECALC integration green — endpoint W06-4 stable). BFF S5 exit hand-off S6 cho FE Web (button "Tính lại"/"Tính lại mã lỗi" trên FEAT-PRC-DETAIL fe-web).

```
(← BE tier S4: FEAT-PRC-RECALC integration green — W06-4 stable)

S5  BFF resolver wire cho priceCalcRunRecalc
    Entry: BE FEAT-PRC-RECALC §5.4 contract stable (POST /api/v2/price-calc-runs/{id}/recalc)
    Exit: BFF contract test green (mutation + reuse priceCalcRunGet polling verified)
    └─► (hand-off FE Web S6 — FEAT-PRC-DETAIL fe-web consume 2 op)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF resolver `priceCalcRunRecalc` + error mapping | resolvers + data-sources + error-map | BE FEAT-PRC-RECALC §5.4 stable | BFF contract test green | BE FEAT-PRC-RECALC S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF **KHÔNG** enforce business validation primary cho RECALC (đó là `gf-accounting` territory). BFF chỉ forward auth context + pass-through lỗi.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-008` | CORNERSTONE | pass-through only (không BFF logic) — forward 409 `ERR-INV-024` | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | AC-3 | Primary enforcement ở BE |
| `BR-PRC-016` | CORNERSTONE | pass-through only — forward 409 `ERR-INV-029` | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | AC-3b | Primary enforcement ở BE |
| `BR-PRC-010` | NORMAL | pass-through `sourceRunId` field verbatim (audit trail) | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | AC-1 | BFF không tự sinh giá trị |
| `BR-PRC-015` | NORMAL | pass-through `affectedSubsequentPeriods[]` verbatim | `src/resolvers/priceCalcRun/recalcPriceCalcRun.ts` | AC-1 | Cảnh báo cascade — non-blocking |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-PRC-RECALC.md §9` (author song song, xem trạng thái §11).

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1, AC-1b | BFF contract (schema, args, cache hint) | test-api | snapshot mutation signature `id/input/idempotencyKey` |
| AC-1, AC-1b | BFF integration (resolver → BE) | test-api | mock downstream 202 response, verify idempotency header forward |
| AC-2, AC-2b | BFF integration (polling passthrough) | test-api | verify `priceCalcRunGet` reuse trả đúng `status`/`progressPercent` không bị BFF transform |
| AC-3, AC-3b, AC-4 | BFF error mapping | test-api | mock downstream 400/401/403/404/409×2/503 → assert `extensions.code` |
| AC-5 | BFF auth (RBAC) | test-isolation | dual persona, cả 2 gọi thành công như nhau |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-RECALC.md` | (author song song — xem STATE) | Downstream REST endpoint §5.4 — BFF resolver wrap trực tiếp |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DETAIL.md` | N-A (không có fe-web tier riêng cho RECALC — nút "Tính lại"/"Tính lại mã lỗi" thuộc UI của FEAT-PRC-DETAIL per fan-out map) | Consume `priceCalcRunRecalc` + `priceCalcRunGet` từ §6.1 |
| Mobile | — | N-A | PRC ngoài phạm vi mobile W06 (chỉ `FEAT-STK-LIST-V2` có mobile scope) |

**Source ID consistency** (item 18): `source_feat_sha` phải identical với BE tier file khi author BE hoàn tất.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) v21
- **Paired BE**: [`features/be/FEAT-PRC-RECALC.md`](../be/FEAT-PRC-RECALC.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index W06 → §3f PRC, Endpoint Summary rows 360-365 (§2)
- **Downstream REST**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §5.4 W06-4 (line 1484)
- **ADR**: `ADR-027` (BQGQ engine), `ADR-028` (async execution — Temporal workflow, HTTP 202 client contract)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-PRC-RECALC` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough thuần cho `priceCalcRunRecalc` + reuse `priceCalcRunGet` polling), §3 BFF behaviour map cover 8/8 AC nguồn, §4 auth + perf + cache + error mapping (7 dòng mapping HTTP→GraphQL code), §5-§11 BFF-specific (SDL reuse-only, ops contract verbatim grep-verify `agg-garage-graph-graphql.md:430-435`, resolver/DataLoader, cross-tier pair). Source FEAT chỉ audit. GraphQL op signature + downstream REST endpoint đều verbatim-verified trực tiếp từ Architecture doc (không chỉ trust bundle) do bundle flag `⚠️` fallback cho §5.4 REST block.
