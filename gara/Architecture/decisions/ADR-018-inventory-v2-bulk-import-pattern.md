---
type: architecture
artifact_kind: adr
status: ACCEPTED
version: 1
tier: T1
owner_authority: Architecture Authority
boundary: gf-inventory
last_reviewed: "2026-06-23"
---

# ADR-018: Inventory V2 Bulk-Import — Follow gf-customer JSON-Body 2-Step Pattern (Phase 1, Row Cap 500)

## Status
ACCEPTED — 2026-06-23

## Context

`FEAT-CAT-PROD-IMPORT` cần import danh mục mã sản phẩm nội bộ (BR-CAT-PROD-017): bắt buộc preview lỗi/hợp lệ trước khi ghi, chỉ thêm mới (không update), template `.xlsx`, ghi nhóm trường "Thông tin chung" (KHÔNG SKU/ĐVT quy đổi/ảnh/tệp đính kèm). 

Câu hỏi chính: **Backend nhận import như thế nào?** Có 3 hướng:
- (A) **Multipart upload** — FE upload file `.xlsx`, BE parse bằng Apache POI inline.
- (B) **S3 + async (POI worker)** — FE upload S3, BE async process bằng background job.
- (C) **JSON body 2-step** — FE parse `.xlsx` browser-side (SheetJS), POST JSON `verify-import` → preview → POST JSON `import` → commit (theo gf-customer precedent).

**Constraints từ Product layer:**
- `BR-CAT-PROD-017`: chỉ thêm mới, mã trùng → đánh dấu `ERR-INV-007` và bỏ qua; preview lỗi/hợp lệ trước khi ghi; template `.xlsx`.
- `BR-CAT-PROD-019`: enum "Tính chất" 4 giá trị fixed, vi phạm → `ERR-INV-012`.

**Constraints từ team / runtime:**
- Source precedent (`gf-customer.knowledge-graph.yaml:92-120`):
  - `POST /api/v1/customers/verify-import` — JSON body `{customers: [...], skipDuplicates: bool}` → `{report: object}`.
  - `POST /api/v1/customers/import` — JSON body cùng schema → `{importId: string}`.
  - Active callers: `agg-garage-graph`.
  - Audit 2026-05-13 (KG line 1204): "request đổi từ file-upload sang JSON body ImportCustomerRequest" — explicit deprecate file-upload approach.
- garage-web đã có common pattern parse `.xlsx` browser-side (SheetJS phổ biến trong frontend stack).
- gf-inventory hiện KHÔNG có Apache POI dependency. Thêm POI = new runtime dep + maintenance.

**Business rules liên quan:** BR-CAT-PROD-017, BR-CAT-PROD-019, BR-CAT-GRP-013 (search tenant-scoped), CB-CAT-002 (UoM lookup).

## Decision

**Adopt Alternative C — JSON body 2-step pattern (match gf-customer precedent).** FE parse `.xlsx` browser-side; backend nhận JSON; row cap **500/request** (Phase 1).

Cụ thể:

- **Endpoints gf-inventory mới**:
  - `POST /api/v2/internal-products/verify-import` — JSON body `{items: [...], skipDuplicates: boolean}` → `{report: {summary, validRows, errorRows}}`.
  - `POST /api/v2/internal-products/import` — JSON body cùng schema → `{importId: string, importedCount, failedCount}`.

- **Schema `items[]`** = subset BR-CAT-PROD-017 "Thông tin chung":
  ```json
  {
    "code": "string (required, no special chars ~!@#$%^&*)",
    "name": "string (required)",
    "mainUomCode": "string (required, validated via gf-erp-mdm)",
    "CAR_BRAND": "string?",
    "origin": "string?",
    "nature": "VAT_TU_HANG_HOA|CCDC|DICH_VU|KHAC (default VAT_TU_HANG_HOA, BR-CAT-PROD-019)",
    "materialGroupCode": "string? (validated against material_group)",
    "productSpec": "string?",
    "technicalSpec": "string?"
  }
  ```
  KHÔNG bao gồm: SKU, ĐVT quy đổi, ảnh, tệp đính kèm, pricing_method (BR-CAT-PROD-017 explicit ignore).

- **Row cap 500/request** (Phase 1):
  - Enforce ở **BFF level** (`agg-garage-graph` resolver — limit `items.length` ≤ 500 trước khi forward).
  - Enforce ở **backend defensive** (gf-inventory reject `items.length > 500` với HTTP 400 + error code `ERR-INV-019` ("Vượt giới hạn 500 dòng/lần — vui lòng tách file")).
  - **BR proposal**: thêm `BR-CAT-PROD-020` đăng ký error code (BA review post-batch).
  - **R3 F5 flag (inline, no version bump)**: `BR-CAT-PROD-020` chính thức cần Business Authority sign-off để promote từ "proposed" → "active BR registry". Deferred cho BA review CR post-batch; design dựa "proposed" status cho phép enforce trong implementation (defensive cap đã định nghĩa ở ADR + API).

- **Validation flow** (`verify-import` + `import` cùng pipeline):
  1. Row-level: code regex (BR-CAT-PROD-002 → `ERR-INV-006`), required fields (BR-CAT-PROD-005), nature enum (BR-CAT-PROD-019 → `ERR-INV-012`).
  2. Reference: `mainUomCode` exist trong gf-erp-mdm catalog (REST `/protected/catalog/v1/inquiry`, batch + cache 5min); `materialGroupCode` exist trong `material_group` cùng tenant + status=ACTIVE (BR-CAT-GRP-008).
  3. Uniqueness: `code` chưa exist trong `internal_product` cùng tenant (BR-CAT-PROD-003 → `ERR-INV-007`).
  4. `errorRows[]` gom mọi error per row; `validRows[]` = rows pass mọi check.
  5. `verify-import` = read-only (no DB write); `import` = transactional write valid rows + return `importId` cho audit + skip error rows (BR-CAT-PROD-017).

- **NO server-side file handling**: KHÔNG Apache POI, KHÔNG multipart, KHÔNG S3 upload, KHÔNG Temporal/background job (sync inline đủ với 500 rows; p95 mục tiêu ≤ 5s).

- **Template `.xlsx`**: static asset trong garage-web (download link), cấu trúc cột match `items[]` schema. Cột "phương pháp tính giá" trong template **bị bỏ qua** (BR-CAT-PROD-017 + BR-CAT-PROD-010 — pricing_method hiện khóa, mọi mã default `WAC_PERIOD_END`).

- **GraphQL resolver** trong `agg-garage-graph`:
  - `Mutation verifyImportInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsReportResponse!` → REST `verify-import`.
  - `Mutation importInternalProducts(input: ImportInternalProductsInput!): ImportInternalProductsResultResponse!` → REST `import`.
  - Header forward: `Authorization`, `X-Tenant-Id`, `X-Branch-Id`.

**Threshold để re-evaluate (Phase 2 trigger):**
- Khi có yêu cầu import > 500 rows/request (BA confirm tăng cap).
- Khi cần async processing (vd background job, progress bar — vượt 5s p95).
- Khi cần update mode (hiện chỉ thêm mới — BR-CAT-PROD-017).

## Alternatives Considered

| Alternative | Pros | Cons | Tại sao không |
|---|---|---|---|
| **A. Multipart upload + Apache POI inline** | Atomic 1 request; standard pattern | Ngược pattern hiện hành (gf-customer đã explicit deprecate file-upload 2026-05-13); thêm POI dependency cho gf-inventory; payload limit cần config riêng; preview UX phức tạp hơn (2 round-trip vẫn cần) | Mâu thuẫn precedent gf-customer audit |
| **B. S3 + async POI worker** | Scale large file; non-blocking | Over-engineering cho 500 rows; thêm S3 setup + async coordination; UX phức tạp (polling/webhook) | Không match scale Phase 1; tăng complexity ops |
| **C. JSON body 2-step (chosen)** | Match precedent gf-customer; FE leverage SheetJS (đã common); BE chỉ JSON validation; preview natural fit; no new BE dep | Cap 500 rows giới hạn use case lớn; FE parse `.xlsx` cần dep client-side | — |

## Consequences

**Positive:**
- Match production precedent (`gf-customer` import) — reuse pattern + ops knowledge.
- Zero new backend dependency (no POI, no multipart parser, no S3 client).
- Preview UX natural: `verify-import` (no write) → user review report → `import` (commit) — match BR-CAT-PROD-017 mandate.
- Tenant isolation enforced cả 2 step qua `X-Tenant-Id` header (consistent với mọi v2 endpoint).
- Test surface đơn giản — chỉ test JSON contract + business validation, không multipart/file parsing.

**Negative:**
- **Row cap 500** — không hỗ trợ import file lớn. **Mitigation**: BFF + BE defensive enforce với clear error msg "tách file"; Phase 2 trigger khi BA confirm cần > 500.
- **FE depends on SheetJS** (browser-side parse) — extra client dep. **Mitigation**: garage-web đã có pattern; FE team document trong contract doc.
- **No audit của file gốc** (BE chỉ thấy JSON) — không reproduce được FE parse errors. **Mitigation**: `importId` trả về làm anchor cho audit log row-level + `internal_product_history`; FE log file metadata client-side nếu cần.

**Risks:**
- Risk: FE parse `.xlsx` sai format → JSON malformed → confusing UX. **Mitigation**: template `.xlsx` cố định + FE validate schema trước khi POST; helper text/sample.
- Risk: Race condition khi 2 user import cùng tenant cùng lúc → duplicate code trong cùng batch. **Mitigation**: backend uniqueness check per-row tại commit step (DB UNIQUE constraint backstop → trả `ERR-INV-007` cho row sau).

**Trade-off accept:** Accept Phase 1 cap 500 + browser-side parse đổi lấy zero new backend dep + match production precedent + simpler test surface + faster delivery.

## References

- [Product/epics/EP-INVENTORY-CATALOG.md](../../Product/epics/EP-INVENTORY-CATALOG.md) §4 (FEAT-CAT-PROD-IMPORT P1)
- [Product/business-rules/BR-GF-INVENTORY-CATALOG.md](../../Product/business-rules/BR-GF-INVENTORY-CATALOG.md) §BR-CAT-PROD-017, §BR-CAT-PROD-019
- [Tracking/arch-design-inventory-v2-answers-1.md](../../Tracking/arch-design-inventory-v2-answers-1.md) Q5 (verified precedent gf-customer KG:92-120 + audit 2026-05-13)
- [Execution/knowledge-graphs/gf-customer.knowledge-graph.yaml] lines 92-120, 1204 (verify-import/import + audit deprecate file-upload)
- Related ADRs: ADR-013 (deprecation convention — applies if cap raised later), ADR-017 (catalog v2 aggregates — InternalProduct entity)
- [Architecture/api/gf-inventory-api.md](../api/gf-inventory-api.md) §2 (new endpoints added)
- [Architecture/api/agg-garage-graph-graphql.md](../api/agg-garage-graph-graphql.md) (new resolvers)

## Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-06-23 | 1 | Architecture Authority | Initial ADR — JSON body 2-step pattern (verify-import → import) match gf-customer precedent; row cap 500 Phase 1 (BFF + BE defensive); no Apache POI / S3 / Temporal; FE parses .xlsx browser-side; subset schema per BR-CAT-PROD-017. |
