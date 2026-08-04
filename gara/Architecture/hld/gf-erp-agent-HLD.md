---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-erp-agent
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-erp-agent-api.md
  - ../events/erp-agent-events.md
  - ../data/gf-erp-agent-data-model.md
---

# HLD — `gf-erp-agent`

## 1. Overview

`gf-erp-agent` là service T1 đóng vai trò **durable message bridge** giữa Garage và hệ ERP/COP. Service nhận command nội bộ qua protected REST API, lưu **outbound_message** vào DB rồi publish ra Kafka topic tương ứng; đồng thời consume inbound Kafka topics, lưu **inbound_message** vào DB rồi gọi các service Garage (`gf-purchase`, `gf-shipment`, `gf-inventory`, `gf-notification`). Boundary KHÔNG own dữ liệu nghiệp vụ purchase/shipment/inventory/notification — chỉ own **trạng thái relay/retry/notification flag** và metadata routing.

**Trách nhiệm:**
- Outbound durable bridge: 6 message type publish ra Kafka qua publisher adapter (`adapter.client.aws.sns.*`).
- Inbound durable bridge: 18 message type consume Kafka qua listener adapter (`adapter.client.aws.sqs.*`), parse + dispatch downstream.
- Batch retry pattern: scheduler claim `PENDING/RETRYING` qua `FOR UPDATE SKIP LOCKED`.
- Priority processing pattern: một số message xử lý ngay sau commit (JPA listener → `*PersistedEvent` → processor); fail → `revertToPending()`.
- Notification fanout sau message COMPLETED: gọi `gf-notification` với `NotificationRequestDto`.
- Routing header chuẩn hoá: `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode`.

**Owned epic**: cross-cutting integration — adapter giữa Garage và ERP/COP. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌───────── gf-erp-agent  (Java 21 · ERP/COP message bridge) ──────────┐
│  ┌─ REST Controllers (x-api) ──┐ ┌─ Kafka Listeners (12) ──┐        │
│  │ InternalBatchCtrl·Quotation │ │ SQS-named handlers,     │        │
│  │ AskCtrl·PricingRequestCtrl· │ │ filter MessageStep:     │        │
│  │ PurchaseRequestCtrl         │ │ quotation-bid/ask/prelim│        │
│  │ SimpleMessageScheduler      │ │ ·pricing·sale-order·    │        │
│  │  (batch trigger via API)    │ │ order-stage·location·   │        │
│  │                             │ │ shipment(+stage)·       │        │
│  │                             │ │ delivered·payment pre/  │        │
│  │                             │ │ postpaid                │        │
│  └──────────────┬──────────────┘ └───────────┬─────────────┘        │
│  ┌──────────────▼───────────────────────────▼─────────────┐         │
│  │ SimpleMessagingApplicationService                      │         │
│  │  Inbound/OutboundMessageService (create·batch·notify)  │         │
│  │  Immediate In/Outbound Processor (AFTER_COMMIT,         │        │
│  │   revertToPending → batch retry; SKIP LOCKED claim 10) │         │
│  └─────┬──────────────────────────────────────┬───────────┘         │
│  ┌─────▼──────┐ ┌──────────────────┐ ┌──────────────┐               │
│  │ JPA/Flyway │ │ Kafka producers  │ │ HttpClients  │               │
│  │[erp-agent] │ │ (SNS-named, 5    │ │ (x-api-key)  │───────────────┼─► gf-purchase   (12 ep)
│  │ V1.0.0-8   │ │  topics, acks=all│ │              │───────────────┼─► gf-shipment   (2 ep)
│  │            │ │  idempotent)     │ │              │───────────────┼─► gf-inventory  (1 ep)
│  └─────┬──────┘ └──────┬───────────┘ └──────────────┘───────────────┼─► gf-notification (1 ep)
│  /protected/v1/* (6 ep) │ Actuator + OTLP                           │
└───────┴──────────────┴──────────────────────────────────────────────┘
        ▼                ▼
   PostgreSQL [dev-gf-erp-agent]   Kafka P: 5 topics (6 pub) ;
   inbound/outbound_message·seq    C: 12 topics (filter Step)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Durable persist trước khi publish/dispatch (outbox + inbox) | Đảm bảo retry + audit; loose coupling với downstream availability | TECHSTACK §outbox-inbox |
| `FOR UPDATE SKIP LOCKED` cho batch claim | Multi-replica safe; mỗi message chỉ 1 instance xử lý | TECHSTACK §scheduler |
| Priority processing pattern (AFTER_COMMIT + revertToPending) | Một số message critical (`CONFIRM_PURCHASE_REQUEST`, `VENDOR_CONFIRMED`) cần latency thấp; fallback batch nếu fail | source `Immediate*Processor` |
| Header-driven routing (`MessageGroup` × `MessageStep`) | Topic share nhiều message type → handler tự filter step | events `_CONVENTIONS.md` §header-routing |
| Notification gửi sau khi message COMPLETED, không trong cùng transaction | Tách concerns; notification lỗi không rollback domain xử lý | open HLD-ERP-AGENT-007 (counter sharing) |
| Manual batch trigger qua REST endpoint, KHÔNG có `@Scheduled` | Operator/external scheduler điều khiển — flexibility theo môi trường | open HLD-ERP-AGENT-001 (cần scheduler ngoài) |
| Package naming `aws.sns/sqs` nhưng implementation Kafka | Legacy naming — không đổi để giữ git history | open HLD-ERP-AGENT-009 |
| Idempotency dựa vào `DataIntegrityViolationException` + `findByMessageKey` | Migration V1.0.7 drop unique constraint — handler catch exception fallback | open HLD-ERP-AGENT-002 (cần chốt strategy) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `gf-purchase` (internal flow) | Sync REST `/protected/v1/*` | Tạo outbound: quotation-ask, pricing-request, create/confirm/cancel purchase, delivered shipment |
| `gf-worker` (cron trigger mỗi ~10-15s) | Sync REST `/protected/v1/batch/*` | Trigger batch processing (4 endpoints) |
| ERP/COP via Kafka | Async consume 13 topics | quotation-bid, pricing-proposal, sale-order, order-stage-update, location, shipment-order, shipment-order-stage, delivered-order, payment prepaid/postpaid, preliminary-quotation, ask-update |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| Kafka 5 unique outbound topics (6 publishers) | Async publish | quotation-ask, pricing, purchase-request, order-stage-update (shared: ConfirmPurchaseRequest + CancelPurchaseRequest), delivered-order |
| `gf-purchase` | Sync REST + x-api-key | 12 endpoints (quotation-bid, quotation-ask update, pricing-proposal, purchase-orders, purchase-requests stage/status/prepaid/postpaid/receive-vendor-confirm/cod-delivered, preliminary-quotation) |
| `gf-shipment` | Sync REST + x-api-key | `POST /shipment-orders` + `POST /shipment-orders/status` |
| `gf-inventory` | Sync REST + x-api-key | `POST /protected/v1/locations` cho tenant garage activation |
| `gf-notification` | Sync REST + x-api-key | `POST /protected/v1/notifications` notification fanout |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev-gf-erp-agent}` — 2 tables + sequences |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `dev-gf-erp-agent` schema)** — chi tiết physical schema xem [data/gf-erp-agent-data-model.md](../data/gf-erp-agent-data-model.md):

| Table | Vai trò | Key columns |
|---|---|---|
| `inbound_message` | Durable queue cho message consume từ Kafka | `id`, `message_key`, `message_type`, `tenant_id`, `origin_tenant_id`, `payload`, `message_group`, `message_step`, `status`, `attempt_count`, `last_error`, `is_notified` |
| `outbound_message` | Durable queue cho command tạo từ protected API chờ publish Kafka | `id`, `message_type`, `tenant_id`, `message_code`, `payload`, `message_group`, `message_step`, `origin_tenant_id`, `status`, `attempt_count`, `last_error`, `is_notified` |
| `sequences` | Utility sequence từ migration cũ | dùng bởi `DBUtils.getNextSequence` nếu cần |

**State machine** (`ProcessingStatus`):

```
PENDING ──claim──► PRIORITY_PROCESSING ──success──► COMPLETED
   ▲                       │                            │
   │                       └──fail──► PENDING (revert)  │
   │                                                    ▼
   │                                       (notification batch)
   └──retry─── RETRYING ◄──fail (under max)─┘   COMPLETED + isNotified
                  │                              │
                  ▼ (over max)                   ▼ (notification fail over max)
               FAILED                         FAILED
```

**KHÔNG own**:
- Purchase request/order, quotation, pricing proposal state (`gf-purchase` SoT)
- Shipment order + stage state (`gf-shipment` SoT)
- Location/warehouse thực tế (`gf-inventory` SoT)
- Template, fanout, channel delivery của notification (`gf-notification` SoT)
- ERP/COP source-of-truth (hệ ngoài)
- Public-facing API (chỉ internal `/protected/v1/*`)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Outbound command create p95 (persist message) | ≤ 200ms |
| Outbound batch publish p95 (per message, warm) | ≤ 300ms (incl. Kafka send + status update) |
| Inbound consume + persist p95 | ≤ 250ms (parse header + insert) |
| Inbound batch process p95 (per message, downstream call) | ≤ 800ms (depends on `gf-purchase`/`gf-shipment` latency) |
| Priority processing latency (after commit → published) | ≤ 500ms (skip batch wait) |
| Notification batch p95 (per message) | ≤ 600ms |
| Batch size | 10 (`SCHEDULER_SIMPLE_MESSAGING_BATCH_SIZE=10`) |
| Max retry attempts | 5 (`SCHEDULER_SIMPLE_MESSAGING_MAX_RETRY_ATTEMPTS=5`) |
| Custom retries per type | `CUSTOM_RETRIES_CONFIGS` env override |
| Multi-replica scheduler | `FOR UPDATE SKIP LOCKED` — safe |
| Kafka producer | sync `KafkaTemplate.send().get()`, idempotent |
| Kafka consumer | `enable-auto-commit=false`, manual ack |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Schema migration | Flyway V1.0.0-V1.0.8 (`ddl-auto=none`, `validate-on-migrate=true`) |

## 7. Forbidden Actions

- ❌ Process inbound/outbound message mà không qua durable persist trước (vi phạm reliability — phá retry contract; outbox/inbox pattern phải atomic với transaction).
- ❌ Skip header validation `MessageGroup` + `MessageStep` + `OriginTenantId` + `OriginMessageCode` (open HLD-ERP-AGENT-006 — null guard thiếu sẽ NPE; phải có default error response).
- ❌ Controller `getFirst()` trên list request mà không validate non-empty (open HLD-ERP-AGENT-005 — `pricing`, `purchases/confirm`, `purchases/confirm-received` sẽ throw `NoSuchElementException`).
- ❌ Hard-delete `inbound_message` / `outbound_message` (audit invariant — retention policy phải có; FAILED message cần human review trước requeue).
- ❌ Log raw `payload` JSON trong production (open HLD-ERP-AGENT-008 — chứa payment token, masked card, PII; cần masking layer).
- ❌ Share `attempt_count` giữa processing retry và notification retry mà không tách (open HLD-ERP-AGENT-007 — notification fail có thể đẩy message COMPLETED → FAILED nhầm; phải có counter riêng).
- ❌ Expose public `/api/*` endpoint (toàn bộ phải `/protected/v1/*` + x-api-key; `actechx.security.public-api.enabled=false`).
- ❌ Tạo immediate processor cho message KHÔNG được `ofPriorityMessage` (chỉ `CONFIRM_PURCHASE_REQUEST`, `VENDOR_CONFIRMED` — mở rộng cần ADR vì impact transactional latency).
- ❌ Bypass `revertToPending()` khi immediate fail (priority message lỗi mà không revert → kẹt `PRIORITY_PROCESSING` forever → cần dashboard alert).
- ❌ Hardcode topic name trong publisher/handler (phải qua env `KAFKA_TOPICS_*` hoặc property — env `DELIVERVED_ORDER_TOPIC` typo còn legacy, open HLD-ERP-AGENT-004).
- ❌ Đổi `aws.sns/sqs` package name mà không update docs vận hành (open HLD-ERP-AGENT-009 — implementation Kafka, naming legacy AWS có thể gây cấu hình nhầm).

## 8. References

- **TECHSTACK**: §outbox-inbox, §scheduler, §kafka, §http-client, §security
- **API spec**: [gf-erp-agent-api.md](../api/gf-erp-agent-api.md) — Batch 4 endpoints, Outbound command 6 endpoints, message type catalog, topic contract.
- **Events spec**: [erp-agent-events.md](../events/erp-agent-events.md) — 12 inbound topic + 5 unique outbound topic (6 publishers); header contract (`MessageGroup` × `MessageStep` × `OriginTenantId` × `OriginMessageCode`); 18 inbound type + 6 outbound type.
- **Workflows**:
  - [erp-agent-message-relay-flow.md](../workflows/erp-agent-message-relay-flow.md) — full flow: outbound command → durable persist → batch publish; inbound consume → durable persist → batch dispatch → notification.
- **Data model**: [gf-erp-agent-data-model.md](../data/gf-erp-agent-data-model.md) — 2 message tables + sequences, Flyway migration V1.0.0..V1.0.6, enum catalog (`InboundMessageType` 18 values, `OutboundMessageType` 6 values, `ProcessingStatus`, `MessageGroup`, `QuotationMessageStep` 23 values, `PaymentMessageStep`, `PaymentMethod`, `NotificationType`, `NotificationChannel`, `TargetClient`, `AttachmentOwner`).
- **Cross-link HLD**:
  - [gf-purchase-HLD.md](gf-purchase-HLD.md) — primary downstream (12 endpoints) — purchase order/quotation/pricing lifecycle
  - [gf-shipment-HLD.md](gf-shipment-HLD.md) — downstream shipment order + stage
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — downstream location create cho tenant garage
  - [gf-notification-HLD.md](gf-notification-HLD.md) — downstream notification fanout
  - [gf-system-HLD.md](gf-system-HLD.md) — sister event consumer (`TenantActivated`)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered ERP/COP bridge (REST Controllers + 12 Kafka Listeners SQS-named + SimpleMessageScheduler → SimpleMessagingApplicationService + In/Outbound + Immediate processors → JPA/Flyway/Kafka producers/HttpClients) + connector `┬`/`▼`; **external side-exit `───┼─►`**: gf-purchase·gf-shipment·gf-inventory·gf-notification; Kafka P:5/C:12 footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v2 + source audit: (F-01) inbound handler/topic count 13 → 12 (3 vị trí: component diagram, summary, references); (F-02) bỏ `gf-sales` khỏi inbound callers — source grep xác nhận gf-sales không gọi gf-erp-agent, chỉ `gf-purchase`; (F-03) migration version V1.0.6 → V1.0.7 cho drop unique constraint `inbound_message.message_key`, thêm note V1.0.8 tồn tại; (F-04) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes; (F-05) batch caller "Operator / external scheduler" → `gf-worker` (cron ~10-15s); (F-06) outbound topic count "6 topics" → 5 unique topics (6 publishers — CancelPurchaseRequest + ConfirmPurchaseRequest share order-stage-update). |
| 2026-05-07 | v1 | Initial HLD cho `gf-erp-agent`: durable message bridge giữa Garage và ERP/COP, tables `inbound_message` + `outbound_message` + `sequences`, 6 outbound Kafka publisher (`quotation-ask`, `pricing`, `purchase-request`, `order-stage-update` × 2, `delivered-order`) + 13 inbound listener (quotation-bid/ask-update/preliminary, pricing, sale-order, order-stage-update, location, shipment-order, shipment-order-stage, delivered-order, payment prepaid/postpaid), header routing `MessageGroup` × `MessageStep` × `OriginTenantId` × `OriginMessageCode`, batch claim `FOR UPDATE SKIP LOCKED` (size 10, max retry 5), priority processing AFTER_COMMIT cho `CONFIRM_PURCHASE_REQUEST`/`VENDOR_CONFIRMED` với revertToPending(), protected REST `/protected/v1/*` (x-api-key) — internal-only, downstream `gf-purchase` (12 endpoints) + `gf-shipment` (2) + `gf-inventory` (1 location) + `gf-notification` (1 fanout). Package naming `aws.sns/sqs` legacy nhưng implementation Kafka. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
