---
type: architecture
artifact_kind: integration-bff-backend
status: ACTIVE
version: 6
tier: T1
owner_authority: Architecture Authority
boundary_bff: "agg-garage-graph"
last_reviewed: "2026-06-10"
supersedes: "INTEG-BFF-gf-{accounting,customer,erp-mdm,inventory,marketing,notification,purchase,sales}.md, INTEG-BFF-hrms.md, INTEG-BFF-ct-file-storage.md"
---

# Integration — BFF (Apollo GraphQL) `agg-garage-graph`

> Document tích hợp giữa BFF Apollo GraphQL **`agg-garage-graph`** và toàn bộ backend services downstream Garage operational.
> File này document **per-BFF, multi-backend, flow-oriented** — replace 10 file legacy per-pair.

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| BFF service | `agg-garage-graph` (Apollo Server 4 / Express 4) |
| Audience | Garage operational flows: booking, service order, purchase, inventory, accounting, customer, marketing, dashboard |
| Source code | `srcroot/garage-functions/agg-garage-graph/` |
| Schema source | `src/graphql/modules/{module}/index.ts` (export `typeDefs` + `resolvers`) |
| Schema build | **Dynamic loader** via `src/graphql/common/moduleLoader.ts` — filesystem auto-discovery + `@graphql-tools/merge` |
| Codegen tool | TypeScript types co-located trong từng module |
| Persisted queries | Không (acceptable cho garage staff/operational traffic) |
| Health check | `GET /health` |
| Metrics | `GET /metrics` Prometheus format (via `prom-client@15.1.3`) |
| GraphQL endpoint | `${GRAPHQL_PUBLIC_PATH}/graphql` (default `/graphql/graphql`) |
| GraphQL internal | `${GRAPHQL_INTERNAL_PATH}` (default `/playground`) |
| Runtime | Node.js / TypeScript / Apollo Server 4.9 / Express 4.18 / GraphQL 16.8 |
| Default port | `4123` (configurable via `PORT` env) |
| Body limit | `SERVER_LIMIT` env (default `30mb`) |

### Custom scalars
- `DateTime` — ISO 8601 timestamp
- `JSON` — arbitrary JSON payload
- `Upload` — multipart file via `processUploads` middleware

### Module loader pattern

```typescript
// src/graphql/common/moduleLoader.ts
loadModules() {
  readdirSync('src/graphql/modules')
    .map(dir => require(`../modules/${dir}/index.ts`))
    .filter(m => m.typeDefs && m.resolvers)
    // → [{ typeDefs, resolvers }, ...]
}
// → mergeTypeDefs() + mergeResolvers() → executable schema
```

→ Mỗi module phải export `typeDefs` (DocumentNode | string) và `resolvers` (IResolvers) từ `index.ts`.

---

## 2. Topology / Position in C4

```
[Garage Web Staff (ReactJS)]   [Garage Mobile (Flutter)]
                  │                    │
                  └────────┬───────────┘
                           ▼

                ┌──[agg-garage-graph]──┐
                │                       │
   ┌────────────┼──────────┬────────────┼─────────┬──────────┐
   ▼            ▼          ▼            ▼         ▼          ▼
[gf-sales] [gf-purchase] [gf-inventory] ... [ac-payment] [ct-saas] [Superset]
   │              │         │                gateway     tenant
   ▼              ▼         ▼
[gf-customer] [gf-erp-mdm] [gf-accounting] [gf-system] [gf-marketing] [gf-notification]
                                                                            │
                                                              [gf-hrms] [policy-agent]
                                                              [ct-file-storage]
```

Reference: `Architecture/SYSTEM-ARCHITECTURE.md` §C4-Container; ADR-001 (microservice landscape), ADR-002 (GraphQL aggregator).

---

## 3. Authentication (gateway-level)

| Thuộc tính | Giá trị |
|---|---|
| Client → BFF auth | Bearer JWT trong `Authorization` header |
| BFF token validation | Không validate ở BFF — Kong gateway upstream đã validate |
| BFF → Backend auth | Token forwarding qua `PassthroughService` + `ApiClient` |
| User context propagation | Resolver context có `{ req, res, token, requestId, source, destination }`; downstream nhận token nguyên trong `Authorization` |
| Header forward | `Authorization`, `x-request-id`, `x-trace-id`, `x-correlation-id`, `x-source-service: GARAGE`, `x-real-ip`, `x-api-key-feedback`, `Garage-App-Version`, `x-client-type` (default `GARAGE`) |
| Request ID | Generated UUID nếu missing; set response `x-request-id` |
| Source/destination | `source` từ request metadata; `destination` = `CURRENT_SERVICE.name` (default `CLIENT_TYPE=GARAGE`) |
| Gateway-level enforcement | Không có operation-level whitelist; mọi auth decision ở downstream BE |

> **Anti-pattern**: BFF gọi BE "as superuser" mà không pass user context → BE không enforce row-level authz. ApiClient luôn forward Authorization từ context.

---

## 4. BE Landscape Matrix

| # | BE service | BFF modules | Protocol | Trust zone | Auth method | Base URL config | Source code path |
|---|---|---|---|---|---|---|---|
| 1 | `gf-sales` | `gf-sales` (booking, service-orders, customers, vehicles, quotation-ask, dashboard-realtime) | REST | Internal Garage | Token forward | `GF_SALES` (default `http://localhost:14000`) | `src/graphql/modules/gf-sales/*`, `src/utils/passthrough.service.ts` |
| 2 | `gf-customer` | `gf-customer` | REST | Internal Garage | Token forward | `GF_CUSTOMER` (default `http://localhost:15000`) | `src/graphql/modules/gf-customer/` |
| 3 | `gf-purchase` | `order`, `purchase`, `quotation`, `supplier`, `payment` (partial), `user`, `direct-purchase-order`, `enable-payment-method-mobile`, `dashboard` | REST | Internal Garage | Token forward + `Garage-App-Version` | `GF_PURCHASE` (default `http://localhost:6666`) | `src/graphql/modules/{order,purchase,quotation,supplier,user,direct-purchase-order,dashboard,enable-payment-method-mobile}/` |
| 4 | `gf-inventory` | `mdm` (deliveries, receipts, stocks), `warehouse` | REST | Internal Garage | Token forward | `GF_INVENTORY` (default `http://localhost:10500`) | `src/graphql/modules/{mdm,warehouse}/` |
| 5 | `gf-accounting` | `gf-accounting` (settlements) | REST | Internal Garage | Token forward | `GF_ACCOUNTING` (default `http://localhost:14100`) | `src/graphql/modules/gf-accounting/` |
| 6 | `gf-erp-mdm` | `catalog`, `mdm` (catalog enrichment) | REST | Internal Garage | Token forward | `GF_ERP_MDM` (default `http://localhost:11000`) | `src/graphql/modules/catalog/` |
| 7 | `gf-marketing` | `campaign`, `voucher` | REST | Internal Garage | Token forward | `GF_MARKETING` (default `http://localhost:15000`) | `src/graphql/modules/{campaign,voucher}/` |
| 8 | `gf-notification` | `notification` | REST | Internal Garage | Token forward | `GF_NOTIFICATION` (default `http://localhost:9999`) | `src/graphql/modules/notification/` |
| 9 | `gf-system` | `gf-system` | REST | Internal Garage | Token forward | `GF_SYSTEM` (default `http://localhost:8080`) | `src/graphql/modules/gf-system/` |
| 10 | `gf-hrms` | `hrms`, `user` | REST | Internal Garage | Token forward | `HRMS_BASE_URL` (default `http://localhost:12000`) | `src/graphql/modules/hrms/` |
| 11 | `ct-saas-tenant` | `tenant`, `gf-system` (tenant context enrichment) | REST | External internal (ct-*) | Token forward + tenant context | `CT_SAAS_TENANT` (default `http://localhost:45160`) | `src/graphql/modules/tenant/` |
| 12 | `ct-file-storage` | `uploadFile` | REST + multipart | External internal (ct-*) | Token forward | `CT_FILE_STORAGE` (default `http://localhost:45888`) | `src/graphql/modules/uploadFile/`, `src/middleware/upload.ts` |
| 13 | `cp-cms-index` | (catalog content) | REST | External internal (cp-*) | Token forward | `CP_CMS_INDEX` (default `http://localhost:7777`) | indirect via catalog module |
| 14 | `ac-payment-gateway` | `payment` (createPayment, getPaymentByPurchase) | REST | External 3rd-party (payment) | Token forward + `x-api-key-feedback` | `AC_PAYMENT_GATEWAY` (default `http://localhost:45100`) | `src/graphql/modules/payment/payment.resolver.ts` |
| 15 | `policy-agent` | `policy-agent` (roles, resources, permissions) | REST | External internal | Token forward | `POLICY_AGENT_BASE_URL` (default `http://localhost:13000`) | `src/graphql/modules/policy-agent/` |
| 16 | Superset | `supper-set` | REST + cookie chain | External 3rd-party (BI) | Admin user/pass → CSRF → guest token | `SUPERSET_ENDPOINT`, `SUPERSET_ADMIN_USERNAME`, `SUPERSET_ADMIN_PASSWORD` | `src/graphql/modules/supper-set/`, `src/supperset/superset.proxy.ts` |

### 26 modules → primary BE map

| # | Module | Primary BE | Notes |
|---|---|---|---|
| 1 | `campaign` | gf-marketing | + tenant enrichment |
| 2 | `catalog` | gf-erp-mdm | central enrichment cho mọi module (units, categories, insurance) |
| 3 | `dashboard` | gf-purchase | spending overview, stats, spending chart |
| 4 | `direct-purchase-order` | gf-purchase | direct PO CRUD |
| 5 | `enable-payment-method-mobile` | gf-purchase | GET /api/v2/feature-flags/mobile |
| 6 | `feature-flags` | **local** (process.env) | no BE call — static config from env flags |
| 7 | `gf-accounting` | gf-accounting | + gf-sales batch enrichment |
| 8 | `gf-customer` | gf-customer | + gf-erp-mdm address hierarchy |
| 9 | `gf-sales` | gf-sales | submodules: booking, booking-v3, service-orders v2/v3, customers, vehicles, quotation-ask, dashboard-realtime |
| 10 | `gf-system` | gf-system + ct-saas-tenant | tenant transporter registry |
| 11 | `hrms` | gf-hrms | employee CRUD, user lifecycle |
| 12 | `mdm` | gf-inventory | deliveries, receipts, stocks; + gf-erp-mdm catalog enrichment |
| 13 | `notification` | gf-notification | + ct-notihub if proxied (TBD) |
| 14 | `order` | gf-purchase | purchase request/order, cart; version-aware (v1/v2/v3) via `Garage-App-Version` |
| 15 | `payment` | ac-payment-gateway + gf-purchase | union response type for createPayment |
| 16 | `policy-agent` | policy-agent | roles, resources, permissions |
| 17 | `purchase` | gf-purchase | alias for order/quotation operations |
| 18 | `quotation` | gf-purchase | + gf-sales related SO lookup |
| 19 | `supper-set` | Superset | dashboard proxy |
| 20 | `supplier` | gf-purchase | supplier CRUD |
| 21 | `tenant` | gf-purchase + ct-saas-tenant | current user, tenant info |
| 22 | `uploadFile` | ct-file-storage | multipart upload + stream download |
| 23 | `user` | gf-purchase + gf-hrms | cards, preferences, profile |
| 24 | `voucher` | gf-marketing | voucher program & redemption |
| 25 | `warehouse` | gf-inventory | warehouse lookup (GET /api/v1/warehouses) |

### 4.3 Full Operation Catalog (268 operations)

> Liệt kê đầy đủ mọi GraphQL operation `agg-garage-graph` expose, kèm BE call mapping.
> **Tổng**: ~270 operations (190 queries + 80 mutations) across 26 modules.
> Type legend: **Q** = Query, **M** = Mutation, **S** = Subscription.
>
> **Enrichment shorthand**:
> - `+ catalog` = `gf-erp-mdm POST /api/v1/catalog/get-hierarchy-list` (batch hierarchy lookup) — phổ biến nhất
>   - Nếu là single-item lookup → `POST /api/v1/catalog/get-hierarchy`
>   - Nếu là field-name mapping → `POST /api/v1/catalog/find-by-code`
> - `+ tenant` = `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` (user enrichment cho IAM userId → fullName)
>
> Catalog handler endpoints (gf-erp-mdm, all POST):
> - `/api/v1/catalog/inquiry` — full-text catalog search (used by `Query.searchCatalog`)
> - `/api/v1/catalog/get-hierarchy` — single hierarchy lookup
> - `/api/v1/catalog/get-hierarchy-list` — batch hierarchy lookup (most common cho enrichment)
> - `/api/v1/catalog/find-by-code` — find by exact code(s)
> - `/api/v1/catalog/create-hierarchy` — create new hierarchy entry

#### 4.3.1 `gf-sales` submodules (42 ops)

##### `booking` (9 ops) — `src/graphql/modules/gf-sales/booking/`

| Type | Operation | BE call |
|---|---|---|
| Q | getBookingById | GET /api/v2/bookings/:id (gf-sales) + catalog |
| Q | searchBookings | POST /api/v2/bookings/search (gf-sales) |
| Q | checkAvailability | GET /api/v2/bookings/check-availability (gf-sales) |
| M | createBooking | POST /api/v2/bookings (gf-sales) |
| M | updateBooking | PUT /api/v2/bookings/:id (gf-sales) |
| M | confirmBooking | PUT /api/v2/bookings/:id/confirm (gf-sales) + catalog |
| M | declineBooking | PUT /api/v2/bookings/:id/decline (gf-sales) + catalog |
| M | cancelBooking | PUT /api/v2/bookings/:id/cancel (gf-sales) + catalog |
| M | arriveBooking | PUT /api/v2/bookings/:id/arrive (gf-sales) + catalog |

##### `booking-v3` (9 ops) — `src/graphql/modules/gf-sales/booking-v3/`

| Type | Operation | BE call |
|---|---|---|
| Q | getBookingByIdV3 | GET /api/v3/bookings/:id (gf-sales) + catalog |
| Q | searchBookingsV3 | POST /api/v3/bookings/search (gf-sales) |
| Q | checkAvailabilityV3 | GET /api/v3/bookings/check-availability (gf-sales) |
| M | createBookingV3 | POST /api/v3/bookings (gf-sales) |
| M | updateBookingV3 | PUT /api/v3/bookings/:id (gf-sales) |
| M | confirmBookingV3 | PUT /api/v3/bookings/:id/confirm (gf-sales) |
| M | declineBookingV3 | PUT /api/v3/bookings/:id/decline (gf-sales) |
| M | cancelBookingV3 | PUT /api/v3/bookings/:id/cancel (gf-sales) |
| M | arriveBookingV3 | PUT /api/v3/bookings/:id/arrive (gf-sales) |

##### `service-orders` (11 ops) — `src/graphql/modules/gf-sales/service-orders/`

| Type | Operation | BE call |
|---|---|---|
| Q | getServiceOrderById | GET /api/v2/service-orders/:id (gf-sales) + catalog + tenant |
| Q | searchServiceOrders | POST /api/v2/service-orders/search (gf-sales) + catalog |
| M | createServiceOrder | POST /api/v2/service-orders (gf-sales) |
| M | updateServiceOrder | PUT /api/v2/service-orders/:id (gf-sales) |
| M | startServiceOrder | PUT /api/v2/service-orders/:id/start (gf-sales) |
| M | completeServiceOrder | PUT /api/v2/service-orders/:id/complete (gf-sales) |
| M | cancelServiceOrder | PUT /api/v2/service-orders/:id/cancel (gf-sales) |
| M | recordServiceOrderPayment | POST /api/v2/service-orders/:id/payments (gf-sales) |
| M | recordServiceOrderPaymentByCode | POST /api/v3/service-orders/:code/record-payments (gf-sales) |
| M | ocrCarRegistration | POST /api/v2/service-orders/ocr/upload (gf-sales) |
| M | exportServiceOrderToPdf | **Local URL generation** (no BE call; REST proxy `/graphql/api/v2/service-orders/:id/export-pdf` handles actual gf-sales call) |
| M | exportServiceOrderToImage | **Local URL generation** (no BE call; REST proxy `/graphql/api/v2/service-orders/:id/export-image` handles actual gf-sales call) |

##### `service-orders-v3` (17 ops) — `src/graphql/modules/gf-sales/service-orders-v3/`

| Type | Operation | BE call |
|---|---|---|
| Q | getServiceOrderByIdV3 | GET /api/v3/service-orders/:id (gf-sales) + catalog (get-hierarchy-list + find-by-code) + gf-purchase (related DPO) + gf-inventory (deliveries) + gf-accounting (settlements) + gf-hrms (employee) |
| Q | getServiceOrderByCode | GET /api/v3/service-orders/detail/:code (gf-sales) + catalog (get-hierarchy-list + find-by-code) + gf-purchase (related DPO) + gf-inventory (deliveries) + gf-accounting (settlements) + gf-hrms (employee) |
| Q | getLatestServiceOrdersByVehicleV3 | GET /api/v3/service-orders/vehicles/:id/latest (gf-sales) + catalog |
| Q | searchServiceOrdersV3 | POST /api/v3/service-orders/search (gf-sales) + catalog |
| Q | getPartsForDeliveryV3 | GET /api/v3/service-orders/code/:code/for-delivery (gf-sales) + gf-inventory (cost-price) + catalog |
| Q | searchCompletedVehicleNotesV3 | POST /api/v3/service-orders/completed-vehicle-notes/search (gf-sales) |
| Q | searchCompletedPartsV3 | POST /api/v3/service-orders/completed-parts/search (gf-sales) |
| Q | searchCompletedItemsV3 | POST /api/v3/service-orders/completed-items/search (gf-sales) + catalog |
| M | createServiceOrderV3 | POST /api/v3/service-orders (gf-sales) |
| M | updateServiceOrderV3 | PUT /api/v3/service-orders/:id (gf-sales) |
| M | startServiceOrderV3 | PUT /api/v3/service-orders/:id/start (gf-sales) |
| M | completeServiceOrderV3 | PUT /api/v3/service-orders/:id/complete (gf-sales) |
| M | cancelServiceOrderV3 | PUT /api/v3/service-orders/:id/cancel (gf-sales) |
| M | recordServiceOrderPaymentV3 | POST /api/v3/service-orders/:id/payments (gf-sales) |
| M | ocrCarRegistrationV3 | POST /api/v3/service-orders/ocr/upload (gf-sales) |
| M | sendQuotationV3 | POST /api/v3/service-orders/:id/send-quotation (gf-sales) |
| M | confirmServiceOrderV3 | POST /api/v3/service-orders/:id/confirm (gf-sales) |

##### `customers` (8 ops) — `src/graphql/modules/gf-sales/customers/`

| Type | Operation | BE call |
|---|---|---|
| Q | suggestCustomers | GET /api/v2/customers/suggest (gf-sales) |
| Q | suggestCustomersByName | GET /api/v2/customers/suggest-by-name (gf-sales) |
| M | createSalesCustomer | POST /api/v1/customers (**gf-customer**) |
| M | updateSalesCustomer | PUT /api/v1/customers/:id (**gf-customer**) |
| M | deleteSalesCustomer | DELETE /api/v1/customers/:id (**gf-customer**) |
| M | mergeSalesCustomers | POST /api/v1/customers/merge (**gf-customer**) |
| M | verifyImportSalesCustomers | POST /api/v1/customers/verify-import (**gf-customer**) |
| M | importSalesCustomers | POST /api/v1/customers/import (**gf-customer**) |

> Note: `customers` submodule **trong gf-sales namespace** nhưng forward sang **gf-customer** service (customer master ownership theo ADR-001).

##### `vehicles` (1 op) — `src/graphql/modules/gf-sales/vehicles/`

| Type | Operation | BE call |
|---|---|---|
| Q | suggestVehicles | GET /api/v2/vehicles/suggest (gf-sales) + catalog |

##### `quotation-ask` (3 ops) — `src/graphql/modules/gf-sales/quotation-ask/`

| Type | Operation | BE call |
|---|---|---|
| Q | getSalesLinkedServiceOrderByQuotationAskId | GET /api/v2/quotation-asks/by-quotation-ask-id/:id/linked-service-order (**gf-sales**) |
| Q | getSalesLinkedServiceOrderByCode | GET /api/v2/quotation-asks/by-code/:code/linked-service-order (**gf-sales**) |
| M | createSalesQuotationAsk | POST /api/v2/quotation-asks (**gf-sales**) |

> Note: `quotation-ask` submodule forward sang **gf-sales** (không phải gf-purchase). gf-sales host endpoint `/api/v2/quotation-asks/*` cho linked SO lookup.

##### `dashboard-realtime` (1 op composite) — `src/graphql/modules/gf-sales/dashboard-realtime/`

| Type | Operation | BE call |
|---|---|---|
| Q | getDashboardRealtime | **Composite (5 parallel BE calls)**: GET /api/v2/dashboard/realtime/total-so-debt (gf-sales) + GET /api/v2/dashboard/realtime/so-in-progress-count (gf-sales) + GET /api/v2/dashboard/realtime/booking-arrived-without-so-count (gf-sales) + GET /api/v2/dashboard/realtime/quotation-asks-asking-count (**gf-purchase**) + GET /api/v2/dashboard/realtime/purchase-orders-delivering-count (**gf-purchase**) |

#### 4.3.2 `gf-customer` (31 ops) — `src/graphql/modules/gf-customer/`

| Type | Operation | BE call |
|---|---|---|
| Q | getCustomer | GET /api/v1/customers/:id (gf-customer) + catalog (get-hierarchy-list + find-by-code) |
| Q | getCustomerByPhone | GET /api/v1/customers/by-phone/:phone (gf-customer) |
| Q | searchCustomers | POST /api/v1/customers/search (gf-customer) |
| Q | getCustomersBirthdayToday | GET /api/v1/customers/birthdays-today (gf-customer) |
| Q | getSegments | GET /api/v1/segments (gf-customer) |
| Q | searchSegments | POST /api/v1/segments/search (gf-customer) + tenant (createdBy) |
| Q | getSegment | GET /api/v1/segments/:id (gf-customer) + catalog (city) |
| Q | getSegmentCustomerCount | GET /api/v1/segments/:id/customer-count (gf-customer) |
| Q | previewSegmentCustomers | POST /api/v1/segments/preview (gf-customer) |
| Q | searchSegmentCustomers | POST /api/v1/segments/customers/search (gf-customer) |
| Q | getInteraction | GET /api/v1/customers/:customerId/interactions/:interactionId (gf-customer) |
| Q | searchInteractions | POST /api/v1/customers/:customerId/interactions/search (gf-customer) |
| Q | getCustomerTags | GET /api/v1/customers/:customerId/tags (gf-customer) |
| Q | suggestCustomerByPhone | GET /api/v1/customers/suggest (gf-customer) |
| Q | suggestCustomerByName | GET /api/v1/customers/suggest-by-name (gf-customer) |
| Q | suggestVehicleByPlate | GET /api/v1/vehicles/suggest (gf-customer) + catalog |
| Q | getVehicle | GET /api/v1/vehicles/:id (gf-customer) + catalog |
| Q | searchVehicles | POST /api/v1/vehicles/search (gf-customer) + catalog |
| M | createCustomer | POST /api/v1/customers (gf-customer) |
| M | updateCustomer | PUT /api/v1/customers/:id (gf-customer) |
| M | deleteCustomer | DELETE /api/v1/customers/:id (gf-customer) |
| M | mergeCustomers | POST /api/v1/customers/merge (gf-customer) |
| M | verifyImportCustomers | POST /api/v1/customers/verify-import (gf-customer) |
| M | importCustomers | POST /api/v1/customers/import (gf-customer) |
| M | createSegment | POST /api/v1/segments (gf-customer) |
| M | updateSegment | PUT /api/v1/segments/:id (gf-customer) |
| M | deleteSegment | DELETE /api/v1/segments/:id (gf-customer) |
| M | evaluateSegment | POST /api/v1/segments/:id/evaluate (gf-customer) |
| M | updateSegmentRules | PUT /api/v1/segments/:id/update-rules (gf-customer) |
| M | createInteraction | POST /api/v1/customers/:customerId/interactions (gf-customer) |
| M | updateInteraction | PUT /api/v1/customers/:customerId/interactions/:interactionId (gf-customer) |

#### 4.3.3 `mdm` (44 ops) — `src/graphql/modules/mdm/`

| Type | Operation | BE call |
|---|---|---|
| Q | getMdmParts | GET /api/v1/mdm-parts (gf-inventory) |
| Q | getMdmPartsGoogleImages | GET /api/v1/mdm-parts/google-images (gf-inventory) |
| Q | searchProducts | GET /api/v2/products/search (gf-inventory) + catalog |
| Q | searchGroupedProducts | GET /api/v2/products/search-grouped (gf-inventory) + catalog |
| Q | getReceiptByCode | GET /api/v2/receipts/:code (gf-inventory) + catalog + tenant + supplier from PO (gf-purchase) |
| Q | searchReceipts | GET /api/v2/receipts (gf-inventory) + catalog + tenant + supplier from PO (gf-purchase) |
| Q | getServiceById | GET /api/v1/services/:id (gf-inventory) + catalog + tenant |
| Q | searchServices | GET /api/v1/services (gf-inventory) + catalog + tenant |
| Q | searchDeliveries | POST /api/v2/deliveries/search (gf-inventory) + tenant + gf-sales (find-by-codes + customer-info) |
| Q | searchDeliveriesMobile | POST /api/v2/deliveries/mobile/search (gf-inventory) + tenant + gf-sales (customer-info) |
| Q | getDeliveryByCode | GET /api/v2/deliveries/:code (gf-inventory) + tenant + gf-sales (SO detail + customer-info) |
| Q | getMobileDeliveryById | GET /api/v2/deliveries/mobile/:code (gf-inventory) + catalog + tenant + gf-sales (customer-info + SO detail) |
| Q | getDeliveryItems | GET /api/v2/deliveries/:id/items (gf-inventory) |
| Q | searchReceiptsMobile | GET /api/v2/receipts/mobile/search (gf-inventory) |
| Q | getReceiptMobile | GET /api/v2/receipts/mobile/:code (gf-inventory) |
| Q | searchInventoryStocks | GET /api/v2/stocks (gf-inventory) |
| Q | getHistoryStock | GET /api/v2/stocks/history (gf-inventory) |
| Q | searchInventoryStockMobile | GET /api/v2/stocks/mobile (gf-inventory) |
| Q | getHistoryStockMobileById | GET /api/v2/stocks/mobile/:id (gf-inventory) |
| Q | searchDeliveryProducts | POST /api/v2/deliveries/products/search (gf-inventory) |
| Q | exportDeliveryPdf | GET /api/v2/deliveries/:id/export-pdf (gf-inventory) |
| Q | exportReceiptPdf | GET /api/v2/receipts/:id/export-pdf (gf-inventory) |
| Q | searchPeriodStocks | GET /api/v2/period-stocks (gf-inventory) |
| Q | getPeriodStockById | GET /api/v2/period-stocks/:id (gf-inventory) |
| Q | getPeriodStockFilterProducts | GET /api/v2/period-stocks/filters/products (gf-inventory) |
| Q | getPeriodStockFilterPeriods | GET /api/v2/period-stocks/filters/periods (gf-inventory) |
| Q | searchPeriodStocksMobile | GET /api/v2/period-stocks/mobile/list (gf-inventory) + catalog |
| Q | getPeriodStockDetailMobile | GET /api/v2/period-stocks/mobile/detail (gf-inventory) + catalog |
| Q | getTotalStockBySkus | POST /api/v2/products/stock/total-by-skus (gf-inventory) |
| M | createProducts | POST /api/v2/products (gf-inventory) |
| M | createReceipts | POST /api/v2/receipts (gf-inventory) |
| M | updateReceipts | PUT /api/v2/receipts/:id (gf-inventory) |
| M | cancelReceipts | POST /api/v2/receipts/:id/cancel (gf-inventory) |
| M | completeReceipts | POST /api/v2/receipts/:id/complete (gf-inventory) |
| M | reverseReceipts | POST /api/v2/receipts/:id/reverse (gf-inventory) |
| M | updateService | PUT /api/v1/services/:id (gf-inventory) |
| M | createService | POST /api/v1/services (gf-inventory) |
| M | createDelivery | POST /api/v2/deliveries (gf-inventory) |
| M | updateDelivery | PUT /api/v2/deliveries/:id (gf-inventory) |
| M | completeDelivery | POST /api/v2/deliveries/:id/complete (gf-inventory) |
| M | cancelDelivery | POST /api/v2/deliveries/:id/cancel (gf-inventory) |
| M | reverseDelivery | POST /api/v2/deliveries/:id/reverse (gf-inventory) |
| M | adjustStockQuantity | PUT /api/v2/stocks/adjust (gf-inventory) + tenant |
| M | updateStockPrice | PUT /api/v2/stocks/prices (gf-inventory) |

#### 4.3.4 `payment` (5 ops) — `src/graphql/modules/payment/`

| Type | Operation | BE call |
|---|---|---|
| Q | getVariables | GET /api/v1/variables/mobile (gf-purchase) |
| Q | getPreferences | GET /api/v{1,2}/user/preferences (gf-purchase) — version-aware via Garage-App-Version |
| Q | getPaymentByPurchase | GET /api/payments/by-purchase/:purchaseCode (**ac-payment-gateway**) |
| M | createPayment | POST /api/payments/create (**ac-payment-gateway**) |
| M | changePaymentMethod | PUT /api/v2/purchase-request/change-payment-method/:id (gf-purchase) |

> Note: payment module compose 2 BE — gf-purchase (config + status) + ac-payment-gateway (transactions).

#### 4.3.5 `order` (21 ops) — `src/graphql/modules/order/`

| Type | Operation | BE call |
|---|---|---|
| Q | getCart | GET /api/v1/cart (gf-purchase) + catalog |
| Q | searchPurchaseRequests | POST /api/v{1,2}/purchase-request/search (gf-purchase) + catalog |
| Q | searchPurchaseRequestsForWeb | POST /api/v2/purchase-request/search-for-web (gf-purchase) |
| Q | searchPurchaseOrders | POST /api/v{1,2}/purchase-order/search (gf-purchase) + catalog |
| Q | searchPurchaseOrdersForWeb | POST /api/v2/purchase-order/search-web (gf-purchase) |
| Q | getPurchaseRequestDetail | GET /api/v{1,2}/purchase-request/:id (gf-purchase) + catalog |
| Q | getPurchaseRequestDetailByCode | GET /api/v{1,2}/purchase-request/detail/:code (gf-purchase) |
| Q | getPurchaseOrder | GET /api/v{1,2}/purchase-order/:id (gf-purchase) + catalog |
| Q | getPurchaseOrderByCode | GET /api/v{1,2}/purchase-order/detail/:code (gf-purchase) |
| Q | getPurchaseOrderDetailV3 | GET /api/v3/purchase-order/detail/:code (gf-purchase) + catalog + tenant + linked SO (**gf-sales**) |
| Q | getSaasTenant | GET /api/v1/purchase-request/saas-tenant (gf-purchase) |
| Q | getPurchaseRequestChat | GET /api/v1/purchase-request/chat/:code (gf-purchase) |
| M | addPurchaseRequest | POST /api/v1/purchase-request (gf-purchase) |
| M | addPurchaseRequestV2 | POST /api/v2/purchase-request (gf-purchase) |
| M | cancelPurchaseRequest | PUT /api/v1/purchase-request/cancel (gf-purchase) |
| M | confirmPurchaseRequest | PUT /api/v1/purchase-request/confirm/:id (gf-purchase) |
| M | confirmReceivedPurchaseOrder | POST /api/v1/purchase-order/:id/confirm-received (gf-purchase) |
| M | confirmReceivedPurchaseOrderByCode | POST /api/v1/purchase-order/confirm-received/:code (gf-purchase) |
| M | updateCart | PUT /api/v1/cart (gf-purchase) |
| M | addSparePartToCart | POST /api/v1/cart/add/:sparePartPriceLineItemId (gf-purchase) |
| M | deleteCartItem | DELETE /api/v1/cart/:id (gf-purchase) |

#### 4.3.6 `quotation` (15 ops) — `src/graphql/modules/quotation/`

| Type | Operation | BE call |
|---|---|---|
| Q | quotationAskById | GET /api/v{1,2,3}/quotation-asks/:id (gf-purchase) + catalog |
| Q | quotationAskByCode | GET /api/v{1,2,3}/quotation-asks/detail/:code (gf-purchase) + catalog + linked SO |
| Q | quotationAskByCodeOrId | (dynamic routing — code or id) (gf-purchase) |
| Q | quotationAskTenantInvoiceInfo | GET /api/v3/quotation-asks/tenant-invoice-info (gf-purchase) |
| Q | quotationAskV3ById | GET /api/v3/quotation-asks/:id (gf-purchase) |
| Q | quotationAskV3ByCode | GET /api/v3/quotation-asks/detail/:code (gf-purchase) |
| Q | searchQuotationAsks | GET /api/v{1,2}/quotation-asks (gf-purchase) + catalog |
| Q | searchQuotationAsksForWeb | GET /api/v2/quotation-asks/search-for-web (gf-purchase) + catalog |
| Q | searchSpareParts | GET /api/v1/quotation-asks/spare-parts (gf-purchase) + catalog |
| Q | quotationAskHistories | GET /api/v{1,2}/quotation-asks/:code/histories (gf-purchase) + catalog (field name mapping) |
| Q | quotationAskChatByCode | GET /api/v{1,2}/quotation-asks/chat/:code (gf-purchase) + catalog |
| M | createQuotationAsk | POST /api/v{1,2}/quotation-asks (gf-purchase) + catalog |
| M | createQuotationAskV3 | POST /api/v3/quotation-asks (gf-purchase) + catalog + invoice info |
| M | quotationPricingRequest | POST /api/v1/quotation-pricing/request (gf-purchase) |
| M | ocrUpload | POST /api/v2/quotation-asks/ocr/upload (gf-purchase) — multipart hoặc URL-based |

#### 4.3.7 `gf-accounting` settlements (9 ops) — `src/graphql/modules/gf-accounting/settlements/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchSettlements | POST /api/v1/settlements/search (gf-accounting) + batch SO (**gf-sales** find-by-codes) + catalog (insurance company) |
| Q | getSettlementByCode | GET /api/v1/settlements/:code (gf-accounting) + SO detail (**gf-sales**) + tenant (createdBy/updatedBy/settledBy) |
| Q | getSettlementsByServiceOrder | GET /api/v1/service-orders/:id/settlement (gf-accounting) |
| Q | exportSettlementToPdf | GET /api/v1/settlements/:id/export-pdf (gf-accounting) — token-based URL |
| M | finalizeServiceOrderAmounts | PUT /api/v1/service-orders/:id/finalize (**gf-sales**) |
| M | updateActualQuantities | PUT /api/v1/service-orders/:id/actual-quantities (**gf-sales**) |
| M | createSettlement | POST /api/v1/service-orders/:id/settlements (gf-accounting) |
| M | updateSettlement | PUT /api/v1/settlements/:code (gf-accounting) |
| M | cancelSettlement | POST /api/v1/settlements/:code/cancel (gf-accounting) |

#### 4.3.7b `gf-accounting` insurance-dossiers + insurance (9 ops, DESIGN — EP-INSURANCE-SETTLEMENT, ADR-014) — `src/graphql/modules/gf-accounting/insurance-dossiers/`

> ⚠️ Chưa có trong source. Passthrough P1 (widget P2). Forward `Authorization`/`X-Tenant-Id`/`X-Branch-Id`. `Upload` scalar cho scan ③.

| Type | Operation | BE call |
|---|---|---|
| M | updateServiceOrderV3 (additive insurance allocation) | PUT /api/v3/service-orders/:id (**gf-sales** — flat scalar adjustment fields + per-line payer/depreciation; flat scalar breakdown fields — no nested InsuranceAdjustments/InsurancePartyBreakdown types) |
| Q | getInsuranceDebtWidget | GET /api/v2/dashboard/insurance-debt-widget (**gf-sales** → nội bộ gọi gf-accounting /protected/v1/insurance-debt-summary, CB-INS-008) |
| M | createInsuranceDossier | POST /api/v1/insurance-dossiers (gf-accounting) |
| M | createInsuranceDossierVersion | POST /api/v1/insurance-dossiers/:settlementCode/versions (gf-accounting) |
| M | updateDossierDocument | PUT /api/v1/insurance-dossiers/documents/:docId (gf-accounting; multipart cho scan ③) |
| M | exportInsuranceDossier | POST /api/v1/insurance-dossiers/:dossierId/export (gf-accounting → PDF/S3) |
| Q | getInsuranceDossierVersions | GET /api/v1/insurance-dossiers/:settlementCode (gf-accounting) |
| Q | getInsuranceDossierDownloadUrl | GET /api/v1/insurance-dossiers/documents/:docId/download (gf-accounting — signed URL) |
| M | recordInsurancePayment | POST /api/v1/settlements/:code/insurance-payments (gf-accounting) |

> **Tái dùng / W01**: tạo Phiếu QT BH = `createInsuranceSettlement` (op MỚI W01 — **chưa có trong source HEAD**; agg hiện có `createSettlement` 4.3.7); ghi 5 khoản điều chỉnh BH = additive trên `updateServiceOrderV3` (KHÔNG op `applyInsuranceAdjustments` riêng); chi tiết = `getSettlementByCode` (response bổ sung block insurance).

##### 4.3.7b.1 Canonical SDL — Insurance allocation, breakdown, balance (Shape D, flat at `ServiceOrder` root)

> **Single source of truth** cho insurance fields trên `getServiceOrderByCode` (Surface A, gf-sales). Lock 2026-06-10 sau khi user reject nested `breakdownByPayer.{bh,kh}` + wrapper `insuranceAdjustment`. Mapper BFF = **pure passthrough** (no transform); BE REST flat scalar shape (`gf-sales-api.md` v7+) project trực tiếp lên SDL root.
> Decision artifact: [`Execution/test-reports/W01/BUG-W01-213-CR-AMENDMENT-SHAPE-D-DECISION.md`](../../Execution/test-reports/W01/BUG-W01-213-CR-AMENDMENT-SHAPE-D-DECISION.md). Plan: `~/.claude/plans/integ-bff-gf-accounting-insurance-md-v-i-vectorized-pretzel.md`. Supersedes: BUG-W01-209 (nested axis decision) + wrapper-preserved half của BUG-W01-213.

```graphql
type ServiceOrder {
  # ... existing scalar fields (id, code, status, hasInsurance, insuranceCompany, …)

  # ── Insurance allocation (5 slots, composite type, BUG-W01-213 preserved) ──
  discountMaterial:    InsuranceAdjustment
  discountLabor:       InsuranceAdjustment
  depreciation:        InsuranceAdjustment
  claimReduction:      InsuranceAdjustment
  insuranceDeductible: InsuranceAdjustment

  # ── Breakdown by payer (8 flat scalars, BE passthrough; no bh/kh, no nest) ──
  serviceInsurance:       Float
  serviceCustomer:        Float
  partsInsurance:         Float
  partsCustomer:          Float
  vatInsurance:           Float
  vatCustomer:            Float
  totalAfterVatInsurance: Float
  totalAfterVatCustomer:  Float

  # ── Settlement balance (3 flat scalars, no bh/kh) ──
  insurancePayment:  Float
  customerPayment:   Float
  totalPayment:      Float
}

type InsuranceAdjustment {                                # UNCHANGED từ BUG-W01-213
  mode:               InsuranceAllocationMode             # PERCENT | AMOUNT
  value:              Float                               # raw input user
  amount:             Float                               # resolved VND (BUG-W01-212 derive)
  sign:               String                              # "-" | "+"
  transferToCustomer: Boolean                             # true khi sign="+"
}
```

**Removed SDL types** (KHÔNG tồn tại nữa): `InsuranceAdjustmentBlock`, `InsuranceSettlementBreakdown`, `InsuranceSettlementHeader`, `InsuranceAdjustmentItem`.

**Mapper behaviour**: `insurance.mapper.ts` collapses to direct field projection — không còn `mapBreakdownByPayer` (D9 transform xoá), không còn `mapInsuranceBlock` wrapper builder. BE field `breakdownServiceInsurance` → SDL field `serviceInsurance` (rename via lowercase prefix strip + suffix preserve).

**Surface coverage**:
- **Surface A** `getServiceOrderByCode` — flat root fields áp dụng. **CANONICAL theo §4.3.7b.1**. Write-side + read-side detail: §4.3.7b.2 / §4.3.7b.3.
- **Surface B** `getSettlementByCode.insurance` — wrapper nested SDL **status quo** chờ decision riêng (§4.3.7b.6 Open follow-up).

**Convention rule (locked 2026-06-10)**: Tất cả BFF↔BE insurance contract (drift, error code, field map, invariants) document trong §4.3.7b.* của file này. **KHÔNG spawn per-BE INTEG file** (precedent: `INTEG-BFF-GF-SALES-INSURANCE.md` + `INTEG-BFF-GF-ACCOUNTING-INSURANCE.md` đã được xoá khi consolidate vào §4.3.7b — xem Change Log v6).

##### 4.3.7b.2 Surface A — write path (`updateServiceOrderV3` additive insurance allocation)

> FE → agg `updateServiceOrderV3(id, input)` → gf-sales `PUT /api/v3/service-orders/{id}`. Auth: Authorization + X-Tenant-Id + X-Branch-Id forward downstream. Lock từ contract reconciliation W01 (2026-06-07) — drift resolutions trong CR-1748xxx-W01-INS-CONTRACT (Tracking/CHANGE-REQUESTS.md).

**Canonical field map — 5 khoản điều chỉnh (input)**

> Quy ước: enum `InsuranceAllocationMode { PERCENT, AMOUNT }` (GraphQL) ↔ `AllocationMode` (Java gf-sales). Mode-based fields dùng composite `{ mode, value }`; pure-scalar fields dùng `Float`.

| Concept (VN) | agg SDL input (CANONICAL) | gf-sales request field | Web gửi | Mobile gửi | Shape |
|---|---|---|---|---|---|
| CK liên kết vật tư | `discountMaterial: InsuranceAllocationInput {mode,value}` | `discountMaterialMode:String` + `discountMaterialValue:BigDecimal` | `{mode,value}` ✅ | **chưa wire** | composite ✅ |
| CK liên kết công DV | `discountLabor: InsuranceAllocationInput {mode,value}` | `discountLaborMode` + `discountLaborValue` | `{mode,value}` ✅ | **chưa wire** | composite ✅ |
| Khấu hao mặc định (%) | `depreciationDefault: Float` (CANONICAL = scalar) | `depreciationDefaultPercent:BigDecimal` | ⚠️ gửi `{percent}` (D1) | **chưa wire** | scalar |
| Khấu hao per dòng phụ tùng | `depreciationByLine: [InsuranceDepreciationByLineInput {lineId,percent}]` | per-part `depreciationPercent` trên item list (D2) | array ✅ | **chưa wire** | array→per-line |
| Giảm trừ bồi thường | `claimReduction: InsuranceAllocationInput {mode,value}` | `claimReductionMode` + `claimReductionValue` | `{mode,value}` ✅ | **chưa wire** | composite ✅ |
| Khấu trừ BH | `insuranceDeductible: Float` (CANONICAL = scalar amount) | `insuranceDeductibleAmount:BigDecimal` | ⚠️ gửi `{amount}` (D3) | **chưa wire** | scalar |

**Drift resolutions (locked canonical — FIX-stage actions)**

| ID | Drift | Resolution (CANONICAL) | Fix owner |
|---|---|---|---|
| D1 | `depreciationDefault`: web gửi `{percent}` object; gf-sales/SDL = scalar | Canonical = **scalar `Float`**. Web unwrap `{percent}` → `Float`. | garage-web FIX |
| D2 | `depreciationByLine` array (SDL/web) → gf-sales persist per-part field | Canonical = SDL **array input**; agg map `depreciationByLine[]` → per-part `depreciationPercent` trên items passthrough. Document asymmetry. | agg-garage-graph FIX (mapper) |
| D3 | `insuranceDeductible`: web gửi `{amount}`; canonical scalar | Canonical = **scalar `Float`**. Web unwrap `{amount}` → `Float`. | garage-web FIX |
| D8 | mode type: gf-sales `String` vs gf-accounting `AllocationMode` enum | Wire value = `"PERCENT"`/`"AMOUNT"`; gf-sales validate against enum (VLD-INS-SO-006 → **`400 INS_ADJ_MODE_INVALID`** [INS-1008], CR-1781085632 — chuyển 422→400). SDL enum `InsuranceAllocationMode` chặn sớm ở agg. KHÔNG breaking (FE bind theo code). | gf-sales (validate + emit INS_*) |
| — | **Mobile chưa wire input** vào save payload | Mobile bind `InsuranceAllocationCubit.state` → V3 save payload (`ServiceOrderCreationV3Cubit`). | garage-mobile FIX |

**Validation (server authoritative)**:
- VLD-INS-SO-003: `%` ∈ [0,100] · VLD-INS-SO-004: số tiền ≥0, ≤ cơ sở (0 hợp lệ) · VLD-INS-SO-006: mode ∈ {PERCENT,AMOUNT}.
- agg enforce enum `InsuranceAllocationMode` (SDL) + propagate downstream error qua error union (giữ nguyên `extensions.code`).
- Realtime preview ở client KHÔNG authoritative — gf-sales tính lại khi save (CALC-INS-001, công thức BR-EP §7.2; single-payer CALC-INS-006).

##### 4.3.7b.3 Surface A — read path post-Shape-D (`getServiceOrderByCode` flat root)

> Read shape lock từ Shape D 2026-06-10 (xem §4.3.7b.1). Pre-Shape-D drift history giữ ở §"Lịch sử drift" dưới đây để traceability (KHÔNG còn drift OPEN).

**Canonical shape**: `ServiceOrder` flat root (§4.3.7b.1) — 5 composite `InsuranceAdjustment` + 8 flat breakdown scalar + 3 flat balance scalar. Mapper = pure passthrough (no D9 transform, no wrapper builder).

**Lịch sử drift (root cause, đã RESOLVED bởi Shape D)**:
- `Architecture/api/gf-sales-api.md` v2 (2026-05-30): REST trả nested object khớp FEAT spec → BFF SDL khớp.
- `Architecture/api/gf-sales-api.md` v7 (2026-06-03): REST flatten JSONB → 8 scalar (`discountMaterialMode/Value`, `breakdownServiceInsurance/Customer`, …). BFF SDL theo nhịp này → 3 vector lệch (header, breakdownByPayer axis, adjustments array vs scalar, settlementBalance keys).
- BUG-W01-005 (2026-06-07): mapper wire `mapInsuranceBlock` — giữ shape v7 (5 scalar + payer-first).
- BUG-W01-209 (2026-06-09): canonical decision Option A → SDL → metric-first nested + bh/kh + adjustments array.
- BUG-W01-213 (2026-06-10): partial revert — `adjustments[]` → 5 scalar; breakdown nested giữ.
- **Shape D (this lock, 2026-06-10)**: drop wrapper `InsuranceAdjustmentBlock` + `bh/kh` + nested breakdown — flatten 16 fields lên `ServiceOrder` root. Mapper = pure passthrough. ALL prior drift CLOSED.

**Action items post-Shape-D** (xem BUG-W01-215):
- `agent-fix-agg-garage-graph`: delete `InsuranceAdjustmentBlock`/`InsuranceSettlementBreakdown`/`InsuranceSettlementHeader` SDL types; delete `mapBreakdownByPayer` + `mapInsuranceBlock`; add 16 flat fields direct trên `ServiceOrder`; rewrite regression assertions.
- `agent-fix-gf-sales`: KHÔNG đụng (REST đã flat).
- `agent-fix-garage-web`: rewrite query selection (xoá `insuranceAdjustment { ... }` wrapper; select 16 fields direct trên root SO); update `use-service-order-detail.ts` interface; update consumer components.
- `agent-test-api`: docs (file này) + TC sweep (TC-W01-API/ISOLATION/SECURITY).

##### 4.3.7b.4 Surface B — read path (`getSettlementByCode` — block `insurance` + `debtPanel`)

> gf-accounting `GET /api/v1/settlements/{code}` → agg `getSettlementByCode` (additive block `insurance` + `debtPanel`) → FE.
> **Status hiện tại**: nested SDL (`Settlement.insurance.breakdownByPayer.{metric}.{bh,kh}` metric-first, BUG-W01-209/213 còn áp dụng cho Surface B). Shape D reshape Surface A; Surface B chờ decision riêng (§4.3.7b.6 Open follow-up).

**Block B1 — `insurance` (panel "Tổng giá dịch vụ")**

| Concept | agg SDL (CANONICAL FE) | gf-accounting DTO (flat) | Drift |
|---|---|---|---|
| Cộng sau VAT BH/KH | `breakdownByPayer.totalAfterVat.{bh,kh}: Float` (metric-first nested) | `breakdownTotalAfterVat{Insurance,Customer}` | D9 flat→nested (agg mapper) |
| Dịch vụ / Phụ tùng / VAT BH-KH | `breakdownByPayer.{service,parts,vat}.{bh,kh}` (metric-first nested) | `breakdown{Service,Parts,Vat}{Insurance,Customer}` | D9 flat→nested (agg mapper) |
| CK liên kết VT / CDV / Giảm trừ | `{discountMaterial,discountLabor,claimReduction}: InsuranceAllocation{mode,value,amount}` | `*Mode` + `*Value` (read: `amount` computed) | composite OK |
| Khấu hao | `depreciation: InsuranceAllocation{amount}` | `depreciationDefaultPercent` (+ per-line từ SO) | D3-read: chỉ `amount` populated |
| Khấu trừ BH | `insuranceDeductible: InsuranceAllocation{amount}` | `insuranceDeductibleAmount` | D3-read: scalar→composite, chỉ `amount` |
| Cân thanh toán: BH/KH/Tổng | `settlementBalance.{bhPayment,customerPayment,totalPayment}: Float` | `insurancePayableAmount` (+ reconciliation) | OK (SDL↔web) |

**Block B2 — `debtPanel` (Còn phải thu BH)**

| Concept | agg SDL (CANONICAL FE) | gf-accounting DTO | Drift / resolution |
|---|---|---|---|
| Còn phải thu BH | `debtPanel.receivableAmount: Float` | `insurancePayableAmount` | **D4 naming** → agg mapper translate |
| Đã thu | `debtPanel.paidAmount: Float` | `totalPaid` | **D5 naming** → agg mapper translate |
| Còn lại | `debtPanel.remainingAmount: Float` | `remainingReceivable` | **D6 naming** → agg mapper translate |
| Trạng thái | `debtPanel.paymentStatus: SettlementPaymentStatus` | `derivedStatus {UNPAID,PARTIAL,FULLY_PAID,OVERPAID}` | **D7 enum** — SDL bổ sung `OVERPAID`/`FULLY_PAID` |
| Lịch sử thanh toán | `debtPanel.paymentHistory: [InsurancePaymentHistoryItem]` | (W02 scope) | W01 = placeholder `[]` |

**Surface B drift resolutions**

| ID | Drift | Resolution (CANONICAL) | Fix owner |
|---|---|---|---|
| D4/D5/D6 | debtPanel field names khác nhau backend↔SDL | Canonical = **SDL names** (`receivableAmount`/`paidAmount`/`remainingAmount`). agg resolver map từ gf-accounting names. Backend KHÔNG đổi. | agg-garage-graph FIX (mapper) |
| D7 | enum: gf-accounting 4 states (`FULLY_PAID`,`OVERPAID`) vs SDL 3 (`PAID`) | Canonical = **align SDL ↔ backend**: SDL thêm `FULLY_PAID` + `OVERPAID` (additive, no data loss); map `derivedStatus`→`paymentStatus` 1:1. | agg-garage-graph FIX |
| D9 | flat 8-field → nested `breakdownByPayer.{metric}.{bh,kh}` (metric-first) | Canonical = **nested metric-first SDL** (Surface B status quo). agg mapper transform `mapBreakdownByPayer` (`insurance.mapper.ts:189-220, 595-650`). **Pending §4.3.7b.6 Open follow-up** — nếu user pick D' option thì xoá nest + transform. | agg-garage-graph FIX (mapper) |
| D3-read | `insuranceDeductible`/`depreciation` scalar → composite `InsuranceAllocation` | Canonical = composite, chỉ `amount` populated on read (mode/value null). Document — KHÔNG cần backend đổi. | (doc only) |
| — | **Mobile chưa map** `insurance` + `debtPanel` block | Mobile thêm vào `settlement_detail_response.dart` + `settlement_extensions.dart` (bỏ fallback `=0`). | garage-mobile FIX |

**Invariants (BR-GF-ACCOUNTING-006, ADR-014)**:
- `insurance_payable_amount` **nhận từ request, KHÔNG tự tính** (gf-accounting). Snapshot immutable sau tạo phiếu.
- Cặp settlement CUSTOMER+INSURANCE persist atomic (`related_settlement_code`); rollback khi `settle` fail (synchronous, no Temporal).
- Backend (gf-accounting) + agg SDL ĐÃ implement block (W01 DEV). Gap còn lại = (a) agg mapper naming/nest/enum D4-D9, (b) mobile map block — FIX-stage.

##### 4.3.7b.5 Error mapping (REST → GraphQL) — canonical `INS_*` registry

> **Nguyên tắc**: gf-sales + gf-accounting emit `INS_*` registry code (BR-EP §5.5) + đúng HTTP status → agg-garage-graph **passthrough nguyên `code`** vào GraphQL error `extensions.code` (KHÔNG nuốt/đổi) → FE web+mobile bind theo `code` (KHÔNG parse message). Thay `GMS.gf-*.SETTLEMENT_*` cho **đường insurance** (đường customer baseline giữ nguyên). Quyết định: BE emit trực tiếp (không map ở BFF).
> **Authority chain**: CR-1780980611 (registry mapping) → CR-1781085632 (HTTP status 422→400 cho 5 VALIDATION codes INS-1002/1003/1004/1005/1008). INS-1006 (BH<0): 200 warning non-block (đổi hành vi từ 400 reject).

**Surface A — gf-sales (write path)**

| Validation | INS code | Num | HTTP REST | GraphQL surface | Mã cũ (thay) |
|---|---|---|---|---|---|
| Chưa chọn công ty BH | `INS_SO_COMPANY_REQUIRED` | 1002 | 400 | `errors[].extensions.code` (field) | (mới) |
| `%` ngoài [0,100] | `INS_ADJ_PERCENT_OUT_OF_RANGE` | 1003 | 400 | `extensions.code` (field) | `INVALID_ADJUSTMENT_PERCENT` |
| Số tiền > cơ sở | `INS_ADJ_AMOUNT_EXCEEDS_BASE` | 1004 | 400 | `extensions.code` (field) | `INVALID_ADJUSTMENT_AMOUNT` |
| Giá trị < 0 | `INS_ADJ_VALUE_NEGATIVE` | 1005 | 400 | `extensions.code` (field) | `INVALID_ADJUSTMENT_AMOUNT`/generic |
| BH thanh toán < 0 | `INS_ADJ_BH_PAYMENT_NEGATIVE` | 1006 | **200 (warning)** | `data` + warning payload (non-block) | reject 400 — **đổi hành vi** |
| mode sai | `INS_ADJ_MODE_INVALID` | 1008 | 400 | SDL enum chặn sớm HOẶC `extensions.code` | `INVALID_ALLOCATION_MODE` |

**Surface B — gf-accounting (read/create/cancel + insurance-payments)**

| Điều kiện | INS code | Num | HTTP REST | GraphQL surface | Mã cũ (thay) |
|---|---|---|---|---|---|
| Chưa chọn công ty BH (tạo phiếu) | `INS_STL_COMPANY_REQUIRED` | 2002 | 400 | `extensions.code` | (mới) |
| SO đã có phiếu QT BH active | `INS_STL_DUPLICATE_DRAFT` | 2003 | 409 | `extensions.code` | `GMS...SETTLEMENT_CREATE.05` |
| SO chưa hoàn thành | `INS_STL_SO_NOT_COMPLETED` | 2004 | 400 | `extensions.code` | (mới) |
| Tạo cặp / settle fail (rollback) | `INS_STL_PAIR_ATOMIC_FAILED` | 2005 | 500 | `extensions.code` + traceId | `GMS...SETTLEMENT_CREATE.08` |
| Không tìm thấy phiếu QT BH (read) | `INS_STL_NOT_FOUND` | 2006 | 404 | `extensions.code` (error state) | `GMS...SETTLEMENT_READ.03` |
| mode điều chỉnh sai | `INS_ADJ_MODE_INVALID` | 1008 | 400 | `extensions.code` | 500 Jackson / `INVALID_ALLOCATION_MODE` |

**Internal (flag #2 — KHÔNG vào registry FE)**: "SO không có hạng mục BH" (VLD-INS-STL-001) giữ `GMS.gf-accounting.SETTLEMENT_CREATE.06` (400) nội bộ.

**Cross-cutting**: `INS_FORBIDDEN_TENANT` (9001/403), `INS_UNAUTHENTICATED` (9002/401), `INS_INTERNAL_ERROR` (9000/500) → `extensions.code`. **agg KHÔNG được rewrite/normalize `code`** (PassthroughService discipline).

##### 4.3.7b.6 Open follow-up — Surface B wrapper reshape

> Surface B `getSettlementByCode.insurance` wrapper hiện vẫn nested (Settlement.insurance.breakdownByPayer.{metric}.{bh,kh}). Decision riêng PENDING — Shape D Surface A reshape đã lock 2026-06-10, Surface B chưa.

| Option | Tác động | Khuyến nghị |
|---|---|---|
| **D'** | Apply Shape D đệ quy: drop `Settlement.insurance` wrapper; bubble 14 field lên `Settlement` root (8 breakdown scalar + 3 balance scalar + 3 debtPanel scalar). Symmetric với Surface A. | ✅ **Recommended** — symmetric + single mental model. |
| **C** | Giữ `Settlement.insurance` wrapper nhưng flat fields inside (no `breakdownByPayer` nest). | Compromise — wrapper preserves grouping. |
| **Status quo** | Giữ nguyên nested SDL hiện tại. | Tránh — drift unresolved giữa Surface A và B. |

Decision sẽ commit qua artifact mới `Execution/test-reports/W01/BUG-W01-2XX-CR-AMENDMENT-SURFACE-B-DECISION.md` + update §4.3.7b.4 ↔ §4.3.7b.1 cho consistent.

#### 4.3.8 `campaign` (21 ops) — `src/graphql/modules/campaign/`

| Type | Operation | BE call |
|---|---|---|
| Q | getCampaigns | GET /api/v1/campaigns (gf-marketing) |
| Q | getCampaignById | GET /api/v1/campaigns/:id (gf-marketing) + templates batch + segment + voucher programs + tenant (creator) |
| Q | getCampaignByCode | GET /api/v1/campaigns/code/:code (gf-marketing) |
| Q | searchCampaigns | POST /api/v1/campaigns/search (gf-marketing) + tenant (createdBy) |
| Q | getCampaignStats | GET /api/v1/campaigns/:id/stats (gf-marketing) |
| Q | getCampaignWaves | GET /api/v1/campaigns/:id/waves (gf-marketing) |
| Q | getCampaignWave | GET /api/v1/campaigns/:id/waves/:waveId (gf-marketing) |
| Q | searchCampaignMessages | POST /api/v1/campaigns/messages/search (gf-marketing) + customer detail (**gf-customer**) |
| Q | getCampaignMessage | GET /api/v1/campaigns/messages/:messageId (gf-marketing) |
| Q | getNotificationLimits | GET /api/v1/notification-limits (gf-marketing) |
| Q | searchMessageTemplates | POST /api/v1/message-templates/search (gf-marketing) |
| M | createCampaign | POST /api/v1/campaigns (gf-marketing) |
| M | updateCampaign | PUT /api/v1/campaigns/:id (gf-marketing) |
| M | deleteCampaign | DELETE /api/v1/campaigns/:id (gf-marketing) |
| M | startCampaign | POST /api/v1/campaigns/:id/start (gf-marketing) |
| M | pauseCampaign | POST /api/v1/campaigns/:id/pause (gf-marketing) |
| M | resumeCampaign | POST /api/v1/campaigns/:id/resume (gf-marketing) |
| M | cancelCampaign | POST /api/v1/campaigns/:id/cancel (gf-marketing) |
| M | pauseCampaignWave | POST /api/v1/campaigns/:id/waves/:waveId/pause (gf-marketing) |
| M | resumeCampaignWave | POST /api/v1/campaigns/:id/waves/:waveId/resume (gf-marketing) |
| M | cancelCampaignWave | POST /api/v1/campaigns/:id/waves/:waveId/cancel (gf-marketing) |

#### 4.3.9 `voucher` (19 ops) — `src/graphql/modules/voucher/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchVoucherPrograms | POST /api/v1/voucher-programs/search (gf-marketing) |
| Q | getVoucherProgramById | GET /api/v1/voucher-programs/:id (gf-marketing) |
| Q | getActiveVoucherPrograms | GET /api/v1/voucher-programs/active (gf-marketing) |
| Q | searchVouchers | POST /api/v1/vouchers/search (gf-marketing) |
| Q | getVoucherById | GET /api/v1/vouchers/:id (gf-marketing) |
| Q | voucherRedemption | GET /api/v1/vouchers/:code/voucher-redemption (gf-marketing) |
| Q | validateVoucher | GET /api/v1/vouchers/validate (gf-marketing) |
| Q | customerDetail | GET /api/v1/vouchers/customer/:customerId (gf-marketing) |
| Q | getVoucherByCode | GET /api/v1/vouchers/code/:code (gf-marketing) |
| M | createVoucherProgram | POST /api/v1/voucher-programs (gf-marketing) |
| M | updateVoucherProgram | PUT /api/v1/voucher-programs/:id (gf-marketing) |
| M | deleteVoucherProgram | DELETE /api/v1/voucher-programs/:id (gf-marketing) |
| M | suspendVoucherProgram | POST /api/v1/voucher-programs/:id/suspend (gf-marketing) |
| M | resumeVoucherProgram | POST /api/v1/voucher-programs/:id/resume (gf-marketing) |
| M | generateVoucherProgramQr | POST /api/v1/voucher-programs/:id/generate-qr (gf-marketing) |
| M | cancelVoucherProgram | POST /api/v1/voucher-programs/:id/cancel (gf-marketing) |
| M | activateVoucherProgram | POST /api/v1/voucher-programs/:id/activate (gf-marketing) |
| M | claimVoucherByQr | POST /api/v1/voucher-programs/claim-qr (gf-marketing) |
| M | cancelVouchers | POST /api/v1/vouchers/cancel-batch (gf-marketing) |
| M | redeemVoucherByDriver | POST /api/v1/vouchers/redeem-by-driver (gf-marketing) |

#### 4.3.10 `notification` (5 ops) — `src/graphql/modules/notification/`

| Type | Operation | BE call |
|---|---|---|
| Q | getNotifications | GET /api/v1/notifications (gf-notification) |
| Q | getUnreadCount | GET /api/v1/notifications/unread-count (gf-notification) |
| M | markAsRead | PUT /api/v1/notifications/:id/mark-as-read (gf-notification) |
| M | markAllAsRead | PUT /api/v1/notifications/mark-all-as-read (gf-notification) |
| M | markAsReadPush | PUT /api/v1/notifications/:requestId/mark-as-read-push (gf-notification) |

#### 4.3.11 `supplier` (5 ops) — `src/graphql/modules/supplier/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchSuppliers | POST /api/v2/suppliers/search (gf-purchase) + catalog (city/ward) |
| Q | getSupplierById | GET /api/v2/suppliers/:id (gf-purchase) + warehouse (**gf-inventory**) + catalog |
| M | createSupplier | POST /api/v2/suppliers (gf-purchase) |
| M | updateSupplier | PUT /api/v2/suppliers/:id (gf-purchase) |
| M | toggleSupplierStatus | POST /api/v2/suppliers/:id/toggle-status (gf-purchase) |

#### 4.3.12 `dashboard` (3 ops) — `src/graphql/modules/dashboard/`

| Type | Operation | BE call |
|---|---|---|
| Q | getSpendingOverview | GET /api/v{1,2}/dashboard/spending-overview (gf-purchase) |
| Q | getStats | GET /api/v{1,2}/dashboard/stats (gf-purchase) |
| Q | getSpendingChart | GET /api/v{1,2}/dashboard/spending-chart (gf-purchase) |

#### 4.3.13 `warehouse` (3 ops) — `src/graphql/modules/warehouse/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchWarehouses | GET /api/v1/warehouses (gf-inventory) |
| Q | getWarehouseById | GET /api/v1/warehouses/:id (gf-inventory) |
| Q | getWarehouseByCode | GET /api/v1/warehouses/code/:warehouseCode (gf-inventory) |

#### 4.3.14 `catalog` (1 op + internal handlers) — `src/graphql/modules/catalog/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchCatalog | POST /api/v1/catalog/inquiry (gf-erp-mdm) |

> Note: Module có thêm internal handlers (`getHierarchy`, `getHierarchyList`, `findByCode`, `createHierarchy`) **không expose ở GraphQL schema** — chỉ dùng internal cho catalog enrichment trong các module khác. Endpoints internal: GET /api/v1/catalog/get-hierarchy, POST /api/v1/catalog/get-hierarchy-list, etc.

#### 4.3.15 `hrms` (19 ops) — `src/graphql/modules/hrms/`

##### `users` submodule

| Type | Operation | BE call |
|---|---|---|
| Q | hrmsUserById | GET /api/v1/users/:id (gf-hrms) |
| Q | hrmsSearchUsers | GET /api/v1/users/search (gf-hrms) |
| M | hrmsCreateUser | POST /api/v1/users (gf-hrms) |
| M | hrmsUpdateUser | PUT /api/v1/users/:id (gf-hrms) |
| M | hrmsRetryIam | POST /api/v1/users/:id/retry-iam (gf-hrms) |
| M | hrmsRetryConversation | POST /api/v1/users/:id/retry-conversation (gf-hrms) |
| M | hrmsToggleUserStatus | PATCH /api/v1/users/:id/toggle-status (gf-hrms) |

##### `employees` submodule

| Type | Operation | BE call |
|---|---|---|
| Q | getEmployeeById | GET /api/v1/employees/:id (gf-hrms) + catalog (province/ward) |
| Q | searchEmployees | GET /api/v1/employees (gf-hrms) |
| Q | getEmployeeByCode | GET /api/v1/employees/detail/:code (gf-hrms) + catalog |
| M | createEmployee | POST /api/v1/employees (gf-hrms) |
| M | updateEmployee | PUT /api/v1/employees/:id (gf-hrms) |
| M | changeEmployeeRole | PUT /api/v1/employees/:id/role (gf-hrms) |
| M | terminateEmployee | POST /api/v1/employees/:id/terminate (gf-hrms) |
| M | suspendEmployee | POST /api/v1/employees/:id/suspend (gf-hrms) |
| M | reactivateEmployee | POST /api/v1/employees/:id/reactivate (gf-hrms) |
| M | provisionEmployeeSso | POST /api/v1/employees/:id/provision-sso (gf-hrms) |
| M | disableEmployeeSso | POST /api/v1/employees/:id/disable-sso (gf-hrms) |
| M | enableEmployeeSso | POST /api/v1/employees/:id/enable-sso (gf-hrms) |

#### 4.3.16 `policy-agent` (7 ops) — `src/graphql/modules/policy-agent/`

| Type | Operation | BE call |
|---|---|---|
| Q | policyRoleById | GET /api/v1/roles/:roleId (policy-agent) |
| Q | policyRoleList | GET /api/v1/roles (policy-agent) |
| Q | policyResourceTypes | GET /api/v1/resources/resource-types (policy-agent) |
| Q | policyClientGetPermissions | GET /api/v1/policy-client/permissions (policy-agent) |
| M | policyRoleCreate | POST /api/v1/roles (policy-agent) |
| M | policyRoleUpdate | PUT /api/v1/roles/:roleId (policy-agent) |
| M | policyRoleDelete | DELETE /api/v1/roles/:roleId (policy-agent) |

#### 4.3.17 `user` (2 ops) — `src/graphql/modules/user/`

| Type | Operation | BE call |
|---|---|---|
| Q | getUserCards | GET /api/v2/user/cards (gf-purchase) |
| M | deleteUserCard | DELETE /api/v2/user/cards/:id (gf-purchase) |

#### 4.3.18 `tenant` (6 ops) — `src/graphql/modules/tenant/`

| Type | Operation | BE call |
|---|---|---|
| Q | getTenantInfo | GET /api/v{1,2}/tenant/info (gf-purchase) + catalog (province/ward/insurance) |
| Q | getCurrentUser | GET /api/v{1,2}/tenant/current-user (gf-purchase) |
| Q | searchUsers | POST /api/v1/saas-tenant/tenant-users/search/basic (**ct-saas-tenant**) |
| M | ecommerceConfirmed | POST /api/v{1,2}/tenant/ecommerce-confirmed (gf-purchase) |
| M | tcDataPrivacyConfirmed | POST /api/v{1,2}/tenant/tc-data-privacy-confirmed (gf-purchase) |
| M | deleteUser | DELETE /api/v{1,2}/tenant/current-user (gf-purchase) |

#### 4.3.19 `gf-system` (6 ops) — `src/graphql/modules/gf-system/tenant-ransporter-registry/`

| Type | Operation | BE call |
|---|---|---|
| Q | searchTenantTransporterRegistries | POST /api/v1/system/tenant-transporter-registry/search (gf-system) |
| Q | getTenantTransporterRegistryDetail | GET /api/v1/system/tenant-transporter-registry/:id (gf-system) |
| Q | getTenantTransporterRegistryDetailByCopTransporterRegistryId | GET /api/v1/system/tenant-transporter-registry/cop-transporter-registry/:copTransporterRegistryId (gf-system) |
| M | createTenantTransporterRegistry | POST /api/v1/system/tenant-transporter-registry (gf-system) |
| M | updateTenantTransporterRegistry | PUT /api/v1/system/tenant-transporter-registry/:id (gf-system) |
| M | deleteTenantTransporterRegistry | DELETE /api/v1/system/tenant-transporter-registry/:id (gf-system) |

#### 4.3.20 `supper-set` (1 op composite) — `src/graphql/modules/supper-set/`

| Type | Operation | BE call |
|---|---|---|
| Q | supperSetQuestToken | **3-step Superset chain**: POST /api/v1/security/login + GET /api/v1/security/csrf_token/ + POST /api/v1/security/guest_token/ (Superset, with cookie chaining + admin credentials) |

#### 4.3.21 `uploadFile` (5 ops) — `src/graphql/modules/uploadFile/`

| Type | Operation | BE call |
|---|---|---|
| M | uploadFiles | POST /images/v1/upload-files (ct-file-storage, multipart, field `images`) |
| M | uploadMultipleFiles | POST /api/v1/files/upload-files (ct-file-storage, multipart, field `files` + folderType, HEIC→JPG) |
| M | deleteFiles | DELETE /images/v1/delete-files (ct-file-storage) |
| M | uploadAttachment | POST /images/v1/upload-attachment (ct-file-storage, multipart, field `image`) |
| M | submitDocumentFeedback | POST /documents/v1/feedback (ct-file-storage, multipart) |

#### 4.3.22 `direct-purchase-order` (7 ops) — `src/graphql/modules/direct-purchase-order/`

| Type | Operation | BE call |
|---|---|---|
| Q | getDirectPurchaseOrderByCode | GET /api/v1/direct-purchase-orders/:poCode (gf-purchase) |
| Q | getPurchaseOrderForReceipt | GET /api/v2/purchase-order/:code/for-receipt (gf-purchase) |
| Q | searchDirectPurchaseOrders | GET /api/v3/purchase-order/search (gf-purchase) + catalog (carBrand/carModel) |
| M | createDirectPurchaseOrder | POST /api/v1/direct-purchase-orders (gf-purchase) |
| M | updateDirectPurchaseOrder | PUT /api/v1/direct-purchase-orders/:poCode (gf-purchase) |
| M | updateDirectPurchaseOrderStatus | PUT /api/v1/direct-purchase-orders/:poCode/status (gf-purchase) |
| M | updateDirectPurchaseOrderAttachments | PUT /api/v1/direct-purchase-orders/:poCode/attachments (gf-purchase) |

#### 4.3.23 `feature-flags` (1 op local) — `src/graphql/modules/feature-flags/`

| Type | Operation | BE call |
|---|---|---|
| Q | featureFlags | **Local read** từ `process.env.flags` (không call BE) |

#### 4.3.24 `enable-payment-method-mobile` (1 op) — `src/graphql/modules/enable-payment-method-mobile/`

| Type | Operation | BE call |
|---|---|---|
| Q | getEnablePaymentMethodMobile | GET /api/v2/feature-flags/mobile (gf-purchase) — client-side filter theo `app` param |

#### 4.3.25 `purchase` (5 ops, alias) — `src/graphql/modules/purchase/`

| Type | Operation | BE call |
|---|---|---|
| Q | prGetPaymentMethods | GET /api/v2/purchase-request/payment-methods (gf-purchase) |
| Q | getPreliminaryQuotation | GET /api/v2/quotation-asks/:code/preliminary-quotation (gf-purchase) + catalog (units) |
| M | prPlaceOrder | POST /api/v2/purchase-request/place-order/:prId (gf-purchase) |
| M | prCheckoutQR | POST /api/v2/purchase-request/checkout/qr/:prId (gf-purchase) |
| M | prCheckoutCC | POST /api/v2/purchase-request/checkout/cc/:prId (gf-purchase) |

### 4.4 Operation summary statistics

| Module group | Modules | Operations | Notes |
|---|---:|---:|---|
| gf-sales submodules | 8 | 41 | Includes 1 composite (dashboard-realtime); customers→gf-customer, quotation-ask→gf-sales; getSalesCustomerTags removed (not in source) |
| Single-BE modules (gf-customer, mdm, etc.) | 5 | 113 | gf-customer (31), mdm (44), notification (5), supplier (5), warehouse (3) — note: supplier composes 2 BE |
| Multi-BE composition | 6 | 57 | payment (5), gf-accounting (9), quotation (15), order (21), dashboard (3), supper-set (1) |
| Tier 3 support | 12 | 69 | catalog (1), hrms (19), policy-agent (7), user (2), tenant (6), gf-system (6), uploadFile (5), direct-purchase-order (7), feature-flags (1), enable-payment-method-mobile (1), purchase (5), purchase-request-detail-v2 (2) |
| **Total** | **25** | **~276** | Verified per-module counts |

### 4.5 Backend service load distribution

| BE service | # operations chính | % of total | Notes |
|---|---:|---:|---|
| gf-sales | ~41 | 15% | SO + booking (v2/v3) + dashboard-realtime + customers/vehicles/quotation-ask |
| gf-purchase | ~74 | 27% | Order (21) + quotation (15) + supplier (5) + payment partial + tenant + user + direct-PO (7) + dashboard (3) + enable-payment-method-mobile (1) + purchase (5) |
| gf-customer | ~31 | 11% | Customer master + segments + interactions + vehicles |
| gf-marketing | ~40 | 14% | Campaign (21) + voucher (19) |
| gf-inventory | ~47 | 17% | mdm (44) + warehouse (3) |
| gf-erp-mdm | ~25 (mostly enrichment) | 9% | Catalog inquiry (1 direct query) + ubiquitous catalog enrichment (most modules) |
| gf-hrms | 19 | 7% | Users (7) + employees (12) |
| gf-accounting | 7 | 3% | Settlements |
| gf-notification | 5 | 2% | Notification feed |
| gf-system | 6 | 2% | Tenant transporter registry (search + 2 detail queries + CRUD) |
| ct-saas-tenant | 1 (direct) + ubiquitous (tenant enrichment) | <1% | searchUsers + tenant context |
| ct-file-storage | 5 | 2% | Upload/download (multipart) |
| ac-payment-gateway | 2 | <1% | createPayment + getPaymentByPurchase |
| policy-agent | 7 | 3% | Roles + resources + permissions |
| Superset | 1 (3-step orchestration) | <1% | RLS guest token |

> Top 3 BE chiếm ~60% workload: gf-sales, gf-purchase, gf-inventory.

---

## 5. Flow Map

> Section này document **mọi GraphQL operation cần ≥2 BE** để hoàn tất một response — đó là **core value của aggregator** (vs thin proxy).
> Operation đơn giản (1 BE call) đã liệt kê trong §4.3 Operation Catalog, không lặp ở đây.

### 5.1 Composition Patterns (cách 1 GraphQL gọi nhiều BE)

5 pattern phân theo **mức độ multi-BE** + **cơ chế orchestration**:

| # | Pattern | Định nghĩa | Số BE call | Ví dụ điển hình |
|---|---|---|---:|---|
| **P1** | Single-BE passthrough | 1 GraphQL op → 1 BE endpoint, không enrichment. **Thin proxy, KHÔNG phải aggregator.** | 1 | `Mutation.createBookingV3` → POST /api/v3/bookings (gf-sales) |
| **P2** | BE + catalog enrichment | 1 BE primary + ≥1 batch lookup từ gf-erp-mdm catalog (sequential, optional) | 2 | `Query.getCustomer` → gf-customer + catalog (address) |
| **P3** | BE + multi-source enrichment | 1 BE primary + ≥2 secondary BE calls (catalog + tenant + cross-domain) | 3-4 | `Query.getReceiptByCode` → gf-inventory + catalog + tenant + supplier from gf-purchase |
| **P4** | Cross-domain composition | 1 GraphQL op gọi ≥2 BE primary, mỗi BE own state riêng | 2-4 | `Query.getPurchaseOrderDetailV3` → gf-purchase + linked SO from gf-sales + catalog + tenant |
| **P5** | Composite parallel (full aggregator) | 1 GraphQL op fan-out **N parallel BE calls** rồi compose response | 3-5+ | `Query.getDashboardRealtime` → 3× gf-sales + 2× gf-purchase parallel |

> P1 = thin proxy. **P2-P5 là core aggregator value**: BFF compose data thay vì client gọi nhiều endpoint.

### 5.2 Orchestration legend

| Term | Meaning |
|---|---|
| **Sequential** | BE2 cần result từ BE1 (vd extract codes from BE1 response → batch fetch BE2) |
| **Parallel** | BE1 và BE2 độc lập, gọi đồng thời (`Promise.all` hoặc `Promise.allSettled`) |
| **Conditional** | BE2 chỉ gọi khi BE1 trả điều kiện (vd linked-SO chỉ fetch nếu PO có soCode) |
| **Saga** | Nhiều mutation cross-BE với compensation (rare cho BFF; chủ yếu ở Temporal worker layer) |
| **Optional enrichment** | Secondary BE call có thể fail → graceful degrade (field=null), không block primary |
| **Batch** | 1 request fetch N items (vd `find-by-codes` array, `get-hierarchy-list` array) thay vì N×1 calls |

### 5.3 Cross-cutting flows (9 detailed in §6)

Đây là 9 flow phức tạp nhất với multi-step orchestration được expand chi tiết trong §6.

| # | Flow | Trigger | BE service + endpoints | Pattern | Anchor |
|---|---|---|---|---|---|
| 1 | Service order creation | `Mutation.createServiceOrder` (v3) | • **gf-sales**: POST `/api/v3/service-orders` (primary)<br>• **gf-customer**: GET `/api/v1/customers/:id` (enrichment)<br>• **gf-erp-mdm**: POST `/api/v1/catalog/get-hierarchy-list` (vehicle/unit codes)<br>• **gf-inventory**: POST `/api/v2/stocks/search` (stock check) | P3 — Sequential + parallel enrichment | [§6.1](#61-service-order-creation--lifecycle) |
| 2 | Settlement search + enrichment | `Query.searchSettlements`, `Mutation.createInsuranceSettlement` | • **gf-accounting**: POST `/api/v1/settlements/search` (primary)<br>• **gf-sales**: POST `/api/v3/service-orders/find-by-codes` (batch SO detail)<br>• **gf-erp-mdm**: POST `/api/v1/catalog/get-hierarchy-list` (insurance company)<br>• **ct-saas-tenant**: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy/updatedBy/settledBy) | P3 — Sequential + batch | [§6.2](#62-settlement-creation--so-enrichment) |
| 3 | PR checkout + payment | `Mutation.changePaymentMethod` → `Mutation.createPayment` | • **gf-purchase**: PUT `/api/v2/purchase-request/change-payment-method/:id` (Step 1)<br>• **ac-payment-gateway**: POST `/api/payments/create` (Step 2 separate GraphQL call) | P4 — Sequential, 2 GraphQL ops | [§6.3](#63-purchase-request-checkout--payment) |
| 4 | Customer 360 view | `Query.getCustomer` + nested fields | • **gf-customer**: GET `/api/v1/customers/:id` (primary)<br>• **gf-erp-mdm**: POST `/api/v1/catalog/get-hierarchy-list` (address ward/district/province)<br>• **gf-sales**: POST `/api/v2/service-orders/search` (SO history, optional)<br>• **gf-marketing**: GET `/api/v1/segments/:id/customers` (segment membership, optional)<br>• **gf-inventory**: POST `/api/v2/deliveries/search` (delivery history, optional) | P5 — Parallel optional enrichment | [§6.4](#64-customer-360-view) |
| 5 | Quotation ask + linked SO | `Query.getQuotationAskByCode` | • **gf-purchase**: GET `/api/v{1,2,3}/quotation-asks/detail/:code` (primary)<br>• **gf-erp-mdm**: POST `/api/v1/catalog/get-hierarchy-list` (spare parts hierarchy)<br>• **gf-sales**: GET `/api/v2/quotation-asks/by-code/:code/linked-service-order` (optional cross-domain link) | P3 — Sequential, conditional | [§6.5](#65-quotation-ask--linked-so) |
| 6 | Inventory delivery fulfillment | `Mutation.createDelivery` → `Mutation.completeDelivery` | • **gf-inventory**: POST `/api/v2/deliveries` + PUT `/api/v2/deliveries/:id/complete` (primary 2-step)<br>• **gf-erp-mdm**: POST `/api/v1/catalog/get-hierarchy-list` (unit codes)<br>• **gf-sales**: SO detail link (optional)<br>• **gf-purchase**: PO callback async (Kafka, not direct from BFF) | P3 — Sequential multi-step | [§6.6](#66-inventory-delivery-fulfillment) |
| 7 | Dashboard real-time metrics | `Query.getDashboardRealtime` | • **gf-sales** (×3): GET `/api/v2/dashboard/realtime/total-so-debt`, `/so-in-progress-count`, `/booking-arrived-without-so-count`<br>• **gf-purchase** (×2): GET `/api/v2/dashboard/realtime/quotation-asks-asking-count`, `/purchase-orders-delivering-count` | P5 — `Promise.all` 5 calls | [§6.7](#67-dashboard-real-time-metrics) |
| 8 | File upload (attachment) | `Mutation.uploadFiles` / `uploadMultipleFiles` | • **ct-file-storage**: POST `/api/v1/files/upload-files` (multipart, field `files`) | P1 — Single BE, multipart streaming | [§6.8](#68-file-upload-attachment) |
| 9 | Superset RLS dashboard token | `Query.supperSetQuestToken` | • **Superset** (×3 sequential): POST `/api/v1/security/login` (admin auth) → GET `/api/v1/security/csrf_token/` → POST `/api/v1/security/guest_token/` (RLS clause `tenant_id = ${tenantId}`) | P5 — Sequential composite, cookie chained | [§6.9](#69-superset-rls-dashboard-token) |

### 5.4 Multi-BE Operations Inventory

Mọi GraphQL operation `agg-garage-graph` mà 1 call → ≥2 BE endpoints. **~46 operations** (17% tổng) — đây là chỗ aggregator value rõ nhất.

> **Notation**: bullets list các BE endpoint cụ thể được gọi trong 1 GraphQL operation.
>
> Catalog endpoints (gf-erp-mdm) cho enrichment:
> - **Batch hierarchy** (phổ biến nhất): `POST /api/v1/catalog/get-hierarchy-list`
> - **Single hierarchy**: `POST /api/v1/catalog/get-hierarchy`
> - **Find by code** (field name mapping): `POST /api/v1/catalog/find-by-code`
>
> Tenant endpoint cho user enrichment: `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic`

#### Operations với ≥4 BE endpoints (full aggregator)

| Operation | Pattern | BE service + endpoints |
|---|---|---|
| `Query.getReceiptByCode` | P3 | • gf-inventory: GET `/api/v2/receipts/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy)<br>• gf-purchase: POST `/api/v3/purchase-order/supplier-names` |
| `Query.searchReceipts` | P3 | • gf-inventory: GET `/api/v2/receipts` (search)<br>• gf-purchase: POST `/api/v3/purchase-order/supplier-names`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (creators batch) |
| `Query.searchSettlements` | P3 + batch | • gf-accounting: POST `/api/v1/settlements/search`<br>• gf-sales: POST `/api/v3/service-orders/find-by-codes` (batch SO detail, max 50)<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (insurance company)<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (settledBy/createdBy/updatedBy) |
| `Query.getPurchaseOrderDetailV3` | P4 | • gf-purchase: GET `/api/v3/purchase-order/detail/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (province/commune/units)<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy/cancelledBy/etc.)<br>• gf-sales: GET `/api/v3/service-orders/detail/:soCode` (linked SO conditional) |
| `Query.getCampaignById` | P3 | • gf-marketing: GET `/api/v1/campaigns/:id` (primary)<br>• gf-marketing: POST `/api/v1/message-templates/search` (templates batch)<br>• gf-marketing: GET `/api/v1/segments/:segmentId` (segment detail)<br>• gf-marketing: POST `/api/v1/voucher-programs/search` (voucher programs batch)<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (creator) |
| `Query.getDashboardRealtime` | P5 | • gf-sales: GET `/api/v2/dashboard/realtime/total-so-debt`<br>• gf-sales: GET `/api/v2/dashboard/realtime/so-in-progress-count`<br>• gf-sales: GET `/api/v2/dashboard/realtime/booking-arrived-without-so-count`<br>• gf-purchase: GET `/api/v2/dashboard/realtime/quotation-asks-asking-count`<br>• gf-purchase: GET `/api/v2/dashboard/realtime/purchase-orders-delivering-count` |
| `Query.getServiceOrderByIdV3` | P5 | • gf-sales: GET `/api/v3/service-orders/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` + POST `/api/v1/catalog/find-by-code`<br>• gf-purchase: GET `/api/v1/purchase-order/related-service-order/:serviceOrderCode`<br>• gf-inventory: POST `/api/v2/deliveries/search`<br>• gf-accounting: POST `/api/v1/settlement/search`<br>• gf-hrms: GET `/api/v1/employees/:id` |
| `Query.getServiceOrderByCode` | P5 | • gf-sales: GET `/api/v3/service-orders/detail/:code`<br>• (same 6 enrichment calls as getServiceOrderByIdV3) |
| `Query.getMobileDeliveryById` | P4 | • gf-inventory: GET `/api/v2/deliveries/mobile/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic`<br>• gf-sales: POST `/api/v3/service-orders/customer-info` + GET `/api/v3/service-orders/detail/:code` |
| `Query.getDeliveryByCode` | P4 | • gf-inventory: GET `/api/v2/deliveries/:code`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic`<br>• gf-sales: GET `/api/v3/service-orders/detail/:code` + POST `/api/v3/service-orders/customer-info` |
| `Query.searchDeliveries` | P4 | • gf-inventory: POST `/api/v2/deliveries/search`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic`<br>• gf-sales: POST `/api/v3/service-orders/find-by-codes` + POST `/api/v3/service-orders/customer-info` |

#### Operations với 3 BE endpoints

| Operation | Pattern | BE service + endpoints |
|---|---|---|
| `Query.getServiceOrderById` | P3 | • gf-sales: GET `/api/v2/service-orders/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle hierarchy + units + insurance)<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (creator employee) |
| `Query.getSettlementByCode` | P4 | • gf-accounting: GET `/api/v1/settlements/:code`<br>• gf-sales: GET `/api/v3/service-orders/detail/:soCode` (full SO detail)<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy/updatedBy/settledBy) |
| `Query.getSupplierById` | P3 | • gf-purchase: GET `/api/v2/suppliers/:supplierId`<br>• gf-inventory: GET `/api/v1/warehouses/code/:warehouseCode` (preferred warehouse)<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (province + commune) |
| `Query.quotationAskByCode` | P3 | • gf-purchase: GET `/api/v{1,2,3}/quotation-asks/detail/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle + spare parts)<br>• gf-sales: GET `/api/v2/quotation-asks/by-code/:code/linked-service-order` (optional) |
| `Query.supperSetQuestToken` | P5 | • Superset: POST `/api/v1/security/login` (admin auth, returns access_token + cookies)<br>• Superset: GET `/api/v1/security/csrf_token/` (admin token + cookies)<br>• Superset: POST `/api/v1/security/guest_token/` (admin + CSRF + cookies, body has RLS clause `tenant_id = ${tenantId}`) |
| `Query.getPartsForDeliveryV3` | P3 | • gf-sales: GET `/api/v3/service-orders/code/:code/for-delivery`<br>• gf-inventory: POST `/api/v2/products/stock/cost-price`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code` |
| `Query.searchDeliveriesMobile` | P3 | • gf-inventory: POST `/api/v2/deliveries/mobile/search`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic`<br>• gf-sales: POST `/api/v3/service-orders/customer-info` |
| `Query.getServiceById` | P3 | • gf-inventory: GET `/api/v1/services/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` |
| `Query.searchServices` | P3 | • gf-inventory: GET `/api/v1/services`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` |

#### Operations với 2 BE endpoints (P2 catalog enrichment phổ biến)

| Operation | Pattern | BE service + endpoints |
|---|---|---|
| `Query.getCustomer` | P2 | • gf-customer: GET `/api/v1/customers/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (ward/district/province) |
| `Query.getVehicle` | P2 | • gf-customer: GET `/api/v1/vehicles/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (brand/model/version/year) |
| `Query.searchVehicles` | P2 | • gf-customer: POST `/api/v1/vehicles/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (batch enrichment) |
| `Query.suggestVehicleByPlate` | P2 | • gf-customer: GET `/api/v1/vehicles/suggest`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` |
| `Query.searchProducts` | P2 | • gf-inventory: GET `/api/v2/products/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units) |
| `Query.searchGroupedProducts` | P2 | • gf-inventory: GET `/api/v2/products/search-grouped`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units, group + variants) |
| `Query.searchDeliveries` | P2 | • gf-inventory: GET `/api/v2/deliveries/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (delivery item units) |
| `Query.searchPeriodStocksMobile` | P2 | • gf-inventory: GET `/api/v2/period-stocks/mobile/list`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units) |
| `Query.getPeriodStockDetailMobile` | P2 | • gf-inventory: GET `/api/v2/period-stocks/mobile/detail`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units) |
| `Query.searchServiceOrders` | P2 | • gf-sales: POST `/api/v2/service-orders/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle hierarchy batch) |
| `Query.suggestVehicles` | P2 | • gf-sales: GET `/api/v2/vehicles/suggest`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` |
| `Query.searchSuppliers` | P2 | • gf-purchase: POST `/api/v2/suppliers/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (city/ward) |
| `Query.getCart` | P2 | • gf-purchase: GET `/api/v1/cart`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (spare part units) |
| `Query.getPurchaseRequestDetail` | P2 | • gf-purchase: GET `/api/v{1,2}/purchase-request/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (parts hierarchy) |
| `Query.searchPurchaseRequests` | P2 | • gf-purchase: POST `/api/v{1,2}/purchase-request/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (carBrand/carModel batch) |
| `Query.getPurchaseOrder` | P2 | • gf-purchase: GET `/api/v{1,2}/purchase-order/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units) |
| `Query.searchDirectPurchaseOrders` | P2 | • gf-purchase: GET `/api/v3/purchase-order/search`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (carBrand/carModel) |
| `Query.getPreliminaryQuotation` | P2 | • gf-purchase: GET `/api/v2/quotation-asks/:code/preliminary-quotation`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (units) |
| `Query.quotationAskById` (V1/V2/V3) | P2 | • gf-purchase: GET `/api/v{1,2,3}/quotation-asks/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle + spare parts) |
| `Query.searchQuotationAsks` | P2 | • gf-purchase: GET `/api/v{1,2}/quotation-asks` (paginated)<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle hierarchy batch) |
| `Query.searchQuotationAsksForWeb` | P2 | • gf-purchase: GET `/api/v2/quotation-asks/search-for-web`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle + attachments) |
| `Query.searchSpareParts` | P2 | • gf-purchase: GET `/api/v1/quotation-asks/spare-parts`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (unit data) |
| `Query.quotationAskHistories` | P2 | • gf-purchase: GET `/api/v{1,2}/quotation-asks/:code/histories`<br>• gf-erp-mdm: POST `/api/v1/catalog/find-by-code` (field name mapping) |
| `Query.quotationAskChatByCode` | P2 | • gf-purchase: GET `/api/v{1,2}/quotation-asks/chat/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle info) |
| `Query.getEmployeeById` | P2 | • gf-hrms: GET `/api/v1/employees/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (province/ward) |
| `Query.getEmployeeByCode` | P2 | • gf-hrms: GET `/api/v1/employees/detail/:code`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (province/ward) |
| `Query.getTenantInfo` | P3 | • gf-purchase: GET `/api/v{1,2}/tenant/info`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (province/ward/district/insurance) |
| `Query.searchSegments` | P2 | • gf-customer: POST `/api/v1/segments/search`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy) |
| `Query.getSegment` | P2 | • gf-customer: GET `/api/v1/segments/:id`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (city codes) |
| `Query.searchCampaigns` | P2 | • gf-marketing: POST `/api/v1/campaigns/search`<br>• ct-saas-tenant: POST `/api/v1/saas-tenant/tenant-users/search/basic` (createdBy) |
| `Query.searchCampaignMessages` | P4 | • gf-marketing: POST `/api/v1/campaigns/messages/search`<br>• gf-customer: POST `/api/v1/customers/search` (customer detail enrichment) |
| `Mutation.confirmBooking` (+decline/cancel/arrive) | P2 | • gf-sales: PUT `/api/v2/bookings/:id/{confirm,decline,cancel,arrive}`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle hierarchy in response) |
| `Mutation.createQuotationAsk` (V1/V2) | P2 | • gf-purchase: POST `/api/v{1,2}/quotation-asks`<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle + spare parts in response) |
| `Mutation.createQuotationAskV3` | P2 | • gf-purchase: POST `/api/v3/quotation-asks` (with invoice info)<br>• gf-erp-mdm: POST `/api/v1/catalog/get-hierarchy-list` (vehicle hierarchy) |

### 5.5 Anti-pattern: Same-name modules but different BE

Trong agg-garage-graph có một số module tên trùng với BE name nhưng forward sang BE **khác** — dễ gây nhầm lẫn khi đọc code:

| BFF module | Tưởng forward đến | Thực tế forward đến |
|---|---|---|
| `gf-sales/customers` (submodule) | gf-sales | **gf-sales** (suggest queries) **+ gf-customer** (CRUD mutations — create/update/delete/merge/import theo ADR-001 customer master ownership) |
| `gf-sales/quotation-ask` (submodule) | gf-sales (correct) | **gf-sales** — actually forwards to gf-sales despite quotation-ask domain belonging to gf-purchase |
| `payment` module | ac-payment-gateway only | **ac-payment-gateway + gf-purchase** (config split) |
| `tenant` module | ct-saas-tenant | **gf-purchase** (tenant info wrapper) **+ ct-saas-tenant** (search users) |
| `dashboard` module | gf-sales | **gf-purchase** (spending overview/stats/chart) |
| `dashboard-realtime` (gf-sales submodule) | gf-sales only | **gf-sales × 3 + gf-purchase × 2** parallel |

> **Rule**: Module namespace ở BFF KHÔNG phản ánh BE ownership. Luôn check resolver source (`*.resolver.ts`) hoặc bảng §4.3 Operation Catalog để biết BE thực sự forward.

---

## 6. Per-flow Detail

> Section này expand 9 flows từ §5.3 thành **detailed orchestration walkthrough** — show explicit BE call sequence, error mapping, idempotency, transaction boundary cho từng flow.
> Reference operations cho các flow KHÔNG nằm trong 9 chính thức ở đây có thể tra trong §4.3 Operation Catalog (per-module tables) hoặc §5.4 Multi-BE Inventory.

### 6.1 Service order creation + lifecycle

**GraphQL operation**: `Mutation.createServiceOrder` (v3)

**Trigger**: User staff confirm booking → tạo SO; hoặc walk-in customer trực tiếp tạo SO

**BE call sequence**:

```
[Client] Mutation.createServiceOrder({ customerId, vehicleId, items, ... })
  ↓
[gf-sales/service-orders-v3.resolver]
  ↓ POST /api/v3/service-orders (gf-sales)
    Body: { customer, vehicle, items, technicianId, branchId, ... }
  ← { id, code, status, items, ... }
  ↓ (Optional parallel enrichment)
  ├─ gf-customer: GET /api/v1/customers/{customerId} → customer 360
  ├─ gf-erp-mdm: POST /api/v1/catalog/get-hierarchy-list → enrich part/unit codes
  └─ gf-inventory: POST /api/v2/stocks (search) → check available stock
  ↓
[Compose response]
  ← { id, code, customer, items (enriched), stockStatus, ... }
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | gf-sales | `POST /api/v3/service-orders` | SO payload | created SO | Critical fail → abort, surface error |
| 2 | gf-customer | `GET /api/v1/customers/{id}` | customer ID from SO | customer 360 | Optional — fail = field=null |
| 3 | gf-erp-mdm | `POST /api/v1/catalog/get-hierarchy-list` | array of code | hierarchies | Optional — fail = item codes raw |
| 4 | gf-inventory | `POST /api/v2/stocks/search` | warehouseId + skus | stock levels | Optional — fail = stockStatus null |

**DataLoader strategy**: Không dùng DataLoader. Batch enrichment qua direct batch endpoints (`get-hierarchy-list` với array, `find-by-codes` cho SO).

**Error mapping**:
- gf-sales fail (4xx) → `extensions.code: BAD_USER_INPUT`, abort, không gọi enrichment
- gf-sales fail (5xx) → `extensions.code: INTERNAL_SERVER_ERROR`, abort
- Enrichment fail (gf-customer / gf-erp-mdm / gf-inventory) → log warning, return partial SO với field nullable

**Transaction boundary**: gf-sales own transaction. Enrichment đọc-only, không transaction.

**Idempotency**:
- Client có thể provide `Idempotency-Key` header → forwarded xuống gf-sales
- gf-sales sequence-based code generation (`SO-yyyyMMdd-NNNNN`) đảm bảo unique constraint

---

### 6.2 Settlement creation + SO enrichment

**GraphQL operation**: `Mutation.createInsuranceSettlement` (gf-accounting module) hoặc `Query.searchSettlements`

**Trigger**: Staff complete service → create settlement (customer / insurance); hoặc list settlement

**BE call sequence cho `searchSettlements`** (read-heavy, batch enrichment):

```
[Client] Query.searchSettlements({ filter, page, size })
  ↓
[gf-accounting/settlements.resolver]
  ↓ POST /api/v1/settlements/search (gf-accounting)
  ← { content: [...settlement], page, totalElements }
  ↓ Extract unique soCodes from settlements (max 50)
  ↓ Parallel:
  ├─ gf-sales: POST /api/v3/service-orders/find-by-codes
  │   Body: { soCodes: [...] }
  │   ← { content: [...so] } map by code
  ├─ gf-erp-mdm: POST /api/v1/catalog/get-hierarchy-list
  │   Body: { codes: [insuranceCompanyCode, ...] }
  │   ← hierarchy map
  └─ tenant: GET /api/v1/saas-tenant/users/by-id
      ← user info for settledBy field
  ↓
[Merge]
  Each settlement enriched with: serviceOrder detail, insurance company name, settler name
  ← { content: [...enriched], page, ... }
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | gf-accounting | `POST /api/v1/settlements/search` | filter, paging | settlements | Critical → surface error |
| 2 | gf-sales | `POST /api/v3/service-orders/find-by-codes` (batch) | soCodes array | SO map by code | Optional → enrichment skip if fail |
| 3 | gf-erp-mdm | `POST /api/v1/catalog/get-hierarchy-list` (batch) | code array | hierarchy map | Optional → keep raw codes |
| 4 | ct-saas-tenant | `GET /api/v1/saas-tenant/users/by-id` | userId | user detail | Optional → field null |

**DataLoader strategy**: Không. Batch endpoints tạo 1 request cho N items (max 50/batch).

**Error mapping**:
- gf-accounting fail → abort, surface error
- Enrichment fail → graceful degrade với raw codes/null fields

**Transaction boundary**: Read-only.

**Performance note**: Batch SO enrichment giới hạn 50 items/page → search size > 50 cần multi-batch hoặc không enrich SO. Settlement create cũng có flow tương tự (gf-accounting create → callback gf-sales `PUT /protected/v1/service-orders/{tenantId}/{code}/settle`).

---

### 6.3 Purchase request checkout + payment

**GraphQL operations**: `Mutation.changePaymentMethod` + `Mutation.createPayment`

**Trigger**: User mobile/web select payment method → confirm purchase → trigger payment gateway

**BE call sequence**:

```
[Client] Mutation.changePaymentMethod({ purchaseRequestId, methodCode })
  ↓
[payment.resolver / order.resolver]
  ↓ PUT /api/v2/purchase-request/change-payment-method/{id} (gf-purchase)
  ← { success: true }

(Client confirms)
[Client] Mutation.createPayment({ purchaseCode, amount, method, returnUrl })
  ↓
[payment.resolver]
  ↓ POST /api/payments/create (ac-payment-gateway)
    Headers: Authorization, x-api-key-feedback
    Body: { providerCode, amount, currency: 'VND', method, returnUrl }
  ← { paymentId, paymentUrl, providerStatus }
[Client redirect to paymentUrl]
```

**BE calls table**:

| Step | BE | Operation | Required input | Output | Failure mode |
|---|---|---|---|---|---|
| 1 | gf-purchase | `PUT /api/v2/purchase-request/change-payment-method/{id}` | id, methodCode | success | 4xx → `BAD_USER_INPUT` |
| 2 | ac-payment-gateway | `POST /api/payments/create` | provider, amount, currency, returnUrl | paymentId, paymentUrl | 402/500 → custom `ErrorResponse` union variant |

**DataLoader strategy**: N/A.

**Error mapping**:
- ac-payment-gateway 402 (declined) → `ErrorResponse` union với code `PAYMENT_DECLINED`
- 500 → `ErrorResponse` union với code `PAYMENT_GATEWAY_ERROR`
- Idempotency: client should provide deterministic key per purchase to avoid double-charge

**Transaction boundary**: gf-purchase commit changePaymentMethod trước; createPayment là separate transaction ở payment gateway. Recovery khi payment fail nhưng PR đã update method → manual reconcile hoặc client retry.

**Idempotency**:
- ac-payment-gateway hỗ trợ idempotency key → BFF forward
- changePaymentMethod idempotent (PUT same value = no-op)

---

### 6.4 Customer 360 view

**GraphQL operation**: `Query.getCustomer(id)` với nested fields

**Trigger**: Mobile/web mở chi tiết customer

**BE call sequence**:

```
[Client] Query.getCustomer(id) {
  id, name, phone, email, address {...},
  serviceOrders { ... },
  segments { ... },
  deliveries { ... },
  vehicles { ... }
}
  ↓
[gf-customer.resolver]
  ↓ GET /api/v1/customers/{id} (gf-customer)
  ← { id, name, phone, email, addressCode, vehicles, ... }
  ↓ Parallel optional enrichment (Promise.allSettled):
  ├─ gf-erp-mdm: POST /api/v1/catalog/get-hierarchy-list
  │   Body: { codes: [addressCode, wardCode, provinceCode] }
  │   ← address hierarchy names
  ├─ gf-sales: POST /api/v2/service-orders/search
  │   Body: { customerId: id, page: 0, size: 10 }
  │   ← recent service orders
  ├─ gf-marketing: GET /api/v1/segments/{id}/customers (membership check)
  │   ← segment list customer thuộc về
  └─ gf-inventory: POST /api/v2/deliveries/search
      Body: { customerId: id }
      ← delivery history
  ↓
[Compose response]
  ← Customer object với address names, recent SOs, segments, deliveries
```

**BE calls table**:

| Step | BE | Operation | Output | Failure mode |
|---|---|---|---|---|
| 1 | gf-customer | `GET /api/v1/customers/{id}` | customer base | Critical → 404 / 500 surface |
| 2 | gf-erp-mdm | `POST /api/v1/catalog/get-hierarchy-list` | address names | Optional — fail = raw codes |
| 3 | gf-sales | `POST /api/v2/service-orders/search` | SO list | Optional — fail = empty array |
| 4 | gf-marketing | `GET /api/v1/segments/{id}/customers` | segment list | Optional — fail = empty array |
| 5 | gf-inventory | `POST /api/v2/deliveries/search` | delivery list | Optional — fail = empty array |

**DataLoader strategy**: Không dùng (single customer fetch). Nếu list customers (`searchCustomers`), enrichment per-customer có risk N+1 — hiện chưa optimize.

**Error mapping**: gf-customer fail = critical, surface error. Enrichment fail = silent log + empty/null field (graceful degradation).

**Transaction boundary**: Read-only.

**Performance**: Latency = max(BE1) + max(BE2..BE5) ≈ ~300-500ms p99. Nếu customer có nhiều SOs/deliveries → enrichment chậm.

---

### 6.5 Quotation ask + linked SO

**GraphQL operation**: `Query.getQuotationAskByCode(code)`

**Trigger**: Staff mở quotation ask detail từ list

**BE call sequence**:

```
[Client] Query.getQuotationAskByCode(code) {
  code, items, status,
  spareParts (enriched),
  linkedServiceOrder { ... }
}
  ↓
[quotation.resolver]
  ↓ GET /api/v2/quotation-asks/detail/{code} (gf-purchase)
  ← { code, items, sparePartCodes, ... }
  ↓ Parallel:
  ├─ gf-erp-mdm: POST /api/v1/catalog/get-hierarchy-list
  │   Body: { codes: [...sparePartCodes] }
  │   ← spare parts hierarchy
  └─ gf-sales: GET /api/v2/quotation-asks/by-code/{code}/linked-service-order
      ← { soCode, soId, soStatus } (or null nếu chưa linked)
  ↓
[Compose]
  ← Quotation ask with enriched parts + linked SO reference
```

**BE calls table**:

| Step | BE | Operation | Output | Failure mode |
|---|---|---|---|---|
| 1 | gf-purchase | `GET /api/v2/quotation-asks/detail/{code}` | quotation ask | Critical |
| 2 | gf-erp-mdm | `POST /api/v1/catalog/get-hierarchy-list` (batch) | parts hierarchy | Optional |
| 3 | gf-sales | `GET /api/v2/quotation-asks/by-code/{code}/linked-service-order` | linked SO | Optional — null if not linked |

**Error mapping**: gf-purchase critical; enrichment optional.

---

### 6.6 Inventory delivery fulfillment

**GraphQL operations**: `Mutation.createDelivery` → `Mutation.completeDelivery`

**Trigger**: Warehouse staff prepare delivery cho service order parts

**BE call sequence cho `completeDelivery`**:

```
[Client] Mutation.completeDelivery({ id })
  ↓
[mdm.resolver]
  ↓ PUT /api/v2/deliveries/{id}/complete (gf-inventory)
  ← { id, status: 'COMPLETED', items, soCode, ... }
  ↓ (Optional, fire-and-forget logged)
  ├─ gf-sales: PUT protected SO update (if SO linked)
  └─ gf-purchase: notify PO completion (if PO linked)
  ↓ Parallel enrichment
  ├─ gf-erp-mdm: POST /api/v1/catalog/get-hierarchy-list (unit codes)
  └─ gf-sales: GET SO detail (if needed for response)
  ↓
[Compose]
  ← Delivery với stock impact summary, SO ref, PO ref
```

**BE calls table**:

| Step | BE | Operation | Output | Failure mode |
|---|---|---|---|---|
| 1 | gf-inventory | `PUT /api/v2/deliveries/{id}/complete` | completed delivery + stock update | Critical |
| 2 | gf-erp-mdm | `POST /api/v1/catalog/get-hierarchy-list` | unit/part hierarchy | Optional |
| 3 | gf-sales | SO detail enrichment | SO snapshot | Optional |
| 4 | gf-purchase | PO callback | acknowledgment | Optional, async |

**Error mapping**: gf-inventory critical; downstream callbacks (gf-sales, gf-purchase) async qua Kafka event ở backend layer (not direct from BFF).

**Transaction boundary**: gf-inventory atomic transaction (delivery + stock update). Cross-service updates async qua event.

---

### 6.7 Dashboard real-time metrics

**GraphQL operation**: `Query.getDashboardRealtimeMetrics`

**Trigger**: Staff dashboard mounted hoặc poll (5s interval)

**BE call sequence**:

```
[Client] Query.getDashboardRealtimeMetrics
  ↓
[dashboard.resolver]
  ↓ Promise.all([
      gf-sales: GET /api/v2/dashboard/realtime/in-progress-so-count,
      gf-sales: GET /api/v2/dashboard/realtime/debt-count,
      gf-sales: GET /api/v2/dashboard/realtime/booking-arrived-without-so-count,
      gf-purchase: GET /api/v2/dashboard/realtime/quotation-asks-waiting-count,
      gf-purchase: GET /api/v2/dashboard/realtime/purchase-orders-delivering-count,
    ])
  ↓
[Compose]
  ← { inProgressSoCount, debtCount, bookingArrivedCount,
      quotationAsksWaitingCount, posDeliveringCount }
```

**BE calls table**: 5 parallel REST calls, each ~50-100ms.

**Error mapping**: Per-call try-catch → individual field null nếu fail; toast warning ở UI nhưng dashboard vẫn render.

**Performance target**: p99 < 800ms (5 parallel calls limited by slowest).

**Caching opportunity**: TTL 5s cache layer ở BFF có thể giảm load cho dashboard polling — chưa implement.

---

### 6.8 File upload (attachment)

**GraphQL operation**: `Mutation.uploadFiles(files: [Upload!])`

**Trigger**: Staff upload attachment cho SO, settlement, document feedback

**BE call sequence**:

```
[Client] Mutation.uploadFiles(files: [Upload!])
  ↓
[upload middleware] processUploads
  - Parse multipart/form-data
  - multer memory storage (per file ≤ 30MB)
  - Convert files to GraphQL Upload objects (createReadStream)
  ↓
[uploadFile.resolver]
  ↓ Build FormData (each file streamed)
  ↓ POST /api/v1/files/upload-files (ct-file-storage)
    Headers: Authorization, x-api-key-feedback
    Body: FormData (multipart)
  ← { files: [{ id, url, mimeType, size }] }
[Return file metadata to client]
```

**Special handling**:
- Body limit `SERVER_LIMIT` = 30MB default
- Per-file streaming (no buffering toàn bộ file in memory)
- Download endpoint riêng: `GET /graphql/download?fileId=...&token=...`

**Error mapping**: ct-file-storage 4xx (validation, MIME) → wrap `ErrorResponse`; 5xx → log + retry guidance.

---

### 6.9 Superset RLS dashboard token

**GraphQL operation**: `Query.supperSetQuestToken({ dashboardId })`

**Trigger**: Embedded BI dashboard load

**BE call sequence**: 3-step Superset chain (cookie chained, không proxy GraphQL → cần admin credential).

```
[Client] Query.supperSetQuestToken({ dashboardId })
  ↓
[supper-set.resolver / supperset.proxy]
  ↓ Decode Authorization JWT → extract custom:tenant_id
  ↓
  Step 1: POST /api/v1/security/login (Superset)
    Body: { username: SUPERSET_ADMIN_USERNAME, password: SUPERSET_ADMIN_PASSWORD }
    ← { access_token, set-cookie: [...] }
  ↓
  Step 2: GET /api/v1/security/csrf_token/ (Superset)
    Headers: Bearer admin_token + Cookie collected
    ← { result: csrf_token, set-cookie: [...] }
  ↓
  Step 3: POST /api/v1/security/guest_token/ (Superset)
    Headers: Bearer admin_token + X-CSRFToken + Cookie merged
    Body: {
      user: { username, ... },
      resources: [{ type: 'dashboard', id: dashboardId }],
      rls: [{ clause: `tenant_id = ${tenantId}` }]
    }
    ← { token: guestToken }
  ↓
[Return guestToken to client → embed dashboard]
```

**BE calls table**: 3 sequential Superset calls.

**Error mapping**: Mọi step fail → `ErrorResponse` với code `SUPPERSET_ERROR` (không phân biệt step).

**Performance concern**: Admin token fetched fresh mỗi request → tăng latency. Mitigation: cache admin token TTL 5 phút (chưa implement).

**Security**: RLS clause `tenant_id = {tenantId}` enforced ở Superset side. Phụ thuộc vào JWT validation upstream.

---

## 7. N+1 Prevention (cross-backend strategy)

**Status**: agg-garage-graph **không dùng DataLoader** — dùng **direct batch endpoints** thay thế.

### Batch endpoints used cross-BE

| Endpoint | BE | Use case | Max batch | Latency budget |
|---|---|---|---|---|
| `POST /api/v1/catalog/get-hierarchy-list` | gf-erp-mdm | Enrich units, categories, addresses, insurance company | 100 codes | p99 < 200ms |
| `POST /api/v3/service-orders/find-by-codes` | gf-sales | Batch SO lookup cho settlement enrichment | 50 codes | p99 < 300ms |
| `POST /api/v1/saas-tenant/tenant-users/search/basic` | ct-saas-tenant | Batch user info enrichment | 100 ids | p99 < 200ms |
| `POST /api/v2/stocks/search` | gf-inventory | Stock lookup cho list parts | 50 SKUs | p99 < 250ms |

### Risk N+1

- `Query.searchCustomers` với nested `customer.recentServiceOrders` cho mỗi customer → N+1 nếu không dùng batch endpoint per-customer
- `Query.searchSettlements` với nested SO detail cho mỗi settlement → đã dùng batch (max 50)
- `Query.searchServiceOrders` với nested customer → N+1 tiềm ẩn nếu UI request

**Mitigation**: BFF resolver pattern phải dùng batch endpoints khi list query ≥10 items. CR audit per resolver.

### Hardening đề xuất

- Introduce DataLoader cho field nested phổ biến: `Order.customer`, `SO.assignedTechnician`, `Cart.items.product`
- Backend phải expose batch endpoints chuẩn (đã có catalog, find-by-codes, users; cần thêm GfHrms users batch, GfMarketing segments batch)

---

## 8. Caching Strategy

### 8.1 Per-request cache

**Không dùng DataLoader** → không có per-request cache. Mỗi resolver gọi BE độc lập.

### 8.2 Application-level cache

**Không có Redis / Apollo cache layer cross-request.** Chỉ có browser HTTP cache cho `/health` và `/metrics`.

### 8.3 Cache opportunities (chưa implement)

| Field/op | BE | Suggested TTL | Invalidation |
|---|---|---|---|
| `Query.getFeatureFlags` | gf-sales | 5 min | TTL fallback |
| `Query.tenantInfo` | ct-saas-tenant | 10 min | TTL fallback |
| `Query.catalogHierarchy` | gf-erp-mdm | 30 min | TTL + manual on update |
| Superset admin token | Superset | 5 min | TTL |
| Dashboard real-time metrics | gf-sales + gf-purchase | 5s | TTL (poll-friendly) |

### 8.4 Cache stampede protection

N/A — chưa có cache layer.

---

## 9. Schema Contract (cross-BE codegen sync)

### 9.1 Backend schema sources

| BE | Contract source | Sync mechanism |
|---|---|---|
| gf-* services | `Architecture/api/{boundary}-api.md` (REST contract) | Manual review + đồng bộ với resolver |
| ct-saas-tenant | External Swagger (ct-* team) | Manual review |
| ct-file-storage | External Swagger | Manual review |
| ac-payment-gateway | Provider Swagger (no version pin) | Manual review |
| Superset | Superset REST API docs | Manual review |
| policy-agent | Internal Swagger | Manual review |

### 9.2 BFF schema mapping

`src/graphql/modules/{module}/{module}.schema.ts` (TypeDefs) + `{module}.resolver.ts` (resolvers).

`src/config/endpoints.ts` (666 dòng) là single source of truth cho endpoint paths — `API_ENDPOINTS_V1`, `_V2`, `_V3`.

### 9.3 Type generation

**Không có codegen tool** — types maintained thủ công. CI gate: `tsc --noEmit` catch compile error.

### 9.4 Version compatibility

| Aspect | Strategy |
|---|---|
| BE adds field | Additive — BFF deploy theo sau (no breaking) |
| BE removes field | Deprecate ≥1 wave; BFF stop using; rồi BE removes |
| BE renames | Use alias trong BE schema; BFF migrate; remove alias |
| BFF version detection | `Garage-App-Version` header → resolver detect mobile v1/v2/v3 → route đúng endpoint |
| Breaking change | CR Level CRITICAL + coordinated release |

---

## 10. Error Handling (cross-BE precedence)

### 10.1 Error format

`src/config/errors/handlers.ts` `formatGraphQLError()`:

```json
{
  "errors": [{
    "message": "...",
    "extensions": {
      "code": "API_ERROR",
      "statusCode": 500,
      "id": "<random hex>",
      "path": "/api/v3/service-orders",
      "timestamp": "2026-05-06T...",
      "serverResponse": { /* upstream original */ },
      "details": { /* additional */ }
    }
  }],
  "data": null
}
```

### 10.2 Error codes (`src/utils/constants.ts`)

| Code | HTTP | Trigger |
|---|---|---|
| `API_ERROR` / `HTTP_ERROR` | 4xx/5xx | Upstream BE error wrapped |
| `NETWORK_ERROR` | 503 | Connection refused/DNS |
| `TIMEOUT_ERROR` | 408 / 504 | Axios timeout (`ECONNABORTED`) |
| `VALIDATION_ERROR` | 400 | GraphQL validation |
| `SYNTAX_ERROR` | 400 | GraphQL parse |
| `FORBIDDEN_ERROR` | 403 | Upstream 403 |
| `UNAUTHENTICATED_ERROR` | 401 | Upstream 401 |
| `BAD_USER_INPUT` | 400 | Apollo standard for input validation |
| `GRAPHQL_PARSE_FAILED` | 400 | GraphQL parser fail |
| `GRAPHQL_VALIDATION_FAILED` | 400 | Schema validation |
| `INTERNAL_ERROR` | 500 | Catch-all unexpected |
| `UNKNOWN_ERROR` | 500 | Truly unknown |
| `SUPPERSET_ERROR` | varies | Superset module-specific |

### 10.3 Cross-BE error precedence

| Scenario | Strategy |
|---|---|
| Sequential flow: BE1 fail → abort | Surface BE1 error, BE2..BEN không gọi |
| Parallel flow: ≥1 fail | First rejection từ Promise.all surface; in Promise.allSettled cases, errors aggregated |
| Critical BE fail vs optional enrichment fail | Critical surface; optional silent log + null field (graceful degrade) |
| Both critical fail | Earlier-occurring error surface; both logged |

### 10.4 Partial failure

- Optional enrichment (customer 360, SO settlement) → `Promise.allSettled` → per-field error wrapped, field=null
- Required field fails → error bubbles to nearest nullable parent

---

## 11. Resilience

| Aspect | Config |
|---|---|
| Connection pool | Default Axios (no per-host limit) |
| Per-request timeout | `DEFAULT_TIMEOUT` env default 60000ms (60s) |
| File stream timeout | 30000ms (30s) cho download/export |
| Retry policy | **Không có** — single attempt + timeout |
| Circuit breaker | **Không có** |
| Bulkhead | **Không có** — shared Axios instance per BE |
| Health check | `PassthroughService.healthCheck()` — GET /health upstream với 5s timeout |

**Hardening required** (P1):
- Retry với exponential backoff cho idempotent reads (GET, search)
- Per-BE circuit breaker (open at 50% errors over 30s)
- Per-BE timeout tighter cho user-facing flows (5s vs 60s default)

---

## 12. Observability

### 12.1 Tracing (OpenTelemetry)

- Activation: `OTEL_ENABLED=true`
- Endpoint: `OTEL_ENDPOINT/v1/traces` (OTLP HTTP, default `http://localhost:4318`)
- Service name: `OTEL_SERVICE_NAME` (default `dev-oca-agg-garage-app-graph`)
- Auto-instrumentation: HTTP, Express, GraphQL (v0.45+)
- Span naming:
  - HTTP: `http {method} /{operation-name}` (operation extracted từ GraphQL POST body)
  - Per-BE: span attribute `backend.name` từ SERVICE_REGISTRY map URL → service name
- Propagation: W3C `traceparent` forward downstream

### 12.2 Metrics

- Endpoint: `GET /metrics` Prometheus
- Default Node.js metrics + Apollo + Express auto-instrumented
- OTLP metrics export every 60s khi `OTEL_ENABLED=true`

### 12.3 Logging (Winston)

- Format prod: JSON structured
- Format dev: colorized console
- Levels: error/warn/info/http/debug
- Fields: `requestId`, `statusCode`, `durationMs`, `source`, `destination` (from SERVICE_REGISTRY), `operation`, `tenantId`, `userId`
- Sample format:
  ```
  → gf-sales | POST /api/v3/service-orders (200ms)
  ← gf-sales | 200 (1.234s)
  GraphQL Error: message=..., path=[...], extensions={code: API_ERROR, statusCode: 500}
  ```

### 12.4 Correlation ID

Accept `x-request-id` / `x-trace-id` / `x-correlation-id` (priority order); generate UUID nếu missing; forward downstream; set response `x-request-id` + `x-source-service: GARAGE`.

---

## 13. Performance Targets

| Metric | Target |
|---|---|
| BFF resolver p99 latency (1-BE flow) | < 500ms |
| BFF resolver p99 latency (multi-BE composition: customer 360, settlement enrichment) | < 1.5s |
| BFF resolver p99 latency (Superset 3-step) | < 2.5s |
| Backend call p99 (per-BE) | < 200ms |
| Dashboard real-time poll | < 800ms (5 parallel calls) |
| File upload p99 (30MB) | < 5s |
| GraphQL query depth limit | 8 (Apollo default) |
| Persisted queries | Không (operational web/mobile traffic) |

---

## 14. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock Axios; test resolver logic + ErrorResponse mapping |
| Contract | Manual review BE schema changes; xem `Architecture/api/*-api.md` |
| Integration | Real BE (test env) + Apollo Server in-process |
| Cross-BE flow | E2E test cho 9 flows trong §6 — verify orchestration đúng |
| Load | k6 / artillery against staging BFF; verify N+1 not regressed |
| Chaos | Inject BE latency/errors; assert circuit + partial response (cần thêm cho production hardening) |

---

## 15. Backwards Compatibility

- BFF schema published cho web (`garage-web`) + mobile (`garage-mobile`)
- Mobile app must support N-2 BFF versions (per ADR-002)
- Schema deprecation: mark `@deprecated`; keep field ≥1 wave; remove via CR
- Cross-BE flow change (§6) = MAJOR CR
- Version-aware routing (`Garage-App-Version` header) cho phép mobile v1/v2/v3 coexist

---

## 16. Operational Runbook

| Scenario | Action |
|---|---|
| gf-sales down | Service order/booking/dashboard fail; staff fallback "Cannot load orders"; circuit opens |
| gf-purchase down | Quotation/PR/PO/payment fail; mobile "Try again" toast |
| gf-inventory down | Stock lookup fail; SO creation degraded (no stock validation); delivery flow fail |
| gf-erp-mdm down | Catalog enrichment fail; UI display raw codes (graceful degrade); critical for new SO if catalog required |
| gf-customer down | Customer search/detail fail; SO creation block customer lookup |
| gf-accounting down | Settlement create/list fail; SO completion still works (settlement async) |
| ct-saas-tenant down | Tenant info missing → user info fields null; degraded UX |
| ac-payment-gateway down | Payment creation fail; fallback "Try cash payment"; critical for purchase flow |
| ct-file-storage down | Upload/download fail; UI "Cannot attach file" |
| Superset down | Dashboard embed fail; UI "BI temporarily unavailable" |
| Multiple BE down | Dashboard show degraded banner; disable affected mutations |
| BFF schema breaking shipped | Mobile force-update via `getFeatureFlags` minVersion check |
| Subscription connection storm | Rate limit subscriptions per IP/user (chưa implement; backlog) |
| OpenTelemetry collector down | Tracing degraded; metrics local-only (graceful) |

---

## 17. Forbidden patterns

Anti-patterns mà `agg-garage-graph` KHÔNG được phép. Vi phạm = MAJOR CR.

- ❌ Resolver chứa business rule bền vững — ownership thuộc domain service (ADR-001). Vd KHÔNG validate SO state transition, KHÔNG calculate settlement amount trong resolver.
- ❌ Direct DB access vào schema của Garage BE — phải qua REST/protected API (ADR-006).
- ❌ Cross-aggregate-BFF call — `agg-garage-graph` KHÔNG gọi `agg-sso-graph` hoặc ngược lại.
- ❌ Bỏ qua forward `Authorization` context xuống downstream — `PassthroughService` luôn forward header (ADR-002 enforcement).
- ❌ Tự issue JWT / refresh token — auth flows phải forward sang `agg-sso-graph` → `sec-iam-service`.
- ❌ Persist domain state ở BFF — `agg-garage-graph` thin proxy, không own DB. Cache layer (Redis/Apollo) chỉ tạm thời, không là source of truth.
- ❌ Hardcode endpoint paths trong resolver — use `src/config/endpoints.ts` (single source of truth).
- ❌ Skip catalog enrichment fallback — `Promise.allSettled` cho optional enrichment; primary BE fail → surface error, optional BE fail → field=null.
- ❌ Mutation `Idempotency-Key`-required (vd payment, SO creation) mà không forward header xuống BE — duplicate side effect risk.
- ❌ Bỏ qua tenant claim trong RLS-sensitive flows — Superset guest token bắt buộc `rls: tenant_id = ${tenantId}` clause.
- ❌ Log full `Authorization` token, payment card numbers, full PII — sanitize trong logger.
- ❌ Compose business rule cross-BE trong resolver — saga/compensation phải ở Temporal worker layer (ADR-005), KHÔNG ở BFF.
- ❌ Skip signature verification cho ac-payment-gateway webhook callback — anti-pattern phổ biến gây fraud.

---

## 18. References

- HLD: [agg-garage-graph-HLD.md](../hld/agg-garage-graph-HLD.md)
- API contract: [agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md)
- Source code: `srcroot/garage-functions/agg-garage-graph/` (Apollo Server 4 / Express / TypeScript)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs:
  - ADR-001 (microservice landscape)
  - ADR-002 (GraphQL aggregator pattern)
  - ADR-003 (tenant + SSO boundary)
  - ADR-005 (Temporal workflow — saga ownership)
  - ADR-006 (Flyway per-service data)
  - ADR-007 (Redis cache, NOT system of record)
- Downstream BE INTEG-EXT contracts:
  - Garage internal: [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md), [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md), [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md), [INTEG-EXT-gf-customer.md](INTEG-EXT-gf-customer.md), [INTEG-EXT-gf-marketing.md](INTEG-EXT-gf-marketing.md), [INTEG-EXT-gf-notification.md](INTEG-EXT-gf-notification.md), [INTEG-EXT-gf-erp-mdm.md](INTEG-EXT-gf-erp-mdm.md), [INTEG-EXT-gf-system.md](INTEG-EXT-gf-system.md), [INTEG-EXT-gf-hrms.md](INTEG-EXT-gf-hrms.md)
  - External Garage: [INTEG-EXT-ac-payment-gateway.md](INTEG-EXT-ac-payment-gateway.md), [INTEG-EXT-ct-saas-tenant.md](INTEG-EXT-ct-saas-tenant.md), [INTEG-EXT-google-custom-search.md](INTEG-EXT-google-custom-search.md)
  - Note: Settlements composition involves [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md) (find-by-codes batch)
- Sister BFF: [INTEG-BFF-agg-sso-graph.md](INTEG-BFF-agg-sso-graph.md) (SSO/IAM-adjacent flows)

---

## 19. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-06-10 | v6 | **+§4.3.7b.1–6 Consolidate insurance BFF↔BE contract (delete 2 satellite files)** (scope-extend approved 2026-06-10, plan-mode session + interrupt-revised): (1) Shape D canonical SDL §4.3.7b.1 — drop wrapper `InsuranceAdjustmentBlock`; bubble 5 composite adjustment fields + 8 flat breakdown scalars (`{service,parts,vat,totalAfterVat}{Insurance,Customer}`) + 3 flat balance scalars (`insurancePayment`/`customerPayment`/`totalPayment`) lên `ServiceOrder` root. Eliminate `bh`/`kh` abbreviation + nested axis. BFF mapper = pure passthrough. (2) §4.3.7b.2–6 absorbs entire content of two satellites (`INTEG-BFF-GF-SALES-INSURANCE.md` + `INTEG-BFF-GF-ACCOUNTING-INSURANCE.md`): Surface A write canonical map + D1/D2/D3/D8 (§4.3.7b.2); Surface A read post-Shape-D + drift history (§4.3.7b.3); Surface B read field map B1+B2 + D4/D5/D6/D7/D9/D3-read + invariants (§4.3.7b.4); INS_* error registry unified §4.3.7b.5; Surface B reshape Open follow-up §4.3.7b.6. (3) Satellite files DELETED — convention rule locked: tất cả BFF↔BE insurance contract trong §4.3.7b.* file này; KHÔNG spawn per-BE INTEG file. Supersedes: BUG-W01-209 (nested axis) + wrapper-preserved half BUG-W01-213. Decision artifact: `Execution/test-reports/W01/BUG-W01-213-CR-AMENDMENT-SHAPE-D-DECISION.md`. Author: agent-test-api (W01 QC). |
| 2026-06-04 | v5 | **Reconcile op-name + gỡ hallucinate (Blocker 2, verified vs committed HEAD agg graph)**: §4.3.7b row write — `applyInsuranceAdjustments` → `updateServiceOrderV3` (additive; op `applyInsuranceAdjustments` KHÔNG có trong source, đã gỡ contract §3c). Note "Tái dùng": `createInsuranceSettlement` "đã có" → **op MỚI W01 (chưa có trong HEAD; agg hiện có `createSettlement`)**. (Row §6.2 742/905 giữ — chỉ tham chiếu op, không claim "đã có".) |
| 2026-06-03 | v4 | **Flatten nested types → flat scalar fields**: InsuranceAdjustments, breakdownByPayer → flat scalar fields in §4.3.7b applyInsuranceAdjustments. |
| 2026-05-30 | v3 | **Insurance Settlement (DESIGN — EP-INSURANCE-SETTLEMENT, CR-1780147390, ADR-014)**: thêm §4.3.7b — 9 op passthrough (applyInsuranceAdjustments→gf-sales, getInsuranceDebtWidget→gf-sales→gf-accounting debt-summary, dossier CRUD/export/download→gf-accounting, recordInsurancePayment→gf-accounting). Passthrough P1 (widget P2), `Upload` scalar cho scan ③. Tái dùng createInsuranceSettlement/getSettlementByCode (4.3.7). Operation count +9. |
| 2026-05-19 | v2 | Sync với KG v6: (H1) module count 25→26, thêm purchase-request-detail-v2; (H2) gf-system operations 4→6, thêm getTenantTransporterRegistryDetail + getByCopTransporterRegistryId; (M3) fix anti-pattern table gf-sales/customers → mixed (gf-sales suggest + gf-customer CRUD), bỏ duplicate dashboard-realtime row; operation count ~268→~270. |
| 2026-05-07 | v1 | Initial integration contract `agg-garage-graph` BFF -> 10+ Garage backend services (gf-sales, gf-purchase, gf-inventory, gf-accounting, gf-customer, gf-erp-mdm, gf-marketing, gf-notification, gf-system, gf-hrms, ac-payment-gateway, ct-saas-tenant, Superset): REST/HTTPS+JSON downstream với Bearer JWT forward + `x-client-type` header, dynamic module loader pattern, key flows include booking, service order, purchase, payment, inventory, customer, marketing. Bao gồm Identity, Topology, Auth, BE Landscape Matrix, Flow Map, Per-flow Detail, N+1 Prevention, Caching, Schema Contract, Error Handling, Resilience, Observability, Performance, Testing, Backwards Compat, Runbook, Forbidden patterns, References. |
| 2026-05-06 | 1 | Initial per-BFF flow-oriented contract; supersedes 10 legacy per-pair files (gf-{accounting,customer,erp-mdm,inventory,marketing,notification,purchase,sales}, hrms, ct-file-storage) | Architecture Authority |
