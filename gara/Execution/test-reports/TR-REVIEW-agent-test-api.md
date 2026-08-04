---
document_id: "TR-REVIEW-agent-test-api"
type: agent-review-report
parent: AGENT-REGISTRY
status: OPEN
version: 9
subject: "agent-test-api operability review"
boundary: "cross-boundary (TEST_GROUP)"
reviewer: "cuongnguyen_ac (Senior QC)"
execution_date: "2026-06-02"
last_reviewed: "2026-06-02"
---

# Review báo cáo — `agent-test-api`: đánh giá vận hành & checklist update

> Review tính ứng dụng thực tế của `agent-test-api` (TEST_GROUP) khi chạy trong môi trường Garage.
> Đây là **operability review** của agent spec + orchestration, KHÔNG phải wave test report.
> Theo dõi qua checklist §4 — đóng từng item khi fix xong, bump version khi cập nhật.

---

## 1. Phạm vi review

| Artifact | Đường dẫn |
|---|---|
| Agent spec (source-of-truth) | `.agents/agent-test-api.md` |
| Agent spec (runtime copy) | `.claude/agents/agent-test-api.md` |
| Orchestration script | `scripts/spawn-test.sh` |
| Slash command | `.claude/commands/spawn-test.md` |
| Skill | `.claude/skills/rules-test-api/SKILL.md` |
| Môi trường | `infra/docker-compose.yml` |
| State | `Execution/STATE.json` |
| Registry | `Execution/AGENT-REGISTRY.md` |

---

## 2. Verdict tổng quan

| Khía cạnh | Đánh giá |
|---|---|
| Thiết kế quy tắc QC (nội dung) | 🟢 Rất tốt — anti-"PASS giấy", family-based gate, write-side invariant, regression re-run |
| Tính khả thi khi chạy thực tế (hiện tại) | 🔴 Chưa chạy được end-to-end — hạ tầng + orchestration lệch khỏi spec |
| Khả năng bảo trì | 🟡 Rủi ro drift (2 bản copy + path hardcode) |

**Kết luận:** Spec định nghĩa triết lý kiểm thử xuất sắc, nhưng các giả định hạ tầng hardcode trong spec không khớp repo thật → nếu spawn ngay, agent sẽ dừng ở **Environment Readiness Gate** và mark toàn bộ TC `BLOCKED` sai lệch.

---

## 3. Findings (theo severity)

### 🔴 P1-A — Container list trong Readiness Gate lệch docker-compose
Spec (`.agents/agent-test-api.md:90`) yêu cầu 7 container healthy: `postgres, pgbouncer, redis, kafka, elasticsearch, kong, keycloak`.
`infra/docker-compose.yml` chỉ có: `postgres, pgbouncer, redis, kafka` (+ `kafka-ui`). **`elasticsearch, kong, keycloak` KHÔNG tồn tại.**
→ Gate chờ 3 container không bao giờ healthy → mark TẤT CẢ testcase `BLOCKED` sai, dừng execution.

### 🔴 P1-B — Backend services không build/chạy được tại design repo
14 service trong compose dùng `build: context: ../services/gf-*` và nằm sau `profiles: [backend]`. `services/` tree KHÔNG tồn tại (đây là design repo — Rule #19 NO-CODE).
→ Readiness Gate bước 0b (health check mỗi service) không thể pass. Mâu thuẫn nền tảng giữa "PASS chỉ từ runner chạy thật" và "design repo không có runtime".

### 🔴 P1-C — spawn-test.sh ghi automated output vào thư mục manual (ownership violation)
**Đã đính chính (v2):** Hai thư mục `test-cases/` và `automated-test-cases/` là **thiết kế có chủ đích, tách theo ownership** — KHÔNG phải mismatch của spec.

| Thư mục | Owner | agent-test-api | Nội dung |
|---|---|---|---|
| `Execution/test-cases/` | 👤 Human (QA Authority) | READ-ONLY | manual `TC-WAVE-*.md`, `TEST-CASE-REGISTRY.md`, `TC-TEMPLATE.md` |
| `Execution/automated-test-cases/` | 🤖 AI test agent | READ + WRITE | automated `TC-W{NN}-{API,E2E,UI,...}.md` |

Spec agent **internally đúng**: ghi automated TC vào `automated-test-cases/` (`:24,84,102`), đọc manual TC từ `test-cases/` read-only (`:75,97`). Convention nhất quán across cả 4 test agent.

**Bug thật nằm ở `scripts/spawn-test.sh:23-25`**: set `TC_OUTPUT_PATH = Execution/test-cases/W{WAVE}/TC-W{WAVE}-{type}.md` → đẩy output automated của agent vào đúng thư mục **manual của con người**, vi phạm trực tiếp luật trong `TC-TEMPLATE.md`: *"AI test agents KHÔNG ghi trực tiếp vào `Execution/test-cases/TC-WAVE-*.md`"*.
→ Hướng fix = **sửa spawn-test.sh trỏ về `automated-test-cases/`**, KHÔNG sửa spec theo script.
Phụ: `spawn-test.sh:72` đọc dedup context từ `test-cases/W{WAVE}/` pattern `TC-W*-*.md`, trong khi manual TC theo template đặt thẳng ở `test-cases/` tên `TC-WAVE-*.md` — naming/vị trí lệch.

**Mở rộng (v4) — phán định forensic "drift hay chủ đích":** Trace git xác nhận `test-cases/W{N}/` trong `test-plan.md` + `check-tc-coverage.py` là **DRIFT, KHÔNG chủ đích**:
1. Commit `4283333` (05-27) tạo *đồng thời* orchestration (`test-cases/W{N}/`) và agent contract (`automated-test-cases/`) — chưa bao giờ khớp nhau ngay từ đầu.
2. Lần duy nhất `test-cases/W{N}/` lọt vào agent spec (`b5545e7`) là **merge-conflict artifact** → commit kế tiếp `da7cdc4` *"resolve merge conflict markers"* xoá ngay (diff xoá đúng dòng `- Test cases written to Execution/test-cases/W{N}/...`).
3. Vi phạm luật ownership đã thành văn trong `TC-TEMPLATE.md` (AI KHÔNG ghi vào `test-cases/`).
4. 6/6 agent contract + TC-TEMPLATE dùng `automated-test-cases/`; chỉ 3 artifact orchestration còn path cũ = thiểu số bị bỏ quên.
→ Canonical = `automated-test-cases/`. Fix A2 + A4 hoàn tất một migration mà tác giả gốc để dang dở, không phải quyết định kiến trúc mới. **Còn lại drift thứ 3: `PROTOCOL.md §TEST_PLANNING` mô tả convention thứ ba (`Tracking/TEST-CASE-REGISTRY.md` / `Tracking/WAVE{NN}/`)** — chưa đụng tới (xem B5).

### 🟡 P2-A — Input artifact (đã xử lý một phần 2026-06-02)
| File | Trạng thái |
|---|---|
| `Tracking/TEST-LESSONS-LEARNED.md` | ✅ Đã thêm (đúng cấu trúc) — ⚠️ lineage SnapVersify, cần Garage-hoá |
| `Tracking/BUGS.md` | ✅ Đã thêm (đúng cấu trúc) — ⚠️ lineage SnapVersify, cần Garage-hoá |
| `Execution/work-packages/PKG-W{NN}-*.md` | 🔴 Vẫn thiếu (spec:64 đọc để chốt scope) |

⚠️ **Sub-issue mới:** cả 2 file mang tiêu đề *"SnapVersify"* và lesson W01 tham chiếu boundary dự án khác (`auth-client`, `platform-ui`, `tenant-ui`, `sv-tenant-service`) — không tồn tại trong Garage (`gf-*`, `agg-*`). Agent đọc section `ALL` + `agent-test-api` sẽ áp lesson sai dự án.

### 🟡 P2-B — Duy trì 2 bản copy identical
`.agents/agent-test-api.md` và `.claude/agents/agent-test-api.md` giống hệt nhau. spawn-test.sh đọc `.agents/`, runtime subagent load `.claude/agents/` → lệch sẽ khó debug. Chưa có cơ chế sync hiển thị.

### 🟢 P3 — Điểm nhỏ
- `model: sonnet` hardcode (frontmatter:5).
- spawn-test.md dùng `subagent_type=general-purpose` → `tools:`/write-scope chỉ là soft contract, không enforce cấp harness.

---

## 4. CHECKLIST CẦN UPDATE

### 🔴 Nhóm A — Chặn execution (xong trước khi spawn)

- [x] **A1.** ✅ DONE (2026-06-02) — Bỏ `elasticsearch/kong/keycloak`, thay bằng `(các infra container của wave — tối thiểu postgres, pgbouncer, redis, kafka)`. Áp đồng loạt **12 file** (6 test agent × `.agents` + `.claude/agents`), không chỉ agent-test-api, vì cùng defect. Verified: 0 file còn chuỗi cũ.
- [x] **A2.** ✅ DONE (2026-06-02) — `scripts/spawn-test.sh`: `TC_OUTPUT_PATH` → `Execution/automated-test-cases/`; tách `MANUAL_TC_DIR` (read-only) khỏi `AUTO_TC_DIR` (write); dedup đọc từ `AUTO_TC_DIR`; thêm case-map suffix (`ui→PLATFORM-UI`, còn lại uppercase). `bash -n` OK; smoke resolve đúng 6 type. **Spec giữ nguyên** (đang đúng).
- [ ] **A3.** Thêm mục "Execution Environment" vào spec: nêu rõ agent chạy ở đâu, services lấy từ đâu. Chọn (a) point Readiness Gate tới integration env qua env var `*_URL` (bỏ giả định build-local), hoặc (b) ghi precondition "services tree phải mount song song" + raise blocker khi thiếu thay vì mark BLOCKED hàng loạt.
- [x] **A4.** ✅ DONE (2026-06-02) — Hoàn tất propagate canonical TC path `automated-test-cases/` sang `.claude/commands/test-plan.md` (6 chỗ + suffix uppercase đúng spec) và `scripts/check-tc-coverage.py` (docstring + `tc_dir` + glob `TC-W{wave}-*.md`). Chain 4 thành phần (agent spec · spawn-test.sh · test-plan.md · check-tc-coverage.py) giờ đồng nhất; repo-wide 0 tham chiếu `test-cases/W{` còn sót.

### 🟡 Nhóm B — Toàn vẹn input artifact

- [x] **B1.** ✅ DONE (2026-06-02) — Hard reset `Tracking/TEST-LESSONS-LEARNED.md`: title→Garage; xoá 13 lesson SnapVersify W01 (auth-client/platform-ui...); giữ Usage Rules + Status Legend + 8 skeleton template rows; thêm Change Log.
- [x] **B2.** ✅ DONE (2026-06-02) — Hard reset `Tracking/BUGS.md`: title→Garage; xoá 106 bug row SnapVersify (W01+W02) + 56 change-log cũ; giữ rules/workflow/severity/status legend + template row (registry trống); reset Change Log về Garage-init. Registry header 15 cột verified.
- [ ] **B3.** Tạo `Execution/work-packages/` (+ ≥1 PKG mẫu cho wave active) HOẶC sửa spec:64 trỏ tới nguồn scope thực tế (Plan/ROADMAP, MASTER-EXECUTION-PLAN).
- [x] **B8.** ✅ DONE (2026-06-02) — Convert 2 file `TEST-CASE-REGISTRY.md` (SnapVersify → Garage): `Execution/test-cases/` (manual QC dashboard, v1 supersedes v10) + `Tracking/` (pointer read-only, v1 supersedes v5). Thay 14→18 boundary, dashboard theo TD P0 3 wave, suite domain Garage (booking→SO→settlement, quotation→PR→PO→receipt), isolation qua TenantFilter, link BUGS 2-tier, automated artifact `automated-test-cases/`. Suite/tracker files chưa tồn tại → đánh TBD thay link gãy. Giữ governance scaffolding.
- [ ] **B5.** Hợp nhất convention TC path trong `PROTOCOL.md §TEST_PLANNING`/`§TEST_EXECUTION`: hiện mô tả `Tracking/TEST-CASE-REGISTRY.md` (TBD, read-only pointer) cho TC. Lưu ý: TC thật ở `automated-test-cases/` (AI) + `test-cases/` (manual); `Tracking/TEST-CASE-REGISTRY.md` chỉ là summary/pointer. Làm rõ phân vai này trong PROTOCOL.
- [x] **B6.** ✅ DONE (2026-06-02) — Refactor `Tracking/BUGS.md` sang mô hình **2-tier đúng `Tracking/README.md`**: §3 = Cross-Wave Bug Index (pointer table) + §3.1 Per-Wave Registry Schema (bảng 15 cột); bug rows thật chuyển về `Tracking/WAVE{NN}/BUGS.md` (lazy-create khi có bug đầu tiên). Đây là **conformance fix** (đưa file về khớp thiết kế README sẵn có), không phải đổi design → không cần CR. Phán định forensic: bản BUGS.md đơn-file user thêm là model SnapVersify, lệch khuôn Garage; `PROTOCOL.md` (trỏ `WAVE{NN}/BUGS.md`) thực ra đang ĐÚNG.
- [ ] **B7.** Cascade từ B6 — cập nhật **write-scope bug** trong 6 agent spec `.agents/agent-test-*.md` (hiện `Tracking/BUGS.md`) → `Tracking/WAVE{NN}/BUGS.md` cho rows + update index ở `Tracking/BUGS.md`. Đồng bộ prompt `spawn-test.sh` (`bugs_filed`) + PROTOCOL §TEST_EXECUTION row 3. **Nên gom thành 1 CR** vì chạm 6 spec + orchestration. Ngoài ra: `Tracking/TEST-LESSONS-LEARNED.md` không nằm trong `README.md` index (cũng ngoại lai từ SnapVersify) — cần Delivery Authority quyết: thêm vào index hay tái cấu trúc.
- [ ] **B4.** Tạo thư mục `Execution/automated-test-cases/` (write-target của agent, hiện chưa tồn tại) + cân nhắc seed `.gitkeep` hoặc README ghi rõ ranh giới ownership với `test-cases/`. `Execution/auto/harness/api/` để agent tự bootstrap khi chạy. **Lưu ý:** đây là phân tách ownership có chủ đích (manual vs automated), KHÔNG đổi spec write-scope (spec:23-24 đang đúng).

### 🟢 Nhóm C — Bảo trì & nhất quán

- [ ] **C1.** Thêm cơ chế sync `.agents/ → .claude/agents/` (script/symlink) hoặc note "DO NOT EDIT — generated from .agents/" trong bản runtime, chống drift 2 bản.
- [ ] **C2.** Versioning 3-in-1 (Non-negotiable #15): mọi file sửa ở Nhóm A/B phải bump `version` + `last_reviewed` + Change Log entry. Thêm frontmatter/Change Log cho BUGS.md/TEST-LESSONS-LEARNED.md nếu chưa có.
- [ ] **C3.** (tuỳ chọn) Đăng ký `subagent_type` chuyên dụng cho spawn-test thay `general-purpose` để harness enforce tool whitelist.

---

## 5. Trạng thái tổng hợp

| Finding | Severity | Trạng thái |
|---|---|---|
| P1-A container list | P1 | ✅ FIXED (A1, 12 file) |
| P1-B services không build | P1 | OPEN (chờ A3 — execution environment) |
| P1-C spawn-test.sh ghi sai thư mục (ownership) | P1 | ✅ FIXED (A2) |
| P1-C ext: test-plan.md + check-tc-coverage.py drift (forensic: drift, không chủ đích) | P1 | ✅ FIXED (A4) |
| P1-C ext: PROTOCOL.md convention thứ ba | P2 | OPEN (B5) |
| P2-A input artifact thiếu | P2 | PARTIAL → 2 file đã Garage-hoá (B1/B2); còn `work-packages/` (B3) |
| P2-B 2 bản copy | P2 | OPEN (C1) |
| P3 model/subagent_type | P3 | OPEN (low, C3) |

**Cổng quyết định:** Còn lại **A3** (execution environment / P1-B) là blocker cứng duy nhất chặn agent chạy thật end-to-end. A1, A2 đã đóng. Phần còn mở: A3, B3, B4, C1–C3.

---

## 6. Review mở rộng — agent-test-e2e + agent-test-ui (2026-06-02)

Pattern giống agent-test-api: template SnapVersify **chỉ Garage-hoá một phần** (container list đã sửa trước đó, nhưng project name / design source / boundary / wave vẫn SnapVersify).

### ✅ Đã sửa (cả `.agents/` + sync `.claude/agents/`)

| ID | Vấn đề | Agent | Fix |
|---|---|---|---|
| C-1 | DESIGN source SnapVersify (`Product/ux/design/`, `dg-*.html`, `DESIGN-RULES.md`, `DG-STATIC-*` — đều **MISSING** cho Garage) | e2e + ui | Rewrite → `Product/ux/UX-FLOW-*.md` + figma oracle (`figma-test-{web,mobile}/{FEAT}-oracle.md`) + `DESIGN-SOURCE-POLICY.md` |
| C-2 | Project/boundary/persona SnapVersify | e2e + ui | Garage-hoá: garage-web/mobile, gf-*/agg-*, persona `accountant`/`garage-owner` |
| C-3 | Activation wave 20-wave SnapVersify | e2e + ui | → TD P0 (`Plan/README.md §4`) |
| U-4 | `.claude/agents/agent-test-ui.md` **drift** khỏi `.agents/` (rủi ro C1 thành hiện thực) | ui | Sync lại identical |
| U-5 | Numbering hỏng (`4.1/4.2`, `6.1`, separator dòng skill-load) | ui | Sửa → `5.1/5.2`, `7.1`, tách separator |

### ⏸ Còn mở (cần quyết định / CR — KHÔNG sửa ở đợt này)

| ID | Vấn đề | Severity | Lý do hoãn |
|---|---|---|---|
| U-1 | Artifact suffix `PLATFORM-UI` (boundary SnapVersify) còn 5 chỗ trong ui | 🔴 P1 | Cần chốt suffix Garage (`WEB`/`GARAGE-WEB`) + đồng bộ `spawn-test.sh` (mapping `ui→PLATFORM-UI`) + `test-plan.md` |
| U-2 | `garage-mobile` (Flutter) không có cơ chế test UI | 🟡 P2 | Quyết chiến lược: Flutter integration test/patrol vs service-repo agent |
| U-3 | Spec ↔ figma oracle spawn-test.sh | 🟢 | **Phần lớn đã đóng nhờ C-1** (spec giờ dùng figma oracle, khớp spawn-test.sh); còn align cuối |
| C-4 | BUGS path chưa 2-tier | 🟡 P2 | Gom CR B7 (6 agent) |
| E-1 | `playwright.config.ts` cross-repo `testDir ../../Execution/auto/specs` | 🟡 P2 | Làm rõ runner location multi-repo |

> **Suy luận lan toả**: rất có thể `agent-test-isolation/performance/security` cũng là template SnapVersify Garage-hoá một phần — cần review tương tự.

---

## 7. Review — agent-test-isolation + performance + security (2026-06-02)

Cùng pattern SnapVersify-Garage-hoá-một-phần, **cộng thêm** mâu thuẫn read-only/write riêng nhóm này. Cả 3 `.agents/ ↔ .claude/agents/` đồng bộ (không drift); `Product/BUSINESS-RULES.md` (security ref) tồn tại.

### ✅ Đã sửa (đã chọn T-1 = (a): cấp Write)

| ID | Vấn đề | Fix |
|---|---|---|
| T-1 | Read-only (`tools` thiếu Write) + không có `Allowed Write Scope`, nhưng methodology bảo tạo/cập nhật artifact + log bug + ghi lesson | Thêm `Write` vào `tools` + thêm section `Allowed Write Scope` (TC artifact, test report, `Tracking/WAVE{NN}/BUGS.md`, lessons) cho cả 3 |
| T-2 | Project name "SnapVersify" (Purpose) | → Garage (kèm chi tiết đúng: TenantFilter, Firebase/JWT, Temporal/Kafka/Redis) |
| T-3 | Activation wave 20-wave SnapVersify | → TD P0 (W01–W03, `Plan/README §4`) |
| T-4 | DESIGN source `Product/ux/design/*.html` (MISSING) | → `UX-FLOW-*.md` + figma oracle |
| T-7 | BUGS 2-tier (entailed bởi T-1=a) | Write scope trỏ `Tracking/WAVE{NN}/BUGS.md` |

### ⏸ Còn mở

| ID | Vấn đề | Severity |
|---|---|---|
| T-5 | Thiếu bước MANDATORY SKILL LOAD (api/e2e/ui có; 3 agent này không) → references không nạp | 🟢 P3 |
| T-6 | `agent-test-performance` thiếu skill `rules-functional-test` (isolation/security có) | 🟢 P3 |
| — | Harness subagent registry vẫn liệt kê 3 agent này "(Tools: Read, Bash, Grep, Glob)" — cần regen để phản ánh `Write` mới khai trong frontmatter | 🟡 P2 |

> **Trạng thái toàn TEST_GROUP (6 agent):** project name / design source / wave model đã Garage-hoá toàn bộ. Nhất quán hoá còn lại đã gom vào **`CR-1780450437`** (MODERATE, PENDING_APPROVAL — `Tracking/CHANGE-REQUESTS.md`): Item-1 BUGS 2-tier (api/e2e/ui) · Item-2 UI suffix `PLATFORM-UI`→`WEB` (U-1) · Item-3 harness registry regen · Item-4 skill consistency (T-5/T-6). Áp sau khi QA Authority approve.

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-02 | 1 | cuongnguyen_ac (Senior QC) | Tạo operability review cho `agent-test-api`: 6 findings (3×P1, 2×P2, 1×P3) + checklist 3 nhóm (A/B/C). Ghi nhận 2 file Tracking đã thêm (P2-A partial) + sub-issue lineage SnapVersify. |
| 2026-06-02 | 2 | cuongnguyen_ac (Senior QC) | Đính chính P1-C + A2 + B4: `test-cases/` (manual, human, read-only) vs `automated-test-cases/` (automated, AI, write) là phân tách ownership có chủ đích — spec ĐÚNG. Bug thật ở `spawn-test.sh:23-25` ghi automated output vào thư mục manual (vi phạm luật TC-TEMPLATE). Hướng fix đảo lại: sửa script, không sửa spec. |
| 2026-06-02 | 3 | cuongnguyen_ac (Senior QC) | Thực thi A1+A2+B1+B2. A1: patch container list 12 file test agent. A2: spawn-test.sh trỏ output về automated-test-cases/ + tách manual/auto dir + case-map suffix. B1/B2: hard reset 2 file Tracking (xoá 13 lesson + 106 bug SnapVersify), Garage-hoá title + Change Log. Còn mở: A3 (blocker cứng), B3/B4, C1-C3. |
| 2026-06-02 | 4 | cuongnguyen_ac (Senior QC) | Forensic git-trace P1-C: phán định `test-cases/W{N}/` trong test-plan.md + check-tc-coverage.py là **drift** (merge-conflict artifact bị xoá ở `da7cdc4`, vi phạm TC-TEMPLATE ownership), không chủ đích. Thực thi A4: propagate canonical `automated-test-cases/` sang test-plan.md (6 chỗ) + check-tc-coverage.py → chain 4 thành phần đồng nhất, repo-wide sạch. Phát hiện drift thứ 3 ở PROTOCOL.md → thêm B5. |
| 2026-06-02 | 5 | cuongnguyen_ac (Senior QC) | Đọc Tracking/README: phát hiện `BUGS.md` (single-file SnapVersify) lệch thiết kế Garage 2-tier (index + WAVE{NN}/BUGS.md). B6: refactor BUGS.md → Cross-Wave Bug Index + §3.1 schema, rows về WAVE{NN}/BUGS.md (conformance, không cần CR). B5 chỉnh lại (TEST-CASE-REGISTRY = pointer read-only). Thêm B7: cascade write-scope 6 agent spec → WAVE{NN}/BUGS.md (nên gom CR) + TEST-LESSONS-LEARNED.md ngoài README index. |
| 2026-06-02 | 6 | cuongnguyen_ac (Senior QC) | B8: convert 2 file TEST-CASE-REGISTRY.md (Execution/test-cases/ + Tracking/) từ SnapVersify sang Garage — 18 boundary, TD P0 3 wave dashboard, suite domain Garage, TenantFilter isolation, BUGS 2-tier, automated-test-cases/ canonical, suite files TBD. Grounded theo Plan/README §4 + CLAUDE.md §4 (KG-first, không bịa SLO). |
| 2026-06-03 | 9 | cuongnguyen_ac (Senior QC) | Gom các mục nhất-quán-hoá còn lại (B7/C-4, U-1, harness regen, T-5/T-6) thành **CR-1780450437** (MODERATE, PENDING_APPROVAL) trong Tracking/CHANGE-REQUESTS.md. Cross-ref §7. Áp sau approval. |
| 2026-06-02 | 8 | cuongnguyen_ac (Senior QC) | §7 mới: review agent-test-isolation + performance + security. Phát hiện mâu thuẫn read-only/write (T-1) — chọn (a): cấp `Write` + `Allowed Write Scope` (BUGS 2-tier) cho cả 3. Sửa T-2 (name), T-3 (wave→TD P0), T-4 (design→UX-FLOW+figma). Đồng bộ .claude. Hoãn T-5 (skill load), T-6 (perf skill), harness registry regen. |
| 2026-06-02 | 7 | cuongnguyen_ac (Senior QC) | §6 mới: review agent-test-e2e + agent-test-ui. Sửa C-1 (DESIGN→UX-FLOW+figma oracle), C-2 (Garage-hoá tên/boundary/persona), C-3 (wave→TD P0), U-4 (sync .claude drift), U-5 (numbering) cho cả 2 agent (.agents + .claude/agents synced, e2e sạch hoàn toàn). Hoãn: U-1 (suffix PLATFORM-UI, cần đồng bộ spawn-test.sh), U-2 (mobile), C-4 (BUGS 2-tier CR), E-1 (playwright cross-repo). |
