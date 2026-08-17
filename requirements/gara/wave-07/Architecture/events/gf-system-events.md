---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 7
tier: T1
owner_authority: Architecture Authority
boundary: tenant-system
last_reviewed: "2026-08-12"
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
| 7 | `PartnerLinkRequestResponse` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | `gf-system` xử lý xong inbound `PARTNER_LINK.REQUEST.CREATE` — ack tạo record HOẶC từ chối tại adapter gate (resolve tenant từ SĐT thất bại HOẶC single-active guard) | External: **Driver Plus** | ≤ 5s | `DESIGN` (W07) | step `PARTNER_LINK.REQUEST.RESPONSE`; correlated response thay HTTP đồng bộ (ADR-029); 2 error code `ERR-DPL-010`/`ERR-DPL-013` (ADR-029 v2); outbox; xem §3.12 |
| 8 | `PartnerLinkProfileSync` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | Garage Duyệt (AC-15c) hoặc bấm "Đồng bộ lại thông tin sang D+" (AC-21a) | External: **Driver Plus** | ≤ 30s | `DESIGN` (W07) | step `PARTNER_LINK.PROFILE.SYNC`; payload đọc **real-time** `tenant_profile` + `tenant_invoice_info` (CB-SYS-006); outbox; xem §3.13 |
| 9 | `PartnerLinkStatusChanged` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | State đổi **do action từ phía GMS**: Duyệt / Từ chối user / cascade auto-reject / Hủy liên kết | External: **Driver Plus** | ≤ 30s | `DESIGN` (W07) | step `PARTNER_LINK.STATUS.CHANGED`; mang cả wording notification 4 loại (CB-SYS-009 / BR-DPL-NOTI-001..004); **KHÔNG** phát khi state đổi do D+ khởi phát; outbox; xem §3.14 |

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
| 15 | `PartnerLinkRequestCreate` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | External: **Driver Plus** | `PartnerLinkDriverPlusConsumer` route `MessageStep=PARTNER_LINK.REQUEST.CREATE`; adapter validation gate (PC-4) — **resolve tenant từ `partnerAccountPhone`** (match `tenant_profile.contact_phone_number`, ADR-029 v2) rồi mới single-active guard `BR-DPL-CMN-007` **trước** khi ghi domain table; inbox dedupe `PARTNER_LINK_REQUEST_CREATE_RECEIVED`; luôn publish `PARTNER_LINK.REQUEST.RESPONSE` | ≤ 5s | `DESIGN` (W07) | shared topic với 3 step outbound — **bắt buộc** filter `MessageGroup` + `MessageStep`; `OriginTenantId` KHÔNG bắt buộc ở step này (ADR-029 v2); xem §3.11 |
| 16 | `PartnerLinkRequestWithdraw` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | External: **Driver Plus** | Route `MessageStep=PARTNER_LINK.REQUEST.WITHDRAW`; chỉ hợp lệ khi record đang `PENDING` → `UNLINKED`; state khác → bỏ qua + log warning; inbox `PARTNER_LINK_REQUEST_WITHDRAW_RECEIVED` | ≤ 5s | `DESIGN` (W07) | `BR-DPL-CAN-004` + CB-SYS-007; **KHÔNG** phát noti ngược; xem §3.11 |
| 17 | `PartnerLinkUnlink` _(W07)_ | `AC-DEV-PARTNER-LINK-EVENTS` | External: **Driver Plus** | Route `MessageStep=PARTNER_LINK.UNLINK`; chỉ hợp lệ khi record đang `LINKED` → `UNLINKED` (ghi ĐÈ khối xử lý); state khác → bỏ qua + log warning; inbox `PARTNER_LINK_UNLINK_RECEIVED` | ≤ 5s | `DESIGN` (W07) | `BR-DPL-CAN-005` + CB-SYS-008; **KHÔNG** phát noti ngược; xem §3.11 |

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

### 3.11 `PartnerLink*` _(inbound external-source, 3 variants — DESIGN W07)_

**Producer source**: External **Driver Plus** (app tài xế).

**Topic**: `AC-DEV-PARTNER-LINK-EVENTS` (config `kafka.topics.partner-link-events`) — **dùng chung** cho cả 3 step inbound và 3 step outbound (§3.12–§3.14), giống pattern `AC-DEV-TENANT-INVOICE-INFO`. Consumer 2 phía **BẮT BUỘC** filter `MessageGroup=PARTNER_LINK` + `MessageStep`; `gf-system` consumer bỏ qua (ack + skip) 3 step do chính mình produce.

**Envelope**: `KafkaMessageWrapper` + headers `MessageGroup=PARTNER_LINK`, `MessageStep={step}`, `OriginTenantId={tenantId}` (v3 — **KHÔNG bắt buộc ở cả 3 step inbound**, D+ không quản lý giá trị này, xem ADR-029 v3 gap G4), `OriginMessageCode={requestCode}` (bắt buộc — D+ tự sinh lúc `CREATE` và **tái sử dụng nguyên vẹn** cho `WITHDRAW`/`UNLINK` cùng 1 lần liên kết); `type=BASIC_MESSAGE`; `data` là JSON string. Partition key `PartnerLink-{requestCode}`.

| Variant | `MessageStep` | Điều kiện state hợp lệ | Kết quả | Cite |
|---|---|---|---|---|
| — (không resolve được tenant) | `PARTNER_LINK.REQUEST.CREATE` | Không có `tenant_profile` nào có `contact_phone_number` khớp `partnerAccountPhone` | **KHÔNG** tạo record; publish `PARTNER_LINK.REQUEST.RESPONSE` `success=false` + `ERR-DPL-013` | ADR-029 v2 (amendment — gap G3) |
| Tạo yêu cầu | ↑ cùng step | Resolve tenant thành công + garage **chưa có** record `status='LINKED'` | Tạo record `PENDING` + publish `PARTNER_LINK.REQUEST.RESPONSE` `success=true` | CB-SYS-004 · `BR-DPL-CMN-001` · AC-25 |
| — (bị chặn) | ↑ cùng step | Resolve tenant thành công + garage **đã có** record `LINKED` | **KHÔNG** tạo record; publish `PARTNER_LINK.REQUEST.RESPONSE` `success=false` + `ERR-DPL-010` | `BR-DPL-CMN-007` · AC-34 |
| D+ withdraw pending | `PARTNER_LINK.REQUEST.WITHDRAW` | Record đang `PENDING` | → `UNLINKED`; `processedByLabel="Driver Plus"`, `reason` = lý do từ payload | `BR-DPL-CAN-004` · CB-SYS-007 · AC-33 |
| D+ unlink linked | `PARTNER_LINK.UNLINK` | Record đang `LINKED` | → `UNLINKED` (**ghi ĐÈ** khối xử lý); `processedByLabel="Driver Plus"`, `reason` = payload hoặc mặc định `"Hủy từ ứng dụng Driver Plus."` | `BR-DPL-CAN-005` · CB-SYS-008 · AC-35 |

**Thứ tự gate tại `REQUEST.CREATE` (ADR-029 v2)**: (1) resolve tenant từ `partnerAccountPhone` → fail = `ERR-DPL-013`, dừng; (2) single-active guard → fail = `ERR-DPL-010`, dừng; (3) tạo record `PENDING`.

**Thứ tự gate tại `REQUEST.WITHDRAW` / `UNLINK` (ADR-029 v3, gap G4)**: (1) resolve `tenant_id` + record bằng lookup `partner_link_request WHERE request_code = {OriginMessageCode}` — 0 record khớp → **bỏ qua + log warning**, dừng; >1 record khớp (lý thuyết, xem `data-model` §2bis.2) → **KHÔNG** tự chọn tenant, alert vận hành mức P1, dừng; đúng 1 record → gán `tenantId` resolve được; (2) kiểm tra `status` đúng kỳ vọng theo bảng transition trên → sai state = **bỏ qua + log warning**, KHÔNG đổi state, KHÔNG xoá lịch sử (AC-33 nhánh 2, AC-35 nhánh 2); (3) áp transition.

**Payload `PARTNER_LINK.REQUEST.CREATE`** _(v2 — KHÔNG còn `tenantId`, D+ không tự biết giá trị này; xem ADR-029 v2)_:
```json
{
  "eventId": "b3f1c2de-0000-4000-8000-000000000001",
  "eventType": "PartnerLinkRequestCreate",
  "eventVersion": "2.0",
  "occurredAt": "2026-08-05T03:10:00Z",
  "requestCode": "LKD-2026-001",
  "partnerCode": "DRIVER_PLUS",
  "partnerAccountName": "Nguyễn Văn Sơn",
  "partnerAccountPhone": "0901234567",
  "requestedAt": "2026-08-05T03:09:58Z"
}
```

| Field | Type | Required | Cite |
|---|---|---|---|
| `requestCode` | String | ✅ | `EP-PARTNER-LINK` §3 (mã `LKD-YYYY-NNN` do D+ tự sinh) |
| `partnerCode` | Enum `DRIVER_PLUS` | ✅ | `FEAT` §4 |
| `partnerAccountName` | String | ✅ | `FEAT` AC-9 |
| `partnerAccountPhone` | String | ✅ | **SĐT garage** D+ muốn liên kết — dùng để GMS resolve tenant (khớp `tenant_profile.contact_phone_number`); **KHÔNG phải** SĐT tài khoản D+ (đổi nghĩa v1→v2, ADR-029 amendment — gap G3) | `FEAT` AC-9 _(cần Product cập nhật lại mô tả field, xem ADR-029 v2 Consequences)_ |
| `requestedAt` | ISO-8601 | ✅ | `FEAT` AC-9 |

> ⚠️ **Không còn `tenantId`/`OriginTenantId` bắt buộc ở `REQUEST.CREATE`** (resolve qua `partnerAccountPhone`, ADR-029 v2). Header inbound `OriginTenantId` cho `REQUEST.CREATE` được phép `null`.

**Payload `PARTNER_LINK.REQUEST.WITHDRAW` / `PARTNER_LINK.UNLINK`** (cùng shape) _(v3 — KHÔNG còn `tenantId`, D+ không quản lý giá trị này; xem ADR-029 v3 gap G4)_:
```json
{
  "eventId": "b3f1c2de-0000-4000-8000-000000000002",
  "eventType": "PartnerLinkUnlink",
  "eventVersion": "2.0",
  "occurredAt": "2026-08-05T06:00:00Z",
  "requestCode": "LKD-2026-001",
  "partnerCode": "DRIVER_PLUS",
  "reason": "Tài xế đổi garage hợp tác"
}
```

| Field | Type | Required | Cite |
|---|---|---|---|
| `requestCode` | String | ✅ | AC-33 / AC-35 (xác định record) — **mã gốc D+ tự sinh lúc `CREATE`, D+ tái sử dụng nguyên vẹn** (không sinh mã mới mỗi lần bắn), ADR-029 v3 gap G4 |
| `reason` | String | ⛔ optional | AC-35 "kèm lý do free text; rỗng → mặc định `Hủy từ ứng dụng Driver Plus.`" · `BR-DPL-CAN-005` |

> ⚠️ **Không còn `tenantId`/`OriginTenantId` bắt buộc ở `REQUEST.WITHDRAW`/`UNLINK`** (v3, khác v2 — trước đó 2 step này vẫn yêu cầu; nay resolve qua `requestCode` lookup vì record đã tồn tại từ lúc `CREATE`, xem ADR-029 v3 gap G4). Header inbound `OriginTenantId` cho 2 step này được phép `null`. Điều kiện tiên quyết: D+ phải gửi đúng `requestCode` gốc — nếu không, resolve luôn ra 0 record và message bị ack+skip âm thầm.

**Consumer logic** (`PartnerLinkDriverPlusConsumer`):

1. Filter `MessageGroup=PARTNER_LINK`; nếu `MessageStep` ∈ 3 step outbound → **ack + skip** (event do chính `gf-system` produce).
2. **(v3, ADR-029 gap G4)** `OriginTenantId`/`data.tenantId` **không còn bắt buộc ở bất kỳ step inbound nào** (`REQUEST.CREATE`, `REQUEST.WITHDRAW`, `UNLINK`) — D+ không quản lý giá trị này. Resolve tenant chuyển hết sang bước 4, theo cơ chế khác nhau per step.
3. Ghi `inbox_event` với `event_id = messageId` + `InboxEventType` tương ứng; duplicate (unique violation) → ack + skip (**EC-4** dedupe khi D+ retry).
4. **Adapter validation gate (PC-4 / BR-CORE-012)**:
   - `REQUEST.CREATE`: **resolve tenant trước** — match `partnerAccountPhone` với `tenant_profile.contact_phone_number`. Không khớp (0 hoặc >1 tenant) → publish `PARTNER_LINK.REQUEST.RESPONSE` `success=false` + `ERR-DPL-013`, **dừng xử lý** (không ghi domain table). Khớp đúng 1 tenant → gán `tenantId` resolve được, tiếp tục enforce single-active guard `BR-DPL-CMN-007` **TRƯỚC** khi ghi domain table.
   - `REQUEST.WITHDRAW` / `UNLINK` **(v3, ADR-029 gap G4)**: resolve `tenant_id` + record bằng `SELECT id, tenant_id, status FROM partner_link_request WHERE request_code = {data.requestCode}` (dùng index mới `idx_plr_request_code_lookup`, xem `gf-system-data-model.md` §2bis.2). 0 record → ack + skip + log warning, dừng. >1 record (lý thuyết — unique constraint hiện tại chỉ composite `(tenant_id, request_code)`, không global-unique) → **KHÔNG** tự chọn tenant, alert vận hành P1, ack + skip, dừng. Đúng 1 record → gán `tenantId` từ record, tiếp tục validate `status` đúng kỳ vọng theo bảng transition (sai state → ack + skip + log, rule sẵn có, không đổi).
5. Áp transition theo bảng trên trong 1 transaction; publish response/notification event qua **outbox** cùng transaction.

**Idempotency**: inbox dedupe theo `messageId`; thêm lớp 2 là unique `(tenant_id, request_code)` ở `partner_link_request` (EC-4). Lớp 2 này **phụ thuộc** D+ tái sử dụng đúng `requestCode` gốc cho `WITHDRAW`/`UNLINK` (ADR-029 v3 gap G4) — nếu không, mọi message bị resolve fail (0 record) chứ không tới được bước dedupe layer 2 này.

### 3.12 `PartnerLinkRequestResponse` _(outbound — DESIGN W07)_

**Trigger**: sau khi consumer xử lý xong `PARTNER_LINK.REQUEST.CREATE` (nhánh thành công, nhánh resolve tenant thất bại, hoặc nhánh bị adapter gate chặn ở single-active guard).

**Payload — nhánh `success=false`, single-active guard** (headers `MessageGroup=PARTNER_LINK`, `MessageStep=PARTNER_LINK.REQUEST.RESPONSE`, `OriginTenantId={tenantId}`, `OriginMessageCode={requestCode}`):

```json
{
  "eventId": "b3f1c2de-0000-4000-8000-000000000010",
  "eventType": "PartnerLinkRequestResponse",
  "eventVersion": "1.0",
  "occurredAt": "2026-08-05T03:10:01Z",
  "tenantId": 5001,
  "success": false,
  "requestCode": "LKD-2026-001",
  "error": {
    "code": "ERR-DPL-010",
    "message": "Garage đã liên kết với một tài khoản Driver Plus khác. Không thể gửi yêu cầu liên kết mới cho đến khi liên kết hiện tại bị hủy."
  },
  "correlation": {
    "requestEventId": "b3f1c2de-0000-4000-8000-000000000001",
    "originMessageCode": "LKD-2026-001"
  }
}
```

**Payload — nhánh `success=false`, resolve tenant từ SĐT thất bại** _(v2, ADR-029 amendment — gap G3)_ — headers `OriginTenantId=null` (không có tenant nào resolve được):

```json
{
  "eventId": "7a2f4c31-0000-4000-8000-000000000099",
  "eventType": "PartnerLinkRequestResponse",
  "eventVersion": "1.0",
  "occurredAt": "2026-08-10T09:01:57Z",
  "tenantId": null,
  "success": false,
  "requestCode": "LKD-2026-001",
  "error": {
    "code": "ERR-DPL-013",
    "message": "Không tìm thấy garage nào đăng ký số điện thoại này trong hệ thống GMS. Vui lòng kiểm tra lại số điện thoại."
  },
  "correlation": {
    "requestEventId": "7a2f4c31-0000-4000-8000-000000000099",
    "originMessageCode": "LKD-2026-001"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `success` | Boolean | ✅ | `true` = record `PENDING` đã tạo; `false` = bị chặn (resolve tenant thất bại HOẶC single-active guard) | AC-34 |
| `tenantId` | Long \| `null` | ✅ | `null` khi `error.code=ERR-DPL-013` (không resolve được tenant) — ngoại lệ hợp lệ theo `_CONVENTIONS.md` §3.3 | ADR-029 v2 |
| `error.code` | String | khi `success=false` | 2 giá trị ở W07: `ERR-DPL-010` (single-active guard) · `ERR-DPL-013` (resolve tenant từ SĐT thất bại) | `ERROR-CODE-REGISTRY` §5 _(cần đăng ký `ERR-DPL-013`, chưa thực hiện trong version này)_ |
| `error.message` | String | khi `success=false` | Wording chính thức verbatim, KHÔNG paraphrase | `BR-DPL-CMN-007` |
| `correlation.requestEventId` | UUID | ✅ | = `messageId` của message inbound gốc | ADR-029 |

**Idempotency**: producer ghi outbox trong cùng transaction với gate decision → at-least-once. Consumer (Driver Plus) dedupe theo `correlation.requestEventId`.

### 3.13 `PartnerLinkProfileSync` _(outbound — DESIGN W07)_

**Trigger**: (a) Duyệt thành công — `FEAT` AC-15(c); (b) bấm "Đồng bộ lại thông tin sang D+" — AC-21(a). Payload đọc **real-time** `tenant_profile` + `tenant_invoice_info` theo `tenant_id` tại thời điểm publish — **KHÔNG** snapshot lúc Duyệt, **KHÔNG** cache trung gian (CB-SYS-006, `BR-DPL-SYN-002`).

**Payload** (headers `MessageStep=PARTNER_LINK.PROFILE.SYNC`, `OriginMessageCode={requestCode}`):

```json
{
  "eventId": "b3f1c2de-0000-4000-8000-000000000020",
  "eventType": "PartnerLinkProfileSync",
  "eventVersion": "1.0",
  "occurredAt": "2026-08-05T04:00:00Z",
  "tenantId": 5001,
  "requestCode": "LKD-2026-001",
  "partnerCode": "DRIVER_PLUS",
  "syncTrigger": "APPROVED",
  "garageProfile": {
    "businessName": "Garage Đăng Vinh",
    "contactPhoneNumber": "0287654321",
    "addressDetail": "12 Trần Não",
    "ward": "Phường An Khánh",
    "city": "TP.HCM"
  },
  "invoiceInfo": {
    "companyName": "Công ty CP Garage Đăng Vinh",
    "taxCode": "0309876543",
    "companyAddress": "12 Trần Não, Phường An Khánh, TP.HCM",
    "companyEmailAddress": "invoice@dangvinh.vn"
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `syncTrigger` | Enum `APPROVED \| MANUAL_RESYNC` | ✅ | Phân biệt push lúc Duyệt vs bấm "Đồng bộ lại" | AC-15(c) · AC-21(a) |
| `garageProfile.*` | 5 field | nullable | Đọc `tenant_profile`; NULL khi tenant chưa có hồ sơ (ADR-030 Gap 2) — **KHÔNG chặn** publish | AC-11 block DOANH NGHIỆP + ĐỊA CHỈ |
| `invoiceInfo.*` | 4 field | nullable | Đọc `tenant_invoice_info`; 4 field cố định | AC-11 block XUẤT HOÁ ĐƠN |

**Idempotency**: outbox; Driver Plus áp last-write-wins theo `occurredAt` (bản sync sau ghi đè bản trước — không có ordering guarantee ngoài partition key `PartnerLink-{requestCode}`).

**Critical use case**: publish **KHÔNG** rollback state cục bộ khi thất bại — state đã commit, outbox retry độc lập (`FEAT` AC-32, `BR-CORE-005`).

### 3.14 `PartnerLinkStatusChanged` _(outbound — DESIGN W07)_

**Trigger**: state đổi **do action từ phía GMS**. **KHÔNG** phát khi state đổi do Driver Plus khởi phát (`PARTNER_LINK.REQUEST.WITHDRAW` / `PARTNER_LINK.UNLINK`) — D+ là bên khởi phát, đã biết (CB-SYS-009 + `BR-DPL-NOTI-004` câu cuối).

| `notificationType` | Trigger | Wording (verbatim, VN) | Cite |
|---|---|---|---|
| `APPROVED` | Duyệt thành công (AC-15) | `Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã được duyệt kể từ {DD/MM/YYYY HH:mm}. Bạn có thể bắt đầu chia sẻ dữ liệu với garage.` | `BR-DPL-NOTI-001` · AC-36 |
| `REJECTED` | Từ chối do user thao tác (AC-19) | `Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối. Lý do: {Lý do do garage nhập}.` | `BR-DPL-NOTI-002` · AC-37 |
| `AUTO_REJECTED` | Cascade single-active-link (AC-16) — 1 event **cho từng** record bị auto-reject | `Yêu cầu liên kết của tài khoản D+ {Tên} · {SĐT} tới garage {Tên garage} đã bị từ chối tự động vì garage đã liên kết với tài khoản D+ khác tại thời điểm này.` | `BR-DPL-NOTI-003` · AC-38 |
| `UNLINKED` | Garage Hủy liên kết (AC-24) | `Tài khoản D+ {Tên} · {SĐT} đã bị hủy liên kết với garage {Tên garage} kể từ {DD/MM/YYYY HH:mm}. Lý do: {Lý do do garage nhập}.` | `BR-DPL-NOTI-004` · AC-39 |

**Payload** (headers `MessageStep=PARTNER_LINK.STATUS.CHANGED`, `OriginMessageCode={requestCode}`):

```json
{
  "eventId": "b3f1c2de-0000-4000-8000-000000000030",
  "eventType": "PartnerLinkStatusChanged",
  "eventVersion": "1.0",
  "occurredAt": "2026-08-05T04:00:00Z",
  "tenantId": 5001,
  "requestCode": "LKD-2026-001",
  "partnerCode": "DRIVER_PLUS",
  "partnerAccountName": "Nguyễn Văn Sơn",
  "partnerAccountPhone": "0901234567",
  "fromStatus": "PENDING",
  "toStatus": "LINKED",
  "processedAt": "2026-08-05T04:00:00Z",
  "reason": null,
  "notification": {
    "type": "APPROVED",
    "message": "Yêu cầu liên kết của tài khoản D+ Nguyễn Văn Sơn · 0901234567 tới garage Garage Đăng Vinh đã được duyệt kể từ 05/08/2026 11:00. Bạn có thể bắt đầu chia sẻ dữ liệu với garage."
  }
}
```

| Field | Type | Required | Note | Cite |
|---|---|---|---|---|
| `fromStatus` / `toStatus` | Enum `PartnerLinkStatus` | ✅ | `PENDING \| LINKED \| REJECTED \| UNLINKED` | `BR-GF-SYSTEM` §3.2 |
| `processedAt` | ISO-8601 | ✅ | = `partner_link_request.processed_at` | AC-10 |
| `reason` | String | nullable | Lý do Từ chối/Hủy; `null` khi Duyệt; system-generated khi cascade | AC-16, AC-19, AC-24 |
| `notification.type` | Enum | ✅ | `APPROVED \| REJECTED \| AUTO_REJECTED \| UNLINKED` | `BR-DPL-NOTI-001..004` |
| `notification.message` | String | ✅ | Wording đã render (placeholder điền runtime) — **verbatim** theo bảng trên | AC-36..39 |

**Idempotency**: outbox; Driver Plus dedupe theo `eventId`. Publish fail **KHÔNG** rollback transition đã commit (`FEAT` AC-32).

**Critical use case**: `gf-system` **KHÔNG** publish `NotificationRequest` sang `gf-notification` cho luồng này — audience là tài khoản đối tác ngoài, không phải user GMS (ADR-029 Decision).

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

`Partner Link ↔ Driver Plus` chain _(DESIGN — W07, ADR-029)_:

```
 Driver Plus                         gf-system                        garage-web / garage-mobile
     │                                   │                                       │
     │ ① PARTNER_LINK.REQUEST.CREATE     │                                       │
     │   (partnerAccountPhone = SĐT garage)                                     │
     ├──────────────────────────────────►│ adapter gate (PC-4)                   │
     │                                   │ ├─ resolve tenant từ SĐT thất bại?    │
     │◄──────────────────────────────────┤ │   ──► ② RESPONSE success=false      │
     │                                   │ │       + ERR-DPL-013 (v2)            │
     │                                   │ ├─ resolve OK, đã có LINKED? ──► ②    │
     │◄──────────────────────────────────┤ │   RESPONSE success=false+ERR-DPL-010│
     │                                   │ └─ resolve OK, chưa LINKED ──► INSERT │
     │                                   │     status=PENDING                    │
     │◄──────────────────────────────────┤     ② RESPONSE success=true           │
     │                                   │                                       │
     │                                   │◄── ③ POST /partner-links/{code}/approve
     │                                   │    (1 transaction: LINKED + cascade    │
     │                                   │     auto-reject các PENDING khác)      │
     │◄──────────────────────────────────┤ ④ PARTNER_LINK.PROFILE.SYNC (real-time)│
     │◄──────────────────────────────────┤ ⑤ PARTNER_LINK.STATUS.CHANGED × (1+N)  │
     │                                   │    (APPROVED + AUTO_REJECTED mỗi record)│
     │                                   │                                       │
     │ ⑥ PARTNER_LINK.REQUEST.WITHDRAW   │                                       │
     │    hoặc PARTNER_LINK.UNLINK       │ resolve tenant qua requestCode (v3)   │
     │    (không kèm OriginTenantId)     │ lookup, KHÔNG đọc từ header            │
     ├──────────────────────────────────►│ → UNLINKED, processedByLabel="Driver Plus"
     │        (KHÔNG có noti ngược)      │   UI cập nhật ngầm, không toast        │
```

1. Driver Plus publish `PARTNER_LINK.REQUEST.CREATE` (§3.11) → `gf-system` adapter gate → resolve tenant từ `partnerAccountPhone` (chặn `ERR-DPL-013` nếu fail, ADR-029 v2) → tạo record `PENDING` hoặc chặn theo `BR-DPL-CMN-007` (`ERR-DPL-010`).
2. `gf-system` luôn publish `PARTNER_LINK.REQUEST.RESPONSE` (§3.12) — correlated response thay HTTP đồng bộ (ADR-029).
3. Garage Duyệt qua REST → transition + cascade auto-reject **trong cùng transaction**, enforce bởi partial unique index `uk_plr_tenant_active_link` (`gf-system-data-model.md` §2bis.2).
4. Publish `PARTNER_LINK.PROFILE.SYNC` (§3.13) + `PARTNER_LINK.STATUS.CHANGED` (§3.14) qua outbox — mỗi record bị cascade có 1 event `AUTO_REJECTED` riêng.
5. Chiều ngược (D+ withdraw/unlink) chỉ đổi state cục bộ, **KHÔNG** phát noti ngược. Resolve tenant qua lookup `partner_link_request` theo `requestCode` (ADR-029 v3 gap G4), **không** đọc `OriginTenantId` (D+ không gửi).

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
- ❌ **(W07)** Xử lý message trên `AC-DEV-PARTNER-LINK-EVENTS` mà không filter `MessageGroup=PARTNER_LINK` **+** `MessageStep` — topic dùng chung 3 step inbound (D+ → GMS) và 3 step outbound (GMS → D+); không filter = `gf-system` tự xử lý event của chính mình.
- ❌ **(W07)** Snapshot khối `garageProfile` / `invoiceInfo` vào `partner_link_request` rồi publish lại từ snapshot — CB-SYS-006 + `BR-DPL-SYN-002` yêu cầu đọc **real-time** tại thời điểm publish.
- ❌ **(W07)** Publish `PARTNER_LINK.STATUS.CHANGED` cho state change do Driver Plus khởi phát (withdraw/unlink) — chỉ phát khi action đến từ GMS (CB-SYS-009 + `BR-DPL-NOTI-004`).
- ❌ **(W07)** Route notification Driver Plus qua `gf-notification` / `NotificationRequest` — audience là tài khoản đối tác ngoài, không phải user GMS (ADR-029).
- ❌ **(W07)** Rollback transition đã commit khi outbound push/notification thất bại — outbox retry độc lập (`FEAT-SYS-DRIVERPLUS-LINK` AC-32).
- ❌ **(W07)** Tạo `partner_link_request` từ REST/UI của garage — record chỉ sinh từ inbound event Driver Plus (`BR-DPL-CMN-001`, `BR-GF-SYSTEM.md` §4.2 row cuối).
- ❌ **(W07 v2)** Tạo record `PENDING` khi resolve tenant từ `partnerAccountPhone` thất bại (0 hoặc >1 tenant khớp) — phải trả `ERR-DPL-013`, không tạo record "mồ côi" tenant (ADR-029 v2).
- ❌ **(W07 v2, superseded bởi v3)** ~~Yêu cầu `OriginTenantId` bắt buộc cho `PARTNER_LINK.REQUEST.CREATE` rồi ack+skip khi thiếu — quy tắc đó chỉ áp dụng cho `REQUEST.WITHDRAW`/`UNLINK`.~~ **(v3)** `OriginTenantId` **không bắt buộc ở bất kỳ step inbound partner-link nào** — cả 3 step đều resolve tenant tại adapter gate (ADR-029 v3 gap G4).
- ❌ **(W07 v3)** Yêu cầu `OriginTenantId` bắt buộc cho `PARTNER_LINK.REQUEST.WITHDRAW`/`UNLINK` rồi ack+skip khi thiếu — D+ không quản lý `tenantId` ở 2 step này; resolve phải qua lookup `partner_link_request` theo `data.requestCode`/`headers.OriginMessageCode` (ADR-029 v3 gap G4).
- ❌ **(W07 v3)** Query resolve `WHERE request_code = ?` mà tự chọn 1 record khi trả về **>1 kết quả** — unique constraint hiện tại `(tenant_id, request_code)` không global-unique nên case này lý thuyết có thể xảy ra; phải alert vận hành P1 + ack+skip, KHÔNG tự đoán tenant.
- ❌ **(W07 v3)** Assume `data.requestCode` ở `WITHDRAW`/`UNLINK` luôn khớp record — nếu D+ gửi mã mới thay vì tái sử dụng mã gốc từ `CREATE`, resolve sẽ ra 0 record và message bị ack+skip âm thầm (rủi ro vận hành đã ghi trong ADR-029 v3 Consequences, không có cách tự phát hiện từ phía GMS ngoài giám sát log warning).

---

## 6. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Consumer file (chain downstream):
  - [gf-inventory-events.md](gf-inventory-events.md) — consume `BranchCreated`, `TenantProvisioned`
  - [gf-erp-agent-events.md](gf-erp-agent-events.md) — consume `TenantActivated` (LOCATION handler)
- ADR:
  - `ADR-004-kafka-event-driven-integration.md`
  - `ADR-029-driver-plus-kafka-adapter-on-gf-system.md` — giao thức GMS ↔ Driver Plus (W07)
  - `ADR-030-tenant-profile-sot-on-gf-system.md` — nguồn dữ liệu cho `PARTNER_LINK.PROFILE.SYNC`
- Integration contract external: [`INTEG-EXT-driver-plus.md`](../integrations/INTEG-EXT-driver-plus.md)
- Data model: [`gf-system-data-model.md`](../data/gf-system-data-model.md) §2bis (`partner_link_request`, `tenant_profile`, enum W07)
- API: [`gf-system-api.md`](../api/gf-system-api.md) §3bis (6 endpoint partner-link) + §5 Naming Registry

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-08-12 | v7 | **ADR-029 v3 amendment — resolve tenant từ `requestCode` tại `PARTNER_LINK.REQUEST.WITHDRAW`/`UNLINK`** (gap G4 do Driver Plus team phát hiện: D+ không quản lý `tenantId` GMS ở bất kỳ step nào, không riêng `REQUEST.CREATE`). §3.11: envelope note `OriginTenantId` không bắt buộc ở cả 3 step; thêm "Thứ tự gate `WITHDRAW`/`UNLINK`" (resolve qua `partner_link_request WHERE request_code = ?`, 3 nhánh 0/1/>1 record); payload `WITHDRAW`/`UNLINK` bỏ field `tenantId` (`eventVersion` 1.0→2.0) + warning box mới; field table `requestCode` note "D+ tái sử dụng nguyên vẹn"; Consumer logic bước 2 gộp chung (không phân biệt step nữa) + bước 4 thêm nhánh resolve `WITHDRAW`/`UNLINK`; Idempotency note thêm phụ thuộc D+ giữ `requestCode` gốc. §5: supersede 1 forbidden pattern v2 (phạm vi sai) + thêm 3 forbidden pattern v3 mới. **KHÔNG tạo `MessageStep`/topic mới**, không cần error code mới (2 step này không phát response ngược). Cascade chưa thực hiện trong version này: `INTEG-EXT-driver-plus.md` §5.1/§6.1, `gf-system-data-model.md` §2bis.2 (index `idx_plr_request_code_lookup`), `FEAT-SYS-DRIVERPLUS-LINK.md` AC-33/AC-35. Nguồn quyết định: ADR-029 v3 (2026-08-12). v6 → v7. |
| 2026-08-11 | v6 | **ADR-029 v2 amendment — resolve tenant từ SĐT tại `PARTNER_LINK.REQUEST.CREATE`** (gap G3 do Driver Plus team phát hiện: SĐT đúng định dạng nhưng không tồn tại GMS, D+ không có danh bạ để tự validate → trước đây phải chờ 60' timeout phía D+). §2.1 row 7 + §2.2 row 15 cập nhật note. §3.11: thêm variant "không resolve được tenant" vào bảng transition + prose thứ tự gate; payload `CREATE` bỏ `tenantId` (D+ không tự biết), đổi nghĩa `partnerAccountPhone` = SĐT garage (không phải SĐT tài khoản D+); Consumer logic bước 2+4 đặc cách `REQUEST.CREATE` (không bắt buộc `OriginTenantId`, resolve tenant tại gate trước single-active guard). §3.12: thêm payload example nhánh `ERR-DPL-013` (`tenantId=null`), field table 2 error code. §4 ASCII flow + prose cập nhật nhánh resolve fail. §5 thêm 2 forbidden pattern W07 v2. **KHÔNG tạo `MessageStep`/topic mới** — tái dùng `PARTNER_LINK.REQUEST.RESPONSE` đã có, chỉ thêm error code `ERR-DPL-013`. Cascade bắt buộc, **chưa thực hiện trong version này**: `Product/Commons/ERROR-CODE-REGISTRY.md` (đăng ký `ERR-DPL-013`), `FEAT-SYS-DRIVERPLUS-LINK.md` (đổi mô tả AC-9), `INTEG-EXT-driver-plus.md` §4.1/§5.1. Nguồn quyết định: ADR-029 v2 (2026-08-11). v5 → v6. |
| 2026-08-07 | v5 | **ARCH-REVIEW-W07 P2 fix** — §3.10 bị dùng 2 lần (baseline `Employee*Changed` vs W07 `PartnerLink*`). Renumber 4 sub-section W07: `PartnerLink*` 3.10→**3.11**, `PartnerLinkRequestResponse` 3.11→**3.12**, `PartnerLinkProfileSync` 3.12→**3.13**, `PartnerLinkStatusChanged` 3.13→**3.14**. Cascade toàn bộ cross-ref nội bộ file (§2.1 rows 7-9, §2.2 rows 15-17, §4 flow prose, Change Log v4 row). `Employee*Changed` giữ nguyên §3.10 (baseline, không đụng). |
| 2026-08-05 | v4 | **W07 EP-PARTNER-LINK (DESIGN)** — thêm topic mới `AC-DEV-PARTNER-LINK-EVENTS` (`MessageGroup=PARTNER_LINK`) với 6 `MessageStep`: **3 inbound** từ Driver Plus (`PARTNER_LINK.REQUEST.CREATE` / `.REQUEST.WITHDRAW` / `.UNLINK` — §2.2 rows 15-17 + §3.11) và **3 outbound** sang Driver Plus (`PARTNER_LINK.REQUEST.RESPONSE` correlated response §3.12 · `PARTNER_LINK.PROFILE.SYNC` §3.13 · `PARTNER_LINK.STATUS.CHANGED` mang wording noti 4 loại §3.14 — §2.1 rows 7-9). §4 thêm chain `Partner Link ↔ Driver Plus` (ASCII). §5 thêm 6 forbidden pattern W07. §6 thêm ADR-029/ADR-030 + INTEG-EXT-driver-plus + cross-ref data-model §2bis + api §3bis/§5. Resolve CB-SYS-004/005/007/008/009 + `FEAT-SYS-DRIVERPLUS-LINK` §4 (5 dòng NEED CONFIRMATION) theo ADR-029 (USER ANSWERS Q1/Q2 2026-08-05). **KHÔNG đụng**: §1 producer summary counts baseline, §2.1 rows 1-6, §2.2 rows 9-14, §3.1-§3.9, chain baseline §4. v3 → v4. |
| 2026-05-19 | v3 | Source-of-truth audit: strip `TenantPolicySyncRequested` + `TenantUserSyncRequested` khỏi active catalog → `code-commented-out` (PolicyEventHelper không tồn tại, TenantSyncUserPublisher call-sites commented out, MessageStep enum chỉ có USER_1 không có USER_CREATED.1/USER_UPDATED.1); catalog 8→6 active + 2 commented-out; fix §3.8 TenantTransporterRegistryEvent: `isDeleted` field không tồn tại trong payload class; cập nhật forbidden patterns. |
| 2026-05-12 | v2.1 | Fix trigger §3.7 `TenantInvoiceInfoUpdated`: Garage REST path (không phải command listener); COP path không publish event. |
| 2026-05-12 | v2 | Thêm 2 outbound events: `TenantInvoiceInfoUpdated` (§3.7, outbox) và `TenantTransporterRegistryEvent` UPSERTED/DELETED (§3.8, outbox); catalog 6→8, renumber IAM/HR inbound §3.7-3.8→§3.9-3.10; thêm 4 forbidden patterns. |
| 2026-05-07 | v1 | Initial events spec: 6 outbound + 6 inbound (IAM/HR); direct Kafka publish; workflow correlation 3 chains; security note tempPassword. |
