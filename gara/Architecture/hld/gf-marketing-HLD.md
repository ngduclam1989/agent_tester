---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-marketing
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-marketing-api.md
  - ../events/marketing-events.md
  - ../data/gf-marketing-data-model.md
---

# HLD — `gf-marketing`

## 1. Overview

`gf-marketing` là service quản lý **2 sub-domain**: **(1) Campaign** (chiến dịch marketing + wave + message template + tracking) và **(2) Voucher** (program + voucher + claim/redemption + QR). Service sở hữu trạng thái chiến dịch/voucher per tenant trong PostgreSQL, dùng Kafka outbox/inbox cho event durability, **Temporal cho 6 workflow** (wave + triggered + voucher program + 3 expiry workflow), và HTTP client để lấy customer/segment/tenant data hoặc gửi notification. Tích hợp với `gf-customer` (segment/cohort), `gf-notification` (delivery), `ct-saas-tenant` (basic info).

**Trách nhiệm:**
- **Campaign domain**: lifecycle create/update/search/start/pause/resume/cancel/complete + stats; wave batch (default 100); recurring/triggered cron workflow; `BOOKING_COMPLETED` event-driven (sync in consumer, not Temporal); message template đa kênh (SMS/EMAIL/PUSH/ZALO); notification limit per tenant per channel.
- **Voucher domain**: voucher program CRUD + suspend/resume/cancel/activate + expiry schedule; voucher generation qua event `VOUCHER_PROGRAM_ACTIVATED` → Temporal sinh voucher; claim QR (CREATED→CLAIMED) hoặc campaign assign (CREATED→DISTRIBUTED); redeem by driver/voucher code/QR; cancel batch + voucher expiry workflow.
- **Cross**: outbox publish 4 topic, inbox idempotency 3 consumer, segment linked check cho `gf-customer`.

**Owned epic**: cross-cutting marketing — cornerstone cho campaign + voucher xuyên `gf-customer` (segment) + `gf-notification` (delivery) + `gf-sales` (booking trigger). Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌────────── gf-marketing  (Java 21 · Spring Boot 3.5.0) ──────────┐
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │ CampaignCtrl│ │CampaignWaveCtrl│ VoucherCtrl  │              │
│  └─────┬───────┘ └──────┬───────┘ └──────┬───────┘              │
│  ┌─────┴───────┐ ┌──────┴───────┐ ┌──────┴───────┐              │
│  │VoucherProgram│ MessageTemplate│ NotificationLim│             │
│  │ Ctrl         │ Ctrl          │ itsCtrl        │              │
│  └─────┬───────┘ └──────┬───────┘ └──────┬───────┘              │
│  ┌─────┴───────────────┴┐ ┌──────────────┴───────┐              │
│  │ Internal Ctrls (x-api)│ │ Kafka Consumers      │             │
│  │  CampaignInternalCtrl·│ │  BookingCompleted ·  │             │
│  │  VoucherProgramIntCtrl│ │  MessageEvents ·     │             │
│  │                       │ │  VoucherProgramEvents│             │
│  └──────────┬────────────┘ └──────────┬───────────┘             │
│  ┌──────────▼──────────────────────────▼──────────┐             │
│  │ APP / DOMAIN SERVICES                          │             │
│  │  Campaign: CampaignServiceImpl · WaveService · │             │
│  │   MessageTemplateService · NotificationLimit   │             │
│  │  Voucher: VoucherProgramService · QrService ·  │             │
│  │   VoucherServiceImpl                           │             │
│  │   - Outbox/Inbox (poll 1s · Redis lock ×2)     │             │
│  └─────┬────────────────────────────┬─────────────┘             │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐                │
│  │ JPA/Flyway │ │ Kafka outbox │ │ HttpClients │                │
│  │[gf_marketing]│ +producer    │ │ (x-api-key) │────────────────┼─► gf-customer    (segment/cohort · 15+)
│  │ V1-V8      │ │ 4 topics     │ │             │────────────────┼─► gf-notification (send)
│  └─────┬──────┘ └──────┬───────┘ └─────────────┘────────────────┼─► ct-saas-tenant  (tenant cache)
│  ┌─────────────────────────────────────────────┐                │
│  │ Temporal (marketing-task-queue) 6 workflows: │───────────────┼─► Temporal Cloud  marketing-task-queue
│  │  Wave(100)·TriggeredCampaignCron(1000)·       │              │
│  │  VoucherProgram·Expiry·ExpiryScheduled·       │              │
│  │  VoucherProgramUpdateExpired                  │              │
│  └─────────────────────────────────────────────┘                │
│  Feature flags: Campaign:CampaignV01 · Voucher:Vouc-            │
│   herV01   (BookingCompleted = sync consume, NOT cron)          │
│  outbox │ /api/v1/* │ /protected/v1/* │ Actuator+OTLP           │
└───────┴──────────────┴──────────────────────────────────────────┘
        ▼                      ▼
   PostgreSQL [gf_marketing]     Kafka P: 4 topics (campaign·
   14 tables · V1-V8             voucher·program·message) ;
   + Redis (locks×2 + cache)     C: booking-completed·message·prg
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Tách 2 sub-domain (campaign + voucher) trong cùng service | Logic chặt chẽ — campaign assign voucher, voucher track qua message-events | TECHSTACK §marketing |
| Outbox publish event (không direct publish trong tx) | Durability + idempotency khi Kafka/downstream lỗi | open HLD-MARKETING-006 |
| Inbox idempotency cho 3 Kafka consumer | Chống xử lý duplicate khi Kafka retry; key per consumer (event id, externalId+status) | source `InboxService` |
| Wave workflow Temporal (batch 100) | Long-running + retry/delay + state dài hạn cho campaign multi-wave | TECHSTACK §temporal |
| Triggered cron workflow batch 1000 | Recurring/triggered không wave — page customer matching today; filter trùng ngăn gửi lại (TRIGGERED only — RECURRING skip filter) | source `TriggeredCampaignActivities` |
| `BOOKING_COMPLETED` xử lý sync trong consumer (không cron, không Temporal) | Event-driven real-time — BookingCompletedConsumer → BookingCompletedEventProcessor trực tiếp | source `BookingCompletedConsumer` (BR-002) |
| Voucher generation kích hoạt qua event `VOUCHER_PROGRAM_ACTIVATED` | Tách API activation khỏi tác vụ sinh voucher số lượng lớn; schedule 2 top-level expiry workflows | open HLD-MARKETING (event delay window) |
| Template đa kênh (`template_channels`) | 1 template + N channel content (SMS/EMAIL/PUSH/ZALO) | source `MessageTemplate` |
| Notification limit check trong workflow | Chặn vượt quota tại điểm gửi; fail open (lỗi check vẫn cho gửi); exhausted → auto-complete campaign | open HLD-MARKETING-008 (concurrency race) |
| Redis distributed lock cho outbox processor | Multi-replica safe — 2 lock riêng cho process + retry | source `gf-marketing-outbox-{processor,retry-processor}` |
| Java 21 + Spring Boot 3.5.0 | Align với toàn bộ platform services | TECHSTACK §runtime |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF) | Sync REST `/api/v1/*` (JWT + feature flag) | Campaign/wave CRUD, message template, voucher program/voucher, notification limit |
| `gf-customer` | Sync REST `/protected/v1/campaigns/segments/{id}/linked` (X-Tenant-Id) | Segment update guard — kiểm campaign đang dùng |
| `gf-customer` | Sync REST `/protected/v1/voucher-programs/{claim-qr,redeem-by-driver}` (x-api-key) | Claim QR + redeem voucher từ mobile flow |
| `gf-sales` (qua Kafka) | Async consume `booking-completed` | Trigger campaign `BOOKING_COMPLETED` (sync processing) |
| `lambda-marketing-notification` (qua Kafka) | Async consume `message-events` (`MESSAGE.SEND.2`) | Update message status (sentAt/deliveredAt/openedAt/clickedAt) |
| Self (qua Kafka) | Async consume `voucher-program-events` | Trigger workflow voucher program activation/cancel-expire |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-customer` | Sync REST + x-api-key | 15+ endpoints (segment/customer-ids, batch, birthday/maintenance/inactive cohort, by-driver, by-phone) |
| `gf-notification` | Sync REST + x-api-key | `POST /protected/v1/notifications` (`SendNotificationRequest`) |
| `ct-saas-tenant` | Sync REST + x-api-key | Tenant cache + search basic info |
| Kafka 4 topics | Async publish (via outbox) | campaign/voucher/voucher-program/message events (17 event types tổng) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:gf_marketing}` — 14 tables |
| Redis | Cache + 2 distributed locks | outbox processor + retry processor |
| Temporal | Workflow protocol | Task queue `marketing-task-queue` — 6 workflow |
| Actuator + OTLP | Observability | Health/metrics + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `gf_marketing` schema)** — chi tiết physical schema xem [data/gf-marketing-data-model.md](../data/gf-marketing-data-model.md):

| Domain | Tables |
|---|---|
| **Campaign** | `campaigns`, `campaign_audiences`, `campaign_waves`, `wave_executions`, `campaign_messages` |
| **Template** | `message_templates`, `template_channels` |
| **Voucher** | `voucher_programs`, `vouchers`, `voucher_redemptions` |
| **Trigger mapping** | `trigger_event_mappings` |
| **Event durability** | `outbox`, `inbox` |
| **Sequence** | `sequences` (global, no `tenant_id`) |

**State machines**:

| Field | Values |
|---|---|
| `CampaignStatus` | `DRAFT` → `SCHEDULED` → `RUNNING` → `COMPLETED`; `RUNNING` → `PAUSED` / `CANCELLED`; `PAUSED` → `RUNNING` / `CANCELLED` |
| `CampaignType` | `ONE_TIME` / `RECURRING` / `TRIGGERED` |
| `WaveStatus` | `PENDING` / `SCHEDULED` / `RUNNING` / `COMPLETED` / `PAUSED` / `CANCELLED` / `SKIPPED` |
| `MessageStatus` | `PENDING` / `SENDING` / `SENT` / `DELIVERED` / `OPENED` / `CLICKED` / `FAILED` / `BOUNCED` |
| `NotificationChannel` | `SMS` / `EMAIL` / `PUSH` / `ZALO` |
| `TriggerEvent` | `CUSTOMER_BIRTHDAY` / `BOOKING_COMPLETED` / `VEHICLE_MAINTENANCE_DUE` / `CUSTOMER_CREATED` / `CUSTOMER_INACTIVE` / `BOOKING_CANCELLED` / `PAYMENT_COMPLETED` / `SERVICE_COMPLETED` |
| `VoucherProgramStatus` | `DRAFT` / `ACTIVE` / `EXPIRED` / `CANCELLED` / `SUSPENDED` |
| `VoucherStatus` | `CREATED` → `CLAIMED` (QR scan) → `REDEEMED`; `CREATED` → `DISTRIBUTED` (campaign assign); `CLAIMED`/`DISTRIBUTED` → `EXPIRED` / `CANCELLED` |
| `VoucherType` | `PERCENT_DISCOUNT` / `FIXED_DISCOUNT` / `FREE_SERVICE` / `GIFT` |
| `ClaimCycle` | `NONE` / `DAILY` / `WEEKLY` / `MONTHLY` / `YEARLY` |
| `ClaimSource` | `QR_SCAN` / `CAMPAIGN` / `MANUAL` |

**Tenant strategy**: tất cả bảng nghiệp vụ + outbox/inbox đều có `tenant_id`. Public API: `SecurityUtils` (most); MessageTemplateController legacy nhận `tenantId` query (open HLD-MARKETING-002). Protected: CampaignInternalController nhận `X-Tenant-Id`; VoucherProgramInternalController nhận tenant từ body. `sequences` global, không tenant-scoped.

**KHÔNG own**: Customer master + segment + cohort (`gf-customer`), notification delivery (`gf-notification`), booking/service-order (`gf-sales`), tenant master (`ct-saas-tenant`), file binary (QR trả content/string).

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Campaign create p95 (incl. validation + audience) | ≤ 800ms |
| Campaign search p95 (paged) | ≤ 500ms |
| Campaign start p95 (start workflow) | ≤ 600ms |
| Voucher program activate p95 (publish event + state change) | ≤ 400ms |
| Voucher claim QR p95 (verify + customer + assign) | ≤ 800ms |
| Voucher redeem p95 (validate + redemption insert) | ≤ 500ms |
| Wave workflow batch size | **100** (`DEFAULT_BATCH_SIZE=100`) |
| Triggered campaign batch size | **1000** (`TRIGGERED_CAMPAIGN_BATCH_SIZE=1000`) |
| Outbox poll / retry interval | **1s** / **60s** |
| Outbox batch size / max retries | **100** / **3** |
| Outbox/inbox retention | **7 ngày** |
| Notification limit defaults | SMS **20**, EMAIL/PUSH/ZALO **10000** per tenant per period |
| Voucher code format | `TENANT-{4_RANDOM}-{4_RANDOM}` (SecureRandom, bulk 1000/batch) |
| Campaign/VoucherProgram code | `CAMP_{NNNNN}` / `VP_{NNNNN}` (SequenceGenerator, SELECT FOR UPDATE) |
| Voucher default validity | 30 ngày |
| Campaign/wave check interval | 60s |
| Voucher expiry cron | daily 01:00 |
| Temporal activity retry | max 3 attempts, exponential backoff |
| Schema migration | Flyway V1-V8 + JPA `ddl-auto=none` ✅ |
| Multi-replica | safe — 2 Redis distributed lock cho outbox |
| Runtime | Java 21, Spring Boot 3.5.0 |

## 7. Forbidden Actions

- ❌ Skip `InboxService` idempotency check trên 3 Kafka consumer — duplicate event sẽ tạo trùng trigger/status/workflow (BR-GF-MARKETING-006).
- ❌ Bypass outbox để `kafkaTemplate.send()` trực tiếp trong transaction — phá idempotent retry (BR-GF-MARKETING-006).
- ❌ Send message khi `notification_limits` đã đạt quota — workflow phải auto-complete remaining wave (BR-GF-MARKETING-009).
- ❌ Send message khi voucher program `remainingQuantity=0` — workflow phải skip remaining customer (BR-GF-MARKETING-004).
- ❌ Trigger campaign `BOOKING_COMPLETED` qua cron workflow — phải qua `BookingCompletedConsumer` sync (BR-GF-MARKETING-010).
- ❌ `MessageTemplateController` accept `tenantId` query param mà không enforce authorization (open HLD-MARKETING-002).
- ❌ Public expose `/protected/v1/voucher-programs/redeem-by-driver` — chỉ internal (security filter).
- ❌ Hardcode `marketing.qr.secret-key` (open HLD-MARKETING-004 — QR forge risk; phải fail-fast).
- ❌ Generate voucher số lượng lớn mà không async — phải qua Temporal workflow (BR-GF-MARKETING-001).
- ❌ Publish voucher event khi voucher chưa save commit — phải AFTER_COMMIT outbox (BR-GF-MARKETING-006).
- ❌ Hard-delete `campaigns` / `voucher_programs` / `vouchers` (audit invariant — dùng status CANCELLED).
- ❌ Notification limit check + increment KHÔNG atomic (open HLD-MARKETING-008 — race condition).
- ❌ Mix global template (`tenantId=-1`) và tenant-specific mà không governance (open HLD-MARKETING-010).
- ❌ Log raw `campaign_messages.renderedContent` / template content / outbox payload (open HLD-MARKETING-009 — PII).
- ❌ `CampaignWorkflowImpl.executeCampaign` rỗng nhưng registered (open HLD-MARKETING-005 — phải hoàn thiện hoặc deprecate).

## 8. References

- **TECHSTACK**: §marketing, §temporal, §outbox-inbox, §redis-lock, §http-client, §runtime
- **API spec**: [gf-marketing-api.md](../api/gf-marketing-api.md) — 52 public + 3 internal = 55 total endpoints.
- **Events spec**: [marketing-events.md](../events/marketing-events.md) — outbound 17 event types (campaign × 6, voucher × 4, voucher-program × 3, message × 4); inbound 3 (booking-completed, message-events MESSAGE.SEND.2, voucher-program-events).
- **Workflows**:
  - [marketing-campaign-wave-flow.md](../workflows/marketing-campaign-wave-flow.md)
  - [voucher-program-lifecycle-flow.md](../workflows/voucher-program-lifecycle-flow.md)
- **Data model**: [gf-marketing-data-model.md](../data/gf-marketing-data-model.md) — 14 tables, Flyway V1-V8, 17 enum catalog.
- **Business rules**: BR-GF-MARKETING-001..013 (in KG `gf-marketing.knowledge-graph.yaml`).
- **Cross-link HLD**:
  - [gf-customer-HLD.md](gf-customer-HLD.md) — primary upstream (segment/cohort lookup) + segment linked guard + claim/redeem caller
  - [gf-notification-HLD.md](gf-notification-HLD.md) — message delivery downstream
  - [gf-sales-HLD.md](gf-sales-HLD.md) — booking-completed source + redeem voucher theo bookingId


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (inbound Public/Protected REST + Kafka Consumers → APP/DOMAIN campaign+voucher services + Outbox/Inbox → outbound JPA/Kafka/HttpClients + Temporal) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-customer · gf-notification · ct-saas-tenant + Temporal Cloud (marketing-task-queue, 6 workflows); Kafka P (4 topics) / C ở infra footer. Giữ feature flags + Flyway. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 (diagram + decisions + quality); (F-02) fix VoucherStatus thêm CLAIMED (QR scan path CREATED→CLAIMED→REDEEMED); (F-03) fix MessageStatus thêm BOUNCED; (F-04) feature flags sửa 3→2 active (CRM:CRMV01 defined but unused — dead constant); (F-05) inbound callers: "Garage portal"→agg-garage-graph, "Service nội bộ"→gf-customer, "gf-notification"→lambda-marketing-notification cho message-events; (F-06) API count 60+→55 (52 public + 3 internal); (F-07) thêm BR-GF-MARKETING citations cho forbidden actions; (F-08) clarify BOOKING_COMPLETED sync processing (BR-002), triggered campaign duplicate filter (BR-012), voucher code gen format (BR-013); (F-09) trim diagram + compress cho line budget ≤250. |
| 2026-05-07 | v1 | Initial HLD cho `gf-marketing`: 2 sub-domain campaign + voucher, 14 tables, public REST `/api/v1/*` (JWT + 2 feature flags) + protected (segment linked, claim-qr, redeem-by-driver), Kafka outbox 4 topic (17 event types), inbound booking-completed/message-events/voucher-program-events qua InboxService, Temporal 6 workflow (WaveWorkflow batch 100, TriggeredCampaignCronWorkflow batch 1000, VoucherProgramWorkflow + 3 expiry), 2 Redis lock outbox, downstream gf-customer (15+) + gf-notification + ct-saas-tenant. |
