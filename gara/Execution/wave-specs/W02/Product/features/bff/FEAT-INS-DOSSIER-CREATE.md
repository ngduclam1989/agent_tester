---
type: execution
artifact_kind: converted-feature
tier_role: bff
source_ref: "Product/features/FEAT-INS-DOSSIER-CREATE.md"
source_version: 21
source: "gen-execution-spec"
source_feat_id: "FEAT-INS-DOSSIER-CREATE"
source_feat_sha: "f04a51b87f035716574cecbd812eef3984b04d20458c4c82e48556cf25284eb0"
generated_at: "2026-06-18T01:05:38+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W02"
parent_epic: "EP-INSURANCE-SETTLEMENT"
parent_pkg: "PKG-W02-insurance-dossier"
bff: "agg-garage-graph"
boundaries_consumed: ["gf-accounting", "gf-sales"]
modifies: []
change_type: "new-capability"
graphql_ops:
  - "exportInsuranceDossier"
  - "getInsuranceDossierVersions"
  - "getInsuranceDossierCurrent"
paired_backend_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_fe_web_feats: ["FEAT-INS-DOSSIER-CREATE"]
paired_mobile_feats: ["FEAT-INS-DOSSIER-CREATE"]
authoring_inputs:
  kg_baseline_sha: ""
  pkg_ref: "PKG-W02-insurance-dossier"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "09510bdc75b246b0e83130758b24d071c75fe776087d21c92e3d5a68ded91d59"
  bundle_path: "/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-CREATE.bff.md"
  bundle_generated_at: "2026-06-18T01:03:11+00:00"
reviewer_verdict: null
last_reviewed: "2026-06-22"
need_confirmation:
  - id: "NC-BFF-INS-001"
    detail: "Endpoint GET /api/v1/insurance-dossiers/current?settlementCode={code} chưa tồn tại trong BE spec (FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW). Cần raise CR-INS-DOSSIER-CURRENT-ENDPOINT cho gf-accounting để thêm endpoint này trước khi BFF impl op getInsuranceDossierCurrent."
---

# FEAT-INS-DOSSIER-CREATE (BFF): Xuất hồ sơ bảo hiểm — BFF Orchestrator

> **BFF tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BFF cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-INS-DOSSIER-CREATE` |
| Tier | **bff** |
| BFF | `agg-garage-graph` |
| Boundaries consumed | `gf-accounting`, `gf-sales`, `ct-file-storage` |
| Parent Epic | `EP-INSURANCE-SETTLEMENT` |
| Wave | W02 |
| Status | DRAFT |
| GraphQL ops | `exportInsuranceDossier`, `getInsuranceDossierVersions`, `getInsuranceDossierCurrent` |
| Cross-tier pair | BE: FEAT-INS-DOSSIER-CREATE \| Web: FEAT-INS-DOSSIER-CREATE \| Mobile: FEAT-INS-DOSSIER-CREATE |

---

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-INS-DOSSIER-CREATE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) |
| Source version | v21 |
| Source SHA | `6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` |
| Generated at | 2026-06-18T01:05:38+00:00 |

---

## 1. Mục đích nghiệp vụ

Kế toán cần lập và xuất bộ hồ sơ bảo hiểm chuẩn (4 tài liệu) trực tiếp trong hệ thống thay vì thao tác ngoài Excel, nhằm gửi đầy đủ giấy tờ cho doanh nghiệp bảo hiểm ngay lần đầu. Feature cho phép kế toán xem trước từng tài liệu, điền nội dung vào template ③④, tích chọn tài liệu cần xuất, và nhận PDF sẵn sàng gửi BH — rút ngắn thời gian thu tiền và tránh bị trả lại hồ sơ.

---

## 2. Trách nhiệm BFF (`agg-garage-graph`)

- Expose 1 mutation `exportInsuranceDossier` đóng vai **orchestrator 5-phase** (A→B→C→D→E): resolve context, render PDF song song, upload ct-file-storage song song, persist batch atomic, aggregate response trả FE/Mobile.
- Expose 1 query `getInsuranceDossierVersions(settlementCode, page, size)` là **passthrough** sang `POST /api/v1/insurance-dossiers/search` trên gf-accounting, wrap kết quả Spring Pageable thành GraphQL connection.
- Propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống mọi downstream call (gf-accounting, gf-sales, ct-file-storage).
- Abort pipeline sớm nếu Phase B hoặc Phase C thất bại — không tiến sang Phase D để tránh orphan data.
- Map error code downstream thành GraphQL extension error code chuẩn cho FE/Mobile consume.
- KHÔNG chứa business logic render PDF, KHÔNG truy cập DB gf-accounting trực tiếp, KHÔNG gọi ct-file-storage ngoài Phase C upload.

---

## 3. Hành vi cần triển khai (BFF behaviour map)

### Cluster A — Mở và hiển thị modal Hồ sơ bảo hiểm

#### AC-1 → BFF cung cấp dữ liệu hồ sơ hiện tại qua query `getInsuranceDossierCurrent`

- **Khi**: FE/Mobile mở modal Hồ sơ bảo hiểm từ màn Phiếu QT BH, cần tải hồ sơ EXPORTED hiện hành (bộ mới nhất) để hiển thị trạng thái và cho phép kế toán tạo bộ mới.
- **BFF phải**: Resolver `getInsuranceDossierCurrent(settlementCode: ID!)` gọi passthrough BE `GET /api/v1/insurance-dossiers/current?settlementCode={code}` (gf-accounting) → trả `InsuranceDossier` hoặc null nếu chưa có bộ nào.
- **Output shape**: `query getInsuranceDossierCurrent(settlementCode: ID!): InsuranceDossier` — type `InsuranceDossier` reuse từ `InsuranceDossierVersion` (xem §5 SDL).
- **Failure mode**: BE 404 → trả `null` (chưa có hồ sơ, không lỗi); BE 4xx/5xx khác → propagate `INS_STL_NOT_FOUND` hoặc `UPSTREAM_ERROR`.
- **Ref**: op `getInsuranceDossierCurrent` (§6.1), resolver `src/resolvers/insurance/getInsuranceDossierCurrent.ts` (§6.2).

> **[NEED CONFIRMATION — NC-BFF-INS-001]**: Endpoint BE `GET /api/v1/insurance-dossiers/current?settlementCode={code}` chưa tồn tại trong `FEAT-INS-DOSSIER-CREATE (BE)` hoặc `FEAT-INS-DOSSIER-VIEW (BE)`. Cần raise **CR-INS-DOSSIER-CURRENT-ENDPOINT** cho gf-accounting để thêm endpoint này. BFF impl op `getInsuranceDossierCurrent` bị BLOCKED cho đến khi BE endpoint có trong spec ACTIVE.

#### AC-2 → BFF cung cấp dữ liệu context ban đầu khi mở modal

- **Khi**: FE/Mobile load modal hồ sơ bảo hiểm, cần lấy thông tin phiếu QT để prefill template.
- **BFF phải**: resolver `getInsuranceDossierVersions` gọi `POST /api/v1/insurance-dossiers/search` (gf-accounting) với `{settlementCode, page: 0, size: 10}` để trả danh sách version đã xuất (dùng cho tab "Hồ sơ đã xuất"). Dữ liệu settlement context (cho prefill ③④) được FE lấy từ query detail settlement hiện có (không thuộc scope BFF mới).
- **Downstream**: `POST /api/v1/insurance-dossiers/search` (gf-accounting)
- **Output shape**: `InsuranceDossierVersionConnection { content: [InsuranceDossierVersion!]!, page: Int!, size: Int!, totalElements: Int!, totalPages: Int! }`
- **Failure mode**: gf-accounting 404 → trả `content: []` (chưa có version nào) — không lỗi.
- **Ref**: op `getInsuranceDossierVersions` (§6.1), resolver `src/resolvers/insurance/getInsuranceDossierVersions.ts` (§6.2)

#### AC-3 → N/A (FE/Mobile layout 4 dòng tài liệu — local UI state)

- Layout 4 dòng tài liệu theo accordion (web) hoặc list dọc (mobile) là trách nhiệm FE/Mobile dựa trên constant `BR-INS-DOSSIER-001` (4 doc types cố định). BFF không expose riêng.

### Cluster B — Preview và trạng thái từng tài liệu

#### AC-4 → N/A (BE render ① Phiếu QT — BFF chỉ proxy trong Phase B)

- Render "PHIẾU QUYẾT TOÁN SỬA CHỮA" là trách nhiệm gf-accounting `GET /api/v1/settlements/{id}/export-pdf` (baseline `SettlementPrintingController:43`). BFF gọi trong Phase B của mutation `exportInsuranceDossier` — không expose riêng.
- Xem AC-9 (export mutation) cho mapping đầy đủ.

#### AC-5 → N/A (BE render ② Phiếu BG — BFF chỉ proxy trong Phase B)

- Render "PHIẾU BÁO GIÁ SỬA CHỮA" là trách nhiệm gf-sales `GET /api/v2/service-orders/{serviceOrderId}/export-pdf?type=QUOTATION` (baseline `PrintingController:74`). BFF gọi trong Phase B — không expose riêng.
- Xem AC-9 cho mapping đầy đủ.

#### AC-6 → N/A (template fill Biên bản nghiệm thu — FE local + form data truyền qua mutation)

- Kế toán điền template ③ trực tiếp trên FE/Mobile (local state). BFF nhận `formData.bbnt` như một phần `selectedDocs` input của mutation `exportInsuranceDossier`. Validation field bắt buộc do gf-accounting thực hiện khi render.
- Xem AC-9 cho flow đầy đủ. Xem `fe-web/FEAT-INS-DOSSIER-CREATE.md §3 AC-6` cho form fields.

#### AC-7 → N/A (template fill Giấy ủy quyền — FE local + form data truyền qua mutation)

- Tương tự AC-6: kế toán điền template ④ trên FE/Mobile. BFF nhận `formData.guq` trong `selectedDocs` input. gf-accounting render khi BFF gọi Phase B.
- Xem AC-9 cho flow đầy đủ.

#### AC-8 → N/A (preview tài liệu — FE/Mobile render PDF từ fileUrl)

- Khu vực preview + thao tác từng tài liệu là FE/Mobile responsibility: compose URL từ `pdfUrl` (relative path từ ct-file-storage) + env domain config, dùng cơ chế download/preview hiện hữu. BFF không expose endpoint preview riêng.
- Xem `fe-web/FEAT-INS-DOSSIER-CREATE.md §3 AC-8`.

### Cluster C — Export pipeline (mutation orchestrator)

#### AC-9 → BFF orchestrate 5-phase export pipeline qua mutation `exportInsuranceDossier`

- **Khi**: FE/Mobile gửi mutation `exportInsuranceDossier(input: ExportInsuranceDossierInput!)` — `input` gồm: `settlementCode: String!`, `selectedDocs: [DossierDocumentInput!]!` (mỗi item: `documentType: DossierDocumentType!`, `formData: JSON` nếu type là `ACCEPTANCE_RECORD` hoặc `PAYMENT_AUTHORIZATION`, `isSelected: Boolean!`).
- **BFF phải** thực hiện 5 phase tuần tự:

  **Phase A — Resolve context**:
  BFF gọi `GET /api/v1/settlements/{settlementCode}` (gf-accounting, x-api-key + X-Tenant-Id) → lấy `{id, serviceOrderId, tenantId}`. Nếu 404 → abort, trả `INS_STL_NOT_FOUND`. Nếu status `CANCEL` → abort, trả `INS_STL_CANCELLED` (guard BR-INS-DOSSIER-010).

  **Phase B — Parallel render PDF** (`Promise.all` theo `selectedDocs` filter `isSelected=true`):
  - `QUOTATION_SHEET` → gf-sales `GET /api/v2/service-orders/{serviceOrderId}/export-pdf?type=QUOTATION` → `byte[]`
  - `SETTLEMENT_SHEET` → gf-accounting `GET /api/v1/settlements/{id}/export-pdf` → `byte[]`
  - `ACCEPTANCE_RECORD` → gf-accounting `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` body `{settlementCode, formData: input.formData.bbnt}` → `byte[]`
  - `PAYMENT_AUTHORIZATION` → gf-accounting `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` body `{settlementCode, formData: input.formData.guq}` → `byte[]`

  Nếu bất kỳ render thất bại → abort toàn bộ, KHÔNG tiến Phase C/D. Trả `INS_DOSSIER_RENDER_FAILED` kèm `documentType` lỗi.

  **Phase C — Parallel upload ct-file-storage** (`Promise.all` trên mỗi `byte[]` từ Phase B):
  Mỗi byte[] → `POST /api/v1/files/upload-files` (ct-file-storage) multipart `files=<bytes>` + `folderType="SETTLEMENTS"` → `{fileUrl, fileName, id, size}`.

  Tên file theo BR-INS-DOSSIER-011: `{slug}_{settlementCode}_v{N+1}.pdf` (slug: `quyet-toan`, `bao-gia`, `bien-ban-nghiem-thu`, `uy-quyen-nhan-tien`). BFF tự compose tên file trước khi upload (lấy `versionNo` hiện tại từ Phase A hoặc query count trước; N+1 = count+1).

  Nếu bất kỳ upload thất bại → abort, KHÔNG gọi Phase D. Trả `INS_DOSSIER_UPLOAD_FAILED`. Orphan file ct-file-storage có thể tồn tại (cleanup TBD — Open Q).

  **Phase D — Persist batch atomic**:
  BFF → gf-accounting `POST /api/v1/insurance-dossier-documents/batch` body `{settlementCode, documents: [{documentType, fileUrl, fileName, formData?, isSelected}, ...N]}`.
  gf-accounting atomic: INSERT dossier vN+1 + INSERT N doc rows + UPDATE vN `status=REPLACED, replaced_by_version=N+1`.
  Response: `{dossierId, versionNo}`.

  Nếu Phase D fail → atomic rollback phía gf-accounting. BFF trả `INS_DOSSIER_PERSIST_FAILED`. Orphan files tồn tại (xem Open Q).

  **Phase E — Aggregate**:
  BFF aggregate response: `ExportInsuranceDossierPayload { versionNo: Int!, exports: [DossierExportItem!]! }` với `DossierExportItem { documentType: DossierDocumentType!, fileUrl: String!, fileName: String! }`.

- **Downstream** (theo phase):
  - Phase A: `GET /api/v1/settlements/{settlementCode}` (gf-accounting)
  - Phase B: 4 render endpoints gf-sales/gf-accounting (per documentType)
  - Phase C: `POST /api/v1/files/upload-files` (ct-file-storage, folderType=SETTLEMENTS)
  - Phase D: `POST /api/v1/insurance-dossier-documents/batch` (gf-accounting)
- **Output shape**: `ExportInsuranceDossierPayload`
- **Failure mode**: abort-on-fail per phase (xem trên). KHÔNG partial commit.
- **Ref**: op `exportInsuranceDossier` (§6.1), resolver `src/resolvers/insurance/exportInsuranceDossier.ts` (§6.2), paired BE `features/be/FEAT-INS-DOSSIER-CREATE.md §6`

#### AC-10 → BFF không cần xử lý thêm — immutability do Phase D gf-accounting enforce

- Sau khi Phase D hoàn thành, phiên bản vN đã `REPLACED` và vN+1 là ACTIVE. BFF trả `versionNo` cho FE/Mobile refresh tab "Hồ sơ đã xuất" qua `getInsuranceDossierVersions`.
- BFF secondary: `getInsuranceDossierVersions` sau export phải trả đủ các version bao gồm vN+1 mới nhất.

#### AC-11 → BFF hỗ trợ "Tạo bộ mới" qua cùng mutation `exportInsuranceDossier`

- **Khi**: kế toán tạo bộ hồ sơ mới (sau khi BH yêu cầu sửa), FE/Mobile gửi lại mutation `exportInsuranceDossier` với `settlementCode` và form data mới điền.
- **BFF phải**: thực hiện lại toàn bộ pipeline Phase A→E. Phase D tự increment versionNo (gf-accounting logic). Không cần BFF phân biệt "lần đầu" vs "lần N+1" — pipeline giống nhau.
- **Ref**: BR-INS-DOSSIER-007 (versioning, không giới hạn số lần tạo mới).

#### AC-12 → N/A (immutability enforce tại BE gf-accounting; BFF không expose edit op)

- BFF không expose mutation sửa nội dung dossier đã xuất. Nếu FE/Mobile thử gọi endpoint không tồn tại → GraphQL schema trả `GRAPHQL_VALIDATION_FAILED`. Primary enforcement tại gf-accounting domain.
- Xem `be/FEAT-INS-DOSSIER-CREATE.md §4` cho BR-INS-DOSSIER-006 enforcement.

### Cluster D — Phân quyền và lỗi

#### AC-13 → BFF enforce auth guard: chỉ role kế toán (`accountant`) được gọi mutation export

- **Khi**: resolver `exportInsuranceDossier` nhận request.
- **BFF phải**: kiểm tra JWT claim `role` = `accountant` (hoặc `garage-owner`). Nếu không đủ quyền → `PERMISSION_DENIED` với HTTP 403. `X-Tenant-Id` từ JWT phải match settlement tenant (Phase A resolve context check).
- **Query** `getInsuranceDossierVersions` cũng require authenticated user (JWT valid + tenant match).
- **Ref**: BR-GF-ACCOUNTING-013, §9 BR table.

#### AC-14 → BFF map lỗi render PDF từ downstream thành extension error code chuẩn

- **Khi**: Phase B render fail (gf-accounting/gf-sales trả 422 `INS_DOSSIER_RENDER_FAILED` hoặc 400 `INS_DOSSIER_FORM_INCOMPLETE`).
- **BFF phải**: bắt lỗi HTTP downstream, map sang GraphQL `extensions.code` chuẩn, trả `errors[]` với `message` tiếng Việt ngắn gọn + `extensions.documentType` để FE highlight tài liệu lỗi.
- **Failure mode**: xem §4.5 error mapping table.

---

## 4. Ràng buộc & rule cần enforce

### 4.1 Auth header propagation

- Mọi resolver propagate `Authorization`, `X-Tenant-Id`, `X-Branch-Id`, `x-request-id` xuống downstream REST (gf-accounting, gf-sales, ct-file-storage).
- Firebase token verify per request (production); dev/local có thể bypass theo profile.
- `X-Tenant-Id` trong JWT phải match `tenantId` từ settlement context (Phase A). Nếu không match → `PERMISSION_DENIED`.
- CORS: KHÔNG `origin: "*"` trong production.

### 4.2 Performance + N+1

- Phase B và Phase C dùng `Promise.all` — song song theo số tài liệu được chọn (tối đa 4). Không waterfall tuần tự.
- `getInsuranceDossierVersions` là passthrough đơn — không có N+1 risk (1 call). Không cần DataLoader.
- `exportInsuranceDossier` là mutation heavy — không cache (`@cacheControl(maxAge: 0, scope: PRIVATE)`).
- `getInsuranceDossierVersions` có thể `@cacheControl(maxAge: 0, scope: PRIVATE)` — dữ liệu per-user real-time.

### 4.3 Security + data exposure

- KHÔNG log JWT, `Authorization` header, file byte[] trong resolver.
- `pdfUrl` là relative path (object key) từ ct-file-storage — KHÔNG scheme, KHÔNG domain. FE compose URL từ env config. KHÔNG signed URL TTL (chốt ADR-016 2026-06-17).
- Tenant scope enforced qua `X-Tenant-Id` header (không client-controlled arg).
- KHÔNG expose `formData` raw trong GraphQL response (chỉ `fileUrl`, `fileName`, `documentType`).

### 4.4 Contract stability

- Schema additive only. Field rename → `@deprecated(reason: "...")` giữ old.
- Breaking change (remove field / change type) → CR MAJOR + ADR update.
- `DossierDocumentType` enum: thêm value = additive OK; remove value = breaking → CR MAJOR.

### 4.5 Error code mapping

| Downstream error (BE/Storage) | GraphQL extensions.code | Source AC | Notes |
|---|---|---|---|
| 404 `INS_STL_NOT_FOUND` (gf-accounting Phase A) | `INS_STL_NOT_FOUND` | AC-9 | Settlement không tồn tại |
| 400 `INS_STL_CANCELLED` (settlement status CANCEL) | `INS_STL_CANCELLED` | AC-9, AC-11 | BR-INS-DOSSIER-010 guard |
| 422 `INS_DOSSIER_RENDER_FAILED` (Phase B) | `INS_DOSSIER_RENDER_FAILED` | AC-14 | kèm `extensions.documentType` |
| 400 `INS_DOSSIER_FORM_INCOMPLETE` (Phase B ③④) | `INS_DOSSIER_FORM_INCOMPLETE` | AC-14 | kèm `extensions.documentType` |
| 5xx upload ct-file-storage (Phase C) | `INS_DOSSIER_UPLOAD_FAILED` | AC-9 | kèm `extensions.documentType` |
| 500 (Phase D persist) | `INS_DOSSIER_PERSIST_FAILED` | AC-9 | Orphan file warning |
| 403 auth | `PERMISSION_DENIED` | AC-13 | |

---

## 5. GraphQL SDL delta (BFF — schema focus)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

### 5.1 New types

| Type name | Kind | Fields | Breaking? | AC ref |
|---|---|---|---|---|
| `DossierDocumentType` | enum | `QUOTATION_SHEET`, `SETTLEMENT_SHEET`, `ACCEPTANCE_RECORD`, `PAYMENT_AUTHORIZATION` | NO (new) | AC-3, AC-9 |
| `DossierDocumentInput` | input | `documentType: DossierDocumentType!`, `formData: JSON`, `isSelected: Boolean!` | NO (new) | AC-9 |
| `ExportInsuranceDossierInput` | input | `settlementCode: String!`, `selectedDocs: [DossierDocumentInput!]!` | NO (new) | AC-9 |
| `DossierExportItem` | type | `documentType: DossierDocumentType!`, `fileUrl: String!`, `fileName: String!` | NO (new) | AC-9, AC-10 |
| `ExportInsuranceDossierPayload` | type | `versionNo: Int!`, `exports: [DossierExportItem!]!` | NO (new) | AC-9, AC-10 |
| `InsuranceDossierVersion` | type | `dossierId: ID!`, `versionNo: Int!`, `exportedAt: String!`, `status: String!`, `documents: [DossierExportItem!]!` | NO (new) | AC-10, AC-11 |
| `InsuranceDossierVersionConnection` | type | `content: [InsuranceDossierVersion!]!`, `page: Int!`, `size: Int!`, `totalElements: Int!`, `totalPages: Int!` | NO (new) | AC-2, AC-10 |

| `InsuranceDossier` | type | `dossierId: ID!`, `versionNo: Int!`, `exportedAt: String!`, `status: String!`, `documents: [DossierExportItem!]!` | NO (new — alias InsuranceDossierVersion cho current op) | AC-1 |

### 5.2 Modified types (additive — backward-compat)

Không có type hiện hữu nào bị modified. Toàn bộ types trên là mới.

> **Breaking changes** → REJECT (BFF schema additive only). Nếu cần deprecate field, mark `@deprecated(reason: "...")` không xóa hard.

---

## 6. GraphQL Operations contract (BFF — primary content)

### 6.1 New operations

| Operation name | Kind | Args | Return type | Auth context | AC ref |
|---|---|---|---|---|---|
| `exportInsuranceDossier` | mutation | `input: ExportInsuranceDossierInput!` | `ExportInsuranceDossierPayload!` | JWT (role: accountant\|garage-owner) + X-Tenant-Id | AC-9, AC-10, AC-11, AC-13 |
| `getInsuranceDossierVersions` | query | `settlementCode: String!`, `page: Int = 0`, `size: Int = 10` | `InsuranceDossierVersionConnection!` | JWT + X-Tenant-Id | AC-2, AC-10 |
| `getInsuranceDossierCurrent` | query | `settlementCode: ID!` | `InsuranceDossier` (nullable) | JWT + X-Tenant-Id | AC-1 |

### 6.2 Resolver mapping (downstream BE endpoints)

| Operation | Resolver path | Downstream | REST endpoint | Method | Phase | AC ref |
|---|---|---|---|---|---|---|
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-accounting | `GET /api/v1/settlements/{settlementCode}` | GET | Phase A | AC-9 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-sales | `GET /api/v2/service-orders/{serviceOrderId}/export-pdf?type=QUOTATION` | GET (binary) | Phase B ① | AC-5, AC-9 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-accounting | `GET /api/v1/settlements/{id}/export-pdf` | GET (binary) | Phase B ② | AC-4, AC-9 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-accounting | `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` | POST (binary) | Phase B ③ | AC-6, AC-9, AC-14 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-accounting | `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` | POST (binary) | Phase B ④ | AC-7, AC-9, AC-14 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | ct-file-storage | `POST /api/v1/files/upload-files` (multipart, folderType=SETTLEMENTS) | POST | Phase C | AC-9, AC-10 |
| `exportInsuranceDossier` | `src/resolvers/insurance/exportInsuranceDossier.ts` | gf-accounting | `POST /api/v1/insurance-dossier-documents/batch` | POST | Phase D | AC-9, AC-10, AC-12 |
| `getInsuranceDossierVersions` | `src/resolvers/insurance/getInsuranceDossierVersions.ts` | gf-accounting | `POST /api/v1/insurance-dossiers/search` | POST | passthrough | AC-2, AC-10 |
| `getInsuranceDossierCurrent` | `src/resolvers/insurance/getInsuranceDossierCurrent.ts` | gf-accounting | `GET /api/v1/insurance-dossiers/current?settlementCode={code}` | GET | passthrough | AC-1 | **BLOCKED** — endpoint BE chưa tồn tại (NC-BFF-INS-001, CR-INS-DOSSIER-CURRENT-ENDPOINT) |

**Ghi chú Phase B parallel render**:

Resolver `exportInsuranceDossier.ts` filter `input.selectedDocs` theo `isSelected=true`, tạo array promises theo `documentType`:

```typescript
// Phase B — conceptual (không copy into BFF code verbatim)
const renderPromises = selectedDocs.map(doc => {
  switch (doc.documentType) {
    case 'QUOTATION_SHEET':
      return gfSalesDS.renderQuotationPdf(serviceOrderId);
    case 'SETTLEMENT_SHEET':
      return gfAccountingDS.renderSettlementPdf(settlementId);
    case 'ACCEPTANCE_RECORD':
      return gfAccountingDS.renderAcceptanceRecordPdf(settlementCode, doc.formData);
    case 'PAYMENT_AUTHORIZATION':
      return gfAccountingDS.renderPaymentAuthorizationPdf(settlementCode, doc.formData);
  }
});
const pdfBuffers = await Promise.all(renderPromises); // abort-on-fail
```

**Phase C upload pattern**:

```typescript
// Phase C — conceptual
const uploadPromises = pdfBuffers.map((buf, i) =>
  ctFileStorageDS.uploadFile(buf, composedFileName(selectedDocs[i].documentType, settlementCode, nextVersionNo), 'SETTLEMENTS')
);
const uploadResults = await Promise.all(uploadPromises); // abort-on-fail
```

### 6.3 DataLoader / batching strategy

| Loader name | Key shape | Use cases | Notes |
|---|---|---|---|
| (không cần DataLoader) | — | `exportInsuranceDossier` là mutation không nested list; `getInsuranceDossierVersions` là single passthrough | N+1 risk không xuất hiện trong 2 ops này |

### 6.4 Cache strategy (Apollo cache / persisted query)

| Operation | Cache hint | TTL | Invalidation trigger | Notes |
|---|---|---|---|---|
| `exportInsuranceDossier` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | — | Mutation, không cache |
| `getInsuranceDossierVersions` | `@cacheControl(maxAge: 0, scope: PRIVATE)` | — | mutation complete | Dữ liệu real-time per-user, không cache |

### 6.5 Persisted query allowlist

Không bắt buộc trong W02. Thêm khi production security audit yêu cầu.

---

## 7. File/module impact map (BFF — Node.js GraphQL)

> Path glob ⊆ `bffs/agg-garage-graph/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `schema/` | `bffs/agg-garage-graph/src/schema/insurance.graphql` | NEW (hoặc ADDITIVE vào schema module insurance) | extend SDL | ~60 | AC-9, AC-10 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/insurance/exportInsuranceDossier.ts` | NEW | resolver orchestrator pattern | ~120 | AC-9, AC-11, AC-13 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/insurance/getInsuranceDossierVersions.ts` | NEW | passthrough resolver pattern | ~40 | AC-2, AC-10 |
| `resolvers/` | `bffs/agg-garage-graph/src/resolvers/insurance/getInsuranceDossierCurrent.ts` | NEW (BLOCKED — NC-BFF-INS-001) | passthrough resolver pattern | ~30 | AC-1 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfAccountingDataSource.ts` | ADDITIVE | new methods: `getSettlement`, `renderSettlementPdf`, `renderAcceptanceRecordPdf`, `renderPaymentAuthorizationPdf`, `batchPersistDossier`, `searchDossierVersions` | ~80 | AC-9, AC-10 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/GfSalesDataSource.ts` | ADDITIVE | new method: `renderQuotationPdf` | ~20 | AC-5, AC-9 |
| `data-sources/` | `bffs/agg-garage-graph/src/data-sources/CtFileStorageDataSource.ts` | NEW hoặc ADDITIVE | multipart upload method `uploadFile` | ~30 | AC-9 |
| `types/` | `bffs/agg-garage-graph/src/types/insurance.ts` | NEW | TypeScript interfaces cho payload types | ~40 | AC-9, AC-10 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/exportInsuranceDossier.test.ts` | NEW | apollo test client + mock downstream | ~100 | AC-9, AC-13, AC-14 |
| `tests/integration` | `bffs/agg-garage-graph/tests/integration/getInsuranceDossierVersions.test.ts` | NEW | apollo test client + mock downstream | ~50 | AC-2, AC-10 |
| `tests/contract` | `bffs/agg-garage-graph/tests/contract/insurance-dossier-contract.test.ts` | NEW | schema contract snapshot | ~40 | (schema) |

---

## 8. Implementation sequence DAG (BFF — S5)

> BFF S5 entry depends on BE S4 (gf-accounting + gf-sales render endpoints stable + ct-file-storage upload endpoint verified). BFF S5 exit hand-off S6 cho FE-web và Mobile.

```
(← BE tier S4: gf-accounting REST stable + gf-sales render stable + ct-file-storage upload verified)

S5a  BFF SDL + types
     Entry: BE FEAT §6 contracts stable (gf-accounting + gf-sales endpoints documented)
     Exit: schema lint green, type generation pass

S5b  Data Source layer
     Entry: S5a green
     Exit: GfAccountingDS + GfSalesDS + CtFileStorageDS unit tests pass (mock HTTP)

S5c  Resolver: exportInsuranceDossier (5 phase orchestrator)
     Entry: S5b green
     Exit: integration test mock downstream → Phase A/B/C/D/E sequence verified

S5d  Resolver: getInsuranceDossierVersions (passthrough)
     Entry: S5b green (parallel với S5c)
     Exit: integration test passthrough + pagination mapping verified

S5e  Auth guard + error mapping
     Entry: S5c + S5d green
     Exit: role guard test pass (accountant=OK, invalid role=PERMISSION_DENIED)

S5f  BFF contract test + N+1 check
     Entry: S5e green
     Exit: SDL snapshot stable, inflight count assertion pass
     └─► (hand-off FE/Mobile S6)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S5a | SDL + type definitions | schema + types | BE §6 stable | schema lint + typecheck | BE S4 |
| S5b | Data Source methods (6 methods accounting + 1 sales + 1 storage) | data-sources | S5a | unit test mock HTTP pass | S5a |
| S5c | Resolver `exportInsuranceDossier` 5-phase | resolvers | S5b | integration test 5-phase | S5b |
| S5d | Resolver `getInsuranceDossierVersions` passthrough | resolvers | S5b | integration test pagination | S5b |
| S5e | Auth guard + error mapping | auth + resolvers | S5c + S5d | role test + error code test | S5c, S5d |
| S5f | BFF contract test | tests/contract | S5e | SDL snapshot stable | S5e |

---

## 9. Business Rules enforced (BFF — secondary)

> BFF là secondary enforcement. Primary tại gf-accounting. BFF enforce: auth context, pipeline abort-on-fail, tenant scope.

| BR ID | Severity | Enforcement at BFF | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-INS-DOSSIER-010` | CORNERSTONE | Phase A abort nếu settlement status=CANCEL | `src/resolvers/insurance/exportInsuranceDossier.ts` | AC-9, AC-11 | gf-accounting trả 400/409 → BFF map `INS_STL_CANCELLED` |
| `BR-GF-ACCOUNTING-013` | CORNERSTONE | JWT role guard (accountant \| garage-owner) | `src/resolvers/insurance/exportInsuranceDossier.ts` | AC-13 | Reject nếu role không đủ |
| `BR-INS-DOSSIER-005` | NORMAL | Filter `isSelected=true` trong `selectedDocs` trước Phase B | `src/resolvers/insurance/exportInsuranceDossier.ts` | AC-9 | Chỉ render doc được chọn |
| `BR-INS-DOSSIER-011` | NORMAL | Compose tên file `{slug}_{settlementCode}_v{N+1}.pdf` trước Phase C upload | `src/resolvers/insurance/exportInsuranceDossier.ts` | AC-9 | Slug mapping: `QUOTATION_SHEET`→`bao-gia`, `SETTLEMENT_SHEET`→`quyet-toan`, `ACCEPTANCE_RECORD`→`bien-ban-nghiem-thu`, `PAYMENT_AUTHORIZATION`→`uy-quyen-nhan-tien` |
| `BR-INS-DOSSIER-006` | CORNERSTONE | KHÔNG expose mutation edit dossier đã xuất | schema (không có op edit) | AC-12 | Primary enforce tại BE; BFF không có op tương ứng |
| `BR-INS-DOSSIER-007` | NORMAL | Pipeline tạo bộ mới không phân biệt lần N — gf-accounting tự increment versionNo | `src/resolvers/insurance/exportInsuranceDossier.ts` | AC-11 | BFF không cần đặc biệt xử lý |

> **Primary BR enforcement** = BE tier `gf-accounting`. Xem `features/be/FEAT-INS-DOSSIER-CREATE.md §9`.

---

## 10. Test scope hand-off (BFF)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | BFF integration (query passthrough — BLOCKED NC-BFF-INS-001) | test-api | Mock gf-accounting GET /current → verify InsuranceDossier shape; null khi 404 |
| AC-2 | BFF integration (query passthrough) | test-api | Mock gf-accounting search → verify pagination mapping |
| AC-9 | BFF integration (mutation 5-phase) | test-api | Mock downstream per phase; verify Phase B abort skips C/D; verify Phase C abort skips D |
| AC-11 | BFF integration (tạo bộ mới) | test-api | Call mutation lần 2 cùng `settlementCode` → verify versionNo increment |
| AC-13 | BFF auth (RBAC) | test-isolation | Dual persona: `accountant`=OK, invalid role=`PERMISSION_DENIED`; tenant mismatch=`PERMISSION_DENIED` |
| AC-14 | BFF error mapping | test-api | Inject Phase B 422 → verify `INS_DOSSIER_RENDER_FAILED` + `extensions.documentType` |
| — | SDL contract snapshot | test-api | Schema lint + type snapshot — regression guard |
| — | N+1 guard | test-api | `exportInsuranceDossier` với 4 docs: verify inflight count = 4 (Phase B parallel) + 4 (Phase C parallel), không >4 sequential |

---

## 11. Cross-tier coordination (BFF perspective)

> Tham chiếu cross-tier chỉ read-only. BFF KHÔNG spec impl tier khác.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W02/Product/features/be/FEAT-INS-DOSSIER-CREATE.md` | DRAFT | Downstream REST endpoints (§6.2) — BFF resolver wrap. gf-accounting: render ③④ + batch persist + search. gf-sales: render ① baseline reuse. |
| FE Web | `Execution/wave-specs/W02/Product/features/fe-web/FEAT-INS-DOSSIER-CREATE.md` | DRAFT | Consume `exportInsuranceDossier` mutation + `getInsuranceDossierVersions` query từ §6.1 |
| Mobile | `Execution/wave-specs/W02/Product/features/mobile/FEAT-INS-DOSSIER-CREATE.md` | DRAFT | Consume `exportInsuranceDossier` mutation + `getInsuranceDossierVersions` query từ §6.1 |

**Source ID consistency** (item #18): `source_feat_sha = 6ca98b13841aae880a86d4dfde522867affcdfbf3179cb4c9d01f0b6051d9238` identical với BE/FE-web/Mobile files.

**ct-file-storage** là external integration (không có tier file riêng). BFF gọi `POST /api/v1/files/upload-files` multipart với `folderType=SETTLEMENTS` — pattern reuse từ baseline (đã production).

---

## 12. References

- **Source**: [`Product/features/FEAT-INS-DOSSIER-CREATE.md`](../../../../../Product/features/FEAT-INS-DOSSIER-CREATE.md) v21
- **Paired BE**: [`features/be/FEAT-INS-DOSSIER-CREATE.md`](../be/FEAT-INS-DOSSIER-CREATE.md)
- **GraphQL schema**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **ADR-016**: [`Architecture/decisions/ADR-016.md`](../../../../../Architecture/decisions/ADR-016.md) v11 — BFF orchestrator pattern, ct-file-storage, pdfUrl relative path, no signed URL
- **ADR-009**: [`Architecture/decisions/ADR-009.md`](../../../../../Architecture/decisions/ADR-009.md) — no JPA relationship mapping (BE context)
- **PKG**: [`Execution/wave-specs/W02/work-packages/PKG-W02-insurance-dossier.md`](../../../work-packages/PKG-W02-insurance-dossier.md)
- **Fan-out map**: [`Execution/wave-specs/W02/_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)
- **Bundle used**: `/tmp/exec-spec-bundles/W02/FEAT-INS-DOSSIER-CREATE.bff.md` (generated 2026-06-18T01:03:11+00:00)

---

## Related CRs

| CR ID | Title (short) | Status | Scope hint cho tier |
|---|---|---|---|
| [CR-20260622-01](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-01--ins-dossier-current-endpoint-contract) | Add `GET /api/v1/insurance-dossiers/current` endpoint | RAISED (pending Architecture) | Add op `getInsuranceDossierCurrent` |
| [CR-20260622-03](../../../../../../Tracking/CHANGE-REQUESTS.md#cr-20260622-03--ins-dossier-create-nav-expansion-to-push) | Reconcile §5.2 ExpansionTile → push nav 4 màn chi tiết | APPROVED MINOR self | §5 widget breakdown đồng bộ push nav (cascade từ mobile) |

---

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-18 | 1 | Delivery Authority + Architecture Authority | Initial BFF-tier spec cho FEAT-INS-DOSSIER-CREATE W02. Policy v2 tier-authoritative: §0 audit slim, §1 mục đích nghiệp vụ identical cross-tier, §2 trách nhiệm BFF orchestrator, §3 BFF behaviour map per 14 AC-IDs, §4 auth + perf + security + error mapping, §5 SDL delta (7 new types + 2 new ops), §6 ops contract + 5-phase resolver mapping (gf-accounting × 6 calls + gf-sales × 1 + ct-file-storage × 1), §7 file map (9 files ⊆ bffs/agg-garage-graph), §8 S5 DAG, §9 BR secondary, §10 test hand-off, §11 cross-tier pairs. ADR-016 v11 chốt BFF là orchestrator. |
| 2026-06-22 | 3 | Delivery Authority | Thêm section "Related CRs" — link sang CR Registry (`Tracking/CHANGE-REQUESTS.md`) cho 2 CR liên quan tier BFF: CR-20260622-01, CR-20260622-03. Không copy nội dung CR vào FEAT — chỉ link dẫn. |
| 2026-06-18 | 2 | Delivery Authority + Architecture Authority | REFINE (reviewer FAIL #18c + #17): (1) §1 replace với canonical wording byte-equal cross-tier per reviewer §18c. (2) Add op `getInsuranceDossierCurrent(settlementCode: ID!): InsuranceDossier` — AC-1 coverage gap fix (#17): frontmatter `graphql_ops`, §3 AC-1 re-mapped từ N/A, §5 SDL type `InsuranceDossier`, §6.1 op row + §6.2 resolver row, §7 file map, §10 test row. Flag NEED CONFIRMATION NC-BFF-INS-001: BE endpoint `GET /api/v1/insurance-dossiers/current` chưa tồn tại — raise CR-INS-DOSSIER-CURRENT-ENDPOINT trước khi BFF impl. |
