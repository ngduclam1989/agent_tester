---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-hrms (provider)"
provider: "gf-hrms"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-hrms` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-hrms` (employee profile, HR management).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-hrms`** — Employee/local user profile owner (theo ADR-003) |
| Provider docs | [Architecture/api/gf-hrms-api.md](../api/gf-hrms-api.md), [Architecture/hld/gf-hrms-HLD.md](../hld/gf-hrms-HLD.md) |
| Used by boundary | `gf-sales`, `gf-notification` (xem note) |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | Per caller: `hrm-service.url=${HRM_SERVICE_URL}` |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (employee profile) |

### Caller config

| Caller | Client class | Config property | Source |
|---|---|---|---|
| `gf-sales` | `HrmsClient.java` | `hrm-service.url` | `gf-sales/src/main/java/com/actechx/gf/adapter/client/HrmsClient.java` |
| `gf-notification` | `HrmClient.java` | `hrm-service.url` | `gf-notification/src/main/java/com/actechx/notification/client/HrmClient.java` — **NOTE**: HrmClient.searchAllEmployee() là dead code (POST /search không tồn tại trong provider) |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-hrms phục vụ:
- gf-sales: lookup employee info khi assign service advisor / mechanic cho SO
- gf-notification: (planned) search employees cho notification recipient resolution — hiện dead code

**Why**: gf-hrms là employee profile owner (ADR-003). Các service khác lookup qua protected APIs.

**Ref**: ADR-003 (tenant + SSO boundary), ADR-001 (microservice landscape).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | `X-Tenant-Id` header |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Get employee by ID | GET | `/protected/v1/employees/{tenantId}/{id}` | gf-sales | Employee lookup khi assign advisor/mechanic cho SO |

**Unused protected endpoints** (per KG RULE-08 audit 2026-05-14): `POST /protected/v1/employees/migrate-employee-from-tenant`, `POST /protected/v1/employees/migrate-user-to-iam` (admin migration tools), `DELETE/PUT/GET /protected/v1/validation-cache/*` (cache admin) — no SVC callers.

---

## 5. Request / Response Contracts

### 5.1 Get employee by ID

**Request**:
```
GET /protected/v1/employees/{tenantId}/{id}
Headers: x-api-key
```

**Response**: `200 OK` với `ApiResponse<EmployeeResponse>` chứa full employee info (id, employeeCode, firstName, lastName, phone, email, branchId, primaryRole, employmentStatus, ssoStatus, ...).

---

## 6. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-sales: surface error, block SO nếu employee info required |
| Provider 5xx | Surface error to caller |
| 404 (employee not found) | gf-sales: treat as invalid assignment |

---

## 7. Idempotency & Ordering

GET by ID idempotent. No ordering concern.

---

## 8. Observability

`<caller>.hrm_client.requests`, `<caller>.hrm_client.duration`. Log `correlation_id`, `tenantId`, `employeeId`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal — 99.9% expected. p99 < 300ms (search có pagination max 100).

---

## 10. PII / Compliance

PII transmitted: employee name, phone, email. Audit log mandatory. Retention: notification log retain 90 days; PII not logged.

---

## 11. Sandbox vs Production

Env switchover via `HRM_SERVICE_URL`.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock HrmsClient / HrmClient |
| Integration | Real gf-hrms test instance |
| Contract | Verify schema giữa controllers và callers (gf-sales, gf-notification) |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-hrms down | gf-sales SO assignment degraded (employee info unavailable); alert ops |
| Employee not found | Verify employee ID + tenantId correct; check employee status not TERMINATED |

---

## 14. Forbidden patterns

- ❌ Callers (gf-sales/gf-notification) ghi trực tiếp DB của `gf-hrms` — phải qua protected employee API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full employee phone/email/PII raw — sanitize (mask last 4 digits).
- ❌ Cache employee data quá lâu — staff turnover dynamic; recommend TTL ≤ 1h.
- ❌ Assign employee đã `status=TERMINATED` vào SO — caller phải verify status.

## 15. References

- HLD provider: [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md)
- HLD callers: [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-notification-HLD.md](../hld/gf-notification-HLD.md)
- API contract: [gf-hrms-api.md](../api/gf-hrms-api.md), [gf-sales-api.md](../api/gf-sales-api.md), [gf-notification-api.md](../api/gf-notification-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-003 (tenant + SSO boundary — gf-hrms employee profile owner)
- Related INTEG: [INTEG-EXT-sec-iam-service.md](INTEG-EXT-sec-iam-service.md) (gf-hrms cũng integrate IAM cho user provisioning)
- KG: [gf-hrms.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-hrms.knowledge-graph.yaml) — 18 APIs (12 public + 1 internal active + 5 unused)
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial integration contract `gf-notification` -> `gf-hrms` (employee profile owner per ADR-003, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operation employee search basic info cho notification recipient resolution (SMS/Email/Push dispatch); failure mode no auto-retry, employee status filter (`statuses: [ACTIVE]`) bắt buộc tránh notification cho ex-employee, cache TTL <=1h hoặc invalidate on event vì staff turnover dynamic. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-19 | v2 | Sync với KG: verified 1/1 active endpoint match; thêm 5 unused endpoints note; thêm KG reference; version bump. |
| 2026-05-11 | v1.1 | Rewrite scope multi-caller: (1) Mở rộng từ gf-notification-only → Garage services ↔ gf-hrms; (2) Xóa phantom endpoint POST /protected/v1/employees/search — KHÔNG tồn tại trong ProtectedEmployeeController, gf-notification HrmClient.searchAllEmployee() là dead code; (3) Thêm GET /protected/v1/employees/{tenantId}/{id} (used by gf-sales HrmsClient); (4) Thêm gf-sales vào Caller config. KG không cần sửa. |
