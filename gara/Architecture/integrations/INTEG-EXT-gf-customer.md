---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-customer (provider)"
provider: "gf-customer"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — Garage services ↔ `gf-customer` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-customer` (customer profile + vehicle + segment + interaction owner).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-customer`** — Customer profile, vehicle, segment, interaction owner (theo ADR-001) |
| Provider docs | [Architecture/api/gf-customer-api.md](../api/gf-customer-api.md), [Architecture/hld/gf-customer-HLD.md](../hld/gf-customer-HLD.md) |
| Used by boundary | `gf-marketing`, `gf-sales` |
| Module / class | `gf-marketing/.../GfCustomerClient.java`, `gf-marketing/.../CustomerClient.java`, `gf-sales/src/main/java/com/actechx/gf/adapter/client/GfCustomerClient.java` |
| Sandbox URL | Per caller: `gf-customer.url=${GF_CUSTOMER_URL}` |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (customer master) |

### Caller config

| Caller | Client class | Config property | Source |
|---|---|---|---|
| `gf-sales` | `GfCustomerClient.java` | `gf-customer.url` | `gf-sales/src/main/java/com/actechx/gf/adapter/client/GfCustomerClient.java` |
| `gf-marketing` | `GfCustomerClient.java`, `CustomerClient.java` | `gf-customer.url` | `gf-marketing/src/main/java/com/actechx/gf/marketing/infrastructure/client/rest/GfCustomerClient.java` |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-customer cung cấp customer profile, segment criteria evaluation, vehicle upsert cho:
- gf-sales: tạo/update customer + vehicle khi tạo SO/booking
- gf-marketing: query customer theo segment cho campaign/voucher distribution

**Why**: gf-customer là customer master của Garage (ADR-001). Mọi service khác lookup/update qua protected APIs.

**Ref**: ADR-001, ADR-009 (JPA no relationships — cross-service via API only).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | `X-Tenant-Id` header HOẶC query param `tenantId` (depends on endpoint) |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Create customer | POST | `/protected/v1/customers` | gf-sales, gf-marketing | New customer khi tạo SO; bulk import từ campaign |
| 2 | Update customer | PUT | `/protected/v1/customers/{id}` | gf-sales | Edit customer trong SO flow |
| 3 | Upsert vehicle from SO | POST | `/protected/v1/customers/vehicles/upsert` | gf-sales | Create/update vehicle khi tạo SO |
| 4 | Increment booking count | PUT | `/protected/v1/customers/by-code/{customerCode}/booking-count/increment` | gf-sales | Booking confirmed |
| 5 | Record customer visit | PUT | `/protected/v1/customers/by-code/{customerCode}/visit` | gf-sales | SO completion |
| 6 | Update total spent | PUT | `/protected/v1/customers/by-code/{customerCode}/spent` | gf-sales | Settlement completed |
| 7 | Create customer interaction | POST | `/protected/v1/customers/{customerId}/interactions` | gf-sales, gf-marketing | Log interaction (call, message) |
| 8 | Get customer by phone | GET | `/protected/v1/customers/by-phone/{phone}` | gf-marketing, gf-sales | Customer lookup từ phone (booking/CRM) |
| 9 | Get customer by ID | GET | `/protected/v1/customers/{customerId}` | gf-marketing | Campaign target enrichment |
| 10 | Batch get customers | POST | `/protected/v1/customers/batch` | gf-marketing | Bulk enrich segment customers |
| 11 | Get customer IDs by segment | GET | `/protected/v1/customers/{segmentId}/customer-ids` | gf-marketing | Segment evaluation (paginated) |
| 12 | Get customers with birthday | GET | `/protected/v1/customers/birthday` | gf-marketing | Birthday campaign trigger |
| 13 | Get inactive customers | GET | `/protected/v1/customers/inactive` | gf-marketing | Inactive customer reactivation campaign |
| 14 | Get birthday customers by segment | GET | `/protected/v1/customers/birthday/segment/{segmentId}` | gf-marketing | Birthday + segment filter campaign |
| 15 | Get maintenance-due customers | GET | `/protected/v1/customers/maintenance-due` | gf-marketing | Maintenance due campaign targeting |
| 16 | Get maintenance-due by segment | GET | `/protected/v1/customers/maintenance-due/segment/{segmentId}` | gf-marketing | Maintenance due + segment filter |
| 17 | Get inactive customers by segment | GET | `/protected/v1/customers/inactive/segment/{segmentId}` | gf-marketing | Inactive + segment filter |
| 18 | Get customer segment IDs | GET | `/protected/v1/customers/{customerId}/segments` | gf-marketing | Segment IDs customer belongs to |
| 19 | Get customer count by segment | GET | `/protected/v1/customers/segment/{segmentId}/count` | gf-marketing | Segment customer count |
| 20 | Get segment by ID | GET | `/protected/v1/segments/{id}` | gf-marketing | Segment metadata lookup (campaign builder) |

**Unused endpoints** (per KG RULE-08 audit 2026-05-14):
- `PUT /protected/v1/customers/by-code/{customerCode}/booking-count/decrement` — no caller
- `GET /protected/v1/customers/birthdays-today` — no caller (replaced by #12 birthday)
- `POST /protected/v1/customers/search` — no caller

---

## 5. Request / Response Contracts

### 5.1 Create customer (representative)

**Request**:
```
POST /protected/v1/customers
Headers: x-api-key, X-Tenant-Id (or tenantId in body)
Body:
{
  "tenantId": 12345,
  "phone": "0901234567",
  "name": "Nguyen Van A",
  "vehicles": [...],
  "tags": [...]
}
```

**Response**: `200 OK` `ApiResponse<CustomerDetailResponse>`.

### 5.2 Get customer IDs by segment (paginated)

**Request**:
```
GET /protected/v1/customers/{segmentId}/customer-ids?tenantId=12345&page=0&size=20
Headers: x-api-key
```

**Response**: `ApiResponse<Page<Long>>` — danh sách customer IDs thuộc segment.

(Other 11 operations follow similar shape.)

---

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Action |
|---|---|
| Network timeout | Caller-specific: gf-sales surface error, block SO creation; gf-marketing skip enrichment |
| Provider 5xx | Same as timeout; gf-sales single retry idempotent reads |
| Provider 4xx (validation) | Surface error to user (vd phone format invalid) |
| 404 | Treat as new customer trong upsert flow; surface error trong read flow |

### 6.2 Retry policy

| Caller | Retry | Reason |
|---|---|---|
| gf-sales | Single retry idempotent reads (GET, search) | SO creation cần customer info — critical |
| gf-marketing | Best-effort, skip nếu fail | Campaign batch tolerate partial failures |

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Create customer | Idempotent theo phone (gf-customer dedup) |
| Update operations | Idempotent (PUT same payload = no-op) |
| Upsert vehicle | Idempotent theo plate + customerId |
| Booking count increment | NOT idempotent — caller phải dedup ở event consumer level |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `<caller>.customer_client.requests` | `caller`, `op`, `status` |
| `<caller>.customer_client.duration` | `caller`, `op` |
| `<caller>.customer_client.errors` | `caller`, `op`, `error_code` |

Log per request: `correlation_id`, `tenantId`, `caller`, `op`, `customerId`/`phone`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 300ms cho point lookup; < 800ms cho segment criteria batch.

---

## 10. PII / Compliance / Data Residency

PII transmitted: phone, name, address, email, vehicle plate. Audit log mandatory. PII masking trong log per ADR-003.

---

## 11. Sandbox vs Production

Env switchover via `GF_CUSTOMER_URL` per caller.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfCustomerClient |
| Integration | Real gf-customer test instance |
| Cross-caller contract | Verify schema giữa controllers và clients (gf-sales, gf-marketing) |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-customer down | gf-sales SO creation block (customer required); gf-marketing campaign batch backlog; alert ops |
| Schema drift across callers | Coordinate updates; CR Level MAJOR cho field rename |

---

## 14. Forbidden patterns

- ❌ Caller (gf-marketing/gf-sales) ghi trực tiếp DB của `gf-customer` — phải qua protected API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip `X-Tenant-Id` header / `tenantId` query param — cross-tenant customer leak risk (PII).
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Log full customer phone/name/email/plate raw — sanitize (mask last 4 digits phone).
- ❌ Cache `customer-by-phone` lookup quá lâu — customer profile changes; TTL ≤ 5 min.
- ❌ Bypass segment criteria filter khi search — risk match wrong customers.
- ❌ Skip idempotency theo phone khi create customer — duplicate customer record risk.
- ❌ Treat `bookingCount` increment / `visit` / `spent` update là idempotent — KHÔNG idempotent; caller phải dedup ở event consumer.

## 15. References

- HLD provider: [gf-customer-HLD.md](../hld/gf-customer-HLD.md)
- HLD callers: [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-marketing-HLD.md](../hld/gf-marketing-HLD.md)
- API contract: [gf-customer-api.md](../api/gf-customer-api.md), [gf-sales-api.md](../api/gf-sales-api.md), [gf-marketing-api.md](../api/gf-marketing-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — customer master ownership), ADR-009 (JPA no relationships — cross-service via API only)
- Related INTEG: [INTEG-EXT-gf-marketing.md](INTEG-EXT-gf-marketing.md), [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md), [INTEG-EXT-gf-erp-mdm.md](INTEG-EXT-gf-erp-mdm.md) (gf-customer cũng là caller của gf-erp-mdm cho address enrichment)
- KG: [gf-customer.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-customer.knowledge-graph.yaml) — 53 total APIs (25 public + 20 internal-only + 8 unused)
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG (RULE-08 audit): (H1) thêm 7 active gf-marketing campaign targeting endpoints (birthday-by-segment, maintenance-due ± segment, inactive-by-segment, customer segments/count, segment-get); (M1) thêm 3 unused endpoints note; endpoint count 13→20 (17 active + 3 unused); thêm KG reference. |
| 2026-05-07 | v1 | Initial integration contract `gf-marketing` / `gf-sales` -> `gf-customer` (customer master, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id` header; key operations customer profile/vehicle upsert (gf-sales tạo SO/booking) và segment criteria query (gf-marketing campaign/voucher distribution); failure mode no auto-retry, idempotency theo phone bắt buộc khi create customer, bookingCount/visit/spent update KHÔNG idempotent (consumer dedup). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
