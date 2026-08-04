---
type: execution
artifact_kind: master-execution-plan
status: ACTIVE
version: 3
tier: T3
owner_authority: Delivery Authority
last_reviewed: "2026-06-03"
---

# Master Execution Plan — Garage

> Governance source-of-truth cho execution topology, exit-criteria policy, retry/rollback strategy, parallel rules, escalation, và KPIs.
>
> **Scope split**: File này = **policy/strategy** (cái gì, ngưỡng bao nhiêu, ai own). [`PROTOCOL.md`](PROTOCOL.md) = **runtime/tactical** (đọc file gì, chạy slash command nào). Đừng đặt lệnh runtime vào file này; đừng đặt threshold/KPI vào PROTOCOL.md.
>
> **Active scope**: TD P0 Remediation (3 waves W01-W03) — xem [`Plan/WAVE-SEQUENCE.md`](../Plan/WAVE-SEQUENCE.md). 15 historical feature waves đã production (xem [`CLAUDE.md §6.2`](../CLAUDE.md)) — KHÔNG re-execute.

---

## 1. Execution Topology

```
                                          ┌─────────────────────┐
                                          │   FIX_GROUP         │
                                          │ (conditional)       │
                                          └──────────┬──────────┘
                                                     ▲
                                                     │ P1/P2 bug
                                                     │ REVIEW critical
                                                     │ QC reject
                                                     │
PLANNING → DEV → REVIEW → TEST_PLANNING → TEST_EXECUTION → QC → RELEASE → WAVE_END
    │       │      │            │                │           │      │           │
    ▼       ▼      ▼            ▼                ▼           ▼      ▼           ▼
  PKG.md  Code   Review    Test cases       Test report   Sign   Actuals    KG +
  Agent   Tests  Report   (TC registry)     Bug filings   off    + smoke    MEMORY
  Wave    +KG    Findings                                              Hard gate
                                                                       check
```

10-stage pipeline khớp [`PROTOCOL.md`](PROTOCOL.md) (§0 Pre-flight + 8 functional stages + §FALLBACK = blocker/CR/rollback).

### 1.1 Stage Owners

| Stage | Primary Owner | Approver | Artifacts Produced |
|---|---|---|---|
| PLANNING | Delivery Authority | Architecture Authority | PKG-W{NN}-{tier}-p0.md, agent wave block populated, `STATE.features_in_flight` set |
| DEV | DEV agent per boundary (in service repo per Rule #11) | Delivery Authority | Source code (per-service repos), migrations, KG update, 3-in-1 version bump |
| REVIEW | REVIEW_GROUP (`agent-review-backend` / `agent-review-garage-web` / `agent-review-garage-mobile`) | Architecture Authority | Review report, findings, boundary scan result |
| TEST_PLANNING | TEST_GROUP (api/e2e/ui/isolation/performance/security per PKG §4) | QA Authority | TC registry (`Tracking/TEST-CASE-REGISTRY.md` TBD), coverage map |
| TEST_EXECUTION | TEST_GROUP (same agents) | QA Authority | Test report, bug filings (`Tracking/WAVE{NN}/BUGS.md` TBD) |
| QC | QA Authority (manual) | Business Authority (PO demo) | `STATE.qc.signed_by` populated, demo verification |
| RELEASE | Delivery Authority | All Authorities | `Tracking/td-w{NN}-{tier}-actuals.md` TBD, handoff doc, staging smoke pass |
| WAVE_END | Delivery Authority | — | KG consolidated, `MEMORY.md` wave summary, hard gate verified |

---

## 2. Stage Exit Criteria

> **Per-stage runtime** (slash commands, docs to load, exit scripts) — xem [`PROTOCOL.md §<stage>`](PROTOCOL.md).
> §2 này là **POLICY source-of-truth** cho threshold/criteria. PROTOCOL.md tham chiếu các con số tại đây; mâu thuẫn → file này thắng (PROTOCOL.md bump version để align).

### 2.1 PLANNING → DEV

| # | Criterion | Verification |
|---|---|---|
| 1 | Work package created | `Execution/work-packages/PKG-W{NN}.md` đầy đủ §1-§9 |
| 2 | Agent wave block populated | `/fill-wave-assignment W{NN}` đã chạy idempotent; mỗi agent file có wave block (`{tier}/{boundary}/.claude/agents/agent-dev-{b}.md` per Rule #11) |
| 3 | STATE wave + features set | `STATE.wave = "NN"`, `STATE.stage = "PLANNING"`, `STATE.features_in_flight = [...]` (từ PKG §1) |
| 4 | Entry criteria verified | PKG §3 Entry Criteria 100% PASS (boundary access, infra readiness, dependencies, migration window) |
| 5 | No HIGH blockers | `python3 scripts/state.py get blockers` returns 0 entries với severity HIGH |
| 6 | API contracts ratified (cross-boundary touching) | `Architecture/integration/INTEG-*-{boundary}.md` files có `ratified_by` + `ratified_at` ≠ TBD cho mọi contract scope wave touches |
| 7 | KG stubbed cho new boundaries | `Execution/knowledge-graphs/{boundary}.knowledge-graph.yaml` exists cho mỗi boundary mới vào wave (no-op nếu TD P0 — không có boundary mới) |

### 2.2 DEV → REVIEW

> Per-tier build/lint/test commands — xem [`AGENTS.md §6 Common Commands`](../AGENTS.md). Threshold dưới đây = source-of-truth.

| # | Criterion | Verification |
|---|---|---|
| 1 | Compile + lint pass (Java BE) | `./gradlew build checkstyleMain` exit 0 — áp dụng 14 Java boundaries |
| 2 | Compile + typecheck + lint pass (Node BFF) | `npm run build && npm run typecheck && npm run lint` exit 0 — áp dụng 2 BFF boundaries |
| 3 | Build + lint pass (React web) | `npm run build && npm run lint` exit 0 — `garage-web` |
| 4 | Build + analyze pass (Flutter mobile) | `flutter build apk --debug && flutter analyze` exit 0 — `garage-mobile` |
| 5 | Unit test coverage met | Java BE ≥ 80% (JaCoCo) · Node BFF ≥ 80% (Vitest) · React web ≥ 60% (Vitest) · Flutter mobile ≥ 60% (TBD threshold per PROTOCOL.md §DEV) |
| 6 | Boundary scan clean | `bash scripts/hooks/check-boundary.sh` exit 0 — mọi file thay đổi ∈ `STATE.owned_paths`; 0 violation |
| 7 | Pre-Edit Recognition logged (FM-017) | Mọi non-additive edit có entry trong `STATE.wave_scope.modify_allowlist` với `approved_by` ≠ null (qua `/scope-extend`) |
| 8 | 3-in-1 version bump done | Mọi file thay đổi có: `version` bumped + `last_reviewed` updated + Change Log entry appended (per CLAUDE.md §3.2 Rule #9) |
| 9 | All AC / PKG tasks ACK'd | Mỗi feature trong `STATE.features_in_flight` có AC pass + PKG §2 Technical Scope tasks completed |
| 10 | KG updated | Entities/events/permissions mới reflect trong `Execution/knowledge-graphs/{boundary}.knowledge-graph.yaml`; gotchas mới appended |
| 11 | No hardcoded secrets / URLs / magic numbers | Grep check pass cho `password`, `secret`, `api_key`, hardcoded backend URLs (per CLAUDE.md §5.1) |

### 2.3 REVIEW → TEST_PLANNING

| # | Criterion | Verification |
|---|---|---|
| 1 | Architecture compliance = PASS | HLD alignment, pattern adherence (Hexagonal/Clean BE, DataLoader+Auth-context BFF, Pages/Components/Store React, BLoC Flutter) — signed bởi Architecture Authority |
| 2 | Boundary isolation = PASS | 0 cross-boundary writes; 0 direct DB access; 0 `@ManyToOne` cross-boundary (ADR-009); JPA scalar FK only |
| 3 | Security check = PASS | No credential exposure; input validation; auth/authz enforced; no PII in logs/events; no JWT/card token in Kafka payload (per CLAUDE.md §5.1) |
| 4 | Backward compat = PASS | API additive only · Migration evolution rule (V{N+1}, no rewrite per CLAUDE.md §7.9) · GraphQL schema additive-only · Outbox/inbox not bypassed (ADR-004) |
| 5 | P1 findings = 0 | Review report shows zero P1; P2 findings triaged với owner + ETA logged in `Tracking/DEBT-REGISTRY.md` (TBD) |
| 6 | Review report filed | Report in `Execution/handoffs/REVIEW-W{NN}-{boundary}.md` (or similar per `handoffs/` convention) |
| 7 | Integration contract re-ratification | Nếu wave touch `Architecture/integration/INTEG-*-{boundary}.md` → bilateral re-ratification done |

### 2.4 TEST_PLANNING → TEST_EXECUTION

| # | Criterion | Verification |
|---|---|---|
| 1 | TCs generated from ACs | Mỗi AC `AC-FEAT-NNN-MM` (hoặc PKG §2 task cho TD waves) có ≥1 TC mapped |
| 2 | Tại/Khi/Thì structure enforced | Mọi TC viết theo CLAUDE.md §3.2 Rule #10 — testable, không vague |
| 3 | API TCs cover endpoints | Mỗi endpoint trong wave scope có ≥1 happy path + ≥2 sad path TCs (vd 401, 403, 409, 422) |
| 4 | Edge case TCs | Concurrent write, tenant isolation, race conditions covered per code diff |
| 5 | TCs registered | `Tracking/TEST-CASE-REGISTRY.md` (TBD) HOẶC per-wave fallback `Tracking/WAVE{NN}/test-cases.md` đầy đủ TC ID, title, AC ref, type, steps, expected |
| 6 | QA Authority signed | QA Authority đã review TC list + confirm coverage adequate |

### 2.5 TEST_EXECUTION → QC

| # | Criterion | Verification |
|---|---|---|
| 1 | All TCs executed | 100% TCs trong wave registry có status PASS / FAIL / BLOCKED / SKIP (không NEW) |
| 2 | Pass rate ≥ 80% | Per PROTOCOL.md §TEST_EXECUTION threshold  — phản ánh TD P0 cross-cutting nature) |
| 3 | 0 P1, 0 P2 unresolved | `Tracking/WAVE{NN}/BUGS.md` (TBD) zero P1/P2 OPEN; P3/P4 tracked |
| 4 | Regression 100% pass | Previous wave's TCs (W01 cho W02; W01+W02 cho W03) re-run all PASS |
| 5 | Performance SLA met (nếu wave scope) | TD P0 = N/A (no perf scope per WAVE-SEQUENCE.md §3); future feature waves enforce per `Architecture/SYSTEM-ARCHITECTURE.md` thresholds |
| 6 | TC results updated | Registry updated với PASS/FAIL/BLOCKED per TC; bug links cho FAIL |

### 2.6 QC → RELEASE

| # | Criterion | Verification |
|---|---|---|
| 1 | Manual acceptance pass | QA Authority sign-off on all features in wave |
| 2 | Demo target verified | PKG §6 Demo Target items 100% reproducible trên staging (vd "2 concurrent PUT → 1×200 + 1×409 CONFLICT_VERSION" cho W01) |
| 3 | QC sign-off captured | `STATE.qc.signed_by != null` + `STATE.qc.signed_at != null` — **human gate, không có script bypass** |
| 4 | Bug ledger clean | 0 P0/P1/P2 OPEN trong `Tracking/WAVE{NN}/BUGS.md` |
| 5 | Rollback plan ready | Package + wave rollback procedure documented (xem §4); on-call notified cho W01 (Flyway migration deploy) |

### 2.7 RELEASE → WAVE_END

| # | Criterion | Verification |
|---|---|---|
| 1 | Per-service repo commits done | Service code merged into respective service repos (cross-repo nature per Rule #11); design repo có commits cho artifacts |
| 2 | Staging smoke pass | Live curl / Playwright / integration smoke suite green per demo target |
| 3 | Actuals doc filled | `Tracking/td-w{NN}-{tier}-actuals.md` (TBD format) — duration, retries, findings, TC pass rate, bugs, conflict rate |
| 4 | Handoff doc filed | `Execution/handoffs/HANDOFF-W{NN}-to-W{NN+1}.md` đầy đủ; signed by Delivery Authority |
| 5 | Monitoring TBD | Currently local Docker Compose only — production AWS deploy + alerts/dashboards là parallel track (out of TD P0 scope) |

### 2.8 WAVE_END (added vs template — garage-specific)

| # | Criterion | Verification |
|---|---|---|
| 1 | KG consolidated | Mỗi boundary tham gia wave có KG final consolidation (entities + gotchas accumulated) |
| 2 | MEMORY.md updated | Wave summary appended (lessons learned, decisions, gotchas) ở [`MEMORY.md`](../MEMORY.md) |
| 3 | STATE reset | `STATE.wave` → next, `stage = "PLANNING"` hoặc `"BOOTSTRAP"` (last wave), `features_in_flight = []`, `qc.signed_by = null`, `wave_scope.modify_allowlist = []`, `owned_paths = []` |
| 4 | **Hard gate verified** | Per WAVE-SEQUENCE.md §1 graph — cụ thể cho từng transition: W01→W02 (CORS whitelist deployed + `@Version` migrations applied + V2 deprecation headers live); W02→W03 (Web token flow stable staging + INTEG-FE auth contract live + Provider resilience pattern doc final); W03→end TD P0 (Mobile secure storage migration verified + ADR-014 published) |

---

## 3. Retry Policy

### 3.1 Retry Limits

| Stage | Max Retries | Timebox per retry | Escalation Trigger |
|---|---|---|---|
| DEV | 3 (per PROTOCOL.md §FALLBACK) | ~4h (TD P0 wave duration 2-3d, allow 3 cycles) | After retry 3 → Delivery Authority decides re-scope / split / defer |
| REVIEW | 1 (fix + re-review) | ~2h | After retry 1 → Architecture Authority |
| TEST_EXECUTION | 3 | ~2h | After retry 3 → QA Authority |
| QC | 1 (re-demo) | ~4h | After retry 1 → Business Authority |

### 3.2 Escalation Path

Sau N retries fail:

1. Delivery Authority review root cause + retry log trong `Execution/handoffs/` 
2. Decision options:
   - **(a) Re-scope** wave (reduce AC count)
   - **(b) Add resource** (additional dev / pair-program)
   - **(c) Split wave** (precedent: W01 → W01a + W01b)
   - **(d) Defer feature** to next wave / backlog
3. Document decision trong `Tracking/CHANGE-REQUESTS.md` (TBD) với severity MAJOR (per [`DOC-DEPENDENCY-MAP.md §2.2`](../DOC-DEPENDENCY-MAP.md))
4. Update [`Plan/WAVE-SEQUENCE.md`](../Plan/WAVE-SEQUENCE.md) wave detail + change log

---

## 4. Rollback Strategy

### 4.1 Package-level (1 boundary trong wave)

Trigger: 1 boundary có unresolvable P1/P2 sau retries exhausted.

1. Identify affected boundary từ bug filing + STATE.boundary_active history
2. `git revert` các commits của boundary's DEV agent trong wave — **trong per-service repo** (cross-repo per Rule #11)
3. Re-run regression tests cho dependent boundaries (cross-boundary integration check)
4. KG rollback cho boundary đó (revert tới pre-wave snapshot)
5. Document trong `Tracking/CHANGE-REQUESTS.md` (TBD) với CR severity MODERATE+

### 4.2 Wave-level (toàn bộ wave)

Trigger: Cross-boundary integration failure sau 3 retries · Security/compliance violation · Audit-driven pivot (precedent: 2026-05-22 17-wave revert → TD P0 adoption, commits `73ea814` + `a6dc2e9`).

1. `git revert` toàn bộ commits của wave (per-service repos + design repo)
2. KG reset về pre-wave state cho mọi boundary trong wave scope
3. STATE reset: `wave = <prev>`, `stage = "DONE"` (prev wave) hoặc `"BOOTSTRAP"`
4. `bash scripts/sync-docs-to-services.sh reset W{NN} all` — clear wave-scoped `docs/` ở per-service repos
5. Close all bugs/CRs liên quan wave
6. Post-mortem trong `Execution/handoffs/POST-MORTEM-W{NN}.md`
7. Re-plan với adjusted scope qua CR MAJOR

### 4.3 Cross-wave (extreme)

Trigger: Data corruption trong staging/production · Catastrophic security finding affecting multiple deployed waves.

1. Stop-the-line — pause all waves
2. DB restore từ pre-incident backup (per-service DBs riêng)
3. Incident response — Security Lead + Architecture Authority + Delivery Authority co-own
4. Post-mortem + ADR cho lessons learned
5. Re-validate previous wave's exit criteria before resume

### 4.4 Rollback Triggers

| Trigger | Rollback Level | Owner |
|---|---|---|
| 1 boundary có unresolvable P1 sau 3 retries | Package-level | Delivery Authority |
| Cross-boundary integration failure sau 3 retries | Wave-level | Delivery Authority + Architecture Authority |
| Security/compliance violation detected | Wave-level (immediate) | Security Lead + Delivery Authority |
| Data corruption staging/prod | Cross-wave (stop-the-line) | All Authorities |
| Cross-boundary contract violation (touched INTEG-* unauthorized) | Boundary-level revert + activate `agent-fix-{boundary}` | Architecture Authority |
| P0 bug at any test stage | Block stage transition (per PROTOCOL.md §TEST_EXECUTION + §QC) — no rollback, must fix in current wave | Delivery Authority |
| Audit-driven pivot (gap audit escalates) | Wave-level (CR MAJOR bypass weekly review per 2026-05-22 precedent) | Delivery Authority + Business Authority |

---

## 5. Parallel Execution Rules

### 5.1 Within-wave Parallelism (tier-parallel pattern)

Garage có 4 tech tiers — Backend (14 Java) + BFF (2 Node) + Frontend Web (1 React) + Mobile (1 Flutter). Khi wave có boundaries cross-tier, các DEV agents chạy song song với điều kiện:

| Precondition | Rule |
|---|---|
| API contract ratified | `Architecture/integration/INTEG-*-{boundary}.md` (singular path, 24 contracts) có `ratified_by` + `ratified_at` ≠ TBD trước khi tier-parallel start |
| KG stubbed | Mỗi boundary cross-tier có entry trong `Execution/knowledge-graphs/` |
| Boundary owned_paths disjoint | `STATE.owned_paths` per `/dev-start <boundary>` không overlap cross-tier (enforced bởi `check-boundary.sh`) |

> TD P0 specific: **KHÔNG vẽ day-by-day vertical-slice ASCII** vì TD P0 không phải feature vertical slice — TD = cross-cutting concerns (optimistic lock, CORS hardening, secure storage), không deliver new user journey.

### 5.2 Inter-wave Sequential (TD P0 hard gates)

W01 → W02 → W03 **strictly sequential**. Cấm start wave kế tiếp trước khi hard gate items verified per WAVE-SEQUENCE.md §1:

| Transition | Hard gate items |
|---|---|
| W01 → W02 | CORS whitelist deployed (`agg-garage-graph`) · `@Version` Flyway migrations applied (`gf-sales`, `gf-purchase`) · V2 deprecation headers live (`Deprecation: true`, `Sunset: <RFC1123>`) |
| W02 → W03 | Web token flow stable trên staging · INTEG-FE auth contract live + ratified (`Architecture/integration/INTEG-FE-auth-session.md`) · Provider resilience pattern doc final |
| W03 → end TD P0 | Mobile secure storage migration verified trên Android + iOS device thật · ADR-014 published |

### 5.3 Stage Parallelism

| Pattern | Rule |
|---|---|
| Sequential stages | DEV → REVIEW → TEST_PLANNING → TEST_EXECUTION → QC — **no overlap** |
| FIX_GROUP parallel | FIX agent runs parallel với current wave DEV nếu FIX scope ≠ current wave boundary (vd fix bug từ W01 trong khi W02 đang DEV cho different boundary) |
| Periodic TEST waves | WT-M / WT-F (isolation/perf/security) = exclusive test stage, no DEV activity allowed — N/A trong TD P0 scope per WAVE-SEQUENCE.md §3 |

### 5.4 Cross-wave Overlap

Wave N+1 PLANNING có thể start khi Wave N ở TEST_EXECUTION, với precondition:
- Hard gate items của Wave N → Wave N+1 đã có **visibility** (PR open / staging deploy in progress) — không phải "blind start"
- Wave N+1 work package draft (PKG-W{N+1}-*) có thể bắt đầu fill PLANNING sections
- KHÔNG được spawn DEV agent của Wave N+1 trước khi Wave N hit WAVE_END + hard gate verified


### 5.5 Conflict Resolution

Khi 2+ boundaries cần shared contract change:

1. Boundary owner đầu tiên tạo contract (`Architecture/integration/INTEG-*.md`)
2. Boundaries khác consume contract
3. Conflict → Architecture Authority arbitrate
4. Document resolution trong `Tracking/CHANGE-REQUESTS.md` (TBD)

---

## 6. Agent Lifecycle

```
spawn → read_context → execute → handoff → retire
  │         │            │          │
  │         │            │          └── Sign checklist, update KG, log transition
  │         │            └── Follow agent definition (wave block) + skills
  │         └── §2 Context reading order per CLAUDE.md
  └── Orchestrator selects per AGENT-REGISTRY + wave assignment
```

---

## 7. Escalation Contacts

| Role | Contact | Escalation Trigger | Response SLA |
|---|---|---|---|
| Architecture Authority | `{{TBD — fill khi authority list confirmed}}` | Architecture violation, ADR conflict, cross-boundary contract dispute, tech stack issue | 4h |
| Delivery Authority | `{{TBD}}` | Stage blocked > 24h, retry exhausted, wave re-scope, hard gate skip request | 2h |
| Business Authority | `{{TBD}}` | Scope change, AC conflict, PRD ownership, demo acceptance dispute | 8h |
| QA Authority | `{{TBD}}` | Quality gate dispute, P1 bug severity, TC coverage adequacy | 4h |
| Security Lead | `{{TBD}}` | Security finding, auth/authz issue, OWASP, secret leak, compliance | 1h |

> **QC sign-off note**: §2.6 #3 (`STATE.qc.signed_by != null`) = **QA Authority responsibility**. Field accepts authority name; không có dual-sign-off với Business cho TD waves (Business chỉ enter sequence ở demo step trong §2.6 #2). Future feature waves có thể require dual sign-off — bump version khi adopt.
>
> **Authority list source**: Khi confirmed, populate cả file này + [`CLAUDE.md §10`](../CLAUDE.md) (nếu có) + `STATE.json` ownership fields. Single source-of-truth = file này.

---

## 8. KPIs (Execution-level)

| Metric | Target | Measured At |
|---|---|---|
| Wave on-time completion | ≥ 80% | Per-wave actuals (`Tracking/td-w{NN}-{tier}-actuals.md` TBD) — duration vs PKG §0 estimate |
| DEV first-pass rate (no retry needed) | ≥ 70% | `STATE.json` transition log + retries per wave (count `/dev-handoff` retries) |
| Review finding density | ≤ 5 per 1000 LOC | Review reports — findings count / total LOC changed |
| TC pass rate per wave | ≥ 80% (per PROTOCOL.md §TEST_EXECUTION) | TC registry status counts (PASS / total) |
| P1 escape rate to production | 0 | Prod incidents + post-release bug filings — gate cho RELEASE retro |
| Hard gate adherence | 100% (no skip) | WAVE-SEQUENCE.md §1 verification + `STATE.json` transition audit (no force transition) |
| Boundary scan violations | 0 | `check-boundary.sh` exit count per wave (must be 0) |
| 3-in-1 version bump compliance | 100% | Per-file Change Log audit cho wave commits (CLAUDE.md §3.2 Rule #9) |

---

## 9. Brownfield Context + Reusability

> Garage là **brownfield project** — 15 feature waves (booking, SO, settlement, inventory, marketing…) đã production. File này define topology cho **forward execution**, không retroactively cover historical feature waves.

### 9.1 Current vs Historical

| Scope | Status | MEP applicability |
|---|---|---|
| 15 feature waves (W01-W15 + WT-M/WT-F historical decomposition) | Đã production | **Reference only** — không re-execute. Mental model trong [`CLAUDE.md §6.2`](../CLAUDE.md) |
| TD P0 Remediation (3 waves) | Active execution | **Primary scope** — §1-§8 above directly apply |
| Post-TD feature waves (chưa kế hoạch) | Future | MEP reusable — bump version + add feature-wave-specific sections (vertical slice day-by-day ASCII có thể add về sau) |

### 9.2 Reusability Path

Khi post-TD feature wave được kế hoạch:

1. Trigger Phase 5 (Agent setup completion — currently NOT STARTED per CLAUDE.md §6.1)
2. Add §5.7 "Feature wave vertical-slice cadence" với day-by-day ASCII 
3. Activate WT-M / WT-F periodic test waves (bump §6.2 to ACTIVE)
4. Re-evaluate KPI thresholds (vd DEV first-pass có thể bump ≥ 80%)
5. Add §X for production deployment + monitoring (currently TBD — local Docker Compose only)
6. CR severity = MODERATE (Delivery Authority approve) per [`DOC-DEPENDENCY-MAP.md §2.2`](../DOC-DEPENDENCY-MAP.md)

---

## 10. References

| Document | Vai trò |
|---|---|
| [`CLAUDE.md §3.2`](../CLAUDE.md) | 12 Critical Rules — governance backbone (Rule #12 No force-push, Rule #11 HYBRID design repo + per-service agents, Rule #9 3-in-1 versioning, Rule #1 boundary isolation) |
| [`DOC-DEPENDENCY-MAP.md`](../DOC-DEPENDENCY-MAP.md) | Tier hierarchy T0-T5 + CR severity table (§2.2) — cascade rules cho mọi artifact change |
| [`PROTOCOL.md`](PROTOCOL.md) | Per-stage **RUNTIME** procedure + slash commands + docs to load — companion to file này (file này = POLICY, PROTOCOL = RUNTIME) |
| [`Plan/WAVE-SEQUENCE.md`](../Plan/WAVE-SEQUENCE.md) | TD P0 wave plan + hard gates §1 + parallel execution rules §4 + NEED CONFIRMATION §5 |
| [`Plan/ROADMAP.md`](../Plan/ROADMAP.md) | Multi-phase roadmap context |
| [`SERVICE-BOUNDARY-MATRIX.md`](SERVICE-BOUNDARY-MATRIX.md) | 18 boundaries + owned_paths + forbidden scope |
| [`AGENT-REGISTRY.md`](AGENT-REGISTRY.md) | 45 agents (DEV 18 + FIX 18 + REVIEW 3 + TEST 6) + per-tier paths (HYBRID per Rule #11) |
| [`WAVE-TRACKER.md`](WAVE-TRACKER.md) | Living wave state (rendered từ `STATE.json` via `scripts/render-wave-tracker.sh`) |
| [`PRE-EXECUTION-RUNBOOK.md`](PRE-EXECUTION-RUNBOOK.md) | PLANNING readiness checklist (consumed by §2.1) |
| `Execution/FAILURE-MODES.md` (TBD) | FM-001/006/012/016/017 catalog — referenced inline by hooks và §2.2 #7 (FM-017 Pre-Edit Recognition) |
| `Tracking/CHANGE-REQUESTS.md` (TBD) | CR ledger — referenced by §3.2, §4.1, §4.2 |
| `Architecture/integration/INTEG-*.md` | 24 cross-boundary contracts — gate cho §2.1 #6 và §5.1 |

---

## 11. TBD Ledgers (transparency)

Các ledger file MEP reference inline nhưng chưa tồn tại — sẽ tạo khi có entry đầu tiên hoặc khi tương ứng stage active:

| Ledger | Trigger to create |
|---|---|
| `Tracking/CHANGE-REQUESTS.md` | First CR raised (`/cr-raise` slash command) |
| `Tracking/DEBT-REGISTRY.md` | First REVIEW finding deferred (P2 with owner + ETA) |
| `Tracking/TEST-CASE-REGISTRY.md` | W01 entering TEST_PLANNING stage |
| `Tracking/BUGS.md` / `Tracking/WAVE{NN}/BUGS.md` | First bug filed during TEST_EXECUTION (format `BUG-W{NN}-{NNN}`) |
| `Tracking/td-w{NN}-{tier}-actuals.md` | First RELEASE stage exit (W01) |
| `Execution/FAILURE-MODES.md` | When formal FM catalog needed (hooks hiện reference inline FM codes) |
| `Execution/handoffs/POST-MORTEM-W{NN}.md` | First wave-level rollback (§4.2) |

---

## 12. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-03 | 3 | cuongnguyen_ac | §1.1 TEST_PLANNING row: thêm `performance` vào danh sách TEST_GROUP (api/e2e/ui/isolation/**performance**/security) — đồng bộ với 6 test agent thực tế + BOOTSTRAP §F.1/§C.8 + lệnh `/spawn-test` (trước đây thiếu, mâu thuẫn với §2.5 #5 Performance SLA). |
| 2026-05-29 | 2 | cuongnguyen_ac | §1.1 Stage Owners + §11 registry ref: REVIEW_GROUP 2→3 agents (agent-review-backend / agent-review-garage-web / agent-review-garage-mobile); total 44→45. agg-garage-graph review qua agent-review-backend. |
| 2026-05-27 | 1 | Delivery Authority | Initial MASTER-EXECUTION-PLAN.md — governance-only scope (no PROTOCOL.md overlap). Garage-specific adaptations: (a) **4-tier build/lint/test thresholds** (Java BE / Node BFF ≥ 80%; React web / Flutter mobile ≥ 60%) replacing single template placeholder; (b) **HYBRID agent topology** references per Rule #11 (per-service `.claude/agents/` for DEV/FIX, design repo `.agents/` for REVIEW/TEST); (c) `Architecture/integration/` singular path (24 INTEG contracts); (d) **TD P0 brownfield framing** §1.2 + §9 — 15 feature waves đã production not re-executed; (e) **TC pass rate 80%** (per PROTOCOL.md §TEST_EXECUTION; (f) **STATE.json field names** consistent (`qc.signed_by`, `features_in_flight`, `wave_scope.modify_allowlist`); (g) **3 hard gates** echoed §2.8 #4 + §5.2 per WAVE-SEQUENCE.md §1; (h) FM-017 Pre-Edit Recognition criterion §2.2 #7; (i) **TBD ledgers flagged inline** §11; (j) escalation contacts §7 = `{{TBD}}` pending authority list confirmation; (k) **10-stage pipeline diagram** §1 matches PROTOCOL.md 10-stage (PLANNING + 8 functional + WAVE_END); (l) audit-driven rollback rule §4.4 per 2026-05-22 precedent (17-wave revert → TD P0 adoption). |
