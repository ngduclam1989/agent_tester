---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-purchase (provider)"
provider: "gf-purchase"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-purchase` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-purchase` (quotation ask, purchase request/order, supplier, purchase messaging owner).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-purchase`** — Quotation, PR/PO, supplier, purchase messaging owner (theo ADR-001) |
| Provider docs | [Architecture/api/gf-purchase-api.md](../api/gf-purchase-api.md), [Architecture/hld/gf-purchase-HLD.md](../hld/gf-purchase-HLD.md) |
| Used by boundary | `gf-erp-agent`, `gf-inventory`, `gf-sales`, `gf-shipment`, `gf-system` |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | `gf-purchase.url` / `gf-purchase-service.url` / `gf-purchase.api.base-url` (varies per caller) |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (purchase domain) |

### Caller config

| Caller | Client class | Config property |
|---|---|---|
| `gf-erp-agent` | `GfPurchaseClient.java` | `gf-purchase-service.url` (line 96-97) |
| `gf-inventory` | `GfPurchaseClient.java` | `gf-purchase.api.base-url` (line 77-79) |
| `gf-sales` | `PurchaseClient.java` | `gf-purchase.url` |
| `gf-shipment` | `GfPurchaseClient.java` | `gf-purchase.url` |
| `gf-system` | `GfPurchaseClient.java` | `gf-purchase.url` |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-purchase phục vụ:
- gf-erp-agent: forward ERP/COP messages vào purchase domain (quotation, PR/PO updates)
- gf-inventory: validate PO + items trước khi tạo receipt (receipt phải link với valid PO)
- gf-sales: link quotation ask với SO
- gf-shipment: callback PO status update khi shipment delivered

**Why**: gf-purchase là purchase domain master (ADR-001). Cross-domain operations cần PO/QA context phải lookup qua protected APIs.

**Ref**: ADR-001, ADR-008 (worker services — gf-erp-agent integration).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | Query param `tenantId` HOẶC body field |

---

## 4. Endpoints / Operations Used

### 4.1 Quotation operations (gf-erp-agent)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Update quotation ask | PUT | `/protected/v1/quotation-asks` | gf-erp-agent | ERP update QA status |
| 2 | Create quotation bid | POST | `/protected/v1/quotation-bids` | gf-erp-agent | Vendor bid received from ERP |
| 3 | Create pricing proposal | POST | `/protected/v1/pricing-proposals` | gf-erp-agent | Pricing finalized |
| 4 | Create preliminary quotation | POST | `/protected/v1/preliminary-quotation` | gf-erp-agent | Preliminary quote from ERP consultant |

### 4.2 Purchase order operations (gf-erp-agent, gf-shipment)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 5 | Update purchase order | PUT | `/protected/v1/purchase-orders` | gf-erp-agent | ERP update PO |
| 6 | Update PR status | PUT | `/protected/v1/purchase-requests/status` | gf-erp-agent | ERP PR transition |
| 7 | Update PO stage | PUT | `/protected/v1/purchase-orders/stage` | gf-erp-agent | Stage transition |
| 8 | Update PO status (delivered) | PUT | `/protected/v1/purchase-orders/status` | gf-shipment | Shipment delivered → mark PO completed |
| 9 | Get purchase orders | GET | `/protected/v1/purchase-orders` | gf-erp-agent | PO lookup by PR/PO/SO codes |
| 10 | Update PR prepaid | PUT | `/protected/v1/purchase-requests/prepaid` | gf-erp-agent | Prepaid payment update from ERP |
| 11 | Update PR postpaid | PUT | `/protected/v1/purchase-requests/postpaid` | gf-erp-agent | Postpaid payment update from ERP |
| 12 | Receive vendor confirmation | PUT | `/protected/v1/purchase-requests/receive-vendor-confirmation` | gf-erp-agent | Vendor confirm PR from ERP |
| 13 | Update COD delivered | PUT | `/protected/v1/purchase-orders/cod-delivered` | gf-erp-agent | COD PO delivered from ERP |

### 4.3 Inventory integration (gf-inventory)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 14 | Get PO items for receipt validation | GET | `/protected/v1/purchase-orders/{code}/items` | gf-inventory | Validate items trước khi tạo receipt |
| 15 | Get PO by code | GET | `/protected/v1/purchase-orders/code/{code}` | gf-inventory | PO context cho receipt |

### 4.4 Sales integration (gf-sales)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 16 | Get quotation asks by codes | GET | `/protected/v1/quotation-asks` | gf-sales | Link QA với SO khi user tạo QA-driven SO |

### 4.5 System integration (gf-system)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 17 | Check transport route used | GET | `/protected/v1/purchase-orders/transport-routes/{transportRouteId}/used` | gf-system | Pre-check trước khi xóa/update transport route |

---

## 5. Request / Response Contracts

### 5.1 Get PO items for receipt validation (representative)

**Request**:
```
GET /protected/v1/purchase-orders/PO-20260506-00001/items?tenantId=12345
Headers: x-api-key
```

**Response**:
```json
{
  "success": true,
  "data": [
    { "sku": "...", "quantity": 10, "unitPrice": ..., "totalPrice": ... },
    ...
  ]
}
```

(Other ops follow similar shape.)

---

## 6. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-inventory block receipt creation; gf-erp-agent batch retry; gf-shipment retry status update |
| Provider 5xx | Single retry idempotent; outbox retry cho ERP relay |
| 404 (PO not found) | Reject receipt creation với "Invalid PO" |
| 409 (state conflict) | gf-erp-agent handle gracefully (PO already delivered) |

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Reads (GET) | Idempotent |
| Update operations | Idempotent (PUT same payload = no-op) |
| Create QA/pricing | Idempotent theo code dedup |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `<caller>.purchase_client.requests` | `caller`, `op`, `status` |
| `<caller>.purchase_client.duration` | `caller`, `op` |

Log: `correlation_id`, `tenantId`, `caller`, `op`, `poCode`/`qaCode`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 300ms point lookup; < 500ms write operations.

---

## 10. PII / Compliance

PII transmitted: vendor info, supplier details, shipping address. Audit mandatory.

---

## 11. Sandbox vs Production

Env switchover via `GF_PURCHASE_URL` per caller.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfPurchaseClient/PurchaseClient |
| Integration | Real gf-purchase test instance |
| Cross-caller contract | Verify schema giữa controllers và 4 callers |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-purchase down | Receipt creation block; ERP relay backlog; shipment status update fail; alert ops |
| Schema drift | Coordinate với 4 callers; CR Level MAJOR cho breaking change |

---

## 14. Forbidden patterns

- ❌ Callers (gf-erp-agent/gf-inventory/gf-sales/gf-shipment) ghi trực tiếp DB của `gf-purchase` — phải qua protected QA/PO/PR API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip tenant scope — cross-tenant PO leak.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full vendor info / supplier address raw — PII risk.
- ❌ Caller infer QA/PO state machine — phải trust provider response.
- ❌ Skip dedup theo `purchaseRequestCode`/`quotationAskCode` — duplicate flow risk.
- ❌ Bypass version-aware routing (`Garage-App-Version` header) khi mobile app gọi — endpoint v1/v2/v3 differ.
- ❌ Skip retry guard cho 5xx ERP relay — gf-erp-agent có outbox; KHÔNG cần retry tại caller side.

## 15. References

- HLD provider: [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- HLD callers: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-shipment-HLD.md](../hld/gf-shipment-HLD.md), [gf-system-HLD.md](../hld/gf-system-HLD.md)
- API contract: [gf-purchase-api.md](../api/gf-purchase-api.md), [gf-erp-agent-api.md](../api/gf-erp-agent-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-008 (worker services — gf-erp-agent), ADR-004 (Kafka event-driven)
- KG: [gf-purchase.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-purchase.knowledge-graph.yaml) — 153 APIs (55 active + 46 deprecated + 46 internal + 6 unused), 22 BRs
- Related INTEG: [INTEG-EXT-gf-erp-agent.md](INTEG-EXT-gf-erp-agent.md) (bidirectional), [INTEG-EXT-gf-system.md](INTEG-EXT-gf-system.md), [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md), [INTEG-EXT-ac-payment-gateway.md](INTEG-EXT-ac-payment-gateway.md)
- Business Rules: BR-GF-PURCHASE-001 (QA state machine), BR-GF-PURCHASE-005 (PR cancel guard), BR-GF-PURCHASE-012 (PO state machine), BR-GF-PURCHASE-014 (PO DELIVERING event)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Cross-review sync với KG v4: thêm gf-system caller + endpoint #17 transport-route-used (D1); thêm KG link + BR references §15 (D4). Tổng 17 endpoints (16→17). |
| 2026-05-07 | v1 | Initial integration contract `gf-erp-agent` / `gf-inventory` / `gf-sales` / `gf-shipment` -> `gf-purchase` (quotation + PR/PO + supplier + purchase messaging owner per ADR-001, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operations forward ERP/COP messages vào purchase domain (gf-erp-agent), validate PO + items trước khi tạo receipt (gf-inventory), link quotation ask với SO (gf-sales), shipment-PO linkage; failure mode no auto-retry mutation, dedup theo PR/PO code, payment passthrough endpoints (variables, preferences, change method). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-11 | v1.1 | Fix §4 Endpoints vs source code: (1) Xóa phantom POST /quotation-asks — gf-purchase chỉ có PUT+GET, không có POST (nhầm với gf-erp-agent's own endpoint); (2) Xóa GET /product/po-summary — endpoint thuộc gf-inventory InternalProductController, không phải gf-purchase; (3) Thêm 7 gf-erp-agent endpoints thiếu: POST quotation-bids, GET purchase-orders, PUT prepaid/postpaid/receive-vendor-confirmation/cod-delivered, POST preliminary-quotation. Tổng §4 từ 11 → 16 endpoints. Tổ chức lại §4 thành sub-sections theo domain. KG không cần sửa. |
