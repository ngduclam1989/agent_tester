---
type: architecture
artifact_kind: data-model
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-05-19"
depends_on:
  - "../hld/gf-system-HLD.md"
  - "../events/tenant-system-events.md"
  - "../workflows/system-tenant-branch-provisioning-flow.md"
  - "../decisions/ADR-006-flyway-per-service-data-ownership.md"
  - "../decisions/ADR-009-jpa-entity-no-relationship-mapping.md"
---

# Data Model — gf-system

> PostgreSQL qua Spring Data JPA và Flyway, schema mặc định `${DB_SCHEMA:dev_gf_system}`. Mô hình này phản ánh source hiện tại của `gf-system` (7 bảng): JPA entity, migration SQL, enum, repository, index và constraint.

## 1. ERD Overview

```mermaid
erDiagram
    tenant_subscriptions ||--o{ branches : "tenant_id"
    tenant_subscriptions ||..o| tenant_invoice_info : "tenant_id logic"
    tenant_subscriptions ||..o{ tenant_transporter_registry : "tenant_id logic"
    tenant_subscriptions ||..o{ inbox_event : "tenant_id logic"
    tenant_invoice_info ||..o{ outbox_events : "publish tenant invoice event"
    tenant_transporter_registry ||..o{ outbox_events : "publish transporter registry event"
    sequences ||..o{ branches : "sinh branch_code"

    tenant_subscriptions {
        BIGINT id PK
        BIGINT tenant_id UK
        VARCHAR_50 subscription_plan
        INTEGER max_branches
        INTEGER max_warehouses
        INTEGER max_users
        JSONB features
        TIMESTAMPTZ valid_from
        TIMESTAMPTZ valid_until
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        VARCHAR_100 created_by
        VARCHAR_100 updated_by
        TIMESTAMPTZ synced_at
    }

    branches {
        BIGINT id PK
        BIGINT tenant_id FK
        VARCHAR_50 branch_code UK
        VARCHAR_255 branch_name
        VARCHAR_50 status
        BOOLEAN is_default
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        VARCHAR_100 created_by
        VARCHAR_100 updated_by
        JSONB additional_config
        TIMESTAMPTZ synced_at
    }

    tenant_invoice_info {
        BIGINT id PK
        BIGINT tenant_id UK
        VARCHAR_255 company_name
        VARCHAR_50 tax_code
        VARCHAR_255 company_email_address
        TEXT company_address
        BIGINT version
        VARCHAR_50 status
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        VARCHAR_100 created_by
        VARCHAR_100 updated_by
    }

    tenant_transporter_registry {
        BIGINT id PK
        BIGINT cop_transporter_registry_id
        BIGINT tenant_id
        VARCHAR_50 tenant_type
        VARCHAR_255 transporter_name
        VARCHAR_255 route_name
        VARCHAR_20 route_contact_phone_number
        TEXT route_started_at
        TEXT shipping_address
        TEXT note
        VARCHAR_50 status
        BIGINT version
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        VARCHAR_100 created_by
        VARCHAR_100 updated_by
    }

    inbox_event {
        VARCHAR_100 event_id PK
        VARCHAR_100 event_type
        VARCHAR_100 source_service
        BIGINT tenant_id
        TIMESTAMPTZ received_at
        TIMESTAMPTZ processed_at
        VARCHAR_20 status
    }

    outbox_events {
        BIGINT id PK
        VARCHAR_100 event_id UK
        VARCHAR_100 event_type
        VARCHAR_255 topic
        VARCHAR_100 partition_key
        TEXT metadata
        TEXT payload
        VARCHAR_20 status
        INTEGER retry_count
        INTEGER max_retries
        TEXT last_error
        TIMESTAMPTZ processed_at
        TIMESTAMPTZ published_at
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
        VARCHAR_100 created_by
        VARCHAR_100 updated_by
    }

    sequences {
        VARCHAR_100 sequence_name PK
        BIGINT current_value
        INTEGER increment_by
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }
```

## 2. Entities

### tenant_subscriptions

Projection subscription quota theo tenant, được đổi tên từ `tenant_subscriptions_cache` trong migration V4.

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | BIGSERIAL | NO | Primary key hiện tại sau migration V4 |
| tenant_id | BIGINT | NO | Tenant ID từ control plane; unique index `idx_tenant_subscriptions_tenant_id` |
| subscription_plan | VARCHAR(50) | NO | Gói subscription, lưu dạng string |
| max_branches | INTEGER | NO | Số branch tối đa; default DB còn lại từ V1 là `1` |
| max_warehouses | INTEGER | NO | Số warehouse tối đa; default DB còn lại từ V1 là `1` |
| max_users | INTEGER | NO | Số user tối đa; migration V4 chỉ drop default, không drop `NOT NULL` |
| features | JSONB | YES | Cấu hình feature sau khi V4 gom các cột flag cũ vào JSON |
| valid_from | TIMESTAMP WITH TIME ZONE | NO | Thời điểm subscription bắt đầu hiệu lực |
| valid_until | TIMESTAMP WITH TIME ZONE | YES | Thời điểm hết hiệu lực; `NULL` nghĩa là không giới hạn |
| created_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp tạo, từ `AuditableEntity` và migration V1 |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp cập nhật, từ `AuditableEntity` và migration V1 |
| created_by | VARCHAR(100) | YES | Audit actor tạo |
| updated_by | VARCHAR(100) | YES | Audit actor cập nhật |
| synced_at | TIMESTAMP WITH TIME ZONE | NO | Thời điểm đồng bộ gần nhất từ tenant provisioning event |

**Indexes**: `idx_tenant_subscriptions_tenant_id` unique trên `tenant_id`.

**Constraints**: PK trên `id`; unique vật lý qua index `idx_tenant_subscriptions_tenant_id`; các cột `tenant_code`, `feature_multi_branch`, `feature_inventory_management`, `feature_advanced_reports` đã bị drop trong V4.

### branches

Branch master/support data của `gf-system`, tạo mặc định khi nhận tenant provisioning hợp lệ.

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | BIGSERIAL | NO | Primary key của branch |
| tenant_id | BIGINT | NO | Tenant sở hữu branch; FK tới `tenant_subscriptions(tenant_id)` |
| branch_code | VARCHAR(50) | NO | Mã branch, unique toàn cục |
| branch_name | VARCHAR(255) | NO | Tên branch; migration giữ `NOT NULL`, service lấy từ tenant name |
| status | VARCHAR(50) | NO | Trạng thái branch; default DB sau V4 là `ACTIVE`, JPA dùng `BranchStatusEnum` |
| is_default | BOOLEAN | NO | Cờ branch mặc định; default DB là `false` |
| created_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp tạo, từ `AuditableEntity` và migration V1 |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp cập nhật, từ `AuditableEntity` và migration V1 |
| created_by | VARCHAR(100) | YES | Audit actor tạo |
| updated_by | VARCHAR(100) | YES | Audit actor cập nhật |
| additional_config | JSONB | YES | Cấu hình bổ sung dạng JSONB, thêm trong V4 |
| synced_at | TIMESTAMP WITH TIME ZONE | YES | Thời điểm đồng bộ gần nhất, thêm trong V4 |

**Indexes**: `idx_branches_tenant_id` trên `tenant_id`; `idx_branches_branch_code` trên `branch_code`; `idx_branches_status` trên `status`; JPA entity còn khai báo `idx_branches_branch_type` nhưng migration V4 đã drop cột/index `branch_type`.

**Constraints**: PK trên `id`; unique constraint từ V1 trên `branch_code`; FK `fk_branches_tenant_id` từ `tenant_id` tới `tenant_subscriptions(tenant_id)` với `ON DELETE CASCADE`. Unique partial index một default branch mỗi tenant đã bị drop trong V4 và chưa được tạo lại.

### tenant_invoice_info

Thông tin xuất hóa đơn theo tenant, được cập nhật qua protected API hoặc command Kafka.

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | BIGSERIAL | NO | Primary key của thông tin hóa đơn |
| tenant_id | BIGINT | NO | Tenant ID; unique để mỗi tenant có tối đa một invoice profile |
| company_name | VARCHAR(255) | YES | Tên công ty dùng trên hóa đơn |
| tax_code | VARCHAR(50) | YES | Mã số thuế |
| company_email_address | VARCHAR(255) | YES | Email công ty |
| company_address | TEXT | YES | Địa chỉ công ty |
| version | BIGINT | YES | Optimistic locking field từ `@Version` |
| status | VARCHAR(50) | NO | Trạng thái record; default DB và aggregate là `ACTIVE` |
| created_at | TIMESTAMP WITH TIME ZONE | YES | Audit timestamp tạo; migration V5 không đặt `NOT NULL` |
| updated_at | TIMESTAMP WITH TIME ZONE | YES | Audit timestamp cập nhật; migration V5 không đặt `NOT NULL` |
| created_by | VARCHAR(100) | YES | Audit actor tạo |
| updated_by | VARCHAR(100) | YES | Audit actor cập nhật |

**Indexes**: `idx_tenant_invoice_info_tenant_id` unique trên `tenant_id`.

**Constraints**: PK trên `id`; unique constraint inline trên `tenant_id`; unique index `idx_tenant_invoice_info_tenant_id` trùng mục đích với unique constraint inline.

### tenant_transporter_registry

Dữ liệu đăng ký nhà vận chuyển theo tenant, source-of-truth trong `gf-system`. Được tạo trong migration V6.

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | BIGSERIAL | NO | Primary key |
| cop_transporter_registry_id | BIGINT | YES | ID gốc từ ct-saas-tenant registry, dùng để trace và đối soát |
| tenant_id | BIGINT | NO | Tenant scope; index `idx_tenant_transporter_registry_tenant_id` |
| tenant_type | VARCHAR(50) | YES | Loại tenant, ví dụ `GARAGE` |
| transporter_name | VARCHAR(255) | NO | Tên nhà vận chuyển |
| route_name | VARCHAR(255) | NO | Tên tuyến vận chuyển |
| route_contact_phone_number | VARCHAR(20) | NO | Số điện thoại liên hệ tuyến, unique per tenant qua `uk_tenant_transporter_registry_phone` |
| route_started_at | TEXT | NO | Thời gian khởi hành tuyến, lưu dạng text comma-separated `hh:mm` |
| shipping_address | TEXT | NO | Địa chỉ giao hàng |
| note | TEXT | YES | Ghi chú tùy chọn |
| status | VARCHAR(50) | NO | Trạng thái record; default DB là `ACTIVE`, JPA dùng `TenantTransporterRegistryStatus` |
| version | BIGINT | NO | Monotonic record version cho event ordering; default DB/JPA là `1` |
| created_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp tạo; default DB là `CURRENT_TIMESTAMP`, từ `AuditableEntity` |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp cập nhật; default DB là `CURRENT_TIMESTAMP`, từ `AuditableEntity` |
| created_by | VARCHAR(100) | YES | Audit actor tạo |
| updated_by | VARCHAR(100) | YES | Audit actor cập nhật |

**Indexes**: `idx_tenant_transporter_registry_tenant_id` trên `tenant_id`; `idx_tenant_transporter_registry_status` trên `status`; `idx_tenant_transporter_registry_created_at` trên `created_at`; `idx_tenant_transporter_registry_phone` trên `route_contact_phone_number`; `uk_tenant_transporter_registry_phone` unique trên `(tenant_id, route_contact_phone_number)`.

**Constraints**: PK trên `id`; unique composite index `uk_tenant_transporter_registry_phone` đảm bảo mỗi tenant chỉ có một route contact phone number duy nhất. Không có FK vật lý tới `tenant_subscriptions`.

### inbox_event

Inbox idempotency cho tenant invoice info và tenant transporter registry command.

| Column | Type | Nullable | Description |
|---|---|---|---|
| event_id | VARCHAR(100) | NO | Primary key và message id dùng để chống xử lý trùng |
| event_type | VARCHAR(100) | YES | Loại inbox event; xem enum `InboxEventType` |
| source_service | VARCHAR(100) | YES | Source service lấy từ message, fallback `UNKNOWN` trong listener |
| tenant_id | BIGINT | YES | Tenant liên quan tới command, lấy từ `OriginTenantId` |
| received_at | TIMESTAMP WITH TIME ZONE | YES | Thời điểm nhận command |
| processed_at | TIMESTAMP WITH TIME ZONE | YES | Thời điểm xử lý command |
| status | VARCHAR(20) | YES | Trạng thái inbox; default DB và aggregate là `RECEIVED` |

**Indexes**: `idx_ie_event_id` trên `event_id`; `idx_ie_processed_at` trên `processed_at`; `idx_ie_tenant_id` trên `tenant_id`.

**Constraints**: PK trên `event_id`. Không có FK tới `tenant_subscriptions` hoặc `tenant_invoice_info`.

### outbox_events

Transactional outbox table cho event publish qua Kafka.

| Column | Type | Nullable | Description |
|---|---|---|---|
| id | BIGSERIAL | NO | Primary key của outbox event |
| event_id | VARCHAR(100) | NO | ID event duy nhất do service sinh bằng UUID |
| event_type | VARCHAR(100) | NO | Loại message từ `Message.getType()` |
| topic | VARCHAR(255) | NO | Kafka topic đích |
| partition_key | VARCHAR(100) | NO | Kafka partition key, thường là tenant id dạng string |
| metadata | TEXT | YES | Header/metadata serialized JSON |
| payload | TEXT | NO | Payload serialized JSON |
| status | VARCHAR(20) | NO | Trạng thái xử lý, map enum `EventStatus` |
| retry_count | INTEGER | NO | Số lần retry hiện tại; default DB/JPA là `0` |
| max_retries | INTEGER | NO | Số lần retry tối đa; default DB/JPA là `3` |
| last_error | TEXT | YES | Lỗi cuối cùng khi publish thất bại |
| processed_at | TIMESTAMP WITH TIME ZONE | YES | Thời điểm chuyển sang processing |
| published_at | TIMESTAMP WITH TIME ZONE | YES | Thời điểm publish thành công |
| created_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp tạo, từ `AuditableEntity` và migration V2 |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | Audit timestamp cập nhật, từ `AuditableEntity` và migration V2 |
| created_by | VARCHAR(100) | YES | Audit actor tạo |
| updated_by | VARCHAR(100) | YES | Audit actor cập nhật |

**Indexes**: `idx_outbox_events_pending` partial trên `(status, created_at)` khi `status = 'PENDING'`; `idx_outbox_events_event_id` trên `event_id`; `idx_outbox_events_event_type` trên `event_type`.

**Constraints**: PK trên `id`; unique constraint inline trên `event_id`. Repository query pending dùng `FOR UPDATE SKIP LOCKED` để nhiều instance không xử lý trùng batch.

### sequences

Bảng SQL-only phục vụ function sinh số thứ tự.

| Column | Type | Nullable | Description |
|---|---|---|---|
| sequence_name | VARCHAR(100) | NO | Primary key của sequence; branch service hiện truyền `tenantCode` |
| current_value | BIGINT | NO | Giá trị hiện tại; default DB là `0` |
| increment_by | INTEGER | NO | Bước tăng; default DB là `1` |
| created_at | TIMESTAMP WITH TIME ZONE | NO | Thời điểm tạo sequence |
| updated_at | TIMESTAMP WITH TIME ZONE | NO | Thời điểm cập nhật sequence |

**Indexes**: PK index trên `sequence_name`.

**Constraints**: PK trên `sequence_name`. Function `${DB_SCHEMA}.get_next_number(sequenceName VARCHAR(100))` tăng `current_value` atomically, auto-initialize record nếu chưa có.

## 3. Data Isolation

`gf-system` dùng pooled schema theo service-owned schema, không có schema riêng cho từng tenant. Cô lập tenant được thực hiện bằng khóa tenant trên từng bảng có dữ liệu tenant-scoped:

- `tenant_subscriptions.tenant_id` là unique business key cho projection subscription quota.
- `branches.tenant_id` là FK tới `tenant_subscriptions(tenant_id)`, nhưng unique partial index một default branch mỗi tenant đã bị drop trong V4; hiện idempotency chính nằm ở `JpaBranchRepository.existsByTenantIdAndIsDefaultTrue`.
- `tenant_invoice_info.tenant_id` là unique key để mỗi tenant chỉ có một invoice profile.
- `tenant_transporter_registry.tenant_id` là NOT NULL, index `idx_tenant_transporter_registry_tenant_id`; unique composite `uk_tenant_transporter_registry_phone` trên `(tenant_id, route_contact_phone_number)` đảm bảo không trùng phone number trong cùng tenant.
- `inbox_event.tenant_id` là metadata tenant cho command đã nhận; idempotency thực tế dựa trên PK `event_id`.
- `outbox_events` không có `tenant_id` vật lý; tenant nằm trong `partition_key`, `metadata` hoặc `payload` tùy event.
- `sequences` không có `tenant_id`; branch code dùng `sequence_name = tenantCode`, nên naming convention phải tránh collision.

## 4. Migration

Migration được quản lý bằng Flyway với `spring.jpa.hibernate.ddl-auto=none`, `validate-on-migrate=true`, `baseline-on-migrate=true` và placeholder `${DB_SCHEMA}`. Các migration hiện có:

| Migration | Nội dung |
|---|---|
| V1__initialize.sql | Tạo schema, `tenant_subscriptions_cache`, `branches`, FK/index/comment ban đầu |
| V2__create_outbox_events_table.sql | Tạo `outbox_events`, index pending/event id/event type |
| V3__create_sequence_table.sql | Tạo `sequences` và function `${DB_SCHEMA}.get_next_number` |
| V4__update_schema_for_tenant_subscriptions_and_branches.sql | Đổi `tenant_subscriptions_cache` thành `tenant_subscriptions`, thêm `id`, `features`, cập nhật `branches`, drop các cột contact/branch type cũ |
| V5__create_tenant_invoice_info.sql | Tạo `tenant_invoice_info`, `inbox_event` và các index liên quan |
| V6__create_tenant_transporter_registry_table.sql | Tạo `tenant_transporter_registry`, unique index `uk_tenant_transporter_registry_phone` trên `(tenant_id, route_contact_phone_number)`, các index trên `tenant_id`, `status`, `route_contact_phone_number`, `created_at` |

Repository hiện tại gồm `JpaTenantSubscriptionsRepository.findByTenantId`, `JpaBranchRepository.existsByTenantIdAndIsDefaultTrue`, `JpaTenantInvoiceInfoRepository.findByTenantId`, `JpaTenantTransporterRegistryRepository.findByTenantIdAndId/findByTenantIdAndCopTransporterRegistryId/findByTenantIdAndRouteContactPhoneNumber/existsByTenantIdAndRouteContactPhoneNumber/existsByTenantIdAndRouteContactPhoneNumberAndIdNot`, `JpaInboxEventRepository.existsByEventId` và `JpaOutboxEventRepository.findPendingEventsForProcessing/findByEventId/deleteOldPublishedAndFailedEvents`.

Enum/persistence state hiện tại gồm:

| Enum/constant | Giá trị |
|---|---|
| EventStatus | `PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED` |
| BranchStatusEnum | `DRAFT`, `PENDING_APPROVAL`, `ACTIVE`, `SUSPENDED`, `INACTIVE`, `CANCELLED` |
| TenantTransporterRegistryStatus | `ACTIVE`, `INACTIVE` |
| InboxEventType | `TENANT_INVOICE_INFO_UPSERT_REQUESTED`, `TENANT_TRANSPORTER_REGISTRY_UPSERT_REQUESTED`, `TENANT_TRANSPORTER_REGISTRY_DELETE_REQUESTED` |
| MessageGroup | `TENANT-ACTIVATION`, `USER`, `TENANT-PROVISIONING`, `BRANCH-LIFECYCLE`, `TENANT-TRANSPORTER-REGISTRY`, `TENANT_INVOICE_PROFILE_COMMANDS`, `TENANT_INVOICE_PROFILE_EVENTS` |
| MessageStep | `BRANCH_CREATED.1`, `TENANT_PROVISIONED.1`, `TENANT_TRANSPORTER_REGISTRY_UPSERT_REQUESTED`, `TENANT_TRANSPORTER_REGISTRY_DELETE_REQUESTED`, `TENANT_TRANSPORTER_REGISTRY_UPSERTED`, `TENANT_TRANSPORTER_REGISTRY_DELETED`, `TENANT_INVOICE_INFO_UPSERT_REQUESTED`, `TENANT_INVOICE_INFO_UPDATED` |
| FeatureFlags.INVENTORY_INVENTORY_STOCK | `Inventory:InventoryStockV01` |

Rủi ro source/schema đã ghi nhận:

- `BranchEntity` còn khai báo index `idx_branches_branch_type` trên `branch_type`, nhưng migration V4 đã drop cột và index này.
- `branches.branch_name` là `NOT NULL` trong migration, nhưng JPA annotation không khai báo `nullable = false`.
- `tenant_subscriptions.max_users` còn `NOT NULL` trong schema do V4 chỉ drop default, nhưng JPA annotation cho phép nullable.
- `tenant_invoice_info.created_at` và `updated_at` nullable trong V5 dù entity kế thừa audit.
- `tenant_invoice_info.tenant_id` có cả unique constraint inline và unique index riêng, trùng mục đích.

## 5. References

- [gf-system-HLD.md](../hld/gf-system-HLD.md)
- [tenant-system-events.md](../events/tenant-system-events.md)
- [system-tenant-branch-provisioning-flow.md](../workflows/system-tenant-branch-provisioning-flow.md)
- [ADR-006-flyway-per-service-data-ownership.md](../decisions/ADR-006-flyway-per-service-data-ownership.md)
- [ADR-009-jpa-entity-no-relationship-mapping.md](../decisions/ADR-009-jpa-entity-no-relationship-mapping.md)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Thêm bảng `tenant_transporter_registry` (V6 migration) với đầy đủ columns, indexes, constraints. Cập nhật enum `InboxEventType` (+`TENANT_TRANSPORTER_REGISTRY_UPSERT_REQUESTED`, `TENANT_TRANSPORTER_REGISTRY_DELETE_REQUESTED`), `MessageStep` (+4 giá trị transporter registry), `MessageGroup` (+`TENANT-TRANSPORTER-REGISTRY`), thêm enum `TenantTransporterRegistryStatus`. Cập nhật ERD, data isolation, repository list. |
| 2026-05-07 | v1 | Initial data model cho `gf-system`: PostgreSQL schema `${DB_SCHEMA:dev_gf_system}` với 6 bảng `tenant_subscriptions`, `branches`, `tenant_invoice_info`, `inbox_event`, `outbox_events`, `sequences`, các enum `EventStatus`, `BranchStatusEnum`, `InboxEventType`, `MessageGroup`, `MessageStep`. Pooled multi-tenant qua `tenant_id` ở các bảng tenant-scoped; outbox không có tenant column và sequences là global. Migration bằng Flyway (V1-V5) với JPA `ddl-auto=none`, `validate-on-migrate`. Bao gồm ERD overview, entities, data isolation, migration, references.
