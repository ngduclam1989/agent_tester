---
type: execution
artifact_kind: work-package
status: PLANNED
version: 10
tier: T4
owner_authority: Delivery Authority
wave: "W06"
last_reviewed: "2026-08-03" # v10
---

# PKG-W06 — Inventory V2: Tính giá + Báo cáo

> Work package cho Wave 6 (Inventory V2 slice 4/4 — wave cuối): deliver **EP-INVENTORY-ACCOUNTING-PERIOD nhóm PRC** (5 FEAT: LIST/CREATE/DETAIL/RECALC/DELETE) + **EP-INVENTORY-STOCK-V2** (3 FEAT: STK-LIST-V2/IP-VIEW-V2/STK-DETAIL-V2). PRC = phần phức tạp nhất toàn Inventory V2 (BQGQ tính lặp hội tụ tự tham chiếu + Temporal async execution). **PRC master boundary = `gf-accounting`** (không phải `gf-inventory`) — quyết định ratified `/arch-design W06` Round 1 (2026-07-22) per ADR-027 + ADR-028. Full rebuild từ skeleton v2 sau khi Product docs (BA-review 2026-07-24, 8/9 finding resolved) + Architecture docs (`ARCH-REVIEW-W06.md` UNBLOCK SA ratify + drift re-check `MINOR_DRIFT` không block) đã sẵn sàng. M01 Vertical-Slice. Timebox 5 ngày. Update Actuals (§10) cuối wave.

## 1. Overview

| Field | Value |
|---|---|
| Wave | `W06 — Tính giá + Báo cáo` |
| Epic | `EP-INVENTORY-ACCOUNTING-PERIOD` (v23, nhóm PRC) + `EP-INVENTORY-STOCK-V2` (v8) |
| Duration | 5 ngày làm việc (timebox cố định) |
| Features (8) | PRC (5): `FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE` · STOCK-V2 (3): `FEAT-STK-LIST-V2` · `FEAT-IP-VIEW-V2` · `FEAT-STK-DETAIL-V2` |
| Boundaries affected | `gf-accounting` (**PRC master — NEW boundary W06**, 6 endpoint W06-1..6 + Temporal workflow embedded) · `gf-inventory` (5 protected S2S PRC-facing W06-P1..P5 + 3 public Stock V2 Reports W06-STK-Q1..Q3 + 3 export EX1..EX3) · `agg-garage-graph` (BFF §3f PRC 6 op + §3j Stock V2 6 op passthrough) · `garage-web` (5 route: 2 PRC + 3 report) · `garage-mobile` (**chỉ `FEAT-STK-LIST-V2`** — Q1 tồn-đến-ngày; PRC + IP-VIEW-V2 + STK-DETAIL-V2 web-only) |
| Cross-wave state-matrix (KHÔNG count FEAT) | `FEAT-INV-MOBILE-MENU` — hub enable thêm 1 tile "Tồn kho" → tổng 6 tile hiển thị, thứ tự canonical per **BR-INV-MENU-001**; ~1h task |
| Vertical slice | Kế toán chạy tính giá BQGQ cuối kỳ (async, polling 5s) → giá vốn phiếu xuất + giá trị sổ tồn cập nhật → xem báo cáo tồn/NXT/thẻ kho khớp số; demo cả 2 platform (mobile chỉ Q1) |
| Entry gate | W05 complete (hard gate: Nhập/Xuất trong kỳ + sổ tồn stable — đầu vào BQGQ) |

## 2. Scope

### 2.1 Business Goal

Garage **tính giá xuất kho theo phương pháp Bình quân gia quyền cuối kỳ (BQGQ)** — điền giá vốn vào toàn bộ phiếu xuất trong kỳ/kho + cập nhật giá trị sổ tồn từ kỳ tính trở đi — và xem **3 báo cáo dựa trên sổ tồn** (tồn đến ngày / Nhập-Xuất-Tồn / thẻ kho theo phiếu) để nắm chính xác số lượng + giá trị tồn tại mọi thời điểm phục vụ kiểm kê, đối soát, ra quyết định. Đơn giá BQ = (GT tồn đầu + GT nhập trong kỳ) / (SL tồn đầu + SL nhập trong kỳ), làm tròn 2 chữ số thập phân **ngay sau khi tính** và dùng chính giá trị đã làm tròn để tính tiền vốn (BR-PRC-013). Kỳ có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu phiếu Xuất bán cùng kỳ → **tính lặp hội tụ** (BR-PRC-017, ADR-027). Job chạy **nền** (async, không chặn UI) — client nhận `runId` ngay (202 Accepted), poll tiến độ mỗi 5s, kết thúc nhận toast (BR-PRC-016).

### 2.2 Technical Scope

**8 feature** (2 module không đồng nhất — PRC là job chạy tính + audit log; STOCK-V2 là 3 báo cáo đọc realtime từ sổ tồn):

- Tính giá xuất kho (PRC, 5 — boundary `gf-accounting`): `FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE`
- Báo cáo tồn V2 (STOCK, 3 — boundary `gf-inventory`): `FEAT-STK-LIST-V2` (tồn đến ngày, web+mobile) · `FEAT-IP-VIEW-V2` (NXT, web-only) · `FEAT-STK-DETAIL-V2` (thẻ kho, web-only)
- **Cross-wave state-matrix update (boundary `garage-mobile`)**: `FEAT-INV-MOBILE-MENU` (partial — hub enable thêm **1 tile "Tồn kho"**, INSERT vị trí 5 + di chuyển "Tồn đầu kỳ" xuống vị trí 6 → tổng 6 tile hiển thị W06 thứ tự canonical: Sản phẩm + Nhóm vật tư + Phiếu nhập + Phiếu xuất + **Tồn kho** + Tồn đầu kỳ); KHÔNG rebuild hub. Ship hub base W04, W05 đã flip 2 tile — W06 chỉ enable-flag flip conditional per **BR-INV-MENU-001** (~1h, không list vào FEAT count).

#### 2.2.1 Backend — `gf-accounting` (Java 21 / Spring Boot 3.5) — PRC master **[NEW boundary W06]**

> **`ddl-auto=update`** (Common Gotcha #5 — KHÔNG Flyway) — schema tự sinh từ JPA entity, **KHÔNG viết migration file**. Temporal worker embed trong Spring Boot main process (mirror `gf-sales` pattern), task queue `PRC_TASK_QUEUE` (Common Gotcha #7 — 6 service dùng Temporal, `gf-accounting` là service thứ 6, add per ADR-028 v2 Q2 v3 reversal 2026-07-23).

- **Entities** — 2 bảng mới per `gf-accounting-data-model.md` v14 §2quater:

| Bảng | Cột chính | Ràng buộc | BR ref |
|---|---|---|---|
| `price_calc_run` | id, tenant_id, garage_id, period_id, period_name_snapshot, from_date, to_date, warehouse_id/code/name, pricing_method (`PWA`), scope (`ALL\|SPECIFIC`), scope_predicate (JSONB), items_snapshot (JSONB), source_run_id, status (`PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS`), temporal_workflow_id, progress_items_total/done, items_resolved/done/error_count, warnings_skipped_items, executed_by/at, completed_at, error_summary, deleted_at/by | `uidx_prc_active_lock (tenant_id, garage_id, warehouse_id, period_id) WHERE status IN ('PENDING','RUNNING')` partial UNIQUE (Layer 3 concurrency guard); soft-delete `deleted_at IS NULL` mandatory filter | BR-PRC-001/008/009/014/016 |
| `price_calc_run_item` | id, tenant_id, run_id, product_code/id/name, main_unit_code, opening_qty/value, receipt_qty/value, delivery_qty/value, average_unit_price (scale 2), updated_delivery_slip_count, status (`RUNNING\|DONE\|ERROR`), error_reason (`NEGATIVE_STOCK\|ACCOUNTING_MISMATCH\|SYSTEM_ERROR`), error_message, iterations_applied, has_self_reference, computed_at | Uniqueness `(tenant_id, run_id, product_code)`; `idx_prc_item_error` partial `WHERE status='ERROR'` | BR-PRC-005/007/013/017 |

  Index chính: `idx_prc_run_tenant_garage_wh (tenant_id, garage_id, warehouse_id, executed_at DESC)` · `idx_prc_run_tenant_period (tenant_id, period_id, status)` · `idx_prc_item_run (tenant_id, run_id, status)` · `idx_prc_item_run_product (tenant_id, run_id, product_code)`.
- **Tenant filter** — `TenantFilter` + `TenantContext` enforced (Critical Rule #4); mọi index tenant-prefix.
- **REST endpoints** — index (Architecture spec = SSOT: `Architecture/api/gf-accounting-api.md` v24 **§5** + **§6 Naming Registry** — 6 endpoint, **KHÔNG duplicate spec, PKG chỉ index + dev-actionable notes**):

| # | Verb + Path | Logic / Validation (key) | Mã lỗi (key) | BR ref |
|---|---|---|---|---|
| W06-1 | `POST /api/v2/price-calc-runs/search` | Paged search: filter `warehouseId`/`pricingMethod`/`executedFrom-To`; sort mặc định `executedAt,desc` (BR-PRC-018); soft-delete exclude; `status ∈ {PENDING,RUNNING}` cả 2 hiển thị UI "Đang tính" (chỉ 3 UI state dù BE 4 enum, BR-PRC-014); p95 ≤300ms | `ERR-CMN-validation` | BR-PRC-014/018 |
| W06-2 | `GET /api/v2/price-calc-runs/{id}` | Detail + polling: `includeItems`/`itemStatus`/`keyword` query; response `progressPercent` = round(done/total×100); `items[]` + `aggregates{}` (8 field, luôn non-null bất kể `includeItems` — payload nhỏ, FE render Tổng đồng thời progress); Redis cache 3s TTL cho polling; p95 ≤100ms | `ERR-CMN-not-found` (404 tenant no-leak) | FEAT-PRC-DETAIL AC-2/AC-2c/AC-3 |
| W06-3 | `POST /api/v2/price-calc-runs` | **202 Accepted kick-off**: `periodId` (OPEN, else 409) + `warehouseId` + `pricingMethod` + `scope` (`ALL\|SPECIFIC`) + `items[]` (SPECIFIC, ≤500); INSERT row `status=PENDING` → `WorkflowClient.start()` `workflowId=prc-{tenantId}-{runId}`, `taskQueue=PRC_TASK_QUEUE`, `WorkflowIdReusePolicy.REJECT_DUPLICATE`, timeout 60min; response `{runId, status, pollingUrl, pollingIntervalHint:5000}`; **X-Idempotency-Key REQUIRED** window 5 phút (replay → 200 không phải 202); mã "Ngừng hoạt động" bị bỏ qua + toast "Đã bỏ qua N mã do ngừng hoạt động" (N=`warningsSkippedItems`, BR-PRC-009); Temporal outage → 503 + compensating DELETE row | `ERR-CMN-validation` · 409 (a: `ERR-INV-024` kỳ CLOSED, b: `ERR-INV-029` run-in-progress) · 503 | BR-PRC-001..017 |
| W06-4 | `POST /api/v2/price-calc-runs/{id}/recalc` | Tạo **row MỚI** `source_run_id` trỏ run gốc; body `runScope` (`ALL` resolve lại toàn bộ mã BQGQ Đang hoạt động, `ERROR_ONLY` chỉ mã Lỗi revalidate); copy-forward Phase 0; run gốc phải terminal status; 202 kick-off cùng pattern W06-3; ghi đè giá vốn + giá trị sổ tồn; `affectedSubsequentPeriods[]` cảnh báo kỳ sau cần tính lại (BR-PRC-015) | 409 (a: `ERR-INV-024`, b: `ERR-INV-029`) · 503 | BR-PRC-008/015 |
| W06-5 | `DELETE /api/v2/price-calc-runs/{id}` | Soft delete (`deleted_at/by`); **KHÔNG rollback giá vốn** (phiếu xuất giữ nguyên); chặn nếu kỳ đóng (`ERR-INV-024`, BR-PRC-011) HOẶC `status ∈ {PENDING,RUNNING}` (`ERR-INV-029`, BR-PRC-011); idempotent (repeat → 200 cached) | 409 (a/b như trên) | BR-PRC-011 |
| W06-6 | `POST /api/v2/price-calc-runs/lookup/items-for-cogs` | Dropdown "Thêm phụ tùng" scope "Chọn mã cụ thể" — trả mã BQGQ Đang hoạt động của garage + `hasDeliveryInPeriod`/`deliveryCountInPeriod`/`lastCalculatedAt`; cross-boundary compose `gf-erp-mdm` catalog + `gf-inventory` slip count; BFF cache 60s; p95 ≤500ms | `ERR-CMN-validation`/`not-found` | FEAT-PRC-CREATE AC-5/AC-6 |

- **Tech notes** — hexagonal layout; `PriceCalcRunController` + `PriceCalcRunService`; **Temporal workflow `PriceCalcRunWorkflow`** (7 activities: SnapshotPull · UpdateRunStatus · ComputeItem · BulkFillCost · BulkInheritCost · BulkRecomputeLedger · CommitRun) per ADR-028 v4; **engine BQGQ 5-phase** per ADR-027 v5 (Phase 0 resolve items → Phase 1 snapshot pull qua S2S §2.2.2 → Phase 2 compute per item parallel, tính lặp hội tụ khi `has_self_reference` với `SAFETY_ITERATION_CAP=100` — vượt cap → item `ERROR`/`SYSTEM_ERROR`, KHÔNG hard-block toàn run — → Phase 3 commit bulk-fill-cost → Phase 4 cascade sổ tồn → Phase 5 commit run status); công thức **Đơn giá BQ = (GT tồn đầu + GT nhập)/(SL tồn đầu + SL nhập)**, `HALF_UP` scale 2, dùng chính giá trị đã round để tính tiền vốn (BR-PRC-013); concurrency 3-layer (DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy` + partial unique index `uidx_prc_active_lock`); heartbeat 60s cho `ComputeItemActivity`; Idempotency-Key kick-off window 5 phút; coverage ≥ 80%.

#### 2.2.2 Backend — `gf-inventory` (Java 21 / Spring Boot 3.5) — Stock V2 Reports + PRC-facing S2S

- **REST endpoints** — index (Architecture spec = SSOT: `Architecture/api/gf-inventory-api.md` v72 **§3f PRC-facing S2S** + **§3g Stock V2 Reports**):

| # | Verb + Path | Logic / Validation (key) | Auth | BR ref |
|---|---|---|---|---|
| W06-P1 | `GET /protected/v1/stock-ledgers/at-date` | Batch snapshot sổ tồn tại `Từ ngày−1` — `warehouseId`/`asOfDate`/`productCodes[]` ≤200/req | x-api-key S2S | Phase 1 ADR-027 |
| W06-P2 | `POST /protected/v1/slips-in-period/search` | Enumerate phiếu nhập/xuất trong kỳ — `warehouseId`/`fromDate`/`toDate`/`productCodes[]`/`types[]` | x-api-key S2S | Phase 1 ADR-027 |
| W06-P3 | `POST /protected/v1/delivery-lines/bulk-fill-cost` | Ghi giá vốn phiếu xuất — chunk ≤500 lines, `X-Idempotency-Key: PRC-{runId}-FILL-{chunkIdx}` | x-api-key S2S | BR-PRC-005 |
| W06-P4 | `POST /protected/v1/receipt-lines/bulk-inherit-cost` | Kế thừa giá cho "Nhập hàng bán bị trả lại" — chunk ≤500, key `PRC-{runId}-INHERIT-{chunkIdx}` | x-api-key S2S | BR-PRC-017 (tính lặp) |
| W06-P5 | `POST /protected/v1/stock-ledgers/bulk-recompute` | Cascade sổ tồn từ `fromDate` — ≤200 productCodes/req, sync blocking ≤60s, key `PRC-{runId}-RECOMPUTE-{chunkIdx}` | x-api-key S2S | BR-PRC-005 (cập nhật GT tồn cuối) |
| W06-STK-Q1 | `POST /api/v1/stock-ledgers/at-date/search` | Báo cáo tồn đến ngày — `asOfDate`/`warehouseIds[]`/`keyword`; **hide rule OR** `(closing_qty <> 0 OR closing_value <> 0)` (v69, bắt case SL=0 nhưng GT≠0 chênh làm tròn BQGQ); `content[]` mỗi mã+kho = 1 dòng, `aggregates{totalQuantity,totalValue}` | JWT + tenant + branch | BR-STKV2-006/007 |
| W06-STK-Q2 | `POST /api/v1/stock/inout-summary/search` | Báo cáo NXT — `fromDate`/`toDate`/`warehouseIds[]`; 4 nhóm SL+GT (Đầu/Nhập/Xuất/Cuối) + `aggregates` 8 field | JWT + tenant + branch | BR-STKV2-009/010/011 |
| W06-STK-Q3 | `POST /api/v1/stock/card/search` | Thẻ kho — `productCode`+`warehouseCode`+`fromDate`+`toDate`; response `context{}` (1 lần) + `opening{}` + `content[]` (**mỗi dòng = 1 phiếu thật, per v71 KHÔNG còn field `movementKind`/dòng ảo OPENING/OB_IMPORT** — mỗi item tự mang `openingQty`/`closingQty` non-null cho pagination-safe running total) + `aggregates{}` BE-computed | JWT + tenant + branch | BR-STKV2-012/013 |
| W06-STK-EX1 | `GET /api/v1/stock-ledgers/at-date/export` | Xuất Excel Q1, row cap 50k, template `Báo cáo tồn kho.xlsx` | JWT + tenant + branch | BR-STKV2-005 |
| W06-STK-EX2 | `GET /api/v1/stock/inout-summary/export` | Xuất Excel Q2, row cap 50k, template `Báo cáo nhập xuất tồn.xlsx` | JWT + tenant + branch | BR-STKV2-005 |
| W06-STK-EX3 | `GET /api/v1/stock/card/export` | Xuất Excel Q3, row cap 10k, template `Báo cáo thẻ kho.xlsx` | JWT + tenant + branch | BR-STKV2-005 |

- **Tech notes** — S2S endpoint `/protected/v1/*` prefix, x-api-key auth (không JWT); Stock V2 Reports `/api/v1/*` public gateway JWT + `@FeatureOn(Inventory:InventoryV2)`; Q3 nguồn dữ liệu = **chi tiết phiếu nhập/xuất** (`receipt`+`receipt_line` UNION `delivery`+`delivery_line` POSTED, line-level join) — **KHÔNG đọc sổ tồn** (sổ tồn gộp phiếu cùng ngày mất granularity per-phiếu per BR-STKV2-013); sổ tồn chỉ dùng tra Đầu kỳ dòng đầu (point-lookup `max(movement_date) < fromDate`); Q3 no-movement case trả **200** với `content:[]` + `opening/aggregates` populated (KHÔNG 404 — FE render dòng Tổng Đầu=Cuối); tenant filter enforced mọi endpoint.
- **V1 Module Hide** (per `EP-INVENTORY-STOCK-V2.md` v9 §5.2, ratified v6 2026-07-13, tên controller sửa v9 2026-07-31 GAP-W06-GI-03 — **BẮT BUỘC cascade W06, KHÔNG optional**): khi flag `Inventory:InventoryV2` = ON → **2 V1 controller thật** (`InventoryStockController` — bao gồm cả logic điều chỉnh tồn, KHÔNG có class riêng `InventoryStockAdjustmentController` · `InventoryPeriodStockController` — KHÔNG phải `InventoryPeriodController`, thuộc `FEAT-STK-LIST`/`FEAT-STK-DETAIL`/`FEAT-STK-ADJUST`/`FEAT-STK-PRICE`/`FEAT-IP-VIEW` V1) thêm `@FeatureOff("Inventory:InventoryV2")` → trả **410 Gone** mã lỗi **`ERR-INV-050`** ("V1 endpoint đã ngừng cho tenant đã bật V2 — vui lòng sử dụng phiên bản V2"). Cả 2 controller đã có sẵn `@FeatureOn(FeatureFlags.INVENTORY_STOCK)` class-level — gate mới ưu tiên: `Inventory:InventoryV2` ON → 410 ngay; OFF → fallback check `INVENTORY_STOCK` như hiện tại. **V1 data KHÔNG delete** (giữ audit + rollback — flag OFF → V1 restore, V2 hidden đối xứng). Symmetric pattern đã áp dụng W05 cho slip V1 (`ERR-INV-050` cùng mã lỗi, reuse không tạo mã mới).
- Coverage ≥ 80%.

#### 2.2.3 BFF — `agg-garage-graph` (Node 22 / Apollo 4 / TypeScript)

- **GraphQL ops** — bảng (Architecture spec = SSOT: `Architecture/api/agg-garage-graph-graphql.md` v7.79 **§3f PRC** + **§3j Stock V2 Reports**; naming verbatim inherit REST — **no rename BFF-side**). **12 op W06 = 9 Query + 3 Mutation**:

| # | Type | Operation | Args | Maps to | Dev notes |
|---|---|---|---|---|---|
| W06-1 | `Query` | `priceCalcRunList` | `input: PriceCalcRunSearchInput!` | gf-accounting W06-1 | Passthrough; enrich `executedByName` (TENANT-USERS DataLoader) |
| W06-2 | `Query` | `priceCalcRunGet` | `id: ID!, includeItems, itemStatus, keyword` | gf-accounting W06-2 | Passthrough polling target 5s; `aggregates` verbatim pass |
| W06-6 | `Query` | `priceCalcItemsForCogsLookup` | `input: ItemsForCogsLookupInput!` | gf-accounting W06-6 | Cache 60s |
| W06-3 | `Mutation` | `priceCalcRunCreate` | `input: PriceCalcRunCreateInput!` | gf-accounting W06-3 | Idempotency-Key arg→header; 202 semantic pass qua GraphQL payload field `status` (không HTTP-level 202 — GraphQL luôn 200 transport, semantic ở payload) |
| W06-4 | `Mutation` | `priceCalcRunRecalc` | `id: ID!, runScope: PriceCalcRunScope!` | gf-accounting W06-4 | Idempotency-Key REQUIRED |
| W06-5 | `Mutation` | `priceCalcRunDelete` | `id: ID!` | gf-accounting W06-5 | — |
| W06-STK-Q1 | `Query` | `stockLedgerAtDate` | `input: StockLedgerAtDateInput!` | gf-inventory W06-STK-Q1 | Passthrough + `aggregates`; mobile SUPPORTED |
| W06-STK-Q2 | `Query` | `stockInoutSummary` | `input: StockInoutSummaryInput!` | gf-inventory W06-STK-Q2 | Web-only |
| W06-STK-Q3 | `Query` | `stockCardDetail` | `input: StockCardDetailInput!` | gf-inventory W06-STK-Q3 | Web-only; `context`/`opening`/`aggregates` verbatim pass |
| W06-STK-EX1 | `Query` | `stockLedgerAtDateExport` | same input Q1 | gf-inventory EX1 | Base64 binary passthrough proxy |
| W06-STK-EX2 | `Query` | `stockInoutSummaryExport` | same input Q2 | gf-inventory EX2 | Base64 binary passthrough proxy |
| W06-STK-EX3 | `Query` | `stockCardDetailExport` | same input Q3 | gf-inventory EX3 | Base64 binary passthrough proxy |

- **Implementation notes** — resolvers thuần passthrough (không business logic, không compute lại `aggregates` từ `items[]`/`content[]` — luôn dùng BE-computed); DataLoader `TENANT-USERS` cho `executedByName`; auth header propagation (`Authorization`/`X-Tenant-Id`/`X-Branch-Id`); Idempotency-Key arg→header forward verbatim cho 2 mutation (Create/Recalc); error-code map module extend `ERR-INV-024/029/030/031/052` + `ERR-CMN-validation/not-found`; `@FeatureOn(Inventory:InventoryV2)` fail-fast; coverage ≥ 80%.

#### 2.2.4 Web — `garage-web` (React 19 / Vite / shadcn/ui)

> **Project context**: desktop-only, no-i18n. **5 route** (2 PRC + 3 report) — Create/Delete/Recalc là **modal/dialog/inline action**, không phải route riêng.

- **Routes**:

| Route | Component | Feature |
|---|---|---|
| `/inventory/price-calc-runs` | `PriceCalcRunListPage` | `FEAT-PRC-LIST` |
| `/inventory/price-calc-runs/$id` | `PriceCalcRunDetailPage` | `FEAT-PRC-DETAIL` (gồm action Tính lại/Xóa log inline — `FEAT-PRC-RECALC`/`FEAT-PRC-DELETE`) |
| `/inventory-stock/reports/at-date` | `StockAtDateReportPage` | `FEAT-STK-LIST-V2` |
| `/inventory-stock/reports/inout` | `StockInoutSummaryReportPage` | `FEAT-IP-VIEW-V2` |
| `/inventory-stock/reports/card/$productCode` | `StockCardDetailPage` | `FEAT-STK-DETAIL-V2` (full-page, v8 — đổi từ popup; entry chỉ từ nút "Xem lịch sử" trên Q1, tự lấy mã+kho — **không chọn mã trực tiếp**; **không còn bộ lọc/chip Kho trên UI** (v15/16 — đã bỏ hẳn, trước đó là disabled chip); cột **"Số phiếu"** là link, click → **chuyển màn** (KHÔNG mở tab mới) sang `FEAT-IR-DETAIL-V2`/`FEAT-ID-DETAIL-V2` theo `slipType`) |

- **Reuse-First / Component-Inventory Gate** (BẮT BUỘC — `.claude/references/web-component-registry.yaml`):

| UI element | Lookup key | Component reuse |
|---|---|---|
| Bảng báo cáo + dòng Tổng | `data-table-with-pagination` | `share/tables/table-pagination` |
| Modal "Chạy tính giá" (Kỳ kế toán/Kho/scope/dropdown mã) | `form-*` + `domain-*-select` | reuse pattern W04 AP + W05 slip form |
| Bộ lọc khoảng ngày (NXT + Thẻ kho) | `form-date-range` (alias **period-picker**) | `share/date-picker/date-range-picker` |
| Xuất file Excel | `excel-export` | `share/exports/export-excel` |
| Empty state 3 báo cáo + PRC list | `no-data` | `share/emptys/no-data` |
| Loading khi polling / job chạy nền | `loading-inline` | `share/loadings/loading` |

  Registry v{current} đủ cover → **KHÔNG build-new component**. Riêng **progress/polling UI cho trạng thái "Đang tính"** — registry KHÔNG có dedicated progress-bar/job-progress component; search `progress`/`status-chip` trước; nếu xác nhận thiếu → `/allow-new-component` (1 component nhẹ: status chip "Đang tính" + optional %; KHÔNG dựng full progress-bar phức tạp vì AC-2c chỉ yêu cầu counter tổng hợp cho scope "Tất cả mã").
- **Polling pattern** — `PriceCalcRunDetailPage` tự động polling GET `priceCalcRunGet` mỗi **5000ms fixed** (KHÔNG backoff/adaptive — ADR-028 D1 + FEAT-PRC-DETAIL AC-2c) khi `status ∈ {PENDING,RUNNING}`; dừng khi terminal (`SUCCEEDED`/`COMPLETED_WITH_ERRORS`) → toast "Tính giá hoàn tất — N mã lỗi". `PENDING` + `RUNNING` cùng hiển thị chip "Đang tính" (không phân biệt UI).
- **Form / validation** — react-hook-form + zod; Modal "Chạy tính giá": Kỳ kế toán (chỉ status OPEN) + Kho (single-select) + scope radio (`Tất cả mã`/`Chọn mã cụ thể`) + dropdown "Thêm phụ tùng" (chỉ khi SPECIFIC). **2 filter** tại List (Phương pháp + Ngày thực hiện — Kho KHÔNG phải filter UI, chỉ context tại Create).
- **Error code mapping** — extend `src/features/inventory/error-messages.ts`: `ERR-INV-024` (kỳ đóng — generic wording v32 registry), `ERR-INV-029` (run-in-progress), `ERR-INV-030/031/052` (3 lý do lỗi mã), `ERR-CMN-validation/not-found`.
- **Authorization / route guard** — dual persona full access (accountant + garage-owner ngang quyền, BR-PRC-015/BR-STKV2-015).
- **§2.4.a Navigation & Routing (web) — BẮT BUỘC** (2 route prefix mới `/inventory/price-calc-runs*` + `/inventory-stock/reports/*`):
  - [ ] T-web-Nav1 Update `frontend/gf-gms-web/src/layouts/home/modules/constants.ts` — thêm 2 menu entry con dưới "Kho hàng" (hoặc parent tương ứng per Figma navbar): "Tính giá xuất kho" (`/inventory/price-calc-runs`) + "Báo cáo tồn kho" (`/inventory-stock/reports/at-date` làm default landing, 2 route con NXT/Thẻ kho không hiện riêng trong sidebar — chỉ truy cập qua tab/link trong trang báo cáo).
  - [ ] T-web-Nav2 Verify parent menu đúng theo Figma §0 ASCII navbar (KHÔNG tự bịa tên — verify Product Authority nếu Figma không rõ).
  - [ ] T-web-Nav3 Route guard dual persona (không RBAC-gated riêng).
  - [ ] T-web-Nav4 Breadcrumb chain + TanStack Router catch-all verify không hijack 5 route mới.
  - [ ] **T-web-Nav5 — V1 Module Hide (BẮT BUỘC, per `EP-INVENTORY-STOCK-V2.md` §5.2)**: khi flag `Inventory:InventoryV2` = ON → **ẩn 2 tab V1 khỏi menu top-nav** — (a) **"Tồn kho"** V1 (module cũ STK-LIST/DETAIL/ADJUST/PRICE); (b) **"Tồn kho theo kỳ"** V1 (`FEAT-IP-VIEW` cũ). 2 tab này thay thế bởi 2 menu entry mới ở T-web-Nav1. V1 route/component **KHÔNG xóa** (giữ rollback — flag OFF → V1 tab restore, V2 tab ẩn đối xứng); chỉ conditional render menu entry theo flag runtime (mirror `RouteFlagGate` pattern W05, nhưng ở đây là **menu-level hide**, không phải component-swap same-URL).
- **State / cache** — Apollo default; polling dùng `pollInterval: 5000` Apollo hook, KHÔNG custom setInterval.
- **Test ID convention** — `table-price-calc-runs` / `row-run-{id}` / `button-{action}` / `field-{name}` / `dialog-{name}` / `chip-status-{status}`; coverage ≥ 95%.
- **Coverage** ≥ 60% (Vitest + Testing Library, gồm polling mock test).

#### 2.2.5 Mobile — `garage-mobile` (Flutter 3.41 / Cubit)

> **Mobile scope W06 = 3 màn read-only: `FEAT-STK-LIST-V2` (Q1 tồn đến ngày — báo cáo + tìm kiếm + bộ lọc)**, theo Figma registry `Product/ux/figma/figma-links.yaml` W06 mobile block (screen node `21290:45967`/`46486`/`46503`/`47060`/`47678`/`47691`, hub tile `21521:71064`; rule v11: FEAT không gán Figma mobile = out-of-scope). Wave-spec `FEAT-STK-LIST-V2.md` v3 (tier-authoritative) + `_IMPLEMENTATION-CHECKLIST-W06-garage-mobile.md` v3 (gate STRICT PASS D1-D11) là nguồn task-by-task chi tiết — bảng dưới đây chỉ tóm tắt. PRC (5 FEAT) + IP-VIEW-V2 + STK-DETAIL-V2 = **web-only** (7 FEAT out-of-scope mobile).

- **Screens** (`lib/ui/inventory/stock_list/{list,search,filter}/` — subfolder riêng mỗi màn):

| Screen | Feature | Cubit | Figma mobile node (file `5YU4H3iY726P8KNxI9oCYF`) |
|---|---|---|---|
| `StockListPage` (báo cáo chính) | `FEAT-STK-LIST-V2` | `StockListCubit` | `21290:45967` |
| `StockListSearchPage` (tìm kiếm full-page push) | `FEAT-STK-LIST-V2` | `StockListSearchCubit` | `21290:46486`/`46503`/`47060` |
| `StockListFilterPage` (bộ lọc full-page push) | `FEAT-STK-LIST-V2` | `StockListFilterCubit` | `21290:47678`/`47691` |

  Path convention `lib/ui/inventory/stock_list/{list,search,filter}/`, class suffix `*Page`/`*Cubit`. **Read-only** — KHÔNG nút Tạo/Sửa/Xóa/Xuất file (export chỉ web). `StockListPage` auto-fetch mặc định (asOfDate=hôm nay); search debounce mã/tên; filter Kho (single-select) + khoảng ngày "đến ngày".
- **Hub state matrix W06** (`FEAT-INV-MOBILE-MENU`, **BR-INV-MENU-001** — thứ tự tile): `InventoryHubCubit` enable thêm **1 tile "Tồn kho"** (route → `StockListRoute`), **INSERT vị trí 5** + di chuyển "Tồn đầu kỳ" xuống vị trí 6 — thứ tự canonical **Sản phẩm · Nhóm vật tư · Phiếu nhập · Phiếu xuất · Tồn kho · Tồn đầu kỳ** (6/6 tile). KHÔNG rebuild hub.
- **GraphQL consume** — Query `stockLedgerAtDate` (op #366, v7.82 §3j, mobile SUPPORTED) + REUSE `searchWarehouses` (op #305, qua `SupplierRepository` — KHÔNG `WarehouseRepository`, không tồn tại trong codebase). PRC + Q2/Q3 KHÔNG consume trên mobile.
- **Mobile out-of-scope W06** (7 FEAT — web-only): `FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE` · `FEAT-IP-VIEW-V2` · `FEAT-STK-DETAIL-V2`. Muốn mở scope → raise CR bổ sung Figma mobile link trước.
- **Reuse-first widget canonical pattern**: `AppBarCustom` (**KHÔNG `CustomAppBar`**, deprecated per R10; nav-bar=`textSubtitleS4` §1.5a M-28) · `ListWidget` (pull-to-refresh + skeleton) · `SearchBarCustom` (`showClear:false`) · `AppTextField` / `DropdownTextField` / `DropdownMenuWidget` / `AppDatePicker` (filter) · `AppButton` (filter action bar) · `CustomScaffold` (SafeArea).
- **Mobile-specific concerns** — SafeArea bottom; pull-to-refresh (Screen 1); skeleton; responsive phone + tablet.
- **LocaleKeys MANDATORY** (M-30) — VN/EN qua `assets/localizations/{vi,en}.json` + `locale_keys.gen.dart`; CẤM hardcode VN literal `lib/ui/inventory/**`.
- **Semantics labels** — `tile-inventory-ton-kho` / `row-stock-{productCode}-{warehouseCode}` / `field-{name}`.
- **Feature-flag gate** — Firebase RemoteConfig `Inventory:InventoryV2` (reuse wiring) — tile ẩn khi OFF.
- **Coverage** ≥ 60% (widget test + `bloc_test` + alchemist golden 1 screen key state).

### 2.3 Out of Scope

- **Điều chỉnh tồn thủ công (V2 KHÔNG có ADJUST)** — mọi biến động qua phiếu nhập/xuất + OB.
- **File V1 cũ** (STK-LIST/DETAIL/ADJUST/PRICE, IP-VIEW) — không đụng, không link.
- **PRC mobile** (5 FEAT) + **IP-VIEW-V2 mobile** + **STK-DETAIL-V2 mobile** — web-only per Figma registry.
- **Kafka outbound event PRC** — không phát sinh event ra ngoài boundary (audit log nội bộ `price_calc_run` đủ).
- **Xuất file Excel trên mobile** — chỉ web (3 export endpoint EX1-3 gọi từ web).

### 2.4 DEV Playbook

**Bước 0 — Reading list**:

- Product: `EP-INVENTORY-ACCOUNTING-PERIOD` v23 (§3.2 công thức PRC) + `EP-INVENTORY-STOCK-V2` v8 + 8 FEAT (`FEAT-PRC-*` + `FEAT-STK-*`/`FEAT-IP-VIEW-V2`) + `BR-GF-INVENTORY-ACCOUNTING-PERIOD` v40 (BR-PRC-001..018) + `BR-GF-INVENTORY-STOCK-V2` v15 (BR-STKV2-001..015) + `Product/Commons/ERROR-CODE-REGISTRY.md` v32
- Architecture (BOUNDED per §0 Wave Index): `gf-accounting-api.md` v24 §5+§6 · `gf-inventory-api.md` v72 §3f+§3g+§5.2 · `agg-garage-graph-graphql.md` v7.79 §3f+§3j · `gf-accounting-data-model.md` v14 §2quater · **ADR-027 v5** (engine BQGQ + tính lặp hội tụ) · **ADR-028 v4** (async execution HTTP 202 + Temporal workflow) · `INTEG-EXT-gf-accounting-gf-inventory.md` v2 · `INTEG-FE-garage-web-agg-garage-graph.md` v23 §3.6d
- Knowledge Graph: `gf-accounting`, `gf-inventory`, `agg-garage-graph`, `garage-web`, `garage-mobile`
- Figma: registry `Product/ux/figma/figma-links.yaml` W06 block — web file `EMGjGsnAJzGoGwTSK7dTuZ` (8 node: PRC LIST/CREATE/DETAIL/DELETE + STK-LIST-V2/IP-VIEW-V2/STK-DETAIL-V2; **RECALC không có node riêng — action inline trên DETAIL**) + mobile file `5YU4H3iY726P8KNxI9oCYF` (1 node STK-LIST-V2)

**Bước 1 — Reuse-First / Component-Inventory Gate (BẮT BUỘC)**: Web `.claude/references/web-component-registry.yaml`: `data-table-with-pagination`/`form-date-range`/`excel-export`/`no-data`/`loading-inline`. Search `progress`/`status-chip` cho trạng thái "Đang tính" — registry hiện KHÔNG có dedicated component; nếu xác nhận thiếu → `/allow-new-component` (1 component nhẹ). Mobile `lib/ui/widgets/`: `ListWidget`/`SmartRefresher`/`CustomAppBar`. KHÔNG "build component X first".

**Bước 2 — Contract gate**: REST + GraphQL contract đã ratify (`ARCH-REVIEW-W06.md` UNBLOCK SA ratify 2026-07-23) — chốt Day 1 review, KHÔNG re-negotiate. Web/Mobile mock theo contract Day 1-2.

**Bước 3 — Figma gate**: Web 7/8 FEAT có node (RECALC action inline DETAIL, không cần node riêng); Mobile 1/8 FEAT (STK-LIST-V2). Spec verify qua `/prefetch-figma {platform} 06` nếu chưa prefetch.

**Bước 4 — Reference patterns**: report-table pattern reuse Q1/Q2 (giống pattern list W03/W04); job-async-polling pattern **MỚI cho Garage** (chưa có precedent — closest là period-closure Temporal ở `gf-inventory-worker`, nhưng đây khác boundary/API shape); form modal pattern W04 AP + W05 slip create.

**Bước 5 — Rules wire**: boundary isolation (gf-accounting đọc gf-inventory qua REST S2S x-api-key — KHÔNG direct DB; ngược lại gf-inventory đọc gf-accounting qua period-lock-check REST ADR-021 pattern); tenant filter mandatory; **`ddl-auto=update` cho gf-accounting — KHÔNG viết Flyway migration** (khác `gf-inventory` dùng Flyway additive); BQGQ làm tròn 2 lẻ dùng chính giá trị round để tính tiền (BR-PRC-013); tính lặp hội tụ có safety cap 100 (không hard cap cứng theo BA, nhưng Architecture có safety-net); chặn RECALC/xóa log khi kỳ đóng HOẶC run đang chạy; Q3 đọc chi tiết phiếu KHÔNG đọc sổ tồn gộp (BR-STKV2-013); KG-first; feature-flag gate.

**Bước 6 — KG update + self-check + exit gate**.

## 3. Entry Criteria

- [ ] Hard gate W05→W06 pass: Nhập/Xuất trong kỳ + sổ tồn stable (đầu vào BQGQ).
- [ ] Architecture pre-wave ratified (SA merge trước `/wave-start 06` — **đã UNBLOCK per `Tracking/ARCH-REVIEW-W06.md` Round 3, 2026-07-23**):
  - `Architecture/api/gf-accounting-api.md` **v24** §5 (6 endpoint W06-1..6) + §6 Naming Registry (`PriceCalcRun`/`PriceCalcRunItem`/`PriceCalcRunStatus`/`PriceCalcErrorReason`) — ✅ ACCEPTED
  - `Architecture/api/gf-inventory-api.md` **v72** §3f (5 S2S W06-P1..P5) + §3g (3 report + 3 export W06-STK-Q1..Q3/EX1..EX3) — ✅ ACCEPTED (NF-02 đã fix 2026-07-28 — §5.2 Naming Registry sync đúng field `openingQty`/`openingValue`, `movementKind` retag W04-write-side-only, KHÔNG còn drift)
  - `Architecture/api/agg-garage-graph-graphql.md` **v7.79** §3f (6 op PRC) + §3j (6 op Stock V2) — ✅ ACCEPTED, 12 op W06 = 9 Query + 3 Mutation
  - `Architecture/data/gf-accounting-data-model.md` **v14** §2quater (2 bảng `price_calc_run`/`price_calc_run_item`, `ddl-auto=update`)
  - **`ADR-027` v5 + `ADR-028` v4 — ✅ ACCEPTED** (engine BQGQ + tính lặp hội tụ safety cap 100; async pattern HTTP 202 + Temporal workflow `PRC_TASK_QUEUE`, embedded trong `gf-accounting` — Common Gotcha #7 update 6 service dùng Temporal)
  - `INTEG-EXT-gf-accounting-gf-inventory.md` **v2** (2 chiều: gf-accounting→gf-inventory READ+WRITE S2S; gf-inventory→gf-accounting READ period-lock-check) · `INTEG-FE-garage-web-agg-garage-graph.md` **v23** §3.6d
- [ ] PO sign-off `EP-INVENTORY-ACCOUNTING-PERIOD` v23 (nhóm PRC) + `EP-INVENTORY-STOCK-V2` v8 + 8 FEAT (AC chốt) + `BR-GF-INVENTORY-ACCOUNTING-PERIOD` v40 + `BR-GF-INVENTORY-STOCK-V2` v15 ratified — **✅ BA-review 2026-07-24 verdict NEEDS_REVISION → 8/9 P1/P2 finding resolved same-day** (F1/F3/F4/F5/F6/L1 fixed; F2/F8 false-positive; F7 deferred non-blocking wording clarify).
- [ ] **Reuse-First gate acknowledged** (§2.4 Bước 1). Figma web verified (7/8 FEAT node); Figma mobile verified (1/8 FEAT — STK-LIST-V2 only).
- [ ] KG `gf-accounting` (NEW entities) + `gf-inventory` (report views) review.
- [ ] Branch `feature/ep-inventory-v2-w06` sau W05 merge; STATE `wave=06`, `stage=PLANNING`.
- [ ] **Drift check BA↔SA đã pass**: `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md` verdict `CONSISTENT` (không block) — 7 finding gốc + NF-01 + NF-02 đều RESOLVED (NF-02 fix cuối cùng `gf-inventory-api.md` v72, 2026-07-28). Không còn drift Product↔Architecture nào cho W06.

### §3.X Infra Readiness Precondition

- [ ] App services trong wave scope (`python3 infra/wave_scope.py 06`) build/run được — verify `infra/wave-up.sh 06 --dry` không có boundary `BLOCKED`
- [ ] BFF (`:45401`) + Web (`:45300`) reachable sau `infra/wave-up.sh 06`; `gf-accounting` (PRC master, **service MỚI trong wave scope**) + `gf-inventory` (S2S callee) up
- [ ] **Temporal Cloud connectivity verify** — `gf-accounting` embed worker cần kết nối Temporal Cloud + task queue `PRC_TASK_QUEUE` registered; readiness check phải verify worker poll thành công (KHÔNG chỉ HTTP reachable)
- [ ] Playwright + API/Jest harness đã bootstrap (`Execution/auto/harness/{playwright,api}/node_modules` tồn tại)
- [ ] Nếu bất kỳ mục nào KHÔNG xác nhận được ở PLANNING → ghi vào §8 Risk & Mitigation, KHÔNG âm thầm bỏ qua

### §3.C Infra Readiness Gate — TEST_EXECUTION (remote-box mode)

> Precondition bắt buộc TRƯỚC `/test-exec` W06. Gate 1 lệnh — phải `READINESS: OK` mới spawn agent:
>
> ```bash
> TEST_HOST={remote-ip} bash scripts/test-readiness-check.sh 06 --live
> ```

| Nhóm | Việc | Chi tiết |
|---|---|---|
| Web/API | Trỏ env tới box | Web E2E/UI: `BASE_URL=http://{ip}:45300`. API: `AGG_GARAGE_GRAPH_URL=http://{ip}:45401/garage/graphql`, `GF_ACCOUNTING_BASE_URL=…`, `GF_INVENTORY_BASE_URL=…`, `SSO_STUB_URL=…:45410`. |
| Mobile | 1 màn read-only | Emulator gọi `{ip}` trực tiếp; `patrol build android` (nếu có Patrol test cho STK-LIST-V2). |

4 lưu ý remote-box: (1) readiness `--live` set `TEST_HOST={ip}`; (2) verify web :45300 gọi BFF `{ip}:45401`; (3) data-drift — PRC test job chạy nền có thể chạm dữ liệu dùng chung, giữ ổn định 1 run; (4) seed qua DB remote (period OPEN + slip data từ W05 test). No-converge: BLOCKED không giảm sau 1 run → STOP fix đúng nhóm, trần re-run = 2; FAIL (bug sản phẩm) → `/spawn-fix gf-accounting` hoặc `/spawn-fix gf-inventory`.

## 4. Agent Assignments

### 4.1 DEV Agents

| Agent | Boundary | Tasks | Estimated Effort |
|---|---|---|---|
| `agent-dev-gf-accounting` | `gf-accounting` (Java 21 / Spring Boot 3.5) — **PRC master, NEW boundary W06** | [Day 1] Contract review §5+§6 v24 + ADR-027 v5 + ADR-028 v4; scaffold 2 entity JPA (`ddl-auto=update` — **KHÔNG viết Flyway**) + `PriceCalcRunController/Service` (~4h); Temporal worker embed Spring Boot main process, register `PriceCalcRunWorkflow` trên `PRC_TASK_QUEUE` (~4h). [Day 2] W06-1/W06-2 (search/detail-polling) + W06-6 (lookup items-for-cogs cross-boundary gf-erp-mdm+gf-inventory) (~5h); W06-3 CREATE 202 kick-off — INSERT PENDING + `WorkflowClient.start()` + Idempotency-Key 5-phút window (~4h). [Day 3] **7 Temporal activities impl** (SnapshotPull qua S2S W06-P1/P2 · UpdateRunStatus · ComputeItem engine BQGQ 5-phase + tính lặp hội tụ `SAFETY_ITERATION_CAP=100` · BulkFillCost qua S2S W06-P3 · BulkInheritCost qua S2S W06-P4 · BulkRecomputeLedger qua S2S W06-P5 · CommitRun) — phần phức tạp nhất wave (~8h). [Day 4] W06-4 RECALC (copy-forward Phase 0 + `source_run_id`) + W06-5 DELETE (soft-delete + 2 guard 409) (~4h); concurrency 3-layer verify (DB lock + WorkflowIdReusePolicy + partial unique index) (~2h). [Day 5] Unit + integration test ≥80% — scenario: hội tụ tự tham chiếu (2-3 vòng) + safety cap trigger + kỳ đóng chặn CREATE/RECALC/DELETE + run-in-progress chặn + Idempotency replay + Temporal outage compensating rollback (~5h); KG sync + review fix (~3h). | **~39h (~5 ngày — dày nhất wave)** — engine BQGQ + Temporal integration là net-new complexity cho boundary chưa từng làm workflow trước W06. |
| `agent-dev-gf-inventory` | `gf-inventory` (Java 21 / Spring Boot 3.5) | [Day 1] Contract review §3f+§3g v71; scaffold `StockV2ReportController` + 5 S2S protected endpoint controller (~3h). [Day 2] W06-P1..P5 (5 S2S bulk/read endpoint, x-api-key auth, chunk idempotency `PRC-{runId}-{phase}-{chunkIdx}`) (~5h). [Day 3] W06-STK-Q1/Q2 (2 report — hide rule OR SL≠0/GT≠0 cho Q1; 4-nhóm cột Q2) (~4h); W06-STK-Q3 thẻ kho (đọc chi tiết phiếu KHÔNG sổ tồn gộp — JOIN receipt_line/delivery_line; `context`/`opening`/`aggregates` structure; 200 no-movement case) (~4h). [Day 4] W06-STK-EX1/EX2/EX3 (3 export Excel — POI SXSSF streaming, template binding `Product/ux/assets/*.xlsx`) (~4h). [Day 5] Unit + integration test ≥80% (S2S chunk idempotency + report hide-rule edge case + Q3 pagination-safe running total + export cap) (~4h); KG sync + review fix (~2h). | **~26h (~3.5 ngày)** |
| `agent-dev-agg-garage-graph` | `agg-garage-graph` (Node 22 / TS 5.8 / Apollo 4) | [Day 1] Contract lock §3f+§3j v7.79; scaffold `price-calc-run/` + `stock-v2-report/` module (~2h). [Day 2] 12 resolver passthrough (~5h); enrichment `executedByName` TENANT-USERS DataLoader + export base64 binary proxy (~2h); Idempotency-Key arg→header forward 2 mutation + `@FeatureOn` fail-fast + error-code map (~2h). [Day 3] Regression script `.regression.ts` mirror pattern hiện có (`price-calc-run` + `stock-v2-report`, KHÔNG Vitest — repo không có tooling này per CR-20260731-01) (~3h); KG sync (~1h). | ~15h (~2 ngày) |
| `agent-dev-garage-web` | `garage-web` (React 19 / Vite / shadcn/ui) | [Day 1] Reuse-First registry lookup (§2.4 Bước 1) + quyết định `/allow-new-component` cho status-chip "Đang tính" nếu cần (~1.5h); §2.4.a Navigation & Routing (2 menu entry mới + **T-web-Nav5 ẩn 2 tab V1 "Tồn kho"/"Tồn kho theo kỳ" theo flag**) (~1.5h); mock GraphQL Day 1; routes scaffold 5 route (~1.5h). [Day 2] `PriceCalcRunListPage` (2 filter + list + "Chạy tính giá" button) + Modal "Chạy tính giá" (Kỳ+Kho+scope+dropdown mã) (~5h); `PriceCalcRunDetailPage` (polling 5s Apollo `pollInterval` + bảng chi tiết mã/lỗi + action Tính lại/Xóa log) (~5h). [Day 3] 3 report page (`StockAtDateReportPage` + `StockInoutSummaryReportPage` + `StockCardDetailPage` full-page + bộ lọc Kho disabled context-only) + export button 3 nơi (~7h). [Day 4] `error-messages.ts` extend (thêm `ERR-INV-050` V1 endpoint 410 Gone — dùng khi debug/rollback, không phải happy path) + zod validation + toast wording verbatim ("Đã bỏ qua N mã do ngừng hoạt động"; "Tính giá hoàn tất — N mã lỗi") (~3h); Vitest ≥60% + testid ≥95% + polling mock test + **V1 tab hide/restore theo flag ON/OFF test** (~4h). [Day 5] KG sync + review fix (~2h). | ~30h (~3.5-4 ngày) |
| `agent-dev-garage-mobile` | `garage-mobile` (Flutter 3.41 / Cubit) | **Scope: 3 màn read-only `StockListPage`/`StockListSearchPage`/`StockListFilterPage` + hub tile enable** — task-by-task authoritative: `_IMPLEMENTATION-CHECKLIST-W06-garage-mobile.md` v3 (T1-T21). [Day 1] Reuse-First widget verify (T1); LocaleKeys VN/EN 17 key (T2); hub state matrix enable tile "Tồn kho" đúng thứ tự BR-INV-MENU-001 (T3) (~2h). [Day 2] `StockLedgerRepository` + REUSE `SupplierRepository.searchWarehouses` (T4-T5); `StockListPage` + Cubit + `StockProductCard` (T6-T8); `StockListSearchPage` + Cubit (T9-T10); `StockListFilterPage` + Cubit (T11-T12); route registration (T13) (~5h). [Day 3] Constants + error mapping + read-only grep gate + a11y + feature flag + document golden path (KHÔNG tự generate test file) + KG sync + icon inventory (T14-T21) (~2.5h). | ~9.5h (~1.5 ngày) |

**Parallel safety**: Contract gate cuối Day 1 (REST + GraphQL đã ratify — lock nhanh, không re-negotiate); `agent-dev-gf-accounting` chốt entity + Temporal wiring Day 1 (gate cho BFF `priceCalcRun*` ops); `agent-dev-gf-inventory` độc lập song song (Stock V2 Reports không phụ thuộc gf-accounting); Web + Mobile mock Day 1-2, wire thật Day 2-4. **`agent-dev-gf-accounting` Day 3 (7 Temporal activities) là critical path** — dày nhất wave, cần buffer nếu tràn (P2 drop-first = KHÔNG có, PRC là core value, không thể drop). Reuse-first gate BẮT BUỘC trước khi compose UI.

### 4.2 REVIEW Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-review-backend` | `gf-accounting` + `gf-inventory` — **`ddl-auto=update` verify KHÔNG có Flyway migration file mới cho gf-accounting** (khác gf-inventory dùng Flyway additive); entity scalar FK ADR-009; tenant filter enforce; Temporal workflow discipline (workflowId deterministic `prc-{tenantId}-{runId}`, `WorkflowIdReusePolicy.REJECT_DUPLICATE`, activity retry policy, heartbeat cho long-running `ComputeItemActivity`); concurrency 3-layer verify; BQGQ round `HALF_UP` scale 2 dùng chính giá trị round tính tiền (BR-PRC-013); tính lặp hội tụ safety cap 100 KHÔNG hard-block toàn run; S2S x-api-key auth (5 endpoint W06-P1..P5) + chunk idempotency; Q3 nguồn dữ liệu đúng (chi tiết phiếu, KHÔNG sổ tồn gộp); hide-rule Q1 đúng OR pattern; export template binding đúng file; **V1 Module Hide verify — 2 V1 controller thật (`InventoryStockController` + `InventoryPeriodStockController`, GAP-W06-GI-03 fix — KHÔNG phải 3) có `@FeatureOff("Inventory:InventoryV2")` → 410 Gone `ERR-INV-050` khi flag ON (ưu tiên trên `@FeatureOn(INVENTORY_STOCK)` sẵn có), V1 data KHÔNG bị xóa** (grep 2 controller class REQUIRED); coverage ≥80% | Post-DEV Day 4-5 |
| `agent-review-garage-web` | 5 route + Reuse-First registry compliance (FM-018/019) + polling `pollInterval:5000` fixed KHÔNG custom backoff + toast wording verbatim (registry v32) + Thẻ kho KHÔNG còn bộ lọc/chip Kho trên UI (đã bỏ hẳn, không phải disabled) + cột "Số phiếu" link chuyển màn (không mở tab mới) đúng `slipType` + Q3 no-movement case render dòng Tổng (KHÔNG treat 404 như empty) + **V1 Module Hide verify — 2 tab V1 "Tồn kho"/"Tồn kho theo kỳ" ẩn khỏi menu khi flag ON, restore khi flag OFF, V1 route/component KHÔNG xóa** + testid ≥95% + coverage ≥60% | Post-DEV Day 4-5 |
| `agent-review-garage-mobile` | 3 màn `StockListPage`/`StockListSearchPage`/`StockListFilterPage` read-only — canonical widget reuse (`AppBarCustom` KHÔNG `CustomAppBar`, KHÔNG raw Material), LocaleKeys M-30, hub 6 tile matrix đúng thứ tự BR-INV-MENU-001, per-page subfolder structure, KHÔNG có action Tạo/Sửa/Xóa/Export (7 FEAT out-of-scope verify), coverage ≥60% | Post-DEV Day 3 |

### 4.3 TEST Agents

| Agent | Scope | Activation |
|---|---|---|
| `agent-test-api` | 6 endpoint gf-accounting (W06-1..6) + 5 S2S gf-inventory (W06-P1..5) + 6 report/export gf-inventory (W06-STK-Q1..3/EX1..3) + 12 GraphQL op — **error code coverage** `ERR-INV-024/029/030/031/052` + `ERR-CMN-validation/not-found`; async state machine PENDING→RUNNING→SUCCEEDED/COMPLETED_WITH_ERRORS; Idempotency-Key replay (kick-off + S2S chunk); concurrency (2 CREATE cùng kỳ+kho → 1 thành công, 1 chặn `ERR-INV-029`); tính lặp hội tụ scenario (2-5 vòng + safety cap); Q3 no-movement 200 vs true-404 phân biệt | TEST_PLANNING song song REVIEW Day 4 |
| `agent-test-ui` | 5 route web — polling UI, Modal "Chạy tính giá", toast wording verbatim, empty state 3 báo cáo, export trigger, Thẻ kho không còn bộ lọc Kho trên UI + cột "Số phiếu" click → chuyển màn đúng chi tiết phiếu (không mở tab mới), accessibility | TEST_PLANNING Day 4 |
| `agent-test-e2e` | Journey: chạy PRC "Tất cả mã" → polling → hoàn tất → giá vốn phiếu xuất điền + giá trị sổ tồn cập nhật → báo cáo Q1/Q2/Q3 khớp số → thêm phiếu mới → tính lại (RECALC) → kết quả cập nhật + cảnh báo kỳ sau → kỳ có phiếu trả tự tham chiếu → hội tụ đúng → xóa log (không rollback giá vốn) → đóng kỳ → mọi thao tác PRC bị chặn `ERR-INV-024` | TEST_PLANNING Day 4 |
| `agent-test-performance` | BQGQ "Tất cả mã" quy mô lớn (nhiều mã × nhiều vòng lặp) — heartbeat + timeout Temporal; báo cáo tồn đến ngày p95 ≤300ms; thẻ kho running total pagination-safe qua nhiều trang; export cap 50k/10k row memory | Periodic + trước GA gate |
| `agent-test-mobile-ui` | 3 màn widget test + golden (List/Search/Filter Cubit state, info-row order) + hub 6 tile matrix + LocaleKeys VN/EN | TEST_PLANNING Day 3 |

## 5. Deliverables (Exit Criteria)

### 5.1 Code & Tests

- **gf-accounting** (Java) — **6 endpoint canonical** (`W06-1..6`) per `gf-accounting-api.md` v24 §5 + Temporal workflow subsystem:
  - Entity `price_calc_run` + `price_calc_run_item` — `ddl-auto=update` (KHÔNG Flyway migration file).
  - `PriceCalcRunWorkflow` (Temporal, task queue `PRC_TASK_QUEUE`) — 7 activities SnapshotPull/UpdateRunStatus/ComputeItem/BulkFillCost/BulkInheritCost/BulkRecomputeLedger/CommitRun; workflowId `prc-{tenantId}-{runId}` deterministic; `WorkflowIdReusePolicy.REJECT_DUPLICATE`; timeout 60min; heartbeat 60s `ComputeItemActivity`.
  - Engine BQGQ 5-phase (ADR-027) — công thức + tính lặp hội tụ tự tham chiếu (safety cap 100, KHÔNG hard-block toàn run khi vượt cap).
  - CRUD + lifecycle: search/detail-polling/create(202)/recalc(202 + source_run_id)/delete(soft, no-rollback) — 2 guard 409 (kỳ đóng + run-in-progress) toàn 3 write op.
  - Concurrency 3-layer: DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy` + partial unique index `uidx_prc_active_lock`.
  - Idempotency-Key kick-off 5 phút window.
  - Tenant filter enforced; unit test ≥ 80%; integration test Testcontainers + Temporal test env cover: hội tụ 2-5 vòng, safety cap trigger, concurrent create cùng kỳ+kho, kỳ đóng chặn 3 write op, Idempotency replay, Temporal outage compensating.
  - KG `gf-accounting.knowledge-graph.yaml` update — **entities Receipt-adjacent MỚI (`price_calc_run`/`price_calc_run_item`) + Temporal workflow registration**.
- **gf-inventory** (Java) — **11 endpoint canonical** (`W06-P1..5` S2S + `W06-STK-Q1..3` report + `W06-STK-EX1..3` export) per `gf-inventory-api.md` v72 §3f/§3g:
  - 5 S2S protected endpoint x-api-key + chunk idempotency `PRC-{runId}-{phase}-{chunkIdx}`.
  - 3 report endpoint (Q1 hide-rule OR SL≠0/GT≠0; Q2 4-nhóm cột; Q3 đọc chi tiết phiếu KHÔNG sổ tồn gộp, `context`/`opening`/`aggregates` structure, 200 no-movement case).
  - 3 export endpoint POI SXSSF streaming + template binding.
  - **V1 Module Hide**: **2 V1 controller thật** (`InventoryStockController`/`InventoryPeriodStockController` — GAP-W06-GI-03 fix, KHÔNG phải 3 class như bản trước) gắn `@FeatureOff("Inventory:InventoryV2")` → 410 Gone `ERR-INV-050` khi flag ON (ưu tiên trên `@FeatureOn(INVENTORY_STOCK)` sẵn có) (per `EP-INVENTORY-STOCK-V2.md` §5.2 v9). V1 data KHÔNG xóa.
  - Tenant filter enforced; unit test ≥ 80%; integration test cover S2S chunk idempotency + report hide-rule + Q3 pagination-safe running total + export row cap + V1 endpoint 410 khi flag ON / restore khi flag OFF.
  - KG `gf-inventory.knowledge-graph.yaml` update — 11 endpoint + `integration_consumers.gf-accounting (S2S)`.
- **agg-garage-graph** (Node BFF) — **12 op W06 canonical (9 Q + 3 M)**:
  - Schema §3f + §3j ratified (v7.79).
  - Resolvers passthrough + `executedByName` DataLoader enrichment + export base64 proxy + Idempotency-Key arg→header (2 mutation) + `@FeatureOn` fail-fast + error-code map.
  - 2 regression script `.regression.ts` (`price-calc-run` + `stock-v2-report`) PASS — mirror pattern hiện có, KHÔNG Vitest/coverage % (repo không có tooling này per CR-20260731-01); KG update.
- **garage-web** — 5 route:
  - `PriceCalcRunListPage` (2 filter) + Modal "Chạy tính giá" + `PriceCalcRunDetailPage` (polling 5s fixed + action Tính lại/Xóa log inline) + 3 report page (`StockAtDateReportPage`/`StockInoutSummaryReportPage`/`StockCardDetailPage` full-page).
  - **V1 Module Hide**: menu top-nav ẩn 2 tab V1 ("Tồn kho" + "Tồn kho theo kỳ") khi flag `Inventory:InventoryV2` ON — thay bởi 2 menu entry mới; V1 route/component KHÔNG xóa (rollback OFF → V1 tab restore, V2 tab ẩn đối xứng).
  - Toast wording verbatim (registry v32); Thẻ kho KHÔNG còn bộ lọc/chip Kho trên UI; cột "Số phiếu" link → chuyển màn sang chi tiết phiếu nhập/xuất theo `slipType` (không mở tab mới); Q3 no-movement render dòng Tổng (không catch 404).
  - react-hook-form + zod; error-code map extend (`ERR-INV-050` V1 endpoint gone); testid ≥ 95%; Vitest ≥ 60% (gồm polling mock + V1 tab hide/restore theo flag); KG update.
- **garage-mobile** — 3 màn read-only `StockListPage`/`StockListSearchPage`/`StockListFilterPage` (mỗi màn subfolder riêng `lib/ui/inventory/stock_list/{list,search,filter}/`):
  - Hub enable tile "Tồn kho" (6 tile W06, thứ tự canonical Sản phẩm·Nhóm vật tư·Phiếu nhập·Phiếu xuất·Tồn kho·Tồn đầu kỳ) — **BR-INV-MENU-001**.
  - Canonical widget reuse (`AppBarCustom` KHÔNG `CustomAppBar`); LocaleKeys VN/EN 17 key; SafeArea + pull-to-refresh + skeleton; Semantics labels.
  - Coverage ≥ 60% combined; DEV document golden path (`_OUTCOME`) — KHÔNG tự generate test file (TEST stage kế thừa); KG update — 7 FEAT web-only đánh dấu out-of-scope.
- **Cross-boundary integration test** (Testcontainers/E2E):
  - Chạy PRC "Tất cả mã" → S2S snapshot pull (W06-P1/P2) → compute → S2S bulk-fill-cost (W06-P3) → S2S bulk-recompute (W06-P5) → giá vốn phiếu xuất `gf-inventory.delivery_line.cost_value` + giá trị sổ tồn khớp.
  - Kỳ có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu → tính lặp hội tụ → S2S bulk-inherit-cost (W06-P4) đúng giá trị.
  - Chạy giá xong → báo cáo Q1/Q2/Q3 (gf-inventory) đọc sổ tồn đã cascade-update → số liệu khớp.
  - RECALC → `source_run_id` chain + `affectedSubsequentPeriods[]` cảnh báo đúng kỳ sau.
  - Tenant isolation: tenant A chạy PRC → tenant B không thấy; S2S call luôn tenant-scoped.
  - Concurrent CREATE cùng (tenant, kỳ, kho) → 1 thành công (202), 1 chặn `ERR-INV-029`.

### 5.2 Architecture & Docs

- KG update: `gf-accounting` (2 entity MỚI + 6 endpoint + Temporal workflow registration), `gf-inventory` (11 endpoint + S2S consumer `gf-accounting`), `agg-garage-graph` (12 op W06), `garage-web` (5 route), `garage-mobile` (1 screen + hub state matrix W06) — `last_verified` updated.
- `ADR-027` v5 + `ADR-028` v4 merged (đã ACCEPTED trước wave).
- **NF-02** — ✅ đã fix (2026-07-28, `gf-inventory-api.md` v71→v72): §5.2 Naming Registry 3 chỗ sót cascade `movementKind` đã sync đúng field `openingQty`/`openingValue`. Xem `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md`.

### 5.3 Quality Gates

- Build/lint/test pass per boundary:
  - `cd services/gf-accounting && ./gradlew build checkstyleMain test` — coverage ≥ 80% (**NEW boundary DEV agent trong wave**)
  - `cd services/gf-inventory && ./gradlew build checkstyleMain test` — coverage ≥ 80%
  - `cd bffs/agg-garage-graph && npm run build && npm run typecheck && npm run lint` + 2 regression script mới PASS (`price-calc-run.regression.ts` + `stock-v2-report.regression.ts`, chạy qua `ts-node` mirror pattern `accounting-period.regression.ts`/`opening-balance.regression.ts` — **KHÔNG Vitest/coverage %**, repo không có tooling này per CR-20260731-01)
  - `cd frontend/gf-gms-web && npm run build && npm run lint && npm test` — coverage ≥ 60%, testid ≥ 95%
  - `cd mobile/gf-garage-app && flutter analyze && flutter test && flutter build apk --debug` — coverage ≥ 60%
- REVIEW P1=0 (backend + web + mobile — gồm concurrency/Temporal discipline check).
- `scripts/scan-boundary.sh` exit 0.
- AC coverage 100% (8 FEAT — web full 8/8; mobile 1/8 STK-LIST-V2 only).
- 3-in-1 version bump tất cả file sửa.

### 5.4 Demo

- Demo script `Tracking/demos/ep-inventory-v2-w06-demo.md` ready.

## 6. Demo Target

Live trên staging — cả **web + mobile** end-to-end, tenant pilot `Inventory:InventoryV2=ON`.

**Web (kế toán)**:

1. Sidebar → "Tính giá xuất kho" → List (rỗng, empty state). Bấm "Chạy tính giá" → Modal: chọn Kỳ kế toán (OPEN) + Kho + scope "Tất cả mã" → Thực hiện → **202** ngay, phiếu xuất hiện trạng thái "Đang tính".
2. Vào Detail → **polling 5s tự động** cập nhật tiến độ → khi hoàn tất → toast "Tính giá hoàn tất — 0 mã lỗi" → bảng chi tiết mã hiện Đơn giá BQ 2 chữ số thập phân + trạng thái "Đã tính".
3. Vào phiếu Xuất kho (W05) đã tạo trước đó — **giá vốn đã điền** (trước đó là "—").
4. Vào Báo cáo tồn kho → "Tồn đến ngày" → số liệu khớp SL + GT.
5. Chuyển tab/route "Nhập-Xuất-Tồn" → 4 nhóm cột Đầu/Nhập/Xuất/Cuối đúng.
6. Từ dòng báo cáo Q1 → "Xem lịch sử" → **Thẻ kho** (full-page) — mỗi dòng = 1 phiếu, running đúng; không còn bộ lọc/chip Kho trên UI; bấm cột **"Số phiếu"** → chuyển màn sang chi tiết phiếu nhập/xuất tương ứng.
7. Thêm phiếu Xuất mới (kỳ vẫn OPEN) → quay lại PRC Detail → bấm **"Tính lại toàn bộ"** → 202 → polling → kết quả cập nhật + cảnh báo "kỳ sau cần tính lại" nếu có.
8. Tạo phiếu "Nhập hàng bán bị trả lại" tự tham chiếu Xuất bán cùng kỳ → chạy PRC → **hội tụ đúng** sau vài vòng lặp (verify qua log `iterationsApplied`).
9. **Xóa log** (kỳ vẫn mở, run terminal) → xác nhận → xóa OK, giá vốn phiếu xuất **giữ nguyên** (không rollback).
10. Đóng kỳ kế toán (W04) → bấm "Chạy tính giá" / "Tính lại" / "Xóa log" cho kỳ đó → chặn `ERR-INV-024` toàn bộ 3 thao tác. Mở lại kỳ → OK trở lại.
11. Xuất file Excel cả 3 báo cáo → khớp mẫu chuẩn (sheet/cột/thứ tự/header).

**Mobile (chủ garage — scope: 3 màn read-only Tồn kho)**:

1. Hub "Quản lý kho hàng" → **6 tile** đúng thứ tự (Sản phẩm · Nhóm vật tư · Phiếu nhập · Phiếu xuất · **Tồn kho** · Tồn đầu kỳ).
2. Tile "Tồn kho" → `StockListPage` báo cáo tồn đến ngày (pull-to-refresh) — số liệu khớp với web (cross-platform realtime).
3. AppBar → icon tìm kiếm → `StockListSearchPage` gõ mã/tên → kết quả debounce khớp.
4. AppBar → icon lọc → `StockListFilterPage` chọn Kho + ngày → "Áp dụng" → quay lại `StockListPage` với kết quả đã lọc.
5. KHÔNG có nút Tạo/Sửa/Xóa/Xuất file trên cả 3 màn mobile (chỉ web).

## 7. Dependencies (External to Wave)

- **W05** (hard gate): Nhập/Xuất trong kỳ + sổ tồn stable — đầu vào snapshot Phase 1 PRC (W06-P1/P2).
- **`ADR-027` v5 + `ADR-028` v4** — ✅ ACCEPTED trước `/dev-start` (engine BQGQ + async Temporal pattern).
- **Infra: Temporal Cloud connectivity cho `gf-accounting`** — worker embed cần verify poll thành công task queue `PRC_TASK_QUEUE` trước `/dev-start` (§3.X Infra Readiness).
- `gf-inventory` — 5 S2S protected endpoint (W06-P1..P5) phải deploy trước `agent-dev-gf-accounting` Day 3 (7 activities cần call thật, Day 2 dùng mock).
- Feature-flag `Inventory:InventoryV2` — reuse wiring W03-W05.
- Figma — registry W06 block: 7/8 FEAT web node (RECALC không cần node riêng — action inline DETAIL) + 1/8 FEAT mobile node (STK-LIST-V2).
- Downstream: đây là **wave cuối Inventory V2** (W03→W06 hoàn tất) — không có wave sau phụ thuộc trực tiếp; GA gate cần perf spike BQGQ quy mô lớn trước rollout toàn tenant.

## 8. Risk & Mitigation

| Risk | Mitigation |
|---|---|
| **`gf-accounting` là boundary MỚI trong wave** (chưa từng có DEV cycle Inventory V2 trước đó) — DEV agent onboarding overhead + Temporal integration net-new cho boundary này | Reading list §2.4 Bước 0 đầy đủ ADR-027/028; effort estimate đã cộng buffer (~39h, dày nhất wave); REVIEW gate riêng cho Temporal discipline; escalate `/blocker-raise` sớm nếu Day 1-2 trễ |
| BQGQ tính lặp không hội tụ / sai (dữ liệu bất thường — phiếu trả chồng chéo phức tạp) | ADR-027 §3 safety cap `SAFETY_ITERATION_CAP=100`, vượt cap → item ERROR/SYSTEM_ERROR, KHÔNG hard-block toàn run; integration test phủ 2-5 vòng thực nghiệm |
| Temporal Cloud outage tại thời điểm CREATE/RECALC kick-off | 503 + compensating DELETE row (rollback INSERT); client retry với cùng Idempotency-Key; runbook Ops |
| Perf BQGQ "Tất cả mã" quy mô lớn (nhiều mã × nhiều kho) | `agent-test-performance` scenario riêng trước GA gate; heartbeat 60s tránh Temporal activity timeout; consider batch-size tuning nếu perf test fail |
| Q3 thẻ kho đọc chi tiết phiếu (không sổ tồn) — nguồn dữ liệu khác Q1/Q2 (đọc sổ tồn) dễ nhầm khi DEV implement | Tech notes §2.2.2 nêu rõ; REVIEW gate assert explicit; integration test cross-check reconciliation (dòng phiếu cuối ngày D = tồn cuối ngày D sổ tồn) |
| Concurrency: 2 user cùng lúc CREATE PRC cùng (kỳ, kho) | 3-layer guard (DB lock + Temporal WorkflowIdReusePolicy + partial unique index) — test scenario riêng đảm bảo 1 thành công 1 chặn `ERR-INV-029`, KHÔNG deadlock/race |
| Mobile chỉ 1/8 FEAT — risk thấp nhưng cần đảm bảo 7 FEAT còn lại KHÔNG leak lên mobile UI (route/menu) | REVIEW gate assert explicit; KG update rõ 7 FEAT web-only |
| Wave cuối Inventory V2 — GA rollout cần đủ 4 wave (W03-W06) đồng bộ trước khi flip flag toàn tenant | LAUNCH-CHECKLIST GA gate riêng; không thuộc scope PKG-W06 execution (post-wave activity) |

## 9. Carryover từ W05

> Carryover Audit chạy tại `/wave-start 06` (2026-07-30) — confirmed bởi Delivery Authority (user sonhoang). Nguồn: `Execution/STATE.json cr_log[]` (unresolved CR) + `Tracking/DEBT-REGISTRY.md` (open debt, `DEBT-W05-*`).

### Change Requests chưa resolved

**Không có CR nào carry forward vào W06.** 6 CR unresolved phát hiện tại audit — user triage từng cái tại chỗ:

| CR ID | Level | Title | Disposition (user sonhoang, 2026-07-30) |
|---|---|---|---|
| CR-20260720-03 | MODERATE | W05-IR-LIST-V2-FILTER-DROPDOWN-AND-PERIODLOCKED-CONTRACT-GAPS | **RESOLVED** — đã fix, cập nhật `resolved=true` trong `STATE.json cr_log[]` |
| CR-20260720-01 (bản filter, id trùng với 1 entry khác đã resolved trước đó) | MINOR | W05-IR-ID-LIST-V2-CONTRACT-ADDITIVE-4-DISTINCT-FILTERS-PERIODLOCKED | Bỏ qua — không carry, giữ nguyên `resolved=false` trong log |
| CR-20260727-02 | MAJOR | GF-INVENTORY-PURCHASE-EVENT-SCHEMA-MISSING-COST-PRICE-FIELD... | **RESOLVED** — đã fix, cập nhật `resolved=true` trong `STATE.json cr_log[]` |
| CR-20260727-03 | MAJOR | Extend receipt_line/delivery_line source_code/source_line_id dual-purpose semantics | Bỏ qua — không carry, giữ nguyên `resolved=false` trong log |
| CR-20260730-01 | MAJOR | W05-REVIEW-TO-TEST-EXECUTION-STAGE-POSITION-OVERRIDE (split-repo testing) | Bỏ qua — đây là quyết định gate-override đã áp dụng rồi (không phải việc tồn đọng), giữ nguyên log |
| CR-20260730-02 | MAJOR | W05-TEST-EXECUTION-TO-QC-GATE-OVERRIDE-SPLIT-REPO-ATTESTATION | Bỏ qua — tương tự, gate-override đã áp dụng, giữ nguyên log |

> **Lưu ý data hygiene**: `cr_log[]` có 2 entry trùng `id="CR-20260720-01"` (1 resolved — "W05 §Boundaries scope sync", 1 unresolved — "W05-IR-ID-LIST-V2-CONTRACT-ADDITIVE..."). Chưa dedupe tại bước này — flag cho Delivery Authority follow-up.

### Technical Debt còn mở

| Debt ID | Severity | Boundary | Title | Acceptable Until | Status |
|---|---|---|---|---|---|
| DEBT-W05-001 | HIGH | garage-web + bff agg-garage-graph + be gf-inventory + be gf-hrms | FEAT-IR-LIST-V2 §3 AC-6/AC-8: 3 NEED CONFIRMATION (staffId filter endpoint, objectId filter data source, `periodLocked` field missing) | W05 REVIEW / W06 | OPEN |
| DEBT-W05-002 | MEDIUM | garage-web + bff agg-garage-graph + be gf-inventory | FEAT-IR-PRINT §6.1 NEED CONFIRMATION response shape `printReceiptV2` (base64-PDF vs signed URL) | W05 REVIEW / W06 | OPEN |
| DEBT-W05-003 | HIGH | garage-web | `SlipFormV2Header` field-name mismatch (`objectName`/`staffName`/`warehouseName` vs canonical schema keys `objectId`/`staffId`/`warehouseId`) — **production submit có thể lỗi/reject** | W05 REVIEW hoặc FIX cycle trước ship | OPEN |
| DEBT-W05-004 | LOW | garage-web + bff agg-garage-graph | `agg-garage-graph-graphql.md` §3d chưa phản ánh 2 field đã ship trong code (`searchSkus.internalProductCode`, `InternalProductSearchInput.sku`) | Trước W06 kickoff | OPEN |
| DEBT-W05-005 | HIGH | gf-sales | BUG-W05-067 unresolved tại W05 close — chọn "Mã phiếu dịch vụ" khi tạo phiếu xuất kho kế thừa từ Phiếu dịch vụ | W06 | OPEN |
| DEBT-W05-006 | LOW | gf-inventory | BUG-W05-089 unresolved tại W05 close — sai `created_by`/`updated_by` khi auto-create phiếu nhập từ PO | W06 | OPEN |
| DEBT-W05-007 | MEDIUM | gf-inventory | BUG-W05-092 REOPENED (2026-07-28, agent-review-backend build verification) | W06 | OPEN |
| DEBT-W05-008 | MEDIUM | gf-purchase | BUG-W05-094 REOPENED (2026-07-28, agent-review-backend build verification) | W06 | OPEN |
| DEBT-W05-009 | HIGH | gf-inventory | BUG-W05-108 unresolved tại W05 close — sai dữ liệu cột `source` trong bảng `receipt` | W06 | OPEN |
| DEBT-W05-010 | HIGH | gf-purchase | BUG-W05-109 unresolved tại W05 close — đơn hàng nguồn "Nền tảng" hiển thị sai trong danh sách khi tạo phiếu nhập | W06 | OPEN |

**Action trong W06**: Mỗi debt phải được FIX agent xử lý (per boundary owner: `gf-sales`/`gf-inventory`/`gf-purchase` cho DEBT-005/006/007/008/009/010; `garage-web` cho DEBT-001/002/003/004 — 001/002 phụ thuộc CR filter/print đã resolve nên cần re-verify code có match contract mới chưa) HOẶC re-defer với lý do rõ ràng trước `/wave-end` W06 (WAVE_END gate yêu cầu 0 open blocker).

## 10. Post-Wave Actuals

*(Điền cuối wave — scope hoàn thành / dự kiến trong 5 ngày; đóng Inventory V2 (W03→W06 hoàn tất); tổng kết sức chứa 4 wave để chốt baseline velocity PLANNING-PLAYBOOK §F3; đặc biệt ghi nhận: `gf-accounting` PRC master có đúng estimate ~39h không (boundary mới), Temporal integration có phát sinh vấn đề gì không.)*

## 11. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 7 | main agent (per CR-20260731-01, user sonhoang) | **Sửa Quality Gate `agg-garage-graph` — align với test tooling thực tế của repo** (phát hiện từ `/warm-up agg-garage-graph --phase A`, GAP-W06-AGG-01). 3 vị trí: (1) §4.1 Agent Assignments `agent-dev-agg-garage-graph` Day 3 — "Vitest ≥80%" → "Regression script `.regression.ts` mirror pattern hiện có... KHÔNG Vitest"; (2) §5.1 Deliverables `agg-garage-graph` — "Vitest ≥ 80%" → "2 regression script `.regression.ts` PASS... KHÔNG Vitest/coverage %"; (3) §5.3 Quality Gates dòng `agg-garage-graph` — "`cd garage-functions/agg-garage-graph && npm run build && npm run typecheck && npm test` — coverage ≥ 80%" → "`cd bffs/agg-garage-graph && npm run build && npm run typecheck && npm run lint` + 2 regression script PASS" (đồng thời sửa path sai `garage-functions/agg-garage-graph` → `bffs/agg-garage-graph` cho khớp `SERVICE-BOUNDARY-MATRIX.md`). Root cause: `bffs/agg-garage-graph` repo **không có Vitest, không có generic `npm test` script** — `CLAUDE.md:35` explicit "Không claim test coverage trừ khi tooling đó được thêm vào"; convention thật = per-module `.regression.ts` chạy `ts-node`. User quyết định (2026-07-31): giữ quy ước hiện có, không thêm Vitest mới (KHÔNG thêm tooling mới ngoài scope W06). **KHÔNG đụng**: Quality Gate 4 boundary khác (`gf-accounting`/`gf-inventory`/`garage-web` dùng Vitest thật/`garage-mobile`) — không có drift tương tự. v6 → v7. |
| 2026-07-31 | 8 | main agent (`/warm-up gf-inventory --phase A`, user sonhoang, GAP-W06-GI-03) | **Sửa tên controller sai trong "V1 Module Hide" cascade** — 2 vị trí: (1) §2.2.2 Backend gf-inventory Tech notes; (2) §4.2 REVIEW `agent-review-backend` assert. Bản trước liệt kê 3 V1 controller (`InventoryStockController`/`InventoryStockAdjustmentController`/`InventoryPeriodController`) nhưng code thật chỉ có **2** class (`InventoryStockAdjustmentController` không tồn tại — logic điều chỉnh nằm chung trong `InventoryStockController`; `InventoryPeriodController` sai tên — thật là `InventoryPeriodStockController`). Cả 2 controller thật đã có sẵn `@FeatureOn(FeatureFlags.INVENTORY_STOCK)` — cascade `@FeatureOff(Inventory:InventoryV2)` ưu tiên trên gate này. Cross-ref `EP-INVENTORY-STOCK-V2.md` v9 §5.2 (đồng bộ cùng lúc). Root cause: PKG v4 (2026-07-24) copy tên controller từ mô tả EP gốc mà không verify code thật lúc đó. v7 → v8. |
| 2026-07-31 | 9 | main agent (user directive, cascade audit W06 Product doc) | **Cascade "Thẻ kho bỏ chip Kho + thêm link Số phiếu" từ `FEAT-STK-DETAIL-V2` v15/v16 + `BR-STKV2-012` v18** — PKG chưa cập nhật theo 2 edit này, phát hiện qua rà soát tài liệu Product W06. Sửa 5 vị trí: (1) §2.4.a Route table `StockCardDetailPage` — bỏ mô tả "bộ lọc Kho disabled", thêm "không còn bộ lọc/chip Kho" + cột "Số phiếu" là link chuyển màn theo `slipType`; (2) §4.2 `agent-review-garage-web` scope; (3) §4.3 `agent-test-ui` scope; (4) §5.1 Deliverables `garage-web` bullet; (5) §6 Demo Target bước 6. Root cause: rà soát tài liệu Product W06 theo yêu cầu user phát hiện PKG (T4, DEV đọc trực tiếp) chưa cascade sau 2 lần edit Product doc cùng ngày 2026-07-31. v8 → v9. |
| 2026-08-03 | 10 | main agent (`/warm-up garage-mobile --phase B`, user sonhoang, GAP-W06-GM-01) | **Sync §2.2.5 Mobile + toàn bộ cascade mobile từ kiến trúc CŨ (1 màn `StockAtDateReportPage`/`StockAtDateReportCubit`) sang kiến trúc **3-screen** `StockListPage`/`StockListSearchPage`/`StockListFilterPage` — cùng drift class vừa fix trong `mobile/gf-garage-app/.claude/agents/agent-dev-garage-mobile.md` §W06 (escalation E1, `agent-checklist-gate` re-gate 2026-08-03, APPROVED spawn_ok=true). Wave-spec `FEAT-STK-LIST-V2.md` v3 (tier-authoritative) + `_IMPLEMENTATION-CHECKLIST-W06-garage-mobile.md` v3 (gate STRICT PASS D1-D11) đã chốt kiến trúc 3-screen từ trước — PKG chưa cascade theo. Sửa 9 vị trí: (1) §1 Overview cross-wave state-matrix row — `BR-INV-MENU-002` → **`BR-INV-MENU-001`** (rule thứ tự tile, sai citation); (2) §2.2 Technical Scope cross-wave bullet — cùng sửa BR cite + thêm chi tiết INSERT vị trí 5 + di chuyển "Tồn đầu kỳ"; (3) §2.2.5 Mobile — rewrite toàn bộ: Screens table 1→3 dòng (`StockListPage`/`StockListSearchPage`/`StockListFilterPage`), Figma node `21632:28892` (section root, sai) → node thật per checklist (`21290:45967`/`46486`/`46503`/`47060`/`47678`/`47691` + hub `21521:71064`), GraphQL thêm REUSE `searchWarehouses` qua `SupplierRepository` (KHÔNG `WarehouseRepository`), widget catalog `AppBarCustom` thay `CustomAppBar`/`SmartRefresher`; (4) §4.1 `agent-dev-garage-mobile` task summary — 3-screen + T1-T21 cite; (5) §4.2 `agent-review-garage-mobile` scope; (6) §4.3 `agent-test-mobile-ui` scope — "1 màn" → "3 màn"; (7) §5.1 Deliverables `garage-mobile` bullet — 3 màn + DEV chỉ document golden path (KHÔNG tự generate test, theo wave-spec §10); (8) §6 Demo Target mobile — 3 bước → 5 bước (thêm search + filter flow). Root cause: `/warm-up garage-mobile --phase B` Step 1b checklist-gate escalation E1 phát hiện agent-dev-garage-mobile.md mâu thuẫn wave-spec; audit lan sang thấy PKG (nguồn §2.2.5 gốc mà agent-dev-garage-mobile.md từng dựa vào) cũng chưa cascade theo kiến trúc 3-screen đã ratify trong wave-spec v3 (2026-07-31) + checklist v3 (2026-08-03). **KHÔNG đụng**: phần web (`StockAtDateReportPage` bên `garage-web` §2.2.4/§4.1/§5.1 — tên trùng ngẫu nhiên do cùng nghiệp vụ "báo cáo tồn đến ngày", nhưng là page React độc lập, KHÔNG thuộc drift class mobile). v9 → v10. |
| 2026-06-24 | 1 | Delivery Authority | Khởi tạo PKG-W06 Inventory V2 Tính giá + Báo cáo — PRC (5) + STOCK-V2 (3), 4 boundary (+gf-inventory-worker nếu async), M01 vertical slice, timebox 5 ngày. Reuse-First gate. NEED CONFIRMATION: Figma mobile, ADR engine BQGQ, PRC async via gf-inventory-worker. |
| 2026-07-15 | 2 | Delivery Authority (main agent, user bachho) | Thêm cross-wave state-matrix update `FEAT-INV-MOBILE-MENU` vào §2.2 Technical Scope. Mobile hub enable thêm tile "Tồn kho" → 6 tile đủ per BR-INV-MENU-002. PKG-W06 vẫn skeleton v2 — full rebuild sẽ chạy khi vào W06 planning cycle chính thức. |
| 2026-07-24 | 3 | Delivery Authority (`/gen-wave-plan` — main agent + user dev-ac) | **Full rebuild theo template canonical PKG-W05/W03** — resolve toàn bộ 3 NEED CONFIRMATION cũ: (a) **PRC master boundary = `gf-accounting`** (KHÔNG `gf-inventory`, KHÔNG cần `gf-inventory-worker`) per `/arch-design W06` Round 1 ratify (2026-07-22, Q1=A composite SA+Delivery+Backend Lead) — pattern ERP truyền thống (SAP FI-CO), `gf-inventory` chỉ cung cấp 5 S2S protected endpoint; (b) **PRC async pattern = HTTP 202 kick-off + Temporal workflow** (ADR-028 v4, reversed từ v1 sync-HTTP-plus-background-thread → v2 Temporal per Q2 v3 reversal 2026-07-23, Common Gotcha #7 update 6 service dùng Temporal — `gf-accounting` embed worker task queue `PRC_TASK_QUEUE`); (c) **Figma mobile = 1/8 FEAT** (chỉ `FEAT-STK-LIST-V2`, node `21632:28892`) — 7 FEAT còn lại web-only. Rebuild toàn bộ §1-§11 theo cấu trúc chi tiết template §5.B skill `gen-wave-plan`: §2.2 per-boundary (§2.2.1 BE gf-accounting NEW boundary 6 endpoint + entity + Temporal workflow · §2.2.2 BE gf-inventory 11 endpoint S2S+report+export · §2.2.3 BFF 12 GraphQL op · §2.2.4 Web 5 route + Navigation gate + Reuse-First table · §2.2.5 Mobile 1 màn read-only); §3 Entry Criteria full ratify list + Infra Readiness (mới: Temporal Cloud connectivity check) + remote-box gate; §4 Agent Assignments 3-table đầy đủ effort breakdown per-day (`agent-dev-gf-accounting` ~39h dày nhất — boundary mới); §5 Deliverables per-boundary; §6 Demo Target 11 bước web + 3 bước mobile; §7 Dependencies; §8 Risk 9 row (mới: boundary mới onboarding overhead, Temporal outage, concurrency 3-layer, NF-02 doc-hygiene không block); §9 Carryover từ W05 (4 blocker hiện tại W05 REVIEW-stage, chưa carryover chính thức — action tại `/wave-start`). **Nguồn dữ liệu**: Product 8 FEAT + 2 EP + 2 BR đã qua `agent-ba-review` (2026-07-24, verdict NEEDS_REVISION → 8/9 finding P1/P2 resolved same-day: F1 BR-STKV2-013 nguồn thẻ kho backfill · F3 Figma disclaimer gỡ · F4 ERR-INV-024 generic hoá + registry YAML sync (NF-01) · F5 bộ lọc Kho Thẻ kho = disabled · F6 EP diagram sync · L1 toast wording verbatim cascade 3 file; F2/F8 false-positive; F7 deferred non-blocking) + Architecture đã `/arch-review W06` UNBLOCK SA ratify (`Tracking/ARCH-REVIEW-W06.md` Round 3) + drift re-check `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-24-RECHECK.md` verdict `MINOR_DRIFT` không block (NF-02 deferred Architecture team, doc-hygiene only). Architecture actual state tại thời điểm rebuild: `gf-accounting-api.md` v24, `gf-inventory-api.md` v71, `agg-garage-graph-graphql.md` v7.79, `ADR-027` v5, `ADR-028` v4, `gf-accounting-data-model.md` v14, `INTEG-EXT-gf-accounting-gf-inventory.md` v2, `INTEG-FE-garage-web-agg-garage-graph.md` v23. Product Change Log latest: EP-ACCOUNTING-PERIOD v23, EP-STOCK-V2 v8, FEAT-PRC-{LIST v12/CREATE v32/DETAIL v24/RECALC v21/DELETE v7}, FEAT-STK-LIST-V2 v10, FEAT-IP-VIEW-V2 v10, FEAT-STK-DETAIL-V2 v14, BR-ACCOUNTING-PERIOD v40, BR-STOCK-V2 v15. **KHÔNG đụng**: cascade Plan/WAVE-SEQUENCE.md thực hiện song song (xem file đó Change Log riêng). v2 → v3. |
| 2026-07-24 | 4 | Delivery Authority (user dev-ac) | **Bổ sung "V1 Module Hide" cascade — gap phát hiện qua user Q&A**. Rule đã ratified tại `EP-INVENTORY-STOCK-V2.md` §5.2 v6 (2026-07-13): flag `Inventory:InventoryV2`=ON → ẩn 2 tab V1 ("Tồn kho" gồm STK-LIST/DETAIL/ADJUST/PRICE + "Tồn kho theo kỳ" = FEAT-IP-VIEW cũ) khỏi menu Web + 3 V1 controller trả 410 Gone `ERR-INV-050`; V1 data KHÔNG xóa (rollback). PKG-W06 v3 §2.3 Out of Scope chỉ ghi "không đụng, không link" — thiếu cascade lại rule hide này (khác PKG-W05 đã làm đúng cho slip V1). Sửa 5 vị trí: (1) §2.2.2 Backend gf-inventory Tech notes — thêm bullet "V1 Module Hide" (3 controller + `@FeatureOff` + 410 `ERR-INV-050`); (2) §2.2.4 Web §2.4.a Navigation — thêm T-web-Nav5 (ẩn 2 tab V1 theo flag, V1 route/component không xóa); (3) §4.1 `agent-dev-garage-web` task — thêm V1 hide vào Day 1 Navigation + Day 4 error-code map `ERR-INV-050` + test V1 tab hide/restore (effort 29h→30h); (4) §5.1 Deliverables — `gf-inventory` bullet thêm V1 Module Hide + integration test; `garage-web` bullet thêm V1 Module Hide + error-code map + test; (5) §4.2 REVIEW — `agent-review-backend` thêm assert grep 3 V1 controller có `@FeatureOff`; `agent-review-garage-web` thêm assert 2 tab V1 ẩn/restore đúng. Root cause: rebuild v3 tập trung vào 8 FEAT mới, không rà lại rule V1-coexistence đã ratified ở EP tier — gap này nếu không fix thì DEV có thể để V1 + V2 cùng hoạt động song song → data drift risk (đúng rủi ro mà EP §5.2 Change Log v6 2026-07-13 đã cảnh báo). v3 → v4. |
| 2026-07-28 | 5 | Delivery Authority (user dev-ac) | **Sync version citation + đóng NF-02 caveat sau khi Architecture team fix xong**. `Architecture/api/gf-inventory-api.md` bump v71→v72 (2026-07-28, NF-02 cascade-fix: §5.2 Naming Registry + EX3 sheet layout sync đúng field `openingQty`/`openingValue`, `movementKind` retag W04-write-side-only). Sửa 6 vị trí PKG: (1-2) §2.2.1/§2.4 Bước 0 cite version v71→v72; (3) §2.2.2 gf-inventory endpoint header cite v71→v72; (4) §3 Entry Criteria — gỡ "⚠️ NF-02 P2 open" caveat, thay bằng "✅ đã fix 2026-07-28"; (5) §3 Drift check bullet — trỏ sang report mới `Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md` verdict `CONSISTENT` (thay vì report 24/7 verdict `MINOR_DRIFT`); (6) §5.2 Architecture & Docs — "NF-02 follow-up" → "NF-02 ✅ đã fix"; (7) §8 Risk — xóa hẳn 1 row NF-02 (không còn là risk). **Xác nhận cuối cùng**: full drift re-check 2026-07-28 (`Tracking/DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md`) verdict `CONSISTENT` — Product ↔ Architecture Wave 6 không còn drift nào; V1 Module Hide cascade (PKG v4) verify khớp đúng `EP-INVENTORY-STOCK-V2.md` §5.2 (informational finding, không phải drift). v4 → v5. |
| 2026-07-30 | 6 | Delivery Authority (`/wave-start 06` Step 1.5 Carryover Audit — main agent + user sonhoang) | **Carryover Audit W05→W06 chính thức** — rewrite §9 hoàn toàn (thay snapshot 2026-07-24 tạm thời). Audit nguồn `STATE.json cr_log[]` (6 unresolved CR) + `Tracking/DEBT-REGISTRY.md` (10 debt `DEBT-W05-001..010`, tất cả `Status=OPEN`). User triage 6 CR tại chỗ: CR-20260720-03 + CR-20260727-02 → **RESOLVED** (cập nhật `resolved=true` + `status=RESOLVED` + `resolution_note` trong `STATE.json`); CR-20260720-01 (bản filter) + CR-20260727-03 + CR-20260730-01 + CR-20260730-02 → bỏ qua, không carry, giữ nguyên log. → **0 CR carry forward**. 10/10 debt `DEBT-W05-*` carry forward nguyên vẹn vào §9 (khớp `Acceptable Until: W06` đã gán sẵn) + ghi `STATE.json carryover_items[]`. Phát hiện phụ: `cr_log[]` có 2 entry trùng `id="CR-20260720-01"` (data hygiene gap, flag follow-up, không block). v5 → v6. |
