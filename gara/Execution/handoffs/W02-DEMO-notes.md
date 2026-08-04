---
type: execution
artifact_kind: wave-demo-notes
status: ACCEPTED
version: 1
tier: T4
owner_authority: QC Authority
wave: W02
demo_date: "2026-06-26"
last_reviewed: "2026-06-26"
---

# W02 — Demo for PO + Wave Closure Notes

> Demo PO checklist log + W02 → W03 handoff core notes. Companion với `W02-DEV-handoff.md` (DEV phase), `W02-REVIEW-handoff.md`, `W02-TEST-PLANNING-handoff.md` + `Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md` (QC sign-off dashboard).

---

## 1. Demo Snapshot

| Field | Value |
|---|---|
| Wave | W02 — Settlement Adjustments + Insurance Dossier (FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW) |
| Phase | EP-INSURANCE-SETTLEMENT slice 2/3 (Phase A → Phase B) |
| Boundaries | gf-accounting · gf-sales · agg-garage-graph · garage-web · garage-mobile |
| Demo date | 2026-06-26 |
| Demo result | **ACCEPTED with documented override** |
| Final QC | SIGNED by anhluong (QC/Business+Delivery Authority) @ 2026-06-26T09:50:00Z |
| Authorization | CR-20260626-01 MAJOR (W02-only TEST_EXECUTION exit override → QC manual re-verify) |
| Authoritative dashboard | [`Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md`](../../Tracking/WAVE02/REPORT-QC-FINAL-2026-06-26.md) |

## 2. Demo PO Checklist

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Tạo phiếu quyết toán BH (FEAT-INS-STL-CREATE) — luồng tạo settlement từ SO có BH | ACCEPTED | TC-W02-API STL-CREATE PASS; SET-20260626-00004(BH)/00003(KH) seeded |
| 2 | Tạo hồ sơ BH (FEAT-INS-DOSSIER-CREATE) — dossier gắn settlement, preload draft | ACCEPTED | dossier on SET-20260626-00004; API/UI/mobile PASS sau manual re-verify |
| 3 | Xem hồ sơ BH (FEAT-INS-DOSSIER-VIEW) — render dossier detail | ACCEPTED | TC-W02-API DOSVIEW PASS; DOSVIEW-017/018 premise-invalid→PASS |
| 4 | Mobile parity — 3 FEAT trên garage-mobile (BLoC + widget) | ACCEPTED | MOBILE-UI 94 PASS; MOBILE-E2E 38 manual test trên device |
| 5 | Tenant isolation — dossier scoped by JWT token (không cross-tenant) | ACCEPTED | BUG-W02-107 IDOR live re-verify → INVALID (token-scoped, probe foreign code → 0 data) |
| 6 | Bug L1 100% terminal | ACCEPTED | 94 VERIFIED + 18 INVALID + 0 OPEN/chờ-verify (112 total) |

## 3. Override Justification (CR-20260626-01)

**Scope: W02 TEST_EXECUTION → QC stage transition only, one-time, KHÔNG precedent. No code/contract/forbidden_paths change.**

TEST_EXECUTION exit gate automated FAIL 4/5 (chỉ `parity_lesson_learned` met; `pass_rate_ok` + `no_p1p2_unresolved` + `no_resolved_unverified` + `agent_internal_gates_met` not met). Authority (anhluong) override → QC manual acceptance:
- **Vòng 1**: 34 TC FAIL → PASS (manual verify).
- **Vòng 2**: 84 TC BLOCKED → PASS (manual test lại hết 2026-06-26).
- 24 chờ-verify + 32 OPEN bug → VERIFIED (QC-manual attestation, không phải automated re-test).
- BUG-W02-107 (P1 cross-tenant IDOR) → re-verify live → **INVALID** (misdiagnosis).

**TC board sau override:** 309 PASS · 0 FAIL · 0 BLOCKED · 67 SKIPPED (out-of-scope) · 14 DEFER · 10 WITHDRAWN — pass rate 77.3% (của 400 TC).

**Out-of-scope (user decision, KHÔNG phải clearance):** SECURITY 33 + PERFORMANCE 6 + ISOLATION 15 = 54 TC SKIPPED.

## 4. Known Issues Carried Forward → W03

| Bug ID | Severity | Description | Action | Target |
|---|---|---|---|---|
| BUG-W02-136 | P1 | Patrol APK gradle build fail — mobile-e2e automation block (manual-tested only) | DEV real code fix cho auto-regression | W03 |
| BUG-W02-117 | P1 | Chromium GPU crash macOS Apple-Silicon — 4 e2e regression blocked | Runner `--disable-gpu` / Linux CI | W03 |
| web ui dispute | — | garage-web 009-014/063-066/074-082: e2e PASS nhưng ui component-level từng FAIL; QC-manual override (chưa clean re-verify single-owner) | Single-owner clean re-verify | W03 |
| SEC/PERF/ISO out-of-scope | — | 54 TC SKIPPED (BUG-029/030/031 SEC + BUG-033 ISO P1 vẫn defer) | Wave bảo mật riêng | W03+ |
| Unresolved CRs | — | CR-20260622-01/06/07/08, CR-20260624-01 (resolved=false) | Carryover audit | /wave-start 03 |

## 5. Dependencies Unlocked → W03

| Dependency | Provided by W02 | Consumed by W03 (slice 3/3) |
|---|---|---|
| Insurance settlement create flow (FEAT-INS-STL-CREATE) | gf-accounting + gf-sales | W03 settlement lifecycle extension |
| Insurance dossier entity + create/view (FEAT-INS-DOSSIER-CREATE/VIEW) | gf-accounting + agg-garage-graph | W03 dossier downstream (approval/export) |
| `GET /api/v1/insurance-dossiers/current` (CR-20260622-01) | gf-accounting | W03 dossier preload (pending CR resolve) |
| Dossier modal refactor FM-019 (CR-20260622-08) | garage-web | W03 web dossier extensions |

## 6. W03 Entry Requirements (binding)

| # | Check | Why |
|---|---|---|
| 1 | Patrol gradle (BUG-136) + GPU runner (BUG-117) fixed | Auto-regression cần xanh trước manual gate W03 |
| 2 | garage-web e2e/ui dispute reconciled (single re-verify owner) | QC-manual override KHÔNG carry forward |
| 3 | Unresolved CRs (W02) triaged trong carryover audit | /wave-start 03 auto-load |
| 4 | Lesson-learned entry `Tracking/TEST-LESSONS-LEARNED.md` (wave-exit-override + manual-QC basis) | Per CR-20260626-01 cascade |
| 5 | SEC/PERF/ISO scope decision cho W03 | W02 out-of-scope KHÔNG carry forward mặc định |

## 7. Sign-off

| Role | Decision | Date | Notes |
|---|---|---|---|
| QC Authority | GO | 2026-06-26 | anhluong; STATE.qc.signed_by + qc.signed_at @ 09:50:00Z |
| Delivery Authority | GO | 2026-06-26 | Per CR-20260626-01 (Business + Delivery Authority same person) |
| Business Authority (PO) | ACCEPTED | 2026-06-26 | Demo per checklist §2 (6/6 ACCEPTED) — manual-QC basis acknowledged |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-26 | 1 | agent-test-orchestrator (Authority anhluong) | Tạo W02 demo notes + wave closure handoff. Override basis = CR-20260626-01 (TEST_EXECUTION exit → QC manual re-verify). 6/6 checklist ACCEPTED. Carry-forward: BUG-136/117 automation debt, web ui dispute, SEC/PERF/ISO out-of-scope, 5 unresolved CRs → W03. |
