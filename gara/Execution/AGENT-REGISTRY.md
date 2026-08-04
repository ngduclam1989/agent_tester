---
type: execution
artifact_kind: agent-registry
status: ACTIVE
version: 6
tier: T4
owner_authority: Delivery Authority
last_reviewed: "2026-06-10"
---

# Agent Registry — Garage

> Contracts cho tất cả agents. Mỗi agent có 7 fields chuẩn (Purpose, Owned Boundary, Input Docs, Dependencies, Deliverables, Success Criteria, Forbidden Actions).
>
> Agent definitions follow a **split-ownership** model:
> - **DEV_GROUP + FIX_GROUP (36 agents)**: Source-of-truth in each service repo at `.claude/agents/agent-{dev|fix}-{boundary}.md`
> - **REVIEW_GROUP (3 agents)**: `agent-review-backend` in design repo `.agents/`; `agent-review-garage-web` + `agent-review-garage-mobile` in their service repos (BE + web + mobile topology — xem §4)
> - **TEST_GROUP (8 agents)**: Source-of-truth in design repo at `.agents/agent-test-*.md` (api + e2e + ui + **mobile-ui** + **mobile-e2e** + isolation + performance + security)
>
> Per-wave task detail: xem agent file at its service repo → wave assignment block.

---

## 1. Agent Taxonomy

```
AGENTS (45 total)
├── DEV_GROUP (17)  ── 1 per boundary — implement features
├── FIX_GROUP (17)  ── 1 per boundary — bug fixes (mirror DEV)
├── REVIEW_GROUP (3) ── BE shared + garage-web + garage-mobile
└── TEST_GROUP (8)
    ├── Per-wave (5)    ── functional: api + e2e (web) + mobile-e2e + ui (web) + mobile-ui
    └── Periodic (3)    ── isolation + performance + security
```

---

## 1.1 Agent Location Map

| Group | Source-of-Truth | Access from Design Repo |
|---|---|---|
| DEV_GROUP (17) | `{repo}/.claude/agents/agent-dev-{boundary}.md` | Symlinks: `services/`, `bffs/`, `frontend/`, `mobile/` |
| FIX_GROUP (17) | `{repo}/.claude/agents/agent-fix-{boundary}.md` | Same symlinks |
| REVIEW_GROUP (3) | `agent-review-backend` → design repo `.agents/`; `agent-review-garage-web` → web service repo `frontend/gf-gms-web/.claude/agents/`; `agent-review-garage-mobile` → mobile service repo `.claude/agents/` | Direct + symlink |
| TEST_GROUP (8) | `garage-agentic-design/.agents/agent-test-*.md` | Direct |

### Tier-to-Repo Resolution

| Kind | Boundaries | Design Repo Path |
|---|---|---|
| Java backend (14) | gf-system, gf-hrms, gf-erp-mdm, gf-sales, gf-purchase, gf-inventory, gf-inventory-worker, gf-accounting, gf-shipment, gf-customer, gf-marketing, gf-notification, gf-erp-agent, gf-worker | `services/{boundary}/.claude/agents/` |
| Node.js BFF (2) | agg-garage-graph, agg-sso-graph | `bffs/{boundary}/.claude/agents/` |
| React web (1) | garage-web (dir: gf-gms-web) | `frontend/gf-gms-web/.claude/agents/` |
| Flutter mobile (1) | garage-mobile (dir: gf-garage-app) | `mobile/gf-garage-app/.claude/agents/` |

---

## 2. DEV_GROUP (17 agents)

> **File location**: Each DEV agent definition lives in its service repo at `.claude/agents/agent-dev-{boundary}.md`.
> The AGENT-REGISTRY here serves as the contract/blueprint; the service repo file is the operational source-of-truth with wave assignments.

Mirror `Execution/SERVICE-BOUNDARY-MATRIX.md` §1 — 1 DEV agent per boundary.

---

### agent-dev-agg-garage-graph

| Field | Value |
|---|---|
| **Purpose** | Implement GraphQL resolvers cho all Garage domain — booking, SO, quotation, dashboard, settlement, printing, customer/vehicle projection |
| **Owned Boundary** | `agg-garage-graph` |
| **Tech** | Node.js 22 / TypeScript 5.8 / Apollo Server 4.9.5 |
| **Source Repo** | `garage-functions/agg-garage-graph/` |
| **Epics** | Cross-cutting (all UI epics) |
| **Input Docs** | `Architecture/hld/agg-garage-graph-HLD.md` · `Architecture/api/agg-garage-graph-graphql.md` · `Execution/knowledge-graphs/agg-garage-graph.knowledge-graph.yaml` · `Architecture/integrations/INTEG-BFF-agg-garage-graph.md` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | Backend boundaries' REST APIs available; signed BFF integration contract |
| **Deliverables** | GraphQL schema + resolvers + data-sources + tests + KG update + handoff checklist |
| **Success Criteria** | `npm run build && npm run typecheck` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không persistence; không bypass PassthroughService; không log PII/payment; không CORS origin=* production; không modify entities/schemas thuộc boundary khác |

---


### agent-dev-gf-system

| Field | Value |
|---|---|
| **Purpose** | Implement tenant provisioning, quota cache, branch creation, invoice info, transporter registry, sequences |
| **Owned Boundary** | `gf-system` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway |
| **Source Repo** | `services/gf-system/` |
| **Epics** | EP-FOUND |
| **Input Docs** | `Architecture/hld/gf-system-HLD.md` · `Architecture/api/gf-system-api.md` · `Architecture/data/gf-system-data-model.md` · `Execution/knowledge-graphs/gf-system.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `dev_gf_system` provisioned |
| **Deliverables** | Entities + migrations + REST APIs + domain events + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không treat tenant_subscriptions SoT; không overwrite invoice đã có; không skip feature-flag; không hard-delete transporter; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-hrms

| Field | Value |
|---|---|
| **Purpose** | Implement employee CRUD, lifecycle, SSO lifecycle, status/role history, province/ward validation, code-generation |
| **Owned Boundary** | `gf-hrms` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway |
| **Source Repo** | `services/gf-hrms/` |
| **Epics** | EP-FOUND |
| **Input Docs** | `Architecture/hld/gf-hrms-HLD.md` · `Architecture/api/gf-hrms-api.md` · `Architecture/data/gf-hrms-data-model.md` · `Execution/knowledge-graphs/gf-hrms.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_hrms` provisioned; gf-system tenant API available |
| **Deliverables** | Entities + migrations + REST APIs + domain events + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không skip tenant-scope; không hard-delete employee; không log PII; không empty INTERNAL_API_KEY; không expose internal migrate; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-erp-mdm

| Field | Value |
|---|---|
| **Purpose** | Implement catalog MDM, dynamic-data via metadata+DDL, public/protected API, Kafka catalog sync, PIM ingest |
| **Owned Boundary** | `gf-erp-mdm` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / **ddl-auto** (không Flyway DDL) |
| **Source Repo** | `services/gf-erp-mdm/` |
| **Epics** | EP-CATALOG |
| **Input Docs** | `Architecture/hld/gf-erp-mdm-HLD.md` · `Architecture/api/gf-erp-mdm-api.md` · `Architecture/data/gf-erp-mdm-data-model.md` · `Execution/knowledge-graphs/gf-erp-mdm.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `dev_gf_erp_mdm` provisioned; Kafka topics available |
| **Deliverables** | Entities + REST APIs + Kafka consumers + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không SQL động không allowlist; không hardcode INTERNAL_API_KEY; không full-schema DDL; không skip filter; không hard-delete catalog; không tạo Flyway V1__*.sql migration; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-sales

| Field | Value |
|---|---|
| **Purpose** | Implement booking V2/V3, service order V2/V3, settlement-facing, quotation handoff, customer/vehicle projection, dashboard, printing, walk-in auto-booking |
| **Owned Boundary** | `gf-sales` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway / **Temporal** |
| **Source Repo** | `services/gf-sales/` |
| **Epics** | EP-BOOKING, EP-SERVICE-ORDER, EP-DASHBOARD |
| **Input Docs** | `Architecture/hld/gf-sales-HLD.md` · `Architecture/api/gf-sales-api.md` · `Architecture/data/gf-sales-data-model.md` · `Execution/knowledge-graphs/gf-sales.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `dev_gf_sales`; gf-customer REST API (customer/vehicle projection); Temporal worker registered; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Temporal workflows + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · walk-in booking auto-create logic verified · all ACs addressed |
| **Forbidden Actions** | Không modify customer/vehicle master local (projection only); không bypass outbox; không skip inbox; không hard-delete booking/SO; không log payment-PII; không concurrent V2+V3 write; không Temporal khi worker chưa register; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-purchase

| Field | Value |
|---|---|
| **Purpose** | Implement quotation lifecycle, purchase-request, purchase-order, direct-PO, supplier CRUD, cart/preferences, payment-reconciliation, batch-retry |
| **Owned Boundary** | `gf-purchase` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway |
| **Source Repo** | `services/gf-purchase/` |
| **Epics** | EP-PROCUREMENT |
| **Input Docs** | `Architecture/hld/gf-purchase-HLD.md` · `Architecture/api/gf-purchase-api.md` · `Architecture/data/gf-purchase-data-model.md` · `Execution/knowledge-graphs/gf-purchase.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `dev-gf-purchase`; gf-erp-mdm catalog API; gf-shipment API; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không concurrent V1/V2/V3 write; không skip transition-validate; không transition thiếu reason; không hard-delete PO/PR/QA; không bypass outbox; không query child không qua parent; không log card-token; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-inventory

| Field | Value |
|---|---|
| **Purpose** | Implement stock SoT, receipt/delivery lifecycle, reservation TTL, period-closure WAC/COGS, warehouse/branch, product/PIM/MDM, service catalog, event durability |
| **Owned Boundary** | `gf-inventory` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway / **Temporal** |
| **Source Repo** | `services/gf-inventory/` |
| **Epics** | EP-INVENTORY-RECEIPT, EP-INVENTORY-DELIVERY, EP-INVENTORY-PERIOD |
| **Input Docs** | `Architecture/hld/gf-inventory-HLD.md` · `Architecture/api/gf-inventory-api.md` · `Architecture/data/gf-inventory-data-model.md` · `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `dev_gf_inventory`; gf-erp-mdm catalog API; Temporal worker; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Temporal workflows + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không modify stock không qua InventoryStockService; không skip pessimistic-lock; không treat reservedQuantity deduction; không modify PO/SO state; không skip processed_events check; không hard-delete stock/transaction; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-inventory-worker

| Field | Value |
|---|---|
| **Purpose** | Implement Temporal workflows: reservation-expiry, receipt-fulfillment, delivery-fulfillment, period-closure coordinator, warehouse-batch, retry-batch |
| **Owned Boundary** | `gf-inventory-worker` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / **Temporal** (stateless — không JPA entity, không DB migration) |
| **Source Repo** | `services/gf-inventory-worker/` |
| **Epics** | EP-INVENTORY-RECEIPT, EP-INVENTORY-DELIVERY |
| **Input Docs** | `Architecture/hld/gf-inventory-worker-HLD.md` · `Architecture/api/gf-inventory-worker-api.md` · `Execution/knowledge-graphs/gf-inventory-worker.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | gf-inventory REST API available; Temporal Cloud connected |
| **Deliverables** | Temporal workflow + activity classes + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không thêm JPA entity; không tạo Flyway migration; không activity bypass InventoryClient; không multi-replica không distributed-lock; không non-deterministic workflow-ID; không skip feature-flag; không skip MessageGroup/Step filter; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-accounting

| Field | Value |
|---|---|
| **Purpose** | Implement settlement record, settlement-document sync, tenant-sequence, outbox/inbox, settlement-print |
| **Owned Boundary** | `gf-accounting` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / **ddl-auto** (không Flyway DDL) |
| **Source Repo** | `services/gf-accounting/` |
| **Epics** | EP-SETTLEMENT |
| **Input Docs** | `Architecture/hld/gf-accounting-HLD.md` · `Architecture/api/gf-accounting-api.md` · `Architecture/data/gf-accounting-data-model.md` · `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_accounting`; gf-sales settlement API |
| **Deliverables** | Entities + REST APIs + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không skip tenant-scope; không call gf-sales không snapshot; không cancel single settlement cặp CUSTOMER+INSURANCE; không hard-delete settlement; không update SO state trực tiếp; không skip inbox-dedup; không tạo Flyway V1__*.sql migration; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-shipment

| Field | Value |
|---|---|
| **Purpose** | Implement shipment-order aggregate, stage/status propagation, PO callback DELIVERED, tenant/carrier snapshot, attachment |
| **Owned Boundary** | `gf-shipment` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / **ddl-auto** (không Flyway DDL) |
| **Source Repo** | `services/gf-shipment/` |
| **Epics** | EP-PROCUREMENT |
| **Input Docs** | `Architecture/hld/gf-shipment-HLD.md` · `Architecture/api/gf-shipment-api.md` · `Architecture/data/gf-shipment-data-model.md` · `Execution/knowledge-graphs/gf-shipment.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_shipment`; gf-purchase PO API |
| **Deliverables** | Entities + REST APIs + domain events + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không public expose endpoint; không modify PO/SO state trực tiếp; không code không global-unique; không hard-delete shipment; không treat WAIT_TO_CONFIRM line-status; không tạo Flyway V1__*.sql migration; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-customer

| Field | Value |
|---|---|
| **Purpose** | Implement customer master, contact global cross-tenant, vehicle, tag/interaction, segment STATIC+DYNAMIC, campaign-trigger, validation-cache, event durability |
| **Owned Boundary** | `gf-customer` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway / **Temporal** |
| **Source Repo** | `services/gf-customer/` |
| **Epics** | EP-CUSTOMER, EP-VEHICLE |
| **Input Docs** | `Architecture/hld/gf-customer-HLD.md` · `Architecture/api/gf-customer-api.md` · `Architecture/data/gf-customer-data-model.md` · `Execution/knowledge-graphs/gf-customer.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_customer`; Temporal worker; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Temporal workflows + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không skip tenant-scope; không public expose contacts global; không skip linked-check marketing; không bypass outbox; không skip inbox-dedup; không hard-delete customer; không add tenant_id contacts; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-marketing

| Field | Value |
|---|---|
| **Purpose** | Implement campaign lifecycle, wave/triggered, message-template, voucher-program/voucher, claim/redeem, QR, notification-limit, outbox/inbox, Temporal workflows |
| **Owned Boundary** | `gf-marketing` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway / **Temporal** |
| **Source Repo** | `services/gf-marketing/` |
| **Epics** | EP-MARKETING |
| **Input Docs** | `Architecture/hld/gf-marketing-HLD.md` · `Architecture/api/gf-marketing-api.md` · `Architecture/data/gf-marketing-data-model.md` · `Execution/knowledge-graphs/gf-marketing.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_marketing`; gf-customer segment API; gf-notification API; Temporal worker; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Temporal workflows + domain events + outbox/inbox + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không skip inbox-idempotency; không bypass outbox; không send mà quota exhausted; không send mà voucher remainingQuantity=0; không trigger BOOKING_COMPLETED cron; không hardcode qr-secret-key; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-notification

| Field | Value |
|---|---|
| **Purpose** | Implement notification-request intake, template Mustache-render, audience-resolution, fan-out in-app/push, scheduler claim-batch, Kafka idempotency, print/export |
| **Owned Boundary** | `gf-notification` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway / DynamoDB (user_devices) |
| **Source Repo** | `services/gf-notification/` |
| **Epics** | Cross-cutting |
| **Input Docs** | `Architecture/hld/gf-notification-HLD.md` · `Architecture/api/gf-notification-api.md` · `Architecture/data/gf-notification-data-model.md` · `Execution/knowledge-graphs/gf-notification.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_notification`; DynamoDB user_devices table; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Kafka consumers + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không markAsRead không scope user; không skip inbox-idempotency; không fail-silent missing-placeholder; không mark SENT chưa Kafka ack; không routing definition rỗng; không hardcode AWS secret; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-erp-agent

| Field | Value |
|---|---|
| **Purpose** | Implement ERP/COP bridge: outbound-message, inbound-message, batch-retry, priority-processing, notification-fanout, header-routing, Kafka↔SNS/SQS adapt |
| **Owned Boundary** | `gf-erp-agent` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / Flyway |
| **Source Repo** | `services/gf-erp-agent/` |
| **Epics** | EP-PROCUREMENT |
| **Input Docs** | `Architecture/hld/gf-erp-agent-HLD.md` · `Architecture/api/gf-erp-agent-api.md` · `Architecture/data/gf-erp-agent-data-model.md` · `Execution/knowledge-graphs/gf-erp-agent.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_erp_agent`; external ERP/COP systems; Kafka topics |
| **Deliverables** | Entities + migrations + REST APIs + Kafka producers/consumers + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không process message không durable persist; không skip header-validate MessageGroup/Step/OriginTenantId; không hard-delete message; không log raw payload; không public expose /api; không hardcode topic-name; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-gf-worker

| Field | Value |
|---|---|
| **Purpose** | Implement DB-driven scheduled HTTP-job, dynamic-scheduling, generic HTTP-execution, 2-layer retry, execution-history, admin CRUD |
| **Owned Boundary** | `gf-worker` |
| **Tech** | Java 21 / Spring Boot 3.5.0 / PostgreSQL 16 / **ddl-auto** (không Flyway DDL) |
| **Source Repo** | `services/gf-worker/` |
| **Epics** | Cross-cutting |
| **Input Docs** | `Architecture/hld/gf-worker-HLD.md` · `Architecture/api/gf-worker-api.md` · `Architecture/data/gf-worker-data-model.md` · `Execution/knowledge-graphs/gf-worker.knowledge-graph.yaml` · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | DB schema `gf_worker` |
| **Deliverables** | Entities + REST APIs + scheduler + retry logic + tests + KG update |
| **Success Criteria** | `./gradlew build` + `checkstyleMain` + `test` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không multi-replica không distributed-lock; không lưu raw secret; không base_url ngoài whitelist; không expose entity non-operator; không hard-delete history; không tạo Flyway V1__*.sql migration; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-garage-web

| Field | Value |
|---|---|
| **Purpose** | Implement React SPA: auth, module shell, booking/SO/settlement/quotation/purchase/inventory/customer/marketing/accounting/HRMS, realtime notification/chat/call, file upload/export |
| **Owned Boundary** | `garage-web` |
| **Tech** | React 19 / TypeScript / Vite / TanStack Router / shadcn/ui |
| **Source Repo** | `services/gf-gms-web/` (⚠ repo name ≠ boundary name) |
| **Epics** | All UI epics |
| **Input Docs** | `Architecture/hld/garage-web-HLD.md` · `Execution/knowledge-graphs/garage-web.knowledge-graph.yaml` · `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` · `Architecture/integrations/INTEG-FE-garage-web-agg-sso-graph.md` · `Product/ux/UX-FLOW-*.md` · (figma mode) `Product/ux/figma-web/wave{NN}-{slug}.md` pre-fetched qua `/prefetch-figma web {wave}` (nguồn registry `Product/ux/figma/figma-links.yaml`; transform: `.agents/_ref-web-transform-figma.md`) · relevant `Product/features/FEAT-*.md` |
| **Dependencies** | agg-garage-graph + agg-sso-graph GraphQL APIs available; INTEG-FE mapping files exist (FM-016 guard) |
| **Deliverables** | React components + pages + routing + state management + GraphQL operations + tests + KG update |
| **Success Criteria** | `npm run build && npm run lint` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không gọi trực tiếp gf-* service; không build token/secret ở FE; không persist sensitive long-lived; không coi feature-flag final; không hardcode backend URL; không invent GraphQL operation; không modify entities/schemas thuộc boundary khác |

---

### agent-dev-garage-mobile

| Field | Value |
|---|---|
| **Purpose** | Implement Flutter app: auth, app-shell, booking/SO/quotation/ordering/purchase/customer/inventory/settlement/vehicle/employee/chat/OCR, push/call, payment/feedback WebView |
| **Owned Boundary** | `garage-mobile` |
| **Tech** | Flutter 3.41 / Dart 3.11 / BLoC |
| **Source Repo** | `garage-functions/garage-mobile/` |
| **Epics** | All mobile epics |
| **Input Docs** | `Architecture/hld/garage-mobile-HLD.md` · `Execution/knowledge-graphs/garage-mobile.knowledge-graph.yaml` · `Execution/knowledge-graphs/garage-mobile-ui-label-map.yaml` · `Architecture/integrations/INTEG-MOB-garage-mobile-agg-garage-graph.md` · `Architecture/integrations/INTEG-MOB-garage-mobile-agg-sso-graph.md` · `Product/ux/UX-FLOW-*.md` · (figma mode) `Product/ux/figma-mobile/wave{NN}-{slug}.md` pre-fetched qua `/prefetch-figma mobile {wave}` (nguồn registry `Product/ux/figma/figma-links.yaml`; transform: `.agents/_ref-mobile-transform-figma.md` v9 §1.5a binding-deterministic) · relevant `Product/features/FEAT-*.md` · **`.claude/skills/rules-mobile/SKILL.md`** (Flutter conventions BẮT BUỘC load — design-token / widget-catalog-first / BLoC `BaseCubit.launch()` / M-28 binding / VN→EN M-20/M-27) · `.agents/_ref-mobile-default-pattern-audit.md` (D-M1..D-M14) · `.agents/_ref-mobile-prefetch-runbook.md` |
| **Dependencies** | agg-garage-graph + agg-sso-graph GraphQL APIs available; INTEG-MOB mapping files exist (FM-016 guard) |
| **Deliverables** | Flutter widgets + screens + BLoC + GraphQL operations + tests + KG update |
| **Success Criteria** | `flutter build apk --debug` pass · boundary violations = 0 · all ACs addressed |
| **Forbidden Actions** | Không add routing-stack mới (real codebase = `auto_route` 10.1.0+1, KHÔNG `go_router`); không add state-management mới (real = `flutter_bloc` + `BaseCubit<State>`); không bypass GraphQLService; không hardcode env-URL; không gọi push/call API trực tiếp; không bypass force-update/firstLoginChallenge gate; không mark payment local; không modify entities/schemas thuộc boundary khác; **không hardcode `Color(0xFF…)` / `TextStyle(...)` literal ngoài `lib/core/common/styles/`**; **không emit `lib/features/{slice}/presentation/...` (web Clean Arch), file `_screen.dart`, class `*Screen` — canonical = `lib/ui/{domain}/{sub_feature}/{name}_page.dart` flat 3-level + class `*Page`**; không emit `*_remote_datasource.dart` (Garage mobile fold graphql_flutter direct trong repository) |

---

## 3. FIX_GROUP (17 agents)

> **File location**: Each FIX agent definition lives in its service repo at `.claude/agents/agent-fix-{boundary}.md`.

Mirror DEV_GROUP — 1 agent per boundary. Scope = bug fixes + regression only.

### Template (áp dụng cho tất cả 17 boundaries)

### agent-fix-{boundary}

| Field | Value |
|---|---|
| **Purpose** | Fix P1/P2 bugs trong boundary `{boundary}` + regression guard |
| **Owned Boundary** | `{boundary}` (same as corresponding DEV agent) |
| **Activation Triggers** | P1/P2 bug filed in `Tracking/BUGS.md`; CRITICAL review finding; QC rejection; production hotfix |
| **Input Docs** | Bug report + same architecture docs as agent-dev-{boundary} |
| **Deliverables** | Fix code + regression test + bug close-out note + KG update (nếu logic thay đổi) |
| **Success Criteria** | Bug reproduce test pass; existing tests pass; no new P1/P2 introduced |
| **Forbidden Actions** | No feature scope expansion; no cross-boundary writes; no refactor beyond fix scope; same boundary-specific forbidden actions as DEV counterpart |

### FIX agents list

| Agent | Boundary | Tech |
|---|---|---|
| agent-fix-agg-garage-graph | `agg-garage-graph` | Node.js BFF |
| agent-fix-gf-system | `gf-system` | Java |
| agent-fix-gf-hrms | `gf-hrms` | Java |
| agent-fix-gf-erp-mdm | `gf-erp-mdm` | Java |
| agent-fix-gf-sales | `gf-sales` | Java + Temporal |
| agent-fix-gf-purchase | `gf-purchase` | Java |
| agent-fix-gf-inventory | `gf-inventory` | Java + Temporal |
| agent-fix-gf-inventory-worker | `gf-inventory-worker` | Java + Temporal (stateless) |
| agent-fix-gf-accounting | `gf-accounting` | Java |
| agent-fix-gf-shipment | `gf-shipment` | Java |
| agent-fix-gf-customer | `gf-customer` | Java + Temporal |
| agent-fix-gf-marketing | `gf-marketing` | Java + Temporal |
| agent-fix-gf-notification | `gf-notification` | Java |
| agent-fix-gf-erp-agent | `gf-erp-agent` | Java |
| agent-fix-gf-worker | `gf-worker` | Java |
| agent-fix-garage-web | `garage-web` | React |
| agent-fix-garage-mobile | `garage-mobile` | Flutter |

---

## 4. REVIEW_GROUP (3 agents)

> **Topology — BE shared + boundary-specific web/mobile** (quyết định 2026-05-29): tách review theo 3 nhóm — **BE, web, mobile**. Backend giữ 1 shared reviewer cho 14 Java + 2 BFF; web và mobile mỗi bên có reviewer boundary-specific. Thay cho shared `agent-review-frontend` (chưa từng tồn tại như file). Spawn qua `/spawn-review <backend|garage-web|garage-mobile>`.
>
> | Reviewer | Boundary | Source-of-truth |
> |---|---|---|
> | `agent-review-backend` | 14 Java + 2 BFF (shared) | `.agents/agent-review-backend.md` (design repo) |
> | `agent-review-garage-web` | garage-web (React, web-only) | `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md` (service repo) |
> | `agent-review-garage-mobile` | garage-mobile (Flutter) | `mobile/gf-garage-app/.claude/agents/` (service repo) |

### agent-review-backend

| Field | Value |
|---|---|
| **Purpose** | Review backend code (Java + Node.js BFF) cho architecture, conventions, security |
| **Owned Boundary** | Cross-boundary (16 backend boundaries: 14 Java + 2 Node.js BFF) |
| **Tools** | Read, Grep, Glob, Bash (read-only — KHÔNG Write/Edit) |
| **Input Docs** | Code produced by DEV + `Architecture/*` + `Execution/SERVICE-BOUNDARY-MATRIX.md` |
| **Dependencies** | DEV_GROUP complete cho wave |
| **Deliverables** | Review report + findings list (severity-classified) + compliance matrix |
| **Success Criteria** | Checklist PASS; P1 findings = 0; P2 findings triaged |
| **Forbidden Actions** | No code modification (read-only review) |

**Review Checklist**:
1. Architecture compliance: code khớp HLD + API contract + data model
2. Boundary isolation: không cross-boundary writes, không direct DB access sai layer
3. Coding conventions: hexagonal package structure, naming conventions
4. Outbox/inbox: state-changing events qua outbox; consumers dedup qua inbox
5. Tenant isolation: TenantFilter + TenantContext enforced; event OriginTenantId match
6. JPA: chỉ scalar FK, không @ManyToOne/@OneToMany cross-boundary
7. Security: không hardcode secrets, không SQL injection, input validation
8. Backward compat: không break APIs/schemas từ waves trước
9. Test coverage: meaningful tests (không mock-everything)
10. Integration contract conformance (BFF): resolver-to-endpoint mapping, auth context, error_mapping. Run `bash scripts/validate-integrations.sh` → exit 0

### agent-review-garage-web

| Field | Value |
|---|---|
| **Purpose** | Review React code (garage-web) cho architecture, GraphQL contract conformance, component reuse, form/schema pattern, security. **WEB only — KHÔNG mobile.** |
| **Owned Boundary** | `garage-web` (boundary-specific) |
| **Tools** | Read, Grep, Glob, Bash (read-only — KHÔNG Write/Edit) |
| **Input Docs** | Code + `Architecture/hld/garage-web-HLD.md` + `Architecture/api/agg-garage-graph-graphql.md` + `frontend/gf-gms-web/knowledge-graph.yaml` (component registry) |
| **Dependencies** | `agent-dev-garage-web` / `agent-fix-garage-web` handoff |
| **Deliverables** | Review report + findings (P0-P3) filed in `Tracking/BUGS.md` |
| **Success Criteria** | 12-item checklist applied; P0 = 0; P1 triaged |
| **Forbidden Actions** | No code modification; không review mobile/backend/BFF |
| **Source-of-truth** | `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md` (web service repo) |

> Checklist đầy đủ (12 items) trong `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md`.

### agent-review-garage-mobile

| Field | Value |
|---|---|
| **Purpose** | Review Flutter code (garage-mobile) cho architecture, BLoC pattern, a11y, security, pattern canonical |
| **Owned Boundary** | `garage-mobile` (boundary-specific) |
| **Tools** | Read, Grep, Glob, Bash (read-only) |
| **Input Docs** | Code + `Architecture/hld/garage-mobile-HLD.md` + INTEG-MOB contracts + mobile KG · **`.claude/skills/rules-mobile/SKILL.md`** (Flutter conventions verify — design-token / widget-catalog / BLoC / M-28 binding / VN→EN) · `.agents/_ref-mobile-default-pattern-audit.md` (D-M1..D-M14 default-pattern verify) |
| **Dependencies** | `agent-dev-garage-mobile` / `agent-fix-garage-mobile` handoff |
| **Deliverables** | Review report + findings filed in `Tracking/BUGS.md` |
| **Success Criteria** | Checklist PASS; WCAG 2.1 AA; no hardcoded `Color(0xFF…)` / `TextStyle(...)` literal; path canonical `lib/ui/{domain}/{sub_feature}/{name}_page.dart` (NOT `lib/features/…/presentation/screens/_screen.dart` web Clean Arch); repository ở `lib/core/repositories/{domain}/` (NOT in feature dir); router = `auto_route` (NOT `go_router`) |
| **Forbidden Actions** | No code modification; không review web/backend/BFF |
| **Source-of-truth** | `mobile/gf-garage-app/.claude/agents/agent-review-garage-mobile.md` (service repo) |

---

## 5. TEST_GROUP

### 5.1 Per-wave (Functional)

| Agent | Scope | Activation |
|---|---|---|
| agent-test-api | API contract + integration tests | Every wave |
| agent-test-e2e | Cross-boundary E2E business flows (web — Playwright) | Every wave có web vertical slice |
| agent-test-mobile-e2e | Cross-boundary E2E business flows (mobile — Patrol + native interaction) | Every wave có mobile vertical slice |
| agent-test-ui | UI forms, navigation, states, a11y, visual (web — React/Playwright) | Every wave có web UI change |
| agent-test-mobile-ui | UI widget, BLoC state, golden, a11y, responsive (mobile — Flutter/alchemist) | Every wave có mobile UI change |

### 5.2 Periodic (Test waves only — WT-M, WT-F)

| Agent | Scope | Activation |
|---|---|---|
| agent-test-isolation | Multi-tenant data isolation verification | Test waves only |
| agent-test-performance | Performance SLA targets (p99 latency, throughput, stress) | Test waves only |
| agent-test-security | Auth, authz, OWASP Top 10, secrets hygiene | Test waves only |

### 5.3 Common fields

| Field | Value |
|---|---|
| **Tools** | Read, Bash, Grep, Glob (read-only — KHÔNG Write/Edit trừ test code) |
| **Input Docs** | `.agents/{agent}.md` wave block + `Product/features/FEAT-*.md` (ACs) + `Architecture/api/*` + code |
| **Deliverables** | Test cases (registered in `Tracking/TEST-CASE-REGISTRY.md`) + test execution report + bug reports in `Tracking/BUGS.md` |
| **Success Criteria** | TC pass rate ≥ 95%; P1 bugs = 0 |
| **Forbidden Actions** | No production code modification (except test code); no ad-hoc TCs không register |

### 5.4 Test methodology

Hai phases:
1. **TEST_PLANNING**: Generate TCs từ ACs + endpoints + code analysis → register trong TEST-CASE-REGISTRY.md → QA Authority review
2. **TEST_EXECUTION**: Execute TCs → update status (PASS/FAIL/BLOCKED) → file bugs

TC generation rules:
- Mỗi AC → ≥1 TC (positive path)
- Mỗi API endpoint → 1 happy + ≥2 sad paths
- Edge cases từ code analysis
- Regression TCs từ waves trước phải 100% pass

---

## 6. Summary

| Group | Count | Per-boundary? | Activation |
|---|---|---|---|
| DEV_GROUP | 18 | Yes | Mỗi wave (parallel spawn capable) |
| FIX_GROUP | 18 | Yes (mirror DEV) | P1/P2 bugs + FROZEN stages |
| REVIEW_GROUP | 3 | Mixed (BE shared + web/mobile boundary-specific) | Mỗi wave sau DEV |
| TEST_GROUP (per-wave) | 5 | Platform-specific (api + e2e/ui web + mobile-e2e/mobile-ui) | Mỗi wave (2-phase); mobile chỉ active khi wave có mobile slice |
| TEST_GROUP (periodic) | 3 | No | Test waves only (WT-M, WT-F) |
| **TOTAL** | **47** | | |

### Tech Distribution

| Tech | DEV | FIX | Boundaries |
|---|---|---|---|
| Java / Spring Boot / Flyway | 10 | 10 | gf-system, gf-hrms, gf-sales, gf-purchase, gf-inventory, gf-customer, gf-marketing, gf-notification, gf-erp-agent, gf-erp-mdm* |
| Java / Spring Boot / ddl-auto | 3 | 3 | gf-accounting, gf-shipment, gf-worker |
| Java / Spring Boot / Temporal (stateless) | 1 | 1 | gf-inventory-worker |
| Node.js / Apollo / TypeScript | 2 | 2 | agg-garage-graph, agg-sso-graph |
| React / TypeScript / Vite | 1 | 1 | garage-web |
| Flutter / Dart / BLoC | 1 | 1 | garage-mobile |

*gf-erp-mdm dùng ddl-auto nhưng classified with Java/Flyway group vì cùng Spring Boot stack.

### Temporal-enabled Boundaries (5)

gf-sales, gf-customer, gf-marketing, gf-inventory, gf-inventory-worker — DEV/FIX agents cho 5 boundaries này phải handle Temporal workflow registration + deterministic workflow IDs.

---

## 7. Skills Attachment Rule

| Agent Type | Skills to Invoke (in order) |
|---|---|
| Java backend DEV/FIX | `rules-backend` → `rules-dev-handoff` → `ref-backend-config` / `ref-backend-patterns` / `ref-backend-unit-test` |
| Node.js BFF DEV/FIX | `rules-bff` → `rules-dev-handoff` |
| React frontend DEV/FIX | `rules-frontend` → `rules-dev-handoff` |
| Flutter mobile DEV/FIX | `rules-frontend-mobile` → `rules-dev-handoff` |
| agent-review-backend | `rules-backend` + `rules-bff` + `rules-dev-handoff` |
| agent-review-garage-web | `rules-frontend` (service repo) + `rules-dev-handoff` |
| agent-review-garage-mobile | `rules-frontend-mobile` (service repo) + `rules-dev-handoff` |
| agent-test-api | `rules-test` + `rules-functional-test` + `rules-test-api` |
| agent-test-e2e | `rules-test` + `rules-functional-test` + `rules-test-e2e` |
| agent-test-mobile-e2e | `rules-test` + `rules-functional-test` + `rules-test-mobile-e2e` |
| agent-test-ui | `rules-test` + `rules-functional-test` + `rules-test-ui` |
| agent-test-mobile-ui | `rules-test` + `rules-functional-test` + `rules-test-mobile-ui` |
| agent-test-isolation | `rules-test` + `rules-functional-test` + `rules-test-isolation` |
| agent-test-performance | `rules-test` + `rules-test-performance` |
| agent-test-security | `rules-test` + `rules-functional-test` + `rules-test-security` |

> Skill mapping mirror đúng field `skill:` trong frontmatter mỗi file `.agents/agent-test-*.md` (source-of-truth). Tất cả `rules-test*` skill đã tồn tại tại `.claude/skills/`. (`agent-test-performance` không dùng `rules-functional-test` — performance là non-functional. `agent-test-mobile-{ui,e2e}` mới authoring per CR-1781113328 — stack Flutter `flutter_test`/`alchemist`/`bloc_test` + Patrol.)

---

## 8. Spawn Commands

| Agent Type | Command | Script |
|---|---|---|
| DEV (any boundary) | `/spawn-dev <boundary>` | `scripts/spawn-dev.sh` |
| FIX (any boundary) | `/spawn-fix <boundary>` (no-arg = parallel mọi boundary có bug OPEN) | `scripts/spawn-fix.sh` |
| REVIEW backend (16 BE/BFF boundaries) | `/spawn-review backend` | `scripts/spawn-review.sh` |
| REVIEW web | `/spawn-review garage-web` | `scripts/spawn-review.sh` |
| REVIEW mobile | `/spawn-review garage-mobile` | `scripts/spawn-review.sh` |
| TEST (any type) | `/spawn-test <api\|e2e\|ui\|mobile-ui\|mobile-e2e\|isolation\|performance\|security>` | `scripts/spawn-test.sh` |

---

## 9. Change Log

| Date | Summary | Author |
|---|---|---|
| 2026-06-10 | **Add mobile TEST agents (CR-1781113328 APPROVED)**: TEST_GROUP 6→8 agents (45→47 total). Thêm `agent-test-mobile-ui` (Flutter widget + alchemist golden + bloc_test) + `agent-test-mobile-e2e` (Patrol + integration_test + Percy). Update §1 taxonomy (Per-wave 3→5: api + e2e (web) + mobile-e2e + ui (web) + mobile-ui), §1.1 TEST_GROUP count, §5.1 thêm 2 row, §5 split per-platform activation note, §6 summary total 45→47, §7 skill mapping thêm 2 (`rules-test-mobile-ui` + `rules-test-mobile-e2e`), §8 `/spawn-test` arg list thêm `mobile-ui|mobile-e2e`. Stack chốt qua user-interactive AskUserQuestion 2026-06-10. Design-repo only, no contract/architecture impact (Architecture Impact Analysis = Nil per CR). | ninhnguyen |
| 2026-06-06 | **Implement `/spawn-fix` (đóng doc/impl drift)**: command `/spawn-fix` đã reference trong AGENTS.md/BOOTSTRAP-GUIDE.md/§8 nhưng chưa có file. Tạo `scripts/spawn-fix.sh` (prompt builder mirror `spawn-dev.sh` với FIX scope: lọc bug row OPEN/IN_PROGRESS theo cột `Assigned=agent-fix-<b>` trong `Tracking/WAVE{NN}/BUGS.md`, sort P1→P4, nhúng FIX template Phase 0-3 + HLD/API/DATA/KG/rules; `--boundaries` mode cho parallel; early-abort exit 66 nếu boundary không có bug) + `.claude/commands/spawn-fix.md` (single + parallel). §8 script column `—` → `scripts/spawn-fix.sh`. FIX không arm DEV SubagentStop marker (gate = return JSON: bug→RESOLVED + regression test + BUGFIX doc; TEST_GROUP set VERIFIED). Tạo trong TEST_EXECUTION (owned_paths override user-approved ninhnguyen — meta/tooling, check-boundary.sh permissive). | ninhnguyen |
| 2026-06-04 | **`agent-review-garage-web` SoT chuyển design repo → web service repo** (mirror `agent-review-garage-mobile`): xoá `.agents/agent-review-garage-web.md` + mirror `.claude/agents/`; source-of-truth giờ là `frontend/gf-gms-web/.claude/agents/agent-review-garage-web.md`. Cập nhật §1 split-ownership note, §1.1 location map, §4 topology table + thêm field Source-of-truth + checklist ref. REVIEW_GROUP vẫn = 3 (chỉ `agent-review-backend` còn resident design repo). Đồng bộ `scripts/spawn-review.sh` (AGENT_FILE path), `scripts/sync-agent-assets.sh` (scope 2→1 reviewer, 8→7 synced), `.claude/commands/{spawn-review,fill-wave-assignment}.md`, `AGENTS.md`, `BOOTSTRAP-GUIDE.md`, `Execution/PROTOCOL.md`. | ninhnguyen |
| 2026-06-03 | §7 skill mapping: thay `rules-test-general` (skill không tồn tại) bằng mapping đúng theo frontmatter `skill:` của từng `.agents/agent-test-*.md` (mỗi agent: `rules-test` + `rules-functional-test` + `rules-test-{type}`; performance bỏ functional-test). Xoá note "Skills chưa tạo — Phase 5" (đã stale, 7 skill `rules-test*` đã tồn tại). §8 spawn-review: tách `frontend` → `garage-web` + `garage-mobile` cho khớp REVIEW topology 3 + lệnh thực tế. | cuongnguyen_ac |
| 2026-05-29 | REVIEW_GROUP 2→3 agents, topology BE + web + mobile (45 total). Bỏ phantom `agent-review-frontend` (web+mobile chung); thêm `agent-review-garage-web` (design repo, web-only) + `agent-review-garage-mobile` (mobile service repo). `agg-garage-graph` (BFF) review qua `agent-review-backend` — thuộc thẩm quyền BE, KHÔNG tách riêng. Sync spawn-review.sh + command (`<backend\|garage-web\|garage-mobile>`). | cuongnguyen_ac |
| 2026-05-22 | Initial agent registry — 44 agents (18 DEV + 18 FIX + 2 REVIEW + 6 TEST), boundary-specific forbidden actions, tech distribution, skills blueprint | Delivery Authority |
