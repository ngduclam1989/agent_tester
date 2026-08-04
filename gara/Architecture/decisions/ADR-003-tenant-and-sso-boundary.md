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

# ADR-003: Tenant và SSO Boundary — Tách tenant source, branch projection, HRMS user profile và IAM gateway

## Status
ACCEPTED 

## Context

Garage cần xử lý tenant, branch, employee/user, IAM/SSO, policy/role và notification/conversation identity ở nhiều boundary khác nhau. Câu hỏi cần quyết định:

1. Source-of-truth nằm ở đâu cho tenant, branch, employee profile, IAM user identity?
2. Garage có tự build IAM (login/password/OTP/JWT) hay forward sang `sec-iam-service`?
3. Tenant/branch context được resolve và enforce ra sao xuyên gateway → service → repository?

**Evidence từ source / TECHSTACK:**
- `ct-saas-tenant` là external tenant source-of-truth, phát `TenantProvisionedEvent` cho Garage qua Kafka tenant provisioning topic.
- `gf-system` không sở hữu tenant source-of-truth nhưng materialize dữ liệu vận hành garage: `tenant_subscriptions_cache`, default `branches`, branch lifecycle events và outbox/sequence support.
- `gf-hrms` sở hữu hồ sơ nhân viên/local user profile của Garage: `users`, `user_roles`, `user_attachments`, branch assignment, status, attachment, IAM/conversation/policy integration status.
- `agg-sso-graph` là GraphQL gateway cho auth/session, notification, conversation, Firebase device token và Superset guest token/proxy; phần auth/session forward sang `sec-iam-service`.
- `sec-iam-service` là external IAM/SSO authority cho username/password, OTP, token/session và IAM user identity.

**Constraints từ runtime:**
- Tenant lifecycle là platform concern, không nên nằm trong HRMS hoặc GraphQL gateway.
- Employee profile có nhiều dữ liệu nghiệp vụ Garage-specific (branch assignment, attachment, status, role projection, migration status); không thuộc IAM.
- IAM/SSO có yêu cầu bảo mật cao và đã có `sec-iam-service`; Garage không nên tự build password/session/token engine.
- Tài liệu HLD/API/data/workflow hiện tại đã chỉ ra nhiều gap governance cần harden (xem comment Status).

**Business rules liên quan:** NA.

## Decision

**Áp dụng boundary model 6-tier cho tenant và SSO: `ct-saas-tenant` là tenant SoT, `gf-system` là branch/quota projection, `gf-hrms` là employee profile owner, `agg-sso-graph` là SSO gateway, `sec-iam-service` là IAM authority, downstream services giữ specialized identity.**

Boundary này giữ đúng source-of-truth và giảm rủi ro trộn trách nhiệm: tenant không bị thay thế bởi HRMS hoặc gateway; gateway không tự trở thành IAM authority; HRMS không sở hữu password/session; mỗi service vẫn có thể projection/cache nhưng phải có owner và event/reconciliation contract rõ.

Boundary mapping:

| Boundary | Vai trò | Không được sở hữu |
|---|---|---|
| `ct-saas-tenant` | Tenant source-of-truth, subscription plan/quota source, phát tenant provisioning events | Garage branch state, employee profile, IAM password/session |
| `gf-system` | Projection/cache cho Garage tenant operations: subscription quota cache, default branch, branch lifecycle, outbox/sequence support | Tenant master source-of-truth, IAM user, employee hồ sơ đầy đủ |
| `gf-hrms` | Employee/local user profile, role/group assignment projection, branch assignment, attachment metadata, IAM/conversation/policy integration orchestration | Password/session source-of-truth, tenant master source-of-truth |
| `agg-sso-graph` | GraphQL gateway cho SSO/IAM-adjacent operations, Firebase device token binding, Superset tenant RLS token/proxy | User/password/session authority, tenant lifecycle authority, Garage domain authorization policy |
| `sec-iam-service` | IAM/SSO authority: login, OTP, token/session, password, IAM user identity | Garage employee hồ sơ, branch/quota state |
| Policy/conversation/notification external services | Role/policy evaluation, conversation identity, notification read model theo downstream contract | Tenant master, employee profile source-of-truth |

Quy tắc bắt buộc:

- **Context propagation**: Mọi request business vào Garage service phải mang tenant/user/branch context khi operation cần scope.
- **Trusted source**: `tenant_id`/`tenantId` trong service data phải lấy từ trusted auth/event context hoặc source event đã validate, không lấy tùy tiện từ client body nếu operation là user-facing.
- **Gateway forward, không own**: `agg-sso-graph` được forward auth/session request sang `sec-iam-service`, KHÔNG được tự trở thành IAM authority.
- **Tenant provisioning**: `gf-system` chỉ xử lý tenant provisioning event có `tenantType = GARAGE` và đúng `MessageGroup = TENANT-PROVISIONING`, `MessageStep = TENANT_PROVISIONED.1`.
- **Subscription cache**: `gf-system` lưu `tenant_subscriptions_cache` như projection/cache; dữ liệu gốc vẫn thuộc `ct-saas-tenant`.
- **Default branch**: tạo idempotent bằng guard `existsByTenantIdAndIsDefaultTrue` và unique constraint một default branch mỗi tenant.
- **HRMS ownership**: là owner hồ sơ nhân viên/local user. Khi cần IAM user, conversation user hoặc policy group role, `gf-hrms` gọi downstream tương ứng và lưu integration status, KHÔNG lưu password lâu dài.
- **HRMS API split**: Public APIs phải tenant-scoped từ security context. Internal APIs nhận `tenantId` phải giới hạn caller/service account rõ ràng.
- **Device token binding**: Firebase device token trong `agg-sso-graph` phải bind với `user_id`, `tenant_id`, `tenant_type`, `source_system` từ JWT context và cần hardening về TTL/encryption/index.
- **Superset tenant claim**: guest token/RLS phải lấy tenant claim từ trusted token context và không cho phép client tự truyền tenant tùy ý.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Để `gf-hrms` làm tenant-user source-of-truth** | User/employee flow tập trung trong một service | Tenant và subscription/quota là platform concern | HRMS cần local profile cho Garage, không nên thay thế tenant SoT hoặc IAM authority |
| **Để `agg-sso-graph` sở hữu SSO và tenant lifecycle** | Client chỉ cần một GraphQL endpoint cho mọi identity flow | Gateway sở hữu user/password/session/tenant tăng blast radius bảo mật, làm mờ ownership | Gateway là composition layer, không phải authority; hiện đã forward xuống `sec-iam-service` |
| **Mỗi service tự cache và tự quyết định tenant/branch/user** | Mỗi service ít phụ thuộc runtime hơn, query local nhanh | Dễ sinh drift giữa tenant, branch, HRMS user và IAM user | Projection/caching cần thiết nhưng phải có owner và event/reconciliation contract — không tuỳ tiện |
| **Tự xây IAM trong Garage** | Toàn quyền kiểm soát auth flow và data | Security risk cao, duplicate với `sec-iam-service`, tăng chi phí compliance | Garage tập trung domain operations, không phát triển identity platform riêng |
| **Chỉ tin vào tenant từ GraphQL/client payload** | Implement đơn giản cho resolver/controller | Không an toàn — cho phép cross-tenant access nếu client gửi sai | Tenant/branch context phải đến từ token/trusted gateway header/service account/event đã validate |

## Consequences

**Positive:**
- Source-of-truth rõ: tenant ở `ct-saas-tenant`, branch/quota projection ở `gf-system`, employee profile ở `gf-hrms`, IAM ở `sec-iam-service`.
- Giảm rủi ro GraphQL gateway chứa auth/domain authority ngầm.
- Tenant/branch provisioning có workflow rõ: tenant event → `gf-system` cache quota → tạo default branch → publish branch lifecycle.
- HRMS có thể enrich employee profile và integration status mà không sở hữu password/session.
- Superset, Firebase token, notification và conversation flows có context boundary rõ hơn.

**Negative:**
- **Có nhiều mapping cần quản trị**: `tenantId`, `tenantCode`, `branchId`, `iamUserId`, `user_id`, role/group id, policy identity. **Mitigation**: mapping registry trong tài liệu kiến trúc; reconciliation event giữa SoT và projection.
- **Cross-service provisioning/migration cần retry, reconciliation và audit tốt hơn** — eventual consistency. **Mitigation**: outbox/inbox pattern theo ADR-004; idempotency key per provisioning event.
- **Internal API nhận `tenantId` làm tăng yêu cầu service-to-service authorization** — thêm attack vector. **Mitigation**: `x-api-key` allow-list per-caller; audit log cho cross-tenant API call.
- **Lỗi auth khó debug nếu thiếu correlation id và trace** — gateway/downstream split. **Mitigation**: correlation ID bắt buộc forward; OpenTelemetry trace span; structured log với tenantId.


## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- HLD: [agg-sso-graph-HLD.md](../hld/agg-sso-graph-HLD.md), [gf-system-HLD.md](../hld/gf-system-HLD.md), [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md)
- API: [agg-sso-graph-graphql.md](../api/agg-sso-graph-graphql.md), [gf-hrms-api.md](../api/gf-hrms-api.md)
- Data: [gf-system-data-model.md](../data/gf-system-data-model.md), [gf-hrms-data-model.md](../data/gf-hrms-data-model.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-002 (GraphQL aggregator), ADR-004 (Kafka event-driven)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-003 `Tenant và SSO Boundary`: tenant, branch, employee profile, IAM identity và policy/notification identity nằm ở nhiều boundary nên cần làm rõ source-of-truth và ngăn trộn trách nhiệm, decision = boundary model 6-tier (`ct-saas-tenant` tenant SoT, `gf-system` branch/quota projection, `gf-hrms` employee profile, `agg-sso-graph` SSO gateway, `sec-iam-service` IAM authority, downstream specialized identity), consequence = source-of-truth rõ và giảm rủi ro gateway chứa auth authority ngầm nhưng có nhiều mapping cần quản trị (`tenantId`, `iamUserId`, role/group) và yêu cầu reconciliation/eventual consistency. Bao gồm Status, Context, Decision (boundary mapping + context propagation rules), Alternatives Considered, Consequences, References. |
