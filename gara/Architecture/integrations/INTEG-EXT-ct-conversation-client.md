---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gms-conversation"
provider: "ct-conversation-client"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration - GMS boundaries <-> ct-conversation-client (External Service)

> Document tích hợp giữa các boundary GMS và **ct-conversation-client**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **ct-conversation-client** - conversation/chat/routing ecosystem service |
| Provider docs | Chưa thấy tài liệu provider riêng trong source hiện tại |
| Provider status page | Chưa thấy trong source hiện tại |
| Used by boundary | `agg-sso-graph`, `ct-saas-tenant`, `gf-hrms` |
| Module / class | `agg-sso-graph/src/graphql/modules/conversation/conversation.service.ts`; `ct-saas-tenant/.../ConversationClient.java`; `gf-hrms/.../ConversationServiceClient.java` |
| Sandbox URL | `https://swagger-dev.nonprod.aggregatoricapaci.com/ct-conversation-client` theo default config |
| Production URL | Env runtime: `CONVERSATION_SERVICE_ENDPOINT`, `CT_CONVERSATION_CLIENT_URL`, `internal-service.conversation.base-url` |
| API version pinned | BFF dùng `/api/v1/conversations/*`; BE dùng `/protected/v1/conversations/user` |
| SDK / library | `agg-sso-graph`: hand-written Axios `ApiClient`; BE Java: Spring HTTP interface / RestClient |
| Category | Conversation / Chat / Routing |

Boundary-specific configuration:

| Boundary | Config key | Default / source |
|---|---|---|
| `agg-sso-graph` | `CONVERSATION_SERVICE_ENDPOINT` | `https://swagger-dev.nonprod.aggregatoricapaci.com/ct-conversation-client` |
| `ct-saas-tenant` | `ct-conversation-client.url` / `CT_CONVERSATION_CLIENT_URL` | `https://swagger-dev.nonprod.aggregatoricapaci.com/ct-conversation-client` |
| `gf-hrms` | `ct-conversation-client.url`, `internal-service.conversation.base-url` | `https://swagger-dev.nonprod.aggregatoricapaci.com/ct-conversation-client` hoặc env runtime |

## 2. Why this provider (decision)

**Decision**: GMS dùng `ct-conversation-client` làm provider conversation cho chat group, token chat user, routing candidate/end-call và provisioning conversation user cho tenant/HRMS users.

**Why**:

- `agg-sso-graph` exposes GraphQL operations cho chat list, group list, group upload, token, routing, add/kick members.
- `ct-saas-tenant` sync conversation user khi tenant user/IAM user được tạo.
- `gf-hrms` sync conversation user khi employee/user lifecycle tạo IAM user thành công, và có retry conversation integration khi user ở trạng thái lỗi.

**Alternatives considered**: Không thấy ADR hoặc source decision về provider thay thế trong source hiện tại.

**Ref**:

- `Architecture/integrations/INTEG-BFF-agg-sso-graph.md`
- `Architecture/integrations/INTEG-EXT-sec-iam-service.md`
- `Architecture/integrations/_EXT-INTEGRATION-PHASE0-BASELINE.md`

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method cho BFF chat operations | `Authorization` bearer và `x-client-type` forward qua `BaseService.getHeaders()` |
| Auth method cho group upload | Source thêm `x-api-key = INTERNAL_API_KEY`, nhưng `getHeaders()` hiện không forward `x-api-key` |
| Auth method cho BE protected create user | `x-api-key` internal header qua Java RestClient config hoặc client/service |
| Credential rotation | Chưa thấy quy trình rotation trong source hiện tại |
| Storage | `INTERNAL_API_KEY`; base URL qua env/config |
| Scope / permission | User/group chat operations, routing session operations, protected conversation user provisioning |
| Multi-tenant strategy | group code, tags, tenant/user identity nằm trong request và bearer/internal context; downstream phải enforce scope |

Header behavior theo source:

| Boundary | Header behavior hiện tại |
|---|---|
| `agg-sso-graph` | `BaseService.getHeaders()` chỉ forward `Authorization` và `x-client-type` |
| `ct-saas-tenant` | Conversation client gọi `/protected/v1/conversations/user`; source config có `internal.api.key`/`internal-service.api-key` |
| `gf-hrms` | `HttpClientConfig` set default `x-api-key` cho RestClient clients |

Known security risks:

- `groupUpload` thêm `x-api-key` vào local headers, nhưng sau đó gọi `this.getHeaders(headers)`, hàm này loại bỏ `x-api-key`. Contract phải coi `x-api-key` forwarding cho group upload là **chưa đảm bảo** theo source hiện tại.
- `deleteToken` truyền `token` trong object headers nhưng `ApiClient.delete(url, data, config)` nhận tham số thứ hai là data. Contract phải coi delete token header/body placement là **cần verification**.
- `console.log(headers)` trong `groupUpload` có nguy cơ log bearer token/internal key nếu forwarding được sửa hoặc headers chứa token.

### 3.2 Webhook security

Không thấy source hiện tại mô tả `ct-conversation-client` gửi webhook về GMS. Không áp dụng ở Phase 4.

## 4. Endpoints / Operations Used

Chỉ liệt kê operation quan sát được từ source GMS hiện tại.

| # | Operation | Method | Path / RPC | Used by | Trigger |
|---:|---|---|---|---|---|
| 1 | Conversation list | `GET` | `/api/v1/conversations/user?page=&size=` | `agg-sso-graph` | GraphQL `Query.conversationList` |
| 2 | Group conversation list | `GET` | `/api/v1/conversations/group/{sourceCode}?page=&size=` | `agg-sso-graph` | GraphQL `Query.groupConversationList` |
| 3 | User token | `GET` | `/api/v1/conversations/user/token` | `agg-sso-graph` | GraphQL `Query.userToken` |
| 4 | Group subordinates | `POST` | `/api/v1/conversations/group/subordinates/search` | `agg-sso-graph` | GraphQL `Query.groupSubordinates` |
| 5 | Group upload | `POST multipart` | `/api/v1/conversations/group/upload` | `agg-sso-graph` | GraphQL `Mutation.groupUpload` |
| 6 | Delete token | `DELETE` | `/api/v1/conversations/user/delete-token` | `agg-sso-graph` | GraphQL `Mutation.deleteToken` |
| 7 | Routing candidate | `POST` | `/api/v1/conversations/routing/candidate` | `agg-sso-graph` | GraphQL `Mutation.routingCandidate` |
| 8 | End call | `POST` | `/api/v1/conversations/routing/end-call` | `agg-sso-graph` | GraphQL `Mutation.endCall` |
| 9 | Group CS | `POST` | `/api/v1/conversations/group-cs` | `agg-sso-graph` | GraphQL `Mutation.groupCS` |
| 10 | Add CS | `POST` | `/api/v1/conversations/add-cs` | `agg-sso-graph` | GraphQL `Mutation.addCS` |
| 11 | Add CS weekend | `POST` | `/api/v1/conversations/add-cs-weekend/{groupCode}` | `agg-sso-graph` | GraphQL `Mutation.addCSWeekend` |
| 12 | Kick quotation group member | `DELETE` | `/api/v1/conversations/quotations/groups/{groupCode}/members/{userId}` | `agg-sso-graph` | GraphQL `Mutation.kickMemberQuotationGroupChat` |
| 13 | Kick order group member | `DELETE` | `/api/v1/conversations/order/groups/{groupCode}/members/{userId}` | `agg-sso-graph` | GraphQL `Mutation.kickMemberOrderGroupChat` |
| 14 | Kick CC routing group member | `DELETE` | `/api/v1/conversations/cc_routing/groups/{groupCode}/members/{userId}` | `agg-sso-graph` | GraphQL `Mutation.KickMemberCCRoutingGroupChat` |
| 15 | Add group members | `PUT` | `/api/v1/conversations/group/add-members` | `agg-sso-graph` | GraphQL `Mutation.addMembers` |
| 16 | Protected create conversation user | `POST` | `/protected/v1/conversations/user` | `ct-saas-tenant`, `gf-hrms` | Tenant/employee user lifecycle |

## 5. Request / Response Contracts

### 5.1 Chat list and group list

**Request examples**:

```json
{
  "conversationList": {
    "page": 0,
    "size": 20
  },
  "groupConversationList": {
    "sourceCode": "ORDER-001",
    "page": 0,
    "size": 20
  }
}
```

**Response success shape**:

```json
{
  "success": true,
  "code": "200",
  "message": "Success",
  "data": {
    "content": [
      {
        "groupCode": "group-code",
        "groupName": "Group name",
        "metadata": {
          "label": "O"
        },
        "tags": ["GARAGE"],
        "lastMessage": "message",
        "lastMessageTime": 1714800000000,
        "unreadMessageCount": 2
      }
    ],
    "pageInfo": {
      "page": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1,
      "first": true,
      "last": true
    }
  }
}
```

### 5.2 User token

**Request**:

```http
GET /api/v1/conversations/user/token
Authorization: Bearer ***
x-client-type: GARAGE
```

**Response success shape**:

```json
{
  "success": true,
  "code": "200",
  "message": "Success",
  "data": {
    "authToken": "conversation-token",
    "createdAt": 1714800000000
  }
}
```

Contract rule: `authToken` là credential của conversation runtime, không được log hoặc expose ngoài client được phép.

### 5.3 Routing candidate / end call

**Request**:

```json
{
  "sessionCode": "session-001",
  "prevKey": "selection-key"
}
```

**Response success shape**:

```json
{
  "success": true,
  "code": "200",
  "message": "Success",
  "data": {
    "uid": "iam-user-id",
    "sessionCode": "session-001",
    "selectionKey": "next-key",
    "retryAfterMs": 1000
  }
}
```

### 5.4 Group upload

**Request**:

```json
{
  "groupCode": "group-code",
  "files": [
    {
      "filename": "image.png",
      "mimetype": "image/png"
    }
  ]
}
```

Actual transport is multipart form data:

- field `files`: repeated file streams
- field `groupCode`: optional group code

**Response success shape**:

```json
{
  "success": true,
  "code": "200",
  "message": "Success",
  "data": ["file-url-or-id"]
}
```

### 5.5 Group membership operations

**Request themes**:

```json
{
  "groupCode": "group-code",
  "userId": "iam-user-id",
  "members": [
    {
      "userId": "iam-user-id",
      "type": "MEMBER"
    }
  ]
}
```

Response commonly follows `BaseResponse<String>` with `success`, `code`, `message`, `data`.

### 5.6 Protected create conversation user

**Request from `ct-saas-tenant` / `gf-hrms`**:

```json
{
  "uid": "iam-user-id",
  "name": "Nguyen Van A",
  "avatar": "https://example.com/avatar.png",
  "role": "GARAGE"
}
```

`ct-saas-tenant` maps role from tenant type: `GARAGE -> GARAGE`, `VENDOR -> EXPRESS`; `gf-hrms` uses role `GARAGE`.

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | Conversation API không phản hồi | Axios timeout / RestClient error | Return GraphQL `ErrorResponse`; BE lifecycle moves to `ERROR_CONVERSATION` if caller implements |
| Provider 4xx auth | Missing/invalid bearer or internal API key | HTTP 401/403 | Check `Authorization`, `x-client-type`, `x-api-key`, service config |
| Provider 4xx validation | Missing groupCode/userId/sessionCode/file payload | HTTP 400/422 | Do not retry; fix request |
| Provider 5xx | Conversation service lỗi | HTTP 500-504 | Fail operation; retry only where caller has controlled retry flow |
| Upload auth header dropped | `groupUpload` unauthorized even with `INTERNAL_API_KEY` configured | Source review / 401 from provider | Verify `getHeaders()` forwarding before relying on `x-api-key` |
| Delete token mismatch | Token not received by provider | Delete token keeps failing / provider 400 | Verify whether token belongs in header/body/query for `ApiClient.delete` |
| Duplicate conversation user | Retry creates user twice if provider not idempotent | Provider conflict / duplicate data | Use uid as natural idempotency key if provider supports it |
| Conversation user sync fail | Tenant/HRMS user exists but chat user missing | `ERROR_CONVERSATION` or logs | Use retry conversation integration after checking provider state |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries in `agg-sso-graph` | Không thấy retry policy chung trong BFF conversation client |
| Backoff in `agg-sso-graph` | Không thấy trong source hiện tại |
| Total max wait in `agg-sso-graph` | `DEFAULT_TIMEOUT` default `60000ms` |
| BE retry | `gf-hrms` dùng `@Retryable(backoff = @Backoff(delay = 1000))` cho `createConversationUser`; `ct-saas-tenant` có method/recover naming nhưng retry annotation không thấy trực tiếp trong đoạn đọc |
| Idempotency key | Không thấy idempotency header; `uid` nên là natural key cho create conversation user nếu provider hỗ trợ |

Contract rule:

- Không retry tự động các operation mutate group/member/routing nếu chưa rõ idempotency.
- Với create conversation user, retry phải dựa trên `uid` và phải xử lý conflict/duplicate như thành công nếu provider xác nhận user đã tồn tại.

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
| Idempotency key generation | Chưa thấy trong source hiện tại |
| Server-side dedup window | Chưa thấy trong source hiện tại |
| Order guarantees | Conversation user phải có IAM `uid` trước khi tạo; group membership phải có groupCode/userId hợp lệ |
| Replay safety | Reads/token fetch retry safe hơn; upload/member/routing mutations cần kiểm tra state trước khi retry |

Ordering rules:

- `gf-hrms` tạo IAM user trước, sau đó tạo conversation user. Nếu conversation fail, user được đánh dấu `ERROR_CONVERSATION`.
- `ct-saas-tenant` tạo conversation user trong tenant/IAM provisioning flow; failure được log và có retry endpoint `retry-conversation-iam`.
- Group upload phải upload đúng group sau khi group đã tồn tại.

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags | Trạng thái |
|---|---|---|---|
| `integration.ct-conversation-client.requests` | counter | `op`, `status`, `boundary` | Chưa thấy custom metric riêng |
| `integration.ct-conversation-client.duration` | histogram | `op`, `boundary` | BFF có log duration qua `ApiClient`; metric riêng chưa thấy |
| `integration.ct-conversation-client.errors` | counter | `op`, `error_code` | Chưa thấy custom metric riêng |
| `integration.ct-conversation-client.upload_failures` | counter | `groupCode`, `status` | Chưa thấy |
| `integration.ct-conversation-client.sync_user_failures` | counter | `boundary`, `role` | Chưa thấy |

### 8.2 Logging

- `agg-sso-graph` `ApiClient` log method/path/status/duration and maps destination `ct-conversation-client`.
- Conversation service logs provider errors with `JSON.stringify(error)`.
- `groupUpload` has `console.log(headers)`, which is not safe for production if headers contain bearer/internal tokens.
- `ct-saas-tenant` logs full `conversationRequest`; this includes uid/name/avatar/role and should be treated as PII-bearing.

### 8.3 Tracing

- `agg-sso-graph` has OpenTelemetry config and service registry maps `CONVERSATION_SERVICE_ENDPOINT` to `ct-conversation-client`.
- Request id forwarding from BFF to conversation is not guaranteed because `BaseService.getHeaders()` only forwards `Authorization` and `x-client-type`.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Conversation API error rate | > 5% trong 5 phút | P2 | Conversation/GMS owner |
| User token error spike | > 5% trong 5 phút | P2 | Conversation/GMS owner |
| Upload failure spike | > 5% trong 5 phút | P2 | Conversation/GMS owner |
| `ERROR_CONVERSATION` users tăng | Bất kỳ spike sau release | P2 | Tenant/HRMS owner |
| Protected API 401/403 | Bất kỳ sau deploy/rotation | P1 | Platform/Security owner |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Chưa thấy trong source hiện tại |
| Our SLA exposed to users | Chat/token/routing/group operations phụ thuộc trực tiếp conversation service |
| Rate limits | Chưa thấy trong source hiện tại |
| Quota limits | Chưa thấy trong source hiện tại |
| Pricing model | Internal ecosystem service; chưa thấy cost model |
| Cost cap / budget alarm | Chưa thấy trong source hiện tại |
| Cost owner | Chưa thấy trong source hiện tại |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Có: `uid`, user id, full name, avatar URL, group membership, tenant/user chat metadata |
| Sensitive data | `authToken`, bearer token, internal API key, group chat file content |
| Data residency | Chưa thấy chính sách trong source hiện tại |
| Regulatory frameworks | Chưa thấy trong source hiện tại |
| DPA signed | Không áp dụng/không thấy vì đây là ecosystem service nội bộ |
| Data retention at provider | Chưa thấy trong source hiện tại |
| Right-to-erasure flow | Có `deleteToken`; không thấy delete conversation user trong scope hiện tại |

Security rules:

- Không log `authToken`, bearer token, internal API key hoặc raw upload headers.
- Upload phải có size/mimetype validation ở middleware/provider; BFF hiện chỉ append file stream.
- Group membership operations phải enforce scope ở provider để tránh kick/add member ngoài quyền.

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `https://swagger-dev.nonprod.aggregatoricapaci.com/ct-conversation-client` | Env runtime `CONVERSATION_SERVICE_ENDPOINT`, `CT_CONVERSATION_CLIENT_URL`, `internal-service.conversation.base-url` |
| Credentials | Bearer token cho BFF; `INTERNAL_API_KEY` cho protected/internal flow | Secret runtime/Vault path chưa thấy trong source hiện tại |
| Webhook URL | Không thấy webhook | Không thấy webhook |
| Test data fixtures | Chưa thấy trong source hiện tại | n/a |
| Switchover gate | Không thấy feature flag riêng | n/a |

## 12. Testing Strategy

| Layer | Approach | Trạng thái từ source |
|---|---|---|
| Unit | Mock `conversationApi`/Java clients; assert endpoint/body/header/error mapping | Chưa xác nhận test coverage |
| Contract | Fixture response cho list/token/upload/routing/member/create-user | Cần bổ sung nếu chưa có |
| Integration | Test env với real `ct-conversation-client`; verify bearer/internal key/header behavior | Cần chạy ở CI/staging |
| Upload test | Multipart files, mimetype/size, missing groupCode, auth failure | Cần bổ sung |
| Idempotency test | Retry create conversation user by same `uid`; duplicate/conflict handling | Cần bổ sung |
| Chaos | Inject timeout/5xx; verify GraphQL `ErrorResponse` và BE `ERROR_CONVERSATION`/retry behavior | Chưa thấy chaos policy |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| Conversation list/token lỗi | Kiểm tra `CONVERSATION_SERVICE_ENDPOINT`, bearer token, `x-client-type`, provider health và BFF logs |
| Group upload 401/403 | Kiểm tra `INTERNAL_API_KEY`, `groupUpload`, `getHeaders()` có forward `x-api-key` hay không, và provider auth policy |
| Delete token lỗi | Kiểm tra provider expects token ở header/body/query; rà `ApiClient.delete` call shape |
| Routing candidate/end call lỗi | Kiểm tra `sessionCode`, `prevKey`, provider routing state, retryAfterMs |
| Add/kick member lỗi | Kiểm tra `groupCode`, `userId`, caller permission, provider group state |
| User ở `ERROR_CONVERSATION` | Kiểm tra IAM uid tồn tại, provider create user state, rồi dùng retry conversation integration |
| Sensitive headers bị log | Rotate affected token/key nếu cần, rà `console.log(headers)` và provider/BFF logs |

Full runbook: chưa thấy file `Operations/runbooks/INTEG-EXT-ct-conversation-client-runbook.md` trong repo hiện tại.

## 14. Forbidden patterns

- ❌ Hardcode `ct-conversation-client` API key trong source — env vars / KMS only.
- ❌ Log full conversation message body — PII risk (chat content, user info).
- ❌ Skip JWT signature verification at upstream — relying on Kong/upstream validation.
- ❌ Persist conversation messages locally — `ct-conversation-client` là source of truth; chỉ cache ngắn hạn nếu cần.
- ❌ Auto-create group chat mà không có `groupCode` dedup — duplicate group risk.
- ❌ Bypass `x-api-key` header cho upload endpoint — provider reject upload.
- ❌ Send file ngoài MIME type whitelist — security risk.
- ❌ Skip rate limit per-user — abusive senders.
- ❌ Caller infer call routing logic — phải gọi `routingCandidate` endpoint.

## 15. References

- HLD callers: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md), [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md)
- API contract caller: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md), [gf-hrms-api.md](../api/gf-hrms-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-002 (GraphQL aggregator), ADR-003 (tenant + SSO boundary — conversation context)
- Related INTEG: [INTEG-BFF-agg-sso-graph.md](INTEG-BFF-agg-sso-graph.md) (caller BFF chính)
- Provider docs: External (cardoctor team)
- KG: [agg-sso-graph.knowledge-graph.yaml](../../Execution/knowledge-graphs/agg-sso-graph.knowledge-graph.yaml) — conversation module operations
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v2: verified 15/15 operations match; thêm KG reference; version bump. |
| 2026-05-07 | v1 | Initial integration contract `agg-sso-graph` / `ct-saas-tenant` / `gf-hrms` -> `ct-conversation-client` (conversation/chat/routing ecosystem): REST/HTTPS+JSON với Bearer JWT + `x-client-type` cho BFF chat operations; `x-api-key` (`INTERNAL_API_KEY`) cho protected create conversation user; key operations conversation/group list, user token, group upload (multipart), routing candidate / end-call, group membership add/kick, protected create conversation user; failure mode no global retry trừ `gf-hrms` `@Retryable(delay=1000)` cho create user, no circuit breaker, timeout default 60s. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
