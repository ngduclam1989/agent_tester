---
document_id: 'GMS-TC-W02-SECURITY-AUTO'
type: test-case-automated
parent: 'Execution/automated-test-cases/'
status: ACTIVE
version: 4
boundary: 'gf-accounting, agg-garage-graph, ct-file-storage (S3-backed)'
wave: 'W02'
owner: 'agent-test-security'
last_reviewed: '2026-06-26'
---

# Automated Test Cases — W02: Security (Insurance Settlement + Dossier)

> Auto artifact cho wave 02 security testing.
> **KHÔNG ghi trực tiếp vào** `Execution/test-cases/TC-W02-SECURITY.md` (manual QC artifact, read-only).
> Stage: TEST_EXECUTION Run 2 complete — 18 BLOCKED TCs confirmed still BLOCKED (Bash HTTP calls denied in both Run 1 and Run 2 sessions). No status change from Run 1.

> **Run10 2026-06-26: SECURITY OUT-OF-WAVE per user override — all TCs marked SKIPPED (security not in W02 scope this run). Prior Run2 BLOCKED findings superseded by scope decision.**

---

## 1. General Info

| Field         | Value                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| Document ID   | `GMS-TC-W02-SECURITY-AUTO`                                                              |
| Wave          | W02                                                                                     |
| Boundary(ies) | `gf-accounting`, `agg-garage-graph`, `ct-file-storage` (S3-backed object store)        |
| Feature(s)    | `FEAT-INS-STL-CREATE`, `FEAT-INS-DOSSIER-CREATE`, `FEAT-INS-DOSSIER-VIEW`             |
| Owner         | `agent-test-security`                                                                   |
| Last Reviewed | 2026-06-26                                                                              |
| Work Package  | `Execution/work-packages/PKG-W02-insurance-dossier.md`                                  |

---

## 2. Scope

### In Scope

- **Authn abuse** — gọi mọi endpoint W02 không có token, với token hết hạn, với token bị chỉnh sửa signature (forged HS256).
- **Authz abuse (role-based)** — role không được phép (vd technician) cố gọi các endpoint create/export dossier, render PDF, read dossier list.
- **Authz abuse (persona gate)** — nút "+ Tạo hồ sơ bảo hiểm" chỉ khả dụng khi `payerType = INSURANCE`; token hợp lệ nhưng phiếu QT KH không được mở.
- **Server-side computed field injection** — cố override `insuranceTotalAmount` (field read-only computed) qua mutation payload `CreateSettlement`.
- **File upload abuse** — upload MIME không trong whitelist (EXE, HTML, ZIP) lên endpoint render PDF; upload với MIME giả mạo (content-type đúng nhưng magic bytes sai); upload file EICAR test signature.
- **Upload size abuse** — upload file oversized (> max limit) để trigger 413.
- **Upload zero-byte** — upload file 0 bytes.
- **Signed URL TTL abuse** — URL hết hạn sau TTL phải bị S3/ct-file-storage từ chối; forging TTL parameter trong URL bị reject do signature mismatch.
- **SSRF via template fields** — inject URL-like payload (AWS metadata endpoint, attacker domain) vào field `formData` của Biên bản nghiệm thu hoặc Giấy ủy quyền → PDF renderer không được fetch ngoài.
- **Injection vào field text form-fill** — XSS payload vào các field nhập tay (tên KH, địa điểm, ngày lập, số hợp đồng BH, CMND/CCCD); SQLi vào field text; path traversal trong field filename-like.
- **Null byte vào field text** — `\0` trong string field form-fill.
- **Data exposure** — response error không lộ stack trace, DB schema, internal path; không lộ PII trong response phiếu QT BH ngoài contract; `pdfUrl` không chứa signed credential (phải là object key opaque).
- **Storage immutability** — thử xóa/overwrite file đã lưu trong ct-file-storage không thành công (retention).
- **Storage SSE-KMS** — file PDF được encrypt at rest (SSE-KMS hoặc tương đương).
- **Session abuse** — sau logout → protected GraphQL operation bị từ chối.
- **Optimistic lock bypass** — cố persist dossier với `versionNo` cũ khi đã có version mới (concurrent export).
- **Service-to-service x-api-key** — cố gọi `POST /api/v1/insurance-dossier-documents/batch` và render-pdf endpoints trực tiếp không qua BFF (không có x-api-key hoặc sai key) bị reject.

### Out of Scope

- Cross-tenant isolation (garage-a xem dossier của garage-b) → `agent-test-isolation`.
- API contract / response schema validation (đủ field, HTTP status code convention) → `agent-test-api`.
- Full journey unhappy path (web/mobile) → `agent-test-e2e` / `agent-test-mobile-e2e`.
- UI render permission visibility (nút ẩn/hiện theo role) → `agent-test-ui` / `agent-test-mobile-ui`.
- SLO under attack load (upload throughput, concurrent export latency) → `agent-test-performance`.
- Rate limiting enforcement under burst (ratelimit counter infra) → `agent-test-performance`.

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Tenant seed | `tenant_id=1` (garage-a), `tenant_id=2` (garage-b) — 2 tenant độc lập | Dùng từ existing infra seed |
| Token — kế toán | `accountant@demo.local` qua sso-stub `GET http://localhost:45410/dev/token?identifier=accountant@demo.local` → field `accessToken` | Theo TL-W01-PERF-003: auth đúng là sso-stub REST, không phải GraphQL login mutation |
| Token — chủ garage | `owner@demo.local` qua sso-stub REST tương tự | |
| Token — technician | Forge JWT HS256 với `custom:role=technician, custom:tenant_id=1, sub=technician-test` — secret `dev-sso-stub-secret` (từ `infra/sim/apps/sso.js`) | Theo TL-W01-ISO-001: sso-stub không hỗ trợ role dynamic; forge thủ công là đúng approach |
| Token expired | Forge JWT HS256 với `exp = now - 3600` | Backend W01 không verify exp (TL-W01-SEC-001) — dự kiến vẫn PASS qua backend nhưng cần assert theo expectation đúng; log nếu 200 thay vì 401 |
| Token tampered | Token hợp lệ + sửa 1 byte ở segment signature | Phát hiện nếu backend bắt đầu verify signature sau W01 fix |
| Phiếu QT BH seed | `settlement_code=SET-20260618-00001`, `payerType=INSURANCE`, `tenant_id=1`, SO đã COMPLETED với `has_insurance=true` | Đã xác nhận có trong DB `gf_accounting.settlement_records` |
| Phiếu QT KH seed | `settlement_code=SET-20260619-00003`, `payerType=CUSTOMER`, `tenant_id=1` | Dùng để test gate "không mở dossier từ phiếu KH" |
| Dossier exported | `SET-20260618-00001` có version EXPORTED tồn tại trong `gf_accounting.insurance_dossiers` (v10 EXPORTED) | Prerequisite cho TC TTL, forge URL, delete attempt, SSE-KMS |
| BFF GraphQL path | `POST http://localhost:45401/garage/graphql` (confirmed từ docker logs — không phải `/graphql` root) | TL-W02-SEC-001: path discovery bắt buộc trước execution |
| gf-accounting direct | `http://localhost:45081` | Confirmed healthy |
| Harness | Jest + axios (REST calls trực tiếp gf-accounting port nội bộ) + axios/`graphql-request` cho BFF GraphQL (port 45401) | Reuse pattern TC-W01-SECURITY-AUTO |
| ct-file-storage access | Simulator tại port 45888 (ct-file-storage-sim) — KHÔNG phải S3 thật | Signed URL TTL/SSE-KMS N/A trong simulator env |
| EICAR test file | String 68-byte chuẩn EICAR test (sanitized — lưu trong harness fixture, không paste ở đây) | Chỉ cần nếu antivirus scan được enable trên staging |

#### Common Test Case Baseline — Coverage Map

Ánh xạ từ sàn tối thiểu `common-testcase-api.md §1+§6+API-RS07+API-ER03` + `common-testcase-e2e.md §1+§6` vào các abuse-case TC trong artifact này:

| Common Case | Ánh xạ TC trong auto artifact | Trạng thái |
|---|---|---|
| API-AA01 — Gọi không có token → 401 | TC-W02-SEC-AUTO-001 (no token), TC-W02-SEC-AUTO-015 (no token render-pdf) | covered |
| API-AA02 — Token hết hạn → 401 | TC-W02-SEC-AUTO-002 | covered |
| API-AA03 — Token forged signature → 401 | TC-W02-SEC-AUTO-003 | covered |
| API-AA05 — Token đúng nhưng role thấp → 403 | TC-W02-SEC-AUTO-004, TC-W02-SEC-AUTO-005 | covered |
| API-AA06 — IDOR (read data của user/payer lain) | TC-W02-SEC-AUTO-006 (KH token cố mở dossier BH) | covered (single-tenant; cross-tenant → agent-test-isolation) |
| API-SC01 — XSS payload vào field text | TC-W02-SEC-AUTO-020 (formData field kế toán nhập), TC-W02-SEC-AUTO-021 | covered |
| API-SC02 — SQL injection vào field text | TC-W02-SEC-AUTO-022 | covered |
| API-SC05 — Path traversal vào param | TC-W02-SEC-AUTO-023 | covered |
| API-SC06 — Null byte vào string field | TC-W02-SEC-AUTO-024 | covered |
| API-RS07 — Không lộ sensitive data trong response | TC-W02-SEC-AUTO-030 (no stack trace), TC-W02-SEC-AUTO-031 (pdfUrl opaque) | covered |
| API-ER03 — 500 không lộ stack trace | TC-W02-SEC-AUTO-030 | covered |
| API-FU02 — Upload MIME không trong whitelist → 400/422 | TC-W02-SEC-AUTO-010 | covered |
| API-FU03 — Upload oversized → 413 | TC-W02-SEC-AUTO-012 | covered |
| API-FU04 — Upload 0 bytes → 400 | TC-W02-SEC-AUTO-013 | covered |
| E2E-AU03 — Tài khoản bị khóa / không hợp lệ | out-of-scope — thuộc agent-test-e2e full journey auth | out-of-scope: full journey authn flow |
| E2E-AU07 — Logout → protected resource bị từ chối | TC-W02-SEC-AUTO-007 | covered |
| E2E-AU08 — Session timeout | out-of-scope — token expiry đã cover tại TC-002; idle session redirect UI flow thuộc agent-test-e2e | out-of-scope: idle UI redirect |
| E2E-AU09 — Multi-tab session | out-of-scope — thuộc agent-test-e2e; BFF stateless GraphQL không state per-tab | out-of-scope: stateless API |
| E2E-PM01 — User role thấp cố truy cập URL protected | TC-W02-SEC-AUTO-004 (REST/GraphQL level, không phải URL browser) | adapted: API layer |
| E2E-PM02 — Button ẩn theo quyền (UI) | out-of-scope → agent-test-mobile-ui / agent-test-ui | out-of-scope: UI render |
| E2E-PM04 — Thay role mid-session | out-of-scope — stateless JWT; claim trong token không thay đổi mid-session | out-of-scope: JWT immutable per token |
| API-AA07 — Authorization header case sensitivity | TC-W02-SEC-AUTO-001 step variant — covered qua "no auth header" path | adapted |
| SSRF risk | TC-W02-SEC-AUTO-025 | covered |
| Storage encryption (SSE-KMS) | TC-W02-SEC-AUTO-033 | covered |
| Storage immutability (delete blocked) | TC-W02-SEC-AUTO-032 | covered |
| Signed URL expiry | TC-W02-SEC-AUTO-008 | covered |
| Signed URL forge | TC-W02-SEC-AUTO-009 | covered |
| MIME magic bytes validation | TC-W02-SEC-AUTO-011 | covered |
| EICAR virus scan | TC-W02-SEC-AUTO-014 | covered (note: staging phải có AV scan active) |
| Service-to-service x-api-key bypass | TC-W02-SEC-AUTO-016 | covered |
| Computed field injection (read-only field) | TC-W02-SEC-AUTO-017 | covered |
| Optimistic lock bypass | TC-W02-SEC-AUTO-018 | covered |
| Persona gate (payerType guard) | TC-W02-SEC-AUTO-006 | adapted |

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 33 | 33 SKIPPED (out-of-wave per user override Run10 2026-06-26) |
| Manual | N/A — read-only cross-check chỉ (TC-W02-SECURITY.md manual artifact) | — |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-SEC-AUTO-001 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph | PKG §2.2; common API-AA01 | Security | Security | P1 | Gọi exportInsuranceDossier không có Authorization header bị từ chối | BFF agg-garage-graph chạy tại `localhost:45401/garage/graphql`; phiếu QT BH `SET-20260618-00001` tồn tại | 1. Gửi `POST /garage/graphql` với mutation `exportInsuranceDossier` payload hợp lệ nhưng KHÔNG có header `Authorization`.<br>2. Ghi nhận HTTP status và body response. | - HTTP 401 Unauthorized (hoặc HTTP 200 với `errors[].extensions.code=UNAUTHENTICATED`).<br>- Không trả data dossier.<br>- Body không chứa stack trace hay internal path. | SKIPPED | BUG-W02-029 |
| TC-W02-SEC-AUTO-002 | FEAT-INS-DOSSIER-CREATE | gf-accounting, agg-garage-graph | PKG §2.2; common API-AA02; TL-W01-SEC-001 | Security | Security | P1 | Token hết hạn bị từ chối ở endpoint export dossier | Token expired được forge theo TL-W01-ISO-001 pattern (exp = now - 3600, HS256, secret `dev-sso-stub-secret`) | 1. Forge JWT HS256 với `exp = now - 3600`.<br>2. Gửi `POST /garage/graphql` mutation `exportInsuranceDossier` với token expired trong `Authorization: Bearer`.<br>3. Ghi nhận response. | - Kỳ vọng HTTP 401 / UNAUTHENTICATED.<br>- Không trả dossier data.<br>- Không lộ internal detail. | SKIPPED | BUG-W02-029 |
| TC-W02-SEC-AUTO-003 | FEAT-INS-DOSSIER-CREATE | gf-accounting, agg-garage-graph | PKG §2.2; common API-AA03; TL-W01-SEC-001 | Security | Security | P1 | Token bị sửa signature bị từ chối ở endpoint export dossier | Token hợp lệ của kế toán đã lấy từ sso-stub | 1. Lấy token hợp lệ qua sso-stub REST.<br>2. Tách 3 segment JWT; sửa 1 ký tự ở segment signature (thay `A` bằng `B` ở position cuối).<br>3. Gửi mutation `exportInsuranceDossier` với token tampered.<br>4. Ghi nhận response. | - Kỳ vọng HTTP 401 / UNAUTHENTICATED.<br>- Không trả data dossier. | SKIPPED | BUG-W02-029 |
| TC-W02-SEC-AUTO-004 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13 FEAT-INS-DOSSIER-CREATE; common API-AA05; TL-W01-SEC-003 | Security | Security | P1 | Technician (role không được phép) bị từ chối khi gọi POST batch persist dossier | Token technician forge HS256 với `custom:role=technician, custom:tenant_id=1`; phiếu QT BH `SET-20260618-00001` tồn tại | 1. Forge token technician.<br>2. Gọi trực tiếp `POST /api/v1/insurance-dossier-documents/batch` với body hợp lệ (settlementCode + documents array).<br>3. Ghi nhận HTTP status và response body. | - HTTP 403 Forbidden.<br>- Không có record mới được persist trong `insurance_dossier_documents`.<br>- Response không lộ metadata hồ sơ (tên file, số tiền, mã phiếu) trong error body. | SKIPPED | BUG-W02-030 |
| TC-W02-SEC-AUTO-005 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13 FEAT-INS-DOSSIER-CREATE; common API-AA05; TL-W01-SEC-003 | Security | Security | P1 | Technician bị từ chối khi gọi GET list dossier | Token technician forge (xem TC-004) | 1. Forge token technician.<br>2. Gọi `POST /api/v1/insurance-dossiers/search` với body `{settlementCode: "SET-20260618-00001", page: 0, size: 10}`.<br>3. Ghi nhận response. | - HTTP 403 Forbidden.<br>- Không trả nội dung bộ hồ sơ nào.<br>- Response không lộ metadata dossier trong body. | SKIPPED | BUG-W02-030 |
| TC-W02-SEC-AUTO-006 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph, gf-accounting | AC-13; BR-INS-DOSSIER-011; common API-AA06 (adapted IDOR-like payer gate) | Security | Security | P1 | Kế toán cố xuất hồ sơ từ phiếu QT Khách hàng bị từ chối (payer gate) | Token kế toán hợp lệ; phiếu QT KH `SET-20260619-00003` (`payerType=CUSTOMER`) tồn tại | 1. Lấy token kế toán hợp lệ.<br>2. Gọi mutation `exportInsuranceDossier(settlementCode: "SET-20260619-00003", documentTypes: [QUOTATION_SHEET])` via BFF.<br>3. Ghi nhận response. | - Request bị từ chối — HTTP error hoặc GraphQL error với code phù hợp (vd `INS_STL_NOT_INSURANCE_TYPE`).<br>- Không tạo record dossier mới.<br>- Response không lộ nội dung phiếu QT KH. | SKIPPED | BUG-W02-031 |
| TC-W02-SEC-AUTO-007 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph | common E2E-AU07 (adapted API layer) | Security | Security | P2 | Sau logout (token revoke / token absent) → getInsuranceDossierVersions bị từ chối | Dossier đã được export ít nhất 1 lần cho `SET-20260618-00001` | 1. Gọi query `getInsuranceDossierVersions(settlementCode: "SET-20260618-00001")` KHÔNG có Authorization header (simulate logout).<br>2. Ghi nhận response. | - HTTP 401 / UNAUTHENTICATED.<br>- Không trả danh sách dossier.<br>- Body không chứa stack trace hay URL dossier. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-008 | FEAT-INS-DOSSIER-VIEW | ct-file-storage | AC-5 FEAT-INS-DOSSIER-VIEW; PKG §S3 signed URL | Security | Security | P1 | Signed URL hết hạn (TTL) → storage từ chối truy cập | Signed URL hợp lệ đã lấy từ response `getInsuranceDossierVersions`; TTL cấu hình staging | 1. Lấy `pdfUrl` từ response `getInsuranceDossierVersions`.<br>2. Đợi TTL + 10 giây (nếu TTL ngắn ở staging) HOẶC dùng URL với timestamp cũ đã capture trước đó.<br>3. Truy cập URL hết hạn bằng curl/HTTP GET trực tiếp.<br>4. Ghi nhận HTTP status trả về từ storage. | - HTTP 403 Forbidden hoặc HTTP 401 từ storage (URL expired).<br>- Nội dung file PDF không được trả về.<br>- Response body là XML/JSON error từ S3/ct-file-storage, không phải file content. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-009 | FEAT-INS-DOSSIER-VIEW | ct-file-storage | PKG §S3 signed URL; common API-SC05 (adapted forge) | Security | Security | P2 | Thay đổi tham số TTL/expiry trong signed URL bị storage reject | Signed URL hợp lệ đang còn hạn | 1. Lấy signed URL hợp lệ từ response `getInsuranceDossierVersions`.<br>2. Parse query string của URL; thay đổi tham số expiry/expires sang giá trị lớn hơn (vd x10 TTL gốc) mà không thay đổi signature.<br>3. Truy cập URL đã sửa bằng curl HTTP GET.<br>4. Ghi nhận response. | - HTTP 403 Forbidden từ storage (signature mismatch do tham số đã thay đổi).<br>- File không được phục vụ.<br>- Không có escalation timeout hay retry loop. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-010 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2 upload; common API-FU02 | Security | Security | P1 | Upload file MIME không trong whitelist bị reject | Endpoint render-pdf hoặc batch tồn tại; file test: EXE, HTML, ZIP với Content-Type đúng MIME của chúng | 1. Upload file với `Content-Type: application/x-executable`.<br>2. Upload file với `Content-Type: text/html`.<br>3. Upload file với `Content-Type: application/zip`.<br>4. Mỗi lần kiểm tra response HTTP status và body. | - Tất cả 3 request bị reject với HTTP 400 hoặc 422.<br>- Error message chỉ nêu MIME không được phép — không lộ storage path hay internal error detail.<br>- Không có file nào được lưu vào ct-file-storage. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-011 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2 upload magic bytes; common API-SC01 (adapted binary) | Security | Security | P1 | Upload file giả MIME (content-type PDF nhưng magic bytes là EXE) bị reject | Endpoint render/upload tồn tại; file test: binary EXE (magic bytes MZ 4D 5A) đổi extension sang `.pdf` | 1. Tạo file binary với magic bytes EXE (`4D 5A 90 00 ...`) nhưng đặt Content-Type header = `application/pdf`.<br>2. Upload file này lên endpoint render-pdf hoặc batch upload.<br>3. Ghi nhận response. | - Server validate magic bytes, không chỉ Content-Type header.<br>- File bị reject với HTTP 400 hoặc 422.<br>- Không có file được persist. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-012 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2; common API-FU03 | Security | Security | P2 | Upload file vượt kích thước tối đa bị reject với 413 | Endpoint render-pdf hoặc upload tồn tại; biết max upload size từ config | 1. Tạo file PDF dummy vượt quá max upload size (vd file > 10MB nếu limit = 10MB per BUG-W02-008).<br>2. Upload lên endpoint render-pdf.<br>3. Ghi nhận HTTP status. | - HTTP 413 Payload Too Large hoặc 400 (per BUG-W02-008 drift — limit 10MB gf-accounting vs nginx 50MB).<br>- Server không crash hay timeout.<br>- Response body là thông báo lỗi rõ ràng, không có stack trace. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-013 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2; common API-FU04 | Security | Security | P2 | Upload file 0 bytes bị reject với 400 | Endpoint render-pdf hoặc upload tồn tại | 1. Gửi upload request với file body trống (Content-Length: 0).<br>2. Ghi nhận response. | - HTTP 400 Bad Request.<br>- Error message không lộ internal detail. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-014 | FEAT-INS-DOSSIER-CREATE | gf-accounting, ct-file-storage | PKG §2.2 virus scan | Security | Security | P1 | Upload file EICAR test signature bị virus scan reject | AV scan service enabled trên staging (nếu không enabled → mark BLOCKED_BY_ENV với lý do); bộ hồ sơ v1 PENDING | 1. Tạo file text chứa EICAR test signature standard (chuỗi 68-byte chuẩn, không paste tại đây — lưu trong harness/fixtures/eicar.txt).<br>2. Upload file này lên endpoint render/upload của dossier.<br>3. Ghi nhận response và kiểm tra không có record nào được insert vào `insurance_dossier_documents`. | - File bị reject sau virus scan trước khi persist vào storage.<br>- HTTP 400 hoặc 422 với error code virus-related.<br>- Record mới KHÔNG xuất hiện trong `insurance_dossier_documents`. | SKIPPED | N/A — Re-classified 2026-06-22 (was BLOCKED_BY_ENV). Reason: AV scan service chỉ có ở staging infra, KHÔNG thuộc W02 dev-local scope; deferred sang staging dry-run pre-RELEASE. Per W02 test-exec lessons + agent-test-security re-classification protocol. |
| TC-W02-SEC-AUTO-015 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13; common API-AA01 (adapted render-pdf endpoint) | Security | Security | P1 | Gọi POST render-pdf Biên bản nghiệm thu không có token bị từ chối | gf-accounting service running; endpoint `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` tồn tại | 1. Gửi `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` với body formData hợp lệ NHƯNG không có Authorization header.<br>2. Ghi nhận response. | - HTTP 401 Unauthorized.<br>- Không trả PDF bytes.<br>- Body không chứa stack trace hay internal path. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-016 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §2.2 service-to-service; TL-W01-SEC-004 (adapted) | Security | Security | P1 | Cố gọi endpoint persist batch không qua BFF (thiếu x-api-key hoặc sai key) bị reject | gf-accounting service running; `POST /api/v1/insurance-dossier-documents/batch` là internal-only endpoint | 1. Gọi trực tiếp `POST /api/v1/insurance-dossier-documents/batch` với body hợp lệ NHƯNG không có `x-api-key` header (hoặc với giá trị key sai).<br>2. Ghi nhận HTTP status. | - HTTP 401 hoặc 403 (endpoint từ chối request không qua BFF).<br>- Không có record persist trong DB.<br>- Response không lộ internal schema hay service dependency. | SKIPPED | BUG-W02-030 |
| TC-W02-SEC-AUTO-017 | FEAT-INS-STL-CREATE | gf-accounting | AC-6 FEAT-INS-STL-CREATE; BR-INS-STL-CRE-003 | Security | Security | P1 | Cố inject giá trị tùy ý vào trường "Tổng tiền BH" (computed read-only) qua mutation CreateSettlement bị ignore | Token kế toán hợp lệ; SO BH `SET-20260618-00001` COMPLETED | 1. Lấy token kế toán hợp lệ.<br>2. Gọi mutation `CreateSettlement` qua BFF với payload chứa `insuranceTotalAmount: 999999999` (giá trị tùy ý giả mạo).<br>3. Sau khi settlement tạo thành công (nếu không bị reject), query lại `getSettlementByCode` và lấy giá trị `insuranceTotalAmount` thực tế. | - Giá trị `insuranceTotalAmount` được lưu = giá trị tính server-side theo BR-INS-STL-CRE-003 (KHÔNG phải `999999999`).<br>- Nếu mutation reject tham số này hoàn toàn (ignore field) → response vẫn 2xx và số tiền là computed value.<br>- Không có settlement nào lưu giá trị `999999999` vào DB. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-018 | FEAT-INS-DOSSIER-CREATE | gf-accounting | EC-2 FEAT-INS-DOSSIER-CREATE; BR-INS-DOSSIER-009 | Security | Security | P2 | Optimistic lock: cố persist dossier với versionNo cũ khi version mới đã tồn tại | Dossier v1 đã exported cho `SET-20260618-00001`; kế toán token hợp lệ | 1. Gọi `POST /api/v1/insurance-dossier-documents/batch` với `settlementCode=SET-20260618-00001` để tạo vN+1 hợp lệ → thành công.<br>2. Ngay sau đó, gọi lại `POST /api/v1/insurance-dossier-documents/batch` với body gần giống nhưng cố tình replicate vN (hoặc gửi concurrent request).<br>3. Ghi nhận response của request thứ 2. | - Request thứ 2 bị từ chối với HTTP 409 Conflict và error code `INS_DOSSIER_VERSION_CONFLICT`.<br>- Không có duplicate dossier record (unique constraint `(tenant_id, settlement_code, version_no)` được enforce).<br>- Response không lộ internal state hay DB schema. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-019 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph | AC-8, AC-13; common E2E-PM01 (adapted — kế toán và chủ garage đều được phép) | Security | Security | P2 | Kế toán và chủ garage đều được phép xuất hồ sơ (dual persona verification) | Token kế toán + token chủ garage (cả 2 từ sso-stub); phiếu QT BH `SET-20260618-00001` | 1. Dùng token kế toán → gọi `exportInsuranceDossier`; ghi nhận HTTP status.<br>2. Dùng token chủ garage → gọi `exportInsuranceDossier`; ghi nhận HTTP status. | - Cả 2 persona trả 2xx (thành công) hoặc fail vì reason khác không phải authz (vd dossier đã export → 409 là expected không phải 403).<br>- Không có 403 Forbidden cho kế toán hay chủ garage. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-020 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-6, AC-7 FEAT-INS-DOSSIER-CREATE; common API-SC01 | Security | Security | P1 | XSS payload trong field "Tên KH" của formData Biên bản nghiệm thu được escape/sanitize | Token kế toán hợp lệ; endpoint `POST /api/v1/insurance-dossier-documents/acceptance-record/render-pdf` | 1. Gọi render-pdf endpoint với `formData.partyA.name = "<script>alert(1)</script>"`.<br>2. Nếu nhận PDF bytes → kiểm tra content (text hoặc HTML source) xem chuỗi script có bị escape không.<br>3. Nếu nhận response JSON → kiểm tra field trả về có escaped không. | - Server không reject với 400 (vì field text hợp lệ về kiểu dữ liệu); chuỗi `<script>` được escape thành `&lt;script&gt;` hoặc bị strip trước khi render vào PDF template.<br>- PDF không chứa executable script injection.<br>- Không có response có chứa raw `<script>` unescaped. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-021 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-6, AC-7; common API-SC01 | Security | Security | P1 | XSS payload trong field "Địa điểm lập biên bản" của formData được escape/sanitize | Token kế toán hợp lệ | 1. Gọi render-pdf endpoint với `formData.location = "<img src=x onerror=alert(1)>"`.<br>2. Kiểm tra PDF/response output. | - Chuỗi XSS được escape hoặc strip trong PDF output.<br>- PDF không chứa tag `<img>` executable.<br>- Response không lộ raw HTML. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-022 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-6, AC-7; common API-SC02 | Security | Security | P1 | SQL injection vào field text formData bị xử lý an toàn (không query DB leak) | Token kế toán hợp lệ | 1. Gọi render-pdf endpoint với `formData.partyA.name` chứa SQLi payload (sanitized — không paste detail).<br>2. Ghi nhận response và kiểm tra không có lỗi DB hay dữ liệu ngoài contract. | - Server trả response bình thường (200 với PDF) hoặc 400 validation error.<br>- Không trả dữ liệu DB không mong đợi, không lộ DB schema, không lộ connection string.<br>- Response error (nếu có) không chứa SQL syntax hay table name. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-023 | FEAT-INS-DOSSIER-CREATE | gf-accounting | common API-SC05 | Security | Security | P2 | Path traversal vào tham số settlementCode bị từ chối | Token kế toán hợp lệ; endpoint `POST /api/v1/insurance-dossiers/search` | 1. Gọi `POST /api/v1/insurance-dossiers/search` với `settlementCode` chứa path traversal payload (sanitized — không paste detail).<br>2. Ghi nhận response. | - HTTP 400 Bad Request hoặc 404 Not Found (settlement not found).<br>- Không trả file system content.<br>- Response không chứa system path. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-024 | FEAT-INS-DOSSIER-CREATE | gf-accounting | common API-SC06 | Security | Security | P2 | Null byte trong field text formData được xử lý gracefully | Token kế toán hợp lệ | 1. Gọi render-pdf endpoint với `formData.partyA.name` chứa null byte (`\0`) trong chuỗi.<br>2. Ghi nhận response. | - Server trả 400 (validation error) hoặc 200 với null byte bị strip/escape — KHÔNG crash server hoặc lộ unhandled exception.<br>- Response không chứa stack trace. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-025 | FEAT-INS-DOSSIER-CREATE | gf-accounting | PKG §SSRF risk; common API-SC01 (adapted URL injection) | Security | Security | P2 | SSRF: field formData chứa URL AWS metadata không được PDF renderer fetch | Token kế toán hợp lệ; PDF renderer chạy | 1. Gọi render-pdf endpoint với `formData.location` chứa AWS metadata URL (sanitized — không paste detail).<br>2. Monitor outbound request log / network log của service trong thời gian render.<br>3. Ghi nhận response và kiểm tra outbound traffic. | - PDF renderer không thực hiện HTTP request ra ngoài đến IP metadata hay domain external.<br>- Giá trị URL-like được escape/treat như plain text trong PDF output.<br>- Không có timeout kéo dài bất thường (dấu hiệu SSRF đang chờ response từ external). | SKIPPED | N/A |
| TC-W02-SEC-AUTO-026 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-9 FEAT-INS-DOSSIER-CREATE; common API-SC03 | Security | Security | P2 | JSON injection vào field text formData được xử lý đúng (không parse lại) | Token kế toán hợp lệ | 1. Gọi render-pdf endpoint với `formData.partyA.name` chứa JSON injection string (sanitized).<br>2. Ghi nhận response. | - Server xử lý string đúng — không parse JSON nested hay interpret như object.<br>- PDF output chứa chuỗi literal (không escalation quyền).<br>- Response 200 với PDF hoặc 400 validation, không có 500. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-027 | FEAT-INS-DOSSIER-CREATE | gf-accounting | AC-13; common API-AA05 | Security | Security | P2 | Technician bị từ chối khi gọi render-pdf Giấy ủy quyền | Token technician forge | 1. Forge token technician (`custom:role=technician`).<br>2. Gọi `POST /api/v1/insurance-dossier-documents/payment-authorization/render-pdf` với body formData hợp lệ.<br>3. Ghi nhận response. | - HTTP 403 Forbidden.<br>- Không trả PDF bytes.<br>- Response không lộ template structure hay internal path. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-028 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph | AC-8; common API-AA04 (positive authz verify) | Security | Security | P2 | Kế toán được phép xem danh sách dossier đã xuất | Token kế toán hợp lệ; dossier v1 đã exported cho `SET-20260618-00001` | 1. Dùng token kế toán hợp lệ gọi `getInsuranceDossierVersions(settlementCode: "SET-20260618-00001", page: 0, size: 10)`.<br>2. Ghi nhận response. | - HTTP 200; response chứa ít nhất 1 bộ hồ sơ với `versionNo`, `exportedAt`, `documents` array.<br>- `pdfUrl` trong documents là object key opaque (không chứa AWS access key, secret key, hay session token). | SKIPPED | N/A |
| TC-W02-SEC-AUTO-029 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph | AC-8; common API-AA04 | Security | Security | P2 | Chủ garage được phép xem danh sách dossier đã xuất | Token chủ garage hợp lệ từ sso-stub | 1. Dùng token chủ garage gọi `getInsuranceDossierVersions(settlementCode: "SET-20260618-00001")`.<br>2. Ghi nhận response. | - HTTP 200; trả danh sách hồ sơ đúng như token kế toán.<br>- Không có 403 Forbidden cho role chủ garage.<br>- `pdfUrl` là object key opaque. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-030 | FEAT-INS-DOSSIER-CREATE | gf-accounting, agg-garage-graph | common API-ER03; API-RS07; TL-W01-SEC-001 | Security | Security | P1 | Response lỗi (500, 401, 403) không lộ stack trace hay internal path | Trigger bằng token tampered (TC-003) và payload malformed | 1. Gửi request với token sai signature để trigger auth error.<br>2. Gửi request với body JSON malformed để trigger 400.<br>3. Trigger error bất thường nếu possible (vd settlementCode không tồn tại → 404).<br>4. Kiểm tra body của từng response error. | - Không có response nào chứa Java stack trace (chuỗi `at com.`, `Exception in thread`, `Caused by:`).<br>- Không lộ internal service URL (`/protected/v1/...`) trong body.<br>- Không lộ DB table name hay column name.<br>- Error message là generic user-facing message.<br>- BFF KHÔNG expose `extensions.stacktrace` với internal path `/src/dist/...` trong production mode. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-031 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph, gf-accounting | API-RS07 | Security | Security | P1 | `pdfUrl` trong response danh sách dossier là object key opaque — không chứa cloud credentials | Token kế toán hợp lệ; dossier v1 exported | 1. Gọi `getInsuranceDossierVersions(settlementCode: "SET-20260618-00001")`.<br>2. Extract `pdfUrl` từ `documents` array.<br>3. Inspect giá trị `pdfUrl`. | - `pdfUrl` là string object key / relative path (vd `http://localhost:45888/files/...`), KHÔNG phải full S3 signed URL có `X-Amz-Credential` hay `X-Amz-Signature` parameters trong value.<br>- Không lộ AWS Access Key ID hay Secret trong response. | SKIPPED | N/A |
| TC-W02-SEC-AUTO-032 | FEAT-INS-DOSSIER-VIEW | ct-file-storage | BR-INS-DOSSIER-VIEW-005; PKG §S3 retention | Security | Security | P2 | Không thể xóa file PDF dossier đã export (storage immutability / retention policy) | Credentials đọc storage (không write) trên staging; file `phieu-quyet-toan.pdf` đã tồn tại trong `SETTLEMENTS/...` | 1. Lấy object key của file PDF đã export từ `insurance_dossier_documents.pdf_url`.<br>2. Thử DELETE object trong ct-file-storage bằng API storage (AWS CLI nếu S3-backed: `aws s3 rm s3://...`).<br>3. Sau thử xóa, thực hiện HEAD/GET object để kiểm tra còn tồn tại không. | - Attempt xóa bị từ chối (HTTP 403 hoặc `AccessDenied`) do Object Lock / retention policy / IAM policy thiếu `s3:DeleteObject`.<br>- File vẫn tồn tại sau attempt.<br>- Nếu staging không có Object Lock → log gap là FAIL với note "retention policy chưa được config — cần enable S3 Object Lock". | SKIPPED | N/A — Re-classified 2026-06-22 (was BLOCKED_BY_ENV). Reason: S3 Object Lock / retention policy chỉ có ở staging infra, KHÔNG thuộc W02 dev-local scope; deferred sang staging dry-run pre-RELEASE. Per W02 test-exec lessons + agent-test-security re-classification protocol. |
| TC-W02-SEC-AUTO-033 | FEAT-INS-DOSSIER-VIEW | ct-file-storage | PKG §S3 SSE-KMS | Security | Security | P3 | File PDF trong storage được encrypt at rest (SSE-KMS hoặc tương đương) | Credentials đọc metadata storage trên staging; file PDF đã tồn tại | 1. Lấy object key của file PDF từ `insurance_dossier_documents.pdf_url`.<br>2. Dùng AWS CLI: `aws s3api head-object --bucket <bucket> --key <object-key>` để lấy metadata.<br>3. Kiểm tra header `ServerSideEncryption` và `SSEKMSKeyId`. | - `ServerSideEncryption = aws:kms` (hoặc encryption equivalent của ct-file-storage).<br>- `SSEKMSKeyId` có giá trị (KMS key ARN thuộc account staging đúng).<br>- Nếu ct-file-storage không expose SSE metadata → ghi note "SSE-KMS verification requires storage-level access — verify via infra config review" và escalate. | SKIPPED | N/A — Re-classified 2026-06-22 (was BLOCKED_BY_ENV). Reason: SSE-KMS server-side encryption chỉ có ở staging infra, KHÔNG thuộc W02 dev-local scope; deferred sang staging dry-run pre-RELEASE. Per W02 test-exec lessons + agent-test-security re-classification protocol. |

---

## 5. Parity Audit — Auto vs Manual (TC-W02-SECURITY.md)

So sánh 12 TCs trong manual artifact `Execution/test-cases/TC-W02-SECURITY.md` với auto artifact này:

| Manual TC ID | Manual Title (rút gọn) | Auto coverage | Phân loại |
|---|---|---|---|
| TC-W02-SECURITY-001 | Upload MIME không trong whitelist | TC-W02-SEC-AUTO-010 | covered |
| TC-W02-SECURITY-002 | Upload file giả MIME (magic bytes) | TC-W02-SEC-AUTO-011 | covered |
| TC-W02-SECURITY-003 | Upload EICAR test signature | TC-W02-SEC-AUTO-014 | covered |
| TC-W02-SECURITY-004 | Signed URL expired → 403 | TC-W02-SEC-AUTO-008 | covered |
| TC-W02-SECURITY-005 | Forge signed URL (expiry param) | TC-W02-SEC-AUTO-009 | covered |
| TC-W02-SECURITY-006 | Tech support bị 403 | TC-W02-SEC-AUTO-004, 005, 027 | covered |
| TC-W02-SECURITY-007 | JWT tampered/expired bị reject | TC-W02-SEC-AUTO-002, 003 | covered |
| TC-W02-SECURITY-008 | Kế toán/chủ garage được phép, technician bị block | TC-W02-SEC-AUTO-019, 028, 029 | covered |
| TC-W02-SECURITY-009 | SSRF via formData | TC-W02-SEC-AUTO-025 | covered |
| TC-W02-SECURITY-010 | S3 retention — không thể xóa file | TC-W02-SEC-AUTO-032 | covered |
| TC-W02-SECURITY-011 | Không thể nhập tay "Tổng tiền BH" (computed) | TC-W02-SEC-AUTO-017 | covered |
| TC-W02-SECURITY-012 | File PDF encrypt SSE-KMS | TC-W02-SEC-AUTO-033 | covered |

**Kết quả parity audit**: Tất cả 12 manual TC đều có TC tương ứng trong auto artifact. Không có `auto-miss` cần log lesson learn.

**Auto artifact bổ sung thêm 21 TCs** không có trong manual (authn abuse per endpoint, persona gate, dual-persona positive, injection vectors theo field, data exposure checks, x-api-key s2s, optimistic lock, session abuse, no-token render-pdf, upload size/zero-byte, JSON injection, null byte) — đây là natural expansion theo common baseline + abuse-case matrix per `field-validation-taxonomy` approach.

---

## 6. Self-Audit — Common Baseline Checklist

Đối chiếu với Checklist Review cuối `common-testcase-api.md` và `common-testcase-e2e.md`:

### API Checklist

- [x] Đã có TC không có token (401) — TC-AUTO-001, 007, 015
- [x] Đã có TC token hết hạn (401) — TC-AUTO-002
- [x] Đã có TC không có quyền (403) — TC-AUTO-004, 005, 027
- [x] Đã có TC IDOR-like (payer gate / persona gate) — TC-AUTO-006
- [x] Đã cover ký tự đặc biệt / XSS / SQLi — TC-AUTO-020, 021, 022
- [x] Đã có TC path traversal — TC-AUTO-023
- [x] Đã có TC null byte — TC-AUTO-024
- [x] Không để lộ sensitive data trong response — TC-AUTO-030, 031
- [x] TC có expected HTTP status code rõ ràng — tất cả TC

### E2E / Session Checklist (security-relevant)

- [x] Đã có TC logout → protected resource denied — TC-AUTO-007
- [x] Đã có TC permission: user không có quyền cố truy cập — TC-AUTO-004, 005, 027
- [x] Upload/download security — TC-AUTO-010, 011, 012, 013, 014

### Security-specific (W02 bổ sung)

- [x] Signed URL expiry + forge — TC-AUTO-008, 009
- [x] SSRF risk — TC-AUTO-025
- [x] Storage immutability — TC-AUTO-032
- [x] Storage SSE-KMS — TC-AUTO-033
- [x] Service-to-service x-api-key bypass — TC-AUTO-016
- [x] Computed field injection — TC-AUTO-017
- [x] Optimistic lock bypass — TC-AUTO-018
- [x] Dual-persona positive authz — TC-AUTO-019, 028, 029

**Self-Audit Result**: PASS — không có case security áp dụng được mà chưa được account.

---

## 7. Automation Execution Notes

- **Runner**: Jest + axios cho REST (gf-accounting nội bộ) + axios/`graphql-request` cho BFF GraphQL (port 45401).
- **BFF GraphQL path**: `POST http://localhost:45401/garage/graphql` (KHÔNG phải `/graphql` — confirmed từ docker logs gf-sims. TL-W02-SEC-001 ghi lesson).
- **Auth token helper**: `curl http://localhost:45410/dev/token?identifier=accountant@demo.local` → parse `.accessToken` field (per TL-W01-PERF-003).
- **Technician token forge**: Python3 HS256 pattern (per TL-W01-ISO-001): `jwt.encode({"custom:role":"technician","custom:tenant_id":1,"sub":"tech-test","iat":now,"exp":now+3600}, "dev-sso-stub-secret", "HS256")`.
- **Expired token forge**: như trên nhưng `"exp": now - 3600`.
- **Tampered token**: split token bằng `.`; sửa 1 ký tự ở segment [2]; rejoin.
- **EICAR**: lưu tại `Execution/auto/harness/security/fixtures/eicar.txt` (không paste nội dung trong TC artifact — evidence hygiene).
- **Storage verify (TC-032, 033)**: yêu cầu AWS CLI configured với staging credentials (read-only); trong local simulator env (ct-file-storage-sim port 45888) → BLOCKED_BY_ENV; escalate để verify trên staging AWS.
- **SSRF (TC-025)**: monitor `docker logs <gf-accounting-container>` trong thời gian render để detect outbound TCP — không thể thực thi mà không có Bash access + render endpoint.
- **BLOCKED TCs (010-013, 015, 017-029, excl. 030-031)**: BLOCKED do tool execution constraint (Bash HTTP calls bị deny). Xem §Execution Blockers.

### Execution Blockers (W02 Run 1 + Run 2 — 2026-06-22)

| Blocker | TCs bị ảnh hưởng | Reason |
|---|---|---|
| Tool permission constraint — Bash curl/HTTP calls bị deny (Run 1 + Run 2) | TC-010 đến TC-029 (trừ TC-007, TC-016, TC-030, TC-031 đã chạy trong Run 1) | `Bash` tool được grant cho docker compose status check nhưng bị deny cho mọi HTTP/curl call. Persists qua session restart trong Run 2. |
| render-pdf endpoint cần form contract | TC-010, 015, 020-027 | Cần probe endpoint để biết exact JSON contract (field names) trước khi test |
| ct-file-storage-sim không phải S3 thật | TC-008, 009, 032, 033 | Simulator không có signed URL TTL, SSE-KMS metadata, Object Lock |
| AV scan không enable trong local harness | TC-014 | ct-file-storage-sim không có antivirus integration |

**Re-run condition**: Để unblock 18 BLOCKED TCs, cần session với Bash HTTP calls được grant (không bị deny sau 1st call). Recommended approach: Jest + axios spec file trong `Execution/auto/harness/security/` để batch all HTTP calls trong 1 Bash invocation (`npx jest --runInBand security/`).

---

## 8. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-22 | 1 | Khởi tạo — 33 TCs: authn abuse (no/expired/forged token), authz (technician/persona gate), upload abuse (MIME/magic bytes/EICAR/oversize/zero-byte), signed URL TTL+forge, SSRF via formData, injection per-field (XSS/SQLi/path-traversal/null-byte/JSON), data exposure (no stack trace/opaque pdfUrl), storage (immutability/SSE-KMS), x-api-key s2s, computed field injection, optimistic lock, session abuse, dual-persona positive. Common baseline coverage map + parity audit vs manual artifact (12/12 covered, 0 auto-miss). Self-audit PASS. | agent-test-security |
| 2026-06-22 | 2 | TEST_EXECUTION Run 1: Cập nhật Status sau execution — 7 FAIL (TC-001/002/003 BUG-W02-029; TC-004/005 BUG-W02-030; TC-006 BUG-W02-031; TC-016 BUG-W02-030), 3 PASS (TC-007, TC-030, TC-031), 18 BLOCKED (tool execution constraint — Bash HTTP deny), 2 SKIPPED (TC-008, TC-009 — N/A: simulator env không có signed URL; ADR-016 v11 confirms no signed URL TTL), 3 BLOCKED_BY_ENV (TC-014 AV not active, TC-032 storage S3 Object Lock needs staging AWS, TC-033 SSE-KMS needs staging AWS). Note: BFF GraphQL path = `/garage/graphql` (KHÔNG phải `/graphql`) — TL-W02-SEC-001. Note: BFF exposes stacktrace in extensions object in dev mode (per TC-001 evidence) — separate from Java stack trace in backend (TC-030 PASS). Correction from status summary draft: FAIL=7 (not 8), BLOCKED=18 (not 17). | agent-test-security |
| 2026-06-22 | 3 | TEST_EXECUTION Run 2 (resume session): Confirmed 18 BLOCKED TCs still BLOCKED — Bash HTTP calls denied (curl/HTTP GET/POST) in new session too. docker compose ps shows all containers healthy (agg-garage-graph, gf-accounting, gf-sales, gf-postgres, gf-redis, gf-kafka, gf-sims — all healthy). No new bugs found. No status change to any TC. Bug verification loop: BUG-W02-029/030/031 still OPEN (no FIX_DONE commit) — verify deferred. Lessons TL-W02-SEC-001..005 added to TEST-LESSONS-LEARNED.md. TR-W02-SECURITY.md updated with Run 2 results. Re-run unblock condition: Bash HTTP grants needed (session with curl allowed) OR Jest harness spec in Execution/auto/harness/security/ run as single Bash invocation. | agent-test-security |
| 2026-06-26 | 4 | Run10 out-of-scope SKIPPED — Security out-of-wave per user override 2026-06-26. All 33 TCs marked SKIPPED. Status Summary updated: 33 SKIPPED (was: 7 FAIL, 3 PASS, 18 BLOCKED, 2 SKIPPED, 3 BLOCKED_BY_ENV). Prior Run2 BLOCKED findings superseded by scope decision. TR-W02-SECURITY.md written with SKIPPED verdict. | agent-test-security |
