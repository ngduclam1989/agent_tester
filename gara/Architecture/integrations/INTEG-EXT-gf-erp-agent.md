---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-purchase"
provider: "gf-erp-agent"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — `gf-purchase` ↔ `gf-erp-agent` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE giữa `gf-purchase` và `gf-erp-agent` cho ERP/Ecom4G/COP relay (quotation, pricing, purchase request).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-erp-agent`** — Durable message bridge giữa Garage và ERP/COP channels (theo ADR-008) |
| Provider docs | [Architecture/api/gf-erp-agent-api.md](../api/gf-erp-agent-api.md), [Architecture/hld/gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md) |
| Used by boundary | `gf-purchase` (forward outbound messages tới ERP/COP qua agent) |
| Module / class | `gf-purchase/src/main/java/com/actechx/gf/adapter/client/AgentClient.java` |
| Sandbox URL | `gf-purchase-service.url` trong gf-erp-agent application.yml line 96-97 — note: gf-purchase calls gf-erp-agent qua URL `${GF_ERP_AGENT_URL}` (caller side) |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage worker/agent service |

---

## 2. Why this provider (decision)

**Decision**: gf-purchase forward outbound ERP/COP integration messages (quotation ask, pricing, purchase request, cancel, confirm) qua gf-erp-agent thay vì gọi ERP/COP trực tiếp.

**Why**:
- gf-erp-agent là durable message bridge — own message durability, retry, audit trail (ADR-008).
- gf-purchase tách khỏi ERP runtime concerns (timeout, rate limit, channel-specific format).
- Reliability: outbound messages persisted ở gf-erp-agent đảm bảo at-least-once delivery dù ERP tạm down.

**Ref**: ADR-008 (worker services), ADR-004 (Kafka event-driven).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | Body field `tenantId` |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Create quotation ask (agent) | POST | `/protected/v1/quotation-asks` | Forward QA outbound tới ERP/COP | gf-purchase domain create QA |
| 2 | Create pricing request | POST | `/protected/v1/pricing` | Submit pricing batch | Pricing decision finalized |
| 3 | Create purchase request | POST | `/protected/v1/purchases` | Forward PR outbound | PR confirmed bởi user |
| 4 | Cancel purchase request | PUT | `/protected/v1/purchases/cancel` | Cancel PR via agent relay | User cancel PR |
| 5 | Confirm purchase request | POST | `/protected/v1/purchases/confirm` | Confirm batch PRs — **PRIORITY message** (immediate AFTER_COMMIT processing per KG BR-004) | Batch confirmation flow |
| 6 | Confirm received purchase request | POST | `/protected/v1/purchases/confirm-received` | Confirm received goods | Receipt completed |

> **Note (KG BR-004)**: Operation #5 (confirm) tạo OutboundMessage với status PRIORITY_PROCESSING — xử lý immediate sau commit, không chờ batch scheduler.
>
> **Note (KG suspect bug)**: Operation #4 (cancel) publish lên topic `order-stage-update` thay vì `purchase-request` (cùng topic với confirm) — có thể là copy-paste error từ commit 9c2d196. KG đã flag cần dev confirm intent.

---

## 5. Request / Response Contracts

### 5.1 Create purchase request

**Request**:
```
POST /protected/v1/purchases
Headers: x-api-key
Body: PurchaseRequestAgentRequest
{
  "tenantId": 12345,
  "purchaseRequestCode": "PR-...",
  "items": [...],
  "vendor": "...",
  ...
}
```

**Response**: `201 Created` với `ApiResponse<String>` chứa string `"OK"`.

(Other 5 operations follow similar shape — payload in body, x-api-key header, tenant in body.)

---

## 6. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-purchase retry idempotent operations; non-idempotent log + manual intervention |
| Provider 5xx | Surface error; gf-purchase outbox retry |
| Provider 4xx (validation) | Mark FAILED; alert ops |
| Duplicate (409) | Accept as success — agent dedup |

gf-erp-agent persist mọi inbound message → durable retry.

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency | Theo `purchaseRequestCode` / `quotationAskCode` — agent dedup |
| Ordering | Per-tenant ordering qua message sequence |
| Replay safety | Safe — agent dedup |

---

## 8. Observability

`gf_purchase.agent_client.requests/.duration/.errors`. Log: `correlation_id`, `tenantId`, `messageId`, `op`.

---

## 9. SLA, Quotas & Cost

Internal — but downstream ERP/COP may have rate limits. gf-erp-agent throttle.

---

## 10. PII / Compliance

PII trong purchase request payload (vendor info, shipping address). Audit log mandatory.

---

## 11. Sandbox vs Production

Env switchover via `GF_ERP_AGENT_URL`.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock AgentClient |
| Integration | Real gf-erp-agent test instance |
| Contract | Verify all 6 operation schemas |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-erp-agent down | gf-purchase outbox retain messages; retry sau recovery |
| ERP/COP downstream slow | gf-erp-agent backpressure; alert if backlog > N |

---

## 14. Forbidden patterns

- ❌ `gf-purchase` ghi trực tiếp DB của `gf-erp-agent` — phải qua protected relay API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip tenant scope (`tenantId` field trong body) — cross-tenant ERP relay risk.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full purchase request payload (vendor info, shipping address PII).
- ❌ Send same QA/PR multiple times mà không dedup theo code — agent dedup nhưng cũng cần caller-side guard.
- ❌ Skip outbox pattern cho outbound message — direct publish risk lost message khi agent down.
- ❌ Bypass message audit trail — agent persist mọi inbound/outbound message; KHÔNG bypass logging.

## 15. References

- HLD provider: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md)
- HLD caller: [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- API contract: [gf-erp-agent-api.md](../api/gf-erp-agent-api.md), [gf-purchase-api.md](../api/gf-purchase-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-008 (worker services — gf-erp-agent durable bridge), ADR-004 (Kafka event-driven), ADR-001 (microservice landscape)
- Related INTEG: [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md), [INTEG-EXT-gf-shipment.md](INTEG-EXT-gf-shipment.md), [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md), [INTEG-EXT-gf-notification.md](INTEG-EXT-gf-notification.md) (gf-erp-agent là hub forward sang nhiều downstream)
- KG: [gf-erp-agent.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-erp-agent.knowledge-graph.yaml) — 10 APIs, 13 BRs, 4 batch workflows, 6 produce + 12 consume Kafka topics
- Business Rules: NA (caller side); provider BRs: BR-GF-ERP-AGENT-001..013 in KG

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v2: verified 6/6 endpoints match; thêm KG reference + BR-004 priority message note + suspect cancel topic bug note; version bump. |
| 2026-05-07 | v1 | Initial integration contract `gf-purchase` -> `gf-erp-agent` (durable ERP/COP message bridge, BE-BE Garage-internal per ADR-008): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`); key operations forward outbound quotation ask, pricing, purchase request, cancel, confirm tới ERP/Ecom4G/COP qua agent thay vì gọi trực tiếp; failure mode at-least-once delivery (agent persist + retry), caller-side outbox pattern + dedup theo code, no caller circuit breaker (agent durable). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
