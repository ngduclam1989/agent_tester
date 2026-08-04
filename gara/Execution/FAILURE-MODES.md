# FAILURE-MODES — Accumulated Gotchas (cross-wave)

> Append-only. Mỗi entry = 1 failure mode quan sát được trong DEV/FIX/TEST, kèm cách phòng tránh.
> Nguồn: FIX/REVIEW/TEST agents. Tham chiếu BUGFIX doc khi có.

## Numbering convention

- **FM-NNN (canonical, single digit / no wave prefix)** — protocol-level failure modes enforced bởi hooks trong `scripts/hooks/*.sh`. Stable codes referenced bởi block messages — KHÔNG rename without CR MAJOR.
- **FM-W{NN}-NNN (wave-specific)** — incident lesson learned từ wave cụ thể. Numeric range tự do.

### ⚠️ Known collision — FM-008

`FM-008` đang được dùng 2 chỗ với 2 ý nghĩa khác nhau:
- **Hook** (`scripts/hooks/check-bash-safety.sh:73`) dùng `FM-008 destructive-rm` cho `rm -rf` broad-target.
- **Docs (this file, §FM-008 below)** dùng `FM-008` cho GraphQL fragment shape drift — lesson learned từ BUG-W01-240/244.

→ Block messages từ hook không match docs entry. Recommend tách: docs FM-008 → `FM-W01-208`; canonical FM-008 = destructive-rm (đồng bộ với hook). Defer cascade qua `/cr-raise MODERATE` riêng (T0 file change, ảnh hưởng BUGFIX cross-refs).

---

## FM-006 — Test/hook bypass

**Canonical rule**: Critical Rule (governance) — KHÔNG bypass test/hook check để "đẩy nhanh". Pre-commit hooks là gate cuối phát hiện lỗi trước commit.
**Mechanical enforcement**: `scripts/hooks/check-bash-safety.sh:20-22`.

### Trigger (block conditions)

| Flag detected | Action |
|---|---|
| `--no-verify` | BLOCK → fix root cause, không bypass |
| `--no-gpg-sign` | BLOCK → keep signing |
| `GIT_HOOKS=0` (env var) | BLOCK → keep hooks active |
| `HUSKY=0` (env var) | BLOCK → keep husky active |

### Why

Bypass flags che giấu lỗi (failing test, lint, contract drift, KG drift). Slip-through tạo regression khó debug downstream. Hook layer = mechanical first line; intent layer (agent self-discipline) = second.

### Recovery / exception path

- **Fix root cause**: lỗi test/lint → fix, đừng skip. Hook failure → fix the underlying issue, không disable.
- **Temporary bypass (rare)**: `/cr-raise MAJOR` với justification + rollback plan + Authority sign-off.

### Cross-references

- Hook source: `scripts/hooks/check-bash-safety.sh:20-22`
- Override path: `/cr-raise MAJOR`
- Related: BOOTSTRAP-GUIDE §F.3 (common mistakes)

---

## FM-009 — Hard reset on protected branch

**Canonical rule**: KHÔNG `git reset --hard` trên `main`/`master`/`origin/main`/`origin/master` (mất audit trail + work của teammate).
**Mechanical enforcement**: `scripts/hooks/check-bash-safety.sh:77-79`.

### Trigger

| Pattern | Action |
|---|---|
| `git reset --hard main\|master\|origin/main\|origin/master` | BLOCK → tạo branch + PR thay vì reset protected |

### Why

Hard reset xoá history sau target commit; trên protected branch = mất commits đã merged. Force-push (FM-007) thường đi cùng để propagate — combo này = catastrophic data loss.

### Recovery / exception path

- **Cần roll back protected branch**: tạo revert commit (`git revert <SHA>`) + PR, KHÔNG reset.
- **Cần đặt feature branch về điểm cũ**: dùng `git reset --hard <SHA>` trên feature branch (không phải protected); chấp nhận trade-off mất commits local.

### Cross-references

- Hook source: `scripts/hooks/check-bash-safety.sh:77-79`
- Related FMs: FM-007 force-push (often paired); FM-010 wholesale-restore

---

## FM-010 — Wholesale restore / discard

**Canonical rule**: KHÔNG `git checkout` / `git restore` với pattern wholesale (`.`, `--`, `$HOME`) — dễ vô tình mất uncommitted work.
**Mechanical enforcement**: `scripts/hooks/check-bash-safety.sh:82-84`.

### Trigger

| Pattern | Action |
|---|---|
| `git checkout .` / `git checkout --` / `git checkout $HOME` | BLOCK → checkout specific files only |
| `git restore .` / `git restore --` / `git restore $HOME` | BLOCK → restore specific files only |

### Why

Wholesale operators reset/restore HOÀN TOÀN working tree — uncommitted changes mất vĩnh viễn. Khi user/agent intent chỉ là "discard 1 file", wholesale operator đi quá xa. Specific file argument là safe equivalent.

### Recovery / exception path

- **Cần discard 1 file**: `git checkout -- path/to/file` (explicit).
- **Cần reset toàn bộ working tree (rare)**: `git stash` trước, sau đó `git checkout .` qua interactive shell (không phải agent automation). Agent context: refuse intent.

### Cross-references

- Hook source: `scripts/hooks/check-bash-safety.sh:82-84`
- Related FMs: FM-008 destructive-rm (sibling cleanup vector); FM-009 hard-reset

---

## FM-011 — STATE.json direct edit

**Canonical rule**: `Execution/STATE.json` là machine-managed state — chỉ mutate qua `scripts/state.py` (set/append/transition subcommands) hoặc slash commands. Direct edit phá invariants (schema version, mutation log, transaction-safe write).
**Mechanical enforcement**: `scripts/hooks/check-bash-safety.sh:87-89`.

### Trigger

| Pattern | Action |
|---|---|
| `> Execution/STATE.json` (redirect overwrite) | BLOCK → use `state.py set` |
| `>> Execution/STATE.json` (redirect append) | BLOCK → use `state.py append` |
| `sed -i ... STATE.json` | BLOCK → use `state.py set` |
| `jq ... STATE.json ... -i` (jq in-place) | BLOCK → use `state.py set` |
| Edit/Write tool on `Execution/STATE.json` | Allowed by check-boundary (PERMISSIVE stages) but **agent must refuse** — Critical Rule #6 + intent layer |

### Why

- STATE.json schema có invariants (cr_log append-only, transition_log timestamped, wave_specs nested object). Direct shell mutation bỏ qua validation → silently corrupt state.
- `scripts/state.py` provides atomic write (lock file), schema validation, mutation history. Bypass = lose audit trail.

### Recovery / exception path

- **Cần mutate state**: dùng `scripts/state.py <subcommand> <key> <value>`.
- **Cần debug state**: `scripts/state.py get <key>` read-only.
- **Schema migration**: dùng `scripts/state.py migrate` (nếu có) hoặc commit explicit migration script trong PR + CR MAJOR.

### Cross-references

- Hook source: `scripts/hooks/check-bash-safety.sh:87-89`
- Authoritative mutator: `scripts/state.py`
- Critical Rule #6 (decisions → artifact): mutation log = artifact

---

## FM-012 — Critical Rule #11 violation (Design repo NO-CODE)

**Canonical rule**: Main agent (orchestrator) trong `garage-agentic-design` KHÔNG được Edit/Write/MultiEdit/NotebookEdit file dưới `services/`, `bffs/`, `frontend/`, `mobile/`. Boundary code thuộc per-service subagent — spawn qua `/spawn-dev <boundary>`. Sync doc qua `scripts/sync-docs-to-services.sh` (Bash, không bị FM-012 block).
**Mechanical enforcement**: `scripts/hooks/check-boundary.sh` FM-012 gate. Sentinel `.claude/state.cache/main-session-id` (ghi tại SessionStart) phân biệt main vs subagent qua `session_id`.

### Trigger

| Caller | Path target | Verdict |
|---|---|---|
| Main agent (session_id == sentinel) | `services/**`, `bffs/**`, `frontend/**`, `mobile/**` | BLOCK |
| Main agent + sentinel missing (fail-CLOSED) | same | BLOCK |
| Subagent (session_id ≠ sentinel) | bất kỳ path | ALLOW (full bypass check-boundary.sh) |
| Main agent | non-boundary path | tiếp tục flow gốc (forbidden / ALWAYS_OK / PERMISSIVE / DEV owned_paths) |

### Why

- Critical Rule #11 enforce multi-repo separation: design repo chỉ chứa design artifacts, code implementation thuộc per-service repos.
- Cho phép main agent edit boundary code sẽ undermine boundary isolation + contract-first delivery model.
- Sentinel-based detection chắc chắn hơn cwd hoặc marker file: subagent có UUID `session_id` riêng (1 file `.jsonl` per session), không fire SessionStart → sentinel chỉ ghi bởi main.

### Recovery / exception path

- **Đúng intent (cần edit code)**: chạy `/spawn-dev <boundary>` để subagent edit. Subagent bypass FM-012 hoàn toàn.
- **Sync doc**: dùng `scripts/sync-docs-to-services.sh load|sync` (Bash cp/mv, không bị FM-012 block).
- **Sentinel missing**: restart session để SessionStart re-stamps sentinel. Hook stderr in `(missing → fail-CLOSED)` hint.
- **KHÔNG bypass** qua `/scope-extend` hay `/cr-raise` — FM-012 là mechanical enforcement của Critical Rule, không có exception override.

### Cross-references

- Hook source: `scripts/hooks/check-boundary.sh` FM-012 gate
- Sentinel writer: `scripts/hooks/session-start.sh`
- Smoke test: `scripts/test-fm011-hook.sh` (8 cases)
- Critical Rule #11: `CLAUDE.md §3.2` + `ADLC.md §6.2 (k)`
- Memory note: `[[design-repo-subagent-cannot-edit-service-code]]` (phân biệt FM-012 vs CC permission engine block)

### Note — `/spawn-dev` / `/spawn-fix` `--inline` mode

`--inline` flag (canonical `.claude/commands/{spawn-dev,spawn-fix}.md` §Inline) **vẫn spawn 1 subagent thật qua `Agent` tool** — nó KHÔNG phải cơ chế "orchestrator tự code". Khác biệt duy nhất vs mode mặc định: session nào phát ra lời gọi `Agent` tool. Verify thực nghiệm: subagent spawn qua `Agent` tool kế thừa project root của chính session cha, không phải design repo cố định — nếu session cha đã đứng ở sub-repo (vd `frontend/gf-gms-web/`), subagent con cũng đứng ở đó, `.claude/settings.json` của sub-repo load ĐÚNG cho subagent con.

Điểm quan trọng vs FM-012:

- **`--inline` route §A (chạy khi CWD = design repo) KHÔNG spawn gì cả** — chỉ prep (checklist/BUGS.md validation + doc sync) rồi in instruction cho user chuyển sang session sub-repo. Route §B (chạy khi CWD = sub-repo) mới thực sự gọi `Agent` tool.
- **FM-012 `check-boundary.sh` không liên quan đến §B** — hook đó chỉ fire khi `CLAUDE_PROJECT_DIR` = design repo root (có `Execution/STATE.json`). §B chạy với CWD = sub-repo → session đó không load `check-boundary.sh` (không có trong sub-repo settings.json) → không phải "bypass", mà đơn giản là hook đó không áp dụng ở context này.
- **Tinh thần Critical Rule #11 (multi-repo separation) vẫn được tôn trọng**: design repo không code — §A chỉ prep, §B là 1 session sub-repo (nơi code vốn đã được phép diễn ra) tự spawn subagent con của chính nó.
- **Hook coverage không phải strict superset** — `--inline` gain `check-figma-spec-read.sh` + `check-component-registry-read.sh` (chết ở mode mặc định) nhưng mất `gate-web-mandatory-reads.sh` (chỉ tồn tại như mirror ở design-repo settings.json, không có bản trong sub-repo). Chi tiết bảng so sánh: `.claude/commands/spawn-dev.md` / `spawn-fix.md` §Inline §Hook coverage.

Chi tiết: `.claude/commands/spawn-dev.md` / `.claude/commands/spawn-fix.md` §Inline.

---

## FM-017 — Non-additive edit on baseline file

**Canonical rule**: DEV agent **edit chỉ ADDITIVE** trên existing committed baseline file — không rewrite, không xoá symbols cũ. Modification cần `/scope-extend <file> <symbol> "<reason>"` user-approved trước.
**Mechanical enforcement**: `scripts/hooks/check-additive-edit.sh:63-160`.

### Trigger (block conditions)

| Operation | When file is baseline | Action |
|---|---|---|
| `Write` (full file overwrite) trên existing file | Always | BLOCK → use Edit/MultiEdit additive |
| `Edit` modifying existing symbol (function/class/struct match) | Symbol NOT in `wave_scope.modify_allowlist[]` | BLOCK → request `/scope-extend` |
| Large edit (>X% file) without identifiable symbol | Baseline file | BLOCK → break into smaller targeted edits |

### Why

Brownfield Garage = 79 features production. Wave goal = thêm features mới + bug fix targeted, KHÔNG refactor toàn bộ. Non-additive edit = drift risk: behavior change ngoài scope wave, hidden breakage in unrelated callers. `wave_scope.modify_allowlist` = explicit user authorization trail.

### Recovery / exception path

- **Cần modify existing symbol (intentional)**: orchestrator relay đề xuất → user confirm → `/scope-extend <file> <symbol> "<reason>"` → re-attempt edit (allowlist match → ALLOW).
- **Destructive modification (rename/delete signature)**: `/scope-extend ... --destructive` → Architecture Authority sign-off + ADR auto-generated.
- **First-touch file (NEW)**: hook detect via baseline check; new file → ALLOW.

### Cross-references

- Hook source: `scripts/hooks/check-additive-edit.sh:63-160`
- Scope expansion: `.claude/commands/scope-extend.md`
- Wave reset: `/wave-end` clears `modify_allowlist` — next wave re-confirm
- Related FMs: FM-018 (new web component sibling — NEW file rather than modify)

---

## FM-018 — Unapproved new web component

**Canonical rule**: NEW React component dưới `frontend/gf-gms-web/src/components/**` cần user approval qua `/allow-new-component`. Orchestrator phải check reuse trước (`shadcn/ui`, existing component) — chỉ tạo NEW khi xác nhận không reuse được.
**Mechanical enforcement**: `scripts/hooks/check-web-new-component.sh:14-160`.

### Trigger (block conditions)

| Operation | When | Action |
|---|---|---|
| `Write` tạo NEW file dưới `frontend/gf-gms-web/src/components/**/*.tsx` | Component name NOT trong `wave_scope.allow_components[]` | BLOCK → check reuse, sau đó `/allow-new-component` |
| `Write` NEW file ngoài STATE.json scope (no orchestrator) | Always | BLOCK với message "không có STATE.json để hỏi orchestrator" |

### Why

Component sprawl = maintenance debt. Brownfield codebase đã có hàng trăm components — duplicate risk cao. `/allow-new-component` workflow forces explicit decision: (a) reuse existing? (b) extend shadcn/ui? (c) genuinely new domain UI? Only (c) creates new component.

### Recovery / exception path

- **Reuse existing**: import existing component thay vì tạo mới (no hook trigger).
- **Extend shadcn/ui**: `npx shadcn@latest add <component>` (no hook trigger — generated path conventionally OK).
- **Genuinely new UI**: orchestrator confirm no reuse → user `/allow-new-component <component-name> "<reason>"` → STATE updated → re-attempt Write succeeds.

### Cross-references

- Hook source: `scripts/hooks/check-web-new-component.sh:14-160`
- Approval command: `.claude/commands/allow-new-component.md`
- Wave reset: `/wave-end` clears `allow_components` — next wave re-confirm
- Related FM: FM-017 (modify existing — sibling for MODIFY rather than CREATE), FM-019 (component lookup bypass — intent layer sibling)
- Design system source: `frontend/gf-gms-web/src/components/ui/` (shadcn baseline)

---

## FM-019 — Component lookup bypass / parallel-shell reuse violation

**Canonical rule**: Cả `agent-dev-garage-web` và `agent-fix-garage-web` PHẢI consult `.claude/references/component-registry.yaml` TRƯỚC khi compose UI mới — chọn theo layer priority `customs > share > ui`. Registry là **CANONICAL** source cho UI component metadata (KG `implementation.components` đã downgrade thành historical inventory). Vi phạm: (a) bypass lookup → tạo parallel-shell trên `ui/*` primitive khi `share/*` hoặc `customs/*` đã cover anatomy, (b) create file mới trong `src/components/` không qua `/allow-new-component`, (c) skip `/component-mark-ready` sau khi tạo file (entry kẹt ở status `pending-create`).

**Status lifecycle** (Registry v2):
- `ready`: file đã tồn tại, anatomy filled — REUSE trực tiếp.
- `pending-create`: user approved qua `/allow-new-component`, file chưa tồn tại — agent-dev tạo file theo `anatomy_sketch` → `/component-mark-ready` flip ready.
- `deprecated`: KHÔNG reuse mới, mark for removal. Existing callers refactor sang replacement.

**Mechanical enforcement**:
- `scripts/check-component-registry-drift.sh` — drift detection status-aware (4 categories: missing-in-yaml WARN / ready+file-missing ERROR / pending+file-missing INFO / pending+file-exists WARN), warn-only ban đầu, escalate strict sau 1-2 wave.
- `scripts/hooks/check-web-new-component.sh` — sibling FM-018 mechanical block cho create-without-approval.

### Trigger (block conditions)

| Operation | When | Action |
|---|---|---|
| Compose UI feature code | Agent dùng `ui/*` raw + manual Label/RHF/error wiring khi `share/*` đã wrap anatomy đó | INTENT-layer rule: agent self-refuse via Bootstrap MANDATORY Gate; reviewer flag P2 |
| Create file `src/components/**/*.tsx` | Component name NOT trong `wave_scope.allow_components[]` | BLOCK (mechanical FM-018) → `/allow-new-component` |
| Drift check | File mới trong `src/components/{share,customs}/` không có entry trong registry | WARN (default) hoặc BLOCK (strict mode) |

### Why

W01 ship surface a recurring parallel-shell pattern (`dossier-template-form.tsx` `FieldRenderer` reimplemented `share/inputs/input` + `share/textareas/textarea` anatomy on top of `ui/input` + `ui/textarea` + `ui/label`). Anti-patterns §3 trong registry cite các evidence này. Without explicit pre-compose lookup + layer priority enforcement, agents tend to default to raw shadcn primitives — increasing duplication + maintenance debt.

### Recovery / exception path

- **Found in registry**: reuse component theo priority order (customs > share > ui). Cite registry entry ID trong opening message.
- **Not found**: extend existing component (priority customs first) qua `/allow-new-component reason="extend"`, hoặc propose new component theo `layer_choice_guidance` trong registry §4.
- **Drift warning**: append registry entry qua `/allow-new-component` (đã có file orphan trên filesystem cần register).

### Cross-references

- Registry source: `.claude/references/web-component-registry.yaml` (synced xuống `frontend/gf-gms-web/.claude/references/component-registry.yaml`)
- Lifecycle commands: `/allow-new-component` (append status=pending-create) + `/component-mark-ready` (pending-create → ready)
- Drift detection: `scripts/check-component-registry-drift.sh` (status-aware)
- Sibling FM: FM-018 (mechanical block CREATE-without-approval; FM-019 = intent-layer + drift sibling)
- Bootstrap policy: `frontend/gf-gms-web/.claude/agents/agent-{dev,fix}-garage-web.md` §MANDATORY Component Reuse Gate
- Wave reset: `/wave-end` clears `allow_components` — drift entries persist (file đã merge), follow-up CR-MINOR để cleanup hoặc canonical-register

---

## FM-020 — API doc read overwhelm (subagent skip mega API docs)

**Canonical rule**: Mọi `Architecture/api/*.md` vượt threshold 3,000 dòng HOẶC có ≥ 2 sub-module `## §3<letter>` scoped theo wave PHẢI có section `## §0 Wave Index` ở đầu file (sau frontmatter, trước §1) — mapping `Wave → Sections`. MANIFEST §3 Contracts to ratify PHẢI phản ánh scope này qua cột `Read scope` (auto-populate bởi `scripts/manifest-rebuild.py:get_api_wave_read_scope()`). Subagent (arch-author, arch-review, dev, execution-spec-author) đọc file theo `Read scope` — KHÔNG whole-file cho wave-indexed files.

**Cascading rule**: khi ratify thêm 1 sub-module `## §3<letter>` cho wave mới trong file API doc, MUST append 1 hàng vào §0 Wave Index **trong cùng commit**. Vi phạm để §0 stale → subagent tin nhầm file chỉ có scope cũ → miss endpoints wave mới (repeat W01/W03/W04 `§3c`/`§3e`/`§3g` review misses).

**Evidence (systemic, không phải one-off)**:
- `Tracking/ARCH-REVIEW-W04.md`: Pass 1 sót gap §3g GraphQL body vì reviewer "never scoped `-graphql.md`".
- `.claude/agents/agent-arch-review.md` v6 (2026-07-06): "`§3c` (W01), `§3e` (W03), `§3g` (W04) đều lọt qua review dù chỉ có 'SDL type + 1 dòng summary'."
- `.claude/agents/agent-arch-author.md` v4 (2026-06-24): "Inventory V2 R2 batch missed 16/23 endpoint details."
- File sizes: `agg-garage-graph-graphql.md` = 47,622 dòng · `gf-inventory-api.md` = 6,111 dòng.

### Trigger (warn conditions)

| Operation | When | Action |
|---|---|---|
| Add `## §3<letter>` sub-module | File API doc thêm heading `## §3<letter>` (kể cả `## 3<letter>.` house style) không kèm hàng tương ứng trong §0 Wave Index | WARN via `scripts/check-api-wave-index-drift.sh` (exit 0 warn-only) |
| Remove `## §3<letter>` sub-module | §0 Wave Index còn tham chiếu section không tồn tại (stale entry) | WARN via `scripts/check-api-wave-index-drift.sh` (exit 0 warn-only) |
| MANIFEST §3 read scope drift | MANIFEST `Read scope` cột không match §0 Wave Index của contract file | Auto-fixed by `/manifest-rebuild` regen (idempotent) |
| Subagent whole-file read of `Architecture/api/*.md >3k` | Prompt scope 1 wave nhưng subagent Read whole file thay vì bounded `§0+§3<letter>+§5` | INTENT-layer: reviewer flag P2 in `agent-arch-review` next pass; no mechanical block |

### Mechanical enforcement

- `scripts/check-api-wave-index-drift.sh` (warn-only, exit 0 always) — chạy tay hoặc CI info-only. Sibling shape với `check-component-registry-drift.sh` (FM-019).
- `scripts/manifest-rebuild.py:get_api_wave_read_scope()` — auto-populate MANIFEST §3 `Read scope` từ §0 Wave Index. Test W03/W04 verified cho agg-garage-graph-graphql + gf-inventory-api.

### Recovery / exception path

- **Drift warning "sub-module present but MISSING from §0"**: append 1 hàng vào §0 Wave Index cite wave + section + endpoint ID range + status + version. Bump 3-in-1 (Rule #9).
- **Drift warning "§0 references section NOT FOUND"**: xóa hàng stale khỏi §0 hoặc restore section nếu bị nhầm delete. Bump 3-in-1.
- **File dưới threshold không cần §0**: nếu file < 3,000 dòng VÀ có ≤ 1 wave sub-module — §0 optional (template v4 `_TEMPLATE-api.md` note). File nhỏ vẫn tương thích whole-file read.
- **Backfill roadmap**: sau W05/W06, nếu `gf-purchase-api.md` (7.4k) hoặc `gf-sales-api.md` (4.2k) vượt threshold, backfill §0 theo template. Wave-tagging sub-modules `§3<letter>` bắt buộc ngay khi backfill (không lazy).

### Cross-references

- Canonical spec: `.agents/_ref-api-doc-wave-index.md` (T3 reference doc)
- Template: `Architecture/api/_TEMPLATE-api.md` v4 (§0 skeleton) + `_TEMPLATE-graphql.md` v2 (§0 skeleton)
- MANIFEST convention: `boundaries/_TEMPLATE/MANIFEST.md` §3 Contracts to ratify Read scope column
- Populated files (baseline): `Architecture/api/agg-garage-graph-graphql.md` v7.48 · `Architecture/api/gf-inventory-api.md` v40
- Drift script: `scripts/check-api-wave-index-drift.sh`
- Generator: `scripts/manifest-rebuild.py:get_api_wave_read_scope()` + `/manifest-rebuild <wave>` command
- Sibling FM: FM-019 (drift check warn-only pattern precedent)

---

## FM-007 — Force-push (any branch — strict ban)

**Canonical rule**: `ADLC.md §6.2 (l) No force-push` (Rule #12 trong CLAUDE.md §3.2 mirror).
**Mechanical enforcement**: `scripts/hooks/check-bash-safety.sh` line 24-65 (3-check Option B strict).

### Triggers (block conditions)

| Code | Pattern detected | Action |
|---|---|---|
| `FM-007 force-push-protected` | Force flag (`-f`/`--force*`) hoặc `+refspec` xuất hiện với protected branch token (`main`/`master`/`release/*`) | BLOCK → `/cr-raise MAJOR` + PR + REVIEW_GROUP |
| `FM-007 force-push` | Force flag hoặc `+refspec` trên **any branch** (kể cả feature) — Option B strict ban | BLOCK → feature: `/cr-raise MINOR`; protected: PR + REVIEW_GROUP |
| `FM-007 push-all` | `--all` / `--mirror` (pushes every ref including protected) | BLOCK → push specific branches explicitly |

### Bypass vectors closed (CR-1781400100)

| # | Vector | Status |
|---|---|---|
| 1 | Flag SAU branch name (`git push origin main --force`) | ✅ Closed (3-check tách flag detection khỏi branch position) |
| 2 | Refspec `+` force (`git push origin +main`) | ✅ Closed (2b dedicated check) |
| 3 | Multi-line backslash continuation | ✅ Closed (flatten via `sed -E ':a;N;$!ba;s/\\\n/ /g'`) |
| 4 | Implicit branch (`git push --force` no args) | ✅ Closed (2a any force flag = block, branch-independent) |
| 5 | `--all` / `--mirror` + force | ✅ Closed (2c dedicated check, force flag optional) |
| 7 | `--force-if-includes` (git 2.30+) | ✅ Closed (added to `FORCE_FLAGS` allowlist) |
| 8 | Other protected branches | ⚠️ Auto-covered bởi Option B (block all force regardless); error message không phân biệt nếu branch = `develop`/`prod` |

### Known limitations (defer)

| # | Vector | Why defer | Mitigation |
|---|---|---|---|
| 6 | Variable substitution (`git push --force origin $TARGET`) | Hook chỉ thấy raw command trước shell expansion; không thể resolve `$TARGET` mechanically | **Rule (l) intent layer**: agent PHẢI tự refuse force-push trong instructions/rebase workflow kể cả khi command có `$VAR`. Hook vẫn block 2a vì `--force` flag detection branch-independent — chỉ miss case force-push qua `+$TARGET` refspec với $TARGET resolve thành protected branch (extremely rare). |

### Recovery / exception path

- **Feature branch personal rebase**: `/cr-raise MINOR` self-approve → log audit trail trong `Tracking/CHANGE-REQUESTS.md`.
- **Protected branch fix needed**: `/cr-raise MAJOR` + PR + REVIEW_GROUP merge. Force-push direct to protected = **never** allowed without 2-authority sign-off.
- **Alternative non-force workflows**:
  - GitHub/GitLab "Rebase and merge" PR option (re-applies commits, không force-push branch).
  - Push to new branch name: `git push origin feature/foo:refs/heads/feature/foo-rebased` (non-force, tạo branch mới, dùng PR diff).
  - Use `git push --force-with-lease` carefully sau khi `git fetch` (still blocked bởi hook — phải `/cr-raise MINOR` exception).

### Cross-references

- Hook source: `scripts/hooks/check-bash-safety.sh:24-65`
- Canonical rule: `ADLC.md §6.2 (l)`
- Mirror: `CLAUDE.md §3.2` rule #12
- STATE: `Execution/STATE.json` non_negotiables[20] + `_non_negotiables_help` (item 20 = l)
- BOOTSTRAP common-mistakes: `BOOTSTRAP-GUIDE.md §F.3` row 14
- CR audit trail: `Tracking/CHANGE-REQUESTS.md#CR-1781400100`

---

## FM-008 — GraphQL fragment shape drift causes whole-query reject

**Discovered**: BUG-W01-240 / BUG-W01-244 (W01, 2026-06-11), FEAT-INS-STL-DETAIL.

### Trigger

GraphQL fragment file (vd `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.ts`) đặc tả selection set không khớp với SDL của BFF aggregator. Apollo schema validator reject toàn bộ query → `data = undefined` → page render error-boundary fallback ("Không tìm thấy..." / "Something went wrong!").

Cụ thể axis nhầm: `breakdownByPayer { bh { service parts vat totalAfterVat } kh { ... } }` (payer-first) trong khi SDL declare `breakdownByPayer { service { bh kh } parts { bh kh } ... }` (metric-first per BUG-W01-209).

### Why drift

1. Surface A (`getServiceOrderByCode`) reshape sang Shape D flat-root (BUG-W01-218); Surface B (`getSettlementByCode.insurance`) giữ nested wrapper status quo (§4.3.7b.6 Open follow-up).
2. Dev viết FE fragment assume cùng axis với Surface A inline shape mà không kiểm tra SDL truth.
3. Có 2 hook khác query cùng surface — `use-get-settlement-by-code.ts` (axis đúng) và `use-insurance-settlement-detail.ts` (qua fragment sai). Cùng bundle, khác shape → confused diagnosis.
4. Test agent (`agent-test-e2e`, `agent-test-ui`) chỉ observed BFF error message ("Cannot query field `bh`") + suggest BFF SDL thiếu field — **misdiagnose**. Bug-report claim "FE query `breakdown { bh { amount vatRate vatAmount } kh { ... } }`" (field `vatRate`/`vatAmount` không tồn tại) là hallucinated.

### Prevention

- **FE fragment authoring**: Khi viết fragment cho SDL surface có nested cell type (vd `InsuranceBreakdownPair`), luôn check SDL via Apollo IDE / introspection trước. KHÔNG assume axis từ sibling surface.
- **FE fragment regression test pattern**: Add Vitest assertion check fragment text KHÔNG chứa deprecated pattern (vd `breakdownByPayer { bh {`). Xem `frontend/gf-gms-web/src/features/insurance-allocation/hooks/insurance-adjustment-fragment.test.ts` per `BUGFIX-BUG-W01-240.md`.
- **Test agent diagnose discipline**: Khi log bug với GraphQL validation error, **PHẢI capture request body** (selection set thực tế), không chỉ response. Probe `stl_bff_probe.spec.ts` ban đầu chỉ log response → không xác định client gửi shape nào → misdiagnose. Cần add `page.on('request', req => { req.postData() })` capture cho GraphQL endpoints.
- **BFF SDL change discipline**: KHÔNG thêm field SDL chỉ vì client báo "Cannot query field X" — luôn confirm client side fix khả thi trước (per Forbidden Action prompt §44 "KHÔNG breaking change to published REST/GraphQL signatures").

### Cross-references

- BUGFIX-BUG-W01-240.md (FE-side fix — canonical resolution)
- BUGFIX-BUG-W01-244.md (BFF-side analysis — no action needed)
- BUG-W01-209 (axis decision Shape B metric-first)
- BUG-W01-218 (Surface A Shape D flat-root)
- Architecture/integrations/INTEG-BFF-agg-garage-graph.md §4.3.7b.6 (Surface B Open follow-up)

---



## FM-W01-237 — `depreciationByLine` BFF mapper drops payload when client omits `parts[]`

### Symptom

`updateServiceOrderV3` mutation with `input: { hasInsurance: true, depreciationByLine: [{ lineId, percent }] }` (no `parts[]`) returns HTTP 200 but `dev_gf_sales.service_order_part.depreciation_percent` stays NULL — the line-level depreciation override is silently lost between client and DB.

### Root cause

`bffs/agg-garage-graph/src/graphql/modules/gf-accounting/settlements/insurance.mapper.ts:739` `applyDepreciationByLine(parts, byLine)` short-circuits with `if (!parts || ...) return parts;` — when the GraphQL client did not send a `parts[]` array (realistic in the "I only want to set depreciation" flow), the function returns `undefined`, no synthetic part list is built, and `depreciationByLine[]` is stripped at line 375 of the resolver before reaching gf-sales REST. gf-sales never receives the value and so can't persist it.

### Why this is sneaky

- gf-sales code looks fully wired (request DTO has `parts[].depreciationPercent`, `ServiceOrderPart#applyDepreciationPercent` is called on both create + update branches, MapStruct mapper maps by name, entity column exists with the right type). Reporters reading gf-sales source first will conclude gf-sales is broken — but it isn't.
- BFF transformer for line-level `depreciationByLine[]` (CR-1780801481) assumed `parts[]` would always be present alongside `depreciationByLine[]`; the assumption holds when FE rewrites the whole SO but breaks for the "depreciation-only" patch flow.

### Prevention

- **BFF transformer authoring**: when flattening client-side aggregate input to BE per-row scalar input, the transformer MUST emit a synthetic partial row when only the override is present. Mirror existing pattern from `flattenInsuranceAllocations` (which gracefully handles partial input).
- **Test agent diagnose discipline**: before blaming the BE for a missing-persist defect, audit the BFF transformer that owns the input shape — capture the actual REST payload (Wireshark / BFF access log) rather than relying on GraphQL request body alone.
- **gf-sales side**: optionally add an integration test that asserts when `parts: [{ id, depreciationPercent }]` is sent, the column persists — to lock in the contract gf-sales already honors.

### Cross-references

- BUGFIX-BUG-W01-237.md (escalation to agent-fix-agg-garage-graph)
- BUGFIX-BUG-W01-236.md (sibling validation gap — fixed in gf-sales)
- CR-1780801481 (D2 — original BFF `depreciationByLine` mapping)
- BUG-W01-017 (BFF WRITE flatten missing — same family of "transformer drops scalar input" drift)
- **BUG-W01-261 (2026-06-12 — contract refactor closes FM-W01-237 root cause)**: drift D2 không còn fixable by transformer tinker — root `depreciationByLine[]` đã được xoá khỏi SDL hoàn toàn; `depreciationPercent` chuyển xuống `UpdateServiceOrderPartV3Input` per-part. Mapper `applyDepreciationByLine` retired. Passthrough thuần `parts[]` — không còn "synthetic partial row" risk.

---

## FM-W01-261 — Duplicate-input drift (SDL root array vs REST per-part) leaks "depreciation-only" patch flow

### Symptom

`updateServiceOrderV3` SDL từng expose CẢ root `depreciationByLine: [{lineId, percent}]` LẪN `parts[i].depreciationPercent` (read-only). FE phải maintain 2 field song song; mapper phải tra cứu root array → assign vào `parts[i]` rồi strip root key. Khi FE chỉ gửi root array (không gửi `parts[]`), mapper short-circuit `return parts` (undefined), depreciation override silent drop (= FM-W01-237 root cause).

### Root cause

Spec drift D2 trong `INTEG-BFF-agg-garage-graph.md §4.3.7b.2`: SDL design ban đầu (CR-1780801481) chốt root array làm "single field for aggregate insurance allocation". Khi gf-sales REST contract (`gf-sales-api §3bis.1` line 4069) chuyển per-part canonical, SDL không sync — giữ duplicate. Mapper transform layer cố gắng bridge drift → fragile, expose corner case partial input.

### Why this is sneaky

- Duplicate field signal "free choice" cho FE: client có thể gửi 1 trong 2 → flow KHÔNG ổn định.
- Reviewer đọc SDL nghĩ "field cũ deprecated, FE sẽ tự migrate" — thực tế FE pin nguyên D2 vì simpler client-side.
- Mapper transform có code path "graceful skip" che giấu drop silently khi `parts[]` thiếu.

### Prevention

- **Contract-first**: SDL input field shape phải match REST canonical 1:1 từ ngày 1. Nếu REST chuyển per-part, SDL phải đổi đồng bộ — KHÔNG giữ root duplicate "vì FE convenience".
- **Refactor approach over mapper-patch**: khi spec đã xác định canonical (REST `parts[i].depreciationPercent`), fix = xoá field cũ + đẩy canonical xuống đúng vị trí (BUG-W01-261 approach), KHÔNG = giữ field cũ + mapper transform (BUG-W01-255 approach was rejected).
- **Regression contract test**: SDL contract test phải assert BOTH (i) canonical field accepted ở vị trí mới, (ii) field cũ rejected (validation error). Counter-shape assertion bắt regressing.
- **Co-ordination discipline**: BFF + Backend (gf-sales) + FE refactor phải PR same wave — atomic deploy hoặc orchestrated rollout. Single-side fix → cross-FEAT cascade fail (FEAT-INS-STL-DETAIL snapshot NULL, FEAT-INS-DASH-DEBT settlementSummary lệch).

### Cross-references

- BUGFIX-BUG-W01-261.md (BFF SDL refactor, 2026-06-12)
- BUGFIX-BUG-W01-262.md (paired gf-sales persist alignment — agent-fix-gf-sales scope)
- BUG-W01-255 (INVALID — superseded by 261; D2 mapper-transform approach rejected)
- BUG-W01-237 (original symptom — fully closed by 261 + 262)
- FM-W01-237 (predecessor failure mode — root cause now removed at contract level)

---

## FM-W02-301 — Mobile codegen pending (build_runner allowlist)

**Wave**: W02 · **Boundary**: garage-mobile · **Severity**: P1 · **Logged**: 2026-06-18

### Symptom

`flutter analyze` and pre-handoff build fail on garage-mobile after DEV adds `@freezed` sealed state, `@JsonSerializable` models, or new `auto_route` page registrations. Missing `*.freezed.dart`, `*.g.dart`, `router.gr.dart` files break the part-of imports.

### Root cause

Bash allowlist in `.claude/settings.json` did not include `flutter pub run build_runner *` / `dart run build_runner *`. DEV subagent could not self-serve codegen → annotations land in source but generated parts never regenerate.

### Resolution

Allowlist extended (W02, 2026-06-18) with four patterns scoped to mobile:

```
Bash(flutter pub run build_runner *)
Bash(dart run build_runner *)
Bash(cd mobile/gf-garage-app && flutter *)
Bash(cd mobile/gf-garage-app && dart run *)
```

### Prevention

- Mobile DEV self-check (REVIEW-CHECKLIST): after any `@freezed` / `@JsonSerializable` / `AutoRoute` change, run `cd mobile/gf-garage-app && dart run build_runner build --delete-conflicting-outputs` before `flutter analyze`.
- New annotation-driven codegen tools added to mobile stack → extend Bash allowlist in the same PR, do not defer.

### Cross-references

- CR for allowlist extension recorded in `.claude/settings.json` (W02 wave_scope.modify_allowlist symbol `Bash`)
- BR-INS-DOSSIER-005/006 (mobile dossier state)
- /spawn-dev mobile-fix-path orchestrator decision 2026-06-18

## FM-W02-302 — Mobile route naming convention mismatch (auto_route Page/Route strip)

**Wave**: W02 · **Boundary**: garage-mobile · **Severity**: P1 · **Logged**: 2026-06-18

### Symptom

Mobile DEV introduces new page widget with class suffix other than `Page` (e.g. `InsuranceDossierScreen`). Caller invokes `InsuranceDossierScreenRoute(...)` expecting auto_route to append `Route`. After codegen, `router.gr.dart` instead names the route `InsuranceDossierScreen` (no replacement applied), leaving callers referencing a non-existent symbol → compile fails.

### Root cause

`AutoRouterConfig(replaceInRouteName: 'Page,Route')` only rewrites class names ending in `Page` to `Route`. Any other suffix (`Screen`, `View`, `Modal`) is preserved verbatim — auto_route generates a route class with the same name as the widget, which often collides with the widget import in caller files.

### Resolution

- Widget classes annotated `@RoutePage()` MUST end in `Page`. The generated `*Route` class is the canonical caller symbol.
- For W02 dossier: renamed `InsuranceDossierScreen` → `InsuranceDossierPage` (+ state class), caller `InsuranceDossierScreenRoute(...)` → `InsuranceDossierRoute(...)`, router registration updated, re-ran build_runner to regenerate `router.gr.dart`.

### Prevention

- DEV agent guidance (`.claude/skills/dev/routing.md` mobile): when adding new `@RoutePage()` widget, MUST name class `*Page`. Reviewer R4 (Routing & DI safety) flags non-`Page` suffix at PR time.
- Lint idea (future): custom lint rule flags `@RoutePage()` on classes not ending in `Page`.

### Cross-references

- `lib/core/router/router.dart` (`@AutoRouterConfig(replaceInRouteName: 'Page,Route')`)
- `lib/ui/insurance_settlement/dossier/insurance_dossier_screen.dart` (rename point)
- `lib/ui/settlement/settlement_detail/insurance_settlement_detail_screen.dart` (caller fix)

## FM-W02-303 — Raw percent leaks into monetary field of cross-boundary DTO

**Wave**: W02 · **Boundary**: gf-sales (producer) + gf-accounting (consumer) · **Severity**: P1 · **Logged**: 2026-06-18

### Symptom

Print template (`settlement-insurance.html` / `settlement-customer.html`) render dòng "Khấu hao vật tư / thay mới" thành "-50" (hoặc "-50 đ") thay vì "-50.000 đ" cho worked example BR-EP §7.2 với khấu hao ~200.000 đ. Số hiển thị nằm trong khoảng 10–25, đúng range raw `%` (tỷ lệ khấu hao mặc định 10–25%).

### Root cause

Cross-boundary DTO consumer (gf-accounting `ServiceOrderForPrintDto`) thiếu deserialization cho field `breakdownByPayer.depreciationInsurance/depreciationCustomer` (monetary `BigDecimal` ở gf-sales). Print builder fall back về header-level raw `%` field `getDepreciationDefaultPercent()` rồi đẩy thẳng vào field monetary của template — Thymeleaf format integer + đơn vị " đ" → "-50 đ" thay vì "-50.000 đ". Cùng lớp lỗi với BUG-W02-004 (panel response).

### Resolution

- **Producer (gf-sales) — đã đúng**: `ServiceOrderForPrintResponse.breakdownByPayer.depreciation*` đã carry monetary (`InsuranceSettlementSummary.depreciationAmount = Σ part.finalAmount × depreciationPercent / 100` qua `ServiceOrderInternalService.computeDepreciationAmount`). Bổ sung regression test `forPrint_depreciation_isMonetary_notRawPercent` pin semantics (assert `33.000` cho part 110k × 30%, guard `> 100đ` chống raw `%` drift).
- **Consumer (gf-accounting) — fix song song**: add `breakdownByPayer` block vào `ServiceOrderForPrintDto`, đổi `SettlementPrintDataBuilder.buildInsuranceAllocation` consume monetary thay vì raw `%`.

### Prevention

- Khi designer cross-boundary REST contract đặt 2 trường có tên gần nhau với đơn vị khác nhau (vd `depreciationDefaultPercent` raw `%` + `depreciationAmount` monetary đ), DTO consumer PHẢI có unit test khẳng định monetary semantics (assert `> 100đ` hoặc tương đương) để chống slip raw `%` (0..100) vào field monetary.
- Khi extend response shape qua CR (vd CR-20260616-01 thêm `breakdownByPayer`), reviewer phải verify cả 2 side (producer DTO + consumer DTO + mapper) — REVIEW backend gap chính là source dẫn tới BUG-W02-004/005.
- Print template golden test phải render Thymeleaf rồi diff vs mockup (PKG-W02 §5 Gate) — KHÔNG chỉ verify template variant name (BUG-W02-006 mask issue).

### Cross-references

- BUG-W02-004 (panel) + BUG-W02-005 (print) — twin bugs, cùng root cause.
- `Execution/bugfixes/BUGFIX-BUG-W02-005.md` (gf-sales scope)
- PKG-W02 §4.1 (for-print contract) + §5 Gate (golden test)
- CR-20260616-01 PRINT-INS-001/007

## FM-W03-304 — `gf-inventory` has no `checkstyleMain` Gradle task (uses Spotless, not Checkstyle)

**Wave**: W03 · **Boundary**: gf-inventory · **Severity**: P3 (tooling gotcha, no functional impact) · **Logged**: 2026-07-01

### Symptom

FIX/DEV agent Exit Criteria for Java backend boundaries generically say `./gradlew checkstyleMain` must pass (per `CLAUDE.md` §1 lint row + `.claude/skills/rules-backend/SKILL.md` §8). Running that exact command in `services/gf-inventory` (repo `garage-functions/gf-inventory`) fails with "task 'checkstyleMain' not found" — the Checkstyle Gradle plugin is not applied in this repo's `build.gradle`.

### Root cause

`gf-inventory`'s `build.gradle` configures the **Spotless** Gradle plugin (`spotlessCheck` / `spotlessApply`) as its lint/format gate instead of Checkstyle. This is a per-repo tooling choice made when the service was scaffolded/imported (brownfield baseline) — not documented as an exception anywhere the generic backend rules/exit-criteria templates reference.

### Resolution

BUG-W03-029 FIX cycle (`agent-fix-gf-inventory`, 2026-07-01) ran `./gradlew spotlessCheck` as the equivalent lint gate when `checkstyleMain` was found not to exist — passed clean (0 formatting violations). No code change needed; this is a documentation/tooling-awareness gap, not a defect.

### Prevention

- Before running the generic lint command from `rules-backend` §8 Final pre-handoff checklist, DEV/FIX agents for `gf-inventory` should first check `./gradlew tasks --group verification` (or just try `checkstyleMain`, and on "task not found" fall back to `spotlessCheck`) rather than treating a missing task as a build failure.
- If other boundaries also turn out to use Spotless instead of Checkstyle, consider updating `.claude/skills/rules-backend/SKILL.md` §8 to say "run whichever of `checkstyleMain`/`spotlessCheck` the repo's `build.gradle` actually configures" instead of hardcoding `checkstyleMain` — flagged as a DEBT candidate, not fixed in this pass (out of BUG-W03-029's scope).

### Cross-references

- `Tracking/WAVE03/BUGS.md` BUG-W03-029 row + Change Log #16.
- `Execution/bugfixes/BUGFIX-BUG-W03-029.md` §6 Verification Checklist.

## FM-W03-305 — "Already shipped" treated as "already correct" when reusing a sibling page as structural reference

**Wave**: W03 · **Boundary**: garage-mobile · **Severity**: P2 · **Logged**: 2026-07-01

### Symptom

`internal_product_search_page.dart` / `internal_product_filter_page.dart` (PROD search/filter, FEAT-CAT-PROD-LIST) shipped with real widget-catalog violations (raw `TextField`/`DropdownButtonFormField`, missing TabBar, wrong token, raw spacing literal — BUG-W03-030/031). A later cycle built the sibling `material_group_search_page.dart` / `material_group_filter_page.dart` (GRP, same wave, same feature pattern) using PROD as a structural reference, but did not verify PROD's rules-mobile compliance first — it just assumed "already shipped" meant "already correct". GRP came out mostly right by accident (its author independently applied catalog rules correctly), but PROD itself was never fixed until this cycle.

### Root cause

No step in the DEV/FIX workflow required checking a reference page's own widget-catalog compliance (rules-mobile §2) or its `Tracking/WAVE{NN}/BUGS.md` OPEN-bug status before copying its structure into a new page. "Already shipped" was implicitly treated as sufficient evidence of "already correct" — the actual signal needed (rules-mobile conformance + no OPEN bug against the file) was never checked.

### Resolution

BUG-W03-030/031/032 FIX cycle (`agent-fix-garage-mobile`, 2026-07-01) fixed the 3 downstream defects (see `BUGFIX-BUG-W03-030.md` / `-031.md` / `-032.md`) and closed the process gap directly: `agent-dev-garage-mobile.md` + `agent-fix-garage-mobile.md` (both in `mobile/gf-garage-app/.claude/agents/`) now carry an explicit rule under their pattern-specific pointers — verify a reference page's rules-mobile §2 compliance + check `Tracking/WAVE{NN}/BUGS.md` for OPEN bugs against it BEFORE using it as a structural template; fix or flag a non-compliant reference rather than propagating its violations.

### Prevention

- Before scaffolding a new page from an existing "similar" page (same feature pattern, same wave), grep `Tracking/WAVE{NN}/BUGS.md` for the reference file's path and skim it against `rules-mobile SKILL.md §2 Widget Catalog First` — a few minutes of verification versus a downstream bug + rework cycle.
- If the reference itself is found non-compliant, either fix it first (small, in-scope) or flag it to the orchestrator/user and build the new page directly from the Figma spec instead of copying the flawed structure forward.

### Cross-references

- `Tracking/WAVE03/BUGS.md` BUG-W03-030/031/032 rows.
- `Execution/bugfixes/BUGFIX-BUG-W03-030.md`, `BUGFIX-BUG-W03-031.md`, `BUGFIX-BUG-W03-032.md`.
- `mobile/gf-garage-app/.claude/agents/agent-dev-garage-mobile.md` §Pre-impl reuse-radar.
- `mobile/gf-garage-app/.claude/agents/agent-fix-garage-mobile.md` §UI Fidelity Protocol.

## FM-W03-306 — Partial-class fix: anti-pattern fixed on 1 instance, sibling instances of the SAME defect class left unaudited

**Wave**: W03 · **Boundary**: garage-mobile · **Severity**: P2 · **Logged**: 2026-07-02

### Symptom

Two independent recurrences of "fixed once, missed the sibling occurrence" inside the same wave:

1. **BUG-W03-035**: CR-20260701-06 (2026-07-01) fixed the single-button `GroupListFooter` ("Thêm nhóm vật tư") flat-`Border(top:)` anti-pattern by rewriting it to use `BottomNavigationBarButton` (rounded + shadow), and even removed the unverified "Border-top" spec line from `wave03-cat-grp-list.md`. The FIX cycle verified code-vs-spec-text but never re-diffed the **2-button filter footer** (`material_group_filter_page.dart` / `internal_product_filter_page.dart`) against its own PNG oracle — same `Container(Border(top:))` anti-pattern shipped untouched, found a day later via user on-device QA.
2. **BUG-W03-036**: BUG-W03-024 (earlier in W03) fixed the `AppBarCustom` double-border defect (`hasShape: false`) on the **list pages** (`material_group_list_page.dart` / `internal_product_list_page.dart`). The identical `AppBarCustom` + `ListTabBarWidget` combination on the **search pages** (`material_group_search_page.dart` / `internal_product_search_page.dart`) — same boundary, same wave, same widget pair — was never checked, and shipped with the same missing `hasShape: false` (plus a related idiom violation: TabBar wired as a body child instead of `AppBarCustom.bottom:`).

### Root cause

FIX cycles in this codebase are scoped to the exact file(s) named in the bug report's `Component` column. Nothing in the FIX workflow (Bug Doc Chain, Activation Workflow) prompts the agent to grep the rest of the boundary for **other files matching the same defect signature** before closing the bug — even when the anti-pattern is a well-known, previously-codified class (`rules-mobile SKILL.md §2 R-CTA`, `hasShape: false` rule) with an existing mechanical gate (`check-mobile-canonical-primitives.py`). The gate only catches what it scans (files passed with `--file`), and it was never re-run wave-wide after either fix landed.

### Resolution

BUG-W03-035/036 FIX cycle (`agent-fix-garage-mobile`, 2026-07-02) fixed both remaining instances (see `BUGFIX-BUG-W03-035.md` / `BUGFIX-BUG-W03-036.md`). No sibling instances remain in `lib/ui/inventory_catalog/**` for either defect class (verified: `check-mobile-canonical-primitives.py` 0 hits on all 4 touched files; `hasShape` now set explicitly on every `AppBarCustom` usage across the 8 W03 inventory-catalog pages that pair it with a bordered adjacent widget).

### Prevention

- When a FIX closes a bug that is an instance of a **named, codified anti-pattern class** (i.e. it has a rule ID like `R-CTA` or a mechanical gate like `check-mobile-canonical-primitives.py`), grep the rest of the **same feature/boundary** for other files matching the same structural signature (e.g. `grep -rl "Border(top: BorderSide" lib/ui/<feature>/`, or `grep -rl "AppBarCustom(" lib/ui/<feature>/ | xargs grep -L "hasShape"`) before marking the bug `FIX_DONE` — not just the file(s) literally named in the report.
- Prefer running the mechanical gate wave-wide (`--dir lib/ui/<feature>/` if supported, or a loop over all touched-feature files) rather than only the single reported file, whenever the defect class already has a gate.
- Treat "1 instance of anti-pattern class X found + fixed" as a trigger to audit siblings, the same way `rules-mobile SKILL.md §9` lessons_learned entries are meant to prevent recurrence — log a new `lessons_learned` / FM entry only once, but the audit-siblings step should happen every time, not just after the 2nd occurrence is separately reported by a human.

### Cross-references

- `Tracking/WAVE03/BUGS.md` BUG-W03-035/036 rows (+ BUG-W03-024/025 rows, the original fixes that had the unaudited siblings).
- `Execution/bugfixes/BUGFIX-BUG-W03-035.md`, `BUGFIX-BUG-W03-036.md`.
- `.claude/skills/rules-mobile/SKILL.md` §2 R-CTA, `hasShape: false` rule (bullet 2 of Catalog order).
- `scripts/check-mobile-canonical-primitives.py`.

---

## FM-W03-307 — Locked-field visual decision made under "stale Figma oracle" citation, without cross-checking the app's own established `readOnly`+`enabled:false` convention

**Wave**: W03 · **Boundary**: garage-mobile · **Severity**: P3 (this incident) — pattern risk is broader · **Logged**: 2026-07-06

### Symptom

`BUG-W03-062` (2026-07-02, same session as `BUG-W03-064`) changed the "Mã nhóm VTHH" locked-code-field callsite in `material_group_form.dart` from `enabled: !widget.isEdit` (auto-grey via `AppTextField`'s built-in disabled fallback) to `readOnly: widget.isEdit` **only** — leaving `enabled` at its default `true` — citing a live Figma edit-mode mockup fetch (node `21254:51963`) that appeared to show the locked field with the same white/active fill as editable fields. The change was committed with an inline comment framing it as an intentional "call-site workaround, shared widget untouched." Four days later, Manual QC filed `BUG-W03-173`: the field visually reads as active/editable (white, no grey) and is inconsistent with the sibling "Thuộc nhóm" field, which correctly disables via `enabled: !widget.isEdit` and renders grey.

`.claude/memory/fix.md` `[FIX-041]` (logged the same day as the BUG-W03-062 change, 2026-07-02) had already flagged that the underlying Figma state for this exact locked-field question was uncertain ("không có Figma oracle hiện hành cho trạng thái khoá của dropdown … để đối chiếu xám-hay-trắng") while documenting a *different*, correctly-resolved instance (the "Thuộc nhóm" dropdown). The lesson was written but did not trigger a re-check of the sibling code-field decision it was directly adjacent to in the same file/session — the landmine it implicitly flagged went off 4 days later as a separate, independently-filed bug.

### Root cause

1. A single Figma node fetch was treated as sufficient grounds to override an app-wide, already-established convention (`readOnly: true` **paired with** `enabled: false` for locked/display-only fields — precedent already present elsewhere in the app: `customer_page_v3.dart:269-270`, `items_page_v3.dart:749-750`/`1434-1436`) without cross-checking that convention first.
2. No mechanical gate exists to catch "`readOnly: <expr>` passed to `AppTextField`/`TextField` without an accompanying `enabled: !<expr>` (or `enabled: false`)" — `check-mobile-canonical-primitives.py` does not scan for this pattern.
3. The Figma mockup used to justify the decision was, by the Product layer's own admission, already known to be stale for this exact screen's locked-field states (`FEAT-CAT-GRP-EDIT.md` v5 Change Log, 2026-07-02: "Figma edit-mode mockup … hiện còn vẽ dropdown active — STALE"), but this staleness caveat was not propagated to the code-field decision made in the same fix cycle for the same screen.

### Resolution

`BUG-W03-173` fix (2026-07-06, `agent-fix-garage-mobile`) reverted the `BUG-W03-062` call-site decision for the code field: added back `enabled: !widget.isEdit` alongside the existing `readOnly: widget.isEdit`, restoring `AppTextField`'s built-in grey-fill disabled branch and matching the "Thuộc nhóm" field. See `BUGFIX-BUG-W03-173.md`.

### Prevention

- Before using a single Figma node fetch to override an **existing, multi-site app convention** (grep the convention's other call sites first — e.g. `grep -rn "readOnly: true" lib/ | xargs grep -l "enabled: false"`), treat a mismatch as a signal to flag Design Authority / re-verify with a second node fetch, not to unilaterally diverge the one call site.
- When a Figma mockup for a given screen/state has already been flagged `STALE` anywhere in the Product docs for that FEAT (Change Log, verify.md, etc.), that staleness caveat applies to **every** visual decision on that screen made in the same session, not just the specific field the staleness note was originally written about — re-check sibling fields on the same screen before closing out the fix cycle.
- When a `.claude/memory/fix.md` lesson is logged the same day as a code change it discusses, and the lesson itself flags residual uncertainty (e.g. "no current oracle to confirm grey-vs-white"), treat that as an open follow-up, not a closed concern — the FIX exit protocol's "root-cause lặp lần 2+ → escalate" step should also apply proactively when a *fresh* lesson already names the exact risk that later reappears as a bug.

### Cross-references

- `Tracking/WAVE03/BUGS.md` BUG-W03-173 row (+ BUG-W03-062/064 rows, the original decision + its correctly-resolved sibling).
- `Execution/bugfixes/BUGFIX-BUG-W03-173.md`, `BUGFIX-BUG-W03-064.md`.
- `mobile/gf-garage-app/.claude/memory/fix.md` `[FIX-041]`, `[FIX-052]`.
- `mobile/gf-garage-app/lib/ui/inventory_catalog/widgets/material_group_form.dart`, `lib/ui/widgets/text_field/app_text_field.dart`.

