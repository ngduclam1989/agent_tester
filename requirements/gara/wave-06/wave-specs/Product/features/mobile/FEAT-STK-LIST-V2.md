---
type: execution
artifact_kind: converted-feature
tier_role: mobile                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-STK-LIST-V2.md"
source_version: 10
source: "gen-execution-spec"
source_feat_id: "FEAT-STK-LIST-V2"
source_feat_sha: "0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48"
generated_at: "2026-07-31T00:00:00Z"
status: ACTIVE
version: 3
tier: T4
owner_authority: Delivery Authority
wave: "W06"
parent_epic: "EP-INVENTORY-STOCK-V2"
parent_pkg: "PKG-W06-inventory-pricing-stock-report"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-STK-LIST-V2"]
consumes_bff_feats: ["FEAT-STK-LIST-V2"]
screens_touched:
  - "lib/ui/inventory/stock_list/stock_list_page.dart"
  - "lib/ui/inventory/stock_list/stock_list_search_page.dart"
  - "lib/ui/inventory/stock_list/stock_list_filter_page.dart"
flutter_packages: ["flutter_bloc", "freezed", "get_it", "injectable", "auto_route", "graphql_flutter", "gap", "pull_to_refresh", "shimmer", "easy_localization"]
figma_refs:
  - "Product/ux/figma-mobile/wave06-stk-list-v2.md (node 21632:28892 — Báo cáo tồn kho mobile, 6 screens: report / search default+no-results+results / filter default+filled)"
authoring_inputs:
  pkg_ref: "PKG-W06-inventory-pricing-stock-report"
  fanout_map_sha: "750f49b46b4e895ae843e8e6324d043351536720c5f0a156403c95403bc0b27a"
  template_sha: "not-provided-by-orchestrator"
  bundle_path: "/tmp/exec-spec-bundles/W06/FEAT-STK-LIST-V2.mobile.md"
  bundle_generated_at: "2026-07-31T06:31:29+00:00"
reviewer_verdict: "APPROVED"
last_reviewed: "2026-07-31"
---

# FEAT-STK-LIST-V2 (Mobile): Báo cáo tồn kho đến ngày

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-STK-LIST-V2` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) |
| Parent Epic | [`EP-INVENTORY-STOCK-V2`](../../../../../Product/epics/EP-INVENTORY-STOCK-V2.md) |
| Wave | W06 |
| Status | ACTIVE |
| Screens touched | `stock_list_page.dart`, `stock_list_search_page.dart`, `stock_list_filter_page.dart` |
| Flutter packages | flutter_bloc, freezed, get_it, injectable, auto_route, graphql_flutter, gap, pull_to_refresh, shimmer, easy_localization |
| Cross-tier consume | BE: [`FEAT-STK-LIST-V2`] \| BFF: [`FEAT-STK-LIST-V2`] |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-STK-LIST-V2` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) |
| Source version | v10 |
| Source SHA | `0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48` |
| Generated at | 2026-07-31T00:00:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage và kế toán cần biết chính xác tồn kho (số lượng + giá trị) của từng mã sản phẩm nội bộ tại bất kỳ thời điểm nào để phục vụ kiểm kê, đối soát sổ sách và quyết định nhập hàng. Feature cung cấp báo cáo tồn kho realtime, đọc trực tiếp từ sổ tồn (stock ledger), tách riêng theo từng kho, cho phép lọc theo ngày/kho/mã và xuất file Excel theo mẫu chuẩn. Đây là báo cáo đầu tiên trong nhóm 3 báo cáo Stock V2 (cùng NXT và thẻ kho), nằm ở cuối luồng nghiệp vụ: sau khi nhập/xuất kho và chạy tính giá bình quân gia quyền cuối kỳ (BQGQ), báo cáo phản ánh đúng số liệu đã chốt. Feature triển khai song song trên Web GMS và App Garage — duy nhất trong 3 báo cáo Stock V2 có mặt trên mobile W06.

## 2. Trách nhiệm Mobile (garage-mobile)

- Màn hình `StockListPage` — entry point từ tile "Tồn kho" trên hub `InventoryHubPage` (FEAT-INV-MOBILE-MENU, cross-wave, flip HIDDEN→VISIBLE ở W06) — hiển thị danh sách card báo cáo tồn kho theo bộ lọc hiện hành (mặc định: hôm nay, tất cả kho).
- 2 màn hình phụ trợ dạng full-screen push (KHÔNG phải bottom-sheet): `StockListSearchPage` (tìm theo mã/tên, có 3 trạng thái default/no-results/results) và `StockListFilterPage` (chọn "Tồn đến ngày" + "Kho", có nút Thiết lập lại/Áp dụng).
- State machine UI rõ ràng theo 3 Cubit tách biệt: `StockListCubit` (báo cáo chính), `StockListSearchCubit` (tìm kiếm), `StockListFilterCubit` (chọn lọc, local-only cho tới khi user tap Áp dụng).
- Widget reuse-first: 8/8 widget hiện có (`AppBarCustom`, `CustomScaffold`, `SearchBarCustom`, `EmptyDataWidget`, `AppTextField`, `DropdownTextField`, `DropdownMenuWidget`, `AppDatePicker`, `AppButton`, `ListWidget`) — chỉ 1 widget mới `StockProductCard` (card sản phẩm 4-dòng info, dùng chung cho cả màn báo cáo + màn kết quả tìm kiếm).
- Consume đúng 1 GraphQL op từ BFF (`stockLedgerAtDate`) qua `graphql_flutter` — không orchestrate, không cache business logic phía mobile (BE là nguồn tính toán SL/GT).
- KHÔNG có native interaction (camera/permission/deeplink/push) — feature 100% online, read-only report, không cần offline-first.

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage: 9/9 source AC-ID (xem bundle §C). AC-7, AC-8 khai báo N/A theo platform scope W06.

### Cluster A — Màn Báo cáo tồn kho (Screen 1: `StockListPage`)

#### AC-1 → Mở màn báo cáo

- **Khi**: user tap tile "Tồn kho" trên `InventoryHubPage` (hub, FEAT-INV-MOBILE-MENU đã flip VISIBLE W06).
- **Mobile phải**: push route `StockListRoute` → `StockListPage`; `StockListCubit` tự động gọi `stockLedgerAtDate` với filter mặc định (`asOfDate` = hôm nay, `warehouseIds` = null tức tất cả kho, `keyword` = null) ngay khi page init.
- **State transition**: `initial` → `loading` (auto-skeleton qua `ListWidget.isLoading`) → `loaded` (danh sách `StockProductCard`) hoặc `error` (`LoadError`/toast).
- **Widget**: `StockListPage` (NEW) bọc `ListWidget` (REUSE canonical).
- **GraphQL op**: `stockLedgerAtDate(input: StockLedgerAtDateInput!): PagedStockLedgerAtDateApiResponse!`.
- **i18n key (ARB/LocaleKeys)**: `LocaleKeys.stockReportTitle`.
- **a11y**: `Semantics(label: LocaleKeys.stockReportTitle.tr())` cho AppBar title.
- **Platform-specific**: không.
- **Ref**: paired BE FEAT §6 `W06-STK-Q1`, Figma Screen 1 node `21290:45967` (§5.1).

#### AC-2 → Cột hiển thị

- **Khi**: `stockLedgerAtDate` trả `content[]`, mỗi row render thành 1 `StockProductCard`.
- **Mobile phải**: render đúng 4 dòng info theo thứ tự canonical (BA decision GAP-W06-GM-03, resolved 2026-07-31) **Kho → Số lượng tồn → ĐVT → Giá trị tồn** — áp dụng đồng nhất cho cả Screen 1 và Screen 4 (kết quả tìm kiếm), override thứ tự raw khác nhau giữa 2 Screen trong Figma gốc. Card header hiện `productCode` + `productName`. Cột/action "Xem lịch sử" (web) **KHÔNG tồn tại** trên mobile — không render bất kỳ nút hành động nào trên card (AC-7 N/A).
- **State transition**: n/a (render-only, phụ thuộc `loaded` state của cluster A).
- **Widget**: `StockProductCard` (NEW, feature-local) chứa 4× `_InfoRow` (private).
- **GraphQL op**: field mapping `productCode/productName/mainUnitCode/warehouseCode/warehouseName/quantityOnHand/valueOnHand` từ `StockLedgerAtDateRow`.
- **i18n key**: `LocaleKeys.warehouse`, `LocaleKeys.stockQuantity`, `LocaleKeys.unitOfMeasure`, `LocaleKeys.stockValue`.
- **a11y**: mỗi `_InfoRow` bọc `Semantics(label: "$label $value")`.
- **Platform-specific**: không.
- **Ref**: Figma `Column/InfoRows (21290:45980)` DEV BUILD ORDER note + `Card/SanPham (21290:45969)` (§5.2).

#### AC-3 → Số lượng & giá trị tồn

- **Khi**: `StockProductCard` render field `quantityOnHand` + `valueOnHand`.
- **Mobile phải**: hiển thị `quantityOnHand` nguyên/thập phân theo `mainUnitCode`; `valueOnHand` format số VN (dấu chấm ngăn nghìn, KHÔNG hậu tố "đ") — **LUÔN là số, kể cả 0** — KHÔNG bao giờ hiển thị chuỗi "Tạm tính" (khác case PRC-pending ở web) per BR-STKV2-002.
- **State transition**: n/a.
- **Widget**: `_InfoRow` (private trong `StockProductCard`).
- **GraphQL op**: `quantityOnHand: Decimal!`, `valueOnHand: Decimal!` (`StockLedgerAtDateRow`, non-nullable).
- **i18n key**: giá trị số dùng `NumberFormat` VN locale (`intl` — đã có sẵn qua `easy_localization`), không cần LocaleKey riêng cho số.
- **a11y**: value announce qua `Semantics` của `_InfoRow`.
- **Platform-specific**: không.
- **Ref**: BR-STKV2-002, Figma `Row/InfoField-SoLuongTon` (21325:650871) + `Row/InfoField-GiaTriTon` (21290:45994).

### Cluster B — Tìm kiếm + Bộ lọc (Screens 2-6: `StockListSearchPage` / `StockListFilterPage`)

#### AC-4 → Bộ lọc

- **Khi**: user tap icon search (AppBar Screen 1) → mở `StockListSearchPage`; hoặc tap icon filter (AppBar Screen 1) → mở `StockListFilterPage`.
- **Mobile phải**:
  - **Search**: `StockListSearchCubit` debounce input keyword (mã/tên, 300-500ms) → gọi lại `stockLedgerAtDate` với `input.keyword`; render 3 trạng thái: `hint` (chưa gõ — hiển thị 2 gạch đầu dòng gợi ý "Mã sản phẩm"/"Tên sản phẩm"), `noResults` (0 kết quả — `EmptyDataWidget` "Không có kết quả phù hợp"/"Vui lòng thử lại"), `results` (rich-text đếm kết quả + `StockProductCard` list).
  - **Filter**: `StockListFilterCubit` giữ local state cho `asOfDate` (mặc định = filter hiện hành, chọn qua `AppDatePicker`) + `warehouseId` (chọn qua `DropdownTextField` mở `DropdownMenuWidget` overlay — single-select theo Figma, data nạp qua `searchWarehouses` — xem §4.10 RATIFIED — truyền `warehouseIds: [selectedId]` đúng shape multi khi Áp dụng). Nút "Thiết lập lại" reset về default; nút "Áp dụng" pop về `StockListPage` kèm filter mới → `StockListCubit` re-fetch.
- **State transition**: `StockListSearchCubit`: `initial → loading → (empty | loaded) | error`. `StockListFilterCubit`: local `idle` (không fetch cho tới khi Áp dụng); dropdown Kho nested-state `loading → loaded(page N) → loadingMore → loaded(page N+1 appended)` (REUSE cơ chế W04 AC-5c).
- **Widget**: `SearchBarCustom` (REUSE), `EmptyDataWidget` (REUSE), `AppTextField` readOnly (REUSE — trigger `AppDatePicker`), `DropdownTextField` + `DropdownMenuWidget` (REUSE — warehouse), `AppButton` (REUSE — Reset/Apply).
- **GraphQL op**: `stockLedgerAtDate(input: {keyword | asOfDate | warehouseIds})` — cùng op với Cluster A, khác input; `searchWarehouses(input: {page, size})` — nạp datasource dropdown Kho (§4.10, op #305, REUSE `WarehouseRepository`).
- **i18n key**: `LocaleKeys.search`, `LocaleKeys.searchProductByKeyword`, `LocaleKeys.productCode`, `LocaleKeys.productName`, `LocaleKeys.noMatchingResult`, `LocaleKeys.pleaseTryAgain`, `LocaleKeys.searchResultCount`, `LocaleKeys.filter`, `LocaleKeys.selectWarehouse`, `LocaleKeys.resetFilter`, `LocaleKeys.apply`, `LocaleKeys.stockListFilterDateLabel` (author-derived — verbatim Figma text "Tồn đến ngày", không có `→ flutter:` mapping sẵn trong spec Figma cho riêng label này), `LocaleKeys.stockListFilterWarehouseLabel` (tương tự, verbatim "Kho").
- **a11y**: `Semantics` cho search input, mỗi filter field, mỗi item trong `DropdownMenuWidget` (đánh dấu item đang chọn qua `selected: true`, KHÔNG dùng icon check).
- **Platform-specific**: không.
- **Ref**: Figma Screen 2 (`21290:46486`), Screen 3 (`21290:46503`), Screen 4 (`21290:47060`), Screen 5 (`21290:47678`), Screen 6 (`21290:47691`) — §5.1.

#### AC-5 → Tách dòng theo kho

- **Khi**: 1 sản phẩm tồn tại ở nhiều kho.
- **Mobile phải**: render 1 `StockProductCard` riêng biệt cho mỗi `(productCode, warehouseCode)` — KHÔNG gộp dòng phía client. BE đã trả `content[]` tách sẵn theo dòng; mobile chỉ map 1:1 item → card.
- **State transition**: n/a.
- **Widget**: `ListWidget` với `items = content.map(StockProductCard.new)`.
- **GraphQL op**: `PagedStockLedgerAtDateData.content: [StockLedgerAtDateRow!]!`.
- **i18n key**: n/a.
- **a11y**: n/a.
- **Platform-specific**: không.
- **Ref**: BR-STKV2-003.

#### AC-6 → Hiển thị mã theo ngày

- **Khi**: filter `asOfDate` áp dụng (mặc định hôm nay).
- **Mobile phải**: chỉ hiển thị dòng có `quantityOnHand ≠ 0 HOẶC valueOnHand ≠ 0` tại `asOfDate` — filter này thực hiện phía BE (BR-STKV2-006); mobile KHÔNG tự filter lại phía client, chỉ trust response. Card header hiện đúng mã theo snapshot ngày đã chọn.
- **State transition**: n/a.
- **Widget**: n/a (BE responsibility).
- **GraphQL op**: `input.asOfDate: Date!`.
- **i18n key**: n/a.
- **a11y**: n/a.
- **Platform-specific**: không.
- **Ref**: BR-STKV2-006, Figma `Input/DateField` (Screen 5).

### Cluster C — Ngoài phạm vi Mobile W06

#### AC-7 → N/A (web-only)

- Source AC "Xem lịch sử (thẻ kho)" chỉ thuộc scope web (`FEAT-STK-DETAIL-V2`, web-only). Mobile W06 platform scope loại bỏ hoàn toàn action này — KHÔNG render nút/onTap/chevron nào trên `StockProductCard` (xác nhận qua Figma: card không có bất kỳ affordance tương tác nào). Xem paired `be/FEAT-STK-LIST-V2.md §Platform scope`.

#### AC-8 → N/A (out-of-scope W06)

- Source AC "Xuất file" — mobile export **chưa ratified** cho W06 (bundle §G "Endpoint Summary — W06 Stock V2 Reports" ghi rõ `W06-STK-EX1`: "mobile chỉ nếu FEAT-STK-LIST-V2 mobile export ratified — soft flag mobile out-of-scope Round 4"). Cả 6 Figma screen KHÔNG có nút export ở AppBar hay BottomBar. Mobile KHÔNG implement export trong W06 — cần Business Authority ratify + bổ sung Figma frame ở wave sau nếu muốn mở scope.

### Cluster D — Phân quyền

#### AC-9 → Phân quyền — chủ garage + kế toán quyền ngang nhau

- **Khi**: bất kỳ persona nào (`garage-owner` hoặc `accountant`) mở `StockListPage`.
- **Mobile phải**: KHÔNG áp thêm role-check riêng trên chính route báo cáo — 2 persona quyền ngang nhau theo BR-STKV2-015. Gate duy nhất là `AuthGuard` (đăng nhập hợp lệ) ở cấp route + việc tile "Tồn kho" có hiển thị trên hub hay không (theo flag `Inventory:InventoryV2`, thuộc FEAT-INV-MOBILE-MENU). KHÔNG có `PermissionGuard` phân biệt 2 persona cho route này.
- **State transition**: n/a.
- **Widget**: n/a.
- **GraphQL op**: n/a.
- **i18n key**: n/a.
- **a11y**: n/a.
- **Platform-specific**: không.
- **Ref**: BR-STKV2-015.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Không re-invent layout/spacing/color — bám node-id Figma ở §5 (`Product/ux/figma-mobile/wave06-stk-list-v2.md`).
- Design tokens: `AppColors.*` / `AppTextStyle.*` / `AppSizes.*` / `AppShadows.*` tại `lib/core/common/styles/`. **KHÔNG** hardcode `Color(0xFF…)` literal, TRỪ 6 call site đã raise-not-block trong Figma spec §Unknown-Tokens (`Color(0xFF334155)` cho icon stroke 16px card row + calendar 20px) — mỗi call site MUST kèm comment `// TODO(unknown-token W06): xem §Unknown-Tokens` per spec gốc.
- Gap/padding 12px ngoài `AppSizes` scale (`{0,4,8,16,32,52}`) → dùng const `kGap12`/`kPad12` khai tại `lib/ui/inventory/stock_list/stock_list_constants.dart` (path đã xác lập sẵn trong Figma spec §Spacing Escapes), KHÔNG tự bịa `AppSizes.spacing12`.
- AppBar title **binding-verified** = "Báo cáo tồn kho" (Screen 1) / không title, dùng `SearchBarCustom` thay thế (Screen 2-4) / "Bộ lọc" (Screen 5-6) — theo `AppTextStyle.textSubtitleS4` (M-28 hard rule nav-bar). **Lưu ý GAP-W06-GM-01 (RESOLVED)**: HLD `garage-mobile-HLD.md §11d.2` vẫn ghi "Tồn kho" (label hub tile) nhưng đây là văn bản HLD cố ý giữ nguyên theo user directive — Figma spec/exec-spec này (nguồn build) mới là authoritative cho AppBar title thật, KHÔNG dùng text HLD.
- Card header text màu `#273243` raw hex (KHÔNG bind variable Figma) → resolve `AppColors.neutralS900` (canonical, KHÔNG phải `AppColors.textPrimary`).
- Responsive: phone-only per Figma (375x812 device frame); không có tablet variant riêng cho feature này — dùng layout co giãn mặc định `MediaQuery`.

### 4.2 State machine + error handling

- Bloc/Cubit state tường minh: `initial | loading | loaded | empty | error` cho `StockListCubit` + `StockListSearchCubit`; `StockListFilterCubit` chỉ local `idle` (không network cho tới Áp dụng).
- Error → SnackBar/Dialog qua `AppSnackbar`/`AppAlertDialogCustom` theo mapping §4.9. KHÔNG silent fail.
- Đây KHÔNG phải FORM FEAT (read-only report) — không áp form-validity-gating rule.

### 4.3 Native interaction + permission

- KHÔNG có: không camera, không photo library, không storage picker, không location, không microphone, không deeplink riêng ngoài route push chuẩn, không push notification touchpoint cho feature này.

### 4.4 Offline + connectivity

- Feature yêu cầu online (báo cáo realtime từ sổ tồn BE) — KHÔNG offline-first, KHÔNG local cache persistence (Hive/Isar) cho dữ liệu report.
- Khi mất kết nối: banner connectivity chuẩn của app (pattern chung, không cần widget riêng) + retry khi reconnect (re-trigger fetch hiện hành, giữ nguyên filter).

### 4.5 i18n + a11y

- Mọi label qua `LocaleKeys` (`easy_localization` — `assets/localizations/vi.json` + `en.json`, regen `lib/generated/locale_keys.gen.dart`) — **KHÔNG** dùng ARB/`flutter_localizations` (ground-truth xác nhận qua warm-up report §2 Tech Summary + Figma spec flutter snippet dùng `LocaleKeys.xxx.tr()`, KHÔNG dùng `AppLocalizations.of(context)`). Override default generic template (vốn giả định ARB) theo bằng chứng codebase thật.
- KHÔNG hardcode tiếng Việt inline trong `lib/ui/**`, trừ nội dung binding verbatim Figma label khi confirm trực tiếp trong PNG evidence (đã map qua `LocaleKeys` ở §3).
- a11y: `Semantics` cho icon-only button (search/filter icon AppBar) + toàn bộ `_InfoRow`; tap target ≥ 48dp cho AppBar action icon + `AppButton`; contrast WCAG AA (đã pre-validate qua `AppColors.*`).

### 4.6 RBAC render + feature flag

- Feature flag: `Inventory:InventoryV2` (tái sử dụng, đã khai báo từ W03 — KHÔNG khai flag mới). Route `StockListRoute` chỉ reachable qua tap tile hub khi flag ON; nếu BE trả 403 (flag OFF, defensive — không nên xảy ra vì tile ẩn) → BFF map `FORBIDDEN_ERROR` → xem §4.9.
- Persona check: KHÔNG có `PermissionGuard` riêng — chỉ `AuthGuard` (đăng nhập). Cả `garage-owner` và `accountant` render giống hệt nhau (AC-9).

### 4.7 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-STK-LIST-V2.md §9`). Mobile chỉ:
  - Trust BE-side filter (BR-STKV2-006 dòng SL≠0 HOẶC GT≠0) — KHÔNG tự filter lại phía client.
  - Trust BE-side value formatting rule (BR-STKV2-002 luôn số/0) — KHÔNG tự thêm text "Tạm tính"/"—".
  - SnackBar khi server reject filter input không hợp lệ (vd `asOfDate` tương lai — nếu BE validate).

### 4.8 Performance

- `ListWidget` canonical (`lib/ui/widgets/list/list_widget.dart`) cho cả `StockListPage` + `StockListSearchPage` results — auto-skeleton (`LoadingRowShimmerWidget` × 5 rows) khi `isInitial/isLoading`, `SmartRefresher` pull-down refresh qua `pull_to_refresh: ^2.0.0`. KHÔNG dùng raw `ListView.builder`, KHÔNG dùng `infinite_scroll_pagination` (NOT in pubspec).
- Debounce search keyword input 300-500ms trước khi gọi lại `stockLedgerAtDate` — tránh spam query mỗi keystroke.
- `const` constructor cho `_InfoRow`/`StockProductCard` khi có thể; `BlocBuilder` granular theo state slice.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| `ERR-CMN-validation` | SnackBar | `AppSnackbar` | AC-4 (filter input không hợp lệ) |
| `FORBIDDEN_ERROR` | Full-screen error (defensive — tile đã ẩn khi flag OFF) | `LoadError` | AC-1 |
| network / timeout | Inline error + nút thử lại | `LoadError` (qua `ListWidget.isFailure`) | AC-1, AC-4 |

### 4.10 Warehouse dropdown datasource (RESOLVED — main-agent, 2026-07-31)

- **RATIFIED**: `StockListFilterPage` dropdown "Kho" gọi `searchWarehouses` — op **#305** đã ratify sẵn trong `Architecture/api/agg-garage-graph-graphql.md`, **KHÔNG phải op mới**. Đây là op mobile đã dùng production từ W04 với cùng pattern (bottom-sheet filter, dropdown Kho paginated) — xem `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md §AC-5c "Kho dropdown paginated + preserve selection"`: `searchWarehouses(input: {page: 0, size: 20})`, load-more khi scroll cuối trang, widget `DropdownTextField` (REUSE). Op cũng có mặt trong `INTEG-MOB-garage-mobile-agg-garage-graph.md` (bảng Supplier/warehouse/product flow) — xác nhận mobile đã có sẵn `WarehouseRepository`.
- **DEV action**: REUSE `lib/core/repositories/inventory/warehouse_repository.dart` (đã tồn tại từ W04 FEAT-OB-LIST) cho `StockListFilterCubit` — KHÔNG tạo repository mới. Nếu file/class đã bị đổi tên hoặc không còn tồn tại theo path này, grep hiện trạng codebase trước khi giả định — nếu thật sự thiếu mới escalate `/cr-raise MINOR`.
- Input SDL `StockLedgerAtDateInput.warehouseIds: [Int!]` cho phép multi-select, nhưng Figma chỉ thiết kế single-select dropdown (1 lựa chọn tại 1 thời điểm, gồm "Tất cả kho" + từng kho riêng lẻ). DEV build UI single-select nhưng truyền `warehouseIds: [selectedId]` (hoặc `null` khi "Tất cả kho") xuống input đúng shape multi.
- Không cần load-more preserve-selection badge phức tạp như W04 AC-5c (Figma W06 filter screen không thiết kế badge "Đang chọn") — chỉ REUSE cơ chế fetch/paginate, phần UI hiển thị bám đúng Figma W06 (§5.1 Screen 5-6).

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Path glob ⊆ `mobile/gf-garage-app/lib/**`. Domain = `inventory`, sub-feature = `stock_list` (path đã xác lập sẵn qua Figma spec §Spacing Escapes `stock_list_constants.dart` + §Unknown-Widgets `stock_product_card.dart` — dùng nhất quán, KHÔNG theo naming `stock_ledger_at_date` gợi ý ở warm-up report §8 vì đó là Clean-Architecture-style path (`lib/features/...`) đã bị flag anti-pattern LL-MOB-010).

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | figma_node_id (verbatim) | figma_png (path) | AC ref |
|---|---|---|---|---|---|
| `StockListPage` | `/inventory/stock-list` | NEW | `21290:45967` | `Product/ux/figma-mobile/assets/wave06-stk-list-v2/21290-45967.png` | AC-1, AC-2, AC-3, AC-5, AC-6, AC-9 |
| `StockListSearchPage` | `/inventory/stock-list/search` | NEW | `21290:46486` (default) / `21290:46503` (no-results) / `21290:47060` (results) | `assets/wave06-stk-list-v2/21290-46486.png`, `21290-46503.png`, `21290-47060.png` | AC-4 |
| `StockListFilterPage` | `/inventory/stock-list/filter` | NEW | `21290:47678` (default) / `21290:47691` (filled+dropdown open) | `assets/wave06-stk-list-v2/21290-47678.png`, `21290-47691.png` | AC-4 |

### 5.2 Widgets

> **Reuse pattern (priority: customs > share > ui)** — Garage mobile KHÔNG có 3-layer web pattern; catalog reuse-radar canonical = `lib/ui/widgets/` flat (xem §G.X bundle). Mọi REUSE row dưới đây cross-check trực tiếp filesystem ground truth ở §G.X — KHÔNG có path nào invented.

| Widget | Path | Change type | State | Reuse pattern (priority: customs > share > ui) | AC ref |
|---|---|---|---|---|---|
| `StockProductCard` | `lib/ui/inventory/stock_list/widgets/stock_product_card.dart` | NEW | StatelessWidget | Build-new — justification: §G.X filesystem scan (`lib/ui/widgets/**` + `lib/ui/inventory/widgets/**`) không có widget vai trò "card nhiều-dòng icon·label·value" (`ItemList`/`LabelContainer` sai vai trò); path đã xác lập sẵn trong Figma spec §Unknown-Widgets | AC-2, AC-3, AC-5 |
| `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | REUSE | StatefulWidget | Priority 1 — canonical list pattern, handle `isInitial/isLoading/isFailure/isEmpty` + `SmartRefresher` | AC-1, AC-4, AC-5 |
| `LoadingRowShimmerWidget` (via ListWidget) | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE (indirect) | StatelessWidget | Priority 1 — auto-rendered bởi `ListWidget` khi `isInitial` | AC-1 |
| `AppBarCustom` | `lib/ui/widgets/app_bar/app_bar_custom.dart` | REUSE | StatelessWidget | Priority 1 — title/leading/actions chuẩn 3 màn | AC-1, AC-4 |
| `CustomScaffold` | `lib/ui/widgets/custom_scaffold.dart` | REUSE | StatelessWidget | Priority 1 — scaffold bg chuẩn | AC-1, AC-4 |
| `SearchBarCustom` | (đã ready — service overlay, path theo `app_bar_search_custom.dart` hoặc tương đương) | REUSE | StatefulWidget | Priority 1 — dùng làm `AppBarCustom.titleWidget` ở `StockListSearchPage` | AC-4 |
| `EmptyDataWidget` | `lib/ui/widgets/loading/empty_data_widget.dart` | REUSE | StatelessWidget | Priority 1 — trạng thái no-results search | AC-4 |
| `AppTextField` | `lib/ui/widgets/text_field/app_text_field.dart` | REUSE | StatelessWidget | Priority 1 — readOnly date field trigger `AppDatePicker` | AC-4 |
| `DropdownTextField` | `lib/ui/widgets/text_field/dropdown_text_field.dart` | REUSE | StatelessWidget | Priority 1 — warehouse dropdown trigger | AC-4 |
| `DropdownMenuWidget` | `lib/ui/widgets/menu/dropdown_menu_widget.dart` (hoặc `dropdown_menu/`) | REUSE | StatelessWidget | Priority 1 — overlay warehouse menu | AC-4 |
| `AppDatePicker` | `lib/ui/widgets/picker/app_date_picker.dart` | REUSE | StatelessWidget | Priority 1 — date picker cho "Tồn đến ngày" | AC-4 |
| `AppButton` | `lib/ui/widgets/button/app_button.dart` | REUSE | StatelessWidget | Priority 1 — nút Thiết lập lại (secondary) + Áp dụng (primary) | AC-4 |

> ⚠️ **PHANTOM WIDGET NAMES cấm dùng** (per §G.X): `AppDropdown`, `AppBottomSheet`, `AppTextarea`, `AppText(...)`, `EmptyStateWidget`/`EmptyDataWidget`-generic-invented, `AttributeField`/`DetailRow`, `TreeView` — đều NOT EXISTS. Dùng substitute canonical đã liệt kê trên.

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory/stock-list` | `StockListPage` | `AuthGuard` (auto_route) | không | AC-1 |
| `/inventory/stock-list/search` | `StockListSearchPage` | `AuthGuard` | không | AC-4 |
| `/inventory/stock-list/filter` | `StockListFilterPage` | `AuthGuard` | không | AC-4 |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| Page state (báo cáo) | Cubit | `lib/ui/inventory/stock_list/stock_list_cubit.dart` + `_state.dart` | `initial / loading / loaded / empty / error` (extends `BaseCubit<StockListState>`, `@Injectable()`) | AC-1, AC-2, AC-3, AC-5, AC-6 |
| Search state | Cubit | `lib/ui/inventory/stock_list/stock_list_search_cubit.dart` + `_state.dart` | `initial(hint) / loading / loaded / empty / error`, debounced `onKeywordChanged` | AC-4 |
| Filter state | Cubit | `lib/ui/inventory/stock_list/stock_list_filter_cubit.dart` + `_state.dart` | `idle` (local — `onDateChanged` / `onWarehouseChanged` / `onReset` / `onApply`) | AC-4 |
| List virtualization | `pull_to_refresh: ^2.0.0` via `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | `RefreshController.refreshCompleted()` | AC-1, AC-4 |

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation (verbatim SDL) | Type | Response union | bff_sdl_ref | Repository class | AC ref |
|---|---|---|---|---|---|
| `stockLedgerAtDate` | query | `PagedStockLedgerAtDateApiResponse` | `Architecture/api/agg-garage-graph-graphql.md §3j.1` (W06-STK-Q1, bundle §G verified `✅ §0 Wave Index resolved for W06 → §3j`) | `lib/core/repositories/inventory/stock_ledger_repository.dart` (`@LazySingleton(as: StockLedgerRepository)`) | AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 |
| `searchWarehouses` (op #305) | query | `PagedApiResponseWarehouseResponse` | `Architecture/api/agg-garage-graph-graphql.md` (pre-existing, ratified W04) | `lib/core/repositories/inventory/warehouse_repository.dart` (`@LazySingleton(as: WarehouseRepository)` — REUSE, đã tồn tại từ `FEAT-OB-LIST` W04, KHÔNG tạo repository mới) | AC-4 |

> `stockLedgerAtDate` verified qua bundle §G §3j.1 SDL block + §3j.2 Endpoint Summary (W06-STK-Q1) — trust bundle theo F-7. Verify verbatim qua `python3 scripts/check_graphql_sdl_fidelity.py` trước commit.
> `searchWarehouses` ratified qua §4.10 (parity precedent `FEAT-OB-LIST W04 §AC-5c`) — KHÔNG phải op mới, REUSE nguyên `WarehouseRepository` đã có.

### 6.2 REST endpoints consumed direct (bypass BFF)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | không có | Mobile 100% qua BFF GraphQL, không bypass | — |

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| — | KHÔNG áp dụng — feature yêu cầu online, không local persistence | — | reconnect → user manual pull-to-refresh hoặc tự động retry theo connectivity banner chuẩn app | AC-1 |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| — | không | không | Feature không có touchpoint permission/push/deeplink/background-task riêng biệt |

## 7. File/module impact map (Mobile — Flutter feature slice)

> Path glob ⊆ `mobile/gf-garage-app/**`. KHÔNG bao gồm thay đổi hub tile visibility (`InventoryHubPage`) — task đó thuộc cross-wave `FEAT-INV-MOBILE-MENU`, không phải phạm vi file map của `FEAT-STK-LIST-V2`.

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory/stock_list/` | `stock_list_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget) | ~200 | AC-1, AC-2, AC-3, AC-5, AC-6, AC-9 |
| `lib/ui/inventory/stock_list/` | `stock_list_search_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget) | ~180 | AC-4 |
| `lib/ui/inventory/stock_list/` | `stock_list_filter_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget) | ~220 | AC-4 |
| `lib/ui/inventory/stock_list/widgets/` | `stock_product_card.dart` | NEW | Card-based (local widget, `_InfoRow` sub-widget) | ~150 | AC-2, AC-3, AC-5 |
| `lib/ui/inventory/stock_list/` | `stock_list_constants.dart` | NEW | Const (`kGap12`, `kPad12`) | ~10 | AC-2 |
| `lib/ui/inventory/stock_list/` | `stock_list_cubit.dart` + `stock_list_state.dart` | NEW | Cubit (`BaseCubit<StockListState>`, `@Injectable`) + `@freezed` state | ~150 | AC-1, AC-2, AC-3, AC-5, AC-6 |
| `lib/ui/inventory/stock_list/` | `stock_list_search_cubit.dart` + `_state.dart` | NEW | Cubit + `@freezed` state, debounce | ~120 | AC-4 |
| `lib/ui/inventory/stock_list/` | `stock_list_filter_cubit.dart` + `_state.dart` | NEW | Cubit (local + paginated dropdown Kho state, REUSE fetch pattern W04 AC-5c) + `@freezed` state | ~130 | AC-4 |
| `lib/core/repositories/inventory/` | `stock_ledger_repository.dart` | NEW | `@LazySingleton(as: StockLedgerRepository)`, `GraphQLService` injected direct (KHÔNG có datasource layer riêng) | ~80 | AC-1, AC-4 |
| `lib/core/repositories/inventory/` | `warehouse_repository.dart` | REUSE (đã tồn tại từ `FEAT-OB-LIST` W04) | `@LazySingleton(as: WarehouseRepository)` — KHÔNG tạo file mới, grep verify path còn đúng trước khi wire | 0 | AC-4 |
| `lib/core/models/inventory/` | `stock_ledger_row_model.dart` | NEW | `@freezed` + `@JsonSerializable` | ~60 | — |
| `lib/core/models/request/inventory/` | `stock_ledger_at_date_request.dart` | NEW | `@freezed` request DTO | ~40 | AC-4 |
| `lib/core/models/response/inventory/` | `stock_ledger_at_date_response.dart` | NEW | `@freezed` paged response DTO | ~50 | — |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (add 3 `@RoutePage` route entries) | auto_route 10.1.0+1 | ~20 | AC-1, AC-4 |
| `assets/localizations/` | `vi.json` + `en.json` (+ regen `lib/generated/locale_keys.gen.dart`) | ADDITIVE | easy_localization | ~40 | AC-1, AC-2, AC-3, AC-4 |
| `test/ui/inventory/stock_list/` | `*_test.dart` | NEW (stage TEST — DEV chỉ document golden path per policy 2026-06-04) | bloc_test + widget | — | AC-1, AC-4 |
| `integration_test/` | `stock_list_e2e_test.dart` | NEW (stage TEST) | Patrol | — | (smoke) |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable). Mobile S6 exit hand-off Patrol E2E.

```
(← BFF tier S5: SDL + resolver stable — stockLedgerAtDate)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable + Figma spec ACTIVE + AppBar title binding confirmed (GAP-W06-GM-01 resolved) + StockProductCard order confirmed (GAP-W06-GM-03 resolved)
    Exit: Patrol E2E happy path green (hub → tap tile → report → search/filter → kết quả)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Repository + Cubit ×3 + Page ×3 + `StockProductCard` + route + i18n | features + router + i18n | BFF S5 stable | Patrol E2E green | BFF S5 |

## 9. Business Rules to enforce (Mobile — UI hint + offline secondary)

> Mobile KHÔNG enforce business validation primary — chỉ trust BE response + render.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-STKV2-002` | CORNERSTONE | render `valueOnHand` luôn là số/0, KHÔNG "Tạm tính" | `widgets/stock_product_card.dart::_InfoRow` | AC-3 | BE final enforce — BE trả non-null Decimal |
| `BR-STKV2-003` | CORNERSTONE | 1 card = 1 dòng `(mã, kho)`, KHÔNG gộp | `stock_list_page.dart::ListWidget.items` | AC-5 | BE trả `content[]` đã tách dòng |
| `BR-STKV2-006` | CORNERSTONE | chỉ hiện dòng SL≠0 HOẶC GT≠0 | n/a — trust BE-side filter | AC-6 | Mobile KHÔNG tự filter lại |
| `BR-STKV2-015` | CORNERSTONE | 2 persona quyền ngang, KHÔNG role-gate riêng route | `stock_list_page.dart` (`AuthGuard` only) | AC-9 | Gate duy nhất ở hub-tile visibility flag |
| `BR-INV-MENU-004` | NORMAL | entry point duy nhất từ hub tile "Tồn kho", client-only nav | `stock_list_page.dart` (push từ `InventoryHubPage`) | AC-1 | Hub sở hữu bởi FEAT-INV-MOBILE-MENU, chỉ tham chiếu |

> **Primary enforcement** = BE tier (`features/be/FEAT-STK-LIST-V2.md §9`).

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1 | Widget test (loading → loaded state) | test-mobile-ui | `bloc_test` cho `StockListCubit` |
| AC-2 | Widget test (card info-row order) | test-mobile-ui | golden snapshot, verify order Kho→SL→ĐVT→GT |
| AC-3 | Widget test (value format số/0) | test-mobile-ui | không "Tạm tính" |
| AC-4 | Widget test (search debounce + filter apply/reset) | test-mobile-ui | `bloc_test` cho `StockListSearchCubit`/`StockListFilterCubit` |
| AC-5 | Widget test (multi-warehouse cards) | test-mobile-ui | mock 2 dòng cùng `productCode` khác `warehouseCode` |
| AC-6 | Widget test (BE-filtered zero rows hidden) | test-mobile-ui | mock response không có dòng zero |
| AC-9 | Widget test (dual persona render giống nhau) | test-mobile-ui + test-isolation | dual persona |
| (smoke) | Mobile E2E happy path | test-mobile-e2e | Patrol: hub → tap tile → report → search → filter → apply |

> DEV không tự generate test file (policy 2026-06-04) — chỉ document golden path cho stage TEST kế thừa.

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — easy_localization LocaleKeys)

| Key | vi | en | AC ref |
|---|---|---|---|
| `stockReportTitle` | "Báo cáo tồn kho" | "Stock report" | AC-1 |
| `warehouse` | "Kho:" | "Warehouse:" | AC-2 |
| `stockQuantity` | "Số lượng tồn:" | "Quantity on hand:" | AC-2, AC-3 |
| `unitOfMeasure` | "ĐVT:" | "Unit:" | AC-2 |
| `stockValue` | "Giá trị tồn:" | "Value on hand:" | AC-2, AC-3 |
| `search` | "Tìm kiếm" | "Search" | AC-4 |
| `searchProductByKeyword` | "Tìm kiếm sản phẩm theo từ khoá" | "Search product by keyword" | AC-4 |
| `productCode` | "Mã sản phẩm" | "Product code" | AC-4 |
| `productName` | "Tên sản phẩm" | "Product name" | AC-4 |
| `noMatchingResult` | "Không có kết quả phù hợp" | "No matching results" | AC-4 |
| `pleaseTryAgain` | "Vui lòng thử lại" | "Please try again" | AC-4 |
| `searchResultCount` | "{} kết quả tìm kiếm cho "{}"" | "{} results for "{}"" | AC-4 |
| `filter` | "Bộ lọc" | "Filter" | AC-4 |
| `selectWarehouse` | "Chọn kho" | "Select warehouse" | AC-4 |
| `resetFilter` | "Thiết lập lại" | "Reset" | AC-4 |
| `apply` | "Áp dụng" | "Apply" | AC-4 |
| `stockListFilterDateLabel` | "Tồn đến ngày" | "Stock as of date" | AC-4 |
| `stockListFilterWarehouseLabel` | "Kho" | "Warehouse" | AC-4 |

> Tất cả key trừ 2 key cuối (`stockListFilterDateLabel`/`stockListFilterWarehouseLabel`, author-derived cho field label chưa có `→ flutter:` mapping sẵn trong Figma spec) đều verbatim từ `→ flutter:` snippet trong `wave06-stk-list-v2.md`.

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1 | `Semantics(label: LocaleKeys.stockReportTitle.tr())` cho AppBar title | TalkBack/VoiceOver |
| AC-2 | `Semantics(label: "$label $value")` cho mỗi `_InfoRow` | announce label+value liền |
| AC-4 | `Semantics` cho search input + mỗi filter field + mỗi item `DropdownMenuWidget` | item chọn dùng `selected: true`, KHÔNG icon check |
| AC-4 | tap target AppBar action icon (search/filter) ≥ 48dp | contrast WCAG AA qua `AppColors.*` |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W06/Product/features/be/FEAT-STK-LIST-V2.md` | DRAFT (đang author song song) | BR primary enforcement, contract source `gf-inventory` |
| BFF | `Execution/wave-specs/W06/Product/features/bff/FEAT-STK-LIST-V2.md` | DRAFT (đang author song song) | GraphQL op `stockLedgerAtDate` consumed (§6.1) |
| FE Web | `Execution/wave-specs/W06/Product/features/fe-web/FEAT-STK-LIST-V2.md` | DRAFT (đang author song song) | Cùng feature web+mobile, share business scope; web có thêm AC-7 (thẻ kho) + AC-8 (export) không thuộc mobile |

**Source ID consistency** (item 18): `source_feat_sha` identical với BE/BFF/FE files (`0f9b9c279f60cab8cb25880dca38d3afe1cf88f20fb9df62c408d8f645784a48`).

**Cross-wave note**: tile "Tồn kho" trên hub (entry point AC-1) thuộc `FEAT-INV-MOBILE-MENU` (cross-wave W03→W06, state-matrix flip) — KHÔNG phải file map của FEAT này, chỉ tham chiếu read-only.

## 13. References

- **Source**: [`Product/features/FEAT-STK-LIST-V2.md`](../../../../../Product/features/FEAT-STK-LIST-V2.md) v10
- **Paired BE**: [`features/be/FEAT-STK-LIST-V2.md`](../be/FEAT-STK-LIST-V2.md)
- **Paired BFF**: [`features/bff/FEAT-STK-LIST-V2.md`](../bff/FEAT-STK-LIST-V2.md)
- **Paired FE Web**: [`features/fe-web/FEAT-STK-LIST-V2.md`](../fe-web/FEAT-STK-LIST-V2.md)
- **Figma spec**: [`Product/ux/figma-mobile/wave06-stk-list-v2.md`](../../../../../Product/ux/figma-mobile/wave06-stk-list-v2.md) (ACTIVE v3, 6 screens, 25 PNG)
- **Warm-up report**: [`Tracking/warm-up/WAVE06/W06-garage-mobile-warm-up-phaseA.md`](../../../../../Tracking/warm-up/WAVE06/W06-garage-mobile-warm-up-phaseA.md) (READY_FOR_DEV, 4 gap RESOLVED)
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md)
- **PKG**: [`PKG-W06-inventory-pricing-stock-report.md`](../../../../work-packages/PKG-W06-inventory-pricing-stock-report.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-31 | 3 | main-agent (user sonhoang confirm — "đóng NEED CONFIRMATION đi") | **§4.10 RESOLVED**: ratify `searchWarehouses` (op #305, `Architecture/api/agg-garage-graph-graphql.md`, pre-existing từ W04) làm datasource dropdown "Kho" ở `StockListFilterPage` — parity precedent `Execution/wave-specs/W04/Product/features/mobile/FEAT-OB-LIST.md §AC-5c`. Cascade edit: §3 AC-4 (thêm GraphQL op + state transition dropdown paginated), §6.1 (thêm row `searchWarehouses` + REUSE `WarehouseRepository`), §7 file map (thêm row REUSE `warehouse_repository.dart`, bump LoC estimate `stock_list_filter_cubit.dart` 90→130 cho paginated dropdown state). KHÔNG đổi scope/AC/Figma ref — chỉ đóng open item bằng bằng chứng đã có sẵn trong repo, không cần re-review đầy đủ (không phải AC/scope change). Front-matter `version` field đồng bộ lại 1→3 (pre-existing drift — Change Log đã ở v2 nhưng front-matter chưa bump theo, fix cùng lần edit này). |
| 2026-07-31 | 2 | main-agent (orchestrator, post `agent-execution-spec-reviewer` APPROVED — 0 FAIL / 7 non-blocking WARNING across whole W06 wave folder) | status DRAFT → ACTIVE. `reviewer_verdict` set. Verdict + full review report: see `/tmp/reviewer-verdict-W06.json` (persisted by orchestrator) + wave-level review summary in session transcript. Non-blocking WARNING items tracked for same-day follow-up per wave convention. |
| 2026-07-31 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-STK-LIST-V2` W06. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm Mobile, §3 Mobile behaviour map 9/9 AC (AC-7/AC-8 khai báo N/A theo platform scope), §4 visual + state + native (N/A) + offline (N/A — online-required) + i18n + a11y + RBAC + BR secondary + perf + error mapping, §5-§12 Mobile-specific (3 page/3 cubit/1 widget mới StockProductCard/GraphQL 1 op stockLedgerAtDate/cross-tier pair). Áp dụng đầy đủ 3 quyết định prior-session: AppBar title "Báo cáo tồn kho" (GAP-W06-GM-01), `StockProductCard` info-row order canonical Kho→SL→ĐVT→GT (GAP-W06-GM-03), Figma spec ACTIVE v3 làm SSOT. Nguồn FEAT chỉ audit. |
