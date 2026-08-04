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

# ADR-001: Garage Microservice Landscape — Tách boundary theo service, aggregator, worker và OCR

## Status
ACCEPTED — 2026-04-23

## Context

Garage là nền tảng vận hành garage đa dịch vụ, bao phủ tenant/branch setup, HRMS, customer/vehicle profile, booking, quotation, service order, purchase, inventory, accounting settlement, shipment, marketing/CRM, notification, ERP integration và OCR giấy đăng ký xe. Câu hỏi cần quyết định:

1. Architecture boundary chính của Garage là microservice landscape, modular monolith, hay shared-database hybrid?
2. GraphQL aggregator, worker/agent service và AI/OCR service có được coi là architecture boundary riêng hay implementation detail?
3. Quy tắc ownership data, contract cross-service và state mutation thế nào?

**Evidence từ source / TECHSTACK:**
- `agg-garage-graph` và `agg-sso-graph` là GraphQL aggregation layer dùng Node.js/TypeScript/Apollo.
- Các `gf-*` service là Spring Boot domain services, mỗi service có controller, DTO, entity/repository, config và contract riêng.
- `gf-erp-agent`, `gf-inventory-worker`, `gf-worker` là worker/agent services cho integration hoặc background processing.
- `ocr-car-registration` là Python/FastAPI service riêng, xử lý OCR/AI pipeline bằng Azure Vision, OpenAI hoặc Azure OpenAI.
- PostgreSQL, Kafka/Event Hubs, Temporal, Redis và external services được dùng theo từng boundary, không dùng một shared runtime duy nhất.
- Tài liệu `SYSTEM-ARCHITECTURE.md`, `TECHSTACK.md`, `Architecture/hld`, `Architecture/api`, `Architecture/data`, `Architecture/workflows` và `Architecture/events/event-contracts.md` đã mô tả service landscape ở nhiều góc nhìn.

**Constraints từ runtime:**
- Domain nghiệp vụ Garage lớn và có nhiều tốc độ thay đổi khác nhau giữa sales, purchase, inventory, accounting, shipment, customer, marketing và notification.
- Worker/agent và API services có timeout, retry, throughput và operational profile khác nhau.
- OCR service có runtime, dependency, credential và scaling profile khác Spring services.
- Kafka/Event Hubs và Temporal đã được tích hợp cho cross-service flow, long-running workflow, saga/compensation và side effects sau commit.

**Business rules liên quan:** NA.

## Decision

**Áp dụng Garage microservice landscape làm boundary kiến trúc chính: 6 nhóm service-runtime tách theo ownership, contract và profile vận hành; mỗi root service hoặc gateway runtime là một architecture boundary có tài liệu riêng.**

Microservice landscape phản ánh đúng codebase và cách hệ thống đang được vận hành/tài liệu hoá. Tách boundary giúp giảm coupling giữa các domain có lifecycle khác nhau, cho phép GraphQL/client contract tách khỏi domain implementation, để worker/OCR có scaling/security profile riêng, và đặt rule governance để các phase API/data/workflow/event tiếp theo bám cùng một boundary map.

Cụ thể — 6 nhóm boundary:

| Nhóm boundary | Service | Trách nhiệm chính |
|---|---|---|
| GraphQL aggregation layer | `agg-garage-graph`, `agg-sso-graph` | Compose API cho client, routing tới downstream, forward tenant/user/trace context; KHÔNG sở hữu durable domain state |
| Core/platform services | `gf-system`, `gf-hrms`, `gf-erp-mdm` | Tenant/branch/system metadata, employee lifecycle, master/reference data |
| Garage transaction services | `gf-sales`, `gf-purchase`, `gf-inventory`, `gf-accounting`, `gf-shipment` | Booking/service order, procurement, stock truth, settlement/accounting, shipment coordination |
| Customer engagement services | `gf-customer`, `gf-marketing`, `gf-notification` | Customer/vehicle master, segmentation/campaign/voucher, notification dispatch |
| Worker/agent services | `gf-erp-agent`, `gf-inventory-worker`, `gf-worker` | ERP/Ecom integration, inventory workflow worker, generic background jobs |
| AI/OCR service | `ocr-car-registration` | OCR giấy đăng ký xe và structured extraction; KHÔNG tự trở thành source of truth cho customer/vehicle state |

Quy tắc ownership:

- **Service owns its boundary**: Mỗi service sở hữu API contract, data model, workflow và event contract của boundary đó.
- **Aggregator role**: GraphQL aggregator chỉ compose và expose client-facing schema; mutation/query cuối cùng vẫn phải đi qua service owner.
- **No cross-boundary writes**: Service KHÔNG ghi trực tiếp database của service khác; mọi cross-boundary interaction phải qua REST/GraphQL contract, domain event hoặc workflow/activity contract.
- **State change in owner transaction**: Durable state change phải nằm trong transaction/model của service owner.
- **Worker scope**: Worker service chỉ điều phối hoặc xử lý async job theo contract; KHÔNG được âm thầm sở hữu business state nếu data model/HLD không ghi rõ.
- **OCR scope**: OCR service trả structured result; service sở hữu customer/vehicle hoặc document domain quyết định lưu, validate và audit dữ liệu đó.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Modular Monolith** | Deployment đơn giản, transaction nội bộ dễ, ít contract cross-service | Không khớp source và tài liệu HLD/API/data/workflow đã tách theo service | Tăng coupling giữa domain có lifecycle khác nhau và làm mờ ownership dữ liệu |
| **Shared Database với nhiều service ghi chung bảng** | Dễ join dữ liệu, ít API call giữa service | Phá vỡ service ownership, khó audit/migration, dễ tạo race condition | Khi một service đổi schema, các service khác có thể vỡ ngầm |
| **GraphQL Gateway chỉ là implementation detail** | Ít tài liệu hơn, ít governance | Bỏ qua schema, resolver composition, downstream registry, auth/context, client-facing contract | GraphQL gateways là architecture boundary thực sự — sở hữu schema và contract |
| **Gộp Worker vào Domain Service** | Ít service runtime hơn, ít deployment unit hơn | Worker workloads có retry, timeout, throughput, operational profile khác API workloads | `gf-erp-agent`, `gf-inventory-worker`, `gf-worker` đã tồn tại như boundary riêng |
| **Gộp OCR vào Purchase hoặc Sales** | Luồng nghiệp vụ customer/vehicle có thể đơn giản hơn | OCR dùng Python/FastAPI, AI/OCR provider credentials, file/base64 processing và pipeline dependency riêng | Gộp vào Spring domain service tăng blast radius và khó scale độc lập |

## Consequences

**Positive:**
- Ownership rõ cho API, data, workflow, event và runtime của từng service.
- Chuẩn hoá tài liệu kiến trúc theo từng boundary mà không lẫn trách nhiệm.
- GraphQL/client contract tách khỏi domain service implementation nhưng vẫn giữ service owner là source of truth.
- Cross-service integration được làm rõ qua Kafka/Event Hubs, Temporal hoặc REST contract thay vì gọi database trực tiếp.
- Worker và OCR workloads có thể scale, secure và observe theo đặc thù riêng.

**Negative:**
- **Số lượng contract cần quản trị tăng**: REST, GraphQL, event, workflow, data model và retry/idempotency rule. **Mitigation**: ADR + template/convention chuẩn hoá; review trong HLD/API/data update cycle.
- **Một số concept (tenant, branch, customer, vehicle, warehouse, document) xuất hiện ở nhiều service nên cần rule ownership chặt** — drift risk. **Mitigation**: ADR-003 (tenant/SSO boundary); HLD per-boundary map ownership; mapping registry.
- **Debug production issue khó hơn monolith** — request đi qua GraphQL, service, Kafka, Temporal, worker. **Mitigation**: correlation ID end-to-end; OpenTelemetry trace span; structured log với tenantId + requestId.
- **Deployment, observability và security baseline phải đồng bộ trên nhiều runtime**: Spring Boot, Node.js, Python/FastAPI. **Mitigation**: shared observability stack; security baseline cho từng runtime; runbook chuẩn.



## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- [README.md](../README.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- HLD: [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md), [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md), [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md), [gf-shipment-HLD.md](../hld/gf-shipment-HLD.md), [gf-customer-HLD.md](../hld/gf-customer-HLD.md), [gf-marketing-HLD.md](../hld/gf-marketing-HLD.md), [gf-notification-HLD.md](../hld/gf-notification-HLD.md), [gf-system-HLD.md](../hld/gf-system-HLD.md), [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md), [gf-erp-mdm-HLD.md](../hld/gf-erp-mdm-HLD.md), [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md), [gf-worker-HLD.md](../hld/gf-worker-HLD.md), [ocr-car-registration-HLD.md](../hld/ocr-car-registration-HLD.md)
- Related ADRs: ADR-002 (GraphQL aggregator), ADR-003 (tenant và SSO boundary), ADR-004 (Kafka event-driven), ADR-005 (Temporal workflow), ADR-006 (Flyway per-service data), ADR-007 (Redis cache), ADR-008 (worker services), ADR-009 (JPA no relationships), ADR-010 (feature flags governance)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-001 `Garage Microservice Landscape`: domain Garage trải rộng nhiều service runtime với lifecycle, ownership và operational profile khác nhau, decision = áp dụng microservice landscape 6 nhóm boundary (GraphQL aggregation, core/platform, transaction, customer engagement, worker/agent, AI/OCR) làm boundary kiến trúc chính, consequence = ownership rõ cho API/data/workflow/event nhưng tăng số contract cần governance và cần observability đồng bộ trên nhiều runtime. Bao gồm Status, Context, Decision (boundary map + ownership rules), Alternatives Considered, Consequences, References. |
