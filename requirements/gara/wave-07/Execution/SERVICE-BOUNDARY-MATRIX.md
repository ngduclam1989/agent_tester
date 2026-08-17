---
kind: execution
artifact_kind: service-boundary-matrix
status: ACTIVE
version: 4
owner_authority: Delivery Authority + Solution Architect
last_updated: "2026-06-04"
---

# SERVICE-BOUNDARY-MATRIX

> 18 boundaries (1:1 C4 Level 2 containers).

---

## 1. Boundary Matrix

| # | Boundary | Owner Agent | Source Repo | Modules | Epics | Read Access | Write Access | Forbidden Scope |
|---|---|---|---|---|---|---|---|---|
| 1 | `agg-garage-graph` | agent-dev-agg-garage-graph | agg-garage-graph | GraphQL aggregation, booking/SO/quotation, dashboard, settlement, printing, customer/vehicle projection | (cross-cutting — all UI epics) | All agents | agent-dev-agg-garage-graph, agent-fix-agg-garage-graph | Không persistence; không bypass PassthroughService; không log PII/payment; không CORS origin=* production; không modify entities/schemas thuộc boundary khác |
| 2 | `gf-system` | agent-dev-gf-system | gf-system | Tenant provisioning, quota cache, branch creation, invoice info, transporter registry, sequences | EP-FOUND | All agents | agent-dev-gf-system, agent-fix-gf-system | Không treat tenant_subscriptions SoT; không overwrite invoice đã có; không skip feature-flag; không hard-delete transporter; không modify entities/schemas thuộc boundary khác |
| 3 | `gf-hrms` | agent-dev-gf-hrms | gf-hrms | Employee CRUD, lifecycle, SSO lifecycle, status/role history, province/ward validation, code-generation | EP-FOUND | All agents | agent-dev-gf-hrms, agent-fix-gf-hrms | Không skip tenant-scope; không hard-delete employee; không log PII; không empty INTERNAL_API_KEY; không expose internal migrate; không modify entities/schemas thuộc boundary khác |
| 4 | `gf-erp-mdm` | agent-dev-gf-erp-mdm | gf-erp-mdm | Catalog MDM, dynamic-data via metadata+DDL, public/protected API, Kafka catalog sync, PIM ingest | EP-CATALOG | All agents | agent-dev-gf-erp-mdm, agent-fix-gf-erp-mdm | Không SQL động không allowlist; không hardcode INTERNAL_API_KEY; không full-schema DDL; không skip filter; không hard-delete catalog; không modify entities/schemas thuộc boundary khác |
| 5 | `gf-sales` | agent-dev-gf-sales | gf-sales | Booking V2/V3, SO V2/V3, settlement-facing, quotation handoff, customer/vehicle projection, dashboard, printing, walk-in auto-booking | EP-BOOKING, EP-SERVICE-ORDER, EP-DASHBOARD | All agents | agent-dev-gf-sales, agent-fix-gf-sales | Không modify customer/vehicle master local; không bypass outbox; không skip inbox; không hard-delete booking/SO; không log payment-PII; không concurrent V2+V3 write; không Temporal khi worker chưa register; không modify entities/schemas thuộc boundary khác |
| 6 | `gf-purchase` | agent-dev-gf-purchase | gf-purchase | Quotation lifecycle, purchase-request, purchase-order, direct-PO, supplier CRUD, cart/preferences, payment-reconciliation, batch-retry | EP-PROCUREMENT | All agents | agent-dev-gf-purchase, agent-fix-gf-purchase | Không concurrent V1/V2/V3 write; không skip transition-validate; không transition thiếu reason; không hard-delete PO/PR/QA; không bypass outbox; không query child không qua parent; không log card-token; không modify entities/schemas thuộc boundary khác |
| 7 | `gf-inventory` | agent-dev-gf-inventory | gf-inventory | Stock SoT, receipt/delivery lifecycle, reservation TTL, period-closure WAC/COGS, warehouse/branch, product/PIM/MDM, service catalog, event durability | EP-INVENTORY-RECEIPT, EP-INVENTORY-DELIVERY, EP-INVENTORY-PERIOD | All agents | agent-dev-gf-inventory, agent-fix-gf-inventory | Không modify stock không qua InventoryStockService; không skip pessimistic-lock; không treat reservedQuantity deduction; không modify PO/SO state; không skip processed_events check; không hard-delete stock/transaction; không modify entities/schemas thuộc boundary khác |
| 8 | `gf-inventory-worker` | agent-dev-gf-inventory-worker | gf-inventory-worker | Reservation-expiry, receipt-fulfillment, delivery-fulfillment, period-closure coordinator, warehouse-batch, retry-batch, operator-API | EP-INVENTORY-RECEIPT, EP-INVENTORY-DELIVERY | All agents | agent-dev-gf-inventory-worker, agent-fix-gf-inventory-worker | Không thêm JPA entity; không activity bypass InventoryClient; không multi-replica không distributed-lock; không non-deterministic workflow-ID; không skip feature-flag; không skip MessageGroup/Step filter; không modify entities/schemas thuộc boundary khác |
| 9 | `gf-accounting` | agent-dev-gf-accounting | gf-accounting | Settlement record, settlement-document sync, tenant-sequence, outbox/inbox, settlement-print | EP-SETTLEMENT | All agents | agent-dev-gf-accounting, agent-fix-gf-accounting | Không skip tenant-scope; không call gf-sales không snapshot; không cancel single settlement cặp CUSTOMER+INSURANCE; không hard-delete settlement; không update SO state trực tiếp; không skip inbox-dedup; không modify entities/schemas thuộc boundary khác |
| 10 | `gf-shipment` | agent-dev-gf-shipment | gf-shipment | Shipment-order aggregate, stage/status propagation, PO callback DELIVERED, tenant/carrier snapshot, attachment | EP-PROCUREMENT | All agents | agent-dev-gf-shipment, agent-fix-gf-shipment | Không public expose endpoint; không modify PO/SO state trực tiếp; không code không global-unique; không hard-delete shipment; không treat WAIT_TO_CONFIRM line-status; không modify entities/schemas thuộc boundary khác |
| 11 | `gf-customer` | agent-dev-gf-customer | gf-customer | Customer master, contact global cross-tenant, vehicle, tag/interaction, segment STATIC+DYNAMIC, campaign-trigger, validation-cache, event durability | EP-CUSTOMER, EP-VEHICLE | All agents | agent-dev-gf-customer, agent-fix-gf-customer | Không skip tenant-scope; không public expose contacts global; không skip linked-check marketing; không bypass outbox; không skip inbox-dedup; không hard-delete customer; không add tenant_id contacts; không modify entities/schemas thuộc boundary khác |
| 12 | `gf-marketing` | agent-dev-gf-marketing | gf-marketing | Campaign lifecycle, wave/triggered, message-template, voucher-program/voucher, claim/redeem, QR, notification-limit, outbox/inbox, Temporal workflows | EP-MARKETING | All agents | agent-dev-gf-marketing, agent-fix-gf-marketing | Không skip inbox-idempotency; không bypass outbox; không send mà quota exhausted; không send mà voucher remainingQuantity=0; không trigger BOOKING_COMPLETED cron; không hardcode qr-secret-key; không modify entities/schemas thuộc boundary khác |
| 13 | `gf-notification` | agent-dev-gf-notification | gf-notification | Notification-request intake, template Mustache-render, audience-resolution, fan-out in-app/push, scheduler claim-batch, Kafka idempotency, print/export | (cross-cutting) | All agents | agent-dev-gf-notification, agent-fix-gf-notification | Không markAsRead không scope user; không skip inbox-idempotency; không fail-silent missing-placeholder; không mark SENT chưa Kafka ack; không routing definition rỗng; không hardcode AWS secret; không modify entities/schemas thuộc boundary khác |
| 14 | `gf-erp-agent` | agent-dev-gf-erp-agent | gf-erp-agent | Outbound-message bridge, inbound-message bridge, batch-retry, priority-processing, notification-fanout, header-routing, Kafka↔SNS/SQS adapt | EP-PROCUREMENT | All agents | agent-dev-gf-erp-agent, agent-fix-gf-erp-agent | Không process message không durable persist; không skip header-validate MessageGroup/Step/OriginTenantId; không hard-delete message; không log raw payload; không public expose /api; không hardcode topic-name; không modify entities/schemas thuộc boundary khác |
| 15 | `gf-worker` | agent-dev-gf-worker | gf-worker | DB-driven scheduled HTTP-job, dynamic-scheduling, generic HTTP-execution, 2-layer retry, execution-history, admin CRUD | (cross-cutting) | All agents | agent-dev-gf-worker, agent-fix-gf-worker | Không multi-replica không distributed-lock; không lưu raw secret; không base_url ngoài whitelist; không expose entity non-operator; không hard-delete history; không ddl-auto không baseline; không modify entities/schemas thuộc boundary khác |
| 16 | `garage-web` | agent-dev-garage-web | gf-gms-web | React SPA, auth, module shell, booking/SO/settlement/quotation/purchase/inventory/customer/marketing/accounting/HRMS, realtime notification/chat/call, file upload/export | All UI epics | All agents | agent-dev-garage-web, agent-fix-garage-web | Không gọi trực tiếp gf-* service; không build token/secret ở FE; không persist sensitive long-lived; không coi feature-flag final; không hardcode backend URL; không invent GraphQL operation; không modify entities/schemas thuộc boundary khác |
| 17 | `garage-mobile` | agent-dev-garage-mobile | garage-mobile | Flutter SPA, auth, app-shell, booking/SO/quotation/ordering/purchase/customer/inventory/settlement/vehicle/employee/chat/OCR, push/call, payment/feedback WebView | All mobile epics | All agents | agent-dev-garage-mobile, agent-fix-garage-mobile | Không add routing-stack mới; không add state-management mới; không bypass GraphQLService; không hardcode env-URL; không gọi push/call API trực tiếp; không bypass force-update/firstLoginChallenge gate; không mark payment local; không modify entities/schemas thuộc boundary khác |

## 1.1 Owned Paths

> **Quy tắc CỨNG**: `owned_paths` của các boundary KHÔNG giao nhau.
>
> Multi-repo layout — mỗi boundary sở hữu toàn bộ 1 source repo riêng tại `services/`. Agent DEV chỉ được edit files trong owned_paths. Runtime: `/dev-start <boundary>` set `STATE.json.owned_paths` dựa trên bảng này; `check-boundary.sh` hook enforce bằng fnmatch + prefix match.

| # | Boundary | Source Repo Root | Owned Paths (relative to repo root) | DB Schema |
|---|---|---|---|---|
| 1 | `agg-garage-graph` | `bffs/agg-garage-graph/` | `src/**`, `package.json`, `tsconfig.json`, `Dockerfile` | — (no DB) |
| 2 | `gf-system` | `services/gf-system/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `dev_gf_system` |
| 3 | `gf-hrms` | `services/gf-hrms/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_hrms` |
| 4 | `gf-erp-mdm` | `services/gf-erp-mdm/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `dev_gf_erp_mdm` |
| 5 | `gf-sales` | `services/gf-sales/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `dev_gf_sales` |
| 6 | `gf-purchase` | `services/gf-purchase/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `dev-gf-purchase` |
| 7 | `gf-inventory` | `services/gf-inventory/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `dev_gf_inventory` |
| 8 | `gf-inventory-worker` | `services/gf-inventory-worker/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | — (stateless, no DB) |
| 9 | `gf-accounting` | `services/gf-accounting/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_accounting` |
| 10 | `gf-shipment` | `services/gf-shipment/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_shipment` |
| 11 | `gf-customer` | `services/gf-customer/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle`, `guilines/**` | `gf_customer` |
| 12 | `gf-marketing` | `services/gf-marketing/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_marketing` |
| 13 | `gf-notification` | `services/gf-notification/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_notification` |
| 14 | `gf-erp-agent` | `services/gf-erp-agent/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_erp_agent` |
| 15 | `gf-worker` | `services/gf-worker/` | `src/main/java/**`, `src/main/resources/**`, `src/test/**`, `build.gradle` | `gf_worker` |
| 16 | `garage-web` | `frontend/gf-gms-web/` | `src/**`, `public/**`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `eslint.config.js`, `package.json` | — (no DB) |
| 17 | `garage-mobile` | `mobile/gf-garage-app/` | `lib/**`, `pubspec.yaml`, `android/**`, `ios/**` | — (no DB) |

**Lưu ý**:
- **`garage-mobile`** (boundary #18): `test/**` **cố ý loại** khỏi owned_paths DEV (policy 2026-06-04) — test do **stage TEST** (`agent-test-ui` / `agent-test-e2e`) đảm nhận, KHÔNG gen trong DEV. `check-boundary.sh` (FM-002) block ghi `test/` khi stage=DEV; stage TEST_PLANNING/TEST_EXECUTION thuộc PERMISSIVE → test agent vẫn ghi tự do. (Đồng nhất với `garage-web` #17 — cũng không có test path trong owned_paths DEV.) Backend services giữ `src/test/**` như cũ.
- **`garage-web`** (boundary #17): boundary name `garage-web` nhưng Source Repo là `gf-gms-web`.
- **`gf-inventory-worker`** (boundary #9): stateless — không có JPA entity, không DB migration. Chỉ Temporal activities gọi `gf-inventory` qua REST.
- **Services dùng `ddl-auto=update` thay Flyway DDL**: `gf-erp-mdm`, `gf-accounting`, `gf-shipment`, `gf-worker`.
- **DB schema ownership**: mỗi boundary sở hữu 1 schema riêng. Cross-schema query = vi phạm boundary isolation (§5.1 CLAUDE.md).

## 2. Emergency Cross-Boundary Protocol

Khi một agent cần write vào boundary không thuộc sở hữu:

1. **Điều kiện bắt buộc**: tạo CR trong `Tracking/CHANGE-REQUESTS.md` với severity ≥ MODERATE
2. **Phê duyệt**: cần approval từ **cả hai** boundary owners liên quan + Architecture Authority
3. **Ghi nhận**: mọi deviation phải document:
   - Lý do cross-boundary access
   - Phạm vi thay đổi cụ thể
   - Rollback plan nếu có vấn đề
4. **Thời hạn**: cross-boundary access chỉ có hiệu lực cho 1 wave (tối đa 48h). Phải renew nếu cần tiếp tục.
5. **Post-fix**: verify boundary isolation restored sau khi CR close.

> **Cảnh báo**: bất kỳ cross-boundary write nào không qua protocol này sẽ bị revert và ghi nhận là **P1 violation** trong `Tracking/WAVE{N}/BUGS.md`.

## 3. Boundary Lock (per stage)

| Stage | Lock Level | FIX_GROUP Exception |
|---|---|---|
| PLANNING | UNLOCKED | — |
| DEV | UNLOCKED | — |
| REVIEW | FROZEN (no new features) | P1/P2 fixes allowed |
| TEST | FROZEN | P1/P2 fixes allowed |
| QC | LOCKED (no changes) | P1 fixes only with QA approval |
| RELEASE | LOCKED | Emergency hotfix only |

**Quy trình FIX_GROUP write trong FROZEN stage:**

1. TEST_GROUP hoặc QC report bug với severity P1/P2 → bug filed trong `Tracking/WAVE{N}/BUGS.md`
2. FIX_GROUP agent tương ứng (`agent-fix-{boundary}`) được activate
3. FIX_GROUP agent **chỉ fix exact issue** reported — không refactor, không enhance, không touch boundary khác
4. Sau fix, code quay lại FROZEN state cho re-test; regression test bắt buộc đi kèm fix

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-05-20 | 1 | Delivery Authority + SA | Phase 3: initial boundary matrix  |
| 2026-05-21 | 3 | Delivery Authority | Add §1.1 Owned Paths: 18 boundary repo roots, owned paths (relative to repo root), DB schema ownership |
| 2026-06-04 | 4 | Mobile (garage-mobile) | §1.1: loại `test/**` khỏi owned_paths của `garage-mobile` (#18) — test do stage TEST đảm nhận, mobile DEV không gen test (đồng nhất garage-web #17). Backend services giữ `src/test/**`. |
