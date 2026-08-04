---
document_id: "TR-W02-PLATFORM-UI"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: BLOCKED
version: 10
wave: "W02"
agent: "agent-test-ui"
boundary: "garage-web"
execution_date: "2026-06-26"
last_reviewed: "2026-06-26"
---

# Báo cáo kiểm thử — Wave W02: Insurance Settlement & Dossier (Web UI)

> Báo cáo kết quả kiểm thử cho Wave W02, thực thi bởi `agent-test-ui`.
> Nguồn TC: `Execution/automated-test-cases/TC-W02-PLATFORM-UI.md` (v8).
> Tất cả TCs là C3 (Playwright live browser) — wording/render/layout/visual/route-transition assertions.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W02 |
| **Subject / execution slice** | Insurance Settlement + Dossier Create + Dossier View — Web UI (garage-web) |
| **Boundary(ies)** | `garage-web` |
| **Agent thực thi** | `agent-test-ui` |
| **Nguồn thống kê** | AUTOMATED (Playwright C3) |
| **Ngày bắt đầu (Run 1)** | 2026-06-22 |
| **Ngày kết thúc (latest run)** | 2026-06-26 |
| **Số lần chạy chính thức** | 10 (Run 1 = initial; Run 2-9 = re-verify; Run 10 = 2026-06-26 re-verify sau fix batch) |
| **Loại kiểm thử** | Wave + Regression |
| **Môi trường** | Remote SIT: `http://192.168.110.191:45300` (garage-web), BFF `:45401`, SSO `:45410` |
| **Phiên bản code (latest run)** | nginx Last-Modified: `Fri, 26 Jun 2026 03:51:38 GMT` (branch `feature/ep-insurance-settlement-w02`) |
| **Gate source** | `Execution/work-packages/PKG-W02-insurance-dossier.md` + figma oracle 10 screens |
| **Kết luận tổng quát (latest run)** | **BLOCKED** |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit/Build | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-22 | `/test-exec` initial | — | 0 | 0 | 0 | 20 | 0 | — | — | BLOCKED (Playwright permission) |
| Run 2 | 2026-06-22 | Re-run sau env fix | — | 20 | 4 | 16 | 0 | 0 | BUG-W02-069..071 | — | FAIL |
| Run 3 | 2026-06-23 | Re-verify sau BFF fix | — | 20 | 4 | 16 | 0 | 0 | — | BUG-W02-018 VERIFIED | FAIL |
| Run 4 | 2026-06-23 | Re-verify | — | 0 | 0 | 0 | 20 | 0 | — | — | BLOCKED (stack unreachable) |
| Run 5-8 | 2026-06-23..24 | Re-verify vòng | — | 20 | 4 | 16 | 0 | 0 | — | — | FAIL |
| Run 9 | 2026-06-24 | Re-verify fresh data | nginx 2026-06-24 09:05 GMT | 20 | 4 | 16 | 0 | 0 | BUG-W02-069 (root blocker) | — | FAIL |
| Run 10 | 2026-06-26 | `/test-exec` re-verify sau fix batch 2026-06-25/26 | nginx 2026-06-26 03:51 GMT | 20 | 3 | 16 | 0 | 1 | **BUG-W02-126** (P1 NEW) | NONE (all BLOCKED) | **BLOCKED** |

**Ghi chú Run 10**: Fresh data 2026-06-26: `SET-20260626-00008` (BH), `SET-20260626-00007` (KH), `PDV-20260626-00007`. Root blocker mới: **BUG-W02-126** (insurance UI regression — tab "Hồ sơ bảo hiểm đã xuất" + button "Tạo hồ sơ bảo hiểm" + tất cả insurance sections VẮNG MẶT trên trang chi tiết phiếu QT BH; error toast khi page load). BFF xác nhận `soHasInsurance=true` — defect ở FE code. BUG-W02-069 (INVALID 2026-06-24) tái diễn trên build khác → filed BUG-W02-126 mới.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu (Run 10 — 2026-06-26)

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi (spec-implemented) | 20 | — | — |
| TC PASS | 3 | — | — |
| TC FAIL | 16 | 0 (exit gate) | KHÔNG |
| TC SKIPPED | 0 | — | — |
| TC BLOCKED-by-harness (spec gap — TC-R05/R06) | 2 | — | — |
| **Tỷ lệ pass** | **15%** (3/20) | ≥ 80% | KHÔNG |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở (wave-owned UI) | 1 (BUG-W02-126) | 0 | KHÔNG |
| FIX_DONE bugs chưa verify | 16 | 0 | KHÔNG |
| TC BLOCKED-by-harness (chưa implement) | 40 | — | — |

### 2.2 Phân bổ theo mức ưu tiên (Run 10 — spec-implemented TCs)

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| P1 (Critical) | 12 | 2 | 10 | 0 | 17% |
| P2 (High) | 8 | 1 | 6 | 2 | 13% |

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | Tỷ lệ pass |
|---|---|---|---|---|
| UI Web (Playwright C3) | 20 | 3 | 17 | 15% |
| Regression UI | 4 (TC-R01/R04/R05/R06) | 1 | 3 | 25% |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated (Playwright QC-owned harness) | 20 | 3 | 16 | 0 | 1 | `Execution/auto/harness/playwright/pw-w02-ui.config.ts` |
| Manual | N/A | — | — | — | — | `Execution/test-cases/TC-W02-UI.md` (read-only reference) |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 2 (base) | Run 9 | Run 10 (latest) | Δ Run2→Run10 | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---|---|
| Total TC executed | 20 | 20 | 20 | 0 | — | — |
| PASS count | 4 | 4 | 3 | -1 | ≥ 18 | KHÔNG |
| FAIL count | 16 | 16 | 16 | 0 | 0 | KHÔNG |
| BLOCKED count | 0 | 0 | 0 | 0 | — | — |
| Tỷ lệ pass | 20% | 20% | 15% | -5 pp | ≥ 80% | KHÔNG |
| Bugs P1 open (web UI) | 2 (069,070) | 2 (069→INVALID) | 1 (BUG-W02-126) | -1 net | 0 | KHÔNG |
| Bugs FIX_DONE chưa verify | 6 | 16 | 16 | +10 | 0 | KHÔNG |
| Bugs VERIFIED cumulative | 1 (018) | 1 | 1 | 0 | — | — |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|
| TC-A02 | Trang "Tạo phiếu QT" không BH — sections BH bị ẩn | PASS | ~3s | Cẩn thận: passes vì BUG-W02-126 làm FE không render insurance UI trên BẤT KỲ settlement nào. Negative assertion pass vacuously. Cần re-run sau fix. |
| TC-C02 | Tab "Hồ sơ BH đã xuất" — Empty state copy | PASS | ~3s | "Chưa có hồ sơ nào được xuất" visible. Đúng. |
| TC-R01 | Settlement Detail per-payer regression | PASS | ~4s | "Khách hàng thanh toán" + "Bảo hiểm thanh toán" visible. CR-20260612-01 không regression. |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|---|
| TC-R01 | Settlement Detail per-payer panel split | W02 CR-20260612-01 | PASS | ~4s | Không regression |
| TC-R04 | Popup "Hoàn thành phiếu dịch vụ" wording | W02 CR-20260612-02 | FAIL | ~60s+ | Browser crash sau long suite (NSNotificationCenter/CVDisplayLink macOS headless) |
| TC-R05 | STL-DETAIL KH không BH — "Tổng chi phí" | W02 BUG-W02-105 | BLOCKED-by-harness | — | Spec chưa có trong spec file |
| TC-R06 | STL-DETAIL KH có BH — panel "Tổng giá dịch vụ" | W02 BUG-W02-105 | BLOCKED-by-harness | — | Spec chưa có trong spec file |

### 3.3 E2E Journeys

N/A — agent-test-ui scope là UI behavior (C3 Playwright); cross-service E2E thuộc `agent-test-e2e`.

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Mức ưu tiên | Run 2 | Run 9 | Run 10 | Linked Bug (current status) | Final verdict |
|---|---|---|---|---|---|---|---|
| TC-A01 | Conformance trang "Tạo phiếu QT" có BH | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-A02 | Conformance trang "Tạo phiếu QT" không BH | P1 | PASS | PASS | PASS | BUG-W02-018 (VERIFIED) | PASS ⚠️ |
| TC-A03 | Field "Tổng tiền bảo hiểm trả" read-only | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-A04 | Panel "Tổng giá dịch vụ" có BH — 3 ô tổng | P2 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-A05 | Panel "Tổng giá dịch vụ" không BH — 2 dòng | P2 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-A06 | Footer buttons "Hủy" + "Xác nhận" | P2 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B01 | Modal "Hồ sơ bảo hiểm" tiêu đề + 4 accordion | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B02 | Modal state 4/4 tất cả checkbox tích | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B03 | 4 checkbox mặc định bỏ trống khi modal mở | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B08 | Button "Xuất hồ sơ BH" disabled khi 0 checkbox | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B09 | Button "Xuất hồ sơ BH" enabled khi tích ≥1 | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-B13 | Click "Huỷ bỏ" đóng modal | P2 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-C01 | Tab "Hồ sơ BH đã xuất" — Populated state | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-C02 | Tab "Hồ sơ BH đã xuất" — Empty state | P1 | PASS | PASS | PASS | N/A | PASS |
| TC-C03 | Tab active style + inactive style | P2 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-C04 | Click file card mở PDF new tab | P1 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-C05 | Nhiều bộ hồ sơ stack dọc gap=24 | P2 | PASS | PASS | PASS | N/A | PASS ⚠️ |
| TC-C06 | Accessibility tab + file card | P3 | FAIL | FAIL | FAIL | BUG-W02-126 (OPEN) | FAIL |
| TC-R01 | Regression: Settlement Detail per-payer | P1 | PASS | PASS | PASS | N/A | PASS |
| TC-R04 | Regression: Popup "Hoàn thành phiếu dịch vụ" | P1 | (no rerun) | (no rerun) | FAIL | N/A (browser crash) | FAIL |
| TC-R05 | Regression: STL-DETAIL KH không BH | P2 | — | READY | BLOCKED-by-harness | CR-20260624-01 | BLOCKED-by-harness |
| TC-R06 | Regression: STL-DETAIL KH có BH | P2 | — | READY | BLOCKED-by-harness | N/A | BLOCKED-by-harness |

⚠️ **Ghi chú TC-A02, TC-C05**: Verdict PASS nhưng không thể confirm đúng behavior do BUG-W02-126. Cần re-run sau fix.

---

## 4. Failed Tests — Chi tiết

### 4.1 Root cause: BUG-W02-126 (blocks 15 TCs)

| Trường | Giá trị |
|---|---|
| **TC IDs** | TC-A01, A03, A04, A05, A06, B01, B02, B03, B08, B09, B13, C01, C03, C04, C06 |
| **Mức ưu tiên** | P1 (phần lớn) |
| **Boundary** | `garage-web` |
| **Linked Bug** | `BUG-W02-126` (OPEN) |
| **L2 verify** | `Tracking/WAVE02/verify/BUG-W02-126.verify.md` |
| **Evidence** | `Execution/auto/evidence/W02/insurance-settlement-TC-A0-cf59b-d-sections-stable-after-CRs-chromium/test-failed-1.png` |

**Mô tả lỗi**: Trang chi tiết phiếu quyết toán bảo hiểm (route `/settlement-voucher/{SET-BH}`) trên build 2026-06-26 03:51 UTC render với: (1) error toast "Lỗi Hệ thống / Có lỗi không mong muốn xảy ra, vui lòng truy cập sau"; (2) tất cả fields hiển thị "--"; (3) chỉ 3 tabs (thiếu "Hồ sơ bảo hiểm đã xuất"); (4) không có button "Tạo hồ sơ bảo hiểm"/"Xuất hồ sơ bảo hiểm". BFF trả `soHasInsurance=true` cho `SET-20260626-00008` — defect FE code.

**Verification history**:

| Run # | Ngày | Verdict | Bug status | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 2 | 2026-06-22 | FAIL | BUG-W02-069 filed (OPEN) | evidence/W02/... | Lần đầu phát hiện symptom |
| Run 9 | 2026-06-24 | FAIL | BUG-W02-069 → INVALID (BA quyết định false-positive infra) | evidence/W02/... | BA quyết định là false-positive infra rebuild |
| Run 10 | 2026-06-26 | FAIL | BUG-W02-126 filed (OPEN) | `evidence/W02/insurance-settlement-TC-A0-cf59b-d-sections-stable-after-CRs-chromium/test-failed-1.png` | Re-occurrence trên fresh build; xác nhận code defect thật |

**Root cause**: FE garage-web gặp runtime error khi load insurance settlement detail → error boundary triggered → conditional rendering `if (soHasInsurance)` không được reach → toàn bộ insurance UI elements không render.

### 4.2 TC-R04: Browser crash

**Mô tả lỗi**: Sau khi chạy long test suite (nhiều TC với 60s timeout), Chromium crash với NSNotificationCenter + CVDisplayLink stderr errors. TC-R04 cần SO ở state CONFIRMED để trigger popup — infra/seed limitation, không phải product bug. Không file bug mới.

**Hành động tiếp theo**: Chạy TC-R04 đầu suite trong Run 11 (trước các TC timeout dài).

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — Playwright C3 chạy live browser; code coverage của FE code không thu được từ remote stack.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | AC chưa có TC | Coverage |
|---|---|---|---|---|
| FEAT-INS-STL-CREATE | AC-1..AC-8 | AC-2,3,4,5,6,8 (TC-A01..A06) | AC-1 (trigger SO→STL), AC-7 (nav) | 75% |
| FEAT-INS-DOSSIER-CREATE | AC-1..AC-14 | AC-1,3,4,5,6,7,9,11 (TC-B01..B16) | AC-2,8,10,12,13,14 (advanced) | 57% |
| FEAT-INS-DOSSIER-VIEW | AC-1..AC-7 | AC-1,2,3,4,5,7 (TC-C01..C06) | AC-6 (pagination) | 86% |

**Oracle Coverage Gate**: 10 screens × ≥1 TC — đáp ứng planning gate. Tất cả TCs có oracle assertions hiện BLOCKED vì BUG-W02-126.

---

## 6. Performance Metrics

N/A — SLO/latency thuộc `agent-test-performance`.

---

## 7. Issues phát hiện

| # | Loại | Mức | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug | P1 | Insurance UI elements ABSENT trên trang chi tiết phiếu QT BH — build 2026-06-26 03:51 UTC | `garage-web` | BUG-W02-126 | OPEN |
| 2 | Observation | — | TC-A02, TC-C05 PASS với ambiguity do BUG-W02-126 | `garage-web` | BUG-W02-126 | Cần re-run sau fix |
| 3 | Spec gap | — | TC-R05/TC-R06 chưa có trong spec files | `Execution/auto/specs/W02/ui/` | — | Cần add trước Run 11 |
| 4 | Bug cascade | — | 16 FIX_DONE bugs không verify được do BUG-W02-126 chặn insurance UI | `garage-web` | BUG-W02-126 (blocker) | BLOCKED |

### 7.1 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| BUG-W02-069 INVALID nhưng cùng symptom tái diễn | BUGS.md BUG-W02-069 status=INVALID | Insurance UI absent trên fresh build 2026-06-26 | Re-file BUG-W02-126; đề xuất BA review quyết định INVALID của BUG-W02-069 |
| TC-R05/TC-R06 trong TC artifact nhưng thiếu trong spec file | TC-W02-PLATFORM-UI.md (status: READY) | Không có Playwright spec code | Add vào spec file cho Run 11 |

### 7.2 Handoff cập nhật registry / tracker

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W02-PLATFORM-UI | Status: BLOCKED (BUG-W02-126) | QA Authority |
| `Execution/WAVE-TRACKER.md` | W02 UI verdict | BLOCKED — BUG-W02-126 insurance UI regression | Delivery Authority |
| `Tracking/WAVE02/BUGS.md` | BUG-W02-126 | P1 OPEN → assign agent-fix-garage-web | QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | KHÔNG | 3/20 PASS (15%); ngưỡng ≥ 80% |
| Regression đạt ngưỡng active gate? | KHÔNG | TC-R01 PASS; TC-R04 FAIL (browser crash); TC-R05/R06 BLOCKED-by-harness |
| E2E Journeys đạt ngưỡng active gate? | N/A | Scope của agent-test-e2e |
| Coverage đạt ngưỡng active gate? | KHÔNG | 57-86% per feature; oracle 10 screens có TC nhưng tất cả FAIL/BLOCKED |
| Bug P0 = 0? | CÓ | Không có P0 |
| Open bugs P1 = 0? | KHÔNG | BUG-W02-126 (P1 OPEN) blocks 15 TCs |
| Tenant isolation = 0 leakage? | N/A | Scope của agent-test-isolation |
| 16 FIX_DONE bugs được verify? | KHÔNG | 0/16 verified — tất cả BLOCKED do BUG-W02-126 |

### 8.2 Quyết định

- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Wave W02 UI slice chưa đạt exit criteria: BUG-W02-126 (P1 OPEN) blocks toàn bộ insurance UI flow; 16/20 TCs FAIL; 0/16 FIX_DONE bugs được verify; TC-R05/R06 spec gap chưa resolved.

### 8.3 Ghi chú cho Run 11

1. **BUG-W02-126 là blocker cao nhất**: `agent-fix-garage-web` phải fix insurance UI rendering trước Run 11. Sau fix, re-run full 20 TCs.
2. **TC-R05/TC-R06 spec gap**: Thêm vào `Execution/auto/specs/W02/ui/insurance-settlement.spec.ts` trước Run 11. Cần settlement code có `soHasInsurance=false` riêng biệt (seed SO không chọn BH).
3. **TC-A02, TC-C05 ambiguous PASS**: Re-run sau BUG-W02-126 fix để confirm behavior thật — assert positive (BH settlement có insurance tab; KH settlement đúng không có).
4. **16 bugs FIX_DONE chưa verify**: Sẽ unblock sau BUG-W02-126 fix. Ưu tiên verify: BUG-W02-095, BUG-W02-102, BUG-W02-103, BUG-W02-074/076, BUG-W02-105.
5. **TC-R04 browser isolation**: Chạy TC-R04 đầu suite (trước các TC có 60s timeout) hoặc dùng dedicated test run với fresh browser context.
6. **Seed script cải thiện**: Cần seed có SO với `hasInsurance=false` riêng để verify TC-R05/TC-A02 unambiguously.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-22 | v1: Run 1 BLOCKED (Playwright permission) | agent-test-ui |
| 2026-06-22 | v2: Run 2 — 4 PASS, 16 FAIL; BUG-W02-069/070/071 filed | agent-test-ui |
| 2026-06-23 | v3-4: Run 3-4; BUG-W02-018 VERIFIED | agent-test-ui |
| 2026-06-23 | v5-6: Run 5-6; root blockers BUG-W02-033/043 | agent-test-ui |
| 2026-06-24 | v7-9: Run 7-9 fresh data; BUG-W02-069 BA INVALID | agent-test-ui |
| 2026-06-26 | v10: Run 10 re-verify sau fix batch 2026-06-25/26. BUG-W02-126 filed (P1 OPEN — insurance UI regression). 3 PASS, 16 FAIL, 16 bug verify BLOCKED. Verdict: BLOCKED. | agent-test-ui (Run 10) |
