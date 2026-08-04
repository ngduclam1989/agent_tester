---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "agg-sso-graph"
provider: "aws-dynamodb-firebase-tokens"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — `agg-sso-graph` ↔ AWS DynamoDB (Firebase Device Token Store)

> Document tích hợp giữa BFF `agg-sso-graph` và AWS DynamoDB cho Firebase device token registry.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **AWS DynamoDB** — managed NoSQL key-value store cho device token registry |
| Provider docs | https://docs.aws.amazon.com/dynamodb/ |
| Provider status page | https://status.aws.amazon.com/ |
| Used by boundary | `agg-sso-graph` (firebase module) |
| Module / class | `srcroot/one-connect/agg-sso-graph/src/graphql/modules/firebase/firebase.service.ts`, `src/utils/dynamoDBClient.ts` |
| AWS region | `${AWS_REGION}` (default `ap-southeast-1`) |
| Production URL | AWS DynamoDB endpoint per region |
| API version pinned | AWS SDK v3.859.0 (`@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`) |
| SDK / library | AWS SDK v3 with `DynamoDBDocumentClient` wrapper |
| Category | External 3rd-party (AWS managed service) |
| Table name | `${DEVICE_TOKEN_TABLE}` (default `nonprod-dev-ac-device-token`) |

---

## 2. Why this provider (decision)

**Decision**: agg-sso-graph dùng DynamoDB direct (không qua intermediate service) để store Firebase notification tokens cho push notification dispatch.

**Why**:
- Device token là high-volume key-value workload — DynamoDB optimal cho point lookup/write.
- Tokens có TTL semantics natural — DynamoDB TTL feature support.
- Tách ra microservice riêng cho device token là over-engineering ở scale hiện tại; agg-sso-graph làm thin proxy là đủ.
- IAM role-based access control; same VPC khi deployed trên AWS infrastructure.

**Alternatives considered**:
- PostgreSQL trong gf-system / gf-hrms (rejected: scale concern, không phù hợp key-value pattern)
- Redis (rejected: persistence cho long-lived tokens cần durable; Redis is cache layer per ADR-007)
- Microservice riêng (rejected: over-engineering)

**Ref**: ADR-001 (microservice landscape — agg-sso-graph aggregator + AWS DynamoDB exception cho device token), ADR-002 (GraphQL aggregator), ADR-007 (Redis cache, NOT system of record).

---

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | AWS SDK default credential chain |
| Credential sources (priority order) | 1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`); 2. IAM role (EC2/ECS/Lambda); 3. AWS credentials file (`~/.aws/credentials`) |
| Credential rotation | IAM role auto-rotated by AWS; static creds rotated manually |
| Storage | IAM role attached to runtime; no creds in code |
| Scope / permission | DynamoDB `PutItem`, `DeleteItem`, `BatchWriteItem`, `Scan` on table `${DEVICE_TOKEN_TABLE}` only |
| Multi-tenant strategy | Tenant data merged trong same table với `tenant_id` attribute — verify access pattern enforces tenant isolation in code |

### 3.2 Webhook security

N/A — DynamoDB không gửi webhook.

---

## 4. Endpoints / Operations Used

| # | Operation | SDK Command | Why we call it | Trigger |
|---|---|---|---|---|
| 1 | Save token (with cleanup) | `ScanCommand` + `BatchWriteCommand` (delete) + `PutCommand` | Register new device token; dedup by notification_token | `Mutation.saveToken(notificationToken, platform)` after FCM/APNs token register |
| 2 | Delete token | `DeleteCommand` with `ConditionExpression: user_id = :userId` | Unregister device on logout | `Mutation.logout(deviceId)` |

---

## 5. Request / Response Contracts

### 5.1 Save token flow

```typescript
// 1. Decode JWT từ Authorization header (no signature verify — assume Kong validated)
const claims = decodeJwt(authHeader);
const userId = claims.sub;
const tenantType = claims['custom:tenant_type'];
const sourceSystem = claims['custom:source_system'];
const tenantId = claims['custom:tenant_id'];

// 2. Scan to find existing tokens với same notification_token
const scanResult = await docClient.send(new ScanCommand({
  TableName: DEVICE_TOKEN_TABLE,
  FilterExpression: 'notification_token = :token',
  ExpressionAttributeValues: { ':token': notificationToken }
}));

// 3. Batch delete duplicates (chunks of 25 — DynamoDB BatchWriteItem limit)
for (chunk of chunks(scanResult.Items, 25)) {
  await docClient.send(new BatchWriteCommand({
    RequestItems: {
      [DEVICE_TOKEN_TABLE]: chunk.map(item => ({
        DeleteRequest: { Key: { device_id: item.device_id } }
      }))
    }
  }));
}

// 4. Put new device record
const deviceId = uuidv4();
await docClient.send(new PutCommand({
  TableName: DEVICE_TOKEN_TABLE,
  Item: {
    device_id: deviceId,            // PK (UUID v4)
    notification_token: notificationToken,
    platform: platform,             // iOS / Android / Web
    tenant_type: tenantType,
    source_system: sourceSystem,
    user_id: userId,
    tenant_id: tenantId             // Optional
  }
}));

return { success: true, deviceId };
```

### 5.2 Delete token flow

```typescript
const claims = decodeJwt(authHeader);
const userId = claims.sub;

await docClient.send(new DeleteCommand({
  TableName: DEVICE_TOKEN_TABLE,
  Key: { device_id: deviceId },
  ConditionExpression: 'user_id = :userId',
  ExpressionAttributeValues: { ':userId': userId }
}));
```

→ ConditionExpression đảm bảo user chỉ xóa token của chính mình (ownership check).

### 5.3 Item schema

| Attribute | Type | Description |
|---|---|---|
| `device_id` | String (PK) | UUID v4, primary key |
| `notification_token` | String | Firebase/APNs/FCM token |
| `platform` | String | `iOS` / `Android` / `Web` |
| `tenant_type` | String | From JWT `custom:tenant_type` |
| `source_system` | String | From JWT `custom:source_system` |
| `user_id` | String | From JWT `sub` |
| `tenant_id` | Number? | Optional, from JWT `custom:tenant_id` |

**GSIs tồn tại** trong table (user_id-index, tenant-index, source_system-index — tạo cho `gf-notification` sử dụng theo ADR-006 shared registry) nhưng **agg-sso-graph KHÔNG dùng GSI** — hiện dùng Scan-based lookup theo `notification_token` → không scale tốt ở high volume. Cần GSI on `notification_token` nếu volume tăng.

> **Shared table note (ADR-006)**: Table `${DEVICE_TOKEN_TABLE}` shared với `gf-notification`. Attribute names divergent: agg-sso-graph dùng snake_case (`notification_token`, `platform`), gf-notification dùng camelCase (`fcmToken`, `endpointArn`). Cần ADR-006 amendment hoặc source fix để unify schema.

---

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect | Action |
|---|---|---|---|
| Network timeout | AWS SDK timeout | SDK error | Single retry (SDK built-in retry); surface error nếu fail |
| AWS 5xx (Throttling) | `ProvisionedThroughputExceededException` | SDK error name | Retry với backoff (SDK auto) |
| Conditional check failed | Delete with wrong userId | `ConditionalCheckFailedException` | Log + ignore (user không own device) |
| AWS 4xx (validation) | Schema mismatch | SDK error | Surface error; alert ops |
| Scan timeout (large table) | Scan operation slow | Latency monitoring | TBD: Add GSI on `notification_token` |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| AWS SDK retry | Default (3 retries with exponential backoff) |
| Application retry | None additional |
| Idempotency | Save: idempotent theo notification_token (Scan + delete duplicates trước khi Put); Delete: idempotent (delete absent key = no-op) |

### 6.3 Circuit breaker

Không có circuit breaker. AWS SDK retry là sufficient cho hầu hết failures.

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Save token | Idempotent — Scan-then-delete-duplicates pattern |
| Delete token | Idempotent — same delete = no-op |
| Order | N/A (key-value store, no ordering across keys) |
| Replay safety | Safe — both ops idempotent |

---

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags |
|---|---|---|
| `agg_sso.dynamodb.put` | counter | `table`, `status` |
| `agg_sso.dynamodb.delete` | counter | `table`, `status` |
| `agg_sso.dynamodb.scan` | counter | `table`, `itemCount` |
| `agg_sso.dynamodb.duration` | histogram | `op` |
| `agg_sso.dynamodb.scan.duration` | histogram | (track Scan slowness) |

### 8.2 Logging

- Mỗi operation log: `correlation_id`, `userId`, `tenantId`, `op`, `latency_ms`
- KHÔNG log notification_token raw (PII risk — Firebase token có thể impersonate user push)
- KHÔNG log full JWT

### 8.3 Tracing

OpenTelemetry auto-instrumentation cho AWS SDK (nếu `OTEL_ENABLED=true`):
- Span name: `dynamodb.PutItem`, `dynamodb.DeleteItem`, `dynamodb.Scan`
- Attribute: `aws.dynamodb.table_names`, `aws.dynamodb.consumed_capacity`

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| ProvisionedThroughputExceeded | > 1% over 5 min | P2 | SSO team |
| Scan latency p99 | > 2s | P3 | SSO team — needs GSI |
| Save error rate | > 5% over 5 min | P2 | SSO team |

---

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | AWS DynamoDB — 99.99% (multi-region 99.999%) |
| Our SLA exposed | Push notification critical — token registration must succeed |
| Rate limits | DynamoDB on-demand: per-account default; provisioned: per-table read/write capacity |
| Quota strategy | On-demand mode preferred (auto scale); fall back to provisioned with auto-scaling cho cost optimization |
| Cost | Pay-per-request (on-demand): $1.25 per million WRU + $0.25 per million RRU; storage $0.25/GB/month |
| Cost owner | Platform team (AWS budget) |

---

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Yes — notification_token (đủ để target push to specific device); user_id; tenant_id |
| Data residency | AWS region (`ap-southeast-1` Singapore default) — verify compliance với data residency policy |
| Regulatory | GDPR/PII applicable nếu user EU; tenant data subject to tenant-specific policy |
| DPA | AWS DPA standard |
| Data retention | TBD — implement DynamoDB TTL attribute cho auto-cleanup tokens >90 days inactive |
| Right-to-erasure flow | On user deletion request, scan + delete all items với `user_id = :userId` |

---

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| Table | `nonprod-dev-ac-device-token` | `prod-ac-device-token` |
| Region | `ap-southeast-1` | `ap-southeast-1` |
| Credentials | Dev IAM role (low-privilege) | Prod IAM role (least-privilege scoped to table) |

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock DynamoDBDocumentClient |
| Integration | LocalStack DynamoDB hoặc AWS DynamoDB local |
| Contract | Verify item schema (device_id, notification_token, platform, ...) |
| Chaos | Inject ProvisionedThroughputExceeded; verify retry behavior |
| Cleanup | Verify TTL cleanup (when implemented) |

---

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| Throttling errors burst | Switch to on-demand mode; investigate access pattern |
| Scan timeout | Add GSI on `notification_token`; migrate to Query-based dedup |
| Token leak | Revoke FCM/APNs project credentials; clear table (last resort) |
| User data deletion request | Scan with `FilterExpression: user_id = :userId` + batch delete |
| GDPR right-to-erasure | Scan + batch delete by user_id |
| AWS DynamoDB outage | Push notification dispatch degraded; client app falls back to in-app polling |

---

## 14. Forbidden patterns

- ❌ Hardcode AWS credentials trong source — IAM role / env var / credentials file (default chain).
- ❌ Skip JWT signature verification at upstream — `firebase.service` decode JWT no-verify; phụ thuộc Kong validate (anti-pattern hardening required, ADR-003 gap).
- ❌ Log full `notification_token` raw — Firebase token đủ để impersonate user push (PII).
- ❌ Log full JWT raw — security risk.
- ❌ Use `Scan` cho large table without GSI — performance degrade ở high volume; cần GSI on `notification_token`.
- ❌ Skip ConditionExpression `user_id = :userId` khi delete — risk user delete other user's token.
- ❌ Persist non-token data vào table này — single purpose only (device token store).
- ❌ Bypass DynamoDB TTL cleanup policy — dead tokens accumulate (cost + privacy).
- ❌ Cross-region replication không cần thiết — single region enough cho push token use case.

## 15. References

- HLD caller: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- API contract caller: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — agg-sso-graph + AWS DynamoDB exception cho device token), ADR-002 (GraphQL aggregator), ADR-003 (tenant + SSO boundary; gap ghi nhận về `jwt.decode`), ADR-007 (Redis cache, NOT system of record — DynamoDB là durable token store, không phải cache)
- Related INTEG: [INTEG-BFF-agg-sso-graph.md](INTEG-BFF-agg-sso-graph.md) (caller BFF), [INTEG-EXT-sec-iam-service.md](INTEG-EXT-sec-iam-service.md) (login flow tạo session, saveToken sau)
- Provider docs: https://docs.aws.amazon.com/dynamodb/
- KG: [agg-sso-graph.knowledge-graph.yaml](../../Execution/knowledge-graphs/agg-sso-graph.knowledge-graph.yaml) — UserDevice entity + firebase module
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v2: (M1) clarify GSI documentation — 3 GSIs tồn tại trong table (cho gf-notification) nhưng agg-sso-graph KHÔNG sử dụng (dùng Scan); (M2) thêm ADR-006 shared table context + attribute name divergence note (snake_case vs camelCase); (L3) thêm KG reference. |
| 2026-05-07 | v1 | Initial integration contract `agg-sso-graph` -> AWS DynamoDB (Firebase device token store): AWS SDK v3 (`@aws-sdk/client-dynamodb`, `lib-dynamodb`) với IAM role / default credential chain, key operations PutItem / DeleteItem / BatchWriteItem / Scan trên table `${DEVICE_TOKEN_TABLE}` (default `nonprod-dev-ac-device-token`); failure mode SDK retry default 3 lần exponential backoff, không có circuit breaker app-level, ConditionalCheckFailed log + ignore; PII risk notification_token cấm log raw. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
