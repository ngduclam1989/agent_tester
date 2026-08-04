---
type: architecture
artifact_kind: adr
status: PROPOSED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: "cross-boundary (gf-sales, gf-purchase, agg-garage-graph)"
last_reviewed: "2026-05-27"
---
# ADR-013: Deprecation Header Convention — Cross-boundary V1/V2/V3 lifecycle signaling

## Status

ACCEPTED — 2026-06-01

> Created qua `CR-1779876780` APPROVED 2026-05-27T10:13Z (MAJOR severity, Business + Delivery consolidated). Scope-extend recorded trong `Execution/STATE.json` `wave_scope.modify_allowlist[0]` + `MEMORY.md §6`. Unblocks PKG-W01 entry criterion #7.

## Context

Garage hiện có **3 versions cùng tồn tại** trên các REST endpoints quan trọng nhất:

- `gf-sales`: Booking V1/V2/V3, ServiceOrder V1/V2/V3
- `gf-purchase`: PurchaseRequest V1/V2/V3, PurchaseOrder V1/V2/V3
- `agg-garage-graph`: BFF aggregate V2/V3 expose qua GraphQL resolver gọi xuống BE

**Vấn đề cụ thể (audit** `Tracking/p0-gap-audit-be-biz-tech-2026-05-22.md` **v6):**

1. **Concurrent write trên V2 và V3 cùng entity** → race condition + data corruption (TD-BE-001 P0 gap).
2. **Mobile/web clients không biết V1/V2 sắp deprecated** → không proactive migrate, integration test rotting.
3. **Không có signal chuẩn** cho external integrators (ERP bridge, partner API consumer) biết version status / sunset timeline.
4. **3 boundary tự define header format khác nhau** → consumer phải write 3 parsers riêng (vs 1 uniform).

**Câu hỏi cần quyết định:**

1. Header format nào báo "endpoint này đang deprecated"?
2. Format nào báo sunset date (khi endpoint bị remove)?
3. Format nào hint successor version (V3) cho consumer migrate?
4. 3 boundary có dùng cùng format không, hay mỗi boundary tự define?
5. Header được emit ở layer nào (controller / interceptor / global filter)?

**Constraints từ runtime/source:**

- `gf-sales`, `gf-purchase`: Spring Boot 3.5 / Java 21 — có thể dùng `HandlerInterceptor` hoặc `OncePerRequestFilter`.
- `agg-garage-graph`: Apollo Server 4 / Node.js 22 — Express middleware layer cho REST passthrough; GraphQL resolver tự return.
- **RFC 8594** (Sunset HTTP Header) + **draft-ietf-httpapi-deprecation-header-02** đã standardize header `Deprecation` và `Sunset`.
- **RFC 5988** (Web Linking) standardize `Link` header với `rel` parameter.
- Existing consumers: mobile (Flutter), web (React/Apollo Client), partner integrators (ERP bridge qua gf-erp-agent).

**Business rules liên quan:** NA (technical convention, không phải domain rule).

## Decision

**Chốt 3 header chuẩn cho mọi REST response của V1/V2 endpoint (deprecated versions) tại 3 boundary** `gf-sales` **+** `gf-purchase` **+** `agg-garage-graph`**:**

```http
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: </api/v3/{resource}/{id}>; rel="successor-version"
```

### 1. Header `Deprecation`

- Value: literal string `true` (per draft-ietf-httpapi-deprecation-header-02 §2.1)
- Emit khi: endpoint version bị deprecated (V1, V2 hiện tại; V3 sẽ thêm khi V4 ra)
- KHÔNG emit cho version stable (V3 hiện tại) — absence = stable.

### 2. Header `Sunset`

- Format: HTTP-date (RFC 7231 §7.1.1.1 — IMF-fixdate). Vd `Wed, 31 Dec 2026 23:59:59 GMT`.
- Emit cùng với `Deprecation: true`. Sunset date confirmed bởi Product Owner + BFF team .
- Sau sunset date, endpoint return `410 Gone` (không phải 404 — semantic intentional).
- 3 boundary dùng cùng sunset date cho cùng major version (vd V1/V2 cùng Sunset trong cùng quarter).

### 3. Header `Link`

- Format: per RFC 5988 §5.1 — `<URL>; rel="successor-version"`
- URL phải là **same host** với endpoint deprecated (vd `/api/v3/bookings/{id}` nếu deprecated là `/api/v2/bookings/{id}`).
- `rel="successor-version"` per IANA Link Relations Registry.
- Nếu V3 không có 1:1 mapping với V2 (vd V2 endpoint bị split thành 2 V3 endpoints), emit MULTIPLE `Link` headers (mỗi successor 1 header).

### 4. Emit layer

- **gf-sales + gf-purchase (Java)**: `OncePerRequestFilter` đăng ký global cho path prefix `/api/v1/**` + `/api/v2/**`. Filter inject headers BEFORE response written. Lý do: KHÔNG modify từng controller — additive only (per Critical Rule #11 NO-CODE + Pre-Edit Recognition FM-017 ADDITIVE).
- **agg-garage-graph (Node)**: Express middleware đặt sau auth, trước route handlers. Khi BFF gọi downstream BE V2/V3 và relay response → middleware preserve original `Deprecation`/`Sunset`/`Link` headers (không strip).

### 5. Logging

Mỗi V1/V2 request trigger structured log warning:

```json
{
  "level": "WARN",
  "event": "deprecated_api_called",
  "api_version": "v2",
  "endpoint": "/api/v2/service-orders",
  "caller_user_agent": "<request UA>",
  "caller_ip": "<masked>",
  "tenant_id": "<from header>",
  "timestamp": "<ISO 8601>"
}
```

Dashboard observability: track call rate per (version, endpoint) để biết khi nào safe remove V1/V2.

### 6. Cross-boundary contract enforcement

- 3 boundary cùng đọc ADR-013 trong CI lint hook (TBD: `scripts/validate-deprecation-headers.sh` check filter/middleware tồn tại + format match).
- Bilateral ratification trong `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` §X cross-boundary contracts.

## Consequences

**Positive:**

- **Standards-aligned**: RFC 8594 + IETF Deprecation draft + RFC 5988 → external consumers (ERP bridge, partners) dễ parse.
- **Single uniform format** across 3 boundary → mobile/web client viết 1 parser tái dùng (vs 3 parsers).
- **Observability built-in** qua log warning → planning V1/V2 removal data-driven (call rate metric).
- **Migration path explicit** qua `Link: rel="successor-version"` → consumer auto-discover V3 endpoint.
- **No business code modification** (additive only) — filter/middleware layer; per Pre-Edit Recognition FM-017.

**Negative:**

- **Response size tăng \~120 bytes per V1/V2 response** (3 headers). **Mitigation**: V3 endpoint không có headers → traffic chính (V3) không impact.
- **Sunset date phải coordinate cross-boundary** — không boundary nào unilateral set date. **Mitigation**: PKG entry criterion #3 lock date trước khi DEV.
- **Filter/middleware boundary cần test riêng** — không phải controller logic. **Mitigation**: Integration test `DeprecationHeaderIT.java` (gf-sales + gf-purchase) + `deprecation-middleware.test.ts` (agg-garage-graph) verify header presence + format.

**Risks:**

- **V2 client cũ không parse** `Link` **header** → continue use V2 sau sunset. **Mitigation**: post-sunset return `410 Gone` (forced migrate); observability log identify lingering callers.
- **Successor URL drift** (V3 endpoint rename) → `Link` header stale. **Mitigation**: V3 URL change = breaking, requires major version bump (V4) — không rename in-place.
- **Cross-boundary header format diverge** nếu 3 team không sync. **Mitigation**: CI lint hook + bilateral ratification trong INTEG contracts + ADR-013 as single source.

**Trade-off accept:** chấp nhận \~120 bytes overhead per V1/V2 response + cross-boundary coordination cost cho sunset date → đổi lấy uniform standards-aligned signaling + observability + explicit migration path.

## References

- [TECHSTACK.md](../TECHSTACK.md)
- [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- HLDs: [gf-sales-HLD.md](../hld/gf-sales-HLD.md), [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md), [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md)
- API docs: [gf-sales-api.md](../api/gf-sales-api.md), [gf-purchase-api.md](../api/gf-purchase-api.md), [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md)
- Integration contract: [INTEG-BFF-agg-garage-graph.md](../integrations/INTEG-BFF-agg-garage-graph.md)
- Work package: `Execution/work-packages/PKG-W01-backend-p0.md` §2.2 TD-BE-001
- Change Request: `Tracking/CHANGE-REQUESTS.md` `CR-1779876780` APPROVED 2026-05-27
- Related ADRs: ADR-001 (microservice landscape), ADR-002 (GraphQL aggregator pattern), ADR-009 (JPA no relationship mapping — `@Version` scalar column compatible)
- External standards:
  - [RFC 8594 — Sunset HTTP Header](https://datatracker.ietf.org/doc/html/rfc8594)
  - [draft-ietf-httpapi-deprecation-header-02](https://datatracker.ietf.org/doc/draft-ietf-httpapi-deprecation-header/)
  - [RFC 5988 — Web Linking](https://datatracker.ietf.org/doc/html/rfc5988)
  - [RFC 7231 §7.1.1.1 — HTTP-date format](https://datatracker.ietf.org/doc/html/rfc7231#section-7.1.1.1)
  - [IANA Link Relations Registry](https://www.iana.org/assignments/link-relations/link-relations.xhtml)
- Bilateral sign-off (PROPOSED → ACCEPTED khi 3 boundary leads ack):
  - [ ] `agg-garage-graph` lead — confirm middleware preserve header passthrough

  - [ ] `gf-sales` lead — confirm `OncePerRequestFilter` implementation

  - [ ] `gf-purchase` lead — confirm `OncePerRequestFilter` implementation

  - [ ] Architecture Authority — formal sign-off → status ACCEPTED

## Change Log

| Date | Version | Author | Description |
| --- | --- | --- | --- |
| 2026-05-27 | 1 | Architecture Authority (draft via Delivery Authority + CR-1779876780 APPROVED) | Initial ADR draft per scope-extend approval `STATE.wave_scope.modify_allowlist[0]` + CR-1779876780 APPROVED MAJOR (Business + Delivery consolidated). Format 3 headers (Deprecation + Sunset + Link) align RFC 8594 + IETF Deprecation draft + RFC 5988. Cross-boundary contract cho gf-sales + gf-purchase + agg-garage-graph. Status PROPOSED — pending bilateral sign-off 3 boundary leads + Architecture Authority. |
