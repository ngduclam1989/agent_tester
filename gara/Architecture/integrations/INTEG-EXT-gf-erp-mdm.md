---
type: architecture
artifact_kind: integration-external
status: ACTIVE
version: 4
tier: T1
owner_authority: Architecture Authority
boundary: "gf-erp-mdm (provider)"
provider: "gf-erp-mdm"
last_reviewed: "2026-06-25"
supersedes: "none"
---
# Integration — Garage services ↔ `gf-erp-mdm` (BE↔BE Garage-internal)

> Document tích hợp BE↔BE multi-caller cho `gf-erp-mdm` (catalog, master data, hierarchy lookup owner).

---

## 1. Identity

| Thuộc tính | Giá trị |
| --- | --- |
| Provider | `gf-erp-mdm` — Master/reference data owner: catalog hierarchy (vehicle, parts, address, insurance company, units) (theo ADR-001) |
| Provider docs | [Architecture/api/gf-erp-mdm-api.md](../api/gf-erp-mdm-api.md), [Architecture/hld/gf-erp-mdm-HLD.md](../hld/gf-erp-mdm-HLD.md) |
| Used by boundary | `gf-customer`, `gf-hrms`, `gf-inventory`, `gf-sales` |
| Module / class | Per caller (xem table dưới) |
| Sandbox URL | `gf-erp-mdm.url` / `gf-erp-mdm.api.base-url` (varies) |
| Production URL | Env runtime `GF_ERP_MDM_URL` |
| API version pinned | `/protected/catalog/v1/...` |
| SDK / library | Spring HTTP Interface |
| Category | Internal Garage service (master data) |

### Caller config

| Caller | Client class | Config property | Source |
| --- | --- | --- | --- |
| `gf-customer` | `GfErpMdmClient.java` | `gf-erp-mdm.url` (line 91-92) | `gf-customer/.../GfErpMdmClient.java` |
| `gf-hrms` | `GfErpMdmClient.java` | `gf-erp-mdm.url` | `gf-hrms/.../GfErpMdmClient.java` |
| `gf-inventory` | `GfErpMdmClient.java` | `gf-erp-mdm.api.base-url` (line 85-87) | `gf-inventory/.../GfErpMdmClient.java` |
| `gf-sales` | `MdmClient.java` | `gf-erp-mdm.url` | `gf-sales/src/main/java/com/actechx/gf/adapter/client/MdmClient.java` |

---

## 2. Why this provider (decision)

**Decision**: Multi-caller integration cho gf-erp-mdm phục vụ:

- gf-customer: address hierarchy (ward, district, province) cho customer profile
- gf-hrms: organization unit hierarchy cho employee assignment
- gf-inventory: catalog inquiry cho product/part metadata
- gf-sales: vehicle catalog hierarchy (brand, model, year, trim) cho service order vehicle info

**Why**: gf-erp-mdm là master data owner (ADR-001). Centralize catalog/hierarchy data cho phép multi-domain enrichment qua single source of truth.

**Ref**: ADR-001 (microservice landscape).

---

## 3. Authentication & Authorization

| Thuộc tính | Giá trị |
| --- | --- |
| Auth method | `x-api-key` header (`INTERNAL_API_KEY`) |
| Tenant resolution | `X-Tenant-Id` header HOẶC body field |

---

## 4. Endpoints / Operations Used

| \# | Operation | Method | Path | Used by | Trigger |
| --- | --- | --- | --- | --- | --- |
| 1 | Inquiry catalog content (hierarchy lookup) | POST | `/protected/catalog/v1/inquiry` | gf-customer, gf-hrms, gf-inventory, gf-sales | Address/vehicle/parts/insurance enrichment khi populate UI |
| 2 | Get hierarchy catalog content | POST | `/protected/catalog/v1/get-hierarchy` | gf-sales | Vehicle hierarchy lookup (brand → model → year → trim) cho SO vehicle info |
| 3 | Get hierarchy codes by brand-model | POST | `/protected/catalog/v1/get-hierarchy-codes` | gf-customer | Vehicle code resolution cho customer vehicle creation |
| 4 | Create hierarchy | POST | `/protected/catalog/v1/create-hierarchy` | gf-customer, gf-hrms | SVC-to-SVC create catalog hierarchy entry |

**Unused protected endpoints** (per KG RULE-08 audit 2026-05-14): `get-parent`, `get-parent-code`, `dynamic-data-get`, `dynamic-data-search-by-code` — no callers.

---

## 5. Request / Response Contracts

### 5.1 Inquiry catalog content (representative — most-used endpoint)

**Request**:

```
POST /protected/catalog/v1/inquiry
Headers: x-api-key, X-Tenant-Id
Body: CatalogContentSearchRequest
{
  "directory": " CAR_BRAND /CAR_MODEL/ YEAR_OF_MANUFACTURE //INSURANCE / UNIT / COUNTRY / ...
  "criteria": { "code": "TOYOTA", "active": true },
  "page": 0,
  "size": 20
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "content": [
      { "code": "TOYOTA", "name": "Toyota", "directory": "VEHICLE_BRAND", "metadata": {...} }
    ],
    "page": 0,
    "totalElements": 1
  }
}
```

### 5.2 Get hierarchy codes by brand-model

**Request**:

```
POST /protected/catalog/v1/get-hierarchy-codes
Headers: x-api-key, X-Tenant-Id
Body: List<CatalogBrandModelCodeRequest>
[
  { "brand": "Toyota", "model": "Camry", "year": 2020 }
]
```

**Response**: `ApiResponse<List<GetHierarchyCodeMdmVehicleCatalogResponse>>` với resolved hierarchy codes (brandCode, modelCode, yearCode, trimCode).

### 5.3 Catalog directories (lookup table)

| Directory | Purpose | Seed source | Consumer(s) | Code format |
|---|---|---|---|---|
| `CAR_BRAND` | Thương hiệu xe (Toyota, Honda, ...) | gf-erp-mdm import API | gf-sales, gf-customer (vehicle hierarchy) | Display name (Toyota/Honda/...) |
| `CAR_MODEL` | Dòng xe (Camry, Civic, ...) | gf-erp-mdm import API | gf-sales (SO vehicle info) | Hierarchical code |
| `YEAR_OF_MANUFACTURE` | Năm sản xuất | seeded | gf-sales | YYYY |
| `INSURANCE` | DN bảo hiểm | gf-erp-mdm import (ADR-014 v4) | gf-accounting (settlement insurance) | Code |
| `UNIT` | Đơn vị tính (PCS, BOX, KG, LITER, ...) | gf-erp-mdm import | gf-inventory (V2-10/V2-11/V2-15/V2-20/V2-21 — `mainUnitCode/unitCode` validate), agg-garage-graph BFF enrichment | Short code |
| **`COUNTRY`** (R18 NEW 2026-06-25) | **Xuất xứ quốc gia ISO 3166-1 alpha-3** (JPN/USA/VNM/CHN/KOR/THA/DEU/...) | gf-erp-mdm import API (BA verified 2026-06-25 — sẽ provision trước W03 entry) | **gf-inventory** (V2-10/V2-11 `originCode` validate + V2-20/V2-21 bulk import) + **agg-garage-graph BFF enrichment** (`InternalProduct.originDisplayName` batch lookup) | **ISO 3166-1 alpha-3 (3-letter)** — `JPN` "Nhật Bản", `USA` "Hoa Kỳ", `VNM` "Việt Nam", `CHN` "Trung Quốc", ... |

> **R18 note (2026-06-25)** — COUNTRY directory mới được thêm cho EP-INVENTORY-CATALOG V2 (W03). Pre-W03 BA chốt revert R8 D-C BRAND validation cho `internal_product.brand` (giờ free-text); thay vào đó codify `internal_product.origin` thành `origin_code` validate vs `directory=COUNTRY`. CAR_BRAND directory vẫn dùng cho gf-sales/gf-customer vehicle hierarchy (KHÔNG đụng) — chỉ `internal_product.brand_code` (R8 D-C) bị retire.

---

## 6. Failure Handling

| Mode | Action |
| --- | --- |
| Network timeout | Caller-specific: gf-sales single retry; gf-customer skip enrichment (display raw codes) |
| Provider 5xx | Single retry; gf-sales SO creation degraded (no vehicle metadata); gf-customer fallback display raw codes |
| 404 (catalog not found) | Treat as user input error — surface "Invalid code" |
| Empty result | Skip enrichment; display raw codes |

Pattern: catalog enrichment thường là **optional** — lỗi không block main flow, chỉ degrade UX (display raw codes).

---

## 7. Idempotency & Ordering

GET/POST search operations idempotent. No ordering concern.

---

## 8. Observability

| Metric | Tags |
| --- | --- |
| `<caller>.mdm_client.requests` | `caller`, `op`, `directory`, `status` |
| `<caller>.mdm_client.duration` | `caller`, `op` |

Log: `correlation_id`, `tenantId`, `caller`, `op`, `directory`, `latency_ms`, `resultCount`.

---

## 9. SLA, Quotas & Cost

Internal. p99 &lt; 200ms cho inquiry (master data should be cache-friendly); &lt; 300ms cho hierarchy resolution.

**Caching opportunity**: Master data thay đổi ít → có thể cache local trong caller (TTL 30 min). Chưa implement.

---

## 10. PII / Compliance

No PII in catalog data (master data: brand names, addresses, parts).

---

## 11. Sandbox vs Production

Env switchover via `GF_ERP_MDM_URL` per caller.

---

## 12. Testing Strategy

| Layer | Approach |
| --- | --- |
| Unit | Mock GfErpMdmClient/MdmClient |
| Integration | Real gf-erp-mdm test instance |
| Cross-caller contract | Verify schema giữa controllers và 4 callers |

---

## 13. Runbook

| Scenario | Action |
| --- | --- |
| gf-erp-mdm down | UI display raw codes (graceful degrade); SO creation block nếu vehicle hierarchy required (depends on flag); alert ops |
| Master data drift | Reseed master data scripts; coordinate với data-management team |
| Schema drift | Coordinate với 4 callers; CR Level MAJOR |

---

## 14. Forbidden patterns

- ❌ Callers (gf-customer/gf-hrms/gf-inventory/gf-sales) ghi trực tiếp DB của `gf-erp-mdm` — phải qua protected catalog API.
- ❌ Skip `x-api-key` header — provider reject 401.
- ❌ Skip `X-Tenant-Id` header — catalog có thể tenant-specific (vd custom directory).
- ❌ Hardcode `INTERNAL_API_KEY` — env vars only.
- ❌ Cache catalog data quá lâu mà không có invalidation strategy — master data thay đổi → drift.
- ❌ Treat catalog enrichment fail là critical — graceful degrade với raw codes (catalog là enrichment, không phải primary state).
- ❌ Caller hardcode catalog directory codes (vd `VEHICLE_BRAND`, `ADDRESS_PROVINCE`) — phải dùng const từ shared constants.
- ❌ Skip batch endpoint khi enrich list ≥10 items — N+1 anti-pattern.

## 15. References

- HLD provider: [gf-erp-mdm-HLD.md](../hld/gf-erp-mdm-HLD.md)
- HLD callers: [gf-customer-HLD.md](../hld/gf-customer-HLD.md), [gf-hrms-HLD.md](../hld/gf-hrms-HLD.md), [gf-inventory-HLD.md](../hld/gf-inventory-HLD.md), [gf-sales-HLD.md](../hld/gf-sales-HLD.md)
- API contract: [gf-erp-mdm-api.md](../api/gf-erp-mdm-api.md), [gf-customer-api.md](../api/gf-customer-api.md), [gf-sales-api.md](../api/gf-sales-api.md)
- System architecture: [SYSTEM-ARCHITECTURE.md](../SYSTEM-ARCHITECTURE.md)
- Tech stack: [TECHSTACK.md](../TECHSTACK.md)
- Related ADRs: ADR-001 (microservice landscape — master data ownership)
- Related INTEG: [INTEG-EXT-gf-customer.md](INTEG-EXT-gf-customer.md), [INTEG-EXT-gf-inventory.md](INTEG-EXT-gf-inventory.md), [INTEG-EXT-gf-sales.md](INTEG-EXT-gf-sales.md) — gf-erp-mdm là enrichment hub, được call từ hầu hết services
- KG: [gf-erp-mdm.knowledge-graph.yaml](../../Execution/knowledge-graphs/gf-erp-mdm.knowledge-graph.yaml) — 29 APIs (public + internal), 15 BRs
- Business Rules: NA

## 16. Change Log

| Date | Version | Summary |
| --- | --- | --- |
| 2026-05-07 | v1 | Initial integration contract `gf-customer` / `gf-hrms` / `gf-inventory` / `gf-sales` -&gt; `gf-erp-mdm` (catalog/master data hub, BE-BE Garage-internal per ADR-001): REST/HTTPS+JSON `/protected/catalog/v1/...` qua Spring HTTP Interface với `x-api-key` (`INTERNAL_API_KEY`); key operations catalog hierarchy (vehicle, parts, address, insurance company, units, organization unit) lookup + verify-existed + batch enrichment; failure mode graceful degrade với raw codes nếu enrichment fail (catalog không phải primary state), batch endpoint bắt buộc khi enrich &gt;=10 items để tránh N+1, cache có TTL với invalidation strategy. Bao gồm Identity, Why provider, Auth, Endpoints, Request/Response, Failure Handling, Idempotency, Observability, SLA, PII/Compliance, Sandbox vs Production, Testing, Runbook, Forbidden patterns, References. |
| 2026-05-19 | v2 | Sync với KG v2: (M1) thêm create-hierarchy endpoint (active, callers gf-customer + gf-hrms); thêm 4 unused endpoints note; thêm KG reference; version bump. |
| 2026-06-25 | v4 | **R18 — Add `COUNTRY` catalog directory cho EP-INVENTORY-CATALOG V2 (per BA chốt 2026-06-25)** — §5.1 inquiry example directory list thêm `COUNTRY`. §5.3 NEW sub-section "Catalog directories (lookup table)" — document 6 directory (CAR_BRAND, CAR_MODEL, YEAR_OF_MANUFACTURE, INSURANCE, UNIT, **COUNTRY new**) với purpose/seed source/consumer/code format. COUNTRY directory: ISO 3166-1 alpha-3 codes (JPN/USA/VNM/CHN/...) — seed source = gf-erp-mdm import API (BA verified pre-W03); consumer = gf-inventory `originCode` validate (V2-10/V2-11/V2-20/V2-21) + agg-garage-graph BFF `InternalProduct.originDisplayName` enrichment. R18 note rationale: BA chốt revert R8 D-C BRAND validation cho `internal_product.brand` (giờ free-text); codify `origin_code` thay thế. CAR_BRAND directory PRESERVED cho gf-sales/gf-customer vehicle hierarchy. Pair: INTEG-EXT-gf-inventory v6 + gf-inventory-api v18 + gf-inventory-data-model v16 + agg-garage-graph-graphql v7.21. |
| 2026-06-01 | v3 | **Catalog directory example đổi** `INSURANCE_COMPANY` **→** `INSURANCE` (§request example) cho master DN BH — đồng bộ ADR-014 v4 (insurance settlement tham chiếu `mdm_catalog.code`, `directory='INSURANCE'`). |
| 2026-05-11 | v1.1 | Fix §4 Endpoints vs source code: (1) Xóa endpoint verify-existed — KHÔNG tồn tại trong CatalogMdmContentInternalController, caller gf-customer/gf-hrms declare dead client code; (2) Thêm POST /protected/catalog/v1/get-hierarchy (used by gf-sales MdmClient); (3) Sửa get-hierarchy-codes "Used by" từ gf-sales+gf-customer → gf-customer only (gf-sales dùng get-hierarchy, không phải get-hierarchy-codes); (4) Xóa forbidden pattern "Bypass verify-existed" vì endpoint không tồn tại. KG không cần sửa.