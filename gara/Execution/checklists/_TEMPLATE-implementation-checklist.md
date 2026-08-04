---
type: execution
artifact_kind: implementation-checklist
status: TEMPLATE
version: 3
tier: T4
owner_authority: "Delivery Authority"
last_reviewed: "2026-06-20"
wave: "<WN>"
boundary: "<boundary>"
checklist_source: "<wave-spec | pkg-fallback>"
---

# Implementation Checklist — <WN> · <boundary>

> Generate bởi orchestrator (Delivery Authority) TRƯỚC `/spawn-dev <boundary>`.
>
> **Source** (xem `planning-wave` Step 4.5.0):
> - `wave-spec` → `Execution/wave-specs/W{NN}/Product/features/{tier}/FEAT-*.md` §2+§3+§8+§9
> - `pkg-fallback` → `PKG-W{NN}` §2/{tier} + `wave-{N}-tasks.md` + `Product/features/FEAT-*.md` ACs
> Luôn đọc thêm: `.harness/_REVIEW-CHECKLIST.md` (R*/D* — shift-left)
>
> **Orchestrator review checklist này trước khi spawn.** DEV subagent maintain như todo —
> tick `[x]` khi xong, hoặc `[deferred:<lý do>]` nếu chủ động hoãn (vào DEBT-REGISTRY).
> Stop hook chặn handoff nếu còn item `[ ]`.

---

<!-- HƯỚNG DẪN TEMPLATE
Format task:
  - [ ] T{n} <mô tả tiếng Việt> · scope:`<file/glob>` · ac:`FEAT-XXX-AC-n` · review:`R*/D*`
  Tùy chọn (khi source = wave-spec):
    · layer:`<domain|app|adapter|db|test|schema|resolver|cubit>` · seq:`<S1|S2|S3|S4|S5|S6>`

Format phase gate (prefix G-A, KHÔNG phải T):
  - [ ] G-A{n} <mô tả gate>

Ngôn ngữ: `<mô tả>` viết tiếng Việt có dấu. Giữ nguyên: tên file/path, class/method/biến,
FEAT-ID & AC-ID, R*/D*, status token, tên boundary, command/flag, thuật ngữ tech.
Các field `scope:`/`ac:`/`review:`/`layer:`/`seq:` luôn dạng keyword.

→ Dùng CẤU TRÚC 2-PHASE nếu wave block có Phase A + Phase B (xóa block SINGLE-PHASE).
→ Dùng CẤU TRÚC SINGLE-PHASE nếu wave là single-phase (xóa block 2-PHASE).
Xóa comment này trước khi ghi file thật.
-->

---

<!-- === CẤU TRÚC 2-PHASE (wave block có Phase A + Phase B) === -->

## Phase A — <title> (~N ngày)

> Source: wave-spec §8 DAG S1→S{m} | PKG §2.0/{tier} (fallback)
> Entry gate: <entry criteria từ wave block Phase A>

- [ ] T1 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R1,R5` · layer:`db` · seq:`S1`
- [ ] T2 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R2` · layer:`app` · seq:`S2`
- [ ] T3 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R3` · layer:`adapter` · seq:`S3`
- [ ] T4 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R4` · layer:`test` · seq:`S4`

### Phase A Exit Gate (PHẢI `[x]` TRƯỚC khi bắt đầu Phase B)

- [ ] G-A1 Build + test Phase A pass (`<./gradlew test | yarn build | flutter test>`)
- [ ] G-A2 <gate cụ thể từ WAVE-SEQUENCE §Wave N — vd "GraphQL contract v{NN} stable">
- [ ] G-A3 <gate tùy wave — vd "PO sign-off CR list Phase A" / "Staging deploy + smoke verify">

## Phase B — <title> (~N ngày)

> Source: wave-spec §8 DAG S{m+1}→S{k} | PKG §2.2/{tier} (fallback)
> Entry gate: Phase A Exit Gate `[x]`

- [ ] T5 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R1` · seq:`S5`
- [ ] T6 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R2` · seq:`S6`

---

<!-- === CẤU TRÚC SINGLE-PHASE (wave single-phase, không có Phase A/B) === -->

## Tasks

> Source: wave-spec §8 | PKG §2/{tier} (fallback)
>
> Format: `- [ ] T{n} <mô tả> · scope:<path> · ac:<FEAT-AC> · review:<R*/D*>`
>
> **Ngôn ngữ mô tả task**: viết `<mô tả atomic>` bằng **tiếng Việt có dấu**. NGOẠI LỆ — giữ
> nguyên (không dịch, không bỏ dấu): keyword kỹ thuật / định danh — tên file & path,
> class/method/biến, FEAT-ID & AC-ID, review-ID (R*/D*), status token (`[x]`, `[deferred]`),
> tên boundary, command/flag, và thuật ngữ tech (REST, Kafka, outbox/inbox, GraphQL, Temporal,
> Flyway, JPA…). Các field `scope:`/`ac:`/`review:` luôn giữ nguyên dạng keyword.

- [ ] T1 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R1,R5`
- [ ] T2 <mô tả> · scope:`<path>` · ac:`FEAT-XXX-AC-n` · review:`R2`

---

## Pre-handoff self-check (DEV chạy trước /dev-handoff)

- [ ] Mọi task trên `[x]` hoặc `[deferred:…]`
- [ ] **Nếu 2-phase**: Phase A Exit Gate (`G-A*`) tất cả `[x]` trước khi Phase B task bắt đầu
- [ ] Chạy self-review theo `.harness/_REVIEW-CHECKLIST.md` — không còn P0/P1 tự phát hiện
- [ ] Build + lint + test pass; coverage đạt ngưỡng
- [ ] 3-in-1 version bump trên artifact chạm (nếu có)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-20 | 3 | Delivery Authority | Thêm phase structure (Phase A/B + Exit Gate block), `layer:` + `seq:` optional fields, `checklist_source` frontmatter, hướng dẫn template 2-phase vs single-phase. Backward-compatible: single-phase vẫn dùng `## Tasks`. |
| 2026-06-03 | 2 | Delivery Authority | Thêm rule ngôn ngữ: mô tả task tiếng Việt có dấu, ngoại trừ keyword/định danh. |
| YYYY-MM-DD | 1 | Delivery Authority | Generated for <WN>/<boundary>. |
