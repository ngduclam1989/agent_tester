---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-CAT-PROD-EXPORT.md"
source_feat_id: "FEAT-CAT-PROD-EXPORT"
source_feat_sha: "4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03"
source_feat_version: 8
source: "gen-execution-spec"
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: []
change_type: "new-capability"
demo_signature: "POST /api/v2/internal-products/export với filter → binary .xlsx 9 cột trả về đồng bộ (≤1000 rows); vượt giới hạn → ERR-INV-045"
consumes_contracts: []
paired_bff_feats: ["FEAT-CAT-PROD-EXPORT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-EXPORT"]
paired_mobile_feats: ["FEAT-CAT-PROD-EXPORT"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EXPORT.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-EXPORT (BE): Xuất danh mục mã sản phẩm nội bộ ra file Excel

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EXPORT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | POST /api/v2/internal-products/export với filter → binary .xlsx 9 cột (≤1000 rows); vượt → ERR-INV-045 |
| Cross-tier pair | BFF: FEAT-CAT-PROD-EXPORT \| Web: FEAT-CAT-PROD-EXPORT \| Mobile: FEAT-CAT-PROD-EXPORT |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-EXPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) |
| Source version | v8 |
| Source SHA | `4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xuất danh sách mã sản phẩm nội bộ ra file Excel để tra cứu ngoài hệ thống hoặc chuẩn bị dữ liệu tái import lần sau. Feature nằm ở cuối flow danh mục vật tư W03: sau khi thiết lập và lọc mã sản phẩm nội bộ, người dùng có thể export kết quả bộ lọc hiện tại thành file tải về ngay. File xuất ra có cấu trúc 9 cột đồng nhất với template import, đảm bảo dữ liệu có thể tái sử dụng mà không cần chuyển đổi thêm.

## 2. Trách nhiệm backend (`gf-inventory`)

- Expose `POST /api/v2/internal-products/export` (V2-22) nhận bộ lọc `InternalProductExportInput` cùng cấu trúc filter với V2-7 search, trả binary `.xlsx` đồng bộ (Option A — single-call stream).
- Trước khi build file: thực hiện `COUNT(*)` trên tập kết quả đã filter; nếu count > 1000 → reject `ERR-INV-045` HTTP 422 không stream file (R23 canonical).
- Build workbook Apache POI với 9 cột canonical theo thứ tự: `code`, `name`, `mainUnitCode`, `nature`, `materialGroupCode`, `brand`, `originCode`, `productSpec`, `technicalSpec`; audit fields và `imageUrl` OMIT (R22).
- Enforce tenant isolation: mọi query chỉ trả `internal_product` thuộc `TenantContext.tenantId` hiện tại — TenantFilter bắt buộc.
- Enforce phân quyền: chỉ `garage-owner` và `accountant` (Critical Rule #6) được gọi endpoint; JWT Bearer bắt buộc, tenant resolve từ token.
- Không có schema migration mới — feature reuse `internal_product` table đã có từ FEAT-CAT-PROD-CREATE (ADR-017). **NEED CONFIRMATION**: `org.apache.poi:poi-ooxml` cần thêm vào `services/gf-inventory/build.gradle` nếu chưa có dependency.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Nhận filter và đếm kết quả

#### AC-1 → BE nhận bộ lọc và quyết định có export không

- **Khi**: Client POST `/api/v2/internal-products/export` với body `InternalProductExportInput { keyword, status, nature, materialGroupId }` (mọi field đều optional)
- **BE phải**: Áp filter vào query `internal_product` (cùng predicate logic với V2-7 search: keyword OR-match `code/name/SKU`, status filter, nature filter, materialGroupId filter); thực hiện `SELECT COUNT(*)` trước khi fetch full data
- **Output**: Nếu count ≤ 1000 → tiếp tục AC-2 build file. Nếu count > 1000 → trả HTTP 422 + JSON `{ errorCode: "ERR-INV-045", message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" }`
- **Failure mode**: DB unavailable → HTTP 500 log stack trace, không leak detail
- **Ref**: BR-CAT-PROD-007 (§9), BR-CAT-PROD-024 (§9), entity `internal_product` (§5.1), endpoint `POST /api/v2/internal-products/export` (§6.1)

#### AC-3 → BE xử lý request không có bộ lọc

- **Khi**: Client gửi body rỗng `{}` hoặc tất cả fields đều null
- **BE phải**: Query toàn bộ `internal_product` thuộc tenant hiện tại (không áp filter nào); count check vẫn bắt buộc áp dụng — nếu tổng records tenant > 1000 → ERR-INV-045; nếu ≤ 1000 → export all
- **Output**: Cùng flow với AC-1
- **Failure mode**: Tenant có 0 records → HTTP 200 + file `.xlsx` chỉ có header row (không data row)
- **Ref**: BR-CAT-PROD-007 (§9), entity `internal_product` (§5.1)

### Cluster B — Build workbook và stream response

#### AC-2 → BE build file .xlsx 9 cột canonical

- **Khi**: Count ≤ 1000, BE fetch full result set và build workbook
- **BE phải**: Fetch tất cả records match filter (không phân trang — single query); dùng Apache POI `XSSFWorkbook` tạo sheet với 9 cột header row theo thứ tự cố định, sau đó map từng record thành 1 data row; đặt `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` + `Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx"` (timestamp UTC+7 tại thời điểm request)
- **9 cột theo thứ tự**: `code` | `name` | `mainUnitCode` | `nature` | `materialGroupCode` | `brand` | `originCode` | `productSpec` | `technicalSpec` — audit columns (`created_at/by`, `updated_at/by`) và `imageUrl` KHÔNG đưa vào file
- **Output**: HTTP 200 + binary stream `.xlsx`; `materialGroupCode` lấy từ `material_group.code` qua scalar FK `material_group_id`; `brand` là free-text VARCHAR(255); `originCode` là ISO 3166-1 alpha-3 string
- **Failure mode**: POI build error → HTTP 500; ghi log lỗi + rethrow wrapped exception
- **Ref**: BR-CAT-PROD-017 (§9 — column schema match template import), BR-CAT-PROD-018 (§9 — brand/originCode type), entity `internal_product` + `material_group` (§5.1)

### Cluster C — Phân quyền và tenant scope

#### AC-4 → BE enforce phân quyền và giới hạn phạm vi garage

- **Khi**: Mọi request tới `POST /api/v2/internal-products/export`
- **BE phải**: Yêu cầu JWT Bearer hợp lệ; resolve `tenantId` từ token qua `TenantContext`; chỉ cho phép `garage-owner` và `accountant` thực hiện (role check tại controller/filter layer); mọi query thêm predicate `tenant_id = TenantContext.tenantId` qua `TenantFilter`
- **Output**: Nếu JWT thiếu/hết hạn → HTTP 401; nếu role không đủ → HTTP 403; nếu đúng role → tiếp tục flow
- **Failure mode**: Token không resolve tenantId → HTTP 401 + generic error (không leak tenant info)
- **Ref**: Critical Rule #4 (tenant isolation), Critical Rule #6 (dual persona), BR-CAT-PROD-001 (§9)

### Cluster D — Giới hạn dòng xuất

#### AC-5 → BE enforce row-cap 1000 dòng

- **Khi**: COUNT(*) trả về giá trị > 1000 sau khi áp filter
- **BE phải**: Return HTTP 422 + error body `{ errorCode: "ERR-INV-045", message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" }` (R23 canonical message — KHÔNG thay đổi wording)
- **Output**: KHÔNG stream file; KHÔNG build workbook (fail fast tại count gate)
- **Failure mode**: N/A (count gate là failure mode)
- **Ref**: BR-CAT-PROD-024 (§9), error code `ERR-INV-045` (§4.4)

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-PROD-001** (CORNERSTONE): chỉ export dữ liệu thuộc tenant scope hiện tại — enforce tại repository layer qua `TenantFilter` predicate. Vi phạm = data breach (Critical Rule #4).
- **BR-CAT-PROD-007** (NORMAL): bộ lọc export phải hỗ trợ cùng các chiều filter với V2-7 search (`keyword`, `status`, `nature`, `materialGroupId`) — enforce tại service layer khi build JPA Specification.
- **BR-CAT-PROD-017** (CORNERSTONE): 9 cột file export phải khớp chính xác với template import column schema — enforce tại `InternalProductExportService` workbook builder; sai thứ tự cột hoặc thiếu cột = contract violation với import flow.
- **BR-CAT-PROD-018** (NORMAL): `brand` xuất ra là free-text (VARCHAR 255) — KHÔNG resolve catalog; `originCode` xuất ra là ISO 3166-1 alpha-3 string — KHÔNG resolve display name tại BE (BFF enrich nếu cần).
- **BR-CAT-PROD-024** (NORMAL): giới hạn 1000 dòng/lần xuất — enforce tại service layer (COUNT gate trước build workbook). Vi phạm → `ERR-INV-045` HTTP 422.

### 4.2 Tenant + auth

- `TenantFilter` bắt buộc trên mọi query `internal_product` và `material_group` join (Critical Rule #4).
- Endpoint yêu cầu JWT Bearer; `X-Tenant-Id` resolve từ token claim `custom:tenant_id` (per KG auth pattern).
- Chỉ `garage-owner` và `accountant` được phép gọi endpoint (Critical Rule #6); dùng `@PreAuthorize` hoặc filter tương đương tại controller level.

### 4.3 Idempotency + concurrency

- Endpoint là read-only + binary render — không có side-effect, không cần Idempotency-Key header.
- Không dùng locking; query snapshot consistent tại thời điểm COUNT + fetch (không cần serializable isolation vì export là best-effort snapshot).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---:|---|---|
| `ERR-INV-045` | 422 | AC-5 | TOAST — "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" |
| `GMS.gf-inventory.INTERNAL_PRODUCT_EXPORT.01` | 400 | AC-1, AC-3 | TOAST — filter không parse được |
| `GMS.gf-inventory.INTERNAL_PRODUCT_EXPORT.02` | 401 | AC-4 | — redirect login |
| `GMS.gf-inventory.INTERNAL_PRODUCT_EXPORT.03` | 403 | AC-4 | TOAST — không đủ quyền |
| `GMS.gf-inventory.INTERNAL_PRODUCT_EXPORT.06` | 500 | AC-2 | TOAST — lỗi hệ thống khi tạo file |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

Không có schema migration mới cho feature này. Mọi column cần thiết đã có từ `internal_product` (FEAT-CAT-PROD-CREATE, ADR-017 migration `V20260624020000__create_internal_product.sql`):

| Column | Xuất vào cột Excel | Notes |
|---|---|---|
| `code` | `code` | VARCHAR(50), required |
| `name` | `name` | VARCHAR(255), required |
| `main_unit_code` | `mainUnitCode` | VARCHAR(20) |
| `nature` | `nature` | enum GOODS/TOOL/SERVICE/OTHER |
| `material_group_id` | (join) `material_group.code` → `materialGroupCode` | scalar FK — join để lấy `code` |
| `brand` | `brand` | VARCHAR(255) nullable, free-text R18 |
| `origin_code` | `originCode` | VARCHAR(20) nullable, ISO 3166-1 alpha-3 |
| `product_spec` | `productSpec` | text nullable |
| `technical_spec` | `technicalSpec` | text nullable |
| `image_url` | **OMIT** | skip per R22 |
| audit columns | **OMIT** | skip per R22 |

**RESOLVED (CR-20260630-01 P2.2)**: Apache POI dependency confirmed available — gf-inventory `build.gradle` đã include `org.apache.poi:poi-ooxml:5.x` cho import V2-20/V2-21 (reuse cùng dep cho export V2-22 stream binary). Verify: `./gradlew dependencies | grep poi-ooxml`. Nếu absent (legacy ADR-018 FE-only parse decision), S1 add dependency là step trivial.

### 5.2 Index / constraint changes

Không có index mới. Query export dùng filter tương tự V2-7 search — các index đã có từ FEAT-CAT-PROD-LIST đủ cover (index on `(tenant_id, status)`, `(tenant_id, nature)`, `(tenant_id, material_group_id)`).

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response | Idempotency | AC ref |
|---|---|---|---|---|---|---|
| POST | `/api/v2/internal-products/export` | JWT Bearer | `InternalProductExportInput` (xem dưới) | Binary `.xlsx` (200) hoặc JSON error (422/400/401/403/500) | safe (read, no key needed) | AC-1, AC-2, AC-3, AC-4, AC-5 |

**Request body `InternalProductExportInput`**:
```json
{
  "keyword": "string? (OR-match trên code/name/SKU — cùng logic V2-7)",
  "status": "ACTIVE | INACTIVE | null (default: không filter)",
  "nature": "GOODS | TOOL | SERVICE | OTHER | null (default: không filter)",
  "materialGroupId": "UUID? (nullable — không filter nếu null)"
}
```

**Response 200** — binary stream:
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx"
Body: <binary .xlsx>
```

**Response 422** — row cap exceeded:
```json
{
  "errorCode": "ERR-INV-045",
  "message": "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"
}
```

**Workbook structure** (9 cột, 1 sheet "Danh mục SP nội bộ"):

| Thứ tự | Column key | Header display | Data source |
|---|---|---|---|
| 1 | `code` | Mã SP nội bộ | `internal_product.code` |
| 2 | `name` | Tên SP nội bộ | `internal_product.name` |
| 3 | `mainUnitCode` | ĐVT chính | `internal_product.main_unit_code` |
| 4 | `nature` | Tính chất | `internal_product.nature` (enum string) |
| 5 | `materialGroupCode` | Mã nhóm vật tư | `material_group.code` (join qua `material_group_id`) |
| 6 | `brand` | Hãng sản xuất | `internal_product.brand` (free-text) |
| 7 | `originCode` | Mã xuất xứ | `internal_product.origin_code` (ISO 3166-1 alpha-3) |
| 8 | `productSpec` | Quy cách SP | `internal_product.product_spec` |
| 9 | `technicalSpec` | Thông số kỹ thuật | `internal_product.technical_spec` |

### 6.2 Modified REST endpoints (additive)

Không có endpoint hiện tại nào bị modify.

### 6.3 Kafka topics

Không publish/consume Kafka — export là read-only, không sinh event (ADR-016: export đồng bộ — không publish event).

### 6.4 Cross-boundary REST consumers

Không có cross-boundary call mới. `materialGroupCode` resolve nội bộ trong gf-inventory (join `material_group` table — cùng boundary).

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-PROD-EXPORT.md`) sẽ wrap V2-22 thành GraphQL mutation hoặc pass-through tùy design BFF tier. BE không mô tả GraphQL — đó là BFF territory.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-inventory/**` (Critical Rule #1 boundary isolation).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `adapter/controller` | `src/main/java/.../adapter/controller/InternalProductController.java` | MODIFY | add `/export` method | ~30 | AC-1, AC-4 |
| `adapter/controller/dto` | `src/main/java/.../adapter/controller/dto/InternalProductExportRequest.java` | NEW | DTO record | ~15 | AC-1, AC-3 |
| `app/service` | `src/main/java/.../app/service/InternalProductExportService.java` | NEW | export service (count gate + POI build) | ~120 | AC-1, AC-2, AC-3, AC-5 |
| `app/service` | `src/main/java/.../app/service/InternalProductService.java` | MODIFY | delegate to ExportService | ~10 | AC-1 |
| `domain/repository` | `src/main/java/.../domain/repository/InternalProductRepository.java` | MODIFY | add `countByFilter()` + `findAllByFilter()` finders | ~20 | AC-1, AC-3, AC-5 |
| `build.gradle` | `services/gf-inventory/build.gradle` | MODIFY | add `org.apache.poi:poi-ooxml` dependency (NC-1) | ~2 | AC-2 |
| `test/unit` | `src/test/java/.../app/service/InternalProductExportServiceTest.java` | NEW | unit test count gate + workbook columns | ~100 | AC-2, AC-5 |
| `test/contract` | `src/test/java/.../adapter/controller/InternalProductExportContractTest.java` | NEW | contract test 200/422/401/403 | ~80 | AC-1, AC-4, AC-5 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Verify schema + add Apache POI dependency
    Entry: ADR-017 migrations đã có (FEAT-CAT-PROD-CREATE); NC-1 confirmed
    Exit: `build.gradle` updated, `./gradlew dependencies` resolve POI; migration V20260624020000 present
    └─► S2

S2  Implement InternalProductExportService (count gate + POI workbook)
    Entry: S1
    Exit: unit test ≥6 green (count=0, count=1000 OK, count=1001 ERR-INV-045, 9-column order, empty filter, nature filter)
    └─► S3

S3  Wire POST /api/v2/internal-products/export trong InternalProductController
    Entry: S2
    Exit: contract test green (200 binary, 422 ERR-INV-045, 401, 403)
    └─► S4

S4  Integration test (full flow: filter → count → stream)
    Entry: S3 + internal_product seed data in test DB
    Exit: integ test green — verify binary .xlsx header + 3 data rows; count=1001 → 422
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify schema + POI dep | build.gradle + verify migration | NC-1 confirmed | POI resolve OK | — |
| S2 | ExportService (count gate + workbook) | app/service | S1 | Unit test ≥6 green | S1 |
| S3 | REST adapter (export endpoint) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + seed data | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT)

| BR ID | Severity | Enforcement layer | Where (path glob) | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-PROD-001` | CORNERSTONE | repository (TenantFilter predicate) | `InternalProductRepository.java` + `TenantFilter.java` | AC-4 | `TC-BR-INV-PROD-001-export-*` |
| `BR-CAT-PROD-007` | NORMAL | service (Specification builder) | `InternalProductExportService.java::buildFilterSpec()` | AC-1, AC-3 | `TC-BR-INV-PROD-007-export-*` |
| `BR-CAT-PROD-017` | CORNERSTONE | service (workbook builder — column order) | `InternalProductExportService.java::buildWorkbook()` | AC-2 | `TC-BR-INV-PROD-017-*` |
| `BR-CAT-PROD-018` | NORMAL | service (no catalog validation on export path) | `InternalProductExportService.java` | AC-2 | `TC-BR-INV-PROD-018-export-*` |
| `BR-CAT-PROD-024` | NORMAL | service (count gate, fail fast) | `InternalProductExportService.java::validateRowCap()` | AC-5 | `TC-BR-INV-PROD-024-*` |

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract + Integration | test-api | filter combinations → 200 binary + verify Content-Disposition filename pattern |
| AC-2 | Unit (workbook) + API contract | test-api | 9-column header order exact; data row mapping; `materialGroupCode` join correct; OMIT audit+imageUrl |
| AC-3 | API contract | test-api | body `{}` → count check → export all (seed ≤ 1000); Content-Type binary |
| AC-4 | Isolation (RBAC) | test-isolation | no JWT → 401; wrong role → 403; valid garage-owner → 200; valid accountant → 200; cross-tenant seed → không hiện |
| AC-5 | Unit (count gate) + API contract (negative) | test-api | count=999 → 200; count=1000 → 200; count=1001 → 422 ERR-INV-045 + exact message |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-EXPORT.md` | DRAFT (pending) | BFF wrap V2-22 — binary pass-through hoặc mutation tùy BFF tier design; BFF KHÔNG re-encode .xlsx |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EXPORT.md` | DRAFT (pending) | Web trigger nút "Xuất file" → gọi BFF op → download binary; ERR-INV-045 hiển thị TOAST |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-EXPORT.md` | DRAFT (pending) | Flutter trigger export → share/save binary .xlsx; ERR-INV-045 hiển thị SnackBar |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03`.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) v8
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: [`BR-GF-INVENTORY-CATALOG.md`](../../business-rules/BR-GF-INVENTORY-CATALOG.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §4 V2-22
- **ADR-017**: [`Architecture/decisions/ADR-017.md`](../../../../../Architecture/decisions/ADR-017.md) — InternalProduct additive aggregates
- **ADR-018**: [`Architecture/decisions/ADR-018.md`](../../../../../Architecture/decisions/ADR-018.md) — import JSON pattern (context: export là Option A stream, bổ sung cho import flow)
- **ADR-016**: [`Architecture/decisions/ADR-016.md`](../../../../../Architecture/decisions/ADR-016.md) — export đồng bộ, không publish event
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md) §2.2.1 V2-22

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-CAT-PROD-EXPORT` W03. Policy v2 tier-authoritative: §1 mục đích nghiệp vụ, §2 trách nhiệm BE, §3 behaviour map 5 AC-IDs (Cluster A filter/count, Cluster B workbook build, Cluster C auth, Cluster D row-cap), §4 ràng buộc, §5 schema delta (no migration — reuse ADR-017 tables), §6 V2-22 export endpoint spec + 9-column workbook contract, §7 file map Hexagonal, §8 DAG S1-S4, §9 BR primary, §10 test hand-off, §11 cross-tier pair. NC-1: xác nhận Apache POI dependency. |
