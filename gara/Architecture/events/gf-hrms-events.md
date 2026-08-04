---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: hrms
last_reviewed: "2026-05-07"
---

# Events — `hrms` boundary

> Producer = `gf-hrms`. Convention chung xem [`_CONVENTIONS.md`](_CONVENTIONS.md).
>
> Boundary này phát 6 outbound event lifecycle nhân sự (provision/disable/enable SSO + terminate + role/branch change) qua outbox pattern; consume 4 inbound event kết quả từ IAM/SSO (ct-saas-tenant) để cập nhật `keycloak_user_id` / `iam_creation_status` của `Employee`.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-hrms` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.hrms.*` (planned) |
| Total events | 6 outbound + 4 external-source inbound |
| Reliability | `outbox_events` table (`OutboxEvent` aggregate) + `OutboxEventCreatedEvent` `@TransactionalEventListener(AFTER_COMMIT)` + scheduled retry (`OutboxProcessor`); consumer dedup qua `inbox_events` |
| Canonical envelope | Domain DTO trực tiếp (`BaseEvent` + concrete subtype) serialize JSON — KHÔNG dùng `KafkaMessageWrapper` (anomaly so với gf-purchase / gf-customer) |

Ghi chú source-aligned:

- `EmployeeOutboxPublisher` (`application/service/impl/`) là entry point publish — gọi `OutboxEvent.create("EMPLOYEE-GARAGE", employeeId, eventType, jsonPayload, topic)` rồi `outboxRepository.save(...)` + `eventPublisher.publishEvent(new OutboxEventCreatedEvent(saved.getId()))`.
- `OutboxEventListener.onOutboxEventCreated` xử lý `AFTER_COMMIT` → `kafkaTemplate.send(topic, key, payload)`.
- Topic config tại `kafka.topics.*` trong `application.yml` — env override qua `TOPIC_*` variables.
- `BaseEvent` không có field `tenantId` ở envelope level; mọi concrete event đặt `tenantId` trong payload.

---

## 2. Catalog

> **Producer-view only** trong §2.1. §2.2 document inbound từ external producer (IAM/SSO qua `ct-saas-tenant`) vì external không có canonical doc.

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `TenantUserProvisionRequestedEvent` | `AC-DEV-TENANT-USER-PROVISION-REQUESTS` | `EmployeeService.provisionSso()` / `create()` cho tenant `GARAGE` cần SSO account | `ct-saas-tenant` (IAM bridge) | ≤ 30s | `source-aligned-producer-only` | — |
| 2 | `TenantUserDisableRequestedEvent` | `AC-DEV-TENANT-USER-DISABLE-REQUESTS` | `EmployeeService.disableSso()` cho employee có `iam_user_id` | `ct-saas-tenant` (IAM bridge) | ≤ 30s | `source-aligned-producer-only` | — |
| 3 | `TenantUserEnableRequestedEvent` | `AC-DEV-TENANT-USER-ENABLE-REQUESTS` | `EmployeeService.enableSso()` re-enable account | `ct-saas-tenant` (IAM bridge) | ≤ 30s | `source-aligned-producer-only` | — |
| 4 | `EmployeeTerminatedEvent` | `AC-DEV-EMPLOYEE-TERMINATED` | Employee terminate flow — broadcast cho downstream observers | downstream observers (TBD) | ≤ 30s | `source-aligned-producer-only` | — |
| 5 | `EmployeeRoleChangedEvent` | `AC-DEV-EMPLOYEE-ROLE-CHANGED` | Role transition logged khi `primary_role` thay đổi | downstream observers (TBD) | ≤ 30s | `source-aligned-producer-only` | — |
| 6 | `EmployeeBranchChangedEvent` | `AC-DEV-EMPLOYEE-BRANCH-CHANGED` | Branch transition logged khi `branch_id` thay đổi | downstream observers (TBD) | ≤ 30s | `source-aligned-producer-only` | — |

### 2.2 Inbound — external-source

> Producer là IAM/SSO bridge (`ct-saas-tenant`) — `gf-hrms` owns schema mirror (DTO trong `application.dto.event`).

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 7 | `TenantUserCreatedEvent` | `AC-DEV-TENANT-USER-CREATED-RESULTS` | External: `ct-saas-tenant` (IAM) | `TenantUserCreatedConsumer` → inbox dedup theo `eventId` → `EmployeeService` cập nhật `keycloak_user_id`/`iam_user_id` | ≤ 60s | `consumer-only-confirmed` | filter `tenantType=GARAGE` |
| 8 | `TenantUserProvisionedEvent` / `TenantUserProvisionFailedEvent` | `AC-DEV-TENANT-USER-PROVISION-RESULTS` | External: `ct-saas-tenant` (IAM) | `TenantUserProvisionedConsumer` → dispatch theo `eventType`: success → `handleTenantUserProvisioned`; failed → `handleTenantUserProvisionFailed` | ≤ 60s | `consumer-only-confirmed` | multi-step: route theo `eventType` |
| 9 | `TenantUserDisabledEvent` | `AC-DEV-TENANT-USER-DISABLE-RESULTS` | External: `ct-saas-tenant` (IAM) | `TenantUserDisabledConsumer` → cập nhật `Employee.iam_status=INACTIVE` | ≤ 60s | `consumer-only-confirmed` | — |
| 10 | `TenantUserEnabledEvent` | `AC-DEV-TENANT-USER-ENABLE-RESULTS` | External: `ct-saas-tenant` (IAM) | `TenantUserEnabledConsumer` → cập nhật `Employee.iam_status=ACTIVE` | ≤ 60s | `consumer-only-confirmed` | — |

> **SLA convention**: ≤ 5s critical (UX-blocking) / ≤ 10s normal / ≤ 30s low / `N/A` config-only.
>
> **Status tag** (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §11): 5 chuẩn — không tự thêm variant.

---

## 3. Schemas

> Mỗi event có **4 phần**: **Trigger** / **Payload** / **Idempotency** / **Critical use case** _(optional)_. `BaseEvent` envelope = `{eventId, eventType, eventVersion, timestamp, source}`.

### 3.1 `TenantUserProvisionRequestedEvent`

**Trigger**: `EmployeeService.create()` hoặc `EmployeeService.provisionSso()` cho employee thuộc tenant `GARAGE` mà chưa có `iam_user_id`.
Source call-site: `EmployeeOutboxPublisher.publishProvisionSsoEvent` → `OutboxEvent.create("EMPLOYEE-GARAGE", employeeId, "TenantUserProvisionRequestedEvent", json, kafkaTopics.getProvisionRequests())`.

**Payload** (JSON value, không envelope `KafkaMessageWrapper`):
```json
{
  "eventId": "uuid",
  "eventType": "TenantUserProvisionRequestedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "gf-hrm",
  "tenantId": "BIGINT — multi-tenant context",
  "tenantType": "enum: GARAGE",
  "employeeId": "BIGINT",
  "employeeCode": "string",
  "email": "string | null",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string — primaryRole nếu ssoRole null",
  "branchId": "BIGINT | null"
}
```

**Idempotency**:
- Producer: outbox row unique theo `OutboxEvent.id` + `eventId` (UUID gen mỗi event).
- Consumer (IAM/SSO): expected dedup theo `eventId`.

### 3.2 `TenantUserDisableRequestedEvent`

**Trigger**: `EmployeeService.disableSso()` cho employee có `iam_user_id`.
Source call-site: `EmployeeOutboxPublisher.publishDisableSsoEvent`.

**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "TenantUserDisableRequestedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "gf-hrm",
  "tenantId": "BIGINT",
  "employeeId": "BIGINT",
  "iamUserId": "string"
}
```

**Idempotency**: outbox unique + `eventId`.

### 3.3 `TenantUserEnableRequestedEvent`

**Trigger**: `EmployeeService.enableSso()` re-enable employee đã disabled.
Source call-site: `EmployeeOutboxPublisher.publishEnableSsoEvent`.

**Payload**: shape giống §3.2 với `eventType="TenantUserEnableRequestedEvent"`.

**Idempotency**: outbox unique + `eventId`.

### 3.4 `EmployeeTerminatedEvent`

**Trigger**: Employee terminate workflow.
Source call-site: `EmployeeOutboxPublisher.publishTerminatedEvent(tenantId, employee, reason)`.

**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "EmployeeTerminatedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "gf-hrm",
  "tenantId": "BIGINT",
  "employeeId": "BIGINT",
  "iamUserId": "string | null",
  "phone": "string",
  "reason": "string"
}
```

**Idempotency**: outbox unique + `eventId`.

### 3.5 `EmployeeRoleChangedEvent`

**Trigger**: `Employee.primary_role` thay đổi.
Source call-site: `EmployeeOutboxPublisher.publishRoleChangedEvent(tenantId, employee, oldRole, newRole)`.

**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "EmployeeRoleChangedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "gf-hrm",
  "tenantId": "BIGINT",
  "employeeId": "BIGINT",
  "iamUserId": "string | null",
  "oldRole": "string",
  "newRole": "string"
}
```

**Idempotency**: outbox unique + `eventId`.

### 3.6 `EmployeeBranchChangedEvent`

**Trigger**: `Employee.branch_id` thay đổi.
Source call-site: `EmployeeOutboxPublisher.publishBranchChangedEvent(tenantId, employee, oldBranchId, newBranchId)`.

**Payload**:
```json
{
  "eventId": "uuid",
  "eventType": "EmployeeBranchChangedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "gf-hrm",
  "tenantId": "BIGINT",
  "employeeId": "BIGINT",
  "iamUserId": "string | null",
  "oldBranchId": "BIGINT | null",
  "newBranchId": "BIGINT"
}
```

**Idempotency**: outbox unique + `eventId`.

### 3.7 `TenantUserCreatedEvent` _(inbound external)_

**Producer source**: `ct-saas-tenant` IAM bridge — phát khi IAM tạo Keycloak user thành công.

**Trigger upstream**: IAM nhận `TenantUserProvisionRequestedEvent` (hoặc trigger khác từ tenant lifecycle) → tạo Keycloak account → publish kết quả.

**Payload** (raw DTO):
```json
{
  "eventId": "uuid",
  "eventType": "TenantUserCreatedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601 UTC",
  "source": "ct-saas-tenant",
  "tenantId": "BIGINT",
  "tenantType": "enum: GARAGE | ...",
  "keycloakUserId": "string",
  "iamUserId": "string",
  "tempPassword": "string — to be removed in hardening (PCI-adjacent)",
  "phone": "string",
  "emailAddress": "string",
  "roleCode": "string",
  "avatarUrl": "string | null",
  "fullName": "string",
  "iamCreationStatus": "enum: PENDING | SUCCEED | FAILED",
  "status": "enum: INIT | ACTIVE | INACTIVE | NULL"
}
```

**Consumer logic** (`TenantUserCreatedConsumer`):
1. Consume topic `${kafka.topics.created-results}` (default `AC-DEV-TENANT-USER-CREATED-RESULTS`).
2. `transactionTemplate.executeWithoutResult` → `processMessage`.
3. Filter `tenantType=GARAGE` (skip otherwise).
4. `inboxRepository.save(InboxEvent.create(eventId, eventType))` — `DataIntegrityViolationException` = duplicate, ack & skip.
5. `EmployeeService.handleTenantUserCreated(...)` — gắn `keycloak_user_id` / `iam_user_id` vào `Employee`.
6. `acknowledgment.acknowledge()`.

**Idempotency**: inbox unique constraint trên `event_id`; manual ack pattern.

### 3.8 `TenantUserProvisionedEvent` / `TenantUserProvisionFailedEvent` _(inbound external, multi-step route)_

**Producer source**: `ct-saas-tenant` IAM bridge — kết quả của `TenantUserProvisionRequestedEvent`.

**Consumer logic** (`TenantUserProvisionedConsumer`):
1. Consume topic `${kafka.topics.provision-results}`.
2. `JsonUtils.toObject(message, TenantUserProvisionedEvent.class)` để đọc `eventType`.
3. Route theo `eventType`:
   - `TenantUserProvisionedEvent` → `service.handleTenantUserProvisioned(base)`.
   - `TenantUserProvisionFailedEvent` → re-deserialize sang `TenantUserProvisionFailedEvent` → `service.handleTenantUserProvisionFailed(event)`.
4. Cả 2 nhánh: filter `tenantType=GARAGE` + `inboxRepository.save(InboxEvent.create(eventId, eventType))` trước khi xử lý.

**Idempotency**: inbox dedup theo `eventId`; transaction rollback nếu fail; `DataIntegrityViolationException` = duplicate.

### 3.9 `TenantUserDisabledEvent` _(inbound external)_

**Producer source**: `ct-saas-tenant` IAM bridge.

**Consumer logic** (`TenantUserDisabledConsumer`): consume `${kafka.topics.disable-results}` → inbox dedup → `EmployeeService` set `iam_status=INACTIVE`.

### 3.10 `TenantUserEnabledEvent` _(inbound external)_

**Producer source**: `ct-saas-tenant` IAM bridge.

**Consumer logic**: consume `${kafka.topics.enable-results}` → inbox dedup → `EmployeeService` set `iam_status=ACTIVE`.

---

## 4. Forbidden patterns

- ❌ Publish HRMS event trước khi DB transaction commit — phải dùng `OutboxEvent` + `@TransactionalEventListener(AFTER_COMMIT)`.
- ❌ Bao gồm `tempPassword` plaintext trong log hoặc bất kỳ outbound event nào (`TenantUserCreatedEvent` chứa field này từ external — KHÔNG re-publish nguyên dạng; mask hoặc strip trước khi forward).
- ❌ Skip `tenantType=GARAGE` filter ở `*Consumer` — sẽ ghi đè employee của tenant khác (cross-tenant violation).
- ❌ Publish `EmployeeTerminatedEvent` cho employee chưa có `iam_user_id` (không có downstream side effect → noise).
- ❌ Re-create `OutboxEvent` cùng `eventId` (UUID) — outbox row id là idempotency key; luôn dùng new UUID per call.
- ❌ Bỏ `inbox_events` dedup ở consumer — at-least-once delivery sẽ duplicate state update.
- ❌ Tạo inbound section trong file consumer khác (vd `gf-system`) cho event mà `gf-hrms` publish — `gf-hrms` là producer, đọc §2.1 file này.

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- IAM bridge (external): `ct-saas-tenant` — không có canonical doc trong repo này; schema mirror tại §3.7–§3.10
- Knowledge graph: [`gf-hrms.knowledge-graph.yaml`](../../Execution/knowledge-graphs/gf-hrms.knowledge-graph.yaml) §events
- Code anchors:
  - Producer: `gf-hrms/src/main/java/com/actechx/gf/application/service/impl/EmployeeOutboxPublisher.java`
  - Consumers: `gf-hrms/src/main/java/com/actechx/gf/infrastructure/kafka/consumer/TenantUser*Consumer.java`
  - Outbox infra: `gf-hrms/src/main/java/com/actechx/gf/infrastructure/outbox/OutboxEventListener.java`
  - Topic config: `gf-hrms/src/main/resources/application.yml` §`kafka.topics`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `hrms` boundary: 6 outbound (`TenantUserProvisionRequested/DisableRequested/EnableRequested/EmployeeTerminated/RoleChanged/BranchChanged`) qua `OutboxEvent` + `@TransactionalEventListener(AFTER_COMMIT)`; 4 inbound external từ `ct-saas-tenant` IAM (`TenantUserCreated/Provisioned (+Failed)/Disabled/Enabled`) với inbox dedup pattern. Status tag: producers `source-aligned-producer-only`, consumers `consumer-only-confirmed`. |
