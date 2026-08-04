# Wave 06 Tasks — gf-inventory

> Extracted từ agent-dev-gf-inventory.md (service repo) § Wave block.
> Auto-cleared khi wave-end (`sync-docs-to-services.sh reset`).

### W06 — Tính giá + Báo cáo (~26h — Stock V2 Reports + PRC-facing S2S)

| Field | Value |
|---|---|
| Wave ID | W06 — Tính giá + Báo cáo (Inventory V2 slice 4/4 — wave cuối; PRC master chuyển sang `gf-accounting`, gf-inventory giữ Stock V2 Reports + S2S callee) |
| Tier | be |
| Phase | Feature delivery — 3 báo cáo đọc realtime từ sổ tồn + 5 endpoint S2S protected phục vụ engine BQGQ của gf-accounting |
| Features | STOCK-V2 (3): `FEAT-STK-LIST-V2` (tồn đến ngày, web+mobile) · `FEAT-IP-VIEW-V2` (NXT, web-only) · `FEAT-STK-DETAIL-V2` (thẻ kho, web-only) |
| Work Package | `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v9 §2.2.2 (Backend gf-inventory) + §4.1 (agent-dev-gf-inventory row) + §5.1 |
| Wave-spec source | `Execution/wave-specs/W06/Product/features/be/FEAT-{STK-LIST-V2,IP-VIEW-V2,STK-DETAIL-V2}.md` *(ACTIVE — tier-authoritative)* |
| Boundary owned | gf-inventory (Stock V2 Reports + 5 S2S protected endpoint PRC-facing, KHÔNG PRC engine — engine ở `gf-accounting`) |
| Cross-deps | `gf-accounting` **S2S callee** (5 endpoint protected `W06-P1..P5` — x-api-key auth, gf-accounting gọi vào); `agg-garage-graph` §3j passthrough 6 op (Q1/Q2/Q3 + 3 export) |
| Source root | `services/gf-inventory/` |
| Branch | `feature/ep-inventory-v2-w06` |

**Input Docs** (đọc đúng thứ tự):
- **[tier-authoritative]** `Execution/wave-specs/W06/Product/features/be/FEAT-{STK-LIST-V2,IP-VIEW-V2,STK-DETAIL-V2}.md` — §2 Trách nhiệm backend + §6 API contract delta + §8 DAG S1→S4
- `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v9 §2.2.2 (5 S2S endpoint W06-P1..P5 + 3 report + 3 export W06-STK-Q1..Q3/EX1..EX3 + V1 Module Hide) + §4.1 (DEV row) + §5.1 (Exit criteria)
- `Plan/WAVE-SEQUENCE.md` §Wave 6 (Entry/Exit + demo)
- `Product/epics/EP-INVENTORY-STOCK-V2.md` v8 (§5.2 V1 Module Hide) + `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` v15 (BR-STKV2-001..015)
- `Architecture/api/gf-inventory-api.md` v72 §3f (PRC-facing S2S 5 endpoint) + §3g (Stock V2 Reports 3 report + 3 export) + §5.2 Naming Registry
- `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v2 (2 chiều: gf-accounting→gf-inventory READ+WRITE S2S; gf-inventory→gf-accounting READ period-lock-check)
- `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml`

**Tasks — BE scope** (wave-spec §2 + §8 DAG, cross-check PKG §4.1):
- [ ] **Day 1 — Contract review + scaffold** (~3h): Contract review §3f+§3g v72; scaffold `StockV2ReportController` + 5 S2S protected endpoint controller.
- [ ] **Day 2 — 5 S2S bulk/read endpoint** (~5h): `W06-P1` `GET /protected/v1/stock-ledgers/at-date` (batch snapshot sổ tồn `Từ ngày−1`, ≤200 productCodes/req) · `W06-P2` `POST /protected/v1/slips-in-period/search` (enumerate phiếu nhập/xuất trong kỳ) · `W06-P3` `POST /protected/v1/delivery-lines/bulk-fill-cost` (chunk ≤500, `X-Idempotency-Key: PRC-{runId}-FILL-{chunkIdx}`) · `W06-P4` `POST /protected/v1/receipt-lines/bulk-inherit-cost` (chunk ≤500, key `PRC-{runId}-INHERIT-{chunkIdx}`) · `W06-P5` `POST /protected/v1/stock-ledgers/bulk-recompute` (cascade sổ tồn từ `fromDate`, ≤200 productCodes/req, sync blocking ≤60s); x-api-key auth toàn bộ 5 endpoint.
- [ ] **Day 3 — 3 report endpoint** (~8h): `W06-STK-Q1` tồn đến ngày (hide rule OR `closing_qty≠0 OR closing_value≠0` v69) · `W06-STK-Q2` NXT (4 nhóm SL+GT Đầu/Nhập/Xuất/Cuối + `aggregates` 8 field) · `W06-STK-Q3` thẻ kho (đọc **chi tiết phiếu** `receipt_line`/`delivery_line` UNION POSTED — KHÔNG đọc sổ tồn gộp per BR-STKV2-013; `context{}`+`opening{}`+`content[]` mỗi dòng=1 phiếu thật; no-movement case trả 200 KHÔNG 404).
- [ ] **Day 4 — 3 export endpoint** (~4h): `W06-STK-EX1/EX2/EX3` Excel POI SXSSF streaming, template binding `Product/ux/assets/*.xlsx` (`Báo cáo tồn kho.xlsx`/`Báo cáo nhập xuất tồn.xlsx`/`Báo cáo thẻ kho.xlsx`); row cap 50k (EX1/EX2) / 10k (EX3).
- [ ] **Day 4.5 — V1 Module Hide (BẮT BUỘC)** (~1h): `InventoryStockController` + `InventoryPeriodStockController` (2 controller thật, GAP-W06-GI-03 fix — KHÔNG 3 class) gắn `@FeatureOff("Inventory:InventoryV2")` → 410 Gone `ERR-INV-050` khi flag ON (ưu tiên trên `@FeatureOn(INVENTORY_STOCK)` sẵn có); OFF → fallback V1 restore; V1 data KHÔNG xóa.
- [ ] **Day 5 — Test + KG sync** (~6h): Unit + integration test ≥80% (S2S chunk idempotency + report hide-rule edge case + Q3 pagination-safe running total + export cap + V1 endpoint 410 khi ON/restore khi OFF); KG sync + review fix.

**Entry Criteria** (PKG §3 + WAVE-SEQUENCE hard gate):
- [ ] Hard gate W05→W06 pass: Nhập/Xuất trong kỳ + sổ tồn stable (đầu vào BQGQ)
- [ ] Architecture ratified: `gf-inventory-api.md` v72 §3f+§3g+§5.2 — ✅ ACCEPTED (NF-02 fix 2026-07-28 — Naming Registry field `openingQty`/`openingValue` sync đúng, `movementKind` retag W04-write-side-only)
- [ ] Wave-spec ACTIVE (3 tier files be/FEAT-{STK-LIST-V2,IP-VIEW-V2,STK-DETAIL-V2}.md)
- [ ] PO sign-off EP-INVENTORY-STOCK-V2 v8 + BR-GF-INVENTORY-STOCK-V2 v15 ratified
- [ ] Branch `feature/ep-inventory-v2-w06`; STATE `wave=06`, `stage=DEV`

**Exit Criteria / Deliverables** (PKG §5.1 gf-inventory bullets):
- [ ] `cd services/gf-inventory && ./gradlew build checkstyleMain test jacocoTestReport` — coverage ≥ 80%
- [ ] 11 endpoint canonical hoạt động (5 S2S W06-P1..P5 + 3 report W06-STK-Q1..Q3 + 3 export EX1..EX3)
- [ ] S2S protected endpoint x-api-key + chunk idempotency `PRC-{runId}-{phase}-{chunkIdx}` verified
- [ ] Q1 hide-rule OR SL≠0/GT≠0; Q2 4-nhóm cột; Q3 đọc chi tiết phiếu KHÔNG sổ tồn gộp, `context`/`opening`/`aggregates` structure, 200 no-movement case
- [ ] 3 export POI SXSSF streaming + template binding đúng file
- [ ] V1 Module Hide: 2 controller thật `@FeatureOff("Inventory:InventoryV2")` → 410 `ERR-INV-050` khi ON; V1 data KHÔNG xóa
- [ ] TenantFilter + OriginTenantId integrity verified; boundary isolation (`bash scripts/hooks/check-boundary.sh` exit 0)
- [ ] KG `gf-inventory.knowledge-graph.yaml` updated — 11 endpoint + `integration_consumers.gf-accounting (S2S)` + 3-in-1 version bump

**Handoff to**:
- REVIEW: `agent-review-backend` (.agents/) — P1=0 (S2S x-api-key + chunk idempotency; hide-rule Q1 đúng OR pattern; Q3 nguồn dữ liệu đúng chi tiết phiếu KHÔNG sổ tồn gộp; export template binding đúng file; V1 Module Hide verify 2 controller `@FeatureOff` → 410 `ERR-INV-050`, V1 data không xóa; coverage ≥80%)
- TEST: `agent-test-api` (5 S2S + 6 report/export + error code + S2S chunk idempotency + Q3 no-movement 200 vs true-404), `agent-test-e2e` (cross-boundary journey PRC → S2S callback → báo cáo khớp số), `agent-test-isolation` (tenant + S2S scoped), `agent-test-security` (x-api-key S2S auth), `agent-test-performance` (báo cáo p95 ≤300ms + thẻ kho pagination-safe running total + export cap memory)
- NEXT WAVE GATE: n/a — W06 là wave cuối `EP-INVENTORY-V2` (slice 4/4) per WAVE-SEQUENCE §P2.1

<!-- End of wave assignments. Update when boundary scope expands. -->
