---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gms-tenant-user-enrichment"
provider: "ct-saas-tenant"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration - GMS boundaries <-> ct-saas-tenant (External Service)

> Document tích hợp giữa các boundary GMS và **ct-saas-tenant**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **ct-saas-tenant** - tenant/user ecosystem service |
| Provider docs | Chưa thấy tài liệu provider riêng trong source hiện tại |
| Provider status page | Chưa thấy trong source hiện tại |
| Used by boundary | `agg-garage-graph` |
| Module / class | `agg-garage-graph/src/graphql/modules/tenant/tenant.resolver.ts` |
| Sandbox URL | `http://localhost:45160` (BFF local default) |
| Production URL | Env runtime: `CT_SAAS_TENANT` |
| API version pinned | `/api/v1/saas-tenant/tenant-users/search/basic` |
| SDK / library | `agg-garage-graph`: hand-written `PassthroughService` + Axios `ApiClient` |
| Category | Tenant / Identity enrichment |

Boundary-specific configuration:

| Boundary | Config key | Default / source |
|---|---|---|
| `agg-garage-graph` | `CT_SAAS_TENANT` | `http://localhost:45160` |

Important scope note:

| Flow | Provider gọi trực tiếp |
|---|---|
| BFF `searchUsers` | `ct-saas-tenant` |
| BFF `getTenantInfo`, `getCurrentUser`, `deleteUser` | Source hiện tại gọi `gfPurchaseService`, không gọi trực tiếp `ct-saas-tenant` |

## 2. Why this provider (decision)

**Decision**: GMS dùng `ct-saas-tenant` làm source cho tenant user lookup/enrichment khi cần map actor/user/tenant sang IAM user data.

**Why**:

- `agg-garage-graph` cần `searchUsers` để enrich tên actor/user trong nhiều domain như order, campaign, customer, MDM, settlement, service order.
- Tenant/user lookup là dữ liệu cross-domain, không thuộc riêng `gf-sales` hay `gf-purchase`.

**Alternatives considered**: Không thấy ADR hoặc source decision về provider thay thế trong source hiện tại.

**Ref**:

- `Architecture/integrations/INTEG-BFF-agg-garage-graph.md`
- `Architecture/integrations/INTEG-BFF-garage-backoffice.md`
- `Architecture/integrations/_EXT-INTEGRATION-PHASE0-BASELINE.md`

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method cho BFF direct call | Bearer token forwarded qua `Authorization`; request id trio; `x-source-service`; `x-real-ip`; `Garage-App-Version` nếu context có |
| Credential rotation | Chưa thấy quy trình rotation trong source hiện tại |
| Storage | `CT_SAAS_TENANT` |
| Scope / permission | Search tenant users/basic |
| Multi-tenant strategy | Request payload/query truyền `tenantId`/`tenantIds`; downstream phải enforce tenant scope |

Header behavior theo source:

| Boundary | Header behavior hiện tại |
|---|---|
| `agg-garage-graph` | `ApiClient` forward `Authorization`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`, `x-real-ip`, `Garage-App-Version`, `x-api-key-feedback` nếu có |

Security rule:

- Không coi `tenantId` trong input là đủ để authorize. Backend `ct-saas-tenant` phải xác thực caller và kiểm tra tenant scope.
- Các enrichment call không được làm lộ user data cross-tenant.

### 3.2 Webhook security

Không thấy source hiện tại mô tả `ct-saas-tenant` gửi webhook về các boundary trong scope này. Không áp dụng ở Phase 2.

## 4. Endpoints / Operations Used

Chỉ liệt kê operation quan sát được từ source GMS hiện tại.

| # | Operation | Method | Path / RPC | Used by | Trigger |
|---:|---|---|---|---|---|
| 1 | Search tenant users basic | `POST` | `/api/v1/saas-tenant/tenant-users/search/basic` | `agg-garage-graph` | GraphQL `Query.searchUsers` và enrichment trong order/campaign/customer/MDM/settlement/service-order |

Observed BFF enrichment usage of `searchUsers`:

| Module | Mục đích |
|---|---|
| `order` | Enrich user/actor display data |
| `gf-customer` | Enrich creator/updater/user reference |
| `campaign` | Enrich actor/user reference trong campaign flows |
| `mdm` | Enrich actor/user reference ở nhiều resolver |
| `gf-accounting/settlements` | Enrich settlement creator/updater/display name |
| `gf-sales/service-orders` | Enrich service-order related user data |

## 5. Request / Response Contracts

### 5.1 Search tenant users basic

**Request**:

```json
{
  "createdBy": "iam-user-id",
  "createdFrom": "2026-01-01",
  "createdTo": "2026-01-31",
  "page": 0,
  "size": 20,
  "sort": "createdAt",
  "direction": "DESC",
  "tenantId": 123,
  "phones": ["0900000000"],
  "emails": ["user@example.com"],
  "iamUserIds": ["iam-user-id-1", "iam-user-id-2"]
}
```

**Response success shape qua BFF**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "success",
  "data": {
    "content": [
      {
        "userName": "user",
        "fullName": "Nguyen Van A",
        "iamUserId": "iam-user-id-1"
      }
    ],
    "pageInfo": {
      "page": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1,
      "first": true,
      "last": true,
      "hasNext": false,
      "hasPrevious": false
    }
  }
}
```

**Response error shape qua `agg-garage-graph`**:

```json
{
  "__typename": "ErrorResponse",
  "statusCode": 500,
  "message": "provider error message",
  "code": "provider_code",
  "path": "/api/v1/saas-tenant/tenant-users/search/basic",
  "timestamp": "..."
}
```

**Mapping -> internal model**:

| Provider field | BFF GraphQL field / usage |
|---|---|
| `userName` | `SearchUsersData.userName`; actor/user enrichment |
| `fullName` | `SearchUsersData.fullName`; display name enrichment |
| `iamUserId` | `SearchUsersData.iamUserId`; join key từ domain record sang tenant user |
| `pageInfo` | `PagedSearchUsersResponse.data.pageInfo` |

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | BFF/BE không nhận response tenant service | Axios timeout hoặc RestClient error | Return GraphQL field error hoặc mark notification stage theo caller behavior; không retry tự động nếu chưa rõ idempotency |
| Provider 4xx auth | `Authorization` sai hoặc thiếu | HTTP 401/403 | Kiểm tra bearer propagation, tenant service auth policy |
| Provider 4xx validation | `tenantId`, `tenantIds`, `iamUserIds`, paging invalid | HTTP 400/422 | Không retry; sửa input/mapping |
| Provider 5xx | Tenant service lỗi | HTTP 500-504 | Degrade enrichment nếu caller catch được; nếu không, field/job fail |
| Empty result | Không tìm thấy user cho `iamUserIds`/`tenantIds` | Response success nhưng `content`/`data` rỗng | Render thiếu display name hoặc notification không tạo user notification |
| Cross-tenant data leak | Search trả user ngoài tenant scope | Data anomaly / security report | Treat as security incident; kiểm tra authz tại `ct-saas-tenant` |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | Không thấy retry policy chung trong `agg-garage-graph` `PassthroughService` |
| Backoff | Không thấy trong source hiện tại |
| Total max wait | `DEFAULT_TIMEOUT` default `60000ms`; Java RestClient timeout phụ thuộc config nếu có |
| Idempotency key | Không áp dụng cho read/search; không thấy idempotency key |
| After max retries | Không áp dụng vì chưa thấy retry tự động |

Contract rule: có thể retry read/search nếu caller có timeout budget và không phá vỡ UX, nhưng phải tránh lặp N+1 lớn khi tenant service chậm.

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
| Idempotency key generation | Không áp dụng cho observed read/search operations |
| Server-side dedup window | Không áp dụng |
| Order guarantees | Enrichment phải chạy sau khi domain data đã có `iamUserId`/`tenantId` |
| Replay safety | Search/get users có thể gọi lại, nhưng cần rate/latency guard |

Ordering risk:

- Composite resolver gọi domain backend trước, sau đó gọi `searchUsers` để enrich. Nếu tenant service lỗi, response có thể fail toàn field hoặc thiếu enrichment tùy resolver catch.

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags | Trạng thái |
|---|---|---|---|
| `integration.ct-saas-tenant.requests` | counter | `op`, `status`, `boundary` | Chưa thấy custom metric riêng |
| `integration.ct-saas-tenant.duration` | histogram | `op`, `boundary` | BFF có log duration qua `ApiClient`; metric riêng chưa thấy |
| `integration.ct-saas-tenant.errors` | counter | `op`, `error_code` | Chưa thấy custom metric riêng |
| `integration.ct-saas-tenant.empty_result` | counter | `op`, `tenantId` | Chưa thấy |

### 8.2 Logging

- `agg-garage-graph` `ApiClient` log method/path/status/duration.
- Contract rule: không log full user PII hoặc `x-api-key`.

### 8.3 Tracing

- `agg-garage-graph` forward request id trio khi context có.
- `ct-saas-tenant` chưa nằm trong `SERVICE_REGISTRY` của `agg-garage-graph` tại source quan sát được, nên service name trong log/tracing có thể fallback hostname hoặc `unknown-service`. Đây là observability gap.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Tenant search error rate tăng | > 5% trong 5 phút | P2 | GMS/BFF owner |
| Tenant lookup latency cao | p99 vượt budget composite resolver | P3 | GMS/BFF owner |
| Notification tenant lookup fail | Spike lỗi hoặc empty result bất thường | P2 | Notification owner |
| Protected tenant 401/403 | Bất kỳ sau deploy/rotation | P1 | Platform/Security owner |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Chưa thấy trong source hiện tại |
| Our SLA exposed to users | Enrichment phụ thuộc tenant service availability |
| Rate limits | Chưa thấy trong source hiện tại |
| Quota limits | Chưa thấy trong source hiện tại |
| Pricing model | Internal ecosystem service; chưa thấy cost model |
| Cost cap / budget alarm | Chưa thấy trong source hiện tại |
| Cost owner | Chưa thấy trong source hiện tại |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Có: `tenantId`, `tenantIds`, phone, email, `iamUserId`, username, full name |
| Data residency | Chưa thấy chính sách trong source hiện tại |
| Regulatory frameworks | Chưa thấy trong source hiện tại |
| DPA signed | Không áp dụng/không thấy vì đây là ecosystem service nội bộ |
| Data retention at provider | Chưa thấy trong source hiện tại |
| Right-to-erasure flow | Không nằm trong observed direct operations của Phase 2 |

Security rules:

- BFF không được gửi `tenantId` từ client mà không có downstream authorization.
- `searchUsers` phải chỉ trả user trong scope mà caller được phép xem.

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `http://localhost:45160` | Env runtime `CT_SAAS_TENANT` |
| Credentials | Bearer token forward từ BFF context | Secret runtime/Vault path chưa thấy trong source hiện tại |
| Webhook URL | Không thấy webhook | Không thấy webhook |
| Test data fixtures | Chưa thấy trong source hiện tại | n/a |
| Switchover gate | Không thấy feature flag riêng | n/a |

## 12. Testing Strategy

| Layer | Approach | Trạng thái từ source |
|---|---|---|
| Unit | Mock `ctSaasTenantService`; assert input, headers, empty result handling | Chưa xác nhận test coverage |
| Contract | Fixture response cho paged search users và protected tenant users | Cần bổ sung nếu chưa có |
| Integration | Test env với real `ct-saas-tenant`; verify auth header, tenant scope, paging | Cần chạy ở CI/staging |
| Load | Test composite resolver có nhiều enrichment để phát hiện N+1/latency drift | Chưa thấy |
| Chaos | Inject timeout/5xx/empty response; verify degraded behavior | Chưa thấy chaos policy |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| `searchUsers` lỗi trong BFF | Kiểm tra `CT_SAAS_TENANT`, `/api/v1/saas-tenant/tenant-users/search/basic`, bearer token, request id, tenant service logs |
| Enrichment thiếu full name | Kiểm tra input `iamUserIds`, empty `content`, user existence trong tenant service |
| BFF API 401/403 | Kiểm tra bearer token propagation và tenant service auth policy |
| Cross-tenant data anomaly | Tạm dừng affected flow nếu cần, rà authz tenant service và request payload từ BFF/BE |
| Latency cao | Kiểm tra số lượng enrichment calls, thiếu DataLoader/cache, tenant service DB/API latency |

Full runbook: chưa thấy file `Operations/runbooks/INTEG-EXT-ct-saas-tenant-runbook.md` trong repo hiện tại.

## 14. Forbidden patterns

- ❌ Caller (Garage services) ghi trực tiếp DB của `ct-saas-tenant` — `ct-saas-tenant` là tenant SoT (per ADR-003), Garage chỉ projection.
- ❌ Skip `tenantIds` filter — cross-tenant user list leak.
- ❌ Hardcode `CT_SAAS_TENANT` URL — env vars only.
- ❌ Log full user phone/email/PII raw — sanitize.
- ❌ Persist tenant info ngoài `tenant_subscriptions_cache` projection — phải ghi rõ source-of-truth là ct-saas-tenant.
- ❌ Caller modify tenant master state — chỉ ct-saas-tenant own; Garage receive update qua Kafka tenant provisioning event (ADR-003, ADR-004).
- ❌ Skip retry tolerance khi `ct-saas-tenant` slow — user enrichment optional, fall back null fields.
- ❌ Cache user info indefinitely — staff turnover; recommend TTL ≤ 1h hoặc invalidate on event.

## 15. References

- HLD callers: [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md), [gf-system-HLD.md](../hld/gf-system-HLD.md), [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- API contract caller: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md), [gf-system-api.md](../api/gf-system-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-003 (tenant + SSO boundary — tenant SoT), ADR-001 (microservice landscape), ADR-004 (Kafka — tenant provisioning event)
- Related INTEG: [INTEG-EXT-sec-iam-service.md](INTEG-EXT-sec-iam-service.md) (sister IAM authority)
- Provider docs: External (cardoctor team)
- KG: [agg-garage-graph.knowledge-graph.yaml](../../Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml) — tenant module downstream mapping + BR-AGG-GARAGE-GRAPH-001 (ubiquitous enrichment)
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial integration contract `agg-garage-graph` -> `ct-saas-tenant` (tenant/user enrichment SoT): REST/HTTPS+JSON với Bearer JWT forward; key operation `POST /api/v1/saas-tenant/tenant-users/search/basic` cho actor/user enrichment đa domain (order, customer, campaign, MDM, settlement, service-order); failure mode no auto-retry, timeout default 60s, empty result -> degrade enrichment fallback null. |
| 2026-05-19 | v2 | Sync với KG v6: verified searchUsers operation match; thêm KG reference; version bump. |
| 2026-05-11 | v1.1 | Scope lại chỉ BFF → ct-saas-tenant. Loại bỏ gf-notification (BE-to-BE) khỏi scope document. |
