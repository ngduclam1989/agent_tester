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

# ADR-007: Redis-Backed Cache And Runtime State — Redis cho cache và coordination, không phải source of truth

## Status
ACCEPTED 

## Context

Redis xuất hiện trong nhiều Garage services như một runtime dependency cho cache, permission/policy lookup và distributed coordination. Câu hỏi cần quyết định:

1. Redis có được phép trở thành source of truth cho domain state không?
2. Mỗi service tự định nghĩa key/TTL/invalidation hay phải có rule chung?
3. Hành vi khi Redis outage — fail-fast hay graceful degrade qua DB?

**Evidence từ source / TECHSTACK:**
- `TECHSTACK.md` ghi nhận Redis/Redisson dùng ở `gf-accounting`, `gf-customer`, `gf-inventory`, `gf-marketing`, `gf-purchase`, `gf-sales` và có config evidence ở `gf-hrms`.
- `SYSTEM-ARCHITECTURE.md` thể hiện Redis là tầng dùng chung cho một nhóm Spring services.
- Các service có dấu vết cache key/prefix theo boundary và dùng Redis lock để điều phối outbox retry, tránh nhiều instance xử lý trùng.
- Một số bảng nghiệp vụ như `tenant_subscriptions_cache` trong `gf-system` mang tính cache/projection, source of truth vẫn nằm ở boundary khác.

**Constraints từ runtime:**
- Multi-instance deployment → cần distributed coordination, không thể dùng in-memory lock thuần.
- Outbox/inbox processors cần idempotency + dedup để scale ngang.
- Hiện trạng tài liệu còn gap về cache invalidation policy, TTL chuẩn hóa, key namespace chuẩn và hành vi fallback khi Redis lỗi.

## Decision

**Redis là cache/coordination layer cho service-local concerns; KHÔNG được dùng làm system of record cho nghiệp vụ lõi.**

Cụ thể:

- **Use cases cho phép**: service-local cache, policy/permission cache, lightweight coordination (lock, dedupe, retry control) theo đúng boundary service.
- **Source of truth**: Redis không thay thế PostgreSQL cho durable state; mọi dữ liệu bền vững thuộc service-owned data model.
- **Key namespace**: mỗi service phải có key prefix riêng theo tenant và domain context để tránh va chạm cross-service.
- **TTL & invalidation**: mỗi loại dữ liệu cache phải khai báo chiến lược TTL/invalidation rõ ràng; mọi mutation làm đổi state gốc phải có cơ chế refresh hoặc invalidate tương ứng.
- **Distributed lock**: luồng xử lý phải idempotent để chịu được lock timeout, retry hoặc duplicate delivery.

Quyết định này bám sát runtime evidence hiện tại của Garage: Redis đã được tích hợp ở nhiều service; bỏ Redis sẽ tăng tải đọc DB và tăng độ trễ ở các điểm đọc lặp lại. Outbox/inbox và retry processors trong một số service đã dùng Redis lock để giảm xử lý trùng khi scale nhiều instance. Giữ Redis là cache/coordination layer giúp rõ ownership dữ liệu: service owner chịu trách nhiệm state bền vững, Redis chỉ là lớp tăng tốc và điều phối runtime. Chuẩn hóa rule từ ADR giúp tránh drift giữa các service khi tự định nghĩa key, TTL, invalidation hoặc fallback.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Chỉ đọc trực tiếp từ DB, không dùng Redis** | Đơn giản hóa vận hành; không có vấn đề cache stale | Tăng tải đọc DB; latency cao hơn ở hot path | Không khớp implementation hiện tại — nhiều service đã phụ thuộc Redis cho cache/lock và cần latency thấp |
| **Redis global authority cho toàn bộ cache** | Tập trung quản trị key và observability | Coupling chéo giữa service boundaries; làm mờ ownership; tăng blast radius khi key governance yếu | Vi phạm service boundary — đẩy ownership data ra ngoài service owner |
| **In-memory lock/cache trong từng instance** | Không phụ thuộc external Redis | Không hoạt động đúng môi trường multi-instance; không giải quyết distributed coordination | Không đáp ứng yêu cầu multi-instance + outbox dedup |

## Consequences

### Positive
- Giảm latency và tải đọc lặp lại lên PostgreSQL cho các truy vấn phù hợp cache.
- Hỗ trợ distributed coordination cho outbox/retry và một số background flows.
- Tăng tính nhất quán kiến trúc khi tách rõ cache layer và source-of-truth layer.

### Negative
- **Governance overhead** — cần thêm rule cho key naming, TTL, invalidation và observability. **Mitigation**: chuẩn hóa namespace + TTL trong ADR này; service owner publish key catalog trong HLD của boundary.
- **Operational dependency** — Redis availability, sizing, failover trở thành ops concern. **Mitigation**: managed Redis với HA + sizing dashboard per-service.
- **Stale data risk** — invalidation không chuẩn có thể ảnh hưởng hành vi nghiệp vụ. **Mitigation**: TTL hard expiry làm bound trên drift; mutation path bắt buộc có invalidate hook.



## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [data/gf-system-data-model.md](../data/gf-system-data-model.md)
- [data/gf-inventory-data-model.md](../data/gf-inventory-data-model.md)
- [events/event-contracts.md](../events/event-contracts.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven), ADR-008 (worker services)

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-007 `Redis-Backed Cache And Runtime State`: nhiều Garage services dùng Redis cho cache, permission lookup và distributed coordination nhưng chưa có rule chung về key/TTL/invalidation/fallback, decision = Redis là cache/coordination layer cho service-local concerns và KHÔNG được dùng làm system of record, có rule key namespace per-service-tenant và TTL/invalidation policy bắt buộc, consequence = giảm latency và hỗ trợ distributed coordination cho outbox/retry nhưng thêm operational dependency và rủi ro stale data nếu invalidation không chuẩn. Bao gồm Status, Context, Decision (use cases + key namespace + TTL + lock idempotency), Alternatives Considered, Consequences, References. |
