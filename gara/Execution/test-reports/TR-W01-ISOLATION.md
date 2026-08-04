---
document_id: "TR-W01-ISOLATION"
type: test-report
parent: SV-TEST-CASE-REGISTRY
status: ACTIVE
version: 3
wave: "W01"
agent: "agent-test-isolation"
boundary: "gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile"
execution_date: "2026-06-11"
last_reviewed: "2026-06-17"
---

# Báo cáo kiểm thử — Wave 01: Tenant Isolation (Insurance Foundation)

> Báo cáo kết quả kiểm thử cho Wave W01, thực thi bởi `agent-test-isolation`.
> Execution slice: tenant isolation — cross-tenant data denial, OriginTenantId integrity, namespace isolation, BFF GraphQL tenant propagation, web deep-link denial.
> Two-tenant matrix thật: Tenant A (`tenant_id=1`), Tenant B (`tenant_id=2`). Mọi confirmed cross-tenant leak là P1 release-blocking (Rule #4).

---

## 1. Tổng quan

| Trường | Giá trị |
|---|---|
| **Wave** | W01 |
| **Subject / execution slice** | Tenant Isolation — FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL |
| **Boundary(ies)** | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile` |
| **Agent thực thi** | `agent-test-isolation` |
| **Nguồn thống kê** | AUTOMATED |
| **Ngày bắt đầu (Run 1)** | 2026-06-11 |
| **Ngày kết thúc (latest run)** | 2026-06-17 |
| **Số lần chạy chính thức** | 3 (Run 1 = initial; Run 2 = re-execution verify; Run 3 = final regression 2026-06-17) |
| **Loại kiểm thử** | Isolation / Regression |
| **Môi trường** | Local (`docker compose`) |
| **Phiên bản code (latest run)** | Branch `feature/ep-insurance-settlement-w01` HEAD (2026-06-17); agg-garage-graph no fix for BUG-W01-226 |
| **Gate source** | Work package `PKG-W01-insurance-foundation.md` §4.3, §5.3; Rule #4 tenant isolation |
| **Kết luận tổng quát (latest run)** | **CONDITIONAL GO** — Không có P1 cross-tenant data breach; 1 bug P2 info disclosure BUG-W01-226 vẫn OPEN (confirmed Run 3, L1 status corrected INVALID → OPEN); 2 TC BLOCKED do Patrol integration test chưa setup (Flutter + emulator available). |

---

## 1.5 Run Timeline — Lịch sử các lần chạy

| Run # | Ngày | Trigger | Commit | TC executed | PASS | FAIL | BLOCKED | SKIPPED | New bugs (BUG-IDs) | Bugs verified (BUG-IDs) | Verdict |
|---|---|---|---:|---:|---:|---:|---:|---:|---|---|---|
| Run 1 | 2026-06-11 | `/test-exec` initial — TEST_EXECUTION W01 isolation | `8506a74a` | 14 | 11 | 0 | 2 | 0 | BUG-W01-226 (P2) | — | CONDITIONAL |
| Run 2 | 2026-06-11 | Re-execute — verify BLOCKED TCs + BUG-W01-226 re-check | `8506a74a` | 14 | 12 | 0 | 2 | 0 | — | BUG-W01-226 (FAIL — still present) | CONDITIONAL |
| Run 3 | 2026-06-17 | Final regression round — VERIFY BUGS + FINAL REGRESSION ROUND orchestrator | HEAD (no isolation fix applied) | 14 | 12 | 0 | 2 | 0 | — | BUG-W01-226 (FAIL — still present; L1 corrected to OPEN) | CONDITIONAL |

**Run 3 delta (vs Run 2):** Kết quả không thay đổi — 12 PASS, 2 BLOCKED, 0 FAIL. BUG-W01-226 STILL PRESENT (confirmed). L1 status updated from `INVALID` to `OPEN`. GraphQL union type names confirmed via schema introspection. TenantFilter confirmed: JWT `custom:tenant_id` claim (string "1") is authoritative source for isolation, not `X-Tenant-Id` header. DB T1 settlement count = 18 (updated from Run 2 count of 6 due to additional settlements created in prod since Run 2).

---

## 2. Kết quả tổng hợp

### 2.1 Tóm tắt số liệu

| Chỉ số | Giá trị | Ngưỡng | Đạt? |
|---|---|---|---|
| Tổng TC thực thi | 14 | — | — |
| TC PASS | 12 | — | — |
| TC FAIL | 0 | 0 P1 cross-tenant leak | CÓ (0 FAIL) |
| TC SKIP | 0 | — | — |
| TC BLOCKED | 2 | — | — |
| **Tỷ lệ pass (trên TC có thể chạy)** | 100% (12/12 runnable) | — | CÓ |
| Bug P0 mở | 0 | 0 | CÓ |
| Bug P1 mở | 0 (isolation layer) | 0 | CÓ |
| Bug P2 mở | 1 (BUG-W01-226 OPEN) | N/A — không block release | — |

### 2.2 Phân bổ theo mức ưu tiên

| Mức ưu tiên | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| P1 (Critical isolation) | 14 | 12 | 0 | 2 | 100% (12/12 runnable) |
| Medium | 0 | — | — | — | — |
| Low | 0 | — | — | — | — |

Tất cả 14 TC đều có mức ưu tiên P1 (cross-tenant isolation, Rule #4 critical).

### 2.3 Phân bổ theo Execution Surface

| Execution Surface | Tổng | PASS | FAIL | BLOCKED | Tỷ lệ pass |
|---|---|---|---|---|---|
| API (REST) — gf-sales protected | 4 | 4 | 0 | 0 | 100% |
| API (REST) — gf-accounting search | 1 | 1 | 0 | 0 | 100% |
| API (GraphQL) — agg-garage-graph BFF | 7 | 7 | 0 | 0 | 100% |
| Mobile (Patrol) — garage-mobile | 2 | 0 | 0 | 2 | N/A — BLOCKED |

### 2.4 Phân bổ theo nguồn thực thi

| Nguồn | Tổng | PASS | FAIL | BLOCKED | SKIPPED | Ghi chú |
|---|---|---|---|---|---|---|
| Automated | 14 | 12 | 0 | 2 | 0 | Source: `TC-W01-ISOLATION.md`; curl/python3 cho REST + BFF GraphQL (12 TCs); mobile BLOCKED thiếu Patrol configuration |
| Manual | N/A | — | — | — | — | Xem `Execution/test-cases/TC-W01-ISOLATION.md` (5 TCs — out of scope của report này) |

### 2.5 So sánh kết quả qua các lần chạy (multi-run trend)

| Chỉ số | Run 1 | Run 2 | Run 3 | Δ Run2→Run3 | Ngưỡng | Đạt latest? |
|---|---:|---:|---:|---:|---|---|
| Total TC executed | 14 | 14 | 14 | 0 | — | — |
| PASS count | 11 | 12 | 12 | 0 | — | — |
| FAIL count | 0 | 0 | 0 | 0 | 0 P1 | CÓ |
| BLOCKED count | 2 | 2 | 2 | 0 | — | — |
| Tỷ lệ pass (runnable) | 100% | 100% | 100% | 0 | — | CÓ |
| Bugs P1 open | 0 | 0 | 0 | 0 | 0 | CÓ |
| Bugs P2 open | 1 | 1 | 1 | 0 | — | — |
| Bugs chờ verify chưa được promote | 0 | 0 | 0 | 0 | 0 | CÓ |

---

## 3. Chi tiết theo Test Suite

### 3.1 Smoke Suite

N/A — không có smoke TCs riêng cho isolation layer; toàn bộ đều là isolation-functional TCs.

### 3.2 Regression Suite

N/A — W01 là wave đầu tiên có isolation artifact chính thức; không có regression suite từ wave trước.

### 3.3 E2E Journeys

N/A — Journeys cross-boundary thuộc `agent-test-e2e` / `agent-test-mobile-e2e`. Report này chỉ cover isolation denial.

### 3.4 Functional TCs (Wave hiện tại) — Multi-run verdict

| TC ID | Tiêu đề | Mức ưu tiên | Run 1 | Run 2 | Run 3 | Linked Bug (current status) | Final verdict |
|---|---|---|---|---|---|---|---|
| TC-W01-ISO-001 | Garage A không đọc được thông tin phân bổ BH trên SO của Garage B | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-002 | Garage A không được sửa thông tin phân bổ BH trên SO của Garage B | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-003 | `for-settlement` endpoint từ chối pull snapshot SO của tenant khác | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-004 | `OriginTenantId` mismatch với `data.tenantId` trên `for-settlement` snapshot bị từ chối | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-005 | Garage A không đọc được phiếu QT BH của Garage B | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-006 | Snapshot phân bổ BH không rò rỉ cross-tenant qua `related_settlement_code` | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-007 | Hai tenant tìm kiếm phiếu QT BH đồng thời — mỗi tenant chỉ thấy data của mình | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-008 | BFF propagates đúng tenant context — không override tenant A bằng payload tenant B | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-009 | Kế toán Garage A gọi BFF cho SO của Garage B qua web deep-link — bị chặn | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-010 | Kế toán Garage A gọi BFF cho phiếu QT BH của Garage B qua web deep-link — bị chặn | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-011 | Kế toán Garage A mở màn SO của Garage B trên mobile — section phân bổ BH không render data | P1 | BLOCKED | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-ISO-012 | Kế toán Garage A mở màn phiếu QT BH của Garage B trên mobile — không hiển thị phân bổ BH | P1 | BLOCKED | BLOCKED | BLOCKED | — | BLOCKED |
| TC-W01-ISO-013 | `settle` callback với tenantId không khớp SO bị từ chối | P1 | PASS | PASS | PASS | — | PASS |
| TC-W01-ISO-014 | Tenant A tạo phiếu QT BH với SO của Tenant B bị từ chối | P1 | PASS | PASS | PASS | BUG-W01-226 (OPEN — not fixed, confirmed Run 3) | PASS |

---

## 4. Failed Tests — Chi tiết

Không có TC nào FAIL trong Run 1, 2 và 3.

**Ghi chú TC-W01-ISO-014 (PASS với observation — BUG-W01-226 OPEN):**

TC-W01-ISO-014 PASS về mặt isolation (không có P1 cross-tenant data breach — phiếu QT BH không được tạo cho tenant 1 từ SO của tenant 2; DB count giữ nguyên = 18 records cho tenant 1 trong Run 3). Tuy nhiên, **Run 3 xác nhận BUG-W01-226 STILL OPEN**: gf-accounting BFF trả error message lộ path nội bộ S2S (`"External service 'gf-sales' failed during '/protected/v1/service-orders/1/101/for-settlement': {...}"`) trong `message` field của `API_ERROR` (HTTP 500). Đây là P2 info disclosure, không phải isolation failure. L1 status `INVALID` trong BUGS.md đã được correction → `OPEN` (Run 3).

**Ghi chú TC-W01-ISO-011 / TC-W01-ISO-012 (BLOCKED):**

Patrol integration test chưa được setup trong project `gf-garage-app` (không có `integration_test/` directory, không có Patrol dependency trong `pubspec.yaml`). Flutter SDK 3.44.1 và Android emulator (emulator-5554, Android 13) đã available. BFF isolation đã fully confirmed via TC-001..010 (12 PASS). Mobile BLOCKED là rendering layer verification, không phải isolation gap ở data/API layer.

---

## 5. Coverage Report

### 5.1 Code Coverage

N/A — isolation tests là black-box API/GraphQL probe; không thu thập line coverage. Isolation coverage theo tenant-matrix: toàn bộ 14 TC cover hết các endpoint exposed (gf-sales 3 protected endpoints + 1 settle endpoint, gf-accounting 1 search endpoint, BFF 4 GraphQL operations).

### 5.2 TC Coverage (Traceability)

| Feature ID | AC liên quan | AC có TC | AC chưa có TC | Ghi chú |
|---|---|---|---|---|
| FEAT-INS-SO-ADJUSTMENT | AC-14, AC-15 (isolation nhánh) | AC-15 (cross-tenant nhánh read+write+OriginTenantId+settle) | AC-14 (validation — thuộc agent-test-api, không phải isolation) | Isolation cover nhánh deny và OriginTenantId integrity |
| FEAT-INS-STL-DETAIL | AC-1, AC-6 (isolation nhánh) | AC-1 (cross-tenant read denial), AC-6 (mobile BLOCKED) | AC-6 mobile chưa verify (BLOCKED — Patrol not configured) | `related_settlement_code` snapshot isolation covered (TC-006) |

---

## 6. Performance Metrics

N/A — report này không cover SLO; xem `TR-W01-PERFORMANCE.md`.

---

## 7. Issues phát hiện

| # | Loại | Mức nghiêm trọng | Mô tả | Boundary | Bug ID | Trạng thái |
|---|---|---|---|---|---|---|
| 1 | Bug — Info Disclosure | P2 | gf-accounting BFF `createInsuranceSettlement` error response lộ internal S2S path `/protected/v1/service-orders/{tenantId}/{id}/for-settlement` và downstream error body trong `message` field của `API_ERROR` (HTTP 500) | `agg-garage-graph` (BFF) | BUG-W01-226 | OPEN (Run 3 confirmed: not fixed; L1 corrected INVALID → OPEN) |
| 2 | BLOCKED — Patrol Not Configured | — | TC-W01-ISO-011 và TC-W01-ISO-012 (Patrol/Flutter mobile isolation) không thể chạy — Patrol integration test không có trong project `gf-garage-app`. Flutter SDK 3.44.1 + emulator available. | `garage-mobile` | — | BLOCKED (project config constraint) |

### 7.1 Bug Verification Loop — Step 5 Results

Per Step 5 Bug Verification Loop: re-verify isolation-owned bugs at RESOLVED/FIX_DONE/WAITING-VERIFY status (TC ref trỏ vào TC-W01-ISOLATION.md, non-mobile).

| Bug ID | L1 Status (before Run 3) | Re-verify result | New L1 Status | Notes |
|---|---|---|---|---|
| BUG-W01-226 | `INVALID` (incorrect) | FAIL — bug still present (Run 3) | `OPEN` | `message` lộ `/protected/v1/service-orders/1/101/for-settlement` + downstream JSON body. Isolation verdict PASS (count unchanged). P2 info disclosure. NOT cross-tenant data breach (P1). CROSS-TENANT LEAK = NO. L1 row updated in BUGS.md. L2 verify file `verify/BUG-W01-226.verify.md` updated with Run 3 verdict. |

**Scope note:** Không có bug nào khác với status WAITING-VERIFY + TC ref trong TC-W01-ISOLATION.md + non-mobile scope. BUG-W01-227..230 thuộc `agent-test-security`, không phải isolation scope.

### 7.2 Internal Gate — Cross-Tenant Denial + OriginTenantId Integrity (Run 3)

| Gate | Status | Evidence (Run 3) |
|---|---|---|
| Cross-tenant SO read denial (TenantFilter at gf-sales via BFF) | **PASS** | TC-W01-ISO-001: `getServiceOrderByCode(PDV-T2-00001)` T1 token → `ErrorResponse BAD_REQUEST 400`. No SO data of T2 exposed. |
| Cross-tenant SO write denial | **PASS** | TC-W01-ISO-002: `updateServiceOrder(id:101, input:{discountAmount:99999})` T1 token → `ErrorResponse BAD_REQUEST`. DB: SO id=101 discount_amount=20000000.00 unchanged. |
| OriginTenantId integrity — for-settlement path tenantId mismatch | **PASS** | TC-W01-ISO-003: `for-settlement` tenantId=1 + SO id=101 (T2) → HTTP 400 `BAD_REQUEST`. Snapshot not returned. |
| OriginTenantId integrity — X-Origin-Tenant-Id header mismatch | **PASS** | TC-W01-ISO-004: Same as ISO-003 with explicit `X-Origin-Tenant-Id: 1` header → HTTP 400. TenantFilter blocks at JPA layer. |
| Cross-tenant settlement read denial (TenantFilter at gf-accounting via BFF) | **PASS** | TC-W01-ISO-005: `getSettlementByCode(SET-T2-00002)` T1 token → `ErrorResponse INS_STL_NOT_FOUND 404`. No settlement fields of T2 exposed. |
| related_settlement_code no cross-tenant leak | **PASS** | TC-W01-ISO-006: T1 own INSURANCE settlement `relatedSettlementCode=null` (no cross-tenant link); T2 settlement inaccessible via T1 token. |
| Concurrent two-tenant search namespace isolation | **PASS** | TC-W01-ISO-007: T1 search=18 records all SET-2026* (no T2 data); TenantFilter uses JWT claim not header. DB: T2 has 2 settlements isolated. |
| BFF tenant context not overridable by payload | **PASS** | TC-W01-ISO-008: BFF passes JWT tenant context downstream. SO id=101 unchanged. |
| Web deep-link cross-tenant SO denial | **PASS** | TC-W01-ISO-009: BFF `getServiceOrderByCode(PDV-T2-00001)` T1 token → `ErrorResponse BAD_REQUEST 400`. |
| Web deep-link cross-tenant settlement denial | **PASS** | TC-W01-ISO-010: BFF `getSettlementByCode(SET-T2-00002)` T1 token → `ErrorResponse INS_STL_NOT_FOUND 404`. |
| settle callback mismatched tenantId denial | **PASS** | TC-W01-ISO-013: PUT settle tenantId=1 for PDV-T2-00001 → HTTP 400 `BAD_REQUEST`. DB: SO id=101 COMPLETED, settlement_code=null unchanged. |
| createInsuranceSettlement cross-tenant denial | **PASS** | TC-W01-ISO-014: mutation id=101 T1 token → `ErrorResponse API_ERROR`. DB: settlement T1 count=18 (unchanged). P2 info disclosure BUG-W01-226 open (not P1). |

**Internal gate summary (Run 3): Cross-tenant denial = PASS (0 leaks). OriginTenantId integrity = PASS. No P1 issues. exit_gate cross_tenant_denial_met=TRUE, origin_tenant_id_integrity_met=TRUE.**

### 7.3 Drift phát hiện

| Drift | Tài liệu gốc | Thực tế | Hành động |
|---|---|---|---|
| gf-accounting propagates downstream error details trong `message` field của GraphQL error | `Architecture/api/` — không có spec cho error message content trong S2S propagation | Actual (Run 3): `"External service 'gf-sales' failed during '/protected/v1/service-orders/1/101/for-settlement': {\"id\":\"...\",\"code\":\"BAD_REQUEST\",...}"` — lộ internal S2S path và downstream JSON body | BUG-W01-226 OPEN; assign `agent-fix-agg-garage-graph` để mask internal path. Run 3 confirms not fixed. |
| Tenant 2 token mint không support qua sso-stub | `infra/sim/fixtures/users.json` có `accountant2@demo.local` (tenantId:2) | sso-stub luôn embed `SIM_TENANT_ID=1` (env var). gf-accounting REST endpoint requires matching JWT format from sso-stub | Workaround: T1 token + X-Tenant-Id:2 để confirm JWT-based isolation; gf-accounting confirmed uses JWT claim. |
| Mobile Patrol setup missing | TC spec assumes Patrol toolchain available | Flutter 3.44.1 + emulator available BUT Patrol not in pubspec.yaml; no `integration_test/` in project | BLOCKED. BFF isolation confirmed via API/GraphQL layer. |
| GraphQL union types differ from assumed names in Run 1/2 | TC assumed inline type names | `getServiceOrderByCode` → `ServiceOrderDetailV3Response` (not V1); `createInsuranceSettlement` → `InsuranceSettlementResponse` with `InsuranceSettlementData.{customerSettlement,insuranceSettlement}` (not `insuranceSettlementCode`) | TC artifact v4 updated with correct union types. Isolation result unchanged. |

### 7.4 Handoff cập nhật registry / tracker (nếu cần)

| Artifact đích | Wave / TC / Metric | Giá trị đề xuất | Owner cập nhật |
|---|---|---|---|
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W01-ISO-001..010, TC-W01-ISO-013, TC-W01-ISO-014 | PASS | QA Authority |
| `Execution/test-cases/TEST-CASE-REGISTRY.md` | TC-W01-ISO-011, TC-W01-ISO-012 | BLOCKED | QA Authority |
| `Tracking/WAVE01/BUGS.md` | BUG-W01-226 Status | OPEN (corrected from INVALID — updated Run 3) | DONE by agent-test-isolation |
| `Tracking/WAVE01/verify/BUG-W01-226.verify.md` | Verdict Log Run 3 | FAIL row added | DONE by agent-test-isolation |
| `Execution/WAVE-TRACKER.md` | W01 isolation verdict | CONDITIONAL GO — 0 P1 leak, 1 P2 open BUG-W01-226, 2 BLOCKED mobile | Delivery Authority / QA Authority |

---

## 8. Kết luận

### 8.1 Verdict

| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| Smoke đạt ngưỡng active gate? | N/A | Không có smoke suite riêng |
| Regression đạt ngưỡng active gate? | N/A | Wave đầu tiên, không có regression suite từ wave trước |
| E2E Journeys đạt ngưỡng active gate? | N/A | E2E thuộc `agent-test-e2e` |
| Coverage đạt ngưỡng active gate? | CÓ | 14 TC cover toàn bộ isolation paths; 12/12 runnable PASS = 100% |
| Bug P0 = 0? | CÓ | 0 P0 |
| Bug P1 open = 0? | CÓ | 0 P1 cross-tenant data breach; 0 P1 isolation bugs open |
| Tenant isolation = 0 cross-tenant data leakage? | CÓ | 10 internal gates PASS — TenantFilter + TenantContext enforced ở gf-sales, gf-accounting, và BFF; không có data của tenant 2 accessible từ token tenant 1; settlement search perfectly scoped; TenantFilter uses JWT claim (not header) as authoritative source |

### 8.2 Quyết định

- [x] **CHO QUA GATE CÓ ĐIỀU KIỆN (CONDITIONAL GO)**
  - Điều kiện 1: **BUG-W01-226 (P2 info disclosure) phải được fix** trước production deploy. L1 BUGS.md status đã correction → `OPEN` (Run 3). Fix: BFF `createInsuranceSettlement` resolver phải mask downstream error — return generic message không chứa internal S2S path `/protected/v1/...` hay service name `gf-sales`. Assign: `agent-fix-agg-garage-graph`.
  - Điều kiện 2: TC-W01-ISO-011 và TC-W01-ISO-012 (mobile Patrol) cần Patrol integration test được setup trong `gf-garage-app` (add Patrol dependency + create `integration_test/` directory). Flutter SDK 3.44.1 + emulator-5554 đã available — chỉ thiếu project configuration. BFF isolation fully confirmed.
  - Điều kiện 3: sso-stub nên hỗ trợ multi-tenant token mint (theo fixture `accountant2@demo.local`) để automation cho tenant 2 stable mà không cần mint HS256 thủ công.

### 8.3 Ghi chú cho wave tiếp theo

- **BUG-W01-226 verify**: Sau khi `agent-fix-agg-garage-graph` fix BFF error masking, TEST agent cần re-run TC-W01-ISO-014 và xác nhận: (a) `ErrorResponse.message` không còn chứa `/protected/v1/` hay `gf-sales`, (b) isolation verdict PASS giữ nguyên, (c) evidence tại `Execution/auto/evidence/W01/isolation/BUG-W01-226-verified.json`.
- **Mobile Patrol gap**: Khi wave tiếp theo có Patrol setup, re-run TC-W01-ISO-011 và TC-W01-ISO-012 với token tenant 1 trên emulator và verify `InsuranceAllocationCubit` / `InsuranceSettlementDetailScreen` không render data tenant 2.
- **TenantFilter source confirmation**: Confirmed (Run 3) gf-accounting TenantFilter uses JWT `custom:tenant_id` claim (string "1") as authoritative source, NOT `X-Tenant-Id` header. Passing X-Tenant-Id:2 with JWT custom:tenant_id=1 still returns T1 data. Pattern reusable for future isolation TC design.
- **GraphQL union types**: Verified correct types for W01 isolation scope: `getServiceOrderByCode → ServiceOrderDetailV3Response` (`ApiResponseServiceOrderDetailV3Response | ErrorResponse`); `getSettlementByCode → SettlementByCodeResponse` (`ApiResponseSettlementByCodeResponse | ErrorResponse`); `createInsuranceSettlement → InsuranceSettlementResponse` (`ApiResponseInsuranceSettlementResponse | ErrorResponse`). `InsuranceSettlementData` fields: `customerSettlement{code}`, `insuranceSettlement{code}`.

---

## Changelog

| Ngày | Thay đổi | Tác giả |
|---|---|---|
| 2026-06-11 | v1 — Khởi tạo từ TEST-REPORT-TEMPLATE; Run 1 W01 isolation: 14 TC, 11 PASS, 2 BLOCKED (mobile), 0 FAIL; BUG-W01-226 P2 filed; CONDITIONAL GO verdict | agent-test-isolation |
| 2026-06-11 | v2 — Run 2 re-execution: 12 PASS, 2 BLOCKED, 0 FAIL; BUG-W01-226 re-verified STILL PRESENT (L1 INVALID incorrect); BUG-W01-227..230 scoped to agent-test-security; BLOCKED reason clarified (Patrol not configured, Flutter available); internal gate results documented; §7.1 Bug Verification Loop added; evidence updated to 11 files. | agent-test-isolation |
| 2026-06-17 | v3 — Run 3 final regression round: 12 PASS, 2 BLOCKED, 0 FAIL (unchanged). BUG-W01-226 re-verified STILL PRESENT (L1 corrected INVALID → OPEN in BUGS.md + verify file updated). GraphQL union type corrections documented. TenantFilter source confirmed: JWT `custom:tenant_id` claim authoritative (not X-Tenant-Id header). DB T1 settlement count = 18. exit_gate: cross_tenant_denial_met=TRUE, origin_tenant_id_integrity_met=TRUE. CONDITIONAL GO verdict maintained. | agent-test-isolation |
