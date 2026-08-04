---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-CREATE.md"
source_version: 32
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-CREATE"
source_feat_sha: "7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35"
generated_at: "2026-07-31T07:20:00Z"
status: ACTIVE
version: 6
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting", "gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán chọn kỳ OPEN + kho + phạm vi mã BQGQ Đang hoạt động → bấm Thực hiện tính giá → BE trả 202 kèm runId → Temporal workflow chạy nền tính đơn giá BQ, điền giá vốn phiếu xuất + cập nhật sổ tồn, chốt log Thành công/Hoàn thành có lỗi."
consumes_contracts:
  - "GET /protected/v1/stock-ledgers/at-date (gf-inventory) — snapshot tồn đầu kỳ SL+GT"
  - "POST /protected/v1/slips-in-period/search (gf-inventory) — enumerate phiếu nhập/xuất trong kỳ"
  - "POST /protected/v1/delivery-lines/bulk-fill-cost (gf-inventory) — ghi giá vốn phiếu xuất"
  - "POST /protected/v1/stock-ledgers/bulk-recompute (gf-inventory) — cascade recompute sổ tồn"
  - "POST /api/v2/internal-products/search (gf-inventory) — resolve mã BQGQ Đang hoạt động cho scope ALL"
  - "POST /protected/v1/receipt-lines/bulk-inherit-cost (gf-inventory) — kế thừa giá nhập gốc cho Xuất trả hàng mua"
paired_bff_feats: ["FEAT-PRC-CREATE"]
paired_fe_web_feats: ["FEAT-PRC-CREATE"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-CREATE.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-02"
---

# FEAT-PRC-CREATE (BE): Thực hiện tính giá xuất kho (BQGQ cuối kỳ)

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-CREATE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` (owner) · `gf-inventory` (REST consumed — sổ tồn + phiếu + catalog mã nội bộ `internal-products/search`) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán chọn kỳ OPEN + kho + phạm vi mã → "Thực hiện tính giá" → 202 `runId` → Temporal workflow chạy nền → giá vốn phiếu xuất + sổ tồn cập nhật, log chốt trạng thái |
| Cross-tier pair | BFF: `FEAT-PRC-CREATE` (agg-garage-graph) \| Web: `FEAT-PRC-CREATE` (garage-web) \| Mobile: N/A (PRC web-only per PKG-W06 §1) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) |
| Source version | v32 |
| Source SHA | `7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35` |
| Generated at | 2026-07-31T07:20:00Z |

## 1. Mục đích nghiệp vụ

Kế toán/chủ garage cần chốt **giá vốn xuất kho** theo phương pháp bình quân gia quyền cuối kỳ (BQGQ) cho một kỳ kế toán + kho cụ thể, để các phiếu xuất trong kỳ (đang có giá vốn = 0) được điền đúng số tiền và giá trị tồn kho phản ánh chính xác cho báo cáo tồn/NXT. Đây là bước "chốt sổ" bắt buộc trước khi đóng kỳ kế toán — không chốt giá thì không thể đóng kỳ. Tác vụ chạy nền (không chặn UI) vì khối lượng tính có thể lớn (nhiều mã × tính lặp hội tụ cho phiếu trả tự tham chiếu).

## 2. Trách nhiệm backend (gf-accounting)

- Sở hữu aggregate `PriceCalcRun` / `PriceCalcRunItem` (log lần tính BQGQ) — entity mới hoàn toàn trong schema `gf_accounting`, `ddl-auto=update`.
- Expose `POST /api/v2/price-calc-runs` (kick-off async, 202) + `POST /api/v2/price-calc-runs/lookup/items-for-cogs` (dropdown "Thêm phụ tùng") cho FE/BFF consume.
- Enforce toàn bộ business rule SSOT của công thức BQGQ (BR-PRC-001..018) tại domain/service layer — BE là nguồn chân lý duy nhất cho kết quả tính giá.
- Đóng vai trò **REST consumer** cross-boundary sang `gf-inventory` (snapshot sổ tồn + phiếu nhập/xuất, ghi giá vốn phiếu xuất, trigger cascade recompute sổ tồn, resolve catalog mã BQGQ Đang hoạt động qua `internal-products/search`).
- Chạy engine tính giá qua **Temporal workflow** `PriceCalcRunWorkflow` (worker embed trong `gf-accounting`, task queue `PRC_TASK_QUEUE`) — đảm bảo durable execution, crash-resume, không kẹt "Đang tính" vĩnh viễn.
- Persist theo `ddl-auto=update` (Common Gotcha #5) — **KHÔNG viết Flyway migration**.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Kick-off form: kỳ, kho, phạm vi mã

#### AC-1 → N/A (UI-only)

- Mở form + microcopy tĩnh là render thuần FE. BE không touch. Xem `fe-web/FEAT-PRC-CREATE.md §3 AC-1`.

#### AC-2 → Validate kỳ kế toán tại kick-off

- **Khi**: client POST `/api/v2/price-calc-runs` với `periodId`.
- **BE phải**: resolve `accounting_period` theo `periodId` (tenant-scoped, cùng boundary — internal join, không cross-boundary), lấy `startDate`/`endDate` làm `fromDate`/`toDate` cho phạm vi tính; kiểm `status = OPEN` (else 409).
- **Output**: `fromDate`/`toDate` derive từ period, lưu vào `price_calc_run`.
- **Failure mode**: `periodId` không tồn tại/không thuộc tenant → 404; `status=CLOSED` → 409 `ERR-INV-024`.
- **Ref**: BR-PRC-008/AP-012 (§9), entity `PriceCalcRun` (§5.1), endpoint `POST /api/v2/price-calc-runs` (§6.1).
- Dropdown population kỳ (list OPEN periods) là FE consume qua BFF wrap endpoint AP đã có sẵn (`FEAT-AP-LIST`, ngoài scope FEAT này) — BE không thêm endpoint mới cho việc này.

#### AC-3 → Validate kho & phương pháp tính giá

- **Khi**: client POST với `warehouseId` + `pricingMethod`.
- **BE phải**: verify `warehouseId` tồn tại tenant-scoped (qua reference đã có ở gf-inventory catalog — validate tại thời điểm tính, không cần REST call riêng vì warehouse ID được reference trong slip search §6.4); chỉ chấp nhận `pricingMethod = "PWA"` (khác giá trị → 400).
- **Output**: `price_calc_run.warehouse_id/code/name` lưu snapshot.
- **Failure mode**: `warehouseId` invalid → 400/404.
- **Ref**: BR-PRC-001 (tính theo Mã+Kho+Garage), endpoint `POST /api/v2/price-calc-runs` (§6.1).

#### AC-4 → Resolve phạm vi mã (ALL / SPECIFIC)

- **Khi**: `scope = ALL` (server resolve khi chạy) hoặc `scope = SPECIFIC` (`items[]` client cung cấp).
- **BE phải**: `ALL` → tại Phase 0 (kick-off) chỉ lưu `scope_predicate` (`{pricingMethod: PWA, productStatus: ACTIVE, garageId}`), KHÔNG pre-resolve danh sách mã lúc INSERT — resolve thật sự xảy ra trong `SnapshotPullActivity` (Phase 1) qua REST `POST /api/v2/internal-products/search` body `{pricingMethod: "PWA", status: "ACTIVE"}` (**`gf-inventory`** — catalog InternalProduct, KHÔNG phải `gf-erp-mdm`; endpoint mở rộng additive v77 để hỗ trợ filter `pricingMethod`, xem `Architecture/api/gf-inventory-api.md` §3a.2 V2-7). `SPECIFIC` → validate mỗi `items[].productCode` resolve được sản phẩm BQGQ (không cần Active tại submit — revalidate lại ở Phase 0 workflow trước compute, theo BR-PRC-016).
- **Output**: `price_calc_run.scope`, `scope_predicate` (JSONB) hoặc `items_snapshot` (JSONB).
- **Failure mode**: `SPECIFIC` với `items[]` rỗng hoặc >500 → 400 `ERR-CMN-validation`.
- **Ref**: BR-PRC-009/012 (§9), entity `PriceCalcRun.scope_predicate/items_snapshot` (§5.1), endpoint (§6.1).

#### AC-5 → Lookup dropdown "Thêm phụ tùng" — dữ liệu cột bảng

- **Khi**: client POST `/api/v2/price-calc-runs/lookup/items-for-cogs` với `periodId`/`warehouseId`/`keyword`.
- **BE phải**: compose 2 REST call sang **`gf-inventory`** (cùng boundary, không phải cross-boundary khác nhau) — (a) `POST /api/v2/internal-products/search` filter `pricingMethod=PWA&status=ACTIVE` (catalog mã BQGQ + Đang hoạt động); (b) `POST /protected/v1/slips-in-period/search` (đếm phiếu xuất trong kỳ/kho) — JOIN kết quả với `price_calc_run_item` gần nhất cho `lastCalculatedAt` (nội bộ `gf-accounting`).
- **Output**: `{productCode, productName, mainUnitCode, hasDeliveryInPeriod, deliveryCountInPeriod, lastCalculatedAt}[]` paginated.
- **Failure mode**: `ERR-CMN-validation`/`not-found`.
- **Ref**: BR-PRC-012 (§9), endpoint `POST /api/v2/price-calc-runs/lookup/items-for-cogs` (§6.2).

#### AC-6 → Chấp nhận items[] khi submit SPECIFIC

- **Khi**: client submit form với mã đã thêm/xóa ở FE table (client-side, BE không tham gia thao tác thêm/xóa dòng).
- **BE phải**: validate `items[]` final list tại submit — ≤500 items, mỗi `productCode` unique, resolve tenant catalog.
- **Output**: `price_calc_run_item` rows INSERT (Phase 0, trạng thái `RUNNING`) cho mỗi productCode hợp lệ.
- **Failure mode**: `productCode` không resolve → 400 `ERR-CMN-validation`.
- **Ref**: BR-PRC-012 (§9), entity `PriceCalcRunItem` (§5.1).

#### AC-6b → Chỉ chấp nhận mã BQGQ "Đang hoạt động"

- **Khi**: lookup (AC-5) và submit (AC-6).
- **BE phải**: filter `pricingMethod=PWA AND status=ACTIVE` ở query `gf-inventory` (`internal-products/search`) cho lookup; revalidate lại trạng thái `ACTIVE` ở Phase 0 của workflow trước compute (không chỉ tại submit) — mã bị đổi "Ngừng hoạt động" giữa lúc chọn và lúc job chạy → tự bỏ qua (không phải lỗi).
- **Output**: `warningsSkippedItems` counter + `warningsMessages[]` trong response 202 (đếm mã bị skip do inactive).
- **Failure mode**: N/A (silent skip, không phải lỗi).
- **Ref**: BR-PRC-012 v34/BR-PRC-009 v40 (§9), field `price_calc_run.warnings_skipped_items` (§5.1).

### Cluster B — Engine BQGQ (Temporal workflow)

#### AC-7 → Tính đơn giá BQ per (mã+kho+garage)

- **Khi**: `ComputeItemActivity` chạy per item (Phase 2, fan-out parallel qua `Async.function()`).
- **BE phải**: (1) lấy tồn đầu kỳ (SL+GT) đến hết `fromDate − 1` qua `SnapshotPullActivity` (`GET /protected/v1/stock-ledgers/at-date`); (2) enumerate phiếu NHẬP trong kỳ (`POST /protected/v1/slips-in-period/search`) — công thức NHẬP = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua), theo SL quy đổi + GT; (3) tính `Đơn giá BQ = (GT tồn đầu + GT nhập) / (SL tồn đầu + SL nhập)`; mẫu số = 0 → đơn giá BQ = 0 (không phải lỗi); (4) làm tròn `HALF_UP` scale 2 **ngay sau khi tính** và dùng chính giá trị đã làm tròn để tính tiền vốn từng dòng xuất (giá vốn xuất = đơn giá BQ(2 lẻ) × SL quy đổi dòng xuất, làm tròn về đồng). Riêng "Xuất trả hàng mua" kế thừa giá nhập gốc (BR-IDV2-030), không theo đơn giá BQ.
- **Output**: `price_calc_run_item.average_unit_price` (scale 2), `openingQty/Value`, `receiptQty/Value`, `deliveryQty/Value`.
- **Failure mode**: xem AC-10 (mã lỗi).
- **Ref**: BR-PRC-001/002/003/006/012/013 (§9), entity `PriceCalcRunItem` (§5.1), ADR-027 §Phase 2.

#### AC-8 → Cập nhật giá vốn phiếu xuất + giá trị sổ tồn + log tổng hợp

- **Khi**: item đã chốt giá cuối (Phase 3-4).
- **BE phải**: (1) `BulkFillCostActivity` — batch `POST /protected/v1/delivery-lines/bulk-fill-cost` (chunk 500 lines, idempotency key `PRC-{runId}-FILL-{chunkIdx}`) điền `cost_unit_price`/`cost_value` cho phiếu Xuất bán/Xuất sửa chữa/Xuất khác thuộc phạm vi; (2) `BulkRecomputeLedgerActivity` — `POST /protected/v1/stock-ledgers/bulk-recompute` trigger cascade recompute giá trị tồn (GT, SL không đổi) từ `fromDate` trở đi cho (mã+kho) thuộc phạm vi (wraps BR-STKV2-005a); (3) `CommitRunActivity` — ghi log tổng hợp: `itemsResolvedCount`/`itemsDoneCount`/`itemsErrorCount`, chốt `price_calc_run.status`. Scope `ALL` không bắt buộc lưu full danh sách mã thành công — chỉ tổng hợp + mã lỗi.
- **Output**: `delivery_line.cost_unit_price/cost_value` (ghi ở gf-inventory qua S2S), `price_calc_run.progress_items_done`, `price_calc_run.status`.
- **Failure mode**: `gf-inventory` S2S 5xx → activity retry theo policy §8; hết retry → mã liên quan chốt `SYSTEM_ERROR` (AC-10), KHÔNG hard-fail toàn run.
- **Ref**: BR-PRC-005/016 (§9), endpoint `POST /protected/v1/delivery-lines/bulk-fill-cost` + `POST /protected/v1/stock-ledgers/bulk-recompute` (§6.4).

#### AC-8b → Lưu phiếu trước, chạy giá nền (202 kick-off, cập nhật dần)

- **Khi**: client POST `/api/v2/price-calc-runs`.
- **BE phải**: Phase 0 — validate guards (AC-2/AC-3/AC-13/AC-13b) trong 1 transaction ngắn → INSERT `price_calc_run` row `status=PENDING` → `WorkflowClient.start(PriceCalcRunWorkflow::execute, input)` với `workflowId = prc-{tenantId}-{runId}` (Critical Rule #8 deterministic), `taskQueue=PRC_TASK_QUEUE`, `WorkflowIdReusePolicy.REJECT_DUPLICATE`, `workflowExecutionTimeout=60min` → UPDATE `temporal_workflow_id` sau start → trả **HTTP 202** ngay (fire-and-forget, p95 ≤300ms). Workflow tự flip `PENDING → RUNNING` (`UpdateRunStatusActivity`, activity đầu tiên) rồi chạy Phase 1-5; mỗi item chốt giá xong → cập nhật kết quả mã đó ngay (không chờ toàn bộ run xong) — polling GET (`FEAT-PRC-DETAIL` tier) đọc tiến độ trực tiếp từ DB, không hit Temporal API.
- **Output**: response 202 `{runId, status: PENDING, pollingUrl, pollingIntervalHint: 5000, warningsSkippedItems, warningsMessages[], affectedSubsequentPeriods[]}`.
- **Failure mode**: Temporal Cloud outage → `WorkflowClient.start()` fail → 503 + compensating DELETE row (client retry with backoff).
- **Ref**: BR-PRC-016 (§9), entity `PriceCalcRun.status/temporal_workflow_id` (§5.1), endpoint (§6.1), ADR-028 §1-§2.

#### AC-9 → Không chặn tính tuần tự

- **Khi**: kỳ trước chưa có run nào (hoặc run FAILED/chưa chạy).
- **BE phải**: KHÔNG thực hiện bất kỳ guard nào kiểm tra "kỳ trước đã tính chưa" — `SnapshotPullActivity` luôn lấy tồn đến hết `fromDate − 1` trực tiếp từ `gf-inventory` sổ tồn hiện tại (đã phản ánh mọi biến động nhập/xuất kể cả của kỳ chưa tính giá).
- **Output**: N/A (absence-of-guard behaviour).
- **Failure mode**: N/A.
- **Ref**: BR-PRC-006 (§9).

#### AC-9b → Cảnh báo kỳ sau cần tính lại (cascade detection)

- **Khi**: post-commit, sau Phase 5 (CommitRunActivity).
- **BE phải**: query `price_calc_run` cho các period sau (`period.start_date > current_period.end_date`, cùng `warehouse_id`+`tenant_id`, `status ∈ {SUCCEEDED, COMPLETED_WITH_ERRORS}`) — reuse index `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates`, KHÔNG tự động trigger RECALC (non-blocking advisory).
- **Output**: response field `affectedSubsequentPeriods[]` (`periodId`, `periodName`, `lastRunId`, `lastRunStatus`) — populate ngay ở response 202 kick-off dựa trên trạng thái sổ *trước khi* chạy compute mới? — không: theo §6.1 (`ADR-027 §1.x`), populate sau Phase 5 commit; response 202 kick-off ban đầu có thể trả `[]` cho tới khi commit; UI/BFF polling GET DETAIL sẽ phản ánh field này khi run kết thúc theo pattern §6.2 DETAIL tier khác. BE của FEAT này chỉ chịu trách nhiệm compute + populate field, KHÔNG chịu trách nhiệm cascade tự động RECALC.
- **Failure mode**: N/A (advisory, không block CREATE thành công).
- **Ref**: BR-PRC-015 (§9), endpoint (§6.1).

### Cluster C — Error handling

#### AC-10 → Phân loại mã lỗi (enum 3 giá trị)

- **Khi**: `ComputeItemActivity` gặp lỗi cho 1 item.
- **BE phải**: phân loại theo enum `errorReason`: **NEGATIVE_STOCK** (`ERR-INV-030`, đang áp dụng — SL tồn của mã trong kỳ bị âm tại điểm bất kỳ; đây là invariant-guard defense-in-depth vì tồn âm đã bị chặn point-in-time ở mọi thao tác chạm tồn khác); **ACCOUNTING_MISMATCH** (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI] — module hạch toán chưa triển khai, hiện KHÔNG bắt lỗi này); **SYSTEM_ERROR** (`ERR-INV-052` — mã chưa tới lượt tính khi job gián đoạn/hết retry, log tự chốt "Hoàn thành có lỗi"). Item lỗi → KHÔNG cập nhật giá vốn/sổ tồn cho mã đó; các mã khác vẫn hoàn tất độc lập (per-item isolation trong fan-out).
- **Output**: `price_calc_run_item.status = ERROR`, `error_reason` enum, `error_message`.
- **Failure mode**: đã là failure-mode handling — không throw lên workflow level (per-item catch, KHÔNG fail toàn run).
- **Ref**: BR-PRC-007 (§9), entity `PriceCalcRunItem.error_reason` (§5.1).

### Cluster D — Guardrails & permission

#### AC-11 → N/A (UI-only)

- Nút "Hủy bỏ" đóng form không gọi BE. Xem `fe-web/FEAT-PRC-CREATE.md §3 AC-11`.

#### AC-12 → Phân quyền dual persona

- **Khi**: mọi request tới `POST /api/v2/price-calc-runs` + lookup endpoint.
- **BE phải**: cho phép cả 2 role `accountant` và `garage-owner` ngang quyền (không phân biệt); `executedBy`/`executedByName` = actor từ JWT security context của request thực hiện. **KHÔNG thêm `@PreAuthorize`/`@Secured`/`@EnableMethodSecurity`** — enforcement đi qua pattern hiện hữu của boundary: `@FeatureOn` class-level + tenant/branch scoping (`CR-20260801-08` APPROVED 2026-08-02; boundary hiện có **0** method-security annotation, precedent `AccountingPeriodController`).
- **Output**: `price_calc_run.executed_by = {actor.userId}`.
- **Failure mode**: 401 nếu JWT invalid; 403 nếu tenant mismatch **hoặc feature flag `Inventory:InventoryV2` OFF** (semantics `CR-20260707-02`); 400 nếu body validation fail. **KHÔNG** có 403 role-based — Critical Rule #6 quy định hệ thống chỉ tồn tại 2 persona và cả 2 ngang quyền, nên role gate là no-op. Nhất quán `FEAT-PRC-LIST §4.2` ("không thêm `@PreAuthorize` role-restrictive") + `FEAT-PRC-RECALC` AC-5 ("KHÔNG check role-based restriction").
- **Ref**: BR-AP-CMN-002 (§9), §4.2 Tenant + auth, `CR-20260801-08`.

#### AC-13 → Chặn chạy trùng (cùng kỳ + kho)

- **Khi**: Phase 0, trước INSERT row mới.
- **BE phải**: 3-layer concurrency guard — Layer 1: `SELECT ... FOR UPDATE` kiểm tra tồn tại run `status ∈ {PENDING, RUNNING}` cùng `(tenant_id, garage_id, warehouse_id, period_id)`; Layer 2: `WorkflowIdReusePolicy.REJECT_DUPLICATE` (Temporal defense-in-depth); Layer 3: partial unique index `uidx_prc_active_lock` (DB-level cuối cùng).
- **Output**: reject nếu vi phạm — không INSERT row mới.
- **Failure mode**: 409 `ERR-INV-029`.
- **Ref**: BR-PRC-016 (§9), index `uidx_prc_active_lock` (§5.2), endpoint (§6.1).

#### AC-13b → Chặn tính giá khi kỳ đã đóng

- **Khi**: Phase 0, cùng lúc AC-2 validate `periodId`.
- **BE phải**: kiểm `accounting_period.status = OPEN`; `CLOSED` → reject trước INSERT.
- **Output**: N/A (reject).
- **Failure mode**: 409 `ERR-INV-024`.
- **Ref**: BR-PRC-008/BR-AP-012 (§9), endpoint (§6.1).

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-PRC-001** (CORNERSTONE): công thức Đơn giá BQ = (GT tồn đầu + GT nhập)/(SL tồn đầu + SL nhập), theo (Mã+Kho+Garage), SL = SL quy đổi ĐVT chính — enforce tại `workflow/activity/ComputeItemActivity`. Vi phạm → sai số liệu tài chính, phát hiện qua reconciliation test.
- **BR-PRC-002/003/004** (CORNERSTONE): tồn đầu = tồn kho đến hết `fromDate−1` (không dồn/cộng thẳng); tồn cuối làm input cho kỳ sau tự nhiên qua re-query sổ tồn — enforce tại `SnapshotPullActivity`.
- **BR-PRC-005** (CORNERSTONE): cập nhật phiếu xuất + cập nhật sổ tồn (2 side-effect bắt buộc cùng lúc) — enforce tại `BulkFillCostActivity` + `BulkRecomputeLedgerActivity`.
- **BR-PRC-006** (NORMAL): không chặn tính tuần tự — enforce bằng absence-of-guard (không code check).
- **BR-PRC-007** (NORMAL): error reason enum 3 giá trị — enforce tại `ComputeItemActivity` catch block + `domain/enums/PriceCalcErrorReason`.
- **BR-PRC-008** (CORNERSTONE): chặn CREATE + RECALC nếu kỳ CLOSED — enforce tại `PriceCalcRunService` Phase 0 guard.
- **BR-PRC-009/012** (NORMAL): nguồn mã = catalog BQGQ + Đang hoạt động, revalidate tại thời điểm job start — enforce tại `SnapshotPullActivity` + `app/client/GfInventoryClient` (method `searchInternalProducts`).
- **BR-PRC-013** (CORNERSTONE): làm tròn đơn giá BQ 2 chữ số thập phân NGAY SAU KHI TÍNH, dùng chính giá trị đã làm tròn để tính tiền vốn — enforce tại `ComputeItemActivity` (BigDecimal `HALF_UP` scale 2 trước khi nhân SL).
- **BR-PRC-015** (NORMAL): cascade detection kỳ sau — enforce tại `CommitRunActivity` post-commit query.
- **BR-PRC-016** (CORNERSTONE): lưu phiếu trước chạy nền + chặn chạy trùng + durable resume — enforce tại `PriceCalcRunService.createRun()` (Phase 0) + Temporal workflow (durable execution).
- **BR-PRC-017** (CORNERSTONE): tính lặp hội tụ cho phiếu trả tự tham chiếu — enforce tại `ComputeItemActivity` (in-memory iteration, không persist per-iteration; `SAFETY_ITERATION_CAP=100`).
- **BR-AP-CMN-002** (NORMAL): dual persona ngang quyền — enforce tại Spring Security role check.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `POST /api/v2/price-calc-runs` + lookup endpoint: role `accountant` hoặc `garage-owner` — ngang quyền, không phân biệt thao tác (BR-AP-CMN-002).
- S2S REST outbound (`gf-inventory`) dùng `x-api-key` cho **cả 6** endpoint; header `X-Tenant-Id` pass-through từ request inbound. `internal-products/search` (`V2-7`, namespace `/api/v2/*`) **đã chốt** cũng nhận `x-api-key` — **CR-20260801-03 APPROVED (option (a)), 2026-08-02**, nhất quán với 5 call `/protected/v1/*` còn lại; xem §6.4.

### 4.3 Idempotency + concurrency

- Kick-off: `X-Idempotency-Key: PRC-CREATE-{tenantId}-{periodId}-{warehouseId}-{clientNonce}` REQUIRED — duplicate trong window 5 phút trả **cùng runId** với HTTP 200 (không 202); guard ở HTTP layer (Spring interceptor + Redis 5-min TTL) TRƯỚC `WorkflowClient.start()`.
- Concurrency 3-layer (§3 AC-13): DB `SELECT FOR UPDATE` + `WorkflowIdReusePolicy.REJECT_DUPLICATE` + partial unique index `uidx_prc_active_lock`.
- S2S write calls (`bulk-fill-cost`, `bulk-recompute`) dùng `X-Idempotency-Key = "PRC-{runId}-{phase}"` — `gf-inventory` reject duplicate qua inbox-like guard phía nhận.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-2/3/4/6 | TOAST |
| `ERR-INV-024` (period CLOSED) | 409 | AC-13b | TOAST |
| `ERR-INV-029` (run in progress) | 409 | AC-13 | TOAST |
| Temporal outage | 503 | AC-8b | TOAST (retry with backoff) |
| `ERR-INV-030` (Do tồn âm) | — (item-level, không HTTP error) | AC-10 | INLINE (bảng chi tiết — tier DETAIL) |
| `ERR-INV-031` (Lệch hạch toán, tương lai) | — | AC-10 | INLINE |
| `ERR-INV-052` (Do sự cố hệ thống) | — (item-level) | AC-10 | INLINE |

---

## 5. Schema delta (BE — contract focus)

> Full DDL SSOT: `Architecture/data/gf-accounting-data-model.md §2quater`. `ddl-auto=update` boundary (Common Gotcha #5) — KHÔNG viết Flyway migration file, schema tự sinh từ entity.

### 5.1 Entity changes — `gf-accounting` (2 bảng mới)

| Entity | Key columns | Nullable/Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|
| `price_calc_run` | `id, tenant_id, garage_id, period_id, period_name_snapshot, from_date, to_date, warehouse_id/code/name, pricing_method(PWA), scope(ALL\|SPECIFIC), scope_predicate(JSONB), items_snapshot(JSONB), **`run_scope VARCHAR(20)`**, source_run_id, status(PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS), temporal_workflow_id, progress_items_total/done, items_resolved/done/error_count, warnings_skipped_items, executed_by/at, completed_at, error_summary, deleted_at/by` | `status` default `PENDING`; `deleted_at` nullable; **`run_scope` nullable — NULL cho row CREATE**, chỉ set `ALL \| ERROR_ONLY` khi row sinh từ RECALC (audit BR-PRC-008 v29) | ddl-auto=update | BR-PRC-001/008/009/014/016 | AC-2, AC-3, AC-4, AC-8b, AC-13, AC-13b | Aggregate root — log lần tính |
| `price_calc_run_item` | `id, tenant_id, run_id, product_code/id/name, main_unit_code, opening_qty/value, receipt_qty/value, delivery_qty/value, average_unit_price(scale 2), updated_delivery_slip_count, status(RUNNING\|DONE\|ERROR), error_reason(NEGATIVE_STOCK\|ACCOUNTING_MISMATCH\|SYSTEM_ERROR), error_message, iterations_applied, has_self_reference, computed_at` | `status` default `RUNNING` | ddl-auto=update | BR-PRC-005/007/013/017 | AC-6, AC-7, AC-8, AC-10 | Per-item log line |

> **Boundary migration policy**: `ddl-auto=update` bắt buộc cho `gf-accounting` (KHÔNG Flyway) — khác các boundary khác dùng Flyway V{N+1}.
>
> **§5.x là mirror của SSOT `Architecture/data/gf-accounting-data-model.md §2quater` — khi lệch, SSOT thắng.** (`CR-20260801-11`, 2026-08-02). DEV PHẢI đối chiếu SSOT trước khi tạo entity; bảng dưới đây là bản rút gọn cho tiện đọc, không thay thế SSOT.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `price_calc_run` | `uidx_prc_active_lock` | `(tenant_id, garage_id, warehouse_id, period_id) WHERE status IN ('PENDING','RUNNING')` | partial UNIQUE | Layer 3 concurrency guard chặn chạy trùng (AC-13) | ADR-027 |
| `price_calc_run` | `idx_prc_run_tenant_garage_wh` | `(tenant_id, garage_id, warehouse_id, executed_at DESC)` | btree | LIST default sort + cascade detection query (AC-9b) | — |
| `price_calc_run` | `idx_prc_run_tenant_period` | `(tenant_id, period_id, status)` | btree | Cascade detection + period-scoped lookup | — |
| `price_calc_run_item` | `idx_prc_item_run` | `(tenant_id, run_id, status)` | btree | DETAIL filter + polling | — |
| `price_calc_run_item` | `idx_prc_item_run_product` | `(tenant_id, run_id, product_code)` | btree | Uniqueness lookup `(tenant_id, run_id, product_code)` | — |
| `price_calc_run_item` | `idx_prc_item_error` | `(tenant_id, run_id) WHERE status = 'ERROR'` | partial btree | RECALC `ERROR_ONLY` scope (BR-PRC-008 v29) — filter mã lỗi để re-run; tránh full-scan item table | ADR-027 |

**CHECK constraints** (đủ 10, copy verbatim từ SSOT `gf-accounting-data-model.md` §2quater.1 + §2quater.2 — `CR-20260801-11`):

`price_calc_run` (6):
- `chk_prc_scope` — `scope IN ('ALL','SPECIFIC')`
- `chk_prc_status` — `status IN ('PENDING','RUNNING','SUCCEEDED','COMPLETED_WITH_ERRORS')`
- `chk_prc_run_scope` — `run_scope IS NULL OR run_scope IN ('ALL','ERROR_ONLY')`
- `chk_prc_progress` — `progress_items_done <= progress_items_total`
- `chk_prc_dates` — `to_date >= from_date`
- `chk_prc_source_run_recalc` — `(run_scope IS NULL AND source_run_id IS NULL) OR (run_scope IS NOT NULL AND source_run_id IS NOT NULL)` — RECALC must have both

`price_calc_run_item` (4):
- `chk_prc_item_status` — `status IN ('RUNNING','DONE','ERROR')`
- `chk_prc_item_error_reason` — `error_reason IS NULL OR error_reason IN ('NEGATIVE_STOCK','ACCOUNTING_MISMATCH','SYSTEM_ERROR')`
- `chk_prc_item_status_reason` — `(status = 'ERROR' AND error_reason IS NOT NULL) OR (status <> 'ERROR' AND error_reason IS NULL)` — invariant coupling; **đây là Layer 3 enforce BR-PRC-007** (`FEAT-PRC-RECALC` §4.1 + §5.2 viện dẫn trực tiếp)
- `chk_prc_item_iterations` — `iterations_applied >= 0 AND iterations_applied <= 100` (SAFETY_CAP per ADR-027 §3)

> ⚠️ Boundary dùng `ddl-auto=update`: Hibernate **không chắc** sinh partial index (`idx_prc_item_error`) và CHECK constraint tự động. DEV phải verify sau lần khởi động đầu và bổ sung thủ công nếu thiếu (đã có trong DoD checklist §7 của warm-up report W06).

## 6. API contract delta (BE — REST + cross-boundary)

> Endpoint contract **verified verbatim** against `Architecture/api/gf-accounting-api.md` §5.3 + §5.6 (SSOT — bundle §G API extract was stale/mismatched section, fallback direct read performed per F-7 discipline). Verified gốc tại v24; file đã bump lên **v26** qua `CR-20260801-02` (§5.2) + `CR-20260801-09` (§5.1) — cả 2 Change Log đều xác nhận **KHÔNG đụng §5.3/§5.6** nên nội dung verified vẫn còn hiệu lực, không cần re-verify.

### 6.1 New REST endpoint — `POST /api/v2/price-calc-runs` (W06-3, CREATE / kick-off)

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/price-calc-runs` | authenticated (dual persona) | `{periodId, warehouseId, pricingMethod: "PWA", scope: "ALL"\|"SPECIFIC", items?: [{productCode}]}` | 202: `{runId, status: "PENDING", createdAt, pollingUrl, pollingIntervalHint: 5000, warningsSkippedItems, warningsMessages[], affectedSubsequentPeriods[]}`; 200 (idempotent replay): same shape + `idempotentReplay: true` | `X-Idempotency-Key: PRC-CREATE-{tenantId}-{periodId}-{warehouseId}-{clientNonce}` REQUIRED, window 5min | AC-2..AC-9b, AC-13, AC-13b | — |

**Errors**: 400 (`ERR-CMN-validation` — periodId/warehouseId invalid, items empty khi SPECIFIC, items>500) · 404 (period/warehouse không tenant scope) · 409a `ERR-INV-024` (period CLOSED) · 409b `ERR-INV-029` (run-in-progress) · 503 (Temporal outage, compensating DELETE row).

### 6.2 New REST endpoint — `POST /api/v2/price-calc-runs/lookup/items-for-cogs` (W06-6, lookup)

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/price-calc-runs/lookup/items-for-cogs` | authenticated | `{periodId, warehouseId, keyword?, page?, size?}` | `{content: [{productCode, productName, mainUnitCode, hasDeliveryInPeriod, deliveryCountInPeriod, lastCalculatedAt}], totalElements, totalPages, page, size}` | safe (read) | AC-5, AC-6, AC-6b | — |

**Errors**: `ERR-CMN-validation`/`not-found`.

### 6.3 Kafka topics (publish/consume)

- **Không có** — PRC hoàn toàn REST (S2S) + Temporal workflow, không publish/consume Kafka event.

### 6.4 Cross-boundary REST consumers (gf-accounting → other boundaries)

| Endpoint consumed | Owner boundary | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/stock-ledgers/at-date?warehouseId=&asOfDate=&productCodes=` | `gf-inventory` | Phase 1 `SnapshotPullActivity` | retry, item ERROR nếu hết retry | `RetryPolicy(initial=1s, backoff=2.0, max=5, maxAttempts=5)` |
| `POST /protected/v1/slips-in-period/search` | `gf-inventory` | Phase 1 `SnapshotPullActivity` | retry, item ERROR nếu hết retry | cùng policy trên |
| `POST /api/v2/internal-products/search?pricingMethod=PWA&status=ACTIVE` | `gf-inventory` | Phase 1 (scope ALL resolve, catalog InternalProduct) | retry | Spring Retry 3 lần, exponential backoff. **Auth: `x-api-key` — ĐÃ CHỐT (`CR-20260801-03` APPROVED option (a), 2026-08-02)**: `V2-7` chấp nhận `x-api-key` bên cạnh JWT, nên `GfInventoryClient` dùng **một** cơ chế auth duy nhất cho cả 6 call, nhất quán 5 endpoint `/protected/v1/*` (§4.2). Bắt buộc kèm header `X-Tenant-Id` (api-key không mang tenant claim). KHÔNG thêm route `/protected/v1/internal-products/search`. Ref: `Architecture/api/gf-inventory-api.md` v79 §3a.2 V2-7 + `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v4 §4.6. |
| `POST /protected/v1/delivery-lines/bulk-fill-cost` | `gf-inventory` | Phase 3 `BulkFillCostActivity`, chunk 500 lines | retry robust cho 5xx | activity retry + `X-Idempotency-Key: PRC-{runId}-FILL-{chunkIdx}` |
| `POST /protected/v1/receipt-lines/bulk-inherit-cost` | `gf-inventory` | Phase 3 `BulkInheritCostActivity` — kế thừa giá nhập gốc cho "Xuất trả hàng mua" (không theo đơn giá BQ, xem AC-7) | retry robust cho 5xx | activity retry + `X-Idempotency-Key: PRC-{runId}-INHERIT-{chunkIdx}` |
| `POST /protected/v1/stock-ledgers/bulk-recompute` | `gf-inventory` | Phase 4 `BulkRecomputeLedgerActivity` | retry | activity retry + `X-Idempotency-Key: PRC-{runId}-RECOMPUTE-{chunkIdx}` |

> **Hand-off tới BFF**: `agg-garage-graph` FEAT tier (`features/bff/FEAT-PRC-CREATE.md`) wrap `POST /api/v2/price-calc-runs` thành GraphQL mutation `priceCalcRunCreate` + `POST /lookup/items-for-cogs` thành query `priceCalcItemsForCogsLookup` (op name verbatim theo `agg-garage-graph-graphql.md` §2 rows #362/#365 — KHÔNG phải `runPriceCalc`/`getItemsForCogs`). KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> **Package convention (chốt cho W06 — `CR-20260801-06` APPROVED 2026-08-02)**: theo **hiện trạng repo `gf-accounting`** + precedent `gf-sales`, KHÔNG theo `rules-backend` §1 canonical (canonical ghi `adapter/persistence/`, lệch với cả 14 repo — reconcile là follow-up sau wave).
> - JPA entity / repository-impl / Spring Data interface / mapper → **`infrastructure/persistence/{entity,jpa,repository,mapper}/`** (repo hiện có; `adapter/` chỉ gồm `{client, config, controller}`, **không có** `adapter/persistence`).
> - Temporal workflow + activity → **top-level `com/actechx/gf/workflow/`** + `workflow/impl/` + `workflow/activity/` (precedent `services/gf-sales/src/main/java/com/actechx/gf/workflow/{activity,impl}/`), **không** nằm dưới `app/`.
> - **Ngoại lệ có chủ đích — `GfInventoryClient`**: quyết định của Delivery (sonhoang, 2026-08-02) — client này tạo **package mới `app/client/`**, KHÔNG dùng lại `adapter/client/` (nơi đang chứa `GfSalesClient.java` + `TenantClient.java`, verified). Đây là lệch có chủ đích với convention client hiện hữu (khác với 2 mục trên — vốn là "đi theo hiện trạng repo"); ghi rõ lại để DEV không nhầm là drift/lỗi review. Nếu sau này có client REST-outbound khác cho W07+, cần re-confirm nên theo `app/client/` (pattern mới) hay `adapter/client/` (pattern cũ) — chưa có quy tắc chung cho việc này.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/PriceCalcRun.java` | NEW | new aggregate root | ~120 | AC-2..AC-13b |
| `domain/model` | `src/main/java/.../domain/model/PriceCalcRunItem.java` | NEW | new entity | ~60 | AC-6, AC-7, AC-8, AC-10 |
| `domain/enums` | `src/main/java/.../domain/enums/PriceCalcRunStatus.java` | NEW | enum | ~10 | AC-8b, AC-9b |
| `domain/enums` | `src/main/java/.../domain/enums/PriceCalcErrorReason.java` | NEW | enum | ~10 | AC-10 |
| `domain/repository` | `src/main/java/.../domain/repository/PriceCalcRunRepository.java` | NEW | new finder + `FOR UPDATE` guard | ~30 | AC-13 |
| `app/service` | `src/main/java/.../app/service/PriceCalcRunService.java` | NEW | Phase 0 guards + `WorkflowClient.start()` | ~150 | AC-2, AC-3, AC-4, AC-8b, AC-13, AC-13b |
| `workflow` | `src/main/java/com/actechx/gf/workflow/PriceCalcRunWorkflow.java` (interface) + `workflow/impl/PriceCalcRunWorkflowImpl.java` | NEW | Temporal workflow definition | ~200 | AC-7, AC-8, AC-8b, AC-9b |
| `workflow/activity` | `src/main/java/com/actechx/gf/workflow/activity/PriceCalcActivities.java` (interface) + `PriceCalcActivitiesImpl.java` | NEW | 7 activities: SnapshotPull / UpdateRunStatus / ComputeItem / BulkFillCost / BulkInheritCost / BulkRecomputeLedger / CommitRun | ~350 | AC-7, AC-8, AC-9b, AC-10 |
| `app/client` | `src/main/java/.../app/client/GfInventoryClient.java` | NEW | RestClient bean cho stock-ledgers + slips + bulk-fill-cost + bulk-inherit-cost + bulk-recompute + internal-products/search (catalog) | ~150 | AC-4, AC-5, AC-6b, AC-7, AC-8 |
| `adapter/controller` | `src/main/java/.../adapter/controller/PriceCalcRunController.java` | NEW | CREATE + lookup endpoints (SHARED file — sibling FEAT-PRC-LIST/DETAIL/RECALC/DELETE thêm methods khác vào cùng controller) | ~60 (phần CREATE+lookup) | AC-2..AC-13b |
| `infrastructure/persistence` | `src/main/java/com/actechx/gf/infrastructure/persistence/jpa/PriceCalcRunJpaRepository.java` + `PriceCalcRunItemJpaRepository.java`; entity tại `infrastructure/persistence/entity/`, repository-impl tại `infrastructure/persistence/repository/`, mapper tại `infrastructure/persistence/mapper/` | NEW | Spring Data JPA | ~20 | — |
| `adapter/config` | `src/main/java/.../adapter/config/TemporalWorkerConfig.java` | NEW | đăng ký worker `PRC_TASK_QUEUE` (Temporal worker đầu tiên trong gf-accounting) | ~40 | AC-8b |
| `test/unit` | `src/test/java/.../app/service/PriceCalcRunServiceTest.java` + `PriceCalcActivitiesImplTest.java` | NEW | unit test Phase 0 guards + compute formula | ~250 | AC-2..AC-13b |
| `test/contract` | `src/test/java/.../adapter/controller/PriceCalcRunControllerContractTest.java` | NEW | contract test CREATE + lookup | ~100 | AC-2, AC-13, AC-13b |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema (ddl-auto=update) entity PriceCalcRun + PriceCalcRunItem
    Entry: KG.entities stable (data-model §2quater)
    Exit: schema auto-generated local, no migration test needed (ddl-auto)
    └─► S2

S2  Domain + Service + Temporal workflow/activities (BR enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green (guards + formula BR-PRC-001/013/016/017)
    └─► S3

S3  REST adapter (controller) + client REST bean (GfInventoryClient)
    Entry: S2
    Exit: contract test green (202/200/400/404/409/503)
    └─► S4

S4  Integration test (Temporal workflow E2E + cross-boundary REST gf-inventory)
    Entry: S3 + gf-inventory endpoints stable (stock-ledgers/at-date, slips-in-period/search, bulk-fill-cost, bulk-inherit-cost, bulk-recompute, internal-products/search)
    Exit: integ test green (kick-off → workflow → items DONE/ERROR → sổ tồn cập nhật)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Entity `PriceCalcRun`/`PriceCalcRunItem` (ddl-auto) | domain/model | data-model stable | Schema auto-generated | — |
| S2 | Service Phase 0 guards + Workflow/Activities | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter + client beans | adapter/controller + app/client | S2 | Contract test green | S2 |
| S4 | Integration test (Temporal + S2S) | test/integration | S3 + counterpart endpoints | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-PRC-001` | CORNERSTONE | domain (primary) — `ComputeItemActivity` | `workflow/activity/PriceCalcActivitiesImpl.java::computeItem()` | AC-7 | `TC-BR-gf-accounting-PRC-001-*` |
| `BR-PRC-002/003/004` | CORNERSTONE | workflow/activity | `SnapshotPullActivity` | AC-7, AC-9 | `TC-BR-gf-accounting-PRC-002-*` |
| `BR-PRC-005` | CORNERSTONE | workflow/activity | `BulkFillCostActivity` + `BulkRecomputeLedgerActivity` | AC-8 | `TC-BR-gf-accounting-PRC-005-*` |
| `BR-PRC-006` | NORMAL | service (absence-of-guard) | `PriceCalcRunService.createRun()` | AC-9 | `TC-BR-gf-accounting-PRC-006-*` |
| `BR-PRC-007` | NORMAL | workflow/activity | `ComputeItemActivity` catch block | AC-10 | `TC-BR-gf-accounting-PRC-007-*` |
| `BR-PRC-008` | CORNERSTONE | service | `PriceCalcRunService.validateGuards()` | AC-13b | `TC-BR-gf-accounting-PRC-008-*` |
| `BR-PRC-009/012` | NORMAL | app/client + workflow/activity | `GfInventoryClient` + `SnapshotPullActivity` (scope resolve) | AC-4, AC-6b | `TC-BR-gf-accounting-PRC-009-*` |
| `BR-PRC-013` | CORNERSTONE | workflow/activity | `ComputeItemActivity` (BigDecimal HALF_UP scale 2) | AC-7 | `TC-BR-gf-accounting-PRC-013-*` |
| `BR-PRC-015` | NORMAL | workflow/activity | `CommitRunActivity` cascade query | AC-9b | `TC-BR-gf-accounting-PRC-015-*` |
| `BR-PRC-016` | CORNERSTONE | service + Temporal (primary) | `PriceCalcRunService.createRun()` + `PriceCalcRunWorkflowImpl` | AC-8b, AC-13 | `TC-BR-gf-accounting-PRC-016-*` |
| `BR-PRC-017` | CORNERSTONE | workflow/activity | `ComputeItemActivity` (in-memory iteration, cap 100) | AC-7 | `TC-BR-gf-accounting-PRC-017-*` |
| `BR-AP-CMN-002` | NORMAL | adapter/controller (Spring Security) | `PriceCalcRunController` | AC-12 | `TC-BR-gf-accounting-PRC-CMN-002-*` |

> **Enforcement layer priority**: Primary phải ở `domain/` hoặc `app/service`/`workflow/activity` (SSOT). UI/client-side enforcement → FE tier secondary (xem §11).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2/AC-13b | API contract (negative) | test-api | period CLOSED / not-found guard |
| AC-4/AC-6/AC-6b | Unit (scope resolve) + API contract | test-api | ALL vs SPECIFIC, active-status revalidate |
| AC-5 | API contract | test-api | lookup pagination + slip-count compose |
| AC-7 | Unit (formula, HALF_UP rounding) | test-api | BR-PRC-001/013 — precision-critical |
| AC-7 (BR-PRC-017) | Unit (convergent iteration) | test-api | mock self-reference return slip, verify convergence + cap 100 |
| AC-8 | Integration (cross-boundary S2S bulk-fill-cost/recompute) | test-api | `gf-accounting` ↔ `gf-inventory` |
| AC-8b | Integration (Temporal workflow E2E) | test-api | kick-off → PENDING→RUNNING→terminal, poll DB state |
| AC-9b | Unit (cascade query) | test-api | verify affectedSubsequentPeriods populate đúng index |
| AC-10 | Unit (error classification) | test-api | 3-enum error reason, per-item isolation (không fail toàn run) |
| AC-12 | Isolation (RBAC) | test-isolation | dual persona both allowed |
| AC-13 | Integration (concurrency) | test-api | parallel POST cùng (kỳ+kho) → 1 thành công, 1 → 409 |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-CREATE.md` | **AUTHORED** (đã tồn tại) | Resolver wrap §6.1-§6.2 endpoints thành `priceCalcRunCreate` mutation + `priceCalcItemsForCogsLookup` query (op name verbatim theo `agg-garage-graph-graphql.md` §2 #362/#365) |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-CREATE.md` | **AUTHORED** (đã tồn tại) | UI form consume BFF ops; AC-1/AC-11 (UI-only) implement tại đây |
| Mobile | N/A | N/A | PRC là web-only feature (PKG-W06 §1 — mobile chỉ `FEAT-STK-LIST-V2`) |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 7d04d01e05296720c7417fe693dd1184b570b5d9d44637571142c8d5c2995a35`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-CREATE.md`](../../../../../Product/features/FEAT-PRC-CREATE.md) v32
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.2 (BR-PRC-001..018)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md) §11
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) v24 §5.3, §5.6
- **Data model**: `Architecture/data/gf-accounting-data-model.md` §2quater
- **ADR**: `ADR-027-bqgq-engine-and-convergent-iteration.md` (engine 5-phase + iteration), `ADR-028-prc-async-execution-sync-http-plus-background-thread.md` (Temporal workflow v2)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 6 | main-agent (post final-review fix, approver sonhoang) | **Fix citation lỗi thời (finding non-blocking từ review độc lập).** §6 header — bỏ số version cứng "v24", note rõ verified gốc tại v24 nhưng file đã bump lên v26 (`CR-20260801-02` §5.2 + `CR-20260801-09` §5.1), cả 2 Change Log xác nhận KHÔNG đụng §5.3/§5.6 nên nội dung verified vẫn hiệu lực. **KHÔNG đụng**: nội dung §6.1+ (endpoint contract giữ nguyên). 5 → 6. |
| 2026-08-02 | 5 | main-agent (post final-review fix, approver sonhoang) | **Fix 2 finding từ review độc lập sau CR batch (không phải CR mới — sửa theo chỉ đạo trực tiếp user).** (1) §4.1 BR-PRC-001 bullet — `app/activity/ComputeItemActivity` → `workflow/activity/ComputeItemActivity` (sót lại từ CR-06/CR-10, các chỗ khác đã sửa). (2) §7 blockquote package convention — thêm bullet **"Ngoại lệ có chủ đích — `GfInventoryClient`"**: xác nhận `app/client/` là package MỚI có chủ đích cho client này (KHÔNG dùng lại `adapter/client/` hiện hữu chứa `GfSalesClient`/`TenantClient`) — quyết định user (sonhoang) 2026-08-02, không phải drift. **KHÔNG đụng**: đường dẫn `app/client/GfInventoryClient.java` tại §7 table (`:369`) + §9 (`:417`) — giữ nguyên theo quyết định. 4 → 5. |
| 2026-08-02 | 4 | main-agent (CR batch W06, approver sonhoang) | **Apply 5 CR APPROVED — `CR-20260801-03/06/07(indirect)/08/10/11`.** (1) `CR-20260801-03` (option a): gỡ 2 cờ **NEED CONFIRMATION** về S2S auth cho `V2-7 POST /api/v2/internal-products/search` (§4.2 bullet + §6.4 REST consumers row) — chốt `x-api-key` + header `X-Tenant-Id`, nhất quán 5 endpoint `/protected/v1/*`; cite `gf-inventory-api.md` v79 + `INTEG-EXT-gf-accounting-gf-inventory.md` v4 §4.6. (2) `CR-20260801-06`: §7 File/module impact map — `adapter/persistence/` → `infrastructure/persistence/{entity,jpa,repository,mapper}/`; `app/workflow/` + `app/activity/` → top-level `com/actechx/gf/workflow/` + `workflow/impl/` + `workflow/activity/`; thêm blockquote ghi chú package convention chốt theo hiện trạng repo + precedent `gf-sales`; đồng thời §9 BR enforcement table sửa 8 nhãn layer `app/activity` → `workflow/activity` cho nhất quán trong cùng file (gồm 1 file path thật `app/activity/PriceCalcActivitiesImpl.java`). (3) `CR-20260801-08`: AC-12 — bỏ Failure mode "role khác 2 role trên → 403", ghi rõ KHÔNG thêm `@PreAuthorize`/`@Secured`/`@EnableMethodSecurity`, enforce qua `@FeatureOn` + tenant scoping; 403 chỉ còn từ tenant mismatch / feature-flag OFF (`CR-20260707-02`); align `FEAT-PRC-LIST §4.2` + `FEAT-PRC-RECALC` AC-5. (4) `CR-20260801-10`: §4.1 BR-PRC-009/012 row `GfErpMdmClient` → `GfInventoryClient` (+ `app/activity` → `workflow/activity`); §11 Cross-tier — BFF + FE Web từ "N/A (chưa author)" → **AUTHORED**, và note §11 dùng op name mới `priceCalcRunCreate`/`priceCalcItemsForCogsLookup`. (5) `CR-20260801-11`: §5.1 thêm cột `run_scope VARCHAR(20)` (nullable, NULL cho row CREATE, audit `ALL\|ERROR_ONLY` cho RECALC — BR-PRC-008 v29); §5.2 thêm index `idx_prc_item_error` `(tenant_id, run_id) WHERE status='ERROR'` (partial) + sub-block liệt kê đủ **10 CHECK constraint** copy verbatim từ SSOT (`chk_prc_scope/status/run_scope/progress/dates/source_run_recalc` + `chk_prc_item_status/error_reason/status_reason/iterations`) + cảnh báo `ddl-auto=update` không chắc sinh partial index/CHECK; thêm dòng "§5.x là mirror của SSOT `gf-accounting-data-model.md §2quater` — khi lệch, SSOT thắng". **KHÔNG đụng**: AC khác, §6 API contract shape, §8 DAG, §12 References. 3 → 4. |
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa endpoint bịa/nhầm boundary cho "resolve mã BQGQ Đang hoạt động"** — `GET /internal-products/search (gf-erp-mdm)` (không tồn tại — `gf-erp-mdm-api.md` không có route `internal-products`) → `POST /api/v2/internal-products/search` (**`gf-inventory`**, endpoint thật V2-7, mở rộng additive v77 thêm filter `pricingMethod`). Sửa 8 vị trí: frontmatter `boundaries_affected`/`consumes_contracts`, Metadata table, §2, AC-4, AC-5 (bỏ mô tả "cross-boundary compose 2 boundary" — giờ cả 2 REST call đều target `gf-inventory`), AC-6b, §4.1 BR-PRC-009/012 enforcement layer (`GfErpMdmClient` → gộp vào `GfInventoryClient`), §6.4 REST consumers table, §7 file impact map, §8 DAG. Đồng thời: (a) bổ sung row thiếu `POST /protected/v1/receipt-lines/bulk-inherit-cost` (W06-P4) vào §6.4 — đã dùng ở AC-7 nhưng chưa liệt kê; (b) sửa "Hand-off tới BFF" note dùng sai tên GraphQL op (`runPriceCalc`/`getItemsForCogs` → `priceCalcRunCreate`/`priceCalcItemsForCogsLookup`, verbatim theo `agg-garage-graph-graphql.md` §2 #362/#365); (c) đồng bộ `version` frontmatter khớp Change Log (đã có row 2 nhưng frontmatter dừng ở 1 — vi phạm 3-in-1). Cascade Architecture: `Architecture/api/gf-inventory-api.md` v76→v77 (CR-20260731-03 self-approved MINOR, additive `pricingMethod` filter+field trên V2-7). Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-PRC-CREATE` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map per AC-ID (17/17 covered — AC-1/AC-11 N/A UI-only), §4 ràng buộc + error code, §5-§11 BE-specific (schema ddl-auto/2 entity mới, REST CREATE+lookup contract verified verbatim vs `gf-accounting-api.md` v24 §5.3/§5.6 sau khi bundle §G API extract phát hiện stale/wrong-section, Temporal workflow S1-S4, BR-PRC-* SSOT primary, test scope, cross-tier pair). Source FEAT chỉ audit. |
