---
type: execution
artifact_kind: converted-feature
tier_role: backend                                     # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DETAIL.md"
source_version: 24
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DETAIL"
source_feat_sha: "5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 4
tier: T4
owner_authority: Delivery Authority                    # Architecture Authority co-sign §5 §6 §7
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
boundary: "gf-accounting"
boundaries_affected: ["gf-accounting"]                 # read-only trên own entities; không cross-boundary REST cho endpoint này
modifies: []
change_type: "new-capability"                          # PRC là boundary mới W06 trên gf-accounting
demo_signature: "Kế toán/chủ garage mở Chi tiết lần tính giá → xem cụm thông tin đầu màn + bảng chi tiết theo mã (auto-polling 5s khi Đang tính) → lọc/tìm theo mã hoặc trạng thái → xem mã lỗi kèm lý do → bấm Tính lại toàn bộ / Tính lại mã lỗi khi cần"
consumes_contracts: []                                 # DETAIL không gọi REST cross-boundary; chỉ đọc price_calc_run(_item) nội bộ gf-accounting
paired_bff_feats: ["FEAT-PRC-DETAIL"]
paired_fe_web_feats: ["FEAT-PRC-DETAIL"]
paired_mobile_feats: []                                # PRC web-only per PKG §1 Overview
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: null                                   # không computed được — agent này không có shell/hash tool trong spawn hiện tại
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-DETAIL.be.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-08-02"
---

# FEAT-PRC-DETAIL (BE): Chi tiết lần tính giá xuất kho

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DETAIL` |
| Tier | **backend** |
| Boundary owner | `gf-accounting` |
| Boundaries affected | `gf-accounting` |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Demo signature | Kế toán/chủ garage mở Chi tiết lần tính giá → xem cụm thông tin đầu màn + bảng chi tiết theo mã (auto-polling 5s khi Đang tính) → lọc/tìm theo mã hoặc trạng thái → xem mã lỗi kèm lý do → bấm Tính lại toàn bộ / Tính lại mã lỗi khi cần |
| Cross-tier pair | BFF: `FEAT-PRC-DETAIL` \| Web: `FEAT-PRC-DETAIL` \| Mobile: N/A (web-only) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-DETAIL` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-DETAIL.md`](../../../../../Product/features/FEAT-PRC-DETAIL.md) |
| Source version | v24 |
| Source SHA | `5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Kế toán / chủ garage cần xem lại kết quả của một lần tính giá xuất kho theo phương pháp Bình quân gia quyền cuối kỳ (BQGQ) đã kích hoạt — bao gồm trạng thái tổng quan, chi tiết từng mã đã tính (giá bình quân, số phiếu xuất được cập nhật) và mã bị lỗi kèm lý do — để kiểm tra tính đúng đắn của kết quả và quyết định có cần chạy lại toàn bộ hay chỉ chạy lại các mã lỗi hay không. Vì job tính giá chạy nền (async), màn này còn là nơi theo dõi tiến độ realtime của lần chạy đang diễn ra. Đây là bước "đọc lại kết quả" nằm giữa bước khởi chạy (`FEAT-PRC-CREATE`) và bước chạy lại (`FEAT-PRC-RECALC`) trong vòng đời một lần tính giá.

## 2. Trách nhiệm backend (`gf-accounting`)

- Cung cấp endpoint đọc chi tiết 1 lần tính giá (`price_calc_run` + `price_calc_run_item`) hỗ trợ cả 2 chế độ: full detail (mở màn lần đầu) và polling nhẹ (`includeItems=false` khi đang chạy).
- Tính toán `aggregates` (dòng "Tổng") server-side trên **toàn bộ phạm vi đã lọc** (post server-side filter `itemStatus`/`keyword`, pre-pagination) — KHÔNG để FE tự SUM trên trang hiện tại.
- Hỗ trợ filter server-side `itemStatus` (DONE/ERROR/RUNNING) và `keyword` (match `productCode`/`productName`) trên tập `price_calc_run_item` — dùng cho log lớn; FE web áp dụng filter client-side trên tập đã tải theo AC-2b nhưng BE vẫn expose query param để hỗ trợ log lớn / polling tối ưu.
- Đảm bảo dữ liệu trả về phản ánh đúng trạng thái/tiến độ tại thời điểm đọc — hỗ trợ FE polling 5 giây (AC-2c) mà không gây tải DB (cache Redis TTL ngắn).
- Enforce soft-delete: log đã xóa (`deleted_at IS NOT NULL`) không truy cập được kể cả qua id trực tiếp.
- Enforce permission dual persona (BR-AP-CMN-002) — không phân biệt `garage-owner`/`accountant`.
- KHÔNG tự thực hiện logic tính lại (RECALC) — chỉ expose dữ liệu đủ để FE quyết định hiển thị/disable 2 nút "Tính lại toàn bộ"/"Tính lại mã lỗi"; hành vi tính lại thuộc endpoint riêng do `FEAT-PRC-RECALC` BE tier sở hữu (xem §11).
- Migration/persistence: KHÔNG có schema delta — đọc entity đã tồn tại do `FEAT-PRC-CREATE` sở hữu (`ddl-auto=update`, boundary `gf-accounting`).

## 3. Hành vi cần triển khai (BE behaviour map)

### Cluster A — Mở màn + tự động cập nhật tiến độ

#### AC-1 → Mở màn chi tiết

- **Khi**: client GET `/api/v2/price-calc-runs/{id}` (điều hướng từ icon "Xem" ở danh sách lịch sử).
- **BE phải**: resolve `price_calc_run` theo `id` + `tenant_id` (loại trừ `deleted_at IS NOT NULL`); trả full payload (header info + `items[]` nếu `includeItems` mặc định `true` + `aggregates`).
- **Output**: `200 OK` với body §6.1 shape.
- **Failure mode**: không tìm thấy hoặc khác tenant hoặc đã xóa → `404 ERR-CMN-not-found` (không leak existence cross-tenant).
- **Ref**: BR-AP-CMN-002 (§9), entity `PriceCalcRun`/`PriceCalcRunItem` (§5.1), endpoint `GET /api/v2/price-calc-runs/{id}` (§6.1)

#### AC-2 → Cụm thông tin đầu màn

- **Khi**: client đọc response của cùng GET `/api/v2/price-calc-runs/{id}`.
- **BE phải**: trả đủ scalar field cho cụm đầu màn — `periodId`/`periodName`, `fromDate`/`toDate`, `warehouseId`/`warehouseCode`/`warehouseName`, `pricingMethod`, `executedBy`, `executedAt`, `status`. Với log đã từng RECALC, các field `executedBy`/`executedAt`/`status` PHẢI phản ánh **lần chạy gần nhất** (RECALC ghi đè các field này trên row hiện tại — xem BR-PRC-008/015 tại `FEAT-PRC-RECALC`), KHÔNG phải giữ giá trị của lần chạy gốc.
- **BE phải**: giữ nguyên enum `status` gồm 4 giá trị BE-side (`PENDING|RUNNING|SUCCEEDED|COMPLETED_WITH_ERRORS`) — KHÔNG collapse `PENDING`+`RUNNING` thành 1 giá trị ở BE; việc gộp hiển thị "Đang tính" cho cả 2 là trách nhiệm FE (BR-PRC-014 chỉ quy định 3 giá trị **hiển thị**, không phải 3 giá trị lưu trữ).
- **BE phải**: khi `status=RUNNING`, đảm bảo `items[]` (nếu request có `includeItems=true`) phản ánh tiến độ từng mã hiện tại (`RUNNING`/`DONE`/`ERROR`); nếu scope gốc `ALL` chưa lưu toàn bộ chi tiết mã thành công thì `progressItemsTotal`/`progressItemsDone`/`progressPercent` vẫn phải chính xác dù `items[]` không đủ toàn bộ mã.
- **Output**: response fields trên (§6.1).
- **Failure mode**: — (kế thừa AC-1).
- **Ref**: BR-PRC-014, BR-PRC-008/015 (§9), endpoint `GET /api/v2/price-calc-runs/{id}` (§6.1)

#### AC-2c → Tự động cập nhật tiến độ (polling)

- **Khi**: FE gọi lại GET `/api/v2/price-calc-runs/{id}` mỗi 5 giây trong lúc `status ∈ {PENDING, RUNNING}`.
- **BE phải**: đảm bảo endpoint **an toàn để gọi lặp lại tần suất cao** (read-only, không side-effect); hỗ trợ `includeItems=false` cho polling nhẹ (chỉ header + `progressPercent`/`progressItemsTotal`/`progressItemsDone` + `aggregates` — KHÔNG kèm `items[]`) để giảm payload; cache Redis TTL 3s (đủ ngắn để không làm FE thấy dữ liệu "đứng hình" > 3s, đủ dài để giảm tải DB khi nhiều tab polling); cache invalidate khi `PriceCalcRunService.commit()` flip trạng thái (đảm bảo lần poll tiếp theo sau khi job vừa hoàn tất thấy trạng thái mới ngay, không đợi hết TTL).
- **Output**: cùng response shape AC-2, `aggregates` luôn non-null bất kể `includeItems`.
- **Failure mode**: 5xx transient trong lúc polling → FE tự retry theo interval kế tiếp (không có BE-side đặc biệt); không yêu cầu idempotency-key (GET tự nhiên idempotent).
- **Ref**: BR-PRC-016 (§9), endpoint `GET /api/v2/price-calc-runs/{id}` (§6.1), cache spec (§4.3)

### Cluster B — Bảng chi tiết theo mã + lỗi

#### AC-2b → Tìm kiếm + bộ lọc bảng chi tiết

- **Khi**: FE gửi query `itemStatus` và/hoặc `keyword` trên GET `/api/v2/price-calc-runs/{id}` (BE hỗ trợ server-side filter cho log lớn; FE web mặc định áp filter client-side trên tập đã tải per AC-2b UI spec).
- **BE phải**: filter `price_calc_run_item` theo `status IN (itemStatus...)` khi có; theo `productCode LIKE %keyword% OR productName LIKE %keyword%` khi có `keyword`; filter áp dụng **trước khi tính `aggregates`** (BE aggregate phải theo đúng tập đã lọc, không phải toàn bộ mã).
- **Output**: `items[]` đã lọc + `aggregates` theo tập đã lọc.
- **Failure mode**: `itemStatus` giá trị không hợp lệ (ngoài `DONE|ERROR|RUNNING`) → `400 ERR-CMN-validation`.
- **Ref**: endpoint `GET /api/v2/price-calc-runs/{id}` query params (§6.1)

#### AC-3 → Bảng chi tiết theo mã

- **Khi**: response GET `/api/v2/price-calc-runs/{id}` có `items[]`.
- **BE phải**: mỗi item trả đủ field cho bảng — `productCode`, `productName`, `mainUnitCode`, `openingQty`/`openingValue`, `receiptQty`/`receiptValue`, `deliveryQty`/`deliveryValue`, `averageUnitPrice` (Decimal scale=2, HALF_UP, **giá trị đã làm tròn dùng để tính tiền vốn** per BR-PRC-013 — BE KHÔNG re-round lúc serialize, chỉ trả nguyên giá trị đã persist), `updatedDeliverySlipCount`, `status`, `errorReason`. `averageUnitPrice=0` là hợp lệ (không phải lỗi/null). Với item `status=ERROR`: `averageUnitPrice=null`, `deliveryValue=null` (chưa cập nhật).
- **BE phải**: tính `aggregates` (dòng "Tổng") = SUM 1-pass SQL trên tập đã filter, TRƯỚC pagination — `openingQtyTotal`/`openingValueTotal`, `receiptQtyTotal`/`receiptValueTotal`, `deliveryQtyTotal`/`deliveryValueTotal` (loại trừ item `ERROR` có `deliveryValue=null` khỏi SUM giá trị, nhưng vẫn cộng SL non-null), `updatedDeliverySlipCountTotal`, `itemsCount`. KHÔNG trả `averageUnitPrice`/`errorReason` ở mức `aggregates` (cộng đơn giá/lý do lỗi vô nghĩa).
- **Output**: `items[]` + `aggregates` object (luôn non-null).
- **Failure mode**: — (kế thừa AC-1); log không có chi tiết mã lưu sẵn (scope `ALL` không lưu toàn bộ mã thành công) → `items[]` chỉ chứa mã lỗi (nếu có), `aggregates` tính trên tập đó.
- **Ref**: BR-PRC-001, BR-PRC-002, BR-PRC-004, BR-PRC-005, BR-PRC-013 (§9), endpoint `GET /api/v2/price-calc-runs/{id}` response (§6.1)

#### AC-4 → Hiển thị mã lỗi trong bảng chi tiết

- **Khi**: item trong `price_calc_run_item` có `status=ERROR`.
- **BE phải**: KHÔNG có endpoint/bảng lỗi riêng — mã lỗi nằm trong cùng `items[]` với `status="ERROR"` và `errorReason` là 1 trong 3 giá trị enum: `NEGATIVE_STOCK` (`ERR-INV-030`), `ACCOUNTING_MISMATCH` (`ERR-INV-031`, [MỞ RỘNG TƯƠNG LAI] — chưa phát sinh trong W06), `SYSTEM_ERROR` (`ERR-INV-052`, mã chưa tới lượt tính do job gián đoạn/hết retry). Mã "Ngừng hoạt động" bị skip ở Phase 0 resolve (owned by `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC`) — KHÔNG bao giờ xuất hiện trong `items[]` như 1 dòng lỗi của log này.
- **Output**: `items[].status="ERROR"` + `items[].errorReason` (§6.1).
- **Failure mode**: N/A (đây là data display, không phải request error).
- **Ref**: BR-PRC-007 (§9), error codes `ERR-INV-030`/`ERR-INV-031`/`ERR-INV-052` (§4.4)

### Cluster C — Tính lại (trigger, không phải execution)

#### AC-5 → Nút "Tính lại toàn bộ" (BE surface, execution owned by FEAT-PRC-RECALC)

- BE tier của `FEAT-PRC-DETAIL` **không sở hữu** logic tính lại — chỉ đảm bảo response GET `/api/v2/price-calc-runs/{id}` cung cấp đủ field (`status`, `scope`, `scopePredicate`) để FE quyết định hiển thị nút và, khi user bấm, FE gọi `POST /api/v2/price-calc-runs/{id}/recalc` với `runScope=ALL` — endpoint này được đặc tả đầy đủ (validation, 202 kick-off, error codes, copy-forward semantics) tại `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-RECALC.md §6` (xem §11 cross-tier).
- **Ref**: BR-PRC-008, BR-PRC-015 (owned tại FEAT-PRC-RECALC), endpoint `POST /api/v2/price-calc-runs/{id}/recalc` (external ref, không duplicate ở đây)

#### AC-5b → Nút "Tính lại mã lỗi" (BE surface, execution owned by FEAT-PRC-RECALC)

- Tương tự AC-5: BE của DETAIL chỉ đảm bảo `status="COMPLETED_WITH_ERRORS"` là tín hiệu chính xác duy nhất FE cần để quyết định hiện/ẩn nút "Tính lại mã lỗi" (EC-4 — ẩn/disable khi `status ∈ {PENDING,RUNNING,SUCCEEDED}`). Khi user bấm, FE gọi `POST /api/v2/price-calc-runs/{id}/recalc` với `runScope=ERROR_ONLY` — đặc tả đầy đủ tại `FEAT-PRC-RECALC.md §6`.
- **Ref**: BR-PRC-008 (owned tại FEAT-PRC-RECALC)

### Cluster D — Phân quyền

#### AC-6 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: mọi request tới `GET /api/v2/price-calc-runs/{id}`.
- **BE phải**: authorize theo `TenantFilter`/`TenantContext`; KHÔNG phân biệt role `garage-owner` vs `accountant` — cả 2 có quyền đọc ngang nhau (không có role nào bị chặn hoặc giới hạn field).
- **Output**: `200` cho cả 2 persona hợp lệ cùng tenant.
- **Failure mode**: tenant mismatch → `404` (không phải `403`, tránh leak existence).
- **Ref**: BR-AP-CMN-002 (§9)

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary cho phạm vi DETAIL)

- **BR-AP-CMN-002** (CORNERSTONE): dual persona quyền ngang nhau — enforce tại security/authorization layer (không role-based field filtering). Vi phạm → không áp dụng (không có case vi phạm khả dĩ ngoài tenant mismatch → `404`).
- **BR-PRC-014** (NORMAL): status enum lưu trữ 4 giá trị BE-side; BE KHÔNG collapse — enforce tại serialization layer (`app/dto`).
- **BR-PRC-013** (CORNERSTONE — primary enforcement tại `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC` compute engine; DETAIL chỉ read-through fidelity): `averageUnitPrice` trả nguyên giá trị đã persist (scale 2, HALF_UP) — KHÔNG re-round hoặc re-compute tại DETAIL.
- **BR-PRC-001/002/004/005** (NORMAL — primary tại compute engine, DETAIL read-through): các field `openingQty/Value`, `receiptQty/Value`, `deliveryQty/Value`, `updatedDeliverySlipCount` trả nguyên giá trị đã persist trong `price_calc_run_item`.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `GET /api/v2/price-calc-runs/{id}`: `authenticated`, cả `accountant` + `garage-owner`. Feature flag `Inventory:InventoryV2` gate class-level trên `PriceCalcRunController` — tenant chưa bật → `403`.

### 4.3 Idempotency + concurrency

- GET là read-only, tự nhiên idempotent — không cần idempotency-key.
- Cache: Redis TTL 3s scope `(tenantId, runId)`; invalidate on `PriceCalcRunService.commit()` state flip (đảm bảo polling thấy trạng thái mới ngay sau khi job hoàn tất thay vì đợi hết TTL).
- Concurrency: không có write path ở endpoint này — không cần optimistic lock.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-CMN-not-found` | 404 | AC-1 | EMPTY_STATE (id không tồn tại/khác tenant/đã xóa) |
| `ERR-CMN-validation` | 400 | AC-2b | INLINE (query param `itemStatus` không hợp lệ) |
| — (data field, không phải request error) `ERR-INV-030` | — | AC-4 | INLINE — hiển thị "Do tồn âm" tại cột "Lí do lỗi" |
| — `ERR-INV-031` [MỞ RỘNG TƯƠNG LAI] | — | AC-4 | INLINE — hiển thị "Lệch hạch toán" |
| — `ERR-INV-052` | — | AC-4 | INLINE — hiển thị "Do sự cố hệ thống" |

---

## 5. Schema delta (BE — contract focus)

### 5.1 Entity changes — `gf-accounting`

> **KHÔNG có schema delta cho FEAT này** — `FEAT-PRC-DETAIL` chỉ đọc (SELECT) 2 bảng đã tồn tại, sở hữu và migrate bởi `FEAT-PRC-CREATE` (`ddl-auto=update`, không Flyway). Bảng dưới liệt kê để traceability field ↔ AC — KHÔNG tạo/sửa cột.

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `price_calc_run` | `status` | enum `PENDING\|RUNNING\|SUCCEEDED\|COMPLETED_WITH_ERRORS` | N | `PENDING` | N/A — existing (owned FEAT-PRC-CREATE) | BR-PRC-014 | AC-2, AC-2c, AC-5, AC-5b | Đọc nguyên trạng, không collapse |
| `price_calc_run` | `progress_items_total`/`progress_items_done` | int | Y | `0` | N/A — existing | BR-PRC-016 | AC-2c | Dùng tính `progressPercent` |
| `price_calc_run` | `warnings_skipped_items` | int | Y | `0` | N/A — existing | BR-PRC-009 | AC-2 | Mã "Ngừng hoạt động" bị skip |
| `price_calc_run` | `scope`, `scope_predicate` | enum, JSONB | Y | — | N/A — existing | BR-PRC-016 | AC-2, AC-5 | Đọc nguyên vẹn, phục vụ RECALC ALL |
| `price_calc_run_item` | `average_unit_price` | Decimal(scale 2) | Y | — | N/A — existing | BR-PRC-013 | AC-3 | Read-through, không re-round |
| `price_calc_run_item` | `status`, `error_reason` | enum, enum | Y | — | N/A — existing | BR-PRC-007, BR-PRC-014 | AC-3, AC-4 | 3-giá-trị error enum |
| `price_calc_run_item` | `updated_delivery_slip_count` | int | Y | `0` | N/A — existing | BR-PRC-005 | AC-3 | Aggregate SUM cho dòng Tổng |

### 5.2 Index / constraint changes

> **Không thêm index mới** — endpoint tái sử dụng index đã tạo bởi `FEAT-PRC-CREATE`:

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `price_calc_run` | `idx_prc_run_tenant_garage_wh` (existing) | `(tenant_id, garage_id, warehouse_id, executed_at DESC)` | btree | Định nghĩa canonical theo SSOT `gf-accounting-data-model.md §2quater.1` — index này phục vụ LIST default sort (BR-PRC-018); GET `{id}` đi qua **PK** `pk_price_calc_run`, không qua index này (`CR-20260801-09`) | ADR-027 |
| `price_calc_run_item` | `idx_prc_item_run` (existing) | `(tenant_id, run_id, status)` | btree | Filter `itemStatus` + aggregate | ADR-027 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-accounting`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| GET | `/api/v2/price-calc-runs/{id}` | authenticated (`X-Tenant-Id`, `X-Branch-Id`) | — (query: `includeItems`, `itemStatus`, `keyword`) | `{ id, periodId, periodName, fromDate, toDate, warehouseId/Code/Name, pricingMethod, executedBy, executedByName, executedAt, scope, scopePredicate, status, progressPercent, progressItemsTotal, progressItemsDone, warningsSkippedItems, items[], aggregates{} }` | safe (read) | AC-1, AC-2, AC-2b, AC-2c, AC-3, AC-4, AC-6 | — |

> **Grep-verified**: `Architecture/api/gf-accounting-api.md v24 §5.2` (W06-2) — path + query params + response shape cite verbatim từ SSOT, không suy luận.

### 6.2 Modified REST endpoints (additive)

_(không có — endpoint này là mới hoàn toàn, không sửa endpoint có sẵn)_

### 6.3 Kafka topics (publish/consume)

_(không có — FEAT-PRC-DETAIL không publish/consume Kafka event)_

### 6.4 Cross-boundary REST consumers

_(không có — endpoint chỉ được BFF `agg-garage-graph` gọi qua passthrough; không có backend-to-backend REST consumer nào khác cho GET `{id}`. `executedByName` enrichment là trách nhiệm BFF-side, không phải BE cross-boundary call.)_

> **Hand-off tới BFF**: BFF FEAT (`features/bff/FEAT-PRC-DETAIL.md`) sẽ wrap endpoint này thành GraphQL query `getPriceCalcRun(id)` + enrich `executedByName`. KHÔNG describe GraphQL ở đây.

## 7. File/module impact map (BE — Hexagonal)

> Path glob ⊆ `services/gf-accounting/**`. `PriceCalcRunController`/`PriceCalcRunService`/entity classes có thể đã tồn tại do `FEAT-PRC-CREATE` — các dòng dưới đây là phần MODIFY/ADDITIVE riêng cho endpoint DETAIL.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `adapter/controller` | `src/main/java/.../adapter/controller/PriceCalcRunController.java` | MODIFY | add GET `{id}` method | ~25 | AC-1, AC-2b |
| `app/service` | `src/main/java/.../app/service/PriceCalcRunService.java` | MODIFY | add `getDetail(id, includeItems, itemStatus, keyword)` + aggregates SQL | ~70 | AC-2, AC-2c, AC-3, AC-4 |
| `app/dto` | `src/main/java/.../app/dto/PriceCalcRunDetailResponse.java` | NEW | response DTO | ~40 | AC-2, AC-3 |
| `app/dto` | `src/main/java/.../app/dto/PriceCalcRunItemResponse.java` | NEW | item row DTO | ~25 | AC-3, AC-4 |
| `app/dto` | `src/main/java/.../app/dto/PriceCalcRunAggregates.java` | NEW | dòng Tổng DTO | ~15 | AC-3 |
| `domain/repository` | `src/main/java/.../domain/repository/PriceCalcRunItemRepository.java` | ADDITIVE | filtered-find + aggregate query | ~20 | AC-2b, AC-3 |
| `infrastructure/persistence` | `src/main/java/.../infrastructure/persistence/jpa/PriceCalcRunItemJpaRepository.java` | ADDITIVE | native/JPQL aggregate SUM query | ~30 | AC-3 |
| `adapter/config` | `src/main/java/.../adapter/config/CacheConfig.java` | MODIFY (nếu chưa có) | Redis TTL 3s bean cho DETAIL polling | ~10 | AC-2c |
| `test/unit` | `src/test/java/.../app/service/PriceCalcRunServiceTest.java` | ADDITIVE | test aggregate SUM, filter, soft-delete exclude | ~120 | AC-2, AC-3, AC-4 |
| `test/contract` | `src/test/java/.../adapter/controller/PriceCalcRunControllerContractTest.java` | ADDITIVE | contract test GET `{id}` (200/404/400) | ~80 | AC-1, AC-2b |

> **Package convention (chốt cho W06 — `CR-20260801-06` APPROVED 2026-08-02)**: JPA entity/repository-impl/mapper → `infrastructure/persistence/{entity,jpa,repository,mapper}/` (repo hiện có; `adapter/` chỉ gồm `{client, config, controller}`, **không có** `adapter/persistence`). Xem `FEAT-PRC-CREATE.md §7` cho chi tiết đầy đủ.

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema (N/A — không có delta, chỉ verify entity từ FEAT-PRC-CREATE đã deploy)
    Entry: FEAT-PRC-CREATE entities + index deployed
    Exit: skip (không migration mới)
    └─► S2

S2  Repository + Service logic (aggregate SUM + filter + status read-through)
    Entry: S1
    Exit: unit test ≥8 green (bao gồm soft-delete exclude, aggregate correctness, status enum passthrough)
    └─► S3

S3  REST adapter (controller GET {id} + Redis cache 3s)
    Entry: S2
    Exit: contract test green (200/404/400)
    └─► S4

S4  Integration test (polling scenario, dual-persona RBAC, cache invalidation on commit())
    Entry: S3 + FEAT-PRC-CREATE / FEAT-PRC-RECALC write-path stable (để có data thực chạy polling)
    Exit: integ test green
    └─► (hand-off BFF tier S5)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Verify entity/index có sẵn | — | FEAT-PRC-CREATE deployed | Skip — không migration mới | — |
| S2 | Service logic (aggregate + filter) | domain + app | S1 | Unit test ≥8 green | S1 |
| S3 | REST adapter + cache | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + counterpart write-path | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

> DETAIL là read-path — phần lớn BR compute-time (BR-PRC-001/002/004/005/013) có primary enforcement tại `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC` compute engine; DETAIL chỉ có trách nhiệm **read-through fidelity** (không re-round, không re-compute, không collapse enum).

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-AP-CMN-002` | CORNERSTONE | security/authorization (primary tại DETAIL) | `adapter/controller/PriceCalcRunController.java` | AC-6 | `TC-BR-gf-accounting-AP-CMN-002-*` |
| `BR-PRC-014` | NORMAL | serialization (primary tại DETAIL cho phần "không collapse") | `app/dto/PriceCalcRunDetailResponse.java` | AC-2 | `TC-BR-gf-accounting-PRC-014-*` |
| `BR-PRC-013` | CORNERSTONE | compute (primary tại FEAT-PRC-CREATE/RECALC) — DETAIL secondary read-through | `app/service/PriceCalcRunService.java::getDetail()` | AC-3 | `TC-BR-gf-accounting-PRC-013-*` |
| `BR-PRC-007` | NORMAL | compute (primary tại FEAT-PRC-CREATE/RECALC) — DETAIL secondary display | `app/dto/PriceCalcRunItemResponse.java` | AC-4 | `TC-BR-gf-accounting-PRC-007-*` |
| `BR-PRC-005` | NORMAL | compute (primary tại RECALC write-path cross-boundary) — DETAIL secondary aggregate | `app/service/PriceCalcRunService.java::computeAggregates()` | AC-3 | `TC-BR-gf-accounting-PRC-005-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement → đó là FE/Mobile tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | API contract (200/404) | test-api | Tenant mismatch + soft-deleted id → 404 no-leak |
| AC-2 | API contract | test-api | Header fields + status enum không collapse |
| AC-2b | API contract | test-api | `itemStatus` filter + `keyword` search server-side |
| AC-2c | Integration (polling) | test-api | Gọi lặp lại 5s interval, cache TTL 3s + invalidate on commit |
| AC-3 | Unit (aggregate SUM) + API contract | test-api | `aggregates` đúng trên tập đã filter, trước pagination |
| AC-4 | Unit + API contract | test-api | 3-giá-trị `errorReason` enum, mã Ngừng hoạt động không xuất hiện |
| AC-5, AC-5b | N/A tại tier này | test-api | Test execution logic ở `FEAT-PRC-RECALC` test scope; DETAIL chỉ test `status` field chính xác cho FE button logic |
| AC-6 | Isolation (RBAC) | test-isolation | Dual persona — cả 2 role 200, tenant khác 404 |

## 11. Cross-tier coordination (BE perspective)

> Cross-link sang các tier file khác cùng `FEAT-PRC-DETAIL`. Reviewer items 15-18 enforce consistency.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-DETAIL.md` | DRAFT (in-flight, batch C) | Resolver `getPriceCalcRun(id)` wrap §6.1 endpoint + `executedByName` enrichment |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-PRC-DETAIL.md` | pending (batch D) | UI consume BFF query, polling 5s |
| Mobile | N/A | N/A | PRC là web-only per PKG §1 Overview — mobile chỉ `FEAT-STK-LIST-V2` |

**Sibling BE file (cùng boundary, khác FEAT — execution owner cho AC-5/AC-5b)**:

| Sibling FEAT | File path | Relationship |
|---|---|---|
| `FEAT-PRC-RECALC` | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-RECALC.md` | Sở hữu `POST /api/v2/price-calc-runs/{id}/recalc` (W06-4) — DETAIL AC-5/AC-5b trigger endpoint này, không duplicate spec |
| `FEAT-PRC-CREATE` | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-CREATE.md` | Sở hữu entity `price_calc_run`/`price_calc_run_item` + migration — DETAIL chỉ đọc |

**Source ID consistency** (item 18): tất cả tier file có cùng `source_feat_sha = 5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08`.

## 12. References

- **Source**: [`Product/features/FEAT-PRC-DETAIL.md`](../../../../../Product/features/FEAT-PRC-DETAIL.md) v24
- **Parent EP**: [`EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) (converted)
- **BR refs**: [`BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`](../../business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md), [`BR-GF-INVENTORY-STOCK-V2.md`](../../business-rules/BR-GF-INVENTORY-STOCK-V2.md)
- **HLD**: [`Architecture/hld/gf-accounting-HLD.md`](../../../../../Architecture/hld/gf-accounting-HLD.md)
- **API contract**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) v24 §5.2 (W06-2)
- **ADR**: [`ADR-027-bqgq-engine-and-convergent-iteration.md`](../../../../../Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md), [`ADR-028-prc-async-execution-sync-http-plus-background-thread.md`](../../../../../Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md)
- **KG**: `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-08-02 | 4 | main-agent (CR batch W06, approver sonhoang) | **Apply `CR-20260801-06` (MINOR, APPROVED) — phần mở rộng scope còn sót.** §7 File impact map — cột package của `PriceCalcRunItemJpaRepository.java` từ `adapter/persistence` (không tồn tại trong repo) → `infrastructure/persistence/jpa/`, khớp precedent đã chốt tại `FEAT-PRC-CREATE.md §7`. Thêm blockquote cite CR. **KHÔNG đụng**: AC, schema, REST contract. 3 → 4. |
| 2026-08-02 | 3 | main-agent (CR batch W06, approver sonhoang) | **Apply `CR-20260801-09` (MINOR, APPROVED — bao gồm cả phán quyết index-column).** §5.2 — cột của index `idx_prc_run_tenant_garage_wh` từ `(tenant_id, garage_id, warehouse_id, id)` → `(tenant_id, garage_id, warehouse_id, executed_at DESC)`, khớp SSOT `Architecture/data/gf-accounting-data-model.md:460`. Đồng thời sửa cột Purpose: index này là **canonical cho LIST default sort BR-PRC-018**, KHÔNG phải "PK lookup cho GET {id}" — GET `{id}` đi qua PK `pk_price_calc_run`. Companion cùng CR: `gf-accounting-api.md` v25→v26 (§5.1) + `gf-accounting-HLD.md` v15→v16 (§12.3, 2 chỗ). **KHÔNG đụng**: AC (gồm AC-2 — xem `CR-20260801-05`, Delivery chốt giữ nguyên), §6 response shape, index `idx_prc_item_run`. 2 → 3. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-PRC-DETAIL` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm BE (read-path only, RECALC execution deferred sang FEAT-PRC-RECALC), §3 BE behaviour map cover đủ 9 AC-ID (AC-5/AC-5b khai báo cross-ref thay vì duplicate), §4 ràng buộc + error code, §5 schema (no-delta, read traceability table), §6 API contract (GET `/api/v2/price-calc-runs/{id}` grep-verified `gf-accounting-api.md v24 §5.2`), §7-§11 BE-specific (Hexagonal file map/sequence/BR primary-secondary split/test/cross-tier + sibling BE FEAT reference). Source FEAT chỉ audit.
