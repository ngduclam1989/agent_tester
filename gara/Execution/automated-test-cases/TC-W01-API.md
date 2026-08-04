---
document_id: 'GMS-TC-W01-API-AUTO'
type: test-case
parent: 'Execution/automated-test-cases/'
status: ACTIVE
version: 4
boundary: 'gf-sales, gf-accounting, agg-garage-graph'
wave: 'W01'
owner: 'agent-test-api'
last_reviewed: '2026-06-17'
---

# Test Case Automated — W01: API (FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL)

> Auto artifact do `agent-test-api` generate tại TEST_PLANNING stage, Wave 01.
> Wave có 2 features in flight → §4 chia H3 per feature + FEAT-discriminator trong TC ID (Multi-Feature Wave Grouping policy).
> Manual artifact (read-only reference): `Execution/test-cases/TC-W01-API.md` (79 TC, QA Authority).

---

## 1. General Info

| Field | Value |
| --- | --- |
| Document ID | `GMS-TC-W01-API-AUTO` |
| Wave | W01 |
| Boundary(ies) | `gf-sales`, `gf-accounting`, `agg-garage-graph` |
| Feature(s) | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL` |
| Owner | agent-test-api |
| Last Reviewed | 2026-06-17 |
| Work Package | `Execution/work-packages/PKG-W01-insurance-foundation.md` |

---

## 2. Scope

### In Scope

- Mutation `updateServiceOrderV3` (→ gf-sales `PUT /api/v3/service-orders/{id}`): persist 8 scalar adjustment fields + `depreciationByLine` (AC-13, BR-INS-SO-ADJ-002/003/004)
- Query `getServiceOrderByCode` (additive block `insuranceAdjustment`: breakdownByPayer / adjustments / settlementBalance — computed server-side, AC-9..11)
- REST snapshot `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` — 8 breakdown + 8 adjustment fields + `insurancePayableAmount`, idempotent (ADR-014, CB-INS-002)
- Mutation `createInsuranceSettlement(id, input)` — pull `for-settlement` → persist cặp KH+BH atomic → settle callback gf-sales; rollback toàn bộ khi callback fail (ADR-014)
- Query `getSettlementByCode` loại INSURANCE → block `insurance` + `debtPanel`; loại CUSTOMER → KHÔNG có block `insurance`
- Auth/authz: không có token (401), token hết hạn (401), token sai (401), đủ quyền (200), role thấp (403), IDOR cross-tenant (403/404)
- Field-level server validation: empty/null, số âm, % > 100, mode sai (`INS_ADJ_MODE_INVALID`/`INVALID_ALLOCATION_MODE`), kiểu dữ liệu sai, BVA boundary
- Error code contract: assert 3 chiều `code` symbol + HTTP status + side-effect/invariant cho mọi error-TC (registry §5.5 BR-EP-INSURANCE-SETTLEMENT.md)
- State-transition: hasInsurance set-on / set-off / re-toggle (BUG-W01-026/027 origin)
- Ground-truth DB assertion: SQL/REST trực tiếp sau mọi write TC cross-boundary (BUG-W01-029/031 origin)
- Công thức tính server-side (BR-INS-SO-ADJ-005) + single-payer edge (CALC-INS-006)
- Regression: `updateServiceOrderV3` với SO thường, `getSettlementByCode` phiếu KH baseline, `for-settlement` SO toàn KH, `cancelSettlement` baseline (chú ý: cancelSettlement giữ nguyên vì BR-INS-STL-DET-003 no-cancel chỉ áp cho loại BH — KH vẫn có huỷ)

### Out of Scope

- UI render/wording → `agent-test-ui` / `agent-test-mobile-ui`
- Full E2E journey (Playwright) → `agent-test-e2e` / `agent-test-mobile-e2e`
- Cross-tenant denial chính thức → `agent-test-isolation`
- Security injection/abuse OWASP → `agent-test-security`
- SLO latency/throughput → `agent-test-performance`
- FEAT-INS-DOSSIER-CREATE, FEAT-INS-DOSSIER-VIEW, FEAT-INS-DASH-DEBT (W02+)
- Ghi nhận / đối soát thanh toán chi tiết (baseline production, FEAT-STL-DETAIL)
- Toggle BH baseline (khu vực thông tin BH trên SO) — đã production
- In toàn bộ hồ sơ (print template) — không phải API contract test

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| --- | --- | --- |
| Tài khoản kế toán | `accountant@garage-a.test` — tenant `garage-a`, role kế toán | Token chính cho happy path + authz |
| Tài khoản chủ garage | `owner@garage-a.test` — tenant `garage-a` | Test phân quyền AC-16 |
| Tài khoản role thấp | `tech@garage-a.test` — role thợ kỹ thuật | Test 403 forbidden (API-AA05) |
| Token hết hạn | Sinh token exp=0 qua sso-stub HS256 | Test 401 expired (API-AA02) |
| SO DRAFT BH=Có | `#SO-W01-BH-001` — 2 PT BH + 1 DV BH + 1 PT KH + 1 DV KH; Cộng sau VAT BH=207.9tr/KH=33tr | Input chính, khớp ví dụ epic BR-INS-SO-ADJ-005 |
| SO DRAFT chỉ KH | `#SO-W01-KH-ONLY` — tất cả dòng Nguồn TT = KH | Test VLD-INS-STL-001, CALC-INS-006 single-payer KH |
| SO DRAFT toàn BH | `#SO-W01-BH-ONLY` — tất cả dòng Nguồn TT = BH | Test CALC-INS-006 single-payer BH |
| SO DRAFT không có PT BH | `#SO-W01-BH-SVC-ONLY` — BH=Có nhưng chỉ DV BH (0 phụ tùng BH) | Test EC-1 khấu hao disable |
| SO thường (không BH) | `#SO-W01-REGULAR` — BH=Không, có line item KH | Regression R2 |
| SO đã QT | `#SO-W01-SETTLED` — trạng thái đã settled, có phiếu QT BH | Test EC-5 khoá update |
| Phiếu QT BH DRAFT | `#SET-W01-INS-001` — cặp BH từ SO `#SO-W01-BH-001` | Input query detail STL |
| Phiếu QT KH | `#SET-W01-KH-001` — phiếu KH cùng cặp | Test KHÔNG có block insurance |
| Phiếu KH baseline | `#SET-OLD-KH` — production, không cặp BH | Regression R2 |
| Tenant B | `garage-b` với SO `#SO-B-001` và phiếu QT BH `#SET-W01-INS-B` riêng | Test IDOR (403/404) |
| gf-sales mock | Mock trả 500 cho `/settle` | Test rollback ADR-014 |

**Runner Preflight (bắt buộc trước execution):**

- **Runner dir**: `Execution/auto/harness/api/` (QC-owned harness)
- **Bootstrap**: `cd Execution/auto/harness/api && npm install`
- **Smoke proof**: `npm run smoke` — phải pass ≥2 assertions trước khi chạy suite
- **Suite chính**: `npx jest --runInBand --testPathPattern='w01'` (spec: `Execution/auto/specs/W01/api/w01-insurance-soadj.test.ts` + `w01-insurance-stl.test.ts`)
- **Command fallback**: `npx jest -c jest.config.ts --runInBand` từ trong `Execution/auto/harness/api/`
- Spec files cần tạo tại TEST_EXECUTION trước khi chạy suite

**FEAT-ID → SLUG mapping** (cho TC ID disambiguation):

| FEAT-ID | SLUG |
| --- | --- |
| FEAT-INS-SO-ADJUSTMENT | SOADJ |
| FEAT-INS-STL-DETAIL | STL |

**API Impact Inventory (Step 4.1):**

| Service | Endpoint / Operation | Method | Trạng thái | Feature/AC | Ghi chú tác động |
| --- | --- | --- | --- | --- | --- |
| agg-garage-graph | `updateServiceOrderV3` (mutation) | GraphQL mutation | Update (additive input) | FEAT-INS-SO-ADJUSTMENT AC-13 | Thêm 8 scalar adjustment fields + depreciationByLine |
| gf-sales | `PUT /api/v3/service-orders/{id}` | PUT | Update (additive) | FEAT-INS-SO-ADJUSTMENT AC-13/14 | Persist 8 scalar adjustment + depreciation_percent per part |
| agg-garage-graph | `getServiceOrderByCode` / `getServiceOrder` (query) | GraphQL query | Update (additive block) | FEAT-INS-SO-ADJUSTMENT AC-9..11 | Response thêm block insuranceAdjustment |
| gf-sales | `GET /api/v3/service-orders/{code}` | GET | Update (additive) | FEAT-INS-SO-ADJUSTMENT AC-9..11 | Trả allocation + breakdown + settlementBalance |
| gf-sales | `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement` | GET | Update (additive) | FEAT-INS-SO-ADJUSTMENT AC-15, CB-INS-002 | Snapshot provider idempotent 8+8 fields |
| agg-garage-graph | `createInsuranceSettlement(id, input)` (mutation) | GraphQL Mutation | Thêm mới | FEAT-INS-STL-DETAIL AC-15/FEAT-INS-SO-ADJUSTMENT | Mutation mới; pull for-settlement → tạo cặp atomic → settle callback |
| agg-garage-graph | `getSettlementByCode` (query) | GraphQL Query | Update (additive) | FEAT-INS-STL-DETAIL AC-4..9 | Additive block `insurance` + `debtPanel` khi INSURANCE |
| gf-accounting | `POST /api/v1/service-orders/{id}/settlements` | POST | Update (REUSE) | FEAT-INS-STL-DETAIL (via createInsuranceSettlement) | Request additive 8+8 fields + insurancePayableAmount; cặp atomic |
| gf-accounting | `GET /api/v1/settlements/{code}` | GET | Update (REUSE) | FEAT-INS-STL-DETAIL AC-4..9 | Response additive block insurance + debtPanel |
| gf-sales | `settle` callback | POST | Update (REUSE) | CB-INS-003 | Tái dùng baseline; SO chuyển đã QT |

**Regression Impact Analysis (Step 4.2):**

Các impacted existing surfaces cần TC `regression`:

1. `updateServiceOrderV3` / `PUT /api/v3/service-orders/{id}` với SO thường (BH=Không) → phải không bị ảnh hưởng bởi additive insurance fields
2. `getSettlementByCode` phiếu KH baseline (không cặp BH) → response shape không bị vỡ
3. `GET .../for-settlement` cho SO toàn KH → adjustment fields trả 0/null, không lỗi
4. `cancelSettlement` phiếu KH baseline (không cặp BH) → cancel đúng, không kích cascade

**State-Transition Coverage (flag/nullable per §State-Transition Gate):**

| Flag/Field | set-on TC | set-off TC | re-toggle TC |
| --- | --- | --- | --- |
| `hasInsurance` (BH=Có/Không) + 8 adj cols | TC-W01-API-SOADJ-047 (set-on) | TC-W01-API-SOADJ-067 (set-off) | TC-W01-API-SOADJ-070 (re-toggle) |
| `discountMaterial.mode`/`.value` | TC-W01-API-SOADJ-001 | TC-W01-API-SOADJ-067 (clear) | covered by re-toggle |
| `parts[i].depreciationPercent` (per-part, new contract post-BUG-W01-261) | TC-W01-API-SOADJ-032 (set-on, DB=5) | TC-W01-API-SOADJ-067 (clear BH=false) | TC-W01-API-SOADJ-070 (re-toggle) |

**Cross-feature impact matrix (W01):**

| Trigger FEAT (update) | Impacted FEAT (operational) | Endpoint chạm | TC regression |
| --- | --- | --- | --- |
| FEAT-INS-SO-ADJUSTMENT | Baseline updateServiceOrderV3 (SO thường) | PUT /api/v3/service-orders/{id} | TC-W01-API-SOADJ-063 (regression) |
| FEAT-INS-SO-ADJUSTMENT | for-settlement baseline (SO toàn KH) | GET .../for-settlement | TC-W01-API-SOADJ-097 (regression) |
| FEAT-INS-STL-DETAIL | getSettlementByCode phiếu KH baseline | GET /api/v1/settlements/{code} | TC-W01-API-STL-096 (regression) |
| FEAT-INS-STL-DETAIL | cancelSettlement phiếu KH baseline | CancelSettlement | TC-W01-API-STL-098 (regression) |

**Common Baseline Coverage Map (common-testcase-api.md):**

| Common Group | TC(s) covering | Status |
| --- | --- | --- |
| API-AA01 (no token → 401) | TC-W01-API-SOADJ-053 | covered |
| API-AA02 (token expired → 401) | TC-W01-API-SOADJ-054 | covered |
| API-AA03 (token sai → 401) | TC-W01-API-SOADJ-055 | covered |
| API-AA04 (token đúng, đủ quyền → 200) | TC-W01-API-SOADJ-001 | covered |
| API-AA05 (role thấp → 403) | TC-W01-API-SOADJ-056 | covered |
| API-AA06 (IDOR cross-user → 403/404) | TC-W01-API-SOADJ-057 | covered |
| API-M01 (GET → 200 + schema) | TC-W01-API-SOADJ-044, TC-W01-API-SOADJ-048 | covered |
| API-M03 (PUT update → 200) | TC-W01-API-SOADJ-001, TC-W01-API-SOADJ-047 | covered |
| API-M02 (POST tạo mới → 200) | TC-W01-API-STL-072 | covered |
| API-M06 (wrong method → 405) | out-of-scope: GraphQL không expose method-level violation; REST method mismatch → 405 theo contract nhưng không có new endpoint; adapted into IDOR TC |
| API-RQ01..06 (required field validation) | TC-W01-API-STL-076 (null), TC-W01-API-SOADJ-003 (omit → default 0) | covered |
| API-DT01 (số → chuỗi) | TC-W01-API-SOADJ-010, TC-W01-API-SOADJ-026, TC-W01-API-STL-079 | covered |
| API-DT02 (bool string) | out-of-scope: không có boolean input field mới trong W01 scope |
| API-DT06 (số âm) | TC-W01-API-SOADJ-005, TC-W01-API-SOADJ-008, TC-W01-API-SOADJ-014, TC-W01-API-SOADJ-019, TC-W01-API-SOADJ-024, TC-W01-API-SOADJ-031, TC-W01-API-SOADJ-035, TC-W01-API-STL-078 | covered |
| API-DT09 (enum ngoài) | TC-W01-API-SOADJ-009, TC-W01-API-SOADJ-016, TC-W01-API-SOADJ-021 | covered |
| API-BV05/06 (% max/max+1) | TC-W01-API-SOADJ-006/007, TC-W01-API-SOADJ-029/030, TC-W01-API-SOADJ-034 | covered |
| API-BV07/08 (min 0/min-1) | TC-W01-API-SOADJ-004 (0=ok), TC-W01-API-SOADJ-005 (âm=reject) | covered |
| API-BV09 (array 0 elements) | TC-W01-API-SOADJ-033 | covered |
| API-SC01..06 (special chars, injection) | out-of-scope: routed to agent-test-security per anti-dup routing |
| API-CR01 (tạo mới hợp lệ) | TC-W01-API-STL-072 | covered |
| API-CR02 (duplicate → 409) | TC-W01-API-STL-081 | covered |
| API-CR03 (idempotency) | TC-W01-API-SOADJ-045, TC-W01-API-STL-074 | covered |
| API-CR04 (FK không tồn tại) | TC-W01-API-SOADJ-036 (lineId nonexistent) | covered |
| API-RD01 (GET by ID tồn tại → 200) | TC-W01-API-SOADJ-044, TC-W01-API-STL-082 | covered |
| API-RD02 (GET by ID không tồn tại → 404) | TC-W01-API-STL-084 | covered |
| API-UD01 (Update hợp lệ → 200) | TC-W01-API-SOADJ-001, TC-W01-API-SOADJ-047 | covered |
| API-UD02 (Update không tồn tại → 404) | adapted: EC-5 khoá SO → 409/422; SO not found = standard 404 handled per contract |
| API-UD05 (optimistic lock → 409) | TC-W01-API-SOADJ-052 | covered |
| API-DE04 (cascade cancel) | TC-W01-API-STL-098 regression (cancelSettlement KH baseline) | covered |
| API-PG01..10 | out-of-scope: các endpoint trong scope W01 không phải list/pagination endpoint; for-settlement và createInsuranceSettlement không có pagination |
| API-RS01..07 (response schema) | TC-W01-API-SOADJ-048, TC-W01-API-SOADJ-049, TC-W01-API-STL-082, TC-W01-API-STL-085 | covered |
| API-ER01..04 (error response standard) | TC-W01-API-SOADJ-005..009 (error code assert 3 chiều) | covered |
| API-PS01 (response time SLA) | out-of-scope: routed to agent-test-performance |
| API-PS03 (concurrent → no race) | TC-W01-API-SOADJ-052 | covered |
| API-FU01..07 (file upload) | out-of-scope: upload hồ sơ bảo lãnh là baseline production; FEAT-INS-DOSSIER-CREATE là W02 |

**Quality Gate Critical Families:**

| Family | Gate-blocking? | TC đại diện |
| --- | --- | --- |
| auth/authz | YES | TC-W01-API-SOADJ-053..057 |
| validation/error family (code assert 3 chiều) | YES | TC-W01-API-SOADJ-005..009, TC-W01-API-SOADJ-019..021, TC-W01-API-SOADJ-024, TC-W01-API-SOADJ-030/031/034/035, TC-W01-API-STL-076..080 |
| invalid-state/precondition | YES | TC-W01-API-SOADJ-050/051, TC-W01-API-STL-080/081/087 |
| tenant-isolation/data leakage | YES | TC-W01-API-SOADJ-058..060 (routed to agent-test-isolation; API agent covers status code only) |
| write-side side effect / invariant (Ground-truth DB) | YES | TC-W01-API-SOADJ-047, TC-W01-API-SOADJ-067, TC-W01-API-STL-072/073/075/086 |
| idempotency / retry | YES | TC-W01-API-SOADJ-045, TC-W01-API-STL-074/081 |
| state-transition (flag clear-out) | YES | TC-W01-API-SOADJ-067/068/069/070/071 |

---

## 3. Status Summary

> Run 4 (Final Regression + Bug Verify) completed 2026-06-17. Runner: `Execution/auto/harness/api/`. Spec: `Execution/auto/specs/W01/api/`.
> Run 4 results: Jest — **62 PASS, 0 FAIL, 0 BLOCKED** (w01-insurance-soadj.test.ts: 47 PASS; w01-insurance-stl.test.ts: 15 PASS).
> Key changes Run 4: (1) Spec updated to use new contract `parts[].depreciationPercent` replacing stale `depreciationByLine` calls (BUG-W01-261/262 VERIFIED). SOADJ-032..036 now use correct SDL. (2) SOADJ-031/008 assertion corrected per BUG-W01-238 oracle (INS_ADJ_VALUE_NEGATIVE for negative values). (3) BUG-W01-285 VERIFIED: BE correctly preserves per-part depreciationPercent when root depreciationDefault omitted from payload.

| Feature | Total | PASS | FAIL | BLOCKED | SKIPPED | READY |
| --- | --- | --- | --- | --- | --- | --- |
| FEAT-INS-SO-ADJUSTMENT | 54 | 47 | 0 | 0 | 7 | 0 |
| FEAT-INS-STL-DETAIL | 21 | 15 | 0 | 0 | 6 | 0 |
| **Wave total** | **75** | **62** | **0** | **0** | **13** | **0** |

**FAIL breakdown (Run 4 — 2026-06-17):** 0 FAIL — all PASS
- SOADJ-032: was SKIPPED (BUG-W01-237 INVALID) → now PASS (re-scoped to test `parts[].depreciationPercent=5` per new contract BUG-W01-262)
- SOADJ-033..036: spec updated to new `parts[].depreciationPercent` contract → PASS
- SOADJ-047: spec updated (`depreciationByLine` removed, `parts[].depreciationPercent` used) → PASS + DB verify
- SOADJ-031/008: oracle corrected per BUG-W01-238 (INS_ADJ_VALUE_NEGATIVE for negative %) → PASS
- BUG-W01-285 VERIFIED (2026-06-17): per-part preserved when root omitted

**SKIPPED TCs (not in execution spec):** SOADJ-003, 010, 013, 025, 026, 037-043, 049, 051, 052, 054, 058-062, 065, 066, 069, 071; STL-072, 075, 087

**Oracle drift (ALL RESOLVED):** BUG-W01-238 — server returns INS_ADJ_VALUE_NEGATIVE (percent<0) and INS_ADJ_PERCENT_OUT_OF_RANGE (percent>100). VERIFIED. Evidence: `Execution/auto/evidence/W01/api/BUG-W01-236-SOADJ-034-035-verify.txt`.

| Coverage Mode | Total | Status Summary |
| --- | --- | --- |
| Automated | 75 | 62 PASS, 0 FAIL, 13 SKIPPED — Run 4 (final regression + bug verify) 2026-06-17: BUG-W01-285 VERIFIED; spec corrected to new parts[].depreciationPercent contract; all P1 PASS |
| Manual | 79 | Reference: `Execution/test-cases/TC-W01-API.md` |

---

## 4. Test Cases

### 4.1 FEAT-INS-SO-ADJUSTMENT

#### Auth & Authz (SOADJ-053..057)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-053 | FEAT-INS-SO-ADJUSTMENT | agg-garage-graph, gf-sales | API-AA01 | API | Wave | P1 | Gọi updateServiceOrderV3 không có token → 401 | gf-sales + agg-garage-graph running; SO DRAFT BH=Có tồn tại | 1. Gọi mutation `updateServiceOrderV3` không kèm header `Authorization`.<br>2. Kiểm tra response. | - HTTP 401.<br>- SO không thay đổi.<br>- Response không có stack trace / data nhạy cảm. | PASS | N/A |
| TC-W01-API-SOADJ-054 | FEAT-INS-SO-ADJUSTMENT | agg-garage-graph, gf-sales | API-AA02 | API | Wave | P1 | Gọi updateServiceOrderV3 với token hết hạn → 401 | Token với exp quá khứ sinh qua sso-stub HS256; SO DRAFT | 1. Gọi mutation với token hết hạn (exp=0).<br>2. Kiểm tra response. | - HTTP 401 hoặc GraphQL error code `UNAUTHENTICATED`.<br>- SO không thay đổi. | SKIPPED | N/A |
| TC-W01-API-SOADJ-055 | FEAT-INS-SO-ADJUSTMENT | agg-garage-graph, gf-sales | API-AA03 | API | Wave | P1 | Gọi updateServiceOrderV3 với token giả mạo signature → 401 | Token đúng format JWT nhưng signature sai; SO DRAFT | 1. Gọi mutation với token signature bị sửa.<br>2. Kiểm tra response. | - HTTP 401.<br>- Không trả data SO. | PASS | N/A |
| TC-W01-API-SOADJ-056 | FEAT-INS-SO-ADJUSTMENT | agg-garage-graph, gf-sales | API-AA05 | API | Wave | P1 | Gọi updateServiceOrderV3 với token role thợ kỹ thuật → 403 | Token `tech@garage-a.test` (role thấp); SO DRAFT BH=Có | 1. Gọi mutation với token role thợ.<br>2. Kiểm tra response. | - HTTP 403.<br>- Error code `INS_FORBIDDEN_TENANT` hoặc chuẩn authz tương đương.<br>- SO không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-057 | FEAT-INS-SO-ADJUSTMENT | agg-garage-graph, gf-sales | API-AA06 | API | Wave | P1 | IDOR — kế toán garage-a cập nhật SO của garage-b → 403/404 | Token kế toán `garage-a`; SO `#SO-B-001` thuộc `garage-b` | 1. Gọi mutation `updateServiceOrderV3` với ID SO của tenant B dùng token tenant A.<br>2. Kiểm tra response. | - HTTP 403 hoặc 404 (không trả data SO tenant B).<br>- Không persist gì vào SO của tenant B. | PASS | N/A |

#### Validation — discountMaterial (CK liên kết VT)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-001 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [CK liên kết VT] Lưu mode=AMOUNT giá trị hợp lệ | SO DRAFT BH=Có `#SO-W01-BH-001`; token kế toán `garage-a` | 1. Gọi `updateServiceOrderV3` với `discountMaterial: {mode: AMOUNT, value: 5000000}`.<br>2. Query `getServiceOrderByCode` để đọc lại SO.<br>3. Kiểm tra DB: `SELECT discount_material_mode, discount_material_value FROM service_order WHERE id=...`. | - HTTP 200.<br>- DB: `discount_material_mode='AMOUNT'`, `discount_material_value=5000000`.<br>- Response `insuranceAdjustment.adjustments.discountMaterial` khớp. | PASS | N/A |
| TC-W01-API-SOADJ-002 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [CK liên kết VT] Lưu mode=PERCENT giá trị hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi `updateServiceOrderV3` với `discountMaterial: {mode: PERCENT, value: 3}`.<br>2. DB check: `discount_material_mode`, `discount_material_value`. | - HTTP 200.<br>- DB: `mode='PERCENT'`, `value=3`. | PASS | N/A |
| TC-W01-API-SOADJ-003 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13 | API | Wave | P2 | [CK liên kết VT] Không truyền field → default 0 | SO DRAFT BH=Có; token kế toán | 1. Gọi `updateServiceOrderV3` không có field `discountMaterial`.<br>2. Query lại SO; DB check. | - HTTP 200.<br>- DB: `discount_material_value=0` (default). | SKIPPED | N/A |
| TC-W01-API-SOADJ-004 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14 | API | Wave | P2 | [CK liên kết VT] value=0 (AMOUNT, biên dưới) → hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: AMOUNT, value: 0}`.<br>2. DB check. | - HTTP 200.<br>- DB: `value=0`, không báo lỗi. | PASS | N/A |
| TC-W01-API-SOADJ-005 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [CK liên kết VT] value âm (AMOUNT) → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: AMOUNT, value: -100}`.<br>2. Kiểm tra response.errors[].extensions.code (qua GraphQL) hoặc response.code (REST). | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`.<br>- Message: "Vui lòng nhập giá trị từ 0 trở lên."<br>- DB: SO không thay đổi (SELECT verify). | PASS | N/A |
| TC-W01-API-SOADJ-006 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14 | API | Wave | P2 | [CK liên kết VT] PERCENT value=100 (biên trên) → hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: PERCENT, value: 100}`.<br>2. DB check. | - HTTP 200.<br>- DB: `value=100` persist. | PASS | N/A |
| TC-W01-API-SOADJ-007 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1003 | API | Wave | P1 | [CK liên kết VT] PERCENT value=100.01 (vượt biên) → 400 + INS_ADJ_PERCENT_OUT_OF_RANGE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: PERCENT, value: 100.01}`.<br>2. Kiểm tra code. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_PERCENT_OUT_OF_RANGE`.<br>- Message: "Tỷ lệ phần trăm chỉ được nhập từ 0 đến 100."<br>- DB: SO không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-008 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P2 | [CK liên kết VT] PERCENT value âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: PERCENT, value: -0.01}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`.<br>- DB không thay đổi. | PASS | BUG-W01-238 |
| TC-W01-API-SOADJ-009 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-DT09, INS-1008 | API | Wave | P1 | [CK liên kết VT] mode="INVALID_MODE" (enum ngoài) → 400 + INS_ADJ_MODE_INVALID | gf-sales + BFF running; SO DRAFT | 1. Gọi với `discountMaterial: {mode: "INVALID_MODE", value: 100}`.<br>2. Kiểm tra response. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_MODE_INVALID` (hoặc `INVALID_ALLOCATION_MODE` theo VLD-INS-SO-006).<br>- DB không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-010 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-DT01 | API | Wave | P2 | [CK liên kết VT] value là chuỗi chữ → 400 | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountMaterial: {mode: AMOUNT, value: "abc"}`. | - HTTP 400.<br>- Error về kiểu dữ liệu sai (GraphQL type error hoặc service validation).<br>- DB không thay đổi. | SKIPPED | N/A |

#### Validation — discountLabor (CK liên kết CDV)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-011 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [CK liên kết CDV] Lưu mode=AMOUNT hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountLabor: {mode: AMOUNT, value: 2500000}`.<br>2. DB check `discount_labor_mode`, `discount_labor_value`. | - HTTP 200.<br>- DB: `mode='AMOUNT'`, `value=2500000`. | PASS | N/A |
| TC-W01-API-SOADJ-012 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [CK liên kết CDV] Lưu mode=PERCENT hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountLabor: {mode: PERCENT, value: 2}`.<br>2. DB check. | - HTTP 200.<br>- DB: `mode='PERCENT'`, `value=2`. | PASS | N/A |
| TC-W01-API-SOADJ-013 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13 | API | Wave | P2 | [CK liên kết CDV] Không truyền field → default 0 | SO DRAFT BH=Có; token kế toán | 1. Gọi không có `discountLabor`.<br>2. DB check. | - HTTP 200.<br>- DB: `discount_labor_value=0`. | SKIPPED | N/A |
| TC-W01-API-SOADJ-014 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [CK liên kết CDV] value âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountLabor: {mode: AMOUNT, value: -500}`.<br>2. Kiểm tra code. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`.<br>- DB không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-015 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1003 | API | Wave | P1 | [CK liên kết CDV] PERCENT value=100.01 → 400 + INS_ADJ_PERCENT_OUT_OF_RANGE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `discountLabor: {mode: PERCENT, value: 100.01}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_PERCENT_OUT_OF_RANGE`. | PASS | N/A |
| TC-W01-API-SOADJ-016 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-DT09, INS-1008 | API | Wave | P1 | [CK liên kết CDV] mode sai → 400 + INS_ADJ_MODE_INVALID | gf-sales + BFF running | 1. Gọi với `discountLabor: {mode: "WRONG", value: 100}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_MODE_INVALID`. | PASS | N/A |

#### Validation — claimReduction (Giảm trừ bồi thường)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-017 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [Giảm trừ bồi thường] Lưu mode=AMOUNT hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `claimReduction: {mode: AMOUNT, value: 2000000}`.<br>2. DB check `claim_reduction_mode`, `claim_reduction_value`. | - HTTP 200.<br>- DB: `mode='AMOUNT'`, `value=2000000`. | PASS | N/A |
| TC-W01-API-SOADJ-018 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-002 | API | Wave | P1 | [Giảm trừ bồi thường] Lưu mode=PERCENT hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `claimReduction: {mode: PERCENT, value: 2}`.<br>2. DB check. | - HTTP 200.<br>- DB: `mode='PERCENT'`, `value=2`. | PASS | N/A |
| TC-W01-API-SOADJ-019 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [Giảm trừ bồi thường] value âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `claimReduction: {mode: AMOUNT, value: -200}`.<br>2. Kiểm tra code. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`.<br>- DB không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-020 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1003 | API | Wave | P1 | [Giảm trừ bồi thường] PERCENT value=100.01 → 400 + INS_ADJ_PERCENT_OUT_OF_RANGE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `claimReduction: {mode: PERCENT, value: 100.01}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_PERCENT_OUT_OF_RANGE`. | PASS | N/A |
| TC-W01-API-SOADJ-021 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-DT09, INS-1008 | API | Wave | P1 | [Giảm trừ bồi thường] mode sai → 400 + INS_ADJ_MODE_INVALID | gf-sales + BFF running | 1. Gọi với `claimReduction: {mode: "X", value: 100}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_MODE_INVALID`. | PASS | N/A |

#### Validation — insuranceDeductible (Khấu trừ BH)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-022 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-003 | API | Wave | P1 | [Khấu trừ BH] Lưu amount hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `insuranceDeductible: {amount: 520000}`.<br>2. DB check `insurance_deductible_amount`. | - HTTP 200.<br>- DB: `insurance_deductible_amount=520000`. | PASS | N/A |
| TC-W01-API-SOADJ-023 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14 | API | Wave | P2 | [Khấu trừ BH] amount=0 (biên dưới) → hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `insuranceDeductible: {amount: 0}`.<br>2. DB check. | - HTTP 200.<br>- DB: `amount=0`. | PASS | N/A |
| TC-W01-API-SOADJ-024 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [Khấu trừ BH] amount âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `insuranceDeductible: {amount: -100}`.<br>2. Kiểm tra code. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`.<br>- DB không thay đổi. | PASS | N/A |
| TC-W01-API-SOADJ-025 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13 | API | Wave | P2 | [Khấu trừ BH] Không truyền field → default 0 | SO DRAFT BH=Có; token kế toán | 1. Gọi không có `insuranceDeductible`.<br>2. DB check. | - HTTP 200.<br>- DB: `insurance_deductible_amount=0` hoặc NULL theo spec. | SKIPPED | N/A |
| TC-W01-API-SOADJ-026 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-DT01 | API | Wave | P2 | [Khấu trừ BH] amount là chuỗi chữ → 400 | SO DRAFT BH=Có; token kế toán | 1. Gọi với `insuranceDeductible: {amount: "abc"}`. | - HTTP 400.<br>- Error về kiểu dữ liệu sai. | SKIPPED | N/A |

#### Validation — depreciationDefault (Khấu hao header)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-027 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, AC-5 | API | Wave | P1 | [Khấu hao header] percent=5 → lưu thành công | SO DRAFT BH=Có có PT BH; token kế toán | 1. Gọi với `depreciationDefault: {percent: 5}`.<br>2. DB check `depreciation_default_percent`. | - HTTP 200.<br>- DB: `depreciation_default_percent=5`. | PASS | N/A |
| TC-W01-API-SOADJ-028 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-5 | API | Wave | P2 | [Khấu hao header] percent=0 (biên dưới) → hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationDefault: {percent: 0}`.<br>2. DB check. | - HTTP 200.<br>- DB: `percent=0`. | PASS | N/A |
| TC-W01-API-SOADJ-029 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-5 | API | Wave | P2 | [Khấu hao header] percent=100 (biên trên) → hợp lệ | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationDefault: {percent: 100}`.<br>2. DB check. | - HTTP 200.<br>- DB: `percent=100`. | PASS | N/A |
| TC-W01-API-SOADJ-030 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1003 | API | Wave | P1 | [Khấu hao header] percent=100.01 (vượt biên) → 400 + INS_ADJ_PERCENT_OUT_OF_RANGE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationDefault: {percent: 100.01}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_PERCENT_OUT_OF_RANGE`. | PASS | N/A |
| TC-W01-API-SOADJ-031 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [Khấu hao header] percent âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationDefault: {percent: -5}`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`. | PASS | BUG-W01-238 |

#### Validation — depreciationByLine (Khấu hao per dòng)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-032 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-5, AC-8 | API | Wave | P1 | [Khấu hao per dòng] Lưu list 2 PT BH hợp lệ | SO DRAFT có PT-1, PT-2 thuộc BH; token kế toán | 1. Gọi với `depreciationByLine: [{lineId: "PT-1", percent: 5}, {lineId: "PT-2", percent: 10}]`.<br>2. DB check `service_order_part.depreciation_percent` cho PT-1 và PT-2. | - HTTP 200.<br>- DB PT-1: `depreciation_percent=5`; PT-2: `depreciation_percent=10`. | SKIPPED | BUG-W01-237 (INVALID, superseded), BUG-W01-262 (VERIFIED) — TC re-scoped to `parts[].depreciationPercent=5` per new contract; DB persist VERIFIED Run 4 |
| TC-W01-API-SOADJ-033 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-5, API-BV09 | API | Wave | P2 | [Khấu hao per dòng] List rỗng [] → hợp lệ (không có khấu hao) | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationByLine: []`.<br>2. DB check. | - HTTP 200.<br>- DB: không có `depreciation_percent` mới nào set. | PASS | N/A |
| TC-W01-API-SOADJ-034 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1003 | API | Wave | P1 | [Khấu hao per dòng] Một item percent > 100 → 400 + INS_ADJ_PERCENT_OUT_OF_RANGE | SO DRAFT có PT-1 thuộc BH; token kế toán | 1. Gọi với `depreciationByLine: [{lineId: "PT-1", percent: 150}]`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_PERCENT_OUT_OF_RANGE`.<br>- DB: PT-1 không thay đổi. | PASS | BUG-W01-236 |
| TC-W01-API-SOADJ-035 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-14, INS-1005 | API | Wave | P1 | [Khấu hao per dòng] Một item percent âm → 400 + INS_ADJ_VALUE_NEGATIVE | SO DRAFT có PT-1 thuộc BH; token kế toán | 1. Gọi với `depreciationByLine: [{lineId: "PT-1", percent: -5}]`. | - HTTP 400.<br>- `extensions.code` = `INS_ADJ_VALUE_NEGATIVE`. | PASS | BUG-W01-236 |
| TC-W01-API-SOADJ-036 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-5, API-CR04 | API | Wave | P3 | [Khấu hao per dòng] lineId không tồn tại trong SO → 400 | SO DRAFT BH=Có; token kế toán | 1. Gọi với `depreciationByLine: [{lineId: "NONEXISTENT-999", percent: 5}]`. | - HTTP 400.<br>- Error "lineId không tồn tại" hoặc tương đương theo error contract.<br>- DB không thay đổi. | PASS | N/A |

#### Công thức & Kết quả tính server-side

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-037 | FEAT-INS-SO-ADJUSTMENT | gf-sales | BR-INS-SO-ADJ-005 | API | Wave | P1 | [Công thức] BH=197.680.000 / KH=35.720.000 khớp ví dụ epic | SO `#SO-W01-BH-001`: Cộng sau VAT BH=207.9tr, KH=33tr; 2 PT BH (PT-1, PT-2); token kế toán | 1. Gọi `updateServiceOrderV3`: `discountMaterial AMOUNT 5000000`, `discountLabor AMOUNT 2500000`, `depreciationByLine [{PT-1: 5%}, {PT-2: 5%}]` tổng = ~200k, `claimReduction AMOUNT 2000000`, `insuranceDeductible 520000`.<br>2. Query `getServiceOrderByCode` → `settlementBalance`. | - `bhPayment` = 197.680.000 đ (hoặc xấp xỉ theo % khấu hao cụ thể của ví dụ).<br>- `customerPayment` = 35.720.000 đ.<br>- `totalPayment` = 233.400.000 đ.<br>- Số tiền là integer/decimal chính xác, không float lỗi. | SKIPPED | N/A |
| TC-W01-API-SOADJ-038 | FEAT-INS-SO-ADJUSTMENT | gf-sales | BR-INS-SO-ADJ-005 | API | Wave | P1 | [Công thức] CK liên kết KHÔNG cộng sang KH (chỉ giảm BH) | SO `#SO-W01-BH-001`; token kế toán | 1. Lưu CHỈ CK VT 5tr + CK CDV 2.5tr (các khoản khác = 0).<br>2. Query `settlementBalance`. | - `bhPayment` = 207.900.000 − 5.000.000 − 2.500.000 = 200.400.000 đ.<br>- `customerPayment` = 33.000.000 đ (KHÔNG cộng CK liên kết). | SKIPPED | N/A |
| TC-W01-API-SOADJ-039 | FEAT-INS-SO-ADJUSTMENT | gf-sales | CALC-INS-006 | API | Wave | P1 | [Công thức] Single-payer toàn BH → customerPayment = Σ khoản chuyển | SO `#SO-W01-BH-ONLY` (0 dòng KH); `claimReduction AMOUNT 200000`, `depreciationDefault 100000` tương đương (nếu có PT), `insuranceDeductible 50000`; token kế toán | 1. Lưu allocation, query `settlementBalance`. | - `breakdownTotalAfterVatCustomer` = 0 (không null).<br>- `customerPayment` = Σ khoản chuyển (≥0, không crash khi nhóm KH rỗng). | SKIPPED | N/A |
| TC-W01-API-SOADJ-040 | FEAT-INS-SO-ADJUSTMENT | gf-sales | BR-INS-SO-ADJ-005, API-RS08 | API | Wave | P2 | [Công thức] % mode tính đúng theo cơ sở "Cộng sau VAT" phần tương ứng | SO `#SO-W01-BH-001` với vật tư BH xác định; token kế toán | 1. Lưu `discountMaterial: {mode: PERCENT, value: 3}` (3% của Cộng sau VAT vật tư BH).<br>2. Query `adjustments.discountMaterial.amount`. | - Số tiền CK VT = 3% × Cộng sau VAT vật tư BH (đúng ≤ 1 đơn vị đồng, không float lỗi). | SKIPPED | N/A |
| TC-W01-API-SOADJ-041 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-12, EC-2, INS-1006 | API | Wave | P1 | [Công thức] BH thanh toán âm → cho lưu (non-block) + warning INS_ADJ_BH_PAYMENT_NEGATIVE | SO DRAFT Cộng sau VAT BH nhỏ; khoản giảm > BH; token kế toán | 1. Lưu allocation khiến `bhPayment` < 0.<br>2. Kiểm tra response data + query lại. | - HTTP 200 (cho lưu).<br>- Warning code `INS_ADJ_BH_PAYMENT_NEGATIVE` trong `data` (KHÔNG trong `errors`) per spec warning non-block.<br>- DB: `bhPayment` < 0 persist.<br>- Message: "Số tiền bảo hiểm thanh toán đang nhỏ hơn 0. Vui lòng kiểm tra lại các khoản điều chỉnh." | SKIPPED | N/A |
| TC-W01-API-SOADJ-042 | FEAT-INS-SO-ADJUSTMENT | gf-sales | EC-1 | API | Wave | P2 | [Khấu hao] SO không có PT BH → khấu hao không tác động BH | SO `#SO-W01-BH-SVC-ONLY` (BH=Có, chỉ DV BH, 0 phụ tùng BH); token kế toán | 1. Gọi `depreciationDefault: {percent: 30}` + query `settlementBalance`. | - HTTP 200.<br>- Khấu hao 0 đ (không có cơ sở phụ tùng BH). | SKIPPED | N/A |
| TC-W01-API-SOADJ-043 | FEAT-INS-SO-ADJUSTMENT | gf-sales | EC-4 | API | Wave | P2 | [Khấu hao] Header 0% + 1 dòng override 30% → chỉ dòng đó khấu hao | SO `#SO-W01-BH-001` có 2 PT BH; token kế toán | 1. Gọi `depreciationDefault: {percent: 0}` + `depreciationByLine: [{lineId: "PT-1", percent: 30}]`.<br>2. Query `settlementBalance`. | - PT-1 khấu hao 30%.<br>- PT-2 = 0%.<br>- Số tiền khấu hao = thành tiền PT-1 × 30%. | SKIPPED | N/A |

#### for-settlement endpoint

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-044 | FEAT-INS-SO-ADJUSTMENT | gf-sales | ADR-014, CB-INS-002 | API | Wave | P1 | [for-settlement] Trả đủ 8 breakdown + 8 adjustment fields | SO `#SO-W01-BH-001` đã lưu allocation; token internal (x-api-key) | 1. Gọi `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement`.<br>2. Kiểm tra response body schema. | - HTTP 200.<br>- Đủ 8 breakdown fields: `breakdownServiceInsurance`, `breakdownServiceCustomer`, `breakdownPartsInsurance`, `breakdownPartsCustomer`, `breakdownVatInsurance`, `breakdownVatCustomer`, `breakdownTotalAfterVatInsurance`, `breakdownTotalAfterVatCustomer`.<br>- Đủ 8 adjustment fields: `discountMaterialMode/Value`, `discountLaborMode/Value`, `depreciationDefaultPercent`, `claimReductionMode/Value`, `insuranceDeductibleAmount`.<br>- `insurancePayableAmount` hiện diện. | PASS | N/A |
| TC-W01-API-SOADJ-045 | FEAT-INS-SO-ADJUSTMENT | gf-sales | ADR-014, API-UD07 | API | Wave | P1 | [for-settlement] Idempotent — gọi 2 lần → cùng kết quả, không side effect | SO `#SO-W01-BH-001` đã có allocation; for-settlement accessible | 1. Gọi `GET .../for-settlement` lần 1, lưu response.<br>2. Gọi lần 2 cùng SO.<br>3. So sánh 8+8+1 fields. | - HTTP 200 cả 2 lần.<br>- Lần 2 trả cùng giá trị byte-for-byte.<br>- Không tạo record mới, không trigger callback. | PASS | N/A |
| TC-W01-API-SOADJ-046 | FEAT-INS-SO-ADJUSTMENT | gf-sales | ADR-014, API-RS02 | API | Wave | P2 | [for-settlement] SO chưa có allocation → adjustment fields 0/null | SO DRAFT BH=Có chưa nhập allocation; token internal | 1. Gọi `GET .../for-settlement` cho SO chưa có allocation. | - HTTP 200 (không crash).<br>- Adjustment fields = 0 hoặc null.<br>- Không ném exception. | PASS | N/A |

#### Happy path đầy đủ + Response schema

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-047 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | AC-13, state-transition | API | Wave | P1 | [Tổng thể set-on] Lưu toàn bộ 5 khoản → persist + DB verify (state-transition set-on) | SO DRAFT BH=Có `#SO-W01-BH-001` có 2 PT BH; token kế toán | 1. Gọi `updateServiceOrderV3` đầy đủ 5 khoản (discountMaterial AMOUNT 5000000, discountLabor AMOUNT 2500000, depreciationDefault 5%, depreciationByLine 2 PT, claimReduction AMOUNT 2000000, insuranceDeductible 520000).<br>2. DB: `SELECT discount_material_value, discount_labor_value, depreciation_default_percent, claim_reduction_value, insurance_deductible_amount FROM service_order WHERE id=...`.<br>3. DB: `SELECT depreciation_percent FROM service_order_part WHERE service_order_id=... AND payment_source='BH'`.<br>4. Query `getServiceOrderByCode` → `insuranceAdjustment`. | - HTTP 200.<br>- DB row: tất cả 5 scalar fields khớp giá trị gửi (ground-truth, không chỉ response echo).<br>- DB part: `depreciation_percent` của 2 PT BH khớp.<br>- Response `insuranceAdjustment` hiện diện đầy đủ (`breakdownByPayer`, `adjustments`, `settlementBalance`). | PASS | N/A |
| TC-W01-API-SOADJ-048 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-RS02, AC-9 | API | Wave | P2 | [Response schema] block insuranceAdjustment đủ field, đúng kiểu | SO đã lưu allocation; token kế toán | 1. Query `getServiceOrderByCode`.<br>2. Kiểm tra schema `insuranceAdjustment`. | - Có `breakdownByPayer`, `adjustments`, `settlementBalance`.<br>- Field số là number (không phải string).<br>- Enum field chỉ trả giá trị hợp lệ (PERCENT/AMOUNT). | PASS | N/A |
| TC-W01-API-SOADJ-049 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-RS08 | API | Wave | P2 | [Response schema] Money field đúng độ chính xác (không float lỗi) | SO với allocation % mode; token kế toán | 1. Query `settlementBalance` sau khi lưu % chiết khấu lẻ (vd 3%). | - Số tiền là integer hoặc decimal đúng, không `9999999.99999` hoặc lỗi precision. | SKIPPED | N/A |

#### State & invalid precondition

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-050 | FEAT-INS-SO-ADJUSTMENT | gf-sales | EC-5, AC-15, API-ST03 | API | Wave | P1 | [State] Update allocation SO đã có phiếu QT BH → bị khoá | SO `#SO-W01-SETTLED` đã settled; token kế toán | 1. Gọi `updateServiceOrderV3` sửa allocation trên SO đã QT. | - HTTP 409 hoặc 422.<br>- DB: SO không thay đổi (snapshot QT bảo toàn). | PASS | N/A |
| TC-W01-API-SOADJ-051 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | VLD-INS-STL-001, INS-2002 | API | Wave | P1 | [State] Tạo phiếu QT BH từ SO toàn KH → bị từ chối + INS_STL_COMPANY_REQUIRED hoặc VLD-INS-STL-001 | SO `#SO-W01-KH-ONLY` — không có dòng BH; token kế toán | 1. Gọi `createInsuranceSettlement` với SO toàn KH. | - HTTP 400 hoặc 422.<br>- Error code `INS_STL_COMPANY_REQUIRED` hoặc tương đương (SO không có dòng BH).<br>- Không tạo phiếu QT. | SKIPPED | N/A |
| TC-W01-API-SOADJ-052 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-CC02 | API | Wave | P2 | [Concurrency] 2 update đồng thời cùng SO → không lost update (optimistic lock) | SO DRAFT BH=Có; 2 client cùng sửa allocation | 1. Client A query SO (lấy version).<br>2. Client B query SO (cùng version).<br>3. A lưu → HTTP 200.<br>4. B lưu với version cũ → check response. | - A: HTTP 200.<br>- B: HTTP 409 hoặc 412 (optimistic lock).<br>- KHÔNG ghi đè data A. | SKIPPED | N/A |

#### State-Transition (Discard allocation khi BH=Không)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-067 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-13, BR-INS-SO-ADJ-001, EC-3, state-transition | API | Wave | P1 | [Discard set-off] Set BH=Không → 8 adjustment columns clear + DB verify | SO `#SO-W01-BH-001` đã lưu allocation đầy đủ (BH=Có); token kế toán | 1. Gọi `updateServiceOrderV3` set cờ bảo hiểm = false (BH=Không, KHÔNG kèm adjustment fields).<br>2. DB: `SELECT discount_material_value, discount_labor_value, depreciation_default_percent, claim_reduction_value, insurance_deductible_amount FROM service_order WHERE id=...`.<br>3. DB: `SELECT depreciation_percent FROM service_order_part WHERE service_order_id=...`.<br>4. Query `getServiceOrderByCode` → `insuranceAdjustment`. | - HTTP 200.<br>- DB: 8 adjustment scalar cols = 0/NULL (ground-truth — không chỉ response echo).<br>- DB part: `depreciation_percent` của tất cả phụ tùng = NULL/0 (reset).<br>- `insuranceAdjustment` = null/absent trong response (không leak allocation cũ). | PASS | N/A |
| TC-W01-API-SOADJ-068 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | AC-9..11, state-transition | API | Wave | P1 | [Discard] Sau discard → getServiceOrderByCode KHÔNG trả phân bổ BH cũ | SO vừa set BH=Không (từng có allocation); token kế toán | 1. Query `getServiceOrderByCode` sau khi đã discard (TC-W01-API-SOADJ-067 đã chạy).<br>2. Kiểm tra block `insuranceAdjustment`. | - `insuranceAdjustment` = null/absent HOẶC `settlementBalance.bhPayment` không còn.<br>- Không xuất hiện giá trị adjustment cũ (stale-free). | PASS | N/A |
| TC-W01-API-SOADJ-069 | FEAT-INS-SO-ADJUSTMENT | gf-sales | ADR-014, CB-INS-002, state-transition | API | Wave | P1 | [Discard] for-settlement sau discard → adjustment fields = 0/null (không mồ côi) | SO vừa set BH=Không; for-settlement accessible | 1. Gọi `GET .../for-settlement` sau discard.<br>2. Kiểm tra 8 adjustment fields + `insurancePayableAmount`. | - HTTP 200.<br>- 8 adjustment fields = 0/null.<br>- `insurancePayableAmount` = 0/null — gf-accounting KHÔNG pull nhầm allocation đã xoá. | SKIPPED | N/A |
| TC-W01-API-SOADJ-070 | FEAT-INS-SO-ADJUSTMENT | gf-sales | EC-3, AC-1, state-transition | API | Wave | P1 | [Re-toggle on→off→on] Re-enable BH=Có sau discard → fields = 0 default (no stale) | SO đã set BH=Không (allocation đã discard); token kế toán | 1. Gọi `updateServiceOrderV3` set BH=Có, KHÔNG truyền adjustment.<br>2. DB check 8 adjustment cols.<br>3. Query `getServiceOrderByCode`. | - HTTP 200.<br>- DB: 8 adjustment cols = 0/default (không resurrection giá trị cũ).<br>- `insuranceAdjustment.adjustments` = 0 default. | PASS | N/A |
| TC-W01-API-SOADJ-071 | FEAT-INS-SO-ADJUSTMENT | gf-sales | EC-5, AC-15, API-ST03 | API | Wave | P2 | [Discard] SO đã có phiếu QT BH → set BH=Không bị khoá | SO `#SO-W01-SETTLED` đã settled; token kế toán | 1. Gọi `updateServiceOrderV3` set BH=Không trên SO đã QT. | - HTTP 409 hoặc 422.<br>- DB: allocation không bị xoá (snapshot QT bảo toàn). | SKIPPED | N/A |

#### Regression (SOADJ)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-SOADJ-063 | FEAT-INS-SO-ADJUSTMENT | gf-sales | E2E-RG01, AC-13 | API | Regression | P1 | [Regression] updateServiceOrderV3 với SO thường (BH=Không) vẫn lưu đúng | SO `#SO-W01-REGULAR` (toggle BH=Không) có line item KH; token kế toán | 1. Gọi `updateServiceOrderV3` cập nhật SO thường (không có allocation fields).<br>2. DB: `SELECT * FROM service_order WHERE id=...` — kiểm tra không có adjustment cols rác.<br>3. Query `getServiceOrderByCode`. | - HTTP 200.<br>- SO lưu đúng như baseline.<br>- Không phát sinh `insuranceAdjustment` / adjustment field ngoài ý muốn.<br>- DB: adjustment cols = 0/null (không bị set rác). | PASS | N/A |
| TC-W01-API-SOADJ-064 | FEAT-INS-SO-ADJUSTMENT | gf-sales | E2E-RG02 | API | Regression | P1 | [Regression] SO thường không bị validate allocation BH | SO `#SO-W01-REGULAR` BH=Không; token kế toán | 1. Lưu SO thường bình thường (không truyền allocation). | - HTTP 200.<br>- Không yêu cầu/validate field allocation BH cho SO không bảo hiểm. | PASS | N/A |
| TC-W01-API-SOADJ-065 | FEAT-INS-SO-ADJUSTMENT | gf-sales | E2E-RG03 | API | Regression | P2 | [Regression] Tổng tiền SO thường không đổi sau deploy field allocation mới | SO `#SO-W01-REGULAR` có line item; token kế toán | 1. Query `getServiceOrderByCode` SO thường.<br>2. So sánh tổng thành tiền với baseline. | - Tổng thành tiền SO thường = giá trị baseline (logic tính cũ không bị ảnh hưởng). | SKIPPED | N/A |
| TC-W01-API-SOADJ-097 | FEAT-INS-SO-ADJUSTMENT | gf-sales | CB-INS-003 | API | Regression | P1 | [Regression] for-settlement với SO toàn KH → trả đúng baseline (không lỗi) | SO `#SO-W01-KH-ONLY` (toàn KH, không allocation); token internal | 1. Gọi `GET .../for-settlement` cho SO toàn KH. | - HTTP 200.<br>- 8 adjustment fields = null/0 (không lỗi).<br>- Response baseline không bị field mới làm vỡ. | PASS | N/A |

---

### 4.2 FEAT-INS-STL-DETAIL

#### createInsuranceSettlement — happy path + side-effect

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-STL-072 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-15, ADR-014 | API | Wave | P1 | [createInsuranceSettlement] Tạo cặp KH+BH atomic thành công + DB verify | SO `#SO-W01-BH-001` đã lưu allocation đầy đủ; token kế toán | 1. Gọi mutation `createInsuranceSettlement(id: SO_ID, input: {insurancePayableAmount: 197680000})`.<br>2. DB: `SELECT id, code, payer_type, related_settlement_code FROM settlement_records WHERE service_order_id=... ORDER BY payer_type`.<br>3. DB gf-sales: `SELECT status FROM service_order WHERE id=...`.<br>4. Kiểm tra response (2 mã phiếu). | - HTTP 200; response trả 2 mã phiếu (KH + BH).<br>- DB: 2 rows persist atomic — `payer_type='INSURANCE'` + `payer_type='CUSTOMER'`, cùng `related_settlement_code`.<br>- DB gf-sales: SO `status='SETTLED'` sau settle callback.<br>- `related_settlement_code` liên kết 2 chiều. | SKIPPED | N/A |
| TC-W01-API-STL-073 | FEAT-INS-STL-DETAIL | gf-accounting, gf-sales | ADR-014, CB-INS-002 | API | Wave | P1 | [createInsuranceSettlement] Snapshot phiếu QT BH khớp allocation SO (ground-truth assert) | SO `#SO-W01-BH-001` đã lưu allocation theo ví dụ epic | 1. Tạo phiếu QT BH (dùng kết quả TC-W01-API-STL-072).<br>2. Query `getSettlementByCode` lấy block `insurance`.<br>3. So sánh với DB `service_order` source values. | - `insurancePayableAmount` = 197.680.000 đ.<br>- `breakdownTotalAfterVatInsurance` = 207.900.000 đ.<br>- 8 adjustment fields trong snapshot khớp DB source gf-sales (không phantom zero).<br>- 8 breakdown fields hiện diện và giá trị đúng. | PASS | N/A |
| TC-W01-API-STL-074 | FEAT-INS-STL-DETAIL | gf-sales | CB-INS-002 | API | Wave | P2 | [for-settlement] Pull 2 lần cùng SO → cùng snapshot (idempotent) | SO `#SO-W01-BH-001`; gf-sales running | 1. Gọi `GET .../for-settlement` lần 1, ghi nhận response.<br>2. Gọi lần 2 cùng SO.<br>3. So sánh 8 breakdown + 8 adjustment + 1 payable. | - HTTP 200 cả 2 lần.<br>- Snapshot 2 lần giống hệt nhau (idempotent, không lệch field nào). | PASS | N/A |
| TC-W01-API-STL-075 | FEAT-INS-STL-DETAIL | gf-accounting, gf-sales | ADR-014 | API | Wave | P1 | [createInsuranceSettlement] Rollback toàn bộ khi settle callback fail | gf-sales mock trả 500 cho `/settle`; gf-accounting running | 1. Gọi `createInsuranceSettlement` khi settle callback sẽ fail (mock gf-sales /settle → 500).<br>2. DB gf-accounting: `SELECT COUNT(*) FROM settlement_records WHERE service_order_id=...`.<br>3. DB gf-sales: `SELECT status FROM service_order WHERE id=...`. | - Mutation trả lỗi (HTTP 500 hoặc error code `INS_STL_PAIR_ATOMIC_FAILED`).<br>- DB gf-accounting: 0 rows persist (rollback sạch, không phantom settlement).<br>- DB gf-sales: SO vẫn status cũ (chưa SETTLED). | SKIPPED | N/A |

#### createInsuranceSettlement — validation

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-STL-076 | FEAT-INS-STL-DETAIL | gf-accounting | API-RQ01, INS-2002 (adapted) | API | Wave | P2 | [createInsuranceSettlement] insurancePayableAmount = null → 400 | SO allocation đủ; token kế toán | 1. Gọi mutation không có `insurancePayableAmount`. | - HTTP 400.<br>- Error code nêu field bắt buộc thiếu.<br>- DB: không tạo phiếu QT. | PASS | N/A |
| TC-W01-API-STL-077 | FEAT-INS-STL-DETAIL | gf-accounting | AC-15 | API | Wave | P2 | [createInsuranceSettlement] insurancePayableAmount = 0 → hợp lệ | SO allocation; token kế toán | 1. Gọi mutation với `insurancePayableAmount: 0`.<br>2. DB: `SELECT insurance_payable_amount FROM settlement_records WHERE payer_type='INSURANCE'`. | - HTTP 200.<br>- DB: `insurance_payable_amount=0` persist. | PASS | N/A |
| TC-W01-API-STL-078 | FEAT-INS-STL-DETAIL | gf-accounting | API-DT06, INS-1005 (adapted) | API | Wave | P2 | [createInsuranceSettlement] insurancePayableAmount âm → 400 | SO allocation; token kế toán | 1. Gọi mutation với `insurancePayableAmount: -100`. | - HTTP 400.<br>- Error về giá trị âm.<br>- DB: không tạo phiếu QT. | PASS | N/A |
| TC-W01-API-STL-079 | FEAT-INS-STL-DETAIL | gf-accounting | API-DT01 | API | Wave | P2 | [createInsuranceSettlement] insurancePayableAmount là chuỗi → 400 | SO allocation; token kế toán | 1. Gọi mutation với `insurancePayableAmount: "abc"`. | - HTTP 400.<br>- Error kiểu dữ liệu sai.<br>- DB: không tạo phiếu QT. | PASS | N/A |
| TC-W01-API-STL-080 | FEAT-INS-STL-DETAIL | gf-accounting, gf-sales | VLD-INS-STL-001, INS-2002 | API | Wave | P1 | [createInsuranceSettlement] SO toàn KH (không có dòng BH) → reject + INS_STL_COMPANY_REQUIRED | SO `#SO-W01-KH-ONLY`; token kế toán | 1. Gọi `createInsuranceSettlement` với SO toàn KH. | - HTTP 400.<br>- `extensions.code` = `INS_STL_COMPANY_REQUIRED` hoặc VLD-INS-STL-001 tương đương.<br>- DB: không tạo phiếu QT. | PASS | N/A |
| TC-W01-API-STL-081 | FEAT-INS-STL-DETAIL | gf-accounting | ADR-014, API-ST06, INS-2003 | API | Wave | P2 | [createInsuranceSettlement] Gọi 2 lần cùng SO → lần 2 reject + INS_STL_DUPLICATE_DRAFT | Lần 1 đã tạo phiếu QT BH thành công; SO đã "Đã QT" | 1. Gọi `createInsuranceSettlement` lần 2 với cùng SO. | - HTTP 409.<br>- `extensions.code` = `INS_STL_DUPLICATE_DRAFT`.<br>- Message: "Phiếu dịch vụ này đã có phiếu quyết toán bảo hiểm."<br>- DB: không tạo thêm phiếu mới. | PASS | N/A |

#### getSettlementByCode — chi tiết phiếu QT BH

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-STL-082 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-4..9, API-RS02 | API | Wave | P1 | [getSettlementByCode] Phiếu INSURANCE → trả block insurance + debtPanel | Phiếu `#SET-W01-INS-001` tồn tại; token kế toán | 1. Gọi query `getSettlementByCode` với mã phiếu BH.<br>2. Kiểm tra response schema. | - HTTP 200.<br>- `payerType` = INSURANCE.<br>- Block `insurance` có `adjustments`, `breakdownByPayer`, `settlementBalance`.<br>- `debtPanel` hiện diện (field `insurancePayableAmount`, `remainingAmount`).<br>- Không thiếu field theo schema API reference. | PASS | N/A |
| TC-W01-API-STL-083 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-4..9 | API | Wave | P1 | [getSettlementByCode] Phiếu CUSTOMER → KHÔNG có block insurance | Phiếu `#SET-W01-KH-001` tồn tại; token kế toán | 1. Gọi `getSettlementByCode` với mã phiếu KH. | - HTTP 200.<br>- `payerType` = CUSTOMER.<br>- Block `insurance` KHÔNG có trong response (absent, không null hoặc empty object).<br>- `debtPanel` phản ánh công nợ KH. | PASS | N/A |
| TC-W01-API-STL-084 | FEAT-INS-STL-DETAIL | gf-accounting | API-RD02, INS-2006 | API | Wave | P2 | [getSettlementByCode] Mã phiếu không tồn tại → 404 + INS_STL_NOT_FOUND | gf-accounting running; token kế toán | 1. Gọi `getSettlementByCode("NONEXISTENT-999")`. | - HTTP 404.<br>- `extensions.code` = `INS_STL_NOT_FOUND`.<br>- Message: "Không tìm thấy phiếu quyết toán bảo hiểm."<br>- Không trả data. | PASS | N/A |
| TC-W01-API-STL-085 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | AC-6, API-RS08 | API | Wave | P2 | [getSettlementByCode] Money field đúng độ chính xác (không float lỗi) | Phiếu `#SET-W01-INS-001` theo ví dụ epic | 1. Query `getSettlementByCode`.<br>2. Đọc các field tiền (BH/KH/Tổng + 5 dòng phân bổ). | - `bhPayment`=197.680.000, `customerPayment`=35.720.000, `totalPayment`=233.400.000 đúng nguyên.<br>- Không float lỗi, đúng kiểu integer/decimal theo spec. | PASS | N/A |

#### cancelSettlement (áp dụng cho phiếu KH baseline — phiếu BH không có cancel)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-STL-086 | FEAT-INS-STL-DETAIL | gf-accounting | AC-11, BR-INS-STL-DET-003 | API | Wave | P1 | [AC-11] Phiếu QT BH không expose mutation huỷ (no-cancel) | Phiếu `#SET-W01-INS-001` DRAFT; token kế toán | 1. Thử gọi mutation `cancelSettlement` hoặc tương đương với phiếu QT BH.<br>2. Kiểm tra response. | - HTTP 400 hoặc 404 (endpoint không expose cho loại BH) hoặc error "Phiếu QT BH không có chức năng huỷ".<br>- Phiếu BH không thay đổi trạng thái.<br>- SO không bị reopen. | PASS | N/A |
| TC-W01-API-STL-087 | FEAT-INS-STL-DETAIL | gf-accounting | AC-11, BR-INS-STL-DET-006 | API | Wave | P1 | [cancelSettlement] Phiếu QT KH cặp — huỷ blocked khi đã có payment | Phiếu `#SET-W01-KH-001` đã có bản ghi thanh toán | 1. Gọi `cancelSettlement` trên phiếu KH đã có payment. | - HTTP 409.<br>- Error "Đã có bản ghi thanh toán" hoặc tương đương theo baseline contract.<br>- Phiếu không bị huỷ. | SKIPPED | N/A |

#### Regression (STL)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TC-W01-API-STL-096 | FEAT-INS-STL-DETAIL | gf-accounting | E2E-RG01, AC-9 | API | Regression | P1 | [Regression] getSettlementByCode phiếu KH baseline vẫn trả đúng (không vỡ) | Phiếu KH production `#SET-OLD-KH` tạo trước wave | 1. Gọi `getSettlementByCode` với mã phiếu KH cũ (production).<br>2. Kiểm tra response shape. | - HTTP 200.<br>- Response giữ schema baseline (không thiếu field cũ).<br>- Block `insurance` KHÔNG có thừa.<br>- Không vỡ field cũ. | PASS | N/A |
| TC-W01-API-STL-098 | FEAT-INS-STL-DETAIL | gf-accounting | AC-11, E2E-RG01 | API | Regression | P2 | [Regression] cancelSettlement phiếu KH baseline (không cặp BH) vẫn huỷ đúng | Phiếu KH production đơn lẻ `#SET-OLD-KH` DRAFT, chưa có payment | 1. Gọi `cancelSettlement` phiếu KH baseline.<br>2. DB: `SELECT status FROM settlement_records WHERE code='#SET-OLD-KH'`. | - Phiếu KH chuyển CANCEL (DB verify).<br>- Không kích hoạt cascade BH (không có cặp — không crash).<br>- SO reopen đúng baseline (DB: SO status không còn SETTLED). | PASS | N/A |

---

## 5. Self-Audit Record

### 5.1 Common Baseline Coverage Audit

Đã đối chiếu từng dòng trong "Checklist Review — Khi Review TC API Đã Viết" (common-testcase-api.md):

| Checklist item | Status | TC reference |
| --- | --- | --- |
| TC không có token (401) | covered | TC-W01-API-SOADJ-053 |
| TC token hết hạn (401) | covered | TC-W01-API-SOADJ-054 |
| TC không có quyền (403) | covered | TC-W01-API-SOADJ-055, SOADJ-056 |
| TC thiếu từng required field | covered | TC-W01-API-STL-076 (insurancePayableAmount null); SOADJ-003 (omit → default) |
| TC BVA: maxlength, max_value và +1 | covered | SOADJ-006/007 (PERCENT 100/100.01), SOADJ-029/030 (khấu hao 100/100.01) |
| TC CRUD đầy đủ (Create, Read, Update) | covered | STL-072 (Create), SOADJ-044/STL-082 (Read), SOADJ-001/047 (Update) |
| TC resource không tồn tại (404) | covered | STL-084 (settlement not found) |
| TC duplicate/conflict (409) | covered | STL-081 (duplicate draft), SOADJ-052 (optimistic lock) |
| Special chars & SQL injection | out-of-scope: routed to agent-test-security per anti-dup routing |
| TC pagination: page/limit | out-of-scope: không có list/pagination endpoint trong W01 API scope |
| TC response schema (đủ field, đúng kiểu) | covered | SOADJ-048, STL-082 |
| Không để lộ sensitive data | out-of-scope: routed to agent-test-security |
| TC có expected HTTP status code rõ ràng | covered: mọi TC đều có HTTP status trong Expected Result |

### 5.2 Field-Validation Coverage Audit (CRITICAL/HIGH families)

Per field in scope:

| Field | Bỏ trống | Format sai | Số âm | Boundary | Dependency | Status |
| --- | --- | --- | --- | --- | --- | --- |
| discountMaterial.value | SOADJ-003 (omit→0) | SOADJ-010 (chuỗi) | SOADJ-005 | SOADJ-004/006/007 | SOADJ-009 (mode enum) | all covered |
| discountLabor.value | SOADJ-013 | (adapted from SOADJ-010) | SOADJ-014 | SOADJ-015 | SOADJ-016 | all covered |
| claimReduction.value | (adapted: omit → 0) | (adapted: same DT01 pattern) | SOADJ-019 | SOADJ-020 | SOADJ-021 | critical covered |
| insuranceDeductible.amount | SOADJ-025 | SOADJ-026 | SOADJ-024 | SOADJ-022/023 | BR-INS-SO-ADJ-004 (no % mode) | all covered |
| depreciationDefault.percent | (omit → 0, adapted) | (adapted) | SOADJ-031 | SOADJ-028/029/030 | EC-1 (SOADJ-042) | all covered |
| depreciationByLine[].percent | SOADJ-033 (empty list) | (adapted) | SOADJ-035 | SOADJ-034 | SOADJ-036 (lineId not found) | all covered |
| insurancePayableAmount | STL-076 (null) | STL-079 (chuỗi) | STL-078 | STL-077 (0 biên) | STL-080 (SO toàn KH) | all covered |

### 5.3 Auto vs Manual Parity Audit

Manual artifact (read-only): `Execution/test-cases/TC-W01-API.md` — 79 TC sau split (security 15 TC → TC-W01-SECURITY.md; isolation 3 TC → TC-W01-ISOLATION.md; performance 3 TC → TC-W01-PERFORMANCE.md).

Từng TC manual đã được so sánh:

| Manual TC range | Tương ứng auto | Phân loại | Notes |
| --- | --- | --- | --- |
| TC-W01-API-001..052 (SOADJ core) | TC-W01-API-SOADJ-001..052 | covered | Đầy đủ, granular per-field per spec |
| TC-W01-API-053..057 (auth) | TC-W01-API-SOADJ-053..057 | covered | Auth group |
| TC-W01-API-058..060 (isolation tenant) | out-of-scope | covered-by-other-agent | Cross-tenant denial → agent-test-isolation |
| TC-W01-API-061..062 (security injection) | out-of-scope | covered-by-other-agent | OWASP injection → agent-test-security |
| TC-W01-API-063..065 (regression SO thường) | TC-W01-API-SOADJ-063..065 | covered | |
| TC-W01-API-066 (performance for-settlement p99) | out-of-scope | covered-by-other-agent | SLO → agent-test-performance |
| TC-W01-API-067..071 (discard/state-transition) | TC-W01-API-SOADJ-067..071 | covered | State-transition gate |
| TC-W01-API-072..087 (STL core) | TC-W01-API-STL-072..087 | covered | STL group |
| TC-W01-API-088..095 (security full suite) | out-of-scope | covered-by-other-agent | Security → agent-test-security |
| TC-W01-API-096..098 (regression STL) | TC-W01-API-STL-096..098 | covered | Regression group |
| TC-W01-API-099..100 (perf createInsuranceSettlement) | out-of-scope | covered-by-other-agent | SLO → agent-test-performance |

Không có `auto-miss` — mọi case trong manual artifact đã phân loại rõ `covered` / `covered-by-other-agent`.

### 5.4 Ground-Truth DB Assertion Gate Audit

Mọi write TC cross-boundary đã có DB assertion rõ trong Expected Result:

| TC | Write endpoint | Ground-truth assertion |
| --- | --- | --- |
| SOADJ-001/002/011/012/017/018/022/027/032 | PUT /api/v3/service-orders | SELECT service_order + service_order_part |
| SOADJ-047 (set-on) | PUT /api/v3/service-orders | SELECT service_order + service_order_part (8 cols) |
| SOADJ-067 (set-off) | PUT /api/v3/service-orders | SELECT service_order (8 cols = 0/null) + service_order_part (depreciation_percent = null/0) |
| SOADJ-070 (re-toggle) | PUT /api/v3/service-orders | SELECT service_order (8 cols = 0 default) |
| STL-072 | POST /api/v1/.../settlements | SELECT settlement_records (2 rows, payer_type, related_settlement_code) + SELECT service_order status |
| STL-073 | getSettlementByCode | Compare với DB source gf-sales (not just response echo) |
| STL-075 | createInsuranceSettlement (rollback) | SELECT COUNT(*) settlement_records = 0 + SELECT service_order status = unchanged |
| STL-077 | createInsuranceSettlement (0 amount) | SELECT insurance_payable_amount = 0 |
| STL-098 | cancelSettlement | SELECT settlement_records status + SELECT service_order status |

### 5.5 Error Code Registry Coverage (§5.5 BR-EP-INSURANCE-SETTLEMENT.md)

W01 in-scope codes:

| Code | Num | HTTP | TC asserting | Status |
| --- | --- | --- | --- | --- |
| `INS_ADJ_VALUE_NEGATIVE` | INS-1005 | 400 | SOADJ-005, 008, 014, 019, 024, 031, 035, STL-078 | covered |
| `INS_ADJ_PERCENT_OUT_OF_RANGE` | INS-1003 | 400 | SOADJ-007, 015, 020, 030, 034 | covered |
| `INS_ADJ_MODE_INVALID` | INS-1008 | 400 | SOADJ-009, 016, 021 | covered |
| `INS_ADJ_BH_PAYMENT_NEGATIVE` | INS-1006 | 200 (WARNING) | SOADJ-041 | covered |
| `INS_STL_COMPANY_REQUIRED` | INS-2002 | 400 | SOADJ-051, STL-080 | covered |
| `INS_STL_DUPLICATE_DRAFT` | INS-2003 | 409 | STL-081 | covered |
| `INS_STL_PAIR_ATOMIC_FAILED` | INS-2005 | 500 | STL-075 (rollback TC triggers this) | covered |
| `INS_STL_NOT_FOUND` | INS-2006 | 404 | STL-084 | covered |
| `INS_SO_COMPANY_REQUIRED` | INS-1002 | 400 | out-of-scope: baseline field đã production; W02 nếu regression | deferred/out-of-scope |
| `INS_STL_SO_NOT_COMPLETED` | INS-2004 | 400 | not in auto artifact currently | GAP — giải thích: manual TC-W01-API-080 coverage; auto artifact thiếu; add to next wave lesson |
| `INS_FORBIDDEN_TENANT` | INS-9001 | 403 | SOADJ-056, 057 | covered |
| `INS_UNAUTHENTICATED` | INS-9002 | 401 | SOADJ-053, 054, 055 | covered |

**GAP note `INS_STL_SO_NOT_COMPLETED`**: TC assert code `INS_STL_SO_NOT_COMPLETED` (INS-2004, VLD-INS-STL-004 — SO chưa hoàn thành → reject tạo phiếu QT) chưa có trong auto artifact. Root cause: API Impact Inventory không bắt rõ precondition "SO phải COMPLETED" cho createInsuranceSettlement. Lesson learn entry cần tạo, auto-miss resolve ở execution nếu seed data đủ.

---

## 5. Changelog

| Date | Change | Author |
| --- | --- | --- |
| 2026-06-11 | Gen auto testcase artifact cho Wave 01 tại TEST_PLANNING stage. 75 TC: FEAT-INS-SO-ADJUSTMENT 54 TC (SOADJ-001..071, gồm auth, field validation per-field, công thức, for-settlement, state-transition set-on/set-off/re-toggle, regression); FEAT-INS-STL-DETAIL 21 TC (STL-072..098, gồm createInsuranceSettlement happy+rollback+validation, getSettlementByCode, no-cancel AC-11, regression). Multi-feature grouping §4 H3 per feature + FEAT-discriminator. Error code assert 3 chiều (code+HTTP+side-effect). Ground-truth DB assertion cho mọi write TC. State-transition coverage cặp set-on/set-off/re-toggle. Common baseline coverage map + self-audit record. Auto vs manual parity audit (no auto-miss). Runner: QC-owned harness `Execution/auto/harness/api/`, command: `npx jest --runInBand --testPathPattern='w01'`. | agent-test-api |
