---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md"
source_version: 16
source_sha: "NEED CONFIRMATION — SHA256 chưa tính được (agent-execution-spec-author spawn này không có Bash tool access). Orchestrator / pre-flight script cần chạy `sha256sum Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` và điền giá trị thật trước khi spec chuyển ACTIVE."
generated_at: "2026-07-08T00:00:00+00:00"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
features_in_wave:
  - FEAT-AP-LIST
  - FEAT-AP-CREATE
  - FEAT-AP-DETAIL
  - FEAT-AP-EDIT
  - FEAT-AP-DELETE
boundaries_affected:
  - gf-accounting
authoring_inputs:
  kg_baseline_sha: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — không được cung cấp trong Context Bundle mode epic"
  bundle_path: "N/A — epic mode, no per-tier bundle"
  bundle_generated_at: "N/A"
---

# EP-INVENTORY-ACCOUNTING-PERIOD — Execution Spec (W04, nhóm AP)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v16.
> §1-§5 verbatim từ source (toàn bộ epic — gồm cả nhóm **PRC** dù không thuộc W04). §6-§12 là DEV section do Delivery Authority + Architecture Authority soạn, **scoped riêng cho W04 nhóm AP (5 FEAT-AP-\*)**.
>
> **Lưu ý phạm vi wave**: Epic gốc gồm **10 feature** (5 AP + 5 PRC). W04 chỉ triển khai **nhóm AP (5 FEAT)** trên boundary `gf-accounting`. Nhóm **PRC (Tính giá xuất kho, 5 FEAT)** thuộc scope **W06** (xem PKG-W04 §2.3 Out of Scope: "Phiếu nhập/xuất (W05), tính giá BQGQ + báo cáo (W06)") và sẽ có execution spec riêng khi tới wave đó. `boundaries_affected` frontmatter chỉ liệt kê `gf-accounting` (boundary sở hữu schema/logic chính theo Context Bundle chỉ định) — §6 dưới đây liệt kê đầy đủ các boundary tham gia triển khai (BFF, Web) cũng như boundary tiêu thụ cross-epic (`gf-inventory`).

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Source version | 16 |
| Source SHA | NEED CONFIRMATION (xem frontmatter `source_sha`) |
| Generated at | 2026-07-08T00:00:00+00:00 |
| Wave | W04 — Inventory V2 Slice 2/4: Khởi tạo kho (Kỳ kế toán + Tồn đầu kỳ) |
| Parent PKG | [`PKG-W04-inventory-period-opening-balance.md`](../../../../Execution/work-packages/PKG-W04-inventory-period-opening-balance.md) v9 |

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
- Khi kỳ ở trạng thái **"Đã đóng"**: chặn thêm / sửa / xóa phiếu nhập kho, xuất kho có ngày chứng từ thuộc kỳ đó (chi tiết tại `EP-INVENTORY-RECEIPT-V2`, `EP-INVENTORY-DELIVERY-V2`).
- Đóng/mở kỳ là **field trạng thái** sửa qua `FEAT-AP-EDIT` (không có feature đóng/mở riêng).

### 3.2 Tính giá xuất kho (PRC)

> **Ngoài scope W04** — nhóm PRC thuộc W06. Giữ nguyên verbatim từ source epic vì §1-§5 là copy nguyên đoạn (policy epic mode); không dùng làm input triển khai cho W04.

> `FEAT-PRC-*` là UI tính giá xuất kho theo **BQGQ cuối kỳ** — tính theo **mã sản phẩm nội bộ** (+ kho + garage). Chi tiết công thức/vòng đời: `BR-GF-INVENTORY-ACCOUNTING-PERIOD` §2.2 (BR-PRC-*).

```
  Chọn kỳ + kho + mã  ──► Thực hiện tính giá (BQGQ)
       │                      │
       │                      ▼
       │            ┌──────────────────────────┐
       │            │ • Đơn giá BQ = (GT tồn đầu│
       │            │   + GT nhập)/(SL tồn đầu  │
       │            │   + SL nhập)              │
       │            │ • Điền giá vốn phiếu xuất │
       │            │ • Cập nhật giá trị sổ tồn │
       │            │ • Ghi log lần chạy        │
       │            └──────────┬───────────────┘
       │                       │ Tính lại (ghi đè)
       │                       ▼
       │              (cập nhật lại kết quả)
       └─ Xóa log (không rollback; chặn nếu kỳ đã đóng)
```

**Ghi chú:**
- **Đơn giá BQ chỉ dùng phía NHẬP** (+ tồn đầu kỳ); giá vốn xuất là **output** = Đơn giá BQ × **SL quy đổi**. **NHẬP trong kỳ (SL + GT)** = Σ(Nhập mua + Nhập hàng bán bị trả lại + Nhập khác) − Σ(Xuất trả hàng mua); giá trị kế thừa (không theo đơn giá BQ): "Nhập hàng bán bị trả lại" ← phiếu **Xuất bán** gốc (BR-IRV2-031); "Xuất trả hàng mua" ← phiếu **Nhập mua** gốc (BR-IDV2-030). **Mọi "SL" trong PRC = SL quy đổi (ĐVT chính)**; đơn giá BQ ra theo ĐVT chính (khác đơn giá nhập theo ĐVT nhập).
- **Tồn đầu kỳ** = **tồn kho của mặt hàng theo (Mã + Kho + Garage), tính đến hết ngày "Từ ngày" − 1** — **SL tồn đầu** (SL quy đổi ĐVT chính) và **GT tồn đầu** (tiền tuyệt đối VND); mã chưa phát sinh gì trước kỳ → đến từ **OB** (nếu có) hoặc 0. Đơn giá BQ = **kết quả chạy giá** = (GT đầu + GT nhập)/(SL đầu + SL nhập), **làm tròn 2 chữ số thập phân sau khi tính** và **dùng giá trị đó để tính tiền vốn** (cột "Đơn giá bình quân" hiển thị đúng 2 lẻ này); đơn giá = 0 hợp lệ (mã chưa nhập / nhập tiền 0).
- **KHÔNG bắt tính tuần tự**: tính kỳ nào cũng được — vì tồn đầu lấy theo **tồn kho đến "Từ ngày" − 1** nên đã phản ánh mọi biến động nhập/xuất của các kỳ trước (kể cả kỳ chưa tính giá: phiếu xuất chưa tính → tiền vốn = 0). Tính/tính lại một kỳ → các kỳ **sau** cần tính lại.
- **Tính lặp khi có phiếu trả tự tham chiếu**: nếu mã có dòng phiếu **"Nhập hàng bán bị trả lại" "Tự nhập giá" KHÔNG tích** (đơn giá để hệ thống cập nhật) tham chiếu phiếu **Xuất bán cùng kỳ chưa tính** → GT nhập phụ thuộc giá vốn xuất (output BQGQ) → hệ thống **tính lặp đến khi đơn giá BQ hội tụ** (BR-PRC-017); dòng **"Tự nhập giá" tích** (nhập đơn giá tay) → không lặp.
- Chọn **kỳ** → tự điền Từ/Đến, khóa không sửa. Tính theo **(Mã + Kho + Garage)**; chọn **"Tất cả mã"** hoặc mã cụ thể.
- **Sau khi tính**: cập nhật giá vốn phiếu xuất + **giá trị sổ tồn** (báo cáo tự đúng). **Tính lại** ghi đè + audit mới; **chặn RECALC nếu kỳ đã đóng** (mở lại kỳ để tính). **Xóa log** không rollback giá vốn; chặn nếu kỳ đã đóng.
- Mã **lỗi** → không cập nhật giá vốn + giá trị tồn cho mã đó; bảng "Sản phẩm chạy giá lỗi".

---

## 4. Features

### 4.1 Kỳ kế toán (AP) — 5 feature — **W04 scope**

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-AP-LIST` | Danh sách kỳ kế toán | [FEAT-AP-LIST](../../../../Product/features/FEAT-AP-LIST.md) | P1 |
| `FEAT-AP-CREATE` | Tạo kỳ kế toán | [FEAT-AP-CREATE](../../../../Product/features/FEAT-AP-CREATE.md) | P1 |
| `FEAT-AP-DETAIL` | Chi tiết kỳ kế toán | [FEAT-AP-DETAIL](../../../../Product/features/FEAT-AP-DETAIL.md) | P1 |
| `FEAT-AP-EDIT` | Chỉnh sửa kỳ kế toán (gồm đóng/mở kỳ) | [FEAT-AP-EDIT](../../../../Product/features/FEAT-AP-EDIT.md) | P1 |
| `FEAT-AP-DELETE` | Xóa kỳ kế toán | [FEAT-AP-DELETE](../../../../Product/features/FEAT-AP-DELETE.md) | P1 |

### 4.2 Tính giá xuất kho (PRC) — 5 feature — **NGOÀI scope W04 (dự kiến W06)**

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

## §6 Service Impact Matrix (W04 — nhóm AP)

> Wave W04 nhóm AP — 5 FEAT × 3 boundary triển khai trực tiếp (`gf-accounting` BE lead → `agg-garage-graph` BFF → `garage-web` UI) + 1 boundary tiêu thụ cross-epic (`gf-inventory`, REST advisory, thuộc scope `EP-INVENTORY-OPENING-BALANCE` — xem exec-spec riêng). `garage-mobile` **KHÔNG** build màn AP trong W04 (per PKG §2.2.5 + §2.3 — kế toán CRUD kỳ chỉ desktop).
>
> ⚠️ **Endpoint/error-code contract của cột API dưới đây theo PKG-W04 v9 §2.2.1 (naming `V4-AP-*`)** — nguồn wave-execution DEV thực tế đọc. Cột này **conflict với** ADR-019 (ratified) + `gf-accounting-api.md` v15 §4 + `ERROR-CODE-REGISTRY.md` v17 (naming/error-code khác — xem chi tiết §10 NC-W04-EP-AP-001, mục BLOCKING). DEV/Architecture Authority phải reconcile trước khi implement.

| Boundary | Role | FEATs touched (W04 AP) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-accounting` | **Lead boundary** | Tất cả 5 FEAT-AP-* | **MỚI** entity `accounting_period` (id, tenant_id, garage_id, code, name, level `YEAR\|QUARTER\|MONTH`, parent_id scalar self-FK ADR-009, start_date, end_date, status `OPEN\|CLOSED`, closed_at, reopened_at, audit cols). PKG §2.2.1 chỉ định Flyway `V{N+1}__accounting_v1_accounting_period.sql`; **conflict** với ADR-019 Decision B + CLAUDE.md §7 Gotcha #5 (gf-accounting dùng `ddl-auto=update`, KHÔNG Flyway — xem NC-W04-EP-AP-002) | PKG: 6 REST endpoint `V4-AP-1..5` + `V4-AP-LC` dưới `/protected/accounting/v1/accounting-periods/*`. ADR-019/gf-accounting-api.md §4: 7 endpoint dưới `/api/v2/accounting-periods/*` (search, tree tách riêng, detail, create, update, delete) + `/protected/v1/accounting-periods/lock-check` — xem NC-W04-EP-AP-001 | — | 2 event `AccountingPeriodClosed`/`AccountingPeriodReopened` khai báo **PROPOSED** (topic `AC-DEV-ACCOUNTING-EVENTS`, MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE`) — **KHÔNG publish trong W04** (ADR-019 Decision C: flip ACTIVE = trách nhiệm wave sau) |
| `agg-garage-graph` | BFF orchestrator | Tất cả 5 FEAT-AP-* | — | 5 GraphQL ops passthrough (2 Query `searchAccountingPeriods`/`getAccountingPeriod` + 3 Mutation `createAccountingPeriod`/`updateAccountingPeriod`/`deleteAccountingPeriod`, PKG §2.2.3) + `@FeatureOn("Inventory:InventoryV2")` gate resolver-level fail-fast 403 | — | — |
| `garage-web` | UI consumer (full CRUD, desktop-only) | Tất cả 5 FEAT-AP-* | — | — | **MỚI** 4 route tại `src/features/inventory/`: `/inventory/accounting-periods` (tree view list), `/inventory/accounting-periods/create`, `/inventory/accounting-periods/{id}` (detail), `/inventory/accounting-periods/{id}/edit` (bao gồm đóng/mở status toggle). Reuse-first: `share/tree/hierarchical-tree.tsx` + `share/period-picker/period-picker.tsx` + `share/inputs/status-toggle.tsx` (PKG §2.2.4). TanStack Router `beforeLoad` gate `Inventory:InventoryV2`. | — |
| `garage-mobile` | **Out of scope W04** | 0 FEAT | — | — | — | — |
| `gf-inventory` | **Cross-epic consumer** (không thuộc `boundaries_affected` của epic này — xem `EP-INVENTORY-OPENING-BALANCE` exec-spec) | N/A (không có FEAT-AP-* nào chạy trên `gf-inventory`) | Consume `V4-AP-LC` / `lock-check` qua `AccountingPeriodClient` (Resilience4j circuit breaker + Spring Retry) trong 3 write-path OB (import/edit/delete-lines) — ADR-021 | — | — | — |

**Dependency arrows:**
- `garage-web` → `agg-garage-graph` (5 GraphQL AP ops).
- `agg-garage-graph` → `gf-accounting` (6-7 REST endpoints AP passthrough — số lượng tùy nguồn, xem NC-W04-EP-AP-001).
- `gf-inventory` → `gf-accounting` (REST advisory `lock-check`, cross-epic, ADR-021 — 3 write-path OB: verify-import advisory, import/edit/delete-lines commit-guard fail-CLOSED).

---

## §7 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 §1 Cross-boundary Rules (CB-AP-001) + ADR-019/ADR-021.

| CB ID | Mô tả | REST/GraphQL/Kafka touchpoint | Integration file |
|---|---|---|---|
| CB-AP-001 | Kỳ kế toán do `gf-accounting` sở hữu (master); `gf-inventory` consume qua REST khi cần chặn phiếu nhập/xuất kho / import tồn đầu kỳ trong kỳ đóng và làm mốc cho báo cáo tồn/NXT. (PRC BQGQ, cross-epic W06, cross-boundary REST đọc Sổ tồn SL + phiếu nhập/xuất từ `gf-inventory` — ngoài scope W04.) | REST sync: `gf-inventory` → `gf-accounting` `GET /protected/v1/accounting-periods/lock-check?date={ISO}` (ADR-019 Decision C + ADR-021, cache LRU 30s caller-side, fail-CLOSED cho commit-path OB / fail-OPEN + marker cho preview-path) | `Architecture/integrations/INTEG-EXT-gf-accounting.md` v5 §1 (provider `gf-accounting`, caller `gf-inventory` — hiện văn bản ghi "future RECEIPT-V2/DELIVERY-V2/PRC"; **NEED CONFIRMATION**: chưa liệt kê tường minh caller `gf-inventory` OB W04 mặc dù nội dung tương thích — xem NC-W04-EP-AP-003). Cũng xem `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 (contract chi tiết REST advisory từ phía `gf-inventory` caller). |
| CB-AP-002 (BFF-side) | `agg-garage-graph` orchestrate AP module — auth header propagation (`Authorization`, `X-Tenant-Id`, `X-Branch-Id`) + `@FeatureOn("Inventory:InventoryV2")` gate fail-fast 403 trước forward `gf-accounting` (CR-20260707-02). | `agg-garage-graph` → `gf-accounting` REST passthrough (5 GraphQL ops → 6-7 REST endpoints, xem §6) | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.6b (UI→GraphQL→REST mapping, cited tại ADR-019 References) |

---

## §8 Implementation Sequence DAG (W04 — nhóm AP)

> Topological order: `gf-accounting` schema/entity/REST producer trước → BFF wire → Web UI song song cuối. Không hard gate với nhóm OB (`gf-inventory`) trong cùng wave — cả 2 team chạy song song, chỉ cross tại điểm `V4-AP-LC`/lock-check (BE `gf-inventory` cần `gf-accounting` endpoint sẵn sàng từ Day 2 để wire `AccountingPeriodClient`). Effort/Day theo PKG-W04 §4.1.

```
DAY 1-2 — gf-accounting (BE lead, per PKG §4.1 agent-dev-gf-accounting):
  [Day 1]
  gf-accounting (schema) : Migration accounting_period entity
                            - PKG chỉ định: Flyway V{N+1}__accounting_v1_accounting_period.sql
                            - ⚠️ CONFLICT: ADR-019 Decision B + CLAUDE.md Gotcha #5 chỉ định
                              ddl-auto=update (KHÔNG Flyway) cho gf-accounting — xem NC-W04-EP-AP-002
                            - Enum AccountingPeriodLevel {YEAR, QUARTER, MONTH};
                              AccountingPeriodStatus {OPEN, CLOSED}
                            - Constraint: level MONTH cần parent QUARTER; QUARTER cần parent YEAR;
                              YEAR không parent (BR-AP-003/004)
                            - Index (theo ADR-019 §Decision B): idx_ap_tenant_year, idx_ap_tenant_status,
                              idx_ap_tenant_dates, idx_ap_parent, idx_ap_tenant_name

  gf-accounting (API)    : 6-7 REST endpoint AP CRUD + tree + lock-check
                            - PKG numbering: V4-AP-1 search (list/tree gộp) · V4-AP-2 create
                              (validate parent + overlap + auto-generate children BR-AP-009) ·
                              V4-AP-3 detail · V4-AP-4 update (status transition đóng/mở, immutable
                              field guard BR-AP-016) · V4-AP-5 delete (3-guard: children/documents/
                              closed) · V4-AP-LC lock-check (cross-boundary advisory)
                            - ADR-019 canonical: 7 endpoint tách search (POST, flat/paged) VÀ tree
                              (POST /tree riêng, LIKE-unaccent name search + ancestor/descendant path)
                            - Xem NC-W04-EP-AP-001 (reconcile 2 nguồn trước khi DEV chốt contract)

  Entry : W04 kick-off, boundary AP move sang gf-accounting (ADR-019, EP v16) — team gf-accounting
          contract review §3e + gf-accounting-api.md §Accounting Period
  Exit  : Migration/schema deployed dev; unit test service layer ≥ 80% pass

  [Day 2]
  gf-accounting (advisory): V4-AP-LC / lock-check endpoint (REST advisory cross-boundary cho
                            gf-inventory OB write-path — ADR-021 caller side)
                            - Response shape PKG: {isLocked, periodCode, closedAt}
                            - Response shape ADR-019/021 canonical: {locked, periodId, periodCode,
                              status, periodType, startDate, endDate} — xem NC-W04-EP-AP-001
                            - Cache PKG: 60s / ADR-019: 30s LRU caller-side — xem NC-W04-EP-AP-001
                            - Integration test Testcontainers (cascade parent-child, đóng/mở,
                              delete guard, overlap concurrent SELECT FOR UPDATE)

  Entry : Schema + 5 CRUD endpoint available
  Exit  : lock-check endpoint reachable trên dev cho gf-inventory team bắt đầu wire
          AccountingPeriodClient (Day 2 song song bên gf-inventory, thuộc EP-OPENING-BALANCE)

  [Day 3-4]
  gf-accounting (integration): E2E integration với gf-inventory REST advisory (đóng kỳ → gf-inventory
                            OB import bị chặn ERR-INV-024/lock-check response) + feature-flag
                            @FeatureOn("Inventory:InventoryV2") class-level trên AccountingPeriodController +
                            KG sync (gf-accounting.knowledge-graph.yaml thêm entity accounting_period)
                            + code review fix

  Entry : gf-inventory OB write-path đã wire lock-check (cross-team dependency, không hard gate —
          có thể mock nếu gf-inventory chưa xong)
  Exit  : REVIEW backend handoff Day 4 (agent-review-backend, PKG §4.2)

══════════════════════════════════════════════════════
DAY 1-3 — agg-garage-graph (BFF, per PKG §4.1 agent-dev-agg-garage-graph):

  [Day 1] Contract lock §3e v7.48; module scaffold src/graphql/modules/gf-accounting/accounting-period/
  [Day 2] Resolver passthrough 5 op (2 Query + 3 Mutation); @FeatureOn("Inventory:InventoryV2") gate
          resolver-level fail-fast 403; error-code-map module (mã lỗi theo nguồn nào — xem
          NC-W04-EP-AP-001, PENDING reconcile trước khi map)
  [Day 3] Vitest ≥ 80%; KG sync (agg-garage-graph.knowledge-graph.yaml thêm 5 op)

  Entry : gf-accounting AP endpoints available Day 1-2 (mock trước, wire thật sau contract lock)
  Exit  : Vitest contract test ≥ 80% pass; SDL deployed staging

══════════════════════════════════════════════════════
DAY 1-4 — garage-web (per PKG §4.1 agent-dev-garage-web, chạy song song OB + mobile hub cùng team FE):

  [Day 1] Reuse-First registry lookup (tree/period-picker/status-toggle); mock GraphQL từ contract
          lock Day 1 BFF; routes scaffolding; Navigation & Routing T-web-Nav1..4 (menu "Kỳ kế toán")
  [Day 2-3] AccountingPeriodListPage (tree view) + CreatePage + DetailPage + EditPage (đóng/mở
          toggle); form react-hook-form + zod; feature-flag Inventory:InventoryV2 beforeLoad gate + sidebar ẩn
  [Day 4] Vitest ≥ 60% + testid ≥ 95%; KG sync + code review fix

  Entry : agg-garage-graph SDL + 5 ops deployed staging; Figma web W04 verified (2026-07-07)
  Exit  : E2E flow tạo cây kỳ → đóng/mở → xóa pass (agent-test-e2e journey, PKG §4.3)
```

---

## §9 Architecture References

- **ADR-019** (`Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md` v4, ACCEPTED) — canonical decision: boundary ownership `gf-accounting`, schema `accounting_period` **additive + `ddl-auto=update`** (KHÔNG Flyway), REST `lock-check` ACTIVE + Kafka events PROPOSED, prefix `/api/v2/accounting-periods/*` (7 endpoint), error codes `ERR-INV-021..026` verbatim + namespace mới `ERR-AP-001` (pending BA register, chỉ cho BR-AP-016 immutable-field).
- **ADR-021** (`Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2, ACCEPTED) — chi tiết REST advisory pattern phía `gf-inventory` caller (cache TTL 30s, fail-CLOSED commit-path / fail-OPEN preview-path, response shape `{locked, periodId, periodCode, status, periodType, startDate, endDate}`).
- **`Architecture/api/gf-accounting-api.md`** v15 §4 "Accounting Period (DESIGN)" — endpoint canonical theo ADR-019 (7 endpoint, `/api/v2/*`); **KHÔNG khớp** PKG-W04 §2.2.1 naming `V4-AP-*` / path `/protected/accounting/v1/*` — xem NC-W04-EP-AP-001.
- **`Architecture/data/gf-accounting-data-model.md`** §6 `accounting_period` entity (chưa đọc trực tiếp trong phiên author này — cite theo ADR-019 References).
- **`Architecture/hld/gf-accounting-HLD.md`** §10 Accounting Period subsystem (cite theo ADR-019 References).
- **`Architecture/events/gf-accounting-events.md`** §2 `AccountingPeriodClosed`/`AccountingPeriodReopened` (PROPOSED, topic `AC-DEV-ACCOUNTING-EVENTS`).
- **`Architecture/integrations/INTEG-EXT-gf-accounting.md`** v5 — gf-accounting là provider; caller `gf-sales` (ACTIVE) + future RECEIPT-V2/DELIVERY-V2/PRC (DESIGN, ADR-019) — xem NC-W04-EP-AP-003.
- **`Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md`** §3.6b — UI→GraphQL→REST mapping AP.
- **`Architecture/api/agg-garage-graph-graphql.md`** v7.48 §3e — SDL + 5 GraphQL AP op canonical.
- **ADR-009** — JPA no relationship mapping; `accounting_period.parent_id` scalar self-FK.
- **ADR-013** — backward-compat additive-only same major (áp cho Kafka event PROPOSED contract khi flip ACTIVE ở wave sau).
- **ADR-014** — Insurance Settlement reuse `gf-accounting` (precedent cho accounting subdomain consolidation).
- **KG `gf-accounting`** (`Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6) — baseline hiện tại **chưa có** entity `accounting_period` / API AP (KG sync diễn ra post-DEV theo policy chuẩn — không phải gap).
- **`Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md`** v27 — §2.1 BR-AP-001..016 + BR-AP-003a (range dropdown năm) + §2.3 BR-AP-CMN-001/002 (§2.2 BR-PRC-* ngoài scope W04).
- **`Product/error-code/ERROR-CODE-REGISTRY.md`** v17 — `ERR-INV-021..026` canonical cho AP (dòng 119-124); **KHÔNG có** `ERR-AP-010..020` mà PKG-W04 §2.2.1 dùng — xem NC-W04-EP-AP-001.
- **`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`** — UX spec web-only cho nhóm AP.
- **`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`** v9 — wave scope, DEV task breakdown, agent assignment, entry/exit criteria.

---

## §10 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho | Severity |
|---|---|---|---|---|
| NC-W04-EP-AP-001 | **AP REST endpoint contract drift — 2 nguồn không khớp nhau.** PKG-W04 v9 §2.2.1 dùng naming `V4-AP-1..5` + `V4-AP-LC`, path `/protected/accounting/v1/accounting-periods/*`, error codes `ERR-AP-010..020`. Nguồn canonical **ADR-019 (ACCEPTED v4)** + `gf-accounting-api.md` v15 §4 + `ERROR-CODE-REGISTRY.md` v17 dùng path `/api/v2/accounting-periods/*` (7 endpoint tách search/tree riêng) + `/protected/v1/accounting-periods/lock-check`, error codes `ERR-INV-021..026` (đã registered) + `ERR-AP-001` (namespace mới, CHỈ cho BR-AP-016 immutable-field, đang pending BA register). `ERR-AP-010..020` **KHÔNG tồn tại** trong ERROR-CODE-REGISTRY v17. Response shape `V4-AP-LC` (PKG: `{isLocked, periodCode, closedAt}`) cũng khác canonical (`{locked, periodId, periodCode, status, periodType, startDate, endDate}` — ADR-019/021); cache TTL PKG=60s vs ADR=30s. Nếu DEV build theo PKG naming, contract sẽ không khớp `gf-accounting-api.md` (đã ratified per PKG Entry Criteria §3 nhưng thực tế nội dung KHÔNG match) và error codes không tồn tại trong registry → contract test/BFF error-map sẽ fail. **BLOCKING** — Architecture Authority phải reconcile (cập nhật `gf-accounting-api.md` để khớp PKG, HOẶC sửa PKG-W04 §2.2.1 về đúng ADR-019 canonical) trước khi `agent-dev-gf-accounting` chốt contract Day 1. | Architecture Authority + Delivery Authority | `gf-accounting` DEV endpoint impl; `agg-garage-graph` error-code-map; contract test `agent-test-api` | **BLOCKING** |
| NC-W04-EP-AP-002 | **Migration strategy drift** — PKG-W04 §2.2.1 chỉ định `Flyway V{N+1}__accounting_v1_accounting_period.sql` cho `gf-accounting`. ADR-019 Decision B + `CLAUDE.md` §7 Gotcha #5 (đồng nhất với `gf-erp-mdm`, `gf-shipment`, `gf-worker`) chỉ định `gf-accounting` dùng **`ddl-auto=update`** — KHÔNG Flyway DDL, đồng nhất với 5 baseline table + 3 design insurance table hiện có trên `gf-accounting`. Nếu DEV theo PKG tạo Flyway migration, sẽ lệch convention boundary đã ratified và có thể conflict với `ddl-auto=update` khi cùng chạy trên 1 schema. **BLOCKING** cho bước schema Day 1. | Architecture Authority + Delivery Authority | `gf-accounting` DEV schema setup Day 1 | **BLOCKING** |
| NC-W04-EP-AP-003 | **`INTEG-EXT-gf-accounting.md` chưa liệt kê tường minh caller `gf-inventory` cho OB W04** — hiện văn bản v5 chỉ ghi "future RECEIPT-V2/DELIVERY-V2/PRC" là caller của `lock-check`, chưa cập nhật để phản ánh `gf-inventory` OB write-path (import/edit/delete-lines) đã trở thành caller thực tế trong W04 (theo ADR-021). Đề nghị Architecture Authority bổ sung entry trước hoặc trong W04 để tránh doc drift. | Architecture Authority | Không blocking DEV (nội dung tương thích) — chỉ doc hygiene | MEDIUM |
| NC-W04-EP-AP-004 | **`source_sha` chưa tính được** — agent-execution-spec-author spawn này không có Bash tool access nên không compute được SHA256 thật của `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v16. Orchestrator/pre-flight script cần điền giá trị thật (`sha256sum`) trước khi spec này chuyển DRAFT → ACTIVE, theo đúng audit trail convention (mirror W03 `source_sha` field). | Delivery Authority (tooling) | DRAFT → ACTIVE transition audit | LOW (tooling gap, không phải nội dung) |

---

## §11 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` v16 | BA source-of-truth (10 FEAT — AP+PRC; W04 chỉ AP) |
| Business rules | `Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27 | BR-AP-001..016 + BR-AP-003a + BR-PRC-001..017 (PRC ngoài scope W04) + BR-AP-CMN-001/002 + CB-AP-001 |
| Work package | `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9 | DEV task breakdown, effort, deliverable checklist (AP + OB + mobile hub) |
| KG gf-accounting | `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` v6 | Baseline — chưa có entity/API AP (sync post-DEV) |
| ADR-019 | `Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md` v4 | Canonical: boundary + schema + REST/Kafka contract + error codes |
| ADR-021 | `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 | REST advisory pattern chi tiết phía `gf-inventory` caller |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| ADR-013 | `Architecture/decisions/ADR-013-*.md` | Backward-compat additive only |
| ADR-014 | `Architecture/decisions/ADR-014-insurance-settlement-ownership.md` | Precedent accounting subdomain consolidation |
| gf-accounting API | `Architecture/api/gf-accounting-api.md` v15 §4 | Endpoint canonical theo ADR-019 (conflict với PKG — xem §10) |
| GraphQL ops | `Architecture/api/agg-garage-graph-graphql.md` v7.48 §3e | SDL + 5 op AP canonical |
| Integration ext | `Architecture/integrations/INTEG-EXT-gf-accounting.md` v5 | gf-accounting provider, caller gf-sales + future OB/RECEIPT/DELIVERY/PRC |
| Integration FE | `Architecture/integrations/INTEG-FE-garage-web-agg-garage-graph.md` §3.6b | UI→GraphQL→REST mapping |
| Error registry | `Product/error-code/ERROR-CODE-REGISTRY.md` v17 | `ERR-INV-021..026` canonical cho AP |
| UX-FLOW | `Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md` | UX spec web-only |
| FEAT-AP-LIST | `Product/features/FEAT-AP-LIST.md` | |
| FEAT-AP-CREATE | `Product/features/FEAT-AP-CREATE.md` | |
| FEAT-AP-DETAIL | `Product/features/FEAT-AP-DETAIL.md` | |
| FEAT-AP-EDIT | `Product/features/FEAT-AP-EDIT.md` | |
| FEAT-AP-DELETE | `Product/features/FEAT-AP-DELETE.md` | |

---

## §12 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W04 từ EP-INVENTORY-ACCOUNTING-PERIOD v16, scoped riêng nhóm **AP (5 FEAT)** — nhóm PRC (5 FEAT) ngoài scope W04 (dự kiến W06). §1-§5 verbatim copy toàn epic gốc (gồm cả §3.2/§4.2 PRC, giữ nguyên per policy epic mode dù ngoài scope wave). §6 Service Impact Matrix (5 FEAT-AP × 3 boundary triển khai + 1 boundary cross-epic consumer `gf-inventory` + mobile out-of-scope). §7 Cross-boundary contracts (CB-AP-001 từ BR v27 + CB-AP-002 BFF-side). §8 Implementation sequence DAG (gf-accounting BE Day1-4 → BFF Day1-3 → Web Day1-4, theo PKG-W04 §4.1 agent assignments). §9 Architecture references (ADR-019/021 canonical + gf-accounting-api.md + error registry). §10 Open items — phát hiện **2 mục BLOCKING**: (a) NC-W04-EP-AP-001 endpoint/error-code contract drift giữa PKG-W04 §2.2.1 (naming `V4-AP-*`, `ERR-AP-010..020` — không tồn tại trong registry) và nguồn canonical ADR-019/gf-accounting-api.md/ERROR-CODE-REGISTRY (`/api/v2/accounting-periods/*`, `ERR-INV-021..026`); (b) NC-W04-EP-AP-002 migration strategy drift (PKG chỉ định Flyway, ADR-019 + CLAUDE.md Gotcha #5 chỉ định `ddl-auto=update`). Cả 2 cần Architecture Authority + Delivery Authority reconcile trước DEV start Day 1. Thêm NC-W04-EP-AP-003 (doc hygiene, MEDIUM) + NC-W04-EP-AP-004 (source_sha chưa compute được do thiếu Bash tool, LOW — tooling gap). |
