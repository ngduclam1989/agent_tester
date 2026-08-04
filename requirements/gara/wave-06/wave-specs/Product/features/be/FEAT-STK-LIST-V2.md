---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-LIST-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-LIST-V2"
source_feat_sha: "0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 2
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory"]
modifies: ["FEAT-STK-LIST"]
change_type: "brownfield-enhancement"
demo_signature: "Kế toán mở Báo cáo tồn kho, lọc tồn tại 1 ngày trên nhiều kho → thấy SL/GT tồn thực tế theo (mã+kho) + dòng Tổng, xuất Excel đúng mẫu chuẩn."
consumes_contracts: []
paired_bff_feats: ["FEAT-STK-LIST-V2"]
paired_fe_web_feats: ["FEAT-STK-LIST-V2"]
paired_mobile_feats: ["FEAT-STK-LIST-V2"]
authoring_inputs:
  kg_baseline_sha: "456501785dfb5c1dc96209a4e2208c7689e3e8db3b654eeaea6decabe649bb2b"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "not-computed (author subagent has no shell/sha256 tool access)"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-LIST-V2.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-LIST-V2 (BE): Báo cáo tồn kho đến ngày

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST-V2` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory` |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán mở Báo cáo tồn kho, lọc tồn tại 1 ngày trên nhiều kho → thấy SL/GT tồn thực tế theo (mã+kho) + dòng Tổng, xuất Excel đúng mẫu chuẩn. |
| Cross-tier pair | BFF: `agg-garage-graph` (passthrough, xem §11) \| Web: `garage-web` (xem §11) \| Mobile: `FEAT-STK-LIST-V2` (duy nhất trong nhóm Stock V2 có mặt trên mobile W06) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-LIST-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) |
| Source version | v10 |
| Source SHA | `0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần biết chính xác tồn kho (số lượng + giá trị) của từng mã sản phẩm nội bộ tại bất kỳ thời điểm nào để phục vụ kiểm kê, đối soát sổ sách và quyết định nhập hàng. Feature cung cấp báo cáo tồn kho realtime, đọc trực tiếp từ sổ tồn (stock ledger), tách riêng theo từng kho, cho phép lọc theo ngày/kho/mã và xuất file Excel theo mẫu chuẩn. Đây là báo cáo đầu tiên trong nhóm 3 báo cáo Stock V2 (cùng NXT và thẻ kho), nằm ở cuối luồng nghiệp vụ: sau khi nhập/xuất kho và chạy tính giá bình quân gia quyền cuối kỳ (BQGQ), báo cáo phản ánh đúng số liệu đã chốt. Feature triển khai song song trên Web GMS và App Garage — duy nhất trong 3 báo cáo Stock V2 có mặt trên mobile W06.

## 2. Trách nhiệm backend (gf-inventory)

- Expose 2 REST endpoint mới — `POST /api/v1/stock-ledgers/at-date/search` (danh sách + phân trang + dòng Tổng) và `GET /api/v1/stock-ledgers/at-date/export` (xuất Excel) — đọc trực tiếp bảng `inventory_stock_ledger` hiện có (không tạo entity/cột mới).
- Enforce logic tính toán cốt lõi của báo cáo tại service layer: tồn-đến-ngày D = dòng sổ tồn gần nhất có `movement_date ≤ D`; giá trị tồn luôn hiển thị dạng số (0 nếu mã chưa chạy BQGQ, không có state "Tạm tính"); chỉ giữ mã có SL≠0 HOẶC GT≠0 tại ngày lọc.
- Enforce tách dòng theo (mã + kho) — không gộp kho dù filter nhiều kho/tất cả kho — và không nhận filter theo Garage (tenant/branch context tự xác định, không phải request param).
- Compute dòng Tổng (`aggregates`) server-side trên toàn bộ tập kết quả đã filter, trước khi phân trang.
- Sinh file `.xlsx` bám đúng mẫu chuẩn `Báo cáo tồn kho.xlsx` (tên sheet / cột / thứ tự / định dạng số / merge / header), loại bỏ cột UI-only "Thao tác".
- Gate cả 2 endpoint bằng feature flag `@FeatureOn(Inventory:InventoryV2)` + tenant/branch context; không phân biệt role — `accountant` và `garage-owner` có quyền truy cập ngang nhau.

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Mở màn & hiển thị dữ liệu

#### AC-1 → Expose search endpoint với default filter

- **Khi**: FE (tab "Báo cáo tồn kho" Web GMS hoặc tile "Tồn kho" mobile hub) gọi `POST /api/v1/stock-ledgers/at-date/search` lần đầu (không truyền filter — `asOfDate` mặc định = hôm nay, `page=0`, `size=20`, `sort=productCode,asc`).
- **BE phải**: kiểm tra feature flag `Inventory:InventoryV2` đang bật cho tenant trước khi xử lý; nếu tắt → chặn ngay ở layer trước service.
- **Output**: `PagedApiResponse<StockLedgerAtDateItem>` kèm `aggregates` + `totalElements`/`totalPages`.
- **Failure mode**: `403 FORBIDDEN` khi feature flag tắt hoặc tenant mismatch; `401` khi thiếu/invalid token.
- **Ref**: BR-STKV2-006 (§9), endpoint `POST /api/v1/stock-ledgers/at-date/search` (§6.1).

#### AC-2 → Trả đủ field cột hiển thị + dòng Tổng

- **Khi**: build mỗi row trong `content[]` của response.
- **BE phải**: include đủ field nghiệp vụ (`productCode`, `productName`, `mainUnitCode`, `warehouseCode`, `warehouseName`, `quantityOnHand`, `valueOnHand`) join từ `internal_product` + `warehouse`; KHÔNG trả field "action" — cột "Thao tác" là UI-only, FE tự build link từ `productCode`+`warehouseCode` đã có sẵn trong row.
- **Output**: `content[]` shape cố định + `aggregates{totalQuantity, totalValue}`.
- **Failure mode**: N/A (read-only).
- **Ref**: BR-STKV2-006 (§9), DTO `StockLedgerAtDateItem` (§5.1 note, §6.1).

#### AC-3 → Tính SL tồn & GT tồn theo ngày

- **Khi**: build `quantityOnHand`/`valueOnHand` cho mỗi row.
- **BE phải**: query dòng sổ tồn có `movement_date = max(movement_date ≤ asOfDate)` cho mỗi `(product_id, warehouse_id)` — lấy `closing_qty`/`closing_value` trực tiếp (không cộng dồn từ đầu); ngày trước mốc tồn đầu (OB) → SL=0, GT=0; ngày tương lai → dùng dòng gần nhất hiện có; mã chưa chạy BQGQ → GT vẫn là số thật (tồn đầu + nhập − 0), không phải "Tạm tính".
- **Output**: `quantityOnHand` (DECIMAL 18,6), `valueOnHand` (DECIMAL 18,2 VND) — luôn là số.
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-001(b), BR-STKV2-002 (§9), query pattern (§6.1).

### Cluster B — Bộ lọc & nhóm dữ liệu

#### AC-4 → Nhận & validate bộ lọc

- **Khi**: client gửi `asOfDate`/`warehouseIds[]`/`keyword`/`page`/`size`/`sort` trong request body.
- **BE phải**: validate `asOfDate` ISO-8601 và không ở tương lai; `warehouseIds` rỗng/omit = tất cả kho của tenant; `keyword` LIKE-unaccent trên `internal_product.code`/`name`; `sort` whitelist 5 cột; KHÔNG nhận filter theo Garage — tenant/branch tự xác định từ context, không phải request param.
- **Output**: tập kết quả đã filter + paginate.
- **Failure mode**: `400 ERR-CMN-validation` khi `asOfDate` malformed/future, `size > 100`, `sort` ngoài whitelist, `keyword` > 200 ký tự.
- **Ref**: BR-STKV2-004, BR-STKV2-008 (§9), request schema (§6.1).

#### AC-5 → Tách dòng theo kho

- **Khi**: 1 mã tồn tại ở ≥2 kho trong tập kết quả.
- **BE phải**: `GROUP BY (tenant_id, product_id, warehouse_id)` — mỗi (mã + kho) luôn là 1 row riêng, kể cả khi filter nhiều kho/tất cả kho.
- **Output**: N dòng riêng biệt cho N kho của cùng 1 mã.
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-003 (§9), query pattern (§6.1).

#### AC-6 → Lọc mã theo điều kiện SL≠0 HOẶC GT≠0

- **Khi**: build WHERE clause trên tập đã narrow theo `max(movement_date) ≤ asOfDate`.
- **BE phải**: chỉ giữ row có `(closing_qty <> 0 OR closing_value <> 0)`; áp dụng lại mỗi lần `asOfDate` đổi (cùng mã có thể xuất hiện/biến mất tùy ngày lọc).
- **Output**: danh sách mã thỏa điều kiện OR — bắt cả case SL=0 nhưng GT≠0 (chênh lệch làm tròn giá vốn bình quân sau BQGQ).
- **Failure mode**: N/A.
- **Ref**: BR-STKV2-007 v13 (§9), query pattern (§6.1).

### Cluster C — Thao tác & phân quyền

#### AC-7 → N/A (UI navigation, fe-web tier)

- Source AC này là điều hướng UI thuần (click "Xem lịch sử" → chuyển màn Thẻ kho `FEAT-STK-DETAIL-V2`). BE không có endpoint riêng cho action này — FE tự navigate dùng `productCode`+`warehouseCode` đã có sẵn trong row (§3 AC-2). Mobile W06 không render action này (BR-STKV2-016) — đây là cấu hình hiển thị ở mobile-tier, BE không cần gate riêng. Xem `fe-web/FEAT-STK-LIST-V2.md §3 AC-7`.

#### AC-8 → Xuất file Excel đúng mẫu chuẩn

- **Khi**: client gọi `GET /api/v1/stock-ledgers/at-date/export` với cùng bộ filter (`asOfDate`/`warehouseIds`/`keyword`/`sort` — không phân trang).
- **BE phải**: chạy lại đúng query filter (không giới hạn `page`/`size`) → build file `.xlsx` bám mẫu chuẩn `Báo cáo tồn kho.xlsx` (tên sheet/cột/thứ tự/định dạng số/merge/header theo mẫu) — loại bỏ cột "Thao tác" (UI-only).
- **Output**: file `.xlsx` stream (`Content-Disposition: attachment`).
- **Failure mode**: `400` khi filter invalid (giống search); `403` khi flag tắt/tenant mismatch; `5xx` khi lỗi sinh file.
- **Ref**: BR-STKV2-005 (§9), endpoint `GET /api/v1/stock-ledgers/at-date/export` (§6.1).

#### AC-9 → Phân quyền ngang nhau (dual persona)

- **Khi**: bất kỳ request nào tới 2 endpoint trên.
- **BE phải**: chỉ enforce authenticated + đúng tenant/branch (JWT + `X-Tenant-Id` + `X-Branch-Id`) — KHÔNG thêm role check phân biệt `accountant`/`garage-owner`; cả 2 role có quyền truy cập ngang nhau.
- **Output**: response identical bất kể role.
- **Failure mode**: `401` khi thiếu/invalid token; `403` khi tenant mismatch (không phải do role).
- **Ref**: BR-STKV2-015 (§9), §4.2 Tenant + auth.

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-STKV2-001** (CORNERSTONE): sổ tồn ghi biến động ngày + tồn cuối ngày; tồn-đến-ngày D = dòng gần nhất ≤ D — enforce tại repository query (JOIN + `GROUP BY` max `movement_date`). Vi phạm → sai lệch số liệu báo cáo (bug class, không có error code riêng vì đây là read path).
- **BR-STKV2-002** (CORNERSTONE): giá trị tồn = GT đầu + GT nhập − giá vốn xuất (giá vốn xuất = 0 nếu chưa BQGQ); luôn hiển thị số, không "Tạm tính" — enforce tại service: BE chỉ đọc lại `closing_value` đã persist (không tính lại giá trị ở tầng report).
- **BR-STKV2-003** (NORMAL): tách dòng theo (mã + kho) — enforce tại repository `GROUP BY`.
- **BR-STKV2-004** (NORMAL): không filter theo Garage — enforce tại request DTO: không expose param `garageId`, scope tự lấy từ `TenantContext`.
- **BR-STKV2-005** (CORNERSTONE): export bám mẫu Excel chuẩn (sheet/cột/thứ tự/định dạng/header) — enforce tại `ExportService`, KHÔNG xuất cột UI-only "Thao tác".
- **BR-STKV2-006** (CORNERSTONE): báo cáo theo 1 mốc "đến ngày" D, tập cột chuẩn — enforce tại request validation + DTO field set.
- **BR-STKV2-007 v13** (CORNERSTONE): hiển thị mã có SL≠0 HOẶC GT≠0 tại ngày lọc (điều kiện OR, không phải `SL > 0`) — enforce tại query WHERE clause.
- **BR-STKV2-008** (NORMAL): bộ lọc search mã/tên + Kho + Ngày — enforce tại request DTO + query LIKE-unaccent.
- **BR-STKV2-015** (CORNERSTONE): 2 role quyền ngang nhau — enforce bằng việc KHÔNG có `@PreAuthorize` role-based, chỉ tenant/branch check.
- **BR-INV-MENU-004** → N/A cho BE tier này. Rule này chi phối entry-point tile "Tồn kho" trong hub mobile (`FEAT-INV-MOBILE-MENU`, cross-wave state-matrix update thuộc boundary `garage-mobile`) — không phải trách nhiệm `gf-inventory`. Xem `mobile/FEAT-STK-LIST-V2.md`.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4).
- Cả 2 endpoint (search + export) yêu cầu authenticated user (JWT) — role `accountant` HOẶC `garage-owner` đều pass, không phân biệt (BR-STKV2-015).
- Feature flag `@FeatureOn(Inventory:InventoryV2)` gate ở class-level controller — tenant chưa bật → `403 FORBIDDEN`.

### 4.3 Idempotency + concurrency

- Cả 2 endpoint đều là read-only, idempotent tự nhiên theo REST safe-method semantics — không cần idempotency-key.
- Không có write path trong FEAT này — không cần optimistic locking/version field.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-validation` | 400 | AC-4, AC-8 | INLINE |
| Unauthenticated | 401 | AC-9 | TOAST |
| `FORBIDDEN` (feature flag off / tenant mismatch) | 403 | AC-1, AC-9 | TOAST |
| Warehouse not found (defensive) | 404 | AC-4 | TOAST |
| Unexpected | 500 | AC-1, AC-8 | TOAST |
| Downstream aggregation timeout | 504 | AC-1 | TOAST |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-inventory`

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | KHÔNG có migration | — | — | Không có entity/cột mới. Feature 100% đọc read-only từ `InventoryStockLedger` (cột `closing_qty`/`closing_value`/`movement_date`, đã có từ W04), `InternalProduct` (W03), `Warehouse` (baseline). |

> **Boundary migration policy** (xem `rules-backend` skill): `gf-inventory` dùng Flyway V{N+1} additive khi có schema change — không áp dụng cho FEAT này vì không có schema change.

### 5.2 Index / constraint changes

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `inventory_stock_ledger` | `idx_ledger_lookup` (existing — **REUSE, không tạo mới**) | `(tenant_id, product_id, warehouse_id, movement_date DESC)` | btree | Lookup dòng gần nhất `movement_date ≤ asOfDate` per (product, warehouse) — phục vụ AC-3/AC-5/AC-6; index đã tồn tại từ W04 (dùng chung với PRC-facing `W06-P1`) | ADR-020 |

> Điều kiện lọc `(closing_qty <> 0 OR closing_value <> 0)` (AC-6) là residual post-filter trên tập đã narrow bởi `idx_ledger_lookup` — không cần index riêng cho 2 cột này.

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| POST | `/api/v1/stock-ledgers/at-date/search` | JWT (authenticated + tenant + branch; `accountant`/`garage-owner` ngang quyền) | `{asOfDate, warehouseIds[]?, keyword?, page?, size?, sort?}` | `{data:{content[], aggregates{totalQuantity, totalValue}, totalElements, totalPages, page, size}}` | safe (read, POST-as-query) | AC-1..AC-6, AC-9 | — |
| GET | `/api/v1/stock-ledgers/at-date/export` | JWT (như trên) | Query params tương đương filter (không `page`/`size`) | `.xlsx` file stream | safe (read) | AC-8 | — |

### 6.2 Modified REST endpoints (additive)

_(không có — feature 100% endpoint mới, không sửa endpoint đã tồn tại)_

### 6.3 Kafka topics (publish/consume)

_(không có — feature thuần đọc, không publish/consume event)_

### 6.4 Cross-boundary REST consumers

| Endpoint exposed | Consumed by | When | Failure mode | Retry policy |
|---|---|---|---|---|
| `POST /api/v1/stock-ledgers/at-date/search` | `agg-garage-graph` (BFF passthrough GraphQL query `stockLedgerAtDate`) | Khi FE Web GMS / App Garage load màn Báo cáo tồn kho | BFF trả lỗi nguyên trạng lên FE (pass-through) | sync, fail fast (read user-facing — không retry) |
| `GET /api/v1/stock-ledgers/at-date/export` | `agg-garage-graph` (hoặc FE gọi qua BFF proxy — quyết định cụ thể ở BFF tier) | Khi user nhấn "Xuất file" | trả lỗi nguyên trạng | sync, fail fast |

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-STK-LIST-V2.md`, nếu tồn tại độc lập — xem §11) wrap 2 endpoint này thành GraphQL query. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/InventoryStockLedgerRepository.java` | MODIFY | additive finder (`findAtDate`) | ~15 | AC-3, AC-5, AC-6 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/InventoryStockLedgerJpaRepository.java` | MODIFY | additive JPQL/native query method | ~25 | AC-3, AC-5, AC-6 |
| `app/dto` | `services/gf-inventory/src/main/java/.../app/dto/StockLedgerAtDateItem.java` + `StockLedgerAtDateAggregates.java` + `StockLedgerAtDateSearchRequest.java` | NEW | new DTOs | ~50 | AC-2, AC-3, AC-4 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/StockV2ReportService.java` | NEW | query + aggregate compute | ~90 | AC-1..AC-6 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/StockV2ReportExportService.java` | NEW | `.xlsx` builder theo mẫu chuẩn | ~80 | AC-8 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/StockV2ReportController.java` | NEW | 2 endpoint (search + export) | ~50 | AC-1, AC-4, AC-8, AC-9 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/StockV2ReportServiceTest.java` | NEW | new test methods | ~150 | AC-1..AC-9 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/StockV2ReportControllerContractTest.java` | NEW | contract test | ~70 | AC-1, AC-4, AC-8 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Xác nhận schema/index hiện có đủ dùng (KHÔNG cần migration)
    Entry: KG.entities stable (InventoryStockLedger đã có từ W04)
    Exit: xác nhận idx_ledger_lookup đủ dùng cho AC-3/AC-5/AC-6
    └─► S2

S2  Repository + Service logic (BR enforcement primary)
    Entry: S1
    Exit: unit test ≥8 green
    └─► S3

S3  REST adapter (controller: search + export)
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test (BFF passthrough + feature-flag gate + tenant isolation)
    Entry: S3 + agg-garage-graph BFF FEAT stable
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Xác nhận schema/index hiện có (không migration) | — | KG stable | Index đủ dùng | — |
| S2 | Repository + service logic | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter (2 endpoint) | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + BFF stable | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-STKV2-001` | CORNERSTONE | repository (query — max movement_date) | `adapter/persistence/InventoryStockLedgerJpaRepository.java` | AC-3 | `TC-BR-INV-STKV2-001-*` |
| `BR-STKV2-002` | CORNERSTONE | service (read persisted value, không tính lại) | `app/service/StockV2ReportService.java` | AC-3 | `TC-BR-INV-STKV2-002-*` |
| `BR-STKV2-003` | NORMAL | repository (`GROUP BY` product+warehouse) | `adapter/persistence/InventoryStockLedgerJpaRepository.java` | AC-5 | `TC-BR-INV-STKV2-003-*` |
| `BR-STKV2-004` | NORMAL | app/dto (không expose param garageId) | `app/dto/StockLedgerAtDateSearchRequest.java` | AC-4 | `TC-BR-INV-STKV2-004-*` |
| `BR-STKV2-005` | CORNERSTONE | service (export template compliance) | `app/service/StockV2ReportExportService.java` | AC-8 | `TC-BR-INV-STKV2-005-*` |
| `BR-STKV2-006` | CORNERSTONE | service + adapter/controller (request validation) | `app/service/StockV2ReportService.java` | AC-1, AC-2 | `TC-BR-INV-STKV2-006-*` |
| `BR-STKV2-007` | CORNERSTONE | repository (WHERE OR condition) | `adapter/persistence/InventoryStockLedgerJpaRepository.java` | AC-6 | `TC-BR-INV-STKV2-007-*` |
| `BR-STKV2-008` | NORMAL | app/dto + repository (LIKE-unaccent) | `app/dto/StockLedgerAtDateSearchRequest.java` | AC-4 | `TC-BR-INV-STKV2-008-*` |
| `BR-STKV2-015` | CORNERSTONE | adapter/controller (no role-based `@PreAuthorize`) | `adapter/controller/StockV2ReportController.java` | AC-9 | `TC-BR-INV-STKV2-015-*` |

> **Enforcement layer priority** (rules-backend): Primary phải ở `domain/` hoặc `app/service/`/`adapter/persistence/` (SSOT cho read-path này). UI/client-side enforcement (vd ẩn cột "Thao tác" trên mobile) → đó là FE/Mobile tier secondary (xem §11).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract | test-api | feature-flag gate + default `asOfDate`/pagination |
| AC-2, AC-3 | Unit (calc/mapping) + API contract | test-api | field set + SL/GT tồn theo ngày |
| AC-4 | API contract (negative) | test-api | validation `asOfDate`/`size`/`sort`/`keyword` |
| AC-5, AC-6 | Unit (query grouping/filter) | test-api | tách kho + điều kiện OR hiển thị |
| AC-7 | N/A (BE không touch) | — | xem `fe-web/FEAT-STK-LIST-V2.md §10` |
| AC-8 | API contract (export file shape) | test-api | so khớp mẫu `Báo cáo tồn kho.xlsx` |
| AC-9 | Isolation (dual persona parity) | test-isolation | `accountant` và `garage-owner` cùng response |

## 11. Cross-tier coordination (BE perspective)

> Cross-link sang các tier file khác cùng `FEAT-STK-LIST-V2`. Reviewer items 15-18 enforce consistency.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-STK-LIST-V2.md` | PENDING (chưa tồn tại tại thời điểm authoring — xem lưu ý dưới) | Resolver wrap §6.1 endpoints thành GraphQL query `stockLedgerAtDate` |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-LIST-V2.md` | PENDING (chưa tồn tại tại thời điểm authoring) | UI consume BFF ops, render "Xem lịch sử" (AC-7) |
| Mobile | `Execution/wave-specs/W06/Product/features/mobile/FEAT-STK-LIST-V2.md` | PENDING (chưa tồn tại tại thời điểm authoring) | Flutter consume BFF op — CHỈ AC-1..AC-6, AC-9 (không AC-7 theo BR-STKV2-016) |

**Lưu ý audit fields**: frontmatter `paired_bff_feats`/`paired_fe_web_feats` ban đầu được set `[]` theo `add_fields` do orchestrator cung cấp; đã reconcile lại thành `["FEAT-STK-LIST-V2"]` sau khi xác nhận cả 2 tier file (BFF + FE-web) đã được author song song trong cùng batch (xem §5 Change Log + decision log). `paired_mobile_feats` được set `["FEAT-STK-LIST-V2"]` vì đây là FEAT duy nhất trong nhóm Stock V2 fan-out sang mobile W06.

**Source ID consistency** (item 18): tất cả tier file phải có cùng `source_feat_sha = 0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48`.

## 12. References

- **Source**: [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) v10
- **Parent EP**: [`EP-INVENTORY-STOCK-V2.md`](../../epics/EP-INVENTORY-STOCK-V2.md) (converted)
- **BR refs**: [`BR-GF-INVENTORY-STOCK-V2.md`](../../business-rules/BR-GF-INVENTORY-STOCK-V2.md) v19
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3g (W06-STK-Q1, W06-STK-EX1)
- **Integration**: [`Architecture/integrations/`](../../../../../Architecture/integrations/)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v46
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-STK-LIST-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE, §3 BE behaviour map per AC-ID (9/9 covered, AC-7 → N/A UI-only), §4 ràng buộc + error code, §5-§11 BE-specific (không schema/migration mới — feature 100% read-only trên `inventory_stock_ledger`/`internal_product`/`warehouse` đã có; 2 REST endpoint mới `POST .../at-date/search` + `GET .../at-date/export`; BR primary 9 rule; test scope; cross-tier pair). Source FEAT chỉ audit. Note: bundle §D (BR refs) trỏ nhầm file (`BR-EP-INSURANCE-SETTLEMENT.md` thay vì `BR-GF-INVENTORY-STOCK-V2.md`) — author đọc trực tiếp `BR-GF-INVENTORY-STOCK-V2.md` v19 để bù đắp gap này (xem decision log). |
