---
type: execution-spec
artifact_kind: epic
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source_ref: "Product/epics/EP-INVENTORY-OPENING-BALANCE.md"
source_version: 5
source_sha: "NEED CONFIRMATION — sha256 không compute được trong session author (không có Bash tool khả dụng); orchestrator/CI backfill qua `sha256sum Product/epics/EP-INVENTORY-OPENING-BALANCE.md` trước khi activate DRAFT→ACTIVE."
generated_at: "2026-07-08T00:00:00+00:00"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
features_in_wave:
  - FEAT-OB-LIST
  - FEAT-OB-IMPORT
  - FEAT-OB-EDIT
  - FEAT-OB-DELETE-LINES
boundaries_affected:
  - gf-inventory
  - gf-accounting
authoring_inputs:
  kg_baseline_sha: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "N/A — epic mode, no fanout map"
  bundle_path: "N/A — epic mode, no per-tier bundle"
  bundle_generated_at: "N/A"
---

# EP-INVENTORY-OPENING-BALANCE — Execution Spec (W04)

> **Execution spec**, không phải nguồn BA. Nguồn gốc: `Product/epics/EP-INVENTORY-OPENING-BALANCE.md` v5.
> §1-§5 verbatim từ source. §6-§12 là DEV section do Delivery Authority + Architecture Authority soạn.

---

## §0 Nguồn (audit)

| Field | Value |
|---|---|
| Source path | [`Product/epics/EP-INVENTORY-OPENING-BALANCE.md`](../../../../Product/epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Source version | 5 |
| Source SHA | NEED CONFIRMATION (xem note frontmatter `source_sha`) |
| Generated at | 2026-07-08T00:00:00+00:00 |
| Wave | W04 — Inventory V2 Slice 2/4: Khởi tạo kho (Kỳ kế toán + Tồn đầu kỳ) |

---

## 1. Outcome / Hypothesis

Nếu garage import được **tồn đầu kỳ** (số lượng + giá trị tồn theo mã sản phẩm nội bộ, theo kho, chốt tại một ngày) với bước kiểm tra dữ liệu trước khi ghi — thì garage có điểm khởi đầu tồn kho chính xác để phục vụ xuất kho và báo cáo tồn/NXT, kể cả khi chưa có phiếu nhập kho tương ứng.

---

## 2. Personas Impacted

| Persona | Role | Mô tả |
|---|---|---|
| Chủ garage | PRIMARY | Import tồn đầu kỳ, rà soát danh sách, xóa dòng theo guardrail |
| Kế toán | PRIMARY | Quyền tương đương chủ garage |

---

## 3. Vòng đời dữ liệu

```
  ┌──────────────────┐     Kiểm tra dữ liệu      ┌──────────────────┐
  │  Tải template +  │─────────────────────────►│  Preview         │
  │  chọn file       │                          │  (hợp lệ / lỗi)  │
  └──────────────────┘                          └────────┬─────────┘
                                                          │ Xác nhận import
                                                          ▼
                                              ┌──────────────────────┐
                                              │  Dòng tồn đầu kỳ     │
                                              │  (ghi vào bảng mới)  │
                                              └────────┬─────────────┘
                                                       │
                                          ┌────────────┼────────────┐
                                          │            │            │
                                     Sửa dòng    Xóa dòng    (giữ nguyên)
                                     (FEAT-OB-EDIT) (guardrail)
                                          │            │
                                          ▼            ▼
                                    ┌───────────┐ ┌──────────────┐
                                    │ Đã cập nhật│ │ Đã xóa/Chặn │
                                    └───────────┘ └──────────────┘
```

**Ghi chú:**
- Tồn đầu kỳ ghi vào **bảng dữ liệu mới**, theo từng dòng: mã sản phẩm nội bộ + kho + ngày chốt tồn ("Tồn đến ngày") + số lượng tồn + giá trị tồn.
- **Không gắn trực tiếp** kỳ kế toán (không chọn kỳ thủ công). Liên hệ kỳ kế toán **gián tiếp qua "Tồn đến ngày"**: ngày rơi vào kỳ nào — nếu kỳ đó **đã đóng** thì chặn import / xóa dòng.
- Import **all-or-nothing** (BR-OB-004a): chỉ ghi khi toàn bộ dòng hợp lệ; có dòng lỗi → chặn cả file. Giới hạn 500 dòng/lần (BR-OB-004b).
- **Sửa dòng** qua `FEAT-OB-EDIT` (form 6 trường, guardrails tương tự import). **Xóa dòng** qua `FEAT-OB-DELETE-LINES` (guardrail kỳ đóng + tồn âm).
- Tồn đầu kỳ là **nguồn tồn** để xuất kho (không cần phiếu nhập vẫn xuất được) và là input cho báo cáo tồn/NXT.

---

## 4. Features

| FEAT ID | Title | Link | Priority |
|---|---|---|---|
| `FEAT-OB-LIST` | Danh sách tồn đầu kỳ | [FEAT-OB-LIST](../features/FEAT-OB-LIST.md) | P1 |
| `FEAT-OB-IMPORT` | Import tồn đầu kỳ | [FEAT-OB-IMPORT](../features/FEAT-OB-IMPORT.md) | P1 |
| `FEAT-OB-EDIT` | Sửa dòng tồn đầu kỳ | [FEAT-OB-EDIT](../features/FEAT-OB-EDIT.md) | P1 |
| `FEAT-OB-DELETE-LINES` | Xóa dòng tồn đầu kỳ đã chọn | [FEAT-OB-DELETE-LINES](../features/FEAT-OB-DELETE-LINES.md) | P1 |

---

## 5. Dependencies

### 5.1 Epic Dependencies

| Epic | Quan hệ | Mô tả |
|---|---|---|
| `EP-INVENTORY-CATALOG` | Upstream | Tồn đầu kỳ tham chiếu mã sản phẩm nội bộ + ĐVT chính (validate ĐVT file khớp ĐVT chính). |
| `EP-INVENTORY-ACCOUNTING-PERIOD` | Upstream | "Tồn đến ngày" rơi vào kỳ kế toán đã đóng → chặn import / xóa. |
| `EP-INVENTORY-DELIVERY-V2` | Downstream | Tồn đầu kỳ là nguồn tồn để xuất kho. |
| `EP-INVENTORY-STOCK-V2` | Downstream | Báo cáo tồn / NXT lấy tồn đầu kỳ làm điểm khởi đầu. |

### 5.2 Architecture Dependencies

| Dependency | Mô tả |
|---|---|
| `gf-inventory` | Boundary chính: lưu tồn đầu kỳ vào bảng mới, validate import, kiểm tra guardrail xóa. |
| `agg-garage-graph` | BFF layer: chuyển tiếp GraphQL operations từ frontend sang gf-inventory. |
| Danh mục kho | Nguồn kho (warehouse) gắn theo garage — kho tự sinh khi tạo garage. |
| **Feature Flag** | **`Inventory:InventoryV2`** — toàn bộ API Tồn đầu kỳ được gate (`@FeatureOn` class-level). Tenant chưa enable → API 403; Web/Mobile ẩn menu/route. |

---

## §6 Service Impact Matrix

> Wave W04 — 4 FEAT OB × 5 boundary. `gf-inventory` (OB + sổ tồn ledger) là lead boundary; `gf-accounting` chỉ tham gia như **REST advisory provider** (endpoint `V4-AP-LC`) — toàn bộ Kỳ kế toán CRUD (5 FEAT AP) thuộc epic sibling `EP-INVENTORY-ACCOUNTING-PERIOD` (execution spec riêng, KHÔNG nằm trong phạm vi file này). `boundaries_affected` frontmatter chỉ liệt kê 2 boundary business chính (`gf-inventory` + `gf-accounting`) theo Context Bundle; bảng dưới liệt kê đầy đủ 5 boundary chạm tới OB (gồm BFF + UI) để phục vụ DEV.

| Boundary | Role | FEATs touched (W04 OB) | Schema | API | UI | Event |
|---|---|---|---|---|---|---|
| `gf-inventory` | **Lead boundary** | Tất cả 4 FEAT OB | **MỚI** 2 bảng qua Flyway `V{N+1}__inventory_v2_ob_ledger.sql` (additive — ADR-009 scalar FK, tenant_id enforced): `opening_balance_line` (id, tenant_id, garage_id, warehouse_code, product_id, product_code, unit_code, quantity, unit_price, value, snapshot_date "Tồn đến ngày", import_batch_id, created_by/at), `inventory_stock_ledger` (id, tenant_id, garage_id, warehouse_code, product_code, snapshot_date, quantity, value, updated_at, origin_context ENUM `OB_IMPORT/OB_EDIT/OB_DELETE/RECEIPT/DELIVERY/PRICE_RECALC` — chỉ 3 giá trị đầu active W04, còn lại stub theo ADR-020 §C3) | **MỚI** 6 REST endpoint canonical `W04-1, W04-3..W04-7` dưới `/protected/inventory/v1/opening-balances/*` (skip W04-2 — template `.xlsx` do FE bundled asset, không có BE endpoint per ADR-022 v4) + `StockLedgerRecomputeService` nội bộ (M1 recompute per-key + M2 recompute bulk theo ADR-020 C1-C8) + `AccountingPeriodClient.lockCheck(date)` gọi cross-boundary sang `gf-accounting` V4-AP-LC (ADR-021) | — | Không có event mới; recompute là intra-service sync call, KHÔNG cần outbox W04 (ADR-020 §Decision) |
| `gf-accounting` | **Cross-boundary REST advisory provider** (KHÔNG thuộc scope OB epic cho phần CRUD — xem epic sibling `EP-INVENTORY-ACCOUNTING-PERIOD` cho 5 FEAT AP) | Không FEAT OB nào touch entity `gf-accounting` trực tiếp; cả 5 write-path OB (W04-3/4/5/6/7) đều **consume** endpoint `V4-AP-LC` | — (không có schema mới do OB epic) | Consume `GET /protected/accounting/v1/accounting-periods/lock-check?date={ISO}` (V4-AP-LC — do sibling epic AP xây, OB epic chỉ là REST client) | — | — |
| `agg-garage-graph` | BFF orchestrator (passthrough) | Tất cả 4 FEAT OB | GraphQL SDL types: `OpeningBalanceLine`, `OpeningBalanceVerifyResult` (`totalRows/errorRows/canCommit/warningLockCheckUnavailable`), `OpeningBalanceImportResult`, `DeleteOpeningBalanceLinesResult` (`errorCode?/offendingIds?`), input types tương ứng | **MỚI** 6 GraphQL ops (§3g Opening Balance, v7.48): `W04-Q1 searchOpeningBalances`, `W04-Q3 verifyImportOpeningBalances`, `W04-M1 importOpeningBalances`, `W04-M2 updateOpeningBalanceLine`, `W04-M3 deleteOpeningBalanceLine`, `W04-M4 deleteOpeningBalanceLines` — passthrough thuần (KHÔNG persistence/business logic), `@FeatureOn("Inventory:InventoryV2")` gate resolver-level fail-fast 403, error-code map `ERR-INV-009/010/017/018/019/020/024/032..036/048` + `ERR-CMN-007` 503 | — | — |
| `garage-web` | UI consumer (full CRUD) | Tất cả 4 FEAT OB | — | — | **MỚI** 4 routes tại `src/features/inventory/`: `/inventory/opening-balances` (`OpeningBalanceListPage`), `/inventory/opening-balances/import` (`OpeningBalanceImportPage` — single-page: upload + preview inline 3 card Tổng/Hợp lệ/Lỗi + tab ĐVT reference + nút "Tải file lỗi" + cap 500 dòng + empty-file banner INFO), `/inventory/opening-balances/{id}/edit` (`OpeningBalanceEditLinePage`), `/inventory/opening-balances/delete-lines` (`OpeningBalanceDeleteLinesDialog`). Reuse-first: `share/file/file-upload.tsx`, `share/tables/preview-import-table.tsx`, `hooks/use-pagination.ts` — KHÔNG build-new component. TanStack Router `beforeLoad` gate `Inventory:InventoryV2`. | — |
| `garage-mobile` | UI consumer (**PARTIAL — read-only, chỉ FEAT-OB-LIST**) | `FEAT-OB-LIST` only. **Excluded**: `FEAT-OB-IMPORT`, `FEAT-OB-EDIT`, `FEAT-OB-DELETE-LINES` = **web-only** (không có link Figma mobile trong `figma-links.yaml` W04 mobile block — rule "FEAT không gán link Figma mobile = mobile out-of-scope") | — | — | **MỚI** 1 screen `lib/ui/inventory/OpeningBalanceListPage.dart` (Figma node `21632:28894`, file `5YU4H3iY726P8KNxI9oCYF`) + `OpeningBalanceListCubit` — read-only list, filter warehouse/product/date range, `SmartRefresher` pull-to-refresh, skeleton `LoadingRowShimmerWidget`. Tap dòng → điều hướng CHỈ XEM (không edit/xóa trên mobile). Firebase RemoteConfig `Inventory:InventoryV2` gate hub tile. | — |

**Dependency arrows:**
- `garage-web` / `garage-mobile` → `agg-garage-graph` (6 GraphQL ops OB `W04-Q1/Q3` + `W04-M1..M4`; mobile chỉ wire `W04-Q1`).
- `agg-garage-graph` → `gf-inventory` (6 REST endpoint `W04-1, W04-3..W04-7` passthrough).
- `gf-inventory` → `gf-accounting` (REST advisory `GET .../accounting-periods/lock-check?date=...` — `AccountingPeriodClient` với Resilience4j circuit breaker + Spring Retry 3 lần 100/200/400ms, cache LRU 30s scope `(tenantId, date)` — ADR-021).
- `gf-inventory` (nội bộ) — `StockLedgerRecomputeService` được gọi từ mọi write-path OB (import/edit/delete) ngay trong cùng transaction — ADR-020.

---

## §7 Cross-boundary Contracts

> Nguồn: `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` v13 §1 Cross-boundary Rules + ADR-020/ADR-021/ADR-022.

| CB ID | Mô tả | REST/GraphQL/Kafka touchpoint | Integration file |
|---|---|---|---|
| CB-OB-001 | Tồn đầu kỳ do `gf-inventory` sở hữu (bảng mới `opening_balance_line`), tham chiếu mã sản phẩm nội bộ + ĐVT chính + kho **cùng boundary**; là nguồn tồn cho xuất kho và báo cáo tồn/NXT (downstream W05/W06 — cùng boundary `gf-inventory`, không cross-boundary). | Nội bộ `gf-inventory` | — (nội bộ, không có integration file cross-boundary) |
| CB-OB-002 | "Tồn đến ngày" của mỗi dòng OB quyết định kỳ kế toán liên quan (gián tiếp): nếu ngày rơi vào kỳ **đã đóng** (owner `gf-accounting` per ADR-019), hệ thống chặn import/edit/xóa dòng đó. **Cross-boundary thật sự** — implement qua REST advisory pattern ADR-021 (tái dùng ADR-019). | `gf-inventory` → `gf-accounting` `GET /protected/accounting/v1/accounting-periods/lock-check?date={ISO}` (V4-AP-LC). Advisory ở `verify-import` (fail-OPEN + `warningLockCheckUnavailable`) + authoritative ở `import`/`edit`/`delete`/`delete-lines` (fail-CLOSED, `ERR-INV-024`). | `Architecture/integrations/INTEG-EXT-gf-inventory.md` §13b (consumer side) + `Architecture/integrations/INTEG-EXT-gf-accounting.md` §6 (server side) |
| CB-OB-003 (BFF-side) | `agg-garage-graph` passthrough thuần 6 GraphQL ops OB sang `gf-inventory` — không persistence, không business logic ở BFF layer. Auth header propagation `Authorization` + `X-Tenant-Id` + `X-Branch-Id`. | `agg-garage-graph` → `gf-inventory` REST (6 endpoint) | `Architecture/api/agg-garage-graph-graphql.md` v7.48 §3g |

---

## §8 Implementation Sequence DAG

> Topological order: cross-boundary dependency (`gf-accounting` V4-AP-LC) song song `gf-inventory` schema → `gf-inventory` API (chờ V4-AP-LC cho commit-path) → BFF wire → UI parallel cuối. Trong phạm vi file này chỉ show phần OB — phần AP CRUD (`gf-accounting`) thuộc execution spec sibling `EP-INVENTORY-ACCOUNTING-PERIOD`.

```
DAY 1-2 — gf-accounting (EXTERNAL DEPENDENCY, sibling epic — chạy song song):
  gf-accounting triển khai V4-AP-LC REST advisory endpoint
    (GET /protected/accounting/v1/accounting-periods/lock-check?date={ISO})
  Entry : W04 kick-off (song song với AP CRUD V4-AP-1..5)
  Exit  : V4-AP-LC available trên dev — gf-inventory OB write-path wire được
          AccountingPeriodClient (BLOCKER cho gf-inventory Day 2 commit-path)

══════════════════════════════════════════════════════
DAY 1-3 — gf-inventory (BE lead, OB + Sổ tồn ledger):

  [Day 1]
  gf-inventory (schema) : Flyway V{N+1}__inventory_v2_ob_ledger.sql
                          - CREATE TABLE opening_balance_line (id, tenant_id, garage_id,
                            warehouse_code, product_id, product_code, unit_code, quantity,
                            unit_price, value, snapshot_date, import_batch_id, created_by/at)
                          - CREATE TABLE inventory_stock_ledger (id, tenant_id, garage_id,
                            warehouse_code, product_code, snapshot_date, quantity, value,
                            updated_at, origin_context ENUM)
                          - Enum OriginContext {OB_IMPORT, OB_EDIT, OB_DELETE, RECEIPT,
                            DELIVERY, PRICE_RECALC} (chỉ 3 giá trị đầu active W04)
  Entry : W03 catalog stable (mã nội bộ + ĐVT); danh mục kho tự sinh theo garage
  Exit  : Migration deployed dev — schema stable

  [Day 1-2]
  gf-inventory (domain) : StockLedgerRecomputeService baseline (ADR-020 C1-C8)
                          - M1 recompute per-key (BR-STKV2-005a bước 1..4: xóa từ fromDate →
                            replay nguồn OB+phiếu → running closing → invariant ≥ 0)
                          - M2 recompute bulk (multi-key, 1 transaction, ordered lock ASCII
                            (productCode, warehouseCode) — BẮT BUỘC cho OB import 500 dòng +
                            delete-lines N dòng + edit swap OLD/NEW combo)
                          - Redisson distributed lock key
                            stock-ledger-recompute:{tenantId}:{productCode}:{warehouseCode}
                          - Exception category: NegativeStock (ERR-INV-036) / LockTimeout
                            (ERR-CMN-007) / SourceStale (internal retry)
                          - AccountingPeriodClient.lockCheck(date) — Resilience4j circuit
                            breaker + Spring Retry (100/200/400ms) + cache LRU 30s (ADR-021)

  [Day 2]
  gf-inventory (API)    : W04-1 search · W04-3 verify-import (fail-OPEN advisory +
                          warningLockCheckUnavailable + empty-file canCommit=false, KHÔNG
                          throw error — ADR-022 v3) · W04-4 import (fail-CLOSED authoritative,
                          all-or-nothing single transaction, X-Idempotency-Key dedup 24h,
                          cascade StockLedgerRecomputeService.M2 bước 5, 500-row cap
                          ERR-INV-048 — ADR-022)
  Entry : Schema + engine baseline; V4-AP-LC available từ gf-accounting
  Exit  : W04-1/3/4 integration tested trên dev

  [Day 3]
  gf-inventory (API)    : W04-5 edit-line (lock-check cả ngày cũ + mới, cascade M1/M2,
                          HTTP 404 global handler cho id không tồn tại) · W04-6 delete-single
                          (lock-check + cascade reverse, HTTP 404 global handler) ·
                          W04-7 delete-lines (fail-fast theo thứ tự ids[], response
                          {errorCode, offendingIds:[<id đầu>]}, thứ tự kiểm tra BR-OB-DEL-005:
                          ERR-INV-024 kỳ đóng TRƯỚC → ERR-INV-036 tồn âm SAU, mỗi id 1 mã lỗi)
  Entry : W04-4 pattern đã ổn định (tái dùng lock-check + cascade)
  Exit  : 6 endpoint canonical (skip W04-2) integration tested dev; unit test ≥ 80%
          (service layer + cascade + import parser + fail-fast delete-lines);
          feature-flag @FeatureOn("Inventory:InventoryV2") class-level trên OpeningBalanceController

══════════════════════════════════════════════════════
DAY 2-3 — agg-garage-graph (BFF):

  [Day 2-3, depends on gf-inventory API available]
  agg-garage-graph (SDL)    : OpeningBalanceLine, OpeningBalanceVerifyResult,
                              OpeningBalanceImportResult, DeleteOpeningBalanceLinesResult,
                              input types; schema deploy
  agg-garage-graph (ops)    : 6 GraphQL ops passthrough — W04-Q1 searchOpeningBalances,
                              W04-Q3 verifyImportOpeningBalances, W04-M1 importOpeningBalances,
                              W04-M2 updateOpeningBalanceLine, W04-M3 deleteOpeningBalanceLine,
                              W04-M4 deleteOpeningBalanceLines
                              - @FeatureOn("Inventory:InventoryV2") gate resolver-level fail-fast 403
                              - Error-code map module reuse ERR-INV-009/010/017/018/019/020/
                                024/032..036/048 + ERR-CMN-007 503
                              - Auth header propagation: Authorization, X-Tenant-Id,
                                X-Branch-Id → gf-inventory
  Entry : gf-inventory 6 OB endpoint available
  Exit  : Vitest ≥ 80% pass (6 ops happy path + error map + feature-flag OFF 403);
          SDL deployed staging

══════════════════════════════════════════════════════
DAY 3-5 — garage-web + garage-mobile (PARALLEL):

  [Day 3-5, depends on agg-garage-graph ops available]
  garage-web             : 4 routes src/features/inventory/
                           - OpeningBalanceListPage: search + filter (warehouse/product/
                             người import/ngày import) + dòng Tổng + sort mặc định
                             "Ngày import mới nhất lên đầu" (BR-OB-014)
                           - OpeningBalanceImportPage: single-page (header ← Huỷ bỏ/Xác nhận)
                             upload .xlsx (browser-side SheetJS parse, KHÔNG server-side) +
                             preview inline 3 card (Tổng/Hợp lệ/Lỗi) + tab ĐVT reference +
                             nút "Tải file lỗi" + cap 500 dòng client hint + empty-file banner
                             INFO + nút "Xác nhận" disabled khi errorRows>0 → toast SUCCESS +
                             về danh sách (all-or-nothing BR-OB-004a)
                           - OpeningBalanceEditLinePage: form 6 trường (Sản phẩm/Kho đổi được,
                             ĐVT readonly, SL/Ngày/Giá trị)
                           - OpeningBalanceDeleteLinesDialog: checkbox multi-select + popup
                             fail-fast verbatim khi vi phạm guardrail
                           - Reuse-first: share/file/file-upload.tsx, share/tables/
                             preview-import-table.tsx, hooks/use-pagination.ts — KHÔNG
                             build-new component
                           - TanStack Router beforeLoad gate Inventory:InventoryV2 + sidebar ẩn khi OFF
  Entry : agg-garage-graph SDL + 6 OB ops deployed staging; Figma web W04 OB prefetched
  Exit  : Vitest ≥ 60% coverage (form validation + import all-or-nothing state machine +
          error map); testid ≥ 95%; E2E import + edit + delete-lines fail-fast flow pass

  garage-mobile          : 1 screen lib/ui/inventory/OpeningBalanceListPage.dart
                           - OpeningBalanceListCubit — read-only list, SmartRefresher
                             pull-to-refresh, skeleton LoadingRowShimmerWidget, filter
                             bottom sheet warehouse/product/date range
                           - Tap dòng → điều hướng CHỈ XEM (KHÔNG edit/xóa/import trên mobile
                             — 3 FEAT còn lại web-only per Figma registry rule)
                           - Canonical widget reuse: ListWidget/SmartRefresher/StatusBadge/
                             CustomAppBar/AppButton — KHÔNG raw Material
                           - Firebase RemoteConfig Inventory:InventoryV2 gate + fallback default ON
  Entry : agg-garage-graph SDL + W04-Q1 deployed; Figma mobile node 21632:28894 verified
           (file 5YU4H3iY726P8KNxI9oCYF)
  Exit  : bloc_test + alchemist golden ≥ 60%; E2E mobile OB list read-only flow pass
```

---

## §9 Architecture References

- **`Architecture/api/gf-inventory-api.md`** v42 §0 Wave Index W04 + §3b Opening Balance — 7 endpoint canonical `W04-1..W04-7` (skip W04-2); request/response schema đầy đủ; `cascadedKeys[]` shape.
- **`Architecture/api/agg-garage-graph-graphql.md`** v7.48 §0 Wave Index W04 + §3g Opening Balance — 6 GraphQL ops OB canonical.
- **`Architecture/api/gf-accounting-api.md`** §Accounting Period — endpoint `V4-AP-LC` REST advisory (server side, sibling epic).
- **ADR-020** (`Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v4) — mô hình sổ tồn point-in-time daily snapshot + engine `StockLedgerRecomputeService` dùng chung (M1/M2/M3 stub, 8 sub-section contract C1-C8).
- **ADR-021** (`Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2) — REST advisory lock-check `gf-inventory` → `gf-accounting`, tái dùng pattern ADR-019, fail-CLOSED commit-path + fail-OPEN advisory verify-path.
- **ADR-022** (`Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md` v4) — Import OB wizard 2 bước, all-or-nothing single-transaction, cap 500 dòng 3 tầng, cascade tại commit, empty-file semantic PASS `canCommit=false`, template `.xlsx` FE bundled asset (không có BE endpoint).
- **ADR-019** (Accounting Period on gf-accounting boundary) — nền pattern REST advisory mà ADR-021 tái dùng.
- **ADR-009** (`Architecture/decisions/ADR-009-*.md`) — JPA no relationship mapping. `opening_balance_line` + `inventory_stock_ledger` dùng scalar FK only.
- **KG `gf-inventory`** (`Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml`) — baseline KG, W04 thêm entity `opening_balance_line` + `inventory_stock_ledger` + 6 API OB vào KG sau wave complete.
- **KG `gf-accounting`** (`Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml`) — advisory consumer context, entity `accounting_period` (owned bởi sibling epic).
- **`Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md`** v13 — 2 CB rule (CB-OB-001/002) + 16 rule OB (BR-OB-001..016) + 6 rule sửa (BR-OB-EDIT-001..006) + 5 rule xóa (BR-OB-DEL-001..005) + 2 audit/permission (BR-OB-CMN-001/002).
- **`Product/error-code/ERROR-CODE-REGISTRY.md`** — mã lỗi W04 OB: `ERR-INV-009/010/017/018/019/020/024/032/033/034/035/036/048` + `ERR-CMN-007`.
- **`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`** — UX spec cho toàn bộ 4 feature OB (web + mobile).
- **`Execution/work-packages/PKG-W04-inventory-period-opening-balance.md`** v9 — phase plan, DEV task breakdown, effort per boundary, deliverable checklist (bao gồm cả AP — file này chỉ scope phần OB).

---

## §10 Open Items (NEED CONFIRMATION)

| # | Item | Owner | Blocker cho |
|---|---|---|---|
| NC-W04-EP-OB-001 | **`source_sha` chưa compute được** — author session không có Bash tool khả dụng để chạy `sha256sum`. Orchestrator/CI cần backfill giá trị SHA256 thật của `Product/epics/EP-INVENTORY-OPENING-BALANCE.md` v5 vào frontmatter trước khi bump DRAFT → ACTIVE (audit trail integrity). | Delivery Authority (tooling) | DRAFT → ACTIVE activation gate |
| NC-W04-EP-OB-002 | **CR-20260707-01 + CR-20260707-02 vẫn `PENDING_APPROVAL`** tại thời điểm generate spec này (PKG-W04 §0, `last_reviewed: 2026-07-08`). CR-20260707-02 (`Inventory:InventoryV2` backfill) gate **toàn bộ 6 endpoint OB** qua `@FeatureOn` — nếu REVIEW_GROUP chưa approve tới Day 1, DEV OB vẫn chạy song song (annotation add sau khi approve) nhưng KHÔNG demo được flag OFF/ON tới khi approved. | REVIEW_GROUP | Demo step 9 (flag flip); §5.3 Quality Gates (10 FEAT + 2 CR AC coverage) |
| NC-W04-EP-OB-003 | **Nguồn EP (`Product/epics/EP-INVENTORY-OPENING-BALANCE.md` v5) §5.2 Architecture Dependencies chưa liệt kê `gf-accounting`** — architecture thực tế W04 (ADR-021) đã xác lập `gf-inventory` là REST consumer cross-boundary của `gf-accounting` (V4-AP-LC), nhưng §5.2 nguồn BA chỉ liệt kê `gf-inventory` + `agg-garage-graph` + Danh mục kho + Feature Flag. Đây là drift giữa Product doc gốc và Architecture đã ratify sau đó (ADR-021 ngày 2026-07-06, sau source EP v5 ngày 2026-07-08 — cần xác nhận version nào cập nhật sau). Đề xuất BA bump EP v6 thêm dependency `gf-accounting` (indirect, qua lock-check) vào §5.2 để đồng bộ. | Business Authority | Không block DEV W04 (đã có ADR ratified) — chỉ là doc drift cần cascade CR |
| NC-W04-EP-OB-004 | **DEBT-W03-UI-CROSSWAVE-01** (carryover từ W03, PKG-W04 §9) — 9 TC UI Wave 03 BLOCKED phụ thuộc module Nhập/Xuất kho V2 (W05/W06). Không trực tiếp block OB, nhưng cần tracking để không bị quên khi W05 kick-off. | Delivery Authority | TEST_EXECUTION W05 re-run scope |

---

## §11 References

| Artifact | Path | Notes |
|---|---|---|
| Source epic | `Product/epics/EP-INVENTORY-OPENING-BALANCE.md` v5 | BA source-of-truth |
| Business rules | `Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` v13 | 2 CB + 16 BR-OB + 6 BR-OB-EDIT + 5 BR-OB-DEL + 2 CMN |
| Work package | `Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` v9 | DEV task breakdown, effort, deliverable checklist (AP + OB + hub) |
| KG gf-inventory | `Execution/knowledge-graphs/gf-inventory.knowledge-graph.yaml` | Entity baseline |
| KG gf-accounting | `Execution/knowledge-graphs/gf-accounting.knowledge-graph.yaml` | Advisory consumer context |
| gf-inventory API | `Architecture/api/gf-inventory-api.md` v42 | 7 endpoint W04-1..W04-7 (skip W04-2) canonical §3b |
| gf-accounting API | `Architecture/api/gf-accounting-api.md` | V4-AP-LC canonical |
| GraphQL ops | `Architecture/api/agg-garage-graph-graphql.md` v7.48 | 6 ops OB canonical §3g |
| ADR-020 | `Architecture/decisions/ADR-020-stock-ledger-daily-snapshot.md` v4 | Sổ tồn point-in-time + engine dùng chung |
| ADR-021 | `Architecture/decisions/ADR-021-ob-period-lock-cross-boundary.md` v2 | REST advisory lock-check |
| ADR-022 | `Architecture/decisions/ADR-022-ob-import-all-or-nothing-bulk.md` v4 | Import all-or-nothing + cap 500 |
| ADR-019 | `Architecture/decisions/ADR-019-accounting-period-on-gf-accounting.md` | Nền pattern REST advisory |
| ADR-009 | `Architecture/decisions/ADR-009-*.md` | JPA no relationship mapping |
| Error registry | `Product/error-code/ERROR-CODE-REGISTRY.md` | ERR-INV-009/010/017/018/019/020/024/032..036/048 + ERR-CMN-007 |
| UX-FLOW | `Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md` | Web + mobile UX spec |
| FEAT-OB-LIST | `Product/features/FEAT-OB-LIST.md` | |
| FEAT-OB-IMPORT | `Product/features/FEAT-OB-IMPORT.md` | |
| FEAT-OB-EDIT | `Product/features/FEAT-OB-EDIT.md` | |
| FEAT-OB-DELETE-LINES | `Product/features/FEAT-OB-DELETE-LINES.md` | |

---

## §12 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT execution spec W04 từ `EP-INVENTORY-OPENING-BALANCE` v5. §1-§5 verbatim copy từ source. §6 Service Impact Matrix (4 FEAT OB × 5 boundary — `gf-inventory` lead + `gf-accounting` REST advisory provider-only (V4-AP-LC, AP CRUD thuộc epic sibling) + `agg-garage-graph` BFF passthrough + `garage-web` full CRUD + `garage-mobile` partial read-only FEAT-OB-LIST). §7 Cross-boundary contracts (CB-OB-001/002 từ BR v13 §1 + CB-OB-003 BFF-side; nhấn REST advisory ADR-021). §8 Implementation sequence DAG (gf-accounting V4-AP-LC external dependency song song → gf-inventory Day 1-3 schema+engine+API → BFF Day 2-3 → Web+Mobile parallel Day 3-5). §9 Architecture references (ADR-020/021/022/019 + KG + BR + error registry). §10 Open items (4 NC markers: source_sha không compute được do thiếu Bash tool, CR-20260707-01/02 pending approval, doc drift EP §5.2 thiếu gf-accounting dependency, DEBT-W03-UI-CROSSWAVE-01 carryover tracking). |
