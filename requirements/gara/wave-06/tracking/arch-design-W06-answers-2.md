# /arch-design W06 — Answers Round 2 (BFF + FE + Mobile extension)

**Wave**: W06 — Tính giá + Báo cáo (Inventory V2 slice 4/4)
**Previous run**: `a16e8254030837af8` returned `status: COMPLETE, ready_for_review: true` — BE + cross-boundary artifacts done Round 1.
**Answered by**: Delivery Authority (user: lemn / dev-ac@cardoctor.vn)
**Date**: 2026-07-22
**Authority ratified**: SA + Delivery Authority (composite Round 1 A/A/A + Round 2 extend mandate)

---

## Q1/Q2/Q3 recap (Round 1 cleared, unchanged — DO NOT re-fire)

Q1: **A** — PRC master = `gf-accounting`. Round 1 artifacts DONE:
- Created: `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md`, `Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md`, `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`
- Modified: `Architecture/hld/gf-accounting-HLD.md` v11, `Architecture/hld/gf-inventory-HLD.md` v29, `Architecture/api/gf-accounting-api.md` v18, `Architecture/api/gf-inventory-api.md` v63, `Architecture/data/gf-accounting-data-model.md` v11, `Architecture/events/gf-accounting-events.md` v10, `Architecture/integrations/INTEG-EXT-gf-inventory.md` v21
- Cross-boundary REST S2S 5 endpoints (§3f gf-inventory-api.md) + 6 public PRC endpoints (§5 gf-accounting-api.md) all 6-block completeness passed.

Q2: **A** — ADR-027 + ADR-028 ratified per Round 1.

Q3: **A** — `INTEG-EXT-gf-accounting-gf-inventory.md` created canonical Round 1.

**Rule**: Round 2 KHÔNG re-author Round 1 BE artifacts. Chỉ extend BFF + FE + Mobile.

---

## Round 2 mandate — SCOPE (author BFF + FE + Mobile artifacts)

**Rationale**: Round 1 explicitly deferred 4 open questions cho Round 2 để tránh over-scope + trưng bày large-file discipline (agg-garage-graph-graphql.md 47k+ lines). Nay Round 2 hoàn thiện full design scope cho `/arch-review W06` — 1 lần review full scope tránh reviewer bounce 2 vòng (Option A recommended per main-agent handoff).

### Round 2 artifact list (verify runtime — Modify hoặc New tuỳ file exist)

1. **`Architecture/api/agg-garage-graph-graphql.md`** (Modify — LARGE 47k+ lines, bounded read §0 Wave Index):
   - **BẮT BUỘC** Read `§0 Wave Index` FIRST → xác định W06 chưa có row → design 2 modules mới.
   - **Add §3f "W06 — PRC (Price Calculation)"** module local — 6 GraphQL operations passthrough cho §5 `gf-accounting-api.md` (search + get + create + recalc + delete + lookup-items-for-cogs). Mỗi op đủ Phase 5 v6 GraphQL COMPLETENESS: Transport/Auth/Idempotency, Downstream table, Request (GraphQL doc + variables example), Response 200 JSON example, Error response shape, Error codes table. Follow `_TEMPLATE-graphql.md`.
   - **Add §3g "W06 — Stock V2 (Reports)"** module local — 3 GraphQL query passthrough cho FEAT-STK-LIST-V2 + FEAT-IP-VIEW-V2 + FEAT-STK-DETAIL-V2. Cùng completeness rule.
   - **Add mọi op mới vào §2 Endpoint Summary** (bảng tổng của file — không chỉ module-local) per Phase 5 v6 rule "tránh file bị stale".
   - **Append §0 Wave Index row** cho W06 per FM-020 cascade rule.
   - Bump version + last_reviewed 2026-07-22 + Change Log row.
   - Naming convention: reference `See Architecture/api/gf-accounting-api.md §6` cho PRC canonical, `See Architecture/api/gf-inventory-api.md §5.2` cho STOCK V2 canonical (BFF `-graphql.md` KHÔNG lặp registry per Phase 5b rule).

2. **`Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md`** (Modify):
   - Add mapping table `UI Action → GraphQL → REST` cho tất cả 8 W06 FEAT:
     - FEAT-PRC-LIST (danh sách lịch sử tính giá)
     - FEAT-PRC-CREATE (tạo/kick-off PRC run + polling → HTTP 202)
     - FEAT-PRC-DETAIL (polling detail 5s + toast + bảng chi tiết mã)
     - FEAT-PRC-RECALC (2 scope ALL/ERROR_ONLY)
     - FEAT-PRC-DELETE (soft-delete)
     - FEAT-STK-LIST-V2 (báo cáo tồn kho theo ngày)
     - FEAT-IP-VIEW-V2 (báo cáo Nhập-Xuất-Tồn)
     - FEAT-STK-DETAIL-V2 (thẻ kho)
   - Bump version + last_reviewed + Change Log row.

3. **`Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md`** (Modify):
   - Scope narrow — chỉ **FEAT-STK-LIST-V2** (mobile scope per WAVE-SEQUENCE.md:579).
   - Add UI Action → GraphQL → REST mapping.
   - Note hub tile "Tồn kho" enabled per BR-INV-MENU-002 (cross-wave FEAT-INV-MOBILE-MENU flag flip — không design UI riêng, chỉ enable existing hub tile per W04 ship).
   - Bump version + last_reviewed + Change Log row.

4. **`Architecture/hld/garage-web-HLD.md`** (Modify — optional callout, Round 1 flagged OQ-round2-fe-hld):
   - Add W06 callout §Modules — PRC screens (5 FEAT) + STOCK V2 screens (3 FEAT).
   - Reuse existing web perf profile (không thêm §Performance & Scale section — reuse existing per Phase 7b optionality).
   - Bump version + last_reviewed + Change Log row.

5. **`Architecture/hld/garage-mobile-HLD.md`** (Modify — optional callout):
   - Add W06 callout narrow-scope — chỉ FEAT-STK-LIST-V2 + hub tile "Tồn kho" enable note.
   - Bump version + last_reviewed + Change Log row.

### Naming Registry — Round 2 rule

- BFF `-graphql.md` **KHÔNG lặp registry** — reference `See {B}-api.md §5/§6` per Phase 5b explicit rule.
- FE + Mobile INTEG file KHÔNG cần registry riêng (reference BE registry).
- Nếu Author phát hiện GraphQL SDL field name drift với `gf-accounting-api.md §6.2 PriceCalcRun` canonical → **T6 fire → STOP**. Đặc biệt watch: `averageUnitPrice` (canonical) vs "đơn giá bình quân/giá bình quân" (VN label — presentation layer maps).

### Completeness gates Round 2

Cuối turn Author phải return Variant B với updated fields:
- `endpoint_completeness.breakdown` include GraphQL module counts (§3f = 6 ops, §3g = 3 ops).
- `naming_registry_present["agg-garage-graph"] = "reference-only per Phase 5b BFF rule"` (không tự tạo — reference BE).
- `performance_section_present["garage-web"]` + `["garage-mobile"]` + `["agg-garage-graph"]` — cập nhật status (existing sections reuse OK, W06 additions minimal, không cần Round 2 P&S section riêng nếu reuse).

---

## Constraints reminders (áp dụng nguyên vẹn)

1. **KHÔNG re-author** Round 1 artifacts (BE + cross-boundary INTEG). Nếu bug/gap trong Round 1 artifact → flag `blocker_questions[]` variant A, KHÔNG tự Modify.
2. **Bounded read** `agg-garage-graph-graphql.md §0 Wave Index` FIRST — file 47k+ lines, KHÔNG whole-file read.
3. **Rule #11 Design repo NO-CODE** — chỉ `Architecture/`, KHÔNG `frontend/`/`mobile/`/`bffs/`.
4. **Rule #9 Versioning 3-in-1** — mọi Modify bump version + last_reviewed 2026-07-22 + Change Log.
5. **Phase 5 v6 GraphQL COMPLETENESS** — mỗi GraphQL op §3f/§3g đủ Request+Response 200+Error shape+Error codes theo `_TEMPLATE-graphql.md`. Skip = P0 G5.
6. **FM-020 cascade** — thêm §3f/§3g phải append §0 Wave Index row cùng edit (không tách commit).
7. **Cross-wave state-matrix** `FEAT-INV-MOBILE-MENU` — Author note trong garage-mobile-HLD.md callout (hub tile flip), KHÔNG design riêng.

## Delivery Authority follow-up (KHÔNG phải việc Author)

Sau khi Round 2 return COMPLETE, Delivery Authority chạy cascade CR duy nhất (bundle cả Round 1 + Round 2):
- PKG-W06 §Boundaries += `gf-accounting`
- Plan/WAVE-SEQUENCE.md §Wave 6 Boundaries += `gf-accounting`
- STATE.json waves_planned[W06].affected_boundaries += `gf-accounting`
- Rồi run `/arch-review W06` full scope.
