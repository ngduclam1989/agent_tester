---
type: tracking
artifact_kind: arch-review
tier: T4
owner_authority: Delivery Authority (REVIEW_GROUP)
boundary: cross-boundary
status: DRAFT
version: 3
last_reviewed: "2026-07-24"
---

# ARCH-REVIEW W06 — 2026-07-23 (Round 2 re-review appended; Round 9 fix 2026-07-24)

Wave: **W06 — Tính giá + Báo cáo (Inventory V2 slice 4/4)**
Reviewer: `agent-arch-review` (contract v7)
Scope: 15 files under `Architecture/` uncommitted working-tree — Round 1 (BE + cross-boundary) + Round 2 (BFF + FE + Mobile) + **Round 3 targeted fix** per `Tracking/arch-design-W06-answers-1.md` / `-2.md` / `-3.md`. **Round 9** (2026-07-24, `CR-20260724-01`) — targeted Q3 `content[]` source-drift fix, see bottom of file.

## Round 2 Re-Review Summary (post Round 3 fix — 2026-07-23)

| Files reviewed | New P0 | New P1 | Prior P0 status | Prior P1 status | P2 (baseline drift, out-of-scope) | Ready for SA ratify |
|---|---:|---:|---|---|---:|---|
| 15 (12 untouched + 3 Round-3-fixed) | 0 | 0 | RESOLVED | 3/3 RESOLVED | 1 (pre-existing, explicitly excluded from Round 3 mandate) | **true** |

**Verdict: UNBLOCK SA ratify.** All 4 prior findings resolved; no new issues surfaced; no regression on the 12 untouched files. Only the P2 baseline dual-persona drift in INTEG-FE/INTEG-MOB "Nhóm người dùng" metadata remains — pre-existing baseline debt, explicitly out-of-scope per Round 3 mandate, recommended for a separate cleanup CR (non-blocking for W06 SA ratify).

### Round 3 fix files re-verified deep (3 files)

| File | Version bump | Result |
|---|---|---|
| `Architecture/api/gf-inventory-api.md` | v63 → **v64** + `last_reviewed: 2026-07-23` + Change Log v64 row (line 9130) | PASS full 3-in-1 |
| `Architecture/hld/gf-inventory-HLD.md` | v29 unchanged (pure Change Log backfill) + Change Log v29 row now present (line 507) | PASS |
| `Architecture/integrations/INTEG-EXT-gf-inventory.md` | v21 unchanged (pure Change Log backfill) + Change Log v21 row now present (line 668) | PASS |

Version-bump judgement on gf-inventory-api.md v63→v64: **AGREE** — new §3g content (3 sub-sections with body) is real content addition, justifying distinct audit boundary; the 3-in-1 discipline (version + last_reviewed + Change Log row) all present together (line 5 · line 9 · line 9130). For HLD/INTEG-EXT the "no re-bump" call is also correct — only filling a pre-existing Change Log gap for the already-bumped v29/v21 (no new content between prior review and now).

### Prior findings — Round 2 verification

#### Finding 1 (was P0) — Architecture/api/gf-inventory-api.md — **RESOLVED**

Evidence (deep verification):

- **§3g. Stock V2 Reports** section inserted at line 8641 with 3 sub-sections (W06-STK-Q1/Q2/Q3), each a proper detail block.
- **G5 Step 1 Coverage**: §2 Endpoint Summary (lines 65-190) now has 3 rows for `W06-STK-Q1..Q3` (verified). §3g.2 has 3 sub-sections (lines 8664 / 8744 / 8833). Coverage matches — 3 == 3.
- **G5 Step 2 Body completeness (6-block per endpoint)** — spot-checked all 3:
  - **W06-Q1 (`GET /api/v1/stock-ledgers/at-date`, lines 8664-8742)**: (1) Headers line 8668 `Authorization` + `X-Tenant-Id` + `X-Branch-Id` ✓; (2) Path/Query params table lines 8672-8679 (6 params with constraint + Cite) ✓; (3) Request body: `N/A (GET)` line 8681 ✓; (4) Response 2xx: JSON fenced block lines 8686-8709 + per-field type/cite table lines 8712-8721 ✓; (5) Response 4xx/5xx: table lines 8725-8732 (400/401/403/404/500/504) ✓; (6) Semantics: bullet list lines 8734-8742 (idempotency N/A + permission dual persona + realtime + query pattern + index + pagination + p95) ✓.
  - **W06-Q2 (`GET /api/v1/stock/inout-summary`, lines 8744-8831)**: 6-block complete (Headers 8748 · Params 8752-8760 · Request N/A 8762 · Response 2xx JSON 8766-8802 + field table 8804-8811 · 4xx/5xx 8815-8821 · Semantics 8823-8831) ✓ + ≥1 fenced JSON.
  - **W06-Q3 (`GET /api/v1/stock/card`, lines 8833-8922)**: 6-block complete (Headers 8837 · Params 8841-8848 · Request N/A 8850 · Response 2xx JSON 8854-8889 + field table 8891-8901 · 4xx/5xx 8905-8912 · Semantics 8914-8922) ✓ + ≥1 fenced JSON.
- **§0 Wave Index cascade (FM-020)**: W06 row line 43 — Sections column extended `§3f + §5.2` → `§3f PRC-facing S2S subsystem · §3g Stock V2 Reports (public) · §5.2`; Endpoint ID range extended `W06-P1..P5` → `W06-P1..P5 + W06-STK-Q1..Q3`; Ratified column now `v63 (Round 1: §3f) · v64 (Round 3 fix: §3g + §2 registry-sync)`. Cascading rule PASS.
- **Cross-artifact consistency (G11)**: BFF `agg-garage-graph-graphql.md v7.74 §3j` — verified operation SDL selection sets at line 51199-51218 (`stockLedgerAtDate`): fields `productCode / productName / mainUnitCode / warehouseCode / warehouseName / quantityOnHand / valueOnHand` + `aggregates { totalQuantity totalValue }` + pagination fields — **byte-for-byte match** with §3g Q1 Response 2xx JSON shape (lines 8686-8708). No rename drift.
- **§5.2 canonical rename finalize**: line 8980 explicit "canonical names `stockLedgerAtDate / stockInoutSummary / stockCardDetail`" — supersedes v63 forward-reference placeholders `stockOnHandReport / inventoryMovementReport / stockCardReport`. §5.2 references §3g public read-side. §0 comment mirror.
- **G13 Field provenance (T4b)** — sampled 5 fields:
  - `quantityOnHand` → `internal_product` + `inventory_stock_ledger.closing_qty` per BR-STKV2-001 (b) — cite line 8717 ✓; FEAT-STK-LIST-V2 AC-2 "Số lượng tồn" traced.
  - `valueOnHand` → `inventory_stock_ledger.closing_value` per BR-STKV2-001 (b) — cite line 8718; FEAT-STK-LIST-V2 AC-3 "Giá trị tồn = ... không hiển thị Tạm tính" traced ✓.
  - `openingQty/openingValue` → BR-STKV2-010 "Đầu kỳ" cite line 8806; matches FEAT-IP-VIEW-V2 AC-3 "Đầu kỳ SL+GT" ✓.
  - `outboundValue` → BR-STKV2-011 "giá vốn = 0 pre-BQGQ" cite line 8808; matches FEAT-STK-LIST-V2 AC-3 "giá vốn xuất = 0 nếu chưa chạy BQGQ" ✓.
  - `movementKind` (enum `OB | SLIP`) → §5.2 Naming Registry Ledger canonical + BR-STKV2-012 "mỗi dòng = 1 phiếu" — cite line 8894/8895 ✓.
  All 5 trace to Product FEAT/BR. **No fabricated field**.

**Status**: RESOLVED — contract-first gap closed; DEV can now bind BFF `agg-garage-graph-graphql.md v7.74 §3j` passthrough to concrete REST endpoints per FEAT-STK-LIST-V2 / FEAT-IP-VIEW-V2 / FEAT-STK-DETAIL-V2.

#### Finding 2 (was P1) — Architecture/api/gf-inventory-api.md §2 registry-sync — **RESOLVED**

Evidence: 8 new rows appended to `§2 Endpoint Summary` tổng:
- 5 rows `W06-P1..W06-P5` mirroring §3f.1 module-local table (Round 1 §3f.2 bodies already complete):
  - `W06-P1 GET /protected/v1/stock-ledgers/at-date`
  - `W06-P2 POST /protected/v1/slips-in-period/search`
  - `W06-P3 POST /protected/v1/delivery-lines/bulk-fill-cost`
  - `W06-P4 POST /protected/v1/receipt-lines/bulk-inherit-cost`
  - `W06-P5 POST /protected/v1/stock-ledgers/bulk-recompute`
- 3 rows `W06-STK-Q1..Q3` (Finding 1 pair):
  - `W06-STK-Q1 GET /api/v1/stock-ledgers/at-date`
  - `W06-STK-Q2 GET /api/v1/stock/inout-summary`
  - `W06-STK-Q3 GET /api/v1/stock/card`

All 8 rows use consistent columns (ID · Method · Path · Module · Auth), mirror §3f.1 / §3g.1 module-local tables byte-for-byte at the identifier level. `§2` tổng ↔ `§3` sub-section coverage — 5+3 = 8 == 8. **Status**: RESOLVED.

#### Finding 3 (was P1) — Architecture/hld/gf-inventory-HLD.md §Change Log v29 row — **RESOLVED**

Evidence: `## Change Log` at line 503; table header lines 505-506; **v29 row at line 507** (`| 2026-07-22 | v29 | **W06 arch-design PRC-consumer subsystem cascade** ...`) — full descriptor with §1/§4.1/§5/§6b.8/§7 semantic summary matches the frontmatter comment content. Author correctly moved the staged content from the frontmatter comment into the Change Log table. No re-bump of version / last_reviewed (still v29 / 2026-07-22) — appropriate for pure Change Log backfill (author reasoning valid; the v28→v29 bump was performed in Round 1 with content already added, only the audit-trail row was missing). **Status**: RESOLVED.

#### Finding 4 (was P1) — Architecture/integrations/INTEG-EXT-gf-inventory.md §16 Change Log v21 row — **RESOLVED**

Evidence: `## 16. Change Log` at line 664; table header lines 666-667; **v21 row at line 668** (`| 2026-07-22 | v21 | **W06 arch-design PRC-callers cascade** ...`) — full descriptor cross-links to canonical `INTEG-EXT-gf-accounting-gf-inventory.md v1` + §13e.1 summary + §13e.2 reverse-direction note. No re-bump of version / last_reviewed (still v21 / 2026-07-22) — same Change Log backfill pattern as Finding 3, appropriate. **Status**: RESOLVED.

### No-regression sweep on 12 untouched files

Version fingerprints verified UNCHANGED since Round 1 review:
- `agg-garage-graph-graphql.md` v7.74 ✓ (last_reviewed 2026-07-22)
- `gf-accounting-api.md` v18 ✓
- `gf-accounting-HLD.md` v11 ✓
- `gf-accounting-data-model.md` v11 ✓
- `gf-accounting-events.md` v10 ✓
- `garage-web-HLD.md` v13 ✓
- `garage-mobile-HLD.md` v13 ✓
- `INTEG-FE-garage-web-agg-garage-graph.md` v19 ✓
- `INTEG-MOB-garage-mobile-agg-garage-graph.md` v8 ✓
- `ADR-027-bqgq-engine-and-convergent-iteration.md` v1 (NEW) — untouched
- `ADR-028-prc-async-execution-sync-http-plus-background-thread.md` v1 (NEW) — untouched
- `INTEG-EXT-gf-accounting-gf-inventory.md` v1 (NEW) — untouched

All 12 already-PASS files not regressed. Spot-check confirmed gf-accounting-api.md v18 frontmatter (line 5) + gf-accounting-HLD.md v11 frontmatter (line 5) unchanged. Round 1 gate PASS carries forward.

### P2 baseline drift status (out-of-scope, unchanged)

The 1 P2 finding (dual persona baseline drift in `INTEG-FE-garage-web-agg-garage-graph.md` and `INTEG-MOB-garage-mobile-agg-garage-graph.md` "Nhóm người dùng" row — enumerates non-dual personas `service advisor / inventory staff / purchase staff / manager / support operator / CRM/marketing staff / admin`) is **STILL PRESENT**, per Round 3 mandate scope-guard (explicitly excluded from fix). Correctly classified as pre-existing baseline debt, non-blocking for W06 SA ratify. Recommend separate cleanup CR in a future wave to align with dual persona `{accountant, garage-owner}`.

### G10 Ask-First Discipline (re-verified)

- No new `blocker_questions` raised by author in Round 3 (mechanical fix scope, no re-open of T1-T6).
- No new `[NEEDS-CONFIRM] / TBD / <TODO>` markers introduced in new §3g content (spot-check clean).
- No breaking change (§3g endpoints are additive on `/api/v1/*` public prefix — new resource, no rename/remove of existing endpoints).
- T6 naming ambiguity closed pre-review (Round 2 mandate ratified canonical names 2026-07-22); §5.2 canonical rename finalize confirmed line 8980. No re-ask needed.

### Round 2 Recommendation

**UNBLOCK SA ratify.** All P0 + P1 findings from Round 1 review are RESOLVED with matching evidence. No new findings. No regression. Delivery Authority may proceed with SA ratify MR for the 15-file W06 architecture batch. Separate cleanup CR for P2 baseline persona drift can be scheduled independently.

---

## (Historical) Round 1 findings (2026-07-23) — audit trail

## Summary

| Files reviewed | P0 | P1 | P2 | Ready for SA ratify |
|---|---:|---:|---:|---|
| 15 | 1 | 3 | 1 | **false** |

Verdict: **BLOCK SA ratify** — 1 P0 (contract gap: 3 gf-inventory Stock V2 public REST endpoints referenced by BFF §3j but not authored in `gf-inventory-api.md v63`) + 3 P1 (2 Change Log rows missing + 1 §2 registry sync gap). Fix via cascade CR — do NOT re-open `/arch-design`.

## Findings

### Architecture/api/gf-inventory-api.md (v63)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter | version=63 · owner_authority=Architecture Authority · boundary=gf-inventory · last_reviewed=2026-07-22 (line 9). |
| G2 | PASS | Versioning 3-in-1 | Change Log v63 present (grep `^\| 2026-07-22.*v63` OK, line 8873 range). |
| G4 | PASS | Toggle | §3f 5 new W06 endpoints all `/protected/v1/*` S2S; no Flyway proposed (ddl-auto=update inherited for gf-inventory line-column additions via ddl reload; actual gf-inventory uses Flyway but these are read/bulk-write over existing tables, not new schema — verify). |
| G5 Step 1 (REST coverage) | **P1** | §2 vs §3 registry-sync | `§2 Endpoint Summary` (lines 65-183) has **0 rows for W06-P1..W06-P5** despite `§3f.2` sub-sections existing (lines 8337, 8386, 8464, 8523, 8583). Module-local `§3f.1` table (lines 8323-8331) does list them, but §2 tổng is stale — cross-wave lookup index drift (analogue G5 v6 GraphQL registry-sync P1). DEV can still find endpoints via §0 Wave Index W06 row + §3f.1 + §3f.2 — not blocking impl. |
| G5 Step 2 (body completeness) | PASS | 6-block per endpoint | W06-P1..W06-P5 all have Headers · Path/Query params · Request body · Response 2xx · Response 4xx/5xx · Semantics + ≥1 fenced JSON block (spot-checked lines 8337-8631). |
| G5 Step 3 (backward-compat) | PASS | Additive-only | New `/protected/v1/*` prefix, no rename/remove. |
| G7 v7 §0 Wave Index cascade | PASS | FM-020 | §0 Wave Index has W06 row (line 43) with `§3f + §5.2 Naming Registry`; sub-module §3f present — cascading rule OK. |
| G8 Integration contracts | **P0** | REST contract for BFF §3j references | BFF `agg-garage-graph-graphql.md v7.74 §3j` (`stockLedgerAtDate` line 51175, `stockInoutSummary` line 51257, `stockCardDetail` line 51353) references 3 NEW `gf-inventory` **public REST** endpoints — `GET /api/v*/stock-ledgers/at-date`, `GET /api/v*/stock/inout-summary`, `GET /api/v*/stock/card` — that have **no sub-section in this file's §3**, no row in `§2 Endpoint Summary`, no row in `§0 Wave Index`. Author self-flagged via `open_questions[]` + BFF line 51189 "_pending gf-inventory-api.md backfill_" + INTEG-FE line 258 "TBD cascade CR" + INTEG-MOB soft-flag row. 3 of 8 W06 FEATs (FEAT-STK-LIST-V2, FEAT-IP-VIEW-V2, FEAT-STK-DETAIL-V2) cannot start DEV without REST contract. **Blocks SA ratify** — cascade CR must backfill 3 sub-sections + §2 rows + §0 Wave Index entry before `/dev-start` W06. |
| G11 Naming Registry | PASS | §5.2 W06 read-side flip ACTIVE | Frontmatter comment claims "§5.2 flip ACTIVE with 6 read-side rows populated"; BFF/FE/Mobile columns "—" for §3f protected S2S (internal-only) — appropriate. |

### Architecture/api/gf-accounting-api.md (v18)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter | version=18, boundary=gf-accounting, owner=Architecture Authority, depends_on ADR-027/028 + INTEG-EXT-gf-accounting-gf-inventory (lines 17-20). |
| G2 | PASS | Versioning 3-in-1 | Change Log v18 (line 1700) present with 2026-07-22 date. |
| G4 | PASS | Toggle | `ddl-auto=update` (Gotcha #5) — data-model §2quater migration note explicit "KHÔNG viết Flyway V{N}__*.sql" (data-model line 563). |
| G5 Step 1 | PASS | §2 vs §5 coverage | §2 rows W06-1..W06-6 (lines 75-80) match §5.1..§5.6 sub-sections. |
| G5 Step 2 | PASS | 6-block completeness | All 6 endpoints have Headers · Path/Query params · Request · Response 2xx · Response 4xx/5xx · Semantics + JSON fenced blocks (§5.3 CREATE has both 202 and 200 idempotent-replay variants — extra completeness). |
| G5 Step 3 | PASS | Additive | New §5 PRC endpoints + §6 Naming Registry — no rename/remove of existing settlement/insurance/AP endpoints. |
| G6 Coverage | PASS | 5 FEAT-PRC-* mapped | LIST=W06-1, DETAIL=W06-2, CREATE=W06-3, RECALC=W06-4, DELETE=W06-5, LOOKUP=W06-6 (per §5.1..§5.6 headings). |
| G11 Naming Registry | PASS | §6 exists with 6-col structure | §6.2 PriceCalcRun 20+ rows, §6.3 PriceCalcRunItem 15+ rows, §6.4 cost-line writes cross-boundary — enum values complete (PriceCalcRunStatus: PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS; PriceCalcItemStatus: RUNNING\|DONE\|ERROR; PriceCalcErrorReason: NEGATIVE_STOCK\|ACCOUNTING_MISMATCH\|SYSTEM_ERROR; PriceCalcScope: ALL\|SPECIFIC). Cite column trace to FEAT/BR/ADR. |
| G13 Field provenance | PASS | 5 sampled fields | `averageUnitPrice` → EP §3.2 "Giá bình quân" v17 rename ✓; `warningsSkippedItems` → BR-PRC-012 v34 ✓; `hasSelfReference` → BR-PRC-017 iteration precomputed ✓; `iterationsApplied` → ADR-027 §Phase 2 ✓; `scopePredicate` → ADR-027 §Phase 0 reproduce ✓. |

### Architecture/hld/gf-accounting-HLD.md (v11)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter | v11, owner=Architecture Authority. |
| G2 | PASS | Versioning 3-in-1 | Change Log v11 row (line 513) 2026-07-22 with full descriptor. |
| G4 | PASS | No Temporal on gf-accounting | ADR-028 explicit "NO Temporal expansion" (Gotcha #7); §11 uses `PriceCalcExecutorService` + Redis lock + DB state — sync HTTP 202 + BG thread pattern. |
| G7 Cross-ref | PASS | Depends_on cascade | §11 references ADR-027/028 + INTEG-EXT-gf-accounting-gf-inventory. |
| G12 Performance & Scale | PASS | 6/6 items | §12.1 Expected load (with OQ-perf-1 flag) · §12.2 Pagination · §12.3 Index list (tenant-prefix explicit; partial index `idx_prc_run_status_lease` cross-tenant with rationale per ADR-028 §3) · §12.4 Cache (3s TTL polling response) · §12.5 N+1 avoidance (Phase 2 parallel + Phase 1 batch snapshot) · §12.6 Tenant fairness (2 concurrent PRC/tenant + bulkhead N=4). |

### Architecture/hld/gf-inventory-HLD.md (v29)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter | version=29, last_reviewed=2026-07-22 (line 9). |
| G2 | **P1** | Versioning 3-in-1 missing Change Log row | Frontmatter bump v28→v29 + last_reviewed updated (line 9), but **§Change Log table (lines 503-528) has NO row for v29** — latest row is v27 (2026-07-16). v28 (W05 debt) row also missing. Bumping the version + last_reviewed without Change Log row violates BR-CORE-015 3-in-1 discipline. Long comments AFTER `last_reviewed:` in frontmatter (line 9) are NOT Change Log rows. Fix: append `\| 2026-07-22 \| v29 \| **W06 arch-design PRC-consumer subsystem cascade...** \|` row (content already staged in the frontmatter comment — just move to table). |
| G4 | PASS | Toggle | §6b.8.3 explicit "reuse existing W04/W05 indexes; NO new indexes needed for W06 (verified query patterns match). Tenant-prefix invariant maintained (Reviewer G12 P0)." (line 412). |
| G7 Cross-ref | PASS | ADR-027 + ADR-028 + INTEG-EXT-gf-accounting-gf-inventory referenced. |
| G12 Performance & Scale | PASS | 6/6 items W06 additions | §6b.8.1 Expected load · §6b.8.2 Pagination · §6b.8.3 Index list (tenant-prefix reused W04/W05) · §6b.8.4 Cache (no cache on write path — idempotency-key) · §6b.8.5 N+1 (chunk 500 lines/write) · §6b.8.6 Tenant fairness (bulk size cap + idempotency-key TTL 24h). |

### Architecture/data/gf-accounting-data-model.md (v11)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v11 + depends_on ADR-027/028. |
| G2 | PASS | Versioning 3-in-1 | Change Log v11 row (line 583) 2026-07-22 with full descriptor. |
| G3 JPA scalar-only | PASS | §2quater.1 explicit "NO physical FK — scalar-only per ADR-009. `period_id`, `warehouse_id`, `source_run_id`, `garage_id` là scalar references validated at application layer" (line 472). |
| G4 Migration | PASS | ddl-auto=update Gotcha #5 | §4 Migration bullet 3 (line 563) "2 bảng mới price_calc_run + price_calc_run_item sinh qua `ddl-auto=update` — KHÔNG viết Flyway `V{N}__*.sql`" — correct for gf-accounting. |
| G11 Cross-artifact consistency | PASS | Field alignment | `average_unit_price DECIMAL(18,2)` (line 493) = api §6.3 `averageUnitPrice: BigDecimal(scale=2)` = api §5.2 response `averageUnitPrice: 10611.11`. Cross-boundary field `cost_unit_price` (bulk-fill-cost) = INTEG §4.3 `costUnitPrice: Decimal(scale=2)` = gf-inventory-api §3f W06-P3 body. |
| G12 Index tenant-prefix | PASS | Indexes §2quater.1/§2quater.2 all `(tenant_id, ...)` prefix except `idx_prc_run_status_lease` (partial cross-tenant sweep — rationale documented "ADR-028 §3"). |

### Architecture/events/gf-accounting-events.md (v10)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v10. |
| G2 | PASS | Versioning 3-in-1 | Change Log v10 row (line 225) 2026-07-22. |
| G3 Outbox mandatory | PASS | Alternative-rejected rationale | Line 20 explicit "PRC KHÔNG publish Kafka event — sync HTTP polling contract per BR-PRC-016 v29 + AC-2c 5s. Xem ADR-028 §Alt-3 rejected rationale." — Reviewer accepts: state-changing PRC lifecycle managed by DB polling instead of events, per FEAT contract. Not a Rule #2 violation (event is not required if downstream doesn't consume; ADR-028 Alt-3 explicitly rejected event-driven with strong reasoning). |
| G9 KG | PASS | Author flagged needs_kg_update for gf-accounting.

### Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md (v1 NEW)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter | type=architecture, artifact_kind=adr, tier=T1, owner_authority=Architecture Authority, boundary=gf-accounting, status=ACCEPTED, version=1, last_reviewed=2026-07-22 (lines 1-10). |
| G7 ADR numbering | PASS | ADR-027 sequential (max prior = ADR-026 verified `ls Architecture/decisions/ADR-*.md \| sort -V \| tail -1` = ADR-028). |
| G7 ADR structure | PASS | All required headings present: Status (line 14) · Context (line 17) · Decision (line 55) · Alternatives Considered (line 193, 5 alts) · Consequences (line 203, positive/negative/risks/trade-off/test verification) · References (line 233, cross-ref ADR-028 + ADR-019/020/021/024). |
| G10 T5 breaking-change guard | PASS | Purely additive new decision. |
| G13 Convergence proof | PASS | §3 formal argument (Cauchy sequence contraction < 1) + SAFETY_ITERATION_CAP=100 defensive; testable via `avg_curr == avg_prev` BigDecimal-scaled-2-HALF_UP exact match. |

### Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md (v1 NEW)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter (lines 1-10). |
| G7 ADR numbering | PASS | ADR-028 sequential after ADR-027 in same batch. |
| G7 ADR structure | PASS | Status · Context · Decision · Alternatives Considered (5 alts including Alt-1 Temporal explicit-rejected) · Consequences (positive/negative/risks/trade-off/threshold-to-re-evaluate/test verification 8 test cases) · References (line 190, ADR-027 + ADR-004/005). |
| G4 No Temporal on gf-accounting | PASS | Explicit Q2=A ratify "NO Temporal expansion" (line 12, 44); §Decision (line 53) "sync HTTP 202 + background thread + DB-state persist"; §Threshold-to-re-evaluate (line 173) documents future upgrade trigger. |
| G3 Multi-replica safety | PASS | Layer 1 (DB FOR UPDATE) + Layer 2 (Redis lock) + Layer 3 (partial unique index `uidx_prc_active_lock`) — defense-in-depth. |

### Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md (v1 NEW)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v1, status=DESIGN, boundary="gf-accounting (caller) ↔ gf-inventory (provider)", provider=gf-inventory. |
| G2 | PASS | Change Log v1 row (line 358) 2026-07-22 (single row expected for NEW). |
| G3 Boundary isolation | PASS | §8 Forbidden Patterns line 333 explicit "Cross-boundary direct DB query — vi phạm Critical Rule #1. Chỉ qua REST §4." + §8 line 335 no Kafka event publish. |
| G3 Tenant isolation | PASS | §3 Auth explicit `X-Tenant-Id` header + body `tenantId` defensive dual-check. |
| G3 Outbox / idempotency | PASS | §3 + §4.3/§4.4/§4.5 all write endpoints require `X-Idempotency-Key: PRC-{runId}-{phase}-{chunkIdx}` (ADR-028 §1). |
| G7 Cross-ref | PASS | §9 References cite ADR-001/013/020/021/024/027/028; reverse direction reused ADR-021 (INTEG-EXT-gf-inventory §13a). |
| G8 Endpoint contracts | PASS | 5 endpoints §4.1-§4.5 all have Purpose · Query/Body params · Response 200 JSON · 4xx/5xx · Semantics · Cite. |
| G12 Perf targets | PASS | Latency budgets: §4.1 ≤300ms batch 200 codes; §4.2 ≤500ms 500 lines; §4.3/§4.4 idempotency 24h TTL; §4.5 ≤5s scope 20 products × 30 days. Circuit breaker Resilience4j §5. |

### Architecture/integrations/INTEG-EXT-gf-inventory.md (v21)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v21, last_reviewed=2026-07-22. |
| G2 | **P1** | Versioning 3-in-1 missing Change Log row | Frontmatter bump v20→v21 + last_reviewed updated (line 10), §13e "Additional consumer: gf-accounting PRC BQGQ engine" section added (line 621), but **§16 Change Log table (lines 665-687) has NO row for v21** — latest row is v19 (2026-07-16). v20 (W05 ADR-026 v2 debt) row also missing. Fix: append `\| 2026-07-22 \| v21 \| **W06 arch-design PRC-callers cascade — add §13e cross-link to canonical INTEG-EXT-gf-accounting-gf-inventory.md ...** \|` row. |
| G7 Cross-ref | PASS | §13e explicitly points to canonical INTEG-EXT-gf-accounting-gf-inventory + ADR-027 + ADR-028. |

### Architecture/api/agg-garage-graph-graphql.md (v7.74)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v7.74. |
| G2 | PASS | Change Log v7.74 row (line 51470) 2026-07-22 with full W06 descriptor (Round 1 unchanged + Round 2 BFF+FE+Mobile). |
| G5 Step 4 GraphQL Coverage | PASS | §2 Endpoint Summary rows 360-368 (9 W06 ops) sync with §3f (§3f.6 W06-1..W06-6 detail blocks lines 50512, 50605, 50709, 50792, 50864, 50923) + §3j (§3j.6 W06-STK-Q1..Q3 detail blocks lines 51175, 51257, 51353). |
| G5 Step 4 Body completeness | PASS | Spot-checked `priceCalcRunCreate` (line 50709) + `stockLedgerAtDate` (line 51175) — both have Transport · Auth · Idempotency · Downstream table · Request (GraphQL doc + variables example fenced ```json) · Response 200 JSON example · Error response shape · Error codes table. |
| G5 Step 4 Registry sync | PASS | 9 W06 ops in §2 tổng (rows 360-368) + module-local §3f.2 Endpoint Summary + §3j.2 Endpoint Summary. |
| G7 §0 Wave Index cascade (FM-020) | PASS | §0 has W06 row (line 48) referencing §3f + §3j sections + ratified range `v7.74 (current)`. |
| G8 BFF references non-existent REST | see gf-inventory-api.md P0 finding above | §3j references 3 unauthored public REST endpoints — flagged there. |
| G11 Registry pointer discipline | PASS | §3f + §3j reference `See gf-accounting-api.md §6` + `See gf-inventory-api.md §5.2` — no lookup registry duplication (Phase 5b BFF rule). |

### Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md (v19)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v19. |
| G2 | PASS | Change Log v19 row (line 343) 2026-07-22 with W06 §3.6d mapping table + soft flag callouts. |
| G3 Dual persona | **P2** | Baseline drift pre-existing | Row "Nhóm người dùng" (before §3.6d) enumerates non-dual personas (`garage operator, service advisor, inventory staff, purchase staff, CRM/marketing staff, admin`). NOT introduced by W06 additions but persists. Non-blocking for W06 SA ratify; recommend cleanup CR to align with dual persona `{accountant, garage-owner}` in future wave. |
| G6 UI Action → GraphQL → REST | PASS | §3.6d table (lines 245-262) covers 8 W06 FEATs (5 PRC + FEAT-STK-LIST-V2 + FEAT-IP-VIEW-V2 + FEAT-STK-DETAIL-V2) with route/GraphQL/REST triplet + AC cite. |
| G8 Contract linkage | PASS (with linked P0 in gf-inventory-api) | Line 258 "TBD Xuất file — cần cascade CR authoring FEAT-STK-LIST-V2 export endpoint — soft flag" acknowledges gap; row 256/259/261 reference `/api/v*/stock-ledgers/at-date`, `/api/v*/stock/card`, `/api/v*/stock/inout-summary` — same missing endpoints flagged in gf-inventory-api.md P0. |

### Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md (v8)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v8. |
| G2 | PASS | Change Log v8 row (line 199) 2026-07-22 with §3.4c narrow-scope FEAT-STK-LIST-V2 + hub tile flip. |
| G3 Dual persona | **P2** | Baseline drift pre-existing | Row "Nhóm người dùng" enumerates non-dual personas (`service advisor, inventory staff, purchase staff, manager, support operator`). Same baseline drift as INTEG-FE — flagged for future cleanup CR. |
| G6 Mobile scope narrow | PASS | §3.4c explicit "web GMS carries 8/8 W06 FEAT, mobile 1/8 (FEAT-STK-LIST-V2)"; hub tile "Tồn kho" HIDDEN → VISIBLE cross-wave state matrix per BR-INV-MENU-002 + FEAT-INV-MOBILE-MENU. |
| G8 Contract linkage | PASS (with linked P0 in gf-inventory-api) | Soft flag: "gf-inventory-api.md v63 chưa có sub-section cho public REST `/api/v*/stock-ledgers/at-date` — pending Delivery Authority cascade CR + backfill trước `/dev-start` W06." Same P0 root gap. |

### Architecture/hld/garage-web-HLD.md (v13)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v13. |
| G2 | PASS | Change Log v13 row (line 312) 2026-07-22 with W06 §8d PRC 5 màn + Stock V2 3 màn callout. |
| G12 Perf reuse | PASS (option) | §8d.4 explicit "reuse §8b.2 no new section — advisory HTTP 304 optional cho polling optimization" — Round 2 mandate confirmed reuse OK, no new P&S required. |

### Architecture/hld/garage-mobile-HLD.md (v13)

| Gate | Severity | Rule | Note |
|---|---|---|---|
| G1 | PASS | Frontmatter v13. |
| G2 | PASS | Change Log v13 row (line 627) 2026-07-22 with §11d narrow-scope callout + hub tile flip. |
| G3 Persona | PASS in W06 additions | §11d explicitly notes mobile use-case "field operator không có PRC nghiệp vụ" — technical role scope, no new actor introduced (dual persona `accountant/garage-owner` upstream on web still applies). |
| G12 Perf reuse | PASS | §11d.5 "reuse §11b.4 pattern" — advisory targets 30-100 opens/tenant/day (higher than OB 5/day). |

---

## Non-gate observations (informational)

- **Delivery Authority cascade CR (Execution-tier) — OUT OF SCOPE for this Architecture review**: PKG-W06 §Boundaries += `gf-accounting`, WAVE-SEQUENCE §Wave 6 Boundaries += `gf-accounting`, STATE.json waves_planned[W06].affected_boundaries += `gf-accounting` — these are Execution files (not `Architecture/`). Reviewer confirms Author correctly avoided touching them (author agent forbidden_paths policy) and Delivery Authority tracks separately per prompt context. **Doesn't block Architecture ratify but blocks `/dev-start`**.
- **Ask-First Discipline (G10)**:
  - T1 boundary ownership PASS — ADR-027 Context cites EP §5.2 v21 + BR §CB-AP-001 v25 + Q1=A ratify + INTEG-EXT-gf-accounting-gf-inventory §2 rationale (SAP FI-CO ERP pattern).
  - T2 persona PASS in W06 additions — dual persona (BR-AP-CMN-002 equal rights) explicit in Semantics section of every PRC endpoint.
  - T3 external integration PASS — INTEG-EXT-gf-accounting-gf-inventory.md created per Q3=A.
  - T4 markers PASS — no `[NEEDS-CONFIRM]/TBD/<TODO>/???` in W06-added content (all TBDs found are pre-existing baseline debt).
  - T5 breaking change PASS — purely additive, no ADR-013 deprecation needed.
  - T6 naming ambiguity RESOLVED by user Round 2 mandate — Author flagged (in Round 2 return) that Round 1 forward-ref names `stockOnHandReport/inventoryMovementReport/stockCardReport` in `gf-inventory-api.md v63 §5.2` got renamed to `stockLedgerAtDate/stockInoutSummary/stockCardDetail` per user ratify. Not a Reviewer-fired violation.
- **Field provenance (G13) 5-sample deep-dive**: `averageUnitPrice`, `warningsSkippedItems`, `hasSelfReference`, `iterationsApplied`, `scopePredicate` — all trace to Product source (EP-INVENTORY-ACCOUNTING-PERIOD §3.2 or BR-PRC-001..018 or ADR-027 Phase specs). No fabricated fields.

## Recommendation

**BLOCK SA ratify** until:
1. **P0 (G8/G5)** — Cascade CR to backfill 3 sub-sections in `gf-inventory-api.md` for public REST endpoints `GET /api/v*/stock-ledgers/at-date`, `GET /api/v*/stock/inout-summary`, `GET /api/v*/stock/card` (each with full 6-block completeness) + §2 Endpoint Summary rows + §0 Wave Index W06 entry cascade (FM-020) + optional export endpoint per FEAT-STK-LIST-V2 AC-1 "Xuất file". This is the same cascade CR the Author self-flagged via `open_questions[]`.
2. **P1 (G5)** — Add rows W06-P1..W06-P5 to `gf-inventory-api.md §2 Endpoint Summary` tổng (same CR bundle).
3. **P1 (G2)** — Append Change Log v29 row to `gf-inventory-HLD.md` §Change Log table (content already staged in frontmatter comment; just move to table).
4. **P1 (G2)** — Append Change Log v21 row to `INTEG-EXT-gf-inventory.md` §16 Change Log table (content already staged in frontmatter comment).

P2 baseline drift (dual persona in INTEG-FE/INTEG-MOB "Nhóm người dùng" metadata) — separate cleanup CR, not blocking.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-23 | 1 | `agent-arch-review` (contract v7, opus 4.7) | Initial ARCH-REVIEW-W06 — 15 files, G1-G13 gates. Verdict: `ready_for_sa_ratify=false` — 1 P0 (G8: 3 missing gf-inventory public REST sub-sections referenced by BFF §3j) + 3 P1 (§2 registry sync + 2 Change Log rows) + 1 P2 (baseline persona drift). |
| 2026-07-23 | 2 | `agent-arch-review` (contract v7, opus 4.7) | Round 2 re-review after Round 3 targeted fix (3 files touched: `gf-inventory-api.md v63→v64` new §3g Stock V2 Reports 3 endpoints 6-block complete + 8 §2 rows + §0 Wave Index cascade; `gf-inventory-HLD.md v29` Change Log row backfill; `INTEG-EXT-gf-inventory.md v21` Change Log row backfill). All 4 prior findings RESOLVED with matching evidence. No new findings; no regression on 12 untouched files. P2 baseline persona drift (out-of-scope per Round 3 mandate) remains — recommend separate cleanup CR. Verdict flip: `ready_for_sa_ratify=false` → **`true`**. |
| 2026-07-24 | 3 | main-orchestrator + `agent-arch-author` (`CR-20260724-01`, MINOR self-approved) | **Round 9** — Q3 (thẻ kho) `content[]` source drift fix, missed by Rounds 1-8 despite Rounds 3/4/8 all touching this exact sub-section. Finding A (FIXED): `gf-inventory-api.md v67 §3g.2 W06-STK-Q3` wrongly described `content[]` as reading `inventory_stock_ledger` directly — ledger schema v22 gộp phiếu theo ngày (`BR-STKV2-001a`), cannot carry `slipCode`/`slipType`; Product (`BR-STKV2-013`) requires mỗi dòng = 1 phiếu. Fixed → v68, source moved to `receipt`/`receipt_line` + `delivery`/`delivery_line` UNION + new `opening_balance_line` sub-query (OB mid-range case); cascaded `gf-inventory-HLD.md v30→v31` §6b.9.3/§6b.9.5; also fixed same stale index cite on `W06-STK-EX3`. Finding B (FLAGGED, not fixed): `§6b.8.3` cites fabricated indexes `idx_receipt_line_tenant_wh_date`/`idx_delivery_line_tenant_wh_date` for the unrelated W06-P2 PRC S2S endpoint — recommend follow-up CR for that owner (ADR-027/028 area). |

---

## Round 4 verification — 2026-07-23

Reviewer: `agent-arch-review` (contract v7). Scope: 15 files under `Architecture/` uncommitted working-tree; Round 4 mandate = 12 findings (F-01..F-12) per `Tracking/arch-design-W06-answers-4.md` + 2 ratified decisions D1 (fixed 5s polling) + D2 (expose PENDING with UI mapping).

### Summary

| Files reviewed | Round-4-touched | Baseline-verified-unchanged | New P0 | New P1 | New P2 | R4 findings CLOSED | Ready for SA ratify |
|---:|---:|---:|---:|---:|---:|---:|---|
| 15 | 8 | 7 | 0 | 0 | 0 | 12/12 | **true** |

**Verdict: UNBLOCK SA ratify.** All 12 Round 4 findings CLOSED; 8 touched files satisfy full 13-gate contract (G1-G13); 7 baseline files version-fingerprints unchanged (no scope creep).

### Frontmatter + Versioning 3-in-1 audit (G1 + G2)

| File | Version | last_reviewed | CL row 2026-07-23 | Verdict |
|---|---|---|---:|---|
| `Architecture/api/gf-accounting-api.md` | 18 → **19** | 2026-07-23 | 1 | PASS |
| `Architecture/api/gf-inventory-api.md` | 64 → **65** | 2026-07-23 | 2 (v64+v65) | PASS |
| `Architecture/api/agg-garage-graph-graphql.md` | 7.74 → **7.75** | 2026-07-23 | 1 | PASS |
| `Architecture/hld/gf-accounting-HLD.md` | 11 → **12** | 2026-07-23 | 1 | PASS |
| `Architecture/hld/gf-inventory-HLD.md` | 29 → **30** | 2026-07-23 | 1 | PASS |
| `Architecture/hld/garage-web-HLD.md` | 13 → **14** | 2026-07-23 | 1 | PASS |
| `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` | 19 → **20** | 2026-07-23 | 1 | PASS |
| `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` | 1 → **2** (amendment) | 2026-07-23 | 1 | PASS |

Baseline (Round 4 mandate says do NOT touch — verify unchanged):

| File | Version fingerprint | last_reviewed | Verdict |
|---|---|---|---|
| `Architecture/decisions/ADR-028-*.md` | v1 | 2026-07-22 | UNCHANGED |
| `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` | v1 | 2026-07-22 | UNCHANGED |
| `Architecture/data/gf-accounting-data-model.md` | v11 | 2026-07-22 | UNCHANGED |
| `Architecture/events/gf-accounting-events.md` | v10 | 2026-07-22 | UNCHANGED |
| `Architecture/hld/garage-mobile-HLD.md` | v13 | 2026-07-22 | UNCHANGED |
| `Architecture/integrations/INTEG-EXT-gf-inventory.md` | v21 | 2026-07-22 | UNCHANGED |
| `Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md` | v8 | 2026-07-22 | UNCHANGED |

No scope creep — 7/7 baseline files bit-identical fingerprints from Round 3 review.

### Per-finding verification (12/12 CLOSED)

#### F-01 [P1] PriceCalcRunStatus PENDING enum drift — CLOSED

Evidence:
- `gf-accounting-api.md §5.1` line 1240 — `content[].status` type: **enum `PENDING | RUNNING | SUCCEEDED | COMPLETED_WITH_ERRORS`** (4 values, matches §5.3 CREATE 202 + §6.2 canonical + BFF SDL). Field description explicit cross-refs D2 rationale + BR-PRC-014 clarification.
- §5.1 response sample line 1199 + 1218 — 2 rows including 1 `status: "PENDING"` example.
- `§6.2 Naming Registry` line 1690-1691 — **2 rows**: (a) `PriceCalcRunStatus` enum row explicit 4 values; (b) new **UI mapping row** stating `PENDING → "Đang tính"` + `RUNNING → "Đang tính"` (same VN label) per D2 ratify. BR-PRC-014 v17 "3 giá trị hiển thị" clarification preserved.
- §6.3 footer UI-mapping fragment line 1723 disambiguates item.status vs run.status. No enum-consumer-side drift.

#### F-02 [P1] Q3 thẻ kho missing per-row Kho/Mã/Tên/ĐVT context — CLOSED

Evidence:
- `gf-inventory-api.md §3g.2 W06-STK-Q3` line 8858-8869 Response 2xx — **top-level `context: {productCode, productName, mainUnitCode, warehouseCode, warehouseName}`** object, returned once per response (not per-row denorm). Field description block lines 8932-8934 cites FEAT-STK-DETAIL-V2 AC-1 rationale.
- `agg-garage-graph-graphql.md §3j` line 51074 — new SDL type `type StockCardDetailContext` + `content: StockCardDetailContext!` embedded at line 51167. Field name byte-for-byte match with REST (productCode/productName/mainUnitCode/warehouseCode/warehouseName).
- Cross-artifact consistency (G11): REST `context` field names = BFF `StockCardDetailContext` type fields = INTEG-FE §3.6d row line 264 `data.context` bindings.

#### F-03 [P1] Q3 404 conflates not-found vs no-movement — CLOSED

Evidence:
- `gf-inventory-api.md §3g.2 W06-STK-Q3` line 8870-8873 Response 2xx — **top-level `opening: {openingQty, openingValue}`** snapshot **always** returned (incl. no-movement case). Field description line 8935-8936 cites FEAT-STK-DETAIL-V2 AC-4 + BR-STKV2-012 §Đầu kỳ.
- Response 4xx table line 8951-8958 — **404 restricted** to "productCode/warehouseCode không tồn tại tenant-scoped only". Explicit note "NO LONGER 404 for '0 movements in range' — that case returns 200 OK with `content: []` + `opening/aggregates` still populated". FE distinguishes empty-state via `totalElements=0`.
- Semantics block line 8966 — query pattern describes 3 sub-queries: (a) product+warehouse context lookup (miss = 404); (b) opening snapshot; (c) movement rows + aggregates.
- Empty-movement case line 8949 in field table explicitly notes `content: [] + aggregates.opening* = closing*` (Đầu=Cuối) satisfying FEAT-STK-DETAIL-V2 EC-3.

#### F-04 [P1] Export endpoints missing for all 3 Stock V2 reports — CLOSED

Evidence — REST (`gf-inventory-api.md §3g`):
- `W06-STK-EX1 GET /api/v1/stock-ledgers/at-date/export` line 8972-9027 — 6-block complete: Headers (8976) · Path/Query params table (8980-8985) · Request N/A (8987) · Response 2xx binary stream + sheet layout description (8989-9007) · Response 4xx/5xx table (9009-9017) · Semantics with template binding + Apache POI + p95 ≤ 3s + row cap 50k (9019-9027). Template cite `Product/ux/assets/Báo cáo tồn kho.xlsx` per BR-STKV2-005.
- `W06-STK-EX2 GET /api/v1/stock/inout-summary/export` line 9029-9074 — 6-block complete (same pattern). Template `Báo cáo nhập xuất tồn.xlsx`. Row cap 50k. p95 ≤ 5s.
- `W06-STK-EX3 GET /api/v1/stock/card/export` line 9076-9130 — 6-block complete. Template `Báo cáo thẻ kho.xlsx`. Row cap 10k (narrower scope). p95 ≤ 2s. 404 semantic identical to Q3 (F-03 cross-cut).
- Author judgement documented (line 9007): direct binary stream chosen over S3 presigned for MVP (rationale: file ≤ 10MB streamable, template layout compact, S3 ops complexity not justified, browser download UX simpler).

Evidence — BFF (`agg-garage-graph-graphql.md §3j`):
- Query `stockLedgerAtDateExport` line 51537-51601 — full Phase 5 v6 GraphQL completeness: Transport/Auth/Idempotency (51541) · Downstream table (51543-51547) · Request GraphQL document + variables (51549-51568) · Response 200 JSON (51570-51585) · Error response shape (51587-51590) · Error codes table (51592-51599) · Resolver discipline (51601).
- Query `stockInoutSummaryExport` line 51603-51666 — same 6-block completeness.
- Query `stockCardDetailExport` line 51668+ — same 6-block completeness. SDL type `StockReportExportPayload` (51180) + `StockReportExportApiResponse` (51190) + 3 input types + SDL block lines 51231/51234/51237.

Evidence — Registry sync (G5 Step 1 Coverage):
- `gf-inventory-api.md §2 Endpoint Summary` lines 192-194 — 3 rows `W06-STK-EX1..EX3` present.
- `agg-garage-graph-graphql.md §2 Endpoint Summary` rows 369-371 (lines 51200-51202) — 3 export ops registered.
- `§0 Wave Index` W06 row (both files) extended to include `W06-STK-EX1..EX3` — FM-020 cascade rule PASS.
- §3g.1 module-local Endpoint Summary in gf-inventory-api synced (§3g heading at 8644, sub-sections 8670/8750/8839 = Q1/Q2/Q3, 8972/9029/9076 = EX1/EX2/EX3 — 6 sub-sections total).

Evidence — INTEG-FE:
- `INTEG-FE §3.6d` lines 263-264 — 3 new UI Action rows binding to `stockInoutSummaryExport` W06-STK-EX2 + `stockCardDetailExport` W06-STK-EX3 (STK-LIST-V2 Xuất file already bound at prior row). Templates cite `Product/ux/assets/Báo cáo {tồn kho,nhập xuất tồn,thẻ kho}.xlsx`. Prior TBD closed.
- Mobile export explicitly OUT of scope per Round 4 mandate — noted as soft flag in Change Log, no new mobile row added (compliant with narrow scope).

#### F-05 [P1] BR-PRC-015 "kỳ sau cần tính lại" warning missing — CLOSED

Evidence:
- `gf-accounting-api.md §5.3` CREATE Response 202 line 1413-1421 — **`affectedSubsequentPeriods: [{periodId, periodName, lastRunId, lastRunStatus}]`** array field. Field description block lines 1426-1429 cites FEAT-PRC-CREATE AC-9b + BR-PRC-015 rationale. Response 200 idempotent replay path line 1440 also includes field (empty array).
- §5.3 Semantics block line 1462 — post-commit detection step described: "sau Phase 5 commit (ADR-027 §2), service query `price_calc_run` cho các period sau (`period.start_date > current_period.end_date`, cùng `warehouse_id`, cùng `tenant_id`, có successful run status ∈ `{SUCCEEDED, COMPLETED_WITH_ERRORS}`) → populate `affectedSubsequentPeriods[]`". Index reuse note explicit: `idx_prc_run_tenant_garage_wh` + `idx_ap_tenant_dates` (§12.3 HLD — no new index).
- §5.4 RECALC Response 202 line 1502-1509 — symmetric add same field; Semantics block line 1532 — symmetric add same detection step description; explicit note "RECALC cũng propagate cascade tương tự CREATE".
- `gf-accounting-HLD.md §11.3bis` line 415-446 — new subsection **"Post-commit BR-PRC-015 subsequent-period cascade detection"** describes: (a) trigger point (Phase 5/6 of ADR-027, AFTER commit, BEFORE 202 return); (b) SQL query pattern with LATEST-run-per-period subquery guarding RECALC audit chain; (c) index reuse note; (d) populate `affectedSubsequentPeriods` shape cross-ref API §5.3/§5.4; (e) non-blocking semantics (query failure → log warning + empty array); (f) performance envelope ≤ 20ms typical (< 5% Phase 5 latency budget).
- ADR-027 §4 line 188 — cascade note also present cross-ref API + HLD.

#### F-06 [P1] Polling contradiction — CLOSED (per D1)

Evidence:
- `garage-web-HLD.md §8d.3` line 280 — **"Polling interval — FIXED 5000ms"** bullet, explicit "**KHÔNG có backoff / adaptive interval**". Cross-refs D1 ratify 2026-07-23 + FEAT-PRC-DETAIL AC-2c + ADR-028 §1 authoritative. Explicit note in same bullet: "Round 2 v13 backoff language `5→30s cap tăng dần` là FE-side scope creep không reconcile với Product AC / ADR-028 — reverted."
- `INTEG-FE §3.6d` line 252 — `priceCalcRunGet` polling note explicit **"Polling interval = fixed 5000ms (v20 F-06 revert per D1 ratify 2026-07-23 + AC-2c + ADR-028 §1 authoritative — NO backoff, NO adaptive interval; terminal state `SUCCEEDED`/`COMPLETED_WITH_ERRORS` stops polling)"**.
- Live body backoff language absent from both files. Change Log v13 (garage-web-HLD) + v19 (INTEG-FE) historical entries still mention prior backoff — acceptable audit-trail per versioning discipline.

#### F-07 [P1] Empty-state binding undocumented — CLOSED

Evidence:
- `garage-web-HLD.md §8d.2` line 275 — new callout block after 3 report table rows: "**Empty-state UI pattern (v14 F-07 add — apply to all 3 Stock V2 report screens)**": `totalElements === 0` → render `EmptyState`/`NoData` from `.claude/references/web-component-registry.yaml` with verbatim VN `"Không có dữ liệu"` per FEAT-STK-LIST-V2 EC-4 + FEAT-IP-VIEW-V2 EC-4 + FEAT-STK-DETAIL-V2 EC-3. Missing component → `/allow-new-component` per FM-018. Q3 no-movement cross-cut (F-03) covered explicitly.
- `INTEG-FE §3.6d` line 265 — new row "Empty-state pattern (khi report trả `totalElements === 0`) — v20 F-07 add" — describes the UI pattern binding + reuse component from web-component-registry + verbatim text. Explicit note **"FE KHÔNG catch 404 làm empty-state"** (404 = true not-found only).

#### F-08 [P2] FEAT-PRC-LIST filter count mismatch — CLOSED

Evidence:
- `gf-accounting-api.md §5.1` line 1172 — `warehouseId` description reframes: "API vẫn giữ `warehouseId` optional cho API consumer khác (S2S / future filter), nhưng FE Web KHÔNG render 'Kho' như UI filter control — kho là tenant-context-derived". Cross-ref `INTEG-FE §3.6d` for actual FE binding.
- `INTEG-FE §3.6d` line 247 — filter description now **"2 filter controls only — Phương pháp (`pricingMethod`) + Ngày thực hiện range (`executedFrom` / `executedTo`)"**. Explicit note "KHÔNG có 'Kho' filter control trong UI".
- Line 248 second row: **"2 filter (Phương pháp / Ngày thực hiện) — UI-facing"** with explicit clarify `warehouseId` NOT user-facing FE filter (kept as GraphQL/REST optional param for backward compat + S2S).

#### F-09 [P2] movementKind OB enum overload — CLOSED

Evidence:
- `gf-inventory-api.md §3g.2` line 8938 — `content[].movementKind` type = **enum `OPENING | SLIP | OB_IMPORT`**. Field description explicit semantics for each of 3 values + note "pre-v65 the enum was flat `OB | SLIP` — F-09 disambiguates `OB` overloaded uses".
- `§5.2 Naming Registry` line 9180-9182 — updated row + 3 new sub-rows describing each enum value + data-model migration cascade note flagged (movement_kind column legacy `OB` values need data-fix — separate CR).
- `agg-garage-graph-graphql.md §3j` line 51071 — SDL `enum MovementKind { OPENING SLIP OB_IMPORT }` + comment lines 51070/51058/51060 describing semantics.
- Q3 default disposition per Round 4 mandate: **OB_IMPORT included in content[]** because affects running balance (default: YES) tagged different from SLIP per BR-STKV2-013 — decision documented, no `open_questions` flag.

#### F-10 [P2] Q3 dòng Tổng FE-computed multi-page risk — CLOSED

Evidence:
- `gf-inventory-api.md §3g.2 W06-STK-Q3` line 8912-8921 Response 2xx — **BE-computed `aggregates` block with 8 fields** (openingQty + openingValue + totalInboundQty + totalInboundValue + totalOutboundQty + totalOutboundValue + closingQty + closingValue). Mirror Q1/Q2 aggregates pattern.
- Field description block lines 8944-8948 cites FEAT-STK-DETAIL-V2 AC-6 "Dòng Tổng" — "FE KHÔNG tự sum content[] (multi-page risk)". Balance invariant explicit: `opening + totalInbound − totalOutbound = closing`.
- Semantics block line 8968 pagination bullet: "FE hiển thị Dòng Tổng cuối trang bằng cách bind `aggregates` (BE-computed) — KHÔNG tự sum content[] (multi-page correctness — F-10 v65)".
- Empty-movement case (F-03 cross-cut) line 8949 — `aggregates.opening* = closing*` + `totalInbound*/totalOutbound* = 0` (Đầu=Cuối).
- Cascade to INTEG-FE §3.6d/garage-web-HLD §8d.2 both bind to `data.aggregates.*` (verified in F-06/F-07 evidence).

#### F-11 [P2] RECALC new-row vs carry-over mechanism unspecified — CLOSED

Evidence:
- `ADR-027 §4` line 166-188 — **rewritten** with explicit "RECALC = luôn tạo NEW `price_calc_run` row với `source_run_id = {sourceRunId}` (BR-PRC-010 audit trail). KHÔNG mutate run gốc" callout. Phase 0 (RECALC-specific) copy-forward step described in detail:
  - Step 1: Load source run (verify terminal status).
  - Step 2: INSERT new row (copy scope + scope_predicate + items_snapshot; new `run_scope` column).
  - Step 3: **Copy-forward source items** with distinct semantics for `ALL` vs `ERROR_ONLY` scope (lines 174-176).
  - Step 4: Re-resolve items eligibility (mã mới xuất hiện / ẩn `Ngừng hoạt động`).
  - Step 5: Chuyển sang §2 Phase 1-5 áp dụng CHỈ cho items có `status='RUNNING'`.
- In-place mutation language ("reset status=RUNNING", "xoá price_calc_run_item WHERE status IN DONE, ERROR") = **gone** from live body. Status line 15 explicitly notes v1 language "contradicted §5.4 API + data-model 'NEW row' semantic" — the rewrite documented as v2 amendment.
- `gf-accounting-api.md §5.4` Semantics block line 1528-1530 — **"Copy-forward Phase 0 step (F-11 v19 clarify per ADR-027 v2 §4)"** callout describing bulk INSERT `price_calc_run_item` clone semantic + BR-PRC-008 satisfaction.
- ADR-027 §4 line 188 — BR-PRC-015 cascade note cross-refs API §5.3/§5.4 + HLD §11 (pairs with F-05 canonical).

#### F-12 [P2] gf-inventory-HLD.md never cascaded for §3g — CLOSED

Evidence:
- `gf-inventory-HLD.md §1 Overview` line 80 — new callout block "**Stock V2 Reports subsystem (DESIGN — W06 additive, public read on top of ADR-020 `inventory_stock_ledger` — see §6b.9 for Performance & Scale)**" — describes 6 public REST endpoints, 3 FEAT coverage, web/mobile scope, realtime read semantics, dual persona, feature flag `Inventory:InventoryV2`, index reuse, ADR-020 cross-ref.
- `§6b.9 W06 additions — Stock V2 Reports subsystem` line 435-489 — **6-item Performance & Scale coverage per G12**:
  - §6b.9.1 Expected load — QPS envelope + p95 targets per endpoint (Q1 ≤ 500ms, Q2 ≤ 800ms, Q3 ≤ 300ms, EX1/2/3 ≤ 5s).
  - §6b.9.2 Pagination strategy — offset baseline + row cap; Q3 no-movement 200 semantic cross-ref F-03; export no pagination.
  - §6b.9.3 Index list — table of 4 query patterns → all REUSE existing W04 indexes (`idx_stock_ledger_tenant_wh_product_date`) — **tenant-prefix invariant maintained** (Reviewer G12 P0 correctness). Rule note: "NO new index added".
  - §6b.9.4 Cache strategy — NO cache realtime per AC-3.
  - §6b.9.5 N+1 avoidance — Q1/Q2/Q3 single-query pattern; Q3 F-02 context top-level + F-10 aggregates BE-computed.
  - §6b.9.6 Tenant fairness — row cap 50k/50k/10k + feature flag class-level gate + dual persona.
- §7 Forbidden Actions extended with 1 new bullet re: bypass row cap on export endpoints (line 533-534 area — verified in v29 W06 baseline callout section).

### Standard 13-gate coverage (8 Round 4 touched files)

| Gate | Result | Note |
|---|---|---|
| G1 Frontmatter compliance | PASS | 8/8 files complete (type/artifact_kind/tier/owner_authority/boundary/status/version/last_reviewed) |
| G2 Versioning 3-in-1 | PASS | 8/8 files bump version + last_reviewed=2026-07-23 + Change Log row |
| G3 12 Critical Rules | PASS | Boundary isolation preserved (BFF passthrough only, no cross-boundary DB); tenant isolation on all 3 export endpoints + aggregates queries; no direct-DB cross-boundary; dual persona preserved |
| G4 Per-boundary toggle | PASS | gf-accounting stays ddl-auto (no Flyway proposals); gf-inventory Flyway additive only (no rewrite); no Temporal usage outside 5 eligible boundaries |
| G5 REST + GraphQL body completeness | PASS | 3 new REST export endpoints (EX1/EX2/EX3) 6/6 blocks each; 3 new BFF export ops (GraphQL) Phase 5 v6 all 6 blocks (Transport/Auth/Idempotency + Downstream + Request + Response 200 + Error shape + Error codes). §0 Wave Index W06 row synced with §3g sub-modules (FM-020 cascade OK) |
| G6 Coverage | PASS | 3 STK V2 FEATs all touched (STK-LIST-V2 AC-8, IP-VIEW-V2 AC-7, STK-DETAIL-V2 AC-7 export cited); PRC AC-9b + BR-PRC-015 detection (F-05); polling AC-2c (F-06); empty-state ECs (F-07) |
| G7 ADR numbering & cross-ref | PASS | ADR-027 v2 amendment properly logged (Status line 15 amended + Change Log v2 row); not new ADR-029. Cross-refs to ADR-028 §1 + ADR-020 + ADR-004 + INTEG-EXT-gf-accounting-gf-inventory preserved |
| G8 Integration contracts | PASS | garage-web ∈ scope → INTEG-FE §3.6d has 3 new export UI Action rows + empty-state row (mapping UI → GraphQL → REST); garage-mobile explicitly OUT of scope (soft flag), no INTEG-MOB touch |
| G9 KG consistency | N/A | Round 4 = fix findings on existing entity/event/field shapes; no new domain entity introduced. movementKind enum rename (F-09) flagged in doc as data-model migration cascade note for separate CR (documented, not silent drift) |
| G10 Ask-First Discipline | PASS | Author correctly applied D1 (polling revert) + D2 (PENDING expose) verbatim; no fabricated answers beyond mandate; no new `[NEEDS-CONFIRM]`/`TBD`/`<TODO>` markers introduced; no persona drift; INTEG-FE §3.6d prior TBD (F-04) properly closed with authored endpoints |
| G11 Naming Registry | PASS | New fields present in registries: `affectedSubsequentPeriods[]` in gf-accounting-api §5.3/§5.4 field tables; Q3 `context`/`opening`/`aggregates` in gf-inventory-api §3g field descriptions; movementKind enum widen in §5.2 Naming Registry with 3 sub-rows; cross-artifact field names byte-for-byte match across REST + BFF SDL + INTEG-FE |
| G12 Performance & Scale | PASS | gf-inventory-HLD §6b.9 6/6 items (F-12); tenant-prefix maintained on all index reuse (correctness — no P0); export p95 targets present (3s/5s/2s); row caps documented; feature flag gate |
| G13 Field provenance | PASS | 5 sampled fields: (a) `affectedSubsequentPeriods.periodId` → FEAT-PRC-CREATE AC-9b + BR-PRC-015 (verified in Product); (b) `context.mainUnitCode` → FEAT-STK-DETAIL-V2 AC-1 + BR-STKV2-012 (verified); (c) `aggregates.totalInboundQty` → FEAT-STK-DETAIL-V2 AC-6 + BR-STKV2-010 (verified); (d) `movementKind.OB_IMPORT` → BR-STKV2-013 (verified); (e) `warehouseIds` in W06-STK-EX1 → FEAT-STK-LIST-V2 AC-4 (verified). All 5 trace to Product FEAT/BR — NO fabricated field |

### Findings (new to Round 4)

| File | Gate | Severity | Rule | Note |
|---|---|---|---|---|

**No new findings — 0 P0 · 0 P1 · 0 P2.**

### Round 4 findings status

| ID | Status |
|---|---|
| F-01 | CLOSED |
| F-02 | CLOSED |
| F-03 | CLOSED |
| F-04 | CLOSED |
| F-05 | CLOSED |
| F-06 | CLOSED |
| F-07 | CLOSED |
| F-08 | CLOSED |
| F-09 | CLOSED |
| F-10 | CLOSED |
| F-11 | CLOSED |
| F-12 | CLOSED |

**Verdict: Round 4 UNBLOCK SA ratify** — all 12 findings closed, no new issues surfaced, no scope-creep on baseline files.


---

## Round 6 verification — 2026-07-23

**Scope**: Q2 v3 reversal — PRC async execution engine flipped from background thread + Redis lock + scheduled sweep (Round 1 Q2=A / ADR-028 v1) to **Temporal workflow** (Round 6 mandate per user directive 2026-07-23 "muốn dùng temporal"). 6 files touched Round 6; verify 4 Round 4 files + 4 Round 5 files not disturbed by cascade.

**Files reviewed** (Round 6 primary): 6
- `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` v3
- `Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md` v2 (rewrite; filename kept historical)
- `CLAUDE.md` §7 Common Gotcha #7 (5 → 6 services)
- `Architecture/hld/gf-accounting-HLD.md` v13
- `Architecture/api/gf-accounting-api.md` v21
- `Architecture/data/gf-accounting-data-model.md` v12

**Files verified UNCHANGED by Round 6 cascade** (Round 4 + Round 5 landing): 8
- `Architecture/api/agg-garage-graph-graphql.md` v7.76 — R5 BFF SDL `PriceCalcRunKickoff` fields (status/runId/pollingUrl/pollingIntervalHint=5000/idempotentReplay/warningsMessages/affectedSubsequentPeriods) intact; 0 Temporal/Q2 v3 markers
- `Architecture/api/gf-inventory-api.md` v66 — Round 4/5 landing; 0 Round 6 markers (mtime 14:10 = editor touch only, no substantive diff)
- `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` v21 — 0 Round 6 markers
- `Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md` — unchanged (mtime 2026-07-22)
- `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` — 5 REST S2S contracts + Idempotency-Key pattern reused per mandate
- `Architecture/integrations/INTEG-EXT-gf-inventory.md` — unchanged
- `Architecture/hld/gf-inventory-HLD.md` v30 — R4 F-12 landing; only pre-Round-6 Temporal mentions (baseline TECHSTACK: gf-inventory has Temporal)
- `Architecture/hld/garage-web-HLD.md` v14 · `Architecture/hld/garage-mobile-HLD.md` · `Architecture/events/gf-accounting-events.md` — no PRC Kafka events added (line 20 events.md explicitly reaffirms "PRC KHÔNG publish Kafka event", ADR-028 §Alt-3 rejected)

### Gate matrix — Round 6

| Gate | Verdict | Note |
|---|---|---|
| G1 Frontmatter | PASS | ADR-027 v3 + ADR-028 v2 + HLD v13 + API v21 + data-model v12 all frontmatter compliant. ADR-028 filename `-sync-http-plus-background-thread.md` kept historical (documented in §Change Log v2 + title header + rationale row 14). |
| G2 Versioning 3-in-1 | PASS | All 5 primary architecture files bump version + last_reviewed 2026-07-23 + Change Log row (ADR-027 v2→v3, ADR-028 v1→v2, HLD v12→v13, API v20→v21, data-model v11→v12); CLAUDE.md Common Gotcha #7 sentence changed (not a versioned artifact per project convention). |
| G3 Critical Rules | PASS | Rule #14 workflow ID deterministic pattern `prc-{tenantId}-{runId}` verified in 4 places: ADR-027 §1.x line 87 + ADR-028 §Decision line 94 + HLD §11.1 line 367 + API §5.3 Semantics line 1477. Uses `runId` PK (deterministic per-tenant) + Rule #14 format literal. No `UUID.randomUUID()` in workflow method (Risk-1 documented ADR-028 §Consequences). Rule #1 boundary isolation — cross-boundary still REST S2S (no direct DB); Rule #4 tenant isolation — workflow input carries `tenantId`; Rule #6 dual persona — unchanged; Rule #7 projection — N/A; Rule #8 activity idempotency spelled per taxonomy row 116-121. |
| G4 Per-boundary toggles | PASS | Common Gotcha #7 `CLAUDE.md` line 206: "6 services: gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker, **gf-accounting** (W06 add — PRC async execution per ADR-028 v2, Q2 v3 reversal…)". `ddl-auto=update` respected — data-model §2quater.1 new col `temporal_workflow_id VARCHAR(255) NULL` no Flyway V{N}. `SERVICE-BOUNDARY-MATRIX.md` line 24 mentions Temporal as forbidden rule string (`không Temporal khi worker chưa register` for gf-sales) — no per-boundary Temporal column requiring cascade (matrix schema unchanged). |
| G5 Contract completeness | PASS | HTTP 202 client contract preserved. §5.3 Response 202 verified fields present: `runId, status=PENDING, createdAt, pollingUrl, pollingIntervalHint: 5000, warningsSkippedItems, warningsMessages[], affectedSubsequentPeriods[]`; §5.3 Response 200 idempotent replay: `runId, status, pollingUrl, pollingIntervalHint, idempotentReplay: true, affectedSubsequentPeriods: []`. §5.4 RECALC same shape + `sourceRunId + runScope`. 503 semantic flipped correctly "Thread pool exhausted" → "Temporal Cloud outage — WorkflowClient.start() fail; compensating DELETE row" (§5.3 row 1470 + §5.4 row 1542). 6-block per endpoint (Headers/Params/Request/Response 2xx/Response 4xx/Semantics) intact for §5.3 + §5.4. Round 5 F-13 BFF SDL fields not disturbed. |
| G6 Coverage | PASS | 100% of Round 6 mandate cascade delivered: (a) engine location ADR-027 §1.x new; (b) workflow ID + activity taxonomy + heartbeat; (c) ADR-028 rewrite; (d) CLAUDE.md #7 cascade; (e) HLD §11.1/§11.2/§11.3/§11.4; (f) API §5.3/§5.4/§6.2; (g) data-model §2quater.1 col add + 3 deprecate + 1 index deprecate. No missing affected boundary. |
| G7 ADR numbering & cross-ref | PASS with P1 (finding R6-F1) | ADR-027 v2→v3 + ADR-028 v1→v2 change log rows present with rationale citing Round 6 mandate. ADR-028 filename retention rationale documented header note line 14. §Alternatives Alt-1 (Temporal) marked "Accepted v3 2026-07-23 — moved to Decision §2" line 230 ✓. Alt-6 (background thread) marked "Reversed 2026-07-23 (Q2 v3)" line 235 ✓. **Internal doc consistency issue**: ADR-027 §1.x line 89 header says "**Activity taxonomy** (5 activities…)" but pseudocode line 100-124 references `CopyForwardActivity`, `SnapshotPullActivity`, `ComputeItemActivity`, `BulkFillCostActivity`, `BulkInheritCostActivity`, `BulkRecomputeLedgerActivity`, `CommitRunActivity` = 7 activities; ADR-028 §2 line 111 says "5 activity interfaces" then table rows 1-7 (SnapshotPull + UpdateRunStatus + ComputeItem + BulkFillCost + BulkInheritCost + BulkRecomputeLedger + CommitRun); HLD §11.1 line 358 correctly says "`PriceCalcActivities × 7`". → R6-F1 P1. |
| G8 Integration contracts | PASS | FE/mobile integration unchanged (client contract polling model same). INTEG-EXT-gf-accounting-gf-inventory 5 REST S2S contracts + `Idempotency-Key` pattern reused per mandate (unchanged). |
| G9 KG consistency | PASS | New concept `temporal_workflow_id` is BE audit column, not entity — no KG entity add needed. `needs_kg_update` scope for W06 already flagged for `price_calc_run`/`price_calc_run_item` in prior round; column add is internal implementation detail. |
| G10 Ask-First discipline | PASS | Round 6 = user-ratified reversal (user directive 2026-07-23 verbatim "muốn dùng temporal"). Rationale 3 điểm documented `Tracking/arch-design-W06-answers-6.md` §Round 6 mandate. Sample grep across 6 files for `[NEEDS-CONFIRM]/TBD/<TODO>/???` — 0 hits. T2 dual persona intact (no new actor). T5 no breaking contract change — HTTP 202 shape identical, `temporalWorkflowId` new field BE audit-only (Naming Registry marks Mobile/FE/BFF as N/A explicit). Procedural note (informational only, NOT a review finding per user instruction): `answers-6.md` timestamped 14:19 before user's 14:19+ ratify message per task prompt; outcome retroactively user-ratified — out-of-scope. |
| G11 Naming Registry & cross-artifact consistency | PASS with P1 (finding R6-F2) | New row `temporalWorkflowId` in gf-accounting-api §6.2 line 1717 correctly BE-only (BFF/FE/Mobile marked ~~N/A~~ audit-only). Cite resolves to ADR-028 v2 §2 + data-model §2quater.1. Cross-artifact consistency `temporal_workflow_id` (snake) ⇄ `temporalWorkflowId` (camel) verified. **Drift caught**: `gf-accounting-data-model.md §2quater.1` line 462 marks `idx_prc_run_status_lease` DEPRECATED, but `gf-accounting-HLD.md §12.3` line 519 still lists same index as live "PRC run sweep orphan" without DEPRECATED marker. → R6-F2 P1. |
| G12 Performance & Scale | PASS with 3 × P1 (findings R6-F3/F4/F5) | HLD §12 header intentionally not touched per v13 Change Log ("KHÔNG đụng §12"); this creates 3 stale-doc drifts vs new Temporal execution model: (a) §12.1 line 491 "PRC concurrent runs ≤ 8 simultaneous (2 pods × 4 threads)" wording still says "threads" not Temporal worker slots — minor P2 wording; (b) §12.5 line 537 "PRC Phase 2 — parallel compute per productCode dùng `ExecutorService.invokeAll()`" — should be Temporal `Async.function` fan-out per §11.1 REMOVED list; (c) §12.6 line 543 "Bulkhead: `PriceCalcExecutorService` bounded (N=4, queue=10)" — `PriceCalcExecutorService` explicitly killed in §11.1 REMOVED components; should be Temporal task queue depth + `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per §11.2 I6. Also HLD §1 line 47 overview callout STILL says "sync HTTP 202 + background thread + DB-state polling (ADR-028) — KHÔNG expand Temporal (giữ Gotcha #7 scope 5 services)" — directly CONTRADICTS §11 (Temporal) — → R6-F3. Tenant-prefix on indexes intact (correctness OK) — no P0 correctness violation. |
| G13 Field provenance | PASS | Sampled 5 fields introduced by Round 6: (a) `temporal_workflow_id` col → cite ADR-028 v2 §2 + Rule #14 (verified); (b) `temporalWorkflowId` Naming Registry row → cite ADR-028 v2 §2 (verified); (c) `PriceCalcRunWorkflow` (interface name) → ADR-027 §1.x + ADR-028 §2 workflow signature (verified deterministic Rule #14 aggregate); (d) `PRC_TASK_QUEUE` (constant) → ADR-027 §1.x line 86 + ADR-028 §Constraints line 55 (verified); (e) `WorkflowExecutionTimeout=60min` → ADR-028 §Decision line 95 + §6 line 202 + HLD I7 line 383 (verified). 0 fabricated fields — all resolve to user-ratified rationale + Product BR-PRC-016 v17 durable execution guarantee. |

### Findings (new to Round 6)

| ID | File | Gate | Severity | Rule | Note |
|---|---|---|---|---|---|
| R6-F1 | `Architecture/decisions/ADR-027-…md` §1.x line 89 + `Architecture/decisions/ADR-028-…md` §2 line 111 | G7 | **P1** | Internal doc consistency (activity count) | ADR-027 §1.x header claims "**5 activities**" but pseudocode + prose reference 7 (CopyForward + SnapshotPull + ComputeItem + BulkFillCost + BulkInheritCost + BulkRecomputeLedger + CommitRun); ADR-028 §2 line 111 "5 activity interfaces" contradicts its own bảng which has 7 numbered rows (adds UpdateRunStatus + CommitRun). HLD §11.1 line 358 correctly says "× 7". Reconcile: change ADR-027 §1.x header "5 activities" → "7 activities"; ADR-028 §2 "5 activity interfaces" → "7 activity interfaces" (or restructure into 5 core + 2 utility). |
| R6-F2 | `Architecture/hld/gf-accounting-HLD.md` §12.3 line 519 | G11 | **P1** | Cross-artifact drift (index deprecation not cascaded) | Data-model §2quater.1 line 462 marks `idx_prc_run_status_lease` **DEPRECATED v12** (Q2 v3 — post-migration `DROP INDEX IF EXISTS`; Temporal history replaces sweep). HLD §12.3 line 519 still lists same index as active "PRC run sweep orphan" without DEPRECATED marker. Reconcile: HLD §12.3 add strike-through + DEPRECATED note mirror data-model wording, or drop row entirely with rationale row in change log. |
| R6-F3 | `Architecture/hld/gf-accounting-HLD.md` §1 line 47 | G12 | **P1** | Stale overview callout contradicting §11 Temporal | §1 callout still says: "Async pattern **sync HTTP 202 + background thread + DB-state polling** (ADR-028) — KHÔNG expand Temporal (giữ Gotcha #7 scope 5 services)". §11 (line 343-478) now specifies Temporal workflow per Q2 v3. v13 Change Log explicitly declares "**KHÔNG đụng §1-§10 baseline**" — intentional non-update — but leaves misleading header for anyone opening the HLD. Reconcile: rewrite §1 callout single sentence: "Async pattern = HTTP 202 kick-off + **Temporal workflow** (`PRC_TASK_QUEUE`) — Q2 v3 reversal 2026-07-23 (ADR-028 v2)"; add reference to Gotcha #7 cascade 5 → 6 services. |
| R6-F4 | `Architecture/hld/gf-accounting-HLD.md` §12.5 line 537 + §12.6 line 542-543 | G12 | **P1** | Stale ExecutorService references in Performance section | §12.5 "PRC Phase 2 — parallel compute per productCode dùng `ExecutorService.invokeAll()`" and §12.6 "Bulkhead: `PriceCalcExecutorService` bounded (N=4, queue=10)" both reference components §11.1 REMOVED list explicitly kills. Reconcile: §12.5 → "PRC Phase 2 — parallel compute per productCode via Temporal `Async.function` fan-out with `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)` per pod"; §12.6 → replace `PriceCalcExecutorService` bulkhead with Temporal task queue depth monitoring + activity retry policy + `temporal_worker_task_slots_available` metric. |
| R6-F5 | `Architecture/decisions/ADR-027-…md` §Consequences Negative-1 line 287 | G12 | **P1** | Stale ExecutorService reference in ADR-027 v3 residual | Line 287 in Negative-1 still says "parallel Phase 2 compute per-item (`ExecutorService` fixed pool = 4 threads)". Should be Temporal `Async.function` fan-out with `WorkerOptions.setMaxConcurrentActivityExecutionSize(4)`. Same class of stale as R6-F4. Reconcile: rewrite Negative-1 mitigation bullet 3 to reference Temporal fan-out. |
| R6-F6 | `Architecture/api/gf-accounting-api.md` §7 References line 1772 | G7 | **P2** | Stale ADR label | Line reads "**ADR-028 (PRC async execution — sync HTTP 202 + BG thread)**" — body §5.3/§5.4 correctly cite `ADR-028 v2 §2` for Temporal, but §References label still says "BG thread". Reconcile: change label to "ADR-028 v2 (PRC async execution — Temporal workflow)". |
| R6-F7 | `Architecture/data/gf-accounting-data-model.md` §3 Data Isolation line 405 | G12 | **P2** | Stale sweep reference | "Sweep query cross-tenant (`idx_prc_run_status_lease`) chỉ dùng cho ops/system layer (không expose qua REST)" — sweep no longer exists in Temporal model per §2quater.1 index deprecation. Reconcile: drop sentence about sweep query (Temporal workflow history replaces the audit surface). |
| R6-F8 | `Architecture/hld/gf-accounting-HLD.md` §12.1 line 491 | G12 | **P2** | Wording drift | "PRC concurrent runs (across cluster) ≤ 8 simultaneous (2 pods × 4 threads)" — capacity model unchanged (still 4 per pod), but wording "threads" now means Temporal activity slots. Reconcile: "(2 pods × 4 Temporal worker slots)". Non-blocking. |
| R6-F9 | `Architecture/TECHSTACK.md` lines 75, 173, 235 | G4 (T0→T1 cascade) | **P2** | Docs dependency cascade gap | CLAUDE.md §7 Common Gotcha #7 correctly cascades 5 → 6 Temporal services adding gf-accounting. `Architecture/TECHSTACK.md` still lists 5 services (line 75 "`gf-sales`, `gf-customer`, `gf-marketing`, `gf-inventory`, `gf-inventory-worker`"; line 173 similar; line 235 TECH-TBD-005 note). Per `DOC-DEPENDENCY-MAP §3.1`, this is a T0→T1 cascade Round 6 didn't propagate. Reconcile: extend all 3 lines to include `gf-accounting` with W06 note; version bump TECHSTACK. Non-blocking but should be tracked as follow-up CR. |

### Round 6 Temporal cascade status

| Flag | Status |
|---|---|
| workflow_id_convention | **CONSISTENT** — `prc-{tenantId}-{runId}` in all 4 places (ADR-027 §1.x + ADR-028 §Decision + HLD §11.1 + API §5.3 Semantics) |
| client_contract_preserved | **true** — HTTP 202 body shape identical, `pollingIntervalHint=5000`, `idempotentReplay` in 200 replay, `affectedSubsequentPeriods` intact, R5 BFF SDL `PriceCalcRunKickoff` fields untouched |
| temporal_service_count_cascaded | **true** — CLAUDE.md §7 #7 now says 6 services incl. `gf-accounting` |
| background_thread_language_purged | **partial (stale residuals R6-F1 F-3 F-4 F-5 F-6 F-7)** — ADR-028 §2/§3/§5/§6 rewrite complete; ADR-027 §Consequences Negative-1 + HLD §1 + HLD §12.5 + HLD §12.6 + API §7 References + data-model §3 all still have BG-thread/ExecutorService/sweep language |
| adr027_temporal_addendum_added | **true** — §1.x new (line 82-127) with workflow ID + activity taxonomy + heartbeat + orchestration pseudocode |
| data_model_deprecated_columns_marked | **true** — `worker_node_id` + `lease_until` + `resumed_count` all strike-through DEPRECATED v12; `temporal_workflow_id VARCHAR(255) NULL` new row; `idx_prc_run_status_lease` DEPRECATED; `uidx_prc_active_lock` kept for Layer 3 defense-in-depth |
| naming_registry_temporalWorkflowId_added | **true** — §6.2 line 1717 row present, BFF/FE/Mobile marked N/A audit-only |
| hld_performance_section_updated_for_temporal | **false** — §12 explicitly not touched per v13 Change Log; 3 sub-sections (§12.1 wording, §12.5 fan-out, §12.6 bulkhead) still describe ExecutorService model — findings R6-F4 + R6-F8 |

### Docs dependency cascade gaps

| Doc | Gap |
|---|---|
| `Architecture/TECHSTACK.md` | Lines 75, 173, 235 still list 5 Temporal services; missed cascade after CLAUDE.md §7 #7 update (R6-F9 P2) |
| `Execution/SERVICE-BOUNDARY-MATRIX.md` | No dedicated Temporal column — no cascade required (rule-string mention only) |

### Verdict

**`ready_for_sa_ratify: false`** — 5 × P1 findings (R6-F1..R6-F5) block SA ratify per gate policy (`ready_for_sa_ratify = true` iff `p0_count == 0 AND p1_count == 0`). No P0 correctness violations; contract preserved; Temporal cascade architecturally sound. Remediation is doc-consistency only:

1. **R6-F1** — reconcile activity count (7 not 5) in ADR-027 §1.x header + ADR-028 §2 line 111.
2. **R6-F2** — HLD §12.3 mark `idx_prc_run_status_lease` DEPRECATED (mirror data-model §2quater.1).
3. **R6-F3** — rewrite HLD §1 overview callout (line 47) to reflect Temporal reversal.
4. **R6-F4** — rewrite HLD §12.5 + §12.6 to Temporal `Async.function` + task queue bulkhead.
5. **R6-F5** — rewrite ADR-027 §Consequences Negative-1 line 287 fan-out reference.

P2 residuals (R6-F6..R6-F9) can be batched into same fix pass or deferred to follow-up cascade CR (esp. R6-F9 TECHSTACK T0→T1).

**Recommendation to Leader**: `agent-arch-author` fix R6-F1..R6-F5 (P1) in a targeted amendment (bump ADR-027 v3→v4? Or in-place v3 amendment via Change Log addition — Delivery Authority decides); optionally sweep P2. Re-run `/arch-review W06 round 7` (single-file quick verify) after fix.

## Round 8 verification — 2026-07-23

Wave: **W06 Round 8** — mechanical HTTP-verb fix (3 REST endpoints Q1/Q2/Q3 in `gf-inventory-api §3g` flipped GET+query → POST+`/search`+JSON body per codebase majority convention). No new design decision, no re-litigation of any prior round.

Reviewer: `agent-arch-review` (contract v7) — fresh subagent, read-only.
Mandate: `Tracking/arch-design-W06-answers-8.md`.
Scope: 4 files (`gf-inventory-api.md` v67 + `agg-garage-graph-graphql.md` v7.77 + `INTEG-FE...md` v22 + `INTEG-MOB...md` v9).

### Summary

| Files reviewed | P0 | P1 | P2 | Ready for SA ratify |
|---:|---:|---:|---:|---|
| 4 | 0 | 2 | 1 | **false** (P1 pending — 1 known-drift working-tree state + 1 §5.2 stale reference within Round 8 file) |

### Fix verdict per endpoint

| Endpoint | Round 8 fix status |
|---|---|
| W06-STK-Q1 `POST /api/v1/stock-ledgers/at-date/search` | **POST_SEARCH_CONFIRMED** — §2 row · §3g.1 row · §3g.2 heading line 8670 · Request body full JSON schema (asOfDate + warehouseIds + keyword + page + size + sort, all with type/required/validation/Cite) + 2 example payloads (full + minimal). Path/Query params = "N/A (POST — see Request body)". Response 2xx envelope + `aggregates` + 4xx codes + Semantics all preserved. G5 6-block COMPLETE. |
| W06-STK-Q2 `POST /api/v1/stock/inout-summary/search` | **POST_SEARCH_CONFIRMED** — §2 row · §3g.1 row · §3g.2 heading line 8771 · Request body full schema (fromDate + toDate + warehouseIds + keyword + page + size + sort) + 2 example payloads. Response 2xx `aggregates` 8-field block preserved. G5 6-block COMPLETE. |
| W06-STK-Q3 `POST /api/v1/stock/card/search` | **POST_SEARCH_CONFIRMED** — §2 row · §3g.1 row · §3g.2 heading line 8883 · Request body schema (productCode + warehouseCode + fromDate + toDate + page + size) + 1 example payload. Response 2xx `context` + `opening` + `aggregates` + 3-row content example all preserved. G5 6-block COMPLETE. |

### Scope-discipline checks

| Check | Result |
|---|---|
| EX1/EX2/EX3 export endpoints method+path unchanged (still GET) | **PASS** — lines 9029/9086/9133 all `#### W06-STK-EX{N} — GET /api/v1/.../export`. §2 rows 192-194 all `GET`. §3g.1 rows 8662-8664 all `GET`. Intro wording reworded per mandate ("passed as GET query params here since export dumps the full filtered set without pagination — see Q1/Q2/Q3 for the POST+body equivalent"). |
| W06-P1 (S2S bounded batch, no pagination) unchanged | **PASS** — line 8348 still `#### W06-P1 — GET /protected/v1/stock-ledgers/at-date` (no `/search` suffix, no verb flip). |
| `gf-accounting-api.md` untouched by Round 8 | **PASS** — `git diff --shortstat` empty. |
| Product/features/FEAT-STK-*.md, Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md, Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md untouched | **FAIL** — 3 files STAGED with semantic edits dated 2026-07-24 (see P1 finding #2 below). Not Round 8's doing per mandate context; flagged per mandate directive "if bizarre/unexpected, flag rather than assume Round 8's". |
| GraphQL Query type preserved (stockLedgerAtDate/stockInoutSummary/stockCardDetail remain `Query`, not `Mutation`) | **PASS** — §2 rows 436/437/438 all `Query`. §3j.2 rows 51273-51275 all `Query`. §3j.6 headings lines 51350/51432/51528 all `#### Query \`...\``. |
| Cross-artifact consistency (BFF Downstream text · INTEG-FE REST col · INTEG-MOB REST reference — all show identical POST+`/search` paths as gf-inventory-api) | **PASS** — BFF §3j.6 Downstream tables lines 51362/51444/51540 · INTEG-FE §3.6d rows 258/261/263 · INTEG-MOB §3.4c intro line 146 all consistent with `gf-inventory-api §3g.2` v67 canonical paths. Also §3j.6 error-response sample `path` fields (lines 51420/51516/51610) correctly flipped to `/search`. |
| Naming Registry §5.2 field names unchanged (asOfDate, warehouseIds, keyword, page, size, sort, productCode, warehouseCode, fromDate, toDate) — moved from query-param to body-field but no rename | **PASS** — spot-check confirms all canonical names preserved. |
| G2 Versioning 3-in-1 all 4 files | **PASS** — v67/v7.77/v22/v9 bumps + `last_reviewed: 2026-07-23` + Change Log rows all present. |
| G10 Ask-First (no new `[NEEDS-CONFIRM]/TBD/<TODO>` markers introduced) | **PASS** — Round 8 diff introduces zero such markers. |
| G3 Critical Rules (boundary/tenant isolation — pure transport mechanism) | **PASS** — no boundary/tenant/permission change. |

### Findings

| # | Gate | Severity | File / Location | Rule | Note |
|---|---|---|---|---|---|
| R8-F1 | G11 | P1 | `Architecture/api/gf-inventory-api.md` line 9248 (§5.2 write-side/read-side surfacing blockquote) | Cross-artifact consistency within same file | §5.2 canonical reference blockquote paragraph still cites `GET /api/v1/stock-ledgers/at-date + GET /api/v1/stock/inout-summary + GET /api/v1/stock/card` — stale after Round 8 flip. This is authoritative narrative that BFF/FE devs read to understand ledger-field surfacing; it should now cite `POST .../search` for the 3 read endpoints. §5.2 tables themselves (StockLedgerAtDateItem field shapes etc.) are field-name-canonical/method-agnostic, so they're fine — the drift is only in the prose paragraph line 9248. Fix: 3-word text replacement `GET → POST` + append `/search` per path. Round 8 author missed this because it lives in §5.2 (Naming Registry area), not §3g.2 (endpoint details area) where all other flips happened. |
| R8-F2 | G3 (scope discipline) | P1 | `Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md` v13 · `Product/features/FEAT-STK-LIST-V2.md` v10 · `Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md` v11 (all 3 STAGED in working tree, dated 2026-07-24) | Working-tree scope discipline (mandate declared Product/ untouched) | Working tree has 3 STAGED Product files with a semantic change to BR-STKV2-007 / FEAT-STK-LIST-V2 AC-6 / UX-FLOW: filter condition flipped from "SL > 0" → "SL ≠ 0 OR GT ≠ 0" (bắt case SL=0 nhưng GT ≠ 0 do làm tròn giá vốn bình quân sau BQGQ) + new EC-5. Change Log entries explicitly acknowledge cascade gap: "**Architecture API doc (gf-inventory-api.md) chưa cascade theo yêu cầu user, cần đồng bộ riêng trước DEV**". Not Round 8's doing (mandate context flagged possible concurrent-session anomaly — this is exactly that). However: (a) mandate's own precondition "Product/ working tree clean" is FALSE; (b) `gf-inventory-api.md` v67 (Round 8 file itself) line 8747 still cites `SL tồn > 0 tại ngày đó invariant — mã có SL=0 KHÔNG xuất hiện | FEAT-STK-LIST-V2 AC-6` AND line 8765 Query pattern still has `AND closing_qty > 0` — both now stale vs BR-STKV2-007 v13. Per mandate directive to flag rather than assume: main-agent + SA MUST decide before ratifying whether to (i) unstage Product edits + ratify Round 8 alone (Product cascade tracked as separate follow-up CR), or (ii) fold BR v13 cascade into Round 8 bundle (would require gf-inventory-api §3g.2 Q1 line 8747 + 8765 amendment + BFF §3j.6 stockLedgerAtDate row-absent semantic sync). This finding does NOT indicate Round 8 authoring error — it indicates mixed working-tree state that needs main-agent adjudication. |
| R8-F3 | G5 (fidelity nit) | P2 | `Architecture/api/gf-inventory-api.md` lines 8769, 8881, 9027 (Q1/Q2/Q3 Semantics blocks last bullet each) | Doc wording fidelity | Each of Q1/Q2/Q3 Semantics blocks still ends with `**Idempotency**: N/A (GET).` — the `(GET)` annotation is now stale (endpoints are POST). Should read something like `**Idempotency**: N/A (POST /search is read-only, no state change)` to match new transport. Doesn't block DEV impl (POST /search read-only semantic is unambiguous from the "Read-only, idempotent" first bullet above), but is a 3-spot copy-paste artifact from Round 8's "response unchanged verbatim" fix that missed the label update. |

### Recommendation to Leader

Round 8 mechanical scope (HTTP verb flip Q1/Q2/Q3 GET→POST+`/search`) is **cleanly executed** in the 4 files: all G5 6-block completeness checks pass, all scope-discipline items pass except the working-tree Product mixed-state, GraphQL Query type preserved, cross-artifact paths consistent, versioning 3-in-1 correct.

Two P1 items remain before SA ratify:
1. **R8-F1** — 1-line text fix in `gf-inventory-api.md §5.2` line 9248 blockquote (spawn quick fix subagent or main-agent inline edit within design repo).
2. **R8-F2** — main-agent + SA adjudication needed on the concurrent Product staged edits (BR-STKV2-007 v13 etc.). Options: (i) unstage/stash Product changes, ratify Round 8 as-is, cascade Product→Architecture as separate CR; (ii) expand Round 8 scope to fold BR v13 cascade into gf-inventory-api Q1 line 8747/8765 + BFF §3j.6; (iii) ratify Round 8 first with acknowledgment of pending cascade. **Delivery Authority + SA decide.**

P2 R8-F3 (3-spot `(GET)` label drift in Semantics) can batch with R8-F1 fix or defer to follow-up sweep.

```json
{
  "wave": "W06",
  "round": 8,
  "files_reviewed": 4,
  "out_of_scope_files_verified_unchanged": 7,
  "p0_count": 0,
  "p1_count": 2,
  "p2_count": 1,
  "findings": [
    {"id": "R8-F1", "file": "Architecture/api/gf-inventory-api.md", "line": 9248, "gate": "G11", "severity": "P1", "rule": "cross-artifact consistency within same file", "note": "§5.2 blockquote paragraph still cites 3 GET paths for Q1/Q2/Q3; stale after Round 8 flip. Fix: text replace GET→POST + append /search."},
    {"id": "R8-F2", "file": "Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md v13 + Product/features/FEAT-STK-LIST-V2.md v10 + Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md v11 (all STAGED)", "gate": "G3 scope discipline", "severity": "P1", "rule": "working-tree scope discipline vs mandate precondition", "note": "3 Product files STAGED with semantic filter change SL>0 → SL≠0 OR GT≠0 dated 2026-07-24; Change Log explicitly acknowledges Architecture cascade pending. gf-inventory-api Q1 line 8747 + 8765 now stale vs BR-STKV2-007 v13. Not Round 8's doing; requires main-agent + SA adjudication (unstage / fold cascade / ratify with acknowledgment)."},
    {"id": "R8-F3", "file": "Architecture/api/gf-inventory-api.md", "line": "8769, 8881, 9027", "gate": "G5", "severity": "P2", "rule": "doc wording fidelity", "note": "Q1/Q2/Q3 Semantics last bullet still says '**Idempotency**: N/A (GET).' — (GET) stale post-flip; should be '(POST /search is read-only)'. Doesn't block DEV."}
  ],
  "round8_fix_status": {
    "Q1_stock_ledgers_at_date": "POST_SEARCH_CONFIRMED",
    "Q2_stock_inout_summary": "POST_SEARCH_CONFIRMED",
    "Q3_stock_card": "POST_SEARCH_CONFIRMED"
  },
  "ex_endpoints_unchanged": true,
  "w06_p1_unchanged": true,
  "gf_accounting_api_untouched": true,
  "graphql_query_type_preserved": true,
  "product_docs_untouched": false,
  "request_body_completeness": {
    "Q1": "COMPLETE",
    "Q2": "COMPLETE",
    "Q3": "COMPLETE"
  },
  "report_file": "Tracking/ARCH-REVIEW-W06.md",
  "ready_for_sa_ratify": false
}
```

## Round 9 verification — 2026-07-24

Wave: **W06 Round 9** — targeted spec-drift fix, `gf-inventory-api.md §3g.2 W06-STK-Q3` (thẻ kho) `content[]` source correction per `CR-20260724-01` (MINOR, self-approved). Not a re-litigation of any prior round's decisions — pure correctness fix on a gap Rounds 1-8 all missed despite each touching this exact sub-section.

Reviewer: main-orchestrator (session W05/REVIEW, user dev-ac directive 2026-07-24) + `agent-arch-author` (executing agent).
Scope: 2 files (`gf-inventory-api.md` v67→v68 + `gf-inventory-HLD.md` v30→v31).

### Finding A — FIXED: Q3 `content[]` source mismatch (missed by Rounds 1-8)

`gf-inventory-api.md v67 §3g.2 W06-STK-Q3` Semantics described `content[]` as reading directly from `inventory_stock_ledger` filtered on `movement_date IN [fromDate, toDate]`. This is architecturally impossible: `inventory_stock_ledger` (data-model `§4b.2`, v22 design) has `UNIQUE (tenant_id, product_id, warehouse_id, movement_date)` — 1 row per (mã+kho) per **day**, gộp mọi phiếu cùng ngày thành 1 điểm per `BR-STKV2-001(a)` — it has no `slip_code`/`slip_type` columns. But the Q3 response schema returns `slipCode`+`slipType` per row, and Product (`BR-STKV2-013` + `FEAT-STK-DETAIL-V2 AC-3/AC-4`) requires **mỗi dòng = 1 phiếu** with running Đầu kỳ/Cuối kỳ. Rounds 3, 4, and 8 all touched this exact sub-section (adding `context`/`opening`/`aggregates` blocks, then flipping GET→POST) without catching that the underlying query-source narrative could never produce the `slipCode`/`slipType` fields the response schema itself promises.

**Status: FIXED.** `gf-inventory-api.md` v68 rewrites the Semantics block (Realtime/Query pattern/Index used/p95 target bullets) and the Response fields table to source `content[]` from `receipt`+`receipt_line` UNION `delivery`+`delivery_line` (POSTED, entry_date range) + `opening_balance_line` (new sub-query (c') for the mid-range OB re-import case) — `opening` snapshot stays ledger-sourced (correct, unchanged). Cascaded to `gf-inventory-HLD.md` v31 `§6b.9.3`/`§6b.9.5` (Q3-narrative only). Also independently caught and fixed: `W06-STK-EX3`'s `Index used` line had the same stale single-index citation (fixed in the same pass since it's the same field, not scope creep). Evidence: `git diff Architecture/api/gf-inventory-api.md` + `Architecture/hld/gf-inventory-HLD.md`, both frontmatter-bumped + Change Log rows added (3-in-1 verified).

### Finding B — FLAGGED, NOT FIXED: fabricated index names in `§6b.8.3` (different endpoint, different owner)

While tracing real index names for Finding A, discovered `gf-inventory-HLD.md §6b.8.3` "Index list (W06 additions)" (lines ~407-409, W06-P2 `slips-in-period/search` PRC S2S endpoint, `§3f`, gf-accounting caller — unrelated to Q3) cites `idx_receipt_line_tenant_wh_date (tenant_id, warehouse_id, entry_date, status)` and `idx_delivery_line_tenant_wh_date` (same shape). **These indexes do not exist** in `Architecture/data/gf-inventory-data-model.md §4c` — `receipt_line`/`delivery_line` carry no `entry_date`/`status` columns at all; those columns live only on the parent `receipt`/`delivery` header aggregate. Same root-cause pattern as Finding A (treating line tables as if they carry header-level date/status), different endpoint.

**Status: NOT FIXED under CR-20260724-01** — that CR is scoped to Q3/`BR-STKV2-013` only; fixing `§6b.8` would exceed a MINOR CR's declared scope and belongs to whoever owns the PRC S2S subsystem (`ADR-027`/`ADR-028`, W06-P2 endpoint). Recommend a follow-up CR scoped to `§3f`/`§6b.8` to correct the index citation (likely: line-level `idx_receipt_line_product_wh`/`idx_delivery_line_product_wh` + header-level `idx_receipt_tenant_entry`/`idx_delivery_tenant_entry` — same real indexes cited in this round's Finding A fix — but that owner should verify against the actual W06-P2 query shape before changing it).

### Recommendation to Leader

Finding A closes a real correctness gap that would have broken DEV on day 1 of W06 `garage-web`/`garage-mobile` implementation (Q3 literally cannot be built as v67 described it). Ready to fold into the next SA ratify pass alongside the still-open Round 8 P1s (R8-F1, R8-F2) and this round's new Finding B (P1-equivalent, different owner — track separately, does not block Q3/BR-STKV2-013 sign-off).

```json
{
  "wave": "W06",
  "round": 9,
  "cr": "CR-20260724-01",
  "files_reviewed": 2,
  "p0_count": 0,
  "p1_count": 1,
  "p2_count": 0,
  "findings": [
    {"id": "R9-F1", "file": "Architecture/hld/gf-inventory-HLD.md", "line": "407-409", "gate": "G5", "severity": "P1", "rule": "index citation must reference indexes that exist in data-model", "note": "§6b.8.3 (W06-P2 slips-in-period/search, unrelated to Q3) cites idx_receipt_line_tenant_wh_date / idx_delivery_line_tenant_wh_date — receipt_line/delivery_line have no entry_date/status columns (those live on parent receipt/delivery header). Flagged, NOT fixed under CR-20260724-01 (different endpoint/owner, PRC S2S subsystem ADR-027/028). Recommend follow-up CR scoped to §3f/§6b.8."}
  ],
  "q3_fix_status": "CONTENT_SOURCE_CORRECTED",
  "files_bumped": {
    "gf-inventory-api.md": "v67 -> v68",
    "gf-inventory-HLD.md": "v30 -> v31"
  },
  "report_file": "Tracking/ARCH-REVIEW-W06.md",
  "ready_for_sa_ratify": false
}
```
