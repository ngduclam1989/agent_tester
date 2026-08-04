---
type: architecture
artifact_kind: hld
status: ACTIVE
version: 3
tier: T1
owner_authority: Architecture Authority
boundary: gf-erp-mdm
last_reviewed: "2026-05-30"
depends_on:
  - ../TECHSTACK.md
  - ../SYSTEM-ARCHITECTURE.md
  - ../api/gf-erp-mdm-api.md
  - ../events/erp-mdm-events.md
  - ../data/gf-erp-mdm-data-model.md
---

# HLD — `gf-erp-mdm`

## 1. Overview

`gf-erp-mdm` là dịch vụ **master data + catalog dùng chung** cho hệ sinh thái garage. Service lưu trữ danh mục tĩnh (catalog xe, bảo hiểm, tỉnh/thành), tạo bảng master data **động** từ metadata (runtime DDL), cung cấp API tra cứu nội bộ cho service-to-service, và đồng bộ một phần dữ liệu catalog/PIM qua Kafka. Master data được hiểu là **global** — entity tĩnh không có `tenant_id`.

**Trách nhiệm:**
- Catalog MDM: CRUD + inquiry + tra cứu cây phân cấp `CAR_BRAND → CAR_MODEL → YEAR → TRIMS_LEVEL` trong bảng tổng quát `mdm_catalog`.
- Import catalog: nhận file multipart, parse + import bất đồng bộ.
- Dynamic master data: khai báo `MasterDataRegistry` + `MasterDataDefinition`, sau đó tạo bảng `{target}_data` + `{target}_data_archive` qua native DDL runtime.
- Internal API (`/protected/catalog/v1/*`, `/protected/v1/dynamic-data/*`): lookup catalog/dynamic data cho service nội bộ qua `x-api-key`.
- Kafka integration: consume `vehicle-catalog` (catalog inbound) + `pim-info` (PIM live) → forward sang `gf-inventory`; publish `vehicle-catalog` (catalog outbound).

**Owned epic**: cross-cutting platform — master data layer cho `gf-sales`, `gf-inventory`, `gf-purchase`, `gf-customer`, etc. Không map epic Product cụ thể.

## 2. Component Diagram (C4 Level 3)

```
┌──────── gf-erp-mdm  (Java 21 · global MDM · ddl-auto) ────────┐
│  ┌──────────────┐ ┌────────────────┐ ┌──────────┐             │
│  │ MdmCatalog   │ │ ImportMdmCatalog│ Kafka     │             │
│  │ Ctrl·Dynamic │ │ Ctrl (multipart)│ Handlers: │             │
│  │ MasterData   │ │ CatalogMdmContent│ MdmCatalog│            │
│  │ Ctrl         │ │ InternalCtrl    │ ·PIMInfo  │             │
│  └─────┬────────┘ └────────┬────────┘ └────┬─────┘            │
│  ┌─────▼───────────────────▼───────────────▼─────┐            │
│  │ APP / DOMAIN SERVICES                         │            │
│  │  MdmCatalogService (mdm_catalog tree)·        │            │
│  │  ImportMdmCatalogService (Apache POI XLS)·    │            │
│  │  MasterDataService (registry + runtime DDL)·  │            │
│  │  DynamicMasterDataService·MdmCatalogPublisher │            │
│  └─────┬───────────────────────────┬─────────────┘            │
│  ┌─────▼──────┐ ┌──────────────┐ ┌─────────────┐              │
│  │ JPA ddl-   │ │ Kafka producer│ HttpClient  │               │
│  │ auto (no   │ │ vehicle-     │ │ (x-api-key) │──────────────┼─► gf-inventory (PIM forward · pim-info)
│  │ Flyway)    │ │ catalog      │ └─────────────┘              │
│  │[erp_mdm]   │ │ acks=all·idem│                              │
│  │ runtime DDL│ └──────┬───────┘                              │
│  └─────┬──────┘                                               │
│  GLOBAL master data (NO tenant_id) │ Actuator+OTLP            │
└───────┴──────────────┴────────────────────────────────────────┘
        ▼                ▼
   PostgreSQL [dev_gf_erp_mdm]   Kafka P: vehicle-catalog ;
   mdm_catalog·registry·{target}  C: vehicle-catalog·pim-info
   _data (runtime DDL)
```

## 3. Key Design Decisions

| Decision | Rationale | Reference |
|---|---|---|
| Single `mdm_catalog` table cho mọi catalog tĩnh | Tái sử dụng schema cho vehicle/insurance/province; phân biệt qua `directory + code + parent` | TECHSTACK §master-data |
| Dynamic master data qua metadata + runtime DDL | Cho phép mở rộng dataset mà không release entity mới | open HLD-MDM-002 (DDL safety risk) |
| Master data **global** — entity tĩnh không có `tenant_id` | Catalog xe / bảo hiểm / tỉnh thành chia sẻ xuyên tenant | open HLD-MDM-005 (tenant-specific catalog future) |
| Tách public `/api/v1/*` (bearer) vs protected `/protected/**` (x-api-key) | Boundary client bên ngoài vs service-to-service nội bộ | TECHSTACK §security |
| Kafka manual ack (`AckMode.MANUAL_IMMEDIATE`) | Chủ động ack sau xử lý xong; cần chốt retry/DLQ contract | open HLD-MDM-003 |
| Kafka producer idempotent (`acks=all`, `retries=3`) | Giảm rủi ro mất message khi publish catalog event | TECHSTACK §kafka |
| Skip self-publish: handler bỏ `MessageStep=GARAGE_CATALOG_1` | Tránh xử lý vòng lặp khi service tự publish lại topic vehicle-catalog | events `_CONVENTIONS.md` §loop-prevention |
| Publish PIM live data qua `MdmCatalogPublisher` (chưa qua outbox) | Implementation hiện không có outbox; trade reliability cho đơn giản | open HLD-MDM-006 (event versioning) |

## 4. Dependencies

### 4.1 Inbound

| Caller | Type | Purpose |
|---|---|---|
| `agg-garage-graph` (BFF passthrough cho Admin / Portal) | Sync REST `/api/v1/*` (bearer JWT) | CRUD catalog, import, dynamic master data (5 active endpoints, 16 unused) |
| Service nội bộ (gf-sales, gf-inventory, gf-customer, gf-hrms) | Sync REST `/protected/**` (x-api-key) | Lookup catalog hierarchy, dynamic data theo code |
| External catalog source | Async consume Kafka `vehicle-catalog` | Inbound catalog xe / insurance / province event |
| External PIM source | Async consume Kafka `pim-info` | Inbound PIM live data → forward `gf-inventory` |

### 4.2 Outbound

| Dependency | Type | Purpose |
|---|---|---|
| `gf-inventory` | Sync REST + x-api-key | `POST /protected/v1/pim-info` chuyển PIM live data |
| Kafka `vehicle-catalog` | Async publish | Catalog event với envelope `PimLivedMessage` |
| PostgreSQL | DB + DDL | Schema `${DB_SCHEMA:dev_gf_erp_mdm}` — static entities + runtime DDL cho dynamic |
| Common messaging library | In-process | Headers `MessageGroup`, `MessageStep`, `OriginTenantId`, `OriginMessageCode` |
| Apache POI (poi + poi-ooxml) | In-process library | Parse XLS/XLSX cho import vehicle/common catalog |
| Actuator + OTLP | Observability | Health/metrics/prometheus + tracing |

## 5. Data Ownership

**Owned (PostgreSQL `dev_gf_erp_mdm` schema)** — chi tiết physical schema xem [data/gf-erp-mdm-data-model.md](../data/gf-erp-mdm-data-model.md):

| Table | Vai trò | Type |
|---|---|---|
| `mdm_catalog` | Catalog cây tổng quát: `id`, `directory`, `code`, `name`, `parent_id`, `parent_directory`, `deleted` (soft delete) | Static entity |
| `master_data_registry` | Cấu hình dataset + key + `targetTableName` + flag cột kỹ thuật + `isTableCreated` + `ddlErrorMessage` | Static entity |
| `master_data_definition` | Metadata field/type/uniqueness/default/format/nullable cho dynamic data | Static entity |
| `{targetTableName}_data` | Dữ liệu dynamic master data | **Runtime DDL** (CREATE TABLE) |
| `{targetTableName}_data_archive` | Bản archive/audit dynamic data | **Runtime DDL** |

**Quy ước dynamic table**:
- Tên: `{targetTableName}_data` + `{targetTableName}_data_archive`
- Cột kỹ thuật optional theo flag: `status`, `is_deleted`, `effected_from`, `effected_to`, `parent_id`
- Type mapping: `NUMERIC`, `BIG_DECIMAL`, `STRING`, `TEXT`, `TIMESTAMP`, `BOOLEAN`, `BIGINT`; default fallback `string`

**Tenancy**: entity tĩnh **không có `tenant_id`** — master data global (open HLD-MDM-005). Header Kafka `OriginTenantId` được đọc nhưng không thành partition key trong schema hiện tại.

**KHÔNG own**:
- Sales / inventory / purchase / accounting nghiệp vụ data (boundary tương ứng)
- Tenant-specific master data (chưa có model — phải mapping riêng nếu cần)
- Workflow duyệt thay đổi catalog (chưa có trong source)

## 6. Quality Attributes

| Attribute | Target |
|---|---|
| Catalog hierarchy lookup p95 (warm) | ≤ 200ms |
| Dynamic data CRUD p95 | ≤ 300ms |
| Catalog inquiry pagination p95 | ≤ 400ms |
| Import multipart limit | 10 MB (`spring.servlet.multipart.max-file-size`) |
| Import async — file lớn | trả `202` immediate, status query qua API riêng (open HLD-MDM-007 — chưa có) |
| Kafka consumer ack | `MANUAL_IMMEDIATE` — handler ack sau xử lý xong |
| Kafka producer reliability | `acks=all`, `retries=3`, `enable.idempotence=true` |
| Dynamic DDL execution | Single replica execution (race condition risk nếu multi-replica race CREATE TABLE — guard qua `isTableCreated` flag) |
| HTTP outbound `gf-inventory` | Connection pool 50 total / 50 per route |
| Runtime | Java 21, Spring Boot 3.5.0 |
| Multi-replica | Stateless trừ DB; consumer scale theo Kafka partition |
| Schema migration | ⚠️ JPA `ddl-auto=update`, **không có Flyway** (open HLD-MDM-001) |

## 7. Forbidden Actions

- ❌ Build SQL động từ raw `tableName` / `fieldName` / `operator` không kiểm allowlist (SQL injection risk; chỉ cho phép identifier nằm trong `master_data_registry` + `master_data_definition`; operator phải validate qua enum `FilterOperator` — open HLD-MDM-002).
- ❌ Deploy production với `INTERNAL_API_KEY` rỗng (default empty trong config; phải fail-fast khi profile ≠ local — open HLD-MDM-004).
- ❌ Cấp quyền DDL toàn schema cho service user (chỉ cho `CREATE TABLE` trên dataset đã được approve qua `master_data_registry`).
- ❌ Process Kafka catalog event không kiểm `MessageGroup` + `MessageStep` filter (vd skip `GARAGE_CATALOG_1` để tránh self-loop khi service tự publish).
- ❌ Hard-delete `mdm_catalog` row (audit invariant — dùng `deleted=true` soft delete).
- ❌ Hard-delete `master_data_registry` / `master_data_definition` khi `isTableCreated=true` (orphan dynamic table — phải drop table trước).
- ❌ Add `tenant_id` ngầm vào catalog tĩnh hiện tại (master data global — nếu cần tenant-specific phải có mapping table riêng + ADR; open HLD-MDM-005).
- ❌ Bật `ddl-auto=update` ở production mà không có Flyway baseline (schema drift; open HLD-MDM-001).
- ❌ Publish `vehicle-catalog` event mà không set `OriginTenantId` + `OriginMessageCode` headers (consumer mất context trace/idempotency).
- ❌ Process `pim-info` event payload mà không sanitize trước khi forward `gf-inventory` (cross-boundary leak nếu PIM source untrusted).

## 8. References

- **TECHSTACK**: §master-data, §kafka, §security, §http-client
- **API spec**: [gf-erp-mdm-api.md](../api/gf-erp-mdm-api.md) — Public catalog API, Import API, Dynamic master data API, Protected internal API (chi tiết DTO + endpoint signature).
- **Events spec**: [erp-mdm-events.md](../events/erp-mdm-events.md) — vehicle-catalog (in/out) + pim-info (in), header contract, MessageStep enum.
- **Workflows**:
  - [erp-mdm-catalog-master-data-sync-flow.md](../workflows/erp-mdm-catalog-master-data-sync-flow.md) — full flow: catalog hierarchy create + import + dynamic master data + Kafka catalog/PIM sync.
- **Data model**: [gf-erp-mdm-data-model.md](../data/gf-erp-mdm-data-model.md) — physical schema, enum catalog (`FilterOperator`, `SortDirection`, `PIMStatus`, `PartGroupCodeEnum`, `MessageGroup`, `MessageStep`).
- **Cross-link HLD**:
  - [gf-inventory-HLD.md](gf-inventory-HLD.md) — primary downstream consumer (PIM live + catalog lookup)
  - [gf-sales-HLD.md](gf-sales-HLD.md), [gf-purchase-HLD.md](gf-purchase-HLD.md), [gf-customer-HLD.md](gf-customer-HLD.md) — internal API consumers


## Change Log

| Date | Version | Summary |
|---|---|---|
| 2026-05-30 | v3 | Redraw §2 Component Diagram  theo grammar C4 L3 (`_TEMPLATE-HLD` v2): single-box layered (MdmCatalogCtrl·ImportMdmCatalogCtrl·DynamicMasterDataCtrl·CatalogMdmContentInternalCtrl + Kafka Handlers → MDM services + Apache POI → JPA ddl-auto runtime DDL/Kafka/HttpClient) + connector `┬`/`▼`; **external side-exit `───┼─►`** gf-inventory (PIM forward); global no-tenant + Kafka P/C footer. Không đổi §1/§3-§8. |
| 2026-05-19 | v2 | Align HLD với KG v3 + source audit: (F-01) thêm Java 21 + Spring Boot 3.5.0 vào component diagram + quality attributes; (F-02) public caller "Admin / Portal / API client" → `agg-garage-graph` (BFF passthrough), ghi nhận 5 active + 16 unused public endpoints; (F-03) internal callers thêm `gf-hrms` rõ ràng (trước đây dùng "..."); (F-04) thêm Apache POI (poi + poi-ooxml) vào outbound dependencies cho import catalog. |
| 2026-05-07 | v1 | Initial HLD cho `gf-erp-mdm`: catalog MDM (cây `mdm_catalog`), dynamic master data qua metadata + runtime DDL, public REST `/api/v1/*` (bearer JWT) + protected `/protected/**` (x-api-key), Kafka `vehicle-catalog` (in/out) + `pim-info` forward `gf-inventory`, master data global (no `tenant_id`). Bao gồm component diagram, key design decisions, dependencies, data ownership, quality attributes, forbidden actions, references sang `api/`, `events/`, `workflows/`, `data/`. |
