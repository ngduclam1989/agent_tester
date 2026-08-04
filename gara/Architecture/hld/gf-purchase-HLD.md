---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-purchase
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-purchase-api.md
  - ../events/purchase-events.md
  - ../data/gf-purchase-data-model.md
---

# HLD — `gf-purchase`

## 1. Overview

`gf-purchase` là service T1 phụ trách **domain mua hàng** của Garage — cornerstone procurement service. Service điều phối lifecycle từ **quotation ask → quotation bid/pricing → purchase request → purchase order → receipt → settlement/payment**, hỗ trợ **5 purchase channels** (`QUOTATION_ASK`, `CART`, `CHAT`, `DIRECT`, `ECOMMERCE`), nhiều API version song song (V1/V2/V3), và **direct PO state machine** với transition rules. Tích hợp downstream services (tenant, agent, inventory, system, OCR, payment gateway, shipment), AWS KMS cho encrypt payment data, và outbox/inbox cho event durability.

**Trách nhiệm:**
- Quotation lifecycle: ask + bid + pricing request/proposal + preliminary quotation + OCR đăng ký xe.
- Purchase request: tạo từ cart/quotation, confirm/cancel, checkout QR/CC, place order, prepaid/postpaid/COD reconciliation.
- Purchase order: tạo từ PR, update stage/status, confirm received với receipt validation từ `gf-inventory`, supplier name lookup.
- Direct purchase order: state machine WAIT_TO_CONFIRM → OPEN → DELIVERING → CLOSED với cancellation/return reasons.
- Supplier CRUD (tenant-scoped, onboard source `GARAGE` / `CARDOCTOR`).
- Cart, user preferences/cards (KMS encrypt), feature flags mobile, dashboard + realtime.
- Payment reconciliation: 4 strategies (`COD`, `POST_PAID_QR`, `PRE_PAID_QR`, `PRE_PAID_CC`).
- Outbox publish `purchase-order-events`, batch retry qua protected API.

**Owned epic**: cross-cutting procurement — cornerstone cho commerce flow. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌─────────── gf-purchase  (Java 21 · Spring Boot 3.5.0) ────────────┐
│  ┌─ REST Controllers ───────────────────────┐ ┌─────────────┐     │
│  │ QuotationAskCtrl·QuotationAskPricingCtrl· │ │ Kafka       │    │
│  │ PurchaseRequestCtrl·PurchaseOrderCtrl·    │ │ MessageEvent│    │
│  │ DirectPurchaseOrderCtrl·SupplierCtrl·     │ │ Listener +  │    │
│  │ CartCtrl·DashboardRealTime/Statistics·    │ │ handlers:   │    │
│  │ Cache·FeatureFlag·User·Variables·Tenant   │ │ OrderState· │    │
│  │ Internal: Purchase·Quotation·Batch (x-api)│ │ Preliminary·│    │
│  │ Webhook ◄ gf-shipment (DELIVERED)         │ │ QuotationAsk│    │
│  └────────────────────┬──────────────────────┘ └──────┬──────┘    │
│  ┌────────────────────▼───────────────────────────────▼─────┐     │
│  │ APP / DOMAIN SERVICES                                    │     │
│  │  QuotationService·PurchaseRequestService·                │     │
│  │  PurchaseOrderService·DirectPurchaseOrderService         │     │
│  │   (state machine WAIT_TO_CONFIRM→OPEN→DELIVERING→CLOSED) │     │
│  │  ReconciliationService (4 strategies)·OutboxService      │     │
│  └─────┬─────────────────────────────────────┬─────────────┘      │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐                  │
│  │ JPA/Flyway │ │ Kafka outbox │ │ HttpClients │                  │
│  │[dev-gf-pur]│ │ +producer    │ │ (x-api-key, │──────────────────┼─► ct-saas-tenant
│  │ ddl+Flyway │ │ purchase-    │ │  R4j)       │──────────────────┼─► gf-erp-agent (quotation/PR/PO sync)
│  │ V1.0.0-13  │ │ order-events │ │             │──────────────────┼─► gf-inventory (product/receipt)
│  │            │ │              │ │             │──────────────────┼─► gf-system (invoice/transport)
│  │            │ │              │ │             │──────────────────┼─► ocr-car-registration (vehicle OCR)
│  │            │ │              │ │             │──────────────────┼─► ac-payment-gateway (QR/CC, Bearer)
│  └─────┬──────┘ └──────┬───────┘ └─────────────┘──────────────────┼─► AWS KMS (user_cards encrypt · PCI)
│  Feature flags: Marketplace:QuotationConsultant ·                 │
│   Inventory:InventoryStockV01·DirectPurchase:V01·Dashboard        │
│  outbox │ /api/v1/* (55) │ /protected/* (46) │ Actuator+OTLP      │
└───────┴──────────────┴────────────────────────────────────────────┘
        ▼                      ▼
   PostgreSQL [dev-gf-purchase]    Kafka P: purchase-order-events
   30+ tables · ddl+Flyway         (PO DELIVERED.2) ;
   + Redis (cache TTL 600s)        C: — (webhook + REST inbound)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| V1/V2/V3 APIs cùng tồn tại | Backward compat cho client web/mobile/internal callers | open HLD-PURCHASE-001 (deprecation policy) |
| Tách public + protected APIs | Public cho client/UI; protected cho `gf-erp-agent` + `gf-inventory` + `gf-shipment` + `gf-sales` + `gf-system` | TECHSTACK §security |
| Direct PO dùng cùng `purchase_orders` aggregate (`source=DIRECT`) | Tận dụng PO entity hiện có; thêm field direct + state machine | source `PurchaseOrderStateMachine` |
| State machine cho Direct PO với required reasons | `CANCELLED` cần `cancellationReason`, `RETURNED` cần `returnReason` — audit invariant | source `transitionTo` (BR-012) |
| Outbox publish event (publish sau commit qua AFTER_COMMIT listener) | Tránh publish Kafka trước khi DB commit; idempotent retry | TECHSTACK §outbox (BR-015) |
| Payment gateway là **downstream**, KHÔNG là SoT | gf-purchase giữ state PR/PO/payment order nội bộ; gateway chỉ tạo payment order QR/CC | source `ac-payment-gateway` |
| AWS KMS cho user_cards token encryption | PCI scope giảm — chỉ token encrypted at rest | open HLD-PURCHASE-010 |
| 5 purchase channels qua `PurchaseSource` enum | Phân biệt origin để routing logic + reporting | source `PurchaseSource` enum |
| `Inventory:InventoryStockV01` flag gate inventory event | Direct PO `DELIVERING` chỉ publish event khi flag bật (BR-014) | source `DirectPurchaseOrderService` |
| Reconciliation 4 strategies tách | `COD`, `POST_PAID_QR`, `PRE_PAID_QR`, `PRE_PAID_CC` có business rule khác — Strategy pattern (BR-009) | source `app.service.reconciliation` |
| JPA `ddl-auto=update` + Flyway V1.0.0 trống | Legacy state — schema dependent on JPA update | open HLD-PURCHASE-002 (cao) |
| Java 21 + Spring Boot 3.5.0 | Align với toàn bộ platform services | TECHSTACK §runtime |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF) | Sync REST `/api/v1..v3/*` (JWT + feature flag) | Cart, quotation, PR, PO, direct PO, supplier, dashboard, user/preferences/cards |
| `gf-erp-agent` | Sync REST `/protected/v1/*` (x-api-key) | Quotation bid, pricing proposal, preliminary, PO/PR status/stage update, reconciliation prepaid/postpaid/COD |
| `gf-inventory` | Sync REST `/protected/v1/purchase-orders/{code}/items` (X-Tenant-ID) | PO items for receipt validation |
| `gf-shipment` | Sync REST `/protected/v1/purchase-orders/status` (x-api-key) | Notify PO DELIVERED when shipment closed |
| `gf-sales` | Sync REST `/protected/v1/quotation-asks` (x-api-key) | Quotation ask lookup by codes |
| `gf-system` | Sync REST `/protected/v1/purchase-orders/transport-routes/{id}/used` (x-api-key) | Transport route usage check |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `ct-saas-tenant` | Sync REST + x-api-key | Tenant info, current user, privacy/ecommerce confirmations |
| `gf-erp-agent` | Sync REST + x-api-key | Quotation/PR/PO sync (create, pricing, confirm, cancel, confirm-received) |
| `gf-inventory` | Sync REST + x-api-key | Product line, batch product, PO receipt summary |
| `gf-system` | Sync REST + x-api-key | Tenant invoice info + branch/sequence lookup |
| `ocr-car-registration` | Sync REST + token-ocr | OCR đăng ký xe (upload + URL) |
| `ac-payment-gateway` | Sync REST + Bearer JWT forward | `POST /api/payments/create` QR/CC |
| Kafka `purchase-order-events` | Async publish (via outbox) | `PurchaseOrderStatusChangedEvent` headers `MessageGroup=PO`, `MessageStep=DELIVERED.2` |
| AWS KMS | Sync API | Payment data encrypt/decrypt (`user_cards` token) |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev-gf-purchase}` — 30+ tables |
| Redis | Cache | TTL 600s, invalidation theo tenant/code/id/user |
| Actuator + OTLP | Observability | Health/metrics + tracing |

> **KHÔNG có active Kafka listener** — `InboundMessageService` có infrastructure nhưng business handler chưa wire (open HLD-PURCHASE-004).

## 5. Data Ownership

**Owned (PostgreSQL `dev-gf-purchase` schema)** — chi tiết physical schema xem [data/gf-purchase-data-model.md](../data/gf-purchase-data-model.md):

| Aggregate group | Tables |
|---|---|
| Quotation ask | `quotation_asks`, `asked_vehicles`, `asked_spare_parts`, `asked_attachments`, `quotation_ask_histories`, `quotation_ask_history_items`, `ocr_vehicle_info_history` |
| Quotation bid | `quotation_bids`, `bidded_spare_parts`, `spare_part_price_line_items`, `added_spare_part_price_line_items` |
| Pricing/preliminary | `quotation_asks_pricing_request`, `asked_spare_parts_pricing_request`, `quotation_asks_pricing_proposal`, `asked_spare_parts_pricing_proposal`, `preliminary_quotations` |
| Purchase request | `cart`, `purchase_request`, `purchase_request_data`, `purchase_request_confirmations`, `pr_quotation_ref`, `pr_transition_history` |
| Purchase order | `purchase_orders`, `purchase_order_items`, `purchase_order_attachments`, `po_products`, `po_supplier`, `po_quotation_ref`, `po_transition_history` |
| Supplier/user/payment | `suppliers`, `user_preferences`, `user_cards`, `payment_orders`, `payment_balances` |
| Messaging/runtime | `inbound_messages`, `outbound_messages`, `sequences` |

**Direct PO state machine**:

```
WAIT_TO_CONFIRM ──► OPEN ──► DELIVERING ──► CLOSED (terminal)
     │                │           │
     │                └──► CANCELLED (cancellationReason required)
     └──► CANCELLED        │
                           └──► RETURNED (returnReason required)
```

**Tenant strategy**: `quotation_asks`, pricing, supplier có `tenant_id` direct. `purchase_orders` direct PO: `tenant_id`; legacy/ecommerce: qua `purchaser_id`. Child tables (attachment, history, po_supplier, po_quotation_ref) ⚠️ không có `tenant_id` — phải filter qua parent aggregate (open HLD-PURCHASE-003). `user_cards` user-scoped only. `outbound_messages`/`inbound_messages` tenant trong payload.

**KHÔNG own**: Inventory receipt + tồn kho (`gf-inventory`), service order (`gf-sales`), ERP orchestration (`gf-erp-agent`), OCR engine (`ocr-car-registration`), payment gateway ledger (`ac-payment-gateway`), tenant/user authority (`ct-saas-tenant`).

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Quotation ask create p95 (incl. agent handoff) | ≤ 1s |
| PR create p95 (V2 incl. validation + agent sync) | ≤ 1.2s |
| PO create p95 (from confirmed PR) | ≤ 800ms |
| Direct PO state transition p95 | ≤ 400ms |
| Confirm received p95 (incl. inventory + agent) | ≤ 1.5s |
| Checkout QR/CC p95 (incl. payment gateway) | ≤ 2s |
| Reconciliation prepaid/postpaid p95 | ≤ 600ms |
| Search PO V3 p95 (paged) | ≤ 500ms |
| Dashboard realtime count p95 | ≤ 200ms (Redis hit) |
| Outbox immediate publish (AFTER_COMMIT) | ≤ 200ms |
| Outbox max retry / batch size | 5 / 10 |
| Redis cache TTL | 600s (key prefix `${APP_ENVIRONMENT}-${spring.application.name}`) |
| Async executor | Virtual thread `listenerTaskExecutor` |
| Payment enabled methods | `POST_PAID_QR`, `PRE_PAID_QR`, `PRE_PAID_CC` |
| AWS KMS | `aws.kms.enabled=true`, key từ `PAYMENT_ENCRYPT_KEY` env |
| Multi-replica | Safe — outbox + Redis cache support |
| Schema migration | ⚠️ Flyway V1.0.0..V1.0.13 (V1.0.0 trống) + JPA `ddl-auto=update` (open HLD-PURCHASE-002) |
| Test API guard | `app.test-api-enabled=false` mặc định |
| Runtime | Java 21, Spring Boot 3.5.0 |

## 7. Forbidden Actions

- ❌ V1/V2/V3 cùng ghi vào 1 PR/PO concurrent — chưa có aggregate-level lock (open HLD-PURCHASE-001).
- ❌ Direct PO transition không qua `PurchaseOrderStateMachine.validateTransition` (BR-012).
- ❌ Transition `CANCELLED` không có `cancellationReason` / `RETURNED` không có `returnReason` (BR-012).
- ❌ Hard-delete `purchase_request`, `purchase_orders`, `quotation_asks`, `payment_orders` (audit invariant).
- ❌ Bypass outbox để `kafkaTemplate.send()` trực tiếp trong transaction (BR-015).
- ❌ Skip `AFTER_COMMIT` listener cho outbox publish (BR-015).
- ❌ Query child tables không qua parent aggregate filter (open HLD-PURCHASE-003 — cross-tenant leak).
- ❌ Log raw `user_cards.token_num` / `token_exp` / payment payload (PCI — open HLD-PURCHASE-010).
- ❌ Public expose testing API — `app.test-api-enabled=false` production (open HLD-PURCHASE-006).
- ❌ Public expose `DELETE /protected/v1/cache/*` cho non-internal caller (open HLD-PURCHASE-005).
- ❌ Forward Bearer JWT thẳng qua `PaymentGatewayClient` mà không validate scope.
- ❌ Hardcode `INTERNAL_API_KEY` / `INTERNAL_TOKEN_OCR` / `PAYMENT_ENCRYPT_KEY` trong source.
- ❌ Bật `ddl-auto=update` ở production mà không baseline DDL (open HLD-PURCHASE-002).
- ❌ Mark inbound message `COMPLETED` mà không thực thi business handler (open HLD-PURCHASE-004).
- ❌ Lưu `payment_orders.totalAmount` / `payment_balances.amount` dạng string không validate format (open HLD-PURCHASE-007).

## 8. References

- **TECHSTACK**: §outbox, §security, §kms-payment, §http-client, §state-machine, §runtime
- **API spec**: [gf-purchase-api.md](../api/gf-purchase-api.md) — 153 endpoints: 55 active + 46 deprecated (V1→V2→V3) + 46 internal + 6 unused.
- **Events spec**: [purchase-events.md](../events/purchase-events.md) — outbound `purchase-order-events` topic, `PurchaseOrderStatusChangedEvent` payload, headers `MessageGroup=PO`, `MessageStep=DELIVERED.2`.
- **Workflows**: [purchase-request-order-flow.md](../workflows/purchase-request-order-flow.md)
- **Data model**: [gf-purchase-data-model.md](../data/gf-purchase-data-model.md) — 30+ tables, Flyway V1.0.0..V1.0.13, 30+ enums.
- **Business rules**: BR-GF-PURCHASE-001..022 (in KG `gf-purchase.knowledge-graph.yaml`).
- **Cross-link HLD**:
  - [gf-erp-agent-HLD.md](gf-erp-agent-HLD.md) — primary integration (quotation/PR/PO sync) + event consumer
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — receipt validation + stock event consumer
  - [gf-sales-HLD.md](gf-sales-HLD.md) — quotation ask lookup + direct PO related-service-order
  - [gf-shipment-HLD.md](gf-shipment-HLD.md) — PO DELIVERED callback
  - [gf-system-HLD.md](gf-system-HLD.md) — tenant invoice + transport route
  - [agg-garage-graph-HLD.md](agg-garage-graph-HLD.md) — gateway aggregator


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (REST Controllers có tên + Kafka MessageEventListener/handlers → APP/DOMAIN services + DirectPO state machine → JPA/Kafka/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`** đầy đủ 7: ct-saas-tenant·gf-erp-agent·gf-inventory·gf-system·ocr-car-registration·ac-payment-gateway·**AWS KMS** (user_cards PCI encrypt); feature flags + Kafka P/C footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v2 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 (diagram + decisions + quality); (F-02) inbound callers: "Garage UI/Mobile"→agg-garage-graph, thêm gf-shipment (PO DELIVERED) + gf-sales (QA lookup) + gf-system (transport route check), "Payment callback"→merge vào gf-erp-agent; (F-03) outbound: thêm gf-system (tenant invoice + branch/sequence); (F-04) API count 147→153 (55 active + 46 deprecated + 46 internal + 6 unused); (F-05) thêm BR-GF-PURCHASE citations cho forbidden actions; (F-06) cross-link thêm gf-system-HLD; (F-07) trim diagram + compress cho line budget ≤250. |
| 2026-05-07 | v1 | Initial HLD cho `gf-purchase`: cornerstone procurement service Garage 30+ tables, 147 controller mappings public V1/V2/V3 + protected, 5 purchase channels, Direct PO state machine, 4 reconciliation strategies, Kafka outbox `purchase-order-events`, AWS KMS, downstream ct-saas-tenant + gf-erp-agent + gf-inventory + ocr-car-registration + ac-payment-gateway, Redis cache, 5 feature flags. |
