---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-DETAIL-V2.md"
source_version: 16
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-DETAIL-V2"
source_feat_sha: "1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7"
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
change_type: "brownfield-enhancement"
consumes_backend_feats: ["FEAT-STK-DETAIL-V2"]
consumes_bff_feats: ["FEAT-STK-DETAIL-V2"]
i18n_keys: []                                          # Fixed VN labels — xem §4.3 (KHÔNG dùng i18next cho domain kho V2, đồng bộ FEAT-STK-LIST-V2/FEAT-IP-VIEW-V2 W06)
screens_touched: ["src/features/stock-reports/pages/stock-card-detail-page.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-stk-detail-v2.md (node 14507:89272 — Xem lịch sử tồn kho / thẻ kho full-page)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a-bundle-driven-v6"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-DETAIL-V2 (FE Web): Xem lịch sử tồn kho (thẻ kho)

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-DETAIL-V2` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/stock-reports/pages/stock-card-detail-page.tsx` |
| Cross-tier consume | BE: `FEAT-STK-DETAIL-V2` (gf-inventory) \| BFF: passthrough §3j `agg-garage-graph-graphql.md` (không có FEAT bff-tier riêng cho module Stock V2 Reports) |
| Platform scope | **Web GMS only trong W06**. App Garage không có màn thẻ kho (chỉ `FEAT-STK-LIST-V2`). |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-DETAIL-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) |
| Source version | v16 |
| Source SHA | `1b608bbac4df14fde0ec338da41bc9d170899ebca5184e37df1cf6110bae55a7` |
| Generated at | 2026-07-31T06:31:29+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần truy vết chính xác dòng chảy nhập/xuất và số dư tồn của một mã sản phẩm tại một kho cụ thể trong một khoảng ngày, phục vụ đối soát kiểm kê và giải trình số liệu khi có sai lệch. Thẻ kho là báo cáo drill-down từ báo cáo tồn tổng quan, hiển thị realtime từng phiếu nhập/xuất đã ghi sổ kèm số dư chạy (running balance) theo đúng trình tự thời gian. Giá trị các dòng xuất phản ánh đúng phương pháp Bình quân gia quyền cuối kỳ (BQGQ) sau khi PRC đã chạy, giúp người dùng nắm rõ nguyên nhân biến động giá trị tồn kho theo từng giao dịch.

## 2. Trách nhiệm FE Web (garage-web)

- Route full-page riêng "Xem lịch sử tồn kho" (thẻ kho) — điều hướng (router push) từ nút "Xem lịch sử" trên `FEAT-STK-LIST-V2`, **KHÔNG phải modal/overlay**; nhận `productCode` + `warehouseCode` của dòng nguồn qua route params, tự fetch + render, KHÔNG cho user tự chọn mã.
- User flow chính: mount page → auto-fill filter khoảng ngày (range-picker gộp, mặc định tháng hiện tại) → fetch `stockCardDetail` → render bảng running theo phiếu + dòng Tổng → user có thể đổi khoảng ngày (refetch), click "Số phiếu" để chuyển màn chi tiết phiếu, bấm "Xuất file" để tải `.xlsx`, bấm "Đóng" để quay lại `FEAT-STK-LIST-V2`.
- State machine UI: `idle → loading` (mount/refetch) → `success` (bảng + Tổng có dữ liệu) hoặc `empty` (EC-3 — bảng phiếu rỗng, dòng Tổng vẫn hiện) hoặc `error` (toast, giữ nguyên filter hiện tại).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.4 Bước 1): trước MỌI UI task, scan `customs/` → `share/` → `ui/` theo thứ tự ưu tiên. Reuse foundation từ layer cao nhất có component fit (§5.2 tra `.claude/references/web-component-registry.yaml` — bundle §G.X báo KG `implementation.components` rỗng, dùng registry canonical thay thế). Chỉ build-new khi cả 3 layer không match.
- **Figma spec là visual SSOT**: layout, color tokens, screen enumeration, screenshot manifest theo `Product/ux/figma-web/wave06-stk-detail-v2.md` (node `14507:89272`, xem `figma_refs:` frontmatter). §4/§5 references cross-ref figma sections tương ứng. Coverage gap đã biết (subtitle non-UI, default date range không hiện trong ảnh tĩnh, empty state không có frame riêng, phân quyền không có control) — xem §3/§4 ghi chú tại từng AC liên quan.
- Consume GraphQL query `stockCardDetail` (bảng dữ liệu + context + opening + aggregates) và `stockCardDetailExport` (xuất `.xlsx`) từ BFF `agg-garage-graph` §3j.
- RBAC render: `garage-owner` và `accountant` quyền **ngang nhau** trên toàn bộ màn — KHÔNG hide/disable control theo persona (route guard chỉ check đã đăng nhập + đúng tenant).

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage: 8/8 AC-ID (AC-1 → AC-8), cover đủ trong §3.

### Cluster A — Mở màn thẻ kho (full-page navigation + filter)

#### AC-1 → Điều hướng full-page + auto-fill filter khoảng ngày

- **Khi**: user click nút "Xem lịch sử" trên 1 dòng của `FEAT-STK-LIST-V2`.
- **FE phải**: router-navigate (KHÔNG mở Dialog/Drawer/overlay — spec §8 Trap "No modal when spec says page" áp dụng, xem figma §Trap nếu có) sang route riêng, truyền `productCode` + `warehouseCode` của dòng nguồn qua route params; mount page header "Xem lịch sử tồn kho" + subtitle "Tra cứu phát sinh nhập/xuất và biến động tồn của một mã sản phẩm trong kho." (đây là ghi chú nghiệp vụ tĩnh, KHÔNG phải control tương tác — bundle §G.Y coverage gap xác nhận); auto-fill 1 range-picker gộp "Từ ngày - Đến ngày" mặc định **[ngày 01 tháng hiện tại, ngày cuối tháng hiện tại]** (behaviour lấy từ AC-1 text, KHÔNG hardcode theo mẫu tĩnh trong ảnh Figma — bundle §G.Y coverage gap ghi rõ); **KHÔNG render** chip/filter Kho trên UI (kho xác định ngầm qua `warehouseCode` route param, không hiển thị control); render nút "Xuất file" + "Đóng".
- **State transition**: `idle` → `loading` (mount, gọi `stockCardDetail`) → `success` (bảng + Tổng) hoặc `empty` (AC-3/EC-3).
- **Component**: page-level `StockCardDetailPage` (NEW) dùng `share/layouts/page-header` cho header + action "Đóng"/"Xuất file"; range-picker dùng `share/date-picker/date-range-picker` (NEW instance, filter state local page).
- **GraphQL op**: `stockCardDetail(input: StockCardDetailInput!)` — `productCode`, `warehouseCode` cố định từ route param; `fromDate`/`toDate` từ filter state.
- **i18n**: fixed VN label ("Xem lịch sử tồn kho", subtitle, "Từ ngày - Đến ngày", "Xuất file", "Đóng") — không qua i18next (xem §4.3).
- **a11y**: heading `<h1>` "Xem lịch sử tồn kho" là focus target khi route mount (announce cho screen reader khi điều hướng).
- **Nút "Đóng"**: click → `router.navigate` quay lại route `FEAT-STK-LIST-V2` (giữ nguyên filter cũ của màn nguồn nếu router state hỗ trợ) — **KHÔNG phải đóng overlay**.
- **Ref**: paired BFF §3j `stockCardDetail`, Figma node `13575:223764` (Screen 1) — xem §5.3.

### Cluster B — Bảng thẻ kho (running balance)

#### AC-2 → Cột hiển thị bảng thẻ kho

- **Khi**: bảng render với dữ liệu từ `stockCardDetail.content[]`.
- **FE phải**: render `share/tables/table` (data-table) với cột theo đúng thứ tự: **STT · Kho · Mã SP nội bộ · Tên SP nội bộ · Ngày nhập/xuất · Số phiếu · Loại phiếu · ĐVT · Đầu kỳ (SL, Giá trị) · Nhập kho (SL, Giá trị) · Xuất kho (SL, Giá trị) · Cuối kỳ (SL, Giá trị)**. Cột **"Số phiếu"** render dạng `share/navigates/link` — click → `router.navigate` (KHÔNG mở tab mới) sang màn chi tiết phiếu tương ứng: `slipType` là phiếu nhập → route `FEAT-IR-DETAIL-V2`; `slipType` là phiếu xuất → route `FEAT-ID-DETAIL-V2` — map **theo field `slipType`** trả về từ BE, **KHÔNG parse tiền tố mã phiếu** (`slipCode`).
- **State transition**: (kế thừa AC-1) `success` khi `content[].length > 0`.
- **Component**: `share/tables/table` + `share/navigates/link` cho cột Số phiếu.
- **GraphQL op**: `stockCardDetail.content[]` — field `movementDate`, `slipCode`, `slipType`, `openingQty/Value`, `inboundQty/Value`, `outboundQty/Value`, `closingQty/Value` (SDL `StockCardDetailRow`, bundle §G §3j.1).
- **i18n**: header label fixed VN — "STT", "Kho", "Mã SP nội bộ", "Tên SP nội bộ", "Ngày nhập/xuất", "Số phiếu", "Loại phiếu", "ĐVT", "Đầu kỳ", "Nhập kho", "Xuất kho", "Cuối kỳ" (2 cột con SL/Giá trị mỗi nhóm).
- **a11y**: table có `<caption>`/`aria-label` "Bảng thẻ kho"; link "Số phiếu" có `aria-label` mô tả đích đến (vd "Xem chi tiết phiếu {slipCode}").
- **Ref**: Figma section "bảng thẻ kho + hàng Tổng" (screenshot `13575-228083.png`) + cột "Số phiếu" link brand-blue (screenshot `13575-228120.png`) + cột "Mã SP nội bộ" text thường (screenshot `13575-228099.png`) — xem §5.3.

#### AC-3 → Mỗi dòng = 1 phiếu, chạy running (kèm empty state EC-3)

- **Khi**: bảng render.
- **FE phải**: render mỗi row = 1 `StockCardDetailRow` (1 phiếu nhập/xuất đã ghi sổ) — **KHÔNG tự tính running client-side**; BE đã guarantee `openingQty/Value` dòng n = `closingQty/Value` dòng n-1 (BE compute trong RAM trước khi paginate, per bundle §G v7.79 note — pagination-safe). Khi `content[]` rỗng (không có biến động trong khoảng — EC-3): FE render **empty state** dùng `share/emptys/no-data` với text verbatim **"Không có dữ liệu"** (KHÔNG dùng registry `ERR-CMN-010` wording "Không có kết quả phù hợp" — đây là UI empty-state per feature spec, không phải error code) tại vùng bảng phiếu; **dòng Tổng vẫn hiển thị** (xem AC-6) với Đầu kỳ = Cuối kỳ.
- **Component**: `share/tables/table` (rows) + `share/emptys/no-data` (empty state).
- **GraphQL op**: `stockCardDetail.content[]` (rỗng khi EC-3, nhưng `opening`/`aggregates` vẫn non-null).
- **a11y**: empty state có `role="status"` để screen reader thông báo khi bảng rỗng sau filter change.
- **Ref**: bundle §G.Y coverage gap — EC-3 không có frame riêng trong Figma node `14507:89272`, dùng `share/emptys/no-data` chuẩn baseline.

#### AC-4 → Đầu kỳ dòng đầu

- **Khi**: bảng render, dòng đầu tiên trong `content[]`.
- **FE phải**: render `openingQty`/`openingValue` của row đầu **trực tiếp từ field trả về** (BE đã seed từ ledger point-lookup ≤ (fromDate−1) của (mã+kho), 0 nếu chưa có biến động trước đó — logic ở BE, FE không tự tính). Baseline này cũng khớp `PagedStockCardDetailData.opening` top-level block (context tổng, dùng cho AC-1 khi cần hiển thị riêng ngoài bảng nếu Figma yêu cầu).
- **Component**: (kế thừa `share/tables/table` từ AC-2).
- **GraphQL op**: `stockCardDetail.content[0].openingQty/Value` hoặc `stockCardDetail.opening.{openingQty,openingValue}`.
- **Ref**: SDL `StockCardDetailOpening` (bundle §G §3j.1).

#### AC-5 → Giá trị theo BQGQ

- **Khi**: mã sản phẩm **chưa** chạy tính giá BQGQ (PRC).
- **FE phải**: render đúng số nguyên trạng BE trả — **KHÔNG tự thêm chữ "Tạm tính"**, KHÔNG convert 0 thành placeholder/dấu gạch gây hiểu nhầm. Khi chưa chạy BQGQ: `outboundValue` = 0 (giá vốn chưa chốt) trong khi `openingValue`/`inboundValue` là số thật (đơn giá nhập đã biết) → `closingValue` = `openingValue + inboundValue − 0`. Khi đã chạy: mọi giá trị là số thực theo giá vốn BQGQ — hiển thị y hệt.
- **Component**: (kế thừa `share/tables/table`).
- **GraphQL op**: `stockCardDetail.content[].{inboundValue, outboundValue, closingValue}`.
- **Ref**: BR-STKV2-014 (BE primary), FE chỉ render raw.

#### AC-6 → Dòng tổng

- **Khi**: bảng render (kể cả khi `content[]` rỗng — EC-3).
- **FE phải**: render dòng Tổng cuối bảng (footer row hoặc summary bar) từ `stockCardDetail.aggregates` — **Đầu kỳ** (đầu khoảng, `openingQty/Value`), **Σ Nhập** (`totalInboundQty/Value`), **Σ Xuất** (`totalOutboundQty/Value`), **Cuối kỳ** (cuối khoảng, `closingQty/Value`) — mỗi cụm gồm SL + Giá trị. Block `aggregates` **luôn non-null** (BE trả kể cả empty scope) — FE luôn render dòng Tổng, không điều kiện theo `content.length`.
- **Component**: footer row của `share/tables/table` hoặc summary bar tách riêng.
- **GraphQL op**: `stockCardDetail.aggregates` (SDL `StockCardDetailAggregates`, bundle §G §3j.1).
- **Ref**: Figma screenshot `13575-228083.png` (bảng + hàng Tổng).

### Cluster C — Xuất file & phân quyền

#### AC-7 → Xuất file

- **Khi**: user click nút "Xuất file".
- **FE phải**: gọi GraphQL query `stockCardDetailExport` với input hiện tại (`productCode`, `warehouseCode`, `fromDate`, `toDate` theo filter đang áp dụng); nhận `StockReportExportPayload{contentType, fileName, contentBase64, contentLength}`; decode base64 client-side thành `Blob` (`contentType = application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) → trigger browser download qua `<a download>` với `fileName` **lấy từ response** (KHÔNG tự đặt tên); file phải khớp mẫu chuẩn `Báo cáo thẻ kho.xlsx` (sheet/cột/thứ tự/định dạng số/header nhóm — trách nhiệm BE template binding, FE chỉ trigger + download).
- **State transition**: nút chuyển `loading` (disable + spinner) trong lúc gọi export — tránh double-click; lỗi → toast `ERR-CMN-007` pattern (xem §4.6).
- **Component**: `share/exports/export-excel` (nút Xuất file, layer share).
- **GraphQL op**: `stockCardDetailExport(input: StockCardDetailInput!)` (query, W06-STK-EX3).
- **Ref**: BR-STKV2-005, Excel template `Product/ux/assets/Báo cáo thẻ kho.xlsx`.

#### AC-8 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **FE phải**: **KHÔNG** hide/disable bất kỳ control nào của màn thẻ kho theo persona — cả `garage-owner` và `accountant` thấy route + render đúng y hệt nhau (bảng, dòng Tổng, nút Xuất file, nút Đóng). Route guard chỉ check "đã đăng nhập + đúng tenant" — KHÔNG check permission code role-specific riêng cho màn này.
- **Component**: route guard config (không thuộc 1 component UI cụ thể).
- **Ref**: bundle §G.Y coverage gap — AC-8 là non-UI AC, không có control Figma tương ứng; enforce ở route guard / permission hook layer.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-stk-detail-v2.md` node `14507:89272` (screens `13575:223764` full page + `13575:226566` full-width table variant). KHÔNG re-invent layout/spacing/color.
- Design tokens: `bg-accent`, `text-foreground`, `text-muted-foreground`, `text-primary` (bundle §G.Y detected tokens) — map qua `tailwind.config.js`/`src/index.css`, KHÔNG hardcode hex. `text-primary` dùng cho link "Số phiếu" (brand-blue `#0052ff`); `text-foreground` cho text thường (vd cột "Mã SP nội bộ", không còn link theo CR 2026-07-31); `text-muted-foreground` cho subtitle + label phụ.
- Responsive: table full-width scroll ngang khi < 2160px (Screen 2 `13575:226566` là frame full 16 cột width 2160px).
- Mỗi visual AC (AC-1 header/subtitle, AC-2 cột bảng, AC-6 dòng Tổng) cross-ref figma screenshot tương ứng — xem §5.3.

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | empty | error`. `loading` → skeleton/spinner trên bảng; `empty` → `share/emptys/no-data` "Không có dữ liệu" (bảng phiếu) + dòng Tổng vẫn hiện; `error` → toast, filter giữ nguyên để user retry.
- Error → render theo `display mode` (TOAST) — xem §4.6 error code mapping.
- KHÔNG silent fail — mọi lỗi query/export phải reach UI (toast) hoặc log.

### 4.3 i18n + a11y

- **i18n policy (per-wave decision)**: domain Stock V2 W06 **KHÔNG dùng i18next** — mọi label hardcode tiếng Việt inline (đồng bộ `FEAT-STK-LIST-V2`/`FEAT-IP-VIEW-V2` cùng module, `add_fields.i18n_keys: []`). `i18n_keys` frontmatter để trống theo policy override single-locale (VN only).
- a11y: bảng có `aria-label`; link "Số phiếu" có `aria-label` mô tả đích; nút icon-only (nếu có) có `aria-label`; keyboard nav Tab qua range-picker → nút Xuất file → nút Đóng; Enter submit filter (nếu form-based), Escape không applicable (không có modal).
- Semantic HTML — table dùng `<table>` semantics (qua `share/tables/table`), không `<div>` giả bảng.

### 4.4 RBAC render + feature flag

- Không có feature flag riêng cho màn thẻ kho (không thuộc `Inventory:InventoryV2` gate BFF-side theo mô tả §G, nhưng route vẫn nằm sau route-level auth guard chung của app).
- Persona check: **symmetric** — `garage-owner` và `accountant` cùng render, cùng action (AC-8). KHÔNG show-then-disable.
- Route guard: redirect nếu chưa đăng nhập hoặc sai tenant; KHÔNG có gate theo role cho riêng màn này.

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (`gf-inventory`, xem paired `be/FEAT-STK-DETAIL-V2.md §9` khi được author). FE chỉ:
  - Render raw số liệu BE trả (Đầu kỳ/Nhập/Xuất/Cuối kỳ, SL+Giá trị) — không tự tính, không tự làm tròn thêm.
  - Disable nút "Xuất file" trong lúc export đang chạy (tránh double-submit).
  - Toast khi query/export lỗi.

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-CMN-007` (hệ thống bận) | TOAST | toast global | AC-1 (query fail), AC-7 (export fail) |
| — (empty result, không phải error) | `EMPTY_STATE` (verbatim "Không có dữ liệu", feature-specific — KHÔNG dùng wording `ERR-CMN-010`) | `share/emptys/no-data` | AC-3 (EC-3) |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `StockCardDetailPage` | `/inventory-stock/reports/card/$productCode` (params: `productCode` path param, `warehouseCode` query — canonical, ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2; sửa từ `/inventory/stock-report/card` NEED CONFIRMATION per GAP-W06-GW-06, `/warm-up garage-web --fix` W06 Phase B) | NEW | `13575:223764` (Screen 1 full page), `13575:226566` (Screen 2 full-width table) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |
| `StockLedgerAtDatePage` (`FEAT-STK-LIST-V2`) | (paired, không thuộc scope file này) | MODIFY (thêm entry point "Xem lịch sử" → navigate) | — | AC-1 (entry point) |

### 5.2 Components new/modified

> **Reuse pattern column** MUST reference priority order `customs/` > `share/` > `ui/`. Component Inventory tra qua `.claude/references/web-component-registry.yaml` (canonical — bundle §G.X báo KG `implementation.components` rỗng nên dùng registry thay thế).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, subtitle, actions }` | — | **Priority 2 — share/** (registry `page-header`, layer share) | AC-1 |
| `DateRangePicker` | `src/components/share/date-picker/date-range-picker.tsx` | REUSE | `{ value, onChange, defaultValue }` | local (filter) | **Priority 2 — share/** (registry `form-date-range`, layer share) | AC-1 |
| `Table` | `src/components/share/tables/table.tsx` | REUSE | `{ columns, data, footer }` | — | **Priority 2 — share/** (registry `data-table`, layer share) | AC-2, AC-3, AC-4, AC-5, AC-6 |
| `Link` | `src/components/share/navigates/link.tsx` | REUSE | `{ to, params, children, aria-label }` | — | **Priority 2 — share/** (registry `link`, layer share) | AC-2 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ text }` | — | **Priority 2 — share/** (registry `no-data`, layer share) | AC-3 |
| `ExportExcelButton` | `src/components/share/exports/export-excel.tsx` | REUSE | `{ onExport, loading }` | loading | **Priority 2 — share/** (registry `excel-export`, layer share) | AC-7 |
| `Button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant, onClick }` | — | **Priority 2 — share/** (registry `primary-button`, layer share) | AC-1 (nút Đóng) |
| `StockCardDetailPage` (kebab-case file `stock-card-detail-page.tsx`) | `src/features/stock-reports/pages/stock-card-detail-page.tsx` | NEW | route loader `{ productCode, warehouseCode }` | filter (fromDate/toDate), query state | **Build-new** — justification: page-level container ghép các share component trên, không có component tương đương ở customs/share/ui theo §G.X inventory scan | AC-1 – AC-8 |
| `StockCardDetailTable` (feature-local wrapper) | `src/features/stock-reports/components/stock-card-detail-table.tsx` | NEW | `{ rows, aggregates, isEmpty }` | — | **Build-new** — justification: cột spec đặc thù (12 cột + link Số phiếu + footer Tổng) không match generic `share/tables/table-normal`; wraps `share/tables/table` per Priority 2 base | AC-2, AC-3, AC-6 |

### 5.3 Design tokens & Figma refs

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `text-primary` | `tailwind.config.js` | Link "Số phiếu" (brand-blue) | AC-2 |
| `text-foreground` | tokens | Text thường (Mã SP nội bộ, nội dung ô) | AC-2, AC-4, AC-5 |
| `text-muted-foreground` | tokens | Subtitle page header, label phụ | AC-1 |
| `bg-accent` | tokens | Highlight hàng/section (Tổng hoặc hover row) | AC-6 |

**Figma coverage gaps (acknowledged, per bundle §G.Y)**:
- AC-1: subtitle "Tra cứu phát sinh nhập/xuất và biến động tồn của một mã sản phẩm trong kho." là ghi chú nghiệp vụ tĩnh, KHÔNG phải control tương tác.
- AC-1: default khoảng ngày "tháng hiện tại" là behaviour lấy từ FEAT AC-1 — Figma chỉ có mẫu tĩnh "12/12/2024 - 12/12/2026", KHÔNG hardcode theo ảnh.
- AC-3/EC-3: empty state (illustration + "Không có dữ liệu") không có frame riêng trong node `14507:89272` — dùng `share/emptys/no-data` baseline; dòng Tổng vẫn phải render.
- AC-8: phân quyền không có control Figma tương ứng — enforce ở route guard, không phải UI element.

> **Figma source-of-truth**: visual/micro-interaction/responsive đều theo Figma. Không re-invent.

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `stockCardDetail` | query | `src/features/stock-reports/api/stock-card-detail.graphql` | `['stock-card-detail', { productCode, warehouseCode, fromDate, toDate, page, size }]` | `StockCardDetailRowFragment` | AC-1 – AC-6 |
| `stockCardDetailExport` | query | `src/features/stock-reports/api/stock-card-detail-export.graphql` | — (one-shot, không cache) | — | AC-7 |

> Cả 2 op phải tồn tại verbatim ở BFF §3j `agg-garage-graph-graphql.md` (bundle §G — resolved qua §0 Wave Index W06 → §3j, đã trust). Reviewer item #16 enforce.

> **SDL field update v7.82 (GAP-W06-GW-07)**: `StockCardDetailContext` bổ sung field `mainUnitDisplayName: String` (nullable, additive, BFF enrichment qua `gf-erp-mdm directory=UNIT`). FE **PHẢI** include field này trong query string `stockCardDetail` và render cột "ĐVT" bằng `mainUnitDisplayName` (tên hiển thị tiếng Việt, vd "Cái") thay vì `mainUnitCode` (mã thô) — theo đúng Figma verbatim. Nếu `mainUnitDisplayName` null (enrichment miss) → fallback hiển thị `mainUnitCode`.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

Không áp dụng — mọi data fetch qua BFF GraphQL (§6.1).

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state | TanStack Query | — | `['stock-card-detail', filters]` | AC-1 – AC-6 |
| Filter state (fromDate/toDate) | Local component state hoặc TanStack Router search params | `stock-card-detail-page` | `{ fromDate, toDate }` | AC-1 |
| Export loading | Local component state | `stock-card-detail-page` | `isExporting` | AC-7 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory-stock/reports/card/$productCode` (canonical — xem GAP-W06-GW-06, params `productCode` path + `warehouseCode` query, sửa từ `/inventory/stock-report/card` NEED CONFIRMATION) | `StockCardDetailPage` | `loader({ params }) => prefetch stockCardDetail` | Auth: đã đăng nhập tenant (KHÔNG role-specific — AC-8) | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/stock-reports/pages/` | `stock-card-detail-page.tsx` | NEW | share/layouts/page-header + share/date-picker/date-range-picker | ~180 | AC-1, AC-8 |
| `src/features/stock-reports/components/` | `stock-card-detail-table.tsx` | NEW | wraps share/tables/table | ~140 | AC-2, AC-3, AC-6 |
| `src/features/stock-reports/hooks/` | `use-stock-card-detail.ts` | NEW | TanStack Query wrapper | ~35 | AC-1 – AC-6 |
| `src/features/stock-reports/hooks/` | `use-stock-card-detail-export.ts` | NEW | TanStack Query wrapper (lazy/manual trigger) | ~30 | AC-7 |
| `src/features/stock-reports/interfaces/` | `stock-card-detail.types.ts` | NEW | TypeScript types (mirror SDL) | ~30 | — |
| `src/api/graphql/` | `stock-card-detail.graphql`, `stock-card-detail-export.graphql` | ADDITIVE | persisted query | ~30 | AC-1, AC-7 |
| `src/config/route.ts` | `ROUTES.STOCK_CARD_DETAIL` | ADDITIVE | typed route constant | ~5 | AC-1 |
| `src/routes/inventory-stock/reports/card/` | `$productCode.tsx` (canonical route file — GAP-W06-GW-06, sửa từ `stock-report.card.tsx`) | NEW | TanStack Router | ~20 | AC-1 |
| `tests/` | `tests/features/stock-reports/stock-card-detail-page.test.tsx` | NEW | Vitest + RTL | ~120 | AC-1 – AC-8 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL §3j stockCardDetail + stockCardDetailExport resolver stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave06-stk-detail-v2.md)
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Route + page + table + filter + export wire | features/stock-reports + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-001` | CORNERSTONE | render SL tồn realtime nguyên trạng BE | `stock-card-detail-table.tsx` | AC-4 | BE final source |
| `BR-STKV2-002` | CORNERSTONE | render Giá trị số/0 (không "Tạm tính") | `stock-card-detail-table.tsx` | AC-5 | BE final enforce |
| `BR-STKV2-005` | NORMAL | export `.xlsx` bám mẫu `Báo cáo thẻ kho.xlsx` | `use-stock-card-detail-export.ts` | AC-7 | BE template binding |
| `BR-STKV2-012/013/014` | CORNERSTONE | thẻ kho 1 mã+kho, running per phiếu, đầu kỳ tra sổ tồn, dòng Tổng | `stock-card-detail-table.tsx` | AC-1, AC-3, AC-4, AC-6 | BE compute, FE render |
| `BR-STKV2-015` | CORNERSTONE | phân quyền symmetric | `stock-card-detail-page.tsx` (route guard) | AC-8 | conditional render KHÔNG áp dụng — cả 2 role render giống nhau |

> **Primary enforcement** = BE tier (`features/be/FEAT-STK-DETAIL-V2.md §9`, khi được author).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI (navigation) | test-ui | click "Xem lịch sử" → full-page, KHÔNG modal; default date range = tháng hiện tại |
| AC-2 | UI | test-ui | đủ 12 cột đúng thứ tự; link "Số phiếu" điều hướng đúng theo `slipType` |
| AC-3 | UI (running + empty state) | test-ui | running balance liên tục; EC-3 empty state "Không có dữ liệu" + Tổng vẫn hiện |
| AC-4 | UI (data) | test-ui | Đầu kỳ dòng đầu khớp sổ tồn |
| AC-5 | UI (negative validation display) | test-ui | GT Xuất=0 khi chưa BQGQ, không hiện "Tạm tính" |
| AC-6 | UI (aggregate) | test-ui | dòng Tổng luôn hiện, kể cả empty |
| AC-7 | UI (export) | test-ui | download file đúng tên + đúng mẫu |
| AC-8 | UI (RBAC symmetric) | test-ui + test-isolation | dual persona — cả 2 render giống nhau |
| (smoke) | E2E happy path | test-e2e | Playwright — từ STK-LIST-V2 → Xem lịch sử → thẻ kho → Đóng |

## 11. i18n & a11y

### 11.1 i18n keys

Không áp dụng — domain Stock V2 W06 dùng fixed VN labels (§4.3), `i18n_keys: []` frontmatter.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Focus vào `<h1>` page title khi route mount | screen reader announce điều hướng |
| AC-2 | Link "Số phiếu" có `aria-label` mô tả đích đến | keyboard + screen reader |
| AC-3 | Empty state có `role="status"` | announce khi bảng rỗng sau filter change |
| AC-7 | Nút "Xuất file" có `aria-busy` khi loading | tránh double-click qua keyboard/AT |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-STK-DETAIL-V2.md` | chưa author tại thời điểm spawn này | BR primary enforcement, contract source (`gf-inventory` W06-STK-Q3/EX3) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-STK-DETAIL-V2.md` (`consumes_bff_feats: ["FEAT-STK-DETAIL-V2"]`) | ACTIVE candidate (DRAFT) | GraphQL ops `stockCardDetail`/`stockCardDetailExport` consumed §6.1, passthrough §3j `agg-garage-graph-graphql.md` |
| Mobile | N/A | N/A | Platform scope Web GMS only trong W06 — mobile không có màn thẻ kho |
| FE Web (paired) `FEAT-STK-LIST-V2` | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-LIST-V2.md` | chưa author tại thời điểm spawn này | Entry point "Xem lịch sử" + route base sync (§5.1 NEED CONFIRMATION) |

**Source ID consistency** (item 18): `source_feat_sha` phải identical với BE tier khi được author.

## 13. References

- **Source**: [`Product/features/FEAT-STK-DETAIL-V2.md`](../../../../../Product/features/FEAT-STK-DETAIL-V2.md) v16
- **Paired BE**: [`features/be/FEAT-STK-DETAIL-V2.md`](../be/FEAT-STK-DETAIL-V2.md)
- **Paired FE (STK-LIST-V2)**: [`features/fe-web/FEAT-STK-LIST-V2.md`](FEAT-STK-LIST-V2.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-STOCK-V2.md) §3.3
- **Business Rules**: [`Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md`](../../../../../Product/business-rules/BR-GF-INVENTORY-STOCK-V2.md)
- **Figma spec**: [`Product/ux/figma-web/wave06-stk-detail-v2.md`](../../../../../Product/ux/figma-web/wave06-stk-detail-v2.md)
- **Component registry**: [`.claude/references/web-component-registry.yaml`](../../../../../.claude/references/web-component-registry.yaml)
- **BFF SDL**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3j
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | Delivery Authority (warm-up --fix W06) | GAP-W06-GW-06 (sdl-drift, RESOLVED): §5.1 + §6.4 + §7 route path/route file sửa từ `/inventory/stock-report/card` (NEED CONFIRMATION) + `stock-report.card.tsx` → canonical `/inventory-stock/reports/card/$productCode` + `card/$productCode.tsx` (ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2). GAP-W06-GW-07 (sdl-drift, RESOLVED): §6.1 thêm note field mới `mainUnitDisplayName: String` (nullable, SDL v7.82) trên `StockCardDetailContext`. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-STK-DETAIL-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ, §2 trách nhiệm FE Web, §3 FE behaviour map 8/8 AC-ID, §4 visual fidelity + state + i18n + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (screens/components/GraphQL consumed/state/cross-tier pair). Source FEAT chỉ audit. |
