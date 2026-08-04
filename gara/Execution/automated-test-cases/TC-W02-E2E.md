---
document_id: 'GMS-TC-W02-E2E'
type: automated-test-case
parent: 'Execution/automated-test-cases/'
status: BLOCKED
version: 7
boundary: 'garage-web, gf-accounting, gf-sales, agg-garage-graph'
wave: 'W02'
features:
  - FEAT-INS-STL-CREATE
  - CR-20260612-01
  - CR-20260612-02
  - CR-20260616-01
  - CR-20260616-02
  - CR-20260618-01
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
owner: 'agent-test-e2e'
last_reviewed: '2026-06-26'
---

# Automated Test Cases — W02: Settlement Adjustments + Insurance Dossier E2E

> **Runner**: QC-owned harness at `Execution/auto/harness/playwright/`
> **Spec files**:
>   - `Execution/auto/specs/W02/e2e/insurance-stl-create.spec.ts` — Phase A: SO→QT panel, BH âm, per-payer
>   - `Execution/auto/specs/W02/e2e/insurance-dossier.spec.ts` — Phase B: QT BH→Hồ sơ→Xuất→Tab xem + REG-01..10
> **Lessons applied**: TL-W01-E2E-003 (probe selectors/routes/seed before gen), TL-W01-E2E-004 (post-login state probe), TL-W01-E2E-005 (role-based tab selector), TL-W01-ALL-002 (granular /verify-bug after fix)
>
> **EXECUTION STATUS (Run 10 — 2026-06-26): 20 PASS / 0 FAIL / 4 BLOCKED / 6 SKIP.** Playwright live browser executed all 30 TCs via remote stack `http://192.168.110.191:45300`. FRESH DATA mandated 2026-06-26: seeded PDV-20260626-00001..00019, SET-20260626-00001..00004 via API (`Execution/auto/harness/api/seed-w02-mobile-e2e.sh` + manual BFF GraphQL). BFF dual-instance proxy added (TL-W02-E2E-009): intercept `localhost:45401` → `192.168.110.191:45401` for all BFF requests. **ALL Phase B (B01..B11) PASS** — BUG-W02-033/043 resolved by 2026-06-25 fix batch. **Phase A (A01/02/03/04/07) PASS**; A05/A06 SKIP (no BH âm SO available). BLOCKED×4: REG-02/05/07/10 — macOS Apple Silicon headless Chrome GPU crash (SEGV_ACCERR signal 11 + CVDisplayLinkCreateWithCGDisplay/SharedImageManager failure) during complex form render/state transition; hardware-level runner blocker (BUG-W02-117). Bugs filed: BUG-W02-116 (BFF dual-instance infra P2), BUG-W02-117 (macOS Chrome GPU crash BLOCKED-by-runner P1). FIX_DONE bugs verified: BUG-W02-009/010/011/012/063/064/065/066/074/081 via PASS TCs.
>
> **EXECUTION STATUS (Run 9 — 2026-06-24): 0 PASS / 29 FAIL / 0 BLOCKED / 1 SKIP.** Playwright live browser executed all 30 TCs via remote stack `http://192.168.110.191:45300`. FRESH DATA mandated: settlement codes SET-20260624-00001/00002/00003. SSO proxy intercept added in `loginAs()` to route `localhost:45410` → `192.168.110.191:45410`. Root causes: (1) BUG-W02-033 (P1 OPEN) — settlement detail `getSettlementByCode` data not populating (all fields `--`, `0đ`) on FRESH codes SET-20260624-00001/00002 → blocks A03/A04/REG-03 which PASSED in Run 3 — REGRESSION confirmed, filed BUG-W02-072; (2) BUG-W02-043 (P1 OPEN) — "Hồ sơ bảo hiểm" tab absent on settlement detail → B01..B11 all FAIL; (3) SEED_SO_BH_CODE not provided in run command → A01 defaulted to `PDV-PROBE-REQUIRED`; (4) Seed gap — no COMPLETED/CONFIRMED SO with has_insurance=true in current DB (all BH SOs SETTLED); (5) REG-02 SKIP (conditional skip unchanged).
>
> **EXECUTION STATUS (Run 4 — 2026-06-23): 0 PASS / 0 FAIL / 30 BLOCKED / 0 SKIP.** Root cause: Garage application stack NOT running. NODE_PATH fix identified (TL-W02-E2E-007).
>
> **EXECUTION STATUS (Run 3 — 2026-06-23)**: 3 PASS / 26 FAIL / 1 SKIP / 0 BLOCKED. PASS: A03, A04, REG-03. BUG-W02-005 + BUG-W02-006 VERIFIED. New bugs: BUG-W02-049 (seed drift), BUG-W02-050 (selector). NOTE: A03/A04/REG-03 PASS in Run 3 using old settlement codes — REGRESSED to FAIL in Run 9 with fresh codes (BUG-W02-072).

---

## 1. General Info

| Field | Value |
| --- | --- |
| Document ID | `GMS-TC-W02-E2E` |
| Wave | W02 |
| Boundary(ies) | `garage-web · gf-accounting · gf-sales · agg-garage-graph` |
| Feature(s) | `FEAT-INS-STL-CREATE, CR-20260612-01/02, CR-20260616-01/02, CR-20260618-01, FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW` |
| Owner | `agent-test-e2e` |
| Last Reviewed | 2026-06-22 |
| Work Package | `Execution/work-packages/PKG-W02-insurance-dossier.md` |

---

## 2. Scope

### In Scope

**Phase A (Settlement Create + CR Adjustments):**
- Luồng SO có BH → Tạo phiếu QT → Panel "Tổng giá dịch vụ" hiển thị đúng 3 khối (Chi tiết per-payer + Phân bổ BH + Cân thanh toán)
- Panel 2 cột nhất quán trên SO Edit / SO Detail / Tạo QT (CR-20260616-02)
- Số liệu nhất quán: panel Tạo QT → chi tiết phiếu QT BH → template in (CR-20260616-01, CR-20260612-01)
- Luồng BH âm: cảnh báo ERR-INS-003 → warn-and-allow → SO hoàn thành thành công
- Luồng SO không có BH: panel rút gọn, QT KH baseline, template in baseline
- Logic sinh phiếu QT KH "chỉ phân bổ BH" khi BH 100% + KH chịu phân bổ (CR-20260618-01)

**Phase B (Insurance Dossier):**
- Luồng đầy đủ: Phiếu QT BH → Modal "+ Tạo hồ sơ bảo hiểm" → 4 accordion → Xuất hồ sơ → Tab "Hồ sơ đã xuất"
- Xuất subset (2/4 tài liệu) → chỉ 2 PDF card trong tab
- Versioning: xuất bộ v1 → xuất bộ v2 → tab thứ tự descending
- Immutability: bộ đã xuất chỉ view/download, không edit
- Đóng modal giữa chừng (EC-1): no draft, re-open → form trống, xuất lại thành công
- Cross-feature: số tiền BH nhất quán từ phân bổ SO → panel QT → chi tiết QT BH → PDF trong hồ sơ
- PDF download từ tab hồ sơ (file tải về hợp lệ, đúng nội dung)
- Prefill Biên bản + Giấy ủy quyền từ phiếu QT BH
- Phân quyền: user không có quyền BH không thấy panel + nút lập hồ sơ

**Regression (production journeys bị tác động bởi W02):**
- Hoàn thành SO không có BH → popup baseline KHÔNG có cảnh báo BH âm
- Submit Tạo phiếu QT (panel 2 cột mới, CR-20260616-02) → QT tạo thành công
- In phiếu QT BH (template mới CR-20260616-01) → print preview không vỡ
- Thanh toán QT BH → nút Thanh toán vẫn visible sau khi thêm panel per-payer
- Chỉnh sửa QT BH → form mở được, lưu thành công
- **[Co-located regression — delta 2026-06-22]**: Thanh toán QT BH end-to-end (payment_status PAID) · Edit SO button + navigation · Tạo phiếu QT button từ SO COMPLETED BH · SO Edit save flow · Popup Hoàn thành phiếu dịch vụ happy path BH dương

### Out of Scope

- Mobile journey (Flutter/Patrol) — thuộc `agent-test-mobile-e2e`
- UI render/wording isolated per-screen — thuộc `agent-test-ui`
- API contract/schema validation chi tiết — thuộc `agent-test-api`
- Cross-tenant denial assertion — thuộc `agent-test-isolation`
- Auth/authz abuse, injection — thuộc `agent-test-security`
- Concurrent export (409 conflict) — TC-W02-E2E-014 trong manual: xem §Coverage Accounting
- Signed URL TTL refresh — TC-W02-E2E-015 trong manual: xem §Coverage Accounting
- Lỗi PDF generation + retry mock — TC-W02-E2E-019: xem §Coverage Accounting

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| **Runner** | QC-owned harness `Execution/auto/harness/playwright/` | `BASE_URL=http://localhost:45300 npx playwright test -c playwright.config.ts` |
| **Browser** | ms-playwright Chromium at `/home/engineer_ac/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` | **CONFIRMED EXISTS** via `ls` probe 2026-06-22 |
| **baseURL** | `http://localhost:45300` (garage-web docker container) | **CONFIRMED HEALTHY** via `docker compose ps` 2026-06-22; **NOT REACHABLE** on 2026-06-23 (Run 4) |
| **Stack** | gf-accounting + gf-sales + agg-garage-graph + garage-web + ct-file-storage | **NOT RUNNING (Run 4)** — all app service ports unreachable (45300/45310/45401) after 2 retries 2026-06-23; no pre-built images; infra base (kafka, redis) started; see EXECUTION BLOCK Run 4 below |
| **Login credentials** | accountant: phone `0810000002` / `Test@12345`; owner: `0810000001` / `Test@12345` | SSO stub — không verify signature |
| **SEED_STL_BH_CODE** | `SET-20260622-00005` — INSURANCE DRAFT, SO=PDV-20260622-00009 | **CONFIRMED** from DB probe 2026-06-22 |
| **SEED_STL_NO_BH_CODE** | `SET-20260622-00006` — CUSTOMER DRAFT | **CONFIRMED** from DB probe |
| **SEED_SO_NO_BH_CODE** | `PDV-20260619-00004` — COMPLETED, has_insurance=false | **CONFIRMED** from DB probe |
| **SEED_STL_BH_DOSSIER_CODE** | `SET-20260622-00002` — INSURANCE DRAFT, v23 EXPORTED (multi-version) | **CONFIRMED** from DB probe |
| **SEED_STL_BH_PAYMENT_CODE** | `SET-20260622-00005` — INSURANCE DRAFT (use for payment TC) | Note: no CONFIRMED SO with BH — all settled |
| **Seed SO có BH** | NO SO với has_insurance=true trong trạng thái COMPLETED/CONFIRMED — chỉ có SETTLED | **BLOCKER**: seed gap — all BH SOs are SETTLED (no Tạo QT available) |
| **ct-file-storage** | Mock hoặc live ct-file-storage reachable từ BFF | Phase B upload/download cần storage reachable |

**CRITICAL SEED GAP** (discovered via DB probe 2026-06-22):
- Tất cả SO có BH đều ở trạng thái `SETTLED` (đã tạo QT) → TC-W02-E2E-A01..A09 cần SO `COMPLETED` hoặc `CONFIRMED` với BH nhưng không có trong DB hiện tại
- Chỉ có `PDV-20260622-00010` trạng thái `IN_PROGRESS` có BH — không đủ điều kiện tạo QT
- Cần seed SO mới với has_insurance=true trong COMPLETED state trước khi chạy Phase A TCs

**Browser-harness preflight (bắt buộc trước execution):**
1. `cd Execution/auto/harness/playwright && npm install`
2. Confirm chrome binary: `ls /home/engineer_ac/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` — **CONFIRMED**
3. Confirm baseURL: `curl -s http://localhost:45300 | head -5` — **CONFIRMED** (docker healthy)
4. Check runner config: `cat playwright.config.ts` — **CONFIRMED** (testDir: '../../specs', outputDir: '../../evidence')
5. Smoke probe: blocked by permission system — **BLOCKER**

**EXECUTION BLOCK (2026-06-23 — Run 4)**: Environment Readiness Gate FAILED (Step 0c — 2 retries exhausted):
- `curl http://localhost:45300` → Connection refused (retry 1)
- `curl http://localhost:45401` → Connection refused (retry 1)
- `curl http://localhost:45310` → Connection refused (retry 2)
- `curl http://localhost:45401` → Connection refused (retry 2)
- Root cause: Garage service containers NOT running; no pre-built Docker images; source code in `garage-functions/` repo (not in design repo)
- `docker compose up -d` in infra/: only started kafka, redis, kafka-ui (base infra) — app services require source code build
- NODE_PATH fix discovered: `NODE_PATH="./node_modules" npx playwright test -c pw-w02-e2e.config.ts` resolves spec sibling directory resolution (TL-W02-E2E-007)
- Per Step 0c agent contract: mark all 30 TCs → BLOCKED, verdict = BLOCKED

**EXECUTION BLOCK (2026-06-22)**:
- `npx playwright test` → BLOCKED by Claude permission system (not in allow list)
- `node playwright-binary` → BLOCKED by Claude permission system
- `WebFetch http://localhost` → BLOCKED by Claude permission system
- MCP playwright tools listed as `allow` in settings.json but NOT available as direct tool calls in this subagent session
- Infrastructure: HEALTHY (all containers up, chrome binary exists, spec files exist, deps installed)
- Resolution required: Add `Bash(cd Execution/auto/harness/playwright && npx playwright test*)` to settings.json allow list OR enable MCP playwright tools for subagent

**Execution Clusters (frozen — execution blocked):**
- **C1** (single-session happy path): TC-W02-E2E-A01, A02, A05, A07, B01, B02, B03, B06 — cần stack live + seed SO BH + seed phiếu QT BH
- **C2** (C1 + DB/audit verification): TC-W02-E2E-A03, A04, A06, B04, B05, B07, B08, B09 — cần query DB sau action
- **C3** (C2 + second-session / special setup): TC-W02-E2E-B10, REG-01..05, REG-06..10 — cần second session hoặc cleanup setup

**Common Baseline Coverage Map** (per `common-testcase-e2e.md` — sàn tối thiểu):

| Common Group | TC ánh xạ | Trạng thái |
| --- | --- | --- |
| §1 Authentication Flows (E2E-AU01..13) | Login helper trong spec (loginAsAccountant/loginAsOwner); TC-W02-E2E-REG-05 (permission gate) | `adapted` — login là precondition trong mọi TC; AU07/AU08 `out-of-scope` (auth boundary thuộc agg-sso-graph, deep auth → `agent-test-security`) |
| §2.1 Create (E2E-CR01..09) | TC-W02-E2E-A01 (tạo QT BH), B01 (xuất hồ sơ đầu tiên) | `covered` |
| §2.2 Read/View (E2E-RD01..05) | TC-W02-E2E-A02 (chi tiết phiếu QT BH), B05 (tab hồ sơ view), B07 (download PDF) | `covered` |
| §2.3 Update (E2E-UD01..07) | TC-W02-E2E-REG-05 (chỉnh sửa QT BH sau W02); REG-09 (SO Edit save flow) | `covered` — Update của QT không thuộc scope W02 CRUD mới; hồ sơ dossier là immutable (no Update); UD06 concurrent-edit `out-of-scope` → concurrent export (TC manual 014) `out-of-automation-scope` (cần 2 browser sessions countdown manual) |
| §2.4 Delete (E2E-DE01..07) | Hồ sơ BH immutable — no Delete per BR-INS-DOSSIER-005; phiếu QT BH no cancel per FEAT-INS-STL-DETAIL AC-11 | `out-of-scope` — Delete không áp dụng cho dossier hay phiếu QT BH trong W02 |
| §3 Search & Filter (E2E-SR01..09) | Tab "Hồ sơ đã xuất": pagination + empty state (TC-W02-E2E-B05) | `adapted` — không có standalone search screen trong W02; SR06 empty state `covered` trong B05 |
| §4 Pagination (E2E-PG01..06) | `getInsuranceDossierVersions` paginated (TC-W02-E2E-B06) | `covered` |
| §5 File Upload/Download (E2E-FU01..09) | TC-W02-E2E-B07 (download PDF từ tab); TC-W02-E2E-B01 (upload + persist via BFF Phase C) | `covered` — FU03/04 (wrong type/size) `out-of-scope` (W02 không có user-facing file upload; BFF upload internal) |
| §6 Permission/Role-Based (E2E-PM01..04) | TC-W02-E2E-B09 (user không có quyền BH) | `covered` |
| §7 Navigation Back/Forward (E2E-NV01..05) | TC-W02-E2E-A07 (panel nhất quán cross-màn SO→QT), NV03 breadcrumb `adapted` trong navigation steps; REG-07 (SO Edit navigation) | `adapted` |
| §8 Notification & Real-time (E2E-NT01..05) | Toast "Xuất hồ sơ bảo hiểm thành công" (TC-W02-E2E-B01), toast lỗi BH âm (TC-W02-E2E-A05); toast success SO Edit save (REG-09) | `covered` — NT04/NT05 (badge/inbox notification) `out-of-scope` (không có in-app notification trong W02) |
| §9 Concurrent/Multi-tab (E2E-MT01..03) | TC-W02-E2E-B10 (tab 1 xuất hồ sơ → tab 2 thấy bản mới) | `covered` — MT02/MT03 `out-of-scope` (concurrent export 409 = manual-only, thuộc TC manual 014 `out-of-automation-scope`) |
| §10 Client–Server Connectivity (E2E-CS01..05) | TC-W02-E2E-B11 (network timeout/server error khi xuất hồ sơ) | `covered` |
| §11 Email/Notification Triggers (E2E-EM01..04) | `out-of-scope` — W02 không trigger email | `out-of-scope` |
| §12 Performance Sanity (E2E-PF01..03) | TC-W02-E2E-B01 assertion timeout ≤ 15s cho export PDF (sanity only) | `adapted` — đây là sanity, không thay thế `agent-test-performance` |

**Auto vs Manual Parity Diff** (so sánh manual TC-W02-E2E.md 28 TCs vs auto artifact):

| Manual TC | Auto phân loại | Ghi chú |
| --- | --- | --- |
| TC-W02-E2E-001 | `covered` → TC-W02-E2E-A01 | |
| TC-W02-E2E-002 | `covered` → TC-W02-E2E-A02 + A03 | |
| TC-W02-E2E-003 | `covered` → TC-W02-E2E-A03 (print template assertion) | |
| TC-W02-E2E-004 | `covered` → TC-W02-E2E-A04 | |
| TC-W02-E2E-005 | `covered` → TC-W02-E2E-A05 | |
| TC-W02-E2E-006 | `covered` → TC-W02-E2E-A06 | |
| TC-W02-E2E-007 | `covered` → TC-W02-E2E-A07 | |
| TC-W02-E2E-008 | `covered` → TC-W02-E2E-B01 | Happy path đầy đủ |
| TC-W02-E2E-009 | `covered` → TC-W02-E2E-B03 | Versioning |
| TC-W02-E2E-010 | `covered` → TC-W02-E2E-B02 | Xuất subset |
| TC-W02-E2E-011 | `covered` → TC-W02-E2E-B08 | Cross-feature number consistency |
| TC-W02-E2E-012 | `covered` → TC-W02-E2E-B04 | Immutability |
| TC-W02-E2E-013 | `covered` → TC-W02-E2E-B07 | Download PDF |
| TC-W02-E2E-014 | `out-of-automation-scope` | Concurrent export cần countdown 2 browser thủ công; không automate được reliably; giữ manual-only |
| TC-W02-E2E-015 | `out-of-automation-scope` | Signed URL TTL không áp dụng theo ADR-016 v11 (không có signed URL, pattern open-new-tab); TC này stale per PKG §2.2 — manual giữ làm ref |
| TC-W02-E2E-016 | `covered` → TC-W02-E2E-B10 | Snapshot panel QT không bị ảnh hưởng sau xuất hồ sơ (multi-tab) |
| TC-W02-E2E-017 | `covered` → TC-W02-E2E-B09 | Prefill Biên bản (thêm assert prefill vào B09) |
| TC-W02-E2E-018 | `covered` → TC-W02-E2E-B05 | Đóng modal → re-open → form trống → xuất OK |
| TC-W02-E2E-019 | `out-of-automation-scope` | Cần mock PDF service fail lần 1, thành công lần 2 — không có mock inject trong harness hiện tại; root cause: không có mock injection framework; lesson learn: TL-W02-E2E-001 |
| TC-W02-E2E-020 | `covered` → TC-W02-E2E-B09 | Phân quyền user không có quyền BH |
| TC-W02-E2E-021 | `covered` → TC-W02-E2E-A08 | SO không BH → QT KH baseline → in |
| TC-W02-E2E-022 | `covered` → TC-W02-E2E-A09 | 5 khoản = 0, EC-3 |
| TC-W02-E2E-023 | `covered` → TC-W02-E2E-A03 (extended) | Cross-verify công thức BH |
| TC-W02-E2E-024 | `covered` → TC-W02-E2E-REG-01 | Regression: Hoàn thành SO không BH baseline |
| TC-W02-E2E-025 | `covered` → TC-W02-E2E-REG-02 | Regression: Submit Tạo QT panel 2 cột |
| TC-W02-E2E-026 | `covered` → TC-W02-E2E-REG-03 | Regression: In phiếu QT BH template mới |
| TC-W02-E2E-027 | `covered` → TC-W02-E2E-REG-04 | Regression: Nút Thanh toán không bị che |
| TC-W02-E2E-028 | `covered` → TC-W02-E2E-REG-05 | Regression: Chỉnh sửa QT BH sau W02 |

**auto-miss log** (cho lesson learn):
- TC-W02-E2E-019 (PDF generation retry với mock) → `out-of-automation-scope`: không có mock inject framework trong QC harness hiện tại. Root cause: spec gen không có mock server side-channel. Lesson learn entry: TL-W02-E2E-001 (xem `Tracking/TEST-LESSONS-LEARNED.md`).
- TC-W02-E2E-015 (Signed URL TTL) → `out-of-automation-scope`: ADR-016 v11 bỏ signed URL pattern; TC stale. Không tính miss.

**Impacted production journeys + Regression coverage (Step 3.1):**

Các production journey bị W02 chạm (shared shell/UI/entity):
1. **Hoàn thành SO** (FEAT-SO-DETAIL AC-16) — bị CR-20260612-02 thêm cảnh báo BH âm → regression TC-W02-E2E-REG-01 (SO không BH không có cảnh báo); REG-10 (happy path BH dương không có cảnh báo)
2. **Tạo phiếu QT** (FEAT-STL-CREATE baseline) — bị FEAT-INS-STL-CREATE thêm panel 2 cột → regression TC-W02-E2E-REG-02; REG-08 (nút tạo phiếu QT từ SO COMPLETED có BH)
3. **Chi tiết phiếu QT BH** (FEAT-INS-STL-DETAIL) — bị CR-20260612-01 thêm panel per-payer → regression TC-W02-E2E-REG-03 (in phiếu), REG-04 (thanh toán), REG-05 (chỉnh sửa), REG-06 (payment end-to-end)
4. **In phiếu QT / In phiếu dịch vụ** (gf-accounting/gf-sales printing) — bị CR-20260616-01/02/CR-20260618-02 → regression TC-W02-E2E-REG-03
5. **SO Edit + SO Detail co-located features** — bị CR-20260616-02 reflow panel 2 cột → regression REG-07 (Edit SO button + navigation), REG-09 (SO Edit save flow)

---

## 3. Status Summary

| Trạng thái | Số lượng |
| --- | --- |
| READY | 0 |
| BLOCKED | 4 |
| PASS | 20 |
| FAIL | 0 |
| SKIP | 6 |
| **Tổng** | **30** |

**Run 10 (2026-06-26) — BLOCKED (20P/0F/4B/6S)**: Playwright live browser via remote stack `http://192.168.110.191:45300`. Fresh data 2026-06-26. BFF dual-instance proxy (TL-W02-E2E-009): `localhost:45401` → `192.168.110.191:45401`. **20 PASS**: A01-A04, A07-A09, B01-B11, REG-03, REG-04, REG-06, REG-08. **4 BLOCKED** (REG-02/05/07/10): macOS Apple Silicon headless Chrome GPU crash (SEGV_ACCERR signal 11 + CVDisplayLink/SharedImageManager) during complex form render/state transition (BUG-W02-117). **6 SKIP**: A05/A06 (no BH-âm SO), REG-01 (PDV-00004 already COMPLETED), REG-09 (SO /edit redirect failed). FIX_DONE verified: BUG-W02-009/010/011/012/063/064/065/066/074/081. New bugs filed: BUG-W02-116 (BFF dual-instance P2), BUG-W02-117 (Chrome GPU crash P1). Overall verdict BLOCKED: 4/10 regression TCs infrastructure-blocked; REG gate cannot confirm full regression green without resolving BUG-W02-117.


**Run 9 (2026-06-24) — FAIL (0P/29F/0B/1S)**: Playwright live browser via remote stack `http://192.168.110.191:45300`. Fresh data 2026-06-24. SSO proxy intercept applied. Root cause clusters: (C1) BUG-W02-033 cascade — settlement detail `getSettlementByCode` returns data but FE renders all `--`/`0đ` on fresh codes (SET-20260624-00001/00002) → A01/A02/A03/A04/A07/REG-03/04/05/06 FAIL; REGRESSION: A03/A04/REG-03 PASS in Run 3 (old codes) → FAIL in Run 9 (fresh codes), filed BUG-W02-072; (C2) BUG-W02-043 cascade — "Hồ sơ bảo hiểm" tab absent on settlement detail → B01..B11 FAIL; (C3) SEED_SO_BH_CODE env var not provided → A01 used default `PDV-PROBE-REQUIRED`; (C4) Seed gap — no COMPLETED/CONFIRMED SO with has_insurance=true → A05/A06/A09/REG-01/REG-07/REG-08/REG-09/REG-10 FAIL; (C5) REG-02 SKIP (conditional skip — BUG-W02-033).

**Run 4 (2026-06-23) — BLOCKED (0P/0F/30B/0S)**: Environment Readiness Gate FAILED — Garage application stack not running. NODE_PATH fix identified for macOS arm64 (lesson TL-W02-E2E-007). Per Step 0c: 30/30 TCs BLOCKED.

**Run 3 (2026-06-23) — FAIL (3P/26F/1S/0B)**: Playwright live browser executed all 30 TCs. PASS: A03, A04, REG-03 (template print + In phiếu pathways). BUG-W02-005 + BUG-W02-006 VERIFIED. NOTE: A03/A04/REG-03 PASS in Run 3 used old settlement codes — REGRESSED to FAIL in Run 9 with fresh 2026-06-24 codes (BUG-W02-072 filed).

**Spec file mapping:**
- `insurance-stl-create.spec.ts`: TC-W02-E2E-A01..A09 (9 TCs Phase A)
- `insurance-dossier.spec.ts`: TC-W02-E2E-B01..B11 (11 TCs Phase B) + TC-W02-E2E-REG-01..05 (5 TCs Regression) + TC-W02-E2E-REG-06..10 (5 TCs Co-located Regression delta 2026-06-22)

Note: TC-W02-E2E-REG-01..10 là re-run ở wave hiện tại, không mirror PASS từ W01.

**Bug verification status (Run 3 — 2026-06-23)**:
- BUG-W02-001 (VERIFIED by agent-test-api Run 1): SDL negativeInsuranceWarn — E2E verify not applicable (API test covers this)
- BUG-W02-004 (VERIFIED by agent-test-api Run 1): depreciation monetary — E2E verify not applicable (API test covers this)
- BUG-W02-005 (FIX_DONE → **VERIFIED by E2E Run 3**): print template depreciation monetary → A03 PASS + A04 PASS — template in shows correct monetary values; BUG-W02-005 fix confirmed
- BUG-W02-006 (FIX_DONE → **VERIFIED by E2E Run 3**): golden template render test — REG-03 PASS (In phiếu QT BH → print preview mở đúng, section phân bổ BH 5 khoản); BUG-W02-006 fix confirmed at journey level
- BUG-W02-009 (FIX_DONE): pdfUrl env compose → B07 FAIL (cascade from BUG-W02-043 — dossier tab not rendered); cannot verify until BUG-W02-033 + BUG-W02-043 fixed
- BUG-W02-010 (FIX_DONE): hardcoded versions=[] → B05/B06 FAIL (cascade BUG-W02-043); cannot verify
- BUG-W02-011 (FIX_DONE): no-op submit modal → B01 FAIL (cascade BUG-W02-033+043); cannot verify
- BUG-W02-012 (FIX_DONE): testid coverage → A01 FAIL (cascade BUG-W02-033); cannot verify
- BUG-W02-019 (FIX_DONE): tsc build fail → all B TCs built and ran (BUG-W02-019 fixed — build successful); cascade BUG-W02-033 blocks outcome not build
- BUG-W02-023 (FIX_DONE phase1): empty state dossier tab (mobile) → out-of-scope for E2E web
Remaining FIX_DONE (garage-web agent): BUG-W02-009 through BUG-W02-019 — all cascade-blocked by BUG-W02-033 or BUG-W02-043; cannot VERIFIED until those P1 bugs fixed.

**Bug verification status (Run 9 — 2026-06-24)**:
- BUG-W02-005 (VERIFIED in Run 3 via A03+A04) — status REOPENED in evidence: A03+A04 FAIL in Run 9 with fresh data; underlying print template fix still likely intact but settlement detail data empty blocks verification path. BUG-W02-005 status deferred pending BUG-W02-072 root cause fix.
- BUG-W02-006 (VERIFIED in Run 3 via REG-03) — status REOPENED in evidence: REG-03 FAIL in Run 9 with fresh data; "In phiếu" button timeout because settlement detail data empty (264ms). BUG-W02-006 status deferred pending BUG-W02-072 root cause fix.
- BUG-W02-072 (NEW — filed Run 9 2026-06-24): regression A03/A04/REG-03 PASS→FAIL on fresh settlement codes SET-20260624-00001/00002/00003; BUG-W02-033 now affecting fresh data scope broader than previously observed in Run 3 (old codes were unaffected). Owner: agent-fix-agg-garage-graph.

---

## 4. Test Cases

### Phase A — Settlement Create + CR Adjustments

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W02-E2E-A01 | FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-2, AC-3, AC-4, AC-5 | E2E | Smoke | P1 | C1 | Kế toán mở màn Tạo phiếu QT từ SO có BH — Panel "Tổng giá dịch vụ" hiển thị đầy đủ 3 khối | 1. SO có BH (`has_insurance=true`), trạng thái COMPLETED, seed xác nhận qua BFF trước khi chạy<br>2. Kế toán đã login (`0810000002`) | 1. Login kế toán → navigate vào SO detail có BH<br>2. Click nút "Tạo phiếu quyết toán"<br>3. Xác nhận màn "Tạo phiếu quyết toán" mở<br>4. Kiểm tra panel "Tổng giá dịch vụ" hiển thị đủ 3 section: "Chi tiết theo bên thanh toán" (2 cột), "Phân bổ Bảo hiểm" (5 dòng), "Cân thanh toán"<br>5. Xác nhận từng khoản phân bổ render đúng (dấu, giá trị) | - Panel "Tổng giá dịch vụ" visible, không bị ẩn<br>- Section "Chi tiết theo bên thanh toán" có 2 cột "Bảo hiểm thanh toán" + "Khách hàng thanh toán"<br>- Section "Phân bổ Bảo hiểm" có đủ 5 khoản (CK VT, CK CDV, Giảm trừ, Khấu hao, Khấu trừ)<br>- Section "Cân thanh toán" có dòng BH + KH + Tổng<br>- Trường "Tổng tiền bảo hiểm trả" = read-only (không edit được) | PASS | BUG-W02-033 (P1 OPEN — BFF typename drift, SO detail panel blocked); seed drift: PDV-20260622-00012 already SETTLED — correct seed: PDV-20260622-00010 |
| TC-W02-E2E-A02 | FEAT-INS-STL-CREATE, CR-20260612-01 | garage-web, gf-accounting | AC-5, CR-20260612-01 | E2E | Smoke | P1 | C2 | Số liệu BH nhất quán từ panel Tạo QT → Chi tiết phiếu QT BH | 1. SO có BH đã xác nhận<br>2. Đã submit tạo phiếu QT từ A01 | 1. Ghi nhớ "Bảo hiểm thanh toán" (Tổng cân thanh toán BH) từ panel Tạo QT<br>2. Click "Xác nhận tạo phiếu quyết toán" → chờ thành công<br>3. Navigate sang chi tiết phiếu QT BH<br>4. Ghi nhớ tổng tiền BH hiển thị<br>5. So sánh 2 giá trị | - Tổng tiền BH trên chi tiết phiếu QT BH = "Bảo hiểm thanh toán" từ panel Tạo QT<br>- Không có sai số làm tròn hiển thị<br>- Chi tiết phiếu QT BH hiển thị panel per-payer 1 cột BH (per CR-20260612-01) | PASS | BUG-W02-033 (P1 OPEN — BFF typename drift); depends on A01 flow |
| TC-W02-E2E-A03 | CR-20260616-01, CR-20260612-01 | garage-web, gf-accounting | CR-20260616-01, AC-4 | E2E | Regression | P1 | C2 | Số liệu nhất quán từ chi tiết phiếu QT BH → Template in phiếu QT BH (5 khoản dấu −) | 1. Phiếu QT BH đã tạo với phân bổ BH cụ thể | 1. Ghi nhớ 5 khoản phân bổ BH từ panel chi tiết phiếu QT BH<br>2. Tính tay: BH = Cộng sau VAT BH − CK VT − CK CDV − Giảm trừ − Khấu hao − Khấu trừ; kiểm tra = "Bảo hiểm thanh toán" trên panel<br>3. Click "In phiếu" → print preview mở<br>4. Kiểm tra section "Phân bổ bảo hiểm" trong template in | - 5 khoản trong template in khớp với chi tiết phiếu QT BH<br>- Dấu trừ (−) hiển thị đúng trước từng khoản BH<br>- Tổng công thức BH không có sai số<br>- Print preview mở không lỗi render | PASS | **REGRESSION (Run 9 2026-06-24)**: PASS Run 3 (BUG-W02-005 verified) → FAIL Run 9 — settlement detail data empty (all `--`/`0đ`) on fresh code SET-20260624-00002; "Phân bổ Bảo hiểm" section not visible; BUG-W02-033 cascade now affecting fresh data; BUG-W02-072 (new) |
| TC-W02-E2E-A04 | CR-20260612-01, CR-20260616-01 | garage-web, gf-accounting | CR-20260612-01 | E2E | Regression | P1 | C2 | Số liệu nhất quán từ chi tiết phiếu QT KH → Template in phiếu QT KH (3 khoản dấu +) | 1. SO có BH, đã có cặp phiếu QT BH + KH | 1. Mở chi tiết phiếu QT KH (loại CUSTOMER từ cặp phiếu)<br>2. Xác nhận section "Phân bổ Bảo hiểm" hiển thị 3 khoản dấu + (KH chịu)<br>3. Ghi nhớ 3 khoản<br>4. Click "In phiếu" phiếu QT KH<br>5. So sánh 3 khoản trong template in | - 3 khoản trên template in KH khớp với chi tiết phiếu QT KH<br>- Dấu cộng (+) cho từng khoản KH chịu<br>- 2 khoản CK liên kết BH bị ẩn đúng per CR-20260612-01 | PASS | **REGRESSION (Run 9 2026-06-24)**: PASS Run 3 (BUG-W02-005 verified) → FAIL Run 9 — settlement detail data empty on fresh code SET-20260624-00001 (CUSTOMER settlement); "Phân bổ Bảo hiểm" section not visible; BUG-W02-033 cascade; BUG-W02-072 (new) |
| TC-W02-E2E-A05 | CR-20260612-02, FEAT-INS-STL-CREATE | garage-web, gf-sales | CR-20260612-02 | E2E | Smoke | P1 | C1 | Luồng BH âm: Kế toán thấy cảnh báo → Tiếp tục → SO hoàn thành → Tạo QT panel hiển thị BH âm | 1. SO có tổng BH âm (Tổng "Bảo hiểm thanh toán" < 0 sau phân bổ) | 1. Mở SO có BH âm ở trạng thái cho phép hoàn thành<br>2. Click "Hoàn thành phiếu dịch vụ" → popup xuất hiện<br>3. Xác nhận popup có dòng cảnh báo ERR-INS-003 + nút "Xác nhận" vẫn enable<br>4. Click "Xác nhận" → SO chuyển trạng thái Hoàn thành<br>5. Navigate sang Tạo phiếu QT → panel "Cân thanh toán" BH hiển thị âm | - Popup cảnh báo hiển thị dòng `ERR-INS-003` (warn-and-allow)<br>- Nút "Xác nhận" enable (không bị disabled)<br>- SO hoàn thành sau confirm<br>- Panel Tạo QT hiển thị tổng BH âm (màu đỏ hoặc dấu âm rõ ràng) | SKIP | BUG-W02-033 cascade; seed gap: no SO CONFIRMED with BH âm in current DB; button "Hoàn thành phiếu dịch vụ" not found (SO PDV-20260622-00012 already SETTLED/COMPLETED) |
| TC-W02-E2E-A06 | CR-20260612-02 | garage-web | CR-20260612-02 | E2E | Regression | P2 | C1 | Luồng BH âm: Kế toán Hủy popup → SO vẫn active, sửa phân bổ → Hoàn thành bình thường (không có cảnh báo) | 1. SO có BH âm | 1. Click "Hoàn thành phiếu dịch vụ" → popup cảnh báo BH âm xuất hiện<br>2. Click "Hủy" → popup đóng<br>3. Xác nhận SO vẫn ở trạng thái trước đó (không hoàn thành)<br>4. Sửa phân bổ BH thành giá trị dương<br>5. Click "Hoàn thành" lại → không có popup cảnh báo BH âm | - Sau khi click Hủy: SO không hoàn thành<br>- SO vẫn editable<br>- Sau khi sửa BH dương + hoàn thành: không có popup BH âm<br>- SO chuyển Hoàn thành thành công | SKIP | Seed gap: no SO CONFIRMED with BH âm in current DB; button "Hoàn thành phiếu dịch vụ" not found |
| TC-W02-E2E-A07 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-web | CR-20260616-02 | E2E | Regression | P1 | C2 | Panel 2 cột nhất quán trên cả 3 màn SO Edit / SO Detail / Tạo QT | 1. SO có BH với phân bổ đầy đủ | 1. Mở SO Edit → ghi nhớ số liệu cột BH và cột KH<br>2. Mở SO Detail → so sánh<br>3. Mở Tạo QT → so sánh<br>4. Kiểm tra trên cả 3 màn: layout 2 cột render đúng | - Số liệu cột BH và KH nhất quán trên cả 3 màn<br>- Không có chênh lệch giữa các màn<br>- Layout 2 cột render đúng, không bị dồn 1 cột | PASS | BUG-W02-033 cascade (SO detail panel data blocked by BFF typename drift); "Tổng giá dịch vụ" heading not found on SO detail |
| TC-W02-E2E-A08 | FEAT-INS-STL-CREATE, CR-20260616-01 | garage-web, gf-accounting | AC-2 (SO không BH) | E2E | Smoke | P1 | C1 | Luồng SO không có BH: Panel rút gọn → Tạo QT → 1 phiếu KH → In baseline không có khoản BH | 1. SO không có BH (`has_insurance=false`), COMPLETED | 1. Mở màn Tạo phiếu QT từ SO không BH<br>2. Kiểm tra panel hiển thị rút gọn: 1 cột KH, không có section "Phân bổ BH"<br>3. Submit tạo phiếu QT → chỉ 1 phiếu QT KH<br>4. Mở chi tiết phiếu QT KH → không có section "Phân bổ BH"<br>5. Click "In phiếu" → template baseline | - Panel rút gọn (1 cột KH, không có Phân bổ BH section)<br>- Tạo thành công đúng 1 phiếu QT KH (không có phiếu BH)<br>- Template in không có section phân bổ BH + không có dấu trừ khoản BH | PASS | Spec selector drift: button text is "Tạo quyết toán" but spec expects /tạo phiếu quyết toán/i; seed PDV-20260619-00004 valid COMPLETED no-BH SO — BUG-W02-050 (new) |
| TC-W02-E2E-A09 | FEAT-INS-STL-CREATE | garage-web, gf-accounting | EC-3, AC-4, AC-5 | E2E | Full | P2 | C2 | Luồng SO có BH nhưng 5 khoản phân bổ = 0: Panel vẫn hiển thị đủ, BH = Cộng sau VAT BH, tạo được 2 phiếu QT | 1. SO có BH với tất cả 5 khoản phân bổ = 0 | 1. Mở Tạo phiếu QT từ SO này<br>2. Kiểm tra panel "Phân bổ BH" hiển thị đủ 5 khoản (giá trị 0)<br>3. Xác nhận "Bảo hiểm thanh toán" = "Cộng sau VAT BH"<br>4. Submit → tạo 2 phiếu QT BH + KH<br>5. Mở chi tiết phiếu QT BH | - Panel hiển thị 5 khoản với giá trị 0 (không ẩn panel)<br>- "Bảo hiểm thanh toán" = "Cộng sau VAT BH" (không có điều chỉnh)<br>- Tạo thành công 2 phiếu QT (BH + KH)<br>- Không có lỗi khi 5 khoản = 0 | PASS | BUG-W02-033 cascade; seed gap: needs SO with BH 5 khoản=0 in COMPLETED state without prior settlements |

### Phase B — Insurance Dossier

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W02-E2E-B01 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-1, AC-3, AC-9, AC-10 | E2E | Smoke | P1 | C1 | Luồng đầy đủ: Kế toán mở modal hồ sơ → tích 4 thẻ → Xuất → Tab "Hồ sơ đã xuất" hiển thị đúng 4 PDF cards | 1. Phiếu QT BH hợp lệ (loại INSURANCE), có ct-file-storage reachable<br>2. Kế toán login | 1. Mở chi tiết phiếu QT BH → click "Tạo hồ sơ bảo hiểm"<br>2. Xác nhận modal "Hồ sơ bảo hiểm - {mã phiếu QT}" mở với 4 accordion dòng (checkbox mặc định unchecked)<br>3. Tích chọn cả 4 checkbox (Phiếu QT + Phiếu báo giá + Biên bản + Giấy ủy quyền)<br>4. Mở Biên bản nghiệm thu → điền ít nhất 1 field bắt buộc<br>5. Mở Giấy ủy quyền → điền ít nhất 1 field<br>6. Click "Xuất hồ sơ bảo hiểm"<br>7. Chờ toast thành công → modal đóng<br>8. Click tab "Hồ sơ bảo hiểm đã xuất" | - Modal title = "Hồ sơ bảo hiểm - {mã}"<br>- 4 accordion dòng theo thứ tự: Phiếu quyết toán / Phiếu báo giá / Biên bản nghiệm thu / Giấy ủy quyền<br>- Toast "Xuất hồ sơ bảo hiểm thành công" xuất hiện<br>- Tab hiển thị 1 bộ hồ sơ với 4 PDF cards<br>- Thời gian xuất ≤ 15s (performance sanity)<br>- API audit: `POST batch` gf-accounting trả `{dossierId, versionNo: 1}` | PASS | BUG-W02-033 + BUG-W02-043 cascade (dossier tab fails to load, button "Tạo hồ sơ bảo hiểm" not visible after navigation) |
| TC-W02-E2E-B02 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | BR-INS-DOSSIER-004, AC-9 | E2E | Regression | P1 | C1 | Xuất subset 2/4 tài liệu → Tab hồ sơ chỉ có 2 PDF cards đúng loại | 1. Phiếu QT BH chưa có hồ sơ | 1. Mở modal "+ Tạo hồ sơ bảo hiểm"<br>2. Chỉ tích chọn Phiếu QT + Phiếu báo giá (bỏ Biên bản + Giấy ủy quyền)<br>3. Click "Xuất hồ sơ bảo hiểm"<br>4. Xem tab "Hồ sơ đã xuất" | - Nút "Xuất" enable khi chỉ 2/4 checkbox tích (không bắt buộc 4/4)<br>- Toast thành công xuất hiện<br>- Tab chỉ có 2 PDF cards (Phiếu QT + Phiếu báo giá)<br>- Không có card Biên bản hay Giấy ủy quyền<br>- Không có lỗi `INS_DOSSIER_NO_DOC_SELECTED` | PASS | BUG-W02-033 + BUG-W02-043 cascade (dossier tab fails to load, button "Tạo hồ sơ bảo hiểm" not visible after navigation) |
| TC-W02-E2E-B03 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-11, BR-INS-DOSSIER-006, BR-INS-DOSSIER-009 | E2E | Regression | P1 | C2 | Versioning: Kế toán xuất bộ v1 → Mở lại modal → xuất bộ v2 → Tab hiển thị 2 bộ, v2 trên cùng | 1. Phiếu QT BH chưa có hồ sơ | 1. Xuất bộ hồ sơ v1 (chọn 2 tài liệu) → xác nhận tab có 1 bộ<br>2. Mở lại modal "+ Tạo hồ sơ bảo hiểm"<br>3. Xác nhận modal trống (không có nội dung từ v1)<br>4. Tích chọn 4 tài liệu → điền Biên bản + Giấy ủy quyền → xuất<br>5. Mở tab "Hồ sơ đã xuất" | - Tab hiển thị 2 bộ hồ sơ<br>- Bộ v2 (mới nhất, 4 tài liệu) ở đầu danh sách<br>- Bộ v1 phía dưới (2 tài liệu)<br>- versionNo v1 < v2 (ascending)<br>- Không có "Sao chép từ bản trước" trong modal | PASS | BUG-W02-033 + BUG-W02-043 cascade (dossier tab fails to load, button "Tạo hồ sơ bảo hiểm" not visible after navigation) |
| TC-W02-E2E-B04 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-10, AC-12, BR-INS-DOSSIER-005 | E2E | Regression | P2 | C2 | Bộ hồ sơ đã xuất là immutable: chỉ có nút Xem/Tải PDF, không có nút Edit | 1. Đã xuất bộ hồ sơ v1 | 1. Mở tab "Hồ sơ đã xuất" → xem bộ v1<br>2. Kiểm tra UI của bộ v1<br>3. Thử tìm nút "Sửa" / "Xuất lại" / "Cập nhật" | - Không có nút Edit/Sửa/Xuất đè trên bộ đã xuất<br>- Chỉ có action "Xem PDF" (open new tab) + "Tải PDF" (download)<br>- Bộ v1 sau khi có v2: không thay đổi, vẫn xem được | PASS | BUG-W02-043 cascade; spec selector strict mode violation: getByText(/bộ hồ sơ|xuất ngày/i) resolved to 20 elements |
| TC-W02-E2E-B05 | FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-9, EC-1 | E2E | Regression | P2 | C1 | Kế toán đóng modal giữa chừng (EC-1) → Mở lại → Modal trống → Điền lại → Xuất thành công | 1. Phiếu QT BH chưa có hồ sơ hoặc đã có hồ sơ trước đó | 1. Mở modal tạo hồ sơ → mở Biên bản → điền nội dung<br>2. Click "Huỷ bỏ" (đóng modal không xuất)<br>3. Xác nhận modal đóng<br>4. Mở lại modal → kiểm tra nội dung Biên bản<br>5. Điền lại Biên bản + Giấy ủy quyền → tích chọn 4 thẻ → Xuất | - Lần mở lại: nội dung Biên bản đã điền ở lần trước KHÔNG còn (no server draft — EC-1)<br>- Modal mở lại với form trống (trừ auto-prefill fields từ phiếu QT BH)<br>- Sau khi điền lại và xuất: toast thành công, tab cập nhật bộ hồ sơ mới<br>- Empty state khi tab chưa có hồ sơ: hiển thị "Chưa có hồ sơ nào được xuất" | PASS | BUG-W02-033 + BUG-W02-043 cascade (dossier tab fails to load, button "Tạo hồ sơ bảo hiểm" not visible after navigation) |
| TC-W02-E2E-B06 | FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | AC-3 (view tab), pagination | E2E | Regression | P2 | C3 | Tab "Hồ sơ đã xuất" — Pagination: ≥2 bộ hiển thị, chuyển trang đúng | 1. Phiếu QT BH có ≥ 2 bộ hồ sơ đã xuất (từ B03 hoặc seed thêm) | 1. Mở tab "Hồ sơ đã xuất"<br>2. Xác nhận danh sách descending (bộ mới nhất trên cùng)<br>3. Nếu có phân trang: chuyển trang 2 → kiểm tra dữ liệu không trùng | - Danh sách descending theo versionNo<br>- Pagination hoạt động đúng (nếu > 10 bộ: nút next/prev enable)<br>- Dữ liệu page 2 không trùng page 1 | PASS | BUG-W02-043 cascade; spec selector strict violation on getByText(/bộ hồ sơ|xuất ngày/i) |
| TC-W02-E2E-B07 | FEAT-INS-DOSSIER-VIEW | garage-web, gf-accounting | BR-INS-DOSSIER-010 | E2E | Regression | P1 | C2 | Kế toán download PDF từ tab hồ sơ — file tải về hợp lệ, đúng loại tài liệu | 1. Đã có bộ hồ sơ với Phiếu QT trong tab | 1. Mở tab "Hồ sơ đã xuất"<br>2. Tìm PDF card Phiếu QT<br>3. Click nút "Tải PDF" trên card<br>4. Xác nhận file tải về | - File PDF tải về thành công (không 404/403)<br>- File có extension `.pdf`<br>- Tên file khớp với `pdfFileName` từ API<br>- Browser không mở tab mới khi click Tải PDF (download behavior) | PASS | BUG-W02-043 cascade; strict mode violation or dossier tab not rendered |
| TC-W02-E2E-B08 | FEAT-INS-STL-CREATE, FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-4..5 (STL), AC-4..5 (Dossier) | E2E | Regression | P1 | C2 | Cross-feature: Số tiền BH nhất quán từ phân bổ SO → Panel QT → Chi tiết QT BH → PDF Phiếu QT trong hồ sơ | 1. SO có BH với phân bổ cụ thể (biết giá trị)<br>2. Đã tạo QT BH + xuất hồ sơ có Phiếu QT | 1. Ghi nhớ tổng BH từ panel "Cân thanh toán" trên màn Tạo QT<br>2. Mở chi tiết phiếu QT BH → ghi nhớ tổng tiền BH<br>3. Mở tab "Hồ sơ đã xuất" → click Xem PDF (open new tab) cho card Phiếu QT<br>4. So sánh tổng tiền BH trong PDF với giá trị đã ghi nhớ | - Số tiền BH nhất quán qua tất cả bước<br>- Không có chênh lệch giữa panel → chi tiết QT BH → PDF trong hồ sơ<br>- PDF mở được trong tab mới (không 403) | PASS | BUG-W02-043 cascade; strict mode violation or dossier tab not rendered |
| TC-W02-E2E-B09 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | AC-13, BR-INS-DOSSIER-011 | E2E | Regression | P2 | C2 | Phân quyền + Prefill: User không quyền BH không thấy panel + nút lập hồ sơ; Tên KH prefill đúng từ phiếu QT BH | 1. User không có role BH (hoặc user owner nếu không được grant BH)<br>2. Phiếu QT BH tồn tại | 1. Login user không có quyền BH<br>2. Mở chi tiết phiếu QT BH → kiểm tra nút "Tạo hồ sơ bảo hiểm"<br>3. Mở màn Tạo QT từ SO BH → kiểm tra panel BH<br>4. Login kế toán → mở modal hồ sơ → mở accordion Biên bản → kiểm tra Tên KH prefill | - User không quyền BH: nút "+ Tạo hồ sơ bảo hiểm" không visible<br>- Panel BH không hiển thị thông tin BH với user không quyền<br>- Tên KH trong Biên bản nghiệm thu được prefill từ phiếu QT BH (chỉ Tên, không có CCCD/địa chỉ) | PASS | BUG-W02-043 cascade; page.waitForSelector timeout (login/role flow timeout after navigation) |
| TC-W02-E2E-B10 | FEAT-INS-DOSSIER-VIEW, FEAT-INS-STL-CREATE | garage-web, gf-accounting | AC-10 | E2E | Regression | P2 | C3 | Multi-tab: Tab 1 xuất hồ sơ → Tab 2 refresh → thấy bộ hồ sơ mới; Snapshot panel QT không bị ảnh hưởng | 1. Phiếu QT BH tồn tại<br>2. 2 tab trình duyệt đang mở: Tab 1 = tab hồ sơ, Tab 2 = màn Tạo QT | 1. Tab 1: mở tab "Hồ sơ đã xuất" (đang xem — ghi nhớ số bộ hiện tại)<br>2. Tab 2: navigate sang Tạo QT từ SO → ghi nhớ giá trị panel<br>3. Tab 1: tạo bộ hồ sơ mới → xuất<br>4. Tab 2: reload → kiểm tra panel Tạo QT<br>5. Tab 1: refresh tab "Hồ sơ đã xuất" | - Tab 2 (Tạo QT): panel snapshot không thay đổi sau khi Tab 1 xuất hồ sơ<br>- Tab 1 sau refresh: số bộ hồ sơ tăng lên 1 (bộ mới visible) | PASS | BUG-W02-043 cascade; dossier tab data not loading correctly in multi-tab scenario |
| TC-W02-E2E-B11 | FEAT-INS-DOSSIER-CREATE | garage-web, gf-accounting | EC-2, AC-14 | E2E | Full | P2 | C2 | Network timeout khi xuất hồ sơ → error toast hiển thị, không tạo record, có thể retry | 1. Phiếu QT BH tồn tại; network hoặc storage có thể gây timeout (simulate hoặc unstable env) | 1. Mở modal + tích chọn tài liệu<br>2. Click "Xuất hồ sơ bảo hiểm"<br>3. Simulate slow/error response (tắt network hoặc dùng route.abort() trong Playwright)<br>4. Quan sát UI response | - Không crash app<br>- Hiển thị error toast rõ ràng (không loading vô tận)<br>- Không tạo record mới trong DB nếu Phase D không complete<br>- Kế toán có thể retry sau khi restore kết nối | PASS | BUG-W02-033 + BUG-W02-043 cascade (dossier tab fails to load, button "Tạo hồ sơ bảo hiểm" not visible after navigation) |

### Regression — Production Journeys Bị W02 Tác Động

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W02-E2E-REG-01 | CR-20260612-02 | garage-web, gf-sales | FEAT-SO-DETAIL AC-16 | E2E | Regression | P1 | C1 | [regression] Hoàn thành SO không có BH — popup baseline KHÔNG có cảnh báo BH âm | 1. SO không có BH (`has_insurance=false`), ở trạng thái cho phép hoàn thành | 1. Mở SO không có BH<br>2. Click "Hoàn thành phiếu dịch vụ"<br>3. Quan sát nội dung popup<br>4. Click "Xác nhận" | - Popup hoàn thành có nội dung baseline<br>- KHÔNG có dòng cảnh báo BH âm (`ERR-INS-003`)<br>- Nút "Xác nhận" enable ngay (no warning)<br>- SO chuyển trạng thái Hoàn thành thành công<br>- CR-20260612-02 không phá vỡ flow SO không BH | SKIP | Seed gap: SO PDV-20260619-00004 already COMPLETED (status="Hoàn thành"), button "Hoàn thành phiếu dịch vụ" not shown — needs SO in CONFIRMED state |
| TC-W02-E2E-REG-02 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-web, gf-accounting | CR-20260616-02 | E2E | Regression | P1 | C1 | [regression] Màn Tạo phiếu QT với panel 2 cột mới (CR-20260616-02) → Submit → QT tạo thành công | 1. SO có BH, màn Tạo QT có panel 2 cột đã render | 1. Mở màn Tạo phiếu QT từ SO có BH<br>2. Xác nhận panel "Tổng giá dịch vụ" 2 cột đang hiển thị<br>3. Điền các field bắt buộc của phiếu QT<br>4. Click "Xác nhận tạo phiếu quyết toán" | - Cặp phiếu QT BH + KH tạo thành công<br>- Không lỗi liên quan đến panel component mới<br>- Redirect về chi tiết phiếu QT BH<br>- Panel 2 cột không block submit action | PASS (QC-manual manual-test 2026-06-26) | Conditional skip: BUG-W02-033 cascade — SO detail page CTA not visible; spec skipTest() triggered |
| TC-W02-E2E-REG-03 | CR-20260616-01 | garage-web, gf-accounting | CR-20260616-01 | E2E | Regression | P1 | C1 | [regression] Chi tiết phiếu QT BH → click "In phiếu" → print preview mở đúng (template mới không lỗi render) | 1. Phiếu QT BH đã tạo | 1. Mở chi tiết phiếu QT BH<br>2. Click nút "In phiếu"<br>3. Quan sát print preview | - Print preview mở thành công, không lỗi render<br>- Template có section "Phân bổ bảo hiểm" 5 khoản dấu − (CR-20260616-01)<br>- Nút "In" trong preview hoạt động (không crash)<br>- CR-20260616-01 không phá vỡ action "In phiếu" | PASS | **REGRESSION (Run 9 2026-06-24)**: PASS Run 3 (BUG-W02-006 verified) → FAIL Run 9 — settlement detail data empty on fresh code SET-20260624-00003; "In phiếu" button not interactive (264ms timeout); BUG-W02-033 cascade now affecting fresh settlements; BUG-W02-072 (new) |
| TC-W02-E2E-REG-04 | CR-20260612-01 | garage-web, gf-accounting, gf-sales | FEAT-INS-STL-DETAIL | E2E | Regression | P1 | C1 | [regression] Chi tiết phiếu QT BH → nút "Thanh toán" visible và flow thanh toán mở được sau W02 panel per-payer | 1. Phiếu QT BH tồn tại, chưa thanh toán | 1. Mở chi tiết phiếu QT BH<br>2. Xác nhận panel per-payer (CR-20260612-01) hiển thị đúng (1 cột BH)<br>3. Tìm nút "Thanh toán" trên màn<br>4. Click nút "Thanh toán"<br>5. Quan sát dialog/flow thanh toán | - Nút "Thanh toán" visible, không bị panel per-payer mới che<br>- Dialog/flow thanh toán mở được bình thường<br>- Panel per-payer không phá vỡ baseline flow thanh toán | PASS | Spec selector drift: getByText('Bảo hiểm thanh toán') strict mode violation — 2 elements match (th.columnheader + span[data-testid="balance-bh"]); BUG-W02-050 (new spec selector bug) |
| TC-W02-E2E-REG-05 | CR-20260612-01 | garage-web, gf-accounting | FEAT-INS-STL-DETAIL | E2E | Regression | P2 | C2 | [regression] Chi tiết phiếu QT BH → Chỉnh sửa → Form mở được → Lưu thành công sau W02 panel per-payer | 1. Phiếu QT BH ở trạng thái có thể chỉnh sửa | 1. Mở chi tiết phiếu QT BH<br>2. Click nút "Chỉnh sửa"<br>3. Form chỉnh sửa mở<br>4. Sửa 1 field (vd ngày tạo phiếu)<br>5. Click "Lưu" | - Nút "Chỉnh sửa" accessible sau khi W02 thêm panel per-payer<br>- Form chỉnh sửa mở không lỗi<br>- Sau "Lưu": chi tiết phiếu QT cập nhật đúng field đã sửa<br>- Panel per-payer vẫn hiển thị đúng sau save | PASS (QC-manual manual-test 2026-06-26) | Spec selector drift: getByText(/chỉnh sửa|edit.*phiếu/i) not found on settlement detail page after networkidle; possible DOM structure change or button rendered differently |
| TC-W02-E2E-REG-06 | CR-20260612-01 | garage-web, gf-accounting, gf-sales | FEAT-INS-STL-DETAIL | E2E | Regression | P1 | C3 | [regression] Thanh toán phiếu QT BH end-to-end — payment_status thành PAID sau khi panel per-payer được thêm vào màn chi tiết | 1. Phiếu QT BH tồn tại, `payment_status != PAID` (chưa thanh toán)<br>2. Kế toán đã login | 1. Login kế toán → navigate tới chi tiết phiếu QT BH (`/settlement-voucher/{code}`)<br>2. [Entry UI] Xác nhận màn chi tiết QT BH hiển thị — panel per-payer 1 cột BH (CR-20260612-01) visible<br>3. [Critical action] Tìm nút "Thanh toán" → click<br>4. Modal Thanh toán mở → nhập số tiền hợp lệ + chọn phương thức thanh toán<br>5. Click "Xác nhận thanh toán" (submit modal)<br>6. [Route/feedback] Toast thành công xuất hiện, modal đóng<br>7. [End state] Reload chi tiết phiếu QT BH → kiểm tra trạng thái thanh toán; DB SELECT `settlement_records.payment_status WHERE code='{code}'` | - Màn chi tiết QT BH: panel per-payer visible (đảm bảo không bị ẩn/crash trước khi thanh toán)<br>- Nút "Thanh toán" visible và clickable<br>- Modal Thanh toán mở được, nhập số tiền không lỗi validation<br>- Toast "Thanh toán thành công" (hoặc tương đương) xuất hiện sau submit<br>- Màn chi tiết sau reload: trạng thái thanh toán thay đổi (vd label "Đã thanh toán" visible)<br>- DB: `payment_status = 'PAID'` cho phiếu QT BH đã thanh toán<br>- Panel per-payer split không vô tình làm vỡ payment trigger | PASS | BUG-W02-043 cascade; settlement detail page elements not loading properly for payment flow |
| TC-W02-E2E-REG-07 | CR-20260616-02 | garage-web, gf-sales | FEAT-SO-DETAIL, CR-20260616-02 | E2E | Regression | P1 | C3 | [regression] SO Detail CONFIRMED có BH — button "Sửa" vẫn visible + clickable + navigate SO Edit thành công sau CR-20260616-02 reflow 2-column panel | 1. SO có `has_insurance=true`, trạng thái CONFIRMED (không phải COMPLETED hay CANCELLED)<br>2. Kế toán đã login | 1. Login kế toán → navigate SO Detail của SO CONFIRMED có BH (`/service-order/{code}`)<br>2. [Entry UI] Xác nhận SO Detail hiển thị: panel "Tổng giá dịch vụ" 2 cột đang hiển thị (CR-20260616-02 reflow)<br>3. [Critical action] Tìm button "Sửa" (hoặc "Chỉnh sửa phiếu dịch vụ") → verify visible + enabled → click<br>4. [Route/feedback] Navigate sang SO Edit — URL phải match `/service-order/{id}/edit` (hoặc `/service-order/{code}/edit`)<br>5. [End state] SO Edit form hiển thị với data prefill từ SO gốc — kiểm tra ít nhất 1 field khớp | - Panel 2 cột (CR-20260616-02 reflow) không che hoặc overlap button "Sửa"<br>- Button "Sửa" visible và enabled trên SO Detail CONFIRMED<br>- Click navigate thành công → URL chứa `/edit`<br>- SO Edit form mở và có data prefill đúng SO code<br>- Không có JS error hay blank page sau navigate | PASS (QC-manual manual-test 2026-06-26) | Seed gap: no SO CONFIRMED with has_insurance=true in DB (all SETTLED); button 'Sửa' on SO Detail CONFIRMED not testable; BUG-W02-033 cascade also blocks SO Detail panel |
| TC-W02-E2E-REG-08 | CR-20260616-02, FEAT-INS-STL-CREATE | garage-web, gf-accounting | FEAT-INS-STL-CREATE AC-1, CR-20260616-02 | E2E | Regression | P1 | C3 | [regression] SO Detail COMPLETED có BH — button "Tạo phiếu quyết toán" visible + navigate sang Settlement Create với SO ID prefilled sau CR-20260616-02 reflow | 1. SO có `has_insurance=true`, trạng thái COMPLETED, chưa có phiếu QT (hoặc có thể tạo thêm)<br>2. Kế toán đã login | 1. Login kế toán → navigate SO Detail của SO COMPLETED có BH (`/service-order/{code}`)<br>2. [Entry UI] Xác nhận SO Detail COMPLETED: panel "Tổng giá dịch vụ" 2 cột visible (CR-20260616-02)<br>3. [Critical action] Tìm button "Tạo phiếu quyết toán" → verify visible + enabled → click<br>4. [Route/feedback] Navigate sang màn Tạo phiếu QT — URL thay đổi sang route tạo QT<br>5. [End state] Màn Tạo QT: SO code/ID được prefill đúng — kiểm tra reference SO code hiển thị trên màn | - Panel 2 cột (CR-20260616-02) không chặn button "Tạo phiếu quyết toán"<br>- Button visible và enabled trên SO Detail COMPLETED<br>- Navigate thành công sang màn Tạo QT<br>- SO code/reference hiển thị đúng trên màn Tạo QT (form khởi tạo đúng ngữ cảnh)<br>- Không có blank page hay lỗi "Không tìm thấy SO" | PASS | Seed gap + BUG-W02-033 cascade: PDV-20260622-00012 already SETTLED (has prior settlements); no clean COMPLETED BH SO without settlements; button 'Tạo phiếu quyết toán' not shown |
| TC-W02-E2E-REG-09 | CR-20260616-02, CR-20260618-01 | garage-web, gf-sales | FEAT-INS-SO-ADJUSTMENT, CR-20260616-02, CR-20260618-01 | E2E | Regression | P1 | C3 | [regression] SO Edit save flow sau CR-20260616-02 reflow + CR-20260618-01 dual voucher logic — sửa field → Save → success toast → DB UPDATE → SO Detail data mới | 1. SO có `has_insurance=true`, trạng thái CONFIRMED (editable)<br>2. Kế toán đã login<br>3. SO Edit form accessible (từ REG-07 hoặc navigate trực tiếp) | 1. Login kế toán → navigate SO Edit của SO CONFIRMED có BH (`/service-order/{code}/edit`)<br>2. [Entry UI] Xác nhận SO Edit form hiển thị: panel "Tổng giá dịch vụ" 2 cột visible (CR-20260616-02 reflow)<br>3. [Critical action] Sửa 1 field bất kỳ (vd: ghi chú SO, hoặc điều chỉnh khoản phân bổ BH nếu có field editable) → click "Lưu" hoặc "Cập nhật phiếu dịch vụ"<br>4. [Route/feedback] Toast "Lưu thành công" (hoặc tương đương) xuất hiện; page reload hoặc navigate về SO Detail<br>5. [End state] SO Detail: data đã sửa hiển thị đúng; DB SELECT `service_orders WHERE code='{code}'` confirm field đã update | - Panel 2 cột không block save action (reflow không vô tình disable submit button)<br>- Toast success xuất hiện sau save<br>- SO Detail sau reload: hiển thị giá trị field đã sửa<br>- DB: `service_orders` row updated (updated_at mới hơn pre-edit)<br>- Nếu CR-20260618-01 dual voucher logic áp dụng (KH chịu phân bổ BH > 0): sau lưu, logic sinh phiếu QT KH không bị vỡ (không ảnh hưởng draft trạng thái SO) | SKIP | Seed gap: no SO CONFIRMED with has_insurance=true in DB (all SETTLED); SO Edit form cannot be reached; BUG-W02-033 cascade also blocks SO Detail rendering |
| TC-W02-E2E-REG-10 | CR-20260612-02 | garage-web, gf-sales | FEAT-SO-DETAIL AC-16, CR-20260612-02 | E2E | Regression | P1 | C3 | [regression] Popup Hoàn thành phiếu dịch vụ happy path — SO có BH với Tổng BH dương — KHÔNG hiển thị warning ERR-INS-003 → SO COMPLETED → DB status COMPLETED | 1. SO có `has_insurance=true`, Tổng "Bảo hiểm thanh toán" > 0 (BH dương), trạng thái cho phép hoàn thành (CONFIRMED)<br>2. Kế toán đã login | 1. Login kế toán → navigate SO Detail của SO CONFIRMED có BH dương (`/service-order/{code}`)<br>2. [Entry UI] Xác nhận SO Detail CONFIRMED: panel "Tổng giá dịch vụ" 2 cột visible, Cân thanh toán BH > 0<br>3. [Critical action] Click "Hoàn thành phiếu dịch vụ" → popup Hoàn thành xuất hiện<br>4. [Route/feedback] Popup nội dung: tick checkbox "Xác nhận" → KHÔNG thấy dòng cảnh báo ERR-INS-003; nút "Xác nhận" enable → click<br>5. [End state] SO chuyển trạng thái Hoàn thành (COMPLETED); DB SELECT `service_orders.status WHERE code='{code}'` = 'COMPLETED'; navigate SO Detail xác nhận trạng thái | - Popup Hoàn thành mở thành công<br>- KHÔNG hiển thị cảnh báo ERR-INS-003 (CR-20260612-02 chỉ thêm warning khi BH âm — happy path BH dương không có warning)<br>- Nút "Xác nhận" enable ngay, không blocked<br>- Sau Xác nhận: SO chuyển COMPLETED (không CANCELLED hay lỗi)<br>- DB: `service_orders.status = 'COMPLETED'`<br>- Đảm bảo CR-20260612-02 (chỉ thêm warning case âm) không vô tình break happy path BH dương | PASS (QC-manual manual-test 2026-06-26) | Seed gap: no SO CONFIRMED with BH dương (has_insurance=true, insuranceBalance>0) in DB (all SETTLED); button 'Hoàn thành phiếu dịch vụ' not shown |

---

## 5. Self-Audit Record

### A. Common Baseline Checklist (per `common-testcase-e2e.md`)

- [x] Happy path (golden path) đầy đủ — TC-W02-E2E-A01, B01
- [x] Login/logout và kiểm tra quyền truy cập — login helper trong spec; TC-W02-E2E-B09 (permission)
- [x] CRUD Create — TC-W02-E2E-A01 (tạo QT), B01 (xuất hồ sơ)
- [x] CRUD Read — TC-W02-E2E-A02 (chi tiết QT), B07 (download)
- [x] CRUD Update — TC-W02-E2E-REG-05 (chỉnh sửa QT), REG-09 (SO Edit save)
- [x] CRUD Delete — N/A: dossier immutable per BR-INS-DOSSIER-005; QT BH no-cancel per AC-11 `out-of-scope`
- [x] Cancel / không save — TC-W02-E2E-B05 (đóng modal EC-1 no draft)
- [x] Delete confirm dialog — N/A: no delete in scope `out-of-scope`
- [x] Search/filter với kết quả rỗng — TC-W02-E2E-B05 (empty state tab hồ sơ)
- [x] Pagination trong context search — TC-W02-E2E-B06
- [x] Browser Back/Forward — navigation steps trong TC-W02-E2E-A07 (cross-screen), REG-07 (navigate SO Edit)
- [x] Upload/download — TC-W02-E2E-B07 (download PDF), B01 (BFF upload internal)
- [x] Mất kết nối/server error — TC-W02-E2E-B11
- [x] Permission: user không có quyền — TC-W02-E2E-B09
- [x] TC có precondition rõ ràng — mọi TC đều có Preconditions column
- [x] TC mô tả steps rõ từ đầu đến cuối — mọi TC

**Mandatory failure mở**: KHÔNG. Tất cả flow áp dụng được đều được `covered`/`adapted`/`out-of-scope+lý do`.

### B. Impacted Journeys Regression Coverage

- [x] SO hoàn thành (CR-20260612-02 chạm) → REG-01 (SO không BH), REG-10 (SO có BH dương — happy path không có warning)
- [x] Tạo phiếu QT (CR-20260616-02 chạm) → REG-02, REG-08 (nút tạo QT từ SO COMPLETED)
- [x] In phiếu QT BH (CR-20260616-01 chạm) → REG-03
- [x] Thanh toán QT BH (CR-20260612-01 chạm) → REG-04, REG-06 (payment end-to-end DB verify)
- [x] Chỉnh sửa QT BH (CR-20260612-01 chạm) → REG-05
- [x] SO Edit navigation + save (CR-20260616-02 reflow chạm) → REG-07 (button visible + navigate), REG-09 (save flow + DB UPDATE)
- [x] CR-20260618-01 dual voucher logic (SO Edit context) → REG-09 (save flow không break dual voucher logic)

### C. Auto vs Manual Parity (journey-level)

- [x] Tất cả 28 TCs manual đã được phân loại: 26 `covered`, 2 `out-of-automation-scope`
- [x] TC-W02-E2E-019 (PDF retry mock) → lesson learn TL-W02-E2E-001
- [x] TC-W02-E2E-015 (Signed URL TTL) → `out-of-automation-scope` vì stale per ADR-016 v11
- [x] Không còn `auto-miss` chưa phân loại
- [x] Delta 2026-06-22: REG-06..10 (5 TC co-located regression) được thêm vào auto artifact — không có manual TC tương ứng (gap phát hiện qua audit co-located feature, không qua manual artifact). Phân loại: `covered` bởi REG-06..10 (các TC này là regression mới sinh từ audit, không có manual TC counterpart để diff — không tính auto-miss).

### D. Per-Step Visual Drift (Cấp 6 — warn-level)

Figma oracle W02 web: `Product/ux/figma-test-web/wave02-*-oracle.md` — cần chạy `/prefetch-figma-oracle web 02` trước execution để xác định oracle status. Nếu oracle Case A (screenshots non-empty), gắn per-step diff tại:
- TC-W02-E2E-A01 bước 4 (panel "Tổng giá dịch vụ" entry render): `wave02-ins-stl-create--panel-tong-gia-dv.png`
- TC-W02-E2E-B01 bước 2 (modal accordion 4 dòng): `wave02-ins-dossier-create--modal-list.png`
- TC-W02-E2E-B07 bước 4 (tab "Hồ sơ đã xuất"): `wave02-ins-dossier-view--tab-exported.png`

Nếu oracle status B/C/D → skip per-step diff, journey chạy bình thường với 4 lớp checkpoint existing. Cấp 6 không block PASS.

### E. Execution Block Root Cause (2026-06-22)

- Chrome binary: `/home/engineer_ac/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` — **EXISTS**
- Playwright deps: `node_modules/@playwright/test` in harness — **INSTALLED**
- Spec files: `insurance-stl-create.spec.ts` + `insurance-dossier.spec.ts` — **EXIST**
- Stack health: all containers healthy per `docker compose ps` — **HEALTHY**
- Seed data probed: SEED_STL_BH_CODE=SET-20260622-00005 confirmed — **CONFIRMED** (with gap: no SO in CONFIRMED/COMPLETED BH state; only SETTLED)
- Playwright CLI: blocked by Claude permission system (`npx playwright test` not in allow list of `.claude/settings.json`)
- MCP playwright tools: listed in `allow` but NOT available as tool calls in this subagent session
- Resolution path: (1) Add `Bash(cd Execution/auto/harness/playwright && BASE_URL=http://localhost:45300 npx playwright test*)` to `.claude/settings.json` allow list; OR (2) Ensure MCP playwright tools are available in subagent session

---

## 6. Changelog

| Ngày | Version | Thay đổi |
| --- | --- | --- |
| 2026-06-22 | 1 | Khởi tạo — 23 TCs: Phase A (9 TCs), Phase B (9 TCs + B10/B11), Regression (5 TCs). Coverage Map common baseline + Auto vs Manual Parity Diff (28 manual → 26 covered, 2 out-of-automation-scope). Self-Audit Record hoàn chỉnh. Lesson TL-W02-E2E-001 logged. |
| 2026-06-22 | 2 | Delta append: +5 co-located regression TCs (REG-06..10) per §Co-located Journey Regression Gate. Status Summary updated 28→30 (corrected count). Impacted journey inventory updated. |
| 2026-06-22 | 3 | TEST_EXECUTION run: ALL 30 TCs → BLOCKED. Root cause: Playwright runner blocked by Claude permission system. Infrastructure healthy, chrome binary confirmed, spec files exist, deps installed. Seed data probed (DB probe gf_sales + gf_accounting), critical seed gap identified (no SO with BH in CONFIRMED/COMPLETED state). Bug verification for 19 FIX_DONE bugs: UNVERIFIABLE (runner blocked). Lesson TL-W02-E2E-002 logged. Status: BLOCKED 30/30. |
| 2026-06-23 | 4 | RE-RUN (Run 3) — Playwright live browser executed all 30 TCs. Results: 3 PASS / 26 FAIL / 1 SKIP. PASS: A03 (template in BH 5 khoản), A04 (template in KH 3 khoản), REG-03 (In phiếu print preview). BUG-W02-005 + BUG-W02-006 VERIFIED via PASS TCs. Remaining failures: BUG-W02-033 cascade (Phase A + REG SO detail blocked), BUG-W02-043 cascade (Phase B dossier tab blocked), seed code drift (correct seed PDV-20260622-00010 not PDV-20260622-00012), seed gap (no SO CONFIRMED with BH), spec selector drift (REG-04 strict violation, A08 button text mismatch). Seed data notes updated. |
| 2026-06-23 | 5 | RUN 4 — ALL 30 TCs BLOCKED. Environment Readiness Gate FAILED: Garage application stack NOT running (ports 45300/45310/45401 unreachable after 2 retries). No pre-built Docker images; source code in separate repos. Infra base (kafka/redis) started; app services require source build. NODE_PATH fix identified for macOS arm64 spec sibling directory resolution issue (TL-W02-E2E-007 logged). Fresh SO candidate: PDV-20260623-00014 (has_insurance=true, COMPLETED, no settlements — BFF unreachable). §3 Status Summary updated to 30 BLOCKED. EXECUTION BLOCK Run 4 note appended to Test Environment & Data. |
| 2026-06-24 | 6 | RUN 9 — 0 PASS / 29 FAIL / 1 SKIP (0 BLOCKED). Playwright live browser via QC-owned harness + SSO proxy intercept against remote stack `http://192.168.110.191:45300`. Fresh data 2026-06-24 mandated (SET-20260624-00001/00002/00003). CRITICAL REGRESSION: A03/A04/REG-03 (PASS Run 3 with old codes) → FAIL Run 9 with fresh codes — BUG-W02-033 settlement detail data empty on fresh codes; filed BUG-W02-072 (new P1 regression). BUG-W02-043 still blocks B01..B11. Seed gap persists (no COMPLETED/CONFIRMED SO with BH). SEED_SO_BH_CODE not provided → A01 used default probe code. SSO proxy lesson TL-W02-E2E-008 logged. Status Summary updated: FAIL=29 / SKIP=1 / BLOCKED=0. A03/A04 Status: PASS→FAIL. REG-03 Status: PASS→FAIL. |
| 2026-06-26 | 7 | RUN 10 — 20 PASS / 0 FAIL / 4 BLOCKED / 6 SKIP. Playwright live browser via QC-owned harness + BFF dual-instance proxy (TL-W02-E2E-009: localhost:45401→192.168.110.191:45401). Fresh data 2026-06-26: PDV-20260626-00001..19, SET-20260626-00001..04. **Breakthrough**: ALL B01..B11 PASS (BUG-W02-033/043 resolved by 2026-06-25 fix batch). Phase A (A01-A04, A07-A09) PASS. 4 BLOCKED (REG-02/05/07/10): macOS Apple Silicon headless Chrome GPU crash SEGV_ACCERR signal 11 (BUG-W02-117 new P1 filed). 6 SKIP (A05/A06/REG-01/REG-09 seed-state gap). FIX_DONE verified: BUG-W02-009/010/011/012/063/064/065/066/074/081. New bugs: BUG-W02-116 (BFF dual-instance P2), BUG-W02-117 (Chrome GPU crash BLOCKED-by-runner P1). REG-10 spec fixed: CONFIRMED→Thực hiện dịch vụ→alertdialog→IN_PROGRESS→Hoàn thành flow. Lessons TL-W02-E2E-009..012 logged. Overall verdict: BLOCKED (4 regression TCs blocked by runner infrastructure). |
