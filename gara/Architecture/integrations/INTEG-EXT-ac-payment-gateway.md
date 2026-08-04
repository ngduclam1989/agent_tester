---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gms-payment"
provider: "ac-payment-gateway"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration - GMS payment <-> ac-payment-gateway (External Service)

> Document tích hợp giữa **agg-garage-graph** payment module và **ac-payment-gateway**.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **ac-payment-gateway** - payment gateway ecosystem service |
| Provider docs | Chưa thấy tài liệu provider riêng trong source hiện tại |
| Provider status page | Chưa thấy trong source hiện tại |
| Used by boundary | `agg-garage-graph` (BFF passthrough), `gf-purchase` (server-side checkout QR/CC + reconciliation via PaymentGatewayClient) |
| Module / class | `agg-garage-graph/src/graphql/modules/payment/payment.resolver.ts`; `PassthroughService`; `ApiClient` |
| Sandbox URL | `http://localhost:45100` theo BFF local default |
| Production URL | Env runtime `AC_PAYMENT_GATEWAY` |
| API version pinned | Không thấy version pin riêng; endpoint đang dùng `/api/payments/*` |
| SDK / library | Hand-written `PassthroughService` + Axios `ApiClient` |
| Category | Payment |

Boundary-specific configuration:

| Boundary | Config key | Default / source |
|---|---|---|
| `agg-garage-graph` | `AC_PAYMENT_GATEWAY` | `http://localhost:45100` |
| `gf-purchase` | `PAYMENT_GATEWAY_URL` | env runtime (PaymentGatewayClient — checkout QR/CC, reconciliation strategy COD/Prepaid/Postpaid) |

Important scope note:

| Flow | Provider gọi trực tiếp |
|---|---|
| `Mutation.createPayment` | `ac-payment-gateway` |
| `Query.getPaymentByPurchase` | `ac-payment-gateway` |
| `Query.getVariables` | `gf-purchase`, không gọi trực tiếp `ac-payment-gateway` |
| `Query.getPreferences` | `gf-purchase`, không gọi trực tiếp `ac-payment-gateway` |
| `Mutation.changePaymentMethod` | `gf-purchase`, không gọi trực tiếp `ac-payment-gateway` |
| Service-order record payments | `gf-sales`, không nằm trong provider scope này |

## 2. Why this provider (decision)

**Decision**: GMS dùng `ac-payment-gateway` để tạo payment order và đọc trạng thái payment theo purchase request code.

**Why**:

- BFF cần tạo payment với provider code, amount, currency, payment method và return URL.
- BFF cần lấy payment hiện tại theo `purchaseCode` để hiển thị payment order/status/provider status/payment time.
- Payment gateway là boundary xử lý thanh toán; BFF chỉ passthrough request và map response về GraphQL response union.

**Alternatives considered**: Không thấy ADR hoặc source decision về provider thay thế trong source hiện tại.

**Ref**:

- `Architecture/integrations/INTEG-BFF-garage-platform.md`
- `Architecture/integrations/INTEG-BFF-agg-garage-graph.md`
- `Architecture/integrations/_EXT-INTEGRATION-PHASE0-BASELINE.md`

## 3. Authentication & Authorization

### 3.1 Auth model

| Thuộc tính | Giá trị |
|---|---|
| Auth method | Bearer token forwarded qua `Authorization` nếu context có |
| Default headers | `Content-Type: application/json`, `x-client-type: GARAGE` (ApiClient default, luôn gửi) |
| Context headers | `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`, `x-real-ip`, `Garage-App-Version`, `x-api-key-feedback` nếu context có |
| Credential rotation | Chưa thấy credential riêng cho gateway trong source hiện tại |
| Storage | Base URL qua env `AC_PAYMENT_GATEWAY`; không thấy API key riêng trong BFF payment module |
| Scope / permission | Create payment và get payment by purchase |
| Multi-tenant strategy | Tenant/user scope phụ thuộc bearer token và downstream authorization; không thấy credential per tenant |

Security rule:

- `amount`, `currency`, `purchaseRequestCode`, `paymentMethod`, `returnUrl`, `tokenNum`, `tokenExp` là payment-sensitive input. BFF không được log raw card/token/payment credential.
- `returnUrl` phải được provider hoặc upstream validate allowlist để tránh open redirect. Source BFF hiện chỉ passthrough input.
- Không retry `createPayment` tự động nếu chưa có idempotency key.

### 3.2 Webhook security

Không thấy source hiện tại mô tả webhook/callback từ `ac-payment-gateway` về `agg-garage-graph`. Không áp dụng ở Phase 3.

## 4. Endpoints / Operations Used

Chỉ liệt kê operation quan sát được từ source GMS hiện tại.

| # | Operation | Method | Path / RPC | Used by | Trigger |
|---:|---|---|---|---|---|
| 1 | Create payment | `POST` | `/api/payments/create` | `agg-garage-graph` | GraphQL `Mutation.createPayment` |
| 2 | Get payment by purchase | `GET` | `/api/payments/by-purchase/{purchaseCode}` | `agg-garage-graph` | GraphQL `Query.getPaymentByPurchase(purchaseCode)` |

Out of direct provider scope:

| GraphQL operation | Actual backend in source |
|---|---|
| `getVariables` | `gfPurchaseService.get(API_ENDPOINTS.PAYMENT.GET_VARIABLES)` |
| `getPreferences` | `gfPurchaseService.get(endpoints.PAYMENT.GET_PREFERENCES)` |
| `changePaymentMethod` | `gfPurchaseService.put(API_ENDPOINTS_V2.PAYMENT.CHANGE_PAYMENT_METHOD)` |

## 5. Request / Response Contracts

### 5.1 Create payment

**Request**:

```json
{
  "providerCode": "PAYMENT_PROVIDER",
  "purchaseRequestCode": "PR-001",
  "amount": 1000000,
  "currency": "VND",
  "description": "Payment for purchase request PR-001",
  "customer": {
    "name": "Nguyen Van A"
  },
  "paymentMethod": "BANK_TRANSFER",
  "paymentFee": 0,
  "rememberCard": false,
  "tokenNum": "***",
  "tokenExp": "***",
  "returnUrl": "https://garage.example.com/payment/callback"
}
```

**Response success shape qua GraphQL schema**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "success",
  "data": {
    "paymentOrderId": 123456,
    "providerCode": "PAYMENT_PROVIDER",
    "status": "PENDING",
    "providerStatus": "PENDING",
    "presentation": {
      "type": "QR",
      "invoiceQrVietQR": "...",
      "invoiceQrBase64": "...",
      "paymentUrl": "https://provider.example/pay",
      "createdAt": "2026-05-04T00:00:00Z"
    },
    "amount": {
      "value": "1000000",
      "paymentFee": "0",
      "fixedFee": "0",
      "variableCost": "0",
      "currency": "VND"
    },
    "references": {
      "userId": "iam-user-id",
      "userReference": "user-ref",
      "invoiceId": "invoice-id",
      "invoiceReference": "PR-001"
    },
    "startAt": "2026-05-04T00:00:00Z",
    "validTo": "2026-05-04T00:15:00Z"
  }
}
```

**Response error shape qua BFF**:

```json
{
  "__typename": "ErrorResponse",
  "statusCode": 500,
  "message": "provider error message",
  "code": "provider_code",
  "path": "/api/payments/create",
  "timestamp": "..."
}
```

**Mapping -> internal model**:

| Provider field | BFF GraphQL field |
|---|---|
| `paymentOrderId` | `CreatePaymentData.paymentOrderId` |
| `providerCode` | `CreatePaymentData.providerCode` |
| `status` | `CreatePaymentData.status` |
| `providerStatus` | `CreatePaymentData.providerStatus` |
| `presentation.paymentUrl` | `CreatePaymentPresentation.paymentUrl` |
| `presentation.invoiceQrVietQR` | `CreatePaymentPresentation.invoiceQrVietQR` |
| `presentation.invoiceQrBase64` | `CreatePaymentPresentation.invoiceQrBase64` |
| `amount.*` | `PaymentAmount` |
| `references.*` | `PaymentReferences` |

### 5.2 Get payment by purchase

**Request**:

```http
GET /api/payments/by-purchase/PR-001
Authorization: Bearer ***
```

**Response success shape qua GraphQL schema**:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "success",
  "data": {
    "paymentOrderId": 123456,
    "providerCode": "PAYMENT_PROVIDER",
    "status": "PAID",
    "providerStatus": "SUCCESS",
    "paymentType": "QR",
    "amount": {
      "value": "1000000",
      "paymentFee": "0",
      "fixedFee": "0",
      "variableCost": "0",
      "currency": "VND"
    },
    "references": {
      "userId": "iam-user-id",
      "userReference": "user-ref",
      "invoiceId": "invoice-id",
      "invoiceReference": "PR-001"
    },
    "paymentTime": "2026-05-04T00:05:00Z"
  }
}
```

Contract rule: client phải xử lý trạng thái pending/expired/failed theo `status` và `providerStatus`, không chỉ dựa trên việc response HTTP thành công.

## 6. Failure Handling

### 6.1 Failure modes

| Mode | Symptom | Detect via | Action |
|---|---|---|---|
| Network timeout | Payment gateway không phản hồi | Axios timeout / `TIMEOUT_ERROR` mapping | Không retry `createPayment` tự động; cho phép client thử lại sau khi kiểm tra trạng thái purchase/payment |
| Provider 4xx validation | Sai amount/currency/payment method/return URL/token | HTTP 400/422 | Không retry; surface field error tới client |
| Provider 4xx auth | Bearer token thiếu/sai scope | HTTP 401/403 | Kiểm tra `Authorization` forwarding và downstream authz |
| Provider 404 | Không có payment theo `purchaseCode` | HTTP 404 hoặc provider error body | Client hiển thị chưa có payment / cần tạo payment tùy flow |
| Provider 5xx | Gateway lỗi khi create/get payment | HTTP 500-504 | Fail operation; không tạo payment lặp nếu chưa xác minh trạng thái |
| Partial/ambiguous create | Request create payment timeout nhưng provider có thể đã tạo order | Timeout/no response | Gọi `getPaymentByPurchase` trước khi tạo lại |
| Open redirect risk | `returnUrl` trỏ ngoài domain không mong muốn | Security review / provider validation | Enforce allowlist ở provider hoặc upstream |

### 6.2 Retry policy

| Thuộc tính | Giá trị |
|---|---|
| Max retries | Không thấy retry policy chung trong BFF payment client |
| Backoff | Không thấy trong source hiện tại |
| Total max wait | `DEFAULT_TIMEOUT` default `60000ms` |
| Idempotency key | Không thấy idempotency key trong `CreatePaymentInput` hoặc headers |
| After max retries | Không áp dụng vì chưa thấy retry tự động |

Contract rule:

- `createPayment` là side-effect operation. Không retry tự động nếu chưa có idempotency key hoặc deterministic dedup theo `purchaseRequestCode`.
- Sau timeout/5xx ambiguous, caller phải query `getPaymentByPurchase(purchaseCode)` trước khi gọi `createPayment` lại.

### 6.3 Circuit breaker

| Thuộc tính | Giá trị |
|---|---|
| Open threshold | Chưa thấy circuit breaker chung trong source hiện tại |
| Half-open probe | Chưa thấy |
| Close threshold | Chưa thấy |
| When open | Chưa áp dụng; BFF trả `ErrorResponse` từ provider/client |

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Idempotency key generation | Chưa thấy trong source hiện tại |
| Server-side dedup window | Chưa thấy trong source hiện tại |
| Order guarantees | Flow nên lấy payment variables/preferences trước, sau đó create payment; trạng thái payment đọc lại bằng purchase code |
| Replay safety | `getPaymentByPurchase` retry safe; `createPayment` không retry safe nếu chưa có idempotency |

Ordering rules:

- `changePaymentMethod` đi qua `gf-purchase`, không đảm bảo gateway state đổi ngay nếu payment đã được tạo.
- Nếu `createPayment` trả `paymentUrl`/QR, client phải theo `validTo` để tránh dùng link hết hạn.
- `status` và `providerStatus` có thể lệch nhau; UI/business logic phải xác định source of truth rõ ràng.

## 8. Observability

### 8.1 Metrics

| Metric | Type | Tags | Trạng thái |
|---|---|---|---|
| `integration.ac-payment-gateway.requests` | counter | `op`, `status`, `boundary` | Chưa thấy custom metric riêng |
| `integration.ac-payment-gateway.duration` | histogram | `op`, `boundary` | BFF có log duration qua `ApiClient`; metric riêng chưa thấy |
| `integration.ac-payment-gateway.errors` | counter | `op`, `error_code` | Chưa thấy custom metric riêng |
| `integration.ac-payment-gateway.ambiguous_create` | counter | `purchaseRequestCode` | Chưa thấy |

### 8.2 Logging

- `agg-garage-graph` `ApiClient` log destination service, method/path/status/duration.
- `ac-payment-gateway` đã nằm trong `SERVICE_REGISTRY`, nên destination service name được map là `ac-payment-gateway`.
- Contract rule: không log `tokenNum`, `tokenExp`, full payment URL nếu chứa sensitive token, bearer token hoặc raw card/payment credential.

### 8.3 Tracing

- BFF forward request id trio nếu context có.
- Span/metric custom theo operation chưa thấy trong source hiện tại.

### 8.4 Alerts

| Alert | Threshold | Severity | Owner |
|---|---|---|---|
| Create payment error rate tăng | > 3-5% trong 5 phút | P2 | Payment/GMS owner |
| Payment gateway timeout | Spike timeout hoặc p99 vượt budget | P2 | Payment/GMS owner |
| Ambiguous create payment | Bất kỳ khi timeout sau create | P2 | Payment/GMS owner |
| Provider 401/403 sau deploy | Bất kỳ | P1 | Platform/Security owner |
| Payment status mismatch | `status`/`providerStatus` bất thường | P2 | Payment/GMS owner |

## 9. SLA, Quotas & Cost

| Thuộc tính | Giá trị |
|---|---|
| Provider SLA | Chưa thấy trong source hiện tại |
| Our SLA exposed to users | Checkout/payment creation phụ thuộc trực tiếp payment gateway availability |
| Rate limits | Chưa thấy trong source hiện tại |
| Quota limits | Chưa thấy trong source hiện tại |
| Pricing model | Chưa thấy trong source hiện tại |
| Cost cap / budget alarm | Chưa thấy trong source hiện tại |
| Cost owner | Chưa thấy trong source hiện tại |

## 10. PII / Compliance / Data Residency

| Thuộc tính | Giá trị |
|---|---|
| PII transmitted | Có thể có: customer name, userId/userReference, invoiceReference/purchaseRequestCode |
| Payment-sensitive data | `amount`, `currency`, `paymentMethod`, `paymentFee`, `tokenNum`, `tokenExp`, `paymentUrl`, QR payload |
| Data residency | Chưa thấy chính sách trong source hiện tại |
| Regulatory frameworks | Chưa thấy trong source hiện tại; payment flow cần review PCI/payment compliance nếu token/card data đi qua BFF |
| DPA signed | Không thấy trong source hiện tại |
| Data retention at provider | Chưa thấy trong source hiện tại |
| Right-to-erasure flow | Không thấy operation xóa payment/customer payment data trong BFF hiện tại |

Security rules:

- Nếu `tokenNum`/`tokenExp` là card token hoặc credential thanh toán, BFF phải coi là sensitive và không ghi log.
- `returnUrl` cần allowlist.
- Không expose provider internal error chứa payment credential ra client.

## 11. Sandbox vs Production

| Aspect | Sandbox | Production |
|---|---|---|
| URL | `http://localhost:45100` theo BFF local default | Env runtime `AC_PAYMENT_GATEWAY` |
| Credentials | Bearer token từ caller nếu context có; không thấy API key riêng | Secret/runtime auth policy chưa thấy trong source hiện tại |
| Webhook URL | Không thấy webhook trong BFF source | Không thấy webhook trong BFF source |
| Test data fixtures | Chưa thấy trong source hiện tại | n/a |
| Switchover gate | Không thấy feature flag riêng | n/a |

## 12. Testing Strategy

| Layer | Approach | Trạng thái từ source |
|---|---|---|
| Unit | Mock `acPaymentGatewayService`; assert path/body/header/error mapping | Chưa xác nhận test coverage |
| Contract | Fixture response cho create/get payment; assert GraphQL schema mapping | Cần bổ sung nếu chưa có |
| Integration | Test env với real gateway; verify payment status/presentation/QR/paymentUrl | Cần chạy ở staging |
| Idempotency test | Timeout after create rồi gọi `getPaymentByPurchase` trước khi retry | Cần bổ sung |
| Security test | Validate `returnUrl`, sensitive fields không log, auth header propagation | Cần bổ sung |
| Chaos | Inject timeout/5xx/slow gateway; verify `ErrorResponse` và no auto retry create | Chưa thấy chaos policy |

## 13. Runbook (Operational)

| Scenario | Action |
|---|---|
| `createPayment` timeout | Không gọi lại ngay; gọi `getPaymentByPurchase(purchaseRequestCode)` để xác định payment đã tạo chưa |
| `createPayment` 4xx | Kiểm tra amount/currency/payment method/returnUrl/token fields và provider validation message |
| `getPaymentByPurchase` 404/rỗng | Xác định purchase chưa có payment hay code sai; kiểm tra purchase request code |
| Gateway 5xx | Kiểm tra `AC_PAYMENT_GATEWAY`, provider health/log, request id, error rate |
| Payment URL/QR không render | Kiểm tra `presentation.type`, `paymentUrl`, `invoiceQrVietQR`, `invoiceQrBase64`, `validTo` |
| Payment status mismatch | So sánh `status`, `providerStatus`, provider transaction detail và purchase state ở `gf-purchase` |
| Sensitive data bị log | Rotate token nếu cần, rà BFF/provider logs, mask `tokenNum`, `tokenExp`, bearer token, payment URL token |

Full runbook: chưa thấy file `Operations/runbooks/INTEG-EXT-ac-payment-gateway-runbook.md` trong repo hiện tại.

## 14. Forbidden patterns

- ❌ Skip signature verification cho payment webhook callback (PCI compliance critical).
- ❌ Hardcode payment gateway credentials trong source — KMS / Vault / env only.
- ❌ Log full card numbers, CVV, raw token — PCI violation.
- ❌ Persist provider's payment ID as primary key — use Garage purchase code; map provider ID as foreign reference.
- ❌ Auto-retry on payment 4xx (declined/insufficient funds) — KHÔNG retry; user must initiate.
- ❌ Skip idempotency key cho `POST /api/payments/create` — duplicate charge risk.
- ❌ Bypass cost/budget alarm — payment gateway có per-transaction fee, monitor budget.
- ❌ Bypass sandbox testing trước khi switch production — payment errors khó rollback.
- ❌ Trust provider response without verification — verify HMAC signature on webhook.
- ❌ Cache payment status từ provider quá lâu — status changes async; TTL ≤ 30s hoặc rely on webhook.
- ❌ Mask `tokenNum`, `tokenExp`, bearer token bị bỏ qua trong log — phải mask consistent với BFF logging policy.

## 15. References

- HLD caller: [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md)
- API contract caller: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — payment gateway external boundary), ADR-002 (GraphQL aggregator)
- Related INTEG: [INTEG-BFF-agg-garage-graph.md](INTEG-BFF-agg-garage-graph.md) (caller BFF), [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md) (gf-purchase tham gia payment flow — change-payment-method endpoint)
- KG (BFF): [agg-garage-graph.knowledge-graph.yaml](../../Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml) — payment module downstream mapping
- KG (gf-purchase): [gf-purchase.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-purchase.knowledge-graph.yaml) — PaymentGatewayClient integration
- Provider docs: External provider documentation (no internal HLD)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Sync với KG v6: (M1) thêm gf-purchase là second caller (PaymentGatewayClient cho checkout QR/CC + reconciliation); (L2) thêm KG references; version bump. |
| 2026-05-07 | v1 | Initial integration contract `agg-garage-graph` -> `ac-payment-gateway` (external payment provider): REST/HTTPS+JSON với Bearer JWT forward (không có credential riêng tại BFF), key operations `POST /api/payments/create` và `GET /api/payments/by-purchase/{purchaseCode}`; failure mode no auto-retry on `createPayment` (idempotency key chưa có; timeout 60s default; ambiguous create -> caller phải query `getPaymentByPurchase` trước khi retry); PCI-sensitive fields (tokenNum, tokenExp, paymentUrl) cấm log raw. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
