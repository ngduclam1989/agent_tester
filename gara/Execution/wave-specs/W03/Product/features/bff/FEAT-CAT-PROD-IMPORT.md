---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-IMPORT.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-IMPORT"
source_feat_sha: "2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4"
generated_at: "2026-06-29T15:00:00+00:00"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W03"
parent_epic: "EP-INVENTORY-CATALOG"
parent_pkg: "PKG-W03-inventory-catalog"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-inventory"]
modifies: []
change_type: "new-capability"
graphql_ops: ["verifyImportInternalProducts", "importInternalProducts"]
paired_backend_feats: ["FEAT-CAT-PROD-IMPORT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-IMPORT"]
paired_mobile_feats: ["FEAT-CAT-PROD-IMPORT"]
authoring_inputs:
  kg_baseline_sha: "N/A (BFF tier)"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "NEED CONFIRMATION"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-IMPORT.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-IMPORT (BFF): Import danh mục mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-IMPORT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `verifyImportInternalProducts` (V2-M14) · `importInternalProducts` (V2-M15) |
| Cross-tier pair | BE: `FEAT-CAT-PROD-IMPORT` \| Web: `FEAT-CAT-PROD-IMPORT` \| Mobile: `FEAT-CAT-PROD-IMPORT` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail. BA/PO update source → cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-IMPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) |
| Source version | v10 |
| Source SHA | `2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4` |
| Generated at | 2026-06-29T14:36:41+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage hoặc kế toán cần nhập số lượng lớn mã sản phẩm nội bộ từ file dữ liệu có sẵn, thay vì tạo từng mã thủ công qua form. Feature cung cấp quy trình hai bước — kiểm tra dữ liệu trước (verify), xác nhận rồi mới ghi (commit) — đảm bảo danh mục tồn kho V2 không nhận dữ liệu lỗi. Kết quả trả về rõ ràng: số dòng thành công, số dòng lỗi kèm chi tiết, và file lỗi để tra cứu sau.

---

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose 2 mutations mới trong schema catalog: `verifyImportInternalProducts` (V2-M14) kiểm tra danh sách SP trước khi ghi, và `importInternalProducts` (V2-M15) thực hiện ghi hàng loạt.
- Pre-check `input.items.length ≤ 500` tại resolver của cả 2 mutations trước khi forward — vượt ngưỡng throw `ERR-INV-041` ngay tại BFF (defense-in-depth với BE per ADR-018, R28 canonical).
- Passthrough body `{items, skipDuplicates}` xuống gf-inventory REST endpoints tương ứng, propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` header.
- Map BE response (verify → `{summary, validRows, errorRows}` = `ImportInternalProductsReport`, import → `{importId, importedCount, failedCount, report}` = `ImportInternalProductsResult`) sang GraphQL response types (union `data.*`).
- Pass-through `ERR-INV-044` (per-row originCode không tồn tại, BR-CAT-PROD-023, R28) từ BE trong `errorRows[].errors` — KHÔNG suppress hay re-classify.
- Enforce RBAC auth guard: chỉ tenant user có quyền import mới gọi được cả 2 mutations.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Wizard + chọn file (UI-only, N/A at BFF)

#### AC-1 → N/A (FE-only wizard flow)

- Source AC này là UI navigation: FE mở màn hình wizard import. Không cần BFF expose contract gì mới.

#### AC-2 → N/A (static file download, FE-side)

- Source AC này là tải file mẫu Excel. Template là static resource do FE bundle hoặc serve — không cần GraphQL op từ BFF.

#### AC-3 → N/A (FE-side parsing)

- Source AC này là FE local action: user chọn file `.xlsx`, FE parse browser-side thành `items[]` array (ADR-018 "FE parse browser-side"). BFF không touch bước này.

### Cluster B — Kiểm tra dữ liệu import

#### AC-4 → BFF expose `verifyImportInternalProducts`, trả tổng quan report

- **Khi**: FE gửi mutation `verifyImportInternalProducts(input: ImportInternalProductsInput!)` sau khi parse file.
- **BFF phải**:
  1. Pre-check `input.items.length ≤ 500` — vượt → throw GraphQL error code `ERR-INV-041` ngay lập tức, KHÔNG forward xuống BE.
  2. Forward body `{items: input.items, skipDuplicates: input.skipDuplicates}` xuống `POST /api/v2/internal-products/verify-import` (gf-inventory) kèm auth headers.
  3. Map BE response sang `ImportInternalProductsReportResponse` (union → `ImportInternalProductsReportApiResponse.data: ImportInternalProductsReport`): populate `data.summary` (`total`/`valid`/`error`), `data.validRows`, `data.errorRows` (mỗi phần tử là `ImportRow`).
- **Downstream**: `POST /api/v2/internal-products/verify-import` (gf-inventory)
- **Output shape**: `ImportInternalProductsReportResponse!` (§5.1)
- **Failure mode**: `ERR-INV-041` khi items > 500 (BFF); BE errors 400/422/5xx → GraphQL error extension passthrough.
- **Ref**: op `verifyImportInternalProducts` (§6.1), resolver `src/resolvers/catalog/verifyImportInternalProducts.ts` (§6.2), paired BE FEAT-CAT-PROD-IMPORT §6.1 V2-20 (`POST /api/v2/internal-products/verify-import`; corrected per CR-20260630-01 P1.3 — V2-13 = SKU mapping per gf-inventory-api.md v24).

#### AC-5 → BFF trả `errorRows` chi tiết để FE đánh dấu từng dòng lỗi

- **Khi**: BE verify response chứa `errorRows` với các row-level validation failure (ví dụ: code trùng, originCode không tồn tại).
- **BFF phải**: map `errorRows[]` từ BE response sang `[ImportRow!]!` trong `data.errorRows` — mỗi `ImportRow` gồm `rowIndex` (1-based), `item` (`ImportInternalProductItemOutput`), `errors` (`[String!]!` — các thông báo/mã lỗi per-row). Pass-through `ERR-INV-044` (originCode invalid per-row, BR-CAT-PROD-023, R28) trong `errors[]` mà KHÔNG re-classify.
- **Downstream**: cùng `POST /api/v2/internal-products/verify-import` như AC-4 — error details per-row nằm trong response body.
- **Output shape**: `data.errorRows: [ImportRow!]!` trong `ImportInternalProductsReport` (union `ImportInternalProductsReportResponse`, §5.1).
- **Failure mode**: nếu BE trả top-level error (400/500) → BFF propagate as GraphQL error; KHÔNG partial-return `errorRows`.
- **Ref**: op `verifyImportInternalProducts` (§6.1), type `ImportRow` (§5.1).

### Cluster C — Xác nhận import + kết quả

#### AC-6 → BFF expose `importInternalProducts` với `skipDuplicates` support

- **Khi**: FE gửi mutation `importInternalProducts(input: ImportInternalProductsInput!)` sau khi user xem report (AC-4) và quyết định thực hiện import.
- **BFF phải**:
  1. Pre-check `input.items.length ≤ 500` — vượt → throw `ERR-INV-041` ngay tại BFF.
  2. Forward body `{items: input.items, skipDuplicates: input.skipDuplicates}` xuống `POST /api/v2/internal-products/import` (gf-inventory). Flag `skipDuplicates` truyền nguyên qua — BE xử lý bỏ qua hay báo lỗi code trùng (ERR-INV-007) tùy flag.
  3. Map BE response `{importId, importedCount, failedCount, report}` sang `ImportInternalProductsResultResponse` (union → `ImportInternalProductsResultApiResponse.data: ImportInternalProductsResult`).
- **Downstream**: `POST /api/v2/internal-products/import` (gf-inventory)
- **Output shape**: `ImportInternalProductsResultResponse!` (§5.1)
- **Failure mode**: `ERR-INV-041` (BFF pre-check); `ERR-INV-007` (code trùng khi `skipDuplicates=false`, BE → BFF pass-through); BE 5xx → GraphQL error.
- **Ref**: op `importInternalProducts` (§6.1), resolver `src/resolvers/catalog/importInternalProducts.ts` (§6.2), paired BE FEAT-CAT-PROD-IMPORT §6.1 V2-14.

#### AC-7 → N/A (FE navigation)

- Source AC này là "Quay lại" — FE routing action (wizard step back), không cần BFF contract mới.

#### AC-8 → BFF trả import result payload đủ cho FE render màn kết quả

- **Khi**: `importInternalProducts` trả response thành công từ BE.
- **BFF phải**: đảm bảo `data.importId`, `data.importedCount`, `data.failedCount` (và `data.report`) đủ cho FE render tổng kết. Không cần enrich thêm — BE response là source of truth.
- **Output shape**: `data: ImportInternalProductsResult` trong union `ImportInternalProductsResultResponse` (§5.1).
- **Ref**: cùng op `importInternalProducts` (§6.1) như AC-6.

### Cluster D — File lỗi + phân quyền

#### AC-9 → N/A (FE-side error file generation)

- Source AC này là "Tải file lỗi". FE xây dựng file xlsx/csv client-side từ `data.errorRows` đã nhận ở AC-5 — không cần BFF expose thêm op nào.

#### AC-10 → BFF enforce RBAC auth guard cho cả 2 mutations

- **Khi**: FE gọi bất kỳ mutation `verifyImportInternalProducts` hoặc `importInternalProducts`.
- **BFF phải**: auth guard kiểm tra JWT + tenantId trước khi vào resolver. Chỉ tenant user có permission import mới được tiếp tục. Thiếu auth → throw 401; thiếu permission → throw 403 — trước khi forward xuống BE.
- **Ref**: `src/auth/importInternalProductsGuard.ts` (§7), BR-CAT-PROD-020 secondary (primary tại BE).

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST.
- `tenantId` đọc từ JWT claim — KHÔNG chấp nhận `tenantId` do client truyền trong GraphQL args.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance

- Không có N+1 risk cho 2 mutations này — mỗi mutation là 1 REST call passthrough duy nhất.
- DataLoader KHÔNG cần setup cho import/verify path.
- Timeout downstream: batch 500 rows có thể cần nhiều thời gian xử lý. **BFF resolver timeout: 30s** (POI parser 500-row commit; resolved per CR-20260630-01 P2.3 — pattern align ADR-018 import operation bound, BFF default 60s rút gọn cho import-specific endpoint).

### 4.3 Security + data exposure

- KHÔNG log payload `items[]` trong resolver (dữ liệu product có thể lớn, chứa business data nhạy cảm).
- KHÔNG log `Authorization` / JWT / tenant secret trong bất kỳ log level nào.
- Tenant scope enforce via JWT claim — query filter downstream theo tenantId từ header, không từ GraphQL arg.

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` keep old.
- Breaking change → CR MAJOR.
- `ERR-INV-041` là canonical code cho BFF-level 500-row limit (R28) — KHÔNG dùng `ERR-INV-019` (legacy BE code) trong BFF error response.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Scenario | Source AC |
|---|---|---|---|
| `ERR-INV-019` | không phát sinh tại BFF | BE defensive check (legacy) — BFF đã intercept trước bằng `ERR-INV-041` | AC-4, AC-6 |
| `ERR-INV-044` | `ERR-INV-044` pass-through trong `errorRows` | Per-row originCode không tồn tại (BR-CAT-PROD-023, R28) — verify + import | AC-4, AC-5 |
| `ERR-INV-007` | `ERR-INV-007` pass-through | Mã code trùng khi `skipDuplicates=false` (import bước 2) | AC-6 |
| — | `ERR-INV-041` | BFF pre-check: `input.items.length > 500` (ADR-018, R28 canonical) | AC-4, AC-6 |
| 401 | GraphQL 401 | Auth/token invalid hoặc thiếu | AC-10 |
| 403 | GraphQL 403 | Tenant user thiếu permission import | AC-10 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`. Additive only — KHÔNG xóa/rename field hiện hành.

### 5.1 New types + mutations

```graphql
# --- Input types ---

input ImportInternalProductItem {
  code: String!
  name: String!
  mainUnitCode: String!
  nature: ProductNature              # reuse enum ProductNature { GOODS TOOL SERVICE OTHER } (module-level)
  materialGroupCode: String
  brand: String
  originCode: String
  productSpec: String
  technicalSpec: String
}

input ImportInternalProductsInput {
  items: [ImportInternalProductItem!]!
  skipDuplicates: Boolean
}

# --- Verify data types ---

# Output-side item type (input type không thể làm output field type → type riêng)
type ImportInternalProductItemOutput {
  code: String!
  name: String!
  mainUnitCode: String!
  nature: ProductNature
  materialGroupCode: String
  brand: String
  originCode: String
  productSpec: String
  technicalSpec: String
}

type ImportSummary {
  total: Int!
  valid: Int!
  error: Int!
}

type ImportRow {
  rowIndex: Int!
  item: ImportInternalProductItemOutput!
  errors: [String!]!          # per-row error message/code strings (vd ERR-INV-007, ERR-INV-044)
}

type ImportInternalProductsReport {
  summary: ImportSummary!
  validRows: [ImportRow!]!
  errorRows: [ImportRow!]!
}

# --- Import result data type ---

type ImportInternalProductsResult {
  importId: String!
  importedCount: Int!
  failedCount: Int!
  report: ImportInternalProductsReport!
}

# --- API response types + unions (auto-generated pattern: implements ApiResponse | ErrorResponse) ---

type ImportInternalProductsReportApiResponse implements ApiResponse {
  success: Boolean
  code: String
  message: String
  data: ImportInternalProductsReport
}
union ImportInternalProductsReportResponse = ImportInternalProductsReportApiResponse | ErrorResponse

type ImportInternalProductsResultApiResponse implements ApiResponse {
  success: Boolean
  code: String
  message: String
  data: ImportInternalProductsResult
}
union ImportInternalProductsResultResponse = ImportInternalProductsResultApiResponse | ErrorResponse

# --- Mutations ---

extend type Mutation {
  """V2-M14. Kiểm tra danh sách SP trước import. BFF defense: items.length > 500 → ERR-INV-041."""
  verifyImportInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsReportResponse!

  """V2-M15. Ghi danh sách SP vào hệ thống sau khi verify. BFF defense: items.length > 500 → ERR-INV-041."""
  importInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsResultResponse!
}
```

### 5.2 Modified types (additive)

Không có existing type nào cần modify cho feature này.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `verifyImportInternalProducts` | mutation | `input: ImportInternalProductsInput!` | `ImportInternalProductsReportResponse!` | JWT + tenantId | AC-4, AC-5 |
| `importInternalProducts` | mutation | `input: ImportInternalProductsInput!` | `ImportInternalProductsResultResponse!` | JWT + tenantId | AC-6, AC-8 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `verifyImportInternalProducts` | `src/resolvers/catalog/verifyImportInternalProducts.ts` | `FEAT-CAT-PROD-IMPORT` (BE §6.1 V2-20) | `POST /api/v2/internal-products/verify-import` | N/A (mutation) | AC-4, AC-5 |
| `importInternalProducts` | `src/resolvers/catalog/importInternalProducts.ts` | `FEAT-CAT-PROD-IMPORT` (BE §6.1 V2-21) | `POST /api/v2/internal-products/import` | N/A (mutation) | AC-6, AC-8 |

**BFF pre-check pattern — cả 2 resolvers phải implement trước khi gọi data source**:

```typescript
if (input.items.length > 500) {
  throw new GraphQLError('Vượt giới hạn 500 dòng/lần — vui lòng tách file', {
    extensions: { code: 'ERR-INV-041' }
  });
}
```

### 6.3 DataLoader / batching strategy

Không cần DataLoader cho cả 2 mutations — mỗi mutation là 1 REST passthrough call duy nhất, không có nested type resolution phát sinh N+1.

### 6.4 Cache strategy

| Operation | Cache hint | TTL | Notes |
|---|---|---|---|
| `verifyImportInternalProducts` | `@cacheControl(maxAge: 0)` | — | Mutation — no cache |
| `importInternalProducts` | `@cacheControl(maxAge: 0)` | — | Mutation side-effect — no cache |

### 6.5 Persisted query allowlist

NEED CONFIRMATION từ Architecture Authority: import mutations có payload lớn (tới 500 items), cần xác định có đưa vào persisted query allowlist hay cho phép ad-hoc trong nội bộ. Nếu add vào allowlist → hash tính sau khi SDL stable (S5.1 done).

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/catalog.graphql` | MODIFY (additive) | extend SDL — 2 input + 5 data + 2 apiResponse + 2 union types + 2 mutations | ~75 | AC-4, AC-6 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/verifyImportInternalProducts.ts` | NEW | resolver pattern: pre-check + passthrough | ~50 | AC-4, AC-5 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/catalog/importInternalProducts.ts` | NEW | resolver pattern: pre-check + passthrough | ~50 | AC-6, AC-8 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfInventoryDataSource.ts` | ADDITIVE | new methods `verifyImportProducts` + `importProducts` | ~40 | AC-4, AC-6 |
| `auth/` | `bffs/agg-garage-graph/src/auth/importInternalProductsGuard.ts` | NEW | guard pattern (nếu chưa có shared catalog guard) | ~20 | AC-10 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/catalog-import.test.ts` | NEW | Apollo test client | ~100 | AC-4, AC-5, AC-6, AC-10 |

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 depends on BE S4 — `POST /api/v2/internal-products/verify-import` và `POST /api/v2/internal-products/import` phải stable trước khi wire resolver.

```
(← BE tier S4: verify-import + import endpoints green; ERR-INV-041/044 codes confirmed)

S5  BFF schema + resolver wire
    Entry: BE FEAT-CAT-PROD-IMPORT §6 REST endpoints stable
    Exit: BFF contract test green (2 mutations pass N+1 check + auth check)
    └─► (hand-off FE/Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | SDL additive (types + mutations) | `src/schema/catalog.graphql` | BE endpoints spec stable | SDL compiles, no breaking change | BE FEAT S4 |
| S5.2 | DataSource methods | `GfInventoryDataSource.ts` | S5.1 | Methods gọi đúng REST path, propagate headers | S5.1 |
| S5.3 | Resolvers (pre-check + DS call) | `src/resolvers/catalog/` | S5.2 | Pre-check throws ERR-INV-041 khi items > 500 | S5.2 |
| S5.4 | Auth guard wire | `src/auth/importInternalProductsGuard.ts` | S5.3 | Unauthorized calls rejected 401/403 | S5.3 |
| S5.5 | Integration tests | `tests/integration/catalog-import.test.ts` | S5.4 | All cases green | S5.4 |

## 9. Business Rules enforced (BFF — secondary)

| BR ID | Severity | Enforcement at BFF | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| ADR-018 row cap | CORNERSTONE | Pre-check `items.length > 500` → throw `ERR-INV-041` | `resolvers/catalog/verifyImportInternalProducts.ts`, `resolvers/catalog/importInternalProducts.ts` | AC-4, AC-6 | BFF defense-in-depth; BE cũng có defensive check riêng (ERR-INV-019 legacy) |
| Critical Rule #4 (tenant isolation) | CORNERSTONE | tenantId từ JWT claim only — KHÔNG trust client-supplied arg | mọi resolver | AC-10 | Tenant scope từ header, không từ GraphQL input |
| BR-CAT-PROD-020 | NORMAL | Pass-through (primary enforce ở BE) | — | AC-4, AC-6 | 500-row limit BA BR proposal (BA review post-batch) |
| BR-CAT-PROD-023 | NORMAL | Pass-through `ERR-INV-044` trong `errorRows` (KHÔNG re-classify) | data source response mapping | AC-5 | Per-row originCode invalid; R28 canonical code |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-PROD-IMPORT.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-4 | BFF integration (resolver → mock BE) | test-api | Mock BE verify-import; assert request shape gửi xuống; assert ERR-INV-041 khi `items.length = 501` |
| AC-5 | BFF integration (error row mapping) | test-api | Mock BE trả `errorRows` với `ERR-INV-044`; assert pass-through intact trong `data.errorRows` |
| AC-6 | BFF integration (resolver → mock BE) | test-api | Mock BE import; assert `skipDuplicates` forwarded; assert ERR-INV-041 khi `items.length > 500` |
| AC-8 | BFF integration (result shape) | test-api | Assert `data.importId`, `data.importedCount`, `data.failedCount` present trong payload |
| AC-10 | BFF auth (RBAC) | test-isolation | Gọi mutations không có auth → 401; auth nhưng không có permission → 403 |
| — | BFF contract (SDL snapshot) | test-api | Snapshot SDL delta sau S5.1; ensure no breaking change |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-IMPORT.md` | DRAFT | Downstream REST `POST /api/v2/internal-products/verify-import` + `POST /api/v2/internal-products/import` — BFF resolver wrap (read-only ref) |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-IMPORT.md` | DRAFT | Consume `verifyImportInternalProducts` + `importInternalProducts` từ §6.1 (read-only ref) |
| Mobile | `Execution/wave-specs/W03/Product/features/mobile/FEAT-CAT-PROD-IMPORT.md` | DRAFT | Consume cùng 2 mutations từ §6.1 (read-only ref) |

**Source ID consistency** (reviewer item #18): `source_feat_sha` = `2b1f55298f29c285d3c31615e9af8d488dc6539fd70956a95c1560ccd413cba4` — phải identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-IMPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-IMPORT.md) v10
- **Paired BE**: [`features/be/FEAT-CAT-PROD-IMPORT.md`](../be/FEAT-CAT-PROD-IMPORT.md)
- **HLD BFF**: [`Architecture/hld/agg-garage-graph-HLD.md`](../../../../../Architecture/hld/agg-garage-graph-HLD.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)
- **ADR-018**: `Architecture/decisions/ADR-018.md` — 2-step import JSON-body pattern, 500-row cap, BFF enforcement
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho FEAT-CAT-PROD-IMPORT W03. Policy v2 tier-authoritative. §3 cover 10/10 source ACs (3 N/A UI-only, 2 N/A FE-side, 5 BFF-active). BFF defense `ERR-INV-041` (items > 500, ADR-018 R28 canonical); pass-through `ERR-INV-044` (per-row originCode, BR-CAT-PROD-023). 2 mutations V2-M14/V2-M15. NEED CONFIRMATION (×2): downstream timeout value, persisted query allowlist decision. |
| 2026-07-01 | 2 | main agent (quannn) | Đối chiếu code thực tế agg-garage-graph (audit 2026-07-01) — sửa §5.1 SDL + các reference §2/§3/§6/§7 cho khớp code deploy: (1) input type `ImportInternalProductItemInput` → `ImportInternalProductItem`; (2) field `mainUomCode` → `mainUnitCode`; (3) enum `InternalProductNature` → `ProductNature`; (4) `skipDuplicates: Boolean!` → `Boolean` (nullable); (5) thêm output type `ImportInternalProductItemOutput` (input type không thể làm output field — `ImportRow.item` dùng type này); (6) thay `ImportRowErrorItem`/`ImportVerifyReportData` bằng `ImportSummary` + `ImportRow` (rowIndex/item/errors[String!]) + `ImportInternalProductsReport` (summary/validRows/errorRows); (7) verify response từ flat object `ImportInternalProductsReportResponse{success,data}` → union `ImportInternalProductsReportResponse = ImportInternalProductsReportApiResponse | ErrorResponse` (data ở `data.*`); (8) import result `ImportResultData`/`ImportInternalProductsPayload` → `ImportInternalProductsResult` (thêm field `report`) + union `ImportInternalProductsResultResponse`; (9) mutation `importInternalProducts` return `ImportInternalProductsPayload!` → `ImportInternalProductsResultResponse!`. Lý do: audit hậu-DEV, code là ground truth, doc lệch. |
