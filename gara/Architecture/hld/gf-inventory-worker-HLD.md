---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory-worker
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-inventory-worker-api.md
  - ../hld/gf-inventory-HLD.md
---

# HLD — `gf-inventory-worker`

## 1. Overview

`gf-inventory-worker` là service T1 phụ trách **orchestration bất đồng bộ** cho domain kho. Service tuân theo mẫu **Fat API / Thin Worker**: business state và mutation nằm ở `gf-inventory`, worker chỉ điều phối Temporal workflow, retry, timeout, signal và lịch chạy. Worker nhận Kafka event từ purchase order/service order, expose protected operator + reservation APIs, và gọi `gf-inventory` protected APIs (24 endpoints) qua `InventoryClient` cho mọi business mutation. **KHÔNG có entity / repository / migration** — service stateless ngoài Temporal workflow history.

**Trách nhiệm:**
- Reservation expiry: `ReservationExpiryWorkflow` chờ TTL hoặc signal release/fulfill, expire qua `gf-inventory` khi timeout.
- Receipt fulfillment: PO `DELIVERED.2` → `ReceiptFulfillmentWorkflow` tạo pending receipt, chờ complete/cancel signal hoặc timeout 72h.
- Delivery fulfillment: SO ready/delivered → `DeliveryFulfillmentWorkflow` tạo delivery, complete/cancel qua signal hoặc timeout 24h.
- Period closure coordinator: tính period cần đóng (input null → tháng trước), init history, page pending warehouses, spawn child batch workflows theo semaphore concurrency.
- Warehouse batch closure: `WarehouseBatchWorkflow` atomic close + create next period + saga rollback + update delivery cost price (non-blocking).
- Retry batch closure: cron 5 phút, lấy `PENDING_RETRY` warehouses, start `RetryBatchWorkflow`, tăng retry count.
- Operator API: 7 endpoints `/protected/v2/period-closure/operator/*` (trigger/status/result/stats/cancel/mark-retry × 2).
- Idempotency: deterministic workflow ID + idempotency key cho period closure.

**Owned epic**: cross-cutting orchestration — Temporal workflow layer cho `gf-inventory`. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌────── gf-inventory-worker  (Java 21 · Temporal · stateless) ──────┐
│  ┌──────────────────┐ ┌──────────────────┐ ┌────────────┐         │
│  │ReservationWorker │ │PeriodClosure     │ │ Kafka      │         │
│  │Ctrl (3 ep)       │ │OperatorCtrl(7 ep)│ │ Listeners  │         │
│  │/protected/       │ │/protected/v2/    │ │ PurchaseOr-│         │
│  │workflows/...     │ │period-closure/op │ │ derEvent · │         │
│  └────────┬─────────┘ └────────┬─────────┘ │ ServiceOr- │         │
│           │                    │           │ derEvent   │         │
│           │                    │           └─────┬──────┘         │
│  ┌────────▼────────────────────▼─────────────────▼──────┐         │
│  │ Temporal WorkflowClient + ScheduleClient             │─────────┼─► Temporal Cloud  gf-inventory-worker
│  │  queue: gf-inventory-worker                          │         │
│  │  schedule: period-stock-closure-scheduler 0 0 1 * *  │─────────┼─► (cron 1st/month)
│  │  PeriodClosureRetryCronJob (every 5 min)             │         │
│  │  6 workflows: ReservationExpiry·ReceiptFulfillment·  │         │
│  │   DeliveryFulfillment·PeriodClosureCoordinator·      │         │
│  │   WarehouseBatch·RetryBatch  (+5 activities)         │         │
│  │  feature flag INVENTORY_STOCK gate (PO + retry cron) │         │
│  └──────────────────────┬───────────────────────────────┘         │
│  ┌──────────────────────▼─────────────────────────────┐           │
│  │ InventoryClient (HTTP · X-API-Key · R4j · 24 ep)    │──────────┼─► gf-inventory  (24 protected ep)
│  └────────────────────────────────────────────────────┘           │
│  /protected/v1/* (operator) │ Actuator + OTLP                     │
│       [Stateless — NO DB · NO repository · NO migration]          │
└───────────────────────────────────────────────────────────────────┘
   Kafka C: purchase-order-events (PO DELIVERED.2) ·
            service-order-events (SO READY/DELIVERED)  · NO publish
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Fat API / Thin Worker pattern | Business state + mutation tập trung ở `gf-inventory`; worker chỉ orchestrate | TECHSTACK §worker-pattern |
| 0 JPA entity / repository / migration | Worker stateless ngoài Temporal — đảm bảo không drift state với `gf-inventory` | source `git rev-list --count` confirm |
| Deterministic workflow ID | `{prefix}-{tenantId}-{businessCode}` chống start trùng cùng PO/SO/reservation | source workflow ID patterns |
| Idempotency key cho period closure | `closure-{periodCode}-{tenantId}-{warehouseCode}-{workflowId}` cho atomic close | source `atomicCloseWarehouse` |
| Saga compensation cho period closure | Atomic close fail → rollback closure + delivery cost (non-blocking) | open HLD-INV-WORKER-002 (rollback semantics) |
| Manual Kafka ack | Lỗi xử lý không ack → Kafka retry; success/skip thì ack | source listener |
| Feature flag `INVENTORY_STOCK` gate Kafka + retry cron | Cho phép disable workflow khi rollout từng tenant | source `FeatureFlagHelper` |
| Receipt signal complete/cancel KHÔNG gọi activity | Caller gọi protected API trực tiếp; signal chỉ đóng workflow | open HLD-INV-WORKER-006 (semantic mismatch với delivery) |
| Reservation release signal KHÔNG gọi activity | API release `gf-inventory` đã thực hiện trước; signal chỉ kết thúc workflow | open HLD-INV-WORKER-007 (cần verify gf-inventory state) |
| KHÔNG có distributed lock cho retry cron | Comment ghi "Distributed lock removed"; multi-replica risk | open HLD-INV-WORKER-003 (high) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `gf-inventory` | Sync REST `/protected/workflows/reservation-expiry/*` (X-API-Key) | Start reservation expiry workflow + signal release/fulfill |
| Internal operator / scheduler | Sync REST `/protected/v2/period-closure/operator/*` (X-API-Key) | Manual trigger/status/result/stats/cancel/mark-retry |
| `gf-purchase` (qua Kafka) | Async consume `purchase-order-events` | PO `DELIVERED.2` → start receipt workflow |
| `gf-sales` (qua Kafka) | Async consume `service-order-events` | SO `READY`/`DELIVERED` → start delivery workflow |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-inventory` | Sync REST + X-API-Key | 24 protected endpoints (receipts × 4, deliveries × 4, reservations × 2, period-closure × 13, internal × 1) |
| Temporal cluster | Workflow protocol | Workflow execution + signal + query + schedule |
| Kafka | Async consume (manual ack) | 2 topics: PO + SO events |
| Feature flag provider | Cache + Sync | `INVENTORY_STOCK` flag check |
| Actuator + Micrometer Prometheus + OTLP | Observability | Health/metrics + tracing |

> **KHÔNG có inbound Kafka publisher / DB / outbox** — service hoàn toàn stateless ngoài Temporal.

## 5. Data Ownership

**Stateless** — KHÔNG own database, KHÔNG có local persistence, KHÔNG có JPA entity/repository/migration.

| State | Nơi lưu | Owner |
|---|---|---|
| Workflow state, signal, retry history | Temporal cluster | `gf-inventory-worker` runtime |
| Receipt/delivery/reservation/stock/period data | PostgreSQL của `gf-inventory` | `gf-inventory` (SoT) |
| Closure history/retry count/idempotency | PostgreSQL của `gf-inventory` | `gf-inventory` (SoT) |
| Kafka offsets | Kafka consumer group | Kafka runtime |
| Feature flag state | env/local provider | Platform config |
| Workflow ID + idempotency key | derived (deterministic) | runtime |

**Workflow ID patterns** (idempotency boundary):

| Workflow | Pattern |
|---|---|
| Reservation expiry | `reservation-expiry-{tenantId}-{deliveryCode}` |
| Receipt fulfillment | `receipt-fulfillment-{tenantId}-{purchaseOrderCode}` |
| Delivery fulfillment | `delivery-fulfillment-{tenantId}-{serviceOrderCode}` |
| Period closure coordinator | `period-stock-closure-{periodCode}-{timestamp}` |
| Warehouse batch child | `period-stock-closure-{periodCode}-{timestamp}-{batchId}` |
| Retry batch | `period-stock-closure-retry-{periodCode}-{timestamp}` |
| Period closure idempotency key | `closure-{periodCode}-{tenantId}-{warehouseCode}-{workflowId}` |

**KHÔNG own**:
- Stock / receipt / delivery / reservation / period stock durable state (`gf-inventory` SoT)
- Purchase order lifecycle (`gf-purchase` SoT)
- Service order lifecycle (`gf-sales` SoT)
- Tenant / user authority (`ct-saas-tenant` + security platform)
- Notification rendering / delivery (`gf-notification`)
- Business validation chi tiết (`gf-inventory`)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Receipt fulfillment timeout | **4320 phút (72h)** (`RECEIPT_TIMEOUT_MINUTES=4320`); workflow execution timeout = timeout + 30 phút buffer |
| Delivery fulfillment timeout | **24h** (`DELIVERY_TIMEOUT_HOURS=24`); workflow execution timeout = timeout + 1 giờ |
| Reservation TTL | configurable per request (`ttlMinutes` trong `StartReservationExpiryRequest`) |
| Period closure schedule | cron `0 0 1 * *` (1st của tháng 00:00 timezone Asia/Ho_Chi_Minh) |
| Period closure max concurrent | **2** child batch workflows (`PERIOD_CLOSURE_MAX_CONCURRENT=2`) |
| Period closure batch size | **15** warehouses/batch (`PERIOD_CLOSURE_BATCH_SIZE=15`) |
| Retry cron | every **5 phút** (`PERIOD_CLOSURE_RETRY_CRON=0 */5 * * * *`) |
| Retry max batch | **10** warehouses/poll (`PERIOD_CLOSURE_MAX_RETRY_BATCH=10`) |
| Max retry attempts | **5** (`PERIOD_CLOSURE_MAX_RETRY_ATTEMPTS=5`) |
| Activity retry policy | reservation 3 attempts, receipt 10 attempts, delivery/period closure theo từng workflow |
| Kafka consumer concurrency | 3 |
| Workflow ID idempotency | deterministic — duplicate event → workflow already started exception |
| Multi-replica | ✅ workflow execution (Temporal handle); ⚠️ **KHÔNG** an toàn cho retry cron (open HLD-INV-WORKER-003) |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Auto-complete receipt timeout | **disabled** — chuyển trạng thái `SKIPPED_INVALID_STATUS` |
| Schema migration | KHÔNG có (Fat API/Thin Worker) |

## 7. Forbidden Actions

- ❌ Thêm JPA entity / repository / migration vào worker (vi phạm Fat API/Thin Worker — phá nguyên tắc state-less; cần ADR riêng nếu thực sự cần local state).
- ❌ Activity ghi DB trực tiếp bypass `InventoryClient` (mọi business mutation phải đi qua `gf-inventory` protected API; vi phạm boundary `gf-inventory` SoT).
- ❌ Deploy multi-replica `gf-inventory-worker` mà không có distributed lock cho retry cron (open HLD-INV-WORKER-003 — multiple instance trigger duplicate retry workflow; phải single replica hoặc leader election).
- ❌ Sử dụng workflow ID không deterministic (event replay → duplicate workflow start → state corrupt; phải `{prefix}-{tenantId}-{businessCode}`).
- ❌ Skip feature flag `INVENTORY_STOCK` check trong PO listener + retry cron (rollout policy phá; tenant chưa enable sẽ chạy workflow không mong muốn). ⚠️ **SO listener (ServiceOrderEventListener) hiện KHÔNG có feature flag check** — delivery workflow start bất kể flag state (open HLD-INV-WORKER-010).
- ❌ Skip `MessageGroup` + `MessageStep` filter trong Kafka listener (workflow start cho event sai stage → orphan workflow / wrong-status mutation).
- ❌ Skip Kafka manual ack pattern (auto-commit → message lost on failure; phải manual ack chỉ khi success/intentional skip).
- ❌ Reservation release signal coi như no-op mà không verify `gf-inventory` đã release reservation (open HLD-INV-WORKER-007 — nếu caller chỉ signal mà chưa release API, stock không được giải phóng).
- ❌ Public expose `/protected/v2/period-closure/operator/*` (privileged operations: trigger/cancel/mark-retry có blast radius lớn — phải gateway/network policy chặn).
- ❌ Operator controller return `null` trong catch block (open HLD-INV-WORKER-001 — phải `ApiResponse.error(...)` với HTTP status chuẩn).
- ❌ Log raw PO/SO event payload chứa financial fields, SKU/genuine code, tenant ID (open HLD-INV-WORKER-009 — masking layer cần thiết).
- ❌ Auto-complete receipt khi timeout (current source disabled → `SKIPPED_INVALID_STATUS`; bật lại phải có ADR vì có thể tạo receipt sai).
- ❌ Bật period closure cho tenant chưa init `gf-inventory` migration period_stock (race với concurrent stock movement → data corrupt).

## 8. References

- **TECHSTACK**: §worker-pattern, §temporal, §kafka, §http-client
- **API spec**: [gf-inventory-worker-api.md](../api/gf-inventory-worker-api.md) — Reservation 3 endpoints, Period closure operator 7 endpoints, `InventoryClient` 24-endpoint downstream contract.
- **Events spec**: ⚠️ **không có file riêng** — service consume Kafka từ `gf-purchase` + `gf-sales` (xem `events/purchase-events.md`, `events/sales-events.md`); KHÔNG publish event. Nếu cần workflow lifecycle event → cần thiết kế contract riêng.
- **Workflows**:
  - [generic-worker-jobs-flow.md](../workflows/generic-worker-jobs-flow.md) — workflow + listener + retry cron flow.
- **Data model**: ⚠️ **không có** — Fat API/Thin Worker, không own DB. State business xem [data/gf-inventory-data-model.md](../data/gf-inventory-data-model.md).
- **Cross-link HLD**:
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — primary downstream + business state SoT
  - [gf-purchase-HLD.md](gf-purchase-HLD.md) — Kafka event source (PO `DELIVERED.2`)
  - [gf-sales-HLD.md](gf-sales-HLD.md) — Kafka event source (SO `READY`/`DELIVERED`)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered stateless (inbound ReservationWorkerCtrl·PeriodClosureOperatorCtrl·Kafka Listeners → Temporal WorkflowClient/ScheduleClient 6 workflows + RetryCronJob → InventoryClient) + connector `┬`/`▼`; **external side-exit `───┼─►`**: Temporal Cloud (gf-inventory-worker queue + cron) + gf-inventory (24 ep); NO persistence band (stateless); Kafka C-only ở footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v4 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes; (F-02) feature flag scope sửa — chỉ PO listener (`PurchaseOrderEventListener`) + retry cron (`PeriodClosureRetryCronJob`) có `INVENTORY_STOCK` gate; SO listener (`ServiceOrderEventListener`) KHÔNG có feature flag check → delivery workflow start bất kể flag state (open HLD-INV-WORKER-010). |
| 2026-05-07 | v1 | Initial HLD cho `gf-inventory-worker`: orchestration bất đồng bộ domain kho theo Fat API/Thin Worker pattern — KHÔNG có DB/repository/migration, state ở Temporal cluster + `gf-inventory` SoT. 6 registered workflow (`ReservationExpiryWorkflow`, `ReceiptFulfillmentWorkflow` 72h timeout, `DeliveryFulfillmentWorkflow` 24h timeout, `PeriodClosureCoordinatorWorkflow`, `WarehouseBatchWorkflow` saga, `RetryBatchWorkflow`) + 5 activity wrap `InventoryClient` (24 protected endpoints). Task queue `gf-inventory-worker`, schedule `period-stock-closure-scheduler` cron `0 0 1 * *` (1st tháng, Asia/Ho_Chi_Minh), retry cron 5min cho PENDING_RETRY warehouses, deterministic workflow ID + idempotency key `closure-{periodCode}-{tenantId}-{warehouseCode}-{workflowId}`, max concurrent 2 child batch, batch size 15 warehouses. Kafka inbound `purchase-order-events` (PO `DELIVERED.2`) + `service-order-events` (SO `READY`/`DELIVERED`), protected REST 7 operator endpoint `/protected/v2/period-closure/operator/*` + 3 reservation endpoint, feature flag `INVENTORY_STOCK` gate. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `workflows/`. |
