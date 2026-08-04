---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 11
tier: T1
owner_authority: Architecture Authority
boundary: "gf-inventory (provider)"
provider: "gf-inventory"
last_reviewed: "2026-07-06"  # v11 W04 Q3 fix — §13b.7 S-W04-2 → R-W04-2 Resolved (user chốt 2026-07-06 mở rộng scope `@FeatureOn(Inventory:InventoryV2)` cover cả W03 catalog v2 + W04 OB, đồng bộ pattern legacy `INVENTORY_STOCK`). Doc-only update — annotation đã spec sẵn ở Product EP-INVENTORY-OPENING-BALANCE §5.2 v3 (CR-1782974034). Không đụng Product docs. v10 W04 Gap 2 fix — §13b.3 Commit path fail-CLOSED: thay `ERR-INV-024-UNAVAILABLE` (suffix bịa, không có trong Product registry) bằng `ERR-CMN-007` (đã tồn tại tại `Product/error-code/ERROR-CODE-REGISTRY.md:71`, "Hệ thống đang bận, vui lòng thử lại sau", HTTP 503, TOAST, platform-wide). Không đụng Product docs. v9 W04 — Add §13b gf-inventory consumes gf-accounting `/protected/v1/accounting-periods/lock-check` for OB write-paths (verify + import + edit + delete). ADR-019 REST advisory pattern reuse; fail-CLOSED commit, Caffeine 30s LRU; PROPOSED events not consumed W04 (threshold-triggered flip).
supersedes: "none"
---

# Integration — Garage services ↔ `gf-inventory` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-inventory` (stock truth, warehouse, receipt, delivery, reservation, ledger owner).

---

## 1. Identity

| Thuộc tính | Giá trị |
|---|---|
| Provider | **`gf-inventory`** — Stock truth, warehouse, receipt, delivery, reservation, ledger state owner (theo ADR-001) |
| Provider docs | [Architecture/api/gf-inventory-api.md](../api/gf-inventory-api.md), [Architecture/hld/gf-inventory-HLD.md](../hld/gf-inventory-HLD.md) |
| Used by boundary | `gf-erp-agent`, `gf-erp-mdm`, `gf-inventory-worker`, `gf-purchase`, `gf-sales` |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | `gf-inventory.url` / `gf-inventory.api.base-url` / `gf-inventory-service.url` (varies) |
| Production URL | Env runtime |
| API version pinned | `/protected/v1/...`, `/protected/{receipts,deliveries,reservations}` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (inventory master) |

### Caller config

| Caller | Client class | Config property |
|---|---|---|
| `gf-erp-agent` | `GfInventoryClient.java` | `gf-inventory-service.url` (line 102-103) |
| `gf-erp-mdm` | `GFInventoryClient.java` | `gf-inventory.url` |
| `gf-inventory-worker` | `InventoryClient.java` | `gf-inventory.api.base-url` (line 86-87) |
| `gf-purchase` | `GFInventoryClient.java` | `gf-inventory.url` (line 97-98) |
| `gf-sales` | `InventoryClient.java` | `gf-inventory.url` |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-inventory phục vụ:
- gf-erp-agent: tạo location entries từ ERP integration
- gf-erp-mdm: query/update inventory product metadata
- gf-inventory-worker: orchestrate Temporal workflows (receipt fulfillment, delivery fulfillment, reservation expiry, period closure) qua protected callback APIs
- gf-purchase: query product info, batch product lookup, PO receipt summary cho purchase flow
- gf-sales: query SO delivery summary cho service order completion

**Why**: gf-inventory là stock truth owner (ADR-001). Mọi service khác phải lookup qua protected APIs.

**Ref**: ADR-001, ADR-005 (Temporal — gf-inventory-worker integration).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
|---|---|
| Auth method | `x-api-key` header (`INTERNAL_API_KEY` / `actechx.security.api-key.value`) |
| Tenant resolution | `X-Tenant-Id` header HOẶC query param `tenantId` |

---

## 4. Endpoints / Operations Used

### 4.1 Receipt operations (gf-inventory-worker)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 1 | Create receipt | POST | `/protected/receipts` | gf-inventory-worker | Receipt fulfillment workflow start |
| 2 | Complete receipt | POST | `/protected/receipts/complete` | gf-inventory-worker | Receipt workflow end → increase stock |
| 3 | Cancel receipt | POST | `/protected/receipts/cancel` | gf-inventory-worker | Receipt cancel |
| 4 | Get receipt status | GET | `/protected/receipts/{code}/status` | gf-inventory-worker | Status check |

### 4.2 Delivery operations (gf-inventory-worker)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 5 | Create delivery | POST | `/protected/deliveries` | gf-inventory-worker | Delivery fulfillment workflow start |
| 6 | Complete delivery | POST | `/protected/deliveries/complete` | gf-inventory-worker | Delivery workflow end → consume reserved stock |
| 7 | Cancel delivery | POST | `/protected/deliveries/cancel` | gf-inventory-worker | Delivery cancel |
| 8 | Get delivery status | GET | `/protected/deliveries/{code}/status` | gf-inventory-worker | Status check |

### 4.3 Reservation operations (gf-inventory-worker)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 9 | Expire reservation | POST | `/protected/reservations/{code}/expire` | gf-inventory-worker | Reservation timer fire |
| 10 | Release reservation | POST | `/protected/reservations/{code}/release` | gf-inventory-worker | Reservation cancel signal |

### 4.4 Period closure operations (gf-inventory-worker)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 11 | Init closure history | POST | `/protected/v2/period-closure/init-history` | gf-inventory-worker | Period closure workflow start |
| 12 | Get pending warehouses | GET | `/protected/v2/period-closure/pending-warehouses` | gf-inventory-worker | Next batch of warehouses to close |
| 13 | Close warehouse period | POST | `/protected/v2/period-closure/close-warehouse` | gf-inventory-worker | Close single warehouse period |
| 14 | Create next period | POST | `/protected/v2/period-closure/create-next-period` | gf-inventory-worker | Create OPEN records for next period |
| 15 | Update closure status | POST | `/protected/v2/period-closure/update-status` | gf-inventory-worker | Update warehouse closure status |
| 16 | Get retry warehouses | GET | `/protected/v2/period-closure/retry-warehouses` | gf-inventory-worker | Get warehouses pending retry |
| 17 | Get period stats | GET | `/protected/v2/period-closure/stats` | gf-inventory-worker | Detailed statistics |
| 18 | Mark warehouse retry | POST | `/protected/v2/period-closure/mark-retry` | gf-inventory-worker | Mark warehouse for retry |
| 19 | Mark all failed retry | POST | `/protected/v2/period-closure/mark-all-failed-retry` | gf-inventory-worker | Mark all failed for retry |
| 20 | Increment retry count | POST | `/protected/v2/period-closure/increment-retry-count` | gf-inventory-worker | Increment retry count |
| 21 | Atomic close warehouse | POST | `/protected/v2/period-closure/atomic-close` | gf-inventory-worker | Atomic close + create next period |
| 22 | Rollback closure | POST | `/protected/v2/period-closure/rollback` | gf-inventory-worker | Rollback warehouse closure |
| 23 | Check idempotency | GET | `/protected/v2/period-closure/check-idempotency` | gf-inventory-worker | Check if closure already completed |

### 4.5 Internal delivery cost (gf-inventory-worker)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 24 | Update delivery item cost prices | POST | `/protected/internal/delivery-items/update-cost-prices` | gf-inventory-worker | Period closure cost recalc |

### 4.6 Product operations (gf-purchase, gf-sales)

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 25 | Get product by ID | GET | `/protected/v1/product/{productId}` | gf-purchase | PO product lookup |
| 26 | Batch get products | POST | `/protected/v1/product/batch` | gf-purchase | Bulk product enrichment |
| 27 | Resolve product ID | POST | `/protected/v1/product/productId` | gf-purchase | Resolve product ID by name/segment/type |
| 28 | Create product lines | POST | `/protected/v1/product/product-lines` | gf-purchase | Create product lines from PO fan-out |
| 29 | Get PO receipt summary | GET | `/protected/v1/product/po-summary` | gf-purchase | Receipt vs PO validation |
| 30 | Get SO delivery summary | GET | `/protected/v1/product/so-summary` | gf-sales | SO completion check (delivery fulfilled) |

### 4.7 Other internal operations

| # | Operation | Method | Path | Used by | Trigger |
|---|---|---|---|---|---|
| 31 | Create location | POST | `/protected/v1/locations` | gf-erp-agent | ERP tenant activation → create warehouse location |
| 32 | Import PIM info | POST | `/protected/v1/pim-info` | gf-erp-mdm | PIM catalog data ingestion from ERP |

---

## 5. Request / Response Contracts

### 5.1 Get product (representative)

**Request**:
```
GET /protected/v1/product/12345?tenantId=12345
Headers: x-api-key
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 12345,
    "sku": "...",
    "name": "...",
    "currentStock": 100,
    "warehouseId": 1,
    "unitId": "...",
    "category": "...",
    ...
  }
}
```

### 5.2 Complete delivery

**Request**:
```
POST /protected/deliveries/complete
Headers: x-api-key, X-Tenant-Id
Body: CompleteDeliveryRequest
{
  "deliveryCode": "DEL-20260506-00001",
  "completedAt": "2026-05-06T10:00:00Z",
  "items": [...]
}
```

**Response**: `200 OK` với delivery completion result + stock impact summary.

(Other 30 ops follow similar shape.)

---

## 6. Failure Handling

| Mode | Action |
|---|---|
| Network timeout | gf-inventory-worker workflow retry (Temporal); gf-purchase/gf-sales surface error |
| Provider 5xx | Workflow retry với exponential backoff (Temporal); domain caller single retry |
| 404 (resource not found) | Workflow log + handle (resource canceled/expired); domain caller surface |
| 409 (conflict) | Workflow accept as success — operation đã idempotent |
| Insufficient stock | Reject delivery; rollback workflow |

---

## 7. Idempotency & Ordering

| Thuộc tính | Giá trị |
|---|---|
| Receipt/delivery operations | Idempotent theo code (dedup) |
| Reservation operations | Idempotent — same workflow ID = no-op |
| Stock mutations | Atomic transaction (gf-inventory side) |
| Replay safety | Safe — Temporal activity retry pattern + gf-inventory dedup |

---

## 8. Observability

| Metric | Tags |
|---|---|
| `<caller>.inventory_client.requests` | `caller`, `op`, `status` |
| `<caller>.inventory_client.duration` | `caller`, `op` |
| `temporal.activity.{op}` (worker) | `op`, `status` |

Log: `correlation_id`, `tenantId`, `caller`, `op`, `productId`/`receiptCode`/`deliveryCode`, `latency_ms`.

---

## 9. SLA, Quotas & Cost

Internal. p99 < 200ms cho point lookup; < 500ms write operations; < 1s batch operations.

---

## 10. PII / Compliance

Limited PII (warehouse address). Stock values business-sensitive — audit mandatory.

---

## 11. Sandbox vs Production

Env switchover via `GF_INVENTORY_URL` per caller.

---

## 12. Testing Strategy

| Layer | Approach |
|---|---|
| Unit | Mock InventoryClient |
| Integration | Real gf-inventory test instance + Temporal test cluster |
| Cross-caller contract | Verify schema giữa controllers và 5 callers |

---

## 13. Runbook

| Scenario | Action |
|---|---|
| gf-inventory down | Workflow stuck (Temporal retry); receipt/delivery creation block; alert ops |
| Stock inconsistency | Trigger period closure reconciliation; alert inventory team |
| Schema drift | Coordinate với 5 callers; CR Level MAJOR |

---

## 13a. Inverse: `gf-inventory` consumes `gf-erp-mdm` (Unit + Country catalog dependency — DESIGN, ADR-017 / Q3 / R8 / R18)

> Section này document chiều **ngược lại**: `gf-inventory` (Catalog V2 subsystem) ↔ `gf-erp-mdm` (catalog/master data provider) cho **Unit + Country lookup**. Đây là cross-boundary touch **DUY NHẤT** của Inventory V2 catalog-v2 batch (Q3 cleared 2026-06-23; R8 added BRAND directory + UoM rename UNIT 2026-06-24; **R18 2026-06-25 reverse BRAND → free-text, add COUNTRY directory cho `origin_code`**).
>
> Pattern: leverage existing enrichment (BR-AGG-GARAGE-GRAPH-001, ~30+ resolvers pattern) — KHÔNG tạo Unit/Country table mới trong gf-inventory.

### 13a.1 Caller side (gf-inventory)

| Use case | When | REST call (provider = gf-erp-mdm) | Cache strategy |
|---|---|---|---|
| Validate `mainUnitCode` khi create/update `internal_product` (V2-10/V2-11) — R8 D-A/E | Backend write path | `POST /protected/catalog/v1/inquiry` body `{directory: "UNIT", codes: ["{mainUnitCode}"]}` | Local in-memory 5 min TTL (per BR-CAT-PROD-006 + INTEG-EXT-gf-erp-mdm §11) |
| Validate `unit_code` khi thêm conversion unit (V2-15) — R8 D-A/E | Backend write path | Same endpoint `{directory: "UNIT", codes: [...]}`, batch-friendly | Same |
| Validate `mainUnitCode` + conversion units khi bulk import (V2-20/V2-21) | `verify-import` + `import` pipeline | Same endpoint `{directory: "UNIT", codes: [...]}`, **batch all distinct codes** trong items[] (1 call cho cả 500 rows) | Same — preload all codes 1 lần đầu request |
| Validate `origin_code` khi create/update `internal_product` (V2-10/V2-11) — **NEW R18** | Backend write path | `POST /protected/catalog/v1/inquiry` body `{directory: "COUNTRY", codes: ["{originCode}"]}` (ISO 3166-1 alpha-3 — JPN/USA/VNM) | Same 5min TTL — shared client instance với UNIT (cùng REST endpoint, khác directory param) |
| Validate `originCode` khi bulk import (V2-20/V2-21) — **NEW R18** | `verify-import` + `import` pipeline | Same endpoint `{directory: "COUNTRY", codes: [...]}`, batch distinct codes 1 call/request | Same |

### 13a.2 Auth + headers (same as gf-erp-agent/gf-purchase/etc. patterns documented in [INTEG-EXT-gf-erp-mdm.md](INTEG-EXT-gf-erp-mdm.md))

- `x-api-key: ${INTERNAL_API_KEY}` (mandatory).
- `X-Tenant-Id: ${tenantId}` (Unit / Brand directory có thể tenant-specific theo BR INTEG-EXT-gf-erp-mdm §3).
- Spring HTTP Interface client `GfErpMdmCatalogClient` (mới — gf-inventory thêm vào `adapter/client/`). Single client handles both `directory=UNIT` (R8 D-A/E) + `directory=COUNTRY` (R18 new) — only `directory` param differs. (Note: `directory=BRAND` no longer used post-R18 revert R8 D-C — brand giờ free-text, không validation catalog.)
- Property: `gf-erp-mdm.url` (consistent với existing client convention in gf-inventory if any; nếu chưa có → add).

### 13a.3 Failure handling

- **Graceful degrade pattern** (INTEG-EXT-gf-erp-mdm §6 "catalog enrichment thường optional"):
  - **WRITE path** (validate): nếu gf-erp-mdm down → **reject create/update** với HTTP 503 + `ERR-INV-XXX` "Unit/Country catalog tạm không khả dụng — thử lại sau". Lý do: validation phải durable; cho phép tạo `internal_product` với Unit/Country không hợp lệ = data corruption (BR-CAT-PROD-006 + R18).
  - **Bulk import** (V2-20/V2-21): cùng pattern cho cả 2 directory; nếu gf-erp-mdm down → reject toàn bộ request (không partial). Hai validation call (UNIT + COUNTRY) cùng failure mode.
- Retry: Spring Retry max 3 attempts với exponential backoff (2/4/8s) — phù hợp existing pattern gf-inventory HTTP clients.
- Circuit breaker: Resilience4j open sau 5 fail liên tiếp; fall back về graceful reject.

### 13a.4 BFF enrichment (agg-garage-graph)

> Pattern BR-AGG-GARAGE-GRAPH-001: BFF resolver gọi gf-erp-mdm để map code → display name cho UI.

| Resolver | Behavior |
|---|---|
| `listUnits` (V2-Q9) — R8 D-A/E rename | Direct call gf-erp-mdm `/protected/catalog/v1/inquiry` `{directory: "UNIT"}` — return paged list cho dropdown Unit ở form FE. KHÔNG gọi gf-inventory. |
| `InternalProduct.mainUnitDisplayName` (computed field) — R8 D-A/E rename | Batch enrich: gom mọi `mainUnitCode` distinct trong response → 1 call gf-erp-mdm batch `{directory: "UNIT"}` → map vào DTO. Pattern y hệt `getCatalog`/vehicle code enrichment đã có. |
| `InternalProductConversionUnit.unitDisplayName` — R8 D-E rename | Same batch enrichment pattern `{directory: "UNIT"}`. |
| `InternalProduct.originDisplayName` (computed field) — **NEW R18** | Batch enrich: gom mọi `originCode` distinct trong response → 1 call gf-erp-mdm batch `{directory: "COUNTRY"}` → map vào DTO. Shared client + 5min cache với UNIT lookups (cùng REST endpoint, khác directory param). |
| Future: `listCountries` (proposed query) | Direct call gf-erp-mdm `{directory: "COUNTRY"}` — dropdown chọn xuất xứ ở form Internal Product. OQ9 (R18) BA verified — gf-erp-mdm import API sẽ seed codes JPN/USA/VNM/CHN/... |

### 13a.5 Forbidden patterns (cho dependency này)

- ❌ Tạo `unit` / `unit_of_measure` table trong gf-inventory schema — duplicate master, drift risk. Unit master = gf-erp-mdm catalog `directory=UNIT` per Q3 verification + R8 D-A/E (UNIT là canonical, UNIT_OF_MEASURE deprecated).
- ❌ Tạo `country` table trong gf-inventory schema (R18) — duplicate master, drift risk. Country master = gf-erp-mdm catalog `directory=COUNTRY`. `internal_product.origin_code` chỉ là scalar reference (VARCHAR(20)) — KHÔNG FK vật lý cross-boundary (ADR-009).
- ❌ Hardcode Unit/Country whitelist trong gf-inventory enum / code — phải REST call validate cả 2 directories.
- ❌ Accept free-text `origin` (legacy V1 style) trong V2 internal_product flow — R18 requires `origin_code` validated against `directory=COUNTRY` catalog. Legacy `product.origin` (SKU master, ADR-017) giữ nguyên free-text — chỉ V2 `internal_product.origin_code` enforced.
- ❌ Skip cache 5min cho UNIT hoặc COUNTRY → hot-path overhead khi import 500 rows × N distinct codes × 2 directories.
- ❌ Cho phép tạo `internal_product` với Unit hoặc Country không hợp lệ qua "best-effort" mode khi gf-erp-mdm down — phải reject (BR-CAT-PROD-006 strict + R18 symmetric).
- ❌ Thay `directory=UNIT` bằng custom directory mới mà chưa coordinate với gf-erp-mdm BA (master seed data nằm bên gf-erp-mdm). Same cho `directory=COUNTRY` (R18 — post-R18 revert R8 D-C BRAND không còn validate).
- ❌ gf-inventory persist `image_url` với business logic S3 (path generation / prefix validation / lifecycle / cleanup). URL là **opaque reference string** từ ct-file-storage; gf-inventory KHÔNG validate format, KHÔNG validate prefix, KHÔNG delete S3 object (mirror V2-18/V2-19 attachment R11 pattern — R25 OQ10 CLOSED 2026-06-25).

### 13a.6 Soft questions deferred

| ID | Topic | Hành động |
|---|---|---|
| S-UoM-1 | Verify gf-erp-mdm catalog đã seed đủ Unit entries cho garage use case (PCS, BOX, KG, LITER, ...) | BA confirm trước DEV — Delivery Authority temporary; KHÔNG block design (soft question, agent flag). |
| S-UoM-2 | Endpoint name resolution drift: KG `gf-inventory.knowledge-graph.yaml` reference `/api/v1/catalog/find-by-code` (Q3 source citation); INTEG-EXT-gf-erp-mdm.md §4 list `/protected/catalog/v1/inquiry` là canonical | **RESOLVED 2026-06-23 (R3 F6)** — canonical = `POST /protected/catalog/v1/inquiry` per INTEG-EXT-gf-erp-mdm §4 authority (provider doc wins for cross-boundary contract). KG yaml `gf-inventory.knowledge-graph.yaml` sẽ auto-align với canonical endpoint khi per-service DEV agents sync post-impl (per KG-sync-post-code policy — KG là code-synced artifact, không design-time authored). Legacy drift trong `agg-garage-graph.knowledge-graph.yaml` lines 886/892 (`searchPeriodStocksMobile` + `getPeriodStockDetailMobile` — period-stocks-mobile resolvers) là pre-existing scope ngoài V2 Catalog batch — flagged cho separate cleanup CR khi period-stocks-mobile được refactor. |
| ~~OQ8 (R8 D-C)~~ | ~~Verify gf-erp-mdm catalog `directory=BRAND` đã seed đủ entries cho garage use case~~ | **CLOSED 2026-06-25 (R18)** — BA chốt reverse R8 D-C; brand giờ free-text, không cần seed BRAND directory. Legacy `product.brand` giữ free-text per ADR-017. |
| ~~OQ9 (R8 D-A/E)~~ | ~~Canonical confirm: `directory=UNIT` (R8 D-A new canonical) vs legacy `directory=UNIT_OF_MEASURE` (Q3 original). Có cần migration step: rename existing `UNIT_OF_MEASURE` seed → `UNIT` HOẶC alias dual-directory support trong gf-erp-mdm?~~ | **CLOSED 2026-06-25 (R24) — Delivery Authority confirmed `directory=UNIT` canonical from-start.** Q3 wording `UNIT_OF_MEASURE` chỉ là draft proposal **chưa từng deploy** trong gf-erp-mdm; chưa bao giờ có data với directory name `UNIT_OF_MEASURE`. Hệ quả: (a) **KHÔNG cần migration script** (không có row nào để rename); (b) **KHÔNG cần dual-directory alias** support trong gf-erp-mdm; (c) gf-erp-mdm import API seed `UNIT` directory fresh trước W03 entry (cùng pattern với OQ12 COUNTRY seed). 23 active spec references trên 7 file đều đã canonical `UNIT` từ R8 D-A/E (2026-06-24). 8 mention `UNIT_OF_MEASURE` còn lại đều thuộc changelog historical (KEEP — audit trail Q3 → R8 D-A/E rename decision). |
| **OQ12 (R18 NEW)** | Verify gf-erp-mdm catalog `directory=COUNTRY` đã seed đủ entries ISO 3166-1 alpha-3 cho garage use case (JPN/USA/VNM/CHN/KOR/THA/DEU/...). Coverage check: list distinct `origin` values trong legacy `product.origin` (free-text VN/EN names) → cross-reference với seeded `directory=COUNTRY` codes → identify gaps. | **BA VERIFIED 2026-06-25 — gf-erp-mdm import API sẽ provision codes trước W03 entry**. Nếu seed delay → block `/wave-start 03` với gate "OQ12 closed". `INTEG-EXT-gf-erp-mdm.md` v4 đã add COUNTRY directory entry. |
| ~~OQ10 (R8 D-D)~~ | ~~S3 path convention for `internal_product.image_url`: proposed `{tenant}/internal-products/{productId}/image/{filename}`. Cần SA confirm prefix + retention policy + presigned URL TTL.~~ | **CLOSED 2026-06-25 (R25) — Delivery Authority confirmed gf-inventory KHÔNG quản lý S3.** `image_url` là **opaque URL string** từ ct-file-storage (mirror V2-18/V2-19 attachment R11 pattern). Hệ quả: (a) KHÔNG cần SA confirm path convention — ct-file-storage owns path generation; (b) KHÔNG retention/lifecycle policy ở gf-inventory side — ct-file-storage owns S3 cleanup; (c) KHÔNG presigned URL TTL ở gf-inventory side — ct-file-storage owns. gf-inventory chỉ persist URL string ≤ 500 chars, KHÔNG validate format/prefix, KHÔNG delete S3 object. Update/clear ảnh = DB-only, S3 orphan acceptable (cùng acceptance criteria V2-19 attachment delete — OQ14 DEV/Ops scope). |
| OQ11 (R8 D-D future) | Single primary image vs multi-image gallery: current R8 design = single `image_url` field (1 ảnh chính); existing V2-18 attachments support multi-doc (PDF/JPG/PNG ≤5). Có cần upgrade `image_url` → `images[]` cho gallery UX? | BA confirm — defer to v2 if UX validates need. Current R8 = single primary image (FE renders prominent thumbnail); V2-18 attachments giữ vai trò secondary docs. |

## 13b. Inverse: `gf-inventory` consumes `gf-accounting` — Accounting Period lock-check (DESIGN, W04, ADR-021)

> W04 additive cross-boundary touch. `gf-inventory` (Opening Balance write-paths) ↔ `gf-accounting` (`/protected/v1/accounting-periods/lock-check` per ADR-019 §Decision C). Reuse REST advisory pattern — zero ADR-019 spec change; PROPOSED events (`AccountingPeriodClosed`/`Reopened`) remain not-consumed W04 (future flip ACTIVE per ADR-019 threshold).

### 13b.1 Caller side (gf-inventory)

| Use case | When | REST call (provider = gf-accounting) | Cache strategy |
|---|---|---|---|
| Verify OB import — check date per row | `POST /api/v2/opening-balances/verify-import` W04-3 | `GET /protected/v1/accounting-periods/lock-check?date={YYYY-MM-DD}` per distinct `asOfDate` (batch parallel, dedup) | Caffeine LRU 30s TTL, scope `(tenantId, date)` — max 10k entries/JVM |
| Commit OB import — authoritative re-check per distinct date | `POST /api/v2/opening-balances/import` W04-4 (inside transaction) | Same endpoint per distinct date | Same cache (share) |
| Edit OB — check BOTH OLD + NEW asOfDate (FEAT-OB-EDIT AC-5 + EC-8) | `PUT /api/v2/opening-balances/{id}` W04-5 | Same endpoint × 2 dates | Same cache |
| Delete OB single | `DELETE /api/v2/opening-balances/{id}` W04-6 | Same endpoint × 1 date | Same cache |
| Delete OB lines (batch) | `POST /api/v2/opening-balances/delete-lines` W04-7 | Same endpoint per distinct date across selected lines | Same cache |

### 13b.2 Auth + headers (same pattern as INTEG-EXT-gf-accounting §6)

- `x-api-key: ${INTERNAL_API_KEY}` (mandatory).
- `X-Tenant-Id: ${tenantId}` (tenant-scoped — mỗi tenant có kỳ riêng, BR-AP-015).
- Spring HTTP Interface client `GfAccountingClient` (mới — gf-inventory thêm vào `adapter/client/`). Config property: `gf-accounting.base-url`.
- Response contract per ADR-019 §Decision C: `{locked: bool, periodId: Long?, periodCode: String, status: "OPEN"|"CLOSED", periodType: "YEAR"|"QUARTER"|"MONTH", startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD"}`.

### 13b.3 Failure handling (ADR-021 fail-CLOSED for commit)

- **Verify-import path**: gf-accounting down → mark preview rows with `warningLockCheckUnavailable: true`; UI button disabled + message "Không thể xác định trạng thái kỳ — vui lòng thử lại" (fail-OPEN with marker).
- **Commit path (import + edit + delete)**: gf-accounting down → **fail-CLOSED** — return HTTP 503 `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (platform-wide toast, đã đăng ký `Product/error-code/ERROR-CODE-REGISTRY.md:71`) → user retry when gf-accounting up (OB data integrity > availability).
- Retry: Spring Retry max 3 attempts, exponential backoff (100/200/400ms).
- Circuit breaker: Resilience4j `gf-accounting` config default (50% failure rate → open 60s window). Distinct from `gf-erp-mdm` circuit breaker (per-caller isolation).

### 13b.4 Response semantics

- `locked=true` → block write with `ERR-INV-024`.
- `locked=false` + `periodId != null` → allow (kỳ OPEN).
- `locked=false` + `periodId=null` → allow (ngày không thuộc kỳ nào — BR-OB-013 clause "ngày không thuộc kỳ nào → vẫn cho import").

### 13b.5 Cache invalidation strategy (W04 = TTL-only)

- Cache = Caffeine `expireAfterWrite=30s`.
- No event-driven invalidation W04 — ADR-019 §C `AccountingPeriodClosed/Reopened` events = PROPOSED not-published.
- **Threshold flip event-driven** (ADR-021 §Threshold): (a) cache staleness false-positive block > 0.1% commits, OR (b) close events > 5/tenant/day. When threshold hit → gf-accounting flips ADR-019 events ACTIVE + gf-inventory adds Kafka consumer (see gf-inventory-events.md §2.3 PROPOSED).

### 13b.6 Forbidden patterns (cho dependency này)

- ❌ Local mirror `accounting_period` table trong gf-inventory schema — vi phạm boundary isolation + "projection not master" (Critical Rule #7). ADR-019 §A confirms gf-accounting owns.
- ❌ Fail-OPEN commit path khi gf-accounting down — data integrity break (BR-OB-013 hard block); ADR-021 fail-CLOSED decision.
- ❌ Cache TTL > 60s cho `lock-check` — stale window quá dài; user có thể write kỳ vừa CLOSED.
- ❌ Consume `AccountingPeriodClosed`/`Reopened` events trong W04 — PROPOSED status; wire consumer = future wave (threshold-triggered).
- ❌ Skip authoritative re-check ở commit sau khi verify pass — race condition không được để user data ghi qua CLOSED kỳ.
- ❌ Concurrent lock-check > 20 requests/tenant → rate limit ở gf-inventory side (tenant fairness) — không saturate gf-accounting downstream.
- ❌ Skip `x-api-key` / `X-Tenant-Id` header — gf-accounting reject 401/403.

### 13b.7 Soft questions

| ID | Topic | Hành động |
|---|---|---|
| S-W04-1 | Batch endpoint proposal — nếu file 500 rows × avg 30 distinct dates × 3 retry × 30s cache miss = spike ~90 REST calls/import → xét thêm `/lock-check/batch?dates=D1,D2,...` ở gf-accounting revision | Defer — không block W04 (parallel + cache đủ per ADR-021); threshold trigger CR khi p95 vượt 200ms sustained. |
| **R-W04-2 (Resolved 2026-07-06)** | Feature flag `Inventory:InventoryV2` gate cho V2 subsystem (user chốt scope 2026-07-06: **cả W03 catalog v2 + W04 OB**) | **Applied** — annotation `@FeatureOn(Inventory:InventoryV2, fallback=THROW_EXCEPTION)` class-level trên `MaterialGroupController` + `InternalProductController` (W03, backfill) + `OpeningBalanceController` (W04). Tenant chưa enable → HTTP 403 mọi endpoint. FE hide menu (Web route + mobile tile state check client-side per BR-INV-MENU-002). See `gf-inventory-api.md §3a/§3b` intro + `gf-inventory-HLD.md` bảng Feature gate (§3 + §6) + §7 Forbidden rule. Product spec `EP-INVENTORY-OPENING-BALANCE §5.2 v3` + `BR-GF-INVENTORY §6.6 v3` + CR-1782974034. Doc-only update — nếu code W03 production chưa có annotation cần CR bổ sung (dev team confirm). |

## 14. Forbidden patterns

- ❌ Callers (gf-erp-agent/gf-erp-mdm/gf-inventory-worker/gf-purchase/gf-sales) ghi trực tiếp DB của `gf-inventory` — phải qua protected receipt/delivery/reservation API.
- ❌ Skip `x-api-key` / `actechx.security.api-key.value` header — provider reject 401.
- ❌ Skip tenant scope (`X-Tenant-Id` / `tenantId` query param) — cross-tenant stock leak.
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only (default `local-internal-key` cho dev — must rotate prod).
- ❌ Caller infer stock state machine — phải trust provider response (only gf-inventory own stock truth per ADR-001).
- ❌ Skip dedup theo `receiptCode`/`deliveryCode` — duplicate stock mutation risk.
- ❌ Worker bypass workflow ID convention — `receipt-fulfillment-{tenantId}-{purchaseOrderCode}` etc. (per ADR-005).
- ❌ Bypass period closure window khi update cost prices — phải đi qua workflow callback `update-cost-prices` endpoint.
- ❌ Skip stock validation khi tạo delivery — risk negative stock.

## 15. References

- HLD provider: [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md)
- HLD callers: [gf-erp-agent-HLD.md](../hld/gf-erp-agent-HLD.md), [gf-erp-mdm-HLD.md](../hld/gf-erp-mdm-HLD.md), [gf-inventory-worker-HLD.md](../hld/gf-inventory-worker-HLD.md), [gf-purchase-HLD.md](../hld/gf-purchase-HLD.md), [gf-sales-HLD.md](../hld/gf-sales-HLD.md)
- API contract: [gf-inventory-api.md](../api/gf-inventory-api.md), [gf-inventory-worker-api.md](../api/gf-inventory-worker-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — stock truth ownership), ADR-005 (Temporal workflow — gf-inventory-worker integration), ADR-008 (worker services)
- Related INTEG: [INTEG-EXT-gf-inventory-worker.md](INTEG-EXT-gf-inventory-worker.md) (bidirectional), [INTEG-EXT-gf-purchase.md](INTEG-EXT-gf-purchase.md) (PO validation), [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md) (SO context), [INTEG-EXT-gf-erp-mdm.md](INTEG-EXT-gf-erp-mdm.md) (catalog enrichment)
- KG: [gf-inventory.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml) — 95 APIs (50 public + 33 internal + 12 unused), 19 BRs
- Business Rules: NA (caller side); provider BRs: BR-GF-INVENTORY-001..019 in KG

## 16. Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-07-06 | v11 | **W04 Q3 fix — User chốt 2026-07-06 mở rộng scope `@FeatureOn(Inventory:InventoryV2)` cover cả W03 catalog v2 + W04 opening balance (đồng bộ pattern legacy `INVENTORY_STOCK` cover multi-controller)**. Audit độc lập phát hiện Q3 còn treo: architect đã trả lời "Yes — align pattern" ở §13b.7 S-W04-2 nhưng chỉ nằm trong bảng soft question, chưa write vào các artifact chính. User chốt scope 2026-07-06: apply flag cho TRỌN Inventory V2 subsystem. Sửa 1 điểm ở §13b.7: **S-W04-2 → R-W04-2 (Resolved 2026-07-06)** — thay label "Soft question deferred" bằng "Resolved" + mở rộng scope description "OB endpoints" → "V2 subsystem (cả W03 catalog v2 + W04 OB)"; thay hành động "Yes — align pattern; add annotation trên `OpeningBalanceController`" bằng "**Applied** — annotation `@FeatureOn(Inventory:InventoryV2, fallback=THROW_EXCEPTION)` class-level trên `MaterialGroupController` + `InternalProductController` (W03, backfill) + `OpeningBalanceController` (W04); tenant chưa enable → HTTP 403; FE hide menu (Web route + mobile tile state check per BR-INV-MENU-002)"; cite `gf-inventory-api.md §3a/§3b` intro + `gf-inventory-HLD.md` §3/§6/§7 + EP-INVENTORY-OPENING-BALANCE §5.2 v3 + BR-GF-INVENTORY §6.6 v3 + CR-1782974034. Ghi rõ **Doc-only update** — nếu code W03 production chưa có annotation cần CR bổ sung (dev team confirm). S-W04-1 (batch endpoint) giữ nguyên "Defer" (chưa đóng). Pair với `gf-inventory-api v39` (§3a/§3b intro bullets Feature Flag) + `gf-inventory-HLD v15` (§3 + §6 + §7 rows/rules). **KHÔNG đụng Product docs** (EP §5.2 v3 đã có sẵn — 0 CR); **KHÔNG đụng file khác**. v10 → v11. |
| 2026-07-06 | v10 | **W04 Gap 2 fix — BA/PO chốt 2026-07-06 dùng `ERR-CMN-007` cho commit-path fail-CLOSED**. Audit độc lập phát hiện suffix bịa `ERR-INV-024-UNAVAILABLE` (không tồn tại trong `Product/error-code/ERROR-CODE-REGISTRY.md`) tại §13b.3 "Failure handling — Commit path" bullet. BA/PO chốt: dùng `ERR-CMN-007` đã tồn tại tại `ERROR-CODE-REGISTRY.md:71` = "Hệ thống đang bận, vui lòng thử lại sau", HTTP 503, TOAST, System category, scope "toàn platform" — semantic khớp chính xác "downstream service unavailable, user retry"; phân biệt sạch với `ERR-INV-024` (business "Kỳ đã đóng" HTTP 400) — không còn nhập nhằng suffix. Sửa 1 chỗ trong §13b.3 body (dòng 351): thay `ERR-INV-024-UNAVAILABLE` → `ERR-CMN-007` "Hệ thống đang bận, vui lòng thử lại sau" (platform-wide toast, đã đăng ký `Product/error-code/ERROR-CODE-REGISTRY.md:71`). Bullet Verify-import path (dòng 350) không đụng — vẫn giữ nguyên fail-OPEN với `warningLockCheckUnavailable` marker per ADR-021. Pair với gf-inventory-api v36 (§3b.2 W04-4/5/6/7 rows 503) + agg-garage-graph-graphql v7.45 (§3g.6 4 rows 503 trong commit-path ops). **KHÔNG đụng Product docs** (`ERR-CMN-007` đã tồn tại sẵn — 0 CR). v9 → v10. |
| 2026-07-06 | v9 | **W04 — Add §13b gf-inventory consumes gf-accounting lock-check**. New cross-boundary REST consumer for Opening Balance write-paths (verify + import + edit + delete + delete-lines). Reuse ADR-019 REST advisory pattern verbatim; ADR-021 spec application. Client `GfAccountingClient` new; Caffeine LRU 30s TTL scope `(tenantId, date)`; fail-CLOSED for commit path (data integrity > availability for baseline OB), fail-OPEN with marker for verify preview. Response contract per ADR-019 §C. Cache invalidation TTL-only W04 (PROPOSED `AccountingPeriodClosed/Reopened` events not consumed — threshold-triggered future flip per gf-inventory-events §2.3). 7 Forbidden patterns (no local mirror; no fail-OPEN commit; TTL ≤ 60s; no PROPOSED consume W04; authoritative re-check required; per-tenant concurrent cap 20; x-api-key + X-Tenant-Id mandatory). 2 soft questions deferred (batch endpoint proposal, Inventory:InventoryV2 feature flag align). v8 → v9. |
| 2026-06-25 | v8 | **R25 — OQ10 CLOSED `image_url` opaque reference, gf-inventory KHÔNG quản lý S3 (per Delivery Authority confirm 2026-06-25)**. User decision: khi xóa ảnh chỉ xóa URL trong DB, KHÔNG đụng S3, KHÔNG quản lý bất kỳ thông tin S3. Pattern mirror precedent **V2-18/V2-19 attachment R11 2026-06-24** ("Backend KHÔNG xử lý S3 binary" + "Backend chỉ DELETE row, KHÔNG đụng S3, S3 objects orphan acceptable"). **Sửa**: (a) §13a.5 Forbidden line ~313 — rewrite rule từ "Persist `image_url` từ source khác S3 path convention + defensive validate prefix + cross-tenant 403" → "gf-inventory persist URL opaque string, KHÔNG validate format/prefix, KHÔNG delete S3 object". (b) §13a.6 OQ10 row strikethrough mirror OQ8/OQ9 CLOSED pattern + rationale "ct-file-storage owns path generation + lifecycle + presigned URL TTL". Cascade: gf-inventory-api v21 + data-model v17 + graphql v7.27 + PKG-W03 v14. KHÔNG đụng V2-18/V2-19 attachment block (đã canonical R11). KHÔNG đụng ct-file-storage references (out of scope design repo). v7 → v8. |
| 2026-06-25 | v7 | **R24 — OQ9 CLOSED `directory=UNIT` canonical from-start (per Delivery Authority confirm 2026-06-25)**. §13a.6 OQ9 row strikethrough + status "CLOSED" mirror OQ8 pattern. **Đính chính assumption cũ**: Q3 wording `UNIT_OF_MEASURE` chỉ là draft proposal **chưa từng deploy** trong gf-erp-mdm; chưa bao giờ có data với directory name `UNIT_OF_MEASURE`. Hệ quả: (a) KHÔNG cần migration script (không có row nào để rename); (b) KHÔNG cần dual-directory alias support; (c) gf-erp-mdm import API seed `UNIT` directory fresh trước W03 entry (cùng pattern OQ12 COUNTRY). KHÔNG đụng active spec — 23 active references `directory=UNIT` trên 7 file đã canonical từ R8 D-A/E 2026-06-24, 8 mention `UNIT_OF_MEASURE` còn lại đều thuộc changelog historical KEEP audit trail. KHÔNG ripple BR / KG / Tracking / HLD / api / data-model / PKG-W03 / INTEG-EXT-gf-erp-mdm (đã canonical sẵn). v6 → v7. |
| 2026-06-25 | v6 | **R18 — Brand revert codified→free-text + Origin upgrade free-text→codified (per BA chốt 2026-06-25)** — §13a section heading "Unit + Brand" → "Unit + Country". §13a intro update — R18 reverse BRAND, add COUNTRY. §13a.1 use case table: REMOVE 2 rows brand validation V2-10/V2-11 + bulk import V2-20/V2-21 (R8 D-C); ADD 2 rows origin validation tương ứng vs `directory=COUNTRY`. §13a.2 SDK client `GfErpMdmCatalogClient` comment: "UNIT + BRAND" → "UNIT + COUNTRY" + note BRAND no longer used. §13a.3 failure handling bullets: "Unit/Brand" → "Unit/Country"; "BR-CAT-PROD-006 + R8 D-C" → "BR-CAT-PROD-006 + R18". §13a.4 BFF enrichment: REMOVE `brandDisplayName` row + future `listBrands` proposed query; ADD `originDisplayName` row + future `listCountries` proposed query (BA verified). §13a.5 Forbidden: rename "brand table" → "country table"; rename free-text guard + cache + best-effort + custom directory bullets từ BRAND → COUNTRY context. §13a.6: **OQ8 CLOSED** (R8 BRAND seed unnecessary); OQ9 unchanged (UNIT canonical); ADD **OQ12** (R18 NEW) COUNTRY seed coverage — BA verified, gf-erp-mdm import API sẽ provision. Cross-boundary contract pairs: gf-inventory-api v18 + gf-inventory-data-model v16 + agg-garage-graph-graphql v7.21 + INTEG-EXT-gf-erp-mdm v4 (add COUNTRY directory). v5 → v6. |
| 2026-06-24 | v5 | **R8 — `internal_product` 4 fixes + global rename `uom` → `unit` (post-ratify additive refinement)** — §13a section apply 5 decisions: **(A)** Replace all `directory=UNIT_OF_MEASURE` → `directory=UNIT` trong §13a.1 use case table (rows 1-3) + §13a.4 BFF enrichment row (`listUnits`, `mainUnitDisplayName`, `unitDisplayName`) + §13a.5 forbidden bullets + section heading (UoM dependency → Unit + Brand dependency); **(C)** add 2 new R8 D-C use cases trong §13a.1 (validate `brand_code` write path V2-10/V2-11 + bulk import V2-20/V2-21 via `POST /protected/catalog/v1/inquiry` `{directory: "CAR_BRAND"}`); add `brandDisplayName` enrichment row trong §13a.4 + future `listBrands` proposed query; §13a.5 add forbidden bullets cho `brand` table duplication + free-text V2 brand acceptance; **(D)** §13a.5 add forbidden bullet cho `image_url` S3 path prefix defensive validation (cross-tenant reject 403); **(E)** §13a section heading + §13a.1 table column wording renamed `uom_code`/`UoM` → `unit_code`/`Unit`; SDK client class `GfErpMdmCatalogClient` note clarified single client handles both UNIT + BRAND directories. §13a.6 4 new open questions: **OQ8** BRAND directory seed coverage check (BA + gf-erp-mdm team) — gate rollout strict enforce; **OQ9** UNIT canonical migration plan vs legacy UNIT_OF_MEASURE (SA confirm); **OQ10** image_url S3 convention `{tenant}/internal-products/{productId}/image/{filename}` SA approve + retention/TTL; **OQ11** single primary image vs multi-image gallery future (BA defer). Cross-boundary touch contract unchanged (no schema modification on gf-erp-mdm side — only new directory param `BRAND` usage). Pair: gf-inventory-api v10 + gf-inventory-data-model v10 + agg-garage-graph-graphql v7.13 + gf-inventory-HLD v7 + agg-garage-graph-HLD v9. v4 → v5. |
| 2026-06-23 | v4 | **R3 F6 — UoM canonical endpoint resolved** — §13a.6 S-UoM-2 moved từ "soft question deferred" → **RESOLVED**: canonical `POST /protected/catalog/v1/inquiry` per INTEG-EXT-gf-erp-mdm §4 provider authority. KG yaml drift (`gf-inventory.knowledge-graph.yaml` reference cũ + `agg-garage-graph.knowledge-graph.yaml` lines 886/892 period-stocks-mobile) sẽ auto-align khi per-service DEV agents sync post-impl per KG-sync-post-code policy — KG là code-synced artifact, không design-time authored. Legacy `agg-garage-graph.knowledge-graph.yaml` period-stocks-mobile drift flagged cho separate cleanup CR (out of V2 Catalog batch scope). |
| 2026-06-23 | v3 | **Inventory V2 catalog-v2 + AP slice (DESIGN, ADR-017, Q3)** — thêm §13a inverse direction: gf-inventory CONSUMES gf-erp-mdm catalog cho UoM lookup (cross-boundary touch DUY NHẤT batch này). 3 use case (validate mainUomCode write path V2-10/11, validate conversion UoM V2-15, batch validate bulk import V2-20/21) qua `POST /protected/catalog/v1/inquiry` `{directory: "UNIT_OF_MEASURE"}` với cache 5min TTL. BFF enrichment qua `agg-garage-graph` cho display name (BR-AGG-GARAGE-GRAPH-001 pattern). Failure handling: graceful reject ở write path (KHÔNG best-effort) per BR-CAT-PROD-006 strict; retry Spring 3x exponential + Resilience4j circuit breaker. 5 forbidden patterns cho dependency. 2 soft questions deferred (UoM seed completeness, endpoint name drift KG vs INTEG doc). |
| 2026-05-07 | v1 | Initial integration contract `gf-erp-agent` / `gf-erp-mdm` / `gf-inventory-worker` / `gf-purchase` / `gf-sales` -> `gf-inventory` (stock truth + warehouse + receipt + delivery + reservation + ledger owner per ADR-001, BE-BE Garage-internal): REST/HTTPS+JSON `/protected/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`) + `X-Tenant-Id`; key operations location/product metadata, receipt creation linked PO, delivery linked SO, stock reservation, ledger query; failure mode no auto-retry mutation, idempotency key bắt buộc cho receipt/delivery/reservation, không cache stock state (real-time truth). Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-19 | v2 | Sync với KG: verified 32 endpoints across 5 callers match; thêm KG reference + BR cross-ref; version bump. 2 unused endpoints not in scope (close-warehouse-batch, iostock-issuance per KG RULE-08 audit). |
| 2026-05-11 | v1.1 | Fix §4 Endpoints vs source code: (1) Sửa #9 path từ `/protected/deliveries/items/update-cost-prices` → `/protected/internal/delivery-items/update-cost-prices` (worker gọi ProtectedInternalController, không phải ProtectedDeliveryController); (2) Bổ sung #15 PO receipt summary: `GET /protected/v1/product/po-summary` (thay vì cross-ref vague); (3) Thêm 14 period-closure endpoints `/protected/v2/period-closure/*` (gf-inventory-worker — init, close, create-next, retry, rollback, stats, etc.); (4) Thêm 2 gf-purchase endpoints: `POST /protected/v1/product/product-lines` + `POST /protected/v1/product/productId`; (5) Thêm gf-erp-mdm endpoint: `POST /protected/v1/pim-info`. Tổng §4 từ 16 → 32 endpoints. Tổ chức lại §4 thành sub-sections theo domain. KG không cần sửa. |
