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

# ADR-010: Feature Flags Governance — Chuẩn hóa feature flag cho rollout an toàn

## Status
ACCEPTED — 2026-04-23

## Context

Garage cần governance chung cho feature flags để kiểm soát rollout, rollback và lifecycle của các thay đổi nghiệp vụ lớn. Câu hỏi cần quyết định:

1. Mọi feature mới có rủi ro nghiệp vụ có bắt buộc phải guard sau feature flag không?
2. Naming, scope, default và resolve order của flag phải tuân theo convention nào?
3. Lifecycle quản lý (create → rollout → cleanup) ra sao để tránh "flag debt"?

**Evidence từ source / TECHSTACK:**
- `SYSTEM-ARCHITECTURE.md` yêu cầu feature mới từ Wave 2 phải được wrap sau feature flag.
- `TECHSTACK.md` ghi nhận feature flag starter trong Spring services.
- Nhiều HLD/workflow đã dùng runtime flag cho các luồng quan trọng như inventory stock, campaign/voucher, CRM/customer và tenant branch provisioning.

**Constraints từ runtime:**
- Feature flag phải hoạt động đa service và cho phép tenant-scoped override mà không cần redeploy.
- Rollback phải thực hiện được nhanh chóng để cô lập sự cố.
- Số lượng flag tăng nhanh nếu không có cleanup policy → phình code và khó vận hành.

**Business rules liên quan:** NA.

## Decision

**Thiết lập governance Feature Flags cho Garage: mọi feature có rủi ro nghiệp vụ phải guard sau flag, naming `Domain:FeatureVersion`, resolve order `tenant override > global setting > default = false`.**

Governance thống nhất giúp giảm rủi ro rollout big-bang, cho phép bật/tắt nhanh để cô lập sự cố mà không cần redeploy, giữ nhất quán giữa API/HLD/workflow và runtime behavior, đồng thời tránh "flag debt" tích lũy.

Cụ thể:

- **Guard rule**: Mọi feature mới có rủi ro nghiệp vụ hoặc ảnh hưởng rộng phải được guard bởi feature flag trước khi rollout production.
- **Naming convention**: `Domain:FeatureVersion` (ví dụ `Inventory:InventoryStockV01`, `Campaign:CampaignV01`, `CRM:CRMV01`); duy trì mapping trong tài liệu kiến trúc.
- **Resolve order**: `tenant override` > `global setting` > `default = false`.
- **Authorization separation**: Không dùng feature flag để thay thế authorization; flag chỉ là runtime gate cho behavior/flow.
- **Flag declaration**: Mỗi flag phải khai báo rõ `owner service`, `scope`, `default`, `affected APIs/workflows/events`, `rollback strategy`, `retirement criteria`.
- **Rollout phases**: `local test` → `nonprod tenant canary` → `production canary` → `broad rollout`.
- **Cleanup**: Khi feature đã ổn định và không cần rollback, phải có kế hoạch xóa flag và dead code trong thời hạn đã cam kết.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Không dùng feature flags, rollout trực tiếp theo release** | Ít cấu hình runtime hơn | Rủi ro cao khi rollback, phải redeploy để tắt feature | Không phù hợp với các luồng inventory/customer/campaign/integration có rủi ro nghiệp vụ cao |
| **Mỗi service tự định nghĩa rule feature flag riêng** | Linh hoạt cục bộ | Drift kiến trúc, khó vận hành đa service, khó audit cross-boundary | Tạo inconsistency giữa các service làm tăng friction vận hành và audit |
| **Dùng feature flags cho cả authorization** | Nhanh cho một số use case tạm thời | Trộn trách nhiệm permission model và rollout control | Tạo lỗ hổng kiểm soát truy cập nếu flag bị bật/tắt sai |

## Consequences

**Positive:**
- Rollout an toàn hơn cho feature mới và thay đổi lớn.
- Có cơ chế canary theo tenant/service và rollback nhanh khi có sự cố.
- Tăng khả năng quan sát tác động của flag lên API/workflow.

**Negative:**
- **Tăng overhead quản trị catalog flag và vòng đời từng flag** — bookkeeping. **Mitigation**: bắt buộc declaration template (`owner`, `scope`, `default`, `retirement criteria`) ở review PR; central catalog trong `Architecture/`.
- **Cần đồng bộ code + config + tài liệu giữa nhiều service** — đa service consistency. **Mitigation**: feature flag starter chuẩn hoá ở `TECHSTACK.md`; HLD update khi thêm flag.
- **Số lượng flag tăng nhanh và gây nhiễu vận hành nếu governance kém** — flag sprawl. **Mitigation**: cleanup deadline mỗi flag; quarterly flag review.

**Risks:**
- **Flag stale/không cleanup làm codebase phình** — không xoá khi feature đã GA. **Mitigation**: retirement criteria bắt buộc khi tạo flag; quarterly audit.
- **Sai scope override có thể bật nhầm feature cho tenant ngoài kế hoạch** — tenant override misconfigure. **Mitigation**: rollout phases bắt buộc nonprod canary trước; audit log thay đổi flag config.
- **Thiếu telemetry** — khó xác định root cause khi hành vi khác nhau theo tenant. **Mitigation**: log/metric per-flag-evaluation; correlation với tenantId trong observability.

**Trade-off accept:** chấp nhận overhead governance + lifecycle management cho flag, đổi lấy rollout an toàn + rollback nhanh + tách bạch rollout control khỏi authorization.

## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- HLD: [gf-system-HLD.md](../hld/gf-system-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-customer-HLD.md](../hld/gf-customer-HLD.md)
- Workflows: [system-tenant-branch-provisioning-flow.md](../workflows/system-tenant-branch-provisioning-flow.md), [sales-complete-flow.md](../workflows/sales-complete-flow.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven), ADR-006 (Flyway per-service data ownership)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-010 `Feature Flags Governance`: Garage cần kiểm soát rollout/rollback/lifecycle thay đổi nghiệp vụ lớn đa service mà không redeploy, tránh "flag debt", decision = mọi feature có rủi ro phải guard sau flag với naming `Domain:FeatureVersion`, resolve order `tenant override > global setting > default = false`, declaration template bắt buộc và rollout phases canary, consequence = rollout an toàn và rollback nhanh nhưng tăng overhead governance catalog flag và rủi ro flag sprawl/stale nếu cleanup kém. Bao gồm Status, Context, Decision (guard rule + naming + resolve order + lifecycle + cleanup), Alternatives Considered, Consequences (positive/negative/risks/trade-off), References. |
