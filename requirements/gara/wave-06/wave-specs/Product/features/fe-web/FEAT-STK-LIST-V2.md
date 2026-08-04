---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-LIST-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-LIST-V2"
source_feat_sha: "0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48"
generated_at: "2026-07-31T06:31:29+00:00"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-STK-LIST-V2"]
consumes_bff_feats: ["FEAT-STK-LIST-V2"]
i18n_keys: []
screens_touched: ["src/features/inventory-stock-report/components/list/stock-report-list.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-stk-list-v2.md (node 14507:89271 — Báo cáo tồn kho đến ngày, 2 screen state: rỗng + có dữ liệu)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A — not supplied by bundle/orchestrator, backfill on next regen"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-LIST-V2.fe-web.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-LIST-V2 (FE Web): Báo cáo tồn kho đến ngày

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST-V2` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/inventory-stock-report/components/list/stock-report-list.tsx` |
| Cross-tier consume | BE: `gf-inventory` (`FEAT-STK-LIST-V2`) \| BFF: `agg-garage-graph` (`FEAT-STK-LIST-V2` §3j) |

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

## 2. Trách nhiệm FE Web (garage-web)

- Render màn **"Báo cáo tồn kho đến ngày"** — entry point là tab **"Báo cáo tồn kho"** trong sub-nav module Tồn kho (Web GMS, cạnh Phiếu nhập kho / Phiếu xuất kho / Tồn đầu kỳ / Tính giá xuất kho / Báo cáo NXT), scope full-page, layout: Page Header (title + nút "Xuất file ") → thanh Fillter (3 control) → bảng 8 cột + dòng Tổng → Table Pagination.
- User flow chính: user mở tab → FE gọi query `stockLedgerAtDate` với filter mặc định (ngày = hôm nay, tất cả kho) → render bảng + dòng Tổng → user đổi filter (search / kho / ngày) → FE refetch → user bấm "Xem lịch sử" trên 1 dòng → điều hướng sang Thẻ kho (mang theo mã + kho) → hoặc bấm "Xuất file" → tải `.xlsx`.
- State machine UI: `idle → loading (skeleton/spinner bảng) → success (render rows + dòng Tổng + pagination) | empty (illustration "Không có dữ liệu", KHÔNG render pagination) | error (toast + giữ nguyên bảng cũ hoặc empty)`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (bundle §G.X liệt kê inventory qua figma spec §10 Verification Contract `required_imports` — xem §5.2). Chỉ build-new khi cả 3 layer không match — entry phải có justification.
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest đều theo `Product/ux/figma-web/wave06-stk-list-v2.md` (node `14507:89271`). §2/§4/§5 references cross-ref figma sections (vd "AC-2 8 cột bảng — xem figma spec §1 Layout DSL `stock_table`", "AC-3 cột Giá trị tồn căn phải — xem figma §4 Component Prop Map `data-table.columns[].align`"). KHÔNG suy luận visual từ AC/BR text đơn thuần.
- Consume GraphQL từ BFF `agg-garage-graph`: query `stockLedgerAtDate` (paged list + aggregates) và query `stockLedgerAtDateExport` (xuất `.xlsx`) — cả hai passthrough thuần sang `gf-inventory` public REST (§3j).
- RBAC render: route mở cho cả 2 persona `garage-owner` và `accountant` ngang quyền (AC-9) — KHÔNG có gating/feature-flag theo role; chỉ gate chung route Tồn kho (nếu có) áp dụng đồng nhất.

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Mở màn + bố cục

#### AC-1 → Render màn báo cáo khi vào tab

- **Khi**: user (garage-owner hoặc accountant) click tab "Báo cáo tồn kho" trong sub-nav Tồn kho.
- **FE phải**: mount route, hiển thị Page Header (title "Báo cáo tồn kho đến ngày" + nút "Xuất file "), thanh Fillter, bảng 8 cột, dòng Tổng, Table Pagination; trigger query `stockLedgerAtDate` với filter mặc định `asOfDate = hôm nay`, `warehouseIds = []` (tất cả kho), `keyword = null`.
- **State transition**: `idle → loading` (bảng hiển thị skeleton/loading state) `→ success` (render rows) hoặc `→ empty` (0 dòng khớp filter).
- **Component**: `stock-report-list.tsx` (NEW) compose `page-header` + `main-filter` + `data-table`/`table-pagination` + `no-data`.
- **GraphQL op**: `stockLedgerAtDate(input: StockLedgerAtDateInput!)`.
- **i18n keys**: N/A — fixed VN label theo figma verbatim (xem §4.3).
- **a11y**: `<h1>` cho title; table có `role="table"` + caption ẩn "Báo cáo tồn kho đến ngày".
- **Ref**: paired BFF FEAT §3j `stockLedgerAtDate`, Figma node `14507:89271` (§5.1).

#### AC-2 → Render đủ 8 cột + dòng Tổng

- **Khi**: bảng render (state có dữ liệu).
- **FE phải**: render đúng thứ tự 8 cột: STT · Mã nội bộ · Tên sản phẩm · ĐVT chính · Kho · Số lượng tồn (căn trái) · Giá trị tồn (căn phải) · Thao tác (link "Xem lịch sử"); render dòng Tổng (footer, geometry 4-cell khác bảng dữ liệu — xem AP-STK-2) hiển thị `aggregates.totalQuantity` + `aggregates.totalValue`. Cột "Thao tác" KHÔNG render trên mobile (ngoài scope file này, xem `features/mobile/FEAT-STK-LIST-V2.md`).
- **State transition**: cột header luôn hiển thị kể cả state rỗng (chỉ 0 data row); dòng Tổng CHỈ render ở state có dữ liệu (KHÔNG render khi empty — xem AC-negative-coverage figma).
- **Component**: `data-table` (`stock_table`) + footer row riêng theo `AP-STK-2` (4-cell colSpan, KHÔNG dùng grid 8 cột của bảng dữ liệu).
- **GraphQL op**: field `content[]` (8 field/row per `StockLedgerAtDateRow`) + `aggregates{ totalQuantity totalValue }`.
- **i18n keys**: N/A — fixed VN header label.
- **a11y**: mỗi `<th>` có `scope="col"`; dòng Tổng có `aria-label="Dòng tổng"`.
- **Ref**: Figma §1 `stock_table` columns + §8 AP-STK-2, node `15728:106660`.

### Cluster B — Dữ liệu số lượng/giá trị

#### AC-3 → Render đúng SL tồn + GT tồn dạng số (không "Tạm tính")

- **Khi**: mỗi row render.
- **FE phải**: hiển thị `row.quantityOnHand` (căn trái, số nguyên/thập phân theo BE trả) ở cột "Số lượng tồn", `row.valueOnHand` (căn phải, format tiền VND) ở cột "Giá trị tồn". FE KHÔNG hiển thị chữ "Tạm tính" hay bất kỳ badge/label định tính nào cho giá trị tồn — luôn là một con số duy nhất kể cả khi mã chưa chạy BQGQ (giá vốn xuất = 0, giá trị vẫn là số hợp lệ từ BE).
- **State transition**: N/A (pure render — không có state riêng cho ô số liệu ngoài loading skeleton của row).
- **Component**: cell renderer trong `data-table` — number formatter dùng chung util format tiền VND (share/format nếu có, không hardcode `Intl.NumberFormat` rải rác nhiều nơi).
- **GraphQL op**: field `quantityOnHand: Decimal!`, `valueOnHand: Decimal!` trong `StockLedgerAtDateRow`.
- **i18n keys**: N/A.
- **a11y**: giá trị số có `aria-label` đầy đủ đơn vị khi cần (screen reader đọc "24" nên có thể kèm `ĐVT chính` context).
- **Ref**: Figma §1 `col_stock_qty` / `col_stock_value` (align trái/phải), `gf-inventory-api.md §5.2` (BE canonical).

### Cluster C — Bộ lọc

#### AC-4 → 3 control lọc trigger refetch

- **Khi**: user gõ vào ô search, chọn kho (multi-select), hoặc chọn ngày báo cáo.
- **FE phải**: (a) ô search — debounce ~300ms, LIKE match mã/tên, placeholder verbatim **"Tìm theo mã nội bộ, Tên sản phẩm nội bộ"** (theo Figma R9 — khác placeholder trong source FEAT text, xem `coverage_gaps` — dùng bản Figma làm chuẩn hiển thị, flag NEED CONFIRMATION cho Business Authority chốt cuối); (b) chip "Kho " — multi-select tất cả kho tenant (rỗng = tất cả); (c) chip "Ngày báo cáo: dd/MM/yyyy" — single date-picker, mặc định hôm nay, KHÔNG phải range. Mỗi thay đổi trigger refetch `stockLedgerAtDate` với input tương ứng (KHÔNG cần nút "Áp dụng" riêng — xem Figma "mỗi thay đổi trigger refetch").
- **State transition**: filter thay đổi → bảng chuyển `loading` (giữ nguyên header, có thể overlay spinner) → `success`/`empty`.
- **Component**: `form-search-input` (search) + `domain-warehouse-select` (kho) + `form-date-picker` (ngày, `mode=single`).
- **GraphQL op**: `stockLedgerAtDate(input: { keyword, warehouseIds, asOfDate, page, size, sort })`.
- **i18n keys**: N/A — fixed VN placeholder/label.
- **a11y**: search input có `aria-label="Tìm kiếm mã hoặc tên sản phẩm"`; date-picker/warehouse chip có `aria-haspopup="listbox"` / `"dialog"`.
- **Ref**: Figma §1 `filter_bar` (`filter_search` / `filter_warehouse` / `filter_report_date`), §5 Field Composition Schema.

### Cluster D — Hiển thị theo kho + theo ngày (chủ yếu BE-driven)

#### AC-5 → Mỗi (mã + kho) là 1 dòng riêng

- **Khi**: response trả nhiều row cùng `productCode` khác `warehouseCode`.
- **FE phải**: render mỗi row từ `content[]` là 1 `<tr>` độc lập — KHÔNG group-by / merge-cell theo mã. FE không tự gộp dòng dù nhìn giống nhau (chỉ trust thứ tự BE trả, mặc định sort `productCode,asc`).
- **State transition**: N/A (render logic thuần).
- **Component**: `data-table` — không dùng rowSpan/groupBy.
- **GraphQL op**: `content[]` array — mỗi phần tử độc lập theo `(productCode, warehouseCode)`.
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: Figma §0 ASCII mockup — cùng mã `PN-18901` xuất hiện nhiều dòng khác cột Kho; ADR-009 (không JPA relationship — hệ quả BE trả flat rows, FE chỉ render).

#### AC-6 → N/A (BE-driven filter, không có UI affordance)

- Điều kiện hiển thị mã (SL tồn ≠ 0 HOẶC Giá trị tồn ≠ 0 tại ngày đã chọn) là business rule server-side thuần (`BR-STKV2-007`) — BE tự lọc trước khi trả `content[]`. FE KHÔNG tự áp thêm filter ẩn/hiện theo SL/GT — chỉ render đúng những gì API trả về (kể cả row có SL=0 nhưng GT≠0, per EC-5). Xem `be/FEAT-STK-LIST-V2.md §9`.

### Cluster E — Thao tác

#### AC-7 → Điều hướng sang Thẻ kho ("Xem lịch sử")

- **Khi**: user click link "Xem lịch sử " trên 1 dòng.
- **FE phải**: điều hướng full-page (KHÔNG mở popup/modal) sang route Thẻ kho (`FEAT-STK-DETAIL-V2`, tier fe-web riêng) — truyền `productCode` + `warehouseCode` của dòng đó qua route param/query string.
- **State transition**: navigation — rời khỏi route hiện tại (không giữ filter state trong URL của màn Thẻ kho).
- **Component**: Router `<Link>` (TanStack Router) styled `text-primary` (`#0052ff`) — KHÔNG phải button component riêng, chỉ text link trong cell.
- **GraphQL op**: N/A (client-side navigation, Thẻ kho tự query lại theo params).
- **i18n keys**: N/A — label verbatim "Xem lịch sử ".
- **a11y**: `<a>`/Router Link có accessible name rõ ràng — vd "Xem lịch sử mã {productCode} kho {warehouseName}" qua `aria-label` (tránh N link cùng text "Xem lịch sử" mơ hồ cho screen reader).
- **Ref**: Figma §7 Visual Hierarchy Map L5b (text-primary link); route đích thuộc sở hữu paired FE spec `FEAT-STK-DETAIL-V2` (§12).

#### AC-8 → Xuất file .xlsx theo filter hiện tại

- **Khi**: user click nút "Xuất file " ở Page Header.
- **FE phải**: gọi query `stockLedgerAtDateExport` với đúng filter hiện tại (`asOfDate`, `warehouseIds`, `keyword`, `sort`) — KHÔNG kèm cột UI-only "Thao tác"; nhận `contentBase64`, decode + trigger browser download bằng `fileName` + `contentType` trả về; disable nút khi không có dòng nào để xuất (state rỗng); hiển thị `isLoading` (spinner thay icon) trong lúc chờ generate.
- **State transition**: `idle → loading (spinner icon, pointer-events-none) → success (browser download trigger) | error (toast)`.
- **Component**: `primary-button` (`btn_export_file`, variant=brand, size=lg) + helper `share/exports/export-excel` (không render UI riêng, chỉ xử lý decode+download).
- **GraphQL op**: `stockLedgerAtDateExport` — response `StockReportExportPayload { contentType fileName contentBase64 contentLength }`.
- **i18n keys**: N/A — label verbatim "Xuất file " (giữ space cuối theo Figma, DEV trim khi render).
- **a11y**: button có accessible loading announcement (`aria-busy="true"` khi loading).
- **Ref**: Figma §1 `btn_export_file`, §3 State Table (default/hover/loading/disabled), mẫu file `Product/ux/assets/Báo cáo tồn kho.xlsx`.

### Cluster F — Phân quyền

#### AC-9 → N/A (không có UI khác biệt theo role)

- Cả `garage-owner` và `accountant` thấy đúng 1 giao diện — không có badge/banner/disabled state phân biệt persona trong Figma (đã xác nhận `coverage_gaps`). FE chỉ cần route accessible chung cho cả 2 role (nếu có route-level RBAC guard chung của module Tồn kho thì áp dụng đồng nhất, không thêm gate riêng cho feature này).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-stk-list-v2.md` (node `14507:89271`). KHÔNG re-invent layout/spacing/color.
- Design tokens lấy từ `tailwind.config.js` / `src/styles/tokens/**` — không hardcode hex/px. Tokens MUST khớp §5.3.
- Responsive: Figma chỉ vẽ desktop 1440px — verify tablet/mobile breakpoint theo Tailwind preset chung của app (không có spec riêng cho breakpoint hẹp trong file này).
- Mỗi visual AC cross-ref figma section: AC-2 → Figma §1 `stock_table` columns; AC-3 → Figma §1 `col_stock_qty`/`col_stock_value` align; AC-8 → Figma §1 `btn_export_file`.

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | empty | error`. Loading = skeleton/spinner bảng (Figma không vẽ — dùng `share/loadings/loading-screen` baseline chung). Empty = illustration + "Không có dữ liệu" (`share/emptys/no-data`, KHÔNG card wrapper — xem AP-STK-1).
- Error (network/500) → toast (không có ERR-code cụ thể nào từ BFF §3j cho query GET đơn giản — dùng error mapping chung `ERR-CMN-*` nếu BFF trả).
- KHÔNG silent fail — mọi error reach UI (toast) hoặc log.

### 4.3 i18n + a11y

- **KHÔNG dùng i18next — fixed VN labels** theo `Product/ux/figma-web/wave06-stk-list-v2.md §10 verbatim_string_assertions` (transcribe verbatim, giữ nguyên khoảng trắng thừa như "Kho ", "Xuất file ", "Mã nội bộ "). `i18n_keys: []` frontmatter empty — pattern này mirror precedent PKG-W02 §2.2 v15 (single-locale VN).
- a11y: table header có `scope="col"`; search input `aria-label`; date-picker/warehouse chip `aria-haspopup`; nút "Xuất file" `aria-busy` khi loading; keyboard nav Tab qua 3 filter control → bảng → pagination.
- Semantic HTML — bảng dùng `<table>`/`role="table"` qua component `data-table`, KHÔNG raw `<div>` giả bảng.

### 4.4 RBAC render + feature flag

- KHÔNG có feature flag riêng cho feature này trong bundle/PKG (module Tồn kho V2 chung có thể có flag `Inventory:InventoryV2` ở BE — FE không cần gate UI thêm, BE tự 403 nếu flag off, BFF map `FORBIDDEN_ERROR`, FE hiển thị toast lỗi generic).
- Cả 2 persona `garage-owner` / `accountant` render y hệt (AC-9) — KHÔNG conditional render theo role trong feature này.
- Route gate: theo route guard chung module Tồn kho (không đặc thù feature).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (`be/FEAT-STK-LIST-V2.md §9`). FE chỉ:
  - Trust BE-filtered rows (AC-6) — không tự thêm client-side hide logic.
  - Disable nút "Xuất file" khi 0 dòng dữ liệu (`BR-STKV2-005` UI hint).
  - Không render text "Tạm tính" cho giá trị tồn dù giá vốn chưa tính BQGQ (`BR-STKV2-001/002` UI hint).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `FORBIDDEN_ERROR` | TOAST | toast-notification | AC-1 (feature flag off) |
| `ERR-CMN-validation` | TOAST | toast-notification | AC-4 (invalid date/filter param) |
| network/timeout | TOAST + giữ bảng cũ | toast-notification | AC-1, AC-8 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `StockReportListPage` | `/inventory-stock/reports/at-date` (canonical — ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2; sửa từ `/inventory/stock-report` NEED CONFIRMATION per GAP-W06-GW-06, `/warm-up garage-web --fix` W06 Phase B) | NEW | `14507:89271` | AC-1 – AC-9 |

### 5.2 Components new/modified

> Reuse priority `customs/` > `share/` > `ui/`. Nguồn: `Product/ux/figma-web/wave06-stk-list-v2.md §10 Verification Contract (required_imports)` + `§4 Component Prop Map`.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `main-filter` | `src/components/customs/filter/main-filter.tsx` | REUSE | `{ children }` wrapper | — | **Priority 1 — customs/** (domain filter container) | AC-4 |
| `domain-warehouse-select` | `src/components/customs/select/warehouses-select-filter.tsx` | REUSE | `{ multiple: true, value, onChange }` | selected warehouseIds | **Priority 1 — customs/** (domain-specific kho multi-select) | AC-4 |
| `page-header` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, actions }` | — | **Priority 2 — share/** (cross-feature baseline) | AC-1, AC-8 |
| `primary-button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant: 'brand', size: 'lg', isLoading, disabled }` | loading/disabled | **Priority 2 — share/** | AC-8 |
| `form-search-input` | `src/components/share/inputs/input-search.tsx` | REUSE | `{ placeholder, value, onChange }` | debounced value | **Priority 2 — share/** | AC-4 |
| `form-date-picker` | `src/components/share/date-picker/date-picker.tsx` | REUSE | `{ mode: 'single', format: 'dd/MM/yyyy', value, onChange }` | selected date | **Priority 2 — share/** | AC-4 |
| `data-table` (+ `table-pagination` biến thể data-state) | `src/components/share/tables/table.tsx` / `table-pagination.tsx` | REUSE | `{ columns, rows, footer }` | page/size | **Priority 2 — share/** | AC-2, AC-3, AC-5 |
| `no-data` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ message: "Không có dữ liệu" }` | — | **Priority 2 — share/** | AC-1 (empty state) |
| `StockReportListPage` (feature screen) | `src/features/inventory-stock-report/components/list/stock-report-list.tsx` | NEW | `{}` (route-level) | filters + query state | **Build-new** — justification: page-level composition không có sẵn ở customs/share/ui, chỉ compose các component reuse trên | AC-1 – AC-9 |
| Row action link "Xem lịch sử" | `src/features/inventory-stock-report/components/list/stock-report-row-action.tsx` | NEW | `{ productCode, warehouseCode }` | — | **Build-new** — justification: routing Link styled text-primary, không phải component registry sẵn có (không xuất hiện trong `required_imports` của figma spec) | AC-7 |

### 5.3 Design tokens & Figma refs

> Tokens khớp bundle §G.Y "Design tokens referenced" (`bg-accent`, `bg-brand`, `bg-muted`, `bg-primary`, `border-primary`, `ring-primary`, `text-foreground`, `text-muted-foreground`, `text-primary`) + bổ sung tokens chi tiết hơn từ figma spec §2 (grep-verifiable trong cùng file).

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-accent` | figma §2 (`base/accent` #f4f4f5) | Nền header row bảng + nền dòng Tổng | AC-2 |
| `bg-primary` / `bg-brand` | figma §2 (`base/background-brand-CD` #0052ff) | Nền nút "Xuất file ", nền navbar | AC-8 |
| `text-primary` | figma §2 (`base/foreground-brand-CD` #0052ff) | Link "Xem lịch sử ", màu chữ "Mã nội bộ" | AC-7 |
| `border-primary` | figma §2 (`base/border-brand-CD` #0052ff) | Border focus/active filter control | AC-4 |
| `ring-primary` | figma §3 State Table (`ring-2 ring-primary/30`) | Focus ring ô search | AC-4 |
| `text-foreground` | figma §2 (`base/foreground` #18181b) | Title, header cell, cell value | AC-1, AC-2, AC-3 |
| `text-muted-foreground` | figma §2 (`base/muted-foreground` #71717a) | Placeholder search | AC-4 |
| `bg-muted` | (component baseline hover/disabled state — không xuất hiện explicit trong 2 screen state đã fetch, giữ theo bundle §G.Y detected set) | Hover/disabled fallback nếu component baseline dùng | (n/a) |
| `border-input` | figma §2 (`base/input` #d4d4d8) | Border ô search/chip filter | AC-4 |
| `bg-background` | figma §2 (`base/background` #ffffff) | Nền page, nền bảng | AC-1 |

> **Figma source-of-truth**: visual / micro-interaction / responsive đều theo Figma. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `stockLedgerAtDate` | query | `src/api/graphql/stock-ledger-at-date.graphql` | `['stockLedgerAtDate', filters]` | `StockLedgerAtDateRowFragment` | AC-1, AC-2, AC-3, AC-4, AC-5 |
| `stockLedgerAtDateExport` | query | `src/api/graphql/stock-ledger-at-date-export.graphql` | — (imperative fetch, không cache) | — | AC-8 |

> Mọi op tồn tại ở paired BFF FEAT §3j `agg-garage-graph-graphql.md` (§0 Wave Index resolved W06 → §3j — trust bundle, không fallback full-file read).

> **SDL field update v7.82 (GAP-W06-GW-07)**: `StockLedgerAtDateRow` bổ sung field `mainUnitDisplayName: String` (nullable, additive, BFF enrichment qua `gf-erp-mdm directory=UNIT`). FE **PHẢI** include field này trong query string `stockLedgerAtDate` và render cột "ĐVT chính" bằng `mainUnitDisplayName` (tên hiển thị tiếng Việt, vd "Cái") thay vì `mainUnitCode` (mã thô, vd "PCS") — theo đúng Figma verbatim (§5 cột "ĐVT chính"). Nếu `mainUnitDisplayName` null (enrichment miss) → fallback hiển thị `mainUnitCode`.

### 6.2 REST endpoints consumed direct (bypass BFF)

_(không có — mọi truy vấn qua BFF GraphQL passthrough §3j)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (rows + aggregates) | TanStack Query | — | `['stockLedgerAtDate', { asOfDate, warehouseIds, keyword, page, size }]` | AC-1, AC-2, AC-3 |
| Filter state (search/kho/ngày/page) | URL search params (route state) | `src/routes/inventory-stock/reports/at-date.tsx` loader/search (canonical route file — GAP-W06-GW-06) | `?asOfDate=&warehouseIds=&keyword=&page=` | AC-4 |
| Export loading state | local component state | `useState` trong `stock-report-list.tsx` | `isExporting` | AC-8 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory-stock/reports/at-date` (canonical — xem GAP-W06-GW-06, sửa từ `/inventory/stock-report` NEED CONFIRMATION) | `StockReportListPage` | `loader({ search }) => prefetch stockLedgerAtDate` | route guard chung module Tồn kho (không riêng feature) | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-stock-report/components/list/` | `stock-report-list.tsx` | NEW | compose page-header + main-filter + data-table | ~180 | AC-1 – AC-9 |
| `src/features/inventory-stock-report/components/list/` | `stock-report-row-action.tsx` | NEW | Router Link | ~30 | AC-7 |
| `src/features/inventory-stock-report/components/list/` | `stock-report-total-row.tsx` | NEW | 4-cell footer (AP-STK-2) | ~40 | AC-2 |
| `src/features/inventory-stock-report/hooks/` | `use-stock-ledger-at-date.ts` | NEW | TanStack Query wrapper | ~40 | AC-1, AC-4 |
| `src/features/inventory-stock-report/hooks/` | `use-stock-ledger-at-date-export.ts` | NEW | imperative fetch + download | ~35 | AC-8 |
| `src/features/inventory-stock-report/types/` | `stock-ledger.types.ts` | NEW | TypeScript types (mirror SDL) | ~25 | — |
| `src/api/graphql/` | `stock-ledger-at-date.graphql` | ADDITIVE | persisted query | ~25 | AC-1 |
| `src/api/graphql/` | `stock-ledger-at-date-export.graphql` | ADDITIVE | persisted query | ~15 | AC-8 |
| `src/api/generated/` | codegen output | AUTO-GEN | codegen | — | — |
| `src/routes/` | `inventory-routes.tsx` | MODIFY (add route + sub-nav tab) | createBrowserRouter | ~15 | AC-1 |
| `tests/` | `tests/features/inventory-stock-report/stock-report-list.test.tsx` | NEW | Vitest + RTL | ~150 | AC-1 – AC-9 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL §3j stable)

S6  UI wire (web)
    Entry: BFF S5 SDL §3j stable + Figma wave06-stk-list-v2.md confirmed
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + state (filter/pagination) + export handler | features + routes + api | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-001` | CORNERSTONE | render `valueOnHand` là số duy nhất, KHÔNG label "Tạm tính" | `stock-report-list.tsx` cell renderer | AC-3 | BE final compute |
| `BR-STKV2-005` | CORNERSTONE | export đúng cột dữ liệu, không cột "Thao tác"; disable khi 0 dòng | `stock-report-list.tsx::onExport` | AC-8 | BE final generate file |
| `BR-STKV2-007` | CORNERSTONE | trust BE-filtered rows, không tự ẩn/hiện theo SL/GT | `stock-report-list.tsx` (no client filter) | AC-6 | BE primary enforce |
| `BR-STKV2-015` | CORNERSTONE | route accessible ngang nhau cho `garage-owner` + `accountant`, không gate riêng | route guard chung | AC-9 | non-UI-differentiated |

> **Primary enforcement** = BE tier (`features/be/FEAT-STK-LIST-V2.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | mount route, default filter (hôm nay, tất cả kho) |
| AC-2 | UI (table structure) | test-ui | 8 cột đúng thứ tự + dòng Tổng geometry 4-cell |
| AC-3 | UI (value render) | test-ui | không có text "Tạm tính", format số/tiền đúng |
| AC-4 | UI (filter interaction) | test-ui | debounce search, multi-select kho, single date |
| AC-5 | UI (data render) | test-ui | cùng mã khác kho = 2 dòng riêng |
| AC-7 | UI (navigation) | test-ui | click "Xem lịch sử" → route Thẻ kho đúng params |
| AC-8 | UI (export flow) | test-ui | loading state, disabled khi rỗng, download trigger |
| AC-9 | UI (RBAC negative) | test-isolation | dual persona render giống hệt |
| (smoke) | E2E happy path | test-e2e | Playwright: filter → xem bảng → xem lịch sử → xuất file |

## 11. i18n & a11y

### 11.1 i18n keys

_(Không dùng i18next cho feature này — fixed VN labels theo Figma verbatim, xem §4.3. `i18n_keys: []`.)_

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` title + landmark cho page content | manual QA |
| AC-2 | `<th scope="col">` cho mọi header cell | table semantics |
| AC-4 | Focus order: Search → Kho → Ngày báo cáo → bảng | manual QA |
| AC-7 | Accessible name riêng cho mỗi link "Xem lịch sử" (kèm mã/kho) | tránh N link cùng text mơ hồ |
| AC-8 | `aria-busy` khi export loading | screen reader announce |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-STK-LIST-V2.md` | DRAFT (parallel authoring — agent `exec-spec-be-stk-list-v2`) | BR primary enforcement, `gf-inventory` REST contract source (§3j downstream) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-STK-LIST-V2.md` | DRAFT (parallel authoring — agent `exec-spec-bff-stk-list-v2`) | GraphQL ops consumed §6.1 (`stockLedgerAtDate` + export) |
| Mobile | `Execution/wave-specs/W06/Product/features/mobile/FEAT-STK-LIST-V2.md` | DRAFT (parallel authoring, mobile-only trong Stock V2 module theo scope guard §Metadata source FEAT) | Mirror data source, KHÔNG mirror cột "Thao tác"/"Xem lịch sử" (out of mobile scope) |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF/Mobile files (`0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48`).

## 13. References

- **Source**: [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) v10
- **Paired BE**: [`features/be/FEAT-STK-LIST-V2.md`](../be/FEAT-STK-LIST-V2.md)
- **Paired BFF**: [`features/bff/FEAT-STK-LIST-V2.md`](../bff/FEAT-STK-LIST-V2.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.1
- **Figma spec**: [`Product/ux/figma-web/wave06-stk-list-v2.md`](../../../../../Product/ux/figma-web/wave06-stk-list-v2.md)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | Delivery Authority (warm-up --fix W06) | GAP-W06-GW-06 (sdl-drift, RESOLVED): §5.1 + §6.4 route path sửa từ `/inventory/stock-report` (NEED CONFIRMATION) → canonical `/inventory-stock/reports/at-date` (ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2); §6.3 route file glob đồng bộ `src/routes/inventory-stock/reports/at-date.tsx`. GAP-W06-GW-07 (sdl-drift, RESOLVED): §6.1 thêm note field mới `mainUnitDisplayName: String` (nullable, SDL v7.82) trên `StockLedgerAtDateRow` — FE dùng field này render cột "ĐVT chính" thay `mainUnitCode`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-STK-LIST-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map per AC-ID (9/9 AC covered), §4 visual fidelity + state + i18n (fixed VN, no i18next) + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (screens/components reuse priority/GraphQL consumed §3j/state/cross-tier pair). Source FEAT chỉ audit. |
