---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 5
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-06"  # v5 W04 — §2.2 add PROPOSED inbound consumer AccountingPeriodClosed/Reopened từ gf-accounting (topic AC-DEV-ACCOUNTING-EVENTS, ADR-019 PROPOSED flip ACTIVE trigger); §5 add Forbidden W04 rules
---

# Events - `inventory` boundary

> Producer = `gf-inventory`. Boundary này publish 1 active outbound (`WarehouseCreated` trên `AC-DEV-BRANCH-LIFECYCLE`) + consume 1 inbound external (`TenantProvisioned` từ `ct-saas-tenant`). `gf-inventory-worker` là consumer of-purchase + of-sales (start Temporal workflow), KHÔNG publish business event Kafka.
>
> Consume từ producer **internal** khác (per [`_CONVENTIONS.md §12`](_CONVENTIONS.md) discovery semantics, KHÔNG document trong §2.2):
> - `BranchCreated` ← [gf-system-events.md](gf-system-events.md) §2 — `BranchCreatedEventListener` tạo default warehouse + publish `WarehouseCreated` (multi-step trên cùng topic)
> - `PurchaseOrderStatusChanged` ← [gf-purchase-events.md](gf-purchase-events.md) §2 — worker start `ReceiptFulfillmentWorkflow`
> - `ServiceOrderStatusChanged` ← [gf-sales-events.md](gf-sales-events.md) §2 — worker start `DeliveryFulfillmentWorkflow`

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-inventory` |
| Worker consumer service | `gf-inventory-worker` (consume PO/SO của producer khác — không publish event integration) |
| Confirmed outbound Kafka | `WarehouseCreated` qua outbox + `BranchLifecyclePublisher` |
| Canonical envelope | `com.actechx.common.messaging.Message` với Kafka headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` |
| Reliability | `outbox_event` table cho outbound warehouse lifecycle với polling scheduler/retry/backoff |
| Total events | 1 outbound active (`WarehouseCreated`) + 1 external-source inbound (`TenantProvisioned`) |

Ghi chú source-aligned:

- `InventoryEventService` có enum/record cho receipt, delivery, reservation, stock nhưng chỉ reservation expired/released/fulfilled đang ghi `outbox_event` bằng raw payload legacy.
- `EventPublishingService` hiện parse payload theo full `Message` (`headers` + `data`) và luôn route qua `BranchLifecyclePublisher`; vì vậy các outbox event legacy như `InventoryReservationExpired` không được xem là Kafka outbound confirmed cho đến khi có publisher/route riêng.
- `publishReceiptCompleted`, `publishReceiptReversed`, `publishDeliveryCompleted`, `publishDeliveryReversed`, `publishStockAdjusted` đang gọi `NotificationMessageService`, không ghi Kafka outbox trong source hiện tại.
- `DomainEventPublisher` trong `gf-inventory` publish bằng Spring `ApplicationEventPublisher`, là in-process domain event, không phải integration Kafka event.
- `OutboxScheduler` chỉ chạy khi `inventory.outbox.polling.enabled=true`, default interval `5000ms`, batch-size `100`; query chỉ nhặt row `status=PENDING` và `next_retry_at IS NULL OR <= now`.
- `OutboxEventEntity` không có trạng thái `PROCESSING`; `OutboxService.markAsProcessing(...)` hiện chỉ log, nên row vẫn ở `PENDING` cho đến khi publish thành công (`SENT`) hoặc lỗi (`PENDING/FAILED`).

---

## 2. Catalog

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `WarehouseCreated` | `AC-DEV-BRANCH-LIFECYCLE` | Tạo default warehouse sau khi nhận `BRANCH_CREATED.1` cho garage branch | `ct-saas-tenant`, subscriber branch lifecycle | ≤ 30s | `source-aligned-producer-only` | shared topic với `BranchLifecycleChanged` step `WAREHOUSE_CREATED.1` |

> **Removed (non-active)**: `InventoryReceiptCompleted/Reversed`, `InventoryDeliveryCompleted/Reversed`, `InventoryReservationExpired/Released/Fulfilled`, `InventoryStockChanged`, `PeriodStockAdjusted` — định nghĩa trong `OutboxEventType` enum + saved bằng `InventoryEventService`/`PeriodStockActivity` vào `outbox_event` table, nhưng `EventPublishingService.publishEvent()` chỉ route `WAREHOUSE_CREATED` qua `BranchLifecyclePublisher` → các event này KHÔNG đến Kafka. Per source-of-truth policy không liệt kê outbound cho đến khi có publisher route.

### 2.2 Inbound — external-source

> Producer external (`ct-saas-tenant`) — `gf-inventory` owns schema mirror.
>
> **W04 note**: gf-accounting là producer **internal** (per _CONVENTIONS §12 discovery semantics — NOT documented as inbound row per §5 Forbidden rule). Cross-boundary consumer of `AccountingPeriodClosed`/`Reopened` documented dưới §2.3 (PROPOSED, future ACTIVE flip).

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 2 | `TenantProvisioned` | `AC-DEV-TENANT-PROVISIONING` | External: `ct-saas-tenant` | `TenantSubscriptionCacheListener` → cache subscription quota + features vào Redis cho tenant; multi-tenant invariant | ≤ 60s | `consumer-only-confirmed` | — |

### 2.3 Cross-boundary consumer — PROPOSED (W04 ADR-021)

> `gf-inventory` **will consume** 2 events từ `gf-accounting` khi ADR-019 §Decision C flip ACTIVE (future wave). Contract khóa sớm để zero drift; W04 KHÔNG wire consumer (dùng REST advisory pattern trực tiếp per ADR-021).

| Event Type | Producer | Topic | MessageGroup | MessageStep | Consumer intent | W04 Status |
|---|---|---|---|---|---|---|
| `AccountingPeriodClosed` | `gf-accounting` (ADR-019) | `AC-DEV-ACCOUNTING-EVENTS` | `ACCOUNTING_PERIOD_LIFECYCLE` | `CLOSED.1` | Invalidate Caffeine LRU cache `(tenantId, date)` cho lock-check (ADR-021); trigger re-fetch on next OB verify | PROPOSED — not consumed W04 |
| `AccountingPeriodReopened` | `gf-accounting` (ADR-019) | `AC-DEV-ACCOUNTING-EVENTS` | `ACCOUNTING_PERIOD_LIFECYCLE` | `REOPENED.1` | Same as above (semantic identical for cache purpose) | PROPOSED — not consumed W04 |

**Flip ACTIVE trigger threshold** (per ADR-021 §Threshold): (a) cache staleness 30s false-positive block > 0.1% commits, OR (b) gf-accounting đóng kỳ > 5 events/tenant/day frequency. Consumer wire = future wave scope (W05 khi RECEIPT-V2/DELIVERY-V2 cùng kick off cùng pattern).

---

## 3. Schemas

### 3.1 `WarehouseCreated` outbound

Outbox row:

```json
{
  "tenantId": 1001,
  "eventId": "message-id",
  "eventType": "WarehouseCreated",
  "eventVersion": "v1",
  "aggregateType": "Warehouse",
  "aggregateId": "WH-001",
  "status": "PENDING",
  "payload": {
    "headers": {
      "MessageGroup": "BRANCH-LIFECYCLE",
      "MessageStep": "WAREHOUSE_CREATED.1",
      "OriginTenantId": 1001,
      "OriginMessageCode": "WH-001"
    },
    "data": {
      "tenantId": 1001,
      "branchId": 10,
      "branchCode": "BR-001",
      "warehouseId": 20,
      "warehouseCode": "WH-001",
      "warehouseName": "Default Warehouse",
      "warehouseType": "DEFAULT",
      "address": "string",
      "city": "string",
      "ward": "string",
      "contactPhone": "string",
      "contactEmail": "string",
      "isDefault": true,
      "isActive": true
    }
  }
}
```

Kafka publish:

- `OutboxEventPublisher` poll `outbox_event` theo `inventory.outbox.polling.batch-size`; scheduler chạy fixed delay theo `inventory.outbox.polling.interval-ms`.
- `JpaOutboxEventRepository.findPendingEvents(...)` dùng `PESSIMISTIC_WRITE` và lock timeout `-2`, lọc `status=PENDING` cùng `nextRetryAt`.
- `EventPublishingService` đọc full `Message` từ `payload`, lấy `headers` và `data`. Code publish **tất cả** outbox event qua `BranchLifecyclePublisher` (không có routing logic theo event type); filtering thực tế xảy ra ở `OutboxEventType.usesMessageWrapper` flag — chỉ `WAREHOUSE_CREATED` có flag này.
- `BranchLifecyclePublisher` publish vào `${kafka.topics.branch-lifecycle}` với key là `OriginTenantId`.
- Publish thành công chuyển row sang `SENT`, set `sent_at`.
- Publish lỗi gọi `recordFailure(...)`: tăng `retry_count`, giữ `PENDING` nếu còn retry, chuyển `FAILED` khi hết `max_retries`, set `next_retry_at` theo exponential backoff `1/2/4/8/16` phút.
- Cleanup row `SENT` chạy hằng ngày 02:00 và giữ 7 ngày.

### 3.2 `TenantProvisioned` _(inbound external)_

**Producer source**: `ct-saas-tenant` — phát khi tenant được provision với subscription plan + feature flags.

**Trigger upstream**: Subscription onboarding/upgrade trong `ct-saas-tenant` → publish snapshot tenant configuration.

**Payload** (raw DTO, không envelope `KafkaMessageWrapper`):
```json
{
  "tenantId": "BIGINT",
  "subscriptionPlan": "string — enum tier",
  "features": {
    "inventory": "object",
    "...": "..."
  }
}
```

**Consumer logic** (`TenantSubscriptionCacheListener`):
1. Consume topic `${kafka.topics.tenant-provisioning}` (default `AC-DEV-TENANT-PROVISIONING`).
2. Decode payload → cache subscription quota + features vào Redis (key prefix theo tenant).
3. Tenant downstream check quota qua Redis cache.

**Idempotency**: cache write idempotent (overwrite key); không cần inbox dedup vì state là projection.

### 3.3 Outbox events (saved but not published)

`OutboxEventType` enum + `InventoryEventService`/`PeriodStockActivity` ghi nhiều event vào `outbox_event` table:

```
INVENTORY_RECEIPT_COMPLETED, INVENTORY_RECEIPT_REVERSED,
INVENTORY_DELIVERY_COMPLETED, INVENTORY_DELIVERY_REVERSED,
INVENTORY_RESERVATION_EXPIRED, INVENTORY_RESERVATION_RELEASED, INVENTORY_RESERVATION_FULFILLED,
INVENTORY_STOCK_CHANGED
```

Ràng buộc hiện tại (KHÔNG xem là outbound Kafka cho đến khi có publisher route):

- `EventPublishingService.publishEvent()` chỉ route `WAREHOUSE_CREATED` qua `BranchLifecyclePublisher`; mọi event khác bị early-return implicit (không match → publisher không gọi).
- Các event này chỉ được ghi khi feature flag `Inventory:InventoryStockV01` bật.
- Row `outbox_event` có `eventType` ngoài `WAREHOUSE_CREATED` ở `PENDING` → scheduler sẽ pick up nhưng không có publisher → exception/timeout → row chuyển `FAILED` sau hết `max_retries`.

---

## 4. Workflow correlation (Temporal)

`gf-inventory-worker` chạy 2 Temporal workflow nhận trigger từ producer khác (per producer-view discipline — workflow trigger event document tại producer file):

`ReceiptFulfillmentWorkflow`:
1. `gf-purchase` publish `PurchaseOrderStatusChanged` (xem [gf-purchase-events.md](gf-purchase-events.md) §3.1) `MessageStep=DELIVERED.2`.
2. `gf-inventory-worker` `PurchaseOrderEventListener` consume → start workflow id `receipt-fulfillment-{tenantId}-{purchaseOrderCode}`.
3. Workflow tạo receipt + reserve stock.
4. `WorkflowExecutionAlreadyStarted` = idempotent success.

`DeliveryFulfillmentWorkflow`:
1. `gf-sales` publish `ServiceOrderStatusChanged` (xem [gf-sales-events.md](gf-sales-events.md) §3.5) `MessageStep=DELIVERED`.
2. `gf-inventory-worker` `ServiceOrderEventListener` consume (hỗ trợ embedded headers + legacy wrapper format) → start workflow id `delivery-fulfillment-{tenantId}-{serviceOrderCode}`.
3. Workflow reserve stock + decrement inventory + create delivery record.

`Reservation lifecycle` _(outbox legacy, chưa có publisher route)_:
1. Reservation workflow expired/released/fulfilled gọi `InventoryEventService`.
2. Ghi outbox với raw payload (`InventoryReservationExpired`/`Released`/`Fulfilled` — xem §3.2).
3. `EventPublishingService` route mọi outbox qua `BranchLifecyclePublisher` → rủi ro publish lỗi nếu payload không có full `Message.headers`/`Message.data`.

---

## 5. Forbidden patterns

- Không mô tả `gf-inventory-worker` là producer integration event; worker hiện chỉ consume PO/SO và start Temporal workflow.
- Không gom toàn bộ inventory domain event thành Kafka event nếu source chỉ publish in-process bằng `ApplicationEventPublisher`.
- Không xem receipt/delivery/stock notification calls là Kafka outbound event; source hiện gọi `NotificationMessageService`, không ghi `outbox_event`.
- Không publish outbox legacy reservation payload qua `BranchLifecyclePublisher` nếu payload không có full `Message.headers`/`Message.data`.
- Không bỏ qua Kafka headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` với branch lifecycle.
- Không mô tả `outbox_event` của `gf-inventory` có trạng thái `PROCESSING`; source hiện không persist trạng thái này.
- Không tạo inbound section trong file này cho event có producer **internal** (`BranchCreated` ← gf-system, `PurchaseOrderStatusChanged` ← gf-purchase, `ServiceOrderStatusChanged` ← gf-sales) — vi phạm producer-view discipline (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)). §2.2 chỉ áp dụng cho producer **external** (vd `ct-saas-tenant` → `TenantProvisioned`).
- **(W04)** Không consume `AccountingPeriodClosed`/`Reopened` trong batch — status PROPOSED; ADR-021 chỉ định REST advisory pattern cho W04. Wire consumer = future wave (ADR-019 §C flip ACTIVE).
- **(W04)** Không publish outbound OB event trong batch — cascade sổ tồn là intra-service sync qua `StockLedgerRecomputeService` (ADR-020); PROPOSED outbound `STOCK_LEDGER_UPDATED` cross-boundary consumer scope = W06+ (khi FEAT-STK-* build).

---

## 6. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Producer file của event mà boundary này consume:
  - [gf-system-events.md](gf-system-events.md) — `BranchCreated`, `TenantProvisioned`
  - [gf-purchase-events.md](gf-purchase-events.md) — `PurchaseOrderStatusChanged`
  - [gf-sales-events.md](gf-sales-events.md) — `ServiceOrderStatusChanged`
- Workflow files:
  - `inventory-receipt-fulfillment-flow.md`
  - `inventory-delivery-fulfillment-flow.md`
  - `reservation-expiry-flow.md`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-06 | v5 | **W04 — Add §2.3 Cross-boundary consumer PROPOSED cho gf-accounting AP events** — Document intent consume `AccountingPeriodClosed` + `AccountingPeriodReopened` từ topic `AC-DEV-ACCOUNTING-EVENTS` (owner gf-accounting per ADR-019); trong W04 KHÔNG wire (ADR-021 dùng REST advisory + authoritative pattern). Consumer intent = invalidate Caffeine LRU cache `(tenantId, date)` cho lock-check. Flip ACTIVE threshold documented (0.1% false-positive block, > 5 close/tenant/day). §5 Forbidden thêm 2 rules: (a) không consume AP events W04; (b) không publish OB outbound W04 (cascade intra-service; `STOCK_LEDGER_UPDATED` future PROPOSED scope). §2.2 note gf-accounting là producer internal (NOT §2.2 row). v4 → v5. |
| 2026-06-23 | v4 | **R4 — Strip AP scope (Boundary correction — AP moved to gf-accounting wave per Delivery Authority decision 2026-06-23)** — Remove §2.1 rows 2 & 3 (`AccountingPeriodClosed` + `AccountingPeriodReopened` PROPOSED outbound) + ADR-019 reference notes + §3.1a full payload schemas/idempotency/topic justification + §5 Forbidden rules AP-specific (publish ban + breaking-change PROPOSED guard) + R3 F9 MessageGroup verification footer note. Catalog v2 events untouched (none — catalog v2 không publish events trong batch). |
| 2026-06-23 | v3 | **R3 F1 + F9** — F1: frontmatter `boundary: inventory` → `gf-inventory` (consistency với SERVICE-BOUNDARY-MATRIX boundary slugs); F9: §2.1 thêm footer verification note xác nhận `MessageGroup=ACCOUNTING_PERIOD_LIFECYCLE` conform `_CONVENTIONS.md §3.3` UPPERCASE_SNAKE policy (same family với SERVICE_ORDER/BRANCH/NOTIFICATION/ERP examples — không exhaustive list); MessageStep `CLOSED.1`/`REOPENED.1` follow versioned-suffix pattern (vd `COMPLETED.1`/`CREATED.1`). Cross-ref ADR-019 inline note (no version bump per R3 instruction). |
| 2026-06-23 | v2 | **AP slice (DESIGN, ADR-019)** — §2.1 thêm 2 outbound `AccountingPeriodClosed` + `AccountingPeriodReopened` với status `PROPOSED` (contract declared, KHÔNG publish trong batch); topic `AC-DEV-INVENTORY-EVENTS` (new); MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE`; envelope `KafkaMessageWrapper` (per _CONVENTIONS §2). §3.1a thêm schemas + idempotency-key spec cho future ACTIVE flip. §5 Forbidden thêm 2 rules: cấm implement publish trong batch + cấm breaking change PROPOSED contract. PROPOSED contract semantics doc'd. Future wave (RECEIPT-V2/DELIVERY-V2/PRC kick-off) flip ACTIVE per ADR-004 outbox/inbox. |
| 2026-05-07 | v1 | Initial events spec cho `inventory` boundary: 2 outbound (`WarehouseCreated` confirmed trên `AC-DEV-BRANCH-LIFECYCLE` step `WAREHOUSE_CREATED.1`, `MessageGroup=BRANCH-LIFECYCLE` + `InventoryReservationLifecycle` outbox legacy chưa có publisher route); envelope common `Message` headers; reliability `outbox_event` table với `OutboxEventPublisher` polling/retry/backoff (1/2/4/8/16 phút); §4 Workflow correlation cho 2 Temporal workflow `ReceiptFulfillmentWorkflow` (consume `PurchaseOrderStatusChanged` `DELIVERED.2`) + `DeliveryFulfillmentWorkflow` (consume `ServiceOrderStatusChanged` `DELIVERED`) chạy ở `gf-inventory-worker`. Bao gồm producer summary, catalog 2 row, schemas, workflow correlation, forbidden patterns, references. |
| 2026-05-07 | v2 | Reconcile theo source-of-truth audit: split §2 thành §2.1 + §2.2; strip `InventoryReservationLifecycle` config-dto-only khỏi §2 (giữ ở §3.3 là "saved but not published"); thêm §2.2 inbound `TenantProvisioned` từ `ct-saas-tenant` external (consumer = `TenantSubscriptionCacheListener`); cập nhật producer summary count 1 active + 1 external inbound. |
