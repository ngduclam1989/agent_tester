---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-CAT-PROD-EXPORT.md"
source_version: 8
source: "gen-execution-spec"
source_feat_id: "FEAT-CAT-PROD-EXPORT"
source_feat_sha: "4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03"
generated_at: "2026-06-29T00:00:00Z"
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
graphql_ops: ["exportInternalProducts"]
paired_backend_feats: ["FEAT-CAT-PROD-EXPORT"]
paired_fe_web_feats: ["FEAT-CAT-PROD-EXPORT"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "N/A (BE tier only)"
  pkg_ref: "PKG-W03-inventory-catalog"
  fanout_map_sha: "N/A"
  template_sha: "671ef5...01ba"
  bundle_path: "/tmp/exec-spec-bundles/W03/FEAT-CAT-PROD-EXPORT.bff.md"
  bundle_generated_at: "2026-06-29T14:36:41+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-01"
---

# FEAT-CAT-PROD-EXPORT (BFF): Xuất danh mục mã sản phẩm nội bộ

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-CAT-PROD-EXPORT` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-CATALOG`](../../epics/EP-INVENTORY-CATALOG.md) |
| Wave | W03 |
| Status | DRAFT |
| GraphQL ops | `exportInternalProducts` (Query) |
| Cross-tier pair | BE: `FEAT-CAT-PROD-EXPORT` \| Web: `FEAT-CAT-PROD-EXPORT` \| Mobile: N/A |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-CAT-PROD-EXPORT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) |
| Source version | v8 |
| Source SHA | `4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03` |
| Generated at | 2026-06-29T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần xuất danh sách mã sản phẩm nội bộ ra file Excel để tra cứu ngoài hệ thống hoặc chuẩn bị dữ liệu tái import lần sau. Feature nằm ở cuối flow danh mục vật tư W03: sau khi thiết lập và lọc mã sản phẩm nội bộ, người dùng có thể export kết quả bộ lọc hiện tại thành file tải về ngay. File xuất ra có cấu trúc 9 cột đồng nhất với template import, đảm bảo dữ liệu có thể tái sử dụng mà không cần chuyển đổi thêm.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose GraphQL query `exportInternalProducts(filter: InternalProductSearchInput): ExportFileUrlResponse!` thuộc module `inventory-catalog-v2`.
- GraphQL resolver (passthrough kiểu "issue signed URL"): ký JWT download token (HS256, TTL 60 giây, single-use, claims: `{tenantId, branchId, filter, exp}` — snapshot `X-Tenant-Id` + `X-Branch-Id` tại thời điểm issue) và trả `downloadUrl` trỏ tới BFF reverse-proxy endpoint; **không** gọi trực tiếp V2-22 trong resolver. Response resolver: `success: true, code: "EXPORT_URL_ISSUED"`.
- BFF reverse-proxy REST endpoint (`GET ${CONTEXT_PATH}/api/v2/internal-products/export/<token>` — token là path segment) xác minh token (chữ ký + exp + single-use) → forward `POST /api/v2/internal-products/export` sang gf-inventory với scope từ snapshot trong token → stream binary `.xlsx` response về client.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` trong mọi call xuống gf-inventory.
- Pass-through lỗi `ERR-INV-045` từ gf-inventory (row cap > 1.000): middleware trả HTTP 400 JSON `{code: "ERR-INV-045", message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"}` để FE hiển thị DIALOG.

## 3. Hành vi cần triển khai (BFF behaviour map)

> Mỗi source AC-ID → 1 BFF behaviour statement. Không copy text AC từ source.
> Coverage gate: 5 AC-IDs phải xuất hiện ở §3 hoặc §4.

### Cluster A — Export flow (signed-URL proxy)

#### AC-1 → BFF phát hành signed download URL theo bộ lọc

- **Khi**: FE-web gửi GraphQL query `exportInternalProducts(filter: InternalProductSearchInput)` với filter hiện tại (keyword / status / nature / materialGroupId).
- **BFF phải**: Resolver trích xuất `tenantId` + `branchId` từ JWT context (KHÔNG từ args), ký JWT token `{tenantId, branchId, filter: {keyword, status, nature, materialGroupId}, iat, exp: now+60}` (snapshot tenant/branch lúc issue) bằng `EXPORT_TOKEN_SECRET` (env var), trả union member `ExportFileUrlApiResponse {success: true, code: "EXPORT_URL_ISSUED", message, data: {downloadUrl: "<bff-base-url>${CONTEXT_PATH}/api/v2/internal-products/export/<signed_jwt>"}}`.
- **Downstream**: không gọi gf-inventory trong resolver step này; BE chỉ được gọi khi FE GET `downloadUrl` (reverse-proxy).
- **Output shape**: `ExportFileUrlApiResponse.data.downloadUrl: String!` (BFF reverse-proxy URL, không phải presigned S3).
- **Failure mode**: token signing failure (bad secret config) → GraphQL error `INTERNAL_ERROR`.
- **Ref**: op `exportInternalProducts` (§6.1), resolver `src/resolvers/inventory/catalog-v2/exportInternalProducts.ts` (§6.2), paired BE FEAT-CAT-PROD-EXPORT §6.1 (V2-22).

#### AC-3 → BFF forward bộ lọc mặc định khi không có filter

- **Khi**: FE gọi `exportInternalProducts(filter: {})` hoặc omit toàn bộ filter fields.
- **BFF phải**: Resolver ký token với `filter` nguyên trạng (có thể rỗng/null các field). Middleware forward body `{}` hoặc body chỉ chứa những field được truyền vào.
- **Downstream**: V2-22 nhận body thiếu `status` → BE default `status=ACTIVE` (BR-CAT-PROD-007, backend-authoritative). BFF **không** inject default value.
- **Output shape**: như AC-1.
- **Failure mode**: không có failure BFF-specific; mọi validation do BE thực hiện.
- **Ref**: op `exportInternalProducts` (§6.1), V2-22 body field `status` default `ACTIVE` tại BE spec §6.1.

#### AC-4 → BFF enforce tenant scope qua signed token

- **Khi**: FE GET `downloadUrl` → BFF reverse-proxy middleware nhận request.
- **BFF phải**: Verify JWT token: (1) chữ ký HMAC HS256 hợp lệ; (2) `exp` chưa quá 60s; (3) token chưa được dùng (single-use). Scope (tenant/branch) lấy từ `tenantId` + `branchId` snapshot **trong token claim** (lúc issue) — KHÔNG re-derive từ `Authorization` header hiện tại, nhờ đó user đổi tenant/branch trong 60s TTL vẫn tải đúng file (BUG-W03-009). Bất kỳ check nào fail → HTTP 403 Forbidden; không gọi gf-inventory.
- **Downstream**: sau khi token hợp lệ, call `POST /api/v2/internal-products/export` với `X-Tenant-Id` + `X-Branch-Id` = snapshot từ token claim (KHÔNG từ request hiện tại), `Authorization` + `x-request-id` propagated; body = `{keyword, status, nature, materialGroupId}` extract từ token claim.
- **Output shape**: binary stream `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- **Failure mode**: token expired → HTTP 403 + JSON `{code: "EXPORT_TOKEN_EXPIRED", message: "Link tải đã hết hạn. Vui lòng tạo lại link xuất."}`.
- **Ref**: middleware `src/middleware/export-internal-products.middleware.ts` (§7), signed-token util `src/utils/signed-export-token.ts` (§7).

#### AC-5 → BFF pass-through ERR-INV-045 (row cap > 1.000)

- **Khi**: gf-inventory trả `400 ERR-INV-045` trong middleware proxy call.
- **BFF phải**: Middleware trả HTTP 400 với JSON body `{code: "ERR-INV-045", message: "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại"}`. `Content-Type: application/json`. FE-web detect JSON response thay vì blob → show DIALOG (xem FEAT-CAT-PROD-EXPORT fe-web spec §3 AC-5).
- **Downstream**: gf-inventory V2-22 defensive cap trả 400 trước khi generate file.
- **Failure mode**: nếu downstream trả error code khác (500/502) → middleware trả HTTP 502 JSON `{code: "EXPORT_DOWNSTREAM_ERROR"}`.
- **Ref**: `ERR-INV-045` (gf-inventory-api.md §3a.3), BR-CAT-PROD-024.

### Cluster B — Cột file (BE primary)

#### AC-2 → N/A (BE primary)

Source AC-2 quy định 9 cột canonical trong file .xlsx (`code, name, mainUnitCode, nature, materialGroupCode, brand, originCode, productSpec, technicalSpec`). BFF chỉ stream binary từ V2-22 — không transform, không inspect content. Xem `features/be/FEAT-CAT-PROD-EXPORT.md §3 AC-2` cho enforcement.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống gf-inventory.
- Middleware cũng propagate headers khi forward V2-22.
- `tenantId` + `branchId` resolve từ JWT context trong resolver; không accept từ GraphQL args hoặc từ client URL param.
- Middleware dùng `tenantId` + `branchId` từ token claim (snapshot lúc issue) làm scope downstream; **KHÔNG** override bằng tenant/branch của request GET hiện tại — cho phép user switch tenant/branch trong 60s TTL mà vẫn tải đúng file (BUG-W03-009). Vẫn require `Authorization` header hợp lệ để authenticate request.

### 4.2 Performance + stream

- GraphQL resolver không block: chỉ ký token và return URL — latency < 5ms.
- BFF middleware stream binary: KHÔNG buffer toàn bộ response vào memory. Pipe `response.data` (Axios responseType `stream`) trực tiếp vào Express response. Apache POI ở gf-inventory generate .xlsx có thể ~1-3MB cho 1.000 rows — buffer sẽ OOM dưới load.
- Không áp DataLoader/batching (single-call passthrough, không N+1 risk).
- Timeout middleware → gf-inventory: 30 giây (p95 latency target ≤ 10s ở BE; margin cho network).

### 4.3 Security + data exposure

- KHÔNG log filter payload hoặc token value trong resolver/middleware (có thể chứa business data).
- Token claim KHÔNG chứa PII; chỉ `{tenantId, branchId, filter: {keyword, status, nature, materialGroupId}, iat, exp}`.
- `EXPORT_TOKEN_SECRET` phải là env var (≥ 256-bit entropy); KHÔNG hardcode trong source.
- CORS: middleware endpoint KHÔNG open `origin: "*"`; chỉ cho phép origin đã whitelist.
- Signed token là single-use (dùng 1 lần — consumed sau lần GET đầu tiên) + TTL 60s.

### 4.4 Contract stability

- Schema additive only: `exportInternalProducts` query là NEW (không breaking).
- `ExportFileUrlResponse` type reuse baseline — không thay đổi shape (additive compatible).
- `InternalProductSearchInput` type: reuse từ `FEAT-CAT-PROD-LIST` BFF spec; nếu type chưa tồn tại trong schema tại thời điểm impl → FEAT-CAT-PROD-LIST BFF phải được merge trước (S5 dependency).

### 4.5 Error code mapping

| Downstream error (gf-inventory) | BFF middleware response | Display (FE) | Source AC |
|---|---|---|---|
| `400 ERR-INV-045` (row cap) | HTTP 400 JSON `{code: "ERR-INV-045", message: "Kết quả vượt 1.000 dòng..."}` | DIALOG | AC-5 |
| `401 Unauthorized` | HTTP 403 `{code: "UNAUTHENTICATED_ERROR"}` | — | AC-4 |
| `403 Forbidden` (cross-tenant) | HTTP 403 `{code: "FORBIDDEN_ERROR"}` | — | AC-4 |
| `5xx` downstream | HTTP 502 `{code: "EXPORT_DOWNSTREAM_ERROR"}` | — | AC-1 |
| Token expired | HTTP 403 `{code: "EXPORT_TOKEN_EXPIRED", message: "..."}` | — | AC-4 |
| Token invalid sig | HTTP 403 `{code: "FORBIDDEN_ERROR"}` | — | AC-4 |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New operations

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `exportInternalProducts` (trong Query root) | Query field | `filter: InternalProductSearchInput` → `ExportFileUrlResponse!` | NO (new) | AC-1, AC-3, AC-4 |

### 5.2 Modified types (additive)

Không thay đổi type existing. `ExportFileUrlResponse` và `InternalProductSearchInput` đã tồn tại trong schema:

| Type | Sử dụng tại | Ghi chú |
|---|---|---|
| `ExportFileUrlResponse` | Reuse từ `exportSettlementToPdf` (baseline) | UNION `= ExportFileUrlApiResponse \| ErrorResponse`; `ExportFileUrlApiResponse implements ApiResponse {success, code, message, data: ExportFileUrlData}`; `ExportFileUrlData {downloadUrl: String!}` — không thay đổi |
| `InternalProductSearchInput` | Reuse từ FEAT-CAT-PROD-LIST BFF spec (W03) | `page/size/sort` fields trong input bị resolver bỏ qua khi ký token export |

> **NEED CONFIRMATION**: Nếu `InternalProductSearchInput` chưa được định nghĩa trong schema trước khi FEAT-CAT-PROD-EXPORT được merge (FEAT-CAT-PROD-LIST BFF chưa xong), DEV cần define inline trong `inventory/catalog-v2.graphql`. Confirm merge order với Delivery Authority.

### 5.3 SDL fragment (inventory-catalog-v2.graphql — additive)

```graphql
# Thêm vào Query type trong inventory/catalog-v2.graphql
extend type Query {
  exportInternalProducts(filter: InternalProductSearchInput): ExportFileUrlResponse!
}
```

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `exportInternalProducts` | Query | `filter: InternalProductSearchInput` | `ExportFileUrlResponse!` | JWT + tenantId (context-resolved) | AC-1, AC-3, AC-4 |

**Response shape**:
```json
{
  "data": {
    "exportInternalProducts": {
      "__typename": "ExportFileUrlApiResponse",
      "success": true,
      "code": "EXPORT_URL_ISSUED",
      "message": "Đường dẫn tải file đã được tạo (TTL 60s, dùng 1 lần). FE GET URL này để stream binary.",
      "data": {
        "downloadUrl": "https://<bff-host>${CONTEXT_PATH}/api/v2/internal-products/export/<signed_token_60s>"
      }
    }
  }
}
```

**Error response** (GraphQL errors array — resolver-level failure only):
```json
{
  "errors": [
    {
      "message": "Internal server error",
      "extensions": { "code": "INTERNAL_ERROR" }
    }
  ]
}
```

> Lỗi `ERR-INV-045` (row cap) KHÔNG xuất hiện ở GraphQL errors layer — chỉ phát sinh khi FE fetch `downloadUrl` → BFF middleware trả HTTP 400 JSON (xem §4.5). FE phải handle cả 2 path: success (blob) và error (JSON) từ middleware endpoint.

### 6.2 Resolver mapping

| Operation | Resolver path | Downstream gf-inventory FEAT | Downstream BE endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `exportInternalProducts` | `src/resolvers/inventory/catalog-v2/exportInternalProducts.ts` | `FEAT-CAT-PROD-EXPORT` (BE §6.1 V2-22) | (token ký thôi — không call trực tiếp) | — | AC-1, AC-3, AC-4 |
| BFF middleware proxy | `src/middleware/export-internal-products.middleware.ts` | `FEAT-CAT-PROD-EXPORT` (BE §6.1 V2-22) | `POST /api/v2/internal-products/export` | — | AC-1, AC-4, AC-5 |

**Resolver pseudocode** (`exportInternalProducts.ts`):
```typescript
async exportInternalProducts(_parent, { filter }, context) {
  const { tenantId, branchId } = context; // snapshot từ JWT lúc issue
  const token = signExportToken({ tenantId, branchId, filter }, process.env.EXPORT_TOKEN_SECRET, 60);
  const downloadUrl = `${process.env.BFF_BASE_URL}${process.env.CONTEXT_PATH}/api/v2/internal-products/export/${token}`;
  return {
    __typename: 'ExportFileUrlApiResponse',
    success: true,
    code: 'EXPORT_URL_ISSUED',
    message: 'Đường dẫn tải file đã được tạo (TTL 60s, dùng 1 lần). FE GET URL này để stream binary.',
    data: { downloadUrl },
  };
}
```

**Middleware pseudocode** (`export-internal-products.middleware.ts`):
```typescript
async (req, res) => {
  const token = verifyExportToken(req.params.token, secret); // throws on invalid/expired/consumed (single-use)
  const beResponse = await gfInventoryClient.post('/api/v2/internal-products/export',
    { keyword: token.filter.keyword, status: token.filter.status,
      nature: token.filter.nature, materialGroupId: token.filter.materialGroupId },
    { headers: {
        ...propagatedHeaders(req),
        'X-Tenant-Id': token.tenantId, // snapshot lúc issue, KHÔNG lấy từ request hiện tại
        'X-Branch-Id': token.branchId,
      }, responseType: 'stream' }
  );
  // forward headers + pipe
  res.setHeader('Content-Type', beResponse.headers['content-type']);
  res.setHeader('Content-Disposition', beResponse.headers['content-disposition']);
  beResponse.data.pipe(res);
}
```

### 6.3 DataLoader / batching strategy

Không áp dụng. Operation là single-call passthrough — không có N+1 risk.

### 6.4 Cache strategy

| Operation | Cache hint | Ghi chú |
|---|---|---|
| `exportInternalProducts` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | Mutation-like semantic — không cache. Mỗi call sinh token mới. |

### 6.5 BFF middleware REST endpoint

| Path | Method | Auth | Purpose |
|---|---|---|---|
| `${CONTEXT_PATH}/api/v2/internal-products/export/:token` | GET | `Authorization` header (JWT) + `token` path segment (signed JWT, single-use) | Reverse-proxy V2-22 binary stream về FE |

> Endpoint này là một trong các "REST endpoints cho binary download/export" được BFF đã expose (§1 graphql spec note "11 REST endpoints + health/metrics"). Đây là endpoint số 12 theo pattern tương tự.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/inventory/catalog-v2.graphql` | MODIFY (additive — extend Query) | extend SDL pattern | ~5 | AC-1 |
| `resolvers/` | `src/resolvers/inventory/catalog-v2/exportInternalProducts.ts` | NEW | resolver pattern | ~30 | AC-1, AC-3, AC-4 |
| `middleware/` | `src/middleware/export-internal-products.middleware.ts` | NEW | binary proxy middleware pattern | ~70 | AC-1, AC-4, AC-5 |
| `data-sources/` | `src/data-sources/GfInventoryV2DataSource.ts` | ADDITIVE | new Axios call method | ~25 | AC-1 |
| `utils/` | `src/utils/signed-export-token.ts` | NEW | JWT HS256 sign/verify utility | ~40 | AC-4 |
| `routes/` | `src/routes/export.routes.ts` | MODIFY hoặc NEW | register middleware endpoint | ~10 | AC-4 |
| `tests/integration` | `tests/integration/inventory/export-internal-products.test.ts` | NEW | apollo test client + axios mock | ~80 | AC-1, AC-5 |
| `tests/contract` | `tests/contract/inventory-catalog-v2-contract.test.ts` | ADDITIVE | schema contract snapshot | ~20 | (schema) |

> **NEED CONFIRMATION**: Confirm path `src/schema/inventory/catalog-v2.graphql` — nếu file chưa tồn tại (FEAT-CAT-PROD-LIST BFF chưa tạo), resolver DEV phải tạo mới và import vào schema index. Delivery Authority confirm merge order.

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: V2-22 integration green + ERR-INV-045 verified)

S5  BFF schema + resolver + middleware wire
    Entry: BE FEAT-CAT-PROD-EXPORT §6 (V2-22) stable + InternalProductSearchInput SDL từ FEAT-CAT-PROD-LIST BFF
    Exit: BFF contract test green + middleware stream test pass + ERR-INV-045 pass-through verified
    └─► (hand-off FE-web S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Tạo `signed-export-token.ts` util | utils | — | sign/verify unit test green | — |
| S5.2 | Tạo resolver `exportInternalProducts.ts` | resolvers | S5.1 + SDL type available | resolver unit test green | S5.1 |
| S5.3 | Tạo middleware `export-internal-products.middleware.ts` | middleware | S5.1 + V2-22 stable | stream integration test green + ERR-INV-045 mock verify | S5.1, BE S4 |
| S5.4 | Extend SDL `catalog-v2.graphql` + register route | schema + routes | S5.2 + S5.3 | schema snapshot update, BFF contract test green | S5.2, S5.3 |

## 9. Business Rules enforced (BFF — secondary)

> BFF KHÔNG enforce business validation primary.

| BR ID | Severity | Enforcement at BFF | Where | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-CAT-PROD-018` | NORMAL | pass-through (primary ở BE V2-22) | middleware | AC-1, AC-2 | 9 cột canonical do BE generate; BFF chỉ stream |
| `BR-CAT-PROD-024` | CORNERSTONE | pass-through ERR-INV-045 + error response formatting | middleware `export-internal-products.middleware.ts` | AC-5 | 1.000 rows cap enforce tại BE; BFF expose lỗi dạng HTTP 400 JSON cho FE |
| `BR-CAT-PROD-007` | NORMAL | không inject — BE authoritative default | resolver (không làm gì) | AC-3 | status default ACTIVE khi omit = BE behavior |
| Tenant isolation | CORNERSTONE | signed token claim `tenantId` match JWT; middleware double-check | resolver + middleware | AC-4 | cross-tenant attempt → HTTP 403 |

> **Primary BR enforcement** = BE tier. Xem `features/be/FEAT-CAT-PROD-EXPORT.md §9`.

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (resolver → signed URL) | test-api | mock `EXPORT_TOKEN_SECRET`, verify `downloadUrl` format |
| AC-3 | BFF integration (empty filter → token with null fields) | test-api | BE mock returns 200; verify token claim `filter.status` is null (BE defaults) |
| AC-4 | BFF auth (middleware token verify) | test-isolation | test expired token → 403; mismatched tenantId → 403; valid token → 200 |
| AC-5 | BFF middleware error pass-through | test-api | mock gf-inventory 400 ERR-INV-045 → verify middleware returns 400 JSON `{code: "ERR-INV-045"}` |
| — | Binary stream integrity | test-api | mock gf-inventory 200 binary blob → verify pipe-through không corrupt |
| — | BFF schema contract | test-api | snapshot `exportInternalProducts` SDL + return type |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W03/Product/features/be/FEAT-CAT-PROD-EXPORT.md` | DRAFT (pending) | V2-22 `POST /api/v2/internal-products/export` — BFF middleware consumer. BFF S5.3 depends on BE S4 green. |
| FE Web | `Execution/wave-specs/W03/Product/features/fe-web/FEAT-CAT-PROD-EXPORT.md` | DRAFT (pending) | Consume `exportInternalProducts` query + handle `downloadUrl` (blob vs JSON error detection) |
| Mobile | N/A | — | Mobile scope excluded per UX-FLOW-INVENTORY-CATALOG.md §2 "Garage Care (Web GMS) only"; gf-inventory-api.md §3a.4 note mobile exclusion |

**Source ID consistency** (item #18): `source_feat_sha` `4d35cccec7e195db27778bc08ed6268365e192fa76d21838cea8eec6f4befc03` PHẢI identical với BE + FE-web FEAT-CAT-PROD-EXPORT files.

**NEED CONFIRMATION** (merge order): FEAT-CAT-PROD-LIST BFF spec phải được merged trước FEAT-CAT-PROD-EXPORT BFF để `InternalProductSearchInput` và `catalog-v2.graphql` tồn tại. Nếu parallel merge không đảm bảo thứ tự, DEV phải define `InternalProductSearchInput` inline trong `catalog-v2.graphql` cho export và sau đó dedup với LIST spec khi merge.

## 12. References

- **Source**: [`Product/features/FEAT-CAT-PROD-EXPORT.md`](../../../../../Product/features/FEAT-CAT-PROD-EXPORT.md) v8
- **Paired BE**: [`features/be/FEAT-CAT-PROD-EXPORT.md`](../be/FEAT-CAT-PROD-EXPORT.md)
- **Paired FE-web**: [`features/fe-web/FEAT-CAT-PROD-EXPORT.md`](../fe-web/FEAT-CAT-PROD-EXPORT.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3d (V2-Q7 `exportInternalProducts`)
- **BE REST contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3a.2 V2-22
- **Error codes**: [`Product/error-code/ERROR-CODE-REGISTRY.md`](../../../../../Product/error-code/ERROR-CODE-REGISTRY.md) — `ERR-INV-045` (line 143)
- **BR**: [`Product/business-rules/BR-GF-INVENTORY-CATALOG.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) — BR-CAT-PROD-018, BR-CAT-PROD-024
- **ADR-017**: [`Architecture/decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md`](../../../../../Architecture/decisions/ADR-017-inventory-v2-catalog-additive-aggregates.md)
- **PKG**: [`work-packages/PKG-W03-inventory-catalog.md`](../../../../work-packages/PKG-W03-inventory-catalog.md)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-01 | 2 | main agent (audit) | Đối chiếu code thực tế agg-garage-graph (audit 2026-07-01), sửa doc cho khớp code đã deploy: (1) `ExportFileUrlData.downloadUrl` `String` → `String!` (nullability); (2) `ExportFileUrlResponse` là UNION `ExportFileUrlApiResponse \| ErrorResponse` với `success/code/message/data` + success code `EXPORT_URL_ISSUED` (trước đó mô tả thành object `{data:{downloadUrl}}`); (3) downloadUrl path `${CONTEXT_PATH}/api/v2/internal-products/export/<token>` (token là path segment, reverse-proxy) thay cho `/api/export/internal-products?token=` (query param); (4) token claim thêm `branchId` + snapshot tenant/branch lúc issue; scope downstream lấy từ token claim, KHÔNG re-derive từ Authorization hiện tại (BUG-W03-009) — thay cho model reject-on-tenant-switch cũ; (5) token single-use (dùng 1 lần) thay cho "one-time-use-like không revocation". §2/§3(AC-1,AC-4)/§4.1/§4.3/§5.2/§6.1/§6.2/§6.5 updated. |
| 2026-06-29 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-CAT-PROD-EXPORT` W03. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (3 dòng), §2 trách nhiệm BFF (signed-URL proxy pattern per R22 canonical Option A), §3 BFF behaviour map per 5 AC-IDs (AC-2 N/A BE primary), §4 auth + performance stream + security signed-token + error mapping ERR-INV-045, §5-§11 BFF-specific (SDL exportInternalProducts + ExportFileUrlResponse reuse + middleware REST endpoint + file map + DAG S5). Source FEAT chỉ audit. 2 NEED CONFIRMATION markers: merge order InternalProductSearchInput + file path catalog-v2.graphql. |
