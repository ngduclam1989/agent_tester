---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-purchase"
provider: "gf-system"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — `gf-purchase` ↔ `gf-system` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE giữa `gf-purchase` và `gf-system` cho tenant invoice info lookup.
> Tham khảo INTEG-EXT pattern (per SA review feedback) — BE Garage-internal được treat như external từ góc nhìn caller.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-system`** — Garage system metadata service (tenant subscription cache, default branch, tenant invoice info) |
| Provider docs | [Architecture/api/gf-system-api.md](../api/gf-system-api.md) (TBD nếu chưa có), [Architecture/hld/gf-system-HLD.md](../hld/gf-system-HLD.md) |
| Used by boundary | `gf-purchase` |
| Module / class | `gf-purchase/src/main/java/com/actechx/gf/adapter/client/SystemClient.java` |
| Sandbox URL | `gf-system.url=${GF_SYSTEM_URL}` trong gf-purchase application.yml line 96 |
| Production URL | Env runtime: `GF_SYSTEM_URL` |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface (`@HttpExchange`) qua `HttpClientConfig` của gf-purchase |
| Category | Internal Garage service (system metadata) |

---

## 2. Why this provider (decision)

**Decision**: gf-purchase gọi gf-system để lookup tenant invoice info (tax code, company name, address) cho việc generate purchase order/invoice.

**Why**:
- Tenant invoice info là master data thuộc `gf-system` (subscription cache + tenant operational projection theo ADR-003).
- gf-purchase không own tenant master state; phải lookup qua protected API thay vì duplicate cache.

**Alternatives considered**: Cache local trong gf-purchase (rejected — drift với gf-system source of truth); pull qua Kafka tenant-provisioning event (over-engineering cho read use case).

**Ref**: ADR-001 (microservice landscape), ADR-003 (tenant + SSO boundary).

---

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (internal service authentication) |
| Credential rotation | Manual rotate `INTERNAL_API_KEY` env across services |
| Storage | Env var `INTERNAL_API_KEY` (gf-purchase và gf-system phải có cùng key) |
| Scope / permission | Read/Write tenant invoice info — chỉ gf-purchase được expect call |
| Multi-tenant strategy | 1 credential cho all tenants; tenant scoping qua `X-Tenant-Id` header |
| Tenant resolution | `X-Tenant-Id` header bắt buộc trên mọi request |

### 3.2 Webhook security

N/A — gf-system không gửi webhook về gf-purchase.

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Get tenant invoice info | GET | `/protected/v1/tenant-invoice-info` | Lookup company name, tax code, address cho invoice trên PO | Khi user mở quotation ask detail / preview PO invoice |
| 2 | Upsert tenant invoice info | PUT | `/protected/v1/tenant-invoice-info` | Update company info từ gf-purchase (rare — typically gf-system tự manage) | Admin update profile (use case TBD) |

---

## 5. Request / Response Contracts

### 5.1 Get tenant invoice info

**Request**:
```
GET /protected/v1/tenant-invoice-info
Headers:
  x-api-key: ${INTERNAL_API_KEY}
  X-Tenant-Id: 12345
```

**Response (success)**:
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "tenantId": 12345,
    "invoiceInfo": {
      "companyName": "Garage ABC LTD",
      "taxCode": "0123456789",
      "companyEmailAddress": "info@garageabc.vn",
      "companyAddress": "123 Đường ABC, Quận 1, TP.HCM"
    },
    "version": 1,
    "updatedAt": "2026-05-07T10:00:00Z"
  }
}
```

**Response (error)**:
```json
{
  "success": false,
  "message": "Tenant invoice info not found",
  "data": null
}
```

**Mapping → internal model**: gf-purchase wrap response thành `TenantInvoiceInfoDto` (companyName, taxCode, address) cho PO invoice generation.

### 5.2 Upsert tenant invoice info

**Request**:
```
PUT /protected/v1/tenant-invoice-info
Headers:
  x-api-key, X-Tenant-Id
Body:
  { "companyName": "...", "taxCode": "...", "companyEmailAddress": "...", "companyAddress": "...", "updatedBy": "system" }
```

**Response**: `200 OK` với `TenantInvoiceInfoResponse` (same shape as GET response).

---

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | No response 30s | `ResourceAccessException` | Surface error to caller; PO invoice fallback "Tenant info unavailable" |
| Provider 5xx | HTTP 500 | Status code | Single retry với backoff; surface error if persistent |
| Provider 4xx (404) | Tenant invoice không tồn tại | Status code | Return null entity; PO invoice generation skip company info |
| Provider 4xx (401/403) | Wrong api-key | Status code | Alert ops; rotate key |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | Không có retry mặc định — single attempt |
| Backoff | N/A |
| Idempotency key | GET idempotent by nature; PUT idempotent (same payload = same result) |
| After max retries | Surface error; log; user retry manual |

### 6.3 Circuit breaker

Không có circuit breaker — cần hardening (P2).

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency | GET idempotent; PUT idempotent (PATCH-like upsert với version) |
| Server-side dedup | Optimistic lock qua `version` field |
| Order guarantees | N/A (read-mostly) |
| Replay safety | Safe — no side effect bên gf-system khi GET retry |

---

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags |
|---|---|---|
| `gf_purchase.system_client.requests` | counter | `op`, `status` |
| `gf_purchase.system_client.duration` | histogram | `op` |
| `gf_purchase.system_client.errors` | counter | `op`, `error_code` |

### 8.2 Logging

- Mỗi request log: `correlation_id`, `tenantId`, `op`, `latency_ms`, `status`
- Error log: full response (PII safe — tax code có thể PII tùy region)

### 8.3 Tracing

Span name: `http GET /protected/v1/tenant-invoice-info`. OpenTelemetry trace context forward qua `traceparent`.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Error rate | > 5% over 5 min | P3 | gf-purchase owner |
| Latency p99 | > 500ms | P3 | gf-purchase owner |

---

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Internal — co-located cluster, expected 99.9% |
| Our SLA exposed | Lower — fail mode "Tenant info unavailable" trên invoice UI |
| Rate limits | Không có quota; cần review nếu volume tăng |
| Cost | N/A — internal Garage |

---

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Yes — companyName, taxCode, address (tenant business info) |
| Data residency | Same VPC, internal Garage cluster |
| Regulatory | Tax code có thể fall under tax regulation; tenant business info cần audit trail |
| DPA | N/A — internal |

---

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `${GF_SYSTEM_URL}` localhost dev | `${GF_SYSTEM_URL}` prod cluster |
| Credentials | `INTERNAL_API_KEY` (dev value) | `INTERNAL_API_KEY` (prod value, rotated) |
| Switchover | Env config |

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock SystemClient; assert request shape + response handling |
| Integration | Real gf-system test instance; assert protected endpoint contract |
| Contract test | Cần thêm — verify schema khớp giữa gf-system controller và gf-purchase client |
| Chaos | Inject 500/timeout; verify graceful degrade |

---

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| gf-system down | gf-purchase PO invoice generation degraded; UI fallback "Tenant info unavailable"; alert ops |
| api-key rotated | Update `INTERNAL_API_KEY` env trên gf-purchase + gf-system simultaneously |
| Tenant invoice info missing for new tenant | Verify tenant provisioning workflow (gf-system tenant subscription cache) |

---

## 14. Forbidden patterns

Anti-patterns mà integration KHÔNG được phép. Vi phạm = MAJOR CR.

- ❌ `gf-purchase` ghi trực tiếp DB của `gf-system` — phải qua protected API `/protected/v1/...` (ADR-006).
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip `X-Tenant-Id` header — tenant scope mandatory; cross-tenant leak risk.
- ❌ Hardcode `INTERNAL_API_KEY` trong source — env vars only.
- ❌ Log full `INTERNAL_API_KEY` / tax code / company info raw.
- ❌ Retry permanent 4xx (400, 401, 403, 404) — only retry 5xx/timeout.
- ❌ Caller infer tenant invoice fields từ JWT — phải lấy từ `gf-system` contract response.
- ❌ Bypass version optimistic lock khi PUT update (phải send current version).

## 15. References

- HLD provider: [gf-system-HLD.md](../hld/gf-system-HLD.md)
- HLD caller: [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md)
- API contract: [gf-system-api.md](../api/gf-system-api.md), [gf-purchase-api.md](../api/gf-purchase-api.md
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-003 (tenant + SSO boundary), ADR-006 (Flyway per-service data ownership)
- KG: [gf-system.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-system.knowledge-graph.yaml) — 6 APIs (4 public + 2 internal), 15 BRs
- Related INTEG: [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md) (bidirectional — gf-system gọi gf-purchase qua PurchaseInternalClient.isTransportRouteUsed)
- Business Rules: BR-GF-SYSTEM-007 (tenant invoice info upsert fill-missing-only), BR-GF-SYSTEM-015 (transport route usage check trước khi delete transporter)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Cross-review sync với KG v4: thêm KG link + BR references §15 (D4); thêm INTEG-EXT-gf-purchase.md reference bidirectional (D3). |
| 2026-05-07 | v1 | Initial integration contract `gf-purchase` -> `gf-system` (Garage system metadata: tenant subscription cache + default branch + tenant invoice info per ADR-003, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface (`@HttpExchange`) với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operation lookup tenant invoice info (tax code, company name, address) cho generate purchase order/invoice; failure mode no auto-retry, không cache local trong gf-purchase tránh drift với SoT. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-11 | v1.1 | Fix §5 Request/Response schemas: (1) GET response sửa từ flat structure → nested `invoiceInfo` wrapper, thêm `companyEmailAddress` + `updatedAt` fields; (2) PUT request thêm `companyEmailAddress` + `updatedBy` fields; (3) PUT response ghi rõ trả về TenantInvoiceInfoResponse. Endpoints 100% correct — không thay đổi §4. KG không cần sửa. |
