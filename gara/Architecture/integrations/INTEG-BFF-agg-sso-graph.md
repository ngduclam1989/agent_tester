---
type: architecture
artifact_kind: integration-bff-backend
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary_bff: "agg-sso-graph"
last_reviewed: "2026-05-19"
supersedes: "INTEG-BFF-ct-conversation-client.md, INTEG-BFF-ct-notihub-notification.md"
---

# Integration — BFF (Apollo GraphQL) `agg-sso-graph`

> Document tích hợp giữa BFF Apollo GraphQL **`agg-sso-graph`** và toàn bộ backend services downstream.
> File này document **per-BFF, multi-backend, flow-oriented** — replace 2 file legacy (`INTEG-BFF-ct-conversation-client.md`, `INTEG-BFF-ct-notihub-notification.md`).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| BFF service | `agg-sso-graph` (Apollo Server 4 / Express) |
| Audience | SSO/IAM-adjacent flows: auth/session, conversation, notification, Firebase device token, Superset guest token |
| Source code | `srcroot/one-connect/agg-sso-graph/` |
| Schema source | `src/graphql/modules/{auth,conversation,firebase,notification,supper-set}/{module}.schema.ts` |
| Schema build | Static merge via `@graphql-tools/merge` tại startup từ 5 modules |
| Codegen tool | TypeScript types co-located trong `src/graphql/modules/{module}/{module}.type.ts` (manual) |
| Persisted queries | Không |
| Health check | `GET /health` (status, timestamp, uptime, env) |
| Diagnostic | `GET /check-env` (chỉ trong dev) |
| Metrics | `GET /metrics` Prometheus format (via `prom-client@15.1.3`) |
| Runtime | Node.js 22 / TypeScript / Apollo Server 4.9 / Express 4.18 / GraphQL 16.8 |
| Default port | `4007` (configurable via `PORT` env) |
| Introspection | Enabled trong non-production; disabled trong production |

---

## 2. Topology / Position in C4

```
[Garage Mobile / Web Staff]
         │
         ▼
  [Kong Gateway] (auth validation, rate limit)
         │
         ▼
  [agg-sso-graph]  ──→  [sec-iam-service]            (auth, login, password, OTP)
         │              [ct-conversation-client]    (conversation, group chat, calls)
         │              [ct-notihub-notification]   (notification feed)
         │              [AWS DynamoDB]              (Firebase device token store)
         └────────────→ [Superset]                  (BI dashboard guest token + RLS)
```

Reference: `Architecture/SYSTEM-ARCHITECTURE.md` §C4-Container; ADR-002 (GraphQL Aggregator), ADR-003 (Tenant + SSO Boundary).

---

## 3. Authentication (gateway-level)

| Thuộc tính | Giá trị |
|---|---|
| Client → BFF auth | Bearer JWT trong `Authorization` header (case-insensitive) |
| BFF token validation | **Không validate signature/expiry** ở BFF — assume Kong gateway upstream đã validate |
| BFF → Backend auth | Token forwarding (forward `Authorization` + `x-client-type` xuống downstream); `x-api-key` cho 1 endpoint upload conversation |
| User context propagation | Resolver decode JWT khi cần claim cụ thể (vd `firebase` decode `custom:tenant_id`, `supper-set` decode tenant_id cho RLS) |
| Request ID | Middleware extract từ `x-request-id`/`x-trace-id`/`x-correlation-id`/`x-amzn-trace-id` (priority order); generate UUID nếu missing; set response header `x-request-id` + `x-source-service: SSO_GRAPH` |
| Client IP | `x-forwarded-for` → `x-real-ip` → `socket.remoteAddress` |
| Gateway-level enforcement | **Không có** — không có whitelist/blacklist operation, không có role check tại BFF; mọi auth decision ở downstream |

> **Anti-pattern**: BFF firebase module decode JWT trực tiếp (`jwt.decode`, không verify signature) để extract `custom:tenant_id`/`custom:tenant_type` — nếu Kong/upstream không validate, attacker có thể giả mạo claim. Hardening required (xem ADR-003 gap list).

---

## 4. BE Landscape Matrix

| # | BE service | BFF module | Protocol | Trust zone | Auth method | Base URL config | Source code path |
|---|---|---|---|---|---|---|---|
| 1 | `sec-iam-service` | `auth` | REST (HTTPS/JSON) | External internal (sec-*) | Bearer JWT forward + `x-client-type` | `API_SERVICE_ENDPOINT` (default `https://swagger-dev.nonprod.aggregatoricapaci.com/sec-iam-service`) | `src/graphql/modules/auth/auth.service.ts` |
| 2 | `ct-conversation-client` | `conversation` | REST (HTTPS/JSON) + multipart | External internal (ct-*) | Bearer JWT forward; `x-api-key` cho upload | `CONVERSATION_SERVICE_ENDPOINT` | `src/graphql/modules/conversation/conversation.service.ts` |
| 3 | `ct-notihub-notification` | `notification` | REST (HTTPS/JSON) | External internal (ct-*) | Bearer JWT forward | `NOTIFICATION_SERVICE_ENDPOINT` | `src/graphql/modules/notification/notification.service.ts` |
| 4 | AWS DynamoDB | `firebase` | AWS SDK v3 (`@aws-sdk/client-dynamodb`, `lib-dynamodb`) | External 3rd-party (AWS) | IAM role / AWS credentials | Region: `AWS_REGION` (default `ap-southeast-1`); Table: `DEVICE_TOKEN_TABLE` (default `nonprod-dev-ac-device-token`) | `src/graphql/modules/firebase/firebase.service.ts`, `src/utils/docClient.ts` — **Note**: DynamoDB table shared với `gf-notification` theo ADR-006; attribute names divergent (agg-sso-graph: snake_case, gf-notification: camelCase) |
| 5 | Superset | `supper-set` | REST (HTTPS/JSON) + cookie | External 3rd-party (BI) | Admin username/password → CSRF → guest token chain | `SUPERSET_ENDPOINT` (default `https://superset.nonprod.aggregatoricapaci.com`); `SUPERSET_ADMIN_USERNAME`, `SUPERSET_ADMIN_PASSWORD` | `src/graphql/modules/supper-set/supperset.resolver.ts` |

**Header forwarding rules** (trong `getHeaders()` helper):
```typescript
{
  Authorization: headers['Authorization'] || headers['authorization'],
  'x-client-type': headers['x-client-type']
}
```
→ Chỉ 2 headers được forward; mọi header khác bị drop.

### 4.1 Full Operation Catalog (30 operations)

> **Tổng**: 30 operations (8 queries + 22 mutations) across 5 modules.

#### `auth` (9 ops) — `src/graphql/modules/auth/`

| Type | Operation | BE call |
|---|---|---|
| Q | me | **Local** (returns JWT-decoded user context, no BE call) |
| M | login | POST /auth/login (sec-iam-service) |
| M | logout | POST /auth/logout (sec-iam-service) + DynamoDB DeleteItem (conditional, if deviceId provided) |
| M | refreshToken | POST /auth/refresh-token (sec-iam-service) |
| M | forgotPassword | POST /auth/forgot-password (sec-iam-service) |
| M | forgotPasswordConfirm | POST /auth/forgot-password/confirm (sec-iam-service) |
| M | firstChangePassword | POST /auth/first-change-password (sec-iam-service) |
| M | changePassword | POST /auth/change-password (sec-iam-service) |
| M | deleteUser | DELETE /users/{userId} (sec-iam-service) |

#### `conversation` (15 ops) — `src/graphql/modules/conversation/`

| Type | Operation | BE call |
|---|---|---|
| Q | conversationList | GET /api/v1/conversations/user (ct-conversation-client) |
| Q | groupConversationList | GET /api/v1/conversations/group/{sourceCode} (ct-conversation-client) |
| Q | groupSubordinates | POST /api/v1/conversations/group/subordinates/search (ct-conversation-client) |
| Q | userToken | GET /api/v1/conversations/user/token (ct-conversation-client) |
| M | groupUpload | POST /api/v1/conversations/group/upload (ct-conversation-client, multipart + x-api-key) |
| M | deleteToken | DELETE /api/v1/conversations/user/delete-token (ct-conversation-client) |
| M | routingCandidate | POST /api/v1/conversations/routing/candidate (ct-conversation-client) |
| M | endCall | POST /api/v1/conversations/routing/end-call (ct-conversation-client) |
| M | groupCS | POST /api/v1/conversations/group-cs (ct-conversation-client) |
| M | addCS | POST /api/v1/conversations/add-cs (ct-conversation-client) |
| M | addCSWeekend | POST /api/v1/conversations/add-cs-weekend/{groupCode} (ct-conversation-client) |
| M | kickMemberQuotationGroupChat | DELETE /api/v1/conversations/quotations/groups/{groupCode}/members/{userId} (ct-conversation-client) |
| M | kickMemberOrderGroupChat | DELETE /api/v1/conversations/order/groups/{groupCode}/members/{userId} (ct-conversation-client) |
| M | KickMemberCCRoutingGroupChat | DELETE /api/v1/conversations/cc_routing/groups/{groupCode}/members/{userId} (ct-conversation-client) |
| M | addMembers | PUT /api/v1/conversations/group/add-members (ct-conversation-client) |

#### `notification` (4 ops) — `src/graphql/modules/notification/`

| Type | Operation | BE call |
|---|---|---|
| Q | notificationList | GET /api/v1/notifications (ct-notihub-notification) |
| Q | notificationUnreadCount | GET /api/v1/notifications?isRead=false (ct-notihub-notification) |
| M | notificationReadAll | PUT /api/v1/notifications/mark-all-as-read (ct-notihub-notification) |
| M | notificationReadById | PUT /api/v1/notifications/{id}/mark-as-read (ct-notihub-notification) |

#### `firebase` (1 op) — `src/graphql/modules/firebase/`

| Type | Operation | BE call |
|---|---|---|
| M | saveToken | AWS DynamoDB: Scan → BatchWrite (delete dupes) → PutItem (table: `${DEVICE_TOKEN_TABLE}`) |

#### `supper-set` (1 op) — `src/graphql/modules/supper-set/`

| Type | Operation | BE call |
|---|---|---|
| Q | supperSetQuestToken | **3-step Superset chain**: POST /api/v1/security/login → GET /api/v1/security/csrf_token/ → POST /api/v1/security/guest_token/ (Superset, with cookie chaining + admin credentials + RLS tenant_id) |

### 4.2 Non-GraphQL REST endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/health` | GET | Liveness probe (status, timestamp, uptime, env) |
| `/check-env` | GET | Diagnostic (non-prod only) |
| `/metrics` | GET | Prometheus metrics scrape (prom-client@15.1.3) |
| `/*` (catch-all) | ANY | Superset HTTP proxy — routes all paths NOT in allowlist (/graphql, /metrics, /check-env, /health) to Superset; strips x-frame-options/CSP headers; rewrites cookies (remove Domain, Secure, SameSite=Lax) for iframe embed |

---

## 5. Flow Map

| # | Flow name | Trigger | BEs involved | Pattern | Anchor |
|---|---|---|---|---|---|
| 1 | Login + device token registration | `Mutation.login` → (client) → `Mutation.saveToken` | sec-iam-service → DynamoDB | Sequential (2 separate GraphQL calls) | [§6.1](#61-login--device-token-registration) |
| 2 | Logout with device cleanup | `Mutation.logout(accessToken, deviceId)` | sec-iam-service → DynamoDB | Sequential, single GraphQL call | [§6.2](#62-logout-with-device-cleanup) |
| 3 | Superset guest token (RLS) | `Query.supperSetQuestToken` | Superset (3-step chain: login → CSRF → guest) | Sequential, stateful cookie chain | [§6.3](#63-superset-guest-token-rls) |
| 4 | Group file upload (conversation) | `Mutation.groupUpload(files)` | ct-conversation-client | Single BE, multipart streaming | [§6.4](#64-group-file-upload-conversation) |
| 5 | Conversation list with tenant context | `Query.conversationList` | ct-conversation-client | Single BE, JWT claim driven | (simple — see §4) |
| 6 | Notification list / unread count | `Query.notificationList`, `Query.notificationUnreadCount` | ct-notihub-notification | Single BE | (simple — see §4) |

---

## 6. Per-flow Detail

### 6.1 Login + device token registration

**GraphQL operations**: `Mutation.login(input: LoginInput)` + (subsequent client-initiated) `Mutation.saveToken(input: SaveTokenInput)`

**Trigger**: User credential entry → mobile app FCM token registration on app start

**BE call sequence**:

```
[Client] Mutation.login(identifier, password)
  ↓
[auth.resolver.ts] → AuthService
  ↓ POST /auth/login (sec-iam-service)
    Headers: x-client-type
    Body: { identifier, password }
  ← { idToken, accessToken, refreshToken }
[Client receives tokens]

(Later, app obtains FCM token)
[Client] Mutation.saveToken(notificationToken, platform)
  ↓
[firebase.resolver.ts] → FirebaseService
  ↓ Decode Authorization JWT (no signature verify)
    extract: sub (userId), custom:tenant_id, custom:tenant_type, custom:source_system
  ↓ Scan DynamoDB for existing notification_token
  ↓ Batch delete duplicates (chunks of 25)
  ↓ Put new record:
    { device_id (UUID), notification_token, platform, tenant_type,
      source_system, user_id, tenant_id }
  ← { success: true, deviceId }
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | sec-iam-service | `POST /auth/login` | identifier, password, x-client-type | tokens (id/access/refresh) | 401 → `UNAUTHENTICATED` ErrorResponse |
| 2 | DynamoDB | `Scan` `nonprod-dev-ac-device-token` | notification_token | existing items | Empty result OK; SDK error → `ERROR` |
| 3 | DynamoDB | `BatchWrite` (delete) | items (chunks 25) | — | Partial fail ok (best-effort) |
| 4 | DynamoDB | `PutItem` | device record | — | SDK error → `ERROR` ErrorResponse |

**DataLoader strategy**: N/A (write-side, no batching needed)

**Error mapping**:
- sec-iam-service 401 → GraphQL `extensions.code: UNAUTHENTICATED`
- DynamoDB SDK error → wrap trong custom `ERROR` code, return `ErrorResponse` union type
- JWT decode fail → throw error, surface `BAD_USER_INPUT`

**Transaction boundary**: None — login và saveToken là 2 GraphQL calls riêng biệt; nếu saveToken fail, login đã commit ở IAM.

**Idempotency**:
- `saveToken` idempotent theo `notification_token` (scan-then-delete pattern đảm bảo no duplicate)
- Anti-pattern: DynamoDB Scan thay vì Query (no GSI on notification_token) → không scale tốt; cần GSI trong production

---

### 6.2 Logout with device cleanup

**GraphQL operation**: `Mutation.logout(input: LogoutInput { accessToken, deviceId? })`

**Trigger**: User taps "Sign out"

**BE call sequence**:

```
[Client] Mutation.logout({ accessToken, deviceId })
  ↓
[auth.resolver.ts] → AuthService
  ↓ POST /auth/logout (sec-iam-service)
    Body: { accessToken }
  ← { success: true }
  ↓ IF deviceId provided:
    [firebase.service] FirebaseService.deleteToken(deviceId)
      ↓ DynamoDB DeleteItem on { device_id: deviceId }
      ← (errors silently swallowed — try-catch logs only)
  ← Final response { success: true }
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | sec-iam-service | `POST /auth/logout` | accessToken | success | 401 → `UNAUTHENTICATED` (rare; client-initiated logout) |
| 2 | DynamoDB | `DeleteItem` `device_id={deviceId}` | deviceId | — | Logged + ignored; logout vẫn return success |

**Error mapping**:
- IAM logout fail → surface error to client (logout failed)
- DynamoDB delete fail → silently logged; client thấy logout success (graceful degrade — device token sẽ tự expire eventual)

**Transaction boundary**: Eventual consistency — DynamoDB cleanup là best-effort, không block logout flow.

**Idempotency**: Logout idempotent (revoke token đã revoke = no-op); deleteToken idempotent (delete absent key = no-op).

---

### 6.3 Superset guest token (RLS)

**GraphQL operation**: `Query.supperSetQuestToken(input: supperSetQuestTokenInput { dashboardId })`

**Trigger**: User mở Superset dashboard embedded trong mobile/web

**BE call sequence (3-step Superset chain)**:

```
[Client] Query.supperSetQuestToken({ dashboardId })
  ↓
[supperset.resolver.ts]
  ↓ Decode Authorization JWT
    extract: custom:tenant_id
  ↓
  Step 1: POST /api/v1/security/login (Superset)
    Body: { username: SUPERSET_ADMIN_USERNAME, password: SUPERSET_ADMIN_PASSWORD }
    ← { access_token, set-cookie: [...] }
    [collect cookies]
  ↓
  Step 2: GET /api/v1/security/csrf_token/ (Superset)
    Headers: Authorization: Bearer <admin_token>, Cookie: <collected>
    ← { result: csrf_token, set-cookie: [...] }
    [merge cookies]
  ↓
  Step 3: POST /api/v1/security/guest_token/ (Superset)
    Headers: Authorization: Bearer <admin_token>, X-CSRFToken: <csrf>, Cookie: <merged>
    Body: {
      user: { username, first_name, last_name },
      resources: [{ type: 'dashboard', id: dashboardId }],
      rls: [{ clause: `tenant_id = ${tenantId}` }]
    }
    ← { token: guestToken }
  ↓
[Client embeds dashboard with guestToken]
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | Superset | `POST /api/v1/security/login` | admin user/pass | access_token + cookies | Failure → `SUPPERSET_ERROR` |
| 2 | Superset | `GET /api/v1/security/csrf_token/` | admin token + cookies | csrf token | Failure → `SUPPERSET_ERROR` |
| 3 | Superset | `POST /api/v1/security/guest_token/` | admin token + CSRF + cookies + RLS clause | guest token | Failure → `SUPPERSET_ERROR` |

**Error mapping**:
- Mọi step fail → return `ErrorResponse` với code `SUPPERSET_ERROR` (không phân biệt step nào fail)
- Multi-step orchestration không có partial state recovery — fail ở step 2 thì không thể tận dụng admin token đã có

**Transaction boundary**: N/A — read-only side effect on Superset (token issuance).

**Idempotency**: Each call generates new admin session — không idempotent. Performance concern: admin login fetched fresh per request (no caching).

**Security**: RLS clause `tenant_id = {tenantId}` enforced ở Superset side, đảm bảo tenant isolation. Nếu JWT bị giả mạo `custom:tenant_id`, attacker có thể xem dashboard của tenant khác — depend on Kong/upstream JWT validation.

---

### 6.4 Group file upload (conversation)

**GraphQL operation**: `Mutation.groupUpload(request: GroupUploadRequest)`

**Trigger**: User chọn file/ảnh để gửi vào group chat

**BE call sequence**:

```
[Client] Mutation.groupUpload({ groupCode, files: [Upload!] })
  ↓
[conversation.resolver.ts] → ConversationService
  ↓ Build FormData
    - Iterate files (multipart Upload scalar)
    - Append each file with stream
  ↓ POST /api/v1/conversations/group/upload (ct-conversation-client)
    Headers:
      Authorization: <forwarded>
      x-client-type: <forwarded>
      x-api-key: <INTERNAL_API_KEY env var>
    Body: FormData (multipart)
    Progress callback: onUploadProgress
  ← { files: [{ id, url }] }
```

**Special handling**:
- `INTERNAL_API_KEY` env var (default empty) — required cho upload endpoint mà không required cho operations khác của conversation
- FormData library handle multipart serialization
- Streaming upload progress callback (no buffering)

**Error mapping**: HTTP 4xx/5xx → wrap trong `ErrorResponse`

**Idempotency**: Không idempotent — mỗi upload tạo file mới (no client-provided idempotency key).

---

## 7. N+1 Prevention (cross-backend strategy)

agg-sso-graph **không dùng DataLoader** — toàn bộ resolvers gọi 1 BE per resolver, không có nested object resolution cần fan-out.

Risk N+1 chỉ có trong:
- `Query.conversationList` → mỗi conversation có thể cần fetch detail → hiện đang fetch trong response (page với detail), không nested resolver
- Nếu thêm field nested `conversation.lastMessage` → cần DataLoader (phase hardening)

**Backend batch endpoints**: Không sử dụng (chưa có cần thiết với current schema).

---

## 8. Caching Strategy

### 8.1 Per-request cache

Không dùng DataLoader → không có per-request cache.

### 8.2 Application-level cache

**Không có Redis / Apollo cache layer.** Mỗi request trực tiếp gọi downstream.

**Performance concern**: Superset admin token fetch fresh mỗi request (xem §6.3) → tăng latency. Mitigation đề xuất: cache admin token với short TTL (5 min), reuse cho subsequent requests.

### 8.3 Cache stampede protection

N/A — không có cache layer.

---

## 9. Schema Contract (cross-BE codegen sync)

### 9.1 Backend schema sources

| BE | Contract source | Sync mechanism |
|---|---|---|
| `sec-iam-service` | External Swagger (sec-iam team) | Manual review; no codegen |
| `ct-conversation-client` | External Swagger (ct-* team) | Manual review |
| `ct-notihub-notification` | External Swagger (ct-* team) | Manual review |
| AWS DynamoDB | `@aws-sdk/lib-dynamodb` types | npm version pin |
| Superset | Superset REST API docs | Manual review |

### 9.2 BFF schema mapping

`src/graphql/modules/{module}/{module}.schema.ts` — TypeDefs co-located per module.
`src/graphql/modules/{module}/{module}.type.ts` — TypeScript types manually maintained.

### 9.3 Type generation

**Không có codegen tool** — types được maintain thủ công trong từng module. Risk: drift giữa schema và types nếu ai đó update schema mà quên update types.

CI gate: TypeScript `tsc --noEmit` catch compile error nếu types lệch.

### 9.4 Version compatibility

| Aspect | Strategy |
|---|---|
| BE adds field | BFF tự động ignore (không fail) — additive |
| BE removes field | BFF resolver fail nếu reference field đó — break |
| BE renames | Cần update resolver + types + schema cùng lúc |
| Breaking change | Coordinate với downstream team trước; CR Level CRITICAL |

---

## 10. Error Handling (cross-BE precedence)

### 10.1 Backend error → GraphQL error mapping

Custom error classes trong `src/utils/errors.ts`:

| Error class | extensions.code | HTTP status | Trigger |
|---|---|---|---|
| `AuthenticationError` | `UNAUTHENTICATED` | 401 | Missing/invalid credentials at downstream |
| `AuthorizationError` | `FORBIDDEN` | 403 | Insufficient permissions |
| `ValidationError` | `BAD_USER_INPUT` | 400 | Invalid input (Zod validation) |
| `NotFoundError` | `NOT_FOUND` | 404 | Resource not found |
| `MissXClientError` | `MISS_X_CLIENT` | 400 | Missing `x-client-type` header |
| Custom Superset | `SUPPERSET_ERROR` | varies | Superset orchestration step fail |
| Generic Firebase | `ERROR` | varies | DynamoDB SDK error |

Error format (Apollo plugin `formatError`):
```json
{
  "message": "...",
  "code": "UNAUTHENTICATED",
  "path": ["...]"
}
```

Stack traces hidden trong production.

### 10.2 Cross-BE error precedence

Mỗi flow ở §6 chỉ touching 1-3 BE và đa số là sequential — error precedence đơn giản:
- Sequential: step earlier fail → abort, surface that error
- Logout DynamoDB cleanup fail: silently logged, không block logout response

### 10.3 Partial failure semantics

Resolver pattern dùng try-catch + return `ErrorResponse` union type — partial failure được biểu thị bằng response shape, không qua GraphQL `errors[]` array.

```typescript
try {
  const res = await this.iamApi.post(...);
  return { __typename: 'LoginOutput', ...res.data };
} catch (error) {
  return { __typename: 'ErrorResponse', ...error.data };
}
```

---

## 11. Resilience

| Aspect | Config |
|---|---|
| Connection pool | Default Axios (no per-host pool config) |
| Per-request timeout | `DEFAULT_TIMEOUT` env (default 60000ms = 60s) — **single global timeout cho mọi BE** |
| Per-resolver override | Có thể qua axios config object (rarely used) |
| Retry policy | **Không có** — không retry on failure (anti-pattern: cần retry idempotent reads) |
| Circuit breaker | **Không có** — cascading failure risk khi BE chậm |
| Bulkhead | **Không có** — shared Axios client per BE |

**Hardening required**: Add retry với exponential backoff cho idempotent reads (login/list); circuit breaker per BE; per-BE timeout tighter cho user-facing flows.

---

## 12. Observability

### 12.1 Tracing (OpenTelemetry, optional)

- Activation: `OTEL_ENABLED=true` env
- Endpoint: `OTEL_ENDPOINT/v1/traces` (OTLP HTTP, default `http://localhost:4318`)
- Service name: `OTEL_SERVICE_NAME` (default `dev-oca-agg-sso-graph`)
- Auto-instrumentations: HTTP, Express, GraphQL
- Span naming: `http {method} /{operation-name}` (operation name extracted từ POST body GraphQL)
- Span attribute: `request.id`, `graphql.operation.name`, `graphql.operation.type`, `trace.propagated`
- Health endpoint `/health` ignored
- Trace context: W3C `traceparent` header forwarded downstream

### 12.2 Metrics

- Endpoint: `GET /metrics` Prometheus format
- Default Node.js process metrics (CPU, memory, event loop lag) via `prom-client`
- Apollo + Express auto-instrumented
- OTLP metrics export every 60s khi `OTEL_ENABLED=true`

### 12.3 Logging (Winston)

- Format prod: JSON structured
- Format dev: Colorized console
- Levels: error/warn/info/http/debug
- Files: `logs/error.log`, `logs/all.log`
- Structured fields: `timestamp`, `logLevel`, `message`, `requestId`, `traceId`, `spanId`, `metadata`
- Service registry maps URL → name cho downstream call logging:
  - `sec-iam-service`, `ct-notihub-notification`, `ct-conversation-client`

### 12.4 Correlation ID

Accepts: `x-request-id` / `x-trace-id` / `x-correlation-id` / `x-amzn-trace-id` (priority order); generate UUID nếu missing; forward same ID downstream; set response header `x-request-id` + `x-source-service: SSO_GRAPH`.

---

## 13. Performance Targets

| Metric | Target |
|---|---|
| BFF resolver p99 latency (1-BE flow: login, conversation list) | < 500ms |
| BFF resolver p99 latency (multi-step: Superset guest token) | < 2s (3 sequential Superset calls) |
| Backend call p99 (per-BE) | < 200ms |
| GraphQL query depth limit | 8 (default Apollo) |
| Persisted queries | Không (acceptable cho admin/SSO traffic) |

---

## 14. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock Axios/AWS SDK; test resolver logic + error mapping |
| Contract | Manual review BE schema changes |
| Integration | Real downstream (test env) + Apollo Server in-process |
| Cross-BE flow | E2E test cho login → saveToken → logout → device cleanup |
| Load | Không có baseline; cần thêm |
| Chaos | Không — cần thêm cho production hardening |

---

## 15. Backwards Compatibility

- BFF schema được publish cho mobile + web staff
- Mobile app schema compat: BFF must support N-2 mobile versions (xem ADR-002)
- Schema deprecation: mark `@deprecated`; keep field ≥1 wave; remove via CR
- Cross-BE flow change (§6) = MAJOR CR

---

## 16. Operational Runbook

| Scenario | Action |
|---|---|
| sec-iam-service down | Login mutations fail; surface `UNAUTHENTICATED`. Cached sessions vẫn work (token chưa expire) |
| ct-conversation-client down | Conversation queries fail; group chat UI fallback "Cannot load conversations" |
| ct-notihub-notification down | Notification list empty; UI fallback "No notifications" |
| DynamoDB outage | `saveToken`/`logout` device cleanup fail; logout vẫn success (graceful degrade); token cleanup silent retry on next push |
| Superset down | `supperSetQuestToken` fail; dashboard UI fallback "BI temporarily unavailable" |
| BFF schema breaking shipped | Mobile clients fail; force-update via in-app version check |
| Mass auth failure | Investigate sec-iam-service refresh endpoint; check Kong gateway |

---

## 17. Forbidden patterns

Anti-patterns mà `agg-sso-graph` KHÔNG được phép. Vi phạm = MAJOR CR.

- ❌ Tự issue JWT / refresh token / OTP — auth flows phải forward sang `sec-iam-service` (ADR-003 IAM authority).
- ❌ Validate JWT signature tại BFF mà không có signature verification — hiện tại `firebase` module dùng `jwt.decode` no-verify, được ghi nhận là **gap** trong ADR-003 (Status: ACCEPTED with gaps); cần harden.
- ❌ Persist domain state khác ngoài DynamoDB device tokens — `agg-sso-graph` không own user/session/tenant state (per ADR-003).
- ❌ Cross-aggregate-BFF call — `agg-sso-graph` KHÔNG gọi `agg-garage-graph` hoặc ngược lại.
- ❌ Skip Superset RLS clause cho tenant-scoped dashboard — `rls: tenant_id = ${tenantId}` bắt buộc; thiếu = cross-tenant leak.
- ❌ Log full `notification_token` / Firebase token raw — token đủ để impersonate user push, treat as PII.
- ❌ Log full `Authorization` header — sanitize trong logger.
- ❌ Hardcode `SUPERSET_ADMIN_USERNAME` / `SUPERSET_ADMIN_PASSWORD` trong code — phải dùng env vars.
- ❌ Bypass signature verification cho external webhook callback (vd FCM/APNs) — anti-pattern phổ biến.
- ❌ Forward auth requests mà không add `x-client-type` header — sec-iam-service yêu cầu để discriminate client (mobile/web/staff).
- ❌ Cache admin Superset token without TTL — phải refresh per session hoặc TTL ngắn (5 phút) để giảm credential leak risk.

---

## 18. References

- HLD: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- API contract: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md)
- Source code: `srcroot/one-connect/agg-sso-graph/` (Apollo Server 4 / Express / TypeScript)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs:
  - ADR-002 (GraphQL aggregator pattern)
  - ADR-003 (tenant + SSO boundary — IAM authority forward, ownership rules)
  - ADR-006 (Flyway/DynamoDB — shared device token registry với gf-notification; attribute name divergence snake_case vs camelCase)
- Downstream BE INTEG-EXT contracts:
  - [INTEG-EXT-sec-iam-service.md](INTEG-EXT-sec-iam-service.md) (auth, login, refresh, password)
  - [INTEG-EXT-ct-conversation-client.md](INTEG-EXT-ct-conversation-client.md) (conversation, group chat, calls)
  - [INTEG-EXT-aws-dynamodb-firebase.md](INTEG-EXT-aws-dynamodb-firebase.md) (Firebase device token store)
  - Note: `ct-notihub-notification` chưa có file INTEG-EXT riêng (tracked as follow-up)
  - Note: Superset chưa có file INTEG-EXT riêng (BI integration; có thể cần thêm sau)
- Sister BFF: [INTEG-BFF-agg-garage-graph.md](INTEG-BFF-agg-garage-graph.md) (Garage operational flows)

---

## 19. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v2: (L3) thêm ADR-006 shared DynamoDB registry note vào §4 BE Matrix + §18 References; (L4) thêm Node.js 22 version vào §1 Identity Runtime. |
| 2026-05-07 | v1 | Initial integration contract `agg-sso-graph` BFF -> SSO/IAM downstream services (sec-iam-service, ct-conversation-client, ct-notihub-notification, AWS DynamoDB, Superset): REST/HTTPS+JSON với Bearer JWT forward (no signature verify ở BFF, assume Kong upstream validate) + `x-client-type` header; key flows login + device token registration, logout với device cleanup, Superset guest token (3-step chain với RLS), group file upload conversation; failure mode timeout default 60s, no retry/no circuit breaker. Bao gồm Identity, Topology, Auth, BE Landscape Matrix, Flow Map, Per-flow Detail, Caching, Schema Contract, Error Handling, Resilience, Observability, Performance, Testing, Runbook, Forbidden patterns, References. |
