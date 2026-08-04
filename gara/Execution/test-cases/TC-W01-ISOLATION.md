---
document_id: 'GMS-TC-W01-ISOLATION'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-sales, agg-garage-graph, garage-web'
wave: 'W01'
owner: 'QA Authority'
last_reviewed: '2026-06-11'
---

# Test Case Template - W01: Isolation

> Split từ `TC-W01-{API,E2E,UI}.md` — gom các TC `Suite=Isolation` (tenant isolation cross-tenant read/write/deep-link). TC ID giữ nguyên prefix gốc.

---

## 1. General Info

| Field         | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Document ID   | `GMS-TC-W01-ISOLATION`                                     |
| Wave          | W01                                                        |
| Boundary(ies) | `gf-sales`, `agg-garage-graph`, `garage-web`               |
| Feature(s)    | `FEAT-INS-SO-ADJUSTMENT`, `FEAT-INS-STL-DETAIL`            |
| Owner         | QA Authority                                               |
| Last Reviewed | 2026-06-11                                                 |
| Work Package  | `Execution/work-packages/PKG-W01-insurance-foundation.md`  |

---

## 2. Scope

### In Scope

- Cross-tenant read (IDOR) qua API: tenant A đọc allocation SO của tenant B
- Cross-tenant write qua API: tenant A update SO của tenant B
- OriginTenantId header giả mạo
- Cross-tenant deep-link UI: garage-a mở URL trực tiếp tới SO/phiếu của garage-b
- UI section chỉ render data tenant hiện tại

### Out of Scope

- Authn/Authz role-based — xem `TC-W01-SECURITY.md`
- API contract test — xem `TC-W01-API.md`

### Test Environment & Data

| Item            | Required Data / Setup                                                       | Notes                                            |
| --------------- | --------------------------------------------------------------------------- | ------------------------------------------------ |
| Token garage-a  | `accountant@garage-a.test`                                                  | Source token                                     |
| Tenant B        | `garage-b` với SO `#SO-B-001` riêng + phiếu QT BH riêng                     | Target cross-tenant                              |
| Staging env     | gf-sales + agg-garage-graph + garage-web running                            | —                                                |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
| ------------- | ----- | -------------- |
| Automated     | N/A   | —              |
| Manual        | 5     | 5 READY        |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W01-API-058 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-TN01, API-AA06 | Security | Isolation | P1 | [IDOR/Tenant] Tenant A đọc allocation SO của Tenant B → 403/404 | SO `#SO-B-001` thuộc garage-b; token garage-a | 1. Gọi `getServiceOrderByCode` SO garage-b bằng token garage-a. | - HTTP 403 hoặc 404 (404 an toàn hơn).<br>- Response không chứa allocation garage-b. | READY | N/A |
| TC-W01-API-059 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | API-TN02 | Security | Isolation | P1 | [Tenant] Tenant A update SO của Tenant B → 403/404 | SO `#SO-B-001` thuộc garage-b; token garage-a | 1. Gọi `updateServiceOrderV3` SO garage-b bằng token garage-a. | - HTTP 403 hoặc 404.<br>- SO garage-b KHÔNG bị update. | READY | N/A |
| TC-W01-API-060 | FEAT-INS-SO-ADJUSTMENT | gf-sales | API-TN04 | Security | Isolation | P2 | [Tenant] OriginTenantId header giả mạo cross-tenant → từ chối | for-settlement accessible | 1. Gọi `for-settlement` với X-Origin-Tenant-Id garage-a nhưng SO thuộc garage-b. | - HTTP 403 hoặc 404.<br>- Không trả snapshot SO garage-b. | READY | N/A |
| TC-W01-E2E-020 | FEAT-INS-SO-ADJUSTMENT | gf-sales, agg-garage-graph | E2E-TN02 | E2E | Isolation | P1 | [Tenant] Kế toán garage-a mở deep-link SO của garage-b → bị chặn | Staging; SO `#SO-B-001` thuộc garage-b; login garage-a | 1. Đăng nhập garage-a.<br>2. Mở URL trực tiếp tới SO garage-b. | - Bị chặn (403/404).<br>- Không xem được allocation garage-b. | READY | N/A |
| TC-W01-UI-091 | FEAT-INS-SO-ADJUSTMENT | garage-web | UI-PM04 | Security | Isolation | P1 | [Web][Tenant] Section chỉ hiển thị data SO của garage đang đăng nhập | Token garage-a; SO garage-a | 1. Đăng nhập garage-a, mở SO của garage-a.<br>2. Thử mở deep-link SO garage-b. | - Chỉ thấy allocation garage-a.<br>- Deep-link SO garage-b bị chặn (không render data). | READY | N/A |

---

## 5. Changelog

| Date     | Change                                              | Author     |
| -------- | --------------------------------------------------- | ---------- |
| 2026-06-11 | Split từ `TC-W01-{API,E2E,UI}.md` — extract 5 TC Suite=Isolation: TC-W01-API-058..060 (cross-tenant API), TC-W01-E2E-020 (deep-link), TC-W01-UI-091 (UI tenant scope). TC ID + nội dung row giữ nguyên (không renumber). | QA Authority |
