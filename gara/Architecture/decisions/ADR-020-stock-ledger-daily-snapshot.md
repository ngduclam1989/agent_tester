---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 6
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-08"
---

# ADR-020: Sổ tồn — Mô hình point-in-time snapshot theo ngày + Engine tính lại dùng chung (`inventory_stock_ledger`)

## Status

ACCEPTED — 2026-07-06

## Context

`EP-INVENTORY-OPENING-BALANCE` (W04) + downstream `EP-INVENTORY-STOCK-V2` (W06 dự kiến) + `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-DELIVERY-V2` (W05 dự kiến) + slice PRC (BQGQ) của `EP-INVENTORY-ACCOUNTING-PERIOD` đều phụ thuộc vào **một projection "sổ tồn" duy nhất** trả về tồn point-in-time (SL + GT) theo `(mã + kho + garage) tại bất kỳ ngày D nào`.

BR-STKV2-001 (`BR-GF-INVENTORY-STOCK-V2.md` §2.1) chốt cứng ngữ nghĩa đọc (nguyên văn):

> Tồn-đến-ngày D = tồn cuối ngày của mốc gần nhất ≤ D (**không cộng dồn từ đầu**); Tổng nhập/xuất khoảng [Từ, Đến] = tổng biến động nhập/xuất trong khoảng.

Và BR-STKV2-005a chốt cứng thuật toán ghi (5 nguồn → 4 bước tính lại per write-path).

Câu hỏi chính cần quyết định:

1. **Cơ chế** — Snapshot point-in-time theo mỗi ngày có biến động (materialize theo row vật lý), running total dồn từ gốc (rebuild mỗi lần đọc), hay projection kiểu event-sourced?
2. **Ownership của write-path** — Mỗi write-path (10 điểm tổng: 3 OB + 3 nhập + 3 xuất + BQGQ) tự triển khai độc lập, hay dùng một service "engine" trừu tượng dùng chung?
3. **Cùng tồn tại với `inventory_stock` hiện có** (ledger WAC baseline V1 + running current-qty theo SKU) — thay thế, mirror, hay projection độc lập?
4. **Độ chi tiết lưu trữ** — 1 row cho mỗi (mã+kho+garage+ngày-có-biến-động), 1 row cho mỗi (mã+kho+garage+mọi-ngày-trong-cửa-sổ), hay 1 row cho mỗi biến động (event-store)?

**Constraints từ Product layer** (BR-STKV2-001..005a; FEAT-OB-IMPORT AC-6 + FEAT-OB-EDIT AC-3 + FEAT-OB-DELETE-LINES §5 note; yêu cầu cascade của BR-OB-015/016 + BR-PRC-005):

- Mẫu đọc là **query point-in-time** — không thể chấp nhận độ phức tạp O(N-history-scan) cho mỗi lần đọc (garage là SaaS multi-tenant, dashboard/report list-heavy per BR-STKV2-011 NXT + BR-STKV2-013 thẻ kho).
- Ghi update từ **10 write-path** (BR-STKV2-005a liệt kê): OB import/edit/delete-lines · IRV2 create/reverse/edit-posted · IDV2 create/reverse/edit-posted · BQGQ (BR-PRC-005). Phải gọi **cùng 1 quy tắc**.
- Tồn âm point-in-time **phải chặn được ngay tại nguồn** (BR-STKV2-005a bước 4 + BR-OB-015 + BR-IDV2-004) — không thể chỉ check "current qty" như legacy `inventory_stock`.
- **Rebuild-safe**: projection có thể xóa + tính lại từ 2 nguồn (bảng OB + chi tiết phiếu đã ghi sổ) — BR-STKV2-005a nguyên văn "sổ tồn là **projection**".
- BQGQ (BR-PRC-005) cập nhật **GT xuất + GT tồn cuối, SL không đổi** — layout cột phải tách biệt SL và GT.

**Constraints từ team / runtime:**

- Schema `dev_gf_inventory` của `gf-inventory` — Flyway V{N+1} additive (Gotcha #9); KHÔNG rewrite migration cũ. Legacy `inventory_stock` + `inventory_transaction` giữ nguyên (§5 gf-inventory-HLD.md).
- Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 (TECHSTACK). Redis có sẵn cho lock (Redisson) — pessimistic lock đã có precedent (`InventoryStockService.reserveStockForDelivery`).
- Kích thước partition per-day multi-tenant: garage bình quân ~5k SKU × ~200 kho × ~30 ngày có biến động/tháng ≈ ~30M rows/tenant/năm ở worst-case. Cần đảm bảo tenant fairness (SaaS 17-boundary).
- Timebox W04 là 5 ngày — không kịp triển khai hạ tầng event-sourced projection từ đầu; brownfield vẫn theo pattern legacy running-qty.

**Business rules liên quan:** BR-STKV2-001..005a, BR-STKV2-011..014 (đọc), BR-OB-015/016, BR-PRC-005, BR-AP-012.

## Decision

**Áp dụng mô hình point-in-time snapshot theo ngày** với entity `inventory_stock_ledger` **1 row cho mỗi `(tenant_id, product_code, warehouse_code, movement_date)`** — row chỉ tồn tại khi ngày đó **có biến động** hoặc là baseline OB; đọc query snapshot "gần nhất ≤ D" bằng `ORDER BY movement_date DESC LIMIT 1`. Ghi qua **engine dùng chung `StockLedgerRecomputeService`** hiện thực hóa BR-STKV2-005a. `opening_balance_line` (OB) là **source-of-truth độc lập** cho baseline; ledger là **projection có thể rebuild**.

Cụ thể:

- **Độ chi tiết lưu trữ**: 1 row cho mỗi ngày có phát sinh (không dense-fill mọi ngày; ngày không có biến động sau cascade → không tạo row mới, query đọc dùng row gần nhất ≤ D). Cột: SL nhập ngày, GT nhập ngày, SL xuất ngày, GT xuất ngày, SL tồn cuối ngày, GT tồn cuối ngày. **Row đầu chuỗi per key** (min `movement_date`) = OB baseline nếu tồn tại: `inbound_qty=opening_balance_line.quantity_on_hand`, `inbound_value=opening_balance_line.value_on_hand`, `outbound_qty=0`, `outbound_value=0`, `closing_qty`/`closing_value` **= running formula uniform** (previous_closing = 0 khi row đầu → `closing = inbound`). **Row sau** = biến động phiếu N/X aggregate cùng ngày (`inbound/outbound` = tổng SL/GT nhập/xuất từ phiếu match key + date, `closing_*` = cùng running formula). **v6 update per BA feedback via user quannn 2026-07-08**: đảo v5 semantic — OB baseline row đặt qty/value vào `inbound_*` (nhập lần đầu của mã+kho), chạy running formula uniform cho MỌI row, không còn special-case "given". Rationale: engine cascade đơn giản (1 formula, không branch); NXT report BR-STKV2-010 `SUM(inbound_qty)/SUM(inbound_value)` trong kỳ **bao gồm** OB row — BA xem OB là "nhập lần đầu" nên KHÔNG double-count (override rationale v5). Engine vẫn detect row đầu chuỗi qua `ORDER BY movement_date ASC LIMIT 1 per key` khi cần identify baseline vs slip (cho audit / debug), không dùng column tag (`movement_kind` vẫn drop per v5).
- **Mẫu ghi**: mọi write-path gọi `StockLedgerRecomputeService.recompute(tenantId, productCode, warehouseCode, fromDate)` — engine thực hiện:
  1. Xóa mọi row ledger có `movement_date ≥ fromDate` cho `(tenant, product, warehouse)`.
  2. Đọc nguồn: OB baseline (lọc `opening_balance_line` theo cùng key) + chi tiết phiếu ≥ fromDate (`inventory_receipt_item` + `inventory_delivery_item` — chỉ phiếu status `COMPLETED`/`REVERSED`, bỏ Cancelled + Nháp).
  3. Group theo `movement_date`, tính daily aggregate SL/GT nhập + xuất.
  4. Suy ra lại tồn cuối ngày running: `closing_qty_N = closing_qty_{N-1} + in_qty_N − out_qty_N`.
  5. Kiểm tra invariant `closing_qty ≥ 0 tại mọi N` — vi phạm → throw `ERR-INV-036` → rollback transaction ở caller (trigger là thao tác gốc của write-path).
- **Cùng tồn tại với legacy `inventory_stock`**: **CO-EXIST độc lập**. Legacy tiếp tục phục vụ query stock-realtime V1 (UI stock search đang chạy production, pattern keep-legacy per ADR-017). Ledger V2 phục vụ report NXT + tồn-đến-ngày + thẻ kho + input cho BQGQ. **Không mirror** (thoát khỏi tình trạng drift 2-nguồn). Về sau (post-W06) — đánh giá deprecate legacy qua CR khi mọi consumer V1 đã migrate sang pattern V2.
- **Recompute lock**: Redisson lock key `stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}` — timeout 30s, ngăn 2 write-path chạy đồng thời trên cùng key. Concurrency giữa các key khác vẫn OK.
- **Idempotency**: `recompute` là idempotent — chạy nhiều lần trên cùng dữ liệu nguồn cho cùng kết quả. Trigger từ Kafka event OB EDIT/DELETE ở future wave → không bắt buộc outbox ở W04 (call intra-service, sync REST trong cùng service).
- **Tích hợp BQGQ (BR-PRC-005)**: BQGQ chỉ cập nhật GT (SL không đổi) → engine expose method `recomputeValuesOnly(...)` chạy bước 3-4 với SL giữ nguyên, chỉ suy ra lại các cột GT dựa trên đơn giá vốn đã cập nhật. Chi tiết sẽ có ADR riêng cho PRC ở wave sau đảm nhận.

**Threshold để re-evaluate:**

- Movement rate single-key của tenant > 100 events/ngày cho 1 (mã+kho) duy trì liên tục → xem xét chuyển sang projection event-sourced async.
- p95 recompute > 5s cho cascade ≤ 365 ngày → tối ưu (batch upsert, native SQL bulk, partition theo tenant_id).
- Drift giữa legacy `inventory_stock` và ledger > 0.1% cases → lập kế hoạch migration deprecate legacy.

## Component Interface (W04 baseline)

> **Scope**: hợp đồng ngữ nghĩa cho shared engine `StockLedgerRecomputeService` hiện thực hóa BR-STKV2-005a. Mọi caller (`OpeningBalanceService` W04, IRV2/IDV2 W05, BQGQ W06) BẮT BUỘC tuân contract này. **Tài liệu decision-level** — không prescribe cụ thể ngôn ngữ / framework. Language mapping (Java / Spring) là chi tiết implementation, thuộc code repo `services/gf-inventory/`. Threshold breaking change → bump ADR v4 → v5 + CR MAJOR + REVIEW_GROUP.

### C1. Engine method surface

Engine expose **3 method surface** — 2 active + 1 stub reserved:

| # | Method | Wave scope | Semantic |
|---|---|---|---|
| **M1** | Recompute per-key | W04 active | Recompute sổ tồn cho **1 key** `(tenant, product, warehouse)` từ `fromDate` về sau. Thực hiện BR-STKV2-005a bước 1..4 (delete-from-fromDate → replay from source → running closing → invariant `closing_qty ≥ 0`). Input = command shape C2. Output = result shape C4. |
| **M2** | Recompute bulk (multi-key) | W04 active | **MUST-USE** cho caller multi-key (OB import 500 rows, delete-lines N rows, edit swap OLD/NEW combo). Semantic = M1 áp cho từng key nhưng batch trong **1 transaction** — 1 key vi phạm invariant → **toàn bộ batch rollback** (all-or-nothing per BR-OB-004a + BR-OB-DEL-004 fail-fast). Input = list of command C2 với keys DISTINCT (duplicate = programming error, reject sớm). Output = list of result C4 theo thứ tự **input**, không phải sort order. Ordered lock acquisition rule bắt buộc (xem C6). |
| **M3** | Recompute values-only (BQGQ) | W06+ stub | **RESERVED** cho BR-PRC-005 (BQGQ) — recompute chỉ **cột GT**, giữ nguyên SL. Chi tiết signature + coordination với M1 (cùng lock scope hay dedicated) sẽ được chốt ở **ADR riêng cho PRC** khi FEAT-PRC-* ratify (W06). W04/W05 caller KHÔNG được gọi. |

**Cấm bypass**: mọi write chạm `inventory_stock_ledger` phải qua M1/M2. Ghi trực tiếp table = vi phạm shared-engine invariant (BR-STKV2-005a), reviewer G-shared-engine block P0. Enforce ở [gf-inventory-HLD.md §7 Forbidden](../hld/gf-inventory-HLD.md) W04 rule.

### C2. Command shape (input contract)

Command (input cho M1/M2) là immutable value carrier — mọi field bắt buộc, validate fail-fast ở caller boundary trước khi gọi engine.

| Field | Type semantic | Required | Constraint | Cite |
|---|---|---|---|---|
| `tenantId` | Long integer | Yes | > 0; tenant-isolation gate (Critical Rule #10) | KG.gf-inventory.entities.\* tenant scoping |
| `productCode` | String | Yes | Trim; ≤ 32 chars; format `^[A-Z0-9\-]+$` | BR-CAT-PROD-004 |
| `warehouseCode` | String | Yes | Trim; ≤ 32 chars; format `^[A-Z0-9\-]+$` | BR-WH-CODE-001 |
| `fromDate` | Date (business day, no TZ) | Yes | ≤ today (UTC); ≥ min OB date của key nếu tồn tại | BR-STKV2-001 (a) — "biến động ngày" scoped by business day |
| `origin` | Enum audit chain (xem C3) | Yes | Value phải thuộc set C3 hiện hành | Sync với `inventory_stock_ledger.updated_by` |

**Duplicate key trong bulk M2** = programming error → engine reject sớm với exception category `BadRequest` (không phải business error, không map ERR-INV-\*).

### C3. `OriginContext` — enum audit chain-of-cause

Enum bắt buộc **sync 1-1** với column `inventory_stock_ledger.updated_by` trigger source ([gf-inventory-data-model.md §4b](../data/gf-inventory-data-model.md) L534) — nếu update 1 chỗ phải update chỗ kia cùng commit. Được cite khi audit trail cần biết write-path nào gây recompute.

| Value | Wave scope | Write-path FEAT | BR cite |
|---|---|---|---|
| `OB_IMPORT` | W04 active | FEAT-OB-IMPORT (endpoint W04-4) | BR-STKV2-001 tình huống #1 |
| `OB_EDIT` | W04 active | FEAT-OB-EDIT (endpoint W04-5) | BR-STKV2-001 tình huống #1 |
| `OB_DELETE` | W04 active | FEAT-OB-DELETE-LINES (endpoint W04-6/7) | BR-STKV2-001 tình huống #1 |
| `SLIP_POSTED` | W05 stub | FEAT-IRV2-\* / FEAT-IDV2-\* posting | BR-IRV2-003 / BR-IDV2-003 (tình huống #2/#3) |
| `SLIP_REVERSED` | W05 stub | FEAT-IRV2-\* / FEAT-IDV2-\* reverse | BR-IRV2-004 / BR-IDV2-005 (tình huống #2/#3) |
| `SLIP_EDITED` | W05 stub | FEAT-IRV2-\* / FEAT-IDV2-\* edit-posted | BR-IRV2-006 / BR-IDV2-006 (tình huống #4) |
| `BQGQ_RECOMPUTE` | W06 stub | FEAT-PRC-\* (BQGQ) via M3 | BR-PRC-005 (tình huống #5) |

**Backward-compat**: add value (W05 SLIP_\*, W06 BQGQ_RECOMPUTE) = **additive** — W04 code không đổi. Caller phải handle missing case defensively (không dùng exhaustive switch giả định set closed) để tránh regression khi wave sau add value.

### C4. Result shape (output contract)

Result (output từ M1; list-of-result từ M2) mô tả kết quả recompute per key — dùng làm audit + REST payload.

| Field | Type semantic | Ghi chú |
|---|---|---|
| `productCode` | String | Echo input |
| `warehouseCode` | String | Echo input |
| `fromDate` | Date | Echo input (cascade chain start) |
| `affectedRows` | Integer count | Canonical count row `inventory_stock_ledger` **delete + reinsert** cho key (1 row = 1 `(key, movement_date)` pair). Semantic canonical đóng gap G10 — không phải "số ngày" hay "số phiếu process" |
| `latestDate` | Date | Ngày cuối cùng có row sau cascade; = `fromDate` nếu chỉ 1 ngày |
| `latestClosingQty` | Decimal (18,6) | SL tồn cuối tại `latestDate` |
| `latestClosingValue` | Decimal (18,2) | GT tồn cuối tại `latestDate`; = 0 nếu chưa BQGQ per BR-STKV2-001 (b) |

**REST payload mapping**: response `cascadedKeys[]` trong W04-4/5/7 ([api.md §3b](../api/gf-inventory-api.md)) là 1-1 map với list-of-result — không cần adapter:

| REST field | Result field | Ghi chú |
|---|---|---|
| `productCode` | `productCode` | verbatim |
| `warehouseCode` | `warehouseCode` | verbatim |
| `fromDate` | `fromDate` | ISO-8601 date |
| `recomputedRows` (legacy alias, api.md v40+) | `affectedRows` | REST field sẽ rename `affectedRows` khi api.md next bump — expose cả 2 field 1 wave rồi deprecate `recomputedRows` (deprecation window) |

### C5. Exception categories

Engine phân biệt 3 category exception rõ ràng — caller catch theo category (không theo class cụ thể) để xử lý phù hợp (business propagate FE vs technical retry vs technical bubble).

| Category | Nguyên nhân | Semantic | errorCode → HTTP | Carrier fields (bắt buộc expose caller) | Nature |
|---|---|---|---|---|---|
| **NegativeStock** | BR-STKV2-005a bước 4 detect `closing_qty < 0` ở bất kỳ ngày N trong chain cascade | Business error — propagate FE với popup verbatim (W04-7 delete-lines AC-4) | `ERR-INV-036` → 400 | `productCode`, `warehouseCode`, `offendingDate` (ngày đầu tiên detect âm), `currentClosing` (tồn cuối tại offendingDate BEFORE attempt), `attemptedDelta` (net in − out ngày đó), `offendingCommand` (echo command gốc để batch context) | Business — must not retry |
| **LockTimeout** | Acquire distributed lock (per-key granularity) vượt 30s timeout | Technical error — caller trả 503 platform-wide toast; user retry sau | `ERR-CMN-007` → 503 (mirror api.md W04-4/5/6/7 row 503) | `lockKey` (identity của key đang bị lock) | Technical — retry-safe (client retry) |
| **SourceStale** | Row source (`opening_balance_line` / slip detail) mutate concurrent giữa lock acquire và source read (race window) | Technical retry-in-tx — KHÔNG expose FE. Caller retry tối đa 3 lần trong cùng tx trước khi bubble 500 | Internal-only marker (không đăng ký `ERROR-CODE-REGISTRY`) | Cause chain (source row identity) | Technical — retry-safe (server retry, tx-scoped) |

**Bad-request category** (duplicate key trong M2, null field vi phạm C2 constraint) = programming error — không map ERR-INV-\*, bubble như IllegalArgumentException/precondition-violated. Caller test coverage phải cover.

### C6. Transaction + concurrency contract

Rule ngữ nghĩa dưới đây bắt buộc mọi implementation tuân, bất kể ngôn ngữ / framework:

1. **Caller owns transaction**. Caller mở transaction **trước** khi gọi M1/M2 (business tx mode = required-existing). Engine **join** tx hiện tại — KHÔNG tự open, KHÔNG suspend, KHÔNG new-required. Rationale: cascade + source mutate (bảng OB / phiếu detail) phải nằm trong cùng 1 tx với write-path gốc để 1 rollback boundary duy nhất khi bước 4 detect âm.
2. **Lock inside tx, release after completion**. Engine acquire distributed lock **bên trong** transaction (sau tx begin, trước native bulk delete). Release phải diễn ra **sau khi tx commit HOẶC rollback hoàn tất** (dùng after-completion hook của tx synchronization) — KHÔNG release trong finally/cleanup block của engine method (race window: tx còn open sau engine return, concurrent caller acquire được lock nhưng đọc dirty source).
3. **Reentrancy blocked**. Engine phải mechanical block reentry (engine gọi engine từ trong cascade). Runtime enforce qua thread-scoped flag: entry set + check, exit clear. Vi phạm = programming error → fast fail (không bubble như business error). Support §Risks item 3 "engine không được gọi từ chính engine".
4. **Ordered lock acquisition (bulk)**. M2 phải sort commands theo **`(productCode ASC, warehouseCode ASC)` ASCII** TRƯỚC khi acquire — deterministic global order → 2 concurrent bulk imports lock cùng thứ tự → cross-deadlock ⇒ 0. Áp cho cả trường hợp W04-5 edit swap `(OLD, NEW)` combo: sort theo cùng comparator, KHÔNG dùng insertion order. Release theo reverse (LIFO).

**Runtime dependency** (giữ nguyên từ v2 §Decision): distributed lock qua **Redisson** (Redis-backed) — đã có precedent tại `InventoryStockService.reserveStockForDelivery`. Lock key format `stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}` (v2 §Decision).

### C7. Observability contract

Metric (Micrometer):

| Name | Type | Tags | Purpose |
|---|---|---|---|
| `stock_ledger_recompute_duration_seconds` | histogram | `tenant_id`, `origin` | SLA §Threshold p95 ≤ 5s; buckets `[0.05, 0.2, 0.5, 1, 2, 5, 10]` |
| `stock_ledger_recompute_cascade_days` | distribution_summary | `tenant_id` | Cascade depth (worst-case ~1800 ngày, §Consequences item 1) |
| `stock_ledger_recompute_affected_rows_total` | counter | `tenant_id`, `origin` | Volume tracking |
| `stock_ledger_negative_stock_rejected_total` | counter | `tenant_id`, `origin` | Frequency `ERR-INV-036` hit (business KPI) |

Log (structured JSON):

- Level `INFO` on success: `{tenant, productCode, warehouseCode, fromDate, origin, affectedRows, cascadeDays, durationMs}`
- Level `WARN` on exception category `NegativeStock` (C5): `{tenant, productCode, warehouseCode, offendingDate, currentClosing, attemptedDelta, origin, callerFeature}` — support debug `ERR-INV-036` nhanh
- Level `ERROR` on category `LockTimeout` / `SourceStale` (C5): kèm `lockKey` / `attemptCount`

Trace (OpenTelemetry): Span name `stock_ledger_recompute` với attributes `recompute.fromDate`, `recompute.origin`, `recompute.cascade.days`, `recompute.affectedRows`, `recompute.exception` (nếu có).

### C8. Backward-compat guarantee

| Change | Wave | Backward-compat? | Ghi chú |
|---|---|---|---|
| Add value `SLIP_POSTED / SLIP_REVERSED / SLIP_EDITED` vào enum `OriginContext` (C3) | W05 | ✅ Additive | Existing W04 caller không đổi; W05 caller pass value mới |
| Add value `BQGQ_RECOMPUTE` vào enum `OriginContext` + activate stub M3 (values-only recompute) | W06 | ✅ Additive | W04/W05 caller không đổi; M3 dùng khi implementation ratify ở ADR PRC |
| Rename hoặc remove field trong command shape C2 / result shape C4 | any | ❌ Breaking | Phải bump ADR + CR MAJOR + REVIEW_GROUP; coordinate 3 wave caller |
| Rename REST field `recomputedRows` → `affectedRows` trong api.md | future | ⚠️ Deprecation window | Expose cả 2 field 1 wave (BFF map cả 2), sau đó deprecate `recomputedRows` |
| Đổi format distributed lock key (`stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}`) | any | ❌ Breaking | Concurrent deploys sẽ lock trùng key khác nhau — treat như MAJOR |
| Đổi thuật toán ordered lock acquisition C6 (vd bỏ ASCII sort, dùng hash-based) | any | ❌ Breaking | Concurrent bulk imports có thể lock ngược thứ tự → deadlock risk quay lại |

## Alternatives Considered

| Alternative                                                                                            | Ưu điểm                                                                                                     | Nhược điểm                                                                                                                                                                                                            | Tại sao không                                                                                                                            |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **A1. Running total dồn từ gốc (không materialize theo ngày)**                              | Đơn giản nhất; tốn ít storage; đọc là scan chi tiết phiếu + OB mỗi lần                            | Read p95 tệ khi (mã+kho) có ≥ 5 năm dữ liệu (~2k phiếu → full scan mỗi lượt); dashboard 20 dòng × 5 năm = 40k rows scan/query. Vi phạm BR-STKV2-001 nguyên văn "**không cộng dồn từ đầu**". | **Rejected** — BR spec cứng chọn mô hình snapshot; W06 load thiên về đọc.                                                   |
| **A2. Dense-fill 1 row cho mỗi (mã+kho+ngày) mỗi ngày**                                     | Read O(1) khi query cụ thể theo ngày (lookup theo PK); ORDER BY trivial                                     | 5k SKU × 200 kho × 365 ngày × 5 năm ≈**1.8B rows/tenant** — bloat cực nặng; 90% ngày không có biến động là lãng phí.                                                                              | **Rejected** — overhead storage 100× cho lợi ích không đáng kể; index vẫn phải scan trong PostgreSQL.                      |
| **A3. Projection event-sourced (Kafka event log + async projection)**                            | Khả năng rebuild audit-perfect; ordering đảm bảo qua partition key; tenant fairness qua concurrency limit | Timebox W04 5 ngày không kịp dựng hạ tầng event-sourcing (topic mới, consumer projection, tooling replay); latency đọc phụ thuộc consumer lag; tăng độ phức tạp cho 1 service brownfield.                 | **Rejected** cho W04 — snapshot đã đủ tốt per BR-STKV2 spec; nếu tương lai movement rate cực cao → threshold re-evaluate. |
| **A4. Mirror-mode: mỗi write-path ghi TRỰC TIẾP vào `inventory_stock_ledger` + tự tính** | Thẳng và đơn giản, không cần shared service; latency mỗi lần ghi thấp                                | Vi phạm BR-STKV2-005a "gọi chung quy tắc"; 10 write-path × 4 bước = 40 điểm cài đặt có thể drift; test coverage bùng nổ; cascade forward phải mỗi caller tự loop.                                       | **Rejected** — DRY + việc enforce invariant cần shared engine; caller chỉ gọi 1 method.                                         |
| **A5. Materialized view PostgreSQL**                                                             | Zero-code declare; DB engine tự maintain                                                                      | Chi phí refresh cao (full refresh cả tenant + product + warehouse mỗi trigger); không hỗ trợ incremental refresh cho logic point-in-time snapshot; concurrency lock cả view khi refresh.                           | **Rejected** — không kiểm soát được granularity + hiệu năng.                                                                |

## Consequences

**Positive:**

- Tuân thủ BR-STKV2-001 nguyên văn: "sổ tồn ghi nhận biến động ngày + tồn cuối ngày, đọc gần nhất ≤ D không cộng dồn"; invariant của BR-STKV2-005a được enforce ở 1 chỗ duy nhất qua shared engine.
- Tối ưu storage: chỉ có row cho ngày có biến động (garage điển hình < 30 ngày có biến động/tháng cho 1 mã hot).
- Query point-in-time O(log N) qua index `(tenant_id, product_code, warehouse_code, movement_date DESC)` — mục tiêu p95 ≤ 300ms cho dashboard tồn-đến-ngày là đạt được.
- Rebuild-safe: projection 2-nguồn → có thể `TRUNCATE` ledger + rebuild toàn bộ khi cần migration.
- Legacy `inventory_stock` không đổi → zero rủi ro regression cho UI V1.
- Invariant tồn âm tự động được enforce trong cascade → OB import/EDIT/DELETE + guard của phiếu đều dùng chung một mã lỗi `ERR-INV-036`.

**Negative:**

- **Chiều dài chain recompute biến thiên** (cascade từ D tới ngày cuối cùng) — worst-case 1 tenant + 1 (mã+kho) hot có 5 năm history + edit ngày OB gốc → phải recompute ~1800 ngày. **Mitigation**: (a) trường hợp hiếm (edit OB post-migration thường 1-2 lần/tenant); (b) Redisson lock ngăn cascade đồng thời; (c) batch upsert bằng native SQL; (d) monitor threshold p95 — nếu > 5s → async qua Kafka.
- **Nghĩa vụ double-write khi co-exist với legacy `inventory_stock`** (đến khi deprecate legacy ở W06) — legacy vẫn được update bởi V1 stock service; ledger V2 update riêng biệt. Rủi ro drift khi flow receipt/delivery V1 chưa migrate. **Mitigation**: W04 chỉ có OB ghi vào ledger V2; V5/V6 khi RECEIPT-V2 + DELIVERY-V2 kick off, chạy phân tích drift + job đối soát trước khi merge.
- **Bottleneck ở shared engine** khi có 100+ ghi đồng thời trên cùng tenant nhưng khác key → contention ở method của engine (spring bean scope). **Mitigation**: engine là stateless singleton; contention chỉ xảy ra ở granularity lock (per-key). Không phải bottleneck trong thực tế.

**Risks:**

- **Race khi rebuild** khi dữ liệu nguồn đang thay đổi (2 write-path đồng thời trên cùng key). **Mitigation**: Redisson lock per key; caller phải acquire trước khi mutate nguồn (OB import obtain lock → mutate bảng OB → gọi recompute → release).
- **Tồn âm ở ngày trung gian nhưng ≥ 0 ở ngày cuối** (write-path muốn ghi lỗ tạm rồi hồi phục) → engine reject nhưng caller có thể muốn cho phép. **Mitigation**: business đã chốt BR-STKV2-005a bước 4 = chặn point-in-time; ADR align (không có business case "cho phép trung gian âm"). Nếu tương lai thay đổi → CR.
- **Vòng lặp cascade vô hạn** khi 2 lần gọi engine trigger lẫn nhau. **Mitigation**: engine chỉ được gọi từ write-path (adapter → service → engine → JPA), **KHÔNG gọi từ trong chính engine**; luồng dữ liệu 1 chiều.

**Trade-off accept:** Chấp nhận **độ trễ recompute biến thiên** đổi lấy **tuân thủ BR** + **khả năng rebuild** + **hiệu quả storage** + **invariant single-source-of-truth**. Việc co-exist double-source với legacy `inventory_stock` là chi phí chuyển tiếp phải trả để đảm bảo zero-regression cho UI V1.

**Test verification (DEV Stage — W04):**

- Test 1: Import OB 100 dòng cho 100 (mã+kho) chưa có phiếu → ledger có 100 rows OB baseline. Mỗi row: `inbound_qty=opening_balance_line.quantity_on_hand`, `inbound_value=opening_balance_line.value_on_hand`, `outbound_qty=outbound_value=0`, `closing_qty` = running formula (previous_closing=0 vì row đầu → `closing_qty=inbound_qty=quantity_on_hand`), `closing_value = inbound_value = value_on_hand`. Engine detect row đầu chuỗi (khi cần audit/debug) qua `ORDER BY movement_date ASC LIMIT 1 per (tenant, product, warehouse)` — v6 uniform running formula, KHÔNG special-case "given" (v5 drop `movement_kind` giữ nguyên).
- Test 2: Import OB rồi tạo phiếu nhập 2 ngày sau → ledger có 2 rows: OB baseline + biến động slip + tồn cuối running.
- Test 3: Edit OB SL từ 100 → 80 (đủ để không âm) → cascade recompute 30 ngày sau → mọi closing tự update; response 200 OK.
- Test 4: Delete OB làm tồn (mã+kho) âm ở ngày sau → engine trả `ERR-INV-036` → rollback transaction → OB không bị xóa; ledger không đổi.
- Test 5: 2 lần recompute đồng thời trên cùng (mã+kho) → 1 acquire lock thành công, 1 wait/retry → serialize đúng thứ tự; không drift.
- Test 6: BQGQ chạy → gọi `recomputeValuesOnly` cho mọi (mã+kho) trong kỳ → SL giữ nguyên; GT xuất cập nhật; GT closing cập nhật; nhập không đổi.

## References

- [`Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md`](../../Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md) §2.1 BR-STKV2-001, BR-STKV2-005a — nền tảng
- [`Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md`](../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md) §2.1 BR-OB-015 (chặn tồn âm point-in-time), BR-OB-016 (OB phải trước phiếu)
- [`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.2 BR-PRC-005 (cập nhật GT sổ tồn khi BQGQ)
- [`Architecture/hld/gf-inventory-HLD.md`](../hld/gf-inventory-HLD.md) §5 Data Ownership — legacy `inventory_stock` + new `inventory_stock_ledger` co-exist
- [`Architecture/data/gf-inventory-data-model.md`](../data/gf-inventory-data-model.md) §4b — schema `inventory_stock_ledger` + `opening_balance_line` (batch này)
- [`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`](../../Execution/work-packages/PKG-W04-inventory-period-opening-balance.md) §2.2, §3
- Related ADRs: ADR-004 (outbox/inbox), ADR-009 (chỉ scalar FK, self-FK OK), ADR-017 (inventory V2 additive), ADR-018 (row cap defensive cho bulk-import), ADR-019 (pattern REST advisory cho AP trên gf-accounting — precedent cross-boundary consumer)

## Change Log

| Date       | Version | Author                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------- | ------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-08 | 6 | Architecture Authority (per BA feedback via user quannn — second turn) | **Reverse v5 OB row semantic — uniform running formula cho MỌI row** per user quannn 2026-07-08 "inbound_qty, inbound_value sẽ là số lượng nhập từ import vào, Công thức tính tồn cuối closing_qty/closing_value: Tồn cuối của dòng trên trước đó + Nhập - Xuất" + AskUserQuestion resolve "OB tính như 'Nhập trong kỳ'" (override v5 double-count rationale). Design change: OB baseline row đặt qty/value vào `inbound_*` thay vì `closing_*` given; `closing_*` chạy running formula uniform cho MỌI row (previous_closing=0 cho row đầu → `closing = inbound`). NXT report BR-STKV2-010 `SUM(inbound_qty)/SUM(inbound_value)` trong kỳ **bao gồm** OB row — BA xem OB là "nhập lần đầu" nên KHÔNG double-count. Engine cascade đơn giản hơn v5 (1 formula, không special-case "given"); engine vẫn detect row đầu chuỗi qua `ORDER BY movement_date ASC LIMIT 1 per key` khi cần audit/debug identify baseline vs slip (không dùng column tag; `movement_kind` giữ drop per v5). Cascade 2 sub-edits ADR-020: (1) §Decision bullet "Độ chi tiết lưu trữ" — reword row đầu chuỗi từ `inbound_qty=0, closing_qty=quantity_on_hand given` → `inbound_qty=quantity_on_hand, inbound_value=value_on_hand, outbound_*=0, closing_*=running formula uniform`. Rationale block mới cite BA override v5 double-count. (2) §Test verification Test 1 — reword từ `inbound_qty=outbound_qty=0, closing_qty=quantity_on_hand given` → `inbound_qty=quantity_on_hand, inbound_value=value_on_hand, closing_qty=inbound_qty (running formula, previous_closing=0)`. **KHÔNG đụng**: (a) §Context + Constraints; (b) §Decision Threshold + 5 alternatives; (c) §Component Interface C1-C8 (semantic engine method surface không đổi — chỉ nội dung field semantic đổi, contract shape identical); (d) §Consequences Positive/Negative/Risks; (e) §References; (f) Test 2/3/4/5/6 (semantic uniform formula tự thỏa mãn). Cascade pair với `gf-inventory-data-model.md v21→v22` §4b.2 (column `inbound_qty`/`inbound_value` descriptions + Row-type semantics block reword). `gf-inventory-HLD.md` follow-up if references row-level semantic. `gf-inventory-api.md` không đụng (internal ledger semantic, không expose REST). Migration `V20260707020000__create_inventory_stock_ledger.sql` KHÔNG đổi (column names + types + CHECK constraints unchanged — CHECK `inbound_qty >= 0` vẫn thỏa vì OB.qty ≥ 0). Backward-compat: W04 chưa DEV nên semantic change safe at design time. Follow-up: `StockLedgerRecomputeService` implementation update — DEV agent gf-inventory Day 2-3 W04 áp uniform formula không skip row nào. v5 → v6. |
| 2026-07-08 | 5 | Architecture Authority (per BA feedback via user quannn) | **Drop `movement_kind` column khỏi `inventory_stock_ledger` — §Decision reword row-type semantics** per BA feedback via user quannn 2026-07-08 "theo quản lý kho thì chỉ có 1 sản phẩm trong `inventory_stock_ledger`, tất cả các biến động trên sản phẩm đó, sẽ chỉ thao tác trên 1 sản phẩm đó, không quy định type" + AskUserQuestion resolve "sẽ loại bỏ trường movement_kind. lên plan sửa các logic liên quan". BA muốn ledger đơn giản, 1 chuỗi ledger duy nhất per key, không phân biệt OB vs SLIP type. Design decision (Approach A): giữ OB row trong ledger (row đầu chuỗi per key), engine detect via `ORDER BY movement_date ASC LIMIT 1 per (tenant, product, warehouse)` thay column tag; OB row có `inbound_qty=0`, `outbound_qty=0`, `closing_qty=opening_balance_line.quantity_on_hand` given trực tiếp từ source (không đặt vào inbound để tránh NXT BR-STKV2-010 double-count). SLIP row semantic không đổi (aggregate biến động phiếu ngày đó, running formula). BR-OB-016 invariant OB.as_of_date < mọi slip.date đảm bảo row đầu chuỗi = OB nếu tồn tại, không collision. Cascade 2 sub-edits ADR-020: (1) §Decision bullet "Độ chi tiết lưu trữ" — reword từ "Row OB baseline có movement_kind='OB', Row sau có movement_kind='SLIP'" → "Row đầu chuỗi per key (min movement_date) = OB baseline với closing_qty given từ opening_balance_line; Row sau = biến động phiếu aggregate với running formula. Engine detect via ORDER BY thay column tag (v5 drop movement_kind per BA feedback 2026-07-08). Trade-off: engine 1 index scan thêm (idx_ledger_lookup DESC cover, đổi chiều ASC). NXT report simpler (không cần filter type)". (2) §Test verification Test 1 — reword từ "100 rows movement_kind='OB'" → "100 rows là row đầu chuỗi per key (inbound=outbound=0, closing_qty=quantity_on_hand). Engine detect via ORDER BY ASC LIMIT 1". **KHÔNG đụng**: (a) §Context (câu hỏi chính + Constraints không thay đổi); (b) §Decision Threshold + 5 alternatives considered; (c) §Component Interface C1-C8 (contract engine formal chưa mention movement_kind); (d) §Consequences (Positive/Negative/Risks — trade-off vẫn valid); (e) §References. Cascade pair với `gf-inventory-data-model.md v20→v21` §4b.2 (drop column từ table + ERD + Constraints + add row-type semantics block) + `gf-inventory-HLD` §Stock Ledger V2 row description reword. `gf-inventory-api.md` không đụng (movement_kind internal field, không expose ra REST response). Migration `V20260707020000__create_inventory_stock_ledger.sql` update DDL in-place (W04 chưa DEV, safe). Backward-compat: W04 chưa DEV nên schema change safe at design time. Follow-up: `StockLedgerRecomputeService` implementation update — DEV agent gf-inventory Day 2-3 W04. v4 → v5. |
| 2026-07-07 | 4       | Architecture Authority + Delivery Authority | **Rewrite §Component Interface — strip Java code, giữ logic/decision contract** (per user review "chỉ nói về logic không nói về cách code"). Bằng chứng house style (Explore audit 7 ADR khác): `ADR-004`, `ADR-009`, `ADR-017`, `ADR-018`, `ADR-019`, `ADR-021`, `ADR-022` **ZERO** Java code fence; `_TEMPLATE-ADR.md` không prescribe heading `Component Interface`/`Code Contract`. ADR-020 v3 outlier với 10 Java code fence. Fix: rewrite C1-C6 dạng logic contract (decision table + prose ngữ nghĩa + BR cite), giữ C7 (observability — cross-language semantic đã sẵn) + C8 (backward-compat matrix — đã sẵn). Cụ thể sub-section: **C1** interface Java + Javadoc → **bảng 3 method surface** (M1 recompute per-key active, M2 recompute bulk active, M3 recompute values-only W06 stub) mô tả semantic không Java syntax; **C2** record + constructor validation → **bảng command shape 5 field** (Field/Type semantic/Required/Constraint/Cite); **C3** enum Java → **bảng 7 audit values** với wave scope + write-path FEAT cite + sync với `updated_by` column; **C4** record → **bảng result shape 7 field** + REST payload mapping table (giữ nguyên architectural); **C5** sealed class hierarchy + 3 permits → **bảng 3 exception category** (NegativeStock business + LockTimeout technical + SourceStale technical) × errorCode × carrier fields × business/technical nature; **C6** bullets có `@Transactional`/`ThreadLocal`/`TransactionSynchronizationManager` → **4 quy tắc ngữ nghĩa** (caller owns tx / lock inside tx release after completion / reentrancy blocked / ordered lock acquisition ASCII) — Redisson vẫn được cite ở dòng "Runtime dependency" nhưng như dep declaration không phải code; **C7** log level lines reference class name → refactor "exception category NegativeStock/LockTimeout/SourceStale (C5)"; **C8** row 2 "un-comment `recomputeValuesOnly()`" → "activate stub M3", row 3 "field trong RecomputeCommand/RecomputeResult" → "field trong command shape C2 / result shape C4" + thêm row mới cho ordered lock algorithm change. **10 gap G1-G10 vẫn đóng** — chỉ đổi hình thức từ Java syntax sang logic contract, contract nội dung identical. **Anchor labels C1-C8 giữ nguyên** — cross-ref từ HLD v16 §7 Forbidden (C1/C5/C6) + api.md v41 §3b (C4) không cần đổi. Additive-only — KHÔNG đổi §Context, §Decision behavior, §Alternatives Considered, §Consequences, §Test verification, §References. File giảm từ ~365 lines (v3) xuống ~260 lines (v4) do bỏ Java code blocks. v3 → v4. |
| 2026-07-07 | 3       | Architecture Authority + Delivery Authority | **Đóng gap "formal method contract/DTO" — thêm §Component Interface (W04 baseline)** giữa §Decision Threshold và §Alternatives Considered. 8 sub-section: **C1 Java interface** (`StockLedgerRecomputeService` với `recompute()` + `recomputeBatch()` + stub `recomputeValuesOnly` cho W06); **C2 DTO `RecomputeCommand`** (record với constructor validation fail-fast); **C3 enum `OriginContext`** (7 values sync 1-1 với `inventory_stock_ledger.updated_by` trigger source — 3 W04 wired + 3 W05 stub + 1 W06 stub); **C4 DTO `RecomputeResult`** với REST payload 1-1 mapping bảng cột `cascadedKeys[]` (canonical `affectedRows`, legacy alias `recomputedRows` deprecation window); **C5 exception hierarchy** sealed base `StockLedgerRecomputeException` + 3 permits `NegativeStockException` (ERR-INV-036 + offendingDate/currentClosing/attemptedDelta/offendingCommand carrier) + `LockTimeoutException` (ERR-CMN-007) + `SourceStaleException` (internal retry); **C6 transaction + concurrency contract** (caller mở @Transactional REQUIRED; engine join tx; lock acquire trong tx + release qua TransactionSynchronization.afterCompletion; reentrancy guard ThreadLocal; ordered lock acquisition ASCII (productCode, warehouseCode) tránh deadlock cross-key cho recomputeBatch); **C7 observability contract** (4 Micrometer metrics, structured log INFO/WARN/ERROR, OpenTelemetry span attributes); **C8 backward-compat matrix** (add enum value additive; rename/remove DTO field = MAJOR bump). Đóng 10 gap G1-G10 phân tích trong session (G1 return type, G2 exception hierarchy, G3 arg types/nullability, G4 batch semantic per-key vs bulk, G5 transaction boundary, G6 source filter enum, G7 recomputeValuesOnly stub, G8 observability, G9 race window OB-mutate vs recompute, G10 recomputedRows semantic ambiguity). Additive-only — KHÔNG đổi §Decision behavior, §Alternatives Considered, §Consequences, §Test verification. Downstream cascade (optional, follow-up CR MINOR nếu cần): (a) HLD §7 Forbidden có thể cross-ref §Component Interface C1 (mechanical rule "phải gọi service, không bypass"); (b) api.md §3b `cascadedKeys[]` field description có thể cite §Component Interface C4 mapping bảng. v2 → v3. |
| 2026-07-06 | 2       | Architecture Authority (agent-arch-author W04) | Dịch toàn bộ nội dung mô tả sang tiếng Việt có dấu theo yêu cầu user — không đổi quyết định/logic/số liệu, chỉ đổi ngôn ngữ trình bày. Đã dịch: §Context (câu hỏi chính + 2 khối Constraints), §Decision (bullets + Threshold), §Alternatives Considered (header cột`Pros` → `Ưu điểm`, `Cons` → `Nhược điểm`; dịch nội dung 2 cột đó; cột "Tại sao không" giữ nguyên), §Consequences (Positive/Negative/Risks/Trade-off accept — giữ nguyên label in đậm tiếng Anh, chỉ dịch câu mô tả), §Test verification (6 test case). Giữ nguyên 7 heading cấu trúc, frontmatter, mọi identifier kỹ thuật (tên bảng/cột/class/service, mã lỗi, citation ID, path), và mọi code block. v1 → v2. |
| 2026-07-06 | 1       | Architecture Authority (agent-arch-author W04) | ADR khởi tạo — Mô hình sổ tồn daily-snapshot + engine dùng chung`StockLedgerRecomputeService` hiện thực hóa BR-STKV2-005a. 1 row cho mỗi (tenant, product, warehouse, movement_date), đọc qua `ORDER BY DESC LIMIT 1` cho point-in-time; ghi qua cascade recompute forward 5 bước với Redisson lock. Co-exist với legacy `inventory_stock` (V1 running qty) — không mirror, không replace trong W04. Đã cân nhắc 5 alternatives (A1 running total, A2 dense-fill, A3 event-sourced, A4 no-engine mirror, A5 materialized view). Giải quyết PKG-W04 NEED CONFIRMATION #1 "cơ chế sổ tồn point-in-time vs running total".                                                                                                                       |
