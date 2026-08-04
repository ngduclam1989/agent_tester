---
type: architecture
artifact_kind: event-conventions
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-05-05"
---

<!--
EVENT CONVENTIONS WRITING RULES — đọc trước khi điền template:

Mục đích: T1 reference cho mọi `events/{boundary}-events.md`. File này chỉ chứa
**convention chung** áp dụng xuyên suốt — KHÔNG list event cụ thể (đã có trong
per-boundary file).

Mọi event mới PHẢI:
1. Đăng ký trong `events/{producer-boundary}-events.md` với schema đầy đủ.
2. Avro `.avsc` co-located trong producer repo (xem ADR-006).
3. Publish artifact `com.{system}:{producer}-events:X.Y.Z` lên producer's
   GitLab/Maven package registry.

Quy tắc cấu trúc:
1. 11 section cố định — không thêm/bớt
2. Mỗi section dùng bảng (table) cho data; bullet list cho rules + examples
3. Topic naming format MANDATORY: `{system}.{producer-boundary}.{event-type-kebab-case}`
4. Envelope CloudEvents-inspired với 7 mandatory + 3 optional field
5. Partition key = tenantId (FIXED — chỉ allow override với ADR riêng)
6. Outbox pattern producer + dedup consumer (Pattern A Redis / B Postgres)
7. Schema compatibility BACKWARD only — breaking change phải V2 event riêng
8. Consumer group naming: `{consumer-boundary}-of-{producer-boundary}`
9. DLQ retention `{topic}.dlq` — manual replay only (no auto-redrive)
10. Mục tiêu độ dài: ≤ 300 lines (sss avg 282)
-->

# Event Conventions — {{System}} async event plane

> **T1 reference cho mọi `events/{boundary}-events.md`.** Mỗi producer boundary có 1 file events riêng. File này chỉ chứa **convention chung** áp dụng xuyên suốt.
>
> Mọi event mới PHẢI:
> 1. Đăng ký trong `events/{producer-boundary}-events.md` với schema đầy đủ.
> 2. Avro `.avsc` co-located trong producer repo (xem [ADR-006](../decisions/ADR-006-...md)).
> 3. Publish artifact `com.{system}:{producer}-events:X.Y.Z` lên producer's package registry.

---

## 1. Transport & Hosting

| Thuộc tính | Giá trị | Reference |
|---|---|---|
| **Transport** | {{Azure Event Hubs / Kafka / RabbitMQ}} | ADR-NNN |
| **Production namespace** | `{{system}}-production-{{transport}}` | TECHSTACK §X |
| **Non-prod namespace** | `{{system}}-nonprod-{{transport}}` (dev + staging + simulator) | TECHSTACK §X |
| **Format** | {{Apache Avro (binary) / JSON Schema / Protobuf}} | ADR-NNN |
| **Compression** | {{snappy / gzip / lz4}} | — |
| **Retention** | {{N ngày production; N ngày non-prod; N ngày simulator}} | ADR-NNN |
| **Partition count default** | {{N per topic}}; scale qua portal khi consumer lag p95 > {{Ns}} | ADR-NNN |
| **Throughput unit** | {{Auto-inflate; baseline N TU production}} | — |

---

## 2. Topic Naming

### 2.1 Format (service-based naming — SA criteria)

```
{{system}}.{producer-service-boundary}.{event-type-kebab-case}
```

> **SA criterion**: Tên topic PHẢI reflect **service ownership** rõ ràng — không dùng tên Kafka legacy không gắn với service.
>
> - ✅ `gms.gf-sales.booking-status-changed` (clear service owner)
> - ❌ `AC-DEV-BOOKING-EVENTS` (legacy, không reflect service)
> - ❌ `BOOKING_TOPIC` (không namespace, không service)

- `producer-service-boundary` PHẢI khớp tên service trong `Architecture/hld/{boundary}-HLD.md` (vd `gf-sales`, `gf-inventory`, `gf-erp-agent`).
- `event-type-kebab-case` ngắn gọn, **present-perfect** (đã xảy ra):
  - ✅ `gms.gf-order.wo-confirmed`
  - ✅ `gms.gf-tenant.config-changed`
  - ❌ `gms.gf-order.confirm-wo` (imperative — sai)
  - ❌ `gms.gf-order.WO_CONFIRMED` (snake-case viết hoa — sai)

### 2.2 Legacy topic migration (gms-specific)

Topic legacy `AC-{ENV}-*` đang dùng trong production cần migrate sang format service-based qua 2-phase rollout:

| Phase | Action |
|---|---|
| **Current** | Producer publish dual-topic (legacy + new); consumer subscribe new topic |
| **Target** | Producer chỉ publish topic service-based; deprecate legacy sau 2 release |

Per-boundary file PHẢI tag status `topic-drift-risk` cho event đang ở phase migration.

### 2.3 Đặc biệt

- **External bridge** (vd Driver Plus, Teachly): producer consume external topic gốc (do external own naming), translate → re-publish thành `{{system}}.{{integration-boundary}}.{external}-{normalized-event}`. Internal consumer chỉ subscribe `{{system}}.*`, KHÔNG subscribe external topic direct.
- **Simulator**: prefix `simulator.{producer-boundary}.{event-type}`. Tách topic hoàn toàn khỏi prod, KHÔNG mix.
- **Dead-letter**: `{topic}.dlq` (vd `{{system}}.{{boundary}}.{{event}}.dlq`). Default 1 DLQ per topic; cần phân biệt consumer thì `{topic}.dlq.{consumer-service}`.

---

## 3. Envelope (CloudEvents-inspired)

Mỗi message có wrapper envelope:

```json
{
  "eventId": "UUID v4 — unique per event instance",
  "eventType": "{{system}}.{producer}.{event-type}",
  "eventVersion": "1.0.0 — semver",
  "tenantId": "BIGINT — partition key + multi-tenant context",
  "occurredAt": "ISO-8601 UTC — khi domain event xảy ra",
  "publishedAt": "ISO-8601 UTC — khi publisher gửi tới broker",
  "source": "{producer-boundary}",
  "correlationId": "UUID — propagate từ inbound request",
  "causationId": "UUID — eventId của event gây ra event này (nếu có)",
  "traceparent": "W3C Trace Context header value",
  "payload": { /* schema cụ thể trong {boundary}-events.md */ }
}
```

**Mandatory fields (7)**: `eventId`, `eventType`, `eventVersion`, `tenantId`, `occurredAt`, `source`, `correlationId`, `payload`.
**Optional fields (3)**: `causationId` (nếu có root cause event), `traceparent` (nếu có trace context), `publishedAt`.

---

## 4. Partition Key

**`partitionKey = tenantId`** (BIGINT serialize sang string).

**Lý do:**
- Per-tenant ordering preserve (BR-CORNER multi-tenant invariant).
- Avoid hot partition cho tenant lớn — khi single tenant > 80% throughput cần re-evaluate (có thể partition theo `(tenantId, aggregateId)`).

**Cấm dùng partition key khác:**
- ❌ `aggregateId` thuần → cross-tenant fan-out không ordered.
- ❌ Random key → consumer xử lý out-of-order.

---

## 5. Idempotency & Dedup

### 5.1 Producer

- Mọi event phải có `eventId` UUID v4 sinh tại producer **trước** khi publish.
- Producer dùng **outbox pattern**: write event row vào `outbox` table cùng DB transaction với mutation; async publisher poll outbox, publish to broker, mark sent. Tránh dual-write (DB commit nhưng publish fail → silent loss).
- Outbox table schema standard (mỗi backend repo tự implement, KHÔNG shared lib — ADR-005):

```sql
CREATE TABLE outbox (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL,
  event_id UUID NOT NULL UNIQUE,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,         -- envelope + payload encoded
  partition_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0
);
CREATE INDEX outbox_unpublished ON outbox(created_at) WHERE published_at IS NULL;
```

### 5.2 Consumer

- **At-least-once delivery** — broker guarantee not lost, nhưng có thể duplicate.
- Consumer **PHẢI** dedup bằng `eventId`:
  - **Pattern A**: Redis SET với key `{{system}}:event-dedup:{consumer-service}:{eventId}`, TTL 24h. `SETNX` → 0 nghĩa là đã xử lý.
  - **Pattern B**: Postgres `processed_events` table với UNIQUE constraint `(consumer_service, event_id)`. Insert trong cùng tx với side-effect; conflict → skip.
- Consumer chọn pattern theo nhu cầu (Pattern A nhanh, in-memory; Pattern B durable, transactional). KHÔNG có shared lib enforce — mỗi consumer repo tự implement.

### 5.3 Forbidden

- ❌ Publish event KHÔNG đi qua outbox (race condition giữa DB commit và broker publish).
- ❌ Consumer KHÔNG dedup → BR violation (vd billing chốt trùng cycle).
- ❌ Consumer giả định in-order delivery cross-partition (chỉ in-order trong cùng partition key).

---

## 6. Schema (Avro)

### 6.1 File location

- Producer repo: `schemas/avro/{event-type}.avsc` (1 file per event type).
- Avro namespace convention: `com.{{system}}.events.{producer}.{eventType}` (vd `com.{{system}}.events.order.WoConfirmed`).

### 6.2 Compatibility rules

| Change type | Compat | Allowed? |
|---|---|---|
| Add optional field (with default) | BACKWARD | ✅ |
| Add required field | INCOMPATIBLE | ❌ (CR MAJOR + new event type với version suffix V2) |
| Remove optional field | INCOMPATIBLE | ❌ (deprecate qua 2 minor versions trước) |
| Remove required field | INCOMPATIBLE | ❌ |
| Rename field | INCOMPATIBLE | ❌ (deprecate cũ + add mới + remove sau 2 versions) |
| Change field type | INCOMPATIBLE | ❌ |
| Add field to enum | BACKWARD (Avro default) | ✅ |
| Remove field from enum | INCOMPATIBLE | ❌ |

### 6.3 CI gate (mandatory trong producer repo)

- Compare schema mới với schema từ previous git tag.
- Tool: `gradle-avro-plugin` + script check BACKWARD compat (Avro default rule).
- Block merge nếu vi phạm (override chỉ qua label `breaking-ok` + ADR ref trong PR description).

### 6.4 Versioning event type

- Backward-compat changes → bump minor (`1.0.0 → 1.1.0`).
- Breaking changes → publish event mới với type suffix V2 (`{{system}}.{boundary}.{event}-v2`). Giữ V1 tối thiểu 2 minor producer versions để consumer migrate.

---

## 7. Retry & DLQ

### 7.1 Consumer retry policy

- **In-process retry**: 3 attempts với exponential backoff (1s → 2s → 4s).
- Sau 3 attempts fail → publish event lên `{topic}.dlq` + alert PagerDuty.
- DLQ entries phải được human-investigate (KHÔNG tự re-drive vô hạn).

### 7.2 Poison message handling

- Nếu schema parse fail → trực tiếp DLQ (không retry — corrupted message retry vô ích).
- Nếu domain logic fail (vd tenant not found) → retry, fall through DLQ nếu vẫn fail.

### 7.3 DLQ replay

- Manual replay qua admin tool (mỗi service có endpoint `/admin/dlq/replay/{eventId}` — require role `{{system}}:platform-admin`, audit log mandatory).
- Replay republishes event lên primary topic; consumer dedup catch nếu đã xử lý.

---

## 8. Consumer Group Naming

```
{consumer-boundary}-of-{producer-boundary}
```

Examples:
- `billing-of-order` (billing consumes from `{{system}}.order.*`).
- `support-of-payment-client` (support consumes from `{{system}}.payment-client.*`).

**Rule:** 1 consumer group per (consumer service, producer boundary) pair. Nếu 1 service consume nhiều topic từ cùng producer → cùng consumer group.

---

## 9. Observability

### 9.1 Metrics (mandatory)

**Producer**:
- `{{system}}.event.publish.count` (tag: `topic`, `tenant_id`).
- `{{system}}.event.publish.duration_ms` (histogram).
- `{{system}}.outbox.lag` (oldest unpublished outbox row age).

**Consumer**:
- `{{system}}.event.consume.count` (tag: `topic`, `consumer_group`).
- `{{system}}.event.consume.duration_ms`.
- `{{system}}.event.consume.lag_ms` (now - event.occurredAt).
- `{{system}}.event.dlq.count` (alert on > 0 sustained 5min).

### 9.2 Tracing

- Span `event.publish.{topic}` ở producer; span `event.consume.{topic}` ở consumer.
- Propagate `traceparent` header trong envelope → consumer span linked với producer span.

### 9.3 Logging

- JSON structured (Logback/pino).
- Mandatory fields per event log: `eventId`, `eventType`, `tenantId`, `correlationId`, `traceId`.
- KHÔNG log full payload nếu có PII (xem `Product/business-rules/`); log `payload.summary` field nếu cần.

---

## 10. Security

### 10.1 Auth

- Producer publish auth qua broker SAS token (per-namespace, rotated 90 ngày managed by platform team).
- Consumer pull auth tương tự.

### 10.2 PII trong payload

- KHÔNG include card data, password, raw biometric, JWT trong payload (PCI/PII compliance).
- PII (customer name, phone, email) acceptable — encrypted-at-rest tại broker storage, in-transit TLS.
- Config field non-secret (vd `merchant_code`) → có thể trong payload; KHÔNG phải card token.

### 10.3 Forbidden

- ❌ Publish event chứa raw secret, password, JWT, card PAN/CVV.
- ❌ Cross-tenant payload (`tenantId` + data của tenant khác trong cùng event) — anti-pattern.

---

## 11. Per-boundary inventory

Mỗi file `{boundary}-events.md` mô tả events do boundary đó **publish** (producer view).

| Producer boundary | File | Event count |
|---|---|---|
| `{{boundary-1}}` | [{{boundary-1}}-events.md]({{boundary-1}}-events.md) | {{N}} |
| `{{boundary-2}}` | [{{boundary-2}}-events.md]({{boundary-2}}-events.md) | {{N}} |
| ... | ... | ... |
| **Total** | — | **{{N}}** |

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-05 | v1 | Initial conventions doc |
