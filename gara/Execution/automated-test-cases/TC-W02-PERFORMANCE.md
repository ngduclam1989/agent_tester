---
document_id: 'GMS-TC-W02-PERFORMANCE'
type: test-case
wave: 'W02'
phase: 'B'
boundary: 'gf-accounting, agg-garage-graph, ct-file-storage'
features:
  - FEAT-INS-STL-CREATE
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
status: ACTIVE
version: 4
owner: 'agent-test-performance'
last_reviewed: '2026-06-26'
---

# Automated Test Cases — W02: Performance (Sanity)

> **Run10 2026-06-26: PERFORMANCE OUT-OF-WAVE per user override — all TCs marked SKIPPED (performance not in W02 scope this run).**

> W02 KHÔNG phải designated perf wave (WT-M/WT-F). Activation scope hiện tại = TD P0 Remediation (W01–W03).
> Theo agent contract §Test Scope: W02 chỉ sinh **perf sanity TCs** — không phải full load test.
> SLO source chính: `PKG-W02-insurance-dossier.md §4.3` + `§9 Post-Wave Actuals`.
> KHÔNG hardcode/relax SLO. KHÔNG chạy load/stress trên production.

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W02-PERFORMANCE` |
| Wave | W02 |
| Boundary(ies) | `gf-accounting` · `agg-garage-graph` (BFF orchestrator) · `ct-file-storage` (external) |
| Feature(s) | `FEAT-INS-STL-CREATE` · `FEAT-INS-DOSSIER-CREATE` · `FEAT-INS-DOSSIER-VIEW` |
| Owner | `agent-test-performance` |
| Last Reviewed | 2026-06-26 |
| Work Package | `Execution/work-packages/PKG-W02-insurance-dossier.md` |

---

## 2. Scope

### In Scope

- **PDF generation latency** (gf-accounting `common-printing`): render bộ 4 tài liệu (AUTO_RENDER + FORM_FILL) qua các endpoint `render-pdf` — p95 < 5s (SLO: PKG §4.3 + §9).
- **BFF orchestrator end-to-end export latency** (agg-garage-graph `exportInsuranceDossier` 4-phase): Phase A→B→C→D aggregate — sanity smoke dưới tải nhẹ.
- **Concurrent export no DB contention**: 5 bộ dossier song song (5 phiếu QT BH khác nhau) — không deadlock / lock wait timeout (SLO: PKG §4.3).
- **ct-file-storage upload error rate sanity**: error rate < 0.1% cho batch multipart upload (SLO: PKG §9).
- **Dossier search pagination response latency**: `POST /api/v1/insurance-dossiers/search` (gf-accounting) — sanity p95 với dataset nhỏ (< 10 versions).
- **Dossier export success rate sanity**: end-to-end BFF mutation success rate ≥ 99% (PKG §9: dossier export success rate ≥ 99%).

### Out of Scope

- Full load test / soak test / stress test (chỉ dành cho WT-M / WT-F — không active trong TD P0).
- UI render performance (LCP/FCP/jank mobile) — thuộc `agent-test-ui` / `agent-test-mobile-ui`.
- Full end-to-end journey timing web (Playwright) — thuộc `agent-test-e2e`.
- Full end-to-end journey timing mobile (Patrol) — thuộc `agent-test-mobile-e2e`.
- Cross-tenant resource contention under load — thuộc `agent-test-isolation`.
- Perf under attack/abuse load (rate-limit bypass, DoS) — thuộc `agent-test-security`.
- Phase A CRs (CR-20260612-01/02, CR-20260616-01/02, CR-20260618-01/02) — không có SLO riêng trong PKG §4.3 cho Phase A; Phase A perf = out-of-wave-perf-sanity-only (xem note §Notes bên dưới).
- Kafka consumer lag (không có Kafka event trong W02 dossier flow — export là đồng bộ per ADR-016 v11).
- Temporal workflow duration (không có Temporal workflow trong W02 boundary — gf-accounting không dùng Temporal per CLAUDE.md §7).
- Signed URL TTL / S3 direct — đã removed per ADR-016 v11; pdfUrl = ct-file-storage object key.

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Staging env | Staging (KHÔNG production) — representative để đo SLO | Không đo trên localhost vì network latency ct-file-storage sẽ khác |
| gf-accounting | Service running, health `GET /health` = UP | Endpoints: `/api/v1/insurance-dossier-documents/acceptance-record/render-pdf`, `/api/v1/insurance-dossier-documents/payment-authorization/render-pdf`, `/api/v1/insurance-dossier-documents/batch`, `/api/v1/insurance-dossiers/search` |
| agg-garage-graph | BFF running, GraphQL `POST /garage/graphql { __typename }` = OK | BFF orchestrator 4-phase: `exportInsuranceDossier` mutation. Endpoint: `http://localhost:45401/garage/graphql` (CONTEXT_PATH=/garage + GRAPHQL_PUBLIC_PATH=/graphql per ENV). |
| ct-file-storage | External integration ready (`POST /api/v1/files/upload-files` + `folderType="SETTLEMENTS"`) | Staging: port 45888 (`ct-file-storage-sim`). BFF upload byte[] multipart |
| Seed dossier data | 6 bộ phiếu QT BH (Phiếu QT `INSURANCE` payer) tenant_id=1 — distinct `settlementCode` per bộ | Confirmed in execution: SET-20260618-00001, SET-20260619-00004, SET-20260619-00005, SET-20260620-00002, SET-20260622-00002, SET-20260622-00005 |
| Seed dossier versions | SET-20260618-00001 có 30+ versions (REPLACED + active) cho pagination sanity | Verified bằng `POST /api/v1/insurance-dossiers/search`, totalElements=30 |
| Auth token | SSO-stub: `GET http://localhost:45410/dev/token?identifier=accountant@demo.local` → field `accessToken` | Theo TL-W01-PERF-003: KHÔNG dùng GraphQL login mutation (không tồn tại trên BFF) |
| Load runner | Python 3 `urllib.request` + `threading` (k6 không có, Artillery không có — dùng Node.js built-in hoặc Python) | Sanity TCs W02 dùng sample nhỏ (20–50 iterations); k6/Artillery absent confirmed in execution env; Python workaround adequate cho sanity scope |
| formData ③ mẫu | 13 trường strict Figma State 4 (Biên bản nghiệm thu) — sample payload JSON | Dùng cho render-pdf acceptance-record test |
| formData ④ mẫu | 22 trường nested 4 sections strict Figma State 5 (Giấy ủy quyền) — sample payload JSON | Dùng cho render-pdf payment-authorization test |
| BFF GraphQL schema note | `DossierExportBatchResponse` chỉ có `versionNo` + `exports{documentType, fileUrl, fileName}` — KHÔNG có `dossierStatus` | Confirmed via introspection; TC-002/003/006 dùng đúng schema (lesson từ TC-002 initial attempt với sai field) |

**Common Baseline Coverage Map (§Common Test Case Baseline — tham chiếu bắt buộc):**

Đọc từ `common-testcase-api.md §11` (API-PS01–PS06) và `common-testcase-e2e.md §12` (E2E-PF01–PF03) trước khi gen TC (Step 1.1 mandatory).

| Common Case ID | Intent | Trạng thái W02 Auto | TC tương ứng / Lý do |
|---|---|---|---|
| API-PS01 | Response time < SLA (p95) | `covered` | TC-W02-PERF-001 (PDF gen p95 < 5s) · TC-W02-PERF-005 (search p95 sanity) · TC-W02-PERF-006 (BFF export end-to-end sanity) |
| API-PS02 | Upload file nhỏ/trung bình/lớn | `adapted` | TC-W02-PERF-003 (ct-file-storage upload error rate sanity — upload byte[] PDF qua BFF multipart; không test file size trực tiếp vì ct-file-storage là external integration qua BFF) |
| API-PS03 | Concurrent requests — không race condition | `covered` | TC-W02-PERF-002 (concurrent 5 export no DB contention) · TC-W02-PERF-004 (concurrent batch persist) |
| API-PS04 | Server restart giữa request | `out-of-scope` | W02 không có SLO restart recovery; gf-accounting là stateless Spring Boot — restart behavior covered by infra runbook, không phải perf sanity TC wave này |
| API-PS05 | Mất internet / timeout đúng quy định | `out-of-scope` | Timeout behavior của BFF Phase B/C abort là functional test thuộc `agent-test-api` (abort scenarios); không có SLO timeout cụ thể trong PKG §4.3 cho W02 |
| API-PS06 | SSL/HTTPS redirect | `out-of-scope` | Infrastructure concern; không có SLO trong PKG §4.3 W02; thuộc security/infra layer |
| E2E-PF01 | List 1000+ records: thời gian load < SLA | `adapted` | TC-W02-PERF-005 (search pagination với dataset nhỏ — staging env không có 1000+ versions trong W02; sanity với dataset hiện có; full load test defer WT-M/WT-F) |
| E2E-PF02 | Upload file 10MB < SLA | `adapted` | TC-W02-PERF-003 (ct-file-storage upload error rate — PDF size ~500KB–2MB; 10MB file là `out-of-wave-perf-sanity-only` vì không phải target file size của dossier PDF 4 tài liệu) |
| E2E-PF03 | Tìm kiếm phức tạp nhiều filter < SLA | `out-of-scope` | `POST /api/v1/insurance-dossiers/search` chỉ có 1 filter `settlementCode` + pagination — không phải complex multi-filter search; covered bởi TC-W02-PERF-005 |

**Auto vs Manual Parity Diff (§Auto vs Manual Parity Audit):**

Manual artifact: `Execution/test-cases/TC-W02-PERFORMANCE.md` — 6 TCs (PERFORMANCE-001 đến PERFORMANCE-006).

| Manual TC ID | Intent | Phân loại Auto | TC tương ứng auto / Lý do |
|---|---|---|---|
| TC-W02-PERFORMANCE-001 | PDF gen 4 tài liệu p95 < 5s | `covered` | TC-W02-PERF-001 |
| TC-W02-PERFORMANCE-002 | Concurrent 5 export no DB contention | `covered` | TC-W02-PERF-002 |
| TC-W02-PERFORMANCE-003 | S3 upload 1 file PDF p99 < 2s | `adapted` | TC-W02-PERF-003 — **ARCHITECTURE NOTE**: PKG §4.3 và ADR-016 v11 chốt "ct-file-storage external (không direct S3 client trong gf-accounting)"; BFF orchestrate Phase C upload multipart; gf-accounting KHÔNG gọi ct-file-storage trực tiếp. Manual TC-003 viết "S3 upload" nhưng storage layer đã đổi thành ct-file-storage qua BFF. Auto TC-W02-PERF-003 đo **ct-file-storage upload error rate** (không đo upload p99 trực tiếp vì không có endpoint direct-to-storage từ test) — adapted phù hợp với architecture canonical. SLO "p99 < 2s" từ manual TC là SLO không được chốt trong PKG §4.3 hoặc §9 — PKG §9 chỉ track "ct-file-storage upload error rate < 0.1%"; không áp p99 upload timeline vì ct-file-storage là external service. Ghi nhận: manual TC-003 có SLO "p99 < 2s" không có source trong PKG §4.3/§9 — auto KHÔNG adopt số này; chỉ theo SLO có source rõ trong PKG. |
| TC-W02-PERFORMANCE-004 | Baseline: PDF 2 tài liệu p95 < 3s | `out-of-scope` | PKG §4.3 và §9 chỉ định SLO "PDF gen 4 tài liệu p95 < 5s" — không có SLO riêng cho 2-tài-liệu baseline. "p95 < 3s cho 2 tài liệu" là suy diễn (50% scale) không từ SLO source chốt. Auto KHÔNG gen TC nếu không có SLO source. Lesson learn: SLO cần được chốt tường minh trong PKG/Architecture; agent không tự suy diễn. |
| TC-W02-PERFORMANCE-005 | GetInsuranceDossierDownloadUrl latency p95 < 500ms | `out-of-scope` | PKG §2.2 + ADR-016 v11: **KHÔNG có endpoint `/download` riêng và không có signed URL**; `pdfUrl` = ct-file-storage object key trong list response; FE nối domain config + dùng cơ chế download hiện hữu. Manual TC-005 ref "signed URL TTL 300s" là stale (đã bị superseded bởi ADR-016 v11 + PKG v13+ cleanup). SLO "p95 < 500ms" không có source trong PKG §4.3/§9. Auto KHÔNG gen TC này. Xem `Self-Audit Record` cho lesson learn entry. |
| TC-W02-PERFORMANCE-006 | Concurrent 10 POST /insurance-dossiers — no bottleneck | `adapted` | TC-W02-PERF-004 — auto cover concurrent batch persist (10 `POST /api/v1/insurance-dossier-documents/batch`) nhưng **chú ý contract**: endpoint canonical là `POST /api/v1/insurance-dossier-documents/batch` (§3bis.3) không phải `POST /api/v1/insurance-dossiers` (không tồn tại per §3bis.4 chỉ có search). Auto TC đã correct endpoint per PKG §3bis canonical. |

**Self-Audit Record (trước READY):**

| Category | Case | Resolution |
|---|---|---|
| `auto-miss` | TC-W02-PERFORMANCE-005 (signed URL / download endpoint latency) | Resolve ngay: KHÔNG gen TC vì architecture đã thay đổi (no signed URL, no download endpoint per ADR-016 v11). Lesson learn entry TL-W02-PERF-001 bên dưới. |
| `auto-miss` | TC-W02-PERFORMANCE-004 (2-tài-liệu baseline p95 < 3s) | Resolve ngay: SLO source không tồn tại trong PKG §4.3/§9; auto KHÔNG adopt SLO không có source. Lesson learn entry TL-W02-PERF-002 bên dưới. |
| `adapted` | TC-W02-PERFORMANCE-003 (S3 upload p99 < 2s) | Adapted sang ct-file-storage error rate per PKG §9 canonical SLO. Architecture drift resolved. |

**Execution Findings (TEST_EXECUTION 2026-06-22):**

| Finding | TC | Type | Details |
|---|---|---|---|
| BFF GraphQL endpoint | TC-002/003/004/006 | Config note | Endpoint = `http://localhost:45401/garage/graphql` (CONTEXT_PATH=/garage + GRAPHQL_PUBLIC_PATH=/graphql per agg-garage-graph ENV); KHÔNG phải `/graphql` hoặc `/graphql/graphql`. |
| `DossierExportBatchResponse` schema | TC-002/003/004/006 | Schema note | Chỉ có 2 fields: `versionNo: Int!` + `exports: [DossierExportItem!]!`. KHÔNG có `dossierStatus` — verified via introspection `__type(name: "DossierExportBatchResponse")`. |
| pdfUrl absolute URL bug | TC-W02-PERF-005 | BUG-W02-032 | `pdfUrl` trong cả gf-accounting REST `/api/v1/insurance-dossiers/search` response lẫn BFF GraphQL `getInsuranceDossierVersions` response trả absolute URL `http://localhost:45888/files/...` thay vì object key (relative path). Vi phạm ADR-016 v11: "pdfUrl = ct-file-storage object key / relative path — KHÔNG scheme/domain". Root cause: gf-accounting persist full URL thay vì object key vào cột `pdf_url` khi BFF Phase C upload → gf-accounting batch (Phase D). |
| gf-accounting `pageInfo` vs Spring Pageable | TC-W02-PERF-005 | Architecture note | gf-accounting REST endpoint `/api/v1/insurance-dossiers/search` trả `{content, pageInfo{page,size,totalElements,totalPages,...}}` (nested pageInfo object). BFF `getInsuranceDossierVersions` GraphQL trả `{content, page, size, totalElements, totalPages}` (top-level Spring Pageable fields đúng per contract). gf-accounting REST dùng `pageInfo` wrapper là non-standard so với PKG §3bis.4 convention (`POST /settlements/search` là reference); không ảnh hưởng SLO latency. |
| k6/Artillery absent | All | Env note | k6 và Artillery không có trong môi trường test. Python 3 `urllib.request` + `threading` được dùng thay thế cho sanity scope (20–50 iterations). Ghi nhận làm lesson learn TL-W02-PERF-003. |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 6 | 0 PASS, 0 FAIL, 6 SKIPPED (Run10 out-of-wave per user override 2026-06-26) |
| Manual | N/A (manual artifact TC-W02-PERFORMANCE.md là read-only reference) | — |

> Run10 2026-06-26: tất cả 6 TCs được mark SKIPPED theo user override — performance out-of-wave trong run này.
> Historical context (Run 1, 2026-06-22): 5 PASS / 1 FAIL (TC-W02-PERF-005 FAIL do BUG-W02-032 pdfUrl format violation ADR-016 v11). Kết quả lịch sử không bị xóa — xem §6 Changelog và `Execution/test-reports/TR-W02-PERFORMANCE.md`.

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-PERF-001 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §4.3 + §9: "PDF gen 4 tài liệu p95 < 5s" | Performance | Performance | P1 | Render bộ 4 tài liệu PDF đạt p95 < 5 giây dưới tải sanity | 1. `gf-accounting` healthy (`GET /health` = UP).<br>2. Staging env ổn định (không có load test chạy song song).<br>3. Bộ hồ sơ seed: phiếu QT BH `settlementCode` hợp lệ tồn tại trong gf-accounting.<br>4. formData ③ (13 trường Biên bản nghiệm thu) + formData ④ (22 trường Giấy ủy quyền) đã chuẩn bị sample payload.<br>5. Auth token: `GET http://localhost:45410/dev/token?identifier=accountant@demo.local` → `accessToken` (xác nhận per TL-W01-PERF-003). | 1. Lấy `accessToken` từ SSO-stub (KHÔNG dùng GraphQL login mutation — xem TL-W01-PERF-003).<br>2. Chạy 20 lần tuần tự (Python urllib hoặc k6 VU=1, iterations=20) gọi song song 2 render-pdf endpoints: `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` (body `{settlementCode, formData}` 13 trường) + `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` (body 22 trường).<br>3. Đo end-to-end latency mỗi lần (từ gửi request đến nhận response cuối cùng của cả 2 call).<br>4. Tính p95 từ 20 samples.<br>5. Ghi kết quả vào test report (p50/p95/p99 + error count). | - p95 latency ≤ 5000ms (SLO: PKG §4.3).<br>- Không có request nào timeout (> 30s).<br>- Tất cả response có HTTP 200 với byte[] PDF hợp lệ (không rỗng, là PDF document).<br>- Error rate = 0% trong 20 iterations.<br>- Không có exception / OOM trong gf-accounting log trong thời gian test. | SKIPPED | N/A |
| TC-W02-PERF-002 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §4.3: "concurrent export 5 bộ song song no contention" | Performance | Performance | P1 | Xuất 5 bộ hồ sơ đồng thời — không có DB deadlock hoặc lock wait timeout | 1. 5 bộ phiếu QT BH khác nhau (5 `settlementCode` distinct) đã seed trong gf-accounting tenant_id=1.<br>2. Auth token hợp lệ.<br>3. BFF `agg-garage-graph` running tại `http://localhost:45401/garage/graphql`.<br>4. DB monitoring khả dụng (docker logs gf-postgres). | 1. Lấy `accessToken`.<br>2. Gọi **đồng thời** mutation `exportInsuranceDossier(settlementCode, documentTypes: [SETTLEMENT_SHEET])` cho 5 `settlementCode` khác nhau — sử dụng Python `threading.Thread` × 5 chạy đồng thời.<br>3. Chờ tất cả 5 complete (timeout 60s).<br>4. Kiểm tra docker logs gf-postgres trong khoảng thời gian test: grep "deadlock" + "lock wait timeout".<br>5. Ghi kết quả: số lượng success vs lỗi, thời gian per request và overall. | - Cả 5 request trả thành công (GraphQL data với `versionNo` + `exports`).<br>- Không có GraphQL `errors[]` (5 phiếu QT BH distinct, không có 409 conflict).<br>- Không có deadlock entry trong Postgres log.<br>- Không có "lock wait timeout" entry trong Postgres log.<br>- Overall elapsed ≤ 15s (no SLO riêng cho concurrent — threshold gấp 3× serial SLO là sàn sanity hợp lý; không hardcode SLA). | SKIPPED | N/A |
| TC-W02-PERF-003 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph, ct-file-storage | PKG §9: "ct-file-storage upload error rate < 0.1%" | Performance | Performance | P1 | ct-file-storage upload lỗi < 0.1% qua BFF multipart — sanity 50 lần upload | 1. BFF `agg-garage-graph` running; mutation `exportInsuranceDossier` reachable tại `http://localhost:45401/garage/graphql`.<br>2. ct-file-storage sim running tại port 45888.<br>3. Ít nhất 6 `settlementCode` phiếu QT BH distinct có sẵn.<br>4. Auth token hợp lệ.<br>**Lưu ý architecture**: ct-file-storage upload được orchestrate bởi BFF (Phase C); gf-accounting KHÔNG gọi ct-file-storage trực tiếp. Test đo qua BFF mutation. | 1. Lấy `accessToken`.<br>2. Gọi `exportInsuranceDossier` mutation 50 lần (Python sequential loop, rotate 6 settlementCode) — mỗi lần với `documentTypes: [SETTLEMENT_SHEET]` để trigger Phase C upload 1 file per run.<br>3. Ghi nhận số response có GraphQL `errors[]` liên quan Phase C (STORAGE/UPLOAD code) vs success (có `exports[].fileUrl`).<br>4. Tính error rate = (Phase C upload fail / total 50 runs) × 100%.<br>5. Ghi kết quả vào test report. | - Error rate của Phase C upload ≤ 0.1% (SLO: PKG §9; trên 50 iterations = cho phép tối đa 0 fail).<br>- Tất cả `fileUrl` trong response có giá trị (không rỗng, không null).<br>- Không có GraphQL `errors[]` trong 50 runs.<br>- ct-file-storage sim accept mọi request (không 403/401). | SKIPPED | N/A |
| TC-W02-PERF-004 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §4.3: "concurrent export 5 bộ song song no contention" (atomic batch persist layer) | Performance | Performance | P2 | Batch persist 10 bộ hồ sơ đồng thời — không bottleneck tại BFF orchestrator Phase D | 1. 6 phiếu QT BH distinct (`settlementCode` khác nhau) tồn tại trong gf-accounting tenant_id=1 (10 requests rotate 6 codes).<br>2. Auth token hợp lệ.<br>3. BFF running tại `http://localhost:45401/garage/graphql`. | 1. Lấy `accessToken`.<br>2. Gọi đồng thời 10 `exportInsuranceDossier(settlementCode, documentTypes: [SETTLEMENT_SHEET])` với 10 `settlementCode` (rotate 6 distinct codes, repeat OK — tạo version mới per call) — Python `threading.Thread` × 10.<br>3. Đo số success (có `versionNo` + `exports`) vs error.<br>4. Kiểm tra docker logs gf-postgres cho deadlock/lock wait timeout.<br>5. Ghi overall elapsed. | - ≥ 9/10 request trả thành công trong 10s.<br>- Không có GraphQL `errors[]` hoặc HTTP 500.<br>- Không có deadlock / lock wait timeout trong Postgres log.<br>- Mỗi bộ hồ sơ có `versionNo` tăng dần per `settlementCode` (xác nhận batch persist atomic đúng). | SKIPPED | N/A |
| TC-W02-PERF-005 | FEAT-INS-DOSSIER-VIEW | gf-accounting | PKG §9: "TC pass rate ≥ 95%"; common baseline E2E-PF01/PF03 adapted | Performance | Performance | P2 | Tìm kiếm bộ hồ sơ BH đạt latency p95 sanity < 1s với dataset nhỏ | 1. gf-accounting running.<br>2. `settlementCode` `SET-20260618-00001` có 30 versions (verified via search totalElements=30).<br>3. Auth token hợp lệ. | 1. Lấy `accessToken`.<br>2. Chạy 50 lần `POST /api/v1/insurance-dossiers/search` body `{settlementCode: "SET-20260618-00001", page: 0, size: 10}` (Python urllib sequential).<br>3. Đo response latency mỗi lần.<br>4. Tính p95 từ 50 samples.<br>5. Verify response structure và `pdfUrl` format trong documents. | - p95 latency ≤ 1000ms (sanity ngưỡng — KHÔNG phải SLO chốt).<br>- Response có `content[]` + `pageInfo{page,size,totalElements,totalPages}` (gf-accounting REST) hoặc `content[] + page + size + totalElements + totalPages` (BFF passthrough).<br>- `pdfUrl` trong documents là ct-file-storage object key (KHÔNG có `http://` scheme) per ADR-016 v11.<br>- Error rate = 0% trong 50 iterations. | SKIPPED | BUG-W02-032 |
| TC-W02-PERF-006 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph, gf-accounting, ct-file-storage | PKG §9: "Dossier export success rate (post-deploy 24h) ≥ 99%" | Performance | Performance | P1 | BFF mutation `exportInsuranceDossier` end-to-end sanity — success rate ≥ 99% | 1. BFF `agg-garage-graph` running + 4-phase orchestrator hoạt động tại `http://localhost:45401/garage/graphql`.<br>2. gf-accounting running + ct-file-storage sim running (port 45888).<br>3. 6 phiếu QT BH distinct `settlementCode` tenant_id=1.<br>4. Auth token hợp lệ. | 1. Lấy `accessToken`.<br>2. Gọi mutation `exportInsuranceDossier(settlementCode, documentTypes: [SETTLEMENT_SHEET])` 20 lần (Python sequential loop, rotate 6 codes).<br>3. Ghi nhận số response thành công (có `versionNo` + `exports[].fileUrl`) vs lỗi (GraphQL `errors[]`).<br>4. Tính success rate = (successful / 20) × 100%.<br>5. Ghi breakdown lỗi theo phase: Phase A (INS_STL_NOT_FOUND), Phase B (INS_DOSSIER_RENDER_FAIL), Phase C (INS_DOSSIER_STORAGE_UPLOAD_FAIL), Phase D (INS_DOSSIER_PERSIST_FAIL). | - Success rate ≥ 99% (SLO: PKG §9 "Dossier export success rate ≥ 99%").<br>- Response có `versionNo` (integer, tăng dần per settlementCode) + `exports[{documentType, fileUrl, fileName}]`.<br>- Không có Phase D atomic rollback failure (INS_DOSSIER_PERSIST_FAIL).<br>- Nếu có Phase B/C failure: kiểm tra BFF không gọi Phase D (abort correctly). | SKIPPED | N/A |

---

## 5. Notes

### Phase A CRs — out-of-wave-perf-sanity-only

Phase A CRs (CR-20260612-01, CR-20260612-02, CR-20260616-01, CR-20260616-02, CR-20260618-01, CR-20260618-02) không có SLO riêng trong PKG §4.3 hoặc §9 Post-Wave Actuals. Các CR này là extension nhẹ (panel read-only, template in, popup cảnh báo) — không có heavy compute path riêng. Perf impact của Phase A được hấp thụ vào SLO chung W01 (SO Edit save p99 < 800ms, đã pass W01). Auto artifact W02 không gen TC riêng cho Phase A CRs vì không có SLO source chốt trong PKG W02. Nếu Architecture Authority chốt SLO Phase A trong PKG revision → cần gen TC bổ sung.

### Signed URL / Download Endpoint — architecture drift resolved

Manual TC-W02-PERFORMANCE-005 ref "GetInsuranceDossierDownloadUrl latency p95 < 500ms" dựa trên architecture cũ có endpoint `/download` + signed URL TTL 300s. ADR-016 v11 + PKG v13+ đã supersede: không có endpoint `/download` riêng; `pdfUrl` = ct-file-storage object key trong list response; FE nối domain config + dùng cơ chế download hiện hữu. Không có SLO source cho case này trong PKG §4.3/§9. Auto artifact không gen TC.

### 2-tài-liệu baseline p95 — không có SLO source

Manual TC-W02-PERFORMANCE-004 "PDF gen 2 tài liệu p95 < 3s" dựa trên suy diễn (50% scale). PKG §4.3/§9 chỉ có SLO "4 tài liệu p95 < 5s". Auto artifact không adopt SLO không có source chốt (per Forbidden Action: KHÔNG tự tạo hoặc relax SLO).

### Lesson Learn Entries (§Auto vs Manual Parity — auto-miss resolved)

**TL-W02-PERF-001** (xem bảng phía dưới): TC-W02-PERFORMANCE-005 manual dùng architecture stale (signed URL endpoint) — không có SLO source trong PKG §4.3/§9 sau ADR-016 v11.

**TL-W02-PERF-002** (xem bảng phía dưới): TC-W02-PERFORMANCE-004 manual dùng SLO suy diễn (2-tài-liệu baseline = 50% 4-tài-liệu) — không có SLO source chốt.

**TL-W02-PERF-003** (xem bảng phía dưới — mới từ TEST_EXECUTION): k6/Artillery không có trong môi trường test; BFF GraphQL endpoint non-obvious path `/garage/graphql`; pdfUrl absolute URL bug phát hiện qua expected-result assertion.

---

## 6. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-22 | 1 | Khởi tạo — W02 perf sanity TCs (6 TCs): PDF gen p95 < 5s (TC-001), concurrent 5 export no contention (TC-002), ct-file-storage upload error rate < 0.1% (TC-003), concurrent batch persist (TC-004), search pagination sanity (TC-005), BFF export success rate ≥ 99% (TC-006). Coverage map common baseline (API-PS01–PS06 + E2E-PF01–PF03) + parity diff manual 6 TCs (2 `adapted`, 2 `out-of-scope`, 1 `covered`). Lesson learn entries TL-W02-PERF-001 + TL-W02-PERF-002. Không áp dụng full load test (W02 không phải WT-M/WT-F). | agent-test-performance |
| 2026-06-22 | 2 | TEST_EXECUTION results: TC-001 PASS (p95=126ms << 5000ms), TC-002 PASS (5/5 concurrent, no deadlock), TC-003 PASS (50/50 success, upload error rate=0%), TC-004 PASS (10/10 concurrent, elapsed=248ms), TC-005 FAIL (p95=30.2ms << 1000ms PASS nhưng `pdfUrl` format violation ADR-016 v11 → BUG-W02-029 P2), TC-006 PASS (20/20 success rate=100%). Thêm execution findings: BFF endpoint `/garage/graphql`, `DossierExportBatchResponse` schema, pdfUrl absolute URL bug, k6/Artillery absent (Python workaround). Status Summary: 5 PASS / 1 FAIL. | agent-test-performance |
| 2026-06-22 | 3 | Bug ID correction: TC-W02-PERF-005 bug reference đổi từ BUG-W02-029 → BUG-W02-032. BUG-W02-029 (đã được agent-test-security đặt cho JWT auth bypass security bug) xảy ra collision với pdfUrl format bug của performance agent. pdfUrl absolute URL backend persistence bug được file chính xác là BUG-W02-032 (P2, agent-fix-gf-accounting). Status Summary correction: BUG-W02-032 là bug mới phát hiện bởi performance test, không phải BUG-W02-029. Thêm TL-W02-PERF-003 vào TEST-LESSONS-LEARNED.md (k6/Artillery absent + BFF endpoint path non-obvious + pdfUrl bug discovered via assertion). | agent-test-performance |
| 2026-06-26 | 4 | Run10 out-of-scope SKIPPED: tất cả 6 TC rows (TC-W02-PERF-001 đến TC-W02-PERF-006) được mark SKIPPED per user override — performance out-of-wave trong W02 Run10. Status Summary cập nhật: 0 PASS, 0 FAIL, 6 SKIPPED. Thêm prominent note đầu file. Historical execution results (Run1 2026-06-22: 5 PASS / 1 FAIL) được preserve trong Changelog và TR-W02-PERFORMANCE.md. | agent-test-performance |
