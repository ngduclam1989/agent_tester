# Bug Verify Mechanism v2 — Granular Re-test Design

> **Status**: DRAFT v1 (2026-06-12) — design canonical cho /verify-bug command + impact analysis on bug log.
> **Author**: agent-test-api (session W01 manual-QC-catch audit).
> **Trigger**: vấn đề báo cáo user 2026-06-12 — verify 1 bug fix hiện tại = chạy full /test-exec ~98 TC → cost cao + chậm.
> **Owners**: agent-test-api (canonical) + orchestrator (skill build via CR) + all test agents (adoption).

---

## 1. Problem Statement

### 1.1 Current state

| Layer | What exists | Gap |
|---|---|---|
| L1 (BUGS.md) | `Source TC ID` column (single TC discovered bug) | KHÔNG có "impacted/regression TC IDs" list — orchestrator không biết bug ảnh hưởng TC nào để re-run granular |
| L2 (verify file) | §4 Source TC (rerun) + §8a.3 Regression must-cover | Text format, KHÔNG machine-readable — runner không parse được |
| Command | `/test-exec` chạy full suite | KHÔNG có command verify-only mode |
| Workflow | Sau fix → orchestrator chạy `/test-exec` Run N+1 | Cost: ~98 TC × 8 agent types ≈ hours. Verify 1 bug fix tốn 100% cost suite. |

### 1.2 Cost

- W01 đã chạy 4 runs of `/test-exec` để verify ~30 P1/P2 bugs → ước tính 4× full suite cost.
- Chuyên gia thời gian: nếu chỉ re-test impacted TC subset (5-10 TC/bug), cost giảm ~90%.

---

## 2. Design v2 — 3-layer

### 2.1 Layer 1: L2 schema update (mandatory machine-readable YAML)

Mỗi `verify/BUG-W01-{NNN}.verify.md` PHẢI có §9 với YAML block sau:

```yaml
regression_tc_ids:
  api:
    - TC-W01-API-SOADJ-032            # direct — TC discovered bug
    - TC-W01-API-SOADJ-047            # same persist path (set-on)
  ui:
    - TC-AUTO-094                     # downstream consumer (UI reads BE output)
  e2e:
    - TC-W01-E2E-001                  # full flow regression
  isolation: []
  security: []
  performance: []
  mobile_ui: []
  mobile_e2e: []
estimated_duration_min: 8             # tổng wall-clock dispatch parallel
impact_classification:
  direct:    [TC-W01-API-SOADJ-032]
  same_path: [TC-W01-API-SOADJ-047]
  downstream:[TC-AUTO-094]
  cascade:   [TC-W01-E2E-001]
last_verify_run:
  timestamp: null
  command: null
  verdict: null
  failed_tcs: []
```

Rules:
- Mọi P1/P2 bug PHẢI có `regression_tc_ids` non-empty trước khi promote `FIX_DONE` → `VERIFY_PENDING`.
- P3 bug: nếu coverage gap (no existing TC) thì ghi `regression_tc_ids: { _all: [], _gap: "no TC inventory — need spec write" }` + flag CR-MINOR cho TC backfill.
- `impact_classification` bắt buộc 4 buckets: `direct` (source TC), `same_path` (cùng code path), `downstream` (consumer), `cascade` (E2E full flow).
- `estimated_duration_min`: ước tính wall-clock khi chạy parallel agents.

### 2.2 Layer 2: `/verify-bug` command (new skill)

Spec (cho CR-MINOR build):

```
/verify-bug {BUG-ID}                  # single bug
/verify-bug --batch {BUG-ID},{...}    # multi-bug fix cùng PR
/verify-bug --all-pending             # tất cả VERIFY_PENDING của wave hiện tại
/verify-bug --p1-only                 # filter P1
```

Behavior:
1. Read L2 verify file → parse YAML §9.
2. Validate: tất cả TC IDs trong `regression_tc_ids` phải tồn tại trong TC artifact (`Execution/automated-test-cases/TC-W01-{TYPE}.md`).
3. Dispatch per-type vào harness tương ứng:
   - `api` → `Execution/auto/harness/api/` (jest filter testName pattern)
   - `ui` → Playwright filter
   - `e2e` → Playwright spec filter
   - etc.
4. Collect results → write back `last_verify_run` block.
5. Auto-update L1 Status:
   - All PASS → `VERIFIED`
   - Any FAIL → `REOPENED` + append `failed_tcs` list
6. Append §7 Verdict Log entry.
7. Output summary table: TC | result | duration | failure reason.

Implementation hints:
- Script `scripts/verify-bug.sh` thin wrapper, parse YAML qua `yq`.
- Per-type runner (jest/playwright) hỗ trợ `--testNamePattern` hoặc `--grep` filter.
- Output JSON cho automation read.

### 2.3 Layer 3: Workflow integration

| Stage | Command | Use case |
|---|---|---|
| Initial TEST_EXECUTION | `/test-exec` | Đầu wave — full suite baseline |
| Post-fix single bug | `/verify-bug BUG-W01-XXX` | Granular re-test |
| Multi-bug PR fix | `/verify-bug --batch BUG-X,BUG-Y` | Cùng deploy verify |
| Bug verification loop | `/verify-bug --all-pending` | End of fix cycle, batch verify |
| Wave exit gate | `/wave-end` validates 0 VERIFY_PENDING via `/verify-bug --all-pending` | Block exit nếu còn pending |

Update `/test-exec` skill: thêm flag `--bugs-only` → delegate sang `/verify-bug --all-pending` (avoid duplicate execution path).

---

## 3. Migration Plan

### 3.1 Phase 1 (now — design canonical) — owned by agent-test-api in design repo

- [x] Write this design doc.
- [x] Update `Tracking/WAVE01/verify/_TEMPLATE.verify.md` — add §9 YAML block.
- [x] Update `Tracking/WAVE01/BUGS.md` §0 convention — add rule "impact analysis on bug log".
- [x] Backfill 13 bugs session 2026-06-12 (BUG-W01-252..260, 263..266) với §9 YAML.
- [x] Update `.agents/agent-test-api.md` — add responsibility "impact analysis + regression_tc_ids on bug log".

### 3.2 Phase 2 (CR-MINOR escalation) — owned by orchestrator + agent-test-api

- [x] Raise CR-MINOR cho `/verify-bug` skill + `scripts/verify-bug.sh` runner. (CR-1781255529 APPROVED 2026-06-12)
- [x] Build skill per spec §2.2. (deploy 2026-06-19 — `.claude/commands/verify-bug.md`)
- [x] Build runner `scripts/verify-bug.sh` per §2.2 implementation hints. (deploy 2026-06-19)
- [x] Add CI gate: `scripts/hooks/validate-bugs-md.sh` check §9 YAML existence cho P1/P2 bugs. (deploy 2026-06-19; wired PostToolUse `--warn` mode)
- [x] Update `.claude/commands/test-exec.md` thêm flag `--bugs-only` delegate sang `/verify-bug --all-pending`. (deploy 2026-06-19)
- [ ] **DEFERRED Phase 2.5** (workflow auto-integration): `/dev-handoff` auto-spawn `/verify-bug` per FIX_DONE; `/wave-end` gate validate 0 VERIFY_PENDING. → raise CR riêng khi manual call pattern stable trên W02.
- [ ] **System dep**: `yq` must be installed on execution host. Install: `sudo snap install yq` (or `apt`/`brew`). User-action required.

### 3.3 Phase 3 (backfill + adoption) — coordinated across all test agents

- [ ] Backfill ≥ 30 legacy W01 bugs (BUG-W01-201..251) with §9 YAML — chia 7 agent types per bug ownership.
- [ ] Update other agent skills (`.agents/agent-test-{e2e,ui,isolation,security,performance,mobile-ui,mobile-e2e}.md`) với responsibility.
- [ ] Train orchestrator workflow: `/dev-handoff` post-fix → auto-spawn `/verify-bug` per FIX_DONE bug.

---

## 4. Impact Analysis Heuristic (guide for test agents)

Khi log bug, agent PHẢI phân loại 4 buckets:

| Bucket | Definition | Detection heuristic |
|---|---|---|
| **direct** | TC that discovered the bug | The TC ID in `Source TC ID` column |
| **same_path** | TCs exercise cùng code path (mapper / validator / persist) | Grep file path: nếu fix dự kiến chạm file X, mọi TC cùng test file X = same_path |
| **downstream** | TCs read output BE / consume event | UI TC consuming computed field; STL TC consuming snapshot; dashboard TC; Kafka consumer assertions |
| **cascade** | E2E full flow regression | TC-W01-E2E-* family chạm bug feature |

**Minimum coverage rule**:
- P1 bug: ≥ 1 TC per non-empty bucket (4 buckets = 4+ TC tối thiểu).
- P2 bug: ≥ 1 direct + ≥ 1 same_path (2+ TC tối thiểu).
- P3 bug: ≥ 1 direct.

**Empty bucket = explicit gap**: nếu bucket empty thì ghi reason trong YAML (vd `same_path: []  # no co-located TC`).

---

## 5. Validation rules

CI script `validate-bugs-md.sh` cần check:

1. Mọi L1 row Status=`OPEN`/`ASSIGNED`/`IN_FIX`/`FIX_DONE`/`VERIFY_PENDING`/`REOPENED` (P1/P2) phải có L2 file existing.
2. L2 file phải có §9 YAML block parsable.
3. `regression_tc_ids.*[]` TC IDs phải exist trong TC artifact (cross-check `Execution/automated-test-cases/TC-W01-*.md`).
4. Minimum coverage rule per severity (§4).
5. Khi promote `FIX_DONE` → `VERIFIED`, `last_verify_run.verdict` phải `PASS` + non-empty timestamp.

---

## 6. Open questions (defer to CR review)

1. **TC ID validation strictness**: nếu TC ID trong YAML không exist trong artifact (typo / stale), block hay warn?
2. **Cross-wave regression**: bug W01 ảnh hưởng TC W02+ — YAML có support cross-wave TC ID format không?
3. **Manual QC TCs**: bug discovered by manual QC (no TC ID), `direct` bucket dùng giá trị gì? Đề xuất: `manual-qc-{YYYY-MM-DD}` placeholder.
4. **Auto-generated TC backfill**: khi bug expose coverage gap, có nên auto-gen skeleton TC stub với `test.skip()` để track? (TL-W01-API-005 lesson)

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-12 | 1 | agent-test-api | Initial draft — design canonical cho bug verify mechanism v2 sau khi user flag verify cost issue trong W01 TEST_EXECUTION |
| 2026-06-19 | 2 | agent-test-api + orchestrator | **Phase 2 DEPLOY** (per CR-1781255529): build `.claude/commands/verify-bug.md` + `scripts/verify-bug.sh` runner + `scripts/hooks/validate-bugs-md.sh` CI gate (wired PostToolUse `--warn`) + `/test-exec --bugs-only` flag delegate sang `/verify-bug --all-pending`. Phase 2.5 workflow auto-integration (`/dev-handoff` + `/wave-end`) DEFERRED — manual call đủ cho W02; raise CR riêng khi pattern stable. System dep `yq` cần install manual (sudo). W02 adoption: `Tracking/WAVE02/verify/_TEMPLATE.verify.md` + `Tracking/WAVE02/BUGS.md §0` convention live. |
