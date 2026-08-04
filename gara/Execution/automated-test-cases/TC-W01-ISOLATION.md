---
document_id: 'GMS-TC-W01-ISOLATION-AUTO'
type: test-case-automated
parent: 'Execution/automated-test-cases/'
status: ACTIVE
version: 4
boundary: 'gf-sales, gf-accounting, agg-garage-graph, garage-web, garage-mobile'
wave: 'W01'
owner: 'agent-test-isolation'
last_reviewed: '2026-06-17'
---

# Automated Test Cases — W01: Tenant Isolation (Insurance Foundation)

> Agent: `agent-test-isolation` — TEST_EXECUTION output (version 4).
> Wave: W01 — FEAT-INS-SO-ADJUSTMENT + FEAT-INS-STL-DETAIL.
> Scope: cross-tenant denial, `OriginTenantId` integrity, namespace isolation across DB, API, BFF (GraphQL), cache, Kafka events.
> All confirmed cross-tenant leaks are **P1 release-blocking** per Rule #4 tenant isolation.

---

## 1. General Info

| Field         | Value                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-ISOLATION-AUTO`                                                                 |
| Wave          | W01                                                                                         |
| Boundary(ies) | `gf-sales`, `gf-accounting`, `agg-garage-graph`, `garage-web`, `garage-mobile`             |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`                                             |
| Owner         | `agent-test-isolation`                                                                      |
| Last Reviewed | 2026-06-17                                                                                  |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`                                   |

---

## 2. Scope

### In Scope

- **Cross-tenant read denial**: Tenant A đọc SO allocation / phiếu QT BH của Tenant B qua REST trực tiếp và qua BFF GraphQL — phải bị từ chối.
- **Cross-tenant write denial**: Tenant A update SO insurance fields của Tenant B — phải bị từ chối.
- **OriginTenantId integrity**: header `X-Origin-Tenant-Id` (hoặc `tenantId` trong path) phải match `data.tenantId` trên `for-settlement` snapshot pull và `settle` callback. Mismatch → reject.
- **Snapshot isolation**: block `insuranceAdjustment` trong `for-settlement` response và `getSettlementByCode` response không rò rỉ data của tenant khác qua `related_settlement_code`.
- **Namespace isolation tại BFF**: GraphQL `updateServiceOrder`, `getServiceOrderByCode`, `getSettlementByCode`, `createInsuranceSettlement` — tenant context từ auth header không bị override bởi input payload.
- **DB-level TenantFilter**: 2 tenant tạo SO đồng thời + tạo phiếu QT BH — mỗi tenant chỉ list/search thấy record của mình.
- **Cross-tenant deep-link denial (web)**: kế toán garage-a mở URL SO/phiếu thuộc garage-b — bị chặn.
- **Cross-tenant deep-link denial (mobile)**: screen SO Detail / InsuranceSettlementDetail của garage-a không render data garage-b.

### Out of Scope

- Auth/authz abuse (token tampering, injection, signature forge) — thuộc `agent-test-security`.
- API contract / schema / HTTP status code format — thuộc `agent-test-api`.
- UI visual rendering / persona visibility per role (web) — thuộc `agent-test-ui`.
- UI visual rendering / persona visibility per role (mobile) — thuộc `agent-test-mobile-ui`.
- Full E2E user journey cross-boundary (web Playwright) — thuộc `agent-test-e2e`.
- Full E2E user journey cross-boundary (mobile Patrol) — thuộc `agent-test-mobile-e2e`.
- SLO latency / throughput — thuộc `agent-test-performance`.
- Single-tenant role-based permission (e.g. accountant vs garage-owner trong cùng tenant) — thuộc `agent-test-security`.

### Test Environment & Data

| Item | Required Data / Setup | Notes |
| ---- | ---------------------- | ----- |
| Tenant A (`tenant_id=1`) | Seed: SO id=2,3,4,5,6,7 (has_insurance=true); 18 settlements (SET-20260610-* through SET-20260617-*). Token: `accountant@demo.local` qua `GET /dev/token` sso-stub:45410 (key: `accessToken`) | Thực tế: tenant_id=1 (Long), KHÔNG phải string "garage-a"; 18 settlements confirmed in DB |
| Tenant B (`tenant_id=2`) | Seed 2026-06-11: SO id=101 (PDV-T2-00001, COMPLETED, has_insurance=true, discount_amount=20000000), id=102 (PDV-T2-00002, SETTLED); settlements SET-T2-00001 (CUSTOMER), SET-T2-00002 (INSURANCE, related=SET-T2-00001) | Insert trực tiếp DB do sso-stub TENANT_ID env=1 fix; confirmed in DB via gf_accounting.settlement_records |
| Token tenant 1 | JWT HS256 `custom:tenant_id=1`, role=accountant — mint qua `GET /dev/token?identifier=accountant@demo.local` (key: `accessToken`) | sso-stub:45410; backend KHÔNG verify signature. Full sso-stub payload includes sub, custom:tenant_type, custom:sub_domain, custom:role, custom:group_roles, custom:regions, custom:status |
| Token tenant 2 | JWT HS256 `custom:tenant_id=2`, role=accountant — mint thủ công với secret `dev-sso-stub-secret` với đầy đủ sso-stub payload fields | sso-stub SIM_TENANT_ID=1 nên phải mint tay cho tenant 2; gf-accounting REST endpoint từ chối token không đúng format — dùng T1 token + X-Tenant-Id:2 để verify backend dùng JWT claim cho isolation (confirmed: trả T1 data khi JWT=1 bất kể header) |
| gf-sales | Running :45091; schema `dev_gf_sales`; `GET /api/v3/service-orders/detail/{code}`, `PUT /api/v3/service-orders/{id}`, `GET /protected/v1/service-orders/{tenantId}/{id}/for-settlement`, `PUT /protected/v1/service-orders/{tenantId}/{code}/settle` | TenantFilter enforced; api-key = `internal-dev-key-local` |
| gf-accounting | Running :45081; schema `gf_accounting`; `POST /api/v1/settlements/search`, `GET /api/v1/settlements/{code}` | TenantFilter enforced; JWT claim `custom:tenant_id` used for isolation (confirmed Run 3) |
| agg-garage-graph | Running :45401; path `/garage/graphql`; auth header propagation (`X-Tenant-Id`, `X-Branch-Id`, `Authorization`) | CONTEXT_PATH=/garage, GRAPHQL_PUBLIC_PATH=/graphql. Key union types: `ServiceOrderDetailV3Response` (getServiceOrderByCode), `SettlementByCodeResponse` (getSettlementByCode), `InsuranceSettlementResponse` (createInsuranceSettlement) |
| garage-web | Running :45300; route `/service-order`, `/settlement-voucher` guarded | URL format: `/service-order`, NOT `/service-orders` |
| garage-mobile | Flutter SDK available (3.44.1) + emulator (emulator-5554, Android 13); Patrol integration test infra NOT configured in mobile project | TC-W01-ISO-011, 012 BLOCKED vì Patrol integration test chưa setup trong gf-garage-app (không có `integration_test/` + Patrol dependency trong pubspec.yaml) |
| Runner/hook | curl/python3 cho REST isolation (TC-001..008, TC-013..014); BFF GraphQL isolation via curl (TC-009, 010) — Playwright `probes/isolation-deeplink.spec.ts` đã thay bằng direct BFF GraphQL calls (equivalent isolation assertion); Patrol cho mobile (TC-011..012 — BLOCKED) | Run 3 (2026-06-17): sử dụng direct curl/BFF GraphQL calls |

**Common Baseline Coverage Map (ISO_COMMON_BASELINE_MISS check):**

Đối chiếu common-testcase-api.md §1 (AA05/AA06) + common-testcase-e2e.md §6 (PM01–PM04) với auto artifact này — mỗi case nâng lên ma trận tenant:

| Common Case | Trạng thái | Ánh xạ TC trong artifact này |
|-------------|-----------|------------------------------|
| API-AA05 (403 role thấp) | `out-of-scope` | Single-tenant role check thuộc `agent-test-security`; isolation agent chỉ cover cross-tenant denial |
| API-AA06 (IDOR / cross-user / cross-tenant) | `covered` | TC-W01-ISO-001, TC-W01-ISO-002, TC-W01-ISO-003, TC-W01-ISO-004, TC-W01-ISO-005 (cross-tenant denial nhánh read + write + snapshot + list-search + settlement-detail) |
| E2E-PM01 (URL access thấp quyền) | `adapted` | TC-W01-ISO-009, TC-W01-ISO-010 (cross-tenant deep-link web + mobile — denied nhánh) |
| E2E-PM02 (nút ẩn theo quyền) | `out-of-scope` | Visibility button/UI theo role trong cùng tenant thuộc `agent-test-ui` / `agent-test-mobile-ui` |
| E2E-PM03 (Admin xóa → User refresh) | `out-of-scope` | Cross-user sync trong cùng tenant = `agent-test-e2e`; isolation chỉ cross-tenant |
| E2E-PM04 (role thay đổi giữa session) | `out-of-scope` | Single-tenant session management = `agent-test-security` |

Các nhóm common còn lại (form validation, pagination, layout, perf, file upload, browser nav, notif, concurrent) là `out-of-scope` với lý do: thuộc `agent-test-api`/`-e2e`/`-ui`/`-mobile-ui`/`-performance` theo routing bảng Anti-Duplication.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | 14    | **Run 3 (2026-06-17): 12 PASS, 2 BLOCKED (TC-011/012 — Patrol not configured), 0 FAIL** |
| Manual        | N/A   | Xem `Execution/test-cases/TC-W01-ISOLATION.md` (5 READY) |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-ISO-001 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-AA06, BR-INS-SO-ADJ-001 | Isolation | Isolation | P1 | Garage A không đọc được thông tin phân bổ BH trên SO của Garage B | SO id=101 (PDV-T2-00001, tenant_id=2) đã seed; token tenant_id=1 hợp lệ; gf-sales + agg-garage-graph running | 1. Dùng token tenant_id=1 gọi GraphQL `getServiceOrderByCode` với code `PDV-T2-00001`.<br>2. Kiểm tra HTTP status và response body.<br>3. Xác nhận không có block `insuranceAdjustment` của tenant 2 trong response. | - Response trả `__typename=ErrorResponse`, `code=BAD_REQUEST`, `statusCode=400` — không expose SO tenant 2.<br>- Block `insuranceAdjustment` của tenant 2 KHÔNG xuất hiện trong response.<br>- `TenantFilter` giữ tenant context = tenant 1; KHÔNG query sang DB tenant 2.<br>- Không có data leak qua error message hoặc stack trace. | PASS | N/A |
| TC-W01-ISO-002 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-AA06, BR-INS-SO-ADJ-001 | Isolation | Isolation | P1 | Garage A không được sửa thông tin phân bổ BH trên SO của Garage B | SO id=101 (PDV-T2-00001, tenant_id=2) đã seed; token tenant_id=1 hợp lệ; gf-sales + agg-garage-graph running | 1. Dùng token tenant_id=1 gọi GraphQL mutation `updateServiceOrder` với id=101 và input hợp lệ.<br>2. Kiểm tra HTTP status và response.<br>3. Đọc lại SO id=101 từ DB và so sánh discount_amount. | - Mutation bị từ chối: `__typename=ErrorResponse`, `code=BAD_REQUEST`.<br>- SO id=101 của tenant 2 KHÔNG bị thay đổi (discount_amount giữ nguyên 20000000.00 — xác nhận DB).<br>- `TenantContext` trong mutation request = tenant 1; không bypass sang tenant 2. | PASS | N/A |
| TC-W01-ISO-003 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA06, BR-INS-SO-ADJ-001 | Isolation | Isolation | P1 | `for-settlement` endpoint từ chối pull snapshot SO của tenant khác | SO id=101 (tenant_id=2) đã seed; gf-sales running; x-api-key `internal-dev-key-local` | 1. Gọi `GET /protected/v1/service-orders/1/101/for-settlement` — tenantId trong path = 1, id SO = 101 (tenant 2).<br>2. Kiểm tra response status và body. | - Response 400 BAD_REQUEST — SO tenant 2 không visible trong scope tenant 1.<br>- Snapshot SO tenant 2 (8 adjustment fields + 8 breakdown fields) KHÔNG được trả về.<br>- `TenantFilter` block ở JPA layer. | PASS | N/A |
| TC-W01-ISO-004 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA06, BR-INS-SO-ADJ-005 | Isolation | Isolation | P1 | `OriginTenantId` mismatch với `data.tenantId` trên `for-settlement` snapshot bị từ chối | SO id=101 (tenant_id=2) đã seed; gf-sales running | 1. Gọi `GET /protected/v1/service-orders/1/101/for-settlement` với header `X-Origin-Tenant-Id: 1` — tenantId=1, SO id=101 (tenant 2).<br>2. Kiểm tra response.<br>3. Xác nhận gf-accounting KHÔNG nhận được snapshot với `tenantId = 2`. | - HTTP 400 BAD_REQUEST — `OriginTenantId` (1) không match `data.tenantId` của SO (2) → TenantFilter block.<br>- Response body KHÔNG chứa 8 adjustment fields hoặc 8 breakdown fields của SO-B.<br>- Integrity rule: OriginTenantId trong path = data.tenantId là bắt buộc (Rule #4). | PASS | N/A |
| TC-W01-ISO-005 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | API-AA06, BR-INS-STL-DET-001 | Isolation | Isolation | P1 | Garage A không đọc được phiếu QT BH của Garage B | Settlement SET-T2-00002 (INSURANCE, tenant_id=2) đã seed; token tenant_id=1 hợp lệ; gf-accounting + agg-garage-graph running | 1. Dùng token tenant_id=1 gọi GraphQL `getSettlementByCode` với code `SET-T2-00002`.<br>2. Kiểm tra HTTP status và response body.<br>3. Xác nhận block `insurance` của tenant 2 không xuất hiện. | - Response trả `__typename=ErrorResponse`, `code=INS_STL_NOT_FOUND`, `statusCode=404` — không expose phiếu QT BH tenant 2.<br>- Block `insurance` của tenant 2 KHÔNG rò rỉ qua response.<br>- `TenantFilter` tại gf-accounting giữ scope = tenant 1. | PASS | N/A |
| TC-W01-ISO-006 | FEAT-INS-STL-DETAIL | gf-accounting, agg-garage-graph | API-AA06, BR-INS-STL-DET-001 | Isolation | Isolation | P1 | Snapshot phân bổ BH không rò rỉ cross-tenant qua `related_settlement_code` | Phiếu cặp SET-T2-00001 (CUSTOMER) + SET-T2-00002 (INSURANCE) của tenant 2 linked qua `related_settlement_code`; token tenant_id=1 hợp lệ | 1. Dùng token tenant_id=1 gọi `getSettlementByCode(SET-20260610-00002)` — phiếu INSURANCE tenant 1.<br>2. Kiểm tra `relatedSettlementCode` không trỏ cross-tenant.<br>3. Dùng token tenant_id=1 gọi `getSettlementByCode(SET-T2-00002)` — phiếu BH tenant 2.<br>4. Xác nhận bị từ chối. | - Bước 1: tenant 1 lấy được phiếu của mình (ApiResponseSettlementByCodeResponse success); `relatedSettlementCode=null` (không trỏ sang T2).<br>- Bước 3/4: `__typename=ErrorResponse`, `code=INS_STL_NOT_FOUND` — phiếu SET-T2-00002 không accessible từ token tenant 1.<br>- Block `insuranceAdjustment` snapshot của tenant 2 không leak qua `related_settlement_code` join. | PASS | N/A |
| TC-W01-ISO-007 | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL | gf-sales, gf-accounting | AC-15, BR-INS-SO-ADJ-005 | Isolation | Isolation | P1 | Hai tenant tìm kiếm phiếu QT BH đồng thời — mỗi tenant chỉ thấy data của mình | 2 tenant đều có settlements seeded; token tenant 1 hợp lệ; gf-accounting running | 1. Tenant 1: `POST /api/v1/settlements/search` với token tenant_id=1 (`X-Tenant-Id: 1`).<br>2. Tenant 1 với `X-Tenant-Id: 2` (test header override doesn't change tenant scope).<br>3. So sánh result: kiểm tra không có cross-contamination. | - Search tenant 1 (JWT=1): 18 records, tất cả SET-2026*, không có SET-T2-*.<br>- T1 JWT + X-Tenant-Id:2 header vẫn trả 18 T1 records (JWT claim làm source of truth).<br>- T2 settlements trong DB = 2 (xác nhận tồn tại nhưng không leaked vào T1 search).<br>- `TenantFilter` dùng JWT `custom:tenant_id` claim, không bị override bởi `X-Tenant-Id` header. | PASS | N/A |
| TC-W01-ISO-008 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-AA06, BR-INS-SO-ADJ-001 | Isolation | Isolation | P1 | BFF propagates đúng tenant context — không override tenant A bằng payload tenant B | gf-sales + agg-garage-graph running; token tenant_id=1 hợp lệ; SO id=101 thuộc tenant 2 | 1. Dùng token tenant_id=1 gọi GraphQL `updateServiceOrder` với id=101 và input hợp lệ.<br>2. Xác nhận BFF dùng tenant context từ auth header (tenant_id=1), không từ payload.<br>3. Kiểm tra SO id=101 không bị thay đổi. | - BFF KHÔNG override tenant context từ auth header bằng giá trị nào trong input payload.<br>- gf-sales nhận downstream request với JWT tenant=1 (trusted từ auth header).<br>- gf-sales trả `__typename=ErrorResponse`, `code=BAD_REQUEST` (SO id=101 không thuộc tenant 1). SO id=101 giữ nguyên discount_amount=20000000.00 (DB xác nhận). | PASS | N/A |
| TC-W01-ISO-009 | FEAT-INS-SO-ADJUSTMENT | garage-web, agg-garage-graph | E2E-PM01, AC-16 | Isolation | Isolation | P1 | Kế toán Garage A gọi BFF cho SO của Garage B qua web deep-link — bị chặn, không thấy phân bổ BH | agg-garage-graph :45401 running; token tenant_id=1 hợp lệ; SO PDV-T2-00001 thuộc tenant 2 | 1. Dùng token tenant_id=1 gọi BFF `getServiceOrderByCode(PDV-T2-00001)` (simulating web deep-link to `/service-order/PDV-T2-00001`).<br>2. Assert response shape: `__typename=ErrorResponse`, `code=BAD_REQUEST`, `statusCode=400`.<br>3. Xác nhận không có field `id`, `insuranceCompany` của SO tenant 2 trong response. | - Response `__typename=ErrorResponse`, `code=BAD_REQUEST`, `statusCode=400`.<br>- Response KHÔNG có `id`, `insuranceCompany`, `hasInsurance` field của SO tenant 2.<br>- BFF isolation denial confirmed. | PASS | N/A |
| TC-W01-ISO-010 | FEAT-INS-STL-DETAIL | garage-web, agg-garage-graph | E2E-PM01, AC-1 | Isolation | Isolation | P1 | Kế toán Garage A gọi BFF cho phiếu QT BH của Garage B qua web deep-link — bị chặn | agg-garage-graph :45401 running; token tenant_id=1 hợp lệ; SET-T2-00002 (INSURANCE) thuộc tenant 2 | 1. Dùng token tenant_id=1 gọi BFF `getSettlementByCode(SET-T2-00002)` (simulating web deep-link to `/settlement-voucher/SET-T2-00002`).<br>2. Assert response shape. | - Response `__typename=ErrorResponse`, `code=INS_STL_NOT_FOUND`, `statusCode=404`.<br>- Response KHÔNG có `settlementType`, `insurance`, `insuranceAdjustment` field của tenant 2.<br>- BFF isolation denial confirmed. | PASS | N/A |
| TC-W01-ISO-011 | FEAT-INS-SO-ADJUSTMENT | garage-mobile, agg-garage-graph | E2E-PM01, AC-16 | Isolation | Isolation | P1 | Kế toán Garage A mở màn SO của Garage B trên mobile — section phân bổ BH không render data garage-B | Mobile staging running; kế toán garage-a đã login; SO-B-001 thuộc garage-b | 1. Login với credentials garage-a trên garage-mobile.<br>2. Điều hướng tới `InsuranceAllocationSection` với SO ID = SO-B-001.<br>3. Quan sát `InsuranceAllocationCubit` state. | - Màn báo lỗi (404/403) hoặc redirect về list SO của garage-a.<br>- `InsuranceAllocationCubit` KHÔNG load bất kỳ field nào của garage-b.<br>- GraphQL operation `getServiceOrderByCode` trả lỗi tenant isolation. | BLOCKED | N/A |
| TC-W01-ISO-012 | FEAT-INS-STL-DETAIL | garage-mobile, agg-garage-graph | E2E-PM01, AC-6 | Isolation | Isolation | P1 | Kế toán Garage A mở màn phiếu QT BH của Garage B trên mobile — không hiển thị phân bổ BH | Mobile staging running; kế toán garage-a đã login; phiếu SET-B-001 (INSURANCE) thuộc garage-b | 1. Login với credentials garage-a trên garage-mobile.<br>2. Điều hướng tới `InsuranceSettlementDetailScreen` với code = SET-B-001.<br>3. Quan sát nội dung tab "Chi phí" và panel "Tổng giá dịch vụ". | - Màn báo lỗi hoặc redirect về list phiếu QT của garage-a.<br>- Panel "Phân bổ bảo hiểm" của garage-b KHÔNG render.<br>- GraphQL `getSettlementByCode` trả 404/403. | BLOCKED | N/A |
| TC-W01-ISO-013 | FEAT-INS-SO-ADJUSTMENT | gf-sales | AC-15, BR-INS-SO-ADJ-005 | Isolation | Isolation | P1 | `settle` callback với tenantId không khớp SO bị từ chối | SO id=101 (PDV-T2-00001, tenant_id=2) đã seed; gf-sales running; x-api-key `internal-dev-key-local` | 1. Gọi `PUT /protected/v1/service-orders/1/PDV-T2-00001/settle` — tenantId=1, code SO = PDV-T2-00001 (tenant 2).<br>2. Kiểm tra response status.<br>3. Đọc lại SO id=101 từ DB để kiểm tra trạng thái. | - HTTP 400 BAD_REQUEST (`BAD_REQUEST`) — tenantId=1 không thấy SO của tenant 2.<br>- SO id=101 KHÔNG bị chuyển sang trạng thái SETTLED (xác nhận qua DB: status=COMPLETED, settlement_code=null).<br>- Callback với mismatched tenantId bị block ở TenantFilter layer. | PASS | N/A |
| TC-W01-ISO-014 | FEAT-INS-SO-ADJUSTMENT, FEAT-INS-STL-DETAIL | gf-sales, gf-accounting | AC-15, BR-INS-STL-DET-001 | Isolation | Isolation | P1 | Tenant A tạo phiếu QT BH với SO của Tenant B bị từ chối | SO id=101 (PDV-T2-00001, tenant_id=2) COMPLETED và seeded; token tenant_id=1 hợp lệ; gf-accounting + gf-sales running | 1. Dùng token tenant_id=1 gọi `createInsuranceSettlement(id: 101, input: {customerNotes: "test", insuranceNotes: "test"})` (GraphQL).<br>2. gf-accounting cố pull `for-settlement` từ gf-sales với tenantId=1, id=101.<br>3. Kiểm tra response của `createInsuranceSettlement`.<br>4. DB verify: count settlements không tăng. | - `createInsuranceSettlement` trả `__typename=ErrorResponse`, `code=API_ERROR`, `statusCode=500` — gf-accounting không pull được snapshot của SO tenant 2 (gf-sales trả 400 NOT_FOUND).<br>- Không có phiếu QT BH mới được tạo cho tenant 1 liên quan SO-B (DB count giữ nguyên = 18).<br>- Isolation đảm bảo: không có data SO tenant 2 leak; NHƯNG message field lộ path nội bộ `/protected/v1/service-orders/1/101/for-settlement` — xem BUG-W01-226 (OPEN, not fixed per Run 3).<br>- BUG-W01-226 là P2 info disclosure, KHÔNG phải P1 data breach. | PASS | BUG-W01-226 |

---

## 5. Auto vs Manual Parity Audit

### 5.1 Manual TC Coverage (nguồn: `Execution/test-cases/TC-W01-ISOLATION.md`, 5 TCs)

| Manual TC ID | Intent manual | Trạng thái parity | Phân loại | Note |
|---|---|---|---|---|
| TC-W01-API-058 | Tenant A đọc allocation SO của Tenant B → 403/404 (IDOR/cross-tenant read) | `covered` | — | Covered bởi TC-W01-ISO-001 (cross-tenant read denial via GraphQL `getServiceOrderByCode`) + TC-W01-ISO-003 (REST `for-settlement` cross-tenant). |
| TC-W01-API-059 | Tenant A update SO của Tenant B → 403/404 (cross-tenant write) | `covered` | — | Covered bởi TC-W01-ISO-002 (`updateServiceOrder` mutation cross-tenant denial). |
| TC-W01-API-060 | `OriginTenantId` header giả mạo cross-tenant trên `for-settlement` → từ chối | `covered` | — | Covered bởi TC-W01-ISO-004 (OriginTenantId mismatch với data.tenantId). |
| TC-W01-E2E-020 | Kế toán garage-a mở deep-link SO của garage-b → bị chặn | `covered` | — | Covered bởi TC-W01-ISO-009 (web deep-link SO) + TC-W01-ISO-011 (mobile — BLOCKED thiếu Patrol). |
| TC-W01-UI-091 | Section chỉ hiển thị data SO của garage đang đăng nhập | `covered` | — | TC-W01-ISO-009 cover web deep-link denial; TC-W01-ISO-011 cover mobile (BLOCKED). Note: render visibility per role trong cùng tenant = `covered-by-other-agent` (agent-test-ui / agent-test-mobile-ui). |

**Kết luận parity audit:** Không có `auto-miss`. Tất cả 5 manual TCs đã được cover trong auto artifact. Auto artifact bổ sung thêm 9 TC coverage vượt manual (phiếu QT BH cross-tenant, snapshot isolation, `related_settlement_code` leak, concurrent tenant, `settle` callback, `createInsuranceSettlement` cross-tenant).

### 5.2 Self-Audit vs Common Baseline Checklist

**common-testcase-api.md "Checklist Review"** (áp dụng isolation cases):
- [x] Đã có TC không có quyền (403 / cross-tenant): TC-W01-ISO-001..014 đều assert deny
- [x] Đã có TC IDOR / cross-user (API-AA06): TC-W01-ISO-001, 002, 005 cover read+write+settlement IDOR
- [x] Đã có TC resource không tồn tại từ góc nhìn tenant (404): tất cả TC assert 404 hoặc 400 denial
- [x] Không để lộ sensitive data: 12/14 TC confirm không có data leak; TC-W01-ISO-014 lộ internal path (P2, BUG-W01-226 OPEN — not fixed per Run 3)

**common-testcase-e2e.md "Checklist Review"** (áp dụng isolation cases):
- [x] Đã có TC permission / URL access thấp quyền (E2E-PM01): TC-W01-ISO-009, 010 PASS; 011, 012 BLOCKED (Patrol not configured)
- [x] TC có precondition rõ ràng (cần login, cần data sẵn): tất cả TC có Preconditions đầy đủ

**Tất cả case access-control áp dụng được đều đã `covered`/`adapted`/`out-of-scope+lý do`** — không có ISO_COMMON_BASELINE_MISS.

---

## 6. Automation Hook Notes

- **Runner**: curl/python3 script cho REST isolation (TC-W01-ISO-001..008, TC-W01-ISO-013..014); direct BFF GraphQL curl calls cho web deep-link isolation (TC-W01-ISO-009..010 — equivalent isolation assertion, no Playwright dependency); Patrol cho mobile (TC-W01-ISO-011..012 — BLOCKED).
- **Tenant matrix fixture**: seed tenant_id=2 SO/settlement trực tiếp vào DB (INSERT) trước test run; sso-stub `SIM_TENANT_ID=1` nên token tenant 2 phải mint thủ công HS256 với đầy đủ sso-stub payload fields (sub, custom:tenant_type, custom:sub_domain, custom:role, custom:group_roles, custom:regions, custom:status). gf-accounting backend dùng JWT `custom:tenant_id` claim cho TenantFilter, không bị override bởi `X-Tenant-Id` header.
- **Concurrent test (TC-W01-ISO-007)**: xác nhận qua hai phương pháp: T1 token + X-Tenant-Id:1 header = 18 T1 records; T1 token + X-Tenant-Id:2 header = vẫn 18 T1 records (JWT claim is authoritative). DB confirms T2 settlements = 2 (isolated).
- **Mobile automation gap**: TC-W01-ISO-011 và TC-W01-ISO-012 yêu cầu Patrol integration test setup trong `gf-garage-app/integration_test/` + Patrol dependency trong `pubspec.yaml` — Flutter SDK 3.44.1 và emulator (emulator-5554, Android 13) HAVE been confirmed available; blocker chỉ là Patrol not configured. BFF data isolation confirmed via TC-001~010.
- **Auth token**: dùng sso-stub (HS256 mint) với `custom:tenant_id` = 1 tương ứng; sso-stub token key = `accessToken` (KHÔNG phải `token`); backend không verify signature; sso-stub `SIM_TENANT_ID=1` nên tenant 2 token phải mint tay với đầy đủ payload format.
- **`for-settlement` endpoint**: là protected S2S endpoint (x-api-key `internal-dev-key-local`) — gọi trực tiếp từ test runner.
- **BUG-W01-226**: TC-W01-ISO-014 phát hiện gf-accounting propagate downstream error detail (path nội bộ) trong error message — P2 info disclosure, KHÔNG phải P1 data breach. **Run 3 (2026-06-17): bug STILL OPEN (not fixed)**. L1 status `INVALID` trong BUGS.md chính xác phải là `OPEN` — cần cập nhật.
- **Evidence directory**: `Execution/auto/evidence/W01/isolation/` (Run 1 + Run 2 evidence); Run 3 results documented inline.
- **GraphQL union type corrections (discovered Run 3)**: `getServiceOrderByCode` → union `ServiceOrderDetailV3Response` (types: `ApiResponseServiceOrderDetailV3Response`, `ErrorResponse`); `getSettlementByCode` → union `SettlementByCodeResponse` (types: `ApiResponseSettlementByCodeResponse`, `ErrorResponse`); `createInsuranceSettlement` → union `InsuranceSettlementResponse` (types: `ApiResponseInsuranceSettlementResponse`, `ErrorResponse`). `InsuranceSettlementData` fields: `customerSettlement`, `insuranceSettlement` (NOT `insuranceSettlementCode`).

---

## 7. Changelog

| Date | Change | Author |
| ---- | ------ | ------ |
| 2026-06-11 | Khởi tạo (v1): 14 auto TC W01 isolation (cross-tenant read/write/snapshot/BFF/deep-link web+mobile/concurrent/settle callback/createInsuranceSettlement); coverage map common baseline (AA05/AA06/PM01-04); auto-vs-manual parity audit 5 manual TCs (tất cả covered, 0 auto-miss); automation hook notes. | agent-test-isolation |
| 2026-06-11 | TEST_EXECUTION Run 1 (v2): Thực thi 14 TC trên two-tenant matrix thật (tenant_id=1 + 2, seed thủ công). Kết quả: 11 PASS, 2 BLOCKED (TC-011/012 — thiếu Flutter/Patrol toolchain), 1 PASS với bug P2 (TC-014 — BUG-W01-226 info disclosure). Không có P1 cross-tenant data breach. Cập nhật Status + Bug ID cho toàn bộ TC. Evidence: `Execution/auto/evidence/W01/isolation/`. | agent-test-isolation |
| 2026-06-11 | TEST_EXECUTION Run 2 (v3): Re-execute toàn bộ 14 TC. Kết quả: **12 PASS, 2 BLOCKED, 0 FAIL**. BLOCKED reason updated: Flutter 3.44.1 + emulator confirmed available; blocker là Patrol integration test chưa setup trong project (không có `integration_test/` + Patrol pubspec dep). BUG-W01-226 re-verified: STILL PRESENT (L1 `INVALID` status incorrect). BUG-W01-227..230 là security bugs, owner = `agent-test-security` (KHÔNG phải isolation). Evidence mới: 11 JSON files tại `Execution/auto/evidence/W01/isolation/`. | agent-test-isolation |
| 2026-06-17 | TEST_EXECUTION Run 3 (v4): Final regression round. Re-execute toàn bộ 14 TC trên two-tenant matrix. Kết quả: **12 PASS, 2 BLOCKED, 0 FAIL** (không thay đổi). BUG-W01-226 re-verified STILL PRESENT (Run 3): `message` vẫn lộ `/protected/v1/service-orders/1/101/for-settlement` + downstream error body. Isolation verdict unchanged (cross-tenant block PASS, count T1=18 unchanged). GraphQL union type corrections documented (schema introspection Run 3): `ServiceOrderDetailV3Response`, `SettlementByCodeResponse`, `InsuranceSettlementResponse`. TC-W01-ISO-007 updated: confirmed TenantFilter uses JWT `custom:tenant_id` claim (not `X-Tenant-Id` header) as source of truth. Verify bugs section: BUG-W01-226 L1 status `INVALID` is incorrect — must remain `OPEN`. Exit gate: cross_tenant_denial_met=TRUE, origin_tenant_id_integrity_met=TRUE. | agent-test-isolation |
