---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-hrms
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-hrms-api.md
  - ../events/gf-hrms-events.md
  - ../data/gf-hrms-data-model.md
---

# HLD — `gf-hrms`

## 1. Overview

`gf-hrms` là service T1 phụ trách **quản lý hồ sơ nhân viên theo tenant**, lifecycle trạng thái làm việc (ACTIVE/SUSPENDED/TERMINATED), lifecycle SSO qua Kafka outbox/inbox (provision/disable/enable), lịch sử thay đổi trạng thái và vai trò, validation province/ward bằng cache MDM, và migration dữ liệu nhân viên từ `ct-saas-tenant`/IAM. Service event-driven cho SSO — employee tồn tại độc lập với tài khoản SSO.

**Trách nhiệm:**
- Employee CRUD + lifecycle management: create, update, terminate, suspend, reactivate.
- SSO lifecycle via Kafka outbox: publish provision/disable/enable requests, consume result events từ IAM pipeline.
- Status + role change history: append-only audit tables cho mọi transition.
- Province/ward validation: Redis cache nạp từ `gf-erp-mdm`, evict/reload qua protected API.
- Employee code generation: `EMP-{tenantId}-{seq}` từ custom `sequences` table + DB function `get_next_number`.
- Migration: bulk import employee từ `ct-saas-tenant` + bulk role migration sang IAM.

**Owned epic**: cross-cutting platform — quản lý nhân viên xuyên các module nghiệp vụ. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌─────────── gf-hrms  (Java 21 · Spring Boot 3.5.0) ────────────┐
│  ┌────────────┐ ┌──────────────────┐ ┌─────────────┐          │
│  │ EmployeeCtrl│ ProtectedEmployee│ Kafka       │             │
│  │ /api/v1 (12)│ │ Ctrl·Validation- │ │ Consumers   │         │
│  │ @FeatureOn  │ │ CacheCtrl        │ │ TenantUser  │         │
│  │ HRM_KEY     │ │ /protected (x-api)│ Created/Prov│          │
│  └─────┬───────┘ └────────┬─────────┘ │ /Disabled/  │         │
│        │                  │           │ Enabled (4) │         │
│        │                  │           └──────┬──────┘         │
│  ┌─────▼──────────────────▼─────────────────▼──────┐          │
│  │ APP / DOMAIN SERVICES                          │           │
│  │  EmployeeServiceImpl (CRUD·lifecycle·SSO)·     │           │
│  │  EmployeeMigrationServiceImpl·                 │           │
│  │  ValidationCacheServiceImpl·EmployeeOutboxPub  │           │
│  │   - 2 state machines: employment + sso_status  │           │
│  └─────┬───────────────────────────┬──────────────┘           │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐              │
│  │ JPA/Flyway │ │ Kafka outbox │ │ HttpClients │              │
│  │ [gf_hrms]  │ │ +producer    │ │ (x-api-key) │──────────────┼─► sec-iam-service (SSO role batch)
│  │ +Redis     │ │ 6 topics     │ │             │──────────────┼─► ct-saas-tenant (all-users)
│  │ cache      │ │              │ │             │──────────────┼─► gf-erp-mdm (province/ward validate)
│  └─────┬──────┘ └──────┬───────┘ └─────────────┘              │
│  outbox │ /api/v1/* │ /protected/v1/* │ Actuator+OTLP         │
└───────┴──────────────┴────────────────────────────────────────┘
        ▼                ▼
   PostgreSQL [gf_hrms]         Kafka P: 6 topics (SSO·terminated·
   employees·histories·V1-V4    role·branch) ; C: 4 TenantUser events
   + Redis (province/ward cache)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Employee là aggregate root local với `primary_role` enum | Role là first-class attribute; không phụ thuộc policy-agent cho role resolution — giảm outbound calls | TECHSTACK §user-roster |
| SSO lifecycle qua Kafka outbox/inbox thay vì sync REST | Decouple employee creation khỏi SSO provisioning; employee tồn tại độc lập SSO. Eventual consistency chấp nhận được | TECHSTACK §outbox-pattern |
| Hai state machine độc lập: `employment_status` + `sso_status` | Employment và SSO là orthogonal — terminate employee KHÔNG auto-disable SSO (BR-GF-HRMS-017). Đơn giản hơn v1 3-tier coupled | TECHSTACK §state-machine |
| Append-only history tables cho status/role changes | Audit trail; không update/delete rows; employee_id logical reference, không FK vật lý | ADR-009-jpa-entity-no-relationship-mapping |
| Employee code qua custom `sequences` table + DB function | Sequence per tenant (`EMPLOYEE-{tenantId}`); `REQUIRES_NEW` transaction cho gap-free numbering | source `SequenceUtils.getNextSequence` |
| Province/ward validation qua Redis-cached MDM | Tránh sync REST mỗi create/update; cache nạp từ gf-erp-mdm, evict/reload qua protected API. Null bypass validation | source `CityValidator` + `ValidationCacheServiceImpl` |
| Feature flag `HRM:HRMV01` gate toàn bộ employee endpoints | Gradual rollout per tenant; `ValidationCacheController` cố ý ungated (admin infrastructure) | TECHSTACK §feature-flag |
| Java 21 + Spring Boot 3.5.0 | Align với toàn bộ platform services | TECHSTACK §runtime |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF) | Sync REST `/api/v1/employees` (JWT) | Employee CRUD, lifecycle, SSO actions, role change — 12 active public endpoints |
| `gf-sales` | Sync REST `/protected/v1/employees/{tenantId}/{id}` (x-api-key) | SVC-to-SVC employee fetch |
| `gf-notification` | Sync REST `/protected/v1/employees/{tenantId}/{id}` (x-api-key) | Employee search cho CARDOCTOR-broadcast notification |
| External IAM / tenant pipeline | Async consume Kafka (4 topics) | TenantUser Created/Provisioned/Disabled/Enabled result events |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `sec-iam-service` (IAM) | Sync REST + x-api-key | Bulk role migration (`PUT /protected/users/batch/role`) |
| `ct-saas-tenant` (Tenant) | Sync REST + x-api-key | Fetch user list for migration (`GET /protected/v1/saas-tenant/all-users`) |
| `gf-erp-mdm` (MDM) | Sync REST + x-api-key | Validate province/ward catalog (`/protected/catalog/v1/verify-existed`, `/protected/catalog/v1/inquiry`) |
| Kafka | Async publish (6 topics) | SSO provision/disable/enable requests + employee terminated/role-changed/branch-changed via outbox; link [gf-hrms-events.md](../events/gf-hrms-events.md) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:gf_hrms}` — 6 tables |
| Redis | Cache | Validation province/ward cache từ gf-erp-mdm |
| spring-feature-flag-starter 0.0.9-SNAPSHOT | Feature gate | `@FeatureOn(HRM:HRMV01, fallback=THROW_EXCEPTION)` class-level trên `EmployeeController` + `ProtectedEmployeeController` |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `gf_hrms` schema)** — chi tiết physical schema xem [data/gf-hrms-data-model.md](../data/gf-hrms-data-model.md):

| Table | Vai trò | Tenant strategy |
|---|---|---|
| `employees` | Employee aggregate: `tenant_id`, `employee_code` (EMP-{tenantId}-{seq}), personal info (first/last name, phone, email, national_id, birth_date, address, province, ward), `primary_role` (9 enum values), `branch_id`, `employment_status`, `sso_status`, `keycloak_user_id`, `iam_user_id`, `hired_at`, `terminated_at` | `tenant_id` column; mọi public query tenant-scoped qua `SecurityUtils` |
| `employee_status_histories` | Append-only audit: employment status transitions (from → to + reason + changed_by + changed_at) | `tenant_id` column; no FK vật lý tới employees |
| `employee_role_histories` | Append-only audit: role transitions (from → to + reason + changed_by + changed_at) | `tenant_id` column; no FK vật lý tới employees |
| `outbox_event` | Kafka outbox relay: `event_type`, `payload`, `topic`, `status` (PENDING/SENT/FAILED), `retry_count`, aggregate_type `EMPLOYEE-GARAGE` | ⚠️ **không có `tenant_id`** — tenant nằm trong payload |
| `inbox_event` | Duplicate guard: `event_id` (PK), `event_type`, `processed_at` | KHÔNG `tenant_id` — event-level identity |
| `sequences` | Custom sequence: `sequence_name` (PK, format `EMPLOYEE-{tenantId}`), `current_value`, `increment_by` + DB function `get_next_number` | Tenant encoded trong `sequence_name` |

**State machines**:

| State field | Values | Lifecycle |
|---|---|---|
| `employment_status` | `ACTIVE` ↔ `SUSPENDED`, `ACTIVE` → `TERMINATED`, `SUSPENDED` → `TERMINATED`, `TERMINATED` → `ACTIVE` | `EmploymentStatus.validateTransition`; mỗi transition append `employee_status_histories` |
| `sso_status` | `NONE`/`FAILED` → `PROVISIONING` (provision); `PROVISIONING` → `ACTIVE`/`FAILED` (result event); `ACTIVE` → `DISABLED` (disable); `DISABLED` → `PROVISIONING` (enable) | SSO decoupled khỏi employment status (BR-GF-HRMS-017) |

**PII / sensitive**: `first_name`, `last_name`, `phone`, `email`, `address`, `national_id`, `birth_date`, `profile_image_url`. Identity reference: `keycloak_user_id`, `iam_user_id`, `tenant_id`.

**KHÔNG own**:
- IAM/SSO source-of-truth (`sec-iam-service` via Keycloak)
- Tenant master data (`ct-saas-tenant`)
- Province/ward master data (`gf-erp-mdm`) — chỉ cache validation
- Branch master data (external reference qua `branch_id`)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Employee search p95 (tenant-scoped, paged) | ≤ 400ms |
| Employee detail p95 | ≤ 200ms |
| Employee create p95 (DB + outbox write, async SSO) | ≤ 500ms |
| Employee update p95 (no role change) | ≤ 400ms |
| Employee lifecycle action p95 (terminate/suspend/reactivate) | ≤ 500ms |
| SSO provision request p95 (outbox write only) | ≤ 300ms |
| SSO result processing p95 (inbound event → DB update) | ≤ 500ms |
| Outbox max retries | 3 (`outbox.max-retries`) |
| Kafka consumer ack | `MANUAL_IMMEDIATE` per consumer |
| Migration batch size | 1000 (default từ `ct-saas-tenant` fetch) |
| HTTP client pool | 50 total / 50 per route |
| HTTP timeout | 30s (`HTTP_CLIENT_TIMEOUT_SECONDS=30`) |
| Multi-replica | Stateless; outbox processor cần verify concurrent safety (open HLD-HRMS-010) |
| Schema migration | Flyway enabled (V1.0.0 → V1.0.4), `ddl-auto=none` |
| Runtime | Java 21, Spring Boot 3.5.0 |

## 7. Forbidden Actions

- ❌ Public API skip tenant scope — mọi query phải qua `SecurityUtils.getCurrentTenantIdAsLong()` + repository tenant-scoped (BR-GF-HRMS-003).
- ❌ Hard-delete employee / status history / role history — audit invariant; dùng `employment_status=TERMINATED` (BR-GF-HRMS-005).
- ❌ Log raw PII (`first_name`, `last_name`, `phone`, `email`, `national_id`, `birth_date`, `address`) ra log tập trung — cần masking layer (open HLD-HRMS-008).
- ❌ Deploy production với `INTERNAL_API_KEY` rỗng — phải fail-fast khi profile ≠ local (open HLD-HRMS-004).
- ❌ Internal `/protected/v1/employees/migrate-*` expose ra public — migration có blast radius lớn, phải gateway/security filter chặn (open HLD-HRMS-003).
- ❌ Bật `@Retryable` mà không enable `@EnableRetry` ở config — retry không chạy nhưng code giả định có (open HLD-HRMS-007).
- ❌ Publish EmployeeTerminatedEvent khi terminate/suspend — cố ý decoupling employment status khỏi SSO để giữ tài khoản tenant_user active trên SSO (BR-GF-HRMS-017).
- ❌ Publish Kafka event trước khi DB transaction commit — phải dùng OutboxEvent + `@TransactionalEventListener(AFTER_COMMIT)` (BR-GF-HRMS-012).
- ❌ Skip `tenantType=GARAGE` filter trong Kafka consumers — cross-tenant violation (BR-GF-HRMS-011).
- ❌ Skip InboxEvent duplicate guard khi consume event — at-least-once delivery sẽ duplicate state (BR-GF-HRMS-011).
- ❌ Provision SSO từ status khác NONE hoặc FAILED — vi phạm SSO state machine (BR-GF-HRMS-008).
- ❌ Update/provision-sso/enable-sso cho employee không ACTIVE — vi phạm employment status guard (BR-GF-HRMS-004).

## 8. References

- **TECHSTACK**: §user-roster, §outbox-pattern, §state-machine, §feature-flag, §runtime, §http-client
- **API spec**: [gf-hrms-api.md](../api/gf-hrms-api.md) — Public 12 employee endpoints (CRUD + lifecycle + SSO + role) + Protected 6 endpoints (internal-get + 2 migrate + 3 validation-cache) = 18 total.
- **Events spec**: [gf-hrms-events.md](../events/gf-hrms-events.md) — 6 outbound topics (3 SSO requests + terminated + role-changed + branch-changed) + 4 inbound topics (TenantUser created/provisioned/disabled/enabled results).
- **Data model**: [gf-hrms-data-model.md](../data/gf-hrms-data-model.md) — 6 tables, enum catalog (`EmployeeRole` 9 values, `EmploymentStatus`, `SsoStatus`, `OutboxStatus`).
- **Business rules**: BR-GF-HRMS-001..017 (in KG `gf-hrms.knowledge-graph.yaml`).
- **Open issues**:
  - open HLD-HRMS-003: migrate endpoints cần gateway/security filter guard
  - open HLD-HRMS-004: `INTERNAL_API_KEY` cần fail-fast
  - open HLD-HRMS-007: `@Retryable` trên REST clients cần verify `@EnableRetry` enabled
  - open HLD-HRMS-008: PII cần masking layer
  - open HLD-HRMS-010: outbox processor concurrent safety khi multi-replica (cần verify locking strategy)
  - open HLD-HRMS-011: EmployeeBranchChangedEvent — publisher method tồn tại nhưng NOT_YET_WIRED, `update()` không detect branch change
- **Cross-link HLD**:
  - [agg-garage-graph-HLD.md](agg-garage-graph-HLD.md) — BFF gateway exposing employee GraphQL surface
  - [gf-erp-mdm-HLD.md](gf-erp-mdm-HLD.md) — MDM province/ward validation source

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (EmployeeCtrl·ProtectedEmployeeCtrl·ValidationCacheCtrl + 4 Kafka Consumers → EmployeeService/Migration/ValidationCache/OutboxPub + 2 state machines → JPA/Flyway/Redis/Kafka/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`**: sec-iam-service·ct-saas-tenant·gf-erp-mdm; Kafka P:6/C:4 footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v2 + source audit: (F-01) domain model rewrite users/user_roles/user_attachments → employees + employee_status_histories + employee_role_histories + outbox_event + inbox_event + sequences (3→6 tables); (F-02) API paths /users → /employees, 13→18 endpoints (12 public lifecycle+SSO + 6 protected); (F-03) architecture shift: sync REST-only → event-driven Kafka outbox/inbox cho SSO lifecycle, 6 produced + 4 consumed topics; (F-04) state machine: 3-tier (status/creationStatus/migrateRoleStatus) → 2 independent (employment_status + sso_status); (F-05) dependencies: removed ct-conversation-client + gf-policy-agent, added gf-erp-mdm + Kafka; sec-iam-service reduced to bulk migration; (F-06) inbound callers: agg-garage-graph + gf-sales + gf-notification (was generic); (F-07) feature flag @FeatureOn HRM:HRMV01; (F-08) runtime Java 21 + Spring Boot 3.5.0; (F-09) forbidden actions updated for event-driven patterns + BR citations; (F-10) resolved HLD-HRMS-001 (Flyway populated), 002 (tenant-scoped phone), 005 (user_roles removed), 009 (Kafka exists); added HLD-HRMS-010 (outbox concurrent), 011 (BranchChanged unwired). |
| 2026-05-07 | v1 | Initial HLD cho `gf-hrms`: quản lý hồ sơ nhân viên/tài khoản người dùng theo tenant, 3 tables `users` (tenant_id PK, status/creationStatus/migrateRoleStatus 3-tier state), `user_roles` (external `group_id` + `role_id` từ policy-agent, soft delete), `user_attachments` (URL metadata, soft delete), public REST `/api/v1/users` (JWT bearer + Actions) + protected `/protected/v1/users` (x-api-key) cho sync (CREATE/UPDATE/DELETE), retry IAM/conversation, migration 3-step batch (tenant → policy → IAM), downstream `sec-iam-service` + `ct-conversation-client` + `gf-policy-agent` + `ct-saas-tenant` (HTTP pool 50, timeout 30s), Redis permission cache, Flyway V1.0.0 + V1.0.1 unaccent_vi. KHÔNG có domain Kafka publisher/listener. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `data/`. |
