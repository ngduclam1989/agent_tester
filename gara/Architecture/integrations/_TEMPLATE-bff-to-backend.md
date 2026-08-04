---
type: architecture
artifact_kind: integration-bff-backend
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary_bff: "{{bff-boundary}}"
last_reviewed: "YYYY-MM-DD"
supersedes: "none"
---

# Integration — BFF (Apollo GraphQL) `{{bff-boundary}}`

> Document tích hợp giữa BFF Apollo GraphQL **`{{bff-boundary}}`** và toàn bộ backend services downstream (Garage-internal + external).
> Khác phiên bản v1: file này document **per-BFF, multi-backend, flow-oriented** thay vì 1 file/1 backend. Mục đích: show được bird's-eye view của BFF và "1 graph gọi nhiều BE".

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| BFF service | `{{bff-name}}` (Apollo Server / Apollo Federation Gateway) |
| Audience | {{Web staff / Mobile parent / Garage operational / SSO/IAM-adjacent}} |
| Schema source | `{{path to schema modules}}` |
| Schema artifact | `{{npm package name@version}}` |
| Codegen tool | `{{@graphql-codegen/cli}} + plugins` |
| Persisted queries | {{Yes / No — và lý do}} |
| Health check | `GET /health`, GraphQL `_health` |
| Metrics | `GET /metrics` Prometheus format |
| Runtime | {{Node.js 22 / TypeScript / Apollo Server 4 / Express}} |

---

## 2. Topology / Position in C4

```
[Web/Mobile clients]
        │
        ▼
   [{{bff-name}} GraphQL]  ◀── this integration ──▶  [BE service 1]
        │                                              [BE service 2]
        ▼                                              [BE service N]
   [other clients]                                    [external 1, external 2, ...]
```

Reference: `Architecture/SYSTEM-ARCHITECTURE.md` §C4-Container.

---

## 3. Authentication (gateway-level)

Auth strategy chung của BFF (per-BE auth detail xem §4 matrix).

| Thuộc tính | Giá trị |
|---|---|
| Client → BFF auth | {{Bearer JWT / cookie HttpOnly / introspection}} |
| BFF → Backend auth | {{Token forwarding via context / x-api-key per-BE / mTLS}} |
| User context propagation | {{`Authorization` header forward; tenant/branch claims; trace IDs}} |
| Gateway-level enforcement | {{Operations gateway chặn sớm (vd auth required) — list nếu có}} |

> **Anti-pattern**: BFF gọi backend "as superuser" mà không pass user context → backend không enforce row-level authz. Always propagate user identity.

---

## 4. BE Landscape Matrix

Bảng tổng hợp **mọi backend service** mà BFF này gọi xuống. Cho phép reader nhìn 1 lần thấy toàn cảnh tích hợp.

| # | BE service | BFF module(s) | Protocol | Trust zone | Auth method | Base URL config | Source code path |
|---|---|---|---|---|---|---|---|
| 1 | `{{gf-xxx}}` | `{{module-name}}` | REST | Internal Garage | x-api-key + token forward | `{{ENV_VAR}}` | `{{srcroot/.../client.ts}}` |
| 2 | `{{ct-yyy}}` | `{{module-name}}` | REST | External (`ct-*`) | API key + token forward | `{{ENV_VAR}}` | `{{srcroot/.../client.ts}}` |
| 3 | `{{aws-zzz}}` | `{{module-name}}` | AWS SDK | External (AWS) | IAM role | (SDK config) | `{{srcroot/.../client.ts}}` |

> Trust zone: **Internal Garage** (gf-* services) | **External internal** (ct-*, sec-*, ac-* — owned by other teams) | **External 3rd-party** (AWS, Google, Stripe, ...).

---

## 5. Flow Map

Liệt kê **các cross-cutting flows** quan trọng trong BFF — flow nào cần ≥2 BE để hoàn tất. Flow đơn giản (1 BE) không cần list ở đây, đã có trong §4 matrix.

| # | Flow name | Trigger | BEs involved | Pattern | Anchor |
|---|---|---|---|---|---|
| 1 | {{Flow A}} | {{Mutation X / Query Y}} | `{{BE1}}, {{BE2}}` | Sequential / Parallel / Conditional | [§6.1](#61-flow-a) |
| 2 | {{Flow B}} | {{...}} | `{{BE1}}, {{BE2}}, {{BE3}}` | Parallel + DataLoader | [§6.2](#62-flow-b) |

**Pattern legend**:
- **Sequential**: BE2 cần result từ BE1
- **Parallel**: BE1 và BE2 độc lập, gọi đồng thời (Promise.all hoặc DataLoader)
- **Conditional**: BE2 chỉ gọi khi BE1 trả điều kiện
- **Saga**: nhiều mutation cross-BE với compensation (rare cho BFF)

---

## 6. Per-flow Detail

Cho mỗi flow trong §5, expand chi tiết.

### 6.1 {{Flow A}}

**GraphQL operation**: `{{Mutation.placeOrder / Query.serviceOrderDetail / ...}}`

**Trigger**: {{User action / mounted screen / push notification deep link}}

**BE call sequence**:

```
[Client GraphQL request]
  ↓ Apollo middleware (auth, context)
  ↓
[Resolver entry — module/{{module}}.resolver.ts]
  ↓
  1. Call BE1 (gf-xxx) — {{purpose}}
     ↓ result A
  2. Call BE2 (gf-yyy) — uses result A.field, {{purpose}}
     ↓ result B
  3. Parallel: Call BE3 + BE4 (DataLoader batch)
     ↓ results C, D
  4. Compose response { ...A, ...B, ...C, ...D }
  ↓
[Return GraphQL response]
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | `{{gf-xxx}}` | `{{POST /api/v1/...}}` | `{{input}}` | `{{output}}` | {{Behavior on failure}} |
| 2 | `{{gf-yyy}}` | `{{GET /api/v1/...}}` | `{{step 1 result.id}}` | `{{output}}` | {{...}} |

**DataLoader strategy** (nếu áp dụng):
- `{{loaderName}}` — batch by `{{key}}` — TTL per-request

**Error mapping** (cross-BE):
- BE1 fail (HTTP 4xx) → `extensions.code: BAD_USER_INPUT`, abort flow
- BE2 fail (HTTP 5xx) → `extensions.code: INTERNAL_SERVER_ERROR`, partial response (A only)
- Timeout BE3 → use cached value, log warning

**Transaction boundary**: {{Eventual consistency / saga / no boundary across BEs}}

**Idempotency**:
- Client provides `{{X-Idempotency-Key}}` header → forwarded to BE1 + BE2

### 6.2 {{Flow B}}

(repeat structure)

### 6.N Simple module flows (1 BE)

Module nào chỉ gọi 1 BE thì list reference vào §4 matrix, không cần section riêng. Nếu có chú ý đặc biệt (vd webhook callback, file upload), expand sub-section ngắn:

#### 6.N.1 {{Module simple}}

- Module: `{{module-path}}`
- BE: `{{single-BE}}`
- Operations: list trong §4
- Special note: {{webhook signature verify / file streaming / ...}}

---

## 7. N+1 Prevention (cross-backend strategy)

GraphQL resolver fan-out qua nhiều BE → dễ tạo N+1 nếu không có DataLoader.

| Field | DataLoader name | Batch by | BE | Cache scope | TTL |
|---|---|---|---|---|---|
| `Order.customer` | `customerLoader` | `customer_id` | gf-customer | per-request | n/a |
| `Order.items` | `orderItemsLoader` | `order_id` | gf-inventory | per-request | n/a |
| `Order.assignedTechnician` | `userLoader` | `user_id` | gf-hrms | per-request | n/a |

**Backend MUST expose batch endpoints** (`GET /customers?ids=1,2,3` hoặc `POST /search` với array filter) để DataLoader gọi 1 request thay vì N.

Backend batch endpoints used:

| Endpoint | BE | Max batch size | Latency budget |
|---|---|---|---|
| `{{POST /api/v1/customers/search}}` | gf-customer | {{100}} | {{p99 < 200ms}} |
| `{{POST /api/v1/users/by-ids}}` | gf-hrms | {{50}} | {{p99 < 150ms}} |

---

## 8. Caching Strategy

### 8.1 Per-request cache (DataLoader)

Default. Tự động dedupe trong 1 GraphQL request.

### 8.2 Application-level cache (Redis / Apollo cache)

| Field/op | BE | TTL | Invalidation |
|---|---|---|---|
| `Query.product(id)` | gf-erp-mdm | {{60s}} | Manual invalidate on `Mutation.updateProduct` + TTL fallback |
| `Query.tenantInfo()` | ct-saas-tenant | {{300s}} | Event-based |

### 8.3 Cache key strategy

```
{{`bff:{{bff-name}}:{{op}}:{{hash(args + tenant + user-context)}}`}}
```

Include tenant/user context in key nếu response phụ thuộc tenant hoặc user (avoid leaking other tenant's data).

### 8.4 Cache stampede protection

{{Singleflight / probabilistic early refresh / lock — pattern dùng}}

---

## 9. Schema Contract (cross-BE codegen sync)

### 9.1 Backend schema sources

Mỗi BE có contract riêng — BFF resolver phải sync với:

| BE | Contract source | Sync mechanism |
|---|---|---|
| `{{gf-xxx}}` | `Architecture/api/{{boundary}}-api.md` | Manual review + OpenAPI codegen (nếu có) |
| `{{ct-yyy}}` | External Swagger / partner doc | Pin version + manual update |

### 9.2 BFF schema mapping

`{{path to BFF resolvers — bff/src/graphql/modules/}}`

### 9.3 Type generation

```bash
{{Command — e.g., npm run codegen}}
```

Re-run khi BE schema thay đổi. CI gate: `{{codegen-check command}}` fails nếu generated types stale.

### 9.4 Version compatibility

| Aspect | Strategy |
|---|---|
| BE adds field | Additive — BFF deploy theo sau (no breaking) |
| BE removes field | Deprecate ≥1 wave; BFF stop using; then BE removes |
| BE renames | Use alias trong BE schema; BFF migrate; remove alias |
| Breaking change | CR Level CRITICAL + coordinated release |

---

## 10. Error Handling (cross-BE precedence)

### 10.1 Backend error → GraphQL error mapping

| Backend response | GraphQL behavior |
|---|---|
| 200 with data | Return data |
| 4xx (auth) | `extensions.code: UNAUTHORIZED` / `FORBIDDEN` |
| 4xx (validation) | `extensions.code: BAD_USER_INPUT` + field-level details |
| 4xx (not found) | Return null (per nullability) OR `NOT_FOUND` extension |
| 5xx | `extensions.code: INTERNAL_SERVER_ERROR`; partial response if possible |
| Timeout | `extensions.code: TIMEOUT` after circuit hit |

### 10.2 Cross-BE error precedence

Khi 1 GraphQL operation gọi nhiều BE và ≥2 BE fail, BFF chọn error nào để surface:

| Scenario | Strategy |
|---|---|
| BE1 critical fail + BE2 nice-to-have fail | Surface BE1 error; BE2 set field=null + warning |
| BE1 + BE2 cùng critical | Surface earlier-occurring error; log both |
| Sequential flow: BE1 fail → BE2 không gọi | Surface BE1 error; abort flow |

### 10.3 Partial failure semantics

GraphQL allows partial responses. Strategy:

- Per-field nullable → field=null + error trong `errors[]` array
- Required field fails → error bubbles to nearest nullable parent
- Document explicit nullability cho mỗi field critical trong §6 per-flow detail

---

## 11. Resilience

| Aspect | Config (per-BE override possible) |
|---|---|
| Connection pool | {{e.g., max 20 connections per BE}} |
| Per-request timeout | {{Per resolver — 2s default; aggregate query 5s}} |
| Retry policy | Idempotent reads only; max 2 retries; exponential backoff |
| Circuit breaker | Per BE service; open at 50% errors over 30s |
| Bulkhead | Separate connection pool per BE; isolate failure |

Per-BE override in §4 matrix nếu service nào có config riêng.

---

## 12. Observability

### 12.1 Tracing

- BFF span per resolver: `bff.{{bff-name}}.{{module}}.{{operation}}`
- Per-BE child span: `bff.{{bff-name}}.backend.{{be-name}}.{{op}}`
- BE receives `traceparent` header (W3C) — full distributed trace
- Span attributes: `graphql.field`, `graphql.operation`, `dataloader.batch_size`, `backend.name`

### 12.2 Metrics

| Metric | Tags |
|---|---|
| `bff.requests` | `bff`, `op`, `status` |
| `bff.backend.requests` | `bff`, `backend`, `op`, `status` |
| `bff.backend.duration` | `bff`, `backend`, `op` |
| `bff.dataloader.batch_size` | `loader` |
| `bff.dataloader.cache_hit_rate` | `loader` |

### 12.3 Logging

Per-request log enriched với: `correlation_id`, `tenant_id`, `user_id`, `graphql_op`, `backend_calls[]` (each with op + duration + status).

---

## 13. Performance Targets

| Metric | Target |
|---|---|
| BFF resolver p99 latency (1-BE flow) | {{< 500ms}} |
| BFF resolver p99 latency (multi-BE composition) | {{< 1.5s}} |
| Backend call p99 (per-BE) | {{< 200ms}} |
| Subscription delivery latency | {{< 2s from BE event}} |
| GraphQL query depth limit | {{8}} |
| Query complexity limit | {{1000}} |
| Persisted queries | {{Required in production / Optional}} |

---

## 14. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock BE clients; test resolver logic + DataLoader batching |
| Contract | BE schema → generate fixture; assert BFF parses correctly |
| Integration | Real BE (test env) + Apollo Server in-process |
| Cross-BE flow | E2E test cho flows trong §6 — verify orchestration đúng |
| Load | k6 / artillery against staging BFF; verify N+1 not regressed |
| Chaos | Inject BE latency/errors; assert circuit + partial response |

---

## 15. Backwards Compatibility

- BFF schema contract is **published** to all clients (web, mobile)
- BE changes propagate via codegen → BFF schema may need update
- BFF schema deprecation: mark `@deprecated`; keep field for ≥{{1}} wave; remove via CR
- Cross-BE flow change (§6) = MAJOR CR — affects multiple downstream contracts

---

## 16. Operational Runbook

| Scenario | Action |
|---|---|
| BE service down | Circuit opens for that BE; BFF returns partial data + `BACKEND_UNAVAILABLE` for that domain; flows phụ thuộc BE đó fall back |
| Multiple BEs down | Surface degraded UX banner; disable affected mutations |
| DataLoader cache poisoning | Restart BFF (in-memory cache); investigate root cause |
| Schema drift (1 BE) | CI codegen-check should have caught it; redeploy BFF with updated codegen |
| Subscription connection storm | Rate limit subscription creates per IP/user |
| Cross-BE saga compensation needed | Manual invocation runbook (rare) |

---

## 17. Forbidden patterns

Anti-patterns mà BFF aggregator KHÔNG được phép. Vi phạm = MAJOR CR.

- ❌ Resolver chứa business rule bền vững — ownership thuộc domain service (per ADR-001)
- ❌ Direct DB access vào schema của BE — phải qua REST/GraphQL contract (per ADR-006)
- ❌ Cross-aggregate-BFF call — BFF KHÔNG gọi BFF khác (ngang hàng)
- ❌ Bỏ qua forward `Authorization` context xuống downstream — downstream phải re-validate, không gọi "as superuser"
- ❌ Issue JWT/refresh token tại BFF — phải forward sang IAM authority
- ❌ Persist domain state ở BFF ngoài contract đã được ADR document (vd thin proxy không own DB)
- ❌ Hardcode endpoint paths trong resolver — use centralized `endpoints.ts` config
- ❌ Skip enrichment fallback — phải graceful degrade khi catalog/tenant BE down (return raw codes / null fields)
- ❌ Mutation không idempotent mà không có Idempotency-Key handling
- ❌ Bỏ qua tenant claim trong RLS-sensitive flows (Superset, multi-tenant data)
- ❌ Log full token / PII fields (Authorization, notification_token, raw response with PII)
- ❌ Bypass signature verification cho external webhook callback (anti-pattern phổ biến)

---

## 18. References

- HLD: [{{bff-boundary}}-HLD.md](../hld/{{bff-boundary}}-HLD.md)
- API contract: [{{bff-boundary}}-graphql.md](../api/{{bff-boundary}}-graphql.md)
- Source code: `{{srcroot path tới BFF service}}`
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-002 (GraphQL aggregator pattern), ADR-003 (tenant + SSO boundary), ADR-006 (Flyway per-service data), ADR-007 (Redis cache)
- Downstream BE INTEG-EXT contracts (1 file/BE downstream):
  - [INTEG-EXT-{{be1}}.md](INTEG-EXT-{{be1}}.md)
  - [INTEG-EXT-{{be2}}.md](INTEG-EXT-{{be2}}.md)
  - ...
- Sister BFF (nếu có): [INTEG-BFF-{{other-bff}}.md](INTEG-BFF-{{other-bff}}.md)
- Business Rules: BR-XXX nếu có

---

## 19. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| YYYY-MM-DD | 3 | Add Forbidden patterns + References sections | Architecture Authority |
| YYYY-MM-DD | 2 | Restructure to per-BFF flow-oriented multi-backend (was per-pair v1) | Architecture Authority |
| 2026-05-02 | 1 | Initial BFF↔backend integration contract (per-pair pattern) | Architecture Authority |
