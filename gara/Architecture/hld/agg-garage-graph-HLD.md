---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 13
tier: T1
owner_authority: Architecture Authority
boundary: agg-garage-graph
last_reviewed: "2026-07-08"  # v13 W04 cascade v7.54 AP-Q1 removal — §1 AP callout 7→6 op passthrough + gỡ `searchAccountingPeriods` khỏi enumeration; §1 AP footer arithmetic 23+7=30 → 23+6=29 (AP slice standalone); §1 OB footer 23+7+6=36 → 23+6+6=35. Pair với agg-garage-graph-graphql.md v7.59 (§3g.5 arithmetic self-drift fix) + INTEG-FE-garage-web-agg-garage-graph.md v18. v12 W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset). §1 Opening Balance callout: 7 ops → 6 ops, xoá `getOpeningBalanceTemplate`, tổng DESIGN scope 37 → 36; §1b Cache strategy bullet: thay "Template signed URL from getOpeningBalanceTemplate regenerated per call per W04-2 semantics" bằng "Template .xlsx không đi qua BFF — FE bundle static asset từ Product/ux/assets/". Không đụng Product docs. v11 W04 fix — Add explicit §1b Performance & Scale section for opening-balance module (6/6 items covered: expected load, pagination passthrough + request-size guard, index N/A stateless, no BFF-side cache decision, N+1 denormalized at backend, tenant fairness stateless). Main-agent post-hoc verification catch: v10 §1 callout was content-only; v11 promotes to a named "Performance & Scale" section satisfying Reviewer G12 shape. v10 W04 — §1 callout thêm module opening-balance.
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/agg-garage-graph-graphql.md
  - ../decisions/ADR-014-insurance-settlement-ownership.md
  - ../decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md
  - ../decisions/ADR-018-inventory-v2-bulk-import-pattern.md
  - ../decisions/ADR-019-accounting-period-on-gf-accounting.md
  - ../decisions/ADR-020-stock-ledger-daily-snapshot.md
  - ../decisions/ADR-021-ob-period-lock-cross-boundary.md
  - ../decisions/ADR-022-ob-import-all-or-nothing-bulk.md
---

# HLD — `agg-garage-graph`

## 1. Overview

`agg-garage-graph` là **GraphQL aggregation gateway** cho Garage app (web + mobile). Stateless edge — **Node.js 22** + Apollo Server 4 + Express, gom **16 downstream REST service** thành một GraphQL schema duy nhất cho client. Không own database, không có persistence; mọi resolver là **passthrough/orchestration** qua `PassthroughService` + `ApiClient` (Axios) với header propagation.

**Trách nhiệm:**
- GraphQL facade: schema composition từ **26 module** dynamic load (`src/graphql/modules/*`).
- Passthrough downstream: chuẩn hoá GET/POST/PUT/PATCH/DELETE + multipart upload + raw/stream download.
- Header propagation: forward `Authorization`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`, `Garage-App-Version`.
- Upload/download adapter: multer memoryStorage cho GraphQL multipart, raw routes mount ngoài GraphQL cho file binary.
- BI embedding: Superset guest token query + proxy path ngoài allowlist.
- Observability: OpenTelemetry init trước Express, Prometheus `/metrics`, GraphQL operation logging.
- Diagnostic: `/health`, `_health`, `_healthCheck`, `_ping`, `_heartbeat`.

**Owned epic**: cross-cutting infrastructure — không map epic Product. Boundary là **single GraphQL edge** cho client Garage.

> **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, ADR-014)**: thêm 8 operation passthrough (module `gf-accounting/insurance-dossiers` + `gf-sales/service-orders`/`dashboard`) — `getInsuranceDebtWidget`, dossier CRUD/export/download, `recordInsurancePayment` (xem [graphql §3c](../api/agg-garage-graph-graphql.md)). Write 5 khoản điều chỉnh BH = additive trên `updateServiceOrderV3` (KHÔNG op `applyInsuranceAdjustments` riêng — đã gỡ, Blocker 2). Giữ nguyên discipline: passthrough P1 (widget P2 compose ở gf-sales), KHÔNG persistence/business logic, forward header `Authorization`/`X-Tenant-Id`/`X-Branch-Id`; `Upload` scalar cho scan biên bản (③).
>
> **Inventory V2 catalog-v2 (DESIGN — EP-INVENTORY-CATALOG only, ADR-017/018, R8 refinements 2026-06-24)**: thêm 1 module `gf-inventory/catalog-v2` với 23 operation passthrough (xem [graphql §3d](../api/agg-garage-graph-graphql.md)): MaterialGroup CRUD + tree, InternalProduct CRUD + history + SKU mapping + ĐVT quy đổi + attachment + bulk import (verify-import/import per ADR-018 — BFF enforce row cap 500 trước khi forward) + export, SkuSearch (lookup legacy product), `listUnits` (R8 D-A/E rename — resolve qua **gf-erp-mdm** catalog `directory=UNIT` per Q3+R8 — leverage existing enrichment pattern BR-AGG-GARAGE-GRAPH-001); brand enrichment qua `directory=BRAND` (R8 D-C — new). Discipline: passthrough only, no persistence; enrichment pattern cho `mainUnitDisplayName` + `brandDisplayName` + material group name (shared GfErpMdmCatalogClient + 5min cache); mobile **out of scope** (UX-FLOW-INVENTORY-CATALOG Web GMS only). Downstream list (§4.2) thêm note "gf-inventory: catalog-v2 (V2 endpoints)". **AP slice (kỳ kế toán) deferred to gf-accounting wave** per Delivery Authority boundary correction 2026-06-23 (R4 strip).
>
> **Accounting Period (DESIGN — EP-INVENTORY-ACCOUNTING-PERIOD, ADR-019, Delivery Authority boundary correction 2026-06-23, CLAUDE override 2026-06-24)**: thêm 1 module `gf-accounting/accounting-period` với **6 operation passthrough** (xem [graphql §3e](../api/agg-garage-graph-graphql.md)): getAccountingPeriodTree (cap 500 BFF defense-in-depth → HTTP 413), getAccountingPeriod, checkAccountingPeriodLock (30s LRU cache, advisory), createAccountingPeriod (autoGenerateChildren atomic per BR-AP-009), updateAccountingPeriod (mutable fields per BR-AP-016, status toggle OPEN⇄CLOSED), deleteAccountingPeriod (3-guard). AP-Q1 `searchAccountingPeriods` **removed 2026-07-08 v7.54** per user quannn — FEAT-AP-LIST dùng `getAccountingPeriodTree` (single mapping). Resolver discipline: passthrough only, no persistence; enrichment parentName/parentBreadcrumb embedded từ backend (không N+1); lock-check cache scope `(tenantId, date)` mandatory. Mobile **out of scope** (UX-FLOW-INVENTORY-ACCOUNTING-PERIOD line 31 Web GMS only). Module mới passthrough sang `gf-accounting` `/api/v2/accounting-periods/*` + `/protected/v1/accounting-periods/lock-check` — KHÔNG sang `gf-inventory` mặc dù BA Product frontmatter vẫn ghi `boundary: gf-inventory` (OQ1). Tổng operation count batch DESIGN (AP slice standalone, không tính OB): catalog-v2 (23) + accounting-period (6) = **29 operations**.
>
> **Opening Balance + Stock Ledger foundation (DESIGN — EP-INVENTORY-OPENING-BALANCE, W04, ADR-020/021/022)**: thêm 1 module `gf-inventory/opening-balance` với **6 operation passthrough** (xem [graphql §3g](../api/agg-garage-graph-graphql.md)): `searchOpeningBalances`, `verifyImportOpeningBalances` (BFF defensive cap 500 → `ERR-INV-048`), `importOpeningBalances` (idempotency key `X-Idempotency-Key: OB-IMPORT-{tenantId}-{uuid}` forwarding), `updateOpeningBalanceLine`, `deleteOpeningBalanceLine`, `deleteOpeningBalanceLines` batch. Resolver discipline: **pure passthrough** — no BFF business logic; JWT + `X-Tenant-Id` forwarding; no local caching (lock-check cache lives in gf-inventory per ADR-021). Naming Registry canonical → `See gf-inventory-api.md §5.1`. Downstream: `gf-inventory /api/v2/opening-balances/*` (W04-1 + W04-3..W04-7 — W04-2 template removed 2026-07-06 per Q2 fix). Cross-boundary lock-check to `gf-accounting` happens **inside gf-inventory**, NOT at BFF (ADR-021 §Decision — REST advisory pattern reuse); BFF layer stays stateless. **Mobile scope PARTIAL** — only `searchOpeningBalances` consumed by mobile (view-only per UX-FLOW-INVENTORY-OPENING-BALANCE §29). Total operation count batch DESIGN: catalog-v2 (23) + accounting-period (6) + opening-balance (6) = **35 operations** (accounting-period cascade v7.54 AP-Q1 removal — sync với §3e.5). **Template `.xlsx`** — KHÔNG có GraphQL op, FE bundle static asset trực tiếp từ `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` (BA/PO chốt 2026-07-06). `FEAT-INV-MOBILE-MENU` (mobile hub) is pure client-side — zero BFF impact.

### 1b. Performance & Scale — Opening Balance module (W04, ADR-020/021/022)

> Scoped section covering W04 additions only (opening-balance §3g module + related passthrough). §6 Quality Attributes and legacy module perf remain the authoritative baseline for other modules.

1. **Expected load** — OB is not a hot-path (baseline seed activity, 1 request/tenant/hour avg per gf-inventory HLD §6b.1). BFF QPS target ≤ 10 QPS/tenant for `searchOpeningBalances` (list view); ≤ 1 QPS/tenant for import/edit/delete write ops. BFF p95 target ≤ 50ms per resolver hop (passthrough overhead + JWT verify + header propagation only — no business logic). Wizard `verifyImportOpeningBalances` p95 ≤ 200ms BFF overhead (dominated downstream by gf-inventory lock-check batch — see gf-inventory §6b.1 ≤ 2s end-to-end for 500 rows).
2. **Pagination strategy** — Passthrough only. `searchOpeningBalances` forwards `input.{page, size, sort}` to W04-1 as-is; **BFF does NOT re-paginate, does NOT aggregate across pages**. Client receives the same `PagedOpeningBalanceData { content, totalElements, totalPages, page, size, aggregates }` shape emitted by gf-inventory (per §3g.1 SDL). Cursor vs offset choice lives entirely in the backend (per gf-inventory §6b.2). BFF cap: 500-row defense on `verifyImportOpeningBalances`/`importOpeningBalances` `input.rows.length` (per §3g.3 resolver discipline — throws `ERR-INV-048` before forward per ADR-018/022 3-layer defense pattern) — this is not "pagination" in the read sense; it is a **request-size guard** to protect downstream + limit BFF JSON parse memory (≈500KB body worst-case).
3. **Index list** — **N/A** at BFF layer (stateless edge — no DB, no persistence per §1 Overview and Critical Rule §5.1). All indexes live in gf-inventory `dev_gf_inventory` schema (see gf-inventory §6b.3 for the 9 tenant-prefixed indexes on `opening_balance_line` + `inventory_stock_ledger`). BFF forbidden from caching or persisting per §7 baseline discipline.
4. **Cache strategy** — **Explicit "no BFF-side cache" decision** for W04 module. Lock-check LRU cache lives in gf-inventory boundary per ADR-021 §Decision C (scope `(tenantId, date)`, Caffeine 30s TTL) — putting a mirror cache at BFF would double the invalidation surface without measurable benefit (BFF adds ≤ 5ms hop to backend; backend already fast-path cached). No response cache for `searchOpeningBalances` — data-freshness required for OB list per BR-OB-014 (dashboard read-heavy but low absolute QPS makes cache unwarranted). Template `.xlsx` không đi qua BFF — FE bundle static asset trực tiếp từ `Product/ux/assets/` (BA/PO chốt 2026-07-06). BFF W04 module còn 6 ops (đã bỏ `getOpeningBalanceTemplate`). Contrast: catalog-v2 module DOES cache via `GfErpMdmCatalogClient` 5min for unit/country enrichment (§3d.3) — different pattern because that's static reference data, not per-tenant hot state.
5. **N+1 avoidance** — **N/A specifically for W04 module** because the OB list response is already denormalized at the backend (`productName`, `warehouseName`, `mainUnitCode` snapshot columns in `opening_balance_line` per gf-inventory §6b.5 + data-model §4b.2). Resolver does NOT need `DataLoader` for OB entities — one forward = complete response. Contrast: catalog-v2 module DOES use batch `DataLoader` for `mainUnitDisplayName`/`originDisplayName` enrichment via shared `GfErpMdmCatalogClient` (§3d.3 + `INTEG-EXT-gf-inventory §13a.4`). W04 opening-balance module inherits that shared infrastructure but does NOT invoke it (no display-name enrichment needed on OB response — display names already denormalized at import time per ADR-020 design).
6. **Tenant fairness** — BFF is stateless (§1 Overview) so no per-tenant queue/quota state exists here; fairness enforced at the layers with state (gf-inventory Redisson lock per-key + circuit breaker per-caller per gf-inventory §6b.6). BFF forwards `X-Tenant-Id` header transparently; downstream isolation is authoritative. **W04-M2 idempotency-key** (`X-Idempotency-Key`) is forwarded as a required argument (per §3g.3 resolver discipline) — this is a per-tenant retry-safety mechanism, not fairness, but bounds the amplification factor if a tenant retries a botched import (dedup 24h at gf-inventory `processed_events`). No rate-limiter added at BFF for W04 — deferred as OB is not hot-path (soft flag S-W04-2 in `INTEG-EXT-gf-inventory.md §13b.7`); if future load-test proves need, Node.js `express-rate-limit` per-`X-Tenant-Id` at the Express middleware layer would be the intervention point.

## 2. Component Diagram (C4 Level 3)

```
┌────── agg-garage-graph  (Node 22 · Apollo Server 4.9.5) ──────┐
│  ┌────────────────────────────────────────────────┐           │
│  │ Express (PORT 4123)                            │           │
│  │  requestId · helmet · CORS(*) · body 30mb      │           │
│  └───────────────────────┬────────────────────────┘           │
│  ┌───────────────────────▼──────┐ ┌───────────────┐           │
│  │ processUploads (multer)      │ │ Apollo Srv 4  │           │
│  │  Upload scalar · ops+map     │ │ /graphql ·    │           │
│  │                              │ │ /playground   │           │
│  └──────────────┬───────────────┘ └───────┬───────┘           │
│  ┌──────────────▼────────────────────────▼───────┐            │
│  │ Schema composition (mergeTypeDefs+Resolvers)  │            │
│  │  26 modules: campaign·catalog·dashboard·      │            │
│  │  booking·service-orders[-v3]·customer·        │            │
│  │  employees·mdm·order·purchase·quotation·      │            │
│  │  voucher·settlements·…                        │            │
│  └──────────────────────┬─────────────────────────┘           │
│  ┌─────────────────────▼───────┐ ┌───────────────┐            │
│  │ PassthroughService+ApiClient│ │ Raw download/ │            │
│  │ (Axios) · header propagate  │ │ export · Sup. │────────────┼─► Superset (BI proxy + guest token)
│  │  ApiClientError→ErrorUnion  │ │ proxy         │            │
│  └──────────────┬──────────────┘ └───────────────┘            │
│  /health · /metrics (prom-client) · OTel (OTLP)               │
└────────────────┴──────────────────────────────────────────────┘
                  ▼  16 downstream REST (PassthroughService)
   gf-sales · gf-purchase · gf-inventory · gf-erp-mdm ·
   gf-customer · gf-marketing · gf-notification ·
   gf-accounting · gf-hrms · gf-system · policy-agent ·
   ct-saas-tenant · ct-file-storage · ac-payment-gateway ·
   cp-cms-index           [Stateless — no DB · no Kafka]
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Apollo Server 4 + dynamic module discovery | Mỗi domain tự own schema/resolver trong `modules/*/index.ts`; gateway không cần biết trước | TECHSTACK §gateway |
| Stateless gateway, KHÔNG own DB | Gateway chỉ orchestrate; thêm persistence cần ADR riêng — vi phạm boundary | open item GARAGE-GRAPH-002 |
| `PassthroughService` mandatory cho mọi resolver | Chuẩn hoá header propagation + error union; resolver tự gọi Axios sẽ mất auth/trace | TECHSTACK §HTTP client |
| Multer `memoryStorage` cho upload | Đơn giản hoá multipart parsing; trade memory để tránh disk I/O | open item GARAGE-GRAPH-005 |
| Superset proxy theo path allowlist (`checkPath`) | Path không thuộc business → proxy thẳng sang Superset cho BI iframe | open item GARAGE-GRAPH-007 |
| Union resolver (data \| ErrorResponse) cho mọi mutation | Backend error pass thẳng GraphQL client mà không leak HTTP detail | TECHSTACK §error-handling |
| OpenTelemetry init trước import Express | Bắt buộc cho auto-instrumentation HTTP/Express/GraphQL | TECHSTACK §observability |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| Garage Web / Mobile | GraphQL HTTPS POST | Tất cả business query/mutation |
| Garage Mobile (multipart) | Multipart GraphQL upload | File upload, document feedback |
| Browser (Superset iframe) | HTTPS proxy path | BI dashboard embedding |
| Ops / monitoring | HTTPS GET `/health`, `/metrics` | Healthcheck + Prometheus scrape |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-sales` | Sync REST | Booking, service order, quotation ask, sales customer, vehicle, dashboard |
| `gf-purchase` | Sync REST | Cart, purchase request/order, supplier, quotation, checkout |
| `gf-inventory` | Sync REST | Product, receipt, delivery, stock, period stock, warehouse |
| `gf-erp-mdm` | Sync REST | Catalog, master data lookup |
| `gf-customer` | Sync REST | Customer, segment, interaction, tag, vehicle |
| `gf-marketing` | Sync REST | Campaign, voucher, message template |
| `gf-notification` | Sync REST | Notification list/read state |
| `gf-accounting` | Sync REST | Settlement lifecycle + PDF export |
| `gf-hrms` | Sync REST | Employee, user lifecycle, SSO |
| `policy-agent` | Sync REST | Role, resource, permission |
| `ct-saas-tenant` | Sync REST | Tenant, current user, user search |
| `ct-file-storage` | Sync REST + multipart | File upload/download |
| `ac-payment-gateway` | Sync REST | Payment, user card, methods |
| `gf-system` | Sync REST | Tenant transporter registry (CRUD + search + detail) |
| `cp-cms-index` | Sync REST | Catalog/search dependency (healthcheck wiring only — no resolver calls) |
| Superset | HTTPS proxy + REST | BI dashboard + guest token |

## 5. Data Ownership

**Stateless** — KHÔNG own database, KHÔNG có local persistence. State chỉ tồn tại trong request lifecycle:

| State | Scope | Owner thực tế |
|---|---|---|
| GraphQL schema/runtime config | Source code + env | `agg-garage-graph` |
| Request id + trace context | In-memory per request | `agg-garage-graph` |
| Upload file buffer | In-memory (multer memoryStorage) per upload | tạm giữ → forward `ct-file-storage` |
| Auth token | In-memory per request (forward only) | identity provider |
| Sales/customer/purchase/inventory/marketing/accounting domain data | — | downstream domain service |
| Tenant/employee/policy data | — | `ct-saas-tenant`, `gf-hrms`, `policy-agent` |
| Payment data | — | `ac-payment-gateway` |
| Superset session/dashboard | — | Superset |

**KHÔNG own**: tất cả dữ liệu nghiệp vụ — gateway chỉ thấy PII/payment-adjacent payload trong-memory, không log/cache.

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| GraphQL passthrough p95 (single resolver) | ≤ 250ms (gateway overhead, không tính downstream) |
| GraphQL aggregate p95 (multi-resolver fan-out) | ≤ 800ms (warm) |
| Upload throughput | ≤ 30 MB/file (`SERVER_LIMIT=30mb`) — ingress phải sync limit |
| Download/export streaming | passthrough binary, không buffer toàn bộ vào memory |
| Default downstream timeout | 60s (`DEFAULT_TIMEOUT=60000`) — phải sync với `API_CLIENT.DEFAULT_TIMEOUT` (open GARAGE-GRAPH-007) |
| Concurrent upload | giới hạn theo memory pod — multer memoryStorage có risk khi N×30MB |
| Multi-replica | stateless full — HPA scale theo CPU/RPS, không cần shared state |
| Healthcheck depth | `_healthCheck` chỉ kiểm `gfPurchaseApi` + `cpCmsIndexApi` (open GARAGE-GRAPH-002 — mở rộng full T1 downstream) |
| Body / upload limit | 30 MB (sync với ingress) |
| Introspection | bật khi `NODE_ENV ≠ production` only |
| Metrics | `prom-client` default + GraphQL operation duration (custom business metric chưa có — open) |
| Runtime | Node.js 22, Apollo Server 4.9.5, Express 4.18.2 |

## 7. Forbidden Actions

- ❌ Thêm database / repository / persistence layer cho gateway (vi phạm constraint stateless — cần ADR riêng nếu muốn).
- ❌ Resolver gọi `axios` / `fetch` trực tiếp bypass `PassthroughService` (BR-AGG-GARAGE-GRAPH-004 token propagation; BR-AGG-GARAGE-GRAPH-005 error handling — mất header auth + correlation; ApiClientError union không kích hoạt).
- ❌ Log raw `Authorization` / cookie / `x-api-key-feedback` / card detail / file content (BR-AGG-GARAGE-GRAPH-004 — gateway thấy hết PII + payment-adjacent payload).
- ❌ CORS `origin="*"` + `credentials=true` ở **production** (XSRF risk — open GARAGE-GRAPH-003 phải siết theo prod topology).
- ❌ `helmet` `frameguard=false` áp dụng cho path **business** (chỉ cho Superset iframe — tách rõ middleware chain).
- ❌ Thêm path mới mà không update `checkPath` allowlist (path mới sẽ bị Superset proxy nhầm — leak request).
- ❌ Tăng `SERVER_LIMIT` mà không sync ingress body limit (memory exhaustion: N×limit MB pod).
- ❌ Mount route download/export ngoài GraphQL mà không enforce auth tương đương resolver (open GARAGE-GRAPH-004).
- ❌ Tạo module mới không export `typeDefs` + `resolvers` từ `index.ts` (dynamic loader sẽ skip silent).
- ❌ Trả `/health` body chứa env detail ở production (`/health` env exposure chỉ cho phép non-production).

## 8. References

- **TECHSTACK**: §gateway, §HTTP client, §observability, §error-handling
- **API spec**: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) — GraphQL schema surface 26 module + 11 REST endpoints, request context, header propagation, error union.
- **Workflows**:
  - [garage-graph-gateway-request-flow.md](../workflows/garage-graph-gateway-request-flow.md) — 4 sub-flow: GraphQL passthrough, multipart upload, raw download/export, Superset proxy.
- **Business rules**: BR-AGG-GARAGE-GRAPH-001..006 (6 rules: data enrichment, status normalization, multi-version routing, token propagation, error handling, parallel fetching) — in KG `agg-garage-graph.knowledge-graph.yaml`
- **KG**: [agg-garage-graph.knowledge-graph.yaml](../../Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml) — executable spec; synced với source code 2026-05-19
- **Cross-link HLD** (downstream):
  - [gf-sales-HLD.md](gf-sales-HLD.md), [gf-purchase-HLD.md](gf-purchase-HLD.md), [gf-inventory-HLD.md](gf-inventory-HLD.md), [gf-erp-mdm-HLD.md](gf-erp-mdm-HLD.md)
  - [gf-customer-HLD.md](gf-customer-HLD.md), [gf-marketing-HLD.md](gf-marketing-HLD.md), [gf-notification-HLD.md](gf-notification-HLD.md), [gf-accounting-HLD.md](gf-accounting-HLD.md)
  - [gf-hrms-HLD.md](gf-hrms-HLD.md), [gf-system-HLD.md](gf-system-HLD.md), [agg-sso-graph-HLD.md](agg-sso-graph-HLD.md) (sister gateway cho SSO)


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-08 | v13 | **W04 cascade `agg-garage-graph-graphql.md` v7.54 AP-Q1 removal vào §1 callout**. v7.54 (2026-07-08) xoá GraphQL op `searchAccountingPeriods` (AP-Q1) khỏi §3e Accounting Period module per user quannn — FEAT-AP-LIST chuyển sang `getAccountingPeriodTree` (AP-Q2, single mapping). HLD v12 chưa cascade → §1 AP callout vẫn ghi "**7 operation passthrough**" + `searchAccountingPeriods` trong enumeration + footer arithmetic "23+7=30 operations" (AP slice); §1 OB callout footer "23+7+6=36 operations" (total DESIGN). Sửa 3 điểm §1: (a) AP callout op count "7 operation passthrough" → "6 operation passthrough"; xoá `searchAccountingPeriods,` khỏi enumeration; thêm inline note "AP-Q1 `searchAccountingPeriods` removed 2026-07-08 v7.54 per user quannn — FEAT-AP-LIST dùng `getAccountingPeriodTree` (single mapping)". (b) AP callout footer "catalog-v2 (23) + accounting-period (7) = 30 operations" → "catalog-v2 (23) + accounting-period (6) = 29 operations" (AP slice standalone, không tính OB). (c) OB callout footer "catalog-v2 (23) + accounting-period (7) + opening-balance (6) = 36 operations" → "catalog-v2 (23) + accounting-period (6) + opening-balance (6) = 35 operations" + inline note "(accounting-period cascade v7.54 AP-Q1 removal — sync với §3e.5)". Pair với `agg-garage-graph-graphql.md v7.59` (§3g.5 arithmetic self-drift fix cùng batch, footer 36→35 ops) + `INTEG-FE-garage-web-agg-garage-graph.md v18` (§3.6b UI mapping bỏ AP-Q1 fallback row "Đổi filter năm"). **KHÔNG đụng**: §1b Performance & Scale, §2-§8, §depends_on, Product docs, Change Log entries cũ (audit trail). v12 → v13. |
| 2026-07-06 | v12 | **W04 Q2 fix — BA/PO chốt template `.xlsx` do FE quản lý (bundled static asset)**. Audit độc lập phát hiện Q2 còn treo. BA/PO chốt: xoá endpoint `getOpeningBalanceTemplate` khỏi BFF module opening-balance; FE bundle `Product/ux/assets/Mẫu Import tồn đầu kỳ.xlsx` (BA đã tạo) vào `frontend/gf-gms-web/src/assets/`, render qua `<a href={bundled_url} download>`. Sửa 2 điểm ở §1 Opening Balance callout: (a) count "7 operation passthrough" → "6 operation passthrough"; xoá `getOpeningBalanceTemplate` khỏi ops list; đổi range downstream "W04-1..W04-7" → "W04-1 + W04-3..W04-7 — W04-2 template removed 2026-07-06 per Q2 fix"; tổng DESIGN scope "37 operations" → "36 operations" (opening-balance 7 → 6); thêm note ngắn "Template `.xlsx` — KHÔNG có GraphQL op, FE bundle static asset trực tiếp từ Product/ux/assets/...". (b) §1b Cache bullet #4: thay câu "Template signed URL from `getOpeningBalanceTemplate` is regenerated per call per W04-2 semantics (BFF straight-passthrough — no store)" bằng "Template `.xlsx` không đi qua BFF — FE bundle static asset trực tiếp từ `Product/ux/assets/` (BA/PO chốt 2026-07-06). BFF W04 module còn 6 ops (đã bỏ `getOpeningBalanceTemplate`)". Pair với `gf-inventory-api v38` + `agg-garage-graph-graphql v7.47` + `INTEG-FE-garage-web-agg-garage-graph v17` + `garage-web-HLD v11` + `ADR-022 v4`. **KHÔNG đụng Product docs**. v11 → v12. |
| 2026-07-06 | v11 | **W04 fix — add missing §Performance & Scale section (main-agent post-hoc verification catch)**. v10 introduced the §1 opening-balance callout with perf-related mentions scattered throughout (BFF cap 500, no BFF caching, denorm response, stateless) but did not group them under an explicit "Performance & Scale" heading — Reviewer G12 shape gate requires a named section covering ≥5/6 items. Add §1b covering all 6 items scoped to the W04 opening-balance module: (1) expected load — 10 QPS/tenant list, 1 QPS write, p95 ≤ 50ms passthrough hop; (2) pagination — pure passthrough of `input.{page,size,sort}` + 500-row request-size guard on verify/import; (3) index list — **N/A** stateless BFF; (4) cache — explicit "no BFF-side cache" decision for OB (lock-check lives in gf-inventory per ADR-021, contrast catalog-v2 which does cache via GfErpMdmCatalogClient); (5) N+1 — **N/A** for OB (denorm at backend per data-model §4b.2), contrast catalog-v2 DataLoader pattern; (6) tenant fairness — stateless BFF, enforced downstream (gf-inventory Redisson + circuit breaker), idempotency-key forwarded, no BFF rate-limit W04 (deferred). No other file touched. v10 → v11. |
| 2026-07-06 | v10 | **W04 — §1 callout thêm module `gf-inventory/opening-balance`** (7 ops passthrough, pure passthrough discipline, no BFF caching, idempotency-key forwarding, 500-cap defense). Mobile PARTIAL view-only (`searchOpeningBalances` only). Total DESIGN scope count 30 → 37. `FEAT-INV-MOBILE-MENU` zero BFF impact (pure client-side). `depends_on` thêm ADR-020/021/022. v9 → v10. |
| 2026-06-24 | v9 | **R8 — Inventory V2 catalog-v2 callout sync (uom→unit + brand enrichment + nature English keys + image_url)** — §1 Inventory V2 callout updated: (A) `ListUnitsOfMeasure` resolver name → `listUnits` + `directory=UNIT_OF_MEASURE` → `directory=UNIT` (R8 D-A/E); (B) note nature enum English keys via SDL (R8 D-B); (C) **new brand enrichment** `brandDisplayName` via `directory=BRAND` (R8 D-C — shared GfErpMdmCatalogClient + 5min cache với UNIT lookups); (D) implicit — `imageUrl` field passthrough as S3 path string in SDL (R8 D-D, no resolver-side processing); discipline unchanged (passthrough only, no persistence, no business logic). Pair: agg-garage-graph-graphql v7.13 + gf-inventory-HLD v7 + gf-inventory-api v10 + gf-inventory-data-model v10 + INTEG-EXT-gf-inventory v5. v8 → v9. |
| 2026-06-24 | v8 | **+§1 Accounting Period module callout (DESIGN — `gf-accounting/accounting-period`, ADR-019, Delivery Authority boundary correction 2026-06-23, CLAUDE override 2026-06-24)** — re-introduce AP module nhưng namespace `gf-accounting` (không phải `gf-inventory` như v6 trước R4 strip). 7 operation passthrough (AP-Q1..Q4 + AP-M1..M3) sang gf-accounting `/api/v2/accounting-periods/*` + `/protected/v1/accounting-periods/lock-check`. Tree cap 500 BFF defense-in-depth. Lock-check 30s LRU cache scope `(tenantId, date)`. Mobile out of scope (UX-FLOW Web GMS only). Tổng operation count batch DESIGN: 23 (catalog-v2) + 7 (AP) = 30. `depends_on` +ADR-019. Discipline unchanged: passthrough only, no persistence, no business logic. Detail SDL + ops table + resolver discipline trong [graphql §3e](../api/agg-garage-graph-graphql.md). v7 → v8. |
| 2026-06-23 | v7 | **R4 — Strip AP scope (Boundary correction — AP moved to gf-accounting wave per Delivery Authority decision 2026-06-23)** — §1 callout: gỡ module `gf-inventory/accounting-period` + 7 ops (V2-Q10..V2-Q13, V2-M16..V2-M18) + cache `checkAccountingPeriodLock` mention. Operation count 30 → 23 (catalog-v2 only). `depends_on` remove ADR-019. Catalog-v2 module + UoM enrichment (Q3) + bulk-import (ADR-018) intact. |
| 2026-06-23 | v6 | **Inventory V2 catalog-v2 + AP slice (DESIGN — ADR-017/018/019)**: §1 callout — thêm 2 module `gf-inventory/catalog-v2` + `gf-inventory/accounting-period` với 30 operation passthrough (xem [graphql §3d](../api/agg-garage-graph-graphql.md)); BFF enforce row cap 500 cho bulk import (ADR-018); enrichment pattern cho UoM display name + material group name (BR-AGG-GARAGE-GRAPH-001); `ListUnitsOfMeasure` resolve qua gf-erp-mdm `directory=UNIT_OF_MEASURE` (Q3); `checkAccountingPeriodLock` cache local 30s (advisory). Mobile **out of scope** (UX-FLOW Web GMS only). Discipline giữ nguyên: passthrough only, no persistence, no business logic. depends_on thêm 3 ADR. |
| 2026-06-04 | v5 | **Reconcile (Blocker 2, verified vs committed HEAD agg graph)**: §1 callout — gỡ `applyInsuranceAdjustments` (KHÔNG có trong source); 9→8 operation passthrough; write 5 khoản điều chỉnh BH = additive trên `updateServiceOrderV3`. Đồng bộ contract §3c v6. |
| 2026-05-30 | v4 | **Insurance Settlement passthrough (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014)**: §1 overview callout — 9 GraphQL operation mới (insurance adjustments, debt widget, dossier CRUD/export/download, record payment) passthrough P1/P2 sang gf-accounting + gf-sales (xem graphql §3c). Giữ discipline no-persistence/no-business-logic, forward header tenant/branch, `Upload` scalar cho scan. depends_on thêm ADR-014. Không đổi §2-§8. |
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (Express → uploads/Apollo → Schema 26 modules → PassthroughService+ApiClient) + connector `┬`/`▼`; **ServiceClients fan-out** 16 downstream REST (PassthroughService) ở đáy + side-exit `───┼─►` Superset (BI proxy + guest token); stateless (no DB · no Kafka) ở footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v6 (source-verified): (GAP-1) sửa module count ~33→26 (verified từ source modules/); (GAP-2) thêm Node.js 22 vào Overview + diagram + QA Runtime; (GAP-3) thêm gf-system vào outbound deps + diagram downstream (16 services, không phải 14); (GAP-4) thêm BR-AGG-GARAGE-GRAPH-004/005 citations vào §7 Forbidden Actions + Business rules line + KG link vào §8; (GAP-6) sửa Apollo dep 26 modules; (GAP-7) thêm Runtime row; (GAP-8) thêm gf-system-HLD.md cross-link. |
| 2026-05-07 | v1 | Initial HLD cho `agg-garage-graph`: GraphQL aggregation gateway (Node.js + Apollo Server 4 + Express, port 4123) gom ~33 module dynamic load thành 1 schema cho Garage web/mobile, 14 downstream REST (`gf-sales`, `gf-purchase`, `gf-inventory`, `gf-erp-mdm`, `gf-customer`, `gf-marketing`, `gf-notification`, `gf-accounting`, `gf-hrms`, `policy-agent`, `ct-saas-tenant`, `ct-file-storage`, `ac-payment-gateway`, `cp-cms-index`) qua `PassthroughService` + `ApiClient` (Axios), header propagation (`Authorization`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service`, `Garage-App-Version`), multipart upload + raw download/export, Superset proxy theo `checkPath` allowlist + guest token, OpenTelemetry + Prometheus `/metrics`. Stateless edge — KHÔNG own DB, KHÔNG persistence. Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `workflows/`. |
