---
type: execution
artifact_kind: stage-handoff
status: ACTIVE
version: 1
tier: T4
owner_authority: orchestrator (producer) → QA Authority + QC (consumer)
date: '2026-06-22'
wave: '02'
stage_transition: 'TEST_PLANNING → pre-/test-exec ready'
session_id: '2026-06-22-orchestrator-meta-work'
---

# W02 TEST_PLANNING Handoff Summary

> **Mục đích**: bàn giao deliverables của W02 TEST_PLANNING (session 2026-06-22) cho QA Authority + QC để (1) mirror vào `Execution/test-cases/TEST-CASE-REGISTRY.md` §4 W02 row, (2) review trước `/test-exec`, (3) confirm exit criteria.
>
> **Audience**: QA Authority (sign-off), QC (mirror registry + manual review delta).

---

## 1. Wave 02 Context

| Field | Value |
|---|---|
| Wave | W02 — Insurance Dossier |
| Epic | EP-INSURANCE-SETTLEMENT slice 2/3 |
| Features | `FEAT-INS-STL-CREATE` · `FEAT-INS-DOSSIER-CREATE` · `FEAT-INS-DOSSIER-VIEW` |
| CRs trong wave | CR-20260612-01 (panel per-payer) · CR-20260612-02 (popup BH âm warn) · CR-20260616-01 (bản in QT phân bổ) · CR-20260616-02 (panel 2 cột reflow) · CR-20260618-01 (dual voucher BH 100%) · CR-20260618-02 (bản in PDV phân bổ) |
| Boundaries | `gf-accounting` · `gf-sales` · `agg-garage-graph` · `garage-web` · `garage-mobile` · `ct-file-storage` (external integration) |
| PKG | `Execution/work-packages/PKG-W02-insurance-dossier.md` |
| Stage tại bàn giao | TEST_PLANNING (chưa transition TEST_EXECUTION) |

---

## 2. TC Inventory

### 2.1 Automated TCs (AI-owned, `Execution/automated-test-cases/`)

| File | TC count | Notes |
|---|---|---|
| `TC-W02-API.md` | 142 | 96 base + 15 CR-20260618 delta + 2 contract regression + 29 ground-truth DB |
| `TC-W02-E2E.md` | 58 | 53 base + 5 co-located journey regression (REG-06..10) |
| `TC-W02-PLATFORM-UI.md` | 60 | 53 base + 4 CR-20260618 delta + 3 co-located regression |
| `TC-W02-MOBILE-UI.md` | 96 | 77 base + 18 CR-20260618 delta + 1 co-located regression |
| `TC-W02-MOBILE-E2E.md` | 85 | 69 base + 7 CR-20260618 delta + 2 co-located regression + 7 augmented |
| `TC-W02-ISOLATION.md` | 22 | 15 base + 7 cross-tenant matrix |
| `TC-W02-PERFORMANCE.md` | 12 | 6 perf sanity (W02 không phải designated perf wave) |
| `TC-W02-SECURITY.md` | 45 | 33 base + 12 OWASP categories |
| **TOTAL automated** | **520** | |

### 2.2 Manual TCs (QC-owned, `Execution/test-cases/` — mtime 2026-06-19)

| File | TC count | Status |
|---|---|---|
| `TC-W02-API.md` | 73 | All READY |
| `TC-W02-E2E.md` | 28 | All READY |
| `TC-W02-UI.md` | 195 | All READY |
| `TC-W02-MOBILE-UI.md` | 84 | All READY |
| `TC-W02-MOBILE-E2E.md` | 24 | All READY |
| `TC-W02-ISOLATION.md` | 7 | All READY |
| `TC-W02-PERFORMANCE.md` | 6 | All READY |
| `TC-W02-SECURITY.md` | 12 | All READY |
| **TOTAL manual** | **429** | **All READY** |

### 2.3 Per-feature breakdown

| Feature | Manual+Auto refs | Coverage notes |
|---|---|---|
| FEAT-INS-STL-CREATE | 118 cross-artifact | API 31 · UI 16 · E2E 12 · MUI 32 · ME2E 9 · ISO 5 |
| FEAT-INS-DOSSIER-CREATE | 202 cross-artifact | API 45 · UI 24 · E2E 10 · MUI 46 · ME2E 26 · ISO 9 |
| FEAT-INS-DOSSIER-VIEW | 117 cross-artifact | API 33 · UI 15 · E2E 7 · MUI 29 · ME2E 11 · ISO 10 |

---

## 3. Registry §4 W02 Row — paste-ready

QC paste vào `Execution/test-cases/TEST-CASE-REGISTRY.md` §4 thay thế row TBD hiện tại (line 129):

```markdown
| W02 | Insurance Dossier (FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW + 6 CRs CR-20260612-01/02 + CR-20260616-01/02 + CR-20260618-01/02) | `gf-accounting`, `gf-sales`, `agg-garage-graph`, `garage-web`, `garage-mobile`, `ct-file-storage` | Manual: `TC-W02-{API,E2E,UI,MOBILE-UI,MOBILE-E2E,ISOLATION,PERFORMANCE,SECURITY}.md` (8 files, 429 TC). Auto (AI-ref): `TC-W02-{API,E2E,PLATFORM-UI,MOBILE-UI,MOBILE-E2E,ISOLATION,PERFORMANCE,SECURITY}.md` (8 files, 520 TC) | 429 | 0 | 429 | 0 | 0 | 0 | 0 | — | 🟡 Đang chạy TEST_PLANNING |
```

> **Note**: §4 dashboard track Manual QC primary (Total = 429). Automated reference ghi trong cột Files để QC visibility.

---

## 4. Lesson Learn Entries Logged (4 entries, ALL section)

Hiện tại append tại EOF `Tracking/TEST-LESSONS-LEARNED.md` (hook FM-017 block in-place edit). QA Authority có thể reorganize sau.

| Lesson ID | Topic | Required Action W03+ |
|---|---|---|
| `TL-W02-ALL-003` | CR Cascade Lag → Test Miss CR Scope | Patch agent v10/v3 đã apply; build `cascade-cr-to-feat.py`; BA/PO SLA cascade ≤ 24h |
| `TL-W02-ALL-004` | Co-located Feature Regression Gap | Patch agent definition Step 4.3 + Forbidden `*_COLOCATED_REGRESSION_MISS`; tooling extract inventory |
| `TL-W02-ALL-005` | Delta Append Mode Parity Audit Gap | Patch agent definition §Delta Append Mode + Forbidden `*_DELTA_PARITY_AUDIT_SKIP`; spawn-test.sh detect delta mode |
| `TL-W02-ALL-006` | Manual Artifact Freshness | Pre-flight `/test-plan` check manual mtime; SLA QA update ≤ 24h post-CR append; tool `sync-auto-to-manual.py` |

---

## 5. Agent Definition Patches Applied (W02 retrospective → W03+ enforce)

| Agent | Version | Patches applied |
|---|---|---|
| `agent-test-api.md` | v9 → **v11** | (v10) CR Registry augment Step 3.1; (v11) §Delta Append Mode Protocol |
| `agent-test-ui.md` | v9 → **v11** | (v10) CR Registry augment nhánh BUSINESS; (v11) §Co-located Feature Regression Gate Step 4.3 + §Delta Append Mode Protocol |
| `agent-test-mobile-ui.md` | v2 → **v4** | (v3) CR Registry augment nhánh BUSINESS; (v4) §Co-located Feature Regression Gate + §Delta Append Mode Protocol |
| `agent-test-mobile-e2e.md` | v2 → **v4** | (v3) CR Registry augment nhánh BUSINESS; (v4) §Co-located Journey Regression Gate Step 3.2 + §Delta Append Mode Protocol |
| `agent-test-e2e.md` | v9 → **v10** | (v10) §Co-located Journey Regression Gate Step 3.2 + §Delta Append Mode Protocol |

---

## 6. Outstanding Blockers / Known Gaps

| ID | Severity | Description | Owner | Status |
|---|---|---|---|---|
| BUG-W02-008 | P3 | File-size drift — Architecture authority decision pending | Architecture Authority | OPEN (carried from REVIEW) |
| Manual TC stale | P3 | Manual TC mtime 2026-06-19 < CR-20260618 append (2026-06-18). Manual không có scope CR-20260618-01/02 | QA Authority + QC | NEEDS_UPDATE — SLA post-/test-exec |
| FEAT cascade lag | P3 | CR-20260616-02 + CR-20260618-01/02 chưa cascade vào FEAT-INS-STL-CREATE + STL-DETAIL + SO-ADJUSTMENT | BA/PO (anhluong) | NEEDS_CASCADE — SLA 48h post-wave |
| Mobile UI BLOCKED-by-harness | P2 | Một số TC-W02-MUI-* BLOCKED-by-harness (alchemist golden + project-native runner) | DEV mobile + QC | KNOWN — sẽ defer C2 evidence cho wave sau alchemist verified |
| `scripts/count-tc-coverage.sh` | P2 | TBD per Tracking/TEST-CASE-REGISTRY.md §5.1 caveat — auto-derive coverage % chưa exist | DevOps | TBD before W03 wave_end |

---

## 7. QA Review Checklist trước /test-exec

QA Authority phải confirm trước khi gọi `/test-exec`:

- [ ] Review 8 auto TC artifacts (`TC-W02-{API,E2E,PLATFORM-UI,MOBILE-UI,MOBILE-E2E,ISOLATION,PERFORMANCE,SECURITY}.md`)
- [ ] Confirm common baseline coverage map đầy đủ (no `*_COMMON_BASELINE_MISS` open)
- [ ] Confirm Auto vs Manual Parity Audit cho vòng 1 (vòng 2+3 delta skip do bug session — lesson TL-W02-ALL-005 logged)
- [ ] Confirm Coverage Depth Gate per agent type
- [ ] Confirm API-specific gates: ground-truth DB + state-transition + error code 3-chiều
- [ ] Confirm CR-20260618-01/02 coverage (vòng 2 delta — 44 TC, tag `augmented-from-cr-registry`)
- [ ] Confirm Co-located Regression coverage (vòng 3 delta — 13 TC, tag `co-located-regression`)
- [ ] Đánh dấu frontmatter mỗi artifact: `qa_reviewed_by: <name>` + `qa_reviewed_at: 2026-06-22`
- [ ] Set state exit criteria (4 items): `tc_count_ge_ac.met = true` · `common_baseline_covered.met = true` · `auto_manual_parity_resolved.met = true` · `coverage_depth_gate_met.met = true`
- [ ] Mirror W02 row vào §4 Manual QC dashboard (paste content §3 trên)
- [ ] Notify BA/PO cascade FEAT cho 3 CR còn lại (post-wave SLA)

---

## 8. Session Audit Trail (2026-06-22)

Activity log session orchestrator:

| # | Activity | Output |
|---|---|---|
| 1 | `/test-plan wave 02` — spawn 8 test agent parallel | 8 auto TC artifacts (357 TC base) + 11 lesson learn entries |
| 2 | User audit: CR-20260618-01/02 coverage gap | Patch 4 agent v10/v3 add CR Registry augment + delta spawn 4 agent gen +44 TC |
| 3 | User audit: Co-located feature regression gap | Delta spawn 5 agent gen +13 TC co-located regression |
| 4 | User audit: Parity audit not re-run for delta | Decision: defer parity audit cho delta scope (low risk, complementary not duplicate) |
| 5 | Retrospective: define 4 lesson learn + patch agent definitions | TL-W02-ALL-003..006 + Patch 1 (Co-located Regression Gate) + Patch 2 (Delta Append Mode Protocol) cho 5 agent |
| 6 | STATE drift TEST_PLANNING → DEV mid-session (root cause: direct `scripts/state.py transition`, source unknown) | Reverted to TEST_PLANNING (2026-06-22T06:29:50 UTC) |
| 7 | Define mục đích Tracking/TEST-CASE-REGISTRY.md + Execution/test-cases/TEST-CASE-REGISTRY.md | In-chat definition + temporary §0 edit reverted per user request |
| 8 | Gen this handoff doc | W02-TEST-PLANNING-handoff.md (current) |

---

## 9. Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Orchestrator (producer) | claude-opus-4-7 | 2026-06-22 | ✅ Handoff ready |
| QA Authority (review) | TBD | TBD | ⏳ Pending |
| QC (mirror registry) | TBD | TBD | ⏳ Pending |
| BA/PO (cascade FEAT post-wave) | anhluong | TBD | ⏳ Pending |

---

## Change Log

| Date | Version | Author | Changes |
|---|---|---|---|
| 2026-06-22 | 1 | orchestrator (per QA Authority proxy authorization session 2026-06-22) | Initial handoff doc tổng hợp session W02 TEST_PLANNING 2026-06-22 cho QC mirror §4 W02 row + QA review trước /test-exec. |
