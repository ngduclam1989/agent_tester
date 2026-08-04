---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: tenant-system
last_reviewed: "2026-05-19"
---

# Events - `tenant-system` boundary

> Producer boundary gồm `ct-saas-tenant`, `gf-system` và một nhánh `gf-inventory` đang phát bổ sung vào `branch-lifecycle`. Boundary này có 6 outbound active + 2 outbound `code-commented-out` + 6 external-source inbound (IAM/HR raw JSON DTO).
>
> Boundary này split §2.1 outbound + §2.2 inbound external-source per [`_CONVENTIONS.md §12`](_CONVENTIONS.md). Ưu tiên wire shape thực tế hơn schema mong muốn.

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer services | `ct-saas-tenant`, `gf-system`, `gf-inventory` (branch lifecycle WAREHOUSE step) |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.tenant_system.*` (planned) |
| Total events | 6 outbound active + 2 outbound `code-commented-out` (`TenantPolicySyncRequested`, `TenantUserSyncRequested`) + 6 external-source inbound (IAM/HR) |
| Reliability | Direct Kafka publish, chưa thấy outbox/inbox DB trong `ct-saas-tenant`; producer config `acks=all`, `retries=3`, idempotence enabled; consumer `AckMode.MANUAL_IMMEDIATE` và chưa thấy `DefaultErrorHandler`/DLQ riêng; `gf-system` dùng transactional outbox (`OutboxService` → `OutboxEventListener` AFTER_COMMIT + `OutboxScheduler` 60s fallback) cho `TenantInvoiceInfoUpdated` và `TenantTransporterRegistryEvent` |
| Canonical envelope | Common `Message`/`TenantMessage`/`BranchLifecycleMessage` với Kafka headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` cho tenant/branch lifecycle; tenant-user request/result và employee lifecycle vẫn là raw JSON/DTO theo source hiện tại |

---

## 2. Catalog

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `TenantProvisioned` | `AC-DEV-TENANT-PROVISIONING` | Tenant provisioning hoàn tất ở control plane | `gf-system`, `gf-inventory` | ≤ 30s | `confirmed-two-sided` | step `TENANT_PROVISIONED.1` |
| 2 | `BranchLifecycleChanged` | `AC-DEV-BRANCH-LIFECYCLE` | Branch default tạo ở `gf-system` (`BRANCH_CREATED.1`) hoặc warehouse default tạo ở `gf-inventory` (`WAREHOUSE_CREATED.1`) | `ct-saas-tenant`, `gf-inventory` | ≤ 30s | `confirmed-two-sided` | multi-step: route theo `MessageStep` |
| 3 | `TenantActivated` | `AC-DEV-TENANT-ACTIVATION` | Tenant/location activation phát sang ERP agent | `gf-erp-agent` (LOCATION handler) | ≤ 30s | `confirmed-two-sided` | step `ACTIVATED.1` |
| 4 | `TenantUserProvisionResult` (5 variants: Provisioned/ProvisionFailed/Created/Disabled/Enabled) | `AC-DEV-TENANT-USER-*-RESULTS` | Tenant service publish kết quả created/provisioned/enabled/disabled | External/unknown | ≤ 30s | `source-aligned-producer-only` | `tempPassword` trong `Provisioned`/`Created` — security risk |
| 5 | `TenantInvoiceInfoUpdated` | `AC-DEV-TENANT-INVOICE-INFO` | Invoice info upserted qua command flow | external/TBD | ≤ 30s | `source-aligned-producer-only` | step `TENANT_INVOICE_INFO_UPDATED`; outbox; cùng topic với command input, route bằng `MessageStep` |
| 6 | `TenantTransporterRegistryEvent` _(multi-step)_ | `AC-DEV-TENANT-TRANSPORTER-REGISTRY` | Transporter registry upserted/deleted qua command hoặc REST | external/TBD | ≤ 30s | `source-aligned-producer-only` | steps `TENANT_TRANSPORTER_REGISTRY_UPSERTED`/`TENANT_TRANSPORTER_REGISTRY_DELETED`; outbox; route bằng `MessageStep` |

> **Stripped 2026-05-19** (per source-of-truth audit): 2 rows `code-commented-out` (`TenantPolicySyncRequested`, `TenantUserSyncRequested`). `PolicyEventHelper` class KHÔNG tồn tại trong codebase; step `TENANT_CREATED.1` không có trong `MessageStep` enum. `TenantSyncUserPublisher` tồn tại nhưng mọi call-site (`ActiveTenantListener.syncUser()`, `SaasTenantServiceImpl`) đều commented out; `MessageStep` enum chỉ có `USER_1("USER.1")`, không có `USER_CREATED.1`/`USER_UPDATED.1`. Infrastructure giữ tại §3.4–§3.5 cho developer reference.

### 2.2 Inbound — external-source

| # | Event Family | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 9 | `TenantUserProvisionRequested` | `AC-DEV-TENANT-USER-PROVISION-REQUESTS` | External: IAM/HR | `TenantUserProvisionRequestConsumer` → `EmployeeService.handleTenantUserProvisionRequested`; create IAM user / activate existing; publish `TenantUserProvisionedEvent` | ≤ 30s | `consumer-only-confirmed` | raw JSON, no inbox dedup |
| 10 | `TenantUserDisableRequested` | `AC-DEV-TENANT-USER-DISABLE-REQUESTS` | External: IAM/HR | Consumer → deactivate local user, IAM `INACTIVE`, publish `TenantUserDisabledEvent` | ≤ 30s | `consumer-only-confirmed` | raw JSON, no inbox dedup |
| 11 | `TenantUserEnableRequested` | `AC-DEV-TENANT-USER-ENABLE-REQUESTS` | External: IAM/HR | Consumer → IAM `ACTIVE`, publish `TenantUserEnabledEvent` | ≤ 30s | `consumer-only-confirmed` | raw JSON, no inbox dedup |
| 12 | `EmployeeBranchChanged` | `AC-DEV-EMPLOYEE-BRANCH-CHANGED` | External: IAM/HR | `EmployeeBranchChangedConsumer` → update IAM `branchId` | ≤ 30s | `consumer-only-confirmed` | raw JSON; producer external/unknown |
| 13 | `EmployeeRoleChanged` | `AC-DEV-EMPLOYEE-ROLE-CHANGED` | External: IAM/HR | `EmployeeRoleChangedConsumer` → update IAM `role`; cập nhật `roleCode` | ≤ 30s | `consumer-only-confirmed` | raw JSON |
| 14 | `EmployeeTerminated` | `AC-DEV-EMPLOYEE-TERMINATED` | External: IAM/HR | `EmployeeTerminatedConsumer` → deactivate local user; nếu không còn active account khác cùng IAM user → publish `TenantUserDisabledEvent` | ≤ 30s | `consumer-only-confirmed` | raw JSON; cross-tenant same IAM user check |

---

## 3. Schemas

### 3.1 `TenantProvisioned`

**Trigger**: `ct-saas-tenant` publish `TenantMessage` khi provisioning hoàn tất.
Source headers/topic alignment:

| Service | Role | Property | Default |
|---|---|---|---|
| `ct-saas-tenant` | producer | `kafka.topics.tenant-provisioning` | `AC-DEV-TENANT-PROVISIONING` |
| `gf-system` | consumer | `kafka.topics.tenant-provisioning` | `AC-DEV-TENANT-PROVISIONING` |
| `gf-inventory` | consumer | `kafka.topics.tenant-provisioning` | `AC-DEV-TENANT-PROVISIONING` |

**Payload** (Kafka value `TenantMessage` (extends common `Message`) + headers `MessageGroup=TENANT-PROVISIONING`, `MessageStep=TENANT_PROVISIONED.1`, `OriginTenantId={tenant.id}`, `OriginMessageCode={tenant.code}`; `data` JSON string):
```json
{
  "tenantCode": "string",
  "tenantName": "string",
  "tenantType": "GARAGE|VENDOR",
  "address": "string",
  "city": "string",
  "ward": "string",
  "phone": "string",
  "email": "string",
  "taxCode": "string",
  "subscriptionPlan": "BASIC|PREMIUM|ENTERPRISE",
  "maxBranches": 0,
  "maxUsers": 0,
  "maxWarehouses": 0,
  "validFrom": "ISO-8601",
  "validUntil": "ISO-8601|null"
}
```

**Idempotency**:
- Producer: direct Kafka, `acks=all`, `retries=3`, idempotence enabled — broker-level dedup.
- Consumer: `gf-system` chỉ xử lý `MessageGroup=TENANT-PROVISIONING` + `MessageStep=TENANT_PROVISIONED.1` + `tenantType=GARAGE`; KHÔNG có inbox/dedup riêng — idempotency phụ thuộc business logic `createDefaultBranchIfNeeded(...)`. `gf-inventory` cùng rule + cache subscription quota; outer listener catch ack để tránh block consumer.

**Critical use case**: BR-* tenant provisioning gate. `gf-system` tạo default branch nếu chưa có; chain tiếp `BranchLifecycleChanged` (§3.2) → `gf-inventory` tạo default warehouse.

### 3.2 `BranchLifecycleChanged` _(multi-step)_

**Trigger**: Multi-step lifecycle event trên cùng topic `AC-DEV-BRANCH-LIFECYCLE`. Consumer route bằng `MessageStep`.

| Step | Producer | Consumer | Trigger |
|---|---|---|---|
| `BRANCH_CREATED.1` | `gf-system` `KafkaMessagePublisher` (key = `tenantId`) | `gf-inventory` (tạo branch + warehouse default), `ct-saas-tenant` (sync branch master) | Branch tạo trong `gf-system` |
| `WAREHOUSE_CREATED.1` | `gf-inventory` `BranchLifecyclePublisher` (key = `OriginTenantId`) | `ct-saas-tenant` (sync warehouse master) | Default warehouse tạo trong `gf-inventory` sau consume `BRANCH_CREATED.1` |

**Payload** (Kafka value common shape + headers):

`BRANCH_CREATED.1`:
```json
{
  "branchId": 10,
  "branchCode": "BRANCH001",
  "branchName": "string",
  "branchType": "GARAGE|VENDOR",
  "address": "string",
  "city": "string",
  "ward": "string",
  "latitude": 0,
  "longitude": 0,
  "phone": "string",
  "email": "string",
  "taxCode": "string",
  "status": "string",
  "isDefault": true
}
```

`WAREHOUSE_CREATED.1`:
```json
{
  "tenantId": 1001,
  "branchId": 10,
  "branchCode": "BRANCH001",
  "warehouseId": 20,
  "warehouseCode": "WH001",
  "warehouseName": "string",
  "warehouseType": "MAIN|BRANCH",
  "address": "string",
  "city": "string",
  "ward": "string",
  "contactPhone": "string",
  "contactEmail": "string",
  "isDefault": true,
  "isActive": true
}
```

**Idempotency**:
- Producer `BRANCH_CREATED.1`: direct publish, key = `tenantId`.
- Producer `WAREHOUSE_CREATED.1`: outbox via `gf-inventory` `EventPublishingService` (xem [gf-inventory-events.md](gf-inventory-events.md) §3.1).
- Consumer `gf-inventory` (`BRANCH_CREATED.1`): dedup theo `processed_events.event_id` từ raw message field `id`; nếu thiếu `id` vẫn xử lý nhưng skip duplicate check.
- Consumer `ct-saas-tenant`: parse + sync; `tenantId` từ `OriginTenantId`.

**Critical use case**: Chain `TenantProvisioned → BRANCH_CREATED.1 → WAREHOUSE_CREATED.1` (xem §4). `gf-inventory` listener chỉ xử lý `BRANCH_CREATED.1`, KHÔNG self-process `WAREHOUSE_CREATED.1` mà mình phát.

### 3.3 `TenantActivated`

**Trigger**: `ct-saas-tenant` publish `TenantMessage` khi tenant activate.

**Payload** (Kafka value + headers `MessageGroup=TENANT-ACTIVATION`, `MessageStep=ACTIVATED.1`, `OriginMessageCode={tenant.code}`):
```json
{
  "code": "string",
  "name": "string",
  "tenantId": 1001,
  "opsAreaCodes": ["string"],
  "address": "string",
  "tenantType": "GARAGE|VENDOR",
  "status": "ACTIVATED"
}
```

Topic: producer `kafka.topics.tenant-activation` = `AC-DEV-TENANT-ACTIVATION`; `gf-erp-agent` consumer property `kafka.topics.location` = `AC-DEV-TENANT-ACTIVATION` (cùng topic).

**Idempotency**:
- Producer: `TenantActivationPublisher` retry 3 lần với backoff trước throw.
- Consumer: `gf-erp-agent` `LocationMessageHandler` chỉ xử lý `MessageStep=ACTIVATED.1` + `tenantType=GARAGE`; tạo `InboundMessage` type `LOCATION` rồi ack. Step khác hoặc tenantType khác → skip + ack.

**Critical use case**: Ack Kafka nghĩa là `InboundMessage` đã được persist, KHÔNG nghĩa downstream ERP đã hoàn tất. Xem chain qua [gf-erp-agent-events.md](gf-erp-agent-events.md) §2.2 row 8 (LOCATION).

### 3.4 `TenantPolicySyncRequested` _(code-commented-out — KHÔNG active runtime)_

> **2026-05-19 source-of-truth audit**: `PolicyEventHelper` class KHÔNG tồn tại trong codebase. Step `TENANT_CREATED.1` không có trong `MessageStep` enum của `ct-saas-tenant`. Infrastructure (topic `AC-DEV-TENANT-ACTIVATION`) tồn tại nhưng không có producer code.

**Planned payload** (giữ cho reference khi implement):
```json
{
  "tenantId": "1001",
  "subscriptionTier": "BASIC",
  "activeProducts": ["GMS"],
  "featureFlags": {},
  "status": "ACTIVE|PENDING|...",
  "eventType": "CREATED"
}
```

### 3.5 `TenantUserSyncRequested` _(code-commented-out — KHÔNG active runtime)_

> **2026-05-19 source-of-truth audit**: `TenantSyncUserPublisher` class tồn tại, topic `AC-DEV-TENANT-SYNC-USER` config đúng. Nhưng mọi call-site đều commented out: `ActiveTenantListener.syncUser()` (lines 223-254) và `SaasTenantServiceImpl` (line 734). `MessageStep` enum chỉ có `USER_1("USER.1")`, KHÔNG có `USER_CREATED.1`/`USER_UPDATED.1` như documented trước đây.

**Planned payload** (giữ cho reference khi implement; step thực tế sẽ là `USER.1`):
```json
{
  "userId": "string",
  "tenantId": 1001,
  "role": "string",
  "branchIds": [10],
  "status": "ACTIVE|INACTIVE|PENDING",
  "eventType": "CREATED|UPDATE",
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string"
}
```

### 3.6 `TenantUserProvisionResult` _(5 variants)_

**Trigger**: Tenant service publish kết quả sau khi xử lý IAM provision/disable/enable. Publish bằng `KafkaMessagePublisher.publishMessage(topic, key, value, Map.of())` với value là raw DTO hoặc JSON string — KHÔNG phải common `Message`.

| Variant | Topic property | Default | Key | Trigger |
|---|---|---|---|---|
| `TenantUserProvisionedEvent` | `kafka.topics.provision-results` | `AC-DEV-TENANT-USER-PROVISION-RESULTS` | `Employee-{employeeId}` | Provision success |
| `TenantUserProvisionFailedEvent` | `kafka.topics.provision-results` | `AC-DEV-TENANT-USER-PROVISION-RESULTS` | `Employee-{employeeId}` | Provision fail (vd phone đang active tenant khác) |
| `TenantUserCreatedEvent` | `kafka.topics.created-results` | `AC-DEV-TENANT-USER-CREATED-RESULTS` | `eventId` | IAM user mới tạo |
| `TenantUserDisabledEvent` | `kafka.topics.disable-results` | `AC-DEV-TENANT-USER-DISABLE-RESULTS` | `Employee-{employeeId}` | Disable success |
| `TenantUserEnabledEvent` | `kafka.topics.enable-results` | `AC-DEV-TENANT-USER-ENABLE-RESULTS` | `Employee-{employeeId}` | Enable success |

**Payload** (raw DTO; common base):
```json
{
  "eventId": "uuid",
  "eventType": "{specific}",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "ct-saas-tenant",
  "tenantId": 1001,
  "tenantType": "GARAGE|VENDOR",
  "employeeId": 2001,
  "keycloakUserId": "string|null",
  "iamUserId": "string"
}
```

`TenantUserProvisionedEvent` thêm `tempPassword`, `phone`, `isExistingAccount`. `TenantUserCreatedEvent` thêm `tempPassword`, `phone`, `emailAddress`, `roleCode`, `avatarUrl`, `fullName`, `iamCreationStatus`, `status`. `TenantUserProvisionFailedEvent` thêm `errorMessage`. `TenantUserDisabled/Enabled` chỉ có common.

**Idempotency**:
- Producer: direct Kafka publish (`Map.of()` headers); key xác định partition.
- Consumer: external/unknown.

**Critical use case** _(security risk)_: `tempPassword` trong `Provisioned`/`Created` event payload — legacy behavior, consumer phải coi sensitive, KHÔNG log/forward. KHÔNG mở rộng `tempPassword` sang event mới. KHÔNG publish JWT/IAM secret.

### 3.7 `TenantInvoiceInfoUpdated`

**Trigger**: `InternalTenantInvoiceInfoController` nhận `PUT /protected/v1/tenant-invoice-info` từ Garage REST path → `TenantInvoiceInfoService.upsertFromGarage()` (`isFromGarage=true`) → cập nhật DB → publish event qua Outbox.

> **Lưu ý**: COP command path (`TenantInvoiceInfoCommandListener` → `upsertFromCop()`, `isFromGarage=false`) **KHÔNG** publish event này. Cùng topic nhưng trigger khác nhau — chỉ Garage REST path trigger publish.

| Service | Role | Property | Default |
|---|---|---|---|
| `gf-system` | producer | `kafka.topics.tenant-invoice-info` | `AC-DEV-TENANT-INVOICE-INFO` |

**Payload** (Kafka value common shape + headers `MessageGroup=TENANT_INVOICE_PROFILE_EVENTS`, `MessageStep=TENANT_INVOICE_INFO_UPDATED`, `OriginTenantId={tenantId}`, `OriginMessageCode=INV-{tenantId}-{version}`):
```json
{
  "tenantId": 1001,
  "version": 3,
  "invoiceInfo": {
    "companyName": "string",
    "taxCode": "string",
    "companyEmailAddress": "user@example.com",
    "companyAddress": "string"
  },
  "updatedBy": "string"
}
```

**Idempotency**:
- Producer: `OutboxService.saveEvent` trong cùng transaction DB write → `OutboxEventListener` AFTER_COMMIT primary + `OutboxScheduler` 60s fallback → at-least-once.
- Consumer: external/TBD — gf-system không biết downstream consumer.

**Critical use case**: Topic `AC-DEV-TENANT-INVOICE-INFO` dùng chung cho cả command inbound (`MessageGroup=TENANT_INVOICE_PROFILE_COMMANDS`, step `TENANT_INVOICE_INFO_UPSERT_REQUESTED`) và event outbound (`MessageGroup=TENANT_INVOICE_PROFILE_EVENTS`, step `TENANT_INVOICE_INFO_UPDATED`). Consumer downstream phải filter đúng `MessageGroup` + `MessageStep`.

### 3.8 `TenantTransporterRegistryEvent` _(multi-step)_

**Trigger**: Multi-step lifecycle event trên topic `AC-DEV-TENANT-TRANSPORTER-REGISTRY`. Consumer route bằng `MessageStep`.

| Step | Trigger |
|---|---|
| `TENANT_TRANSPORTER_REGISTRY_UPSERTED` | Transporter registry được tạo hoặc update (qua `TenantTransporterRegistryCommandListener` consume UPSERT command, hoặc REST controller tạo/update) |
| `TENANT_TRANSPORTER_REGISTRY_DELETED` | Transporter registry bị soft delete (qua `TenantTransporterRegistryCommandListener` consume DELETE command, hoặc REST controller delete) |

| Service | Role | Property | Default |
|---|---|---|---|
| `gf-system` | producer | `kafka.topics.tenant-transporter-registry` | `AC-DEV-TENANT-TRANSPORTER-REGISTRY` |

**Payload** (cùng shape cho cả 2 steps; Kafka headers `MessageGroup=TENANT-TRANSPORTER-REGISTRY`, `MessageStep=TENANT_TRANSPORTER_REGISTRY_UPSERTED|TENANT_TRANSPORTER_REGISTRY_DELETED`, `OriginTenantId={tenantId}`, `OriginMessageCode=null`):
```json
{
  "tenantId": 1001,
  "copTransporterRegistryId": 10,
  "tenantType": "GARAGE",
  "transporterName": "string",
  "routeName": "string",
  "routeContactPhoneNumber": "0901234567",
  "routeStartedAt": "08:00,14:00",
  "shippingAddress": "string",
  "note": "string|null",
  "status": "ACTIVE|INACTIVE",
  "changeSource": "GARAGE_UI|string"
}
```

Ràng buộc payload: field `isDeleted` **KHÔNG tồn tại** trong `TenantTransporterRegistryPayload` class — consumer phải phân biệt upsert/delete qua `MessageStep`, KHÔNG phải payload field.

**Idempotency**:
- Producer: `OutboxService.saveEvent` → `OutboxEventListener` AFTER_COMMIT primary + `OutboxScheduler` 60s fallback → at-least-once.
- Consumer: external/TBD.

**Critical use case**: `changeSource=GARAGE_UI` là default cho REST path; command path có thể pass giá trị khác.

### 3.9 `TenantUser*Requested` _(inbound external-source, 3 variants)_

**Producer source**: External IAM/HR system (unknown trong các repo `garage` đã rà).

**Trigger upstream**: External request provision/disable/enable IAM user.

| Variant | Topic | Property | Consumer |
|---|---|---|---|
| `TenantUserProvisionRequestedEvent` | `AC-DEV-TENANT-USER-PROVISION-REQUESTS` | `kafka.topics.provision-requests` | `TenantUserProvisionRequestConsumer` |
| `TenantUserDisableRequestedEvent` | `AC-DEV-TENANT-USER-DISABLE-REQUESTS` | `kafka.topics.disable-requests` | `TenantUserDisableRequestConsumer` |
| `TenantUserEnableRequestedEvent` | `AC-DEV-TENANT-USER-ENABLE-REQUESTS` | `kafka.topics.enable-requests` | `TenantUserEnableRequestConsumer` |

**Payload** (raw JSON DTO):

`TenantUserProvisionRequestedEvent`:
```json
{
  "eventId": "uuid",
  "eventType": "TenantUserProvisionRequestedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "string",
  "tenantId": 1001,
  "tenantType": "GARAGE|VENDOR",
  "employeeId": 2001,
  "employeeCode": "EMP001",
  "email": "user@example.com",
  "phone": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "branchId": 10
}
```

`TenantUserDisable/Enable`:
```json
{
  "eventId": "uuid",
  "eventType": "TenantUserDisableRequestedEvent|TenantUserEnableRequestedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "string",
  "tenantId": 1001,
  "employeeId": 2001,
  "keycloakUserId": "string",
  "iamUserId": "string"
}
```

**Consumer logic**:
1. Parse raw message thành event DTO.
2. Gọi `EmployeeService.handleTenantUser{Provision/Disable/Enable}Requested`.
3. Provision: nếu phone active tenant khác → publish `TenantUserProvisionFailedEvent`; nếu đã có `iamUserId` → inactive tenant khác, update IAM, publish `TenantUserProvisionedEvent` `isExistingAccount=true`; nếu chưa có → tạo mới, lưu `tempPassword`, publish `TenantUserProvisionedEvent` `isExistingAccount=false`.
4. Disable/Enable: deactivate/activate local user, update IAM status, publish `TenantUserDisabled/EnabledEvent`.
5. Manual immediate ack. Lỗi → throw `RuntimeException`; `KafkaConfig` chưa khai báo `DefaultErrorHandler`/DLQ.

**Idempotency**: Consumer KHÔNG ghi inbox/dedup theo `eventId`; replay cùng message có thể gọi lại service. Phụ thuộc idempotency nghiệp vụ theo phone/iamUserId.

### 3.10 `Employee*Changed` _(inbound external-source, 3 variants)_

**Producer source**: External IAM/HR system (unknown trong các repo `garage` đã rà).

**Trigger upstream**: External employee lifecycle event (branch change/role change/termination).

| Variant | Topic | Property | Consumer |
|---|---|---|---|
| `EmployeeBranchChangedEvent` | `AC-DEV-EMPLOYEE-BRANCH-CHANGED` | `kafka.topics.branch-changed` | `EmployeeBranchChangedConsumer` |
| `EmployeeRoleChangedEvent` | `AC-DEV-EMPLOYEE-ROLE-CHANGED` | `kafka.topics.role-changed` | `EmployeeRoleChangedConsumer` |
| `EmployeeTerminatedEvent` | `AC-DEV-EMPLOYEE-TERMINATED` | `kafka.topics.employee-terminated` | `EmployeeTerminatedConsumer` |

**Payload** (raw JSON DTO; common base + variant fields):

```json
{
  "eventId": "uuid",
  "eventType": "Employee{BranchChanged|RoleChanged|Terminated}Event",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "string",
  "tenantId": 1001,
  "employeeId": 2001,
  "keycloakUserId": "string",
  "iamUserId": "string"
}
```

Variant fields:
- `BranchChanged`: `oldBranchId`, `newBranchId`
- `RoleChanged`: `oldRole`, `newRole`
- `Terminated`: `phone`, `reason`

**Consumer logic**:
1. Parse + gọi `EmployeeService.handleEmployee{BranchChanged|RoleChanged|Terminated}` + manual immediate ack.
2. `BranchChanged`: update IAM `branchId=newBranchId`.
3. `RoleChanged`: update IAM `role=newRole`; cập nhật local `roleCode`.
4. `Terminated`: deactivate local user. Nếu cùng `iamUserId` còn active account ở tenant khác → skip IAM update, KHÔNG publish `TenantUserDisabledEvent`. Nếu KHÔNG còn active khác → IAM `INACTIVE`, publish `TenantUserDisabledEvent`.

**Idempotency**: Consumer KHÔNG ghi inbox/dedup theo `eventId`; replay có thể gọi lại IAM/local update. Lỗi trước ack gây redelivery; `KafkaConfig` chung listener factory, chưa có DLQ/replay riêng.

---

## 4. Workflow correlation (cross-boundary chain)

`Tenant → Branch → Warehouse` chain (multi-step trên 2 topic):

1. `ct-saas-tenant` provisioning hoàn tất → publish `TenantProvisioned` (§3.1) `MessageStep=TENANT_PROVISIONED.1`.
2. `gf-system` consume → tạo default branch (nếu `tenantType=GARAGE`) → publish `BranchLifecycleChanged` `MessageStep=BRANCH_CREATED.1` (§3.2).
3. `gf-inventory` consume `BRANCH_CREATED.1` → tạo branch inventory + default warehouse → publish `BranchLifecycleChanged` `MessageStep=WAREHOUSE_CREATED.1` (§3.2).
4. `ct-saas-tenant` consume `BRANCH_CREATED.1` + `WAREHOUSE_CREATED.1` → sync branch + warehouse master data.

`Tenant Activation → ERP Location` chain:

1. `ct-saas-tenant` activate tenant → publish `TenantActivated` (§3.3) `MessageStep=ACTIVATED.1` trên topic `AC-DEV-TENANT-ACTIVATION`.
2. `gf-erp-agent` `LocationMessageHandler` route theo `ACTIVATED.1` + `tenantType=GARAGE` → tạo `InboundMessage` type `LOCATION` (xem [gf-erp-agent-events.md](gf-erp-agent-events.md) §2.2 row 8).

`IAM Request → Result` chain:

1. External IAM/HR publish `TenantUser*Requested` (§3.9) hoặc `Employee*Changed` (§3.10) inbound.
2. `EmployeeService` xử lý → publish `TenantUserProvisionResult` (§3.6) variant tương ứng.
3. ~~Sau success → publish `TenantUserSyncRequested` cho OPA policy sync~~ — **code commented out** (xem §3.5).

---

## 5. Forbidden patterns

- ❌ Mô tả `TenantProvisioned`, `BranchLifecycleChanged`, `TenantActivated` như `KafkaMessageWrapper` khi source hiện tại dùng common `Message`/`TenantMessage` và Kafka headers.
- ❌ Đổi tên hoặc normalize tùy ý `MessageGroup`; source đang dùng dấu gạch ngang: `TENANT-PROVISIONING`, `BRANCH-LIFECYCLE`, `TENANT-ACTIVATION`.
- ❌ Đổi `MessageStep` hiện tại: `TENANT_PROVISIONED.1`, `BRANCH_CREATED.1`, `WAREHOUSE_CREATED.1`, `ACTIVATED.1`.
- ❌ Xử lý event tenant-scoped nếu `OriginTenantId` và `data.tenantId` mâu thuẫn; với payload không có `tenantId`, consumer phải lấy từ `OriginTenantId`.
- ❌ Để `BranchLifecycleChanged` có hai payload shape khác nhau trên cùng topic mà không route bằng `MessageStep`.
- ❌ Mô tả tenant-user request/result là common `Message` nếu source đang publish raw JSON/DTO.
- ❌ Mô tả employee lifecycle event là common `Message`; source consumer đang nhận raw JSON DTO.
- ❌ Assume producer cho employee lifecycle nằm trong `garage`; hiện chỉ xác nhận được consumer-side contract ở `ct-saas-tenant`.
- ❌ Mô tả `TenantPolicySyncRequested` hoặc `TenantUserSyncRequested` là active runtime event; cả 2 hiện `code-commented-out` — `PolicyEventHelper` không tồn tại, `TenantSyncUserPublisher` call-sites commented out.
- ❌ Assume tenant-user request có DLQ riêng; source `KafkaConfig` hiện chỉ set `MANUAL_IMMEDIATE` ack mode.
- ❌ Assume employee lifecycle có DLQ riêng; source `KafkaConfig` dùng chung listener factory và chưa khai báo DLQ/replay.
- ❌ Assume tenant-user request hoặc employee lifecycle đã có exactly-once bằng `eventId`; source hiện chưa ghi inbox/dedup table.
- ❌ Coi `TenantUserSyncRequested` step là `USER_CREATED.1`/`USER_UPDATED.1`; `MessageStep` enum chỉ có `USER_1("USER.1")`. Commented-out code dùng `MessageStep.USER_1.getStep()`.
- ❌ Mở rộng `tempPassword` sang event mới. Với result legacy đang có `tempPassword`, consumer phải coi đây là sensitive field và KHÔNG log/plain forward.
- ❌ Publish tenant-user result chứa JWT hoặc IAM secret.
- ❌ Tạo inbound section trong file này cho event có producer internal — chỉ dùng §2.2 cho external-source IAM/HR (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).
- ❌ Document `action` field trong payload của `TenantTransporterRegistryEvent` hoặc `TenantInvoiceInfoUpdated`; action được truyền qua `MessageStep` Kafka header, KHÔNG phải payload field.
- ❌ Assume `isDeleted` field tồn tại trong `TenantTransporterRegistryPayload`; field này KHÔNG có trong class. Consumer phải route bằng `MessageStep`.
- ❌ Assume `TenantInvoiceInfoUpdated` dùng topic riêng; source hiện dùng cùng topic `AC-DEV-TENANT-INVOICE-INFO` cho cả command inbound và event outbound — phân biệt bằng `MessageGroup` (`TENANT_INVOICE_PROFILE_COMMANDS` vs `TENANT_INVOICE_PROFILE_EVENTS`).
- ❌ Assume `TenantTransporterRegistryEvent` và `TenantInvoiceInfoUpdated` là direct Kafka publish; source dùng transactional outbox — có thể đến muộn tới 60s nếu AFTER_COMMIT listener fail và scheduler fallback kick in.

---

## 6. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Consumer file (chain downstream):
  - [gf-inventory-events.md](gf-inventory-events.md) — consume `BranchCreated`, `TenantProvisioned`
  - [gf-erp-agent-events.md](gf-erp-agent-events.md) — consume `TenantActivated` (LOCATION handler)
- ADR:
  - `ADR-004-kafka-event-driven-integration.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v3 | Source-of-truth audit: strip `TenantPolicySyncRequested` + `TenantUserSyncRequested` khỏi active catalog → `code-commented-out` (PolicyEventHelper không tồn tại, TenantSyncUserPublisher call-sites commented out, MessageStep enum chỉ có USER_1 không có USER_CREATED.1/USER_UPDATED.1); catalog 8→6 active + 2 commented-out; fix §3.8 TenantTransporterRegistryEvent: `isDeleted` field không tồn tại trong payload class; cập nhật forbidden patterns. |
| 2026-05-12 | v2.1 | Fix trigger §3.7 `TenantInvoiceInfoUpdated`: Garage REST path (không phải command listener); COP path không publish event. |
| 2026-05-12 | v2 | Thêm 2 outbound events: `TenantInvoiceInfoUpdated` (§3.7, outbox) và `TenantTransporterRegistryEvent` UPSERTED/DELETED (§3.8, outbox); catalog 6→8, renumber IAM/HR inbound §3.7-3.8→§3.9-3.10; thêm 4 forbidden patterns. |
| 2026-05-07 | v1 | Initial events spec: 6 outbound + 6 inbound (IAM/HR); direct Kafka publish; workflow correlation 3 chains; security note tempPassword. |
