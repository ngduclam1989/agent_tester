---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "{{boundary}}"
provider: "{{provider}}"
last_reviewed: "2026-05-02"
supersedes: "none"
---

# Integration — {{boundary}} ↔ {{provider}} (External Service)

> Document tích hợp giữa **{{boundary}}** (backend service nội bộ) và **{{provider}}** (3rd-party).
> Không document chi tiết feature business — chỉ document **contract, security, failure handling, observability**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **{{provider}}** ({{Provider description}}) |
| Provider docs | {{URL to official docs}} |
| Provider status page | {{URL}} |
| Used by boundary | `{{boundary}}` |
| Module / class | `{{module/class implementing client}}` |
| Sandbox URL | `{{sandbox base URL}}` |
| Production URL | `{{production base URL}}` |
| API version pinned | `{{e.g., 2024-06-20}}` |
| SDK / library | `{{SDK name + version}}` |
| Category | {{Payment / Comms / Email / Auth / Storage / Maps / Analytics / Other}} |

## 2. Why this provider (decision)

**Decision**: {{Mô tả quyết định chọn provider}}

**Why**: {{Lý do — feature coverage, cost, geography, compliance, prior contract, …}}

**Alternatives considered**: {{List alternatives + lý do reject}}

**Ref**: ADR-{{NNN}}, Tracking/CHANGE-REQUESTS.md#CR-{{ID}}

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | {{API key / OAuth2 / mTLS / JWT / HMAC signature / …}} |
| Credential rotation | {{Frequency + process}} |
| Storage | {{KMS / Vault / env var name}} |
| Scope / permission | {{Least-privilege scope this integration needs}} |
| Multi-tenant strategy | {{1 credential cho all tenants / 1 credential per tenant / …}} |

### 3.2 Webhook security (nếu provider gửi webhook về)

| Thuộc tính | Giá trị |
|---|---|
| Webhook URL | `{{your_endpoint}}` |
| Signature header | `{{e.g., Stripe-Signature, X-Hub-Signature-256}}` |
| Signature algorithm | {{HMAC-SHA256 / Ed25519 / …}} |
| Replay protection | {{Timestamp tolerance, nonce store, …}} |
| Verification code path | `{{file:line where signature verified}}` |

> **Cảnh báo**: KHÔNG bao giờ skip signature verification "tạm thời để debug". Đây là attack vector phổ biến.

## 4. Endpoints / Operations Used

Liệt kê **chỉ** các operations thực sự gọi — không liệt kê toàn bộ API của provider.

| # | Operation | Method | Path / RPC | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | {{name}} | {{POST}} | `{{/v1/...}}` | {{what feature/flow uses this}} | {{user action / cron / webhook reaction}} |
| 2 | … | … | … | … | … |

## 5. Request / Response Contracts

Cho mỗi operation §4, document:

### 5.1 {{Operation name}}

**Request**:
```json
{{example request}}
```

**Response (success)**:
```json
{{example response}}
```

**Response (error shapes)**:
```json
{{example errors — provider-specific codes/structure}}
```

**Mapping → internal model**: {{Provider field → our domain entity field}}

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | {{No response in N seconds}} | `{{lib timeout exception}}` | Retry với backoff (§6.2) |
| Provider 5xx | HTTP 500-504 | Status code | Retry với backoff |
| Provider 4xx (transient) | 429 rate-limit | `{{Retry-After header}}` | Honor `Retry-After`, exponential backoff |
| Provider 4xx (permanent) | 400/401/403/404/422 | Status code | Don't retry; surface error to caller |
| Partial response | Provider returns 200 but body indicates failure | Body inspection | Treat as 4xx-permanent |
| Webhook delivery delay | Expected webhook không tới sau {{N}} phút | Reconciliation job | Pull state via §4 op {{X}} |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | {{3}} |
| Backoff | {{Exponential: 1s, 2s, 4s — with jitter ±20%}} |
| Total max wait | {{30s}} |
| Idempotency key | {{Use provider's idempotency key support — header name + how we generate}} |
| After max retries | {{Persist to dead-letter queue + alert + manual intervention}} |

### 6.3 Circuit breaker

| Thuộc tính | Giá trị |
|---|---|
| Open threshold | {{50% failure over 30s sliding window}} |
| Half-open probe | {{Single request after 60s open}} |
| Close threshold | {{3 consecutive successes}} |
| When open | {{Fallback behavior — fail-fast / cached response / queue / degraded UX}} |

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency key generation | {{Method — UUIDv4 per request, or deterministic from business keys}} |
| Server-side dedup window | {{Provider's window — e.g., Stripe 24h}} |
| Order guarantees | {{Webhooks may arrive out of order — how we handle}} |
| Replay safety | {{Can retry same op N times safely? Idempotent? At-least-once?}} |

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags |
|---|---|---|
| `integration.{{provider}}.requests` | counter | `op`, `status` |
| `integration.{{provider}}.duration` | histogram | `op` |
| `integration.{{provider}}.errors` | counter | `op`, `error_code` |
| `integration.{{provider}}.circuit_open` | gauge | — |

### 8.2 Logging

- Mọi request log: `correlation_id`, `op`, `latency_ms`, `status`, `provider_request_id`
- Mọi failure log: full error response (sanitized — strip PII/secrets)
- KHÔNG log: API keys, full card numbers, full SSN, raw biometric data

### 8.3 Tracing

- Span name: `integration.{{provider}}.{{op}}`
- Attributes: `op`, `provider_request_id`, `idempotency_key`
- Propagate trace context qua headers nếu provider hỗ trợ (W3C Trace Context)

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Error rate | > 5% over 5 min | P2 | {{boundary owner}} |
| Latency p99 | > {{2s}} | P3 | {{boundary owner}} |
| Circuit breaker open | any | P1 | On-call |
| Webhook delivery delay | > {{N}} min | P2 | {{boundary owner}} |
| Quota usage | > 80% of monthly | P3 | {{boundary owner}} |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | {{e.g., 99.95% monthly uptime}} |
| Our SLA exposed to users | {{Lower than provider's — our worst case}} |
| Rate limits | {{N requests/sec, M requests/day}} |
| Quota limits | {{Monthly cap, overage policy}} |
| Pricing model | {{Per-call / per-volume / fixed monthly}} |
| Cost cap / budget alarm | {{$X/month with alarm at 80%}} |
| Cost owner | {{Who reviews bill}} |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | {{Yes/No — list fields}} |
| Data residency | {{EU only / US-EU / Global}} |
| Regulatory frameworks | {{GDPR / PCI-DSS / HIPAA / SOC2 / …}} |
| DPA signed | {{Date}} |
| Data retention at provider | {{Provider's policy}} |
| Right-to-erasure flow | {{How to delete user data from provider}} |

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `{{sandbox URL}}` | `{{prod URL}}` |
| Credentials | {{Test creds — env var}} | {{Real creds — Vault path}} |
| Webhook URL | `{{staging webhook endpoint}}` | `{{prod webhook endpoint}}` |
| Test data fixtures | {{Provider's test cards/numbers/etc.}} | n/a |
| Switchover gate | Feature flag `FF_{{PROVIDER}}_PROD_ENABLED` (default OFF) | — |

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock provider client; assert request shape + response handling |
| Integration | Use provider's sandbox; assert real network behavior; rate-limit aware |
| Contract test | Pact / OpenAPI conformance check (nếu provider có spec) |
| Chaos | Inject timeouts, 5xx, malformed responses; verify retry/circuit behavior |
| E2E | Real sandbox endpoint, feature flag protected |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| Provider outage | {{Switch to fallback / degraded mode / queue }} |
| Credential leak | {{Rotate immediately — process}} |
| Quota exhausted | {{Buy more / throttle / queue}} |
| Webhook flood | {{Verify signatures + rate-limit our endpoint}} |
| Unrecognized event type | {{Log + ack 200; don't 500}} |

Full runbook: `{{Operations/runbooks/INTEG-EXT-{{provider}}-runbook.md}}`

## 14. Forbidden patterns

Anti-patterns mà integration KHÔNG được phép. Vi phạm = MAJOR CR.

- ❌ Skip signature verification cho webhook callback (KHÔNG bao giờ skip "tạm thời để debug")
- ❌ Hardcode credentials trong source code — phải dùng env / KMS / Vault
- ❌ Log full API keys, tokens, raw card numbers, raw biometric data
- ❌ Caller ghi trực tiếp DB của provider — phải qua REST/protected API contract (per ADR-006)
- ❌ Skip x-api-key header / auth header cho protected endpoints
- ❌ Retry permanent 4xx errors (only retry transient: 5xx, timeout, 429 với honor `Retry-After`)
- ❌ Persist credentials không encrypted in DB
- ❌ Bypass circuit breaker khi provider rate-limited
- ❌ Skip idempotency key cho mutation (duplicate side effect risk)
- ❌ Bỏ qua tenant scoping khi caller cần multi-tenant data isolation
- ❌ Bypass sandbox testing trước khi switch production
- ❌ Bypass cost/budget alarm cho external paid services

## 15. References

- HLD caller: [{{caller-boundary}}-HLD.md](../hld/{{caller-boundary}}-HLD.md)
- HLD provider (nếu internal): [{{provider}}-HLD.md](../hld/{{provider}}-HLD.md)
- API contract caller: [{{caller-boundary}}-api.md](../api/{{caller-boundary}}-api.md)
- API contract provider (nếu internal): [{{provider}}-api.md](../api/{{provider}}-api.md)
- Source code caller: `{{srcroot path tới Client class}}`
- Source code provider (nếu internal): `{{srcroot path tới provider service}}`
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape), ADR-006 (Flyway per-service data), ADR-XXX (specific topic)
- Related INTEG contracts: [INTEG-XXX](INTEG-XXX.md) (sister integration nếu có)
- Provider docs (cho external 3rd-party): {{URL}}
- Business Rules: NA hoặc BR-XXX nếu có

## 16. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| YYYY-MM-DD | 2 | Add Forbidden patterns + References sections | Architecture Authority |
| 2026-05-02 | 1 | Initial integration contract | {{Architect}} |
