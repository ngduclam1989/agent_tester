---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "gf-inventory"
provider: "google-custom-search"
last_reviewed: "2026-05-07"
supersedes: "none"
---

# Integration — `gf-inventory` ↔ Google Custom Search API (External 3rd-party)

> Document tích hợp giữa `gf-inventory` và Google Custom Search API cho spare part image search.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **Google Custom Search API** — image/web search engine với customizable scope (CX) |
| Provider docs | https://developers.google.com/custom-search/v1/overview |
| Provider status page | https://status.cloud.google.com/ |
| Used by boundary | `gf-inventory` |
| Module / class | `gf-inventory/src/main/java/com/actechx/gf/adapter/client/GoogleApiClient.java` |
| Sandbox URL | N/A (Google không có sandbox riêng — chỉ có quota dev/prod via API key) |
| Production URL | `https://www.googleapis.com/customsearch/v1` (default) |
| API version pinned | v1 |
| SDK / library | Spring HttpExchange interface (`@HttpExchange`, `@GetExchange`) |
| Category | External 3rd-party (search/AI) |

### Caller config

```yaml
google:
  url: https://www.googleapis.com/customsearch/v1
  prompt: "[brand] [model] [year] \"[query]\""
```

API keys + CX (Custom Search Engine ID): managed via DB-backed `ApiKeyService` (multiple keys cho rate limit fallback).

---

## 2. Why this provider (decision)

**Decision**: gf-inventory dùng Google Custom Search để tìm hình ảnh spare part theo brand + model + year + part name.

**Why**:
- Auto-populate product images cho catalog → giảm manual upload effort.
- Google Custom Search có quota free tier hợp lý + flexible CX scope (limit search to specific automotive sites).

**Alternatives considered**:
- Bing Image Search (rejected: lower quota free tier)
- Manual upload only (rejected: too slow cho catalog onboarding)
- Image scraping (rejected: legal/ToS risk)

**Ref**: ADR-001 (microservice landscape).

---

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | API key + CX (Custom Search Engine ID) — both qua **query parameters** (Google design) |
| Credential rotation | Multiple keys managed via DB `ApiKeyService`; auto-fallback khi 1 key hit rate limit |
| Storage | Database (`ApiKeyService`); env vars cho default key |
| Scope / permission | Read-only image search trong CX scope |
| Multi-tenant | 1 set keys cho Garage globally — không tenant-scoped |

### 3.2 Webhook security

N/A — Google không gửi webhook về Garage.

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Custom search | GET | `/customsearch/v1?key=<key>&cx=<cx>&q=<query>` | Image search cho spare part catalog | `MdmPartService.getGoogleImageSearch()` khi catalog onboarding hoặc user request image |

---

## 5. Request / Response Contracts

### 5.1 Custom search

**Request**:
```
GET https://www.googleapis.com/customsearch/v1?key=AIza...&cx=01234...&q=Toyota+Camry+2020+oil+filter
Headers:
  Accept: application/json
  User-Agent: Mozilla/5.0 (compatible; Google-API-Test/1.0)
```

**Response (success)**:
```json
{
  "kind": "customsearch#search",
  "items": [
    {
      "title": "...",
      "link": "https://...",
      "pagemap": {
        "cse_thumbnail": [
          { "src": "https://encrypted-tbn0.gstatic.com/images?...", "width": "300", "height": "200" }
        ]
      }
    }
    // ...
  ],
  "queries": {...},
  "searchInformation": {...}
}
```

**Response (error — quota)**:
```json
{
  "error": {
    "code": 429,
    "message": "Quota exceeded for quota metric 'Queries' and limit 'Queries per day'",
    "errors": [...]
  }
}
```

**Mapping → internal**: gf-inventory parse `items[].pagemap.cse_thumbnail[].src` → return top 2 image URLs trong `GoogleImageSearchResponse`.

---

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect | Action |
|---|---|---|---|
| Network timeout | No response | Apache HC5 timeout | Skip image search; catalog hiển thị placeholder |
| HTTP 429 (rate limit) | Status code 429 | Status check | `RateLimiterService` mark key blocked TTL; fallback alternate API key |
| HTTP 403 (key invalid) | Status code 403 | Status check | Alert ops; key rotation needed |
| HTTP 5xx | Status code | Status check | Single retry; skip nếu fail |
| Empty results | `items` empty array | Body inspection | Catalog hiển thị placeholder; user manual upload |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | 3 attempts với different API keys (key rotation) |
| Backoff | N/A — immediate fallback to next key |
| Idempotency | Read-only — safe to retry |
| After max retries | Skip search; placeholder image; log warning |

### 6.3 Circuit breaker

`RateLimiterService` per-key blocked TTL (vd 24h cho daily quota exhaustion).

---

## 7. Idempotency & Ordering

GET idempotent. No side effect on Google side (read-only search).

---

## 8. Observability

### 8.1 Metrics

| Metric | Tags |
|---|---|
| `gf_inventory.google_search.requests` | `status`, `apiKey` (anonymized) |
| `gf_inventory.google_search.duration` | (none) |
| `gf_inventory.google_search.rate_limited` | `apiKey` (count of 429 responses) |
| `gf_inventory.google_search.empty_results` | (count of empty searches) |

### 8.2 Logging

- Log query (PII safe — only product names), result count, duration
- Log rate-limit events; track key health
- Không log API key raw

### 8.3 Tracing

Span: `http GET /customsearch/v1`. Anonymize key in span attribute.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| All API keys rate-limited | any | P2 | Inventory team |
| Error rate > 10% | over 5 min | P3 | Inventory team |

---

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Google Cloud — 99.9% (commercial tier) |
| Our SLA exposed | Image search là feature optional — không block catalog onboarding |
| Rate limits | Free tier: 100 queries/day per API key; paid: $5/1000 queries |
| Quota strategy | Multiple API keys + DB rotation; budget alarm khi hit 80% daily |
| Cost owner | Inventory product team |

---

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | None — chỉ search query (product name + brand/model) |
| Data residency | Google Cloud — global; query subject to Google ToS |
| Regulatory | None applicable cho product image search |
| DPA | Google standard ToS |

---

## 11. Sandbox vs Production

Google không có sandbox. Phân biệt qua:
- Dev: low-quota API keys
- Prod: paid tier API keys + budget alarm

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GoogleApiClient với fixture JSON |
| Integration | Real Google API với dev key (limit calls cho test) |
| Chaos | Inject 429/timeout; verify key rotation logic |

---

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| All API keys rate-limited | Disable feature flag; alert inventory team; add new keys |
| Daily quota exhausted | Wait until next day OR switch to paid tier |
| Provider 5xx burst | Wait + retry; check Google Cloud status page |
| Key leaked | Revoke key trong Google Console; remove from DB; provision new |

---

## 14. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-07 | v1 | Initial integration contract `gf-inventory` -> Google Custom Search API (external 3rd-party search/AI): REST/HTTPS+JSON `https://www.googleapis.com/customsearch/v1` (v1 pinned) qua Spring HttpExchange interface (`@HttpExchange`, `@GetExchange`); auth API key + CX (Custom Search Engine ID) managed via DB-backed `ApiKeyService` với multiple keys cho rate limit fallback; key operation image search spare part theo brand + model + year + part name; failure mode rotate API key on quota exceeded, fallback to next key, no Google sandbox riêng (chỉ dev/prod quota qua API key), TTL cache để giảm cost. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Observability, SLA/Quotas/Cost, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
