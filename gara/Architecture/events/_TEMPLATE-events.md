---
type: architecture
artifact_kind: events-per-boundary
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: "{{boundary}}"
last_reviewed: "2026-05-05"
---

<!--
PER-BOUNDARY EVENTS WRITING RULES — đọc trước khi điền template:

Mục đích: Catalog tất cả events do **boundary** này **publish** (producer view).
Convention chung xem `_CONVENTIONS.md`.

PRODUCER-VIEW DISCIPLINE (sss-aligned):
1. Mỗi file `{boundary}-events.md` mô tả CHỈ events boundary này publish.
2. Consumer concern (boundary X consume event của producer Y nội bộ) KHÔNG document
   trong X file. Thay vào đó: producer Y file §2 catalog "Primary consumers"
   column liệt kê X.
3. Discovery: ADLC agent dùng `_CONVENTIONS.md §11 Per-boundary inventory`
   (master index) + §12 Discovery semantics + producer file §2 "Primary consumers"
   để navigate cross-boundary topology.
4. KHÔNG duplicate schema event ở 2 file (anti-drift).

SPLIT §2.1 OUTBOUND + §2.2 INBOUND — chỉ khi:
- Boundary có inbound từ **producer external** (vd Driver+ → gf-sales, lambda → gf-marketing,
  ERP/COP → gf-erp-agent, IAM/HR → gf-system, PIM → gf-erp-mdm) — boundary owns schema
  mirror vì external producer không có doc canonical.
- Pure producer (không có external-source inbound) → §2 catalog phẳng, không split.
- KHÔNG dùng §2.2 cho event có producer internal — đó là consumer concern.

Quy tắc cấu trúc:
1. 5 section bắt buộc + 1 optional (§4 Workflow correlation — chỉ khi liên quan Temporal)
2. §1 Producer summary: bảng metadata service + epic + schema artifact (placeholder TBD)
3. §2 Catalog: flat 8-column (#, Event Type, Topic, Trigger, Primary consumers, SLA, Status, Note). Split §2.1+§2.2 nếu có external-source inbound.
4. §3 Schemas: 1 sub-section per event với **4 phần** (Trigger / Payload / Idempotency
   / Critical use case). KHÔNG có Flow 3-sub-section breakdown.
5. §5 Forbidden patterns: ≥ 3 ❌ rule với BR/PCI/cross-tenant ref + 1 rule producer-view discipline
6. §6 References + Change log

Quy tắc nội dung:
1. Topic naming theo `_CONVENTIONS.md §2`: source de facto patterns (`AC-DEV-*`/`AC-NONPROD-DEV-*`/`DEV-*`/`dev-*`/anomaly `customer.events`).
   Single column "Topic" trong catalog reflect source state — KHÔNG tạo "Target topic" column aspiration.
2. Event type PHẢI present-perfect (`wo-confirmed` ✅, `confirm-wo` ❌).
3. Payload JSON minh hoạ dùng comment type (vd `BIGINT`, `ISO-8601 UTC`, `enum: A|B|C`).
4. KHÔNG include card data / PAN / CVV / password / raw token trong payload.
5. Mọi event mandatory `tenantId` (multi-tenant invariant).
6. Trigger ≤ 3 dòng + BR/ADR ref + 1 dòng producer call-site brownfield
   (vd `PurchaseOrderApplicationServiceV2.updatePoDelivering`).
7. Idempotency: producer mechanism + consumer dedup, 1-2 dòng.
8. Critical use case (optional): cornerstone BR-CORNER ref + invariant.
9. KHÔNG dùng mermaid diagram trong event file (per convention) — narrative numbered list.
10. Mục tiêu độ dài: ≤ 200 lines (sss avg 145; GMS brownfield relax 1.4×).
11. Status tag (5 chuẩn — KHÔNG tự thêm variant): `confirmed-two-sided`,
    `source-aligned-producer-only`, `consumer-only-confirmed`, `config-dto-only`,
    `topic-drift-risk`. Note column cho nuance brownfield.
-->

# Events — `{{boundary}}` boundary

> Producer = `{{service-name}}` service. Convention chung xem [`_CONVENTIONS.md`](_CONVENTIONS.md).
>
> {{Optional callout: số event + đặc điểm chính, vd "5 events — lifecycle phức tạp nhất sau commerce split (ADR-001). Workflow durable bằng Temporal (ADR-007)."}}
>
> {{Optional cross-link nếu boundary consume event của producer khác — vd "consume `BookingCompleted` từ `gf-sales` để trigger campaign, xem [gf-sales-events.md](gf-sales-events.md) §2."}}

---

## 1. Producer summary

| Thuộc tính | Giá trị |
|---|---|
| Producer service | `{{service-name}}` |
| Owned epics | {{EP-XXX}}, {{EP-YYY}} |
| Schema artifact | `TBD — Avro hardening deferred` (xem [`_CONVENTIONS.md`](_CONVENTIONS.md) §1) |
| Avro namespace | `com.actechx.events.{{boundary}}.*` (planned) |
| Total events | {{N outbound}}{{ + M external-source inbound nếu có §2.2}} |
| Reliability | {{Outbox + scheduled retry / direct publish / Kafka native}} |
| Canonical envelope | {{KafkaMessageWrapper / common Message + headers / raw DTO}} (per `_CONVENTIONS.md §3`) |

---

## 2. Catalog

> **Producer-view only** — chỉ liệt kê event boundary này **publish** (sở hữu schema).
> Để biết boundary này consume event nào, tra [`_CONVENTIONS.md §11`](_CONVENTIONS.md) Per-boundary inventory + §12 Discovery semantics.
>
> **Split §2.1 + §2.2** chỉ áp dụng khi boundary có inbound từ producer external (vd Driver+, lambda, ERP/COP). Pure producer giữ §2 phẳng (xóa hai sub-heading bên dưới + dùng 1 bảng).

### 2.1 Outbound _(boundary publish ra)_

| # | Event Type | Topic | Trigger | Primary consumers | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 1 | `{{EventName1}}` | `{{TOPIC-1}}` | {{When/why fires}} | `{{consumer-1}}`, `{{consumer-2}}` | ≤ {{Ns}} | `confirmed-two-sided` | — |
| 2 | `{{EventName2}}` | `{{TOPIC-2}}` | {{...}} | `{{consumer}}` | ≤ {{Ns}} | `source-aligned-producer-only` | {{nuance}} |

### 2.2 Inbound — external-source _(optional — chỉ khi consume từ producer external)_

> Các event sau có producer **external** (Driver+, lambda, ERP/COP, IAM/HR, PIM, ...) — boundary này owns schema mirror vì external không có canonical doc. **KHÔNG** dùng §2.2 cho event có producer internal — đó là consumer concern, đọc producer file §2.

| # | Event Type | Topic | Producer source | Triggered logic | SLA | Status | Note |
|---|---|---|---|---|---|---|---|
| 3 | `{{InboundEvent1}}` | `{{TOPIC-EXT}}` | External: {{Driver+ / lambda / ERP-COP / IAM-HR / PIM}} | {{Consumer logic — dedup inbox + side effect}} | ≤ {{Ns}} | `consumer-only-confirmed` | {{nuance}} |

> **SLA convention**: ≤ 5s critical (UX-blocking) / ≤ 10s normal / ≤ 30s low / `N/A` config-only.
>
> **Status tag** (5 chuẩn — không tự thêm variant):
> - `confirmed-two-sided`: producer + consumer verified trong code
> - `source-aligned-producer-only`: producer code rõ, consumer external/unknown
> - `consumer-only-confirmed`: consumer code rõ, producer external/unknown
> - `config-dto-only`: DTO/config tồn tại nhưng chưa wire publish/consume runtime
> - `topic-drift-risk`: producer/consumer default topic khác nhau hoặc legacy migration phase
>
> **Note column**: brownfield nuance ≤ 60 ký tự (vd "drift: producer ≠ consumer default", "ack-on-error: lỗi domain bị catch", "multi-step: route theo MessageStep", "hardcode literal vs config"). Dùng "—" nếu không có.

---

## 3. Schemas

> Mỗi event có **4 phần**: **Trigger** / **Payload** / **Idempotency** / **Critical use case** _(optional)_. Mục tiêu ≤ 30 dòng/event.

### 3.1 `EventName1`

**Trigger**: {{Mô tả nghiệp vụ ≤ 3 dòng + BR/ADR ref}}.
Source: {{producer call-site reference brownfield, vd `PurchaseOrderApplicationServiceV2.updatePoDelivering` — bỏ row này nếu greenfield}}.

**Payload** (Kafka value `KafkaMessageWrapper` + headers `MessageGroup={...}`, `MessageStep={...}`, `OriginTenantId={tenantId}`, `OriginMessageCode={businessCode}`; `data` JSON string):
```json
{
  "tenantId": "BIGINT — partition key + multi-tenant context",
  "{{aggregateId}}": "BIGINT",
  "{{businessKey}}": "string (UUID — links related events)",
  "{{field1}}": "decimal | string | enum: A | B | C",
  "{{field2}}": {
    "{{nested1}}": "decimal",
    "{{nested2}}": "string"
  },
  "{{occurredAt}}": "ISO-8601 UTC"
}
```

**Idempotency**:
- Producer: {{outbox unique constraint / `@TransactionalEventListener(AFTER_COMMIT)` / direct publish race risk}}.
- Consumer: {{Inbox table / `processed_events` / Redis SETNX TTL / workflow id pattern}}; dedup key `{{exact key — vd messageId, eventId, businessCode}}`.

**Critical use case** _(optional, chỉ khi cornerstone)_: {{BR-CORNER ref + invariant — vd "BR-CORNER-014 WO Confirmation Gate: class KHÔNG transition SCHEDULED cho đến khi tất cả WO cùng marketplaceReferenceId đều CONFIRMED."}}

### 3.2 `EventName2`

**Trigger**: {{...}}.
Source: {{...}}.

**Payload**:
```json
{
  "tenantId": "BIGINT",
  "{{aggregateId}}": "BIGINT",
  "reason": "enum: REASON_A | REASON_B | REASON_C",
  "{{occurredAt}}": "ISO-8601 UTC"
}
```

**Idempotency**: {{...}}

_(repeat pattern cho mỗi outbound event)_

### 3.X `InboundExternalEventN` _(chỉ khi §2.2 có row)_

**Producer source**: {{Driver+ / lambda / ERP / IAM-HR / PIM — external system; tên cụ thể}}.

**Trigger upstream**: {{Khi nào external producer phát event này — copy ngắn từ external doc nếu có}}.

**Payload** (raw DTO hoặc envelope external):
```json
{
  "{{externalField1}}": "type",
  "{{externalField2}}": "type"
}
```

**Consumer logic** (`{{this-boundary}}` xử lý):
1. Consume topic `{{LEGACY-TOPIC-EXT}}`.
2. Inbox dedup theo `eventId` (Pattern A Redis hoặc Pattern B Postgres `processed_events`).
3. {{Domain logic — vd "update local projection + transition aggregate state"}}.
4. {{Side effect — vd "publish derived event ra outbox cho consumer downstream"}}.

**Idempotency**: {{Inbox dedup key + scope}}.

---

## 4. Workflow correlation (Temporal) _(optional — chỉ thêm khi event liên quan Temporal workflow)_

{{Workflow flow narrative}}:

1. {{Trigger event}} → publish `gms.{{boundary}}.{{event-1}}`.
2. {{Process step}} → spawn Temporal workflow `{{WorkflowName}}` (xem [workflows/{{flow}}.md](../workflows/{{flow}}.md)).
3. Workflow waits for {{signal}} → publish `gms.{{boundary}}.{{event-2}}` với `causationId = event-1.eventId`.
4. {{Timeout / success}} → publish `gms.{{boundary}}.{{event-3}}`.

**`causationId` envelope chain**:
- `event-2.causationId = event-1.eventId` (truy ngược root cause).

> KHÔNG dùng mermaid diagram (per convention) — narrative numbered list bắt buộc.

---

## 5. Forbidden patterns

- ❌ {{Forbidden 1}} — {{vi phạm BR/ADR}} (vd: "Publish `wo-confirmed` cho 1 WO cá biệt nếu các WO khác cùng `marketplaceReferenceId` chưa confirm — vi phạm BR-CORNER-014").
- ❌ {{Forbidden 2}} (vd: "Skip outbox pattern — race condition giữa DB commit và broker publish").
- ❌ {{Forbidden 3}} (vd: "Publish event chứa raw secret, password, JWT, card PAN/CVV — PCI compliance").
- ❌ {{Forbidden 4}} (vd: "Đổi `marketplaceReferenceId` sau khi event đầu tiên publish — phá causationId chain").
- ❌ Tạo inbound section trong file consumer nếu producer là internal boundary khác — vi phạm producer-view discipline (xem [`_CONVENTIONS.md §12`](_CONVENTIONS.md)).

---

## 6. References / Cross-references

- **TECHSTACK**: §X.Y ({{boundary service responsibilities}})
- **ADRs**:
  - ADR-NNN ({{decision relevant to events}})
  - ADR-MMM
- **Business rules**: BR-CORNER-NNN _(cornerstone nếu có)_, BR-{{boundary}}-NNN
- **Conventions**: [`_CONVENTIONS.md`](_CONVENTIONS.md) — partition key, envelope, idempotency, retry, observability, discovery semantics
- **Cross-link** _(producer-view, KHÔNG cross-link 2 chiều với anchor row#)_:
  - HLD: [{{boundary}}-HLD.md](../hld/{{boundary}}-HLD.md)
  - API: [{{boundary}}-api.md](../api/{{boundary}}-api.md)
  - Workflows: [{{flow}}.md](../workflows/{{flow}}.md) _(nếu liên quan)_
  - Producer file của event mà boundary này consume (vd "consume `BookingCompleted` từ gf-sales → xem [gf-sales-events.md](gf-sales-events.md)")
- **Product**: epic {{EP-XXX}}, features {{FEAT-NNN..MMM}}
- **Open items** _(optional)_: open issue chưa giải quyết theo events convention

---

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-05 | v1 | Initial — {{N}} events ({{list event names}}) |
