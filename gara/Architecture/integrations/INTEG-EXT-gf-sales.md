---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 6
tier: T1
owner_authority: Architecture Authority
boundary: "gf-sales (provider)"
provider: "gf-sales"
last_reviewed: "2026-06-03"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-sales` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-sales` (booking + service order + payment handoff state owner).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-sales`** — Booking, service order, settlement handoff, payment state owner (theo ADR-001) |
| Provider docs | [Architecture/api/gf-sales-api.md](../api/gf-sales-api.md), [Architecture/hld/gf-sales-HLD.md](../hld/gf-sales-HLD.md) |
| Used by boundary | `gf-accounting`, `gf-customer`, `gf-inventory`, `gf-worker` |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | `gf-sales.url=${GF_SALES_URL}` |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (sales/SO master) |

### Caller config

| Caller | Client class | Config property |
|---|---|---|
| `gf-accounting` | `GfSalesClient.java` | `gf-sales.api.base-url` |
| `gf-customer` | `GfSalesClient.java` | `gf-sales.url` |
| `gf-inventory` | `GfSalesClient.java` | `gf-sales.api.base-url` (line 81-83 application.yml) |
| `gf-worker` | cron trigger | `gf-sales.url` |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-sales phục vụ:
- gf-accounting: lookup SO detail cho settlement creation, settle/reopen SO khi accounting flow finalized
- gf-customer: get vehicle service order summaries for customer 360 view
- gf-inventory: validate SO trước khi tạo delivery (delivery phải link với valid SO)
- gf-worker: trigger booking auto-cancel scheduler (cron every 1 minute)

**Why**: gf-sales là SO/booking master (ADR-001). Cross-domain operations cần SO context phải lookup qua protected APIs.

**Ref**: ADR-001 (microservice landscape).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | PathVariable `{tenantId}` HOẶC `X-Tenant-Id` header |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Get SO by code | GET | `/protected/v1/service-orders/{tenantId}/detail/{code}` | gf-inventory | Validate SO trước khi tạo delivery |
| 2 | Get vehicle SO summaries | POST | `/protected/v1/service-orders/{tenantId}/vehicle-summaries` | gf-customer | Customer 360 view (vehicle history per customer) |
| 3 | Get SO for settlement | GET | `/protected/v1/service-orders/{tenantId}/{id}/for-settlement` | gf-accounting | Fetch SO context khi tạo settlement. **(DESIGN — Insurance Settlement, ADR-014)**: response bổ sung additive 8 flat adjustment fields + 8 flat breakdown fields + `insurancePayableAmount` để gf-accounting snapshot Phiếu QT BH (CB-INS-002). Thông tin CTBH từ `insuranceCompany` baseline — **KHÔNG** thêm `insuranceCode`. Amount tính ở gf-sales — gf-accounting KHÔNG tự tính (BR-GF-ACCOUNTING-006). |
| 4 | Settle SO | PUT | `/protected/v1/service-orders/{tenantId}/{code}/settle` | gf-accounting | Settlement finalized → mark SO settled |
| 5 | Reopen SO from settled | PUT | `/protected/v1/service-orders/{tenantId}/{code}/reopen-from-settled` | gf-accounting | Cancel settlement → reopen SO |
| 6 | Get SO for printing | GET | `/protected/v1/service-orders/{tenantId}/{code}/for-print` | gf-accounting | Export SO PDF/HTML cho settlement print |
| 7 | Trigger booking auto-cancel | POST | `/protected/v1/bookings/auto-cancel` | gf-worker | Cron every 1 minute — cancel overdue bookings |

---

## 5. Request / Response Contracts

### 5.1 Get SO detail (representative)

**Request**:
```
GET /protected/v1/service-orders/12345/detail/SO-20260506-00001
Headers: x-api-key
```

**Response**: `200 OK` `ApiResponse<ServiceOrderDetailResponse>` với customer, vehicle, items, totals.

### 5.2 Settle SO

**Request**:
```
PUT /protected/v1/service-orders/12345/SO-20260506-00001/settle
Headers: x-api-key
Body: SettleServiceOrderDto
{
  "settlementCode": "SET-20260506-00001",
  "settledAmount": 5000000,
  ...
}
```

**Response**: `200 OK` với updated SO.

(Other ops follow similar shape.)

---

## 6. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-accounting block settlement creation until recovery; gf-inventory delivery creation block |
| Provider 5xx | Single retry idempotent reads; surface for writes |
| 404 (SO not found) | Treat as user error — surface "Invalid SO code" |
| 409 (SO already settled) | gf-accounting handle gracefully — return existing settlement |

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Reads (GET) | Idempotent |
| Settle SO | Idempotent — same settlementCode = no-op (gf-sales dedup) |
| Reopen SO | Idempotent — depend on current state |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `<caller>.sales_client.requests` | `caller`, `op`, `status` |
| `<caller>.sales_client.duration` | `caller`, `op` |

Log: `correlation_id`, `tenantId`, `caller`, `op`, `soCode`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 300ms cho point lookup; < 800ms cho batch find-by-codes (50 items).

---

## 10. PII / Compliance

PII via SO detail: customer name, phone, vehicle plate. Audit mandatory.

---

## 11. Sandbox vs Production

Env switchover via `GF_SALES_URL`.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfSalesClient |
| Integration | Real gf-sales test instance |
| Cross-caller contract | Verify schema giữa controllers và 3 callers |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-sales down | Settlement creation block; delivery creation block; alert ops |
| Schema drift | Coordinate với 3 callers; CR Level MAJOR cho field rename |

---

## 14. Forbidden patterns

- ❌ Callers (gf-accounting/gf-customer/gf-inventory) ghi trực tiếp DB của `gf-sales` — phải qua protected SO/booking API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip tenant scope (`{tenantId}` PathVariable / `X-Tenant-Id` header) — cross-tenant SO/booking leak.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full SO body chứa customer PII (phone, plate, name) raw.
- ❌ Skip dedup theo `settlementCode` khi settle SO — duplicate settlement risk.
- ❌ Caller infer SO state machine — phải trust provider response (only gf-sales own SO state).
- ❌ Bypass tenant validation khi access SO by code — code có thể guessable.

## 15. References

- HLD provider: [gf-sales-HLD.md](../hld/gf-sales-HLD.md)
- HLD callers: [gf-accounting-HLD.md](../hld/gf-accounting-HLD.md), [gf-customer-HLD.md](../hld/gf-customer-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md)
- API contract: [gf-sales-api.md](../api/gf-sales-api.md), [gf-accounting-api.md](../api/gf-accounting-api.md), [gf-customer-api.md](../api/gf-customer-api.md), [gf-inventory-api.md](../api/gf-inventory-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — SO master ownership), ADR-005 (Temporal — booking workflows)
- KG: [gf-sales.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml) — 80 APIs (56 active + 20 internal + 4 unused), 19 BRs
- Related INTEG: [INTEG-EXT-gf-customer.md](INTEG-EXT-gf-customer.md), [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md), [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md), [INTEG-EXT-gf-erp-mdm.md](INTEG-EXT-gf-erp-mdm.md) (gf-sales also caller của các services này — bidirectional dependencies)
- **(DESIGN — Insurance Settlement)**: [INTEG-EXT-gf-accounting.md](INTEG-EXT-gf-accounting.md) — chiều ngược: gf-sales **caller** của gf-accounting cho widget công nợ BH (`/protected/v1/insurance-debt-summary`, CB-INS-008). Bidirectional với gf-accounting.
- Business Rules: BR-GF-SALES-001 (booking state machine), BR-GF-SALES-015 (SO payment status), BR-GF-SALES-016 (walk-in auto-booking)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-06-03 | v6 | **Flatten nested JSON → flat scalar fields**: §4 op #3 `for-settlement` response — thay `insuranceAdjustments`/`breakdownByPayer` nested bằng 8 flat adjustment fields + 8 flat breakdown fields. |
| 2026-06-02 | v5 | **Bỏ `insuranceCode`** khỏi `for-settlement` response (§4 op #3): `insuranceCompany` baseline đã lưu mã CTBH. ADR-014 v5. |
| 2026-06-01 | v4 | **Đổi `for-settlement` response field `insuranceCompanyId` (id) → `insuranceCode` (code, `mdm_catalog.code`, `directory='INSURANCE'`)** — khớp convention baseline code-based (ADR-014 v4). |
| 2026-05-30 | v3 | **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014)**: extend op #3 `for-settlement` response — additive `insuranceAdjustments`/`breakdownByPayer`/`insurancePayableAmount`/`insuranceCompanyId` (snapshot Phiếu QT BH, CB-INS-002). Thêm §15 cross-link [INTEG-EXT-gf-accounting.md] (chiều ngược: gf-sales caller debt-summary). Additive backward-compat. |
| 2026-05-19 | v2 | Cross-review sync với KG v4: thêm gf-worker caller + endpoint #7 booking auto-cancel (D1); thêm KG link + BR references §15 (D4). Tổng 7 endpoints (6→7). |
| 2026-05-07 | v1 | Initial integration contract `gf-accounting` / `gf-customer` / `gf-inventory` -> `gf-sales` (booking + service order + settlement handoff + payment state owner per ADR-001, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operations SO detail lookup + settle/reopen SO (gf-accounting settlement flow), vehicle service-order summary cho customer 360 (gf-customer), validate SO trước khi tạo delivery (gf-inventory), find-by-codes batch endpoint cho settlement composition; failure mode no auto-retry mutation, idempotency theo SO code, settle/reopen state transitions phải atomic. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-11 | v1.1 | Fix §4 Endpoints: Xóa #7 POST /api/v3/service-orders/find-by-codes — endpoint public (không phải protected), gf-accounting GfSalesClient không có method nay (grep 0 results), có thể gọi qua BFF cho accounting UI nhưng không phải BE-to-BE. Xóa forbidden pattern "Treat find-by-codes batch result as complete". KG không cần sửa. |
