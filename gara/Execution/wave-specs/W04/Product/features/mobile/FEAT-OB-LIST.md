---
type: execution
artifact_kind: converted-feature
tier_role: mobile                                      # FAN-OUT MARKER
source_ref: "Product/features/FEAT-OB-LIST.md"
source_version: 9
source: "gen-execution-spec"
source_feat_id: "FEAT-OB-LIST"
source_feat_sha: "d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8"
generated_at: "2026-07-08T05:30:00Z"
status: ACTIVE
version: 1
tier: T4
owner_authority: Delivery Authority
wave: "W04"
parent_epic: "EP-INVENTORY-OPENING-BALANCE"
parent_pkg: "PKG-W04-inventory-period-opening-balance"
experience: "garage-mobile"
platform: mobile
modifies: []
change_type: "new-capability"
consumes_backend_feats: ["FEAT-OB-LIST"]
consumes_bff_feats: ["FEAT-OB-LIST"]
screens_touched:
  - "lib/ui/inventory/opening_balance_list/opening_balance_list_page.dart"
  - "lib/ui/inventory/opening_balance_search/opening_balance_search_page.dart"
flutter_packages: ["flutter_bloc", "get_it", "injectable", "freezed", "graphql_flutter", "auto_route", "pull_to_refresh", "gap"]
figma_refs:
  - "Product/ux/figma-mobile/wave04-ob-list.md (node 21290:52697 — Danh sách tồn đầu kỳ canonical; sub-screens 21290:52992/21290:53556/21290:53004 search, 21290:54167/21290:54179 filter — xem §5.1)"
authoring_inputs:
  pkg_ref: "PKG-W04-inventory-period-opening-balance"
  fanout_map_sha: "NEED CONFIRMATION — không compute được trong session này (không có shell/hash tool khả dụng)"
  template_sha: "NEED CONFIRMATION — không compute được trong session này (không có shell/hash tool khả dụng)"
  bundle_path: "/tmp/exec-spec-bundles/W04/FEAT-OB-LIST.mobile.md"
  bundle_generated_at: "2026-07-08T04:51:55+00:00"
reviewer_verdict: null
last_reviewed: "2026-07-08"
---

# FEAT-OB-LIST (Mobile): Danh sách tồn đầu kỳ

> **Mobile tier (Flutter) — authoritative cho dev**. Tài liệu này là spec duy nhất agent Mobile cần đọc để impl. Source FEAT chỉ phục vụ audit (xem §0).
> Figma là SSOT visual (link ở §5). Cross-tier coordination ở §12.

---

## Metadata

| Field | Value |
|---|---|
| Feature ID | `FEAT-OB-LIST` |
| Tier | **mobile** |
| Experience | `garage-mobile` |
| Platform | mobile (Flutter) — **view-only** (không có import/sửa/xóa trên mobile) |
| Parent Epic | [`EP-INVENTORY-OPENING-BALANCE`](../../epics/EP-INVENTORY-OPENING-BALANCE.md) |
| Wave | W04 |
| Status | DRAFT |
| Screens touched | `opening_balance_list_page.dart`, `opening_balance_search_page.dart` |
| Flutter packages | `flutter_bloc`, `get_it`, `injectable`, `freezed`, `graphql_flutter`, `auto_route`, `pull_to_refresh`, `gap` |
| Cross-tier consume | BE: `FEAT-OB-LIST` \| BFF: `FEAT-OB-LIST` |
| Feature flag | `Inventory:InventoryV2` (Firebase RemoteConfig) |

## 0. Nguồn (audit only)

> Tier spec authoritative cho dev. Source FEAT chỉ dùng audit trail — không copy text. BA/PO update source → KHÔNG auto-cascade; cần `/cr-raise MINOR` + `/gen-execution-spec --force --artifact FEAT-OB-LIST` để regen.

| Field | Value |
|---|---|
| Source path | [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) |
| Source version | v9 |
| Source SHA | `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` |
| Generated at | 2026-07-08T05:30:00Z |

## 1. Mục đích nghiệp vụ

Chủ garage / kế toán cần rà soát nhanh danh sách các dòng tồn đầu kỳ đã được ghi nhận cho garage — theo mã/tên sản phẩm nội bộ, kho, ngày chốt và giá trị — với khả năng tìm kiếm và lọc để kiểm tra dữ liệu khởi tạo tồn kho. Tồn đầu kỳ là điểm khởi đầu của toàn bộ dòng chảy tồn kho: mọi báo cáo nhập-xuất-tồn và sổ tồn ledger về sau đều bắt nguồn từ dữ liệu này, nên việc xem lại và đối chiếu số liệu là bước kiểm soát quan trọng trước khi các nghiệp vụ nhập/xuất kho (W05) bắt đầu ghi nhận biến động.

## 2. Trách nhiệm Mobile (garage-mobile)

- Màn hình "Tồn đầu kỳ" (App Garage) — entry point qua mission tile "Quản lý kho hàng" → tile "Tồn đầu kỳ" trên Home (Sảnh chính); **view-only**, KHÔNG có import/sửa/xóa trên mobile (khác web GMS).
- User flow chính: mở danh sách (card view) → tap search icon mở màn tìm kiếm dedicated (debounce) → tap filter icon mở bottom-sheet lọc (Kho + Ngày Import) → cuộn infinite-scroll để phân trang.
- State machine UI tường minh: `initial → loading → loaded/empty → error` qua Cubit, kèm skeleton loading (shimmer) và pull-to-refresh.
- Widget reuse-first: `ListWidget` (list foundation, skeleton + SmartRefresher), `CustomAppBar`, `AppButton`, `DropdownTextField`, `StartInfoRow` (cross-domain inventory sibling) — chỉ build widget mới cho phần domain-specific (card OB, footer tổng).
- GraphQL op consume từ BFF `agg-garage-graph`: `searchOpeningBalances` (danh sách + tổng hợp) và `searchWarehouses` (dropdown Kho paginated) qua `graphql_flutter`.
- RBAC: garage-owner và accountant có quyền xem ngang nhau, cả hai đều view-only trên mobile (không có write action nào để phân biệt quyền).
- Feature flag `Inventory:InventoryV2` (Firebase RemoteConfig) gate hiển thị tile/route — ẩn hoàn toàn khi flag OFF (gate chính đặt ở Home tile per `FEAT-INV-MOBILE-MENU`, page tự defensive-check khi mở trực tiếp qua deeplink).

## 3. Hành vi cần triển khai (Mobile behaviour map)

> Coverage: 19/19 source AC-ID (9 áp dụng cho mobile, 10 khai báo N/A — web-only).

### Cluster A — Entry point, card danh sách, tổng hợp, empty state, RBAC

#### AC-1b → Entry point mission tile "Quản lý kho hàng" → tile "Tồn đầu kỳ"

- **Khi**: user tap tile "Tồn đầu kỳ" trên Home (Sảnh chính), dưới mission tile "Quản lý kho hàng".
- **Mobile phải**: `AutoRouter.push(OpeningBalanceListRoute())` mở `OpeningBalanceListPage`; AppBar render `← back` + title verbatim "Tồn đầu kỳ" + icon 🔍 search (trailing) + icon ⚙ filter (trailing-2); body SliverList card view-only; footer sticky "Tổng". Back về Home + preserve back stack.
- **State transition**: `initial → loading → loaded` (`OpeningBalanceListCubit.fetchList()` dispatch tại `initState`).
- **Widget**: `CustomAppBar` (REUSE) + `ListWidget` (REUSE) làm khung SliverList.
- **GraphQL op**: `searchOpeningBalances(input: {page: 0, size: 20})` (initial fetch).
- **i18n key (ARB)**: `ob_list_appbar_title`.
- **a11y**: `Semantics(label: "Tồn đầu kỳ")` trên AppBar title; `Semantics(button: true, label: "Quay lại")` trên back icon.
- **Platform-specific**: không khác biệt iOS/Android — push route chuẩn.
- **Ref**: paired BFF FEAT §6.1 op `searchOpeningBalances`; Figma node `21290:52697` (§5.1).

#### AC-2b → Card layout render (5 field)

- **Khi**: `searchOpeningBalances` trả về `content[]` (`OpeningBalanceLine[]`).
- **Mobile phải**: render mỗi item = card với header `#{productCode}` (blue bold, VD `#IP-BP-0001`) + item name `{productName}` (bold) + separator + 5 field row: (1) 🏢 Kho: `{warehouseName}`; (2) 📅 Tồn đến ngày: `{asOfDate}` (`dd/MM/yyyy`); (3) 🛒 Số lượng: `{quantityOnHand}`; (4) 💰 Giá trị tồn: `{valueOnHand}` (VN thousand separator); (5) 📦 ĐVT: `{mainUnitName}` (fallback `mainUnitCode` khi enrichment null). KHÔNG render STT / Người import / Ngày import / checkbox / cột Thao tác (khác web).
- **State transition**: `loaded` state, `List<OpeningBalanceLine>` bind vào `ListWidget.items`. Sắp xếp mặc định: `createdAt` (Ngày import) mới nhất lên đầu — server-side order, mobile không tự sort lại.
- **Widget**: `OpeningBalanceCard` (NEW — domain-specific composition, không có widget generic fit ở `lib/ui/widgets/**` per §G.X scan) + `StartInfoRow` (REUSE cross-domain, `lib/ui/inventory/widgets/start_info_row.dart`) cho mỗi field row.
- **GraphQL op**: `searchOpeningBalances` — field selection `productCode, productName, warehouseName, asOfDate, quantityOnHand, valueOnHand, mainUnitName, mainUnitCode`.
- **i18n key (ARB)**: `ob_list_field_warehouse`, `ob_list_field_as_of_date`, `ob_list_field_quantity`, `ob_list_field_value`, `ob_list_field_unit`.
- **a11y**: `Semantics(label: "{productCode} {productName}, Kho {warehouseName}, Tồn đến ngày {asOfDate}, Số lượng {quantityOnHand}, Giá trị {valueOnHand}, ĐVT {mainUnitName}")` — compound label per card cho screen reader.
- **Platform-specific**: không có.
- **Ref**: Figma node `21290:52697` (§5.1); mainUnitName enrichment per `Architecture/api/agg-garage-graph-graphql.md v7.50 §3g.1`.

#### AC-3 → Dòng tổng (footer sticky, cross-platform)

- **Khi**: list render xong ở bất kỳ trang nào, theo bộ lọc hiện tại.
- **Mobile phải**: hiển thị footer sticky "Tổng" = tổng Số lượng tồn + tổng Giá trị tồn lấy từ `PagedOpeningBalanceData.aggregates` (`totalQuantity` + `totalValue`) — server-side tính theo filter hiện tại, KHÔNG sum thủ công phía client.
- **State transition**: cập nhật mỗi lần `loaded` state emit mới (search/filter/pull-refresh/load-more).
- **Widget**: `OpeningBalanceSummaryFooter` (NEW, sticky bottom, không có generic fit ở `lib/ui/widgets/**`).
- **GraphQL op**: `searchOpeningBalances` — field `aggregates { totalQuantity totalValue }`.
- **i18n key (ARB)**: `ob_list_summary_total_label`.
- **a11y**: `Semantics(liveRegion: true)` cho vùng Tổng — announce khi giá trị thay đổi.
- **Platform-specific**: không có.
- **Ref**: Figma node `21290:52697` footer.

#### AC-3b-mobile → Empty state "Chưa có tồn đầu kỳ"

- **Khi**: `PagedOpeningBalanceData.totalElements = 0` (garage chưa có dòng OB nào — không phân biệt filter hay không).
- **Mobile phải**: AppBar giữ đầy đủ (title + 🔍 search + ⚙ filter enable — user vẫn search/filter được); body render card empty giữa màn với text "Chưa có tồn đầu kỳ". **KHÔNG có CTA** (view-only — khác web AC-3b có nút "Import tồn đầu kỳ"). **KHÔNG render**: footer "Tổng" + loading indicator.
- **State transition**: `loaded` state với `isEmpty=true` (`ListWidget` tự render qua `LoadEmpty`, message override).
- **Widget**: `LoadEmpty` (REUSE, `lib/ui/widgets/loading/load_empty.dart`, param `message` override "Chưa có tồn đầu kỳ").
- **GraphQL op**: `searchOpeningBalances` (response 0-length).
- **i18n key (ARB)**: `ob_list_empty_message`.
- **a11y**: `Semantics(label: "Chưa có tồn đầu kỳ")`.
- **Platform-specific**: không có.
- **Ref**: `UX-FLOW-INVENTORY-OPENING-BALANCE.md §1` (mobile view-only); layout tái dùng canonical node `21290:52697`.

#### AC-9 → Phân quyền + tenant scope (cross-platform)

- **Khi**: garage-owner hoặc accountant mở màn "Tồn đầu kỳ".
- **Mobile phải**: cả 2 persona xem với quyền ngang nhau — view-only (không có write action nào để phân biệt quyền trên mobile). Danh sách chỉ hiển thị dòng thuộc garage hiện tại (tenant scope tự động qua `X-Tenant-Id` header interceptor của `GraphQLService`) — mobile không tự filter tenant thủ công.
- **State transition**: N/A — passive scope, không có state riêng.
- **Widget**: N/A.
- **GraphQL op**: `searchOpeningBalances` — tenant header tự inject qua interceptor.
- **i18n key (ARB)**: N/A.
- **a11y**: N/A.
- **Platform-specific**: không có.
- **Ref**: Critical Rule #4 (Tenant isolation); feature-flag gate §4.6.

### Cluster B — Tìm kiếm dedicated

#### AC-4b → Dedicated search screen

- **Khi**: user tap icon 🔍 search trên AppBar màn "Tồn đầu kỳ".
- **Mobile phải**: `AutoRouter.push(OpeningBalanceSearchRoute())` mở `OpeningBalanceSearchPage` — AppBar `← back` + full-width `TextField` placeholder "Tìm kiếm"; body 3 state: **Default** (chưa nhập — heading "Tìm kiếm sản phẩm theo từ khoá" + 2 bullet "Mã sản phẩm" / "Tên sản phẩm"), **Results** (SliverList card giống canonical, apply keyword + activeFilters nếu combine), **No Results** (`totalElements = 0` sau search — text "Không có kết quả phù hợp").
- **State transition**: `Default → typing → debounce(≥300ms) → loading → loaded/empty`.
- **Widget**: `OpeningBalanceCard` (REUSE từ list page, cùng definition với AC-2b) + `AppTextField` (REUSE, `lib/ui/widgets/text_field/app_text_field.dart`) + `LoadEmpty`/custom no-result text.
- **GraphQL op**: `searchOpeningBalances(input: {keyword, ...activeFilters, page: 0, size: 20})`.
- **i18n key (ARB)**: `ob_search_hint_title`, `ob_search_hint_bullet_code`, `ob_search_hint_bullet_name`, `ob_search_no_results`.
- **a11y**: `Semantics(textField: true, label: "Tìm kiếm")` cho ô search; `SemanticsService.announce` khi kết quả tìm kiếm thay đổi.
- **Platform-specific**: keyboard auto-focus khi push route (cả iOS/Android).
- **Ref**: Figma node `21290:52992` (Default/Results — screen 2 & 3), `21290:53004` (No Results — screen 4).

### Cluster C — Bộ lọc

#### AC-5b → Filter bottom-sheet

- **Khi**: user tap icon ⚙ filter trên AppBar (từ List hoặc Search screen).
- **Mobile phải**: mở bottom-sheet title "Bộ lọc" (verbatim Figma) với 2 filter — (1) "Ngày Import" date-picker range `dd/mm/yyyy - dd/mm/yyyy` map `importedFrom`/`importedTo`; (2) "Kho" dropdown placeholder "Chọn kho" map `warehouseId`. **KHÔNG có filter "Người import"** (web-only, per AC-5b explicit exclusion). Footer: **`[Thiết lập lại]`** (secondary, trái) + **`[Áp dụng]`** (primary, phải). Áp dụng → close sheet + reset page=0 + fetch `searchOpeningBalances` với activeFilters mới. Thiết lập lại → clear filter values về default, KHÔNG apply, giữ sheet mở.
- **State transition**: local `OpeningBalanceFilterCubit` (draft state, tách khỏi list state) — chỉ commit vào `OpeningBalanceListCubit` khi Áp dụng.
- **Widget**: Flutter built-in `showModalBottomSheet` (KHÔNG có `AppBottomSheet` widget trong filesystem) chứa `FilterCalendarWidget` (REUSE, `lib/ui/widgets/picker/filter_calendar_widget.dart` — date range picker filter-specific) + `DropdownTextField` (REUSE, `lib/ui/widgets/text_field/dropdown_text_field.dart`, custom item builder cho paginated Kho) + `AppButton` (REUSE, `lib/ui/widgets/button/app_button.dart`) ×2 cho footer.
- **GraphQL op**: trigger lại `searchOpeningBalances(input: {..., importedFrom, importedTo, warehouseId, page: 0, size: 20})` sau khi Áp dụng.
- **i18n key (ARB)**: `ob_filter_title`, `ob_filter_date_label`, `ob_filter_warehouse_label`, `ob_filter_reset_button`, `ob_filter_apply_button`.
- **a11y**: `Semantics(label: ...)` per filter field + footer button.
- **Platform-specific**: date-picker cross-platform qua `FilterCalendarWidget` wrapper (iOS/Android không khác renderer trực tiếp — widget tự abstract).
- **Ref**: Figma node `21290:54167` (Default — screen 5), `21290:54179` (Filled — screen 6).

#### AC-5c → Kho dropdown paginated + preserve selection

- **Khi**: user tap dropdown "Kho" trong bottom-sheet Bộ lọc.
- **Mobile phải**: gọi `searchWarehouses(input: {page: 0, size: 20})` load page 0; khi user scroll dropdown đến cuối trang → fetch `page++` và append (load-more pattern), loading indicator cuối list khi fetch. **Preserve selection**: (i) selected warehouse ở page 0 → render check-mark bình thường; (ii) selected warehouse ngoài page 0 (page N>0) → mở dropdown load page 0 mặc định + hiển thị badge "Đang chọn: {warehouseName}" ở top dropdown; (iii) khi load-more đến page chứa item đó → item render check-mark/highlight "selected" đúng logic (không double-render). Selection state persist trong bottom-sheet lifecycle (đóng sheet chưa Áp dụng → reopen giữ nguyên selection).
- **State transition**: dropdown-local state trong `OpeningBalanceFilterCubit` — `loading → loaded(page N) → loadingMore → loaded(page N+1 appended)`.
- **Widget**: `DropdownTextField` (REUSE, custom item builder + badge) + `LoadingMoreIndicator` (REUSE, `lib/ui/widgets/loading/loading_more_indicator.dart`) cho cuối list.
- **GraphQL op**: `searchWarehouses(input: WarehouseSearchRequest)` — op #305 per `Architecture/api/agg-garage-graph-graphql.md`. Response `PagedApiResponseWarehouseResponse.data.content`; `pageInfo.hasNext` client-compute.
- **i18n key (ARB)**: `ob_filter_warehouse_selected_badge` ("Đang chọn: {name}").
- **a11y**: `Semantics(label: "Chọn kho, đang chọn {warehouseName}")`.
- **Platform-specific**: không có.
- **Ref**: Figma node `21290:54167`/`21290:54179`; GraphQL op #305 (`agg-garage-graph-graphql`).

### Cluster D — Phân trang

#### AC-6b → Infinite-scroll pagination

- **Khi**: user scroll đạt **75% list length** hiện tại (per `Architecture/hld/garage-mobile-HLD.md §11b.4` pagination strategy).
- **Mobile phải**: fetch `searchOpeningBalances(input: {page: current+1, size: 20, ...activeFilters})`; client compute `hasNextPage = page+1 < totalPages` từ `PagedOpeningBalanceData`. Loading indicator hiển thị cuối list khi fetch. Filter/search apply → reset về page 0 + scroll top. **KHÔNG có** bộ chọn số dòng / điều hướng trang (khác web).
- **State transition**: `loaded(page N) → loadingMore → loaded(page N+1 appended)`.
- **Widget**: `ListWidget` (REUSE) — pull-up load-more qua `SmartRefresher` + `RefreshController.loadComplete()` (`pull_to_refresh: ^2.0.0`; KHÔNG dùng `infinite_scroll_pagination` — package NOT in pubspec).
- **GraphQL op**: `searchOpeningBalances` (paginated, `page`/`size` tăng dần).
- **i18n key (ARB)**: N/A — không có text mới.
- **a11y**: `SemanticsService.announce` khi trang mới load xong (tùy chọn, tránh spam announce từng item).
- **Platform-specific**: không có.
- **Ref**: `Architecture/hld/garage-mobile-HLD.md §11b.4`; Figma node `21290:52697`.

### Cluster E — Web-only (N/A trên Mobile)

#### AC-1 → N/A (web-only, xem `be/`/`fe-web/` tier file)

- Web layout: search bar inline + 3 filter cùng dòng header + nút "Import tồn đầu kỳ" luôn hiển thị top-right; nút "Xoá các dòng đã chọn" ẩn/hiện theo checkbox. Mobile dùng entry + AppBar riêng (xem AC-1b).

#### AC-2 → N/A (web-only)

- Cột bảng web (checkbox, STT, Người import, Ngày import, cột Thao tác sửa/xóa). Mobile dùng card 5-field view-only hoàn toàn khác biệt (xem AC-2b).

#### AC-3b → N/A (web-only)

- Empty state web có nút CTA "Import tồn đầu kỳ" mở wizard import. Mobile view-only không có CTA (xem AC-3b-mobile).

#### AC-4 → N/A (web-only)

- Inline search bar trong header web (cùng dòng 3 filter). Mobile dùng dedicated search screen riêng (xem AC-4b).

#### AC-5 → N/A (web-only)

- 3 filter inline web (Kho / Người import / Ngày import). Mobile chỉ có 2 filter trong bottom-sheet, KHÔNG có "Người import" (xem AC-5b).

#### AC-6 → N/A (web-only)

- Offset pagination + bộ chọn số dòng mỗi trang. Mobile dùng infinite-scroll (xem AC-6b).

#### AC-7 → N/A (web-only)

- Checkbox chọn dòng để xóa hàng loạt (`FEAT-OB-DELETE-LINES`). Mobile view-only, không có write action nào.

#### AC-8 → N/A (web-only)

- Nút "Import tồn đầu kỳ" mở wizard (`FEAT-OB-IMPORT`). Mobile không có action này.

#### AC-10 → N/A (web-only)

- Icon sửa dòng per row → mở form sửa (`FEAT-OB-EDIT`). Mobile không có.

#### AC-11 → N/A (web-only)

- Icon xóa dòng per row → popup xác nhận xóa (`FEAT-OB-DELETE-LINES`). Mobile không có.

## 4. Ràng buộc & rule cần enforce

### 4.1 Visual fidelity (Figma SSOT)

- Không re-invent layout / spacing / color — bám sát node-id: `21290:52697` (list canonical), `21290:52992`/`21290:53556`/`21290:53004` (search), `21290:54167`/`21290:54179` (filter).
- Design tokens lấy từ `lib/core/common/styles/{app_colors,app_text_styles,app_sizes,app_shadows}.dart` — `AppColors.*` / `AppTextStyle.*` / `AppSizes.spacing*` / `AppShadow.*`. **KHÔNG** hardcode `Color(0xFF…)` / `TextStyle(...)` literal.
- Card header `#{productCode}` dùng token màu blue bold theo Figma (verify token cụ thể lúc DEV — không hardcode hex).
- Responsive: phone (compact) chính; tablet layout không có yêu cầu riêng trong scope W04 (verify khi DEV nếu có gap).
- Feature này KHÔNG phải form (read-only list) — rule "required asterisk" của template không áp dụng.

### 4.2 State machine + error handling

- Bloc/Cubit state tường minh: `initial | loading | loaded | empty | error` cho cả `OpeningBalanceListCubit` và `OpeningBalanceSearchCubit`. Mỗi state có widget render tương ứng (skeleton / card list / `LoadEmpty` / error widget).
- Error → SnackBar (network/timeout) theo mapping §4.9. KHÔNG silent fail — log qua Sentry/equivalent.
- Feature này KHÔNG có form/submit — rule "form-validity gating" của template không áp dụng (read-only list + filter, không có write action).

### 4.3 Native interaction + permission

- Feature KHÔNG yêu cầu native permission (không camera/photo/location/microphone). KHÔNG có deeplink scheme bắt buộc ngoài internal push route.

### 4.4 Offline + connectivity

- Online required (không offline-first) — feature là read-only data từ server, không có ý nghĩa cache lâu dài do dữ liệu OB có thể đổi bởi web GMS bất kỳ lúc nào.
- `graphql_flutter` `fetchPolicy: cacheAndNetwork` cho initial list load (UX nhanh khi mở lại); `networkOnly` cho search/filter/load-more (cần dữ liệu fresh, tránh stale results).
- Banner "Không có kết nối mạng" khi mất mạng (connectivity_plus/equivalent) — retry tự động khi reconnect (`SmartRefresher` cho phép user pull-to-refresh thủ công).

### 4.5 i18n + a11y

- Mọi label string qua ARB key (`mobile/gf-garage-app/lib/l10n/intl_en.arb` + `intl_vi.arb`) — KHÔNG hardcode tiếng Việt inline (trừ Figma label verbatim ở widget tree khi chưa có key sẵn — vẫn phải khai key mới).
- a11y: `Semantics` cho icon-only button (search/filter icon trên AppBar), `excludeSemantics` cho decorative icon trong card row; test TalkBack/VoiceOver.
- Tap target ≥ 48dp cho icon search/filter và footer filter buttons; contrast ratio đạt WCAG AA.

### 4.6 RBAC render + feature flag

- Feature flag `Inventory:InventoryV2` (Firebase RemoteConfig) — gate chính đặt ở Home tile visibility (`FEAT-INV-MOBILE-MENU`); `OpeningBalanceListPage` defensive-check tại Cubit init (nếu flag OFF khi mở qua deeplink trực tiếp → hiển thị `PermissionDeniedDialog` hoặc pop back, KHÔNG render nội dung).
- Persona check: garage-owner + accountant có quyền view ngang nhau — KHÔNG có phân biệt render nào cần (mobile không có write action). Route gate qua auto_route `AuthGuard` (`lib/core/router/auth_guard.dart`) — đảm bảo user đã login + có tenant context hợp lệ.

### 4.7 Business rule secondary (UI hint)

- BR primary nằm BE (xem paired `be/FEAT-OB-LIST.md §9`). Mobile chỉ là passive consumer của kết quả server-side filter/search/tenant-scope — không có business validation nào cần thực hiện phía client cho feature read-only này.
- SnackBar khi server trả lỗi (network/timeout) theo mapping §4.9.

### 4.8 Performance

- **`ListWidget` canonical** (`lib/ui/widgets/list/list_widget.dart`) cho cả list chính và search results — handle `isInitial/isLoading/isFailure/isEmpty` + auto-skeleton (`LoadingListWidget` × `LoadingRowShimmerWidget`) + `SmartRefresher` pull-down + pull-up load-more qua `RefreshController` (`pull_to_refresh: ^2.0.0`). KHÔNG dùng raw `ListView.builder`, KHÔNG dùng `infinite_scroll_pagination` (package NOT in pubspec — incident W03 2026-06-30).
- Debounce search input ≥300ms trước khi fire query (AC-4b) — tránh spam GraphQL call.
- Avoid rebuild toàn screen — split widget (`OpeningBalanceCard` là `const`-friendly StatelessWidget) + `BlocBuilder` granular theo state slice.

### 4.9 Error code mapping (consume từ BFF)

| Error code (BFF) | Display mode | Widget | Source AC |
|---|---|---|---|
| Network timeout / connection error | SnackBar | `ToastMessageUtils` (`lib/ui/widgets/notify/toast_message_utils.dart`) | AC-1b, AC-4b, AC-5b, AC-6b |
| `ERR-CMN-tenant-mismatch` (nếu server trả) | Dialog (fatal — force logout/re-login) | `AppAlertDialogCustom` | AC-9 |
| GraphQL generic error (5xx) | SnackBar + retry hint | `ToastMessageUtils` | AC-1b, AC-4b, AC-5b/5c, AC-6b |

---

## 5. Screen / Widget breakdown (Mobile — primary content)

> Author tổng hợp từ Figma + UX flow + AC. Path glob ⊆ `mobile/gf-garage-app/lib/**`.

### 5.1 Pages

| Page | auto_route path (@RoutePage) | Modifies/New | Figma node-id | AC ref |
|---|---|---|---|---|
| `OpeningBalanceListPage` | `/inventory/opening-balance` | NEW | `21290:52697` | AC-1b, AC-2b, AC-3, AC-3b-mobile, AC-6b, AC-9 |
| `OpeningBalanceSearchPage` | `/inventory/opening-balance/search` | NEW | `21290:52992` (+ `21290:53556` results, `21290:53004` no-results) | AC-4b |

### 5.2 Widgets

| Widget | Path | Change type | State | Reuse pattern | AC ref |
|---|---|---|---|---|---|
| `OpeningBalanceCard` | `lib/ui/inventory/opening_balance_list/widgets/opening_balance_card.dart` | NEW | StatelessWidget | domain-specific card composition — no fit ở `lib/ui/widgets/**` per §G.X scan | AC-2b, AC-4b |
| `OpeningBalanceSummaryFooter` | `lib/ui/inventory/opening_balance_list/widgets/opening_balance_summary_footer.dart` | NEW | StatelessWidget | sticky footer aggregate — no fit ở `lib/ui/widgets/**` | AC-3 |
| `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | REUSE | StatefulWidget | canonical list pattern — skeleton + SmartRefresher pull-down/pull-up | AC-1b, AC-4b, AC-6b |
| `LoadEmpty` | `lib/ui/widgets/loading/load_empty.dart` | REUSE (custom message override) | StatelessWidget | empty state — auto-rendered bởi ListWidget khi `isEmpty=true` | AC-3b-mobile |
| `LoadingRowShimmerWidget` (via ListWidget) | `lib/ui/widgets/loading/loading_row_shimmer_widget.dart` | REUSE (indirect) | StatelessWidget | shimmer skeleton (package `shimmer: ^3.0.0`), auto-rendered bởi ListWidget khi `isInitial=true` | AC-1b |
| `CustomAppBar` | `lib/ui/widgets/custom_app_bar.dart` | REUSE | StatelessWidget | AppBar title + trailing icon search/filter | AC-1b |
| `AppTextField` | `lib/ui/widgets/text_field/app_text_field.dart` | REUSE | StatefulWidget | search box (dedicated search page) | AC-4b |
| `DropdownTextField` | `lib/ui/widgets/text_field/dropdown_text_field.dart` | REUSE | StatefulWidget | dropdown "Kho" filter (custom item builder cho paginated + preserve selection + badge) | AC-5b, AC-5c |
| `FilterCalendarWidget` | `lib/ui/widgets/picker/filter_calendar_widget.dart` | REUSE | StatefulWidget | date-range picker "Ngày Import" (filter-specific — verify range API lúc DEV) | AC-5b |
| `AppButton` | `lib/ui/widgets/button/app_button.dart` | REUSE | StatelessWidget | footer buttons "Thiết lập lại" / "Áp dụng" | AC-5b |
| `LoadingMoreIndicator` | `lib/ui/widgets/loading/loading_more_indicator.dart` | REUSE | StatelessWidget | load-more indicator (Kho dropdown pagination) | AC-5c |
| `StartInfoRow` | `lib/ui/inventory/widgets/start_info_row.dart` | REUSE (cross-domain sibling) | StatelessWidget | field row trong card (Kho / Tồn đến ngày / Số lượng / Giá trị / ĐVT) | AC-2b |
| `ToastMessageUtils` | `lib/ui/widgets/notify/toast_message_utils.dart` | REUSE | utility | error SnackBar helper | (error mapping §4.9) |

> Ghi chú: `StatusBadge` (đề xuất trong Focus hint) được đánh giá nhưng **không áp dụng** — `OpeningBalanceLine` không có field status enum theo AC-2b (chỉ 5 field: Kho/Tồn đến ngày/SL/GT/ĐVT).

### 5.3 Navigation

| Route | Page | Loader/Guard | Deeplink | AC ref |
|---|---|---|---|---|
| `/inventory/opening-balance` | `OpeningBalanceListPage` | `AuthGuard` (auto_route) + defensive `Inventory:InventoryV2` flag check tại Cubit init | `garage://inventory/opening-balance` | AC-1b |
| `/inventory/opening-balance/search` | `OpeningBalanceSearchPage` | `AuthGuard` (auto_route) | — (internal push only, không deeplink riêng) | AC-4b |

### 5.4 State management (Bloc/Cubit)

| Concern | Pattern | File | Events/States | AC ref |
|---|---|---|---|---|
| List page state | Cubit | `lib/ui/inventory/opening_balance_list/opening_balance_list_cubit.dart` | `Loading / Loaded / Empty / Error` (extends `BaseCubit<OpeningBalanceListState>`, `@Injectable()`) | AC-1b, AC-2b, AC-3, AC-3b-mobile, AC-6b, AC-9 |
| Filter draft state | Cubit (local, scoped bottom-sheet) | `lib/ui/inventory/opening_balance_list/widgets/opening_balance_filter_cubit.dart` | `DraftChanged / Reset / Applied / WarehouseLoadMore` (extends `BaseCubit<OpeningBalanceFilterState>`, `@Injectable()`) | AC-5b, AC-5c |
| Search page state | Cubit | `lib/ui/inventory/opening_balance_search/opening_balance_search_cubit.dart` | `TypingDebounced / Loading / Loaded / Empty` (extends `BaseCubit<OpeningBalanceSearchState>`, `@Injectable()`) | AC-4b |
| List pagination | `pull_to_refresh: ^2.0.0` via `ListWidget` | `lib/ui/widgets/list/list_widget.dart` | `RefreshController.refreshCompleted()` / `loadComplete()` | AC-6b |

## 6. Data integration (Mobile — consume BFF/BE)

### 6.1 GraphQL operations consumed (từ BFF)

| Operation | Type | graphql_flutter | Repository class | AC ref |
|---|---|---|---|---|
| `searchOpeningBalances` | query | `_graphQLService.client.query(QueryOptions(document: gql(...)))` | `lib/core/repositories/inventory/opening_balance_repository.dart` (`@LazySingleton(as: OpeningBalanceRepository)`) | AC-1b, AC-2b, AC-3, AC-3b-mobile, AC-4b, AC-5b, AC-6b, AC-9 |
| `searchWarehouses` (op #305) | query | `_graphQLService.client.query(QueryOptions(document: gql(...)))` | `lib/core/repositories/inventory/warehouse_repository.dart` (`@LazySingleton(as: WarehouseRepository)` — verify không trùng repository đã tồn tại từ feature W04 khác dùng chung dropdown Kho, reuse nếu có) | AC-5c |

> Mọi op phải tồn tại ở paired BFF FEAT §6.1 (reviewer item #17 enforce) — verify `searchOpeningBalances` + `searchWarehouses` khi paired BFF spec generate.

### 6.2 REST endpoints consumed direct (bypass BFF — hiếm)

| Method | Path | When | Reason | AC ref |
|---|---|---|---|---|
| — | — | N/A | Không có REST bypass — mọi data qua GraphQL BFF `agg-garage-graph` | — |

### 6.3 Offline-first strategy

| Concern | Pattern | Storage | Sync trigger | AC ref |
|---|---|---|---|---|
| Local cache | `graphql_flutter` in-memory cache (`cacheAndNetwork` initial load) | N/A (không Hive/Isar — feature không offline-first) | app foreground / pull-to-refresh | AC-1b |
| Offline queue | N/A — feature không có write action | — | — | — |
| Conflict resolution | N/A — read-only feature | — | — | — |

### 6.4 Platform-specific behaviors

| Concern | iOS-only | Android-only | Notes |
|---|---|---|---|
| Permissions | Không cần | Không cần | Feature không yêu cầu native permission |
| Date-range picker | native wrapper qua `FilterCalendarWidget` | native wrapper qua `FilterCalendarWidget` | AC-5b — widget tự abstract platform renderer |
| Deep link | Universal Link `garage://inventory/opening-balance` | App Link | AC-1b — ưu tiên entry qua Home tile, deeplink là secondary path |

## 7. File/module impact map (Mobile — Flutter feature slice)

| Layer | Path glob | Change type | Reuse pattern | Estimated LoC | AC ref |
|---|---|---|---|---|---|
| `lib/ui/inventory/opening_balance_list/` | `opening_balance_list_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget) | ~200 | AC-1b, AC-9 |
| `lib/ui/inventory/opening_balance_list/` | `opening_balance_list_cubit.dart` | NEW | Cubit (`BaseCubit<State>`, `@Injectable`) | ~160 | AC-1b, AC-2b, AC-3, AC-3b-mobile, AC-6b |
| `lib/ui/inventory/opening_balance_list/` | `opening_balance_list_state.dart` | NEW | `@freezed` union state | ~110 | AC-1b |
| `lib/ui/inventory/opening_balance_list/widgets/` | `opening_balance_card.dart` | NEW | domain card widget | ~140 | AC-2b, AC-4b |
| `lib/ui/inventory/opening_balance_list/widgets/` | `opening_balance_summary_footer.dart` | NEW | sticky footer widget | ~70 | AC-3 |
| `lib/ui/inventory/opening_balance_list/widgets/` | `opening_balance_filter_bottom_sheet.dart` | NEW | bottom-sheet content widget | ~180 | AC-5b, AC-5c |
| `lib/ui/inventory/opening_balance_list/widgets/` | `opening_balance_filter_cubit.dart` + `opening_balance_filter_state.dart` | NEW | Cubit + `@freezed` state | ~150 | AC-5b, AC-5c |
| `lib/ui/inventory/opening_balance_search/` | `opening_balance_search_page.dart` | NEW | Page (`@RoutePage`, StatelessWidget) | ~160 | AC-4b |
| `lib/ui/inventory/opening_balance_search/` | `opening_balance_search_cubit.dart` + `opening_balance_search_state.dart` | NEW | Cubit + `@freezed` state | ~130 | AC-4b |
| `lib/core/repositories/inventory/` | `opening_balance_repository.dart` | NEW | `@LazySingleton(as: OpeningBalanceRepository)`, `GraphQLService` injected | ~90 | AC-1b, AC-2b, AC-3, AC-4b, AC-6b |
| `lib/core/repositories/inventory/` | `warehouse_repository.dart` | NEW (verify reuse trước — có thể đã tồn tại từ feature W04 khác) | `@LazySingleton(as: WarehouseRepository)` | ~60 | AC-5c |
| `lib/core/models/inventory/` | `opening_balance_line_model.dart` | NEW | `@freezed` + `@JsonSerializable` | ~70 | AC-2b |
| `lib/core/models/request/inventory/` | `opening_balance_search_request.dart` | NEW | `@freezed` + `@JsonSerializable` | ~50 | AC-4b, AC-5b, AC-6b |
| `lib/core/models/response/inventory/` | `opening_balance_response.dart` | NEW | `@freezed` + `@JsonSerializable` (paged + aggregates) | ~60 | AC-1b, AC-3 |
| `lib/core/router/` | `router.dart` (+ `router.gr.dart` codegen) | MODIFY (add 2 `@RoutePage` route entry) | auto_route 10.1.0+1 | ~20 | AC-1b, AC-4b |
| `lib/l10n/{intl_vi,intl_en}.arb` | — | ADDITIVE | flutter_localizations | ~35 | §11 |
| `test/features/inventory/opening_balance_list/` | `opening_balance_list_test.dart`, `opening_balance_filter_test.dart` | NEW | bloc_test + widget | ~220 | AC-1b, AC-2b, AC-3, AC-5b, AC-5c, AC-6b |
| `test/features/inventory/opening_balance_search/` | `opening_balance_search_test.dart` | NEW | bloc_test + widget | ~120 | AC-4b |
| `integration_test/` | `opening_balance_list_e2e_test.dart` | NEW | patrol / integration_test | ~100 | (smoke) |

## 8. Implementation sequence DAG (Mobile — S6)

> Mobile S6 song song với FE Web S6 (cùng entry: BFF S5 stable). Mobile S6 exit hand-off Patrol E2E.

```
(← BFF tier S5: SDL + resolver stable — searchOpeningBalances, searchWarehouses)

S6  Mobile UI wire (Flutter)
    Entry: BFF S5 SDL stable + Figma confirmed (21290:52697/52992/53004/54167/54179) + Inventory:InventoryV2 flag seed
    Exit: Patrol E2E happy path green (list + search + filter + infinite-scroll)
    └─► (hand-off QA mobile-e2e)
```

| Step | Hành động | Layer | Entry | Exit | Depends |
|---|---|---|---|---|---|
| S6 | Widgets (list/search/filter) + cubit + repository + i18n | features + router + i18n | BFF S5 stable | Patrol E2E green | BFF S5 |

## 9. Business Rules to enforce (Mobile — UI hint + offline secondary)

> Mobile KHÔNG enforce business validation primary. Feature read-only nên hầu hết BR chỉ có ý nghĩa passive-display/consume.

| BR ID | Severity | UI behavior | Where (file path) | Touchpoint AC | Notes |
|---|---|---|---|---|---|
| `BR-OB-001` | CORNERSTONE | passive display — render đúng cấu trúc dòng OB (ngày/kho/mã/ĐVT/SL/giá trị) theo field mapping | `opening_balance_card.dart` | AC-2b | Data integrity enforce ở BE; mobile chỉ hiển thị đúng |
| `BR-OB-014` | CORNERSTONE | tenant isolation tự động qua header interceptor; search/filter delegate hoàn toàn lên server (LIKE keyword + filter Kho/Ngày Import + dòng Tổng) | `opening_balance_repository.dart` / `GraphQLService` interceptor | AC-4b, AC-5b, AC-5c, AC-9 | Mobile không tự implement filter logic — chỉ trigger query đúng input |
| `BR-OB-CMN-001` | NORMAL | **N/A trên mobile** — quy tắc hiển thị "Người import / Ngày import" là web-only column; mobile explicit loại trừ 2 field này (AC-2b) | — | AC-2 [web-only] | Xem `be/`/`fe-web/ FEAT-OB-LIST.md §9` cho enforcement đầy đủ |

> **Primary enforcement** = BE tier (`features/be/FEAT-OB-LIST.md §9`).

## 10. Test scope hand-off (Mobile)

| AC | Test type | Test agent | Notes |
|---|---|---|---|
| AC-1b | Widget test (navigation + AppBar render) | test-mobile-ui | flutter_test + navigation mock |
| AC-2b | Widget test (card field mapping) + golden | test-mobile-ui | mainUnitName fallback mainUnitCode case |
| AC-3 | Widget test (footer aggregate binding) | test-mobile-ui | bloc_test, server aggregates không client-sum |
| AC-3b-mobile | Widget test (empty state — negative CTA check) | test-mobile-ui | assert KHÔNG có nút import render |
| AC-4b | Widget test (debounce + 3-state search) | test-mobile-ui | bloc_test timer/debounce |
| AC-5b | Widget test (bottom-sheet 2-filter, KHÔNG có "Người import") | test-mobile-ui | bloc_test |
| AC-5c | Widget test (dropdown load-more + preserve selection) | test-mobile-ui | bloc_test — page N>0 badge case |
| AC-6b | Widget test (infinite-scroll trigger 75%) | test-mobile-ui | bloc_test scroll simulation |
| AC-9 | Widget test (RBAC dual persona — cả 2 view-only) | test-mobile-ui + test-isolation | dual persona, tenant scope mock |
| (smoke) | Mobile E2E happy path (list → search → filter → paginate) | test-mobile-e2e | Patrol / integration_test |

## 11. i18n & a11y

### 11.1 i18n keys (Flutter — ARB)

| Key | vi | en | AC ref |
|---|---|---|---|
| `ob_list_appbar_title` | "Tồn đầu kỳ" | "Opening Balance" | AC-1b |
| `ob_list_field_warehouse` | "Kho" | "Warehouse" | AC-2b |
| `ob_list_field_as_of_date` | "Tồn đến ngày" | "As of date" | AC-2b |
| `ob_list_field_quantity` | "Số lượng" | "Quantity" | AC-2b |
| `ob_list_field_value` | "Giá trị tồn" | "Value on hand" | AC-2b |
| `ob_list_field_unit` | "ĐVT" | "Unit" | AC-2b |
| `ob_list_summary_total_label` | "Tổng" | "Total" | AC-3 |
| `ob_list_empty_message` | "Chưa có tồn đầu kỳ" | "No opening balance yet" | AC-3b-mobile |
| `ob_search_hint_title` | "Tìm kiếm sản phẩm theo từ khoá" | "Search product by keyword" | AC-4b |
| `ob_search_hint_bullet_code` | "Mã sản phẩm" | "Product code" | AC-4b |
| `ob_search_hint_bullet_name` | "Tên sản phẩm" | "Product name" | AC-4b |
| `ob_search_no_results` | "Không có kết quả phù hợp" | "No matching results" | AC-4b |
| `ob_filter_title` | "Bộ lọc" | "Filter" | AC-5b |
| `ob_filter_date_label` | "Ngày Import" | "Import date" | AC-5b |
| `ob_filter_warehouse_label` | "Kho" | "Warehouse" | AC-5b |
| `ob_filter_warehouse_selected_badge` | "Đang chọn: {name}" | "Selected: {name}" | AC-5c |
| `ob_filter_reset_button` | "Thiết lập lại" | "Reset" | AC-5b |
| `ob_filter_apply_button` | "Áp dụng" | "Apply" | AC-5b |

### 11.2 a11y (Semantics)

| AC | a11y requirement | Notes |
|---|---|---|
| AC-1b | `Semantics(label: "Tồn đầu kỳ")` AppBar title + button semantics search/filter icon | TalkBack/VoiceOver |
| AC-2b | Compound `Semantics(label: ...)` per card (đủ 5 field) | tránh đọc rời rạc từng row |
| AC-3 | `Semantics(liveRegion: true)` cho vùng Tổng | announce on change |
| AC-3b-mobile | `Semantics(label: "Chưa có tồn đầu kỳ")` | empty state |
| AC-4b | `Semantics(textField: true)` search box + `SemanticsService.announce` khi results đổi | live region |
| AC-5b/5c | `Semantics(label: ...)` per filter field + selected badge | contrast WCAG AA |
| AC-6b | Tap target ≥48dp không áp dụng (scroll trigger, không phải tap) | — |

## 12. Cross-tier coordination (Mobile perspective)

| Paired tier | File path | Status | Notes |
|---|---|---|---|
| BE | `Execution/wave-specs/W04/Product/features/be/FEAT-OB-LIST.md` | PENDING (chưa generate trong session này) | BR primary enforcement (`gf-inventory`), contract source cho `searchOpeningBalances` |
| BFF | `Execution/wave-specs/W04/Product/features/bff/FEAT-OB-LIST.md` | PENDING (chưa generate trong session này) | GraphQL ops consumed (§6.1) — `agg-garage-graph` |
| FE Web | `Execution/wave-specs/W04/Product/features/fe-web/FEAT-OB-LIST.md` | PENDING (chưa generate trong session này) | Share feature scope (web full CRUD, mobile view-only) |

**Source ID consistency** (item 18): `source_feat_sha` = `d8c78cc85653e03b1ae870e7cc142718884cd7d91aa45cf5f8cd54ab3f17b5d8` — phải identical với BE/BFF/FE files khi các tier đó được generate.

## 13. References

- **Source**: [`Product/features/FEAT-OB-LIST.md`](../../../../../Product/features/FEAT-OB-LIST.md) v9
- **Paired BE**: [`features/be/FEAT-OB-LIST.md`](../be/FEAT-OB-LIST.md) (PENDING)
- **Paired BFF**: [`features/bff/FEAT-OB-LIST.md`](../bff/FEAT-OB-LIST.md) (PENDING — has_bff_touchpoint=true)
- **UX flow**: [`Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md`](../../../../../Product/ux/UX-FLOW-INVENTORY-OPENING-BALANCE.md)
- **Figma mobile spec**: `Product/ux/figma-mobile/wave04-ob-list.md` (node `21290:52697` canonical + sub-screens)
- **HLD Mobile**: [`Architecture/hld/garage-mobile-HLD.md`](../../../../../Architecture/hld/garage-mobile-HLD.md) §11b.2, §11b.4
- **API (BFF SDL)**: `Architecture/api/agg-garage-graph-graphql.md` v7.50 §3g.1 (mainUnitName enrichment), op #305 (`searchWarehouses`)
- **PKG**: [`PKG-W04-inventory-period-opening-balance.md`](../../../../work-packages/PKG-W04-inventory-period-opening-balance.md)
- **Fan-out map**: [`_routing/FEAT-FAN-OUT-MAP.yaml`](../../../_routing/FEAT-FAN-OUT-MAP.yaml)

## 14. Change Log

| Date | Version | Author | Description |
|---|---|---|---|
| 2026-07-08 | 1 | Delivery Authority + Architecture Authority | Initial Mobile-tier spec cho `FEAT-OB-LIST` W04. Policy v2 "tier-authoritative": §0 audit slim, §1 mục đích nghiệp vụ (identical cross-tier), §2 trách nhiệm Mobile (view-only), §3 Mobile behaviour map cover 19/19 source AC-ID (9 mobile-relevant AC-1b/2b/3/3b-mobile/4b/5b/5c/6b/9 + 10 khai báo N/A web-only), §4 visual + state + native interaction + offline + i18n + a11y + RBAC + BR secondary + perf + error mapping, §5-§11 Mobile-specific (2 pages `OpeningBalanceListPage`/`OpeningBalanceSearchPage`, widget catalog reuse-first per §G.X ground-truth, GraphQL `searchOpeningBalances`+`searchWarehouses`, cross-tier pair). Source FEAT chỉ audit. Paired BE/BFF/FE-web tier files chưa generate trong session này (PENDING §12). |

---

<!-- TEMPLATE Evolution Audit (KHÔNG copy vào instance spec) -->

## Template Change Log

| Date | Template Version | Author | Description |
|---|---|---|---|
| 2026-06-29 | T2 | Delivery Authority (sonndt — in-session post W03 audit) | Pattern align với real Garage mobile codebase (xem template gốc). |
| 2026-XX-XX | T1 | Delivery Authority | Initial template (Policy v2 tier-authoritative). |
