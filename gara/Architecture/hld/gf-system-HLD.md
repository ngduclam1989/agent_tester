---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../events/tenant-system-events.md
  - ../data/gf-system-data-model.md
  - ../api/gf-system-api.md
---

# HLD — `gf-system`

## 1. Overview

`gf-system` là **platform support service** trong hệ Garage Functions. Runtime bao gồm Kafka consumers, REST controllers, transactional outbox, và PostgreSQL persistence. **Java 21 + Spring Boot 3.5.0**; Kafka + JPA + Flyway V1-V6. Service materialize và quản lý dữ liệu master cần cho vận hành garage: subscription quota, branch lifecycle, tenant invoice info, và transporter registry.

**Trách nhiệm:**

**Tenant Provisioning (Kafka)**
- Consume `TenantProvisionedEvent` từ `ct-saas-tenant` (filter `MessageGroup=TENANT-PROVISIONING`, `MessageStep=TENANT_PROVISIONED.1`, `tenantType=GARAGE`).
- Cache subscription quota (plan, max branches/warehouses/users, validity window) vào `tenant_subscriptions` — projection only.
- Tạo default branch idempotent (guard `existsByTenantIdAndIsDefaultTrue`) khi feature flag `Inventory:InventoryStockV01` enabled.
- Publish `BranchCreatedEvent` (BRANCH_CREATED.1) lên topic `AC-DEV-BRANCH-LIFECYCLE` **DIRECT** (không qua outbox — BR-GF-SYSTEM-005).

**Tenant Invoice Info (REST + Kafka command)**
- Expose protected REST `PUT /protected/v1/tenant-invoice-info` (SVC-to-SVC): upsert fill-blank từ Garage — chỉ điền field còn trống, KHÔNG overwrite.
- Expose protected REST `GET /protected/v1/tenant-invoice-info` (SVC-to-SVC): fetch invoice info theo `X-Tenant-Id`.
- Consume `TenantInvoiceInfoCommand` từ topic `AC-DEV-TENANT-INVOICE-INFO` (MessageStep=`TENANT_INVOICE_INFO_UPSERT_REQUESTED`) — patch field non-blank từ COP; idempotent via `inbox_event`.
- Publish `TenantInvoiceInfoUpdatedEvent` qua outbox sau mỗi thay đổi thực sự.

**Transporter Registry (REST + Kafka command)**
- Expose public REST `/api/v1/system/tenant-transporter-registry` — CRUD + search cho garage staff.
- Consume `TenantTransporterRegistryCommand` từ topic `AC-DEV-TENANT-TRANSPORTER-REGISTRY` (MessageStep=`TENANT_TRANSPORTER_REGISTRY_UPSERT_REQUESTED` | `TENANT_TRANSPORTER_REGISTRY_DELETE_REQUESTED`); idempotent via `inbox_event`.
- Publish `TenantTransporterRegistryEvent` (UPSERTED | DELETED) qua outbox.

**Infrastructure**
- Cung cấp `sequences` table + function `get_next_number` cho sinh số thứ tự nội bộ (vd branch code).
- Transactional outbox với `OutboxEventListener` (AFTER_COMMIT) và `OutboxScheduler` polling 60s (fallback).

**Owned boundary**: tenant projection + branch master + tenant invoice info + transporter registry.

---

## 2. Component Diagram (C4 Level 3)

```
┌─────────── gf-system  (Java 21 · Spring Boot 3.5.0) ────────────┐
│  ┌────────────────────┐ ┌──────────────────────────┐            │
│  │ REST Controllers   │ │ Kafka Consumers          │            │
│  │ TenantTransporter- │ │ TenantProvisionedEvent-  │            │
│  │ RegistryCtrl·      │ │ Listener (GARAGE filter)·│            │
│  │ InternalTenant-    │ │ TenantInvoiceInfoCmd·    │            │
│  │ InvoiceInfoCtrl    │ │ TransporterRegistryCmd   │            │
│  └──────────┬─────────┘ └────────────┬─────────────┘            │
│  ┌──────────▼─────────────────────────▼────────────┐            │
│  │ APP / DOMAIN SERVICES                           │            │
│  │  TenantSubscriptionsService · BranchService ·   │            │
│  │  TenantInvoiceInfoService ·                     │            │
│  │  TenantTransporterRegistryService               │            │
│  │  EventPublisher (BranchEventPublisher DIRECT +  │            │
│  │   OutboxService AFTER_COMMIT)                   │            │
│  └──────────┬───────────────────────┬──────────────┘            │
│  ┌──────────▼─────┐ ┌────────────────▼────────────┐             │
│  │ JPA/Flyway     │ │ Kafka producer + outbox     │             │
│  │ [dev_gf_system]│ │  OutboxScheduler poll 60s   │             │
│  │ V1-V6          │ │  SKIP LOCKED (fallback)     │             │
│  └──────────┬─────┘ └──────────┬──────────────────┘             │
│  /api/v1/* │ /protected/v1/* │ Actuator + OTLP                  │
│    [no external REST downstream — Kafka-driven]                 │
└───────────┴───────────────┴─────────────────────────────────────┘
            ▼                ▼
   PostgreSQL [dev_gf_system]   Kafka P: BRANCH-LIFECYCLE (direct)·
   7 tables · V1-V6             INVOICE-INFO·TRANSPORTER-REG (outbox) ;
                               C: TENANT-PROVISIONING·INVOICE·TRANSPORTER
```

---

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Tenant subscription cache là **projection only**, KHÔNG SoT | `ct-saas-tenant` là tenant master; gf-system chỉ materialize quota cho hot-path | open HLD-SYSTEM-006 (replay/reconciliation policy) |
| Default branch creation: idempotent + feature-flag guarded | Tenant provisioning event có thể replay; flag cho phép rollback rollout | TECHSTACK §feature-flag |
| Branch code = `{tenantCode}-{city}-{seq}` qua DB sequence | Tránh collision; sequence per-tenantCode | open HLD-SYSTEM-003 (city normalization) |
| Branch lifecycle publish **DIRECT** (skip outbox) | `EventPublishingService` skip BRANCH-LIFECYCLE group; outbox tồn tại nhưng không wire cho branch | BR-GF-SYSTEM-005; open HLD-SYSTEM-001 |
| Outbox dùng `FOR UPDATE SKIP LOCKED` | Multi-replica polling không lock contention; idempotent retry | TECHSTACK §outbox-pattern |
| Outbox wired cho invoice info + transporter; **branch vẫn DIRECT** | Invoice info + transporter cần at-least-once guarantee; branch direct là legacy tạm thời | open HLD-SYSTEM-001 |
| Garage REST invoice info chỉ **fill-blank** (không overwrite) | COP là authoritative source cho invoice data; Garage chỉ bootstrap field còn thiếu | BR-GF-SYSTEM-006 |
| Protected REST `/protected/v1` cho invoice info (SVC-to-SVC) | `gf-purchase` và downstream cần fetch invoice info qua HTTP; tenant từ `X-Tenant-Id` header | api/gf-system-api.md |
| Public REST `/api/v1/system` cho transporter registry | Garage staff CRUD nhà vận chuyển; tenant từ `SecurityUtils.getCurrentTenantIdAsLong()` | api/gf-system-api.md |
| InboxEvent idempotency cho command listeners | Kafka command có thể retry; `inbox_event.event_id = messageId` chống double-process | BR-GF-SYSTEM-009, -014 |
| Manual Long version counter cho transporter (KHÔNG phải JPA @Version) | Cho phép consumer downstream đọc version; service increment thủ công khi update | BR-GF-SYSTEM-013 |
| Soft-delete transporter (`is_deleted=true`) | Audit trail; downstream consumer cần biết record đã xóa | BR-GF-SYSTEM-012 |
| Filter Kafka strict (group + step + tenantType) | Topic share giữa nhiều consumer — phải skip silent message ngoài contract | events `_CONVENTIONS.md` |

---

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `ct-saas-tenant` | Async Kafka `AC-DEV-TENANT-PROVISIONING` | `TenantProvisionedEvent` (TENANT_PROVISIONED.1, tenantType=GARAGE) — seed subscription + branch |
| COP Backoffice | Async Kafka `AC-DEV-TENANT-INVOICE-INFO` | `TenantInvoiceInfoCommand` (TENANT_INVOICE_INFO_UPSERT_REQUESTED) — patch invoice info |
| COP Backoffice | Async Kafka `AC-DEV-TENANT-TRANSPORTER-REGISTRY` | `TenantTransporterRegistryCommand` (UPSERT/DELETE_REQUESTED) — sync transporter registry |
| `agg-garage-graph` (BFF passthrough cho Garage portal) | REST `/api/v1/system/tenant-transporter-registry` | CRUD + search transporter (JWT bearer qua BFF) |
| `gf-purchase`, `gf-sales`, `gf-accounting`, etc. | REST `GET /protected/v1/tenant-invoice-info` | Fetch invoice info theo tenant (SVC-to-SVC, `X-Tenant-Id` header) |
| Garage flows | REST `PUT /protected/v1/tenant-invoice-info` | Bootstrap invoice info khi tenant chưa có (SVC-to-SVC) |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| Kafka `AC-DEV-BRANCH-LIFECYCLE` | Async **DIRECT** publish | `BranchCreatedEvent` (BRANCH_CREATED.1) |
| Kafka `AC-DEV-TENANT-INVOICE-INFO` | Async **outbox** publish | `TenantInvoiceInfoUpdatedEvent` (TENANT_INVOICE_INFO_UPDATED) |
| Kafka `AC-DEV-TENANT-TRANSPORTER-REGISTRY` | Async **outbox** publish | `TenantTransporterRegistryEvent` (TENANT_TRANSPORTER_REGISTRY_UPSERTED \| TENANT_TRANSPORTER_REGISTRY_DELETED) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_system}` — 7 tables, Flyway V1-V6 |
| Feature flag provider | Cache + Sync | `Inventory:InventoryStockV01` guard cho default branch creation |
| Common messaging library | In-process | `Message`, `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` envelope |
| Actuator + OTLP | Observability | Health/metrics/prometheus + distributed tracing |

---

## 5. Data Ownership

**Owned (PostgreSQL `dev_gf_system` schema)** — chi tiết physical schema xem [data/gf-system-data-model.md](../data/gf-system-data-model.md):

| Table | Flyway | Vai trò | Ownership |
|---|---|---|---|
| `tenant_subscriptions` | V1 (init) + V4 (rename + JSONB) | Cache quota + feature plan + validity window từ `TenantProvisionedEvent`; features là JSONB map | **Projection** — `ct-saas-tenant` là SoT |
| `branches` | V1 (init) + V4 (drop address/contact cols) | Branch master/support data; `branch_code`, `status`, `is_default`, `additional_config` JSONB | **Owned** — `gf-system` SoT cho GMS branch lifecycle |
| `outbox_events` | V2 | Reliable Kafka relay state (PENDING → PROCESSING → PUBLISHED/FAILED); `FOR UPDATE SKIP LOCKED` | **Owned** |
| `sequences` + function `get_next_number` | V3 | Counter sinh mã (vd branch code per tenantCode); atomic increment + auto-init | **Owned** |
| `tenant_invoice_info` | V5 | Thông tin xuất hóa đơn theo tenant; optimistic lock via `@Version`; unique per `tenant_id` | **Owned** — SoT cho GMS invoice info |
| `inbox_event` | V5 | Idempotency tracking cho command listeners; PK = `event_id` (messageId) | **Owned** |
| `tenant_transporter_registry` | V6 | Nhà vận chuyển nội bộ; soft-delete (`is_deleted`); manual Long version; unique `(tenant_id, route_contact_phone_number)` WHERE `is_deleted=FALSE` | **Owned** |

**Tenant boundary:**
- `tenant_subscriptions.tenant_id` unique; `branches.tenant_id` FK; `tenant_invoice_info.tenant_id` unique; `tenant_transporter_registry.tenant_id` không FK vật lý
- `outbox_events` **không có `tenant_id` column** — lấy từ `partition_key` / payload (open HLD-SYSTEM-002)
- `sequences` dùng `sequence_name = tenantCode` để phân biệt per-tenant

**KHÔNG own:**
- Tenant source-of-truth (`ct-saas-tenant`)
- Warehouse / inventory state (`gf-inventory`)
- User / employee lifecycle (`gf-hrms`, `ct-saas-tenant`)
- Subscription billing / payment (control plane)

---

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Tenant provisioning consume lag p95 | ≤ 5s (tenant tạo → cache + branch ready) |
| Default branch create p95 (incl. sequence + persist) | ≤ 300ms |
| Branch lifecycle publish p95 | ≤ 100ms (DIRECT Kafka, no outbox hop) |
| Transporter REST create/update p95 | ≤ 200ms |
| Invoice info REST read p95 | ≤ 100ms (DB read by `tenant_id` unique index) |
| Outbox polling interval | 60s (`OUTBOX_POLLING_INTERVAL_MS=60000`) |
| Outbox batch size | 10 (`OUTBOX_BATCH_SIZE=10`) |
| Outbox retry max | configurable; sau max → status `FAILED` |
| Outbox lock | `FOR UPDATE SKIP LOCKED` — multi-replica safe |
| Idempotency — tenant cache | Upsert by `tenantId` |
| Idempotency — default branch | `existsByTenantIdAndIsDefaultTrue` guard |
| Idempotency — command listeners | `inbox_event.event_id = messageId`; duplicate → DataIntegrityViolationException → ack + skip |
| Idempotency — invoice info upsert | Unique `tenant_id` column; upsert by tenantId |
| Duplicate guard — transporter | Unique `(tenant_id, route_contact_phone_number)` WHERE `is_deleted=FALSE` |
| Multi-replica | Scale theo Kafka partition; outbox `SKIP LOCKED` safe |
| Schema migration | Flyway enabled, `ddl-auto=none`, validate-on-migrate, V1-V6 |
| Async executor | `messagingTaskExecutor` (bean từ common messaging library; xem TECHSTACK §messaging) |
| Runtime | Java 21, Spring Boot 3.5.0 |

---

## 7. Forbidden Actions

- ❌ Expose **public** REST API (`/api/*`) cho tenant subscription cache / branch / sequence / outbox data (boundary invariant — transporter registry public API và invoice info protected API đã phê duyệt).
- ❌ Treat `tenant_subscriptions` như source-of-truth (BR-GF-SYSTEM-002 — projection only; `ct-saas-tenant` SoT; mọi update phải đi qua `TenantProvisionedEvent`).
- ❌ Overwrite invoice info field đã có từ luồng Garage REST (BR-GF-SYSTEM-006 — chỉ fill-blank; COP là authoritative).
- ❌ Process tenant provisioning event không kiểm `MessageGroup` + `MessageStep` + `tenantType` filter (BR-GF-SYSTEM-001 — topic share, sẽ tạo branch nhầm cho non-GARAGE tenant).
- ❌ Skip feature flag guard `Inventory:InventoryStockV01` khi tạo default branch (BR-GF-SYSTEM-001/003 — rollback path bị phá).
- ❌ Tạo branch không qua `existsByTenantIdAndIsDefaultTrue` idempotency check (BR-GF-SYSTEM-003 — event replay → duplicate branch).
- ❌ Hard-delete `tenant_transporter_registry` record (BR-GF-SYSTEM-012 — phải soft-delete và publish DELETED event; audit trail).
- ❌ Hard-delete `outbox_events` (audit invariant; open HLD-SYSTEM-005 — dùng cleanup retention job).
- ❌ Skip inbox idempotency check trong command listeners (BR-GF-SYSTEM-009/014 — Kafka có thể redeliver; duplicate command tạo side-effect sai).
- ❌ Log raw `TenantProvisionedEvent` / `BranchPayload` body chứa contact info (`address`, `phone`, `email`, `taxCode`) — PII risk (open HLD-SYSTEM-007).
- ❌ Sinh `branch_code` với raw `city` không normalize (BR-GF-SYSTEM-004; open HLD-SYSTEM-003 — mismatch với `{CITY_CODE}`; tiếng Việt có dấu/không dấu).
- ❌ Override `originTenantId` từ payload mà không re-set từ Kafka header (BR-GF-SYSTEM-007/014 — cross-tenant leak risk).
- ❌ Publish branch lifecycle event qua outbox stack cho đến khi HLD-SYSTEM-001 chốt migration (BR-GF-SYSTEM-005; open HLD-SYSTEM-001 — hiện tại DIRECT publish là approved path).

---

## 8. References

- **TECHSTACK**: §platform-service, §outbox-pattern, §feature-flag, §kafka
- **API spec**: [gf-system-api.md](../api/gf-system-api.md) — 6 endpoints: 4 transporter CRUD/search + 2 invoice info GET/PUT
- **Events spec**: [tenant-system-events.md](../events/tenant-system-events.md) — tenant provisioning + branch lifecycle boundary; bao gồm `TenantInvoiceInfoUpdatedEvent` (§3.7) và `TenantTransporterRegistryEvent` (§3.8).
- **Workflows**:
  - [system-tenant-branch-provisioning-flow.md](../workflows/system-tenant-branch-provisioning-flow.md) — full flow tenant provisioning → cache + default branch + lifecycle event.
- **Business rules**: BR-GF-SYSTEM-001..014 (14 rules; cornerstone: all) — in KG `gf-system.knowledge-graph.yaml`
- **Data model**: [gf-system-data-model.md](../data/gf-system-data-model.md) — 7 tables, sequence function, Flyway V1-V6 migration.
- **KG**: [gf-system.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-system.knowledge-graph.yaml) — executable spec cho AI agents; synced với source code 2026-05-14.
- **Cross-link HLD**:
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — primary downstream consumer (branch → warehouse)
  - [gf-erp-agent-HLD.md](gf-erp-agent-HLD.md) — consume `TenantActivated` (sister event family)

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (REST Controllers + Kafka Consumers → TenantSubscriptions/Branch/InvoiceInfo/TransporterRegistry services + EventPublisher → JPA/Flyway/Kafka outbox) + connector `┬`/`▼`; **không external REST downstream** (Kafka-driven) → chỉ Kafka P (BRANCH-LIFECYCLE direct + invoice/transporter outbox) / C (3 topics) ở footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2.3 | Align HLD với KG v2 + v2 HLD pattern: (GAP-1) thêm Java 21/SB 3.5.0 vào Overview + diagram + §6 QA Runtime; (GAP-2) thêm Business rules line BR-GF-SYSTEM-001..014 vào §8; (GAP-3) thêm BR citations cho 12/13 forbidden actions; (GAP-4) sửa Inbound caller "Garage Web" → `agg-garage-graph`; (GAP-5) cập nhật KG synced date 2026-05-14. |
| 2026-05-12 | v2.2 | Fix §8 References: bổ sung 2 events mới §3.7/§3.8 đã có từ v2. |
| 2026-05-07 | v1 | Initial HLD: Kafka consumer/publisher + outbox + PostgreSQL (4 tables); consume TenantProvisionedEvent → tạo branch → publish BranchCreatedEvent (DIRECT). |
| 2026-05-12 | v2.1 | Fix MessageStep names transporter registry (command + event); làm rõ messagingTaskExecutor từ common messaging library. |
| 2026-05-12 | v2 | Update lên V6: thêm 2 REST controllers, 2 Kafka command consumers (inbox idempotency), 3 bảng mới, đổi tên tenant_subscriptions_cache→tenant_subscriptions; outbox cho 2 topic mới; xóa BranchActivatedEvent. |
