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

# ADR-008: Worker Services For Async Processing — Tách worker/agent cho luồng bất đồng bộ

## Status
ACCEPTED 

## Context

Garage hiện có các worker/agent boundaries riêng cho xử lý bất đồng bộ. Câu hỏi cần quyết định:

1. Async/long-running workloads nên ở domain API service hay tách thành worker boundary riêng?
2. Worker được sở hữu state gì (workflow state / message durability / job execution history) và không được sở hữu gì (business domain state)?
3. Idempotency và retry contract giữa worker và service owner phải tuân theo chuẩn nào?

**Evidence từ source / TECHSTACK:**
- `gf-inventory-worker`: nhận Kafka event từ purchase/service order, chạy Temporal workflows cho receipt, delivery, reservation expiry, period closure và retry batch.
- `gf-erp-agent`: làm durable message bridge giữa Garage và ERP/COP; lưu inbound/outbound message, xử lý retry theo batch và gọi downstream services.
- `gf-worker`: chạy scheduled HTTP jobs theo cấu hình DB (`job_config`), ghi lịch sử vào `schedule_history`, hỗ trợ API vận hành enable/disable/reload.

**Constraints từ runtime:**
- Worker runtime và domain API runtime có profile khác nhau về timeout, retry, concurrency và failure mode.
- `gf-inventory-worker` theo mô hình thin worker: workflow state ở Temporal, business mutation vẫn qua protected API của `gf-inventory`.
- `gf-erp-agent` sở hữu trạng thái relay/message durability, không sở hữu state nghiệp vụ gốc của purchase/shipment/inventory.
- `gf-worker` có bề mặt outbound HTTP rộng, cần governance chặt về target allow-list, auth và change control.

**Business rules liên quan:** NA.

## Decision

**Giữ mô hình worker/agent services chuyên trách cho async processing, tách orchestration ra khỏi domain API; worker không sở hữu durable business data.**

Quyết định này phù hợp với kiến trúc đã có trong source: async workloads cần timeout/retry/concurrency controls riêng; Temporal workflows yêu cầu runtime chuyên biệt cho signal/query/retry; message bridge cần state machine và audit trail; DB-driven scheduling linh hoạt giải bài toán thêm job mà không build/redeploy.

Cụ thể:

- **Boundary tách**: Tách orchestration bất đồng bộ ra khỏi domain API services; không nhúng toàn bộ long-running jobs vào `gf-sales`, `gf-purchase`, `gf-inventory` hoặc các service nghiệp vụ khác.
- **Ownership**:
  - `gf-inventory-worker` sở hữu workflow orchestration (Temporal/Kafka consumer/operator API), KHÔNG sở hữu durable business data của kho.
  - `gf-erp-agent` sở hữu message durability, relay status, retry và notification orchestration cho luồng ERP bridge.
  - `gf-worker` sở hữu generic scheduled job engine theo DB-config: scheduler runtime, retry logic, execution history.
- **Mutation rule**: Mọi business mutation phải đi qua service owner APIs/contracts; worker không được ghi trực tiếp schema nghiệp vụ của service khác.
- **Idempotency**: Các worker phải thực thi idempotency theo `workflow ID / message key / job key` và có runbook retry/failure rõ ràng.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Đưa toàn bộ background processing vào domain services** | Ít service hơn, deployment đơn giản hơn | Tăng coupling giữa interactive API và long-running workloads | Khó scale độc lập và khó khoanh vùng sự cố cho async failures |
| **Chỉ dùng Kafka consumers, không dùng Temporal workflows** | Ít thành phần runtime hơn | Không đáp ứng tốt timer, signal/query, retry orchestration, fan-out/fan-in | Period closure và các flow cần state machine + signal không thực hiện được tốt với Kafka thuần |
| **Dùng external cron/job platform cho toàn bộ scheduled jobs** | Tập trung scheduler layer | Lệch implementation hiện tại; không tận dụng `gf-worker` đã có | `gf-worker` đã sở hữu DB-driven job model và API vận hành — thay thế toàn phần là rework không cần thiết |

## Consequences

**Positive:**
- Cô lập async failures khỏi API request/response path.
- Có thể scale và vận hành worker theo tải riêng từng loại job/event/workflow.
- Ownership rõ ràng cho workflow state, message durability và execution history.

**Negative:**
- **Tăng số runtime components cần monitor và vận hành** — số deployment unit nhiều hơn. **Mitigation**: shared observability stack (metrics/tracing/log); runbook chuẩn per-worker.
- **Đòi hỏi governance chặt cho idempotency, retry policy, contract giữa worker với service owner** — boundary discipline. **Mitigation**: ADR này + workflow ID convention + protected API contract; review trong HLD update cycle.
- **Tăng độ phức tạp khi trace end-to-end qua API → Kafka → Temporal → worker** — debug khó hơn. **Mitigation**: correlation ID bắt buộc forward; OpenTelemetry trace span span tất cả runtimes.


## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- HLD: [gf-worker-HLD.md](../hld/gf-worker-HLD.md), [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md), [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md)
- Workflows:  [inventory-period-closure-flow.md](../workflows/inventory-period-closure-flow.md)
- Events: [event-contracts.md](../events/event-contracts.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven), ADR-005 (Temporal workflow orchestration)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-008 `Worker Services For Async Processing`: async/long-running workloads có timeout, retry, concurrency profile khác domain API và Garage đã có boundary worker/agent riêng (`gf-inventory-worker`, `gf-erp-agent`, `gf-worker`), decision = giữ mô hình worker/agent services chuyên trách cho async processing, tách orchestration ra khỏi domain API và worker không sở hữu durable business data, consequence = cô lập async failures và scale theo tải riêng nhưng tăng số runtime cần monitor và đòi hỏi governance idempotency/retry contract giữa worker và service owner. Bao gồm Status, Context, Decision (boundary tách + ownership + mutation/idempotency rules), Alternatives Considered, Consequences, References. |
