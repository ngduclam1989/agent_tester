---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "gms-auth-and-user-lifecycle"
provider: "sec-iam-service"
last_reviewed: "2026-05-07"
supersedes: "none"
---

# Integration - GMS boundaries <-> sec-iam-service (External Service)

> Document tích hợp giữa các boundary GMS và **sec-iam-service**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Service name | **sec-iam-service** - IAM/auth/user lifecycle ecosystem service |
| Provider docs | agg-sso-graph-HLD.md |
| Provider status page | agg-sso-graph-HLD.md |
| Used by boundary | `agg-sso-graph`, `ct-saas-tenant`, `gf-hrms` |
| Module / class | `agg-sso-graph/src/graphql/modules/auth/auth.service.ts`; `ct-saas-tenant/.../IamClient.java`; `ct-saas-tenant/.../IamProtectedClient.java`; `gf-hrms/.../IamServiceClient.java` |
| Sandbox URL | `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service` theo default config |
| Production URL | Env runtime: `API_SERVICE_ENDPOINT`, `IAM_SERVICE_URL`, hoặc `internal-service.iam.base-url` tùy boundary |
| API version pinned | Không thấy version pin riêng; endpoint đang dùng path `/auth/*`, `/users/*`, `/protected/users/*` |
| SDK / library | `agg-sso-graph`: hand-written Axios `ApiClient`; BE Java: Spring HTTP interface / RestClient |
| Category | Auth / Identity / User lifecycle |

Boundary-specific configuration:

| Boundary | Config key | Default / source |
|---|---|---|
| `agg-sso-graph` | `API_SERVICE_ENDPOINT` | `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service` |
| `ct-saas-tenant` | `iam-service.url` / `IAM_SERVICE_URL` | `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service` |
| `gf-hrms` | `iam-service.url`, `internal-service.iam.base-url` | `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service` hoặc env runtime |

## 2. Why this provider (decision)

**Decision**: GMS dùng `sec-iam-service` làm authority cho login, token lifecycle, password lifecycle và IAM user lifecycle.

**Why**:

- `agg-sso-graph` không tự issue/verify toàn bộ identity flow mà proxy các mutation auth sang `sec-iam-service`.
- `ct-saas-tenant` cần tạo/cập nhật IAM user, group roles, subdomain và status khi tenant/user thay đổi.
- `gf-hrms` cần tạo user IAM, cập nhật status/group roles và retry IAM integration trong employee/user lifecycle.

**Alternatives considered**: Không thấy ADR hoặc source decision về provider thay thế trong source hiện tại.

**Ref**:

- `Architecture/integrations/INTEG-BFF-agg-sso-graph.md`
- `Architecture/integrations/_EXT-INTEGRATION-PHASE0-BASELINE.md`

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method cho public auth flow | `x-client-type` header; một số operation forward `Authorization` bearer nếu context có |
| Auth method cho protected/internal flow | `x-api-key` internal header và `x-client-type` ở các client Java quan sát được |
| Credential rotation | Chưa thấy quy trình rotation trong source hiện tại |
| Storage | `INTERNAL_API_KEY` cho internal API key; IAM base URL qua env/config |
| Scope / permission | Login/password/token/user lifecycle; protected user status, info, group roles, subdomain |
| Multi-tenant strategy | Tenant/user context nằm trong request payload/header; không thấy credential per tenant trong source hiện tại |

Header behavior theo boundary:

| Boundary | Header behavior hiện tại |
|---|---|
| `agg-sso-graph` | `BaseService.getHeaders()` chỉ forward `Authorization` và `x-client-type`; login/forgot/first-change truyền `x-client-type` riêng |
| `ct-saas-tenant` | `IamClient`/`IamProtectedClient` truyền `x-api-key`; một số call truyền thêm `x-client-type` |
| `gf-hrms` | `HttpClientConfig` set default header `x-api-key` và JSON headers cho RestClient; `createUser` truyền `x-client-type` |

### 3.2 Webhook security

Không thấy source hiện tại mô tả `sec-iam-service` gửi webhook về GMS. Không áp dụng ở Phase 1.

## 4. Endpoints / Operations Used

Chỉ liệt kê operation quan sát được từ source GMS hiện tại.

| # | Operation | Method | Path / RPC | Used by | Trigger |
|---:|---|---|---|---|---|
| 1 | Login | `POST` | `/auth/login` | `agg-sso-graph` | GraphQL `Mutation.login` |
| 2 | Refresh token | `POST` | `/auth/refresh-token` | `agg-sso-graph` | GraphQL `Mutation.refreshToken` |
| 3 | Logout | `POST` | `/auth/logout` | `agg-sso-graph` | GraphQL `Mutation.logout`; có thể xóa device token sau logout |
| 4 | Forgot password | `POST` | `/auth/forgot-password` | `agg-sso-graph` | GraphQL `Mutation.forgotPassword` |
| 5 | Forgot password confirm | `POST` | `/auth/forgot-password/confirm` | `agg-sso-graph` | GraphQL `Mutation.forgotPasswordConfirm` |
| 6 | First change password | `POST` | `/auth/first-change-password` | `agg-sso-graph` | GraphQL `Mutation.firstChangePassword` |
| 7 | Change password | `POST` | `/auth/change-password` | `agg-sso-graph` | GraphQL `Mutation.changePassword` |
| 8 | Delete user | `DELETE` | `/users/{userId}` | `agg-sso-graph` | GraphQL `Mutation.deleteUser` |
| 9 | Create user | `POST` | `/users` | `ct-saas-tenant` | Tenant user provisioning |
| 10 | Protected create user | `POST` | `/protected/users` | `ct-saas-tenant`, `gf-hrms` | Internal employee/user provisioning |
| 11 | Change user status | `PUT` | `/protected/users/{userId}/status` | `ct-saas-tenant`, `gf-hrms` | User disable/enable/toggle status |
| 12 | Update user info | `PUT` | `/protected/users/{userId}/info` | `ct-saas-tenant` | Employee/user info sync |
| 13 | Batch update role | `PUT` | `/protected/users/batch/role` | `gf-hrms` | Batch role update / migration |
| 14 | Update subdomain | `PUT` | `/protected/users/{userId}/subdomain` | `ct-saas-tenant` | Tenant subdomain change |
| 15 | Batch update subdomain | `PUT` | `/protected/users/batch/subdomain` | `ct-saas-tenant` | Tenant migration / bulk subdomain sync |

## 5. Request / Response Contracts

### 5.1 Public auth operations from `agg-sso-graph`

**Request examples**:

```json
{
  "login": {
    "identifier": "user@example.com",
    "password": "***",
    "subdomain": "garage-tenant"
  },
  "refreshToken": {
    "identifier": "user@example.com",
    "refreshToken": "***"
  },
  "changePassword": {
    "newPassword": "***",
    "currentPassword": "***",
    "accessToken": "***"
  }
}
```

**Response success shape quan sát từ GraphQL schema**:

```json
{
  "idToken": "...",
  "accessToken": "...",
  "refreshToken": "...",
  "firstLoginChallenge": "..."
}
```

Các operation password/logout/delete user trả `success`, `code`, `message`, `data` tùy path.

**Response error shape qua BFF**:

```json
{
  "__typename": "ErrorResponse",
  "statusCode": 401,
  "message": "provider error message",
  "code": "provider_code",
  "path": "/auth/login",
  "timestamp": "..."
}
```

**Mapping -> internal model**:

| Provider field | BFF GraphQL field |
|---|---|
| `idToken` | `LoginOutput.idToken`, `RefreshTokenOutput.idToken` |
| `accessToken` | `LoginOutput.accessToken`, `RefreshTokenOutput.accessToken` |
| `refreshToken` | `LoginOutput.refreshToken`, `RefreshTokenOutput.refreshToken` |
| `firstLoginChallenge` | `LoginOutput.firstLoginChallenge`, `RefreshTokenOutput.firstLoginChallenge` |
| error body | `ErrorResponse` union member |

### 5.2 Internal user lifecycle operations

**Request themes from Java clients**:

```json
{
  "createUser": {
    "clientType": "GARAGE",
    "status": "INIT",
    "groupRoles": ["..."],
    "subDomain": "..."
  },
  "updateStatus": {
    "status": "ACTIVE"
  },
  "updateGroupRoles": {
    "groupRoles": ["..."]
  },
  "updateSubdomain": {
    "subdomain": "..."
  }
}
```

**Response success shape**:

```json
{
  "code": "SUCCESS",
  "message": "success",
  "data": {
    "uid": "iam-user-id",
    "temporaryPassword": "***"
  }
}
```

Exact DTO fields vary by boundary (`IamUserData`, `IamUserResponse`, `MigrateBatchResponse`). Contract rule: callers must not depend on fields not declared in their local DTOs.

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | `agg-sso-graph` Axios timeout after `DEFAULT_TIMEOUT` | Axios error / `ErrorResponse.statusCode` | Return field-level `ErrorResponse`; no automatic retry observed |
| Provider 4xx auth | Login/password/token fail | IAM HTTP 4xx mapped by BFF | Surface sanitized error to GraphQL client |
| Provider 4xx validation | Bad identifier/password/code/payload | IAM error body | Do not retry; caller must fix input |
| Provider 5xx | Auth/user lifecycle operation fails | HTTP 5xx from provider | Fail operation; BE lifecycle may move user to error status if implemented in caller |
| Internal API key invalid | Protected IAM calls fail | 401/403 from IAM | Rotate/check `INTERNAL_API_KEY`; do not retry blindly |
| Partial lifecycle failure | HRMS/tenant user created locally but IAM call fails | Local status such as `ERROR_IAM` / retry endpoint | Use existing retry IAM flow where source provides it |
| Token/device cleanup drift | Logout succeeds but device token delete fails | Firebase delete error after IAM logout | Treat as secondary failure; inspect `firebaseService.deleteToken` logs |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | Không thấy retry policy chung trong `agg-sso-graph` IAM client |
| Backoff | Không thấy trong source hiện tại |
| Total max wait | `agg-sso-graph` timeout theo `DEFAULT_TIMEOUT`, default `60000ms` |
| Idempotency key | Không thấy idempotency key cho IAM create/update/delete user |
| After max retries | Không áp dụng vì chưa thấy retry tự động; BE như `gf-hrms` có retry IAM integration ở cấp nghiệp vụ |

Contract rule: không retry tự động các mutation tạo/cập nhật user nếu chưa có idempotency key hoặc trạng thái bù trừ rõ ràng.

### 6.3 Circuit breaker

| Thuộc tính | Giá trị |
|---|---|
| Open threshold | Chưa thấy circuit breaker chung trong source hiện tại |
| Half-open probe | Chưa thấy |
| Close threshold | Chưa thấy |
| When open | Chưa áp dụng; caller hiện fail theo HTTP client behavior |

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency key generation | Chưa thấy idempotency key trong source hiện tại |
| Server-side dedup window | Chưa thấy trong source hiện tại |
| Order guarantees | User lifecycle phải theo thứ tự: create IAM user trước khi update status/group roles/subdomain |
| Replay safety | Login/refresh/password confirmation không retry tự động; create user/status/group roles cần kiểm tra state trước khi thao tác lại |

Known lifecycle constraints:

- `gf-hrms` có trạng thái external integration như `ERROR_IAM` và retry IAM integration.
- Batch role/subdomain migration phải ghi nhận partial result ở caller; không giả định toàn bộ batch atomic nếu provider không cam kết.

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags | Trạng thái |
|---|---|---|---|
| `integration.sec-iam-service.requests` | counter | `op`, `status`, `boundary` | Chưa thấy custom metric riêng |
| `integration.sec-iam-service.duration` | histogram | `op`, `boundary` | Có log duration trong `agg-sso-graph` `ApiClient`; metric riêng chưa thấy |
| `integration.sec-iam-service.errors` | counter | `op`, `error_code` | Chưa thấy custom metric riêng |
| `integration.sec-iam-service.circuit_open` | gauge | `boundary` | Chưa áp dụng circuit breaker |

### 8.2 Logging

- `agg-sso-graph` `ApiClient` log outgoing method/path, status và duration.
- `AuthService` đang log response data cho một số auth operation. Contract rule: không log raw token/password/code trong production logs.
- BE Java clients dùng generic error handler/log ở caller; cần sanitize PII và secrets.

### 8.3 Tracing

- `agg-sso-graph` có OpenTelemetry config và `ApiClient` thêm `x-source-service = SSO_GRAPH`.
- Request id propagation trong `agg-sso-graph` phụ thuộc headers được đưa vào `ApiClient`; `BaseService.getHeaders()` hiện chỉ forward `Authorization` và `x-client-type`, nên request id xuống IAM không được đảm bảo ở auth service layer.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Login error rate tăng | > 5% trong 5 phút | P2 | SSO/GMS on-call |
| IAM user provisioning fail | Bất kỳ spike `ERROR_IAM` hoặc 5xx | P2 | Tenant/HRMS owner |
| Protected IAM 401/403 | Bất kỳ sau deploy/rotation | P1 | Platform/Security owner |
| Latency p99 auth cao | > budget được chốt theo env | P3 | SSO/GMS on-call |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Chưa thấy trong source hiện tại |
| Our SLA exposed to users | Auth/login phụ thuộc trực tiếp vào IAM availability |
| Rate limits | Chưa thấy trong source hiện tại |
| Quota limits | Chưa thấy trong source hiện tại |
| Pricing model | Internal ecosystem service; chưa thấy cost model |
| Cost cap / budget alarm | Chưa thấy trong source hiện tại |
| Cost owner | Chưa thấy trong source hiện tại |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Có: identifier/email/phone, user id, password/reset code, access token, refresh token, tenant subdomain, group roles |
| Data residency | Chưa thấy chính sách trong source hiện tại; default nonprod endpoint nằm dưới domain AC |
| Regulatory frameworks | Chưa thấy trong source hiện tại |
| DPA signed | Không áp dụng/không thấy vì đây là ecosystem service nội bộ |
| Data retention at provider | Chưa thấy trong source hiện tại |
| Right-to-erasure flow | `agg-sso-graph` có `DELETE /users/{userId}`; tenant/HRMS chủ yếu update status/lifecycle |

Security rules:

- Không log password, reset code, access token, refresh token, internal API key.
- Protected IAM calls phải có `x-api-key`; rotation cần phối hợp với `ct-saas-tenant` và `gf-hrms`.
- `x-client-type` phải được coi là auth context input, không phải source of truth duy nhất cho authorization.

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service` | Env runtime: `API_SERVICE_ENDPOINT`, `IAM_SERVICE_URL`, `internal-service.iam.base-url` |
| Credentials | `INTERNAL_API_KEY` nếu protected flow | Secret runtime/Vault path chưa thấy trong source hiện tại |
| Webhook URL | Không thấy webhook | Không thấy webhook |
| Test data fixtures | Chưa thấy trong source hiện tại | n/a |
| Switchover gate | Không thấy feature flag riêng | n/a |

## 12. Testing Strategy

| Layer | Approach | Trạng thái từ source |
|---|---|---|
| Unit | Mock `iamApi`/HTTP interface; assert request body/header/error mapping | Chưa xác nhận test coverage |
| Contract | Fixture provider response cho login/refresh/password/user lifecycle | Cần bổ sung nếu chưa có |
| Integration | Test env với real `sec-iam-service`; verify `x-client-type`, `Authorization`, `x-api-key` | Cần chạy ở CI/staging |
| Chaos | Inject timeout/5xx/401; verify GraphQL `ErrorResponse` và BE `ERROR_IAM` retry behavior | Chưa thấy chaos policy |
| E2E | Login/logout/refresh/password reset, HRMS create/retry IAM, tenant provisioning | Cần gắn với release gate |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| Login/refresh lỗi hàng loạt | Kiểm tra `API_SERVICE_ENDPOINT`, IAM health, auth path `/auth/login`/`/auth/refresh-token`, `x-client-type`, log `agg-sso-graph` |
| Password reset/change lỗi | Kiểm tra IAM 4xx validation vs 5xx outage; không retry nếu input/code sai |
| Protected IAM 401/403 | Kiểm tra `INTERNAL_API_KEY`, secret rotation, header `x-api-key`, deploy config của `ct-saas-tenant`/`gf-hrms` |
| HRMS user ở `ERROR_IAM` | Dùng retry IAM integration hiện có sau khi xác nhận trạng thái IAM hiện tại để tránh duplicate user |
| Tenant provisioning fail ở IAM step | Kiểm tra `ct-saas-tenant` logs, IAM response, user/subdomain/group roles payload |
| Delete user lỗi | Kiểm tra `/users/{userId}`, `Authorization`, `x-client-type`; xác định có cần bù trừ ở tenant/HRMS không |
| Token/secret bị log | Rotate affected credential/token; rà logger `AuthService` và downstream access logs |

Full runbook: chưa thấy file `Operations/runbooks/INTEG-EXT-sec-iam-service-runbook.md` trong repo hiện tại.

## 14. Forbidden patterns

- ❌ Garage tự issue JWT/refresh token — `sec-iam-service` là IAM authority (per ADR-003); chỉ forward.
- ❌ Hardcode `IAM_SERVICE_URL` / `INTERNAL_API_KEY` / admin credentials trong source — env vars / KMS only.
- ❌ Log full Authorization token / refresh token / password / OTP raw.
- ❌ Persist password locally trong Garage services — chỉ IAM own credential store.
- ❌ Skip `x-client-type` header — IAM yêu cầu để discriminate client.
- ❌ Treat IAM 401 as transient — KHÔNG retry; surface to user.
- ❌ Skip JWT signature verify cho flow trust cao — `agg-sso-graph` firebase module hiện dùng `jwt.decode` no-verify (ADR-003 gap, hardening required).
- ❌ Cache JWT/session locally beyond TTL — token revocation risk.
- ❌ Caller infer auth state — phải gọi IAM endpoint.
- ❌ Bypass IAM provisioning callback khi tạo user mới — race condition giữa HRMS create + IAM provision.
- ❌ Send temporary password / OTP via insecure channel (log, plain SMS) — chỉ qua sec-iam-service contract.

## 15. References

- HLD provider: NA (external service)
- HLD callers: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md), [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md)
- API contract caller: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md), [gf-hrms-api.md](../api/gf-hrms-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs:
  - ADR-003 (tenant + SSO boundary — IAM authority forward; ghi nhận gap về `jwt.decode` ở firebase module)
  - ADR-002 (GraphQL aggregator pattern)
- Related INTEG: [INTEG-BFF-agg-sso-graph.md](INTEG-BFF-agg-sso-graph.md) (caller BFF chính), [INTEG-EXT-ct-saas-tenant.md](INTEG-EXT-ct-saas-tenant.md) (sister tenant SoT), [INTEG-EXT-aws-dynamodb-firebase.md](INTEG-EXT-aws-dynamodb-firebase.md) (login flow tạo session, saveToken sau)
- Provider docs: External (security team)
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial integration contract `agg-sso-graph` / `ct-saas-tenant` / `gf-hrms` -> `sec-iam-service` (IAM/auth/user lifecycle authority): REST/HTTPS+JSON `/auth/*` + `/users/*` + `/protected/users/*` qua Axios `ApiClient` (`agg-sso-graph`) hoặc Spring HTTP Interface (BE Java) với Bearer JWT forward + `x-client-type` cho auth flows, `x-api-key` (`INTERNAL_API_KEY`) cho protected user lifecycle; key operations login/logout/refresh-token/change-password/forgot-password/OTP, IAM user create/update/group-roles/subdomain/status; failure mode no auto-retry `agg-sso-graph` (timeout 60s default, error -> `UNAUTHENTICATED` ErrorResponse), `gf-hrms` `@Retryable(delay=1000)` cho IAM provisioning. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-11 | v1.1 | Fix §4 Endpoints vs source code: (1) Xóa #13 PUT /protected/users/{userId}/groupRoles — COMMENTED OUT trong InternalUserController (lines 64-74, TODO: "Uncomment when custom:group_roles attribute is added to Cognito User Pool"); (2) Xóa #14 PUT /protected/users/batch/groupRoles — cũng COMMENTED OUT (lines 76-84); (3) Thêm PUT /protected/users/batch/role (line 102) — active endpoint thay thế batch/groupRoles. Tổng §4 từ 16 → 15 endpoints. |
