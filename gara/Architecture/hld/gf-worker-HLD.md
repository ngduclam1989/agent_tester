---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-worker
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-worker-api.md
  - ../data/gf-worker-data-model.md
---

# HLD — `gf-worker`

## 1. Overview

`gf-worker` là **generic worker** vận hành scheduled HTTP job dựa trên cấu hình DB-driven. Thay vì hard-code từng task, service lưu job config trong bảng `job_config` và tự schedule runtime qua custom **virtual-thread scheduler** với cron expression. Mỗi execution build URL/headers/method từ config, gọi target service HTTP, retry theo `retryCount`, và ghi lịch sử vào `schedule_history`. Migration seed các job nền tảng gọi `gf-erp-agent` (4 batch job), `gf-policy-agent` (1 job, đã disable), `gf-sales` (1 booking auto-cancel).

**Trách nhiệm:**
- Job registry: lưu `job_config` (cron, baseUrl, endpointPath, httpMethod, requestHeaders, contentType, retryCount, timeout, isActive).
- Dynamic scheduling: `DynamicJobProcessor` load active jobs khi startup + sync DB mỗi 30s; add/remove schedule khi DB thay đổi.
- Generic HTTP execution: `GenericHttpClientFactory` resolve `${...}` placeholder từ Spring Environment, mask sensitive header (`key`, `token`, `auth`), build `RestClient` request.
- 2-layer retry: service-level loop theo `retryCount` (ghi `currentRetry` vào history) + Resilience4j retry trong từng attempt cho 503/connection/socket timeout.
- Execution history: track `OPEN` → `PROCESSING` → `PROCESSED`/`ERROR` với response status/body (truncate 5000) + error message (truncate 2000).
- 9 admin endpoint `/protected/v1/jobs/*` cho operator: CRUD + reload + enable/disable (single + emergency-all).
- Custom Flyway runner: `spring.flyway.enabled=false` nhưng `FlywayConfig` migrate trên `ApplicationReadyEvent`.

**Owned epic**: cross-cutting platform — generic worker phục vụ scheduled task xuyên service. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌── gf-worker  (Java 21 · DB-driven HTTP scheduler · 1 replica) ──┐
│  ┌──────────────────────────────────────────────────┐           │
│  │ JobConfigController /protected/v1/jobs (9 admin   │          │
│  │  ep: CRUD·reload·enable/disable·emergency)        │          │
│  └─────────────────────┬────────────────────────────┘           │
│  ┌─────────────────────▼────────────────────────────┐           │
│  │ APP / DOMAIN SERVICES                            │           │
│  │  JobConfigServiceImpl (CRUD + sync)·             │           │
│  │  DynamicJobProcessor (startup load · 30s sync ·  │           │
│  │   per-job virtual-thread · Semaphore 50)·        │           │
│  │  VirtualThreadTaskScheduler (CronTrigger ·       │           │
│  │   Asia/Ho_Chi_Minh · pool 5)·                    │           │
│  │  GenericHttpJobExecutor (re-read · retry loop)·  │           │
│  │  GenericHttpClientFactory (${...} resolve · mask)│           │
│  │  BookingAutoCancelScheduler                      │           │
│  └─────────────────────┬────────────────────────────┘           │
│  ┌─────────────────────▼─────┐ ┌──────────────────┐             │
│  │ JPA [dev_gf_worker]       │ │ HttpClients +    │             │
│  │  custom Flyway runner     │ │ Resilience4j     │─────────────┼─► gf-erp-agent (4 batch · cron 10/15s)
│  │  (ApplicationReadyEvent)  │ │ (CB·Retry·       │─────────────┼─► gf-sales (booking auto-cancel 60s)
│  │  job_config·schedule_hist │ │  Bulkhead 100)   │─────────────┼─► gf-policy-agent (1, disabled V1.0.3)
│  └─────────────────────┬─────┘ └──────────────────┘             │
│  GLOBAL platform-scoped (NO tenant_id) │ Actuator+OTLP          │
│    [NO Kafka · NO outbox · target via DB config]                │
└──────────────────────┴──────────────────────────────────────────┘
                        ▼
   PostgreSQL [dev_gf_worker]: job_config, schedule_history
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| DB-driven scheduling thay vì build-time config | Operator có thể thay đổi job/cron/target mà không redeploy | open HLD-WORKER-003 (allow-list base_url) |
| Per-job dedicated virtual-thread executor + semaphore | Tách isolation per job + giới hạn concurrency tổng (50) | TECHSTACK §virtual-thread |
| 2-layer retry (service-level loop + Resilience4j per attempt) | Service-level theo `retryCount` config; Resilience4j cho transient infra error | source `executeWithRetry` + `ResilienceConfig` |
| Circuit breaker chỉ cho infra error (503/connection/timeout) | 4xx/500/502 không trigger CB — vì là logic error của target | source `ResilienceConfig` config |
| Custom Flyway runner thay vì Spring auto-config | Migrate sau `ApplicationReadyEvent` để JPA tạo bảng trước, sau đó seed | open HLD-WORKER-002 (cần chốt strategy) |
| `JobConfigEntity` dùng trực tiếp làm DTO API | Đơn giản; expose runtime contract | open HLD-WORKER-007 (audit/internal field leak) |
| Placeholder `${...}` resolve từ Spring Environment | Inject `INTERNAL_API_KEY`, target URL lúc runtime — không lưu raw secret | open HLD-WORKER-004 (cần policy mask) |
| `ddl-auto=update` cho schema | Migration không tạo bảng, JPA tạo từ entity | open HLD-WORKER-001 (baseline DDL) |
| KHÔNG có distributed lock | Single-replica deployment hiện tại — open HLD-WORKER-006 nếu scale | source review |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| Operator / internal admin | Sync REST `/protected/v1/jobs/*` | CRUD job, reload, enable/disable, emergency controls |

> KHÔNG có public API. KHÔNG consume Kafka. Inbound duy nhất là admin REST.

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-erp-agent` | Sync REST + x-api-key | 4 batch jobs (inbound/outbound + 2 notification batches) — cron 10s/15s |
| `gf-policy-agent` | Sync REST | Batch policy inbound (⚠️ disabled trong V1.0.3) |
| `gf-sales` | Sync REST + x-api-key | Booking auto-cancel — cron 1 phút |
| Target service mở rộng | Sync REST | Bất kỳ HTTP endpoint qua `job_config.base_url` + placeholder env |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_worker}` — 2 tables |
| Spring Environment | In-process | Resolve `${...}` placeholder trong baseUrl/headers |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

> **KHÔNG có Kafka publisher / consumer / outbox** — service hoàn toàn HTTP-based.

## 5. Data Ownership

**Owned (PostgreSQL `dev_gf_worker` schema)** — chi tiết physical schema xem [data/gf-worker-data-model.md](../data/gf-worker-data-model.md):

| Table | Vai trò | Tenant |
|---|---|---|
| `job_config` | Cấu hình scheduled HTTP job: `jobName` (unique), `cronExpression`, `isActive`, `retryCount`, `timeoutSeconds`, `baseUrl`, `httpMethod`, `endpointPath`, `requestHeaders` (JSON), `contentType`, `targetService` | Không (platform-scoped) |
| `schedule_history` | Lịch sử execution: `jobName`, `status` (`OPEN`/`PROCESSING`/`PROCESSED`/`ERROR`), `currentRetry`, `request`, `responseStatus`, `responseBody` (truncate 5000), `errorMessage` (truncate 2000), `targetService` | Không (platform-scoped) |

**Seed jobs (V1.0.1..V1.0.4 migration)**:

| Job | Cron | Active | Retry | Timeout | Target |
|---|---|---|---|---|---|
| `BATCH_INBOUND` | `0/10 * * ? * *` | ✅ | 1 | 300s | `gf-erp-agent` /protected/v1/batch/inbound |
| `BATCH_OUTBOUND` | `5/10 * * ? * *` | ✅ | 1 | 300s | `gf-erp-agent` /protected/v1/batch/outbound |
| `BATCH_INBOUND_NOTIFICATION` | `0/15 * * ? * *` | ✅ | 1 | 300s | `gf-erp-agent` /protected/v1/batch/inbound-notification |
| `BATCH_OUTBOUND_NOTIFICATION` | `5/15 * * ? * *` | ✅ | 1 | 300s | `gf-erp-agent` /protected/v1/batch/outbound-notification |
| `BATCH_INBOUND_POLICY` | `0 0/1 * ? * *` | ❌ (V1.0.3 disable) | 2 | 300s | `gf-policy-agent` |
| `GF_SALES_BOOKING_AUTO_CANCEL` | `0 0/1 * ? * *` | ✅ | 1 | 20s | `gf-sales` /protected/v1/bookings/auto-cancel |

**State machine** (`JobStatus`):

```
OPEN ──► PROCESSING ──success──► PROCESSED
            │
            └──fail (loop retryCount)──► PROCESSING (retry+1)
                                              │
                                              └──exhausted──► ERROR
```

**KHÔNG own**:
- Target service business state (mỗi target boundary SoT)
- Tenant data (service là platform/operator scoped)
- Job execution result content (chỉ snapshot response trong history — caller xử lý ý nghĩa)
- Distributed lock state (chưa có — open HLD-WORKER-006)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Schedule sync interval | **30s** (`SCHEDULE_CHECK_INTERVAL=30000`) |
| Schedule cron timezone | `Asia/Ho_Chi_Minh` |
| Job concurrency limit | **50** (`JOB_MAX_CONCURRENT=50`) — semaphore tryAcquire |
| Virtual thread pool | **50** (`MAX_VIRTUAL_THREADS=50`) reusable |
| Scheduler thread pool | **5** (`SCHEDULER_POOL_SIZE=5`) |
| HTTP pool | **500 total / 100 per route** (Apache HttpClient) |
| HTTP connect timeout | **5s** (`HTTP_CONNECT_TIMEOUT=5000`) |
| HTTP read timeout | per-job `timeout_seconds` (vd batch 300s, booking 20s) |
| Service-level retry | per-job `retry_count`; sleep 1000ms × currentRetry giữa attempts |
| Resilience4j retry | max 3 attempts, wait 500ms × 1.5 exponential |
| Circuit breaker | failure threshold 70%, slow call 80% (>10s), window 20 |
| Bulkhead | 100 concurrent calls, 1000ms max wait |
| Response body truncate | 5000 ký tự |
| Error message truncate | 2000 ký tự |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Error status fallback | 500 |
| Multi-replica | ⚠️ KHÔNG có distributed lock — chỉ chạy 1 replica (open HLD-WORKER-006) |
| Schema migration | ⚠️ Custom Flyway runner trên `ApplicationReadyEvent` + JPA `ddl-auto=update` (open HLD-WORKER-001/002) |

## 7. Forbidden Actions

- ❌ Deploy multi-replica `gf-worker` mà không có distributed lock (open HLD-WORKER-006 — nhiều instance đọc cùng `job_config` sẽ chạy duplicate cron; phải single replica hoặc bổ sung leader election).
- ❌ Lưu raw secret (API key, token, password) trực tiếp trong `request_headers` JSON (open HLD-WORKER-004 — chỉ dùng placeholder `${internal-service.api-key}` để Environment inject runtime).
- ❌ Cấu hình `base_url` trỏ ngoài allow-list (open HLD-WORKER-003 — operator có thể tạo job gọi endpoint bất kỳ; cần allow-list config hoặc audit gắt).
- ❌ Expose `JobConfigEntity` cho role không phải operator/admin (open HLD-WORKER-007 — entity chứa audit + internal field; có thể leak target URL/header config).
- ❌ Hard-delete `schedule_history` (audit invariant — phải có retention/cleanup job; open HLD-WORKER-005 với job high-frequency 10s sinh nhiều record).
- ❌ Bật `ddl-auto=update` ở production mà không baseline DDL chính thức (open HLD-WORKER-001/002 — schema drift; phải chốt strategy custom Flyway runner vs Boot autoconfig).
- ❌ Giảm `retry_count = 0` cho high-frequency job (vd `BATCH_INBOUND` cron 10s) mà không kiểm tra impact downstream (V1.0.4 migration chốt retry=1 cho fail-fast — chỉnh phải có MR review).
- ❌ Trigger circuit breaker thủ công cho 4xx/500/502 (chỉ trigger khi infra error: 503, ConnectException, SocketTimeoutException, TimeoutException — phá design intent).
- ❌ Public expose `/protected/v1/jobs/emergency/*` endpoint (blast radius lớn — phải gateway/security filter chặn + audit log).
- ❌ Tạo job với `target_service` không có config URL trong env (placeholder resolve fail → request gửi raw `${...}` literal; phải validate ở `JobConfigService.create`).
- ❌ Add tenant scoping vào `job_config` mà không update mọi caller + admin UI (boundary hiện platform-only — tenant-aware cần ADR riêng).

## 8. References

- **TECHSTACK**: §virtual-thread, §scheduler, §resilience4j, §http-client
- **API spec**: [gf-worker-api.md](../api/gf-worker-api.md) — 9 admin endpoints `/protected/v1/jobs/*`, `JobConfigEntity` schema (15+ fields).
- **Events spec**: ⚠️ **không có** — service không publish/consume Kafka. Surface duy nhất là HTTP outbound qua `RestClient` tới target service.
- **Workflows**:
  - [generic-worker-jobs-flow.md](../workflows/generic-worker-jobs-flow.md) — full flow: startup load + 30s sync + cron trigger + 2-layer retry + history lifecycle.
- **Data model**: [gf-worker-data-model.md](../data/gf-worker-data-model.md) — 2 tables, 4 Flyway migration V1.0.1..V1.0.4 seed 6 platform jobs, enum `JobStatus`.
- **Cross-link HLD**:
  - [gf-erp-agent-HLD.md](gf-erp-agent-HLD.md) — primary target (4 batch jobs, ~80% scheduler load)
  - [gf-sales-HLD.md](gf-sales-HLD.md) — booking auto-cancel target (60s cron)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered HTTP-only (JobConfigController → JobConfigService/DynamicJobProcessor/VirtualThreadTaskScheduler/GenericHttpJobExecutor/HttpClientFactory/BookingAutoCancel → JPA custom-Flyway-runner + HttpClients+Resilience4j) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-erp-agent·gf-sales·gf-policy-agent; NO Kafka/outbox, global no-tenant. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes. Note: HLD schedule sync interval 30s (SCHEDULE_CHECK_INTERVAL=30000) đã đúng — KG v3 BR-001 ghi 60s là sai (lấy nhầm @Scheduled annotation default thay vì application.yml property value). |
| 2026-05-07 | v1 | Initial HLD cho `gf-worker`: generic worker DB-driven scheduled HTTP job — 2 tables (`job_config` lưu cron/baseUrl/endpointPath/httpMethod/requestHeaders/retryCount/timeout/isActive, `schedule_history` `OPEN`→`PROCESSING`→`PROCESSED`/`ERROR` với truncate response 5000 + error 2000), `DynamicJobProcessor` startup load + 30s sync DB, custom virtual-thread scheduler (`VirtualThreadTaskScheduler` cron timezone Asia/Ho_Chi_Minh, scheduler-pool 5, semaphore 50, MAX_VIRTUAL_THREADS 50), `GenericHttpClientFactory` resolve `${...}` placeholder từ Spring Environment + mask key/token/auth, 2-layer retry (service-level loop + Resilience4j: CircuitBreaker failure 70%/slow 80%/window 20, Retry max 3 wait 500ms × 1.5, Bulkhead 100), Apache HttpClient pool 500 total/100 per route, 9 admin endpoint `/protected/v1/jobs/*` (CRUD + reload + enable/disable + emergency × 2). Custom Flyway runner trên `ApplicationReadyEvent` seed 6 platform jobs (V1.0.1..V1.0.4): 4 batch `gf-erp-agent` (cron 10s/15s) + 1 disabled policy + 1 `gf-sales` booking auto-cancel 60s. KHÔNG có Kafka/outbox, KHÔNG có distributed lock — single-replica deployment. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `workflows/`, `data/`. |
