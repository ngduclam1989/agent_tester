---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 5
tier: T1
owner_authority: Architecture Authority
boundary: gf-accounting
last_reviewed: "2026-07-08"
---

# ADR-019: Accounting Period on `gf-accounting` — Additive Entity + PROPOSED Event Contract + REST Lock-check ACTIVE

## Status
ACCEPTED — 2026-06-24

> **Note**: ADR-019 slot was previously allocated to "AP on gf-inventory event PROPOSED pattern" (created 2026-06-23 round 3, deleted round 4 sau khi Delivery Authority reclassify boundary). Slot reused cho phiên bản gf-accounting per CLAUDE override 2026-06-24 — `Tracking/arch-design-inventory-v2-answers-1.md` Q4 SUPERSEDED note ghi nhận lịch sử.

## Context

`EP-INVENTORY-ACCOUNTING-PERIOD` (5 features `FEAT-AP-*` — LIST / CREATE / DETAIL / EDIT / DELETE) đặc tả **Kỳ kế toán (Accounting Period)** — danh mục mốc thời gian (Năm → Quý → Tháng) dùng để chốt sổ kho và làm điều kiện khóa cho phiếu nhập/xuất, tính giá xuất kho, import tồn đầu kỳ, báo cáo NXT.

Câu hỏi chính cần quyết định:

1. **Boundary ownership** — AP thuộc `gf-inventory` (theo frontmatter ban đầu của BA) hay `gf-accounting` (theo bản chất nghiệp vụ: kỳ kế toán = mốc chốt sổ, không phải dữ liệu kho)?
2. **Schema strategy** — additive new entity (tách bạch hoàn toàn) hay reshape entity hiện hữu?
3. **Cross-boundary integration surface** — event-driven (Kafka publish) hay REST sync hay cả 2; nếu cả 2 thì status thế nào (ACTIVE vs PROPOSED)?

**Constraints từ Product layer** (EP §1, §3.1, §5; BR §1, §2.1):
- Vòng đời trạng thái `OPEN ⇄ CLOSED` đối xứng (BR-AP-010, BR-AP-011 — cho phép mở lại; không ràng buộc thứ tự).
- Phân cấp **3 cấp cố định** Năm → Quý → Tháng (BR-AP-003); auto-generate children (BR-AP-009).
- Khi kỳ `CLOSED` → khóa thêm/sửa/xóa phiếu nhập kho, xuất kho có ngày chứng từ thuộc kỳ + chặn chạy tính giá (BR-AP-012). Enforcement chi tiết ở downstream `EP-INVENTORY-RECEIPT-V2` / `EP-INVENTORY-DELIVERY-V2` / `FEAT-PRC-CREATE` (chưa build).
- Tenant isolation + dual persona `{chủ garage, kế toán}` quyền ngang nhau (BR-AP-015, BR-AP-CMN-002).
- Web GMS only (mobile out of scope per `UX-FLOW-INVENTORY-ACCOUNTING-PERIOD` §1 line 31).

**Constraints từ team / runtime:**
- `gf-accounting` hiện đang chạy production với 5 baseline tables (`settlement_records`, `settlement_documents`, `tenant_sequences`, `outbox_events`, `inbox_events`) + 3 design insurance tables (`insurance_dossiers`, `insurance_dossier_documents`, `insurance_settlement_payments`) — kiến trúc tách bạch theo aggregate (HLD §5 / data §1–§2bis).
- `gf-accounting` dùng `spring.jpa.hibernate.ddl-auto=update` **KHÔNG Flyway DDL** (Gotcha #5 — `Architecture/hld/gf-accounting-HLD.md` §6 + ADR-006 exception).
- `gf-accounting` ngoài 5 service Temporal (ADR-005) → flow phải sync REST hoặc Kafka outbox đơn giản.
- Outbox infrastructure (`outbox_events` + `OutboxProcessor` + Redis singleton lock `gf-accounting-outbox-processor`) **sẵn sàng nhưng chưa wire** cho event publish nào (events file v7 §1).
- Topic `AC-DEV-ACCOUNTING-EVENTS` đã đăng ký trong `_CONVENTIONS.md` §11 (qua gf-accounting-events.md v7) nhưng currently 0 events (insurance events revoked v7).
- Future consumers (RECEIPT-V2, DELIVERY-V2, PRC) **chưa build** — không có consumer thực sự trong batch này.
- BA frontmatter trong `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v14 vẫn ghi `boundary: gf-inventory` (chưa fix).

**Business rules liên quan:** BR-AP-001..016, BR-AP-CMN-001/002, CB-AP-001 (sẽ phải re-orient từ gf-inventory sang gf-accounting khi BA fix frontmatter).

**Cross-cutting precedent:** ADR-014 (Insurance Settlement reuse `gf-accounting` thay vì tạo `gf-insurance` riêng) — minh chứng nguyên tắc "accounting subdomain consolidate trên `gf-accounting` khi không phải data kho thuần".

## Decision

**AP slice (5 FEAT-AP-*) thuộc `gf-accounting` boundary** với 3 quyết định kỹ thuật đồng bộ:

### Decision A — Boundary ownership

**AP master ownership = `gf-accounting`** (per Delivery Authority correction 2026-06-23):

- Kỳ kế toán = accounting concept (mốc chốt sổ); `gf-inventory` là consumer (RECEIPT-V2 / DELIVERY-V2 / OB dùng kỳ làm boundary khóa transaction), không phải master.
- Đồng nhất với ADR-014 (Insurance Settlement reuse gf-accounting) — củng cố accounting subdomain consolidate strategy.
- BA frontmatter mismatch là cosmetic; CLAUDE override 2026-06-24 ràng buộc design dùng `gf-accounting` làm authoritative. BA sẽ tự fix frontmatter khi reclassify chính thức (flag trong open_questions).

### Decision B — Schema strategy

**Additive new entity `accounting_period` trong `gf_accounting` schema** (không reshape table hiện hữu):

- New table `accounting_period` — adjacency-list hierarchy (`parent_id` BIGINT scalar self-FK per ADR-009), 3-level fixed (`type` enum `YEAR|QUARTER|MONTH`), status `OPEN|CLOSED`, `year INT NOT NULL` (v10 add per user quannn 2026-07-08), tenant_id + audit fields (16 cols total per `gf-accounting-data-model.md` §2ter.1 v10).
- **Sinh schema qua Flyway migration `V{N+1}__accounting_v1_accounting_period.sql`** — **v5 override (user quannn 2026-07-08 chốt NC-W04-EP-AP-002)** thay cho `ddl-auto=update` mặc định của Gotcha #5. File chứa: DDL create table 16 cols + 5 indexes + 2 CHECK constraints. Rationale: explicit migration control + audit trail rõ ràng cho AP schema evolution + consistency với `gf-inventory` boundary Flyway pattern (đã established qua W03/W04 additive migrations) + rollback dễ hơn. Trade-off documented tại §Consequences.
- Indexes: `idx_ap_tenant_year(tenant_id, year)` (v10 regular column thay expression index), `idx_ap_tenant_status(tenant_id, status)`, `idx_ap_tenant_dates(tenant_id, start_date, end_date)`, `idx_ap_parent(parent_id)`, `idx_ap_tenant_name(tenant_id, name)`.
- CHECK constraints: `end_date >= start_date` defensive + `year = EXTRACT(YEAR FROM start_date)` consistency guard (v10 add).
- KHÔNG modify 5 baseline tables hoặc 3 design insurance tables — tách bạch aggregate hoàn toàn (5+3 tables vẫn dùng `ddl-auto=update` per Gotcha #5).

### Decision C — Cross-boundary integration surface

**Kép REST + Kafka, nhưng phân tách status**:

- **REST `lock-check` ACTIVE trong batch**:
  - `GET /protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}` (x-api-key S2S).
  - Response: `{locked: bool, periodId, periodCode, status, periodType, startDate, endDate}`.
  - **Advisory only** — authoritative enforcement vẫn ở downstream backend (RECEIPT-V2 / DELIVERY-V2 / PRC commit guard). Lock-check là fast pre-check để fail-fast UX khi user nhập ngày chứng từ.
  - Caching: 30s LRU at caller side (per PL5 prior pattern + ADR-015 debt-summary precedent).

- **Kafka events PROPOSED — KHÔNG publish trong batch**:
  - 2 outbound events `AccountingPeriodClosed` + `AccountingPeriodReopened` declared trong `gf-accounting-events.md` §2 với status=`PROPOSED`.
  - Topic = `AC-DEV-ACCOUNTING-EVENTS` (D1 — reuse existing topic đã register trong _CONVENTIONS §11; conform pattern `AC-DEV-{DOMAIN}-EVENTS`).
  - MessageGroup = `ACCOUNTING_PERIOD_LIFECYCLE` (UPPER_SNAKE, per _CONVENTIONS §3.3).
  - MessageStep = `CLOSED.1` / `REOPENED.1` (versioned-suffix pattern).
  - Partition key = `AccountingPeriod-{periodCode}` (per-aggregate, _CONVENTIONS §4).
  - Envelope = `KafkaMessageWrapper` (mandatory, _CONVENTIONS §3).
  - Outbox + inbox mandatory **khi ACTIVE** (ADR-004) — outbox infra hiện hữu của `gf-accounting` (poll 5s, batch 100, max retry 3, Redis lock) đã sẵn sàng wire.
  - **Flip ACTIVE = future wave responsibility** khi RECEIPT-V2 / DELIVERY-V2 / PRC kick-off và cần invalidate cache hoặc cascade processing.

### Decision D — REST API design

- Prefix mới `/api/v2/accounting-periods/*` (v2 coexist với existing `/api/v1/settlements/*` — không break baseline contract).
- 7 endpoint: search (POST), tree (GET), detail (GET), create (POST với `autoGenerateChildren` flag), update (PUT — chỉ mutable fields per BR-AP-016), delete (DELETE — 3-guard), lock-check (GET protected).
- Tree size cap defensive: backend 500 periods/tenant → plain `HTTP 413` (no registry error code per **R2 F2 fix**); BFF translates qua `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (BFF-only single point cho user-facing tree-cap error — xem `agg-garage-graph-graphql.md §3e.3`). **Deprecated proposal** (Round 1) reuse `ERR-INV-027` → REJECTED: registry:125 marked deprecated cho BR-PRC-007 "Tính giá xuất kho thất bại" HTTP 500; zombie revival + HTTP shift 500→413 = registry contract break.
- Error codes giữ nguyên `ERR-INV-021..026` cho 6 validation/business cases (D2 decision — không rename namespace trong batch; cosmetic mismatch tolerated vì ERR-INV-024 đã được dùng cross-boundary bởi RECEIPT-V2/DELIVERY-V2/OB per ERROR-CODE-REGISTRY v9 line 122/532).
- **Immutable-field violation** (BR-AP-016): **R2 F1 fix** — allocate NEW namespace `ERR-AP-*` cho Accounting Period domain trên gf-accounting boundary; placeholder `ERR-AP-001` pending BA register (OQ7 new). **Deprecated proposal** (Round 1) reuse `ERR-INV-032` → REJECTED: collide với existing registry:130 (`ERR-INV-032` = "Số lượng tồn phải > 0" BR-OB-008 FEAT-OB-IMPORT); vi phạm own D2 spirit (registry §1.1 "đổi semantics → cấp mã mới"). Clean namespace separation `ERR-AP-*` từ inventory-namespaced codes.

**Threshold để re-evaluate (Phase 2 trigger):**
- Khi RECEIPT-V2 / DELIVERY-V2 / PRC kick-off → flip 2 events sang ACTIVE (wire outbox), audit downstream caching strategy có cần switch sang event-driven cache invalidation hay tiếp tục REST polling.
- Khi BA fix frontmatter chính thức → cập nhật BR cross-boundary rules (CB-AP-001 re-orient từ "gf-inventory own" → "gf-accounting own"); reclassify error code namespace (D2 follow-up — propose `ERR-ACC-*` hoặc giữ ERR-INV-* để giữ stability).
- Khi PRC slice (5 FEAT-PRC-*) tới — đánh giá có nên cùng land trên `gf-accounting` (PRC = price calc = accounting concept).

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **A1. AP master ở `gf-inventory`** (theo frontmatter ban đầu của BA) | Cùng boundary với consumer chính (RECEIPT-V2/DELIVERY-V2/OB/PRC); colocation reduce REST hop cho lock-check internal. | Mâu thuẫn bản chất nghiệp vụ (kỳ kế toán ≠ data kho); chia rẽ accounting subdomain (Insurance Settlement đã ở gf-accounting per ADR-014); tăng surface area gf-inventory; precedent xấu khi future PRC tới. | **Rejected** per Delivery Authority correction 2026-06-23. Tracking file `arch-design-inventory-v2-answers-1.md` Q4 SUPERSEDED note ghi nhận. |
| **A2. Reshape settlement_records hoặc tạo polymorphic table** | Tận dụng audit infra hiện hữu; ít table mới. | Aggregate trộn lẫn (settlement + period là 2 nghiệp vụ độc lập); break BR-AP-002 (settlement có code, period không); index/query pattern khác nhau hoàn toàn. | **Rejected** — vi phạm aggregate boundary; ADR-014 precedent (insurance dùng new tables) khẳng định pattern "additive per aggregate". |
| **B1. Implement event publish ACTIVE trong batch** | Future consumers có ngay contract operational. | KHÔNG có consumer thực sự (RECEIPT-V2/DELIVERY-V2/PRC chưa build); wire outbox + invariant test cho event KHÔNG ai consume = waste + drift risk; vi phạm "no consumer no publish" precedent (events v7 đã revoke 4 insurance events vì cùng lý do). | **Rejected** — PROPOSED status đủ để khóa contract sớm, ACTIVE flip = future wave responsibility. |
| **B2. KHÔNG declare event contract** (chỉ REST lock-check) | Đơn giản nhất; ít artifact maintain. | Future RECEIPT-V2/DELIVERY-V2/PRC sẽ cần retro-fit contract; risk drift giữa các consumer; bỏ lỡ cơ hội khóa naming convention sớm (topic/MessageGroup/partition key/envelope). | **Rejected** — declare PROPOSED là compromise giữa overhead (B1) và drift risk (B2). PL4 decision đã chốt pattern này cho prior round. |
| **C1. Cross-boundary projection / CQRS** (gf-inventory mirror AP qua Kafka projection) | Zero REST hop for lock-check; cache built-in qua consumer projection. | Eventual consistency window không acceptable cho lock-check (user UX cần authoritative response < 100ms; projection lag có thể vài giây); double source-of-truth; vi phạm "projection not master" Critical Rule #7 pattern. | **Rejected** — ADR-015 debt-summary precedent (REST cache > projection) áp dụng tương tự. |
| **D1. Tạo topic mới `AC-DEV-ACCOUNTING-PERIOD-EVENTS`** | Consumer scoping rõ ràng (RECEIPT-V2/DELIVERY-V2 chỉ subscribe AP). | Proliferate topics (gf-accounting hiện 1 topic đăng ký, currently empty); không precedent cho sub-domain topic split trong 14 boundary hiện hữu. | **Rejected** — reuse `AC-DEV-ACCOUNTING-EVENTS` conform `AC-DEV-{DOMAIN}-EVENTS` pattern (DOMAIN=ACCOUNTING). Future insurance events có thể join cùng topic. |
| **D2. Đổi error code namespace sang `ERR-ACC-*`** | Domain alignment đẹp (gf-accounting boundary owns AP). | `ERR-INV-024` đã được dùng cross-boundary bởi RECEIPT-V2/DELIVERY-V2/OB (registry v9 line 122/532); rename cascade qua nhiều BR file; vi phạm registry stability (ERROR-CODE-REGISTRY §1.1: "đổi semantics → cấp mã mới, deprecate mã cũ"). | **Rejected** trong batch này — giữ `ERR-INV-021..026` verbatim; flag open_question để BA + Architect (co-owner registry) reclassify post-batch. |
| **B3. `ddl-auto=update` cho AP entity** (previous v4 canonical) | Đồng nhất với 5 baseline + 3 insurance table trên cùng `gf-accounting` boundary per Gotcha #5. Ít file maintain. | KHÔNG có audit trail explicit cho schema evolution (Hibernate auto-generate opaque); rollback khó (không có migration script); không consistency với `gf-inventory` Flyway pattern (W03/W04 Inventory V2 tables đã dùng Flyway V{N+1} additive established). | **Rejected** v5 per user quannn NC-W04-EP-AP-002 chốt 2026-07-08 — chuyển sang Flyway `V{N+1}__accounting_v1_accounting_period.sql`. Trade-off cross-entity inconsistency chấp nhận (5+3 tables giữ ddl-auto=update per Gotcha #5). |

## Consequences

**Positive:**
- Boundary alignment với nature of business — accounting concepts (settlement + insurance + period) consolidate trên `gf-accounting`, củng cố ADR-014 precedent.
- Additive entity strategy → zero risk break existing 5 baseline tables hoặc 3 design insurance tables (5+3 tables giữ `ddl-auto=update` per Gotcha #5).
- **Flyway migration cho AP entity (v5 update per user quannn NC-W04-EP-AP-002 2026-07-08)**: explicit control + audit trail rõ ràng cho AP schema evolution; consistency với `gf-inventory` Flyway V{N+1} additive pattern (established qua W03/W04); rollback dễ hơn (migration reversal explicit).
- REST lock-check ACTIVE đủ functional cho future consumers integrate ngay khi build; advisory pattern tách bạch concern (lock-check = UX hint, commit guard = authoritative).
- PROPOSED event contract khóa naming + envelope convention sớm — future consumers (RECEIPT-V2/DELIVERY-V2/PRC) không cần retro-fit; outbox infra `gf-accounting` đã sẵn sàng wire khi flip.
- Web GMS only scope reduce surface area (mobile defer per UX-FLOW).
- 7 REST endpoints under `/api/v2/*` prefix mới — coexist với baseline `/api/v1/*` (settlement); không break contract hiện hữu.

**Negative:**
- **Error code namespace mismatch** (`ERR-INV-*` trên gf-accounting boundary). **Mitigation**: flag open_question cho BA + Architect; chấp nhận cosmetic mismatch trong batch để giữ registry stability (`ERR-INV-024` đã cross-boundary).
- **BA frontmatter mismatch** (`boundary: gf-inventory` trên EP + 5 FEAT + BR file). **Mitigation**: CLAUDE override + Tracking file documenting bind gf-accounting; BA tự fix khi reclassify chính thức.
- **Cross-entity migration inconsistency trên `gf-accounting` boundary (v5 add)**: AP entity dùng Flyway `V{N+1}__accounting_v1_accounting_period.sql` (per user quannn NC-W04-EP-AP-002 2026-07-08) trong khi 5 baseline tables + 3 insurance design tables vẫn dùng `ddl-auto=update` per Gotcha #5. **Mitigation**: documented explicit tại §Decision B + §Alternatives B3; nếu team quyết định consolidate → separate CR migrate 5+3 tables sang Flyway hoặc revert AP về ddl-auto=update (large scope, ngoài W04). Neutral: nếu consolidate về ddl-auto=update sau, có thể migrate qua initial baseline snapshot script + drop Flyway file (deferred).
- **PROPOSED events không publish trong batch** → DEV implementation phải skip event wiring; risk drift nếu future wave bỏ quên flip ACTIVE. **Mitigation**: ADR ghi rõ "ACTIVE flip = future wave responsibility"; events file §5 Forbidden thêm rule cấm breaking change PROPOSED contract; flag re-evaluate threshold trong section "Threshold để re-evaluate".
- **Cross-boundary REST hop** cho lock-check (gf-inventory backend → gf-accounting REST) → thêm 1 network hop vs in-process. **Mitigation**: 30s LRU cache at caller; advisory only nên latency budget rộng; downstream commit guard re-check authoritative.

**Risks:**
- **Tree query CTE recursive performance** ≥ 500 periods/tenant. **Mitigation**: defensive cap HTTP 413 ở backend + BFF echo (PL5); index `idx_ap_parent` + `idx_ap_tenant_dates`.
- **Sibling overlap check race condition** (2 POST concurrent). **Mitigation**: `SELECT ... FOR UPDATE` on parent_id row + overlap check inside transaction.
- **Stale cache 30s** cause user write to just-closed period. **Mitigation**: authoritative re-check at downstream backend commit (advisory-only pattern); UX hiển thị clear "Kỳ vừa được đóng — vui lòng tải lại".
- **PROPOSED contract breaking change** trước ACTIVE flip break future consumers. **Mitigation**: events file §5 Forbidden bullet "breaking change PROPOSED = MAJOR version + deprecate"; ADR-013 backward-compat áp dụng cùng tier.
- **BA fix frontmatter sau batch** → CB-AP-001 re-orient sẽ gây cập nhật cascade trong BR file. **Mitigation**: changes là semantic preserving (boundary string thay đổi, không thay đổi rule); BR change log entry mới đủ.

**Trade-off accept:** Chấp nhận **cosmetic mismatch error code namespace** (ERR-INV-* trên gf-accounting) + **BA frontmatter chưa sync** đổi lấy **registry stability** (ERR-INV-024 đã cross-boundary, rename = cascade cost cao) + **batch tiến độ đúng deadline** (boundary correction chỉ là tái phân loại, không thay đổi business logic). Tracking file + open_questions[] đảm bảo audit trail cho 2 follow-up này.

**Test verification (DEV Stage — future wave):**
- Test 1: Tạo kỳ năm + `autoGenerateChildren=true` → atomic 1 năm + 4 quý + 12 tháng; rollback all on partial failure (simulate DB connection drop mid-tx).
- Test 2: 2 POST đồng thời cùng parent + ngày chồng lấn → 1 success + 1 reject `ERR-INV-023` (verify `SELECT FOR UPDATE` lock).
- Test 3: AP-EDIT đổi status OPEN → CLOSED → AP-EDIT đổi lại CLOSED → OPEN — verify đối xứng (BR-AP-011); status transitions tracked via standard `updated_at`/`updated_by` audit pair (no separate close/reopen cols — close/reopen = special case of status update).
- Test 4: DELETE kỳ có kỳ con → `ERR-INV-026`; DELETE kỳ CLOSED → `ERR-INV-025`; DELETE kỳ có phiếu trong khoảng ngày (simulate via mock) → `ERR-INV-025`.
- Test 5: POST `/tree` body `{year: 2026}` trả > 500 nodes → backend HTTP 413; BFF echo 413 với hint redirect search paginated. + Test 5b: POST `/tree` body `{year: 2026, name: "Quý 2"}` → tree subset chứa matching node + ancestor path + descendant subtree (LIKE-unaccent trên `accounting_period.name`).
- Test 6: GET `/protected/v1/accounting-periods/lock-check?date=2026-06-15` (date trong CLOSED period) → `{locked: true, …}` < 100ms; cùng query 2 lần liên tiếp → cache hit lần 2.
- Test 7: Update kỳ với immutable field (vd `startDate`) → reject `400 ERR-AP-001` (NEW namespace per R2 F1 fix; pending BA register — OQ7).

## References

- [`Architecture/hld/gf-accounting-HLD.md`](../hld/gf-accounting-HLD.md) §10 — Accounting Period subsystem
- [`Architecture/api/gf-accounting-api.md`](../api/gf-accounting-api.md) §4 — Accounting Period endpoints
- [`Architecture/data/gf-accounting-data-model.md`](../data/gf-accounting-data-model.md) §6 — `accounting_period` entity
- [`Architecture/events/gf-accounting-events.md`](../events/gf-accounting-events.md) §2 — `AccountingPeriodClosed`/`Reopened` PROPOSED
- [`Architecture/integrations/INTEG-EXT-gf-accounting.md`](../integrations/INTEG-EXT-gf-accounting.md) §6 — lock-check consumer pattern
- [`Architecture/api/agg-garage-graph-graphql.md`](../api/agg-garage-graph-graphql.md) §3e — BFF AP module
- [`Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md`](../integrations/INTEG-FE-garage-web-agg-garage-graph.md) §3.6b — UI→GraphQL→REST mapping
- [`Architecture/events/_CONVENTIONS.md`](../events/_CONVENTIONS.md) §2 (topic), §3 (envelope), §4 (partition key), §11 (per-boundary inventory)
- [`Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) §3.1 — state machine
- [`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.1 — BR-AP-001..016 + BR-AP-CMN-001/002 + CB-AP-001
- [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) — Web GMS only scope
- [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../Product/error-code/ERROR-CODE-REGISTRY.md) — ERR-INV-021..026 (D2 keep verbatim); **NEW namespace `ERR-AP-*` proposed cho Accounting Period domain on gf-accounting** (placeholder `ERR-AP-001` cho BR-AP-016 immutable-field — pending BA register, OQ7 per R2 F1 fix)
- [`Tracking/arch-design-inventory-v2-answers-1.md`](../../Tracking/arch-design-inventory-v2-answers-1.md) — Q4 SUPERSEDED note (boundary correction history)
- Related ADRs: ADR-004 (Kafka outbox/inbox), ADR-005 (Temporal limit 5 services), ADR-006 (ddl-auto exception cho 4 services incl. gf-accounting), ADR-009 (scalar FK only cross-boundary + self-FK OK), ADR-013 (backward-compat additive only same major), ADR-014 (Insurance Settlement reuse gf-accounting — precedent), ADR-015 (debt-summary REST > CQRS — precedent), ADR-017 (Inventory V2 catalog additive aggregates — pattern precedent), ADR-018 (bulk-import row cap defensive — PL5 precedent)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 5 | Architecture Authority (per user quannn feedback) | **Update §Decision B — Migration strategy chuyển từ `ddl-auto=update` sang Flyway `V{N+1}__accounting_v1_accounting_period.sql`** per user quannn 2026-07-08 chốt NC-W04-EP-AP-002 ("chốt sẽ dùng V{N+1}__accounting_v1_accounting_period.sql" + "sửa cả ADR-019"). Trước v4: AP entity dùng `ddl-auto=update` đồng nhất Gotcha #5. Sau v5: AP entity dùng Flyway migration file additive per user override; 5 baseline table + 3 insurance design table trên cùng `gf-accounting` boundary vẫn giữ `ddl-auto=update` per Gotcha #5 → cross-entity inconsistency documented as trade-off. Cascade 3 sub-edits ADR-019: **(1) §Decision B** — rewrite bullet "Sinh schema qua `ddl-auto=update` — KHÔNG Flyway DDL (Gotcha #5, đồng nhất 3 design insurance tables)" → "**Sinh schema qua Flyway migration `V{N+1}__accounting_v1_accounting_period.sql`** — v5 override (user quannn 2026-07-08 chốt NC-W04-EP-AP-002) thay cho `ddl-auto=update` mặc định Gotcha #5. File chứa DDL create table 16 cols + 5 indexes + 2 CHECK constraints. Rationale: explicit control + audit trail + consistency với `gf-inventory` Flyway pattern established (W03/W04 additive migrations) + rollback dễ hơn". Update column count 15→16 (v10 add `year INT NOT NULL` per user); update index `idx_ap_tenant_year` từ expression `EXTRACT(YEAR FROM start_date)` → regular column `(tenant_id, year)` (v10 change); add CHECK `year = EXTRACT(YEAR FROM start_date)` consistency guard (v10 add). **(2) §Alternatives Considered** — add row B3 "**`ddl-auto=update` cho AP entity** (previous v4 canonical)": Pros đồng nhất với 5 baseline + 3 insurance table trên cùng boundary per Gotcha #5; ít file maintain. Cons KHÔNG có audit trail explicit cho schema evolution (Hibernate auto-generate opaque); rollback khó không có migration script; không consistency với `gf-inventory` Flyway pattern established. **Rejected** v5 per user quannn 2026-07-08. **(3) §Consequences** — reword Positive bullet "Additive entity strategy → zero risk break existing 5 baseline tables hoặc 3 design insurance tables; ddl-auto=update consistency với pattern hiện hữu (Gotcha #5)" → "Additive entity strategy → zero risk break existing 5 baseline tables hoặc 3 design insurance tables (5+3 tables giữ `ddl-auto=update` per Gotcha #5)"; add Positive bullet mới "Flyway migration cho AP entity (v5 update per user quannn NC-W04-EP-AP-002 2026-07-08): explicit control + audit trail + consistency với gf-inventory Flyway pattern + rollback dễ hơn". Add Negative bullet "**Cross-entity migration inconsistency trên `gf-accounting` boundary (v5 add)**: AP entity Flyway trong khi 5 baseline + 3 insurance tables ddl-auto=update. Mitigation documented tại §Decision B + §Alternatives B3; neutral option consolidate về ddl-auto=update sau (deferred, separate CR). **KHÔNG đụng**: (1) §Status (vẫn ACCEPTED); (2) §Context; (3) §Decision A boundary ownership; (4) §Decision C REST + Kafka cross-boundary; (5) §Decision D REST API design; (6) §Test verification (Test 1-6 vẫn valid); (7) §References; (8) Change Log entries lịch sử (v1/v2/v3/v4 giữ nguyên audit trail). **CLAUDE.md §7 Gotcha #5** KHÔNG đụng — default statement "gf-accounting cũng dùng ddl-auto=update" giữ nguyên áp cho 5 baseline + 3 insurance table; ADR-019 v5 là exception documented tại canonical ADR level (không cần edit CLAUDE.md broad scope). Cascade pair với `PKG-W04-inventory-period-opening-balance.md v10→v11` (§2.2.1 Entity migration strategy align + §4.1 DEV task + §5.1 Deliverable) + `_wave-overview.md` v2→v3 (§7.1 NC-W04-EP-AP-002 annotation update Flyway per ADR-019 v5 canonical). Rationale documented per user's decision — cross-entity inconsistency chấp nhận trade-off cho AP-specific control. Follow-up: nếu team consolidate `gf-accounting` migration strategy → separate CR ADR-019 update hoặc migrate 5+3 tables sang Flyway (large scope, ngoài W04). v4 → v5. |
| 2026-06-24 | 1 | Architecture Authority (agent-arch-author + Delivery Authority correction) | Initial ADR — AP slice (5 FEAT-AP-*) on `gf-accounting` boundary per Delivery Authority correction 2026-06-23. 4 decisions A (ownership = gf-accounting), B (additive `accounting_period` entity, ddl-auto=update, no Flyway), C (REST lock-check ACTIVE + 2 events PROPOSED topic `AC-DEV-ACCOUNTING-EVENTS`), D (`/api/v2/accounting-periods/*` 7 endpoints, error codes ERR-INV-021..026 verbatim per D2). 7 alternatives considered (A1/A2 boundary, B1/B2 publish status, C1 projection, D1 topic split, D2 namespace rename). Note: ADR-019 slot previously used cho AP-on-gf-inventory version (deleted round 4); slot reuse cho gf-accounting version. |
| 2026-06-24 | 4 | Architecture Authority (Delivery Authority inline fix) | **R4 tree endpoint GET→POST + name search (per Delivery Authority feedback 2026-06-24)**: Test 5 updated — `GET /tree?year=` → `POST /tree` body `{year}`; thêm Test 5b cho `name` LIKE-unaccent search semantics (matching node + ancestor path + descendant subtree). Sync gf-accounting-api v14 + agg-garage-graph-graphql v7.9 + INTEG-FE v9 + HLD v10. v3 → v4. |
| 2026-06-24 | 3 | Architecture Authority (Delivery Authority inline fix) | **R3 audit-col strip (per Delivery Authority feedback 2026-06-24)**: Test 3 — remove "audit cols `closed_at/by` + `reopened_at/by` set đúng"; replace với "status transitions tracked via standard `updated_at`/`updated_by` audit pair". Rationale: close/reopen = special case of status update, không cần separate audit cols. Sync với gf-accounting-data-model v9 (entity strip 4 cols), gf-accounting-api v13 (response sample strip), gf-accounting-events v9 (payload strip — derive `occurredAt`/actor từ envelope), gf-accounting-HLD v9, agg-garage-graph-graphql v7.8 (SDL strip). v2 → v3. |
| 2026-06-24 | 2 | Architecture Authority (agent-arch-author R2 surgical fix) | **R2 surgical fix F1 + F2 (Round 2 arch-review)**: §D2 — (F1) immutable-field violation switch `ERR-INV-032` (collide với registry:130 BR-OB-008 FEAT-OB-IMPORT) → **NEW namespace `ERR-AP-001`** dedicated cho Accounting Period domain trên gf-accounting boundary (pending BA register — OQ7 new); clean separation `ERR-AP-*` từ inventory-namespaced codes; align với own ADR-019 §D2 spirit "đổi semantics → cấp mã mới". (F2) tree-cap exceeded strip `ERR-INV-027` zombie revival (registry:125 deprecated BR-PRC-007 HTTP 500); backend trả plain `HTTP 413` no registry code; BFF translates qua `GMS.agg-garage-graph.ACCOUNTING_PERIOD_TREE_OVERSIZE` (BFF-only single point per `agg-garage-graph-graphql.md §3e.3`). Test 7 updated. References §5 add `ERR-AP-*` proposed namespace note. v1 → v2. |
