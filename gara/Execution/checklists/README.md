---
type: execution
artifact_kind: checklist-registry
status: ACTIVE
version: 4
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
---

# Execution/checklists — Review & Implementation checklists

Single source-of-truth cho **review criteria** và **implementation work-breakdown** dùng
trong vòng DEV→REVIEW. Thay cho checklist embedded trong `.agents/agent-review-*.md`.

## Mô hình base + delta

Review checklist được **compose** từ 2 phần (DRY):

```
_REVIEW-CHECKLIST-base-{stack}.md   (shared per stack: backend | web | mobile)
        +
deltas/{boundary}.md                (boundary-specific overlay từ KG + gotchas + ADR)
        ↓  (scripts/sync-docs-to-services.sh sync → render_review_checklist)
{tier}/{boundary}/.harness/_REVIEW-CHECKLIST.md   (composed, read-only mirror)
```

Stack mapping (theo `boundary_kind` trong sync script):

| Stack | Base file | Boundaries |
|---|---|---|
| backend | `_REVIEW-CHECKLIST-base-backend.md` | 14 Java + 2 BFF (BFF-only items đánh dấu trong base) |
| web | `_REVIEW-CHECKLIST-base-web.md` | garage-web |
| mobile | `_REVIEW-CHECKLIST-base-mobile.md` | garage-mobile |

> **Vì sao 3 base thay vì 1**: plan ban đầu ghi "1 base 19 mục" nhưng 3 stack diverge căn bản
> (Hexagonal Java vs React vs Flutter). Tách base theo stack giữ đúng tinh thần base+delta mà
> không ép tiêu chí chéo stack. Item dùng chung mọi stack (boundary isolation, security, tenant,
> backward-compat) lặp lại có chủ đích ở mỗi base để base self-contained khi sync xuống.

## Implementation checklist

`_IMPLEMENTATION-CHECKLIST.md` là **per-wave-per-boundary**, generate bởi orchestrator
(Delivery Authority) **trước** khi `/spawn-dev`. Xem `planning-wave` Step 4.5 để biết đầy đủ
logic gen.

### Source hierarchy (2 tier)

| Tier | Source | Khi nào dùng |
|---|---|---|
| **wave-spec** (authoritative) | `Execution/wave-specs/W{NN}/Product/features/{tier}/FEAT-*.md` §2+§3+§8+§9 | Khi `/gen-execution-spec {NN}` đã chạy và wave-spec dir tồn tại |
| **pkg-fallback** | `PKG-W{NN}` §2/{tier} + `wave-{N}-tasks.md` + `Product/features/FEAT-*.md` ACs | Khi wave-spec chưa gen (default hiện tại) |

Ngoài ra luôn đọc: `.harness/_REVIEW-CHECKLIST.md` của boundary (R*/D* items — shift-left pre-empt).

### Phase structure

Nếu wave block của boundary có **Phase A** + **Phase B**, checklist dùng cấu trúc 2-phase:

```
## Phase A — <title>
- [ ] T1 … · layer:`db` · seq:`S1`
...
### Phase A Exit Gate
- [ ] G-A1 Build + test Phase A pass
- [ ] G-A2 <gate cụ thể>
## Phase B — <title>
- [ ] T{n} … · seq:`S5`
```

Nếu wave là single-phase → dùng section `## Tasks` (backward-compatible, không phase gate).

### Task format

```
- [ ] T{n} <mô tả tiếng Việt> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R*/D*`
  [optional khi source=wave-spec]: · layer:`<domain|app|adapter|db|test|schema|resolver|cubit>` · seq:`<S1-S6>`
```

Phase gate items dùng prefix `G-A{n}` (không phải `T{n}`) — scripts/check-impl-checklist.sh chấp nhận cả hai.

Template: `_TEMPLATE-implementation-checklist.md` (version 3+, 2-phase + single-phase). Output đặt tại
`Execution/checklists/impl/_IMPLEMENTATION-CHECKLIST-W{NN}-{boundary}.md` và sync xuống
`{tier}/{boundary}/docs/Product/` (wave-scoped — clear khi `reset`).

## Trách nhiệm generate (Delivery Authority)

1. **Review delta** (`deltas/{boundary}.md`): viết một lần per boundary từ KG, ADR, gotchas.
   Dùng `_TEMPLATE-review-delta.md`. Bump version 3-in-1 khi sửa.
2. **Implementation checklist**: generate mỗi wave per boundary qua `planning-wave` Step 4.5;
   orchestrator **review + xác nhận** trước spawn. Chọn source tier phù hợp (wave-spec > pkg-fallback).

## Ngôn ngữ checklist (authoring rule)

Mô tả task (`<mô tả atomic>` trong impl checklist) và mô tả review item viết bằng
**tiếng Việt có dấu**. NGOẠI LỆ giữ nguyên (không dịch, không bỏ dấu): keyword kỹ thuật /
định danh — tên file & path, class/method/biến, FEAT-ID & AC-ID, review-ID (R*/D*),
status token (`[x]`, `[deferred]`), tên boundary, command/flag, thuật ngữ tech (REST, Kafka,
outbox/inbox, GraphQL, Temporal, Flyway, JPA…). Các field machine-parse (`scope:`/`ac:`/
`review:`/`layer:`/`seq:`) luôn giữ dạng keyword. Áp dụng khi orchestrator generate (Step 4.5 `planning-wave`).

## Status item

- `- [ ] Rn …` chưa làm / chưa verify
- `- [x] Rn …` đã thỏa
- `- [deferred:<lý do>] Rn …` chủ động defer (Stop hook chấp nhận, log vào DEBT-REGISTRY)

## Rule-change → Checklist review cascade policy

Base review checklist (`_REVIEW-CHECKLIST-base-{stack}.md`) đóng vai trò canonical criteria
mà reviewer + DEV self-check dựa vào. Khi rule tầng canonical (repo rules, comment rules,
figma workflow, hook enforcement, doc-dependency policy, KG-first policy) đổi mà base
không bump → downstream `.harness/_REVIEW-CHECKLIST.md` mirror ra reviewer sẽ point sai
source / miss item / dùng ngưỡng đã lỗi thời (root cause của gap 2026-06-11 → 2026-07-03).

### Trigger — file/nhóm nào đổi thì BẮT BUỘC review + bump base

| Source thay đổi | Base bắt buộc review | Ghi chú |
|---|---|---|
| `frontend/gf-gms-web/.claude/rules/*.md` (repo-rules, code-comment-rules, figma-workflow-rules, boundary-guard…) | `_REVIEW-CHECKLIST-base-web.md` | Web-only |
| `mobile/gf-garage-app/.claude/rules/*.md` (Flutter/BLoC rules, mobile figma rules, mobile guard) | `_REVIEW-CHECKLIST-base-mobile.md` | Mobile-only |
| `services/{b}/.claude/rules/*.md` (Java/Spring/BFF Node rules) | `_REVIEW-CHECKLIST-base-backend.md` | Backend + BFF |
| `CLAUDE.md` §2 (context reading list), §3.2 (Critical Rules), §5 (Boundary Rules) — design repo | Cả 3 base | Cross-stack cascade |
| `DOC-DEPENDENCY-MAP.md` §3.1 (propagation rules, severity classes) | Cả 3 base | T0 policy — highest severity |
| `.claude/references/web-component-registry.yaml` — schema hoặc `status_values` đổi (không phải component entry mới) | `_REVIEW-CHECKLIST-base-web.md` | Registry canonical shift (2026-06-22 tương tự) |
| `.agents/_ref-figma-*.md` — `transform_version` bump | `_REVIEW-CHECKLIST-base-web.md` + `_REVIEW-CHECKLIST-base-mobile.md` | UI stack |
| `scripts/hooks/check-*.sh` — mechanical enforcement hook thêm mới hoặc bị remove | Base tương ứng theo stack hook cover | E.g. `check-figma-spec-read.sh` (2026-07-02) → web + mobile |

### Cascade obligation

- Rule change diff → CR (severity ≥ MINOR theo `DOC-DEPENDENCY-MAP.md §3.1`) → cascade bump base
  checklist trong **cùng CR** (không delay sang CR sau). Nếu ≥ 30 ngày kể từ policy change gần nhất
  mà base + delta chưa bump → `check-review-checklist-drift.sh` warn.
- Bump theo chuẩn 3-in-1: `version` + `last_reviewed` + Change Log entry ghi rõ policy change
  trigger review, R items nào add / rename / drop. Reviewer đọc Change Log là biết delta rule.
- Item cross-stack (boundary isolation, tenant filter, security header, backward-compat contract)
  duplicate có chủ đích ở 3 base — chỉ update tại base scope liên quan trực tiếp policy change,
  base khác giữ nguyên trừ khi policy đó cover cross-stack.

### Delta files

Delta boundary (`deltas/{boundary}.md`) chỉ chứa item **boundary-specific** (KG entities, ADR
riêng, gotcha per-boundary). Item áp dụng cho tất cả boundary trong 1 stack → belong base, KHÔNG
copy sang delta. Vi phạm sẽ khiến drift script không catch được (script chỉ so sánh base
`last_reviewed` vs source rule mtime).

### Drift check

`scripts/check-review-checklist-drift.sh` (warn-only, exit 0 luôn) parse `last_reviewed` từ base
frontmatter, so với `git log -1 --format=%ct` của source rule/policy tương ứng. Chạy ad-hoc hoặc
wire vào CI local — output table `{base_file} | {stale_by_days} | {trigger_source}`. Không block
merge — trách nhiệm bump nằm ở CR author, drift script chỉ hỗ trợ visibility.

## Pilot scope (2026-06)

EP-INSURANCE-SETTLEMENT W01 — 5 boundary: `gf-sales`, `gf-accounting`, `agg-garage-graph`,
`garage-web`, `garage-mobile`. 13 boundary còn lại generate delta sau khi pilot đo hiệu quả.

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 4 | main agent + subagent flow-doc | Add § Rule-change → Checklist review cascade policy + drift-check script + composite banner + template delta section clarification. Root cause: base-web v1 (2026-06-02) không bump qua 6 policy change 2026-06-11 → 2026-07-03 (code-comment-rules v1/v2, canonical registry shift, figma-workflow-rules v7.4/v7.5/v7.6, repo-rules validation message + file naming + Tailwind v4 + JSX Array-map); downstream reviewer dùng R4/R4b/R11 outdated. |
| 2026-06-20 | 3 | Delivery Authority | Thêm § Source hierarchy (2-tier: wave-spec vs pkg-fallback), § Phase structure (2-phase vs single-phase, Phase Exit Gate, G-A prefix), thêm `layer:`/`seq:` vào task format. Update § Implementation checklist để ref planning-wave Step 4.5 thay vì inline list nguồn. |
| 2026-06-03 | 2 | Delivery Authority | Thêm § Ngôn ngữ checklist authoring rule; note BFF-only items trong base backend. |
| 2026-05-28 | 1 | Delivery Authority | Initial — base+delta model, 3 stacks, pilot scope W01. |
