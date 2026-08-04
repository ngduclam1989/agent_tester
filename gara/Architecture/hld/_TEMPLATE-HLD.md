---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: "{{boundary}}"
last_reviewed: "2026-07-04"
---

<!--
HLD WRITING RULES — đọc trước khi điền template:

1. KHÔNG duplicate API spec → link `Architecture/api/<boundary>-api.md`
2. KHÔNG duplicate event payload → link `Architecture/events/<boundary>-events.md`
3. KHÔNG mô tả chi tiết workflow steps → link `Architecture/workflows/<flow>.md`
4. KHÔNG paste DTO/Enum catalog / Repository contract (thuộc LLD)
5. Component diagram chỉ là C4 Level 3 (boxes ASCII), không vẽ class/sequence
6. Mỗi quyết định phải dẫn được ADR hoặc TECHSTACK §X (nếu chưa có ADR → tạo ADR-stub trước)
7. Quality Attributes phải đo được (p95 ≤ Nms / ≥ N RPS / ≥ N%) — không viết "fast", "scalable"
8. Forbidden Actions phải dẫn nguồn (BR-CORNER-NNN / ADR-NNN / PCI / PRD §X)
9. Mục tiêu độ dài: ≤ 250 lines / file
10. "Scope clarification" callout đầu file chỉ thêm khi có constraint dễ nhầm (vd "không host live class")
-->

# HLD — `{{service-or-app-name}}`

> _(optional callout)_ Scope clarification / Phase gate / TBD dependency note. **Xoá nếu không cần.**

## 1. Overview

{{1 đoạn mô tả: boundary làm gì, vì sao tồn tại, đặc trưng kỹ thuật (long-running? stateless? cornerstone? thin-client?)}}

**Trách nhiệm:**
- {{trách nhiệm chính 1}}
- {{trách nhiệm chính 2}}
- {{...}}

**Owned epic / Owned epic portion**: {{EP-XXX}} ({{FEAT-NNN..MMM}}, ~N features).

> Nếu là cross-cutting infra (auth, gateway): ghi "KHÔNG có Product epic mapping — boundary là cross-cutting infrastructure".

## 2. Component Diagram (C4 Level 3)

```
┌─────────── {{service-name}} ({{deploy-name}}) ────────────┐
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐         │
│  │ {{CtrlA}}  │  │ {{CtrlB}}  │  │ {{Consumer}} │         │
│  │ /api/v1/*  │  │ /api/v2/*  │  │ inbox dedup  │         │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘         │
│  ┌─────▼────────────────▼─────────────────▼───────┐       │
│  │ {{CoreService}} / {{Noun}}Workflow (Temporal)  │───────┼─► Temporal Cloud {{QUEUE}}
│  │   - {{state machine guard · flag}}             │       │
│  │   - cross-boundary check → {{boundary-A/B}}     │      │
│  └─────┬───────────────────────────────────────────┘      │
│  ┌─────▼──────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ JPA/Flyway │  │ Kafka P/C    │  │ HttpClients  │───────┼─► {{boundary-A}}  (protected REST)
│  │ [<schema>] │  │ outbox+prod  │  │ (protected   │───────┼─► {{boundary-B}}  (protected REST)
│  └─────┬──────┘  └──────┬───────┘  │  REST, R4j)  │───────┼─► {{external: Keycloak/S3/SES}}
│        │                │          └──────────────┘       │
│  outbox │ /api/v1..v3/* │ /protected/v1/* │ Actuator+OTLP │
└────────┴────────────────┴─────────────────────────────────┘
        ▼                ▼
   PostgreSQL [<schema>]    Kafka: {{topic.*}} publish ;
   + Redis (cache/lock)     {{topic.*}} subscribe
```

> Quy tắc diagram (C4 Level 3 — bám grammar  HLD, giữ mật độ vận hành của Garage):
> - **Một box service duy nhất**; component là **sub-box xếp theo tầng** từ trên xuống (KHÔNG dùng band-label box lồng).
>   Component đặt tên theo **artifact code thật** (`*Ctrl`, `*Service`, `*Workflow`, `*Saga`, `*Engine`, `*Client`, `*Consumer`, `*Scheduler`) — **không** vẽ class/sequence/method/DTO.
> - **Xếp tầng hexagonal** (vị trí dọc = tầng, không cần nhãn): inbound adapter (Ctrl/Consumer/Scheduler) trên cùng →
>   core `app/service`+`domain` (Service/Workflow/Engine) giữa → outbound adapter (JPA/Flyway · Kafka · HttpClients) đáy → infra dưới box.
> - **Connector `┬`/`▼`** nối các tầng để thể hiện luồng gọi nội bộ (fan-in: nhiều `┬` đáy box trên → nhiều `▼` nóc box nhận).
> - **External service calls = side-exit `───┼─►`** (BẮT BUỘC mô tả đủ): MỖI call đồng bộ ra ngoài là **một mũi tên riêng** xuyên đúng viền phải, từ node phát call:
>   - sync REST sang boundary khác → từ node `HttpClients`, fan-out nhiều dòng `───┼─► {{boundary}} (protected REST)` (một dòng / một downstream boundary).
>   - external system (Keycloak, AWS S3, SES, COP/ERP gateway…) → `───┼─► {{system}}` từ node client tương ứng.
>   - Temporal → `───┼─► Temporal Cloud {{QUEUE}}` ngay tại node workflow (`<DomainNoun>Workflow`); KHÔNG gộp Temporal vào infra footer.
> - **Async external** = Kafka: ghi ở infra footer kèm semantics `{{topic.*}} publish` / `{{topic.*}} subscribe` (P/C).
> - **Interface footer**: dòng áp chót trong box liệt kê interface phơi ra ngoài (`outbox`, `/api/v1..v3/*`, `/protected/v1/*`, GraphQL schema, middleware/Actuator+OTLP).
> - **Infra footer**: dưới box có `▼` + nhãn infra kèm semantics — PostgreSQL `[<schema>]`, Redis (cache/lock), Kafka topic P/C.
> - **Right-margin annotation** (tuỳ chọn): liệt kê schema ops / topic subscribe bên phải ngoài viền khi node nhiều (BFF resolver, KafkaConsumers) — tránh nhồi vào node.
> - **Stateless variant** (BFF `agg-*`): core = resolvers/DataLoader; đáy = `ServiceClients (axios)` fan-out `┬─┬─┬` xuống danh sách N downstream service (mỗi `▼` một service).
>   **Frontend**: Screens (bullet màn hình) → state (Apollo cache + Zustand) → Apollo Client → side-exit `───┼─►` tới BFF.
> - Alignment: ưu tiên đọc được; lệch 1–2 ký tự chấp nhận được .

## 3. Key Design Decisions

| Decision | Rationale | ADR / Reference |
|---|---|---|
| {{quyết định 1}} | {{trade-off thật, vì sao chọn X thay vì Y}} | [ADR-NNN](../decisions/ADR-NNN-...md) hoặc TECHSTACK §X |
| {{quyết định 2}} | {{...}} | {{...}} |

> Tối thiểu 4 row, tối đa 8 row. Nhiều hơn → tách ADR riêng.

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| {{caller}} | Sync REST / GraphQL / Async consume / Webhook | {{mục đích}} |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| {{dependency}} | Sync REST / Async publish / gRPC / Cache / DB | {{mục đích}} |

> Type chuẩn enum: `Sync REST` | `GraphQL HTTPS` | `Async publish` | `Async consume` | `Webhook` | `gRPC` | `Cache` | `DB`.
> Nếu publish event → ghi `Async publish | N events` + link `events/<boundary>-events.md` ở §9 References.
> Nếu dùng Temporal → row `Temporal Cloud | gRPC | <WorkflowName>`.

## 5. Data Ownership

**Owned ({{PostgreSQL `<schema>` schema | stateless | client-side state}}):**
- `{{table_name}}` ({{cột chính, status enum nếu có, ...}})
- `{{table_name}}` ({{...}})
- `outbox`

**KHÔNG own**: {{những thứ delegate sang boundary khác}}

> Backend service: chỉ liệt kê table chính + cột quan trọng (KHÔNG full DDL — đó là LLD).
> Stateless service (BFF, gateway): viết "**Stateless** — KHÔNG own database" + cache key prefix nếu có.
> Frontend: "**KHÔNG own DB**" + client store (Apollo cache, Zustand/Riverpod store) + secure storage.

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| {{metric}} p95 | ≤ {{N}} ms |
| {{throughput metric}} | ≥ {{N}} RPS sustained per tenant |
| {{availability}} | ≥ {{N.N}}% |
| {{...}} | {{...}} |

> Đơn vị bắt buộc: `p95 ≤ Nms` / `≥ N RPS` / `≥ N%`. Không "fast", "responsive".
> Tối thiểu 4 row.
> Nếu override SLA mặc định của SYSTEM-ARCHITECTURE → đổi tiêu đề thành "Quality Attributes (overrides)".

## 7. Performance & Scale (SaaS multi-tenant)

> **Rule (Reviewer G12 enforce — v5)**: BẮT BUỘC cho mọi `{B}-HLD.md`. Cover ≥ 5/6 items dưới. Section missing → **P0**. Section tồn tại nhưng < 5/6 items → **P1**. Index tenant-scoped table KHÔNG bắt đầu `(tenant_id, ...)` → **P0** (correctness — cross-tenant data-leak risk).

### 7.1. Expected load

| Metric | Target | Source |
|---|---|---|
| QPS peak per tenant | {{100}} | {{PRD §NFR / propose default + open_questions}} |
| p95 latency (read) | ≤ {{300}} ms | {{TECHSTACK SLA / override lý do}} |
| p95 latency (write) | ≤ {{500}} ms | {{...}} |
| Tenant count assumption | {{500}} concurrent | {{Product NFR}} |

### 7.2. Pagination strategy

- List endpoints: **cursor-based** (`pageSize` + `nextCursor`) — default. Offset chỉ khi total ≤ 10k rows (justify explicit).
- Default page size: {{20}}. Max page size: {{100}}.
- Applied endpoints: {{`GET /service-orders`, `GET /bookings`, ...}}.

### 7.3. Index list

| Query pattern | Index | Table | Note |
|---|---|---|---|
| List by tenant + status | `(tenant_id, status, created_at DESC)` | `service_orders` | Tenant-scoped — **bắt buộc** `tenant_id` prefix |
| Lookup by business code | `(tenant_id, code) UNIQUE` | `service_orders` | Cover cho GET-by-code + unique constraint |
| Filter by branch + date range | `(tenant_id, branch_id, event_date)` | `bookings` | Cover branch-scoped dashboard |

### 7.4. Cache strategy

| Cache key | Layer | TTL | Invalidation |
|---|---|---|---|
| `catalog:{tenantId}:{productId}` | Redis | 10m | Event `PRODUCT_UPDATED` |
| `permission:{userId}` | Redis | 5m | Event `ROLE_CHANGED` |
| `dashboard-agg:{tenantId}:{date}` | Redis | 1m | TTL only (eventual consistency chấp nhận) |

### 7.5. N+1 avoidance

| Endpoint / query | Pattern | Mitigation |
|---|---|---|
| `GET /service-orders?include=customer,vehicle` | List + nested projection | JOIN in query (single SQL) hoặc DataLoader ở BFF |
| Dashboard aggregate | Fan-in nhiều bảng | Materialized view / projection table refresh async qua Kafka event |

### 7.6. Tenant fairness / rate limit

- Per-tenant rate limit: {{100 req/s per tenant per endpoint}} (Redis token bucket).
- Bulkhead: {{background job Temporal worker concurrency cap = 5 per tenant}} — no noisy-neighbor.
- Circuit breaker: Resilience4j downstream client — {{failure rate 50% / open 30s}}.

## 8. Forbidden Actions

- ❌ {{hành vi bị cấm 1}} ({{BR-CORNER-NNN | ADR-NNN | PCI | PRD §X.Y}}).
- ❌ {{hành vi bị cấm 2}} ({{...}}).
- ❌ {{...}}
- ❌ Index tenant-scoped table không có `tenant_id` prefix — cross-tenant data leak.
- ❌ Offset pagination cho list > 10k rows — performance degradation (dùng cursor).

> Tối thiểu 3 item nghiệp vụ / security + 2 item performance. Mỗi item bắt đầu bằng ❌ + dẫn nguồn cuối câu.
> Bao gồm cả security forbidden (log secret, plaintext token, cross-tenant) và business forbidden (status invariant, currency).

## 9. References

- **TECHSTACK**: §{{X.Y}}
- **ADRs**: [ADR-NNN](../decisions/ADR-NNN-...md), [ADR-MMM](../decisions/ADR-MMM-...md)
- **API spec**: [{{boundary}}-api.md](../api/{{boundary}}-api.md)
- **Events spec**: [{{boundary}}-events.md](../events/{{boundary}}-events.md)
- **Workflows**:
  - [{{flow-name}}](../workflows/{{flow-file}}.md)
  - [{{flow-name}}](../workflows/{{flow-file}}.md)
- **Business rules**: BR-CORNER-NNN, BR-{{boundary}}-NNN
- **Product**: epic {{EP-XXX}}, features {{FEAT-NNN..MMM}}
- **UX flows**: `Product/ux/UX-FLOW-...md` _(nếu boundary chạm UX)_
- **Cross-link**:
  - {{related HLD 1}}: [{{related-HLD}}.md]({{related-HLD}}.md)
  - {{related HLD 2}}: ...

> Mọi ADR / TECHSTACK § / events / BR đề cập trong nội dung phải xuất hiện ở đây.
> SA feedback: "tài liệu refer đến" — section này là single source cho mọi link.

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-05 | v1 | Initial HLD |
| 2026-05-30 | v2 | §2 chuẩn hoá  theo grammar C4 L3: một box service + sub-box xếp tầng hexagonal + connector `┬`/`▼` luồng gọi/fan-in + **external service calls fan-out `───┼─►`** (sync REST/boundary, external system, Temporal) + Kafka P/C semantics ở infra footer + right-margin annotation; giữ interface footer + mật độ vận hành Garage |
| 2026-07-04 | v3 | **v5 tune pair (author/review)** — Insert **§7 Performance & Scale (SaaS multi-tenant)** với 6 sub-section (7.1 Expected load · 7.2 Pagination · 7.3 Index list · 7.4 Cache · 7.5 N+1 avoidance · 7.6 Tenant fairness / rate limit). Reviewer G12 enforce: section missing = P0, incomplete (<5/6) = P1, index tenant-scoped không tenant-prefix = P0. Renumber §7 Forbidden → §8, §8 References → §9. §8 Forbidden thêm 2 anti-pattern performance (index không tenant-prefix, offset pagination cho list lớn). Root cause: W01/W02 HLD không có perf design → downstream DEV tự chọn pagination pattern / index / cache sai cho SaaS 17-boundary. Pair với `agent-arch-author v5 §Phase 7b` + `agent-arch-review v5 §G12`. |
