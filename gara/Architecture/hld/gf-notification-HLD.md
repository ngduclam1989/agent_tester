---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-notification
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-notification-api.md
  - ../events/notification-events.md
  - ../data/gf-notification-data-model.md
---

# HLD — `gf-notification`

## 1. Overview

`gf-notification` là service tiếp nhận **notification request**, render nội dung theo template Mustache, fan-out tới user inbox (in-app) và publish push delivery payload sang Kafka cho tầng device delivery xử lý tiếp. Service cung cấp **public API** cho user đọc inbox + mark read, và **protected API** cho service nội bộ tạo notification request + template management. PostgreSQL là system-of-record cho 7 bảng (request, notification, delivery, user inbox, template, routing, inbox idempotency); DynamoDB lookup device token (chưa wire vào delivery path chính).

**Trách nhiệm:**
- Tiếp nhận request từ 2 nguồn: `POST /protected/v1/notifications` và Kafka `notification-request` (cùng contract `NotificationRequestDto`).
- Render template (Mustache) + validate placeholder theo `NotificationType`.
- Audience resolution: explicit `userIds` → tenant users (TenantClient) → CARDOCTOR employees (HrmClient).
- Fan-out theo `channel`: `INAPP` / `PUSH` / `BOTH` — tạo `UserNotification` (inbox) hoặc `NotificationDelivery` (push queue).
- 3 scheduler claim batch: in-app processing (2s), push delivery (5s), inbox cleanup (cron 03:00).
- Kafka idempotency qua bảng `inbox` (theo `messageId`); DLQ qua `DeadLetterPublishingRecoverer`.
- Public read API: list/unread count/mark single + all (JWT `sub` extract).

**Owned epic**: cross-cutting platform — notification fanout cho mọi service. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌────── gf-notification  (Java 21 · ddl-auto · DynamoDB) ───────┐
│  ┌──────────────┐ ┌────────────────┐ ┌──────────┐             │
│  │ Notification │ │ InternalNotifi-│ NotifCrea-│              │
│  │ Ctrl /api/v1 │ │ cationCtrl     │ │ tionCons-│             │
│  │ (JWT)        │ │ /protected+tmpl│ │ umer(in) │             │
│  └─────┬────────┘ └────────┬───────┘ └────┬─────┘             │
│  ┌─────▼───────────────────▼──────────────▼─────┐             │
│  │ APP / DOMAIN SERVICES                        │             │
│  │  UserNotificationServiceImpl (list/unread/   │             │
│  │   mark)· NotificationServiceImpl (Mustache   │             │
│  │   render·audience·channel fanout INAPP/PUSH)·│             │
│  │  NotificationTemplateServiceImpl             │             │
│  │   3 schedulers: in-app 2s·push 5s·cleanup 3am│             │
│  └─────┬───────────────────────────┬────────────┘             │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐              │
│  │ JPA ddl-   │ │ Kafka produc-│ │ HttpClients │              │
│  │ auto (no   │ │ er notifica- │ │ (x-api-key) │──────────────┼─► ct-saas-tenant (users)
│  │ Flyway)    │ │ tion (push)  │ │             │──────────────┼─► ct-hrm (employees/search)
│  │[notif] 7tbl│ │ acks=all·idem│ └─────────────┘              │
│  └─────┬──────┘ └──────┬───────┘ ┌─────────────┐              │
│  ┌─────────────────────────────┐ │ DynamoDB    │──────────────┼─► DynamoDB device-token (3 GSI, open HLD-007)
│  │ /api/v1/* │ /protected/* │   │ │ UserDevice  │             │
│  │ Actuator + OTLP             │ │ Repository  │              │
│  └─────────────────────────────┘ └─────────────┘              │
└───────┴──────────────┴────────────────────────────────────────┘
        ▼                ▼
   PostgreSQL [dev-gf-notification]  Kafka P: notification (push) ;
   7 tables · ddl-auto · Hikari 20   C: notification-request
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Tách `NotificationRequest` (input) và `Notification` (rendered) | Audit input + lưu content sau render cho hiển thị/replay | open HLD-NOTIFICATION-008 (PII risk) |
| Dùng scheduler cho in-app fanout thay vì sync trong request | Fanout audience lớn (vd broadcast tenant) — tách intake khỏi xử lý | source `NotificationInAppProcessingJob` |
| Dùng `NotificationDelivery` table queue trước khi publish Kafka | Có retry + lock + attemptCount ở DB trước khi đưa payload ra topic | open HLD-NOTIFICATION-009 (mark failed timing) |
| Inbox table cho Kafka idempotency theo `messageId` | Chống duplicate event khi Kafka redeliver | events `_CONVENTIONS.md` |
| Template global theo `NotificationType` (không tenant-scoped) | Đơn giản — 1 template cho 1 type; tenant-specific phải có ADR | open HLD-NOTIFICATION-008 |
| Channel-based fanout: `INAPP` / `PUSH` / `BOTH` | INAPP → user inbox; PUSH → delivery queue; BOTH → cả hai | source `createNotification` |
| `FOR UPDATE SKIP LOCKED` cho scheduler claim | Multi-replica safe; mỗi notification/delivery chỉ 1 instance xử lý | TECHSTACK §scheduler |
| DLQ qua `DeadLetterPublishingRecoverer` + non-retryable enum | Phân biệt lỗi tạm thời (retry) vs lỗi data (DLQ) | source `KafkaConfig` |
| DynamoDB cho device token | Lookup theo user/tenant/source system với 3 GSI | open HLD-NOTIFICATION-007 (chưa wire) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF passthrough cho Mobile / Web client) | Sync REST `/api/v1/notifications` (JWT bearer) | List inbox, unread count, mark read (single + all) |
| `gf-marketing` | Sync REST `/protected/v1/notifications` + `/template` (x-api-key) | Tạo notification request + template/routing definition |
| Service nội bộ (`gf-sales`, `gf-erp-agent`, `gf-inventory`, `gf-purchase`) | Async qua Kafka `notification-request` | Notification request bất đồng bộ (cùng contract `NotificationRequestDto`) |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `ct-saas-tenant` | Sync REST + x-api-key | `GET /protected/v1/saas-tenant/users` audience resolution tenant |
| `ct-hrm` | Sync REST + x-api-key | `POST /protected/v1/employees/search` audience CARDOCTOR |
| Kafka `notification` (push topic) | Async publish | `KafkaTemplate.send().get()` synchronous publish — payload `NotificationCreatedDto` |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev-gf-notification}` — 7 tables, Hikari pool 20/5 |
| DynamoDB device-token | NoSQL | Lookup device token theo user/tenant/source system (3 GSI: `user_id-index`, `tenant-index`, `source_system-index`) |
| AWS SNS/SQS clients | Sync (bean ready) | ⚠️ chưa wire vào path chính |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `dev-gf-notification` schema)** — chi tiết physical schema xem [data/gf-notification-data-model.md](../data/gf-notification-data-model.md):

| Aggregate | Bảng | Trách nhiệm |
|---|---|---|
| Request intake | `notification_requests` | Input request: channel, audience, placeholders, campaign/source — `tenant_id` + `tenant_type` |
| Rendered notification | `notifications` | Title/content đã render, route target, params, `nextStage` (lifecycle scheduler) — `tenant_id` |
| Push delivery queue | `notification_deliveries` | Queue payload chờ publish Kafka; `attemptCount`, `lockUntil`, `errorMessage` |
| User inbox | `user_notifications` | Notification fan-out tới từng IAM user; `isRead`, `readAt` |
| Template | `notification_templates` | Mustache title/content theo `NotificationType` (KHÔNG tenant-scoped) |
| Routing definition | `notification_routing_definitions` | `targetClient` × `targetRoute` × `paramKeys` per template |
| Kafka idempotency | `inbox` | `messageId` PK; status `PROCESSING/PROCESSED`; retention 7 ngày cleanup |

**Owned (DynamoDB)**:

| Table | Vai trò |
|---|---|
| `nonprod-dev-ac-device-token` | Device token lookup; `userId` + `sourceSystem` + `tenantId` + `tenantType` + `deviceId` + `fcmToken` + `endpointArn` (3 GSI) |

**State machines**:

| Field | Values |
|---|---|
| `Notification.nextStage` | `INITIAL` → `BUILDING_INAPP` → `PROCESSING` → `PROCESSED` |
| `NotificationDelivery.status` | `PENDING` → `SENDING` → `SENT` / `FAILED` |
| `Inbox.status` | `PROCESSING` → `PROCESSED` |
| `NotificationChannel` | `INAPP` / `PUSH` / `BOTH` |
| `TargetClient` | `DRIVER (MOBILE)` / `VENDOR (WEB)` / `GARAGE (MOBILE)` / `CARDOCTOR (WEB)` |

**KHÔNG own**:
- Campaign intent (`gf-marketing` SoT)
- Customer / segment (`gf-customer`)
- Tenant user master (`ct-saas-tenant`)
- HR employee profile (`ct-hrm`)
- Provider-level delivery (FCM/APNs/SMS — consumer của `notification` topic chịu trách nhiệm — open HLD-NOTIFICATION-007)
- Device registration API (chỉ lookup, không expose register/unregister)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Public unread-count p95 | ≤ 100ms |
| Public list inbox p95 (paged 20) | ≤ 300ms |
| Public mark-as-read p95 | ≤ 150ms |
| Protected create notification p95 (template render + save) | ≤ 500ms |
| In-app fanout latency (request → user inbox visible) | ≤ 5s (scheduler 2s delay + audience fetch) |
| Push delivery latency (request → Kafka publish) | ≤ 10s (scheduler 5s delay + Kafka send) |
| In-app job | fixed delay **2000ms**, fetch size **10** (`SCHEDULER_NOTIFICATION_BUILDING_INAPP_*`) |
| Delivery job | fixed delay **5000ms**, fetch size **10**, **max 3 attempts** |
| Inbox cleanup | cron `0 0 3 * * ?`, retention **7 ngày** |
| Kafka consumer retry | max **3** attempts, backoff 1000ms; non-retryable: `InvalidDataException`, `ResourceNotFoundException`, `JsonProcessingException` → DLQ ngay |
| Kafka producer | `acks=all`, idempotent, retries=3, sync `send().get()` |
| Hikari pool | max 20, min idle 5, connection timeout 20s |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Multi-replica scheduler | `FOR UPDATE SKIP LOCKED` — safe |
| Schema migration | ⚠️ Flyway **disabled** + JPA `ddl-auto=update` (open HLD-NOTIFICATION-001) |

## 7. Forbidden Actions

- ❌ `markAsRead(id)` không scope theo current user (open HLD-NOTIFICATION-002 — user A có thể mark inbox của user B nếu đoán được id; phải dùng `findByIdAndUserId` hoặc `mark-as-read-push` qua `requestId`).
- ❌ Skip inbox idempotency check khi consume `notification-request` event (duplicate processing — vi phạm `_CONVENTIONS.md` §inbox).
- ❌ Bật JPA `ddl-auto=update` ở production mà không enable Flyway (schema drift; Flyway hiện disabled — open HLD-NOTIFICATION-001).
- ❌ Render template với missing placeholder fail-silent (publish nội dung còn `{{placeholder}}` — open HLD-NOTIFICATION-006; phải fail-fast với `InvalidDataException`).
- ❌ Mark delivery `SENT` khi `KafkaTemplate.send().get()` chưa nhận ack (race — phải đợi future complete; open HLD-NOTIFICATION-009 — log lỗi nhưng không mark failed lần đầu).
- ❌ Tạo `NotificationRoutingDefinition` rỗng khi không match `TargetClient` (open HLD-NOTIFICATION-005 — phải throw `ResourceNotFoundException` thay vì trả route trống → push delivery sai target).
- ❌ Hardcode AWS access/secret key trong source (phải dùng IAM role hoặc env / secret manager — credential provider chain default).
- ❌ Log raw notification title/content (PII — campaign content có thể chứa user data; cần masking nếu log tập trung).
- ❌ Tạo template tenant-specific khi schema chưa có `tenant_id` column (open HLD-NOTIFICATION-008 — phải có ADR và migration trước).
- ❌ Public controller substring `Bearer ` mà không validate format (open HLD-NOTIFICATION-010 — `IndexOutOfBoundsException` nếu header thiếu prefix; phải dùng `JwtUtils` validate trước).
- ❌ In-app job mark notification `PROCESSING` mà không có cơ chế recover khi job crash (open HLD-NOTIFICATION-003 — notification kẹt forever; cần `lock_until` hoặc recover quá hạn).
- ❌ Trả `userResponse.getData() != null` để conclude "không có employee" (open HLD-NOTIFICATION-004 — logic ngược; phải kiểm `getData() == null` hoặc empty).

## 8. References

- **TECHSTACK**: §scheduler, §kafka, §dynamo-db, §error-handling, §http-client
- **API spec**: [gf-notification-api.md](../api/gf-notification-api.md) — Public 5 endpoints (unread/list/mark × 3), Protected 2 endpoints (create + template).
- **Events spec**: [notification-events.md](../events/notification-events.md) — inbound `notification-request` + outbound `notification` topic; envelope `KafkaMessageWrapper` + `NotificationCreatedDto` payload.
- **Workflows**:
  - [notification-dispatch-flow.md](../workflows/notification-dispatch-flow.md) — full flow: request intake → template render → audience resolution → fanout in-app + push → scheduler claim → Kafka publish.
- **Data model**: [gf-notification-data-model.md](../data/gf-notification-data-model.md) — 7 PostgreSQL tables + DynamoDB UserDevice; enum catalog (`DeliveryStatus`, `NotificationChannel`, `NotificationStage`, `NotificationType` 25 values, `TargetClient`).
- **Cross-link HLD**:
  - [gf-marketing-HLD.md](gf-marketing-HLD.md) — primary upstream caller (campaign intent → notification request)
  - [gf-sales-HLD.md](gf-sales-HLD.md), [gf-purchase-HLD.md](gf-purchase-HLD.md), [gf-inventory-HLD.md](gf-inventory-HLD.md) — service callers (booking/order/stock event notifications)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (NotificationCtrl·InternalNotificationCtrl·NotifCreationConsumer → UserNotification/Notification(Mustache fanout)/Template services + 3 schedulers → JPA ddl-auto/Kafka/HttpClients/DynamoDB) + connector `┬`/`▼`; **external side-exit `───┼─►`**: ct-saas-tenant·ct-hrm·DynamoDB device-token; Kafka P/C footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes; (F-02) public caller "Mobile / Web client" → `agg-garage-graph` (BFF passthrough); (F-03) protected REST callers sửa — chỉ `gf-marketing` gọi REST `/protected/v1/notifications` + `/template`; các service khác (`gf-sales`, `gf-erp-agent`, `gf-inventory`, `gf-purchase`) gửi notification qua Kafka `notification-request` topic, không phải REST. |
| 2026-05-07 | v1 | Initial HLD cho `gf-notification`: notification fanout service 7 PostgreSQL tables (`notification_requests`, `notifications` với `nextStage` lifecycle, `notification_deliveries` push queue, `user_notifications` inbox per IAM user, `notification_templates` Mustache global theo `NotificationType` 25 values, `notification_routing_definitions` `targetClient` × `targetRoute`, `inbox` Kafka idempotency 7-day retention) + DynamoDB `nonprod-dev-ac-device-token` (3 GSI), public REST `/api/v1/notifications` (JWT bearer cho list/unread/mark) + protected (x-api-key cho create + template), Kafka in `notification-request` (cùng contract REST DTO `NotificationRequestDto`, manual ack + InboxService dedup) + out `notification` topic (`acks=all`, idempotent, retries 3, sync `send().get()`, DLQ qua `DeadLetterPublishingRecoverer`), 3 scheduler `FOR UPDATE SKIP LOCKED` (in-app 2s, push delivery 5s max 3 attempts, inbox cleanup cron 03:00), channel fanout INAPP/PUSH/BOTH, audience resolution qua `TenantClient` + `HrmClient`. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
