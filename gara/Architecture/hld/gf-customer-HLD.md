---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-customer
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-customer-api.md
  - ../events/customer-events.md
  - ../data/gf-customer-data-model.md
---

# HLD — `gf-customer`

## 1. Overview

`gf-customer` là service quản lý **customer master** cho hệ sinh thái garage. Service sở hữu hồ sơ khách hàng theo tenant (`customers`), **contact cross-tenant** (`contacts` global), phương tiện (`customer_vehicles`), tag, interaction, và **customer segment + membership** (STATIC + DYNAMIC). Segment evaluation chạy bất đồng bộ qua **Temporal workflow** (`SegmentEvaluationWorkflow`). Service có outbox/inbox event durability, validation cache (Redis) cho province/ward từ MDM, và cung cấp protected API customer-IDs cho marketing campaign trigger (birthday, maintenance-due, inactive).

**Trách nhiệm:**
- Customer master CRUD + import/verify-import + suggest theo phone/name + birthday list + merge.
- Contact global: tạo/update theo phone/global id/driver id, link cross-tenant.
- Vehicle: search quản trị, suggest theo plate, **upsert từ service-order** (gf-sales contract).
- Tag + Interaction: ghi lịch sử tương tác per customer.
- Segment lifecycle: STATIC + DYNAMIC, rule update guard với `gf-marketing` linked check, evaluation qua Temporal.
- Campaign trigger endpoints: customer IDs theo birthday / maintenance-due / inactive (kết hợp segment filter).
- Validation cache: province/ward từ MDM, manual evict/reload.
- Event durability: outbox/inbox + Redis distributed lock cho retry.

**Owned epic**: cross-cutting customer domain — cornerstone cho `gf-marketing` (segment) + `gf-sales` (vehicle upsert) + `gf-notification` (interaction). Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌───────── gf-customer  (Java 21 · Spring Boot 3.5.0) ──────────┐
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐               │
│  │ CustomerCtrl│ │ VehicleCtrl│ │ SegmentCtrl  │              │
│  │ /api/v1     │ │            │ │              │              │
│  └─────┬──────┘ └─────┬──────┘ └──────┬───────┘               │
│  ┌─────┴──────┐ ┌─────┴──────┐ ┌──────┴───────┐               │
│  │InteractionCtrl│ TagCtrl   │ │ ValidationCache│             │
│  │             │ │           │ │ Controller(x-api)│           │
│  └─────┬──────┘ └─────┬──────┘ └──────┬───────┘               │
│  ┌─────┴──────────────┴─────┐ ┌────────┴───────┐              │
│  │ InteractionConsumer       │ │ SegmentWorkflow│             │
│  │  (message-events)         │ │ Consumer (seg) │             │
│  └─────────────┬─────────────┘ └───────┬────────┘             │
│  ┌─────────────▼──────────────────────▼─────────┐             │
│  │ APP / DOMAIN SERVICES                        │             │
│  │  CustomerServiceImpl · VehicleService ·       │            │
│  │  SegmentServiceImpl · InteractionService ·    │            │
│  │  TagService · ValidationCacheServiceImpl      │            │
│  │   - Outbox/Inbox (AFTER_COMMIT · Redis lock)  │            │
│  └─────┬───────────────────────────┬─────────────┘            │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐              │
│  │ JPA/Flyway │ │ Kafka outbox │ │ HttpClients │              │
│  │[gf_customer]│ +producer    │ │ (RestClient,│───────────────┼─► gf-erp-mdm    (catalog · 3 ep)
│  │ V1-V6      │ │ 3 topics     │ │  x-api-key) │──────────────┼─► gf-marketing  (segment-linked)
│  └─────┬──────┘ └──────┬───────┘ └─────────────┘──────────────┼─► gf-sales      (vehicle-summaries)
│  ┌─────────────────────────────────────────────┐              │
│  │ Temporal: SegmentEvaluationWorkflow (6 act.) │─────────────┼─► Temporal Cloud  segment-evaluation-queue
│  └─────────────────────────────────────────────┘              │
│  Feature flags: CRM:CRMV01 (Customer+SegmentCtrl) ·           │
│   Customer:VehicleManagementV01 (VehicleCtrl method)          │
│  outbox │ /api/v1/* │ /protected/v1/* │ Actuator+OTLP         │
└───────┴──────────────┴────────────────────────────────────────┘
        ▼                      ▼
   PostgreSQL [gf_customer]      Kafka P: customer-events ·
   10 tables · V1-V6 validate    segment-workflow/evaluated ;
   + Redis (cache + lock)        C: message-events · segment-wf
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Tách `contacts` global và `customers` tenant-specific | 1 contact (phone) có thể xuất hiện ở nhiều tenant; customer data vẫn tenant-scoped | open HLD-CUSTOMER-001 (PII governance cross-tenant) |
| Flyway V1-V6 + JPA `ddl-auto=validate` | Migration source rõ ràng; entity và migration phải đồng bộ | TECHSTACK §migration |
| Outbox + Inbox pattern | Atomic state change + reliable Kafka publish; chống duplicate inbound | TECHSTACK §outbox-inbox |
| Temporal cho segment evaluation | Rule evaluation có thể dài + cần retry boundary; HTTP response không chờ đồng bộ | TECHSTACK §temporal |
| Redis distributed lock cho OutboxProcessor | Multi-replica safe cho retry batch | TECHSTACK §redis-lock |
| Segment update guard `gf-marketing` linked check | Tránh phá campaign đang dùng segment | open HLD-CUSTOMER-004 (marketing outage fallback) |
| Validation cache province/ward (manual reload) | Giảm gọi MDM lặp; data ít thay đổi | open HLD-CUSTOMER-007 (MDM warm-up) |
| Feature flag `CRM:CRMV01` THROW_EXCEPTION khi off | Strict rollout — disable flag = service không response (vs fallback) | source `FeatureOn.FallbackBehavior` |
| Customer code generation qua `tenant_sequences` pessimistic lock | Mã unique per tenant; tránh race condition | source `SequenceServiceImpl` |
| Vehicle upsert từ `gf-sales` qua protected API | Service-order làm giàu vehicle data mà không cần UI customer thao tác | source `upsertVehicleFromServiceOrder` |
| Outbox topic hardcode `"customer.events"` literal | Outbox publish dùng topic từ `outbox_events.topic` column = literal, KHÔNG đọc `kafka.topics.customer-events` config → topic drift risk nếu config env khác literal | open HLD-CUSTOMER-009 (topic drift) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF passthrough cho Garage portal / Mobile) | Sync REST `/api/v1/*` (JWT bearer + feature flag) | Customer/vehicle/segment/interaction/tag CRUD + search + import |
| `gf-sales` (internal) | Sync REST `/protected/v1/customers/*` (x-api-key) | Vehicle upsert from service-order, customer lookup, visit/spend metric, booking count |
| `gf-marketing` (internal) | Sync REST `/protected/v1/customers/birthday\|maintenance-due\|inactive` (x-api-key) | Customer IDs cho campaign trigger (kết hợp segment filter) |
| Service nội bộ | Sync REST `/protected/v1/segments/*` | Segment lookup + customer count + customer IDs |
| External via Kafka `message-events` | Async consume | `SendMessageEvent` → tạo customer interaction |
| External via Kafka `segment-workflow-events` | Async consume | `SegmentWorkflowPayload` → start Temporal evaluation |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-erp-mdm` | Sync REST + x-api-key | `POST /protected/catalog/v1/inquiry` (province/ward), `GET /verify-existed`, `POST /get-hierarchy-codes` (vehicle catalog) |
| `gf-marketing` | Sync REST + x-api-key | `GET /protected/v1/campaigns/segments/{segmentId}/linked` (segment update guard) |
| `gf-sales` | Sync REST + x-api-key | `POST /protected/v1/service-orders/{tenantId}/vehicle-summaries` |
| Kafka `customer-events` | Async publish (via outbox) | CustomerMergedEvent active; CustomerCreated/Updated DTOs exist but producer paths inactive (batchCreateCustomerEvents commented out) |
| Kafka `segment-workflow-events` | Async publish (via outbox) | SegmentWorkflowPayload — trigger Temporal evaluation |
| Kafka `segment-evaluated-events` | ~~Async publish~~ | Config + SegmentEvaluatedEvent DTO exists but **no producer call-site runtime** — wire TBD |
| PostgreSQL | DB | Schema `${DB_SCHEMA:gf_customer}` — 10 tables |
| Redis | Cache + Lock | Validation cache + distributed lock `gf-customer-locks` |
| Temporal | Workflow protocol | Task queue `segment-evaluation-queue` |
| Actuator + OTLP | Observability | Health/metrics + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `gf_customer` schema)** — chi tiết physical schema xem [data/gf-customer-data-model.md](../data/gf-customer-data-model.md):

| Table | Vai trò | Tenant strategy |
|---|---|---|
| `contacts` | Contact global cross-tenant: phone, global_id, driver_id, profile, address | ⚠️ **KHÔNG có `tenant_id`** — 1 contact xuất hiện ở nhiều tenant |
| `customers` | Customer profile per tenant: code (sequence), lead_source, booking_count, total_spent, last_visit_at | `tenant_id` + unique `(tenant_id, code)` + unique `(tenant_id, phone)` |
| `customer_vehicles` | Xe của customer: license_plate, VIN, engine_number, maintenance_schedule | `tenant_id` direct |
| `customer_interactions` | Lịch sử tương tác: type, channel, reference_type/id, metadata | `tenant_id` direct |
| `customer_tags` | Tag gắn customer | `tenant_id` direct |
| `customer_segments` | Segment definition: type (STATIC/DYNAMIC), status (ACTIVE/EVALUATING/ARCHIVED), rules JSON, member_count | `tenant_id` direct |
| `customer_segment_members` | Membership segment ↔ customer | `tenant_id` direct |
| `tenant_sequences` | Counter sinh customer code | `tenant_id` PK component, pessimistic lock |
| `outbox_events` | Reliable Kafka relay: status (PENDING/PROCESSING/SENT/FAILED), retry_count | ⚠️ **KHÔNG có `tenant_id`** (open HLD-CUSTOMER-002) |
| `inbox_events` | Duplicate guard: event_id global unique | KHÔNG `tenant_id` — event-level identity |

**State machines**:

| Field | Values |
|---|---|
| `customer_segments.status` | `ACTIVE` ↔ `EVALUATING` ↔ `ARCHIVED` |
| `outbox_events.status` | `PENDING` → `PROCESSING` → `SENT` / `FAILED` |
| `Gender` | `MALE` / `FEMALE` / `OTHER` |
| `LeadSource` | `DRIVER_APP` / `WALK_IN` / `IMPORT` / `MANUAL` / `REFERRAL` / `MARKETING_CAMPAIGN` / `QR_SCAN` / `SELF` |
| `InteractionType` | `CALL` / `SMS` / `EMAIL` / `NOTE` / `BOOKING` / `SERVICE` / `FEEDBACK` / `PUSH` / `ZALO` / `VISIT` |
| `SegmentType` | `STATIC` / `DYNAMIC` |
| `CriteriaType` | `TOTAL_SPENT` / `REGISTRATION_DATE` / `CITY` / `VEHICLE_INFO` / `INACTIVE_DAYS` / `BOOKING_COUNT` |

**KHÔNG own**:
- Campaign lifecycle (`gf-marketing` SoT — chỉ kiểm linked qua API)
- Notification delivery (`gf-notification`)
- Sales / service-order nghiệp vụ (`gf-sales` — chỉ nhận vehicle upsert + metric updates)
- MDM catalog province/ward/vehicle (`gf-erp-mdm` SoT — chỉ cache/validate/lookup)
- File binary cho profile/vehicle/interaction (storage service ngoài — chỉ lưu URL)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Customer create/update p95 | ≤ 500ms (incl. contact upsert + sequence lock + outbox) |
| Customer search p95 (paged) | ≤ 400ms |
| Customer suggest by phone/name p95 | ≤ 200ms |
| Customer import batch (100 rows) | ≤ 5s (validation cache hit) |
| Vehicle search p95 | ≤ 400ms |
| Segment rule update p95 (incl. marketing linked check) | ≤ 600ms |
| Segment preview p95 | ≤ 1.5s (rule evaluation in-memory) |
| Segment evaluation workflow | async — workflow execution timeout **1 giờ**, activity start-to-close 10 phút, retry 3× exp backoff (1s → 1m) |
| Campaign trigger customer IDs p95 (paged) | ≤ 800ms |
| Outbox publish (immediate after commit) | ≤ 200ms |
| Outbox retry batch | poll 5s, batch 100, max retries 3 |
| Validation cache | Redis no TTL — manual evict/reload (cache miss → MDM call ~200ms) |
| Kafka producer | `acks=all`, `retries=3`, `enable.idempotence=true` |
| Kafka consumer | `MANUAL_IMMEDIATE` ack trong `finally` |
| Multi-replica | safe — Redis lock `gf-customer-locks` cho outbox singleton |
| Schema migration | Flyway V1-V6 + JPA `ddl-auto=validate` |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Hikari pool | default Spring config |

## 7. Forbidden Actions

- ❌ Public API skip tenant scope (mọi query phải qua `SecurityUtils.getCurrentTenantIdAsLong()` — bypass = cross-tenant leak; đặc biệt nguy hiểm vì `contacts` không có `tenant_id`).
- ❌ Public expose `contacts` global cross-tenant (chứa PII; chỉ internal API có quyền lookup theo phone — open HLD-CUSTOMER-001).
- ❌ Skip `gf-marketing` linked check trước khi update segment rule/status (campaign đang dùng segment sẽ break audience — phải fail-fast nếu marketing trả linked).
- ❌ Bypass outbox để `kafkaTemplate.send()` trực tiếp trong transaction (race với commit; phá idempotent retry).
- ❌ Skip `InboxService.existsByEventId` check trên `InteractionConsumer` (duplicate `SendMessageEvent` tạo trùng interaction).
- ❌ Hard-delete `customers` / `contacts` / `customer_vehicles` / `customer_interactions` (audit invariant — dùng soft delete via `is_active=false`).
- ❌ Add `tenant_id` vào `contacts` table mà không có ADR (đổi semantics global → tenant-scoped — phá design intent + impact toàn bộ flow).
- ❌ Run segment evaluation đồng bộ trong HTTP request (large segment timeout — phải qua Kafka → Temporal workflow).
- ❌ Disable feature flag `CRM:CRMV01` ở production mà không có rollback plan (THROW_EXCEPTION fallback → service không phục vụ; user-facing 500).
- ❌ Sequence row `tenant_sequences` tăng `current_value` ngoài transaction lock (race với concurrent customer create → duplicate code).
- ❌ Log raw phone/email/plate/VIN/interaction content vào log tập trung (open HLD-CUSTOMER-008 — PII compliance; cần masking layer).
- ❌ Validation cache miss → fallback gọi MDM blocking trên hot path mà không có timeout (open HLD-CUSTOMER-007 — MDM lỗi sẽ kẹt customer create).
- ❌ Outbox publish event không có `tenant_id` trong payload/header (open HLD-CUSTOMER-002 — consumer mất tenant scope).
- ❌ Kafka consumer ack trong `finally` mà không có DLQ (open HLD-CUSTOMER-003 — event lỗi mất khi ack vẫn chạy).

## 8. References

- **TECHSTACK**: §outbox-inbox, §temporal, §redis-lock, §migration, §http-client
- **API spec**: [gf-customer-api.md](../api/gf-customer-api.md) — Public 25 endpoints (customer 9, segment 8, vehicle 3, interaction 4, tag 1), Protected 28 endpoints (customer internal 21, segment internal 3, interaction internal 1, validation cache 3) = 53 total.
- **Events spec**: [customer-events.md](../events/customer-events.md) — outbound `customer-events` (CustomerCreated/Updated/Merged) + `segment-evaluated-events`; inbound `message-events` + `segment-workflow-events`.
- **Workflows**:
  - [customer-segment-evaluation-flow.md](../workflows/customer-segment-evaluation-flow.md) — full flow: rule update → outbox → Kafka → Temporal workflow → activities (6) → membership update.
- **Data model**: [gf-customer-data-model.md](../data/gf-customer-data-model.md) — 10 tables, Flyway V1-V6, enum catalog (9 enums), value objects (`SegmentRules`, `SegmentCriteria`).
- **Cross-link HLD**:
  - [gf-marketing-HLD.md](gf-marketing-HLD.md) — campaign trigger consumer + segment linked guard
  - [gf-sales-HLD.md](gf-sales-HLD.md) — vehicle upsert source + service-order vehicle summaries
  - [gf-erp-mdm-HLD.md](gf-erp-mdm-HLD.md) — catalog province/ward/vehicle source
  - [gf-notification-HLD.md](gf-notification-HLD.md) — message-events producer


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (inbound Public/Protected REST + Kafka Consumers → APP/DOMAIN 6 services + Outbox/Inbox → outbound JPA/Kafka/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-erp-mdm · gf-marketing · gf-sales + Temporal Cloud (segment-evaluation-queue); Kafka P/C ở infra footer. Giữ feature flags + schema/Flyway. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v2 + source audit: (F-00) thêm Java 21/SB 3.5.0 vào component diagram + quality attributes; (F-01) events produces sửa — chỉ CustomerMergedEvent active, CustomerCreated/Updated producer inactive (commented out), segment-evaluated-events không có call-site; (F-02) thêm open HLD-CUSTOMER-009 topic drift risk: outbox hardcode literal `"customer.events"` ≠ config `DEV-CUSTOMER-EVENTS`; (F-03) API count sửa Protected "20+" → 28 (customer internal 21 + segment internal 3 + interaction internal 1 + validation cache 3); (F-04) inbound caller sửa "Garage portal" → `agg-garage-graph` (BFF pattern); (F-06) feature flag chi tiết scope: CRM:CRMV01 class-level trên CustomerCtrl+SegmentCtrl, Customer:VehicleManagementV01 method-level trên VehicleCtrl (search/get only, suggest ungated), InteractionCtrl+TagCtrl không gate. |
| 2026-05-07 | v1 | Initial HLD cho `gf-customer`: customer master Garage 10 tables (`contacts` global cross-tenant, `customers` tenant-scoped, `customer_vehicles`, `customer_interactions`, `customer_tags`, `customer_segments` STATIC/DYNAMIC, `customer_segment_members`, `tenant_sequences`, `outbox_events`, `inbox_events`, Flyway V1-V6), public REST `/api/v1/*` (JWT + feature flag `CRM:CRMV01`) + protected (x-api-key) cho `gf-marketing`/`gf-sales` campaign trigger (birthday/maintenance-due/inactive), Kafka outbox `customer-events` (Created/Updated/Merged) + `segment-evaluated-events` + inbound `message-events` + `segment-workflow-events`, Temporal `SegmentEvaluationWorkflow` queue `segment-evaluation-queue` (6 activities, retry 3× exp backoff, 1h timeout), Redis validation cache province/ward + `gf-customer-locks` distributed lock, downstream `gf-erp-mdm` + `gf-marketing` (segment linked guard) + `gf-sales` (vehicle upsert). Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
