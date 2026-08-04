---
type: architecture
artifact_kind: event-conventions
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-06-24"
---

# Event Conventions — GMS async event plane

> **T1 reference cho mọi `events/{boundary}-events.md` của GMS.** Mỗi producer boundary có 1 file event riêng. File này chỉ chứa convention chung áp dụng xuyên suốt.
>
> GMS dùng **Kafka JSON + `KafkaMessageWrapper`** (chưa phải Avro). Khác với sss-agentic-design (Avro binary).

---

## 1. Transport & Hosting

| Thuộc tính | Giá trị | Trạng thái |
|---|---|---|
| Transport | Kafka-compatible broker / Event Hubs-compatible API | Active |
| Producer API | Spring Kafka `KafkaTemplate<String, String>` hoặc outbox processor | Active |
| Consumer API | Spring Kafka `@KafkaListener` + manual acknowledgement | Active |
| Format | JSON string trên Kafka value | Active |
| Canonical wrapper | `KafkaMessageWrapper` (`headers`, `messageId`, `source`, `type`, `data`, `timestamp`) | Active |
| Schema registry | Chưa thống nhất | Target hardening |
| Delivery guarantee | At-least-once | Active |
| Reliability baseline | Outbox cho producer state-changing; inbox/processed-events cho consumer có side effect | Required |

**Quy tắc**: event mới KHÔNG được tự phát minh envelope riêng. Mặc định `KafkaMessageWrapper`; consumer external yêu cầu raw DTO → boundary doc phải ghi rõ ngoại lệ.

---

## 2. Topic Naming

### 2.1 Format (de facto từ source hiện tại — source = standard)

GMS dùng các pattern naming hiện hữu trong source code làm canonical standard. **KHÔNG có target migration** — tài liệu reflect chính xác source state, không document aspiration `gms.{boundary}.*` giả tưởng.

Pattern observed trong source:

| Pattern | Example | Use case |
|---|---|---|
| `AC-DEV-{TOPIC-NAME}` | `AC-DEV-BOOKING-EVENTS`, `AC-DEV-CAMPAIGN-TOPIC`, `AC-DEV-TENANT-PROVISIONING`, `AC-DEV-BRANCH-LIFECYCLE` | Dev env prefix, uppercase + dash (phổ biến nhất) |


**Topic identifier suffix observed**:
- `-EVENTS` (most common) — `BOOKING-EVENTS`, `CAMPAIGN-TOPIC`, `MESSAGE-TOPIC`
- `-TOPIC` — vài topic dùng suffix này
- `-REQUEST`/`-REQUESTS` — request topics (`NOTIFICATION-REQUEST`, `TENANT-USER-PROVISION-REQUESTS`)
- `-RESULTS` — result topics (`TENANT-USER-PROVISION-RESULTS`)
- `-SYNC` — sync topics (`SERVICE-ORDER-SYNC`, `TENANT-SYNC-USER`)
- Domain-specific (`O-STAGE`, `PIM-INFO`, `MDM-VEHICLE-CATALOG`, `LIFECYCLE`, `ACTIVATION`, `PROVISIONING`)

Quy tắc:
- Topic name trong tài liệu PHẢI khớp giá trị config default hoặc hardcode literal trong source code (Spring `kafka.topics.*` default hoặc literal trong publisher/listener).
- KHÔNG tạo "Target topic" column hay aspiration `gms.{boundary}.{event}` — chỉ document source thực.
- Khi thêm event mới: ưu tiên env-prefix uppercase dash-separated (vd `AC-DEV-{NEW-EVENT-NAME}`), suffix theo nghiệp vụ (`-EVENTS` cho lifecycle, `-REQUEST(S)` cho command, `-RESULTS` cho response). Tránh hardcode literal lowercase dotted (`customer.events`-style).
- Drift detection: nếu producer config default ≠ consumer config default cùng nghiệp vụ → tag `topic-drift-risk` + document specific drift trong Note column.

### 2.2 Topic drift rule

Nếu producer và consumer cùng nghiệp vụ nhưng default topic khác nhau, boundary doc phải đánh dấu `topic-drift-risk` + xử lý 1 trong 3 cách:

1. Chuẩn hóa default topic trong config (Spring property file).
2. Giữ default cũ + bắt buộc cùng env var override ở deployment (ghi rõ env var name).
3. Tách thành 2 event khác nhau nếu semantic thực sự khác.

**Drift hiện tại trong source**:

| Flow | Producer default | Consumer default |
|---|---|---|
| `gf-sales` → `gf-inventory-worker` SO | `AC-NONPROD-DEV-SERVICE-ORDER-EVENTS` | `dev-inventory-service-order-events` |
| `gf-purchase` → `gf-inventory-worker` PO | `AC-NONPROD-DEV-PURCHASE-ORDER-EVENTS` | `dev-inventory-purchase-order-events` |
| `gf-customer` `CustomerMerged` |  | config `DEV-CUSTOMER-EVENTS`  |

### 2.3 Đặc biệt

- **External bridge** (Driver Plus, ERP/COP, lambda, IAM/HR, PIM): producer external publish vào topic theo external naming convention; `gf-erp-agent`/`gf-sales`/`gf-marketing`/`gf-system`/`gf-erp-mdm` consume + translate. Internal consumer KHÔNG document target naming khác — giữ topic name của external producer làm canonical.
- **Simulator**: prefix `simulator.{name}` nếu có. Tách khỏi prod, KHÔNG mix.
- **DLQ**: `{topic}.DLQ` (uppercase DLQ suffix). Cần phân biệt consumer → `{topic}.DLQ.{consumer-service}`.

---

## 3. Envelope

### 3.1 Canonical wire envelope (`KafkaMessageWrapper`)

```json
{
  "headers": {
    "OriginTenantId": 133,
    "MessageGroup": "SERVICE_ORDER",
    "OriginMessageCode": "SO-00001",
    "MessageStep": "COMPLETED.1",
    "CorrelationId": "uuid",
    "TraceParent": "00-trace-span-01"
  },
  "messageId": "uuid",
  "source": "gf-sales",
  "type": "SERVICE_ORDER_COMPLETED",
  "data": "{\"eventId\":\"uuid\",\"eventType\":\"ServiceOrderCompleted\",\"eventVersion\":\"1.0\",\"tenantId\":133,\"occurredAt\":\"2026-05-04T00:00:00Z\"}",
  "timestamp": "2026-05-04T00:00:00Z"
}
```

> ⚠️ `data` là **JSON string** để giữ compatibility với source hiện tại. Không đổi sang JSON object nếu chưa có major migration.

### 3.2 Required wrapper fields

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `headers` | ✅ | Routing/correlation context |
| `messageId` | ✅ | UUID duy nhất per Kafka message — bus-level idempotency |
| `source` | ✅ | Service phát event (vd `gf-sales`, `gf-purchase`) |
| `type` | ✅ | Message type stable, uppercase snake case hoặc legacy type |
| `data` | ✅ | JSON string chứa domain payload |
| `timestamp` | ✅ | Producer create time, ISO-8601 UTC |

### 3.3 Required headers

| Header | Bắt buộc | Mô tả |
|---|---|---|
| `OriginTenantId` | ✅ (event tenant-scoped) | Tenant id nguồn. Cross-tenant/platform → `null` + giải thích trong boundary doc |
| `MessageGroup` | ✅ | Nhóm nghiệp vụ: `BOOKING`, `SERVICE_ORDER`, `PO`, `TENANT`, `BRANCH`, `MESSAGE`, `NOTIFICATION`, `ERP` |
| `OriginMessageCode` | ✅ (event có aggregate code) | Mã nghiệp vụ nguồn (vd `SO-00001`, `PO-00017`) |
| `MessageStep` | ✅ | Step nghiệp vụ ổn định để route consumer (vd `COMPLETED.1`, `CREATED.1`) |
| `CorrelationId` | Khuyến nghị | Propagate từ inbound request hoặc root event |
| `TraceParent` | Khuyến nghị | W3C traceparent |

### 3.4 Required domain payload (`data` content)

| Field | Bắt buộc | Mô tả |
|---|---|---|
| `eventId` | ✅ | UUID domain event (có thể trùng `messageId`) |
| `eventType` | ✅ | PascalCase past-tense (vd `ServiceOrderCompleted`) |
| `eventVersion` | ✅ | `major.minor` |
| `tenantId` | ✅ (tenant-scoped) | Tenant id trong domain payload |
| `occurredAt` / `timestamp` | ✅ | Domain event time |
| `source` | Khuyến nghị | Producer boundary |

### 3.5 Tenant metadata precedence

Nếu nhiều vị trí cùng chứa tenant, consumer áp dụng precedence:

1. `data.tenantId` — domain truth.
2. `headers.OriginTenantId` — routing/audit context, PHẢI khớp `data.tenantId` nếu cả hai tồn tại.
3. Outbox row `tenant_id` / partition key — chỉ là metadata publish.

⚠️ Nếu `data.tenantId` ≠ `headers.OriginTenantId` → consumer **KHÔNG xử lý side effect im lặng**. PHẢI fail có kiểm soát + DLQ/audit.

---

## 4. Partition Key

### 4.1 Key convention (aggregate/business code, KHÔNG phải tenantId)

| Event family | Key khuyến nghị |
|---|---|
| Tenant provisioning | `Tenant-{tenantId}` hoặc `Tenant-{tenantCode}` |
| Branch lifecycle | `Branch-{branchId}` hoặc `Branch-{branchCode}` |
| Booking | `Booking-{bookingId}` hoặc `Booking-{bookingCode}` |
| Service order | `ServiceOrder-{serviceOrderCode}` |
| Purchase order | `PurchaseOrder-{purchaseOrderCode}` |
| Inventory reservation | `Reservation-{reservationCode}` |
| Customer | `Customer-{customerId}` |
| Campaign | `Campaign-{campaignId}` |
| Voucher | `Voucher-{voucherId}` hoặc `VoucherProgram-{programId}` |
| Notification delivery | `NotificationDelivery-{deliveryId}` |
| ERP bridge | External business key (quotation/order/shipment/payment code) |

> **Lý do**: Per-aggregate ordering preserve. Partition theo `tenantId` thuần sẽ tạo hot partition cho tenant lớn.

### 4.2 Forbidden keys

- ❌ Random key cho event cần ordering theo aggregate.
- ❌ `tenantId` thuần làm key mặc định (hot partition risk).
- ❌ `null` key cho state-changing event (trừ batch/audit stream không cần ordering).

---

## 5. Idempotency & Dedup

### 5.1 Producer

- `messageId` UUID duy nhất per Kafka message.
- `data.eventId` UUID duy nhất per domain event.
- State-changing producer **PHẢI** ghi outbox cùng transaction với mutation. Direct publish chỉ chấp nhận cho non-critical notification/delivery.

Outbox table tối thiểu (mỗi service tự implement, ADR-005 no shared lib):

```sql
CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload TEXT NOT NULL,
  topic VARCHAR(200) NOT NULL,
  status VARCHAR(30) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  retry_count INT NOT NULL DEFAULT 0,
  error_message TEXT
);
```

### 5.2 Consumer

Consumer có side effect **PHẢI** dedup bằng 1 trong 3 pattern:

| Pattern | Khi dùng |
|---|---|
| **Inbox table** | Side effect ghi DB, cần transactional dedup |
| **`processed_events` table** | Consumer nhỏ, guard theo event id |
| **Redis `SETNX` TTL** | Side effect idempotent, tốc độ cao, chấp nhận TTL 24h |

Dedup key mặc định: `{consumer-service}:{messageId}:{type}` (fallback `{consumer-service}:{data.eventId}:{data.eventType}` nếu wrapper không có `messageId`).

### 5.3 Forbidden

- ❌ Ack message trước khi side effect durable hoàn tất.
- ❌ Bỏ qua duplicate bằng memory-only set trong process.
- ❌ Dùng business code đơn lẻ làm dedup key nếu event type khác có cùng code.

---

## 6. Schema & Versioning

### 6.1 Schema location

```
Architecture/events/{boundary}-events.md   # human-readable schema doc
schemas/json/{event-type}.schema.json      # machine-readable (khi harden code)
```

### 6.2 Compatibility rules

| Change type | Same major? | Rule |
|---|---|---|
| Add optional field | ✅ | Consumer phải tolerate unknown fields |
| Add enum value | ✅ (có fallback) | Consumer KHÔNG fail cứng khi gặp unknown enum |
| Add required field | ❌ | Major bump hoặc event type mới |
| Remove field | ❌ | Deprecate trước, remove ở major mới |
| Rename field | ❌ | Add field mới + giữ field cũ trong migration window |
| Change field type | ❌ | Major migration |
| Change semantic field cũ | ❌ | Major migration |

### 6.3 Event type naming

| Vị trí | Format | Example |
|---|---|---|
| Domain payload `eventType` | PascalCase past-tense | `BookingCompleted`, `ServiceOrderStarted`, `PurchaseOrderStatusChanged`, `VoucherRedeemed` |
| Wrapper `type` | UPPERCASE snake case (legacy compat) | `BOOKING_COMPLETED`, `SERVICE_ORDER_STATUS_CHANGED`, `NOTIFICATION_REQUEST` |

Boundary doc PHẢI map rõ `type` ↔ `data.eventType`.

---

## 7. Retry & DLQ

### 7.1 Producer retry

Outbox producer phải có:
- `maxRetries` explicit qua config.
- Batch size + stale processing timeout explicit.
- Structured log với `eventId`, `messageId`, `topic`, `aggregateType`, `aggregateId`.
- Sau retry exhaust → status terminal `FAILED` + metric/alert (KHÔNG mất im lặng).

### 7.2 Consumer retry

| Loại lỗi | Policy |
|---|---|
| Transient (network, timeout) | Retry in-process tối đa 3 lần exponential backoff |
| Parse/schema error | KHÔNG retry — DLQ/audit ngay (corrupted retry vô ích) |
| Domain transient (entity not found) | Retry, sau đó DLQ/audit |
| Sau DLQ thành công | Mới ack message gốc |

### 7.3 DLQ naming

| Stage | Format |
|---|---|
| Legacy | `{primary-topic}.DLQ` |
| Target | `gms.{producer-boundary}.{event-type}.dlq` |
| Consumer-specific | `{primary-topic}.DLQ.{consumer-service}` |

### 7.4 Replay

- Admin-only access + audit log (operator + time + topic + event id + reason).
- Dry-run / validate schema trước replay.
- Consumer dedup vẫn bật để tránh side effect trùng.

---

## 8. Consumer Group Naming

### 8.1 Current state (legacy)

```
gf-sales-group, gf-customer-group, gf-marketing-group, gf-notification-group
ac-nonprod-dev-gf-system-cg, ac-nonprod-dev-gf-inventory-cg, gf-erp-agent-group
```

KHÔNG đổi group id hiện hữu nếu chưa có runbook reset offset (mất state consumer).

### 8.2 Target convention

```
{env}-{consumer-service}-of-{producer-boundary}-cg
```

Examples:
- `dev-gf-notification-of-sales-cg`
- `dev-gf-inventory-worker-of-purchase-cg`
- `dev-gf-marketing-of-sales-cg`

Rule: 1 consumer group per (consumer-service × producer-boundary). Service consume nhiều topic từ cùng producer → cùng group. KHÔNG dùng chung group giữa 2 service trừ khi chủ đích competing consumers.

---

## 9. Observability

### 9.1 Producer metrics

| Metric | Tags |
|---|---|
| `gms.event.publish.count` | `topic`, `source`, `event_type`, `status` |
| `gms.event.publish.duration_ms` | `topic`, `source` |
| `gms.outbox.pending.count` | `service`, `topic` |
| `gms.outbox.lag.seconds` | `service`, `topic` |
| `gms.outbox.failed.count` | `service`, `topic`, `event_type` |

### 9.2 Consumer metrics

| Metric | Tags |
|---|---|
| `gms.event.consume.count` | `topic`, `consumer_group`, `event_type`, `status` |
| `gms.event.consume.duration_ms` | `topic`, `consumer_service` |
| `gms.event.consume.lag_ms` | `topic`, `consumer_service` |
| `gms.event.duplicate.count` | `topic`, `consumer_service`, `event_type` |
| `gms.event.dlq.count` | `topic`, `consumer_service` (alert > 0 sustained 5min) |

### 9.3 Logging

Mandatory fields per event log:
- `messageId`, `eventId`, `type`, `eventType`, `tenantId`, `topic`, `consumerGroup` (nếu consumer), `correlationId`

⚠️ KHÔNG log full payload nếu có PII, payment info, temporary password, JWT, token, raw OCR document, provider secret.

---

## 10. Security & Forbidden Patterns

### 10.1 Forbidden payload (PCI/PII compliance)

KHÔNG publish các dữ liệu sau trong event:
- Password, temporary password plain text.
- JWT, access token, refresh token.
- API key, secret, KMS key, provider credential.
- Raw card data hoặc payment credential.
- Raw OCR image/base64/document content.

### 10.2 Sensitive payload allowed with constraints

| Data | Constraint |
|---|---|
| Customer name/phone/email | Mask log, retention rõ |
| Tenant tax code/invoice info | Chỉ topic có consumer cần thiết |
| Notification recipient | Mask log, không gửi credential |
| Payment amount/status | KHÔNG chứa payment secret/card token |
| Employee/user id/role | KHÔNG chứa password hoặc IAM secret |

### 10.3 Cross-tenant safety

- Event KHÔNG được chứa data của nhiều tenant (trừ platform/admin aggregate đã định nghĩa).
- Consumer PHẢI validate tenant context trước khi ghi projection hoặc gọi downstream API.
- Event thiếu tenant cho flow tenant-scoped → consumer reject có kiểm soát.

### 10.4 Forbidden patterns (operational)

- ❌ Publish event state-changing trực tiếp sau DB commit nếu service đã có outbox pattern.
- ❌ Đổi `data` từ JSON string sang object trong cùng major version.
- ❌ Đổi casing wrapper field.
- ❌ Dùng cùng topic cho command và event nếu payload/consumer semantic khác mà không có `type`/`MessageStep` route rõ.
- ❌ Tạo event mới mà không đăng ký trong `{boundary}-events.md`.
- ❌ Tạo consumer side effect nếu thiếu idempotency guard.
- ❌ Ack và nuốt lỗi parse/schema của message nghiệp vụ quan trọng.
- ❌ Thêm payload chứa secret/credential để "debug tạm".

---

## 11. Per-boundary Inventory

| Producer boundary | File | Vai trò | Outbound | Inbound (external-source) | Key consumers |
|---|---|---|---|---|---|
| `tenant-system` | [gf-system-events.md](gf-system-events.md) | Pure producer + external IAM/HR inbound | 6 | 6 | `gf-inventory`, `gf-erp-agent`, `ct-saas-tenant` |
| `gf-sales` | [gf-sales-events.md](gf-sales-events.md) | Pure producer + Driver+ inbound | 13 | 2 | `gf-inventory-worker`, `gf-marketing`, `gf-notification` |
| `gf-purchase` | [gf-purchase-events.md](gf-purchase-events.md) | Pure producer | 1 | — | `gf-inventory-worker` |
| `gf-inventory` | [gf-inventory-events.md](gf-inventory-events.md) | Pure producer | 2 | — | `ct-saas-tenant` |
| `gf-customer` | [gf-customer-events.md](gf-customer-events.md) | Pure producer | 5 | — | `gf-customer` self, external |
| `gf-marketing` | [gf-marketing-events.md](gf-marketing-events.md) | Pure producer + lambda inbound | 4 | 1 | `gf-marketing` self, `gf-customer`, external |
| `gf-notification` | [gf-notification-events.md](gf-notification-events.md) | Pure producer | 1 | — | external |
| `gf-erp-mdm` | [gf-erp-mdm-events.md](gf-erp-mdm-events.md) | Pure producer + external PIM/Catalog inbound | 1 | 2 | `gf-erp-mdm` self, `gf-inventory` REST |
| `gf-erp-agent` | [gf-erp-agent-events.md](gf-erp-agent-events.md) | **Adapter bridge** (split §2.1+§2.2) | 6 | 12 | `gf-purchase`, `gf-shipment`, `gf-inventory` |
| `gf-accounting` | [gf-accounting-events.md](gf-accounting-events.md) | Pure producer (currently PROPOSED-only) | 2 PROPOSED | — | `gf-inventory` (RECEIPT-V2/DELIVERY-V2/PRC future consumers — flip ACTIVE = future wave) |

> Counts post-Phase-1 cleanup (DELETE inbound trùng lặp với producer internal). Cập nhật khi thêm/xóa event.

Mỗi file `{boundary}-events.md` PHẢI có 5 section bắt buộc + 1 optional:
1. Producer summary
2. Catalog (flat; split §2.1 Outbound + §2.2 Inbound chỉ khi có external-source inbound)
3. Schemas (mỗi event có **4 phần**: Trigger / Payload / Idempotency / Critical use case)
4. Workflow correlation (optional — chỉ khi liên quan Temporal)
5. Forbidden patterns
6. References + Change log

---

## 12. Discovery semantics (cho ADLC agent)

Để **tìm event đã có**:
1. Đọc §11 Per-boundary inventory để xác định producer boundary owning schema (column "Vai trò" + "Outbound").
2. Mở `{boundary}-events.md` §2 Catalog: "Event Type" column = whitelist mọi event boundary publish.
3. "Primary consumers" column liệt kê service consume → cross-boundary topology.
4. §3.X Trigger có producer call-site reference (file:method) cho brownfield verify code có thật.
5. §4 Workflow correlation (nếu có) mô tả Temporal saga cross-boundary chain.

Để **biết boundary X consume event nào**:
1. Đọc §11 inventory column "Key consumers" — boundary X xuất hiện ở producer nào.
2. Mở producer file §2 Catalog row có X trong "Primary consumers".
3. Nếu X có workflow Temporal → đọc producer §4 hoặc workflow file riêng.

**Producer-view discipline** (sss-aligned):
- KHÔNG tạo inbound section trong file consumer cho event có producer internal.
- KHÔNG duplicate schema event ở 2 file (anti-drift).
- KHÔNG cross-link 2 chiều với anchor row # — agent navigate qua boundary name.

**Split §2.1+§2.2 trigger condition** — chỉ áp khi:
- Boundary có inbound từ **producer external** (vd Driver+ → `gf-sales`, lambda → `gf-marketing`, ERP/COP → `gf-erp-agent`, IAM/HR → `gf-system`, PIM → `gf-erp-mdm`).
- Adapter bridge boundary (vd `gf-erp-agent`) — owns schema mirror cả 2 chiều vì external producer không có canonical doc.
- Pure producer (no external-source inbound) → §2 phẳng.

**Khi tạo event mới** (ADLC agent flow):
1. Verify producer boundary đã có file `{boundary}-events.md` (nếu chưa, tạo từ [`_TEMPLATE-events.md`](_TEMPLATE-events.md)).
2. Check §2 Catalog: aggregate + lifecycle có trùng event tồn tại không?
   - Trùng → reuse (publish lên cùng topic + headers tương ứng).
   - Khác → đăng ký 1 row §2 + thêm 1 sub-section §3.X 4-part schema.
3. Bump file `version` + Change Log.
4. Update §11 inventory `_CONVENTIONS.md` nếu thêm/đổi vai trò hoặc count.

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial event conventions cho GMS async event plane: transport Kafka JSON + `KafkaMessageWrapper`, topic naming de facto từ source (`AC-DEV-*`/`AC-NONPROD-DEV-*`/`DEV-*`/`dev-*`) + drift rule, envelope/headers (`OriginTenantId`, `MessageGroup`, `MessageStep`, `OriginMessageCode`, `CorrelationId`, `TraceParent`), partition key per-aggregate, idempotency outbox/inbox/Redis, schema/versioning compatibility, retry & DLQ, consumer group naming, observability metrics, security/forbidden patterns (PCI/PII), §11 per-boundary inventory cho 9 file `{boundary}-events.md`, §12 discovery semantics cho ADLC agent. |
| 2026-06-24 | v2 | **R2 F3 (surgical fix) — Register `gf-accounting` row trong §11 Per-boundary Inventory** (ADR-019 Decision C / gf-accounting-events.md v8). Topic `AC-DEV-ACCOUNTING-EVENTS` reuse pattern `AC-DEV-{DOMAIN}-EVENTS`; 2 events PROPOSED (`AccountingPeriodClosed` + `AccountingPeriodReopened`, MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE`); future consumers `gf-inventory` (RECEIPT-V2/DELIVERY-V2/PRC) khi flip ACTIVE. Fixes R1 review F3 — events file + ADR-019 references đến §11 đã trở thành factually correct (claim "đã register §11" trước đó là forward-looking; nay đã register thật). Inventory now lists 10 boundaries (was 9). |
