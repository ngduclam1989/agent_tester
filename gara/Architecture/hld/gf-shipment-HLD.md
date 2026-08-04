---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-shipment
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-shipment-api.md
  - ../data/gf-shipment-data-model.md
---

# HLD — `gf-shipment`

## 1. Overview

`gf-shipment` là service T1 phụ trách aggregate **lệnh vận chuyển nội bộ** của Garage. Internal-only API (chỉ `/protected/v1/*`, không có public `/api/*`), nhận request từ service nội bộ để tạo `ShipmentOrder` + line PO + line SO + attachment, cập nhật stage/status, và **callback đồng bộ** sang `gf-purchase` khi PO line đã đóng và đủ hàng. Service hiện **không** có Kafka/Temporal/outbox — pure synchronous REST.

**Trách nhiệm:**
- Ghi nhận shipment order aggregate (root + shipment line + PO line + SO line + attachment đa hình).
- Cập nhật stage/status: root status → propagate xuống PO line (DELIVERY) hoặc SO line (RECEIPT).
- Callback `gf-purchase` set PO sang `DELIVERED` khi PO line `CLOSED` + `isEnough=true` + `isLast=true`.
- Lưu snapshot tenant/carrier trên PO/SO line để giữ dấu vết vận hành tại thời điểm tạo shipment.
- Boundary hẹp: KHÔNG quản lý procurement, sales lifecycle, inventory stock, carrier master data.

**Owned epic**: cross-cutting internal — không map epic Product. Boundary là **shipment aggregator**, source-of-truth của shipment order chứ không phải PO/SO/inventory.

## 2. Component Diagram (C4 Level 3)

```
┌─────── gf-shipment  (Java 21 · Spring Boot 3.5.0) ────────┐
│  ┌──────────────────────────────────────────┐             │
│  │ InternalShipmentOrderController          │             │
│  │  /protected/v1/shipment-orders (+status) │             │
│  │  ◄ HTTP sync from gf-erp-agent           │             │
│  └─────────────────────┬────────────────────┘             │
│  ┌─────────────────────▼────────────────────┐             │
│  │ APP / DOMAIN SERVICES                    │             │
│  │  ShipmentOrderService (create·updateStage│             │
│  │   ·propagate RECEIPT→SO / DELIVERY→PO)   │             │
│  │  ShipmentOrderMapper · AttachmentHandler │             │
│  └─────────────────────┬────────────────────┘             │
│  ┌─────────────────────▼─────┐ ┌────────────┐             │
│  │ JPA ddl-auto [dev_gf_ship]│ │ HttpClient │             │
│  │  5 tables (no Flyway)     │ │ (x-api-key)│─────────────┼─► gf-purchase (callback PUT PO status=DELIVERED)
│  └─────────────────────┬─────┘ └────────────┘             │
│  /protected/v1/* (internal) │ Actuator + OTLP             │
│       [NO Kafka · NO Temporal · NO outbox]                │
└──────────────────────┴────────────────────────────────────┘
                        ▼
   PostgreSQL [dev_gf_shipment]  (5 tables · ddl-auto)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Internal-only API (chỉ `/protected/v1/*`) | Shipment là aggregator nội bộ — UI client phải đi qua aggregator/BFF khác | open HLD-SHIPMENT-001 |
| KHÔNG có Kafka/Temporal/outbox | Phạm vi hẹp + traffic thấp; callback `gf-purchase` đủ với HTTP đồng bộ | open HLD-SHIPMENT-008 (defer event design) |
| Caller-provided `Long @Id` (không `@GeneratedValue`) | Idempotency tuỳ caller; service không kiểm collision | open HLD-SHIPMENT-003 |
| Snapshot tenant + carrier trên PO/SO line | Giữ dấu vết vận hành — không depend tenant master ở thời điểm đọc | TECHSTACK §master-data-snapshot |
| Attachment đa hình qua `(type, sourceId)` | 1 bảng `shipment_attachments` cho 4 nguồn (root/line/PO/SO); không có FK cứng | open HLD-SHIPMENT-006 |
| Status mapping `WAIT_TO_CONFIRM` chỉ ở root | Không propagate xuống line — line chỉ có `OPEN`/`CLOSED` | open HLD-SHIPMENT-005 |
| Callback `gf-purchase` synchronous trong cùng transaction stage update | Đơn giản; không cần outbox cho 1 callback | open HLD-SHIPMENT-007 (rollback risk) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `gf-erp-agent` (orchestration) | Sync REST `/protected/v1/shipment-orders*` (x-api-key) | Tạo shipment order + update stage/status (verified: GfShipmentClient.java — RULE-08 audit). gf-purchase và gf-sales không gọi trực tiếp, đi qua gf-erp-agent bridge. |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-purchase` | Sync REST callback | `PUT /protected/v1/purchase-orders/status` set `DELIVERED` khi đủ điều kiện |
| PostgreSQL | DB | Schema `${DB_SCHEMA:dev_gf_shipment}` — 5 tables |
| OAuth2 resource server (JWT) | Auth | Protected endpoint enforcement (Nimbus JOSE JWT) |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

> **KHÔNG có async publish/consume** — service chưa publish event. Nếu downstream cần replay shipment lifecycle event → cần thiết kế outbox/event contract (open HLD-SHIPMENT-008).

## 5. Data Ownership

**Owned (PostgreSQL `dev_gf_shipment` schema)** — chi tiết physical schema xem [data/gf-shipment-data-model.md](../data/gf-shipment-data-model.md):

| Aggregate | Bảng | Invariant |
|---|---|---|
| Shipment Order (root) | `shipment_order` | `code` unique global (caller-provided ID + code); soft delete via `isDeleted` |
| Shipment Line | `shipment_order_line` | Liên kết root ↔ PO/SO line; `isLast` flag |
| PO Shipment Line | `shipment_order_line_po` | Snapshot tenant + carrier; `isEnough` + `isLast` quyết định callback |
| SO Shipment Line | `shipment_order_line_so` | Snapshot tenant; `isEnough` + `isLast` flag |
| Attachment (polymorphic) | `shipment_attachments` | `(type, sourceId)` link tới root/line/PO/SO; KHÔNG có FK cứng |

**Tenant boundary risk** (open HLD-SHIPMENT-004):
- Root + line + attachment **không có `tenant_id` column**.
- PO/SO line có `snapshotTenantId` nhưng là snapshot, không phải tenant isolation field.
- `findByCode(code)` không nhận tenant context → caller phải đảm bảo `code` global unique.

**KHÔNG own**:
- Purchase order lifecycle (`gf-purchase` SoT)
- Sales/service order lifecycle (`gf-sales`)
- Inventory stock / receipt / delivery / reservation (`gf-inventory`)
- Carrier/transporter master data (tenant master)
- File binary cho attachment URL (object storage ngoài boundary)
- Event bus / outbox / workflow orchestration (chưa tồn tại)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Create shipment order p95 (incl. flatten attachment) | ≤ 400ms |
| Update stage/status p95 (no callback) | ≤ 200ms |
| Update stage/status p95 (with `gf-purchase` callback) | ≤ 600ms (tight — callback đồng bộ trong transaction) |
| Multipart upload limit | 10 MB file / 10 MB request (`spring.servlet.multipart`) |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Throughput | ≤ 20 RPS sustained — internal-only, traffic thấp |
| Multi-replica | ≥ 2 (HPA); stateless trừ DB transaction |
| Downstream `gf-purchase` timeout | mặc định Spring HttpExchange — cần config explicit timeout/retry |
| Audit trail | Tất cả 5 entity extend `AuditableEntity` (createdBy/At, updatedBy/At) |
| Trace propagation | OTLP — `traceId/spanId/userId/duration` log pattern |
| Health endpoint | `/actuator/health` `show-details=when-authorized` |
| Schema migration | ⚠️ JPA `ddl-auto=update`, **không có Flyway** (open HLD-SHIPMENT-002) |

## 7. Forbidden Actions

- ❌ Expose **public** `/api/*` shipment endpoint (internal-only — UI/client phải đi qua aggregator/BFF khác).
- ❌ Modify trực tiếp purchase order status mà không qua `gf-purchase` callback (vi phạm boundary `gf-purchase` SoT).
- ❌ Modify trực tiếp sales/service order state (boundary `gf-sales` SoT).
- ❌ Modify inventory stock / receipt / delivery state (boundary `gf-inventory` SoT — service này KHÔNG own stock).
- ❌ Tạo shipment với `code` không global-unique (collision cross-tenant — open HLD-SHIPMENT-004 chưa có tenant scope).
- ❌ Hard-delete shipment order / line / attachment (audit invariant — dùng `isDeleted=true` soft delete).
- ❌ Log raw `ShipmentOrderRequest` body (snapshot tenant phone/address, carrier route, attachment URL — PII risk; open HLD-SHIPMENT-009).
- ❌ Treat `WAIT_TO_CONFIRM` như line status (root-only state — line chỉ có `OPEN`/`CLOSED`; service log warning, không update).
- ❌ Bypass `internal-service.api-key` enforcement trên `/protected/**` (open HLD-SHIPMENT-010 — security starter chain phải verify).
- ❌ Bật JPA `ddl-auto=update` ở production mà không có Flyway baseline (schema drift; open HLD-SHIPMENT-002).
- ❌ Tự sinh `Long @Id` server-side (caller-provided contract — phá idempotency policy của upstream).

## 8. References

- **TECHSTACK**: §master-data-snapshot, §observability, §security
- **API spec**: [gf-shipment-api.md](../api/gf-shipment-api.md) — 2 protected endpoints, response signature `ApiResponse<String>` (empty body trong implementation hiện tại — open HLD-SHIPMENT-001)
- **Events spec**: ⚠️ **chưa có** — service chưa publish event; nếu thiết kế cần tạo `events/shipment-events.md` (open HLD-SHIPMENT-008)
- **Workflows**:
  - [shipment-order-lifecycle-flow.md](../workflows/shipment-order-lifecycle-flow.md) — synchronous internal API workflow: create + update stage + callback `gf-purchase`
- **Data model**: [gf-shipment-data-model.md](../data/gf-shipment-data-model.md) — 5 tables, polymorphic attachment, audit fields
- **Cross-link HLD**:
  - [gf-purchase-HLD.md](gf-purchase-HLD.md) — callback target (PO `DELIVERED`)
  - [gf-sales-HLD.md](gf-sales-HLD.md) — caller cho RECEIPT shipment (SO line)
  - [gf-erp-agent-HLD.md](gf-erp-agent-HLD.md) — orchestration caller


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (InternalShipmentOrderController ◄ gf-erp-agent → ShipmentOrderService/Mapper → JPA ddl-auto/HttpClient) + connector `┬`/`▼`; **external side-exit `───┼─►`** gf-purchase (callback PUT PO status=DELIVERED); internal-only, NO Kafka/Temporal/outbox. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes; (F-02) inbound callers sửa — chỉ `gf-erp-agent` gọi trực tiếp (RULE-08 verified từ GfShipmentClient.java), bỏ gf-purchase/gf-sales/operator-job (không gọi trực tiếp, đi qua gf-erp-agent bridge). |
| 2026-05-07 | v1 | Initial HLD cho `gf-shipment`: aggregate lệnh vận chuyển nội bộ Garage — internal-only API (chỉ `/protected/v1/*`, KHÔNG có public `/api/*`), 5 tables (`shipment_order` root, `shipment_order_line`, `shipment_order_line_po` với `isEnough`/`isLast`, `shipment_order_line_so`, `shipment_attachments` polymorphic `(type, sourceId)` không FK cứng), 2 protected endpoint `POST /shipment-orders` + `POST /shipment-orders/status`, callback synchronous `gf-purchase` `PUT /protected/v1/purchase-orders/status` set `DELIVERED` khi PO line `CLOSED` + `isEnough=true` + `isLast=true`, snapshot tenant + carrier trên line giữ dấu vết, caller-provided `Long @Id` cho idempotency. KHÔNG có Kafka/Temporal/outbox/scheduler — pure synchronous REST. Boundary hẹp: KHÔNG own procurement/sales/inventory/carrier master. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `workflows/`, `data/`. |
