# BUG-DOC-MIGRATION-W02 — W02 kickoff runbook

**Status**: Spec ready 2026-06-10. Applied at W02 kickoff (TBD).
**Owner**: orchestrator (W02 wave-start) + agent-test-api (drive + lint)
**Prereq**: `BUG-DOC-CONVENTION-W01.md` phase 1 áp dụng xong (DONE 2026-06-10).
**Schema spec**: `Tracking/BUGS.md` §3.2 + §3.3 + §5.1 + §5.2.

---

## 1. Mục đích

Chuyển bug registry sang slim 12-cột + canonical 9-status enum khi W02 kickoff. W01 giữ legacy schema để KHÔNG churn data đang chạy.

## 2. Entry condition

Trước khi chạy migration:
- [ ] W01 wave-end đã sign-off (mọi P1 VERIFIED + QA-sign-off, không còn DEFERRED).
- [ ] `Execution/checklists/impl/scripts/validate-bugs-md.sh` PASS trên `Tracking/WAVE01/BUGS.md`.
- [ ] `Tracking/BUGS.md` §3.2/§3.3/§5.1/§5.2 spec đã merged (DONE 2026-06-10).
- [ ] W02 work package (`Execution/work-packages/PKG-W02-*.md`) đã chốt scope.

## 3. Migration steps (W02 wave-start)

### Step 1 — Tạo skeleton W02 với slim schema

```bash
# Tạo per-wave file mới với schema §3.2
mkdir -p Tracking/WAVE02/verify Tracking/WAVE02/repro Tracking/WAVE02/EVD-WAVE02
cp Tracking/WAVE01/verify/_TEMPLATE.verify.md Tracking/WAVE02/verify/_TEMPLATE.verify.md
cp Tracking/WAVE01/repro/_common.env.example Tracking/WAVE02/repro/_common.env.example
```

`Tracking/WAVE02/BUGS.md` skeleton (slim 12-col):

```markdown
# W02 — Bug Registry

> Schema: `Tracking/BUGS.md` §3.2 (slim 12-col) + §3.3 (3-layer L1/L2/L3) + §5.1 (canonical 9-status).
> L2 verify: `Tracking/WAVE02/verify/`. L3 fix doc: `Execution/bugfixes/BUGFIX-BUG-W02-*.md`. Repro: `Tracking/WAVE02/repro/`.

## 0. Bug chain map

(populate khi có cluster)

## 1. Registry

| Bug ID | Wave | Severity | Status | Title | Spec | Source TC ID | Reporter | Assigned | Related Bugs | Environment | Verify → Fix Doc |
|---|---|---|---|---|---|---|---|---|---|---|---|
```

### Step 2 — Index update trong `Tracking/BUGS.md` §3 Cross-Wave

```diff
| Wave | File | #Open | #P1 | #P2 | #P3+ | Status | Updated |
|---|---|---|---|---|---|---|---|
| W01 | `Tracking/WAVE01/BUGS.md` | 0 | 0 | 0 | 0 | VERIFIED (QA sign-off) | YYYY-MM-DD |
+| W02 | `Tracking/WAVE02/BUGS.md` | 0 | 0 | 0 | 0 | OPEN (slim schema §3.2) | YYYY-MM-DD |
```

### Step 3 — Bug logging convention (W02+ row)

Khi log bug mới:
1. Tạo L1 row với 12 cột slim (KHÔNG steps/expected/actual inline).
2. Nếu P1 → BẮT BUỘC tạo L2 file `Tracking/WAVE02/verify/BUG-W02-{NNN}.verify.md` (copy `_TEMPLATE.verify.md`, fill ít nhất Preconditions + Acceptance Criteria).
3. Steps/Expected/Actual → đẩy vào L2 §"Verification Steps" + "Acceptance Criteria".
4. Notes detail → đẩy vào L3 `Execution/bugfixes/BUGFIX-BUG-W02-{NNN}.md` khi FIX_GROUP agent fix (template trong L3 ownership).
5. Cell `Verify → Fix Doc`: `→ verify/BUG-W02-{NNN}.verify.md → Execution/bugfixes/BUGFIX-BUG-W02-{NNN}.md`.

### Step 4 — Status state machine enforcement

Mọi status flip theo §5.1 canonical:
- `OPEN` → `ASSIGNED` → `IN_FIX` → `FIX_DONE` → `VERIFY_PENDING` → `VERIFIED` → `CLOSED`
- Verify FAIL: `VERIFY_PENDING` → `REOPENED` → `IN_FIX` (loop, ghi verdict log L2)
- Env block: any → `DEFERRED` (blocker entry STATE.json) → restore khi unblock
- Sai oracle: any → `INVALID` (terminal, ghi rationale)

KHÔNG dùng legacy enum (`IN_PROGRESS`, `RESOLVED`) trong W02+ row.

### Step 5 — Update sub-agents

| File | Update |
|---|---|
| `.agents/agent-test-api.md` | Allowed Write Scope đã có `verify/` + `repro/` (DONE phase 2). Confirm version bump nếu thêm rules mới. |
| `.agents/agent-test-e2e.md`, `agent-test-ui.md`, `agent-test-isolation.md`, `agent-test-security.md`, `agent-test-performance.md` | Add same pointer block (`> **Bug doc convention (W02+)**: …`) để mọi TEST agent có L2 ownership. |
| `agent-review-backend.md` | Read-only awareness — orchestrator/review có thể spawn lint script. |

### Step 6 — Tooling update

- [ ] Lint script `validate-bugs-md.sh`: thêm support cho slim schema (12 cột). Hiện chỉ check 15-col legacy. Cần update parser logic để handle cả 2 schema (detect by column count hoặc per-wave config).
- [ ] Scaffold script (suggestion): `scripts/scaffold-bug.sh BUG-W02-NNN` — đẻ L1 row stub + L2 template + L3 stub.

## 4. Exit condition

- [ ] W02 wave bắt đầu với BUGS.md schema §3.2 từ row đầu tiên.
- [ ] Mọi P1 bug W02 có L2 verify file (lint PASS).
- [ ] Lint script support slim schema, PASS trên Tracking/WAVE02/BUGS.md.
- [ ] Mọi status flip theo §5.1 canonical (zero usage của `IN_PROGRESS`/`RESOLVED` aliases trong W02+).

## 5. Rollback plan

Nếu W02 phát hiện schema slim KHÔNG fit:
- Revert §3.2/§3.3/§5.1/§5.2 — giữ §3.1 + §5 legacy 5-status duy nhất.
- W02 BUGS.md tạm thời dùng legacy 15-col.
- File CR cho redesign trước W03 kickoff.

## 6. Cross-references

- L1 schema spec: `Tracking/BUGS.md` §3.2 + §3.3 + §5.1 + §5.2 (DONE)
- L1 convention W01: `Tracking/WAVE01/BUGS.md` §0 (DONE)
- W01 phase 1 rationale: `Execution/checklists/impl/BUG-DOC-CONVENTION-W01.md` (DONE)
- Sample W02 row preview: `Tracking/WAVE01/_W02-SCHEMA-PREVIEW.md` (DONE — 3 sample rows minh họa slim format)
- Lint script: `Execution/checklists/impl/scripts/validate-bugs-md.sh` (DONE)

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-10 | 1 | agent-test-api | W02 migration runbook ready — 6 steps + entry/exit/rollback. Spec dependencies: §3.2/§3.3/§5.1/§5.2 in `Tracking/BUGS.md` v5. |
