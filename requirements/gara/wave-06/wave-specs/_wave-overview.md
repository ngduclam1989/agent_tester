---
type: execution-spec
artifact_kind: wave-overview
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W06"
last_reviewed: "2026-07-31"
source: "gen-execution-spec"
generated_at: "2026-07-31T12:00:00+00:00"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
pkg_version: 9
features_in_wave:
  - FEAT-PRC-LIST
  - FEAT-PRC-CREATE
  - FEAT-PRC-DETAIL
  - FEAT-PRC-RECALC
  - FEAT-PRC-DELETE
  - FEAT-STK-LIST-V2
  - FEAT-IP-VIEW-V2
  - FEAT-STK-DETAIL-V2
epics_in_wave:
  - EP-INVENTORY-ACCOUNTING-PERIOD
  - EP-INVENTORY-STOCK-V2
brs_in_wave:
  - BR-GF-INVENTORY-ACCOUNTING-PERIOD
  - BR-GF-INVENTORY-STOCK-V2
boundaries_in_wave:
  - gf-accounting
  - gf-inventory
  - agg-garage-graph
  - garage-web
  - garage-mobile
boundaries_cross_boundary_consumed_only: []   # 2026-07-31 audit fix: FEAT-PRC-CREATE/RECALC lookup dropdown "Thêm phụ tùng" đọc catalog qua gf-inventory V2-7 (KHÔNG phải gf-erp-mdm — endpoint gf-erp-mdm cite trước đây không tồn tại, xem _decisions.md). gf-inventory đã có trong boundaries_in_wave, không cần list riêng ở đây.
artifact_count:
  epics: 2
  business_rules: 2
  features_tier_files: 25
  total: 29
authoring_inputs:
  kg_baseline_sha_gf_accounting: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  kg_baseline_sha_gf_inventory: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  pkg_sha: "NEED CONFIRMATION — sha256 chưa compute được (author session không có Bash tool); orchestrator/CI backfill `sha256sum Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` (v9) trước khi bump ACTIVE"
  decisions_log_size: "~40 entries (Execution/wave-specs/W06/_decisions.md)"
  contract_scope_ref: "Execution/wave-specs/W06/contract-scope.yaml (6 contract file, 8 consumer×contract pair, signed 2026-07-31 per CR-20260731-01 GAP-W06-AGG-02)"
pre_conditions_satisfied:
  - "EP-INVENTORY-ACCOUNTING-PERIOD.md DRAFT v1 ✓ (source v24, 10 FEAT — 5 AP đã ship W04 + 5 PRC scope W06; §1-§5 verbatim toàn epic)"
  - "EP-INVENTORY-STOCK-V2.md DRAFT v1 ✓ (source v10, 3 FEAT, paired epic cùng PKG)"
  - "BR-GF-INVENTORY-ACCOUNTING-PERIOD.md DRAFT v1 ✓ (source v40 — filtered: 18/18 BR-PRC-* + CB-AP-001 + BR-AP-CMN-002, loại 16 BR-AP-* + BR-AP-CMN-001 ngoài W06)"
  - "BR-GF-INVENTORY-STOCK-V2.md DRAFT v1 ✓ (source v19 — không filter, file dành riêng 1 epic, 1 CB + 16 BR-STKV2 verbatim toàn bộ)"
  - "FEAT-{PRC-LIST,PRC-CREATE,PRC-DETAIL,PRC-RECALC,PRC-DELETE,STK-LIST-V2,IP-VIEW-V2,STK-DETAIL-V2} × {be,bff,fe-web} DRAFT ✓ (8×3=24)"
  - "FEAT-STK-LIST-V2 × mobile DRAFT ✓ (1 — duy nhất FEAT có mobile tier trong W06, Figma node 21632:28892)"
  - "7 FEAT mobile out-of-scope (5 PRC + IP-VIEW-V2 + STK-DETAIL-V2) — KHÔNG có tier file, theo PKG §2.2.5 + Figma registry (không phải gap)"
  - "Total: 29 DRAFT tier files confirmed (2 EP + 2 BR + 25 FEAT-tier: 8 be + 8 bff + 8 fe-web + 1 mobile)"
---

# W06 Wave Overview — Inventory V2: Tính giá + Báo cáo (slice 4/4, wave cuối)

> Tài liệu tổng hợp wave-level từ 29 spec DRAFT (2 EP + 2 BR + 25 FEAT-tier). Không thay thế tier spec riêng — đây là điểm tra cứu cross-boundary cho Delivery Authority + Architecture Authority + REVIEW agents.
>
> Nguồn: `PKG-W06-inventory-pricing-stock-report` v9 · `EP-INVENTORY-ACCOUNTING-PERIOD` v1 (source v24, nhóm PRC) · `EP-INVENTORY-STOCK-V2` v1 (source v10) · `BR-GF-INVENTORY-ACCOUNTING-PERIOD` v1 (source v40, filtered) · `BR-GF-INVENTORY-STOCK-V2` v1 (source v19, không filter) · `Execution/wave-specs/W06/_decisions.md` (~40 entries) · `Execution/wave-specs/W06/contract-scope.yaml` (6 contract).

---

## §0 Nguồn & Audit

### EP + BR (4 file)

| artifact_id | tier | source_version | tier version | status | path |
|---|---|---|---|---|---|
| EP-INVENTORY-ACCOUNTING-PERIOD | epic | v24 | v1 | DRAFT | `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` |
| EP-INVENTORY-STOCK-V2 | epic | v10 | v1 | DRAFT | `Execution/wave-specs/W06/Product/epics/EP-INVENTORY-STOCK-V2.md` |
| BR-GF-INVENTORY-ACCOUNTING-PERIOD | business-rule | v40 | v1 | DRAFT | `Execution/wave-specs/W06/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` |
| BR-GF-INVENTORY-STOCK-V2 | business-rule | v19 | v1 | DRAFT | `Execution/wave-specs/W06/Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` |

### BE tier — `gf-accounting` (5) + `gf-inventory` (3) (8 spec, tất cả v1)

| artifact_id | boundary | source_version | status | path |
|---|---|---|---|---|
| FEAT-PRC-LIST | gf-accounting | v12 | DRAFT | `.../features/be/FEAT-PRC-LIST.md` |
| FEAT-PRC-CREATE | gf-accounting | v32 | DRAFT | `.../features/be/FEAT-PRC-CREATE.md` |
| FEAT-PRC-DETAIL | gf-accounting | v24 | DRAFT | `.../features/be/FEAT-PRC-DETAIL.md` |
| FEAT-PRC-RECALC | gf-accounting | v21 | DRAFT | `.../features/be/FEAT-PRC-RECALC.md` |
| FEAT-PRC-DELETE | gf-accounting | v7 | DRAFT | `.../features/be/FEAT-PRC-DELETE.md` |
| FEAT-STK-LIST-V2 | gf-inventory | v10 | DRAFT | `.../features/be/FEAT-STK-LIST-V2.md` |
| FEAT-IP-VIEW-V2 | gf-inventory | v10 | DRAFT | `.../features/be/FEAT-IP-VIEW-V2.md` |
| FEAT-STK-DETAIL-V2 | gf-inventory | v16 | DRAFT | `.../features/be/FEAT-STK-DETAIL-V2.md` |

### BFF tier — `agg-garage-graph` (8 spec, tất cả v1)

| artifact_id | GraphQL ops | status | path |
|---|---|---|---|
| FEAT-PRC-LIST | `priceCalcRunList` | DRAFT | `.../features/bff/FEAT-PRC-LIST.md` |
| FEAT-PRC-CREATE | `priceCalcRunCreate`, `priceCalcRunRecalc`, `priceCalcRunGet`, `priceCalcItemsForCogsLookup` | DRAFT | `.../features/bff/FEAT-PRC-CREATE.md` |
| FEAT-PRC-DETAIL | `priceCalcRunGet`, `priceCalcRunRecalc` | DRAFT | `.../features/bff/FEAT-PRC-DETAIL.md` |
| FEAT-PRC-RECALC | `priceCalcRunRecalc` | DRAFT | `.../features/bff/FEAT-PRC-RECALC.md` |
| FEAT-PRC-DELETE | `priceCalcRunDelete` | DRAFT | `.../features/bff/FEAT-PRC-DELETE.md` |
| FEAT-STK-LIST-V2 | `stockLedgerAtDate`, `stockLedgerAtDateExport` | DRAFT | `.../features/bff/FEAT-STK-LIST-V2.md` |
| FEAT-IP-VIEW-V2 | `stockInoutSummary`, `stockInoutSummaryExport` | DRAFT | `.../features/bff/FEAT-IP-VIEW-V2.md` |
| FEAT-STK-DETAIL-V2 | `stockCardDetail`, `stockCardDetailExport` | DRAFT | `.../features/bff/FEAT-STK-DETAIL-V2.md` |

> 12 op canonical W06 = 9 Query + 3 Mutation (per PKG §2.2.3); `priceCalcRunGet`/`priceCalcRunRecalc` được reuse chéo giữa FEAT-PRC-DETAIL và FEAT-PRC-RECALC (RECALC không có route/màn riêng — action nhúng trong DETAIL host screen).

### FE-web tier — `garage-web` (8 spec, tất cả v1)

| artifact_id | tier version | Figma status | path |
|---|---|---|---|
| FEAT-PRC-LIST | v1 | ✓ prefetched (node 14507:89265) | `.../features/fe-web/FEAT-PRC-LIST.md` |
| FEAT-PRC-CREATE | v1 | ✓ prefetched (node 14507:89266) | `.../features/fe-web/FEAT-PRC-CREATE.md` |
| FEAT-PRC-DETAIL | v1 | ✓ prefetched (node 13575:103109) | `.../features/fe-web/FEAT-PRC-DETAIL.md` |
| FEAT-PRC-RECALC | v1 | ✓ resolved qua host screen (RECALC không có frame riêng — 2 nút cite từ `wave06-prc-detail.md` node 13575:103113) | `.../features/fe-web/FEAT-PRC-RECALC.md` |
| FEAT-PRC-DELETE | v1 | ✓ prefetched (2 dialog state, node 14507:89269) | `.../features/fe-web/FEAT-PRC-DELETE.md` |
| FEAT-STK-LIST-V2 | v1 | ✓ prefetched (node 14507:89271) | `.../features/fe-web/FEAT-STK-LIST-V2.md` |
| FEAT-IP-VIEW-V2 | v1 | ✓ prefetched (node 14507:89273) | `.../features/fe-web/FEAT-IP-VIEW-V2.md` |
| FEAT-STK-DETAIL-V2 | v1 | ✓ prefetched (node 14507:89272) | `.../features/fe-web/FEAT-STK-DETAIL-V2.md` |

> Web 7/8 FEAT có node riêng (RECALC dùng action inline trên host DETAIL) — khớp PKG §2.4 Bước 3 ("Web 7/8 FEAT có node").

### Mobile tier — `garage-mobile` (1 spec — narrow scope per Figma registry rule)

| artifact_id | tier version | scope | Figma node | path |
|---|---|---|---|---|
| FEAT-STK-LIST-V2 | v1 | READ-ONLY: 1 màn `StockAtDateReportPage` + hub tile "Tồn kho" enable (6 tile total) | `21632:28892` (file `5YU4H3iY726P8KNxI9oCYF`) | `.../features/mobile/FEAT-STK-LIST-V2.md` |

> **Mobile scope intentional** (PKG-W06 §2.2.5 + §2.3): `FEAT-PRC-*` (5) + `FEAT-IP-VIEW-V2` + `FEAT-STK-DETAIL-V2` = **web-only** — không gán link Figma mobile. 7 mobile tier spec KHÔNG tồn tại — KHÔNG phải gap, khớp fan-out map. Đây là wave có tỉ lệ mobile-touching thấp nhất trong chuỗi Inventory V2 (1/8 FEAT, so với W05 4/14).
>
> **`FEAT-INV-MOBILE-MENU` KHÔNG có wave-spec riêng** (PKG-W06 §2.2 dòng "Cross-wave state-matrix (KHÔNG count FEAT)"): task chỉ là enable 1 tile "Tồn kho" trên hub điều hướng (~1h, flag flip theo `BR-INV-MENU-002`, KHÔNG rebuild hub, KHÔNG list vào 8-FEAT count của wave). DEV mobile làm task này đọc trực tiếp source `Product/features/FEAT-INV-MOBILE-MENU.md` (fallback policy — không có tier-authoritative spec cho task quá nhỏ) + cross-ref route `StockLedgerAtDateRoute` đã khai ở `features/mobile/FEAT-STK-LIST-V2.md` §6/§7. Đã audit sẵn ở `Tracking/warm-up/WAVE06/W06-garage-mobile-warm-up-phaseA.md` (verdict READY_FOR_DEV, 4 gap đã RESOLVED 2026-07-31).

---

## §1 Wave Scope Narrative

W06 là **slice 4/4 (wave cuối) của Inventory V2** (sau W03 danh mục, W04 kỳ kế toán + tồn đầu kỳ, W05 giao dịch Nhập/Xuất) — deliver 2 module không đồng nhất chung 1 PKG: **Tính giá xuất kho BQGQ cuối kỳ (PRC, 5 FEAT, boundary chính `gf-accounting` — NEW boundary trong W06)** + **3 báo cáo tồn kho V2 (Stock V2 Reports, 3 FEAT, boundary chính `gf-inventory`, read-only)**. Timebox 5 ngày.

**PRC master boundary = `gf-accounting`** (KHÔNG `gf-inventory`) — quyết định ratified `/arch-design W06` Round 1 (2026-07-22), pattern ERP truyền thống (kế toán tính costing). `gf-accounting` chưa từng có DEV cycle Inventory V2 trước W06 — 2 entity mới (`price_calc_run`/`price_calc_run_item`, `ddl-auto=update` — KHÔNG Flyway, Common Gotcha #5) + **Temporal workflow embedded** (`PriceCalcRunWorkflow`, task queue `PRC_TASK_QUEUE`) — `gf-accounting` là **service Temporal thứ 6** (Common Gotcha #7, sau gf-sales/gf-customer/gf-marketing/gf-inventory/gf-inventory-worker).

**Async pattern trải qua 1 lần reversal**: ADR-028 v1 (sync HTTP + background thread) → v2/v4 (**Temporal workflow**, Q2 v3 reversal 2026-07-23) — client nhận **202 Accepted** kèm `runId` ngay khi kick-off, polling GET mỗi 5000ms fixed (KHÔNG backoff/adaptive) đến khi terminal.

**Công thức BQGQ** (ADR-027 v5, BR-PRC-001): Đơn giá BQ = (GT tồn đầu + GT nhập trong kỳ) / (SL tồn đầu + SL nhập trong kỳ) — **chỉ dùng phía nhập**, làm tròn 2 chữ số thập phân **ngay sau khi tính** và dùng chính giá trị đã làm tròn để tính tiền vốn (BR-PRC-013). Kỳ có phiếu "Nhập hàng bán bị trả lại" tự tham chiếu phiếu Xuất bán cùng kỳ → **tính lặp hội tụ** (BR-PRC-017) — safety cap 100 vòng (ADR-027), vượt cap → item lỗi `SYSTEM_ERROR`, KHÔNG hard-block toàn run. Concurrency chặn chạy trùng cùng (kỳ+kho) qua **3 lớp guard**: DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy.REJECT_DUPLICATE` + partial unique index `uidx_prc_active_lock`.

**Stock V2 Reports là read-only consumer** của sổ tồn (`inventory_stock_ledger`, ADR-020 W04) — 3 báo cáo (tồn-đến-ngày Q1, NXT Q2, thẻ kho Q3) đọc CÙNG 1 nguồn (Q1/Q2) hoặc chi tiết phiếu nhập/xuất line-level (Q3, KHÔNG đọc sổ tồn gộp — mất granularity per-phiếu). Giá trị "Giá trị tồn"/"GT xuất" trong 3 báo cáo phụ thuộc kết quả PRC (BQGQ) do `gf-accounting` ghi ngược qua 5 REST S2S — trước khi tenant chạy PRC lần đầu, GT xuất = 0 là hành vi thiết kế hợp lệ (không phải lỗi).

**V1 Module Hide cascade** (per `EP-INVENTORY-STOCK-V2.md` §5.2, cascade cùng pattern V1 slip hide W05): flag `Inventory:InventoryV2` = ON → 2 V1 controller thật (`InventoryStockController` + `InventoryPeriodStockController` — GAP-W06-GI-03 fix, KHÔNG phải 3 class như mô tả cũ) thêm `@FeatureOff("Inventory:InventoryV2")` → 410 Gone `ERR-INV-050`; ẩn 2 tab V1 top-nav ("Tồn kho" + "Tồn kho theo kỳ"); V1 data KHÔNG xóa (rollback đối xứng).

**Đây là wave cuối Inventory V2** (W03→W06 hoàn tất) — không có wave sau phụ thuộc trực tiếp; GA rollout toàn tenant cần perf spike BQGQ quy mô lớn trước khi flip flag.

Kết quả demo-able: kế toán chạy tính giá BQGQ (Tất cả mã hoặc mã cụ thể) → polling 5s → hoàn tất → giá vốn phiếu xuất + giá trị sổ tồn cập nhật → 3 báo cáo khớp số → tính lại (RECALC) khi có phiếu mới → xóa log (không rollback) → chặn toàn bộ khi kỳ đóng; mobile chỉ xem báo cáo tồn-đến-ngày (read-only, hub 6 tile).

---

## §2 Vertical Slice End-to-End

```
garage-web (kế toán)                              garage-mobile (chủ garage, read-only)
  │ Modal "Chạy tính giá" (Kỳ+Kho+scope)             │ Hub 6 tile → tile "Tồn kho"
  ▼                                                  ▼
agg-garage-graph (BFF) — 12 GraphQL ops (9Q+3M), @FeatureOn(Inventory:InventoryV2) fail-fast,
  Idempotency-Key arg→header forward (Create/Recalc), DataLoader TENANT-USERS (executedByName)
  │                                                  │
  ├──► gf-accounting (PRC master, NEW boundary)      └──► gf-inventory (Stock V2 Reports, read-only)
  │      6 REST W06-1..6 (search/detail-polling/            6 REST W06-STK-Q1..3/EX1..3
  │      create-202/recalc-202/delete/lookup)               (report + export, JWT+tenant+branch)
  │      price_calc_run(_item), ddl-auto=update
  │      Temporal PriceCalcRunWorkflow (PRC_TASK_QUEUE, 7 activities):
  │        SnapshotPull ──────┐
  │        UpdateRunStatus     │  S2S x-api-key (gf-accounting → gf-inventory)
  │        ComputeItem         │  5 endpoint W06-P1..P5:
  │        BulkFillCost ───────┼─►  GET  stock-ledgers/at-date (snapshot tồn đầu)
  │        BulkInheritCost ────┼─►  POST slips-in-period/search (enumerate phiếu)
  │        BulkRecomputeLedger ┼─►  POST delivery-lines/bulk-fill-cost (ghi giá vốn xuất)
  │        CommitRun           ┼─►  POST receipt-lines/bulk-inherit-cost (kế thừa giá trả)
  │                            └─►  POST stock-ledgers/bulk-recompute (cascade sổ tồn)
  │                                        │
  │                                        ▼
  │                          inventory_stock_ledger (ADR-020, point-in-time daily snapshot)
  │                                        │
  │                          ┌─────────────┼─────────────┐
  │                          ▼             ▼             ▼
  │                    Q1 tồn-đến-ngày  Q2 NXT      Q3 thẻ kho (đọc receipt_line
  │                    (SL/GT tồn D)    (4-nhóm SL+GT)  UNION delivery_line, KHÔNG
  │                                                       đọc sổ tồn gộp — per-phiếu)
  └──────────────────────────────────────────────────────────────────────────────┘
       (Temporal HTTP client — trực tiếp, KHÔNG qua BFF)
```

---

## §3 Feature × Tier Matrix

| FEAT ID | Epic | Boundary | be | bff | fe-web | mobile |
|---|---|---|---|---|---|---|
| `FEAT-PRC-LIST` | EP-INVENTORY-ACCOUNTING-PERIOD | gf-accounting | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-PRC-CREATE` | EP-INVENTORY-ACCOUNTING-PERIOD | gf-accounting | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-PRC-DETAIL` | EP-INVENTORY-ACCOUNTING-PERIOD | gf-accounting | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-PRC-RECALC` | EP-INVENTORY-ACCOUNTING-PERIOD | gf-accounting | DRAFT (action-in-DETAIL, no route) | DRAFT | DRAFT (action-in-DETAIL, no route) | OUT-OF-SCOPE (web-only) |
| `FEAT-PRC-DELETE` | EP-INVENTORY-ACCOUNTING-PERIOD | gf-accounting | DRAFT (action-in-LIST, no route) | DRAFT | DRAFT (action-in-LIST, no route) | OUT-OF-SCOPE (web-only) |
| `FEAT-STK-LIST-V2` | EP-INVENTORY-STOCK-V2 | gf-inventory | DRAFT | DRAFT | DRAFT | DRAFT (read-only) |
| `FEAT-IP-VIEW-V2` | EP-INVENTORY-STOCK-V2 | gf-inventory | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-STK-DETAIL-V2` | EP-INVENTORY-STOCK-V2 | gf-inventory | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |

**Đếm cột**: be = 8 DRAFT (tất cả v1, 2 boundary: 5 gf-accounting + 3 gf-inventory) · bff = 8 DRAFT (tất cả v1) · fe-web = 8 DRAFT (tất cả v1, RECALC resolve Figma qua host screen) · mobile = 1 DRAFT + 7 out-of-scope (web-only, intentional per Figma registry).

**Route thật trên web = 5** (2 PRC route: List + Detail; 3 report route: at-date/inout/card) — RECALC + DELETE là action inline trên PRC-DETAIL/PRC-LIST, không có route riêng (đã reflect ở matrix trên bằng chú thích "action-in-X, no route").

---

## §4 Cross-boundary Contracts

> Nguồn: `Execution/wave-specs/W06/contract-scope.yaml` (6 file, 8 pair, signed 2026-07-31) + BR §1 Cross-boundary Rules (CB-AP-001 nhánh PRC, CB-STKV2-001) + execution-spec observed CB (CB-PRC-002, CB-STKV2-002/003).

| # | Contract | Touchpoint | Trạng thái |
|---|---|---|---|
| 1 | **PRC REST canonical** (`gf-accounting-api.md` v24 §5+§6) | `agg-garage-graph` → `gf-accounting`, 6 endpoint W06-1..6 | ✅ ACCEPTED; signed (contract-scope) |
| 2 | **PRC-facing S2S + Stock V2 Reports** (`gf-inventory-api.md` v72 §3f+§3g) | `gf-accounting` → `gf-inventory` (5 S2S, x-api-key) + `agg-garage-graph` → `gf-inventory` (6 report/export, JWT) | ✅ ACCEPTED (NF-02 fix 2026-07-28); signed |
| 3 | **GraphQL passthrough** (`agg-garage-graph-graphql.md` v7.79/v7.81 §3f+§3j) | `garage-web`/`garage-mobile` → `agg-garage-graph`, 12 op (9Q+3M) — Web 12/12 SUPPORTED, Mobile chỉ `stockLedgerAtDate` | ✅ ACCEPTED; signed |
| 4 | **gf-accounting data model** (§2quater, internal) | Producer self-sign — 2 entity `price_calc_run`/`price_calc_run_item`, `ddl-auto=update` | ✅ ACCEPTED; signed |
| 5 | **PRC BE↔BE narrative** (`INTEG-EXT-gf-accounting-gf-inventory.md`) | `gf-accounting` (caller, PRC engine owner) ↔ `gf-inventory` (provider, stock ledger SoT) | ✅ v3 (idempotency Redis, GAP-W06-GI-04 fix) — **PKG citation lag v2→v3**, xem §7 |
| 6 | **FE→GraphQL→REST mapping** (`INTEG-FE-garage-web-agg-garage-graph.md` §3.6d) | UI orientation — 8 FEAT → 12 op → REST downstream | ✅ v22/v23; signed, load-bearing gate |
| 7 | **CB-AP-001 (nhánh PRC)** | `gf-accounting` (master Kỳ + PRC) ↔ `gf-inventory` (master Sổ tồn SL + phiếu) — 2 chiều REST | BR-GF-INVENTORY-ACCOUNTING-PERIOD v40 §1 |
| 8 | **CB-STKV2-001/002/003** | Đọc trong-boundary (Nội bộ) + BFF passthrough thuần + upstream dependency PRC ghi giá trị (KHÔNG owned bởi epic Stock V2) | BR-GF-INVENTORY-STOCK-V2 v19 §1 + execution-spec observed |

---

## §5 Pre-wave / Mid-wave Scope Changes & Gap Resolutions

> W06 khác W05 (không có mid-wave DEV drift vì DEV chưa bắt đầu) — thay vào đó là chuỗi **pre-DEV cascade fix** phát hiện qua warm-up Phase A + BA-review + drift-check, toàn bộ resolve trước `/dev-start`.

| # | Thay đổi | Ngày | Tóm tắt | Nguồn |
|---|---|---|---|---|
| 1 | Full rebuild PKG v2→v3 | 2026-07-24 | Resolve 3 NEED CONFIRMATION skeleton: (a) PRC master = `gf-accounting`; (b) async = HTTP 202 + Temporal; (c) Figma mobile = 1/8 FEAT | `/gen-wave-plan`, `/arch-design W06` Round 1 |
| 2 | V1 Module Hide cascade | 2026-07-24 | PKG v3 thiếu cascade rule hide V1 đã ratified ở EP §5.2 v6 — bổ sung 5 vị trí | User Q&A gap |
| 3 | NF-02 close + version sync | 2026-07-28 | `gf-inventory-api.md` v71→v72 (Naming Registry `openingQty`/`openingValue` sync) — drift verdict `MINOR_DRIFT` → `CONSISTENT` | `DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md` |
| 4 | Carryover Audit chính thức | 2026-07-30 | 0 CR carry (6 unresolved, user triage 2 RESOLVED + 4 bỏ qua); 10 DEBT-W05-* carry nguyên vẹn | `/wave-start 06` |
| 5 | Quality Gate `agg-garage-graph` fix | 2026-07-31 | Sửa 3 vị trí PKG — align "Vitest ≥80%" (sai) → regression script `.regression.ts` (đúng thực tế repo, KHÔNG có Vitest tooling) | `/warm-up agg-garage-graph --phase A`, GAP-W06-AGG-01, CR-20260731-01 |
| 6 | Controller name fix (V1 hide) | 2026-07-31 | 3 V1 controller (sai) → 2 controller thật (`InventoryStockController`/`InventoryPeriodStockController`) | `/warm-up gf-inventory --phase A`, GAP-W06-GI-03 |
| 7 | Thẻ kho cascade (bỏ chip Kho + link Số phiếu) | 2026-07-31 | PKG chưa sync theo `FEAT-STK-DETAIL-V2` v15/v16 + `BR-STKV2-012` v18 — sửa 5 vị trí | Rà soát Product doc |
| 8 | contract-scope.yaml author + sign | 2026-07-31 | Skeleton → 6 contract thật, 8 pair signed | `/warm-up agg-garage-graph --phase A`, GAP-W06-AGG-02 |
| 9 | GraphQL/API doc version bump giữa authoring | 2026-07-31 | `gf-accounting-api.md` v24 (đã cite từ đầu, thiếu §0 Wave Index — xem §7); `agg-garage-graph-graphql.md` v7.79→v7.81; `INTEG-EXT-gf-accounting-gf-inventory.md` v2→v3 (GAP-W06-GI-04, idempotency Redis) | `_decisions.md` nhiều entry |

**Điểm khác biệt lớn nhất với các wave trước**: **`gf-accounting-api.md` thiếu §0 Wave Index** (CLAUDE.md item #13 — mega API doc >3000 dòng nên có, file này giờ có ≥2 wave sub-module: W04 AP + W06 PRC) → gây ra **F-7 fallback lặp lại nhiều lần** trong authoring (FEAT-PRC-CREATE/DETAIL/DELETE cả be lẫn bff tier đều bị bundle §G route nhầm section do keyword-match sai — `Create`→AP-CREATE, `Detail`→AP-DETAIL, `Delete`→AP-DELETE). Mọi trường hợp đã tự phục hồi đúng qua fallback Read trực tiếp (xem §7 item BLOCKING).

---

## §6 Sequencing DAG (Day 1-5, tổng hợp EP-PRC §8 + EP-STK §9 + PKG §4.1)

```
DAY 1 ────────────────────────────────────────────────────────────────────────
  gf-accounting  : Contract review §5+§6 v24 + ADR-027 v5 + ADR-028 v4; scaffold 2 entity JPA
                   (ddl-auto=update) + PriceCalcRunController/Service; Temporal worker embed
                   (register PriceCalcRunWorkflow, task queue PRC_TASK_QUEUE)
  gf-inventory   : Contract review §3f+§3g v72; scaffold StockV2ReportController + 5 S2S
                   protected endpoint controller (output feed cho gf-accounting Day 3)
  agg-garage-graph: Contract lock §3f+§3j v7.79/v7.81; scaffold price-calc-run/ + stock-v2-report/
  garage-web     : Reuse-First registry lookup + status-chip "Đang tính" (/allow-new-component
                   nếu thiếu); Navigation (2 menu entry mới + T-web-Nav5 V1 hide); routes
                   scaffold 5 route; mock GraphQL
  garage-mobile  : Reuse-First widget verify; LocaleKeys VN/EN inventory; hub enable tile "Tồn kho"

DAY 2 ────────────────────────────────────────────────────────────────────────
  gf-accounting  : W06-1/W06-2 (search/detail-polling) + W06-6 (lookup items-for-cogs); W06-3
                   CREATE 202 kick-off — INSERT PENDING + WorkflowClient.start() + Idempotency-Key
  agg-garage-graph: 6 resolver PRC passthrough; enrichment executedByName; Idempotency-Key
                   arg→header forward 2 mutation + @FeatureOn fail-fast + error-code map
  garage-web     : PriceCalcRunListPage (2 filter + modal "Chạy tính giá") +
                   PriceCalcRunDetailPage (polling Apollo pollInterval:5000)
  garage-mobile  : StockAtDateReportPage (SmartRefresher + skeleton + filter + search)

DAY 3 ────────────────────────────────────────────────────────────────────────
  gf-accounting  : **7 Temporal activities** (SnapshotPull · UpdateRunStatus · ComputeItem
                   engine BQGQ 5-phase + tính lặp hội tụ SAFETY_ITERATION_CAP=100 ·
                   BulkFillCost · BulkInheritCost · BulkRecomputeLedger · CommitRun) —
                   **phần phức tạp nhất wave, critical path**
  gf-inventory   : W06-STK-Q1 (hide-rule OR) + Q2 (4-nhóm cột) + Q3 (thẻ kho, receipt_line
                   UNION delivery_line, KHÔNG đọc sổ tồn gộp) — không phụ thuộc PRC S2S
                   hoàn tất (giá vốn=0 hợp lệ nếu chưa chạy BQGQ)
  agg-garage-graph: Regression script price-calc-run.regression.ts (ts-node, KHÔNG Vitest)
  garage-web     : 3 report page (StockAtDateReportPage/StockInoutSummaryReportPage/
                   StockCardDetailPage full-page) + export button 3 nơi
  garage-mobile  : Widget/bloc_test/alchemist golden ≥60%; Semantics + SafeArea → REVIEW
                   handoff Day 3

DAY 4 ────────────────────────────────────────────────────────────────────────
  gf-accounting  : W06-4 RECALC (copy-forward + source_run_id) + W06-5 DELETE (soft-delete +
                   2 guard 409); concurrency 3-layer verify
  gf-inventory   : W06-STK-EX1/EX2/EX3 (export POI SXSSF, template binding) + V1 Module Hide
                   (@FeatureOff → 410 ERR-INV-050)
  garage-web     : error-messages.ts extend + toast wording verbatim; Vitest ≥60% + testid
                   ≥95% + polling mock test → REVIEW handoff

DAY 5 ────────────────────────────────────────────────────────────────────────
  gf-accounting  : Unit + integration test ≥80% — hội tụ tự tham chiếu + safety cap trigger +
                   kỳ đóng chặn 3 write op + run-in-progress chặn + Idempotency replay +
                   Temporal outage compensating rollback
  gf-inventory   : Integration test — hide-rule edge case + Q3 pagination-safe running total +
                   reconciliation invariant + export row cap + V1 endpoint 410/restore
  TEST_PLANNING song song REVIEW (agent-test-api/ui/e2e/performance/mobile-ui)
  Cross-boundary integration test: chạy PRC "Tất cả mã" → S2S snapshot → compute → S2S
    bulk-fill-cost/bulk-recompute → giá vốn + sổ tồn khớp → phiếu trả tự tham chiếu → hội tụ
    → S2S bulk-inherit-cost đúng → báo cáo Q1/Q2/Q3 khớp số → RECALC → source_run_id chain
    → concurrent CREATE cùng (kỳ,kho) → 1 thành công 1 chặn ERR-INV-029
  Exit: build/lint/test pass 4 boundary (gf-accounting/gf-inventory/agg-garage-graph/garage-web)
        + mobile; REVIEW P1=0; AC coverage 100% (8 FEAT web full 8/8; mobile 1/8)
```

**Critical path = `gf-accounting` Day 1-5 (~39h, dày nhất wave)** — 7 Temporal activities Day 3 là điểm rủi ro cao nhất (P2 drop-first = KHÔNG có, PRC là core value không thể drop). `gf-inventory` build **chung 1 lượt cả 11 endpoint canonical** (5 S2S PRC-facing Day 1-2 + 6 report/export Day 3-4) — không tách effort riêng theo epic (xem §7 NC-W06-EP-STK-003).

---

## §7 Open Items (Aggregated NEED CONFIRMATION)

> Tổng hợp từ 2 EP §10/§11 (5 NC) + 2 BR §7 (2 OI) + drift phát hiện qua đọc chéo `_decisions.md` (~40 entries) trong phiên overview này. Chi tiết per-FEAT nằm ở §NEED CONFIRMATION/§11 riêng mỗi tier spec (không lặp lại toàn bộ ở đây).

### 7.1 BLOCKING / HIGH — cần Architecture Authority xác nhận trước/trong DEV

| # | Item | Chi tiết | Owner |
|---|---|---|---|
| NC-W06-OV-001 | **`gf-accounting-api.md` thiếu §0 Wave Index** (CLAUDE.md item #13) — gây F-7 fallback lặp lại nhiều lần trong authoring | File giờ có ≥2 wave sub-module (W04 AP §4.x + W06 PRC §5.x) — vượt threshold mandatory §0. Bundle generator keyword-match nhầm section nhiều lần (`Create`→W06-AP-CREATE thay vì W06-3 PRC, `Detail`→AP-DETAIL, `Delete`→AP-DELETE) cho cả be-tier lẫn bff-tier của FEAT-PRC-CREATE/DETAIL/DELETE — mọi trường hợp đã tự phục hồi qua fallback Read trực tiếp (§7 bundle §G flag `⚠️`), nhưng đây là **root cause lặp lại có hệ thống**, không phải lỗi từng lần riêng lẻ. Nên retrofit §0 trước wave sau (W07+) nếu boundary `gf-accounting` tiếp tục mở rộng. | Architecture Authority — retrofit `## §0 Wave Index` cho `gf-accounting-api.md` (mirror `gf-inventory-api.md`/`agg-garage-graph-graphql.md` đã có) |
| NC-W06-OV-002 | **`source_sha` chưa compute cho cả 4 file EP+BR** — author session không có Bash tool | Mirror gap tooling W04/W05 (chưa resolve xuyên suốt project). `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` §7 đánh dấu OI-W06-BR-AP-001 **BLOCKING cho ACTIVE** (khác 3 file kia chỉ LOW/tooling). | Delivery Authority (orchestrator/CI) — backfill `sha256sum` 4 file trước bump ACTIVE |
| NC-W06-OV-003 | **`INTEG-EXT-gf-accounting-gf-inventory.md` version citation drift v2→v3** — PKG-W06 §2.4/§3 cite "v2" nhưng file thực tế đã bump "v3" cùng ngày 2026-07-31 (GAP-W06-GI-04, sửa cơ chế idempotency Redis) | Nội dung v3 tương thích/superset v2 — KHÔNG blocking DEV, chỉ doc-hygiene | Delivery Authority — sync citation PKG lần bump tiếp theo |

### 7.2 MEDIUM — không block DEV nhưng cần theo dõi / ratify trước ACTIVE

| # | Item |
|---|---|
| NC-W06-OV-004 | **2 decision-log entry stale so với final frontmatter** — `_decisions.md` entry #26 (FEAT-PRC-DELETE be-tier) và #37 (FEAT-PRC-RECALC be-tier) ghi nhận quyết định "giữ nguyên `paired_bff_feats`/`paired_fe_web_feats`/`paired_mobile_feats: []`", nhưng **frontmatter thực tế hiện tại của cả 2 file đã populate đầy đủ** `paired_bff_feats`/`paired_fe_web_feats: ["FEAT-PRC-DELETE"]`/`["FEAT-PRC-RECALC"]` — reciprocity đã đúng và nhất quán 3 tier (verified trực tiếp be/bff/fe-web cả 2 FEAT trong phiên overview này). Đây **KHÔNG phải bug nội dung** (state cuối cùng đúng) — chỉ là **audit-trail hygiene gap**: có 1 correction xảy ra sau entry #26/#37 nhưng không được log lại. Đề nghị author liên quan bổ sung 1 decision-log entry supersede (mirror pattern entry #22 "SUPERSEDE decision trên" đã áp dụng đúng cho FEAT-IP-VIEW-V2 bff-tier). |
| NC-W06-OV-005 | **`FEAT-STK-DETAIL-V2` (fe-web) route path NEED CONFIRMATION** — `/inventory/stock-report/card` suy luận, chưa verify khớp router thật của `FEAT-STK-LIST-V2` fe-web tier (landing route `/inventory-stock/reports/at-date` theo PKG §2.2.4, khác prefix `/inventory/` được đề xuất) — cần đối chiếu 2 file khi cả 2 đã DRAFT (cả 2 đã DRAFT tại thời điểm viết overview này, cần 1 pass đối chiếu route prefix nhất quán trước ACTIVE). |
| NC-W06-OV-006 | **`FEAT-IP-VIEW-V2` (fe-web) 4 NEED CONFIRMATION**: (a) kho filter single vs multi-select; (b) route đích click cell "Mã SP nội bộ" (nghi vấn FEAT-STK-DETAIL-V2); (c) vị trí + text ghi chú "cần chạy tính giá" AC-4; (d) format số Giá trị có/không hậu tố "đ" chưa nhất quán (ảnh hưởng cả web table lẫn export Excel AC-7). |
| NC-W06-OV-007 | **`FEAT-STK-LIST-V2` (mobile) GraphQL warehouse-list op còn thiếu trong bundle** — flag NEED CONFIRMATION, KHÔNG tự bịa op mới theo F-7; cần Architecture Authority xác nhận op filter Kho cho dropdown multi-select mobile. |
| NC-W06-OV-008 | **Effort Day 3-4 Stock V2 report/export** trích tách từ estimate combined `~26h/~3.5 ngày` của `agent-dev-gf-inventory` (PKG §4.1) — chưa tách riêng effort báo cáo vs S2S scaffold; theo dõi tại PKG §10 Post-Wave Actuals. |
| NC-W06-OV-009 | **Sibling epic forward-reference đã verify tồn tại** (resolve NC-W06-EP-STK-002) — `EP-INVENTORY-STOCK-V2.md` §8/§10 tham chiếu tới `EP-INVENTORY-ACCOUNTING-PERIOD.md` bằng path dự kiến lúc 2 agent chạy song song; overview này đã confirm **cả 2 file đều tồn tại** (đọc trực tiếp trong §0 trên) — item này CLOSED, không cần orchestrator hành động thêm. |

### 7.3 LOW / INFO — theo dõi, không block

| # | Item |
|---|---|
| NC-W06-OV-010 | `pkg_sha` chưa compute (cùng nguyên nhân thiếu Bash, xem NC-W06-OV-002). |
| NC-W06-OV-011 | `BR-GF-INVENTORY-ACCOUNTING-PERIOD` filter §1 theo FEAT-trong-wave (18/18 BR-PRC verbatim + 2 rule cross-cutting), khác `BR-GF-INVENTORY-STOCK-V2` (không filter, file dành riêng 1 epic) — 2 pattern khác nhau đúng theo policy mode `business-rule`, không phải drift (đã tự flag trong `_decisions.md` entry cuối). |
| NC-W06-OV-012 | `data hygiene`: `STATE.json cr_log[]` có 2 entry trùng `id="CR-20260720-01"` (1 resolved, 1 unresolved) — carry từ PKG §9, chưa dedupe, follow-up cho Delivery Authority (không phải W06-specific). |

### 7.4 Carryover từ W05 (per PKG §9, audit `/wave-start 06` 2026-07-30)

| # | Item | Trạng thái |
|---|---|---|
| CR chưa resolved | 0/6 sau triage | 2 RESOLVED (CR-20260720-03, CR-20260727-02); 4 bỏ qua có lý do (không carry) |
| DEBT-W05-001..010 (10 items) | Tất cả `Status=OPEN`, `Acceptable Until: W06` | Action trong W06: mỗi debt xử lý bởi FIX agent per boundary owner (gf-sales/gf-inventory/gf-purchase/garage-web) HOẶC re-defer với lý do rõ trước `/wave-end` W06 — WAVE_END gate yêu cầu 0 open blocker |

---

## §8 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (post-ACTIVE audit fix, user sonhoang directive "xử lý tất cả các vấn đề đó") | **Xóa `boundaries_cross_boundary_consumed_only: [gf-erp-mdm]` sai** — audit BE+BFF wave-spec phát hiện endpoint `GET /internal-products/search (gf-erp-mdm)` mà `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC` từng cite cho lookup "Thêm phụ tùng" không hề tồn tại; catalog InternalProduct thật sự thuộc `gf-inventory` (`V2-7`, đã có trong `boundaries_in_wave`). Cascade: `Architecture/api/gf-inventory-api.md` v76→v77 (CR-20260731-03, additive `pricingMethod` filter) + 6 tier file be/bff sửa contract citation (xem `_decisions.md`). Đồng bộ `version` frontmatter khớp Change Log. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT wave overview W06 từ 29 spec DRAFT (2 EP + 2 BR + 25 FEAT-tier: 8 be + 8 bff + 8 fe-web + 1 mobile). §1 Wave scope narrative — PRC (gf-accounting NEW boundary + Temporal 6th service, engine BQGQ 5-phase + tính lặp hội tụ, async 202+Temporal reversal ADR-028 v1→v4) song song Stock V2 Reports (gf-inventory read-only, phụ thuộc kết quả PRC). §2 Vertical slice end-to-end (Web/Mobile → BFF → gf-accounting Temporal engine ↔ gf-inventory S2S → sổ tồn → 3 báo cáo). §3 Feature × Tier matrix (8 FEAT × 4 tier, mobile narrow nhất chuỗi Inventory V2 — 1/8; RECALC/DELETE action-inline không route riêng). §4 Cross-boundary contracts (8 contract, 6 file signed qua contract-scope.yaml + 2 CB nhóm BR). §5 Pre-wave/mid-wave scope changes (9 cascade fix, đặc biệt nhấn mạnh `gf-accounting-api.md` thiếu §0 Wave Index là root cause hệ thống gây F-7 fallback lặp lại). §6 Sequencing DAG Day 1-5 (critical path `gf-accounting` Day 3 — 7 Temporal activities). §7 Open items — phát hiện mới quan trọng nhất trong phiên overview này: **NC-W06-OV-001** (gf-accounting-api.md thiếu §0 Wave Index, khuyến nghị retrofit) và **NC-W06-OV-004** (2 decision-log entry stale so với frontmatter thực tế — FEAT-PRC-DELETE/RECALC be-tier đã được sửa reciprocity đúng nhưng log chưa ghi correction, tự phát hiện qua đọc chéo file thực tế vs `_decisions.md` trong phiên này, mirror cách W05 overview từng phát hiện NC-W05-OV-001), cộng 2 BLOCKING/HIGH khác (source_sha tooling gap, version citation lag), 6 MEDIUM (1 đã CLOSED — sibling epic forward-ref), 3 LOW/INFO, và carryover W05 (10 DEBT + 0 CR, cần triage trước `/wave-end 06`). |
