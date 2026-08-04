---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-PRC-RECALC.md"
source_version: 21
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-RECALC"
source_feat_sha: "ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f"
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
demo_signature: "Kế toán bấm 'Tính lại' (toàn bộ hoặc chỉ mã lỗi) trên 1 lần tính PRC đã hoàn tất → hệ thống tạo run mới (audit trail), ghi đè giá vốn phiếu xuất + giá trị sổ tồn, cảnh báo kỳ sau bị ảnh hưởng"
consumes_contracts:
  - "GET gf-inventory /protected/v1/stock-ledgers/at-date"
  - "POST gf-inventory /protected/v1/slips-in-period/search"
  - "POST gf-inventory /protected/v1/delivery-lines/bulk-fill-cost"
  - "POST gf-inventory /protected/v1/stock-ledgers/bulk-recompute"
  - "POST gf-inventory /api/v2/internal-products/search"
  - "POST gf-inventory /protected/v1/receipt-lines/bulk-inherit-cost"
paired_bff_feats: ["FEAT-PRC-RECALC"]
paired_fe_web_feats: ["FEAT-PRC-RECALC"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "unavailable — no hash tool in author sandbox"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-RECALC.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-02"
---

# FEAT-PRC-RECALC (BE): Tính lại giá vốn cho lần tính PRC đã có

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-RECALC` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting`, `gf-inventory` (S2S read/write + catalog re-resolve `internal-products/search` khi `runScope=ALL`) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán bấm "Tính lại" (toàn bộ hoặc chỉ mã lỗi) trên 1 lần tính PRC đã hoàn tất → hệ thống tạo run mới (audit trail), ghi đè giá vốn phiếu xuất + giá trị sổ tồn, cảnh báo kỳ sau bị ảnh hưởng |
| Cross-tier pair | BFF: `features/bff/FEAT-PRC-RECALC.md` (**AUTHORED**) \| Web: `features/fe-web/FEAT-PRC-RECALC.md` (**AUTHORED**) \| Mobile: N/A (PRC web-only) — xem §11 |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-RECALC` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) |
| Source version | v21 |
| Source SHA | `ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f` |
| Generated at | 2026-07-31T07:20:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần tính lại giá vốn cho một lần tính PRC đã có, khi dữ liệu đầu vào phát sinh thay đổi sau khi lần tính gốc đã hoàn tất (vd phiếu nhập/xuất bổ sung, sửa dữ liệu tồn). Tính năng cho phép chọn tính lại toàn bộ mã hoặc chỉ những mã đang lỗi, đảm bảo giá vốn phiếu xuất và giá trị sổ tồn được cập nhật đúng mà không mất dấu vết audit của lần tính gốc. Feature nằm ở cuối vòng đời một lần tính giá xuất kho BQGQ — tiếp nối FEAT-PRC-CREATE/FEAT-PRC-DETAIL, cung cấp đường sửa sai khi phát hiện dữ liệu đầu vào chưa chuẩn.

## 2. Trách nhiệm backend (`gf-accounting`)

- Nhận request `POST /api/v2/price-calc-runs/{id}/recalc` với `runScope ∈ {ALL, ERROR_ONLY}`; validate run nguồn (terminal status, period chưa CLOSED, không có run active cùng period+warehouse) trước khi tạo bất kỳ side-effect nào.
- Tạo row `price_calc_run` **mới** (không mutate run gốc) với `source_run_id` trỏ về run gốc — giữ nguyên audit trail (BR-PRC-010).
- Copy-forward `price_calc_run_item` từ run gốc sang run mới theo `runScope`: `ALL` reset toàn bộ item về `RUNNING` để recompute; `ERROR_ONLY` chỉ reset item `ERROR`, giữ nguyên item `DONE`.
- Khởi động lại Temporal workflow `PriceCalcRunWorkflow` (workflow ID mới `prc-{tenantId}-{newRunId}`) trên task queue `PRC_TASK_QUEUE`, tái sử dụng cùng 7-activity engine BQGQ với FEAT-PRC-CREATE.
- Ghi đè giá vốn phiếu xuất (S2S `gf-inventory` bulk-fill-cost) + giá trị sổ tồn (S2S `gf-inventory` bulk-recompute) cho các mã thuộc phạm vi RECALC.
- Enforce BR-PRC-008 (chặn CLOSED) + BR-PRC-016 (chặn run active trùng) là primary SSOT tại service layer — áp dụng đồng nhất cho cả nút Create lẫn Recalc.
- Phát hiện + trả về cảnh báo non-blocking `affectedSubsequentPeriods[]` (BR-PRC-015) cho các kỳ sau đã có lần tính giá thành công.
- KHÔNG cần migration schema mới — dùng chung 2 bảng `price_calc_run` / `price_calc_run_item` đã thiết kế tại `gf-accounting-data-model.md` v14 §2quater (được tạo cùng FEAT-PRC-CREATE); `ddl-auto=update`.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Trigger & Guard

#### AC-1 → Trigger tính lại toàn bộ (`runScope=ALL`)

- **Khi**: client `POST /api/v2/price-calc-runs/{id}/recalc` với body `{"runScope":"ALL"}`, `id` là run nguồn đã terminal (`SUCCEEDED` hoặc `COMPLETED_WITH_ERRORS`).
- **BE phải**: validate period của run nguồn chưa CLOSED + không có run active cùng (period+warehouse); INSERT `price_calc_run` mới với `source_run_id`, `run_scope='ALL'`; copy-forward toàn bộ item (DONE + ERROR) sang run mới, mark tất cả `status='RUNNING'`; `WorkflowClient.start()` workflow mới.
- **Output**: HTTP 202 `{runId (mới), sourceRunId, runScope:"ALL", status:"PENDING", pollingUrl, pollingIntervalHint:5000, affectedSubsequentPeriods[]}`.
- **Failure mode**: 409 `ERR-INV-024` nếu period CLOSED; 409 `ERR-INV-029` nếu run active cùng (period+warehouse); 503 nếu Temporal Cloud outage (compensating DELETE row, client retry backoff).
- **Ref**: BR-PRC-008 v29 (§9), entity `price_calc_run` (§5.1), endpoint `POST /api/v2/price-calc-runs/{id}/recalc` (§6.1)

#### AC-1b → Trigger tính lại mã lỗi (`runScope=ERROR_ONLY`)

- **Khi**: client `POST /api/v2/price-calc-runs/{id}/recalc` với body `{"runScope":"ERROR_ONLY"}`.
- **BE phải**: cùng guard với AC-1; copy-forward clone tất cả item từ run gốc nhưng chỉ mark `status='RUNNING'` cho item đang `ERROR`; item `DONE` giữ nguyên `status='DONE'` cùng giá trị đã tính (không recompute).
- **Output**: HTTP 202 tương tự AC-1 với `runScope:"ERROR_ONLY"`, `warningsSkippedItems` tính riêng cho scope này.
- **Failure mode**: 400 nếu run nguồn không có item nào đang `ERROR` (defensive check dù nút FE đã disable — AC-5b nguồn); 409/503 giống AC-1.
- **Ref**: BR-PRC-008 v29 (§9), entity `price_calc_run_item` (§5.1, index `idx_prc_item_error`), endpoint `POST /api/v2/price-calc-runs/{id}/recalc` (§6.1)

#### AC-3 → Chặn tính lại khi kỳ đã đóng

- **Khi**: client gọi recalc cho run mà `accounting_period` (của run gốc) có `status='CLOSED'`.
- **BE phải**: check period status TRƯỚC khi INSERT run mới; period CLOSED → reject ngay, KHÔNG tạo run mới, KHÔNG `WorkflowClient.start()`.
- **Output**: HTTP 409 `{errorCode: "ERR-INV-024"}` — không side-effect.
- **Failure mode**: n/a (guard chặn trước khi có side-effect).
- **Ref**: BR-PRC-008 (§9), `accounting_period.status` (external read, không physical FK — ADR-009), endpoint (§6.1)

#### AC-3b → Chặn tính lại khi đang có lần tính chạy nền

- **Khi**: client gọi recalc (hoặc create) khi đã tồn tại run `status ∈ {PENDING, RUNNING}` cùng `(tenant_id, garage_id, warehouse_id, period_id)`; hoặc run nguồn của recalc chính nó chưa terminal.
- **BE phải**: enforce 3-layer concurrency guard áp dụng đồng nhất cho CẢ 2 nút (Create và Recalc): Layer 1 DB `SELECT ... FOR UPDATE`; Layer 2 Temporal `WorkflowIdReusePolicy.REJECT_DUPLICATE`; Layer 3 partial unique index `uidx_prc_active_lock`. Riêng path `id` phải trỏ run nguồn terminal — nếu run nguồn đang `RUNNING`/`PENDING` thì reject ngay ở path validation.
- **Output**: HTTP 409 `{errorCode: "ERR-INV-029"}` — không side-effect.
- **Failure mode**: n/a (guard chặn trước khi có side-effect).
- **Ref**: BR-PRC-016 (§9), index `uidx_prc_active_lock` (§5.2), endpoint (§6.1)

### Cluster B — Execution & Persistence

#### AC-2 → Ghi đè kết quả

- **Khi**: workflow `PriceCalcRunWorkflow` của run RECALC compute xong item (Phase 2-4 của engine BQGQ, dùng chung logic với FEAT-PRC-CREATE).
- **BE phải**: ghi đè `cost_unit_price`/`cost_value` trên phiếu xuất (S2S `POST /protected/v1/delivery-lines/bulk-fill-cost` tới `gf-inventory`) + cascade giá trị sổ tồn (S2S `POST /protected/v1/stock-ledgers/bulk-recompute`) cho các (mã+kho) thuộc phạm vi RECALC — dùng đúng giá trị của run RECALC mới, KHÔNG dùng lại giá trị run gốc.
- **Output**: `delivery_line.cost_unit_price`/`cost_value` cập nhật tại `gf-inventory`; `price_calc_run_item` của run mới lưu `average_unit_price`/`delivery_value` mới; `updated_delivery_slip_count` tăng theo số phiếu đã fill.
- **Failure mode**: lỗi compute từng item → chỉ item đó `status='ERROR'`, KHÔNG chặn cả run; lỗi S2S `bulk-fill-cost` → retry theo `X-Idempotency-Key = "PRC-{runId}-FILL-{chunkIdx}"`.
- **Ref**: BR-PRC-005, BR-PRC-013 (§9), endpoint cross-boundary `POST /protected/v1/delivery-lines/bulk-fill-cost` (§6.4)

#### AC-2b → Chạy nền — ghi đè tại chỗ (không xóa trắng)

- **Khi**: suốt thời gian workflow RECALC ở trạng thái `RUNNING` (async, client polling mỗi 5s).
- **BE phải**: KHÔNG xóa trắng dữ liệu cost/sổ tồn hiện có trước khi tính — vì RECALC tạo run hoàn toàn MỚI (tách biệt qua `source_run_id`), run gốc và cost/sổ tồn hiện tại VẪN giữ nguyên cho tới khi từng item của run mới compute xong và ghi đè per-item, per-chunk commit (`BulkFillCostActivity` chunk 500 lines/request).
- **Output**: `progress_items_done` tăng dần theo chunk commit qua `UpdateRunStatusActivity`; polling `GET /api/v2/price-calc-runs/{id}` phản ánh tiến độ realtime.
- **Failure mode**: item lỗi → giữ nguyên cost cũ cho mã đó (KHÔNG ghi đè bằng giá trị rỗng/lỗi) cho tới khi có recalc thành công tiếp theo.
- **Ref**: BR-PRC-016, BR-PRC-014 (§9), activity `BulkFillCostActivity`/`BulkRecomputeLedgerActivity` (§6.4)

#### AC-4 → Mã lỗi khi tính lại

- **Khi**: item compute gặp lỗi trong workflow RECALC (giống engine dùng cho Create).
- **BE phải**: gán `error_reason` enum `{NEGATIVE_STOCK (tồn âm — invariant guard), ACCOUNTING_MISMATCH (lệch hạch toán — placeholder), SYSTEM_ERROR (sự cố hệ thống — vd vượt `SAFETY_ITERATION_CAP=100` hoặc lỗi S2S)}`; set `status='ERROR'`, `average_unit_price`/`delivery_value = NULL`, `error_message` chi tiết cho ops.
- **Output**: `price_calc_run_item.error_reason`/`error_message` persisted; run tổng kết thúc `status='COMPLETED_WITH_ERRORS'` nếu ≥1 item `ERROR`.
- **Failure mode**: item lỗi KHÔNG chặn toàn run (per-item isolation) — chỉ item đó giữ `ERROR`, các item khác tiếp tục compute song song.
- **Ref**: BR-PRC-007 v30 (§9), `price_calc_run_item.error_reason` (§5.1), invariant `chk_prc_item_status_reason`

### Cluster C — Permission

#### AC-5 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: bất kỳ request nào tới `POST /api/v2/price-calc-runs/{id}/recalc`.
- **BE phải**: authorize theo JWT — cả 2 persona `garage-owner` và `accountant` được phép gọi recalc như nhau; KHÔNG có role riêng chỉ 1 persona được recalc (Critical Rule #6 dual persona only).
- **Output**: request xử lý bình thường nếu JWT hợp lệ + tenant match, bất kể persona nào trong 2 persona.
- **Failure mode**: 401 nếu auth invalid; 403 nếu tenant mismatch/feature flag off — KHÔNG check role-based restriction giữa 2 persona.
- **Ref**: Critical Rule #6 (§4.2), endpoint `POST /api/v2/price-calc-runs/{id}/recalc` (§6.1)

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-PRC-008** (CORNERSTONE): chặn recalc khi period của run nguồn đã CLOSED — enforce tại service layer TRƯỚC khi INSERT run mới. Vi phạm → `ERR-INV-024`, HTTP 409.
- **BR-PRC-016** (CORNERSTONE): chặn recalc/create khi có run active cùng (garage+warehouse+period) — 3-layer guard (DB tx + Temporal reuse policy + partial unique index). Vi phạm → `ERR-INV-029`, HTTP 409.
- **BR-PRC-007** (NORMAL): `error_reason` enum 3 giá trị cho item lỗi, coupled với `status='ERROR'` qua CHECK constraint `chk_prc_item_status_reason`.
- **BR-PRC-009** (NORMAL): mã "Ngừng hoạt động" bị skip khi `ALL` re-resolve catalog — warning `warningsSkippedItems`, KHÔNG lỗi.
- **BR-PRC-013** (CORNERSTONE): công thức đơn giá BQ `(GT tồn đầu + GT nhập)/(SL tồn đầu + SL nhập)`, `HALF_UP` scale 2, dùng chính giá trị đã round để tính tiền vốn — áp dụng lại nguyên vẹn khi recompute.
- **BR-PRC-014** (NORMAL): status enum BE 4 giá trị nhưng UI chỉ hiển thị 3 trạng thái (`PENDING`+`RUNNING` gộp "Đang tính").
- **BR-PRC-015** (NORMAL): cascade cảnh báo `affectedSubsequentPeriods[]` — non-blocking, RECALC vẫn 202 thành công bất kể detection kết quả.
- **BR-PRC-017** (NORMAL): convergent iteration cho item có `has_self_reference=true` (phiếu "Nhập hàng bán bị trả lại" tự tham chiếu) — áp dụng lại trong RECALC, cap `SAFETY_ITERATION_CAP=100`.
- **BR-PRC-005** (NORMAL): S2S write cost cho phiếu xuất tại `gf-inventory`.
- **BR-AP-011 / BR-AP-CMN-002**: quy tắc khóa kỳ kế toán chung — hỗ trợ guard AC-3 (period CLOSED reject).

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- Cả `accountant` và `garage-owner` có quyền ngang nhau gọi recalc — KHÔNG phân biệt persona (AC-5).

### 4.3 Idempotency + concurrency

- `X-Idempotency-Key: PRC-RECALC-{runId}-{clientNonce}` — POST duplicate cùng key trong 5 phút trả cùng response với HTTP 200 (không 202), chạy TRƯỚC `WorkflowClient.start()`.
- Concurrency 3-layer (chia sẻ với FEAT-PRC-CREATE): Layer 1 DB `SELECT ... FOR UPDATE`; Layer 2 Temporal `WorkflowIdReusePolicy.REJECT_DUPLICATE`; Layer 3 partial unique index `uidx_prc_active_lock (tenant_id, garage_id, warehouse_id, period_id) WHERE status IN ('PENDING','RUNNING')`.
- Workflow ID mới per recalc: `prc-{tenantId}-{newRunId}` (Critical Rule #14 deterministic) — KHÔNG reuse workflow ID của run nguồn.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-024` | 409 | AC-3 | TOAST |
| `ERR-INV-029` | 409 | AC-3b | TOAST |
| `ERR-CMN-validation` | 400 | AC-1b (defensive), body invalid | INLINE |
| `ERR-CMN-not-found` | 404 | run nguồn không tồn tại/tenant mismatch | EMPTY_STATE |
| 503 (Temporal outage) | 503 | AC-1/AC-1b | TOAST + retry hint |

---

## 5. Schema delta (BE — contract focus)

> **Không có schema mới** — `price_calc_run` + `price_calc_run_item` đã được thiết kế đầy đủ tại `gf-accounting-data-model.md` v14 §2quater (chia sẻ với FEAT-PRC-CREATE, cùng migration `ddl-auto=update`). RECALC chỉ SỬ DỤNG lại các cột đã có sẵn — liệt kê dưới đây các cột RECALC đọc/ghi trực tiếp.

### 5.1 Entity columns dùng bởi RECALC — `price_calc_run` (existing, shared với FEAT-PRC-CREATE)

| Column | Type | Nullable | Default | Dùng bởi RECALC | AC ref |
|---|---|---|---|---|---|
| `run_scope` | `VARCHAR(20)` | Y | — | Ghi `ALL \| ERROR_ONLY` khi tạo run RECALC (NULL cho row CREATE) | AC-1, AC-1b |
| `source_run_id` | `BIGINT` | Y | — | Ghi = id run gốc; audit trail (BR-PRC-010) | AC-1, AC-1b |
| `scope_predicate` / `items_snapshot` | `JSONB` | Y | — | Đọc từ run gốc để reproduce phạm vi (ADR-027 §Phase 0) | AC-1 |
| `status` | `VARCHAR(30)` | N | `'PENDING'` | Ghi `PENDING` khi kick-off, transition qua workflow | AC-1, AC-3b |
| `temporal_workflow_id` | `VARCHAR(255)` | Y | — | Ghi `prc-{tenantId}-{newRunId}` sau `WorkflowClient.start()` | AC-1 |

### 5.2 Entity columns dùng bởi RECALC — `price_calc_run_item` (existing, shared với FEAT-PRC-CREATE)

| Column | Type | Nullable | Default | Dùng bởi RECALC | AC ref |
|---|---|---|---|---|---|
| `status` | `VARCHAR(20)` | N | `'RUNNING'` | Copy-forward: reset `RUNNING` (ALL) hoặc chỉ item cũ `ERROR` (ERROR_ONLY); giữ `DONE` nguyên | AC-1, AC-1b, AC-2b |
| `error_reason` / `error_message` | `VARCHAR(50)` / `TEXT` | Y | — | Ghi khi item recompute vẫn lỗi | AC-4 |
| `average_unit_price` / `delivery_value` | `DECIMAL(18,2)` | Y | — | Ghi đè khi item recompute thành công | AC-2 |
| `iterations_applied` / `has_self_reference` | `INTEGER` / `BOOLEAN` | N | `0` / `false` | Recompute lại cho item convergent iteration | AC-2 |

### 5.3 Index tái sử dụng (không index mới)

| Table | Index | Purpose cho RECALC |
|---|---|---|
| `price_calc_run` | `uidx_prc_active_lock` | Layer 3 concurrency guard (AC-3b) |
| `price_calc_run` | `idx_prc_run_tenant_period` | Cascade query `affectedSubsequentPeriods[]` (BR-PRC-015) |
| `price_calc_run_item` | `idx_prc_item_error` | Lookup nhanh item `ERROR` để copy-forward `runScope=ERROR_ONLY` |

> **Boundary migration policy**: `gf-accounting` dùng `ddl-auto=update` — KHÔNG viết Flyway migration file (Common Gotcha #5).

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/price-calc-runs/{id}/recalc` | authenticated (dual persona) | `{ runScope: "ALL" \| "ERROR_ONLY" }` | `202 { runId, sourceRunId, runScope, status, createdAt, pollingUrl, pollingIntervalHint, warningsSkippedItems, affectedSubsequentPeriods[] }` | `X-Idempotency-Key: PRC-RECALC-{runId}-{clientNonce}` (5-phút window, replay → 200) | AC-1, AC-1b, AC-3, AC-3b | — |

> Nguồn xác thực: `Architecture/api/gf-accounting-api.md` v24 §5.4 (grep-verbatim, không suy luận từ PKG snapshot — bundle §G đã cảnh báo `⚠️` stale, author đã Read trực tiếp §5.4 để verify per F-7).

### 6.2 Modified REST endpoints (additive)

_(không có — FEAT-PRC-RECALC chỉ thêm 1 endpoint mới, không sửa endpoint hiện hữu)_

### 6.3 Kafka topics (publish/consume)

_(không có — RECALC không phát Kafka event mới; trạng thái polling qua REST `GET /api/v2/price-calc-runs/{id}`, không có event projection cho PRC trong W06 — tương tự pattern advisory-only của ADR-021.)_

### 6.4 Cross-boundary REST consumers

| Endpoint exposed bởi | Consumed bởi (`gf-accounting`) | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/stock-ledgers/at-date` | `gf-inventory` | Phase 1 SnapshotPull của workflow RECALC | Circuit breaker (Resilience4j) | `RetryPolicy(initial=1s, backoff=2.0, max=5, maxAttempts=5)` |
| `POST /protected/v1/slips-in-period/search` | `gf-inventory` | Phase 1 SnapshotPull | Circuit breaker | cùng policy SnapshotPull |
| `POST /protected/v1/delivery-lines/bulk-fill-cost` | `gf-inventory` | Phase 3 commit — `BulkFillCostActivity`, chunk 500 lines/request, `X-Idempotency-Key: PRC-{runId}-FILL-{chunkIdx}` | Retry robust cho 5xx | idempotent theo chunk key |
| `POST /protected/v1/stock-ledgers/bulk-recompute` | `gf-inventory` | Phase 4 cascade — `BulkRecomputeLedgerActivity` | Retry per activity policy | `X-Idempotency-Key: PRC-{runId}-{phase}` |
| `POST /protected/v1/receipt-lines/bulk-inherit-cost` | `gf-inventory` | Phase 3 — kế thừa giá nhập gốc cho "Xuất trả hàng mua" (dùng chung engine với FEAT-PRC-CREATE) | Retry robust cho 5xx | activity retry + `X-Idempotency-Key: PRC-{runId}-INHERIT-{chunkIdx}` |
| `POST /api/v2/internal-products/search?pricingMethod=PWA&status=ACTIVE` | `gf-inventory` | Phase 0 re-resolve catalog khi `runScope=ALL` (mã mới xuất hiện) — endpoint thật V2-7, KHÔNG phải `gf-erp-mdm` (không có route này); mở rộng additive v77 thêm filter `pricingMethod` | fallback lỗi → item `SYSTEM_ERROR` | Spring Retry theo TECHSTACK §http-client. **Auth `x-api-key` — ĐÃ CHỐT** (`CR-20260801-03` APPROVED option (a), 2026-08-02): `V2-7` nhận `x-api-key` + header `X-Tenant-Id`, nhất quán 5 call `/protected/v1/*`; xem `FEAT-PRC-CREATE.md §6.4` + `INTEG-EXT-gf-accounting-gf-inventory.md v4 §4.6` |

> **Hand-off tới BFF**: PRC RECALC action wrap qua GraphQL BFF trong module §3f (`agg-garage-graph-graphql.md`) — không có FEAT-PRC-RECALC bff-tier file riêng theo fan-out map hiện tại (xem §11). KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

> Nhiều class dùng chung với FEAT-PRC-CREATE (được tạo trước — dependency). RECALC chỉ thêm method/endpoint mới trên các class đã tồn tại.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `adapter/controller` | `services/gf-accounting/src/main/java/.../adapter/controller/PriceCalcRunController.java` | MODIFY | additive method `recalc()` | ~40 | AC-1, AC-1b, AC-3, AC-3b |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/PriceCalcRunService.java` | MODIFY | additive method `recalc()` — guard + copy-forward + `WorkflowClient.start()` | ~90 | AC-1, AC-1b, AC-2, AC-3, AC-3b, AC-4 |
| `app/service` | `services/gf-accounting/src/main/java/.../app/service/PriceCalcRunCopyForwardService.java` | NEW | copy-forward logic riêng cho recalc (ALL vs ERROR_ONLY) | ~60 | AC-1, AC-1b, AC-2b |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/PriceCalcRunRepository.java` | MODIFY | additive finder (terminal status check by id) | ~10 | AC-3b |
| `domain/repository` | `services/gf-accounting/src/main/java/.../domain/repository/PriceCalcRunItemRepository.java` | MODIFY | additive finder (bulk fetch by run_id + status=ERROR) | ~10 | AC-1b |
| `app/client` | `services/gf-accounting/src/main/java/.../app/client/GfInventoryClient.java` | REUSE (không sửa) | dùng chung với FEAT-PRC-CREATE — package mới `app/client/`, KHÔNG phải `adapter/client/` hiện hữu (xem `FEAT-PRC-CREATE.md §7`) | 0 | AC-2 |
| `test/unit` | `services/gf-accounting/src/test/java/.../app/service/PriceCalcRunServiceRecalcTest.java` | NEW | test method recalc (guard + copy-forward) | ~150 | AC-1, AC-1b, AC-3, AC-3b, AC-4 |
| `test/contract` | `services/gf-accounting/src/test/java/.../adapter/controller/PriceCalcRunRecalcContractTest.java` | NEW | contract test 202/400/409/503 | ~90 | AC-1, AC-1b, AC-3, AC-3b |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema — dependency FEAT-PRC-CREATE
    Entry: FEAT-PRC-CREATE S1 (schema price_calc_run/price_calc_run_item) deployed
    Exit: entities available local
    └─► S2

S2  Copy-forward + Service logic recalc() (BR enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green (guard CLOSED/active-run + copy-forward ALL/ERROR_ONLY)
    └─► S3

S3  REST adapter — controller.recalc()
    Entry: S2
    Exit: contract test 202/400/409/503 green
    └─► S4

S4  Integration test (cross-boundary REST + Temporal workflow)
    Entry: S3 + gf-inventory bulk-fill-cost/bulk-recompute stable
    Exit: integ test green (ALL + ERROR_ONLY scope)
    └─► (hand-off BFF wire — xem §11 N/A note)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema reuse (dependency) | db (created by FEAT-PRC-CREATE) | FEAT-PRC-CREATE S1 done | Entities available | — |
| S2 | Copy-forward + service `recalc()` | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter `recalc()` | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + gf-inventory stable | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-PRC-008` | CORNERSTONE | domain (primary, service layer guard) | `app/service/PriceCalcRunService.java::recalc()` | AC-1, AC-1b, AC-3 | `TC-BR-gf-accounting-008-*` |
| `BR-PRC-016` | CORNERSTONE | domain + repository (partial unique index) | `app/service/PriceCalcRunService.java::recalc()` + `infrastructure/persistence` (`uidx_prc_active_lock`) | AC-3b | `TC-BR-gf-accounting-016-*` |
| `BR-PRC-007` | NORMAL | domain (item compute) | `PriceCalcRunWorkflow` activity `ComputeItemActivity` | AC-4 | `TC-BR-gf-accounting-007-*` |
| `BR-PRC-013` | CORNERSTONE | domain (compute engine) | `ComputeItemActivity` (dùng chung FEAT-PRC-CREATE) | AC-2 | `TC-BR-gf-accounting-013-*` |
| `BR-PRC-015` | NORMAL | service (post-commit query) | `app/service/PriceCalcRunService.java` post-commit block | AC-1, AC-1b | `TC-BR-gf-accounting-015-*` |
| `BR-PRC-017` | NORMAL | domain (convergent iteration) | `ComputeItemActivity` (dùng chung FEAT-PRC-CREATE) | AC-2 | `TC-BR-gf-accounting-017-*` |

> **Enforcement layer priority**: primary phải ở `domain/` hoặc `app/service/` (SSOT). Secondary UI/client-side enforcement (button disable AC-5b) → FE tier secondary, xem §11.

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract + Integration | test-api | 202 kick-off + workflow start ALL scope |
| AC-1b | API contract + Unit | test-api | copy-forward chỉ item ERROR reset RUNNING |
| AC-2 | Integration (cross-boundary S2S) | test-api | verify `delivery_line.cost_unit_price` ghi đè tại `gf-inventory` |
| AC-2b | Integration | test-api | verify run gốc + cost cũ giữ nguyên trong lúc RUNNING |
| AC-3 | API contract (negative) | test-api | 409 `ERR-INV-024` period CLOSED |
| AC-3b | API contract (negative) + concurrency | test-api | 409 `ERR-INV-029` run active + concurrent double-click |
| AC-4 | Unit (error mapping) | test-api | 3 error_reason enum values |
| AC-5 | Isolation (RBAC) | test-isolation | dual persona `accountant` + `garage-owner` ngang quyền |

## 11. Cross-tier coordination (BE perspective)

> `FEAT-PRC-RECALC` **có** file tier BFF và FE-web riêng — cả hai đã được author (`features/bff/FEAT-PRC-RECALC.md`, `features/fe-web/FEAT-PRC-RECALC.md`). *(Cập nhật `CR-20260801-10`, 2026-08-02: ghi chú gốc "không có file tier riêng" viết theo fan-out map `fanout_map_sha=750f49b4…` tại thời điểm spawn, trước khi 25 tier file author xong — nay đã sai với hiện trạng.)* Về mặt UX, hành động "Tính lại" vẫn được wire như một action bên trong màn hình `FEAT-PRC-DETAIL`/`FEAT-PRC-LIST` (BFF module §3f 6-op PRC, web route PRC List/Detail — xem `PKG-W06-inventory-pricing-stock-report.md §2.2`). PRC là web-only trong W06 (mobile chỉ có `FEAT-STK-LIST-V2`).

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-RECALC.md` | **AUTHORED** (đã tồn tại) | Endpoint `POST /api/v2/price-calc-runs/{id}/recalc` được wrap trong resolver PRC chung tại `agg-garage-graph-graphql.md` §3f |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-RECALC.md` | **AUTHORED** (đã tồn tại) | Nút "Tính lại" render trong màn hình `FEAT-PRC-DETAIL`/`FEAT-PRC-LIST` fe-web tier |
| Mobile | _(N/A — PRC web-only)_ | N/A | Không áp dụng |

**Source ID consistency** (item 18): `source_feat_sha = ca19e301a54711ab8d1412080e295b9332455ba378954891d8e39a793834348f` — phải khớp mọi tier file khác nếu về sau có tier file riêng cho `FEAT-PRC-RECALC`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-RECALC.md`](../../../../../Product/features/FEAT-PRC-RECALC.md) v21
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) (converted)
- **BR refs**: BR-PRC-005/007/008/009/013/014/015/016/017, BR-AP-011, BR-AP-CMN-002 (Product/business-rules/ — PRC + Accounting Period domain)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md) §11
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) v24 §5.4 (grep-verified)
- **Data model**: [`Architecture/data/gf-accounting-data-model.md`](../../../../../Architecture/data/gf-accounting-data-model.md) v14 §2quater
- **ADR**: ADR-027 (BQGQ engine + convergent iteration), ADR-028 (PRC async execution — Temporal workflow)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml`
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 6 | main-agent (post final-review fix, approver sonhoang) | **Fix inconsistency phát hiện từ review độc lập.** §7 File impact map — row `GfInventoryClient.java` (REUSE từ FEAT-PRC-CREATE) — package `adapter/client` → `app/client`, khớp quyết định user tại `FEAT-PRC-CREATE.md §7` (client này dùng package mới có chủ đích, không phải `adapter/client` hiện hữu). **KHÔNG đụng**: AC, logic reuse. 5 → 6. |
| 2026-08-02 | 5 | main-agent (CR batch W06, approver sonhoang) | **Apply `CR-20260801-06` (MINOR, APPROVED) — phần mở rộng scope còn sót, phát hiện khi review lại đủ 5/5 file PRC.** §9 BR traceability — `BR-PRC-016` row: `adapter/persistence` (không tồn tại trong repo) → `infrastructure/persistence`, khớp precedent đã chốt tại `FEAT-PRC-CREATE.md §7`. **KHÔNG đụng**: AC, BR mapping, §5/§6. 4 → 5. |
| 2026-08-02 | 4 | main-agent (CR batch W06, approver sonhoang) | **Apply 2 CR APPROVED — `CR-20260801-03` + `CR-20260801-10`.** (1) `CR-20260801-03` (option a): §6.4 REST consumers row `POST /api/v2/internal-products/search` — gỡ cờ **NEED CONFIRMATION** về S2S auth, chốt `x-api-key` + header `X-Tenant-Id`, cite `INTEG-EXT-gf-accounting-gf-inventory.md` v4 §4.6. (2) `CR-20260801-10`: §11 Cross-tier coordination — prose "không có file tier BFF/FE-web riêng" và 2 row `_(N/A — không có file riêng)_` là **sai với hiện trạng** (`features/bff/FEAT-PRC-RECALC.md` + `features/fe-web/FEAT-PRC-RECALC.md` đều tồn tại, author xong sau khi §11 được viết theo fan-out map cũ) → sửa thành **AUTHORED** kèm đường dẫn; Metadata row `Cross-tier pair` cập nhật tương ứng. **KHÔNG đụng**: AC, BR mapping, §5 schema (reuse-only), §6 endpoint contract, `source_feat_sha`. 3 → 4. |
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Sửa endpoint bịa/nhầm boundary** (mirror fix cùng ngày với sibling `FEAT-PRC-CREATE.md` — cùng root cause) — `GET /internal-products/search (gf-erp-mdm)` (không tồn tại) → `POST /api/v2/internal-products/search` (**`gf-inventory`** V2-7, additive v77 thêm filter `pricingMethod`). Sửa frontmatter `boundaries_affected`/`consumes_contracts`, Metadata table, §6.4 REST consumers table; bổ sung row thiếu `POST /protected/v1/receipt-lines/bulk-inherit-cost`; đồng bộ `version` frontmatter khớp Change Log. Cascade Architecture: `Architecture/api/gf-inventory-api.md` v76→v77 (CR-20260731-03). Xem `Execution/wave-specs/W06/_decisions.md`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-PRC-RECALC` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 BE behaviour map cover 8/8 AC, §4 ràng buộc + error code, §5 schema delta (reuse-only, không tạo entity mới — dependency FEAT-PRC-CREATE), §6 API contract (1 endpoint mới, grep-verified vs `gf-accounting-api.md` v24 §5.4), §7-§11 BE-specific (Hexagonal file map/sequence DAG/BR primary/test/cross-tier N/A per fan-out map). Source FEAT chỉ audit. |
