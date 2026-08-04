---
type: execution
artifact_kind: converted-feature
tier_role: bff                                         # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DETAIL.md"
source_version: 24
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DETAIL"
source_feat_sha: "5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08"
generated_at: "2026-07-31T08:00:00+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "gf-hrms"]
modifies: []
change_type: "new-capability"
graphql_ops: ["priceCalcRunGet", "priceCalcRunRecalc"]
paired_backend_feats: ["FEAT-PRC-DETAIL"]
paired_fe_web_feats: ["FEAT-PRC-DETAIL"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "90022cfba84ae460d35e320f27a8733d24e3af48985b8691220e069da5cc33ec"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a — not provided in Context Bundle; template read directly from Execution/wave-specs/_TEMPLATE-feature-bff.md at authoring time"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-DETAIL.bff.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-01"
---

# FEAT-PRC-DETAIL (BFF): Chi tiết lần tính giá xuất kho (PRC)

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DETAIL` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` (primary — PRC master), `gf-hrms` (secondary — `executedByName` enrich) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| GraphQL ops | `priceCalcRunGet` (query), `priceCalcRunRecalc` (mutation) |
| Cross-tier pair | BE: `FEAT-PRC-DETAIL` \| Web: `FEAT-PRC-DETAIL` \| Mobile: — (PRC web-only, xem PKG §2.1 platform scope) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-DETAIL.md`](../../../../../Product/features/FEAT-PRC-DETAIL.md) |
| Source version | v24 |
| Source SHA | `5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08` |
| Generated at | 2026-07-31T08:00:00+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần xem lại kết quả của một lần tính giá xuất kho theo phương pháp Bình quân gia quyền cuối kỳ (BQGQ) đã kích hoạt — bao gồm trạng thái tổng quan, chi tiết từng mã đã tính (giá bình quân, số phiếu xuất được cập nhật) và mã bị lỗi kèm lý do — để kiểm tra tính đúng đắn của kết quả và quyết định có cần chạy lại toàn bộ hay chỉ chạy lại các mã lỗi hay không. Vì job tính giá chạy nền (async), màn này còn là nơi theo dõi tiến độ realtime của lần chạy đang diễn ra. Đây là bước "đọc lại kết quả" nằm giữa bước khởi chạy (`FEAT-PRC-CREATE`) và bước chạy lại (`FEAT-PRC-RECALC`) trong vòng đời một lần tính giá.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose query `priceCalcRunGet(id, includeItems, itemStatus, keyword)` — **passthrough thuần** sang `gf-accounting GET /api/v2/price-calc-runs/{id}` (W06-2), phục vụ cả lần mở màn đầu tiên (AC-1/AC-2) lẫn polling tiến độ định kỳ (AC-2c) và lọc bảng chi tiết (AC-2b/AC-3/AC-4).
- Expose mutation `priceCalcRunRecalc(id, input, idempotencyKey)` — **passthrough thuần** sang `gf-accounting POST /api/v2/price-calc-runs/{id}/recalc` (W06-4), dùng chung cho 2 nút trên màn Detail: "Tính lại toàn bộ" (`runScope: ALL`, AC-5) và "Tính lại mã lỗi" (`runScope: ERROR_ONLY`, AC-5b).
- Resolver pattern: cả 2 op chỉ gọi 1 REST endpoint downstream — không orchestrate multi-BE, không tự chứa business logic (engine BQGQ + convergent iteration là trách nhiệm BE per ADR-027/ADR-028).
- Field `executedByName` trên type `PriceCalcRun` KHÔNG do `gf-accounting` trả — BFF resolve qua **DataLoader batch sang `gf-hrms`** (mirror pattern TENANT-USERS đã dùng ở module OB, `agg-garage-graph-graphql.md §3g`), map `executedBy` (userId/email) → display name.
- Cache: KHÔNG cache response `priceCalcRunGet` ở BFF layer — polling AC-2c cần dữ liệu luôn tươi (BE đã có Redis cache 3s TTL riêng tại nguồn, đủ giảm tải; BFF không thêm tầng cache thứ 2 làm stale thêm).
- Header propagate: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` cho cả 2 op; riêng `priceCalcRunRecalc` bắt buộc forward thêm `X-Idempotency-Key` (map từ argument `idempotencyKey`, client sinh theo pattern `PRC-RECALC-{runId}-{clientNonce}` per ADR-028 §1).
- Feature flag `Inventory:InventoryV2`: BFF forward request bình thường (không tự check flag) — BE trả 403 khi tenant chưa bật → BFF map `FORBIDDEN_ERROR`.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Mỗi source AC-ID → 1 BFF behaviour statement. Coverage: 9/9 AC-ID (7 active + 2 N/A).

### Cluster A — Mở màn + polling tiến độ

#### AC-1 → Expose `priceCalcRunGet` cho lần mở màn đầu tiên

- **Khi**: FE điều hướng vào màn Detail với `runId` (từ URL/deep-link hoặc từ LIST/CREATE).
- **BFF phải**: gọi `priceCalcRunGet(id: runId)` passthrough, trả đủ block `run` (header info) + `progressPercent`/`progressItemsTotal`/`progressItemsDone` + `aggregates` ngay ở lần gọi đầu (không cần gọi 2 lần).
- **Downstream**: `GET /api/v2/price-calc-runs/{id}` (`gf-accounting`, W06-2).
- **Output shape**: `PriceCalcRunDetailApiResponse.data: PriceCalcRunDetail`.
- **Failure mode**: xem §4.5 (404 khi `id` không tồn tại/không thuộc tenant/đã xóa mềm).
- **Ref**: op `priceCalcRunGet` (§6.1), resolver (§6.2), paired BE FEAT-PRC-DETAIL §6.

#### AC-2 → Trả cụm thông tin đầu màn

- **Khi**: FE render header cluster (kỳ, kho, phương pháp, tài khoản thực hiện, thời điểm, trạng thái).
- **BFF phải**: trả nguyên block `run { periodName, fromDate, toDate, warehouseName, pricingMethod, executedBy, executedByName, executedAt, scope, status }` — `executedByName` resolve qua DataLoader gf-hrms (§2).
- **Downstream**: cùng endpoint AC-1.
- **Output shape**: field con của `PriceCalcRunDetail.run: PriceCalcRun`.
- **Failure mode**: `executedByName` resolve lỗi/không tìm thấy user → trả `null` (defensive, không chặn response chính).
- **Ref**: §6.1, §6.3 (DataLoader).

#### AC-2c → FE tự động polling — BFF đảm bảo response luôn tươi, không cache

- **Khi**: FE gọi lại `priceCalcRunGet` mỗi 5000ms trong khi `status ∈ {PENDING, RUNNING}`.
- **BFF phải**: KHÔNG cache response (mỗi lần gọi forward downstream thật, `@cacheControl(maxAge: 0)`) để tiến độ luôn đúng; hỗ trợ arg `includeItems: false` cho các lần poll trung gian (giảm payload — chỉ lấy `progressPercent`/`aggregates`, bỏ `items[]`) theo tối ưu hoá đã ratify ở REST (`includeItems` default `true`, FE có thể set `false` khi chỉ cần progress).
- **Downstream**: cùng endpoint AC-1, arg `includeItems` map trực tiếp query param cùng tên.
- **Output shape**: `aggregates` **luôn non-null** dù `includeItems=false` (BE-side quyết định, BFF passthrough nguyên vẹn — không tự lọc bỏ).
- **Failure mode**: downstream timeout/5xx trong lúc poll → BFF trả lỗi bình thường (không nuốt lỗi để FE tiếp tục poll retry theo interval riêng).
- **Ref**: §4.2, §6.1.

### Cluster B — Bảng chi tiết theo mã

#### AC-2b → Tìm kiếm + bộ lọc bảng chi tiết

- **Khi**: FE gửi `keyword` và/hoặc `itemStatus` (lọc theo mã lỗi/thành công) vào `priceCalcRunGet`.
- **BFF phải**: forward nguyên args `keyword: String` và `itemStatus: [PriceCalcItemStatus!]` xuống downstream query param cùng tên (đã hỗ trợ server-side, dù REST doc note FE có thể filter client-side với data đã tải — BFF không tự quyết định chỗ filter, chỉ forward khi FE gửi).
- **Downstream**: cùng endpoint AC-1, query params `itemStatus`, `keyword`.
- **Output shape**: `items[]` đã filter theo params gửi lên; `aggregates` tính trên **toàn bộ scope đã filter** (không phải chỉ trang hiện tại) — BFF KHÔNG tự tính lại, chỉ passthrough.
- **Failure mode**: `itemStatus` giá trị ngoài enum → 400 `ERR-CMN-validation`.
- **Ref**: §4.5, §6.1.

#### AC-3 → Bảng chi tiết theo mã (bao gồm dòng Tổng)

- **Khi**: FE render bảng `items[]` + dòng Tổng.
- **BFF phải**: trả `items[]` (`PriceCalcRunItem`) đầy đủ field (`openingQty/Value`, `receiptQty/Value`, `deliveryQty/Value`, `averageUnitPrice`, `updatedDeliverySlipCount`, `status`, `iterationsApplied`) + object `aggregates` (8 field BE-computed cross full filtered scope, F-15) cho dòng Tổng — luôn trả `aggregates` bất kể `includeItems`.
- **Downstream**: cùng endpoint AC-1.
- **Output shape**: `PriceCalcRunDetail.items` + `PriceCalcRunDetail.aggregates`.
- **Failure mode**: n/a (read-only, cùng error mode AC-1).
- **Ref**: §6.1, §5.1 (SDL `PriceCalcRunItemsAggregates`).

#### AC-4 → Hiển thị mã lỗi trong bảng chi tiết

- **Khi**: item có `status = ERROR`.
- **BFF phải**: trả nguyên field `errorReason` (enum `NEGATIVE_STOCK | ACCOUNTING_MISMATCH | SYSTEM_ERROR`) trên `PriceCalcRunItem` — KHÔNG tự map sang text (FE tự tra registry hiển thị "Do tồn âm" / "Lệch hạch toán" / "Do sự cố hệ thống").
- **Downstream**: cùng endpoint AC-1.
- **Output shape**: `PriceCalcRunItem.status` + `PriceCalcRunItem.errorReason`.
- **Failure mode**: n/a.
- **Ref**: §6.1.

### Cluster C — Nút Tính lại

#### AC-5 → Nút "Tính lại toàn bộ"

- **Khi**: FE gửi mutation `priceCalcRunRecalc(id: runId, input: {runScope: ALL}, idempotencyKey)`.
- **BFF phải**: forward `id` (path param) + body `{runScope: "ALL"}` + header `X-Idempotency-Key` xuống downstream; trả kết quả kick-off (runId **mới**, `pollingUrl`, `pollingIntervalHint: 5000`) để FE điều hướng/chuyển polling sang run mới.
- **Downstream**: `POST /api/v2/price-calc-runs/{id}/recalc` (`gf-accounting`, W06-4).
- **Output shape**: `PriceCalcRunKickoffApiResponse.data: PriceCalcRunKickoff` (`sourceRunId` trỏ về run gốc, `affectedSubsequentPeriods[]` cảnh báo non-blocking nếu có kỳ sau bị ảnh hưởng).
- **Failure mode**: xem §4.5 (409 `ERR-INV-024`/`ERR-INV-029`, 503 Temporal outage).
- **Ref**: op `priceCalcRunRecalc` (§6.1), resolver (§6.2), paired BE FEAT-PRC-DETAIL §6.

#### AC-5b → Nút "Tính lại mã lỗi"

- **Khi**: FE gửi cùng mutation với `input: {runScope: ERROR_ONLY}`.
- **BFF phải**: forward y hệt AC-5, chỉ khác giá trị `runScope`. Mã đã `DONE` giữ nguyên (copy-forward tại BE — BFF không transform).
- **Downstream**: cùng endpoint AC-5.
- **Output shape**: cùng `PriceCalcRunKickoff` shape.
- **Failure mode**: cùng §4.5; thêm case 400 khi source run không có item `ERROR` (defensive check tại BE — nút này về nguyên tắc disable ở FE khi không có item lỗi).
- **Ref**: §6.1.

#### AC-6 → Phân quyền ngang nhau 2 persona

- **Khi**: request có JWT hợp lệ với persona `garage-owner` hoặc `accountant`, cho cả `priceCalcRunGet` lẫn `priceCalcRunRecalc`.
- **BFF phải**: KHÔNG áp thêm role-based guard nào ngoài auth chuẩn (JWT hợp lệ + tenant match) — cả 2 persona pass như nhau; BE là nơi enforce nếu có khác biệt (hiện đối xứng, không có).
- **Downstream**: n/a (auth context).
- **Output shape**: n/a.
- **Failure mode**: JWT thiếu/hết hạn → `UNAUTHENTICATED_ERROR` 401; tenant mismatch hoặc feature flag off → `FORBIDDEN_ERROR` 403.
- **Ref**: §4.1.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Resolver `priceCalcRunGet` + `priceCalcRunRecalc` propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- Resolver `priceCalcRunRecalc` propagate thêm `X-Idempotency-Key` (map từ arg `idempotencyKey`, bắt buộc).
- JWT verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.
- Dual persona (`garage-owner`, `accountant`) pass như nhau — KHÔNG field-level RBAC bổ sung (AC-6).

### 4.2 Performance + N+1

- `priceCalcRunGet` không cần DataLoader cho `items[]` (single detail call theo `id`, không N+1) — nhưng field `executedByName` (dùng chung type `PriceCalcRun` giữa LIST và DETAIL) cần DataLoader batch theo `userId` để tránh N+1 khi resolver dùng lại type này ở LIST; DETAIL chỉ resolve 1 user/lần gọi nên tự nhiên không N+1, nhưng vẫn dùng chung loader (request-scoped) để nhất quán code path.
- `@cacheControl(maxAge: 0, scope: PRIVATE)` cho cả `priceCalcRunGet` (polling cần fresh) và `priceCalcRunRecalc` (mutation).
- Persisted query allowlist: N/A — chưa bật cho W06 PRC ops (mirror pattern các mutation/query slip module trước).
- Sau khi `priceCalcRunRecalc` thành công, FE nên điều hướng/poll `priceCalcRunGet` với `runId` mới trả về — BFF không tự push invalidation event (không có subscription cho PRC ở W06).

### 4.3 Security + data exposure

- KHÔNG log PII/JWT/`X-Idempotency-Key` trong resolver.
- Input `id`, `itemStatus`, `keyword`, `includeItems`, `input.runScope`, `idempotencyKey` không chứa trường nhạy cảm — không cần field-level RBAC bổ sung.
- Tenant scope lấy từ `X-Tenant-Id` header (JWT-derived), KHÔNG lấy từ argument client-controlled — ngăn truy cập/tính lại nhầm cross-tenant.

### 4.4 Contract stability

- Toàn bộ type/op ở §5/§6 là **additive** (module PRC mới toàn bộ ở W06) — không sửa type hiện có.
- Breaking change → CR MAJOR (N/A cho spec này).

### 4.5 Error code mapping

> **Provenance**: verified verbatim trực tiếp `Architecture/api/gf-accounting-api.md` v25 §5.2 (W06-2, dòng 1258-1381) + §5.4 (W06-4, dòng 1486-1557) — bundle §G Paired-BE block flag `⚠️` (thiếu §0 Wave Index match), đã fallback Read trực tiếp theo F-7. Đối chiếu khớp `PKG-W06-inventory-pricing-stock-report.md §2.2.1` bảng REST index (bundle §H).

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `401` Auth thiếu/hết hạn | `UNAUTHENTICATED_ERROR` | AC-1, AC-5, AC-5b, AC-6 |
| `403` Tenant mismatch HOẶC feature flag `Inventory:InventoryV2` off | `FORBIDDEN_ERROR` | AC-1, AC-5, AC-5b, AC-6 |
| `404` `id` không tồn tại / không thuộc tenant / đã xóa mềm (`deleted_at IS NOT NULL`) — `ERR-CMN-not-found` (ratify tường minh tại `gf-accounting-api.md` v25 §5.2, CR-20260801-02; cả 3 nguyên nhân trả cùng error code, KHÔNG leak existence cross-tenant) | `NOT_FOUND_ERROR` | AC-1 |
| `400` `itemStatus` ngoài enum / query param invalid — `ERR-CMN-validation` | `VALIDATION_ERROR` | AC-2b |
| `409 ERR-INV-024` (kỳ kế toán của run đã CLOSED, BR-PRC-008) | `ErrorResponse.code = ERR-INV-024`, `CONFLICT_ERROR` | AC-5, AC-5b |
| `409 ERR-INV-029` (đang có run active cùng kỳ+kho, BR-PRC-016) | `ErrorResponse.code = ERR-INV-029`, `CONFLICT_ERROR` | AC-5, AC-5b |
| `503` Temporal Cloud outage — `WorkflowClient.start()` fail | `SERVICE_UNAVAILABLE_ERROR` | AC-5, AC-5b |
| `400` Body invalid (`runScope` ngoài enum; `ERROR_ONLY` khi source không có item `ERROR`) | `VALIDATION_ERROR` | AC-5b |

> **RESOLVED** (2026-08-01, CR-20260801-02 MINOR self-approved — warm-up W06 Phase B `GAP-W06-AGG-06`): 404 case của `priceCalcRunGet` trước đây chỉ có bảng HTTP code + mô tả nguyên nhân trong `gf-accounting-api.md §5.2`, buộc spec này suy luận error code theo endpoint chị em `GET /api/v2/accounting-periods/{id}` (§4.3). Architecture Authority đã ratify tường minh: `gf-accounting-api.md` v25 §5.2 bổ sung dòng `**Not found** → 404 ERR-CMN-not-found` (mirror style §4.3) + xác nhận tenant mismatch và soft-deleted log trả cùng error code, KHÔNG leak existence cross-tenant. Suy luận ban đầu đã đúng — không đổi mapping trong bảng trên, chỉ nâng provenance từ inference lên ratified.

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Toàn bộ type dưới đây thuộc module PRC (`§3f` `agg-garage-graph-graphql.md`, đã ✅ trust theo §0 Wave Index W06) — **shared với 4 FEAT PRC bff-tier khác cùng wave** (LIST/CREATE/RECALC/DELETE). File này liệt kê subset type DETAIL trực tiếp tiêu thụ; KHÔNG scaffold trùng nếu sibling spec (vd `FEAT-PRC-LIST`/`FEAT-PRC-CREATE`) đã tạo file schema trước — impl-time cần cross-check `bffs/agg-garage-graph/src/schema/priceCalc.graphql` trước khi ghi đè.

### 5.1 New types (module-shared — DETAIL tiêu thụ)

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `PriceCalcRun` | type | `id`, `periodId/Name`, `fromDate`, `toDate`, `warehouseId/Code/Name`, `pricingMethod`, `executedBy`, `executedByName` (BFF DataLoader), `executedAt`, `scope`, `status`, `itemsResolvedCount/DoneCount/ErrorCount`, `warningsSkippedItems` | NO (new) | AC-1, AC-2 |
| `PriceCalcRunItem` | type | `id`, `productCode/Name`, `mainUnitCode`, `openingQty/Value`, `receiptQty/Value`, `deliveryQty/Value` (nullable), `averageUnitPrice` (nullable), `updatedDeliverySlipCount`, `status`, `errorReason` (nullable), `iterationsApplied` | NO (new) | AC-3, AC-4 |
| `PriceCalcRunDetail` | type | `run: PriceCalcRun!`, `scopePredicate: JSON!`, `progressPercent/ItemsTotal/ItemsDone: Int!`, `items: [PriceCalcRunItem!]!`, `aggregates: PriceCalcRunItemsAggregates!` | NO (new) | AC-1, AC-2, AC-2c, AC-3 |
| `PriceCalcRunItemsAggregates` | type | 8 field: `openingQtyTotal/ValueTotal`, `receiptQtyTotal/ValueTotal`, `deliveryQtyTotal/ValueTotal`, `updatedDeliverySlipCountTotal`, `itemsCount` | NO (new) | AC-3 |
| `PriceCalcRunKickoff` | type | `runId`, `status`, `createdAt`, `pollingUrl`, `pollingIntervalHint`, `sourceRunId` (nullable), `runScope` (nullable), `warningsSkippedItems` (nullable), `warningsMessages` (nullable), `idempotentReplay` (nullable), `affectedSubsequentPeriods` (nullable) | NO (new) | AC-5, AC-5b |
| `AffectedSubsequentPeriod` | type | `periodId`, `periodName`, `lastRunId`, `lastRunStatus` | NO (new) | AC-5, AC-5b |
| `PriceCalcWarning` | type | `type: PriceCalcWarningType!`, `count: Int!` | NO (new) | AC-5, AC-5b |
| `PriceCalcRunRecalcInput` | input | `runScope: PriceCalcRunScope!` | NO (new) | AC-5, AC-5b |
| `PriceCalcRunStatus` | enum | `PENDING`, `RUNNING`, `SUCCEEDED`, `COMPLETED_WITH_ERRORS` | NO (new) | AC-1, AC-2, AC-2c |
| `PriceCalcItemStatus` | enum | `RUNNING`, `DONE`, `ERROR` | NO (new) | AC-2b, AC-3, AC-4 |
| `PriceCalcErrorReason` | enum | `NEGATIVE_STOCK`, `ACCOUNTING_MISMATCH`, `SYSTEM_ERROR` | NO (new) | AC-4 |
| `PriceCalcRunScope` | enum | `ALL`, `ERROR_ONLY` | NO (new) | AC-5, AC-5b |
| `PriceCalcRunDetailApiResponse` | union wrapper | `data: PriceCalcRunDetail` | NO (new) | AC-1 |
| `PriceCalcRunKickoffApiResponse` | union wrapper | `data: PriceCalcRunKickoff` | NO (new) | AC-5, AC-5b |

### 5.2 Modified types (additive — backward-compat)

Không có type hiện hữu bị sửa — toàn bộ module PRC mới hoàn toàn ở W06.

> **Breaking changes** → REJECT (BFF schema additive only).

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunGet` | query | `id: Int!`, `includeItems: Boolean`, `itemStatus: [PriceCalcItemStatus!]`, `keyword: String` | `PriceCalcRunDetailApiResponse!` | JWT + tenantId (dual persona ngang quyền) | AC-1, AC-2, AC-2c, AC-2b, AC-3, AC-4, AC-6 |
| `priceCalcRunRecalc` | mutation | `id: Int!`, `input: PriceCalcRunRecalcInput!`, `idempotencyKey: String!` | `PriceCalcRunKickoffApiResponse!` | JWT + tenantId (dual persona ngang quyền) | AC-5, AC-5b, AC-6 |

### 6.2 Resolver mapping (downstream BE endpoints)

> **Verified verbatim** (F-7 — grep-checked trực tiếp `Architecture/api/gf-accounting-api.md` v25, KHÔNG suy luận convention): `GET /api/v2/price-calc-runs/{id}` cite §5.2 (dòng 1258-1381); `POST /api/v2/price-calc-runs/{id}/recalc` cite §5.4 (dòng 1486-1557). Cả 2 khớp Endpoint Summary §2 dòng W06-2/W06-4.

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunGet` | `src/resolvers/priceCalc/getPriceCalcRun.ts` | `FEAT-PRC-DETAIL` (BE §6) | `GET /api/v2/price-calc-runs/{id}` | `executedByName` per userId (TENANT-USERS loader, request-scoped) | AC-1, AC-2, AC-2c, AC-2b, AC-3, AC-4 |
| `priceCalcRunRecalc` | `src/resolvers/priceCalc/recalcPriceCalcRun.ts` | `FEAT-PRC-DETAIL` (BE §6) | `POST /api/v2/price-calc-runs/{id}/recalc` | — (single-entity mutation, không cần loader) | AC-5, AC-5b |

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Batch endpoint | TTL (in-memory) | Use cases |
|---|---|---|---|---|
| `tenantUsersLoader` (REUSE — pattern TENANT-USERS đã tồn tại từ module OB, `agg-garage-graph-graphql.md §3g`, KHÔNG tạo loader mới) | `{tenantId, userIds[]}` | `gf-hrms` batch by-ids endpoint (đã dùng cho OB) | request-scoped | resolve `PriceCalcRun.executedByName` |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `priceCalcRunGet` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | polling cần fresh; BE đã có Redis 3s TTL riêng tại nguồn |
| `priceCalcRunRecalc` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | mutation, no cache |

### 6.5 Persisted query allowlist (nếu enable)

N/A — chưa bật persisted query allowlist cho W06 PRC ops (mirror pattern các mutation/query slip module trước).

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Schema/data-source file **shared** với sibling PRC bff-tier features (LIST/CREATE/RECALC/DELETE) — kiểm tra tồn tại trước khi tạo mới (MODIFY thay vì NEW nếu sibling đã scaffold).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/priceCalc.graphql` | NEW hoặc MODIFY (additive, nếu sibling đã tạo) | extend SDL — query + mutation + 13 type mới (module-shared) | ~120 (module) / ~40 (DETAIL-specific delta) | AC-1..AC-6 |
| `resolvers/` | `src/resolvers/priceCalc/getPriceCalcRun.ts` | NEW | resolver pattern passthrough | ~55 | AC-1, AC-2, AC-2c, AC-2b, AC-3, AC-4 |
| `resolvers/` | `src/resolvers/priceCalc/recalcPriceCalcRun.ts` | NEW | resolver pattern passthrough + idempotency header forward | ~40 | AC-5, AC-5b |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | NEW hoặc ADDITIVE (nếu sibling đã tạo) | method mới `getPriceCalcRun(id, params)` + `recalcPriceCalcRun(id, body, idempotencyKey)` | ~30 | AC-1, AC-5, AC-5b |
| `data-loaders/` | REUSE `tenantUsersLoader` (đã có từ OB module) | REUSE | không tạo mới | 0 | AC-2 |
| `tests/integration` | `tests/integration/priceCalc-detail.test.ts` | NEW | apollo test client | ~90 | AC-1, AC-2, AC-2c, AC-2b, AC-3, AC-4, AC-5, AC-5b, AC-6 |
| `tests/contract` | `tests/contract/priceCalc-contract.test.ts` | NEW hoặc ADDITIVE (nếu sibling đã tạo) | schema snapshot | ~30 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-PRC-DETAIL §6 contracts stable (W06-2 GET detail, W06-4 POST recalc)
    Exit: BFF contract test green + DataLoader (tenantUsersLoader reuse) pass N+1 check
    └─► (hand-off FE Web S6; Mobile N/A — xem §11)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5 | BFF schema + resolver | schema + resolvers + data-source + loader (reuse) | BE FEAT-PRC-DETAIL §6 stable | BFF contract test green | BE FEAT-PRC-DETAIL S4 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary (đó là BE territory — engine BQGQ, convergent iteration, guard kỳ đóng/run-in-progress). BFF chỉ enforce/forward:

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-016` | NORMAL | contract echo — forward `pollingIntervalHint: 5000` nguyên vẹn, không cache | `resolvers/priceCalc/getPriceCalcRun.ts` | AC-2c | primary enforce ở BE (job chạy nền, guard run-in-progress) |
| `BR-PRC-008` | CORNERSTONE | error-mapping only (primary enforce ở BE qua accounting-period lock-check) | `resolvers/priceCalc/recalcPriceCalcRun.ts` | AC-5, AC-5b | forward `ERR-INV-024` nguyên văn |
| `BR-PRC-015` | NORMAL | passthrough `affectedSubsequentPeriods[]` không transform | `resolvers/priceCalc/recalcPriceCalcRun.ts` | AC-5, AC-5b | non-blocking advisory, primary detection ở BE |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-PRC-DETAIL.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1, AC-2 | BFF contract (schema, cache hint) | test-api | snapshot SDL: query `priceCalcRunGet` + 13 type module-shared |
| AC-1 | BFF integration (resolver → BE) | test-api | mock downstream 200 → verify `run`/`progressPercent`/`aggregates` mapping |
| AC-2c | BFF integration | test-api | verify `includeItems: false` polling path bỏ `items[]` nhưng giữ `aggregates` |
| AC-2b | BFF integration | test-api | verify `keyword`/`itemStatus` args forward đúng query param |
| AC-2 | DataLoader | test-api | mock `gf-hrms` batch → verify `executedByName` resolve, N+1 guard (1 batch call dù nhiều `PriceCalcRun` field resolve) |
| AC-5, AC-5b | BFF integration | test-api | mock downstream 202 → verify `PriceCalcRunKickoff` mapping (`runId` mới, `sourceRunId`, `runScope`) |
| AC-5, AC-5b | BFF error mapping | test-api | mock downstream 409 (`ERR-INV-024`/`ERR-INV-029`) + 503 → verify `ErrorResponse.code` preserve + `CONFLICT_ERROR`/`SERVICE_UNAVAILABLE_ERROR` mapping |
| AC-5, AC-5b | Idempotency passthrough | test-api | verify `idempotencyKey` arg map đúng header `X-Idempotency-Key` |
| AC-6 | BFF auth (dual persona) | test-isolation | JWT persona `garage-owner` vs `accountant` → cả 2 pass như nhau cho cả query lẫn mutation |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DETAIL.md` | pending | Downstream REST `GET /api/v2/price-calc-runs/{id}` (W06-2) + `POST .../recalc` (W06-4) — BFF resolver wrap |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DETAIL.md` | pending | Consume `priceCalcRunGet` (polling 5s) + `priceCalcRunRecalc` từ §6.1; PKG xác nhận màn Detail là garage-web route |
| Mobile | — | N/A | PRC (5 FEAT) là **web-only** per PKG §2.1 (mobile chỉ có `FEAT-STK-LIST-V2`) — không pair |

**Source ID consistency** (item 18): `source_feat_sha` = `5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08` — phải identical với BE/FE files khi authored.

**Frontmatter override note**: Context Bundle inject `add_fields.paired_fe_web_feats: []` (rỗng) — override thành `["FEAT-PRC-DETAIL"]` dựa trên bằng chứng PKG §Overview ("garage-web 5 route: 2 PRC + 3 report") + source FEAT rõ ràng là màn hình UI (AC-1 "Mở màn chi tiết"). Xem `_decisions.md`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-DETAIL.md`](../../../../../Product/features/FEAT-PRC-DETAIL.md) v24
- **Paired BE**: [`features/be/FEAT-PRC-DETAIL.md`](../be/FEAT-PRC-DETAIL.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3f (PRC — W06), §0 Wave Index
- **REST contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) v25 §5.2 (W06-2, dòng 1258-1381), §5.4 (W06-4, dòng 1486-1557)
- **ADR**: [`ADR-027`](../../../../../Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md) (engine BQGQ), [`ADR-028`](../../../../../Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md) (async execution — Temporal, HTTP 202 kick-off contract)
- **Error registry**: [`Product/Commons/ERROR-CODE-REGISTRY.md`](../../../../../Product/Commons/ERROR-CODE-REGISTRY.md) v33 (`ERR-INV-024` dòng 125, `ERR-INV-029` dòng 130)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-01 | 3 | warm-up fix subagent (per user sonhoang — `/warm-up agg-garage-graph --fix`, Phase B `GAP-W06-AGG-06`) | **Đóng NEED CONFIRMATION cuối cùng của spec này (budget 1/5 → 0/5)** — §4.5 Error code mapping: row `404` bỏ wording "suy luận theo convention ... NEED CONFIRMATION", thay bằng citation ratified `ERR-CMN-not-found` per `gf-accounting-api.md` v25 §5.2; callout dưới bảng đổi từ **NEED CONFIRMATION** → **RESOLVED** với provenance CR-20260801-02. Suy luận gốc (mirror endpoint chị em `GET /api/v2/accounting-periods/{id}` §4.3) đã được verify là ĐÚNG — mapping `404 → NOT_FOUND_ERROR` không đổi, chỉ nâng provenance từ inference lên ratified. **KHÔNG đụng**: 7 row error mapping còn lại, §1-§3 AC behaviour map, §5-§12 SDL/resolver/cross-tier. Doc-only, non-breaking. v2 → v3. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-PRC-DETAIL` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF, §3 BFF behaviour map per AC-ID (9/9 coverage: 7 active + 2 N/A dual-cluster đã merge vào AC-6), §4 auth + perf + cache + error mapping (8 mã lỗi, 1 NEED CONFIRMATION cho 404 sample), §5-§11 BFF-specific (SDL 13 type module-shared/ops `priceCalcRunGet`+`priceCalcRunRecalc`/resolver/DataLoader reuse `tenantUsersLoader`/cross-tier pair). REST endpoints `GET /api/v2/price-calc-runs/{id}` (W06-2) + `POST /api/v2/price-calc-runs/{id}/recalc` (W06-4) verified verbatim trực tiếp từ `gf-accounting-api.md` v24 §5.2/§5.4 (bundle §G Paired-BE flagged `⚠️`, đã fallback Read theo F-7). Frontmatter `paired_fe_web_feats` override từ `[]` (Context Bundle add_fields) → `["FEAT-PRC-DETAIL"]` dựa trên evidence PKG + source FEAT UI touchpoint — xem `_decisions.md`. Source FEAT chỉ audit. |
