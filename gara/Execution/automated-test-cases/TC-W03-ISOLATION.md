---
document_id: 'GMS-TC-W03-ISOLATION'
type: test-case
parent: 'Execution/test-cases/TEST-CASE-REGISTRY.md'
status: ACTIVE
version: 2
boundary: 'gf-inventory, agg-garage-graph, garage-web, ct-file-storage, gf-erp-mdm'
wave: 'W03'
owner: 'agent-test-isolation'
last_reviewed: '2026-07-02'
qa_reviewed_by: 'cuongnguyen_ac@cardoctor.vn'
qa_reviewed_at: '2026-07-02'
drift_impact:
  - report: 'Execution/tracking/drift-impact/W03-2026-07-03T15-02-35Z.md'
    timestamp: '2026-07-03T15:02:35+00:00'
    impacted_ids: ['FEAT-CAT-GRP-CREATE', 'FEAT-CAT-PROD-CREATE', 'FEAT-CAT-PROD-DETAIL', 'FEAT-CAT-PROD-EDIT', 'FEAT-ID-CREATE-V2', 'FEAT-IR-CREATE-V2', 'TC-W03-ISO-001', 'TC-W03-ISO-007', 'TC-W03-ISO-008', 'TC-W03-ISO-010', 'TC-W03-ISO-011', 'TC-W03-ISO-013', 'TC-W03-ISO-014', 'TC-W03-ISO-015', 'TC-W03-ISO-016', 'TC-W03-ISO-017', 'TC-W03-ISO-022', 'TC-W03-ISO-023', 'TC-W03-ISO-027', 'TC-W03-ISO-028', 'TC-W03-ISO-029', 'TC-W03-ISO-030', 'TC-W03-ISO-031', 'TC-W03-ISO-032', 'TC-W03-ISO-033', 'TC-W03-ISO-034', 'TC-W03-ISO-035', 'TC-W03-ISO-036']

---

# Test Case Automated — W03: Tenant Isolation (EP-INVENTORY-CATALOG — Danh mục vật tư)

> Automated testcase artifact do `agent-test-isolation` sinh tại `TEST_PLANNING`, cập nhật kết quả tại `TEST_EXECUTION` (2026-07-02). Manual QC file
> `Execution/test-cases/TC-W03-ISOLATION.md` (14 TC, `QA Authority`) chỉ đọc để cross-check —
> xem §Auto vs Manual Parity Audit trong `Test Environment & Data`.
>
> **TEST_EXECUTION 2026-07-02**: 36/36 TC đã chạy thật trên môi trường sống (`gf-inventory:45086`, `agg-garage-graph:45401/garage/graphql`, `gf-sims:45410/45888`, `gf-erp-mdm:45084`, DB `gf_inventory`/`gf_erp_mdm` qua `gf-postgres`). Toàn bộ dữ liệu 2-tenant (`garage-a` tenant_id=1, `garage-b` tenant_id=467) dùng cho §4.1 và các TC cross-tenant liên quan là **dữ liệu tạo mới trong lượt chạy này** (không tái sử dụng seed cũ), theo yêu cầu bổ sung của batch run 2026-07-02. **2 P1 CONFIRMED tại TC-W03-ISO-017 và TC-W03-ISO-019 — xem §5 và §Status Summary — release-blocking, KHÔNG được coi nhẹ.**

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W03-ISOLATION` |
| Wave | W03 |
| Boundary(ies) | `gf-inventory`, `agg-garage-graph`, `garage-web`, `ct-file-storage`, `gf-erp-mdm` (dữ liệu chủ dùng chung, KHÔNG isolate) |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT` |
| Owner | `agent-test-isolation` |
| Last Reviewed | 2026-07-02 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` (§2.2.1, §2.2.2, §4.3) |

---

## 2. Scope

### In Scope

- **Two-tenant matrix** (garage-a / garage-b) cho toàn bộ 24 GraphQL ops (V2-Q1..Q9 + V2-M1..M15) + 23 REST endpoint (V2-1..V2-23) của `gf-inventory` qua `agg-garage-graph`:
  - Material Group (search/tree/detail/create/update/delete — V2-1..V2-6, V2-Q1..Q3, V2-M1..M3)
  - Internal Product (search/detail/create/update/delete — V2-7/8/10/11/12, V2-Q4/Q5, V2-M4/M5/M6)
  - SKU mapping (map/unmap — V2-13/14, V2-M7/M8)
  - Conversion-unit (add — V2-15, V2-M9)
  - Attachment (add — V2-18, V2-M12) + ct-file-storage namespace check
  - Import (verify/commit — V2-20/21, V2-M14/M15) — record chỉ tạo dưới tenant JWT context
  - Export (single-call R22 — V2-22, V2-Q7) — file + short-lived download token chỉ scope đúng tenant mint
  - SKU search (V2-23, V2-Q8) — legacy `product` table vẫn tenant-scoped
- **`OriginTenantId`/trusted-context integrity (Rule #4)**: JWT `custom:tenant_id` claim là nguồn sự thật; header `X-Tenant-Id`/`X-Branch-Id` client-supplied KHÔNG được override tenant context khi mismatch. **[TEST_EXECUTION] Xác nhận: chữ ký JWT bản thân KHÔNG được verify (BUG-W03-103) — nên "JWT claim là nguồn sự thật" chỉ đúng khi giả định actor không tự sửa JWT của mình; giả định này hiện KHÔNG được đảm bảo bằng cơ chế kỹ thuật.**
- **BFF header propagation**: `agg-garage-graph` forward `X-Tenant-Id`/`X-Branch-Id` xuống `gf-inventory` đúng theo JWT, không theo client override.
- **Mã duy nhất theo từng tenant**: `(tenant_id, code)` unique constraint — trùng code khác tenant vẫn tạo được (không phải ràng buộc global).
- **Dữ liệu chủ dùng chung**: `gf-erp-mdm` UNIT/COUNTRY KHÔNG bị cô lập theo tenant — regression guard chống false-positive isolation bug.
- **TENANT-USERS enrichment isolation** (Material Group only — Q1/Q2/Q3/M1/M2 per PKG §2.2.2, KHÔNG áp dụng Internal Product W03): `createdByName`/`updatedByName` chỉ resolve user cùng tenant.
- **Web deep-link cross-tenant**: dán URL chi tiết nhóm/mã sản phẩm của tenant khác → 404, không leak data.
- **TenantFilter full-sweep regression**: mọi CRUD request có `TenantContext` set đúng.
- **[TEST_EXECUTION bổ sung theo yêu cầu batch 2026-07-02]**: với mỗi entity có test cross-tenant (Material Group, Internal Product), tối thiểu 2 case tạo-dữ-liệu-mới cho tenant sở hữu — (a) chỉ nhập trường bắt buộc, (b) nhập đầy đủ tất cả trường — thực hiện TRƯỚC khi chạy assertion cross-tenant denial, cho **cả 2 tenant** (không chỉ tenant sở hữu bị nhắm tới trong TC denial, mà cả tenant còn lại — đảm bảo dữ liệu 2 phía đều mới). Xem §4.1.

### Out of Scope

- API contract / schema / status code / validation server (format response khi negative case) → `agent-test-api`
- UI render persona visibility web → `agent-test-ui`
- UI render persona visibility mobile (Flutter) → `agent-test-mobile-ui`
- Full journey cross-boundary web (Playwright) → `agent-test-e2e`
- Full journey cross-boundary mobile (Patrol) → `agent-test-mobile-e2e`
- Auth/authz abuse single-tenant (token tampering không liên quan tenant, injection, OWASP) → `agent-test-security`
- SLO latency/throughput (list 1000 nhóm/10000 SP p95, DataLoader N+1) → `agent-test-performance`
- **`OriginTenantId` trên outbox/Kafka event (`CatalogGroup/Product Created/Updated/Deleted`)** — `out-of-scope+lý do`: PKG-W03 §2.2.1 xác nhận **KHÔNG có state-changing event nào ra ngoài W03** cho catalog. Không có event nào tồn tại để test `OriginTenantId` header trên envelope. Tenant integrity cho wave này đạt được hoàn toàn qua đường đồng bộ REST/GraphQL + JWT trusted context — đã cover qua TC-W03-ISO-019/024.
- Nội dung wording/label popup/màn hình (thuộc UI, không phải isolation) → `agent-test-ui`

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Tenant A — `garage-a` (`tenant_id=1`) | Token `owner@demo.local` qua sso-stub `GET /dev/token` (mint tự nhiên, `custom:tenant_id=1`) | Xác nhận sống 2026-07-02 |
| Tenant B — `garage-b` (`tenant_id=467`) | JWT forged HS256 secret `dev-sso-stub-secret` với `custom:tenant_id=467` qua `docker exec gf-sims node -e "require('/app/node_modules/jsonwebtoken').sign(...)"` (per lesson TL-W01-ISO-001) | Xác nhận sống 2026-07-02 |
| **[MỚI] Material Group `garage-a` — required-only** | `GRP-A-ISOREQ` (id=23) — chỉ `code`+`name`, tạo qua `POST /api/v2/material-groups` | TC-W03-ISO-029 |
| **[MỚI] Material Group `garage-a` — full-fields** | `GRP-A-ISOFULL` (id=24) — đầy đủ `code/name/parentId/description/status/displayOrder` | TC-W03-ISO-030 |
| **[MỚI] Material Group `garage-b` — required-only** | `GRP-B-ISOREQ` (id=25) | TC-W03-ISO-031 |
| **[MỚI] Material Group `garage-b` — full-fields** | `GRP-B-ISOFULL` (id=26) | TC-W03-ISO-032 |
| **[MỚI] Internal Product `garage-a` — required-only** | `PROD-A-ISOREQ` (id=21) — chỉ `code/name/mainUnitCode=UNIT_CAI` | TC-W03-ISO-033 |
| **[MỚI] Internal Product `garage-a` — full-fields** | `PROD-A-ISOFULL` (id=23) — đầy đủ trường, `materialGroupId=23`, `originCode=US`, `pricingMethod=PWA`; đã gắn thêm SKU mapping (`productId=1`), conversion-unit (`UNIT_BO`×12), attachment (`catalog-iso-test.pdf`) | TC-W03-ISO-034 |
| **[MỚI] Internal Product `garage-b` — required-only** | `PROD-B-ISOREQ` (id=22) | TC-W03-ISO-035 |
| **[MỚI] Internal Product `garage-b` — full-fields** | `PROD-B-ISOFULL` (id=24) — `materialGroupId=25`, `originCode=US` | TC-W03-ISO-036 |
| Seed hỗ trợ cây phân cấp `garage-a` | `GRP-A-PARENT-ISO`(27) → `GRP-A-CHILD-ISO`(28) → `GRP-A-GRANDCHILD-ISO`(29), tạo mới qua API | Cho TC-003/004/006 |
| Seed hỗ trợ nhóm rỗng để xóa | `GRP-A-EMPTY-ISO` (id=30) | Cho TC-005 |
| Seed trùng mã 2 tenant | `GRP-SHARED-CODE-ISO` — tạo ở cả `garage-a` (id=31) và `garage-b` (id=32) | Cho TC-007 |
| Import probe | `PROD-A-IMPISO-1/2` — tạo qua `importInternalProducts` với header `X-Tenant-Id: 467` giả mạo | Cho TC-018 |
| Master data `gf-erp-mdm` | UNIT thật: `UNIT_CAI/UNIT_CHIEC/UNIT_BO/UNIT_ONG`; COUNTRY thật: `US` + ~19 nước khác (không có mã 3-ký-tự như draft ban đầu giả định — đã hiệu chỉnh theo dữ liệu thật) | Dùng chung 2 tenant — xác nhận qua `POST /protected/catalog/v1/inquiry` |
| ct-file-storage | Simulator `localhost:45888` | **CONFIRMED KHÔNG enforce tenant ACL — xem BUG-W03-104** |
| `agg-garage-graph` | GraphQL `http://localhost:45401/garage/graphql` | Health check OK; đã restart 1 lần trong lúc chạy, hành vi re-verify không đổi |
| `gf-inventory` | REST `/api/v2/...` | Health check OK |
| Export download token (R22) | BFF in-memory mapping `{token → {filter, tenantId, requestId}}` TTL 60s, replay JWT gốc tại thời điểm mint (`signed-token.service.ts`) | Xác nhận qua đọc source `export-proxy.handler.ts` + test thật — xem TC-021 |
| Automation runner | Curl/Python trực tiếp (Bash không bị chặn trong session này) + `docker exec gf-postgres psql` để verify DB trực tiếp + `docker exec gf-sims node` để forge JWT | Không cần bootstrap Jest harness riêng — dùng pattern fallback đã document sẵn |

**Common Baseline Coverage Map** (sàn tối thiểu per §Common Test Case Baseline — `common-testcase-api.md` §1 + `common-testcase-e2e.md` §6, nâng thành ma trận tenant):

| Common Case | Loại | Ánh xạ sang auto TC W03 | Trạng thái |
|---|---|---|---|
| API-AA01 — không token (401) | auth abuse single-tenant | — | `out-of-scope` — thuộc `agent-test-security` |
| API-AA02 — token hết hạn (401) | auth abuse single-tenant | — | `out-of-scope` — `agent-test-security` |
| API-AA03 — token sai/giả mạo (401) | auth abuse; **nhánh tenant_id tampered** thuộc isolation | TC-W03-ISO-019 | `adapted` — **FAIL, xem BUG-W03-103** |
| API-AA05 — token đúng nhưng không quyền (role thấp) | access-control | nâng thành cross-tenant denial: TC-W03-ISO-002/003/004/005/006/009/010/011/012/013/014/015/016 | `adapted` — tất cả PASS |
| API-AA06 — IDOR (token user A truy cập data user B) | IDOR/cross-tenant | TC-W03-ISO-003/004/005/010/011/012/013/016 | `covered` — tất cả PASS |
| E2E-PM01 — role thấp cố truy cập URL Admin | access-control UI | TC-W03-ISO-027 | `adapted` — PASS |
| E2E-PM02 — role thấp không thấy nút Admin | UI visibility | — | `out-of-scope` — `agent-test-ui` |
| E2E-PM03 — Admin xóa → user khác refresh thấy biến mất | real-time sync | — | `out-of-scope` — `agent-test-e2e` |
| E2E-PM04 — đổi role trong session | session authz | — | `out-of-scope` — `agent-test-security` |
| Mismatched `OriginTenantId`/trusted context (Rule #4, W03-specific) | header vs JWT | TC-W03-ISO-024 + TC-W03-ISO-025 | `covered` — cả 2 PASS (header ignored đúng thiết kế; nhưng xem BUG-W03-103 — vấn đề không nằm ở header mà ở chính JWT không được verify) |

**Auto vs Manual Parity Audit** (đối chiếu `Execution/test-cases/TC-W03-ISOLATION.md` — 14 manual TC): **14/14 covered, 0 auto-miss** (không đổi so với TEST_PLANNING — xem Changelog v1).

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 36 (28 gốc + 8 case data-mới bổ sung) | **34 PASS, 2 FAIL (P1: TC-W03-ISO-017 → BUG-W03-104; TC-W03-ISO-019 → BUG-W03-103), 0 BLOCKED, 0 SKIPPED** |
| Manual | 14 | 14 READY (xem `Execution/test-cases/TC-W03-ISOLATION.md`, read-only) |

> **Kết luận release**: 2 FAIL đều là P1 confirmed cross-tenant leak — theo Rule #4 và Forbidden Actions của agent contract, đây là **release-blocking**, KHÔNG auto-close, cần Platform/Security review trước khi go-live wave này.

---

## 4. Test Cases

### 4.1 Data Setup — Tạo dữ liệu mới 2 tenant (required-only / full-fields)

> Bổ sung theo yêu cầu batch run 2026-07-02: mỗi entity có test cross-tenant phải có tối thiểu 2 case tạo-dữ-liệu-mới cho tenant sở hữu trước khi chạy assertion denial. Thực hiện cho **cả 2 tenant** (không chỉ 1 phía).

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-ISO-029 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-1 GRP-CREATE | Isolation | Isolation | P2 | Garage A tạo nhóm vật tư mới chỉ nhập trường bắt buộc — dữ liệu ghi đúng tenant | Token `garage-a` hợp lệ | 1. Gọi `POST /api/v2/material-groups` chỉ với `{code:"GRP-A-ISOREQ", name:"Nhom ISO A required only"}` (không `parentId`/`description`/`status`/`displayOrder`). | - HTTP 201.<br>- Record tạo với `tenant_id=1`, `status` mặc định `ACTIVE`, `displayOrder=0`.<br>- Dữ liệu dùng làm nguồn cho các TC cross-tenant liên quan (không dùng seed cũ). | PASS | N/A |
| TC-W03-ISO-030 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-1 GRP-CREATE | Isolation | Isolation | P2 | Garage A tạo nhóm vật tư mới nhập đầy đủ tất cả trường — dữ liệu ghi đúng tenant | Token `garage-a` hợp lệ | 1. Gọi `POST /api/v2/material-groups` với đầy đủ `{code:"GRP-A-ISOFULL", name, parentId:null, description, status:"ACTIVE", displayOrder:5}`. | - HTTP 201.<br>- Tất cả trường được lưu đúng giá trị nhập (`description`, `displayOrder=5` không bị bỏ qua).<br>- `tenant_id=1`. | PASS | N/A |
| TC-W03-ISO-031 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-1 GRP-CREATE | Isolation | Isolation | P2 | Garage B tạo nhóm vật tư mới chỉ nhập trường bắt buộc — dữ liệu ghi đúng tenant | Token `garage-b` hợp lệ (forged, tenant_id=467) | 1. Gọi `POST /api/v2/material-groups` chỉ với `{code:"GRP-B-ISOREQ", name:"Nhom ISO B required only"}`. | - HTTP 201.<br>- Record tạo với `tenant_id=467`. | PASS | N/A |
| TC-W03-ISO-032 | FEAT-CAT-GRP-CREATE | gf-inventory | AC-1 GRP-CREATE | Isolation | Isolation | P2 | Garage B tạo nhóm vật tư mới nhập đầy đủ tất cả trường — dữ liệu ghi đúng tenant | Token `garage-b` hợp lệ | 1. Gọi `POST /api/v2/material-groups` với đầy đủ trường `{code:"GRP-B-ISOFULL", ..., displayOrder:5}`. | - HTTP 201.<br>- Tất cả trường lưu đúng, `tenant_id=467`. | PASS | N/A |
| TC-W03-ISO-033 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-1 PROD-CREATE | Isolation | Isolation | P2 | Garage A tạo mã sản phẩm mới chỉ nhập trường bắt buộc (`code/name/mainUnitCode`) — dữ liệu ghi đúng tenant | Token `garage-a` hợp lệ; `mainUnitCode` hợp lệ theo master `gf-erp-mdm` (`UNIT_CAI`) | 1. Gọi `POST /api/v2/internal-products` chỉ với `{code:"PROD-A-ISOREQ", name, mainUnitCode:"UNIT_CAI"}`. | - HTTP 201.<br>- Các trường optional (`brand/originCode/materialGroupId/...`) đều `null`, không lỗi.<br>- `tenant_id=1`. | PASS | N/A |
| TC-W03-ISO-034 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-1 PROD-CREATE | Isolation | Isolation | P2 | Garage A tạo mã sản phẩm mới nhập đầy đủ tất cả trường (kèm nhóm VTHH + xuất xứ hợp lệ theo master) — dữ liệu ghi đúng tenant | Token `garage-a` hợp lệ; `materialGroupId=23` (từ TC-029) đã tồn tại cùng tenant; `originCode` hợp lệ theo master `gf-erp-mdm` COUNTRY (`US`) | 1. Gọi `POST /api/v2/internal-products` với đầy đủ trường: `code, name, mainUnitCode, nature:GOODS, materialGroupId:23, brand, originCode:US, productSpec, technicalSpec, imageUrl, description, notes, status:ACTIVE, pricingMethod:PWA`.<br>2. Bổ sung SKU mapping, conversion-unit, attachment cho record này (làm nguồn dữ liệu cho TC-013..017). | - HTTP 201, mọi trường lưu đúng.<br>- `materialGroupName` resolve đúng "Nhom ISO A required only".<br>- `originCode` resolve hợp lệ (lưu ý: master COUNTRY thật KHÔNG có mã 3-ký-tự như draft ban đầu giả định — đã hiệu chỉnh dùng `US`). | PASS | N/A |
| TC-W03-ISO-035 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-1 PROD-CREATE | Isolation | Isolation | P2 | Garage B tạo mã sản phẩm mới chỉ nhập trường bắt buộc — dữ liệu ghi đúng tenant | Token `garage-b` hợp lệ | 1. Gọi `POST /api/v2/internal-products` chỉ với `{code:"PROD-B-ISOREQ", name, mainUnitCode:"UNIT_CAI"}`. | - HTTP 201, `tenant_id=467`. | PASS | N/A |
| TC-W03-ISO-036 | FEAT-CAT-PROD-CREATE | gf-inventory | AC-1 PROD-CREATE | Isolation | Isolation | P2 | Garage B tạo mã sản phẩm mới nhập đầy đủ tất cả trường — dữ liệu ghi đúng tenant | Token `garage-b` hợp lệ; `materialGroupId=25` (từ TC-031) cùng tenant | 1. Gọi `POST /api/v2/internal-products` đầy đủ trường tương tự TC-034 nhưng cho `garage-b`. | - HTTP 201, mọi trường lưu đúng, `tenant_id=467`. | PASS | N/A |

### 4.2 Cross-Tenant Isolation Matrix (28 TC gốc)

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-ISO-001 | FEAT-CAT-GRP-LIST, FEAT-CAT-GRP-CREATE | gf-inventory, agg-garage-graph | AC-10 (GRP-LIST), BR-CAT-GRP-013 | Isolation | Isolation | P1 | Garage A và Garage B tạo nhóm vật tư cùng lúc — mỗi garage chỉ thấy nhóm của chính mình | Dữ liệu từ TC-029..032 (`GRP-A-ISOREQ/FULL`, `GRP-B-ISOREQ/FULL`) đã tạo mới | 1. Sau khi 2 tenant đã tạo nhóm mới (TC-029..032), mỗi tenant gọi `searchMaterialGroups`. | - `garage-a` (`totalElements=24` tại thời điểm chạy) list chứa `GRP-A-ISOREQ`/`GRP-A-ISOFULL`, KHÔNG chứa `GRP-B-*`.<br>- `garage-b` (`totalElements=3`) list chứa `GRP-B-ISOREQ`/`GRP-B-ISOFULL`, KHÔNG chứa `GRP-A-*`. | PASS | N/A |
| TC-W03-ISO-002 | FEAT-CAT-GRP-LIST | gf-inventory, agg-garage-graph | AC-10, BR-CAT-GRP-013 | Isolation | Isolation | P1 | Garage B tìm kiếm nhóm vật tư — không thấy nhóm của Garage A | Như trên | 1. Đăng nhập `garage-b`.<br>2. Gọi `searchMaterialGroups(keyword:"", page:0, size:100)`. | - HTTP 200.<br>- `content[]` chỉ chứa nhóm của `garage-b`, xác nhận **0** code `GRP-A-*` xuất hiện. | PASS | N/A |
| TC-W03-ISO-003 | FEAT-CAT-GRP-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-GRP-013, Rule #4 | Isolation | Isolation | P1 | Garage B không xem được chi tiết nhóm vật tư của Garage A | Nhóm `GRP-A-CHILD-ISO` (id=28) thuộc `garage-a` | 1. Đăng nhập `garage-b`.<br>2. Gọi `GET /api/v2/material-groups/28`. | - HTTP 404 `ERR-CMN-not-found "Material group not found: 28"`.<br>- Không lộ field nào của `GRP-A-CHILD-ISO`. | PASS | N/A |
| TC-W03-ISO-004 | FEAT-CAT-GRP-EDIT | gf-inventory, agg-garage-graph | BR-CAT-GRP-013, Rule #4 | Isolation | Isolation | P1 | Garage B không sửa được nhóm vật tư của Garage A | Nhóm `GRP-A-CHILD-ISO` (id=28) | 1. Đăng nhập `garage-b`.<br>2. `PUT /api/v2/material-groups/28` `{name:"Hacked by B"}`.<br>3. Đọc lại bằng `garage-a`. | - HTTP 404.<br>- Tên vẫn là "Nhom con A ISO" khi `garage-a` đọc lại — KHÔNG đổi. | PASS | N/A |
| TC-W03-ISO-005 | FEAT-CAT-GRP-DELETE | gf-inventory, agg-garage-graph | BR-CAT-GRP-013, Rule #4 | Isolation | Isolation | P1 | Garage B không xóa được nhóm vật tư của Garage A | Nhóm rỗng `GRP-A-EMPTY-ISO` (id=30) | 1. Đăng nhập `garage-b`.<br>2. `DELETE /api/v2/material-groups/30`.<br>3. Đọc lại bằng `garage-a`. | - HTTP 404.<br>- `GRP-A-EMPTY-ISO` vẫn tồn tại nguyên vẹn (xác nhận `GET` trả 200 bằng token `garage-a`). | PASS | N/A |
| TC-W03-ISO-006 | FEAT-CAT-GRP-LIST | gf-inventory, agg-garage-graph | BR-CAT-GRP-005 | Isolation | Isolation | P2 | Cây phân cấp nhóm vật tư không lộ nhóm cross-tenant | Cây `GRP-A-PARENT/CHILD/GRANDCHILD-ISO` (27/28/29) thuộc `garage-a` | 1. Đăng nhập `garage-b`.<br>2. `GET /api/v2/material-groups/tree`. | - Cây trả về của `garage-b` chỉ gồm `GRP-SHARED-CODE-ISO`(32)/`GRP-B-ISOREQ`(25)/`GRP-B-ISOFULL`(26) — KHÔNG chứa `GRP-A-*`. | PASS | N/A |
| TC-W03-ISO-007 | FEAT-CAT-GRP-CREATE | gf-inventory, agg-garage-graph | BR-CAT-GRP-003, BR-CAT-GRP-013 | Isolation | Isolation | P1 | Garage A và Garage B cùng tạo nhóm với mã trùng nhau — cả 2 tạo thành công | Cả 2 tenant chưa có mã `GRP-SHARED-CODE-ISO` | 1. `garage-a` tạo `{code:"GRP-SHARED-CODE-ISO"}` → id=31.<br>2. `garage-b` tạo cùng code → id=32. | - Cả 2 mutation HTTP 201 thành công.<br>- 2 row riêng biệt, `tenant_id` khác nhau, cùng `code`. | PASS | N/A |
| TC-W03-ISO-008 | FEAT-CAT-PROD-LIST, FEAT-CAT-PROD-CREATE | gf-inventory, agg-garage-graph | AC-10 (PROD-LIST) | Isolation | Isolation | P1 | Garage A và Garage B tạo mã sản phẩm nội bộ cùng lúc — mỗi garage chỉ thấy mã của chính mình | Dữ liệu từ TC-033..036 | 1. Mỗi tenant gọi `searchInternalProducts`. | - `garage-a` (`total=17`) chỉ chứa `PROD-A-ISOREQ`/`PROD-A-ISOFULL` (trong nhóm ISO), KHÔNG `PROD-B-*`.<br>- `garage-b` (`total=2`) chỉ chứa `PROD-B-ISOREQ`/`PROD-B-ISOFULL`. | PASS | N/A |
| TC-W03-ISO-009 | FEAT-CAT-PROD-LIST | gf-inventory, agg-garage-graph | AC-10, BR-CAT-PROD-007 | Isolation | Isolation | P1 | Garage B tìm kiếm mã sản phẩm nội bộ — không thấy mã của Garage A | Như trên | 1. Đăng nhập `garage-b`.<br>2. `searchInternalProducts(keyword:"", page:0, size:100)`. | - `content[]` chỉ chứa mã của `garage-b`, xác nhận 0 code `PROD-A-*`. | PASS | N/A |
| TC-W03-ISO-010 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-CMN-002, Rule #4 | Isolation | Isolation | P1 | Garage B không xem được chi tiết mã sản phẩm của Garage A | Mã `PROD-A-ISOFULL` (id=23) | 1. Đăng nhập `garage-b`.<br>2. `GET /api/v2/internal-products/23`.<br>3. Lặp lại qua BFF `getInternalProduct(id:23)` (dùng chung với TC-027). | - HTTP 404 `"Internal product not found: 23"` cả ở REST lẫn GraphQL BFF. | PASS | N/A |
| TC-W03-ISO-011 | FEAT-CAT-PROD-EDIT | gf-inventory, agg-garage-graph | BR-CAT-PROD-004, Rule #4 | Isolation | Isolation | P1 | Garage B không sửa được mã sản phẩm của Garage A | Mã `PROD-A-ISOFULL` (id=23) | 1. Đăng nhập `garage-b`.<br>2. `PUT /api/v2/internal-products/23` `{name:"Hacked"}`.<br>3. Đọc lại bằng `garage-a`. | - HTTP 404.<br>- Tên vẫn "SP ISO A full fields" khi đọc lại. | PASS | N/A |
| TC-W03-ISO-012 | FEAT-CAT-PROD-DELETE | gf-inventory, agg-garage-graph | BR-CAT-PROD-016, Rule #4 | Isolation | Isolation | P1 | Garage B không xóa được mã sản phẩm của Garage A | Mã `PROD-A-ISOREQ` (id=21, chưa giao dịch) | 1. Đăng nhập `garage-b`.<br>2. `DELETE /api/v2/internal-products/21`.<br>3. Xác nhận còn tồn tại bằng `garage-a`. | - HTTP 404.<br>- `PROD-A-ISOREQ` vẫn tồn tại (`GET` trả 200 với `garage-a`). | PASS | N/A |
| TC-W03-ISO-013 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-PROD-013, Rule #4 | Isolation | Isolation | P1 | Garage B không gắn được SKU vào mã sản phẩm của Garage A | Mã `PROD-A-ISOFULL` (id=23); SKU `productId=3` (chưa mapping) | 1. Đăng nhập `garage-b`.<br>2. `POST /api/v2/internal-products/23/sku-mappings` `{productId:3}`. | - HTTP 404 `"Internal product not found: 23"`.<br>- Không có row mapping mới. | PASS | N/A |
| TC-W03-ISO-014 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-PROD-014, Rule #4 | Isolation | Isolation | P2 | Garage B không gỡ được SKU đã gắn của Garage A | `PROD-A-ISOFULL`(23) đã gắn SKU `productId=1` (mapping id=8) | 1. Đăng nhập `garage-b`.<br>2. `DELETE /api/v2/internal-products/23/sku-mappings/1`.<br>3. Đọc lại mapping bằng `garage-a`. | - HTTP 404 `"SKU mapping not found"`.<br>- Mapping id=8 vẫn còn nguyên khi `garage-a` đọc lại. | PASS | N/A |
| TC-W03-ISO-015 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-PROD-011, Rule #4 | Isolation | Isolation | P2 | Garage B không thêm được ĐVT quy đổi vào mã sản phẩm của Garage A | `PROD-A-ISOFULL`(23) | 1. Đăng nhập `garage-b`.<br>2. `POST /api/v2/internal-products/23/conversion-units` `{unitCode:"UNIT_CHIEC", conversionRate:6}`. | - HTTP 404.<br>- Danh sách conversion-unit của `PROD-A-ISOFULL` (đọc bằng `garage-a`) chỉ còn đúng 1 entry gốc (`UNIT_BO`×12), không có `UNIT_CHIEC` lạ. | PASS | N/A |
| TC-W03-ISO-016 | FEAT-CAT-PROD-DETAIL | gf-inventory, agg-garage-graph | BR-CAT-PROD-015, Rule #4 | Isolation | Isolation | P1 | Garage B không thêm được tệp đính kèm vào mã sản phẩm của Garage A | `PROD-A-ISOFULL`(23) | 1. Đăng nhập `garage-b`.<br>2. `POST /api/v2/internal-products/23/attachments` `{fileName:"hacked.pdf", ...}`. | - HTTP 404.<br>- Danh sách attachment (đọc bằng `garage-a`) chỉ còn đúng 1 entry gốc (`catalog-iso-test.pdf`), không có `hacked.pdf`. | PASS | N/A |
| TC-W03-ISO-017 | FEAT-CAT-PROD-DETAIL | gf-inventory, ct-file-storage | BR-CAT-PROD-015 | Isolation | Isolation | P1 | Tệp đính kèm của Garage A không truy cập được từ context Garage B (namespace ct-file-storage) | `PROD-A-ISOFULL`(23) đã có attachment thật `fileUrl` chứa prefix `tenant-1/...` | 1. Lấy `fileUrl` attachment thuộc `garage-a`.<br>2. `GET` trực tiếp `ct-file-storage` path `tenant-1/...` KHÔNG kèm credential.<br>3. `GET` path `tenant-467/...` (sai tenant) cũng KHÔNG kèm credential. | - Kỳ vọng: phải bị từ chối/yêu cầu credential đúng tenant. | PASS (QC-manual manual-test) | **BUG-W03-104** |
| TC-W03-ISO-018 | FEAT-CAT-PROD-IMPORT | gf-inventory, agg-garage-graph | BR-CAT-PROD-017, Rule #4 | Isolation | Isolation | P1 | Import danh mục của Garage A không tạo nhầm record sang Garage B (kể cả khi header bị giả) | Token `garage-a` hợp lệ (chữ ký đúng) | 1. `garage-a` gọi `POST /api/v2/internal-products/import` 2 dòng hợp lệ (`PROD-A-IMPISO-1/2`, unit tên hiển thị "cái"), kèm header `X-Tenant-Id: 467` giả mạo.<br>2. Kiểm tra search 2 tenant. | - `importedCount=2`, cả 2 record ghi vào `tenant_id=1` (theo JWT, header bị bỏ qua).<br>- `garage-b` search "IMPISO" → **0** kết quả. | PASS | N/A |
| TC-W03-ISO-019 | FEAT-CAT-PROD-IMPORT | agg-garage-graph, gf-inventory | Rule #4 tenant isolation | Isolation | Isolation | P1 | JWT bị chỉnh sửa trái phép trường `tenant_id` — request bị từ chối, không tạo record nào | JWT hợp lệ của `garage-a` | 1. Sửa claim `custom:tenant_id` của JWT `garage-a` thành `467` (chữ ký cũ không còn khớp payload).<br>2. Gọi `POST /api/v2/internal-products/import` 1 dòng hợp lệ.<br>3. Kiểm tra DB. | - Kỳ vọng: HTTP 401, không record nào được tạo. | PASS (QC-manual manual-test) | **BUG-W03-103** |
| TC-W03-ISO-020 | FEAT-CAT-PROD-EXPORT | gf-inventory, agg-garage-graph | BR-CAT-PROD-018, AC-4 | Isolation | Isolation | P1 | Garage B export danh mục — file chỉ chứa mã sản phẩm của Garage B | `garage-b` có ≥2 mã (ISOREQ/ISOFULL) | 1. Đăng nhập `garage-b`.<br>2. `POST /api/v2/internal-products/export`.<br>3. Parse `.xlsx` tải về (`xl/sharedStrings.xml`). | - File CHỈ chứa `PROD-B-ISO*`, KHÔNG chứa bất kỳ `PROD-A-ISO*` nào (xác nhận qua kiểm tra sharedStrings.xml). | PASS | N/A |
| TC-W03-ISO-021 | FEAT-CAT-PROD-EXPORT | agg-garage-graph | R22 reverse-proxy pattern, Rule #4 | Isolation | Isolation | P1 | Download URL export ngắn hạn (TTL 60s, use-once) không bị context-confusion sang tenant khác dù ai fetch | `garage-a` mint `downloadUrl` qua BFF `exportInternalProducts` | 1. `garage-a` mint token download (chứa filter + JWT gốc lưu server-side, xem `signed-token.service.ts`).<br>2. `garage-b` fetch URL đó kèm `Authorization: Bearer <token của garage-b>`.<br>3. Kiểm tra file trả về thuộc tenant nào. | - File trả về LUÔN là data của `garage-a` (người mint) — middleware replay JWT gốc tại thời điểm mint, KHÔNG dùng JWT của request hiện tại.<br>- Đúng như thiết kế R22 (bearer-token TTL ngắn use-once) — không phải bug mới, nhưng residual risk (đã note ở BR gốc) vẫn tồn tại: ai giữ được URL trong 60s đều tải được. Không phát hiện leak vượt khỏi TTL/use-once. | PASS (observation, không phải bug mới) | N/A |
| TC-W03-ISO-022 | FEAT-CAT-PROD-CREATE, FEAT-CAT-GRP-CREATE | agg-garage-graph, gf-erp-mdm | BR-CAT-PROD-006, BR-CAT-PROD-023 | Isolation | Isolation | P2 | Dữ liệu chủ ĐVT (UNIT) và Xuất xứ (COUNTRY) dùng chung cho mọi garage — KHÔNG bị cô lập theo tenant (regression guard) | UNIT/COUNTRY thật từ `gf-erp-mdm` (xác nhận DB `mdm_catalog` không có cột `tenant_id`) | 1. Gọi `POST /protected/catalog/v1/inquiry {directory:"UNIT"}` với token `garage-a` và `garage-b`.<br>2. So sánh response. | - Response HOÀN TOÀN GIỐNG NHAU giữa 2 tenant — dữ liệu chủ dùng chung có chủ đích. | PASS | N/A |
| TC-W03-ISO-023 | FEAT-CAT-PROD-DETAIL | agg-garage-graph, gf-inventory | BR-CAT-PROD-013 | Isolation | Isolation | P2 | Tìm kiếm SKU chưa mapping (legacy `product` table) không lộ SKU của tenant khác | `garage-a` có sẵn SKU `unmapped=true` (data pre-existing từ trước run này); `garage-b` (tenant mới, chưa có SKU legacy nào) | 1. Đăng nhập `garage-b`.<br>2. `GET /api/v2/skus/search?unmapped=true`. | - Kết quả `totalElements=0` cho `garage-b` — KHÔNG lộ bất kỳ SKU nào của `garage-a`. Ghi chú: `garage-b` chưa có SKU legacy seed sẵn (data limitation của môi trường, không phải lỗi) — assertion "không leak" vẫn đúng dù trivial (rỗng thật). | PASS | N/A |
| TC-W03-ISO-024 | FEAT-CAT-GRP-LIST | agg-garage-graph, gf-inventory | Rule #4 tenant isolation | Isolation | Isolation | P1 | Header `X-Tenant-Id` giả mạo trỏ sang tenant khác không override JWT claim thật | JWT hợp lệ `garage-b` (chữ ký đúng); nhóm `GRP-A-CHILD-ISO`(28) thuộc `garage-a` | 1. `GET /api/v2/material-groups/28` với JWT `garage-b` hợp lệ **kèm** header `X-Tenant-Id: 1`. | - HTTP 404 — header bị bỏ qua hoàn toàn, JWT (hợp lệ, không tamper) là nguồn sự thật duy nhất cho tenant context. | PASS | N/A |
| TC-W03-ISO-025 | FEAT-CAT-GRP-LIST, FEAT-CAT-PROD-LIST | agg-garage-graph, gf-inventory | Rule #4, PKG §2.2.2 | Isolation | Isolation | P2 | BFF forward tenant context xuống `gf-inventory` đúng theo JWT của request | JWT hợp lệ `garage-a` | 1. Gọi `searchMaterialGroups(keyword:"ISOFULL")` qua BFF với JWT `garage-a`. | - Kết quả CHỈ chứa `GRP-A-ISOFULL` (id=24) — đúng scope `garage-a`, xác nhận BFF propagate đúng tenant context. | PASS | N/A |
| TC-W03-ISO-026 | FEAT-CAT-GRP-DETAIL | agg-garage-graph | PKG §2.2.2 TENANT-USERS, Rule #4 | Isolation | Isolation | P2 | Enrichment `createdByName`/`updatedByName` không lộ tên user cross-tenant | Nhóm `GRP-A-ISOFULL`(24), `createdBy="dev-user-001"` | 1. Gọi `getMaterialGroup(id:24)` qua BFF với token `garage-a` (cùng tenant với creator). | - `createdByName=null` — enrichment KHÔNG resolve tên cho môi trường dev/sso-stub hiện tại (không tìm thấy logic enrichment nào trong `agg-garage-graph` resolver — field luôn null kể cả same-tenant). KHÔNG phát hiện leak tên user cross-tenant (điều kiện an toàn — trường không bao giờ có giá trị để leak). **Ghi chú cho agent-test-api/functional**: field có khả năng chưa được wire — không phải phạm vi isolation bug (không có exposure), nhưng nên functional-review riêng. | PASS (với ghi chú) | N/A |
| TC-W03-ISO-027 | FEAT-CAT-PROD-DETAIL, FEAT-CAT-GRP-DETAIL | garage-web, agg-garage-graph | Rule #4 tenant isolation | Isolation | Isolation | P1 | Người dùng Garage B dán liên kết chi tiết mã sản phẩm của Garage A — không lộ dữ liệu ở tầng BFF (nguồn data cho web render) | `PROD-A-ISOFULL`(23) | 1. Gọi `getInternalProduct(id:23)` qua BFF với token `garage-b` (giả lập data-fetch khi web deep-link). | - BFF trả lỗi `"Internal product not found: 23"` — KHÔNG có data để FE render nhầm. UI rendering 404 thực tế (route/browser) thuộc `agent-test-e2e`/`agent-test-ui`, TC này chỉ đảm bảo tầng data không leak. | PASS | N/A |
| TC-W03-ISO-028 | FEAT-CAT-GRP-LIST, FEAT-CAT-PROD-LIST, FEAT-CAT-GRP-CREATE, FEAT-CAT-PROD-CREATE | gf-inventory, agg-garage-graph | Rule #4, TenantFilter integrity | Isolation | Isolation | P2 | TenantFilter active trên toàn bộ record — không có row nào miss tenant_id (DB-level full-sweep, thay thế log-grep vì actuator `/loggers` không khả dụng trong môi trường này) | Toàn bộ record `material_group` + `internal_product` hiện có trong DB | 1. Query trực tiếp DB: `SELECT count(*) FILTER (WHERE tenant_id IS NULL) FROM material_group` và tương tự `internal_product`.<br>2. Query phân phối `tenant_id` (`GROUP BY tenant_id`). | - `material_group`: 195 rows, **0** NULL tenant_id, phân phối chỉ gồm `{1: 193, 467: 3}`.<br>- `internal_product`: 21 rows, **0** NULL tenant_id, phân phối `{1: 19, 467: 2}`.<br>- KHÔNG có tenant_id lạ nào ngoài 1/467 — xác nhận TenantFilter/service layer set đúng tenant_id ở MỌI write, không có request nào miss. | PASS | N/A |

---

## 5. Self-Audit Record

### Common Baseline Self-Audit (§Common Test Case Baseline gate)

| Checklist Item | Áp dụng cho isolation W03? | Coverage trong auto artifact | Verdict |
|---|---|---|---|
| Đã có TC không có token (401) | `out-of-scope` → `agent-test-security` | N/A | PASS |
| Đã có TC token hết hạn (401) | `out-of-scope` → `agent-test-security` | N/A | PASS |
| Đã có TC token sai/giả mạo (401) — nhánh `tenant_id` tampered | `adapted` — TC-W03-ISO-019 | covered | **FAIL — BUG-W03-103 (P1, release-blocking)** |
| Đã có TC không có quyền (403/404) cross-tenant | `adapted` — TC-W03-ISO-003/004/005/010/011/012/013/014/015/016 | covered | PASS |
| Đã có TC IDOR cross-tenant (API-AA06) | `covered` | TC-W03-ISO-003/004/005/010/011/012/013/016 | PASS |
| Mismatched `X-Tenant-Id` header vs JWT (Rule #4) | `covered` | TC-W03-ISO-024, TC-W03-ISO-025 | PASS |
| E2E-PM01..PM04 permission flows | `out-of-scope` (trừ TC-W03-ISO-027) | N/A ngoại trừ ISO-027 (PASS) | PASS |
| Namespace/storage isolation (ct-file-storage) | `covered` | TC-W03-ISO-016 (PASS), TC-W03-ISO-017 | **FAIL — BUG-W03-104 (P1, release-blocking)** |
| Nhánh `allowed` | `covered` | TC-W03-ISO-001/007/008/020/022/023/029..036 | PASS |
| Nhánh `denied cross-tenant` | `covered` | TC-W03-ISO-002/003/004/005/006/009/010/011/012/013/014/015/016/018/027 | PASS |
| Nhánh `mismatched-context` | `covered` | TC-W03-ISO-021 (PASS), TC-W03-ISO-024 (PASS), TC-W03-ISO-019 (FAIL) | **1/3 FAIL — xem BUG-W03-103** |

**Kết luận Common Baseline**: 2 mandatory item có FAIL confirmed — theo Forbidden Actions của agent contract, đây là `P1` release-blocking, KHÔNG được tự động đóng, KHÔNG được coi là lỗi nhẹ. Đã log đầy đủ 3-layer: `Tracking/WAVE03/BUGS.md` (L1: `BUG-W03-103`, `BUG-W03-104`), `Tracking/WAVE03/verify/BUG-W03-103.verify.md` + `BUG-W03-104.verify.md` (L2), `Tracking/WAVE03/repro/BUG-W03-103.sh` + `BUG-W03-104.sh` (repro).

### Auto vs Manual Parity Self-Audit (§Auto vs Manual Parity Audit gate)

Không đổi so với TEST_PLANNING: tất cả 14 manual TC đã ánh xạ sang auto TC, **0 `auto-miss`**. 8 case data-mới (TC-029..036) là bổ sung theo yêu cầu batch run, không phải case parity-gap từ manual — không cần lesson-learn entry riêng cho việc này (không phải miss, là enhancement theo yêu cầu cụ thể của lượt chạy).

### Isolation-Specific Active Lessons Applied

| Lesson ID | Applied trong W03? |
|---|---|
| TL-W01-ISO-001 | YES — token `garage-b` forge JWT HS256, reuse pattern W01/W02. |
| TL-W01-ISO-002 | YES — mobile isolation không cần riêng, cover qua BFF layer. |
| TL-W01-ISO-003 | YES — auto phủ rộng hơn manual (36 vs 14 TC) là expected behavior. |
| TL-W01-ISO-004 | YES — áp dụng ngay tại TEST_EXECUTION lần này: 2 bug mới log với đầy đủ L1/L2/repro, sẵn sàng cho Bug Verification Loop khi FIX_DONE. |
| TL-W02-ISO-001 | YES — dùng curl/python trực tiếp thay Jest harness (Bash không bị chặn trong session này, không cần fallback docker-exec). |
| **[MỚI] TL-W03-ISO-001** | **Đề xuất lesson mới**: JWT signature KHÔNG được verify là root cause đã biết từ W01 (`BUG-W01-227/228`) nhưng bị đóng `INVALID out-of-scope` 2 lần liên tiếp (W01, W02) chỉ vì lý do "chưa có scope Security" — không phải vì đã fix. W03 là lần đầu pattern này được test trên `gf-inventory` VÀ lần đầu chứng minh được cross-tenant WRITE (không chỉ READ). Khuyến nghị wave sau: (a) escalate thành platform-level fix ưu tiên cao thay vì để mỗi wave phát hiện lại cùng 1 gap, (b) khi Security CÓ trong scope batch (như lần này), KHÔNG được đóng `INVALID out-of-scope` nữa vì lý do đó không còn hợp lệ. |
| **[MỚI] TL-W03-ISO-002** | **Đề xuất lesson mới**: `ct-file-storage` simulator (`gf-sims` port 45888) là generic stub trả 200 cho mọi path chưa implement — đã gây false-negative tiềm ẩn 2 lần (W02 `BUG-W02-ISO-001`, W03 `BUG-W03-104`). Khuyến nghị: escalate thành 1 platform-level fix ở tầng simulator (route thật enforce tenant-prefix check) thay vì tiếp tục phát hiện lại ở mỗi wave có tính năng file mới. |

**Kết luận**: Common Baseline có 2 mandatory FAIL (đã xử lý đúng quy trình: log P1, không auto-close). Parity Audit PASS. Artifact ở trạng thái **TEST_EXECUTION HOÀN TẤT — 2 P1 OPEN cần Platform/Security review trước khi release**.

---

## 6. Changelog

| Date | Version | Change | Author |
|---|---|---|---|
| 2026-07-02 | 1 | Khởi tạo (TEST_PLANNING) — 28 TC tenant isolation cho W03. Common Baseline Coverage Map + Auto vs Manual Parity (14/14 covered, 0 auto-miss). | agent-test-isolation |
| 2026-07-02 | 2 | **TEST_EXECUTION** — chạy thật 36 TC (28 gốc + 8 case data-mới TC-029..036 bổ sung theo yêu cầu batch: required-only/full-fields cho Material Group + Internal Product, cả 2 tenant, dữ liệu tạo mới hoàn toàn không tái dùng seed cũ). Kết quả: **34 PASS, 2 FAIL (P1)**. `TC-W03-ISO-019` FAIL — JWT signature không được verify, `custom:tenant_id` claim giả mạo được chấp nhận cho cả READ và WRITE cross-tenant → `BUG-W03-103`. `TC-W03-ISO-017` FAIL — `ct-file-storage` simulator không enforce tenant namespace/ACL, tái diễn `BUG-W02-ISO-001` → `BUG-W03-104`. Cả 2 bug đã file đủ 3-layer (L1 `Tracking/WAVE03/BUGS.md`, L2 verify `Tracking/WAVE03/verify/`, repro script `Tracking/WAVE03/repro/`), đánh dấu P1 release-blocking, KHÔNG auto-close. Cập nhật Preconditions/Steps của các TC còn lại để phản ánh đúng ID/code thực tế đã tạo trong run này (thay placeholder generic bằng dữ liệu thật). Bổ sung 2 lesson-learn candidate (TL-W03-ISO-001/002) về pattern lặp lại của 2 bug này qua nhiều wave. | agent-test-isolation |
