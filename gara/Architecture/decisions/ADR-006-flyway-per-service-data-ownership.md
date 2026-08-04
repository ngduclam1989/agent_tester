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

# ADR-006: Flyway Per-Service Data Ownership — Service-owned schema và migration traceability

## Status
ACCEPTED 
## Context

Garage dùng PostgreSQL/JPA cho hầu hết Spring services. Kiến trúc tổng thể đã xác định nguyên tắc service-owned schema. Câu hỏi cần quyết định:

1. Flyway migration có là chuẩn DDL production cho mọi service không, hay JPA `ddl-auto=update` cũng được?
2. Service nào được phép ghi schema của service khác?
3. Runtime DDL (vd dynamic master data tables) governance ra sao?
4. Outbox/inbox tables phải tuân theo chuẩn gì về tenant metadata, idempotency, retention?

**Evidence từ source / TECHSTACK:**
- `TECHSTACK.md` ghi nhận PostgreSQL, Spring Data JPA/Hibernate và Flyway ở nhiều Spring services.
- `SYSTEM-ARCHITECTURE.md` mô tả PostgreSQL với service-owned schemas và rule "No cross-service table writes".
- `Architecture/data/*.md` đã mapping entity/table/migration theo từng service boundary.
- Nhiều service có `src/main/resources/db/migration/*.sql` và `spring.flyway.*` config.
- Một số service vẫn dùng `spring.jpa.hibernate.ddl-auto=update`, thiếu migration DDL hoặc tắt Flyway runtime (xem comment Status).

**Service-owned schema map theo source:**
- `gf-sales` sở hữu booking/service order/payment handoff state.
- `gf-purchase` sở hữu quotation, purchase request/order, supplier và purchase messaging state.
- `gf-inventory` sở hữu stock truth, warehouse, receipt, delivery, reservation và ledger state.
- `gf-accounting` sở hữu settlement, document metadata, sequence và accounting outbox/inbox state.
- `gf-customer` sở hữu customer/vehicle/segment/interaction state.
- `gf-marketing` sở hữu campaign, voucher, message và trigger state.
- `gf-notification` sở hữu notification request, delivery, template và inbox/delivery state.
- `gf-system` sở hữu Garage branch/support projection, subscription cache, outbox và sequence state.
- `gf-hrms` sở hữu employee/local user profile và role/attachment projection.

**Constraints từ runtime:**
- Production cần schema reproducibility — môi trường mới phải tạo lại từ migration scripts.
- Constraint, index, function, sequence, trigger, JSONB type, partial index và SQL-only artifacts cần được kiểm soát chặt.
- Cross-service reporting/query cần API/read model/analytics layer thay vì join trực tiếp.

**Business rules liên quan:** NA.

## Decision

**Áp dụng per-service data ownership với Flyway migration là chuẩn DDL production cho mọi domain/platform service Garage; không service nào được ghi trực tiếp bảng của service khác.**

Service-owned schema giúp giữ boundary rõ giữa các domain lớn của Garage. Flyway là cơ chế tốt nhất để review/trace schema thay đổi qua CI/CD, rollback planning, audit và production reproducibility. JPA auto-update tiện cho dev nhưng không đủ để kiểm soát constraint, index, function, sequence, trigger, JSONB type, partial index và SQL-only artifacts.

Cụ thể:

- **Schema ownership**: Mỗi domain/platform service sở hữu schema/tables/entity/repository/migration của boundary đó.
- **Migration standard**: Flyway migration trong từng service là chuẩn mục tiêu cho schema DDL được review, deploy và trace.
- **JPA role**: Entity là implementation model, KHÔNG phải nguồn DDL production duy nhất.
- **`ddl-auto=update`**: chỉ được xem là fallback/dev-mode hoặc gap cần harden, KHÔNG phải chuẩn production.
- **No cross-service writes**: Không service nào được ghi trực tiếp bảng của service khác.
- **Cross-service access**: Phải đi qua REST/GraphQL API, Kafka event, Temporal activity/protected API hoặc projection contract.
- **Projection/cache rules**: Tables phải ghi rõ source-of-truth, refresh/replay rule và tenant/audit metadata.
- **Runtime DDL governance**: Dynamic master data tables (`gf-erp-mdm`) phải có governance riêng: table naming, allowed column types, audit, validation, rollback và visibility trong data docs.
- **Outbox/inbox tables**: thuộc service owner nhưng phải chuẩn hoá `tenant_id`/tenant metadata, event idempotency key, retention và cleanup rule.
- **Data model docs**: Mọi data model doc phải map được: entity/table, owner service, migration source, tenant isolation, audit columns, indexes/constraints và open data items.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Shared monolithic schema** | Join dữ liệu dễ hơn, ít duplicate/projection | Phá vỡ microservice ownership, migration nguy hiểm, khó audit, race condition cross-service | Vi phạm ADR-001 boundary; không thể tách deploy |
| **Central migration repository** | Dễ kiểm soát tổng thể, có một nơi review schema | Mờ responsibility của service owner, tạo bottleneck cho delivery | Source hiện tại có service-local migrations và entity ownership — central repo lệch implementation |
| **JPA `ddl-auto=update` làm chuẩn production** | Nhanh, ít phải viết SQL migration | Không quản trị được data migration, backfill, function, partial index, constraint rename/drop, rollback, lịch sử | Không an toàn cho production |
| **Database-per-service vật lý** | Isolation mạnh, backup/restore độc lập | Deployment topology vật lý chưa chốt; Architecture hiện xác nhận service-owned schemas trong shared PostgreSQL | Quyết định ownership có thể áp dụng được cả khi sau này tách database vật lý — không cần ép thời điểm này |
| **Cho GraphQL/worker/OCR sở hữu domain database** | Một số flow nhanh hơn hoặc ít downstream call | GraphQL là composition layer, worker là orchestration, OCR là AI extraction pipeline | Domain state phải thuộc service owner trừ khi có ADR/data model riêng |

## Consequences

**Positive:**
- Data ownership rõ theo service boundary.
- Migration review và rollback planning có thể làm theo từng service.
- Hạn chế cross-service table write và shared-schema coupling.
- Data docs có thể trace từ entity → migration → API/workflow/event contract.
- Outbox/inbox, tenant isolation và audit có nơi sở hữu cụ thể.

**Negative:**
- **Cần nhiều migration scripts hơn và phải maintain theo từng service** — overhead. **Mitigation**: shared migration template/utilities; CI verify migration completeness.
- **Projection/cache data có thể duplicate và cần reconciliation rule** — eventual consistency. **Mitigation**: reconciliation job per projection; ADR-004 outbox/inbox pattern.
- **Cross-service reporting/query cần API, read model hoặc analytics layer thay vì join trực tiếp** — query complexity. **Mitigation**: read model service hoặc analytics warehouse; API aggregation theo nhu cầu.
- **Một số service hiện chưa đạt chuẩn Flyway nên cần phase hardening riêng** — debt. **Mitigation**: hardening backlog cho 8 service exception (xem comment Status); milestone tracking.



## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- Data: [gf-sales-data-model.md](../data/gf-sales-data-model.md), [gf-purchase-data-model.md](../data/gf-purchase-data-model.md), [gf-inventory-data-model.md](../data/gf-inventory-data-model.md), [gf-accounting-data-model.md](../data/gf-accounting-data-model.md), [gf-customer-data-model.md](../data/gf-customer-data-model.md), [gf-marketing-data-model.md](../data/gf-marketing-data-model.md), [gf-notification-data-model.md](../data/gf-notification-data-model.md), [gf-system-data-model.md](../data/gf-system-data-model.md), [gf-hrms-data-model.md](../data/gf-hrms-data-model.md), [gf-erp-mdm-data-model.md](../data/gf-erp-mdm-data-model.md), [gf-erp-agent-data-model.md](../data/gf-erp-agent-data-model.md), [gf-worker-data-model.md](../data/gf-worker-data-model.md), [gf-shipment-data-model.md](../data/gf-shipment-data-model.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven), ADR-009 (JPA no relationships)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-006 `Flyway Per-Service Data Ownership`: Garage cần schema reproducibility, audit và rollback planning trong khi vẫn giữ service-owned schema, decision = áp dụng per-service data ownership với Flyway migration làm chuẩn DDL production cho mọi domain/platform service và cấm cross-service table writes, consequence = data ownership rõ và migration trace được theo từng service nhưng cần nhiều migration scripts hơn và projection/cache phải có reconciliation rule. Bao gồm Status, Context (service-owned schema map), Decision (schema/migration/JPA/projection/outbox rules), Alternatives Considered, Consequences, References. |
