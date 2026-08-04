---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 18
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-07-07"  # v17 W04 doc-nav cascade — refactor §7 Forbidden 3 rule W04 language từ Java class-name (NegativeStockException, ThreadLocal, recompute()/recomputeBatch()) sang semantic label (exception category NegativeStock, reentrancy blocking, method surface M1/M2) đồng bộ với ADR-020 v3→v4 rewrite (strip Java code). Cross-ref anchor C1/C5/C6 không đổi. Additive-only, không đổi behavior. v16 W04 doc-nav cascade — §7 Forbidden 3 rule W04 (StockLedgerRecomputeService bypass + closing_qty<0 + reentrancy/order lock) cross-ref ADR-020 §Component Interface C1/C5/C6 formal contract vừa bump (v2→v3). Additive-only, không đổi behavior. v15 W04 Q3 fix — Doc `@FeatureOn(Inventory:InventoryV2)` gate mở rộng cover cả W03 catalog v2 + W04 opening balance (user chốt scope 2026-07-06). §3 Key Design Decisions thêm row `@FeatureOn(Inventory:InventoryV2)` song song row legacy `INVENTORY_STOCK`. §6 Quality Attributes row `Feature gate` mở rộng mention V2 subsystem. §7 Forbidden thêm rule "Skip @FeatureOn(Inventory:InventoryV2) trên catalog v2/opening-balance controllers" song song rule legacy. Doc-only update — annotation đã spec sẵn ở Product EP-INVENTORY-OPENING-BALANCE §5.2 v3 (CR-1782974034). v14 W04 — PO chốt rate-limit OB import (2026-07-06): bỏ giới hạn số lần/ngày, chỉ giữ 500-row/import cap sẵn có (ADR-022 → ERR-INV-048), gỡ NEEDS CONFIRMATION khỏi §6b.6 Tenant fairness bullet "Rate limit". Đóng P2 #1 từ ARCH-REVIEW-W04.md Pass 1/2/3. Không đụng 3 bullet còn lại của §6b.6 (Redisson lock, lock-check concurrency cap, no-background-job). v13 W04 — Add §1 callout subsystem `opening-balance` + `stock-ledger` (ADR-020/021/022); §5 Data Ownership row Opening Balance + Stock Ledger; §6b Performance & Scale (SaaS multi-tenant) mandatory 6-item section; §7 Forbidden rules W04-guard; depends_on add ADR-020/021/022 + BR-STKV2
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-inventory-api.md
  - ../events/gf-inventory-events.md
  - ../data/gf-inventory-data-model.md
  - ../decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md
  - ../decisions/ADR-018-inventory-v2-bulk-import-pattern.md
  - ../decisions/ADR-020-stock-ledger-daily-snapshot.md
  - ../decisions/ADR-021-ob-period-lock-cross-boundary.md
  - ../decisions/ADR-022-ob-import-all-or-nothing-bulk.md
---

# HLD — `gf-inventory`

## 1. Overview

`gf-inventory` là service T1 — **Source-of-Truth cho domain kho** của Garage. Service sở hữu danh mục sản phẩm/dịch vụ, PIM/MDM part lookup, warehouse/branch inventory setup, **tồn kho per SKU/tier/warehouse** (negative stock allowed, optimistic locking), receipt từ purchase order, delivery cho sales/service order, reservation TTL, period stock closure (WAC/COGS), in chứng từ kho, outbox/Kafka event và điều phối Temporal workflow. Tách rõ với `gf-purchase` (PO ownership) và `gf-sales` (SO ownership) — `gf-inventory` chỉ nhận reference rồi mutate stock state. Worker Temporal long-running runtime nằm ở `gf-inventory-worker` (Fat API/Thin Worker pattern).

**Trách nhiệm:**
- **Stock state SoT**: `inventory_stock` (current quantity + reserved marker + cost/suggested price, negative allowed) + `inventory_transaction` (audit ledger) + reservation TTL (ecommerce 30min/direct 3min, expire/release/fulfill qua Temporal workflow).
- **Receipt từ PO**: tạo/update/complete/cancel/reverse, validate PO quantity (gọi `gf-purchase`), tăng stock, ghi transaction, export PDF.
- **Delivery cho SO**: tạo/update/complete/cancel/reverse, validate service order (gọi `gf-sales`), reserve/release/fulfill stock, update cost price, export PDF.
- **Period stock closure**: opening/received/delivered/closing quantity per period, WAC + COGS calculation, atomic close + create next period, retry/rollback/idempotency.
- **Warehouse**: tạo từ `branch-lifecycle` Kafka event (default warehouse khi `BRANCH_CREATED.isDefault=true`).
- **Product/PIM/MDM**: quick product, SKU search, grouped product, PIM live info, MDM part identity/alias/catalog/suitable part, Google Custom Search image.
- **Garage service catalog**: CRUD service tenant-scoped + attachment image + giá bán.
- **Event durability**: `outbox_event` + `inbox_event` + `processed_events` (3 dedup mechanisms khác nhau).

**Owned epic**: cross-cutting inventory — cornerstone cho commerce flow xuyên `gf-purchase` (receipt) + `gf-sales` (delivery) + `gf-inventory-worker` (workflow). Không map epic Product cụ thể.

> **Inventory V2 catalog-v2 (DESIGN — EP-INVENTORY-CATALOG only, ADR-017/018)**: thêm 1 subsystem mới **độc lập** với legacy product subsystem hiện có:
>
> - **Subsystem `catalog-v2`** (ADR-017 additive): 12 features (5 GRP + 7 PROD). Entities mới: `material_group` (cây phân cấp adjacency-list — UI render trải phẳng per BA 2026-06-26 R29: V2-1 `POST /search` canonical cho UI, V2-2 `GET /tree` reserved cho integration future KHÔNG dùng UI W03), `internal_product` (mã chuẩn nội bộ, gắn `material_group_id`, `main_unit_code` (R8 D-A/E), `nature` enum English keys `GOODS/TOOL/SERVICE/OTHER` (R8 D-B), `pricing_method` enum, `brand_code` validated-vs-catalog (R8 D-C), `image_url` S3 path (R8 D-D)), `internal_product_conversion_unit` (R8 D-E rename; `conversion_rate` NUMERIC(18,6) — app-layer guard ≤6 chữ số thập phân → `ERR-INV-047` per BR-CAT-PROD-011 v15 BA 2026-06-26 R29), `internal_product_sku_mapping` (scalar FK → legacy `product.id`, R9 column `product_id` tường minh), `internal_product_attachment`. **R10**: `internal_product_history` entity + V2-9 endpoint REMOVED (BA chốt no history audit; standard audit cols sufficient). Legacy `product` aggregate giữ nguyên (SKU master) — KHÔNG schema change. API surface: `/api/v2/material-groups/*` (V2-1 search POST `/search`), `/api/v2/internal-products/*` (V2-7 search POST `/search` R10), `/api/v2/skus/search?unmapped={bool}`, `/api/v2/internal-products/{verify-import,import}` (JSON body 2-step per ADR-018, row cap 500), `/api/v2/internal-products/{id}/conversion-units/*` (R8 D-E path rename).
>
> Cross-boundary touch DUY NHẤT: gf-erp-mdm catalog **READ** cho Unit + Brand (`/protected/catalog/v1/inquiry` với `directory=UNIT` per R8 D-A/E + `directory=BRAND` per R8 D-C — pattern BR-AGG-GARAGE-GRAPH-001 enrichment). KHÔNG modify gf-erp-mdm schema/entity.
>
> **AP slice (kỳ kế toán) deferred to gf-accounting wave** per Delivery Authority boundary correction 2026-06-23 (R4 strip — xem CHANGE-REQUESTS).
>
> **Inventory V2 opening-balance + stock-ledger (DESIGN — EP-INVENTORY-OPENING-BALANCE + nền BR-STKV2, W04, ADR-020/021/022)**: thêm 2 subsystem mới **độc lập** với legacy `inventory_stock` + `inventory_transaction`:
>
> - **Subsystem `opening-balance`** (ADR-022): entity `opening_balance_line` — source-of-truth cho tồn đầu kỳ (SL + GT + Tồn đến ngày), UNIQUE (mã+kho) tenant-scoped per BR-OB-012. API `/api/v2/opening-balances/*` (7 endpoints: search/template/verify-import/import/update/delete/delete-lines). Import 2-step wizard extends ADR-018 (FE parses `.xlsx` browser-side, JSON body, cap 500 3-layer defense) + **all-or-nothing commit** (BR-OB-004a single transaction) + **idempotency key** `OB-IMPORT-{tenantId}-{uuid}` (24h dedup via `processed_events`). Web GMS đầy đủ CRUD; App Garage view-only list (per UX-FLOW-OPENING-BALANCE).
> - **Subsystem `stock-ledger`** (ADR-020): entity `inventory_stock_ledger` — sổ tồn projection point-in-time daily-snapshot per BR-STKV2-001, 1 row per (mã+kho+garage+movement_date), read query `ORDER BY movement_date DESC LIMIT 1` cho "tồn-đến-ngày D". Write qua shared engine `StockLedgerRecomputeService` implementing BR-STKV2-005a 4-step (delete-from-D → replay from source → running closing → invariant check `closing_qty ≥ 0` → throw `ERR-INV-036`). Redisson lock per `(tenant, product, warehouse)` prevent concurrent 2 write-paths. **Co-exist với legacy `inventory_stock`** (V1 running-qty ledger) — không mirror, không replace; deprecation threshold documented in ADR-020.
> - **Cross-boundary lock-check** (ADR-021): OB write-paths (verify + import + edit + delete) call `gf-accounting /protected/v1/accounting-periods/lock-check` via `gfAccountingClient` REST bean (x-api-key S2S). Advisory in verify (fail-fast preview) + authoritative in commit (transaction rollback if CLOSED). 30s LRU cache `(tenantId, date)`; fail-CLOSED for commit path. Reuse ADR-019 REST advisory pattern verbatim — zero ADR-019 spec change; PROPOSED events remain not-published.
> - **Cross-boundary touch new**: gf-inventory outbound REST to gf-accounting `/lock-check` (documented `INTEG-EXT-gf-inventory.md §13b` this batch).
> - **FEAT-INV-MOBILE-MENU (W04 mobile hub)**: pure client-side navigation hub trên app Garage, render grid 2 cột tile "Tồn đầu kỳ" enable ở W04 per state matrix (FEAT-INV-MOBILE-MENU §3). **Zero BFF/REST call cho hub**; tile-tap push route to sub-FEAT list. **Không thuộc gf-inventory backend scope** — chỉ tham chiếu vì tile "Tồn đầu kỳ" wire tới `FEAT-OB-LIST` mobile view-only.

## 2. Component Diagram (C4 Level 3)

```
┌─────────── gf-inventory  (Java 21 · Spring Boot 3.5.0) ───────────┐
│  ┌─ REST Controllers ───────────────────────┐ ┌─────────────┐     │
│  │ InventoryStockCtrl·ReceiptCtrl·Delivery   │ │ Consumers / │    │
│  │ Ctrl·PeriodStockCtrl·ProductCtrl·Warehouse│ │ Scheduler   │    │
│  │ Ctrl·GarageServiceCtrl·MdmPartCtrl        │ │ BranchCreat-│    │
│  │ Protected/Internal: Receipt·Delivery·     │ │ edListener· │    │
│  │ Reservation·PeriodClosure·Inventory·      │ │ TenantSub·  │    │
│  │ Location·Product·PimInfo·ApiKey (x-api)   │ │ PIMInfoMsg· │    │
│  └────────────────────┬──────────────────────┘ │ OutboxSched │    │
│                       │                        └──────┬──────┘    │
│  ┌────────────────────▼───────────────────────────────▼─────┐     │
│  │ APP / DOMAIN SERVICES                                    │     │
│  │  InventoryStockService·ReceiptService·DeliveryService·   │     │
│  │  ReservationService·PeriodStockService·ProductService·   │     │
│  │  WarehouseService·OutboxPublisher                        │     │
│  └─────┬─────────────────────────────────────┬─────────────┘      │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐                  │
│  │ JPA/Flyway │ │ Kafka outbox │ │ HttpClients │                  │
│  │[dev_gf_inv]│ │ +producer    │ │ (x-api-key, │──────────────────┼─► gf-purchase  (PO validation)
│  │ ddl+Flyway │ │ branch-life  │ │  R4j)       │──────────────────┼─► gf-sales     (SO validation)
│  │            │ │              │ │             │──────────────────┼─► gf-erp-mdm · ct-saas-tenant
│  │            │ │              │ │             │──────────────────┼─► gf-notification (5 events)
│  │            │ │              │ │             │──────────────────┼─► gf-inventory-worker (Temporal signal)
│  └─────┬──────┘ └──────┬───────┘ └─────────────┘──────────────────┼─► Google Custom Search
│  Temporal interface (executed in gf-inventory-worker):            │
│   Reservation/Receipt/Delivery/PeriodStock workflows              │
│  @FeatureOn(INVENTORY_STOCK): delivery·receipt·stock·period-      │
│   stock·garage-service (NOT warehouse/product/mdm-part)           │
│  outbox │ /api/v1/* (50) │ /protected/* (45) │ Actuator+OTLP      │
└───────┴──────────────┴────────────────────────────────────────────┘
        ▼                      ▼
   PostgreSQL [dev_gf_inventory]   Kafka P: branch-lifecycle
   32 entities · ddl+Flyway        (WAREHOUSE_CREATED) ;
   + Redis (cache + lock)          C: branch-lifecycle·tenant-prov
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Inventory state là **PostgreSQL truth** (Temporal/Redis/Kafka chỉ điều phối) | Stock truth + audit ledger phải durable + ACID; cache không thay thế DB | TECHSTACK §inventory-truth |
| Tách `gf-inventory-worker` cho Temporal worker runtime | Fat API/Thin Worker — service API gọn; worker scale độc lập | [gf-inventory-worker-HLD.md](gf-inventory-worker-HLD.md) |
| **Negative stock ALLOWED** (business requirement) | Garage cho phép xuất kho vượt tồn; `availableQuantity = quantity` (`reservedQuantity` là tracking marker ONLY, KHÔNG deducted). Optimistic locking `@Version` | source `StockLevel.getAvailableQuantity` |
| Stock mutation qua `InventoryStockService` lock (pessimistic) | Tăng/giảm/reserve/release/finalize phải atomic + transaction nhất quán với ledger | source `JpaStockRepositoryAdapter` |
| 3 tầng event idempotency (outbox/inbox/processed_events) | Outbox = publish reliability; Inbox = Kafka consume dedup; processed_events = workflow callback dedup | open HLD-INVENTORY-010 (processed_events tenant) |
| Reservation TTL config theo source type | E-commerce 30 phút (checkout flow chậm); Direct 3 phút (operator at counter) | source `reservation.ttl.{ecommerce,direct}-minutes` |
| Period closure idempotency key + retry/rollback | Worker có thể retry; closure phải replay-safe + có rollback path; WAC/COGS native SQL | source `NativePeriodClosureService` |
| `@FeatureOn(INVENTORY_STOCK)` gate selected controllers | Delivery/receipt/stock/period-stock/garage-service + ProtectedPeriodClosure + ProtectedInternal gated; warehouse/product/mdm-part ungated | source `FeatureFlagHelper` |
| `@FeatureOn(Inventory:InventoryV2)` gate V2 subsystem (W03 + W04) | Catalog v2: `MaterialGroupController` + `InternalProductController` (W03, `gf-inventory-api.md §3a`); Opening Balance: `OpeningBalanceController` (W04, `gf-inventory-api.md §3b`); Future: RECEIPT-V2/DELIVERY-V2/PRC controllers (W05/W06) | Product spec `EP-INVENTORY-OPENING-BALANCE §5.2 v3` + `BR-GF-INVENTORY §6.6 v3` (CR-1782974034 — user chốt 2026-07-06 mở rộng scope cover trọn V2 subsystem). Naming `Inventory:InventoryV2` trần theo Product spec (không format `{Domain}:{Code}`). Tenant chưa enable → HTTP 403. |
| Receipt validate PO quantity gọi `gf-purchase` | PO là SoT; tránh nhận quantity vượt PO; alert log khi vượt | source `getPOItemsForValidation` |
| Delivery complete trả `mismatch` thay vì fail-fast | Service order/items có thể mismatch nhưng delivery vẫn hoàn tất với cảnh báo | source `CompleteDeliveryResult.MismatchInfo` |
| Branch listener tạo default warehouse khi `isDefault=true` | Tự động bootstrap warehouse cho tenant garage | open HLD-INVENTORY-003 (eventId required) |
| Google Custom Search cho ảnh phụ tùng | Operator UX cần ảnh nhanh từ Google — qua API key + rate limit | source `RateLimiterService` |
| API key management trong service | Quản lý Google + internal key tại chỗ | open HLD-INVENTORY-008 (blast radius — should externalize) |
| Java 21 + Spring Boot 3.5.0 | Align với toàn bộ platform services | TECHSTACK §runtime |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` | Sync REST `/api/v1..v2/*` (JWT + feature flag) | BFF cho Garage UI/Mobile: warehouse, product, stock, receipt, delivery, period stock |
| `gf-purchase` | Sync REST `/protected/*` (x-api-key) | Product ID resolve, PO receipt summary, product detail/batch, product line create |
| `gf-sales` | Sync REST `/protected/*` (x-api-key) | SO delivery summary |
| `gf-inventory-worker` | Sync REST `/protected/*` (x-api-key) | 26 endpoints — receipt/delivery/reservation/period closure Temporal callback contract |
| `gf-erp-agent` | Sync REST `/protected/v1/locations` (x-api-key) | Location/warehouse create on tenant activation |
| `gf-erp-mdm` | Sync REST `/protected/v1/pim-info` (x-api-key) | PIM live info ingestion |
| `gf-system` (qua Kafka) | Async consume `branch-lifecycle` + `tenant-provisioning` | `BRANCH_CREATED` → tạo branch + default warehouse; `TENANT_PROVISIONED` → cache subscription |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-purchase` | Sync REST + x-api-key | `GET /purchase-orders/{code}/items` + `/code/{code}` (PO validation) |
| `gf-sales` | Sync REST + x-api-key | `GET /service-orders/{tenantId}/detail/{code}` (SO validation) |
| `gf-erp-mdm` | Sync REST + x-api-key | `POST /catalog/v1/inquiry` |
| `ct-saas-tenant` | Sync REST + x-api-key | `GET /saas-tenant/{tenantId}` (printing context) |
| `gf-notification` | Sync REST + x-api-key | `POST /notifications` cho 5 INVENTORY_* event |
| `gf-inventory-worker` | Sync REST + x-api-key | Reservation signals: `POST /workflows/reservation-expiry/{deliveryCode}/{release,fulfill}` (start via Temporal SDK trực tiếp) |
| Google Custom Search | Sync HTTPS + key/cx | Tìm ảnh phụ tùng cho operator UX |
| Kafka `branch-lifecycle` | Async publish | `WAREHOUSE_CREATED` (other event types saved to outbox but no publisher route — chỉ WAREHOUSE_CREATED reaches Kafka) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_inventory}` — 32 entities |
| Redis + Redisson | Cache + Lock | Subscription cache + stock lock + rate limit |
| Temporal | Workflow protocol | Worker ở `gf-inventory-worker` |
| Actuator + OTLP | Observability | Health/metrics + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `dev_gf_inventory` schema, 32 entities)** — chi tiết physical schema xem [data/gf-inventory-data-model.md](../data/gf-inventory-data-model.md):

| Aggregate group | Tables |
|---|---|
| **Branch + Warehouse** | `branch`, `warehouse` |
| **Product + Service catalog (legacy)** | `product_line`, `product`, `garage_service`, `garage_service_attachment` |
| **Catalog V2** (new, ADR-017 + R8/R9/R10) | `material_group` (adjacency-list parent_id self-FK), `internal_product` (mã chuẩn nội bộ — `main_unit_code` (R8 D-A/E), `brand_code` validated-vs-catalog (R8 D-C), `image_url` S3 path (R8 D-D), `nature` enum English keys (R8 D-B)), `internal_product_conversion_unit` (R8 D-E rename), `internal_product_sku_mapping` (scalar FK→legacy `product.id`, UNIQUE `product_id` per R9 rename tường minh), `internal_product_attachment`. **R10**: `internal_product_history` REMOVED (BA chốt no history audit; standard audit cols on internal_product + child tables sufficient). |
| **Stock ledger V1 (legacy)** | `inventory_stock` (quantity + reservedQuantity marker + cost), `inventory_transaction` (audit ledger) — giữ nguyên baseline WAC, không deprecate W04 (ADR-020 threshold) |
| **Opening Balance V2 (new, W04, ADR-022)** | `opening_balance_line` — SoT tồn đầu kỳ; UNIQUE `(tenant_id, product_id, warehouse_id)` per BR-OB-012; DECIMAL(18,6) SL / DECIMAL(18,2) GT; audit `file_name` + `file_checksum`. Source cho stock-ledger cascade (BR-STKV2-001 tình huống #1). |
| **Stock Ledger V2 (new, W04, ADR-020)** | `inventory_stock_ledger` — sổ tồn projection point-in-time, 1 row per (mã+kho+garage+ngày biến động), 6 metric cols inbound/outbound/closing SL+GT; row đầu chuỗi (min movement_date per key) = OB baseline với `inbound_qty=OB.quantity_on_hand` + `inbound_value=OB.value_on_hand` (OB là "nhập lần đầu" của mã+kho), `closing_*` = running formula uniform cho MỌI row (v22 uniform per user quannn 2026-07-08 — override v21 "closing_qty given" semantic); row sau = biến động phiếu aggregate, cùng công thức uniform. NXT report BR-STKV2-010 `SUM(inbound_*)` **bao gồm** OB row (v22 semantic — BA xem OB là nhập lần đầu). Engine detect row đầu chuỗi (khi cần audit/debug) via `ORDER BY movement_date ASC LIMIT 1` per key (v21 drop `movement_kind` column giữ). Rebuild-able từ 2 source (OB + slip detail) qua `StockLedgerRecomputeService` shared engine (BR-STKV2-005a). |
| **Receipt** | `inventory_receipt`, `inventory_receipt_item`, `inventory_document_attachment` |
| **Delivery** | `inventory_delivery`, `inventory_delivery_item` (cost price update post-period) |
| **Reservation** | `inventory_reservation`, `inventory_reservation_item` |
| **Period stock** (legacy — khác AP) | `inventory_period_stock` (opening/received/delivered/closing/COGS/status), `period_closure_history` |
| **PIM/MDM helper** | `pim_info`, `mdm_part_identity`, `mdm_part_alias`, `mdm_part_group`, `mdm_part_group_alias`, `mdm_suitable_part`, `mdm_vehicle_catalog`, `mdm_vin_parts` |
| **Event durability** | `outbox_event`, `inbox_event`, `processed_events` (3 dedup khác mục đích) |
| **Location** | `gf_location` (legacy IOStock support) |

**State machines**:

| Field | Values |
|---|---|
| `ReceiptStatus` | `PENDING` → `COMPLETED` / `CANCELLED`; `COMPLETED` → `REVERSED` |
| `DeliveryStatus` | `PENDING` → `COMPLETED` / `CANCELLED`; `COMPLETED` → `REVERSED` |
| `ReservationStatus` | `ACTIVE` → `FULFILLED` / `RELEASED` / `EXPIRED` / `CANCELLED` |
| `PeriodStockStatus` (legacy period stock) | `OPEN` → `CLOSED` → `ADJUSTED` |
| `MaterialGroupStatus` (V2) | `ACTIVE` ⇄ `INACTIVE` (cascade INACTIVE xuống children, BR-CAT-GRP-007) |
| `InternalProductStatus` (V2) | `ACTIVE` ⇄ `INACTIVE` (BR-CAT-PROD-008: INACTIVE chặn dùng trong phiếu mới) |
| `ProductNature` (V2 enum, BR-CAT-PROD-019 — R8 D-B English keys) | `GOODS` (default), `TOOL`, `SERVICE`, `OTHER` |
| `PricingMethod` (V2 enum, BR-CAT-PROD-010 — hiện khóa default; R13 rename per BA labels) | `PWA` (Bình quân cuối kỳ — default + only active), `SI` (Đích danh), `FIFO` (Nhập trước xuất trước), `MA` (Bình quân tức thời — placeholder) |
| `Tier` | `OEM` / `OES` / `AFTERMARKET` |
| `TransactionType` | `RECEIPT` / `DELIVERY` / `ADJUSTMENT` / `RESERVATION_HOLD` / `RESERVATION_RELEASE` |
| `NotificationType` | `INVENTORY_RECEIPT_COMPLETED` / `RECEIPT_REVERSED` / `DELIVERY_COMPLETED` / `DELIVERY_REVERSED` / `STOCK_ADJUSTED` |

**Tenant strategy**: hầu hết business entity có `tenant_id` + repository specification filter. MDM/PIM helper data **không có** `tenant_id` (catalog/reference data). `processed_events` **không có** `tenant_id` — event id phải globally unique (open HLD-INVENTORY-010).

**KHÔNG own**: PO lifecycle (`gf-purchase`), SO lifecycle (`gf-sales`), tenant/user authority (`ct-saas-tenant` + security platform), ERP master data (`gf-erp-mdm`), notification rendering (`gf-notification`), workflow worker runtime (`gf-inventory-worker`), file binary (object storage).

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Stock search p95 (paged) | ≤ 400ms |
| Stock detail mobile p95 | ≤ 300ms |
| Stock adjust p95 (incl. lock + transaction) | ≤ 600ms |
| Receipt create p95 (incl. PO validate) | ≤ 1s |
| Receipt complete p95 (incl. stock increase + transaction) | ≤ 1.5s |
| Delivery create p95 (incl. SO validate + reserve) | ≤ 1.2s |
| Delivery complete p95 (incl. fulfill + transaction + cost update) | ≤ 1.5s |
| Period stock search p95 | ≤ 500ms |
| Receipt/Delivery PDF export p95 | ≤ 3s |
| Reservation TTL (e-commerce / direct) | 30 phút / 3 phút |
| Outbox poll interval / batch size | 5000ms / 100 |
| Period closure chunk size / adjustment threshold | 200 / 0.01–100.0 |
| Multi-replica | Safe — Redisson lock cho stock + DB pessimistic lock |
| Schema migration | ⚠️ Flyway + ddl-auto=update dual (open HLD-INVENTORY-001/002) |
| Feature gate | `@FeatureOn(INVENTORY_STOCK)` on delivery/receipt/stock/period-stock/garage-service + selected protected; NOT warehouse/product/mdm-part. **V2 subsystem (W03 + W04)**: `@FeatureOn(Inventory:InventoryV2)` on catalog v2 (`MaterialGroupController` + `InternalProductController`) + `OpeningBalanceController` (W04) + future RECEIPT-V2/DELIVERY-V2/PRC controllers (W05/W06); tenant chưa enable → HTTP 403; Product spec EP-INVENTORY-OPENING-BALANCE §5.2 v3 + CR-1782974034. |
| Runtime | Java 21, Spring Boot 3.5.0 |

## 6b. Performance & Scale (SaaS multi-tenant — W04 additions)

> Garage là SaaS 17-boundary với dashboard/report/list-heavy. Section này bổ sung cho W04 subsystem (opening-balance + stock-ledger); §6 giữ nguyên legacy V1 targets. Downstream `/spawn-dev` phải dùng các quyết định này thay vì tự bịa pagination / index / cache TTL.

### 6b.1 Expected load

| Metric | W04 target | Note |
|---|---|---|
| OB list search QPS peak (per tenant) | 5 QPS | OB list ít được truy cập real-time; garage load 1 lần/session |
| OB import request rate | ≤ 1 request/tenant/hour | OB import là seed activity — rare |
| OB import file size | 500 rows max (BR-OB-004b `ERR-INV-048`) | Enforced 3 layers FE+BFF+BE (ADR-022) |
| Ledger recompute frequency | 10-100 per OB commit (cascade forward) | Depends on span from OB date to today × concurrent (mã+kho) touched |
| p95 latency search | ≤ 300ms | Dashboard tier |
| p95 latency verify-import (500 rows) | ≤ 2s | Dominant by lock-check dedup (parallel + 30s cache) |
| p95 latency import (500 rows, full cascade) | ≤ 5s | Single transaction; JPA batch 100; Redisson serialized per key |
| Tenant count assumption | ≤ 100 active tenants concurrent OB ops | Small; OB not hot-path |

**Threshold flag** (soft): concrete NFR chưa được BA/PO ratify vì OB không phải end-user hot-path. Author propose defaults trên; nếu W04 load test vượt → CR bump index strategy hoặc cascade async.

### 6b.2 Pagination strategy

- **Endpoint W04-1 `/search`**: default **cursor-based** khi tenant OB rows > 10k; offset-based OK cho ≤ 10k (typical). Page defaults: `size=20`, max `size=100`. Sort default `createdAt DESC` (per BR-OB-014 "Ngày import mới nhất lên đầu"). Cursor field = `id DESC` khi cursor active.
- **Response W04-3 verify preview**: no pagination in single response (500 rows max — fits ~500KB JSON). FE virtual-scroll on client.
- **Response W04-4 import**: no pagination (audit-only response).

### 6b.3 Index list (W04 additions — mọi index tenant-prefix)

| Query pattern | Index | Table |
|---|---|---|
| List OB filtered by created_at DESC (default sort) | `idx_ob_tenant_created (tenant_id, created_at DESC)` | `opening_balance_line` |
| List OB filtered by warehouse + asOfDate | `idx_ob_tenant_warehouse_asof (tenant_id, warehouse_id, as_of_date)` | `opening_balance_line` |
| List OB filtered by createdBy | `idx_ob_tenant_created_by (tenant_id, created_by)` | `opening_balance_line` |
| Guard OB uniqueness on import (mã+kho) — `ERR-INV-034` | `uk_ob_tenant_product_warehouse (tenant_id, product_id, warehouse_id) UNIQUE` | `opening_balance_line` |
| AP delete guard "OB with as_of_date in period" | `idx_ob_tenant_asof (tenant_id, as_of_date)` | `opening_balance_line` |
| Ledger point-in-time lookup (BR-STKV2 core) | `idx_ledger_lookup (tenant_id, product_id, warehouse_id, movement_date DESC)` — **critical** cho `ORDER BY DESC LIMIT 1` | `inventory_stock_ledger` |
| Ledger upsert uniqueness by day | `uk_ledger_tenant_product_warehouse_date (tenant_id, product_id, warehouse_id, movement_date) UNIQUE` | `inventory_stock_ledger` |
| NXT range scan (BR-STKV2-010) | `idx_ledger_tenant_date (tenant_id, movement_date)` | `inventory_stock_ledger` |
| Tồn theo kho (BR-STKV2-003) | `idx_ledger_warehouse (tenant_id, warehouse_id, movement_date)` | `inventory_stock_ledger` |

> **Rule**: Mọi index của `opening_balance_line` + `inventory_stock_ledger` bắt buộc prefix `(tenant_id, ...)` (Reviewer G12 P0 nếu vi phạm). Cross-tenant data-leak risk zero-tolerance.

### 6b.4 Cache strategy

- **AP lock-check cache** (ADR-021): Caffeine LRU TTL 30s scope `(tenantId, date)`. Invalidation: TTL-only trong W04 (Kafka event PROPOSED chưa flip ACTIVE per ADR-019). Cache size cap 10k entries/JVM instance.
- **Product/Warehouse lookup cache** (verify-import): local Caffeine TTL 5min scope `(tenantId, code)` for resolve `productCode → internal_product.id` + `warehouseName → warehouse.id`. Reuse existing catalog cache pattern (ADR-017).
- **No cache for opening_balance_line or ledger reads** — always fresh from DB. Reason: read frequency low (list only), data-freshness required for report accuracy.

### 6b.5 N+1 avoidance

- **W04-3 verify-import**: resolve batch `List<String> productCodes` + `List<String> warehouseNames` via single `WHERE code IN (?, ?, ...)` query per distinct set — not per row. Same for lock-check: gather `Set<LocalDate> distinctDates` and fetch parallel with dedupe.
- **W04-1 search**: response fields `productName` / `warehouseName` come from `opening_balance_line` denormalized columns (snapshot at import) — **zero JOIN** cần thiết at read time. Design decision to trade storage (denorm) for read simplicity.
- **BFF DataLoader**: `agg-garage-graph` §3g uses batch loader for `warehouseName` enrichment cross-tenant already (existing pattern per catalog V2 §3d).

### 6b.6 Tenant fairness

- **OB import** — Redisson lock scope per `(tenant, product, warehouse)` in ADR-020 recompute prevents noisy neighbor (tenant A's 500-row cascade cannot block tenant B).
- **Rate limit** (PO chốt 2026-07-06): **KHÔNG giới hạn số lần import/ngày**. Giới hạn duy nhất là **500 dòng/lần import** (không phải rule mới — đã có sẵn per ADR-022 §500-row cap → `ERR-INV-048`, enforced 3-layer FE+BFF+BE). PO đã đóng câu hỏi về daily-quota rate-limit — không cần ops-layer throttle.
- **Concurrency cap per tenant** for lock-check outbound: max 20 concurrent REST calls per tenant to gf-accounting (avoid saturating downstream). Circuit breaker per-caller Resilience4j `gf-accounting` config default.
- **No background job impact** — W04 has NO Temporal workflow (gf-inventory-worker only 5 Temporal services per ADR-005; OB import is synchronous). Recompute is intra-request synchronous cascade — bounded by transaction timeout (30s).

## 7. Forbidden Actions

- ❌ Modify `inventory_stock` không qua `InventoryStockService` (vi phạm lock + transaction; race với concurrent reserve/finalize → stock drift).
- ❌ Skip pessimistic lock khi mutate stock (`reserveStockForDelivery`, `finalizeDelivery`, `adjustStock`, `completeReceipt` — race condition phá ledger consistency).
- ❌ Treat `reservedQuantity` as deduction from available stock — per BR-014: `reservedQuantity` là tracking marker ONLY; `availableQuantity = quantity`, KHÔNG phải `quantity - reservedQuantity` (~~HLD-INVENTORY-006~~ resolved; source `StockLevel.getAvailableQuantity`).
- ❌ Modify `gf-purchase` PO state hoặc `gf-sales` SO state từ inventory (chỉ tham chiếu — vi phạm boundary).
- ❌ Receipt complete mà không validate PO quantity (gọi `gf-purchase` `getPOItemsForValidation` — vượt PO phải alert/block).
- ❌ Delivery complete mà không gọi `gf-sales` `getServiceOrderDetail` validate trước (state diverge).
- ❌ Skip `processed_events` check khi consume `branch-lifecycle` event (open HLD-INVENTORY-003 — duplicate tạo branch/warehouse trùng).
- ❌ `TenantSubscriptionCacheListener` ack khi exception mà không gửi DLQ (open HLD-INVENTORY-004 — message mất).
- ❌ Hard-delete `inventory_stock` / `inventory_transaction` / `inventory_receipt` / `inventory_delivery` (audit invariant — `_transaction` là ledger immutable).
- ❌ Period closure không dùng idempotency key `closure-{periodCode}-{tenantId}-{warehouseCode}-{workflowId}` (replay → corrupt period).
- ❌ Public expose `/protected/*` cho UI client (chỉ service-to-service + worker callback).
- ❌ Bật `ddl-auto=update` ở production mà Flyway disabled (open HLD-INVENTORY-001/002 — schema drift).
- ❌ Treat catalog-v2 `internal_product` như replacement của legacy `product` (SKU master) — chúng độc lập per ADR-017; mapping qua `internal_product_sku_mapping` scalar FK. KHÔNG `@ManyToOne` cross-aggregate.
- ❌ Sửa `material_group.parent_id` thành chính nó hoặc descendant của nó (BR-CAT-GRP-009 — vòng lặp phân cấp). Phải recursive CTE ancestor-check trước UPDATE → `ERR-INV-003`.
- ❌ Bypass row cap 500 trong `verify-import`/`import` endpoints (ADR-018 Phase 1 limit) — defensive enforce ở BE + BFF.
- ❌ Parse `.xlsx` server-side cho FEAT-CAT-PROD-IMPORT — FE parse browser-side (per ADR-018); BE chỉ JSON validation.
- ❌ Lookup Unit bằng cách query local table — không có `unit` / `unit_of_measure` table trong gf-inventory; phải call gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=UNIT` (Q3 cleared + R8 D-A/E canonical).
- ❌ Lookup Brand bằng cách query local table hoặc accept free-text trên `internal_product.brand_code` (R8 D-C) — phải call gf-erp-mdm `/protected/catalog/v1/inquiry` với `directory=BRAND`. Free-text → reject 400.
- ❌ Skip `@FeatureOn(INVENTORY_STOCK)` gate trên flow stock/receipt/delivery/period (tenant chưa enable sẽ chạy nhầm).
- ❌ Skip `@FeatureOn(Inventory:InventoryV2)` gate trên catalog v2 (`MaterialGroupController` + `InternalProductController`, W03) / opening-balance (`OpeningBalanceController`, W04) controllers (tenant chưa enable sẽ chạy nhầm subsystem V2 — Product spec EP-INVENTORY-OPENING-BALANCE §5.2 v3 + user chốt scope 2026-07-06).
- ❌ **(W04)** Bypass `StockLedgerRecomputeService` khi ghi trực tiếp `inventory_stock_ledger` — vi phạm shared-engine invariant (BR-STKV2-005a); mọi write-path phải gọi engine theo method surface M1 (per-key) hoặc M2 (bulk) trong [ADR-020 §Component Interface C1](../decisions/ADR-020-stock-ledger-daily-snapshot.md). Caller multi-key BẮT BUỘC dùng M2 (bulk) để ordered lock acquisition tránh deadlock cross-key.
- ❌ **(W04)** Persist row `inventory_stock_ledger` với `closing_qty < 0` — engine phải reject qua exception thuộc category `NegativeStock` (errorCode `ERR-INV-036`, carrier fields `offendingDate + currentClosing + attemptedDelta` per [ADR-020 §Component Interface C5](../decisions/ADR-020-stock-ledger-daily-snapshot.md)) và rollback caller transaction (BR-STKV2-005a bước 4).
- ❌ **(W04)** Bỏ qua reentrancy blocking / ordered lock acquisition trong M2 — engine phải mechanical block reentry (engine gọi engine) + sort commands theo `(productCode ASC, warehouseCode ASC)` ASCII trước khi acquire lock; caller code KHÔNG được tự loop M1 per-key thay M2 (mất ordered lock property → deadlock risk khi 2 concurrent bulk imports lock ngược thứ tự). Cite [ADR-020 §Component Interface C6](../decisions/ADR-020-stock-ledger-daily-snapshot.md).
- ❌ **(W04)** Skip `X-Idempotency-Key` header trên `POST /import` — client bắt buộc gửi; server dedup 24h via `processed_events` (ADR-022). Không có key → 400.
- ❌ **(W04)** Partial commit trong `POST /import` — vi phạm BR-OB-004a all-or-nothing (ADR-022 single transaction rollback).
- ❌ **(W04)** Parse `.xlsx` server-side cho OB import (mirror ADR-018/ADR-022 FE-parses-browser-side rule).
- ❌ **(W04)** Fail-OPEN khi gf-accounting lock-check down trong commit path — vi phạm ADR-021 fail-CLOSED decision cho OB commit; verify-preview vẫn fail-OPEN với marker để UX.
- ❌ **(W04)** Modify legacy `inventory_stock` từ OB write-path — hai ledger co-exist độc lập (ADR-020 co-exist decision).
- ❌ **(W04)** Persist OB row mà bypass unique `(tenant_id, product_id, warehouse_id)` guard (BR-OB-012) — DB constraint tin cậy; app-layer check first cho friendly `ERR-INV-034` message.
- ❌ Cấp Google API key/cx cho non-internal caller (open HLD-INVENTORY-008 — blast radius).
- ❌ Multi-instance OutboxScheduler cùng poll mà không atomic claim query (open HLD-INVENTORY-005 — duplicate publish).
- ❌ Expose reverse receipt/delivery public endpoint khi chưa chốt contract (open HLD-INVENTORY-007 — REVERSED status đã có, endpoints vẫn commented out).

## 8. References

- **TECHSTACK**: §inventory-truth, §temporal-pattern, §outbox-inbox, §kafka, §http-client, §runtime
- **API spec**: [gf-inventory-api.md](../api/gf-inventory-api.md) — 50 public + 45 protected = 95 total endpoints.
- **Events spec**: [inventory-events.md](../events/inventory-events.md) — outbound `WAREHOUSE_CREATED` (only event reaching Kafka); inbound `branch-lifecycle` + `tenant-provisioning`.
- **Workflows**:
  - [inventory-receipt-fulfillment-flow.md](../workflows/inventory-receipt-fulfillment-flow.md)
  - [inventory-delivery-fulfillment-flow.md](../workflows/inventory-delivery-fulfillment-flow.md)
  - [reservation-expiry-flow.md](../workflows/reservation-expiry-flow.md)
  - [inventory-period-closure-flow.md](../workflows/inventory-period-closure-flow.md)
- **Data model**: [gf-inventory-data-model.md](../data/gf-inventory-data-model.md) — 32 entities, Flyway migrations + ddl-auto=update.
- **Business rules**: BR-GF-INVENTORY-001..019 (in KG `gf-inventory.knowledge-graph.yaml`).
- **Cross-link HLD**:
  - [gf-inventory-worker-HLD.md](gf-inventory-worker-HLD.md) — sister Fat API/Thin Worker
  - [gf-purchase-HLD.md](gf-purchase-HLD.md) — PO source + receipt validation
  - [gf-sales-HLD.md](gf-sales-HLD.md) — SO source + delivery validation
  - [gf-erp-mdm-HLD.md](gf-erp-mdm-HLD.md) — catalog/PIM source
  - [gf-system-HLD.md](gf-system-HLD.md) — branch-lifecycle event source
  - [gf-notification-HLD.md](gf-notification-HLD.md) — 5 INVENTORY_* notification consumer


## Change Log

| Date | Version | Summary |
| 2026-07-08 | v18 | **W04 doc-nav cascade — Stock Ledger V2 row v22 uniform formula** đồng bộ ADR-020 v5→v6 + data-model v21→v22. §5 Data Ownership row "Stock Ledger V2" reword: row đầu chuỗi từ "`closing_qty` given từ `opening_balance_line`" → "`inbound_qty=OB.quantity_on_hand`, `inbound_value=OB.value_on_hand` (OB là 'nhập lần đầu'), `closing_*` = running formula uniform cho MỌI row" per user quannn 2026-07-08 "inbound_qty, inbound_value sẽ là số lượng nhập từ import vào, Công thức tính tồn cuối closing_qty/closing_value: Tồn cuối của dòng trên trước đó + Nhập - Xuất" + AskUserQuestion resolve "OB tính như 'Nhập trong kỳ'" (override v21 double-count rationale). Extend row description ghi rõ NXT report BR-STKV2-010 `SUM(inbound_*)` **bao gồm** OB row (v22 semantic). Additive-only, KHÔNG đổi §1..§4, §6, §6b, §7 Forbidden 3 rule W04 (cross-ref ADR-020 §Component Interface C1/C5/C6 semantic không đổi — chỉ nội dung field row đổi). v17 → v18. |
| 2026-07-07 | v17 | **W04 doc-nav cascade — refactor §7 Forbidden 3 rule W04 sang semantic label** đồng bộ ADR-020 v3→v4 (strip Java code, giữ logic contract). Refactor 3 rule wording: (1) rule bypass service — replace `recompute()` / `recomputeBatch()` (Java method name) bằng "method surface M1 (per-key) / M2 (bulk)"; (2) rule closing_qty<0 — replace `NegativeStockException` (Java class name) bằng "exception thuộc category `NegativeStock`" (per ADR-020 v4 C5 category taxonomy); (3) rule reentrancy — replace `ThreadLocal guard` (Java implementation) + `recompute()/recomputeBatch()` bằng "reentrancy blocking (mechanical)" + "method surface M1/M2". Anchor label cross-ref ADR-020 §Component Interface C1/C5/C6 giữ nguyên (v4 giữ label — chỉ đổi content sub-section). Additive-only, KHÔNG đổi behavior. v16 → v17. |
| 2026-07-07 | v16 | **W04 doc-nav cascade — §7 Forbidden 3 rule W04 cross-ref ADR-020 §Component Interface**. Pair với ADR-020 v2→v3 vừa bump (thêm §Component Interface C1-C8 — formal method contract/DTO cho `StockLedgerRecomputeService`). §7 Forbidden update: (1) rule bypass service — cite `ADR-020 §Component Interface C1` (interface `recompute()` + `recomputeBatch()`); (2) rule closing_qty<0 — cite `ADR-020 §Component Interface C5` (`NegativeStockException` carry `offendingDate + currentClosing + attemptedDelta`); (3) THÊM rule mới W04 về reentrancy/order lock — cite `ADR-020 §Component Interface C6` (ThreadLocal reentrancy guard + ordered lock acquisition ASCII trong `recomputeBatch()` tránh deadlock cross-key). Additive-only, KHÔNG đổi behavior. Không đụng §1..§6b, §5 Data Ownership, §Change Log entries cũ. v15 → v16. |
|---|---|---|
| 2026-07-06 | v15 | **W04 Q3 fix — User chốt 2026-07-06 mở rộng scope `@FeatureOn(Inventory:InventoryV2)` cover cả W03 catalog v2 + W04 opening balance (đồng bộ pattern legacy `INVENTORY_STOCK` cover multi-controller)**. Audit độc lập phát hiện Q3 còn treo. Sửa 3 điểm ở gf-inventory-HLD.md: (1) §3 Key Design Decisions: THÊM row mới `@FeatureOn(Inventory:InventoryV2) gate V2 subsystem (W03 + W04)` song song row legacy `@FeatureOn(INVENTORY_STOCK)` — enum controllers: catalog v2 (`MaterialGroupController` + `InternalProductController`, W03), Opening Balance (`OpeningBalanceController`, W04), future RECEIPT-V2/DELIVERY-V2/PRC (W05/W06); cite EP-INVENTORY-OPENING-BALANCE §5.2 v3 + BR-GF-INVENTORY §6.6 v3 + CR-1782974034; note naming `Inventory:InventoryV2` trần theo Product spec. (2) §6 Quality Attributes row `Feature gate`: mở rộng từ chỉ mention `INVENTORY_STOCK` sang bao gồm `Inventory:InventoryV2 on catalog v2 + OpeningBalanceController + future W05/W06 controllers`. (3) §7 Forbidden: THÊM rule "Skip `@FeatureOn(Inventory:InventoryV2)` gate trên catalog v2 (W03) / opening-balance (W04) controllers" song song rule legacy về `INVENTORY_STOCK`. **Doc-only update** — annotation `@FeatureOn(Inventory:InventoryV2)` đã được Product yêu cầu ở EP §5.2 v3 từ 2026-07-02; nếu code W03 production chưa có annotation này thì cần CR bổ sung (không phải architect responsibility — dev team confirm). Pair với `gf-inventory-api v39` (§3a/§3b intro bullets Feature Flag) + `INTEG-EXT-gf-inventory v11` (§13b.7 S-W04-2 → R-W04-2 Resolved). **KHÔNG đụng Product docs** (EP §5.2 v3 đã có sẵn); **KHÔNG đụng file khác** — feature flag là controller-level annotation, không ảnh hưởng data-model/events/GraphQL/naming registry/dependencies inbound. v14 → v15. |
| 2026-07-06 | v14 | **W04 PO decision — close P2 #1 rate-limit OB import (from `Tracking/ARCH-REVIEW-W04.md` Pass 1/2/3)**. PO chốt 2026-07-06: KHÔNG giới hạn số lần import/ngày; giới hạn duy nhất là **500 dòng/lần import** (không phải rule mới — đã có sẵn theo ADR-022 §500-row cap → `ERR-INV-048`, enforced 3-layer FE+BFF+BE). Sửa đúng 1 bullet "Rate limit" trong §6b.6 Tenant fairness: gỡ hoàn toàn wording "(proposal — deferred to ops layer): 1 concurrent OB import per tenant, 10/day soft limit. **NEEDS CONFIRMATION** with ops team" — thay bằng nội dung đã chốt cite ADR-022 + `ERR-INV-048`. **Không đụng** 3 bullet còn lại của §6b.6 (Redisson lock per-(tenant, product, warehouse) — race safety; lock-check concurrency cap 20 REST — downstream circuit-breaker; No background job impact — Temporal-not-applicable note) vì thuộc phạm trù khác câu hỏi rate-limit-theo-ngày. Không đụng file khác. v13 → v14. |
| 2026-07-06 | v13 | **W04 — Add opening-balance + stock-ledger subsystems** — §1 callout thêm 2 subsystem mới độc lập với legacy `inventory_stock`: (a) `opening-balance` (entity `opening_balance_line`, 7 REST endpoints `/api/v2/opening-balances/*`, 2-step wizard extends ADR-018 + all-or-nothing BR-OB-004a + idempotency key, cascade sổ tồn atomic ADR-020); (b) `stock-ledger` (entity `inventory_stock_ledger`, daily-snapshot point-in-time projection per BR-STKV2-001, shared engine `StockLedgerRecomputeService` implementing BR-STKV2-005a 4-step algorithm, Redisson lock per key); (c) cross-boundary lock-check via `gfAccountingClient` REST advisory pattern reuse ADR-019 (fail-CLOSED commit + 30s LRU cache). Co-exist với legacy V1 (không mirror, không replace). §5 Data Ownership add 3 rows (V1 legacy renamed, V2 opening_balance, V2 stock_ledger). **§6b Performance & Scale** mandatory section: expected load (5 QPS list, 500-row cap), pagination (cursor > 10k, offset ≤ 10k), 9 indexes tenant-prefix bắt buộc, cache Caffeine 30s lock-check + 5min catalog, N+1 avoidance via denorm + batch-in queries + BFF DataLoader, tenant fairness Redisson per-key + circuit breaker per-caller. §7 Forbidden thêm 8 rules W04-guard. FEAT-INV-MOBILE-MENU nhắc trong §1 callout (mobile hub, zero BE impact). depends_on thêm ADR-020/021/022. v12 → v13. |
| 2026-06-26 | v12 | **R29 — Sync 2 BA updates 2026-06-26 cho EP-INVENTORY-CATALOG (W03)** — (a) **Nhóm vật tư bỏ tree view**: §1 callout `catalog-v2` entity `material_group` ADD clause "UI render trải phẳng (V2-1 canonical), V2-2 `GET /tree` reserved future KHÔNG dùng UI W03". Hierarchy storage (adjacency-list parent_id self-FK) KHÔNG đổi — chỉ UI render đổi. Cascade FEAT-CAT-GRP-LIST v6 + UX-FLOW-INVENTORY-CATALOG v9 + PKG-W03 v16 R16 (mobile flat) + web G4 (web flat). (b) **Cascade BR-CAT-PROD-011 v15 precision constraint**: §1 `internal_product_conversion_unit` entity ADD note `conversion_rate` NUMERIC(18,6) + app-layer guard ≤6 chữ số thập phân → mã lỗi mới `ERR-INV-047` (Product `ERROR-CODE-REGISTRY v16` line 145). Lý do: PostgreSQL silently rounds vượt scale → BE phải guard trước save. KHÔNG đụng data ownership / forbidden rules / state machines. Cascade gf-inventory-api v24 + data-model v19 + agg-garage-graph-graphql v7.30 + PKG-W03 v19. v11 → v12. |
| 2026-06-24 | v11 | **R13 — Rename `PricingMethod` enum codes per BA labels (per Delivery Authority feedback 2026-06-24)** — §5 state machine row: `WAC_PERIOD_END/SPECIFIC_ID/FIFO/WAC_REALTIME` → `PWA/SI/FIFO/MA` với Vietnamese labels (PWA=Bình quân cuối kỳ default+active, SI=Đích danh, FIFO=Nhập trước xuất trước, MA=Bình quân tức thời placeholder). BR-CAT-PROD-010 lock semantic preserved. Sync data-model v14 + api v14 + graphql v7.17. v10 → v11. |
| 2026-06-24 | v10 | **R11 — internal_product +description/notes + attachment client-uploads-to-S3 (per Delivery Authority feedback 2026-06-24)** — §5 Data Ownership Catalog V2 row: add `description` + `notes` cols mention. §7 Forbidden: clarify backend KHÔNG xử lý S3 binary cho V2-18 attachment (FE-uploads-to-S3 pattern, ADR-016 presigned URL) + V2-19 DB-only delete (no S3 object delete; OQ14 cleanup strategy DEV/Ops scope). Sync data-model v13 + api v13 + graphql v7.16. OQ13 BA labels confirm + OQ14 S3 cleanup. v9 → v10. |
| 2026-06-24 | v9 | **R10 — V2-7 POST/search + REMOVE `internal_product_history` (per Delivery Authority feedback 2026-06-24)** — §1 callout `catalog-v2` entities list: remove `internal_product_history` + add R10 note (BA chốt no history audit, standard audit cols sufficient); API surface V2-1/V2-7 search marked POST `/search` per R7/R10. §5 Data Ownership row Catalog V2: remove `internal_product_history` from entities; R10 note inline. Sync data-model v12 + api v12 + graphql v7.15 + INTEG-FE v13. OQ12: BA self-handle FEAT-CAT-PROD-DETAIL Tab "Lịch sử" + BR-CAT-CMN-001. v8 → v9. |
| 2026-06-24 | v8 | **R9 — Rename `internal_product_sku_mapping.sku_id` → `product_id` (FK column tường minh per Delivery Authority 2026-06-24)** — §5 Data Ownership row Catalog V2: `UNIQUE sku_id` → `UNIQUE product_id` per R9; column name align với referenced table (legacy `product.id`). Business term "SKU" preserved trong BR/UX/error codes/path resource. Sync data-model v11 + api v11 + graphql v7.14 + INTEG-FE v12. v7 → v8. |
| 2026-06-24 | v7 | **R8 — `internal_product` 4 fixes + global rename `uom` → `unit` (post-ratify additive refinement)** — §1 callout `catalog-v2` entities row updated: `main_unit_code` (R8 D-A/E), `nature` enum English keys `GOODS/TOOL/SERVICE/OTHER` (R8 D-B), `brand_code` validated-vs-catalog (R8 D-C), `image_url` S3 path (R8 D-D), `internal_product_conversion_unit` table rename (R8 D-E); API surface row add `/conversion-units/*` path; cross-boundary touch row expanded: gf-erp-mdm catalog READ cho **Unit + Brand** (`directory=UNIT` + `directory=BRAND` — UoM `directory=UNIT_OF_MEASURE` deprecated per R8 D-A/E canonical decision); §5 Data Ownership Catalog V2 row enumerates new fields + table rename; §5 state machine `ProductNature` enum keys English; §7 Forbidden: replace UoM lookup rule (`directory=UNIT` canonical) + add new Brand lookup forbidden rule (R8 D-C — no local table, no free-text). Pair: gf-inventory-api v10 + gf-inventory-data-model v10 + INTEG-EXT-gf-inventory v5 + agg-garage-graph-graphql v7.13 + agg-garage-graph-HLD v9. v6 → v7. |
| 2026-06-23 | v6 | **R4 — Strip AP scope (Boundary correction — AP moved to gf-accounting wave per Delivery Authority decision 2026-06-23)** — Remove §1 callout subsystem `accounting-period` (kept catalog-v2 only); §5 Data Ownership row `Accounting Period`; §5 state machines `AccountingPeriodStatus/Type`; §7 Forbidden rule AP-publish; R3 F7 disambiguation parenthetical (now N/A — `inventory_period_stock` legacy WAC ledger stays as sole period concept trong boundary). `depends_on` remove ADR-019. Catalog v2 design (12 features, 6 entities, V2-1..V2-23, ADR-017/018) intact. |
| 2026-06-23 | v5 | **R3 F7 — Data Ownership clarification** — §5 Data Ownership row `Accounting Period`: parenthetical note xác lập **distinction** giữa `accounting_period` (AP, ADR-019 — date-range lock cho slip-date / RECEIPT-V2/DELIVERY-V2/PRC future guard) vs legacy `inventory_period_stock` (closure WAC ledger). Hai concept không overlap, riêng aggregate, riêng lifecycle. |
| 2026-06-23 | v4 | **Inventory V2 catalog-v2 + AP slice (DESIGN)** — thêm 2 subsystem mới: (1) `catalog-v2` per ADR-017 — 6 new tables (`material_group`, `internal_product`, `internal_product_conversion_uom`, `internal_product_sku_mapping`, `internal_product_attachment`, `internal_product_history`); legacy `product` giữ nguyên (SKU master); API `/api/v2/material-groups/*` + `/api/v2/internal-products/*` + bulk-import per ADR-018; (2) `accounting-period` per ADR-019 — table `accounting_period` (YEAR→QUARTER→MONTH hierarchy); API `/api/v2/accounting-periods/*` + `lock-check` ACTIVE; events `AccountingPeriodClosed/Reopened` declared PROPOSED. Cross-boundary touch duy nhất: gf-erp-mdm catalog READ cho UoM (no schema change). §1 thêm subsystem note; §5 Data Ownership thêm 2 nhóm aggregate; §5 State machines thêm 7 enum mới; §7 Forbidden thêm 7 rules guard catalog-v2/AP. depends_on thêm 3 ADR. |
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (REST Controllers có tên + Consumers/Scheduler → APP/DOMAIN 8 services → JPA/Kafka/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-purchase·gf-sales·gf-erp-mdm·ct-saas-tenant·gf-notification·gf-inventory-worker·Google Custom Search; Temporal interface note + @FeatureOn(INVENTORY_STOCK); Kafka P/C ở infra footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 (diagram + decisions + quality); (F-02) CRITICAL fix reservation semantics — `reservedQuantity` là tracking marker ONLY, `availableQuantity = quantity` (BR-014), ~~HLD-INVENTORY-006~~ resolved; (F-03) thêm negative stock ALLOWED design decision; (F-04) fix ReservationStatus PENDING→ACTIVE + thêm CANCELLED; (F-05) fix PeriodStockStatus bỏ CLOSING (OPEN→CLOSED→ADJUSTED); (F-06) feature flag granularity — NOT all controllers gated; (F-07) thêm gf-erp-agent inbound caller; (F-08) API count 50 public + 45 protected = 95 total; (F-09) outbox event routing clarification — chỉ WAREHOUSE_CREATED reaches Kafka; (F-10) Temporal workflow clarifications (PeriodStockAdjustment = sync only); (F-11) trim diagram + compress cho line budget ≤250. |
| 2026-05-07 | v1 | Initial HLD cho `gf-inventory`: SoT domain kho Garage 32 entities, public REST `/api/v1..v2/*` + protected `/protected/*`, Kafka in `branch-lifecycle` + `tenant-provisioning`, out `WAREHOUSE_CREATED` + outbox, Temporal interface (worker ở `gf-inventory-worker`), reservation TTL ecommerce 30min/direct 3min, downstream `gf-purchase`/`gf-sales`/`gf-erp-mdm`/`ct-saas-tenant`/`gf-notification`/Google, Redisson lock + DB pessimistic lock. |
