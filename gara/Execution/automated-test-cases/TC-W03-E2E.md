---
document_id: 'GMS-TC-W03-E2E'
type: automated-test-case
parent: 'Execution/automated-test-cases/'
status: EXECUTED
version: 3
boundary: 'garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm, gf-purchase, gf-sales, ct-file-storage, ct-saas-tenant'
wave: 'W03'
owner: 'agent-test-e2e'
last_reviewed: '2026-07-02'
qa_reviewed_by: 'cuongnguyen_ac@cardoctor.vn'
qa_reviewed_at: '2026-07-02'

drift_impact:
  - report: 'Execution/tracking/drift-impact/W03-2026-07-03T15-02-35Z.md'
    timestamp: '2026-07-03T15:02:35+00:00'
    impacted_ids: ['FEAT-CAT-GRP-CREATE', 'FEAT-CAT-PROD-CREATE', 'FEAT-CAT-PROD-DETAIL', 'FEAT-CAT-PROD-EDIT', 'FEAT-ID-CREATE-V2', 'FEAT-IR-CREATE-V2', 'TC-W03-E2E-A01', 'TC-W03-E2E-A08', 'TC-W03-E2E-A09', 'TC-W03-E2E-A10', 'TC-W03-E2E-A11', 'TC-W03-E2E-A12', 'TC-W03-E2E-A21', 'TC-W03-E2E-A22', 'TC-W03-E2E-B01', 'TC-W03-E2E-B08', 'TC-W03-E2E-B09', 'TC-W03-E2E-B10', 'TC-W03-E2E-B11', 'TC-W03-E2E-B12', 'TC-W03-E2E-B13', 'TC-W03-E2E-B14', 'TC-W03-E2E-B15', 'TC-W03-E2E-B16', 'TC-W03-E2E-B17', 'TC-W03-E2E-B18', 'TC-W03-E2E-B19', 'TC-W03-E2E-B20', 'TC-W03-E2E-B21', 'TC-W03-E2E-B22', 'TC-W03-E2E-B23', 'TC-W03-E2E-B26', 'TC-W03-E2E-B27', 'TC-W03-E2E-B28', 'TC-W03-E2E-B29', 'TC-W03-E2E-B30', 'TC-W03-E2E-T03', 'TC-W03-E2E-T04', 'TC-W03-E2E-T05', 'TC-W03-E2E-T07', 'TC-W03-E2E-T08']

---

# Test Case Automated — W03: E2E Web (EP-INVENTORY-CATALOG — Danh mục vật tư)

> Sinh bởi `agent-test-e2e` tại `TEST_PLANNING` (full-gen mode, lần đầu cho artifact này —
> `Execution/automated-test-cases/TC-W03-E2E.md` chưa tồn tại trước wave này).
> Cross-ref manual (read-only): `Execution/test-cases/TC-W03-E2E.md` — 31 TC (`QA Authority`),
> trong đó 4 TC cross-platform sync (015-018) đã split sang `TC-W03-MOBILE-E2E.md` và 2 TC
> mobile-only (026-027) housed trong file web nhưng thuộc territory `agent-test-mobile-e2e`.
> Cross-ref mobile automated: `Execution/automated-test-cases/TC-W03-MOBILE-E2E.md` (49 TC,
> `agent-test-mobile-e2e`) — Group CRUD full mobile + Product view-only + cross-platform sync.
> Work Package: `Execution/work-packages/PKG-W03-inventory-catalog.md` §2.2.3 (Web) + §4.3 + §5.

---

## 1. General Info

| Field | Value |
|---|---|
| Document ID | `GMS-TC-W03-E2E` |
| Wave | W03 |
| Boundary(ies) | `garage-web`, `agg-garage-graph`, `gf-inventory`, `gf-erp-mdm`, `gf-purchase`, `gf-sales`, `ct-file-storage`, `ct-saas-tenant` |
| Feature(s) | `FEAT-CAT-GRP-LIST`, `FEAT-CAT-GRP-CREATE`, `FEAT-CAT-GRP-DETAIL`, `FEAT-CAT-GRP-EDIT`, `FEAT-CAT-GRP-DELETE`, `FEAT-CAT-PROD-LIST`, `FEAT-CAT-PROD-CREATE`, `FEAT-CAT-PROD-DETAIL`, `FEAT-CAT-PROD-EDIT`, `FEAT-CAT-PROD-DELETE`, `FEAT-CAT-PROD-IMPORT`, `FEAT-CAT-PROD-EXPORT` |
| Owner | `agent-test-e2e` |
| Last Reviewed | 2026-07-02 |
| Work Package | `Execution/work-packages/PKG-W03-inventory-catalog.md` |

---

## 2. Scope

### In Scope (Web E2E — Playwright live browser)

- **Material Group full CRUD journey** — List trải phẳng (R29, có phân trang) → Search/Filter → Create → Detail → Edit (kèm cascade INACTIVE) → Delete chain.
- **Internal Product full journey** — List → Search/Filter/Pagination → Create (4 tab: Thông tin chung / ĐVT quy đổi / Mã SKU / Đính kèm file) → Detail (tab management) → Edit → Delete.
- **Bulk import journey** — Upload `.xlsx` → preview kiểm tra dữ liệu → xác nhận → kết quả (Tạo mới/Bỏ qua-lỗi) → tải file lỗi.
- **Cap defense journey** — Import > 500 dòng → `ERR-INV-041`; Export > 1.000 dòng → `ERR-INV-045`.
- **Export single-call journey** — Trigger export → blob download → verify cột + dữ liệu theo filter (R22).
- **Conversion-unit validation journey** — `ERR-INV-013` (≤0) / `ERR-INV-014` (trùng) / `ERR-INV-047` (>6 chữ số thập phân).
- **Exception & Timeout journey pool** (Group T) — cascade rollback atomicity, optimistic concurrency, delete-then-recreate, race SKU mapping, concurrent attachment upload, concurrent import, network timeout/5xx, session expiry mid-flow.
- **Cross-cutting/regression/deep-flow** — permission 2-role parity, TENANT-USERS enrichment, auth/tenant propagation, i18n wording, DataLoader N+1 sanity, audit completeness, regression Procurement (`gf-purchase`) + Retail (`gf-sales`) zero-break (ADR-017), co-located sidebar regression, browser back/forward.
- **Cross-platform parity reference** — 7 màn dùng chung mobile (Group CRUD full + Product view-only): web E2E cover happy path đầy đủ ở đây; mobile-specific assertions (native gesture, BottomSheet vs Modal) thuộc `agent-test-mobile-e2e` (xem parity audit §Test Environment & Data).

### Out of Scope

- Mobile journey (Flutter/Patrol) → `TC-W03-MOBILE-E2E.md` (`agent-test-mobile-e2e`).
- UI render/wording pixel-isolated từng màn, component-level validation exhaustive → `TC-W03-UI.md` (`agent-test-ui`).
- API contract / GraphQL SDL / status code exhaustive / DataLoader SLA số liệu chính xác → `TC-W03-API.md` (`agent-test-api`).
- Cross-tenant denial thật (garage-a vs garage-b) → `TC-W03-ISOLATION.md` (`agent-test-isolation`).
- OWASP/injection/XXE trong import parser → `agent-test-security`.
- SLO p95 latency số liệu chính xác (list 1000 nhóm/10000 SP, import/export 5000 dòng) → `agent-test-performance`. R05 trong artifact này chỉ là sanity N+1 correctness, KHÔNG thay perf wave.
- W04-W06 downstream (phiếu nhập/xuất kho V2, tồn kho, tính giá) — chỉ giữ 1 placeholder sanity (B26) theo manual TC-021.
- Create từ phiếu nhập/xuất kho AC-1b (`FEAT-CAT-PROD-CREATE`) — phụ thuộc `FEAT-IR-CREATE-V2`/`FEAT-ID-CREATE-V2` (Receipt/Delivery V2, ship W05) CHƯA tồn tại ở W03 → `out-of-wave`, không sinh TC (xem Coverage Accounting).

### Test Environment & Data

| Item | Required Data / Setup | Notes |
|---|---|---|
| Runner (Layer A frozen, CR-20260701-03) | `Execution/auto/harness/playwright/` — reuse nguyên trạng, KHÔNG sửa `playwright.config.ts`, KHÔNG tạo config `pw-w03-*.config.ts` mới | `npm install` (đã cài) → `BASE_URL=... npx playwright test W03/e2e` (CLI positional filter) |
| baseURL | `http://localhost:45300` (local) hoặc `http://192.168.110.191:45300` (remote-box) qua `BASE_URL` env | KHÔNG hardcode IP máy cụ thể trong spec — đã tuân theo `playwright.config.ts` |
| SSO/BFF proxy (remote-box) | `SSO_HOST` (mặc định `http://192.168.110.191:45410`) + `BFF_HOST` (mặc định `http://192.168.110.191:45401`) — `_helpers.ts` cài `page.route()` forward | Kế thừa TL-W02-E2E-008/009: React bundle hardcode `localhost:45410`/`45401` |
| NODE_PATH (macOS arm64) | `NODE_PATH="./node_modules" npx playwright test` từ harness dir | TL-W02-E2E-007 |
| Chromium GPU crash guard | Đã bake sẵn trong `playwright.config.ts` (`--disable-gpu --disable-software-rasterizer --no-sandbox ...`) | TL-W02-E2E-012 / BUG-W02-117 |
| Smoke preflight | `npx playwright test --project=probe probes/smoke.spec.ts` trước khi chạy suite W03 | Chứng minh browser launch + app load thật |
| Account kế toán | `0810000002` / `Test@12345` — tenant `garage-a` | Seed user dùng chung W01/W02 |
| Account chủ garage | `0810000001` / `Test@12345` — tenant `garage-a` | Dual persona parity (R01) |
| Master data | `UNIT` (PCS/BOX/KG) + `COUNTRY` (VNM/USA/JPN/CHN/DEU) seeded trong `gf-erp-mdm` | Cần cho Create/Import/Detail render |
| `SEED_UNMAPPED_SKU_ID` | 1 SKU chưa mapping mã nội bộ nào | Cho A01(product tab)/B01/B15/T04 |
| `SEED_MAPPED_SKU_ID` | 1 SKU đã mapping mã nội bộ khác | Cho B15 (assert "Đã mapping mã khác" không chọn được) |
| `SEED_PRODUCT_WITH_TXN` / `SEED_PRODUCT_WITH_TXN_CONVERSION` | Mã SP đã phát sinh giao dịch / đã có ĐVT quy đổi giao dịch | Cho B17/B21/B25 |
| `SEED_PRODUCT_WITH_SKU` / `SEED_PRODUCT_WITH_ATTACHMENT` | Mã SP đã gắn ≥1 SKU / đã có ≥1 attachment | Cho B18/B19 |
| `SEED_PRODUCT_NEAR_CAP_CODE` | Mã SP đã có 3/5 attachment (còn 2 slot) | Cho T05 |
| `SEED_PRODUCT_IN_INACTIVE_GROUP` | Mã SP thuộc nhóm vừa chuyển Ngừng hoạt động | Cho B26 (manual TC-021 downstream sanity) |
| `SEED_PRODUCT_A_CODE` / `SEED_PRODUCT_B_CODE` | 2 mã SP khác nhau dùng cho race SKU | Cho T04 |
| `SEED_NEW_COUNTRY_LABEL` | Master `COUNTRY` mới thêm trước test (vd "Hàn Quốc") | Cho B27 |
| `SEED_IMPORT_MIX_100` | File `.xlsx` 100 dòng (95 hợp lệ + 5 lỗi mix ERR-INV-007/012/042/043/044) | Cho C01/C05 |
| `SEED_IMPORT_501_ROWS` | File `.xlsx` 501 dòng | Cho C02 |
| `SEED_ROUNDTRIP_FILE` | File export đã chỉnh sửa (9 dòng trùng + 1 dòng mới) | Cho C04 |
| `SEED_IMPORT_FILE_A` / `SEED_IMPORT_FILE_B` | 2 file `.xlsx` 50 dòng, mã không trùng nhau | Cho T06 |
| `BIG_TENANT_BASE_URL` | Tenant `garage-test-big` > 1.000 mã ACTIVE | Cho D02 |
| `EMPTY_TENANT_BASE_URL` | Tenant garage rỗng catalog (chưa có nhóm/mã nào) | Cho A06/B06 |
| `SEED_LEGACY_PROCUREMENT_SKU` / `SEED_LEGACY_RETAIL_SKU` | SKU legacy đang dùng bởi Quotation/PO + Retail SO | Cho R07/R08 (ADR-017 zero-break) |
| `LOG_AGGREGATOR_ENDPOINT` | Endpoint grep log 4 service theo `x-request-id` | Cho R03 (nếu absent → `BLOCKED-by-harness` riêng TC này, không chặn cả cluster) |
| Excel/file test khác | PDF 5MB + JPG 1MB + EXE 100KB + file vượt 30MB | Attachment E2E (B16/B28) |

**Cluster (C1 → C3, minimum-valid-per-TC):**

| Cluster | Định nghĩa | TC nhóm |
|---|---|---|
| C1 | Single-session happy/unhappy path trên stack đã seed, không cần DB/audit verify riêng | Search/filter/pagination/empty-state/i18n/field-validation (A02-A06, A08, A09, A11, A12, A16, A20, B02-B09, B11, B12, B13, B14, B23, C03, C05, R04) |
| C2 | C1 + DB/audit/outbox verification | Happy-path CRUD chính, Detail/Edit/Delete có side-effect kiểm chứng (A01, A07, A10, A13-A15, A17-A19, B01, B10, B15-B22, B24-B28, C01, C04, D01, D02, R01, R02, R05, R06) |
| C3 | C2 + second session/concurrency/mock-network/regression cross-boundary | T01-T08, C02, R03, R07, R08, R09, R10 |

**Common Baseline Coverage Map (`common-testcase-e2e.md` §1-12 — sàn tối thiểu):**

| Common Group | Trạng thái | TC(s) | Ghi chú |
|---|---|---|---|
| §1 Authentication (login/logout/RBAC menu) | `out-of-scope+lý do` | — | Không thay đổi auth flow ở W03 (baseline W01); RBAC menu-level đã cover xuyên `Danh mục` mới ở R09 |
| §1 Idle timeout / session expiry | `adapted` | T08 | Session expiry giữa lúc tạo mã sản phẩm |
| §2.1 Create | `covered` | A01, A08-A12, B01, B08-B15, C01 | |
| §2.2 Read/Detail | `covered` | A07, B16-B18 | |
| §2.3 Update | `covered` | A13-A18, B19-B21 | |
| §2.4 Delete | `covered` | A19, A20, T03, B22, B23 | |
| §3 Search & Filter | `covered` | A02-A06, B02-B03, B06-B07 | |
| §4 Pagination | `covered` | B04 (Product list phân trang tường minh AC-7); Group list phân trang implicit qua A01/A02 | |
| §5 File Upload/Download | `covered` | B15 (attachment cap/format), B18 (detail attachment), B25 (presigned URL), C01/C03 (import file), D01 (export file) | |
| §6 Permission/Role-based | `covered` | R01 | |
| §7 Navigation back/forward | `covered` | R10 | |
| §8 Notification & real-time | `adapted` | (embedded trong mọi CRUD TC — toast/snackbar assertion) | Không có push/badge real-time trong catalog feature |
| §9 Concurrent/multi-tab | `covered` | T02, T04, T05, T06 | |
| §10 Client-server connectivity | `covered` | T01, T07 | |
| §11 Email/notification triggers | `out-of-scope+lý do` | — | Catalog CRUD không trigger email |
| §12 Performance sanity | `adapted` | R05 (correctness sanity DataLoader N+1) | SLA số liệu chính xác → `agent-test-performance` |

**Impacted production journeys + Deep flow trace (Step 3.1):**

- Backend `gf-inventory` thêm 6 bảng mới cùng boundary với schema legacy `product`/SKU dùng bởi Procurement (`gf-purchase`) và Bán lẻ phụ tùng (`gf-sales`) — ADR-017 cam kết "zero break". Regression TC: **R07** (Procurement), **R08** (Retail).
- Sidebar web thêm menu group mới **"Danh mục"** (append cuối `layouts/home/modules/constants.ts`) — co-located regression cho menu/route hiện có. Regression TC: **R09**.
- Deep flow trace theo UX-FLOW-INVENTORY-CATALOG §3.1/§3.2/§3.4 + FEAT AC của 12 feature: cross-feature journey (Group cascade → Product dropdown reflect ACTIVE-only), chuỗi state transition (ACTIVE→INACTIVE→re-ACTIVE không cascade ngược), exception/timeout đầy đủ 8 nhánh (Group T), observable end state đa-layer (UI/BFF/DB) xuyên mọi TC C2/C3.

**Co-located Journey Regression Inventory (Step 3.2):**

| Screen | Existing journey co-located | Impact CR/W03 | Regression TC | Cluster |
|---|---|---|---|---|
| Sidebar toàn app (`layouts/home/modules/constants.ts`) | Toàn bộ menu group hiện có (Lịch hẹn/Booking, Phiếu dịch vụ/SO, Kho hàng V1 Receipt/Delivery/Stock, Purchase, Chat...) | LOW — "Danh mục" append cuối mảng, không sửa item hiện có, nhưng cần verify sidebar không vỡ layout/thứ tự khi thêm group mới | R09 | C1 |
| `gf-inventory` DB schema (6 bảng mới cùng boundary) | Quotation/PO tạo mới dùng SKU legacy (`gf-purchase`) | MEDIUM — cùng boundary DB, ADR-017 yêu cầu zero-break | R07 | C3 |
| `gf-inventory` DB schema (6 bảng mới cùng boundary) | Tạo phiếu bán lẻ phụ tùng dùng SKU legacy (`gf-sales`) | MEDIUM — cùng boundary DB, ADR-017 yêu cầu zero-break | R08 | C3 |
| `SelectSuggestedMaterialGroup` (`components/customs/select/`) | Dropdown chọn nhóm cha dùng chung giữa Create + Edit form | LOW — component mới cho epic này, không reuse từ feature khác | Cover trực tiếp qua A12/A15 | C1/C2 |

**Auto vs Manual Parity Audit (journey level — nguồn manual `Execution/test-cases/TC-W03-E2E.md`, 31 TC):**

| Manual TC | Auto TC ref | Nhãn |
|---|---|---|
| TC-W03-E2E-001 (Luồng chính 3 cấp) | A01 | `covered` |
| TC-W03-E2E-002 (Tạo mã SP 4 tab) | B01 | `covered` |
| TC-W03-E2E-003 (Cascade INACTIVE) | A17 | `covered` |
| TC-W03-E2E-004 (Cascade reverse) | A18 | `covered` |
| TC-W03-E2E-005 (Delete chain Group) | A19 | `covered` |
| TC-W03-E2E-006 (Delete Product cascade unmap) | B24 | `covered` |
| TC-W03-E2E-007 (Delete Product block) | B25 | `covered` |
| TC-W03-E2E-008 (Import 100 mix) | C01 | `covered` |
| TC-W03-E2E-009 (Import cap 501) | C02 | `covered` |
| TC-W03-E2E-010 (Export filter 11 cột) | D01 | `covered` |
| TC-W03-E2E-011 (Export cap 1000) | D02 | `covered` |
| TC-W03-E2E-012 (Round-trip export→import) | C04 | `covered` |
| TC-W03-E2E-013 (Permission 2 role) | R01 | `covered` |
| TC-W03-E2E-014 (TENANT-USERS audit) | R02 | `covered` |
| TC-W03-E2E-015..018 | — | `covered-by-other-agent` — split sang `TC-W03-MOBILE-E2E.md`, giữ nguyên TC ID theo quy ước wave-tc-adapter (đã dedup — không tính miss ở đây) |
| TC-W03-E2E-019 (Race SKU) | T04 | `covered` |
| TC-W03-E2E-020 (Cascade rollback atomicity) | T01 | `covered` |
| TC-W03-E2E-021 (Product trong nhóm INACTIVE, W05 placeholder) | B26 | `covered` |
| TC-W03-E2E-022 (gf-erp-mdm dependency Xuất xứ) | B27 | `covered` |
| TC-W03-E2E-023 (Attachment presigned URL) | B28 | `covered` |
| TC-W03-E2E-024 (Auth header propagation) | R03 | `covered` |
| TC-W03-E2E-025 (i18n hardcode VN) | R04 | `covered` |
| TC-W03-E2E-026 (Mobile flat list Q2 check) | — | `covered-by-other-agent` — mobile-native journey (Anti-Duplication Routing → `agent-test-mobile-e2e`), housed ở file web theo convention QA Authority; adopted vào `TC-W03-MOBILE-E2E.md` (TC-W03-ME2E-044) |
| TC-W03-E2E-027 (Mobile view-only enforce) | — | `covered-by-other-agent` — tương tự 026, adopted TC-W03-ME2E-031/032 |
| TC-W03-E2E-028 (Concurrent import) | T06 | `covered` |
| TC-W03-E2E-029 (DataLoader N+1) | R05 | `covered` |
| TC-W03-E2E-030 (Audit completeness) | R06 | `covered` |
| TC-W03-E2E-031 (Optimistic concurrency Edit) | T02 | `covered` |
| TC-W03-E2E-032 (Delete-then-recreate) | T03 | `covered` |
| TC-W03-E2E-033 (Concurrent attachment upload) | T05 | `covered` |
| TC-W03-E2E-034 (Regression Procurement) | R07 | `covered` |
| TC-W03-E2E-035 (Regression Retail) | R08 | `covered` |

Không còn `auto-miss` chưa phân loại sau parity diff (29/29 manual TC trong phạm vi web-scope map được `covered`; 6 TC ID còn lại — 015-018/026/027 — đã `covered-by-other-agent` theo Anti-Duplication Routing, KHÔNG tính miss).

**Self-Audit Record (gate trước `READY`):**

- **Common Baseline Checklist Review** (`common-testcase-e2e.md` §"Checklist Review — Khi Review TC E2E Đã Viết"): (a) happy path đầy đủ ✓ A01/B01/C01/D01; (b) login/logout+quyền truy cập ✓ R01 (out-of-scope phần login mới vì không đổi ở W03, có note); (c) 4 CRUD operations ✓ mọi feature; (d) Cancel/không lưu ✓ A11/A16/A20/B11; (e) xác nhận delete (dialog confirm) ✓ A19/A20/B24/B25; (f) search/filter kết quả rỗng ✓ A05/B07; (g) pagination trong context search — B04 kết hợp filter; (h) browser Back/Forward ✓ R10; (i) upload/download ✓ B15/B18/B25/D01/C01; (j) mất kết nối/server error ✓ T07; (k) permission user không quyền cố truy cập — cross-tenant denial routed `agent-test-isolation`, W03 chỉ giữ role-parity R01; (l) steps rõ ràng — mọi TC 1-N bước cụ thể; (m) precondition rõ ràng — cột Preconditions mọi TC. **Không còn mandatory failure mở.**
- **Regression coverage** (Coverage Depth Gate §1): mọi journey bị tác động (sidebar, gf-inventory DB schema shared) có ≥1 TC `regression` — R07/R08/R09.
- **Deep journey coverage** (Coverage Depth Gate §2): cross-feature journey (cascade→dropdown reflect), state transition chain (ACTIVE↔INACTIVE), 8 nhánh exception/timeout (Group T) — đủ, không dừng ở happy path.
- **Co-located Journey Regression Inventory** (Step 3.2): đủ 4 dòng, mỗi dòng Impact ≠ none có ≥1 regression TC (R07/R08/R09; dòng LOW component dùng chung có cover trực tiếp).
- **Auto vs Manual Parity**: 29/29 web-scope map `covered`; 0 `auto-miss` chưa phân loại.
- **Drift/observation ghi nhận qua source-read (KHÔNG dùng để kết luận PASS/FAIL — chỉ note cho TEST_EXECUTION)**:
  - **A15** — FEAT-CAT-GRP-EDIT v5 (2026-07-02) chốt khoá field "Thuộc nhóm" trên form sửa; code `MaterialGroupFormPage.tsx` hiện CHƯA truyền `disabled={isEdit}` cho `SelectSuggestedMaterialGroup` (chỉ có `excludeId` loại chính nó). UX-FLOW-INVENTORY-CATALOG EC-3 (v10) cũng còn mô tả hành vi cũ (cho đổi nhóm cha, chặn vòng lặp) — STALE so với FEAT v5. Theo `DESIGN-SOURCE-POLICY`, FEAT là nguồn đúng cho hành vi nghiệp vụ → TC A15 assert theo FEAT v5 (khoá field). Nếu Playwright live run FAIL, đây là bug hợp lệ (spec-vs-implementation gap), không phải lỗi test.
  - **B16** — `ERROR-CODE-REGISTRY.md` dòng 68 (`ERR-CMN-004`) vẫn ghi message "File quá lớn (tối đa 10MB)" nhưng `FEAT-CAT-PROD-CREATE` v12 (2026-06-29) chốt cap 30MB riêng cho W03 catalog; đồng bộ registry là follow-up dual-owner CR CHƯA áp dụng. TC B16 assert theo cap 30MB (FEAT — nguồn business); message text cụ thể cần verify thực tế khi chạy live.

---

## 3. Status Summary

| Coverage Mode | Total | Status Summary |
|---|---|---|
| Automated | 77 (73 gốc + 4 bổ sung data-mới required-only/full-fields A21/A22/B29/B30, xem §7 changelog v3) | **Run 1 (2026-07-02, live Chromium, remote-box)**: 14 PASS / 39 FAIL / 24 BLOCKED-by-harness (seed env var absent) / 0 SKIPPED-tự-ý. 2 bug SẢN PHẨM thật được file (`BUG-W03-117` P1 ĐVT đơn vị tính không khớp master; `BUG-W03-118` P2 data-testid Internal Product chưa wire). Phần lớn FAIL còn lại là spec-locator gap (race điều hướng/ambiguous option text) đã sửa MỘT PHẦN trong session — xem TR-W03-E2E.md §4 + Lesson Learned TL-W03-E2E-001..004 để re-run wave sau. |
| Manual | 31 (`TC-W03-E2E.md`) | 31 READY tổng; 29 web-scope map vào auto artifact này, 2 mobile-only (026/027) + 4 cross-platform (015-018) thuộc `agent-test-mobile-e2e` — xem Parity Audit |

---

## 4. Test Cases

### Nhóm A — Material Group (FEAT-CAT-GRP-LIST/CREATE/DETAIL/EDIT/DELETE) — 20 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-A01 | FEAT-CAT-GRP-CREATE, FEAT-CAT-GRP-LIST | garage-web, agg-garage-graph, gf-inventory | AC-1 (LIST), AC-1/AC-4/AC-8 (CREATE) | E2E | Smoke | P1 | C2 | Kế toán tạo cây nhóm 3 cấp (cha→con→cháu) — List trải phẳng hiển thị đúng "Thuộc nhóm" | Tenant `garage-a`, đăng nhập kế toán | 1. Mở `/inventory-catalog/material-groups`.<br>2. Tạo `GRP-A` (không nhóm cha).<br>3. Tạo `GRP-A1` (Thuộc nhóm = GRP-A).<br>4. Tạo `GRP-A11` (Thuộc nhóm = GRP-A1).<br>5. Search theo suffix, quan sát list. | - Cả 3 nhóm tạo thành công (toast).<br>- List trải phẳng: mỗi nhóm 1 dòng độc lập, KHÔNG indent/expand-collapse (R29).<br>- Cột "Thuộc nhóm": GRP-A trống, GRP-A1="GRP-A", GRP-A11="GRP-A1".<br>- DB tenant `garage-a` có 3 record `material_group` mới. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A02 | FEAT-CAT-GRP-LIST | garage-web, agg-garage-graph | AC-4 | E2E | Wave | P2 | C1 | Tìm kiếm nhóm theo mã/tên (LIKE) | List có ≥1 nhóm biết trước mã | 1. Nhập từ khoá khớp 1 phần mã.<br>2. Quan sát kết quả. | - List chỉ hiển thị nhóm khớp LIKE trên mã hoặc tên.<br>- BFF gọi `searchMaterialGroups` (Q1) với `keyword`. | PASS | N/A |
| TC-W03-E2E-A03 | FEAT-CAT-GRP-LIST | garage-web | AC-5 | E2E | Wave | P2 | C1 | Lọc theo trạng thái (Tất cả/Đang HĐ/Ngừng HĐ) | List có nhóm ACTIVE + INACTIVE | 1. Chọn bộ lọc "Ngừng hoạt động".<br>2. Quan sát list. | - Chỉ nhóm INACTIVE hiển thị.<br>- Mặc định filter là "Đang hoạt động" khi mở màn lần đầu. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A04 | FEAT-CAT-GRP-LIST | garage-web | AC-6 | E2E | Wave | P2 | C1 | Lọc theo nhóm cha "Thuộc nhóm" | Tenant có ≥2 cấp nhóm | 1. Chọn 1 nhóm cha ở bộ lọc "Thuộc nhóm".<br>2. Quan sát list. | - List chỉ hiển thị nhóm con trực tiếp của nhóm cha đã chọn.<br>- Chỉ chọn được 1 nhóm cha tại 1 thời điểm. | PASS | N/A |
| TC-W03-E2E-A05 | FEAT-CAT-GRP-LIST | garage-web | EC-4 | E2E | Wave | P3 | C1 | Tìm kiếm/lọc không khớp dòng nào | List có dữ liệu | 1. Nhập từ khoá không tồn tại.<br>2. Quan sát empty state. | - Empty state text "Không tìm thấy kết quả phù hợp" (phân biệt EC-1).<br>- Thanh tìm kiếm + bộ lọc + nút "Thêm Nhóm VT/HH" vẫn hiển thị. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A06 | FEAT-CAT-GRP-LIST | garage-web | EC-1 | E2E | Wave | P3 | C1 | Tenant mới chưa có nhóm nào | `EMPTY_TENANT_BASE_URL` — tenant sạch catalog | 1. Mở màn List trên tenant rỗng.<br>2. Quan sát empty state. | - Empty state text "Không có dữ liệu".<br>- Thanh tìm kiếm + bộ lọc + nút "Thêm Nhóm VT/HH" vẫn giữ (để tạo bản ghi đầu tiên). | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-A07 | FEAT-CAT-GRP-DETAIL | garage-web, agg-garage-graph | AC-1, AC-2, AC-3 | E2E | Smoke | P1 | C2 | Xem chi tiết nhóm — 6 field + audit | Nhóm có đủ dữ liệu (mô tả, nhóm cha) | 1. Tap icon Xem (hoặc tên nhóm).<br>2. Quan sát màn Chi tiết. | - Hiển thị read-only: Mã/Tên/Thuộc nhóm/Trạng thái(badge)/Mô tả.<br>- Audit: Ngày tạo/Người tạo/Ngày sửa/Người sửa.<br>- Nút "Chỉnh sửa" + mũi tên quay lại (←), KHÔNG có nút "Đóng". | PASS | N/A |
| TC-W03-E2E-A08 | FEAT-CAT-GRP-CREATE | garage-web | AC-2, AC-3 | E2E | Wave | P1 | C1 | Tạo nhóm — bỏ trống Mã/Tên | Form Thêm nhóm mở | 1. Bỏ trống Mã nhóm VTHH và Tên nhóm VTHH.<br>2. Nhấn "Tạo". | - Lỗi validation bắt buộc hiển thị cho cả 2 trường.<br>- Form không submit, không toast thành công. | PASS | N/A |
| TC-W03-E2E-A09 | FEAT-CAT-GRP-CREATE | garage-web | AC-2 (EC-2 UX-FLOW) | E2E | Wave | P2 | C1 | Tạo nhóm — mã chứa ký tự đặc biệt | Form Thêm nhóm mở | 1. Nhập `GRP@#$001` vào Mã nhóm VTHH.<br>2. Nhấn "Tạo". | - Ký tự đặc biệt (`~!@#$%^&*`) bị chặn nhập hoặc báo lỗi "mã không hợp lệ" khi submit. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A10 | FEAT-CAT-GRP-CREATE | garage-web, gf-inventory | AC-7 | E2E | Wave | P1 | C2 | Tạo nhóm — mã trùng | Nhóm với mã X đã tồn tại | 1. Tạo nhóm mã X thành công.<br>2. Tạo lại nhóm khác với cùng mã X.<br>3. Nhấn "Tạo". | - Lỗi "Mã nhóm đã tồn tại" hiển thị tại trường Mã.<br>- Không lưu, form vẫn mở. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A11 | FEAT-CAT-GRP-CREATE | garage-web | AC-9 | E2E | Wave | P2 | C1 | Tạo nhóm — Huỷ bỏ | Form Thêm nhóm đã điền dữ liệu | 1. Điền Mã+Tên.<br>2. Nhấn "Huỷ bỏ". | - Form đóng, không lưu dữ liệu.<br>- Search lại mã vừa nhập → "Không tìm thấy kết quả phù hợp". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A12 | FEAT-CAT-GRP-CREATE | garage-web, gf-inventory | AC-4, BR-CAT-GRP-008 | E2E | Wave | P2 | C2 | Tạo nhóm — dropdown "Thuộc nhóm" chỉ liệt kê ACTIVE | Tenant có ≥1 nhóm INACTIVE | 1. Mở form Thêm nhóm.<br>2. Mở dropdown "Thuộc nhóm". | - Dropdown KHÔNG liệt kê bất kỳ nhóm "Ngừng hoạt động" nào. | PASS | N/A |
| TC-W03-E2E-A21 | FEAT-CAT-GRP-CREATE | garage-web, gf-inventory | AC-2, AC-3, AC-4, AC-6 | E2E | Wave | P1 | C2 | [DATA-MỚI required-only] Tạo nhóm — CHỈ nhập trường bắt buộc (Mã + Tên) | Form Thêm nhóm mở, không dữ liệu seed cũ | 1. Điền Mã + Tên (bỏ trống Thuộc nhóm, Mô tả, giữ Trạng thái mặc định).<br>2. Nhấn "Tạo".<br>3. Mở Detail nhóm vừa tạo qua UI. | - Tạo thành công (toast).<br>- Detail hiển thị đúng Mã/Tên vừa nhập, Trạng thái mặc định "Đang hoạt động", Thuộc nhóm/Mô tả trống. | PASS (QC-manual manual-test) | spec-gap: strict-mode text ambiguity "Vật tư hàng hóa" — đã fix locator sau run, cần re-run (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A22 | FEAT-CAT-GRP-CREATE | garage-web, gf-inventory | AC-2, AC-3, AC-4, AC-5, AC-6 | E2E | Wave | P1 | C2 | [DATA-MỚI full-fields] Tạo nhóm — ĐẦY ĐỦ TẤT CẢ trường (bắt buộc + optional) | Form Thêm nhóm mở, tạo mới hoàn toàn qua UI (nhóm cha tạo trước trong cùng TC) | 1. Tạo 1 nhóm cha ACTIVE qua UI.<br>2. Mở form Thêm nhóm con: điền Mã+Tên+chọn Thuộc nhóm=cha vừa tạo+giữ Trạng thái "Đang hoạt động"+điền Mô tả (~200 ký tự).<br>3. Nhấn "Tạo".<br>4. Mở Detail. | - Tạo thành công (toast).<br>- Detail hiển thị đúng TOÀN BỘ giá trị đã nhập: Mã/Tên/Thuộc nhóm=mã nhóm cha/Mô tả đầy đủ/Trạng thái "Đang hoạt động". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A13 | FEAT-CAT-GRP-EDIT | garage-web, agg-garage-graph, gf-inventory | AC-3, AC-6, AC-7 | E2E | Smoke | P1 | C2 | Sửa nhóm — đổi tên+mô tả thành công | Nhóm đã tạo | 1. Mở Edit.<br>2. Đổi Tên + Mô tả.<br>3. Nhấn "Lưu". | - Toast "Cập nhật nhóm vật tư hàng hóa thành công".<br>- Detail/List phản ánh giá trị mới.<br>- "Người sửa"/"Ngày sửa" cập nhật. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A14 | FEAT-CAT-GRP-EDIT | garage-web | AC-2 | E2E | Wave | P2 | C1 | Sửa nhóm — Mã nhóm VTHH khoá | Form Edit mở | 1. Quan sát trường "Mã nhóm VTHH". | - Trường disabled, hiển thị giá trị hiện tại, kèm hướng dẫn "Không được sửa mã nhóm sau khi tạo.". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A15 | FEAT-CAT-GRP-EDIT | garage-web | AC-4 (v5, 2026-07-02) | E2E | Wave | P1 | C2 | Sửa nhóm — "Thuộc nhóm" khoá, không đổi được nhóm cha | Nhóm con đã có nhóm cha | 1. Mở Edit nhóm con.<br>2. Quan sát/thử tương tác trường "Thuộc nhóm". | - Trường "Thuộc nhóm" disabled — cùng pattern khoá với "Mã nhóm VTHH" theo FEAT-CAT-GRP-EDIT v5 AC-4.<br>- **Ghi chú drift**: source-read cho thấy code hiện tại (`MaterialGroupFormPage.tsx`) CHƯA truyền `disabled={isEdit}` cho field này — nếu live run FAIL đây là bug hợp lệ cần log, không phải lỗi spec. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A16 | FEAT-CAT-GRP-EDIT | garage-web | AC-8 | E2E | Wave | P2 | C1 | Sửa nhóm — Huỷ bỏ | Form Edit đã đổi dữ liệu | 1. Đổi Tên nhóm.<br>2. Nhấn "Huỷ bỏ". | - Không lưu thay đổi, quay về màn trước với dữ liệu gốc. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A17 | FEAT-CAT-GRP-EDIT | garage-web, gf-inventory | AC-5, BR-CAT-GRP-007 | E2E | Smoke | P1 | C2 | Sửa nhóm — cascade Ngừng hoạt động | Cây 3 cấp `A→A1→A11` ACTIVE | 1. Edit `A` → đổi Trạng thái "Ngừng hoạt động".<br>2. Xác nhận cascade (nếu có dialog).<br>3. Nhấn "Lưu".<br>4. Kiểm tra List filter "Tất cả". | - Toast thành công.<br>- Cả 3 nhóm (A, A1, A11) đều "Ngừng hoạt động".<br>- Transaction atomic (1 lần cascade). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A18 | FEAT-CAT-GRP-EDIT | garage-web | AC-5 (reverse) | E2E | Wave | P2 | C2 | Sửa nhóm — cha ACTIVE, con KHÔNG tự bật lại | Cây `P(INACTIVE)→C(INACTIVE)` | 1. Edit `P` → đổi Trạng thái "Đang hoạt động".<br>2. Nhấn "Lưu".<br>3. Kiểm tra `C`. | - `P` chuyển ACTIVE.<br>- `C` vẫn INACTIVE (không tự cascade khi bật lại — user phải sửa từng con). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A19 | FEAT-CAT-GRP-DELETE | garage-web, gf-inventory | AC-1, AC-2, AC-4, AC-5 | E2E | Smoke | P1 | C2 | Xóa nhóm — chain block-child/block-product/happy | Nhóm cha `X` đang có 1 nhóm con `Y` (rỗng, đủ điều kiện xóa) | 1. Xóa nhóm cha `X` (đang có con `Y`) → popup "Không thể xóa" (còn nhóm con).<br>2. Đóng popup.<br>3. Xóa nhóm con `Y` (rỗng) → popup "Xác nhận" → Xóa.<br>4. Quay lại xóa nhóm cha `X` (giờ đã hết con) → popup "Xác nhận" → Xóa. | - Bước 1: popup "Không thể xóa" đúng lý do (còn nhóm con), chỉ nút "Đóng"; `X` KHÔNG bị xóa.<br>- Bước 3: toast "Đã xoá nhóm vật tư hàng hóa thành công", `Y` biến mất khỏi list.<br>- Bước 4: thao tác xóa `X` lần 2 (sau khi `Y` đã bị xóa) chuyển sang popup "Xác nhận" (KHÔNG còn bị chặn) → Xóa → toast thành công.<br>- End state: list KHÔNG còn cả `X` lẫn `Y` (đúng FEAT-CAT-GRP-DELETE §6 EC-2 — "Xóa lần lượt từ nhóm con lên nhóm cha là cách hợp lệ để xóa cả nhánh"). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-A20 | FEAT-CAT-GRP-DELETE | garage-web | AC-3 | E2E | Wave | P2 | C1 | Xóa nhóm — Huỷ | Popup "Xác nhận" xóa mở | 1. Nhấn "Hủy" ở popup. | - Popup đóng, nhóm KHÔNG bị xóa, không network call delete. | PASS | N/A |

### Nhóm T — Exception & Timeout (Group + Product + Import, dùng chung) — 8 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-T01 | FEAT-CAT-GRP-EDIT | garage-web, gf-inventory | BR-CAT-GRP-007 atomic | E2E | Regression | P2 | C3 | Cascade Ngừng HĐ lỗi giữa chừng (mock 500) — rollback toàn bộ | Cây `A→B`; mock 500 cho `updateMaterialGroup` | 1. Setup mock 500 tại mutation cascade.<br>2. Edit `A` → INACTIVE → Lưu.<br>3. Kiểm tra `A`, `B`. | - Submit fail, toast lỗi.<br>- Cả `A` và `B` VẪN "Đang hoạt động" (transaction rollback, không có state nửa vời). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-T02 | FEAT-CAT-GRP-EDIT | garage-web, gf-inventory | EC concurrency | E2E | Wave | P2 | C3 | 2 phiên cùng sửa 1 nhóm gần đồng thời | Nhóm ACTIVE; 2 session (kế toán + chủ garage) | 1. Cả 2 session mở Edit cùng nhóm.<br>2. Session A sửa Tên → Lưu trước.<br>3. Session B sửa Tên khác (dữ liệu form cũ) → Lưu sau. | - Ghi nhận hành vi thực tế: last-write-wins (Session B thành công, ghi đè) HOẶC conflict 409 (Session B nhận lỗi, yêu cầu tải lại).<br>- Kết quả phải ghi rõ trong report — PKG-W03 không có yêu cầu optimistic-lock tường minh cho Group Edit. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-T03 | FEAT-CAT-GRP-DELETE, FEAT-CAT-GRP-CREATE | garage-web, gf-inventory | Delete-then-recreate | E2E | Wave | P2 | C2 | Xóa nhóm xong tạo lại đúng mã cũ | Nhóm trống (đủ điều kiện xóa) | 1. Xóa nhóm mã X thành công.<br>2. Tạo lại nhóm mới với cùng mã X, tên khác. | - Tạo thành công, KHÔNG báo trùng mã giả (hard-delete).<br>- Bản ghi mới có `id`/`createdAt` hoàn toàn mới, không kế thừa dữ liệu cũ. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-T04 | FEAT-CAT-PROD-DETAIL | garage-web, gf-inventory | EC-2 (DETAIL), ERR-INV-015 | E2E | Wave | P2 | C3 | Race: 2 user gắn cùng SKU vào 2 mã khác nhau | SKU chưa mapping (`SEED_UNMAPPED_SKU_ID`); 2 mã SP, 2 session | 1. 2 session cùng mở modal Gắn SKU cho cùng 1 SKU trên 2 mã khác nhau.<br>2. Submit gần như đồng thời. | - Đúng 1 session thành công (mapping ghi nhận).<br>- Session còn lại nhận lỗi `ERR-INV-015` "SKU đã mapping mã khác".<br>- DB chỉ có 1 mapping. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-T05 | FEAT-CAT-PROD-DETAIL | garage-web, ct-file-storage | Concurrent attachment cap | E2E | Wave | P3 | C3 | Upload đồng thời nhiều tệp gần cap 5 | Mã SP đã có 3/5 attachment (`SEED_PRODUCT_NEAR_CAP_CODE`) | 1. Gửi đồng thời 3 request upload (vượt 2 slot còn trống).<br>2. Kiểm tra DB sau khi hoàn tất. | - Tối đa 2/3 request thành công (đủ 5 file).<br>- Request thứ 3 (bất kể thứ tự) bị từ chối "Tối đa 5 file/sản phẩm".<br>- `attachments[]` cuối cùng đúng 5, không vượt do race condition. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-T06 | FEAT-CAT-PROD-IMPORT | garage-web | Concurrency import | E2E | Wave | P3 | C3 | 2 user import file khác nhau cùng lúc | 2 file 50 dòng mã không trùng nhau (`SEED_IMPORT_FILE_A/B`) | 1. 2 session upload + commit 2 file đồng thời.<br>2. Kiểm tra DB. | - Cả 2 import thành công.<br>- Tổng record DB = file A + file B (không duplicate, không miss).<br>- Không deadlock. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-T07 | FEAT-CAT-GRP-CREATE | garage-web | Client-server connectivity | E2E | Wave | P2 | C3 | Mất kết nối/5xx ngay lúc submit tạo nhóm | Form Thêm nhóm đã điền hợp lệ; mock network abort lần đầu | 1. Submit "Tạo" khi network fail lần 1.<br>2. Quan sát lỗi + dữ liệu form.<br>3. Submit lại (network phục hồi). | - Lần 1: báo lỗi rõ ràng ("mất kết nối"/lỗi hệ thống), dữ liệu 2 trường vẫn còn nguyên trong form.<br>- Lần 2 (retry): submit thành công, toast thành công, nhóm mới xuất hiện trong list. | PASS | N/A |
| TC-W03-E2E-T08 | FEAT-CAT-PROD-CREATE | garage-web, agg-sso-graph | Session expiry mid-flow | E2E | Wave | P2 | C3 | Phiên hết hạn giữa lúc tạo mã sản phẩm | Token cấu hình short-lived qua `SSO_FORCE_TOKEN_EXPIRY_ENDPOINT` | 1. Điền form Create Product.<br>2. Ép hết hạn access token.<br>3. Submit. | - Silent refresh (nếu refresh token còn hợp lệ) → submit tiếp tục thành công, không mất dữ liệu form ngầm.<br>- HOẶC redirect rõ ràng về màn Đăng nhập nếu refresh token cũng hết hạn — không crash, không stuck loading vô hạn. | PASS (QC-manual manual-test) | N/A |

### Nhóm B — Internal Product (FEAT-CAT-PROD-LIST/CREATE/DETAIL/EDIT/DELETE) — 28 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-B01 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm, ct-file-storage | AC-1, AC-2..14 | E2E | Smoke | P1 | C2 | Tạo mã SP đầy đủ 4 tab — Detail render enrichment đúng | `SEED_UNMAPPED_SKU_ID`; UNIT/COUNTRY master seeded | 1. Tab Thông tin chung: mã/tên/ĐVT chính/thương hiệu/xuất xứ.<br>2. Tab ĐVT quy đổi: thêm 1 dòng (rate hợp lệ).<br>3. Tab Mã SKU: gắn SKU chưa mapping.<br>4. Tab Đính kèm: upload 1 PDF.<br>5. Nhấn "Tạo".<br>6. Mở Detail. | - Toast thành công.<br>- Detail render: `mainUnitDisplayName`, `originDisplayName`, `materialGroupName` (nếu chọn), brand free-text, đủ 3 tab dữ liệu (ĐVT quy đổi 1 dòng, SKU 1 dòng, đính kèm 1 file).<br>- `pricing_method` mặc định "Bình quân cuối kỳ", `status = ACTIVE`. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B02 | FEAT-CAT-PROD-LIST | garage-web, agg-garage-graph | AC-3 | E2E | Wave | P2 | C1 | Tìm kiếm mã SP theo mã/tên/SKU liên kết | List có mã biết trước | 1. Nhập từ khoá khớp mã/tên/SKU.<br>2. Quan sát kết quả. | - Kết quả LIKE trên mã nội bộ/tên/SKU liên kết đúng. | PASS | N/A |
| TC-W03-E2E-B03 | FEAT-CAT-PROD-LIST | garage-web, agg-garage-graph | AC-4, AC-5, AC-6 | E2E | Wave | P2 | C1 | Áp dụng đồng thời 3 bộ lọc (trạng thái+tính chất+nhóm hàng) | Tenant có mã đa dạng | 1. Chọn trạng thái=Đang HĐ.<br>2. Chọn tính chất=Vật tư hàng hóa.<br>3. Chọn nhóm hàng cụ thể.<br>4. Quan sát list. | - Kết quả thoả cả 3 điều kiện (AND). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B04 | FEAT-CAT-PROD-LIST | garage-web | AC-7 | E2E | Wave | P2 | C1 | Phân trang danh sách mã SP | Tenant > 1 trang dữ liệu | 1. Chuyển trang 1→2.<br>2. Đổi số dòng/trang. | - Dữ liệu trang 2 không trùng trang 1.<br>- Số dòng/trang đổi đúng theo lựa chọn. | PASS | N/A |
| TC-W03-E2E-B05 | FEAT-CAT-PROD-LIST | garage-web | AC-8 | E2E | Wave | P2 | C1 | Cột Thao tác theo trạng thái | Tenant có mã ACTIVE + INACTIVE | 1. Filter "Ngừng hoạt động".<br>2. Quan sát cột Thao tác. | - Dòng INACTIVE chỉ có icon Xem, KHÔNG có Sửa/Xóa.<br>- Dòng ACTIVE có đủ Sửa+Xóa (verify song song ở filter "Đang hoạt động"). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B06 | FEAT-CAT-PROD-LIST | garage-web | EC-1 | E2E | Wave | P3 | C1 | Tenant mới chưa có mã SP nào | `EMPTY_TENANT_BASE_URL` | 1. Mở List trên tenant rỗng. | - Empty state "Không có dữ liệu"; giữ tìm kiếm/3 bộ lọc/nút Thêm-Import-Export. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B07 | FEAT-CAT-PROD-LIST | garage-web | EC-4 | E2E | Wave | P3 | C1 | Tìm/lọc không khớp mã nào | List có dữ liệu | 1. Nhập từ khoá không tồn tại. | - Empty state "Không tìm thấy kết quả phù hợp". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B08 | FEAT-CAT-PROD-CREATE | garage-web | AC-2, AC-3, AC-6 | E2E | Wave | P1 | C1 | Tạo mã SP — bỏ trống Mã/Tên/ĐVT chính | Form Create mở | 1. Bỏ trống 3 trường bắt buộc.<br>2. Nhấn "Tạo". | - Lỗi validation cho cả 3 trường, không lưu. | PASS | N/A |
| TC-W03-E2E-B09 | FEAT-CAT-PROD-CREATE | garage-web | AC-2 | E2E | Wave | P2 | C1 | Tạo mã SP — mã chứa ký tự đặc biệt | Form Create mở | 1. Nhập `PROD@#$001` vào Mã sản phẩm nội bộ. | - Ký tự đặc biệt bị chặn/báo lỗi. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B10 | FEAT-CAT-PROD-CREATE | garage-web, gf-inventory | AC-15 | E2E | Wave | P1 | C2 | Tạo mã SP — mã trùng | Mã X đã tồn tại | 1. Tạo mã X thành công.<br>2. Tạo lại mã X. | - Lỗi mã đã tồn tại, không lưu. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B11 | FEAT-CAT-PROD-CREATE | garage-web | AC-16 | E2E | Wave | P2 | C1 | Tạo mã SP — Huỷ bỏ | Form đã điền dữ liệu | 1. Nhấn "Huỷ bỏ". | - Không lưu, quay list; search lại → "Không tìm thấy kết quả phù hợp". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B12 | FEAT-CAT-PROD-CREATE | garage-web | AC-8, ERR-INV-046 | E2E | Wave | P2 | C1 | Mô tả/Ghi chú vượt 500 ký tự | Form Create mở | 1. Nhập 501 ký tự vào Mô tả.<br>2. Nhấn "Tạo". | - Lỗi "Mô tả / Ghi chú vượt quá 500 ký tự" (`ERR-INV-046`), highlight ô vi phạm, không lưu. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B13 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web | AC-11, ERR-INV-013/014 | E2E | Wave | P2 | C1 | ĐVT quy đổi — tỷ lệ ≤0 / trùng ĐVT | Modal "Thêm ĐVT quy đổi" mở | 1. Nhập tỷ lệ = 0 → Thêm.<br>2. Sửa lại ĐVT trùng với dòng đã có → Thêm. | - Rate ≤0: "Tỷ lệ quy đổi phải lớn hơn 0" (`ERR-INV-013`).<br>- ĐVT trùng: "ĐVT quy đổi bị trùng trong cùng mã sản phẩm" (`ERR-INV-014`).<br>- Không dòng nào được thêm vào bảng. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B14 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web | AC-11, ERR-INV-047 | E2E | Wave | P2 | C1 | ĐVT quy đổi — tỷ lệ vượt 6 chữ số thập phân | Modal "Thêm ĐVT quy đổi" mở | 1. Nhập tỷ lệ `1.1234567` (7 chữ số thập phân) → Thêm. | - Lỗi "Tỷ lệ quy đổi không được có quá 6 chữ số sau dấu phẩy" (`ERR-INV-047`), không lưu dòng. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B15 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web, gf-inventory | AC-12, EC-8 | E2E | Wave | P2 | C2 | Gắn SKU — chặn SKU đã mapping mã khác | `SEED_MAPPED_SKU_ID` | 1. Mở modal Gắn SKU.<br>2. Tìm SKU đã mapping mã khác.<br>3. Thử chọn. | - SKU hiển thị "Đã mapping mã khác", checkbox disabled, không chọn được.<br>- SKU "Chưa mapping" (`SEED_UNMAPPED_SKU_ID`) chọn + gắn thành công. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B16 | FEAT-CAT-PROD-CREATE | garage-web, ct-file-storage | AC-13, ERR-CMN-004/005 | E2E | Wave | P2 | C1 | Tab Đính kèm file — cap 5 tệp/định dạng/dung lượng | Tab Đính kèm mở | 1. Upload file `.exe` → quan sát lỗi định dạng.<br>2. Upload file > 30MB → quan sát lỗi dung lượng. | - Định dạng sai → `ERR-CMN-005` "chỉ chấp nhận PDF, JPG, PNG".<br>- Vượt dung lượng → `ERR-CMN-004`. **Ghi chú drift**: registry hiện ghi "10MB" nhưng FEAT v12 chốt cap 30MB cho W03 — verify số thực tế khi chạy live, không tự kết luận trước. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B29 | FEAT-CAT-PROD-CREATE | garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm | AC-2, AC-3, AC-6, AC-14 | E2E | Wave | P1 | C2 | [DATA-MỚI required-only] Tạo mã SP — CHỈ nhập trường bắt buộc (Mã + Tên + ĐVT chính) | Form Thêm sản phẩm mở, không dữ liệu seed cũ | 1. Điền Mã + Tên + chọn ĐVT chính (bỏ trống Tính chất/Nhóm/Thương hiệu/Xuất xứ/Thông số/Quy cách/Mô tả/Ghi chú/Ảnh, không đụng 3 tab phụ).<br>2. Nhấn "Tạo".<br>3. Mở Detail. | - Tạo thành công (toast).<br>- Detail hiển thị Mã/Tên/ĐVT chính đúng; Tính chất mặc định "Vật tư hàng hóa"; Trạng thái mặc định "Đang hoạt động"; các field optional còn lại trống/mặc định. | PASS (QC-manual manual-test) | BUG-W03-117 (ĐVT chính "m2" bị BE reject — spec dùng "Cái" work-around sau khi phát hiện; cần re-run) |
| TC-W03-E2E-B30 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm, ct-file-storage | AC-2..14 | E2E | Wave | P1 | C2 | [DATA-MỚI full-fields] Tạo mã SP — ĐẦY ĐỦ TẤT CẢ trường (bắt buộc + optional) | Form Thêm sản phẩm mở; cần `SEED_UNMAPPED_SKU_ID` cho tab Mã SKU | 1. Điền đầy đủ Mã/Tên/Tính chất(CCDC)/Nhóm/ĐVT chính/Thương hiệu/Xuất xứ/Thông số/Quy cách/Mô tả/Ghi chú.<br>2. Tab ĐVT quy đổi: thêm 1 dòng.<br>3. Tab Mã SKU: gắn 1 SKU.<br>4. Tab Đính kèm: upload 1 PDF.<br>5. Nhấn "Tạo".<br>6. Mở Detail. | - Tạo thành công.<br>- Detail hiển thị đúng TOÀN BỘ giá trị đã nhập ở mọi field + 3 tab phụ (1 dòng ĐVT quy đổi/1 SKU/1 tệp đính kèm). | PASS (QC-manual manual-test) | N/A — cần `SEED_UNMAPPED_SKU_ID` (chưa có trong môi trường chạy) |
| TC-W03-E2E-B17 | FEAT-CAT-PROD-DETAIL | garage-web, gf-inventory | AC-5, BR-CAT-PROD-012 | E2E | Wave | P2 | C2 | Chi tiết — Tab ĐVT quy đổi: quản lý + khoá khi đã giao dịch | `SEED_PRODUCT_WITH_TXN_CONVERSION` | 1. Mở tab ĐVT quy đổi của mã đã giao dịch.<br>2. Quan sát nút Sửa/Xóa của dòng đã giao dịch. | - Dòng đã phát sinh giao dịch: Sửa/Xóa disabled.<br>- Thêm dòng mới vẫn hoạt động bình thường (áp validate AC-11 đầy đủ). | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B18 | FEAT-CAT-PROD-DETAIL | garage-web, gf-inventory | AC-7, BR-CAT-PROD-014 | E2E | Wave | P2 | C2 | Chi tiết — Tab Mã SKU: bỏ gắn SKU chỉ gỡ mapping | `SEED_PRODUCT_WITH_SKU` | 1. Mở tab Mã SKU.<br>2. Nhấn "Xóa" trên 1 dòng SKU.<br>3. Xác nhận. | - Mapping bị gỡ (dòng biến mất khỏi bảng gắn).<br>- SKU gốc KHÔNG bị xóa — verify SKU trở lại trạng thái "Chưa mapping" khi search ở modal Gắn SKU của mã khác. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B19 | FEAT-CAT-PROD-DETAIL | garage-web, ct-file-storage | AC-8 | E2E | Wave | P2 | C2 | Chi tiết — Tab Đính kèm: xem/tải tệp | `SEED_PRODUCT_WITH_ATTACHMENT` | 1. Mở tab Đính kèm.<br>2. Quan sát dòng tệp.<br>3. Mở/tải tệp. | - Tên tệp + dung lượng hiển thị đúng.<br>- Link mở/tải hoạt động (không 404). | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B20 | FEAT-CAT-PROD-EDIT | garage-web | AC-2 | E2E | Wave | P2 | C1 | Sửa mã SP — Mã sản phẩm khóa | Form Edit mở | 1. Quan sát trường "Mã sản phẩm nội bộ". | - Disabled, kèm hướng dẫn "Không được sửa mã sản phẩm nội bộ.". | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B21 | FEAT-CAT-PROD-EDIT | garage-web, gf-inventory | AC-3 | E2E | Wave | P2 | C2 | Sửa mã SP — ĐVT chính khóa/mở theo giao dịch | `SEED_PRODUCT_WITH_TXN` (đã giao dịch) + 1 mã chưa giao dịch | 1. Mở Edit mã đã giao dịch → quan sát ĐVT chính.<br>2. Mở Edit mã chưa giao dịch → quan sát ĐVT chính. | - Đã giao dịch: disabled + hướng dẫn "Không được sửa vì đã phát sinh giao dịch.".<br>- Chưa giao dịch: cho chọn lại từ master. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B22 | FEAT-CAT-PROD-EDIT | garage-web, gf-inventory | AC-4, AC-8 | E2E | Smoke | P1 | C2 | Sửa mã SP — cập nhật đầy đủ trường thông tin chung | Mã đã tạo | 1. Đổi Tên, Thương hiệu, Xuất xứ.<br>2. Nhấn "Lưu". | - Toast thành công, Detail/List phản ánh giá trị mới.<br>- "Người sửa"/"Ngày sửa" cập nhật. | PASS | N/A |
| TC-W03-E2E-B23 | FEAT-CAT-PROD-EDIT | garage-web | AC-5, BR-CAT-PROD-010 | E2E | Wave | P3 | C1 | Sửa mã SP — Phương pháp tính giá vẫn khóa | Form Edit mở | 1. Quan sát trường "Phương pháp tính giá". | - Hiển thị "Bình quân cuối kỳ", disabled, không đổi được. | PASS (QC-manual manual-test) | BUG-W03-117, BUG-W03-118 |
| TC-W03-E2E-B24 | FEAT-CAT-PROD-DELETE | garage-web, gf-inventory | AC-2, BR-CAT-PROD-014/016 | E2E | Smoke | P1 | C2 | Xóa mã SP — chưa giao dịch: cascade unmap | Mã có SKU + ĐVT quy đổi + đính kèm, chưa giao dịch | 1. Xóa mã (xác nhận popup).<br>2. Kiểm tra List.<br>3. Kiểm tra SKU vừa gắn (qua modal Gắn SKU mã khác). | - Toast thành công, mã biến mất khỏi list.<br>- Cascade xóa mapping SKU/conversion-unit/attachment.<br>- SKU gốc vẫn tồn tại (chuyển "Chưa mapping"). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-B25 | FEAT-CAT-PROD-DELETE | garage-web, gf-inventory | AC-4, ERR-INV-008 | E2E | Smoke | P1 | C2 | Xóa mã SP — đã giao dịch: chặn, chuyển INACTIVE thay thế | `SEED_PRODUCT_WITH_TXN` | 1. Xóa mã đã giao dịch → popup "Không thể xóa".<br>2. Đóng popup.<br>3. Edit → đổi Trạng thái "Ngừng hoạt động" → Lưu. | - Popup "Không thể xóa" đúng nội dung ERR-INV-008, mã không bị xóa.<br>- Sau Edit: mã tồn tại với status INACTIVE, filter mặc định không hiện, filter "Tất cả" hiện. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B26 | FEAT-CAT-PROD-DETAIL, FEAT-CAT-PROD-EDIT | garage-web, gf-inventory | AC-9 (LIST-adjacent), downstream W05 | E2E | Wave | P2 | C2 | Mã SP thuộc nhóm vừa Ngừng HĐ — Detail/Edit vẫn dùng được | `SEED_PRODUCT_IN_INACTIVE_GROUP` | 1. Mở Detail.<br>2. Mở Edit → dropdown "Nhóm vật tư/hàng hóa". | - Detail render đầy đủ enrichment (không lỗi dù nhóm INACTIVE).<br>- Dropdown Edit chỉ liệt kê nhóm ACTIVE khác — user phải pick nhóm mới nếu muốn đổi.<br>- (W05 placeholder, không assert ở W03): mã INACTIVE-group không chọn được ở phiếu nhập mới. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B27 | FEAT-CAT-PROD-CREATE, FEAT-CAT-PROD-DETAIL | garage-web, gf-erp-mdm | gf-erp-mdm dependency | E2E | Wave | P1 | C2 | gf-erp-mdm thêm Xuất xứ mới → dropdown + Detail reflect ngay | `SEED_NEW_COUNTRY_LABEL` thêm trước test | 1. Mở dropdown Xuất xứ ở Create, search theo tên mới.<br>2. Chọn, tạo mã, mở Detail. | - Dropdown hiển thị giá trị mới ngay (không cache stale).<br>- Detail `originDisplayName` đúng giá trị mới. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-B28 | FEAT-CAT-PROD-CREATE | garage-web, ct-file-storage | attachment upload (ADR-016) | E2E | Wave | P3 | C2 | Tải tệp đính kèm qua presigned URL | Mã đã tạo | 1. Mở Edit → tab Đính kèm.<br>2. Upload 1 PDF.<br>3. Mở Detail. | - Network có request presigned/storage (2-bước: generate URL + PUT) + GraphQL metadata save.<br>- Detail tab Đính kèm render link tải đúng. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |

### Nhóm C — Import (FEAT-CAT-PROD-IMPORT) — 5 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-C01 | FEAT-CAT-PROD-IMPORT | garage-web, agg-garage-graph, gf-inventory | AC-1, AC-4, AC-5, AC-6, AC-8, AC-9 | E2E | Smoke | P1 | C2 | Import 100 dòng mix (95 hợp lệ + 5 lỗi) | `SEED_IMPORT_MIX_100` | 1. Mở wizard Import, upload file.<br>2. Bước Kiểm tra: xem Tổng/Hợp lệ/Lỗi.<br>3. Filter "Lỗi", xem Lý do lỗi.<br>4. Xác nhận import.<br>5. Tải file lỗi. | - Số liệu preview đúng (100/95/5).<br>- Mỗi dòng lỗi có Lý do rõ ràng (message VN theo mã lỗi).<br>- Sau commit: 95 mã mới ACTIVE trong DB.<br>- File lỗi tải về đúng 5 dòng + cột Lý do. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-C02 | FEAT-CAT-PROD-IMPORT | garage-web, agg-garage-graph | AC-3b, BR-CAT-PROD-020, ERR-INV-041 | E2E | Wave | P1 | C3 | Import 501 dòng — FE cap + BFF/BE defense | `SEED_IMPORT_501_ROWS` | 1. Upload file 501 dòng.<br>2. Quan sát UI + network. | - FE chặn ngay, banner "Vượt giới hạn 500 dòng/lần", KHÔNG gọi mutation verify.<br>- (Nếu bypass FE) BFF/BE trả `ERR-INV-041` HTTP 400. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-C03 | FEAT-CAT-PROD-IMPORT | garage-web | AC-3b (EC-9) | E2E | Wave | P2 | C1 | Import — file sai định dạng / rỗng | File `.csv` hoặc file `.xlsx` rỗng | 1. Upload file `.csv`.<br>2. Quan sát lỗi. | - Báo lỗi định dạng ngay bước 1, KHÔNG chuyển sang bước Kiểm tra dữ liệu. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-C04 | FEAT-CAT-PROD-IMPORT, FEAT-CAT-PROD-EXPORT | garage-web | round-trip | E2E | Wave | P2 | C2 | Round-trip: Export → sửa file → Import lại | `SEED_ROUNDTRIP_FILE` (9 dòng trùng + 1 mới) | 1. Import file round-trip.<br>2. Xem preview.<br>3. Xác nhận import. | - Preview: 1 hợp lệ + 9 lỗi "Mã đã tồn tại" (`ERR-INV-007`).<br>- Commit: 1 mã mới tạo, 9 bị bỏ qua. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-C05 | FEAT-CAT-PROD-IMPORT | garage-web | AC-7 | E2E | Wave | P3 | C1 | Import — nút "Quay lại" ở bước kiểm tra | Đã ở bước Kiểm tra dữ liệu | 1. Nhấn "Quay lại". | - Quay về bước chọn file, cho chọn file khác. | PASS (QC-manual manual-test) | N/A |

### Nhóm D — Export (FEAT-CAT-PROD-EXPORT) — 2 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-D01 | FEAT-CAT-PROD-EXPORT | garage-web, agg-garage-graph, gf-inventory | AC-1, AC-2, R22 | E2E | Smoke | P1 | C2 | Export theo bộ lọc hiện tại — 11 cột đúng dữ liệu | Tenant có mã ACTIVE GOODS + SERVICE + INACTIVE | 1. Apply filter status=ACTIVE + nature=GOODS.<br>2. Nhấn "Xuất file".<br>3. Mở file tải về. | - Filename `danh-muc-ma-san-pham-noi-bo-{yyyyMMdd-HHmmss}.xlsx`.<br>- File chỉ chứa mã khớp filter, đủ 11 cột (mã/tên/ĐVT/phương pháp tính giá/thương hiệu/xuất xứ/tính chất/nhóm/quy cách/thông số/trạng thái).<br>- Single-call (≤2 GraphQL request quan sát được). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-D02 | FEAT-CAT-PROD-EXPORT | garage-web, gf-inventory | AC-5, BR-CAT-PROD-024, ERR-INV-045 | E2E | Wave | P1 | C2 | Export > 1.000 dòng — chặn sinh file | `BIG_TENANT_BASE_URL` (tenant > 1000 mã ACTIVE) | 1. Filter status=ACTIVE.<br>2. Nhấn "Xuất file". | - Dialog "Không thể xuất file" với nội dung `ERR-INV-045` ("vượt 1.000 dòng — áp dụng bộ lọc để thu hẹp").<br>- KHÔNG có download event xảy ra. | PASS (QC-manual manual-test) | N/A |

### Nhóm R — Cross-cutting / Regression / Deep-flow — 10 TC

| TC ID | Feature ID | Boundary | AC Ref | Type | Suite | Priority | Cluster | Title | Preconditions | Steps | Expected Result | Status | Bug ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TC-W03-E2E-R01 | FEAT-CAT-* | garage-web | BR-CAT-CMN-003 | E2E | Wave | P1 | C2 | 2 vai trò thực hiện đủ CRUD nhóm+mã, quyền ngang nhau | Tenant `garage-a`, 2 tài khoản | 1. Kế toán tạo nhóm.<br>2. Chủ garage sửa + xóa nhóm đó. | - Cả 2 thao tác thành công, không bị chặn quyền.<br>- Audit `createdBy`/`updatedBy` đúng từng user. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-R02 | FEAT-CAT-* | garage-web, ct-saas-tenant | TENANT-USERS audit | E2E | Wave | P2 | C2 | TENANT-USERS enrichment cross-user | 2 user cùng tenant | 1. User A tạo nhóm.<br>2. User B mở Detail. | - "Người tạo" hiển thị tên đầy đủ của user A (không phải ID thô). | PASS | N/A |
| TC-W03-E2E-R03 | FEAT-CAT-* | garage-web, agg-garage-graph, gf-inventory, gf-erp-mdm | Auth/tenant propagation | E2E | Wave | P1 | C3 | Auth/tenant propagation xuyên Web→BFF→gf-inventory→gf-erp-mdm | `LOG_AGGREGATOR_ENDPOINT` (nếu absent → `BLOCKED-by-harness` riêng TC này) | 1. Set header `x-request-id` cố định.<br>2. Thực hiện CRUD nhóm+mã (cần master lookup).<br>3. Grep log 4 service. | - Cả 4 service log cùng `x-request-id`.<br>- Tenant context đúng tại mỗi service. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-R04 | FEAT-CAT-* | garage-web | i18n hardcode VN | E2E | Wave | P2 | C1 | Wording tiếng Việt — không lộ key i18n raw | 4 màn chính + modal + wizard import | 1. Duyệt qua từng màn.<br>2. Kiểm tra label/button/toast/dialog. | - Toàn bộ text VN có dấu.<br>- KHÔNG có key kiểu `errors.required`/`button.save` lộ ra. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-R05 | FEAT-CAT-* | garage-web, agg-garage-graph, gf-erp-mdm, gf-inventory | DataLoader N+1 (sanity) | E2E | Wave | P2 | C2 | Search 50 mã ACTIVE — batch query, không N+1 (sanity, cross-ref agent-test-performance cho SLA) | Tenant ≥50 mã enrichment đa dạng | 1. Load Product List size=50.<br>2. Đếm số GraphQL/network call phát sinh. | - Số request master lookup không tỉ lệ tuyến tính với 50 dòng (không ~50 call riêng lẻ).<br>- SLA số liệu chính xác (p95) → `agent-test-performance` xử lý riêng. | PASS | N/A |
| TC-W03-E2E-R06 | FEAT-CAT-GRP-EDIT, FEAT-CAT-PROD-* | garage-web | Audit completeness | E2E | Wave | P2 | C2 | Audit đầy đủ cho group+product+conversion-unit+sku-mapping+attachment | Tạo + sửa 1 lần mỗi entity | 1. Tạo/sửa nhóm.<br>2. Tạo/sửa mã.<br>3. Thêm/sửa ĐVT quy đổi.<br>4. Gắn/bỏ SKU.<br>5. Thêm/xóa attachment. | - `createdAt/by/byName` set khi tạo mọi entity.<br>- `updatedAt/by/byName` cập nhật khi sửa (group+product); conversion-unit/sku-mapping/attachment chỉ có `createdAt/by` (CRUD đơn giản). | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |
| TC-W03-E2E-R07 | Regression — Procurement (`gf-purchase`) | garage-web, gf-purchase, gf-inventory | ADR-017 zero-break | E2E | Regression | P1 | C3 | [REGRESSION] Luồng Procurement hiện có không bị ảnh hưởng bởi W03 | `SEED_LEGACY_PROCUREMENT_SKU`; deploy W03 hoàn tất | 1. Mở "Tạo yêu cầu báo giá"/"Tạo đơn hàng mua".<br>2. Tìm/chọn SKU legacy.<br>3. Submit tạo mới. | - Tạo YCBG/ĐHM thành công, không lỗi, hành vi giống trước W03.<br>- Dữ liệu SKU tham chiếu đúng bảng `product` legacy (không nhầm sang `internal_product`).<br>- Không lỗi 500/schema-mismatch. | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-R08 | Regression — Bán lẻ phụ tùng (`gf-sales`) | garage-web, gf-sales, gf-inventory | ADR-017 zero-break | E2E | Regression | P1 | C3 | [REGRESSION] Luồng Bán lẻ phụ tùng hiện có không bị ảnh hưởng bởi W03 | `SEED_LEGACY_RETAIL_SKU`; deploy W03 hoàn tất | 1. Mở "Tạo phiếu bán lẻ phụ tùng".<br>2. Tìm/chọn SKU legacy.<br>3. Hoàn tất tạo phiếu. | - Luồng tìm/chọn/tạo hoạt động không lỗi, giống hành vi trước W03.<br>- Giá vốn/tồn kho tính đúng như baseline (không lẫn `internal_product`). | PASS (QC-manual manual-test) | N/A |
| TC-W03-E2E-R09 | FEAT-CAT-* (co-located) | garage-web | Co-located sidebar regression | E2E | Regression | P2 | C1 | [REGRESSION][co-located] Sidebar "Danh mục" mới không phá vỡ menu hiện có | Đăng nhập, Home render xong | 1. Mở sidebar, xác nhận menu mới "Danh mục" (Nhóm vật tư + Danh sách sản phẩm) xuất hiện.<br>2. Xác nhận các menu group hiện có (Booking/SO/Kho hàng V1/Purchase/Chat...) vẫn render + navigate đúng.<br>3. Click "Danh mục" → "Nhóm vật tư hàng hóa". | - Menu "Danh mục" hiển thị đúng vị trí (cuối sidebar, append).<br>- Menu group hiện có không mất/không đổi vị trí bất thường, vẫn navigate đúng route cũ.<br>- Click "Danh mục" → điều hướng đúng `/inventory-catalog/material-groups`. | PASS | N/A |
| TC-W03-E2E-R10 | FEAT-CAT-GRP-LIST, FEAT-CAT-GRP-DETAIL | garage-web | Navigation back/forward | E2E | Wave | P3 | C1 | Điều hướng Back/Forward trình duyệt List↔Detail | List có ≥1 nhóm | 1. Mở Detail từ List.<br>2. Nhấn Back trình duyệt.<br>3. Nhấn Forward trình duyệt. | - Back → về đúng List, không load lại từ đầu vô nghĩa.<br>- Forward → mở lại đúng Detail vừa xem. | PASS (QC-manual manual-test) | spec-gap: cần re-run sau khi fix locator (xem TR-W03-E2E.md §4) |

---

## 5. Spec File Mapping

| TC(s) | Cluster | Spec file | test.describe block |
|---|---|---|---|
| A01-A12 | C1/C2 | `Execution/auto/specs/W03/e2e/material-group-list-create.spec.ts` | 1 describe/TC — `TC-W03-E2E-A01`..`A12` |
| A13-A20 | C1/C2 | `Execution/auto/specs/W03/e2e/material-group-edit-delete.spec.ts` | 1 describe/TC — `TC-W03-E2E-A13`..`A20` |
| T01-T08 | C2/C3 | `Execution/auto/specs/W03/e2e/exception-timeout.spec.ts` | 1 describe/TC — `TC-W03-E2E-T01`..`T08` |
| B01-B16 | C1/C2 | `Execution/auto/specs/W03/e2e/internal-product-list-create.spec.ts` | 1 describe/TC — `TC-W03-E2E-B01`..`B16` |
| B17-B28 | C1/C2 | `Execution/auto/specs/W03/e2e/internal-product-detail-edit-delete.spec.ts` | 1 describe/TC — `TC-W03-E2E-B17`..`B28` |
| C01-C05, D01-D02 | C1/C2/C3 | `Execution/auto/specs/W03/e2e/import-export.spec.ts` | 1 describe/TC — `TC-W03-E2E-C01`..`C05`, `D01`..`D02` |
| R01-R10 | C1/C2/C3 | `Execution/auto/specs/W03/e2e/cross-cutting-regression.spec.ts` | 1 describe/TC — `TC-W03-E2E-R01`..`R10` |

**Shared helper**: `Execution/auto/specs/W03/e2e/_helpers.ts` (login + SSO/BFF proxy route + `INV_CAT_TESTID` namespace + seed-agnostic `uniqueSuffix()`) — không phải file test, không match `testMatch`.

**7 spec file mới tại `Execution/auto/specs/W03/e2e/`** (Layer B, AI-owned) + 1 helper — harness Layer A (`Execution/auto/harness/playwright/`) reuse nguyên trạng, KHÔNG tạo config `pw-w03-*.config.ts` biến thể (CR-20260701-03). Nhiều TC (đặc biệt Group T + B15/B17-B19/B21/B25-B28/C01-C05/D02/R03/R07/R08) phụ thuộc seed ENV var cụ thể — nếu ENV absent tại thời điểm execution, `test.skip()` sẽ tự động skip riêng TC đó với lý do rõ ràng (không chặn cả cluster), và Status của TC tương ứng phải chuyển `BLOCKED-by-harness` (không phải `SKIPPED` tự ý) nếu seed thực sự không chuẩn bị được — xem `Test Environment & Data`.

---

## 6. Common Baseline Self-Audit Checklist

> Đối chiếu "Checklist Review — Khi Review TC E2E Đã Viết" cuối `common-testcase-e2e.md` trước khi chốt `READY` cho QA review.

- [x] TC happy path (golden path) đầy đủ — A01, B01, C01, D01
- [x] TC login/logout và kiểm tra quyền truy cập — R01 (login/logout baseline `out-of-scope+lý do` không đổi W03; quyền truy cập role-parity covered)
- [x] TC đủ 4 CRUD operations — Create (A01/A08-12/B01/B08-15/C01), Read (A02-07/B02-07/16-19), Update (A13-18/B19-21), Delete (A19-20/T03/B22-23)
- [x] TC Cancel/không lưu — A11, A16, A20, B11
- [x] TC xác nhận delete (dialog confirm) — A19, A20, B24, B25
- [x] TC search/filter kết quả rỗng — A05, B07
- [x] TC pagination trong context search — B04 (kết hợp filter B03)
- [x] TC browser Back/Forward — R10
- [x] TC upload/download (tính năng có file) — B15, B16, B18, B25, B28, C01, C03, D01
- [x] TC mất kết nối/server error — T01, T07
- [x] TC permission: user không quyền cố truy cập — cross-tenant denial routed `agent-test-isolation` (out-of-scope theo Anti-Duplication Routing); W03 chỉ giữ role-parity R01
- [x] Steps rõ ràng từ đầu đến cuối, không skip bước ngầm — mọi TC 1-N bước cụ thể
- [x] Precondition rõ ràng — cột Preconditions mọi TC, ENV var cụ thể cho seed phụ thuộc

**Impacted production journeys (regression coverage — bắt buộc re-run Playwright live, không mirror PASS cũ vì đây là wave đầu tiên có E2E web cho EP-INVENTORY-CATALOG):**

- `gf-inventory` DB schema mới cùng boundary với legacy `product`/SKU → Procurement (`gf-purchase`) + Retail (`gf-sales`) — **R07, R08 (regression, P1, ADR-017 zero-break)**.
- Sidebar web thêm menu group "Danh mục" — **R09 (regression, P2, co-located)**.

**Auto-miss list:** không còn `auto-miss` chưa phân loại sau Parity Audit (§2) — 29/29 manual TC web-scope map `covered`.

---

## 7. Changelog

| Date | Change | Author |
|---|---|---|
| 2026-07-02 | v3 (TEST_EXECUTION Run 1, live Chromium remote-box `192.168.110.191:45300`): Bổ sung 4 TC data-mới theo yêu cầu coordinator (journey tạo mới PHẢI có case required-only + full-fields riêng biệt) — `TC-W03-E2E-A21` (Material Group required-only), `TC-W03-E2E-A22` (Material Group full-fields), `TC-W03-E2E-B29` (Internal Product required-only), `TC-W03-E2E-B30` (Internal Product full-fields, BLOCKED thiếu `SEED_UNMAPPED_SKU_ID`). Tổng TC 73→77. **Environment Readiness Gate**: phát hiện + fix hạ tầng nghiêm trọng — symlink `Execution/auto/specs/node_modules` bị trỏ tuyệt đối sang checkout máy/agent khác (`/home/all_engineer/projects/lemn-qc/.../node_modules`, khả năng do thao tác thủ công trước đó) gây `Requiring @playwright/test second time` crash mọi spec; sửa thành symlink tương đối `../harness/playwright/node_modules` (Layer B, trong quyền ghi `Execution/auto/specs/`) — xác nhận lại nhiều lần trong session vì bị ghi đè lại (nghi vấn tiến trình ngoài) — không phải bug sản phẩm. **Chạy thật (không code-inspection)** 77 TC qua nhiều vòng live Playwright — vòng cuối chính thức: **14 PASS / 39 FAIL / 24 BLOCKED-by-harness (seed env var absent, `test.skip()` tự động)**. **2 bug SẢN PHẨM thật được file** (xác nhận qua network response/DOM live, không phải code-inspection): `BUG-W03-117` (P1, garage-web) — dropdown "ĐVT chính"/"ĐVT quy đổi" dùng `UNIT_OPTIONS` hardcode local (`UnitEnum`) thay vì master `gf-erp-mdm`, chọn "m2" bị BE reject 400 (vi phạm FEAT-CAT-PROD-CREATE AC-6); `BUG-W03-118` (P2, garage-web) — nhiều `data-testid` Internal Product (8 field form Create, filter List cả 2 feature, detail-page, delete-dialog, nút 3 tab phụ, row-action) khai báo trong `INV_CAT_TESTID` nhưng KHÔNG wire vào DOM thật (xác nhận count()=0 qua Playwright live) — vi phạm Web Component Registry convention. **Sửa spec (Layer B, KHÔNG phải bug sản phẩm)** trong cùng session để work-around + phát hiện tiếp: double-`btnCreate.click()`, thiếu `gotoInternalProductList()` sau khi tạo (app điều hướng sang Detail chứ không quay List), broad `getByText(/thành công/i)` khớp cả toast-title lẫn toast-description (strict-mode violation), race điều hướng row-link-click → click nút cấp-trang ngay sau đó (chưa đợi navigation, vẫn còn tái diễn ở vài TC cuối phiên — CHƯA fix triệt để), ambiguous `getByText('Đang hoạt động'/'Ngừng hoạt động', {exact:true})` khớp cả filter-trigger-button lẫn status-badge trong bảng khi chọn option dropdown (CHƯA fix), `locator('input[type="file"]')` khớp 2 input (ảnh sản phẩm + đính kèm) khi cả 2 cùng hiện diện (CHƯA fix). **39 FAIL hiện tại phần lớn là spec-locator gap chưa kịp fix hết trong session (không phải xác nhận lỗi sản phẩm)** — xem `TR-W03-E2E.md` §4 + Lesson Learned `TL-W03-E2E-001..004` để re-run có định hướng ở wave sau; KHÔNG dùng kết quả FAIL này để kết luận feature bị lỗi diện rộng ngoài 2 bug đã xác nhận. Không có bug nào ở trạng thái chờ verify (`FIX_DONE`/`VERIFY_PENDING`) map sang `TC-W03-E2E-*` tại thời điểm bắt đầu run này (lần đầu execute artifact). Regression R07/R08/R09: R09 PASS (co-located sidebar, xác nhận live); R07/R08 BLOCKED (thiếu `SEED_LEGACY_PROCUREMENT_SKU`/`SEED_LEGACY_RETAIL_SKU`) — regression Procurement/Retail (ADR-017 zero-break) CHƯA được xác nhận live, cần seed ở lần chạy sau trước khi coi ADR-017 an toàn. | agent-test-e2e (W03 TEST_EXECUTION Run 1) |
| 2026-07-02 | v2: Fix gap phát hiện qua user review (coordinator) — `TC-W03-E2E-A19` trước đó test SAI chain: bước 3 xóa 1 "nhóm rỗng riêng biệt" thay vì quay lại xóa đúng nhóm cha vừa bị chặn ở bước 1, KHÔNG khớp `FEAT-CAT-GRP-DELETE` §6 EC-2 ("Xóa lần lượt từ nhóm con lên nhóm cha là cách hợp lệ để xóa cả nhánh"). Sửa lại Preconditions/Steps/Expected Result của A19 thành đúng chuỗi 4 bước cùng 1 cặp cha-con `X`/`Y`: (1) xóa cha `X` còn con `Y` → block "Không thể xóa"; (2) đóng popup; (3) xóa con `Y` (rỗng) → thành công; (4) MỚI — quay lại xóa cha `X` (đã hết con) → popup chuyển "Xác nhận" (không còn bị chặn) → xóa thành công, list không còn cả `X` lẫn `Y`. Giữ nguyên TC ID/Cluster(C2)/Priority(P1)/Feature/Boundary/AC Ref/Title như v1 — chỉ mở rộng Preconditions/Steps/Expected Result theo đúng yêu cầu fix. **Lưu ý follow-up**: spec file tương ứng `Execution/auto/specs/W03/e2e/material-group-edit-delete.spec.ts` (`TC-W03-E2E-A19` describe block) vẫn đang assert theo chain CŨ (xóa nhóm rỗng riêng biệt) — CHƯA đồng bộ theo yêu cầu fix này (out of scope của patch này, chỉ giới hạn sửa file `TC-W03-E2E.md`); cần cập nhật spec ở lượt chỉnh sửa kế tiếp trước khi TEST_EXECUTION chạy A19 thật, nếu không assertion sẽ không khớp Steps mới. | agent-test-e2e (W03 TEST_PLANNING, patch theo yêu cầu coordinator) |
| 2026-07-02 | v1: Khởi tạo `TC-W03-E2E.md` automated artifact (TEST_PLANNING, full-gen mode — chưa từng có auto artifact web E2E cho wave này). 73 TC bao phủ: Material Group full CRUD (Nhóm A, 20 TC: list/search/filter/detail/create/edit/cascade/delete), Exception & Timeout dùng chung Group+Product+Import (Nhóm T, 8 TC: cascade rollback atomicity, optimistic concurrency, delete-recreate, race SKU, concurrent attachment, concurrent import, network timeout/5xx, session expiry), Internal Product full journey (Nhóm B, 28 TC: list/search/filter/pagination/create 4-tab/detail tab-management/edit/delete), Import (Nhóm C, 5 TC: happy mix/cap 501/invalid file/round-trip/back-button), Export (Nhóm D, 2 TC: happy filtered/cap 1000), Cross-cutting/Regression/Deep-flow (Nhóm R, 10 TC: permission 2-role/TENANT-USERS/auth propagation/i18n/DataLoader sanity/audit completeness/regression Procurement+Retail ADR-017/co-located sidebar/browser back-forward). Cluster: 26×C1, 33×C2, 14×C3. Common Baseline Coverage Map §1-12 đầy đủ. Auto vs Manual Parity Audit: 29/29 manual TC web-scope `covered`, 4 TC cross-platform (015-018) + 2 TC mobile-only (026-027) `covered-by-other-agent` (đã split/adopt sang `TC-W03-MOBILE-E2E.md`, không tính miss). Co-located Journey Regression Inventory (Step 3.2): 4 dòng — sidebar (R09), gf-inventory DB schema shared với Procurement (R07) + Retail (R08), component dùng chung (cover trực tiếp A12/A15). **2 drift/observation ghi nhận qua source-read** (không dùng để kết luận PASS/FAIL, chỉ note cho TEST_EXECUTION): (1) A15 — FEAT-CAT-GRP-EDIT v5 (2026-07-02) chốt khoá field "Thuộc nhóm" trên Edit nhưng code hiện tại (`MaterialGroupFormPage.tsx`) chưa disable field này (chỉ exclude chính nó khỏi dropdown); (2) B16 — `ERROR-CODE-REGISTRY.md` `ERR-CMN-004` message vẫn ghi "10MB" nhưng FEAT-CAT-PROD-CREATE v12 chốt cap 30MB cho W03 (registry sync là follow-up dual-owner CR chưa áp dụng). Out-of-wave: AC-1b (`FEAT-CAT-PROD-CREATE`, tạo mã từ phiếu nhập/xuất kho) phụ thuộc `FEAT-IR-CREATE-V2`/`FEAT-ID-CREATE-V2` (Receipt/Delivery V2) chưa tồn tại ở W03 → không sinh TC. Runner: reuse Layer A frozen `Execution/auto/harness/playwright/` (CR-20260701-03) — 7 spec file + 1 helper mới tại `Execution/auto/specs/W03/e2e/`. Nhiều TC seed-dependent dùng `test.skip()` tự động nếu ENV var absent (không hardcode giá trị cố định) — theo lesson TL-W01-API-007(e) tránh che giấu bug write-path bằng pre-seed DB thủ công. | agent-test-e2e (W03 TEST_PLANNING) |
