---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-CREATE.md"
source_version: 32
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-CREATE"
source_feat_sha: "7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35"
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
graphql_ops: ["priceCalcRunCreate", "priceCalcRunRecalc", "priceCalcRunGet", "priceCalcItemsForCogsLookup"]
paired_backend_feats: ["FEAT-PRC-CREATE"]
paired_fe_web_feats: ["FEAT-PRC-CREATE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "n/a"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-CREATE (BFF): Chạy tính giá xuất kho (PWA)

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `priceCalcRunCreate` (mutation), `priceCalcRunRecalc` (mutation — cùng module cho AC-9b cascade), `priceCalcRunGet` (query — polling), `priceCalcItemsForCogsLookup` (query — dropdown) |
| Cross-tier pair | BE: `FEAT-PRC-CREATE` \| Web: `FEAT-PRC-CREATE` \| Mobile: N/A (PRC web-only per PKG-W06 scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) |
| Source version | v32 |
| Source SHA | `7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán/chủ garage cần chốt **giá vốn xuất kho** theo phương pháp bình quân gia quyền cuối kỳ (BQGQ) cho một kỳ kế toán + kho cụ thể, để các phiếu xuất trong kỳ (đang có giá vốn = 0) được điền đúng số tiền và giá trị tồn kho phản ánh chính xác cho báo cáo tồn/NXT. Đây là bước "chốt sổ" bắt buộc trước khi đóng kỳ kế toán — không chốt giá thì không thể đóng kỳ. Tác vụ chạy nền (không chặn UI) vì khối lượng tính có thể lớn (nhiều mã × tính lặp hội tụ cho phiếu trả tự tham chiếu).

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 1 mutation kick-off mới `priceCalcRunCreate` (module `price-calc-run`, W06 PRC) — passthrough thuần sang `gf-accounting POST /api/v2/price-calc-runs`, giữ nguyên semantic HTTP 202 Accepted (không dịch thành 200 đồng bộ).
- Passthrough `priceCalcRunGet` (polling, đã ratify song song W06 cho các FEAT-PRC-* khác) để FE poll tiến độ lần tính vừa kick-off (AC-8/AC-8b) mỗi 5s.
- Passthrough `priceCalcRunRecalc` cùng module — dùng khi user tự trigger tính lại cho các kỳ liệt kê ở `affectedSubsequentPeriods[]` (AC-9b cảnh báo cascade từ chính response CREATE).
- Passthrough query `priceCalcItemsForCogsLookup` cho dropdown "Thêm phụ tùng" khi scope = SPECIFIC (AC-5/AC-6).
- Không orchestrate, không aggregate, không cache kết quả tính giá — resolver 1:1 map GraphQL op → REST endpoint `gf-accounting`.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id` xuống downstream; forward `idempotencyKey` variable → REST header `X-Idempotency-Key`.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Mở form + chọn tham số (AC-1..AC-4)

#### AC-1 → N/A (xem fe-web/ tier file)

- Mở form là FE local UI state (dialog open). BFF không touch.

#### AC-2 → Passthrough `periodId` trong input CREATE

- **Khi**: FE user chọn kỳ kế toán trong form → set biến `input.periodId`.
- **BFF phải**: forward `periodId` verbatim trong body `POST /api/v2/price-calc-runs` khi mutation `priceCalcRunCreate` được gọi. BFF không tự validate OPEN/CLOSED (đó là BE guard qua `ERR-INV-024`, xem §4.5).
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3).
- **Output shape**: n/a (validate chỉ xảy ra ở submit, không có query riêng ở BFF cho "khóa khoảng ngày" — FE tự khóa UI dựa trên `AccountingPeriod.startDate/endDate` đã có từ op W04 pre-existing `searchAccountingPeriods`/tương đương, ngoài phạm vi FEAT này).
- **Ref**: mutation `priceCalcRunCreate` (§6.1), input `PriceCalcRunCreateInput.periodId` (§5.1), paired BE FEAT-PRC-CREATE §6 (W06-3).

#### AC-3 → Passthrough `warehouseId` + `pricingMethod` trong input CREATE

- **Khi**: FE user chọn kho + phương pháp tính giá (hiện chỉ `PWA`).
- **BFF phải**: forward `warehouseId` + `pricingMethod` verbatim trong `PriceCalcRunCreateInput`.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3).
- **Output shape**: n/a (input-only field, output không echo lại 2 field này riêng — chỉ có trong response LIST/DETAIL).
- **Failure mode**: 400 khi `warehouseId` không tồn tại tenant-scope → map `ERR-CMN-validation`.
- **Ref**: mutation `priceCalcRunCreate` (§6.1), input `PriceCalcRunCreateInput` (§5.1).

#### AC-4 → Passthrough `scope` (`ALL | SPECIFIC`) trong input CREATE

- **Khi**: FE user chọn phạm vi mã "Tất cả mã" hoặc "Chọn mã cụ thể".
- **BFF phải**: forward `scope` enum verbatim; khi `SPECIFIC` kèm `items[]` (array `{productCode}`).
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3).
- **Output shape**: `PriceCalcRunKickoffApiResponse` (§5.1).
- **Failure mode**: 400 khi `scope=SPECIFIC` nhưng `items[]` rỗng → `ERR-CMN-validation`.
- **Ref**: mutation `priceCalcRunCreate` (§6.1), input `PriceCalcRunCreateInput`/`PriceCalcRunCreateItemInput` (§5.1).

### Cluster B — Dropdown "Thêm phụ tùng" cho scope SPECIFIC (AC-5, AC-6, AC-6b)

#### AC-5 → `priceCalcItemsForCogsLookup` trả cột phụ trợ

- **Khi**: FE render dropdown "Thêm phụ tùng" hoặc bảng preview mã đã chọn — cần hiển thị "Có phát sinh xuất" + "Lần tính gần nhất".
- **BFF phải**: passthrough query `priceCalcItemsForCogsLookup(input: PriceCalcItemsForCogsLookupInput!)` sang `gf-accounting POST /api/v2/price-calc-runs/lookup/items-for-cogs` (W06-6), forward `periodId` + `warehouseId` + `keyword` + `page`/`size` verbatim.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs/lookup/items-for-cogs`.
- **Output shape**: `PagedPriceCalcItemsForCogsLookupApiResponse` → `PriceCalcItemForCogsLookup { productCode, productName, mainUnitCode, hasDeliveryInPeriod, deliveryCountInPeriod, lastCalculatedAt }`.
- **Failure mode**: 404 khi `periodId`/`warehouseId` không tenant-scope → map `ERR-CMN-not-found`.
- **Ref**: query `priceCalcItemsForCogsLookup` (§6.1), paired BE §5.6 (W06-6).

#### AC-6 → Thêm/xóa mã cụ thể — client-side state, BFF chỉ cấp data nguồn

- **Khi**: FE user pick/unpick mã từ kết quả `priceCalcItemsForCogsLookup`.
- **BFF phải**: không giữ state — mỗi keystroke search FE gọi lại `priceCalcItemsForCogsLookup` với `keyword` mới; danh sách đã chọn hoàn toàn FE local state, chỉ gửi lên BFF 1 lần dưới dạng `items[]` khi submit `priceCalcRunCreate`.
- **Downstream**: như AC-5 (lookup) + AC-4 (submit).
- **Output shape**: n/a (không có op riêng cho add/remove).
- **Ref**: query `priceCalcItemsForCogsLookup` (§6.1).

#### AC-6b → N/A (xem be/ tier file)

- BE-side filter (`internal_product.pricingMethod=PWA AND status=ACTIVE`) enforce tại `gf-accounting` khi resolve lookup (BR-PRC-012) và khi validate `items[]` tại CREATE. BFF chỉ forward request/response nguyên trạng, không tự lọc lại.

### Cluster C — Chạy tính + theo dõi kết quả (AC-7, AC-8, AC-8b, AC-9)

#### AC-7 → N/A (xem be/ tier file)

- Công thức BQGQ tính tại `gf-accounting` (ADR-027). BFF không compute, chỉ passthrough kết quả `averageUnitPrice` qua `priceCalcRunGet`.

#### AC-8 → `priceCalcRunGet` polling trả `items[]` + `aggregates`

- **Khi**: FE poll tiến độ sau kick-off (interval 5s cố định theo `pollingIntervalHint`).
- **BFF phải**: passthrough query `priceCalcRunGet(id, includeItems, itemStatus, keyword)` sang `gf-accounting GET /api/v2/price-calc-runs/{id}` (W06-2) verbatim — KHÔNG tự SUM lại `items[]` cho `aggregates` (BE-computed, full filtered scope trước pagination).
- **Downstream**: `gf-accounting GET /api/v2/price-calc-runs/{id}`.
- **Output shape**: `PriceCalcRunDetailApiResponse` → `PriceCalcRunDetail { run, scopePredicate, progressPercent, progressItemsTotal, progressItemsDone, items[], aggregates }`.
- **Failure mode**: 404 khi run không tồn tại/không tenant-scope/đã soft-delete → `ERR-CMN-not-found`.
- **Ref**: query `priceCalcRunGet` (§6.1), paired BE §5.2 (W06-2).

#### AC-8b → `priceCalcRunCreate` giữ nguyên HTTP 202 kick-off

- **Khi**: FE submit form — mutation `priceCalcRunCreate` gọi.
- **BFF phải**: giữ nguyên semantic 202 Accepted từ downstream (không convert response envelope thành đồng bộ/blocking); trả `PriceCalcRunKickoffApiResponse { runId, status: PENDING, createdAt, pollingUrl, pollingIntervalHint: 5000, warningsSkippedItems, warningsMessages[], affectedSubsequentPeriods[] }` ngay lập tức cho FE bắt đầu polling qua AC-8.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3).
- **Output shape**: `PriceCalcRunKickoffApiResponse` (§5.1).
- **Failure mode**: 503 khi Temporal Cloud outage (downstream compensating-delete) → map lỗi hệ thống tạm thời, FE hiển thị retry.
- **Ref**: mutation `priceCalcRunCreate` (§6.1), paired BE §5.3 (W06-3).

#### AC-9 → N/A (xem be/ tier file)

- "Không bắt tính tuần tự" là thiết kế concurrency ở `gf-accounting` (parallel fan-out per item qua Temporal `ComputeItemActivity`, ADR-027 §1.x). BFF không điều phối song song — chỉ gửi 1 request kick-off và nhận 1 `runId`.

### Cluster D — Cảnh báo cascade + mã lỗi (AC-9b, AC-10)

#### AC-9b → `PriceCalcRunKickoff.affectedSubsequentPeriods` passthrough

- **Khi**: response 202 của `priceCalcRunCreate` (hoặc `priceCalcRunRecalc`) chứa danh sách kỳ sau cần tính lại.
- **BFF phải**: passthrough field `affectedSubsequentPeriods: [AffectedSubsequentPeriod!]` verbatim từ REST `affectedSubsequentPeriods[]` (§5.3 REST) — không lọc, không aggregate thêm. Mỗi phần tử `{periodId, periodName, lastRunId, lastRunStatus}`. Empty `[]` = không có kỳ sau nào bị ảnh hưởng.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3) response body.
- **Output shape**: `AffectedSubsequentPeriod` SDL type (§5.1).
- **Ref**: mutation `priceCalcRunCreate` (§6.1), SDL type `AffectedSubsequentPeriod` (§5.1), paired BE §5.3 Semantics "Post-commit BR-PRC-015 cascade detection".

#### AC-10 → `PriceCalcRunItem.errorReason` passthrough qua `priceCalcRunGet`

- **Khi**: FE poll và thấy `item.status = ERROR`.
- **BFF phải**: passthrough `errorReason` enum (`NEGATIVE_STOCK | ACCOUNTING_MISMATCH | SYSTEM_ERROR`) verbatim — mapping label VN ("Do tồn âm" / "Lệch hạch toán" / "Do sự cố hệ thống") là presentation-layer, thực hiện ở FE, không phải BFF business logic.
- **Downstream**: `gf-accounting GET /api/v2/price-calc-runs/{id}` (W06-2), field `items[].errorReason`.
- **Output shape**: `PriceCalcRunItem.errorReason: PriceCalcErrorReason` (§5.1).
- **Ref**: query `priceCalcRunGet` (§6.1).

### Cluster E — Hủy bỏ, phân quyền, chặn trùng (AC-11, AC-12, AC-13, AC-13b)

#### AC-11 → N/A (xem fe-web/ tier file)

- Nút "Hủy bỏ" đóng dialog local, không gọi op nào xuống BFF.

#### AC-12 → Auth header propagation — dual persona, không field-level RBAC riêng

- **Khi**: mọi request tới 4 op của module `price-calc-run`.
- **BFF phải**: propagate `Authorization` (JWT) verbatim xuống `gf-accounting`; KHÔNG áp field-level RBAC riêng cho PRC (2 persona `garage-owner`/`accountant` quyền ngang nhau theo BR-AP-CMN-002). `executedBy` (tài khoản thực hiện) do BE tự resolve từ security context của request, BFF không set hay override field này.
- **Downstream**: tất cả 4 op §6.1.
- **Ref**: §4.1 Auth header propagation.

#### AC-13 → Mapping 409 `ERR-INV-029` (run-in-progress) sang GraphQL error

- **Khi**: `priceCalcRunCreate` gọi khi đã có run `PENDING`/`RUNNING` cùng (period+warehouse).
- **BFF phải**: map HTTP 409 `ERR-INV-029` từ downstream sang `ErrorResponse` union với code tương ứng — KHÔNG tự retry, KHÔNG tự silence lỗi.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3), Response 4xx/5xx table.
- **Output shape**: `ErrorResponse` union (BFF error convention).
- **Ref**: §4.5 Error code mapping.

#### AC-13b → Mapping 409 `ERR-INV-024` (kỳ CLOSED) sang GraphQL error

- **Khi**: `priceCalcRunCreate` gọi với `periodId` đã CLOSED.
- **BFF phải**: map HTTP 409 `ERR-INV-024` verbatim sang `ErrorResponse` union.
- **Downstream**: `gf-accounting POST /api/v2/price-calc-runs` (W06-3).
- **Output shape**: `ErrorResponse` union.
- **Ref**: §4.5 Error code mapping.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver (`priceCalcRunCreate`, `priceCalcRunRecalc`, `priceCalcRunGet`, `priceCalcItemsForCogsLookup`) propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.
- Feature flag `Inventory:InventoryV2` gate ở BE (`PriceCalcRunController` class-level) — BFF forward request bình thường; BE trả 403 khi flag off → BFF map lên `FORBIDDEN_ERROR`, không tự implement gate ở BFF layer.

### 4.2 Performance + N+1

- Không cần DataLoader cho 4 op module `price-calc-run` — mỗi op là 1:1 REST call, không có nested resolution field-level cần batch.
- `priceCalcRunGet` polling KHÔNG cache ở BFF layer — Redis cache 3s TTL đã nằm ở `gf-accounting` (§5.2 Semantics); BFF cache thêm sẽ làm stale progress bar trong window polling 5s.
- `priceCalcRunCreate` / `priceCalcRunRecalc`: `@cacheControl(maxAge: 0, scope: PRIVATE)` — mutation, không cache.

### 4.3 Security + data exposure

- KHÔNG log PII / JWT / `X-Idempotency-Key` value đầy đủ trong resolver log (chỉ log prefix/hash nếu cần trace).
- KHÔNG expose `temporalWorkflowId` (BE audit-only internal field per Naming Registry §6.2 — BFF/FE/Mobile không expose).
- Tenant scope: mọi query filter qua `X-Tenant-Id` header (từ JWT context), KHÔNG qua arg client-controlled.

### 4.4 Contract stability

- Schema additive only. `PriceCalcRunKickoff`/`PriceCalcRunDetail`/`PriceCalcRunItem` field rename → `@deprecated(reason: "...")` keep old.
- Breaking change → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `400 ERR-CMN-validation` (body invalid, `items[]` empty khi SPECIFIC, `items[] > 500`) | `VALIDATION_ERROR` | AC-3, AC-4 |
| `404` (period/warehouse không tenant-scope) | `NOT_FOUND_ERROR` | AC-5 |
| `409 ERR-INV-024` (kỳ CLOSED) | `ACCOUNTING_PERIOD_LOCKED` (mirror mã BE verbatim per D2 micro-decision, xem `gf-accounting-api.md §4.8`) | AC-13b |
| `409 ERR-INV-029` (run-in-progress cùng period+warehouse) | `PRICE_CALC_RUN_CONFLICT` | AC-13 |
| `503` (Temporal Cloud outage, compensating-delete) | `SERVICE_UNAVAILABLE_ERROR` | AC-8b |
| `403` (tenant mismatch / feature flag off) | `FORBIDDEN_ERROR` | AC-12 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> SDL đã ratify tại `agg-garage-graph-graphql.md §3f.1` (v7.74+, ✅ resolved §0 Wave Index cho W06). FEAT-PRC-CREATE dùng chung module `price-calc-run` với FEAT-PRC-LIST/DETAIL/RECALC/DELETE (5 FEAT cùng SDL, mỗi FEAT-tier chỉ đảm nhiệm behaviour riêng — xem §3). Liệt kê dưới đây phần liên quan trực tiếp CREATE flow.

### 5.1 New types (đã tồn tại — reference, không tạo mới lần này)

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `PriceCalcRunCreateInput` | input | `periodId: Int!`, `warehouseId: Int!`, `pricingMethod: PricingMethod!`, `scope: PriceCalcScope!`, `items: [PriceCalcRunCreateItemInput!]` | NO (existing) | AC-2, AC-3, AC-4 |
| `PriceCalcRunCreateItemInput` | input | `productCode: String!` | NO (existing) | AC-4, AC-6 |
| `PriceCalcRunRecalcInput` | input | `runScope: PriceCalcRunScope!` | NO (existing) | AC-9b (cascade trigger, xem paired FEAT-PRC-RECALC bff-tier) |
| `PriceCalcItemsForCogsLookupInput` | input | `periodId: Int!`, `warehouseId: Int!`, `keyword: String`, `page: Int = 0`, `size: Int = 20` | NO (existing) | AC-5, AC-6 |
| `PriceCalcRunKickoff` | type | `runId: Int!`, `status: PriceCalcRunStatus!`, `createdAt: DateTime!`, `pollingUrl: String!`, `pollingIntervalHint: Int!`, `sourceRunId: Int`, `runScope: PriceCalcRunScope`, `warningsSkippedItems: Int`, `warningsMessages: [PriceCalcWarning!]`, `idempotentReplay: Boolean`, `affectedSubsequentPeriods: [AffectedSubsequentPeriod!]` | NO (existing) | AC-8b, AC-9b |
| `AffectedSubsequentPeriod` | type | `periodId: Int!`, `periodName: String!`, `lastRunId: Int!`, `lastRunStatus: PriceCalcRunStatus!` | NO (existing, F-13 v7.76 add) | AC-9b |
| `PriceCalcRunDetail` | type | `run: PriceCalcRun!`, `scopePredicate: JSON!`, `progressPercent: Int!`, `progressItemsTotal: Int!`, `progressItemsDone: Int!`, `items: [PriceCalcRunItem!]!`, `aggregates: PriceCalcRunItemsAggregates!` | NO (existing) | AC-8 |
| `PriceCalcItemForCogsLookup` | type | `productCode: String!`, `productName: String!`, `mainUnitCode: String!`, `hasDeliveryInPeriod: Boolean!`, `deliveryCountInPeriod: Int!`, `lastCalculatedAt: DateTime` | NO (existing) | AC-5 |

### 5.2 Modified types

> Không có thay đổi additive cho FEAT-PRC-CREATE này — SDL đã ratify đầy đủ ở round trước (v7.74 Round 2 + v7.76 Round 5 F-13). Nếu dev phát hiện field thiếu, phải `/cr-raise` cascade Architecture Authority trước khi impl (KHÔNG tự thêm field SDL).

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 Operations dùng bởi FEAT-PRC-CREATE

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunCreate` | mutation | `input: PriceCalcRunCreateInput!`, `idempotencyKey: String!` | `PriceCalcRunKickoffApiResponse!` | JWT + X-Tenant-Id | AC-2, AC-3, AC-4, AC-8b, AC-9b, AC-13, AC-13b |
| `priceCalcRunRecalc` | mutation | `id: Int!`, `input: PriceCalcRunRecalcInput!`, `idempotencyKey: String!` | `PriceCalcRunKickoffApiResponse!` | JWT + X-Tenant-Id | AC-9b (trigger từ warning panel — chi tiết behaviour ở paired FEAT-PRC-RECALC bff-tier) |
| `priceCalcRunGet` | query | `id: Int!`, `includeItems: Boolean = true`, `itemStatus: [PriceCalcItemStatus!]`, `keyword: String` | `PriceCalcRunDetailApiResponse!` | JWT + X-Tenant-Id | AC-8, AC-10 |
| `priceCalcItemsForCogsLookup` | query | `input: PriceCalcItemsForCogsLookupInput!` | `PagedPriceCalcItemsForCogsLookupApiResponse!` | JWT + X-Tenant-Id | AC-5, AC-6 |

> Op ID cross-ref `agg-garage-graph-graphql.md §2 Endpoint Summary`: `priceCalcRunCreate`=#362, `priceCalcRunRecalc`=#363, `priceCalcRunGet`=#361, `priceCalcItemsForCogsLookup`=#365. Cite verified verbatim §0 Wave Index W06 → §3f block 2026-07-31 (`references_verbatim`).

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunCreate` | `src/resolvers/price-calc-run/priceCalcRunCreate.ts` | `FEAT-PRC-CREATE` (BE §6, W06-3) | `POST /api/v2/price-calc-runs` | none (1:1 passthrough) | AC-2, AC-3, AC-4, AC-8b, AC-9b |
| `priceCalcRunRecalc` | `src/resolvers/price-calc-run/priceCalcRunRecalc.ts` | `FEAT-PRC-RECALC` (BE §6, W06-4) | `POST /api/v2/price-calc-runs/{id}/recalc` | none | AC-9b |
| `priceCalcRunGet` | `src/resolvers/price-calc-run/priceCalcRunGet.ts` | `FEAT-PRC-DETAIL` (BE §6, W06-2) | `GET /api/v2/price-calc-runs/{id}` | none | AC-8, AC-10 |
| `priceCalcItemsForCogsLookup` | `src/resolvers/price-calc-run/priceCalcItemsForCogsLookup.ts` | `FEAT-PRC-CREATE` (BE §6, W06-6) | `POST /api/v2/price-calc-runs/lookup/items-for-cogs` | none | AC-5, AC-6 |

### 6.3 DataLoader / batching strategy

> Không cần DataLoader cho module `price-calc-run` — không có field-level nested resolution gây N+1 (không giống `executedByName` ở FEAT-PRC-LIST đòi TENANT-USERS DataLoader; FEAT-PRC-CREATE không hiển thị danh sách run nên không cần).

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| _(none)_ | — | — | — | — |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `priceCalcRunGet` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | polling read, no client-cache (BE Redis 3s TTL sufficient) |
| `priceCalcItemsForCogsLookup` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | dropdown search, always fresh (fluctuates với new delivery slips per §5.6 Semantics) |
| `priceCalcRunCreate` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache |
| `priceCalcRunRecalc` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache |

### 6.5 Persisted query allowlist

> Không sử dụng persisted query cho module này (ngoài phạm vi baseline hiện hữu của BFF).

| Query name | Hash | First-seen | AC ref |
|---|---|---|---|
| _(none)_ | — | — | — |

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Module `price-calc-run` đã tồn tại (dùng chung 5 FEAT-PRC-*); FEAT-PRC-CREATE chỉ impl 2 resolver mutation `priceCalcRunCreate`/`priceCalcRunRecalc` mới (nếu chưa có từ FEAT khác impl trước) + reuse `priceCalcRunGet`/`priceCalcItemsForCogsLookup` (impl chung, không duplicate).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/price-calc-run.graphql` | ALREADY RATIFIED (no change — SDL v7.74+ stable) | — | 0 | — |
| `resolvers/` | `src/resolvers/price-calc-run/priceCalcRunCreate.ts` | NEW | resolver pattern (passthrough, forward `X-Idempotency-Key`) | ~40 | AC-2, AC-3, AC-4, AC-8b, AC-9b |
| `resolvers/` | `src/resolvers/price-calc-run/priceCalcRunRecalc.ts` | NEW (hoặc reuse nếu FEAT-PRC-RECALC bff-tier impl trước — coordinate qua §11) | resolver pattern | ~35 | AC-9b |
| `resolvers/` | `src/resolvers/price-calc-run/priceCalcRunGet.ts` | NEW (hoặc reuse nếu FEAT-PRC-DETAIL bff-tier impl trước) | resolver pattern | ~40 | AC-8, AC-10 |
| `resolvers/` | `src/resolvers/price-calc-run/priceCalcItemsForCogsLookup.ts` | NEW | resolver pattern | ~35 | AC-5, AC-6 |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | ADDITIVE — 4 method mới (`createPriceCalcRun`, `recalcPriceCalcRun`, `getPriceCalcRun`, `lookupItemsForCogs`) | new method | ~60 | AC-2..AC-13b |
| `auth/` | `src/auth/priceCalcRunGuard.ts` | NEW (nếu dual-persona check cần tách guard riêng, thường generic JWT guard đã đủ) | guard pattern | ~15 | AC-12 |
| `tests/integration` | `tests/integration/price-calc-run.test.ts` | ADDITIVE | apollo test client | ~100 | AC-2, AC-3, AC-4, AC-8b, AC-9b, AC-13, AC-13b |
| `tests/contract` | `tests/contract/price-calc-run-contract.test.ts` | NEW (nếu chưa tồn tại từ FEAT khác cùng module) | schema contract | ~50 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (cross-boundary integration green). BFF S5 exit hand-off S6 cho FE/Mobile.

```
(← BE tier S4: integration green — FEAT-PRC-CREATE §6 W06-3/W06-6 stable)

S5  BFF schema + resolver wire
    Entry: BE FEAT §6 contracts stable (W06-1..W06-6)
    Exit: BFF contract test green (priceCalcRunCreate/Recalc/Get/ItemsForCogsLookup)
    └─► (hand-off FE Web S6 — Mobile out-of-scope PRC)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | resolvers + data-sources | BE FEAT §6 stable | BFF contract test green | BE FEAT-PRC-CREATE S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory: BR-PRC-001..018 tại `gf-accounting`). BFF chỉ enforce:

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-CMN-002` | CORNERSTONE | auth guard (no field-level RBAC, chỉ JWT presence check) | `src/auth/priceCalcRunGuard.ts` | AC-12 | dual persona equal rights — không có persona-specific branching |
| `BR-PRC-016` (chặn trùng) | NORMAL | resolver passthrough error mapping (không tự chặn ở BFF — nguồn thật ở BE `SELECT FOR UPDATE` + `WorkflowIdReusePolicy`) | `src/resolvers/price-calc-run/priceCalcRunCreate.ts` | AC-13 | BFF chỉ map 409, không duplicate-check |
| `BR-PRC-008` (chặn kỳ CLOSED) | CORNERSTONE | resolver passthrough error mapping | `src/resolvers/price-calc-run/priceCalcRunCreate.ts` | AC-13b | BFF chỉ map 409, không validate lại period status |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-PRC-CREATE.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-4 | BFF contract (schema, input shape) | test-api | snapshot SDL `PriceCalcRunCreateInput` + `scope=SPECIFIC` requires `items[]` |
| AC-8b | BFF integration (resolver → BE, 202 semantic) | test-api | mock downstream trả 202, verify BFF KHÔNG chuyển thành 200 |
| AC-9b | BFF integration (affectedSubsequentPeriods passthrough) | test-api | mock downstream trả non-empty array, verify field không bị BFF lọc/transform |
| AC-12 | BFF auth (RBAC) | test-isolation | dual persona, không có role nào bị chặn |
| AC-13, AC-13b | BFF error mapping | test-api | mock downstream 409 `ERR-INV-024`/`ERR-INV-029`, verify GraphQL error code đúng §4.5 |
| — | idempotencyKey header forward | test-api | verify `X-Idempotency-Key` header value = client `idempotencyKey` arg verbatim |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-CREATE.md` | DRAFT (pending — batch chạy song song) | Downstream REST endpoints W06-3 (CREATE) + W06-4 (RECALC, shared) + W06-2 (GET, shared) + W06-6 (lookup) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-CREATE.md` | DRAFT (pending — batch D chạy song song) | Consume `priceCalcRunCreate`/`priceCalcRunRecalc`/`priceCalcRunGet`/`priceCalcItemsForCogsLookup` từ §6.1 |
| Mobile | N/A | N/A | PRC toàn bộ web-only per `PKG-W06-inventory-pricing-stock-report.md §1 Overview` — không có mobile tier cho FEAT-PRC-* |

**Note phối hợp resolver dùng chung**: 4 op ở §6.1 dùng chung module `price-calc-run` với 4 FEAT-PRC-* khác (LIST/DETAIL/RECALC/DELETE). Nếu agent BFF khác đã impl `priceCalcRunGet`/`priceCalcRunRecalc` trước (từ FEAT-PRC-DETAIL/FEAT-PRC-RECALC bff-tier), agent impl FEAT-PRC-CREATE reuse resolver có sẵn thay vì tạo trùng — coordinate qua PR review, không tạo file duplicate.

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) v32
- **Paired BE**: [`features/be/FEAT-PRC-CREATE.md`](../be/FEAT-PRC-CREATE.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md §3f`](../../../../../Architecture/api/agg-garage-graph-graphql.md) (PRC module, §0 Wave Index W06)
- **Downstream REST**: [`Architecture/api/gf-accounting-api.md §5`](../../../../../Architecture/api/gf-accounting-api.md) (PRC endpoints W06-1..W06-6) + `§6.2/§6.3 Naming Registry`
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-PRC-CREATE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF (passthrough thuần module `price-calc-run`), §3 BFF behaviour map cover 17/17 AC-IDs, §4 auth + perf + cache + error mapping (2 mã lỗi 409 canonical), §5-§11 BFF-specific (SDL reference/ops/resolver/DataLoader-none/cross-tier pair). Contract verified trực tiếp từ `gf-accounting-api.md v24 §5` + `agg-garage-graph-graphql.md v7.81 §0 Wave Index + §2 rows #360-365` (fallback-read do bundle §G "Paired BE REST endpoints" block flagged stale ⚠️ — keyword-match `Create` đã pick nhầm section FEAT-AP-CREATE thay vì PRC). Source FEAT chỉ audit. |
