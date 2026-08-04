---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 2
tier: T1
owner_authority: Architecture Authority
boundary: "gf-customer"
provider: "gf-marketing"
last_reviewed: "2026-05-19"
supersedes: "none"
---

# Integration — `gf-customer` ↔ `gf-marketing` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE giữa `gf-customer` và `gf-marketing` cho segment-campaign linkage check, voucher claim QR và voucher redeem by driver.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-marketing`** — Campaign, voucher, message orchestration owner |
| Provider docs | [Architecture/api/gf-marketing-api.md](../api/gf-marketing-api.md), [Architecture/hld/gf-marketing-HLD.md](../hld/gf-marketing-HLD.md) |
| Used by boundary | `gf-customer` |
| Module / class | `gf-customer/src/main/java/com/actechx/gf/application/client/rest/GfMarketingClient.java` |
| Sandbox URL | `gf-marketing.url=${GF_MARKETING_URL}` trong gf-customer application.yml line 94-95 |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (marketing) |

---

## 2. Why this provider (decision)

**Decision**: gf-customer gọi gf-marketing cho 3 use case:
1. **Segment-campaign linkage check** — pre-check trước khi update/delete segment, tránh broken campaign run.
2. **Voucher claim QR** — driver claim voucher qua QR code thông qua gf-customer mobile flow.
3. **Voucher redeem by driver** — driver sử dụng voucher khi hoàn thành booking qua gf-customer flow.

**Why**:
- Segment ownership thuộc gf-customer (theo data model); campaign + voucher ownership thuộc gf-marketing.
- Cross-domain check: tránh xóa segment đang được campaign sử dụng → tránh broken campaign run.
- Voucher lifecycle: gf-customer là entry point cho driver mobile → cần proxy tới gf-marketing để claim/redeem voucher.

**Ref**: ADR-001 (microservice landscape).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | `X-Tenant-Id` header (segment-linked) **hoặc** `tenantId` trong request body (voucher claim-qr, redeem-by-driver) |

---

## 4. Endpoints / Operations Used

| # | Operation | Method | Path | Why we call it | Trigger |
|---|---|---|---|---|---|
| 1 | Check segment linked to campaign | GET | `/protected/v1/campaigns/segments/{segmentId}/linked` | Pre-check trước khi user update/delete segment | User edit/delete segment trong gf-customer |
| 2 | Claim voucher by QR | POST | `/protected/v1/voucher-programs/claim-qr` | Driver claim voucher qua QR code | Driver scan QR trong mobile app |
| 3 | Redeem voucher by driver | POST | `/protected/v1/voucher-programs/redeem-by-driver` | Driver sử dụng voucher khi booking | Driver apply voucher cho booking |

---

## 5. Request / Response Contracts

### 5.1 Check segment linked

**Request**:
```
GET /protected/v1/campaigns/segments/12345/linked
Headers: x-api-key, X-Tenant-Id
```

**Response**:
```
true
```

Raw boolean (`true` / `false`). `true` = đang được linked với active campaign → block delete; `false` = safe to delete.

### 5.2 Claim voucher by QR

**Request**:
```
POST /protected/v1/voucher-programs/claim-qr
Headers: x-api-key
Content-Type: application/json
```
```json
{
  "tenantId": 1,
  "qrCode": "QR-ABC-123",
  "driverId": "DRV-001",
  "driverPhone": "0901234567",
  "driverName": "Nguyen Van A",
  "claimSource": "MOBILE"
}
```

**Response**:
```json
{
  "voucher": { ... }
}
```

### 5.3 Redeem voucher by driver

**Request**:
```
POST /protected/v1/voucher-programs/redeem-by-driver
Headers: x-api-key
Content-Type: application/json
```
```json
{
  "tenantId": 1,
  "voucherCode": "TENANT-XXXX-XXXX",
  "phone": "0901234567",
  "bookingId": 456,
  "originalAmount": 500000.00
}
```

**Response**:
```json
{
  "voucher": { ... }
}
```

---

## 6. Failure Handling

**Segment-linked check (Op #1)**:

| Mode | Action |
|---|---|
| Network timeout / Provider 5xx / Exception | No retry. Fail-open: log warn, treat as `false` (not linked) → cho phép tiếp tục delete segment |
| 404 | Treat as `false` (segment không có link) — safe to proceed |

**Voucher operations (Op #2, #3)**:

| Mode | Action |
|---|---|
| Network timeout / Provider 5xx | Return error to caller — voucher operation fails |
| 404 | Return not-found error |

---

## 7. Idempotency & Ordering

GET segment-linked: idempotent, no ordering concern. POST claim-qr / redeem-by-driver: not idempotent — each call may mutate voucher state.

---

## 8. Observability

`gf_customer.marketing_client.requests/.duration`. Log: `correlation_id`, `tenantId`, `segmentId`, `linked`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 200ms expected.

---

## 10. PII / Compliance

No PII in segment-campaign linkage check. Voucher operations chứa driverPhone, driverName — PII, cần audit log.

---

## 11. Sandbox vs Production

Env switchover via `GF_MARKETING_URL`.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock GfMarketingClient |
| Integration | Real gf-marketing test instance |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-marketing down (segment check) | Fail-open: segment delete/update vẫn tiếp tục, log warn cho ops |
| gf-marketing down (voucher ops) | Voucher claim/redeem fail → return error to driver/user |

---

## 14. Forbidden patterns

- ❌ `gf-customer` ghi trực tiếp DB của `gf-marketing` — phải qua protected API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip `X-Tenant-Id` header (segment-linked) hoặc `tenantId` body (voucher ops) — có thể leak cross-tenant.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Cache linkage result dài hạn — campaign linking dynamic; recommend không cache hoặc TTL ≤ 5 min.
- ❌ Retry claim-qr / redeem-by-driver khi đã nhận 2xx — có thể double-claim/double-redeem.

## 15. References

- HLD provider: [gf-marketing-HLD.md](../hld/gf-marketing-HLD.md)
- HLD caller: [gf-customer-HLD.md](../hld/gf-customer-HLD.md)
- API contract: [gf-marketing-api.md](../api/gf-marketing-api.md), [gf-customer-api.md](../api/gf-customer-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape)
- Related INTEG: [INTEG-EXT-gf-customer.md](INTEG-EXT-gf-customer.md) (gf-marketing là consumer chính của customer data)
- KG: [gf-marketing.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-marketing.knowledge-graph.yaml) — 70+ APIs (58 public + 3 internal), 13 BRs
- Business Rules: BR-GF-MARKETING-007 (voucher claim/redeem validation), BR-GF-MARKETING-008 (campaign state machine)

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-19 | v2 | Cross-review sync với KG v4: thêm 2 voucher endpoints (claim-qr, redeem-by-driver) vào §4/§5 (D1); sửa response schema segment-linked từ wrapped sang raw boolean (D3); sửa §6 failure handling segment-linked thành fail-open đúng thực tế — no retry, log warn, treat as not-linked (D9); cập nhật §3 tenant resolution dual pattern header/body (D7); mở rộng §2 why-provider cho voucher use cases (D8); thêm KG link §15 (D5); sửa §13 runbook và §14 forbidden patterns cho consistency. |
| 2026-05-07 | v1 | Initial integration contract `gf-customer` -> `gf-marketing` (campaign/voucher orchestration owner, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operation segment-campaign linkage check trước khi cho phép update/delete segment ở gf-customer (cross-domain consistency check tránh broken campaign run); failure mode no auto-retry, fail-safe -> reject segment delete nếu lookup lỗi (conservative). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
