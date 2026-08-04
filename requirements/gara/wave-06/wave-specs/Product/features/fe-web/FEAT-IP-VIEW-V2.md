---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-IP-VIEW-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-IP-VIEW-V2"
source_feat_sha: "1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e"
generated_at: "2026-07-31T07:15:00Z"
status: ACTIVE
version: 6
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-IP-VIEW-V2"]
consumes_bff_feats: ["FEAT-IP-VIEW-V2"]
i18n_keys: []
screens_touched: ["src/features/inventory-report/components/movement/inventory-movement-report.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-ip-view-v2.md (node 14507:89273 — Báo cáo NXT: danh sách có dữ liệu (14547:104062) / empty state (13575:228614) / bảng full-width tham chiếu 13 cột (13575:229378))"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "NOT-COMPUTED — no hashing tool available in author session; orchestrator to backfill via scripts/manifest-rebuild.py"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-IP-VIEW-V2 (FE Web): Báo cáo Nhập Xuất Tồn

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-IP-VIEW-V2` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/inventory-report/components/movement/inventory-movement-report.tsx` (path inferred — xem §5.1 NEED CONFIRMATION) |
| Cross-tier consume | BE: `FEAT-IP-VIEW-V2` \| BFF: `FEAT-IP-VIEW-V2` |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-IP-VIEW-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) |
| Source version | v10 |
| Source SHA | `1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e` |
| Generated at | 2026-07-31T06:31:29+00:00 (bundle) |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần xem biến động và số dư tồn kho của từng mã sản phẩm theo khoảng ngày tùy chọn — tồn đầu kỳ, nhập trong kỳ, xuất trong kỳ, tồn cuối kỳ — để phục vụ đối soát cuối tháng và ra quyết định nhập hàng. Đây là 1 trong 3 báo cáo tồn kho V2 (cùng với "tồn đến ngày" và "thẻ kho"), đọc realtime từ sổ tồn để đảm bảo số liệu nhất quán giữa các báo cáo. Feature này thay thế báo cáo NXT bản cũ (`FEAT-IP-VIEW`) đã production, chuyển sang mô hình đọc trực tiếp sổ tồn thay vì tổng hợp chi tiết phiếu.

## 2. Trách nhiệm FE Web (garage-web)

- Render màn "Báo cáo NXT" như 1 tab trong sub-nav module Tồn kho (cùng dải với "Phiếu nhập kho", "Phiếu xuất kho", "Tồn đầu kỳ", "Tính giá xuất kho", "Báo cáo tồn kho") — page body only, app shell (Navbar/Footer) do route layout root render sẵn.
- User flow chính: mở tab → filter mặc định (khoảng ngày = tháng hiện tại) → fetch `stockInoutSummary` → render bảng 13 cột (2-tier header) + dòng Tổng + pagination → user điều chỉnh search/kho/khoảng ngày → refetch → user bấm "Xuất file" → tải `.xlsx`.
- State machine UI: `idle → loading (skeleton table) → success (bảng có dữ liệu / empty state) → error (toast)`; export có state riêng `exporting` trên nút.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: toàn bộ UI của màn này resolve đủ ở `customs/` (filter, warehouse select) và `share/` (page-header, button, input-search, date-range-filter, table, table-pagination, empty-state) theo bundle §G.X/Figma component map — KHÔNG cần fallback `ui/`, KHÔNG build-new component (xem §5.2).
- **Figma spec là visual SSOT**: `Product/ux/figma-web/wave06-ip-view-v2.md` (node `14507:89273`) — mọi layout/token/label lấy verbatim từ đây, KHÔNG suy luận từ AC text.
- GraphQL ops consume từ BFF (`agg-garage-graph` §3j Stock V2 Reports): query `stockInoutSummary` (list + aggregates) và query `stockInoutSummaryExport` (xuất file).
- RBAC render: không có gating theo role — `garage-owner` và `accountant` xem/xuất file như nhau (AC-8); chỉ cần route-level auth (đăng nhập + quyền vào module Tồn kho).

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Mở màn + Bộ lọc

#### AC-1 → Mở màn báo cáo

- **Khi**: user click tab "Báo cáo NXT" trong sub-nav Tồn kho.
- **FE phải**: render `PageHeaderSection` (title "Báo cáo Nhập Xuất Tồn", **KHÔNG** subtitle — xem `figma §CONTENT-01 RESOLVED`), khởi tạo filter mặc định (khoảng ngày = tháng hiện tại, kho = tất cả, search rỗng) rồi gọi `stockInoutSummary` ngay khi mount.
- **State transition**: `idle → loading (skeleton 5 dòng)` → `success` (bảng có dữ liệu hoặc empty state).
- **Component**: `share/layouts/page-header` (REUSE).
- **GraphQL op**: `stockInoutSummary` query, biến `StockInoutSummaryInput` với filter mặc định.
- **i18n keys**: không dùng i18next — label "Báo cáo Nhập Xuất Tồn" hardcode VN (xem §4.3).
- **a11y**: `<h1>` cho title, focus không tự nhảy khi mount.
- **Ref**: paired BFF FEAT §6.1 op `stockInoutSummary`, Figma node `14547:104066` (§5.3).

#### AC-5 → Bộ lọc

- **Khi**: user nhập search / đổi kho / đổi khoảng ngày.
- **FE phải**: debounce search 300ms; refetch `stockInoutSummary` với `keyword`/`warehouseIds`/`fromDate`/`toDate` mới; reset về page 0 khi filter đổi.
- **Prefill**: `fromDate` = ngày 01 tháng hiện tại, `toDate` = ngày cuối tháng hiện tại (client tính — **KHÔNG hardcode chuỗi mẫu Figma** `12/12/2024 - 12/12/2026`, xem `figma §DATA-01`).
- **Component**: `share/inputs/input-search` (search) + `customs/select/warehouses-select-filter` (kho) + `share/date-picker/date-range-filter` (1 control duy nhất, `combined: true` — **KHÔNG tách 2 date-picker**, xem `figma §Trap 5`).
- **State transition**: `idle → loading (giữ bảng cũ + spinner nhẹ) → success/error`.
- **GraphQL op**: `stockInoutSummary` (input `StockInoutSummaryInput { fromDate, toDate, warehouseIds, keyword, page, size, sort }`).
- **a11y**: mỗi filter control có `aria-label` mô tả (chip không có `<label>` riêng, chỉ hiển thị dạng `"Kho: {tên}"` / `"Từ ngày: {từ} - {đến}"`).
- **RESOLVED** (2026-07-31, BA sonhoang qua `/warm-up garage-web --phase B` GAP-W06-GW-08): kho filter = **multi-select** chính thức, khớp GraphQL input `warehouseIds: [Int!]` — không còn là implementation tạm.
- **Ref**: paired BFF FEAT §6.1 op `stockInoutSummary`, Figma node `14547:104068` (§5.3).

### Cluster B — Bảng dữ liệu + công thức

#### AC-2 → Cột hiển thị

- **Khi**: dữ liệu `stockInoutSummary` trả về.
- **FE phải**: render bảng 13 cột, **header 2 tầng bắt buộc** (Trap 6): 5 cột định danh `rowSpan=2` (STT, Mã SP nội bộ, Tên SP nội bộ, ĐVT chính, Kho) + 4 nhóm chỉ số `colSpan=2` (Đầu kỳ / Nhập kho / Xuất kho / Cuối kỳ), mỗi nhóm 2 cột con (Số lượng, Giá trị). Dòng "Tổng" luôn hiển thị đủ 8/8 cột số khi có ≥1 dòng dữ liệu — lấy từ `StockInoutSummaryAggregates` (BE-computed), **KHÔNG tự sum ở FE**.
- **State transition**: skeleton (5 dòng) → bảng thật; bảng KHÔNG co lại theo viewport — `overflow-x-auto` + `min-w-[1812px]` (Trap 3).
- **Component**: `share/tables/table` (REUSE — mở rộng cấu hình `colSpan`/`rowSpan`/`footerRow`, xem §5.2 component gap `approve-existing`).
- **GraphQL op**: `stockInoutSummary` → field `content[]` (`StockInoutSummaryRow`) + `aggregates` (`StockInoutSummaryAggregates`).
- **a11y**: table semantics thật (`<table>`/`<thead>`/`<tbody>` bên trong component share, KHÔNG div-table); `scope="colgroup"` cho header nhóm.
- **Ref**: Figma node `14547:104072` + `13575:229378` (§5.3).

#### AC-3 → Công thức cột

- **Khi**: render mỗi dòng bảng.
- **FE phải**: hiển thị đúng nguyên giá trị BE trả — Đầu kỳ = `openingQty/openingValue`, Nhập = `inboundQty/inboundValue`, Xuất = `outboundQty/outboundValue`, Cuối kỳ = `closingQty/closingValue`. FE **KHÔNG tự tính công thức** (opening từ sổ tồn, nhập/xuất tổng biến động, cuối kỳ = đầu + nhập − xuất) — công thức là BE authoritative (xem paired be/FEAT-IP-VIEW-V2.md).
- **RESOLVED — format hiển thị** (2026-07-31, BA sonhoang qua `/warm-up garage-web --phase B` GAP-W06-GW-08): mọi cột **Giá trị** (openingValue/inboundValue/outboundValue/closingValue, cả body row lẫn dòng Tổng) hiển thị kèm hậu tố **"đ"** — nhất quán toàn bảng (không còn khác biệt body vs Tổng như Figma trap `FORMAT-01`). Cột **Số lượng** giữ nguyên, KHÔNG thêm hậu tố. Đây là format hiển thị cho **web table only**; file Excel export (`stockInoutSummaryExport`) do BE render template, FE chỉ gọi API lấy `contentBase64` về trigger download, KHÔNG chịu trách nhiệm format số trong file — xem AC-7.
- **Component**: cell renderer trong `share/tables/table` — cột số căn phải, weight 500 (`text-sm font-medium`); cột `ĐVT chính` cũng weight 500 (ngoại lệ, khác 3 cột text khác dùng weight 400).
- **GraphQL op**: `stockInoutSummary` → `StockInoutSummaryRow` (8 field số).
- **Ref**: Figma `sub_columns` per nhóm (§5.3).

#### AC-4 → Giá trị (GT) theo BQGQ

- **Khi**: mã sản phẩm/kho trong dòng chưa được chạy tính giá BQGQ (PRC) cho kỳ đang xem.
- **FE phải**: hiển thị ô Giá trị (Xuất) = `0` (số thật, không phải chuỗi). **TUYỆT ĐỐI KHÔNG hiển thị chữ "Tạm tính"** trong ô — nếu cần cảnh báo, đặt ngoài bảng (ghi chú/banner), không đặt trong cell.
- **Component**: cell renderer — không có variant riêng cho case này (giá trị 0 hiển thị như số bình thường).
- **RESOLVED** (2026-07-31, BA sonhoang qua `/warm-up garage-web --phase B` GAP-W06-GW-08): **KHÔNG implement** ghi chú/banner "cần chạy tính giá" ngoài bảng — chốt chính thức bỏ hẳn phần này (không phải tạm hoãn chờ xác nhận). Chỉ đảm bảo ô Giá trị (Xuất) = `0` khi chưa chạy PRC, không có bất kỳ text/helper nào khác ngoài số 0.
- **Ref**: Figma nhóm `Xuất kho` (§5.3), coverage_gaps `CONTENT-02`.

#### AC-6 → Tách dòng theo kho & hiển thị mã

- **Khi**: cùng 1 mã sản phẩm có phát sinh ở nhiều kho trong khoảng ngày.
- **FE phải**: render **1 dòng riêng cho mỗi cặp (Mã SP nội bộ, Kho)** — KHÔNG gộp dòng theo mã. Cột "Mã SP nội bộ" hiển thị dạng link thật (màu `text-[#0052ff]`, không gạch chân mặc định, `hover:underline`) — **RESOLVED** (2026-07-31, BA sonhoang qua `/warm-up garage-web --phase B` GAP-W06-GW-08, sửa lại lần 2 — lần 1 ghi nhầm là bỏ link, đã đính chính): click "Mã SP nội bộ" **điều hướng sang trang chi tiết sản phẩm nội bộ** — route hiện có `/inventory-catalog/internal-products/$id` (module Danh mục, đã tồn tại từ trước, KHÔNG phải route mới). **KHÔNG liên quan** đến `FEAT-STK-DETAIL-V2` (thẻ kho) — đó là nhầm lẫn ở vòng resolve trước, đã gỡ bỏ. Cột "Kho" hiển thị tên kho đầy đủ, có `border-r` phân cách khối định danh với khối chỉ số.
- **Component**: `share/tables/table` cell (Router `<Link>`, TanStack Router, styled `text-[#0052ff]` — cùng pattern với "Xem lịch sử" ở `FEAT-STK-LIST-V2` AC-7, khác đích đến).
- **✅ DEPENDENCY-MISSING RESOLVED (2026-07-31, GAP-W06-GW-13 — `CR-20260731-04` APPROVED + applied bởi Delivery Authority sonhoang)**: SDL `StockInoutSummaryRow` (`agg-garage-graph-graphql.md` v7.83) nay có field `productId: Int` (nullable, additive) ngay sau `productCode`. FE wire `<Link to="/inventory-catalog/internal-products/$id" params={{ id: row.productId }}>`. **`productId` VẪN PHẢI null-safe handling**: REST DTO `gf-inventory` (`stockInoutSummary` W06-STK-Q2) hiện CHƯA project field tương ứng (verified) → BFF resolver **hiện tại resolve `productId` = `null`** cho tới khi backend + resolver hoàn thiện mapping thật (follow-up TD riêng, KHÔNG round-trip trong CR này). Khi `row.productId` là `null` → **KHÔNG render link** (giữ text "Mã SP nội bộ" dạng plain, KHÔNG phải link màu `text-[#0052ff]`) thay vì crash hoặc navigate tới route lỗi (`/internal-products/undefined`). Khi resolver hoàn thiện (field có giá trị thật) → render link như thiết kế — không cần sửa gì thêm phía FE, đã code sẵn conditional.
- **GraphQL op**: `stockInoutSummary` → `productCode`, `productId` (nullable, v7.83 — hiện resolve `null` cho tới khi BFF resolver hoàn thiện, xem note trên), `warehouseCode`, `warehouseName`.
- **Ref**: Figma cột `Mã SP nội bộ` + `Kho` (§5.3); route đích: `frontend/gf-gms-web/src/routes/_modules/_inventory/inventory-catalog/internal-products/$id/index.tsx` (route có sẵn, không tạo mới).

### Cluster C — Xuất file

#### AC-7 → Xuất file

- **Khi**: user bấm nút "Xuất file" ở góc phải Page Header.
- **FE phải**: gọi `stockInoutSummaryExport` với filter hiện tại (search/kho/khoảng ngày, không phân trang — export full filtered scope); decode `contentBase64` → trigger browser download với `fileName` trả về (mẫu `Báo cáo nhập xuất tồn.xlsx`); disable nút + hiện spinner trong lúc chờ.
- **State transition**: `default → exporting (disabled + spinner thay icon) → default` (thành công) hoặc `error (toast)`.
- **Component**: `share/buttons/button` (variant `brand`, `isLoading` prop khi exporting) — REUSE, KHÔNG build nút riêng.
- **GraphQL op**: `stockInoutSummaryExport` query (BFF passthrough `GET /api/v*/stock/inout-summary/export`).
- **a11y**: `aria-busy="true"` khi exporting; giữ `aria-label="Xuất file"` cố định (không đổi label theo state).
- **RESOLVED** (2026-07-31, BA sonhoang qua `/warm-up garage-web --phase B` GAP-W06-GW-08): format số Giá trị chốt thêm hậu tố "đ" cho **toàn bộ web table** (body + Tổng, xem AC-3). Mẫu **Excel export do BE render template** (không phải FE formatter) — FE chỉ gọi `stockInoutSummaryExport` lấy `contentBase64` về trigger download, không cần đồng bộ formatter giữa web và file export.
- **Ref**: Figma node `14547:104066` (nút Xuất file), Endpoint Summary W06-STK-EX2.

### Cluster D — Phân quyền

#### AC-8 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: user với persona `garage-owner` hoặc `accountant` truy cập màn.
- **FE phải**: **KHÔNG** gate bất kỳ control nào (search/filter/xem bảng/xuất file) theo persona — cả 2 role thấy và thao tác giống hệt nhau. Chỉ áp dụng route-level auth chung (đăng nhập + có quyền vào module Tồn kho), không thêm điều kiện `role === 'garage-owner'` hay `role === 'accountant'` ở bất kỳ đâu trong màn này.
- **Component**: N/A (absence-of-gating là hành vi cần verify, không phải component mới).
- **Ref**: FEAT-IP-VIEW-V2 AC-8 (bundle §C).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-ip-view-v2.md` (node `14507:89273`) — KHÔNG re-invent layout/spacing/màu.
- Design tokens theo `tailwind.config.js` / `src/styles/tokens/**` — KHÔNG hardcode hex/px (xem §5.3, khớp bundle §G.Y "Design tokens referenced": `bg-accent`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`).
- Bảng viewport-fixed 1812px với `overflow-x-auto` — KHÔNG ép `w-full` (Trap 3, xem AC-2).
- Mọi visual AC cross-ref figma section: AC-1 → `§PageHeaderSection` (node `14547:104066`); AC-2/AC-3 → `§NxtTableGrid` (node `14547:104073`); AC-6 → cột `warehouse` (node `14547:104103`); AC-7 → `§btn_export` (node `14547:104066`).

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | error`. Loading = skeleton table (không phải spinner toàn trang, giữ page header/filter hiển thị).
- Error → TOAST cho lỗi network/BFF/BE; empty-result (0 dòng khớp filter) → EMPTY_STATE (`share/emptys/no-data`, text "Không có dữ liệu") — **ẩn dòng Tổng + ẩn pagination** khi empty (xem `figma §3 State Table`).
- KHÔNG silent fail — mọi lỗi fetch/export đều toast hoặc log.

### 4.3 i18n + a11y

- **Override single-locale (VN only)**: màn này dùng fixed VN labels hardcode inline theo Figma verbatim string assertions (`STT`, `Mã SP nội bộ `, `Tên SP nội bộ`, `ĐVT chính `, `Kho `, `Đầu kỳ `, `Nhập kho `, `Xuất kho `, `Cuối kỳ`, `Số lượng `, `Giá trị`, `Tổng`, `Hiển thị`, `mỗi trang`, `Xuất file `, `Trước`, `Tiếp`, `Không có dữ liệu`) — **KHÔNG dùng i18next**, `i18n_keys: []` (nhất quán với các màn báo cáo cùng wave `FEAT-STK-LIST-V2`/`FEAT-STK-DETAIL-V2`). Giữ nguyên khoảng trắng cuối chuỗi verbatim theo Figma (vd `"Mã SP nội bộ "`) — KHÔNG tự trim.
- a11y: filter controls có `aria-label`; table có semantic markup thật; pagination buttons `aria-label` mô tả (`"Trang trước"`, `"Trang sau"`); nút Xuất file `aria-busy` khi loading.
- Keyboard nav: Tab qua search → kho chip → date chip → bảng (nếu scroll-x, đảm bảo focus-visible khi tab vào vùng scroll) → nút Xuất file → pagination.

### 4.4 RBAC render + feature flag

- KHÔNG feature-flag riêng cho FE (BE gate qua `Inventory:InventoryV2` per bundle §G 3j preamble — BFF forward request bình thường, lỗi 403 map `FORBIDDEN_ERROR` → FE hiện toast lỗi quyền truy cập nếu xảy ra, không phải trạng thái UI thường trực).
- **KHÔNG** persona check nào trong màn này (AC-8) — cả `garage-owner` và `accountant` render giống hệt.
- Route gate: chỉ redirect nếu chưa đăng nhập/không có quyền vào module Tồn kho (auth chung của app, không phải logic riêng màn này).

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-IP-VIEW-V2.md §9`). Màn này là **read-only report** (không có form submit) nên FE hầu như không có validation hint — chỉ:
  - Disable nút "Xuất file" khi đang exporting (tránh double-click double-download).
  - Toast khi BFF/BE trả lỗi (`FORBIDDEN_ERROR`, validation date range không hợp lệ nếu `fromDate > toDate`).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-CMN-validation` (vd `fromDate` > `toDate`) | INLINE (dưới chip khoảng ngày) | `filter_date_range` (`share/date-picker/date-range-filter`) | AC-5 |
| (empty result set — không phải lỗi) | EMPTY_STATE | `share/emptys/no-data` | AC-2 |
| `FORBIDDEN_ERROR` (feature flag off / thiếu quyền) | TOAST | global toast | AC-1 |
| network/BFF timeout | TOAST | global toast | AC-1, AC-5 |
| export failure | TOAST | `btn_export` | AC-7 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `InventoryMovementReportPage` | `/inventory-stock/reports/inout` (canonical — ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2; sửa từ `/inventory/reports/...` path inferred per GAP-W06-GW-06, `/warm-up garage-web --fix` W06 Phase B) | NEW (component) + MODIFY (route registration — thêm tab vào route tree module Tồn kho hiện có) | `https://www.figma.com/design/EMGjGsnAJzGoGwTSK7dTuZ/GMS-v.3?node-id=14547-104062` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8 |

### 5.2 Components new/modified

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, actions }` (KHÔNG truyền `subtitle`) | — | **Priority 2 — share/** (Figma `Page Header / 3`, no gap) | AC-1 |
| `Button` | `src/components/share/buttons/button.tsx` | REUSE | `variant="brand"`, `isLoading`, `leadingIcon` | `exporting` | **Priority 2 — share/** | AC-7 |
| `MainFilter` | `src/components/customs/filter/main-filter.tsx` | REUSE | `{ children, wrap }` | — | **Priority 1 — customs/** (Figma `Fillter`, container) | AC-5 |
| `InputSearch` | `src/components/share/inputs/input-search.tsx` | REUSE | `{ placeholder, value, onChange }` | debounced | **Priority 2 — share/** | AC-5 |
| `WarehousesSelectFilter` (domain) | `src/components/customs/select/warehouses-select-filter.tsx` | REUSE | `{ value, onChange, multiple? }` | — | **Priority 1 — customs/** (domain-specific, resolved via §G.X Priority-2 lookup vì Figma layer name `Button` generic) | AC-5 |
| `DateRangeFilter` | `src/components/share/date-picker/date-range-filter.tsx` | REUSE | `{ from, to, onChange, prefill }` | — | **Priority 2 — share/** (combined control, KHÔNG tách 2 input) | AC-5 |
| `Table` (extend config) | `src/components/share/tables/table.tsx` | REUSE (MODIFY config — thêm `colSpan`/`rowSpan`/`footerRow` nếu API hiện tại chưa hỗ trợ; giữ backward-compat, KHÔNG parallel-shell) | `{ columns (2-tier), data, footerRow }` | — | **Priority 2 — share/** (approve-existing per `figma §11 Component Gaps`) | AC-2, AC-3, AC-4, AC-6 |
| `TablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ page, pageSize, total, onChange }` | — | **Priority 2 — share/** | AC-2 |
| `EmptyState` (no-data) | `src/components/share/emptys/no-data.tsx` | REUSE | `{ text: "Không có dữ liệu" }` | — | **Priority 2 — share/** | AC-2 |

> Không có entry Build-new — cả 3 layer (`customs/share/ui`) resolve đủ theo Figma component map (xem `figma §11 Component Gaps` — 2/3 gap là `approve-existing`, 1/3 (`bqgq_warning_note`) là `pattern-unknown` nên **chưa implement** cho đến khi BA chốt, KHÔNG phải build-new confirmed).

### 5.3 Design tokens & Figma refs

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-accent` (`#f4f4f5`) | Figma `base/accent` | nền header bảng (2 tầng) + nền dòng Tổng | AC-2, AC-3 |
| `bg-muted` (`hover:bg-muted/50`) | Figma §3 State Table (hover row) | hover state body row | AC-2 |
| `text-foreground` (`#18181b`) | Figma `base/foreground` | title, header bảng, cell text/số | AC-1, AC-2, AC-3 |
| `text-muted-foreground` (`#71717a`) | Figma `base/muted-foreground` | placeholder search, "Hiển thị"/"mỗi trang" | AC-5 |
| `text-primary` (`#18181b`, alias riêng) | Figma `base/primary` | head cột `STT` | AC-2 |
| `border-border` (`#e4e4e7`) | Figma `base/border` | `border-b` mọi hàng bảng, `border-r` cột `Kho` | AC-2, AC-6 |
| `border-input` (`#d4d4d8`) | Figma `base/input` | viền ô search, 2 chip lọc | AC-5 |
| `bg-[#0052ff]` | Figma `base/background-brand-CD` | nền nút "Xuất file" | AC-7 |
| `text-[#0052ff]` | Figma `base/foreground-brand-CD` | cell "Mã SP nội bộ" (link) | AC-6 |

> **Figma source-of-truth**: visual/micro-interaction/responsive đều theo Figma. Không re-invent. Token list khớp bundle §G.Y "Design tokens referenced" (`bg-accent`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`) + bổ sung token khác đã verify trực tiếp trong file figma spec (§2 Design Token Map).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `stockInoutSummary` | query | `src/api/graphql/stockInoutSummary.graphql` | `['stock-inout-summary', filters]` | `StockInoutSummaryRowFragment` | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |
| `stockInoutSummaryExport` | query (lazy, on-demand) | `src/api/graphql/stockInoutSummaryExport.graphql` | — (không cache, `refetch` on-click) | — | AC-7 |

> Cả 2 op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #16 enforce) — xem bundle §G `3j Stock V2 Reports` (SDL `Query.stockInoutSummary` + `Query.stockInoutSummaryExport`).

> **SDL field update v7.82 (GAP-W06-GW-07)**: `StockInoutSummaryRow` bổ sung field `mainUnitDisplayName: String` (nullable, additive, BFF enrichment qua `gf-erp-mdm directory=UNIT`). FE **PHẢI** include field này trong query string `stockInoutSummary` và render cột "ĐVT chính" bằng `mainUnitDisplayName` (tên hiển thị tiếng Việt, vd "Cái") thay vì `mainUnitCode` (mã thô) — theo đúng Figma verbatim. Nếu `mainUnitDisplayName` null (enrichment miss) → fallback hiển thị `mainUnitCode`.
>
> **SDL field update v7.83 (GAP-W06-GW-13, RESOLVED — `CR-20260731-04` APPROVED)**: `StockInoutSummaryRow` bổ sung field `productId: Int` (nullable, schema-only additive) ngay sau `productCode`. BFF resolver hiện resolve `null` (REST DTO `gf-inventory` chưa project field — follow-up riêng). Dùng cho AC-6 §4 bên dưới — xem note cập nhật tại AC-6 (null-safe render bắt buộc cho tới khi resolver hoàn thiện).

### 6.2 REST endpoints consumed direct (bypass BFF)

_(không có — mọi data fetch qua BFF GraphQL, không có server-side render latency-critical path cho màn này)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state | TanStack Query | — | `['stock-inout-summary', filters]` | AC-1, AC-2, AC-5 |
| Filter state | Local component state (`useState`) | — | `{ keyword, warehouseIds, fromDate, toDate, page, size }` — không cần Zustand (scope local 1 màn, không share cross-component) | AC-5 |
| Export state | Local component state (`useState`) | — | `isExporting: boolean` | AC-7 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory-stock/reports/inout` (canonical — xem GAP-W06-GW-06, sửa từ `/inventory/reports/...` slug DEV xác nhận) | `InventoryMovementReportPage` | `loader() => prefetch stockInoutSummary với filter mặc định` | Auth chung (đăng nhập + quyền module Tồn kho) — KHÔNG role gate | AC-1, AC-8 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-report/components/movement/` | `inventory-movement-report.tsx` | NEW | shadcn/ui base qua share/customs components | ~220 | AC-1-AC-8 |
| `src/features/inventory-report/hooks/` | `use-stock-inout-summary.ts` | NEW | TanStack Query wrapper | ~40 | AC-1, AC-5 |
| `src/features/inventory-report/hooks/` | `use-stock-inout-summary-export.ts` | NEW | TanStack Query lazy wrapper | ~25 | AC-7 |
| `src/features/inventory-report/types/` | `stock-inout-summary.types.ts` | NEW | TypeScript types (mirror SDL) | ~30 | — |
| `src/api/graphql/` | `stockInoutSummary.graphql` | ADDITIVE | persisted query | ~25 | AC-1-AC-6 |
| `src/api/graphql/` | `stockInoutSummaryExport.graphql` | ADDITIVE | persisted query | ~10 | AC-7 |
| `src/api/generated/` | (codegen output) | AUTO-GEN | codegen | — | — |
| `src/routes/` | inventory module routes file (thêm tab route) | MODIFY (add) | createBrowserRouter | ~15 | AC-1 |
| `tests/` | `tests/features/inventory-report/movement/inventory-movement-report.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1-AC-8 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path).

```
(← BFF tier S5: SDL + resolver stable — stockInoutSummary + stockInoutSummaryExport)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave06-ip-view-v2.md)
    Exit: E2E happy path green (smoke)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + state + filter | features + routes | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> Màn này là read-only report — FE không enforce validation ghi dữ liệu. BR-STKV2-* (computation formula, tách dòng theo kho, ...) enforce primary ở BE (`gf-inventory`). FE chỉ display + filter validation hint.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-001` | — | Hiển thị đúng giá trị BE trả, không tự tính lại | `movement/inventory-movement-report.tsx` | AC-3 | Primary enforce BE — xem `be/FEAT-IP-VIEW-V2.md §9` |
| `BR-STKV2-003` | — | Tách dòng theo (mã + kho) | `movement/inventory-movement-report.tsx` | AC-6 | Primary enforce BE |
| `BR-STKV2-005` | — | Không tự sum lại dòng Tổng — dùng `aggregates` từ BE | `movement/inventory-movement-report.tsx` | AC-2 | Primary enforce BE |
| `BR-STKV2-009` | — | Hiển thị GT xuất = 0 khi chưa chạy BQGQ (không text "Tạm tính") | `movement/inventory-movement-report.tsx` | AC-4 | Primary enforce BE |
| `BR-STKV2-011` | — | (chưa có mô tả BR chi tiết trong bundle — xem be tier) | — | — | UI hint N/A cho đến khi BE tier confirm nội dung |
| `BR-STKV2-015` | — | (chưa có mô tả BR chi tiết trong bundle — xem be tier) | — | — | UI hint N/A cho đến khi BE tier confirm nội dung |

> **Primary enforcement** = BE tier (`features/be/FEAT-IP-VIEW-V2.md §9`). Bundle không cung cấp nội dung BR file đầy đủ cho `BR-STKV2-011`/`BR-STKV2-015` (chỉ ID) — nếu 2 rule này có touchpoint UI đặc thù, cần re-sync từ `be/FEAT-IP-VIEW-V2.md` sau khi tier BE hoàn tất.

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | mở tab, kiểm tra title + không subtitle |
| AC-2 | UI (table structure) | test-ui | header 2 tầng, 13 cột, dòng Tổng 8/8 |
| AC-3 | UI (display value) | test-ui | verify hiển thị đúng giá trị BE, không tự tính |
| AC-4 | UI (edge case) | test-ui | mã chưa chạy BQGQ → GT = 0, không text "Tạm tính" |
| AC-5 | UI (filter) | test-ui | search debounce, kho filter, date-range prefill tháng hiện tại |
| AC-6 | UI (multi-row) | test-ui | 1 mã 2 kho → 2 dòng riêng |
| AC-7 | UI (export) | test-ui | click "Xuất file" → download trigger, disabled state |
| AC-8 | UI (RBAC negative) | test-ui + test-isolation | dual persona — cả 2 role render giống nhau, không control nào bị ẩn |
| (empty state) | UI | test-ui | 0 dòng khớp filter → empty state, ẩn Tổng + pagination |
| (smoke) | E2E happy path | test-e2e | Playwright |

## 11. i18n & a11y

### 11.1 i18n keys

_(không áp dụng — fixed VN labels hardcode, `i18n_keys: []`, xem §4.3)_

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` title, không auto-focus | manual QA |
| AC-2 | Table semantic thật (`<table>`/`<thead>`/`<tbody>`), `scope` cho header nhóm | share/tables/table baseline |
| AC-5 | Mỗi filter control có `aria-label` mô tả | search/kho/date-range |
| AC-6 | Cell link "Mã SP nội bộ" có `aria-label` rõ ràng (không chỉ mã) | screen reader |
| AC-7 | `aria-busy="true"` khi exporting, `aria-label="Xuất file"` cố định | nút export |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-IP-VIEW-V2.md` | (đang author song song — `exec-spec-be-ip-view-v2`) | BR primary enforcement, contract source (`gf-inventory` REST `POST /api/v*/stock/inout-summary/search`, `GET /api/v*/stock/inout-summary/export`) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-IP-VIEW-V2.md` | (đang author song song — `exec-spec-bff-ip-view-v2`) | GraphQL ops consumed (§6.1): `stockInoutSummary`, `stockInoutSummaryExport` (`agg-garage-graph` §3j) |
| Mobile | — | N-A | `FEAT-IP-VIEW-V2` là web-only per PKG §Overview (mobile W06 chỉ có `FEAT-STK-LIST-V2`) |

**Source ID consistency** (item 18): `source_feat_sha` = `1341f92ab88a9da3bbf846ec836a402c50c3759c857b843dd310ddcd1000b62e` — PHẢI identical với BE/BFF files khi 2 tier đó hoàn tất.

## 13. References

- **Source**: [`Product/features/FEAT-IP-VIEW-V2.md`](../../../../../Product/features/FEAT-IP-VIEW-V2.md) v10
- **Paired BE**: [`features/be/FEAT-IP-VIEW-V2.md`](../be/FEAT-IP-VIEW-V2.md)
- **Paired BFF**: [`features/bff/FEAT-IP-VIEW-V2.md`](../bff/FEAT-IP-VIEW-V2.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-CATALOG.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-CATALOG.md)
- **Figma DEV spec**: [`Product/ux/figma-web/wave06-ip-view-v2.md`](../../../../../Product/ux/figma-web/wave06-ip-view-v2.md)
- **HLD Web**: [`Architecture/hld/gf-inventory-HLD.md`](../../../../../Architecture/hld/gf-inventory-HLD.md)
- **API (downstream)**: [`Architecture/api/gf-inventory-api.md`](../../../../../Architecture/api/gf-inventory-api.md) §3g.2 (W06-STK-Q2, W06-STK-EX2)
- **GraphQL (BFF)**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §3j
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 6 | main-orchestrator (Delivery Authority sonhoang approve trực tiếp qua chat — "fix CR-20260731-04 cho t") | `CR-20260731-04` **APPROVED + applied**: SDL `agg-garage-graph-graphql.md` v7.82→v7.83 thêm field `productId: Int` (nullable, additive) vào `StockInoutSummaryRow`. §6.1 + AC-6 §4 cập nhật dùng field thật — FE wire `<Link params={{ id: row.productId }}>`, giữ null-safe render (REST DTO `gf-inventory` verified chưa project `productId` tương ứng → BFF resolver hiện resolve `null` cho tới khi backend + resolver bổ sung, follow-up riêng không round-trip trong CR này). GAP-W06-GW-13 → RESOLVED. |
| 2026-07-31 | 5 | Delivery Authority (warm-up --fix W06) | **Đính chính version 4** — v4 ghi nhầm SDL `StockInoutSummaryRow` "nay có field `productId`" (v7.83) như đã apply; thực tế agent định tự edit `Architecture/api/agg-garage-graph-graphql.md` (boundary `agg-garage-graph`, ngoài scope `garage-web`) và bị user chặn lại + discard file đó — SDL **CHƯA có** field này. Sửa lại §6.1 + AC-6 §4 phản ánh đúng: đã raise `CR-20260731-04` (MODERATE, PENDING_APPROVAL) đề nghị boundary owner bổ sung field, FE code theo hướng field chưa tồn tại (conditional render, không giả định có sẵn) cho tới khi CR approved + cascade. GAP-W06-GW-06 + GW-07 (route path + mainUnitDisplayName note) giữ nguyên RESOLVED — không liên quan tới lần đính chính này, cả 2 chỉ chạm tier-spec FE-web, không cross-boundary. |
| 2026-07-31 | 4 | Delivery Authority (warm-up --fix W06) | GAP-W06-GW-06 (sdl-drift, RESOLVED): §5.1 + §6.4 route path sửa từ `/inventory/reports/...` (path inferred) → canonical `/inventory-stock/reports/inout` (ratified `PKG-W06-inventory-pricing-stock-report.md` §2.2.4 + `garage-web-HLD.md` §8d.2). GAP-W06-GW-07 (sdl-drift, RESOLVED): §6.1 thêm note field mới `mainUnitDisplayName: String` (nullable, SDL v7.82) trên `StockInoutSummaryRow`. GAP-W06-GW-13 (dependency-missing) — **XEM ĐÍNH CHÍNH v5**: dòng entry gốc claim SDL "nay có field productId" KHÔNG chính xác, agent định tự edit SDL boundary khác và bị user chặn. |
| 2026-07-31 | 3 | main-agent (`/warm-up garage-web --phase B` GAP-W06-GW-08 resolve, BA sonhoang) | Resolve 4/4 NEED CONFIRMATION marker: (1) AC-1 kho filter chốt multi-select. (2) AC-4 chốt KHÔNG implement ghi chú/banner "cần chạy tính giá". (3) AC-6 chốt "Mã SP nội bộ" LÀ link thật, điều hướng sang `/inventory-catalog/internal-products/$id` (route Danh mục có sẵn) — **đính chính lại 1 lần** (BA ban đầu nhầm là điều hướng sang Thẻ kho `FEAT-STK-DETAIL-V2`, sau đó nhầm tiếp là bỏ hẳn link, cuối cùng chốt đúng là internal-products detail). Phát hiện kèm theo: SDL `StockInoutSummaryRow` hiện chỉ có `productCode` (String), thiếu `productId` (Int) mà route đích cần — flagged dependency-missing, cần `/cr-raise MINOR` bổ sung field trước khi FE wire được. (4) AC-7 chốt hậu tố "đ" cho toàn bộ cột Giá trị (web table), Excel export là trách nhiệm BE template, FE chỉ gọi API. |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-IP-VIEW-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map cho 8 AC-ID, §4 visual fidelity + state + i18n (fixed VN, no i18next) + a11y + RBAC (no gating, AC-8) + BR secondary + error mapping, §5-§11 FE-specific (2-tier table header, component reuse 100% customs/share, GraphQL consume qua BFF, no mobile pairing — web-only). 4 NEED CONFIRMATION marker (kho single/multi-select, route đích cell link mã SP, ghi chú BQGQ ngoài bảng AC-4, format GT có/không hậu tố "đ"). Source FEAT chỉ audit. |
