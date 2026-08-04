---
type: architecture
artifact_kind: integration-frontend-bff
status: ACTIVE
version: 1
tier: T1
owner_authority: Architecture Authority
boundary_frontend: "{{frontend-boundary}}"
boundary_bff: "{{bff-boundary}}"
last_reviewed: "2026-05-02"
supersedes: "none"
---

# Integration — Frontend (ReactJS) ↔ BFF (Apollo GraphQL)

> Document tích hợp giữa **{{frontend-boundary}}** (ReactJS web app) và **BFF Apollo GraphQL**.
> Browser environment — concerns chính: auth via cookies/JWT, cache normalization, code generation, bundle size.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Frontend boundary | `{{frontend-boundary}}` |
| BFF endpoint | `{{https://api.example.com/graphql}}` |
| Apollo Client version | `{{@apollo/client@3.x}}` |
| Codegen tool | `{{@graphql-codegen/cli}} + plugins` |
| Schema source | `{{path to schema.graphql or introspection URL}}` |
| Generated types path | `{{src/generated/graphql.ts}}` |
| Persisted queries | {{Yes / No}} |
| SSR | {{Yes — Next.js / No — SPA}} |

## 2. Apollo Client Setup

### 2.1 Link chain (order matters)

```
1. errorLink           — handles auth errors, surfaces user-facing toasts
2. retryLink           — retry on network errors only (not GraphQL errors)
3. authLink            — injects auth header / cookie
4. (optional) batchLink — batch multiple operations within 10ms window
5. httpLink            — actual HTTP transport (or splitLink for subscriptions)
6. wsLink              — websocket for subscriptions (if used)
```

Code path: `{{frontend/src/apollo/client.ts}}`

### 2.2 Cache config

```ts
{{
  // typePolicies for normalization
  // pagination policies (relayStylePagination, offsetLimitPagination)
  // custom keyFields for entities without `id`
}}
```

### 2.3 Default options

| Option | Value |
|---|---|
| `defaultOptions.watchQuery.fetchPolicy` | `cache-and-network` |
| `defaultOptions.query.fetchPolicy` | `cache-first` |
| `defaultOptions.query.errorPolicy` | `all` (return both data + errors) |

## 3. Authentication

### 3.1 Auth flow

```
[User] → [Login UI] → POST /auth/login (NOT GraphQL)
                          ↓
                    [BFF sets HttpOnly cookie OR returns JWT]
                          ↓
[Subsequent requests] → [authLink reads cookie/token] → BFF
```

| Thuộc tính | Giá trị |
|---|---|
| Auth method | {{HttpOnly cookie / JWT in header / Hybrid}} |
| Cookie attributes | {{Secure, HttpOnly, SameSite=Strict, Domain=.example.com}} |
| Token storage (if JWT) | **NOT localStorage** (XSS) — use HttpOnly cookie or in-memory |
| Refresh token flow | {{Silent refresh via /auth/refresh, before expiry threshold}} |
| Logout flow | Clear Apollo cache (`client.clearStore()`) + invalidate cookie |

### 3.2 Token expiry handling

```
errorLink detects UNAUTHENTICATED → trigger refresh → retry original op
If refresh fails → redirect to /login + clearStore
```

### 3.3 CSRF protection (cookie-based auth only)

| Thuộc tính | Giá trị |
|---|---|
| Strategy | {{Double-submit cookie / SameSite=Strict + Origin check}} |
| Header sent on mutations | `{{X-CSRF-Token}}` |

## 4. Code Generation Workflow

```bash
{{# Re-run khi BFF schema thay đổi}}
npm run codegen
```

Generates:
- TypeScript types cho mọi GraphQL operation
- Hooks (`useGetOrderQuery`, `usePlaceOrderMutation`)
- Document nodes for use with imperative API

CI gate: `{{npm run codegen-check}}` fails nếu generated files stale.

### 4.1 Operation file convention

```
src/
├── features/
│   └── orders/
│       ├── queries/
│       │   ├── GetOrder.graphql        # operation file
│       │   └── ListOrders.graphql
│       ├── mutations/
│       │   └── PlaceOrder.graphql
│       └── components/
│           └── OrderList.tsx           # imports useListOrdersQuery
└── generated/
    └── graphql.ts                      # codegen output (gitignored if frequently regen)
```

## 5. UI Action ↔ GraphQL Operation Mapping (MANDATORY)

> **Without this table, FE DEV agent cannot code correctly.** See FM-016.
>
> **Coverage requirement**: every actionable UI element (button, link, form submit, swipe action, auto-load on mount, infinite scroll trigger, polling interval, websocket subscription) must have a row here. Cross-check with `Product/ux/design/*.html` mockups — each `<button>`, `<a href>`, `<form>`, `<select onchange>` should resolve to ≥1 row OR be explicitly marked "no GraphQL — local only".

### 5.1 Mapping table

| # | UI Element / Trigger | Screen | User Intent | Pre-conditions | Op Type | Op Name (codegen) | Variables Mapping | Loading UX | Success Handler | Error Handlers | Cache Effects | A11y |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `[data-testid="place-order-btn"]` | `Checkout` | Submit cart → create order | Cart non-empty, payment selected, T&C accepted | Mutation | `PlaceOrder` | `cart.lineItems` → `input.items[]`, `payment.id` → `input.paymentId` | Disable btn + spinner; `aria-busy=true` | Navigate `/orders/{id}`; toast "Order placed"; clear cart | `BAD_USER_INPUT` → inline field errors per `extensions.field`; `PAYMENT_DECLINED` → modal w/ retry; `INTERNAL_SERVER_ERROR` → toast retry button | Optimistic: insert temp order in `ListOrders` cache; on success replace with real id; on error revert | Focus moves to error region or success route |
| 2 | `[data-testid="order-row-{id}"]` (link) | `OrderList` | View order details | Logged in | Query | `GetOrder` | `id` → `$id` | Skeleton in detail panel | Render order detail | `NOT_FOUND` → empty state w/ "Back to list" | `cache-first`; refetched on focus if stale > 60s | Link role; keyboard navigable |
| 3 | `[data-testid="order-list-loadmore"]` (intersect observer) | `OrderList` | Paginate | Has more | Query | `ListOrders` | `cursor: lastEdge.cursor`, `filter`, `limit: 20` | Inline spinner at list end | Append edges to cache via `relayStylePagination` | Network → toast retry; `INTERNAL` → silent log + retry once | Merge into existing connection | `aria-live="polite"` for new items |
| 4 | (auto on mount) | `OrderTracker` | Live status | Order exists, status ∈ {PENDING, IN_PROGRESS} | Subscription | `OrderStatus` | `orderId: $id` | Connected indicator dot | Update cache via `cache.modify`; trigger toast on status change | Reconnect on close; cap retries; show "disconnected" badge after 5 fails | `cache.modify` for the order entity | Announce status change via `aria-live` |
| 5 | `[data-testid="cancel-order-btn"]` | `OrderDetail` | Cancel pending order | `order.status === 'PENDING'`, owner=current user | Mutation | `CancelOrder` | `id` → `$id`, `reason: dropdown.value` | Confirm dialog → btn loading | Toast "Order cancelled"; refetch `GetOrder`; navigate or stay | `FORBIDDEN` → toast "Cannot cancel"; `CONFLICT` (already shipped) → reload state | Optimistic: set `order.status = 'CANCELLING'`; on error revert | Confirm dialog focus trap |
| 6 | (none — local) | `Checkout` | Toggle "Save card" | — | — | — | — | — | — | — | Local component state only — flag NOT GraphQL |

### 5.2 Per-operation deep-dive (for complex flows)

For operations with non-trivial logic (multi-step, optimistic, cross-component), expand here:

#### 5.2.1 `PlaceOrder` (multi-step)

```
[Click Place Order]
   ↓
[Validate cart locally] (client-side schema, NOT a GraphQL call)
   ↓ pass
[Mutation PlaceOrder] (optimistic insert in ListOrders cache)
   ↓
[On success]
   - cache.modify ListOrders → replace temp with real
   - cache.evict cart entity
   - Apollo client.refetchQueries(['UserBalance'])
   - Navigate to /orders/{id}
   ↓
[On error]
   - extensions.code switch (see column "Error Handlers")
   - Revert optimistic insert
   - Re-enable button
```

Component path: `{{frontend/src/features/checkout/CheckoutForm.tsx}}`

Generated hook used: `usePlaceOrderMutation`

### 5.3 Coverage checklist (before coding)

Subagent **MUST** verify before writing component code:

- [ ] Every `<button>` / `<a>` in the design mockups has a row (or "local only" marker)
- [ ] Every `Op Name` in column 7 matches a generated hook (`use{OpName}{Query|Mutation|Subscription}`)
- [ ] Every error code referenced in "Error Handlers" exists in BFF schema's `extensions.code` enum
- [ ] Every cache effect references actual cache fields (not invented)
- [ ] Loading UX matches project's design system loading patterns

If any row is incomplete → STOP, raise `/cr-raise MODERATE` to architect to fill in mapping. Don't guess.

## 6. Cache Normalization

### 6.1 Type policies (custom)

| Type | Strategy |
|---|---|
| `Order` | Default (id-based) |
| `User` | `keyFields: ['id']` (default) |
| `Cart` | `keyFields: false` (singleton — root field cache) |
| `LineItem` | `keyFields: ['orderId', 'sku']` (composite) |

### 6.2 Pagination

| Field | Strategy |
|---|---|
| `Query.orders` | `relayStylePagination(['filter'])` — keyArgs = filter |
| `Query.products` | `offsetLimitPagination(['category'])` |

### 6.3 Optimistic UI

| Mutation | Optimistic response |
|---|---|
| `PlaceOrder` | Yes — show order in list immediately with `__typename + id + status: 'PENDING'` |
| `UpdateProfile` | Yes — patch user in cache |
| `DeleteOrder` | Yes — remove from list |

### 6.4 Cache invalidation

- Use `refetchQueries` for cross-cutting list updates
- Use `update(cache, { data })` for direct cache mutations (preferred)
- Avoid `client.resetStore()` except on logout (kills user UX)

## 7. Subscriptions (WebSocket)

| Thuộc tính | Giá trị |
|---|---|
| Transport | `{{graphql-ws (preferred) / subscriptions-transport-ws (legacy)}}` |
| WebSocket URL | `{{wss://api.example.com/graphql}}` |
| Auth | `connectionParams: { authToken }` (sent on connect) |
| Reconnect strategy | Exponential backoff, max 30s, jitter ±20% |
| Heartbeat | `{{30s}}` |
| Subscriptions used | List in §5 marked Subscription |

## 8. Error Handling

### 8.1 Error categorization

```ts
errorLink:
  ┌─────────────────────────────────────────────────────────────┐
  │ networkError                       → retry / show offline   │
  │ graphQLErrors[].extensions.code:                            │
  │   UNAUTHENTICATED                  → trigger refresh        │
  │   FORBIDDEN                        → toast + log out option │
  │   BAD_USER_INPUT                   → form-level error       │
  │   NOT_FOUND                        → component-level UI     │
  │   INTERNAL_SERVER_ERROR            → toast + Sentry         │
  │   TIMEOUT                          → toast retry button     │
  │   default                          → generic toast          │
  └─────────────────────────────────────────────────────────────┘
```

### 8.2 Per-component error UX

| Pattern | When |
|---|---|
| Inline form error | Validation errors (BAD_USER_INPUT) |
| Toast | Non-blocking actions |
| Full-page error boundary | Critical query fails for whole page |
| Skeleton + retry button | Data fetch fail in widget |

### 8.3 Error boundary integration

`<ErrorBoundary>` catches React errors AND surfaces Apollo errors via context. Reports to Sentry/observability.

## 9. SSR (if applicable)

| Aspect | Strategy |
|---|---|
| Framework | {{Next.js / Remix / None}} |
| Initial data fetch | {{getServerSideProps + Apollo SSR / Next.js App Router fetch}} |
| Cache hydration | `<ApolloHydrationBoundary>` or equivalent |
| Auth on server | {{Cookie forwarded; new Apollo Client per request}} |

## 10. Bundle Size

| Concern | Mitigation |
|---|---|
| `@apollo/client` baseline | ~{{40KB gzipped}} — acceptable |
| `graphql` library | Tree-shake; avoid `graphql/index` re-exports |
| Generated types | Split per feature — avoid single mega-file |
| Operation documents | Use persisted queries → ship hash, not document |
| Codegen plugins | `near-operation-file-preset` to colocate types |

## 11. Performance Targets

| Metric | Target |
|---|---|
| Time to first GraphQL response (post-load) | {{< 300ms}} |
| Cache hit rate (steady state) | {{> 60%}} |
| Bundle size (gzipped) — frontend total | {{< 250KB}} |
| Apollo Client overhead | {{< 50KB}} |

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock Apollo Client (`MockedProvider`); test components in isolation |
| Integration | Real Apollo Client + mocked HTTP (`msw` — mock service worker) |
| Schema lint | `graphql-eslint` for operation files |
| Visual regression | Storybook + Chromatic |
| E2E | Playwright/Cypress against staging BFF |

## 13. Security

| Concern | Mitigation |
|---|---|
| XSS → token theft | HttpOnly cookies; never localStorage for auth |
| CSRF | SameSite=Strict + double-submit if cookies |
| Operation introspection | Disable in production BFF |
| Field-level authz | BFF responsibility (FE assumes BFF is enforcement point) |
| Sensitive data in cache | Clear cache on logout; consider `nullable` for sensitive fields |

## 14. Offline / Network Resilience

| Aspect | Strategy |
|---|---|
| Offline detection | `navigator.onLine` + Apollo error link `networkError.statusCode === 0` |
| Queued mutations | {{Optional — apollo-link-queue or custom}} |
| Cache persistence | {{Optional — `apollo3-cache-persist` to IndexedDB}} |
| Offline UX | Show banner; disable mutations; allow read from cache |

## 15. Operational Runbook

| Scenario | Action |
|---|---|
| BFF down | Service worker shows fallback UI; queued mutations retried on recovery |
| Schema breaking change shipped | Older clients fail — show "please refresh" toast based on schema hash |
| Cache corruption | `client.resetStore()` + reload (last resort) |
| Subscription storm | Rate-limit on BFF; FE backoff on connect failures |

## 16. Change Log

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-05-02 | 1 | Initial FE↔BFF integration contract | {{Architect}} |
