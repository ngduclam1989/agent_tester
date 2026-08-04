---
type: execution
artifact_kind: wave-demo-notes
status: ACCEPTED
version: 2
tier: T4
owner_authority: QA Authority
wave: W01
demo_date: "2026-06-17"
last_reviewed: "2026-06-18"
---

# W01 — Demo for PO + Wave Closure Notes

> Demo PO checklist log + W01 → W02 handoff core notes. Companion với `W01-DEV-handoff.md` (DEV phase) + `REPORT-QC-FINAL-2026-06-17.md` (QC sign-off dashboard).

---

## 1. Demo Snapshot

| Field | Value |
|---|---|
| Wave | W01 — Insurance Settlement Foundation (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL) |
| Demo date | 2026-06-17 |
| Demo result | **ACCEPTED with documented override** |
| Final QC | SIGNED by QA-Lead-Garage (2026-06-17T13:41:20Z) |
| Authorization | CR-20260617-01 MAJOR (W01-only override) |
| Authoritative dashboard | [`Tracking/WAVE01/REPORT-QC-FINAL-2026-06-17.md`](../../Tracking/WAVE01/REPORT-QC-FINAL-2026-06-17.md) |

## 2. Demo PO Checklist

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | SO Edit — toggle BH=Có hiển thị section phân bổ + 5 ô nhập | ACCEPTED | TC-W01-API-SOADJ-001..036 PASS (47/54), PLATFORM-UI 97.3% |
| 2 | SO Edit — lưu 5 khoản (CK VT, CK CDV, khấu hao, giảm trừ, khấu trừ) → persist + DB ground-truth | ACCEPTED | TC-W01-API-SOADJ-047 PASS, BUG-W01-285 VERIFIED |
| 3 | SO Detail — panel "Tổng giá dịch vụ" 3 phần read-only | ACCEPTED | E2E 93.3% PASS (28/30) |
| 4 | Tạo phiếu QT BH — atomic cặp BH+KH, gf-accounting pull → snapshot | ACCEPTED | Atomicity verified Run 4 |
| 5 | Chi tiết phiếu QT BH — 4 tab + panel + lịch sử thanh toán | ACCEPTED | TC-W01-API-STL PASS (15/21) |
| 6 | Bug L1 100% terminal | ACCEPTED | 69 VERIFIED + 14 INVALID + 1 DUPLICATE |

## 3. Override Justification (CR-20260617-01)

**Scope-out cho W01 only (one-time, KHÔNG precedent):**
- **SECURITY** — defer per user decision 2026-06-17. Sẽ handle wave riêng.
- **MOBILE-E2E** (29 TC BLOCKED) — Patrol harness chưa setup
- **MOBILE-UI** (BLOCKED) — Flutter golden harness chưa setup

**Pass rate after-override per in-scope agent:**

| Agent | Pass rate | Verdict |
|---|---|---|
| API | 82.7% (62/75) | PASS |
| E2E | 93.3% (28/30) | PASS |
| PLATFORM-UI | 97.3% (108/111) | CONDITIONAL_PASS |
| PERFORMANCE | 2/3 (1 BLOCKED-seed) | PASS |
| ISOLATION | CONDITIONAL_GO | No P1 cross-tenant; 1 P2 OPEN scope-out |

## 4. Known Issues Carried Forward → W02

| Bug ID | Severity | Description | Action | Target Wave |
|---|---|---|---|---|
| Mobile harness debt | — | Patrol + flutter_test + alchemist chưa setup | Setup pre-TEST_PLANNING W02 | W02 entry gate |
| SECURITY in-scope | — | W01 scope-out, W02 PHẢI re-enable | Include security agent W02 | W02 entry gate |
| BUG-W01-241 | P2 | JS error "i" FIX_DONE pre-override, observation | Monitor in W02 regression | W02 |
| TR-W01-* stale verdict text | — | TR text vẫn pre-override (FAIL/NO-GO) | Rewrite TR verdict reflect post-override | Cleanup task |

## 5. Dependencies Unlocked → W02

| Dependency | Provided by W01 | Consumed by W02 |
|---|---|---|
| `service_order.{discount_material/labor, depreciation_default, claim_reduction, insurance_deductible}` (8 cols) | gf-sales | W02 dossier creation (FEAT-INS-DOSSIER-CREATE) |
| `service_order_part.depreciation_percent` | gf-sales | W02 per-part adjustment in dossier |
| `getServiceOrderByCode.insuranceAdjustment` (breakdownByPayer + settlementBalance) | agg-garage-graph | W02 dossier read flow |
| Phiếu QT BH atomic pair create flow | gf-sales + gf-accounting | W02 dossier append-to-settlement |
| Panel "Tổng giá dịch vụ" component | garage-web | W02 CR-20260612-01 + CR-20260616-02 reflow 2 cột |

## 6. W02 Entry Requirements (binding)

| # | Check | Why |
|---|---|---|
| 1 | SECURITY agent re-enabled in-scope | W01 scope-out KHÔNG carry forward (per CR-20260617-01) |
| 2 | Patrol + Flutter (alchemist + bloc_test) harness verified | Mobile E2E/UI ran 0 PASS in W01 |
| 3 | TR-W01-* text reconciled với L1 post-override | Audit hygiene |
| 4 | W02 PKG slot CR-20260612-01 + CR-20260616-01 + CR-20260616-02 (Phase A) | Approved trong W01 cycle |
| 5 | Lesson-learned entry trong `Tracking/TEST-LESSONS-LEARNED.md` section `wave-exit-override` | Per CR-20260617-01 cascade |

## 7. Sign-off

| Role | Decision | Date | Notes |
|---|---|---|---|
| QA Authority | GO | 2026-06-17 | QA-Lead-Garage; STATE.qc.signed_by + qc.signed_at |
| Delivery Authority | GO (deferred async co-sign) | 2026-06-17 | Per CR-20260617-01 approval pattern |
| Business Authority (PO) | ACCEPTED | 2026-06-17 | Demo per checklist §2 (initial async acceptance) |
| **Business Authority (PO) — Dangbh** | **ACCEPTED (direct sign-off)** | **2026-06-18** | **Xác nhận hoàn thành Wave 01: demo đạt yêu cầu nghiệp vụ theo checklist §2 (6/6 items ACCEPTED). Bug/CR phát sinh sẽ được xử lý trong cycle W02 (chưa formal binding entry-gate tại thời điểm sign-off; PO sẽ quyết định scope carry-forward riêng nếu cần).** |

---

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-17 | 1 | agent-test-api + QA-Lead-Garage | Tạo W01 demo notes + wave closure handoff. Override basis = CR-20260617-01. |
| 2026-06-18 | 2 | PO (Dangbh) | §7 thêm dòng PO direct sign-off — Dangbh ACCEPTED ngày 2026-06-18, xác nhận hoàn thành Wave 01 demo đạt yêu cầu nghiệp vụ (6/6 checklist §2). Bug/CR phát sinh defer xử lý trong W02 cycle (chưa formal binding entry-gate — PO sẽ quyết định scope carry-forward riêng nếu cần). |
