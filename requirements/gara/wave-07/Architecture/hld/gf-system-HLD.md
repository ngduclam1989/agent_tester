---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 4.2
tier: T1
owner_authority: Architecture Authority
boundary: gf-system
last_reviewed: "2026-08-10"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../events/tenant-system-events.md
  - ../data/gf-system-data-model.md
  - ../api/gf-system-api.md
  - ../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md
  - ../decisions/ADR-030-tenant-profile-sot-on-gf-system.md
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

**Partner Link — Driver Plus (Kafka + REST)** _(DESIGN — W07, EP-PARTNER-LINK; ADR-029 + ADR-030)_
- Own **adapter Driver Plus** trên topic mới `AC-DEV-PARTNER-LINK-EVENTS` (`MessageGroup=PARTNER_LINK`) — KHÔNG qua `gf-erp-agent` (ADR-029).
- Consume 3 step inbound: `PARTNER_LINK.REQUEST.CREATE` (tạo yêu cầu `LKD-YYYY-NNN`) · `PARTNER_LINK.REQUEST.WITHDRAW` (D+ hủy yêu cầu đang chờ) · `PARTNER_LINK.UNLINK` (D+ hủy liên kết đang hoạt động). Adapter validation gate (PC-4 / BR-CORE-012) + single-active guard `BR-DPL-CMN-007` chạy **trước** khi ghi domain table; idempotent qua `inbox_event`.
- Publish 3 step outbound qua outbox: `PARTNER_LINK.REQUEST.RESPONSE` (correlated response thay HTTP đồng bộ) · `PARTNER_LINK.PROFILE.SYNC` (đẩy hồ sơ garage real-time) · `PARTNER_LINK.STATUS.CHANGED` (state change + wording notification 4 loại — gửi **trực tiếp** sang D+, KHÔNG qua `gf-notification`).
- Expose public REST `/api/v1/system/partner-links` — 6 endpoint cho màn "Liên kết" (list · detail · approve · reject · resync · cancel). **KHÔNG có endpoint tạo** (`BR-DPL-CMN-001`).
- Enforce invariant single-active-link ở tầng DB: partial unique `uk_plr_tenant_active_link (tenant_id) WHERE status='LINKED'`; Duyệt + cascade auto-reject **all-or-nothing trong 1 transaction**.
- Own `tenant_profile` — SoT hồ sơ doanh nghiệp/địa chỉ garage (ADR-030), seed từ `TenantProvisionedEvent` payload sẵn có.
- `PartnerLink:DriverPlus` là kill-switch toàn luồng: `off` chặn REST/action, không tạo request mới (`PARTNER_LINK.REQUEST.RESPONSE` trả `ERR-DPL-011`), không phát `PROFILE.SYNC`/`STATUS.CHANGED`; giữ nguyên dữ liệu/audit hiện hữu. Client đồng thời ẩn menu/tab.

**Infrastructure**
- Cung cấp `sequences` table + function `get_next_number` cho sinh số thứ tự nội bộ (vd branch code). **Lưu ý**: mã `LKD-YYYY-NNN` **KHÔNG** dùng `sequences` — do Driver Plus tự sinh và gửi sang.
- Transactional outbox với `OutboxEventListener` (AFTER_COMMIT) và `OutboxScheduler` polling 60s (fallback).

**Owned boundary**: tenant projection + branch master + tenant invoice info + transporter registry + **partner link request + tenant profile (W07)**.

---

## 2. Component Diagram (C4 Level 3)

```
┌─────────── gf-system  (Java 21 · Spring Boot 3.5.0) ────────────┐
│  ┌────────────────────┐ ┌──────────────────────────┐            │
│  │ REST Controllers   │ │ Kafka Consumers          │            │
│  │ TenantTransporter- │ │ TenantProvisionedEvent-  │            │
│  │ RegistryCtrl·      │ │ Listener (GARAGE filter)·│            │
│  │ InternalTenant-    │ │ TenantInvoiceInfoCmd·    │            │
│  │ InvoiceInfoCtrl·   │ │ TransporterRegistryCmd·  │            │
│  │ PartnerLinkCtrl(W07)│ │ PartnerLinkDriverPlus-  │            │
│  │                    │ │ Consumer (W07, 3 steps)  │            │
│  └──────────┬─────────┘ └────────────┬─────────────┘            │
│  ┌──────────▼─────────────────────────▼────────────┐            │
│  │ APP / DOMAIN SERVICES                           │            │
│  │  TenantSubscriptionsService · BranchService ·   │            │
│  │  TenantInvoiceInfoService ·                     │            │
│  │  TenantTransporterRegistryService ·             │            │
│  │  PartnerLinkService (W07 — approve+cascade      │            │
│  │   1 tx) · TenantProfileService (W07, SoT)       │            │
│  │  EventPublisher (BranchEventPublisher DIRECT +  │            │
│  │   OutboxService AFTER_COMMIT)                   │            │
│  └──────────┬───────────────────────┬──────────────┘            │
│  ┌──────────▼─────┐ ┌────────────────▼────────────┐             │
│  │ JPA/Flyway     │ │ Kafka producer + outbox     │             │
│  │ [dev_gf_system]│ │  OutboxScheduler poll 60s   │             │
│  │ V1-V8 (W07)    │ │  SKIP LOCKED (fallback)     │             │
│  └──────────┬─────┘ └──────────┬──────────────────┘             │
│  /api/v1/* │ /protected/v1/* │ Actuator + OTLP                  │
│    [no external REST downstream — Kafka-driven]                 │
└───────────┴───────────────┴─────────────────────────────────────┘
            ▼                ▼
   PostgreSQL [dev_gf_system]   Kafka P: BRANCH-LIFECYCLE (direct)·
   9 tables · V1-V8             INVOICE-INFO·TRANSPORTER-REG·
   (+partner_link_request       PARTNER-LINK (outbox, W07) ;
    +tenant_profile — W07)      C: TENANT-PROVISIONING·INVOICE·
                                   TRANSPORTER·PARTNER-LINK (W07)
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
| **(W07)** Adapter Driver Plus do `gf-system` tự own, KHÔNG qua `gf-erp-agent` | Tái dùng 100% outbox/inbox sẵn có; đúng precedent `gf-sales` `BookingDriverPlusConsumer`; PC-4 yêu cầu **validation gate**, không yêu cầu service cụ thể | **ADR-029** |
| **(W07)** "Response đồng bộ" mô hình hoá bằng **correlated response event** trên cùng topic | Giữ nguyên kênh Kafka production với D+, không cần cutover 2 bên; semantics nghiệp vụ (`ERR-DPL-010`) giữ nguyên | **ADR-029** · `FEAT` AC-34 |
| **(W07)** Invariant single-active-link enforce bằng **partial unique index** `(tenant_id) WHERE status='LINKED'` | Atomic dưới concurrent write mà không cần lock bảng/Redis; đúng cơ chế Product đề xuất | **`FEAT` AC-31** (NEED CONFIRMATION → RESOLVED) · `BR-DPL-CMN-002` |
| **(W07)** Duyệt + cascade auto-reject trong **1 transaction** (all-or-nothing) | `BR-DPL-APV-004` đề xuất atomic; tránh trạng thái nửa vời khi có 10+ record chờ | **`FEAT` EC-3** (NEED CONFIRMATION → RESOLVED) |
| **(W07)** Hồ sơ garage lưu ở bảng mới `tenant_profile` (tenant-scoped), KHÔNG thêm cột vào `branches` | Dữ liệu là tenant-level; V4 đã cố ý drop cột address/contact khỏi `branches` | **ADR-030** |
| **(W07)** Notification D+ đi thẳng từ `gf-system`, KHÔNG qua `gf-notification` | Audience là tài khoản đối tác ngoài, không phải user GMS | **ADR-029** · CB-SYS-009 |

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
| **Driver Plus (external)** _(W07)_ | Async Kafka `AC-DEV-PARTNER-LINK-EVENTS` | 3 step inbound: `PARTNER_LINK.REQUEST.CREATE` / `.REQUEST.WITHDRAW` / `.UNLINK` — qua adapter validation gate (ADR-029) |
| **`agg-garage-graph`** (BFF cho Web GMS **và** Mobile app) _(W07)_ | REST `/api/v1/system/partner-links*` | 6 endpoint list/detail/approve/reject/resync/cancel (JWT bearer qua BFF). Cùng 1 BFF cho cả 2 platform — không có BFF riêng cho mobile (`EP-PARTNER-LINK` §5.2) |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| Kafka `AC-DEV-BRANCH-LIFECYCLE` | Async **DIRECT** publish | `BranchCreatedEvent` (BRANCH_CREATED.1) |
| Kafka `AC-DEV-TENANT-INVOICE-INFO` | Async **outbox** publish | `TenantInvoiceInfoUpdatedEvent` (TENANT_INVOICE_INFO_UPDATED) |
| Kafka `AC-DEV-TENANT-TRANSPORTER-REGISTRY` | Async **outbox** publish | `TenantTransporterRegistryEvent` (TENANT_TRANSPORTER_REGISTRY_UPSERTED \| TENANT_TRANSPORTER_REGISTRY_DELETED) |
| **Kafka `AC-DEV-PARTNER-LINK-EVENTS`** _(W07)_ | Async **outbox** publish | `PARTNER_LINK.REQUEST.RESPONSE` · `PARTNER_LINK.PROFILE.SYNC` · `PARTNER_LINK.STATUS.CHANGED` — consumer là **Driver Plus (external)** |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_system}` — **9 tables**, Flyway **V1-V8** (V7 `tenant_profile`, V8 `partner_link_request` — W07 DESIGN) |
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
| `tenant_profile` _(W07, DESIGN)_ | V7 | Hồ sơ doanh nghiệp + địa chỉ vận hành garage (5 field AC-11); unique `tenant_id`; seed từ `TenantProvisionedEvent` | **Owned** — SoT (ADR-030) |
| `partner_link_request` _(W07, DESIGN)_ | V8 | Yêu cầu liên kết đối tác `LKD-YYYY-NNN`; 4 state; snapshot `processed_by_label`; giữ vĩnh viễn (`BR-DPL-CMN-006`); partial unique `(tenant_id) WHERE status='LINKED'` | **Owned** — SoT lifecycle liên kết |

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

## 7. Performance & Scale (SaaS multi-tenant)

> Scope: `gf-system` là **platform support service** — không phải hot path giao dịch. Số liệu dưới đây là **propose** (chưa có NFR định lượng trong PRD/EP) — xem Open Questions của wave.

### 7.1. Expected load

| Metric | Target | Source |
|---|---|---|
| QPS peak per tenant — REST partner-link | 5 req/s | Propose — màn "Liên kết" là màn quản trị, mỗi garage có ≤ 1 tài khoản D+ active (`BR-DPL-CMN-002`); không có polling/auto-refresh (`EP-PARTNER-LINK` §7 loại badge realtime) |
| QPS peak toàn service | 100 req/s | Propose — gộp transporter registry + invoice info protected read (`gf-purchase`/`gf-accounting` gọi khi in chứng từ) |
| p95 latency (read) | ≤ 250 ms | `GET /partner-links/{requestCode}` = 3 lookup unique-key; nhất quán §6 "Invoice info REST read p95 ≤ 100ms" |
| p95 latency (write) | ≤ 500 ms | `POST /approve` = 1 update + N cascade update + 1..N insert outbox trong 1 transaction |
| Kafka consume lag p95 — partner-link inbound | ≤ 5 s | Parity `BookingCreateRequest` (`gf-sales-events.md` §2.2 SLA ≤ 5s) |
| Tenant count assumption | 500 tenant active | Propose — cùng giả định dùng cho các boundary khác |
| Số record `partner_link_request` / tenant | < 20 (điển hình), cap phòng vệ 500 | `BR-DPL-LST-004` rationale ("danh sách thường ngắn") |

### 7.2. Pagination strategy

- **Deviation có chủ đích**: `GET /api/v1/system/partner-links` **KHÔNG phân trang, KHÔNG search** — `BR-DPL-LST-004` chốt bỏ cho cả web + mobile, đè default hệ thống `BR-COMMON#SYS-RETRY-004/008/022`. Lý do nghiệp vụ: mỗi garage tối đa 1 tài khoản D+ active nên danh sách luôn ngắn.
- **Guard**: server áp cap **500 row** (`ORDER BY requested_at DESC LIMIT 501`); vượt cap → trả 500 row mới nhất + `truncated=true`. Không im lặng cắt dữ liệu.
- Các list endpoint còn lại của boundary (transporter search) giữ nguyên offset pagination `page`/`size` (`PagedApiResponse<T>`, §1 API) — tổng row per tenant < 10k.

### 7.3. Index list

> **Bắt buộc**: mọi index của bảng tenant-scoped bắt đầu bằng `(tenant_id, ...)`.

| Query pattern | Index | Table | Note |
|---|---|---|---|
| List + filter đa trạng thái + sort ngày gửi DESC | `(tenant_id, status, requested_at DESC)` — `idx_plr_tenant_status_requested` | `partner_link_request` | Cover `GET /partner-links` (`BR-DPL-LST-002/003`) |
| Lookup chi tiết + 4 action theo mã LKD | `(tenant_id, request_code)` UNIQUE — `uk_plr_tenant_request_code` | `partner_link_request` | Cover GET-by-code + dedupe inbound (`FEAT` EC-4) |
| **Invariant single-active-link** | `(tenant_id) WHERE status='LINKED'` UNIQUE partial — `uk_plr_tenant_active_link` | `partner_link_request` | Enforce `BR-DPL-CMN-002` atomic (`FEAT` AC-31) |
| Tra lịch sử re-request theo tài khoản D+ | `(tenant_id, partner_code, partner_account_phone)` — `idx_plr_tenant_partner_account` | `partner_link_request` | `FEAT` AC-25 |
| Đọc hồ sơ garage real-time | `(tenant_id)` UNIQUE — `uk_tenant_profile_tenant_id` | `tenant_profile` | Cover khối "THÔNG TIN ĐỒNG BỘ" (CB-SYS-006) |
| Đọc thông tin xuất HĐ real-time | `(tenant_id)` UNIQUE — `idx_tenant_invoice_info_tenant_id` (đã có) | `tenant_invoice_info` | Không đổi |

### 7.4. Cache strategy

| Cache key | Layer | TTL | Invalidation |
|---|---|---|---|
| **(none)** — khối `garageProfile` + `invoiceInfo` | — | — | **CẤM cache** ở mọi tầng (Redis, in-process, HTTP `Cache-Control`, Apollo `InMemoryCache`) — CB-SYS-006 + `BR-DPL-SYN-002` bắt buộc đọc real-time. FE/BFF dùng `fetchPolicy: no-cache` cho query chi tiết. |
| **(none)** — danh sách yêu cầu liên kết | — | — | Không cache; list ngắn + đọc thưa, cache chỉ thêm rủi ro stale sau 4 action + sau inbound event D+ (UI cập nhật ngầm — `FEAT` AC-33/AC-35). |
| `feature-flag:{tenantId}:PartnerLink:DriverPlus` | Cache client của feature-flag lib (đã có) | theo lib | Không đổi so với baseline |

> Boundary này hiện **không có Redis** (§1 API "Không có Redis cache") — W07 giữ nguyên, không thêm dependency mới.

### 7.5. N+1 avoidance

| Endpoint / query | Pattern | Mitigation |
|---|---|---|
| `GET /partner-links/{requestCode}` | 1 record + 2 khối hồ sơ tenant-scoped | 3 lookup theo unique key trong 1 request, **không** lặp theo row (nested data là object đơn, không phải collection) |
| `GET /partner-links` (list) | Collection | **KHÔNG** embed `garageProfile`/`invoiceInfo` vào từng item — hồ sơ là dữ liệu cấp tenant, giống nhau cho mọi row; FE lấy khi mở chi tiết. Tránh N×2 query vô nghĩa |
| Cascade auto-reject khi Duyệt | N record `PENDING` | 1 câu `UPDATE ... WHERE tenant_id=? AND status='PENDING' AND request_code<>?` (bulk), **không** loop per-record. Outbox insert dùng batch trong cùng transaction |
| Consumer inbound D+ | 1 message = 1 record | Lookup theo `uk_plr_tenant_request_code`; không fan-out |

### 7.6. Tenant fairness / rate limit

- **Rate limit REST**: 20 req/s per tenant trên nhóm `/api/v1/system/partner-links*` (đủ rộng cho thao tác thủ công, chặn loop FE lỗi). Vượt → `429`.
- **Kafka consumer bulkhead**: consumer group partner-link chạy concurrency cố định (đề xuất 3 thread), partition key `PartnerLink-{requestCode}` phân tán theo aggregate — 1 tenant spam request không chiếm trọn partition của tenant khác. Message lỗi nghiệp vụ (sai state) → ack + log warning, **không** retry vô hạn (`FEAT` AC-33/AC-35 nhánh 2).
- **Outbox**: giữ nguyên `FOR UPDATE SKIP LOCKED` + batch 10 + poll 60s — multi-replica safe (§6). Partner-link thêm ≤ 5 event/lần Duyệt nên không đổi sizing.
- **Circuit breaker**: không có downstream REST đồng bộ cho luồng partner-link (Kafka-driven) → không cần breaker mới.

## 8. Forbidden Actions

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
- ❌ **(W07)** Expose endpoint cho garage tự tạo `partner_link_request` (`BR-DPL-CMN-001` — record chỉ sinh từ inbound Kafka Driver Plus).
- ❌ **(W07)** Cache hoặc snapshot khối "THÔNG TIN ĐỒNG BỘ SANG DRIVER PLUS" (CB-SYS-006 + `BR-DPL-SYN-002` — đọc real-time mọi lần).
- ❌ **(W07)** Chạy cascade auto-reject ở transaction riêng sau khi commit Duyệt (`BR-DPL-APV-004` + `FEAT` EC-3 — phải all-or-nothing).
- ❌ **(W07)** Ghi `processed_by_label` bằng FK/reference động vào bảng nhân viên (`BR-DPL-CMN-005` + `FEAT` AC-30 — snapshot text bất biến).
- ❌ **(W07)** Hard-delete / archive record `REJECTED`/`UNLINKED` (`BR-DPL-CMN-006` — giữ vĩnh viễn trong DB active).
- ❌ **(W07)** Route notification Driver Plus qua `gf-notification` (ADR-029 — audience ngoài GMS).
- ❌ **(W07)** Rollback state cục bộ khi outbound push/notification sang Driver Plus thất bại (`FEAT` AC-32 — outbox retry độc lập).
- ❌ **(W07)** Xử lý message `AC-DEV-PARTNER-LINK-EVENTS` không filter `MessageGroup` + `MessageStep` (Critical Rule #18 — topic dùng chung inbound/outbound).
- ❌ Index bảng tenant-scoped không có prefix `(tenant_id, ...)` — cross-tenant data leak.

---

## 9. References

- **TECHSTACK**: §platform-service, §outbox-pattern, §feature-flag, §kafka
- **API spec**: [gf-system-api.md](../api/gf-system-api.md) — 14 endpoints: 6 transporter CRUD/search + 2 invoice info GET/PUT + **6 partner-link (§3bis, W07)**; **§5 Naming Registry**
- **Events spec**: [gf-system-events.md](../events/gf-system-events.md) — tenant provisioning + branch lifecycle boundary; bao gồm `TenantInvoiceInfoUpdatedEvent` (§3.7), `TenantTransporterRegistryEvent` (§3.8) và **Partner Link W07 (§3.11–§3.14)**.
- **ADR (W07)**: [ADR-029](../decisions/ADR-029-driver-plus-kafka-adapter-on-gf-system.md) giao thức Driver Plus · [ADR-030](../decisions/ADR-030-tenant-profile-sot-on-gf-system.md) tenant profile SoT
- **Integration (W07)**: [INTEG-EXT-driver-plus.md](../integrations/INTEG-EXT-driver-plus.md)
- **Product (W07)**: `EP-PARTNER-LINK` · `FEAT-SYS-DRIVERPLUS-LINK` · `BR-GF-SYSTEM.md` §1 CB-SYS-004..009 + §2.5 BR-DPL-* + §3.2 + §4.2 + §5.5 · `UX-FLOW-PARTNER-LINK` · `ERROR-CODE-REGISTRY.md` §5
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
| 2026-08-10 | v4.2 | Đồng bộ semantic kill-switch `PartnerLink:DriverPlus` theo FEAT AC-43/BR-DPL-CMN-008: off chặn REST/action, từ chối request tạo mới bằng `ERR-DPL-011`, ngừng outbound profile/status, giữ dữ liệu/audit và ẩn UI client. |
| 2026-08-07 | v4.1 | **ARCH-REVIEW-W07 P2 fix** — cite `gf-system-events.md §3.10–§3.13` → **§3.11–§3.14** (§9 References), theo renumber gf-system-events.md v5 (§3.10 collision baseline `Employee*Changed` vs W07 `PartnerLink*`). |
| 2026-08-05 | v4 | **W07 EP-PARTNER-LINK (DESIGN)** — §1 thêm khối trách nhiệm "Partner Link — Driver Plus" (adapter Kafka tự-own 3 step inbound + 3 step outbound, 6 REST endpoint, invariant DB-level, own `tenant_profile`) + note mã `LKD` KHÔNG dùng `sequences`. §2 C4 L3 redraw (thêm `PartnerLinkCtrl` + `PartnerLinkDriverPlusConsumer` + `PartnerLinkService`/`TenantProfileService`, 7→9 tables, V1-V6→V1-V8, thêm topic PARTNER-LINK ở footer P/C). §3 +6 Key Design Decision (ADR-029 adapter tự-own · correlated response event · partial unique index cho `BR-DPL-CMN-002` — **RESOLVE `FEAT` AC-31** · cascade 1 transaction — **RESOLVE `FEAT` EC-3** · ADR-030 `tenant_profile` · noti đi thẳng không qua `gf-notification`). §4.1 +2 inbound caller (Driver Plus Kafka, `agg-garage-graph` REST cho cả web+mobile); §4.2 +1 outbound topic + cập nhật DB 9 tables/V1-V8. §5 +2 bảng owned. **§7 Performance & Scale (mới, 6/6 item)** — expected load, no-pagination deviation có guard cap 500, index list toàn bộ tenant-prefix, cache **CẤM** cho khối đồng bộ (CB-SYS-006), N+1 avoidance, tenant fairness. §7 Forbidden cũ renumber → **§8** (+9 rule W07); §8 References cũ → **§9** (+ADR-029/030, INTEG-EXT-driver-plus, Product W07). Frontmatter `depends_on` +2 ADR. **KHÔNG đụng**: §6 Quality Attributes baseline, các Key Design Decision cũ, §5 các bảng baseline. v3 → v4. |
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (REST Controllers + Kafka Consumers → TenantSubscriptions/Branch/InvoiceInfo/TransporterRegistry services + EventPublisher → JPA/Flyway/Kafka outbox) + connector `┬`/`▼`; **không external REST downstream** (Kafka-driven) → chỉ Kafka P (BRANCH-LIFECYCLE direct + invoice/transporter outbox) / C (3 topics) ở footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2.3 | Align HLD với KG v2 + v2 HLD pattern: (GAP-1) thêm Java 21/SB 3.5.0 vào Overview + diagram + §6 QA Runtime; (GAP-2) thêm Business rules line BR-GF-SYSTEM-001..014 vào §8; (GAP-3) thêm BR citations cho 12/13 forbidden actions; (GAP-4) sửa Inbound caller "Garage Web" → `agg-garage-graph`; (GAP-5) cập nhật KG synced date 2026-05-14. |
| 2026-05-12 | v2.2 | Fix §8 References: bổ sung 2 events mới §3.7/§3.8 đã có từ v2. |
| 2026-05-07 | v1 | Initial HLD: Kafka consumer/publisher + outbox + PostgreSQL (4 tables); consume TenantProvisionedEvent → tạo branch → publish BranchCreatedEvent (DIRECT). |
| 2026-05-12 | v2.1 | Fix MessageStep names transporter registry (command + event); làm rõ messagingTaskExecutor từ common messaging library. |
| 2026-05-12 | v2 | Update lên V6: thêm 2 REST controllers, 2 Kafka command consumers (inbox idempotency), 3 bảng mới, đổi tên tenant_subscriptions_cache→tenant_subscriptions; outbox cho 2 topic mới; xóa BranchActivatedEvent. |
