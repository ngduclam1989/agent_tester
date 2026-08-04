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

# ADR-002: GraphQL Aggregator Pattern — Client-facing composition layer cho Garage và SSO

## Status
ACCEPTED — 2026-04-23

## Context

Garage có hai GraphQL aggregator chạy Node.js/TypeScript với Express và Apollo Server, đóng vai trò composition layer giữa client và domain services. Câu hỏi cần quyết định:

1. GraphQL aggregator có được sở hữu business state hay chỉ là composition/orchestration boundary?
2. Auth/authorization được enforce ở gateway hay downstream service owner?
3. Tách bao nhiêu aggregator và theo tiêu chí nào (operational vs IAM/SSO)?

**Evidence từ source / TECHSTACK:**
- `agg-garage-graph`: GraphQL edge cho ứng dụng Garage, expose query/mutation nghiệp vụ và forward request sang downstream services như `gf-sales`, `gf-purchase`, `gf-inventory`, `gf-accounting`, `gf-customer`, `gf-marketing`, `gf-notification`, `gf-erp-mdm`, `gf-hrms`, `ct-file-storage`, `ct-saas-tenant`, `ac-payment-gateway`, `policy-agent` và Superset.
- `agg-sso-graph`: GraphQL edge cho auth/session, notification read model, conversation helper, Firebase device token và Superset guest token/proxy; forward phần lớn request sang `sec-iam-service`, notification service, conversation service và Superset.
- Hai gateway có schema/resolver module riêng, downstream endpoint registry, middleware context, upload handling, error mapping, health/metrics và OpenTelemetry/Prometheus evidence.
- `agg-sso-graph` có DynamoDB dependency để lưu Firebase device token, nhưng không sở hữu user/password/session state.

**Constraints từ runtime:**
- Frontend web/mobile dùng GraphQL làm contract chính cho nghiệp vụ; Spring services vẫn expose REST/domain APIs.
- Một màn hình Garage có thể cần dữ liệu trải rộng nhiều service boundary (booking, customer, vehicle, inventory, payment, notification, policy).
- Service ownership đã rõ theo ADR-001; gateway không được duplicate domain authority.

**Business rules liên quan:** NA.

## Decision

**Áp dụng GraphQL Aggregator Pattern cho Garage: `agg-garage-graph` và `agg-sso-graph` là client-facing composition layer; KHÔNG sở hữu business state hoặc auth authority — domain service owner và `sec-iam-service` giữ source of truth.**

GraphQL aggregator phù hợp với Garage vì client cần shape dữ liệu trải rộng nhiều service mà không nhúng aggregation logic vào frontend. Backend services vẫn giữ REST/domain API rõ ràng, dễ test, dễ deploy độc lập và dễ reuse bởi worker/integration flows. Pattern này khớp với source hiện tại (Apollo schema/resolver modules, `PassthroughService`/`ApiClient`, downstream endpoint config).

Cụ thể:

- **Aggregator boundary**:
  - `agg-garage-graph` là client-facing GraphQL aggregator cho garage operational flows.
  - `agg-sso-graph` là client-facing GraphQL aggregator cho IAM/SSO-adjacent flows.
- **Schema contract**: GraphQL schema là contract giữa client và gateway; REST/API contract của downstream service vẫn là contract giữa gateway và service owner.
- **Resolver responsibility**: được phép compose dữ liệu, normalize response union, forward headers, xử lý upload/download/export passthrough và map lỗi downstream. KHÔNG được trở thành nơi sở hữu rule nghiệp vụ bền vững nếu rule thuộc domain service.
- **Context forwarding**: gateway phải forward `Authorization`, tenant/user/branch context khi có, request id và trace/correlation headers xuống downstream.
- **Authorization**: downstream service vẫn phải tự validate authorization, tenant/branch context, idempotency và domain invariant trước khi xử lý.
- **Persistence ownership**: gateway không ghi trực tiếp domain database của Garage service. Ngoại lệ hiện tại: `agg-sso-graph` ghi device token vào DynamoDB `DEVICE_TOKEN_TABLE`; ownership này phải được document và harden trong HLD/data decision riêng.
- **File adapter**: file upload/download/export route trong gateway chỉ là adapter/passthrough; file metadata, document state, business attachment ownership phải thuộc downstream owner.
- **Superset proxy**: Superset proxy/guest token flow phải luôn gắn tenant context/RLS khi có tenant claim và không được bypass auth policy của Superset/downstream.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Client gọi trực tiếp từng Spring REST service** | Ít một runtime gateway, contract REST đi thẳng tới service owner | Client phải biết quá nhiều downstream endpoint, tự xử lý fan-out/aggregation/error mapping | Đẩy backend orchestration logic vào frontend, tăng coupling với service topology |
| **REST API Gateway thuần túy** | Đơn giản hơn GraphQL, tận dụng HTTP caching/routing truyền thống | Không giải quyết tốt client-driven selection và composition nhiều resource | Source hiện tại đã có Apollo schema/resolver modules — REST-only gateway không khớp embodied architecture |
| **Một GraphQL aggregator duy nhất cho cả Garage và SSO** | Một endpoint duy nhất, ít deployment unit hơn | Garage operational flows và SSO/auth-adjacent flows có downstream ownership, security surface, persistence khác nhau | Tăng blast radius và làm mờ boundary giữa IAM/SSO và Garage domain |
| **Đưa business orchestration vào GraphQL resolver** | Client flow có thể nhanh hơn ở giai đoạn đầu | Suy yếu service ownership, phân tán business rule, khó audit và test | Durable state change phải thuộc service owner hoặc workflow/activity contract, không nằm ngầm trong gateway resolver |
| **Backend-for-Frontend riêng cho từng client** | Tối ưu rất sâu cho từng client (web/mobile/admin) | Tăng số gateway runtime, governance và duplicated schema logic | Hai aggregator hiện tại đã tách theo business/security boundary đủ rõ; thêm BFF tăng overhead không cần thiết |

## Consequences

**Positive:**
- Client có một GraphQL contract ổn định cho các màn hình cần dữ liệu nhiều service.
- Domain services vẫn giữ ownership dữ liệu và rule nghiệp vụ qua REST/API contracts.
- Gateway tập trung schema composition, context forwarding, upload/download adapter, error normalization và observability.
- Tách `agg-garage-graph` và `agg-sso-graph` giúp SSO/auth surface không trộn với Garage operational surface.
- Có thể evolve frontend schema mà không buộc mỗi downstream service expose đúng shape UI.

**Negative:**
- **Gateway là thêm một hop latency và thêm một runtime cần deploy/monitor** — operational cost. **Mitigation**: shared observability stack; sizing dashboard per-aggregator; latency budget per-resolver.
- **Schema evolution cần governance** — breaking change ảnh hưởng trực tiếp web/mobile clients. **Mitigation**: schema versioning + deprecation policy; CI contract validation.
- **Downstream endpoint registry và REST contracts phải reconcile liên tục** — drift risk. **Mitigation**: generated constants từ API contracts; periodic audit endpoint vs API docs.
- **Upload/download/export/proxy route làm tăng security surface ở edge** — attack surface. **Mitigation**: upload size/MIME limit; auth bắt buộc trên proxy routes; rate limit per-tenant.
- **GraphQL error semantics có thể khác REST** — inconsistency mapping. **Mitigation**: error mapping policy chuẩn hoá trong HLD aggregator; CI test cho error path.



## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- HLD: [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md), [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md)
- API: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md), [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-003 (tenant và SSO boundary), ADR-007 (Redis cache and runtime state)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-002 `GraphQL Aggregator Pattern`: client cần shape dữ liệu trải rộng nhiều domain service mà không nhúng aggregation logic vào frontend, decision = `agg-garage-graph` và `agg-sso-graph` là client-facing composition layer không sở hữu business state hoặc auth authority, consequence = client có schema ổn định và domain services giữ ownership nhưng thêm hop latency và schema evolution cần governance. Bao gồm Status, Context, Decision (aggregator boundary, schema/resolver/persistence rules), Alternatives Considered, Consequences, References. |
