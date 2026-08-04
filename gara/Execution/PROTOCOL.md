---
type: execution
artifact_kind: protocol
status: ACTIVE
version: 16
tier: T0
owner_authority: Delivery Authority
last_reviewed: "2026-06-29"
---

# Wave Execution Protocol — Garage

> Stage-by-stage execution procedure cho **10-stage operational pipeline** (Pre-flight + PLANNING → DEV → REVIEW → TEST_PLANNING → TEST_EXECUTION → QC → RELEASE → WAVE_END + FALLBACK).
> **Canonical STATE machine**: `ADLC.md §5.1` = 7 core stages (PLANNING → DEV_GROUP → REVIEW_GROUP → TEST_PLANNING → TEST_EXECUTION → QC → RELEASE). PROTOCOL = operational expansion: Pre-flight (automatic hook gate trước mọi stage), WAVE_END + FALLBACK (sub-steps trong `/wave-end`, `/blocker-raise`, `/cr-raise` commands) — KHÔNG phải `STATE.stage` transitions độc lập.
> Triggered by slash commands trong `.claude/commands/`. **Chỉ load §<stage>** khi vào stage — KHÔNG đọc full file.
>
> **Currently active**: W01/PLANNING — TD P0 Backend Remediation (features: TD-BE-001, TD-BE-002). 3 sequential waves: W01 (Backend, 3d) → W02 (Frontend Web, 2d) → W03 (Mobile, 2d) với hard gates.

---

## Index

- **§0** — Pre-flight (mọi stage)
- **§PLANNING** — wave setup (after `/wave-start`)
- **§DEV** — implement boundary
- **§REVIEW** — code review + boundary compliance
- **§TEST_PLANNING** — generate test cases
- **§TEST_EXECUTION** — execute tests + file bugs
- **§QC** — QA Authority manual sign-off (human gate)
- **§RELEASE** — deploy + actuals doc
- **§WAVE_END** — close wave + archive + KG update
- **§FALLBACK** — Blocker / Change Request / Rollback

---

## §0 Pre-flight (chạy trước mọi stage)

```bash
1. python3 scripts/state.py validate          # STATE.json consistent?
2. python3 scripts/state.py summary           # confirm wave/stage/boundary
3. python3 scripts/state.py get blockers      # có gì block không?
4. Confirm agent_active = mình (spawn template đã set)
```

Nếu validate fail → STOP. Báo human Authority. **Không bypass** (Critical Rule #11 + FM-006).

---

## §PLANNING

**Entry**: `/wave-start <NN>` — sets `stage=PLANNING`, `wave=NN`, resets `features_in_flight`/`blockers`/`exit_criteria`.

> **Carryover Audit** (Step 1.5, tự động trong `/wave-start`, chỉ khi wave > W01):
> Trước khi activate PLANNING, `/wave-start` kiểm tra items tồn đọng từ wave trước:
>
> - **CR chưa resolved**: đọc `Execution/STATE.json → cr_log[]` where `resolved == false`
> - **Open debt**: đọc `Tracking/DEBT-REGISTRY.md` where `Status ∈ {OPEN, IN_PROGRESS}`
>   + filter `Debt ID` prefix `DEBT-W{prev_NN}-*` hoặc `Acceptable Until ≤ W{prev_NN}`
>
> Nếu có items → hiển thị danh sách đầy đủ (ID/Level/Title/Status/reason pending) →
> hỏi Delivery Authority xác nhận carry forward:
> - **Confirm (y/partial)**: items được ghi vào `PKG-W{NN} §Carryover` + `STATE.json carryover_items[]`
>   → `/planning-wave` sẽ gen implementation checklist bao gồm carryover items này
> - **Decline (n)**: items giữ nguyên pending ở wave trước, không đưa vào scope wave mới
>
> **Tracking files** (đọc, KHÔNG sửa tại bước này — chỉ update khi FIX agent resolve):
> - `Tracking/CHANGE-REQUESTS.md` — CR registry: `ID / Level / Status / Scope / resolved(bool)`
> - `Tracking/DEBT-REGISTRY.md` — Debt registry: `Debt ID / Severity / Status / Acceptable Until`

**Tier-B docs to load**:

| # | File | Mục đích |
|---|---|---|
| 1 | `Plan/WAVE-SEQUENCE.md` § wave hiện tại | Wave title, duration, boundaries, hard gates |
| 2 | `Execution/work-packages/PKG-W{NN}-*.md` (discover bằng glob) | §1 Boundaries, §2 Technical Scope, §3 Entry Criteria, §4 Test Agents scope, §5 Deliverables; §Carryover (nếu carryover đã confirmed) |
| 3 | `Tracking/CHANGE-REQUESTS.md` | CR unresolved → carryover candidates (Step 1.5 của `/wave-start`) |
| 4 | `Tracking/DEBT-REGISTRY.md` | Open debt → carryover candidates (Step 1.5 của `/wave-start`) |
| 5 | `DOC-DEPENDENCY-MAP.md` §3.3 T2 Tactical | Cascade rules nếu wave scope thay đổi |

**Pre-PLANNING setup** (TRƯỚC `/planning-wave`, do BOOTSTRAP-GUIDE §C.2 Bước 3 sub-step 4.5/5/6 điều phối, thứ tự đúng):
1. **`/manifest-rebuild <NN>`** (step 4.5, ngay sau `/wave-start`) — wave-arg auto-enumerate boundary qua `scripts/resolve-wave-tier-scope.py`, loop rebuild `MANIFEST.md` per target. Gate: MANIFEST ACTIVE per non-external boundary trước khi sang step 5. Skill idempotent (backup `.bak`).
2. **`/gen-execution-spec <NN>`** (step 5) — convert raw Product → Execution Spec ACTIVE. Tham chiếu MANIFEST §5 allowlist khi gen file impact map.
3. **`/sync-product <NN> all`** (step 6) — load Product spec + Architecture xuống service repos.

W01 exception: skip cả 3 (W01 đang TEST_EXECUTION, retroactive).

**Tasks** — chạy `/planning-wave <NN>`, thứ tự nội bộ (fill TRƯỚC sync/gen/load vì wave block là nguồn):
1. Verify entry criteria từ PKG §3 — confirm dependencies met **+ MANIFEST ACTIVE per target (step 4.5 đã hoàn tất)**
2. **`/fill-wave-assignment <NN>`** (planning-wave tự gọi, single-wave) — populate agent wave blocks (idempotent, append-only). PHẢI trước bước 3-5 vì wave block là nguồn cho `wave-{N}-tasks.md` + impl-checklist
3. Sync persistent — compose `_REVIEW-CHECKLIST.md` (base+delta) → `.harness/`
4. Generate & orchestrator-review `_IMPLEMENTATION-CHECKLIST.md` (từ PKG §2 + agent wave block + FEAT ACs + review checklist **+ MANIFEST §5 allowlist constraint**)
5. Load docs xuống per-service repos (`sync-docs-to-services.sh load W{NN} <boundary>` → docs/ + wave-{N}-tasks.md + impl checklist)
6. Set `features_in_flight` (từ PKG §1) via `scripts/state.py set features_in_flight '[...]'`
7. Render WAVE-TRACKER (`bash scripts/render-wave-tracker.sh`)

> All-waves bootstrap (nhiều wave 1 lần) → chạy `/fill-wave-assignment` standalone (no arg) ngoài planning-wave.

**Exit**: explicit transition qua `/dev-start <boundary>` (per boundary in wave).

---

## §DEV

**Pre-spawn (PLANNING, trước `/spawn-dev`)**: orchestrator generate `_IMPLEMENTATION-CHECKLIST.md` task-by-task (từ wave block + FEAT ACs + `_REVIEW-CHECKLIST.md`) → `Execution/checklists/impl/_IMPLEMENTATION-CHECKLIST-W{N}-{boundary}.md` → **review ổn rồi mới spawn** (xem `/planning-wave` §4.5). Đây là cải tiến shift-left: DEV làm theo checklist đã duyệt, self-check theo cùng tiêu chí REVIEW.

**In-flight enforcement (`SubagentStop` hook — `verify-subagent-stop.sh`)**: `/spawn-dev` arm marker `Execution/.dev-subagent-active` trước khi gọi `Agent`. Khi DEV subagent cố stop mà checklist còn `- [ ]` → hook block **một lần** + nhắc tick `[x]`/`[deferred:…]` (nudge-once; lần stop kế tiếp cho qua để blocked/needs_review thoát được). Đây là shift-left tới chính subagent — **hard gate thật vẫn ở `/dev-handoff`** (`verify-stage-exit.sh` → `check-impl-checklist.sh`).

**Entry**: `/dev-start <boundary>` — sets `stage=DEV`, `boundary_active`, `owned_paths`, `agent_active`.

**Tier-B docs to load** (adapted cho garage HYBRID topology + Rule #11):

| # | File | Mục đích |
|---|---|---|
| 1 | `{tier_prefix}/{boundary}/.claude/agents/agent-dev-{boundary}.md` → wave block hiện tại | Tasks, Deliverables, Exit Criteria |
| 2 | Same file → global sections | Forbidden Actions, Owned Boundary |
| 3 | `.claude/skills/rules-backend/SKILL.md` (Java) HOẶC `rules-bff/SKILL.md` (Node) HOẶC `rules-mobile/SKILL.md` (Flutter — v16 2026-06-29) HOẶC `rules-web/SKILL.md` (React 19 — v1 2026-06-30) | Coding conventions per tier |
| 4 | `Architecture/hld/{boundary}-HLD.md` | Design decisions |
| 5 | `Architecture/api/{boundary}-api.md` (BE) HOẶC `{boundary}-graphql.md` (BFF) | API contract |
| 6 | `Architecture/data/{boundary}-data-model.md` (nếu có DB; BFFs + gf-inventory-worker no DB) | Schema |
| 7 | `Architecture/events/{boundary}-events.md` + `_CONVENTIONS.md` (envelope rules) | Kafka events |
| 8 | `Architecture/workflows/{boundary}-workflows.md` (chỉ 5 Temporal services: gf-sales/customer/marketing/inventory/inventory-worker) | Sequence diagrams |
| 9 | `Architecture/integration/INTEG-*-{boundary}.md` (singular path; 24 contracts total) | Cross-boundary contracts (BFF/EXT/FE/MOB) |
| 10 | `Execution/knowledge-graphs/{boundary}.knowledge-graph.yaml` | Entities + accumulated gotchas |
| 11 | `Product/features/FEAT-*.md` HOẶC PKG §2 Technical Scope (TD waves) | Acceptance Criteria |
| 12 | `docs/Product/_IMPLEMENTATION-CHECKLIST.md` (synced khi `load`) | **Work breakdown task-by-task** — maintain như todo (`[x]`/`[deferred:…]`); Stop+handoff gate |
| 13 | `.harness/_REVIEW-CHECKLIST.md` (composed base+delta) | **Self-check trước handoff (shift-left)** — chính list REVIEW agent sẽ dùng |

Path resolution `tier_prefix` (per `Execution/SERVICE-BOUNDARY-MATRIX.md`):
- Java backend (14): `services/{b}/`
- Node BFF (2): `bffs/{b}/`
- React web: `frontend/gf-gms-web/`
- Flutter mobile: `mobile/gf-garage-app/`

**Tasks**:
1. Implement task list từ wave block
2. **TRƯỚC mỗi `Edit`/`Write`**: Pre-Edit Recognition Checklist (FM-017):
   - **ADDITIVE** (new file, new method, new field) → proceed
   - **NON-ADDITIVE** (modify existing method body, rename, delete) → STOP, ask user → `/scope-extend <file> <symbol> "<reason>"` → retry
   - **FORBIDDEN** (rewrite migration cũ, delete tracked entity, downgrade dep) → block
3. Backend + frontend song song (API contract-first per Architecture/integration/)
4. **KG update (service repo, owned)**: entities/events/gotchas mới → `{service}/knowledge-graph.yaml` (root repo, trong owned_paths). Edit trực tiếp hoặc `scripts/kg-append.py <b> --repo service …`. Gate `kg_updated` tại `/dev-handoff` enforce (so sha vs baseline chụp lúc `/dev-start`). Wave không phát sinh KG mới → khai báo no-change (`scripts/state.py set kg_no_change true`). **KHÔNG sync ngược về design master** (`Execution/knowledge-graphs/` chấp nhận drift).
5. Unit + integration tests trong cùng PR

**Cross-repo write (Critical Rule #11 NO-CODE)**:
> `agent-dev-{boundary}` chỉ runs trong per-service repo (`services/{b}/`, `bffs/{b}/`, `frontend/gf-gms-web/`, `mobile/gf-garage-app/`). Design repo agents (running trong `garage-agentic-design/`) **TUYỆT ĐỐI KHÔNG** Edit/Write code trong service trees — chỉ orchestrate qua `/spawn-dev`. Subagent có OWNED_PATHS giới hạn boundary.

**UX source resolution** (UI boundary `garage-web` / `garage-mobile`):
> `scripts/spawn-dev.sh` auto-detect: có `Product/ux/design/*.html` → **design mode** (inline HTML mockups); ngược lại → **figma mode**. Override: `scripts/state.py set ux_source '"design"|"figma"'`.
>
> **figma mode — 2-session (pre-fetch trước khi spawn)**:
> 1. TRƯỚC khi `/spawn-dev {boundary}`: chạy `/prefetch-figma {web|mobile} {wave} [FEAT-x]` ở session riêng (context-heavy) → ghi spec markdown đã transform ra `Product/ux/figma-{web|mobile}/wave{NN}-{slug}.md` (nguồn link = registry `Product/ux/figma/figma-links.yaml`).
> 2. `/spawn-dev` inline spec theo platform (web→`figma-web/`, mobile→`figma-mobile/`), resolve `wave{NN}-{slug}*.md` qua registry; sub-agent đọc spec → implement, **KHÔNG gọi MCP**. Spec có `status:` fallback → dùng UX-FLOW wireframe.
> 3. Tool MCP + transform: `.agents/_ref-figma-mcp-tools.md`, `_ref-frontend-figma-prefetch-flow.md`, `_ref-{web,mobile}-transform-figma.md`. Registry: `Product/ux/figma/figma-links.yaml` (validate: `scripts/validate-figma-links.sh`). Policy: `Product/DESIGN-SOURCE-POLICY.md §2.1, §6.3`.
> 4. TEST: `/prefetch-figma-oracle {web|mobile} {wave}` → `Product/ux/figma-test-{web|mobile}/wave{NN}-{slug}-oracle.md` cho `agent-test-ui` (xem §TEST_PLANNING).

**Checkpoint**: `/dev-checkpoint` ≥1 lần/ngày — snapshot tiến độ vào STATE.

**Exit**: `/dev-handoff` chạy `scripts/verify-stage-exit.sh DEV`:

Per-tier build/lint/test (xem `AGENTS.md §6 Common Commands`):

| Tier | Build | Lint | Test | Coverage |
|---|---|---|---|---|
| Java BE | `./gradlew build` | `./gradlew checkstyleMain` | `./gradlew test` | ≥ 80% (JaCoCo) |
| Node BFF | `npm run build && npm run typecheck` | `npm run lint` | `npm test` (Vitest+supertest) | ≥ 80% |
| React web | `npm run build` (Vite) | `npm run lint` | `npm test` (Vitest) | ≥ 60% |
| Flutter mobile | `flutter build apk --debug` | `flutter analyze` | `flutter test` | ≥ 60% (TBD threshold) |

Plus cross-cutting:
- Boundary scan clean (`bash scripts/hooks/check-boundary.sh` — không edit ngoài `owned_paths`)
- Mọi feature trong `features_in_flight` có AC pass
- **Impl checklist resolved** (`scripts/check-impl-checklist.sh`): mọi item `_IMPLEMENTATION-CHECKLIST.md` = `[x]` hoặc `[deferred:…]` (boundary chưa adopt → gate skip)
- **KG updated** (`scripts/check-kg-updated.sh`): `{service}/knowledge-graph.yaml` đổi vs baseline (chụp `/dev-start`), hoặc `kg_no_change=true` đã khai báo (no resolvable service KG → gate skip)
- **Contract drift gate** (`python3 scripts/contract-sign.py verify <consumer>` per consumer trong `Execution/wave-specs/W{NN}/contract-scope.yaml`): mọi ACTIVE signature hash phải khớp current contract file. Drift → block transition. Re-sign trong DEV phải kèm decision entry per W1 rule (xem dưới). Wave không có `contract-scope.yaml` → gate skip.
- 3-in-1 version bump cho mọi file đã sửa (Critical Rule #9)

**W1 — Contract change decision rule (mandatory)**

Mọi thay đổi contract trong DEV làm đổi SHA256 (re-sign hoặc refresh-hashes) **BẮT BUỘC** kèm row decision entry trong `Execution/wave-specs/W{NN}/_decisions.md` cùng commit. Format row:

| {date} | W{NN} | agent-contract-steward | contract-resign | Re-sign `Architecture/api/X.md` cho consumer `<cs>` từ `aaa…` → `bbb…` (cascade: N consumer khác) | {lý do thực sự: CR-NNN / EP-X thêm field Y / fix typo cosmetic dùng refresh-hashes} | CR-NNN nếu có; output `contract-sign.py cascade` |

Không có decision entry tương ứng → `/dev-handoff` Contract drift gate block transition:
- **Option A** — Re-sign tất cả consumer + log entry. Liệt kê consumer cần re-sign:
  ```
  python3 scripts/contract-sign.py cascade <contract-path>
  ```
- **Option B** — Revert contract file về baseline; signatures giữ nguyên.

Cosmetic drift (whitespace, comment-only): dùng `refresh-hashes` thay vì `sign` (giữ ACTIVE entry cũ, chỉ update hash) — vẫn cần decision entry phân loại "accidental + refresh-hashes".

Đỏ bất kỳ → script exit ≠ 0 → state KHÔNG transition. Không có "skip with override" trừ khi `/cr-raise OVERRIDE`.

---

## §REVIEW

**Entry**: `/review-start` (sau `/dev-handoff` thành công).

**Tier-B docs**:

| # | File |
|---|---|
| 1 | Reviewer theo nhóm thẩm quyền — chọn 1 trong 3 (xem `Execution/AGENT-REGISTRY.md §4`): |
| 1a | **BE**: `.agents/agent-review-backend.md` (14 Java + 2 BFF) |
| 1b | **Web**: `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md` (service repo — chỉ garage-web/React; KHÔNG mobile) |
| 1c | **Mobile**: `mobile/gf-garage-app/.claude/agents/agent-review-garage-mobile.md` (service repo — chỉ garage-mobile/Flutter) |
| 1d | **Checklist (single source)**: `{tier}/{boundary}/.harness/_REVIEW-CHECKLIST.md` (composed base+delta) — chính list DEV đã self-check; reviewer áp dụng mọi item R*/D*. Agent file (1a–1c) chỉ cấp role/severity/forbidden. |
| 2 | `git diff main...HEAD` — code DEV vừa produce (xem per-service repo) |
| 3 | Architecture docs liên quan boundary — verify compliance (HLD, API contract) |
| 4 | `.claude/skills/rules-backend/SKILL.md` HOẶC `rules-bff/SKILL.md` HOẶC `rules-mobile/SKILL.md` (Flutter — v16 2026-06-29) — verify conventions |
| 5 | `Execution/SERVICE-BOUNDARY-MATRIX.md` — verify 0 boundary violations |

**Tasks**:
1. Code review theo **composed `_REVIEW-CHECKLIST.md`** (mọi item R* base + D* delta) — single source, cùng list DEV đã self-check; report PASS/FAIL/N-A + evidence `file:line`
2. Architecture compliance (HLD design intent, API contract shape)
3. Boundary scan: mọi file thay đổi nằm trong `owned_paths`
4. Security: no hardcoded secrets, input validation, auth/authz, no PII trong logs/events
5. Backward compat: previous waves' tests still pass
6. Cross-boundary integration contract bilateral re-ratification (nếu touch INTEG-*)

**Exit**: `/review-handoff` → `verify-stage-exit.sh REVIEW`:
- Boundary scan clean
- 0 P1/P2 issues
- Architecture compliance signed bởi Architecture Authority
- All review comments resolved hoặc deferred → log trong `Tracking/DEBT-REGISTRY.md` (❌ TBD — sẽ tạo khi có debt entry đầu)

---

## §TEST_PLANNING

**Entry**: `/test-plan`.

**Tier-B docs**:

| # | File |
|---|---|
| 1 | `.agents/agent-test-*.md` (api/e2e/ui/isolation/security — theo PKG §4 scope) → wave block + regression scope |
| 1b | `{tier_prefix}/{boundary}/.claude/agents/agent-test-{boundary}.md` (chỉ garage-mobile có boundary-specific) |
| 2 | `Product/features/FEAT-*.md` (mỗi feature trong `features_in_flight`) — ACs → generate TCs |
| 3 | `Architecture/api/*.md` — endpoints → API TCs |
| 4 | Code DEV vừa produce — edge case TCs từ diff |
| 5 | `Tracking/TEST-CASE-REGISTRY.md` (❌ TBD — sẽ tạo khi W01 active) — check existing TCs để tránh duplicate |
| 6 | (UI test, figma mode) `Product/ux/figma-test-{web,mobile}/wave{NN}-{slug}-oracle.md` — pre-fetch trước qua `/prefetch-figma-oracle {web|mobile} {wave}`; `agent-test-ui` verify 5-cấp design conformance. Flow: `.agents/_ref-test-figma-oracle-flow.md`. |

**Tasks**:
1. Generate TCs từ ACs (1 AC → ≥1 TC, Tại/Khi/Thì structure per Rule #10)
2. Generate API TCs (mỗi endpoint × happy + ≥2 sad paths — vd 401, 403, 409, 422)
3. Generate edge case TCs từ code analysis (concurrent write, tenant isolation, race conditions)
4. Register vào `Tracking/TEST-CASE-REGISTRY.md` (TBD) HOẶC per-wave fallback `Tracking/WAVE{NN}/test-cases.md`
5. QA Authority review trước khi exec

**Exit**: `/test-plan` handoff:
- TC count ≥ AC count (script check — TBD when REGISTRY exists)
- Mọi TC có expected result rõ ràng (Tại/Khi/Thì)
- QA Authority signed off

---

## §TEST_EXECUTION

**Entry**: `/test-exec`.

**Tier-B docs**:

| # | File |
|---|---|
| 1 | `Tracking/TEST-CASE-REGISTRY.md` (❌ TBD) HOẶC `Tracking/WAVE{NN}/test-cases.md` (per-wave fallback) — TCs to execute |
| 2 | `.agents/agent-test-*.md` → regression scope (previous waves' TCs) |
| 3 | `Tracking/BUGS.md` (❌ TBD) HOẶC `Tracking/WAVE{NN}/BUGS.md` — file bugs nếu fail |

**Tasks**:
1. Execute TCs trong registry (manual hoặc automated)
2. File bugs với severity (P1-P4) khi fail — ID format `BUG-W{NN}-{NNN}`
3. Update TC status: PASS / FAIL / BLOCKED / SKIP
4. Regression suite từ waves trước phải pass 100%

**Exit**: `verify-stage-exit.sh TEST_EXECUTION`:
- Pass rate ≥ **80%**
- 0 P1, 0 P2 unresolved
- Regression 100% pass
- P0 bugs (nếu có) → block stage transition (per Critical Rules)

---

## §QC

**Entry**: `/qc-start`.

**Tier-B docs**:
- `Execution/work-packages/PKG-W{NN}-{tier}-p0.md` §6 Demo Target — acceptance criteria
- `Tracking/BUGS.md` (per-wave) — final bug ledger

**Tasks**:
1. QA Authority manual acceptance test
2. TC coverage review (per AC)
3. Pilot/UAT feedback (nếu áp dụng — TD P0 waves: skip)
4. Demo target verification (per PKG §6 — vd "2 concurrent PUT → 1×200 + 1×409 CONFLICT_VERSION")
5. Sign `STATE.qc.signed_by` + `qc.signed_at` via `scripts/state.py set qc.signed_by '"<authority>"'`

**Exit**: QC sign-off — **human gate** (không có script).
- `qc.signed_by != null` trước khi `/release-start`
- Bug ledger CLEAN: 0 P0/P1/P2 OPEN

---

## §RELEASE

**Entry**: `/release-start` (sau QC sign-off).

**Tier-B docs**:
- `Plan/RELEASE-PLAN.md` — release strategy + milestones
- `Execution/work-packages/PKG-W{NN}-{tier}-p0.md` §6 Demo Target + §9 Post-Wave Actuals row (sẽ fill)

**Tasks**:
1. Demo target verified one more time (final pass)
2. Deploy to staging — per-service repos handle (cross-repo per Rule #11; service teams own CI/CD)
3. Smoke test on staging (live curl/Playwright/integration)
4. Document `Tracking/td-w{NN}-{tier}-actuals.md` (❌ TBD format) — Post-Wave Actuals (duration, retries, findings, TC pass rate, bugs, conflict rate)
5. (Future) Production deploy — AWS parallel track (currently local Docker Compose only)

**Exit**: RELEASE done → ready cho `/wave-end`.

---

## §WAVE_END

**Entry**: `/wave-end`.

**Tasks**:
1. Demo cho Product Owner (final acceptance)
1.5. **Unfinished Items Audit** — `python3 scripts/wave-end-debt-convert.py --wave W{NN}`: scan `Tracking/WAVE{NN}/BUGS.md`, convert bugs unresolved (OPEN/IN_FIX/REOPENED/DEFERRED/FIX_DONE/VERIFY_PENDING) thành `DEBT-W{NN}-{NNN}` entries trong `Tracking/DEBT-REGISTRY.md`; WARN nếu HIGH/CRITICAL nhưng không fail.
2. Update `Execution/WAVE-TRACKER.md` (auto-rendered via `bash scripts/render-wave-tracker.sh`)
3. Append wave summary vào `MEMORY.md` (lessons learned, decisions, gotchas)
4. Auto-archive memories tagged `wave: <N-2>` (memory-archive.sh)
5. Update KG cho mỗi boundary tham gia — final consolidation
6. `bash scripts/sync-docs-to-services.sh reset W{NN} all` — clear wave-scoped `docs/` trong per-service repos
7. Reset STATE: `wave` → next, `stage = BOOTSTRAP` (luôn luôn — `/wave-start N+1` mới chuyển sang PLANNING), `features_in_flight = []`, `qc.signed_by = null`
8. Per-service repo commits (cross-repo nature) — service teams handle

**Hard gate to next wave** (per `Plan/WAVE-SEQUENCE.md` §1 graph):

| Transition | Gate criteria |
|---|---|
| W01 → W02 | CORS whitelist deployed · `@Version` migrations applied · V2 deprecation headers live |
| W02 → W03 | Web token flow stable trên staging · INTEG-FE auth contract live · Provider resilience pattern doc final |
| W03 → (end TD P0) | Mobile secure storage migration verified · ADR-014 published |

---

## §FALLBACK

### Blocker

```
/blocker-raise <HIGH|MED|LOW> "<description>"
```

→ Append vào `STATE.blockers`. Severity `HIGH` → stage tự transition `BLOCKED`.

**Stage restoration (LIFO)** — anti-corruption mechanism:

1. `/blocker-raise HIGH` capture `pre_blocker_stage` vào blocker entry **trước** khi transition `BLOCKED`.
2. `scripts/state.py transition BLOCKED` cũng append entry `{from: <prev>, to: BLOCKED, at: <now>}` vào `STATE.stage_history[]` (universal audit trail cho mọi transition).
3. `/blocker-resolve <id>` lookup blocker theo `id`, đọc `pre_blocker_stage`, transition về stage đó. Fallback: nếu blocker (legacy) không có field, dùng `state.py last-stage-before BLOCKED` (LIFO walk stage_history).
4. Nếu stack 2 blocker chồng (rare): resolve theo blocker ID match — KHÔNG theo top-of-stack. Mỗi blocker tự lưu origin stage độc lập.

Resolution path: human Authority + `/blocker-resolve <id>`.

### Change Request

```
/cr-raise <CRITICAL|MAJOR|MODERATE|MINOR>
```

→ Tạo entry trong `Tracking/CHANGE-REQUESTS.md`. CR severity per `DOC-DEPENDENCY-MAP.md §2.2`:

| Severity | Approver |
|---|---|
| CRITICAL | All 5 Authorities (Delivery, Architecture, Business, QA, Security) |
| MAJOR | Business + Delivery Authority |
| MODERATE | Relevant Authority |
| MINOR | Author |
| COSMETIC | N/A — fix directly |

CRITICAL/MAJOR cần authority approve trong artifact trước khi code.

**Audit-driven CRs** (per garage 2026-05-22 precedent): Gap audits trong `Tracking/p0-gap-audit-*.md` có thể escalate thành CR MAJOR ngay (bypass weekly review cadence) — drove 17-wave revert + TD P0 adoption (commits `73ea814` + `a6dc2e9`).

### Rollback

Khi exit-criteria gate fail nhiều lần (> **3** retries):

1. `/blocker-raise HIGH "DEV exit criteria fail x3"`
2. Authority quyết định: rollback wave HAY split scope (e.g., W01 → W01a + W01b)
3. Nếu rollback:
   - `git revert` các commits của wave (per-service repos)
   - Reset STATE về trước `/wave-start` (`wave=<prev>`, `stage=DONE` or `BOOTSTRAP`)
   - `bash scripts/sync-docs-to-services.sh reset W{NN} all`
4. Re-plan: file CR MAJOR documenting why rollback + revised scope

---

## Cross-references

- `CLAUDE.md` §3.2 — 12 Critical Rules (governance backbone, includes Rule #12 No force-push)
- `DOC-DEPENDENCY-MAP.md` — tier hierarchy + cascade rules
- `AGENTS.md` §3 — Agent Group Routing
- `Plan/WAVE-SEQUENCE.md` — wave plan + hard gates
- `Execution/work-packages/PKG-W*-p0.md` — per-wave scope detail
- `Execution/FAILURE-MODES.md` — FM catalog (referenced bởi hooks: FM-006/007/008/009/010/011/017/018 + wave-specific FM-W{NN}-NNN incident lessons)

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 16 | Delivery Authority (sonndt — in-session MASTER PROMPT item #9) | **Wire `.claude/skills/rules-mobile/SKILL.md` (Flutter)** vào §DEV row 3 + §REVIEW row 4 — song song với `rules-backend` (Java) + `rules-bff` (Node). Additive: Java/Node giữ nguyên; rules-frontend (web) vẫn flag MISSING (defer riêng). Skill `rules-mobile` cover design-token bắt buộc (cấm hardcode `Color(0xFF…)`/`TextStyle(…)`), widget-catalog-first, BLoC `BaseCubit.launch()`, typography binding-deterministic M-28, VN→EN M-20/M-27, §0 Context Intake với spec figma-mobile v9 + assets PNG + design-system files + reuse-radar widget catalog. Trigger spawn-dev/fix garage-mobile và review-garage-mobile. Cross-ref: `_ref-mobile-transform-figma.md` v9 §1.5a + `_ref-mobile-default-pattern-audit.md` D-M1..D-M14. |
| 2026-06-20 | 15 | Delivery Authority | **§WAVE_END — Unfinished Items Audit + BOOTSTRAP stage**: (1) Thêm Task 1.5 — `python3 scripts/wave-end-debt-convert.py --wave W{NN}` scan BUGS.md + convert bugs OPEN/IN_FIX/REOPENED/DEFERRED/FIX_DONE/VERIFY_PENDING thành `DEBT-W{NN}-{NNN}` entries; (2) STATE reset stage đổi `PLANNING` → `BOOTSTRAP` (luôn luôn; `/wave-start N+1` mới activate PLANNING). Carryover audit trong `/wave-start` v2 sẽ tự pick up debts + unresolved CRs. Tạo `scripts/wave-end-debt-convert.py`. |
| 2026-06-20 | 14 | Delivery Authority | **§PLANNING — Carryover Audit bootstrap docs**: Thêm callout "Carryover Audit" (Step 1.5 trong `/wave-start`) vào Entry description — mô tả flow tự động kiểm tra CR unresolved (STATE.json `cr_log[]`) + open debt (Tracking/DEBT-REGISTRY.md) từ wave trước; hiển thị danh sách + ASK user xác nhận; ghi confirmed items vào `PKG §Carryover` + STATE.json `carryover_items[]`; `/planning-wave` pick up carryover section trong PKG khi gen implementation checklist. Update Tier-B docs table: row 2 PKG glob pattern (thay suffix hardcode cũ `-{tier}-p0`); thêm row 3 `Tracking/CHANGE-REQUESTS.md` + row 4 `Tracking/DEBT-REGISTRY.md` để team member mới biết chính xác files cần đọc khi bắt đầu PLANNING. |
| 2026-06-17 | 13 | meta | **§FALLBACK Blocker — stage restoration LIFO** (ADLC gap review F3): `/blocker-raise HIGH` capture `pre_blocker_stage` vào blocker entry trước transition `BLOCKED`. `state.py transition` append `stage_history[]` audit trail. `/blocker-resolve` LIFO restore qua blocker field hoặc `state.py last-stage-before BLOCKED` fallback. Resolve stack ambiguity: per-blocker origin, không top-of-stack. Cross-ref: blocker-raise.md, blocker-resolve.md, state.py (new `last-stage-before` cmd). Cross-refs cleanup: bỏ ❌ TBD marker cho `Tracking/CHANGE-REQUESTS.md` (đã exist v11) + `Execution/FAILURE-MODES.md` (đã có FM-006/009/010/011/017/018 plus FM-007/008). |
| 2026-06-16 | 12 | agent-contract-steward | **Phase 4 — formalize `agent-contract-steward` role** (giải quyết Known Limitation W2). §DEV W1 decision row template: column "Mode" mặc định `agent-contract-steward` (không phải `meta`). Tooling: `.claude/agents/agent-contract-steward.md` (trim 6 modes từ ecom4g 8), `.claude/commands/spawn-contract-steward.md`, `scripts/contract-sign.py get_actor()` default hardcode `agent-contract-steward` (drop STATE.json read), thêm `--force-actor` flag cho `sign` để bypass NOOP guard khi relabel actor (hash unchanged). 10 baseline signature re-signed: 10 SUPERSEDED `signed_by=meta` + 10 ACTIVE `signed_by=agent-contract-steward` với `relabel_only: true`. Decision row trong `_decisions.md`. |
| 2026-06-16 | 11 | meta | **§DEV — Contract drift gate + W1 decision rule** (port ecom4g contract-sign cho W02; xem plan `/home/engineer_ac/.claude/plans/b-n-ecom4g-ang-k-zany-russell.md`). §DEV exit checklist thêm `Contract drift gate` (verify mọi consumer trong `Execution/wave-specs/W{NN}/contract-scope.yaml`); thêm subsection **W1** quy định mọi re-sign / refresh-hashes phải kèm decision row trong `_decisions.md` cùng commit. `/dev-start` thêm contract baseline verify (fail-fast trước DEV); `/dev-handoff` thêm Contract drift gate trước `verify-stage-exit.sh`. Tooling: `scripts/contract-sign.py` (sign/verify/refresh-hashes/cascade/archive/audit/hash). User authorize bypass CR MAJOR — decision logged ở `Execution/wave-specs/W02/_decisions.md`. |
| 2026-06-16 | 9 | Delivery Authority | **Wire `/manifest-rebuild` vào §PLANNING** (mirror BOOTSTRAP-GUIDE v31). §PLANNING thêm "Pre-PLANNING setup" block phía trên Tasks — list 3 sub-step do BOOTSTRAP §C.2 Bước 3 điều phối: `/gen-execution-spec` → `/sync-product` → `/manifest-rebuild` per target (gate MANIFEST ACTIVE). §PLANNING Task 1 thêm gate `MANIFEST ACTIVE per target`; Task 4 thêm constraint `MANIFEST §5 allowlist` khi gen impl-checklist. Rationale: trước đây `/manifest-rebuild` là skill orphan, gây rollout dở (1/17 boundary có MANIFEST sau pilot). |
| 2026-06-11 | 8 | Delivery Authority | **Reconcile drift với ADLC §5.1** (CR-1781400000, audit B.5). Header note: `ADLC.md §5.1` = canonical 7-core STATE machine (PLANNING → DEV_GROUP → REVIEW_GROUP → TEST_PLANNING → TEST_EXECUTION → QC → RELEASE); PROTOCOL = 10-stage operational expansion (Pre-flight, WAVE_END, FALLBACK = sub-steps trong command, không phải `STATE.stage` transitions độc lập). |
| 2026-06-04 | 7 | ninhnguyen | **§REVIEW row 1b — `agent-review-garage-web` SoT → web service repo**: path đổi `.agents/agent-review-garage-web.md` (design repo) → `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md` (service repo), mirror row 1c (mobile). Đồng bộ AGENT-REGISTRY v4 §4 + AGENTS v5 + BOOTSTRAP v22 + spawn-review/sync scripts. (Frontmatter version 5→7: reconcile lag — changelog đã ở 6, frontmatter còn 5.) |
| 2026-06-03 | 6 | SA + FE/Mobile | **Figma mode chuyển gen-theo-WAVE**: §DEV UX source + §TEST_PLANNING row 6 — command `/prefetch-figma {platform} {wave}`; output `wave{NN}-{slug}.md` (thay `{FEAT-ID}.md`); nguồn = registry `Product/ux/figma/figma-links.yaml` (validate `scripts/validate-figma-links.sh`); `/spawn-dev` + `/spawn-test` resolve wave+slug. |
| 2026-06-02 | 5 | Delivery Authority | §PLANNING reorder tasks: `/fill-wave-assignment` (do `/planning-wave` tự gọi single-wave) chạy TRƯỚC sync/gen/load — fix dependency (wave block là nguồn cho wave-tasks + impl-checklist). All-waves bootstrap vẫn standalone. |
| 2026-06-02 | 4 | Delivery Authority | Checklist-driven DEV/REVIEW loop: §DEV thêm pre-spawn impl-checklist generation + reading rows 12/13 (impl + review checklist) + exit criterion `impl_checklist_resolved`; §REVIEW trỏ về composed `_REVIEW-CHECKLIST.md` (single source DEV+REVIEW dùng chung). Bump frontmatter version 2→4 (đồng bộ với changelog đã có v3). |
| 2026-05-29 | 3 | SA + FE/Mobile | §DEV UX source resolution: kích hoạt **figma mode 2-session** (`/prefetch-figma {garage-web\|garage-mobile}` → spec markdown per-platform → `/spawn-dev` inline, sub-agent KHÔNG gọi MCP); §TEST_PLANNING thêm row oracle (`/prefetch-figma-oracle` → figma-test-{web,mobile}). Cross-ref `.agents/_ref-figma-mcp-tools.md` + flow/transform docs + `DESIGN-SOURCE-POLICY v2`. |
| 2026-05-29 | 2 | cuongnguyen_ac | §REVIEW Tier-B docs: reviewer chọn theo 3 nhóm thẩm quyền — BE (`agent-review-backend`, gồm agg-garage-graph), Web (`agent-review-garage-web`, design repo, web-only), Mobile (`agent-review-garage-mobile`, service repo). Thay framing `agent-review-frontend` shared cũ. Sync với AGENT-REGISTRY §4 + `/spawn-review <backend\|garage-web\|garage-mobile>`. |
| 2026-05-27 | 1 | Delivery Authority | **Initial PROTOCOL.md** — adapted from `adlc-starter-v3/Execution/PROTOCOL.md` (229 lines). Garage adaptations: (a) **Per-tier commands** (Java/Node/React/Flutter — 4 tiers replace single `{{BUILD_CMD}}` placeholder); (b) **HYBRID agent topology** (Rule #11) — per-service paths `{tier}/{boundary}/.claude/agents/` thay design repo flat `.agents/`; (c) `Architecture/integration/` singular (24 INTEG files) thay template `integrations/`; (d) **Design mode UX** (HTML mockups, no Figma/MCP); (e) 3 TD P0 waves context (W01-W03) với hard gates from WAVE-SEQUENCE §1; (f) FM codes referenced (FM-006/012/016/017 — `Execution/FAILURE-MODES.md` TBD); (g) Tracking ledgers flagged TBD (BUGS/CR/DEBT/TC-REGISTRY); (h) **§PLANNING + §RELEASE explicit stages added** (vs template's 8 → garage's 10-stage pipeline); (i) Audit-driven CR rule (per 2026-05-22 pivot precedent); (j) §QC explicit human gate (`qc.signed_by != null`). |
