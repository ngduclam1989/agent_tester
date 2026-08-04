---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-INS-DOSSIER-VIEW.md"
source_version: 15
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-VIEW"
source_feat_sha: "d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting"]
modifies: []
change_type: "new-capability"
graphql_ops: ["getInsuranceDossierVersions"]
paired_backend_feats: ["FEAT-INS-DOSSIER-VIEW"]
paired_fe_web_feats: ["FEAT-INS-DOSSIER-VIEW"]
paired_mobile_feats: ["FEAT-INS-DOSSIER-VIEW"]
authoring_inputs:
  kg_baseline_sha: ""
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "09510bdc75b246b0e83130758b24d071c75fe776087d21c92e3d5a68ded91d59"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-VIEW.bff.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
---

# FEAT-INS-DOSSIER-VIEW (BFF): Xem lịch sử bộ hồ sơ bảo hiểm đã xuất

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-VIEW` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting` |
| Parent Epic | [`EP-INSURANCE-SETTLEMENT`](../../epics/EP-INSURANCE-SETTLEMENT.md) |
| Wave | W02 |
| Status | DRAFT |
| GraphQL ops | `getInsuranceDossierVersions` |
| Cross-tier pair | BE: `FEAT-INS-DOSSIER-VIEW` \| Web: `FEAT-INS-DOSSIER-VIEW` \| Mobile: `FEAT-INS-DOSSIER-VIEW` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-VIEW` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) |
| Source version | v15 |
| Source SHA | `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` |
| Generated at | 2026-06-18T01:05:38+00:00 |

## 1. Mục đích nghiệp vụ

Tính năng cho phép kế toán và chủ garage tra cứu toàn bộ lịch sử các bộ hồ sơ bảo hiểm đã xuất PDF gắn với một phiếu quyết toán bảo hiểm cụ thể. Mỗi bộ hồ sơ đại diện cho một lần xuất (versioning), bao gồm các file PDF riêng lẻ của từng tài liệu trong bộ. Mục tiêu là hỗ trợ truy vết lịch sử hồ sơ đã gửi cho doanh nghiệp bảo hiểm, đối chiếu khi có tranh chấp và xem hoặc tải lại PDF gốc bất kỳ lúc nào.

## 2. Trách nhiệm BFF (agg-garage-graph)

- Expose query `getInsuranceDossierVersions(settlementCode: String!, page: Int, size: Int)` trả về danh sách paginated các bộ hồ sơ đã xuất kèm thông tin tài liệu từng bộ.
- Resolver thực hiện **passthrough thuần** — gọi xuống `POST /api/v1/insurance-dossiers/search` của `gf-accounting`, không orchestrate thêm downstream nào khác.
- Map Spring Pageable response `{content[], page, size, totalElements, totalPages}` sang GraphQL type `InsuranceDossierVersionsPage`.
- Propagate đầy đủ `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting` để đảm bảo tenant isolation và RBAC.
- Áp dụng giới hạn `size` tối đa 50 (từ ADR-016 / chốt 2026-06-17) — reject nếu FE gửi vượt.
- Không có DataLoader hay in-memory cache — đây là read có phân trang, không phải nested field N+1.

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Truy vấn danh sách hồ sơ theo phiếu quyết toán

#### AC-1 → N/A (FE-web/Mobile — điều hướng đến tab "Hồ sơ bảo hiểm đã xuất")

- Source AC này chỉ liên quan đến điều hướng UI và render tab ở client. BFF không touch.
- Xem `fe-web/FEAT-INS-DOSSIER-VIEW.md` và `mobile/FEAT-INS-DOSSIER-VIEW.md`.

#### AC-2 → BFF expose danh sách bộ hồ sơ theo phiếu quyết toán (paginated)

- **Khi**: FE/Mobile gửi query `getInsuranceDossierVersions(settlementCode, page, size)`.
- **BFF phải**: passthrough sang `POST /api/v1/insurance-dossiers/search` body `{settlementCode, page, size}` — trả về mảng `content[]` gồm các bộ hồ sơ với `versionNo`, `exportedAt`, danh sách tài liệu.
- **Downstream**: `gf-accounting` — `POST /api/v1/insurance-dossiers/search`.
- **Output shape**: `InsuranceDossierVersionsPage { content: [InsuranceDossierVersion!]!, pagination: PaginationMeta! }`.
- **Failure mode**: `gf-accounting` 404 → GraphQL error code `INS_STL_NOT_FOUND`; 500 → `DOWNSTREAM_ERROR`.
- **Ref**: op `getInsuranceDossierVersions` (§6.1), resolver `src/resolvers/insurance/getInsuranceDossierVersions.ts` (§6.2), paired BE FEAT-INS-DOSSIER-VIEW §6.1.

#### AC-3 → N/A (FE-web/Mobile — render lưới card PDF trong từng bộ hồ sơ)

- Source AC liên quan đến hiển thị grid 2 cột card file PDF — hoàn toàn là UI concern. BFF cung cấp field `documents[]` trong `InsuranceDossierVersion`; FE/Mobile tự render layout.
- Xem `fe-web/FEAT-INS-DOSSIER-VIEW.md §3`.

#### AC-4 → N/A (FE-web/Mobile — chọn và mở preview PDF trong modal/viewer)

- Hành động chọn file + mở viewer là UI local. BFF không cần thêm op riêng — `pdfUrl` đã có trong `documents[].pdfUrl` từ AC-2.
- Xem `fe-web/FEAT-INS-DOSSIER-VIEW.md §3`.

#### AC-5 → BFF expose `pdfUrl` cho FE tự compose download URL

- **Khi**: FE/Mobile cần URL để tải PDF gốc của tài liệu.
- **BFF phải**: trả `documents[].pdfUrl` là relative path / object key từ ct-file-storage (per ADR-016 — KHÔNG signed URL TTL, KHÔNG `/download` endpoint riêng). FE compose full URL bằng env domain config.
- **Downstream**: field được trả trực tiếp từ response `gf-accounting` `POST /insurance-dossiers/search` — không thêm call.
- **Output shape**: `InsuranceDossierDocument { pdfUrl: String!, fileName: String!, documentType: DossierDocumentType! }`.
- **Failure mode**: nếu `pdfUrl` null/empty từ BE → trả `pdfUrl: null`, FE xử lý trạng thái lỗi theo AC-9.
- **Ref**: op `getInsuranceDossierVersions` (§6.1), ADR-016 §Access.

#### AC-6 → BFF enforce read-only — không expose mutation thay đổi bộ hồ sơ đã xuất

- **Khi**: BFF nhận bất kỳ attempt write vào dossier đã EXPORTED.
- **BFF phải**: không có resolver nào cho phép patch/delete dossier version — chỉ có query `getInsuranceDossierVersions`. Immutability được enforce ở BE (BR-INS-DOSSIER-006); BFF không cần thêm guard riêng ngoài việc không expose mutation tương ứng.
- **Ref**: BR-INS-DOSSIER-006 (BE primary), ADR-016.

#### AC-7 → BFF trả toàn bộ các version trong pagination (không filter, không xóa)

- **Khi**: FE/Mobile query danh sách bộ hồ sơ.
- **BFF phải**: không áp filter status ở BFF layer — truyền toàn bộ kết quả từ `gf-accounting` (kể cả version REPLACED). BE đảm bảo BR-INS-DOSSIER-009 (tất cả version hiển thị). Resolver không tự filter theo status.
- **Downstream**: `gf-accounting` `POST /insurance-dossiers/search`.
- **Output shape**: tất cả version kể cả `status: REPLACED` đều xuất hiện trong `content[]`.
- **Ref**: BR-INS-DOSSIER-009 (BE primary).

### Cluster B — Phân quyền và xử lý lỗi

#### AC-8 → BFF propagate auth context; RBAC enforce ở BE

- **Khi**: FE/Mobile gửi query `getInsuranceDossierVersions`.
- **BFF phải**: forward `Authorization` (JWT), `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`. RBAC check (chỉ `garage-owner` và `accountant` xem được — BR-INS-DOSSIER-VIEW-001) là BE territory; BFF không tự enforce role check riêng ngoài header propagation.
- **Failure mode**: `gf-accounting` trả 403 → GraphQL error `PERMISSION_DENIED`.
- **Ref**: op `getInsuranceDossierVersions` (§6.1), §4.1.

#### AC-9 → BFF map lỗi storage/file-not-found từ BE sang GraphQL error

- **Khi**: BE trả error chỉ thị file PDF không tồn tại hoặc storage lỗi (per PRINT-INS-005 recovery exception).
- **BFF phải**: map error code BE `INS_DOSSIER_FILE_NOT_FOUND` / `STORAGE_ERROR` sang GraphQL error tương ứng trong union hoặc `errors[]` — FE/Mobile dùng để hiển thị trạng thái lỗi cụ thể.
- **Output shape**: `pdfUrl: null` trong `InsuranceDossierDocument` kèm `error` field nếu BE expose; hoặc GraphQL `errors[]` với extension `code`.
- **Ref**: PRINT-INS-005, §4.5.

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống `gf-accounting`.
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Query `getInsuranceDossierVersions` là single passthrough — không có nested field N+1. Không cần DataLoader riêng cho feature này.
- Resolver phải validate `size ≤ 50` trước khi gọi downstream — reject với GraphQL error `INVALID_INPUT` nếu `size > 50` (ADR-016, max `size=50`).
- Không có cache hint (`@cacheControl`) — danh sách hồ sơ thay đổi sau mỗi lần xuất; FE không nên cache.

### 4.3 Security + data exposure

- KHÔNG log `Authorization` JWT hay `X-Tenant-Id` trong resolver log.
- `pdfUrl` là relative path — BFF không append domain hay tạo signed URL; FE tự compose từ env config (ADR-016).
- Tenant scope được đảm bảo bởi header `X-Tenant-Id` forwarded xuống BE — resolver không nhận `tenantId` từ argument client-controlled.

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` keep old.
- Breaking change → CR MAJOR.
- `getInsuranceDossierVersions` là query mới — không breaking với schema hiện tại.

### 4.5 Error code mapping

| Downstream error (BE) | GraphQL error code | Source AC |
|---|---|---|
| `INS_STL_NOT_FOUND` (404) | `INS_STL_NOT_FOUND` | AC-2, AC-8 |
| `PERMISSION_DENIED` (403) | `PERMISSION_DENIED` | AC-8 |
| `INS_DOSSIER_FILE_NOT_FOUND` | `INS_DOSSIER_FILE_NOT_FOUND` | AC-9 |
| `STORAGE_ERROR` | `STORAGE_ERROR` | AC-9 |
| BE 500 / timeout | `DOWNSTREAM_ERROR` | tất cả AC |

---

## 5. GraphQL SDL delta (BFF — schema focus)

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `InsuranceDossierVersionsPage` | type | `content: [InsuranceDossierVersion!]!`, `pagination: PaginationMeta!` | NO (new) | AC-2 |
| `InsuranceDossierVersion` | type | `dossierId: ID!`, `versionNo: Int!`, `exportedAt: String!`, `status: DossierStatus!`, `documents: [InsuranceDossierDocument!]!` | NO (new) | AC-2, AC-7 |
| `InsuranceDossierDocument` | type | `documentType: DossierDocumentType!`, `fileName: String!`, `pdfUrl: String`, `isSelected: Boolean!` | NO (new) | AC-3, AC-5, AC-9 |
| `PaginationMeta` | type | `page: Int!`, `size: Int!`, `totalElements: Int!`, `totalPages: Int!` | NO (new — reuse nếu đã exist) | AC-2 |
| `InsuranceDossierVersionsInput` | input | `settlementCode: String!`, `page: Int`, `size: Int` | NO (new) | AC-2 |
| `DossierDocumentType` | enum | `QUOTATION_SHEET`, `SETTLEMENT_SHEET`, `ACCEPTANCE_RECORD`, `PAYMENT_AUTHORIZATION` | NO (new) | AC-3 |
| `DossierStatus` | enum | `EXPORTED`, `REPLACED` | NO (new) | AC-7 |

> **Lưu ý**: `PaginationMeta` — kiểm tra schema hiện tại của `agg-garage-graph` xem đã có type tương đương (vd `PageInfo`, `PageResponse`) để reuse thay vì tạo mới. Nếu đã có convention type pagination riêng → dùng consistent type đó.

### 5.2 Modified types (additive — backward-compat)

Không có type hiện tại nào bị modify cho feature này.

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `getInsuranceDossierVersions` | query | `input: InsuranceDossierVersionsInput!` | `InsuranceDossierVersionsPage!` | JWT + `X-Tenant-Id` | AC-2, AC-5, AC-7, AC-8, AC-9 |

**SDL stub**:
```graphql
type Query {
  getInsuranceDossierVersions(input: InsuranceDossierVersionsInput!): InsuranceDossierVersionsPage!
}

input InsuranceDossierVersionsInput {
  settlementCode: String!
  page: Int   # default 0
  size: Int   # default 10, max 50
}

type InsuranceDossierVersionsPage {
  content: [InsuranceDossierVersion!]!
  pagination: PaginationMeta!
}

type InsuranceDossierVersion {
  dossierId: ID!
  versionNo: Int!
  exportedAt: String!
  status: DossierStatus!
  documents: [InsuranceDossierDocument!]!
}

type InsuranceDossierDocument {
  documentType: DossierDocumentType!
  fileName: String!
  pdfUrl: String          # null nếu file mất / storage lỗi (AC-9)
  isSelected: Boolean!
}

type PaginationMeta {
  page: Int!
  size: Int!
  totalElements: Int!
  totalPages: Int!
}

enum DossierDocumentType {
  QUOTATION_SHEET
  SETTLEMENT_SHEET
  ACCEPTANCE_RECORD
  PAYMENT_AUTHORIZATION
}

enum DossierStatus {
  EXPORTED
  REPLACED
}
```

### 6.2 Resolver mapping (downstream BE endpoints)

> Passthrough thuần — 1 GraphQL op → 1 REST call.

| Operation | Resolver path | Downstream BE FEAT | REST endpoint | DataLoader key | AC ref |
|---|---|---|---|---|---|
| `getInsuranceDossierVersions` | `src/resolvers/insurance/getInsuranceDossierVersions.ts` | `FEAT-INS-DOSSIER-VIEW` (BE §6.1) | `POST /api/v1/insurance-dossiers/search` body `{settlementCode, page, size}` | N/A (không cần) | AC-2, AC-5, AC-7, AC-8, AC-9 |

**Request body mapping** (BFF → BE):

| GraphQL arg | BE body field | Notes |
|---|---|---|
| `input.settlementCode` | `settlementCode` | required |
| `input.page` | `page` | default `0` nếu null |
| `input.size` | `size` | default `10`; validate ≤ 50 trước khi gọi |

**Response mapping** (BE → GraphQL):

| BE field | GraphQL field | Notes |
|---|---|---|
| `content[].dossierId` | `content[].dossierId` | direct map |
| `content[].versionNo` | `content[].versionNo` | direct map |
| `content[].exportedAt` | `content[].exportedAt` | ISO8601 string |
| `content[].status` | `content[].status` | `EXPORTED` \| `REPLACED` |
| `content[].documents[].documentType` | `content[].documents[].documentType` | enum map |
| `content[].documents[].fileName` | `content[].documents[].fileName` | direct map |
| `content[].documents[].pdfUrl` | `content[].documents[].pdfUrl` | relative path / null |
| `content[].documents[].isSelected` | `content[].documents[].isSelected` | direct map |
| `page` | `pagination.page` | from Spring Pageable wrapper |
| `size` | `pagination.size` | from Spring Pageable wrapper |
| `totalElements` | `pagination.totalElements` | from Spring Pageable wrapper |
| `totalPages` | `pagination.totalPages` | from Spring Pageable wrapper |

### 6.3 DataLoader / batching strategy

Không cần DataLoader cho feature này — query là single passthrough paginated, không có nested N+1 risk.

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `getInsuranceDossierVersions` | không cache | — | — | Danh sách thay đổi sau mỗi export; FE nên re-fetch sau `exportInsuranceDossier` mutation |

### 6.5 Persisted query allowlist

Đăng ký `GetInsuranceDossierVersionsQuery` vào allowlist khi production enable persisted queries.

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `src/schema/insurance/insurance-dossier.graphql` | NEW | SDL mới theo module `insurance` | ~50 | AC-2, AC-5 |
| `resolvers/` | `src/resolvers/insurance/getInsuranceDossierVersions.ts` | NEW | passthrough resolver pattern | ~50 | AC-2, AC-7, AC-8, AC-9 |
| `data-sources/` | `src/data-sources/GfAccountingDataSource.ts` | ADDITIVE | thêm method `searchInsuranceDossiers(body)` | ~20 | AC-2 |
| `tests/integration` | `tests/integration/insurance/getInsuranceDossierVersions.test.ts` | NEW | apollo test client mock downstream | ~80 | AC-2, AC-8, AC-9 |
| `tests/contract` | `tests/contract/insurance-dossier-contract.test.ts` | NEW | schema contract snapshot | ~40 | (schema) |

## 8. Implementation sequence DAG (BFF — S5)

```
(← BE tier S4: POST /api/v1/insurance-dossiers/search stable + integration green)

S5  BFF schema + resolver wire
    Entry: BE FEAT-INS-DOSSIER-VIEW §6.1 contract stable (endpoint + response shape confirmed)
    Exit:  BFF contract test green + passthrough integration test pass
    └─► (hand-off FE-web S6 + Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5.1 | Define SDL types + query | `src/schema/insurance/insurance-dossier.graphql` | — | SDL compile pass | — |
| S5.2 | Implement resolver passthrough | `src/resolvers/insurance/getInsuranceDossierVersions.ts` | S5.1 done | resolver unit test pass | S5.1 |
| S5.3 | Add DataSource method | `src/data-sources/GfAccountingDataSource.ts` | BE endpoint deployed | DataSource unit test pass | BE S4 |
| S5.4 | Wire integration test | `tests/integration/...` | S5.2 + S5.3 | integration test green | S5.2, S5.3 |
| S5.5 | Contract test snapshot | `tests/contract/...` | S5.1 | schema snapshot pass | S5.1 |

## 9. Business Rules enforced (BFF — secondary)

> Primary BR enforcement = BE tier. BFF chỉ enforce auth propagation, size guard và không expose write op.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-VIEW-001` | CORNERSTONE | header propagation → BE enforce | resolver forward headers | AC-8 | RBAC check thực tế ở gf-accounting |
| `BR-INS-DOSSIER-006` | CORNERSTONE | không expose mutation sửa dossier đã EXPORTED | không tạo resolver write | AC-6 | immutability chỉ enforce ở BE |
| `BR-INS-DOSSIER-009` | NORMAL | không filter content[] theo status | resolver không tự filter | AC-7 | tất cả version (kể cả REPLACED) trả về |
| `ADR-016 size limit` | NORMAL | validate `size ≤ 50` | resolver pre-check | AC-2 | reject với `INVALID_INPUT` |

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | BFF integration (resolver → BE mock) | test-api | verify request body mapping + pagination shape |
| AC-5 | BFF integration | test-api | verify `pdfUrl` field trả về đúng relative path |
| AC-7 | BFF integration | test-api | verify REPLACED version có mặt trong `content[]` — không bị filter |
| AC-8 | BFF auth (header propagation) | test-isolation | verify `Authorization`, `X-Tenant-Id` forwarded; 403 từ BE → `PERMISSION_DENIED` |
| AC-9 | BFF error mapping | test-api | BE trả storage error → GraphQL error code đúng; `pdfUrl: null` |
| — | BFF contract (schema snapshot) | test-api | SDL snapshot, `PaginationMeta` fields |
| — | BFF size guard | test-api | `size=51` → `INVALID_INPUT` reject |

## 11. Cross-tier coordination (BFF perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | Downstream `POST /api/v1/insurance-dossiers/search` (§6.1) — BFF resolver wrap. BFF S5 phụ thuộc BE S4. |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | Consume `getInsuranceDossierVersions` query từ §6.1. FE tự compose download URL từ `pdfUrl` + env domain. |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-VIEW.md` | DRAFT | Consume `getInsuranceDossierVersions` query từ §6.1. Mobile tự compose download URL từ `pdfUrl` + env domain. |

**Source ID consistency** (item #18): `source_feat_sha` = `d195ef6eb358c691b31947ffecbcfe1b7ebb9254dc2ec46f428fe9da29b19b4c` — identical với BE/FE/Mobile files.

## 12. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-VIEW.md`](../../../../../Product/features/FEAT-INS-DOSSIER-VIEW.md) v15
- **Paired BE**: [`features/be/FEAT-INS-DOSSIER-VIEW.md`](../be/FEAT-INS-DOSSIER-VIEW.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) (commit 091195f8)
- **ADR-016**: [`Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md`](../../../../../Architecture/decisions/ADR-016-insurance-dossier-pdf-s3.md) — PDF storage, list pagination, pdfUrl access pattern
- **PKG**: [`PKG-W02-insurance-dossier.md`](../../../../work-packages/PKG-W02-insurance-dossier.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## Related CRs

Hiện không có CR W02 active liên quan tier này. Tham chiếu CR mobile-scoped: [CR-20260622-04](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-04--ins-dossier-view-grid-to-list), [CR-20260622-05](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-05--ins-dossier-view-t40-pdf-viewer-mode) (nếu cần parity verify).

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho `FEAT-INS-DOSSIER-VIEW` W02. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BFF passthrough, §3 BFF behaviour map per 9 AC-IDs, §4 auth + size guard + error mapping, §5-§11 BFF-specific (SDL/ops/resolver/cross-tier). Resolver pattern: single passthrough `getInsuranceDossierVersions` → `POST /api/v1/insurance-dossiers/search` Spring Pageable. Source FEAT chỉ audit. |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — không có CR W02 active liên quan tier BFF; chỉ note tham chiếu CR mobile-scoped (CR-20260622-04, CR-20260622-05) để parity verify. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | RETRY fix #18c: xác nhận §1 byte-equal với canonical wording (BFF chốt làm cross-tier canonical). Bump version 1→2. §0 và §2-§N giữ nguyên. |
