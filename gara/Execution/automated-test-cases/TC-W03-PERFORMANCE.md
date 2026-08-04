---
document_id: 'GMS-TC-W03-PERFORMANCE'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 1
boundary: 'gf-inventory, agg-garage-graph, garage-web'
wave: 'W03'
owner: 'agent-test-performance'
last_reviewed: '2026-07-02'
qa_reviewed_by: 'cuongnguyen_ac@cardoctor.vn'
qa_reviewed_at: '2026-07-02'
drift_impact:
  - report: 'Execution/tracking/drift-impact/W03-2026-07-03T15-02-35Z.md'
    timestamp: '2026-07-03T15:02:35+00:00'
    impacted_ids: ['FEAT-CAT-GRP-CREATE', 'FEAT-CAT-PROD-CREATE', 'FEAT-CAT-PROD-DETAIL', 'FEAT-CAT-PROD-EDIT', 'FEAT-ID-CREATE-V2', 'FEAT-IR-CREATE-V2', 'TC-W03-PERF-004', 'TC-W03-PERF-011']

---

# Automated Test Cases — W03: Performance (Danh mục vật tư — EP-INVENTORY-CATALOG slice 1/4)

> Automated TC artifact cho `agent-test-performance`, Wave 03 (Danh mục vật tư).
> SLO source chính: `.agents/agent-test-performance.md` §Wave Assignments "W03 — Danh mục vật tư (performance)" (v6) — đối chiếu chéo với `Execution/work-packages/PKG-W03-inventory-catalog.md` §2.2.1/§2.2.2/§4.1/§4.3/§5.1 + `Product/features/FEAT-CAT-PROD-IMPORT.md` v10 + `Product/features/FEAT-CAT-PROD-EXPORT.md` v8.
> W03 KHÔNG phải designated perf wave (WT-M/WT-F) theo Activation note của agent contract, nhưng Wave Assignment đã chốt scale target cụ thể (không chỉ "sanity") — TC dưới đây target đúng ngưỡng đã chốt, ở mức "wave-appropriate load" (mẫu đủ để ước lượng p99 ổn định, KHÔNG phải soak nhiều giờ / spike production-scale / chaos engineering — các phần đó tiếp tục deferred sang WT-M/WT-F).
> KHÔNG hardcode/relax SLO. KHÔNG chạy load/stress trên production. **2 SLO trong Wave Assignment gốc có drift so với canonical Architecture/Feature source đã chốt sau đó — đã điều chỉnh về số liệu thật, có ghi chú rõ ở §5 Notes + lesson learn TL-W03-PERF-001/002 (KHÔNG phải tự ý relax SLO — dùng đúng business rule cap hiện hành thay vì con số đã lỗi thời trong wave-assignment).**

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W03-PERFORMANCE` |
| Wave | W03 |
| Boundary(ies) | `gf-inventory` (REST V2-1..V2-23) · `agg-garage-graph` (BFF, 24 GraphQL ops) · `garage-web` (list render) |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT`, `FEAT-CAT-PROD-DETAIL` (conversion-unit), `FEAT-CAT-GRP-DETAIL` |
| Owner | `agent-test-performance` |
| Last Reviewed | 2026-07-02 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope

- **List Material Group flat search** (`searchMaterialGroups` Q1 → gf-inventory `POST /api/v2/material-groups/search` V2-1) latency ở scale ≥10.000 nhóm/tenant — p99 < 800ms (R29 flat canonical).
- **List Internal Product flat search** (`searchInternalProducts` Q4 → V2-7) latency ở scale ≥10.000 mã/tenant — p99 < 1000ms.
- **Multi-filter combined search** (status + nature + materialGroupId + keyword đồng thời) trên Internal Product — không vượt ngân sách p99 của single-filter search (E2E-PF03 adapted).
- **SKU search MDM** (`searchSkus` Q8 → V2-23 `GET /api/v2/skus/search`) — p99 < 500ms.
- **Concurrent read load** trên Q1/Q4 — không race condition / error-rate spike (API-PS03).
- **Bulk import** (`verifyImportInternalProducts` M14 + `importInternalProducts` M15 → V2-20/21) tại cap tối đa 500 dòng/lần (`ERR-INV-041`, BR-CAT-PROD-020) — end-to-end duration < 30s + success rate ≥ 99,5% cho dòng hợp lệ.
- **Import vượt cap (>500 dòng)** — fast-reject tại BFF (defense-in-depth M14) trước khi forward backend, không tỉ lệ thuận với chi phí parse toàn bộ file.
- **Export single-call** (`exportInternalProducts` Q7 → V2-22, pattern R22 reverse-proxy) tại **cap thật 1.000 dòng/lần** (`ERR-INV-045`, BR-CAT-PROD-024 — KHÔNG phải ≥10k như text gốc trong Wave Assignment, xem §5 Notes) — start-to-download-ready < 60s.
- **Export vượt cap (>1.000 dòng khớp filter, trên tổng catalog ≥10.000 mã)** — fast-reject qua COUNT-trước-khi-generate, bảo vệ JVM heap khỏi DoS bulk export — p95 ≤ 10s (PKG §2.2.2 Q7 implementation note).
- **Conversion-unit validate** (`addConversionUnit` M9 / `updateConversionUnit` M10 → V2-15/16, guard `ERR-INV-047` R29 BR-CAT-PROD-011 v15) — p99 < 300ms.
- **BFF DataLoader — no N+1** trên `searchInternalProducts` render full detail (6 loader: `materialGroupById`, `unitByCode`, `originCountryByCode`, `skuMappingsByProductId`, `conversionUnitsByProductId`, `attachmentsByProductId`).
- **BFF batch enrichment hit rate ≥95%** (gf-erp-mdm UNIT/COUNTRY batch + materialGroupName batch) trên cùng kịch bản render list.
- **TENANT-USERS enrichment** (`createdByName`/`updatedByName`, R20) — batched, không N+1 fan-out ra `ct-saas-tenant` trên `searchMaterialGroups` Q1 paged.
- **Web Material Group list — page load / render latency** ở scale backing dataset ≥10.000 nhóm (adapted từ "virtualized scroll FPS" — xem §5 Notes, thực tế FE dùng server-side pagination `PAGE_SIZE_DEFAULT=20`, KHÔNG virtualization).
- **Recovery/concurrency under load**: 2 lần import đồng thời cùng tenant — không deadlock / lock-wait-timeout, atomic verify-then-commit giữ nguyên isolation.

### Out of Scope

- API contract / schema / error-code exhaustive (happy path từng endpoint, validation từng field) → `agent-test-api` (`TC-W03-API.md`).
- UI render perf isolated (LCP/FCP, component-level re-render) → `agent-test-ui` (web) / `agent-test-mobile-ui` (mobile — Flutter rebuild jank, scroll FPS).
- Full journey end-to-end timing → `agent-test-e2e` (web, Playwright) / `agent-test-mobile-e2e` (mobile, Patrol).
- Cross-tenant resource contention → `agent-test-isolation` (`TC-W03-ISOLATION.md`).
- Perf under attack/abuse load (DoS injection, rate-limit bypass, XXE parser abuse) → `agent-test-security`.
- **`getMaterialGroupTree` (Q2 → V2-2, tree cap 1000 nodes → 413 `ERR-INV-027`)** — R29 (BA 2026-06-26) đã xác nhận **flat-only canonical**: cả web (G4 "KHÔNG gọi Q2") lẫn mobile (CR-1782381477 "KHÔNG wire Q2") đều KHÔNG dùng endpoint này trong W03. Q2/V2-2 vẫn tồn tại additive (dormant, không có active load path từ bất kỳ client nào) — không có SLO active-path để test trong wave này; flag cho wave sau nếu Q2 được kích hoạt lại.
- **Attachment upload throughput** (V2-18/19, ≤5 file/product, ≤30MB, MIME PDF/JPG/PNG) — pattern presigned-URL (ADR-016 reuse): client upload byte trực tiếp tới `ct-file-storage`, gf-inventory chỉ nhận metadata (`AttachmentInput`, nhẹ, không phải hot path). Throughput file lớn thuộc boundary `ct-file-storage` (external), không phải active load path của `gf-inventory`/`agg-garage-graph` trong wave này.
- Server restart giữa request / mất kết nối giữa chừng / SSL-HTTPS redirect (API-PS04/PS05/PS06) — không có SLO source trong PKG §4.1/§4.3 cho W03; infra/security layer, deferred WT-M/WT-F (cùng precedent W01/W02).
- Deep load/soak/spike/stress test kéo dài nhiều giờ, chaos engineering (kill pod giữa transaction, network partition) — deferred WT-M/WT-F theo Activation note của agent contract.
- Kafka consumer lag / Temporal workflow duration — W03 catalog KHÔNG có Kafka event/outbox (PKG §2.2.1 "Skip outbox table cho catalog") và KHÔNG dùng Temporal (`gf-inventory` không nằm trong 5 service dùng Temporal per CLAUDE.md §7 — chỉ `gf-inventory-worker` mới dùng, không liên quan catalog CRUD).

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| `gf-inventory` | Đang chạy, `GET /health` = UP, host port `45086` (docker-compose.yml) | Flyway `V{N+1}__inventory_v2_catalog.sql` applied; `/api/v2/*` reachable |
| `agg-garage-graph` (BFF) | Đang chạy, GraphQL `POST http://localhost:45401/garage/graphql {__typename}` = OK | Endpoint path xác nhận theo TL-W02-PERF-003 (`CONTEXT_PATH=/garage` + `GRAPHQL_PUBLIC_PATH=/graphql`); **cần re-probe tại Environment Readiness Gate của W03 run** — chưa được xác nhận thực thi cho catalog boundary. DataLoader 6 loader phải bật |
| `gf-erp-mdm` | Master data `directory=UNIT` (≥5 ĐVT) + `directory=COUNTRY` (≥10 quốc gia ISO 3166-1 alpha-3, gồm VNM/USA/JPN/CHN/DEU) seeded, host port `45084` | Cho `mainUnitDisplayName`/`originDisplayName` batch enrichment |
| `gf-sims` (ct-saas-tenant sim) | `POST http://localhost:45160/api/v1/saas-tenant/tenant-users/search/basic` reachable | Cho TENANT-USERS enrichment TC-014 |
| Auth token | SSO-stub: `GET http://localhost:45410/dev/token?identifier=accountant@demo.local` → field `accessToken` (theo TL-W01-PERF-003 — KHÔNG dùng GraphQL `login` mutation) | Tenant `garage-a` active |
| Seed Material Group | **≥10.500 nhóm** tenant `garage-a` (≥90% ACTIVE, phân bố cha/con hợp lý, KHÔNG vượt tree cap vì test KHÔNG dùng Q2) | Seed batch qua V2-4 hoặc trực tiếp DB fixture (không qua UI — perf seed không phải functional flow) |
| Seed Internal Product | **≥10.500 mã** tenant `garage-a` (đa dạng `nature`/`materialGroupId`/`originCode` để test multi-filter TC-003) | Cần đủ phân tán để multi-filter combo trả kết quả non-trivial (không rỗng, không toàn bộ) |
| Seed SKU pool (legacy `product` table) | ≥5.000 SKU, trong đó có tập `unmapped=true` | Cho SKU search TC-004 |
| Seed export filter dataset | 1 `materialGroupId` filter khớp đúng **1.000 mã** (success-path TC-009); 1 filter (vd `status=ACTIVE` toàn bộ) khớp **>1.000 mã** trên nền ≥10.500 mã (reject-path TC-010) | Chuẩn bị 2 filter riêng biệt để không lẫn 2 kịch bản |
| Import file mẫu — 500 dòng | `.xlsx` 500 dòng, ~90-95% hợp lệ + phần còn lại lỗi cố ý (mã trùng / ĐVT không khớp / nhóm không tồn tại) — đúng cap tối đa BR-CAT-PROD-020 | Dùng cho TC-006/007 |
| Import file mẫu — 501+ dòng | `.xlsx` 600 dòng (vượt cap) | Dùng cho TC-008 fast-reject |
| Load runner | Ưu tiên `k6`; fallback Python 3 `urllib.request` + `threading` nếu k6/Artillery absent (theo lesson TL-W02-PERF-003) — xác nhận runner trước khi generate script tại TEST_EXECUTION | Sample size mục tiêu ≥100-200 iterations hoặc VUs=10-20 × 60s cho ước lượng p99 ổn định (wave-appropriate, không phải soak) |
| `garage-web` | Reachable `http://localhost:45300`, route `MaterialGroupListPage` | Cho TC-015 (page load latency tại scale) |

**Common Baseline Coverage Map** (đọc từ `common-testcase-api.md §11` API-PS01–PS06 + `common-testcase-e2e.md §12` E2E-PF01–PF03, theo Step 1.1 bắt buộc):

| Common Case ID | Intent | Trạng thái W03 Auto | TC tương ứng / Lý do |
|---|---|---|---|
| API-PS01 | Response time < SLA (p95/p99) | `covered` | TC-001, TC-002, TC-003, TC-004, TC-006, TC-009, TC-011 |
| API-PS02 | Upload file nhỏ/trung bình/lớn | `adapted` | TC-008 (import file 501-600 dòng — proxy cho "file lớn"; đo fast-reject latency, KHÔNG đo upload throughput byte thô vì import W03 = client-side XLSX parse rồi gửi JSON `items[]`, không phải multipart file upload thô). Attachment upload (10-30MB) = presigned-URL trực tiếp `ct-file-storage`, ngoài active load path gf-inventory/agg-garage-graph trong wave này (xem §Out of Scope) |
| API-PS03 | Concurrent requests — không race condition | `covered` | TC-005 (concurrent read Q1/Q4), TC-016 (concurrent import 2 batch cùng tenant) |
| API-PS04 | Server restart giữa request | `out-of-scope` | Không có SLO source trong PKG §4.1/§4.3/§5.1 cho W03; `gf-inventory` stateless Spring Boot — restart behavior thuộc infra runbook, deferred WT-M/WT-F (cùng precedent W01/W02) |
| API-PS05 | Mất internet / timeout đúng quy định | `out-of-scope` | Không có SLO timeout cụ thể trong PKG cho W03; timeout/retry behavior là functional test thuộc `agent-test-api` |
| API-PS06 | SSL/HTTPS redirect | `out-of-scope` | Infrastructure/security concern, không có SLO trong PKG W03 |
| E2E-PF01 | List 1000+ records: thời gian load < SLA | `covered` | TC-001, TC-002 (vượt baseline — test tại ≥10.000, không chỉ 1000), TC-015 (web page load tại scale) |
| E2E-PF02 | Upload file 10MB < SLA | `adapted` | TC-008 (cùng lý do API-PS02 — import cap-boundary là proxy hợp lý nhất trong active load path W03; không có literal 10MB-file scenario trong scope catalog) |
| E2E-PF03 | Tìm kiếm phức tạp nhiều filter < SLA | `covered` | TC-003 (multi-filter combined search Internal Product) |

**Auto vs Manual Parity Audit**: Manual artifact `Execution/test-cases/TC-W03-PERFORMANCE.md` **KHÔNG tồn tại** tại thời điểm gen (xác nhận qua `ls` 2026-07-02 — chỉ có `TC-W03-{API,E2E,ISOLATION,MOBILE-E2E,MOBILE-UI,UI}.md`, không có file PERFORMANCE trong `Execution/test-cases/`). Vì không có nguồn manual để so sánh, **0 case để phân loại** `covered-by-other-agent`/`out-of-automation-scope`/`auto-miss` — gate coi là **N/A** (không phải mandatory failure, vì "không có gì để miss" khi không có nguồn so sánh). Nếu QA Authority tạo manual artifact PERFORMANCE cho W03 sau này, agent phải re-run parity diff ở lần gen kế tiếp.

**Self-Audit Record (Gate trước `READY`):**

- **Common Baseline**: 9/9 case (API-PS01-06 + E2E-PF01-03) đã account `covered`/`adapted`/`out-of-scope+lý do` — không còn case treo.
- **Auto vs Manual Parity**: Manual artifact không tồn tại → N/A, không có auto-miss (xem trên).
- **SLO source discrepancy đã resolve**: 2 điểm lệch giữa Wave Assignment gốc (`.agents/agent-test-performance.md` §W03) và canonical Architecture/Feature source đã được phát hiện qua đối chiếu PKG §2.2.1/§2.2.2 + `FEAT-CAT-PROD-EXPORT` v8 — đã điều chỉnh TC về đúng số liệu thật (KHÔNG bịa/relax SLO, dùng business rule cap hiện hành), ghi rõ tại §5 Notes + lesson learn `TL-W03-PERF-001`/`TL-W03-PERF-002` (`Tracking/TEST-LESSONS-LEARNED.md`).
- **Load profile/command/runner**: đã chỉ rõ (k6 ưu tiên, Python 3 fallback theo lesson TL-W02-PERF-003) — không blocker automation nào chưa ghi.
- **Kết luận**: Không còn mandatory failure mở → artifact `READY` cho QA Authority review.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 16 | 16 READY (TEST_PLANNING — chưa execute; TEST_EXECUTION sẽ chạy Environment Readiness Gate trước khi đổi status) |
| Manual | N/A | Manual artifact `Execution/test-cases/TC-W03-PERFORMANCE.md` không tồn tại (xem Parity Audit ở trên) |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-PERF-001 | FEAT-CAT-GRP-LIST | gf-inventory, agg-garage-graph | Wave Assignment W03 (R29) + PKG §2.2.1 V2-1 | Performance | Performance | P1 | Danh sách nhóm vật tư (flat) đạt p99 < 800ms dưới scale ≥10.000 nhóm/tenant | 1. `gf-inventory` healthy; ≥10.500 nhóm seed tenant `garage-a` (≥90% ACTIVE).<br>2. `agg-garage-graph` healthy, DataLoader bật.<br>3. `accessToken` hợp lệ (sso-stub). | 1. Chạy load test `searchMaterialGroups(input:{keyword:"", status:"ACTIVE", page:0, size:20, sort:"default"})` qua BFF `POST http://localhost:45401/garage/graphql` — ≥150 iterations sequential hoặc k6 VUs=10 × 60s.<br>2. Lặp lại với `page` ngẫu nhiên (deep pagination, page 100-500) để test cost thực của flat-grouped-by-parent ordering (R7) ở scale lớn.<br>3. Ghi p50/p95/p99 + error rate.<br>4. Kiểm tra log `gf-inventory` trong thời gian test. | - p99 latency ≤ 800ms (SLO: Wave Assignment W03, R29).<br>- Không timeout hàng loạt; error rate = 0%.<br>- Deep-page query (page 100-500) không degrade bất thường so với page đầu (không có O(n²) do flat-grouped-by-parent ordering).<br>- Không có exception/slow-query log nghiêm trọng trong `gf-inventory`. | READY | N/A |
| TC-W03-PERF-002 | FEAT-CAT-PROD-LIST | gf-inventory, agg-garage-graph | Wave Assignment W03 + PKG §2.2.1 V2-7 | Performance | Performance | P1 | Danh sách mã sản phẩm nội bộ (flat) đạt p99 < 1000ms dưới scale ≥10.000 mã/tenant | 1. `gf-inventory` healthy; ≥10.500 mã seed tenant `garage-a`.<br>2. BFF healthy, DataLoader bật.<br>3. `accessToken` hợp lệ. | 1. Chạy load test `searchInternalProducts(input:{keyword:"", status:"ACTIVE", page:0, size:20})` — ≥150 iterations hoặc k6 VUs=10 × 60s.<br>2. Lặp lại với `keyword` 3-cột (code/name/SKU) trên tập dữ liệu lớn.<br>3. Ghi p50/p95/p99 + error rate. | - p99 latency ≤ 1000ms (SLO: Wave Assignment W03).<br>- Keyword search (3-col OR-match) không vượt ngưỡng đáng kể so với list trần (không có regex/LIKE full-scan bất thường).<br>- Error rate = 0%. | READY | N/A |
| TC-W03-PERF-003 | FEAT-CAT-PROD-LIST | gf-inventory, agg-garage-graph | E2E-PF03 adapted + PKG §2.2.1 V2-7 | Performance | Performance | P2 | Tìm kiếm mã sản phẩm với nhiều bộ lọc đồng thời (trạng thái + tính chất + nhóm hàng + từ khóa) vẫn nằm trong ngân sách latency của TC-002 | 1. Cùng seed ≥10.500 mã như TC-002.<br>2. Có phân bố đa dạng `nature`/`materialGroupId`/`originCode` để combo filter trả kết quả non-trivial. | 1. Chạy `searchInternalProducts(input:{status:"ACTIVE", nature:"GOODS", materialGroupId:<id>, keyword:"phu"})` — ≥100 iterations.<br>2. So sánh p99 với TC-002 (single-filter baseline). | - p99 combo-filter ≤ p99 single-filter TC-002 (không có combinatorial explosion — WHERE clause có index phù hợp).<br>- Kết quả trả về đúng tập khớp cả 4 điều kiện (functional correctness — cross-check nhanh, không phải trọng tâm nhưng phải đúng để loại trừ false-positive perf). | READY | N/A |
| TC-W03-PERF-004 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | Wave Assignment W03 + PKG §2.2.1 V2-23 | Performance | Performance | P2 | Tìm kiếm SKU (modal "Gắn SKU") đạt p99 < 500ms | 1. Seed ≥5.000 SKU (legacy `product` table), có tập `unmapped=true`.<br>2. BFF healthy. | 1. Chạy `searchSkus(q:"", unmapped:true, page:0, size:20)` — ≥100 iterations.<br>2. Lặp lại với `q` khớp 1 phần text (LIKE).<br>3. Ghi p50/p95/p99. | - p99 latency ≤ 500ms (SLO: Wave Assignment W03).<br>- `unmapped=true` filter không gây full-scan bất thường trên legacy `product` table.<br>- Error rate = 0%. | READY | N/A |
| TC-W03-PERF-005 | FEAT-CAT-GRP-LIST, FEAT-CAT-PROD-LIST | gf-inventory, agg-garage-graph | API-PS03 + PKG §2.2.1/§2.2.2 | Performance | Performance | P1 | Đọc đồng thời danh sách nhóm + mã sản phẩm — không race condition, error rate không tăng đột biến | 1. Cùng seed TC-001+TC-002.<br>2. k6 hoặc Python `threading` sẵn sàng chạy concurrent. | 1. Chạy đồng thời 20 VUs (10 VUs gọi `searchMaterialGroups`, 10 VUs gọi `searchInternalProducts`) trong 60s.<br>2. Ghi p99 mỗi nhóm request + error rate tổng.<br>3. Kiểm tra log `gf-inventory`/`agg-garage-graph` cho lock-wait/connection-pool-exhausted. | - p99 mỗi nhóm không vượt quá 1.5× ngưỡng single-thread tương ứng (TC-001/TC-002) — ngân sách sanity cho concurrent, không hardcode SLA riêng.<br>- Error rate ≤ 0.5% trong toàn bộ 60s window.<br>- Không có connection-pool-exhausted / lock-wait-timeout trong log. | READY | N/A |
| TC-W03-PERF-006 | FEAT-CAT-PROD-IMPORT | gf-inventory, agg-garage-graph | Wave Assignment W03 + PKG §2.2.1 V2-20/21, BR-CAT-PROD-020 | Performance | Performance | P1 | Import 500 dòng (cap tối đa) hoàn tất end-to-end dưới 30 giây | 1. File `.xlsx` 500 dòng (~90-95% hợp lệ) chuẩn bị sẵn.<br>2. Tenant `garage-a`, không mã nào trong file trùng dữ liệu đã tồn tại (trừ phần cố ý test trùng). | 1. Gọi `verifyImportInternalProducts(input:{items: <500 rows>})` (M14) — đo latency.<br>2. Ngay sau đó gọi `importInternalProducts` (M15) với cùng `items` (chỉ dòng hợp lệ) — đo latency.<br>3. Tổng thời gian end-to-end (M14 + M15) từ lúc gửi tới khi nhận `ImportInternalProductsResultResponse`. | - Tổng thời gian end-to-end ≤ 30.000ms (SLO: Wave Assignment W03).<br>- Không timeout, không lỗi 5xx.<br>- `ImportInternalProductsResultResponse.summary` phản ánh đúng số dòng hợp lệ/lỗi đã được preview ở bước M14 (consistency giữa 2 bước). | READY | N/A |
| TC-W03-PERF-007 | FEAT-CAT-PROD-IMPORT | gf-inventory, agg-garage-graph | Wave Assignment W03 + BR-CAT-PROD-017 | Performance | Performance | P1 | Import 500 dòng đạt tỉ lệ ghi thành công ≥99,5% cho các dòng hợp lệ | 1. Cùng file 500 dòng TC-006, biết trước số dòng hợp lệ dự kiến (vd 470/500, phần còn lại lỗi cố ý). | 1. Chạy `importInternalProducts` (M15) với batch dòng hợp lệ đã verify ở M14.<br>2. Đếm số record thực tế được persist trong `gf-inventory` (`internal_product` table, `tenant_id=garage-a`, filter theo mã trong file).<br>3. Tính success rate = (số record persist đúng / số dòng hợp lệ dự kiến) × 100%. | - Success rate ≥ 99,5% (SLO: Wave Assignment W03) — với 470 dòng hợp lệ, cho phép tối đa 2 dòng fail không rõ nguyên nhân trước khi vi phạm ngưỡng.<br>- Không có record bị ghi trùng (duplicate) hoặc ghi thiếu trường "Thông tin chung" bắt buộc.<br>- `pricing_method` mặc định `PWA`, `nature` mặc định `GOODS` khi null (đúng BR-CAT-PROD-017/019). | READY | N/A |
| TC-W03-PERF-008 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | API-PS02/E2E-PF02 adapted + PKG §2.2.2 M14 defense + BR-CAT-PROD-020 | Performance | Performance | P2 | File import vượt cap 500 dòng bị từ chối nhanh tại BFF, không tỉ lệ thuận với chi phí parse toàn file | 1. File `.xlsx` 600 dòng (vượt cap) đã chuẩn bị, `items[]` tương ứng 600 phần tử. | 1. Gọi `verifyImportInternalProducts(input:{items: <600 rows>})` (M14) — đo latency từ lúc gửi tới khi nhận lỗi `ERR-INV-041`.<br>2. So sánh với latency của TC-006 M14 (500 dòng, xử lý đầy đủ). | - Response trả lỗi `ERR-INV-041` (BFF defense-in-depth trước khi forward backend — PKG §2.2.2).<br>- Latency reject ≤ latency M14 xử lý đầy đủ 500 dòng ở TC-006 (fast-reject, KHÔNG phải full-parse-rồi-mới-reject).<br>- Không có record nào được ghi vào `gf-inventory` (`ERR-INV-041` áp dụng cả tầng kiểm tra lẫn ghi — BR-CAT-PROD-020). | READY | N/A |
| TC-W03-PERF-009 | FEAT-CAT-PROD-EXPORT | gf-inventory, agg-garage-graph | Wave Assignment W03 [ADAPTED — xem §5 Notes] + BR-CAT-PROD-024 + PKG §2.2.2 V2-Q7 | Performance | Performance | P1 | Export danh mục mã sản phẩm (tại cap tối đa 1.000 dòng — mức thật của hệ thống) hoàn tất start-to-download-ready dưới 60 giây | 1. Filter (`materialGroupId=<X>`) khớp đúng 1.000 mã đã seed sẵn.<br>2. BFF R22 reverse-proxy pattern hoạt động (short-lived signed token TTL 60s). | 1. Gọi `exportInternalProducts(filter:{materialGroupId:<X>})` (Q7) — nhận `data.downloadUrl`.<br>2. Gọi `downloadUrl` (BFF middleware reverse-proxy tới V2-22) — đo thời gian tới khi byte đầu tiên `.xlsx` trả về hoàn tất (`Content-Disposition` header nhận được + file hoàn chỉnh).<br>3. Tổng thời gian từ bước 1 tới hết bước 2 = "start-to-download-ready". | - Tổng thời gian ≤ 60.000ms (SLO: Wave Assignment W03, đã adapt về mức 1.000 dòng thật — xem §5 Notes).<br>- File `.xlsx` trả về đủ 1.000 dòng + 9 cột canonical (KHÔNG audit fields, per R22 OMIT).<br>- HTTP 200, `Content-Disposition: attachment; filename="danh-muc-ma-san-pham-noi-bo-{timestamp}.xlsx"`. | READY | N/A |
| TC-W03-PERF-010 | FEAT-CAT-PROD-EXPORT | gf-inventory, agg-garage-graph | PKG §2.2.2 Q7 implementation note ("align p95 ≤ 10s + bảo vệ JVM heap") + BR-CAT-PROD-024 | Performance | Performance | P1 | Export bị từ chối nhanh khi kết quả khớp filter > 1.000 dòng, kể cả khi tổng catalog ≥10.000 mã | 1. Filter rộng (`status=ACTIVE` không thu hẹp) khớp > 1.000 mã trên nền ≥10.500 mã đã seed. | 1. Gọi `exportInternalProducts(filter:{status:"ACTIVE"})` (Q7) — đo latency từ lúc gửi tới khi nhận lỗi `ERR-INV-045`.<br>2. Lặp lại ≥20 lần để đo p95.<br>3. Xác nhận **không có file nào được sinh** (COUNT-trước-khi-generate, không phải generate-rồi-check). | - Response trả lỗi `ERR-INV-045` "Kết quả vượt 1.000 dòng — vui lòng áp dụng bộ lọc để thu hẹp phạm vi rồi xuất lại" (DIALOG token).<br>- p95 latency reject ≤ 10.000ms dù tổng catalog ≥10.000 mã (SLO: PKG §2.2.2 Q7 note — bảo vệ JVM heap khỏi DoS bulk export).<br>- Không có Apache POI generate file nào được trigger (verify qua log/metric nếu instrumented; tối thiểu xác nhận latency thấp hơn hẳn TC-009 chứng tỏ không generate). | READY | N/A |
| TC-W03-PERF-011 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | Wave Assignment W03 (R29) + BR-CAT-PROD-011 v15 + PKG §2.2.1 V2-15/16 | Performance | Performance | P2 | Thêm/sửa đơn vị tính quy đổi (validate precision guard) đạt p99 < 300ms | 1. ≥1 mã sản phẩm đã tồn tại, chưa có giao dịch (cho phép add/update conversion-unit).<br>2. gf-erp-mdm `directory=UNIT` seeded. | 1. Chạy `addConversionUnit(id:<productId>, input:{unitCode:"THUNG", conversionRate:12.000000})` (M9) — ≥100 iterations với `unitCode` xoay vòng (tránh trùng unique constraint).<br>2. Lặp lại với giá trị biên `conversionRate` scale=7 chữ số thập phân (kỳ vọng reject nhanh `ERR-INV-047`) — đo riêng latency nhánh reject.<br>3. Ghi p50/p95/p99 cho cả 2 nhánh (valid + reject). | - p99 latency nhánh hợp lệ ≤ 300ms (SLO: Wave Assignment W03).<br>- Nhánh reject (`ERR-INV-047`, scale > 6) cũng ≤ 300ms (validation nhanh, không blocking DB round-trip trước khi reject).<br>- Response lỗi đúng message tiếng Việt từ `ERROR-CODE-REGISTRY` cho `ERR-INV-047`. | READY | N/A |
| TC-W03-PERF-012 | FEAT-CAT-PROD-LIST | agg-garage-graph | Wave Assignment W03 + PKG §2.2.2 DataLoader 6-loader | Performance | Performance | P1 | Render 100 mã sản phẩm đầy đủ enrichment không phát sinh N+1 downstream call | 1. Seed 100 mã sản phẩm với `mainUnitCode`/`originCode`/`materialGroupId` đa dạng nhưng có trùng lặp giá trị (để verify batching thật sự gom distinct).<br>2. Instrumentation/log đếm request downstream (`gf-erp-mdm`, `gf-inventory` materialGroupById) khả dụng (log grep hoặc mock spy). | 1. Gọi `searchInternalProducts(input:{page:0, size:100})` — 1 request duy nhất.<br>2. Đếm số HTTP call downstream tới `gf-erp-mdm` (`directory=UNIT` + `directory=COUNTRY`) và tới `gf-inventory` cho `materialGroupById` trong suốt vòng đời request đó (qua access log hoặc DataLoader batch counter nếu expose). | - Số downstream call ≈ O(số giá trị **distinct** `mainUnitCode`/`originCode`/`materialGroupId`) — KHÔNG tỉ lệ O(100) (KHÔNG N+1).<br>- Cụ thể: nếu 100 mã chỉ có ≤10 distinct `mainUnitCode` → tối đa 1-2 batch call tới gf-erp-mdm `directory=UNIT` (KHÔNG 100 call riêng lẻ).<br>- Tổng thời gian request không degrade tuyến tính theo page size (100 vs 20 items không chênh lệch quá 3× dù enrichment 5 trường/dòng). | READY | N/A |
| TC-W03-PERF-013 | FEAT-CAT-PROD-LIST | agg-garage-graph | Wave Assignment W03 (batch hit rate ≥95%) + PKG §2.2.2 | Performance | Performance | P2 | Batch enrichment (ĐVT/Xuất xứ/Nhóm hàng) đạt tỉ lệ gộp lô ≥95% trên trang 100 mã | 1. Cùng kịch bản seed TC-012 (100 mã, nhiều trùng lặp giá trị enrichment). | 1. Chạy lại `searchInternalProducts(input:{page:0, size:100})`.<br>2. Tính batch hit rate = 1 − (số downstream call thực tế / số field cần enrich nếu KHÔNG batch, tức 100×3 trường). | - Batch hit rate ≥ 95% (SLO: Wave Assignment W03) — vd nếu chỉ 8 distinct value trên 300 field-lookups cần thiết → hit rate = 1 − 8/300 ≈ 97,3% ≥ 95%.<br>- Cache 5 phút giữa UNIT/COUNTRY lookup (PKG §2.2.2 "Shared client + cache 5min với UNIT") hoạt động đúng — request lặp lại trong cửa sổ 5 phút không tạo thêm downstream call mới. | READY | N/A |
| TC-W03-PERF-014 | FEAT-CAT-GRP-LIST | agg-garage-graph | PKG §2.2.2 R20 TENANT-USERS enrichment | Performance | Performance | P2 | Enrichment "Người tạo"/"Người sửa" (TENANT-USERS) trên danh sách nhóm không phát sinh N+1 tới ct-saas-tenant | 1. Seed ≥50 nhóm với `createdBy`/`updatedBy` thuộc ≤10 user ID distinct (mô phỏng thực tế 1 vài nhân viên thao tác nhiều lần).<br>2. `gf-sims` (ct-saas-tenant sim, port `45160`) healthy. | 1. Gọi `searchMaterialGroups(input:{page:0, size:50})` — 1 request.<br>2. Đếm số call tới `ct-saas-tenant POST /api/v1/saas-tenant/tenant-users/search/basic` trong vòng đời request (nên đúng 1 call duy nhất, gom **distinct** `iamUserIds`). | - Đúng **1** call `tenant-users/search/basic` cho toàn bộ 50 dòng (helper `enrichArrayWithByNames` gom distinct trước khi gọi — R20), KHÔNG 50 call riêng lẻ.<br>- `createdByName`/`updatedByName` hiển thị đúng tên cho mọi dòng khớp `iamUserId`; dòng không khớp trả `null` (không lỗi). | READY | N/A |
| TC-W03-PERF-015 | FEAT-CAT-GRP-LIST | garage-web, agg-garage-graph, gf-inventory | Wave Assignment W03 [ADAPTED — xem §5 Notes] | Performance | Performance | P2 | Trang danh sách nhóm vật tư (garage-web) tải trang đầu tiên nhanh dù backing dataset ≥10.000 nhóm | 1. Cùng seed ≥10.500 nhóm TC-001.<br>2. `garage-web` reachable `http://localhost:45300`, route `MaterialGroupListPage`. | 1. Mở `MaterialGroupListPage` (cold load, cache trống) — đo thời gian từ navigation tới khi bảng render đủ 20 dòng đầu (`PAGE_DEFAULT=1, PAGE_SIZE_DEFAULT=20` per PKG §2.2.3).<br>2. Đo riêng thời gian round-trip GraphQL `searchMaterialGroups` (network tab / BFF access log) — tách biệt render-time thuần UI (KHÔNG đo LCP/FCP chi tiết — thuộc `agent-test-ui`).<br>3. Lặp lại 10 lần, lấy trung bình. | - Round-trip GraphQL (bao gồm COUNT + LIMIT/OFFSET trên bảng ≥10.500 dòng) hoàn tất < 500ms trung bình (adapted target — "initial paint < 500ms" trong Wave Assignment gốc giả định virtualization; ở đây đo phần round-trip dữ liệu, phần thực sự phụ thuộc scale, KHÔNG phải render 10k DOM node vì FE chỉ render 20 dòng/trang).<br>- Bảng hiển thị đúng 20 dòng đầu + phân trang (`totalElements`/`totalPages` đúng ≥10.500/20).<br>- KHÔNG có warning/lag UI bất thường khi chuyển trang (page 1 → page 2) — sanity, không phải đo scroll FPS chi tiết. | READY | N/A |
| TC-W03-PERF-016 | FEAT-CAT-PROD-IMPORT | gf-inventory, agg-garage-graph | API-PS03 + Purpose "recovery under load" (agent contract) | Performance | Performance | P2 | 2 lần import cùng tenant chạy đồng thời — không deadlock, không lock-wait-timeout, atomic isolation giữ nguyên | 1. 2 file `.xlsx` 200 dòng, **mã KHÔNG trùng nhau** giữa 2 file, cùng tenant `garage-a`. | 1. Gọi đồng thời `importInternalProducts` (M15) cho cả 2 file (Python `threading.Thread` × 2 hoặc k6 scenario song song).<br>2. Chờ cả 2 hoàn tất (timeout 60s).<br>3. Kiểm tra docker logs `gf-postgres` cho "deadlock"/"lock wait timeout" trong khoảng thời gian test.<br>4. Đếm tổng record persist = tổng 2×200 (trừ phần lỗi cố ý nếu có). | - Cả 2 request hoàn tất thành công trong 60s, không có `errors[]`/HTTP 5xx do contention.<br>- Không có deadlock / lock-wait-timeout entry trong Postgres log.<br>- Tổng record persist đúng bằng tổng 2 file (không mất dòng do race, không ghi trùng). | READY | N/A |

---

## 5. Notes

### SLO discrepancy #1 — Export "≥10k rows" (Wave Assignment gốc) vs cap thật 1.000 dòng (BR-CAT-PROD-024)

`.agents/agent-test-performance.md` §Wave Assignments W03 (v6, 2026-06-30) ghi: *"Export single-call R22 (≥10k rows): start-to-download-ready < 60s"*. Đối chiếu `FEAT-CAT-PROD-EXPORT.md` v8 AC-5 + `BR-CAT-PROD-024` + PKG §2.2.1 V2-22 + §2.2.2 Q7: hệ thống **chặn hoàn toàn** export khi kết quả khớp filter **> 1.000 dòng**, trả lỗi `ERR-INV-045` và **không sinh file** — nghĩa là kịch bản "export thành công ≥10k dòng" **không thể xảy ra theo thiết kế hiện hành** (cap được BA chốt 2026-06-25 "phòng timeout/OOM khi catalog garage lớn", SAU khi con số "≥10k" có thể đã được soạn trong wave-assignment). Auto artifact **KHÔNG relax SLO để test một kịch bản không tồn tại** — thay vào đó: (a) TC-009 test đúng cap thật (1.000 dòng, mức tải lớn nhất hệ thống cho phép) với cùng ngưỡng thời gian 60s từ Wave Assignment; (b) TC-010 test riêng nhánh reject nhanh khi filter khớp >1.000 dòng trên nền catalog ≥10.000 (đây mới là nơi con số "10k" thực sự có ý nghĩa — bảo vệ hệ thống khỏi DoS khi tenant có catalog lớn, không phải "xuất thành công 10k dòng"). Xem lesson learn `TL-W03-PERF-001`.

### SLO discrepancy #2 — Web "virtualized scroll FPS ≥55" (Wave Assignment gốc) vs pattern thật = server-side pagination

Wave Assignment gốc ghi: *"Web list render 10k rows (virtualized): scroll FPS ≥55, initial paint < 500ms"*. Đối chiếu PKG §2.2.3 (`garage-web`): `MaterialGroupListPage` dùng `share/tables/table-pagination` với `PAGE_DEFAULT=1, PAGE_SIZE_DEFAULT=20, BE max 100` (server-side pagination, xác nhận cả ở §4.1 DEV task lẫn §5.1 deliverable) — **không có virtualized list nào render 10.000 dòng cùng lúc trong DOM**, nên "scroll FPS" trên tập 10k dòng không áp dụng được (không có surface để đo). Auto artifact **adapt** SLO này: TC-015 đo round-trip GraphQL + render trang đầu (20 dòng) khi backing dataset ≥10.000 — đây là phần perf-relevant thật sự tồn tại (COUNT query + LIMIT/OFFSET cost tại scale), giữ nguyên target thời gian "< 500ms" từ Wave Assignment áp dụng cho round-trip thay vì "initial paint" toàn màn hình. Phần "scroll FPS" không được test vì không có widget virtualized-scroll trong wave này; nếu FE đổi sang virtualization ở wave sau, cần re-raise SLO này. Xem lesson learn `TL-W03-PERF-002`.

### Lesson Learn Entries

**TL-W03-PERF-001** (xem `Tracking/TEST-LESSONS-LEARNED.md` §agent-test-performance): Export SLO trong Wave Assignment ghi "≥10k rows" nhưng feature/BR cap cứng ở 1.000 dòng (chốt sau khi wave-assignment có thể đã soạn) — cần verify SLO source mới nhất (Feature version + BR) trước khi adopt số liệu từ Wave Assignment, không giả định Wave Assignment luôn đồng bộ mới nhất.

**TL-W03-PERF-002** (xem `Tracking/TEST-LESSONS-LEARNED.md` §agent-test-performance): Web UI pattern giả định trong Wave Assignment (virtualized list) không khớp actual DEV plan (server-side pagination) — cần cross-check PKG §2.2.3 (Web technical scope) trước khi thiết kế TC UI-adjacent trong phạm vi performance agent, tránh test một behavior không tồn tại trong implementation.

---

## 6. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-02 | 1 | Khởi tạo — W03 performance TCs (16 TC): list Material Group/Internal Product p99 tại scale ≥10k (TC-001/002), multi-filter combined search (TC-003), SKU search p99 (TC-004), concurrent read (TC-005), bulk import 500-row duration + success rate (TC-006/007), import >500-row fast-reject (TC-008), export tại cap thật 1.000 dòng (TC-009, ADAPTED từ "≥10k" trong Wave Assignment — xem §5 Notes), export reject fast-path >1.000 dòng trên catalog ≥10k (TC-010), conversion-unit precision guard p99 (TC-011), DataLoader no-N+1 (TC-012), batch enrichment hit rate ≥95% (TC-013), TENANT-USERS enrichment no-N+1 (TC-014), web list page-load tại scale (TC-015, ADAPTED từ "virtualized scroll FPS" — xem §5 Notes), concurrent import recovery (TC-016). Common Baseline Coverage Map (API-PS01-06 + E2E-PF01-03) — 9/9 case accounted. Auto vs Manual Parity: manual artifact không tồn tại → N/A. 2 SLO discrepancy phát hiện qua đối chiếu PKG §2.2.1/§2.2.2 + FEAT-CAT-PROD-EXPORT v8 — đã điều chỉnh về số liệu thật (không relax SLO), ghi lesson learn TL-W03-PERF-001/002. Không áp dụng full load/soak/stress test (W03 không phải WT-M/WT-F — deferred). | agent-test-performance |
