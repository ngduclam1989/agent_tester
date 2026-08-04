---
name: multi-feature-tc-grouping-w01
title: TC Generation Strategy — Per-wave × Per-agent với Multi-Feature Internal Grouping
wave: W01
status: APPLIED (agent-test-api) + PROPOSAL (7 agents còn lại + test-plan.md + TC-TEMPLATE.md)
reporter: agent-test-api
created: 2026-06-10
version: 1
related:
  - .agents/agent-test-api.md
  - .claude/commands/test-plan.md
  - Execution/test-cases/TC-TEMPLATE.md
---

# Multi-Feature TC Grouping — Decision + Cross-Agent Rollout

> Mục đích: chốt strategy gen TC khi wave có ≥2 feature, và đề xuất CR cho 7 agent test còn lại + 2 file ngoài OWNED_PATHS (test-plan.md + TC-TEMPLATE.md).

## 1. Decision

**Strategy đã chọn**: per-wave × per-agent (8 file/wave) **+ modular hoá nội bộ qua heading per feature**.

**Strategy đã từ chối**: per-feature × per-agent (N feature × 8 agent = N×8 file/wave).

### Rationale tóm tắt

| Khía cạnh | Per-wave (chọn) | Per-feature (từ chối) |
|---|---|---|
| Orchestrator | ✅ Khớp `spawn-test.sh` + `check-tc-coverage.py` + `check-tc-pass-rate.py` | ❌ Refactor dynamic spawn matrix |
| Wave semantic | ✅ Wave = execution unit (STATE.wave + features_in_flight) | ❌ Mờ ranh giới wave vs feature |
| Cross-feature regression matrix | ✅ Giữ trong cùng file | ❌ Merge từ N file mất ngữ cảnh |
| Bug → TC traceability | ✅ TC ID đơn giản | ❌ TC ID dài hoặc conflict cross-feature |
| Status aggregate | ✅ §3 Status Summary 1 lần/agent | ❌ Merge N file → exit_criteria phức tạp |
| File explosion | ✅ 8 file/wave luôn cố định | ❌ W01 (2 FEAT)=16; W10 (7 FEAT)=56 |
| Feature scope clarity | ⚠️ Phụ thuộc heading per feature | ✅ Mỗi file 1 feature |
| Cross-wave reuse | ⚠️ Extract section | ✅ Copy file |

**Kết luận**: trade-off thiên về per-wave. Phần "Feature scope clarity" yếu của per-wave được lấp bằng modular hoá nội bộ qua H3 heading + TC ID FEAT-discriminator + Status Summary aggregate per feature.

## 2. Convention bắt buộc (khi wave ≥2 feature)

### 2.1 §4 Test Cases — H3 heading per feature

```markdown
## 4. Test Cases

### 4.1 FEAT-INS-SO-ADJUSTMENT
| TC ID | Title | Steps | Expected | Status | Bug ID |
| TC-W01-API-SOADJ-001 | ... |

### 4.2 FEAT-INS-STL-DETAIL
| TC ID | Title | Steps | Expected | Status | Bug ID |
| TC-W01-API-STL-001 | ... |
```

- Heading dùng FEAT-ID đầy đủ (vd `FEAT-INS-SO-ADJUSTMENT`), KHÔNG viết tắt.
- Bảng TC theo schema cột `Execution/test-cases/TC-TEMPLATE.md` — KHÔNG đổi.
- TC cross-feature (impact ≥2 FEAT) → đặt ở heading FEAT chính (FEAT chứa endpoint trigger), Title ghi `(cross-impact: FEAT-XXX)`.

### 2.2 TC ID convention — FEAT-discriminator

Format: `TC-W{NN}-{TYPE}-{FEAT-SLUG}-{seq:03d}`

| FEAT-ID | Slug đề xuất | Lý do |
|---|---|---|
| FEAT-INS-SO-ADJUSTMENT | `SOADJ` | discriminator giữa SO + Adjustment |
| FEAT-INS-STL-DETAIL | `STL` | settlement detail |
| FEAT-BKG-CREATE | `BKG` | booking creation |
| FEAT-INV-RECEIPT | `RCPT` | inventory receipt |

- Slug ≤8 ký tự UPPER, unique trong wave.
- Mapping `FEAT-ID → SLUG` ghi ở `Test Environment & Data`.
- Wave 1 feature: slug optional (`TC-W01-API-001` vẫn hợp lệ — backwards-compat).

### 2.3 §3 Status Summary — sub-table per feature

```markdown
## 3. Status Summary

| Feature | Total | PASS | FAIL | BLOCKED | SKIPPED |
|---|---|---|---|---|---|
| FEAT-INS-SO-ADJUSTMENT | 32 | 28 | 3 | 0 | 1 |
| FEAT-INS-STL-DETAIL | 18 | 15 | 2 | 1 | 0 |
| **Wave total** | **50** | **43** | **5** | **1** | **1** |
```

KHÔNG tạo top-level section mới (giữ artifact-policy Step 8).

### 2.4 Cross-feature impact matrix

Ghi ở `Test Environment & Data`:

```markdown
**Cross-feature impact matrix** (W01):
| Trigger FEAT (update) | Impacted FEAT (operational) | Endpoint chạm | TC regression |
|---|---|---|---|
| FEAT-INS-SO-ADJUSTMENT | FEAT-SO-CREATE | POST /api/v3/service-orders | TC-W01-API-SOADJ-015 (regression) |
```

### 2.5 Escalate threshold (split file riêng — CR-needed)

Chỉ escalate split per-feature file khi đồng thời:
- Wave có ≥5 feature **VÀ**
- Estimated TC > 100 case **VÀ**
- Lifecycle feature độc lập (defer/cancel mid-wave).

Wave W01-W03 (TD P0) đều ≤3 feature → KHÔNG trigger.

## 3. Rollout status

### A. APPLIED — agent-test-api (✅ in OWNED_PATHS)

- `.agents/agent-test-api.md` v7 → v8:
  - Forbidden Action mới `API_MULTI_FEATURE_GROUPING_MISS`
  - Step 6.2 (Multi-feature grouping gate)
  - §Multi-Feature Wave Grouping section
  - Change Log entry

### B. PROPOSAL — 7 test agents còn lại (CR-NEEDED)

| Agent | File | Forbidden Action mới |
|---|---|---|
| agent-test-e2e | `.agents/agent-test-e2e.md` | `E2E_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-ui | `.agents/agent-test-ui.md` | `UI_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-mobile-e2e | `.agents/agent-test-mobile-e2e.md` | `MOBILE_E2E_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-mobile-ui | `.agents/agent-test-mobile-ui.md` | `MOBILE_UI_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-isolation | `.agents/agent-test-isolation.md` | `ISO_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-performance | `.agents/agent-test-performance.md` | `PERF_MULTI_FEATURE_GROUPING_MISS` |
| agent-test-security | `.agents/agent-test-security.md` | `SEC_MULTI_FEATURE_GROUPING_MISS` |

Mỗi agent áp dụng cùng pattern: thêm Forbidden Action + Step 6.x trong TEST_PLANNING + §Multi-Feature Wave Grouping section (reference checklist này thay vì duplicate full content) + bump version + Change Log.

### C. PROPOSAL — 2 file convention ngoài OWNED_PATHS (CR-NEEDED)

#### C.1 `.claude/commands/test-plan.md` — Step 3

Thêm note trước "Spawn 8 test agents IN PARALLEL":

```markdown
> **Multi-feature wave grouping**: khi `state.features_in_flight` có ≥2 FEAT-ID, mỗi agent phải chia §4 Test Cases theo heading H3 per feature + TC ID FEAT-discriminator. Decision rationale + format: `Execution/checklists/impl/MULTI-FEATURE-TC-GROUPING-W01.md`. Wave có đúng 1 feature → §4 phẳng (backwards-compat).
```

Update §QA review checklist (Step 5) thêm 1 dòng:
```markdown
- [ ] **Multi-feature grouping** (khi wave ≥2 feature): mỗi file `TC-W${WAVE}-*.md` có §4 chia H3 per feature, TC ID có FEAT-discriminator, Status Summary aggregate per feature (no `*_MULTI_FEATURE_GROUPING_MISS` open).
```

Update Step 6 exit_criteria array thêm `multi_feature_grouping_ok`:
```json
{"id":"multi_feature_grouping_ok","desc":"Khi wave ≥2 feature: §4 chia H3 per FEAT + TC ID FEAT-discriminator + Status Summary aggregate per FEAT trong 8 file. Wave 1 feature → auto met.","met":false}
```

#### C.2 `Execution/test-cases/TC-TEMPLATE.md` — example block

Thêm sub-section ở §4 example để guide agent:

```markdown
### Multi-feature variant (khi wave có ≥2 feature)

Chia heading H3 per feature; TC ID có FEAT-slug discriminator.

\`\`\`markdown
### 4.1 FEAT-XXX-YYY
| TC ID | ... |
| TC-W{NN}-{TYPE}-XXX-001 | ... |

### 4.2 FEAT-AAA-BBB
| TC ID | ... |
| TC-W{NN}-{TYPE}-AAA-001 | ... |
\`\`\`

Wave 1 feature → giữ §4 phẳng (no heading).
```

## 4. Action Items

1. ✅ Apply `.agents/agent-test-api.md` v8 — đã commit cùng artifact này.
2. ⏳ Raise CR cho 7 agent test còn lại theo §3.B (reuse pattern v8 của agent-test-api, reference checklist này — KHÔNG duplicate full content). Reviewer: TEST_GROUP lead.
3. ⏳ Raise CR cho `.claude/commands/test-plan.md` theo §3.C.1 (Step 3 note + Step 5 QA checklist + Step 6 exit_criteria). Reviewer: Orchestrator authority.
4. ⏳ Raise CR cho `Execution/test-cases/TC-TEMPLATE.md` theo §3.C.2 (multi-feature variant example). Reviewer: QA Authority.
5. ⏳ Update `scripts/check-tc-coverage.py` + `scripts/check-tc-pass-rate.py` để parse Status Summary sub-table per feature (optional — current aggregate-only vẫn pass criteria).

## 5. Verification (self-check)

- [x] Decision documented với rationale 8-điểm trade-off table.
- [x] Convention format đủ 5 phần (heading + TC ID + Status Summary + impact matrix + escalate threshold).
- [x] Rollout status tách 3 nhóm rõ (APPLIED / PROPOSAL agent / PROPOSAL convention).
- [x] Action items có owner + reviewer.
- [ ] CR raised cho 7 agent + 2 file convention — pending.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-10 | 1 | agent-test-api | Initial decision + rollout proposal. APPLIED cho agent-test-api v8; PROPOSAL CR cho 7 agent + test-plan.md + TC-TEMPLATE.md. |
