---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: customer
last_reviewed: "2026-05-07"
---

# Events - `customer` boundary

> Producer = `gf-customer`. Boundary này publish customer master, customer merge và segment workflow event. Self-consume `SegmentEvaluateRequested` để chạy Temporal evaluation workflow.
>
> Consume từ producer khác (per [`_CONVENTIONS.md §12`](_CONVENTIONS.md) discovery semantics, KHÔNG document trong file này):
> - `SendMessageRequested` ← [gf-marketing-events.md](gf-marketing-events.md) §2 — `InteractionConsumer` tạo interaction outbound (skip `MessageStep=MESSAGE.SEND.2`).

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `gf-customer` |
| Owned epics | TBD |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.customer.*` (planned) |
| Total events outbound | 2 active (`CustomerMerged` + `SegmentEvaluateRequested` self-consume); 3 DTO inactive document §3 (CustomerCreated/Updated, SegmentEvaluated) |
| Reliability | Outbox table + `OutboxEventListener` publish sau commit + scheduled retry `OutboxProcessor` + Redis lock; consumer manual ack |
| Outbox topic source | Topic nằm trực tiếp trên từng `OutboxEvent.topic`, KHÔNG resolve theo `eventType` |
| Canonical envelope | Customer lifecycle: raw DTO khi có outbox path; Segment workflow: `SegmentMessage extends com.actechx.common.messaging.Message` để có Kafka headers |

Source hiện tại có 2 cơ chế publish outbox:

| Cơ chế | Mô tả |
|---|---|
| `OutboxEventListener` | Nhận `OutboxEventCreatedEvent` sau commit, mark `PROCESSING`, publish sync Kafka, mark `SENT`/`FAILED`; nếu payload parse được `com.actechx.common.messaging.Message` thì copy custom headers vào Kafka headers |
| `OutboxProcessor` | Scheduled retry các event pending/stale bằng `event.getTopic()` và key `aggregateType + "-" + aggregateId`; KHÔNG gắn lại custom headers từ payload |

Ràng buộc runtime:
- `OutboxEventListener` và `OutboxProcessor` đều `@ConditionalOnBean(KafkaTemplate.class)`.
- `OutboxEvent.markAsFailed` hardcode chuyển `FAILED` khi `retryCount >= 3`; `outbox.max-retries` chỉ dùng để query batch pending/stale.

---

## 2. Catalog

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `CustomerMerged` | `customer.events` (hardcode literal) | `CustomerServiceImpl.mergeCustomers(...)` merge duplicate customers | External/unknown | ≤ 30s | `topic-drift-risk` | drift: hardcode literal vs config `DEV-CUSTOMER-EVENTS` |
| 2 | `SegmentEvaluateRequested` | `DEV-SEGMENT-WORKFLOW-EVENTS` | `SegmentServiceImpl.triggerEvaluationWorkflow(...)` (tạo segment / API evaluate / update rules) | `gf-customer` `SegmentWorkflowConsumer` (self-consume) | ≤ 5s | `confirmed-two-sided` | self-consume → kick Temporal workflow |

> **Stripped 2026-05-07** (per source-of-truth audit): 3 rows `config-dto-only` (`CustomerCreated`, `CustomerUpdated`, `SegmentEvaluated`). `CustomerCreated` helper `batchCreateCustomerEvents` chỉ có caller commented out → dead code; `CustomerUpdated`/`SegmentEvaluated` DTO + topic config tồn tại nhưng không có producer call-site runtime. DTO inactive vẫn document tại §3.


| Config key | Default topic |
|---|---|
| `kafka.topics.customer-events` | `DEV-CUSTOMER-EVENTS` |
| `kafka.topics.segment-workflow-events` | `DEV-SEGMENT-WORKFLOW-EVENTS` |
| `kafka.topics.segment-evaluated-events` | `DEV-SEGMENT-EVALUATED-EVENTS` |

Rủi ro cấu hình: placeholder env trong `application.yml` đang dùng tên có dấu gạch ngang như `${CUSTOMER-EVENTS:...}`, `${SEGMENT-WORKFLOW-EVENTS:...}`, `${SEGMENT-EVALUATED-EVENTS:...}`. Khi deploy qua môi trường không hỗ trợ env var chứa `-`, default topic có thể được dùng ngoài ý muốn.

---

## 3. Schemas

### 3.1 `CustomerCreated`

**Trigger**: Batch import helper `CustomerServiceImpl.batchCreateCustomerEvents(...)` tạo outbox.
Source: `create(...)`/`createAndGetDetail(...)` runtime path KHÔNG publish event này.

**Payload** (raw DTO):
```json
{
  "eventId": "uuid",
  "eventType": "CustomerCreatedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "gf-customer",
  "tenantId": 0,
  "customerId": 0,
  "customerCode": "string",
  "fullName": "string",
  "phone": "string",
  "email": "string|null",
  "leadSource": "MANUAL|IMPORT|QR_SCAN|...",
  "leadId": "string|null"
}
```

Outbox metadata: `aggregateType=Customer`, `aggregateId=customer.id`, `eventType=CustomerCreatedEvent`, `topic=customer.events`.

**Idempotency**: Producer outbox; helper path inactive runtime nên dedup chưa được verify.

### 3.2 `CustomerUpdated`

**Trigger**: DTO tồn tại nhưng chưa có code tạo outbox/publish trong source hiện tại.

**Payload** (raw DTO):
```json
{
  "eventId": "uuid",
  "eventType": "CustomerUpdatedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "gf-customer",
  "tenantId": 0,
  "customerId": 0,
  "customerCode": "string",
  "fullName": "string",
  "phone": "string",
  "email": "string|null"
}
```

KHÔNG được giả định có `changedFields`; field này không có trong `CustomerUpdatedEvent` source.

**Idempotency**: N/A — chưa có producer path.

### 3.3 `CustomerMerged`

**Trigger**: `CustomerServiceImpl.mergeCustomers(...)` (confirmed source).

**Payload** (raw DTO):
```json
{
  "eventId": "uuid",
  "eventType": "CustomerMergedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "gf-customer",
  "tenantId": 0,
  "primaryCustomerId": 0,
  "primaryCustomerCode": "string",
  "mergedCustomerIds": [0],
  "mergedAt": "ISO-8601"
}
```

Outbox metadata: `aggregateType=Customer`, `aggregateId=primaryCustomerId`, `eventType=CustomerMergedEvent`, `topic=customer.events` (hardcode literal), Kafka key `Customer-{primaryCustomerId}`.

**Idempotency**:
- Producer: outbox + Redis lock (xem §1 ràng buộc).
- Consumer: chưa xác nhận (external/unknown).

### 3.4 `SegmentEvaluateRequested`

**Trigger**: `SegmentServiceImpl.triggerEvaluationWorkflow(...)` — gọi khi tạo segment, gọi API evaluate segment, update segment rules.

**Payload** (Kafka value `SegmentMessage` + headers `MessageGroup=SEGMENT`, `MessageStep=SEGMENT.EVALUATE.1`, `OriginTenantId={tenantId}`, `OriginMessageCode=null`):
```json
{
  "tenantId": 0,
  "segmentId": 0
}
```

Outbox metadata: `aggregateType=CustomerSegment`, `aggregateId=segmentId`, `eventType=SegmentEvaluateEvent`, `topic=${kafka.topics.segment-workflow-events}`, Kafka key `CustomerSegment-{segmentId}`.

**Idempotency**:
- Producer: outbox + headers extracted bởi `OutboxEventListener`.
- Consumer: `SegmentWorkflowConsumer` chỉ xử lý nếu `MessagePayload.type == "SEGMENT_EVENT"` và `data` parse được `SegmentWorkflowPayload` có `tenantId`+`segmentId`.
- Workflow: id hiện có UUID suffix `segment-evaluation-{tenantId}-{segmentId}-{uuid}`, `WorkflowIdReusePolicy=ALLOW_DUPLICATE` → Kafka replay có thể start workflow mới nếu không có dedup ngoài.

**Critical use case**: Self-consume → trigger Temporal evaluation workflow (xem §4). KHÔNG dùng UUID suffix nếu cần dedup theo segment.

### 3.5 `SegmentEvaluated`

**Trigger**: DTO tồn tại + config topic `segment-evaluated-events`, nhưng chưa thấy producer path.

**Payload** (raw DTO):
```json
{
  "eventId": "uuid",
  "eventType": "SegmentEvaluatedEvent",
  "eventVersion": "v1",
  "timestamp": "ISO-8601",
  "source": "gf-customer",
  "tenantId": 0,
  "segmentId": 0,
  "segmentName": "string",
  "memberCount": 0,
  "evaluatedAt": "ISO-8601"
}
```

---


## 4. Forbidden patterns

- ❌ Giả định `CustomerCreated`, `CustomerUpdated`, `SegmentEvaluated` đã publish trong runtime hiện tại nếu không có producer path đang chạy.
- ❌ Dùng topic config `DEV-CUSTOMER-EVENTS` để mô tả `CustomerMerged` hiện tại; source đang hardcode `"customer.events"`.
- ❌ Thêm customer event mới bằng literal topic; phải dùng config topic và cập nhật tài liệu nếu source đổi.
- ❌ Thêm `changedFields` vào `CustomerUpdatedEvent` contract khi DTO source chưa có field này.
- ❌ Gửi segment workflow event dạng raw `SegmentWorkflowPayload`; consumer kỳ vọng message wrapper có `type=SEGMENT_EVENT`.
- ❌ Rely vào scheduled retry để preserve custom Kafka headers; `OutboxProcessor` retry path gửi raw payload bằng `kafkaTemplate.send(topic, key, payload)` và không copy headers như `OutboxEventListener`.
- ❌ Giả định retry threshold chỉ theo `outbox.max-retries`; domain `OutboxEvent.markAsFailed` hiện hardcode `retryCount >= 3`.
- ❌ Replay segment workflow event nếu chưa có chiến lược idempotency; workflow id hiện thêm UUID và cho phép duplicate.
- ❌ Log full phone/email/content nếu không mask PII.
- ❌ Tạo inbound section trong file này cho `SendMessageRequested` (producer = `gf-marketing`) — vi phạm producer-view discipline (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)). Consumer concern (`InteractionConsumer` skip `MESSAGE.SEND.2`, dedup bằng `eventId`) document tại [gf-marketing-events.md](gf-marketing-events.md) §2.

---

## 5. References

- [`_CONVENTIONS.md`](_CONVENTIONS.md) §11 inventory + §12 discovery semantics
- Producer file của event mà boundary này consume:
  - [gf-marketing-events.md](gf-marketing-events.md) — `SendMessageRequested`

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial events spec cho `customer` boundary: 5 outbound events (`CustomerCreated`/`CustomerUpdated`/`CustomerMerged`/`SegmentEvaluateRequested`/`SegmentEvaluated`) trên topic `customer.events`/`DEV-CUSTOMER-EVENTS`/`DEV-SEGMENT-WORKFLOW-EVENTS`/`DEV-SEGMENT-EVALUATED-EVENTS`; outbox `OutboxEventListener`+`OutboxProcessor` với Redis lock; envelope mix raw DTO + `SegmentMessage` cho headers `MessageGroup=SEGMENT`/`MessageStep=SEGMENT.EVALUATE.1`; `SegmentEvaluateRequested` self-consume kick Temporal evaluation workflow. Bao gồm producer summary, catalog 5 row, schemas 4-part, forbidden patterns, references. |
| 2026-05-07 | v2 | Source-of-truth reconcile: strip 3 rows `config-dto-only` khỏi catalog (`CustomerCreated`, `CustomerUpdated`, `SegmentEvaluated`); KG `events.produces` strip orphan topic `segment-evaluated-events` (DTO tồn tại, no producer code). Catalog còn 2 active (`CustomerMerged` topic-drift, `SegmentEvaluateRequested` self-consume). DTO inactive giữ tại §3 cho developer reference. |
