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

# ADR-005: Temporal Workflow Orchestration — Durable execution cho long-running workflows

## Status
ACCEPTED 

## Context

Garage có nhiều workflow vượt quá phạm vi request/response ngắn. Câu hỏi cần quyết định:

1. Cơ chế nào dùng cho long-running workflows cần timer, signal, query, retry, child workflow, saga/compensation?
2. Service nào được coi là Temporal owner (theo evidence) và service nào KHÔNG?
3. Workflow ID convention, activity idempotency và workflow vs domain state ownership ra sao?

**Evidence từ source / TECHSTACK — Temporal owners:**

| Boundary | Temporal evidence | Workflow examples |
|---|---|---|
| `gf-sales` | Temporal starter/config, workflow docs | `sales-booking-lifecycle-flow` cho booking lifecycle, quotation reminder, no-show check |
| `gf-customer` | Temporal starter/config | `SegmentEvaluationWorkflow` cho customer segment evaluation |
| `gf-marketing` | Temporal starter/config | `WaveWorkflow`, `TriggeredCampaignCronWorkflow`, voucher program/expiry workflows |
| `gf-inventory` | Temporal SDK/starter/config | Inventory domain có Temporal dependency và phối hợp với worker/API |
| `gf-inventory-worker` | Temporal SDK/starter/testing, task queue | Receipt fulfillment, delivery fulfillment, reservation expiry, period closure coordinator/child workflows |

**Evidence từ source — KHÔNG phải Temporal owner (chỉ dựa trên tài liệu hiện tại):**
- `gf-purchase`: workflow mua hàng là REST/domain service/Kafka/outbox choreography, không thấy Temporal workflow class/task queue.
- `gf-notification`: dispatch flow dùng Kafka, DB state machine, inbox idempotency và Spring `@Scheduled`, không thấy Temporal worker.
- `gf-system`: tenant/branch provisioning dùng Kafka consumer, DB transaction, feature flag và outbox/direct Kafka publish.
- `gf-shipment`: lifecycle hiện là synchronous internal REST workflow, không dùng Temporal/Kafka/outbox.
- `gf-worker`: generic scheduled HTTP jobs dùng DB polling/custom scheduler, không dùng Temporal.
- `ocr-car-registration`: FastAPI in-process OCR pipeline, không dùng Temporal.

**Constraints từ runtime:**
- Cần chờ lâu mà không giữ HTTP thread hoặc DB transaction.
- Cần signal từ user/API/event để hoàn tất hoặc hủy sớm.
- Cần retry activity có kiểm soát khi downstream tạm lỗi.
- Cần visibility trạng thái workflow cho vận hành.
- Cần child workflow/concurrency control (vd inventory period closure).
- Cần durable timer (reservation expiry, voucher expiry, no-show check, campaign cron).

**Business rules liên quan:** NA.

## Decision

**Sử dụng Temporal cho các long-running workflows cần durable execution, timer, signal, query, child workflow, retry policy hoặc saga/compensation rõ ràng; chỉ service có dependency/config/workflow interface trong source mới được coi là Temporal owner.**

Kafka/Event Hubs (ADR-004) và Temporal bổ sung cho nhau: Kafka phù hợp event fan-out và trigger bất đồng bộ; Temporal phù hợp orchestration có state machine, timer, signal và compensation. Quyết định này tránh over-claim — flow đang là REST/Kafka/scheduler choreography sẽ tiếp tục được document như non-Temporal cho đến khi source chứng minh ngược lại.

Cụ thể:

- **Owner gating**: Chỉ service có dependency/config/workflow interface được xác nhận trong source mới được ghi là Temporal owner.
- **Domain ownership rule**: Temporal workflow orchestration KHÔNG thay thế domain state ownership. Domain state vẫn nằm ở service owner (`gf-inventory`, `gf-sales`, `gf-customer`, `gf-marketing`).
- **Worker boundary**: Worker chỉ điều phối và gọi activity/protected API. Worker KHÔNG tự sở hữu durable domain data nếu HLD/data model không định nghĩa rõ.
- **Workflow ID convention**: deterministic theo aggregate/business key khi cần chặn duplicate. Ví dụ: `receipt-fulfillment-{tenantId}-{purchaseOrderCode}`, `delivery-fulfillment-{tenantId}-{serviceOrderCode}`, `reservation-expiry-{tenantId}-{deliveryCode}`.
- **Activity idempotency**: Activity phải idempotent hoặc có guard ở service owner (Temporal retry có thể gọi lại activity).
- **Race condition**: Timer/signal workflows phải định nghĩa rõ race condition giữa timeout và signal.
- **Source of truth**: Workflow query/status chỉ là operational visibility. Source of truth cuối cùng vẫn phải là domain state trong service owner.
- **Kafka trigger**: Có thể trigger workflow nhưng consumer cần idempotency/inbox hoặc duplicate-start guard trước khi gọi `WorkflowClient`.
- **Anti-claim**: KHÔNG gán workflow sang Temporal chỉ vì tài liệu nghiệp vụ có chữ "workflow"; cần evidence `@WorkflowInterface`, `WorkflowClient`, task queue hoặc Temporal config.

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **Pure Kafka choreography cho mọi workflow** | Tận dụng hạ tầng Kafka hiện có, dễ fan-out, không thêm Temporal runtime | Không đủ tốt cho durable timers, signal/query, child workflow, long wait, compensation có thứ tự | Reservation expiry, period closure, campaign wave, voucher expiry cần orchestration rõ hơn event choreography thuần |
| **Synchronous REST orchestration** | Dễ đọc, ít hạ tầng hơn, phù hợp command ngắn | Không sống tốt qua timeout, restart, retry dài hạn, user signal hoặc wait đến thời điểm tương lai | Request/response không phù hợp workflow kéo dài từ phút đến ngày |
| **Spring Scheduler / cron jobs cho mọi timer** | Đơn giản, quen thuộc với Spring, không cần Temporal cluster | Khó cung cấp per-aggregate durable state, signal, query, retry history, child workflow visibility | Có thể dùng cho job đơn giản nhưng không thay thế Temporal cho orchestration phức tạp |
| **Đưa toàn bộ workflow logic vào domain service** | Ít service hơn, domain code gần data owner hơn | Source đã có `gf-inventory-worker` làm worker orchestration; tách giúp scale/retry độc lập | Domain service nên tập trung business state/API; orchestration profile khác request/response API |
| **Temporal cho mọi workflow documentation** | Ngôn ngữ tài liệu thống nhất | Sai evidence — nhiều workflow là REST/Kafka/scheduler/in-process pipeline | ADR phải phản ánh runtime thật; gắn nhãn sai dẫn tới thiết kế hoặc vận hành sai |

## Consequences

**Positive:**
- Durable timers và signals cho booking, reservation, campaign, voucher, segment và inventory workflows.
- Activity retry/timeout được mô hình hoá rõ thay vì rải trong job code.
- Có thể query/cancel workflow state ở những flow có API/query tương ứng.
- Child workflows/concurrency control giúp inventory period closure xử lý nhiều warehouse an toàn hơn.
- Worker orchestration giúp tách throughput/retry của workflow khỏi API services.

**Negative:**
- **Thêm Temporal runtime cần deploy, monitor, backup, upgrade** — operational cost. **Mitigation**: managed Temporal Cloud hoặc shared cluster với HA; runbook chuẩn; sizing dashboard.
- **Workflow state và domain state có thể diverge** — nếu activity fail sau khi domain state đã đổi. **Mitigation**: activity idempotency bắt buộc; reconciliation job cho workflow vs domain state.
- **Developer phải hiểu deterministic workflow code, activity idempotency, signal race và retry semantics** — learning curve. **Mitigation**: workflow code review checklist; test pattern chuẩn hoá; training/onboarding doc.
- **Duplicate start, workflow ID convention và task queue ownership phải quản trị chặt** — drift risk. **Mitigation**: ADR rule + workflow ID convention; CI verify task queue ownership.
- **Một số workflow docs có ownership gap giữa `gf-inventory` và `gf-inventory-worker`** — chưa rõ. **Mitigation**: HLD update để clarify ranh giới activity vs workflow; data model audit per-boundary.



## References

- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- [TECHSTACK.md](../TECHSTACK.md)
- HLD: [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-customer-HLD.md](../hld/gf-customer-HLD.md), [gf-marketing-HLD.md](../hld/gf-marketing-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md)
- Workflows: [sales-booking-lifecycle-flow.md](../workflows/sales-booking-lifecycle-flow.md), [customer-segment-evaluation-flow.md](../workflows/customer-segment-evaluation-flow.md), [marketing-campaign-wave-flow.md](../workflows/marketing-campaign-wave-flow.md), [voucher-program-lifecycle-flow.md](../workflows/voucher-program-lifecycle-flow.md), [inventory-receipt-fulfillment-flow.md](../workflows/inventory-receipt-fulfillment-flow.md), [inventory-delivery-fulfillment-flow.md](../workflows/inventory-delivery-fulfillment-flow.md), [inventory-period-closure-flow.md](../workflows/inventory-period-closure-flow.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-004 (Kafka event-driven), ADR-008 (worker services)
- Business Rules: NA

## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial ADR-005 `Temporal Workflow Orchestration`: Garage có nhiều workflow vượt khỏi request/response ngắn cần durable execution, timer, signal, child workflow và saga/compensation, decision = dùng Temporal cho long-running workflows nhưng chỉ service có dependency/config/workflow interface trong source mới được coi là Temporal owner (`gf-sales`, `gf-customer`, `gf-marketing`, `gf-inventory`, `gf-inventory-worker`), consequence = orchestration rõ ràng cho booking/segment/campaign/inventory nhưng thêm Temporal runtime cần vận hành và workflow state có thể diverge với domain state nếu activity không idempotent. Bao gồm Status, Context (Temporal owner vs non-owner evidence), Decision (owner gating + workflow ID convention + activity idempotency), Alternatives Considered, Consequences, References. |
