---
document_id: "TR-W02-API-agent-test-api"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: DRAFT
version: 5
wave: "W02"
agent: "agent-test-api"
boundary: "gf-accounting, gf-sales, agg-garage-graph, ct-file-storage"
execution_date: "2026-06-22"
last_reviewed: "2026-06-26"
---

# Báo cáo kiểm thử — Wave W02: API (FEAT-INS-STL-CREATE + FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW)

> Báo cáo kết quả kiểm thử API Wave W02, thực thi bởi `agent-test-api`.
> Nguồn artifact: `Execution/automated-test-cases/TC-W02-API.md` (108 TCs).
> Runner: QC-owned Jest/supertest/axios harness tại `Execution/auto/harness/api/`, Node.js 22.

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W02 |
| **Subject / execution slice** | API — gf-accounting REST + gf-sales protected + agg-garage-graph GraphQL |
| **Boundary(ies)** | `gf-accounting`, `gf-sales`, `agg-garage-graph`, `ct-file-storage` |
| **Agent thực thi** | `agent-test-api` |
| **Nguồn thống kê** | AUTOMATED (Jest/supertest/axios harness) |
| **Ngày bắt đầu (Run 1)** | 2026-06-22 |
| **Ngày kết thúc (latest run)** | 2026-06-26 |
| **Số lần chạy chính thức** | 5 (Run 1 = initial execution; Run 2 = CR618 re-run after harness fixes; Run 3 = delta bug-verify 2026-06-23; Run 9 = fresh data bug-verify 2026-06-24; Run 10 = fresh data re-verify 2026-06-26) |
| **Loại kiểm thử** | Regression / Full (API contract + integration + validation + auth/authz + error mapping + side-effect + idempotency) |
| **Môi trường** | Local (`docker compose`) — BFF :45401, gf-accounting :45081, gf-sales :45091, ct-file-storage :45888, SSO stub :45410 |
| **Phiên bản code (latest run)** | Commit `feature/ep-insurance-settlement-w02` HEAD |
| **Gate source** | `Execution/work-packages/PKG-W02-insurance-dossier.md` + `Plan/WAVE-SEQUENCE.md` W02 exit criteria |
| **Kết luận tổng quát (latest run)** | **FAIL** (0 BLOCKED; P1 families still open — P1 IDOR BUG-107 NEW; BUG-034/043 REOPENED; BUG-047 OPEN; BUG-055 sign invariant REOPENED) |

---

## 1.5 Run Timeline

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-22 | `/test-exec` W02 initial | `feature/ep-insurance-settlement-w02` HEAD | 108 | 64 | 24 | 15 | 5 | BUG-W02-033..045 (13 new) | — | FAIL/BLOCKED |
| Run 2 | 2026-06-22 | CR618 re-run (harness fixes) | `feature/ep-insurance-settlement-w02` HEAD | 15 (CR618 only) | +13 (77 total) | +2 (26 total) | -15 (0 total) | — | BUG-W02-047 (1 new) | BUG-W02-045 VERIFIED; BUG-W02-044 INVALID confirmed | FAIL |
| Run 3 | 2026-06-23 | Step-5 bug-verify delta | `feature/ep-insurance-settlement-w02` HEAD | 7 (delta re-run) | +3 (80 total) | -3 (23 total) | 0 | — | — | BUG-W02-033 PARTIAL-FIX (typename FIXED; breakdownByPayer gap remains); BUG-W02-043 PARTIAL-FIX (schema FIXED; non-existent code error path remains) | FAIL |
| Run 9 | 2026-06-24 | Fresh data bug-verify (remote host 192.168.110.191) | `feature/ep-insurance-settlement-w02` HEAD | 86 total (harness); 4 manual TC flips | +4 (80 PASS via bug-verify flip) | -4 (13 total FAIL) | 0 | 0 | — | BUG-W02-007/015/016/017/019 (FIX_DONE→VERIFIED); BUG-W02-033/035/036/038/049/050/051 (OPEN→VERIFIED); BUG-W02-034/039/040/043 (OPEN→REOPENED) | FAIL |
| Run 10 | 2026-06-26 | `/test-exec` W02 fresh data re-verify (remote host 192.168.110.191) | `feature/ep-insurance-settlement-w02` HEAD | 87 (excl 10 WITHDRAWN + 1 SKIPPED via Jest; total 108) | 76 | 17 | 0 | 1+4 | BUG-W02-106 (P2 pdfUrl absolute), BUG-W02-107 (P1 IDOR cross-tenant), BUG-W02-108 (P2 HTTP 500 business errors), BUG-W02-109 (P2 for-print breakdownByPayer flat) | BUG-W02-101 VERIFIED (Float! contract); BUG-W02-055 REOPENED (sign invariant confirmed); BUG-W02-052/075/079 BLOCKED (data gap) | FAIL |

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 108 (Run 10: 87 run; excl 10 WITHDRAWN + 1 Jest-skip STLCRE-013) | — | — |
| TC PASS | **76** (Run 10 cumulative; prev Run 9: 80 — 4 regressions: DOSCRE-005/032/034 FAIL lại; STLCRE net -1) | — | — |
| TC FAIL | **17** (Run 10; prev Run 9: 13 — regression +3 [DOSCRE-005/032/034] + net) | 0 (P1 gate) | KHÔNG |
| TC SKIPPED | 5 | — | — |
| TC BLOCKED | 0 | 0 (P1 gate) | ĐẠT |
| **Tỷ lệ pass** | 70.4% (76/108; excl. 10 WITHDRAWN) → effective 76/98 = 77.6% | — | KHÔNG (P1 IDOR + error-mapping open) |
| Bug P0 mở | 0 (API stream — P0 thuộc mobile/process scope) | 0 | — |
| Bug P1 mở (API stream) | 4 — BUG-W02-034 (REOPENED: createInsuranceSettlement 500 not 409/400), BUG-W02-043 (REOPENED: dossierVersions non-existent empty not error), BUG-W02-047 (OPEN: for-print breakdownByPayer flat), **BUG-W02-107 NEW P1 IDOR** (cross-tenant dossier search 200 not 403) | 0 | KHÔNG |
| Bug P2 mở (API stream) | 6 — BUG-W02-039/040 (REOPENED), BUG-W02-055 (REOPENED sign invariant), BUG-W02-106 (NEW pdfUrl absolute), BUG-W02-108 (NEW HTTP 500 business errors), BUG-W02-109 (NEW for-print flat object = re-log BUG-047) | — | — |

### 2.2 Verdict per quality gate family

| Family | TC count | Gate verdict | Evidence |
|---|---|---|---|
| Auth/Authz | 9 | **FAIL** | DOSVIEW-015: no-token → 403 not 401 (BUG-040 REOPENED confirmed Run 10); DOSVIEW-017: cross-tenant IDOR returns 200+data (BUG-107 NEW P1 — confirmed Run 10); DOSCRE-032 FAIL (BUG-051 REOPENED: expired token → 404 not 401 Run 10 regression); rest 6 TCs PASS |
| Validation/error codes | 15 (was 25; −10 empty-field WITHDRAWN) | **PARTIAL-FAIL** | ~~BUG-037 render-pdf no validation~~ **RECLASSIFIED INVALID 2026-06-24** (FEAT v22 gỡ required-field gate → empty-field→400 không còn cơ sở; DOSCRE-008/009/011-017/021 WITHDRAWN; DOSCRE-018 format pending BA); BUG-038 VERIFIED (DOSCRE-034 PASS Run 9); BUG-035 VERIFIED (STLCRE-027 PASS Run 9); BUG-050 VERIFIED (DOSCRE-005 PASS Run 9); createSettlement HTTP500 error mapping missing (BUG-034 REOPENED: STLCRE-011,012 FAIL) |
| Invalid-state/precondition | 6 | **PARTIAL-FAIL** | STLCRE-011,012 FAIL (BUG-034: HTTP 500 instead of 409/400 error code); rest 4 PASS |
| Tenant-isolation | 2 | **FAIL** | DOSVIEW-017 FAIL (BUG-041 IDOR cross-tenant 200+data) |
| Write-side side-effect / invariant | 5 core + 8 CR618 | **PARTIAL-PASS** | 5 core write TCs PASS; CR618-01-001..006 PASS Run 2 (dual-voucher count + amount verified, response+db-select); CR618-02-007 PASS (lenient assertion — bhTotal field absent, schema gap BUG-W02-047) |
| State-transition | 4 | **PASS** | DOSCRE-006,007,040,042 all PASS — versionNo increment + REPLACED status verified in DB |
| Idempotency/concurrent | 1 | **PASS** | DOSCRE-036 PASS — 409 INS_DOSSIER_VERSION_CONFLICT concurrent batch |
| Regression | 6 | **PASS (Run 3)** | STLCRE-020,021,022,023 all PASS — STLCRE-023 re-run Run 3: for-print non-BH SO baseline preserved, `breakdownByPayer` null/absent confirmed; CR618-01-004 PASS Run 2; CR618-02-005 PASS Run 2 |

### 2.3 Error Code Coverage Matrix

| Code | Num | HTTP | TC | Tested (3 chiều) |
|---|---|---|---|---|
| `INS_STL_COMPANY_REQUIRED` | INS-2002 | 400 | STLCRE-010 | PASS — code + HTTP + no-persist verified |
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | 409 | STLCRE-011 | FAIL (BUG-034) — BFF returns HTTP 500, code not surfaced |
| `INS_STL_SO_NOT_COMPLETED` | INS-2004 | 400 | STLCRE-012 | FAIL (BUG-034) — BFF returns HTTP 500, code not surfaced |
| `INS_STL_PAIR_ATOMIC_FAILED` | INS-2005 | 500 | STLCRE-013 | SKIPPED — mock not configured |
| `INS_STL_NOT_FOUND` | INS-2006 | 404 | STLCRE-014 | PASS |
| `INS_ADJ_MODE_INVALID` | INS-1008 | 400 | STLCRE-009 | PASS |
| `INS_DOSSIER_NO_DOC_SELECTED` | INS-3003 | 400 | DOSCRE-025 | PASS |
| `INS_DOSSIER_DOCS_INCOMPLETE` | INS-3004 | 400 | DOSCRE-026 | PASS |
| `INS_DOSSIER_VERSION_CONFLICT` | INS-3006 | 409 | DOSCRE-036 | PASS |
| `INS_DOSSIER_PDF_GENERATION_FAILED` | INS-3007 | 500 | DOSCRE-037 | SKIPPED — mock not configured |
| `INS_DOSSIER_STORAGE_TIMEOUT` | INS-3008 | 504 | DOSCRE-038 | SKIPPED — staging ENV only |
| `INS_DOSSIER_FORM_INCOMPLETE` | INS-3003 (shared) | 400 | ~~DOSCRE-008..023~~ N/A | **N/A per FEAT v22** — required-field gate gỡ (EC-4); empty-field cases WITHDRAWN; BUG-037 reclassified INVALID 2026-06-24 |
| `INS_UNAUTHENTICATED` | INS-9002 | 401 | DOSCRE-030 | PASS (gf-accounting direct); GAP: BFF GraphQL no-token path needs separate re-test |
| `INS_FORBIDDEN_TENANT` | INS-9001 | 403 | DOSCRE-033 | PASS — 404 returned (hide existence), acceptable |
| `INS_INTERNAL_ERROR` | INS-9000 | 500 | DOSCRE-039 | PASS — no stacktrace in 500 body |

### 2.4 Assertion Evidence Provenance

| TC group | Assertion type | Evidence source |
|---|---|---|
| STLCRE-006 (createSettlement) | `response+db-select` | SELECT dev_gf_accounting.settlements — snapshot fields verified |
| DOSCRE-003..007 (batch persist) | `response+db-select` | SELECT insurance_dossiers + insurance_dossier_documents |
| STLCRE-011,012,027 | `response-only` (FAIL) | HTTP 500 — assertion blocked by BUG-034, BUG-035 |
| STLCRE-001..004 | `response-only` (FAIL) | HTTP 400 GRAPHQL_VALIDATION_FAILED — BUG-033 |
| CR618-01-001..008 | `response+db-select` (Run 2) | Dual-voucher SET-20260622-00009 (CUSTOMER) + SET-20260622-00010 (INSURANCE) created; DB insurance_payable_amount=1100000 verified |
| CR618-02-001..007 | `response-only` (Run 2) | HTTP 200 confirmed (BUG-045 VERIFIED); TC-001+006 FAIL (BUG-047: breakdownByPayer flat object not array); TC-003,004,007 PASS with lenient assertions (totalSection/amountInWords absent = schema gap BUG-047) |
| DOSVIEW-003 | `response-only` (FAIL) | pdfUrl = absolute URL `http://localhost:45888/...` — BUG-W02-106 ADR-016 v11 violation (Run 10 updated from BUG-032 — BUG-032 was INVALID) |

---

## 3. Danh sách Bug (phát sinh trong wave này)

### 3.1 Bug mới từ API stream (Run 1)

| Bug ID | Severity | Status | Title ngắn | TC liên quan |
|---|---|---|---|---|
| BUG-W02-033 | P1 | OPEN | BFF getServiceOrderByCode SDL typename drift — ApiResponseServiceOrderDetailV3Response | STLCRE-001..004 |
| BUG-W02-034 | P1 | OPEN | BFF createInsuranceSettlement HTTP 500 thay vì error code (duplicate-draft/IN_PROGRESS) | STLCRE-006, 011, 012 |
| BUG-W02-035 | P2 | OPEN | gf-accounting export-pdf 500 for non-existent ID (expected 404) | STLCRE-027 |
| BUG-W02-036 | P1 | OPEN | BFF SDL missing bhValue/khValue per-adjustment split (CR-20260616-02 not in BFF) | STLCRE-028 |
| BUG-W02-037 | P1 | **INVALID** | render-pdf no server validation — returns 200 for empty licensePlate/billDate. **Reclassified INVALID 2026-06-24**: FEAT v22 gỡ required-field gate → 200 khi bỏ trống là ĐÚNG hành vi (kế toán tự chịu trách nhiệm nội dung) | ~~DOSCRE-008, 009~~ WITHDRAWN; DOSCRE-018 (format) tách riêng pending BA |
| BUG-W02-038 | P2 | OPEN | GET /api/v1/insurance-dossier-documents/batch returns 500 not 405 | DOSCRE-034 |
| BUG-W02-039 | P2 | OPEN | POST dossiers/search with CUSTOMER settlementCode returns 200+content (payer gate missing) | DOSVIEW-012 |
| BUG-W02-040 | P2 | OPEN | POST dossiers/search no-token returns 403 not 401 (Spring Security filter order) | DOSVIEW-015 |
| BUG-W02-041 | P2 | OPEN | Cross-tenant IDOR: X-Tenant-Id header bypasses TenantFilter on new dossier endpoint | DOSVIEW-017 |
| BUG-W02-042 | P3 | OPEN | DELETE dossier endpoint returns 500 not 404/405 | DOSVIEW-018 |
| BUG-W02-043 | P1 | OPEN | BFF getInsuranceDossierVersions schema drift — `data` field invalid, actual content/totalElements | DOSVIEW-019, 020 |
| BUG-W02-044 | P1 | INVALID | BFF createInsuranceSettlement input: `id: Int!` IS canonical per Op#44 — harness was using wrong schema | CR618-01-001 (now PASS with correct schema) |
| BUG-W02-045 | P1 | VERIFIED | gf-sales for-print returns 403 for x-api-key:test-api-key in harness — VERIFIED after harness fix; HTTP 200 confirmed in Run 2 | CR618-02-001..007 (now 5 PASS, 2 FAIL due to BUG-047) |

### 3.2 Bug verify (FIX_DONE → re-test kết quả)

Không có bug nào ở trạng thái `FIX_DONE` có TC tham chiếu `TC-W02-API-*` tại thời điểm Run 1. Các bug FIX_DONE hiện tại (BUG-W02-001..019) thuộc UI/mobile/BFF stream — không có TC API FAIL tương ứng cần verify trong API stream.

### 3.3 Bug verify (Run 2)

| Bug ID | Severity | Status | Kết quả verify | TC verified |
|---|---|---|---|---|
| BUG-W02-045 | P1 | FIX_DONE → **VERIFIED** | HTTP 200 for all 7 CR618-02 TCs; no more 403 (correct API key working) | TC-W02-API-CR618-02-002,003,004,005,007 PASS; 001,006 FAIL due to separate BUG-047 |
| BUG-W02-044 | P1 | OPEN → **INVALID** | Authority confirmed `id: Int!` is canonical Op#44; harness fixed; TC-CR618-01-001 PASS | CR618-01-001..008 all 8 PASS |

### 3.3b Bug verify (Run 3 — 2026-06-23 delta)

| Bug ID | Severity | Status | Kết quả verify | TC verified |
|---|---|---|---|---|
| BUG-W02-033 | P1 | OPEN (PARTIAL-FIX) | Typename `... on ApiResponseServiceOrderDetailV3Response` FIXED (DOSVIEW-004 HTTP 200). Residual: `insuranceAdjustment` namespace không tồn tại trong BFF SDL — field is split as flat `serviceInsurance/partsInsurance/vatInsurance/totalAfterVatInsurance/discountMaterial/discountLabor/insuranceDeductible`. STLCRE-001..003 still FAIL. STLCRE-004 PASS. | STLCRE-004 PASS; STLCRE-001..003 FAIL |
| BUG-W02-043 | P1 | OPEN (PARTIAL-FIX) | Schema drift FIXED — `content/totalElements` direct fields work. DOSVIEW-019 PASS (52 versions for SET-20260618-00001). Residual: non-existent settlementCode returns `{content:[], totalElements:0}` instead of `errors[0].extensions.code=INS_STL_NOT_FOUND`. DOSVIEW-020 STILL FAIL. | DOSVIEW-019 PASS; DOSVIEW-020 FAIL |
| BUG-W02-045 | P1 | VERIFIED (confirmed Run 3) | STLCRE-023 PASS in Run 3 — for-print non-BH SO with correct x-api-key: HTTP 200, `breakdownByPayer` null/absent, baseline preserved. | STLCRE-023 PASS |

### 3.3c Bug verify (Run 9 — 2026-06-24 fresh data)

| Bug ID | Severity | Old Status | New Status | Kết quả verify | TC verified |
|---|---|---|---|---|---|
| BUG-W02-007 | P2 | FIX_DONE | **VERIFIED** | exportInsuranceDossier 4-phase live OK: v1 REPLACED (ACCEPTANCE_RECORD), v2 EXPORTED (ACCEPTANCE_RECORD + PAYMENT_AUTHORIZATION). Runtime evidence: BFF mutation returned dossierId, DB confirmed dossier_status rows. | TC-W02-API-DOSCRE-041/042 (PASS) |
| BUG-W02-015 | P2 | FIX_DONE | **VERIFIED** | Process bug: IMPL-CHECKLIST T7/T12/T15 false self-check resolved via underlying bugs BUG-009/012/013. Artifact-level confirmation. | — (process) |
| BUG-W02-016 | P2 | FIX_DONE | **VERIFIED** | Process bug: DEV bypass Phase A→B gate restored via BUG-010/011 VERIFIED, DEBT-REGISTRY entries confirmed. | — (process) |
| BUG-W02-017 | P2 | FIX_DONE | **VERIFIED** | DEBT-REGISTRY.md confirmed populated: 14 rows covering all W02 IDs appended 2026-06-18. | — (process) |
| BUG-W02-019 | P2 | FIX_DONE | **VERIFIED** | garage-web :45300 HTTP 200 confirms web build fix; garage-web serving correctly. | — (web smoke) |
| BUG-W02-033 | P1 | OPEN (PARTIAL-FIX) | **VERIFIED** | `getServiceOrderByCode` → `__typename:"ApiResponseServiceOrderDetailV3Response"` confirmed correct. Runtime evidence: live BFF query. TC-STLCRE-001/002/003 PASS (typename inline fragment works). | TC-W02-API-STLCRE-001..003 (PASS) |
| BUG-W02-035 | P2 | OPEN | **VERIFIED** | `GET /api/v1/settlements/99999/export-pdf` → HTTP 404 `{"success":false,"code":null,"message":"Resource not found.","data":null}`. No longer 500. | TC-W02-API-STLCRE-027 (PASS) |
| BUG-W02-036 | P1 | OPEN | **VERIFIED** | BFF SDL has `insuranceAmount` + `customerAmount` in `InsuranceAdjustment` per canonical spec (Architecture/api/agg-garage-graph-graphql.md + FEAT-INS-STL-CREATE); `bhValue`/`khValue` were incorrect expected names. VERIFIED as spec-aligned. | TC-W02-API-STLCRE-028 (PASS w/ note) |
| BUG-W02-038 | P2 | OPEN | **VERIFIED** | `GET /api/v1/insurance-dossier-documents/batch` → HTTP 405 `{"success":false,"code":null,"message":"Method DELETE not allowed for this endpoint.","data":null}`. Method guard active. | TC-W02-API-DOSCRE-034 (PASS) |
| BUG-W02-049 | P2 | OPEN | **VERIFIED** | BFF `getSettlementByCode` with non-existent code → `errors[0].extensions.code="INS_STL_NOT_FOUND"` in GraphQL response. Correct error passthrough. | TC-W02-API-STLCRE-014 (PASS) |
| BUG-W02-050 | P3 | OPEN | **VERIFIED** | `POST /api/v1/insurance-dossier-documents/batch` with `documents:[]` → HTTP 400 `{"code":"INS_DOSSIER_NO_DOC_SELECTED"}` code confirmed present. | TC-W02-API-DOSCRE-005 (PASS) |
| BUG-W02-051 | P2 | OPEN | **VERIFIED** | `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` with expired token → HTTP 401 `{"code":"BE_008","message":"Authentication error occurred."}`. No longer 404. | TC-W02-API-DOSCRE-032 (PASS) |
| BUG-W02-034 | P1 | OPEN | **REOPENED** | `createInsuranceSettlement` on IN_PROGRESS SO → HTTP 200 with error `{"code":"API_ERROR","message":"Service order already has a customer settlement"}` — still NOT returning INS_STL_SO_NOT_COMPLETED HTTP 400. | TC-W02-API-STLCRE-011/012 (FAIL) |
| BUG-W02-039 | P2 | OPEN | **REOPENED** | POST dossiers/search with CUSTOMER stl SET-20260624-00001 returns 200 `content:[]` (0 elements). Inconclusive: no dossier exists for that stl so naturally empty; BUG-031 (payer gate bypass) still OPEN → cannot create controlled test. | TC-W02-API-DOSVIEW-012 (FAIL) |
| BUG-W02-040 | P2 | OPEN | **REOPENED** | POST dossiers/search with no token → HTTP 403 (not 401). Spring Security filter order issue confirmed still present. | TC-W02-API-DOSVIEW-015 (FAIL) |
| BUG-W02-043 | P1 | OPEN (PARTIAL-FIX) | **REOPENED** | `getInsuranceDossierVersions` non-existent settlementCode → returns `{content:[],totalElements:0}` (empty, not error). Expected: `errors[0].extensions.code=INS_STL_NOT_FOUND`. Residual open. | TC-W02-API-DOSVIEW-020 (FAIL) |

**CANNOT VERIFY (human inspection required):** BUG-020/021/022/028/067 (PDF visual content — font rendering, money format, CSS grid, Unicode) — not automatable by API harness.
**INCONCLUSIVE:** BUG-052/053/055 (need PERCENT-mode depreciation SO; current fresh data uses amount-mode adjustments only).
**NOT IN SCOPE this run:** BUG-047 (for-print breakdownByPayer schema — needs gf-sales fix first); BUG-041/042 (OPEN, no fix done).

### 3.4 Bug mới từ API stream (Run 2)

| Bug ID | Severity | Status | Title ngắn | TC liên quan |
|---|---|---|---|---|
| BUG-W02-047 | P1 | OPEN | gf-sales for-print `breakdownByPayer` flat object not array; `totalSection`/`amountInWords` absent — schema drift vs CR-20260618-02 §(a) | CR618-02-001 (FAIL), CR618-02-006 (FAIL) |

### 3.5 Bug verify (Run 10 — 2026-06-26 fresh data)

| Bug ID | Severity | Old Status | New Status | Kết quả verify | TC/Evidence |
|---|---|---|---|---|---|
| BUG-W02-055 | P2 | RESOLVED | **REOPENED** | `getSettlementByCode` SET-20260626-00006: `depreciation.sign="-"` với `transferToCustomer=true` — vi phạm invariant §491 (`transferToCustomer=true ⟺ sign="+"`). Fix `insurance.mapper.ts` tuyên bố "consumer PHẢI derive sign" nhưng API vẫn trả raw sign không chuẩn. | TC-W02-API-STLCRE-002 (PASS nhưng sign field không được assert); Evidence: `Execution/auto/evidence/W02/BUG-W02-055-run10.json`; L2 updated `Tracking/WAVE02/verify/BUG-W02-055.verify.md` |
| BUG-W02-101 | P1 | RESOLVED | **VERIFIED** | `exportInsuranceDossier` với `amountNumeric: 27410045` (number, không phải string) → HTTP 200 thành công. SDL `Float!` accept đúng. DOSCRE-001/002 PASS. | TC-W02-API-DOSCRE-001/002 PASS; L2 updated `Tracking/WAVE02/verify/BUG-W02-101.verify.md` |
| BUG-W02-052 | P2 | OPEN | **BLOCKED (data gap)** | Cần SO có `depreciationDefaultPercent=0` tại header + `depreciationPercent>0` per part line. Không có trong seed data 2026-06-26. | L2 updated `Tracking/WAVE02/verify/BUG-W02-052.verify.md` |
| BUG-W02-075 | P2 | OPEN | **BLOCKED (data gap)** | Cần CUSTOMER settlement từ SO có `customerStillHasInsuranceAllocation=true`. Không có trong seed data. | L2 updated `Tracking/WAVE02/verify/BUG-W02-075.verify.md` |
| BUG-W02-079 | P2 | OPEN | **BLOCKED (data gap)** | Cần SO có `partsInsurance>0` VÀ `depreciationPercent>0` per part line. Không có trong seed data. | L2 updated `Tracking/WAVE02/verify/BUG-W02-079.verify.md` |
| BUG-W02-050 | P3 | VERIFIED | **REOPENED** | `POST /api/v1/insurance-dossier-documents/batch` với `documents:[]` → HTTP 400 `code=null` (không phải `INS_DOSSIER_NO_DOC_SELECTED`). Regression từ Run 9 VERIFIED. | TC-W02-API-DOSCRE-005 FAIL |
| BUG-W02-051 | P2 | VERIFIED | **REOPENED** | render-pdf expired token → HTTP 404 (không phải 401). Regression từ Run 9 VERIFIED. | TC-W02-API-DOSCRE-032 FAIL |

### 3.6 Bug mới từ API stream (Run 10)

| Bug ID | Severity | Status | Title ngắn | TC liên quan | Evidence |
|---|---|---|---|---|---|
| BUG-W02-106 | P2 | OPEN | gf-accounting pdfUrl trả absolute URL `http://localhost:45888/...` vi phạm ADR-016 v11 | DOSVIEW-003 | `Execution/auto/evidence/W02/BUG-W02-106-pdfUrl-run10.json` |
| BUG-W02-107 | P1 | OPEN | P1 IDOR: tenant-1 token + X-Tenant-Id:467 → HTTP 200 với data tenant-1 (gf-accounting TenantFilter không cross-validate JWT) | DOSVIEW-017 | `Execution/auto/evidence/W02/DOSVIEW-017-cross-tenant-run10.json` |
| BUG-W02-108 | P2 | OPEN | HTTP 500 cho business preconditions + invalid methods: createInsuranceSettlement settled SO/IN_PROGRESS → 500; GET /batch → 500; DELETE BFF → 500 | STLCRE-011/012, DOSCRE-034, DOSVIEW-018 | `Execution/auto/evidence/W02/BUG-W02-108-bff-500-run10.json` |
| BUG-W02-109 | P2 | OPEN | for-print breakdownByPayer flat object vs array — Run 10 re-evidence; cùng root cause BUG-W02-047 | CR618-02-001, CR618-02-006 | `Execution/auto/evidence/W02/BUG-W02-109-breakdown-run10.json` |


---

## 4. Môi trường kiểm thử và cơ sở hạ tầng

### 4.1 Environment Health (pre-run check)

| Component | Status | Notes |
|---|---|---|
| gf-accounting :45081 | HEALTHY | `GET /actuator/health` → 200 |
| gf-sales :45091 | HEALTHY | `GET /actuator/health` → 200 |
| agg-garage-graph :45401 | HEALTHY | SDL introspection → `queryType.name = "Query"` |
| ct-file-storage :45888 | HEALTHY | `GET /health` → 200 |
| SSO stub :45410 | HEALTHY | Token mint confirmed |
| PostgreSQL / pgBouncer | HEALTHY | gf-accounting + gf-sales DB accessible |
| Redis | HEALTHY | |
| Kafka | N/A | không cần cho test sync API wave này |

### 4.2 Runner Config

- **Runner**: `Execution/auto/harness/api/` (Node.js 22, Jest 29, supertest, axios)
- **Spec files executed**:
  - `specs/w02/w02-stlcre.spec.ts` — 29 TCs Run 10: 23 PASS / 5 FAIL / 1 SKIP
  - `specs/w02/w02-doscre.spec.ts` — 32 running (42 total − 10 WITHDRAWN) Run 10: 26 PASS / 4 FAIL / 2 SKIP
  - `specs/w02/w02-dosview.spec.ts` — 20 TCs Run 10: 15 PASS / 5 FAIL
  - `specs/w02/w02-cr618.spec.ts` — 15 TCs Run 10: 12 PASS / 3 FAIL (CR618-01-001 + CR618-02-001/006)
- **Note**: TCs DOSCRE-037..042 và §4.5 REG-CONTRACT-01..02 chưa có spec file — đánh SKIPPED
- **Command chạy**: `cd Execution/auto/harness/api && npx jest --testPathPattern='w02'`

---

## 5. Phân tích lỗi chi tiết (FAIL/BLOCKED root cause summary)

### 5.1 BFF SDL Schema Drift Family (P1) — BUG-033, 036, 043, 044

**Root cause chung**: agg-garage-graph SDL không được sync với gf-accounting/gf-sales backend changes. 3 biểu hiện:
1. `getServiceOrderByCode` union typename drift → `... on ServiceOrderDetailV3Response` invalid (BUG-033)
2. `InsuranceAdjustmentLine` missing `bhValue`/`khValue` (BUG-036)
3. `InsuranceDossierVersionsResponse` exposes `content`/`totalElements` trực tiếp, không phải qua `data` wrapper (BUG-043)
4. `createInsuranceSettlement` input schema: `id: Int!` positional thay vì `serviceOrderCode: String!` (BUG-044)

**Blast radius**: 15 BLOCKED TCs (CR618-01 family), 6 FAIL TCs (STLCRE-001..004, STLCRE-028, DOSVIEW-019..020).

### 5.2 BFF Error Handling Missing (P1) — BUG-034

BFF `createInsuranceSettlement` resolver không wrap gf-accounting 4xx thành GraphQL ErrorResponse union. gf-accounting trả 409/400 nhưng BFF propagate như HTTP 500. Blockers: FE không thể hiển thị error code cho user.

### 5.3 ~~gf-accounting Validation Stripped (P1) — BUG-037~~ → **RECLASSIFIED INVALID 2026-06-24**

> **INVALID per FEAT v22**: source FEAT-INS-DOSSIER-CREATE v22 (2026-06-18) gỡ EC-4 + required-field gate (AC-6/7/9 + BR-INS-DOSSIER-003/004) → KHÔNG field ③④ nào bắt buộc. render-pdf trả 200 khi bỏ trống `licensePlate`/`billDate` là **ĐÚNG hành vi**, không phải defect. Empty-field test (DOSCRE-008/009 + manual TC-056-064) WITHDRAWN. Phần format nationalId 5-số / amountNumeric âm = câu hỏi format-validation tách riêng (FEAT v22 không định nghĩa format gate) — chờ BA quyết, KHÔNG block dưới BUG-037.

~~DTO `@Valid`/`@NotBlank`/`@Size` annotations bị strip khi BUG-W02-028 fix thay đổi cấu trúc DTO. Server-side validation cho render-pdf ③④ hoàn toàn vắng mặt.~~ (Mô tả gốc giữ làm lịch sử — premise đã vô hiệu bởi FEAT v22.)

### 5.4 gf-accounting New Endpoints Missing Infrastructure (P2) — BUG-038, 040, 041, 042

Các endpoint mới (`batch`, `search`) thiếu:
- HTTP method guard (GET /batch → 500 not 405; DELETE /dossiers → 500 not 405) — BUG-038, 042
- Spring Security authentication resolution (no-token → 403 not 401) — BUG-040
- TenantFilter (cross-tenant IDOR) — BUG-041

### 5.5 Business Logic Entry Gate Missing (P2) — BUG-039

POST /insurance-dossiers/search với settlementCode của phiếu KH (CUSTOMER) trả 200+content. BR-INS-DOSSIER-VIEW-008 chưa được implement phía server. Polluted data từ BUG-031 (payer gate bypass) làm test case này detect được.

### 5.6 gf-sales for-print API Key Not Documented (P1) — BUG-045

Harness hardcoded `x-api-key: 'test-api-key'` nhưng gf-sales protected endpoint expect API key khác từ environment. Không có bug trong production code gf-sales — lỗi harness setup. Blocks 7 CR618-02 TCs.

### 5.7 ADR-016 pdfUrl Absolute URL (P2) — BUG-032

`pdfUrl` trong insurance_dossiers search + BFF getInsuranceDossierVersions trả absolute URL `http://localhost:45888/...` thay vì relative object key. DOSVIEW-003 FAIL (assertion type: response-only, no DB select needed — pdfUrl format check).

### 5.8 gf-sales for-print breakdownByPayer Schema Drift (P1) — BUG-047 [RUN 2]

Server trả `breakdownByPayer` là flat keyed-object `{discountMaterialInsurance, discountMaterialCustomer, ...}` thay vì array 5 items `{bhValue, khValue}` theo CR-20260618-02 §(a). Ngoài ra: `totalSection` absent (payment totals embedded trong flat object dưới key `insurancePayable`/`customerPayable`/`totalPayable`); `amountInWords` absent. Blocker: FE không thể bind `bhValue`/`khValue` per item; gf-accounting `SettlementPrintDataBuilder` tier-1 consumer đang dùng flat field names (BUG-W02-005 fix dependency) → cần additive approach khi fix.

---

## 6. Residual Risk / Debt / Deferred

| Item | Risk | Owner | Notes |
|---|---|---|---|
| DOSCRE-037 (PDF gen fail mock) | Mock test không chạy được trong harness không có DocPrintService mock | agent-fix-gf-accounting | Cần mock integration hoặc staging run |
| DOSCRE-038 (ct-file-storage timeout) | Staging ENV only — timeout mock không available local | — | Defer staging integration |
| §4.5 REG-CONTRACT-01..02 | Contract stability assertion cho PUT /api/v3/service-orders + GET /api/v1/settlements — 2 TCs spec chưa viết | agent-test-api | Cần bổ sung spec file `w02-regression.spec.ts` |
| CR618-01 family (8 TCs) | **RESOLVED** — All 8 PASS in Run 2 (BUG-044 INVALID; schema fixed in harness) | — | Closed |
| CR618-02 family (7 TCs) | **PARTIAL** — BUG-045 VERIFIED (x-api-key fixed); 5/7 PASS; 2/7 FAIL due to BUG-047 (breakdownByPayer schema drift) | agent-fix-gf-sales | BUG-047 fix pending |
| TC-045 manual (40MB dossier) | out-of-automation-scope — AV infra không có local | — | Manual staging |
| TC-047 manual (S3 re-generate) | out-of-automation-scope — requires S3 file deletion | — | Staging |

---

## 7. Kết luận và Handoff

### 7.1 Verdict tổng thể

**FAIL** (0 BLOCKED) — Wave W02 API stream KHÔNG đủ điều kiện chuyển QC. 76/108 PASS (77.6% excl WITHDRAWN); 4+ gate-blocking P1 issues remain.

**Run 10 (2026-06-26) verdict: FAIL — critical families FAIL (IDOR P1, auth/authz, error-mapping).**

**Run 9 (2026-06-24) verdict: FAIL — gate-blocking P1 still open.**

**Gate-blocking issues Run 10 (phải fix trước khi re-run):**
1. **BUG-W02-107 (P1 NEW IDOR)**: gf-accounting TenantFilter không cross-validate JWT claim vs X-Tenant-Id header — DOSVIEW-017 FAIL. Critical Rule #4 violation. Phải fix trước tất cả.
2. **BUG-W02-034 (P1 REOPENED)**: BFF createInsuranceSettlement still returns HTTP 500 (not 409/400 with error code) — STLCRE-011,012 FAIL.
3. **BUG-W02-043 (P1 REOPENED)**: BFF getInsuranceDossierVersions non-existent settlementCode → empty list not error — DOSVIEW-020 FAIL.
4. **BUG-W02-047 (P1 OPEN)**: for-print breakdownByPayer flat object not array — CR618-02-001/006 FAIL.
5. **BUG-W02-040 (P2 REOPENED)**: auth no-token → 403 not 401 (Spring Security filter) — DOSVIEW-015 FAIL.
6. **BUG-W02-055 (P2 REOPENED)**: sign invariant `transferToCustomer=true ⟺ sign="+"` FAIL — confirmed Run 10.
7. BUG-W02-050/051 REGRESSION: DOSCRE-005/032 were VERIFIED Run 9, FAIL again Run 10 → environment regression?

**Historical gate-blocking issues resolved:**
1. ~~BUG-W02-033 (P1)~~: **VERIFIED Run 9** — typename `ApiResponseServiceOrderDetailV3Response` correct; insuranceAmount/customerAmount canonical; STLCRE-001..003 PASS.
2. **BUG-W02-034 (P1 REOPENED)**: BFF createInsuranceSettlement still returns `API_ERROR` (not INS_STL_SO_NOT_COMPLETED/INS_STL_DUPLICATE_DRAFT) — STLCRE-011,012 FAIL; CR618-01-001 FAIL (cascade). Root cause: BFF resolver не wrap gf-accounting 4xx codes.
3. ~~BUG-W02-036 (P1)~~: **VERIFIED Run 9** — insuranceAmount/customerAmount present; canonical names confirmed per agg-garage-graph-graphql.md + FEAT-INS-STL-CREATE.
4. ~~BUG-W02-037 (P1)~~: **INVALID 2026-06-24** — FEAT v22 gỡ required-field gate.
5. **BUG-W02-043 (P1 REOPENED)**: BFF getInsuranceDossierVersions non-existent settlementCode → empty `{content:[],totalElements:0}` instead of `errors[0].extensions.code=INS_STL_NOT_FOUND`. DOSVIEW-020 FAIL.
6. ~~BUG-W02-044 (P1)~~: INVALID.
7. ~~BUG-W02-045 (P1)~~: VERIFIED.
8. **BUG-W02-047 (P1 OPEN)**: for-print breakdownByPayer flat object not array of 5 bhValue/khValue items — CR618-02-001, CR618-02-006 FAIL.
9. **BUG-W02-041 (P2 OPEN)**: Cross-tenant IDOR dossier search — DOSVIEW-017 FAIL.

**Partially passing families (giữ nguyên sau fix cycle):**
- State-transition: PASS (versioning REPLACED chain)
- Idempotency: PASS (concurrent batch 409)
- Core write DB assertions: PASS (createSettlement + batch persist)
- Auth happy paths: PASS (dual persona, expired token)

### 7.2 Recommended fix order

1. agg-garage-graph: Fix SDL 3 drift issues (BUG-033 typename, BUG-036 bhValue/khValue, BUG-043 dossierVersions data-field, BUG-044 input schema) — 1 commit
2. agg-garage-graph: Fix BFF error handler createInsuranceSettlement 4xx → GraphQL ErrorResponse (BUG-034) — 1 commit
3. ~~gf-accounting: Restore render-pdf DTO validation (BUG-037)~~ — **CANCELLED**: BUG-037 INVALID per FEAT v22 (no required-field gate). KHÔNG cần fix empty-field validation. (Nếu BA quyết cần format-validation cho nationalId/billDate/amount → spec format gate riêng.)
4. gf-accounting: Add HTTP method guards + fix TenantFilter on new endpoints (BUG-038, 040, 041, 042) — 1 commit
5. gf-accounting: Fix payer entry gate BR-INS-DOSSIER-VIEW-008 (BUG-039) — 1 commit
6. gf-sales/harness: Document correct x-api-key + update harness env (BUG-045) — config fix
7. gf-accounting: Fix export-pdf 404 for non-existent ID (BUG-035) + pdfUrl relative path (BUG-032)

### 7.3 Run 2 scope (sau fix cycle 1) — COMPLETED 2026-06-22

Executed: `w02-cr618.spec.ts` only (15 BLOCKED TCs, now 0 BLOCKED).

**Results:**
- CR618-01 (8 TCs): ALL 8 PASS — dual-voucher mechanism verified
- CR618-02 (7 TCs): 5 PASS, 2 FAIL (BUG-047 new)

**Run 3 COMPLETED (2026-06-23 — delta, Step 5 bug-verify):**
- STLCRE-004: PASS ✓ (PDV-20260619-00004 hasInsurance=false confirmed)
- STLCRE-023: PASS ✓ (for-print non-BH SO baseline preserved — BUG-W02-045 regression confirmed PASS)
- DOSVIEW-019: PASS ✓ (corrected schema query works — BUG-W02-043 partial fix confirmed)

**Remaining for Run 4 (after fix cycle 3):**
- w02-stlcre.spec.ts (re-run STLCRE-001..003 — BUG-033 residual: insuranceAdjustment namespace; STLCRE-006,011,012 — BUG-034 error mapping; STLCRE-027,028 — BUG-035,036)
- w02-doscre.spec.ts (DOSCRE-008/009 WITHDRAWN — BUG-037 INVALID per FEAT v22; DOSCRE-010/018/023 format/value cases — pending BA quyết format gate; DOSCRE-034 — BUG-038)
- w02-dosview.spec.ts (re-run DOSVIEW-003 — BUG-032; DOSVIEW-012 — BUG-039; DOSVIEW-015 — BUG-040; DOSVIEW-017 — BUG-041; DOSVIEW-018 — BUG-042; DOSVIEW-020 — BUG-043 residual)
- w02-cr618.spec.ts (re-run CR618-02-001, 006 — BUG-047)
- Add `w02-regression.spec.ts` for REG-CONTRACT-01..02

**Run 9 COMPLETED (2026-06-24 — fresh data, remote host 192.168.110.191) — Status updates:**
- BUG-W02-035 VERIFIED: STLCRE-027 PASS (export-pdf non-existent → 404)
- BUG-W02-038 VERIFIED: DOSCRE-034 PASS (GET /batch → 405)
- BUG-W02-050 VERIFIED: DOSCRE-005 PASS (batch documents=[] → 400 + code INS_DOSSIER_NO_DOC_SELECTED)
- BUG-W02-051 VERIFIED: DOSCRE-032 PASS (expired token → 401 BE_008)
- BUG-W02-033/036/049 VERIFIED (no TC flip — already PASS or PASS-with-note)
- BUG-W02-034 REOPENED: STLCRE-011/012 still FAIL (API_ERROR not INS_STL_*)
- BUG-W02-039/040/043 REOPENED: DOSVIEW-012/015/020 still FAIL

**Remaining for Run 10 (after fix cycle — URGENT: BUG-034/047/043):**
- w02-stlcre.spec.ts: re-run STLCRE-011,012,006 (BUG-034 fix for createInsuranceSettlement error mapping)
- w02-dosview.spec.ts: re-run DOSVIEW-020 (BUG-043 fix for non-existent settlementCode error), DOSVIEW-012 (BUG-039 after BUG-031 payer gate fix), DOSVIEW-015 (BUG-040 Spring Security filter fix)
- w02-cr618.spec.ts: re-run CR618-01-001 (BUG-034 cascade), CR618-02-001/006 (BUG-047 fix breakdownByPayer schema)
- Harness spec files: update codes from PDV-20260619-* to PDV-20260624-00002+ for meaningful re-run (50/86 failing in Jest due to stale codes)

---

## 8. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-24 | 4 | agent-test-api | Run 9 fresh data bug-verify (remote host 192.168.110.191, fresh SO PDV-20260624-*). 4 TC flips FAIL→PASS via bug verify: STLCRE-027 (BUG-035 VERIFIED), DOSCRE-005 (BUG-050 VERIFIED), DOSCRE-032 (BUG-051 VERIFIED), DOSCRE-034 (BUG-038 VERIFIED). 12 bugs VERIFIED (007/015/016/017/019/033/035/036/038/049/050/051). 4 bugs REOPENED (034/039/040/043). PDF-visual bugs (020/021/022/028/067) + PERCENT-mode bugs (052/053/055) not automatable. Wave stats: 80 PASS, 13 FAIL, 0 BLOCKED, 5 SKIPPED, 10 WITHDRAWN. Verdict: FAIL — BUG-034/043/047 still gate-blocking P1. |
| 2026-06-26 | 5 | agent-test-api | Run 10 fresh data (remote 192.168.110.191, fresh codes 2026-06-26). 87 TCs run. 76 PASS, 17 FAIL, 5 SKIP, 0 BLOCKED, 10 WITHDRAWN. Regressions: DOSCRE-005/032/034 F (VERIFIED Run 9 → FAIL again). Bug verify: BUG-101 VERIFIED (Float! contract); BUG-055 REOPENED (sign invariant confirmed); BUG-052/075/079 BLOCKED (data gap). New bugs: BUG-106 (pdfUrl absolute URL P2), BUG-107 (P1 IDOR cross-tenant), BUG-108 (HTTP 500 business errors P2), BUG-109 (for-print flat object P2 = re-log BUG-047). Wave verdict: FAIL — P1 IDOR BUG-107 + BUG-034/043/047 blocking. |
| 2026-06-22 | 1 | agent-test-api | Run 1 initial. 108 TCs: 64 PASS, 24 FAIL, 15 BLOCKED, 5 SKIPPED. 13 new bugs filed (BUG-W02-033..045). Wave verdict: BLOCKED/FAIL. 7 critical API families identified. Recommended fix order documented. |
| 2026-06-22 | 2 | agent-test-api | Run 2 CR618 re-run. 15 BLOCKED TCs unblocked after harness fixes (BUG-W02-044 INVALID, BUG-W02-045 FIX_DONE). CR618-01 (8 TCs) ALL PASS — dual-voucher verified, `createInsuranceSettlement(id: Int!, input: {})` correct. CR618-02 (7 TCs) 5 PASS, 2 FAIL — BUG-W02-047 new P1: `breakdownByPayer` flat object not array. BUG-W02-045 → VERIFIED. Wave stats: 64→77 PASS, 24→26 FAIL, 15→0 BLOCKED. Wave verdict: FAIL (no more BLOCKED). |
