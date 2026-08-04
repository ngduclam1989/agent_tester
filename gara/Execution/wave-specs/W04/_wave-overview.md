---
type: execution-spec
artifact_kind: wave-overview
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority + Architecture Authority
wave: "W04"
last_reviewed: "2026-07-08"
source: "gen-execution-spec"
generated_at: "2026-07-08T12:00:00+00:00"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
pkg_version: 12
features_in_wave:
  - FEAT-AP-LIST
  - FEAT-AP-CREATE
  - FEAT-AP-DETAIL
  - FEAT-AP-EDIT
  - FEAT-AP-DELETE
  - FEAT-OB-LIST
  - FEAT-OB-IMPORT
  - FEAT-OB-EDIT
  - FEAT-OB-DELETE-LINES
  - FEAT-INV-MOBILE-MENU
epics_in_wave:
  - EP-INVENTORY-ACCOUNTING-PERIOD
  - EP-INVENTORY-OPENING-BALANCE
  - EP-INVENTORY-CATALOG
brs_in_wave:
  - BR-GF-INVENTORY-ACCOUNTING-PERIOD
  - BR-GF-INVENTORY-OPENING-BALANCE
  - BR-GF-INVENTORY-CATALOG
boundaries_in_wave:
  - gf-accounting
  - gf-inventory
  - agg-garage-graph
  - garage-web
  - garage-mobile
artifact_count:
  epics: 3
  features_tier_files: 28
  features_epic_delta_only: 1
  business_rules: 3
  total: 34
authoring_inputs:
  kg_baseline_sha_gf_accounting: "f2daaf21274cdd12cf7feac508207e8c2d0c0baa9237699861a0b796c895162d"
  kg_baseline_sha_gf_inventory: "9dc5656ec619a47ca07313d689ae677310a4515b36a35d1ec3cacf6a21f62af8"
  kg_baseline_sha_garage_mobile: "0d92e4597229ff43fb7e98e486873200684b06884a4e285a9c88a9bf43ec616b"
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  pkg_sha: "NEED CONFIRMATION — sha256 chưa compute được (không có Bash tool trong phiên author); orchestrator/CI backfill `sha256sum Execution/work-packages/PKG-W04-inventory-period-opening-balance.md` (v9) trước khi bump ACTIVE"
  decisions_log_size: "~4.5KB (16 entries)"
pre_conditions_satisfied:
  - "EP-INVENTORY-ACCOUNTING-PERIOD.md DRAFT ✓ (narrow scope: 5 FEAT-AP nhóm, PRC nhóm ngoài scope)"
  - "EP-INVENTORY-OPENING-BALANCE.md DRAFT ✓ (4 FEAT-OB)"
  - "EP-INVENTORY-CATALOG.md DRAFT ✓ (narrow supplement — chỉ delta mobile hub state matrix, KHÔNG phải bản EP đầy đủ)"
  - "BR-GF-INVENTORY-ACCOUNTING-PERIOD.md DRAFT ✓ (filtered BR-AP-* + CB-AP-001 + BR-AP-CMN-*, loại BR-PRC-*)"
  - "BR-GF-INVENTORY-OPENING-BALANCE.md DRAFT ✓ (toàn bộ BR-OB-*/BR-OB-EDIT-*/BR-OB-DEL-*/CB-OB-*)"
  - "BR-GF-INVENTORY-CATALOG.md (W04 supplement) DRAFT ✓ (chỉ BR-INV-MENU-001..004, nguồn thực tế BR-GF-INVENTORY.md §2.6, KHÔNG phải BR-GF-INVENTORY-CATALOG.md gốc)"
  - "FEAT-AP-{LIST,CREATE,DETAIL,EDIT,DELETE} × {be,bff,fe-web} DRAFT ✓ (5×3=15)"
  - "FEAT-OB-LIST × {be,bff,fe-web,mobile} DRAFT ✓ (4)"
  - "FEAT-OB-{IMPORT,EDIT,DELETE-LINES} × {be,bff,fe-web} DRAFT ✓ (3×3=9)"
  - "FEAT-INV-MOBILE-MENU: KHÔNG có tier file riêng (allowlist gap resolve-fanout.py) — covered qua EP-CATALOG + BR-CATALOG W04 supplement"
  - "Total: 34 DRAFT tier files confirmed (28 FEAT-tier + 3 EP-tier + 3 BR-tier)"
---

# W04 Wave Overview — Inventory V2: Khởi tạo kho (Kỳ kế toán + Tồn đầu kỳ)

> Tài liệu tổng hợp wave-level từ 34 spec DRAFT (3 EP + 3 BR + 28 FEAT-tier). Không thay thế tier spec riêng — đây là điểm tra cứu cross-boundary cho Delivery Authority + Architecture Authority + REVIEW agents.
>
> Nguồn: `PKG-W04-inventory-period-opening-balance` v9 · `EP-INVENTORY-ACCOUNTING-PERIOD` v16 (source, nhóm AP) · `EP-INVENTORY-OPENING-BALANCE` v5 (source) · `EP-INVENTORY-CATALOG` v8 (source, chỉ delta mobile hub) · `BR-GF-INVENTORY-ACCOUNTING-PERIOD` v27 · `BR-GF-INVENTORY-OPENING-BALANCE` v13 · `BR-GF-INVENTORY.md` §2.6 v3 (nguồn thực của BR-GF-INVENTORY-CATALOG W04 supplement).
>
> ⚠️ **Correction so với Task input**: input ban đầu ước tính "36 tier file (9 FEAT × 4 tier)" + "42 tổng cộng". Audit thực tế cho thấy chỉ **28 FEAT-tier file** tồn tại (mobile scope narrow theo Figma registry rule — 8/9 FEAT chỉ có mobile cho `FEAT-OB-LIST`; 5 FEAT-AP + 3 FEAT-OB còn lại là web-only, KHÔNG có tier `mobile`). Tổng thực tế = **34** (28 FEAT-tier + 3 EP-tier + 3 BR-tier). Đây KHÔNG phải gap — khớp đúng PKG-W04 §2.2.5 + §2.3 Out of Scope (mobile narrow theo Figma registry).

---

## §0 Nguồn & Audit

### EP + BR (6 file)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| EP-INVENTORY-ACCOUNTING-PERIOD | epic | v16 | DRAFT | `Execution/wave-specs/W04/Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md` |
| EP-INVENTORY-OPENING-BALANCE | epic | v5 | DRAFT | `Execution/wave-specs/W04/Product/epics/EP-INVENTORY-OPENING-BALANCE.md` |
| EP-INVENTORY-CATALOG (narrow supplement — chỉ delta mobile hub) | epic | v8 | DRAFT | `Execution/wave-specs/W04/Product/epics/EP-INVENTORY-CATALOG.md` |
| BR-GF-INVENTORY-ACCOUNTING-PERIOD | business-rule | v27 | DRAFT | `Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` |
| BR-GF-INVENTORY-OPENING-BALANCE | business-rule | v13 | DRAFT | `Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-OPENING-BALANCE.md` |
| BR-GF-INVENTORY-CATALOG (W04 supplement — nguồn thực `BR-GF-INVENTORY.md` §2.6 v3, KHÔNG phải `BR-GF-INVENTORY-CATALOG.md` gốc) | business-rule | v3 | DRAFT | `Execution/wave-specs/W04/Product/business-rules/BR-GF-INVENTORY-CATALOG.md` |

### BE tier — `gf-accounting` (5) + `gf-inventory` (4) = 9 spec

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-AP-LIST | be | v8 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-LIST.md` |
| FEAT-AP-CREATE | be | v6 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-CREATE.md` |
| FEAT-AP-DETAIL | be | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DETAIL.md` |
| FEAT-AP-EDIT | be | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-EDIT.md` |
| FEAT-AP-DELETE | be | v4 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-AP-DELETE.md` |
| FEAT-OB-LIST | be | v9 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-LIST.md` |
| FEAT-OB-IMPORT | be | v20 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-IMPORT.md` |
| FEAT-OB-EDIT | be | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-EDIT.md` |
| FEAT-OB-DELETE-LINES | be | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-DELETE-LINES.md` |

### BFF tier — `agg-garage-graph` (9 spec)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-AP-LIST | bff | v8 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-LIST.md` |
| FEAT-AP-CREATE | bff | v6 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-CREATE.md` |
| FEAT-AP-DETAIL | bff | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DETAIL.md` |
| FEAT-AP-EDIT | bff | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-EDIT.md` |
| FEAT-AP-DELETE | bff | v4 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-AP-DELETE.md` |
| FEAT-OB-LIST | bff | v9 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-LIST.md` |
| FEAT-OB-IMPORT | bff | v20 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-IMPORT.md` |
| FEAT-OB-EDIT | bff | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-EDIT.md` |
| FEAT-OB-DELETE-LINES | bff | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-DELETE-LINES.md` |

### FE-web tier — `garage-web` (9 spec)

| artifact_id | tier | source_version | status | path |
|---|---|---|---|---|
| FEAT-AP-LIST | fe-web | v8 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-LIST.md` |
| FEAT-AP-CREATE | fe-web | v6 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-CREATE.md` |
| FEAT-AP-DETAIL | fe-web | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-DETAIL.md` |
| FEAT-AP-EDIT | fe-web | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-EDIT.md` |
| FEAT-AP-DELETE | fe-web | v4 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-AP-DELETE.md` |
| FEAT-OB-LIST | fe-web | v9 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-LIST.md` |
| FEAT-OB-IMPORT | fe-web | v20 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-IMPORT.md` |
| FEAT-OB-EDIT | fe-web | v5 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-EDIT.md` |
| FEAT-OB-DELETE-LINES | fe-web | v7 | DRAFT | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-DELETE-LINES.md` |

### Mobile tier — `garage-mobile` (1 spec — narrow scope per Figma registry rule)

| artifact_id | tier | source_version | status | path | scope |
|---|---|---|---|---|---|
| FEAT-OB-LIST | mobile | v9 | DRAFT | `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md` | read-only list |

> **Mobile scope intentional** (PKG-W04 §2.2.5 + §2.3): 5 FEAT-AP-\* + `FEAT-OB-IMPORT`/`FEAT-OB-EDIT`/`FEAT-OB-DELETE-LINES` = **web-only** — không có link Figma mobile trong `figma-links.yaml` W04 mobile block (rule: "FEAT không gán link Figma mobile = mobile out-of-scope"). 8 mobile tier spec KHÔNG tồn tại — KHÔNG phải gap. REVIEWER không flag đây là missing artifact.
>
> **`FEAT-INV-MOBILE-MENU`** — KHÔNG có 4 tier file riêng trong W04 (allowlist gap `resolve-fanout.py`: boundary `garage-mobile` không thuộc BE allowlist khiến fan-out script không sinh bundle cho FEAT này ở mode `feature-mobile`). Nội dung delta (tile "Tồn đầu kỳ" ẨN→HIỆN) được author trực tiếp ở **EP-INVENTORY-CATALOG (W04 supplement) §2** + **BR-GF-INVENTORY-CATALOG (W04 supplement) §1** thay vì 1 file `Product/features/mobile/FEAT-INV-MOBILE-MENU.md` riêng. Xem §7 Open Items.

---

## §1 Wave Scope Narrative

Wave W04 là **slice 2/4 của Inventory V2** (sau W03 danh mục vật tư) — deliver 2 epic song song trên 2 boundary khác nhau + 1 delta nhỏ mobile hub, tổng **10 feature khai báo trong PKG** (9 feature có tier-spec đầy đủ + 1 feature `FEAT-INV-MOBILE-MENU` chỉ có delta epic-level), **5 boundary**, timebox **5 ngày làm việc**.

**2 mảng nghiệp vụ chính:**
1. **Kỳ kế toán (AP, 5 FEAT)** — boundary `gf-accounting` (move theo ADR-019/EP v16 boundary move 2026-07-07, khớp pattern ERP truyền thống SAP FI-CO/Misa/Fast/Odoo: kế toán tính money/costing, kho chỉ tracks số lượng). Garage lập cây kỳ phân cấp Năm→Quý→Tháng, đóng/mở kỳ tự do (không ràng buộc thứ tự), khóa phiếu nhập/xuất + import OB khi kỳ đóng.
2. **Tồn đầu kỳ (OB, 4 FEAT)** — boundary `gf-inventory`. Import số lượng + giá trị tồn theo (mã sản phẩm nội bộ + kho + "Tồn đến ngày"), all-or-nothing (không partial), cap 500 dòng/lần, ghi vào **nền sổ tồn ledger point-in-time daily snapshot** mới (ADR-020 v4) — writer đầu tiên vào ledger, làm nguồn tồn cho xuất kho (W05) và báo cáo NXT (W06).

**Cross-boundary lock kỳ** (ADR-021): `gf-inventory` gọi REST advisory `gf-accounting` `V4-AP-LC`/`lock-check` trước mọi write-path OB — fail-CLOSED cho commit-path (import/edit/delete-lines), fail-OPEN + banner `warningLockCheckUnavailable` cho preview-path (verify-import).

**2 piggyback CR** chạy đầu wave: `CR-20260707-01` (Import Product FE-only gate all-valid, đã **APPROVED** self-execute 2026-07-08) + `CR-20260707-02` (backfill 1 flag duy nhất `Inventory:InventoryV2` cho toàn Inventory V2, vẫn **PENDING_APPROVAL** — REVIEW_GROUP cross-boundary chưa approve tại thời điểm audit).

**Điểm cần chú ý nhất của wave này** (historical, ~~2 open item **BLOCKING**~~ đã RESOLVED 2026-07-08): ~~`NC-W04-EP-AP-001` endpoint/error-code contract drift~~ resolved v2 Option A (canonical align PKG → gf-accounting-api v15 §4); ~~`NC-W04-EP-AP-002` migration strategy drift~~ resolved v3 per user quannn override → **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** additive per ADR-019 v5 Decision B (canonical align, updated 2026-07-08). `agent-dev-gf-accounting` unblocked Day 1 (xem §7 audit trail).

Kết quả demo-able: kế toán/chủ garage lập cây kỳ + đóng/mở kỳ + xóa kỳ (web-only); import tồn đầu kỳ (all-or-nothing, chặn khi kỳ đóng) + sửa/xóa dòng OB (web); tra cứu OB read-only trên mobile qua hub 3-tile (Sản phẩm/Nhóm vật tư/Tồn đầu kỳ — tile thứ 3 mới).

---

## §2 Vertical Slice End-to-End

```
gf-accounting (AP master, boundary mới)
  V4-AP-1..5: search/tree, create (+auto-gen children), detail, update (đóng/mở),
              delete (3-guard: children/documents/closed)
  V4-AP-LC:   REST advisory lock-check(date) — cache 30-60s (drift PKG=60s vs ADR=30s)
        │
        │  REST advisory (ADR-021, fail-CLOSED commit-path / fail-OPEN preview-path)
        ▼
gf-inventory (OB + sổ tồn ledger)
  W04-1:      search OB
  W04-3:      verify-import (preview, fail-OPEN + warningLockCheckUnavailable)
  W04-4:      import (commit, all-or-nothing 1-tx, cap 500 dòng — ADR-022 v3)
  W04-5..7:   edit-line / delete-single / delete-lines (fail-fast theo ids[])
        │
        │  StockLedgerRecomputeEngine.applyDelta() (ADR-020 v4, C1-C8)
        ▼
inventory_stock_ledger (point-in-time daily snapshot — writer đầu tiên = OB import)
        │
        │  passthrough (11 GraphQL ops: 5 AP §3e + 6 OB §3g)
        ▼
agg-garage-graph (BFF)
  @FeatureOn("Inventory:InventoryV2") fail-fast 403 · auth header propagation
        │
        ├──► garage-web: 8 route full CRUD (4 AP + 4 OB) — desktop-only, no-i18n
        │
        └──► garage-mobile: 2 màn (InventoryHubPage 3-tile + OpeningBalanceListPage
                             read-only) — 8 FEAT còn lại web-only
```

---

## §3 Feature × Tier Matrix

| FEAT ID | Epic | be | bff | fe-web | mobile |
|---|---|---|---|---|---|
| `FEAT-AP-LIST` | EP-INVENTORY-ACCOUNTING-PERIOD | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-AP-CREATE` | EP-INVENTORY-ACCOUNTING-PERIOD | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-AP-DETAIL` | EP-INVENTORY-ACCOUNTING-PERIOD | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-AP-EDIT` | EP-INVENTORY-ACCOUNTING-PERIOD | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-AP-DELETE` | EP-INVENTORY-ACCOUNTING-PERIOD | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-OB-LIST` | EP-INVENTORY-OPENING-BALANCE | DRAFT | DRAFT | DRAFT | DRAFT (read-only) |
| `FEAT-OB-IMPORT` | EP-INVENTORY-OPENING-BALANCE | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-OB-EDIT` | EP-INVENTORY-OPENING-BALANCE | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-OB-DELETE-LINES` | EP-INVENTORY-OPENING-BALANCE | DRAFT | DRAFT | DRAFT | OUT-OF-SCOPE (web-only) |
| `FEAT-INV-MOBILE-MENU` | EP-INVENTORY-CATALOG (delta) | N/A | N/A | N/A | **EPIC-DELTA-ONLY** (no FEAT-tier file — allowlist gap, xem §7) |

**Đếm cột**: be = 9 DRAFT · bff = 9 DRAFT · fe-web = 9 DRAFT · mobile = 1 DRAFT + 1 epic-delta-only + 8 out-of-scope.

---

## §4 Cross-boundary Contracts

| # | Contract | Touchpoint | Nguồn | Trạng thái |
|---|---|---|---|---|
| 1 | **V4-AP-LC lock-check** (REST advisory, ADR-021) | `gf-inventory` → `gf-accounting` `GET .../accounting-periods/lock-check?date={ISO}` | ADR-019/021 canonical: `{locked, periodId, periodCode, status, periodType, startDate, endDate}`, cache 30s LRU | ⚠️ **CONFLICT với PKG-W04 §2.2.1**: response shape `{isLocked, periodCode, closedAt}`, cache 60s, path `/protected/accounting/v1/...` — xem NC-W04-EP-AP-001 (BLOCKING) |
| 2 | **GraphQL §3e Accounting Period** (5 ops: 2 Query + 3 Mutation) | `garage-web` → `agg-garage-graph` → `gf-accounting` | `agg-garage-graph-graphql.md` v7.48 §3e, ratified | `createAccountingPeriod` có enrichment TENANT-USERS `createdByName`/`updatedByName` (KHÔNG pure passthrough — resolved trong _decisions.md 2026-07-08) |
| 3 | **GraphQL §3g Opening Balance** (6 ops: 2 Query + 4 Mutation) | `garage-web`/`garage-mobile` → `agg-garage-graph` → `gf-inventory` | `agg-garage-graph-graphql.md` v7.48 §3g, ratified | Passthrough thuần — không persistence/business logic tại BFF |
| 4 | **Kafka `AccountingPeriodClosed`/`AccountingPeriodReopened`** | topic `AC-DEV-ACCOUNTING-EVENTS`, MessageGroup `ACCOUNTING_PERIOD_LIFECYCLE` | ADR-019 Decision C | **PROPOSED, KHÔNG publish trong W04** — flip ACTIVE là trách nhiệm wave sau (không có consumer W04) |
| 5 | **Feature-flag `Inventory:InventoryV2`** (`@FeatureOn` class-level) | `gf-accounting` (6 controller) + `gf-inventory` (7 controller) + `agg-garage-graph` (resolver-level fail-fast 403) + `garage-web` (TanStack `beforeLoad` + sidebar ẩn) + `garage-mobile` (Firebase RemoteConfig, fallback default ON) | CR-20260707-02 | Gate mechanism đã spec đầy đủ nhưng CR còn `PENDING_APPROVAL` — annotation code có thể add sau khi approve, không block DEV song song |

**Endpoint count discrepancy** (xem §7 NC-W04-EP-AP-001): PKG-W04 liệt kê **6 endpoint AP** (`V4-AP-1..5` + `V4-AP-LC`) qua path `/protected/accounting/v1/*`; `gf-accounting-api.md` v15 §4 (ADR-019 canonical) liệt kê **7 endpoint** qua path `/api/v2/accounting-periods/*` (search + tree tách riêng). Error codes cũng khác: PKG dùng `ERR-AP-010..020` (KHÔNG tồn tại trong `ERROR-CODE-REGISTRY.md` v17); canonical dùng `ERR-INV-021..026` (đã registered) + `ERR-AP-001` (namespace mới, pending BA register).

---

## §5 Piggyback CR Impacts

### 5.1 CR-20260707-01 — Import Product FE-gate all-valid (APPROVED, self-execute)

| Field | Value |
|---|---|
| Status | **APPROVED** (self-execute, MINOR, narrowed 2026-07-08 từ MODERATE) |
| Boundary | `garage-web` duy nhất (KHÔNG đụng BE `gf-inventory` / BFF `agg-garage-graph`) |
| Scope | Trên màn `/inventory/internal-products/import` (W03): (1) nút "Xác nhận" **disabled** khi `errorRows > 0`; (2) **bỏ hẳn màn kết quả import trung gian** ("X thành công/Y lỗi") — confirm success đi thẳng → toast SUCCESS + redirect list; (3) giữ nút "Tải file lỗi" ở preview; (4) áp cả first-import lẫn re-import |
| Docs cascade | `FEAT-CAT-PROD-IMPORT.md` (W03) AC-6/8/9 rewrite + `UX-CAT-PROD-IMPORT.md` bỏ nhánh "result screen" — KHÔNG đụng BR/API doc |
| Effort impact | `agent-dev-garage-web` +2h Day 4 (rewrite `InternalProductImportPage`); `agent-dev-gf-inventory` **-2h** (bỏ scope BE); `agent-dev-agg-garage-graph` **-1h** (bỏ scope BFF) |

### 5.2 CR-20260707-02 — Backfill feature-flag `Inventory:InventoryV2` (PENDING_APPROVAL)

| Field | Value |
|---|---|
| Status | **PENDING_APPROVAL** (RAISED 2026-07-07, chờ Business Authority + Delivery Authority + Architecture Authority — REVIEW_GROUP cross-boundary required) |
| Boundary | Cross-boundary: `gf-accounting` + `gf-inventory` (BE `@FeatureOn`) + `agg-garage-graph` (BFF gate) + `garage-web` (route+sidebar) + `garage-mobile` (hub tile) + docs T2 (20 FEAT W03) + T3 Architecture |
| Semantic | 1 flag duy nhất `Inventory:InventoryV2`, **default ON mọi tenant từ GA** (kill-switch semantic, KHÔNG pilot rollout) |

**Gate matrix** (theo boundary, khi PENDING_APPROVAL → chưa implement annotation; DEV vẫn chạy song song, add `@FeatureOn`/gate sau khi approve):

| Boundary | Cơ chế gate | Effect khi OFF |
|---|---|---|
| `gf-accounting` | `@FeatureOn("Inventory:InventoryV2")` class-level trên `AccountingPeriodController` (6 endpoint) | HTTP 403 |
| `gf-inventory` | `@FeatureOn("Inventory:InventoryV2")` class-level trên `OpeningBalanceController` (7 endpoint, kể cả 23 V2 controller W03) | HTTP 403 |
| `agg-garage-graph` | Resolver check flag → fail-fast 403 trước forward BE | GraphQL error 403 |
| `garage-web` | TanStack Router `beforeLoad` gate `/inventory/*` + sidebar item ẩn | Redirect + UI ẩn |
| `garage-mobile` | Firebase RemoteConfig `Inventory:InventoryV2`; fallback compile-time default ON nếu fetch fail | Hub tile ẩn (refresh app-resume, KHÔNG real-time) |

**Risk nếu chưa approve tới Day 1**: các FEAT AP/OB vẫn code song song (annotation add-on sau); KHÔNG demo được flag OFF/ON (Demo step 9 PKG §6) tới khi approved — xem NC-W04-EP-OB-002.

---

## §6 Sequencing DAG (Day 1-5, tổng hợp từ PKG §4.1 + EP §8)

```
DAY 1 ─────────────────────────────────────────────────────────────
  gf-accounting  : Flyway migration V{N+1}__accounting_v1_accounting_period.sql (per ADR-019 v5
                    Decision B, NC-W04-EP-AP-002 resolved 2026-07-08) + V4-AP-1..6 impl
  gf-inventory   : Migration V{N+1}__inventory_v2_ob_ledger.sql (opening_balance_line +
                    inventory_stock_ledger) + StockLedgerRecomputeEngine baseline (C1-C8)
  agg-garage-graph: Contract lock §3e+§3g v7.48; module scaffold 2 domain
  garage-web     : Reuse-First lookup (tree/period-picker/file-upload/preview-table);
                    routes scaffolding 8 route; Nav constants T-web-Nav1..4
  garage-mobile  : Reuse-First widget verify; LocaleKeys assets; InventoryHubPage
                    (3-tile state matrix) + RemoteConfig gate wire

DAY 2 ─────────────────────────────────────────────────────────────
  gf-accounting  : V4-AP-LC lock-check endpoint (REST advisory) — BLOCKER cho gf-inventory
                    commit-path Day 2; integration test cascade/overlap
  gf-inventory   : W04-1 search + W04-3 verify-import (fail-OPEN) + W04-4 import
                    (fail-CLOSED all-or-nothing, wire AccountingPeriodClient.lockCheck)
  agg-garage-graph: Resolver passthrough 5 AP op + @FeatureOn gate + error-code-map
  garage-web     : AccountingPeriodListPage (tree) + CreatePage bắt đầu
  garage-mobile  : OpeningBalanceListPage + Cubit — SmartRefresher + skeleton + Semantics

DAY 3 ─────────────────────────────────────────────────────────────
  gf-accounting  : E2E integration với gf-inventory REST advisory + feature-flag annotation
                    + KG sync + code review fix → REVIEW handoff
  gf-inventory   : W04-5/6/7 (edit/delete-single/delete-lines fail-fast) + unit test ≥80%
  agg-garage-graph: 6 OB ops passthrough + Vitest ≥80% + KG sync
  garage-web     : DetailPage + EditPage (đóng/mở toggle) + OB ListPage + ImportPage bắt đầu
  garage-mobile  : Widget/bloc_test/alchemist golden ≥60% → REVIEW handoff Day 3

DAY 4 ─────────────────────────────────────────────────────────────
  garage-web     : OB EditLinePage + DeleteLinesDialog; CR-20260707-01 FE rewrite
                    (disabled button + bỏ màn kết quả); Vitest ≥60% + testid ≥95%
                    → REVIEW handoff

DAY 5 ─────────────────────────────────────────────────────────────
  TEST_PLANNING song song REVIEW (agent-test-api/ui/e2e/isolation Day 4-5)
  Cross-boundary integration test: đóng kỳ → OB import fail-CLOSED → mở lại → import
    success → ledger insert origin_context=OB_IMPORT; empty-file canCommit=false;
    501-row reject; gf-accounting down → fail-OPEN advisory / fail-CLOSED commit 503
  Exit: build/lint/test pass 5 boundary; REVIEW P1=0; AC coverage 100% (10 FEAT + 2 CR)
```

**Không hard gate AP↔OB trong cùng wave** — 2 team chạy song song, chỉ cross tại điểm `V4-AP-LC`/lock-check (gf-inventory cần gf-accounting endpoint sẵn sàng từ Day 2).

---

## §7 Open Items (Aggregated NEED CONFIRMATION)

> Tổng hợp từ 3 EP §10/§9 + `_decisions.md` (16 entries) + PKG §0/§7/§9. Đầy đủ chi tiết per-FEAT NC nằm ở §NEED CONFIRMATION riêng mỗi 28 FEAT-tier spec (không lặp lại toàn bộ ở đây — theo precedent W03 overview).

### 7.1 BLOCKING (phải resolve trước DEV Day 1)

| # | Item | Owner | Blocker |
|---|---|---|---|
| ~~NC-W04-EP-AP-001~~ **RESOLVED 2026-07-08 v2** | ~~AP REST endpoint/error-code contract drift~~ — **Option A resolution** per user quannn 2026-07-08: PKG-W04 §2.2.1 rewrite align canonical `gf-accounting-api.md v15 §4` (7 endpoints path `/api/v2/accounting-periods/*` + `/protected/v1/lock-check`, error codes `ERR-INV-021..026` + `ERR-CMN-not-found` + `ERR-AP-001`, lock-check 7-field response `{locked, periodId, periodCode, periodName, periodType, status, startDate, endDate}`, cache TTL 30s). Cascade tại PKG-W04 v10 Change Log entry. | ~~Architecture Authority + Delivery Authority~~ (Delivery Authority self-execute) | ✅ Unblocked — `gf-accounting` DEV Day 1 |
| ~~NC-W04-EP-AP-002~~ **RESOLVED 2026-07-08 v3** | ~~Migration strategy drift~~ — user quannn 2026-07-08 chốt override: dùng **Flyway `V{N+1}__accounting_v1_accounting_period.sql`** additive per ADR-019 v5 Decision B (updated 2026-07-08 canonical align, thay cho `ddl-auto=update` default trước đó). PKG-W04 v12 §2.2.1 Entity + §4.1 DEV task + §5.1 Deliverable cascade align ADR-019 v5. Cross-entity trade-off documented: 5 baseline + 3 insurance design tables trên cùng `gf-accounting` boundary vẫn `ddl-auto=update` per CLAUDE.md §7 Gotcha #5 (AP entity là exception documented tại ADR-019 v5 §Consequences). | ~~Architecture Authority + Delivery Authority~~ (Delivery Authority self-execute + ADR-019 v5 canonical align) | ✅ Unblocked — `gf-accounting` DEV schema Day 1 |

### 7.2 MEDIUM / doc hygiene

| # | Item | Owner |
|---|---|---|
| NC-W04-EP-AP-003 | `INTEG-EXT-gf-accounting.md` v5 chưa liệt kê tường minh caller `gf-inventory` cho OB W04 (chỉ ghi "future RECEIPT-V2/DELIVERY-V2/PRC") — nội dung tương thích, chỉ doc hygiene | Architecture Authority |
| NC-W04-EP-OB-003 | Source `EP-INVENTORY-OPENING-BALANCE.md` v5 §5.2 chưa liệt kê dependency `gf-accounting` (đã ratified qua ADR-021 sau ngày source EP) — đề xuất BA bump EP v6 | Business Authority |
| OI-W04-BR-003 | BR-AP-013 guard (3) "đã phát sinh dữ liệu kho" KHÔNG enforce trong `accounting_period` DELETE batch W04 (guard là trách nhiệm downstream consumer, chưa có reverse cross-boundary query) — risk orphan reference OB→kỳ đã xóa | Architecture Authority + Business Authority |
| — | `BR-GF-INVENTORY-CATALOG.md` (W04 supplement) source path mismatch — Context Bundle chỉ định `BR-GF-INVENTORY-CATALOG.md` (v19, KHÔNG chứa BR-INV-MENU-*); author dùng đúng nguồn `BR-GF-INVENTORY.md` §2.6 v3 thay thế — flag cho orchestrator cập nhật bundle generator | Delivery Authority (tooling) |
| — | `FEAT-AP-CREATE` (bff) resolved: dùng `POST /api/v2/accounting-periods` (`V4-AP-4`, `gf-accounting-api.md` §4.4 + `agg-garage-graph-graphql.md` §3e.2/§3e.6, v7.57 ratified) làm SSOT thay vì `V4-AP-2` PKG bundle snapshot cũ; `createAccountingPeriod` có enrichment TENANT-USERS (KHÔNG pure passthrough) | (đã resolved, ghi trong `_decisions.md`) |

### 7.3 Fan-out / tooling gap

| # | Item |
|---|---|
| **FEAT-INV-MOBILE-MENU allowlist skip** | `resolve-fanout.py` không sinh 4 tier-bundle cho `FEAT-INV-MOBILE-MENU` (boundary `garage-mobile` không thuộc BE allowlist khi resolve fan-out mode `feature-mobile` cho FEAT này) — nội dung delta W04 (tile "Tồn đầu kỳ" ẨN→HIỆN) được author trực tiếp tại EP-CATALOG (W04 supplement) §2 thay vì file `Product/features/mobile/FEAT-INV-MOBILE-MENU.md` chuẩn quy trình. Khuyến nghị: fix allowlist trong `resolve-fanout.py` trước W05 (hub sẽ có thêm delta tile mỗi wave). |
| **source_sha backfill (toàn bộ 6 EP/BR-tier DRAFT)** | Không có Bash/hashing tool trong phiên author `agent-execution-spec-author` — mọi `source_sha` ở 3 EP + 3 BR tier file đều đánh dấu "NEED CONFIRMATION"/"NOT-COMPUTED". Orchestrator/CI phải chạy `sha256sum` backfill cho: `EP-INVENTORY-ACCOUNTING-PERIOD.md` v16, `EP-INVENTORY-OPENING-BALANCE.md` v5, `EP-INVENTORY-CATALOG.md` v8, `BR-GF-INVENTORY-ACCOUNTING-PERIOD.md` v27, `BR-GF-INVENTORY-OPENING-BALANCE.md` v13, `BR-GF-INVENTORY.md` v3 (§2.6) — trước khi bump bất kỳ file nào DRAFT→ACTIVE. 28 FEAT-tier file ĐÃ có `source_feat_sha` (computed qua bundle generator preflight — không bị gap này). |
| **Parent PKG SHA chưa compute** | `PKG-W04-inventory-period-opening-balance.md` v9 chưa có sha256 backfill ở frontmatter overview này — cùng nguyên nhân thiếu Bash tool. |

### 7.4 CR pending / carryover

| # | Item |
|---|---|
| CR-20260707-02 `Inventory:InventoryV2` | **PENDING_APPROVAL** tại thời điểm audit (2026-07-08) — REVIEW_GROUP cross-boundary (BA+Delivery+Architecture) chưa approve. Không hard-block DEV song song nhưng block Demo step 9 (flag flip) + §5.3 Quality Gates AC coverage cho 2 CR. |
| CR-20260707-01 | **APPROVED** (self-execute, MINOR, 2026-07-08) — không còn open item. |
| DEBT-W03-UI-CROSSWAVE-01 (carryover) | 9 TC UI Wave 03 BLOCKED (phụ thuộc module Nhập/Xuất kho V2 W05/W06) — chính thức dời sang **W05 execution window**. Không trực tiếp block W04 nhưng cần tracking để không bị quên khi W05 kick-off. |
| NC-W04-EP-001/002/003 (EP-CATALOG supplement) | source_sha chưa tính (LOW); xác nhận "narrow-scope là chủ đích" (cần reviewer confirm không phải thiếu sót); mid-session force-logout khi flip flag chưa implement W04 (theo dõi W05/W06). |

---

## §8 Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 3 | Delivery Authority (quannn) + main agent | **Override NC-W04-EP-AP-002 — Migration strategy AP entity chuyển sang Flyway** per user quannn 2026-07-08 chốt ("chốt sẽ dùng V{N+1}__accounting_v1_accounting_period.sql" + "sửa cả ADR-019"). Đây là override v2 cascade resolution (v2 chọn `ddl-auto=update` per ADR-019 v4 + Gotcha #5 canonical) — user chốt Flyway thay vì ddl-auto=update sau khi v2 đã resolved. Cascade với **ADR-019 v4→v5** canonical update (Decision B AP entity Flyway + §Consequences trade-off + §Alternatives B3 add) + **PKG-W04 v11→v12** (§2.2.1 Entity migration strategy Flyway + §4.1 DEV task effort +1h + §5.1 Deliverable schema strategy Flyway). **Cascade update `_wave-overview.md`**: (1) §7.1 BLOCKING table NC-W04-EP-AP-002 row rewrite — description update từ "cascade cùng NC-EP-AP-001 resolution: PKG-W04 v10 chuyển từ Flyway sang `ddl-auto=update`..." → "user quannn override: Flyway `V{N+1}__accounting_v1_accounting_period.sql` per ADR-019 v5 Decision B canonical align"; Owner column update; RESOLVED annotation 2026-07-08 v2 → v3. (2) §1 narrative "Điểm cần chú ý nhất" paragraph mark 2 BLOCKING RESOLVED (historical note) — reword tránh làm reader hiểu nhầm còn open. (3) §6 Sequencing DAG Day 1 gf-accounting swimlane — update "Migration accounting_period (⚠️ Flyway theo PKG — CONFLICT ddl-auto=update...)" → "Flyway migration V{N+1}__accounting_v1_accounting_period.sql (per ADR-019 v5 Decision B, NC-W04-EP-AP-002 resolved 2026-07-08) + V4-AP-1..6 impl". (4) `pkg_version` frontmatter bump 10 → 12 sync với PKG-W04 v12. **KHÔNG đụng**: (1) 28 FEAT-tier specs; (2) 3 EP + 3 BR-tier specs; (3) `_decisions.md`; (4) NC-W04-EP-AP-001 (đã resolved v2, không đổi); (5) NC MEDIUM/LOW severity; (6) `gf-accounting-api.md` v15 / `gf-accounting-data-model.md` v10 (schema DDL cùng nội dung, chỉ khác method deploy); (7) CLAUDE.md §7 Gotcha #5 (default statement giữ nguyên, AP entity là exception documented tại ADR-019 v5). Cascade pair với `ADR-019 v5` + `PKG-W04 v12`. Cross-entity trade-off documented: 5 baseline + 3 insurance design tables trên `gf-accounting` boundary vẫn `ddl-auto=update` per Gotcha #5. Follow-up (ngoài scope W04): nếu team consolidate migration strategy → separate CR. Backward-compat: `_wave-overview.md` DRAFT không có consumer downstream. |
| 2026-07-08 | 2 | Delivery Authority (quannn) + main agent | **Resolve 2 BLOCKING NC (NC-W04-EP-AP-001 + NC-W04-EP-AP-002)** — user quannn 2026-07-08 phân tích NC-W04-EP-AP-001 chọn Option A "sửa PKG-W04 §2.2.1 về canonical `gf-accounting-api.md v15 §4`". Cascade cùng resolve NC-W04-EP-AP-002 (migration strategy) — PKG chuyển từ Flyway → `ddl-auto=update` per ADR-019 Decision B + CLAUDE.md §7 Gotcha #5 canonical. **Cascade update `_wave-overview.md`**: (1) §7.1 BLOCKING table — mark 2 rows NC-W04-EP-AP-001 + NC-W04-EP-AP-002 với strikethrough + "RESOLVED 2026-07-08 v2" annotation; Owner column từ "Architecture Authority + Delivery Authority" → "Delivery Authority self-execute" (không cần cross-boundary review vì PKG là T4 execution artifact, không phải T3 canonical); Blocker column marked ✅ Unblocked. (2) `parent_pkg_version` frontmatter bump 9 → 10 để sync với PKG-W04 v10. **Cascade pair** với `PKG-W04-inventory-period-opening-balance.md v9→v10` (§2.2.1 REST endpoints table 6→7 rows canonical, error codes rewrite, lock-check 7-field response, TTL 30s, entity + migration strategy update, §3 Entry cite canonical, §4.1 agent-dev-gf-accounting task update, §5.1 Deliverable align, Change Log entry v10 chi tiết). Chi tiết resolution audit trail tại PKG-W04 v10 Change Log. **KHÔNG đụng**: (1) 28 FEAT-tier specs (BLOCKING chỉ liên quan endpoint contract, không đụng feature spec); (2) 3 EP + 3 BR-tier specs; (3) `_decisions.md` (16 entries lịch sử giữ nguyên); (4) NC MEDIUM/LOW severity (NC-W04-EP-AP-003 doc hygiene, NC-W04-EP-AP-004 source_sha, NC-W04-EP-OB-*, OI-W04-BR-003) — resolve riêng qua workflow chuẩn. Backward-compat: `_wave-overview.md` là DRAFT tổng hợp, không có consumer downstream nên safe update. |
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Khởi tạo DRAFT wave overview W04 từ 34 spec DRAFT (3 EP + 3 BR + 28 FEAT-tier — correction so với input ban đầu ước tính 36 FEAT-tier/42 tổng; mobile scope narrow theo Figma registry rule khiến 8 FEAT web-only không có tier mobile). §1 Wave scope narrative — 2 epic song song (AP trên `gf-accounting` mới move + OB trên `gf-inventory`) + 2 piggyback CR. §2 Vertical slice end-to-end (AP master → REST advisory lock-check → OB write-path → ledger → BFF passthrough → Web+Mobile). §3 Feature × Tier matrix (9 FEAT full tier-spec + `FEAT-INV-MOBILE-MENU` epic-delta-only). §4 Cross-boundary contracts (5 contract, nhấn mạnh V4-AP-LC conflict). §5 Piggyback CR impacts (CR-01 APPROVED chi tiết scope; CR-02 PENDING_APPROVAL + gate matrix 5 boundary). §6 Sequencing DAG Day 1-5 tổng hợp từ PKG §4.1 + 2 EP §8. §7 Open items — phát hiện lại 2 BLOCKING (NC-W04-EP-AP-001 endpoint/error-code drift, NC-W04-EP-AP-002 Flyway vs ddl-auto=update) cần Architecture Authority reconcile trước DEV Day 1, cộng với fan-out allowlist gap cho `FEAT-INV-MOBILE-MENU`, source_sha backfill toàn bộ 6 EP/BR-tier, và carryover DEBT-W03-UI-CROSSWAVE-01. |
