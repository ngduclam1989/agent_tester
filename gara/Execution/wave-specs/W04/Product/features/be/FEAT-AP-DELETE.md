---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-AP-DELETE.md"
source_version: 4
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DELETE"
source_feat_sha: "7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422"
generated_at: "2026-07-08T05:40:00Z"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: ""
consumes_contracts: []
paired_bff_feats: []
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NEED CONFIRMATION — sha not computed (author session không có Bash tool)"
  template_sha: "NEED CONFIRMATION — sha not computed (author session không có Bash tool)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DELETE.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DELETE (BE): Xóa kỳ kế toán

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

> **⚠️ Migration cascade note (2026-07-08)**: Entity `accounting_period` được tạo qua **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** bởi `FEAT-AP-CREATE` v2 per **ADR-019 v5 Decision B**. Reference `ddl-auto=update` trong file này là **STALE từ v1 auto-gen** (regen `/gen-execution-spec --force` pending sau khi GAP-01 CHARTER cascade). Dùng `FEAT-AP-CREATE` §5.1 v2 làm canonical cho migration strategy. Feature này KHÔNG tạo migration schema mới.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DELETE` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | — (chưa định nghĩa; xem NC-W04-AP-DELETE-001) |
| Cross-tier pair | BFF: [] \| Web: [] \| Mobile: [] |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DELETE` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) |
| Source version | v4 |
| Source SHA | `7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422` |
| Generated at | 2026-07-08T05:40:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán đôi khi tạo nhầm hoặc không còn cần một kỳ kế toán (Năm/Quý/Tháng) trong lúc thiết lập danh mục kỳ ban đầu. Feature này cho phép xóa những kỳ như vậy để giữ danh mục gọn gàng, chính xác, tránh nhiễu khi chọn kỳ ở các nghiệp vụ khác (tồn đầu kỳ, tính giá xuất kho cuối kỳ). Đồng thời hệ thống phải bảo vệ tính toàn vẹn dữ liệu — không cho xóa kỳ đã đóng, kỳ còn kỳ con, hoặc kỳ đã có dữ liệu kho nghiệp vụ gắn vào. Đây là mắt xích cuối trong nhóm 5 tính năng quản lý danh mục kỳ kế toán (CREATE/LIST/DETAIL/EDIT/DELETE), phục vụ bước khởi tạo kho tại W04.

## 2. Trách nhiệm backend (gf-accounting)

- Bổ sung endpoint `DELETE` mới cho entity `accounting_period` đã tồn tại (được tạo bởi `FEAT-AP-CREATE`) — không tạo entity mới, không cần Flyway migration (boundary dùng `ddl-auto=update`).
- Enforce guard xóa tại service layer, theo thứ tự: guard(1) `status = OPEN` (BR-AP-013, phần "đã đóng"), guard(2) không còn kỳ con (BR-AP-014, kiểm tra đệ quy trên `accounting_period.parent_id`).
- Guard(3) "đã phát sinh dữ liệu kho liên quan" (BR-AP-013, phần dữ liệu kho) theo Architecture API contract §4.6 là **trách nhiệm downstream** — sẽ được enforce khi `EP-INVENTORY-RECEIPT-V2`/`EP-INVENTORY-DELIVERY-V2`/`FEAT-PRC-*` build ở wave sau (cross-boundary check qua REST hoặc reverse lock-check). W04 BE **KHÔNG** tự query cross-boundary sang `gf-inventory` để xác nhận dữ liệu kho tại thời điểm xóa — xem NC-W04-AP-DELETE-001.
- Trả HTTP 204 (No Content) khi xóa thành công (hard delete); HTTP 400 với mã lỗi tương ứng khi vi phạm guard; HTTP 404 khi id không tồn tại (bao gồm gọi xóa lần 2 trên cùng id → idempotent).
- Enforce tenant isolation (`TenantFilter` + `TenantContext`) và feature-flag `Inventory:InventoryV2` gate ở class-level trên `AccountingPeriodController` (đã có từ FEAT-AP-CREATE, tái dùng).
- Phân quyền: cả 2 persona (`garage-owner`, `accountant`) có quyền xóa ngang nhau (BR-AP-CMN-002) — không cần thêm rule RBAC hạn chế ngoài "authenticated".

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Guard & thực thi xóa

#### AC-2 → BE thực hiện xóa kỳ (happy path)

- **Khi**: client gọi `DELETE /api/v2/accounting-periods/{id}` với id hợp lệ, kỳ đang `OPEN`, không có kỳ con.
- **BE phải**: xác thực tenant + resolve entity theo id; chạy guard(1) + guard(2); nếu pass → hard-delete row `accounting_period`.
- **Output**: HTTP 204 No Content, không body.
- **Failure mode**: id không tồn tại (hoặc đã bị xóa trước đó) → HTTP 404 (xem §4.4).
- **Ref**: BR-AP-015 (§9), entity `AccountingPeriod` (§5.1), endpoint `DELETE /api/v2/accounting-periods/{id}` (§6.1)

#### AC-4 → BE guard trạng thái đóng + dữ liệu kho (partial scope W04)

- **Khi**: client gọi DELETE trên kỳ có `status = CLOSED`.
- **BE phải**: kiểm tra `status = OPEN` trước khi cho xóa; `CLOSED` → reject.
- **Output (violation)**: HTTP 400, `ERR-INV-025`, message "Kỳ kế toán đã đóng hoặc đã phát sinh dữ liệu kho liên quan nên không được xóa.", `details.guardViolated = "STATUS_CLOSED"`.
- **Scope note**: nhánh "đã phát sinh dữ liệu kho liên quan" của cùng AC-4 (phiếu nhập/xuất theo ngày chứng từ, OB theo "Tồn đến ngày", bản ghi tính giá) **KHÔNG** được BE tự kiểm tra tại W04 — đã declare là trách nhiệm downstream tại Architecture API contract §4.6. Xem NC-W04-AP-DELETE-001 cho gap này.
- **Failure mode**: `ERR-INV-025`, HTTP 400.
- **Ref**: BR-AP-013 (§9), entity `AccountingPeriod` (§5.1), endpoint `DELETE /api/v2/accounting-periods/{id}` (§6.1)

#### AC-5 → BE guard còn kỳ con

- **Khi**: client gọi DELETE trên kỳ Năm/Quý còn ít nhất 1 kỳ con tồn tại.
- **BE phải**: chạy truy vấn đệ quy (recursive CTE hoặc `existsByParentId`) trên `accounting_period.parent_id` để phát hiện children; có children → reject.
- **Output (violation)**: HTTP 400, `ERR-INV-026`, message tương tự dạng "Kỳ kế toán còn kỳ con, vui lòng xóa hết kỳ con trước.", `details.guardViolated = "HAS_CHILDREN"`.
- **Failure mode**: `ERR-INV-026`, HTTP 400.
- **Ref**: BR-AP-014 (§9), entity `AccountingPeriod` (§5.1), endpoint `DELETE /api/v2/accounting-periods/{id}` (§6.1)

#### AC-6 → BE phân quyền xóa (dual persona equal)

- **Khi**: client (bất kỳ persona `garage-owner` hoặc `accountant`) gọi DELETE.
- **BE phải**: chỉ yêu cầu authenticated (JWT hợp lệ + tenant match) — KHÔNG áp thêm role-based restriction (BR-AP-CMN-002: 2 persona quyền ngang nhau trên toàn bộ danh mục kỳ).
- **Output**: hành xử giống nhau bất kể persona nào gọi (204 nếu pass guard, 400/404 nếu không).
- **Failure mode**: không có role-specific error — chỉ auth-generic 401/403 nếu thiếu JWT/tenant mismatch (Critical Rule #4).
- **Ref**: BR-AP-CMN-002 (§9), endpoint `DELETE /api/v2/accounting-periods/{id}` (§6.1)

### Cluster B — UI-only (BE không touch)

#### AC-1 → N/A (UI-only, popup xác nhận xóa)

- Source AC này thuộc tier fe-web (mở popup xác nhận trước khi gọi API). BE không touch. Xem `fe-web/FEAT-AP-DELETE.md §3 AC-1` (khi tier đó được generate).

#### AC-3 → N/A (UI-only, hủy xóa)

- Source AC này thuộc tier fe-web (đóng popup, không gọi API xóa). BE không touch — không có request nào được gửi tới BE trong luồng hủy. Xem `fe-web/FEAT-AP-DELETE.md §3 AC-3`.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-AP-013** (CORNERSTONE): kỳ đã đóng HOẶC đã phát sinh dữ liệu kho liên quan không được xóa — enforce tại `app/service` (`AccountingPeriodService`). **W04 chỉ enforce nhánh "đã đóng"** (status check); nhánh "dữ liệu kho" declared downstream responsibility (Architecture API §4.6) — xem NC-W04-AP-DELETE-001. Vi phạm nhánh đã enforce → `ERR-INV-025` + HTTP 400.
- **BR-AP-014** (CORNERSTONE): kỳ cha còn kỳ con không được xóa — enforce tại `app/service` qua truy vấn đệ quy trên `parent_id`. Vi phạm → `ERR-INV-026` + HTTP 400.
- **BR-AP-015** (NORMAL): danh mục kỳ kế toán luôn scoped theo garage/tenant hiện tại — enforce qua `TenantFilter`.
- **BR-AP-CMN-002** (NORMAL): `garage-owner` và `accountant` có quyền xóa ngang nhau — không có RBAC hạn chế thêm ngoài authenticated.

### 4.2 Tenant + auth

- Mọi request `DELETE /api/v2/accounting-periods/{id}` propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- Endpoint yêu cầu authenticated (JWT) — cả `accountant` lẫn `garage-owner` được phép gọi (BR-AP-CMN-002).
- Class-level `@FeatureOn("Inventory:InventoryV2")` trên `AccountingPeriodController` (tái dùng từ FEAT-AP-CREATE).

### 4.3 Idempotency + concurrency

- Endpoint idempotent theo semantics REST DELETE: gọi xóa lần 2 trên cùng id (đã bị xóa) → HTTP 404 (không phải lỗi 500/409). Không cần `Idempotency-Key` header.
- Không cần optimistic locking (`version` field) — thao tác xóa là single-row delete sau khi pass guard, không có concurrent-update race đáng kể trong scope W04.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-025` | 400 | AC-4 | TOAST |
| `ERR-INV-026` | 400 | AC-5 | TOAST |
| (not found — code chưa xác định, xem NC-W04-AP-DELETE-002) | 404 | AC-2 | TOAST |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-accounting`

Không có thay đổi schema. `FEAT-AP-DELETE` tái dùng nguyên trạng entity `accounting_period` đã được tạo bởi `FEAT-AP-CREATE` (16 cols v10 per `gf-accounting-data-model.md §2ter.1`: id, tenant_id, code, name, type `YEAR|QUARTER|MONTH`, parent_id, start_date, end_date, year, status, display_order, description, created_at/by, updated_at/by — v13 R3 strip: KHÔNG có `closed_at`/`reopened_at` riêng, status change tracked qua `updated_at/by` audit pair). **Migration strategy**: Flyway `V{N+1}__accounting_v1_accounting_period.sql` per ADR-019 v5 Decision B (updated 2026-07-08) — do `FEAT-AP-CREATE` cùng wave sinh, `FEAT-AP-DELETE` KHÔNG thêm migration mới.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `accounting_period` | `idx_ap_parent` | `(parent_id)` | btree | Tái dùng — tăng tốc truy vấn guard(2) "còn kỳ con" (AC-5); index đã tạo bởi FEAT-AP-CREATE, không cần index mới | ADR-019 |

> Không cần index/constraint mới cho FEAT-AP-DELETE.

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| DELETE | `/api/v2/accounting-periods/{id}` | authenticated (JWT) | — (path param `id`) | — (204 No Content) hoặc `{error:{code,message,details}}` (400) | idempotent (delete lần 2 → 404) | AC-2, AC-4, AC-5, AC-6 | — |

### 6.2 Modified REST endpoints (additive)

_Không có — DELETE là endpoint hoàn toàn mới, không thay đổi 4 endpoint AP còn lại (search/create/get/put)._

### 6.3 Kafka topics (publish/consume)

_Không có trong W04._ Kafka event projection cho vòng đời kỳ kế toán (bao gồm delete) là **PROPOSED** ở ADR-019 Decision C — sẽ ACTIVE ở wave sau, ngoài scope W04.

### 6.4 Cross-boundary REST consumers

_Không có consumer trực tiếp cho DELETE endpoint này._ Ghi chú tích hợp: sau khi xóa thành công, endpoint `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (S2S x-api-key, V4-AP-LC — `gf-accounting-api.md §2 row #23` + ADR-021) sẽ không còn tìm thấy kỳ cho các ngày trước đó thuộc kỳ đã xóa (`locked=false` hoặc no-period-found) — hệ quả gián tiếp cho `gf-inventory` (ADR-021), không phải REST call trực tiếp từ FEAT-AP-DELETE.

> **Hand-off tới BFF**: nếu `has_bff_touchpoint=true`, BFF FEAT (`features/bff/FEAT-AP-DELETE.md`) sẽ wrap endpoint DELETE này thành mutation GraphQL (vd `deleteAccountingPeriod`). KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/AccountingPeriod.java` | NO CHANGE | reuse (tạo bởi FEAT-AP-CREATE) | 0 | — |
| `domain/repository` | `src/main/java/.../domain/repository/AccountingPeriodRepository.java` | ADDITIVE | new methods: `existsChildren(Long parentId)`, `deleteById(Long id)` | ~15 | AC-2, AC-5 |
| `app/service` | `src/main/java/.../app/service/AccountingPeriodService.java` | MODIFY | extend — add `delete(Long id)` với guard(1)+guard(2) | ~50 | AC-2, AC-4, AC-5, AC-6 |
| `adapter/controller` | `src/main/java/.../adapter/controller/AccountingPeriodController.java` | MODIFY | extend — add `@DeleteMapping("/{id}")` | ~20 | AC-2 |
| `adapter/persistence` | `src/main/java/.../adapter/persistence/AccountingPeriodJpaRepository.java` | ADDITIVE | native/recursive CTE query method `existsChildren(Long parentId)` | ~15 | AC-5 |
| `db/migration` | — | NONE | `ddl-auto=update`, không cần file migration mới | — | — |
| `test/unit` | `src/test/java/.../app/service/AccountingPeriodServiceTest.java` | ADDITIVE | new test methods (happy, guard1, guard2, not-found, permission-neutral) | ~120 | AC-2, AC-4, AC-5, AC-6 |
| `test/contract` | `src/test/java/.../adapter/controller/AccountingPeriodControllerContractTest.java` | ADDITIVE | new DELETE contract test cases (204 / 400×2 / 404) | ~80 | AC-2, AC-4, AC-5 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Verify schema (no migration)
    Entry: KG.entities stable, accounting_period table đã deploy (từ FEAT-AP-CREATE)
    Exit: xác nhận table + idx_ap_parent tồn tại, không cần migration mới
    └─► S2

S2  Repository + Service logic (guard(1)+guard(2) enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green (happy / guard1-closed / guard2-children / not-found / permission-neutral / idempotent-retry)
    └─► S3

S3  REST adapter (controller)
    Entry: S2
    Exit: contract test green (204 / ERR-INV-025 / ERR-INV-026 / 404)
    └─► S4

S4  Integration test
    Entry: S3
    Exit: xác nhận lock-check (V4-AP-LC) không còn trả về kỳ đã xóa cho các ngày liên quan; guard(3) dữ liệu kho KHÔNG có integration test ở W04 (out of scope, xem NC-W04-AP-DELETE-001)
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify schema (không migration) | db (verify) | KG stable + entity đã deploy | Table + index xác nhận tồn tại | — |
| S2 | Repository + service guard logic | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 | Integ test green (lock-check reflect) | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-AP-013` | CORNERSTONE | app/service (primary) — chỉ nhánh "đã đóng"; nhánh "dữ liệu kho" deferred downstream | `app/service/AccountingPeriodService.java::delete()` | AC-4 | `TC-BR-AP-013-*` |
| `BR-AP-014` | CORNERSTONE | app/service (primary, recursive query) | `app/service/AccountingPeriodService.java::delete()` + `adapter/persistence/AccountingPeriodJpaRepository.java` | AC-5 | `TC-BR-AP-014-*` |
| `BR-AP-015` | NORMAL | adapter (`TenantFilter`) | global config | AC-2, AC-4, AC-5, AC-6 | `TC-BR-AP-015-*` |
| `BR-AP-CMN-002` | NORMAL | adapter/controller (no extra RBAC — cả 2 persona ngang nhau) | `adapter/controller/AccountingPeriodController.java` | AC-6 | `TC-BR-AP-CMN-002-*` |

> **Enforcement layer priority**: primary ở `app/service` (SSOT); secondary defense ở `adapter/persistence` (query correctness). Guard(3) của BR-AP-013 (dữ liệu kho) KHÔNG có enforcement layer nào ở W04 — declared downstream (xem §2, §4.1, NC-W04-AP-DELETE-001).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-2 | API contract (positive, 204) + Unit | test-api | happy-path delete; kèm test idempotent retry (2nd call → 404) |
| AC-4 | API contract (negative, 400 ERR-INV-025) + Unit | test-api | chỉ cover nhánh status=CLOSED; nhánh "dữ liệu kho" OUT OF SCOPE W04 — không viết test case cho nhánh này ở BE |
| AC-5 | API contract (negative, 400 ERR-INV-026) + Unit | test-api | children-exists guard; cần test tree 3 cấp (Năm→Quý→Tháng) đúng recursive logic |
| AC-6 | Isolation (RBAC dual persona) | test-isolation | verify cả `garage-owner` lẫn `accountant` gọi DELETE cho kết quả giống nhau |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DELETE.md` | N/A (chưa generate) | Resolver dự kiến wrap `DELETE /api/v2/accounting-periods/{id}` thành mutation GraphQL (vd `deleteAccountingPeriod`) |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-DELETE.md` | N/A (chưa generate) | UI popup xác nhận (AC-1) + hủy (AC-3) + gọi mutation khi xác nhận (AC-2) |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-AP-DELETE.md` | N/A | Ngoài scope Mobile W04 — theo PKG §2.2, Mobile hub W04 chỉ có `FEAT-INV-MOBILE-MENU` (3 tile), không bao gồm quản lý kỳ kế toán đầy đủ |

**Source ID consistency** (item 18): tất cả tier file (khi được generate) phải có cùng `source_feat_sha = 7989327b57076380aeebc90d72612438f51aea5627207ca89dfc2ee19e23d422`.

### NEED CONFIRMATION

- **NC-W04-AP-DELETE-001**: AC-4 (source FEAT) mô tả "Chặn xóa khi đã đóng HOẶC đã phát sinh dữ liệu kho" như một điều kiện gộp, nhưng Architecture API contract (`Architecture/api/gf-accounting-api.md` §4.6) chỉ định W04 batch enforce guard(1) status + guard(2) children; guard(3) "dữ liệu kho" được declare là trách nhiệm downstream (receipt/delivery/PRC ở wave sau). Cần Architecture Authority + Business Authority xác nhận: (a) đây có phải gap chấp nhận được cho W04 hay không; (b) nếu chấp nhận, AC-4 source FEAT có cần annotate rõ "phần dữ liệu kho enforce ở wave sau" để tránh hiểu nhầm khi review/test.
- **NC-W04-AP-DELETE-002**: mã lỗi HTTP 404 (not-found khi id không tồn tại/đã xóa) chưa có định danh chuẩn trong Architecture API excerpt (chỉ nói "idempotent — second returns 404", không kèm error code). Cần API author xác nhận có dùng error-code convention `GMS.gf-accounting.ACCOUNTING_PERIOD_DELETE.0X` (như pattern các endpoint settlement khác trong cùng file) hay trả 404 thuần không body code.
- **NC-W04-AP-DELETE-003**: `authoring_inputs.fanout_map_sha` và `authoring_inputs.template_sha` không compute được (author session không có Bash tool để tính sha256) — dùng marker "NEED CONFIRMATION" thay vì hash giả, theo tiền lệ tại `_decisions.md` (entry EP-INVENTORY-OPENING-BALANCE 2026-07-08). Cần orchestrator/CI backfill giá trị thật trước khi bump DRAFT → ACTIVE.

## 12. References

- **Source**: [`Product/features/FEAT-AP-DELETE.md`](../../../../../Product/features/FEAT-AP-DELETE.md) v4
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) (BR-AP-013, BR-AP-014, BR-AP-015, BR-AP-CMN-002)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) v15 §2 (row 22), §4.6
- **ADR refs**: ADR-009 (no JPA relationship mapping), ADR-019 (AP boundary + schema + lock-check surface)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml`
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Bundle**: `/tmp/exec-spec-bundles/W04/FEAT-AP-DELETE.be.md` (generated 2026-07-08T04:51:55+00:00)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 3 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Fix P0 lock-check narrative path drift** (audit 2026-07-08 W04 smoke grep). §6.4 narrative reference cho lock-check endpoint (post-delete integration effect): `GET /api/v2/accounting-periods/lock-check?date={ISO}` → `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (S2S x-api-key prefix). SSOT: `gf-accounting-api.md §2 row #23` + ADR-021. Lỗi cũ do author dùng public prefix `/api/v2/` sai — lock-check là protected S2S endpoint cho consumer `gf-inventory`/`gf-purchase`, KHÔNG expose public. Cùng root cause pattern với `FEAT-OB-IMPORT.md v2` fix cùng ngày (thừa segment `/accounting/`) — closed W04-wide bởi bundle preflight §0 Wave Index-aware resolver rewrite 2026-07-08 (`scripts/preflight-wave-spec-bundle.py` + `agent-execution-spec-author F-7` + `agent-execution-spec-reviewer items #23/#24`). Không đụng §5-§8, không đụng §6.1 DELETE endpoint chính (`DELETE /api/v2/accounting-periods/{id}` — đã đúng SSOT). |
| 2026-07-08 | 2 | Delivery Authority (main agent, cuongnguyen_ac audit-fix) | **Fix P1 entity drift alignment vs Architecture canonical** (audit 2026-07-08). §5.1 entity col list — rewrite theo `gf-accounting-data-model.md §2ter.1 v10` (post user quannn 2026-07-08 year field add): (a) rename `level` → `type` (enum `YEAR\|QUARTER\|MONTH`); (b) drop `closed_at`/`reopened_at` (v13 R3 strip — status transition tracked via `updated_at/by` audit pair); (c) thêm `year INT NOT NULL` (v10 add); (d) update migration strategy note theo ADR-019 v5 Decision B (`FEAT-AP-CREATE` cùng wave sinh Flyway `V{N+1}__accounting_v1_accounting_period.sql`, `FEAT-AP-DELETE` KHÔNG thêm migration mới). |
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-AP-DELETE` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map cover 6/6 AC (4 BE-touch: AC-2/4/5/6; 2 N/A UI-only: AC-1/3), §4 ràng buộc + error code (ERR-INV-025/026), §5-§11 BE-specific (no schema delta, new DELETE endpoint, Hexagonal file map, sequence DAG, BR primary BR-AP-013/014/015/CMN-002, test hand-off, cross-tier pair chưa generate). 3 NEED CONFIRMATION flagged (guard(3) scope gap, 404 error code format, audit sha placeholders). Source FEAT chỉ audit. |
