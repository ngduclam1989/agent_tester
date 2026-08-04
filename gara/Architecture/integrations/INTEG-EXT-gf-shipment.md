---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-erp-agent"
provider: "gf-shipment"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — `gf-erp-agent` ↔ `gf-shipment` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE giữa `gf-erp-agent` và `gf-shipment` cho shipment order creation/status từ ERP/COP relay.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-shipment`** — Shipment lifecycle service (shipment order, stage transitions) |
| Provider docs | [Architecture/api/gf-shipment-api.md](../api/gf-shipment-api.md), [Architecture/hld/gf-shipment-HLD.md](../hld/gf-shipment-HLD.md) |
| Used by boundary | `gf-erp-agent` (durable message bridge từ ERP/COP) |
| Module / class | `gf-erp-agent/src/main/java/com/actechx/gf/adapter/client/rest/GfShipmentClient.java` |
| Sandbox URL | `gf-shipment-service.url=${GF_SHIPMENT_SERVICE_URL}` trong gf-erp-agent application.yml line 99-100 |
| Production URL | Env runtime: `GF_SHIPMENT_SERVICE_URL` |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (shipment operations) |

---

## 2. Why this provider (decision)

**Decision**: gf-erp-agent forward shipment order create/update events từ external ERP/COP xuống `gf-shipment` (Garage-side shipment domain owner).

**Why**:
- gf-erp-agent là durable message bridge (theo ADR-008 worker services). Không own shipment business state.
- `gf-shipment` là shipment domain owner — own ShipmentOrder lifecycle, stage transitions.
- Tách shipment lifecycle ra service riêng cho phép evolve shipment domain mà không đụng ERP integration logic.

**Ref**: ADR-001 (microservice landscape), ADR-008 (worker services).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | **OAuth2 JWT** (`Authorization: Bearer <token>`) — gf-shipment dùng `spring-boot-starter-oauth2-resource-server`, KHÔNG dùng x-api-key cho inbound. LƯU Ý: `internal-service.api-key` chỉ dùng cho outbound calls từ gf-shipment → gf-purchase. |
| Tenant resolution | Implicit trong request body fields |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Create shipment order | POST | `/protected/v1/shipment-orders` | Tạo shipment order từ ERP/COP message với purchase order code reference | Inbound Kafka event từ ERP relay → gf-erp-agent dispatch |
| 2 | Update shipment status | POST | `/protected/v1/shipment-orders/status` | Cập nhật status (OPEN → CLOSED → WAIT_TO_CONFIRM); may cascade PO status update | Inbound status update event từ ERP |

---

## 5. Request / Response Contracts

### 5.1 Create shipment order

**Request**:
```
POST /protected/v1/shipment-orders
Headers: Authorization: Bearer <jwt-token>
Content-Type: application/json
```
```json
{
  "id": 100001,
  "code": "SHIP-20260506-00001",
  "type": "RECEIPT",
  "locationId": 5,
  "note": "Giao hàng đợt 1",
  "status": "OPEN",
  "shipmentOrderLines": [...],
  "shipmentOrderLinePOs": [...],
  "shipmentOrderLineSOs": [...],
  "attachments": [...],
  "isDeleted": false
}
```

**Fields**:
- `id`: caller-provided (NotNull) — gf-shipment dùng caller ID, không tự generate
- `code`: unique shipment code (NotBlank)
- `type`: `RECEIPT` | `DELIVERY`
- `status`: `OPEN` | `CLOSED` | `WAIT_TO_CONFIRM` (NotNull)
- `shipmentOrderLines/LinePOs/LineSOs`: 3 distinct line arrays cho generic, PO-linked, SO-linked items

**Response**: `200 OK` với empty body (`ResponseEntity.ok().build()`).

### 5.2 Update shipment status

**Request**:
```
POST /protected/v1/shipment-orders/status
Headers: Authorization: Bearer <jwt-token>
Content-Type: application/json
```
```json
{
  "shipmentOrderCode": "SHIP-20260506-00001",
  "type": "RECEIPT",
  "status": "CLOSED"
}
```

**Fields**:
- `shipmentOrderCode`: target shipment order
- `type`: `RECEIPT` | `DELIVERY`
- `status`: `OPEN` | `CLOSED` | `WAIT_TO_CONFIRM`

When a PO line transitions to CLOSED + isEnough + isLast, gf-shipment cascades callback to gf-purchase (`PUT /protected/v1/purchase-orders/status`).

**Response**: `200 OK` với empty body (`ResponseEntity.ok().build()`).

---

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect | Action |
|---|---|---|---|
| Network timeout | No response 30s | RestClientException | Retry batch (gf-erp-agent durable message bridge tự retry) |
| Provider 5xx | HTTP 500 | Status code | Persist message vào outbox; retry với exponential backoff |
| Provider 4xx (validation) | 400 | Status code | Mark message status FAILED; alert; manual intervention |
| Provider 4xx (duplicate) | 409 | Status code | Idempotent — accept as success |

### 6.2 Retry policy

gf-erp-agent có **batch retry** cho durable messages:
- Persist inbound/outbound message in DB
- Background worker retry FAILED status messages với exponential backoff
- Max retries configurable; alert sau N attempts

### 6.3 Circuit breaker

N/A — gf-erp-agent retry-heavy by design; shipment downtime affect message lag (acceptable cho ERP integration profile).

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency | gf-shipment dedup theo `code` (shipment order code unique) |
| Ordering | Per-tenant ordering qua Kafka partition key |
| Replay safety | gf-erp-agent message replay safe — gf-shipment dedup ở receive |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `gf_erp_agent.shipment_client.requests` | `op`, `status` |
| `gf_erp_agent.shipment_client.duration` | `op` |
| `gf_erp_agent.shipment_message_relay.duration` | `messageType` |

Log: `correlation_id`, `tenantId`, `messageId`, `purchaseOrderCode`, `op`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Internal — 99.9% expected |
| Our SLA exposed | ERP relay tolerates lag (eventual consistency) |
| Rate limits | None |

---

## 10. PII / Compliance

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Possibly — vendor info, delivery address |
| Audit | gf-shipment own audit log |

---

## 11. Sandbox vs Production

Switchover qua `GF_SHIPMENT_SERVICE_URL` env.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfShipmentClient |
| Integration | Real gf-shipment test instance |
| Contract test | Verify ShipmentOrderRequest schema |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-shipment down | Messages backlog trong gf-erp-agent outbox; alert ops; manual replay sau recovery |
| Schema mismatch | Coordinate update shipment + agent versioning |

---

## 14. Forbidden patterns

- ❌ `gf-erp-agent` ghi trực tiếp DB của `gf-shipment` — phải qua protected API.
- ❌ Skip `Authorization: Bearer` JWT token — provider reject 401 (gf-shipment dùng OAuth2, KHÔNG dùng x-api-key cho inbound).
- ❌ Skip tenant scope trong body (`tenantId` field bắt buộc).
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full message payload (vendor info, delivery address PII).
- ❌ Retry permanent 4xx — only retry 5xx/timeout (gf-erp-agent durable retry).
- ❌ Skip dedup theo shipment `code` — duplicate shipment creation risk.
- ❌ Caller infer shipment lifecycle state mà không qua status update endpoint.

## 15. References

- HLD provider: [gf-shipment-HLD.md](../hld/gf-shipment-HLD.md)
- HLD caller: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md)
- API contract: [gf-shipment-api.md](../api/gf-shipment-api.md), [gf-erp-agent-api.md](../api/gf-erp-agent-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-008 (worker services — gf-erp-agent durable bridge), ADR-004 (Kafka event-driven)
- KG: [gf-shipment.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-shipment.knowledge-graph.yaml) — 2 internal APIs, 12 BRs
- Related INTEG: [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md) (gf-shipment cũng callback PO status update)
- Business Rules: BR-GF-SHIPMENT-010 (callback trong @Transactional), BR-GF-SHIPMENT-011 (caller-provided ID), BR-GF-SHIPMENT-012 (findByCode không load attachments)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Cross-review sync với KG v4: sửa auth mechanism từ x-api-key sang OAuth2 JWT — gf-shipment dùng spring-boot-starter-oauth2-resource-server, KHÔNG dùng x-api-key cho inbound (D1); thay thế hoàn toàn §5.1 create schema — từ fabricated sang actual 11 fields (D3); thay thế §5.2 update schema — xoá ghost field "stage" (SHIPPED/DELIVERED), dùng actual field "status" (OPEN/CLOSED/WAIT_TO_CONFIRM) (D4); sửa §7 idempotency field name (D7); thêm KG link + BR refs §15 (D6); sửa §14 forbidden patterns cho auth + dedup field. |
| 2026-05-07 | v1 | Initial integration contract `gf-erp-agent` -> `gf-shipment` (shipment lifecycle owner: shipment order + stage transitions, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operations forward shipment order create/update events từ external ERP/COP qua durable message bridge per ADR-008; failure mode at-least-once với idempotency theo shipment code, no caller circuit breaker (agent durable). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-11 | v1.1 | Fix §5 Response contracts: cả 2 endpoints trả về `200 OK` empty body (`ResponseEntity.ok().build()`), không phải `ApiResponse<ShipmentOrderDto>` hay "updated shipment" như v1 ghi. KG không cần sửa. |
