---
type: execution
artifact_kind: converted-feature
tier_role: fe-web                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-PRC-LIST.md"
source_version: 12
source: "gen-execution-spec"
source_feat_id: "FEAT-PRC-LIST"
source_feat_sha: "5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae"
generated_at: "2026-07-31T07:10:00+00:00"
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
consumes_backend_feats: ["FEAT-PRC-LIST"]
consumes_bff_feats: ["FEAT-PRC-LIST"]
i18n_keys: []                                          # Project context = desktop-only, no-i18n (PKG-W06 §2.2.4) — fixed VN labels, KHÔNG dùng i18next
screens_touched: ["src/features/price-calc-runs/pages/price-calc-run-list-page.tsx"]
figma_refs:
  - "Product/ux/figma-web/wave06-prc-list.md (node 14507:89265 — Danh sách tính giá xuất kho: có dữ liệu 14547:102220 / rỗng 13575:100076)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "n/a-not-provided-in-bundle"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-PRC-LIST (FE Web): Danh sách lịch sử tính giá xuất kho

> **FE Web tier — authoritative cho dev**. Tài liệu này là spec duy nhất agent FE Web cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-PRC-LIST` |
| Tier | **fe-web** |
| Experience | `garage-web` |
| Platform | web (React 19 / Vite / shadcn/ui) |
| Parent Epic | [`EP-INVENTORY-ACCOUNTING-PERIOD`](../../../../../Product/epics/EP-INVENTORY-ACCOUNTING-PERIOD.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `src/features/price-calc-runs/pages/price-calc-run-list-page.tsx` (route `/inventory/price-calc-runs`) |
| Cross-tier consume | BE: `FEAT-PRC-LIST` (boundary `gf-accounting`) \| BFF: `FEAT-PRC-LIST` (module `price-calc-run`, `agg-garage-graph`) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-PRC-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) |
| Source version | v12 |
| Source SHA | `5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae` |
| Generated at | 2026-07-31T07:10:00+00:00 |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần tra cứu lại các lần đã chạy tính giá vốn xuất kho theo phương pháp bình quân gia quyền cuối kỳ, để biết kỳ/kho nào đã được chốt giá, ai chạy, khi nào, và kết quả (thành công hay có lỗi). Màn hình này là cửa ngõ điều hướng: từ đây người dùng mở lại chi tiết một lần tính, xóa log không còn cần, hoặc khởi chạy một lần tính giá mới. Đây là bước khởi đầu của luồng nghiệp vụ tính giá xuất kho (PRC) trong quy trình chốt sổ kế toán cuối kỳ.

## 2. Trách nhiệm FE Web (garage-web)

- Render màn **"Danh sách tính giá xuất kho"** tại route `/inventory/price-calc-runs` (tab menu con dưới "Kho hàng" per PKG-W06 §2.2.4 T-web-Nav1) — gồm mô tả ngắn, bộ lọc, bảng lịch sử, phân trang, nút CTA "Tính giá".
- User flow chính: mở màn → xem bảng log (mới nhất trên đầu) → lọc theo phương pháp/ngày thực hiện (tùy chọn) → "Xem" 1 dòng để sang chi tiết, hoặc "Xóa" 1 dòng, hoặc bấm "Tính giá" để sang form tạo lượt tính mới.
- State machine UI: `idle → loading (skeleton bảng) → success (render rows hoặc empty state) → error (toast)`; riêng thao tác Xóa có state phụ `confirm → submitting → success/error`.
- **Component reuse-first — priority `customs/` > `share/` > `ui/`** (PKG §2.2.4 Bước 1): registry `.claude/references/web-component-registry.yaml` đã cover đủ — bảng (`data-table-with-pagination` → `share/tables/table-pagination`), filter bar (`customs/filter/*`), empty state (`share/emptys/no-data`), badge trạng thái (`share/badges/badge-status`). KHÔNG cần build-new cho màn này (xem §5.2).
- **Figma spec là visual SSOT**: `Product/ux/figma-web/wave06-prc-list.md` (node `14507:89265`) — 2 screen state "Danh sách có dữ liệu" (`14547:102220`) và "Danh sách rỗng" (`13575:100076`). §4/§5 references cross-ref các section này.
- GraphQL consume từ BFF `agg-garage-graph`: query `priceCalcRunList` (bảng + filter + phân trang) và mutation `priceCalcRunDelete` (xóa log). Điều hướng "Xem"/"Tính giá" KHÔNG gọi op tại màn này — chỉ navigate sang route của `FEAT-PRC-DETAIL`/`FEAT-PRC-CREATE` (paired fe-web spec riêng).
- RBAC render: route mở cho cả 2 persona `garage-owner` + `accountant` ngang quyền (BR-AP-CMN-002) — KHÔNG ẩn/khóa control theo role. Route gate bởi feature flag `Inventory:InventoryV2` (BFF fail-fast khi flag OFF → `FORBIDDEN_ERROR`).

## 3. Hành vi cần triển khai (FE Web behaviour map)

### Cluster A — Mở màn & hiển thị bảng lịch sử

#### AC-1 → Mở màn danh sách

- **Khi**: user (garage-owner/accountant) truy cập route `/inventory/price-calc-runs` (từ menu con "Tính giá xuất kho" dưới "Kho hàng").
- **FE phải**: render `PriceCalcRunListPage` gồm `share/layouts/page-header` (title "Danh sách tính giá xuất kho" + mô tả "Tra cứu các lần thực hiện tính giá vốn xuất kho trong kỳ và mở form thực hiện tính giá." + CTA "Tính giá" bên phải), filter bar, bảng lịch sử, pagination footer. Gọi `priceCalcRunList` ngay khi mount với filter mặc định rỗng, `page=0`, `size=20`.
- **State transition**: `idle → loading` (skeleton bảng) `→ success` (render rows hoặc `share/emptys/no-data` nếu `content=[]`) `→ error` (toast lỗi tải danh sách).
- **Component**: `share/layouts/page-header`, `share/tables/table-pagination`, `share/emptys/no-data`.
- **GraphQL op**: `priceCalcRunList(input: PriceCalcRunSearchInput!)`.
- **a11y**: `<h1>` cho page title; loading state announce qua `aria-busy` trên table container.
- **Ref**: paired BFF FEAT §6.1 op `priceCalcRunList`; Figma node `14547:102220` (data) / `13575:100076` (empty) — §5.3.

#### AC-2 → Cột hiển thị

- **Khi**: bảng đã có dữ liệu (`content.length > 0`).
- **FE phải**: render 11 cột theo đúng thứ tự: STT, Kỳ kế toán (`periodName`), Từ ngày (`fromDate`), Đến ngày (`toDate`), Kho (`warehouseName`), Phương pháp tính giá vốn (`pricingMethod` → hiển thị "Bình quân gia quyền cuối kỳ"), Tài khoản thực hiện (`executedByName`, fallback hiển thị khi null), Ngày giờ thực hiện (`executedAt`), Số mã (`itemsResolvedCount`), Trạng thái, Thao tác (Xem, Xóa). Cột Trạng thái map từ `status` BE (`PENDING`/`RUNNING` → chip **"Đang tính"**; `SUCCEEDED` → **"Thành công"**; `COMPLETED_WITH_ERRORS` → **"Hoàn thành có lỗi"**) — FE không tự phân biệt PENDING vs RUNNING trên UI (BR-PRC-014).
- **State transition**: không áp dụng (render tĩnh theo data đã fetch).
- **Component**: `share/tables/table` + `share/badges/badge-status` (cột Trạng thái) + `share/buttons/button` (icon action Xem/Xóa trong cột Thao tác).
- **GraphQL op**: field-selection trên response `priceCalcRunList` (`PriceCalcRun` type — không gọi op riêng).
- **a11y**: header cột dùng `<th scope="col">`; icon action có `aria-label` ("Xem chi tiết", "Xóa lần tính").
- **Ref**: paired BFF FEAT §6.1 SDL `PriceCalcRun`; Naming Registry `gf-accounting-api.md §6.2` (canonical field names — KHÔNG rename BFF/FE); Figma node `14547:102229` (section Sản phẩm/Table) — §5.3.

#### AC-3 → Mỗi dòng = 1 lần chạy (log)

- **Khi**: user bấm "Tính giá" lại cùng phạm vi kỳ/kho (thao tác diễn ra ở `FEAT-PRC-CREATE`, kết quả phản ánh tại màn này).
- **FE phải**: render 1 dòng cho mỗi phần tử `content[]` trả về từ `priceCalcRunList` — KHÔNG tự gộp/dedupe theo (kỳ, kho). FE passthrough tham số sort mặc định `sort: "executedAt,desc"` khi build request (BR-PRC-018) — KHÔNG tự resort client-side; nếu user chưa đổi sort, giữ nguyên order từ BE.
- **State transition**: sau khi tạo log mới ở `FEAT-PRC-CREATE` và điều hướng quay lại LIST (hoặc user tự refresh/refetch), bảng phải hiển thị log mới lên đầu (do BE sort).
- **Component**: `share/tables/table`.
- **GraphQL op**: `priceCalcRunList` (field `sort` trong `PriceCalcRunSearchInput`, default giữ nguyên server default).
- **a11y**: không riêng.
- **Ref**: BR-PRC-009/BR-PRC-010/BR-PRC-018 (BE enforce; FE chỉ passthrough) — xem be/FEAT-PRC-LIST.md §9.

### Cluster B — Bộ lọc & phân trang

#### AC-4 → Bộ lọc

- **Khi**: user tương tác 2 filter chip trên filter bar — **"Phương pháp"** và **"Ngày thực hiện"**.
- **FE phải**: render filter bar bằng `customs/filter/filter` (container) + `customs/filter/filter-option` (từng chip). Chip **"Phương pháp"** hiển thị giá trị cố định "Phương pháp bình quân cuối kỳ" (enum `PricingMethod` hiện chỉ có `PWA` — chip vẫn theo pattern filter chuẩn có trailing icon `ArrowDown` per Figma, nhưng effectively single-option cho tới khi có phương pháp thứ 2). Chip **"Ngày thực hiện"** dùng `share/date-picker/date-range-filter` bên trong popover content (`customs/filter/filter-popover-content`) để chọn khoảng `executedFrom`/`executedTo`. Khi user apply filter → gọi lại `priceCalcRunList` với `page` reset về `0`.
- **State transition**: filter apply → `loading` (refetch) → `success`/`error` (giữ nguyên filter state khi lỗi).
- **Component**: `customs/filter/filter`, `customs/filter/filter-option`, `customs/filter/filter-popover-trigger`, `customs/filter/single-select-filter-content` (Phương pháp), `share/date-picker/date-range-filter` (Ngày thực hiện).
- **GraphQL op**: `priceCalcRunList(input: { pricingMethod, executedFrom, executedTo, page: 0, size, sort })`.
- **i18n keys**: không dùng i18next — nhãn cố định tiếng Việt "Phương pháp" / "Ngày thực hiện" (xem §4.3).
- **a11y**: popover trigger có `aria-expanded` + keyboard mở bằng Enter/Space; Escape đóng popover.
- **Ref**: paired BFF FEAT §6.1 input `PriceCalcRunSearchInput`; Figma node `14547:102226` (section Fillter, icon `vuesax/linear/arrow-down`) — §5.3.

#### AC-5 → Phân trang

- **Khi**: cuối bảng, user đổi số dòng/trang hoặc điều hướng trang.
- **FE phải**: render `share/tables/table-pagination` với page-size selector mặc định **20** + điều hướng trang, tổng số trang/phần tử lấy từ `totalPages`/`totalElements` response. Đổi page-size → reset `page=0` + refetch.
- **State transition**: đổi trang/page-size → `loading` (chỉ vùng bảng, filter bar giữ nguyên) → `success`.
- **Component**: `share/tables/table-pagination`.
- **GraphQL op**: `priceCalcRunList(input: { page, size })`.
- **a11y**: pagination control có `aria-label="Điều hướng trang"`, current page `aria-current="page"`.
- **Ref**: Figma node `14547:102370` (section Table Pagination) — §5.3.

### Cluster C — Thao tác & điều hướng

#### AC-6 → Thao tác

- **Khi**: user bấm icon "Xem" hoặc "Xóa" trên 1 dòng, hoặc bấm nút "Tính giá" ở page header.
- **FE phải**:
  - "Xem" → `navigate` sang route chi tiết `/inventory/price-calc-runs/$id` (component `PriceCalcRunDetailPage`, thuộc `FEAT-PRC-DETAIL` fe-web spec) — KHÔNG gọi GraphQL tại đây, chỉ điều hướng.
  - "Xóa" → mở `share/dialogs/alert-confirm` xác nhận → confirm → gọi mutation `priceCalcRunDelete(id)` → thành công: đóng dialog + toast + refetch `priceCalcRunList` (giữ nguyên filter/page hiện tại, trừ khi dòng cuối trang bị xóa hết → lùi về trang trước); lỗi: đóng dialog + toast lỗi theo error code mapping (§4.6) — KHÔNG optimistic remove trước khi BE xác nhận (xóa log có thể bị chặn 409).
  - "Tính giá" (header CTA) → `navigate` sang route tạo mới của `FEAT-PRC-CREATE` — KHÔNG gọi GraphQL tại đây.
- **State transition**: Xóa: `idle → dialog-open → submitting → success (toast + refetch) / error (toast, dialog closed)`.
- **Component**: `share/buttons/button` (icon Xem/Xóa + CTA "Tính giá"), `share/dialogs/alert-confirm`, `share/toasts/toast`.
- **GraphQL op**: `priceCalcRunDelete(id: ID!)`.
- **Test ID convention** (PKG-W06 §2.2.4): `row-run-{id}`, `button-{action}` (vd `button-view`, `button-delete`, `button-tinh-gia`), `dialog-{name}` (vd `dialog-confirm-delete`).
- **a11y**: confirm dialog focus-trap + focus trả về button trigger sau khi đóng.
- **Ref**: paired BFF FEAT §6.1 op `priceCalcRunDelete`; BE 409 `ERR-INV-024`/`ERR-INV-029` — xem §4.6.

### Cluster D — Phân quyền & phạm vi garage

#### AC-7 → Phân quyền và phạm vi garage

- **Khi**: bất kỳ persona nào (`garage-owner` hoặc `accountant`) truy cập route.
- **FE phải**: cho phép cả 2 persona truy cập route + thao tác ngang quyền — KHÔNG có control nào bị ẩn/khóa riêng theo role trên màn này (khác các FEAT khác có RBAC phân hóa). Route guard duy nhất là feature flag `Inventory:InventoryV2` (redirect/empty-state khi OFF, theo pattern chung của repo — không phải RBAC theo role). Dữ liệu hiển thị đã tenant-scoped từ BE (`TenantFilter`) — FE không tự filter thêm theo garage/tenant.
- **State transition**: không áp dụng (static gate).
- **Component**: route guard wrapper (existing pattern repo, không phải component mới).
- **GraphQL op**: N/A (RBAC không qua GraphQL op riêng cho màn này).
- **a11y**: không riêng.
- **Ref**: BR-AP-CMN-002 — xem be/FEAT-PRC-LIST.md §9.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Bám `Product/ux/figma-web/wave06-prc-list.md` (node `14507:89265`) — 2 screen state: "Danh sách có dữ liệu" (`14547:102220`), "Danh sách rỗng" (`13575:100076`). KHÔNG re-invent layout/spacing/color.
- Design tokens detected ở figma spec: `bg-accent`, `text-foreground`, `text-muted-foreground`, `text-primary` (§5.3). Badge trạng thái (3 màu semantic — Đang tính/Thành công/Hoàn thành có lỗi) cần thêm token success/warning từ `tailwind.config.js` — CHƯA detect trong figma extract, verify với `share/badges/badge-status` existing variant mapping khi impl thay vì tự bịa mã màu mới.
- Responsive: desktop-only (PKG-W06 §2.2.4 "Project context: desktop-only, no-i18n") — KHÔNG cần optimize mobile/tablet breakpoint cho màn này.
- Visual AC cross-ref: AC-1 header → node `14547:102224`; AC-2 table → node `14547:102229`; AC-4 filter → node `14547:102226`; AC-5 pagination → node `14547:102370`; AC-1 empty state → node `14547:103305` / `13575:100076`.

### 4.2 State machine + error handling

- State transition tường minh: `idle | loading | success | error` cho cả list-fetch, filter-apply, pagination, delete-flow (xem §3 mỗi AC).
- Error → render theo display mode ở §4.6. KHÔNG silent fail — mọi lỗi GraphQL (kể cả field lỗi trong union `ErrorResponse`) phải reach UI (toast) hoặc log.
- Loading list ban đầu dùng skeleton bảng (KHÔNG full-page loading-screen — chỉ vùng bảng).

### 4.3 i18n + a11y

- **KHÔNG dùng i18next** — fixed VN labels inline, theo project context "desktop-only, no-i18n" (PKG-W06 §2.2.4 "**5 route** (2 PRC + 3 report)... Project context: desktop-only, no-i18n"). `i18n_keys: []` frontmatter đúng theo policy override này — KHÔNG phải thiếu sót.
- a11y: table header semantic (`<th scope="col">`), icon-only action button có `aria-label`, dialog xác nhận focus-trap, pagination `aria-current`, filter popover keyboard nav (Tab/Enter/Escape).
- Semantic HTML — KHÔNG dùng `<div>` cho clickable row action.

### 4.4 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` gate toàn bộ route (BFF `@FeatureOn` fail-fast → `FORBIDDEN_ERROR` khi OFF).
- Persona: `garage-owner` + `accountant` ngang quyền — KHÔNG conditional render theo role trên màn này (BR-AP-CMN-002).
- Route guard: dual persona full access, KHÔNG RBAC-gated riêng (per PKG-W06 §2.2.4 "Authorization/route guard").

### 4.5 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired be/FEAT-PRC-LIST.md §9). FE chỉ UI hint:
  - Filter "Phương pháp"/"Ngày thực hiện" là client-side query-param build only — validate range hợp lệ (executedFrom ≤ executedTo) trước khi gọi query.
  - Disable nút "Xóa" khi dòng đang ở trạng thái không hợp lệ để xóa KHÔNG cần thiết ở FE (BE tự trả 409 `ERR-INV-024`/`ERR-INV-029`) — FE show toast lỗi theo response thay vì pre-disable, vì trạng thái kỳ đóng không có sẵn tại LIST row data.
  - Toast/dialog khi server reject với error code (§4.6).

### 4.6 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Component | Source AC |
|---|---|---|---|
| `ERR-INV-024` (kỳ đã đóng) | TOAST | `share/toasts/toast` | AC-6 (Xóa) |
| `ERR-INV-029` (log đang chạy — run-in-progress) | TOAST | `share/toasts/toast` | AC-6 (Xóa) |
| `ERR-CMN-not-found` | TOAST | `share/toasts/toast` | AC-6 (Xóa — record đã bị xóa bởi user khác) |
| `ERR-CMN-validation` | INLINE (filter form) | `customs/filter/filter-option` | AC-4 |
| `FORBIDDEN_ERROR` (feature flag OFF) | EMPTY_STATE / redirect | route guard | AC-7 |

---

## 5. Screen / Component breakdown (FE — primary content)

### 5.1 Screens touched

| Screen | Route path | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `PriceCalcRunListPage` | `/inventory/price-calc-runs` | NEW | `14547:102220` (data) / `13575:100076` (empty) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7 |

> Menu entry "Tính giá xuất kho" thêm vào `src/layouts/home/modules/constants.ts` dưới parent "Kho hàng" (T-web-Nav1, PKG-W06 §2.2.4) — MODIFY, không phải screen riêng.

### 5.2 Components new/modified

> Registry `.claude/references/web-component-registry.yaml` (v16) đủ cover toàn bộ màn — **KHÔNG build-new component** (PKG-W06 §2.2.4 xác nhận). KG `implementation.components` trống cho boundary này — author scan registry + filesystem convention `src/components/{customs,share,ui}/` theo priority thay vì KG.

| Component | Path | Change type | Props | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|---|
| `PageHeader` | `src/components/share/layouts/page-header.tsx` | REUSE | `{ title, description, actions }` | — | **Priority 2 — share/** (registry `page-header`) | AC-1 |
| `Filter` | `src/components/customs/filter/filter.tsx` | REUSE | `{ children }` (filter context provider) | filter state | **Priority 1 — customs/** (registry `filter-panel`) | AC-4 |
| `FilterOption` | `src/components/customs/filter/filter-option.tsx` | REUSE | `{ label, variant, value }` | selected value | **Priority 1 — customs/** (registry `filter-popover-trigger`/`filter-single-select`) | AC-4 |
| `SingleSelectFilterContent` | `src/components/customs/filter/single-select-filter-content.tsx` | REUSE | `{ options, value, onChange }` | — | **Priority 1 — customs/** (chip "Phương pháp", single option `PWA`) | AC-4 |
| `DateRangeFilter` | `src/components/share/date-picker/date-range-filter.tsx` | REUSE | `{ from, to, onChange }` | — | **Priority 2 — share/** (chip "Ngày thực hiện") | AC-4 |
| `Table` | `src/components/share/tables/table.tsx` | REUSE | `{ columns, data }` | — | **Priority 2 — share/** (registry `data-table`) | AC-2, AC-3 |
| `TablePagination` | `src/components/share/tables/table-pagination.tsx` | REUSE | `{ page, size, total, onChange }` | page/size | **Priority 2 — share/** (registry `data-table-with-pagination`) | AC-5 |
| `BadgeStatus` | `src/components/share/badges/badge-status.tsx` | REUSE | `{ status }` | — | **Priority 2 — share/** (cột Trạng thái: PENDING/RUNNING→"Đang tính", SUCCEEDED→"Thành công", COMPLETED_WITH_ERRORS→"Hoàn thành có lỗi") | AC-2 |
| `NoData` | `src/components/share/emptys/no-data.tsx` | REUSE | `{ message }` | — | **Priority 2 — share/** (registry `no-data`, verbatim "Không có dữ liệu") | AC-1 (EC-1) |
| `Button` | `src/components/share/buttons/button.tsx` | REUSE | `{ variant, size, onClick, isLoading }` | — | **Priority 2 — share/** (CTA "Tính giá" + icon action Xem/Xóa) | AC-1, AC-6 |
| `AlertConfirm` | `src/components/share/dialogs/alert-confirm.tsx` | REUSE | `{ title, description, onConfirm }` | — | **Priority 2 — share/** (confirm trước Xóa) | AC-6 |
| `Toast` (`toastCustom`) | `src/components/share/toasts/toast.tsx` | REUSE | variant success/error | — | **Priority 2 — share/** (kết quả Xóa) | AC-6 |

### 5.3 Design tokens & Figma refs

> Design tokens dưới đây khớp tokens detected ở bundle §G.Y "Design tokens referenced" — KHÔNG mở rộng ngoài set này trừ khi đã verify qua `tailwind.config.js`/`src/styles/tokens/**` khi impl.

| Token | Source | Usage | AC ref |
|---|---|---|---|
| `bg-accent` | `tailwind.config.js` | filter chip / row hover background | AC-4, AC-3 |
| `text-foreground` | tokens | text nội dung chính (cột dữ liệu) | AC-2 |
| `text-muted-foreground` | tokens | label phụ, mô tả header, placeholder filter | AC-1, AC-4 |
| `text-primary` | tokens | CTA "Tính giá" text/icon accent | AC-1 |

> **Figma source-of-truth**: `Product/ux/figma-web/wave06-prc-list.md`. Icon catalog: `vuesax/linear/arrow-down` (iconsax `ArrowDown`, trailing icon chip filter). Screenshots manifest: `_full.png` (data state), `13575-100076.png` (empty state), `14547-102224.png` (header), `14547-102226.png` (filter), `14547-102229.png` (table), `13787-88042.png` (cột Trạng thái, bổ sung 2026-07-31), `14547-102370.png` (pagination), `14547-103305.png` (empty illustration).

## 6. Data integration (FE — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | Query file | Apollo hook | Fragments | AC ref |
|---|---|---|---|---|---|
| `priceCalcRunList` | query | `src/api/graphql/price-calc-runs/price-calc-run-list.graphql` | `useQuery` | `PriceCalcRunFragment` | AC-1, AC-2, AC-3, AC-4, AC-5 |
| `priceCalcRunDelete` | mutation | `src/api/graphql/price-calc-runs/price-calc-run-delete.graphql` | `useMutation` | — | AC-6 |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #16 enforce) — verified verbatim vs `Architecture/api/agg-garage-graph-graphql.md` §2 Endpoint Summary rows #360 (`priceCalcRunList`) và #364 (`priceCalcRunDelete`) + §3f. `priceCalcRunGet` (#361) và `priceCalcRunCreate` (#362) KHÔNG consume tại màn LIST — thuộc `FEAT-PRC-DETAIL`/`FEAT-PRC-CREATE` fe-web spec, chỉ điều hướng sang route tương ứng từ đây.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

_Không có — mọi data access qua GraphQL BFF theo PKG-W06 §2.2.4._

### 6.3 State management

> **Codebase dùng Apollo Client trực tiếp cho GraphQL data-layer** (PKG-W06 §2.2.4 "State/cache — Apollo default"), KHÔNG phải TanStack Query — override generic template default.

| Concern | Tool | Slice/Store | Key | AC ref |
|---|---|---|---|---|
| Server state (list) | Apollo Client `useQuery` | Apollo `InMemoryCache` (normalized) | `priceCalcRunList(input)` | AC-1, AC-2, AC-3 |
| Filter + pagination state | React local state (`useState`/`useReducer`) | `src/features/price-calc-runs/hooks/use-price-calc-run-filters.ts` | `{ pricingMethod, executedFrom, executedTo, page, size }` | AC-4, AC-5 |
| Delete mutation | Apollo Client `useMutation` | — | `refetchQueries: ['priceCalcRunList']` on complete | AC-6 |
| Form state | — | N/A tại màn LIST (form thuộc FEAT-PRC-CREATE) | — | — |

### 6.4 Routing

| Route | Component | Loader | Guard | AC ref |
|---|---|---|---|---|
| `/inventory/price-calc-runs` | `PriceCalcRunListPage` | prefetch `priceCalcRunList` (default filter) | Feature flag `Inventory:InventoryV2`; dual persona (garage-owner/accountant) | AC-1, AC-7 |

## 7. File/module impact map (FE Web — feature slice)

> Path glob ⊆ `frontend/gf-gms-web/**` (item #5 enforce).

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `src/features/price-calc-runs/pages/` | `price-calc-run-list-page.tsx` | NEW | compose share/customs table+filter+pagination | ~180 | AC-1-AC-7 |
| `src/features/price-calc-runs/hooks/` | `use-price-calc-run-filters.ts` | NEW | local state hook | ~40 | AC-4, AC-5 |
| `src/features/price-calc-runs/hooks/` | `use-price-calc-run-delete.ts` | NEW | Apollo `useMutation` wrapper | ~30 | AC-6 |
| `src/features/price-calc-runs/columns/` | `price-calc-run-columns.tsx` | NEW | `share/tables/table` column defs | ~90 | AC-2 |
| `src/features/inventory/error-messages.ts` | (extend) | MODIFY (add) | `ERR-INV-024`/`ERR-INV-029` mapping (PKG-W06 §2.2.4) | ~10 | AC-6 |
| `src/api/graphql/price-calc-runs/` | `price-calc-run-list.graphql` | NEW | persisted query | ~25 | AC-1-AC-5 |
| `src/api/graphql/price-calc-runs/` | `price-calc-run-delete.graphql` | NEW | persisted mutation | ~10 | AC-6 |
| `src/api/generated/` | `price-calc-runs.generated.ts` | AUTO-GEN | codegen (Apollo) | — | — |
| `src/layouts/home/modules/` | `constants.ts` | MODIFY (add menu entry, T-web-Nav1) | — | ~10 | AC-1 |
| `src/routes/inventory/` | `price-calc-runs.tsx` | NEW | TanStack Router file route | ~20 | AC-1, AC-7 |
| `tests/` | `tests/features/price-calc-runs/price-calc-run-list-page.test.tsx` | NEW | Vitest + RTL, incl. delete flow + empty state | ~200 | AC-1-AC-7 |

## 8. Implementation sequence DAG (FE — S6)

> FE S6 entry depends on BFF S5 (SDL stable). FE S6 exit hand-off S7 (E2E happy path). Contract `agg-garage-graph-graphql.md §3f` (op #360/#364) đã ratify + signed (`Execution/wave-specs/W06/_decisions.md` 2026-07-31 contract-sign entry, bao gồm `agg-garage-graph-graphql.md §3f+§3j` → consumer `web-experiences/garage-web`).

```
(← BFF tier S5: SDL + resolver stable — priceCalcRunList/priceCalcRunDelete)

S6  UI wire (web)
    Entry: BFF S5 SDL stable + Figma confirmed (node 14507:89265)
    Exit: E2E happy path green (smoke) — list load + filter + paginate + delete
    └─► (hand-off QA E2E)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | UI components + routing + filter/pagination state + Apollo query/mutation wiring | features + routes + api/graphql | BFF S5 stable | E2E smoke green | BFF S5 |

## 9. Business Rules to enforce (FE — UI hint secondary)

> FE KHÔNG enforce business validation primary. FE chỉ:
> - Client-side validation hint (UX feedback before submit)
> - RBAC-driven render (hide controls user không có quyền)
> - Error code → display mode mapping (TOAST / INLINE / EMPTY_STATE)

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-AP-CMN-002` | CORNERSTONE | route mở cho cả 2 persona, KHÔNG conditional render theo role | `routes/inventory/price-calc-runs.tsx` | AC-7 | Không có RBAC phân hóa trên màn này |
| `BR-PRC-018` | NORMAL | passthrough sort mặc định `executedAt,desc`, KHÔNG tự resort client | `hooks/use-price-calc-run-filters.ts` | AC-3 | BE final enforce sort |
| `BR-PRC-014` | NORMAL | map 4 enum status BE → 3 UI state hiển thị (PENDING+RUNNING gộp "Đang tính") | `columns/price-calc-run-columns.tsx` | AC-2 | UI simplification hint, BE giữ nguyên 4 enum |
| `BR-PRC-016` | NORMAL | hiển thị `itemsResolvedCount` verbatim từ BE, KHÔNG tự tính lại | `columns/price-calc-run-columns.tsx` | AC-2 | Semantic (chỉ mã Đang hoạt động) do BE tính |
| `BR-PRC-009` / `BR-PRC-010` | NORMAL | render mỗi `content[]` item = 1 dòng, KHÔNG dedupe/merge log theo (kỳ,kho) | `pages/price-calc-run-list-page.tsx` | AC-3 | BE ghi log riêng mỗi lần chạy |

> **Primary enforcement** = BE tier (`features/be/FEAT-PRC-LIST.md §9`).

## 10. Test scope hand-off (FE Web)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | UI | test-ui | render header + filter + table + CTA "Tính giá"; skeleton loading |
| AC-1 (EC-1) | UI (negative — empty state) | test-ui | verbatim text "Không có dữ liệu" khi `content=[]`, test ID `table-price-calc-runs` |
| AC-2 | UI (column render) | test-ui | 11 cột đúng thứ tự + badge trạng thái 3 màu (PENDING/RUNNING/SUCCEEDED/COMPLETED_WITH_ERRORS → 3 UI state) |
| AC-3 | UI (order) | test-ui | log mới lên đầu, không dedupe nhiều log cùng kỳ/kho |
| AC-4 | UI (filter) | test-ui | apply Phương pháp + Ngày thực hiện → refetch với input đúng, `page` reset về 0 |
| AC-5 | UI (pagination) | test-ui | đổi page-size default 20, điều hướng trang |
| AC-6 | UI (interaction) + integration | test-ui | Xem → navigate; Xóa → confirm dialog → mutation → toast + refetch; case lỗi `ERR-INV-024`/`ERR-INV-029` |
| AC-7 | UI (RBAC visibility) | test-ui + test-isolation | dual persona (garage-owner/accountant) đều truy cập được, không control nào bị ẩn khác nhau |
| (smoke) | E2E happy path | test-e2e | Playwright: mở màn → lọc → phân trang → xem chi tiết → quay lại → xóa log |

## 11. i18n & a11y

### 11.1 i18n keys

> **KHÔNG áp dụng** — project context desktop-only, no-i18n (PKG-W06 §2.2.4). Toàn bộ label tiếng Việt hardcode inline trong component (vd "Danh sách tính giá xuất kho", "Tính giá", "Không có dữ liệu", "Đang tính"/"Thành công"/"Hoàn thành có lỗi"). `i18n_keys: []` frontmatter là chủ đích, không phải thiếu sót.

### 11.2 a11y

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `<h1>` page title; `aria-busy` khi loading bảng | manual QA |
| AC-2 | `<th scope="col">` header cột; icon action có `aria-label` | screen reader |
| AC-4 | Filter popover: `aria-expanded`, keyboard Tab/Enter mở, Escape đóng | keyboard nav |
| AC-5 | Pagination `aria-label="Điều hướng trang"`, current page `aria-current="page"` | screen reader |
| AC-6 | Confirm dialog focus-trap + focus trả về trigger sau đóng | manual QA |

## 12. Cross-tier coordination (FE Web perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-PRC-LIST.md` | PENDING (đang author song song, cùng batch W06) | BR primary enforcement, contract source `gf-accounting-api.md §5` (W06-1..W06-6) |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-PRC-LIST.md` | PENDING (đang author song song, cùng batch W06) | GraphQL ops consumed (§6.1) — `priceCalcRunList` (#360) + `priceCalcRunDelete` (#364) |
| Mobile | N/A | N/A | PRC là **web-only** cho toàn bộ 5 FEAT (PKG-W06 §2.2.5 "Mobile out-of-scope W06") — không có mobile-tier file |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF files khi được author (cùng giá trị `5de2c27738f9de60d4bed4516afee5a6250354a61e3488d2537e1a2bfd0b83ae`).

## 13. References

- **Source**: [`Product/features/FEAT-PRC-LIST.md`](../../../../../Product/features/FEAT-PRC-LIST.md) v12
- **Paired BE**: [`features/be/FEAT-PRC-LIST.md`](../be/FEAT-PRC-LIST.md)
- **Paired BFF**: [`features/bff/FEAT-PRC-LIST.md`](../bff/FEAT-PRC-LIST.md)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-ACCOUNTING-PERIOD.md) §6 (PRC)
- **Figma**: [`Product/ux/figma-web/wave06-prc-list.md`](../../../../../Product/ux/figma-web/wave06-prc-list.md)
- **HLD Web**: [`Architecture/hld/garage-web-HLD.md`](../../../../../Architecture/hld/garage-web-HLD.md)
- **API BFF (SSOT ops)**: [`Architecture/api/agg-garage-graph-graphql.md`](../../../../../Architecture/api/agg-garage-graph-graphql.md) §0 Wave Index (W06 → §3f), §2 rows #360/#364, §3f
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md) §2.2.4
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial FE Web-tier spec cho `FEAT-PRC-LIST` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm FE Web, §3 FE behaviour map cover đủ 7 AC (AC-1..AC-7), §4 visual fidelity + state + i18n(none, desktop-only) + a11y + RBAC + BR secondary + error mapping, §5-§11 FE-specific (route `/inventory/price-calc-runs`, component reuse 100% từ registry v16 KHÔNG build-new, GraphQL ops `priceCalcRunList`+`priceCalcRunDelete` verified verbatim vs `agg-garage-graph-graphql.md` §2 rows #360/#364, Apollo Client state pattern per PKG-W06 §2.2.4). Source FEAT chỉ audit. |
