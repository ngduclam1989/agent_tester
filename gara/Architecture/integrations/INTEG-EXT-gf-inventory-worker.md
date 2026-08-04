---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-inventory"
provider: "gf-inventory-worker"
last_reviewed: "2026-05-19"
supersedes: "INTEG-EXT-gf-worker.md (renamed 2026-05-08 — provider thực sự là gf-inventory-worker)"
---

# Integration — `gf-inventory` ↔ `gf-inventory-worker` (BE↔BE Garage-internal)

> Document tích hợp giữa `gf-inventory` (domain owner) và `gf-inventory-worker` (Temporal workflow orchestrator) cho reservation expiry workflow.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-inventory-worker`** — Temporal workflow worker cho receipt/delivery/reservation/period closure |
| Provider docs | [Architecture/api/gf-inventory-worker-api.md](../api/gf-inventory-worker-api.md), [Architecture/hld/gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md) |
| Used by boundary | `gf-inventory` (domain owner trigger workflow) |
| Module / class | `gf-inventory/src/main/java/com/actechx/gf/adapter/client/WorkerClient.java` |
| Sandbox URL | `gf-inventory-worker.api.base-url=${GF_INVENTORY_WORKER_URL}` trong gf-inventory application.yml line 89-91 |
| Production URL | Env runtime: `GF_INVENTORY_WORKER_URL` |
| API version pinned | `/protected/workflows/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage worker service (Temporal orchestration) |

---

## 2. Why this provider (decision)

**Decision**: gf-inventory call gf-inventory-worker để start/release/fulfill reservation expiry workflow.

**Why**:
- Reservation expiry cần durable timer (Temporal) — gf-inventory không own Temporal runtime.
- Tách workflow orchestration ra worker service theo ADR-005 (Temporal workflow) + ADR-008 (worker services).
- gf-inventory own reservation domain state; worker chỉ orchestrate timer + signal callback.

**Ref**: ADR-005 (Temporal), ADR-008 (worker services).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Storage | Env var (default `change-me-in-production` cho dev) |
| Tenant resolution | Query parameter `tenantId` |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Start reservation expiry workflow | POST | `/protected/workflows/reservation-expiry/start` | Khởi động Temporal workflow timer cho reservation TTL | Khi gf-inventory reserve stock cho delivery |
| 2 | Release reservation | POST | `/protected/workflows/reservation-expiry/{deliveryCode}/release` | Signal workflow để release stock (cancel, expire) | User cancel delivery hoặc workflow timer fire |
| 3 | Fulfill reservation | POST | `/protected/workflows/reservation-expiry/{deliveryCode}/fulfill` | Signal workflow để consume reservation (delivery completed) | Delivery hoàn tất, stock chuyển từ reserved → consumed |

**Additional endpoints (outside gf-inventory caller scope)**: 7 period-closure operator endpoints (`/protected/v2/period-closure/operator/*`) — admin-only manual trigger/status/cancel/retry, no SVC caller (per KG RULE-08 audit 2026-05-14).

---

## 5. Request / Response Contracts

### 5.1 Start reservation expiry

**Request**:
```
POST /protected/workflows/reservation-expiry/start?tenantId=12345
Headers: x-api-key
Body:
{
  "deliveryCode": "DEL-20260506-00001",
  "expiryDuration": "PT24H",
  "items": [...]
}
```

**Response**: `200 OK` với workflow ID (Temporal workflow ID).

### 5.2 Release / Fulfill

**Request**:
```
POST /protected/workflows/reservation-expiry/DEL-20260506-00001/release?tenantId=12345&userId=user-123&reason=user_cancel
Headers: x-api-key
```

**Response**: `200 OK`.

---

## 6. Failure Handling

| Mode | Symptom | Action |
|---|---|---|
| Network timeout | No response | Retry idempotent (workflow ID dedup); alert nếu persistent |
| Provider 5xx | HTTP 500 | Single retry; surface error to caller |
| Workflow not found | 404 | Log + ignore (workflow đã completed/canceled) |
| Duplicate start | 409 (idempotency conflict) | Accept as success — workflow ID đã exist |

Workflow ID convention: `reservation-expiry-{tenantId}-{deliveryCode}` → idempotent start safe.

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency | Deterministic workflow ID; duplicate start = no-op |
| Activity idempotency | gf-inventory operations (release/fulfill) phải idempotent (gf-inventory side enforce) |
| Order | Workflow Temporal đảm bảo signal ordering |
| Replay safety | Safe — Temporal có replay semantics built-in |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `gf_inventory.worker_client.requests` | `op`, `status` |
| `gf_inventory.worker_client.duration` | `op` |
| `temporal.workflow.start` (worker side) | `workflowType=reservation-expiry` |

Tracing: span name `http POST /protected/workflows/...`; correlation ID forward; workflow ID logged.

---

## 9. SLA, Quotas & Cost

Internal — same VPC. SLA 99.9% expected. Workflow start latency p99 < 200ms.

---

## 10. PII / Compliance

No PII in workflow payload (delivery codes, reservation IDs only). Audit qua Temporal history.

---

## 11. Sandbox vs Production

Env switchover via `GF_INVENTORY_WORKER_URL`. Default dev `change-me-in-production` — must rotate.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock WorkerClient |
| Integration | Real gf-inventory-worker + Temporal test cluster |
| E2E | Full reservation lifecycle: reserve → expire → release |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-inventory-worker down | Reservations không có TTL timer; alert ops; manual cleanup TTL via gf-inventory cron fallback |
| Temporal cluster down | Workflow stuck; reservation stocks blocked; failover Temporal HA |
| Duplicate start spam | Investigate caller bug (should be deterministic ID) |

---

## 14. Forbidden patterns

- ❌ `gf-inventory` ghi trực tiếp DB của `gf-inventory-worker` — phải qua protected workflow API.
- ❌ Skip `x-api-key` header — worker reject 401.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only (default `change-me-in-production` cho dev — must rotate prod).
- ❌ Workflow ID không deterministic — duplicate start risk; convention `reservation-expiry-{tenantId}-{deliveryCode}`.
- ❌ Activity mutation không idempotent — Temporal retry sẽ gây double effect.
- ❌ Caller polling workflow status thay vì dùng signal/query — anti-pattern Temporal.
- ❌ Worker tự sở hữu durable business state — orchestration only (per ADR-005, ADR-008).
- ❌ Bypass `gf-inventory` business state khi modifying stock — workflow phải callback gf-inventory APIs.

## 15. References

- HLD provider: [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md)
- HLD caller: [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md)
- API contract: [gf-inventory-worker-api.md](../api/gf-inventory-worker-api.md), [gf-inventory-api.md](../api/gf-inventory-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-005 (Temporal workflow orchestration), ADR-008 (worker services), ADR-001 (microservice landscape)
- Related INTEG: [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md) (worker callback gf-inventory protected APIs cho receipt/delivery/reservation operations)
- KG: [gf-inventory-worker.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-inventory-worker.knowledge-graph.yaml) — 10 APIs, 9 BRs, 6 Temporal workflows
- Business Rules: NA (caller side); provider BRs: BR-GF-INVENTORY-WORKER-001..009 in KG

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v4: verified 3/3 active endpoints match; thêm 7 unused period-closure endpoints note; thêm KG reference + BR cross-ref; version bump. |
| 2026-05-07 | v1 | Initial integration contract `gf-inventory` -> `gf-inventory-worker` (Temporal workflow worker per ADR-005 + ADR-008, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/workflows/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`); key operations start/release/fulfill reservation expiry workflow (worker own Temporal runtime + durable timer, gf-inventory own reservation domain state, signal callback pattern); failure mode workflow durability via Temporal + idempotency theo workflowId, no caller-side retry (worker durable). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
