---
type: execution
artifact_kind: converted-feature
tier_role: backend
source_ref: "Product/features/FEAT-OB-EDIT.md"
source_version: 5
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-EDIT"
source_feat_sha: "c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19"
generated_at: "2026-07-08T05:30:00+00:00"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
boundary: "gf-inventory"
boundaries_affected: ["gf-inventory", "gf-accounting"]
modifies: []
change_type: "new-capability"
demo_signature: "Kế toán mở form sửa 1 dòng OB (icon ✏️ từ FEAT-OB-LIST), đổi Số lượng tồn + Tồn đến ngày → bấm Lưu → BE gọi lock-check `gf-accounting` cho CẢ ngày cũ VÀ ngày mới (ADR-021, fail-CLOSED) → cập nhật `opening_balance_line` + cascade `StockLedgerRecomputeService` (ADR-020) từ `min(oldAsOfDate, newAsOfDate)` → trả `OpeningBalanceLineResponse` + `cascadedKeys[]`."
consumes_contracts:
  - "PUT /api/v2/opening-balances/{id} (self)"
  - "GET /protected/v1/accounting-periods/lock-check (gf-accounting §V4-AP-LC — ADR-021 authoritative REST consumer, fail-CLOSED trên CẢ OLD và NEW asOfDate, không có preview/advisory path cho FEAT này)"
paired_bff_feats: []
paired_fe_web_feats: []
paired_mobile_feats: []
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  template_sha: "N/A — not supplied by orchestrator context bundle (pending backfill)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-EDIT.be.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-EDIT (BE): Sửa dòng tồn đầu kỳ

> **Backend tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent BE cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Cross-tier coordination ở §11.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-EDIT` |
| Tier | **backend** |
| Boundary owner | `gf-inventory` |
| Boundaries affected | `gf-inventory`, `gf-accounting` (cross-boundary lock-check consumer) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Demo signature | Kế toán mở form sửa 1 dòng OB, đổi SL/ngày → Lưu → BE lock-check CẢ 2 ngày (ADR-021) → update + cascade sổ tồn (ADR-020) → trả `OpeningBalanceLineResponse` + `cascadedKeys[]` |
| Cross-tier pair | BFF: _(chưa xác định fan-out — pending)_ \| Web: _(chưa xác định fan-out — pending)_ \| Mobile: _(không có — source FEAT không có AC mobile)_ |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-EDIT` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) |
| Source version | v5 |
| Source SHA | `c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19` |
| Generated at | 2026-07-08T04:51:55+00:00 (bundle) |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần sửa lại thông tin một dòng tồn đầu kỳ khi phát hiện sai sót (sản phẩm, kho, số lượng, giá trị, ngày) mà không phải xóa rồi import lại toàn bộ file. Đây là thao tác điều chỉnh điểm khởi đầu tồn kho — vì baseline OB là nền cho toàn bộ sổ tồn (ledger) mà các nghiệp vụ nhập/xuất kho từ W05 trở đi ghi tiếp vào, mọi thay đổi trên dòng OB phải cascade lại chính xác tồn cuối ngày cho (mã+kho+gara) liên quan, đồng thời tôn trọng ràng buộc kỳ kế toán đã đóng và tính duy nhất của (mã+kho).

## 2. Trách nhiệm backend (`gf-inventory`)

- Cung cấp endpoint sửa 1 dòng tồn đầu kỳ (`PUT /api/v2/opening-balances/{id}`) nhận 5 trường editable (`productCode`, `warehouseId`, `quantity`, `value`, `asOfDate`) — ĐVT (`mainUnitCode`) KHÔNG nhận từ client, luôn auto-derive server-side từ `internal_product.main_unit_code` theo `productCode`.
- Validate đầy đủ chuỗi guardrail trước khi cho phép ghi: sản phẩm đang hoạt động, kho tồn tại, số lượng > 0, giá trị ≥ 0, (mã+kho) sau sửa không trùng dòng OB khác, `asOfDate` mới không rơi vào/sau ngày phiếu đã ghi sổ của (mã+kho) mới.
- Cross-boundary REST consumer: gọi `gf-accounting GET /protected/v1/accounting-periods/lock-check` cho **cả `asOfDate` cũ VÀ mới** trong cùng transaction (authoritative, fail-CLOSED) — khác `FEAT-OB-LIST` delete chỉ check 1 ngày.
- Ghi đè `opening_balance_line` + cascade lại `inventory_stock_ledger` qua `StockLedgerRecomputeService.recompute(fromDate = min(oldAsOfDate, newAsOfDate))` (ADR-020) trong cùng transaction, kiểm invariant `closing_qty ≥ 0` tại mọi ngày sau cascade.
- Enforce tenant isolation (`TenantFilter` + `TenantContext`) + permission dual persona ngang quyền (`accountant` + `garage-owner`).
- Migration: KHÔNG tạo cột/bảng mới ở FEAT này — tái sử dụng entity `opening_balance_line` + `inventory_stock_ledger` đã additive-migrate (Flyway `V{N+1}__inventory_v2_ob_ledger.sql`, owned bởi `FEAT-OB-IMPORT` cùng wave).

## 3. Hành vi cần triển khai (BE behaviour map)

> Coverage: 10/10 source AC-ID (bundle §C).

### Cluster A — Mở form / hủy bỏ (UI-only, BE không touch)

#### AC-1 → N/A (UI-only)

- Mở form sửa từ icon ✏️ trên danh sách — điều hướng + layout screen. BE không có logic riêng cho hành động mở form (không có endpoint "get-single" mới — dữ liệu prefill lấy từ row đã có sẵn trên client qua `POST /api/v2/opening-balances/search`, §6.1 của `FEAT-OB-LIST`). Xem `fe-web/FEAT-OB-EDIT.md §3 AC-1`.

#### AC-2 → N/A (UI-only, data đã có trong response §6.1 của FEAT-OB-LIST)

- Hiển thị form với 6 trường đổ sẵn dữ liệu hiện tại — toàn bộ field (`productCode`, `warehouseCode`/`warehouseId`, `mainUnitCode`, `quantityOnHand`, `asOfDate`, `valueOnHand`) đã có sẵn trong `content[]` response của `POST /api/v2/opening-balances/search` (FEAT-OB-LIST §6.1). Render form + readonly ĐVT hint là việc của FE. Xem `fe-web/FEAT-OB-EDIT.md §3 AC-2`.

#### AC-4 → N/A (UI-only)

- Huỷ bỏ — quay về danh sách, không gọi BE. Xem `fe-web/FEAT-OB-EDIT.md §3 AC-4`.

### Cluster B — Validate & lưu (core write-path)

#### AC-3 → Validate & lưu dòng OB (all-or-nothing single transaction)

- **Khi**: client gửi `PUT /api/v2/opening-balances/{id}` với body `{ productCode, warehouseId, quantity, value, asOfDate }`.
- **BE phải**: trong 1 `@Transactional`: (1) load dòng OB theo `id` + tenant (404 nếu không tồn tại/đã xóa — EC-7), (2) chạy toàn bộ guardrail AC-5..AC-9, (3) nếu pass — update `opening_balance_line`, resolve `mainUnitCode` mới từ `internal_product`, resolve `warehouseId` → `warehouse.code` cho snapshot, (4) cascade `StockLedgerRecomputeService.recompute(fromDate = min(oldAsOfDate, newAsOfDate))` cho key cũ VÀ key mới nếu (mã+kho) đổi.
- **Output**: `200 OpeningBalanceLineResponse` (full field, cùng shape `content[]` item của W04-1) + `cascadedKeys[]` (result shape ADR-020 §Component Interface C4).
- **Failure mode**: bất kỳ guardrail nào fail → rollback toàn bộ transaction (không dòng nào đổi) — mã lỗi tương ứng AC-5..AC-9.
- **Ref**: BR-OB-001 (§9), BR-STKV2-001 (cascade, §9), entity `OpeningBalanceLine` + `InventoryStockLedger` (§5.1), endpoint `PUT /api/v2/opening-balances/{id}` (§6.1)

#### AC-9 → Validate trường bắt buộc + giá trị

- **Khi**: mỗi lần `PUT` được gọi (trước khi apply update).
- **BE phải**: validate `productCode` bắt buộc + sản phẩm phải "Đang hoạt động" (ngừng → `ERR-INV-010`); `warehouseId` bắt buộc + phải tồn tại tenant-scoped (`ERR-INV-020`); `quantity` > 0 (`ERR-INV-032`); `value` ≥ 0, cho phép = 0/trống (< 0 → `ERR-INV-033`). Cùng bộ rule với `FEAT-OB-IMPORT` verify-import (BR-OB-EDIT-006 mirror BR-OB-006..009).
- **Output**: request hợp lệ → pass sang bước persist (AC-3); không hợp lệ → chặn ngay, KHÔNG gọi lock-check (fail-fast, tiết kiệm round-trip cross-boundary).
- **Failure mode**: `400` với 1 trong các mã `ERR-INV-010/017/020/032/033` tùy field vi phạm đầu tiên.
- **Ref**: BR-OB-006..010/BR-OB-EDIT-006 (§9), endpoint `PUT /api/v2/opening-balances/{id}` (§6.1)

### Cluster C — Guardrails (validate khi lưu)

#### AC-5 → Chặn khi kỳ đã đóng

- **Khi**: `asOfDate` cũ (giá trị hiện tại của dòng trước sửa) HOẶC `asOfDate` mới (giá trị client gửi) rơi vào kỳ kế toán đã đóng.
- **BE phải**: gọi `gf-accounting GET /protected/v1/accounting-periods/lock-check?date={date}` **2 lần** (1 lần cho `oldAsOfDate`, 1 lần cho `newAsOfDate` nếu khác nhau) trong transaction — authoritative, fail-CLOSED. `locked=true` ở BẤT KỲ lần gọi nào → chặn lưu (EC-8: dù chỉ sửa SL/giá trị, ngày chứng từ cũ vẫn thuộc kỳ đóng cũng bị chặn).
- **Output**: cả 2 lock-check trả `locked=false` → tiếp tục AC-6/7/8.
- **Failure mode**: `400 ERR-INV-024`; downstream `gf-accounting` lỗi/timeout → `503 ERR-CMN-007` (fail-CLOSED, KHÔNG ghi).
- **Ref**: BR-OB-013 / BR-OB-EDIT-002 (§9), ADR-021, endpoint `PUT /api/v2/opening-balances/{id}` (§6.1), cross-boundary consumer (§6.4)

#### AC-6 → Chặn khi tồn âm

- **Khi**: thay đổi SL/kho/mã/ngày làm tồn lũy kế < 0 tại bất kỳ ngày nào từ `min(oldAsOfDate, newAsOfDate)` trở đi cho (mã+kho+gara) bị ảnh hưởng.
- **BE phải**: chạy `StockLedgerRecomputeService.recompute(...)` (ADR-020) — bước 5 kiểm invariant `closing_qty ≥ 0` tại mọi ngày N sau cascade; vi phạm → throw ngay lập tức, rollback transaction (không apply update).
- **Output**: cascade thành công → response 200 (AC-3).
- **Failure mode**: `400 ERR-INV-036`, rollback toàn bộ (bao gồm cả update `opening_balance_line` vừa apply trong cùng transaction).
- **Ref**: BR-OB-015 / BR-OB-EDIT-003 (§9), ADR-020 (bước 4-5), entity `InventoryStockLedger` (§5.1)

#### AC-7 → Chặn khi "Tồn đến ngày" sau phiếu

- **Khi**: `asOfDate` mới ≥ ngày phát sinh sớm nhất của phiếu nhập/xuất **đã ghi sổ** (status COMPLETED/REVERSED) của (mã+kho) mới.
- **BE phải**: query ngày phiếu sớm nhất cho (mã+kho) mới (từ `inventory_receipt_item` + `inventory_delivery_item` filtered COMPLETED/REVERSED, cùng nguồn ADR-020 §Cụ thể bước 2) — so sánh với `asOfDate` mới; vi phạm → chặn trước khi apply update.
- **Output**: pass → tiếp tục AC-8.
- **Failure mode**: `400 ERR-INV-035` — thông điệp "OB phải là điểm khởi đầu, trước mọi phiếu".
- **Ref**: BR-OB-016 / BR-OB-EDIT-004 (§9), ADR-020, endpoint `PUT /api/v2/opening-balances/{id}` (§6.1)

#### AC-8 → Chặn khi trùng (mã+kho)

- **Khi**: (mã sản phẩm + kho) sau sửa trùng với dòng `opening_balance_line` khác (khác `id` hiện tại) đã tồn tại cùng tenant.
- **BE phải**: query `findByProductCodeAndWarehouseIdAndTenantIdAndIdNot(...)` — application-level uniqueness check (KHÔNG có DB unique constraint riêng cho cặp này, cite §5.2) trước khi apply update.
- **Output**: không trùng → tiếp tục apply update + cascade (AC-3).
- **Failure mode**: `400 ERR-INV-034` — "OB duy nhất / (mã+kho)".
- **Ref**: BR-OB-012 / BR-OB-EDIT-005 (§9), entity `OpeningBalanceLine` (§5.1)

### Cluster D — Phân quyền

#### AC-10 → Phân quyền sửa

- **Khi**: mọi request tới `PUT /api/v2/opening-balances/{id}`.
- **BE phải**: enforce `TenantFilter` (header `X-Tenant-Id` phải match tenant JWT — Critical Rule #4); cho phép cả 2 role `accountant` + `garage-owner` truy cập ngang quyền; KHÔNG phân biệt quyền giữa 2 role cho endpoint này; endpoint gate bởi `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController`.
- **Output**: request hợp lệ (đúng tenant + flag ON) → xử lý bình thường.
- **Failure mode**: tenant mismatch → `403`; flag OFF → `403`; role ngoài 2 persona → không áp dụng (hệ thống chỉ có 2 actor, Critical Rule #6).
- **Ref**: BR-OB-CMN-002 (§9), §4.2 Tenant + auth

## 4. Ràng buộc & rule cần enforce

### 4.1 Business rule SSOT (BE primary)

- **BR-OB-001** (NORMAL): cấu trúc dòng OB (Tồn đến ngày, Kho, Mã, ĐVT, SL, Giá trị) — enforce tại `domain/model`. Sửa dòng không được phá cấu trúc field bắt buộc.
- **BR-OB-012 / BR-OB-EDIT-005** (CORNERSTONE): (mã+kho) sau sửa không trùng dòng OB khác — enforce `app/service` (query-level, không có DB unique constraint). Vi phạm → `ERR-INV-034` HTTP 400.
- **BR-OB-013 / BR-OB-EDIT-002** (CORNERSTONE): `asOfDate` (CẢ cũ VÀ mới) không rơi vào kỳ kế toán đã đóng — enforce qua cross-boundary lock-check `gf-accounting` (ADR-021), fail-CLOSED. Vi phạm → `ERR-INV-024` HTTP 400.
- **BR-OB-015 / BR-OB-EDIT-003** (CORNERSTONE): sửa không được làm tồn lũy kế (mã+kho) < 0 tại bất kỳ ngày nào point-in-time. Enforce trong `StockLedgerRecomputeService` (ADR-020 bước 5). Vi phạm → `ERR-INV-036` HTTP 400, rollback transaction.
- **BR-OB-016 / BR-OB-EDIT-004** (CORNERSTONE): `asOfDate` mới phải trước mọi phiếu nhập/xuất đã ghi sổ của (mã+kho) mới — enforce `app/service`. Vi phạm → `ERR-INV-035` HTTP 400.
- **BR-STKV2-001** (CORNERSTONE): sửa OB → tính lại tồn cuối ngày (mã+kho+gara) từ `min(oldAsOfDate, newAsOfDate)` trở đi — enforce qua `StockLedgerRecomputeService.recompute(...)` (ADR-020), engine dùng chung với FEAT-OB-IMPORT/FEAT-OB-LIST delete.
- **BR-OB-CMN-002** (NORMAL): permission gate `accountant` + `garage-owner` ngang quyền cho endpoint sửa.

### 4.2 Tenant + auth

- Mọi endpoint propagate `X-Tenant-Id` qua `TenantFilter`; `OriginTenantId` phải match `data.tenantId` (Critical Rule #4 + #10).
- `PUT /api/v2/opening-balances/{id}` yêu cầu JWT hợp lệ + tenant khớp; không phân biệt role giữa `accountant` và `garage-owner`.
- Endpoint gate bởi `@FeatureOn(Inventory:InventoryV2)` class-level trên `OpeningBalanceController` — tenant chưa enable flag → HTTP 403.

### 4.3 Idempotency + concurrency

- `X-Idempotency-Key` optional (retry safety) — PUT semantic tự nhiên idempotent nếu payload giống hệt lần trước và guardrail state không đổi; KHÔNG dedup bắt buộc qua `processed_events` (khác `POST /import` W04-4 vốn bắt buộc key).
- Toàn bộ flow (lock-check OLD+NEW → validate → update → cascade OLD+NEW key) chạy trong 1 `@Transactional`.
- Redisson lock `stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}` (timeout 30s) — cần acquire cho CẢ key cũ VÀ key mới (nếu đổi mã/kho) để ngăn 2 write-path chạy đồng thời trên cùng key.

### 4.4 Error code mapping

| Error | HTTP | Source AC | Display mode (FE hint) |
|---|---|---|---|
| `ERR-INV-010` | 400 | AC-9 | INLINE (sản phẩm ngừng hoạt động) |
| `ERR-INV-020` | 400 | AC-9 | INLINE (kho không tồn tại) |
| `ERR-INV-032` | 400 | AC-9 | INLINE (SL tồn ≤ 0) |
| `ERR-INV-033` | 400 | AC-9 | INLINE (giá trị tồn < 0) |
| `ERR-INV-024` | 400 | AC-5 | TOAST (kỳ kế toán đã đóng — OLD hoặc NEW ngày) |
| `ERR-INV-036` | 400 | AC-6 | TOAST (sửa làm tồn cascade âm) |
| `ERR-INV-035` | 400 | AC-7 | TOAST (Tồn đến ngày sau/cùng ngày phiếu) |
| `ERR-INV-034` | 400 | AC-8 | TOAST (trùng mã+kho) |
| `403` tenant/flag mismatch | 403 | AC-10 | EMPTY_STATE / redirect |
| `404` not found (global handler — KHÔNG dùng mã lỗi OB riêng như `ERR-INV-048`) | 404 | EC-7 | TOAST ("Dòng không tồn tại" → quay về danh sách) |
| `ERR-CMN-007` | 503 | AC-5 | TOAST (retry — gf-accounting lock-check unavailable, fail-CLOSED) |

---

## 5. Schema delta (BE — contract focus)

> Entity `opening_balance_line` + `inventory_stock_ledger` đã được additive-migrate (Flyway `V{N+1}__inventory_v2_ob_ledger.sql`, ADR-009 scalar FK, tenant_id enforced) — write-path khởi tạo dữ liệu thuộc `FEAT-OB-IMPORT` (cùng wave). **FEAT-OB-EDIT KHÔNG thêm cột mới** — chỉ update in-place 5 trường editable + cascade ledger. Bảng dưới liệt kê field liên quan (reference, không phải delta).

### 5.1 Entity reference — `gf-inventory` (no new columns)

| Entity | Column | Type | Nullable | Default | Migration strategy | BR ref | AC ref | Notes |
|---|---|---|---|---|---|---|---|---|
| `opening_balance_line` | `id` | `BIGINT` | N | auto | (đã tồn tại — FEAT-OB-IMPORT) | — | AC-1 (path param) | PK, dùng cho `PUT /{id}` |
| `opening_balance_line` | `tenant_id` | `BIGINT` | N | — | (đã tồn tại) | BR-OB-CMN-002 | AC-10 | tenant scope mọi update |
| `opening_balance_line` | `product_id` / `product_code` | `BIGINT` / `VARCHAR` | N | — | (đã tồn tại) | BR-OB-001 | AC-9 | editable, resolve lại `internal_product` |
| `opening_balance_line` | `warehouse_code` | `VARCHAR` | N | — | (đã tồn tại) | BR-OB-005 / BR-OB-EDIT-006 | AC-9 | editable — BE nhận `warehouseId: int` (v44 API rename), resolve → `warehouse.code` string cho snapshot |
| `opening_balance_line` | `unit_code` (`mainUnitCode`) | `VARCHAR` | N | — | (đã tồn tại) | BR-OB-010 | AC-2 (readonly) | KHÔNG nhận từ client — auto-resolve từ `internal_product.main_unit_code` mỗi lần `productCode` đổi |
| `opening_balance_line` | `quantity` / `value` | `DECIMAL(18,6)` / `DECIMAL(18,2)` | N | — | (đã tồn tại) | BR-OB-008/009 | AC-3, AC-9 | editable, trigger recompute |
| `opening_balance_line` | `snapshot_date` (`asOfDate`) | `DATE` | N | — | (đã tồn tại) | BR-OB-002 | AC-5, AC-7 | editable, tham số lock-check + boundary phiếu |
| `inventory_stock_ledger` | `origin_context` | `ENUM` | N | — | (đã tồn tại, ADR-020 §C3) | — | AC-3 | ghi `OB_EDIT` cho row cascade phát sinh từ FEAT này |

### 5.2 Index / constraint changes

> Không thêm index mới — tái sử dụng index đã ratify tại HLD §6b.3 (owned bởi write-path FEAT-OB-IMPORT/FEAT-OB-LIST). **Uniqueness (mã+kho) là application-level check (BR-OB-012/BR-OB-EDIT-005), KHÔNG có DB unique constraint riêng** — query dùng index sẵn có bên dưới.

| Table | Index/constraint name | Columns | Type | Purpose | ADR ref |
|---|---|---|---|---|---|
| `opening_balance_line` | `idx_ob_tenant_warehouse_asof` | `(tenant_id, warehouse_id, as_of_date)` | btree | Query uniqueness check (AC-8) + boundary phiếu (AC-7) | HLD §6b.3 |
| `opening_balance_line` | `idx_ob_tenant_asof` | `(tenant_id, as_of_date)` | btree | Hỗ trợ lock-check OLD + NEW date (AC-5, ADR-021) | HLD §6b.3 |
| `inventory_stock_ledger` | `idx_ledger_lookup` | `(tenant_id, product_id, warehouse_id, movement_date DESC)` | btree — critical | Cascade recompute lookup cho CẢ key cũ VÀ key mới (AC-3, AC-6, ADR-020) | HLD §6b.3 |

## 6. API contract delta (BE — REST + cross-boundary)

### 6.1 New REST endpoints — `gf-inventory`

| Method | Path | Auth | Request body | Response body | Idempotency | AC ref | CB ref |
|---|---|---|---|---|---|---|---|
| PUT | `/api/v2/opening-balances/{id}` | JWT + `X-Tenant-Id` + `X-Branch-Id`, optional `X-Idempotency-Key` | `{ productCode, warehouseId: int, quantity, value, asOfDate }` | `OpeningBalanceLineResponse` (full field, same shape W04-1 `content[]` item) + `cascadedKeys[]` | optional idempotency-key (retry safety); PUT natural semantic | AC-1, AC-2, AC-3, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 | ADR-021 lock-check (OLD + NEW) |

> **Field notes** (v44 rename): `warehouseId: int` (canonical `warehouse.id` scalar FK — thay `warehouseCode: string` cũ, breaking change contract, safe vì W04 chưa DEV). `mainUnitCode` KHÔNG nằm trong request — auto-derived server-side. `productCode` yêu cầu sản phẩm "Đang hoạt động".

### 6.2 Modified REST endpoints (additive)

_(không có — endpoint W04-5 là additive mới, W04 lần đầu ratify §3b)._

### 6.3 Kafka topics (publish/consume)

_(không có — trigger từ Kafka event OB EDIT ở future wave; W04 chỉ call intra-service sync REST, không bắt buộc outbox theo ADR-020)._

### 6.4 Cross-boundary REST consumed (outbound — `gf-inventory` là consumer)

| Endpoint tiêu thụ | Owner boundary | Khi gọi | Failure mode | Retry policy |
|---|---|---|---|---|
| `GET /protected/v1/accounting-periods/lock-check?date={date}` | `gf-accounting` | Tại `PUT /api/v2/opening-balances/{id}` — gọi **2 lần** (OLD `asOfDate` + NEW `asOfDate`, dedup nếu trùng ngày) trong transaction, authoritative | fail-CLOSED — `503 ERR-CMN-007` nếu downstream lỗi/timeout ở BẤT KỲ lần gọi nào, KHÔNG ghi | Spring Retry 3 lần exponential backoff (100/200/400ms) + Resilience4j circuit breaker (50% failure rate, cửa sổ mở 60s); cache LRU TTL 30s scope `(tenantId, date)` — chia sẻ cache với FEAT-OB-LIST/FEAT-OB-IMPORT trong cùng boundary |

> **Hand-off tới BFF**: `agg-garage-graph` (`FEAT-OB-EDIT` BFF tier, nếu fan-out) wrap `PUT /{id}` thành mutation `updateOpeningBalanceLine(id, input)` per `gf-inventory-api.md` §3b.4. KHÔNG describe GraphQL ở đây — đó là BFF tier territory.

## 7. File/module impact map (BE — Hexagonal)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `domain/model` | `services/gf-inventory/src/main/java/.../domain/model/OpeningBalanceLine.java` | REUSE (no change) | Entity đã tồn tại từ FEAT-OB-IMPORT | — | AC-3, AC-9 |
| `domain/repository` | `services/gf-inventory/src/main/java/.../domain/repository/OpeningBalanceLineRepository.java` | ADDITIVE | new finder `findByProductCodeAndWarehouseIdAndTenantIdAndIdNot()` (AC-8 uniqueness) + `findEarliestSlipDateByProductWarehouse()` (AC-7) | ~30 | AC-7, AC-8 |
| `app/service` | `services/gf-inventory/src/main/java/.../app/service/OpeningBalanceService.java` | ADDITIVE | new method `update()` (validate chain AC-5..9 + persist + cascade OLD/NEW key orchestration) | ~150 | AC-3, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10 |
| `adapter/client` | `services/gf-inventory/src/main/java/.../adapter/client/GfAccountingClient.java` | REUSE nếu đã tạo bởi FEAT sibling (OB-LIST/OB-IMPORT) trong cùng wave, else NEW | Spring `RestClient` bean `gfAccountingClient` — `lockCheck(date)` gọi 2 lần (OLD+NEW) | ~10 (nếu REUSE) / ~40 (nếu NEW) | AC-5 |
| `adapter/controller` | `services/gf-inventory/src/main/java/.../adapter/controller/OpeningBalanceController.java` | ADDITIVE (extend class đã tạo bởi FEAT sibling) | new endpoint `PUT /{id}` | ~35 | AC-3, AC-5-AC-10 |
| `adapter/persistence` | `services/gf-inventory/src/main/java/.../adapter/persistence/OpeningBalanceLineJpaRepository.java` | ADDITIVE | JPQL cho uniqueness check + earliest-slip-date query | ~20 | AC-7, AC-8 |
| `test/unit` | `services/gf-inventory/src/test/java/.../app/service/OpeningBalanceServiceTest.java` | ADDITIVE | test guardrail combos (AC-5..9) + cascade OLD/NEW key + EC-7/EC-8 | ~200 | AC-3, AC-5-AC-10 |
| `test/contract` | `services/gf-inventory/src/test/java/.../adapter/controller/OpeningBalanceControllerContractTest.java` | ADDITIVE (extend contract test class đã tạo) | contract test `PUT /{id}` | ~90 | AC-3, AC-5-AC-10 |

## 8. Implementation sequence DAG (BE — S1→S4)

```
S1  Schema baseline (shared, owned by FEAT-OB-IMPORT)
    Entry: KG.entities stable + migration V{N+1}__inventory_v2_ob_ledger.sql applied
    Exit: opening_balance_line + inventory_stock_ledger deployed local
    └─► S2

S2  Repository + Service logic (validate chain + update + cascade orchestration, BR primary)
    Entry: S1
    Exit: unit test ≥10 green (5 guardrail combos + happy path + EC-7/EC-8)
    └─► S3

S3  REST adapter (controller — PUT /{id})
    Entry: S2
    Exit: contract test green
    └─► S4

S4  Integration test (cross-boundary REST lock-check gf-accounting — OLD + NEW date)
    Entry: S3 + gf-accounting lock-check endpoint stable
    Exit: integ test green (fail-CLOSED scenario covered cho cả 2 lần gọi)
    └─► (hand-off BFF tier S5, nếu fan-out)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S1 | Schema baseline (shared) | db/migration | KG stable | Migration verified (FEAT-OB-IMPORT owns) | — |
| S2 | Service logic (validate + update + cascade) | domain + app | S1 | Unit test ≥10 green | S1 |
| S3 | REST adapter | adapter/controller | S2 | Contract test green | S2 |
| S4 | Integration test | test/integration | S3 + gf-accounting lock-check | Integ test green | S3 |

## 9. Business Rules to enforce (BE — SSOT cho BR)

| BR ID | Severity | Enforcement layer | Where (file path) | Touchpoint AC | Test point (TC prefix) |
|---|---|---|---|---|---|
| `BR-OB-001` | NORMAL | domain/model (structure) | `domain/model/OpeningBalanceLine.java` | AC-2, AC-3 | `TC-BR-gf-inventory-OB-001-*` |
| `BR-OB-012` / `BR-OB-EDIT-005` | CORNERSTONE | app/service (uniqueness query) | `app/service/OpeningBalanceService.java::update()` | AC-8 | `TC-BR-gf-inventory-OB-012-*` |
| `BR-OB-013` / `BR-OB-EDIT-002` | CORNERSTONE | app/service (cross-boundary lock-check OLD+NEW, authoritative) | `app/service/OpeningBalanceService.java::update()` | AC-5 | `TC-BR-gf-inventory-OB-013-*` |
| `BR-OB-015` / `BR-OB-EDIT-003` | CORNERSTONE | domain/service (shared `StockLedgerRecomputeService`, invariant `closing_qty ≥ 0`) | `domain/service/StockLedgerRecomputeService.java` (ADR-020) | AC-6 | `TC-BR-gf-inventory-OB-015-*` |
| `BR-OB-016` / `BR-OB-EDIT-004` | CORNERSTONE | app/service (earliest-slip-date check) | `app/service/OpeningBalanceService.java::update()` | AC-7 | `TC-BR-gf-inventory-OB-016-*` |
| `BR-STKV2-001` | CORNERSTONE | domain/service (shared `StockLedgerRecomputeService`, cascade forward) | `domain/service/StockLedgerRecomputeService.java` (ADR-020) | AC-3 | `TC-BR-gf-inventory-STKV2-001-*` |
| `BR-OB-CMN-002` | NORMAL | app/service (permission gate dual persona) | `app/service/OpeningBalanceService.java` | AC-10 | `TC-BR-gf-inventory-OB-CMN-002-*` |

> **Enforcement layer priority** (rules-backend):
> - Primary phải ở `domain/` hoặc `app/service/` (SSOT).
> - Secondary có thể ở `validation/` (UX feedback), `repository/` (DB constraint defense).
> - UI/client-side enforcement (form prefill, readonly hint, popup wording) → FE tier secondary (xem §11 paired tier files).

## 10. Test scope hand-off (BE)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-3 | Integration (happy path — update + cascade OLD/NEW key) | test-api | shape response `OpeningBalanceLineResponse` + `cascadedKeys[]` |
| AC-5 | Integration (cross-boundary lock-check OLD + NEW) | test-api | `gf-inventory` ↔ `gf-accounting`, cả 2 lần gọi + fail-CLOSED scenario (EC-8 chỉ ngày cũ đóng) |
| AC-6 | Integration (cascade tồn âm rollback) | test-api | giảm SL gây âm ở ngày sau do phiếu xuất phụ thuộc |
| AC-7 | API contract (asOfDate vs earliest slip date) | test-api | boundary case = cùng ngày phiếu (≥, không phải >) |
| AC-8 | API contract (uniqueness mã+kho) | test-api | đổi kho/mã trùng dòng khác (khác `id`) |
| AC-9 | Unit + API contract (field validation) | test-api | 4 mã lỗi field-level (010/020/032/033) |
| AC-10 | Isolation (RBAC + tenant) | test-isolation | dual persona ngang quyền; cross-tenant leak zero-tolerance; feature-flag gate |
| EC-7 | API contract (404 concurrent delete) | test-api | dòng bị xóa bởi phiên khác trước khi user lưu |

## 11. Cross-tier coordination (BE perspective)

> `paired_*_feats` để trống ở frontmatter — fan-out map cho `FEAT-OB-EDIT` chưa xác định tại thời điểm author BE (source FEAT không có AC mobile riêng, chỉ có Figma web). Bảng dưới liệt kê target path dự kiến nếu fan-out xảy ra.

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-EDIT.md` | N-A (chưa xác định fan-out) | Nếu fan-out: resolver wrap `PUT /{id}` → mutation `updateOpeningBalanceLine(id, input)` |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-EDIT.md` | N-A (chưa xác định fan-out) | Nếu fan-out: UI consume BFF op cho AC-1, AC-2, AC-4, EC-7 popup wording; 5 mã lỗi (024/034/035/036 + field-level) → toast/inline |
| Mobile | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-EDIT.md` | N-A (source FEAT không có AC mobile) | Không cần fan-out trừ khi Business Authority bổ sung scope mobile ở CR sau |

**Source ID consistency** (item 18): tất cả tier file (nếu fan-out) phải cùng `source_feat_sha = c676e525b1cf9368ea21e8069fe7d7135fa0590cb6eef60abb863e72bf64fd19`.

## 12. References

- **Source**: [`Product/features/FEAT-OB-EDIT.md`](../../../../../Product/features/FEAT-OB-EDIT.md) v5
- **Parent EP**: [`EP-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md)
- **BR refs**: [`BR-GF-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md)
- **HLD**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md) §6b.3
- **API contract**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) v44 §0 Wave Index (W04) + §3b.2 (W04-5) + §3b.3 (error codes) + §5.1 Naming Registry
- **API contract (cross-boundary)**: [`Architecture/api/gf-accounting-api.md`](../../../../../Architecture/api/gf-accounting-api.md) §V4-AP-LC (`lock-check`)
- **ADR**: [ADR-009](../../../../../Architecture/decisions/ADR-009-jpa-no-relationship-mapping.md), [ADR-019](../../../../../Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md), [ADR-020](../../../../../Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md), [ADR-021](../../../../../Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md)
- **Integration**: [`Architecture/integrations/INTEG-EXT-gf-inventory.md`](../../../../../Architecture/integrations/) (gf-accounting lock-check consumer)
- **KG**: `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` v4
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 13. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial BE-tier spec cho `FEAT-OB-EDIT` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm BE (sửa 1 dòng OB + lock-check OLD/NEW ngày + cascade), §3 BE behaviour map 10/10 AC-ID (7 real BE behaviour: AC-3/9 validate&save cluster + AC-5/6/7/8 guardrail cluster + AC-10 phân quyền; 3 N/A UI-only AC-1/2/4 với lý do rõ ràng — không có endpoint "get-single" riêng, prefill dùng lại response search của FEAT-OB-LIST), §4 ràng buộc + error code (bao gồm note HTTP 404 global handler thay vì mã lỗi OB riêng), §5-§11 BE-specific (schema reference no-delta, REST W04-5 PUT full detail v44 rename `warehouseId: int`, Hexagonal file map, sequence DAG, BR primary 7 rule, test hand-off, cross-tier pair — `paired_*_feats` để trống theo chỉ định orchestrator, fan-out chưa xác định). Source FEAT chỉ audit. |
