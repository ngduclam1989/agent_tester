---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: agg-sso-graph
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/agg-sso-graph-graphql.md
---

# HLD — `agg-sso-graph`

## 1. Overview

`agg-sso-graph` là **GraphQL aggregation gateway** cho các luồng **SSO/identity-adjacent** của Garage: auth/session, notification read model, conversation helper, Firebase device token và Superset guest token/proxy. Stateless edge — Node.js 22 + Apollo Server 4 + Express, gom **4 downstream service** (`sec-iam-service`, `ct-notihub-notification`, `ct-conversation-client`, Superset) thành 1 GraphQL endpoint. Khác với `agg-garage-graph`: service này có **local persistence DynamoDB** cho device token table (Firebase notification routing).

**Trách nhiệm:**
- Auth/session gateway: 9 operation (login + logout + refreshToken + forgot password × 2 + first change password + change password + me + deleteUser).
- Notification gateway: 4 operation (list, unreadCount, markAllRead, markByIdRead) — read model passthrough.
- Conversation gateway: 15 operation (list, group, upload, token, routing, end-call, member management).
- Firebase device token: `saveToken` mutation — decode JWT + delete duplicate + put DynamoDB item.
- Superset: `supperSetQuestToken` query (RLS theo `tenant_id` từ JWT) + `/supperset/*` HTTP proxy.
- Upload adapter: multipart GraphQL upload (multer memoryStorage 30MB) → forward `ct-conversation-client`.
- Header propagation: `Authorization`, `x-client-type`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`.
- Observability: OpenTelemetry init trước Express, Prometheus `/metrics`, request id middleware.

**Owned epic**: cross-cutting infrastructure — sister gateway của `agg-garage-graph` cho SSO/identity flow. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌──────── agg-sso-graph  (Node 22 · Apollo Server 4) ─────────┐
│  ┌──────────────────────────────────────────┐               │
│  │ Express (PORT 4007/4000)                 │               │
│  │  requestId · helmet · CORS(*) · body 10mb│               │
│  └──────────────────────┬───────────────────┘               │
│  ┌────────────────────▼───────┐ ┌────────────┐              │
│  │ processUploads (multer 30MB)│ │ Apollo Srv4│             │
│  │  Upload scalar · ops+map    │ │ /graphql   │             │
│  └──────────────┬─────────────┘ └─────┬──────┘              │
│  ┌──────────────▼───────────────────▼─────────┐             │
│  │ Schema composition (5 modules):            │             │
│  │  auth(9) · notification(4) ·               │             │
│  │  conversation(15) · firebase(saveToken) ·  │             │
│  │  supper-set(guest token)                   │             │
│  └──────────────────────┬─────────────────────┘             │
│  ┌─────────────────────▼───────┐                            │
│  │ ApiClient+BaseService(Axios)│────────────────────────────┼─► sec-iam-service
│  │  timeout 60s · correlation  │────────────────────────────┼─► ct-notihub-notification
│  │                             │────────────────────────────┼─► ct-conversation-client
│  └─────────────────────────────┘                            │
│  ┌─────────────────────────────┐                            │
│  │ DynamoDBDocumentClient      │────────────────────────────┼─► DynamoDB DEVICE_TOKEN_TABLE (ap-southeast-1)
│  │  Put/Scan/BatchWrite/Delete │                            │
│  └─────────────────────────────┘                            │
│  ┌─────────────────────────────┐                            │
│  │ Superset proxy (rewrite)    │────────────────────────────┼─► Superset (guest token + iframe proxy)
│  └─────────────────────────────┘                            │
│  /health · /check-env · /metrics · OTel (OTLP)              │
│                       [Stateless — no SQL DB]               │
└─────────────────────────────────────────────────────────────┘
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Apollo Server 4 + static module imports | 5 module identity-adjacent — không cần dynamic discovery như agg-garage-graph | TECHSTACK §gateway |
| KHÔNG enforce auth ở gateway level | Resolver chỉ forward token; downstream IAM/service là authorization SoT | open HLD-SSO-GRAPH-001 (cao — verify đủ?) |
| `jwt.decode` (không verify signature) cho Firebase + Superset RLS | Trust boundary giả định caller đã qua gateway/ingress verify | open HLD-SSO-GRAPH-002 (cao) |
| Local DynamoDB cho device token (khác agg-garage-graph stateless) | Firebase routing cần lookup nhanh theo user/tenant; không phù hợp cho downstream service | source `firebase.service.ts` |
| Scan DynamoDB by `notification_token` để xoá duplicate | Đơn giản, không cần GSI ở scale hiện tại | open HLD-SSO-GRAPH-003 (cao — cần GSI khi volume lớn) |
| Superset proxy + RLS guest token | BI dashboard embedded với row-level security theo `tenant_id` JWT claim | source `supperSetQuestToken` |
| `helmet` `frameguard=false` cho Superset iframe | Cho phép embed dashboard | source `server.ts` |
| Multer memoryStorage 30MB | Đơn giản; trade memory cho disk I/O | open HLD-SSO-GRAPH-008 (concurrency limit) |
| Static schema merge thay vì dynamic | 5 module fixed — simpler hơn dynamic loader | source `graphql/index.ts` |
| Auth middleware cho Superset proxy đang comment | Implementation chưa hoàn thiện | open HLD-SSO-GRAPH-004 (cao — security gap) |
| Naming `supper-set` / `supperSetQuestToken` (typo) | Public contract — sửa cần migration | open HLD-SSO-GRAPH-010 |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| Web / Mobile | GraphQL HTTPS POST `/graphql` | Auth/session, notification, conversation, Firebase saveToken, Superset guest token |
| Mobile (multipart) | Multipart GraphQL upload | File upload vào conversation group |
| Browser (Superset iframe) | HTTPS proxy `/supperset/*` | BI dashboard embedded |
| Ops / monitoring | HTTPS GET `/health`, `/metrics`, `/check-env` | Healthcheck + Prometheus scrape + env (non-prod) |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `sec-iam-service` | Sync REST (Axios) + Bearer JWT forward | 9 auth endpoint (login/logout/refresh/forgot/change/me/deleteUser) |
| `ct-notihub-notification` | Sync REST + Bearer | 4 notification endpoint (list/unread/mark-read × 2) |
| `ct-conversation-client` | Sync REST + Bearer + x-api-key (cho upload) | 15 conversation endpoint (list, group, upload, token, routing, end-call, member ops) |
| Superset | Sync REST (admin login + CSRF + guest token) + HTTP proxy | Guest token + iframe dashboard |
| DynamoDB `DEVICE_TOKEN_TABLE` | AWS SDK v3 DocumentClient | PutCommand + ScanCommand + BatchWriteCommand + DeleteCommand |
| Actuator + OTLP | Observability | Health/metrics/prometheus + OpenTelemetry |

> **KHÔNG có Kafka / Temporal / outbox / DB SQL** — service stateless ngoài DynamoDB device token table.

## 5. Data Ownership

**Owned (DynamoDB)** — 1 table:

| Table | Vai trò |
|---|---|
| `${DEVICE_TOKEN_TABLE:nonprod-dev-ac-device-token}` | Device token cho Firebase/cloud notification routing |

**Item schema**:

| Field | Nguồn | Sensitive |
|---|---|---|
| `device_id` | UUID generated server-side (PK) | — |
| `notification_token` | `SaveTokenInput.notificationToken` | ⚠️ Sensitive — push notification target |
| `platform` | `SaveTokenInput.platform` (iOS/Android/Web) | — |
| `user_id` | JWT claim `sub` | Internal personal identifier |
| `tenant_id` | JWT claim `custom:tenant_id` (parse int) | Tenant context |
| `tenant_type` | JWT claim `custom:tenant_type` | Tenant context |
| `source_system` | JWT claim `custom:source_system` | Routing context |

**Operations**:
- `PutCommand` khi `saveToken` mutation (tạo `device_id` UUID, ghi token mới)
- `ScanCommand` theo `notification_token` (xoá duplicate trước khi insert)
- `BatchWriteCommand` delete duplicate (batch 25 item — DynamoDB limit)
- `DeleteCommand` với condition `user_id = :userId` khi logout có `deviceId`

**KHÔNG own**:
- User / password / session source-of-truth (`sec-iam-service` SoT)
- Notification content + read state SoT (`ct-notihub-notification` SoT — gateway chỉ passthrough read model)
- Conversation/group/chat/call SoT (`ct-conversation-client` SoT)
- Superset dashboard / data source (Superset + BI platform)
- Full authorization policy (downstream IAM/service policy; gateway chỉ forward token/header)
- Durable database SQL cho module khác (chỉ DynamoDB device token)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| GraphQL passthrough p95 (single resolver, warm downstream) | ≤ 300ms |
| Auth login p95 (incl. IAM call) | ≤ 800ms |
| Notification list p95 (paged) | ≤ 400ms |
| Firebase saveToken p95 (incl. JWT decode + scan + put) | ≤ 600ms |
| Superset guest token p95 (admin login + CSRF + guest token) | ≤ 1.5s (3 sequential Superset call) |
| Superset proxy p95 | passthrough (~50ms overhead) |
| Upload throughput | ≤ 30MB per file (multer memoryStorage) |
| Body parser limit | 10mb (`BODY_PARSER_LIMIT=10mb`) |
| Default downstream timeout | 60s (`DEFAULT_TIMEOUT=60000`) |
| Concurrent upload | giới hạn theo memory pod (open HLD-SSO-GRAPH-008) |
| DynamoDB scan complexity | O(n) — full table scan; cần GSI khi scale (open HLD-SSO-GRAPH-003) |
| Multi-replica | stateless — DynamoDB là shared state; HPA theo CPU/RPS |
| Helmet | enabled, frameguard=false cho Superset iframe |
| CORS | `origin="*"`, `credentials=true` (⚠️ production cần siết) |
| Introspection | non-production only |

## 7. Forbidden Actions

- ❌ Add resolver-level auth check ở gateway (vi phạm design — gateway forward token, downstream là authorization SoT; thêm check tạo confusion về trust boundary).
- ❌ Verify JWT signature ở gateway mà không update verify chain ở downstream (open HLD-SSO-GRAPH-002 — current `jwt.decode` không verify; nếu thêm verify cần align signing key + verification chain với IAM).
- ❌ DynamoDB Scan ở scale lớn không có GSI (open HLD-SSO-GRAPH-003 — `saveToken` scan by `notification_token` cost O(n); phải migrate sang GSI khi volume tăng).
- ❌ Public expose Superset proxy mà chưa enable auth middleware (open HLD-SSO-GRAPH-004 — `authMiddleware` đang comment toàn bộ → bypass auth; phải enable trước khi production).
- ❌ Add module mới với DB SQL local (vi phạm boundary — gateway chỉ stateless + DynamoDB cho Firebase; module mới cần cân nhắc gateway pattern hoặc tách service riêng).
- ❌ Add tenant_id-scoped business data local (gateway không phải SoT cho data nghiệp vụ; downstream service own tenant data).
- ❌ Persist user/password/session locally (`sec-iam-service` SoT — không tạo shadow auth state ở gateway).
- ❌ CORS `origin="*"` + `credentials=true` ở production (open HLD-SSO-GRAPH-007 — XSRF risk; phải siết origin theo prod ingress).
- ❌ Public expose `/check-env` ở production (open HLD-SSO-GRAPH-009 — non-prod trả env đầy đủ; production trả `{}` nhưng phải đảm bảo network policy chặn ngay từ ingress).
- ❌ Tăng `multer.memoryStorage` limit > 30MB mà không sync ingress + concurrency control (open HLD-SSO-GRAPH-008 — N×30MB memory exhaustion).
- ❌ Sửa schema `supperSetQuestToken` / `supper-set` typo mà không có deprecation plan (open HLD-SSO-GRAPH-010 — public contract đã được client dùng).
- ❌ Schema declaration trùng `RefreshTokenOutput` / `RefreshTokenInput` / `RefreshTokenResponse` không cleanup (open HLD-SSO-GRAPH-005 — schema merge có thể fail tooling validation).
- ❌ Resolver trả `__typename` không match schema (open HLD-SSO-GRAPH-006 — `QuestTokenSupperSetOutput` chưa định nghĩa trong schema; runtime response có thể fail GraphQL validation).
- ❌ Log raw `Authorization` / `notification_token` / cookie / Superset session vào log tập trung (sensitive data — cần masking layer).
- ❌ DynamoDB BatchWrite > 25 item (DynamoDB hard limit — phải chunk).

## 8. References

- **TECHSTACK**: §gateway, §http-client, §observability, §dynamodb
- **API spec**: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md) — GraphQL schema 5 module: auth (9 ops), notification (4 ops), conversation (15 ops), firebase (1), supper-set (1); request context, header propagation, error union format.
- **Events spec**: ⚠️ **không có** — service stateless, không publish/consume Kafka. Surface async chỉ là DynamoDB write.
- **Workflows**: ⚠️ **không có file riêng** — service là pure passthrough gateway, không có workflow dài hạn. Auth/session flow xem trong:
  - `agg-garage-graph-HLD.md` cross-link (sister gateway pattern)
  - Downstream service docs cho business logic chi tiết
- **Data model**: ⚠️ **không có DB SQL** — DynamoDB device token schema mô tả tại §5 trong HLD này.
- **Cross-link HLD**:
  - [agg-garage-graph-HLD.md](agg-garage-graph-HLD.md) — sister gateway (Garage business) — pattern chung
  - [gf-hrms-HLD.md](gf-hrms-HLD.md) — sister identity service (employee/user roster qua IAM)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v2 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (Express → uploads/Apollo → Schema 5 modules → ApiClient/DynamoDB/Superset) + connector `┬`/`▼`; **external side-exit `───┼─►`** đầy đủ: sec-iam-service · ct-notihub-notification · ct-conversation-client (ApiClient) + DynamoDB DEVICE_TOKEN_TABLE + Superset (guest token); stateless (no SQL DB) ở footer. Không đổi §1/§3-§8. |
| 2026-05-07 | v1 | Initial HLD cho `agg-sso-graph`: GraphQL aggregation gateway (Node.js 22 + Apollo Server 4 + Express, port 4007/Docker 4000) cho SSO/identity flow Garage, 5 module — auth (9 ops, `sec-iam-service`), notification (4 ops, `ct-notihub-notification`), conversation (15 ops, `ct-conversation-client`), firebase (`saveToken` mutation → DynamoDB `DEVICE_TOKEN_TABLE` 3 GSI), supper-set (guest token + `/supperset/*` proxy). Local persistence DynamoDB cho device token (Put + Scan + BatchWrite + Delete by `notification_token`). Header propagation (`Authorization`, `x-client-type`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`), multer 30MB upload, OpenTelemetry + Prometheus `/metrics`, `/check-env` non-prod. KHÔNG có Kafka/Temporal/SQL DB. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`. |
