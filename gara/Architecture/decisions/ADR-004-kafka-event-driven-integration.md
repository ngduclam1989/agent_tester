---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: global
last_reviewed: "2026-05-07"
---

# ADR-004: Kafka Event-Driven Integration — Bất đồng bộ hoá domain events, integration events và worker triggers

## Status
ACCEPTED 

## Context

Garage có nhiều quy trình cross-service và external integration không phù hợp xử lý hoàn toàn bằng synchronous REST. Câu hỏi cần quyết định:

1. Cơ chế integration bất đồng bộ chính giữa các service Garage và external ERP/COP là gì?
2. Producer/consumer ownership, payload schema, key convention, DLQ và idempotency contract phải tuân theo chuẩn nào?
3. Khi nào dùng transactional outbox và khi nào publish trực tiếp sau commit?

**Evidence từ source / TECHSTACK:**
- Tenant/branch provisioning từ `ct-saas-tenant` sang `gf-system`, `gf-inventory` và downstream consumers.
- Sales/service order events sang marketing, notification, inventory worker và accounting handoff.
- Purchase order status events sang inventory worker/receipt workflow.
- Customer, segment, campaign, voucher và message events cho CRM/marketing automation.
- Notification request events từ domain services sang `gf-notification`.
- ERP/Ecom4G/COP bridge events qua `gf-erp-agent`.
- Inventory, accounting và worker flows cần retry, idempotent consumption và long-running side effects.
- Source có nhiều bằng chứng Kafka/Event Hubs: `@KafkaListener`, `KafkaTemplate`, topic config trong `application.yml/application.yaml`, outbox/inbox tables/services, manual acknowledgement, Redis lock cho outbox processor và event catalog tại `Architecture/events/event-contracts.md`.

**Constraints từ runtime:**
- Sales, purchase, inventory, accounting, notification và marketing cần phối hợp sau khi state đã commit, không nên khoá cùng distributed transaction.
- Worker services và Temporal activities cần trigger bền vững từ domain events.
- Outbox/inbox pattern đã xuất hiện ở nhiều service (`gf-sales`, `gf-customer`, `gf-marketing`, `gf-accounting`, `gf-inventory`, `gf-notification`).
- Event governance chưa đồng nhất: payload raw JSON/service DTO, key convention khác nhau, DLQ chưa chuẩn hoá, topic naming theo environment lệch.

**Business rules liên quan:** NA.

## Decision

**Sử dụng Kafka-compatible Event Hubs/Kafka làm cơ chế tích hợp bất đồng bộ chính giữa các Garage service, worker service và external ERP/COP channels; producer service là owner của event contract cho state change của mình.**

Quyết định bám sát source hiện tại — outbox/inbox pattern đã có, Kafka/Event Hubs đã được tích hợp, event catalog đã xuất hiện. Quyết định không khẳng định event governance đã hoàn tất; nó xác nhận hướng kiến trúc chính và đặt chuẩn hardening cần áp dụng dần.

Cụ thể:

- **Producer ownership**: Producer service là owner của source state và event contract cho state change của mình.
- **Consumer rule**: Consumer KHÔNG ghi trực tiếp database của producer; consumer chỉ cập nhật projection/read model của chính nó hoặc gọi service contract phù hợp.
- **Cross-service state change**: phải publish domain/integration event sau khi owned transaction commit.
- **Outbox pattern**: Với state-changing outbound events, ưu tiên transactional outbox nếu service đã có outbox hoặc flow có rủi ro mất event cao.
- **Idempotency**: Với inbound events, consumer phải idempotent bằng inbox/message table hoặc unique guard tương đương dựa trên `event_id/messageId` và `event_type/MessageStep`.
- **Context propagation**: Event phải mang correlation context và tenant/branch/user context khi áp dụng được.
- **Event metadata tối thiểu**: `event_id`, `event_type`, `event_version`, `occurred_at/timestamp`, `source_service`, `tenant_id`.
- **Versioning**: Event version phải additive trong cùng major version. Breaking change phải dùng version mới hoặc event type mới.
- **Catalog**: Topic naming, key convention, payload schema, producer, consumer, reliability mode và status phải được catalog trong `Architecture/events/event-contracts.md`.
- **Common messaging headers**: `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` là contract headers quan trọng với các flow đang dùng common messaging library.
- **Error handling**: Missing/invalid required headers KHÔNG nên chỉ ack bỏ qua nếu event có giá trị nghiệp vụ; cần DLQ hoặc audit table theo từng topic family.
- **External payload**: từ ERP/Ecom4G/COP KHÔNG được ghi thẳng vào domain tables; phải đi qua mapping/validation trong integration boundary như `gf-erp-agent` hoặc service owner.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Synchronous REST-only integration** | Flow dễ đọc theo request/response, dễ debug ở quy mô nhỏ | Không phù hợp long-running workflow, external integration, retry-heavy flows | Tăng coupling, timeout chaining, khó replay khi downstream lỗi |
| **Direct database sharing** | Ít event contract hơn, join dữ liệu đơn giản | Phá vỡ service-owned schema, migration nguy hiểm, khó audit | Vi phạm ADR-001 và data ownership rule; dễ gây race condition |
| **Queue riêng cho từng workflow, không dùng shared event catalog** | Tách biệt rõ từng luồng nghiệp vụ | Topic sprawl, governance khó hơn | Garage đã có nhiều domain event topic và common messaging conventions; event catalog chung là source of truth |
| **In-process events only (Spring `ApplicationEventPublisher`)** | Đơn giản, transaction local dễ kiểm soát | Không giải quyết cross-service integration | In-process event chỉ phù hợp nội bộ service; cross-boundary phải qua Kafka/Event Hubs hoặc API contract |
| **Temporal thay Kafka cho mọi orchestration** | Durable orchestration rõ ràng, retry/timeout tốt | Không phù hợp publish/subscribe và event fan-out | Temporal và Kafka giải quyết hai lớp khác nhau; Garage cần cả hai |

## Consequences

**Positive:**
- Giảm coupling giữa services và external systems.
- Cho phép fan-out event tới nhiều consumers mà producer không cần biết toàn bộ downstream.
- Hỗ trợ retry/replay/projection rebuild tốt hơn synchronous-only.
- Outbox/inbox tăng reliability và idempotency ở các service đã triển khai.
- Worker services có trigger rõ từ domain events như service order, purchase order, inventory, notification.
- Event catalog tạo nền cho contract review và CI/schema validation sau này.

**Negative:**
- **Event contract governance phức tạp hơn REST-only** — schema/topic/version management. **Mitigation**: event catalog bắt buộc; ADR rule + HLD update khi thêm topic; CI schema validation ở phase hardening tiếp theo.
- **Debug lỗi cần correlation id, trace, topic lag, outbox/inbox state và consumer logs** — observability complexity. **Mitigation**: correlation ID bắt buộc trong event header; OpenTelemetry trace span; consumer lag dashboard.
- **Eventual consistency phải được chấp nhận trong UI và business process** — UX impact. **Mitigation**: UI pattern cho async state (pending → confirmed); product nhận thức về eventual consistency.
- **Topic/env naming mismatch làm producer/consumer không gặp nhau dù code đúng** — config drift. **Mitigation**: chuẩn hoá naming convention prod/nonprod; CI verify topic names match catalog.
- **Payload raw JSON/service DTO làm schema drift khó phát hiện** — không có schema registry. **Mitigation**: schema validation trong consumer; phase hardening: introduce schema registry.



## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- HLD: [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-notification-HLD.md](../hld/gf-notification-HLD.md), [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-system-HLD.md](../hld/gf-system-HLD.md)
- Workflows: (../workflows/system-tenant-branch-provisioning-flow.md), [inventory-receipt-fulfillment-flow.md](../workflows/inventory-receipt-fulfillment-flow.md), [inventory-delivery-fulfillment-flow.md](../workflows/inventory-delivery-fulfillment-flow.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-005 (Temporal workflow), ADR-006 (Flyway per-service data ownership), ADR-008 (worker services)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-004 `Kafka Event-Driven Integration`: nhiều quy trình cross-service và external ERP/COP integration không phù hợp xử lý hoàn toàn bằng synchronous REST, decision = dùng Kafka-compatible Event Hubs/Kafka làm cơ chế tích hợp bất đồng bộ chính với producer service là owner của event contract, kèm rule outbox/inbox, idempotency, context propagation và event metadata tối thiểu, consequence = giảm coupling và hỗ trợ retry/replay/fan-out nhưng event contract governance phức tạp hơn REST-only và cần chấp nhận eventual consistency. Bao gồm Status, Context, Decision (producer/consumer rules, outbox, idempotency, versioning, catalog), Alternatives Considered, Consequences, References. |
