# BUG-DOC-CONVENTION-W01 — Bug Documentation Restructure (phase 1, additive)

**Status**: Applied 2026-06-10 (phase 1 — additive, non-destructive)
**Owner**: agent-test-api (drive), W01 boundary
**Scope**: `Tracking/WAVE01/BUGS.md` + new `Tracking/WAVE01/verify/`
**Migration target**: Full schema reset → W02 kickoff

---

## 1. Vấn đề tồn tại trên BUGS.md trước phase 1

Audit `Tracking/WAVE01/BUGS.md` (33 bug rows, 15 cột) phát hiện 9 gaps khiến DEV fix + TEST verify khó tự động:

1. **Notes column overloaded** — vd cell BUG-W01-013 chứa 3 iteration fix history (~15K ký tự) → agent tốn token parse markdown.
2. **Steps thiếu test data concrete** — "Nhập nhiều chữ số" thay vì giá trị + state cụ thể.
3. **Thiếu Environment field structured** — tenant/SO-id/image-tag/branch nằm rải rác trong Notes.
4. **Status taxonomy không tự-document** — 4 trạng thái (FIXED/RESOLVED/VERIFIED/VERIFIED-FIXED) không có legend inline, phải tra `Tracking/BUGS.md §1, §3.1`.
5. **Bug chain references lỏng lẻo** — chuỗi drift contract (013→014→015→016→017→018) chỉ có trong văn bản Notes.
6. **Manual-QC bug thiếu Source TC ID + verification steps machine-checkable** (BUG-023..033).
7. **Repro script ephemeral** — `/tmp/verify-bug-w01-015.sh` bay theo session.
8. **Thiếu Definition-of-Done cho VERIFY** — agent test phải tự suy diễn acceptance criteria.
9. **Verification audit-log lẫn vào Notes** — re-test timestamp/verifier append mỗi lần → cell phình.

---

## 2. Decision — Three-layer artifact model

Tách 1 row table thành 3 lớp document, mỗi lớp 1 audience:

| Layer | File | Audience | Trách nhiệm |
|---|---|---|---|
| **L1 — Bug Ticket** (slim row) | `Tracking/WAVE01/BUGS.md` | Orchestrator, triage | Trace + status flip. Notes chỉ link L2/L3. |
| **L2 — Verification Plan** | `Tracking/WAVE01/verify/BUG-W01-{NNN}.verify.md` | TEST agent | Machine-checkable DoD — preconditions + steps + acceptance + verdict log. |
| **L3 — Fix Artifact** | `Execution/bugfixes/BUGFIX-BUG-W01-{NNN}.md` | DEV/FIX agent | Root-cause + iteration history + regression test reference. |

**Rationale**: Mỗi agent loại chỉ load file cần — TEST agent verify chỉ đọc L2 (~50 dòng), KHÔNG cần đọc cell Notes 15K ký tự. DEV agent fix lookup L3 → có full context, KHÔNG bị triage noise.

---

## 3. Status state machine (canonical)

Bỏ taxonomy hỗn loạn `FIXED` / `RESOLVED` / `VERIFIED` / `VERIFIED-FIXED`. Map sang:

| Canonical | Ý nghĩa | Legacy alias |
|---|---|---|
| `OPEN` | logged, chưa assign | — |
| `ASSIGNED` | assigned, chưa fix | — |
| `IN_FIX` | đang fix | — |
| `FIX_DONE` | fix merged + regression local PASS | `FIXED` |
| `VERIFY_PENDING` | chờ TEST re-test live | `RESOLVED` (deferred-verify) |
| `VERIFIED` | TEST re-test live PASS | `VERIFIED`, `VERIFIED-FIXED`, `RESOLVED` (post live re-run) |
| `REOPENED` | verify FAIL → back to IN_FIX | — |
| `DEFERRED` | env block (blocker logged in STATE) | — |
| `INVALID` | sai oracle / not-a-defect | — |

Promote status → append 1 dòng vào L2 §Verdict Log + bump cell `Status` trong L1.

---

## 4. Phase 1 — Applied 2026-06-10 (non-destructive)

| Action | File | Status |
|---|---|---|
| Section 0 inline (convention + state machine + bug chain map) | `Tracking/WAVE01/BUGS.md` | DONE |
| `verify/README.md` (index + workflow + template pointer) | `Tracking/WAVE01/verify/README.md` | DONE |
| `verify/_TEMPLATE.verify.md` (scaffold) | `Tracking/WAVE01/verify/_TEMPLATE.verify.md` | DONE |
| L2 verify file cho 7 P1 bug | `Tracking/WAVE01/verify/BUG-W01-{005,013,014,015,018,029,031}.verify.md` | DONE |
| Decision rationale (this doc) | `Execution/checklists/impl/BUG-DOC-CONVENTION-W01.md` | DONE |

KHÔNG đụng:
- Schema table BUGS.md (15 cột giữ nguyên — slim sang cột mới chỉ ở W02).
- Notes cells legacy (overloaded cells tự slim khi bug được re-touch — không bulk rewrite).
- `Execution/bugfixes/BUGFIX-*.md` (per-fix agents own).

---

## 5. Phase 2 — Sẽ thực hiện trong W01 nếu có thời gian

- [ ] Migrate `/tmp/verify-bug-w01-*.sh` ad-hoc → `Execution/bugfixes/repro/BUG-W01-*.sh` (per-bug, ≥ 4 P1 bug).
- [ ] L2 verify file cho 4 P2 manual-QC bug critical (BUG-025/026/027 cluster insurance toggle).
- [ ] Script `scripts/validate-bugs-md.sh` (lint: assert mỗi P1 row có L2 link + Status ∈ enum). _Note: `scripts/` ngoài owned_paths agent-test-api — escalate qua orchestrator._

---

## 6. Phase 3 — W02 kickoff (full schema)

New BUGS.md schema (12 cột, slim):

| Cột | Note |
|---|---|
| Bug ID | giữ |
| Wave | giữ |
| Severity | giữ |
| Status | enum đóng (state machine §3) |
| Title | ≤ 120 ký tự, 1 ý duy nhất |
| Spec | gộp Feature ID + AC Ref |
| Source TC ID | bắt buộc (cấp TC manual cho QC bug) |
| Reporter / Assigned | giữ 2 cột |
| Related Bugs | **mới** — chain map |
| Environment | **mới** — tenant/SO/image trên 1 dòng |
| Verify | **mới** — link L2 |
| Fix Doc | **mới** — link L3 |

Bỏ: Steps / Expected / Actual / Notes inline → đẩy hết về L2/L3.

---

## 7. Cross-references

- L1 schema legacy: `Tracking/BUGS.md` §1, §3.1
- L1 convention W01: `Tracking/WAVE01/BUGS.md` §0
- L2 index: `Tracking/WAVE01/verify/README.md`
- L3 fix doc pattern: `Execution/bugfixes/BUGFIX-BUG-W01-*.md` (existing, per-fix agents)
- STATE blocker convention: `Execution/STATE.json` (`blockers[]` cho DEFERRED bugs)
- Architecture decision context: `DOC-DEPENDENCY-MAP.md` (T0 tier)

---

## 8. Verification (self-check sau khi apply phase 1)

- [x] `Tracking/WAVE01/BUGS.md` Section 0 inline, table không bị xáo trộn (33 row giữ nguyên).
- [x] `Tracking/WAVE01/verify/` exists với README + _TEMPLATE + 7 L2 files cho P1.
- [x] Mỗi L2 file có: Preconditions, Verification Steps, Acceptance Criteria (machine-checkable), Source TC, Repro Script path, Evidence, Verdict Log, Related Bugs.
- [x] Decision rationale (this doc) ghi đầy đủ phase plan.
- [ ] Phase 2/3 — pending future work.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-10 | 1 | agent-test-api | Phase 1 applied — Section 0 inline + L2 verify scaffold + 7 P1 verify files + this rationale doc. Non-destructive, table schema giữ nguyên. |
