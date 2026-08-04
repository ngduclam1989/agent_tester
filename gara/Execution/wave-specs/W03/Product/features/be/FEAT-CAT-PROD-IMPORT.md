---
type: execution
artifact_kind: converted-feature
tier_role: backend
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-IMPORT"
source_feat_sha: "2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4"
source_feat_version: 10
generated_at: "2026-06-29T14:36:41+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "agg-garage-graph", "gf-erp-mdm"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage upload xlsx 200 mã SP nội bộ → verify → 0 lỗi → xác nhận import → 200 mã imported thành công, history logged"
consumes_contracts:
  - "gf-erp-mdm directory lookup API — validate mainUnitCode (directory=UNIT) + originCode (directory=COUNTRY)"
paired_bff_feats: ["FEAT-CAT-PROD-IMPORT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-IMPORT"]
paired_mobile_feats: ["FEAT-CAT-PROD-IMPORT"]
authoring_inputs:
  kg_baseline_sha: "bcfe8d8cf104cc121280b3750d587448e848347a8936c888834b9627918e72d7"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "649441da..."
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-IMPORT.be.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-29"
---

# FEAT-CAT-PROD-IMPORT (BE): Import hàng loạt mã sản phẩm nội bộ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-IMPORT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `agg-garage-graph`, `gf-erp-mdm` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| Demo signature | Chủ garage upload xlsx 200 mã SP nội bộ → verify → 0 lỗi → xác nhận import → 200 mã imported thành công, history logged |
| Cross-tier pair | BFF: FEAT-CAT-PROD-IMPORT \| Web: FEAT-CAT-PROD-IMPORT \| Mobile: FEAT-CAT-PROD-IMPORT |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) |
| Source version | v10 |
| Source SHA | `2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4` |
| Generated at | 2026-06-29T14:36:41+00:00 |

---

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần nhập số lượng lớn mã sản phẩm nội bộ từ file dữ liệu có sẵn, thay vì tạo từng mã thủ công qua form. Feature cung cấp quy trình hai bước — kiểm tra dữ liệu trước (verify), xác nhận rồi mới ghi (commit) — đảm bảo danh mục tồn kho V2 không nhận dữ liệu lỗi. Kết quả trả về rõ ràng: số dòng thành công, số dòng lỗi kèm chi tiết, và file lỗi để tra cứu sau.

---

## 2. Trách nhiệm backend (gf-inventory)

- Expose hai REST endpoint: `POST /api/v2/internal-products/verify-import` (V2-20, dry-run) và `POST /api/v2/internal-products/import` (V2-21, commit) — nhận JSON `items[]` do FE parse từ xlsx client-side (ADR-018 JSON body pattern).
- Validate từng item trong batch: regex code, unique code trong tenant, `mainUnitCode` tồn tại qua gf-erp-mdm directory=UNIT, `originCode` nếu có qua gf-erp-mdm directory=COUNTRY batch, `nature` enum, `materialGroupCode` ACTIVE.
- Enforce hard cap ≤500 items/request → ERR-INV-041 trước khi bước vào validation logic (ADR-018 R28 canonical).
- Persist valid rows vào `internal_product` (Flyway migration đã planned ADR-017; `nature` default `GOODS`, `pricing_method` default `PWA` locked; cột `pricingMethod` bị loại khỏi import schema per BR-CAT-PROD-017 v4).
- Ghi audit trail: mỗi row import thành công → 1 entry trong `internal_product_history` (BR-CAT-CMN-001).
- Expose endpoint template download (AC-2) và endpoint sinh error xlsx via Apache POI (AC-9).
- Enforce RBAC qua `@PreAuthorize` — chỉ role được phép (BR-CAT-PROD-022) mới gọi được import endpoints.

---

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Template & wizard scaffold

#### AC-1 → N/A (UI-only — mở wizard import)

Source AC-1 mô tả hành động người dùng mở wizard trên màn hình danh sách. BE không có action. Xem `fe-web/FEAT-CAT-PROD-IMPORT.md §3 AC-1` và `mobile/FEAT-CAT-PROD-IMPORT.md §3 AC-1`.

#### AC-2 → Phục vụ file template xlsx import

- **Khi**: client `GET /api/v2/internal-products/import-template` (với JWT hợp lệ)
- **BE phải**: trả file xlsx chứa header row đúng schema R14 — các cột: `code`, `name`, `mainUnitCode`, `nature`, `materialGroupCode`, `brand`, `originCode`, `productSpec`, `technicalSpec`. **Không có cột `pricingMethod`** (BR-CAT-PROD-017 v4 explicit exclude). File có thể là classpath static resource hoặc sinh động qua Apache POI.
- **Output**: HTTP 200, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="import-template-internal-products.xlsx"`
- **Failure mode**: 401 thiếu/hết hạn token; 403 không đủ quyền
- **Ref**: BR-CAT-PROD-017 v4 (§9), endpoint `GET /api/v2/internal-products/import-template` (§6.1)

> **NEED CONFIRMATION [NC-1]**: Endpoint này không có V2-ID trong bundle (PKG table truncated sau V2-11). Cần Architecture Authority confirm V2-ID từ `Architecture/api/gf-inventory-api.md §4`. Nếu không tồn tại endpoint riêng → template là static resource/constant trong FE/BFF.

#### AC-3 → N/A (UI-only — FE parse xlsx, chuẩn bị JSON)

FE parse file `.xlsx` client-side thành `items[]` JSON (ADR-018 — BE không nhận file binary). BE chỉ nhận JSON tại V2-20/V2-21. Xem `fe-web/FEAT-CAT-PROD-IMPORT.md §3 AC-3`.

---

### Cluster B — Verify step (dry-run)

#### AC-4 → Xử lý verify-import, trả report tổng quan

- **Khi**: client `POST /api/v2/internal-products/verify-import` body `{items: ImportItemDto[], skipDuplicates: boolean}`
- **BE phải**:
  1. Kiểm tra cap: `items.length > 500` → HTTP 400 + `ERR-INV-041` (reject ngay, không validate tiếp)
  2. Batch query `internal_product` để preload existing codes trong tenant: `SELECT code FROM internal_product WHERE tenant_id = ? AND code IN (?)`
  3. Batch validate `mainUnitCode[]` qua gf-erp-mdm directory=UNIT (batch single call)
  4. Batch validate `originCode[]` (chỉ distinct non-null values) qua gf-erp-mdm directory=COUNTRY (batch single call)
  5. Validate từng item — chi tiết xem AC-5
  6. **KHÔNG persist bất kỳ dữ liệu nào** — endpoint hoàn toàn read-only (dry-run)
  7. Trả `ImportVerifyReportDto { summary: {total, valid, error}, errorRows: [{rowIndex, code, errors[{field, errorCode, message}]}] }`
- **Output**: HTTP 200 (kể cả khi có lỗi rows — per-row errors trong body); `errorRows` rỗng khi toàn bộ valid
- **Failure mode**: 400 + ERR-INV-041 (cap vượt); 502 gf-erp-mdm không phản hồi; 401/403 auth
- **Ref**: BR-CAT-PROD-001/003/019 (§9), endpoint V2-20 `POST /api/v2/internal-products/verify-import` (§6.1)

#### AC-5 → Validate từng dòng, trả per-row error detail

- **Khi**: mỗi `ImportItemDto` trong request body của V2-20 (verify) hoặc V2-21 (import)
- **BE phải** thực hiện validation theo thứ tự cố định (fail-fast per field):

  | STT | Field | Rule | Error code |
  |---|---|---|---|
  | 1 | `code` | Required + không chứa `~!@#$%^&*` | `ERR-INV-006` |
  | 2 | `code` | Unique trong tenant (kiểm tra preloaded codes từ DB + trùng trong chính batch) | `ERR-INV-007` (hoặc skip nếu `skipDuplicates=true`) |
  | 3 | `name` | Required, không rỗng | validation error generic |
  | 4 | `mainUnitCode` | Required + tồn tại trong gf-erp-mdm directory=UNIT | `ERR-INV-012` hoặc ERR-CMN-validation |
  | 5 | `nature` | Optional; nếu có phải ∈ {`GOODS`, `TOOL`, `SERVICE`, `OTHER`} | `ERR-INV-012` |
  | 6 | `materialGroupCode` | Optional; nếu có phải tồn tại + `status=ACTIVE` trong `material_group` cùng tenant | ERR-CMN-validation |
  | 7 | `originCode` | Optional; nếu có phải tồn tại trong gf-erp-mdm directory=COUNTRY | `ERR-INV-044` (R28 canonical — batch context) |
  | 8 | `brand` | Optional, free-text VARCHAR(255); không validate catalog (R18 free-text rule) | length check chỉ |
  | 9 | `pricingMethod` | **KHÔNG accept** — reject nếu client gửi field này | 400 unknown field |

- **Output per item**: `{rowIndex: int, code: string?, errors: [{field, errorCode, message}]}` — trả TẤT CẢ lỗi của 1 item (không dừng tại lỗi đầu tiên)
- **Ref**: BR-CAT-PROD-001 (code unique), BR-CAT-PROD-003 (code regex), BR-CAT-PROD-019 (nature enum), entity `InternalProduct` (§5.1)

---

### Cluster C — Commit step

#### AC-6 → Thực hiện import, persist valid rows trong transaction

- **Khi**: client `POST /api/v2/internal-products/import` body `{items: ImportItemDto[], skipDuplicates: boolean}`
- **BE phải**:
  1. Validate cap ≤500 → ERR-INV-041 nếu vượt
  2. Chạy toàn bộ validation logic từ AC-5
  3. Phân loại: `validItems[]` + `invalidItems[]` (+ `skippedItems[]` nếu `skipDuplicates=true` và code trùng)
  4. Persist `validItems` trong 1 transaction:
     - `INSERT INTO internal_product (tenant_id, code, name, main_unit_code, nature, pricing_method, material_group_id, brand, origin_code, product_spec, technical_spec, status, created_by, created_at)` — batch insert
     - `nature` default `GOODS` khi item không cung cấp; `pricing_method` hardcode `PWA` (locked, BR-CAT-PROD-010)
     - `material_group_id` resolve từ `materialGroupCode` → `material_group.id` (tenant-scoped lookup)
  5. Sau persist: ghi `internal_product_history` 1 row per valid item (action=`IMPORT`, BR-CAT-CMN-001) trong cùng transaction
  6. `skipDuplicates=true`: các item trùng code không ghi vào `failedRows`, ghi vào `skippedRows` (không count là lỗi)
- **Output**: HTTP 201, `ImportResultDto { importId: UUID, importedCount, failedCount, skippedCount, failedRows[{rowIndex, code, errors[]}] }`
- **Failure mode**: DB unique constraint violation mid-batch (race condition) → rollback toàn transaction → HTTP 409; client retry với `skipDuplicates=true`
- **Ref**: BR-CAT-PROD-001/005/010, BR-CAT-PROD-017 v4, BR-CAT-PROD-019, BR-CAT-CMN-001 (§9), entity `InternalProduct` (§5.1), endpoint V2-21 (§6.1)

#### AC-7 → N/A (UI-only — navigation quay lại wizard)

Navigation quay lại bước trước là client-side state. BE không có action. Xem `fe-web/FEAT-CAT-PROD-IMPORT.md §3 AC-7`.

#### AC-8 → Response V2-21 cung cấp dữ liệu màn kết quả

- **Khi**: BE hoàn thành xử lý `POST /api/v2/internal-products/import` (AC-6)
- **BE phải** đảm bảo response `ImportResultDto` chứa đầy đủ các trường FE cần render màn kết quả: `importedCount`, `failedCount`, `skippedCount`, và `failedRows[{rowIndex, code, errors[]}]`. Field `failedRows` phải non-null (trả `[]` khi không có lỗi).
- **Output**: đã là một phần của response V2-21 (AC-6) — không cần endpoint riêng
- **Ref**: endpoint V2-21 (§6.1)

---

### Cluster D — Error file download

#### AC-9 → Sinh file xlsx lỗi qua Apache POI

- **Khi**: client `POST /api/v2/internal-products/import-errors-file` body `{failedRows: [{rowIndex, code, name?, errors[{field, errorCode, message}]}]}`
- **BE phải**: nhận `failedRows[]` từ client (client giữ từ response V2-21), dùng Apache POI để sinh file xlsx với sheet "Import Errors" gồm columns: `STT`, `Mã SP`, `Tên SP`, `Cột lỗi`, `Mã lỗi`, `Mô tả lỗi`. File sinh stateless (không cần persist `importId`).
- **Output**: HTTP 200, `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="import-errors-{yyyyMMdd}.xlsx"`
- **Failure mode**: 400 nếu `failedRows` rỗng/null; 401/403 auth
- **Ref**: Apache POI dependency (§7), endpoint `POST /api/v2/internal-products/import-errors-file` (§6.1)

> **NEED CONFIRMATION [NC-2]**: Endpoint path và V2-ID chưa xác nhận từ bundle (PKG table truncated). Nếu pattern của project là FE/BFF generate error xlsx client-side từ JSON response, thì AC-9 là N/A cho BE. Architecture Authority cần confirm.

---

### Cluster E — Permission

#### AC-10 → RBAC enforce tại adapter layer

- **Khi**: bất kỳ request nào đến V2-20, V2-21, template download, hoặc error-file endpoint
- **BE phải**: `@PreAuthorize` trên controller method kiểm tra role của principal (JWT claims); unauthorized → HTTP 403. Per BR-CAT-PROD-022.
- **Output**: 403 khi thiếu quyền; request không đi qua service layer
- **Ref**: BR-CAT-PROD-022 (§9)

> **NEED CONFIRMATION [NC-3]**: BR-CAT-PROD-022 xác định role nào được phép import — bundle §D không extract được content BR file (lookup trỏ nhầm file). Spec suy luận: `garage-owner` có quyền; `accountant` cần BA confirm. Kiểm tra tại `Product/business-rules/BR-GF-INVENTORY-CATALOG.md`.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-CAT-PROD-001** (CORNERSTONE): `code` unique per `(tenant_id, code)` — enforce tại `app/service` (batch preload + check) và DB UNIQUE constraint (defense). Vi phạm per-row → `ERR-INV-007`.
- **BR-CAT-PROD-003** (NORMAL): `code` không chứa `~!@#$%^&*` — enforce tại `InternalProductImportValidatorService`. Vi phạm per-row → `ERR-INV-006`.
- **BR-CAT-PROD-010** (CORNERSTONE): `pricing_method` default `PWA`, locked — hardcode trong service layer khi persist; import schema không nhận field này.
- **BR-CAT-PROD-017 v4** (NORMAL): cột `pricingMethod` bị loại khỏi import schema — `ImportItemDto` không có field `pricingMethod`; service layer không set từ input.
- **BR-CAT-PROD-019** (NORMAL): `nature` enum {`GOODS`, `TOOL`, `SERVICE`, `OTHER`}, default `GOODS` — enforce tại DTO `@ValidEnum` + default assignment khi absent. Vi phạm → `ERR-INV-012`.
- **BR-CAT-PROD-022** (CORNERSTONE): RBAC import permission — `@PreAuthorize` trên tất cả import endpoints.
- **BR-CAT-CMN-001** (NORMAL): audit trail — 1 `internal_product_history` row per imported product trong cùng transaction với INSERT.
- **ADR-018 R28 canonical**: cap ≤500 items/request — kiểm tra đầu tiên trong service layer trước mọi validation. Vượt cap → `ERR-INV-041`.

### 4.2 Tenant + auth

- Mọi endpoint gf-inventory phải resolve `tenantId` từ JWT `custom:tenant_id` qua `TenantFilter` + `TenantContext` (Critical Rule #4). Batch DB query phải bind `WHERE tenant_id = ?` từ context, không nhận tenant từ request body.
- Cross-tenant lookup trả 404/empty. Unique constraint `(tenant_id, code)` đảm bảo tenant isolation tại DB layer.
- gf-erp-mdm cross-boundary call phải propagate `X-Tenant-Id` header.

### 4.3 Idempotency + concurrency

- **V2-20 (verify)**: read-only, tự nhiên idempotent.
- **V2-21 (import)**: không có `Idempotency-Key` header cho batch import. Strategy: wrap batch INSERT trong 1 transaction; nếu DB unique constraint violation xảy ra mid-batch (race condition double-submit) → rollback toàn bộ → HTTP 409; client tự retry với `skipDuplicates=true`.
- `internal_product` unique constraint `(tenant_id, code)` là idempotency guard cuối cùng tại DB layer.

### 4.4 Error code mapping

| Error code | HTTP | Source AC | Trigger | Display mode (FE hint) |
|---|---|---|---|---|
| `ERR-INV-041` | 400 | AC-4, AC-6 | `items.length > 500` | TOAST (toàn request bị reject) |
| `ERR-INV-006` | 422 | AC-5 | `code` chứa ký tự đặc biệt `~!@#$%^&*` | INLINE per-row trong bảng lỗi |
| `ERR-INV-007` | 422 | AC-5 | `code` trùng trong tenant (skipDuplicates=false) | INLINE per-row |
| `ERR-INV-012` | 422 | AC-5 | `nature` ngoài enum {GOODS, TOOL, SERVICE, OTHER} | INLINE per-row |
| `ERR-INV-044` | 422 | AC-5 | `originCode` không tìm thấy trong gf-erp-mdm directory=COUNTRY (batch context, R28) | INLINE per-row |

> Lưu ý: V2-20 (verify) trả HTTP 200 ngay cả khi có error rows — per-row errors nằm trong `errorRows[]` response body. V2-21 (import) tương tự — HTTP 201 với `failedRows[]` trong body. HTTP 4xx chỉ cho lỗi request-level (cap, auth).

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

Không có migration mới riêng cho FEAT-CAT-PROD-IMPORT. Import ghi vào các bảng đã định nghĩa tại ADR-017 (Flyway migrations V20260624020000 + V20260624060000):

| Entity | Bảng DB | Migration | Vai trò trong import | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|
| `InternalProduct` | `internal_product` | `V20260624020000__create_internal_product.sql` (ADR-017) | Import ghi N rows mới; `nature` default `GOODS`, `pricing_method` hardcode `PWA` | BR-CAT-PROD-001/010/019 | AC-6 | Unique `(tenant_id, code)` enforce ở cả service + DB |
| `InternalProductHistory` | `internal_product_history` | `V20260624060000__create_internal_product_history.sql` (ADR-017) | 1 audit row per imported product; `action='IMPORT'`, `changedBy=currentUser` | BR-CAT-CMN-001 | AC-6 | Ghi trong cùng transaction với INSERT |

### 5.2 Index / constraint changes

Không có index/constraint mới — tái dùng `UNIQUE(tenant_id, code)` trên `internal_product` đã khai báo tại ADR-017.

---

## 6. API contract delta (BE — REST)

### 6.1 New REST endpoints — `gf-inventory`

| # | Method | Path | Auth | Request body | Response body | Idempotency | AC ref |
|---|---|---|---|---|---|---|---|
| V2-20 | POST | `/api/v2/internal-products/verify-import` | JWT | `ImportVerifyRequestDto {items: ImportItemDto[], skipDuplicates: boolean}` | `ImportVerifyReportDto {summary: {total, valid, error}, errorRows: [{rowIndex, code, errors[]}]}` | safe (no state change) | AC-4, AC-5 |
| V2-21 | POST | `/api/v2/internal-products/import` | JWT | `ImportVerifyRequestDto` (same schema) | `ImportResultDto {importId: UUID, importedCount, failedCount, skippedCount, failedRows: [{rowIndex, code, errors[]}]}` | non-idempotent; transaction rollback on race | AC-6, AC-8 |
| NC-1 | GET | `/api/v2/internal-products/import-template` | JWT | — | xlsx bytes (Apache POI hoặc classpath resource) | safe | AC-2 |
| NC-2 | POST | `/api/v2/internal-products/import-errors-file` | JWT | `{failedRows: [{rowIndex, code, name?, errors[]}]}` | xlsx bytes (Apache POI) | safe (stateless generation) | AC-9 |

> **NC-1, NC-2**: V2-ID chưa confirm (PKG table truncated, xem NEED CONFIRMATION §3 AC-2 + AC-9).

**`ImportItemDto` schema (R14)**:

```json
{
  "code": "string (required)",
  "name": "string (required)",
  "mainUnitCode": "string (required, validated vs gf-erp-mdm directory=UNIT)",
  "nature": "GOODS|TOOL|SERVICE|OTHER (optional, default GOODS)",
  "materialGroupCode": "string? (optional, validated ACTIVE material_group)",
  "brand": "string? (optional, free-text VARCHAR(255), no catalog validation)",
  "originCode": "string? (optional, validated vs gf-erp-mdm directory=COUNTRY → ERR-INV-044 if invalid)",
  "productSpec": "string? (optional, text)",
  "technicalSpec": "string? (optional, text)"
}
```

> `pricingMethod` **KHÔNG có** trong schema (BR-CAT-PROD-017 v4 explicit exclude).

### 6.2 Modified REST endpoints

Không có endpoint hiện hữu bị modify.

### 6.3 Kafka topics

Không có Kafka event cho import operation (import là synchronous, kết quả trả inline qua HTTP).

### 6.4 Cross-boundary REST consumers

| Endpoint consumed | Boundary | Mục đích | When | Failure mode |
|---|---|---|---|---|
| gf-erp-mdm directory lookup API (directory=UNIT) | `gf-erp-mdm` | Validate `mainUnitCode` batch | Tại verify + import | 502 propagate lên client; partial validation fail |
| gf-erp-mdm directory lookup API (directory=COUNTRY) | `gf-erp-mdm` | Validate `originCode[]` batch | Tại verify + import | 502; per-row ERR-INV-044 cho origin invalid |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-CAT-PROD-IMPORT.md`) sẽ wrap V2-20 + V2-21 thành GraphQL mutations `verifyProductImport` + `importProducts`. BFF cũng phải enforce cap ≤500 ở resolver layer trước khi forward BE (ADR-018 — dual enforcement). GraphQL SDL là BFF tier territory.

---

## 7. File/module impact map (BE — Hexagonal)

> Tất cả path ⊆ `services/gf-inventory/**` (Critical Rule #1).

| Layer | Path glob | Change type | Estimated LoC | AC ref |
|---|---|---|---|---|
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/InternalProductImportController.java` | NEW | ~60 | AC-2, AC-4, AC-6, AC-9, AC-10 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/InternalProductImportService.java` | NEW | ~120 | AC-4, AC-5, AC-6, AC-8 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/InternalProductImportValidatorService.java` | NEW | ~80 | AC-5 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/ImportErrorFileService.java` | NEW | ~60 | AC-9 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/ImportItemDto.java` | NEW | ~30 | AC-4, AC-5 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/ImportVerifyRequestDto.java` | NEW | ~10 | AC-4 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/ImportVerifyReportDto.java` | NEW | ~25 | AC-4, AC-5 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/ImportResultDto.java` | NEW | ~20 | AC-6, AC-8 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/ImportErrorRowDto.java` | NEW | ~15 | AC-5, AC-9 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InternalProduct.java` | REUSE — no change | 0 | AC-6 |
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/InternalProductHistory.java` | REUSE — no change | 0 | AC-6 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InternalProductRepository.java` | MODIFY — additive: `findByCodeInAndTenantId()` for batch pre-check | ~10 | AC-5 |
| `db/migration` | _(không có migration mới — ADR-017 migrations đã planned)_ | — | 0 | — |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/InternalProductImportServiceTest.java` | NEW | ~200 | AC-4 through AC-8, AC-10 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/InternalProductImportControllerTest.java` | NEW | ~100 | AC-4, AC-6, AC-10 |

---

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Repository extension
    Entry: ADR-017 Flyway migrations green (internal_product + history tables exist)
    Exit: InternalProductRepository.findByCodeInAndTenantId() method + unit test pass
    └─► S2

S2  Validator Service (per-row logic + cap check)
    Entry: S1 + gf-erp-mdm directory API contract confirmed
    Exit: ≥8 unit test scenarios pass (code regex, enum invalid, duplicate, originCode ERR-INV-044,
          cap ERR-INV-041, skipDuplicates=true skip, mainUnitCode missing, materialGroupCode inactive)
    └─► S3

S3  Import Service (batch persist + history audit)
    Entry: S2
    Exit: integration test — valid batch persists N rows + N history rows in 1 tx;
          invalid rows in failedRows; race condition rollback test pass
    └─► S4

S4  Controller + ImportErrorFileService (Apache POI) + template endpoint
    Entry: S3 + NC-1/NC-2 endpoint paths confirmed
    Exit: contract tests V2-20 + V2-21 green; error xlsx generated with correct columns;
          template xlsx header row matches R14 schema
    └─► (hand-off BFF tier S5 — wrap V2-20 + V2-21 thành GraphQL mutations)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Extend repository | domain/repository | ADR-017 migrations deployed | findByCodeIn method test green | — |
| S2 | Validator service | app/service | S1 + erp-mdm API contract | ≥8 unit tests green | S1 |
| S3 | Import service + batch persist | app/service + domain | S2 | Integration test green | S2 |
| S4 | Controller + error file + template | adapter/controller | S3 + NC-1/NC-2 confirmed | Contract tests green | S3 |

---

## 9. Business Rules to enforce (BE — SSOT cho BR)

> BE là SSOT cho tất cả BR trong FEAT này. BFF/FE/Mobile chỉ secondary (UX hint).

| BR ID | Severity | Enforcement layer | Where | Touchpoint AC | Test point |
|---|---|---|---|---|---|
| `BR-CAT-PROD-001` | CORNERSTONE | service (batch pre-check) + DB UNIQUE | `InternalProductImportValidatorService` + constraint `(tenant_id, code)` | AC-5, AC-6 | `TC-BR-INVENTORY-CAT-PROD-001-import-*` |
| `BR-CAT-PROD-003` | NORMAL | service (regex per item) | `InternalProductImportValidatorService.validateCode()` | AC-5 | `TC-BR-INVENTORY-CAT-PROD-003-import-*` |
| `BR-CAT-PROD-010` | CORNERSTONE | service (hardcode default) | `InternalProductImportService` — `pricingMethod = PWA` không nhận từ input | AC-6 | `TC-BR-INVENTORY-CAT-PROD-010-import-*` |
| `BR-CAT-PROD-017 v4` | NORMAL | DTO (field absent) | `ImportItemDto` — không có field `pricingMethod` | AC-5, AC-6 | `TC-BR-INVENTORY-CAT-PROD-017-import-*` |
| `BR-CAT-PROD-019` | NORMAL | DTO validation | `@ValidEnum` trên `ImportItemDto.nature`; default `GOODS` khi absent | AC-5, AC-6 | `TC-BR-INVENTORY-CAT-PROD-019-import-*` |
| `BR-CAT-PROD-022` | CORNERSTONE | adapter (`@PreAuthorize`) | `InternalProductImportController` — tất cả method | AC-10 | `TC-BR-INVENTORY-CAT-PROD-022-import-*` |
| `BR-CAT-CMN-001` | NORMAL | service (post-persist, same tx) | `InternalProductImportService.logImportHistory()` | AC-6 | `TC-BR-INVENTORY-CMN-001-import-*` |
| `ADR-018 R28` | CORNERSTONE | service (cap guard — line 1) | `InternalProductImportService.validateCapOrThrow()` | AC-4, AC-6 | `TC-INV-IMPORT-CAP-ERR-INV-041-*` |

---

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | API contract | test-api | GET template → status 200, Content-Type xlsx, header row đúng R14 (8 cột, không có pricingMethod) |
| AC-4 | API contract + Unit | test-api | V2-20: 0 items (400), 1 valid, 500 valid (200 OK), 501 items (400 ERR-INV-041), mixed valid+invalid; dry-run không persist bất kỳ row nào |
| AC-5 | Unit (per-row validation) | test-api | ≥8 scenarios: code regex ERR-INV-006, duplicate ERR-INV-007, skipDuplicates=true skip, nature invalid ERR-INV-012, originCode invalid ERR-INV-044, mainUnitCode missing, materialGroupCode INACTIVE, pricingMethod field reject |
| AC-6 | Integration (batch + history) | test-api | gf-erp-mdm mock; verify N rows inserted + N history rows trong 1 tx; race condition → 409 rollback; skipDuplicates flow |
| AC-8 | API contract (response shape) | test-api | ImportResultDto đầy đủ fields: importedCount, failedCount, skippedCount, failedRows[] non-null |
| AC-9 | API contract (xlsx) | test-api | POST error-file với sample failedRows → status 200, Content-Type xlsx, bytes non-empty, columns đúng |
| AC-10 | Isolation (RBAC) | test-isolation | Role không được phép → 403 trên tất cả V2-20, V2-21, NC-1, NC-2 |

---

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W03/Product/features/bff/FEAT-CAT-PROD-IMPORT.md` | PENDING | BFF wrap V2-20 → mutation `verifyProductImport`; V2-21 → mutation `importProducts`. BFF enforce cap ≤500 ở resolver (ADR-018 dual enforcement) trước khi forward. |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-IMPORT.md` | PENDING | FE parse xlsx → JSON items[]; gọi verify mutation → hiển thị tổng quan AC-4; confirm → import mutation → màn kết quả AC-8; download error file AC-9. |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-IMPORT.md` | PENDING | Scope mobile cho import (file picker + xlsx parse trên mobile) cần confirm — xem NC-3. |

**Source ID consistency** (item 18): tất cả tier file dùng `source_feat_sha = 2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4`.

---

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) v10
- **Parent EP**: [`EP-INVENTORY-CATALOG.md`](../../epics/EP-INVENTORY-CATALOG.md)
- **BR refs**: `Product/business-rules/BR-GF-INVENTORY-CATALOG.md`
- **HLD**: `Architecture/hld/gf-inventory-HLD.md`
- **API contract**: `Architecture/api/gf-inventory-api.md` §4 (V2-20 line ~4800, V2-21 ~4801)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v3
- **PKG**: `Execution/work-packages/PKG-W03-inventory-catalog.md`
- **ADR-017**: Additive aggregate pattern — new entities gf-inventory; migration sequence V20260624*
- **ADR-018**: JSON body 2-step verify-then-commit import; cap 500; precedent gf-customer import

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec FEAT-CAT-PROD-IMPORT W03. Policy v2 tier-authoritative: verify-then-commit pattern ADR-018; JSON body; cap 500/request ERR-INV-041 (R28); originCode batch ERR-INV-044 (R28); pricingMethod excluded BR-CAT-PROD-017 v4; nature default GOODS; pricing_method default PWA locked; Apache POI error xlsx AC-9. 3 NEED CONFIRMATION: NC-1 template endpoint V2-ID, NC-2 error-file endpoint V2-ID, NC-3 RBAC role list BR-CAT-PROD-022. |
