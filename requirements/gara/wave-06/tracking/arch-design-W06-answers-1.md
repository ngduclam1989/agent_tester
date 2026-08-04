# /arch-design W06 — Answers Round 1

**Wave**: W06 — Tính giá + Báo cáo (Inventory V2 slice 4/4)
**Author agent**: agent-arch-author (previous run: `ac027d8aaf242bbe3`, phase_reached=`1-preflight`)
**Answered by**: Delivery Authority (user: lemn / dev-ac@cardoctor.vn)
**Date**: 2026-07-22
**Authority ratified**: SA + Delivery Authority + Backend Lead (composite A/A/A decision)

---

Q1: **A** — Ratify Product T2 (canonical). PRC master = `gf-accounting`. Author design target: `Architecture/hld/gf-accounting-HLD.md` + `Architecture/api/gf-accounting-api.md` + `Architecture/data/gf-accounting-data-model.md` + `Architecture/events/gf-accounting-events.md` (Modify hoặc New tuỳ file exist). `gf-inventory` chỉ nhận Modify (expose stock-ledger read + phiếu-in-period read + bulk write giá vốn / bulk update StockLedger.total_value REST endpoints cho gf-accounting caller). STOCK-V2 (3 FEAT: STK-LIST-V2 / IP-VIEW-V2 / STK-DETAIL-V2) vẫn ở gf-inventory (đã confirm FEAT-STK-LIST-V2 v9 frontmatter). Cascade Execution tier: Delivery Authority sẽ raise MINOR CR update PKG-W06 §Boundaries + Plan/WAVE-SEQUENCE.md §Wave 6 Boundaries + STATE.json waves_planned[W06].affected_boundaries += `gf-accounting` — chạy sau khi Author return COMPLETE để không đụng forbidden_paths trong lúc design.

Reasoning: Product T2 (EP v21 §5.2 + BR v29 §CB-AP-001 v25 + 5 FEAT-PRC-* frontmatter v29 đồng bộ) là source-of-truth cho boundary ownership. Execution tier drift là do PKG-W06 v2 chưa rebuild (§10 Change Log v2 tự đánh dấu "skeleton v2 — full rebuild sẽ chạy khi vào W06 planning cycle") — nay đến cycle, cascade là chuẩn. Pattern ERP truyền thống (SAP FI-CO / Misa) — PRC là kế toán compute, gf-inventory là data source.

Q2: **A** — ADR-027 (engine BQGQ cuối kỳ + tính lặp hội tụ khi có Nhập trả tự tham chiếu — BR-PRC-017; làm tròn 2 chữ số thập phân dùng giá trị đã round tính tiền — BR-PRC-013; scope 2 (ALL / ERROR_ONLY) — BR-PRC-008 v29; chặn CREATE/RECALC khi kỳ CLOSED — EP §3.2) + ADR-028 (PRC async execution pattern: sync HTTP POST /price-calc-runs response 202 Accepted + runId ngay → ExecutorService background thread compute → client poll GET /price-calc-runs/{id} 5s cho tiến độ realtime; resume-on-crash qua DB state persist + status = PENDING/RUNNING/COMPLETED/FAILED). KHÔNG expand Temporal sang gf-accounting (giữ gotcha #7: Temporal chỉ 5 services).

Reasoning: BR-PRC-016 v29 explicit wording "job chạy server-side, độc lập client, tắt máy/đóng browser không dừng" — implicitly mô tả server-side background pattern, không mô tả Temporal durable execution. Adopt Temporal cho gf-accounting sẽ tràn timebox W06 5 ngày (spike Temporal + on-call + deploy pipeline setup 1-2d) + tech-debt (gf-accounting hiện `ddl-auto=update` + no Kafka Temporal wiring). Sync HTTP 202 + background thread + DB state persist + status polling đơn giản, khớp BR wording, timebox khả thi. Nếu tương lai perf issue với "Tất cả mã" scale → CR-based upgrade sang Temporal (patch ADR-028 v2).

Q3: **A** — Tạo mới `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` (canonical, 2 chiều: gf-accounting → gf-inventory READ stock-ledger-at-date + slips-in-period + WRITE bulk-fill-cost + bulk-update-value; gf-inventory → gf-accounting READ period-lock-check reference existing ADR-021 §13 INTEG-EXT-gf-inventory). Modify existing `Architecture/integrations/INTEG-EXT-gf-inventory.md` add §PRC-callers section reference (cross-link).

**BẮT BUỘC** Author verify runtime `Architecture/api/gf-inventory-api.md §0 Wave Index` cho phạm vi W04/W05 — có endpoint stock-ledger-at-date hoặc slips-in-period nào ship rồi thì REUSE (append §Callers row cho gf-accounting), KHÔNG design duplicate. Nếu chưa có → new W06 endpoint đăng ký vào §3<letter> gf-inventory-api.md (append §0 row cascade per FM-020).

Reasoning: Clean semantics — `INTEG-EXT-gf-accounting-gf-inventory.md` = "external to gf-accounting perspective, target gf-inventory" (mirror `INTEG-EXT-gf-inventory-worker.md` pattern). Option B mismatch semantics (INTEG-EXT-gf-inventory hàm ý gf-inventory là external service). Option C event-driven Kafka mâu thuẫn BR-PRC-016 UI polling contract ("tiến độ realtime").

---

## Additional context cho Author

1. **Delivery Authority cascade CR** sẽ chạy SAU khi Author return COMPLETE (variant B) — Author KHÔNG cần đụng PKG-W06/WAVE-SEQUENCE/STATE trong phase 1-10 (đúng discipline: forbidden_paths + owned_paths policy).

2. **Design surface expected** (per Author's own estimate):
   - HLD: `Architecture/hld/gf-accounting-HLD.md` (Modify major — add PRC BQGQ subsystem)
   - API new: `Architecture/api/gf-accounting-api.md` (verify exist first — Modify if exist, New if not; PRC endpoints)
   - API modify: `Architecture/api/gf-inventory-api.md` (add W06 §3<letter> — expose stock-ledger + slips-in-period + bulk-fill-cost + bulk-update-value REST endpoints for gf-accounting caller; append §0 Wave Index row per FM-020 cascade rule)
   - API modify: `Architecture/api/agg-garage-graph-graphql.md` (W06 module PRC + STOCK-V2 GraphQL operations; append §0 row)
   - Data model: `Architecture/data/gf-accounting-data-model.md` (Modify — add PriceCalcRun / PriceCalcRunItem / PriceCalcRunError entities; ddl-auto=update per gotcha #5)
   - Events: `Architecture/events/gf-accounting-events.md` (Modify or New if not exist — evaluate whether PRICE_CALC_STARTED/COMPLETED/FAILED events needed for downstream consumers)
   - INTEG new: `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`
   - INTEG modify: `Architecture/integrations/INTEG-EXT-gf-inventory.md` (add §PRC-callers reference)
   - HLD modify: `Architecture/hld/gf-inventory-HLD.md` (add §PRC-consumer subsystem — expose stock ledger + slips + bulk write endpoints)
   - HLD modify: `Architecture/hld/garage-web-HLD.md` + `Architecture/hld/garage-mobile-HLD.md` (STOCK-V2 screens; note mobile scope narrow — chỉ FEAT-STK-LIST-V2 có Figma mobile per WAVE-SEQUENCE.md:579)
   - ADR new: `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md`
   - ADR new: `Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md`

3. **Persona check** — dual persona verified: `garage-owner` + `accountant` (EP §2). KHÔNG có role mới. T2 stays clear.

4. **Cross-wave state-matrix** `FEAT-INV-MOBILE-MENU` (hub enable tile "Tồn kho" → 6 tile per BR-INV-MENU-002) — Author note trong Executive Summary, không design artifact riêng (chỉ flag flip cấu hình hub base ship ở W04).

5. **ADR-026 = ADR max hiện hữu**, ADR mới đánh số **027, 028** — verify runtime `ls Architecture/decisions/ADR-*.md | sort -V | tail -1` trước khi tạo.

6. **Naming Registry (§5b)** — pick canonical cho "Đơn giá bình quân" / "Giá bình quân" khi resolve trong Phase 5b (v20 rename per screenshot — Author consult EP + BR + FEAT text lấy consistent canonical, không tự chọn nếu 2 tên vẫn xuất hiện đồng thời → T6 fire).
