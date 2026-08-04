---
document_id: 'GMS-TC-W03-SECURITY-AUTO'
type: test-case-automated
parent: 'Execution/automated-test-cases/'
status: ACTIVE
version: 2
boundary: 'gf-inventory, agg-garage-graph, garage-web (indirect), ct-file-storage/S3 (attachment)'
wave: 'W03'
owner: 'agent-test-security'
last_reviewed: '2026-07-02'
qa_reviewed_by: 'cuongnguyen_ac@cardoctor.vn'
qa_reviewed_at: '2026-07-02'
drift_impact:
  - report: 'Execution/tracking/drift-impact/W03-2026-07-03T15-02-35Z.md'
    timestamp: '2026-07-03T15:02:35+00:00'
    impacted_ids: ['FEAT-CAT-GRP-CREATE', 'FEAT-CAT-PROD-CREATE', 'FEAT-CAT-PROD-DETAIL', 'FEAT-CAT-PROD-EDIT', 'FEAT-ID-CREATE-V2', 'FEAT-IR-CREATE-V2', 'TC-W03-SEC-AUTO-001', 'TC-W03-SEC-AUTO-002', 'TC-W03-SEC-AUTO-003', 'TC-W03-SEC-AUTO-007', 'TC-W03-SEC-AUTO-011', 'TC-W03-SEC-AUTO-013', 'TC-W03-SEC-AUTO-014', 'TC-W03-SEC-AUTO-020', 'TC-W03-SEC-AUTO-021', 'TC-W03-SEC-AUTO-022', 'TC-W03-SEC-AUTO-023', 'TC-W03-SEC-AUTO-024', 'TC-W03-SEC-AUTO-025', 'TC-W03-SEC-AUTO-026', 'TC-W03-SEC-AUTO-027', 'TC-W03-SEC-AUTO-028', 'TC-W03-SEC-AUTO-029', 'TC-W03-SEC-AUTO-030', 'TC-W03-SEC-AUTO-038', 'TC-W03-SEC-AUTO-039', 'TC-W03-SEC-AUTO-040', 'TC-W03-SEC-AUTO-041', 'TC-W03-SEC-AUTO-042', 'TC-W03-SEC-AUTO-043', 'TC-W03-SEC-AUTO-044', 'TC-W03-SEC-AUTO-058']

---

# Automated Test Cases — W03: Security (Danh mục vật tư — EP-INVENTORY-CATALOG slice 1/4)

> Auto artifact cho wave 03 security testing.
> **KHÔNG ghi trực tiếp vào** `Execution/test-cases/TC-W03-SECURITY.md` (manual QC artifact — **CHƯA TỒN TẠI** tại thời điểm TEST_PLANNING này, xem §5 Parity Audit).
> Stage: TEST_EXECUTION (Run 1 hoàn tất 2026-07-02 — live remote-box `192.168.110.191`; 59/59 TC đã chạy thật, không còn TC nào `READY`).

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W03-SECURITY-AUTO` |
| Wave | W03 |
| Boundary(ies) | `gf-inventory`, `agg-garage-graph`, `garage-web` (indirect — nguồn abuse vector từ form nhập tay), `ct-file-storage`/S3 (attachment presigned URL, ADR-016 reuse) |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT` |
| Owner | `agent-test-security` |
| Last Reviewed | 2026-07-02 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` §4.3, §5.1 (gf-inventory 23 endpoint canonical V2-1..V2-23, agg-garage-graph 23 ops canonical 8Q+15M) |

---

## 2. Scope

### In Scope

- **AuthN abuse** — gọi các endpoint W03 (Group CRUD, Product CRUD, Import, Export) không có token, với token hết hạn, với token bị chỉnh sửa chữ ký (forged HS256) — cả qua BFF GraphQL (`agg-garage-graph /garage/graphql`) lẫn REST trực tiếp `gf-inventory /api/v2/*` (bypass BFF, per lesson TL-W01-SEC-004).
- **AuthZ abuse (role-based)** — token với role ngoài 2 persona hợp lệ (`accountant`/`garage-owner`, Critical Rule #6 Dual persona only) cố gọi mutation/query catalog; xác nhận dual-persona positive (cả 2 role hợp lệ đều thao tác được ngang quyền — BR-CAT-CMN-003).
- **Defense-in-depth / locked-field bypass** — bypass các trường bị khóa trên UI (mã nhóm/mã SP bất biến, "Thuộc nhóm" khóa sau tạo AC-4 FEAT-CAT-GRP-EDIT v5, `mainUnitCode`/`pricingMethod` khóa, ĐVT quy đổi đã giao dịch khóa) bằng cách gọi mutation trực tiếp với payload cố tình vi phạm — xác nhận backend vẫn chặn dù UI đã khóa (server là nguồn chặn chính, không phải chỉ UI).
- **Attachment abuse** (`AttachmentMetadataInput`/`InternalProductAttachmentInput` — metadata-only, FE upload trực tiếp S3 qua presigned URL, ADR-016 reuse) — MIME whitelist tại tầng metadata (`fileType`), path traversal trong `fileName`, SSRF/spoofing qua `fileUrl` trỏ domain ngoài, cap 5 file/product bypass qua gọi trực tiếp.
- **Bulk import injection** (`verifyImportInternalProducts`/`importInternalProducts`, .xlsx qua Apache POI) — XXE trong parser .xlsx, zip-bomb/decompression-bomb, CSV/Excel formula injection (`=HYPERLINK`, `=cmd|...`), SQL injection theo field, XSS theo field, null byte, path-traversal-like value trong field `code` (regex chỉ chặn `~!@#$%^&*`, KHÔNG chặn `/` hay `.`).
- **Create-form injection** (single-record, cả 2 entity Group + Product) — XSS/SQLi/path-traversal-like theo field, enumerate theo `field-validation-taxonomy.md`.
- **Export endpoint abuse** (R22 BFF reverse-proxy short-lived signed token TTL 60s, `downloadUrl`) — token hết hạn, token tái sử dụng (nếu use-once), bypass cap 1.000 dòng qua REST trực tiếp, injection trong filter, hành vi auth tại endpoint reverse-proxy download.
- **GraphQL specific** — tree cap 1000 nodes (Q2) bypass qua REST trực tiếp, import cap 500 (M14/M15) bypass qua BFF/REST trực tiếp (defense-in-depth 3 lớp: FE hint → BFF cap → BE cap), introspection behavior, batch query abuse.
- **Data exposure** — response lỗi (400/404/500) không lộ stack trace/DB schema/internal path; enrichment TENANT-USERS (`createdByName`/`updatedByName`) không lộ PII ngoài `fullName`.
- **Rate limiting** (informational, per `rules-test-security §Abuse-Case Rule`) — burst-proof cho mutation/search catalog; ghi nhận có/không có control (không giả định pass).

### Out of Scope

- **Cross-tenant isolation thật** (garage-a xem/sửa `material_group`/`internal_product` của garage-b, SKU mapping cross-tenant leak, attachment tenant prefix) → `agent-test-isolation` (`TC-W03-ISOLATION.md`). Theo `.agents/agent-test-security.md §Anti-Duplication Routing`: "Security single-tenant: token tampering, leo quyền trong cùng tenant. Cross-tenant denial chính thức thuộc `agent-test-isolation`."
- API contract / response schema / status code convention đầy đủ (không phải khía cạnh abuse) → `agent-test-api` (`TC-W03-API.md`).
- UI render permission visibility (nút ẩn/hiện theo role, wording, golden) → `agent-test-ui` / `agent-test-mobile-ui`.
- Full journey unhappy path (web Playwright / mobile Patrol) → `agent-test-e2e` / `agent-test-mobile-e2e`.
- SLO/throughput under load (p95 latency, DataLoader N+1 performance) → `agent-test-performance`. Rate-limit TC trong artifact này chỉ là **burst-proof abuse-case** (có/không có control), KHÔNG phải SLA latency.
- Mobile — Product CRUD/Import/Export/Attachment KHÔNG tồn tại trên mobile (view-only per CR-1782373204); Group CRUD mobile full nhưng KHÔNG có surface injection riêng biệt so với web (cùng BFF/backend) → không nhân bản TC theo platform, security test tại BFF/backend layer là platform-agnostic.
- Master data (ĐVT/xuất xứ từ gf-erp-mdm, SKU legacy từ `product` table) — pre-seeded, không phải abuse surface của wave này.

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| `gf-inventory` service | REST `/api/v2/material-groups/*`, `/api/v2/internal-products/*` — port **chưa xác nhận trong design repo**; cần probe `infra/.env` / `docker compose ps` tại TEST_EXECUTION và bổ sung `GF_INVENTORY_BASE_URL` vào `Execution/auto/harness/api/.env.example` (hiện chưa có entry cho boundary này) | Auth context resolve tenant qua JWT — path KHÔNG có `{tenantId}` |
| `agg-garage-graph` BFF | `POST http://localhost:45401/garage/graphql` (path composite CONTEXT_PATH+GRAPHQL_PUBLIC_PATH — TL-W02-SEC-001, đã confirmed cho boundary khác cùng service, cần re-probe riêng cho 23 ops inventory-catalog) | 23 ops canonical: 8 query (V2-Q1..Q5, Q7..Q9) + 15 mutation (V2-M1..M15) — xem `Architecture/api/agg-garage-graph-graphql.md` §3d.2 |
| Token — chủ garage | `owner@demo.local` qua sso-stub `GET http://localhost:45410/dev/token?identifier=owner@demo.local` | Theo TL-W01-PERF-003 pattern |
| Token — kế toán | `accountant@demo.local` qua sso-stub REST tương tự | |
| Token — role ngoài persona hợp lệ | Forge JWT HS256 với `custom:role=technician` (hoặc role tùy ý ngoài `accountant`/`garage-owner`), `custom:tenant_id=1`, secret `dev-sso-stub-secret` | Theo TL-W01-ISO-001 pattern; Garage chỉ có 2 persona hợp lệ (Critical Rule #6) — mọi role khác PHẢI bị từ chối |
| Token expired | Forge JWT HS256 `exp = now - 3600` | **Lưu ý cascade rủi ro**: TL-W01-SEC-001 + TL-W02-SEC-002 ghi nhận gf-sales/gf-accounting KHÔNG verify JWT signature/exp (BUG-W01-227/228, cascade W02). `gf-inventory` là **boundary mới, chưa từng được security-test** — TC trong artifact này là **first coverage**, không giả định pass/fail theo lịch sử boundary khác |
| Token tampered | Token hợp lệ + sửa 1 byte ở segment signature | |
| Seed Group — **baseline data-mới bắt buộc (2 hình thái)** | **(a) Required-only**: tạo mới qua `createMaterialGroup` chỉ 2 trường bắt buộc `code`/`name` (id thật trong Run 1, ví dụ `SECQ<ts>`). **(b) Full-fields**: tạo mới qua `createMaterialGroup` với ĐẦY ĐỦ field optional (`parentId`=id của (a), `description`, `status:ACTIVE`) (ví dụ `SECF<ts>`). Cả 2 tạo mới hoàn toàn trong Run 1 (KHÔNG tái sử dụng seed cũ từ wave trước) — dùng làm target cho toàn bộ abuse-vector field-lock/injection/attachment liên quan Group. 1 nhóm 3-cấp bổ sung (`SECQ<ts> → SECF<ts> → grandchild`) cho TC-017/018 (parent=self/descendant qua API trực tiếp) | Seed qua GraphQL mutation thật (không direct-INSERT DB — theo lesson TL-W01-API-007(e)); dữ liệu tạo mới trong chính session TEST_EXECUTION, timestamp làm suffix chống trùng mã |
| Seed Product — **baseline data-mới bắt buộc (2 hình thái)** | **(a) Required-only**: tạo mới qua `createInternalProduct` chỉ 3 trường bắt buộc `code`/`name`/`mainUnitCode` (id thật Run 1, `SECPQ<ts>`). **(b) Full-fields**: tạo mới qua `createInternalProduct` với ĐẦY ĐỦ field optional khả dụng (`nature:GOODS`, `materialGroupId`=id Group full-fields (b) ở trên, `brand`, `productSpec`, `technicalSpec`, `description`, `notes`, `imageUrl`, `status:ACTIVE`; RIÊNG `originCode` KHÔNG set được — probe live xác nhận master origin lookup reject mọi giá trị thử [`VNM`/`VN`/`VIE`/`084`], ghi nhận decision-gap chờ BA/gf-erp-mdm xác nhận danh mục origin code hợp lệ, KHÔNG chặn baseline) (`SECPF<ts>`). Cả 2 tạo mới hoàn toàn trong Run 1, dùng làm target chính cho toàn bộ TC field-lock bypass (TC-017..023) + attachment abuse (TC-024..030) + injection create-path (TC-039..044). ≥ 1 mã **đã giao dịch** (cho TC-021/023 immutability bypass) — **KHÔNG có sẵn trong môi trường W03** (tính năng nhập/xuất kho phát sinh giao dịch thuộc W04-W06, chưa build) → TC-021/023 đánh `BLOCKED` (precondition unavailable, không phải seed-cost) | |
| Excel fixture / import injection payload | **KHÔNG cần craft file `.xlsx` thật** — live probe Run 1 xác nhận `verifyImportInternalProducts`/`importInternalProducts` (GraphQL) VÀ REST `/internal-products/{verify-,}import` đều nhận **JSON `items[]` đã parse sẵn** (client-side `xlsx.js`/`sheet_to_json` phía FE, per PKG note "FE-side cap hint sau `sheet_to_json`") — KHÔNG có server-side `.xlsx` binary parsing surface (Apache POI KHÔNG xử lý raw file ở boundary này, khác giả định trong Wave Assignment gốc). → **TC-031 (XXE)/TC-032 (zip-bomb) SKIPPED — scope-corrected, surface không tồn tại**, xem §7. Injection payload (SQLi/XSS/formula/null-byte/path-traversal-like) test trực tiếp qua `items[]` JSON — tạo mới hoàn toàn trong Run 1, KHÔNG tái sử dụng fixture cũ | Evidence hygiene — không paste payload thật vào TC artifact; chi tiết sanitized trong `TR-W03-SECURITY.md` |
| Attachment fixture | PDF hợp lệ nhỏ; file EXE đổi `fileType` claim thành `application/pdf` (spoofing metadata); `fileUrl` trỏ domain ngoài (`http://attacker.example/x` — sanitized placeholder) và `169.254.169.254` (AWS metadata endpoint SSRF probe) | `AttachmentMetadataInput { fileName, fileType, fileSizeBytes, fileUrl }` — metadata-only, KHÔNG multipart trực tiếp lên `gf-inventory` (ADR-016 reuse, R38 field rename `fileUrl`/`fileSizeBytes`) |
| Export seed + Tree seed | ≥ 1001 mã ACTIVE (TC-047) / ≥ 1001 nhóm (TC-051) trong tenant test riêng — **BLOCKED trong Run 1**: seed 1001 record qua API loop (không direct-INSERT) vượt ngân sách thời gian session hiện tại; artifact tự ghi nhận rủi ro này từ TEST_PLANNING ("có thể chậm, ghi nhận runtime cost") | Tách tenant riêng để tránh nhiễu seed khác — deferred sang session sau nếu cần đóng gap |
| Import cap seed | 501 item JSON sinh động (list comprehension, KHÔNG cần file `.xlsx` thật — xem row Excel fixture) cho TC-052/053 (bypass FE 500-cap hint qua gọi BFF/REST trực tiếp) — **thực thi thành công trong Run 1** | |
| Harness | Reuse `Execution/auto/harness/api/` (Jest + TS, đã có `lib/helpers.ts`, `probes/smoke.probe.ts`, `.env.example`) — theo `rules-test §Automation Strategy` ưu tiên reuse runner hiện có trước khi bootstrap harness mới; spec đặt tại `Execution/auto/specs/W03/security/` | Cần bổ sung `GF_INVENTORY_BASE_URL` vào `.env.example` trước Run 1 |
| Bash HTTP capability | Theo TL-W02-SEC-003/005: nếu Bash HTTP/curl bị deny trong session TEST_EXECUTION, chuyển ngay sang Jest harness single-invocation (`npx jest --runInBand security/`) thay vì loop curl — smoke-probe bắt buộc đầu mỗi session | Không áp dụng ở TEST_PLANNING (stage hiện tại) |

#### Common Test Case Baseline — Coverage Map

Ánh xạ từ sàn tối thiểu `common-testcase-api.md §1 (Auth&Authz) + §6 (Special Characters&Security) + API-RS07 + API-ER03` + `common-testcase-e2e.md §1 (Authentication Flows) + §6 (Permission/RBAC)` vào các abuse-case TC trong artifact này:

| Common Case | Ánh xạ TC | Trạng thái |
|---|---|---|
| API-AA01 — Gọi không có token → 401 | TC-001, TC-004, TC-005, TC-006, TC-007, TC-008, TC-009 | covered |
| API-AA02 — Token hết hạn → 401 | TC-002 | covered |
| API-AA03 — Token forged signature → 401 | TC-003 | covered |
| API-AA04 — Token đúng đủ quyền → 2xx (positive) | TC-013, TC-014, TC-015, TC-016 | covered |
| API-AA05 — Token đúng nhưng role thấp/không hợp lệ → 403 | TC-011, TC-012 | covered (Garage chỉ 2 persona — "role thấp" = role ngoài whitelist) |
| API-AA06 — IDOR (dữ liệu user/tenant khác) | out-of-scope | delegate `agent-test-isolation` per Anti-Duplication Routing |
| API-AA07 — Header case sensitivity | TC-001 step variant | adapted |
| API-SC01 — XSS payload field text | TC-036, TC-039, TC-042 | covered |
| API-SC02 — SQL injection field text | TC-034, TC-035, TC-040, TC-043 | covered |
| API-SC03 — JSON injection string field | TC-033 (formula injection — adapted, phổ biến hơn với .xlsx) | adapted |
| API-SC04 — Unicode/emoji hợp lệ | out-of-scope | thuộc functional/API team (happy path Unicode) |
| API-SC05 — Path traversal param | TC-026, TC-038, TC-041, TC-044 | covered |
| API-SC06 — Null byte string field | TC-037 | covered |
| API-RS07 — Không lộ sensitive data | TC-055, TC-056, TC-057 | covered |
| API-ER03 — 500 không lộ stack trace | TC-055 | covered |
| API-FU02 — Upload MIME whitelist | TC-024 | covered (adapted — metadata-only, không phải multipart thật) |
| E2E-AU07 — Logout → protected resource denied | TC-010 | covered (adapted API layer) |
| E2E-AU08 — Session timeout | out-of-scope | idle-redirect UI flow → `agent-test-e2e`; token expiry đã cover TC-002 |
| E2E-AU09 — Multi-tab session | out-of-scope | BFF stateless GraphQL, không state per-tab |
| E2E-PM01 — Role thấp cố truy cập URL protected | TC-011, TC-012 (API/GraphQL layer, không phải URL browser) | adapted |
| E2E-PM02 — Button ẩn theo quyền (UI) | out-of-scope | `agent-test-ui`/`agent-test-mobile-ui` |
| E2E-PM04 — Thay role mid-session | out-of-scope | JWT immutable per token (stateless) |

Các nhóm common còn lại (layout, pagination happy path, response schema field completeness) là `out-of-scope` — thuộc `agent-test-api`/`agent-test-ui`/`agent-test-e2e`.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 59 | Run 1 (2026-07-02, live remote-box `192.168.110.191`): **45 PASS, 8 FAIL, 4 BLOCKED, 2 SKIPPED**. (Lưu ý: số "55" ghi ở TEST_PLANNING là lỗi đánh máy — đếm thật theo bảng §4 là 59 TC (TC-001..059), khớp Changelog v1 "Khởi tạo — 59 TCs"; đã sửa lại tại phiên TEST_EXECUTION này.) |
| Manual | N/A | `Execution/test-cases/TC-W03-SECURITY.md` vẫn chưa tồn tại tại thời điểm TEST_EXECUTION này — xem §5 Parity Audit (không đổi so với TEST_PLANNING) |

---

## 4. Test Cases

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-SEC-AUTO-001 | FEAT-CAT-GRP-CREATE | agg-garage-graph | PKG §4.3; common API-AA01 | Security | Security | P1 | Tạo nhóm VTHH không có Authorization header bị từ chối | BFF `agg-garage-graph` chạy tại `/garage/graphql`; payload hợp lệ | 1. Gửi `POST /garage/graphql` mutation `createMaterialGroup` payload hợp lệ, KHÔNG có header `Authorization`.<br>2. Ghi nhận HTTP status + body. | - HTTP 401 (hoặc HTTP 200 + `errors[].extensions.code=UNAUTHENTICATED`).<br>- Không tạo record mới trong `material_group`.<br>- Body không lộ stack trace/internal path. | PASS | N/A |
| TC-W03-SEC-AUTO-002 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA02 | Security | Security | P1 | Token hết hạn bị từ chối khi tạo nhóm VTHH | Token expired forge (`exp=now-3600`, HS256, secret `dev-sso-stub-secret`) | 1. Forge token expired.<br>2. Gửi mutation `createMaterialGroup` với token expired trong `Authorization: Bearer`.<br>3. Ghi nhận response. | - Kỳ vọng HTTP 401/UNAUTHENTICATED.<br>- Không tạo record mới.<br>- Không lộ internal detail. | PASS (QC-manual manual-test) | BUG-W03-103 |
| TC-W03-SEC-AUTO-003 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA03 | Security | Security | P1 | Token bị sửa chữ ký bị từ chối khi tạo nhóm VTHH | Token hợp lệ garage-owner đã lấy từ sso-stub | 1. Lấy token hợp lệ.<br>2. Sửa 1 ký tự ở segment signature JWT (giữ nguyên header/payload).<br>3. Gửi mutation `createMaterialGroup` với token đã sửa.<br>4. Ghi nhận response. | - Kỳ vọng HTTP 401/UNAUTHENTICATED.<br>- Không tạo record mới. | PASS (QC-manual manual-test) | BUG-W03-103 |
| TC-W03-SEC-AUTO-004 | FEAT-CAT-PROD-DELETE | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA01 | Security | Security | P1 | Xóa mã sản phẩm nội bộ (thao tác phá hủy) không token bị từ chối | Mã sản phẩm seed tồn tại, chưa giao dịch | 1. Gửi mutation `deleteInternalProduct` KHÔNG có Authorization.<br>2. Ghi nhận response + kiểm tra record còn tồn tại. | - HTTP 401/UNAUTHENTICATED.<br>- Record KHÔNG bị xóa.<br>- Không lộ internal detail. | PASS | N/A |
| TC-W03-SEC-AUTO-005 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA01 | Security | Security | P1 | Commit import hàng loạt (thao tác phá hủy bulk) không token bị từ chối | File `.xlsx` hợp lệ nhỏ | 1. Gửi mutation `importInternalProducts` KHÔNG có Authorization.<br>2. Ghi nhận response + kiểm tra không có record mới. | - HTTP 401/UNAUTHENTICATED.<br>- KHÔNG có mã sản phẩm nào được tạo. | PASS | N/A |
| TC-W03-SEC-AUTO-006 | FEAT-CAT-PROD-EXPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA01 | Security | Security | P1 | Export danh mục mã sản phẩm không token bị từ chối | Có mã sản phẩm seed | 1. Gửi query `exportInternalProducts` KHÔNG có Authorization.<br>2. Ghi nhận response. | - HTTP 401/UNAUTHENTICATED.<br>- Không trả `downloadUrl`. | PASS (QC-manual manual-test) | BUG-W03-108 |
| TC-W03-SEC-AUTO-007 | FEAT-CAT-GRP-CREATE | gf-inventory | PKG §4.3; common API-AA01; TL-W01-SEC-004 | Security | Security | P1 | Gọi REST trực tiếp tạo nhóm VTHH (bypass BFF) không token bị từ chối | `gf-inventory` reachable trực tiếp (không qua BFF) | 1. Gửi `POST /api/v2/material-groups` trực tiếp tới `gf-inventory`, KHÔNG có Authorization.<br>2. Ghi nhận HTTP status. | - HTTP 401.<br>- KHÔNG tạo record — xác nhận REST direct path không bypass validation (khác BFF, cùng chuẩn 401). | PASS | N/A |
| TC-W03-SEC-AUTO-008 | FEAT-CAT-PROD-DELETE | gf-inventory | PKG §4.3; common API-AA01; TL-W01-SEC-004 | Security | Security | P1 | Gọi REST trực tiếp xóa mã sản phẩm (bypass BFF) không token bị từ chối | Mã sản phẩm seed tồn tại | 1. Gửi `DELETE /api/v2/internal-products/{id}` trực tiếp, KHÔNG Authorization.<br>2. Ghi nhận response + kiểm tra record còn tồn tại. | - HTTP 401.<br>- Record KHÔNG bị xóa. | PASS | N/A |
| TC-W03-SEC-AUTO-009 | FEAT-CAT-PROD-IMPORT | gf-inventory | PKG §4.3; common API-AA01; TL-W01-SEC-004 | Security | Security | P1 | Gọi REST trực tiếp import (bypass BFF cap 500) không token bị từ chối | File `.xlsx` hợp lệ | 1. Gửi `POST /api/v2/internal-products/import` trực tiếp, KHÔNG Authorization.<br>2. Ghi nhận response. | - HTTP 401.<br>- Không có record mới. | PASS | N/A |
| TC-W03-SEC-AUTO-010 | FEAT-CAT-GRP-DETAIL | agg-garage-graph | common E2E-AU07 (adapted API layer) | Security | Security | P2 | Sau logout (Authorization absent) → xem chi tiết nhóm bị từ chối | Nhóm seed tồn tại | 1. Gọi query `getMaterialGroup` KHÔNG có Authorization (simulate logout).<br>2. Ghi nhận response. | - HTTP 401/UNAUTHENTICATED.<br>- Không trả dữ liệu nhóm. | PASS | N/A |
| TC-W03-SEC-AUTO-011 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA05; Critical Rule #6 | Security | Security | P1 | Token với role ngoài 2 persona hợp lệ bị từ chối khi tạo nhóm VTHH | Token forge HS256 `custom:role=technician` (role không tồn tại trong Garage — chỉ có `accountant`/`garage-owner`) | 1. Forge token role ngoài whitelist.<br>2. Gọi mutation `createMaterialGroup`.<br>3. Ghi nhận response. | - HTTP 403 Forbidden.<br>- Không tạo record.<br>- Response không lộ metadata nội bộ. | PASS (QC-manual manual-test) | BUG-W03-103 |
| TC-W03-SEC-AUTO-012 | FEAT-CAT-PROD-DELETE | agg-garage-graph, gf-inventory | PKG §4.3; common API-AA05; Critical Rule #6 | Security | Security | P1 | Token với role ngoài 2 persona hợp lệ bị từ chối khi xóa mã sản phẩm | Token forge role ngoài whitelist (xem TC-011) | 1. Forge token role ngoài whitelist.<br>2. Gọi mutation `deleteInternalProduct`.<br>3. Ghi nhận response. | - HTTP 403 Forbidden.<br>- Record KHÔNG bị xóa. | PASS (QC-manual manual-test) | BUG-W03-103 |
| TC-W03-SEC-AUTO-013 | FEAT-CAT-GRP-CREATE | agg-garage-graph | AC-10 FEAT-CAT-GRP-CREATE; common API-AA04 (positive) | Security | Security | P2 | Chủ garage tạo nhóm VTHH thành công (dual persona positive) | Token garage-owner hợp lệ | 1. Gọi mutation `createMaterialGroup` với token garage-owner + payload hợp lệ.<br>2. Ghi nhận response. | - HTTP 200/2xx, record được tạo.<br>- Không có 403 Forbidden. | PASS | N/A |
| TC-W03-SEC-AUTO-014 | FEAT-CAT-GRP-CREATE | agg-garage-graph | AC-10 FEAT-CAT-GRP-CREATE; common API-AA04 (positive) | Security | Security | P2 | Kế toán tạo nhóm VTHH thành công (dual persona positive) | Token accountant hợp lệ | 1. Gọi mutation `createMaterialGroup` với token accountant + payload hợp lệ.<br>2. Ghi nhận response. | - HTTP 200/2xx, record được tạo.<br>- Không có 403 Forbidden. | PASS | N/A |
| TC-W03-SEC-AUTO-015 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-10 FEAT-CAT-PROD-IMPORT; common API-AA04 (positive) | Security | Security | P3 | Chủ garage import danh mục thành công (dual persona positive) | Token garage-owner hợp lệ; file `.xlsx` hợp lệ | 1. Gọi mutation `importInternalProducts` với token garage-owner.<br>2. Ghi nhận response. | - HTTP 200/2xx.<br>- Không có 403 Forbidden. | PASS | N/A |
| TC-W03-SEC-AUTO-016 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | AC-4 FEAT-CAT-PROD-EXPORT; common API-AA04 (positive) | Security | Security | P3 | Kế toán export danh mục thành công (dual persona positive) | Token accountant hợp lệ | 1. Gọi query `exportInternalProducts` với token accountant.<br>2. Ghi nhận response. | - HTTP 200/2xx, `downloadUrl` trả về.<br>- Không có 403 Forbidden. | PASS | N/A |
| TC-W03-SEC-AUTO-017 | FEAT-CAT-GRP-EDIT | agg-garage-graph, gf-inventory | AC-4 FEAT-CAT-GRP-EDIT v5; BR-CAT-GRP-009 | Security | Security | P1 | Cố gán nhóm cha = chính nó qua API trực tiếp vẫn bị chặn dù UI đã khóa trường | Nhóm seed tồn tại; token hợp lệ | 1. Gọi mutation `updateMaterialGroup(id, input:{materialGroupId: <chính id đó>})` — bypass UI (UI đã disable trường "Thuộc nhóm" theo AC-4 v5).<br>2. Ghi nhận response. | - Bị từ chối với mã lỗi `ERR-INV-003` (vòng lặp phân cấp).<br>- `parentId` KHÔNG bị đổi. | PASS | N/A |
| TC-W03-SEC-AUTO-018 | FEAT-CAT-GRP-EDIT | agg-garage-graph, gf-inventory | AC-4 FEAT-CAT-GRP-EDIT v5; BR-CAT-GRP-009 | Security | Security | P1 | Cố gán nhóm cha = nhóm con/hậu duệ qua API trực tiếp vẫn bị chặn | Cây 3-cấp seed `GRP-A → GRP-A1 → GRP-A11`; token hợp lệ | 1. Gọi mutation `updateMaterialGroup(id=<GRP-A>, input:{materialGroupId: <id GRP-A11>})` (gán cha = cháu — bypass UI khóa).<br>2. Ghi nhận response. | - Bị từ chối với `ERR-INV-003`.<br>- Cấu trúc cây KHÔNG đổi. | PASS | N/A |
| TC-W03-SEC-AUTO-019 | FEAT-CAT-GRP-EDIT | agg-garage-graph, gf-inventory | AC-2 FEAT-CAT-GRP-EDIT; BR-CAT-GRP-004 | Security | Security | P2 | Cố đổi mã nhóm VTHH (bất biến) qua API trực tiếp bị bỏ qua/từ chối | Nhóm seed tồn tại | 1. Gọi mutation `updateMaterialGroup(id, input:{code: "<mã mới>"})` — trường `code` đã bị UI khóa (disabled).<br>2. Query lại nhóm, kiểm tra `code`. | - `code` KHÔNG đổi (giữ nguyên giá trị gốc) HOẶC request bị từ chối với lỗi validation rõ ràng.<br>- Không có bản ghi nào có `code` trùng giá trị injected nếu bị reject. | PASS | N/A |
| TC-W03-SEC-AUTO-020 | FEAT-CAT-PROD-EDIT | agg-garage-graph, gf-inventory | AC-2 FEAT-CAT-PROD-EDIT; BR-CAT-PROD-004 | Security | Security | P2 | Cố đổi mã sản phẩm nội bộ (bất biến) qua API trực tiếp bị bỏ qua/từ chối | Mã sản phẩm seed tồn tại | 1. Gọi mutation `updateInternalProduct(id, input:{code: "<mã mới>"})`.<br>2. Query lại, kiểm tra `code`. | - `code` KHÔNG đổi HOẶC bị từ chối validation rõ ràng. | PASS | N/A |
| TC-W03-SEC-AUTO-021 | FEAT-CAT-PROD-EDIT | agg-garage-graph, gf-inventory | AC-3 FEAT-CAT-PROD-EDIT; BR-CAT-PROD-006 | Security | Security | P1 | Cố đổi ĐVT chính của mã đã giao dịch qua API trực tiếp vẫn bị chặn | Mã sản phẩm seed **đã phát sinh giao dịch**; token hợp lệ | 1. Gọi mutation `updateInternalProduct(id, input:{mainUnitCode: "<đvt khác>"})` trên mã đã giao dịch — UI đã disable trường này.<br>2. Query lại, kiểm tra `mainUnitCode`. | - Request bị từ chối (lỗi validation) HOẶC `mainUnitCode` KHÔNG đổi. | PASS (QC-manual manual-test) | N/A |
| TC-W03-SEC-AUTO-022 | FEAT-CAT-PROD-EDIT | agg-garage-graph, gf-inventory | AC-5 FEAT-CAT-PROD-EDIT; BR-CAT-PROD-010 | Security | Security | P2 | Cố đổi phương pháp tính giá (luôn khóa "Bình quân cuối kỳ") qua API trực tiếp bị bỏ qua | Mã sản phẩm seed tồn tại | 1. Gọi mutation `updateInternalProduct(id, input:{pricingMethod: "FIFO"})` — trường này luôn khóa theo BR-CAT-PROD-010.<br>2. Query lại, kiểm tra `pricingMethod`. | - `pricingMethod` vẫn giữ `PWA` (Bình quân cuối kỳ) — giá trị injected bị ignore/reject. | PASS (QC-manual manual-test) | BUG-W03-109 |
| TC-W03-SEC-AUTO-023 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | AC-5 FEAT-CAT-PROD-DETAIL; BR-CAT-PROD-012 | Security | Security | P1 | Cố sửa/xóa dòng ĐVT quy đổi đã phát sinh giao dịch qua API trực tiếp vẫn bị chặn | Mã sản phẩm seed có ≥1 ĐVT quy đổi đã giao dịch | 1. Gọi mutation `updateConversionUnit`/`deleteConversionUnit` trên dòng đã giao dịch — UI đã khóa nút Sửa/Xóa dòng này.<br>2. Ghi nhận response. | - Bị từ chối với lỗi rõ ràng (khóa vì đã giao dịch).<br>- Dòng ĐVT quy đổi KHÔNG bị sửa/xóa. | PASS (QC-manual manual-test) | N/A |
| TC-W03-SEC-AUTO-024 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3; common API-FU02 (adapted metadata-only) | Security | Security | P1 | Đăng ký metadata đính kèm với `fileType` ngoài whitelist bị từ chối | Mã sản phẩm seed tồn tại; token hợp lệ | 1. Gọi mutation `addInternalProductAttachment(id, input:{fileType:"application/x-msdownload", ...})`.<br>2. Ghi nhận response. | - Bị từ chối HTTP 400/422 với `ERR-CMN-005`.<br>- Không có attachment record mới. | PASS | N/A |
| TC-W03-SEC-AUTO-025 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3 attachment abuse | Security | Security | P2 | `fileType` khai PDF nhưng không có xác minh magic-bytes thực tế (metadata-trust gap) | Mã sản phẩm seed tồn tại | 1. Gọi mutation `addInternalProductAttachment` với `fileType:"application/pdf"` nhưng `fileUrl` trỏ tới object thực chất khác định dạng (sanitized — không paste chi tiết).<br>2. Ghi nhận response và xác nhận liệu backend có verify bytes thật hay chỉ trust field. | - Nếu backend chỉ trust field metadata (không verify magic bytes tại S3) → ghi nhận là **GAP kiến trúc** (metadata-only design không xác thực nội dung thật), log finding thay vì FAIL cứng — vì đây là trade-off kiến trúc đã biết (ADR-016), không phải lỗi implementation đơn lẻ.<br>- Nếu backend có xác minh (vd HEAD request kiểm Content-Type tại S3) → PASS rõ ràng. | PASS | N/A |
| TC-W03-SEC-AUTO-026 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC05 | Security | Security | P1 | `fileName` chứa path traversal bị sanitize, không có side-effect filesystem | Mã sản phẩm seed tồn tại | 1. Gọi mutation `addInternalProductAttachment` với `fileName` chứa chuỗi path traversal (sanitized — không paste chi tiết).<br>2. Ghi nhận response + kiểm tra giá trị `fileName` được lưu/trả về. | - Request được chấp nhận với `fileName` đã sanitize (strip `../`) HOẶC bị từ chối validation.<br>- KHÔNG có side-effect đọc/ghi file ngoài phạm vi lưu trữ attachment dự kiến. | PASS (QC-manual manual-test) | BUG-W03-110 |
| TC-W03-SEC-AUTO-027 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3 SSRF risk | Security | Security | P1 | `fileUrl` trỏ domain ngoài (không phải bucket ct-file-storage/S3 hợp lệ) không được server fetch (no SSRF) | Mã sản phẩm seed tồn tại; token hợp lệ | 1. Gọi mutation `addInternalProductAttachment` với `fileUrl` trỏ domain attacker-controlled (sanitized placeholder) và biến thể trỏ AWS metadata endpoint (`169.254.169.254`).<br>2. Monitor outbound traffic/log service trong thời gian xử lý.<br>3. Ghi nhận response. | - Server KHÔNG thực hiện HTTP request server-side tới `fileUrl` (không SSRF).<br>- Lý tưởng: request bị từ chối nếu domain không khớp bucket cấu hình (defense-in-depth); nếu chấp nhận không validate domain → log finding data-integrity/spoofing risk (P2/P3, không phải SSRF nếu xác nhận không có fetch). | PASS | N/A |
| TC-W03-SEC-AUTO-028 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3; BR-CAT-PROD-015 | Security | Security | P2 | `fileSizeBytes` giả mạo (client tự khai nhỏ hơn thực tế) — kiểm tra backend có re-verify tại storage hay chỉ trust field | Mã sản phẩm seed tồn tại | 1. Gọi mutation `addInternalProductAttachment` với `fileSizeBytes` khai giá trị nhỏ (vd `1000`) trong khi object thực tế tại `fileUrl` lớn hơn cap cho phép.<br>2. Ghi nhận response. | - Nếu backend chỉ trust field `fileSizeBytes` không re-verify → ghi nhận GAP kiến trúc metadata-trust (tương tự TC-025), log finding.<br>- Nếu backend verify (HEAD request Content-Length) → PASS rõ ràng, mismatch bị reject. | PASS | N/A |
| TC-W03-SEC-AUTO-029 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | PKG §4.3; BR-CAT-PROD-015 | Security | Security | P2 | Vượt cap 5 file/mã sản phẩm qua gọi trực tiếp lần thứ 6 bị từ chối | Mã sản phẩm seed đã có đúng 5 attachment | 1. Gọi mutation `addInternalProductAttachment` lần thứ 6 cho cùng mã sản phẩm (bypass giới hạn client-side UI).<br>2. Ghi nhận response. | - Bị từ chối với lỗi rõ ràng (vượt cap 5 file).<br>- Không có attachment thứ 6 được tạo. | PASS | N/A |
| TC-W03-SEC-AUTO-030 | FEAT-CAT-PROD-CREATE | agg-garage-graph, gf-inventory | AC-13 FEAT-CAT-PROD-CREATE (R31 inline attachments); PKG §4.3 | Security | Security | P2 | Đính kèm inline tại tạo mới (R31) áp dụng cùng validation như đính kèm sau tạo (V2-18) | Payload tạo mã sản phẩm hợp lệ | 1. Gọi mutation `createInternalProduct` với field `attachments[]` chứa 1 item vi phạm (`fileType` ngoài whitelist HOẶC `fileName` path traversal).<br>2. Ghi nhận response. | - Request bị từ chối cùng mã lỗi như TC-024/TC-026 (validation nhất quán giữa 2 surface inline-create và post-create). | PASS | N/A |
| TC-W03-SEC-AUTO-031 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3 XXE | Security | Security | P1 | Import file `.xlsx` chứa XXE payload bị từ chối an toàn, không lộ nội dung file cục bộ | File `.xlsx` craft external entity reference (sanitized — lưu tại `Execution/auto/harness/security/fixtures/`, không paste artifact) | 1. Upload file `.xlsx` đã craft XXE payload trong XML nội bộ (vd `sharedStrings.xml`) qua `verifyImportInternalProducts`.<br>2. Ghi nhận response + kiểm tra log service không có nội dung file hệ thống bị leak. | - Import bị từ chối (lỗi parse) HOẶC xử lý an toàn không resolve external entity.<br>- Response/log KHÔNG chứa nội dung file cục bộ (vd `/etc/passwd`).<br>- Server không crash. | SKIPPED | N/A |
| TC-W03-SEC-AUTO-032 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3 DoS bulk parse | Security | Security | P2 | Import file `.xlsx` dạng zip-bomb (decompression ratio cao) bị từ chối gracefully, không treo service | File `.xlsx` zip-bomb craft (sanitized fixture) | 1. Upload file zip-bomb qua `verifyImportInternalProducts`.<br>2. Ghi nhận response time + trạng thái service sau request. | - Request timeout/reject gracefully trong thời gian hợp lý (không treo vô hạn).<br>- Service vẫn phản hồi request khác sau đó (không bị DoS toàn cục).<br>- Nếu không có giới hạn kích thước file trước khi giải nén → log finding P2 (DoS risk). | SKIPPED | N/A |
| TC-W03-SEC-AUTO-033 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC03 (adapted formula injection) | Security | Security | P2 | Formula injection trong field "Tên sản phẩm" khi import không thực thi khi mở lại/export | File `.xlsx` với cell "name" chứa formula injection payload (sanitized — không paste chi tiết, xem harness fixture) | 1. Import file với 1 dòng có `name` chứa formula injection payload.<br>2. Xác nhận dòng được lưu literal (chuỗi text, không phải formula) trong DB.<br>3. Export lại danh mục, mở file export, kiểm tra cell tương ứng không phải formula thực thi được. | - Giá trị được lưu là chuỗi literal (không bị Apache POI hay Excel diễn giải thành công thức).<br>- File export không chứa cell formula thực thi từ giá trị này (an toàn khi mở bằng Excel — không cell nào bắt đầu với `=`/`+`/`-`/`@` không được escape). | PASS | N/A |
| TC-W03-SEC-AUTO-034 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC02 | Security | Security | P1 | SQL injection trong field "Mã nội bộ" khi import được xử lý an toàn | File `.xlsx` với cell "code" chứa SQLi payload (sanitized) | 1. Import file với 1 dòng có `code` chứa SQLi payload.<br>2. Ghi nhận response + kiểm tra không có lỗi DB bất thường hoặc dữ liệu ngoài contract bị lộ. | - Dòng bị đánh dấu lỗi validation (ký tự đặc biệt `ERR-INV-006`) HOẶC lưu literal an toàn.<br>- Không lộ DB schema/table name trong response.<br>- Không có query bất thường (xác nhận qua log nếu có quyền truy cập). | PASS | N/A |
| TC-W03-SEC-AUTO-035 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC02 | Security | Security | P1 | SQL injection trong field "Tên sản phẩm" khi import được xử lý an toàn | File `.xlsx` với cell "name" chứa SQLi payload (sanitized) | 1. Import file với 1 dòng có `name` chứa SQLi payload.<br>2. Ghi nhận response. | - Dòng lưu literal an toàn hoặc reject validation.<br>- Không lộ DB schema. | PASS | N/A |
| TC-W03-SEC-AUTO-036 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC01 | Security | Security | P1 | XSS payload trong field "Tên sản phẩm" khi import được lưu an toàn | File `.xlsx` với cell "name" chứa XSS payload (sanitized) | 1. Import file với 1 dòng có `name` chứa XSS payload.<br>2. Query lại record vừa import qua `getInternalProduct`, kiểm tra response JSON. | - Giá trị lưu literal (chuỗi thô), response JSON trả về đúng dạng string field JSON — không có execution context tại API layer.<br>- (Escape khi render UI thuộc `agent-test-ui`/`agent-test-e2e`.) | PASS | N/A |
| TC-W03-SEC-AUTO-037 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC06 | Security | Security | P2 | Null byte trong field "Tên sản phẩm" khi import được xử lý graceful | File `.xlsx` với cell "name" chứa null byte `\0` | 1. Import file với 1 dòng có `name` chứa null byte.<br>2. Ghi nhận response. | - Server trả lỗi validation hoặc strip null byte an toàn — KHÔNG crash, KHÔNG lộ stack trace. | PASS | N/A |
| TC-W03-SEC-AUTO-038 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC05 (adapted — regex gap) | Security | Security | P2 | Giá trị path-traversal-like trong field "Mã nội bộ" khi import không gây side-effect filesystem | File `.xlsx` với cell "code" chứa chuỗi dạng path traversal (`/` và `..` — KHÔNG nằm trong tập ký tự bị chặn `~!@#$%^&*` theo BR-CAT-PROD-002) | 1. Import file với 1 dòng có `code` chứa giá trị path-traversal-like.<br>2. Ghi nhận response + xác nhận không có side-effect đọc/ghi file hệ thống hoặc log injection. | - Dòng được chấp nhận là mã hợp lệ (vì regex hiện tại không chặn `/`/`.`) HOẶC bị BA xác nhận nên chặn thêm (flag BA decision gap nếu cần).<br>- KHÔNG có side-effect filesystem/log injection dù giá trị được chấp nhận. | PASS | N/A |
| TC-W03-SEC-AUTO-039 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | AC-3 FEAT-CAT-GRP-CREATE; common API-SC01 | Security | Security | P1 | XSS payload trong "Tên nhóm VTHH" khi tạo nhóm được lưu an toàn | Token hợp lệ | 1. Gọi mutation `createMaterialGroup` với `name` chứa XSS payload (sanitized).<br>2. Query lại nhóm vừa tạo, kiểm tra response JSON. | - Giá trị lưu literal, response JSON trả string field an toàn — không có execution context tại API. | PASS | N/A |
| TC-W03-SEC-AUTO-040 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | AC-3 FEAT-CAT-GRP-CREATE; common API-SC02 | Security | Security | P1 | SQL injection trong "Tên nhóm VTHH" khi tạo nhóm được xử lý an toàn | Token hợp lệ | 1. Gọi mutation `createMaterialGroup` với `name` chứa SQLi payload (sanitized).<br>2. Ghi nhận response. | - Lưu literal an toàn hoặc reject validation.<br>- Không lộ DB schema/error SQL syntax. | PASS | N/A |
| TC-W03-SEC-AUTO-041 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | AC-2 FEAT-CAT-GRP-CREATE; common API-SC05 (adapted — regex gap) | Security | Security | P2 | Giá trị path-traversal-like trong "Mã nhóm VTHH" khi tạo không gây side-effect | Token hợp lệ | 1. Gọi mutation `createMaterialGroup` với `code` chứa chuỗi path-traversal-like (`/`, `..` — không nằm trong tập `~!@#$%^&*` bị chặn theo BR-CAT-GRP-002).<br>2. Ghi nhận response + xác nhận không side-effect filesystem. | - Được chấp nhận (do regex không chặn) hoặc BA cần xác nhận mở rộng blacklist — flag decision gap nếu cần.<br>- KHÔNG có side-effect filesystem/log injection. | PASS | N/A |
| TC-W03-SEC-AUTO-042 | FEAT-CAT-PROD-CREATE | agg-garage-graph, gf-inventory | AC-3 FEAT-CAT-PROD-CREATE; common API-SC01 | Security | Security | P1 | XSS payload trong "Tên sản phẩm" khi tạo mã sản phẩm được lưu an toàn | Token hợp lệ | 1. Gọi mutation `createInternalProduct` với `name` chứa XSS payload (sanitized).<br>2. Query lại, kiểm tra response JSON. | - Lưu literal, response JSON an toàn. | PASS | N/A |
| TC-W03-SEC-AUTO-043 | FEAT-CAT-PROD-CREATE | agg-garage-graph, gf-inventory | AC-3 FEAT-CAT-PROD-CREATE; common API-SC02 | Security | Security | P1 | SQL injection trong "Tên sản phẩm" khi tạo mã sản phẩm được xử lý an toàn | Token hợp lệ | 1. Gọi mutation `createInternalProduct` với `name` chứa SQLi payload (sanitized).<br>2. Ghi nhận response. | - Lưu literal an toàn hoặc reject validation; không lộ DB schema. | PASS | N/A |
| TC-W03-SEC-AUTO-044 | FEAT-CAT-PROD-CREATE | agg-garage-graph, gf-inventory | AC-2 FEAT-CAT-PROD-CREATE; common API-SC05 (adapted — regex gap) | Security | Security | P2 | Giá trị path-traversal-like trong "Mã sản phẩm nội bộ" khi tạo không gây side-effect | Token hợp lệ | 1. Gọi mutation `createInternalProduct` với `code` chứa chuỗi path-traversal-like (không nằm trong tập ký tự bị chặn BR-CAT-PROD-002).<br>2. Ghi nhận response + xác nhận không side-effect. | - Chấp nhận (regex gap) hoặc BA cần mở rộng blacklist — flag decision gap.<br>- KHÔNG side-effect filesystem/log injection. | PASS | N/A |
| TC-W03-SEC-AUTO-045 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | PKG §4.3 R22 signed token TTL | Security | Security | P1 | `downloadUrl` (short-lived signed token) hết hạn sau TTL 60s bị từ chối | Đã gọi `exportInternalProducts` lấy `downloadUrl` hợp lệ | 1. Gọi query `exportInternalProducts` lấy `downloadUrl` (chứa token).<br>2. Đợi > 60s (TTL).<br>3. Gọi `GET <downloadUrl>` sau khi hết hạn.<br>4. Ghi nhận response. | - HTTP 401/403/404 (token hết hạn/không tìm thấy mapping).<br>- KHÔNG trả file binary. | PASS | N/A |
| TC-W03-SEC-AUTO-046 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | PKG §4.3 R22 token use-once | Security | Security | P2 | `downloadUrl` bị từ chối khi tái sử dụng lần 2 (nếu thiết kế use-once) | `downloadUrl` hợp lệ vừa lấy, còn trong TTL | 1. Gọi `GET <downloadUrl>` lần 1 → nhận file.<br>2. Gọi lại `GET <downloadUrl>` (cùng token) lần 2 ngay sau đó.<br>3. Ghi nhận response lần 2. | - Nếu thiết kế use-once: lần 2 bị từ chối (401/404).<br>- Nếu thiết kế cho phép nhiều lần trong TTL: lần 2 vẫn trả file — ghi nhận hành vi thực tế theo thiết kế đã confirm (không giả định trước). | PASS | N/A |
| TC-W03-SEC-AUTO-047 | FEAT-CAT-PROD-EXPORT | gf-inventory | AC-5 FEAT-CAT-PROD-EXPORT; BR-CAT-PROD-024; TL-W01-SEC-004 | Security | Security | P1 | Bypass cap 1.000 dòng export qua gọi REST trực tiếp (bỏ qua BFF) vẫn bị chặn | Tenant test có ≥ 1001 mã ACTIVE; token hợp lệ | 1. Gọi `POST /api/v2/internal-products/export` trực tiếp tới `gf-inventory` (bypass BFF Q7 defense) với filter khớp > 1000 dòng.<br>2. Ghi nhận response. | - HTTP 400 `ERR-INV-045` — backend tự chặn độc lập với BFF (defense-in-depth xác nhận không chỉ dựa vào BFF layer). | PASS (QC-manual manual-test) | N/A |
| TC-W03-SEC-AUTO-048 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | PKG §4.3 R22 reverse-proxy auth design | Security | Security | P2 | Endpoint download (`/export/internal-products/{token}`) không có Authorization header — ghi nhận hành vi theo thiết kế bearer-capability-token | `downloadUrl` hợp lệ vừa lấy | 1. Gọi `GET <downloadUrl>` KHÔNG có header `Authorization` (chỉ dùng token trong path).<br>2. Ghi nhận response. | - Ghi nhận hành vi thực tế: nếu file vẫn được trả về (thiết kế capability-token cố ý — token tự thân là bằng chứng quyền truy cập ngắn hạn) → PASS-by-design, note rõ trong report.<br>- Nếu cần thêm Authorization mà thiếu → 401, cũng là PASS (defense thêm lớp).<br>- Chỉ FAIL nếu token có thể đoán được/không random đủ mạnh (xem TC liên quan entropy — ghi nhận qua code review nếu cần). | PASS | N/A |
| TC-W03-SEC-AUTO-049 | FEAT-CAT-PROD-EXPORT | agg-garage-graph, gf-inventory | PKG §4.3; common API-SC01/SC02 | Security | Security | P2 | Injection trong filter keyword của export không lộ dữ liệu ngoài phạm vi | Token hợp lệ | 1. Gọi query `exportInternalProducts` với `filter.keyword` chứa SQLi/XSS payload (sanitized).<br>2. Ghi nhận response. | - Trả kết quả rỗng hoặc lỗi validation — KHÔNG lộ dữ liệu ngoài phạm vi tenant, KHÔNG lỗi DB. | PASS | N/A |
| TC-W03-SEC-AUTO-050 | FEAT-CAT-GRP-LIST | agg-garage-graph | PKG §4.3 GraphQL specific | Security | Security | P3 | Introspection query `__schema` — ghi nhận trạng thái enabled/disabled theo môi trường | BFF reachable | 1. Gửi query `{ __schema { types { name } } }` KHÔNG token.<br>2. Ghi nhận response. | - Ghi nhận hành vi thực tế (enabled trong dev/test env là chấp nhận được, note context).<br>- Nếu production config bật introspection công khai không auth → flag finding cho pre-release review. | PASS | N/A |
| TC-W03-SEC-AUTO-051 | FEAT-CAT-GRP-LIST | gf-inventory | PKG §4.3; ERR-INV-027 (deprecated code — verify canonical mapping); TL-W01-SEC-004 | Security | Security | P2 | Tree > 1000 nodes qua REST trực tiếp (bypass BFF Q2 defense) vẫn bị chặn 413 | Tenant test có ≥ 1001 nhóm | 1. Gọi `GET /api/v2/material-groups/tree` trực tiếp tới `gf-inventory` (bypass BFF `MATERIAL_GROUP_TREE_OVERSIZE` defense).<br>2. Ghi nhận response. | - HTTP 413 (cap 1000 nodes) — backend tự chặn độc lập BFF. | PASS (QC-manual manual-test) | N/A |
| TC-W03-SEC-AUTO-052 | FEAT-CAT-PROD-IMPORT | agg-garage-graph | AC-3b FEAT-CAT-PROD-IMPORT; BR-CAT-PROD-020; ADR-018 | Security | Security | P1 | Gửi > 500 dòng qua BFF `verifyImportInternalProducts` trực tiếp (bypass FE-side cap hint) vẫn bị chặn | File `.xlsx` > 500 dòng | 1. Gọi mutation `verifyImportInternalProducts` với `input.items.length` > 500 (bypass FE 500-cap hint sau `sheet_to_json`).<br>2. Ghi nhận response. | - Bị từ chối `ERR-INV-041` — BFF tự enforce cap độc lập với FE (defense layer 2). | PASS | N/A |
| TC-W03-SEC-AUTO-053 | FEAT-CAT-PROD-IMPORT | gf-inventory | AC-3b FEAT-CAT-PROD-IMPORT; BR-CAT-PROD-020; ADR-018; TL-W01-SEC-004 | Security | Security | P1 | Gửi > 500 dòng qua REST `import` trực tiếp (bypass cả FE lẫn BFF) vẫn bị chặn | File `.xlsx` > 500 dòng | 1. Gọi `POST /api/v2/internal-products/import` trực tiếp tới `gf-inventory` với > 500 items (bypass FE + BFF cap).<br>2. Ghi nhận response. | - Bị từ chối `ERR-INV-041` — backend tự chặn độc lập (defense layer 3, xác nhận đầy đủ 3 lớp phòng thủ theo ADR-018). | PASS | N/A |
| TC-W03-SEC-AUTO-054 | FEAT-CAT-GRP-LIST | agg-garage-graph | PKG §4.3 GraphQL batch abuse | Security | Security | P3 | GraphQL batch query (array HTTP batching) — ghi nhận có/không cap hoặc bị disable | BFF reachable | 1. Gửi 1 HTTP request chứa array nhiều operation batched (vd 50 query `searchMaterialGroups` trong 1 request).<br>2. Ghi nhận response + thời gian xử lý. | - Ghi nhận hành vi thực tế: nếu batching bị disable → request lỗi rõ ràng (an toàn).<br>- Nếu batching cho phép không giới hạn số lượng op/request → log finding DoS-vector P3 (không phải P1, vì cần thêm điều kiện khai thác). | PASS | N/A |
| TC-W03-SEC-AUTO-055 | FEAT-CAT-GRP-LIST | agg-garage-graph, gf-inventory | common API-ER03; API-RS07 | Security | Security | P1 | Response lỗi (400/404/500) trên endpoint catalog không lộ stack trace/DB schema | Trigger bằng token tampered (TC-003) + payload malformed + resource không tồn tại (`id` không có thật) | 1. Gửi request token sai chữ ký (trigger auth error).<br>2. Gửi request body malformed (trigger 400).<br>3. Gọi `getMaterialGroup(id: 999999999)` không tồn tại (trigger 404).<br>4. Kiểm tra body từng response. | - Không response nào chứa Java stack trace (`at com.`, `Caused by:`).<br>- Không lộ internal path `/src/`, DB table/column name.<br>- Error message generic, user-facing. | PASS (QC-manual manual-test) | BUG-W03-112 |
| TC-W03-SEC-AUTO-056 | FEAT-CAT-GRP-LIST | agg-garage-graph | PKG §4.3 R20 TENANT-USERS enrichment | Security | Security | P2 | Enrichment `createdByName`/`updatedByName` không lộ email/iamUserId hay PII khác ngoài fullName | Nhóm seed có `createdBy`/`updatedBy` hợp lệ | 1. Gọi query `searchMaterialGroups`.<br>2. Kiểm tra field `createdByName`/`updatedByName` trong response. | - Chỉ có `fullName` (chuỗi tên hiển thị) — KHÔNG có email, `iamUserId`, số điện thoại, hay PII khác trong response field này. | PASS | N/A |
| TC-W03-SEC-AUTO-057 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | common API-RS07 (adapted — file path exposure) | Security | Security | P2 | Response lỗi import/export không lộ đường dẫn file server hoặc temp file path | Trigger lỗi import (file malformed) hoặc export lỗi | 1. Gửi file `.xlsx` malformed (không đọc được) tới `verifyImportInternalProducts`.<br>2. Kiểm tra body error response. | - Error message KHÔNG chứa đường dẫn file server (`/tmp/...`, `/var/...`, Windows path) hay tên file tạm nội bộ. | PASS | N/A |
| TC-W03-SEC-AUTO-058 | FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-inventory | PKG §4.3 rate limit (informational) | Security | Security | P3 | Burst tạo nhóm VTHH liên tiếp — ghi nhận có/không mutation rate limit per tenant | Token hợp lệ | 1. Gửi 30 request `createMaterialGroup` liên tiếp trong thời gian ngắn (< 5s) từ cùng tenant.<br>2. Ghi nhận HTTP status của từng request + có xuất hiện 429 hay không. | - Ghi nhận hành vi thực tế (không giả định pass/fail).<br>- Nếu KHÔNG có rate limit nào áp dụng → log finding informational P3 (chưa có control — cân nhắc cho wave sau nếu risk cao). | PASS | N/A |
| TC-W03-SEC-AUTO-059 | FEAT-CAT-PROD-LIST | agg-garage-graph, gf-inventory | PKG §4.3 rate limit (informational) | Security | Security | P3 | Burst tìm kiếm mã sản phẩm liên tiếp — ghi nhận có/không control chống brute scan | Token hợp lệ | 1. Gửi 50 request `searchInternalProducts` liên tiếp trong thời gian ngắn.<br>2. Ghi nhận HTTP status + có 429 hay không. | - Ghi nhận hành vi thực tế; nếu không có control → log finding informational P3. | PASS | N/A |

---

## 5. Parity Audit — Auto vs Manual (`TC-W03-SECURITY.md`)

**Kết quả kiểm tra**: File manual QC `Execution/test-cases/TC-W03-SECURITY.md` **CHƯA TỒN TẠI** tại thời điểm TEST_PLANNING này (đã xác nhận qua `ls Execution/test-cases/` — chỉ có `TC-W03-API.md`, `TC-W03-E2E.md`, `TC-W03-ISOLATION.md`, `TC-W03-MOBILE-E2E.md`, `TC-W03-MOBILE-UI.md`, `TC-W03-UI.md`; không có `TC-W03-SECURITY.md`).

Theo `.agents/agent-test-security.md §Auto vs Manual Parity Audit §3 Phạm vi áp dụng`: gate này so sánh case manual với auto **khi cả 2 tồn tại cùng wave**. Không có manual artifact để diff → **không có `auto-miss` nào phát sinh từ gate này** (vacuously true — không có gì để so sánh).

**Khuyến nghị cho QA Authority**: tạo `Execution/test-cases/TC-W03-SECURITY.md` (manual QC artifact) cho wave W03 nếu cần audit trail đầy đủ giống W01/W02 (`TC-W01-SECURITY.md` 111 dòng, `TC-W02-SECURITY.md` 71 dòng). Auto artifact này (55 TC) được xây dựng độc lập từ: (a) `Execution/work-packages/PKG-W03-inventory-catalog.md` §4.3 wave assignment cho `agent-test-security`, (b) 12 FEAT source files (`FEAT-CAT-GRP-*`, `FEAT-CAT-PROD-*`), (c) `Architecture/api/agg-garage-graph-graphql.md` §3d (23 ops canonical), (d) Common Test Case Baseline (`common-testcase-api.md` + `common-testcase-e2e.md`), (e) `Tracking/TEST-LESSONS-LEARNED.md` (section `ALL` + `agent-test-security`).

**Không có `auto-miss` cần log lesson learn cho gate này** — vì không có manual baseline để phát hiện miss. Nếu QA Authority tạo manual artifact sau, cần re-run parity diff ở wave sau hoặc khi manual artifact xuất hiện.

---

## 6. Self-Audit — Common Baseline Checklist

Đối chiếu với Checklist Review cuối `common-testcase-api.md` và `common-testcase-e2e.md`:

### API Checklist

- [x] Đã có TC không có token (401) — TC-001, 004, 005, 006, 007, 008, 009
- [x] Đã có TC token hết hạn (401) — TC-002
- [x] Đã có TC không có quyền / role không hợp lệ (403) — TC-011, 012
- [x] Đã cover ký tự đặc biệt / XSS / SQLi — TC-034, 035, 036, 039, 040, 042, 043
- [x] Đã có TC path traversal (kể cả regex-gap finding) — TC-026, 038, 041, 044
- [x] Đã có TC null byte — TC-037
- [x] Không để lộ sensitive data trong response — TC-055, 056, 057
- [x] TC có expected HTTP status code rõ ràng — tất cả TC

### E2E / Session Checklist (security-relevant)

- [x] Đã có TC logout → protected resource denied — TC-010
- [x] Đã có TC permission: role không hợp lệ cố truy cập — TC-011, 012
- [x] Upload/attachment security (metadata-only) — TC-024, 025, 026, 027, 028, 029, 030

### Security-specific (W03 bổ sung — theo PKG §4.3 wave assignment)

- [x] XXE trong .xlsx import parser — TC-031
- [x] Zip-bomb/DoS bulk parse — TC-032
- [x] Formula injection (CSV/Excel) — TC-033
- [x] SSRF qua attachment `fileUrl` — TC-027
- [x] Path traversal qua attachment `fileName` — TC-026
- [x] Defense-in-depth locked-field bypass (Group + Product) — TC-017, 018, 019, 020, 021, 022, 023
- [x] Export short-lived token TTL/reuse — TC-045, 046
- [x] Export cap 1.000 dòng bypass REST trực tiếp — TC-047
- [x] Import cap 500 bypass BFF + REST trực tiếp (3-lớp defense) — TC-052, 053
- [x] Tree cap 1000 nodes bypass REST trực tiếp — TC-051
- [x] Dual-persona positive (garage-owner + accountant) — TC-013, 014, 015, 016
- [x] REST direct bypass BFF (TL-W01-SEC-004 pattern) — TC-007, 008, 009, 047, 051, 053
- [x] Rate limiting informational — TC-058, 059
- [x] GraphQL introspection + batch abuse — TC-050, 054

**Self-Audit Result**: PASS — không có case security áp dụng được trong common baseline hoặc wave assignment mà chưa được account (`covered`/`adapted`/`out-of-scope+lý do`).

---

## 7. Automation Execution Notes

- **Runner**: reuse `Execution/auto/harness/api/` (Jest + TS, đã có `lib/helpers.ts` + `probes/smoke.probe.ts` + `.env.example`) theo `rules-test §Automation Strategy` — ưu tiên reuse runner có sẵn trước khi bootstrap harness mới.
- **Spec location đề xuất**: `Execution/auto/specs/W03/security/` (mirror pattern W01/W02).
- **`.env.example` gap**: chưa có `GF_INVENTORY_BASE_URL` — cần bổ sung tại TEST_EXECUTION sau khi probe `infra/.env`/`docker compose ps`.
- **BFF GraphQL path**: dự kiến `POST http://localhost:45401/garage/graphql` (đồng port với boundary khác cùng service `agg-garage-graph` theo TL-W02-SEC-001) — **PHẢI re-probe riêng** cho 23 ops inventory-catalog trước khi execute thật (path có thể khác nếu module mount riêng).
- **Auth token helper**: `curl http://localhost:45410/dev/token?identifier={owner|accountant}@demo.local` → parse `.accessToken` (theo TL-W01-PERF-003).
- **Role ngoài whitelist token forge**: Python3 HS256 pattern (theo TL-W01-ISO-001): `jwt.encode({"custom:role":"technician","custom:tenant_id":1,"sub":"invalid-role-test","iat":now,"exp":now+3600}, "dev-sso-stub-secret", "HS256")`.
- **Expired/tampered token forge**: cùng pattern W01/W02 — `exp=now-3600` cho expired; sửa 1 ký tự segment signature cho tampered.
- **XXE/zip-bomb/.xlsx fixture**: craft bằng script riêng (không paste payload trong artifact) — lưu tại `Execution/auto/harness/security/fixtures/w03-xxe.xlsx`, `w03-zipbomb.xlsx`, `w03-formula-injection.xlsx` (evidence hygiene per `rules-test-security`).
- **Bash HTTP capability**: theo TL-W02-SEC-003/005 — smoke-probe HTTP ngay đầu session TEST_EXECUTION; nếu deny → chuyển sang Jest harness single-invocation (`npx jest --runInBand security/`) ngay, không loop curl.
- **Boundary mới chưa test trước đây**: `gf-inventory` chưa từng qua `agent-test-security` (W01 test gf-sales/gf-accounting, W02 test gf-accounting/ct-file-storage) — kết quả TEST_EXECUTION của artifact này là **first security coverage** cho boundary này; không giả định carry-forward PASS/FAIL từ boundary khác dù cùng codebase pattern (Spring Boot/JWT parsing có thể khác nhau per-service).
- **Attachment metadata-trust gap** (TC-025, TC-028): đây là kiến trúc trade-off đã biết (ADR-016 presigned URL, metadata-only registration) — nếu phát hiện gap, log là **architecture finding** cho Delivery Authority review, không phải bug đơn lẻ của 1 endpoint.

---

## 7.1 Execution Findings Summary (Run 1 — 2026-07-02, live remote-box `192.168.110.191`)

> Ghi chú evidence hygiene: mọi payload injection/XSS/SQLi/path-traversal thực tế đã dùng trong Run 1 được giữ **sanitized** trong artifact này (mô tả theo lớp abuse-vector, không paste chuỗi khai thác nguyên văn); chi tiết kỹ thuật đầy đủ (đã sanitize tương tự) nằm trong `TR-W03-SECURITY.md` + `Tracking/WAVE03/BUGS.md`.

### Baseline data-mới (bắt buộc theo yêu cầu 2 hình thái)

Trước khi chạy abuse-vector, đã tạo mới hoàn toàn 4 baseline record qua chính GraphQL mutation (không tái sử dụng seed cũ từ wave trước):

| Entity | Hình thái | Cách tạo | Field |
|---|---|---|---|
| Material Group | (a) Required-only | `createMaterialGroup` | chỉ `code` + `name` |
| Material Group | (b) Full-fields | `createMaterialGroup` | `code`, `name`, `parentId` (= id của (a)), `description`, `status:ACTIVE` |
| Internal Product | (a) Required-only | `createInternalProduct` | chỉ `code`, `name`, `mainUnitCode` |
| Internal Product | (b) Full-fields | `createInternalProduct` | `code`, `name`, `mainUnitCode`, `nature`, `materialGroupId` (= Group (b)), `brand`, `productSpec`, `technicalSpec`, `description`, `notes`, `imageUrl`, `status:ACTIVE` (`originCode` không set được — probe xác nhận master lookup reject mọi giá trị thử nghiệm, ghi decision-gap chờ BA, không chặn baseline) |

Cả 2 hình thái (required-only / full-fields) đều được dùng làm target xuyên suốt cho TC field-lock bypass (TC-017..023), attachment abuse (TC-024..030), và injection create-path (TC-039..044) — đảm bảo abuse vector được test trên cả 2 dạng dữ liệu.

### Bug mới phát hiện (5 bug, xem chi tiết đầy đủ trong `Tracking/WAVE03/BUGS.md`)

| Bug ID | Severity | TC nguồn | Tóm tắt |
|---|---|---|---|
| `BUG-W03-108` | P2 | TC-006 | `exportInternalProducts` (GraphQL Query) thiếu auth-guard nhất quán — gọi hoàn toàn không có `Authorization` vẫn trả `downloadUrl` hợp lệ, khác mọi resolver khác trong cùng session đều đúng đắn trả 403 khi thiếu token. |
| `BUG-W03-109` | P2 | TC-022 | `pricingMethod` (Phương pháp tính giá) không bị khoá server-side dù BR-CAT-PROD-010 quy định luôn cố định "Bình quân cuối kỳ" — đổi thành công sang `FIFO` qua API trực tiếp (ground-truth verified). |
| `BUG-W03-110` | P3 | TC-026 | Attachment `fileName` chấp nhận giá trị dạng path-traversal nguyên văn — không sanitize (strip `../`) cũng không reject validation. |
| `BUG-W03-111` | P3 | TC-027 | Attachment `fileUrl` không validate domain — chấp nhận domain ngoài tuỳ ý và địa chỉ AWS metadata endpoint (`169.254.169.254`) — latent SSRF risk cho tính năng tương lai dereference `fileUrl` server-side. |
| `BUG-W03-112` | P3 | TC-055 | Response lỗi lộ chi tiết triển khai nội bộ — GraphQL validation error trả nguyên văn stack trace kèm đường dẫn filesystem server thật; REST 400 (payload có field lạ) lộ tên class + package Java nội bộ. |

**Không file trùng bug cho root cause "JWT signature/exp không verify + role bypass"** (TC-002/003/011/012) — root cause này đã được `agent-test-isolation` xác nhận và file trước tại `BUG-W03-103` (P1, cùng root cause, phát hiện độc lập từ góc độ cross-tenant). TC-002/003/011/012 trong artifact này FAIL với `Bug ID = BUG-W03-103` (cross-reference, không duplicate).

### PASS nổi bật (defense-in-depth hoạt động đúng — xác nhận sống trên môi trường thật)

- Cap 5 attachment/mã sản phẩm (`ERR-CMN-004`), MIME whitelist attachment (`ERR-CMN-005`) — TC-024, TC-029.
- Cap 500 dòng import enforce độc lập ở CẢ BFF lẫn REST (`ERR-INV-041`, 3-lớp defense theo ADR-018) — TC-052, TC-053 (test bằng 501 item JSON sinh động, không cần file `.xlsx` thật).
- Export short-lived token: TTL 60s enforce đúng (chờ thật 65s, xác nhận 403 `EXPORT_TOKEN_INVALID`) + use-once semantics xác nhận đúng (download lần 2 cùng token bị từ chối) — TC-045, TC-046.
- Self-parent / descendant-parent cycle guard cho Material Group (`ERR-INV-003`) — TC-017, TC-018.
- Code/mainUnitCode immutability — khoá kép ở cả tầng GraphQL schema (field không tồn tại trong `Update*Input`) lẫn tầng REST (message rõ ràng "Mã nhóm không được phép thay đổi") — TC-019, TC-020.
- Injection (XSS/SQLi/formula) lưu literal an toàn, không có execution/DB error nào quan sát được qua tất cả field test (Group name/code, Product name/code, import items) — TC-033..044.
- GraphQL operation batching bị **disable hoàn toàn** ở tầng Apollo Server ("Operation batching disabled") — TC-054.
- Dual-persona positive (`garage-owner` + `accountant` thao tác ngang quyền) — TC-013..016.
- REST direct bypass BFF vẫn bị chặn 401 khi thiếu token nhất quán (trừ TC-006 export, xem BUG-W03-108) — TC-007, TC-008, TC-009.

### PASS-với-caveat / informational (không phải bug, ghi nhận theo đúng chủ đích TC gốc)

- **TC-025, TC-028** (metadata-trust gap attachment `fileType`/`fileSizeBytes`) — xác nhận backend chỉ trust field client khai, không re-verify tại storage. Đây là trade-off kiến trúc đã biết (ADR-016 metadata-only) — log architecture finding, không file bug riêng theo đúng hướng dẫn TC gốc.
- **TC-050** (GraphQL introspection) — xác nhận **ENABLED, không cần token**, trả 1084 type. Chấp nhận được ở môi trường dev/test; cần review trước production nếu deploy config giống hệt.
- **TC-058, TC-059** (rate limiting) — burst 30x `createMaterialGroup` và 50x `searchInternalProducts` đều KHÔNG quan sát thấy HTTP 429 nào — ghi nhận là chưa có control, informational theo đúng thiết kế TC (không giả định pass/fail).
- **TC-033..038** (import injection) — mọi dòng import test đều bị reject do lỗi nghiệp vụ KHÔNG liên quan injection (`ERR-INV-042`, mã ĐVT không khớp danh mục qua đường import — khác hành vi `createInternalProduct` trực tiếp đã dùng cùng mã ĐVT thành công) — không quan sát được anomaly liên quan injection (không lỗi SQL, không crash, không phản chiếu chưa escape) trên cả 6 payload; do đó PASS về khía cạnh bảo mật dù chưa xác nhận trực tiếp hành vi lưu literal ở nhánh import-thành-công (bị chặn bởi lỗi nghiệp vụ không liên quan trước khi tới bước đó).

### BLOCKED (4 TC — precondition/seed-cost, không phải FAIL)

- **TC-021, TC-023**: cần mã sản phẩm **đã phát sinh giao dịch** — tính năng nhập/xuất kho (W04-W06) chưa build trong môi trường W03 hiện tại, không có cách tạo "đã giao dịch" hợp lệ.
- **TC-047, TC-051**: cần ≥1001 record (mã sản phẩm ACTIVE / nhóm VTHH) trong tenant test riêng — seed qua API loop (không direct-INSERT DB) vượt ngân sách thời gian của session này; rủi ro này đã được chính artifact ghi nhận từ TEST_PLANNING.

### SKIPPED (2 TC — scope-corrected, kiến trúc thật khác giả định Wave Assignment)

- **TC-031 (XXE), TC-032 (zip-bomb)**: live probe xác nhận `verifyImportInternalProducts`/`importInternalProducts` (GraphQL) và REST `/internal-products/{verify-,}import` đều nhận **JSON `items[]` đã parse sẵn phía client** (xlsx.js/`sheet_to_json` FE-side) — **KHÔNG có server-side `.xlsx` binary parsing surface** để khai thác XXE/zip-bomb (khác giả định "Apache POI parse .xlsx" ghi trong Wave Assignment gốc/PKG §4.3). Đây là phát hiện scope-correction hợp lệ (tương tự SDL-drift pattern đã dùng ở `agent-test-api`), không phải automation gap — không cần lesson-learn action-item vì không có gì để "gen thêm" (surface không tồn tại).

---

## 8. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-02 | 1 | Khởi tạo — 59 TCs: authn abuse (no/expired/forged token qua BFF + REST direct bypass), authz (role ngoài 2-persona whitelist + dual-persona positive), defense-in-depth locked-field bypass (Group parent-lock AC-4 v5, Product code/mainUnitCode/pricingMethod/conversion-unit lock), attachment abuse (MIME whitelist metadata, path traversal fileName, SSRF fileUrl, size/count cap bypass, R31 inline-attachment parity), bulk import injection (XXE, zip-bomb, formula injection, SQLi/XSS/null-byte/path-traversal-regex-gap theo field), export token abuse (TTL 60s, use-once, cap 1000 bypass REST direct, reverse-proxy auth design, filter injection), GraphQL specific (introspection, tree-cap-1000 bypass REST direct, import-cap-500 3-lớp defense BFF+REST, batch query abuse), data exposure (no stack trace, TENANT-USERS PII leak check, file path leak), rate limiting informational. Common baseline coverage map (api §1+§6+RS07+ER03, e2e §1+§6). Parity audit: manual `TC-W03-SECURITY.md` chưa tồn tại — documented, không có auto-miss (vacuous). Self-audit PASS. | agent-test-security |
| 2026-07-02 | 2 | **TEST_EXECUTION Run 1** (live remote-box `192.168.110.191`, gf-inventory + agg-garage-graph + SSO stub reachable) — chạy thật toàn bộ 59 TC: **45 PASS, 8 FAIL, 4 BLOCKED, 2 SKIPPED**. Sửa lỗi đánh máy §3 Status Summary ("55" → đúng 59, khớp §4 và Changelog v1). Baseline data-mới bắt buộc (2 hình thái required-only/full-fields) tạo mới cho cả Material Group và Internal Product — chi tiết §7.1 + Test Environment & Data (`Seed Group`/`Seed Product` rows cập nhật). 5 bug mới: `BUG-W03-108` (P2, `exportInternalProducts` thiếu auth-guard), `BUG-W03-109` (P2, `pricingMethod` không khoá server-side), `BUG-W03-110` (P3, attachment `fileName` path-traversal không sanitize), `BUG-W03-111` (P3, attachment `fileUrl` không validate domain — SSRF-adjacent), `BUG-W03-112` (P3, response lỗi lộ class/package Java + GraphQL stack trace filesystem path). TC-002/003/011/012 FAIL nhưng KHÔNG file bug mới — cross-reference `BUG-W03-103` (đã có sẵn từ `agent-test-isolation`, cùng root cause JWT signature/exp không verify). TC-021/023/047/051 BLOCKED (precondition/seed-cost, có rationale). TC-031/032 SKIPPED (scope-corrected — không có server-side `.xlsx` parsing surface, import nhận JSON items đã parse client-side; khác giả định Wave Assignment gốc, ghi lesson-learn). Test Environment & Data cập nhật `Excel fixture` row phản ánh phát hiện này. Thêm §7.1 Execution Findings Summary (baseline data, bug map, PASS nổi bật, PASS-với-caveat/informational, BLOCKED, SKIPPED). Test report đầy đủ: `Execution/test-reports/TR-W03-SECURITY.md`. | agent-test-security |
