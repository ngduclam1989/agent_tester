---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-LIST.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-LIST"
source_feat_sha: "5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae"
generated_at: "2026-07-31T06:31:29+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Chủ garage/kế toán mở tab Tính giá xuất kho → xem danh sách log các lần tính giá (kỳ/kho/phương pháp/tài khoản/thời điểm/số mã/trạng thái), lọc theo phương pháp + ngày thực hiện, phân trang → chọn Xem/Xóa hoặc bấm Tính giá."
consumes_contracts: []
paired_bff_feats: ["FEAT-PRC-LIST"]
paired_fe_web_feats: ["FEAT-PRC-LIST"]
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "not-provided-by-orchestrator-context-bundle"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-LIST.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-02"
---

# FEAT-PRC-LIST (BE): Danh sách lịch sử tính giá xuất kho

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-LIST` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Chủ garage/kế toán mở tab Tính giá xuất kho → xem danh sách log các lần tính giá, lọc theo phương pháp + ngày thực hiện, phân trang → chọn Xem/Xóa hoặc bấm Tính giá |
| Cross-tier pair | BFF: FEAT-PRC-LIST (pending) \| Web: FEAT-PRC-LIST (pending) \| Mobile: N/A (PRC web-only) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) |
| Source version | v12 |
| Source SHA | `5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu lại các lần đã chạy tính giá vốn xuất kho theo phương pháp bình quân gia quyền cuối kỳ, để biết kỳ/kho nào đã được chốt giá, ai chạy, khi nào, và kết quả (thành công hay có lỗi). Màn hình này là cửa ngõ điều hướng: từ đây người dùng mở lại chi tiết một lần tính, xóa log không còn cần, hoặc khởi chạy một lần tính giá mới. Đây là bước khởi đầu của luồng nghiệp vụ tính giá xuất kho (PRC) trong quy trình chốt sổ kế toán cuối kỳ.

## 2. Trách nhiệm backend (gf-accounting)

- Cung cấp REST endpoint tìm kiếm phân trang trên bảng log `price_calc_run` (đọc-only — không ghi dữ liệu ở tier này).
- Trả về đầy đủ các trường hiển thị trên bảng danh sách (kỳ, khoảng ngày, kho, phương pháp, tài khoản thực hiện, thời điểm, số mã đã resolve, trạng thái) dưới dạng dữ liệu thô — không tính toán label hiển thị tiếng Việt (thuộc tier FE/BFF).
- Enforce mặc định sắp xếp theo thời điểm thực hiện giảm dần + tie-break theo thứ tự tạo log (BR-PRC-018) — SSOT tại query layer.
- Enforce tenant isolation + phạm vi garage hiện tại + phân quyền ngang nhau giữa 2 persona (BR-AP-CMN-002) — không cross-boundary call nào cần cho endpoint này.
- Loại trừ log đã xóa mềm (`deleted_at IS NULL`) khỏi kết quả tìm kiếm.
- Migration/persistence: `ddl-auto=update` (không Flyway — Common Gotcha #5) — entity `price_calc_run` là aggregate dùng chung giữa 5 FEAT-PRC-*; schema định nghĩa đầy đủ thuộc tier `FEAT-PRC-CREATE` (xem §5 note ownership).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Hiển thị danh sách

#### AC-1 → Cung cấp endpoint search mặc định phục vụ mount màn hình

- **Khi**: FE gọi `POST /api/v2/price-calc-runs/search` không kèm filter (mount lần đầu).
- **BE phải**: trả trang đầu (`page=0, size=20`) sắp xếp mặc định `executedAt DESC` (BR-PRC-018), loại log đã xóa mềm; trả `content: []` + `totalElements: 0` khi chưa có log nào (phục vụ empty state EC-1 — dữ liệu, KHÔNG phải hiển thị illustration, đó là FE).
- **Output**: `PagedApiResponse` gồm `content[]`, `totalElements`, `totalPages`, `page`, `size`.
- **Failure mode**: feature flag `Inventory:InventoryV2` off → 403 (§4.2).
- **Ref**: BR-AP-CMN-002 (§9), entity `price_calc_run` (§5.1), endpoint `POST /api/v2/price-calc-runs/search` (§6.1)

#### AC-2 → Trả đầy đủ trường cột hiển thị (dữ liệu thô)

- **Khi**: mỗi bản ghi trong `content[]` của response search.
- **BE phải**: include `id`, `periodId`/`periodName`, `fromDate`/`toDate`, `warehouseId`/`warehouseCode`/`warehouseName`, `pricingMethod`, `executedBy`/`executedByName`, `executedAt`, `scope`, `itemsResolvedCount`, `itemsDoneCount`, `itemsErrorCount`, `status` (raw enum `PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS`). Cột "STT"/"Thao tác" là FE-derived (index + action buttons), KHÔNG cần field riêng từ BE.
- **BE KHÔNG được**: tự map `status` thành nhãn tiếng Việt ("Đang tính"/"Thành công"/"Hoàn thành có lỗi") — enum raw 4 giá trị trả nguyên, việc gộp hiển thị `PENDING`+`RUNNING` → "Đang tính" là trách nhiệm tier FE/BFF (BR-PRC-014 — 3 giá trị hiển thị là UI concern).
- **Output**: xem §6.1 response schema.
- **Failure mode**: N/A (read path, không có validation riêng per-row).
- **Ref**: BR-PRC-014, BR-PRC-016 (§9 — chỉ pass-through, không enforce ghi), field spec (§6.1)

#### AC-3 → Mỗi dòng = 1 lần chạy, sort mặc định + tie-break

- **Khi**: server thực thi query search (mọi request, có/không filter).
- **BE phải**: `ORDER BY executed_at DESC, id DESC` làm mặc định khi `sort` param không truyền (BR-PRC-018 — "log tạo sau đứng trước" khi trùng thời điểm ⇒ tie-break theo PK tăng dần thời gian tạo, tức `id DESC`); KHÔNG group/merge các log cùng (kỳ+kho) — mỗi row trong `price_calc_run` trả về nguyên vẹn 1 dòng (việc log lần tính mới được tạo khi bấm "Tính giá" lại thuộc trách nhiệm ghi của `FEAT-PRC-CREATE` — xem N/A note dưới).
- **Output**: danh sách đã sort, không dedupe theo (kỳ, kho).
- **Failure mode**: N/A.
- **Ref**: BR-PRC-018 (primary, §9), BR-PRC-010 (context — ghi log mới thuộc `FEAT-PRC-CREATE`, xem §11)

### Cluster B — Bộ lọc & thao tác

#### AC-4 → Bộ lọc theo phương pháp + ngày thực hiện

- **Khi**: FE gửi `pricingMethod` và/hoặc `executedFrom`/`executedTo` trong request body.
- **BE phải**: filter theo `pricing_method` (hiện chỉ có `PWA`) và range trên `executed_at`; giữ `warehouseId` là param tùy chọn hỗ trợ ở API layer (cho consumer khác/tương lai) nhưng KHÔNG bắt buộc FE-web render như 1 filter control (kho là tenant/garage-context-derived — xem §11 hand-off FE).
- **Output**: `content[]` đã filter, giữ nguyên sort mặc định trừ khi `sort` override.
- **Failure mode**: `executedFrom`/`executedTo` sai format ISO-8601 → `ERR-CMN-validation` 400.
- **Ref**: BR-PRC-018 (sort không đổi khi filter, §9), endpoint request schema (§6.1)

#### AC-5 → Phân trang

- **Khi**: FE gửi `page`/`size` hoặc dùng default.
- **BE phải**: default `page=0, size=20`; validate `size <= 100`, `page >= 0`.
- **Output**: `totalElements`, `totalPages`, `page`, `size` trong response.
- **Failure mode**: `size > 100` → `ERR-CMN-validation` 400.
- **Ref**: endpoint request schema (§6.1)

#### AC-6 → Thao tác (Xem / Xóa / Tính giá) → N/A tại tier LIST

- BE của tier LIST không implement các thao tác này — mỗi thao tác là 1 REST endpoint riêng thuộc chính boundary `gf-accounting` nhưng được đặc tả ở execution spec khác cùng tier `be`: **Xem** → `GET /api/v2/price-calc-runs/{id}` (`FEAT-PRC-DETAIL`); **Xóa** → `DELETE /api/v2/price-calc-runs/{id}` (`FEAT-PRC-DELETE`); **"Tính giá"** → `POST /api/v2/price-calc-runs` (`FEAT-PRC-CREATE`). LIST tier chỉ cung cấp dữ liệu để FE render nút/link điều hướng; xem `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DETAIL.md`, `FEAT-PRC-DELETE.md`, `FEAT-PRC-CREATE.md` (sibling authoring, không phải scope file này).

### Cluster C — Phân quyền & tenant

#### AC-7 → Phân quyền và phạm vi garage

- **Khi**: mọi request tới `POST /api/v2/price-calc-runs/search`.
- **BE phải**: filter `WHERE tenant_id = :currentTenantId` (Critical Rule #4); phạm vi garage lấy từ `X-Branch-Id` header (garage-scoped); KHÔNG áp thêm role-based restriction ngoài "đã xác thực" — `garage-owner` và `accountant` có quyền đọc ngang nhau (BR-AP-CMN-002, không phân biệt role ở tầng authorization cho endpoint này).
- **Output**: chỉ trả log thuộc tenant + garage hiện tại.
- **Failure mode**: `X-Tenant-Id` mismatch → 403; feature flag `Inventory:InventoryV2` off cho tenant → 403.
- **Ref**: BR-AP-CMN-002 (§9), Critical Rule #4 tenant isolation (§4.2)

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-PRC-018** (NORMAL): mặc định sort `executed_at DESC, id DESC` — enforce tại query/repository layer (Specification/JPQL `ORDER BY`), override được khi FE truyền `sort` param tường minh. Vi phạm (không áp default) → dev bug, không phải error code runtime.
- **BR-AP-CMN-002** (NORMAL): dual persona quyền đọc ngang nhau trên toàn bộ danh sách — enforce tại authorization layer (Spring Security — chỉ check "authenticated", KHÔNG check role cụ thể cho endpoint này).
- **BR-PRC-014** (NORMAL, secondary tại LIST): `status` là 1 trong 4 enum giá trị (`PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS`) — enforce chính tại CHECK constraint `chk_prc_status` trên entity (ownership schema thuộc `FEAT-PRC-CREATE` tier); LIST chỉ pass-through, không enforce ghi.
- **BR-PRC-009 / BR-PRC-016 / BR-PRC-010 / BR-PRC-001**: KHÔNG enforce tại tier LIST — các rule này chi phối việc GHI log (CREATE) và tính toán BQGQ (CREATE/RECALC); LIST chỉ đọc dữ liệu đã persist. Xem `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-CREATE.md` cho enforcement primary.

### 4.2 Tenant + auth

- Mọi request propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10) — filter `WHERE tenant_id = :currentTenantId` bắt buộc trong mọi query (kể cả khi không có filter khác).
- `X-Branch-Id` (garage scope) resolve `garage_id` filter — tenant có nhiều garage chỉ thấy log của garage hiện tại.
- Class-level feature flag gate `Inventory:InventoryV2` trên `PriceCalcRunController` (mirror pattern OB) — tenant chưa bật flag → 403 toàn bộ controller.
- Cả `accountant` và `garage-owner` đều có quyền gọi endpoint này (BR-AP-CMN-002) — không thêm `@PreAuthorize` role-restrictive.

### 4.3 Idempotency + concurrency

- N/A — `POST /search` là read-only, an toàn để retry (safe theo semantics HTTP dù dùng method POST vì filter phức tạp không fit query string).
- Không cần optimistic locking (không ghi dữ liệu ở endpoint này).

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-4 (executedFrom/executedTo malformed) | TOAST |
| `ERR-CMN-validation` | 400 | AC-5 (`size > 100`, `page < 0`) | TOAST |
| (tenant-mismatch, no registry code) | 403 | AC-7 | EMPTY_STATE (FE quyết định, BE chỉ trả 403 generic) |
| (feature-flag-off, no registry code) | 403 | AC-1 | EMPTY_STATE / route-guard (FE tier) |
| (unauthenticated) | 401 | AC-7 | redirect login (FE tier) |

---

## 5. Schema delta (BE — contract focus)

> Entity `price_calc_run` là **aggregate root dùng chung** giữa 5 FEAT-PRC-* (LIST/DETAIL/CREATE/RECALC/DELETE) trong cùng boundary `gf-accounting`. Toàn bộ ~30 cột + constraint canonical đã định nghĩa tại `Architecture/data/gf-accounting-data-model.md §2quater.1` v14. Tier LIST **KHÔNG tạo/sửa entity** — chỉ liệt kê subset cột dùng trong search + response projection dưới đây. Ownership đầy đủ (bao gồm entity Java class definition ban đầu) thuộc `FEAT-PRC-CREATE` tier spec (endpoint ghi đầu tiên).

### 5.1 Entity columns dùng bởi LIST — `price_calc_run` (REUSE, không đổi schema)

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `price_calc_run` | `tenant_id`, `garage_id` | BIGINT | N | — | ddl-auto=update | Critical Rule #4 | AC-7 | Tenant + garage scope filter |
| `price_calc_run` | `period_id`, `period_name_snapshot`, `from_date`, `to_date` | BIGINT / VARCHAR(255) / DATE | N | — | ddl-auto=update | — | AC-2 | Cột "Kỳ kế toán" / "Từ ngày" / "Đến ngày" |
| `price_calc_run` | `warehouse_id`, `warehouse_code`, `warehouse_name` | BIGINT / VARCHAR(50) / VARCHAR(255) | N | — | ddl-auto=update | BR-PRC-001 | AC-2, AC-4 | Cột "Kho" + filter tùy chọn |
| `price_calc_run` | `pricing_method` | VARCHAR(20) | N | `'PWA'` | ddl-auto=update | BR-PRC-012 | AC-2, AC-4 | Cột "Phương pháp tính giá vốn" + filter |
| `price_calc_run` | `executed_by`, `executed_at` | VARCHAR(255) / TIMESTAMPTZ | N | NOW() | ddl-auto=update | — | AC-2, AC-3, AC-4 | Cột "Tài khoản thực hiện" / "Ngày giờ thực hiện" + sort key BR-PRC-018 |
| `price_calc_run` | `scope` | VARCHAR(20) | N | — | ddl-auto=update | BR-PRC-009 | AC-2 | `ALL \| SPECIFIC` |
| `price_calc_run` | `items_resolved_count`, `items_done_count`, `items_error_count` | INTEGER | N | 0 | ddl-auto=update | BR-PRC-016 | AC-2 | Cột "Số mã" (resolved) + aggregate DONE/ERROR |
| `price_calc_run` | `status` | VARCHAR(30) | N | `'PENDING'` | ddl-auto=update | BR-PRC-014 | AC-2 | Enum 4 giá trị — trả raw |
| `price_calc_run` | `deleted_at` | TIMESTAMPTZ | Y | — | ddl-auto=update | BR-PRC-011 | AC-1 | Soft-delete filter `IS NULL` bắt buộc |

> **Boundary migration policy**: `gf-accounting` dùng `ddl-auto=update` (Common Gotcha #5) — **KHÔNG viết Flyway migration file** cho entity này.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `price_calc_run` | `idx_prc_run_tenant_garage_wh` | `(tenant_id, garage_id, warehouse_id, executed_at DESC)` | B-tree | Default sort BR-PRC-018 + W06-1 search performance (p95 ≤300ms) | ADR-027 |

> **Lưu ý drift liên tài liệu (informational, không block)**: `Architecture/api/gf-accounting-api.md §5.1` Semantics note ghi nhầm cột index là `created_at DESC`; `Architecture/hld/gf-accounting-HLD.md §12.3` cũng ghi `created_at DESC`. Cột **`created_at` KHÔNG tồn tại làm sort key nghiệp vụ** — canonical schema (`gf-accounting-data-model.md §2quater.1` v14, cột `executed_at` note "BR-PRC-018 sort key") + PKG-W06 §2.2.1 đều thống nhất `executed_at DESC`. Dev BE implement theo `executed_at DESC` (khớp BR-PRC-018 "Ngày giờ thực hiện") — đã log quyết định tại `_decisions.md`.

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v2/price-calc-runs/search` | JWT + `X-Tenant-Id` + `X-Branch-Id` | `{ warehouseId?, pricingMethod?, executedFrom?, executedTo?, page, size, sort }` | `{ content: [{id, periodId, periodName, fromDate, toDate, warehouseId, warehouseCode, warehouseName, pricingMethod, executedBy, executedByName, executedAt, scope, itemsResolvedCount, itemsDoneCount, itemsErrorCount, status}], totalElements, totalPages, page, size }` | safe (read) | AC-1 – AC-5 | — |

> **references_verbatim**: `{"endpoint": "POST /api/v2/price-calc-runs/search", "source": "Architecture/api/gf-accounting-api.md:1151-1249 (§5.1 W06-1)"}` — verified grep-verbatim trực tiếp từ SSOT (bundle §G API block bị flag `⚠️` do keyword-match sai section "List" của AP module — KHÔNG dùng bundle, đã fallback đọc trực tiếp Architecture doc theo F-7).

### 6.2 Modified REST endpoints (additive)

N/A — endpoint hoàn toàn mới, không sửa hành vi baseline nào.

### 6.3 Kafka topics (publish/consume)

N/A — LIST là read path thuần túy, không publish/consume event.

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `POST /api/v2/price-calc-runs/search` | `agg-garage-graph` (BFF GraphQL query passthrough) | Khi FE mount màn danh sách / đổi filter / đổi trang | HTTP 4xx/5xx → BFF map sang GraphQL error, FE hiển thị toast lỗi chung | sync, fail fast (không retry tự động; user tự refresh) |

> **Hand-off tới BFF**: `agg-garage-graph` (tier `bff`, file `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-LIST.md`, đang authoring song song) sẽ wrap endpoint này thành GraphQL query (canonical op name theo `gf-accounting-api.md §6 Naming Registry` — KHÔNG describe GraphQL ở đây). `executedByName` enrichment (username từ `iamUserId`) là trách nhiệm BFF-side (Pattern TENANT-USERS, mirror OB pattern) — BE chỉ trả `executedBy` (iamUserId thô).

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**`. Entity/controller là aggregate dùng chung với sibling FEAT-PRC-* — nếu `FEAT-PRC-CREATE` đã tạo class trước, các dòng NEW dưới đổi thành ADDITIVE (method mới trên class có sẵn); dev tự xác nhận theo trình tự impl thực tế trong sprint.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `src/main/java/.../domain/model/PriceCalcRun.java` | REUSE | không đổi (schema ownership: FEAT-PRC-CREATE) | 0 | AC-2 |
| `domain/repository` | `src/main/java/.../domain/repository/PriceCalcRunRepository.java` | ADDITIVE | new finder + Specification (filter + sort) | ~25 | AC-1, AC-3, AC-4, AC-5 |
| `app/dto` | `src/main/java/.../app/dto/PriceCalcRunSearchRequest.java` | NEW | request DTO | ~15 | AC-4, AC-5 |
| `app/dto` | `src/main/java/.../app/dto/PriceCalcRunSummaryResponse.java` | NEW | response DTO (raw field projection) | ~20 | AC-2 |
| `app/service` | `src/main/java/.../app/service/PriceCalcRunService.java` | NEW hoặc ADDITIVE (nếu class đã tồn tại) | search method | ~35 | AC-1 – AC-5, AC-7 |
| `adapter/controller` | `src/main/java/.../adapter/controller/PriceCalcRunController.java` | NEW hoặc ADDITIVE | search endpoint (feature-flag gated class-level) | ~25 | AC-1 |
| `infrastructure/persistence` | `src/main/java/.../infrastructure/persistence/jpa/PriceCalcRunJpaRepository.java` | ADDITIVE | Specification query method | ~10 | AC-4 |
| `test/unit` | `src/test/java/.../app/service/PriceCalcRunServiceTest.java` | ADDITIVE | search filter/sort/pagination test methods | ~120 | AC-1 – AC-7 |
| `test/contract` | `src/test/java/.../adapter/controller/PriceCalcRunSearchContractTest.java` | NEW | contract test | ~60 | AC-1, AC-4, AC-5, AC-7 |

> **Package convention (chốt cho W06 — `CR-20260801-06` APPROVED 2026-08-02)**: JPA entity/repository-impl/mapper → `infrastructure/persistence/{entity,jpa,repository,mapper}/` (repo hiện có; `adapter/` chỉ gồm `{client, config, controller}`, **không có** `adapter/persistence`). Xem `FEAT-PRC-CREATE.md §7` cho chi tiết đầy đủ.

> `db/migration` — N/A, `ddl-auto=update` (Common Gotcha #5).

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Confirm entity availability (reuse, không tạo mới nếu FEAT-PRC-CREATE đã deploy trước)
    Entry: KG/data-model §2quater.1 stable
    Exit: entity `price_calc_run` present local (via ddl-auto=update)
    └─► S2

S2  Repository Specification (filter + sort + soft-delete exclude) + Service search method
    Entry: S1
    Exit: unit test ≥8 green (default sort, tie-break, filter combos, empty state)
    └─► S3

S3  REST adapter (controller search endpoint, feature-flag gate)
    Entry: S2
    Exit: contract test green (pagination boundary, tenant isolation, dual persona)
    └─► S4

S4  Integration test (tenant + garage scope, no cross-boundary REST needed for LIST)
    Entry: S3
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Confirm entity reuse | domain | data-model stable | Entity present local | — |
| S2 | Repository Specification + Service search | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter (controller) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test (tenant/garage isolation) | test/integration | S3 | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-PRC-018` | NORMAL | repository (query ORDER BY, default) | `domain/repository/PriceCalcRunRepository.java` | AC-3 | `TC-BR-gf-accounting-PRC018-*` |
| `BR-AP-CMN-002` | NORMAL | security (authenticated-only, no role restriction) | `adapter/controller/PriceCalcRunController.java` | AC-7 | `TC-BR-gf-accounting-APCMN002-LIST-*` |
| `BR-PRC-014` | NORMAL (secondary tại LIST — primary tại CREATE/RECALC) | domain (CHECK constraint, schema shared) | `domain/model/PriceCalcRun.java` (ownership FEAT-PRC-CREATE) | AC-2 | `TC-BR-gf-accounting-PRC014-LIST-*` |

> **Enforcement layer priority**: primary phải ở `domain/` hoặc `app/service/` (SSOT). Rule `BR-PRC-009/016/010/001` KHÔNG có enforcement layer tại tier LIST — enforcement primary ở `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC` (write path). UI label mapping (vd `PENDING`+`RUNNING` → "Đang tính") → tier FE/BFF secondary (xem §11).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (default search, empty state data shape) | test-api | mount default filter — `content: []` khi chưa có log |
| AC-2 | API contract (field completeness, raw enum) | test-api | verify tất cả field response present, `status` không bị map label |
| AC-3 | API contract (sort order) + Integration (multiple runs cùng kỳ+kho) | test-api | BR-PRC-018 tie-break `id DESC` |
| AC-4 | API contract (filter pricingMethod/executedFrom/executedTo) | test-api | `warehouseId` optional, không có FE control tương ứng |
| AC-5 | API contract (pagination boundary `size>100` → 400) | test-api | default page=0/size=20 |
| AC-6 | N/A (UI navigation) | test-ui | xem `fe-web/FEAT-PRC-LIST.md` §3 AC-6 |
| AC-7 | Isolation (tenant + garage scope) + Permission (dual persona) | test-isolation | 2 tenant, 2 garage, 2 persona matrix |

## 11. Cross-tier coordination (BE perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-LIST.md` | PENDING (Batch C authoring song song) | Resolver wrap §6.1 endpoint thành GraphQL query; enrich `executedByName` |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-LIST.md` | PENDING (Batch D authoring song song) | UI danh sách, filter control (KHÔNG render `warehouseId` filter), map `status` enum → nhãn tiếng Việt |
| Mobile | N/A | N/A | PRC là web-only (PKG-W06 §Overview — mobile chỉ `FEAT-STK-LIST-V2`) |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) v12
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md) §2.2 (BR-PRC-*), §2.3 (BR-AP-CMN-*)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md) §12.3
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §5.1 (W06-1)
- **Data model**: [`Architecture/data/gf-accounting-data-model.md`](../../../../../Architecture/data/gf-accounting-data-model.md) §2quater.1
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`](../../../../../Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md) (context — không dùng bởi LIST trực tiếp)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 3 | main-agent (CR batch W06, approver sonhoang) | **Apply `CR-20260801-06` (MINOR, APPROVED) — phần mở rộng scope còn sót.** §7 File impact map — cột package của `PriceCalcRunJpaRepository.java` từ `adapter/persistence` (không tồn tại trong repo) → `infrastructure/persistence/jpa/`, khớp precedent đã chốt tại `FEAT-PRC-CREATE.md §7`. Thêm blockquote cite CR. **KHÔNG đụng**: AC, schema, REST contract. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-PRC-LIST` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map cover 7/7 AC-ID (AC-6 declared N/A tại tier LIST — thao tác thuộc endpoint sibling), §4 ràng buộc + error code, §5-§11 BE-specific (schema shared-entity note + REST §5.1 W06-1 verified grep-verbatim từ Architecture SSOT sau khi bundle §G API bị flag stale/wrong-section + Hexagonal file map + sequence + BR primary + test + cross-tier pair). Source FEAT chỉ audit. |
