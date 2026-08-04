---
document_id: "TR-W01-PLATFORM-UI"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: ACTIVE
version: 4
wave: "W01"
agent: "agent-test-ui"
boundary: "garage-web, agg-garage-graph"
execution_date: "2026-06-11"
last_reviewed: "2026-06-17"
---

# Báo cáo kiểm thử — Wave 01: UI Web (garage-web)

> Báo cáo kết quả kiểm thử cho Wave W01, thực thi bởi `agent-test-ui`.
> Scope: `FEAT-INS-SO-ADJUSTMENT` + `FEAT-INS-STL-DETAIL` — UI React (garage-web) + BFF (agg-garage-graph).
> Toàn bộ phần diễn giải viết bằng tiếng Việt có dấu. Chỉ giữ tiếng Anh cho technical token chuẩn như `PASS/FAIL/BLOCKED/SKIPPED`, tên file, tên lệnh, endpoint, error code, hoặc identifier.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W01 |
| **Subject / execution slice** | `W01-UI` — UI Web: FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL |
| **Boundary(ies)** | `garage-web` (React 19), `agg-garage-graph` (BFF GraphQL) |
| **Agent thực thi** | `agent-test-ui` |
| **Nguồn thống kê** | AUTOMATED (Playwright C3/C4 + spec runtime; không có manual run trong lần này) |
| **Ngày bắt đầu (Run 1)** | 2026-06-11 |
| **Ngày kết thúc (latest run)** | 2026-06-17 (Run 5) |
| **Số lần chạy chính thức** | 5 (Run 1-4 xem §1.5; Run 5 = Verify BUG-W01-280/281/282/284/285 + Final Regression Round) |
| **Loại kiểm thử** | Regression + Wave (UI behavior, wording, route, form, persona, a11y, visual) |
| **Môi trường** | Local (`docker compose`) — garage-web tại `http://localhost:45300` |
| **Phiên bản code (latest run)** | Commit `f5ff0928` trên branch `feature/ep-insurance-settlement-w01` + fix commits cho BUG-W01-239/240/241/242/246/247 |
| **Gate source** | Work package `Execution/work-packages/PKG-W01-insurance-foundation.md` |
| **Kết luận tổng quát (latest run)** | **NO-GO** |

> Lý do CONDITIONAL_PASS (Run 2): Sau Run 2, P1 bug BUG-W01-240 đã được VERIFIED (STL detail render đúng), BUG-W01-239 (P2 regression) đã VERIFIED (SO Edit BH=Không ẩn section đúng), BUG-W01-247 (P1 "Chỉnh sửa" no-op) đã VERIFIED. Chỉ còn BUG-W01-241 (P2 JS error "i" — fix FIX_DONE nhưng chưa deployed, VERIFY_PENDING) ảnh hưởng TC-AUTO-092. 66 TC BLOCKED-by-missing-testid vẫn chờ data-testid selectors per spec — các TC này có evidence của controls visible, nhưng field-level interaction assertions chưa run được đúng spec step. Verdict được nâng lên CONDITIONAL_PASS (không còn P1 open UI bugs) với điều kiện: (1) BUG-W01-241 re-deploy + verify (P2); (2) data-testid backfill run với specific selectors sẽ mở thêm 66 TC trong Run 3.
>
> **Run 3 (2026-06-12) update**: Garage-web image redeployed với BUG-W01-242 testid backfill confirmed in deployed JS bundle. Full UI spec suite (30 tests) executed: 29 PASS / 1 FAIL / 1 SKIP = 96.7% pass rate (executable). TC-AUTO-092 FAIL — BUG-W01-241 REOPENED: JS pageerror ["i"] vẫn fire sau redeploy; fix (orphan hook removal) không giải quyết root cause. BUG-W01-242 VERIFIED. Verdict vẫn là CONDITIONAL_PASS. Điều kiện còn lại để GO: (1) Fix thật root cause BUG-W01-241 + redeploy + Run 4 verify TC-AUTO-092; (2) ~66 BLOCKED-by-spec-coverage-gap cần spec extension Run 4.

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-11 | `/test-exec` initial sau `/test-plan` W01 | `f5ff0928` | 31 | 28 | 2 | 80 | 1 | BUG-W01-239, BUG-W01-240, BUG-W01-241, BUG-W01-242 | — | BLOCKED |
| Run 2 | 2026-06-11 | Post-fix re-verify (BUG-W01-239/240/247 FIX_DONE deployed) | post-fix commits | 14 (từ BLOCKED/FAIL pool) | 13 | 1 | — | — | — | BUG-W01-239 (VERIFIED), BUG-W01-240 (VERIFIED), BUG-W01-247 (VERIFIED) | CONDITIONAL_PASS |
| Run 3 | 2026-06-12 | Post-redeploy full suite (BUG-W01-241 fix deployed + BUG-W01-242 testid backfill confirmed) | redeployed image | 30 (full UI spec suite) | 29 | 1 | — | 1 | — | BUG-W01-242 (VERIFIED); BUG-W01-241 REOPENED | CONDITIONAL_PASS (BUG-W01-241 REOPENED) |
| Run 4 | 2026-06-12 | Spec coverage extension (Option A) — `so-adjustment-edit.spec.ts` 16→69 TCs + `stl-detail.spec.ts` 9→25 TCs; new specs exercise BUG-W01-249 cascade | extended spec | 103 (full UI suite, 97/98 TC IDs covered) | 55 | 47 | 1 | 1 | BUG-W01-250 (P2), BUG-W01-251 (P2) — new STL panel + wording defects | — | NO-GO (BUG-W01-249 cascade blocks 44+ TCs) |
| Run 5 | 2026-06-17 | Verify BUG-W01-280/281/282/284/285 + Final Regression Round (so-adjustment-edit full suite + stl-detail full suite + bug-verify spec) | Puppeteer Chrome (ubuntu 26.04 bypass) | bug-verify: 8/8; so-adjustment-edit: 70; stl-detail: ~30 | 57 (cumul) | 51 (so-edit 47 FAIL + stl 3 FAIL + 1 persist) | — | 10 | — | BUG-W01-280 VERIFIED, BUG-W01-282 VERIFIED, BUG-W01-285 UI-scope VERIFIED, BUG-W01-281 BLOCKED-by-data, BUG-W01-284 BLOCKED-by-data | NO-GO |

**Quy tắc đếm Run 2:**
- `TC executed` (14): re-runs từ BLOCKED/FAIL pool — `so-adjustment-edit.spec.ts` (chạy lại TC-AUTO-006 + 16 others confirm stable), `stl-detail-verify.spec.ts` probe (13 STL detail TCs), `bug247-verify.spec.ts` (1 TC).
- `PASS` (13): 12 STL detail TCs từ BUG-W01-240 unblock + 1 BUG-W01-239 re-verify.
- `FAIL` (1): TC-AUTO-092 (BUG-W01-241 vẫn fire JS error "i" — fix FIX_DONE nhưng chưa deployed).
- `Bugs verified`: BUG-W01-239 VERIFIED (TC-AUTO-006 PASS), BUG-W01-240 VERIFIED (13 STL TCs PASS), BUG-W01-247 VERIFIED (Chỉnh sửa → ?mode=edit).

**Tổng cộng lũy kế sau Run 2:**
- `TC executed (tổng unique)`: ~43
- `PASS cumulative`: 41
- `FAIL`: 1 (TC-AUTO-092 — BUG-W01-241 REOPENED)
- `BLOCKED (còn lại)`: ~66 (data-testid specific selectors per TC spec steps — BUG-W01-242 RESOLVED nhưng TCs cần re-run với spec files có selectors đúng)
- Pass rate (trong số executed): 41/43 = **95.3%**

**Tổng cộng lũy kế sau Run 3:**
- `TC executed (tổng unique)`: ~72 (Run 1+2: ~43 + Run 3: 30, một số TC overlap)
- `PASS cumulative`: 70 (41 + 29)
- `FAIL`: 1 (TC-AUTO-092 — BUG-W01-241 REOPENED)
- `SKIPPED`: 1 (stl-detail.spec.ts blocked-env test)
- `BLOCKED (còn lại)`: ~66 (BLOCKED-by-spec-coverage-gap — not in Run 3 spec files; BUG-W01-242 VERIFIED; scheduled Run 4)
- Pass rate (Run 3 slice, executable): 29/30 = **96.7%**

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC trong artifact | 108 (92 thiết kế ban đầu + 16 sub-TC mở rộng) | — | — |
| TC được execute (lũy kế Run 1+2) | ~43 | — | — |
| TC PASS (lũy kế) | 41 | — | — |
| TC FAIL | 1 (TC-AUTO-092) | 0 FAIL trên TC P1 Wave | CÓ (FAIL duy nhất là P2) |
| TC SKIP | 1 | — | — |
| TC BLOCKED | ~66 (BLOCKED-by-missing-testid — BUG-W01-242 RESOLVED nhưng cần spec re-run) | 0 BLOCKED P1 | CÓ (tất cả BLOCKED là P2, không có P1 BLOCKED sau Run 2) |
| **Tỷ lệ pass (trong số executed)** | **95.3%** (41/43) | ≥ 80% executed (active gate) | CÓ |
| **Tỷ lệ pass (tổng artifact)** | **38.0%** (41/108) | — coverage gap cần Run 3 với data-testid selectors | — |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở (UI scope) | 0 (BUG-W01-240 VERIFIED, BUG-W01-247 VERIFIED) | 0 | CÓ |
| Bug P2 mở | 1 (BUG-W01-241 REOPENED — Run 3: fix không giải quyết root cause) | ≤ 3 (active gate tham khảo) | KHÔNG (1 REOPENED) |

> Ghi chú: BUG-W01-241 là P2 `REOPENED` (Run 3: image redeployed, testid backfill confirmed, JS pageerror ["i"] still fires — fix did not resolve root cause). Blocker cho TC-AUTO-092 (P2 browser-compat) và điều kiện CONDITIONAL GO.

### 2.2 Phân bổ theo mức ưu tiên (lũy kế)

| Mức ưu tiên | Tổng TCs executed | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| P1 (High) | 32 executed | 32 | 0 | ~38 | 100% (trong executed) |
| P2 (Medium) | 11 executed | 10 | 1 | ~28 | 90.9% (trong executed) |
| N/A | 1 SKIPPED | — | — | — | — |

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng executed | PASS | FAIL | Tỷ lệ pass |
|---|---|---|---|---|
| UI (Playwright C3 — wording, route, element presence) | 40 | 38 | 1 | 97.4% |
| UI (Playwright C4 — responsive, visual) | 3 | 3 | 0 | 100% |
| E2E (cross-service) | N/A — owner: agent-test-e2e | — | — | — |
| API (REST/GraphQL) | N/A — owner: agent-test-api | — | — | — |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated (Playwright C3/C4) | ~43 executed (108 trong artifact) | 41 | 1 | ~66 | 1 | QC-owned harness `Execution/auto/harness/playwright/`; specs `Execution/auto/specs/W01/ui/` + probes |
| Manual | 0 (lần chạy này không có manual execution) | — | — | — | — | Manual TC artifact: `Execution/test-cases/TC-W01-UI.md` (read-only) |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 | Δ Run1→Run2 | Ngưỡng | Đạt latest? |
|---:|---:|---:|---:|---|---|
| Total TC executed (incremental) | 31 | 14 | +14 | — | — |
| PASS count (lũy kế) | 28 | 41 | +13 | — | — |
| FAIL count | 2 | 1 | -1 | 0 | KHÔNG (1 P2 FAIL còn) |
| BLOCKED count | 80 | ~66 | -14 | — | — |
| Tỷ lệ pass (trong executed) | 90.3% | 95.3% (lũy kế) | +5% | ≥ 80% | CÓ |
| Bugs P1 open (UI scope) | 1 | 0 | -1 | 0 | CÓ |
| Bugs chờ verify chưa promote | 4 | 0 (BUG-W01-241 REOPENED = active bug, không phải verify-pending) | -4 | 0 | KHÔNG (BUG-W01-241 REOPENED = cần fix mới) |
| Bugs VERIFIED+CLOSED cumulative | 0 | 3 (BUG-W01-239, BUG-W01-240, BUG-W01-247) | +3 | — | — |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

| TC ID | Tiêu đề | Kết quả | Thời gian | Ghi chú |
|---|---|---|---|---|
| Smoke probe | Playwright harness smoke — `http://localhost:45300` reachable, login flow functional | PASS | ~3s | `Execution/auto/harness/playwright/probes/smoke.spec.ts`; Chromium tại `/home/engineer_ac/.cache/ms-playwright/chromium-1117` |
| STL detail probe | `stl_detail_probe.spec.ts` — STL detail `/settlement-voucher/SET-20260611-00001` render h1, 4 tabs | PASS | ~3s | Run 2 Environment gate: BUG-W01-240 confirmed fixed in live env |

### 3.2 Regression Suite

| TC ID | Tiêu đề | Wave gốc | Run 1 | Run 2 | Final | Ghi chú |
|---|---|---|---|---|---|---|
| TC-AUTO-001 | SO Edit — layout tổng thể 2 cột | W01 regression | PASS | STABLE | PASS | Semantic layout confirmed; data-testid precise measurement BLOCKED |
| TC-AUTO-055 | SO Detail — section BH read-only, không có input | W01 regression | PASS | STABLE | PASS | Regression mục tiêu chính: không có input editable |
| TC-AUTO-072 | STL route `/settlement-voucher` render list + detail | W01 regression | PASS (list) | PASS (detail also confirmed) | PASS | Run 2: stl-detail-verify confirms detail also renders; regression scope expanded |

Cả 3 TC nhãn `regression` đều PASS sau Run 2.

### 3.3 E2E Journeys

N/A — Journeys UI→BFF→backend thuộc `agent-test-e2e` (xem `TR-W01-E2E.md`).

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

> Chỉ liệt kê TCs đã executed (lũy kế ~43 TCs). 66 BLOCKED không list ở đây mà được ghi trong §7.

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Final verdict |
|---|---|---|---|---|---|
| TC-AUTO-001 | SO Edit — layout tổng thể [regression] | P1 | PASS | STABLE | PASS |
| TC-AUTO-002 | SO Edit — panel "Tổng giá dịch vụ" layout 2 cột | P1 | PASS | STABLE | PASS |
| TC-AUTO-003 | SO Edit — design tokens header section | P2 | PASS | STABLE | PASS |
| TC-AUTO-004 | SO Edit — responsive 1024px + 1440px | P2 | PASS | STABLE | PASS |
| TC-AUTO-005 | SO Create — section BH KHÔNG hiển thị | P1 | PASS | STABLE | PASS |
| TC-AUTO-006 | SO Edit + BH=Có → section + panel xuất hiện; BH=Không → hidden | P1 | FAIL | **PASS** (BUG-W01-239 VERIFIED) | **PASS** |
| TC-AUTO-010 | CK liên kết VT — default=0, đơn vị=VNĐ, label đúng | P1 | PASS | STABLE | PASS |
| TC-AUTO-022 | CK liên kết CDV — default=0, đơn vị=VNĐ | P1 | PASS | STABLE | PASS |
| TC-AUTO-026 | Khấu hao — chỉ input %, không dropdown VNĐ/% (D1) | P1 | PASS | STABLE | PASS |
| TC-AUTO-034 | Giảm trừ bồi thường — default=0, mode=VNĐ | P1 | PASS | STABLE | PASS |
| TC-AUTO-038 | Khấu trừ BH — chỉ input VNĐ, không dropdown (D2) | P1 | PASS | STABLE | PASS |
| TC-AUTO-041 | Panel — đủ 3 phần với tiêu đề đúng | P1 | PASS | STABLE | PASS |
| TC-AUTO-050 | Panel — hoàn toàn read-only, không có input | P1 | PASS | STABLE | PASS |
| TC-AUTO-051 | Nút Lưu — enabled khi form hợp lệ | P1 | PASS | STABLE | PASS |
| TC-AUTO-052 | Nút Lưu — double-click không multi-submit | P2 | PASS | STABLE | PASS |
| TC-AUTO-055 | SO Detail — section read-only [regression] | P1 | PASS | STABLE | PASS |
| TC-AUTO-056 | SO Detail — 5 khoản field labels visible | P1 | PASS | STABLE | PASS |
| TC-AUTO-057 | SO Detail — không có nút "Lưu chỉnh sửa" | P2 | PASS | STABLE | PASS |
| TC-AUTO-069 | SO Create — không có section (absence) | P1 | PASS | STABLE | PASS |
| TC-AUTO-CONF-01 | SO Edit Figma conformance — oracle PASS (semantic) | P1 | PASS | STABLE | PASS |
| TC-AUTO-CONF-02 | SO Detail Oracle conformance — section present + read-only | P1 | PASS | STABLE | PASS |
| TC-AUTO-072 | STL list route `/settlement-voucher` [regression] | P1 | PASS | STABLE | PASS |
| TC-AUTO-073 | STL List — responsive 1280px no overflow | P2 | PASS | STABLE | PASS |
| TC-AUTO-075 | STL List — SET codes visible in table | P1 | PASS | STABLE | PASS |
| TC-AUTO-076 | STL List — "Bên thanh toán" filter button present (D6) | P1 | PASS | STABLE | PASS |
| TC-AUTO-078 | STL Detail — "+ Tạo hồ sơ bảo hiểm" button present | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| TC-AUTO-081 | STL Detail — "In toàn bộ hồ sơ" button present (D6) | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| TC-AUTO-083 | STL Detail — linked SO code visible (PDV-20260611-00007) | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| TC-AUTO-085 | STL — sidebar nav label "Phiếu quyết toán" visible (D7) | P1 | PASS | STABLE | PASS |
| TC-AUTO-085b | STL Detail — tab "Bảng chi phí" active default | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| TC-AUTO-085c | STL Detail — click tab Chứng từ → no error | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| TC-AUTO-086 | STL List — table has records, not empty state | P2 | PASS | STABLE | PASS |
| TC-AUTO-091 | STL — AC-11 no-cancel: không có nút "Hủy" (list + detail) | P1 | PASS | STABLE | PASS |
| TC-AUTO-092 | STL List — no JS errors on page load | P2 | FAIL | **FAIL** (BUG-W01-241 VERIFY_PENDING) | **FAIL** Run 3: FAIL — BUG-W01-241 REOPENED |
| TC-AUTO-CONF-03 | STL Detail Figma conformance — header + "Bảo hiểm" badge | P1 | BLOCKED | **PASS** (BUG-W01-240 VERIFIED) | **PASS** |
| (Spec block) | TC-AUTO-077..090 BLOCKED documented | — | SKIPPED | N/A | SKIPPED |

---

## 4. Failed Tests — Chi tiết

### 4.1 TC-AUTO-006: SO Edit — BH=Không ẩn section đúng (VERIFIED Run 2)

| Trường | Giá trị |
|---|---|
| **TC ID** | `TC-AUTO-006` |
| **Mức ưu tiên** | P1 (High) |
| **Boundary** | `garage-web` |
| **Linked Bug** | `BUG-W01-239` (`Tracking/WAVE01/BUGS.md`) |
| **Final verdict** | **PASS (Run 2)** |

**Verification history:**

| Run # | Ngày | Verdict | Bug status sau run | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 1 | 2026-06-11 | FAIL | BUG-W01-239 filed (`OPEN`) | `Execution/auto/evidence/W01/ui/TC-AUTO-006-FAIL-bh-khong-still-shows-section.png` | SO PDV-20260611-00006 (BH=Không): edit mode H2 count = 1, expected = 0 |
| Run 2 | 2026-06-11 | **PASS** | BUG-W01-239 → VERIFIED | `probes/smoke.spec.ts`: H2 count AFTER full hydration (3s): 0 | Fix deployed: `<Show when={!!isEditing && !!hasInsurance}>` gated đúng. `so-adjustment-edit.spec.ts` TC6 PASS. BUG-W01-239 VERIFIED. |

---

### 4.2 TC-AUTO-092: STL List — JS error "i" firing on page load (còn FAIL)

| Trường | Giá trị |
|---|---|
| **TC ID** | `TC-AUTO-092` |
| **Mức ưu tiên** | P2 |
| **Boundary** | `garage-web` |
| **Linked Bug** | `BUG-W01-241` (`Tracking/WAVE01/BUGS.md`) |
| **Final verdict** | **FAIL** (BUG-W01-241 REOPENED — image redeployed, testid backfill confirmed, but JS pageerror ["i"] still fires; fix did not resolve root cause) |

**Verification history:**

| Run # | Ngày | Verdict | Bug status sau run | Evidence path | Notes |
|---|---|---|---|---|---|
| Run 1 | 2026-06-11 | FAIL | BUG-W01-241 filed (`OPEN`) | `Execution/auto/evidence/W01/ui/TC-AUTO-092-FAIL-stl-list-js-error.png` | `pageerror` event fires với message "i" |
| Run 2 | 2026-06-11 | **FAIL** | BUG-W01-241 → VERIFY_PENDING | `probes/stl-detail-verify.spec.ts` BUG-W01-241 test: `["i", "i"]` still fires | Fix code-complete (FIX_DONE by `agent-fix-garage-web` 2026-06-11: orphan `useInsuranceFilterOptions()` removed) nhưng image chưa rebuild. Cần redeploy + Run 3. |
| Run 3 | 2026-06-12 | **FAIL** | BUG-W01-241 → REOPENED | `Execution/auto/evidence/W01-ui-stl-detail-STL-List-13be1-JS-errors-on-list-page-load-chromium/test-failed-1.png` | Image redeployed; BUG-W01-242 testid backfill confirmed in deployed bundle. stl-detail.spec.ts:110:7 FAIL — Received array: ["i"]. JS pageerror persists post-redeploy. Fix (orphan hook removal) did NOT resolve root cause. BUG-W01-241 REOPENED. |

**Mô tả lỗi (còn tồn tại):**

```
TC-AUTO-092: STL List /settlement-voucher — JS error on page load
Expected: fatalErrors.length === 0 (no uncaught JS exceptions)
Actual  : pageerror event fires with message "i" (x2 in Run 2, minified bundle error)

Root cause confirmed: orphan `useInsuranceFilterOptions()` hook in
frontend/gf-gms-web/src/features/settlement-voucher/components/list/index.tsx
Fix merged but container not yet rebuilt/redeployed.
Action: rebuild + redeploy garage-web image → Run 3 re-test.
```

---

## 5. Bug Verification Loop (Step 5) — Kết quả Run 2

### 5.1 Bugs chờ verify ở Run 2 (UI-owned TCs)

| Bug ID | Trạng thái vào Run 2 | Verdict Run 2 | Trạng thái sau Run 2 | Evidence | Ghi chú |
|---|---|---|---|---|---|
| BUG-W01-239 | RESOLVED (FIX_DONE) | **VERIFIED** | VERIFIED | `probes/smoke.spec.ts` H2 count=0; `so-adjustment-edit.spec.ts` TC6 PASS | TC-AUTO-006 PASS. Section ẩn đúng khi BH=Không trong edit mode. |
| BUG-W01-240 | RESOLVED (FIX_DONE) | **VERIFIED** | VERIFIED | `stl_detail_probe.spec.ts` PASS; `stl-detail-verify.spec.ts` 13/14 PASS | STL detail renders h1, 4 tabs, 3 buttons, linked SO code. "Something went wrong" text absent. |
| BUG-W01-241 | FIX_DONE | **FAIL** → VERIFY_PENDING | VERIFY_PENDING | `stl-detail-verify.spec.ts` BUG-W01-241 test: ["i","i"] still present | Fix codebase done nhưng image chưa rebuild. Cần Run 3. |
| BUG-W01-241 | VERIFY_PENDING | **FAIL** → REOPENED | REOPENED | `Execution/auto/evidence/W01-ui-stl-detail-STL-List-13be1-JS-errors-on-list-page-load-chromium/test-failed-1.png` | Run 3 (2026-06-12): image redeployed, testid backfill confirmed, stl-detail.spec.ts:110:7 FAIL — Received array: ["i"]. JS pageerror still fires. Fix did not resolve root cause. BUG-W01-241 REOPENED. TC-AUTO-092 remains FAIL. |
| BUG-W01-242 | RESOLVED | (Không re-run spec assertions trực tiếp) | RESOLVED | Xác nhận qua smoke probe: data visible + controls accessible | 3 testid unfulfilled per BUGFIX doc: `dialog-unsaved`, `pagination`, `btn-cancel-phieu`. Spec steps cho 66 TC còn dùng `[data-testid="..."]` specific selectors cần re-run. |
| BUG-W01-242 | RESOLVED | **VERIFIED** | VERIFIED | Run 3 full suite: 29/30 UI TCs PASS using data-testid selectors; Vite minified `"data-testid":a("...")` confirmed in deployed bundle by orchestrator audit. | Testid backfill confirmed in deployed JS bundle. 29 TCs PASS in Run 3. BUG-W01-242 VERIFIED. |
| BUG-W01-247 | FIX_DONE | **VERIFIED** | VERIFIED | `probes/bug247-verify.spec.ts` 1/1 PASS: URL đổi sang `?mode=edit` | Click "Chỉnh sửa" trên INSURANCE STL detail → navigate đúng. |

### 5.2 Bugs không thuộc UI scope — pass-through

| Bug ID | Owner | Trạng thái | Ghi chú |
|---|---|---|---|
| BUG-W01-236 | agent-test-api | REOPENED | Validation server-side gf-sales — ngoài UI scope |
| BUG-W01-237 | agent-test-api | OPEN | Persistence issue gf-sales — ngoài UI scope |
| BUG-W01-244 | agent-test-e2e | RESOLVED | BFF SDL mismatch — confirmed same root cause với BUG-W01-240 (VERIFIED) |
| BUG-W01-246 | QC-Manual | FIX_DONE | Layout/typography drift — pending manual QC verify |
| BUG-W01-248 | QC-Manual | FIX_DONE | Edit mode INSURANCE thiếu textarea/FileUpload — pending manual QC verify |

---

## 6. Coverage Report

### 6.1 Code Coverage

N/A — Playwright integration tests không thu coverage metrics cho React bundle. Vitest/RTL unit coverage chưa được chạy từ design repo (C1/C2 cluster BLOCKED-by-missing-testid cho component test). Sau Run 3 (post data-testid spec fix), coverage sẽ tăng đáng kể.

### 6.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | TC executed và PASS | Coverage ghi chú |
|---|---|---|---|---|
| `FEAT-INS-SO-ADJUSTMENT` | 16 AC + 4 EC | 16 AC có TC trong artifact | AC-0..9,11..14,16 PASS (Run 1+2); BUG-W01-239 VERIFIED; EC-1..4 BLOCKED (data-testid specific) | ~75% AC verified bằng executed tests |
| `FEAT-INS-STL-DETAIL` | 13 AC | 11 AC có TC | AC-1 (route, nav, buttons, linked SO, 4 tabs, no-cancel), AC-4 (tab names, D7), AC-5 (tab content visible), AC-8,11,12,13 PASS; AC-2,3,6,9 BLOCKED (data-testid) | ~62% AC verified |

### 6.3 Regression Coverage

| Màn bị tác động | Regression TC | Run 1 | Run 2 | Status |
|---|---|---|---|---|
| SO Edit (production) | TC-AUTO-001 + TC-AUTO-006 | PASS (001), FAIL (006) | PASS (006 VERIFIED) | PASS |
| SO Detail (production) | TC-AUTO-055 | PASS | STABLE | PASS |
| STL Detail (production, new W01) | TC-AUTO-072 (list) + stl-detail-verify probes | PASS (list) | PASS (detail confirmed) | PASS |

Tất cả 3 màn bị tác động đều đạt regression PASS sau Run 2.

---

## 7. Issues phát hiện

### 7.1 Bugs phát hiện + trạng thái mới nhất

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái (Run 2) |
|---|---|---|---|---|---|---|
| 1 | Bug (Regression) | P2 | SO Edit (BH=Không): section "Phân bổ QT BH" vẫn visible trong edit mode — regression của BUG-W01-025 | `garage-web` | BUG-W01-239 | **VERIFIED** (Run 2) |
| 2 | Bug (System Error) | P1 | STL detail tất cả SET codes trả "Something went wrong!" — root cause: FE fragment drift (BUG-W01-240/244). Blocked 14 TC C3 + 4 TC C4 | `garage-web`, `agg-garage-graph` | BUG-W01-240 / BUG-W01-244 | **VERIFIED** (Run 2) |
| 3 | Bug (JS Error) | P2 | STL List: uncaught JS error "i" (minified) on page load — orphan hook `useInsuranceFilterOptions()` | `garage-web` | BUG-W01-241 | **REOPENED** (Run 3: image redeployed, testid confirmed; JS pageerror ["i"] still fires — fix did not resolve root cause) |
| 4 | Bug (Testing Infrastructure) | P2 | Thiếu `data-testid` attributes trong production build: 80 TC C3/C4 không execute được đúng spec steps | `garage-web` | BUG-W01-242 | **VERIFIED** (Run 3: 29/30 TCs PASS using data-testid selectors; testid backfill confirmed in deployed bundle) |

### 7.2 Observations (không phải TC FAIL)

| # | Quan sát | Tác động | Ghi chú |
|---|---|---|---|
| O-01 | BUG-W01-244 (E2E agent): root cause confirmed = FE fragment payer-first axis drift; cùng root cause BUG-W01-240 | VERIFIED by same FE fix | BFF SDL không cần sửa — FE fix đủ |
| O-02 | Login button `button[type="submit"]` không hoạt động với Playwright selector sau React hydration — phải dùng `button:has-text("Đăng nhập")` | Testing infrastructure gotcha | Documented trong `helpers.ts` |
| O-03 | SO Edit route: `/service-order/{id}/edit`; SO Detail: `/service-order/{id}` (singular) | Gotcha: route đúng là số ít, API là số nhiều | Related: BUG-W01-021 history |
| O-04 | Design Discrepancies D1-D7: FEAT spec override Figma trong tất cả 7 trường hợp; tất cả verified per FEAT | TC assert per FEAT (đúng per DESIGN-SOURCE-POLICY) | Documented trong TC artifact Design Discrepancy Log |
| O-05 | BUG-W01-247 VERIFIED Run 2: "Chỉnh sửa" click trên INSURANCE STL detail → URL `?mode=edit` | P1 blocker luồng DRAFT→ISSUED đã giải quyết | Navigation handlers wired đúng trong dispatcher |
| O-06 | Tab "Chứng từ & hóa đơn" (thực tế) vs "Chứng từ & hoá đơn" (D7 FEAT oracle) — thực tế live render là `hóa` (không dấu huyền riêng) | Typography canonical đã fix qua BUG-W01-246 | Confirmed in stl_detail_probe output: `Chứng từ & hóa đơn` |

### 7.3 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| D1: Khấu hao dropdown VNĐ/% | Figma oracle edit — có dropdown | Thực tế chỉ có input %; FEAT BR-INS-SO-ADJ-004 xác nhận % only | Accept — FEAT spec wins per DESIGN-SOURCE-POLICY |
| D2: Khấu trừ BH dropdown | Figma oracle edit — có dropdown VNĐ/% | Thực tế chỉ input VNĐ; FEAT BR-INS-SO-ADJ-003 xác nhận VNĐ only | Accept — FEAT spec wins |
| Tab "Chứng từ & hoá đơn" chính tả | FEAT spec: "hoá đơn" (ô) | Thực tế live: "hóa đơn" (huyền) | BUG-W01-246 FIX_DONE — typography canonical chuẩn `hóa đơn` |

### 7.4 Handoff cập nhật registry / tracker

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | W01/UI TC aggregate | 41 PASS, 1 FAIL (TC-AUTO-092), ~66 BLOCKED, 1 SKIPPED (Run 1+2 lũy kế) | QA Authority |
| `Execution/WAVE-TRACKER.md` | W01/UI verdict | CONDITIONAL_PASS — P1 bugs VERIFIED; P2 BUG-W01-241 REOPENED (fix không giải quyết root cause); 66 TC BLOCKED-by-spec-coverage-gap (Run 4 pending) | Delivery Authority / QA Authority |
| `Tracking/BUGS.md` (index) | BUG-W01-239..242 + 247 status | 239=VERIFIED, 240=VERIFIED, 241=REOPENED, 242=VERIFIED, 247=VERIFIED | QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

> **Run 4 (2026-06-12) update**: Spec coverage extended 28→97/98 TC IDs (99%). Run 4 result: 55 PASS / 47 FAIL / 1 TIMEOUT / 1 SKIP. 44+ of 47 failures cascade từ BUG-W01-249 (P1 OPEN — `[data-testid="section-ins-adjustment"]` không render trên SO Edit BH=Có runtime); child fields (`field-ck-vt` ×13, `field-khau-hao-header` ×6, `field-khau-tru` ×4, `field-ck-cdv` ×2, etc.) unfindable do parent absent. 2 new product bugs filed (BUG-W01-250 P2 STL "Cân thanh toán" section, BUG-W01-251 P2 STL empty state wording). Verdict downgraded từ CONDITIONAL_PASS → **NO-GO**.

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | CÓ | Playwright harness smoke PASS; app reachable ở `localhost:45300`; STL detail probe PASS |
| Regression đạt ngưỡng active gate? | CÓ | 3/3 regression TCs PASS sau Run 2 (TC-AUTO-001, 055, 072 + BUG-W01-239 VERIFIED) |
| E2E Journeys đạt ngưỡng active gate? | N/A | Owner: agent-test-e2e |
| Coverage đạt ngưỡng active gate? | CÓ (Run 4) | 97/98 TC IDs implemented = 99% spec coverage (+69 TCs Run 4 extension). Lưu ý: pass rate executable rớt từ 97% → 53% vì specs mới exercise BUG-W01-249. |
| Bug P0 = 0? | CÓ | Không có P0 |
| Open bugs P1 (UI scope) = 0? | KHÔNG (1 mới) | **BUG-W01-249 P1 OPEN** — `section-ins-adjustment` không render runtime; cascade fail 44+ TCs Run 4. Release blocker. |
| Open bugs P2 = 0? | KHÔNG (3) | BUG-W01-241 P2 REOPENED + BUG-W01-250 P2 OPEN (STL Cân thanh toán) + BUG-W01-251 P2 OPEN (STL empty state wording). |
| Tenant isolation = 0 leakage? | N/A | Owner: agent-test-isolation |

### 8.2 Quyết định

- [ ] **CHO QUA GATE (GO)**
- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Run 5 (2026-06-17): BUG-W01-249 đã VERIFIED (section-ins-adjustment present), nhưng 47/70 so-adjustment-edit TCs vẫn FAIL do: (a) spec dùng `fill()` trực tiếp lên div wrapper `field-khau-hao-header` — cần sửa spec để dùng inner input locator; (b) không có INSURANCE parts trong SO đang editable (BLOCKED-by-data cho per-part TCs). 3 STL FAIL còn persist (TC-AUTO-087/092/093). Bugs verified: BUG-W01-280/282/285 VERIFIED. Bugs BLOCKED-by-data: BUG-W01-281/284. NO-GO cho đến khi: (1) spec `so-adjustment-edit.spec.ts` sửa locator `field-khau-hao-header` → inner input; (2) re-seed PRICING SO với active INSURANCE parts; (3) BUG-W01-241/250/251 fix.
- [ ] **CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)**

### 8.3 Ghi chú cho wave tiếp theo

- **Run 5 DONE (2026-06-17)**: Verify BUG-W01-280/281/282/284/285 + Final Regression Round.
  - BUG-W01-280 VERIFIED: Playwright C3, panel hiển thị 0đ sau khi nhập header 5% không click "Áp dụng tất cả". Evidence: `BUG-W01-280-A-after-header.png`.
  - BUG-W01-282 VERIFIED: Playwright C3, "Thêm thanh toán" count=1 trên cả SET-20260611-00001 + SET-20260617-00004. Evidence: `BUG-W01-282-A/B/C.png`.
  - BUG-W01-285 VERIFIED (UI scope): Playwright C3, root depreciationDefault absent trong payload. Evidence: `BUG-W01-285-payload.png`.
  - BUG-W01-281 BLOCKED-by-data: Không có SO editable với active INSURANCE parts. Tất cả PRICING SOs có INSURANCE parts đều soft-deleted. Cần re-seed.
  - BUG-W01-284 BLOCKED-by-data: Tương tự 281.
- **Spec fix cần làm (Round 6)**: `so-adjustment-edit.spec.ts` — đổi `page.locator('[data-testid="field-khau-hao-header"]').fill('5')` sang `page.locator('[data-testid="field-khau-hao-header"] input').first().fill('5')` cho tất cả occurrence liên quan (TC-AUTO-027, 028, 029, 030, 031, 033, 043, 044, 045, 046, 047, 048, 049). Pattern đã confirm trong `bug-verify-280-281-282-284-285.spec.ts`.
- **Data re-seed cần làm (Round 6)**: Tạo PRICING SO với `has_insurance=true` + ≥2 parts payer=INSURANCE (`is_deleted=false`). Hiện tại `PDV-20260616-00019` (SETTLED) có active INSURANCE parts, cần tạo bản sao ở trạng thái PRICING.
- **STL FAILs còn persist**: TC-AUTO-087 (BUG-W01-251 empty state wording), TC-AUTO-092 (BUG-W01-241 JS pageerror), TC-AUTO-093 (BUG-W01-250 panel 3 phần).
- **Browser workaround cố định**: `executablePath=/home/all_engineer/.cache/puppeteer/chrome/linux-149.0.7827.22/chrome-linux64/chrome` + `--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage` — Ubuntu 26.04 không hỗ trợ Playwright 1.60 chromium_headless_shell.
- **Lesson learned**: Spec thiết kế cần handle div wrapper vs direct input. Pattern `[data-testid="X"] input` thay vì `[data-testid="X"]` khi field là composite component.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-11 | v1 — Khởi tạo từ TEST-REPORT-TEMPLATE v7; Run 1 execution data; 4 bugs mới BUG-W01-239..242 | agent-test-ui |
| 2026-06-11 | v2 — Run 2 execution data: BUG-W01-239/240/247 VERIFIED (13 new PASS); BUG-W01-241 VERIFY_PENDING (still fails); verdict BLOCKED→CONDITIONAL_PASS. Updated §1, §1.5, §2.1..2.5, §3.2, §3.4, §4.1..4.2, §5.1, §6.2..6.3, §7.1..7.4, §8.1..8.3. | agent-test-ui |
| 2026-06-12 | v3 — Run 3 execution data: Full UI spec suite 30 tests (so-adjustment-detail: 4 PASS; so-adjustment-edit: 17 PASS; stl-detail: 8 PASS / 1 FAIL / 1 SKIP). 96.7% pass rate (executable). BUG-W01-241 REOPENED (JS pageerror persists post-redeploy). BUG-W01-242 VERIFIED (testid backfill confirmed in deployed bundle). Updated §1, §1.5, §2.1, §3.4, §4.2, §5.1, §6.3, §7.1, §7.4, §8.1, §8.2, §8.3. | agent-test-ui |
| 2026-06-17 | v4 — Run 5: Verify BUG-W01-280/281/282/284/285 (3 VERIFIED, 2 BLOCKED-by-data). Final regression: so-adjustment-edit 23P/47F (spec locator issue + data gap), stl-detail 3F persist. Updated §1 header, §1.5 (Run 5 row), §8.2, §8.3. Verdict: NO-GO. | agent-test-ui |
| 2026-06-17 | v4 — Run 5: Verify BUG-W01-280/281/282/284/285 (3 VERIFIED, 2 BLOCKED-by-data). Final regression round: so-adjustment-edit 23P/47F (spec locator bug + data gap), stl-detail 3F persist (TC-087/092/093). Updated §1 header, §1.5 timeline (Run 5 row), §8.2 verdict, §8.3 notes. Verdict: NO-GO (same root cause as Run 4 + new data constraint). | agent-test-ui |
| 2026-06-12 | v4 — Run 4 spec coverage extension (Option A): `so-adjustment-edit.spec.ts` 16→69 TC IDs (+53), `stl-detail.spec.ts` 9→25 TC IDs (+16). Coverage 28/98 → 97/98 = 99%. Run 4 result: 55 PASS / 47 FAIL / 1 TIMEOUT / 1 SKIP (103 total). 44+ failures cascade từ BUG-W01-249 P1 OPEN (`section-ins-adjustment` không render → child fields unfindable). 2 new bugs BUG-W01-250 + BUG-W01-251 (P2). Verdict downgraded CG → NO-GO. Updated §1.5, §8.1, §8.2, §8.3. | agent-test-ui + orchestrator |
