# Wave 06 Tasks — gf-accounting

> Extracted từ agent-dev-gf-accounting.md (service repo) § Wave block.
> Auto-cleared khi wave-end (`sync-docs-to-services.sh reset`).

### W06 — Tính giá + Báo cáo (~39h — dày nhất wave, gf-accounting NEW boundary trong wave W06)

| Field | Value |
|---|---|
| Wave ID | W06 — Tính giá + Báo cáo (Inventory V2 slice 4/4 — wave cuối; PRC master **NEW boundary W06** trên gf-accounting per ADR-027/ADR-028) |
| Tier | be |
| Phase | Feature delivery — PRC (Phân bổ giá vốn BQGQ) job async + Temporal workflow embedded |
| Features | PRC (5): `FEAT-PRC-LIST` · `FEAT-PRC-CREATE` · `FEAT-PRC-DETAIL` · `FEAT-PRC-RECALC` · `FEAT-PRC-DELETE` |
| Work Package | `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v9 §2.2.1 (Backend gf-accounting) + §4.1 (agent-dev-gf-accounting row) + §5.1 |
| Wave-spec source | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-{LIST,CREATE,DETAIL,RECALC,DELETE}.md` *(ACTIVE — tier-authoritative)* |
| Boundary owned | gf-accounting (PRC master — 2 entity mới `price_calc_run`/`price_calc_run_item`, `ddl-auto=update` KHÔNG Flyway) |
| Cross-deps | `gf-inventory` **S2S** (gf-accounting → gf-inventory: 5 endpoint protected `W06-P1..P5` snapshot/enumerate/bulk-fill-cost/bulk-inherit-cost/bulk-recompute; x-api-key auth); `agg-garage-graph` §3f passthrough 6 op (3 Query + 3 Mutation); Temporal Cloud (`PRC_TASK_QUEUE`, service thứ 6 dùng Temporal — Common Gotcha #7) |
| Source root | `services/gf-accounting/` |
| Branch | `feature/ep-inventory-v2-w06` |

**Input Docs** (đọc đúng thứ tự):
- **[tier-authoritative]** `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-{LIST,CREATE,DETAIL,RECALC,DELETE}.md` — §2 Trách nhiệm backend + §6 API contract delta + §8 DAG S1→S4
- `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v9 §2.2.1 (Entity + REST index W06-1..6 + Temporal workflow 7 activities + engine BQGQ 5-phase) + §4.1 (DEV row) + §5.1 (Exit criteria)
- `Plan/WAVE-SEQUENCE.md` §Wave 6 (Entry/Exit + demo)
- `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v23 (§3.2 công thức BQGQ, nhóm PRC) + `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v40 (BR-PRC-001..018)
- `Architecture/api/gf-accounting-api.md` v24 §5 (6 endpoint canonical W06-1..6) + §6 Naming Registry (`PriceCalcRun`/`PriceCalcRunItem`/`PriceCalcRunStatus`/`PriceCalcErrorReason`)
- `Architecture/data/gf-accounting-data-model.md` v14 §2quater (2 bảng `price_calc_run`/`price_calc_run_item`, `ddl-auto=update`)
- `Architecture/decisions/ADR-027-bqgq-pricing-engine.md` v5 (engine BQGQ + tính lặp hội tụ safety cap 100) + `ADR-028-prc-async-execution.md` v4 (HTTP 202 + Temporal workflow `PRC_TASK_QUEUE`, embed Spring Boot main process — Q2 v3 reversal 2026-07-23)
- `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v2 (2 chiều: gf-accounting→gf-inventory READ+WRITE S2S; gf-inventory→gf-accounting READ period-lock-check)
- `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml`

**Tasks — BE scope** (wave-spec §2 + §8 DAG, cross-check PKG §4.1):
- [ ] **Day 1 — Contract + scaffold + Temporal wiring** (~8h): Contract review §5+§6 v24 + ADR-027 v5 + ADR-028 v4; scaffold 2 entity JPA `price_calc_run`/`price_calc_run_item` (`ddl-auto=update` — **KHÔNG viết Flyway migration**, khác `gf-inventory` dùng Flyway additive) + `PriceCalcRunController`/`PriceCalcRunService`; Temporal worker embed Spring Boot main process (mirror `gf-sales` pattern), register `PriceCalcRunWorkflow` trên task queue `PRC_TASK_QUEUE` (Common Gotcha #7 — service thứ 6 dùng Temporal).
- [ ] **Day 2 — Search/detail/lookup + CREATE kick-off** (~9h): `W06-1` search + `W06-2` detail-polling (Redis cache 3s TTL) + `W06-6` lookup items-for-cogs (cross-boundary compose `gf-erp-mdm` + `gf-inventory`); `W06-3` CREATE — INSERT `status=PENDING` → `WorkflowClient.start()` `workflowId=prc-{tenantId}-{runId}`, `taskQueue=PRC_TASK_QUEUE`, `WorkflowIdReusePolicy.REJECT_DUPLICATE`, timeout 60min; response `{runId, status, pollingUrl, pollingIntervalHint:5000}`; `X-Idempotency-Key` REQUIRED window 5 phút; mã "Ngừng hoạt động" bỏ qua + `warningsSkippedItems`; Temporal outage → 503 + compensating DELETE row.
- [ ] **Day 3 — 7 Temporal activities (critical path, phức tạp nhất wave)** (~8h): `SnapshotPull` (S2S W06-P1/P2) · `UpdateRunStatus` · `ComputeItem` (engine BQGQ 5-phase: Phase 0 resolve items → Phase 1 snapshot pull → Phase 2 compute per item parallel + tính lặp hội tụ khi `has_self_reference` với `SAFETY_ITERATION_CAP=100` → Phase 3 commit bulk-fill-cost → Phase 4 cascade sổ tồn → Phase 5 commit run status; công thức Đơn giá BQ = (GT tồn đầu + GT nhập)/(SL tồn đầu + SL nhập), `HALF_UP` scale 2, dùng chính giá trị round để tính tiền BR-PRC-013) · `BulkFillCost` (S2S W06-P3) · `BulkInheritCost` (S2S W06-P4, BR-PRC-017 tính lặp) · `BulkRecomputeLedger` (S2S W06-P5) · `CommitRun`; heartbeat 60s cho `ComputeItemActivity`.
- [ ] **Day 4 — RECALC + DELETE + concurrency** (~6h): `W06-4` RECALC tạo row MỚI `source_run_id` trỏ run gốc, copy-forward Phase 0, `affectedSubsequentPeriods[]` cảnh báo (BR-PRC-015); `W06-5` DELETE soft-delete (KHÔNG rollback giá vốn), 2 guard 409 (kỳ đóng `ERR-INV-024` + run-in-progress `ERR-INV-029`, BR-PRC-011); concurrency 3-layer verify (DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy` + partial unique index `uidx_prc_active_lock`).
- [ ] **Day 5 — Test + KG sync** (~8h): Unit + integration test Testcontainers + Temporal test env ≥80% — scenario: hội tụ tự tham chiếu (2-3 vòng) + safety cap trigger + kỳ đóng chặn CREATE/RECALC/DELETE + run-in-progress chặn + Idempotency replay + Temporal outage compensating rollback; KG sync + review fix.

**Entry Criteria** (PKG §3 + WAVE-SEQUENCE hard gate):
- [ ] Hard gate W05→W06 pass: Nhập/Xuất trong kỳ + sổ tồn stable (đầu vào BQGQ)
- [ ] Architecture ratified: `gf-accounting-api.md` v24 §5+§6 + `gf-accounting-data-model.md` v14 §2quater + ADR-027 v5 + ADR-028 v4 — ✅ ACCEPTED (`Tracking/ARCH-REVIEW-W06.md` Round 3 UNBLOCK 2026-07-23)
- [ ] Temporal Cloud connectivity verify — embed worker cần kết nối + task queue `PRC_TASK_QUEUE` registered, readiness check verify worker poll thành công (KHÔNG chỉ HTTP reachable)
- [ ] Wave-spec ACTIVE (5 tier files be/FEAT-PRC-*.md)
- [ ] PO sign-off EP-INVENTORY-ACCOUNTING-PERIOD v23 (nhóm PRC) + BR-GF-INVENTORY-ACCOUNTING-PERIOD v40 ratified — BA-review 2026-07-24 8/9 finding resolved
- [ ] Branch `feature/ep-inventory-v2-w06`; STATE `wave=06`, `stage=DEV`

**Exit Criteria / Deliverables** (PKG §5.1 gf-accounting bullets):
- [ ] `cd services/gf-accounting && JAVA_HOME=<java-21+> ./gradlew build checkstyleMain test jacocoTestReport` — coverage ≥ 80% (NEW boundary DEV agent trong wave)
- [ ] 6 endpoint canonical hoạt động (W06-1..6) + `PriceCalcRunWorkflow` Temporal (7 activities)
- [ ] Entity `price_calc_run`/`price_calc_run_item` — `ddl-auto=update` (KHÔNG Flyway migration file)
- [ ] Engine BQGQ 5-phase đúng công thức + tính lặp hội tụ (safety cap 100, KHÔNG hard-block toàn run khi vượt cap)
- [ ] CRUD + lifecycle: search/detail-polling/create(202)/recalc(202 + source_run_id)/delete(soft, no-rollback) — 2 guard 409 toàn 3 write op
- [ ] Concurrency 3-layer: DB `SELECT FOR UPDATE` + Temporal `WorkflowIdReusePolicy` + partial unique index `uidx_prc_active_lock`
- [ ] Idempotency-Key kick-off 5 phút window
- [ ] TenantFilter + OriginTenantId integrity verified; boundary isolation (đọc `gf-inventory` qua REST S2S x-api-key — KHÔNG direct DB)
- [ ] KG `gf-accounting.knowledge-graph.yaml` updated — entities MỚI (`price_calc_run`/`price_calc_run_item`) + Temporal workflow registration + 3-in-1 version bump mọi file sửa
- [ ] PR commit reference EP-INVENTORY-ACCOUNTING-PERIOD + 5 FEAT-PRC-* + ADR-027 v5 + ADR-028 v4

**Handoff to**:
- REVIEW: `agent-review-backend` (.agents/ — BE+BFF) — P1=0 (`ddl-auto=update` verify KHÔNG Flyway migration mới; Temporal workflow discipline workflowId deterministic + `WorkflowIdReusePolicy.REJECT_DUPLICATE` + heartbeat; concurrency 3-layer; BQGQ round HALF_UP scale 2; tính lặp hội tụ safety cap 100; S2S x-api-key + chunk idempotency)
- TEST: `agent-test-api` (6 endpoint gf-accounting + error code `ERR-INV-024/029/030/031/052` + async state machine + Idempotency-Key replay + concurrency + tính lặp hội tụ scenario), `agent-test-e2e` (journey chạy PRC → polling → hoàn tất → giá vốn điền → báo cáo khớp → recalc → hội tụ → xóa log → kỳ đóng chặn), `agent-test-isolation` (tenant isolation `price_calc_run`), `agent-test-security` (S2S x-api-key + JWT tenant tampering), `agent-test-performance` (BQGQ "Tất cả mã" quy mô lớn — heartbeat + timeout Temporal)
- NEXT WAVE GATE: n/a — W06 là wave cuối `EP-INVENTORY-V2` (slice 4/4) per WAVE-SEQUENCE §P2.1

<!-- End of wave assignments. Update when boundary scope expands. -->
