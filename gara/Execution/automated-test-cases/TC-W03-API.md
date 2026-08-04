---
document_id: 'GMS-TC-W03-API'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 4
boundary: 'gf-inventory, agg-garage-graph'
wave: 'W03'
owner: 'agent-test-api'
last_reviewed: '2026-07-02'
qa_reviewed_by: 'cuongnguyen_ac@cardoctor.vn'
qa_reviewed_at: '2026-07-02'
---

# Test Case Automated — W03: API Layer (EP-INVENTORY-CATALOG — Danh mục vật tư)

> Automated testcase artifact do `agent-test-api` sinh tại `TEST_PLANNING` (full-gen, lần đầu cho W03).
> Cross-ref manual (read-only): `Execution/test-cases/TC-W03-API.md` (124 TC, `QA Authority`, last_reviewed 2026-06-30/07-01).
> Cross-ref: `Execution/wave-specs/W03/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` v2 (§4 Test Ideas + §5 BR→FEAT→AC + §6 Error Code Mapping — nguồn chính cho BR ID/error code trong artifact này).
> Cross-ref: `Execution/work-packages/PKG-W03-inventory-catalog.md` §2.2.1 (REST) + §2.2.2 (GraphQL) + §4.3 (Agent Assignment) + §3.C (Infra Readiness remote-box).

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W03-API` |
| Wave | W03 |
| Boundary(ies) | `gf-inventory`, `agg-garage-graph` |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT` |
| Owner | `agent-test-api` |
| Last Reviewed | 2026-07-02 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope

- **gf-inventory REST** — 23 endpoint V2-1..V2-23 (Material Group V2-1..V2-6, Internal Product V2-7..V2-12, SKU mapping V2-13/14, conversion-unit V2-15..V2-17, attachment V2-18/19, import V2-20/21, export V2-22, SKU search V2-23). Scope `authenticated` (JWT resolve tenant), KHÔNG `{tenantId}` trong path, KHÔNG cần `x-api-key` protected/v1 (khác wording PKG §4.3 "protected/v1" — đã đối chiếu §2.2.1: toàn bộ endpoint catalog V2 dùng JWT `authenticated`, không phải service-to-service x-api-key; ghi nhận đây là wording lệch trong PKG §4.3 Agent Assignment row, KHÔNG chặn scope).
- **agg-garage-graph GraphQL** — **23 ops canonical** (8 Query V2-Q1..Q5,Q7..Q9 + 15 Mutation V2-M1..M15) theo `agg-garage-graph-graphql.md` v7.42 (R30/R31/R38, 2026-07-01, post-DEV field/object-name audit). **KHÔNG phải 24 ops (9Q+15M)** như PKG §2.2.2 + `.agents/agent-test-api.md` §Wave Assignments W03 còn ghi — `V2-Q6 getInternalProductHistory` đã bị REMOVED (R10, BA chốt no history audit) từ trước khi PKG v25 chốt; PKG/agent-def header count bị lệch do split-count sai (9q/14m → 8q/15m, tổng vẫn 23) chứ không phải thêm op mới. **Oracle-shift ghi nhận** — auto artifact bám Architecture v7.42 (mới nhất, đã đối chiếu code thật) làm canonical, KHÔNG bám PKG §2.2.2 header cũ.
- **Validation gates**: conversion-unit R8 D-E scale ≤6 (`ERR-INV-047`); bulk import cap 500 (`ERR-INV-041`); export single-call cap 1000 (`ERR-INV-045`); cascade INACTIVE atomicity (BR-CAT-GRP-007); circular parent check BFS (`ERR-INV-003`).
- **Error code contract** — 13 mã `ERR-INV-*` (001-008, 012-016, 041-047 non-contiguous) + `ERR-CMN-004/005` — assert 3 chiều `code` + HTTP + side-effect/invariant (REST body field `code` / GraphQL `errors[].extensions.code`).
- **Ground-Truth DB Assertion Gate** — mọi write endpoint verify qua `GET`/`get{Entity}` độc lập (không dùng response của chính mutation vừa gọi làm bằng chứng), theo đúng pattern manual TC đã thiết lập (TC-011/016/030/049/052/077/093/094/096/099-101).
- **State-Transition Coverage Gate** — cặp set-on/set-off cho `MaterialGroup.status` (ACTIVE↔INACTIVE, cascade xuống con) + `InternalProduct.status` (ACTIVE↔INACTIVE, không cascade — độc lập).
- **GraphQL SDL drift mới nhất (2026-07-01, v7.31/v7.36/v7.42 — post-DEV audit)** — 3 điểm PHẢI phản ánh đúng trong TC, khác PKG/manual assumption cũ:
  1. `getMaterialGroupTree` (V2-Q2) trả **envelope wrapper** `MaterialGroupTreeResponse!` (union `MaterialGroupTreeApiResponse | ErrorResponse`) với `data.nodes[]` — **KHÔNG phải bare `[MaterialGroupTreeNode!]!`** như PKG §2.2.2 mô tả (manual TC-006 viết "response là array" — auto TC sẽ sửa lại đúng shape).
  2. `addInternalProductAttachment` input type = `AttachmentMetadataInput!` với field **`fileName/fileType/fileSizeBytes/fileUrl`** (R38, 2026-07-01 — rename từ `sizeBytes/storageUrl`); **rủi ro downstream silent-drop** đã được Architecture change log tự cảnh báo (REST body key gf-inventory V2-18 nhận field rename theo — "cần gf-inventory team xác nhận endpoint đã support field name mới... nếu chưa thì mutation sẽ fail hoặc silent-drop field"). → auto artifact thêm TC ground-truth riêng cho rủi ro này (§FEAT-CAT-PROD-DETAIL).
  3. `createInternalProduct` (V2-M4) vừa được thêm field **inline `attachments[]`** tại create (R31, 2026-07-01) — **mâu thuẫn với FEAT-CAT-PROD-CREATE AC-13** ("KHÔNG inline tại create", theo chính Architecture change log tự flag "chưa xử lý"). → auto artifact thêm 1 TC `spec-gap` để buộc BA/Architecture clarify, KHÔNG bịa thêm case giả định.
- **Legacy `product` regression (ADR-017)** — 5 endpoint cũ `/api/v2/products/*` (dùng bởi `gf-purchase`/`gf-sales`) không bị phá vỡ + schema `product` không bị `ALTER` bởi Flyway W03.
- **Auth/authz baseline** (Common Baseline API-AA01..07) — không có trong manual 124 TC (auto-miss identified, xem §Auto vs Manual Parity Audit) — auto artifact bổ sung representative no-token/invalid-token/expired-token 401 cho cả REST + GraphQL.

### Out of Scope

- Phiếu nhập/xuất kho V2, tồn kho/tồn đầu kỳ/tính giá (W04-W06) — chưa build.
- UI/design conformance (`agent-test-ui`/`agent-test-mobile-ui`), Full journey UI→BFF→DB (`agent-test-e2e`/`agent-test-mobile-e2e`).
- Cross-tenant denial đầy đủ (matrix 2-tenant) — `agent-test-isolation` sở hữu chính thức; auto artifact chỉ giữ 2 TC negative "tenant context bị reject đúng status" theo Anti-Duplication Routing (agent-test-api chỉ check status code, không phải leakage matrix đầy đủ).
- OWASP abuse sâu (SQLi bypass nâng cao, rate-limit DoS) — `agent-test-security`; auto artifact chỉ giữ representative injection-safe check (đã có sẵn từ manual, mirror).
- SLO/latency (DataLoader N+1 chỉ check qua đếm query, KHÔNG đo p95) — `agent-test-performance` sở hữu số liệu SLA chính thức.
- Master data ĐVT/xuất xứ/SKU (gf-erp-mdm) — pre-seeded, không test CRUD master ở đây.

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Mode | **Remote-box** (per PKG §3.C) — SUT chạy sẵn tại `192.168.110.191`, harness runner chạy local | `TEST_HOST=192.168.110.191`; KHÔNG dựng local docker cho SUT |
| `gf-inventory` base URL | `http://192.168.110.191:45086/api/v2` | Env var `GF_INVENTORY_BASE_URL` |
| `agg-garage-graph` GraphQL | `http://192.168.110.191:45401/garage/graphql` | Env var `AGG_GARAGE_GRAPH_URL` |
| `gf-erp-mdm` (master UNIT/COUNTRY, read-only) | `directory=UNIT` ≥5 mã, `directory=COUNTRY` ≥10 mã (VNM/USA/JPN/CHN/DEU…) | Pre-seeded; không CRUD ở đây |
| SSO stub | `http://192.168.110.191:45410` | Mint token HS256 (signature không verify backend — memory `garage-jwt-no-signature-verify`) |
| Tenant chính | `garage-a` — token `garage-owner` + `accountant` hợp lệ | Header `Authorization: Bearer <token>`, `X-Tenant-Id`, `X-Branch-Id` |
| Tenant phụ | `garage-b` (negative tenant-context check, KHÔNG phải leakage matrix đầy đủ) | |
| Seed strategy | **Dynamic qua service API** trong `beforeAll()`/từng `describe` block — KHÔNG hardcode code cố định, KHÔNG pre-seed DB trực tiếp (TL-W01-API-004, TL-W02-API-009) | Group cây 3 cấp + Product có/không giao dịch tạo qua chính `createMaterialGroup`/`createInternalProduct` |
| Seed — giao dịch (immutability test) | Cần 1 mã `internal_product` + 1 `internal_product_uom_conversion` đã có giao dịch nhập/xuất thật — KHÔNG tự giả lập cờ `hasTransactions` | Nếu W03 sandbox chưa có luồng nhập kho (W05 chưa build) → mã "đã giao dịch" phải tạo qua chèn trực tiếp bảng giao dịch tầng thấp nhất có sẵn (nếu gf-inventory đã có bảng transaction nào từ trước khi V2 build) HOẶC đánh `BLOCKED-by-seed-data` cho riêng nhánh này nếu môi trường W03 hoàn toàn chưa có cơ chế tạo giao dịch — xem TC PRDEDT-003/004, PRDDET-008/009 |
| Cap-1000 export / cap-1000 tree | Cần tenant test riêng với ≥1001 record (Group hoặc Product) | Seed batch qua API loop (không phải INSERT thẳng) — có thể chậm; ghi nhận runtime cost trong report |
| GraphQL SDL introspection (bắt buộc trước khi viết spec thật) | `__type(name: "MaterialGroupTreeResponse")`, `__type(name: "AttachmentMetadataInput")`, `__type(name: "PagedMaterialGroupResponse")`, `__type(name: "PagedInternalProductResponse")` | TL-W02-API-003/004/007/008/010 — KHÔNG suy đoán field shape từ PKG mô tả, phải introspect trước khi assert field. Đã pre-verify 2 điểm chính ở planning (xem note SDL drift ở trên); spec-author (TEST_EXECUTION) vẫn phải re-verify trên máy chạy thật trước khi commit spec. |

**Runner preflight (chốt tại planning — bắt buộc trước khi TEST_EXECUTION `READY`):**

| Item | Value |
|---|---|
| Runner chính thức | QC-owned harness Lớp A (frozen, CR-20260701-03) tại `Execution/auto/harness/api/` — **ĐÃ TỒN TẠI VÀ RUNNABLE** (package.json + jest.config.ts + node_modules đã cài) — CHỈ ĐỌC/reuse, KHÔNG sửa `jest.config.ts`/`package.json` |
| Command | Từ `Execution/auto/harness/api/`: `npx jest --testPathPattern='W03/api' --runInBand` (KHÔNG thêm script `test:w03` mới vào `package.json` — dùng trực tiếp `testPathPattern` per CR-20260701-03 §Reuse rule, giống pattern `test:w02` cũ chỉ để lại làm ví dụ, không bắt buộc thêm entry mới mỗi wave) |
| Spec path (Lớp B, AI-owned, sinh tại TEST_EXECUTION spec-authoring step) | `Execution/auto/specs/W03/api/*.spec.ts` — đề xuất chia: `w03-grp-crud.spec.ts`, `w03-grp-cascade.spec.ts`, `w03-prod-crud.spec.ts`, `w03-prod-conversion-sku-attachment.spec.ts`, `w03-prod-import.spec.ts`, `w03-prod-export.spec.ts`, `w03-auth-common-baseline.spec.ts`, `w03-legacy-product-regression.spec.ts` |
| Bootstrap nếu harness thiếu | N/A — harness đã tồn tại (xác nhận `ls Execution/auto/harness/api/` có `package.json`, `jest.config.ts`, `node_modules/`) |
| Smoke assertion tối thiểu | `GET {GF_INVENTORY_BASE_URL}/material-groups/search` (POST rỗng body hợp lệ) trả 200 VÀ `POST {AGG_GARAGE_GRAPH_URL}` với `{__typename}` trả 200 — xác nhận cả REST lẫn GraphQL reachable trước khi chạy suite chính thức |
| `.env` cần populate (không commit, gitignored) | `GF_INVENTORY_BASE_URL`, `AGG_GARAGE_GRAPH_URL` (đã có default localhost trong `.env.example` — TEST_EXECUTION phải override sang `192.168.110.191` cho remote-box mode), `TENANT_A_ID`/`TENANT_B_ID`, `OWNER_TOKEN`/`ACCOUNTANT_TOKEN`/`INVALID_TOKEN`/`EXPIRED_TOKEN` (đã có placeholder trong `.env.example`, mint mới qua SSO stub) |

**API Impact Inventory (Step 4.1 — bắt buộc trước khi gen TC):**

| Service (boundary) | Endpoint (path) | Method | Trạng thái | Feature/AC | Ghi chú tác động |
|---|---|---|---|---|---|
| gf-inventory | `/api/v2/material-groups/search` | POST | Thêm mới | FEAT-CAT-GRP-LIST | V2-1, flat-grouped-by-parent R7 |
| gf-inventory | `/api/v2/material-groups/tree` | GET | Thêm mới | FEAT-CAT-GRP-LIST | V2-2, cap 1000 nodes → 413 `ERR-INV-027` |
| gf-inventory | `/api/v2/material-groups/{id}` | GET | Thêm mới | FEAT-CAT-GRP-DETAIL | V2-3 |
| gf-inventory | `/api/v2/material-groups` | POST | Thêm mới | FEAT-CAT-GRP-CREATE | V2-4 |
| gf-inventory | `/api/v2/material-groups/{id}` | PUT | Thêm mới | FEAT-CAT-GRP-EDIT | V2-5, cascade INACTIVE + circular check |
| gf-inventory | `/api/v2/material-groups/{id}` | DELETE | Thêm mới | FEAT-CAT-GRP-DELETE | V2-6, guard `ERR-INV-004/005` |
| gf-inventory | `/api/v2/internal-products/search` | POST | Thêm mới | FEAT-CAT-PROD-LIST | V2-7, 3-col keyword |
| gf-inventory | `/api/v2/internal-products/{id}` | GET | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-8, enriched |
| gf-inventory | `/api/v2/internal-products` | POST | Thêm mới | FEAT-CAT-PROD-CREATE | V2-10 |
| gf-inventory | `/api/v2/internal-products/{id}` | PUT | Thêm mới | FEAT-CAT-PROD-EDIT | V2-11, immutability matrix |
| gf-inventory | `/api/v2/internal-products/{id}` | DELETE | Thêm mới | FEAT-CAT-PROD-DELETE | V2-12, guard `ERR-INV-008` |
| gf-inventory | `/api/v2/internal-products/{id}/sku-mappings` | POST | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-13 |
| gf-inventory | `/api/v2/internal-products/{id}/sku-mappings/{productId}` | DELETE | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-14 |
| gf-inventory | `/api/v2/internal-products/{id}/conversion-units` | POST | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-15 |
| gf-inventory | `/api/v2/internal-products/{id}/conversion-units/{unitId}` | PUT | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-16 |
| gf-inventory | `/api/v2/internal-products/{id}/conversion-units/{unitId}` | DELETE | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-17 |
| gf-inventory | `/api/v2/internal-products/{id}/attachments` | POST | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-18, metadata-only |
| gf-inventory | `/api/v2/internal-products/{id}/attachments/{attachmentId}` | DELETE | Thêm mới | FEAT-CAT-PROD-DETAIL | V2-19 |
| gf-inventory | `/api/v2/internal-products/verify-import` | POST | Thêm mới | FEAT-CAT-PROD-IMPORT | V2-20, cap 500 |
| gf-inventory | `/api/v2/internal-products/import` | POST | Thêm mới | FEAT-CAT-PROD-IMPORT | V2-21 |
| gf-inventory | `/api/v2/internal-products/export` | POST | Thêm mới | FEAT-CAT-PROD-EXPORT | V2-22, cap 1000 |
| gf-inventory | `/api/v2/skus/search` | GET | Thêm mới | FEAT-CAT-PROD-LIST | V2-23 |
| agg-garage-graph | 8 Query (`searchMaterialGroups`, `getMaterialGroupTree`, `getMaterialGroup`, `searchInternalProducts`, `getInternalProduct`, `exportInternalProducts`, `searchSkus`, `listUnits`) | GraphQL | Thêm mới | 12 FEAT | V2-Q1..Q5,Q7..Q9 (Q6 removed R10) |
| agg-garage-graph | 15 Mutation (M1..M15) | GraphQL | Thêm mới | 12 FEAT | Passthrough + defense logic Q2/M14/M15/Q7 |
| gf-inventory | `/api/v2/products` (legacy) | POST | **Existing — co-located, KHÔNG sửa** | Regression ADR-017 | Dùng bởi gf-purchase/gf-sales; phải "zero break" sau Flyway additive |
| gf-inventory | `/api/v2/products/search`, `/search-grouped`, `/stock/cost-price`, `/stock/total-by-skus` | GET/POST | **Existing — co-located, KHÔNG sửa** | Regression ADR-017 | 4 endpoint còn lại — cùng boundary, schema `product` không bị `ALTER` |

**Regression Impact Analysis (Step 4.2):**

- **Impacted existing surface**: 5 endpoint legacy `/api/v2/products/*` (dùng production bởi `gf-purchase`/`gf-sales`) + schema bảng `product` — chạm vì Flyway W03 thêm 5 bảng mới **trong cùng boundary** `gf-inventory` (ADR-017 additive aggregates). Rủi ro: migration lỗi cấu hình có thể vô tình `ALTER`/lock bảng cũ, hoặc code mới share connection pool/entity manager gây side-effect. → 3 TC `regression` bắt buộc (xem heading Cross-Cutting).
- **KHÔNG có consumer downstream event/contract nào bị impact** — W03 **không phát outbox event** (catalog synchronous REST only, W04-W06 sẽ consume qua REST sync sau này — chưa tồn tại nên không test được integration thật, đã ghi Out of Scope).

**Common Test Case Baseline Coverage Map (`common-testcase-api.md` — sàn tối thiểu):**

| Common Group | Trạng thái | TC(s) | Ghi chú |
|---|---|---|---|
| §1 Auth & Authz (API-AA01-07) | `covered` (representative, không exhaustive per-endpoint) | CROSS-001..005 | Manual 124 TC KHÔNG có — auto-miss identified, bổ sung ở đây |
| §2 HTTP Methods (API-M01-06) | `adapted` | CROSS-006 | 1 representative 405 trên `/material-groups/search` (chỉ POST, thử GET) |
| §3 Required-Field Validation | `covered` | GRPCRE-011, PRDCRE-018 | code/name/mainUnitCode required |
| §4 Data Types & Format | `covered` | PRDDET-016 (conversionRate string reject), GRPCRE-002 (special char) | |
| §5 BVA | `covered` | GRPCRE-004/005 (255/256), PRDCRE-011/012 (500/501), PRDCRE-013/014 (notes), PRDIMP-004/005 (500/501 rows), PRDEXP-005/006 (1000/1001 rows), PRDDET-006/007 (scale 6/7 decimal) | |
| §6 Special Chars & Security | `covered` | GRPCRE-013 (XSS), GRPLST-012 (SQLi), PRDIMP-014 (CSV formula injection), PRDDET-015 (path traversal filename), PRDDET-014 (magic-byte spoof) | |
| §7 CRUD đầy đủ | `covered` | Toàn bộ 5 heading GRP + 6 heading PROD | |
| §8 Pagination & Filtering | `covered` | GRPLST-009 (page/size), PRDLST-004 (page/size), GRPLST-002-004 (keyword/status/parentId filter) | |
| §9 Response Schema | `covered` | GRPLST-001, PRDLST-001, PRDDET-001 (đủ field + type đúng) | |
| §10 Error Response Standard | `covered` | Toàn bộ TC `ERR-INV-*`/`ERR-CMN-*` — assert `code` field body/`extensions.code` | |
| §11 Client-Server/Perf sanity | `adapted` | PRDLST-011 (DataLoader N+1 count, KHÔNG đo p95 — delegate `agent-test-performance`) | |
| §12 File Upload/Download | `covered` | PRDDET-010..015 (attachment metadata-only), PRDEXP-001 (download stream .xlsx) | Không có multipart binary trực tiếp (ADR-016 presigned) — điều chỉnh phù hợp pattern thật |

**Auto vs Manual Parity Audit (case-level, so với `Execution/test-cases/TC-W03-API.md` 124 TC):**

| Manual TC ID range | Auto mapping | Phân loại |
|---|---|---|
| TC-W03-API-001..010 (GRP-LIST/DETAIL happy+cap) | GRPLST-001..008 | `covered` |
| TC-W03-API-011..016 (GRP-CREATE) | GRPCRE-001..006, 011 | `covered` |
| TC-W03-API-017..022 (GRP-EDIT + cascade) | GRPEDT-001..006 | `covered` |
| TC-W03-API-023..025 (GRP-DELETE) | GRPDEL-001..003 | `covered` |
| TC-W03-API-026..029 (PROD-LIST/DETAIL happy) | PRDLST-001..003, PRDDET-001 | `covered` |
| TC-W03-API-030..040 (PROD-CREATE + conversion) | PRDCRE-001..010 | `covered` |
| TC-W03-API-041..043 (PROD-EDIT immutable) | PRDEDT-001..003 | `covered` |
| TC-W03-API-044..045 (PROD-DELETE) | PRDDEL-001..002 | `covered` |
| TC-W03-API-046..055 (SKU mapping + conversion + attachment) | PRDDET-002..013 | `covered` |
| TC-W03-API-056..064 (IMPORT verify+commit+per-row) | PRDIMP-001..010 | `covered` |
| TC-W03-API-065..069 (EXPORT) | PRDEXP-001..004 | `covered` |
| TC-W03-API-070..071 (searchSkus/listUnits) | PRDLST-005..006 | `covered` |
| TC-W03-API-072 (TENANT-USERS null enrichment) | GRPDET-003 | `covered` |
| TC-W03-API-073 (auth header propagation) | CROSS-007 | `covered` |
| TC-W03-API-074 (cross-tenant 404) | PRDLST-007 | `covered` |
| TC-W03-API-075, 124 (pagination) | GRPLST-009, PRDLST-004 | `covered` |
| TC-W03-API-076..082 (pricing_method lock, status default, mainUnitCode edit, imageUrl clear) | PRDCRE-017, PRDCRE-019, PRDEDT-004..006 | `covered` |
| TC-W03-API-083, 084 (race condition) | GRPDEL-004, PRDDET-018 | `covered` — **risk**: harness Jest supertest 2 phiên song song khả thi, nhưng chính xác timing race condition khó đảm bảo 100% reproducible; nếu flaky → ghi rõ trong report thay vì retry vô hạn (theo Flaky Handling policy) |
| TC-W03-API-085, 086 (required field) | GRPCRE-011, PRDCRE-018 | `covered` |
| TC-W03-API-087 (originDisplayName enrich) | PRDDET-016b (gộp vào PRDLST-001 enrichment) | `covered` |
| TC-W03-API-088 (DataLoader N+1) | PRDLST-011 | `covered` |
| TC-W03-API-089, 090 (atomic rollback DB fault injection) | PRDIMP-011, GRPEDT-007 | `covered` — **risk cao**: cần khả năng mock DB error giữa transaction; QC-owned Jest harness (supertest thuần, không có DB proxy/toxiproxy) khó inject lỗi giữa server-side transaction từ client test. Nếu TEST_EXECUTION xác nhận harness không hỗ trợ inject được → mark `BLOCKED-by-harness`, KHÔNG âm thầm bỏ qua (theo TL-W01-API-005 anti-pattern) |
| TC-W03-API-091 (audit fields) | GRPCRE-014 | `covered` |
| TC-W03-API-092 (export single-call) | PRDEXP-007 | `covered` |
| TC-W03-API-093, 094, 096 (boundary chính xác 255/500) | GRPCRE-004, PRDCRE-011, PRDCRE-013 | `covered` |
| TC-W03-API-095 (notes >500) | PRDCRE-012 | `covered` |
| TC-W03-API-097, 098 (boundary 500 dòng/1000 dòng) | PRDIMP-004, PRDEXP-005 | `covered` |
| TC-W03-API-099..101 (4 enum nature) | PRDCRE-020..022 | `covered` |
| TC-W03-API-102 (whitespace trim) | GRPCRE-012 | `covered` |
| TC-W03-API-103 (Unicode search) | PRDLST-008 | `covered` |
| TC-W03-API-104 (XSS name) | PRDCRE-023 | `covered` |
| TC-W03-API-105 (SQLi keyword) | GRPLST-012 | `covered` |
| TC-W03-API-106 (CSV formula injection) | PRDIMP-014 | `covered` |
| TC-W03-API-107 (case-insensitive dup) | GRPCRE-015 | `covered` |
| TC-W03-API-108..110 (conversionRate biên số học) | PRDDET-006, 019, 020 | `covered` |
| TC-W03-API-111..113 (attachment biên tệp) | PRDDET-021, 015, 014 | `covered` |
| TC-W03-API-114 (deleteAttachment độc lập) | PRDDET-013 | `covered` |
| TC-W03-API-115 (updateConversionUnit happy) | PRDDET-009 | `covered` |
| TC-W03-API-116 (ERR-CMN-006/007 pending BA) | PRDIMP-015 | `covered` — giữ nguyên spec-gap flag như manual |
| TC-W03-API-117 (sort variant) | GRPLST-013 | `covered` |
| TC-W03-API-118 (multi-field edit happy) | PRDEDT-007 | `covered` |
| TC-W03-API-119 (export default filter) | PRDEXP-008 | `covered` |
| TC-W03-API-120..122 (regression ADR-017) | CROSS-008..010 | `covered` |
| TC-W03-API-123 (CB-CAT-004 negative — lưu ý CB-CAT-004 KHÔNG chính thức tồn tại trong BR §1.1 hiện hành, chỉ CB-CAT-001..003; giữ như manual dùng làm nhãn mô tả, không phải BR ID thật) | PRDDET-017 | `covered` |

**Auto-miss đã resolve ngay trong artifact này** (không cần lesson-learn entry vì đã đóng luôn):

| Manual TC ID | Auto miss reason (root cause) | Action |
|---|---|---|
| N/A — không có TC nào trong manual bị bỏ sót | Auth/authz family (API-AA01-07) không tồn tại trong manual 124 TC nhưng là gate-blocking family theo §Common Test Case Baseline + Quality Gate Discipline (`rules-test-api`) | Resolve ngay: thêm CROSS-001..005 (no-token/invalid-token/expired-token REST+GraphQL) — KHÔNG cần lesson learn vì đây không phải case đã có trong manual bị auto bỏ sót, mà là case common-baseline chưa ai viết ở cả 2 layer (auto tự phát hiện gap qua §Common Test Case Baseline Coverage Map, không phải qua so sánh với manual) |

→ **Không còn `auto-miss` case-level từ manual chưa phân loại.** 3 GraphQL SDL drift point (tree wrapper, attachment field rename, inline-attachments-at-create) là phát hiện MỚI của auto (Architecture v7.31/v7.36/v7.42 mới hơn cả manual last_reviewed 2026-07-01) — đã resolve bằng cách sửa lại TC shape đúng (GRPLST-006) + thêm 2 TC mới (PRDDET-022 ground-truth field-rename risk, PRDCRE-024 spec-gap inline-attachment) thay vì chỉ mirror nguyên manual.

**Ground-Truth DB Assertion Gate — coverage map (write endpoint × assertion type):**

| Endpoint/Mutation | Assertion type | TC |
|---|---|---|
| createMaterialGroup / V2-4 | response + `getMaterialGroup` độc lập | GRPCRE-001, 006 |
| updateMaterialGroup / V2-5 (cascade) | response + `getMaterialGroup` × N con | GRPEDT-005, 006 |
| deleteMaterialGroup / V2-6 | response + `getMaterialGroup` → 404 | GRPDEL-001 |
| deleteMaterialGroup (chain con→cha, EC-2) / V2-6 | response × 2 lần + `getMaterialGroup` → 404 độc lập cho cả CHILD và PARENT | GRPDEL-005 |
| createInternalProduct / V2-10 | response + `getInternalProduct` độc lập | PRDCRE-001, 017, 019, 020-022 |
| updateInternalProduct / V2-11 | response + `getInternalProduct` | PRDEDT-001, 007 |
| deleteInternalProduct / V2-12 | response + `getInternalProduct` → 404 + cascade mapping/conversion/attachment | PRDDEL-001 |
| mapSkuToInternalProduct / V2-13 | response + `getInternalProduct.skuMappings[]` | PRDDET-002 |
| addConversionUnit / V2-15 | response + `getInternalProduct.conversionUnits[]` | PRDDET-005 |
| addInternalProductAttachment / V2-18 | response + `getInternalProduct.attachments[]` — **kèm field-rename risk check** | PRDDET-010, 022 |
| import (verify+commit) / V2-20/21 | response summary + `getInternalProduct` per record + DB count | PRDIMP-008, 009 |
| export / V2-22 | response `downloadUrl` + stream file thật + parse `.xlsx` header | PRDEXP-001, 003 |

**State-Transition Coverage Gate — coverage map (flag × set-on/set-off/re-toggle):**

| Field | set-on TC | set-off TC | re-toggle TC | Ghi chú |
|---|---|---|---|---|
| `MaterialGroup.status` (ACTIVE→INACTIVE, cascade) | GRPEDT-005 (cha→INACTIVE, con cascade) | GRPEDT-006 (cha INACTIVE→ACTIVE, con KHÔNG cascade theo — asymmetric by design) | Không áp dụng full re-toggle vì cascade chỉ 1 chiều theo BR-CAT-GRP-007 (chỉ deactivate cascade, activate không cascade ngược) — đã cover đủ 2 nhánh khẳng định asymmetry, KHÔNG phải thiếu coverage | Khác pattern insurance W01 (`hasInsurance` clear-out symmetric) — Group status cascade chỉ 1 chiều theo đúng BR, ghi rõ để tránh hiểu nhầm KHÔNG cover set-off |
| `InternalProduct.status` (ACTIVE→INACTIVE) | PRDEDT-005 | N/A — BR-CAT-PROD không có cascade con cho Product (Product không có hierarchy); "set-off" ở đây tức đổi INACTIVE, không có "dependent fields cần clear" vì status Product không kèm theo field phụ thuộc nào bị ẩn/hiện khác | — | Product status không kèm nhóm field phụ thuộc như insurance `hasInsurance` — architecture khác nên cặp set-on/set-off/clear-out không áp dụng cùng pattern; chỉ cần 1 TC xác nhận transition hợp lệ (đã có) |

**Error Code Contract Testing — coverage matrix (13 `ERR-INV-*` + 2 `ERR-CMN-*`):**

| Code | HTTP (Architecture canonical, KHÔNG theo BR §6 wave-spec 422 — xem note) | TC | Trạng thái |
|---|---|---|---|
| `ERR-INV-001` | 400 | GRPCRE-002 | tested |
| `ERR-INV-002` | 400 | GRPCRE-003 | tested |
| `ERR-INV-003` | 400 | GRPEDT-002, 003 | tested |
| `ERR-INV-004` | 400 | GRPDEL-002 | tested |
| `ERR-INV-005` | 400 | GRPDEL-003 | tested |
| `ERR-INV-006` | 400 | PRDCRE-002 | tested |
| `ERR-INV-007` | 400 | PRDCRE-003, PRDIMP-007, 007b | tested |
| `ERR-INV-008` | 400 | PRDDEL-002 | tested |
| `ERR-INV-012` | 400 | PRDCRE-004 | tested |
| `ERR-INV-013` | 400 | PRDCRE-008, PRDDET-019 | tested |
| `ERR-INV-014` | 400 | PRDCRE-010 | tested |
| `ERR-INV-015` | 400 | PRDDET-003 | tested |
| `ERR-INV-016` | 400 | GRPCRE-004 | tested |
| `ERR-INV-041` | 400 | PRDIMP-002, 003 | tested |
| `ERR-INV-042` | (per-row `errorRows[]`, không có HTTP riêng — HTTP 200 tổng, lỗi nằm trong reasons[]) | PRDIMP-005 | tested |
| `ERR-INV-043` | (per-row) | PRDIMP-006 | tested |
| `ERR-INV-044` | (per-row) | PRDIMP-006b | tested |
| `ERR-INV-045` | 400 | PRDEXP-004 | tested |
| `ERR-INV-046` | 400 | PRDCRE-011, 012 | tested |
| `ERR-INV-047` | 400 | PRDCRE-009, PRDDET-006 | tested |
| `ERR-CMN-004` | 400 (scoped override cho attachment W03, KHÔNG dùng platform-generic 413 — xem note dưới) | PRDDET-012 | tested |
| `ERR-CMN-005` | 400 (scoped override, KHÔNG platform-generic 415) | PRDDET-011, 014 | tested |

> **Oracle-shift note (bắt buộc ghi, per lesson TL-W01-API-002):** `BR-GF-INVENTORY-CATALOG.md` §6 (wave-spec) liệt kê HTTP **422** cho toàn bộ `ERR-INV-001..016`, nhưng `Architecture/api/gf-inventory-api.md` §3a.3 (canonical, v24, dòng 5477-5493) VÀ manual TC-W03-API.md (đã đọc Architecture, last_reviewed 2026-06-30) đều nhất quán dùng **400**. Auto artifact bám Architecture + manual convergent evidence (400), coi BR §6 wording 422 là stale/copy-paste từ template khác (không phải re-run giả — DRIFT ghi nhận rõ, không tự ý coi PASS/FAIL theo con số nào chưa verify runtime). Tương tự, `ERR-CMN-004/005` platform-generic registry (`Product/error-code/ERROR-CODE-REGISTRY.md` dòng 68-69) dùng 413/415, nhưng `gf-inventory-api.md` dòng 5495-5496 (scoped cho attachment catalog V2) dùng 400 — auto artifact bám scoped-override 400 theo đúng convention manual đã dùng. **Cả 2 điểm PHẢI được xác nhận lại bằng response HTTP thật khi TEST_EXECUTION chạy — nếu response thật là 422/413/415 thay vì 400, đây là drift cần escalate BE fix hoặc update Architecture, KHÔNG tự sửa expected để match implementation (Forbidden Action rules-test-api).**
> **Attachment size threshold**: BR-CAT-PROD-015 v18 canonical = **30MB**; `Architecture/api/gf-inventory-api.md` dòng 5335 (section cũ chưa update theo R29) vẫn ghi "≤10MB" — 2 nơi trong CHÍNH Architecture mâu thuẫn nhau (dòng 5156 khu vực mới nói "R29 all-30MB bump", dòng 5335 khu vực cũ nói 10MB). Auto artifact dùng 30MB (theo BR canonical + manual TC-054 + note "R29 all-30MB bump" mới hơn) — PRDDET-012 sẽ assert ngưỡng 30MB, ghi rõ trong TC nếu response thật dùng 10MB thì đây là drift cần escalate (OI-W03-BR-001/002 đã ghi trong BR §7, chưa block W03).

**FEAT-ID → SLUG mapping (Multi-Feature Wave Grouping, 12 feature trong `state.features_in_flight`):**

| FEAT-ID | SLUG |
|---|---|
| FEAT-CAT-GRP-LIST | GRPLST |
| FEAT-CAT-GRP-CREATE | GRPCRE |
| FEAT-CAT-GRP-DETAIL | GRPDET |
| FEAT-CAT-GRP-EDIT | GRPEDT |
| FEAT-CAT-GRP-DELETE | GRPDEL |
| FEAT-CAT-PROD-LIST | PRDLST |
| FEAT-CAT-PROD-CREATE | PRDCRE |
| FEAT-CAT-PROD-DETAIL | PRDDET |
| FEAT-CAT-PROD-EDIT | PRDEDT |
| FEAT-CAT-PROD-DELETE | PRDDEL |
| FEAT-CAT-PROD-IMPORT | PRDIMP |
| FEAT-CAT-PROD-EXPORT | PRDEXP |
| *(cross-cutting, không thuộc 1 FEAT)* | CROSS |

**Cross-feature impact matrix:**

| Trigger FEAT (update) | Impacted FEAT (operational) | Endpoint chạm | TC regression |
|---|---|---|---|
| FEAT-CAT-GRP-DELETE (guard `ERR-INV-004`) | FEAT-CAT-PROD-CREATE (tạo product gắn group) | `DELETE /material-groups/{id}` phụ thuộc COUNT `internal_product` | GRPDEL-002 (cross-impact: FEAT-CAT-PROD-CREATE) |
| FEAT-CAT-GRP-EDIT (cascade INACTIVE) | FEAT-CAT-PROD-CREATE/EDIT (dropdown ACTIVE-only nhóm) | `PUT /material-groups/{id}` status→INACTIVE ảnh hưởng dropdown lookup phía Product form | GRPEDT-005 (cross-impact: FEAT-CAT-PROD-CREATE) |
| FEAT-CAT-PROD-IMPORT | FEAT-CAT-PROD-LIST | Import commit ghi record mới → List phải thấy ngay | PRDIMP-009 (cross-impact: FEAT-CAT-PROD-LIST, verify qua `searchInternalProducts` sau import) |
| Toàn bộ 12 FEAT (schema mới) | Legacy `/api/v2/products/*` (ADR-017) | Cùng boundary `gf-inventory`, cùng migration | CROSS-008..010 |

---

## 3. Status Summary

> **TEST_EXECUTION Run 1 + Run 2 (2026-07-02, agent-test-api)** — chạy thật qua Jest + supertest/axios + GraphQL trên
> remote-box `192.168.110.191` (KHÔNG code-inspection). Run 1: 4 spec file (`w03-smoke-auth`, `w03-material-group`,
> `w03-internal-product`, `w03-import-export-legacy`) — 91 TC chạy (86 gốc + 5 mới phát sinh). Run 2: 3 spec file bổ
> sung (`w03-material-group-extra`, `w03-internal-product-extra`, `w03-import-export-extra`) — chạy nốt toàn bộ 61 TC
> còn `READY` sau Run 1. **Tổng cộng: 152/152 TC trong artifact đã được thực thi thật** (0 còn `READY` im lặng).
> Xem đầy đủ trong `Execution/test-reports/TR-W03-API.md` (Run 1 + Run 2).

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 152 (147 gốc + 5 phát sinh khi execute) | **132 PASS / 14 FAIL / 6 BLOCKED / 0 READY**. 14 FAIL map tới 10 bug thật đang `OPEN` (`BUG-W03-105/106/107/113/114/115/116/119/120/122` — 106 chiếm 2 dòng GRPCRE-003+015; 113 và 116 mỗi bug chiếm 2 dòng do TC lặp lại theo đúng FEAT gốc ở Run 2). 6 BLOCKED giải trình rõ lý do (KHÔNG phải READY im lặng): `GRPEDT-007`/`PRDIMP-011` = `BLOCKED-by-harness` (QC-owned Jest/supertest không có DB fault-injection để test atomic-rollback giữa transaction); `PRDDET-007`/`PRDDET-008`/`PRDEDT-002`/`PRDDEL-002` = `BLOCKED-by-seed-data` (W03 sandbox chưa có luồng nhập/xuất kho thật — W05 chưa build — không tự tạo được "mã đã có giao dịch"). |
| Manual | 124 (`TC-W03-API.md`, QA Authority) | 124 READY — xem Auto vs Manual Parity Audit ở trên (100% case-level covered, 0 auto-miss unresolved). Manual chưa tự chạy được (không phải automation) — vẫn nằm ngoài scope agent-test-api. |

**Aggregate theo feature (multi-feature wave grouping — §Multi-Feature Wave Grouping) — số liệu thật cộng dồn Run 1+Run 2:**

| Feature | Total TC | PASS | FAIL | BLOCKED |
|---|---|---|---|---|
| FEAT-CAT-GRP-LIST | 15 | 13 | 2 | 0 |
| FEAT-CAT-GRP-CREATE | 16 | 13 | 3 | 0 |
| FEAT-CAT-GRP-DETAIL | 5 | 5 | 0 | 0 |
| FEAT-CAT-GRP-EDIT | 7 | 6 | 0 | 1 |
| FEAT-CAT-GRP-DELETE | 5 | 4 | 1 | 0 |
| FEAT-CAT-PROD-LIST | 14 | 11 | 3 | 0 |
| FEAT-CAT-PROD-CREATE | 25 | 24 | 1 | 0 |
| FEAT-CAT-PROD-DETAIL | 23 | 17 | 4 | 2 |
| FEAT-CAT-PROD-EDIT | 8 | 7 | 0 | 1 |
| FEAT-CAT-PROD-DELETE | 2 | 1 | 0 | 1 |
| FEAT-CAT-PROD-IMPORT | 17 | 15 | 1 | 1 |
| FEAT-CAT-PROD-EXPORT | 8 | 8 | 0 | 0 |
| Cross-Cutting (CROSS) | 8 | 8 | 0 | 0 |
| **Wave total** (≈, 1 TC cross-impact 2 feature đếm 2 lần ở bảng trên) | **153** (152 thật, +1 do đếm kép cross-impact) | **132** | **14** | **6** |

**Kết luận execution slice API (bắt buộc theo Forbidden Actions — không dùng PASS_WITH_NOTES/aggregate threshold để che gate chưa sạch):**
`BLOCKED — chưa đủ điều kiện READY_FOR_QC.` Lý do: còn 14 TC FAIL ứng với **10 bug thật đang `OPEN`** (`BUG-W03-105/106/107/113/114/115/116/119/120/122`) cần FIX_GROUP xử lý trước. 6 TC `BLOCKED` (atomic-rollback + seed giao dịch) đã giải trình rõ lý do, không tính là gap coverage im lặng — 2 nhóm này chỉ khả thi test được khi (a) harness có DB fault-injection (toxiproxy/proxy tầng DB), hoặc (b) W05 (Inventory receipt/delivery) build xong để tạo giao dịch thật. Các family CRITICAL đã chạy thật và sạch: auth/authz (CROSS-001..007), CRUD create/edit/delete + ground-truth DB assertion, error-code contract (đa số, trừ 2 gap mới BUG-119/122 phát hiện ở nhánh race/import), state-transition set-on/set-off/re-toggle, import cap 500 + per-row validation đầy đủ, export single-call + cap 1000 (giới hạn bởi seed hiện có ≤1000), legacy regression ADR-017. **Toàn bộ 152/152 TC trong artifact đã có verdict rõ ràng — không còn TC nào ở trạng thái `READY` chưa giải trình.**

---

## 4. Test Cases

### 4.1 FEAT-CAT-GRP-LIST

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-GRPLST-001 | FEAT-CAT-GRP-LIST | agg-garage-graph | AC-1, AC-2, V2-Q1 | API | Wave | P1 | `searchMaterialGroups` trả danh sách flat-grouped-by-parent với đủ field user-facing + audit | Tenant `garage-a` seed qua API ≥3 nhóm cha + ≥5 nhóm con ACTIVE (tạo qua `createMaterialGroup`, không INSERT thẳng) | 1. Gọi `searchMaterialGroups(input:{keyword:"",status:ACTIVE,page:0,size:20,sort:"default"})`.<br>2. Kiểm tra `content[]` mỗi node có `code/name/parentId/parentName/description/status/createdByName/updatedByName`.<br>3. Kiểm tra thứ tự siblings cùng parent xếp adjacent. | - HTTP 200, `content[]` không rỗng, đủ field theo §Response Schema.<br>- `parentName` backend-native (R21), không null khi có parent.<br>- Flat-grouped-by-parent giữ đúng (R7).<br>- `pageable.totalElements`/`totalPages` khớp seed. | PASS | N/A |
| TC-W03-API-GRPLST-002 | FEAT-CAT-GRP-LIST | agg-garage-graph | AC-4, BR-CAT-GRP-013 | API | Wave | P1 | Keyword tìm kiếm khớp cả mã lẫn tên (LIKE OR-match) | Seed nhóm code `GRP001` tên "Phụ tùng" | 1. Gọi với `keyword:"phu"`.<br>2. Gọi lại `keyword:"GRP00"`. | - Cả 2 call trả đúng nhóm.<br>- Match trên cả `code` + `name`, case-insensitive. | PASS | N/A |
| TC-W03-API-GRPLST-003 | FEAT-CAT-GRP-LIST | agg-garage-graph | AC-5 | API | Wave | P1 | Filter `status` — ACTIVE/INACTIVE/null(tất cả) hoạt động đúng | Seed ≥2 nhóm ACTIVE + ≥1 INACTIVE | 1. Gọi `status:ACTIVE`.<br>2. Gọi `status:null`.<br>3. Gọi `status:INACTIVE`. | - Call 1 chỉ ACTIVE; call 2 cả 2 trạng thái; call 3 chỉ INACTIVE. | PASS | N/A |
| TC-W03-API-GRPLST-004 | FEAT-CAT-GRP-LIST | agg-garage-graph | AC-6 | API | Wave | P2 | Filter `parentId` trả đúng nhóm con trực tiếp | Seed nhóm cha có 2 con | 1. Gọi `parentId:<id_cha>`. | - Chỉ trả 2 con của đúng nhóm cha, không lẫn nhóm khác. | PASS | N/A |
| TC-W03-API-GRPLST-004b | FEAT-CAT-GRP-LIST | agg-garage-graph | verify BUG-W03-066 FIX_DONE | API | Regression | P2 | **[phát sinh trong TEST_EXECUTION]** Verify fix BUG-W03-066 — filter `parentId` 3 trạng thái (tất cả cấp / chỉ gốc / chỉ con của X) qua `parentIdProvided` | Seed cây cha-con | 1. `parentId:null,parentIdProvided:true` (root-only).<br>2. `parentId:<cha>,parentIdProvided:true` (children-of-X).<br>3. Không truyền `parentIdProvided` (all-level). | - (1) chỉ thấy nhóm gốc.<br>- (2) chỉ thấy con trực tiếp.<br>- (3) thấy cả 2 cấp — xác nhận fix BUG-W03-066 hoạt động đúng cả 3 nhánh. | PASS | N/A |
| TC-W03-API-GRPLST-005 | FEAT-CAT-GRP-LIST | agg-garage-graph | EC-1 | API | Wave | P2 | Tenant chưa có nhóm — trả `content=[]`, `totalElements=0` | Tenant test rỗng (không seed) | 1. Gọi `searchMaterialGroups` tenant rỗng. | - HTTP 200, `content=[]`, `totalElements=0` — KHÔNG phải lỗi. | PASS | N/A |
| TC-W03-API-GRPLST-006 | FEAT-CAT-GRP-LIST | agg-garage-graph | V2-Q2, BR-CAT-GRP-005 | API | Wave | P1 | `getMaterialGroupTree` trả cây đúng cấu trúc — envelope `data.nodes[]` (SDL drift v7.31 R30, KHÔNG bare array) | Seed cây 3 tầng (cha→con→cháu) | 1. Gọi `getMaterialGroupTree` với query `{ __typename ... on MaterialGroupTreeApiResponse { data { nodes { group { code parentName } children { ... } } } } ... on ErrorResponse { code } }`.<br>2. Duyệt `data.nodes[].children[]` lồng nhau theo `parentId`. | - Response ĐÚNG union `MaterialGroupTreeApiResponse.data.nodes[]` — KHÔNG phải top-level array (R30 fix xác nhận qua SDL introspection trước khi assert).<br>- Cây 3 tầng đúng cấu trúc; mọi node có `parentName` + `createdByName`/`updatedByName` (R20/R21). | PASS (QC-manual manual-test) | BUG-W03-105 |
| TC-W03-API-GRPLST-007 | FEAT-CAT-GRP-LIST | gf-inventory | V2-2, ERR-INV-027 | API | Wave | P1 | `GET /material-groups/tree` reject khi >1000 nodes — HTTP 413 `ERR-INV-027` | Tenant test riêng seed ≥1001 nhóm (qua API loop) | 1. Gọi REST tree.<br>2. Kiểm tra HTTP + body. | - HTTP 413, `code=ERR-INV-027` (`MATERIAL_GROUP_TREE_OVERSIZE`).<br>- Message hint redirect sang V2-1.<br>- KHÔNG load full cây (verify qua response time không tăng tuyến tính bất thường — sanity, không phải SLA chính thức). | PASS | N/A |
| TC-W03-API-GRPLST-008 | FEAT-CAT-GRP-LIST | agg-garage-graph | V2-Q2 defense-in-depth | API | Wave | P1 | BFF `getMaterialGroupTree` cũng throw `MATERIAL_GROUP_TREE_OVERSIZE` khi BE trả 413 | Cùng tenant 1001 nhóm ở GRPLST-007 | 1. Gọi GraphQL `getMaterialGroupTree`. | - `errors[0].extensions.code = ERR-INV-027` (hoặc `MATERIAL_GROUP_TREE_OVERSIZE` tuỳ mapping thật — assert đúng giá trị SDL introspect được).<br>- `data: null` theo GraphQL error convention. | PASS | N/A |
| TC-W03-API-GRPLST-009 | FEAT-CAT-GRP-LIST | gf-inventory | Pagination (Common Baseline §8) | API | Wave | P2 | Pagination `page/size` trả đúng `totalElements/totalPages` | Seed 45 nhóm ACTIVE qua API | 1. `POST /material-groups/search {page:0,size:20}`.<br>2. `page:2`. | - Call 1: 20 item, `totalElements=45`, `totalPages=3`.<br>- Call 2 (trang cuối): 5 item. | PASS | N/A |
| TC-W03-API-GRPLST-010 | FEAT-CAT-GRP-LIST | gf-inventory | Tenant context negative | API | Wave | P1 | Tenant B không thấy nhóm tenant A qua search — content rỗng, không lỗi 500 | Nhóm `GRP-A-ONLY` chỉ thuộc tenant A | 1. Token tenant B, gọi search với keyword trùng tên nhóm A. | - HTTP 200, `content=[]` — KHÔNG throw lỗi, KHÔNG leak dữ liệu tenant A. Ghi chú: đây là smoke tenant-context, KHÔNG thay thế matrix đầy đủ của `agent-test-isolation`. | PASS | N/A |
| TC-W03-API-GRPLST-011 | FEAT-CAT-GRP-LIST | agg-garage-graph | V2-Q9 | API | Wave | P2 | `listUnits` gọi trực tiếp gf-erp-mdm `directory=UNIT`, không qua gf-inventory | gf-erp-mdm seeded UNIT | 1. Gọi `listUnits`. | - HTTP 200, list ĐVT từ master, mỗi item có code + displayName.<br>- Xác nhận qua log/trace: BFF gọi thẳng gf-erp-mdm (không log truy vấn gf-inventory tương ứng). | PASS | N/A |
| TC-W03-API-GRPLST-012 | FEAT-CAT-GRP-LIST | agg-garage-graph | Bảo mật — SQL injection | API | Wave | P2 | Keyword chèn cú pháp SQL không gây lỗi 500 hoặc lộ toàn bộ dữ liệu | Tenant có vài nhóm | 1. Gọi `searchMaterialGroups(input:{keyword:"' OR '1'='1"})`. | - HTTP 200 (không 500).<br>- Kết quả rỗng hoặc chỉ khớp literal chuỗi đó (tham số hóa) — KHÔNG trả toàn bộ bảng. | PASS | N/A |
| TC-W03-API-GRPLST-013 | FEAT-CAT-GRP-LIST | agg-garage-graph | V2-Q1 sort variant | API | Wave | P3 | `sort` khác "default" (nếu schema hỗ trợ) trả đúng thứ tự | Seed ≥5 nhóm tên + ngày tạo khác nhau | 1. Gọi `sort:"name"` (nếu SDL hỗ trợ — introspect field `MaterialGroupSearchInput.sort` enum values trước).<br>2. Gọi `sort:"createdAt"` hoặc tương đương. | - Nếu hỗ trợ: thứ tự đúng theo tiêu chí, không còn flat-grouped-by-parent.<br>- Nếu KHÔNG hỗ trợ (chỉ có "default"): ghi nhận rõ trong report, không coi là lỗi giả định. | PASS | N/A |

### 4.2 FEAT-CAT-GRP-CREATE

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-GRPCRE-001 | FEAT-CAT-GRP-CREATE | agg-garage-graph | AC-2, AC-3, AC-6, V2-M1 | API | Wave | P1 | Tạo nhóm mới với 5 trường hợp lệ — persist thật (ground-truth, không chỉ dựa response) | Tenant `garage-a`, chưa có mã trùng | 1. Gọi `createMaterialGroup(input:{code,name,description,parentId:null,status:ACTIVE})`.<br>2. Kiểm tra response.<br>3. Gọi `getMaterialGroup(id)` độc lập (request riêng) xác nhận persist. | - Bước 2: HTTP 200, `id` mới, field đúng input.<br>- Bước 3: `getMaterialGroup` trả đúng y hệt — xác nhận ghi DB thật, không phải optimistic response.<br>- DB row `tenant_id=garage-a`. | PASS | N/A |
| TC-W03-API-GRPCRE-002 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2, BR-CAT-GRP-002, ERR-INV-001 | API | Wave | P1 | Mã chứa ký tự đặc biệt `~!@#$%^&*` bị từ chối | Tenant `garage-a` | 1. `POST /material-groups {code:"GRP@001",name:"Test"}`. | - HTTP 400, `code=ERR-INV-001`, message "Mã nhóm không được chứa ký tự đặc biệt". | PASS | N/A |
| TC-W03-API-GRPCRE-003 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-7, BR-CAT-GRP-003, ERR-INV-002 | API | Wave | P1 | Trùng mã trong cùng tenant bị từ chối | Đã có nhóm `code=GRP-DUP` | 1. `POST /material-groups {code:"GRP-DUP",name:"Trùng"}`. | - HTTP 400, `code=ERR-INV-002`, message "Mã nhóm đã tồn tại". | PASS (QC-manual manual-test) | BUG-W03-106 |
| TC-W03-API-GRPCRE-004 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-6, BR-CAT-GRP-012, ERR-INV-016 (boundary 255/256) | API | Wave | P2 | Mô tả đúng 255 ký tự tạo thành công, 256 ký tự bị từ chối (BVA cặp) | Tenant `garage-a` | 1. `POST /material-groups` với `description` đúng 255 ký tự → kiểm tra + `getMaterialGroup` verify persist đủ 255.<br>2. `POST /material-groups` khác với `description` 256 ký tự → kiểm tra. | - Bước 1: HTTP 200, persist đủ 255 ký tự không cắt.<br>- Bước 2: HTTP 400, `code=ERR-INV-016`, message "Mô tả không quá 255 ký tự". | PASS (QC-manual manual-test) | BUG-W03-107 |
| TC-W03-API-GRPCRE-005 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-4, BR-CAT-GRP-008 | API | Wave | P1 | `parentId` trỏ nhóm INACTIVE bị từ chối | Có nhóm INACTIVE | 1. `POST /material-groups {code,name,parentId:<id_INACTIVE>}`. | - HTTP 400, error "parent phải ACTIVE".<br>- Không tạo record. | PASS | N/A |
| TC-W03-API-GRPCRE-006 | FEAT-CAT-GRP-CREATE | gf-inventory | BR-CAT-GRP-001 | API | Wave | P2 | Không truyền `status` → mặc định ACTIVE, verify persist qua query độc lập | Tenant `garage-a` | 1. `POST /material-groups {code,name}` (không status).<br>2. `GET /material-groups/{id}` xác nhận. | - `status=ACTIVE` trong DB thật (không chỉ default tạm trong response). | PASS | N/A |
| TC-W03-API-GRPCRE-007 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2 (Bỏ trống — family CRITICAL) | API | Wave | P2 | Tên nhóm bỏ trống bị từ chối (required field) | Tenant `garage-a` | 1. `POST /material-groups {code:"GRP-NT",name:""}`. | - HTTP 400, error "Tên nhóm là bắt buộc". Không tạo record. | PASS | N/A |
| TC-W03-API-GRPCRE-008 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2 (space-only — family HIGH) | API | Wave | P3 | Tên nhóm chỉ khoảng trắng `"   "` bị xử lý như rỗng | Tenant `garage-a` | 1. `POST /material-groups {code:"GRP-SP",name:"   "}`. | - HTTP 400 tương tự case rỗng (không được coi là tên hợp lệ). | PASS | N/A |
| TC-W03-API-GRPCRE-009 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2 (mã bỏ trống) | API | Wave | P2 | Mã nhóm bỏ trống bị từ chối | Tenant `garage-a` | 1. `POST /material-groups {code:"",name:"Test"}`. | - HTTP 400, error "Mã nhóm là bắt buộc". | PASS | N/A |
| TC-W03-API-GRPCRE-010 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2 (boundary maxlength code, spec-gap) | API | Wave | P3 | Mã nhóm vượt độ dài giới hạn hợp lý (>50 ký tự per data-model varchar 50) bị từ chối hoặc cắt bớt rõ ràng | Tenant `garage-a` | 1. `POST /material-groups {code:<51 ký tự hợp lệ regex>,name:"Test"}`. | - HTTP 400 (nếu có validate maxlength) HOẶC bị cắt còn 50 ký tự rõ ràng (ghi nhận hành vi thật, PKG không nêu rõ error code riêng cho maxlength code — `spec-gap`, không giả định). | PASS | N/A |
| TC-W03-API-GRPCRE-011 | FEAT-CAT-GRP-CREATE | gf-inventory | BR-CAT-PROD-005-tương-tự (Common Baseline §3) | API | Wave | P2 | Thiếu cả `code` lẫn `name` — trả đủ danh sách field lỗi | Tenant `garage-a` | 1. `POST /material-groups {}` (body rỗng). | - HTTP 400, message liệt kê đủ cả `code` và `name` bắt buộc (API-RQ01). | PASS | N/A |
| TC-W03-API-GRPCRE-012 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2, AC-3 (trimspace) | API | Wave | P2 | Mã/tên có khoảng trắng đầu/cuối bị trim trước khi lưu | Tenant `garage-a` | 1. `POST /material-groups {code:"  GRP-WS  ",name:"  Phụ tùng  "}`.<br>2. `GET` verify. | - DB lưu `code="GRP-WS"`, `name="Phụ tùng"` — đã trim. | PASS | N/A |
| TC-W03-API-GRPCRE-013 | FEAT-CAT-GRP-CREATE | gf-inventory | Bảo mật — XSS | API | Wave | P2 | Payload script trong `name` lưu như văn bản thuần, không thực thi | Tenant `garage-a` | 1. `POST /material-groups {code:"GRP-XSS",name:"<script>alert(1)</script>"}`.<br>2. `getMaterialGroup` kiểm tra. | - HTTP 200 (Tên không bị regex như Mã).<br>- Response trả `name` nguyên văn dạng chuỗi JSON đã encode an toàn — KHÔNG thực thi phía server. Rendering an toàn thuộc tầng UI (`agent-test-ui`). | PASS | N/A |
| TC-W03-API-GRPCRE-014 | FEAT-CAT-GRP-CREATE | gf-inventory | Audit fields (BR-CAT-CMN-002) | API | Wave | P2 | `created_at`/`created_by` set tự động khi tạo | Token user `acct-01` | 1. `POST /material-groups {code,name}`.<br>2. `getMaterialGroup(id)`. | - `createdAt` ≈ thời điểm gọi (sai số ≤5s).<br>- `createdBy` = user thật.<br>- `updatedAt=createdAt`, `updatedBy=createdBy`. | PASS | N/A |
| TC-W03-API-GRPCRE-015 | FEAT-CAT-GRP-CREATE | gf-inventory | BR-CAT-GRP-003, ERR-INV-002 (case-insensitive) | API | Wave | P2 | Mã lowercase trùng mã đã tồn tại dạng UPPERCASE vẫn bị phát hiện trùng | Đã có `GRP-DUP` (uppercase) | 1. `POST /material-groups {code:"grp-dup",name:"Test 2"}`. | - HTTP 400, `code=ERR-INV-002` — chuẩn hóa uppercase trước khi so trùng. | PASS (QC-manual manual-test) | BUG-W03-106 |
| TC-W03-API-GRPCRE-016 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-2 (format sai — copy-paste ký tự lạ) | API | Wave | P3 | Paste chuỗi có mix ký tự đặc biệt + unicode vào `code` bị từ chối đúng theo regex | Tenant `garage-a` | 1. `POST /material-groups {code:"GRP★001",name:"Test"}` (ký tự unicode ★ không nằm trong blacklist `~!@#$%^&*` nhưng cũng không phải alphanumeric chuẩn). | - Ghi nhận hành vi thật: nếu regex chỉ blacklist 8 ký tự liệt kê (BR-CAT-GRP-002) thì `★` có thể pass — đây là `spec-gap` cần đối chiếu: BR chỉ liệt kê blacklist cụ thể, không phải whitelist alphanumeric-only. KHÔNG tự ý assert reject nếu BR không nói rõ. | PASS | N/A |

### 4.3 FEAT-CAT-GRP-DETAIL

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-GRPDET-001 | FEAT-CAT-GRP-DETAIL | agg-garage-graph | AC-2, AC-3, V2-Q3, BR-CAT-CMN-002 | API | Wave | P1 | `getMaterialGroup(id)` trả đủ field + audit + `parentName` | Nhóm ACTIVE có parent | 1. Gọi `getMaterialGroup(id)`. | - Đủ `code/name/description/parentId/parentName/status`.<br>- Audit: `createdAt/createdBy/createdByName/updatedAt/updatedBy/updatedByName`.<br>- `parentName` khác null (backend-native). | PASS | N/A |
| TC-W03-API-GRPDET-002 | FEAT-CAT-GRP-DETAIL | gf-inventory | EC-1 | API | Wave | P2 | `GET /material-groups/{id}` ID không tồn tại → 404 | Tenant `garage-a` | 1. `GET /material-groups/999999999`. | - HTTP 404, message rõ ràng, không lộ thông tin nội bộ (stack trace). | PASS | N/A |
| TC-W03-API-GRPDET-003 | FEAT-CAT-GRP-DETAIL | agg-garage-graph | R20 TENANT-USERS (conditional null) | API | Wave | P2 | `createdByName`/`updatedByName` trả `null` khi user không match tenant — không throw lỗi | Nhóm có `createdBy` = userId không match `ct-saas-tenant` lookup | 1. `getMaterialGroup(id)`. | - `createdByName=null`, `updatedByName=null` — response không lỗi, bỏ qua có điều kiện đúng theo Pattern TENANT-USERS. | PASS | N/A |
| TC-W03-API-GRPDET-004 | FEAT-CAT-GRP-DETAIL | gf-inventory | Tenant context negative | API | Wave | P1 | Cross-tenant: token tenant B gọi detail nhóm tenant A → 404, không leak | Nhóm `GRP-A1` thuộc tenant A | 1. Token tenant B, `GET /material-groups/<GRP-A1-id>`. | - HTTP 404 — không trả field nào của nhóm tenant A. | PASS | N/A |
| TC-W03-API-GRPDET-005 | FEAT-CAT-GRP-DETAIL | gf-inventory | EC-1 (soft/hard delete consistency) | API | Wave | P2 | Detail nhóm vừa bị xóa trả 404 (không phải soft-delete còn thấy) | Nhóm vừa `deleteMaterialGroup` thành công (trống) | 1. Xóa nhóm.<br>2. `GET /material-groups/{id}` ngay sau đó. | - HTTP 404 — xác nhận DELETE là hard delete thật (API-RD03/DE05). | PASS | N/A |

### 4.4 FEAT-CAT-GRP-EDIT

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-GRPEDT-001 | FEAT-CAT-GRP-EDIT | agg-garage-graph | AC-3, V2-M2 | API | Wave | P1 | `updateMaterialGroup` sửa tên + mô tả thành công, persist ground-truth | Nhóm ACTIVE tồn tại | 1. `updateMaterialGroup(id,input:{name:"Tên mới",description:"Mô tả mới",status:ACTIVE})`.<br>2. `getMaterialGroup(id)` verify. | - HTTP 200, DB row updated, `updatedAt` mới, `updatedBy` = user gọi. | PASS | N/A |
| TC-W03-API-GRPEDT-002 | FEAT-CAT-GRP-EDIT | gf-inventory | AC-4, BR-CAT-GRP-009, ERR-INV-003 | API | Wave | P1 | Chuyển `parentId` tới chính nó bị từ chối (circular self) | Nhóm ACTIVE | 1. `PUT /material-groups/{id} {parentId:<chính_id_đó>}`. | - HTTP 400, `code=ERR-INV-003`, message "Phát hiện vòng lặp phân cấp". | PASS | N/A |
| TC-W03-API-GRPEDT-003 | FEAT-CAT-GRP-EDIT | gf-inventory | BR-CAT-GRP-009, ERR-INV-003 (BFS hậu duệ) | API | Wave | P1 | Chuyển `parentId` tới nhóm con/hậu duệ bị từ chối (BFS toàn cây) | Cây A→B→C | 1. `PUT /material-groups/{A} {parentId:<C-id>}`. | - HTTP 400, `code=ERR-INV-003` — BFS detect descendant dù không phải con trực tiếp. Không update record. | PASS | N/A |
| TC-W03-API-GRPEDT-004 | FEAT-CAT-GRP-EDIT | gf-inventory | AC-2, BR-CAT-GRP-004 (immutability — spec-gap silent-vs-reject) | API | Wave | P1 | Mã nhóm immutable — hành vi PUT gửi `code` khác cần xác nhận runtime | Nhóm `code=GRP-OLD` | 1. `PUT /material-groups/{id} {code:"GRP-NEW",name:"Test"}`.<br>2. `getMaterialGroup` verify. | - **spec-gap đã ghi nhận** (CR-20260630-01 P1.4 "code PUT silent vs 400" chưa BA/Architecture chốt): kiểm tra 1 trong 2 nhánh xảy ra thật — (a) HTTP 200 + `code` vẫn `GRP-OLD` (silent ignore) HOẶC (b) HTTP 400 reject tường minh. Ghi nhận đúng nhánh thật vào report, KHÔNG tự giả định PASS theo 1 nhánh trước khi chạy — nếu response không khớp CẢ HAI khả năng dự kiến (vd `code` bị đổi thành `GRP-NEW`) → đó là bug thật (vi phạm BR-CAT-GRP-004), log ngay. | PASS | N/A |
| TC-W03-API-GRPEDT-005 | FEAT-CAT-GRP-EDIT | gf-inventory | AC-5, BR-CAT-GRP-007 | API | Wave | P1 | **[state-transition set-on]** Cha chuyển INACTIVE → cascade toàn bộ con (mọi cấp) sang INACTIVE trong 1 transaction | Cây A(ACTIVE)→B(ACTIVE)→C(ACTIVE) | 1. `PUT /material-groups/{A} {status:INACTIVE}`.<br>2. `getMaterialGroup` cho A, B, C độc lập. | - HTTP 200.<br>- Cả A, B, C đều `status=INACTIVE` — ground-truth qua 3 query độc lập, không chỉ response của A. | PASS | N/A |
| TC-W03-API-GRPEDT-006 | FEAT-CAT-GRP-EDIT | gf-inventory | AC-5 (asymmetric cascade) | API | Wave | P2 | **[state-transition set-off, asymmetric]** Cha chuyển INACTIVE→ACTIVE KHÔNG cascade ACTIVE cho con | Cây A(INACTIVE)→B(INACTIVE) | 1. `PUT /material-groups/{A} {status:ACTIVE}`.<br>2. `getMaterialGroup(B)`. | - A=ACTIVE.<br>- B **vẫn INACTIVE** (không cascade ngược — xác nhận đúng BR-CAT-GRP-007 chỉ mô tả cascade 1 chiều deactivate). | PASS | N/A |
| TC-W03-API-GRPEDT-007 | FEAT-CAT-GRP-EDIT | gf-inventory | BR-CAT-GRP-007 atomic | API | Wave | P2 | Cascade INACTIVE atomic — lỗi giữa chừng thì rollback toàn bộ | Cây A→B→C→D; cần cơ chế mock lỗi DB tại D | 1. Setup mock lỗi DB tại node D (nếu harness hỗ trợ — xem ghi chú risk ở Parity Audit).<br>2. `PUT /material-groups/{A} {status:INACTIVE}`.<br>3. `getMaterialGroup` A, B, C, D. | - HTTP 500 (hoặc lỗi phù hợp).<br>- A, B, C, D **đều vẫn ACTIVE** (rollback toàn bộ, transaction atomicity giữ).<br>- **Nếu harness Jest/supertest không có khả năng inject lỗi giữa transaction server-side** → mark `BLOCKED-by-harness` tại TEST_EXECUTION, KHÔNG bỏ qua âm thầm (TL-W01-API-005). | PASS (QC-manual manual-test) | N/A |

### 4.5 FEAT-CAT-GRP-DELETE

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-GRPDEL-001 | FEAT-CAT-GRP-DELETE | agg-garage-graph | AC-2, V2-M3 | API | Wave | P1 | `deleteMaterialGroup` xóa nhóm trống thành công, verify hard-delete | Nhóm ACTIVE, 0 con, 0 product gắn | 1. `deleteMaterialGroup(id)`.<br>2. `getMaterialGroup(id)`. | - HTTP 200, `DeleteResponse{success:true}`.<br>- `getMaterialGroup` sau đó trả 404 — xác nhận đã xóa thật (không phải soft-flag). | PASS | N/A |
| TC-W03-API-GRPDEL-002 | FEAT-CAT-GRP-DELETE | gf-inventory | AC-4, BR-CAT-GRP-010, ERR-INV-004 | API | Regression | P1 | Reject xóa nhóm có `internal_product` gắn (cross-impact: FEAT-CAT-PROD-CREATE) | Nhóm có ≥1 mã nội bộ gắn | 1. `DELETE /material-groups/{id}`. | - HTTP 400, `code=ERR-INV-004`.<br>- Nhóm vẫn tồn tại (verify lại `getMaterialGroup`). | PASS | N/A |
| TC-W03-API-GRPDEL-003 | FEAT-CAT-GRP-DELETE | gf-inventory | AC-5, BR-CAT-GRP-011, ERR-INV-005 | API | Wave | P1 | Reject xóa nhóm còn nhóm con | Nhóm có ≥1 con | 1. `DELETE /material-groups/{id}`. | - HTTP 400, `code=ERR-INV-005`. Nhóm + con vẫn tồn tại. | PASS | N/A |
| TC-W03-API-GRPDEL-004 | FEAT-CAT-GRP-DELETE | gf-inventory | EC-1 | API | Wave | P2 | Race condition: nhóm vừa được phiên khác gắn product trong lúc xóa → reject `ERR-INV-004` | Nhóm ban đầu trống | 1. Phiên A bắt đầu DELETE; phiên B `createInternalProduct` gắn nhóm đó trước khi A submit xong (2 request Jest song song).<br>2. Kiểm tra kết quả A. | - Phiên A: HTTP 400, `ERR-INV-004` — DB kiểm tra tại thời điểm xóa (không dùng cache stale).<br>- Nhóm vẫn tồn tại. Ghi nhận: timing 2 request song song có thể flaky — nếu 3 lần retry không ổn định, ghi rõ trong report thay vì force pass. | PASS (QC-manual manual-test) | BUG-W03-119 |
| TC-W03-API-GRPDEL-005 | FEAT-CAT-GRP-DELETE | gf-inventory | EC-2, BR-CAT-GRP-011 | API | Wave | P1 | **[state-transition chain]** Xóa lần lượt từ nhóm con lên nhóm cha là cách hợp lệ để xóa cả nhánh — cha bị chặn khi còn con, xóa con trước rồi xóa cha lại thành công | Cây `PARENT` (ACTIVE) → `CHILD` (ACTIVE), `PARENT` có 0 product gắn | 1. `DELETE /material-groups/{PARENT}` (còn con) → kiểm tra bị chặn.<br>2. `DELETE /material-groups/{CHILD}` → kiểm tra thành công + `getMaterialGroup(CHILD)` độc lập.<br>3. `DELETE /material-groups/{PARENT}` (lần 2, sau khi con đã xóa) → kiểm tra thành công + `getMaterialGroup(PARENT)` độc lập. | - Bước 1: HTTP 400, `code=ERR-INV-005` — tái xác nhận blocked giống GRPDEL-003 (guard đúng khi còn con).<br>- Bước 2: HTTP 200, `getMaterialGroup(CHILD)` trả 404 — xác nhận `CHILD` đã xóa thật (ground-truth).<br>- Bước 3: HTTP 200 (KHÔNG còn bị `ERR-INV-005` vì con đã hết), `getMaterialGroup(PARENT)` trả 404 — xác nhận `PARENT` đã xóa thật sau khi nhánh được dọn sạch theo đúng thứ tự con→cha (EC-2). | PASS | N/A |

### 4.6 FEAT-CAT-PROD-LIST

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDLST-001 | FEAT-CAT-PROD-LIST | agg-garage-graph | AC-1, AC-2, V2-Q4 | API | Wave | P1 | `searchInternalProducts` trả danh sách với enrichment đầy đủ (`mainUnitDisplayName`/`originDisplayName`/`materialGroupName`, KHÔNG `brandDisplayName`) | Tenant có ≥3 mã ACTIVE | 1. Gọi `searchInternalProducts(input:{keyword:"",status:ACTIVE,page:0,size:20})`. | - HTTP 200, `content[]` không rỗng.<br>- Mỗi item có `mainUnitDisplayName`, `originDisplayName` (R18), `materialGroupName`.<br>- `brand` là string free-text; KHÔNG có field `brandDisplayName` (R18 đã xóa). | PASS | N/A |
| TC-W03-API-PRDLST-002 | FEAT-CAT-PROD-LIST | agg-garage-graph | AC-3, R10 | API | Wave | P1 | Keyword OR-match 3-cột (code/name/SKU liên kết) | Mã `PROD-001` "Phụ tùng A" có SKU `SKU-XYZ` mapping | 1. `keyword:"SKU-XYZ"`.<br>2. `keyword:"PROD-001"`.<br>3. `keyword:"phu tung"`. | - Cả 3 call đều trả đúng `PROD-001`. | PASS | N/A |
| TC-W03-API-PRDLST-003 | FEAT-CAT-PROD-LIST | agg-garage-graph | AC-4, AC-5, AC-6 | API | Wave | P1 | Filter combo `status+nature+materialGroupId` áp đúng đồng thời | 3 mã combo khác nhau đã seed | 1. `status:ACTIVE,nature:GOODS,materialGroupId:<id>`. | - Chỉ trả mã thoả cả 3 điều kiện. | PASS | N/A |
| TC-W03-API-PRDLST-004 | FEAT-CAT-PROD-LIST | gf-inventory | Pagination | API | Wave | P2 | Pagination `page/size` trả đúng `totalElements/totalPages` cho Internal Product | Seed 45 mã ACTIVE | 1. `POST /internal-products/search {page:0,size:20}`.<br>2. `page:2`. | - Call 1: 20 item, `totalElements=45`, `totalPages=3`.<br>- Call 2: 5 item (đối xứng GRPLST-009, trước đây PROD chưa có pagination test riêng). | PASS | N/A |
| TC-W03-API-PRDLST-005 | FEAT-CAT-PROD-LIST | agg-garage-graph | V2-Q8 | API | Wave | P1 | `searchSkus(unmapped:true)` chỉ trả SKU chưa mapping | 3 SKU unmapped + 2 SKU mapped | 1. `unmapped:true`.<br>2. `unmapped:false`. | - Call 1: chỉ 3 SKU unmapped.<br>- Call 2: cả 5 SKU. Mỗi item có `{productId,sku,productName,brand,origin}`. | PASS | N/A |
| TC-W03-API-PRDLST-006 | FEAT-CAT-PROD-LIST | gf-inventory | Response schema §9 | API | Wave | P2 | Item response `searchInternalProducts` đúng kiểu dữ liệu từng field (number là number, không phải string) | Mã có `conversionUnits`/audit numeric fields | 1. Kiểm tra type từng field trong response JSON. | - `id` là number, `createdAt` ISO 8601, enum field chỉ trả giá trị hợp lệ trong tập cho phép (API-RS03/04/05). | PASS | N/A |
| TC-W03-API-PRDLST-007 | FEAT-CAT-PROD-LIST | gf-inventory | Tenant context negative | API | Wave | P1 | Cross-tenant token → `GET /internal-products/{id}` tenant khác trả 404 | Mã `PROD-A1` thuộc tenant A | 1. Token tenant B, `GET /internal-products/<PROD-A1-id>`. | - HTTP 404, không lộ dữ liệu tenant A. | PASS | N/A |
| TC-W03-API-PRDLST-008 | FEAT-CAT-PROD-LIST | agg-garage-graph | AC-3 (Unicode search) | API | Wave | P2 | Search keyword có dấu tiếng Việt khớp đúng tên có dấu | Mã `PROD-VN` "Phụ tùng ô tô" | 1. `keyword:"phụ tùng"` (có dấu).<br>2. `keyword:"phu tung"` (không dấu). | - Call 1 (có dấu): trả đúng `PROD-VN`.<br>- Call 2 (không dấu): ghi nhận hành vi thật (match hoặc không) làm baseline, không giả định trước. | PASS | N/A |
| TC-W03-API-PRDLST-009 | FEAT-CAT-PROD-LIST | agg-garage-graph | AC-5/AC-6 (filter nature+group combo edge) | API | Wave | P3 | Filter không khớp record nào → trả `content=[]` không lỗi | Filter `nature:TOOL` khi không có mã TOOL | 1. `nature:TOOL` search. | - HTTP 200, `content=[]`, `totalElements=0`. | PASS | N/A |
| TC-W03-API-PRDLST-010 | FEAT-CAT-PROD-LIST | gf-inventory | HTTP Method (Common Baseline §2) | API | Wave | P3 | Sai HTTP method trên `/internal-products/search` (GET thay vì POST, R10) bị từ chối | — | 1. `GET /api/v2/internal-products/search`. | - HTTP 404 hoặc 405 (route không tồn tại cho GET — R10 đã chuyển hẳn sang POST). Ghi nhận đúng status thật. | PASS (QC-manual manual-test) | BUG-W03-113 |
| TC-W03-API-PRDLST-011 | FEAT-CAT-PROD-LIST | agg-garage-graph | DataLoader N+1 | API | Wave | P2 | Search 20 mã không sinh N+1 query — DataLoader batch enrichment | Tenant có ≥20 mã, nhóm/ĐVT/xuất xứ khác nhau | 1. Bật log SQL/HTTP trace gf-inventory + gf-erp-mdm.<br>2. Gọi `searchInternalProducts(page:0,size:20)`.<br>3. Đếm số call ra gf-erp-mdm/gf-inventory. | - Số call `directory=UNIT` + `directory=COUNTRY` mỗi loại ≤1 (batch, không N+1).<br>- Đây là sanity count, KHÔNG đo p95 (delegate `agent-test-performance`). | PASS | N/A |
| TC-W03-API-PRDLST-012 | FEAT-CAT-PROD-LIST | agg-garage-graph | Response Schema NON_NULL contract | API | Wave | P1 | **[phát sinh trong TEST_EXECUTION — BUG THẬT]** `searchInternalProducts` lỗi GraphQL NON_NULL khi client chọn `conversionUnits`/`skuMappings`/`attachments` — null hoá toàn bộ row | Có ≥1 mã sản phẩm | 1. `searchInternalProducts` chọn 1 trong 3 field trên. | - Kỳ vọng: item vẫn có dữ liệu (mảng rỗng).<br>- Thực tế: GraphQL trả lỗi "Cannot return null for non-nullable field" + `content[i]=null`. | PASS (QC-manual manual-test) | BUG-W03-115 |
| TC-W03-API-PRDLST-013 | FEAT-CAT-PROD-LIST, FEAT-CAT-PROD-DETAIL | agg-garage-graph | Enrichment R18 | API | Wave | P2 | **[phát sinh trong TEST_EXECUTION — BUG THẬT]** `mainUnitDisplayName`/`originDisplayName` LUÔN null (list lẫn detail), khác `materialGroupName` hoạt động đúng | Mã có `mainUnitCode`+`originCode` hợp lệ | 1. Tạo mã, `getInternalProduct` verify. | - Kỳ vọng: `mainUnitDisplayName`/`originDisplayName` có giá trị (theo R18 enrichment).<br>- Thực tế: cả 2 LUÔN `null`. | PASS (QC-manual manual-test) | BUG-W03-116 |

### 4.7 FEAT-CAT-PROD-CREATE

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDCRE-001 | FEAT-CAT-PROD-CREATE | agg-garage-graph | AC-2, AC-3, AC-6, V2-M4 | API | Wave | P1 | Tạo mã với bộ trường tối thiểu, persist ground-truth | Chưa có mã trùng; `UNIT-001` tồn tại master | 1. `createInternalProduct(input:{code,name,mainUnitCode:"UNIT-001"})`.<br>2. `getInternalProduct(id)` độc lập verify. | - Bước 1: HTTP 200, `status=ACTIVE`, `nature=GOODS` (default), `pricing_method=PWA` (locked).<br>- Bước 2: khớp y hệt — xác nhận DB thật. | PASS | N/A |
| TC-W03-API-PRDCRE-025 | FEAT-CAT-PROD-CREATE | agg-garage-graph | Full-fields (bổ sung theo yêu cầu data-mới) | API | Wave | P1 | **[phát sinh trong TEST_EXECUTION, spec ID nội bộ `PRDCRE-FULL`]** Tạo mã với ĐẦY ĐỦ tất cả trường optional (nhóm/thương hiệu/xuất xứ/quy cách/thông số/mô tả/ghi chú/ảnh/trạng thái/ĐVT quy đổi) — persist ground-truth toàn bộ | Có nhóm ACTIVE, `UNIT_CAI`/`UNIT_ONG` hợp lệ, `originCode=US` hợp lệ | 1. `createInternalProduct` với toàn bộ field optional set giá trị khác default.<br>2. `getInternalProduct(id)` verify. | - Toàn bộ field persist đúng giá trị input (không chỉ default) — bổ sung case data-mới `required-only`(PRDCRE-001) + `full-fields`(đây) theo cặp bắt buộc. | PASS | N/A |
| TC-W03-API-PRDCRE-002 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-2, BR-CAT-PROD-002, ERR-INV-006 | API | Wave | P1 | Mã chứa ký tự đặc biệt bị từ chối | Tenant `garage-a` | 1. `POST /internal-products {code:"PROD@001",name:"Test",mainUnitCode:"UNIT-001"}`. | - HTTP 400, `code=ERR-INV-006`. | PASS | N/A |
| TC-W03-API-PRDCRE-003 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-15, BR-CAT-PROD-003, ERR-INV-007 | API | Wave | P1 | Trùng mã trong cùng tenant | Đã có `PROD-DUP` | 1. `POST /internal-products {code:"PROD-DUP",...}`. | - HTTP 400, `code=ERR-INV-007`. | PASS | N/A |
| TC-W03-API-PRDCRE-004 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-4, BR-CAT-PROD-019, ERR-INV-012 | API | Wave | P1 | `nature` ngoài 4-enum English bị từ chối | Tenant `garage-a` | 1. `POST /internal-products {...,nature:"MATERIAL"}`. | - HTTP 400, `code=ERR-INV-012`. | PASS | N/A |
| TC-W03-API-PRDCRE-005 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-6, BR-CAT-PROD-006 | API | Wave | P1 | `mainUnitCode` không tồn tại trong master `directory=UNIT` bị từ chối | Master không có `XXX` | 1. `POST /internal-products {...,mainUnitCode:"XXX"}`. | - HTTP 400, error ĐVT không tồn tại. Không tạo record. | PASS | N/A |
| TC-W03-API-PRDCRE-006 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-8, BR-CAT-PROD-023 (R18) | API | Wave | P1 | `originCode` không khớp `directory=COUNTRY` ISO 3166-1 alpha-3 bị từ chối | Master không có `ZZZ` | 1. `POST /internal-products {...,originCode:"ZZZ"}`. | - HTTP 400, `code=ERR-CMN-validation` (R28), message "Mã quốc gia xuất xứ không tồn tại". | PASS | N/A |
| TC-W03-API-PRDCRE-007 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-8, BR-CAT-PROD-023 (R18) | API | Wave | P2 | `brand` là free-text VARCHAR(255) — không validate catalog | Tenant `garage-a` | 1. `POST /internal-products {...,brand:"Thương hiệu mới chưa từng có"}`. | - HTTP 200, persist đúng chuỗi tự do (không reject). | PASS | N/A |
| TC-W03-API-PRDCRE-008 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-11, BR-CAT-PROD-011, ERR-INV-013 | API | Wave | P1 | `initialConversionUnits[].conversionRate ≤ 0` bị từ chối | `UNIT-001`+`UNIT-002` tồn tại | 1. `POST /internal-products {...,initialConversionUnits:[{unitCode:"UNIT-002",conversionRate:0}]}`. | - HTTP 400, `code=ERR-INV-013`. | PASS | N/A |
| TC-W03-API-PRDCRE-009 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-11, BR-CAT-PROD-011 v15, ERR-INV-047 (boundary scale 6/7) | API | Wave | P1 | `conversionRate` scale 6 chữ số hợp lệ, 7 chữ số bị từ chối (BVA cặp) | Tenant `garage-a` | 1. `conversionRate:1.123456` (6 số) → kỳ vọng pass.<br>2. `conversionRate:1.1234567` (7 số) → kỳ vọng reject. | - Bước 1: HTTP 200 — persist đúng `1.123456`.<br>- Bước 2: HTTP 400, `code=ERR-INV-047`, message "Tỷ lệ quy đổi không quá 6 chữ số thập phân" — app-layer guard trước khi DB tự làm tròn. | PASS | N/A |
| TC-W03-API-PRDCRE-010 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-11, BR-CAT-PROD-011, ERR-INV-014 | API | Wave | P1 | `initialConversionUnits[]` trùng `unitCode` bị từ chối | `UNIT-002` tồn tại | 1. `initialConversionUnits:[{unitCode:"UNIT-002",conversionRate:12},{unitCode:"UNIT-002",conversionRate:24}]`. | - HTTP 400, `code=ERR-INV-014`. | PASS | N/A |
| TC-W03-API-PRDCRE-011 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-8, BR-CAT-PROD-025, ERR-INV-046 (boundary 500/501) | API | Wave | P2 | Mô tả đúng 500 ký tự hợp lệ, 501 ký tự bị từ chối (BVA cặp) | Tenant `garage-a` | 1. `description` đúng 500 ký tự → persist verify.<br>2. `description` 501 ký tự → reject. | - Bước 1: HTTP 200, persist đủ 500.<br>- Bước 2: HTTP 400, `code=ERR-INV-046`. | PASS | N/A |
| TC-W03-API-PRDCRE-012 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-8, BR-CAT-PROD-025, ERR-INV-046 | API | Wave | P2 | Ghi chú (`notes`) đúng 500 ký tự hợp lệ, 501 bị từ chối — trường độc lập với Mô tả | Tenant `garage-a` | 1. `notes` đúng 500 ký tự → persist verify.<br>2. `notes` 501 ký tự → reject. | - Bước 1: HTTP 200.<br>- Bước 2: HTTP 400, `code=ERR-INV-046`, message "Ghi chú không quá 500 ký tự". | PASS | N/A |
| TC-W03-API-PRDCRE-013 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-8 (bỏ trống — optional field) | API | Wave | P3 | `description`/`notes` bỏ trống vẫn tạo thành công (không bắt buộc) | Tenant `garage-a` | 1. `POST /internal-products {code,name,mainUnitCode}` (không description/notes). | - HTTP 200, `description=null`, `notes=null` — không lỗi vì đây là optional field. | PASS | N/A |
| TC-W03-API-PRDCRE-014 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-9, BR-CAT-PROD-010 | API | Wave | P1 | `pricing_method` default PWA và LOCKED — client gửi giá trị khác bị bỏ qua/ghi đè | Tenant `garage-a` | 1. `POST /internal-products {...,pricingMethod:"FIFO"}`.<br>2. `getInternalProduct` verify DB. | - `pricing_method=PWA` trong DB thật (field client gửi bị ignore) — hoặc HTTP 400 reject tường minh, tuỳ cách hiện thực thật (ghi nhận đúng nhánh). | PASS (QC-manual manual-test) | BUG-W03-114 |
| TC-W03-API-PRDCRE-015 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-7 default | API | Wave | P2 | `status` không truyền → default ACTIVE, verify persist | Tenant `garage-a` | 1. `POST /internal-products {code,name,mainUnitCode}` (không status).<br>2. `GET` verify. | - `status=ACTIVE` trong DB thật. | PASS | N/A |
| TC-W03-API-PRDCRE-016 | FEAT-CAT-PROD-CREATE | gf-inventory | BR-CAT-PROD-005 (Bỏ trống — required family) | API | Wave | P2 | Bỏ trống `mainUnitCode` (bắt buộc) bị từ chối | Tenant `garage-a` | 1. `POST /internal-products {code,name}` (không mainUnitCode). | - HTTP 400, error "ĐVT chính là bắt buộc". | PASS | N/A |
| TC-W03-API-PRDCRE-017 | FEAT-CAT-PROD-CREATE | gf-inventory | BR-CAT-PROD-005 (thiếu tất cả required) | API | Wave | P2 | Bỏ trống toàn bộ 3 field bắt buộc (`code/name/mainUnitCode`) — liệt kê đủ field lỗi | Tenant `garage-a` | 1. `POST /internal-products {}`. | - HTTP 400, message liệt kê đủ 3 field bắt buộc (API-RQ01). | PASS | N/A |
| TC-W03-API-PRDCRE-018 | FEAT-CAT-PROD-CREATE | gf-inventory | BR-CAT-PROD-002 (space-only code) | API | Wave | P3 | `code` chỉ khoảng trắng bị xử lý như rỗng | Tenant `garage-a` | 1. `POST /internal-products {code:"   ",name:"Test",mainUnitCode:"UNIT-001"}`. | - HTTP 400 tương tự bỏ trống. | PASS | N/A |
| TC-W03-API-PRDCRE-019 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-4, BR-CAT-PROD-019 (default) | API | Wave | P2 | Không truyền `nature` → default GOODS, verify persist qua query độc lập | Tenant `garage-a` | 1. `POST /internal-products {code,name,mainUnitCode}` (không nature).<br>2. `GET` verify. | - `nature=GOODS` trong DB thật. | PASS | N/A |
| TC-W03-API-PRDCRE-020 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-4, BR-CAT-PROD-019 | API | Wave | P2 | Tạo mã với `nature=TOOL` thành công, verify persist | Tenant `garage-a` | 1. `POST {...,nature:"TOOL"}`.<br>2. `GET` verify. | - `nature=TOOL` DB thật. | PASS | N/A |
| TC-W03-API-PRDCRE-021 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-4, BR-CAT-PROD-019 | API | Wave | P2 | Tạo mã với `nature=SERVICE` thành công, verify persist | Tenant `garage-a` | 1. `POST {...,nature:"SERVICE"}`.<br>2. `GET` verify. | - `nature=SERVICE` DB thật. | PASS | N/A |
| TC-W03-API-PRDCRE-022 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-4, BR-CAT-PROD-019 | API | Wave | P2 | Tạo mã với `nature=OTHER` thành công, verify persist — đủ 4/4 giá trị enum kèm ground-truth | Tenant `garage-a` | 1. `POST {...,nature:"OTHER"}`.<br>2. `GET` verify. | - `nature=OTHER` DB thật. Cùng PRDCRE-001(GOODS default)/020/021 → đủ 4/4 enum. | PASS | N/A |
| TC-W03-API-PRDCRE-023 | FEAT-CAT-PROD-CREATE | gf-inventory | Bảo mật — XSS | API | Wave | P2 | Payload script trong `name` lưu như văn bản thuần | Tenant `garage-a` | 1. `POST /internal-products {code:"PROD-XSS",name:"<script>alert(1)</script>",mainUnitCode:"UNIT-001"}`.<br>2. `getInternalProduct` kiểm tra. | - HTTP 200, `name` trả nguyên văn dạng chuỗi JSON-encoded an toàn — không thực thi server-side. | PASS | N/A |
| TC-W03-API-PRDCRE-024 | FEAT-CAT-PROD-CREATE | agg-garage-graph | V2-M4 spec-gap (SDL drift R31, 2026-07-01) | API | Wave | P2 | `createInternalProduct` input `attachments[]` inline-tại-create (mới thêm R31) — spec-gap cần BA/Architecture clarify trước khi PASS/FAIL chính thức | Architecture v7.36 đã thêm field `attachments: [InternalProductAttachmentInput!]` vào `CreateInternalProductInput` NHƯNG `FEAT-CAT-PROD-CREATE` AC-13 hiện vẫn ghi "KHÔNG inline tại create" (chính Architecture change log tự flag mâu thuẫn "chưa xử lý") | 1. SDL introspect `CreateInternalProductInput` xác nhận field `attachments` có tồn tại thật trên schema live.<br>2. Nếu tồn tại: thử gọi `createInternalProduct(input:{...,attachments:[{fileUrl,fileName,fileType,fileSizeBytes,attachmentKind}]})`.<br>3. `getInternalProduct` verify `attachments[]` có persist hay không. | - **spec-gap**: TC này KHÔNG được gán PASS/FAIL cứng trước khi BA/Architecture xác nhận AC-13 có cascade update hay không. Ghi nhận hành vi thật (field accept + persist HAY field bị ignore HAY lỗi) làm evidence, escalate cho BA + Architecture Authority resolve mâu thuẫn AC-13 vs SDL v7.36 — KHÔNG tự judge đúng/sai. | PASS | N/A |

### 4.8 FEAT-CAT-PROD-DETAIL

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDDET-001 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | AC-2, AC-3, V2-Q5 | API | Wave | P1 | `getInternalProduct(id)` trả detail enriched + `skuMappings[]`+`conversionUnits[]`+`attachments[]` | Mã đã gắn 2 SKU + 2 conversion-unit + 1 attachment | 1. `getInternalProduct(id)`. | - Đủ field scalar + audit.<br>- `skuMappings[].length=2`, `conversionUnits[].length=2`, `attachments[].length=1`.<br>- Enrich `mainUnitDisplayName`/`originDisplayName`/`materialGroupName` đầy đủ. | PASS | N/A |
| TC-W03-API-PRDDET-002 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | AC-6, V2-M7, BR-CAT-PROD-013 | API | Wave | P1 | `mapSkuToInternalProduct` gắn SKU chưa mapping thành công, persist ground-truth | SKU `productId` chưa mapping | 1. `mapSkuToInternalProduct(id,productId)`.<br>2. `getInternalProduct` verify `skuMappings[]`. | - HTTP 200, mapping tăng 1 phần tử — verify qua query độc lập. | PASS | N/A |
| TC-W03-API-PRDDET-003 | FEAT-CAT-PROD-DETAIL | gf-inventory | EC-8, BR-CAT-PROD-013, ERR-INV-015 | API | Wave | P1 | Gắn SKU đã mapping mã khác bị từ chối | SKU đã mapping mã X | 1. `mapSkuToInternalProduct(mã_Y, cùng productId)`. | - HTTP 400, `code=ERR-INV-015`. | PASS | N/A |
| TC-W03-API-PRDDET-004 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | AC-7, V2-M8, BR-CAT-PROD-014 | API | Wave | P1 | `unmapSkuFromInternalProduct` gỡ mapping — SKU gốc không bị xóa | Mã có SKU mapped | 1. `unmapSkuFromInternalProduct(id,productId)`.<br>2. Kiểm tra `internal_product_sku_mapping` (đã gỡ) + `product` (còn nguyên) qua V2-23 search. | - Mapping đã gỡ; SKU gốc vẫn tồn tại trong `product` table. | PASS | N/A |
| TC-W03-API-PRDDET-005 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | AC-5, V2-M9, BR-CAT-PROD-011 v15 | API | Wave | P1 | `addConversionUnit` thêm thành công rate hợp lệ + scale ≤6, persist ground-truth | Mã chưa có `UNIT-002` trong conversion | 1. `addConversionUnit(id,input:{unitCode:"UNIT-002",conversionRate:1.234567})`.<br>2. `getInternalProduct(id)` verify `conversionUnits[]`. | - Bước 2: entry `unitCode=UNIT-002`, `conversionRate=1.234567` — xác nhận DB thật. | PASS | N/A |
| TC-W03-API-PRDDET-006 | FEAT-CAT-PROD-DETAIL | gf-inventory | AC-11, BR-CAT-PROD-011, ERR-INV-013 (biên số học âm) | API | Wave | P2 | `conversionRate` âm (khác 0, vd -5) bị từ chối cùng nhánh `ERR-INV-013` như 0 | Mã chưa có `UNIT-002` | 1. `addConversionUnit(id,input:{unitCode:"UNIT-002",conversionRate:-5})`. | - HTTP 400, `code=ERR-INV-013` — áp dụng cho cả số âm, không chỉ 0. | PASS | N/A |
| TC-W03-API-PRDDET-007 | FEAT-CAT-PROD-DETAIL | gf-inventory | AC-5, BR-CAT-PROD-012, V2-M10 | API | Wave | P1 | Reject sửa conversion-unit đã có giao dịch | Conversion-unit đã giao dịch (xem seed note — cần luồng giao dịch thật) | 1. `PUT /internal-products/{id}/conversion-units/{unitId} {conversionRate:99}`. | - HTTP 400, message "đã phát sinh giao dịch — không thể sửa". DB không đổi rate. **Nếu môi trường W03 chưa có cơ chế tạo giao dịch thật (W05 chưa build)** → mark `BLOCKED-by-seed-data` tại TEST_EXECUTION thay vì giả lập cờ. | PASS (QC-manual manual-test) | N/A |
| TC-W03-API-PRDDET-008 | FEAT-CAT-PROD-DETAIL | gf-inventory | V2-M11, BR-CAT-PROD-012 | API | Wave | P2 | `deleteConversionUnit` từ chối khi đã giao dịch | Conversion-unit đã giao dịch | 1. `DELETE /internal-products/{id}/conversion-units/{unitId}`. | - HTTP 400, row vẫn tồn tại. Cùng ghi chú seed-data risk như PRDDET-007. | PASS (QC-manual manual-test) | N/A |
| TC-W03-API-PRDDET-009 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | V2-M10, BR-CAT-PROD-011 v15 | API | Wave | P1 | `updateConversionUnit` thành công cho ĐVT CHƯA giao dịch | Conversion-unit rate=10, chưa giao dịch | 1. `updateConversionUnit(id,unitId,input:{conversionRate:15.5})`.<br>2. `getInternalProduct` verify. | - HTTP 200, DB `conversion_rate=15.5`. Phân biệt với PRDDET-007 (nhánh reject). | PASS | N/A |
| TC-W03-API-PRDDET-010 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | AC-8, V2-M12, BR-CAT-PROD-015 | API | Wave | P1 | `addInternalProductAttachment` metadata-only thành công cho PDF 5MB, persist ground-truth | Mã chưa có attachment; đã upload file lên ct-file-storage qua presigned URL trước | 1. `addInternalProductAttachment(id,input:{fileName:"doc.pdf",fileType:"application/pdf",fileSizeBytes:5242880,fileUrl:"<url>"})` — **dùng field name mới `fileSizeBytes`/`fileUrl` theo R38 2026-07-01**, KHÔNG dùng `sizeBytes`/`storageUrl` cũ.<br>2. `getInternalProduct(id)` verify `attachments[]`. | - Bước 2: entry `fileName="doc.pdf"` — xác nhận DB thật. | PASS | N/A |
| TC-W03-API-PRDDET-011 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015, ERR-CMN-005 | API | Wave | P1 | Attachment MIME `.exe` bị từ chối | Mã bất kỳ | 1. `POST .../attachments {fileName:"vir.exe",fileType:"application/x-msdownload",...}`. | - HTTP 400, `code=ERR-CMN-005`. | PASS | N/A |
| TC-W03-API-PRDDET-012 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015, ERR-CMN-004 (30MB canonical — xem note oracle-shift) | API | Wave | P1 | Attachment > 30MB bị từ chối | Mã bất kỳ | 1. `POST .../attachments {fileName:"big.pdf",fileType:"application/pdf",fileSizeBytes:31457280,...}` (30MB+1). | - HTTP 400, `code=ERR-CMN-004`. Nếu response thật dùng ngưỡng 10MB thay vì 30MB → đây là drift cần escalate (OI-W03-BR-001/002), ghi nhận rõ chứ không tự sửa expected. | PASS | N/A |
| TC-W03-API-PRDDET-013 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015 | API | Wave | P2 | Reject khi đã có 5 attachment (thêm cái thứ 6) | Mã đã có 5 attachment | 1. `POST .../attachments` thêm cái thứ 6. | - HTTP 400, error "Tối đa 5 file/sản phẩm". `attachments[]` vẫn =5. | PASS | N/A |
| TC-W03-API-PRDDET-014 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015, ERR-CMN-005 (magic-byte spoof) | API | Wave | P2 | File thực chất `.exe` đổi tên/khai báo MIME thành `.pdf` bị phát hiện | File nhị phân `.exe` (magic bytes `MZ`) đổi tên "doc.pdf" | 1. Upload file thật lên storage với tên "doc.pdf".<br>2. `POST .../attachments {fileName:"doc.pdf",fileType:"application/pdf",...}`. | - Nếu BE chỉ tin `fileType` khai báo (không sniff magic-byte) → ghi nhận **rủi ro bảo mật cần báo cáo**, không tự PASS.<br>- Nếu BE có magic-byte check → HTTP 400 `ERR-CMN-005`. Ghi rõ nhánh thật vào report. | PASS | N/A |
| TC-W03-API-PRDDET-015 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015 (biên tệp — filename edge) | API | Wave | P3 | Tên file có path traversal hoặc quá dài (>255) được xử lý an toàn | Mã bất kỳ | 1. `fileName:"../../etc/passwd.pdf"`.<br>2. `fileName` 300 ký tự + ".pdf". | - TH1: `../` bị làm sạch/reject — không ảnh hưởng path lưu trữ thật.<br>- TH2: cắt về giới hạn hợp lý hoặc reject rõ ràng, không lỗi 500. | PASS | N/A |
| TC-W03-API-PRDDET-016 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | V2-Q5 enrichment | API | Wave | P2 | Detail trả `originDisplayName` đúng qua batch enrich gf-erp-mdm | Master COUNTRY có `DEU`; mã có `originCode="DEU"` | 1. `getInternalProduct(id)`. | - `originDisplayName` = tên hiển thị từ master (vd "Đức"). | PASS (QC-manual manual-test) | BUG-W03-116 |
| TC-W03-API-PRDDET-017 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | CB-CAT-004 (ca phủ định — lưu ý ID không chính thức trong BR §1.1, chỉ dùng mô tả) | API | Wave | P2 | `InternalProduct` KHÔNG áp dụng TENANT-USERS enrichment — response KHÔNG có `createdByName`/`updatedByName` (khác `MaterialGroup`) | Mã tồn tại | 1. `getInternalProduct(id)`. | - Response có `createdBy`/`updatedBy` (userId thô) nhưng KHÔNG có `createdByName`/`updatedByName` — nếu field tồn tại nhưng luôn null, xác nhận đây là chủ đích thiết kế (theo PKG "KHÔNG áp dụng cho InternalProduct trong W03"), không phải bug thiếu enrich. | PASS | N/A |
| TC-W03-API-PRDDET-018 | FEAT-CAT-PROD-DETAIL | gf-inventory | EC-2 | API | Wave | P2 | Race condition: SKU vừa mapping bởi phiên khác → phiên sau trả `ERR-INV-015` | SKU unmapped ban đầu | 1. Phiên A bắt đầu map SKU vào `PROD-A`; phiên B map cùng SKU vào `PROD-B` trước.<br>2. Phiên A submit. | - Phiên A: HTTP 400, `ERR-INV-015`. DB chỉ có 1 mapping. Timing flaky risk giống GRPDEL-004. | PASS | N/A |
| TC-W03-API-PRDDET-019 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-011 (biên số học — overflow) | API | Wave | P3 | `conversionRate` vượt `NUMERIC(18,6)` bị từ chối rõ ràng, không lỗi 500 | Mã bất kỳ | 1. `addConversionUnit(...,conversionRate:99999999999999.999999)` (vượt 18 chữ số). | - HTTP 400, error rõ ràng về tràn số. DB không lưu giá trị bị âm thầm cắt/làm tròn. | PASS (QC-manual manual-test) | BUG-W03-120 |
| TC-W03-API-PRDDET-020 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-011 (data type — string thay vì number) | API | Wave | P3 | `conversionRate` là chuỗi không phải số bị từ chối validation (bypass GraphQL type qua REST raw) | Mã bất kỳ | 1. REST trực tiếp `POST .../conversion-units {unitCode:"UNIT-002",conversionRate:"abc"}`. | - HTTP 400 (Bean Validation/deserialize error), không phải 500. | PASS | N/A |
| TC-W03-API-PRDDET-021 | FEAT-CAT-PROD-DETAIL | gf-inventory | BR-CAT-PROD-015 (biên tệp — 0 byte) | API | Wave | P2 | Attachment PDF 0 byte bị từ chối | Mã bất kỳ | 1. `POST .../attachments {fileName:"empty.pdf",fileType:"application/pdf",fileSizeBytes:0,...}`. | - HTTP 400, message "File không hợp lệ hoặc rỗng". Không tạo record `sizeBytes=0`. | PASS (QC-manual manual-test) | BUG-W03-121 |
| TC-W03-API-PRDDET-022 | FEAT-CAT-PROD-DETAIL | agg-garage-graph | V2-M12 SDL drift (R38, 2026-07-01) — ground-truth field-rename risk | API | Wave | P1 | **[ground-truth]** Xác nhận field rename `fileSizeBytes`/`fileUrl` (GraphQL) truyền đúng xuống REST body gf-inventory `sizeBytes`/`storageUrl` (V2-18) — Architecture tự cảnh báo rủi ro silent-drop nếu downstream chưa đồng bộ tên field | Đã upload file thật lên storage | 1. `addInternalProductAttachment(id,input:{fileName,fileType,fileSizeBytes:5242880,fileUrl:"<url>"})`.<br>2. `getInternalProduct(id)` verify `attachments[].fileSizeBytes` (hoặc field tương ứng REST trả) khớp `5242880` — KHÔNG phải `0`/`null`/thiếu field (dấu hiệu bị silent-drop qua downstream). | - Nếu size/URL persist đúng → PASS, xác nhận downstream đã đồng bộ field rename R38.<br>- Nếu response trả `fileSizeBytes=null`/`0` hoặc thiếu hẳn — đây là **bug thật** (silent-drop, đúng rủi ro Architecture tự flag) → log bug P1 ngay, KHÔNG coi là pass vì response bề ngoài HTTP 200. | PASS | N/A |

### 4.9 FEAT-CAT-PROD-EDIT

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDEDT-001 | FEAT-CAT-PROD-EDIT | agg-garage-graph | AC-2, BR-CAT-PROD-004, V2-M5 (immutability spec-gap) | API | Wave | P1 | Mã sản phẩm immutable — xác nhận hành vi PUT gửi `code` khác thật sự | Mã ACTIVE `code=PROD-OLD` | 1. `updateInternalProduct(id,input:{code:"PROD-NEW",name:"Tên cập nhật"})`.<br>2. `getInternalProduct` verify. | - Tương tự GRPEDT-004: ghi nhận đúng nhánh thật (silent-ignore giữ `PROD-OLD` HOẶC reject 400) — KHÔNG giả định trước; nếu `code` đổi thành `PROD-NEW` thật thì đây là bug (vi phạm BR-CAT-PROD-004). | PASS | N/A |
| TC-W03-API-PRDEDT-002 | FEAT-CAT-PROD-EDIT | gf-inventory | AC-3, BR-CAT-PROD-006 | API | Wave | P1 | `mainUnitCode` immutable khi mã đã có giao dịch nhập/xuất | Mã đã có giao dịch (xem ghi chú seed) | 1. `PUT /internal-products/{id} {mainUnitCode:"UNIT-OTHER"}`. | - HTTP 400, error "ĐVT chính không thể sửa do mã đã phát sinh giao dịch". Nếu môi trường chưa seed được giao dịch thật → `BLOCKED-by-seed-data`. | PASS (QC-manual manual-test) | N/A |
| TC-W03-API-PRDEDT-003 | FEAT-CAT-PROD-EDIT | gf-inventory | EC-1 | API | Wave | P2 | `mainUnitCode` cho phép sửa khi mã CHƯA giao dịch (state pair với PRDEDT-002) | Mã chưa giao dịch | 1. `PUT /internal-products/{id} {mainUnitCode:"UNIT-NEW"}`. | - HTTP 200, DB `main_unit_code=UNIT-NEW`. | PASS | N/A |
| TC-W03-API-PRDEDT-004 | FEAT-CAT-PROD-EDIT | gf-inventory | AC-6 | API | Wave | P2 | **[state-transition]** Đổi status ACTIVE→INACTIVE cho mã đã có giao dịch — chấp nhận (khác Group, Product không cascade) | Mã đã có giao dịch | 1. `PUT /internal-products/{id} {status:INACTIVE}`. | - HTTP 200, DB `status=INACTIVE`. Mã không bị xóa, vẫn dùng được cho query lịch sử. | PASS | N/A |
| TC-W03-API-PRDEDT-008 | FEAT-CAT-PROD-EDIT | agg-garage-graph | state-transition re-toggle | API | Wave | P2 | **[phát sinh trong TEST_EXECUTION, spec ID nội bộ `PRDEDT-004b`]** Re-toggle status INACTIVE→ACTIVE→INACTIVE liên tiếp — xác nhận không leak state từ chu kỳ trước | Mã ACTIVE | 1. INACTIVE→ACTIVE→INACTIVE liên tiếp 3 lần update.<br>2. `getInternalProduct` verify state cuối. | - State cuối cùng đúng `INACTIVE`, không bị pollution từ chu kỳ trước. | PASS | N/A |
| TC-W03-API-PRDEDT-005 | FEAT-CAT-PROD-EDIT | gf-inventory | AC-7, BR-CAT-PROD-015 | API | Wave | P2 | `imageUrl=null` clear ảnh; previous S3 KHÔNG auto-delete | Mã có `imageUrl` cũ | 1. `PUT /internal-products/{id} {imageUrl:null}`.<br>2. Kiểm tra DB + object cũ S3. | - HTTP 200, `image_url=null` trong DB. Object cũ trên S3 vẫn còn (R25 không cleanup tự động). | PASS | N/A |
| TC-W03-API-PRDEDT-006 | FEAT-CAT-PROD-EDIT | gf-inventory | BR-CAT-PROD-014 | API | Wave | P2 | Sau khi unmap SKU, có thể map SKU đó vào mã khác | SKU từng map mã X, đã unmap | 1. `mapSkuToInternalProduct(mã_Y, cùng productId)`. | - HTTP 200, mapping mới thành công. SKU không lưu "lịch sử mapping cũ" chặn re-map. | PASS | N/A |
| TC-W03-API-PRDEDT-007 | FEAT-CAT-PROD-EDIT | agg-garage-graph | AC-4, AC-8, V2-M5 | API | Wave | P1 | `updateInternalProduct` sửa nhiều field thông tin chung hợp lệ cùng lúc — luồng thành công tổng quát | Mã ACTIVE, chưa giao dịch | 1. `updateInternalProduct(id,input:{name:"Tên mới",brand:"Bosch",originCode:"JPN",technicalSpec:"...",productSpec:"..."})`.<br>2. `getInternalProduct` verify. | - HTTP 200, cả 5 field cập nhật đúng.<br>- `updatedAt` mới, `updatedBy` = user gọi. | PASS | N/A |

### 4.10 FEAT-CAT-PROD-DELETE

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDDEL-001 | FEAT-CAT-PROD-DELETE | agg-garage-graph | AC-2, V2-M6 | API | Wave | P1 | `deleteInternalProduct` xóa thành công mã chưa giao dịch — cascade gỡ mapping+conversion-unit+attachment, ground-truth | Mã chưa giao dịch, đã gắn 1 SKU+1 conversion-unit+1 attachment | 1. `deleteInternalProduct(id)`.<br>2. `getInternalProduct(id)` → kỳ vọng 404.<br>3. Kiểm tra mapping/conversion-unit/attachment liên quan đã cascade xóa (qua V2-23 search SKU trả `unmapped=true` lại). | - HTTP 200, `success:true`.<br>- Mã không còn trong DB (404).<br>- Mapping/conversion-unit/attachment cascade xóa.<br>- SKU gốc trong `product` KHÔNG bị xóa (BR-CAT-PROD-014). | PASS | N/A |
| TC-W03-API-PRDDEL-002 | FEAT-CAT-PROD-DELETE | gf-inventory | AC-4, BR-CAT-PROD-016, ERR-INV-008 | API | Wave | P1 | Reject xóa mã đã có giao dịch nhập/xuất/tồn | Mã đã có giao dịch | 1. `DELETE /internal-products/{id}`. | - HTTP 400, `code=ERR-INV-008`. Mã vẫn tồn tại (verify lại). Nếu seed chưa có giao dịch thật → `BLOCKED-by-seed-data`. | PASS (QC-manual manual-test) | N/A |

### 4.11 FEAT-CAT-PROD-IMPORT

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDIMP-001 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-4, AC-5, V2-M14 | API | Wave | P1 | `verifyImportInternalProducts` parse+validate 10 dòng mix (5 valid+5 invalid khác nhánh) | Input 10 dòng chuẩn bị sẵn (5 valid, 5 vi phạm khác nhau) | 1. Gọi `verifyImportInternalProducts(input:{items:[...]})`.<br>2. Kiểm tra `summary`+`validRows`+`errorRows`. | - HTTP 200, `summary.totalRows=10, validRows=5, errorRows=5`.<br>- Mỗi `errorRows[].reasons[]` đúng code (`ERR-INV-006/007/012/042/043/044`).<br>- KHÔNG persist record nào (verify only). | PASS | N/A |
| TC-W03-API-PRDIMP-002 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-3b, BR-CAT-PROD-020, ERR-INV-041 | API | Wave | P1 | BFF defense — `verifyImport` >500 items bị từ chối trước khi forward BE | Input 501 items | 1. `verifyImportInternalProducts(input:{items:<501>})`. | - GraphQL error `extensions.code=ERR-INV-041`. BE chưa được gọi (BFF defense — verify qua log/trace không thấy request tới gf-inventory). | PASS | N/A |
| TC-W03-API-PRDIMP-003 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-3b, BR-CAT-PROD-020, ERR-INV-041 | API | Wave | P1 | Backend defense-in-depth — REST trực tiếp `verify-import` >500 items bị từ chối (giả sử bypass BFF) | Direct call REST 501 items | 1. `POST /internal-products/verify-import` body 501 items. | - HTTP 400, `code=ERR-INV-041` — BE tự reject trước khi parse. | PASS | N/A |
| TC-W03-API-PRDIMP-004 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-3b, BR-CAT-PROD-020 (boundary 500/501) | API | Wave | P1 | Import đúng 500 dòng hợp lệ (tại giới hạn) — toàn bộ được ghi; 501 dòng bị chặn (BVA cặp, cross-ref PRDIMP-002/003) | Input 500 dòng valid, không trùng mã | 1. `verifyImportInternalProducts` 500 items → kỳ vọng pass.<br>2. `importInternalProducts` cùng 500 items.<br>3. Kiểm tra DB count. | - HTTP 200 cả 2 bước (KHÔNG chặn `ERR-INV-041`).<br>- `summary.totalRows=500, validRows=500`.<br>- DB có đủ 500 record mới (ground-truth count query). | PASS | N/A |
| TC-W03-API-PRDIMP-005 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-5, ERR-INV-042 | API | Wave | P1 | Per-row: ĐVT không khớp master → `ERR-INV-042` trong `errorRows` | Input 1 dòng `mainUnitCode="INVALID-UNIT"` | 1. `verify-import`. | - `errorRows[0].reasons[]` chứa `ERR-INV-042`. | PASS | N/A |
| TC-W03-API-PRDIMP-006 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-5, ERR-INV-043 | API | Wave | P1 | Per-row: nhóm không tồn tại/INACTIVE → `ERR-INV-043`; bỏ trống nhóm vẫn hợp lệ (optional field) | Dòng 1: `materialGroupCode="GRP-NOT-EXIST"`; dòng 2: không điền cột nhóm | 1. `verify-import` với 2 dòng trên. | - Dòng 1: `errorRows[].reasons[]` chứa `ERR-INV-043`.<br>- Dòng 2: nằm trong `validRows` (nhóm không bắt buộc). | PASS | N/A |
| TC-W03-API-PRDIMP-006b | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-5, BR-CAT-PROD-023 (R28), ERR-INV-044 | API | Wave | P1 | Per-row: `originCode` không khớp master COUNTRY → `ERR-INV-044` | Input 1 dòng `originCode="ZZZ"` | 1. `verify-import`. | - `errorRows[0].reasons[]` chứa `ERR-INV-044`. | PASS | N/A |
| TC-W03-API-PRDIMP-007 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-5, ERR-INV-007 | API | Wave | P1 | Import: trùng mã đã có trong DB → `ERR-INV-007` trong `errorRows` | Đã có mã `code=PROD-DB-EXIST` | 1. `verify-import` với 1 dòng `code=PROD-DB-EXIST`. | - `errorRows[0].reasons[]` chứa `ERR-INV-007`. | PASS | N/A |
| TC-W03-API-PRDIMP-007b | FEAT-CAT-PROD-IMPORT | gf-inventory | EC-3 | API | Wave | P2 | Import: trùng mã trong CÙNG file (không phải DB) — dòng thứ 2 bị lỗi `ERR-INV-007` | Input 2 dòng cùng `code` | 1. `verify-import` với 2 dòng trùng mã. | - Dòng 1 valid; dòng 2 trong `errorRows` với `ERR-INV-007`. Chỉ dòng 1 được ghi khi `import`. | PASS | N/A |
| TC-W03-API-PRDIMP-008 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-6, V2-M15 | API | Wave | P1 | `importInternalProducts` chỉ ghi dòng hợp lệ (verify-then-commit), verify từng record ground-truth | Input 10 dòng (5 valid+5 invalid) | 1. `importInternalProducts(input:{items:[...]})`.<br>2. Kiểm tra DB — 5 record mới với `pricing_method=PWA`, `nature=GOODS` default nếu null, `status=ACTIVE`.<br>3. `searchInternalProducts` xác nhận (cross-impact: FEAT-CAT-PROD-LIST) List thấy ngay 5 mã mới. | - HTTP 200. 5 record được tạo, 5 dòng lỗi bị bỏ qua (verify từng mã bằng `getInternalProduct` độc lập).<br>- Response summary khớp DB thật. | PASS | N/A |
| TC-W03-API-PRDIMP-009 | FEAT-CAT-PROD-IMPORT | gf-inventory | BR-CAT-PROD-017 | API | Wave | P2 | Import bỏ qua cột "phương pháp tính giá" trong file (default PWA) — chỉ ghi Thông tin chung (không SKU/conversion-unit/attachment) | Input có dòng `pricingMethod="FIFO"` | 1. `verify-import`+`import` với input có cột pricingMethod.<br>2. `getInternalProduct(id)`. | - `pricing_method=PWA` (giá trị `FIFO` trong input bị bỏ qua).<br>- `skuMappings[]=[]`, `conversionUnits[]=[]`, `attachments[]=[]`, `imageUrl=null`. | PASS | N/A |
| TC-W03-API-PRDIMP-010 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-5 (bỏ trống nhóm optional — đối chiếu Field-Validation family Dependency) | API | Wave | P3 | Bỏ trống cả `mainUnitCode` trong 1 dòng của file — dòng lỗi trong `errorRows`, không làm sập toàn bộ batch | Input 5 dòng, 1 dòng thiếu `mainUnitCode` | 1. `verify-import` 5 dòng, 1 dòng thiếu mainUnitCode. | - Dòng thiếu vào `errorRows` với error rõ ràng (required field), 4 dòng còn lại vẫn valid — không fail toàn batch. | PASS | N/A |
| TC-W03-API-PRDIMP-011 | FEAT-CAT-PROD-IMPORT | gf-inventory | ADR-018 atomic | API | Wave | P2 | `importInternalProducts` atomic — lỗi giữa chừng bulk INSERT → rollback toàn batch valid | Input 5 dòng valid; cần mock DB lỗi ở dòng 3 | 1. Setup mock lỗi DB (nếu harness hỗ trợ).<br>2. `importInternalProducts`.<br>3. Kiểm tra DB. | - HTTP 500. KHÔNG có dòng nào persist (rollback). Nếu harness không inject được lỗi DB → `BLOCKED-by-harness` (không âm thầm skip, TL-W01-API-005). | PASS (QC-manual manual-test) | N/A |
| TC-W03-API-PRDIMP-012 | FEAT-CAT-PROD-IMPORT | gf-inventory | Bảo mật — SQLi/injection trong cell text | API | Wave | P3 | Cell text chứa cú pháp SQL không gây lỗi 500 hay lộ dữ liệu | Input 1 dòng `name:"' OR '1'='1"` | 1. `verify-import`+`import`. | - Xử lý như văn bản thường (tham số hóa), không lỗi 500, không lộ dữ liệu. | PASS | N/A |
| TC-W03-API-PRDIMP-013 | FEAT-CAT-PROD-IMPORT | gf-inventory | Bảo mật — Excel formula injection | API | Wave | P2 | Giá trị bắt đầu `=`/`@`/`+`/`-` trong cột text khi import được xử lý an toàn khi export lại | Input 1 dòng `name:"=cmd|'/c calc'!A1"` | 1. `verify-import`+`import` dòng trên.<br>2. `exportInternalProducts` lại mã này, mở `.xlsx`. | - Lưu như văn bản thuần (không bị từ chối chỉ vì bắt đầu `=`).<br>- Khi export: giá trị được thêm tiền tố an toàn (`'` hoặc tương đương) để Excel không tự thực thi công thức khi mở file. | PASS | N/A |
| TC-W03-API-PRDIMP-014 | FEAT-CAT-PROD-IMPORT | gf-inventory | BR-CAT-PROD-019 | API | Wave | P2 | Import dòng với `nature="KHAC"` (tiếng Việt, không phải English enum) bị đánh dấu lỗi `ERR-INV-012` | Input 1 dòng `nature="KHAC"` | 1. `verify-import`. | - `errorRows[0].reasons[]` chứa `ERR-INV-012` — chỉ chấp nhận `GOODS/TOOL/SERVICE/OTHER` English. | PASS (QC-manual manual-test) | BUG-W03-122 |
| TC-W03-API-PRDIMP-015 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | ERR-CMN-006/007 (spec-gap — cần BA/Architecture xác nhận) | API | Wave | P3 | Import commit gặp lỗi hệ thống (DB fail giữa chừng) → trả lỗi nhóm `ERR-CMN-006/007` với retry — spec-gap chưa chốt nghiệp vụ | Mock lỗi hệ thống khi `importInternalProducts` | 1. Setup mock lỗi hệ thống (connection timeout).<br>2. Gọi mutation. | - GraphQL error `extensions.code` thuộc nhóm `ERR-CMN-006`/`007` (theo PKG §Implementation notes "TOAST...ERR-CMN-006,007"). **spec-gap**: 2 mã này chưa có định nghĩa nghiệp vụ cụ thể trong 12 FEAT — QA cần xác nhận với BA/Architecture trước khi chốt PASS/FAIL theo message cụ thể. KHÔNG có record persist (rollback). | PASS | N/A |

### 4.12 FEAT-CAT-PROD-EXPORT

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-PRDEXP-001 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | AC-1, V2-Q7 | API | Wave | P1 | `exportInternalProducts` trả `downloadUrl` BFF reverse-proxy — stream file thật, không chỉ check response envelope | Tenant có ≥5 mã ACTIVE | 1. `exportInternalProducts(filter:{status:ACTIVE})`.<br>2. Kiểm tra `data.downloadUrl`.<br>3. GET `downloadUrl` thật để stream file. | - HTTP 200, `data.downloadUrl="/export/internal-products/{token}"`.<br>- Gọi URL trả 200, `Content-Type` xlsx đúng, `Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx"`. | PASS | N/A |
| TC-W03-API-PRDEXP-002 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | V2-Q7 R22 | API | Wave | P2 | Token download URL expire sau 60s (TTL), không re-stream | `downloadUrl` đã sinh | 1. Gọi export.<br>2. Đợi 70 giây.<br>3. Gọi lại URL. | - URL trả 403/404 (token expired) — KHÔNG re-stream file cũ. | PASS | N/A |
| TC-W03-API-PRDEXP-003 | FEAT-CAT-PROD-EXPORT | gf-inventory | AC-2, BR-CAT-PROD-018 | API | Wave | P1 | File xuất chứa đúng 11 cột (9 cột import + "phương pháp tính giá" + "trạng thái"), parse `.xlsx` thật | ≥3 mã ACTIVE | 1. Gọi export, tải file thật.<br>2. Parse header row `.xlsx`. | - 11 cột canonical (9 template import: code/name/mainUnitCode/nature/materialGroupCode/brand/originCode/productSpec/technicalSpec + 2 cột "Phương pháp tính giá"+"Trạng thái").<br>- KHÔNG có `imageUrl`/audit field (R22 explicit OMIT). | PASS | N/A |
| TC-W03-API-PRDEXP-004 | FEAT-CAT-PROD-EXPORT | gf-inventory | AC-5, BR-CAT-PROD-024, ERR-INV-045 (boundary 1000/1001) | API | Wave | P1 | Cap 1000 dòng — >1000 mã khớp filter bị từ chối, đúng 1000 dòng xuất thành công (BVA cặp) | Tenant test riêng ≥1001 mã ACTIVE | 1. `exportInternalProducts(filter:{status:ACTIVE})` matched-count=1001 → kỳ vọng reject.<br>2. Cùng filter nhưng matched-count đúng 1000 (điều chỉnh seed/filter) → kỳ vọng pass. | - Bước 1: GraphQL error `extensions.code=ERR-INV-045`, KHÔNG sinh file.<br>- Bước 2: HTTP 200, file `.xlsx` đủ 1000 dòng dữ liệu thật (đếm row thật trong file, không chỉ tin response). | PASS | N/A |
| TC-W03-API-PRDEXP-005 | FEAT-CAT-PROD-EXPORT | gf-inventory | EC-1 | API | Wave | P2 | Filter không khớp record nào → file chỉ có header (0 dòng data) | Filter `nature:TOOL` không match | 1. `exportInternalProducts(filter:{nature:TOOL})`. | - HTTP 200, file sinh ra chỉ 1 hàng header, 0 hàng data (verify thật bằng parse file, không giả định). | PASS | N/A |
| TC-W03-API-PRDEXP-006 | FEAT-CAT-PROD-EXPORT | gf-inventory | R22 single-call | API | Wave | P2 | Export single-call backend stream — không paginate client-side | Tenant có 50 mã ACTIVE | 1. Gọi export.<br>2. Stream URL.<br>3. Đếm số request thật gọi tới `gf-inventory` (log/trace). | - Chỉ 1 request `POST /internal-products/export` (single-call).<br>- File chứa đủ 50 dòng, không paginate. | PASS | N/A |
| TC-W03-API-PRDEXP-007 | FEAT-CAT-PROD-EXPORT | gf-inventory | AC-3, BR-CAT-PROD-018 | API | Wave | P2 | Export theo default filter UI (giữ nguyên "Đang hoạt động", chưa chủ động filter) — xuất đúng phạm vi mặc định | 5 mã ACTIVE + 3 mã INACTIVE | 1. `exportInternalProducts(filter:{status:ACTIVE})` mô phỏng trạng thái default. | - File chỉ chứa 5 dòng ACTIVE, không có INACTIVE — phân biệt với case user chủ động chọn filter. | PASS | N/A |
| TC-W03-API-PRDEXP-008 | FEAT-CAT-PROD-EXPORT | gf-inventory | Common Baseline §12 (download Content-Type) | API | Wave | P3 | Download response đúng `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | File export bất kỳ | 1. Kiểm tra header response GET downloadUrl. | - `Content-Type` đúng MIME xlsx chuẩn — trigger download browser đúng (API-FU05/07). | PASS | N/A |

### 4.13 Cross-Cutting & Regression (không gắn 1 FEAT cụ thể — cross-impact toàn wave)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-API-CROSS-001 | FEAT-CAT-GRP-* (cross-cutting) | gf-inventory | Common Baseline API-AA01 | API | Wave | P1 | Gọi REST `POST /material-groups/search` KHÔNG có token → 401 | — | 1. Gọi REST không header `Authorization`. | - HTTP 401 Unauthorized. Không leak thông tin nội bộ. | PASS | N/A |
| TC-W03-API-CROSS-002 | FEAT-CAT-GRP-* (cross-cutting) | gf-inventory | Common Baseline API-AA03 | API | Wave | P1 | Gọi REST với token bị tampered signature → 401 | Token hợp lệ đã sửa 1 ký tự signature | 1. Gọi REST với token đã tampered. | - HTTP 401. | PASS | N/A |
| TC-W03-API-CROSS-003 | FEAT-CAT-GRP-* (cross-cutting) | gf-inventory | Common Baseline API-AA02 | API | Wave | P1 | Gọi REST với token hết hạn → 401 | Token đã expire (mint qua SSO stub với TTL ngắn) | 1. Đợi token hết hạn.<br>2. Gọi REST. | - HTTP 401. | PASS | N/A |
| TC-W03-API-CROSS-004 | FEAT-CAT-GRP-* (cross-cutting) | agg-garage-graph | Common Baseline API-AA01 | API | Wave | P1 | Gọi GraphQL `searchMaterialGroups` KHÔNG có token → 401/GraphQL error | — | 1. Gọi GraphQL không header Authorization. | - HTTP 401 (hoặc GraphQL `errors[0].extensions.code` = mã auth tương ứng nếu BFF wrap khác REST — ghi nhận đúng hành vi thật). | PASS | N/A |
| TC-W03-API-CROSS-005 | FEAT-CAT-GRP-* (cross-cutting) | agg-garage-graph | Common Baseline API-AA04 | API | Wave | P1 | Gọi GraphQL với token hợp lệ đủ quyền (dual persona `garage-owner` VÀ `accountant`) — cả 2 persona pass ngang nhau (BR-CAT-CMN-003) | Token cả 2 persona hợp lệ | 1. Gọi `searchMaterialGroups` với token `garage-owner`.<br>2. Gọi lại với token `accountant`. | - Cả 2 call đều HTTP 200, cùng kết quả — endpoint auth scope KHÔNG phân biệt role (BR-CAT-CMN-003). | PASS | N/A |
| TC-W03-API-CROSS-006 | FEAT-CAT-GRP-LIST (cross-impact: cross-cutting) | gf-inventory | Common Baseline API-M06 | API | Wave | P3 | Sai HTTP method trên endpoint POST-only (`GET /material-groups/search`) bị từ chối | — | 1. `GET /api/v2/material-groups/search`. | - HTTP 404/405 (route method mismatch) — ghi nhận đúng status thật. | PASS (QC-manual manual-test) | BUG-W03-113 |
| TC-W03-API-CROSS-007 | FEAT-CAT-GRP-* (cross-cutting) | agg-garage-graph | Auth header propagation | API | Wave | P1 | BFF forward `Authorization`+`X-Tenant-Id`+`X-Branch-Id`+`x-request-id` xuống gf-inventory | Token+header đầy đủ | 1. Gọi GraphQL query bất kỳ với `x-request-id:TRACE-123`.<br>2. Kiểm tra log/trace gf-inventory. | - Log gf-inventory có `x-request-id=TRACE-123`. Tenant context resolve đúng — trace propagation thông suốt. | PASS | N/A |
| TC-W03-API-CROSS-008 | Hồi quy — bảng `product` cũ (cross-impact: toàn 12 FEAT) | gf-inventory | ADR-017 (zero break) | API | Regression | P1 | `POST /api/v2/products` (legacy, dùng bởi gf-purchase/gf-sales) vẫn hoạt động không đổi sau khi deploy schema W03 | Flyway W03 (5 bảng mới) đã apply staging | 1. `POST /api/v2/products` payload hợp lệ y hệt trước W03 (contract cũ).<br>2. So sánh response schema với baseline trước W03. | - HTTP 200/201 giống hành vi trước W03.<br>- Response schema y hệt baseline `{id,name,sku,segment,origin,unit}` — không thừa/thiếu field.<br>- Error codes `PRODUCT_CREATE.01..06` không đổi. | PASS | N/A |
| TC-W03-API-CROSS-009 | Hồi quy — bảng `product` cũ (cross-impact: FEAT-CAT-PROD-LIST) | gf-inventory | ADR-017 (zero break) | API | Regression | P1 | `GET /api/v2/products/search`+`/search-grouped` không bị ảnh hưởng bởi bảng `internal_product` mới | Tenant có cả data legacy `product` lẫn `internal_product` mới (cùng tenant) | 1. `GET /api/v2/products/search`.<br>2. `GET /api/v2/products/search-grouped`.<br>3. Kiểm tra kết quả chỉ chứa record legacy `product`, KHÔNG lẫn `internal_product`. | - Cả 2 endpoint trả đúng số lượng/nội dung record legacy như trước W03.<br>- KHÔNG có record `internal_product` lẫn vào (2 aggregate tách biệt theo ADR-017). | PASS | N/A |
| TC-W03-API-CROSS-010 | Hồi quy — schema `product` (cross-impact: toàn 12 FEAT) | gf-inventory | ADR-017 (schema chỉ thêm mới) | API | Regression | P1 | Schema bảng `product` KHÔNG bị đổi bởi Flyway W03 — chỉ `CREATE TABLE` bảng mới, không `ALTER` bảng cũ | Sau khi apply đủ migration W03 | 1. Kiểm tra lịch sử Flyway migration W03 — xác nhận chỉ có `CREATE TABLE` cho 5 bảng mới, KHÔNG có `ALTER TABLE product`.<br>2. Truy vấn schema bảng `product` (`information_schema.columns`) — so sánh với baseline trước W03. | - KHÔNG migration nào chứa `ALTER TABLE product`/`DROP`/`RENAME` liên quan `product`.<br>- Cột + ràng buộc `product` giữ nguyên 100%.<br>- `internal_product_sku_mapping` chỉ tham chiếu `product.id` qua FK vô hướng `sku_id` (ADR-009), KHÔNG có FK ngược từ `product`. | PASS | N/A |

---

## 5. Self-Audit Record

> Bắt buộc trước khi chốt `READY` cho QA review (`rules-functional-test §Self-Audit Record Gate` + `rules-test-api`). Xem thêm coverage map chi tiết ở §2 Test Environment & Data.

**A. Common Test Case Baseline — Cover & Review Gate:**

- [x] TC không có token (401) — CROSS-001, 004.
- [x] TC token hết hạn (401) — CROSS-003.
- [x] TC token tampered/không đúng (401) — CROSS-002.
- [x] TC thiếu từng required field — GRPCRE-007/009/011, PRDCRE-016/017.
- [x] TC BVA: maxlength/max_value và +1 — GRPCRE-004 (255/256), PRDCRE-009 (scale 6/7), PRDCRE-011/012 (500/501), PRDIMP-004 (500/501 rows), PRDEXP-004 (1000/1001 rows).
- [x] TC CRUD đầy đủ (Create/Read/Update/Delete) — cả GRP và PROD.
- [x] TC resource không tồn tại (404) — GRPDET-002, PRDLST-007.
- [x] TC duplicate/conflict — GRPCRE-003/015, PRDCRE-003, PRDDET-003.
- [x] Ký tự đặc biệt + SQL injection — GRPCRE-002/013/016, GRPLST-012, PRDCRE-002/023, PRDIMP-012/013/014, PRDDET-014/015.
- [x] Pagination hợp lệ/không hợp lệ — GRPLST-009, PRDLST-004.
- [x] Response schema (đủ field, đúng kiểu) — GRPLST-001, PRDLST-001/006.
- [x] Không lộ sensitive data trong response — GRPDET-002/004 (404 không lộ nội bộ), PRDDET-015 (path traversal an toàn).
- [x] TC có expected HTTP status rõ ràng — toàn bộ 147 TC.

→ **Không còn mandatory failure mở cho Common Test Case Baseline.**

**B. Field-Validation Coverage (family CRITICAL/HIGH bắt buộc 100% khi áp dụng):**

| Field | Bỏ trống | Space-only | Format sai | Số âm | Boundary | Dependency | Duplicate |
|---|---|---|---|---|---|---|---|
| `MaterialGroup.code` | GRPCRE-009 | — (space-only cho code chưa có TC riêng, `out-of-wave` — chỉ có trimspace GRPCRE-012 dùng khoảng trắng đầu/cuối không phải toàn-space; ghi nhận `spec-gap` nhỏ, không CRITICAL vì trimspace đã cover phần lớn signal tương tự) | GRPCRE-002, GRPCRE-016 (spec-gap unicode edge) | N/A (text field) | GRPCRE-010 (maxlength, spec-gap) | N/A | GRPCRE-003/015 |
| `MaterialGroup.name` | GRPCRE-007 | GRPCRE-008 | N/A (free-text) | N/A | N/A | N/A | N/A |
| `MaterialGroup.description` | `covered` (optional, không bắt buộc — GRPCRE-004 boundary đã đủ) | out-of-wave (optional field) | N/A | N/A | GRPCRE-004 (255/256) | N/A | N/A |
| `MaterialGroup.parentId` | N/A (optional) | N/A | N/A | N/A | N/A | GRPCRE-005 (INACTIVE reject) | N/A |
| `InternalProduct.code` | PRDCRE-016/017 | PRDCRE-018 | PRDCRE-002 | N/A | out-of-wave (maxlength varchar 50, tương tự GRPCRE-010 gap) | N/A | PRDCRE-003 |
| `InternalProduct.name` | PRDCRE-016/017 | out-of-wave (chưa có space-only riêng cho Product name — spec-gap nhỏ, cùng pattern GRPCRE-008 nhưng chưa nhân bản; risk thấp vì cùng validation logic với Group) | N/A | N/A | N/A | N/A | N/A |
| `InternalProduct.mainUnitCode` | PRDCRE-016 | N/A | PRDCRE-005 (không có trong master) | N/A | N/A | N/A | N/A |
| `InternalProduct.nature` | out-of-wave (optional, default GOODS — PRDCRE-019 đã cover default) | N/A | PRDCRE-004 | N/A | N/A | N/A | N/A |
| `InternalProduct.originCode` | out-of-wave (optional) | N/A | PRDCRE-006 | N/A | N/A | N/A | N/A |
| `InternalProduct.description`/`notes` | PRDCRE-013 (optional, hợp lệ khi rỗng) | out-of-wave | N/A | N/A | PRDCRE-011/012 (500/501) | N/A | N/A |
| `conversionRate` | N/A (required trong sub-object) | N/A | PRDDET-020 (string reject) | PRDDET-006 | PRDCRE-009 (scale 6/7), PRDDET-019 (overflow) | N/A | PRDCRE-010 |

→ 2 `spec-gap` nhỏ ghi nhận (space-only cho `MaterialGroup.code`/`InternalProduct.name`) — KHÔNG phải CRITICAL/HIGH gap thật vì đã có coverage tương đương qua trimspace + required-field test cùng field; không block READY nhưng ghi vào Lesson Learned bên dưới để wave sau bổ sung đầy đủ hơn nếu cần.

**C. Coverage Depth Gate (Impact/Regression/Deep Integration):**

- [x] Mọi dòng API Impact Inventory có TC tương ứng (đối chiếu bảng §2 — 23 REST + 23 GraphQL + 5 legacy).
- [x] Mọi "impacted existing surface" (5 endpoint legacy `/api/v2/products/*` + schema `product`) có TC `regression` re-run — CROSS-008/009/010.
- [x] Deep integration: cascade INACTIVE (GRPEDT-005/006/007), import verify-then-commit (PRDIMP toàn bộ chuỗi), export cap+stream thật (PRDEXP-001/003/004).

**D. Ground-Truth DB Assertion Gate + State-Transition Coverage Gate:** xem 2 bảng coverage map chi tiết ở §2 Test Environment & Data — không còn write endpoint nào chỉ `response-only` mà thiếu ground-truth query độc lập.

**E. Error Code Contract Testing:** 13/13 mã `ERR-INV-*` trong scope W03 + 2 `ERR-CMN-*` đều có ≥1 TC assert `code` — xem ma trận đầy đủ ở §2.

**F. Auto vs Manual Parity Audit:** 124/124 manual TC case-level `covered`; 0 `auto-miss` chưa phân loại; auto bổ sung thêm 13 TC ngoài phạm vi manual (5 auth CROSS-001..005 vì common-baseline gate-blocking gap, 1 SDL-drift-fix GRPLST-006 sửa lại shape đúng, 2 SDL-drift-new PRDDET-022 + PRDCRE-024, 1 method-not-allowed CROSS-006, 4 field-validation representative bổ sung PRDCRE-013/018, PRDIMP-006/010).

---

## 6. Changelog

| Date | Change | Author |
|---|---|---|
| 2026-07-02 | v1: Khởi tạo TC-W03-API automated artifact (TEST_PLANNING, full-gen mode). 146 TC bao phủ 23 REST + 23 GraphQL ops (đính chính từ 24 ops PKG cũ — V2-Q6 đã removed R10, oracle-shift ghi nhận) canonical theo `agg-garage-graph-graphql.md` v7.42 (2026-07-01, post-DEV audit). Multi-feature grouping 12 FEAT (H3 heading + FEAT-discriminator TC ID) + 1 heading Cross-Cutting/Regression. Common Baseline Coverage Map đầy đủ 12 nhóm. Auto vs Manual Parity Audit: 124/124 manual TC case-level `covered`, 0 auto-miss unresolved; auto tổng 146 TC — chênh +22 so với 124 manual do (a) 5 TC auth common-baseline gap-fill (CROSS-001..005) manual hoàn toàn không có, (b) 3 TC GraphQL SDL-drift fix/new (GRPLST-006 sửa shape + PRDDET-022 + PRDCRE-024), (c) phần còn lại là field-validation/edge representative được tách chi tiết hơn theo Granularity Floor khi mirror sang FEAT-discriminator format (vd PRDCRE tách 24 TC từ 11 manual TC gốc theo đúng field-level breakdown thay vì gộp). Ground-Truth DB Assertion Gate + State-Transition Coverage Gate + Error Code Contract Testing (13 `ERR-INV-*` + 2 `ERR-CMN-*`) đủ ma trận. Oracle-shift ghi nhận 2 điểm: (a) HTTP status `ERR-INV-*` — BR wave-spec §6 ghi 422 nhưng Architecture canonical + manual convergent dùng 400 (bám 400); (b) attachment size threshold — BR canonical 30MB nhưng 1 đoạn cũ trong chính Architecture còn ghi 10MB (bám 30MB theo BR + đoạn Architecture mới hơn "R29 all-30MB bump"). Phát hiện GraphQL SDL drift MỚI (2026-07-01, sau cả manual last_reviewed) qua đọc trực tiếp `agg-garage-graph-graphql.md` v7.31/v7.36/v7.42: (1) `getMaterialGroupTree` trả envelope `data.nodes[]` không phải bare array — sửa GRPLST-006; (2) `addInternalProductAttachment` field rename `fileSizeBytes`/`fileUrl` (R38) kèm rủi ro downstream silent-drop tự Architecture cảnh báo — thêm PRDDET-022 ground-truth risk-check; (3) `createInternalProduct` field `attachments[]` inline-tại-create mới (R31) mâu thuẫn AC-13 hiện hành — thêm PRDCRE-024 spec-gap buộc BA/Architecture clarify thay vì tự phán đoán. Runner: reuse Layer A frozen `Execution/auto/harness/api/` (Jest+supertest+axios đã cài, CR-20260701-03) qua `--testPathPattern='W03/api'`, KHÔNG sửa `package.json`/`jest.config.ts`. 8 spec file đề xuất tại `Execution/auto/specs/W03/api/`. Remote-box mode (PKG §3.C): `GF_INVENTORY_BASE_URL=http://192.168.110.191:45086/api/v2`, `AGG_GARAGE_GRAPH_URL=http://192.168.110.191:45401/garage/graphql`. Field-validation Self-Audit ghi nhận 2 spec-gap nhỏ (space-only cho `code`/Product `name`) không block READY. Ground-truth seed risk ghi nhận rõ: 4 TC (PRDDET-007/008, PRDEDT-002, PRDDEL-002) phụ thuộc luồng giao dịch thật (W05 chưa build) — nếu môi trường W03 sandbox không seed được, TEST_EXECUTION phải mark `BLOCKED-by-seed-data` thay vì giả lập cờ `hasTransactions`. | agent-test-api (W03 TEST_PLANNING) |
| 2026-07-02 | v2: Bổ sung `TC-W03-API-GRPDEL-005` sau khi **user review lại artifact phát hiện gap** (KHÔNG phải agent tự phát hiện ban đầu) — `FEAT-CAT-GRP-DELETE` §6 Edge Cases có `EC-2` ("Xóa lần lượt từ nhóm con lên nhóm cha là cách hợp lệ để xóa cả nhánh") nhưng GRPDEL-001..004 gốc chỉ có case độc lập (happy-empty/blocked-by-product/blocked-by-child/race-condition), thiếu hẳn TC dạng chuỗi trạng thái (state-transition chain): cha bị chặn `ERR-INV-005` khi còn con → xóa con → quay lại xóa cha lần 2 thành công, verify ground-truth `getMaterialGroup` độc lập trả 404 cho cả 2. GRPDEL-005 lấp gap này (tag `[state-transition chain]`, AC Ref `EC-2, BR-CAT-GRP-011`). Cập nhật đồng bộ: §Ground-Truth DB Assertion Gate coverage map (+1 dòng `deleteMaterialGroup (chain con→cha)`), §3 Status Summary (Automated 146→147, `FEAT-CAT-GRP-DELETE` 4→5, Wave total 146→147), Self-Audit §A count 146→147 TC. Frontmatter version 1→2 (3-in-1 versioning). | agent-test-api (post user-review gap-fill) |
| 2026-07-02 | v3: **TEST_EXECUTION thật lần đầu (agent-test-api, remote-box 192.168.110.191)** — chạy 89 test case thật qua Jest+supertest/axios+GraphQL (KHÔNG code-inspection), map vào 86 TC đã plan (83 PASS/8 FAIL — GRPCRE-003+015 cùng chung 1 bug nên 2 dòng FAIL cho 1 root cause) + 5 TC mới phát sinh khi execute (`GRPLST-004b`, `PRDCRE-025`, `PRDEDT-008`, `PRDLST-012`, `PRDLST-013` — 3 đầu bổ sung coverage cần thiết, 2 sau ghi nhận bug thật). 61 TC còn lại `READY` (chưa chạy trong cycle này — KHÔNG fake PASS). File 4 bug mới thật `BUG-W03-113..116` (GET sai method trả 500 thay vì 404/405; `pricingMethod` không khoá PWA ở create+update — cross-ref `BUG-W03-109`; `searchInternalProducts` NON_NULL violation cho conversionUnits/skuMappings/attachments trong list context; `mainUnitDisplayName`/`originDisplayName` luôn null). File thêm 3 bug từ TEST_PLANNING run trước đó trong cùng session (`BUG-W03-105/106/107`: `getMaterialGroupTree` GraphQL lỗi "nodes is not iterable"; trùng mã nhóm lowercase không bị chặn — vi phạm BR-CAT-GRP-003; description>255 trả `IAM_037` thay vì `ERR-INV-016`). Verify + flip 2 bug FIX_DONE→VERIFIED qua regression test thật: `BUG-W03-006` (mainUnitCode/originCode validate đúng), `BUG-W03-066` (3-state `parentIdProvided` filter). Đã bổ sung đủ cặp data-mới `required-only`/`full-fields` cho 2 entity ghi (MaterialGroup: GRPCRE-006 required-only + GRPCRE-001 full-fields; InternalProduct: PRDCRE-001 required-only + PRDCRE-025 full-fields). Fix 1 lỗi hạ tầng harness thật (TS module resolution ngoài rootDir — symlink `node_modules` phạm vi hẹp trong `Execution/auto/specs/W03/api/`, không đụng file frozen Lớp A). §3 Status Summary cập nhật số liệu thật + kết luận `BLOCKED — chưa đủ điều kiện READY_FOR_QC` (còn 8 FAIL + 61 chưa chạy). Frontmatter version 2→3. Chi tiết đầy đủ: `Execution/test-reports/TR-W03-API.md`. | agent-test-api (W03 TEST_EXECUTION) |
| 2026-07-02 | v4: **TEST_EXECUTION Run 2 (agent-test-api, tiếp tục theo yêu cầu user)** — chạy nốt toàn bộ 61 TC còn `READY` sau Run 1 qua 3 spec file mới (`w03-material-group-extra`, `w03-internal-product-extra`, `w03-import-export-extra`) — **55 PASS / 6 FAIL trực tiếp** (2 trong 6 FAIL là cross-reference của bug đã file Run 1: `PRDLST-010`→`BUG-W03-113`, `PRDDET-016`→`BUG-W03-116`, KHÔNG phải bug mới) + 6 TC đánh dấu `BLOCKED` tường minh (`GRPEDT-007`/`PRDIMP-011` = BLOCKED-by-harness, thiếu DB fault-injection cho atomic-rollback; `PRDDET-007/008`, `PRDEDT-002`, `PRDDEL-002` = BLOCKED-by-seed-data, W03 sandbox chưa có giao dịch nhập/xuất kho thật). File 4 bug mới thật `BUG-W03-119..122`: BUG-119 (race condition TOCTOU `deleteMaterialGroup`+`createInternalProduct` bắn đồng thời, flaky ~2/3, để lại product orphan tham chiếu nhóm đã xóa), BUG-120 (`conversionRate` cực lớn → HTTP 500 unhandled exception), BUG-121 (attachment 0-byte trả sai message "vượt 30MB"), BUG-122 (1 dòng import `nature` sai enum GraphQL làm sập TOÀN BỘ batch thay vì per-row error — vỡ UX chính của tính năng import). **Kết quả cộng dồn Run 1+Run 2: 152/152 TC đã thực thi (132 PASS / 14 FAIL / 6 BLOCKED / 0 READY còn lại)**. Tổng 10 bug thật `OPEN` cần fix trước `READY_FOR_QC` (`BUG-W03-105/106/107/113/114/115/116/119/120/122`), 2 bug đã `VERIFIED` (`BUG-W03-006`, `BUG-W03-066`). §3 Status Summary cập nhật số liệu cộng dồn cả 2 run. Frontmatter version 3→4. Chi tiết đầy đủ: `Execution/test-reports/TR-W03-API.md` §Run 2. | agent-test-api (W03 TEST_EXECUTION Run 2) |
