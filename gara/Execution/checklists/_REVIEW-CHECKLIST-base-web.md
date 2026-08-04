---
type: execution
artifact_kind: review-checklist-base
status: ACTIVE
version: 2
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-07-08"
stack: web
---

# Review Checklist — Base (garage-web · React 19 SPA)

> Composed source. Ghép với `deltas/garage-web.md` → `frontend/gf-gms-web/.harness/_REVIEW-CHECKLIST.md`.
> Dùng bởi **agent-review-garage-web** (REVIEW) **và** DEV/FIX garage-web (self-check trước handoff).
> Base + delta compose bởi `scripts/sync-docs-to-services.sh` §render_review_checklist.

## Checklist

### Kiến trúc & Boundary

- [ ] R1 **Architecture compliance**: khớp `Architecture/hld/garage-web-HLD.md` + GraphQL contract `Architecture/api/agg-garage-graph-graphql.md` (§0 Wave Index + §3<letter> tương ứng wave — read BOUNDED, không read whole file). Doc missing → skip + note.
- [ ] R2 **Boundary isolation**: FE KHÔNG đọc BE Java repo trực tiếp. Data flow CHỈ qua GraphQL (`agg-garage-graph` / `agg-sso-graph`) → backend REST; GraphQL SDL là canonical source-of-truth cho FE. Không cross-feature writes ngoài shared layer.
- [ ] R3 **Coding conventions** (detail → skill `rules-web`): React 19 / TS strict / TanStack Router / Apollo wrappers (`gql` + `useQuery`/`useMutation`) / RHF + Zod / Tailwind v4; `Show` container cho conditional JSX; absolute imports `@/`; no magic values.

### Component Reuse (canonical: registry, KHÔNG phải KG)

- [ ] R4 **Component lookup canonical** (UI work): `.claude/references/component-registry.yaml` là **canonical** — REPLACE `knowledge-graph.yaml implementation.components` cho UI work. Verify: (a) DEV đã Read registry (hook `check-component-registry-read.sh` PreToolUse blocking, v7.6); (b) §1 `lookup:` keys / `aliases:` matched use case; (c) list order theo `layer_priority: [customs, share, ui]` (top = preferred); (d) `when_to_use` / `when_not_to_use` match. Skip lookup / bypass registry = **P1 FM-019**.
- [ ] R4a **Component status lifecycle**: entry §2 phải có `status`: `ready` (reuse trực tiếp), `pending-create` (user approved, tạo file theo `anatomy_sketch` → `/component-mark-ready` flip → `ready`), `deprecated` (KHÔNG reuse, đọc replacement note). Component MỚI merge với `status: pending-create` không flip `ready` sau khi file tạo → **P2**.
- [ ] R4b **FM-018 approval trail** (UI work): file component MỚI trong `src/components/{share,ui,customs}/**` (KHÔNG tính `src/features/*/components/**`) phải có entry trong `.claude/references/component-registry.yaml` §2 với `status: pending-create` (hoặc `ready` nếu đã flip) + `approved_by` + `approved_at` (via `/allow-new-component`). Mới + không approve + không reuse/extend = **P2 FM-018**. Registry drift check: `bash scripts/check-component-registry-drift.sh` warn-only.
- [ ] R4c **Repeated JSX → array + map**: ≥4 sibling cùng component type khác nhau chỉ ở data (label/value/props) → gom `{ label, value }[]` + `.map()` với key ổn định. <4 sibling giữ inline (no premature abstraction). Cấu trúc JSX khác (nested list) KHÔNG gom.

### Figma Fidelity & Discipline (v7.4/v7.5/v7.6)

- [ ] R5 **Figma spec consumption** (UI work): DEV đã Read spec file đúng feature `docs/Product/ux/figma-web/wave{NN}-{feature-slug}[--{screen-slug}].md` (hook `check-figma-spec-read.sh` PreToolUse blocking, v7.5). Spec `transform_version: 7` đọc **9 sections** §0 ASCII → §8 Anti-Pattern Trap theo thứ tự; §9 legacy backward compat only. Handoff report phải cite `spec_sections_consulted` per AC + `anti_pattern_traps_avoided`.
- [ ] R5a **Verbatim Copy Rule** (v7.4): UI text labels / button text / section titles / form field labels / default clauses copy VERBATIM từ spec §1 `content:` / `label:` / `default_clauses:`. Paraphrase clause / label / title = **P1** (legal-document risk). Catalog: `.agents/_ref-web-default-pattern-audit.md` §5 D-19.
- [ ] R5b **Layout Pattern Discipline** (v7.4): spec §1 `direction: grid, cols: N` map cứng `grid-cols-N`; `direction: vertical` map `flex flex-col`. KHÔNG unify variants (Screen A grid vs Screen B stack) lowest-common-denominator. Handoff cite `layout_pattern_decisions[]`. Catalog D-18.
- [ ] R5c **Composite Field Mapping** (v7.4): 1 spec field entry = 1 code field. `combined: true` = 1 input duy nhất; 2 entries riêng = 2 inputs. Cấm auto-composite / auto-split (không "smart merge" khi label semantically concat được). Handoff cite `composite_field_decisions[]`. Catalog D-17.
- [ ] R5d **Spec Md Absolute Trust + Gap Escalation** (v7.4): DEV/FIX (sub-repo) KHÔNG có PNG/MCP access — trust spec md absolutely; ambiguity/missing detail = STOP + document `spec_gaps: [{ spec_section_ref, missing_token_class, attempted_lookup, requested_action }]` (re_prefetch / spec_patch / clarification_from_orchestrator). DEV silent infer / default from context = **P1**.
- [ ] R5e **Visual Fidelity Checklist** (multi-axis): layout/width/column · typography weight · text/background token · border/divider · spacing/alignment · control sizing (HUG vs FILL) · element presence-replace. Divergence không nêu lý do = **P2**. Anti-pattern reuse-shell rule: `ui/Input` không flex → không compose control ngang trực tiếp trên `ui/Input`; reuse `share/inputs/*`.

### GraphQL & Form

- [ ] R6 **GraphQL contract conformance**: mọi op consume phải tồn tại trong `Architecture/api/agg-garage-graph-graphql.md` §3<letter> (BOUNDED read theo §0 Wave Index). Phantom query = **P1**. SDL enum → Dart-analog: dùng đúng enum member (không string literal). Verify shape consistency với wrappers `src/hooks/use-query.ts` + `use-mutation.ts`. SDL identifier drift Vietnamese-romanization = **P1** (evidence: BUG-W02 wave-spec drift entry MEMORY).
- [ ] R7 **Form / schema pattern**: Zod schema trong `schemas/`; RHF resolver dùng schema; không validation business inline JSX. Default values, coercion, infer types theo pattern feature local.
- [ ] R7a **Validation Message Policy** (repo-rules §Validation Message Policy, 2026-07-03): mọi Zod `.message` / i18n error copy phải **100% tiếng Việt có dấu, contextual, thân thiện**. Cấm English generic (`"Required"`, `"Invalid"`, `"String must contain at least N character(s)"`), cấm Vietnamese generic không nêu trường (`"Bắt buộc"`, `"Không hợp lệ"`), cấm thuật ngữ kỹ thuật lộ UI (`regex mismatch`, `NaN`, `null`). Template A–G: `"Vui lòng nhập <tên trường>."` / `"Vui lòng chọn <tên trường>."` / `"<Trường> không hợp lệ"` / range số nêu ngưỡng cụ thể. Zod rule `.min(1)` / `.email()` / `.regex()` không có `message` = fallback English = **P1**. Business refine không quyết được wording → escalate `spec_gaps.requested_action: clarification_from_orchestrator`. Verify grep trong §F của rule.

### Naming & Style

- [ ] R8 **File & folder naming English** (repo-rules §File & Folder Naming, 2026-07-03): mọi file/folder dưới `src/` PHẢI tiếng Anh kebab-case. Cấm Vietnamese romanization filename (`khau-hao-*`, `chi-phi-*`, `nhap-xuat-*`, `hoa-don-*`) hoặc VN abbreviation (`vt`, `cn`, `nv`, `bh`). Exception hẹp: vendor SDK (giữ casing gốc) + generated file (`routeTree.gen.ts`). Verify `bash .claude/scripts/check-comment-rules.sh` cũng scan tên file mới trong diff.
- [ ] R8a **Identifier language**: TS identifier (type / interface / enum / class / function / variable / field / constant) PHẢI tiếng Anh Pascal/camel/UPPER_SNAKE. Cấm Vietnamese romanization identifier (vd `AuthorizationBenUyQuyen`, `khauHaoVT`, `mucI_BenUyQuyen`, `bangChu`, `diaDanhNgayLap`). Form mirror GraphQL input type = copy verbatim SDL field name (`AuthorizationCustomerInput.name`, `compensation.amountNumeric`). Domain term VN thuộc UI copy / label map / KG `display_name`.
- [ ] R8b **Tailwind v4 canonical class names** (repo-rules §Tailwind v4, 2026-07-03): dùng canonical name, KHÔNG alias legacy (vd `break-words` → `wrap-break-word`). Signal IDE warning `suggestCanonicalClasses`. Alias legacy trong diff mới = **P3**; ≥3 file / alias intentional keep = **P2** (log Follow-ups).
- [ ] R8c **Code comment discipline** (`.claude/rules/code-comment-rules.md` v2, 2026-06-15): default policy KHÔNG viết comment. 8 forbidden anti-patterns: bug/ticket IDs (`BUG-W0X-XXX` / `FM-XXX` / `AC-N` / `TC-*-NNN` / `#1234`) · timestamps + version markers (`2026-06-10` / `v2` / `2nd pass`) · removed-code references · WHAT comments · multi-paragraph docblock · design-artifact coupling (Figma node ID / spec `§N.NN` / KG key inline comment) · caller references (`used by X` / `for parity with Y`) · comment thay vì rename. Verify authoritative: `bash .claude/scripts/check-comment-rules.sh` (diff-only, blocking). Default severity **P3**; escalate **P2** khi lan ≥3 files hoặc multi-paragraph docblock cite business rule.

### Security & Backward Compat

- [ ] R9 **Security**: không hardcode secret/token/URL/card token; không read/log/commit `.env*` values; `dangerouslySetInnerHTML` chỉ với sanitized HTML; token/PII/JWT/password không log console; không publish sensitive data vào Kafka.
- [ ] R10 **Backward compatibility**: route shape, prop contract, hook return shape, exported API không break existing callers (check `git diff` exported symbols). Breaking change unflagged = **P0**.

### Handoff, Verify & Hygiene

- [ ] R11 **Verification evidence**: DEV/FIX đã chạy `bash .claude/scripts/verify-frontend.sh` (hoặc `--docs-only`) + `yarn lint` + `yarn build` + report kết quả THẬT. Claim "pass" không có evidence = **P1**. Command supplement khi relevant: `check-comment-rules.sh` (diff blocking) · `check-component-registry-drift.sh` (warn-only) · `check-agent-references.sh` / `check-agent-diff.sh` (agent-runtime maintenance).
- [ ] R12 **Handoff completeness**: Definition Of Done (workflow-rules) complete. Handoff report bắt buộc field (khi UI work v7 spec): `spec_sections_consulted` per AC · `anti_pattern_traps_avoided` · `layout_pattern_decisions[]` (nếu spec grid/vertical divergent) · `composite_field_decisions[]` (nếu spec §5 có `combined:` field) · `spec_gaps[]` (nếu có ambiguity — không được silent complete). Miss = **P2**.
- [ ] R13 **Figma KG integrity** (UI work): patch không break `knowledge-graph.yaml implementation.pages.*.design_refs` (page-level Figma refs, còn active). `implementation.components.*.spec_refs` = historical inventory (không edit thêm cho UI — canonical đã shift sang registry). Mỗi `figma_spec_file` referenced phải tồn tại `docs/Product/ux/figma-web/wave{NN}-{slug}[--{screen}].md`; spec missing → escalate `/prefetch-figma web W{NN} FEAT-{ID}` + `sync-docs-to-services.sh figma garage-web W{NN}`, KHÔNG tự gen spec.
- [ ] R14 **Memory hygiene**: memory decision (`no-write` | `session_only` | `project_candidates`) có evidence ngắn. FIX agent trigger fired → BẮT BUỘC `Rubric Score:` 6-axis block (Stop hook `check-fix-retrospective.sh` blocking; Auto Mode KHÔNG override). Memory entry schema (BUG/FAILURE_PATTERNS) enforced qua `check-memory-entry-schema.sh`. Không spam entry trùng AGENTS.md / CLAUDE.md / `.claude/rules/*` / skills.

---

## Severity Tiers

- **P0**: security breach · secret exposure · data loss · broken deploy · breaking change unflagged · boundary breach (direct DB / cross-boundary write).
- **P1**: convention violation gây regression · missing verification evidence · GraphQL phantom op · backward compat break · verbatim copy paraphrase · SDL drift · English fallback validation message · silent spec inference (v7.4 §Spec Gap Escalation violation).
- **P2**: incomplete handoff · missing memory decision · registry drift (component MỚI không approve / không flip `ready`) · scope creep · layout pattern unify (v7.4 §Layout Pattern Discipline) · composite auto-merge (v7.4 §Composite Field Mapping) · comment discipline lan ≥3 files.
- **P3**: style nit · naming (không thuộc Vietnamese romanization ban) · comment quality single occurrence · optional refactor · Tailwind v4 alias legacy single occurrence.

## Forbidden Actions (reviewer)

- KHÔNG sửa code (read-only). KHÔNG approve khi chưa verify đủ item. KHÔNG suy diễn behavior khi handoff thiếu evidence → log `[P2] handoff incomplete`.
- KHÔNG file finding không reference exact `file:line`. KHÔNG read/log `.env*`.
- KHÔNG force-push (Rule #12 `CLAUDE.md §3.2`).

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 2 | Delivery Authority + main agent | **Major refresh** cascade 6 policy change 2026-06-11 → 2026-07-03: (a) R4 canonical shift KG → `.claude/references/component-registry.yaml` (CLAUDE.md v10-v11); (b) R4a status lifecycle `ready` / `pending-create` / `deprecated` + R4b FM-018 sang registry (drop STATE.json wave_scope); (c) R11 (nay R13) shrink scope drop `implementation.components.*.spec_refs`; (d) add R4c repeated JSX → array+map; (e) add R5a-R5e v7.4 discipline (Verbatim / Layout / Composite / Spec Trust + Gap Escalation / Visual Fidelity Checklist); (f) add R5 Figma spec consumption + hook v7.5/v7.6 enforcement; (g) add R7a Validation Message Policy VN contextual + escalate; (h) add R8/R8a File-folder + identifier English (cấm VN romanization); (i) add R8b Tailwind v4 canonical; (j) add R8c code-comment 8 anti-patterns + `check-comment-rules.sh` diff blocking; (k) enrich R11 with supplement commands; (l) enrich R12 handoff report fields per v7.4; (m) enhance severity tiers with new P0/P1/P2 categories. Sync via `sync-docs-to-services.sh sync garage-web`. Root cause base v1 (2026-06-02) không bump trong 36 ngày qua 6+ policy change. |
| 2026-06-02 | 1 | Delivery Authority | Externalize 12-item web checklist từ `.agents/agent-review-garage-web.md` → base composable. |
