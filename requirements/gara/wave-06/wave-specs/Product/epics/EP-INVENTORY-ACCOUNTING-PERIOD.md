---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W06"
last_reviewed: "2026-07-31"
source_ref: "Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md"
source_version: 24
source_sha: "91d7f9a23c2c02f27bdd3b58d2283acee76ce3ac243f54b050ce1a1c31707dbe"  # backfilled by orchestrator 2026-07-31 (author session had no Bash tool)
generated_at: "2026-07-31T00:00:00+00:00"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
features_in_wave:
  - FEAT-PRC-LIST
  - FEAT-PRC-CREATE
  - FEAT-PRC-DETAIL
  - FEAT-PRC-RECALC
  - FEAT-PRC-DELETE
boundaries_affected:
  - gf-accounting
authoring_inputs:
  kg_baseline_sha: "ddecc67ac881d51089afa2c833c8363f081de22998273959a282b1a221156c1f"
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "N/A — không được cung cấp trong Context Bundle mode epic"
  bundle_path: "N/A — epic mode, no per-tier bundle"
  bundle_generated_at: "N/A"
---

# EP-INVENTORY-ACCOUNTING-PERIOD — Execution Spec (W06, nhóm PRC)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v24.
> §1-§5 verbatim từ source (toàn bộ epic — gồm cả nhóm **AP** dù không thuộc W06, AP đã ship W04). §6-§12 là DEV section do Delivery Authority + Architecture Authority soạn, **scoped riêng cho W06 nhóm PRC (5 FEAT-PRC-\*)**.
>
> **Lưu ý phạm vi wave**: Epic gốc gồm **10 feature** (5 AP + 5 PRC). Nhóm **AP (Kỳ kế toán, 5 FEAT)** đã ship W04 (xem `Execution/wave-specs/W04/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md`). W06 triển khai **nhóm PRC (Tính giá xuất kho, 5 FEAT)** trên boundary chính `gf-accounting`, cross-boundary REST S2S với `gf-inventory` (sổ tồn SoT + phiếu SoT). `boundaries_affected` frontmatter chỉ liệt kê `gf-accounting` (boundary sở hữu schema/logic chính + Temporal workflow theo Context Bundle chỉ định) — §6 dưới đây liệt kê đầy đủ các boundary tham gia triển khai (S2S provider, BFF, Web) cũng như boundary out-of-scope (`garage-mobile`, PRC web-only). Wave W06 cũng bao gồm epic khác (`EP-INVENTORY-STOCK-V2`, 3 FEAT báo cáo) — **ngoài phạm vi artifact này**, có execution spec riêng.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Source version | 24 |
| Source SHA | `91d7f9a23c2c02f27bdd3b58d2283acee76ce3ac243f54b050ce1a1c31707dbe` (backfilled 2026-07-31) |
| Generated at | 2026-07-31T00:00:00+00:00 |
| Wave | W06 — Inventory V2 Slice 4/4 (wave cuối): Tính giá + Báo cáo |
| Parent PKG | [`PKG-W06-inventory-pricing-stock-report.md`](../../../../Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md) v8 |

---

## 1. Outcome / Hypothesis

Nếu garage có một danh mục **kỳ kế toán** phân cấp (năm → quý → tháng) với khả năng **đóng/mở kỳ** — và (giai đoạn sau) UI **tính giá xuất kho theo BQGQ cuối kỳ** — thì garage kiểm soát được thời điểm chốt sổ kho: khi đóng kỳ, các phiếu nhập/xuất trong kỳ bị khóa chỉnh sửa, đảm bảo số liệu tồn và giá vốn nhất quán để lên báo cáo tồn/NXT.

---

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Quản lý danh mục kỳ kế toán: tạo/sửa/xóa kỳ, đóng/mở kỳ; (giai đoạn sau) chạy tính giá xuất kho |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

---

## 3. Vòng đời trạng thái

### 3.1 Kỳ kế toán (AP)

```
  ┌──────────────────┐
  │    Tạo mới       │
  │  (Create)        │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐         ┌──────────────────┐
  │   Chưa đóng      │────────▶│    Đã đóng       │
  │   (OPEN)         │  Đóng   │   (CLOSED)       │
  └──────────────────┘         └──────────────────┘
           ▲                            │
           │       Mở lại kỳ            │
           └────────────────────────────┘
```

**Ghi chú:**
- Kỳ kế toán khởi tạo ở trạng thái **"Chưa đóng"**.
- Cấu trúc phân cấp **3 cấp cố định**: **Năm → Quý → Tháng**. Kỳ quý/tháng phải gắn vào kỳ cha hợp lệ ("Thuộc kỳ").
- **Đóng / mở kỳ không ràng buộc thứ tự** — người dùng tự thao tác trên từng kỳ. Cho phép **mở lại** kỳ đã đóng.
- Khi kỳ ở trạng thái **"Đã đóng"**: chặn thêm / sửa / xóa phiếu nhập kho, xuất kho có ngày chứng từ thuộc kỳ đó (chi tiết tại `EP-INVENTORY-RECEIPT-V2`, `EP-INVENTORY-DELIVERY-V2`) **và chặn chạy tính giá PRC** (CREATE lần đầu / RECALC) cho kỳ đó.
- Đóng/mở kỳ là **field trạng thái** sửa qua `FEAT-AP-EDIT` (không có feature đóng/mở riêng).

### 3.2 Tính giá xuất kho (PRC)

> `FEAT-PRC-*` là UI tính giá xuất kho theo **BQGQ cuối kỳ** — tính theo **mã sản phẩm nội bộ** (+ kho + garage). Chi tiết công thức/vòng đời: `BR-GF-INVENTORY-ACCOUNTING-PERIOD` §2.2 (BR-PRC-*).

```
  Chọn kỳ + kho + phạm vi mã ──► Thực hiện tính giá (BQGQ)
       │                      │
       │                      ▼
       │            ┌──────────────────────────┐
       │            │ • Đơn giá BQ = (GT tồn đầu│
       │            │   + GT nhập)/(SL tồn đầu  │
       │            │   + SL nhập)              │
       │            │ • Điền giá vốn phiếu xuất │
       │            │ • Cập nhật giá trị sổ tồn │
       │            │ • Ghi log lần tính         │
       │            └──────────┬───────────────┘
       │                       │ Tính lại toàn bộ / mã lỗi (ghi đè)
       │                       ▼
       │              (cập nhật lại kết quả)
       └─ Xóa log (không rollback; chặn nếu kỳ đã đóng hoặc log đang "Đang tính")
```

**Ghi chú:**
- **Đơn giá BQ chỉ dùng phía NHẬP** (+ tồn đầu kỳ); giá vốn xuất là **output** = Đơn giá BQ × **SL quy đổi**. **NHẬP trong kỳ (SL + GT)** = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua); giá trị kế thừa (không theo đơn giá BQ): "Nhập hàng bán bị trả lại" ← phiếu **Xuất bán** gốc (BR-IRV2-031); "Xuất trả hàng mua" ← phiếu **Nhập mua** gốc (BR-IDV2-030). **Mọi "SL" trong PRC = SL quy đổi (ĐVT chính)**; đơn giá BQ ra theo ĐVT chính (khác đơn giá nhập theo ĐVT nhập).
- **Tồn đầu kỳ** = **tồn kho của mặt hàng theo (Mã + Kho + Garage), tính đến hết ngày "Từ ngày" − 1** — **SL tồn đầu** (SL quy đổi ĐVT chính) và **GT tồn đầu** (tiền tuyệt đối VND); mã chưa phát sinh gì trước kỳ → đến từ **OB** (nếu có) hoặc 0. Đơn giá BQ = **kết quả chạy giá** = (GT đầu + GT nhập)/(SL đầu + SL nhập), **làm tròn 2 chữ số thập phân sau khi tính** và **dùng giá trị đó để tính tiền vốn** (cột **"Giá bình quân"** hiển thị đúng 2 lẻ này); đơn giá = 0 hợp lệ (mã chưa nhập / nhập tiền 0).
- **KHÔNG bắt tính tuần tự**: tính kỳ nào cũng được — vì tồn đầu lấy theo **tồn kho đến "Từ ngày" − 1** nên đã phản ánh mọi biến động nhập/xuất của các kỳ trước (kể cả kỳ chưa tính giá: phiếu xuất chưa tính → tiền vốn = 0). Tính/tính lại một kỳ → các kỳ **sau** cần tính lại.
- **Tính lặp khi có phiếu trả tự tham chiếu**: nếu mã có dòng phiếu **"Nhập hàng bán bị trả lại" "Tự nhập giá" KHÔNG tích** (đơn giá để hệ thống cập nhật) tham chiếu phiếu **Xuất bán cùng kỳ chưa tính** → GT nhập phụ thuộc giá vốn xuất (output BQGQ) → hệ thống **tính lặp bằng giá trị tạm** đến khi **đơn giá BQ sau làm tròn 2 chữ số thập phân của vòng hiện tại bằng vòng liền trước** (BR-PRC-017). Sau khi hội tụ/chốt giá, hệ thống mới cập nhật thật phiếu xuất → phiếu nhập hàng bán bị trả lại kế thừa (nếu có) → sổ tồn; dòng **"Tự nhập giá" tích** (nhập đơn giá tay) → không lặp.
- Chọn **kỳ** → tự điền Từ/Đến, khóa không sửa. Tính theo **(Mã + Kho + Garage)**; chọn **"Tất cả mã"** hoặc mã cụ thể. **Nguồn mã** lấy từ catalog sản phẩm nội bộ của garage, lọc **"Phương pháp tính giá" = "Bình quân cuối kỳ"** và **"Trạng thái" = "Đang hoạt động"**; **kỳ/kho/khoảng ngày không lọc nguồn mã từ catalog**, chỉ là ngữ cảnh tính giá. Với **"Tất cả mã"**, form không đổ bảng, server resolve mã khi chạy; với mã cụ thể, người dùng thêm mã vào bảng. Mã **"Ngừng hoạt động"** bị bỏ qua, không tính là mã lỗi.
- **Sau khi tính**: cập nhật giá vốn phiếu xuất + **giá trị sổ tồn** (báo cáo tự đúng). Log scope **"Tất cả mã"** lưu tổng hợp + mã lỗi, không bắt buộc lưu toàn bộ mã thành công. **Tính lại** hỗ trợ 2 scope **`ALL`** (log gốc "Tất cả mã" resolve lại theo predicate BQGQ + Đang hoạt động của garage; log gốc mã cụ thể chạy danh sách đã chọn sau khi revalidate trạng thái) và **`ERROR_ONLY`** (chỉ mã lỗi còn Đang hoạt động), cập nhật kết quả trên lần tính hiện tại; người thực hiện, ngày giờ thực hiện, scope và trạng thái phản ánh lần chạy gần nhất; **chặn CREATE lần đầu và RECALC nếu kỳ đã đóng** (mở lại kỳ để tính/tính lại). **Xóa log** không rollback giá vốn; chặn nếu kỳ đã đóng hoặc log đang **"Đang tính"**.
- Mã **lỗi** → không cập nhật giá vốn + giá trị tồn cho mã đó; hiển thị ở màn chi tiết bằng **Trạng thái = Lỗi** + cột **"Lí do lỗi"** (không có bảng lỗi riêng).

---

## 4. Features

### 4.1 Kỳ kế toán (AP) — 5 feature — **W04 scope, đã ship**

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-AP-LIST` | Danh sách kỳ kế toán | [FEAT-AP-LIST](../../../../Product/features/FEAT-AP-LIST.md) | P1 |
| `FEAT-AP-CREATE` | Tạo kỳ kế toán | [FEAT-AP-CREATE](../../../../Product/features/FEAT-AP-CREATE.md) | P1 |
| `FEAT-AP-DETAIL` | Chi tiết kỳ kế toán | [FEAT-AP-DETAIL](../../../../Product/features/FEAT-AP-DETAIL.md) | P1 |
| `FEAT-AP-EDIT` | Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) | [FEAT-AP-EDIT](../../../../Product/features/FEAT-AP-EDIT.md) | P1 |
| `FEAT-AP-DELETE` | Xóa kỳ kế toán | [FEAT-AP-DELETE](../../../../Product/features/FEAT-AP-DELETE.md) | P1 |

### 4.2 Tính giá xuất kho (PRC) — 5 feature — **W06 scope**

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-PRC-LIST` | Danh sách lịch sử tính giá xuất kho | [FEAT-PRC-LIST](../../../../Product/features/FEAT-PRC-LIST.md) | P1 |
| `FEAT-PRC-CREATE` | Thực hiện tính giá xuất kho | [FEAT-PRC-CREATE](../../../../Product/features/FEAT-PRC-CREATE.md) | P1 |
| `FEAT-PRC-DETAIL` | Chi tiết lần tính giá xuất kho | [FEAT-PRC-DETAIL](../../../../Product/features/FEAT-PRC-DETAIL.md) | P1 |
| `FEAT-PRC-RECALC` | Tính lại giá xuất kho | [FEAT-PRC-RECALC](../../../../Product/features/FEAT-PRC-RECALC.md) | P1 |
| `FEAT-PRC-DELETE` | Xóa khoản mục lịch sử tính giá | [FEAT-PRC-DELETE](../../../../Product/features/FEAT-PRC-DELETE.md) | P1 |

---

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-RECEIPT-V2` | Downstream | Phiếu nhập kho tuân lock theo kỳ kế toán (đóng kỳ → khóa phiếu trong kỳ). |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Phiếu xuất kho tuân lock theo kỳ kế toán. |
| `EP-INVENTORY-OPENING-BALANCE` | Downstream | Tồn đầu kỳ liên hệ kỳ kế toán **gián tiếp qua "Tồn đến ngày"** (không gắn trực tiếp); ngày rơi vào kỳ đã đóng → chặn import/xóa. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn / NXT theo kỳ kế toán. |
| `EP-INVENTORY-CATALOG` | Upstream | (PRC) Tính giá xuất kho theo mã sản phẩm nội bộ + phương pháp tính giá khai ở từng mã. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-accounting` | **Boundary chính**: master của Kỳ kế toán (AP — trạng thái đóng/mở, phân cấp Năm→Quý→Tháng) + Tính giá xuất kho BQGQ cuối kỳ (PRC). Khớp pattern ERP truyền thống (kế toán tính money/costing). |
| `gf-inventory` | Consumer Kỳ (đọc trạng thái đóng/mở qua REST để chặn phiếu chỉnh sửa trong kỳ đóng) + owner Sổ tồn SL (số lượng) + owner Tồn đầu kỳ (OB, thuộc `EP-INVENTORY-OPENING-BALANCE`). PRC cross-boundary REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` khi chạy BQGQ cuối kỳ. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang `gf-accounting` (AP + PRC) và `gf-inventory` (Sổ tồn / OB). |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Kỳ kế toán + Tính giá được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

---

## §6 Service Impact Matrix (W06 — nhóm PRC)

> Wave W06 nhóm PRC — 5 FEAT × 3 boundary triển khai trực tiếp (`gf-accounting` BE lead — **NEW boundary W06, gồm Temporal workflow embedded** → `agg-garage-graph` BFF → `garage-web` UI) + 1 boundary cung cấp hạ tầng S2S (`gf-inventory`, cross-boundary REST provider — KHÔNG có FEAT-PRC-\* nào chạy trực tiếp trên boundary này). `garage-mobile` **KHÔNG** build màn PRC trong W06 (per PKG §2.2.5 + §2.3 — PRC là web-only, 5 FEAT out-of-scope mobile). Wave W06 cũng chứa epic khác (`EP-INVENTORY-STOCK-V2`, 3 FEAT báo cáo trên `gf-inventory`) — **không thuộc §6 này**, xem execution spec riêng.

| Boundary | Role | FEATs touched (W06 PRC) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-accounting` | **Lead boundary — NEW boundary W06** (PRC master + PWA/BQGQ engine + Temporal workflow) | Tất cả 5 FEAT-PRC-* | **MỚI** 2 entity per `gf-accounting-data-model.md` v14 §2quater: `price_calc_run` (id, tenant_id, garage_id, period_id, from_date, to_date, warehouse_id/code/name, pricing_method, scope, scope_predicate JSONB, items_snapshot JSONB, source_run_id, status, temporal_workflow_id, progress_items_total/done, items_resolved/done/error_count, warnings_skipped_items, executed_by/at, error_summary, deleted_at/by) + `price_calc_run_item` (id, run_id, product_code/id/name, opening_qty/value, receipt_qty/value, delivery_qty/value, average_unit_price scale 2, status, error_reason, iterations_applied, has_self_reference); **`ddl-auto=update`** (KHÔNG Flyway, per Common Gotcha #5) | **6 REST endpoint canonical** `/api/v2/price-calc-runs/*` (W06-1 search · W06-2 detail-polling · W06-3 create 202-kick-off · W06-4 recalc 202 · W06-5 delete soft · W06-6 lookup items-for-cogs) per `gf-accounting-api.md` v24 §5 + §6 Naming Registry | — | KHÔNG publish Kafka event PRC (audit log nội bộ `price_calc_run` đủ, per PKG §2.3 Out of Scope) |
| `gf-inventory` | **Cross-boundary S2S provider** (không có FEAT-PRC-* nào chạy trên boundary này — cung cấp hạ tầng đọc/ghi cho PRC engine của `gf-accounting`) | N/A | Không entity mới (đọc/ghi qua bảng hiện có `inventory_stock_ledger`/`receipt_line`/`delivery_line`) | **5 REST protected endpoint S2S** `/protected/v1/*` (W06-P1 `stock-ledgers/at-date` snapshot tồn đầu · W06-P2 `slips-in-period/search` enumerate phiếu · W06-P3 `delivery-lines/bulk-fill-cost` ghi giá vốn xuất · W06-P4 `receipt-lines/bulk-inherit-cost` kế thừa giá "Nhập hàng bán bị trả lại" · W06-P5 `stock-ledgers/bulk-recompute` cascade sổ tồn) per `gf-inventory-api.md` v72 §3f + `INTEG-EXT-gf-accounting-gf-inventory.md` v3 §4 | — | — |
| `agg-garage-graph` | **BFF orchestrator** | Tất cả 5 FEAT-PRC-* | — | **6 GraphQL ops passthrough** (3 Query `priceCalcRunList`/`priceCalcRunGet`/`priceCalcItemsForCogsLookup` + 3 Mutation `priceCalcRunCreate`/`priceCalcRunRecalc`/`priceCalcRunDelete`) + `@FeatureOn("Inventory:InventoryV2")` gate resolver-level fail-fast; Idempotency-Key arg→header forward cho 2 mutation (Create/Recalc); DataLoader `TENANT-USERS` cho `executedByName` enrichment — per `agg-garage-graph-graphql.md` v7.79 §3f | — | — |
| `garage-web` | **UI consumer** (full CRUD, desktop-only, no-i18n) | Tất cả 5 FEAT-PRC-* | — | — | **2 route** tại `src/features/inventory/`: `/inventory/price-calc-runs` (`PriceCalcRunListPage`, tree-flat list + 2 filter + modal "Chạy tính giá") + `/inventory/price-calc-runs/$id` (`PriceCalcRunDetailPage`, bảng chi tiết mã + action inline **Tính lại**/**Xóa log** = `FEAT-PRC-RECALC`/`FEAT-PRC-DELETE`, polling Apollo `pollInterval:5000` fixed khi `status ∈ {PENDING,RUNNING}`). Reuse-first: `share/tables/table-pagination` + `share/date-picker/date-range-picker` (context tại Create) + `share/exports/export-excel` (N/A cho PRC — export chỉ thuộc Stock-V2) + `share/emptys/no-data` + `share/loadings/loading`; status-chip "Đang tính" mới (`/allow-new-component` nếu registry thiếu, per PKG §2.4 Bước 1) | — |
| `garage-mobile` | **Out of scope W06** (PRC = web-only per Figma registry — 5 FEAT không có node mobile) | 0 FEAT | — | — | — | — |

**Dependency arrows:**
- `garage-web` → `agg-garage-graph` (6 GraphQL PRC ops).
- `agg-garage-graph` → `gf-accounting` (6 REST endpoint PRC passthrough — auth header propagation `Authorization`/`X-Tenant-Id`/`X-Branch-Id`).
- `gf-accounting` → `gf-inventory` (5 REST S2S — Temporal activities `SnapshotPull` (W06-P1/P2, đọc) → `ComputeItem` (compute nội bộ, engine BQGQ 5-phase) → `BulkFillCost`/`BulkInheritCost` (W06-P3/P4, ghi) → `BulkRecomputeLedger` (W06-P5, cascade sổ tồn); gọi **trực tiếp qua HTTP client**, KHÔNG qua BFF).

---

## §7 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v40 §1 Cross-boundary Rules (CB-AP-001, phủ cả AP lẫn PRC) + `INTEG-EXT-gf-accounting-gf-inventory.md` v3 (canonical W06 PRC BE↔BE contract, replace phần "future PRC" trước đây ở `INTEG-EXT-gf-accounting.md`).

| CB ID | Mô tả | REST/GraphQL/Kafka touchpoint | Integration file |
|---|---|---|---|
| CB-AP-001 (nhánh PRC) | Kỳ kế toán + PRC BQGQ đều do `gf-accounting` sở hữu (master); PRC cross-boundary REST **đọc** Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` (Phase 1 snapshot pull), và **ghi** ngược giá vốn phiếu xuất + kế thừa giá phiếu trả + trigger cascade recompute sổ tồn vào `gf-inventory` (Phase 3-4 commit). | REST sync 5 endpoint (2 READ + 3 WRITE): `GET /protected/v1/stock-ledgers/at-date` · `POST /protected/v1/slips-in-period/search` · `POST /protected/v1/delivery-lines/bulk-fill-cost` · `POST /protected/v1/receipt-lines/bulk-inherit-cost` · `POST /protected/v1/stock-ledgers/bulk-recompute` — x-api-key S2S auth, `X-Idempotency-Key: PRC-{runId}-{phase}-{chunkIdx}` cho 3 write endpoint, dedup qua Redis key-value (`idempotency:gf-inventory:{endpoint}:{key}`, SETNX 24h TTL) | `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v3 §4.1-§4.5 |
| CB-PRC-002 (BFF-side) | `agg-garage-graph` orchestrate PRC module — auth header propagation (`Authorization`, `X-Tenant-Id`, `X-Branch-Id`) + Idempotency-Key arg→header forward verbatim cho 2 mutation (Create/Recalc) + `@FeatureOn("Inventory:InventoryV2")` gate fail-fast trước forward `gf-accounting`. | `agg-garage-graph` → `gf-accounting` REST passthrough (6 GraphQL ops → 6 REST endpoint, xem §6) | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.6d |

---

## §8 Implementation Sequence DAG (W06 — nhóm PRC)

> Topological order: `gf-accounting` schema/entity/Temporal producer trước → `gf-inventory` S2S endpoint song song độc lập (không phụ thuộc `gf-accounting` schema, chỉ cần deploy trước Day 3 để 7 Temporal activities gọi thật) → BFF wire sau contract lock → Web UI song song cuối. Effort/Day theo PKG-W06 §4.1 (chỉ trích phần liên quan PRC — `agent-dev-gf-inventory` và `agent-dev-garage-web` còn có phần Stock-V2 report ngoài phạm vi artifact này).

```
DAY 1-5 — gf-accounting (BE lead, per PKG §4.1 agent-dev-gf-accounting, ~39h dày nhất wave):
  [Day 1] Contract review §5+§6 v24 + ADR-027 v5 + ADR-028 v4; scaffold 2 entity JPA
          (ddl-auto=update — KHÔNG Flyway) + PriceCalcRunController/Service;
          Temporal worker embed Spring Boot main process, register PriceCalcRunWorkflow
          trên task queue PRC_TASK_QUEUE (mirror gf-sales pattern, Common Gotcha #7 —
          service Temporal thứ 6)
  [Day 2] W06-1/W06-2 (search/detail-polling) + W06-6 (lookup items-for-cogs, cross-boundary
          gf-erp-mdm+gf-inventory); W06-3 CREATE 202 kick-off — INSERT PENDING +
          WorkflowClient.start() + Idempotency-Key 5-phút window
  [Day 3] 7 Temporal activities impl (SnapshotPull qua S2S W06-P1/P2 · UpdateRunStatus ·
          ComputeItem engine BQGQ 5-phase + tính lặp hội tụ SAFETY_ITERATION_CAP=100 ·
          BulkFillCost qua S2S W06-P3 · BulkInheritCost qua S2S W06-P4 · BulkRecomputeLedger
          qua S2S W06-P5 · CommitRun) — phần phức tạp nhất wave
  [Day 4] W06-4 RECALC (copy-forward Phase 0 + source_run_id) + W06-5 DELETE (soft-delete +
          2 guard 409); concurrency 3-layer verify (DB SELECT FOR UPDATE + Temporal
          WorkflowIdReusePolicy.REJECT_DUPLICATE + partial unique index uidx_prc_active_lock)
  [Day 5] Unit + integration test ≥80% — hội tụ tự tham chiếu (2-3 vòng) + safety cap trigger +
          kỳ đóng chặn CREATE/RECALC/DELETE + run-in-progress chặn + Idempotency replay +
          Temporal outage compensating rollback; KG sync + review fix

  Entry : W05 hard gate pass (Nhập/Xuất trong kỳ + sổ tồn stable — đầu vào BQGQ Phase 1);
          Architecture pre-wave ratified (gf-accounting-api.md v24 §5+§6, ADR-027 v5, ADR-028 v4,
          gf-accounting-data-model.md v14 §2quater)
  Exit  : REVIEW backend handoff Day 4-5 (agent-review-backend, PKG §4.2)

══════════════════════════════════════════════════════
DAY 1-2 — gf-inventory (S2S provider, per PKG §4.1 agent-dev-gf-inventory, chỉ trích phần PRC-facing):
  [Day 1] Contract review §3f v72; scaffold 5 S2S protected endpoint controller
  [Day 2] W06-P1..P5 (5 S2S bulk/read endpoint, x-api-key auth, chunk idempotency
          PRC-{runId}-{phase}-{chunkIdx} qua Redis)

  Entry : gf-accounting-api.md §5 contract lock Day 1 (không hard-block schema —
          gf-inventory chạy song song độc lập)
  Exit  : 5 S2S endpoint reachable trên dev trước gf-accounting Day 3 (7 Temporal activities
          cần call thật, Day 1-2 phía gf-accounting dùng mock)

══════════════════════════════════════════════════════
DAY 1-3 — agg-garage-graph (BFF, per PKG §4.1 agent-dev-agg-garage-graph):
  [Day 1] Contract lock §3f v7.79; scaffold price-calc-run/ module
  [Day 2] 6 resolver passthrough; enrichment executedByName TENANT-USERS DataLoader;
          Idempotency-Key arg→header forward 2 mutation + @FeatureOn fail-fast + error-code map
          (ERR-INV-024/029/030/031/052)
  [Day 3] Regression script price-calc-run.regression.ts (ts-node, mirror pattern hiện có —
          KHÔNG Vitest, per CR-20260731-01); KG sync

  Entry : gf-accounting AP/PRC endpoints available Day 1-2 (mock trước, wire thật sau contract lock)
  Exit  : Regression script PASS; SDL deployed staging

══════════════════════════════════════════════════════
DAY 1-4 — garage-web (per PKG §4.1 agent-dev-garage-web, chỉ trích phần PRC — Day 3 report page
          thuộc EP-INVENTORY-STOCK-V2, ngoài phạm vi artifact này):
  [Day 1] Reuse-First registry lookup (data-table-with-pagination/status-chip mới nếu thiếu);
          §2.4.a Navigation & Routing (menu "Tính giá xuất kho"); mock GraphQL Day 1;
          routes scaffold 2 route PRC
  [Day 2] PriceCalcRunListPage (2 filter + list + modal "Chạy tính giá": Kỳ+Kho+scope+dropdown
          mã) + PriceCalcRunDetailPage (polling 5s Apollo pollInterval + bảng chi tiết mã/lỗi +
          action Tính lại/Xóa log)
  [Day 4] error-messages.ts extend (ERR-INV-024/029/030/031/052) + zod validation + toast wording
          verbatim ("Đã bỏ qua N mã do ngừng hoạt động"; "Tính giá hoàn tất — N mã lỗi");
          Vitest ≥60% + testid ≥95% + polling mock test

  Entry : agg-garage-graph SDL + 6 ops deployed staging; Figma web W06 verified
          (7/8 FEAT node — RECALC action inline DETAIL, không cần node riêng)
  Exit  : E2E flow chạy PRC → polling → hoàn tất → tính lại → xóa log pass (agent-test-e2e
          journey, PKG §4.3)
```

---

## §9 Architecture References

- **ADR-027** (`Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` v5, ACCEPTED) — engine BQGQ 5-phase (Phase 0 resolve items → Phase 1 snapshot pull → Phase 2 compute per item + tính lặp hội tụ `SAFETY_ITERATION_CAP=100` → Phase 3 commit bulk-fill-cost → Phase 4 cascade sổ tồn → Phase 5 commit run status); công thức Đơn giá BQ `HALF_UP` scale 2 (BR-PRC-013); concurrency 3-layer.
- **ADR-028** (`Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md` v4, ACCEPTED — tên file giữ historical, nội dung hiện tại = Temporal workflow) — async execution pattern HTTP 202 kick-off + Temporal workflow embedded `gf-accounting`, task queue `PRC_TASK_QUEUE` (Q2 v3 reversal 2026-07-23, Common Gotcha #7 update 6 service dùng Temporal).
- **`Architecture/api/gf-accounting-api.md`** v24 §5 (6 endpoint canonical W06-1..6) + §6 Naming Registry (`PriceCalcRun`/`PriceCalcRunItem`/`PriceCalcRunStatus`/`PriceCalcErrorReason`) — ACCEPTED.
- **`Architecture/api/gf-inventory-api.md`** v72 §3f (5 S2S PRC-facing endpoint W06-P1..P5) — ACCEPTED (NF-02 đã fix 2026-07-28, §5.2 Naming Registry sync đúng field `openingQty`/`openingValue`).
- **`Architecture/api/agg-garage-graph-graphql.md`** v7.79 §3f (6 op GraphQL PRC — 3 Query + 3 Mutation) — ACCEPTED.
- **`Architecture/data/gf-accounting-data-model.md`** v14 §2quater — 2 bảng `price_calc_run`/`price_calc_run_item`, `ddl-auto=update`.
- **`Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md`** v3 — canonical BE↔BE contract cho 5 endpoint S2S PRC-facing (đã đọc trực tiếp: §3 idempotency Redis, §4.1-§4.5 endpoint contract, §5 retry/circuit-breaker, §6 failure matrix). **Lưu ý version drift**: PKG-W06 §2.4 Bước 0 + §3 Entry Criteria cite "v2" nhưng file thực tế hiện tại là **v3** (bump 2026-07-31 cùng ngày, GAP-W06-GI-04 fix idempotency mechanism Redis thay vì `processed_events`) — xem §10 NC-W06-EP-PRC-002.
- **`Architecture/hld/gf-accounting-HLD.md`** §11 — PRC subsystem (cite theo PKG §2.4 reading list).
- **KG `gf-accounting`** (`Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17) — baseline hiện tại **chưa có** entity `price_calc_run`/`price_calc_run_item` hay 6 endpoint PRC (KG sync diễn ra post-DEV theo policy chuẩn — không phải gap).
- **`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`** v40 — §2.2 BR-PRC-001..018 (công thức BQGQ, tính lặp hội tụ, 2 scope RECALC, error-reason enum 3 giá trị, sort mặc định) + §1 CB-AP-001 (cross-boundary).
- **`Product/Commons/ERROR-CODE-REGISTRY.md`** v32 — `ERR-INV-024` (kỳ đóng), `ERR-INV-029` (run-in-progress), `ERR-INV-030/031/052` (3 lý do lỗi mã: tồn âm / lệch hạch toán / sự cố hệ thống).
- **CLAUDE.md Common Gotcha #5** — `gf-accounting` dùng `ddl-auto=update`, KHÔNG Flyway.
- **CLAUDE.md Common Gotcha #7** — Temporal 6 service (thêm `gf-accounting`, embed worker task queue `PRC_TASK_QUEUE`).
- **`Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md`** v8 — wave scope, DEV task breakdown, agent assignment, entry/exit criteria, carryover audit.

---

## §10 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho | Severity |
|---|---|---|---|---|
| NC-W06-EP-PRC-001 | ~~`source_sha` chưa tính được~~ **RESOLVED 2026-07-31** — orchestrator backfill `91d7f9a23c2c02f27bdd3b58d2283acee76ce3ac243f54b050ce1a1c31707dbe` vào frontmatter + §0. | Delivery Authority (tooling) | RESOLVED | LOW (tooling gap, không phải nội dung) |
| NC-W06-EP-PRC-002 | **`INTEG-EXT-gf-accounting-gf-inventory.md` version citation drift** — PKG-W06 v8 §2.4 Bước 0 + §3 Entry Criteria cite "v2", nhưng file thực tế đã bump lên **v3** cùng ngày 2026-07-31 (GAP-W06-GI-04 fix — sửa cơ chế idempotency từ claim sai "`processed_events`" sang Redis key-value cụ thể). Nội dung v3 **tương thích/superset** v2 (chỉ sửa 1 đoạn mô tả cơ chế lưu trữ idempotency + 2 gap nhỏ P4/P5 — không đổi endpoint shape/behavior chính). Không blocking DEV vì nội dung API/behavior không đổi — chỉ doc-hygiene citation lag giữa 2 artifact cập nhật cùng ngày. Đề nghị Delivery Authority sync lại citation PKG-W06 → "v3" ở lần bump PKG tiếp theo. | Delivery Authority | Không blocking DEV — chỉ doc hygiene | LOW |

---

## §11 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v24 | BA source-of-truth (10 FEAT — AP đã ship W04 + PRC W06) |
| Business rules | `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v40 | BR-AP-001..016 (W04, ngoài scope) + BR-PRC-001..018 (W06 scope) + BR-AP-CMN-001/002 + CB-AP-001 |
| Work package | `Execution/work-packages/PKG-W06-inventory-pricing-stock-report.md` v8 | DEV task breakdown, effort, deliverable checklist (PRC + Stock-V2 + mobile hub) |
| KG gf-accounting | `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v17 | Baseline — chưa có entity/API PRC (sync post-DEV) |
| ADR-027 | `Architecture/decisions/ADR-027-bqgq-engine-and-convergent-iteration.md` v5 | Canonical: engine BQGQ 5-phase + tính lặp hội tụ safety cap 100 |
| ADR-028 | `Architecture/decisions/ADR-028-prc-async-execution-sync-http-plus-background-thread.md` v4 | Canonical: async HTTP 202 + Temporal workflow (tên file historical) |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| ADR-013 | `Architecture/decisions/ADR-013-*.md` | Backward-compat additive only |
| ADR-020 | `Architecture/decisions/ADR-020-*.md` | Stock ledger recompute engine (gf-inventory side) |
| ADR-021 | `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 | REST advisory pattern (reverse direction, reused pattern cho PRC) |
| gf-accounting API | `Architecture/api/gf-accounting-api.md` v24 §5+§6 | 6 endpoint PRC canonical + Naming Registry |
| gf-inventory API | `Architecture/api/gf-inventory-api.md` v72 §3f | 5 S2S PRC-facing endpoint canonical |
| GraphQL ops | `Architecture/api/agg-garage-graph-graphql.md` v7.79 §3f | 6 op PRC canonical (3Q+3M) |
| gf-accounting data model | `Architecture/data/gf-accounting-data-model.md` v14 §2quater | 2 entity `price_calc_run`/`price_calc_run_item` |
| Integration ext | `Architecture/integrations/INTEG-EXT-gf-accounting-gf-inventory.md` v3 | BE↔BE PRC contract 5 endpoint S2S — xem §10 NC-W06-EP-PRC-002 |
| Integration FE | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.6d | UI→GraphQL→REST mapping PRC |
| Error registry | `Product/Commons/ERROR-CODE-REGISTRY.md` v32 | `ERR-INV-024/029/030/031/052` canonical cho PRC |
| FEAT-PRC-LIST | `Product/features/FEAT-PRC-LIST.md` | |
| FEAT-PRC-CREATE | `Product/features/FEAT-PRC-CREATE.md` | |
| FEAT-PRC-DETAIL | `Product/features/FEAT-PRC-DETAIL.md` | |
| FEAT-PRC-RECALC | `Product/features/FEAT-PRC-RECALC.md` | |
| FEAT-PRC-DELETE | `Product/features/FEAT-PRC-DELETE.md` | |
| W04 spec (AP, đã ship) | `Execution/wave-specs/W04/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` | Precedent format cho artifact này — nhóm AP đã DONE |

---

## §12 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W06 từ EP-INVENTORY-ACCOUNTING-PERIOD v24, scoped riêng nhóm **PRC (5 FEAT)** — nhóm AP (5 FEAT) đã ship W04, có exec spec riêng tại `Execution/wave-specs/W04/`. §1-§5 verbatim copy toàn epic gốc (gồm cả §3.1/§4.1 AP, giữ nguyên per policy epic mode dù ngoài scope wave này). §6 Service Impact Matrix (5 FEAT-PRC × 4 boundary — `gf-accounting` lead NEW boundary W06 + Temporal, `gf-inventory` cross-boundary S2S provider, `agg-garage-graph` BFF, `garage-web` UI 2 route; `garage-mobile` out-of-scope). §7 Cross-boundary contracts (CB-AP-001 nhánh PRC từ BR v40 + CB-PRC-002 BFF-side, dẫn `INTEG-EXT-gf-accounting-gf-inventory.md` v3 5 endpoint S2S). §8 Implementation sequence DAG (gf-accounting BE Day1-5 critical path 39h → gf-inventory S2S Day1-2 song song → BFF Day1-3 → Web Day1-4, theo PKG-W06 §4.1 agent assignments, trích phần PRC-only từ 2 agent có scope hỗn hợp PRC+Stock-V2). §9 Architecture references (ADR-027 v5 + ADR-028 v4 canonical + 3 API doc ACCEPTED + integration doc — phát hiện 1 version-citation drift PKG↔actual file, xem §10). §10 Open items — **0 mục BLOCKING** (khác W04 có 2 mục blocking do contract chưa ratify lúc đó) — toàn bộ Architecture + Product đã ACCEPTED/ratified trước wave (`ARCH-REVIEW-W06.md` UNBLOCK + `DRIFT-CHECK-W06-BA-VS-ARCH-2026-07-28.md` verdict CONSISTENT); chỉ 2 mục LOW: (a) NC-W06-EP-PRC-001 `source_sha` tooling gap (mirror W04); (b) NC-W06-EP-PRC-002 doc-hygiene citation lag `INTEG-EXT-gf-accounting-gf-inventory.md` v2→v3 (PKG chưa cập nhật citation sau bump cùng ngày). |
