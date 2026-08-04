---
document_id: "TR-W02-E2E"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: BLOCKED
version: 6
wave: "W02"
agent: "agent-test-e2e"
boundary: "garage-web, gf-accounting, gf-sales, agg-garage-graph"
execution_date: "2026-06-22"
last_reviewed: "2026-06-26"
---

# Báo cáo kiểm thử — Wave W02: Settlement Adjustments + Insurance Dossier E2E

> Báo cáo kết quả kiểm thử W02 E2E, thực thi bởi `agent-test-e2e`.
> Execution slice: Web E2E (Playwright live browser) — Phase A (Settlement Create + CR Adjustments) + Phase B (Insurance Dossier) + Regression (REG-01..REG-10).
> **Toàn bộ phần diễn giải cho người đọc viết bằng tiếng Việt có dấu. Chỉ giữ tiếng Anh cho technical token chuẩn.**

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W02 |
| **Subject / execution slice** | `Settlement Adjustments + Insurance Dossier — E2E Web (Playwright)` |
| **Boundary(ies)** | `garage-web · gf-accounting · gf-sales · agg-garage-graph` |
| **Agent thực thi** | `agent-test-e2e` |
| **Nguồn thống kê** | AUTOMATED |
| **Ngày bắt đầu (Run 1)** | 2026-06-22 |
| **Ngày kết thúc (latest run)** | 2026-06-24 |
| **Số lần chạy chính thức** | 9 (Run 1 = BLOCKED; Run 2 = FAIL — 29F/0P/1S; Run 3 = FAIL — 26F/3P/1S; Run 4 = BLOCKED — infra down; Run 5-8 = other agents; Run 9 = FAIL — 29F/0P/0B/1S fresh data 2026-06-24) |
| **Loại kiểm thử** | E2E / Regression |
| **Môi trường** | Local (`docker compose`) |
| **Phiên bản code (latest run)** | Commit `6de80dda` trên branch `feature/ep-insurance-settlement-w02` |
| **Gate source** | Work package `Execution/work-packages/PKG-W02-insurance-dossier.md` + `Plan/README.md §4` |
| **Kết luận tổng quát (latest run)** | **FAIL** (Run 9 — 0 PASS / 29 FAIL / 0 BLOCKED / 1 SKIP; fresh data 2026-06-24; REGRESSION: A03/A04/REG-03 PASS→FAIL; BUG-W02-069 new) |

**Lý do FAIL (Run 9 — 2026-06-24 — latest)**: Playwright live browser thực thi đủ 30 TCs via QC-owned harness + remote stack `http://192.168.110.191:45300` (BASE_URL env). FRESH DATA 2026-06-24: settlement codes SET-20260624-00001 (CUSTOMER) / SET-20260624-00002 (INSURANCE) / SET-20260624-00003. SSO proxy intercept trong `loginAs()` route `localhost:45410` → `192.168.110.191:45410`. Kết quả: **0 PASS / 29 FAIL / 1 SKIP** (REG-02 SKIP — conditional không thay đổi). **CRITICAL REGRESSION**: A03 / A04 / REG-03 đã PASS ở Run 3 với old codes → FAIL ở Run 9 với fresh codes. Root cause regression: BUG-W02-033 (`getSettlementByCode` BFF resolver) scope mở rộng — fresh-dated settlement codes SET-20260624-00001/00002/00003 bị ảnh hưởng (Run 3 chỉ cũ mã cũ). Settlement detail page render 3 tab đúng nhưng all amount fields `--`/`0đ`; "Phân bổ Bảo hiểm" section không visible; "In phiếu" button timeout 264ms. Filed BUG-W02-069 (P1 OPEN — regression). BUG-W02-043 (P1 OPEN) tiếp tục block Phase B (B01..B11) — "Hồ sơ bảo hiểm" tab absent. Seed gap vẫn: không có SO COMPLETED/CONFIRMED với has_insurance=true → blocks A01/A05/A06/A09/REG-01/REG-07/REG-08/REG-09/REG-10. SEED_SO_BH_CODE env var không được truyền vào run command → A01 dùng default `PDV-PROBE-REQUIRED`. Lesson TL-W02-E2E-008 (SSO URL proxy) logged.

**Lý do BLOCKED (Run 4 — 2026-06-23)**: Environment Readiness Gate FAILED (Step 0c) — Garage application stack NOT running. Tất cả ports unreachable sau 2 retries: localhost:45300 (garage-web) + localhost:45310 (alt port) + localhost:45401 (agg-garage-graph). Root cause: không có pre-built Docker images cho Garage app services; source code nằm trong repo `garage-functions/` riêng biệt, không build được từ design repo. `docker compose up -d` trong `infra/` chỉ khởi động kafka, redis, kafka-ui (base infra) — app services cần source code build trước. NODE_PATH fix phát hiện: spec files ở sibling directory của harness node_modules (macOS arm64) — `Cannot find module @playwright/test`; fix: `NODE_PATH="./node_modules" npx playwright test`. Lesson TL-W02-E2E-007 logged. Theo Step 0c agent contract: 30/30 TCs BLOCKED; verdict = BLOCKED.

**Lý do FAIL (Run 3 — 2026-06-23 — latest)**: Playwright live browser thực thi đủ 30 TCs. Kết quả: **3 PASS / 26 FAIL / 1 SKIP**. PASS: TC-W02-E2E-A03 (template in BH 5 khoản monetary), TC-W02-E2E-A04 (template in KH 3 khoản monetary), TC-W02-E2E-REG-03 (In phiếu QT BH print preview). Bug verification: BUG-W02-005 VERIFIED (A03+A04 PASS), BUG-W02-006 VERIFIED (REG-03 PASS). Root causes failures: (1) **BUG-W02-033 (P1 OPEN)** — typename drift cascade: SO detail page không render panel BH → Tạo QT button không visible → Phase A (A01/A02/A05/A06/A07/A09) FAIL; SO detail cũng block REG-01/05/06/07/08/09/10; (2) **Seed code drift** — SEED_SO_BH_CODE `PDV-20260622-00012` đã có settlements (đúng seed: `PDV-20260622-00010`); (3) **Spec selector drift** — A08 button text `Tạo quyết toán` vs spec `/tạo phiếu quyết toán/i`; REG-04 strict mode violation `getByText('Bảo hiểm thanh toán')` resolve 2 elements; (4) **Seed gap** — không có SO CONFIRMED với BH → REG-07/09/10 fail ở SO state; (5) **BUG-W02-043 (P1 OPEN)** cascade — dossier button không render trên settlement detail → Phase B (B01..B11) FAIL.

**Lý do FAIL (Run 2 — 2026-06-22)**: Playwright chạy đủ 30 TCs (permissions unblocked). 29/30 TC FAIL, 1 SKIP. Root cause chính: **BUG-W02-033 (P1)** — BFF `getServiceOrderByCode` typename drift → SO detail page crash → UI element BH không visible. 1 SKIP = conditional skip SO Edit CTA không visible. Harness: `pw-w02-e2e.config.ts` (testDir `specs/W02/e2e/`); Chromium `/home/engineer_ac/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`.

**Lý do BLOCKED (Run 1)**: Lệnh `npx playwright test` bị từ chối bởi `.claude/settings.json` permission gate — lệnh này không nằm trong `allow` list và bị denied tại runtime. Browser binary VÀ harness đều sẵn sàng (smoke probe lần đầu confirm browser launch + app load), nhưng sau khi smoke probe chạy, mọi lệnh `npx playwright test -c playwright.config.ts` targeting W02 spec directory đều bị block. Không phải `BLOCKED-by-harness` (harness và browser hoạt động) mà là `BLOCKED-by-permission-gate`. Theo agent contract: "Nếu bất kỳ journey in-scope nào không chạy được vì thiếu Playwright/browser/live runtime, `Kết luận tổng quát` của execution slice E2E phải là `BLOCKED`." — điều kiện này áp dụng vì execution command bị gate.

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-22 | `/test-exec` initial sau `/test-plan` | `6de80dda` | 0 | 0 | 0 | 30 | 0 | — | — | BLOCKED |
| Run 2 | 2026-06-22 | Re-run sau permission fix (orchestrator inline) | `6de80dda` | 30 | 0 | 29 | 0 | 1 | — (mọi failure do existing P1 bugs đã filed) | — | FAIL |
| Run 3 | 2026-06-23 | Re-run sau DEV fix cycle (BUG-W02-005/006 fix) | `6de80dda` | 30 | 3 | 26 | 0 | 1 | BUG-W02-049 (seed drift), BUG-W02-050 (selector) | BUG-W02-005 (A03+A04), BUG-W02-006 (REG-03) | FAIL |
| Run 4 | 2026-06-23 | Fresh data mandate + spec fix (PDV-20260623-00014) | `6de80dda` | 0 | 0 | 0 | 30 | 0 | — | — | BLOCKED |
| Run 9 | 2026-06-24 | Re-run fresh data 2026-06-24 + SSO proxy intercept | HEAD | 30 | 0 | 29 | 0 | 1 | BUG-W02-069 (regression A03/A04/REG-03 PASS→FAIL) | — (BUG-W02-005/006 verification DEFERRED — settlement detail data empty on fresh codes) | FAIL |

**Lưu ý Run 1**: TC executed = 0 vì permission gate chặn toàn bộ `npx playwright test` invocation. Smoke probe kỹ thuật (smoke.config.ts → probes/smoke.spec.ts) đã chạy thành công trước khi permission gate active — xác nhận browser launch + app load — nhưng đây là infrastructure preflight, KHÔNG phải TC E2E sản phẩm và KHÔNG tính vào `TC executed`. Theo agent contract: KHÔNG dùng code-inspection fallback; TC chỉ PASS khi Playwright live browser verify đủ 4 lớp checkpoint.

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 30 | — | — |
| TC PASS | 0 (A03/A04/REG-03 PASS in Run 3 → FAIL in Run 9) | — | — |
| TC FAIL | 29 | — | — |
| TC SKIP | 1 (REG-02 conditional skip — unchanged) | — | — |
| TC BLOCKED | 0 | 0 | OK |
| **Tỷ lệ pass** | 0% (0/30) | ≥80% | KHÔNG |
| Bug P0 mở | 0 (BUG-W02-024/025/026 FIX_DONE; BUG-W02-027 OPEN nhưng mobile scope) | 0 | PENDING (mobile) |
| Bug P1 mở (web-cascade) | 2 (BUG-W02-033 typename drift, BUG-W02-043 schema drift) | 0 | KHÔNG |
| Bug P1 mở (mobile/api) | nhiều (BUG-W02-020/022/028/029/030) | 0 | NON-BLOCKING for web |
| Bug FIX_DONE chờ verify | ~14 (BUG-W02-005/006 verification DEFERRED — fresh code regression; còn lại) | 0 | KHÔNG |

> Số liệu bug open đọc từ `Tracking/WAVE02/BUGS.md` (per-wave file, theo bài học TL-W01-ALL-001). Bugs FIX_DONE = ~12 (nhiều bugs đã promote lên VERIFIED hoặc có trạng thái mới sau Run 9). BUG-W02-069 NEW P1 OPEN — regression filed Run 9.

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|---|
| Critical (P0 features) | 10 | 0 | 10 | 0 | 0% |
| High (P1 features) | 13 | 3 | 10 | 0 | 23% (3/13: A03-P1, A04-P1, REG-03-P1) |
| Medium (P2 features) | 7 | 0 | 7 | 0 | 0% |
| Low | 0 | 0 | 0 | 0 | — |

> Phân bổ P0/P1/P2 theo Priority của từng TC trong `TC-W02-E2E.md §4`. Phase A (P1): A01/A02/A03/A04/A05/A07/A08 (7 TC); Phase A (P2): A06/A09 (2 TC); Phase B (P1): B01/B02/B03/B07/B08/B09 (6 TC); Phase B (P2): B04/B05/B06/B10/B11 (5 TC); Regression (P1): REG-01/02/03/04/REG-06/07/08/09/10 (9 TC); Regression (P2): REG-05 (1 TC). Tổng 30 (28 original + REG-06/10 co-located regression delta appended 2026-06-22).

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| E2E (cross-service, Playwright) | 30 | 3 | 26 | 0 | 10% |
| API (REST) | N/A | — | — | — | — |
| API (GraphQL) | N/A | — | — | — | — |
| UI (isolated) | N/A | — | — | — | — |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated (Playwright) | 30 | 3 | 26 | 0 | 1 | `Execution/automated-test-cases/TC-W02-E2E.md` — Run 3 2026-06-23 live browser |
| Manual | — | — | — | — | — | Manual TC-W02-E2E.md là reference; không có manual run trong slice này |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 | Run 3 | Run 4 | Run 9 | Δ R3→R9 | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---:|---|---|
| Total TC executed | 0 | 30 | 30 | 0 | 30 | 0 vs R3 | 30 | OK |
| PASS count | 0 | 0 | 3 | 0 | 0 | -3 vs R3 (REGRESSION) | ≥24 (80%) | KHÔNG |
| FAIL count | 0 | 29 | 26 | 0 | 29 | +3 vs R3 (regression A03/A04/REG-03) | 0 | KHÔNG |
| BLOCKED count | 30 | 0 | 0 | 30 | 0 | -30 vs R4 | 0 | OK (R9) |
| Tỷ lệ pass | 0% | 0% | 10% | 0% | 0% | -10pp vs R3 (REGRESSION) | ≥80% | KHÔNG |
| Bugs P1 open (web blocker) | — | 2 | 2 | 2 | 3 (+BUG-W02-069) | +1 | 0 | KHÔNG |
| Bugs chờ verify (FIX_DONE) | 19 | — | ~14 | ~14 | ~12 | ~0 | 0 | KHÔNG |
| Bugs VERIFIED cumulative | 0 | 4 | 6 | 6 | 6 (unchanged; BUG-W02-005/006 DEFERRED) | 0 | — | — |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite (Run 3 — 2026-06-23)

| TC ID | Tiêu đề | Run 3 | Ghi chú |
|---|---|---|---|
| TC-W02-E2E-A01 | Kế toán mở màn Tạo phiếu QT từ SO có BH — Panel hiển thị đầy đủ 3 khối | FAIL | BUG-W02-033 cascade + seed drift (PDV-20260622-00012 already SETTLED) |
| TC-W02-E2E-A02 | Số liệu BH nhất quán từ panel Tạo QT → Chi tiết phiếu QT BH | FAIL | BUG-W02-033 cascade |
| TC-W02-E2E-A03 | Số liệu nhất quán Chi tiết QT BH → Template in (5 khoản dấu −) | **PASS** (R3) → **FAIL** (R9) | R3: BUG-W02-005 fix VERIFIED; R9: REGRESSION — settlement detail empty on fresh code, BUG-W02-069 |
| TC-W02-E2E-A04 | Số liệu nhất quán Chi tiết QT KH → Template in (3 khoản dấu +) | **PASS** (R3) → **FAIL** (R9) | R3: BUG-W02-005 fix VERIFIED; R9: REGRESSION — settlement detail empty on fresh code, BUG-W02-069 |
| TC-W02-E2E-A05 | Luồng BH âm: Kế toán thấy cảnh báo ERR-INS-003 → Tiếp tục → SO hoàn thành | FAIL | BUG-W02-033 cascade + seed gap: không có SO CONFIRMED có BH âm |
| TC-W02-E2E-A07 | Panel 2 cột nhất quán trên cả 3 màn SO Edit / SO Detail / Tạo QT | FAIL | BUG-W02-033 cascade |
| TC-W02-E2E-A08 | Luồng SO không có BH: Panel rút gọn → Tạo QT → 1 phiếu KH | FAIL | Spec selector drift: button "Tạo quyết toán" vs /tạo phiếu quyết toán/i |
| TC-W02-E2E-B01 | Luồng đầy đủ: Kế toán xuất 4 tài liệu → Tab hiển thị đúng 4 PDF cards | FAIL | BUG-W02-033 + BUG-W02-043 cascade |
| TC-W02-E2E-B02 | Xuất subset 2/4 tài liệu → Tab chỉ có 2 PDF cards đúng loại | FAIL | BUG-W02-033 + BUG-W02-043 cascade |
| TC-W02-E2E-B03 | Versioning: Xuất v1 → xuất v2 → Tab hiển thị 2 bộ, v2 trên cùng | FAIL | BUG-W02-033 + BUG-W02-043 cascade |
| TC-W02-E2E-B06 | Tab "Hồ sơ đã xuất" — Pagination: ≥2 bộ hiển thị, chuyển trang đúng | FAIL | BUG-W02-043 cascade; strict mode violation getByText(/bộ hồ sơ|xuất ngày/i) |

### 3.2 Regression Suite (Run 3 — 2026-06-23)

| TC ID | Tiêu đề | Wave gốc | Run 3 | Ghi chú |
|---|---|---|---|---|
| TC-W02-E2E-REG-01 | [regression] Hoàn thành SO không có BH — popup baseline KHÔNG có cảnh báo BH âm | W02 | FAIL | Seed gap: PDV-20260619-00004 already COMPLETED, button "Hoàn thành" not shown |
| TC-W02-E2E-REG-02 | [regression] Màn Tạo phiếu QT với panel 2 cột mới → Submit → QT tạo thành công | W02 | SKIP | Conditional skip: BUG-W02-033 cascade — SO detail CTA not visible |
| TC-W02-E2E-REG-03 | [regression] Chi tiết phiếu QT BH → click "In phiếu" → print preview mở đúng | W02 | **PASS** (R3) → **FAIL** (R9) | R3: BUG-W02-006 fix VERIFIED; R9: REGRESSION — settlement detail data empty on fresh code SET-20260624-00003; "In phiếu" button timeout 264ms; BUG-W02-069 |
| TC-W02-E2E-REG-04 | [regression] Chi tiết phiếu QT BH → nút "Thanh toán" visible sau W02 panel per-payer | W02 | FAIL | Spec selector strict violation: getByText('Bảo hiểm thanh toán') → 2 elements (th + span) |
| TC-W02-E2E-REG-05 | [regression] Chi tiết phiếu QT BH → Chỉnh sửa → Form mở → Lưu thành công | W02 | FAIL | Selector drift: getByText(/chỉnh sửa|edit.*phiếu/i) not found on settlement detail |
| TC-W02-E2E-REG-06 | [regression] Thanh toán phiếu QT BH end-to-end — payment_status PAID | W02 | FAIL | BUG-W02-043 cascade; settlement detail not loading payment elements |
| TC-W02-E2E-REG-07 | [regression] SO Detail CONFIRMED có BH — button Sửa visible + navigate /edit | W02 | FAIL | Seed gap: no SO CONFIRMED with BH (all SETTLED) |
| TC-W02-E2E-REG-08 | [regression] SO Detail COMPLETED có BH — button Tạo phiếu QT navigate thành công | W02 | FAIL | Seed gap + BUG-W02-033: PDV-20260622-00012 already has settlements |
| TC-W02-E2E-REG-09 | [regression] SO Edit save flow sau CR-20260616-02 + CR-20260618-01 | W02 | FAIL | Seed gap: no SO CONFIRMED with BH editable |
| TC-W02-E2E-REG-10 | [regression] Popup Hoàn thành BH dương — KHÔNG có ERR-INS-003 → SO COMPLETED | W02 | FAIL | Seed gap: no SO CONFIRMED BH dương (all SETTLED) |

> Tất cả 10 regression TCs là re-run ở W02 (không mirror PASS từ W01). **Run 9 (2026-06-24)**: REG-03 FAIL (REGRESSION: PASS R3 → FAIL R9 — BUG-W02-069 fresh data). REG-02 SKIP (conditional — BUG-W02-033). Còn lại FAIL do BUG-W02-033/043 cascade + seed gaps. **Key finding Run 9**: BUG-W02-033 scope mở rộng — fresh settlement codes SET-20260624-* bị ảnh hưởng, không chỉ cũ mã cũ.

### 3.3 E2E Journeys (Run 3 — 2026-06-23)

| Journey ID | Tên | Run 3 | Bước fail (nếu có) |
|---|---|---|---|
| J-W02-PHA-A | Phase A: SO có BH → Panel 3 khối → Tạo QT → Số liệu nhất quán | FAIL (0/9 PASS — Run 9) | A01/02: BUG-W02-033 cascade; A03/04: REGRESSION Run 9 (PASS R3→FAIL R9) — BUG-W02-069; A05/06: seed gap BH âm; A07: BUG-W02-033 cascade; A08: button text drift + seed; A09: seed gap |
| J-W02-PHA-B | Phase B: Phiếu QT BH → Modal hồ sơ → Xuất → Tab → Download | FAIL (0/11 PASS) | B01..B11: BUG-W02-033 + BUG-W02-043 cascade — dossier button không render, dossier tab data not loading |
| J-W02-REG | Regression: 10 production journeys bị W02 tác động | FAIL (0/10 PASS + 1 SKIP — Run 9) | REG-03 REGRESSION: PASS R3→FAIL R9 (BUG-W02-069 — fresh codes); REG-02 SKIP (conditional); REG-01/04/05/06/07/08/09/10 FAIL (BUG-W02-033 cascade + seed gaps) |

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Run 3 | Run 4 | Run 9 | Linked Bug | Final verdict |
|---|---|---|---|---|---|
| TC-W02-E2E-A01 | Kế toán mở màn Tạo phiếu QT từ SO có BH — Panel 3 khối | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A02 | Số liệu BH nhất quán Tạo QT → Chi tiết QT BH | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A03 | Số liệu nhất quán Chi tiết QT BH → Template in (5 khoản dấu −) | P1 | BLOCKED | FAIL | **PASS** | BLOCKED | **FAIL** | BUG-W02-005 VERIFIED (R3); BUG-W02-069 OPEN (R9) | **FAIL** (REGRESSION) |
| TC-W02-E2E-A04 | Số liệu nhất quán Chi tiết QT KH → Template in (3 khoản dấu +) | P1 | BLOCKED | FAIL | **PASS** | BLOCKED | **FAIL** | BUG-W02-005 VERIFIED (R3); BUG-W02-069 OPEN (R9) | **FAIL** (REGRESSION) |
| TC-W02-E2E-A05 | Luồng BH âm: Cảnh báo ERR-INS-003 → Tiếp tục → SO hoàn thành | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A06 | Luồng BH âm: Hủy popup → SO vẫn active → Hoàn thành bình thường | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A07 | Panel 2 cột nhất quán SO Edit / SO Detail / Tạo QT | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A08 | SO không có BH: Panel rút gọn → 1 phiếu QT KH → Template baseline | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-A09 | SO có BH nhưng 5 khoản = 0: Panel đủ, BH = Cộng sau VAT BH | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B01 | Luồng đầy đủ: 4 tài liệu → Toast → Tab 4 PDF cards ≤15s | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B02 | Xuất subset 2/4 tài liệu → Tab 2 PDF cards đúng loại | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B03 | Versioning: v1 → v2 → Tab 2 bộ descending | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B04 | Bộ hồ sơ đã xuất immutable: chỉ Xem/Tải, không Edit | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B05 | Đóng modal giữa chừng (EC-1) → Mở lại → Form trống → Xuất OK | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B06 | Tab "Hồ sơ đã xuất" — Pagination ≥2 bộ, chuyển trang đúng | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B07 | Download PDF từ tab hồ sơ — file hợp lệ, đúng loại | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B08 | Cross-feature: Số tiền BH nhất quán SO → QT → PDF hồ sơ | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B09 | Phân quyền + Prefill: user không quyền BH không thấy nút; Tên KH prefill đúng | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B10 | Multi-tab: Tab 1 xuất → Tab 2 refresh → bộ hồ sơ mới visible | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-B11 | Network timeout khi xuất hồ sơ → error toast, không tạo record | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-REG-01 | [regression] Hoàn thành SO không BH — popup baseline, không cảnh báo | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-REG-02 | [regression] Tạo QT panel 2 cột → Submit → QT tạo thành công | P1 | BLOCKED | FAIL | SKIP | BLOCKED | SKIP | BUG-W02-033 cascade (conditional skip unchanged) | SKIP |
| TC-W02-E2E-REG-03 | [regression] QT BH → In phiếu → print preview mở đúng | P1 | BLOCKED | FAIL | **PASS** | BLOCKED | **FAIL** | BUG-W02-006 VERIFIED (R3); BUG-W02-069 OPEN (R9) | **FAIL** (REGRESSION) |
| TC-W02-E2E-REG-04 | [regression] QT BH → nút Thanh toán visible sau panel per-payer | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-REG-05 | [regression] QT BH → Chỉnh sửa → Lưu thành công | P2 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-REG-06 | [regression] Thanh toán QT BH end-to-end → payment_status PAID | P1 | BLOCKED | FAIL | FAIL | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) | FAIL |
| TC-W02-E2E-REG-07 | [regression] SO Detail CONFIRMED có BH → button Sửa visible | P1 | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) + seed gap | FAIL |
| TC-W02-E2E-REG-08 | [regression] SO Detail COMPLETED có BH → button Tạo QT navigate | P1 | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) + seed gap | FAIL |
| TC-W02-E2E-REG-09 | [regression] SO Edit save flow sau CR-20260616-02 + CR-20260618-01 | P1 | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) + seed gap | FAIL |
| TC-W02-E2E-REG-10 | [regression] Popup Hoàn thành BH dương → không có ERR-INS-003 | P1 | BLOCKED | FAIL | BUG-W02-033 (P1 OPEN) + seed gap | FAIL |

---

## 4. Failed Tests — Chi tiết (Run 3 root causes)

Run 3 (2026-06-23): 26 TC FAIL, 3 PASS, 1 SKIP. Root cause clusters:

| Cluster | TC bị ảnh hưởng | Root cause |
|---|---|---|
| BUG-W02-033 cascade | A01, A02, A05, A06, A07, A09, REG-01, REG-05, REG-06, REG-08 | BFF SO typename drift → SO detail panel không render → CTA buttons không visible |
| BUG-W02-043 cascade | B01..B11 | BFF dossierVersions schema drift → dossier tab/button không render |
| Seed code drift | A01, A02, A08 | SEED_SO_BH_CODE=PDV-20260622-00012 đã có settlements; correct seed PDV-20260622-00010 |
| Seed gap (SO CONFIRMED BH) | A05, A06, REG-07, REG-09, REG-10 | Không có SO CONFIRMED với has_insurance=true trong DB (tất cả SETTLED) |
| Seed gap (SO COMPLETED BH chưa settled) | REG-08 | PDV-20260622-00012 already has settlements; không có clean COMPLETED BH SO |
| Spec selector drift | A08, REG-04, REG-05 | Button text "Tạo quyết toán" vs /tạo phiếu quyết toán/i; getByText('Bảo hiểm thanh toán') → strict violation 2 elements; getByText(/chỉnh sửa/) not found |

---

### 4.1 Root Cause 1: BUG-W02-033 (P1 OPEN) — BFF SO Typename Drift

| Trường | Giá trị |
|---|---|
| **Bug** | BUG-W02-033 (P1 OPEN) |
| **Root cause** | BFF SDL typename drift: `getServiceOrderByCode` trả `ApiResponseServiceOrderDetailV3Response` nhưng FE + test query dùng `... on ServiceOrderDetailV3Response` → GRAPHQL_VALIDATION_FAILED → SO detail không load được data panel BH |
| **TC bị ảnh hưởng** | A01, A02, A05, A06, A07, A09, REG-01, REG-05, REG-06, REG-08 (10 TC) |
| **Symptom** | SO detail page renders blank panel BH; "Tạo phiếu quyết toán" button not visible; "Chỉnh sửa" button not found; "Hoàn thành phiếu dịch vụ" button not visible |
| **Partial fix** | Typename `... on ApiResponseServiceOrderDetailV3Response` đã hoạt động (STLCRE-004 PASS). Nhưng `insuranceAdjustment.breakdownByPayer` namespace absent from BFF SDL (flat fields instead). FE còn dùng cấu trúc namespace → data vẫn không render. |
| **Trạng thái** | OPEN — partial fix đã merge nhưng không đủ resolve web UI data load |

### 4.2 Root Cause 2: BUG-W02-043 (P1 OPEN) — Dossier Schema Drift

| Trường | Giá trị |
|---|---|
| **Bug** | BUG-W02-043 (P1 OPEN) |
| **Root cause** | BFF SDL `getInsuranceDossierVersions` trả `content/totalElements` trực tiếp; FE queries using `data.content` fail GRAPHQL_VALIDATION_FAILED; partial fix nhưng error-path (non-existent settlementCode → empty list not INS_STL_NOT_FOUND) vẫn open |
| **TC bị ảnh hưởng** | B01..B11 (11 TC) |
| **Symptom** | Dossier tab không render version list; button "Tạo hồ sơ bảo hiểm" không visible trên settlement detail |
| **Trạng thái** | OPEN — schema fix chưa deploy đầy đủ cho FE; error path vẫn FAIL |

### 4.3 Root Cause 3: Seed Data Gaps

| Trường | Giá trị |
|---|---|
| **Loại** | Seed data drift + seed gaps |
| **Seed code drift** | SEED_SO_BH_CODE hardcoded `PDV-20260622-00012` đã có settlements → "Tạo phiếu quyết toán" không visible; đúng seed = `PDV-20260622-00010` (COMPLETED, has_insurance=true, no prior settlements) |
| **Seed gap** | Không có SO CONFIRMED với has_insurance=true trong DB (tất cả insurance SOs đã SETTLED); REG-07/09/10 fail vì cần SO CONFIRMED có BH; REG-08 cần SO COMPLETED BH chưa SETTLED |
| **TC bị ảnh hưởng** | A01/A02 (seed drift), REG-01 (PDV-20260619-00004 already COMPLETED), REG-07/09/10 (no CONFIRMED BH), REG-08 (no clean COMPLETED BH) |

### 4.4 Root Cause 4: Spec Selector Drift

| Trường | Giá trị |
|---|---|
| **Loại** | Spec selector mismatch |
| **A08** | Button text actual = "Tạo quyết toán"; spec selector = `/tạo phiếu quyết toán/i`; cần update spec |
| **REG-04** | `getByText('Bảo hiểm thanh toán')` strict mode violation → 2 elements (th.columnheader + span[data-testid="balance-bh"]); cần dùng `getByTestId('balance-bh')` |
| **REG-05** | `getByText(/chỉnh sửa|edit.*phiếu/i)` not found on settlement detail; button text/accessible-name khác hoặc DOM structure thay đổi |
| **New bugs** | BUG-W02-049 (seed code drift), BUG-W02-050 (REG-04 strict mode violation) |

---

### 4.5 Root Cause 5: Infrastructure Not Running (Run 4 — 2026-06-23)

| Trường | Giá trị |
|---|---|
| **Loại** | Infrastructure unavailable |
| **Root cause** | Garage application stack không chạy — không có containers cho garage-web, agg-garage-graph, gf-accounting, gf-sales. No pre-built Docker images trong local registry. Source code nằm trong repo `garage-functions/` riêng biệt. |
| **TC bị ảnh hưởng** | TẤT CẢ 30 TCs (BLOCKED before execution starts) |
| **Symptom** | localhost:45300, 45310, 45401 connection refused sau 2 retries mỗi port. `docker compose up -d` chỉ start base infra (kafka, redis, kafka-ui). App services cần `docker compose --profile backend --profile bff --profile frontend up -d` nhưng không có pre-built images. |
| **Side discovery** | NODE_PATH issue: spec files ở `Execution/auto/specs/W02/e2e/` (sibling dir) không resolve `@playwright/test` từ `Execution/auto/harness/playwright/node_modules/`. Fix: `NODE_PATH="./node_modules" npx playwright test` từ harness dir. Lesson TL-W02-E2E-007. |
| **Resolution required** | Start Garage app stack: build source từ `garage-functions/` hoặc pull pre-built images; start với `--profile backend bff frontend`; verify ports reachable; re-run. |

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — E2E execution bị BLOCKED; không có code coverage thu thập được.

### 5.2 TC Coverage (Traceability)

| Feature ID | Tổng AC | AC có TC | AC chưa có TC | Coverage | Ghi chú |
|---|---|---|---|---|---|
| `FEAT-INS-STL-CREATE` | 7 (AC-1..7) | 7 | 0 | 100% TC | TCs authored; chưa execute |
| `CR-20260612-01` | 3 | 3 | 0 | 100% TC | |
| `CR-20260612-02` | 2 | 2 | 0 | 100% TC | |
| `CR-20260616-01` | 2 | 2 | 0 | 100% TC | |
| `CR-20260616-02` | 2 | 2 | 0 | 100% TC | |
| `CR-20260618-01` | 1 | 1 | 0 | 100% TC | |
| `FEAT-INS-DOSSIER-CREATE` | 14 (AC-1..14) | 14 | 0 | 100% TC | |
| `FEAT-INS-DOSSIER-VIEW` | 8 (AC-1..8) | 8 | 0 | 100% TC | |

> Coverage là TC-authored coverage, không phải execution coverage. Chưa có TC nào PASS. Mọi ACs đều có ≥1 TC trong auto artifact.

---

## 6. Performance Metrics

N/A — Execution BLOCKED. Không có metric thu thập được. TC-W02-E2E-B01 có performance sanity assertion (≤15s cho export PDF) — sẽ verify ở Run 2 sau khi permission gate được giải quyết.

---

## 7. Issues phát hiện (Run 3 — 2026-06-23 state)

> Issues phát hiện trong quá trình TEST_EXECUTION Run 3. Trạng thái cập nhật sau Run 3.

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug BFF | P1 OPEN | BUG-W02-033: BFF SO typename drift — SO detail panel không render data BH, CTA buttons blocked | `agg-garage-graph` | BUG-W02-033 | OPEN — partial fix (typename), residual = insuranceAdjustment namespace absent |
| 2 | Bug BFF | P1 OPEN | BUG-W02-043: BFF dossierVersions schema drift — FE query fails, dossier button không visible | `agg-garage-graph` | BUG-W02-043 | OPEN — partial fix (content/totalElements), residual = error-path empty list not INS_STL_NOT_FOUND |
| 3 | Seed code drift | Data | SEED_SO_BH_CODE hardcoded `PDV-20260622-00012` đã có settlements (correct: `PDV-20260622-00010`) | `gf-sales` DB + spec | BUG-W02-049 | NEW — logged Run 3; spec cần cập nhật seed code |
| 4 | Spec selector drift | Spec | REG-04: getByText('Bảo hiểm thanh toán') strict violation → 2 elements; A08: button text mismatch | spec files | BUG-W02-050 | NEW — logged Run 3; spec cần update selectors |
| 5 | Seed Data Gap | Data | Không có SO CONFIRMED với has_insurance=true (tất cả insurance SOs = SETTLED) — REG-07/09/10 | `gf-sales` DB | — | OPEN — cần seed SO CONFIRMED có BH |
| 6 | Bug VERIFIED | Process | BUG-W02-005 (print template depreciation monetary) promoted FIX_DONE → VERIFIED | `gf-accounting` + `gf-sales` | BUG-W02-005 | VERIFIED via A03+A04 PASS |
| 7 | Bug VERIFIED | Process | BUG-W02-006 (golden print test) promoted FIX_DONE → VERIFIED | `gf-accounting` | BUG-W02-006 | VERIFIED via REG-03 PASS |
| 8 | BUG-W02-024..026 (P0) | Bug | DossierPhieuQuyetToan/BaoGia data binding + table widget (mobile scope) | `garage-mobile` | BUG-W02-024/025/026 | FIX_DONE (source-verified 2026-06-22); thuộc mobile agent scope |
| 9 | BUG-W02-027 (P1) | Bug | RBAC tab "Hồ sơ BH đã xuất" không gated (mobile + gf-system scope) | `gf-system` + `garage-mobile` | BUG-W02-027 | OPEN; mobile scope |
| 10 | BUG-W02-020/022/028 (P1/P1/P2) | Bug | PDF Unicode/CSS Grid/VND format + Thymeleaf null-safety | `gf-accounting` | BUG-W02-020/022/028 | OPEN; blocking DOSSIER-CREATE but non-web-E2E scope |
| 11 | Bug FIX_DONE chờ verify | Process | ~14 bugs còn FIX_DONE chưa VERIFIED sau Run 3 (BUG-W02-002/003/007/009/010/011/012/013/014 + mobile bugs) | multiple | various | FIX_DONE — chờ unblock (BUG-W02-033/043 fix cần trước) |

### 7.1 Drift phát hiện (Run 3)

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| Seed code staleness: SEED_SO_BH_CODE `PDV-20260622-00012` đã SETTLED | Spec `insurance-stl-create.spec.ts`: SEED_SO_BH_CODE = `PDV-20260622-00012` | DB: PDV-20260622-00012 đã có settlements (INSURANCE+CUSTOMER). Đúng seed: `PDV-20260622-00010` | Update SEED_SO_BH_CODE trong spec; log BUG-W02-049 |
| Spec selector strict violation REG-04: getByText('Bảo hiểm thanh toán') | Spec: `getByText('Bảo hiểm thanh toán')` expected unique element | DOM: 2 elements match — `th.columnheader` + `span[data-testid="balance-bh"]` | Đổi selector sang `getByTestId('balance-bh')` hoặc scoped; log BUG-W02-050 |
| A08 button text mismatch | Spec: `/tạo phiếu quyết toán/i` | DOM: button inner text = "Tạo quyết toán" (shorter) | Update spec selector to match actual button text |
| Seed gap: no SO CONFIRMED với BH | TC-W02-E2E §Test Environment & Data: "Seed SO có BH CONFIRMED" | DB: tất cả insurance SOs = SETTLED | Tạo SO mới qua API với has_insurance=true trong CONFIRMED state |

### 7.2 Handoff cập nhật registry / tracker

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W02-E2E (30 TCs) | BLOCKED — 30/30 | QA Authority |
| `Execution/WAVE-TRACKER.md` | W02 E2E verdict | BLOCKED-by-permission-gate + 4 P0 bugs OPEN + 4 P1 bugs OPEN + 19 FIX_DONE chờ verify | Delivery Authority / QA Authority |
| `.claude/settings.json` | allow list | Thêm `"Bash(cd Execution/auto/harness/playwright && npx playwright test*)"` | QA Authority / Delivery Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate (≥80%)? | KHÔNG | 3/30 TC PASS (10%); Run 3 live browser executed |
| Regression đạt ngưỡng active gate? | KHÔNG | 1/10 REG PASS (REG-03); 1 SKIP; 8 FAIL |
| E2E Journeys đạt ngưỡng active gate? | KHÔNG | Phase A: 2/9 PASS; Phase B: 0/11 PASS; REG: 1/10 PASS |
| Coverage đạt ngưỡng active gate? | TC-authored | TC authored 100% AC; execution 10% |
| Bug P0 web = 0? | OK | BUG-W02-024/025/026 FIX_DONE; BUG-W02-027 mobile scope |
| Bug P1 web blocker = 0? | KHÔNG | BUG-W02-033 + BUG-W02-043 còn OPEN blocking web E2E |
| Bug P1 non-web = 0? | KHÔNG | BUG-W02-020/022/029/030 OPEN nhưng không block web E2E |
| Bugs VERIFIED tiến độ | OK | 6 VERIFIED (001/004/005/006/018 + 1 UI); Run 3 thêm 005+006 |
| Tenant isolation = 0 leakage? | N/A | Thuộc `agent-test-isolation` scope |

### 8.2 Quyết định

- [ ] **CHO QUA GATE (GO)** — Wave W02 đạt exit criteria kiểm thử
- [x] **KHÔNG CHO QUA GATE (NO-GO)** — Blockers bắt buộc giải quyết trước khi tiến tiếp:
  1. **BUG-W02-033 (P1)**: Fix BFF `insuranceAdjustment` namespace hoặc update FE query để dùng flat fields → SO detail panel render đúng → unblock Phase A + REG
  2. **BUG-W02-043 (P1)**: Fix error-path `getInsuranceDossierVersions` non-existent code → unblock dossier tab verification
  3. **Seed code drift (BUG-W02-049)**: Update spec `SEED_SO_BH_CODE = PDV-20260622-00010` (or create fresh seed) → unblock A01/A02/A08
  4. **Spec selector drift (BUG-W02-050)**: Update REG-04 selector `getByTestId('balance-bh')`; A08 button text; REG-05 button selector
  5. **Seed data gap**: Tạo SO CONFIRMED với has_insurance=true (unblock REG-07/09/10); SO COMPLETED BH chưa SETTLED (unblock REG-08)
  6. **Bug Verification Loop**: ~14 bugs FIX_DONE cần promote sang VERIFIED sau BUG-W02-033/043 fix
- [ ] **CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)** — N/A

### 8.3 Ghi chú cho wave tiếp theo

- **[Run 4 prerequisite]**: Khởi động Garage app stack (garage-web + agg-garage-graph + gf-accounting + gf-sales) trước khi re-run. Cần build source từ `garage-functions/` hoặc pull pre-built images. Verify: `curl http://localhost:45300` và `curl http://localhost:45401/garage/graphql` reachable. Seed SO fresh: PDV-20260623-00014 (has_insurance=true, COMPLETED, no settlements) — verify via BFF `getServiceOrderByCode` trước khi chạy Phase A TCs.
- **[NODE_PATH fix — lesson TL-W02-E2E-007]**: Chạy từ harness dir: `cd Execution/auto/harness/playwright && NODE_PATH="./node_modules" npx playwright test -c pw-w02-e2e.config.ts`
- **Priority 1**: Fix BUG-W02-033 (BFF namespace gap) + BUG-W02-043 (error-path) → unblock 21/26 FAIL TCs
- **Priority 2**: Update spec selectors (BUG-W02-049/050) → unblock A01/A02/A08/REG-04/REG-05
- **Priority 3**: Seed SO CONFIRMED có BH → unblock REG-07/09/10
- Sau khi BUG-W02-033/043 fixed: re-run full suite → expect nhiều FIX_DONE bugs có thể verify (BUG-W02-009/010/011/012/013)
- Tránh seed code staleness: spec constants nên dùng SO code theo dynamic query thay vì hardcode date-based code
- REG-07/08/09/10 cần seed data mới — không thể tái sử dụng seed hiện tại (all SETTLED)
- Pattern lesson từ Run 3: seed data probing trước execution là bắt buộc để xác nhận seed codes còn valid

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-22 | Khởi tạo TR-W02-E2E — Run 1 BLOCKED. 30 TCs BLOCKED (28 original + 2 co-located delta REG-06/10 appended). Playwright runner blocked by Claude permission system. Infrastructure healthy. Seed data gap: no SO with BH in CONFIRMED/COMPLETED state. 19 FIX_DONE bugs unverified. Lessons TL-W02-E2E-002/003/004 logged. | agent-test-e2e |
| 2026-06-22 | v1 — Khởi tạo TR-W02-E2E. Environment Readiness Gate hoàn thành (infrastructure healthy, browser confirmed, harness functional). Execution BLOCKED-by-permission-gate: `npx playwright test` denied bởi `.claude/settings.json` allow list. 30/30 TC = BLOCKED. 4 P0 bugs OPEN. 4 P1 bugs OPEN. 19 FIX_DONE chờ verify. Seed data gap cho REG-07/08/09/10. Kết luận: NO-GO. | agent-test-e2e |
| 2026-06-23 | v3 — Run 3 live browser (re-run sau DEV fix cycle). 3 PASS (A03, A04, REG-03) / 26 FAIL / 1 SKIP. BUG-W02-005 VERIFIED (A03+A04), BUG-W02-006 VERIFIED (REG-03). Root cause clusters: BUG-W02-033 cascade (21 TCs) + seed code drift PDV-20260622-00012 + spec selector drift REG-04/A08 + seed gap (no SO CONFIRMED BH) + BUG-W02-043 cascade (B01..B11). New bugs: BUG-W02-049 (seed drift), BUG-W02-050 (selector strict violation). §3/4/7/8 updated to reflect Run 3 state. Kết luận: NO-GO (BUG-W02-033 + BUG-W02-043 còn OPEN blocking majority). | agent-test-e2e |
| 2026-06-23 | v4 — Run 4 BLOCKED. Environment Readiness Gate FAILED: Garage app stack NOT running (ports 45300/45310/45401 unreachable after 2 retries). No pre-built Docker images; source code in `garage-functions/`. Infra base (kafka/redis) started. NODE_PATH fix discovered (macOS arm64 spec sibling dir issue) — lesson TL-W02-E2E-007 logged. Fresh SO candidate: PDV-20260623-00014. §1 Tổng quan updated (4 runs; latest = BLOCKED). §1.5 Run Timeline: Run 3 row added (missing), Run 4 row added. §2.5 multi-run trend: Run 4 column added. §4.5 Root Cause 5 added (infra unavailable). §8.3 Run 4 prerequisite note added. Kết luận: NO-GO / BLOCKED (infrastructure startup required before next run). | agent-test-e2e |
| 2026-06-26 | v6 — Run 10 (2026-06-26): **20 PASS / 0 FAIL / 4 BLOCKED / 6 SKIP**. BFF dual-instance proxy (TL-W02-E2E-009) applied. FRESH DATA 2026-06-26. **Phase B (B01..B11) ALL PASS** — BUG-W02-033/043 resolved by 2026-06-25 fix batch. Phase A (A01-A04, A07-A09) PASS. REG-03/04/06/08 PASS. **BLOCKED×4** (REG-02/05/07/10): macOS Apple Silicon headless Chrome GPU crash SEGV_ACCERR signal 11 (BUG-W02-117 new P1). SKIP×6 (A05/A06/REG-01/REG-09 seed state gap). **10 FIX_DONE bugs VERIFIED** (BUG-W02-009/010/011/012/063/064/065/066/074/081). New bugs: BUG-W02-116 (BFF dual-instance P2), BUG-W02-117 (Chrome GPU crash P1). Kết luận: BLOCKED (4 regression TCs blocked by runner infrastructure; no FAIL at feature logic level). | agent-test-e2e |
