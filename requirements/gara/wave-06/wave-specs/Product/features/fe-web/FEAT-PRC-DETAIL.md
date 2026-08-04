---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-DETAIL.md"
source_version: 24
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-DETAIL"
source_feat_sha: "5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-ACCOUNTING-PERIOD"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-web"
platform: web
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-PRC-DETAIL"]
consumes_bff_feats: ["FEAT-PRC-DETAIL"]
i18n_keys: []                                          # Wave W06 dùng fixed VN labels (no i18next) — theo convention garage-web hiện hành (mirror OB/AP waves); xem §4.3
screens_touched: ["src/features/inventory-price-calc-run/pages/PriceCalcRunDetailPage.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-prc-detail.md (node 13575:103109 — FEAT-PRC-DETAIL, màn Chi tiết lần tính giá)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "N/A (không computed — author environment không có tool sha256)"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-PRC-DETAIL.fe-web.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-DETAIL (FE Web): Chi tiết lần tính giá xuất kho (BQGQ)

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-DETAIL` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/inventory-price-calc-run/pages/PriceCalcRunDetailPage.tsx` |
| Cross-tier consume | BE: `FEAT-PRC-DETAIL` (qua BFF passthrough) \| BFF: `FEAT-PRC-DETAIL` (agg-garage-graph §3f) |

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

## 2. Trách nhiệm FE Web (`garage-web`)

- Màn Chi tiết lần tính giá (`/inventory/price-calc-runs/:runId`) — trang full-page, không modal, entry point từ danh sách `FEAT-PRC-LIST` (click 1 dòng) hoặc deep-link (vd từ cảnh báo `affectedSubsequentPeriods` của `FEAT-PRC-CREATE`/`FEAT-PRC-RECALC`).
- User flow chính: mở màn → fetch run detail (bao gồm items) → nếu `status ∈ {PENDING, RUNNING}` tự động poll mỗi 5s cho đến khi terminal (`SUCCEEDED` / `COMPLETED_WITH_ERRORS`) → hiển thị toast hoàn tất + refresh bảng chi tiết. User có thể tìm kiếm/lọc bảng chi tiết (client-side) và bấm "Tính lại toàn bộ" / "Tính lại mã lỗi" để kick-off lần chạy mới (điều hướng hoặc refetch theo `runId` mới trả về).
- State machine UI: `loading` (skeleton lần đầu) → `success` (render đủ 4 khối: RunInfoGrid, FilterBar, DetailTable + dòng Tổng, TablePagination) → `polling` (badge "Đang tính" + auto-refetch, KHÔNG che UI bằng full-page loader) → `error` (toast lỗi khi recalc bị chặn) → `empty` (bảng rỗng khi filter không khớp).
- **Component reuse-first — priority `customs/` > `share/` > `ui/`**: mọi element trên màn này map trực tiếp vào registry `ready` (xem §5.2) — KHÔNG cần build-new.
- **Figma spec là visual SSOT**: `Product/ux/figma-web/wave06-prc-detail.md` (node `13575:103109`). Cụm 8 trường KHÔNG bọc Card (AP-PRC-1), grid 4 cột × 2 hàng (AP-PRC-2), bảng chi tiết + dòng Tổng là 1 `<Table>` duy nhất (AP-PRC-3).
- GraphQL consume từ BFF (`agg-garage-graph` §3f PRC): query `priceCalcRunGet` (detail + polling) và mutation `priceCalcRunRecalc` (2 nút "Tính lại toàn bộ" / "Tính lại mã lỗi").
- RBAC render: không có feature flag gate riêng cho DETAIL (backend `Inventory:InventoryV2` áp ở BE); 2 persona `garage-owner` và `accountant` có quyền xem + chạy lại NGANG NHAU (AC-6) — không ẩn/khoá control theo role.

## 3. Hành vi cần triển khai (FE Web behaviour map)

> Coverage gate: 9/9 AC (AC-1, AC-2, AC-2b, AC-2c, AC-3, AC-4, AC-5, AC-5b, AC-6).

### Cluster A — Mở màn & PageHeader

#### AC-1 → Mở màn chi tiết từ danh sách / deep-link

- **Khi**: user click 1 dòng ở `FEAT-PRC-LIST`, hoặc điều hướng deep-link kèm `runId` (vd từ cảnh báo `affectedSubsequentPeriods`).
- **FE phải**: navigate tới route `/inventory/price-calc-runs/:runId`, gọi `priceCalcRunGet(id: runId, includeItems: true)` ngay khi vào route (TanStack Router `loader`), render PageHeader với title tĩnh "Xem khoản mục / Chi tiết lần tính giá" + nút back về `/inventory/price-calc-runs`.
- **State transition**: `idle → loading` (route loader pending, dùng `share/loadings/loading-screen` hoặc route `pendingComponent`) `→ success`.
- **Component**: `share/layouts/page-header` (title + back + action slot).
- **GraphQL op**: `priceCalcRunGet`.
- **i18n keys**: không dùng i18next — label cố định "Xem khoản mục / Chi tiết lần tính giá" theo Figma (xem §4.3).
- **a11y**: nút back có `aria-label="Quay lại danh sách lần tính giá"`; heading dùng thẻ `<h1>`.
- **Ref**: paired BFF FEAT §6.1 op `priceCalcRunGet`, Figma node `13575:103113` (PageHeader, §5.3).

### Cluster B — Cụm thông tin đầu màn & polling

#### AC-2 → Cụm thông tin đầu màn (RunInfoGrid, 8 trường)

- **Khi**: run detail load xong (mọi trạng thái, không chờ items).
- **FE phải**: render grid 4 cột × 2 hàng (KHÔNG Card, KHÔNG 2 cột — xem AP-PRC-1/AP-PRC-2) gồm 8 `DescriptionItem`: Tên kỳ kế toán, Từ ngày (dd/MM/yyyy), Đến ngày (dd/MM/yyyy), Kho, Phương pháp tính giá, Người thực hiện (`executedByName`), Ngày giờ thực hiện (dd/MM/yyyy HH:mm), Trạng thái — render text thường (KHÔNG badge) với 3 giá trị: "Đang tính" (`status ∈ {PENDING, RUNNING}`), "Thành công" (`SUCCEEDED`), "Hoàn thành có lỗi" (`COMPLETED_WITH_ERRORS`).
- **State transition**: value cập nhật lại mỗi lần polling trả kết quả mới (không riêng cho khối này — cùng query với AC-2c).
- **Component**: `share/displays/description-item` × 8, bọc trong grid `cols=4` (KHÔNG dùng `description-list-2col`).
- **GraphQL op**: `priceCalcRunGet` (field `run.*`).
- **i18n keys**: fixed VN labels, không dùng i18next.
- **a11y**: mỗi cặp label/value dùng `<dt>`/`<dd>` hoặc `aria-label` tương đương để screen reader đọc đúng cặp.
- **Ref**: Figma node `15593:104980` (RunInfoGrid, §5.3); coverage gap — 2/3 giá trị "Đang tính"/"Hoàn thành có lỗi" không có frame Figma, DEV theo mô tả AC + palette §4.1.

#### AC-2c → Tự động cập nhật tiến độ (polling)

- **Khi**: `status ∈ {PENDING, RUNNING}` sau khi fetch/refetch.
- **FE phải**: TanStack Query `refetchInterval: 5000` (cố định 5000ms — KHÔNG dùng `pollingIntervalHint` server trả về, hint chỉ tham khảo) cho `priceCalcRunGet`; dừng poll ngay khi `status ∈ {SUCCEEDED, COMPLETED_WITH_ERRORS}` (`refetchInterval: false`); khi transition sang terminal → show toast ("Tính giá hoàn tất" / biến thể có lỗi) + auto-refresh RunInfoGrid + DetailTable + dòng Tổng.
- **State transition**: `polling(RUNNING) → terminal(SUCCEEDED|COMPLETED_WITH_ERRORS)` → toast + re-render (không full-page reload).
- **Component**: `share/toasts/toast` (variant success/warning theo terminal status).
- **GraphQL op**: `priceCalcRunGet` (re-invoked qua `refetchInterval`).
- **i18n keys**: fixed VN toast message.
- **a11y**: toast dùng `role="status"` / `aria-live="polite"` (không chặn focus).
- **Ref**: coverage gap — không có frame Figma cho toast/polling state; DEV theo AC prose + `share/toasts/toast`. Contract: `agg-garage-graph-graphql.md §3f` (HTTP 202 kick-off note).

### Cluster C — Bộ lọc bảng chi tiết

#### AC-2b → Tìm kiếm + bộ lọc bảng chi tiết (client-side)

- **Khi**: user gõ vào ô tìm kiếm hoặc chọn giá trị dropdown "Trạng thái".
- **FE phải**: filter **client-side** trên tập `items[]` đã fetch (KHÔNG gọi lại API tính giá) — search khớp một phần theo `productCode` HOẶC `productName` (debounce 300ms); dropdown "Trạng thái" có 3 option Tất cả/Đã tính/Lỗi, filter theo `item.status` (mapping "Đã tính"=`DONE`, "Lỗi"=`ERROR`; "Tất cả" = không filter). Cả 2 filter áp dụng độc lập trên `items[]`, dòng Tổng (`aggregates`) **KHÔNG đổi theo filter** (BE-computed trên full scope trước filter, xem AC-3).
- **State transition**: filter thay đổi → reset về trang 1 (client pagination) → re-render DetailTable + `no-data` nếu 0 kết quả.
- **Component**: `customs/filter/main-filter` (wrapper) → `share/inputs/input-search` (search) + `customs/filter/single-select-filter-content` (dropdown Trạng thái).
- **GraphQL op**: không gọi lại — pure client filter trên data đã có từ `priceCalcRunGet`.
- **i18n keys**: placeholder fixed "Tìm theo mã và tên sản phẩm nội bộ"; trigger "Trạng thái: {selectedLabel}".
- **a11y**: input có `aria-label="Tìm theo mã và tên sản phẩm nội bộ"`; dropdown trigger có `aria-haspopup="listbox"`.
- **Ref**: Figma node `13575:222210` (FilterBar, §5.3); coverage gap — không có frame open-state cho dropdown.

### Cluster D — Bảng chi tiết theo mã

#### AC-3 → Bảng chi tiết theo mã + dòng Tổng

- **Khi**: run detail load xong / filter thay đổi / trang pagination đổi / polling refetch.
- **FE phải**: render 1 `<Table>` duy nhất (KHÔNG tách 2 bảng — AP-PRC-3) 11 cột: STT, Mã nội bộ, Tên sản phẩm nội bộ, ĐVT chính, Tồn đầu kỳ, Nhập trong kỳ, Xuất trong kỳ, Giá bình quân (căn phải), Số phiếu xuất cập nhật, Trạng thái (badge), Lí do lỗi. Dòng Tổng (`<tfoot>`, `colSpan` theo AC-3: "Tổng" span cột 1-8, "Số phiếu xuất cập nhật" hiện `updatedDeliverySlipCountTotal`, cột "Giá bình quân" và "Lí do lỗi" để trống) **luôn dùng `aggregates` BE-computed** (không tự SUM trên trang hiện tại — tránh sai khi filter/pagination). Client-side pagination trên `items[]` đã filter (mặc định page size 20).
- **State transition**: `success (2+ dòng) | empty (0 dòng sau filter)`.
- **Component**: `share/tables/table` (thead+tbody+tfoot), `share/tables/table-pagination`, `share/emptys/no-data` (empty state).
- **GraphQL op**: `priceCalcRunGet` (field `items[]` + `aggregates`).
- **i18n keys**: fixed VN header labels theo Figma verbatim (giữ nguyên chính tả "Lí do lỗi", "ĐVT chính ").
- **a11y**: table head dùng `<th scope="col">`; dòng Tổng `<tfoot>` với `aria-label="Dòng tổng"`.
- **Ref**: Figma node `13575:222178` (DetailTable, §5.3); SDL `PriceCalcRunItem` + `PriceCalcRunItemsAggregates` (agg-garage-graph-graphql.md §3f.1).

#### AC-4 → Hiển thị mã lỗi trong bảng chi tiết

- **Khi**: 1 dòng có `item.status = ERROR`.
- **FE phải**: render badge "Lỗi" (token error, `bg-[#ef4444]/10 text-[#ef4444]`), cột "Giá bình quân" để trống (`deliveryValue`/`averageUnitPrice` nullable khi ERROR), cột "Lí do lỗi" hiển thị message theo `errorReason` enum (`NEGATIVE_STOCK` → "Do tồn âm"; `ACCOUNTING_MISMATCH` → "Lệch hạch toán"; `SYSTEM_ERROR` → "Do sự cố hệ thống").
- **State transition**: (không transition riêng — thuộc render logic của DetailTable AC-3).
- **Component**: `share/badges/badge-status` (statusMap mở rộng: Đã tính→success, Đang tính→muted, Lỗi→error).
- **GraphQL op**: `priceCalcRunGet` (field `items[].errorReason`).
- **i18n keys**: fixed VN mapping enum → text.
- **a11y**: badge màu error kèm text (không chỉ dựa màu — WCAG).
- **Ref**: coverage gap — không có frame Figma cho dòng "Lỗi"; DEV theo `variants_from_ac` §3 State Table figma spec + enum `PriceCalcErrorReason` (agg-garage-graph-graphql.md §3f.1).

### Cluster E — Hành động chạy lại

#### AC-5 → Nút "Tính lại toàn bộ"

- **Khi**: user click nút primary "Tính lại  toàn bộ" ở PageHeader.
- **FE phải**: gọi mutation `priceCalcRunRecalc(id: runId, input: { runScope: ALL })`; disable nút khi kỳ đã đóng hoặc run hiện đang `PENDING|RUNNING` (BR-PRC-008/BR-AP-CMN-002 — UI hint, xem §4.5); response 202 (hoặc 200 idempotent replay) → hiển thị loading state trên nút + toast "Đã bắt đầu tính lại" + navigate/refetch tới run mới (`sourceRunId` trỏ lại run gốc cho audit).
- **State transition**: `idle → loading (disabled + spinner) → success (toast) | error (toast lỗi + nút trở lại idle)`.
- **Component**: `share/buttons/button` (`variant=default`, `size=lg`).
- **GraphQL op**: `priceCalcRunRecalc`.
- **i18n keys**: label fixed "Tính lại  toàn bộ" (verbatim Figma, 2 space).
- **a11y**: nút có `aria-busy="true"` khi loading.
- **Ref**: Figma node `I13575:103113;17421:80006` (§5.3); §4.6 error mapping; SDL `PriceCalcRunRecalcInput`/`PriceCalcRunKickoff` (agg-garage-graph-graphql.md §3f.1).

#### AC-5b → Nút "Tính lại mã lỗi"

- **Khi**: user click nút outline "Tính lại mã lỗi" ở PageHeader.
- **FE phải**: gọi mutation `priceCalcRunRecalc(id: runId, input: { runScope: ERROR_ONLY })`; **ẩn hoặc disable nút khi run không có mã Lỗi nào** (`run.itemsErrorCount === 0`, tức `status = SUCCEEDED` hoàn toàn); cùng luồng loading/toast/navigate như AC-5.
- **State transition**: `hidden/disabled (no error items) | idle → loading → success | error`.
- **Component**: `share/buttons/button` (`variant=outline`, `size=lg`).
- **GraphQL op**: `priceCalcRunRecalc`.
- **i18n keys**: label fixed "Tính lại mã lỗi ".
- **a11y**: khi ẩn, loại khỏi DOM (không `visibility:hidden` để tránh tab-order rác).
- **Ref**: Figma node `I13575:103113;17421:80016` (§5.3, chỉ có state default trong Figma).

### Cluster F — Phân quyền

#### AC-6 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: bất kỳ persona nào (`garage-owner` hoặc `accountant`) truy cập route.
- **FE phải**: KHÔNG áp RBAC gating riêng cho DETAIL — cả 2 role thấy đủ RunInfoGrid, DetailTable, và có quyền bấm cả 2 nút "Tính lại" như nhau. Route guard chỉ cần kiểm tra tenant đã login (route-level auth chung của app), không thêm role-check cụ thể.
- **State transition**: N/A (không có state riêng theo role).
- **Component**: N/A (không có conditional render theo role).
- **GraphQL op**: N/A.
- **i18n keys**: N/A.
- **a11y**: N/A.
- **Ref**: PKG-W06 §2.2 dual-persona baseline (Critical Rule #6).

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-prc-detail.md` (node `13575:103109`). KHÔNG re-invent layout/spacing/color.
- Design tokens lấy từ `tailwind.config.js` / `src/styles/tokens/**` — KHÔNG hardcode hex/px. Tokens phải khớp §5.3 (đã đối chiếu bundle §G.Y).
- Responsive: canvas Figma desktop chuẩn 1440px; verify desktop trước, tablet/mobile theo Tailwind breakpoint mặc định của repo (không có spec riêng cho breakpoint nhỏ hơn màn này).
- 3 anti-pattern PHẢI tránh (xem Figma spec §8): AP-PRC-1 (bọc RunInfoGrid trong Card — SAI, phải strip phẳng), AP-PRC-2 (render RunInfoGrid 2 cột — SAI, phải 4 cột × 2 hàng), AP-PRC-3 (tách dòng Tổng thành bảng thứ 2 — SAI, phải 1 `<Table>` với `<tfoot>`).
- AC-2 "cụm thông tin đầu màn" — xem figma spec §1 `run_info_grid` (node `15593:104980`); AC-3 "bảng chi tiết + dòng Tổng" — xem figma spec §1 `detail_table_block` (node `13575:222178`).

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | polling | success | error | empty`. Route load = `loading` (skeleton/loading-screen); polling KHÔNG che UI (badge/text "Đang tính" đủ, không full-page loader lặp lại mỗi 5s).
- Error khi recalc (409/503) → `TOAST` (không block navigate khỏi trang).
- KHÔNG silent fail — mọi lỗi GraphQL/REST reach UI qua toast hoặc inline (theo §4.6).

### 4.3 i18n + a11y

- **i18n policy**: W06 dùng **fixed VN labels inline** (KHÔNG dùng i18next) — mirror convention các wave inventory trước (AP/OB) theo layer_priority hiện hành của repo; `i18n_keys: []` frontmatter để trống theo đúng policy override single-locale.
- a11y: RunInfoGrid dùng `<dt>/<dd>` hoặc `aria-label` cặp label-value; table head `<th scope="col">`; nút icon-only (back) có `aria-label`; toast `aria-live="polite"`; keyboard nav Tab qua search → dropdown → table → pagination → 2 nút PageHeader theo DOM order tự nhiên (không cần custom tabIndex).
- Semantic HTML — table dùng `<table>` thật (qua `share/tables/table`), không dùng `<div>` giả bảng.

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` được BE enforce (403 → BFF map `FORBIDDEN_ERROR`) — FE chỉ cần xử lý error code này ở error boundary chung của route, không cần gate UI riêng cho PRC.
- Persona check: `garage-owner` và `accountant` NGANG NHAU — KHÔNG ẩn/disable control theo role (AC-6). KHÔNG show-then-disable cho action nào trên màn này dựa theo role.
- Tab/route gate: chỉ theo auth chung của app (đăng nhập tenant), không có gate bổ sung.

### 4.5 Business rule secondary (UI hint)

BR primary nằm BE (xem paired `be/FEAT-PRC-DETAIL.md §9`). FE chỉ UI hint:

- Disable 2 nút "Tính lại" khi run hiện tại đang `PENDING|RUNNING` (BR-PRC-008 concurrency guard — tránh double-kick-off, BE vẫn là gate thật qua partial unique index).
- Toast khi server reject 409 kỳ đã đóng (`ERR-INV-024`, BR-AP-CMN-002) hoặc 409 run-in-progress (`ERR-INV-029`, BR-PRC-008).
- Ẩn/disable "Tính lại mã lỗi" khi `itemsErrorCount = 0` (BR-PRC-007 — không có gì để recalc theo scope ERROR_ONLY).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` (kỳ đã đóng) | TOAST | `share/toasts/toast` (error) | AC-5, AC-5b |
| `ERR-INV-029` (run đang chạy) | TOAST | `share/toasts/toast` (error) | AC-5, AC-5b |
| `ERR-CMN-not-found` (404, run không tồn tại/khác tenant) | EMPTY_STATE (redirect về list + toast) | `share/emptys/no-data` + `share/toasts/toast` | AC-1 |
| `FORBIDDEN_ERROR` (feature flag off) | EMPTY_STATE (route-level error boundary) | route error boundary | AC-1 |
| 503 (Temporal outage khi recalc) | TOAST | `share/toasts/toast` (error) | AC-5, AC-5b |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `PriceCalcRunDetailPage` | `/inventory/price-calc-runs/:runId` | NEW | `13575:103109` | AC-1 – AC-6 |

### 5.2 Components new/modified

> Toàn bộ element map được về `share/*`/`customs/*` đã `status: ready` trong `.claude/references/web-component-registry.yaml` — KHÔNG cần build-new component nào cho màn này (xác nhận qua figma spec §4 Component Prop Map).

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `title`, `onBack`, action slot (2 button) | — | **Priority 2 — share/** | AC-1 |
| `Button` (recalc all) | `src/components/share/buttons/button.tsx` | REUSE | `variant="default"`, `size="lg"`, `isLoading` | local | **Priority 2 — share/** | AC-5 |
| `Button` (recalc error-only) | `src/components/share/buttons/button.tsx` | REUSE | `variant="outline"`, `size="lg"`, `isLoading` | local | **Priority 2 — share/** | AC-5b |
| `DescriptionItem` × 8 | `src/components/share/displays/description-item.tsx` | REUSE | `label`, `value` | — | **Priority 2 — share/** | AC-2 |
| `MainFilter` | `src/components/customs/filter/main-filter.tsx` | REUSE | filter config (search + single-select) | filter state | **Priority 1 — customs/** (domain filter bar) | AC-2b |
| `InputSearch` | `src/components/share/inputs/input-search.tsx` | REUSE | `placeholder`, `onChange` (debounce 300ms) | local | **Priority 2 — share/** | AC-2b |
| `SingleSelectFilterContent` | `src/components/customs/filter/single-select-filter-content.tsx` | REUSE | `options`, `value`, `onChange` | local | **Priority 1 — customs/** | AC-2b |
| `Table` (+ tfoot Tổng) | `src/components/share/tables/table.tsx` | REUSE | `columns`, `data`, `footerRow` | — | **Priority 2 — share/** | AC-3, AC-4 |
| `BadgeStatus` | `src/components/share/badges/badge-status.tsx` | REUSE | `status`, `statusMap` (extend Đã tính/Đang tính/Lỗi) | — | **Priority 2 — share/** | AC-3, AC-4 |
| `TablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `page`, `pageSize`, `total`, client-side | local | **Priority 2 — share/** | AC-3 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `message` | — | **Priority 2 — share/** | AC-3 |
| `Toast` | `src/components/share/toasts/toast.tsx` | REUSE | `variant`, `message` | — | **Priority 2 — share/** | AC-2c, AC-5, AC-5b |

### 5.3 Design tokens & Figma refs

> Design tokens khớp tokens detected ở bundle §G.Y "Design tokens referenced" (`bg-accent`, `text-foreground`, `text-muted-foreground`, `text-primary`) + full token map trong figma spec §2.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-accent` (`#f4f4f5`) | tailwind config | Nền table head + nền dòng Tổng | AC-3 |
| `text-foreground` (`#18181b`) | tailwind config | Title, value RunInfoGrid, cell table | AC-1, AC-2, AC-3 |
| `text-muted-foreground` (`#71717a`) | tailwind config | Label RunInfoGrid, placeholder search | AC-2, AC-2b |
| `bg-[#f0fdf4]` / `text-[#16a34a]` | figma spec §2 | Badge "Đã tính" (success) | AC-3 |
| `bg-[#ef4444]/10` / `text-[#ef4444]` | figma spec §2 (đề xuất, không có frame Figma) | Badge "Lỗi" (error) | AC-4 |
| `bg-[#0052ff]` | tailwind config | Nút primary "Tính lại toàn bộ" | AC-5 |

> **Figma source-of-truth**: mọi visual/micro-interaction/responsive theo `Product/ux/figma-web/wave06-prc-detail.md`. Coverage gaps (không có frame Figma — DEV theo AC prose + token suy luận, cần BA/design confirm nếu có drift): trạng thái "Đang tính"/"Hoàn thành có lỗi" (AC-2), dòng "Lỗi" trong bảng (AC-3/AC-4), dropdown open-state (AC-2b), empty state bảng (AC-3), toast hoàn tất (AC-2c).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | TanStack query key | Fragments | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunGet` | query | `src/api/graphql/price-calc-run/price-calc-run-get.graphql` | `['price-calc-run', runId]` | `PriceCalcRunDetailFragment` | AC-1, AC-2, AC-2c, AC-3, AC-4 |
| `priceCalcRunRecalc` | mutation | `src/api/graphql/price-calc-run/price-calc-run-recalc.graphql` | — (invalidate `['price-calc-run', runId]` on success) | `PriceCalcRunKickoffFragment` | AC-5, AC-5b |

> Cả 2 op phải tồn tại ở paired BFF FEAT `agg-garage-graph-graphql.md §3f` (reviewer item #16 enforce) — đã verify qua bundle §G (`✅ §0 Wave Index resolved for W06 → §3f`).

### 6.2 REST endpoints consumed direct (bypass BFF)

_(không có — mọi truy cập đi qua BFF GraphQL theo Critical Rule #1 boundary isolation)_

### 6.3 State management

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (run detail + items) | TanStack Query | — | `['price-calc-run', runId]`, `refetchInterval: status ∈ {PENDING,RUNNING} ? 5000 : false` | AC-2, AC-2c, AC-3, AC-4 |
| Recalc mutation | TanStack Query | — | `useMutation` invalidate `['price-calc-run', runId]` | AC-5, AC-5b |
| Client filter state (search + status) | React local state (`useState`) | component-local | `{ keyword, itemStatus }` | AC-2b |
| Client pagination state | React local state (`useState`) | component-local | `{ page, pageSize }` — reset về 1 khi filter đổi | AC-3 |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/price-calc-runs/:runId` | `PriceCalcRunDetailPage` | `loader({ params }) => queryClient.ensureQueryData(['price-calc-run', params.runId])` | Auth chung app (không role-specific — AC-6) | AC-1 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/inventory-price-calc-run/pages/` | `PriceCalcRunDetailPage.tsx` | NEW | compose share/customs components | ~180 | AC-1 – AC-6 |
| `src/features/inventory-price-calc-run/components/` | `PriceCalcRunInfoGrid.tsx` | NEW | `share/displays/description-item` wrapper | ~60 | AC-2 |
| `src/features/inventory-price-calc-run/components/` | `PriceCalcRunDetailTable.tsx` | NEW | `share/tables/table` wrapper + `tfoot` Tổng | ~140 | AC-3, AC-4 |
| `src/features/inventory-price-calc-run/components/` | `PriceCalcRunDetailFilterBar.tsx` | NEW | `customs/filter/main-filter` wrapper | ~50 | AC-2b |
| `src/features/inventory-price-calc-run/hooks/` | `usePriceCalcRunDetail.ts` | NEW | TanStack Query wrapper + polling logic | ~50 | AC-1, AC-2c |
| `src/features/inventory-price-calc-run/hooks/` | `usePriceCalcRunRecalc.ts` | NEW | TanStack mutation wrapper | ~35 | AC-5, AC-5b |
| `src/features/inventory-price-calc-run/types/` | `price-calc-run.types.ts` | NEW | TypeScript types mirror SDL | ~30 | — |
| `src/api/graphql/price-calc-run/` | `price-calc-run-get.graphql` | ADDITIVE | persisted query | ~30 | AC-1, AC-2, AC-3, AC-4 |
| `src/api/graphql/price-calc-run/` | `price-calc-run-recalc.graphql` | ADDITIVE | persisted mutation | ~15 | AC-5, AC-5b |
| `src/api/generated/` | `price-calc-run-get.generated.ts` / `price-calc-run-recalc.generated.ts` | AUTO-GEN | codegen | — | — |
| `src/routes/` | `inventory-price-calc-run-routes.tsx` | NEW (route file) | TanStack Router `createRoute` | ~20 | AC-1 |
| `tests/` | `tests/features/inventory-price-calc-run/PriceCalcRunDetailPage.test.tsx` | NEW | Vitest + RTL | ~180 | AC-1 – AC-6 |

## 8. Implementation sequence DAG (FE — S6)

```
(← BFF tier S5: SDL §3f priceCalcRunGet/priceCalcRunRecalc stable)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (wave06-prc-detail.md)
    Exit: E2E happy path green (smoke — mở màn, polling terminal, filter, recalc)
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + polling + client filter/pagination | features + routes + hooks | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. Primary enforcement = BE tier (`features/be/FEAT-PRC-DETAIL.md §9`).

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-PRC-014` | NORMAL | Collapse enum BE 4 trạng thái → 3 hiển thị UI (`PENDING`+`RUNNING` = "Đang tính") | `PriceCalcRunInfoGrid.tsx` | AC-2 | Chỉ presentation, BE giữ nguyên 4-state |
| `BR-PRC-016` | NORMAL | Poll 5s cố định khi `PENDING|RUNNING`, dừng khi terminal | `usePriceCalcRunDetail.ts` | AC-2c | Job chạy nền, UI không block |
| `BR-PRC-007` | NORMAL | Item ERROR → ẩn `averageUnitPrice`, hiện `errorReason` mapping | `PriceCalcRunDetailTable.tsx` | AC-4 | BE final enforce field nullability |
| `BR-PRC-005` | NORMAL | Hiển thị `updatedDeliverySlipCount` per item + Tổng — read-only | `PriceCalcRunDetailTable.tsx` | AC-3 | Không cho edit |
| `BR-PRC-008` | CORNERSTONE | Disable 2 nút recalc khi run hiện tại `PENDING|RUNNING` | `PriceCalcRunDetailPage.tsx` | AC-5, AC-5b | BE final gate qua partial unique index |
| `BR-AP-CMN-002` | CORNERSTONE | Toast lỗi `ERR-INV-024` khi kỳ đã đóng, không tự ẩn nút trước (BE là gate thật) | `usePriceCalcRunRecalc.ts` | AC-5, AC-5b | Kỳ khoá — advisory UI, BE final |

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | route load + PageHeader render |
| AC-2 | UI | test-ui | RunInfoGrid 4×2 grid, 3 giá trị Trạng thái |
| AC-2b | UI (filter) | test-ui | search debounce + dropdown 3 option, client-side |
| AC-2c | UI (polling) | test-ui | mock `PENDING → SUCCEEDED`, verify refetchInterval dừng + toast |
| AC-3 | UI (table) | test-ui | 11 cột + dòng Tổng dùng `aggregates`, không FE SUM |
| AC-4 | UI (negative — item ERROR) | test-ui | badge Lỗi + Giá bình quân trống + Lí do lỗi |
| AC-5 | UI (action) | test-ui | click recalc ALL → mutation call + disable khi RUNNING |
| AC-5b | UI (conditional visibility) | test-ui | ẩn/disable khi `itemsErrorCount=0` |
| AC-6 | UI (RBAC visibility) | test-ui + test-isolation | dual persona — cùng quyền |
| (smoke) | E2E happy path | test-e2e | Playwright — mở màn → filter → recalc |

## 11. i18n & a11y

### 11.1 i18n keys

_(trống — W06 dùng fixed VN labels inline, không dùng i18next; xem §4.3)_

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | Nút back có `aria-label`; heading `<h1>` | manual QA |
| AC-2 | RunInfoGrid dùng `<dt>/<dd>` hoặc `aria-label` cặp label-value | screen reader |
| AC-2c | Toast `aria-live="polite"` | không chặn focus |
| AC-3 | Table head `<th scope="col">`, `<tfoot>` có `aria-label="Dòng tổng"` | screen reader announce |
| AC-4 | Badge "Lỗi" không chỉ dựa màu — kèm text | WCAG contrast |
| AC-5, AC-5b | Nút loading có `aria-busy="true"` | keyboard + SR |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-DETAIL.md` | DRAFT (author song song W06 batch) | BR primary enforcement, contract source (`gf-accounting-api.md §5`) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-DETAIL.md` | DRAFT (author song song W06 batch) | GraphQL ops consumed (§6.1) — `agg-garage-graph-graphql.md §3f` |
| Mobile | — | N/A | PRC ngoài phạm vi mobile W06 (chỉ `FEAT-STK-LIST-V2` mobile — PKG-W06 §Overview) |

**Source ID consistency** (item 18): `source_feat_sha` `5069300d23bec20c82825b5dda932e43a0e1362395d074b4693be478fa893b08` phải identical với BE/BFF files khi authored.

## 13. References

- **Source**: [`Product/features/FEAT-PRC-DETAIL.md`](../../../../../Product/features/FEAT-PRC-DETAIL.md) v24
- **Paired BE**: [`features/be/FEAT-PRC-DETAIL.md`](../be/FEAT-PRC-DETAIL.md)
- **Paired BFF**: [`features/bff/FEAT-PRC-DETAIL.md`](../bff/FEAT-PRC-DETAIL.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md)
- **Figma spec**: [`Product/ux/figma-web/wave06-prc-detail.md`](../../../../../Product/ux/figma-web/wave06-prc-detail.md)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **BFF contract**: [`Architecture/api/agg-garage-graph-graphql.md §3f`](../../../../../Architecture/api/agg-garage-graph-graphql.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-PRC-DETAIL` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map 9/9 AC-ID, §4 visual fidelity (3 anti-pattern figma) + state + i18n (fixed VN) + a11y + RBAC (dual-persona ngang quyền) + BR secondary + error mapping, §5-§12 FE-specific (screens/components toàn `ready` registry/GraphQL consumed `priceCalcRunGet`+`priceCalcRunRecalc`/client-side filter+pagination/cross-tier pair). Source FEAT chỉ audit. |
