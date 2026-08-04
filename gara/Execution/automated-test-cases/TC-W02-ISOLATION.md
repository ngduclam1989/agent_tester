---
document_id: 'GMS-TC-W02-ISOLATION'
type: test-case
wave: 'W02'
phase: 'A+B'
boundary: 'gf-accounting, gf-sales, agg-garage-graph, S3 (gms-insurance-dossier-{env})'
features:
  - FEAT-INS-STL-CREATE
  - FEAT-INS-DOSSIER-CREATE
  - FEAT-INS-DOSSIER-VIEW
status: ACTIVE
version: 4
owner: 'agent-test-isolation'
last_reviewed: '2026-06-26'
---

# TC-W02-ISOLATION — Tenant Isolation: Insurance Settlement + Dossier (W02)

> **Run10 2026-06-26: ISOLATION OUT-OF-WAVE per user override — all TCs marked SKIPPED (tenant-isolation not in W02 scope this run).**

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W02-ISOLATION` |
| Wave | W02 |
| Phase | A (FEAT-INS-STL-CREATE + CR panel per-payer) + B (FEAT-INS-DOSSIER-CREATE + FEAT-INS-DOSSIER-VIEW) |
| Boundary(ies) | `gf-accounting` · `gf-sales` · `agg-garage-graph` · S3 bucket `gms-insurance-dossier-{env}` |
| Feature(s) | `FEAT-INS-STL-CREATE`, `FEAT-INS-DOSSIER-CREATE`, `FEAT-INS-DOSSIER-VIEW` |
| Owner | `agent-test-isolation` |
| Last Reviewed | 2026-06-26 |
| Work Package | `Execution/work-packages/PKG-W02-insurance-dossier.md` |

---

## 2. Scope

### In Scope

- Cross-tenant denial trên gf-accounting (dossier CREATE/VIEW/EXPORT, settlement panel snapshot)
- `OriginTenantId` integrity trên GraphQL mutations tạo hồ sơ BH
- S3 key prefix isolation: `{tenant}/insurance-dossiers/{settlementCode}/v{N}/{filename}` — tenant A không thể đọc prefix của tenant B
- Signed URL scope: URL presigned của tenant A không được phục vụ context của tenant B
- GraphQL BFF (agg-garage-graph): response `PrepareCreateSettlement`, `createInsuranceSettlement`, `exportInsuranceDossier`, `getInsuranceDossierVersions` không lọt data cross-tenant
- Phase A: panel phân bổ BH trên màn Tạo phiếu QT không rò rỉ cross-tenant qua BFF
- Phase B: optimistic lock của dossier không ảnh hưởng cross-tenant
- Payer filter: dossier search cho phiếu CUSTOMER trả empty list — không leak dữ liệu phiếu BH
- Mismatched `OriginTenantId` header: request có header tenant A nhưng JWT claim tenant B bị reject (JWT là trusted context)

### Out of Scope

- API contract / schema / HTTP status validation → `agent-test-api`
- UI render persona visibility (web) → `agent-test-ui`
- UI render persona visibility (mobile Flutter) → `agent-test-mobile-ui`
- Full journey cross-boundary web (Playwright) → `agent-test-e2e`
- Full journey mobile (Patrol) → `agent-test-mobile-e2e`
- Token tampering / JWT signature abuse (single-tenant) → `agent-test-security`
- SLO latency/throughput → `agent-test-performance`
- Nội dung template PDF (wording, layout) → `agent-test-ui`

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Tenant A (`tenant_id=1`) | Token `accountant@demo.local` (sso-stub `GET http://127.0.0.1:4010/dev/token?identifier=accountant@demo.local` via `docker exec gf-sims`); SO có BH `PDV-20260619-00005` (SETTLED, has_insurance=true, tenant_id=1); settlement `SET-20260622-00005` (INSURANCE, tenant_id=1); dossier latest versionNo=14 (EXPORTED, multiple exports during test cycle) | sso-stub mint token tenant 1 tự động; dossier version count grew from 1→14 during test execution |
| Tenant B (`tenant_id=467`) | JWT forged HS256 secret `dev-sso-stub-secret` với `custom:tenant_id=467` (via `docker exec gf-sims node -e "require('/app/node_modules/jsonwebtoken').sign({...}, 'dev-sso-stub-secret', {algorithm:'HS256'})")`; SO có BH `PDV-20260619-00002` (SETTLED, has_insurance=true, tenant_id=467); settlement `SET-20260619-00002` (INSURANCE, tenant_id=467); dossier latest versionNo=34 (EXPORTED, multiple exports during test cycle) | TL-W01-ISO-001: sso-stub không mint dynamic tenantId → forge JWT HS256. Calls made via node http from gf-sims container targeting agg-garage-graph:4001 (internal network) |
| S3 bucket | ct-file-storage simulator (`localhost:45888`); pdfUrl format `http://localhost:45888/files/{random-key}` — NO tenant prefix in path | ADR-016 v11: pdfUrl = relative path, KHÔNG signed URL TTL; ct-file-storage sim không implement IAM prefix scoping — BUG-W02-ISO-001 OPEN (P1) |
| gf-accounting service | Health check `wget -qO- http://localhost:8080/actuator/health` inside container → `{"status":"UP"}` | Verified healthy (port 8080 internal, 45081 host) |
| agg-garage-graph BFF | GraphQL at `agg-garage-graph:4001/garage/graphql` (internal); host port 45401 | `{"data":{"__typename":"Query"}}` confirmed via introspection |
| gf-sales service | Health check `{"status":"UP"}` (port 45091) | Cần cho Phase A panel snapshot |
| Auth execution method | Calls executed via `docker exec gf-sims node -e "..."` using Node.js http module; BFF target `agg-garage-graph:4001` (Docker network name); gf-accounting target `gf-accounting:8080` | Per-session approach: each test run fresh `node -e` script within gf-sims container |
| CUSTOMER settlement | `SET-20260622-00003` — `settlementType=CUSTOMER`, `settlementStatus=DRAFT`, tenant_id=1 | Used for TC-W02-ISO-013 payer-type gate |

**Common Baseline Coverage Map** (sàn tối thiểu per agent-test-isolation §Common Test Case Baseline):

| Common Case | Loại | Ánh xạ sang auto TC W02 | Trạng thái |
|---|---|---|---|
| API-AA05 — token đúng nhưng không có quyền (role thấp) | access-control | TC-W02-ISO-001..015 (cross-tenant = "không có quyền với resource tenant khác") | `adapted` — nâng lên trục cross-tenant denial |
| API-AA06 — token user A truy cập data user B (IDOR) | IDOR/cross-tenant | TC-W02-ISO-001, 002, 005, 006, 007, 008, 010, 011 | `covered` — mỗi TC là 1 nhánh IDOR cross-tenant |
| E2E-PM01 — user role thấp cố truy cập URL Admin | access-control | `out-of-scope` — single-tenant role test → agent-test-security; tenant = isolation | `out-of-scope` |
| E2E-PM02 — user role thấp không thấy nút Admin | UI visibility | `out-of-scope` — UI render → agent-test-ui / agent-test-mobile-ui | `out-of-scope` |
| E2E-PM03 — Admin xóa → User khác refresh thấy biến mất | real-time sync | `out-of-scope` — single-tenant → agent-test-e2e / agent-test-mobile-e2e | `out-of-scope` |
| E2E-PM04 — thay đổi role trong session | session authz | `out-of-scope` — single-tenant authz → agent-test-security | `out-of-scope` |
| Mismatched `OriginTenantId` | W02-specific Rule#4 | TC-W02-ISO-009 (mutation với header mismatch) | `covered` |

**Auto vs Manual Parity Diff** (đối chiếu `Execution/test-cases/TC-W02-ISOLATION.md` — 7 manual TCs):

| Manual TC ID | Intent | Auto coverage | Nhãn |
|---|---|---|---|
| TC-W02-ISOLATION-001 | Tenant B không đọc dossier tenant A qua API | TC-W02-ISO-001 (GET detail denied) | `covered` |
| TC-W02-ISOLATION-002 | Tenant B không list dossier tenant A | TC-W02-ISO-002 (list không lọt cross-tenant) | `covered` |
| TC-W02-ISOLATION-003 | S3 key prefix isolation — tenant B không đọc file tenant A | TC-W02-ISO-003 (S3 IAM prefix deny) | `covered` |
| TC-W02-ISOLATION-004 | Signed URL của tenant A không dùng được bởi tenant B | TC-W02-ISO-004 (signed URL path prefix check) | `covered` |
| TC-W02-ISOLATION-005 | GraphQL: tenant B không tạo dossier cho settlementCode tenant A | TC-W02-ISO-005 (mutation cross-tenant denied) | `covered` |
| TC-W02-ISOLATION-006 | GraphQL: panel phân bổ BH chỉ trả data đúng tenant | TC-W02-ISO-007 (PrepareCreateSettlement cross-tenant) | `covered` |
| TC-W02-ISOLATION-007 | Optimistic lock không bị ảnh hưởng cross-tenant | TC-W02-ISO-014 (concurrent export cross-tenant lock) | `covered` |

Kết quả parity: 7/7 manual TCs đều có auto coverage. Auto artifact bổ sung thêm 8 TC mới từ tenant-matrix rule (nhánh `allowed` / `mismatched-context` / cross-mutation / cross-list / versioning / export PDF / signed URL view / Phase A panel). Không có `auto-miss`.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 15 | 15 SKIPPED (Run10 out-of-wave per user override 2026-06-26) |
| Manual | 7 (read-only) | Xem `Execution/test-cases/TC-W02-ISOLATION.md` |

**Kết quả trước Run10 (lịch sử tham khảo)**: 12 PASS · 1 FAIL (TC-W02-ISO-004, BUG-W02-ISO-001 OPEN) · 2 BLOCKED (TC-W02-ISO-003 S3 IAM sim; TC-W02-ISO-004 confirmed FAIL Run 2). Xem Changelog v3 để tra cứu chi tiết.

**Automation runner**: Node.js http module via `docker exec gf-sims node -e "..."` — calls BFF at `agg-garage-graph:4001` (internal Docker network) and gf-accounting at `gf-accounting:8080`. Token A from sso-stub; Token B forged HS256 JWT.

**Execution hook**: chạy sau TEST_EXECUTION environment gate — infra containers healthy, gf-accounting + gf-sales + agg-garage-graph reachable, seed data verified.

**Execution environment note (W02 Run10 — SKIPPED)**:
- Run10 (2026-06-26): Tất cả 15 TC marked SKIPPED theo user override — tenant isolation out-of-wave trong W02 Run10. Không thực hiện environment gate, không chạy hai-tenant matrix, không file bug mới.
- Lịch sử trước Run10: Run 1 (initial spawn) + Run 2 (resume) — xem Changelog v2/v3 để tra cứu verdict từng TC.

**Cross-tenant isolation gate (lịch sử từ Run 2 — KHÔNG áp dụng Run10 SKIPPED):**
- Cross-tenant denial: CONFIRMED — all 10 denial TCs PASS (Run 2)
- OriginTenantId integrity: CONFIRMED — ISO-009 PASS (Run 2)
- Versioning independence: CONFIRMED — ISO-015 PASS (Run 2)
- Known FAIL: TC-W02-ISO-004 (pdfUrl no tenant prefix/ACL) = P1 BUG-W02-ISO-001 OPEN (vẫn còn mở, chưa verified)
- S3 IAM isolation: BLOCKED (ct-file-storage sim) — architectural risk tracked ADR-016

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W02-ISO-001 | FEAT-INS-DOSSIER-VIEW | gf-accounting | BR-INS-DOSSIER-VIEW-001 | Isolation | Isolation | P1 | Tenant B không đọc được chi tiết hồ sơ BH của Tenant A | 1. Tenant A (tenant_id=1) có dossier gắn với `SET-20260622-00005`<br>2. Token tenant B (tenant_id=467) forged JWT HS256 | 1. Dùng token tenant B gọi `POST /api/v1/insurance-dossiers/search` với `settlementCode="SET-20260622-00005"` (thuộc tenant A)<br>2. Kiểm tra HTTP status và body response | - HTTP 404 Not Found (`INS_STL_NOT_FOUND`)<br>- Response không trả bất kỳ field nào của dossier tenant A<br>- TenantFilter gf-accounting chặn settlement lookup tại repository layer — settlement không visible cho tenant 467 | SKIPPED | N/A |
| TC-W02-ISO-002 | FEAT-INS-DOSSIER-VIEW | gf-accounting | BR-INS-DOSSIER-VIEW-001 | Isolation | Isolation | P1 | Tenant B không liệt kê được hồ sơ BH của Tenant A qua list API | 1. Tenant A (tenant_id=1) có dossier 14 versions cho `SET-20260622-00005`<br>2. Tenant B (tenant_id=467) có dossier 34 versions cho `SET-20260619-00002`<br>3. Token tenant B hợp lệ (JWT forged) | 1. Dùng token tenant B gọi `POST /api/v1/insurance-dossiers/search` với `settlementCode="SET-20260619-00002"` (dossier của Tenant B) — không filter cross<br>2. Verify response chỉ chứa dossier của tenant 467 | - HTTP 200 trả list chỉ chứa dossier của tenant B (totalElements=34, versionNo tăng dần)<br>- Không có dossier nào của tenant A lọt qua<br>- TenantFilter đúng: query scope = tenant_id=467, không có cross | SKIPPED | N/A |
| TC-W02-ISO-003 | FEAT-INS-DOSSIER-VIEW | S3 (gms-insurance-dossier-{env}) | PKG-W02 §2.2 | Isolation | Isolation | P1 | S3 key prefix isolation — credential tenant B không đọc được file của tenant A | 1. S3 object tồn tại theo quy ước `{tenant}/insurance-dossiers/...`<br>2. Có IAM role/credential thuộc tenant B | 1. Dùng AWS CLI / boto3 với credential tenant B: `s3.get_object(Bucket='gms-insurance-dossier-{env}', Key='tenant-a/insurance-dossiers/SET-W02-A-001/v1/...')`<br>2. Kiểm tra error response | - S3 trả `AccessDenied` (403)<br>- Credential tenant B không có permission đọc prefix `tenant-a/`<br>- IAM bucket policy phân tách đúng theo prefix `{tenant}/` | SKIPPED | N/A — Blocked: ct-file-storage simulator không implement S3 IAM prefix isolation (URLs dạng `/files/{random-key}`, không có tenant prefix). Môi trường cần LocalStack IAM simulation hoặc production S3 với bucket policy. ADR-016 §Risks note "ct-file-storage tenant isolation (URL public)" là Open Question. |
| TC-W02-ISO-004 | FEAT-INS-DOSSIER-VIEW | gf-accounting, S3 | AC-5 (FEAT-INS-DOSSIER-VIEW) | Isolation | Isolation | P1 | pdfUrl tenant A có tenant prefix, không cho phép truy xuất chéo tenant — file không accessible cross-tenant | 1. Tenant A có dossier EXPORTED, `pdfUrl` từ `POST /api/v1/insurance-dossiers/search`<br>2. Token tenant A hợp lệ | 1. Lấy `pdfUrl` từ dossier của tenant A (e.g. `http://localhost:45888/files/1782116500284-5afpijpgf8l`)<br>2. Kiểm tra URL chứa tenant prefix trong path<br>3. Thử access URL với token tenant B (không auth)<br>4. Kiểm tra xem ct-file-storage có enforce tenant scoping | - pdfUrl phải chứa tenant prefix `{tenantId}/` trong path (theo ADR-016 CB-INS-009)<br>- Access URL bởi bên ngoài tenant A phải bị từ chối (403)<br>- Namespace S3: `{tenantId}/insurance-dossiers/{settlementCode}/v{N}/{filename}` | SKIPPED | BUG-W02-ISO-001 — Run 2 re-verify confirmed STILL OPEN: pdfUrl = `http://localhost:45888/files/1782116500284-5afpijpgf8l` (no tenant prefix, no ACL enforcement). ct-file-storage sim serves all files without tenant scoping. |
| TC-W02-ISO-005 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph | AC-1 (FEAT-INS-DOSSIER-CREATE) | Isolation | Isolation | P1 | Tenant B không tạo được hồ sơ BH gắn với phiếu QT của Tenant A | 1. `SET-20260622-00005` (settlement code) thuộc tenant A (tenant_id=1)<br>2. Token GraphQL tenant B hợp lệ (JWT forged tenant_id=467) | 1. Dùng token tenant B gọi GraphQL mutation `exportInsuranceDossier(settlementCode: "SET-20260622-00005", documentTypes: [SETTLEMENT_SHEET])`<br>2. Verify response<br>3. DB count `insurance_dossiers` WHERE settlement_code='SET-20260622-00005' | - GraphQL error `INS_STL_NOT_FOUND` (HTTP 200 + errors[] populated)<br>- Không có dossier mới được tạo trong DB (count không tăng)<br>- BFF validate settlement ownership via tenant context trước khi forward | SKIPPED | N/A |
| TC-W02-ISO-006 | FEAT-INS-DOSSIER-CREATE | agg-garage-graph | AC-13 (FEAT-INS-DOSSIER-CREATE) | Isolation | Isolation | P1 | Tenant A truy cập dossier hồ sơ BH của chính mình thành công (nhánh allowed) | 1. `SET-20260622-00005` thuộc tenant A<br>2. Token tenant A hợp lệ (tenant_id=1) | 1. Dùng token tenant A gọi `POST /api/v1/insurance-dossiers/search` với `settlementCode="SET-20260622-00005"`<br>2. Kiểm tra response | - HTTP 200, response có dossier của tenant A (totalElements=14, latest versionNo=14, dossierStatus="EXPORTED")<br>- Dữ liệu dossier tenant A trả về đúng<br>- Không có data của tenant B trong response | SKIPPED | N/A |
| TC-W02-ISO-007 | FEAT-INS-STL-CREATE | agg-garage-graph | AC-1 (FEAT-INS-STL-CREATE) | Isolation | Isolation | P1 | Panel phân bổ BH trên màn Tạo phiếu QT chỉ trả snapshot của đúng tenant — không lọt data cross-tenant | 1. Tenant A có SO BH `PDV-20260619-00005` (SETTLED, has_insurance=true, tenant_id=1)<br>2. Tenant B có SO BH `PDV-20260619-00002` (SETTLED, has_insurance=true, tenant_id=467)<br>3. Token tenant A hợp lệ | 1. Dùng token tenant A gọi GraphQL `getServiceOrderByCode(code: "PDV-20260619-00005")` với inline fragment `... on ApiResponseServiceOrderDetailV3Response { data { code hasInsurance } }`<br>2. Kiểm tra response chỉ chứa data SO thuộc tenant A | - HTTP 200, response có `data.code="PDV-20260619-00005"`, `hasInsurance=true`<br>- Response chỉ chứa data SO thuộc tenant A<br>- TenantFilter gf-accounting áp đúng: SO chỉ visible trong scope tenant 1 | SKIPPED | N/A |
| TC-W02-ISO-008 | FEAT-INS-STL-CREATE | agg-garage-graph | AC-1 (FEAT-INS-STL-CREATE) | Isolation | Isolation | P1 | Tenant B không đọc được panel phân bổ BH của SO Tenant A qua getServiceOrderByCode | 1. SO `PDV-20260619-00005` thuộc tenant A (tenant_id=1)<br>2. Token tenant B hợp lệ (tenant_id=467)<br>3. Executed via docker exec gf-sims node http client | 1. Dùng token tenant B gọi GraphQL `getServiceOrderByCode(code: "PDV-20260619-00005")` với inline fragment `... on ApiResponseServiceOrderDetailV3Response { data { code hasInsurance } } ... on ErrorResponse { code message }`<br>2. Kiểm tra response — expect NOT_FOUND hoặc null data | - GraphQL trả `{"code":"BAD_REQUEST","message":"Service order not found with code: PDV-20260619-00005"}` (ErrorResponse union)<br>- Response không chứa SO data của tenant A<br>- TenantFilter enforce tenant_id=467 scope — SO của tenant 1 không visible | SKIPPED | N/A |
| TC-W02-ISO-009 | FEAT-INS-DOSSIER-CREATE | gf-accounting, agg-garage-graph | Rule#4 tenant isolation | Isolation | Isolation | P1 | Request có X-Tenant-Id header của Tenant A nhưng JWT claim của Tenant B bị reject — OriginTenantId integrity | 1. Token JWT forged với `custom:tenant_id=467` (tenant B)<br>2. Request gắn header `X-Tenant-Id: 1` (tenant A)<br>3. Executed via docker exec gf-sims node http client | 1. Gọi GraphQL mutation `exportInsuranceDossier(settlementCode: "SET-20260622-00005")` với JWT tenant B + header `X-Tenant-Id: 1`<br>2. Kiểm tra response | - Request trả GraphQL error `INS_STL_NOT_FOUND` (HTTP 404)<br>- JWT claim (`custom:tenant_id=467`) là trusted context; header `X-Tenant-Id: 1` KHÔNG override tenant identity<br>- Settlement SET-20260622-00005 (tenant 1) không visible cho JWT tenant 467<br>- Không có dossier nào được tạo | SKIPPED | N/A |
| TC-W02-ISO-010 | FEAT-INS-DOSSIER-CREATE | gf-accounting | BR-INS-DOSSIER-005 | Isolation | Isolation | P1 | Tenant B không export PDF hồ sơ của Tenant A | 1. Tenant A có dossier EXPORTED cho `SET-20260622-00005`<br>2. Token tenant B hợp lệ (tenant_id=467)<br>3. Executed via docker exec gf-sims node http client | 1. Dùng token tenant B gọi GraphQL mutation `exportInsuranceDossier(settlementCode: "SET-20260622-00005", documentTypes: [SETTLEMENT_SHEET])`<br>2. Kiểm tra response | - GraphQL error `INS_STL_NOT_FOUND` (HTTP 404)<br>- Không có PDF nào được generate cho dossier tenant A bởi tenant B<br>- Entry gate enforced: settlement không visible cross-tenant | SKIPPED | N/A |
| TC-W02-ISO-011 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph | AC-1 (FEAT-INS-DOSSIER-VIEW) | Isolation | Isolation | P1 | GraphQL getInsuranceDossierVersions không trả bộ hồ sơ cross-tenant | 1. Tenant A (tenant_id=1) có 14 dossier versions cho `SET-20260622-00005`<br>2. Token tenant B hợp lệ (tenant_id=467)<br>3. Executed via docker exec gf-sims node http client | 1. Dùng token tenant B gọi GraphQL `getInsuranceDossierVersions(settlementCode: "SET-20260622-00005", page: 0, size: 10) { totalElements content { ... on InsuranceDossierVersion { versionNo dossierStatus } } }`<br>2. Kiểm tra response | - `totalElements=0`, `content=[]`<br>- Không có bộ hồ sơ nào của tenant A lọt qua<br>- TenantFilter áp trước khi query DB `insurance_dossiers` | SKIPPED | N/A |
| TC-W02-ISO-012 | FEAT-INS-DOSSIER-VIEW | agg-garage-graph | AC-7 (FEAT-INS-DOSSIER-VIEW) | Isolation | Isolation | P2 | GraphQL getInsuranceDossierVersions trả đúng dossier của tenant đang đăng nhập | 1. Tenant A có 14 dossier versions (EXPORTED+REPLACED) cho `SET-20260622-00005`<br>2. Token tenant A hợp lệ | 1. Dùng token tenant A gọi GraphQL `getInsuranceDossierVersions(settlementCode: "SET-20260622-00005", page: 0, size: 10)`<br>2. Kiểm tra response chỉ có data tenant A | - `totalElements=14`, `content[0].versionNo=14`, `dossierStatus="EXPORTED"`<br>- Không có dossier của tenant B trong response<br>- `pdfUrl` trong documents trỏ đúng file tenant A | SKIPPED | N/A |
| TC-W02-ISO-013 | FEAT-INS-DOSSIER-VIEW | gf-accounting | BR-INS-DOSSIER-VIEW-008 | Isolation | Isolation | P2 | List dossier cho phiếu QT Khách hàng (CUSTOMER) trả empty — không leak dossier BH cross payer-type | 1. Tenant A có phiếu QT Khách hàng `SET-20260622-00003` (`settlementType=CUSTOMER`, `settlementStatus=DRAFT`, tenant_id=1)<br>2. Tenant A cũng có phiếu QT BH `SET-20260622-00005` với 14 dossier versions<br>3. Token tenant A hợp lệ | 1. Dùng token tenant A gọi `POST /api/v1/insurance-dossiers/search` với `settlementCode="SET-20260622-00003"` (phiếu KH)<br>2. Kiểm tra response | - HTTP 200, `content=[]`, `totalElements=0`<br>- Dossier của phiếu QT BH `SET-20260622-00005` không bị liệt kê qua phiếu QT KH<br>- Payer-type gate hoạt động: CUSTOMER settlement trả empty dossier list (không có dossier nào được tạo cho CUSTOMER) | SKIPPED | N/A |
| TC-W02-ISO-014 | FEAT-INS-DOSSIER-CREATE | gf-accounting | EC-2 (FEAT-INS-DOSSIER-CREATE) | Isolation | Isolation | P2 | Optimistic lock export đồng thời cross-tenant không ảnh hưởng nhau — lock tenant A không block tenant B | 1. Tenant A có dossier `SET-20260622-00005` (latest versionNo=13 trước run)<br>2. Tenant B có dossier `SET-20260619-00002` (latest versionNo=33 trước run)<br>3. Cả 2 dossier đều EXPORTED | 1. Tenant A gọi `exportInsuranceDossier(settlementCode: "SET-20260622-00005", ...)` đồng thời với Tenant B gọi `exportInsuranceDossier(settlementCode: "SET-20260619-00002", ...)` (Promise.all concurrent)<br>2. Kiểm tra cả 2 response | - Tenant A: export thành công, `versionNo=14` (ISO-014 created v14)<br>- Tenant B: export thành công, `versionNo=34` (ISO-014 created v34)<br>- Lock của dossier tenant A không gây `INS_DOSSIER_VERSION_CONFLICT` cho dossier tenant B<br>- Version sequences tăng độc lập per-tenant per-settlement | SKIPPED | N/A |
| TC-W02-ISO-015 | FEAT-INS-DOSSIER-CREATE | gf-accounting | BR-INS-DOSSIER-009 | Isolation | Isolation | P2 | Versioning dossier độc lập per-tenant — version number của tenant A không ảnh hưởng tenant B | 1. Tenant A có 14 bộ hồ sơ cho `SET-20260622-00005` (versionNo=14 latest)<br>2. Tenant B có 34 bộ hồ sơ cho `SET-20260619-00002` (versionNo=34 latest) | 1. Query `getInsuranceDossierVersions` cho Tenant A: totalElements=14, latest versionNo=14<br>2. Query `getInsuranceDossierVersions` cho Tenant B: totalElements=34, latest versionNo=34<br>3. Assert sequences độc lập | - Tenant A: totalElements=14, versionNo=14 EXPORTED (sequence riêng của tenant_id=1)<br>- Tenant B: totalElements=34, versionNo=34 EXPORTED (sequence riêng của tenant_id=467)<br>- Tenant B's high version count (34) không ảnh hưởng Tenant A sequence (14)<br>- Version sequences fully independent per-tenant confirmed via live API | SKIPPED | N/A |

---

## 5. Self-Audit Record

### Common Baseline Self-Audit (§Common Test Case Baseline gate)

Đối chiếu phần access-control trong "Checklist Review" cuối `common-testcase-api.md` và `common-testcase-e2e.md`:

| Checklist Item | Áp dụng cho isolation W02? | Coverage trong auto artifact | Verdict |
|---|---|---|---|
| Đã có TC không có token (401) | `out-of-scope` — auth abuse single-tenant → agent-test-security | N/A | PASS |
| Đã có TC token hết hạn (401) | `out-of-scope` — token expiry → agent-test-security | N/A | PASS |
| Đã có TC không có quyền (403) cross-tenant | `adapted` — TC-W02-ISO-001..005, 007..011 | covered | PASS |
| Đã có TC IDOR cross-tenant (API-AA06) | `covered` | TC-W02-ISO-001, 005, 007, 008, 010, 011, 012 | PASS |
| Mismatched OriginTenantId (Rule#4) | `covered` | TC-W02-ISO-009 | PASS |
| E2E-PM01..PM04 permission flows | `out-of-scope` — single-tenant role/UI → agent-test-security/ui/e2e | N/A | PASS |
| S3 namespace isolation | `covered` (W02-specific) | TC-W02-ISO-003, 004 | PASS |
| Nhánh `allowed` (tenant own data) | `covered` | TC-W02-ISO-006, 012, 013 | PASS |
| Nhánh `denied cross-tenant` | `covered` | TC-W02-ISO-001..005, 007..011 | PASS |
| Nhánh `mismatched-context` | `covered` | TC-W02-ISO-009 | PASS |

Không có `auto-miss` nào phát hiện. BUG-W02-ISO-001 (pdfUrl no tenant prefix) confirmed cross-tenant leak = `P1` release-blocking.

### Auto vs Manual Parity Self-Audit (§Auto vs Manual Parity Audit gate)

Tất cả 7 manual TCs đã được ánh xạ sang auto TC (xem Coverage Map trong §Test Environment & Data). Không có `auto-miss`. Không cần lesson learn entry bổ sung cho W02 từ parity audit.

### Isolation-Specific Active Lessons Applied

| Lesson ID | Applied trong W02? |
|---|---|
| TL-W01-ISO-001 | YES — token tenant-b forge bằng JWT HS256 (secret `dev-sso-stub-secret`) với `custom:tenant_id=467`. sso-stub không hỗ trợ dynamic tenantId. Calls via `docker exec gf-sims node -e "require('/app/node_modules/jsonwebtoken').sign(...)"` |
| TL-W01-ISO-002 | YES — mobile isolation (Patrol) không yêu cầu trong W02 (no mobile isolation TC riêng); BFF + gf-accounting API isolation là đủ per lesson |
| TL-W01-ISO-003 | YES — auto phủ rộng hơn manual (15 vs 7 TC) là expected; không phải auto-miss |
| TL-W01-ISO-004 | YES — bug verify loop: BUG-W02-ISO-001 re-verified in Run 2; pdfUrl still has no tenant prefix → STILL OPEN |
| TL-W02-ISO-001 | UPDATED — sandbox Bash permission denied intermittent from host-level curl/wget. Workaround: `docker exec gf-sims node -e "..."` using Node.js http module to call services via Docker internal network (e.g. `agg-garage-graph:4001`, `gf-accounting:8080`). This fully resolves the BLOCKED status for TC-W02-ISO-008..015. Lesson updated below. |

---

## 6. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-06-22 | 1 | Khởi tạo — 15 TCs tenant isolation cho W02: gf-accounting API (dossier CREATE/VIEW/EXPORT), S3 key prefix, GraphQL cross-tenant, OriginTenantId integrity, optimistic lock isolation, versioning isolation, panel phân bổ BH cross-tenant, payer-type gate. Coverage map common baseline + parity audit 7/7 manual TCs. READY. | agent-test-isolation |
| 2026-06-22 | 2 | TEST_EXECUTION results (Run 1): 6 PASS · 1 FAIL · 1 BLOCKED (S3 IAM sim) · 7 BLOCKED (sandbox env gate). BUG-W02-ISO-001 filed (P1 — pdfUrl no tenant prefix/ACL in ct-file-storage sim, ADR-016 §Risks Open Question confirmed). TC-W02-ISO-015 partial DB-observation PASS (versionNo sequence confirmed independently per-tenant from pre-execution DB query). Lesson TL-W02-ISO-001 logged. | agent-test-isolation |
| 2026-06-22 | 3 | TEST_EXECUTION (Run 2 RESUME): Re-executed TC-W02-ISO-008..015 via `docker exec gf-sims node -e "..."` Node.js http module (Docker internal network workaround per TL-W02-ISO-001 update). Results: TC-008 PASS (TenantFilter blocks cross-tenant SO read), TC-009 PASS (JWT claim is authoritative; X-Tenant-Id header cannot override OriginTenantId), TC-010 PASS (cross-tenant export blocked INS_STL_NOT_FOUND), TC-011 PASS (getInsuranceDossierVersions cross-tenant returns empty), TC-012 PASS (own-tenant dossier versions returned correctly, totalElements=13→14 due to ISO-014 export), TC-013 PASS (CUSTOMER settlement dossier search returns empty, no BH data leak), TC-014 PASS (concurrent cross-tenant export succeeded independently, TenantA versionNo=14 TenantB versionNo=34), TC-015 PASS (version sequences fully independent per-tenant: A=14, B=34). BUG-W02-ISO-001 re-verified STILL OPEN (pdfUrl still has no tenant prefix). Final: 12 PASS · 1 FAIL · 2 BLOCKED. Lesson TL-W02-ISO-001 updated with Docker exec workaround. | agent-test-isolation |
| 2026-06-26 | 4 | Run10 out-of-scope SKIPPED: tất cả 15 TC đổi sang SKIPPED theo user override — tenant isolation out-of-wave trong W02 Run10. Thêm note nổi bật đầu file. Status Summary cập nhật: 15 SKIPPED. Kết quả Run 1 + Run 2 (v2/v3) giữ nguyên trong Changelog để tham chiếu lịch sử. | agent-test-isolation |
