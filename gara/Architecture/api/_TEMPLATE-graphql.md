---
type: architecture
artifact_kind: api-contract
boundary: "{{boundary}}"
api_type: graphql
tier: T1
status: ACTIVE
version: 2
owner_authority: Architecture Authority
last_reviewed: "2026-07-07"
depends_on:
  - "../hld/{{boundary}}-HLD.md"
---

# GraphQL Schema - `{{boundary}}`

> Mo ta ngan 1-2 cau: GraphQL aggregation gateway/BFF nao, audience nao, co own persistence hay khong, va forward/orchestrate sang downstream services nao.
>
> Tai lieu nay phai duoc doi chieu voi ma nguon hien tai. SDL trong `src/graphql/**/**/*.schema.ts` la source of truth khi implementation thay doi.

## §0 Wave Index (optional — mandatory once file > 3,000 lines OR ≥ 2 wave-scoped sub-modules)

> **When to include**: nếu file GraphQL doc này > 3,000 dòng, HOẶC đã có ≥ 2 sub-module `§3<letter>` scoped theo wave riêng (vd `§3c Insurance W01`, `§3d Catalog V2 W03`, `§3g Opening Balance W04`) — thì §0 BẮT BUỘC. Dưới ngưỡng: bỏ qua §0, subagent đọc full file như cũ.
>
> **Subagent RULE (bounded read)**: khi §0 tồn tại và prompt scope gắn với 1 wave cụ thể, subagent chỉ được `Read` các section liệt kê ở cột `Sections` của wave đó **+ §1 Thong tin chung + §4 Runtime Integration Patterns + §5 Forbidden + §6 References**. KHÔNG đọc toàn file.
>
> **Cascading rule**: khi ratify thêm 1 sub-module `§3<letter>` cho wave mới, MUST append 1 hàng vào bảng này **trong cùng commit**. Drift check: `scripts/check-api-wave-index-drift.sh` (warn-only). Vi phạm = FM-020.

| Wave | Scope name | Sections | Endpoint / Op ID range | Status | Ratified in |
|------|------------|----------|------------------------|--------|-------------|
| WT-baseline | Baseline queries + mutations (pre-first-wave) | §3 (default) | (rows §2 baseline) | ACTIVE | pre-v{{N}} |
| W{{NN}} | {{Scope name — cite EP / ADR}} | §3{{letter}} | Ops `W{{NN}}-Q1..W{{NN}}-MN` | {{DESIGN\|ACTIVE}} | v{{N}} |

**Note**: §4 Runtime Integration Patterns + §5 Forbidden Patterns + §6 References là cross-wave — luôn nằm trong read scope bất kể wave.

## 1. Thong tin chung

| Thuoc tinh | Gia tri |
|---|---|
| Endpoint | `{{public_graphql_path}}`, vi du `/graphql` hoac `${GRAPHQL_PUBLIC_PATH}/graphql` |
| Auth | Forward `Authorization` va cac header context can thiet xuong downstream; gateway khong issue JWT. |
| API style | GraphQL over HTTP JSON; multipart upload neu schema co scalar `Upload`. |
| Runtime | {{vd: Node.js 22 / TypeScript / Express / Apollo Server 4 / `@graphql-tools/schema`}} |
| Schema location | `src/graphql/common/base.schema.ts`, `src/graphql/modules/**/**/*.schema.ts` |
| Schema artifact | {{Chua co / ten artifact neu CI publish SDL versioned artifact}} |
| Transport | Tat ca Query/Mutation dung `POST /graphql`; client phan biet bang `operationName` va `variables`. |
| Health / Metrics | {{vd: `GET /health`, GraphQL `_health`, `GET /metrics` Prometheus format}} |
| Upload | {{Khong co / GraphQL multipart qua upload middleware, memoryStorage, limit tu env}} |
| Persistence | {{Khong own database / DynamoDB table ... / cache ...}} |
| Downstream | `{{service-1}}`, `{{service-2}}`, `{{service-N}}` |
| Error model | GraphQL parse/validation errors o top-level `errors[]`; business/downstream errors thuong nam trong union `ErrorResponse`. |

### Request Context

| Context field | Nguon | Mo ta |
|---|---|---|
| `req` | Express request | Request goc sau request id/trace middleware. |
| `res` | Express response | Response goc cho Apollo middleware. |
| `token` / `headers` | HTTP headers | Bearer token va cac header duoc resolver/service forward xuong downstream. |
| `requestId` | Request id middleware | Correlation id cho log/tracing/downstream call. |

### Headers Duoc Quan Sat / Forward

| Header | Vai tro |
|---|---|
| `Authorization` | Bearer token cho business operation. |
| `x-client-type` | Client type neu downstream yeu cau. |
| `x-request-id` | Request correlation. |
| `x-trace-id` | Distributed tracing. |
| `x-correlation-id` | Cross-service correlation. |
| `x-source-service` | Caller identity khi gateway goi downstream. |
| `x-real-ip`, `x-forwarded-for` | Client IP extraction neu co. |
| `{{custom-header}}` | {{Mo ta header dac thu neu co}} |

## 2. Endpoint Summary

GraphQL transport dung chung `POST /graphql`. Moi Query/Mutation trong bang duoi day la mot dau API public cua BFF; client goi bang `operationName` tuong ung va truyen tham so qua `variables`.

| # | Type | Operation | Module | Arguments | Return type | Transport | Auth |
|---:|---|---|---|---|---|---|---|
| 1 | `Query` | `{{queryName}}` | `{{module}}` | `input: {{InputType}}` | `{{ResponseType}}` | `POST /graphql` | authenticated/context-dependent |
| 2 | `Mutation` | `{{mutationName}}` | `{{module}}` | `id: Int!`<br>`input: {{InputType}}!` | `{{ResponseType}}!` | `POST /graphql` | authenticated/context-dependent |

## 3. Endpoint Details

Moi endpoint ben duoi co cung HTTP transport `POST /graphql`; khac nhau o `operationName`, GraphQL document va `variables`. Request/response phai khop SDL hien tai. Voi union response, client nen query `__typename` va branch theo success type hoac `ErrorResponse`.

### Query `{{queryName}}`

Lay/tra cuu du lieu qua module `{{module}}`, tra ve `{{ResponseType}}`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Read-only, khong yeu cau `Idempotency-Key`.

**Downstream**:

| Service | Method | Path |
|---|---|---|
| `{{downstream-service}}` | `{{GET/POST/...}}` | `{{/api/vX/resource}}` |

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-YYYYMMDD-0001"
  },
  "operationName": "{{queryName}}",
  "query": "query {{queryName}}($input: {{InputType}}) { {{queryName}}(input: $input) { __typename ... on {{SuccessType}} { success code message data { id code status } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "input": {
      "{{field}}": "{{value}}"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "{{queryName}}": {
      "__typename": "{{SuccessType}}",
      "success": true,
      "code": "SUCCESS",
      "message": "OK",
      "data": {
        "id": 51001,
        "code": "CODE-YYYYMMDD-0001",
        "status": "ACTIVE"
      }
    }
  }
}
```

**Error response shape**:
```json
{
  "data": {
    "{{queryName}}": {
      "__typename": "ErrorResponse",
      "code": "<gateway-or-downstream-code>",
      "message": "<error message>",
      "statusCode": 400,
      "path": "<downstream path or GraphQL path>",
      "timestamp": "YYYY-MM-DDTHH:mm:ssZ"
    }
  }
}
```

**Error codes**:

| Code | HTTP | Condition |
|---|---:|---|
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL document khong parse duoc. |
| `GRAPHQL_VALIDATION_FAILED` | 400 | GraphQL document/variables khong khop SDL. |
| `BAD_USER_INPUT` | 400 | Variables/input khong hop le. |
| `UNAUTHENTICATED` / `UNAUTHENTICATED_ERROR` | 401 | Bearer token thieu, het han hoac khong resolve duoc user context. |
| `FORBIDDEN` / `FORBIDDEN_ERROR` | 403 | User khong co quyen hoac downstream tu choi quyen. |
| `TIMEOUT_ERROR` | 408/504 | Downstream timeout neu gateway ApiClient map timeout. |
| `HTTP_ERROR` | downstream | Downstream tra HTTP error khong co structured body. |
| `API_ERROR` | downstream | Downstream tra structured error nhung khong co `code`; gateway gan fallback. |
| `<downstream code>` | downstream | Gateway preserve `code` neu downstream tra `{ code, message, ... }`. |
| `UNKNOWN_ERROR` / `INTERNAL_ERROR` | 500 | Loi resolver, mapping response hoac xu ly noi bo gateway. |

### Mutation `{{mutationName}}`

Tao moi/cap nhat/thuc thi thao tac nghiep vu qua module `{{module}}`, tra ve `{{ResponseType}}`.

**Transport**: `POST /graphql`.
**Auth**: authenticated/context-dependent; gateway forward headers theo request context.
**Idempotency**: Khong thay gateway enforce `Idempotency-Key`; chong goi trung thuoc downstream/domain owner.

**Downstream**:

| Service | Method | Path |
|---|---|---|
| `{{downstream-service}}` | `{{POST/PUT/PATCH/DELETE}}` | `{{/api/vX/resource/:id}}` |

**Request**:
```json
{
  "headers": {
    "Authorization": "Bearer <access-token>",
    "x-request-id": "req-YYYYMMDD-0001"
  },
  "operationName": "{{mutationName}}",
  "query": "mutation {{mutationName}}($id: Int!, $input: {{InputType}}!) { {{mutationName}}(id: $id, input: $input) { __typename ... on {{SuccessType}} { success code message data { id code status } } ... on ErrorResponse { code message statusCode path timestamp } } }",
  "variables": {
    "id": 51001,
    "input": {
      "{{field}}": "{{value}}"
    }
  }
}
```

**Response 200**:
```json
{
  "data": {
    "{{mutationName}}": {
      "__typename": "{{SuccessType}}",
      "success": true,
      "code": "SUCCESS",
      "message": "OK",
      "data": {
        "id": 51001,
        "code": "CODE-YYYYMMDD-0001",
        "status": "ACTIVE"
      }
    }
  }
}
```

**Side-effect**: co the ghi/cap nhat du lieu nghiep vu, upload file, publish event, invalidate cache hoac orchestrate downstream tuy module owner.

**Error codes**: dung bang error codes cua Query mau ben tren, bo sung ma loi dac thu neu resolver/service co define rieng.

## 4. Runtime Integration Patterns

### 4.1 Passthrough Va Orchestration

- Resolver nen goi downstream qua service/helper chung cua repo, vi du `PassthroughService`, `BaseService` hoac API client wrapper hien co.
- Forward `Authorization` va correlation headers khi goi downstream.
- Voi resolver fan-out nhieu downstream, response phai giu ownership ro rang va khong tu merge business rule neu downstream da own rule.
- Khong goi direct DB cua downstream.

### 4.2 DataLoader Stance

Neu co field resolver gay N+1, DataLoader phai duoc tao per-request trong context, khong export global singleton. Batch key phai auth/tenant aware.

### 4.3 Upload, Download Va Export

| Surface | Contract |
|---|---|
| GraphQL upload | {{processUploads / graphql-upload / khong co upload}} |
| Upload limit | {{env var / fixed limit / khong ap dung}} |
| File module | {{operation upload/delete/feedback neu co}} |
| Raw route | {{download/export route neu co}} |
| Binary handling | Neu response la file stream/arraybuffer, document ro raw HTTP behavior; khong gia dinh SDL tra binary. |

### 4.4 Security-Sensitive Integrations

Ghi ro cac flow dung JWT decode, Superset guest token, device token, internal API key, RLS, proxy route hoac credential tu env. Neu gateway chi decode token ma khong verify cryptographic signature, phai neu ro boundary verification nam o dau.

## 5. Forbidden Patterns

- Khong issue JWT hoac persist password/session local trong gateway neu IAM/downstream la authority.
- Khong them DB/repository/persistence layer moi neu chua co ADR.
- Khong resolver goi direct DB cua downstream.
- Khong cross-aggregate-BFF call neu downstream owner da co API dung boundary.
- Khong goi direct `axios`/`fetch` trong resolver moi khi repo da co service/API client wrapper phu hop.
- Khong export DataLoader/global cache singleton.
- Khong log raw `Authorization`, cookie, API key, device token, file content, card detail hoac PII payload.
- Khong tang upload/body limit neu chua sync ingress/body limit va concurrency control.
- Khong mount download/export/proxy route moi neu chua xac dinh auth tuong duong GraphQL operation.
- Khong doi ten public operation/field neu chua co deprecation va migration plan.

## 6. References

- HLD: [{{boundary}}-HLD.md](../hld/{{boundary}}-HLD.md)
- ADR: [ADR-XXX-{{topic}}.md](../decisions/ADR-XXX-{{topic}}.md)
- Source schema: `src/graphql/common/base.schema.ts`, `src/graphql/modules/**/**/*.schema.ts`
- Source resolvers/services: `src/graphql/modules/**/**/*.resolver.ts`, `src/graphql/modules/**/**/*.service.ts`
- Downstream API contracts: [{{downstream-api}}.md]({{downstream-api}}.md)
- Integration contracts: [{{integration-contract}}.md](../integrations/{{integration-contract}}.md)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-07 | v2 | **Doc-nav — Add §0 Wave Index skeleton (optional, mandatory once file > 3k dòng OR ≥ 2 wave sub-modules)**. Insert §0 sau tiêu đề, trước §1: bảng `Wave | Scope name | Sections | Endpoint / Op ID range | Status | Ratified in` với Subagent RULE + Cascading rule. Backfill roadmap: `agg-garage-graph-graphql.md` đã populate v7.48; các file khác backfill khi vượt threshold. Pair với MANIFEST §5 Read scope column + `scripts/check-api-wave-index-drift.sh` warn-only + FM-020. v1 → v2. |
| YYYY-MM-DD | v1 | Initial GraphQL API contract: thong tin chung, Endpoint Summary, Endpoint Details, runtime integration patterns, forbidden patterns va references. |
