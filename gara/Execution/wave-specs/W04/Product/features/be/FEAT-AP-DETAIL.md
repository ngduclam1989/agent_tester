---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-AP-DETAIL.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-AP-DETAIL"
source_feat_sha: "6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4"
generated_at: "2026-07-08T05:15:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán mở chi tiết kỳ 'Tháng 6/2026' từ danh sách → hệ thống trả về đầy đủ thông tin kỳ (loại/tên/khoảng ngày/kỳ cha/trạng thái) + audit tạo/sửa, sẵn sàng cho thao tác Chỉnh sửa."
consumes_contracts: []
paired_bff_feats: ["FEAT-AP-DETAIL"]
paired_fe_web_feats: ["FEAT-AP-DETAIL"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NOT-SUPPLIED-BY-ORCHESTRATOR-W04"
  template_sha: "NOT-SUPPLIED-BY-ORCHESTRATOR-W04"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-AP-DETAIL.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-AP-DETAIL (BE): Chi tiết kỳ kế toán

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

> **⚠️ Migration cascade note (2026-07-08)**: Entity `accounting_period` được tạo qua **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** bởi `FEAT-AP-CREATE` v2 per **ADR-019 v5 Decision B**. Reference `ddl-auto=update` trong file này là **STALE từ v1 auto-gen** (regen `/gen-execution-spec --force` pending sau khi GAP-01 CHARTER cascade). Dùng `FEAT-AP-CREATE` §5.1 v2 làm canonical cho migration strategy. Feature này KHÔNG tạo migration schema mới.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-AP-DETAIL` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán mở chi tiết kỳ 'Tháng 6/2026' từ danh sách → hệ thống trả về đầy đủ thông tin kỳ + audit tạo/sửa, sẵn sàng cho thao tác Chỉnh sửa. |
| Cross-tier pair | BFF: `FEAT-AP-DETAIL` \| Web: `FEAT-AP-DETAIL` \| Mobile: N/A (out-of-scope W04 — AP CRUD chỉ desktop) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-AP-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) |
| Source version | v5 |
| Source SHA | `6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4` |
| Generated at | 2026-07-08T05:15:00Z |

## 1. Mục đích nghiệp vụ

Kế toán và chủ garage cần xem đầy đủ thông tin một kỳ kế toán — loại kỳ, khoảng ngày, vị trí trong cây phân cấp, trạng thái đóng/mở — cùng lịch sử tạo/sửa, trước khi quyết định chỉnh sửa hoặc xóa kỳ đó. Màn này là bước xác nhận trung gian giữa danh sách kỳ (`FEAT-AP-LIST`) và form chỉnh sửa (`FEAT-AP-EDIT`), giúp người dùng tránh thao tác nhầm kỳ sai ngữ cảnh. Feature nằm trong luồng thiết lập kỳ kế toán — nền tảng cho việc khóa/mở giao dịch kho ở các wave sau (RECEIPT-V2/DELIVERY-V2/PRC).

## 2. Trách nhiệm backend (gf-accounting)

- Expose endpoint đọc chi tiết 1 kỳ kế toán (`accounting_period`) theo `id` — trả về đầy đủ field chung, vị trí kỳ cha (breadcrumb) và thông tin audit.
- Đảm bảo tenant isolation: chỉ trả dữ liệu thuộc tenant hiện tại; kỳ không tồn tại hoặc thuộc tenant khác → cùng một mã lỗi 404 (không leak existence cross-tenant).
- Trả về audit trail chuẩn (`createdAt`/`createdBy`/`updatedAt`/`updatedBy`) lấy từ Spring Data auditing — không có bảng audit log riêng, không có cột `closed_at`/`reopened_at` tách biệt (status transition dùng chung `updated_at`/`updated_by`).
- Không áp thêm ràng buộc RBAC theo persona ngoài `authenticated` + tenant scope — `garage-owner` và `accountant` có quyền đọc ngang nhau (BR-AP-CMN-002).
- Gate toàn bộ endpoint qua feature-flag `Inventory:InventoryV2` (`@FeatureOn("Inventory:InventoryV2")` class-level trên `AccountingPeriodController`, dùng chung với 4 FEAT AP khác).
- Không cần migration schema riêng cho feature này — tái sử dụng entity `accounting_period` đã được định nghĩa (schema sinh qua `ddl-auto=update`, dùng chung với FEAT-AP-CREATE/-EDIT/-DELETE/-LIST).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Truy vấn chi tiết kỳ

#### AC-1 → Expose endpoint chi tiết kỳ

- **Khi**: client (qua BFF) gọi `GET /api/v2/accounting-periods/{id}` để mở màn chi tiết.
- **BE phải**: resolve `id` trong phạm vi tenant hiện tại (`SecurityUtils.getCurrentTenantIdAsLong()`), trả về entity đầy đủ; không tồn tại hoặc khác tenant → 404.
- **Output**: `ApiResponse<AccountingPeriodDetail>` — response shape §6.1.
- **Failure mode**: `404 ERR-CMN-not-found` khi không tìm thấy hoặc tenant mismatch (không phân biệt 2 case này ở response để tránh leak existence).
- **Ref**: BR-AP-015 (§9), entity `accounting_period` (§5.1), endpoint `GET /api/v2/accounting-periods/{id}` (§6.1).

#### AC-2 → Trả đầy đủ field hiển thị "Thông tin chung"

- **Khi**: request AC-1 thành công (entity tìm thấy).
- **BE phải**: map entity → DTO gồm `type`, `name`, `parentId` + `parentName` + `parentBreadcrumb[]` (kỳ Quý/Tháng — resolve bằng walk `parent_id` self-FK lên tới gốc, per `idx_ap_parent`), `startDate`, `endDate`, `displayOrder`, `status`, `description`. Kỳ loại YEAR trả `parentId=null`, `parentBreadcrumb=[]`.
- **Output**: các field trên nằm trong `data` object — xem sample JSON §6.1.
- **Failure mode**: không áp dụng riêng (dùng chung failure AC-1).
- **Ref**: BR-AP-003/BR-AP-004 (hierarchy — context tham chiếu, không enforce ở đây vì read-only), entity `accounting_period` (§5.1), endpoint §6.1.

#### AC-3 → Trả thông tin audit đầy đủ (cả 3 loại kỳ)

- **Khi**: request AC-1 thành công — áp dụng như nhau cho YEAR/QUARTER/MONTH.
- **BE phải**: trả `createdAt`, `createdBy`, `updatedAt`, `updatedBy` từ Spring Data auditing. Kỳ **chưa từng sửa** → `updatedAt`/`updatedBy` PHẢI vẫn xuất hiện trong response với giá trị `null` (KHÔNG omit field) — FE chịu trách nhiệm hiển thị "—" khi null (xem `fe-web/FEAT-AP-DETAIL.md`).
- **Output**: 4 field audit luôn có mặt trong `data` object, giá trị `null` hợp lệ cho `updatedAt`/`updatedBy`.
- **Failure mode**: không áp dụng riêng.
- **Ref**: BR-AP-CMN-001 (§9), entity `accounting_period` (§5.1), endpoint §6.1.

### Cluster B — Điều hướng (UI-only)

#### AC-4 → N/A (UI-only)

- Source AC này (chuyển sang màn chỉnh sửa khi nhấn nút "Chỉnh sửa") là điều hướng thuần FE — BE không expose logic riêng cho action này. Endpoint chỉnh sửa (`PUT /api/v2/accounting-periods/{id}`) thuộc scope `FEAT-AP-EDIT` BE tier, không phải feature này. Xem `fe-web/FEAT-AP-DETAIL.md §3 AC-4`.

#### AC-5 → N/A (UI-only)

- Source AC này (quay về danh sách qua icon back) là điều hướng thuần FE, không có BE call. Xem `fe-web/FEAT-AP-DETAIL.md §3 AC-5`.

### Cluster C — Phân quyền

#### AC-6 → Không phân biệt quyền đọc theo persona

- **Khi**: request GET tới endpoint AC-1 từ user có role `garage-owner` hoặc `accountant` (cùng tenant).
- **BE phải**: KHÔNG áp `@PreAuthorize` hoặc role-based filter bổ sung ngoài `authenticated` tenant user — cả 2 persona nhận cùng response (BR-AP-CMN-002 "quyền ngang nhau").
- **Output**: response giống hệt nhau bất kể persona, miễn cùng tenant.
- **Failure mode**: không có 403 role-based cho endpoint này (chỉ 401 nếu chưa authenticated, 404 nếu không tìm thấy/tenant mismatch).
- **Ref**: BR-AP-CMN-002 (§9), endpoint §6.1.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-AP-CMN-001** (NORMAL): Hiển thị thông tin audit (ngày/người tạo, ngày/người sửa) — áp dụng cho **cả 3 loại kỳ** (Năm/Quý/Tháng). Enforce tại `adapter/controller` DTO mapping layer — response luôn include cả 4 field audit, `updatedAt`/`updatedBy` = `null` khi chưa từng sửa, KHÔNG conditionally omit field.
- **BR-AP-CMN-002** (NORMAL): Không phân biệt quyền đọc theo persona (`garage-owner` / `accountant`). Enforce bằng việc KHÔNG thêm role-based `@PreAuthorize` trên endpoint — chỉ check `authenticated` + tenant scope.
- **BR-AP-015** (NORMAL, tenant isolation): Mọi truy vấn kỳ kế toán scoped theo tenant hiện tại. Vi phạm (query thiếu tenant filter) → tiềm ẩn data breach cross-tenant — enforce tại `domain/repository` (WHERE `tenant_id = :tenantId`).

### 4.2 Tenant + auth

- Mọi request propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- Endpoint yêu cầu `authenticated` tenant user — cả `accountant` và `garage-owner` được phép, không có role gate bổ sung.
- Endpoint gate thêm bởi feature-flag `Inventory:InventoryV2` (`@FeatureOn` class-level) — flag OFF → HTTP 403 (per CR-20260707-02).

### 4.3 Idempotency + concurrency

- `GET` là safe + idempotent theo bản chất HTTP — không cần idempotency-key, không cần optimistic lock (single read, không mutate state).
- Không có concurrency concern riêng cho endpoint này (không ghi dữ liệu).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-not-found` | 404 | AC-1 | EMPTY_STATE (per EC-1 source FEAT — "Kỳ đã bị xóa bởi phiên khác" → thông báo không tìm thấy khi mở) |

> **Note nguồn**: `Architecture/api/gf-accounting-api.md` §4.3 (SSOT, v15) ghi rõ `404 ERR-CMN-not-found` cho case not-found VÀ tenant-mismatch. PKG §2.2.1 bảng V4-AP-3 ghi tắt `ERR-AP-020` NOT_FOUND — đây là ký hiệu nội bộ PKG, KHÔNG phải mã lỗi đăng ký chính thức; author dùng giá trị API doc làm authoritative theo chỉ dẫn "Architecture spec = SSOT" ngay trong PKG. Flag PKG sync follow-up (không blocking).

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-accounting`

> Feature này **KHÔNG thêm cột mới** — tái sử dụng entity `accounting_period` đã định nghĩa (schema chung với `FEAT-AP-CREATE`/`FEAT-AP-EDIT`/`FEAT-AP-DELETE`/`FEAT-AP-LIST`, `ddl-auto=update`, additive-only per ADR-019 Decision B).

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `accounting_period` | (toàn bộ 16 cột — không đổi) | — | — | — | `ddl-auto=update` (đã tồn tại) | BR-AP-003..010 | AC-2, AC-3 | Feature chỉ READ; xem `gf-accounting-data-model.md §2ter.1` cho full column list. |

### 5.2 Index / constraint changes

> Không có index mới. Feature tái sử dụng `idx_ap_parent(parent_id)` để resolve `parentBreadcrumb` (walk lên cây) và implicit PK lookup theo `id`.

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `accounting_period` | `idx_ap_parent` (đã tồn tại) | `(parent_id)` | btree | Resolve parent chain cho `parentBreadcrumb` (AC-2) | ADR-019 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| GET | `/api/v2/accounting-periods/{id}` | authenticated (`Authorization` + `X-Tenant-Id`) | — (path `id` BIGINT) | `{ id, code, name, type, parentId, parentName, parentBreadcrumb[], startDate, endDate, status, displayOrder, description, createdAt, createdBy, updatedAt, updatedBy }` | safe (read) | AC-1, AC-2, AC-3, AC-6 | — |

**Response 200 sample**:
```json
{
  "data": {
    "id": 1024,
    "code": "AP-MONTH-133-202606",
    "name": "Tháng 6/2026",
    "type": "MONTH",
    "parentId": 1020,
    "parentName": "Quý 2/2026",
    "parentBreadcrumb": [
      {"id": 1000, "name": "Năm 2026", "type": "YEAR"},
      {"id": 1020, "name": "Quý 2/2026", "type": "QUARTER"}
    ],
    "startDate": "2026-06-01",
    "endDate": "2026-06-30",
    "status": "OPEN",
    "displayOrder": 6,
    "description": null,
    "createdAt": "2026-01-15T03:00:00Z",
    "createdBy": "user:42",
    "updatedAt": "2026-01-15T03:00:00Z",
    "updatedBy": "user:42"
  }
}
```

**Not found** → `404 ERR-CMN-not-found`. Tenant mismatch → cùng `404` (KHÔNG leak existence cross-tenant).

### 6.2 Modified REST endpoints (additive)

> Không có — feature này chỉ thêm 1 endpoint mới, không sửa endpoint hiện hữu.

### 6.3 Kafka topics (publish/consume)

> Không có — endpoint read-only, không phát sinh side-effect cần publish event.

### 6.4 Cross-boundary REST consumers

> Không có — endpoint này chỉ phục vụ client (qua BFF `agg-garage-graph`), không bị consume trực tiếp bởi boundary khác. (Phân biệt với `GET /protected/v1/accounting-periods/lock-check` — endpoint cross-boundary riêng, thuộc phạm vi khác trong `EP-INVENTORY-ACCOUNTING-PERIOD`, không phải `FEAT-AP-DETAIL`.)

> **Hand-off tới BFF**: `agg-garage-graph` wrap endpoint này thành GraphQL `Query getAccountingPeriod(id: Int!): AccountingPeriod!` (passthrough, per `agg-garage-graph-graphql.md` §3e). Xem `bff/FEAT-AP-DETAIL.md` (khi được author).

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../gfaccounting/domain/model/AccountingPeriod.java` | REUSE | Entity đã tồn tại (định nghĩa cùng với `FEAT-AP-CREATE`) — không sửa | 0 | AC-2, AC-3 |
| `domain/repository` | `src/main/java/.../gfaccounting/domain/repository/AccountingPeriodRepository.java` | ADDITIVE | new finder `findByIdAndTenantId(id, tenantId)` + parent-chain lookup | ~15 | AC-1, AC-2 |
| `app/service` | `src/main/java/.../gfaccounting/app/service/AccountingPeriodService.java` | ADDITIVE | `getDetail(id)` — resolve entity + build `parentBreadcrumb` (walk `parent_id` lên gốc) | ~40 | AC-1, AC-2, AC-3 |
| `adapter/controller` | `src/main/java/.../gfaccounting/adapter/controller/AccountingPeriodController.java` | ADDITIVE | new `GET /{id}` method trong controller dùng chung 5 AP FEAT; `@FeatureOn("Inventory:InventoryV2")` class-level | ~20 | AC-1, AC-6 |
| `adapter/persistence` | `src/main/java/.../gfaccounting/adapter/persistence/AccountingPeriodJpaRepository.java` | ADDITIVE | method `findByIdAndTenantId` | ~5 | — |
| `test/unit` | `src/test/java/.../gfaccounting/app/service/AccountingPeriodServiceTest.java` | ADDITIVE | test getDetail happy / not-found / tenant-mismatch / parentBreadcrumb build (YEAR/QUARTER/MONTH) / audit-null-khi-chưa-sửa | ~90 | AC-1, AC-2, AC-3, AC-6 |
| `test/contract` | `src/test/java/.../gfaccounting/adapter/controller/AccountingPeriodControllerContractTest.java` | ADDITIVE | contract test `GET /api/v2/accounting-periods/{id}` 200/404 | ~50 | AC-1 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema (shared, không có migration mới)
    Entry: entity `accounting_period` đã tồn tại (created bởi FEAT-AP-CREATE trong cùng wave)
    Exit: schema verified local (ddl-auto=update áp dụng)
    └─► S2

S2  Repository + Service logic (query + breadcrumb build)
    Entry: S1
    Exit: unit test ≥6 green (happy/not-found/tenant-mismatch/3 loại kỳ/audit-null)
    └─► S3

S3  REST adapter (controller GET method)
    Entry: S2
    Exit: contract test green (200 + 404)
    └─► S4

S4  Integration test
    Entry: S3
    Exit: integ test green (verify tenant isolation end-to-end)
    └─► (hand-off BFF tier S5 — GraphQL passthrough getAccountingPeriod)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Xác nhận schema `accounting_period` tồn tại | db (shared) | Entity created bởi FEAT-AP-CREATE | Schema verified local | — |
| S2 | Repository finder + service `getDetail()` | domain + app | S1 | Unit test ≥6 green | S1 |
| S3 | REST adapter `GET /{id}` | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test (tenant isolation) | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-AP-CMN-001` | NORMAL | `adapter/controller` (DTO mapping) | `adapter/controller/AccountingPeriodController.java` (mapper) | AC-3 | `TC-BR-gf-accounting-AP-CMN-001-*` |
| `BR-AP-CMN-002` | NORMAL | `adapter/controller` (auth config — absence of role gate) | `adapter/controller/AccountingPeriodController.java` | AC-6 | `TC-BR-gf-accounting-AP-CMN-002-*` |
| `BR-AP-015` | NORMAL | `domain/repository` | `domain/repository/AccountingPeriodRepository.java` | AC-1 | `TC-BR-gf-accounting-AP-015-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement (hiển thị "—" khi audit null) → FE/Mobile tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (positive + negative) | test-api | 200 happy path + 404 not-found + 404 tenant-mismatch |
| AC-2 | Unit + API contract | test-api | field mapping đầy đủ cho cả 3 loại kỳ (YEAR không có parent, QUARTER/MONTH có parentBreadcrumb) |
| AC-3 | Unit | test-api | audit field null-safe khi kỳ chưa từng sửa |
| AC-6 | Isolation (RBAC) | test-isolation | dual persona (garage-owner / accountant) nhận response giống nhau |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DETAIL.md` | N/A (chưa author trong wave này) | Resolver wrap `GET /api/v2/accounting-periods/{id}` thành `Query getAccountingPeriod` (passthrough, per `agg-garage-graph-graphql.md` §3e V4-AP-Q2) |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-DETAIL.md` | N/A (chưa author trong wave này) | `AccountingPeriodDetailPage` (route `/inventory/accounting-periods/{id}`) consume BFF `getAccountingPeriod` |
| Mobile | — | N/A | Out-of-scope W04 — AP CRUD chỉ desktop (kế toán chủ yếu thao tác trên web), theo PKG §2.2.5 "Mobile out-of-scope W04". Không cần Figma link mobile để mở scope. |

**Source ID consistency** (item 18): tất cả tier file (khi được author) phải có cùng `source_feat_sha = 6e052435e13612c02a72e4a4c27a91ade119a3170e58b7953d8370de691588d4`.

## 12. References

- **Source**: [`Product/features/FEAT-AP-DETAIL.md`](../../../../../Product/features/FEAT-AP-DETAIL.md) v5
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.3 (BR-AP-CMN-001/002), §2.1 (BR-AP-015)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §4.3 (v15)
- **Data model**: [`Architecture/data/gf-accounting-data-model.md`](../../../../../Architecture/data/gf-accounting-data-model.md) §2ter.1 (v10)
- **ADR**: [`ADR-019-accounting-period-on-gf-accounting.md`](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md), [`ADR-009`](../../../../../Architecture/decisions/ADR-009-no-jpa-relationship-mapping.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-AP-DETAIL` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map per AC-ID (6/6 AC covered — AC-1/2/3/6 BE-touch, AC-4/5 N/A UI-only), §4 ràng buộc + error code (note discrepancy PKG shorthand `ERR-AP-020` vs API doc SSOT `ERR-CMN-not-found`), §5-§11 BE-specific (no new schema — reuse `accounting_period` entity, 1 GET endpoint, Hexagonal file map, sequence DAG, BR primary, test hand-off, cross-tier pair BFF+Web DRAFT-pending/Mobile N-A out-of-scope). Source FEAT chỉ audit. `authoring_inputs.fanout_map_sha`/`template_sha` chưa được orchestrator cung cấp cho spawn này — flag để populate khi regen chính thức qua `/gen-execution-spec`. |
