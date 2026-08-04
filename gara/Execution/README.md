---
type: execution-index
artifact_kind: execution-index
status: ACTIVE
version: 4
tier: T3
owner_authority: Delivery Authority
last_reviewed: "2026-06-17"
---

# Execution Layer — Garage ADLC

> Layer này chứa tất cả artifacts điều phối thực thi dự án **Garage** theo quy trình ADLC.
> Scope: **18 service boundaries  × 45 agents**.
> Hiện trạng: chỉ **Wave 0 — Brownfield Baseline** đã `DONE` (2026-05-14 → 2026-05-25); chi tiết xem [WAVE-TRACKER.md](WAVE-TRACKER.md).

## Thứ tự đọc

1. **WAVE-TRACKER.md** — **Trạng thái thực thi sóng hiện tại** — stage pipeline, agent assignments, entry/exit criteria, blockers
2. **MASTER-EXECUTION-PLAN.md** — Topology thực thi, exit criteria từng stage, retry/rollback policy
3. **SERVICE-BOUNDARY-MATRIX.md** — Ma trận 18 boundaries: owner, modules, access control, forbidden scope
4. **AGENT-REGISTRY.md** — Registry 45 agents chia 4 groups (DEV 18, FIX 18, REVIEW 3, TEST 6) với contract đầy đủ
5. **PRE-EXECUTION-RUNBOOK.md** — Checklist readiness trước mỗi wave + sign-off
6. **work-packages/PKG-\*.md** — Work packages cho từng wave, mỗi file = 1 package
7. **knowledge-graphs/\*.yaml** — Knowledge graphs cho từng boundary

## Danh sách file

| # | File | Artifact Kind | Tier | Mô tả |
|---|------|---------------|------|--------|
| 1 | [WAVE-TRACKER.md](WAVE-TRACKER.md) | wave-tracker | T3 | **Trạng thái thực thi sóng hiện tại** — auto-rendered ledger (schema v2: 8 sections + appendix). Sources: STATE.json + WAVE-SEQUENCE.md + PRE-EXECUTION-RUNBOOK.md + handoffs/ + test-reports/ + BUGS.md + .transition-log.jsonl. Render: `bash scripts/render-wave-tracker.sh` · Drift check: `--check` |
| 2 | [MASTER-EXECUTION-PLAN.md](MASTER-EXECUTION-PLAN.md) | master-execution-plan | T3 | Kế hoạch thực thi tổng thể |
| 3 | [SERVICE-BOUNDARY-MATRIX.md](SERVICE-BOUNDARY-MATRIX.md) | service-boundary-matrix | T3 | Ma trận ranh giới 18 boundaries |
| 4 | [AGENT-REGISTRY.md](AGENT-REGISTRY.md) | agent-registry | T3 | Registry và contract 45 agents (DEV 18 + FIX 18 + REVIEW 3 + TEST 6) |
| 5 | [PRE-EXECUTION-RUNBOOK.md](PRE-EXECUTION-RUNBOOK.md) | pre-execution-runbook | T3 | Checklist readiness trước thực thi |
| 6 | [work-packages/](work-packages/) | work-package | T4 | Work packages theo wave (10 files) |
| 7 | [knowledge-graphs/](knowledge-graphs/) | knowledge-graph | T4 | 21 YAML (18 boundary KG + 1 UI label map + 2 templates)  |
| 8 | [handoffs/](handoffs/) | handoff | T4 | Handoff records giữa các stages/waves |


## Thư mục con

```
Execution/
├── README.md                       ← File này
├── WAVE-TRACKER.md                 ← Living doc: trạng thái sóng hiện tại
├── MASTER-EXECUTION-PLAN.md
├── SERVICE-BOUNDARY-MATRIX.md
├── AGENT-REGISTRY.md
├── PRE-EXECUTION-RUNBOOK.md
├── work-packages/
│   ├── _TEMPLATE-PKG.md
│   └── PKG-W{NN}-{vertical-slice}.md
├── knowledge-graphs/
│   ├── _TEMPLATE-knowledge-graph.yaml
│   └── {boundary}.knowledge-graph.yaml
├── handoffs/
│   └── HANDOFF-TEMPLATE.md
├── test-cases/
├── test-reports/
├── bugfixes/
└── agentic-workflows/
```


## Quy tắc

- Mọi thay đổi cross-boundary phải qua `Tracking/CHANGE-REQUESTS.md`
- Mỗi agent chỉ được write vào boundary mình sở hữu (xem `SERVICE-BOUNDARY-MATRIX.md`)
- Exit criteria phải PASS trước khi chuyển stage (xem `MASTER-EXECUTION-PLAN.md §2`)
- Mỗi agent chỉ được write vào boundary mình sở hữu — enforce qua `owned_paths` trong [SERVICE-BOUNDARY-MATRIX.md §1.1](SERVICE-BOUNDARY-MATRIX.md). Runtime: `check-boundary.sh` hook validate fnmatch + prefix match.
- **KG-first authoring** ([CLAUDE.md §3.2](../CLAUDE.md) rule 3): Product/Architecture docs CHỈ dựa trên [knowledge-graphs/](knowledge-graphs/) — nguồn chính thức duy nhất. Không suy luận thông tin ngoài KG — hỏi Business Authority khi thiếu.

## Change Log

| Ngày | Version | Thay đổi | Tác giả |
|---|---|---|---|
| 2026-05-25 | 1 | Initial execution index: reading order, file list (4 artifacts), directory tree, rules. Đồng bộ 18 boundaries  / 44 agents / 21 KG files. | Delivery Authority |
| 2026-05-27 | 2 | Sync boundary/agent counts với reality: §1 description, reading order #3/#4, file list #3/#4 — 21→18 boundaries, 50→44 agents (DEV 18 + FIX 18 + REVIEW 2 + TEST 6). Triggered bởi `Execution/MASTER-EXECUTION-PLAN.md` v1 creation cùng ngày. | Delivery Authority |
| 2026-05-29 | 3 | Sync agent count 44→45 (REVIEW 2→3): tách review BE / web / mobile. agg-garage-graph review qua agent-review-backend. | cuongnguyen_ac |
| 2026-06-17 | 4 | Update §Danh sách file row 1 WAVE-TRACKER.md description — reflect schema v2 (8 sections + appendix), enumerate derived-from sources (STATE + WAVE-SEQUENCE + RUNBOOK + handoffs + test-reports + BUGS), nhắc `--check` drift gate. | Delivery Authority |
