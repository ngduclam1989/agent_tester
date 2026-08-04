---
type: execution
artifact_kind: runbook
status: ACTIVE
version: 3
tier: T3
owner_authority: Delivery Authority
last_reviewed: "2026-06-17"
---

# Pre-Execution Runbook — Garage

> Checklist trước khi bắt đầu Wave 1 DEV. Gate chính: GO / NO-GO sign-off.
> Re-run runbook nếu major changes post-Wave 1 (CR CRITICAL).

---

## 0. Readiness Summary

| Layer | Complete | Total | % |
|---|---|---|---|
| Product | 0 | 5 | 0% |
| Architecture | 0 | 7 | 0% |
| Execution | 0 | 7 | 0% |
| Plan | 0 | 4 | 0% |
| Infrastructure | 0 | 4 | 0% |
| Governance | 0 | 5 | 0% |
| **Overall** | **0** | **32** | **0%** |

**Verdict**: NO-GO / GO

---

## 1. Checklist

### 1.1 Product Layer

- [ ] `Product/PRD.md` complete (vision, goals, personas, scope, epics) + status ACTIVE
- [ ] Business rules documented per boundary (`Product/business-rules/BR-*.md`)
- [ ] Features have AC embedded (`Product/features/FEAT-*.md`)
- [ ] UX specs cover all user-facing features (`Product/ux/*`)
- [ ] Personas defined (`Product/personas/*`)

### 1.2 Architecture Layer

- [ ] `Architecture/TECHSTACK.md` finalized (T0)
- [ ] `Architecture/SYSTEM-ARCHITECTURE.md` complete
- [ ] HLD per boundary (`Architecture/hld/{boundary}-HLD.md`)
- [ ] API contracts per boundary (contract-first) (`Architecture/api/*-api.md`)
- [ ] Data models per boundary (`Architecture/data/*-data-model.md`)
- [ ] Event contracts defined (trong knowledge graphs)
- [ ] Key ADRs documented (`Architecture/decisions/ADR-*.md`)

### 1.3 Execution Layer

- [ ] `SERVICE-BOUNDARY-MATRIX.md` complete (all boundaries listed)
- [ ] `AGENT-REGISTRY.md` complete (all agents)
- [ ] Agent definitions created (`.agents/agent-*.md`)
- [ ] Agent sync verified (`bash scripts/sync-agent-assets.sh check`)
- [ ] Knowledge graphs per boundary (`knowledge-graphs/*.yaml`)
- [ ] Work packages per wave (`work-packages/PKG-W{{NN}}-{{slug}}.md`)
- [ ] `WAVE-TRACKER.md` initialized

### 1.4 Plan Layer

- [ ] `WAVE-SEQUENCE.md` complete (all waves scoped)
- [ ] `ROADMAP.md` complete
- [ ] `RELEASE-PLAN.md` draft
- [ ] `LAUNCH-CHECKLIST.md` stubbed

### 1.5 Infrastructure

- [ ] Dev environment ready (Docker Compose OR cloud)
- [ ] Database provisioned + migrations framework configured
- [ ] CI/CD pipeline configured (build + lint + test + boundary guard)
- [ ] Test environment ready
- [ ] Secrets management (Secrets Manager / vault)
- [ ] IAM realms configured (nếu OIDC)

### 1.6 Governance

- [ ] `ADLC.md` finalized + version ACTIVE
- [ ] `DOC-DEPENDENCY-MAP.md` complete
- [ ] `CLAUDE.md` bootstrap context complete
- [ ] `AGENTS.md` navigation index complete
- [ ] Authorities assigned (`ADLC.md §3` — 4 roles + Security Lead)

### 1.7 Skills Layer

- [ ] `.claude/skills/rules-*/SKILL.md` (backend, bff, frontend, dev-handoff)
- [ ] `.claude/skills/rules-test-*/SKILL.md` (functional-test, test-ui, test-general)
- [ ] `.claude/skills/ref-*/SKILL.md` (backend-config, backend-patterns, backend-unit-test, local-dev-contract)

---

## 2. Blockers

### 2.1 Active

| ID | Description | Severity | Owner | Status | Opened |
|---|---|---|---|---|---|
| BLK-001 | {{Blocker description}} | CRITICAL | {{Authority}} | OPEN | {{date}} |

### 2.2 Resolved

| ID | Description | Resolution | Resolved |
|---|---|---|---|
| — | — | — | — |

---

## 3. Sign-off (GO / NO-GO)

### 3.1 Sign-off Criteria

- **GO**: Overall ≥ 95% + no CRITICAL blockers + 4 authorities + Security Lead sign-off
- **CONDITIONAL GO**: 80-95% + blockers resolvable in Wave 1 Day 1 + mitigation documented
- **NO-GO**: < 80% OR any CRITICAL blocker unresolved

### 3.2 Sign-off Matrix

| Authority | Name | Signed | Date | Verdict |
|---|---|---|---|---|
| Business Authority | {{Name}} | — | — | — |
| Architecture Authority | {{Name}} | — | — | — |
| Delivery Authority | {{Name}} | — | — | — |
| QA Authority | {{Name}} | — | — | — |
| Security Lead | {{Name}} | — | — | — |

### 3.3 Decision Record

| Date | Verdict | Overall % | Blockers Open | Conditions (if CONDITIONAL) |
|---|---|---|---|---|
| 2026-05-26 | NO-GO | 0% | — | — |

---

## 4. Wave 1 DEV Activation Checklist

Sau khi GO verdict, execute trong order:

1. Update `ADLC.md §3` Authorities nếu chưa fill
2. Update `MASTER-EXECUTION-PLAN.md §7` Escalation Contacts
3. Init `WAVE-TRACKER.md §4` Active Wave Detail cho W1 (auto-populated khi /wave-start chạy + render-wave-tracker.sh)
4. Verify infra connectivity (DB, cache, broker, IAM) từ dev machine
5. Orchestrator spawns Wave 1 DEV agents per `PKG-W01.md`
6. Update `WAVE-TRACKER.md §3` Current Stage Snapshot — W1 PLANNING → DEV (auto qua /dev-start + render)
7. Update `WAVE-TRACKER.md §7` Stage Transition Log (auto qua `state.py transition` enriched entry — actor/authorized_by/evidence/conditions_met)

---

## 5. Emergency Sprint Fallback

Nếu timeline critical + blockers không giải quyết được đầy đủ:

| Scenario | Fallback |
|---|---|
| AWS infra slip | Use Docker Compose local stack (`infra/docker-compose.yml`) cho Wave 1-2; migrate tới cloud Wave 3+ |
| Keycloak cloud chưa sẵn | Use Docker Keycloak seeded realm |
| Temporal Cloud chưa sẵn | Mock workflow client; defer real Temporal sang Wave 5 |
| Authority chưa sign | Delivery Authority self-signs interim; Business sign-off async within 3 days |
| PRD DRAFT | Proceed với CONDITIONAL GO; Business Authority sign-off async |

Document emergency decisions trong `Tracking/CHANGE-REQUESTS.md` as CR MAJOR.

---

## 6. Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-05-26 | Initial runbook | Delivery Authority |
| 2026-05-26 | v2 — added Readiness Summary §0, Sign-off matrix, Wave 1 Activation Checklist, Emergency Sprint Fallback | Delivery Authority |
| 2026-06-17 | v3 — §4 Wave 1 Activation Checklist: align section IDs với WAVE-TRACKER schema v2 (§1→§3 Snapshot, §3→§4 Active Wave Detail, §6→§7 Transition Log); note auto-render via /wave-start + /dev-start + `state.py transition` enriched entry. | Delivery Authority |
